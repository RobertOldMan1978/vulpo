# Foto semanal del desempeño — Plan de implementación

> **Para trabajadores agénticos:** SUB-SKILL REQUERIDA: usar
> superpowers:subagent-driven-development (recomendado) o
> superpowers:executing-plans para implementar tarea por tarea. Los pasos usan
> casillas (`- [ ]`) para seguimiento.

**Objetivo:** Guardar cada domingo a medianoche (hora de Chile) una copia de los
contadores de desempeño de todos los alumnos inscritos, para poder calcular más
adelante "cómo le fue al curso la semana pasada".

**Arquitectura:** Dos tablas de historial (`dominio_semanal`, `xp_semanal`), una
función `kimun_foto_semanal()` que copia el estado actual y limpia lo más viejo
que dos años, y un trabajo de `pg_cron` que la dispara los lunes a las 04:05 UTC.
Todo vive en `supabase/schema.sql`, el archivo único que se re-pega completo en
el SQL Editor de Supabase.

**Stack:** PostgreSQL (Supabase), `pg_cron`. Sin cliente, sin interfaz.

**Spec:** `docs/superpowers/specs/2026-08-23-foto-semanal-desempeno-design.md`

## Restricciones globales

- **Todo el SQL va en `supabase/schema.sql`**, en una sección nueva al final,
  antes del bloque de `grant execute`. No se crean archivos SQL sueltos: el
  proyecto migra pegando ese archivo completo.
- **Todo debe ser idempotente.** El archivo se re-pega entero en cada migración:
  `create table if not exists`, `create or replace function`, `on conflict do
  nothing`. Nada puede fallar ni duplicar en la segunda pasada.
- **Un commit LOCAL por tarea; nunca `git push`.** Decisión de Roberto tomada
  antes de la Tarea 1: cada tarea cierra con un commit local en `main`, y el
  **push espera la orden 66**. Así el ciclo de revisión puede trabajar con
  rangos de commit sin publicar nada. Ningún agente debe pushear.
- **La verificación la ejecuta Roberto en el SQL Editor de Supabase.** El agente
  que implemente no tiene acceso a la base: escribe el SQL y entrega las
  consultas de verificación con su resultado esperado. No debe afirmar que algo
  "quedó funcionando" sin que Roberto haya pegado el resultado.
- **Zona horaria:** toda fecha de semana se calcula con `America/Santiago`,
  nunca con la fecha UTC.
- **Retención:** 2 años.
- **Nombre del trabajo de cron:** `foto-semanal`.
- **Estilo:** comentarios en español explicando *por qué*, como el resto de
  `supabase/schema.sql`.

## Estructura de archivos

| Archivo | Responsabilidad | Cambio |
|---|---|---|
| `supabase/schema.sql` | Todo el esquema y las funciones | Modificar: sección nueva al final |
| `CLAUDE.md` | Memoria del proyecto | Modificar: documentar el trabajo programado |

No se crean archivos nuevos. La sección nueva de `schema.sql` queda delimitada
con el mismo estilo de separadores que usa el archivo.

---

## Paso previo (bloqueante): habilitar `pg_cron`

**Lo hace Roberto, y hay que confirmarlo antes de empezar la Tarea 4.** Si
`pg_cron` no estuviera disponible en el plan de Supabase, las Tareas 1 a 3 sirven
igual (la función se podría llamar a mano), pero no habría automatización y hay
que replantear.

- [ ] **Paso 1: Habilitar la extensión**

En Supabase: **Database → Extensions** → buscar `pg_cron` → activar.

- [ ] **Paso 2: Confirmar que quedó activa**

Pegar en el SQL Editor:

```sql
select extname, extversion from pg_extension where extname = 'pg_cron';
```

Esperado: **una fila** con `pg_cron` y su versión. Si no devuelve nada, la
extensión no quedó habilitada y no se puede continuar con la Tarea 4.

---

## Tarea 1: Las tablas de historial

**Archivos:**
- Modificar: `supabase/schema.sql` (sección nueva al final, antes del bloque `grant execute`)

**Interfaces:**
- Consume: `public.perfiles(id)` — ya existe.
- Produce: las tablas `public.dominio_semanal` y `public.xp_semanal`, que usa la
  función de la Tarea 2.

- [ ] **Paso 1: Escribir la verificación primero (debe fallar)**

Pegar en el SQL Editor **antes** de crear nada:

```sql
select to_regclass('public.dominio_semanal') as dominio_semanal,
       to_regclass('public.xp_semanal')      as xp_semanal;
```

Esperado ahora: **ambas columnas en `null`** (las tablas no existen todavía).
Esto confirma que la verificación realmente distingue el antes del después.

- [ ] **Paso 2: Agregar las tablas a `schema.sql`**

Al final de `supabase/schema.sql`, antes del bloque `grant execute`, agregar:

```sql
-- ------------------------------------------------------------
-- Foto semanal del desempeño (Sesión 36).
--
-- `dominio` guarda contadores acumulados y no tiene historial: por diseño no se
-- registra cuándo se respondió cada cosa. Eso hace imposible responder "¿cómo le
-- fue al curso la semana pasada?", porque no existe la foto anterior contra la
-- cual comparar. Estas tablas guardan esa foto, tomada al cerrar cada domingo.
--
-- Se copia al mismo detalle que `dominio` (alumno × objetivo) a propósito: con el
-- detalle se puede calcular la diferencia por alumno, por objetivo, por asignatura
-- o por curso. Guardar algo ya agregado cerraría esas puertas.
-- ------------------------------------------------------------
create table if not exists public.dominio_semanal (
  semana      date not null,          -- domingo que cierra, en hora de Chile
  perfil_id   uuid not null references public.perfiles(id) on delete cascade,
  oa          text not null,
  respondidas int  not null,
  correctas   int  not null,
  resp_1      int  not null,
  ok_1        int  not null,
  primary key (semana, perfil_id, oa)
);
create index if not exists idx_dominio_semanal_perfil
  on public.dominio_semanal(perfil_id, semana);

-- El XP va aparte porque es uno por alumno, no uno por objetivo. Sirve para decir
-- cuánto avanzó, además de qué tan bien responde.
create table if not exists public.xp_semanal (
  semana    date not null,
  perfil_id uuid not null references public.perfiles(id) on delete cascade,
  xp        int  not null,
  primary key (semana, perfil_id)
);

-- Ningún cliente lee estas tablas: las escribe un trabajo programado y las leerá
-- el informe semanal desde el servidor. Con RLS activo y sin políticas, PostgREST
-- no expone nada a los alumnos ni a los profesores.
alter table public.dominio_semanal enable row level security;
alter table public.xp_semanal      enable row level security;
```

- [ ] **Paso 3: Aplicar y verificar que ahora sí existen**

Pegar el `schema.sql` completo en el SQL Editor y ejecutar. Luego repetir la
consulta del Paso 1.

Esperado: **`dominio_semanal` y `xp_semanal`**, ya no `null`.

- [ ] **Paso 4: Verificar que RLS quedó activo y sin políticas**

```sql
select relname, relrowsecurity,
       (select count(*) from pg_policies
         where schemaname='public' and tablename=c.relname) as politicas
from pg_class c
where relname in ('dominio_semanal','xp_semanal');
```

Esperado: `relrowsecurity = true` y `politicas = 0` en ambas. Sin políticas,
ningún cliente puede leerlas — que es lo que queremos.

- [ ] **Paso 5: Verificar idempotencia**

Volver a ejecutar el `schema.sql` completo.

Esperado: **sin errores**. Los `if not exists` deben absorber la segunda pasada.

- [ ] **Paso 6: Commit local**

```bash
git add supabase/schema.sql
git commit -m "Foto semanal: tablas dominio_semanal y xp_semanal"
```

Sin `push`: espera la orden 66.

---

## Tarea 2: La función que toma la foto

**Archivos:**
- Modificar: `supabase/schema.sql` (justo después de las tablas de la Tarea 1)

**Interfaces:**
- Consume: `public.dominio_semanal`, `public.xp_semanal` (Tarea 1);
  `public.dominio`, `public.perfiles` (ya existen).
- Produce: `public.kimun_foto_semanal(p_semana date default null) returns int`.
  Devuelve cuántas filas de dominio guardó. La usa el cron de la Tarea 4.

- [ ] **Paso 1: Escribir la verificación primero (debe fallar)**

```sql
select public.kimun_foto_semanal();
```

Esperado ahora: error **`function public.kimun_foto_semanal() does not exist`**.

- [ ] **Paso 2: Agregar la función a `schema.sql`**

Justo después de las tablas de la Tarea 1:

```sql
-- Toma la foto de la semana. La llama pg_cron los lunes de madrugada, y se puede
-- correr a mano para probar.
--
-- OJO con p_semana: solo cambia la ETIQUETA de la foto, no de dónde salen los
-- datos. Siempre copia el `dominio` actual. No puede reconstruir una semana
-- pasada —esa información no existe—, así que pasar una fecha vieja guardaría los
-- números de hoy con una etiqueta equivocada. Sirve para corregir el sello si el
-- trabajo falló y se corre un día tarde, no para inventar historia.
create or replace function public.kimun_foto_semanal(p_semana date default null)
returns int language plpgsql security definer set search_path=public as $$
declare s date; n int; begin
  -- El último domingo cerrado, en hora de Chile. Dos detalles a propósito:
  --   * America/Santiago y no UTC: el trabajo corre pasada la medianoche chilena,
  --     cuando en UTC ya es lunes.
  --   * date_trunc('week') y no "ayer": "ayer" solo cae en domingo si se corre un
  --     lunes. El cron siempre corre lunes, pero esta función también se ejecuta a
  --     mano para probar, y cualquier otro día quedaría mal sellada. date_trunc
  --     devuelve el lunes de la semana en curso (ISO), así que restarle un día da
  --     siempre el domingo que cerró.
  s := coalesce(p_semana,
                date_trunc('week', timezone('America/Santiago', now()))::date - 1);

  -- Solo alumnos inscritos en un curso. Los perfiles sueltos que crea cada
  -- teléfono al abrir el juego no son de nadie: incluirlos inflaría la tabla sin
  -- aportar. Mismo criterio que usa el panel del profesor.
  insert into public.dominio_semanal(semana, perfil_id, oa,
                                     respondidas, correctas, resp_1, ok_1)
  select s, d.perfil_id, d.oa, d.respondidas, d.correctas, d.resp_1, d.ok_1
  from public.dominio d
  join public.perfiles p on p.id = d.perfil_id
  where p.curso_id is not null and p.codigo_acceso is not null
  on conflict (semana, perfil_id, oa) do nothing;
  get diagnostics n = row_count;

  insert into public.xp_semanal(semana, perfil_id, xp)
  select s, p.id, p.xp
  from public.perfiles p
  where p.curso_id is not null and p.codigo_acceso is not null
  on conflict (semana, perfil_id) do nothing;

  return n;
end $$;
```

- [ ] **Paso 3: Aplicar y correr la función**

Pegar el `schema.sql` completo, ejecutar, y luego:

```sql
select public.kimun_foto_semanal() as filas_guardadas;
```

Esperado: un número **mayor que cero** (el curso demo `CUR-BA04` tiene ~1.270
filas de dominio, así que debería rondar esa cifra).

- [ ] **Paso 4: Verificar que la semana es el domingo correcto**

```sql
select distinct semana, trim(to_char(semana, 'Day')) as dia_semana
from public.dominio_semanal
order by semana desc limit 3;
```

Esperado: `dia_semana` = **`Sunday`**, y `semana` es el último domingo cerrado en
hora de Chile — **cualquiera sea el día en que se corra la prueba**. Si aparece
otro día, el cálculo está mal.

- [ ] **Paso 5: Verificar idempotencia (no duplica)**

```sql
select count(*) as antes from public.dominio_semanal;
select public.kimun_foto_semanal();
select count(*) as despues from public.dominio_semanal;
```

Esperado: **`antes` = `despues`**. La segunda corrida no agrega nada porque el
`on conflict do nothing` protege la foto original.

- [ ] **Paso 6: Verificar que no entraron perfiles sueltos**

```sql
select count(*) as perfiles_sueltos_filtrados
from public.dominio_semanal ds
join public.perfiles p on p.id = ds.perfil_id
where p.curso_id is null or p.codigo_acceso is null;
```

Esperado: **0**.

- [ ] **Paso 7: Verificar que el XP también se guardó**

```sql
select count(*) as alumnos_con_xp, min(xp) as xp_min, max(xp) as xp_max
from public.xp_semanal;
```

Esperado: `alumnos_con_xp` = la cantidad de alumnos inscritos (26 en el curso
demo) y valores de XP coherentes con los del panel.

- [ ] **Paso 8: Commit local**

```bash
git commit -am "Foto semanal: funcion kimun_foto_semanal"
```

Sin `push`: espera la orden 66.

---

## Tarea 3: La retención de 2 años

**Archivos:**
- Modificar: `supabase/schema.sql` (la función `kimun_foto_semanal` de la Tarea 2)

**Interfaces:**
- Consume: `public.kimun_foto_semanal(date)` (Tarea 2).
- Produce: la misma función, ahora borrando lo anterior a dos años. La firma y el
  valor de retorno **no cambian**.

- [ ] **Paso 1: Escribir la verificación primero (debe fallar)**

Insertar una foto falsa y muy vieja, colgada de un alumno real:

```sql
insert into public.dominio_semanal(semana, perfil_id, oa,
                                   respondidas, correctas, resp_1, ok_1)
select date '2020-01-05', p.id, 'HI08 OA 01', 1, 1, 1, 1
from public.perfiles p
where p.curso_id is not null and p.codigo_acceso is not null
limit 1
on conflict do nothing;

select public.kimun_foto_semanal();

select count(*) as fotos_viejas
from public.dominio_semanal where semana = date '2020-01-05';
```

Esperado ahora: **`fotos_viejas` = 1**. La función todavía no limpia, así que la
fila de 2020 sobrevive. Eso confirma que la prueba mide algo real.

- [ ] **Paso 2: Agregar la limpieza a la función**

En `kimun_foto_semanal`, **después** del `insert` en `xp_semanal` y **antes** del
`return n;`, agregar:

```sql
  -- Retención: dos años. Suficiente para comparar contra el año anterior, y acota
  -- el crecimiento (cada curso aporta ~1.300 filas por semana, ~67.000 al año).
  delete from public.dominio_semanal where semana < (s - interval '2 years')::date;
  delete from public.xp_semanal      where semana < (s - interval '2 years')::date;
```

- [ ] **Paso 3: Aplicar y verificar que ahora sí limpia**

Pegar el `schema.sql` completo, ejecutar, y luego:

```sql
select public.kimun_foto_semanal();

select count(*) as fotos_viejas
from public.dominio_semanal where semana = date '2020-01-05';
```

Esperado: **`fotos_viejas` = 0**. La fila de 2020 desapareció.

- [ ] **Paso 4: Verificar que la foto actual sobrevivió**

```sql
select count(*) as filas_semana_actual
from public.dominio_semanal
where semana = date_trunc('week', timezone('America/Santiago', now()))::date - 1;
```

Esperado: el mismo número de la Tarea 2 (~1.270). La limpieza no debe tocar lo
reciente.

- [ ] **Paso 5: Commit local**

```bash
git commit -am "Foto semanal: retencion de 2 anos"
```

Sin `push`: espera la orden 66.

---

## Tarea 4: Permisos y agenda

**Archivos:**
- Modificar: `supabase/schema.sql` (revoke junto a la función; el `cron.schedule`
  al final del archivo)

**Interfaces:**
- Consume: `public.kimun_foto_semanal(date)` (Tareas 2 y 3), extensión `pg_cron`
  (Paso previo).
- Produce: el trabajo de cron llamado `foto-semanal`.

**Requisito:** el Paso previo debe estar confirmado. Sin `pg_cron` esta tarea no
se puede completar.

- [ ] **Paso 1: Escribir la verificación primero (debe fallar)**

```sql
select has_function_privilege('anon',          'public.kimun_foto_semanal(date)', 'execute') as anon,
       has_function_privilege('authenticated', 'public.kimun_foto_semanal(date)', 'execute') as authenticated;

select count(*) as trabajos_agendados from cron.job where jobname = 'foto-semanal';
```

Esperado ahora: `anon` y `authenticated` en **`true`** (Postgres otorga execute a
`public` por omisión, así que cualquier cliente podría dispararla), y
`trabajos_agendados` = **0**.

- [ ] **Paso 2: Revocar el permiso**

En `supabase/schema.sql`, justo después de la función `kimun_foto_semanal`,
agregar:

```sql
-- No se otorga a nadie: la llama pg_cron, que corre con permisos propios. Se revoca
-- de public por lo mismo que kimun_prof_es_mio: ningún cliente —alumno o profesor—
-- debe poder disparar el trabajo ni tocar el historial.
revoke execute on function public.kimun_foto_semanal(date) from public;
```

**No** agregar la función al bloque `grant execute` del final del archivo.

- [ ] **Paso 3: Agendar el trabajo**

Al final de `supabase/schema.sql`, después del bloque `grant execute`, agregar:

```sql
-- ------------------------------------------------------------
-- Agenda de la foto semanal.
--
-- pg_cron corre en UTC. "Domingo 23:59" en Santiago no es una hora fija en UTC:
-- es lunes 02:59 en verano (UTC−3) y lunes 03:59 en invierno (UTC−4). Por eso el
-- trabajo se agenda el lunes 04:05 UTC, que cae 00:05 o 01:05 del lunes en Chile
-- según la época: en ambos casos ya cerró el domingo y no hay nadie jugando.
-- La fecha de la foto la calcula la función con America/Santiago, no el cron.
do $$
begin
  -- Si pg_cron no esta habilitado, NO se agenda pero tampoco se rompe el pegado del
  -- archivo. schema.sql se re-pega entero en cada migracion y una llamada suelta a
  -- cron.schedule sobre una base sin la extension abortaria todo el script.
  if not exists (select 1 from pg_extension where extname = 'pg_cron') then
    raise notice 'pg_cron no esta habilitado: la foto semanal NO quedo agendada.';
    return;
  end if;

  -- El unschedule previo hace idempotente el re-pegado: sin el, volver a ejecutar
  -- schema.sql podria dejar el trabajo duplicado en versiones antiguas de pg_cron.
  -- El exception lo tolera cuando el trabajo todavia no existe.
  begin
    perform cron.unschedule('foto-semanal');
  exception when others then null;
  end;

  perform cron.schedule('foto-semanal', '5 4 * * 1',
                        'select public.kimun_foto_semanal()');
end $$;
```

> **Por qué el guard:** una restricción global del plan dice que re-pegar
> `schema.sql` completo nunca debe fallar. Sin el `if not exists`, pegarlo en una
> base sin `pg_cron` abortaría el script entero y dejaría la migración a medias.
> Con el guard, la base queda consistente y solo avisa que no se agendó.

- [ ] **Paso 4: Aplicar y verificar permisos y agenda**

Pegar el `schema.sql` completo, ejecutar, y repetir las consultas del Paso 1.

Esperado: `anon` y `authenticated` ahora en **`false`**, y `trabajos_agendados` =
**1**.

- [ ] **Paso 5: Verificar los detalles del trabajo**

```sql
select jobname, schedule, command, active from cron.job where jobname = 'foto-semanal';
```

Esperado: `schedule` = **`5 4 * * 1`**, `active` = **`true`**, y `command`
llamando a `public.kimun_foto_semanal()`.

- [ ] **Paso 6: Verificar idempotencia de la agenda**

Volver a ejecutar el `schema.sql` completo y repetir la consulta del Paso 5.

Esperado: **sigue habiendo exactamente 1** trabajo llamado `foto-semanal`, no
dos.

- [ ] **Paso 7: Commit local**

```bash
git commit -am "Foto semanal: permisos y agenda pg_cron"
```

Sin `push`: espera la orden 66.

---

## Tarea 5: Documentar el trabajo programado

Un trabajo que corre solo, de madrugada, y que nadie ve en ninguna pantalla es
justo lo que se olvida. Tiene que quedar escrito.

**Archivos:**
- Modificar: `CLAUDE.md`

**Interfaces:**
- Consume: todo lo anterior.
- Produce: nada de código.

- [ ] **Paso 1: Documentar en `CLAUDE.md`**

En la sección de herramientas/infraestructura (junto a donde se explica el
respaldo automático de las 18:00, que es el otro proceso programado del
proyecto), agregar:

```markdown
### Foto semanal del desempeño (Sesión 36)

Cada **lunes a las 04:05 UTC** —00:05 o 01:05 del lunes en Chile según el cambio
de hora— un trabajo de `pg_cron` llamado `foto-semanal` ejecuta
`kimun_foto_semanal()`, que copia los contadores de `dominio` y el XP de los
alumnos inscritos a `dominio_semanal` y `xp_semanal`, sellados con el domingo que
cierra (calculado con `America/Santiago`, no con la fecha UTC).

**Por qué existe:** `dominio` solo guarda acumulados, sin historial. Sin estas
fotos es imposible responder "¿cómo le fue al curso la semana pasada?". El
historial **no se puede reconstruir hacia atrás**: cada semana sin foto se pierde
para siempre.

**Cuidados:**
- Requiere la extensión `pg_cron` habilitada en Supabase.
- La función **no** está en el bloque `grant execute`: ningún cliente debe poder
  dispararla.
- El parámetro `p_semana` solo cambia la etiqueta de la foto, **no** reconstruye
  semanas pasadas.
- Retención de 2 años, limpiada por el mismo trabajo.
- Es la base del informe semanal por correo, que se diseñará aparte.
```

- [ ] **Paso 2: Revisar que el estado quedó fiel**

Releer la sección escrita y confirmar que coincide con lo que realmente quedó
implementado (horario, nombre del trabajo, nombres de tablas y función).

- [ ] **Paso 3: Commit local**

```bash
git commit -am "Foto semanal: documentar el trabajo programado en CLAUDE.md"
```

Sin `push`: espera la orden 66.

Cuando Roberto dé la **orden 66**, entra todo junto: `supabase/schema.sql`,
`CLAUDE.md`, los dos specs y este plan.

---

## Verificación final (todo junto)

Después de la Tarea 5, correr esta consulta única que resume el estado:

```sql
select
  (select count(*) from public.dominio_semanal)                        as filas_dominio,
  (select count(*) from public.xp_semanal)                             as filas_xp,
  (select count(distinct semana) from public.dominio_semanal)          as semanas_guardadas,
  (select max(semana) from public.dominio_semanal)                     as ultima_semana,
  (select count(*) from cron.job where jobname='foto-semanal')         as cron_activo,
  has_function_privilege('anon','public.kimun_foto_semanal(date)','execute') as anon_puede;
```

Esperado:
- `filas_dominio` ≈ 1.270 (curso demo), `filas_xp` = 26
- `semanas_guardadas` = 1, `ultima_semana` = el domingo pasado
- `cron_activo` = 1
- `anon_puede` = **false**

La prueba real llega sola: **el lunes siguiente** debe aparecer una segunda
semana sin que nadie haga nada. Conviene revisar `select * from cron.job_run_details
order by start_time desc limit 5;` ese día para confirmar que corrió sin error.
