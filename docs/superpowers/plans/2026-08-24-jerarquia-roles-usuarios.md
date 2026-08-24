# Jerarquía de roles de usuario — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: usa superpowers:subagent-driven-development (recomendado) o superpowers:executing-plans para ejecutar este plan tarea por tarea. Los pasos usan casillas (`- [ ]`).

**Goal:** Agregar un cuarto rol (SuperUsuario, autoridad del colegio) sobre el modelo de la Sesión 37, con la jerarquía Admin ▸ SuperUsuario ▸ Profe Jefe ▸ Profe Asignatura, y un encabezado que muestre usuario · rango · cursos.

**Architecture:** Un nivel global nuevo en la cuenta (`profesores.es_super boolean`, junto al `es_admin` existente) y un portero nuevo `kimun_prof_admin_colegio()` = `es_admin OR es_super`. Las acciones "de colegio" (crear curso, nombrar Jefe, borrar curso, autorizar, gestionar profesores) exigen ese portero; lo destructivo *dentro* de un curso sigue en `kimun_prof_es_mio` (que ahora suma `es_super`). El panel gana la bandera `esAdminColegio`, un encabezado enriquecido, y ajustes en el bloque de equipo (alineación, editar asignaturas, ocultar "Jefe" a quien no es admin de colegio).

**Tech Stack:** PostgreSQL/PL-pgSQL sobre Supabase (`supabase/schema.sql`); HTML/JS vanilla en `profesor.html`.

**Nota de verificación:** sin suite automatizada. Backend = revisión de código + SQL Editor; panel = navegador con stub de `SB.rpc`. La prueba end-to-end con cuentas reales queda para Roberto.

**Fuente de verdad:** `docs/superpowers/specs/2026-08-24-jerarquia-roles-usuarios-design.md`. Este plan lo implementa completo. Se apoya en lo construido en la Sesión 37 (tabla `curso_profesores`, porteros `kimun_prof_es_mio`/`_acceso`/`_asignaturas`).

---

## Estructura de archivos

- **`supabase/schema.sql`** (modificar) — columna `es_super`, portero `kimun_prof_admin_colegio`, ajustes de porteros y funciones, función nueva `kimun_prof_super_fijar`, grants. Idempotente (se re-pega completo).
- **`profesor.html`** (modificar) — bandera `esAdminColegio`, encabezado enriquecido, `kimun_prof_listar` con `mi_rol`, bloque de equipo (alineación + editar + ocultar Jefe), bloque Administración (rango + control de SuperUsuario).
- **`index.html`** — **NO se toca.**
- **`CLAUDE.md`** (modificar) — Bitácora + sección Backend.

**Orden:** Fase 1 backend, Fase 2 panel, Fase 3 verificación/doc. Un commit por tarea (diferidos a la orden 66 según la regla del proyecto).

---

## Convenciones (leer antes de empezar)

1. **Jerarquía:** Admin (`es_admin`) ▸ SuperUsuario (`es_super`) ▸ Profesor. Un Admin cuenta también como admin de colegio.
2. **Dos porteros de nivel colegio:**
   - `kimun_prof_admin_colegio()` = `es_admin OR es_super` → crear/borrar curso, nombrar Jefe, autorizar/gestionar profesores.
   - `es_admin` a secas → crear/quitar SuperUsuarios y Admins, revocar a un Admin/Super.
3. **`kimun_prof_es_mio(curso)`** (destructivo dentro del curso) suma `es_super`: admin ∨ super ∨ Jefe.
4. **Idempotencia:** `add column if not exists`; funciones `create or replace`; las `returns table` que cambian de columnas llevan su `drop function if exists` (ya lo tienen las que se tocan).
5. **Ubicar por ancla**, no por número de línea. **No commitear** (regla del proyecto).

---

# FASE 1 · Backend (`supabase/schema.sql`)

### Task 1: Columna `es_super` y portero `kimun_prof_admin_colegio`

**Files:**
- Modify: `supabase/schema.sql` — la columna junto a la tabla `profesores` (tras su `create table`, ~línea 86); el portero junto a los otros porteros del profesor (tras `kimun_prof_asignaturas`, que la Sesión 37 dejó ~línea 602).

- [ ] **Step 1: Agregar la columna `es_super`**

Insertar justo después del `create table if not exists public.profesores (...)`:

```sql
-- Nivel SuperUsuario (Sesión 38): la autoridad del colegio (UTP/dirección).
-- Jerarquía: Admin (es_admin) > SuperUsuario (es_super) > Profesor. Se conserva
-- es_admin; un Admin cuenta también como administrador del colegio.
alter table public.profesores add column if not exists es_super boolean not null default false;
```

- [ ] **Step 2: Agregar el portero `kimun_prof_admin_colegio`**

Insertar inmediatamente después de la definición de `kimun_prof_asignaturas` (Sesión 37):

```sql
-- ¿Administra el colegio? (crear/borrar curso, nombrar Jefe, autorizar y gestionar
-- profesores). Admin y SuperUsuario pasan; un Jefe NO. Crear/quitar SuperUsuarios y
-- Admins queda aparte, solo para es_admin.
create or replace function public.kimun_prof_admin_colegio()
returns boolean language sql security definer stable set search_path=public as $$
  select exists(select 1 from public.profesores pr
                where pr.id = auth.uid() and (pr.es_admin or pr.es_super));
$$;
```

- [ ] **Step 3: Revocar de PUBLIC el portero nuevo**

En el bloque `revoke execute on function … from public;` (el que la Sesión 37 dejó con `kimun_prof_acceso`/`_asignaturas`), agregar `public.kimun_prof_admin_colegio()` a la lista.

- [ ] **Step 4: Verificar en el SQL Editor**

```sql
-- La columna existe
select column_name from information_schema.columns
where table_name='profesores' and column_name='es_super';   -- 1 fila
-- El portero compila y sin sesión niega
select public.kimun_prof_admin_colegio();                    -- false
```

- [ ] **Step 5: Commit**

```bash
git add supabase/schema.sql
git commit -m "Jerarquia de roles: columna es_super + portero admin_colegio (Fase 1)"
```

---

### Task 2: `es_super` sube a los porteros de lectura y a `kimun_prof_listar`

**Files:**
- Modify: `supabase/schema.sql` — `kimun_prof_es_mio`, `kimun_prof_acceso`, `kimun_prof_asignaturas`, `kimun_prof_listar` (todas de la Sesión 37).

- [ ] **Step 1: `kimun_prof_es_mio` suma `es_super`**

Reemplazar su cuerpo por:

```sql
create or replace function public.kimun_prof_es_mio(p_curso uuid)
returns boolean language sql security definer stable set search_path=public as $$
  select exists(select 1 from public.profesores pr
                where pr.id = auth.uid() and (pr.es_admin or pr.es_super))
      or exists(select 1 from public.curso_profesores cp
                where cp.curso_id = p_curso and cp.profesor_id = auth.uid()
                  and cp.rol = 'jefe');
$$;
```

- [ ] **Step 2: `kimun_prof_acceso` suma `es_super`**

En su primer `exists(... pr.es_admin)`, cambiar por `(pr.es_admin or pr.es_super)`:

```sql
create or replace function public.kimun_prof_acceso(p_curso uuid)
returns boolean language sql security definer stable set search_path=public as $$
  select exists(select 1 from public.profesores pr
                where pr.id = auth.uid() and (pr.es_admin or pr.es_super))
      or exists(select 1 from public.curso_profesores cp
                where cp.curso_id = p_curso and cp.profesor_id = auth.uid()
                  and (cp.rol = 'jefe' or coalesce(array_length(cp.asignaturas,1),0) >= 1));
$$;
```

- [ ] **Step 3: `kimun_prof_asignaturas` suma `es_super`**

En la primera rama del `case` (`when exists(... pr.es_admin) then array[...]`), cambiar por `(pr.es_admin or pr.es_super)`:

```sql
create or replace function public.kimun_prof_asignaturas(p_curso uuid)
returns text[] language sql security definer stable set search_path=public as $$
  select case
    when exists(select 1 from public.profesores pr
                where pr.id = auth.uid() and (pr.es_admin or pr.es_super))
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

- [ ] **Step 4: `kimun_prof_listar` suma `es_super` y la columna `mi_rol`**

Reemplazar completa (conserva su `drop function if exists` previo):

```sql
drop function if exists public.kimun_prof_listar();
create or replace function public.kimun_prof_listar()
returns table(curso text, curso_codigo text, alumno text, avatar text,
              codigo_acceso text, xp int, dificil int,
              puede_gestionar boolean, mis_asignaturas text[], mi_rol text)
language plpgsql security definer set search_path=public as $$
declare yo public.profesores; begin
  select * into yo from public.profesores where id = auth.uid();
  if yo.id is null then raise exception 'no_autorizado'; end if;
  return query
    select c.nombre, c.codigo, p.nombre, p.avatar, p.codigo_acceso, p.xp, p.dificil,
           public.kimun_prof_es_mio(c.id),
           public.kimun_prof_asignaturas(c.id),
           -- Mi rol en ESTE curso: 'jefe' | 'asignatura' | null (admin/super sin membresía).
           (select cp.rol from public.curso_profesores cp
             where cp.curso_id = c.id and cp.profesor_id = yo.id)
    from public.cursos c
    left join public.perfiles p on p.curso_id = c.id
    where yo.es_admin or yo.es_super
       or exists(select 1 from public.curso_profesores cp
                 where cp.curso_id = c.id and cp.profesor_id = yo.id
                   and (cp.rol='jefe' or coalesce(array_length(cp.asignaturas,1),0) >= 1))
    order by c.nombre, p.xp desc nulls last, p.nombre;
end $$;
```

- [ ] **Step 5: Verificar en el SQL Editor**

```sql
select proname, pg_get_function_result(oid) from pg_proc where proname='kimun_prof_listar';
-- El resultado incluye mi_rol text
select public.kimun_prof_es_mio(gen_random_uuid());   -- false sin sesión
```

- [ ] **Step 6: Commit**

```bash
git add supabase/schema.sql
git commit -m "Jerarquia de roles: es_super en porteros de lectura + mi_rol en listar (Fase 1)"
```

---

### Task 3: Acciones "de colegio" exigen `admin_colegio`

**Files:**
- Modify: `supabase/schema.sql` — `kimun_prof_curso_crear`, `kimun_prof_curso_quitar`, `kimun_prof_equipo_asignar`, `kimun_prof_equipo_quitar`, `kimun_prof_autorizar`, `kimun_prof_profesores`, `kimun_prof_quitar`.

- [ ] **Step 1: `kimun_prof_curso_crear` — solo admin de colegio, sin auto-Jefe**

Reemplazar su cuerpo por (nota: la Sesión 37 le había agregado el auto-insert de Jefe; **se elimina**):

```sql
create or replace function public.kimun_prof_curso_crear(p_nombre text)
returns public.cursos language plpgsql security definer set search_path=public as $$
declare r public.cursos; begin
  if not public.kimun_prof_admin_colegio() then raise exception 'no_autorizado'; end if;
  if coalesce(trim(p_nombre),'') = '' then raise exception 'nombre_vacio'; end if;
  -- El curso nace SIN Jefe: quien lo crea (Admin/Super) no es Jefe de aula.
  -- profesor_id queda nulo; el Jefe se nombra después con kimun_prof_equipo_asignar.
  insert into public.cursos(nombre, codigo)
  values (trim(p_nombre), public.kimun_gen_codigo_curso()) returning * into r;
  return r; end $$;
```

- [ ] **Step 2: `kimun_prof_curso_quitar` (borrar) — `admin_colegio`**

Cambiar su portero. Reemplazar el `if cid is null or not public.kimun_prof_es_mio(cid) then …` por:

```sql
  if cid is null or not public.kimun_prof_admin_colegio() then raise exception 'no_autorizado'; end if;
```
(El resto de la función queda igual.)

- [ ] **Step 3: `kimun_prof_equipo_asignar` — nombrar Jefe exige `admin_colegio`**

Añadir la validación tras resolver `cid` y `pid`, según el rol pedido. Reemplazar el cuerpo por:

```sql
create or replace function public.kimun_prof_equipo_asignar(
  p_curso_codigo text, p_correo text, p_rol text, p_asignaturas text[])
returns void language plpgsql security definer set search_path=public as $$
declare cid uuid; pid uuid; rol text; asigs text[]; begin
  select id into cid from public.cursos where codigo = upper(trim(p_curso_codigo));
  if cid is null then raise exception 'no_autorizado'; end if;
  rol := case when p_rol = 'jefe' then 'jefe' else 'asignatura' end;
  -- Nombrar Jefe = solo Admin/SuperUsuario. Agregar/editar profe de asignatura = jefe/super/admin.
  if rol = 'jefe' then
    if not public.kimun_prof_admin_colegio() then raise exception 'no_autorizado'; end if;
  else
    if not public.kimun_prof_es_mio(cid) then raise exception 'no_autorizado'; end if;
  end if;
  select id into pid from public.profesores where lower(correo) = lower(trim(coalesce(p_correo,'')));
  if pid is null then raise exception 'profesor_invalido'; end if;
  asigs := case when rol = 'jefe' then '{}'::text[] else coalesce(p_asignaturas,'{}'::text[]) end;
  if rol = 'jefe' then
    update public.curso_profesores set rol='asignatura'
     where curso_id = cid and rol='jefe' and profesor_id <> pid;
  end if;
  insert into public.curso_profesores(curso_id, profesor_id, rol, asignaturas)
  values (cid, pid, rol, asigs)
  on conflict (curso_id, profesor_id) do update
    set rol = excluded.rol, asignaturas = excluded.asignaturas;
end $$;
```

- [ ] **Step 4: `kimun_prof_equipo_quitar` — quitar Jefe exige `admin_colegio`**

Reemplazar el cuerpo por:

```sql
create or replace function public.kimun_prof_equipo_quitar(p_curso_codigo text, p_correo text)
returns int language plpgsql security definer set search_path=public as $$
declare cid uuid; pid uuid; rol_obj text; n int; begin
  select id into cid from public.cursos where codigo = upper(trim(p_curso_codigo));
  if cid is null then raise exception 'no_autorizado'; end if;
  select id into pid from public.profesores where lower(correo) = lower(trim(coalesce(p_correo,'')));
  if pid is null then raise exception 'profesor_invalido'; end if;
  select rol into rol_obj from public.curso_profesores where curso_id=cid and profesor_id=pid;
  -- Quitar al Jefe = solo Admin/Super; quitar un profe de asignatura = jefe/super/admin.
  if rol_obj = 'jefe' then
    if not public.kimun_prof_admin_colegio() then raise exception 'no_autorizado'; end if;
  else
    if not public.kimun_prof_es_mio(cid) then raise exception 'no_autorizado'; end if;
  end if;
  delete from public.curso_profesores where curso_id = cid and profesor_id = pid;
  get diagnostics n = row_count; return n;
end $$;
```

- [ ] **Step 5: `kimun_prof_autorizar` y `kimun_prof_profesores` — `admin_colegio`; profesores devuelve `es_super`**

En `kimun_prof_autorizar`, cambiar la guarda `if yo.id is null or not yo.es_admin then` por:

```sql
  if not public.kimun_prof_admin_colegio() then raise exception 'no_autorizado'; end if;
```
(Se puede quitar el `select … into yo` si ya no se usa; si se usa para `invitado_por`, conservar el `select yo` y solo cambiar la condición a `if yo.id is null or not (yo.es_admin or yo.es_super) then`.)

En `kimun_prof_profesores`, cambiar la guarda igual y **agregar `es_super`** al `returns table` y al `select` (lleva su `drop function if exists` previo):

```sql
drop function if exists public.kimun_prof_profesores();
create or replace function public.kimun_prof_profesores()
returns table(correo text, nombre text, es_admin boolean, es_super boolean, cursos int, registrado boolean)
language plpgsql security definer set search_path=public as $$
declare yo public.profesores; begin
  select * into yo from public.profesores where id = auth.uid();
  if yo.id is null or not (yo.es_admin or yo.es_super) then raise exception 'no_autorizado'; end if;
  return query
    select coalesce(a.correo, p.correo), p.nombre, coalesce(p.es_admin,false), coalesce(p.es_super,false),
           (select count(*)::int from public.cursos c where c.profesor_id = p.id),
           (p.id is not null)
    from public.profesores_autorizados a
    full outer join public.profesores p on lower(p.correo) = lower(a.correo)
    order by coalesce(a.creado, p.creado);
end $$;
```

- [ ] **Step 6: `kimun_prof_quitar` (revocar) — `admin_colegio`, pero no puede tocar Admin/Super salvo el Admin**

Reemplazar el cuerpo por:

```sql
create or replace function public.kimun_prof_quitar(p_correo text)
returns int language plpgsql security definer set search_path=public as $$
declare yo public.profesores; obj public.profesores; n int; begin
  select * into yo from public.profesores where id = auth.uid();
  if yo.id is null or not (yo.es_admin or yo.es_super) then raise exception 'no_autorizado'; end if;
  if lower(trim(coalesce(p_correo,''))) = lower(yo.correo) then raise exception 'no_te_puedes_quitar'; end if;
  select * into obj from public.profesores where lower(correo) = lower(trim(coalesce(p_correo,'')));
  -- Un SuperUsuario no puede revocar a un Admin ni a otro SuperUsuario: eso es solo del Admin.
  if obj.id is not null and (obj.es_admin or obj.es_super) and not yo.es_admin then
    raise exception 'no_autorizado';
  end if;
  delete from public.profesores where lower(correo) = lower(trim(coalesce(p_correo,'')));
  get diagnostics n = row_count;
  delete from public.profesores_autorizados where lower(correo) = lower(trim(coalesce(p_correo,'')));
  return n; end $$;
```

- [ ] **Step 7: Verificar en el SQL Editor**

```sql
-- Firmas nuevas
select proname, pg_get_function_result(oid) from pg_proc
where proname in ('kimun_prof_profesores') ;   -- incluye es_super boolean
-- Sin sesión, todo niega
select public.kimun_prof_curso_crear('x');      -- ERROR no_autorizado
```

- [ ] **Step 8: Commit**

```bash
git add supabase/schema.sql
git commit -m "Jerarquia de roles: acciones de colegio exigen admin_colegio (Fase 1)"
```

---

### Task 4: `kimun_prof_super_fijar` (nombrar/quitar SuperUsuario) + grant

**Files:**
- Modify: `supabase/schema.sql` — insertar junto a las otras funciones de administración (cerca de `kimun_prof_quitar`); agregar al bloque `grant`.

- [ ] **Step 1: Agregar la función**

```sql
-- Nombra o quita un SuperUsuario. Solo el Admin (dueño de la plataforma). No toca
-- cuentas de Admin: no se degrada ni asciende un Admin por esta vía.
create or replace function public.kimun_prof_super_fijar(p_correo text, p_es_super boolean)
returns void language plpgsql security definer set search_path=public as $$
declare yo public.profesores; obj public.profesores; begin
  select * into yo from public.profesores where id = auth.uid();
  if yo.id is null or not yo.es_admin then raise exception 'no_autorizado'; end if;
  select * into obj from public.profesores where lower(correo) = lower(trim(coalesce(p_correo,'')));
  if obj.id is null then raise exception 'profesor_invalido'; end if;
  if obj.es_admin then raise exception 'no_autorizado'; end if;  -- un Admin no se toca por aquí
  update public.profesores set es_super = coalesce(p_es_super,false)
   where id = obj.id;
end $$;
```

- [ ] **Step 2: Agregar al `grant`**

En el bloque `grant execute on function … to anon, authenticated;`, antes del `to anon, authenticated;`, agregar:

```sql
  , public.kimun_prof_super_fijar(text,boolean)
```

- [ ] **Step 3: Verificar en el SQL Editor**

```sql
select public.kimun_prof_super_fijar('x@y.cl', true);   -- ERROR no_autorizado (sin sesión)
select p.proname from pg_proc p
where p.proname='kimun_prof_super_fijar'
  and has_function_privilege('authenticated', p.oid, 'execute');   -- 1 fila
```

- [ ] **Step 4: Commit — cierra Fase 1**

```bash
git add supabase/schema.sql
git commit -m "Jerarquia de roles: kimun_prof_super_fijar + grant (cierra Fase 1)"
```

**Checkpoint Fase 1:** re-pegar el `schema.sql` completo y confirmar que corre sin errores (idempotencia).

---

# FASE 2 · Panel (`profesor.html`)

> Verificación con stub de `SB.rpc` en el navegador; end-to-end real es de Roberto.

### Task 5: Bandera `esAdminColegio`, encabezado enriquecido y `mi_rol`

**Files:**
- Modify: `profesor.html` — `cargarPanel` (encabezado, ~línea 294-302), `pintarLista` (usa `mi_rol`/`mis_asignaturas`).

- [ ] **Step 1: Bandera de cliente y rango en el encabezado**

En `cargarPanel`, tras `YO = await soyProfesor()`, definir el rango y la bandera. Reemplazar las líneas del `#profId` y `#panelTitulo` por:

```javascript
  const esAdminColegio = !!(YO.es_admin || YO.es_super);
  window.ESADMINCOLEGIO = esAdminColegio;   // usado por pintarLista y el bloque de equipo
  const rango = YO.es_admin ? 'Administrador' : (YO.es_super ? 'SuperUsuario' : 'Profesor');
  $('profId').textContent = '👤 ' + (YO.nombre || YO.correo) + ' — ' + rango;
  $('panelTitulo').textContent = esAdminColegio ? 'Todos los cursos' : 'Mis cursos';
```

> Nota: si `YO.es_super` no viene, es que `kimun_prof_yo` no trae la columna — pero `kimun_prof_yo` devuelve la fila completa de `profesores`, así que `es_super` llega solo tras la Fase 1. Verificarlo en el Step 4.

- [ ] **Step 2: Encabezado con cursos (usar `mi_rol` + `mis_asignaturas`)**

En `pintarLista`, tras armar `porCurso` y `cursos`, construir el resumen de cursos del encabezado. Guardar `mi_rol` en `porCurso` (junto a `gestiono`):

```javascript
  const porCurso={};
  (data||[]).forEach(f=>{
    porCurso[f.curso_codigo]=porCurso[f.curso_codigo]||
      {nombre:f.curso, alumnos:[], gestiono:f.puede_gestionar, miRol:f.mi_rol, misAsig:f.mis_asignaturas};
    if(f.codigo_acceso) porCurso[f.curso_codigo].alumnos.push(f);
  });
```

Y, después de pintar la lista, completar el encabezado con los cursos (append al `#profId`):

```javascript
  // Cursos en el encabezado: Admin/Super → "Todos los cursos"; Profesor → sus cursos con su rol.
  if(window.ESADMINCOLEGIO){
    $('profId').textContent += ' · Todos los cursos';
  }else{
    const trozos = cursos.map(([cod,c])=>{
      const rol = c.miRol==='jefe' ? 'Jefe'
        : (c.misAsig&&c.misAsig.length ? c.misAsig.map(a=>ASIG_NOMBRE[a]||a).join(', ') : '—');
      return c.nombre+' ('+rol+')';
    });
    if(trozos.length) $('profId').textContent += ' · ' + trozos.join(' · ');
  }
```

**Nota:** `ASIG_NOMBRE` se define más abajo en el archivo (490-491); como `pintarLista` corre tras la carga completa, ya está inicializado.

- [ ] **Step 3: (idempotencia visual) el encabezado se reconstruye cada `pintarLista`**

`pintarLista` corre varias veces (tras acciones). Como el Step 2 hace `+=` sobre `#profId`, hay que **fijar la base del texto antes de anexar**, para no acumular. En `cargarPanel` ya se fija el texto base con el rango (Step 1). Al inicio de `pintarLista`, tras `$('profId').classList.remove('hide')`, re-fijar la base:

```javascript
  // Base del encabezado (sin cursos): se re-fija en cada render para no acumular.
  const rango = YO.es_admin ? 'Administrador' : (YO.es_super ? 'SuperUsuario' : 'Profesor');
  $('profId').textContent = '👤 ' + (YO.nombre || YO.correo) + ' — ' + rango;
```

- [ ] **Step 4: Verificar en el navegador (stub)**

```javascript
// Admin
YO={id:'a',nombre:'Roberto',es_admin:true,es_super:false};
window.ESADMINCOLEGIO=true;
SB.rpc=async(fn)=> fn==='kimun_prof_listar' ? {data:[
  {curso:'8°A',curso_codigo:'CUR-A',alumno:'Ana',avatar:'🦊',codigo_acceso:'ALU-1',xp:0,dificil:0,puede_gestionar:true,mis_asignaturas:['HI08','CN08','MA08','LE08'],mi_rol:null}
]}:{data:[]};
await pintarLista();
$('profId').textContent;   // "👤 Roberto — Administrador · Todos los cursos"

// Profesor (Jefe en A, asignatura en B)
YO={id:'p',nombre:'Beto',es_admin:false,es_super:false}; window.ESADMINCOLEGIO=false;
SB.rpc=async(fn)=> fn==='kimun_prof_listar' ? {data:[
  {curso:'8°A',curso_codigo:'CUR-A',alumno:'x',avatar:'🦊',codigo_acceso:'ALU-1',xp:0,dificil:0,puede_gestionar:true, mis_asignaturas:['HI08','CN08','MA08','LE08'],mi_rol:'jefe'},
  {curso:'8°B',curso_codigo:'CUR-B',alumno:'y',avatar:'🦊',codigo_acceso:'ALU-2',xp:0,dificil:0,puede_gestionar:false,mis_asignaturas:['MA08','CN08'],mi_rol:'asignatura'}
]}:{data:[]};
await pintarLista();
$('profId').textContent;   // "👤 Beto — Profesor · 8°A (Jefe) · 8°B (Matemáticas, Ciencias)"
```
Expected: los textos coinciden. Sin errores de consola.

- [ ] **Step 5: Commit**

```bash
git add profesor.html
git commit -m "Jerarquia de roles: encabezado con rango y cursos + bandera esAdminColegio (Fase 2)"
```

---

### Task 6: Ocultar "Crear curso" y "Borrar curso" a quien no administra el colegio

**Files:**
- Modify: `profesor.html` — `pintarLista` (botón "+ Crear curso" del pie y el 🗑️ de cada curso).

- [ ] **Step 1: "+ Crear curso" solo para admin de colegio**

En `pintarLista`, el pie con `#cursoNombre` + `#btnCurso` (que hoy se agrega siempre) se envuelve en `esAdminColegio`. Reemplazar ese bloque por:

```javascript
   + (window.ESADMINCOLEGIO ? `<div style="margin-top:10px;border-top:1px solid #ffffff22;padding-top:12px">
        <input id="cursoNombre" placeholder="Nombre del curso nuevo (8° A)">
        <button class="btn sec" id="btnCurso">+ Crear curso</button>
      </div>` : '');
```

**Ojo:** `conectarAcciones` hace `$('btnCurso').onclick=…` sin comprobar existencia. Protegerlo: en `conectarAcciones`, envolver ese handler en `const bc=$('btnCurso'); if(bc) bc.onclick=…`.

- [ ] **Step 2: 🗑️ Borrar curso solo para admin de colegio**

El 🗑️ hoy se dibuja con `c.gestiono`. Cambiarlo a `window.ESADMINCOLEGIO`:

```javascript
        ${window.ESADMINCOLEGIO?`<button class="ico ico-del delcurso" data-cod="${esc(cod)}" title="Eliminar curso">🗑️</button>`:''}
```
(Lo demás destructivo del alumno —✎, ✕, agregar, masivo— y el 🔄 reiniciar siguen con `c.gestiono`.)

- [ ] **Step 3: Verificar en el navegador (stub)**

```javascript
// Como Jefe (gestiono=true) pero NO admin de colegio: NO ve crear ni borrar
YO={id:'p',nombre:'Beto',es_admin:false,es_super:false}; window.ESADMINCOLEGIO=false;
SB.rpc=async(fn)=> fn==='kimun_prof_listar'?{data:[
  {curso:'8°A',curso_codigo:'CUR-A',alumno:'x',avatar:'🦊',codigo_acceso:'ALU-1',xp:0,dificil:0,puede_gestionar:true,mis_asignaturas:['HI08'],mi_rol:'jefe'}]}:{data:[]};
await pintarLista();
document.getElementById('btnCurso');                                   // null
document.querySelector('details.curso[data-cod="CUR-A"] .delcurso');    // null
document.querySelector('details.curso[data-cod="CUR-A"] .add-alumno');  // existe (Jefe conserva)

// Como SuperUsuario: SÍ ve crear y borrar
YO.es_super=true; window.ESADMINCOLEGIO=true;
await pintarLista();
document.getElementById('btnCurso');                                   // existe
document.querySelector('details.curso[data-cod="CUR-A"] .delcurso');    // existe
```
Expected: como Jefe no aparecen crear/borrar pero sí agregar-alumno; como Super, sí. Sin errores.

- [ ] **Step 4: Commit**

```bash
git add profesor.html
git commit -m "Jerarquia de roles: crear y borrar curso solo para admin de colegio (Fase 2)"
```

---

### Task 7: Bloque de equipo — alineación, editar asignaturas y ocultar "Jefe"

**Files:**
- Modify: `profesor.html` — CSS del formulario de equipo; `cargarEquipo` (radios/casillas, editar, ✕ del Jefe).

- [ ] **Step 1: Arreglar la alineación del formulario**

Agregar al CSS del archivo (junto a las otras reglas del panel) reglas para que radio/casilla queden junto a su etiqueta:

```css
.equipo-cuerpo label{display:inline-flex;align-items:center;gap:6px}
.equipo-cuerpo .eq-casillas{display:flex;flex-wrap:wrap;gap:4px 12px}
.equipo-cuerpo input[type=radio],.equipo-cuerpo input[type=checkbox]{width:auto;margin:0}
```
(La causa hoy es que el CSS global pone `width:100%`/`display:block` a los `input`; estas reglas lo anulan solo dentro del equipo.)

- [ ] **Step 2: Ocultar la opción "Profesor Jefe" a quien no es admin de colegio; editar asignaturas; ✕ del Jefe**

Reemplazar `cargarEquipo` por esta versión (cambios marcados en comentarios):

```javascript
async function cargarEquipo(cursoCodigo){
  const caja=document.querySelector('.equipo-cuerpo[data-cod="'+cursoCodigo+'"]');
  if(!caja) return;
  caja.innerHTML='<p style="color:var(--dim);font-size:12px">Cargando…</p>';
  let equipo=[];
  try{
    const {data,error}=await SB.rpc('kimun_prof_equipo',{p_curso_codigo:cursoCodigo});
    if(error) throw error; equipo=data||[];
  }catch(e){ caja.innerHTML='<p style="color:var(--pink);font-size:12px">'+errorPanel(e)+'</p>'; return; }
  const puedeJefe = !!window.ESADMINCOLEGIO;   // solo Admin/Super nombran o quitan Jefe
  const filas=equipo.map(m=>{
    const esJefe = m.rol==='jefe';
    const asigs = esJefe ? 'todas las asignaturas'
      : (m.asignaturas&&m.asignaturas.length ? m.asignaturas.map(a=>ASIG_NOMBRE[a]||a).join(', ')
                                             : 'sin asignaturas');
    // El ✕ del Jefe solo lo ve Admin/Super; el de asignatura, cualquiera que gestione.
    const puedeQuitar = esJefe ? puedeJefe : true;
    // Editar solo aplica a profes de asignatura (el Jefe alcanza todas).
    const btnEditar = esJefe ? '' :
      `<button class="ico eq-editar" data-cod="${esc(cursoCodigo)}" data-correo="${esc(m.correo)}"
        data-asig="${esc((m.asignaturas||[]).join('|'))}" title="Editar asignaturas" style="color:var(--gold)">✎</button>`;
    return `<div class="equipo-fila" style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:4px 0;font-size:13px">
      <b style="color:var(--gold)">${esJefe?'⭐ ':''}${esc(m.nombre||m.correo)}</b>
      <span style="color:var(--dim)">${esc(asigs)}</span>
      <span style="margin-left:auto"></span>
      ${btnEditar}
      ${puedeQuitar?`<button class="ico ico-del eq-quitar" data-cod="${esc(cursoCodigo)}" data-correo="${esc(m.correo)}" title="Quitar del curso">✕</button>`:''}
    </div>`;
  }).join('');
  const casillas=ASIG_ORDEN.map(a=>
    `<label style="font-size:12px"><input type="checkbox" class="eq-asig" value="${a}"> ${ASIG_NOMBRE[a]}</label>`).join('');
  // El radio de rol solo aparece si puede nombrar Jefe; si no, se fuerza 'asignatura'.
  const selectorRol = puedeJefe ? `
      <div style="margin:6px 0">
        <label style="font-size:12px;margin-right:10px"><input type="radio" name="eqrol-${esc(cursoCodigo)}" class="eq-rol" value="asignatura" checked> Profe de asignatura</label>
        <label style="font-size:12px"><input type="radio" name="eqrol-${esc(cursoCodigo)}" class="eq-rol" value="jefe"> Profesor Jefe</label>
      </div>` : '';
  caja.innerHTML=`${filas||'<p style="color:var(--dim);font-size:12px">Solo estás tú.</p>'}
    <div style="margin-top:8px;border-top:1px solid #ffffff22;padding-top:8px">
      <input class="eq-correo" type="email" placeholder="Correo del profesor (ya registrado)" style="width:100%">
      ${selectorRol}
      <div class="eq-casillas" style="margin:0 0 6px">${casillas}</div>
      <button class="btn sec eq-asignar" data-cod="${esc(cursoCodigo)}">+ Agregar al equipo</button>
    </div>`;
  caja.querySelectorAll('.eq-quitar').forEach(b=>b.onclick=()=>equipoQuitar(b.dataset.cod, b.dataset.correo));
  // Editar: precarga correo + casillas y cambia el botón a "Guardar cambios".
  caja.querySelectorAll('.eq-editar').forEach(b=>b.onclick=()=>{
    caja.querySelector('.eq-correo').value=b.dataset.correo;
    const marcadas=new Set((b.dataset.asig||'').split('|').filter(Boolean));
    caja.querySelectorAll('.eq-asig').forEach(c=>c.checked=marcadas.has(c.value));
    if(puedeJefe){ const r=caja.querySelector('.eq-rol[value="asignatura"]'); if(r) r.checked=true; }
    const bt=caja.querySelector('.eq-asignar'); bt.textContent='Guardar cambios';
    caja.querySelector('.eq-correo').focus();
  });
  caja.querySelector('.eq-asignar').onclick=()=>{
    const correo=(caja.querySelector('.eq-correo').value||'').trim();
    if(!correo){ aviso('Escribe el correo del profesor.'); return; }
    const rolEl=caja.querySelector('.eq-rol:checked');
    const rol = rolEl ? rolEl.value : 'asignatura';   // sin selector → asignatura
    const asigs=[...caja.querySelectorAll('.eq-asig:checked')].map(c=>c.value);
    if(rol==='asignatura' && !asigs.length){ aviso('Marca al menos una asignatura.'); return; }
    equipoAsignar(cursoCodigo, correo, rol, asigs);
  };
}
```

(Las funciones `equipoAsignar` y `equipoQuitar` no cambian.)

- [ ] **Step 3: Verificar en el navegador (stub)**

```javascript
// Como Jefe (no admin de colegio): NO ve la opción "Profesor Jefe", ni ✕ sobre el Jefe
window.ESADMINCOLEGIO=false;
SB.rpc=async(fn)=> fn==='kimun_prof_equipo'?{data:[
  {correo:'jefe@x.cl',nombre:'Jefa',rol:'jefe',asignaturas:[]},
  {correo:'cn@x.cl',nombre:'Ciencias',rol:'asignatura',asignaturas:['CN08']}]}:{data:null};
// hace falta un contenedor .equipo-cuerpo[data-cod="CUR-A"] en el DOM (créalo o usa pintarLista)
document.body.insertAdjacentHTML('beforeend','<div class="equipo-cuerpo" data-cod="CUR-A"></div>');
await cargarEquipo('CUR-A');
const box=document.querySelector('.equipo-cuerpo[data-cod="CUR-A"]');
box.querySelector('.eq-rol');                                  // null (sin opción Jefe)
box.querySelectorAll('.eq-quitar').length;                     // 1 (solo el de Ciencias; el Jefe no)
box.querySelectorAll('.eq-editar').length;                     // 1 (solo Ciencias)

// Como Super: SÍ ve la opción Jefe y el ✕ del Jefe
window.ESADMINCOLEGIO=true;
await cargarEquipo('CUR-A');
box.querySelector('.eq-rol');                                  // existe
box.querySelectorAll('.eq-quitar').length;                     // 2
// Editar precarga
box.querySelector('.eq-editar').click();
box.querySelector('.eq-correo').value;                          // 'cn@x.cl'
box.querySelector('.eq-asig[value="CN08"]').checked;            // true
box.querySelector('.eq-asignar').textContent;                  // 'Guardar cambios'
```
Expected: como Jefe no hay opción Jefe ni ✕ sobre el Jefe; como Super sí; el ✎ precarga. Sin desborde a 375 px, sin errores.

- [ ] **Step 4: Commit**

```bash
git add profesor.html
git commit -m "Jerarquia de roles: equipo alineado + editar asignaturas + ocultar Jefe (Fase 2)"
```

---

### Task 8: Bloque Administración — rango y control de SuperUsuario

**Files:**
- Modify: `profesor.html` — `pintarLista`, bloque `if(YO.es_admin){…}` (378-406). Pasa a `if(esAdminColegio)` para que el Super vea Administración, y el control de SuperUsuario queda dentro de un `if(YO.es_admin)`.

- [ ] **Step 1: Mostrar Administración a admin de colegio; rango y control de Super en la lista**

Cambiar la condición del bloque de `if(YO.es_admin){` a `if(window.ESADMINCOLEGIO){`. Dentro, la lista de profesores (que ahora trae `es_super`) muestra el rango, y **solo el Admin** ve el botón para nombrar/quitar SuperUsuario. Reemplazar el render de `$('profes')` por:

```javascript
      $('profes').innerHTML=(profes||[]).map(p=>{
        const rango = p.es_admin ? 'Administrador' : (p.es_super ? 'SuperUsuario' : (p.registrado?'Profesor':'sin registrar'));
        // Solo el Admin puede cambiar el rol de SuperUsuario, y no sobre un Admin.
        const btnSuper = (YO.es_admin && p.registrado && !p.es_admin)
          ? `<button class="btn-chip super-toggle" data-correo="${esc(p.correo)}" data-on="${p.es_super?'0':'1'}">${p.es_super?'Quitar Super':'Hacer Super'}</button>`
          : '';
        return `<div style="display:flex;gap:8px;align-items:center;padding:4px 0;font-size:13px;flex-wrap:wrap">
           <span class="pro-nom">${esc(p.correo)}</span>
           <span style="color:var(--dim)">${esc(rango)}</span>
           <span style="color:var(--cyan)">${p.cursos} curso${p.cursos===1?'':'s'}</span>
           ${btnSuper}
         </div>`;
      }).join('');
      document.querySelectorAll('.super-toggle').forEach(b=>b.onclick=async ()=>{
        const hacer=b.dataset.on==='1';
        if(!confirm(hacer?'¿Nombrar SuperUsuario a este profesor? Podrá administrar todos los cursos del colegio.'
                         :'¿Quitarle el rol de SuperUsuario?')) return;
        await accion(()=>SB.rpc('kimun_prof_super_fijar',{p_correo:b.dataset.correo, p_es_super:hacer}),
                     hacer?'Ahora es SuperUsuario':'Ya no es SuperUsuario');
      });
```

**Nota:** el botón "🧹 Limpiar perfiles de prueba" es de plataforma (`kimun_prof_limpiar_pruebas`, solo `es_admin`). Dejarlo dentro de un `if(YO.es_admin)` para que el SuperUsuario **no** lo vea. Envolver ese botón y su handler en `if(YO.es_admin)`.

- [ ] **Step 2: Verificar en el navegador (stub)**

```javascript
// Como Super: ve Administración (autorizar + lista) pero NO el toggle de Super ni Limpiar
YO={id:'s',nombre:'UTP',es_admin:false,es_super:true}; window.ESADMINCOLEGIO=true;
SB.rpc=async(fn)=>{
  if(fn==='kimun_prof_listar') return {data:[]};
  if(fn==='kimun_prof_profesores') return {data:[
    {correo:'a@x.cl',nombre:'Ana',es_admin:false,es_super:false,cursos:1,registrado:true},
    {correo:'b@x.cl',nombre:'Beto',es_admin:false,es_super:true, cursos:0,registrado:true}]};
  return {data:[]};
};
await pintarLista();
document.getElementById('btnAutorizar');           // existe (Super autoriza)
document.querySelectorAll('.super-toggle').length; // 0 (Super no cambia roles Super)
document.getElementById('btnLimpiar');             // null (solo Admin)

// Como Admin: ve el toggle de Super y Limpiar
YO={id:'a',nombre:'Roberto',es_admin:true,es_super:false};
await pintarLista();
document.querySelectorAll('.super-toggle').length; // 2 (a y b, ninguno admin)
document.getElementById('btnLimpiar');             // existe
```
Expected: coincide. Sin errores.

- [ ] **Step 3: Commit — cierra Fase 2**

```bash
git add profesor.html
git commit -m "Jerarquia de roles: Administracion para Super + control de SuperUsuario del Admin (cierra Fase 2)"
```

---

# FASE 3 · Verificación y documentación

### Task 9: Verificación end-to-end (Roberto, cuentas reales)

Sigue la sección "Verificación" del spec, sobre `CUR-BA04` y las cuentas `profe-prueba*`.

**Files:** ninguno.

- [ ] **Step 1:** Como Admin, nombra SuperUsuario a `profe-prueba` (Administración → "Hacer Super").
- [ ] **Step 2:** Entra como `profe-prueba` (Super): ve todos los cursos, puede crear curso y nombrar Jefe, ve Administración y autoriza; **no** ve el control de nombrar SuperUsuarios ni "🧹 Limpiar".
- [ ] **Step 3:** Entra como un Profe Jefe: arma equipo de profes de asignatura y edita materias; **no** ve "Profesor Jefe" en el formulario, ni "+ Crear curso", ni 🗑️; conserva ✎ XP, ✕ alumno, agregar alumno, 🔄 reiniciar.
- [ ] **Step 4:** Rechazo del servidor (consola, como Jefe): `kimun_prof_curso_crear`, `kimun_prof_curso_quitar`, y `kimun_prof_equipo_asignar` con `p_rol='jefe'` → `no_autorizado`. Como Super: `kimun_prof_super_fijar` → `no_autorizado`.
- [ ] **Step 5:** Encabezado correcto en cada cuenta (Admin/Super: "Todos los cursos"; profesor: cursos con su rol).
- [ ] **Step 6:** Un Super no puede revocar (`kimun_prof_quitar`) a un Admin ni a otro Super.
- [ ] **Step 7:** Sin errores de consola.
- [ ] **Step 8:** Registrar el resultado para la Bitácora.

---

### Task 10: Documentación (`CLAUDE.md`)

**Files:**
- Modify: `CLAUDE.md` — Bitácora (Sesión nueva) + sección Backend (los cuatro roles, `es_super`, `admin_colegio`, `kimun_prof_super_fijar`, y que crear curso ya no auto-nombra Jefe).

- [ ] **Step 1:** Entrada de Bitácora describiendo la jerarquía de 4 roles, el modelo (`es_super` + `admin_colegio`), los cambios de portero, el encabezado, y el resultado de la Task 9.
- [ ] **Step 2:** Actualizar la sección Backend con `profesores.es_super`, `kimun_prof_admin_colegio`, `kimun_prof_super_fijar`, y la nota de que `kimun_prof_curso_crear` ya no auto-nombra Jefe.
- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "Jerarquia de roles: bitacora y documentacion de backend"
```

---

## Auto-revisión del plan (checklist del autor)

**Cobertura del spec:**
- `es_super` + jerarquía → Task 1 ✓
- `kimun_prof_admin_colegio` → Task 1 ✓
- `es_super` en es_mio/acceso/asignaturas/listar + `mi_rol` → Task 2 ✓
- Crear curso (admin_colegio, sin auto-Jefe) → Task 3 Step 1 ✓
- Borrar curso (admin_colegio) → Task 3 Step 2 ✓
- Nombrar/quitar Jefe (admin_colegio) → Task 3 Steps 3-4 ✓
- Autorizar/profesores (admin_colegio, +es_super) → Task 3 Step 5 ✓
- Revocar acotado → Task 3 Step 6 ✓
- `kimun_prof_super_fijar` (solo Admin) + grant → Task 4 ✓
- Encabezado usuario·rango·cursos → Task 5 ✓
- Ocultar crear/borrar curso → Task 6 ✓
- Equipo: alineación, editar, ocultar Jefe, ✕ del Jefe → Task 7 ✓
- Administración para Super + control de Super del Admin + ocultar Limpiar → Task 8 ✓
- Verificación (spec) → Task 9 ✓

**Consistencia de tipos/nombres:**
- `kimun_prof_listar` agrega `mi_rol text`; el cliente lee `f.mi_rol` (Task 5) ✓
- `kimun_prof_profesores` agrega `es_super boolean`; el cliente lee `p.es_super` (Task 8) ✓
- `kimun_prof_super_fijar(text,boolean)` ↔ grant (Task 4) ↔ `SB.rpc('kimun_prof_super_fijar',{p_correo,p_es_super})` (Task 8) ✓
- `window.ESADMINCOLEGIO` fijado en `cargarPanel` (Task 5) y usado en Tasks 6-8 ✓

**Pendiente para el ejecutor:** confirmar los nombres exactos de `accion`, `aviso`, `errorPanel`, `esc`, `ASIG_NOMBRE`, `ASIG_ORDEN` antes de usarlos (todos existen en `profesor.html`).
