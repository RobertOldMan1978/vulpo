# El semáforo de planificación en el juego del alumno

**Fecha:** 2026-09-08
**Estado:** diseño aprobado, pendiente de plan de implementación.

## El problema

Desde la Sesión 101 el orden es **libre por defecto** (`ORDEN_LIBRE`): el alumno abre el juego y ve
todos los capítulos desbloqueados, porque cada colegio pasa las unidades en su propio orden. El
efecto secundario: **el niño (y su papá) no saben qué toca jugar esta semana.** Ven veinte
capítulos abiertos y ninguno dice "esto es lo que tu curso está viendo".

El profesor ya declara las fechas de cada unidad (la planificación del año, Sesión 108), y el panel
ya distingue tres estados por unidad (Sesión 110: 📖 en clases ahora / 🕒 todavía no empieza / 📚
terminada). **Ese dato existe y no llega al juego del alumno.** Esta feature lo lleva.

## Decisiones tomadas (con Roberto, 08/09/2026)

1. **El semáforo completo**, los tres estados, como el panel — no solo destacar la actual. La actual
   se destaca fuerte (es lo que el niño debe jugar); las terminadas y las futuras se marcan suave
   (contexto para el papá).
2. **Todo sigue jugable.** No vuelven los candados del orden. Solo cambia lo que se *destaca*.
3. **También un resumen en el menú de asignaturas** (*"Historia · están viendo la unidad 2"*), para
   que el niño sepa a qué asignatura entrar sin abrir las cuatro.
4. **Solo en el juego del niño** (que el papá mira desde el mismo teléfono). El informe del apoderado
   —"Cómo va"— **no se toca**: es otra pantalla y otro frente, queda para después.
5. **Sin planificación, la pantalla queda idéntica a hoy.** La misma regla del panel: una feature que
   le cambia la pantalla a quien no la usa, estorba. Hoy casi ningún curso tiene fechas cargadas.

## El dato: `kimun_mi_plan()` (backend nuevo)

Hoy solo el profesor lee la planificación (`kimun_prof_plan`, portero de profesor). El alumno
necesita la suya. Función nueva:

```
kimun_mi_plan() returns table(asignatura text, unidad text, titulo text, inicio date, termino date)
```

- Resuelve el curso con `kimun_yo()` → `perfiles.curso_id`, y devuelve las filas de `unidades_plan`
  de ese curso. Sin parámetros: el alumno solo puede ver **su** curso.
- ⚠️ **NO devuelve `nota`, ni `profesor_id`, ni nada de `unidades_plan_log`.** El registro de quién
  movió qué fecha y por qué es material de evaluación docente, solo para la UTP (Sesión 108). El
  alumno recibe únicamente asignatura, unidad, título y las dos fechas.
- Si el alumno no tiene curso (`curso_id` null), devuelve vacío — el juego degrada a "sin plan".
- Va en el `grant execute … to anon, authenticated` (el alumno es una sesión anónima).

## El cliente: cómo el juego calcula y muestra el estado

### El estado de una unidad
La misma lógica del panel (Sesión 110), con la fecha de hoy:

```
si termino && termino < hoy  → 'terminada'
si inicio  && inicio  > hoy  → 'futura'
si no (y hay alguna fecha)   → 'clases'
sin fechas                    → '' (sin marca)
```

### El puente capítulo ↔ unidad
El plan marca por **unidad** (`asignatura`, `unidad` = id de `oa.json`, p. ej. `HI05` + `U1`). El
juego muestra **capítulos** (`EXPEDICIONES`), cada uno con su `asignatura` y sus `etapas[].oas`. El
puente es el OA: cada OA pertenece a una unidad (lo dice `oa.json`).

**El juego no carga `oa.json` hoy, y no queremos que lo haga siempre.** La solución, con degradación
gratis:

1. El juego llama `kimun_mi_plan()` al arrancar (junto al resto de la carga del curso).
2. **Solo si devuelve filas** (el curso tiene plan), el juego carga un **mapeo ligero OA→unidad de su
   curso** —un archivo generado por script desde los `oa.json`, `{ "HI05 OA 01": "U1", … }`, mucho
   más chico que el `oa.json` completo— y cruza: para cada capítulo, mira las unidades de sus OA,
   toma su estado.
3. Sin plan, no se carga nada extra: la pantalla es la de hoy.

⚠️ **Un capítulo con OA de varias unidades toma el estado MÁS ACTIVO** (clases > futura > terminada),
igual que el panel: si algo de ese capítulo se está pasando, es de esta semana. Es el caso de
Lenguaje, cuyos capítulos son temáticos y cruzan unidades.

### Cómo se ve

**En la campaña** (los capítulos de una asignatura), cada nodo gana su marca:

| Estado | Distinción |
|---|---|
| 📖 **En clases ahora** | **Destacado fuerte**: borde/brillo dorado en el nodo + etiqueta *"👉 Están viendo esto en tu curso"* |
| 📚 **Terminada** | Marca suave: *"Ya lo pasaron · repasa"* |
| 🕒 **Todavía no empieza** | Marca suave: *"Aún no lo ven"* |

⚠️ **Solo el "en clases" lleva acento dorado**, para que la mirada del niño caiga ahí — es lo único
accionable. Es la misma decisión del panel: los iconos son de libro/reloj, **no puntos de color**,
porque en el juego el color ya significa otras cosas (rendimiento, dificultad).

**En el menú de asignaturas** (las 4 tarjetas que el niño ve primero), cada asignatura con una unidad
en curso muestra un renglón chico: *"📖 Están viendo: [título de la unidad]"*. Si una asignatura no
tiene nada en curso, no muestra nada (no inventa).

### Degradación
Si `kimun_mi_plan()` vuelve vacío, o el niño no tiene curso, o falla la red: **cero marcas, la
pantalla de hoy**. El fallo de la planificación **nunca** impide jugar.

## Casos de borde

| Caso | Qué pasa |
|---|---|
| Curso sin planificación | Todo como hoy, sin marcas |
| Varias unidades "en clases" (una por asignatura) | Cada una se destaca en su campaña; el menú lista cada asignatura |
| Unidad planificada sin capítulo jugable | No aparece (el juego solo marca capítulos que existen) |
| Capítulo con OA de dos unidades, una en clases y otra terminada | Estado "en clases" (el más activo) |
| Modo prueba / muestra (`?solo=`, `?m=`) | Sin semáforo — es una sesión sin curso ni identidad; no llama `kimun_mi_plan()` |
| `?qa=1` | Sin semáforo, como el resto de lo que no mide |

## Fuera de alcance

- **El informe del apoderado ("Cómo va").** Queda para después, por decisión de Roberto.
- **Volver a bloquear el orden.** El orden sigue libre; esto solo destaca.
- **Notificar / empujar al niño** ("juega esto ahora" en el inicio con un botón). Se evaluó como
  opción 3 y no se eligió; el semáforo en la campaña + el resumen del menú alcanzan.
- **Cambiar la planificación del profesor.** Esta feature solo la *lee* desde el lado del alumno.

## Cuidados técnicos

- ⚠️ **`kimun_mi_plan` es de lectura y el alumno la llama** (rol `authenticated` anónimo): se prueba
  contra producción como las demás —`400`/`404` con su control negativo—, pero además hay que
  comprobar que **NO expone `nota` ni el log**, que es la restricción de privacidad de la Sesión 108.
- El mapeo OA→unidad generado se regenera cuando cambie un `oa.json` (como el tablero). El script que
  lo genera cruza `unidades[].oa` de cada banco.
- Va en **`assets/js/`** si la lógica se comparte, o en `motor.js` si es del juego — a decidir en el
  plan. Como toca los 6 forks por igual, el patrón del proyecto es el módulo compartido.
- Verificación **mirando la captura**, no contando: el destacado del nodo es visual (la lección
  repetida del proyecto).
