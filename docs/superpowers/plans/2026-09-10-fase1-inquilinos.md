# Fase 1 — Inquilinos (Sostenedor ▸ Colegio) + migración del piloto

> **Sub-skill:** ejecutar con `superpowers:subagent-driven-development` o a mano, tarea por tarea.
> Los pasos usan checkbox (`- [ ]`). **Nada se commitea hasta la orden 66; el esquema lo re-aplica
> Roberto en Supabase.** Spec: `docs/superpowers/specs/2026-09-10-multi-tenant-permisos-granular-design.md`.

**Goal:** Agregar las entidades Sostenedor y Colegio al modelo, sin tocar todavía los permisos: el
panel gana el dato de colegio y una forma de crear/asignar, pero **se comporta exactamente igual**
que hoy para quien ya tiene acceso.

**Architecture:** Dos tablas nuevas (`sostenedores`, `colegios`) y una columna `cursos.colegio_id`
**nullable**. Funciones `SECURITY DEFINER` para listar/crear/asignar, gateadas por el portero de
administración de hoy (`kimun_prof_admin_colegio`). Una sección nueva en `profesor.html` para que
Admin/Operador creen el sostenedor/colegio del piloto y le asignen los cursos actuales. RLS activo
sin políticas de lectura, como todo el esquema.

**Tech Stack:** PostgreSQL/Supabase (`supabase/schema.sql`), HTML+JS del panel (`profesor.html`),
verificación con `scripts/panel-demo.py` + `scripts/cdp.mjs` y el control positivo/negativo del RPC.

**Nota de arranque:** las ediciones del rol Operador de la primera parte de la Sesión 116 (bandera
`es_operador`, toggle) quedan **sin tocar** en esta fase — son aditivas, no chocan con las tablas
nuevas, y la Fase 2 las absorbe en el motor granular. No hay que revertirlas para la Fase 1.

---

### Task 1: Tablas `sostenedores` y `colegios` + `cursos.colegio_id`

**Files:**
- Modify: `supabase/schema.sql` (junto a la definición de `cursos`, ~L42-47, y sus `alter` de columnas)

- [ ] **Step 1: Declarar las tablas (idempotente).** Después del bloque de `cursos`:

```sql
-- Inquilinos (Sesión 116): Sostenedor ▸ Colegio ▸ Curso. El sostenedor es el cliente
-- comercial; el colegio, la escuela con su dirección/UTP. Ambos con RLS y sin políticas
-- de lectura: se consultan por funciones, como el resto.
create table if not exists public.sostenedores (
  id     uuid primary key default gen_random_uuid(),
  nombre text not null,
  creado timestamptz not null default now()
);
create table if not exists public.colegios (
  id            uuid primary key default gen_random_uuid(),
  sostenedor_id uuid not null references public.sostenedores(id) on delete cascade,
  nombre        text not null,
  creado        timestamptz not null default now()
);
create index if not exists idx_colegios_sostenedor on public.colegios(sostenedor_id);
alter table public.sostenedores enable row level security;
alter table public.colegios enable row level security;
```

- [ ] **Step 2: Agregar `cursos.colegio_id` nullable.** Junto a los otros `alter` de `cursos`:

```sql
-- Nullable a propósito: durante la migración un curso puede no tener colegio todavía, y el
-- panel lo tolera. El cutover (Fase 4) exigirá que todos lo tengan.
alter table public.cursos add column if not exists colegio_id uuid references public.colegios(id) on delete set null;
create index if not exists idx_cursos_colegio on public.cursos(colegio_id);
```

- [ ] **Step 3: Verificar (Roberto re-aplica).** Tras pegar el esquema, en el SQL Editor:
  `select count(*) from public.sostenedores;` (debe dar 0, sin error) y
  `select column_name from information_schema.columns where table_name='cursos' and column_name='colegio_id';`
  (debe devolver una fila). Sin cambio de firma en ninguna función existente → seguro en cualquier orden.

---

### Task 2: Funciones para listar, crear y asignar

**Files:**
- Modify: `supabase/schema.sql` (nuevas funciones + al bloque `grant ... to anon, authenticated`)

- [ ] **Step 1: Listar.** `kimun_prof_sostenedores()` y `kimun_prof_colegios(p_sostenedor uuid)`
  devuelven id+nombre (+ conteo de colegios/cursos para el panel). Portero: `kimun_prof_admin_colegio()`
  (hoy Admin/Super/Operador). Ejemplo del cuerpo de la primera:

```sql
create or replace function public.kimun_prof_sostenedores()
returns table(id uuid, nombre text, colegios int) language plpgsql security definer set search_path=public as $$
declare yo public.profesores; begin
  select * into yo from public.profesores where id = auth.uid();
  if yo.id is null or not public.kimun_prof_admin_colegio() then raise exception 'no_autorizado'; end if;
  return query select s.id, s.nombre,
    (select count(*)::int from public.colegios c where c.sostenedor_id = s.id)
    from public.sostenedores s order by s.nombre;
end $$;
```

- [ ] **Step 2: Crear.** `kimun_prof_sostenedor_crear(p_nombre text)` y
  `kimun_prof_colegio_crear(p_sostenedor uuid, p_nombre text)`. Portero `kimun_prof_admin_colegio()`.
  Validan nombre no vacío; devuelven el id creado.

- [ ] **Step 3: Asignar curso a colegio.** `kimun_prof_curso_colegio_fijar(p_curso_codigo text, p_colegio uuid)`.
  Portero `kimun_prof_admin_colegio()`. Resuelve el curso por su código; hace
  `update public.cursos set colegio_id = p_colegio where id = cid`.

- [ ] **Step 4: Grants.** Agregar las cuatro funciones al bloque `grant ... to anon, authenticated`.
  Ninguna cambia una firma existente → `create or replace`, sin `drop`.

- [ ] **Step 5: Verificar contra producción (Roberto re-aplica).** Control positivo/negativo por el
  patrón de `docs/aplicar-schema.md`: sesión anónima → `kimun_prof_sostenedores` da **400
  `no_autorizado`**; una función inventada da **404 `PGRST202`**. Con datos: crear un sostenedor y un
  colegio, listar, y asignar un curso, todo por RPC desde la consola del panel con sesión de Admin.

---

### Task 3: Sección del panel "Sostenedores y colegios"

**Files:**
- Modify: `profesor.html` (nueva sección en el bloque de Administración; cada `curso` muestra su colegio)

- [ ] **Step 1: Sección nueva**, visible para `window.ESADMINCOLEGIO` (Admin/Super/Operador), dentro
  de ⚙️ Administración: crear sostenedor (input + botón), y dentro de cada sostenedor, crear colegio
  y ver sus colegios. IDs y estilo como el resto del panel (chips, `btn sec`).

- [ ] **Step 2: Asignar el curso a un colegio.** En la tarjeta de cada curso, un pequeño selector
  "Colegio: ‹select de colegios›" que llama `kimun_prof_curso_colegio_fijar`. Muestra el colegio
  actual (o "Sin colegio") sin romper nada: el resto de la tarjeta se comporta igual.

- [ ] **Step 3: Verificar mirando** con `scripts/panel-demo.py` + `scripts/cdp.mjs` a escritorio y
  375 px: la sección se ve y no desborda; un curso sin colegio dice "Sin colegio" y funciona igual;
  crear/asignar refresca bien. Y que **el resto del panel no cambió** (avance, alumnos, equipo, pulso).
  Actualizar el stub del doble (`panel-demo.py`) con `kimun_prof_sostenedores`/`_colegios`.

---

### Task 4: Migración del piloto (la hace Roberto por el panel)

- [ ] **Step 1:** Con la Fase 1 desplegada, Roberto crea desde el panel el sostenedor
  (San Francisco de Sales) y su colegio, y asigna **todos los cursos actuales** a ese colegio.
- [ ] **Step 2: Foto de acceso — verificación de que nadie perdió nada.** Como la Fase 1 **no toca
  los permisos** (los porteros siguen ignorando `colegio_id`), el acceso es idéntico por definición;
  la foto de acceso formal se toma recién en la Fase 2, cuando los porteros empiezan a mirar el
  ámbito. En la Fase 1 basta comprobar que cada curso quedó con su colegio y el panel se ve igual.

---

## Verificación (fin de fase)

- Esquema aplicado y verificado (Task 1.3, 2.5), sin cambio de firma en funciones existentes.
- El panel crea sostenedor/colegio y asigna cursos; un curso sin colegio no rompe nada.
- **No-regresión:** avance, alumnos, equipo, pulso, planificación, ranking, el juego y el informe del
  apoderado se comportan igual. `scripts/cdp.mjs` con el doble, a escritorio y móvil, consola limpia.
- Los seis forks del juego **no se tocan** en esta fase.

## Fuera de alcance de la Fase 1

- Cualquier cambio a los porteros / a quién ve qué (eso es la Fase 2).
- El motor de permisos granular, `permisos_usuario`, los presets (Fase 2).
- El mantenedor de usuarios (Fase 3).
- Apagar los toggles viejos (Fase 4).
