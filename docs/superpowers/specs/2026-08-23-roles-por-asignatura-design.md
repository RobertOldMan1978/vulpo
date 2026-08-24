# Roles por asignatura en un curso

**Fecha:** 2026-08-23
**Estado:** Diseño aprobado, pendiente de plan de implementación

## Contexto

Hoy un curso tiene **exactamente un profesor**: `cursos.profesor_id`. Todas las
funciones del panel pasan por un único portero, `kimun_prof_es_mio(curso)`, que
responde "soy administrador o soy el dueño del curso". No existe la noción de
asignatura en los permisos: quien entra a un curso lo ve completo.

Eso no calza con un colegio real. En un 8° básico hay un **profesor jefe** y
varios **profesores de asignatura**, y cada uno debería ver y reforzar lo suyo.
Además, un mismo profesor puede hacer dos asignaturas (por ejemplo Ciencias e
Historia), y no necesariamente las mismas en todos sus cursos.

Objetivo: que un curso tenga un equipo de profesores con alcance por asignatura,
sin perder nada de lo que hoy funciona.

**Fuera de alcance (proyecto aparte):** el envío semanal de un correo con el
rendimiento de la semana anterior. Requiere infraestructura que VULPO no tiene
(Edge Functions, cron, proveedor de correo) y, sobre todo, **datos que hoy no
existen**: `dominio` guarda solo contadores acumulados, sin historial, así que no
se puede calcular "la semana pasada" sin agregar instantáneas semanales. Se
diseñará por separado, apoyado en los roles de este documento.

## Decisiones tomadas

1. **Tabla de membresías, no columnas en `profesores`.** El alcance es por
   (curso, profesor), no por profesor: un docente puede hacer Ciencias en 8°A e
   Historia en 8°B.
2. **Un solo Profesor Jefe por curso**, garantizado en la base con un índice
   único parcial (mismo patrón que ya usa `desafios` para "un activo por curso").
3. **Multi-asignatura desde el inicio.** `asignaturas` es un arreglo, no un
   campo simple.
4. **Clave canónica de asignatura: el código de 4 caracteres** (`HI08`, `CN08`,
   `LE08`, `MA08`). Ya es lo que usa el filtro del mapa en `profesor.html`.
5. **Vocabulario sigue a su materia; Lectura va a Lenguaje.**
6. **Ranking por asignatura = % de acierto de primer intento**, con un mínimo de
   20 respuestas y mostrando la cobertura de objetivos.
7. **El Profesor Jefe arma su equipo** (y el administrador también).
8. **Lo destructivo queda en el Jefe**: borrar alumnos, fijar XP, reiniciar el
   mapa de dominio y borrar el curso.
9. **Participación visible para todos.** No es dato de otra asignatura y le sirve
   a cualquier profesor saber quién no está entrando.

## Modelo de datos

```sql
create table if not exists public.curso_profesores (
  curso_id    uuid not null references public.cursos(id)      on delete cascade,
  profesor_id uuid not null references public.profesores(id)  on delete cascade,
  rol         text not null default 'asignatura',   -- 'jefe' | 'asignatura'
  asignaturas text[] not null default '{}',         -- {'MA08','CN08'}
  creado      timestamptz not null default now(),
  primary key (curso_id, profesor_id)
);

-- Un solo Profesor Jefe por curso, garantizado en la base.
create unique index if not exists idx_curso_jefe_unico
  on public.curso_profesores(curso_id) where rol = 'jefe';
```

El Profesor Jefe **ignora `asignaturas`**: por definición alcanza todas las del
curso. Se guarda vacío para él.

### `cursos.profesor_id` queda deprecada

La columna **no se lee ni se borra**. Borrar una columna es irreversible y el
`schema.sql` se re-pega completo en cada migración manual; el riesgo no compensa.
Queda comentada como muerta, igual que se hizo con la tabla `config`.

## Mapa de OA → asignatura

Una función única traduce cualquier OA a su asignatura. Es el único lugar del
sistema que conoce esta regla:

| OA | Asignatura |
|---|---|
| `HI08 OA *`, `VOC-HIST` | `HI08` Historia |
| `CN08 OA *`, `VOC-CIEN` | `CN08` Ciencias |
| `MA08 OA *`, `VOC-MATE` | `MA08` Matemática |
| `LE08 OA *`, `VOC-LENG`, `VOC-LECT`, `AF-T1`…`AF-T8` | `LE08` Lenguaje |

```sql
create or replace function public.kimun_oa_asignatura(p_oa text)
returns text language sql immutable as $$
  select case
    when p_oa like 'HI08%' or p_oa = 'VOC-HIST' then 'HI08'
    when p_oa like 'CN08%' or p_oa = 'VOC-CIEN' then 'CN08'
    when p_oa like 'MA08%' or p_oa = 'VOC-MATE' then 'MA08'
    when p_oa like 'LE08%' or p_oa in ('VOC-LENG','VOC-LECT')
         or p_oa like 'AF-T%'                    then 'LE08'
    else null end; $$;
```

Efecto lateral bienvenido: hoy Vocabulario y Lectura **no aparecen** en el filtro
por asignatura del panel, porque sus códigos no calzan con los cuatro prefijos
conocidos. Esta función los hace visibles.

## Permisos

`kimun_prof_es_mio()` se reemplaza por dos funciones:

- **`kimun_prof_acceso(curso uuid) returns boolean`** — ¿puede entrar? Es
  administrador, es el jefe del curso, o tiene al menos una asignatura ahí.
- **`kimun_prof_asignaturas(curso uuid) returns text[]`** — ¿sobre qué puede
  actuar? Administrador y jefe reciben las cuatro; un profe de asignatura recibe
  las suyas.

Un profesor con membresía pero **sin asignaturas** (`asignaturas = '{}'`) es un
caso válido y significa "todavía no le asignan materias": `kimun_prof_acceso`
devuelve falso y el curso no le aparece. Se evita así el estado ambiguo de
"entra pero no ve nada".

Las funciones existentes se ajustan así:

| Función | Cambio |
|---|---|
| `kimun_prof_listar` | Lista los cursos donde tengo membresía (o todos, si soy admin) |
| `kimun_prof_dominio` | Filtra los OA por `kimun_prof_asignaturas` |
| `kimun_prof_dominio_alumno` | Idem |
| `kimun_prof_dominio_oa` | Valida que el OA sea de una asignatura mía |
| `kimun_prof_refuerzo_lanzar` | Valida que la asignatura esté entre las mías |
| `kimun_prof_refuerzo_cerrar` | Valida contra la asignatura del desafío activo |
| `kimun_prof_participacion` | Solo cambia el portero (sigue viéndola todo el equipo) |
| `kimun_prof_alumno_agregar` / `_quitar` | Exigen jefe o admin |
| `kimun_prof_xp_fijar` | Exige jefe o admin |
| `kimun_prof_dominio_reiniciar` | Exige jefe o admin |
| `kimun_prof_curso_quitar` | Exige jefe o admin |

### Matriz de permisos

| Acción | Admin | Profesor Jefe | Profe de asignatura |
|---|:--:|:--:|:--:|
| Ver mapa de dominio | todo | todo | solo sus asignaturas |
| Ver ranking por asignatura | sí | sí | solo sus asignaturas |
| Ver participación del curso | sí | sí | sí |
| Lanzar / cerrar refuerzo | sí | sí | solo de sus asignaturas |
| Gestionar el equipo del curso | sí | sí | no |
| Agregar / quitar alumnos | sí | sí | no |
| Fijar XP a mano | sí | sí | no |
| Reiniciar el mapa de dominio | sí | sí | no |
| Borrar el curso | sí | sí | no |

### Gestión del equipo

Funciones nuevas, exigen jefe o administrador:

- `kimun_prof_equipo(p_curso_codigo)` — lista el equipo con sus asignaturas.
- `kimun_prof_equipo_asignar(p_curso_codigo, p_correo, p_rol, p_asignaturas)` —
  agrega o actualiza a un profesor. Si `p_rol='jefe'`, el jefe anterior baja a
  `asignatura` (el índice único no permite dos).
- `kimun_prof_equipo_quitar(p_curso_codigo, p_correo)` — saca a un profesor del
  curso, incluido el jefe. Ver abajo qué pasa con la cobertura.

El profesor debe existir ya en `profesores` (es decir, haber sido autorizado y
haberse registrado). No se crean cuentas desde aquí.

### Cuando un profesor deja el curso

Los profesores rotan a mitad de año, y el sistema tiene que aguantarlo sin
pérdida ni bloqueos.

**Garantía central: quitar a un profesor no toca ningún dato de desempeño.** La
baja borra una fila de `curso_profesores` y nada más: `dominio`, `perfiles` y
`desafios` quedan intactos. El desempeño pertenece a los alumnos y al curso, no
a quien los acompaña. Cuando llegue el reemplazo, encuentra todo el historial
donde estaba.

**Si se va un profe de asignatura**, sus materias quedan sin titular y **el
Profesor Jefe sigue cubriéndolas**: por diseño alcanza todas las asignaturas del
curso, así que no hay ventana ciega. Puede consultar el mapa y lanzar refuerzos
de esa materia hasta que se asigne un reemplazo.

**Si se va el Profesor Jefe**, el curso queda sin jefe. Pasa a comportarse como
un curso huérfano: **el administrador lo sigue viendo** y puede nombrar al nuevo
jefe. Los profes de asignatura que quedan conservan su acceso a lo suyo.

Nombrar un reemplazo es la misma llamada de siempre,
`kimun_prof_equipo_asignar`: no hace falta un flujo aparte de "traspaso".

## Ranking por asignatura

```sql
kimun_prof_ranking_asignatura(p_curso_codigo text,
                              p_asignatura   text,
                              p_minimo       int default 20)
returns table(alumno text, avatar text,
              resp_1 bigint, ok_1 bigint, pct numeric,
              oa_tocados bigint, suficiente boolean)
```

**No devuelve `codigo_acceso`**, siguiendo el precedente de
`kimun_prof_dominio_oa`: el código de acceso es la credencial con la que el
alumno entra al juego, y un ranking de consulta no necesita exponerla. Se
identifica al alumno por nombre, como en esa función.

- Agrupa `dominio` por alumno, filtrando los OA con `kimun_oa_asignatura(oa) = p_asignatura`.
- `pct = ok_1 / resp_1` (primer intento), que es el mismo criterio del mapa de OA.
- `suficiente = resp_1 >= p_minimo`.
- Orden: `suficiente desc, pct desc` — los que no llegan al mínimo quedan al final.

**Por qué el mínimo.** Sin él, un alumno que respondió seis preguntas y acertó
cinco encabeza el ranking con 83%. Eso es ruido, no dominio. Con el mínimo, ese
alumno aparece en "aún sin datos suficientes", que es información distinta y
también útil para el profesor.

**El umbral es un parámetro, no una constante.** Si 20 resulta alto o bajo en la
práctica, se ajusta sin tocar la base.

**El denominador de la cobertura lo pone el cliente.** La base entrega
`oa_tocados`; cuántos OA tiene cada asignatura vive en `contenido/*/oa.json`, que
`profesor.html` ya carga. Así el catálogo de contenido sigue siendo la única
fuente de verdad y la base no duplica ese dato.

## Cambios en `profesor.html`

1. **Selector de asignatura según quién eres.** Un profe con una sola asignatura
   no ve selector y entra directo a lo suyo; con dos o más ve las suyas; el jefe
   y el administrador ven las cuatro más "Todas".
2. **Bloque de ranking por asignatura** bajo el mapa de dominio, con el grupo
   "aún sin datos suficientes" separado al final.
3. **Bloque "Equipo del curso"**, visible solo para jefe y administrador: lista
   de profesores con sus asignaturas, alta por correo con casillas de materias, y
   baja.
4. **Los botones destructivos no se dibujan** para un profe de asignatura. El
   servidor igual los rechaza; la interfaz no debe ofrecer lo que no se puede
   hacer.

### Dos bugs que se arreglan de paso

Ambos están en el código que este trabajo toca:

- **No se puede lanzar refuerzo de Matemática.** En `objetivosFlojos` el mapa es
  `{Historia:'HI08', Ciencias:'CN08', Lenguaje:'LE08'}` y la lista del bloque es
  `['Historia','Ciencias','Lenguaje']`: Matemática quedó fuera de ambas.
- **Dos convenciones de "asignatura" conviviendo.** El filtro del mapa usa el
  código (`HI08`), pero el botón de refuerzo manda el nombre visible
  (`"Historia"`), así que `desafios.asignatura` guarda un formato distinto al del
  resto del panel.

Se canoniza todo en el código de 4 caracteres, lo que de paso resuelve la
omisión de Matemática. Los desafíos históricos con el nombre visible se
normalizan en la migración.

## Migración

1. Cada `cursos.profesor_id` no nulo se convierte en una fila de
   `curso_profesores` con `rol='jefe'`. **Nadie pierde acceso.**
2. `desafios.asignatura` se normaliza de nombre visible a código
   (`'Historia'` → `'HI08'`, etc.).
3. Los cursos huérfanos (sin `profesor_id`) siguen siendo visibles solo para el
   administrador, como hoy.
4. Todo idempotente: re-pegar `schema.sql` completo no duplica ni rompe.

## Verificación

No hay suite de tests; la verificación es en el navegador, como en el resto del
proyecto. Sobre el curso demo `CUR-BA04`:

1. Crear dos cuentas: una de Profesor Jefe y una de asignatura con Ciencias e
   Historia.
2. Entrar como el profe de asignatura: debe ver **solo** Ciencias e Historia en
   el mapa y en el ranking; nada de Matemática ni Lenguaje.
3. Intentar lanzar refuerzo de Matemática con esa cuenta: debe fallar **en el
   servidor**, no solo estar oculto en la interfaz.
4. Entrar como Jefe: ve las cuatro asignaturas, ve el equipo y tiene los botones
   destructivos.
5. Confirmar que el vocabulario aparece repartido por materia y que Ana Frank
   queda en Lenguaje.
6. Confirmar que un profesor con una sola asignatura no ve selector.
7. **Rotación sin pérdida:** quitar al profe de Ciencias e Historia y comprobar
   que (a) el mapa de dominio de esas materias sigue completo, (b) el Profesor
   Jefe las sigue viendo y puede lanzar refuerzo, y (c) al asignar un reemplazo,
   este encuentra todo el historial intacto.
8. Quitar al Profesor Jefe y confirmar que el curso le sigue apareciendo al
   administrador, que puede nombrar uno nuevo.
9. Sin errores en la consola.

## Lo que queda fuera a propósito

- **El correo semanal.** Proyecto aparte, ya explicado en el contexto.
- **Tocar el XP global del juego.** El ranking por asignatura es del panel del
  profesor; el alumno sigue viendo su ranking de XP como hoy.
- **Roles más finos** (solo lectura, jefe de departamento, coordinación de
  ciclo). No se pidieron y agregarlos ahora complica sin beneficio.
- **Crear cuentas desde el panel del curso.** El alta de profesores sigue pasando
  por la lista blanca del administrador.
