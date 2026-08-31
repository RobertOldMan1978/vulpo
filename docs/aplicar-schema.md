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
| **2026-08-30** | La **inscripción por enlace**, primera tanda: tabla `inscripciones`, columna `cursos.experimental`, índice de un solo enlace vivo por curso y las cuatro funciones | Sí: las **6 filas en `ok`**, incluida la que comprueba que el generador de tokens NO es ejecutable por `anon` |
| **2026-08-30** | La misma feature, segunda tanda: los **tres fallos distinguidos** en `kimun_inscribirse` (enlace que no existe / cerrado / sin cupo) y la columna `perfiles.autoinscrito`, que `kimun_prof_listar` devuelve | **PENDIENTE** — re-aplicar y correr la consulta de abajo, que ahora son **7 filas** |

> **`schema.sql` NO tiene nada pendiente de aplicar.** Su última modificación es del **27/08 a
> las 10:41** (Sesión 62, los códigos de 7°) y se aplicó ese mismo día; las Sesiones 63, 64 y 65
> **no tocaron el backend**. Re-confirmado en vivo contra producción el **28/08/2026** (ver abajo
> cómo). Si el archivo sigue con esa fecha, es que está al día — no es un olvido.
>
> **Las dos comprobaciones están hechas.** La de `kimun_prof_asignaturas` (los dos arreglos) la
> corrió Roberto el **28/08/2026** y devolvió `ok` con los cuatro códigos de 7° en **2 y 2**. Es
> la que importa, porque **si a un arreglo le falta un código ese contenido queda invisible para
> el Profesor Jefe sin ningún error**, y la consulta general de cinco filas no lo detecta.
>
> **El backend de VULPO está al día: no hay nada de `schema.sql` pendiente de aplicar.**

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

## Comprobación de la inscripción por enlace (30/08/2026)

La consulta general de arriba **no la cubre**: cuenta funciones y RLS en bloque, así que daría
`ok` aunque faltara la tabla nueva. Va en **una sola sentencia** porque el SQL Editor de Supabase
ejecuta todo pero **solo muestra el resultado de la última**.

```sql
select 'tabla inscripciones' as que,
       case when to_regclass('public.inscripciones') is not null then 'ok' else 'FALTA' end as estado
union all
select 'columna cursos.experimental',
       case when exists(select 1 from information_schema.columns
                        where table_schema='public' and table_name='cursos'
                          and column_name='experimental') then 'ok' else 'FALTA' end
union all
select 'un solo enlace vivo por curso',
       case when exists(select 1 from pg_indexes
                        where indexname='idx_inscripcion_activa_curso') then 'ok' else 'FALTA' end
union all
select 'las 4 funciones',
       case when (select count(*) from pg_proc
                   where proname in ('kimun_inscribirse',
                                     'kimun_prof_inscripcion_crear',
                                     'kimun_prof_inscripcion_estado',
                                     'kimun_mi_curso')) = 4
            then 'ok' else 'FALTAN' end
union all
select 'RLS en inscripciones',
       case when (select relrowsecurity from pg_class
                   where relname='inscripciones') then 'ok' else 'FALTA' end
union all
select 'el generador NO es publico',
       case when has_function_privilege('anon','public.kimun_gen_codigo_inscripcion()','execute')
            then 'MAL: es ejecutable por anon' else 'ok' end
union all
select 'los tres fallos se distinguen',
       case when (select count(*) from pg_proc p
                   where p.proname='kimun_inscribirse'
                     and p.prosrc like '%token_invalido%'
                     and p.prosrc like '%enlace_cerrado%') = 1
            then 'ok' else 'FALTA: re-aplica schema.sql' end
union all
select 'marca de autoinscrito',
       case when exists(select 1 from information_schema.columns
                        where table_schema='public' and table_name='perfiles'
                          and column_name='autoinscrito') then 'ok' else 'FALTA' end;
```

**Las siete filas tienen que decir `ok`.** La última importa más de lo que parece: PostgreSQL
otorga EXECUTE a PUBLIC por defecto, así que **omitir una función del `grant` no la protege** —
hay que revocarla explícitamente. Es una trampa que este proyecto ya pagó en la Sesión 19.

### Y una vez, la prueba del cupo

`supabase/probar-inscripcion.sql` crea un curso de prueba, intenta tomar el cupo 20 veces
contra un cupo de 10, comprueba que solo pasan 10 y **borra lo que creó**. Sus 2 filas
tienen que decir `ok`. El propio archivo explica qué prueba y qué no (una sesión de SQL no
puede simular veinte teléfonos a la vez; lo que responde a eso es la forma de la sentencia).

## Comprobación extra cuando el cambio trae un NIVEL nuevo

Cuando lo que se aplica agrega un curso (`MA03`, `HI07`, y en la v1 vendrán 4°, 5° y 6°), la
consulta general de arriba **no lo cubre**: sigue dando `ok` aunque el nivel no haya quedado
registrado. Hay que mirar dos funciones distintas.

**1. `kimun_oa_asignatura` — que el código se reconozca.** Esto lo comprueba el asistente
**sin credenciales de administrador**, porque la función no está revocada y no toca datos: se la
llama con la clave pública que ya vive en `juego/index.html`. Un código inexistente debe dar
`null`, que es lo que demuestra que la respuesta no es un eco.

```bash
KEY=$(grep -o "sb_publishable_[A-Za-z0-9_-]*" juego/index.html | head -1)
URL="https://bdgzpjzlqidcexdkjhzy.supabase.co"
for oa in "HI07 OA 01" "MA07 OA 05" "MA03 OA 01" "XX99 OA 01"; do
  printf "%-14s -> " "$oa"
  curl -s -X POST "$URL/rest/v1/rpc/kimun_oa_asignatura"     -H "apikey: $KEY" -H "Authorization: Bearer $KEY"     -H "Content-Type: application/json" -d "{\"p_oa\":\"$oa\"}"; echo
done
```

Corrido el 28/08/2026: los cuatro códigos de 7°, más `HI08` y `MA03`, devuelven su asignatura, y
`XX99` devuelve `null`. **Vale la pena hacerlo antes de pedirle nada a Roberto:** evita mandarlo
a re-aplicar algo que ya está aplicado, que es exactamente lo que pasó por arrastre entre las
Sesiones 63 y 65.

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
