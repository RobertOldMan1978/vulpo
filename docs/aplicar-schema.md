# Cómo aplicar `supabase/schema.sql` en Supabase

Procedimiento autocontenido. Lo hace Roberto a mano: el asistente **no** ejecuta SQL contra la
base de producción, y en el equipo no hay CLI de Supabase ni `psql` ni credenciales de
administrador (lo único que vive en el código es la clave pública anónima, que por diseño no
puede ejecutar cambios de estructura).

## Registro de aplicaciones

| Fecha | Qué traía | Verificado |
|---|---|---|
| **2026-08-25** | La auditoría de identidad y permisos de la Sesión 39: RLS en `desafios` y `desafio_resultados`, y el cambio de firma de `kimun_prof_dominio_alumno` (text → uuid) | Sí: las 5 filas en `ok` (13 de 13 con RLS, ninguna sin, firma `uuid`, 0 filas de `admin_clave`, 50 funciones) |
| **2026-08-26** | `MA03` y `HI03` (Sesiones 58 y 59) | Sí, con la consulta de 3 filas de esa sesión |
| **2026-08-27** | `LE03` y `CN03` (Sesión 61) | — |
| **2026-08-27** | Los cuatro códigos de 7° básico: `HI07`, `MA07`, `CN07`, `LE07` (Sesión 62) | Sí: `kimun_oa_asignatura` resuelve los cuatro contra producción, y 8° y 3° siguen intactos |

## Antes de empezar: por qué es seguro

Verificado sobre el archivo (1.391 líneas) el 24/08/2026:

- **Cero** `drop table`, `truncate`, `drop column` y `drop schema`.
- Los 12 `delete from` están **dentro de cuerpos de función**: pegar el archivo solo las
  define, no las ejecuta. La única excepción es intencional y está documentada en el archivo:
  `delete from public.config where clave = 'admin_clave'`, que borra la clave de administrador
  antigua, ya obsoleta desde que existe Supabase Auth.
- Las 5 sentencias `insert`/`update` de nivel superior son **migraciones idempotentes**:
  llevan `on conflict do nothing` o están acotadas a filas antiguas. Re-pegar el archivo no
  duplica ni pisa nada.
- Es idempotente en general: 13 `create table if not exists`, 4 `create index if not exists`,
  50 `create or replace function`, y 20 `drop function if exists` que preceden a las funciones
  cuya firma o columnas cambiaron.

**Se puede re-pegar cuantas veces haga falta.**

## Pasos

1. Entrar a [supabase.com](https://supabase.com) y abrir el proyecto de VULPO.
2. En el menú lateral, **SQL Editor** → **New query**.
3. Abrir `supabase/schema.sql` del repositorio, **seleccionar todo** y copiar.
4. Pegar en el editor y pulsar **Run**.
5. Esperar. Son 1.391 líneas: puede tardar algunos segundos.
6. Debe terminar con **Success**. Si aparece un error, no seguir: copiar el mensaje completo y
   revisarlo antes de reintentar.

## Después: comprobar que quedó aplicado

Pegar esto en una consulta nueva y ejecutarlo. Es solo de lectura, no modifica nada.

> **Por qué es una sola consulta y no cuatro:** el SQL Editor de Supabase ejecuta todas las
> sentencias pero **solo muestra el resultado de la última**. Con cuatro consultas separadas se
> ven los resultados de la cuarta y las otras tres quedan invisibles (pasado el 25/08/2026).
> Esta versión las une en un solo resultado de cinco filas.

```sql
select * from (
  select 1 as n, 'Tablas con RLS activado' as chequeo,
         count(*) filter (where relrowsecurity)::text || ' de ' || count(*)::text as resultado,
         case when count(*) filter (where not relrowsecurity) = 0 then 'ok' else 'FALLA' end as estado
    from pg_class
   where relnamespace = 'public'::regnamespace and relkind = 'r'

  union all
  select 2, 'Tablas SIN RLS (deberia decir ninguna)',
         coalesce(string_agg(relname, ', ' order by relname), '(ninguna)'),
         case when count(*) = 0 then 'ok' else 'FALLA' end
    from pg_class
   where relnamespace = 'public'::regnamespace and relkind = 'r' and not relrowsecurity

  union all
  select 3, 'Firma de kimun_prof_dominio_alumno',
         coalesce(string_agg(pg_get_function_arguments(oid), ' | '), '(no existe)'),
         case when count(*) = 1 and max(pg_get_function_arguments(oid)) like '%uuid%'
              then 'ok' else 'FALLA' end
    from pg_proc
   where proname = 'kimun_prof_dominio_alumno'

  union all
  select 4, 'Clave admin antigua borrada',
         count(*)::text || ' filas',
         case when count(*) = 0 then 'ok' else 'FALLA' end
    from public.config
   where clave = 'admin_clave'

  union all
  select 5, 'Funciones kimun_* definidas',
         count(*)::text,
         case when count(*) >= 45 then 'ok' else 'FALLA' end
    from pg_proc
   where proname like 'kimun%' and pronamespace = 'public'::regnamespace
) t order by n;
```

**Qué esperar:** cinco filas, **todas con `estado` = `ok`**.

| Fila | Correcto | Si falla |
|---|---|---|
| 1 Tablas con RLS | `13 de 13` | Faltó aplicar parte del archivo |
| 2 Tablas SIN RLS | `(ninguna)` | Nombra exactamente cuáles quedaron desprotegidas |
| 3 Firma | `p_perfil uuid` | Si dice `text`, quedó la versión antigua de la Sesión 39 |
| 4 Clave admin | `0 filas` | No llegó al final del archivo |
| 5 Funciones | ~50 | Muy por debajo: se cortó a medio camino |

## Comprobación extra cuando el cambio trae un NIVEL nuevo

Cuando lo que se aplica agrega un curso (`MA03`, `HI07`, y en la v1 vendrán 4°, 5° y 6°), la
consulta general de arriba **no lo cubre**: sigue dando `ok` aunque el nivel no haya quedado
registrado. Hay que mirar dos funciones distintas.

**1. `kimun_oa_asignatura` — que el código se reconozca.** Esto lo puede comprobar el asistente
sin credenciales, porque la función no está revocada y no toca datos: basta llamarla con la
clave pública y ver que `'HI07 OA 01'` devuelva `'HI07'`. Un código inexistente debe dar `null`.

**2. `kimun_prof_asignaturas` — que el código esté en los DOS arreglos.** Esta sí hay que
mirarla desde el SQL Editor, y es la que importa: **si a un arreglo le falta un código, ese
contenido queda invisible para el Profesor Jefe sin ningún error**. Tiene dos listas —una para
Admin/SuperUsuario y otra para el Jefe de curso— y es fácil actualizar una sola.

Cambiar los cuatro códigos por los del nivel que se acaba de aplicar:

```sql
select case when a=2 and b=2 and c=2 and d4=2
            then 'ok - los 4 codigos estan en los DOS arreglos'
            else 'REVISAR - cada uno deberia dar 2' end as estado,
       a, b, c, d4
from (
  select (length(f)-length(replace(f,'MA07','')))/4 a,
         (length(f)-length(replace(f,'HI07','')))/4 b,
         (length(f)-length(replace(f,'CN07','')))/4 c,
         (length(f)-length(replace(f,'LE07','')))/4 d4
  from (select pg_get_functiondef('public.kimun_prof_asignaturas(uuid)'::regprocedure) f) x
) y;
```

**Cada uno debe dar 2.** Si alguno da 1, falta en uno de los arreglos; si da 0, no se aplicó.

## Si algo sale mal

El archivo es idempotente, así que **volver a pegarlo completo es la primera reparación a
intentar**. Si el error persiste, guardar el mensaje: dice qué línea falló y eso basta para
diagnosticar.

## Cuándo hay que repetir esto

**Cada vez que se toque `supabase/schema.sql`.** El repositorio y la base de datos no se
sincronizan solos: el archivo es la fuente de verdad, pero alguien tiene que aplicarlo.
