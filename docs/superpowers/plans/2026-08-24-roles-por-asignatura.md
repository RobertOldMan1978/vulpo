# Roles por asignatura en un curso — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: usa superpowers:subagent-driven-development (recomendado) o superpowers:executing-plans para ejecutar este plan tarea por tarea. Los pasos usan casillas (`- [ ]`) para seguimiento.

**Goal:** Que un curso pase de tener un solo profesor a un equipo (Profesor Jefe + profes de una o varias asignaturas), con permisos por asignatura, ranking por asignatura y mapa OA→asignatura, sin perder nada de lo que hoy funciona.

**Architecture:** Una tabla de membresías `curso_profesores(curso, profesor, rol, asignaturas[])` reemplaza el modelo de dueño único (`cursos.profesor_id` queda deprecada, no se borra). Una función única `kimun_oa_asignatura(oa)` traduce cualquier objetivo a su asignatura. El portero `kimun_prof_es_mio` pasa a significar "jefe o admin" (lo destructivo), y se agregan `kimun_prof_acceso` (¿puede entrar?) y `kimun_prof_asignaturas` (¿sobre qué actúa?). Las funciones de lectura filtran por las asignaturas del profesor; las de refuerzo validan la asignatura. `profesor.html` gana un bloque "Equipo del curso" y un bloque de ranking, canoniza la asignatura al código de 4 letras (lo que de paso arregla dos bugs), y oculta lo destructivo a los profes de asignatura.

**Tech Stack:** PostgreSQL/PL-pgSQL sobre Supabase (`supabase/schema.sql`, `SECURITY DEFINER`, RLS sin políticas); HTML/JS vanilla en `profesor.html` (cliente `supabase-js`, `SB.rpc`).

**Nota sobre verificación:** este proyecto NO tiene suite de tests automatizados. La verificación es (a) en el **SQL Editor de Supabase** para el backend y (b) en el **navegador** para el panel, con un backend simulado (stub de `SB.rpc`) cuando no se puede iniciar sesión de profesor desde el entorno de desarrollo, exactamente como en las Sesiones 26–28. Cada tarea trae sus pasos de verificación concretos en vez de un `pytest`.

**Fuente de verdad del diseño:** `docs/superpowers/specs/2026-08-23-roles-por-asignatura-design.md`. Este plan lo implementa completo.

---

## Estructura de archivos

- **`supabase/schema.sql`** (modificar) — todo el backend. Se agrega la tabla `curso_profesores`, la función `kimun_oa_asignatura`, los dos porteros nuevos, la gestión de equipo y el ranking; se ajustan las funciones de lectura y refuerzo existentes; se agregan las migraciones de datos; se actualizan los `grant`/`revoke`. **El archivo se re-pega completo en el SQL Editor y debe ser idempotente** (re-pegarlo no duplica ni rompe).
- **`profesor.html`** (modificar) — el panel. Canoniza la asignatura al código, arregla los dos bugs de refuerzo, oculta lo destructivo a los profes de asignatura, y agrega los bloques "Equipo del curso" y "Ranking por asignatura".
- **`index.html`** — **casi no se toca.** El juego no participa de los roles del profesor, PERO sí lee `desafios.asignatura` para el banner y el título del quiz de refuerzo, y para elegir el banco de preguntas (`contenidoDeAsignatura`, que busca por NOMBRE de asignatura). Al canonizar `desafios.asignatura` al código (Task 1), el juego recibiría `"HI08"` en vez de `"Historia"` y el refuerzo quedaría **injugable** (banco no encontrado → "No se pudo cargar el desafío"). **Corrección aplicada (descubierta en revisión):** en `index.html` se agregó `ASIG_DESAFIO_NOMBRE` (código→nombre) y `asigDesafioNombre()`, usados en `revisarDesafio` (banner), `jugarDesafio` (título) y `construirPreguntasDesafio` (banco). Tolera también el nombre antiguo. Verificado en el navegador: las cuatro asignaturas resuelven a su banco (incl. Matemática → `matematicas-8basico`) y un desafío de Matemática arma 12 preguntas reales.
- **`CLAUDE.md`** (modificar, al final) — registrar la Sesión y el nuevo modelo de permisos en la Bitácora y en la sección de Backend.

**Orden de ejecución:** primero todo el backend (Fase 1), porque el panel llama a esas funciones; luego el panel (Fase 2); al final la verificación integral (Fase 3). Un commit por tarea.

---

## Convenciones que este plan fija (leer antes de empezar)

1. **Clave canónica de asignatura = código de 4 caracteres:** `HI08` Historia, `CN08` Ciencias, `MA08` Matemática, `LE08` Lenguaje. Nunca el nombre visible en datos ni en parámetros.
2. **`kimun_prof_es_mio(curso)` cambia de significado:** hoy es "admin o dueño"; pasa a ser **"admin o Profesor Jefe"**. Todas las funciones destructivas ya lo llaman, así que heredan la nueva semántica sin tocar su cuerpo. Es intencional y se documenta en el comentario de la función.
3. **`kimun_prof_acceso(curso)`** = admin, o jefe, o profe con ≥1 asignatura en ese curso. Es el portero de **entrada/lectura**.
4. **`kimun_prof_asignaturas(curso)`** = admin y jefe reciben las cuatro; un profe de asignatura recibe las suyas; una membresía sin asignaturas recibe `{}` (y por eso `acceso` le da falso).
5. **Idempotencia:** cada `create table` con `if not exists`, cada índice con `if not exists`, cada migración con guardas (`on conflict do nothing`, `where` acotado). Las funciones `returns table` que cambian de columnas llevan su `drop function if exists` antes del `create` (el guardia que ya usa `kimun_prof_listar`).

---

# FASE 1 · Backend (`supabase/schema.sql`)

### Task 1: Tabla `curso_profesores` + migración de datos

**Files:**
- Modify: `supabase/schema.sql` — insertar después del bloque de `desafio_resultados` y `cursos.profesor_id` (tras la línea 152, `create index if not exists idx_cursos_profesor …`).

- [ ] **Step 1: Agregar la tabla, el índice único, la migración y la normalización**

Insertar este bloque justo después de `create index if not exists idx_cursos_profesor on public.cursos(profesor_id);` (línea 152):

```sql
-- ------------------------------------------------------------
-- Roles por asignatura (Sesión 37). Un curso pasa de tener un dueño único a un
-- equipo: un Profesor Jefe (ve todo) y profes de asignatura (ven lo suyo). El
-- alcance es por (curso, profesor), no por profesor: un docente puede hacer
-- Ciencias en 8°A e Historia en 8°B. Por eso es una tabla de membresías y no
-- columnas en "profesores".
-- ------------------------------------------------------------
create table if not exists public.curso_profesores (
  curso_id    uuid not null references public.cursos(id)     on delete cascade,
  profesor_id uuid not null references public.profesores(id) on delete cascade,
  rol         text not null default 'asignatura',   -- 'jefe' | 'asignatura'
  asignaturas text[] not null default '{}',         -- {'MA08','CN08'}; el jefe lo ignora
  creado      timestamptz not null default now(),
  primary key (curso_id, profesor_id)
);
-- Un solo Profesor Jefe por curso, garantizado en la base (mismo patrón que
-- idx_desafio_activo_curso). El jefe alcanza todas las asignaturas por definición,
-- así que su columna asignaturas se guarda vacía.
create unique index if not exists idx_curso_jefe_unico
  on public.curso_profesores(curso_id) where rol = 'jefe';

alter table public.curso_profesores enable row level security;
-- Sin políticas, como el resto del esquema: nada se lee directo.

-- Migración: cada dueño actual (cursos.profesor_id no nulo) se vuelve Profesor
-- Jefe de su curso. Idempotente: si ya existe la membresía no la duplica ni la
-- pisa. Nadie pierde acceso.
insert into public.curso_profesores(curso_id, profesor_id, rol, asignaturas)
select c.id, c.profesor_id, 'jefe', '{}'
from public.cursos c
where c.profesor_id is not null
on conflict (curso_id, profesor_id) do nothing;

-- Normaliza desafios.asignatura de nombre visible al código canónico. Los
-- desafíos históricos se guardaron con "Historia"/"Ciencias"/"Lenguaje"
-- (nunca Matemática, por el bug). Idempotente: solo toca las filas con el
-- nombre viejo; re-ejecutar no cambia nada.
update public.desafios set asignatura = case asignatura
    when 'Historia'    then 'HI08'
    when 'Ciencias'    then 'CN08'
    when 'Lenguaje'    then 'LE08'
    when 'Matemáticas' then 'MA08'
    when 'Matematicas' then 'MA08'
    else asignatura end
where asignatura in ('Historia','Ciencias','Lenguaje','Matemáticas','Matematicas');
```

**Por qué `cursos.profesor_id` NO se borra:** borrar una columna es irreversible y el `schema.sql` se re-pega completo en cada migración manual. Queda deprecada (no se lee ni se escribe), igual que la tabla `config`. La migración de arriba la usa como semilla una vez; a partir de ahí manda `curso_profesores`.

- [ ] **Step 2: Verificar en el SQL Editor de Supabase**

Pegar el `schema.sql` completo y luego ejecutar:

```sql
-- La tabla y el índice existen
select count(*) from public.curso_profesores;                    -- 0 o más, sin error
select indexname from pg_indexes where indexname = 'idx_curso_jefe_unico';  -- 1 fila

-- Cada curso con dueño quedó con su jefe
select (select count(*) from public.cursos where profesor_id is not null) as con_dueno,
       (select count(*) from public.curso_profesores where rol='jefe')    as jefes;
-- con_dueno == jefes

-- El índice único impide dos jefes en un curso: esto DEBE fallar con unique_violation
-- (probar solo si hay al menos un curso con jefe; luego hacer rollback)
-- begin;
--   insert into public.curso_profesores(curso_id, profesor_id, rol)
--   select curso_id, (select id from public.profesores limit 1), 'jefe'
--   from public.curso_profesores where rol='jefe' limit 1;
-- rollback;
```
Expected: la tabla y el índice existen; `con_dueno == jefes`; el `insert` de prueba (si se corre) falla con `duplicate key value violates unique constraint "idx_curso_jefe_unico"`.

- [ ] **Step 3: Verificar idempotencia**

Re-pegar el `schema.sql` completo una segunda vez. Expected: sin errores; `select count(*) from public.curso_profesores where rol='jefe'` devuelve el mismo número que antes (la migración no duplicó).

- [ ] **Step 4: Commit**

```bash
git add supabase/schema.sql
git commit -m "Roles por asignatura: tabla curso_profesores + migracion (Fase 1)"
```

---

### Task 2: Función `kimun_oa_asignatura`

**Files:**
- Modify: `supabase/schema.sql` — insertar junto a los otros helpers, después de `kimun_gen_codigo_alumno` (tras la línea 217) o justo antes del bloque de porteros del profesor. Elegir un lugar y ser consistente; este plan asume **después de `kimun_yo()`** (tras la línea 223), porque es un helper de lectura del mismo tenor.

- [ ] **Step 1: Agregar la función**

```sql
-- Traduce cualquier objetivo de aprendizaje a su asignatura (código de 4 letras).
-- Es el ÚNICO lugar del sistema que conoce esta regla. immutable: el mismo OA
-- siempre cae en la misma asignatura, así el planificador puede cachearla.
-- Efecto lateral bienvenido: Vocabulario (VOC-*) y Lectura (VOC-LECT, AF-T*) hoy
-- no calzan con los cuatro prefijos y por eso no aparecen en el filtro del panel;
-- esta función los reparte por materia y los hace visibles.
create or replace function public.kimun_oa_asignatura(p_oa text)
returns text language sql immutable as $$
  select case
    when p_oa like 'HI08%' or p_oa = 'VOC-HIST' then 'HI08'
    when p_oa like 'CN08%' or p_oa = 'VOC-CIEN' then 'CN08'
    when p_oa like 'MA08%' or p_oa = 'VOC-MATE' then 'MA08'
    when p_oa like 'LE08%' or p_oa in ('VOC-LENG','VOC-LECT')
         or p_oa like 'AF-T%'                    then 'LE08'
    else null end;
$$;
```

- [ ] **Step 2: Verificar en el SQL Editor**

```sql
select public.kimun_oa_asignatura('HI08 OA 01'),   -- HI08
       public.kimun_oa_asignatura('MA08 OA 12'),   -- MA08
       public.kimun_oa_asignatura('VOC-LECT'),      -- LE08
       public.kimun_oa_asignatura('AF-T3'),         -- LE08
       public.kimun_oa_asignatura('VOC-MATE'),      -- MA08
       public.kimun_oa_asignatura('XX99 OA 01');    -- null
```
Expected: `HI08, MA08, LE08, LE08, MA08, null`.

- [ ] **Step 3: Verificar que cubre los OA reales del banco**

```sql
-- Ningún OA en uso debe quedar sin asignatura (null). Si aparece alguno, hay un
-- prefijo no contemplado y hay que ampliar la función ANTES de seguir.
select distinct oa from public.dominio
where public.kimun_oa_asignatura(oa) is null;
```
Expected: 0 filas. (Si hay filas, revisar el prefijo contra `contenido/*/oa.json` y ampliar el `case` — no continuar hasta que devuelva vacío.)

- [ ] **Step 4: Commit**

```bash
git add supabase/schema.sql
git commit -m "Roles por asignatura: kimun_oa_asignatura (Fase 1)"
```

---

### Task 3: Porteros — redefinir `kimun_prof_es_mio`, agregar `kimun_prof_acceso` y `kimun_prof_asignaturas`

**Files:**
- Modify: `supabase/schema.sql` — reemplazar la definición de `kimun_prof_es_mio` (líneas 498-503) e insertar las dos funciones nuevas inmediatamente después.

- [ ] **Step 1: Reemplazar `kimun_prof_es_mio` (nueva semántica: jefe o admin)**

Reemplazar el bloque actual (498-503) por:

```sql
-- ¿Puedo hacer lo DESTRUCTIVO en este curso? Cambió de significado con los roles
-- por asignatura (Sesión 37): antes era "admin o dueño"; ahora es "admin o
-- Profesor Jefe". Todas las funciones destructivas ya la llaman, así que heredan
-- la nueva regla sin tocar su cuerpo. Los administradores pasan siempre.
create or replace function public.kimun_prof_es_mio(p_curso uuid)
returns boolean language sql security definer stable set search_path=public as $$
  select exists(select 1 from public.profesores pr
                where pr.id = auth.uid() and pr.es_admin)
      or exists(select 1 from public.curso_profesores cp
                where cp.curso_id = p_curso and cp.profesor_id = auth.uid()
                  and cp.rol = 'jefe');
$$;

-- ¿Puedo ENTRAR a este curso (verlo, leer su avance)? Admin, jefe, o profe con al
-- menos una asignatura asignada aquí. Una membresía sin asignaturas ('{}') da
-- falso a propósito: significa "todavía no le asignan materias", y se evita el
-- estado ambiguo de "entra pero no ve nada".
create or replace function public.kimun_prof_acceso(p_curso uuid)
returns boolean language sql security definer stable set search_path=public as $$
  select exists(select 1 from public.profesores pr
                where pr.id = auth.uid() and pr.es_admin)
      or exists(select 1 from public.curso_profesores cp
                where cp.curso_id = p_curso and cp.profesor_id = auth.uid()
                  and (cp.rol = 'jefe' or coalesce(array_length(cp.asignaturas,1),0) >= 1));
$$;

-- ¿Sobre qué asignaturas puedo actuar en este curso? Admin y jefe reciben las
-- cuatro; un profe de asignatura recibe las suyas; sin membresía, vacío.
create or replace function public.kimun_prof_asignaturas(p_curso uuid)
returns text[] language sql security definer stable set search_path=public as $$
  select case
    when exists(select 1 from public.profesores pr
                where pr.id = auth.uid() and pr.es_admin)
      then array['HI08','CN08','MA08','LE08']
    when exists(select 1 from public.curso_profesores cp
                where cp.curso_id = p_curso and cp.profesor_id = auth.uid()
                  and cp.rol = 'jefe')
      then array['HI08','CN08','MA08','LE08']
    else coalesce((select cp.asignaturas from public.curso_profesores cp
                   where cp.curso_id = p_curso and cp.profesor_id = auth.uid()),
                  '{}'::text[])
  end;
$$;
```

- [ ] **Step 2: Revocar de PUBLIC los porteros nuevos**

En el bloque `revoke execute on function … from public;` (líneas 785-789), **agregar** las dos funciones nuevas a la lista (siguen el precedente de `kimun_prof_es_mio`: solo las llaman otras funciones del rol, que corren como su propietario). El bloque queda:

```sql
revoke execute on function
  public.kimun_gen_codigo(),
  public.kimun_gen_codigo_curso(), public.kimun_gen_codigo_alumno(),
  public.kimun_prof_es_mio(uuid),
  public.kimun_prof_acceso(uuid), public.kimun_prof_asignaturas(uuid)
  from public;
```

- [ ] **Step 3: Verificar en el SQL Editor**

Pegar el `schema.sql` completo. Luego, para probar sin sesión de profesor (`auth.uid()` es null en el SQL Editor), verificar que compilan y que sin sesión niegan:

```sql
-- Compilan y, sin sesión, no otorgan nada
select public.kimun_prof_es_mio(gen_random_uuid());        -- false
select public.kimun_prof_acceso(gen_random_uuid());        -- false
select public.kimun_prof_asignaturas(gen_random_uuid());   -- {} (arreglo vacío)
```
Expected: `false`, `false`, `{}`. (La prueba con roles reales se hace en la Fase 3 desde el panel, que es donde hay `auth.uid()`.)

- [ ] **Step 4: Commit**

```bash
git add supabase/schema.sql
git commit -m "Roles por asignatura: porteros acceso/asignaturas + es_mio ahora es jefe-o-admin (Fase 1)"
```

---

### Task 4: Funciones de lectura filtran por asignatura

**Files:**
- Modify: `supabase/schema.sql` — `kimun_prof_dominio` (598-617), `kimun_prof_dominio_alumno` (621-633), `kimun_prof_dominio_oa` (660-674), `kimun_prof_participacion` (638-650).

- [ ] **Step 1: `kimun_prof_dominio` — entrar con `acceso`, filtrar OA por mis asignaturas**

Reemplazar el cuerpo (desde `declare cid uuid; begin` hasta el `end $$;`, líneas 602-617) por:

```sql
language plpgsql security definer set search_path=public as $$
declare cid uuid; asigs text[]; begin
  select id into cid from public.cursos where codigo = upper(trim(p_curso_codigo));
  if cid is null or not public.kimun_prof_acceso(cid) then raise exception 'no_autorizado'; end if;
  asigs := public.kimun_prof_asignaturas(cid);
  return query
    select d.oa, sum(d.respondidas), sum(d.correctas), count(distinct d.perfil_id),
           sum(d.resp_1), sum(d.ok_1),
           count(distinct d.perfil_id) filter (where d.resp_1 > 0)
    from public.dominio d
    join public.perfiles p on p.id = d.perfil_id
    where p.curso_id = cid
      -- Solo los objetivos de MIS asignaturas. Un profe de Ciencias no ve Historia.
      and public.kimun_oa_asignatura(d.oa) = any(asigs)
    group by d.oa
    order by (sum(d.ok_1)::numeric / nullif(sum(d.resp_1),0)) asc nulls last, d.oa;
end $$;
```

- [ ] **Step 2: `kimun_prof_dominio_alumno` — igual filtro**

Reemplazar el cuerpo (624-633) por:

```sql
language plpgsql security definer set search_path=public as $$
declare cid uuid; pid uuid; asigs text[]; begin
  select id, curso_id into pid, cid from public.perfiles
   where codigo_acceso = upper(trim(p_codigo_acceso));
  if pid is null or cid is null or not public.kimun_prof_acceso(cid)
    then raise exception 'no_autorizado'; end if;
  asigs := public.kimun_prof_asignaturas(cid);
  return query
    select d.oa, d.respondidas, d.correctas, d.resp_1, d.ok_1 from public.dominio d
    where d.perfil_id = pid
      and public.kimun_oa_asignatura(d.oa) = any(asigs)
    order by (d.ok_1::numeric / nullif(d.resp_1,0)) asc nulls last, d.oa;
end $$;
```

- [ ] **Step 3: `kimun_prof_dominio_oa` — entrar con `acceso`, validar que el OA sea de una asignatura mía**

Reemplazar el cuerpo (663-674) por:

```sql
language plpgsql security definer set search_path=public as $$
declare cid uuid; begin
  select id into cid from public.cursos where codigo = upper(trim(p_curso_codigo));
  if cid is null or not public.kimun_prof_acceso(cid) then raise exception 'no_autorizado'; end if;
  -- El OA pedido debe pertenecer a una asignatura mía; si no, es como pedir un
  -- curso ajeno. Mismo mensaje para no filtrar qué objetivos existen.
  if not (public.kimun_oa_asignatura(p_oa) = any(public.kimun_prof_asignaturas(cid)))
    then raise exception 'no_autorizado'; end if;
  return query
    select p.nombre, p.avatar, coalesce(d.resp_1,0), coalesce(d.ok_1,0)
    from public.perfiles p
    left join public.dominio d on d.perfil_id = p.id and d.oa = p_oa
    where p.curso_id = cid and p.codigo_acceso is not null
    order by p.nombre;
end $$;
```

- [ ] **Step 4: `kimun_prof_participacion` — solo cambia el portero a `acceso`**

La participación la ve todo el equipo (no es dato de otra asignatura). En su cuerpo (641-650) cambiar únicamente la línea del portero:

```sql
  if cid is null or not public.kimun_prof_acceso(cid) then raise exception 'no_autorizado'; end if;
```
(El resto de la función queda idéntico.)

- [ ] **Step 5: Verificar en el SQL Editor**

Pegar el `schema.sql` completo. Sin sesión, todas deben negar; con datos, la forma del `returns` no cambió (no hace falta `drop` extra, pero los `drop function if exists` ya existentes se conservan):

```sql
-- Compilan; sin sesión niegan (auth.uid() null → acceso false)
select * from public.kimun_prof_dominio('CUR-0000');          -- ERROR no_autorizado
select * from public.kimun_prof_participacion('CUR-0000');    -- ERROR no_autorizado
```
Expected: cada una lanza `no_autorizado` (que PostgREST traduciría a 400 desde el panel). El filtrado real por asignatura se prueba en la Fase 3.

- [ ] **Step 6: Commit**

```bash
git add supabase/schema.sql
git commit -m "Roles por asignatura: lectura de dominio/participacion filtra por asignatura (Fase 1)"
```

---

### Task 5: Refuerzo valida la asignatura

**Files:**
- Modify: `supabase/schema.sql` — `kimun_prof_refuerzo_lanzar` (799-809), `kimun_prof_refuerzo_cerrar` (812-819), `kimun_prof_refuerzo_estado` (825-845, solo el portero).

- [ ] **Step 1: `kimun_prof_refuerzo_lanzar` — entrar con `acceso` y exigir que la asignatura sea mía**

Reemplazar el cuerpo (801-808) por:

```sql
language plpgsql security definer set search_path=public as $$
declare cid uuid; nid uuid; begin
  select id into cid from public.cursos where codigo = upper(trim(p_curso_codigo));
  if cid is null or not public.kimun_prof_acceso(cid) then raise exception 'no_autorizado'; end if;
  -- Solo puedo lanzar refuerzo de una asignatura que dicto en este curso. Esto
  -- ES la defensa del servidor que el spec exige: aunque la interfaz oculte el
  -- botón, la función igual rechaza una asignatura ajena.
  if not (p_asignatura = any(public.kimun_prof_asignaturas(cid)))
    then raise exception 'no_autorizado'; end if;
  if p_objetivos is null or array_length(p_objetivos,1) is null then raise exception 'sin_objetivos'; end if;
  update public.desafios set activo=false where curso_id=cid and activo;
  insert into public.desafios(curso_id, asignatura, objetivos)
  values (cid, p_asignatura, p_objetivos) returning id into nid;
  return nid;
end $$;
```

- [ ] **Step 2: `kimun_prof_refuerzo_cerrar` — validar contra la asignatura del desafío activo**

Reemplazar el cuerpo (814-818) por:

```sql
language plpgsql security definer set search_path=public as $$
declare cid uuid; asig text; n int; begin
  select id into cid from public.cursos where codigo = upper(trim(p_curso_codigo));
  if cid is null or not public.kimun_prof_acceso(cid) then raise exception 'no_autorizado'; end if;
  -- El profe de asignatura solo cierra el refuerzo si es de una materia suya. El
  -- jefe/admin reciben las cuatro, así que pasan siempre.
  select asignatura into asig from public.desafios where curso_id=cid and activo limit 1;
  if asig is not null and not (asig = any(public.kimun_prof_asignaturas(cid)))
    then raise exception 'no_autorizado'; end if;
  update public.desafios set activo=false where curso_id=cid and activo;
  get diagnostics n = row_count; return n;
end $$;
```

- [ ] **Step 3: `kimun_prof_refuerzo_estado` — entrar con `acceso`**

En su cuerpo (línea 832) cambiar el portero:

```sql
  if cid is null or not public.kimun_prof_acceso(cid) then raise exception 'no_autorizado'; end if;
```
(El resto queda igual: el seguimiento del desafío activo lo ve cualquiera con acceso al curso.)

- [ ] **Step 4: Verificar en el SQL Editor**

Pegar el `schema.sql` completo:

```sql
select public.kimun_prof_refuerzo_lanzar('CUR-0000','HI08',array['HI08 OA 01']);  -- ERROR no_autorizado
select public.kimun_prof_refuerzo_cerrar('CUR-0000');                              -- ERROR no_autorizado
```
Expected: ambas lanzan `no_autorizado` sin sesión. La validación por asignatura se prueba en la Fase 3 (Task 15, paso 3).

- [ ] **Step 5: Commit**

```bash
git add supabase/schema.sql
git commit -m "Roles por asignatura: refuerzo valida asignatura en el servidor (Fase 1)"
```

---

### Task 6: `kimun_prof_listar` devuelve rol y asignaturas por curso

El panel necesita saber, por curso, si soy jefe/admin (para mostrar lo destructivo y el bloque de equipo) y qué asignaturas manejo. Se agregan dos columnas al `returns table`. Como cambia la forma, el `drop function if exists` que ya está antes (línea 509) cubre la idempotencia.

**Files:**
- Modify: `supabase/schema.sql` — `kimun_prof_listar` (509-523).

- [ ] **Step 1: Reemplazar la función completa**

Reemplazar desde `drop function if exists public.kimun_prof_listar();` (509) hasta su `end $$;` (523) por:

```sql
drop function if exists public.kimun_prof_listar();
create or replace function public.kimun_prof_listar()
returns table(curso text, curso_codigo text, alumno text, avatar text,
              codigo_acceso text, xp int, dificil int,
              puede_gestionar boolean, mis_asignaturas text[])
language plpgsql security definer set search_path=public as $$
declare yo public.profesores; begin
  select * into yo from public.profesores where id = auth.uid();
  if yo.id is null then raise exception 'no_autorizado'; end if;
  return query
    select c.nombre, c.codigo, p.nombre, p.avatar, p.codigo_acceso, p.xp, p.dificil,
           -- "Puedo gestionar" = soy jefe o admin de este curso: gobierna los
           -- botones destructivos y el bloque de equipo en el panel.
           public.kimun_prof_es_mio(c.id),
           public.kimun_prof_asignaturas(c.id)
    from public.cursos c
    left join public.perfiles p on p.curso_id = c.id
    where yo.es_admin
       or exists(select 1 from public.curso_profesores cp
                 where cp.curso_id = c.id and cp.profesor_id = yo.id
                   and (cp.rol='jefe' or coalesce(array_length(cp.asignaturas,1),0) >= 1))
    order by c.nombre, p.xp desc nulls last, p.nombre;
end $$;
```

- [ ] **Step 2: Verificar en el SQL Editor**

```sql
-- Compila; sin sesión, no_autorizado
select * from public.kimun_prof_listar();   -- ERROR no_autorizado
-- La firma nueva existe con las dos columnas
select proname, pg_get_function_result(oid) from pg_proc
where proname='kimun_prof_listar';
```
Expected: la firma del resultado incluye `puede_gestionar boolean` y `mis_asignaturas text[]`.

- [ ] **Step 3: Commit**

```bash
git add supabase/schema.sql
git commit -m "Roles por asignatura: kimun_prof_listar informa rol y asignaturas por curso (Fase 1)"
```

---

### Task 7: Gestión del equipo del curso

Tres funciones nuevas, todas exigen jefe o admin (`kimun_prof_es_mio`).

**Files:**
- Modify: `supabase/schema.sql` — insertar después de `kimun_prof_curso_asignar` (tras la línea 756), junto a las otras funciones de administración.

- [ ] **Step 1: Agregar las tres funciones**

```sql
-- ------------------------------------------------------------
-- Gestión del equipo de un curso (Sesión 37). Exigen jefe o admin. El profesor
-- debe existir ya en "profesores" (autorizado y registrado): no se crean cuentas
-- desde aquí.
-- ------------------------------------------------------------

-- Lista el equipo del curso con el rol y las asignaturas de cada uno.
drop function if exists public.kimun_prof_equipo(text);
create or replace function public.kimun_prof_equipo(p_curso_codigo text)
returns table(correo text, nombre text, rol text, asignaturas text[])
language plpgsql security definer set search_path=public as $$
declare cid uuid; begin
  select id into cid from public.cursos where codigo = upper(trim(p_curso_codigo));
  if cid is null or not public.kimun_prof_es_mio(cid) then raise exception 'no_autorizado'; end if;
  return query
    select pr.correo, pr.nombre, cp.rol, cp.asignaturas
    from public.curso_profesores cp
    join public.profesores pr on pr.id = cp.profesor_id
    where cp.curso_id = cid
    order by (cp.rol='jefe') desc, pr.nombre;   -- el jefe primero
end $$;

-- Agrega o actualiza a un profesor en el curso. Si p_rol='jefe', el jefe anterior
-- baja a 'asignatura' primero (el índice único no permite dos). Idempotente: sobre
-- (curso, profesor) actualiza la fila existente.
create or replace function public.kimun_prof_equipo_asignar(
  p_curso_codigo text, p_correo text, p_rol text, p_asignaturas text[])
returns void language plpgsql security definer set search_path=public as $$
declare cid uuid; pid uuid; rol text; asigs text[]; begin
  select id into cid from public.cursos where codigo = upper(trim(p_curso_codigo));
  if cid is null or not public.kimun_prof_es_mio(cid) then raise exception 'no_autorizado'; end if;
  select id into pid from public.profesores where lower(correo) = lower(trim(coalesce(p_correo,'')));
  if pid is null then raise exception 'profesor_invalido'; end if;
  rol := case when p_rol = 'jefe' then 'jefe' else 'asignatura' end;
  -- El jefe ignora asignaturas (alcanza todas); un profe de asignatura sin
  -- materias queda sin acceso, pero es una fila válida ("aún no le asignan").
  asigs := case when rol = 'jefe' then '{}'::text[] else coalesce(p_asignaturas,'{}'::text[]) end;
  if rol = 'jefe' then
    -- Solo puede haber un jefe: baja al actual (si es otro) antes de insertar.
    update public.curso_profesores set rol='asignatura'
     where curso_id = cid and rol='jefe' and profesor_id <> pid;
  end if;
  insert into public.curso_profesores(curso_id, profesor_id, rol, asignaturas)
  values (cid, pid, rol, asigs)
  on conflict (curso_id, profesor_id) do update
    set rol = excluded.rol, asignaturas = excluded.asignaturas;
end $$;

-- Saca a un profesor del curso (incluido el jefe). No toca ningún dato de
-- desempeño: borra solo la fila de membresía. Devuelve cuántas filas borró.
create or replace function public.kimun_prof_equipo_quitar(p_curso_codigo text, p_correo text)
returns int language plpgsql security definer set search_path=public as $$
declare cid uuid; pid uuid; n int; begin
  select id into cid from public.cursos where codigo = upper(trim(p_curso_codigo));
  if cid is null or not public.kimun_prof_es_mio(cid) then raise exception 'no_autorizado'; end if;
  select id into pid from public.profesores where lower(correo) = lower(trim(coalesce(p_correo,'')));
  if pid is null then raise exception 'profesor_invalido'; end if;
  delete from public.curso_profesores where curso_id = cid and profesor_id = pid;
  get diagnostics n = row_count; return n;
end $$;
```

**Nota de diseño (rotación sin pérdida):** `kimun_prof_equipo_quitar` borra una fila de `curso_profesores` y nada más. `dominio`, `perfiles` y `desafios` quedan intactos — el desempeño es del curso, no de quien lo acompaña. Si se va un profe de asignatura, el Jefe sigue cubriendo esa materia (alcanza todas). Si se va el Jefe, el curso queda sin jefe pero el administrador lo sigue viendo (por `es_admin`) y puede nombrar uno nuevo con `kimun_prof_equipo_asignar`.

- [ ] **Step 2: Verificar en el SQL Editor**

```sql
select * from public.kimun_prof_equipo('CUR-0000');                          -- ERROR no_autorizado
select public.kimun_prof_equipo_asignar('CUR-0000','x@y.cl','jefe','{}');    -- ERROR no_autorizado
select public.kimun_prof_equipo_quitar('CUR-0000','x@y.cl');                 -- ERROR no_autorizado
```
Expected: las tres lanzan `no_autorizado` sin sesión. El flujo real (nombrar jefe, cambiar de jefe, asignar materias) se prueba en la Fase 3.

- [ ] **Step 3: Commit**

```bash
git add supabase/schema.sql
git commit -m "Roles por asignatura: gestion del equipo del curso (Fase 1)"
```

---

### Task 8: Ranking por asignatura

**Files:**
- Modify: `supabase/schema.sql` — insertar después de las funciones de equipo (Task 7).

- [ ] **Step 1: Agregar la función**

```sql
-- Ranking de un curso en UNA asignatura, por acierto de primer intento. Requiere
-- acceso al curso y que la asignatura sea mía. NO devuelve codigo_acceso (es la
-- credencial del alumno; un ranking de consulta no la necesita), igual que
-- kimun_prof_dominio_oa: identifica por nombre.
drop function if exists public.kimun_prof_ranking_asignatura(text,text,int);
create or replace function public.kimun_prof_ranking_asignatura(
  p_curso_codigo text, p_asignatura text, p_minimo int default 20)
returns table(alumno text, avatar text, resp_1 bigint, ok_1 bigint, pct numeric,
              oa_tocados bigint, suficiente boolean)
language plpgsql security definer set search_path=public as $$
declare cid uuid; begin
  select id into cid from public.cursos where codigo = upper(trim(p_curso_codigo));
  if cid is null or not public.kimun_prof_acceso(cid) then raise exception 'no_autorizado'; end if;
  if not (p_asignatura = any(public.kimun_prof_asignaturas(cid)))
    then raise exception 'no_autorizado'; end if;
  return query
    select p.nombre, p.avatar,
           sum(d.resp_1), sum(d.ok_1),
           -- pct = primer intento, el mismo criterio del mapa de OA.
           round(sum(d.ok_1)::numeric / nullif(sum(d.resp_1),0) * 100, 0),
           count(distinct d.oa) filter (where d.resp_1 > 0),
           sum(d.resp_1) >= p_minimo
    from public.perfiles p
    join public.dominio d on d.perfil_id = p.id
                          and public.kimun_oa_asignatura(d.oa) = p_asignatura
    where p.curso_id = cid and p.codigo_acceso is not null
    group by p.id, p.nombre, p.avatar
    -- Los que no llegan al mínimo quedan al final; entre ellos, mejor primero.
    order by (sum(d.resp_1) >= p_minimo) desc,
             (sum(d.ok_1)::numeric / nullif(sum(d.resp_1),0)) desc nulls last,
             p.nombre;
end $$;
```

**Nota:** el denominador de la cobertura (cuántos OA tiene la asignatura) lo pone el **cliente** desde `contenido/*/oa.json`, que `profesor.html` ya carga. La base solo entrega `oa_tocados`. Así el catálogo de contenido sigue siendo la única fuente de verdad.

- [ ] **Step 2: Verificar en el SQL Editor**

```sql
select * from public.kimun_prof_ranking_asignatura('CUR-0000','HI08',20);   -- ERROR no_autorizado
select proname, pg_get_function_result(oid) from pg_proc
where proname='kimun_prof_ranking_asignatura';
```
Expected: `no_autorizado` sin sesión; la firma del resultado tiene las 7 columnas.

- [ ] **Step 3: Commit**

```bash
git add supabase/schema.sql
git commit -m "Roles por asignatura: ranking por asignatura (Fase 1)"
```

---

### Task 9: `grant` de las funciones nuevas del cliente

Las funciones que el panel llama por `SB.rpc` necesitan `grant execute … to anon, authenticated`. Los helpers internos (`kimun_oa_asignatura`, `kimun_prof_acceso`, `kimun_prof_asignaturas`) NO se otorgan (Task 3 ya los revocó / no los agrega): solo los llaman otras funciones `SECURITY DEFINER`, que corren como su propietario.

**Files:**
- Modify: `supabase/schema.sql` — el bloque `grant execute on function … to anon, authenticated;` (984-1010, el que termina en `to anon, authenticated;`).

- [ ] **Step 1: Agregar las funciones del equipo y el ranking al grant**

Dentro del bloque `grant execute on function`, antes de `to anon, authenticated;`, agregar:

```sql
  , public.kimun_prof_equipo(text)
  , public.kimun_prof_equipo_asignar(text,text,text,text[])
  , public.kimun_prof_equipo_quitar(text,text)
  , public.kimun_prof_ranking_asignatura(text,text,int)
```

**No agregar** `kimun_oa_asignatura`, `kimun_prof_acceso` ni `kimun_prof_asignaturas`: son internas.

- [ ] **Step 2: Verificar en el SQL Editor**

Pegar el `schema.sql` completo (sin errores). Luego:

```sql
-- Las 4 funciones del cliente tienen execute para 'authenticated'
select p.proname
from pg_proc p
where p.proname in ('kimun_prof_equipo','kimun_prof_equipo_asignar',
                    'kimun_prof_equipo_quitar','kimun_prof_ranking_asignatura')
  and has_function_privilege('authenticated', p.oid, 'execute');
```
Expected: las 4 filas aparecen (todas otorgadas).

```sql
-- Los helpers internos NO tienen execute para 'anon'
select p.proname
from pg_proc p
where p.proname in ('kimun_prof_acceso','kimun_prof_asignaturas','kimun_oa_asignatura')
  and has_function_privilege('anon', p.oid, 'execute');
```
Expected: `kimun_prof_acceso` y `kimun_prof_asignaturas` NO aparecen (revocadas). `kimun_oa_asignatura` es `immutable` sin `security definer` y PostgreSQL le da execute a public por defecto; es inofensiva (no lee datos), así que puede aparecer — no es un problema. Si se prefiere cerrarla, agregarla al `revoke` de la Task 3.

- [ ] **Step 3: Commit — cierra la Fase 1**

```bash
git add supabase/schema.sql
git commit -m "Roles por asignatura: grants de equipo y ranking (cierra Fase 1 backend)"
```

**Checkpoint de Fase 1:** re-pegar el `schema.sql` completo una vez más y confirmar que corre sin errores de principio a fin (idempotencia total). El backend queda listo para que Roberto lo aplique en Supabase; el panel (Fase 2) ya puede llamar a todo.

---

# FASE 2 · Panel (`profesor.html`)

> El panel no se puede probar con sesión real de profesor desde el entorno de desarrollo (necesita credenciales de Supabase). Se verifica en el navegador con un **stub de `SB.rpc`** que devuelve datos simulados, como en las Sesiones 26–28, y la prueba end-to-end con cuentas reales queda para Roberto (Fase 3).

### Task 10: Canonizar la asignatura al código y arreglar los dos bugs de refuerzo

**Files:**
- Modify: `profesor.html` — `objetivosFlojos` (629-636) y `cargarRefuerzo` (664, 675-676, 685).

- [ ] **Step 1: `objetivosFlojos` — usar el código y aceptar las cuatro asignaturas**

Reemplazar la función (629-636) por:

```javascript
// Objetivos flojos de una asignatura: primer intento < 70% con evidencia (>=4 alumnos de
// primer intento), peores primero, tope 5. `filas` viene de kimun_prof_dominio. La
// asignatura llega como CÓDIGO de 4 letras (HI08…), la clave canónica del sistema.
function objetivosFlojos(filas, asigCodigo){
  return (filas||[])
    .filter(f => asigCodigo && String(f.oa).slice(0,4) === asigCodigo
                 && f.resp_1 > 0 && f.alumnos_1 >= 4
                 && (f.ok_1 / f.resp_1) < 0.70)
    .sort((a,b) => (a.ok_1/a.resp_1) - (b.ok_1/b.resp_1))
    .slice(0,5);
}
```

**Ojo:** con Matemática, un OA es `MA08 OA 12` y `slice(0,4)` da `MA08` — correcto. Vocabulario (`VOC-MATE`) NO calza con `slice(0,4)` y por diseño el refuerzo se arma sobre los OA del banco (que sí tienen prefijo de 4 letras), así que esto es suficiente para el refuerzo. (El mapa de dominio sí reparte Vocabulario por materia vía `kimun_oa_asignatura` en el servidor.)

- [ ] **Step 2: `cargarRefuerzo` — incluir Matemática y mandar el código, no el nombre**

En `cargarRefuerzo` (bloque de sugerencias, 664-689), reemplazar la lista y el armado por:

```javascript
  // Las cuatro asignaturas, por su código canónico. Antes faltaba Matemática (bug).
  const ASIGS = [['HI08','Historia'],['CN08','Ciencias'],['LE08','Lenguaje'],['MA08','Matemáticas']];
  const bloques=ASIGS.map(([cod,nom])=>{
    const objs=objetivosFlojos(filasDominio,cod);
    if(!objs.length) return '';
    const lista=objs.map(o=>{
      const pct=Math.round(o.ok_1/o.resp_1*100);
      return `<li style="font-size:12px;color:var(--dim)">${esc(OA_TEXTO[o.oa]||o.oa)} · ${pct}%</li>`;
    }).join('');
    return `<div style="margin-bottom:12px">
      <p style="font-size:13px;margin:0 0 4px"><b>${nom}</b> · ${objs.length} objetivo${objs.length===1?'':'s'} para reforzar</p>
      <ul style="margin:0 0 6px 16px;padding:0">${lista}</ul>
      <button class="btn-chip refLanzar" data-asig="${cod}" data-nom="${esc(nom)}"
        data-oas="${esc(objs.map(o=>o.oa).join('|'))}"
        >📣 Lanzar desafío de refuerzo de ${esc(nom)}</button></div>`;
  }).filter(Boolean).join('');
```

Y en el handler `.refLanzar` (681-689), mandar el **código** en `p_asignatura` y usar el nombre solo para el texto de confirmación:

```javascript
  cont.querySelectorAll('.refLanzar').forEach(b=>b.onclick=async ()=>{
    const oas=b.dataset.oas.split('|');
    if(!confirm(`¿Lanzar el desafío de refuerzo de ${b.dataset.nom}?\n\nLes aparecerá a todos los alumnos del curso.`)) return;
    try{ const {error}=await SB.rpc('kimun_prof_refuerzo_lanzar',
      {p_curso_codigo:cursoCodigo,p_asignatura:b.dataset.asig,p_objetivos:oas});  // p_asignatura = código
      if(error) throw error; aviso('Desafío lanzado','var(--green)'); }
    catch(e){ aviso(errorPanel(e)); }
    cargarRefuerzo(cursoCodigo, filasDominio);
  });
```

- [ ] **Step 3: Mostrar el nombre legible en el seguimiento del desafío activo**

`kimun_prof_refuerzo_estado` ahora devuelve `asignatura` como código (`HI08`). En el bloque `if(est)` (651), traducir a nombre con `ASIG_NOMBRE` (ya existe, línea 490):

```javascript
      <h3 style="color:var(--gold);font-size:15px;margin:0 0 8px">📣 Refuerzo de ${esc(ASIG_NOMBRE[est.asignatura]||est.asignatura)} · activo</h3>
```

- [ ] **Step 4: Verificar en el navegador (stub)**

Levantar el preview (`preview_start` con la config de `.claude/launch.json`) y abrir `profesor.html`. En la consola, montar un stub mínimo y ejercitar `objetivosFlojos`:

```javascript
// En la consola del navegador
const filas = [
  {oa:'MA08 OA 12', resp_1:30, ok_1:12, alumnos_1:6},  // 40% → flojo
  {oa:'HI08 OA 01', resp_1:30, ok_1:27, alumnos_1:6},  // 90% → no
  {oa:'MA08 OA 05', resp_1:2,  ok_1:0,  alumnos_1:1},  // sin evidencia → no
];
console.log(objetivosFlojos(filas,'MA08').map(o=>o.oa));  // ['MA08 OA 12']
console.log(objetivosFlojos(filas,'HI08').map(o=>o.oa));  // []
```
Expected: `['MA08 OA 12']` (Matemática ya se detecta) y `[]`. Sin errores de consola.

- [ ] **Step 5: Commit**

```bash
git add profesor.html
git commit -m "Roles por asignatura: canoniza asignatura al codigo + arregla refuerzo de Matematica (Fase 2)"
```

---

### Task 11: Ocultar lo destructivo a los profes de asignatura

`kimun_prof_listar` ahora trae `puede_gestionar` por curso. El panel usa ese flag para no dibujar el 🗑️ del curso, el ✎/✕ de alumnos, el campo de agregar alumno, la carga masiva y el botón "🔄 Reiniciar mediciones". El servidor igual los rechaza; la interfaz no debe ofrecer lo que no se puede hacer.

**Files:**
- Modify: `profesor.html` — `pintarLista` (304-407), `verAvance` (712-726).

- [ ] **Step 1: Guardar el flag por curso al agrupar**

En `pintarLista`, dentro del `forEach` que arma `porCurso` (315-318), guardar el flag:

```javascript
  const porCurso={};
  (data||[]).forEach(f=>{
    porCurso[f.curso_codigo]=porCurso[f.curso_codigo]||
      {nombre:f.curso, alumnos:[], gestiono:f.puede_gestionar};
    if(f.codigo_acceso) porCurso[f.curso_codigo].alumnos.push(f);
  });
```

- [ ] **Step 2: Condicionar el HTML destructivo a `c.gestiono`**

En el template de cada curso (320-363), envolver los controles destructivos. Cambios puntuales:

El 🗑️ del curso (328):
```javascript
        ${c.gestiono?`<button class="ico ico-del delcurso" data-cod="${esc(cod)}" title="Eliminar curso">🗑️</button>`:''}
```

Los botones ✎ y ✕ de cada alumno (340-345) → dejar siempre 📊 (ver avance), condicionar ✎ y ✕:
```javascript
                  ${c.gestiono?`<button class="ico xp" data-cod="${esc(a.codigo_acceso)}" data-xp="${esc(a.xp)}"
                          title="Fijar XP" style="color:var(--gold)">✎</button>`:''}
                  <button class="ico avalum" data-cod="${esc(a.codigo_acceso)}"
                          data-nom="${esc(a.alumno)}" title="Ver avance">📊</button>
                  ${c.gestiono?`<button class="ico ico-del del" data-cod="${esc(a.codigo_acceso)}"
                          title="Eliminar alumno">✕</button>`:''}
```

El bloque de agregar alumno + carga masiva (350-359) → envolver todo en `${c.gestiono?` … `:''}`:
```javascript
            ${c.gestiono?`<div style="margin-top:8px">
              <input class="in-alumno" data-curso="${esc(cod)}" placeholder="Nombre del alumno nuevo">
              <button class="btn sec add-alumno" data-curso="${esc(cod)}">+ Agregar alumno</button>
            </div>
            <details class="masivo" style="margin-top:6px">
              <summary style="cursor:pointer;color:var(--cyan);font-size:13px;font-weight:800;list-style:none">➕ Cargar varios de una vez</summary>
              <p style="color:var(--dim);font-size:12px;margin:6px 0">Pega un nombre por línea (como los copias de una lista).</p>
              <textarea class="in-masivo" data-curso="${esc(cod)}" rows="5" placeholder="Ana Pérez&#10;Benjamín Soto&#10;Catalina Rivas"></textarea>
              <button class="btn sec add-masivo" data-curso="${esc(cod)}">Agregar todos</button>
            </details>`:''}
```

**Nota:** `conectarAcciones` usa `document.querySelectorAll('.del')`, `.xp`, etc. — si no se dibujan, los selectores no encuentran nada y no fallan. No hace falta tocar `conectarAcciones`. El botón "+ Crear curso" del pie (365-368) se conserva para todos: cualquier profesor puede crear su propio curso (queda como su jefe automáticamente vía `kimun_prof_curso_crear`, que ya inserta `profesor_id` — ver Step 4).

- [ ] **Step 3: Ocultar "Reiniciar mediciones" en `verAvance` a quien no gestiona**

`verAvance` no sabe hoy si el profesor gestiona el curso. Pasarle el flag desde el botón que la invoca. En `pintarLista`, el botón de avance (331-332) ya tiene `data-cod` y `data-nom`; agregar `data-gestiono`:

```javascript
        <button class="btn-chip avance" data-cod="${esc(cod)}" data-nom="${esc(c.nombre)}"
          data-gestiono="${c.gestiono?'1':''}">📊 Ver avance del curso</button>
```

En `conectarAcciones`, el handler `.avance` (458-459):
```javascript
  document.querySelectorAll('.avance').forEach(
    b=>b.onclick=()=>verAvance(b.dataset.cod, b.dataset.nom, b.dataset.gestiono==='1'));
```

En `verAvance(cursoCodigo, cursoNombre, gestiono)` (694), agregar el parámetro y condicionar el botón de reinicio (723-725):
```javascript
      <div id="refuerzoBloque" style="margin-top:16px;border-top:1px solid #ffffff22;padding-top:12px"></div>
      <div style="margin-top:14px">
        ${gestiono?`<button class="btn sec" id="btnReiniciarMed">🔄 Reiniciar mediciones</button>`:''}
        <button class="btn sec" id="btnVolverPanel">← Volver</button>
      </div>`;
```
Y guardar el handler solo si existe el botón (729):
```javascript
    const bReinit=$('btnReiniciarMed'); if(bReinit) bReinit.onclick=()=>reiniciarMediciones(cursoCodigo, cursoNombre);
```

- [ ] **Step 4: Registrar al creador de un curso como su jefe**

`kimun_prof_curso_crear` (schema.sql, 525-533) hoy solo pone `cursos.profesor_id`. Para que el creador aparezca en su curso bajo el nuevo modelo, agregar la membresía de jefe. Reemplazar el `insert … returning * into r;` por:

```sql
  insert into public.cursos(nombre, codigo, profesor_id)
  values (trim(p_nombre), public.kimun_gen_codigo_curso(), yo.id) returning * into r;
  insert into public.curso_profesores(curso_id, profesor_id, rol, asignaturas)
  values (r.id, yo.id, 'jefe', '{}')
  on conflict (curso_id, profesor_id) do nothing;
  return r; end $$;
```
(Este cambio es de backend pero pertenece a esta tarea porque sin él un curso recién creado no le aparecería a su creador. Commitear junto con el panel o en el commit de esta tarea.)

- [ ] **Step 5: Verificar en el navegador (stub)**

Con un stub de `kimun_prof_listar` que devuelva dos cursos —uno con `puede_gestionar:true` y otro `false`—, confirmar por DOM:

```javascript
// Stub antes de pintarLista(); ver el patrón en las Sesiones 26-28.
SB.rpc = async (fn)=> fn==='kimun_prof_listar' ? {data:[
  {curso:'8°A',curso_codigo:'CUR-AAAA',alumno:'Ana',avatar:'🦊',codigo_acceso:'ALU-1',xp:10,dificil:0,puede_gestionar:true, mis_asignaturas:['HI08','CN08','MA08','LE08']},
  {curso:'8°B',curso_codigo:'CUR-BBBB',alumno:'Ben',avatar:'🦊',codigo_acceso:'ALU-2',xp:10,dificil:0,puede_gestionar:false,mis_asignaturas:['CN08']},
]} : {data:[]};
YO={id:'x',nombre:'Profe',es_admin:false};
await pintarLista();
// Curso gestionable: tiene 🗑️, ✎, ✕ y "+ Agregar alumno"
document.querySelector('details.curso[data-cod="CUR-AAAA"] .delcurso');  // existe
// Curso no gestionable: NO los tiene
document.querySelector('details.curso[data-cod="CUR-BBBB"] .delcurso');  // null
document.querySelector('details.curso[data-cod="CUR-BBBB"] .add-alumno');// null
```
Expected: el curso gestionable muestra los controles; el otro no. Sin desborde lateral a 375 px (`document.documentElement.scrollWidth <= 375`). Sin errores de consola.

- [ ] **Step 6: Commit**

```bash
git add profesor.html supabase/schema.sql
git commit -m "Roles por asignatura: ocultar lo destructivo al profe de asignatura + creador es jefe (Fase 2)"
```

---

### Task 12: Bloque "Equipo del curso"

Visible solo para jefe y administrador (`c.gestiono`). Lista de profesores con sus asignaturas, alta por correo con casillas de materias, y baja.

**Files:**
- Modify: `profesor.html` — agregar el bloque dentro del cuerpo del curso en `pintarLista` (dentro de `curso-cuerpo`, tras el `<details class="alumnos">`), y las funciones `cargarEquipo`, `equipoAsignar`, `equipoQuitar`.

- [ ] **Step 1: Agregar el contenedor del equipo en el template del curso**

En `pintarLista`, dentro de `<div class="curso-cuerpo">`, después del `</details>` de alumnos (361) y antes del cierre del cuerpo (362), agregar (solo si gestiona):

```javascript
        ${c.gestiono?`<details class="equipo" data-cod="${esc(cod)}" style="margin-top:6px">
          <summary style="cursor:pointer;color:var(--violet);font-size:13px;font-weight:800;list-style:none">�on Equipo del curso</summary>
          <div class="equipo-cuerpo" data-cod="${esc(cod)}">
            <p style="color:var(--dim);font-size:12px;margin:6px 0">Cargando…</p>
          </div>
        </details>`:''}
```
Corregir el emoji del summary a `👥 Equipo del curso` (el `�on` es un marcador; usar `👥`).

- [ ] **Step 2: Cargar el equipo de forma perezosa al abrir el `<details>`**

En `pintarLista`, después de restaurar el estado desplegado (375) y antes de `cargarTitularesParticipacion` (376), cablear:

```javascript
  document.querySelectorAll('details.equipo').forEach(det => det.addEventListener('toggle', () => {
    if(det.open && !det.dataset.cargado){ det.dataset.cargado='1'; cargarEquipo(det.dataset.cod); }
  }));
```

- [ ] **Step 3: Agregar las funciones del equipo**

Insertar junto a las otras funciones del panel (por ejemplo después de `conectarAcciones`, tras la línea 462). `ASIG_NOMBRE` y `ASIG_ORDEN` ya existen (490-491) pero se definen más abajo en el archivo; moverlas arriba NO es necesario porque estas funciones se ejecutan en tiempo de evento, no de carga. Código:

```javascript
/* ===== Equipo del curso (jefe/admin) ===== */
async function cargarEquipo(cursoCodigo){
  const caja=document.querySelector('.equipo-cuerpo[data-cod="'+cursoCodigo+'"]');
  if(!caja) return;
  caja.innerHTML='<p style="color:var(--dim);font-size:12px">Cargando…</p>';
  let equipo=[];
  try{
    const {data,error}=await SB.rpc('kimun_prof_equipo',{p_curso_codigo:cursoCodigo});
    if(error) throw error; equipo=data||[];
  }catch(e){ caja.innerHTML='<p style="color:var(--pink);font-size:12px">'+errorPanel(e)+'</p>'; return; }
  const filas=equipo.map(m=>{
    const asigs = m.rol==='jefe' ? 'todas las asignaturas'
      : (m.asignaturas&&m.asignaturas.length ? m.asignaturas.map(a=>ASIG_NOMBRE[a]||a).join(', ')
                                             : 'sin asignaturas');
    return `<div class="equipo-fila" style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:4px 0;font-size:13px">
      <b style="color:var(--gold)">${m.rol==='jefe'?'⭐ ':''}${esc(m.nombre||m.correo)}</b>
      <span style="color:var(--dim)">${esc(asigs)}</span>
      <button class="ico ico-del eq-quitar" data-cod="${esc(cursoCodigo)}" data-correo="${esc(m.correo)}"
        title="Quitar del curso" style="margin-left:auto">✕</button>
    </div>`;
  }).join('');
  // Casillas de las cuatro asignaturas + rol, para el alta.
  const casillas=ASIG_ORDEN.map(a=>
    `<label style="font-size:12px;margin-right:8px"><input type="checkbox" class="eq-asig" value="${a}"> ${ASIG_NOMBRE[a]}</label>`).join('');
  caja.innerHTML=`${filas||'<p style="color:var(--dim);font-size:12px">Solo estás tú.</p>'}
    <div style="margin-top:8px;border-top:1px solid #ffffff22;padding-top:8px">
      <input class="eq-correo" type="email" placeholder="Correo del profesor (ya registrado)" style="width:100%">
      <div style="margin:6px 0">
        <label style="font-size:12px;margin-right:10px"><input type="radio" name="eqrol-${esc(cursoCodigo)}" class="eq-rol" value="asignatura" checked> Profe de asignatura</label>
        <label style="font-size:12px"><input type="radio" name="eqrol-${esc(cursoCodigo)}" class="eq-rol" value="jefe"> Profesor Jefe</label>
      </div>
      <div class="eq-casillas" style="margin:0 0 6px">${casillas}</div>
      <button class="btn sec eq-asignar" data-cod="${esc(cursoCodigo)}">+ Agregar al equipo</button>
    </div>`;
  caja.querySelectorAll('.eq-quitar').forEach(b=>b.onclick=()=>equipoQuitar(b.dataset.cod, b.dataset.correo));
  caja.querySelector('.eq-asignar').onclick=()=>{
    const correo=(caja.querySelector('.eq-correo').value||'').trim();
    if(!correo){ aviso('Escribe el correo del profesor.'); return; }
    const rol=caja.querySelector('.eq-rol:checked').value;
    const asigs=[...caja.querySelectorAll('.eq-asig:checked')].map(c=>c.value);
    if(rol==='asignatura' && !asigs.length){ aviso('Marca al menos una asignatura, o hazlo Profesor Jefe.'); return; }
    equipoAsignar(cursoCodigo, correo, rol, asigs);
  };
}

async function equipoAsignar(cursoCodigo, correo, rol, asigs){
  try{
    const {error}=await SB.rpc('kimun_prof_equipo_asignar',
      {p_curso_codigo:cursoCodigo, p_correo:correo, p_rol:rol, p_asignaturas:asigs});
    if(error) throw error; aviso('Profesor agregado al equipo','var(--green)');
    cargarEquipo(cursoCodigo);
  }catch(e){ aviso(errorPanel(e)); }
}

async function equipoQuitar(cursoCodigo, correo){
  if(!confirm('¿Quitar a este profesor del curso?\n\nNo se borra ningún dato de los alumnos; solo pierde el acceso a este curso.')) return;
  try{
    const {error}=await SB.rpc('kimun_prof_equipo_quitar',{p_curso_codigo:cursoCodigo, p_correo:correo});
    if(error) throw error; aviso('Profesor quitado del curso','var(--green)');
    cargarEquipo(cursoCodigo);
  }catch(e){ aviso(errorPanel(e)); }
}
```

**Nota:** `errorPanel` y `esNoAutorizado` (o `aviso`) ya existen en el archivo (se usan en `cargarRefuerzo`). Verificar sus nombres exactos antes de usarlos y respetarlos. Si el traductor de errores se llama distinto, usar el mismo que usa `cargarRefuerzo`.

- [ ] **Step 4: Mover `ASIG_NOMBRE`/`ASIG_ORDEN` si hiciera falta**

`cargarEquipo` usa `ASIG_NOMBRE` y `ASIG_ORDEN`, definidos en 490-491. En JS las `const` de módulo se izan al alcance pero no se inicializan hasta su línea; como `cargarEquipo` corre en un evento (después de la carga completa del script), ya estarán inicializadas. **No mover.** Confirmar en el Step 5 que no hay `ReferenceError`.

- [ ] **Step 5: Verificar en el navegador (stub)**

```javascript
// Stub del equipo
SB.rpc = async (fn,args)=>{
  if(fn==='kimun_prof_equipo') return {data:[
    {correo:'jefe@x.cl',nombre:'Ana Jefe',rol:'jefe',asignaturas:[]},
    {correo:'cien@x.cl',nombre:'Beto Ciencias',rol:'asignatura',asignaturas:['CN08','HI08']},
  ]};
  return {data:null};
};
await cargarEquipo('CUR-AAAA');
document.querySelector('.equipo-cuerpo[data-cod="CUR-AAAA"]').textContent.includes('todas las asignaturas'); // true (el jefe)
document.querySelector('.equipo-cuerpo[data-cod="CUR-AAAA"]').textContent.includes('Ciencias, Historia');    // true
document.querySelectorAll('.equipo-cuerpo[data-cod="CUR-AAAA"] .eq-asig').length;                             // 4 casillas
```
Expected: el jefe se muestra con "todas las asignaturas", el profe con "Ciencias, Historia", hay 4 casillas y el botón de alta. Sin `ReferenceError`, sin errores de consola.

- [ ] **Step 6: Commit**

```bash
git add profesor.html
git commit -m "Roles por asignatura: bloque Equipo del curso (Fase 2)"
```

---

### Task 13: Bloque "Ranking por asignatura"

Bajo el mapa de dominio, en la vista de avance del curso. Un ranking por cada asignatura que el profesor maneja, con el grupo "aún sin datos suficientes" separado al final. La cobertura (OA tocados / OA de la asignatura) se calcula con el total de OA leído de `contenido/*/oa.json`.

**Files:**
- Modify: `profesor.html` — `verAvance` (agregar el contenedor y la llamada) y funciones nuevas `cargarRankingAsignatura` + helper `totalOaAsignatura`.

- [ ] **Step 1: Contar los OA de una asignatura desde `oa.json` (para el denominador)**

`cargarTextosOA` ya llena `OA_TEXTO` con todos los OA de la carpeta. Agregar un contador por asignatura. Insertar junto a `OA_CARPETA` (214):

```javascript
const OA_TOTAL = {};   // 'HI08' -> cuántos OA tiene la asignatura (de oa.json)
```
En `cargarTextosOA`, dentro del `.forEach(o => …)` (228), contar por prefijo:
```javascript
      (d.oa||[]).forEach(o => {
        if(o && o.codigo){
          OA_TEXTO[o.codigo] = o.texto || o.codigo;
          const a = String(o.codigo).slice(0,4);
          OA_TOTAL[a] = (OA_TOTAL[a]||0) + 1;
        }
      });
```
Como `cargarTextosOA` se resetea por carpeta con `OA_CARGADA`, para no doble-contar al recargar, reiniciar el contador de la asignatura antes de sumar. Envolver así: al entrar a una carpeta nueva, poner `OA_TOTAL` de sus prefijos en 0 antes del `forEach`. Más simple y sin estado frágil: **contar sobre un Set** para ser idempotente:
```javascript
      const vistos = OA_TOTAL['_set_'+carpeta] || (OA_TOTAL['_set_'+carpeta]=new Set());
      (d.oa||[]).forEach(o => {
        if(o && o.codigo){
          OA_TEXTO[o.codigo] = o.texto || o.codigo;
          vistos.add(o.codigo);
          OA_TOTAL[String(o.codigo).slice(0,4)] = vistos.size; // aprox: 1 carpeta = 1 asignatura
        }
      });
```
**Nota:** cada carpeta de `OA_CARPETA` corresponde a exactamente una asignatura (`HI08`↔`historia-8basico`, etc.), así que `vistos.size` de la carpeta es el total de OA de esa asignatura. Es correcto y idempotente.

- [ ] **Step 2: Agregar el contenedor del ranking en `verAvance`**

En `verAvance`, en el template de la vista con datos (712-726), después de `<div id="avCuerpo"></div>` y antes del párrafo de Matemáticas (o donde encaje visualmente), agregar:

```javascript
      <div id="rankingBloque" style="margin-top:16px;border-top:1px solid #ffffff22;padding-top:12px"></div>
```
Y después de `cargarRefuerzo(cursoCodigo, data)` (740), llamar:
```javascript
    cargarRankingAsignatura(cursoCodigo, data);
```

- [ ] **Step 3: Agregar `cargarRankingAsignatura`**

Insertar junto a `cargarRefuerzo` (después de 690):

```javascript
/* ===== Ranking por asignatura (bloque en la vista de avance) ===== */
// Un ranking por cada asignatura presente en el mapa del curso. La asignatura se
// deduce del mapa que ya tenemos (data de kimun_prof_dominio), que el servidor ya
// filtró a las mías: si no aparece HI08 en el mapa, no pido su ranking.
async function cargarRankingAsignatura(cursoCodigo, filasDominio){
  const cont=document.getElementById('rankingBloque');
  if(!cont) return;
  // Asignaturas presentes en el mapa (código de 4 letras), en el orden fijo.
  const presentes = ASIG_ORDEN.filter(a =>
    (filasDominio||[]).some(f => String(f.oa).slice(0,4) === a
                                 || SB_asigDe(f.oa) === a));   // ver nota abajo
  if(!presentes.length){ cont.innerHTML=''; return; }
  cont.innerHTML = `<h3 style="color:var(--cyan);font-size:15px;margin:0 0 8px">Ranking por asignatura</h3>
    <p style="color:var(--dim);font-size:12px;margin:0 0 8px">Acierto de primer intento. Necesita al menos 20 respuestas para contar; el resto queda en “aún sin datos suficientes”.</p>
    <div id="rankAsigTabs" class="av-filtros"></div>
    <div id="rankAsigCuerpo"></div>`;
  const tabs=document.getElementById('rankAsigTabs');
  tabs.innerHTML=presentes.map((a,i)=>
    `<button class="av-chip${i===0?' on':''}" data-asig="${a}">${ASIG_NOMBRE[a]}</button>`).join('');
  const pintar=async (asig)=>{
    const cuerpo=document.getElementById('rankAsigCuerpo');
    cuerpo.innerHTML='<p style="color:var(--dim);font-size:12px">Cargando…</p>';
    try{
      const {data,error}=await SB.rpc('kimun_prof_ranking_asignatura',
        {p_curso_codigo:cursoCodigo, p_asignatura:asig, p_minimo:20});
      if(error) throw error;
      cuerpo.innerHTML=rankingHTML(data||[], asig);
    }catch(e){ cuerpo.innerHTML='<p style="color:var(--pink);font-size:12px">'+errorPanel(e)+'</p>'; }
  };
  tabs.querySelectorAll('.av-chip').forEach(ch=>ch.onclick=()=>{
    tabs.querySelectorAll('.av-chip').forEach(o=>o.classList.toggle('on',o===ch));
    pintar(ch.dataset.asig);
  });
  pintar(presentes[0]);
}

// Devuelve la asignatura de un OA en el cliente, para saber qué rankings pedir.
// Refleja la regla de kimun_oa_asignatura para los códigos que llegan al mapa.
function SB_asigDe(oa){
  const s=String(oa);
  if(s.slice(0,4)==='HI08'||s==='VOC-HIST') return 'HI08';
  if(s.slice(0,4)==='CN08'||s==='VOC-CIEN') return 'CN08';
  if(s.slice(0,4)==='MA08'||s==='VOC-MATE') return 'MA08';
  if(s.slice(0,4)==='LE08'||['VOC-LENG','VOC-LECT'].includes(s)||s.startsWith('AF-T')) return 'LE08';
  return null;
}

function rankingHTML(filas, asig){
  const total = OA_TOTAL[asig] || 0;
  const conDatos = filas.filter(f => f.suficiente);
  const sinDatos = filas.filter(f => !f.suficiente);
  const fila = f => {
    const cob = total ? ` · ${f.oa_tocados}/${total} objetivos` : '';
    return `<div style="display:flex;gap:8px;align-items:center;padding:4px 0;font-size:13px">
      <span>${esc(f.avatar||'🦊')}</span><b>${esc(f.alumno)}</b>
      <span style="margin-left:auto;color:var(--gold)">${f.pct==null?'—':f.pct+'%'}</span>
      <span style="color:var(--dim);font-size:11px">${f.resp_1} resp${cob}</span>
    </div>`;
  };
  const bloqueConDatos = conDatos.length
    ? conDatos.map(fila).join('')
    : '<p style="color:var(--dim);font-size:12px">Nadie llega aún a 20 respuestas en esta asignatura.</p>';
  const bloqueSin = sinDatos.length
    ? `<details style="margin-top:8px"><summary style="cursor:pointer;color:var(--dim);font-size:12px;list-style:none">Aún sin datos suficientes (${sinDatos.length})</summary>
         <div style="margin-top:6px">${sinDatos.map(fila).join('')}</div></details>`
    : '';
  return bloqueConDatos + bloqueSin;
}
```

**Nota sobre `SB_asigDe`:** el mapa `data` ya trae solo mis OA (filtrados por el servidor en Task 4). Este helper solo decide qué pestañas de ranking dibujar; no es una frontera de seguridad (el servidor revalida en `kimun_prof_ranking_asignatura`). El `.filter(... slice(0,4)===a || SB_asigDe(...)===a)` cubre tanto los OA con prefijo como Vocabulario/Lectura.

- [ ] **Step 4: Verificar en el navegador (stub)**

```javascript
OA_TOTAL['HI08']=22; // simular el total de Historia
SB.rpc = async (fn,args)=> fn==='kimun_prof_ranking_asignatura' ? {data:[
  {alumno:'Ana',avatar:'🦊',resp_1:40,ok_1:34,pct:85,oa_tocados:8,suficiente:true},
  {alumno:'Ben',avatar:'🦊',resp_1:6, ok_1:5, pct:83,oa_tocados:2,suficiente:false},
]} : {data:[]};
await cargarRankingAsignatura('CUR-AAAA',[{oa:'HI08 OA 01'},{oa:'HI08 OA 02'}]);
const c=document.getElementById('rankAsigCuerpo').textContent;
c.includes('Ana') && c.includes('85%') && c.includes('8/22 objetivos');   // true
c.includes('Aún sin datos suficientes (1)');                              // true (Ben)
```
Expected: Ana en el ranking con 85% y cobertura 8/22; Ben en el desplegable "aún sin datos suficientes". Sin errores de consola, sin desborde a 375 px.

- [ ] **Step 5: Commit**

```bash
git add profesor.html
git commit -m "Roles por asignatura: bloque Ranking por asignatura (cierra Fase 2 panel)"
```

---

# FASE 3 · Verificación integral y documentación

### Task 14: Verificación end-to-end (backend real + navegador)

Esta tarea es la lista de verificación del spec (sección "Verificación"). La ejecuta **Roberto** con cuentas reales de Supabase, porque el entorno de desarrollo no puede iniciar sesión de profesor. El agente prepara el guion y, si tiene acceso al SQL Editor vía Roberto, acompaña.

**Files:** ninguno (verificación).

- [ ] **Step 1: Preparar el curso demo y dos cuentas**

Sobre el curso demo `CUR-BA04` (ya existe, ver traspaso): crear/usar dos cuentas de profesor —una que será Jefe y otra de asignatura con Ciencias e Historia—. Ambas deben estar autorizadas y registradas. Desde el panel del Jefe (o del admin), en "Equipo del curso": nombrar al Jefe y agregar a la segunda cuenta como profe de asignatura con `CN08` y `HI08` marcadas.

- [ ] **Step 2: El profe de asignatura ve solo lo suyo**

Entrar como el profe de Ciencias e Historia. Expected:
- En el mapa de dominio de `CUR-BA04` aparecen **solo** objetivos `HI08` y `CN08` (más Vocabulario de esas materias); nada de `MA08` ni `LE08`.
- El ranking por asignatura ofrece pestañas solo de Historia y Ciencias.
- NO ve el 🗑️ del curso, ni ✎/✕ en alumnos, ni "+ Agregar alumno", ni el bloque "Equipo del curso", ni "🔄 Reiniciar mediciones".

- [ ] **Step 3: El servidor rechaza una asignatura ajena (no solo la interfaz)**

Con esa misma cuenta, desde la consola del navegador, saltarse la interfaz:

```javascript
await SB.rpc('kimun_prof_refuerzo_lanzar',
  {p_curso_codigo:'CUR-BA04', p_asignatura:'MA08', p_objetivos:['MA08 OA 01']});
```
Expected: `error` con `no_autorizado` (HTTP 400). Confirma que el permiso es del servidor, no cosmético.

- [ ] **Step 4: El Jefe ve las cuatro asignaturas y gobierna**

Entrar como el Jefe. Expected: ve las cuatro asignaturas en el mapa y en el ranking; ve el bloque "Equipo del curso"; tiene 🗑️, ✎, ✕, "+ Agregar alumno" y "🔄 Reiniciar mediciones".

- [ ] **Step 5: Vocabulario y Lectura repartidos**

Confirmar que, con datos de Vocabulario/Lectura en el curso, el mapa los muestra bajo su materia (Vocabulario de Historia bajo Historia, Ana Frank/`AF-T*` bajo Lenguaje) gracias a `kimun_oa_asignatura`.

- [ ] **Step 6: Un profe con una sola asignatura no ve selector**

Asignar a una tercera cuenta una sola asignatura (p. ej. `MA08`). Entrar con ella: el mapa muestra solo Matemática y **no** dibuja el filtro de asignatura (con una sola, `filtrosAsignatura` no lo pinta — comportamiento ya existente que ahora se ejercita).

- [ ] **Step 7: Rotación sin pérdida**

Como Jefe o admin, quitar al profe de Ciencias e Historia (Equipo → ✕). Expected:
- (a) El mapa de dominio de Ciencias e Historia sigue **completo** (los datos no se tocaron).
- (b) El Jefe sigue viendo esas materias y puede lanzar su refuerzo.
- (c) Volver a asignar a un reemplazo (o al mismo) con `CN08`/`HI08`: encuentra todo el historial intacto.

- [ ] **Step 8: Quitar al Jefe**

Quitar al Profesor Jefe del curso (desde el admin). Expected: el curso le sigue apareciendo al **administrador** (por `es_admin`), que puede nombrar un jefe nuevo. Los profes de asignatura que queden conservan su acceso.

- [ ] **Step 9: Sin errores de consola en ningún paso.**

- [ ] **Step 10: Registrar el resultado** de la verificación (qué pasó cada paso) para la Bitácora.

---

### Task 15: Documentación (`CLAUDE.md`)

**Files:**
- Modify: `CLAUDE.md` — agregar la entrada de Bitácora de la sesión y actualizar la sección de Backend/Supabase con el nuevo modelo de permisos por asignatura.

- [ ] **Step 1: Agregar a la Bitácora la sesión nueva**

Resumen de lo hecho: el modelo de dueño único pasó a equipo por asignatura (`curso_profesores`), `kimun_prof_es_mio` ahora significa "jefe o admin", los dos porteros nuevos (`kimun_prof_acceso`, `kimun_prof_asignaturas`), el mapa OA→asignatura (`kimun_oa_asignatura`) que de paso hace visibles Vocabulario y Lectura, la gestión de equipo, el ranking por asignatura, y los dos bugs arreglados (refuerzo de Matemática + convención de asignatura canonizada al código). Registrar el resultado de la verificación de la Task 14.

- [ ] **Step 2: Actualizar la sección Backend (Supabase)**

Documentar las tablas y funciones nuevas junto a las existentes: `curso_profesores` (con el índice único de jefe), `kimun_oa_asignatura`, `kimun_prof_acceso`/`_asignaturas`, `kimun_prof_equipo`/`_asignar`/`_quitar`, `kimun_prof_ranking_asignatura`; y anotar que `cursos.profesor_id` quedó deprecada.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "Roles por asignatura: bitacora y documentacion de backend"
```

---

## Auto-revisión del plan (checklist del autor)

**Cobertura del spec:**
- Tabla de membresías + índice único jefe → Task 1 ✓
- `cursos.profesor_id` deprecada, no borrada → Task 1 (nota) ✓
- `kimun_oa_asignatura` + Vocabulario/Lectura visibles → Task 2 ✓
- `kimun_prof_acceso` / `kimun_prof_asignaturas` + membresía sin asignaturas = sin acceso → Task 3 ✓
- Ajuste de todas las funciones de la tabla del spec (listar, dominio, dominio_alumno, dominio_oa, refuerzo_lanzar/cerrar, participacion, alumno_agregar/quitar, xp_fijar, dominio_reiniciar, curso_quitar) → Tasks 3-6 (destructivas heredan `es_mio` redefinido; lecturas y refuerzo ajustadas explícitamente) ✓
- Matriz de permisos (admin/jefe/asignatura) → Tasks 3, 6, 11 ✓
- Gestión de equipo (equipo/asignar/quitar; cambio de jefe respeta el índice único) → Task 7 ✓
- Rotación sin pérdida de datos → Task 7 (nota) + Task 14 pasos 7-8 ✓
- Ranking por asignatura (mínimo 20, cobertura desde el cliente, sin `codigo_acceso`) → Tasks 8, 13 ✓
- Cambios en `profesor.html` (selector según rol, ranking, equipo, ocultar destructivo) → Tasks 11-13 ✓ (el "selector según rol" cae del filtrado del servidor + `filtrosAsignatura` existente)
- Dos bugs (refuerzo de Matemática, dos convenciones de asignatura) → Task 10 ✓
- Migración (jefe desde profesor_id, normalizar desafios.asignatura, huérfanos, idempotencia) → Task 1 ✓
- Verificación (9 pasos del spec) → Task 14 ✓

**Consistencia de tipos/nombres:**
- `kimun_prof_asignaturas` devuelve `text[]`; se compara con `= any(...)` en Tasks 4, 5, 8 ✓
- `kimun_prof_listar` agrega `puede_gestionar boolean, mis_asignaturas text[]`; el cliente lee `f.puede_gestionar` (Task 11) ✓
- `kimun_prof_ranking_asignatura` columnas (`alumno, avatar, resp_1, ok_1, pct, oa_tocados, suficiente`) ↔ `rankingHTML` (Task 13) ✓
- `p_asignatura` viaja como código (`HI08`) desde el cliente (Task 10) y el servidor lo valida contra `kimun_prof_asignaturas` (Task 5) ✓

**Pendiente para el ejecutor:** confirmar los nombres exactos de los helpers de UI (`errorPanel`, `esNoAutorizado`, `aviso`, `esc`) antes de usarlos en las funciones nuevas — todos existen ya en `profesor.html` y se usan en `cargarRefuerzo`; reutilizar esos mismos.
