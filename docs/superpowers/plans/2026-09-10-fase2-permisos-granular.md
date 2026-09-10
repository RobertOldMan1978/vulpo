# Fase 2 — El motor de permisos granular (capacidades sobre un ámbito)

> **Sub-skill:** ejecutar con `superpowers:subagent-driven-development` o a mano, tarea por tarea.
> Pasos con checkbox (`- [ ]`). **Nada se commitea hasta la orden 66; el esquema lo re-aplica
> Roberto.** Spec: `docs/superpowers/specs/2026-09-10-multi-tenant-permisos-granular-design.md`.

**Goal:** Reemplazar los chequeos por bandera de rol (`es_admin`/`es_super`/`es_operador`/
`curso_profesores.rol`) por un motor de **capacidades sobre un ámbito** (`permisos_usuario`),
sin que nadie pierda ni gane acceso, y sin que se pueda escalar por RPC.

**Architecture:** Una tabla `permisos_usuario` (grants: quién, qué capacidades, sobre qué nodo del
árbol Sostenedor▸Colegio▸Curso). Tres resolutores (`kimun_prof_puede(cap,curso)`,
`_puede_en_colegio(cap,colegio)`, `_puede_en_sostenedor(cap,sostenedor)`) que suben por el árbol
(curso → su colegio → su sostenedor → plataforma). Los porteros y funciones gateadas pasan a
consultar capacidades. Una función de otorgamiento (`kimun_prof_permisos_fijar`) con no-escalada
airtight. Una migración que convierte las banderas de hoy en grants equivalentes.

**Tech Stack:** PostgreSQL/Supabase (`supabase/schema.sql`); verificación con `scripts/panel-demo.py`
+ `scripts/cdp.mjs` y el control positivo/negativo del RPC (`docs/aplicar-schema.md`).

> **Nota (10/09):** el **reorden del panel en árbol Sostenedor › Colegio › Cursos** y el
> **renombrar/borrar** de sostenedores/colegios se construyeron y publicaron ANTES que este motor
> (Sesión 116), porque entregan la vista que pidió Roberto sin tocar la autorización. Este plan es
> solo el **motor de permisos** (el aislamiento por colegio + los porteros por capacidad), que hoy es
> **invisible con un solo colegio** y se construye cuando llegue el segundo o se quiera el mantenedor
> de casillas (Fase 3). El decidir *cómo un SuperUsuario se ata a su colegio* sin el mantenedor todavía
> (p. ej. un "Dirección/UTP" bajo cada colegio en el árbol) es una decisión de UI a resolver al arrancar.

---

## Decisión de transición: LECTURA DUAL (legado + grants), reversible en la Fase 4

⚠️ **El riesgo de esta fase es dejar a alguien afuera durante la transición.** Entre la Fase 2 y la
Fase 4 conviven dos cosas: (a) las banderas/membresías de hoy, que el panel todavía escribe con los
toggles viejos (`super_fijar`/`operador_fijar`/`equipo_asignar`); y (b) los grants nuevos. Para que
nada se rompa, **cada portero nuevo devuelve verdadero si el LEGADO lo concede O si un grant lo
concede** (lectura dual). Con eso:

- Antes de migrar y sin un solo grant, el sistema se comporta **idéntico a hoy** (manda el legado).
- La migración (Task 5) rellena grants equivalentes, así que la **foto de acceso es idéntica** por
  las dos vías a la vez.
- La Fase 3 (mantenedor) escribe grants; los toggles viejos siguen ahí por si acaso.
- La **Fase 4 (cutover)** borra la mitad legada de cada portero y los toggles viejos. Recién ahí el
  grant es la única fuente de verdad.

`es_admin` **nunca** entra a la lectura dual como algo revocable: sigue siendo el atajo que salta
todo (`es_admin? → sí`) y se escribe solo por SQL a mano. Es la única bandera que sobrevive a la
Fase 4.

⚠️ **Prerrequisito de ejecución:** la Fase 1 tiene que estar **aplicada y con el piloto migrado**
(cursos con su `colegio_id`), porque un grant de SuperUsuario apunta a un colegio y la migración
(Task 5) necesita saber a qué colegio pertenece cada curso. Sin eso, `es_super` migra a un grant sin
ámbito válido.

---

### Task 1: La tabla `permisos_usuario`

**Files:** Modify `supabase/schema.sql` (junto a las tablas de inquilinos de la Fase 1).

- [ ] **Step 1: Declarar la tabla (idempotente).**

```sql
-- Motor de permisos granular (Sesión 116, Fase 2). Cada fila es un GRANT: un usuario tiene un
-- conjunto de capacidades sobre un nodo del árbol Sostenedor▸Colegio▸Curso. Un usuario puede tener
-- varios grants (Super del colegio A y profe de asignatura en un curso de B). RLS sin políticas.
create table if not exists public.permisos_usuario (
  id           uuid primary key default gen_random_uuid(),
  profesor_id  uuid not null references public.profesores(id) on delete cascade,
  ambito_tipo  text not null check (ambito_tipo in ('plataforma','sostenedor','colegio','curso')),
  ambito_id    uuid,                       -- null solo para 'plataforma'
  capacidades  text[] not null default '{}',
  asignaturas  text[] not null default '{}',   -- solo aplica a ambito_tipo='curso'
  creado       timestamptz not null default now(),
  creado_por   uuid references public.profesores(id) on delete set null,
  -- 'plataforma' no lleva ambito_id; el resto sí.
  check ((ambito_tipo = 'plataforma') = (ambito_id is null))
);
create index if not exists idx_permisos_profesor on public.permisos_usuario(profesor_id);
create index if not exists idx_permisos_ambito on public.permisos_usuario(ambito_tipo, ambito_id);
alter table public.permisos_usuario enable row level security;
```

- [ ] **Step 2: Verificar (Roberto re-aplica).** `select count(*) from public.permisos_usuario;` → 0
  sin error. Sin cambio de firma en funciones existentes todavía.

---

### Task 2: Los resolutores de capacidad (con lectura dual del legado)

**Files:** Modify `supabase/schema.sql` (después de las tablas, antes de los porteros que los usan).

- [ ] **Step 1: Helper de cobertura de un grant sobre un curso.** Un grant cubre un curso si su
  ámbito es plataforma, o el sostenedor del colegio del curso, o el colegio del curso, o el curso
  mismo. Se resuelve una vez por consulta:

```sql
-- ¿Tengo la capacidad `cap` sobre `p_curso`, por un GRANT que cubra ese curso? (sin legado)
create or replace function public.kimun_prof_puede_grant(p_cap text, p_curso uuid)
returns boolean language sql security definer stable set search_path=public as $$
  select exists(
    select 1
    from public.permisos_usuario g
    left join public.cursos c   on c.id = p_curso
    left join public.colegios co on co.id = c.colegio_id
    where g.profesor_id = auth.uid()
      and p_cap = any(g.capacidades)
      and (
           g.ambito_tipo = 'plataforma'
        or (g.ambito_tipo = 'sostenedor' and g.ambito_id = co.sostenedor_id)
        or (g.ambito_tipo = 'colegio'    and g.ambito_id = c.colegio_id)
        or (g.ambito_tipo = 'curso'      and g.ambito_id = p_curso)
      ));
$$;
```

- [ ] **Step 2: El portero público de capacidad sobre curso — LECTURA DUAL.** Verdadero si soy
  admin, si un grant lo concede, o si el LEGADO lo concedía (la equivalencia legado→capacidad va en
  la tabla del comentario; ver Task 3 para el mapeo completo). Ejemplo para la capacidad genérica de
  "entrar al curso":

```sql
-- ¿Puedo `cap` en `p_curso`? Admin salta todo; luego un grant; luego el legado (se retira en la
-- Fase 4). El legado que aplica depende de la capacidad —lo resuelve kimun_prof_legado_cubre—.
create or replace function public.kimun_prof_puede(p_cap text, p_curso uuid)
returns boolean language sql security definer stable set search_path=public as $$
  select public.kimun_prof_es_admin_raw()
      or public.kimun_prof_puede_grant(p_cap, p_curso)
      or public.kimun_prof_legado_cubre(p_cap, p_curso);
$$;
```

- [ ] **Step 3: `kimun_prof_es_admin_raw()`** — el atajo del dueño, aislado en una función para no
  repetir el `select es_admin` por todos lados:

```sql
create or replace function public.kimun_prof_es_admin_raw()
returns boolean language sql security definer stable set search_path=public as $$
  select exists(select 1 from public.profesores pr where pr.id = auth.uid() and pr.es_admin);
$$;
```

- [ ] **Step 4: `kimun_prof_legado_cubre(cap, curso)`** — la mitad legada de la lectura dual, que la
  Fase 4 borrará entera. Traduce las banderas/membresías de hoy a las capacidades que concedían:

```sql
-- LEGADO (se retira en la Fase 4). Reproduce EXACTO lo que hoy concede cada bandera/membresía, para
-- que la foto de acceso sea idéntica durante la transición aunque todavía no haya grants.
create or replace function public.kimun_prof_legado_cubre(p_cap text, p_curso uuid)
returns boolean language sql security definer stable set search_path=public as $$
  select
    -- Admin/Super/Operador conceden hoy TODO lo operativo (eran el tier admin_colegio y es_mio).
    exists(select 1 from public.profesores pr
           where pr.id = auth.uid() and (pr.es_super or pr.es_operador))
    -- Jefe del curso: todo lo del curso.
    or exists(select 1 from public.curso_profesores cp
              where cp.curso_id = p_curso and cp.profesor_id = auth.uid() and cp.rol = 'jefe')
    -- Profe de asignatura: solo las capacidades de seguimiento (ver §2.1 del spec); las
    -- destructivas del curso NO. Se acota por capacidad.
    or (p_cap in ('avance.ver','plan.fijar','refuerzo.gestionar')
        and exists(select 1 from public.curso_profesores cp
                   where cp.curso_id = p_curso and cp.profesor_id = auth.uid()
                     and coalesce(array_length(cp.asignaturas,1),0) >= 1));
$$;
```

- [ ] **Step 5: Las variantes sin curso** para lo de nivel superior (crear curso, autorizar, pulso),
  que hoy gobierna `admin_colegio`:

```sql
-- ¿Puedo `cap` en el ámbito de un COLEGIO? (grant sobre ese colegio, su sostenedor o plataforma).
create or replace function public.kimun_prof_puede_en_colegio(p_cap text, p_colegio uuid)
returns boolean language sql security definer stable set search_path=public as $$
  select public.kimun_prof_es_admin_raw()
      or exists(select 1 from public.permisos_usuario g
                left join public.colegios co on co.id = p_colegio
                where g.profesor_id = auth.uid() and p_cap = any(g.capacidades)
                  and (g.ambito_tipo='plataforma'
                    or (g.ambito_tipo='sostenedor' and g.ambito_id = co.sostenedor_id)
                    or (g.ambito_tipo='colegio'    and g.ambito_id = p_colegio)))
      -- Legado: Super/Operador administraban el colegio (se retira en la Fase 4).
      or exists(select 1 from public.profesores pr
                where pr.id = auth.uid() and (pr.es_super or pr.es_operador));
$$;

-- ¿Puedo `cap` en el ámbito de un SOSTENEDOR? (grant sobre él o plataforma).
create or replace function public.kimun_prof_puede_en_sostenedor(p_cap text, p_sostenedor uuid)
returns boolean language sql security definer stable set search_path=public as $$
  select public.kimun_prof_es_admin_raw()
      or exists(select 1 from public.permisos_usuario g
                where g.profesor_id = auth.uid() and p_cap = any(g.capacidades)
                  and (g.ambito_tipo='plataforma'
                    or (g.ambito_tipo='sostenedor' and g.ambito_id = p_sostenedor)))
      or exists(select 1 from public.profesores pr
                where pr.id = auth.uid() and (pr.es_super or pr.es_operador));
$$;
```

- [ ] **Step 6: Grants** de las funciones nuevas al bloque `grant ... to anon, authenticated` (todas
  `create or replace`, sin cambio de firma).
- [ ] **Step 7: Verificar (Roberto re-aplica).** Control positivo/negativo por RPC: cada función
  nueva desde sesión anónima → **400 `no_autorizado`** (si lleva portero) o responde sin fuga; una
  inventada → **404 `PGRST202`**. Aún no cambia el comportamiento del panel (nadie las llama todavía).

---

### Task 3: Rewire de los porteros y las funciones gateadas

**Files:** Modify `supabase/schema.sql` (los cuatro porteros + las funciones con guard inline).

El contrato es este mapeo (capacidad ← función/portero). Cada portero se redefine para **delegar en
la capacidad**, conservando la lectura dual (que ya vive dentro de `kimun_prof_puede` vía
`legado_cubre`):

| Portero / función | Capacidad que exige | Ámbito |
|---|---|---|
| `kimun_prof_es_mio(curso)` (destructivo: alumnos, XP, reiniciar, quitar) | `alumno.gestionar` | curso |
| `kimun_prof_acceso(curso)` (entrar / ver avance) | `avance.ver` | curso |
| `kimun_prof_asignaturas(curso)` | (deriva del grant que cubre; ver Step 2) | curso |
| `kimun_prof_admin_colegio()` (usado por crear curso, autorizar, pulso, equipo) | según la acción, ver abajo | colegio/plataforma |

⚠️ **`admin_colegio` es demasiado grueso para una sola capacidad.** Hoy gobierna cosas distintas;
en el modelo granular cada una exige la suya. La función `kimun_prof_admin_colegio()` **se conserva
como "¿administra ALGÚN colegio?"** (para pintar el título "Todos los cursos" y la existencia del
bloque Administración), pero **cada acción concreta pasa a exigir su capacidad**:

| Función | Capacidad | Resolutor |
|---|---|---|
| `kimun_prof_curso_crear` | `curso.crear` | `puede_en_colegio` (o plataforma) |
| `kimun_prof_curso_quitar` | `curso.borrar` | `puede_en_colegio` sobre el colegio del curso |
| `kimun_prof_curso_nivel` | `curso.nivel` | ídem |
| `kimun_prof_autorizar` / `_quitar` / `_profesores` | `profesor.autorizar` | `puede_en_colegio`/plataforma |
| `kimun_prof_pulso` / `_resumen` | `pulso.ver` | plataforma o por colegio |
| `kimun_prof_equipo_asignar` (rol jefe) | `equipo.jefe` | colegio del curso |
| `kimun_prof_equipo_asignar` (asignatura) | `equipo.asignatura` | curso |
| `kimun_prof_refuerzo_lanzar` / `_cerrar` | `refuerzo.gestionar` | curso (+ asignatura) |
| `kimun_prof_plan_fijar` / `_quitar` | `plan.fijar` | curso |
| `kimun_prof_plan_historial` | `plan.historial` | curso/colegio |
| `kimun_prof_dominio_reiniciar` | `dominio.reiniciar` | curso |
| `kimun_prof_inscripcion_crear` | `inscripcion.crear` | curso |
| `kimun_prof_limpiar_pruebas` | `perfiles.limpiar` | plataforma |
| `kimun_prof_curso_colegio_fijar` / `_sostenedor_crear` / `_colegio_crear` | `curso.crear` (tenencia) | plataforma/sostenedor |

- [ ] **Step 1: Redefinir `kimun_prof_es_mio` y `kimun_prof_acceso`** para delegar en
  `kimun_prof_puede('alumno.gestionar',curso)` y `kimun_prof_puede('avance.ver',curso)`
  respectivamente. Como `puede` ya trae la lectura dual, el comportamiento de hoy queda intacto.
- [ ] **Step 2: `kimun_prof_asignaturas(curso)`** pasa a unir las asignaturas de los grants que
  cubren el curso: un grant plataforma/colegio/sostenedor con `avance.ver`, o un grant de curso con
  rol jefe → **todas** (`kimun_asignaturas_todas()`); un grant de curso con `asignaturas` → esa
  lista; más la lectura dual del legado (Jefe → todas, asignatura → sus materias). Devuelve la unión.
- [ ] **Step 3: Cada función de la segunda tabla** cambia su guard `if not kimun_prof_admin_colegio()`
  (o `es_mio`) por `if not kimun_prof_puede(<cap>, <curso>)` / `_puede_en_colegio(<cap>,<colegio>)`.
  Se hace una por una, con el `<cap>` de la tabla. **No se colapsan varias en una:** el punto de la
  fase es la granularidad.
- [ ] **Step 4: Verificar** con `panel-demo.py` por rango + control RPC: cada rol ve y puede
  exactamente lo de hoy (foto de acceso, Task 7). Sin regresión.

---

### Task 4: El otorgamiento (backend del mantenedor) con no-escalada airtight

**Files:** Modify `supabase/schema.sql`.

- [ ] **Step 1: `kimun_prof_permisos_ver(p_correo text)`** — lista los grants de un usuario. Portero:
  `permisos.gestionar` sobre **algún** ámbito, más el filtro de que solo se ven grants dentro del
  ámbito que el que llama cubre.
- [ ] **Step 2: `kimun_prof_permisos_fijar(p_correo, p_ambito_tipo, p_ambito_id, p_capacidades[], p_asignaturas[])`**
  — crea/reemplaza el grant. ⚠️ **La no-escalada, caso por caso, es el corazón de la fase:**
  - El que llama debe tener `permisos.gestionar` sobre un ámbito que **cubra** `p_ambito_id`.
  - **No puede otorgar una capacidad que él mismo no tenga** sobre ese ámbito (`puede(cap, …)` para
    cada `cap` de `p_capacidades`).
  - **`permisos.gestionar` no se otorga sobre un ámbito superior al del que otorga.**
  - **`es_admin` jamás se toca por acá** (no es una capacidad; se escribe solo por SQL).
  - Nadie se otorga a sí mismo (`p_correo <> yo`) una capacidad que sube su alcance.
- [ ] **Step 3: `kimun_prof_permisos_revocar(p_id uuid)`** — borra un grant, con el mismo cerco de
  cobertura.
- [ ] **Step 4: Verificar** — ver Task 7 (la auditoría de no-escalada es la prueba de esta task).

---

### Task 5: La migración (banderas de hoy → grants), idempotente

**Files:** Modify `supabase/schema.sql` (bloque de migración al final, con guard de una-sola-vez).

- [ ] **Step 1:** Cada `es_operador` → un grant de **plataforma** con el preset Operador.
- [ ] **Step 2:** Cada `es_super` → un grant de **colegio** con el preset SuperUsuario, sobre el
  colegio de sus cursos (en el piloto, el único colegio). ⚠️ Si un curso no tiene `colegio_id`, el
  grant no se puede fijar: por eso el prerrequisito de migrar el piloto en la Fase 1.
- [ ] **Step 3:** Cada fila de `curso_profesores` (jefe/asignatura) → un grant de **curso** con el
  preset y las materias correspondientes.
- [ ] **Step 4:** `es_admin` queda igual (no migra: es el atajo del dueño).
- [ ] **Step 5:** Idempotente — un `where not exists` sobre un grant equivalente, para que re-aplicar
  el esquema no duplique grants.
- [ ] **Step 6: Verificar** con la foto de acceso (Task 7): cada persona ve lo mismo antes y después.

---

### Task 6: Los presets (plantillas de capacidades)

**Files:** Modify `supabase/schema.sql` (helper) o documentar en el cliente (Fase 3).

- [ ] **Step 1:** Los presets (Operador, Sostenedor, SuperUsuario, Jefe, Asignatura) son **listas de
  capacidades** (spec §3). Viven como un helper de solo lectura `kimun_prof_preset(nombre) returns
  text[]` que la migración (Task 5) y el mantenedor (Fase 3) usan, para no escribir la lista dos
  veces (lista-paralela). ⚠️ `permisos.gestionar` **no** entra en ningún preset salvo Operador.

---

### Task 7: Auditoría de no-escalada + foto de acceso (la verificación de la fase)

- [ ] **Step 1: Foto de acceso por usuario, ANTES de migrar.** Con `panel-demo.py` y contra
  producción por rango (admin/operador/super/jefe/asignatura): qué cursos ve, qué botones, qué
  asignaturas. Se guarda.
- [ ] **Step 2: Migrar (Task 5) y volver a sacar la foto.** Deben ser **idénticas** — medido, no
  supuesto.
- [ ] **Step 3: Auditoría de no-escalada (estilo Sesión 111), contra producción:**
  - Un usuario con `permisos.gestionar` acotado a un colegio NO puede otorgar sobre otro colegio ni
    sobre su sostenedor → rechazo.
  - Nadie puede otorgarse una capacidad que no tiene → rechazo.
  - `es_admin` intocable por cualquier RPC de permisos → no existe la vía.
  - Cada control con su contrario al lado (400 `no_autorizado` vs 404 `PGRST202`).
- [ ] **Step 4: Regresión** con `cdp.mjs`: el panel se ve y se comporta igual que hoy en los cinco
  rangos; consola limpia; el juego (seis forks) intacto.

---

## Verificación (fin de fase)
- Foto de acceso idéntica antes/después de migrar, por usuario.
- Auditoría de no-escalada: ningún camino de RPC otorga fuera del ámbito ni por encima del nivel;
  `es_admin` intocable.
- Los cinco rangos ven y pueden exactamente lo de hoy (lectura dual).
- Esquema aplicado y verificado (control positivo/negativo) por cada función nueva.

## Fuera de alcance de la Fase 2
- El mantenedor (la pantalla) — Fase 3, sobre el backend de la Task 4.
- Apagar los toggles viejos y la mitad legada de los porteros — Fase 4 (cutover).
- El juego (seis forks) no se toca.
