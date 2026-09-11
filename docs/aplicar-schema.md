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
| **2026-08-30** | La misma feature, segunda tanda: los **tres fallos distinguidos** en `kimun_inscribirse` (enlace que no existe / cerrado / sin cupo) y la columna `perfiles.autoinscrito`, que `kimun_prof_listar` devuelve | Sí: el bloque del panel carga y deja crear el enlace desde la cuenta de admin, que es lo que fallaba mientras no estaba aplicada |
| **2026-08-30** | El **nivel del curso**: columna `cursos.nivel`, `kimun_prof_curso_crear` **cambia de firma** (`text` → `text,text`), `kimun_prof_curso_nivel` nueva, `kimun_prof_listar` devuelve el nivel y `kimun_prof_equipo_asignar` rechaza una asignatura de otro nivel | Sí: las **3 filas en `ok`**, incluida la que confirma que no quedaron dos versiones de `kimun_prof_curso_crear` |
| **2026-08-30** | `v_rol` en `kimun_prof_equipo_asignar` (la variable se llamaba igual que la columna `rol`) y el `unnest` con alias de columna explícito | Sí, y **de la mejor manera**: nombrar Profesor Jefe desde el panel pasó a funcionar, que es lo que estaba roto desde la Sesión 37 |
| **2026-08-31** | **M4**: `kimun_asignaturas_todas()` nueva —el catálogo de las 12 asignaturas, que antes eran doce códigos enumerados a mano en `kimun_oa_asignatura` y **dos arreglos gemelos** dentro de `kimun_prof_asignaturas`—. Agregar un curso pasa a ser **una fila**. Sin `drop function`, así que era seguro aplicarlo en cualquier orden | Sí, y con **prueba positiva completa**: los **12 códigos** devuelven su asignatura por `kimun_oa_asignatura`, que consulta justamente esa lista —o sea que ninguno falta—, y `kimun_asignaturas_todas()` los entrega en el orden del panel. Controles negativos: `XX99 OA 01`, `CA-T1` y el malformado `MA03 OA 1` dan `null`, así que la respuesta no es un eco. Y los transversales siguen mapeando (`VOC-HIST`→`HI08`, `AF-T3`→`LE08`), que era el ⚠️ del diseño: volverla puramente estructural habría borrado del panel el avance histórico de 8° en Vocabulario y Ana Frank |
| **2026-09-01** | **Bloque D · el progreso en el servidor**: tabla `progreso` (RLS sin políticas, `on delete cascade`) más `kimun_progreso_subir(jsonb)` y `kimun_progreso_bajar()`. Sin `drop function`, así que era seguro en cualquier orden | **Sí, comprobado el 02/09 contra producción**: `kimun_progreso_bajar` responde `[]` en vez de `PGRST202`, o sea que la función existe. ⚠️ **Se aplicó el 01/09 y quedó sin anotar aquí durante un día**, que es el defecto inverso al de la Sesión 73: un esquema aplicado y no registrado hace que la sesión siguiente mande a re-aplicarlo por nada, y mandar a re-aplicar por reflejo entrena a ignorar el aviso el día que sea de verdad |
| **2026-09-07** | **`kimun_prof_tendencia(curso)`**, la primera función que lee `dominio_semanal` y `xp_semanal` —las fotos que `kimun_foto_semanal` venía tomando cada domingo desde la Sesión 36 sin que ningún cliente las mirara—. Alimenta la tendencia semanal del panel del profesor. Trae su `drop function if exists` aunque sea nueva, porque al ser `returns table` agregarle una columna algún día haría fallar el re-pegado del archivo entero | **Sí, contra producción, con su control negativo**: la función responde **400 `no_autorizado`** a una sesión anónima —o sea que **existe** y su portero funciona—, mientras una función inventada da **404 `PGRST202`**. Sin ese segundo llamado el 400 no probaría nada: un error universal se ve igual que la función aplicada. Y `kimun_oa_asignatura('MA06 OA 01')` sigue devolviendo `MA06`, así que el re-pegado no rompió lo anterior. ⚠️ **Lo que NO se puede comprobar desde aquí es que devuelva DATOS**: eso exige una sesión de profesor, y se ve abriendo el panel |
| **2026-09-07** | **`kimun_prof_ranking_general(curso,minimo)`**, la pestaña "General" del ranking: el mismo criterio del ranking por asignatura pero sobre todas las del profesor a la vez, con **promedio simple** (cada materia pesa igual) y devolviendo sobre **cuántas** asignaturas se calculó | **Sí, con su control negativo**: responde **400 `no_autorizado`** a una sesión anónima —existe y su portero funciona— mientras una función inventada da **404 `PGRST202`**. Y se comprobó de paso que el re-pegado **no se llevó lo anterior**: `kimun_prof_tendencia` y `kimun_prof_ranking_asignatura` siguen respondiendo, y `kimun_oa_asignatura('MA06 OA 01')` sigue dando `MA06` |
| **2026-09-08** | **`kimun_prof_pulso()`**, la vista de dirección/UTP: una fila por curso con la cobertura del programa desglosada por asignatura y la participación de la semana. ⚠️ **Lo que NO devuelve es la mitad del diseño** —ni porcentajes de acierto, ni un solo nombre de alumno—, y esa restricción vive en la firma justamente para que no se pueda deshacer desde el cliente. Portero `kimun_prof_admin_colegio()`: solo Admin y SuperUsuario | **Sí, y el cambio de estado es lo que lo prueba**: antes de aplicar daba **404 `PGRST202`** y ahora da **400 `no_autorizado`** a una sesión anónima, o sea que existe **y** su portero rechaza. El control negativo sigue en pie —`kimun_prof_pulso_inventada` da 404—, así que el 400 no es un eco genérico; y el re-pegado no se llevó lo anterior: `kimun_prof_ranking_general` y `kimun_prof_tendencia` siguen respondiendo y `kimun_oa_asignatura('MA06 OA 01')` sigue dando `MA06`. ⚠️ Que devuelva **DATOS** no se puede comprobar sin sesión de profesor: se ve abriendo el panel |
| **2026-09-08** | **La planificación del año**: tablas `unidades_plan` y `unidades_plan_log`, más `kimun_prof_plan`, `_plan_fijar`, `_plan_quitar`, `_plan_historial` y `_plan_sugerir`. Y **`kimun_prof_dominio` y `_dominio_alumno` CAMBIAN DE FIRMA** —suman `ultima`/`recientes` y `ultima`—, así que aquí el `drop function` previo no es una precaución sino el requisito: sin él, el `create or replace` habría abortado el pegado con *"cannot change return type"* | **Sí, con tres comprobaciones y no una.** (1) Las cinco funciones nuevas responden **400 `no_autorizado`** a una sesión anónima —existen y su portero funciona— mientras `kimun_prof_plan_inventada` da **404 `PGRST202`**, o sea que el 400 no es un eco. (2) **La firma se comprobó de verdad**: PostgREST resuelve por NOMBRE de parámetro, así que llamar `kimun_prof_plan_fijar` con sus siete (`p_curso_codigo`, `p_asignatura`, `p_unidad`, `p_titulo`, `p_inicio`, `p_termino`, `p_nota`) y recibir 400 en vez de 404 prueba que la firma es la esperada — con una firma distinta habría dado PGRST202. (3) Las dos que cambiaron de firma siguen respondiendo, y `kimun_oa_asignatura('MA06 OA 01')` sigue dando `MA06`. ⚠️ Que devuelvan **DATOS** no se puede comprobar sin sesión de profesor |
| **2026-09-08** | **APLICADO.** Tres funciones nuevas: **`kimun_prof_resumen()`** (una fila por curso, para el titular de participación con contexto y la franja de "qué necesita tu atención" — nace para BAJAR el número de llamadas, no para subirlo: reemplaza la consulta de participación *por curso* que hacía la lista), **`kimun_prof_semanas(curso)`** (qué fotos existen, y **hasta dónde llega el historial**) y **`kimun_prof_dominio_foto(curso, semana)`** (el mapa tal como estaba en una semana pasada). Las tres son nuevas y ninguna cambia una firma existente, así que **es seguro aplicarlo en cualquier orden respecto al cliente**. ⚠️ `kimun_prof_resumen` **no devuelve un solo nombre de alumno**, y esa restricción vive en la firma por el mismo motivo que en `kimun_prof_pulso`: la franja dice "7 alumnos no entraron", que es un conteo, y los nombres se ven al entrar al curso | **Sí, y la comprobación destapó algo.** `kimun_prof_semanas` y `_dominio_foto` pasaron de **404 `PGRST202`** a **400 `no_autorizado`**, con el control negativo en pie (una función inventada sigue dando 404) y el positivo (`MA06 OA 01` → `MA06`; `kimun_prof_pulso` y `_plan` siguen respondiendo). ⚠️ **La firma se probó por nombre de parámetro**: llamar `_dominio_foto` con `p_curso`/`p_sem` en vez de `p_curso_codigo`/`p_semana` devuelve **404**, o sea que la firma real es la esperada. ⚠️ **Y `kimun_prof_resumen` devuelve 200 `[]` en vez de 400**, porque le faltaba el portero: **no hay fuga** —su CTE filtra por `kimun_prof_acceso`, así que un anónimo recibe la lista vacía, medido— pero es una **excepción silenciosa a un patrón**, y `kimun_prof_listar`, que es su hermana directa, sí lanza. **Corregido en el repositorio; falta re-pegarlo → hecho ese mismo día, fila siguiente** |
| **2026-09-08** | **RE-PEGADO: el portero de `kimun_prof_resumen`**, lo único que la aplicación anterior había dejado a medias. Un `declare yo public.profesores` + `raise exception 'no_autorizado'` al final de la función, para que responda **lo mismo que sus hermanas** | **Sí, y el cambio de estado es lo que lo prueba**: pasó de **200 `[]`** a **400 `no_autorizado`**, estable en tres llamados seguidos. Con sus dos controles: llamarla con un parámetro inventado (`p_falso`) da **404 `PGRST202`**, o sea que su firma sigue siendo sin parámetros y el 400 no es un eco genérico; y `kimun_prof_listar` —su hermana directa— responde el mismo 400, que era el patrón al que había que volver. `kimun_prof_semanas`, `_dominio_foto` y `kimun_oa_asignatura('MA06 OA 01')` siguen respondiendo, así que el re-pegado no se llevó nada |
| **2026-09-08** | **Parche de seguridad H2** (auditoría, Sesión 111): `kimun_perfil` y `kimun_inscribirse` acotan el largo del nombre (40) y el avatar (24) que sube el cliente, **truncando** en vez de rechazar. `create or replace` **sin cambio de firma**, así que era seguro aplicarlo en cualquier orden respecto al cliente | **Sí, y esta vez con verificación de DATOS y no solo de existencia** —porque `kimun_perfil` es del juego, no del panel, y se llama desde una sesión anónima—: un nombre de 200 y un avatar de 100 caracteres vuelven **truncados a 40 y 24** (antes del parche volvían enteros: 200/100, el control del "antes" medido el mismo día). Controles de no-regresión: un nombre normal (`"Martina"`/`🦊`) queda intacto, y enviar puros espacios **ya no pisa el nombre** con vacío —el bug latente que el parche cerró de paso—. ⚠️ **Se aplicó a la segunda**: el primer pegado no traía el parche (era el buffer viejo del editor sin recargar), y se detectó porque el `after` seguía dando 200/100; el archivo en disco y el commit `ee1a9f2a` sí lo tenían |
| **2026-09-10** | **Sesión 116 · Rol Operador + inquilinos (Fase 1).** Columna `profesores.es_operador` + `kimun_prof_operador_fijar`; tablas `sostenedores`/`colegios` + `cursos.colegio_id`; los listers/creadores/renombrar/borrar de inquilinos; **`kimun_prof_listar` y `_profesores` CAMBIAN DE FIRMA** (suman `colegio_id`/`colegio` y `es_operador`, con sus `drop`), así que el panel se publica antes o junto con el esquema | **Sí, con control positivo/negativo**, y de paso cazó el **bug id-ambiguo de los listers**: `kimun_prof_sostenedores`/`_colegios` daban `42702 column reference "id" is ambiguous` (returns-table con OUT `id` + `where id = auth.uid()` sin calificar). Corregido aliasando `pr.id`; la primera re-aplicación no lo tomó porque el pegado del archivo completo salió del **buffer viejo del editor** (gotcha Sesión 111), y se resolvió pegando un fragmento chico con solo las dos funciones |
| **2026-09-10** | **Sesión 116 · el motor de permisos granular (Fase 2).** Tabla `permisos_usuario`, los resolutores con lectura dual, los 4 porteros delegando a capacidades, el otorgamiento (`kimun_prof_permisos_ver`/`_fijar`/`_revocar`) con no-escalada, la migración banderas/membresías→grants y los presets. **Ninguna firma existente cambia** (los 4 porteros son `create or replace` de cuerpo; `permisos_ver` es nueva con su `drop`), así que era seguro en cualquier orden respecto al cliente | **Sí, control VERDE, y cazó DOS bugs que la auditoría estática no ve.** (1) `permisos_ver` daba `42702 id ambiguo` (returns-table, `select into yo` sin calificar) → `pr.id`. (2) Los resolutores quedaban **expuestos a anon** (`200 false`): `revoke from public` no basta porque **Supabase otorga EXECUTE a anon/authenticated por default privileges** → se revocan `from public, anon, authenticated`. Tras el fix: otorgamiento → **400 `no_autorizado`**, resolutores → **401 `permission denied`** (revocados), helpers (`capacidades_todas`/`preset`) → 200, `MA06 OA 01`→`MA06`, inventada → 404. Migración verificada por conteo: **`curso: 7` = las 7 membresías (`1+1+2+2+1`)**, 0 plataforma/colegio porque no hay Super/Operador reales, Admin excluido, `colegios=1` |
| **2026-09-08** | S113 · **`kimun_mi_plan()`**, el semáforo del alumno: le devuelve al niño la planificación de SU curso (asignatura, unidad, título y las dos fechas) para pintar qué unidad se está pasando esta semana. ⚠️ **NO expone `nota`, `profesor_id` ni el log** —el registro de quién movió qué fecha es material de UTP (Sesión 108)—, y la restricción vive en la FIRMA, no en el cliente. Modela sobre `kimun_mi_curso` (resuelve el curso con `kimun_yo()`, sin parámetros); es del alumno, así que va a `anon` y **no tiene portero de rol**. Trae su `drop function if exists` como toda `returns table` | **Sí, con sus tres controles.** (1) POSITIVO: `kimun_mi_plan` pasó de **404 `PGRST202`** (medido antes de aplicar) a **200 `[]`** — una sesión anónima sin curso recibe vacío porque el join no da filas, NO un `no_autorizado`: es de lectura del alumno, no una `kimun_prof_*`. (2) NEGATIVO: `kimun_mi_plan_inventada` sigue dando **404 `PGRST202`** (su hint ahora sugiere `kimun_mi_plan`, o sea que está en el caché), así que el `[]` no es un eco. (3) PRIVACIDAD en la firma: `?select=nota` da **400 `42703` column "nota" does not exist** — la función no la expone. |

> **Al 10/09/2026 no queda ninguna fila pendiente de aplicar.** La Fase 2 del motor granular (las dos
> primeras filas de la tabla) se aplicó y comprobó ese día con el control positivo/negativo verde y el
> conteo de la migración. Todo lo anterior también está aplicado.
>
> ⚠️ **`revoke from public` NO basta en Supabase.** La Fase 2 lo aprendió: Supabase otorga EXECUTE a
> `anon` y `authenticated` por default privileges, así que una función interna revocada solo `from
> public` queda igual de expuesta por RPC (devuelve lo que compute, sin fuga, pero no debería estar en
> la superficie de la API). Toda función interna nueva se revoca `from public, anon, authenticated`.
>
> ⚠️ **Y una comprobación que vale la pena repetir en cada función nueva:** el control no es solo «¿responde?» sino **¿responde lo
> MISMO que sus hermanas?**. `kimun_prof_resumen` respondía —sin filtrar nada de más— y aun así estaba mal, porque devolvía 200
> donde todas las demás `kimun_prof_*` devuelven 400. Se encontró comparándola con `kimun_prof_listar` contra producción, no
> leyendo el código.
>
> ⚠️ **El registro tiene un hueco entre el 01/09 y el 07/09**, cuando se dieron de alta los niveles 04, 05 y 06: esas aplicaciones
> ocurrieron —medido hoy, `MA06 OA 01` resuelve en producción— pero nadie las anotó aquí. Se deja dicho en vez de inventarles fecha,
> que es lo mismo que este archivo pide para lo demás: **la comprobación vale, el recuerdo no**.
>
> **Un apunte de método que vale para los cursos que vienen:** la comprobación buena no fue «existe la función» sino **preguntarle por los 12 códigos uno por uno**. Si a la lista le faltara uno, ese contenido queda **invisible para el Profesor Jefe sin ningún error** — y «la función existe» se ve exactamente igual en los dos casos.
>
> ⚠️ **Antes de mandar a re-aplicar, MIRAR si el archivo cambió.** El 30/08 se pidió un pegado
> de más: el arreglo ya estaba aplicado y en el intervalo solo se había tocado el cliente. Es
> inofensivo —el archivo es idempotente— pero entrena a re-aplicar por reflejo, y entonces el
> aviso deja de significar algo. La comprobación es `git log -1 --format=%%cd -- supabase/schema.sql`
> contra la fecha de la última fila de esta tabla.
>
> ⚠️ **Cuidado con el orden cuando una función CAMBIA DE FIRMA.** Aplicar el esquema antes de
> publicar el cliente deja una ventana en la que el panel en vivo llama a una firma que ya no
> existe: pasó el 30/08 con `kimun_prof_curso_crear`, y durante esos minutos **crear un curso
> fallaba en producción** aunque las tres comprobaciones dieran `ok`. Con `create or replace`
> normal no ocurre —la función vieja sigue ahí—; ocurre solo cuando hay un `drop`. La regla:
> **si el cambio trae un `drop function`, se publica el cliente ANTES o al mismo tiempo, nunca
> después.**
>
> **Todo lo anterior está aplicado y verificado.** Los códigos de 7° (Sesión 62) se confirmaron
> en vivo contra producción el 28/08, y la comprobación de `kimun_prof_asignaturas` (los dos
> arreglos) devolvió `ok` con los cuatro en **2 y 2**. Es la que importa, porque **si a un
> arreglo le falta un código ese contenido queda invisible para el Profesor Jefe sin ningún
> error**, y la consulta general de cinco filas no lo detecta.
>
> **La regla del proyecto no es "aplicarlo" sino "aplicarlo y mirar el número".** Un código
> ausente de un arreglo, un trabajo de `pg_cron` sin agendar y un esquema sin aplicar se ven
> exactamente igual que si estuvieran bien.

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

### Comprobación del nivel del curso (30/08/2026)

Va aparte porque `kimun_prof_curso_crear` **cambia de firma**, y ese es el caso en que un
esquema a medio aplicar se nota de inmediato: el panel manda `p_nivel` y la función vieja no lo
acepta.

```sql
select 'columna cursos.nivel' as que,
       case when exists(select 1 from information_schema.columns
                        where table_schema='public' and table_name='cursos'
                          and column_name='nivel') then 'ok' else 'FALTA' end as estado
union all
select 'curso_crear con nivel (y SIN la firma vieja)',
       case when (select count(*) from pg_proc
                   where proname='kimun_prof_curso_crear') = 1
             and (select pg_get_function_arguments(oid) from pg_proc
                   where proname='kimun_prof_curso_crear') like '%p_nivel%'
            then 'ok' else 'FALLA: quedaron dos versiones o la vieja' end
union all
select 'kimun_prof_curso_nivel',
       case when exists(select 1 from pg_proc where proname='kimun_prof_curso_nivel')
            then 'ok' else 'FALTA' end;
```

**Las tres filas tienen que decir `ok`.** La segunda importa más de lo que parece: si el `drop`
de la firma vieja no corrió, quedan **dos versiones** de la misma función y PostgREST elige por
los parámetros que le lleguen — un fallo que aparece más tarde y en otra parte.

### Y el aislamiento entre profesores (necesita dos cuentas reales)

El enlace de inscripción **es la credencial y abre el producto completo**, así que quien lo
lea puede repartirlo. Sus dos funciones están detrás de `kimun_prof_es_mio` —admin, super o
**Jefe de ese curso**—, y hay que comprobar que el **servidor** rechaza, no solo que el panel
no dibuja el bloque: cualquiera puede llamar la función desde la consola con la clave pública.

Se hace desde `vulpo.cl/profesor.html`, con la consola del navegador abierta.

**1. Con una cuenta que NO gestione ese curso** (un profe de asignatura, o el Jefe de otro
curso). Las dos deben fallar con `no_autorizado` (HTTP 400: la función hace `raise exception`
y PostgREST lo traduce así):

```js
await SB.rpc('kimun_prof_inscripcion_estado', {p_curso_codigo:'CUR-XXXX'})
await SB.rpc('kimun_prof_inscripcion_crear',
             {p_curso_codigo:'CUR-XXXX', p_cupo:5, p_experimental:true})
```

**2. Con la cuenta de admin, sobre el MISMO curso.** Tiene que responder con datos.

> ⚠️ **El paso 2 no es un extra: sin él la prueba no vale.** Un `no_autorizado` universal
> —una función rota para todos— se ve exactamente igual que el aislamiento funcionando. Es el
> control que se usó en la Sesión 38, donde `profe-prueba4` daba 400 en `HI08` y **200 en
> `MA08`**, su propia asignatura.

**Resultado (30/08/2026): verificado, las dos mitades.** Desde una cuenta ajena las dos
funciones devuelven `no_autorizado`; desde la cuenta de admin el bloque del panel carga y deja
crear el enlace.

> **El paso 2 se ganó el sueldo:** al correrlo, el admin también recibía `no_autorizado` — y no
> era el aislamiento, era que **la segunda tanda del esquema todavía no estaba aplicada**. Sin
> ese control se habría anotado "aislamiento verificado" sobre una función que estaba rota para
> todos. Es exactamente el escenario que el paso 2 existe para descartar.

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
llama con la clave pública que ya vive en `8vo/index.html`. Un código inexistente debe dar
`null`, que es lo que demuestra que la respuesta no es un eco.

```bash
KEY=$(grep -o "sb_publishable_[A-Za-z0-9_-]*" 8vo/index.html | head -1)
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

**2. `kimun_asignaturas_todas` — que el curso nuevo esté en la lista.** Es la que importa:
**si a esa lista le falta un código, ese contenido queda invisible para el Profesor Jefe sin
ningún error**. Desde M4 (31/08/2026) es UNA sola lista —antes eran dos arreglos copiados a
mano dentro de `kimun_prof_asignaturas`, y era fácil actualizar uno solo—.

```sql
select case when array_length(public.kimun_asignaturas_todas(),1) = cursos*4
            then 'ok - estan los ' || cursos || ' cursos x 4 asignaturas'
            else 'REVISAR - hay ' || array_length(public.kimun_asignaturas_todas(),1)
                 || ' codigos y deberian ser ' || cursos*4 end as estado,
       public.kimun_asignaturas_todas() as codigos
from (select 3 as cursos) x;   -- <- cuantos cursos deberia haber
```

Corrido el 31/08/2026 con 3 cursos: **12 códigos**. Al agregar 4°, 5° y 6° hay que subir ese
número; la lista misma se actualiza sola desde `kimun_asignaturas_todas()`, que es lo único que
hay que editar en el servidor al dar de alta un curso.


## Si algo sale mal

El archivo es idempotente, así que **volver a pegarlo completo es la primera reparación a
intentar**. Si el error persiste, guardar el mensaje: dice qué línea falló y eso basta para
diagnosticar.

## Cuándo hay que repetir esto

**Cada vez que se toque `supabase/schema.sql`.** El repositorio y la base de datos no se
sincronizan solos: el archivo es la fuente de verdad, pero alguien tiene que aplicarlo.
