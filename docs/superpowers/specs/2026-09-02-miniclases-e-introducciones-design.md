# Mini-clases en 3° y 7°, e introducciones de Ciencias

**Fecha:** 02/09/2026 · **Estado:** diseño aprobado, sin implementar

## De dónde sale

Roberto notó que **el armador no mostraba las mini-clases** (se corrigió el mismo día, ver la
bitácora) y pidió, a partir de ahí, dos cosas: llevar las mini-clases al resto de los cursos de
Matemática, y evaluar si otra asignatura necesita una introducción.

## Qué se construye

1. **45 mini-clases de Matemática**: 19 en 7° y 26 en 3°, con el formato ya probado en 8°.
2. **Las introducciones de Ciencias**: una por capítulo, en los tres cursos escritos (~13).
3. Y antes de las dos, **dos piezas de infraestructura** que hoy no existen y que las bloquean:
   el motor de lecciones fuera del fork, y un camino de aprobación para lo que enseña.

## Lo que se midió, antes de decidir

| | 3° | 4° | 5° | 6° | 7° | 8° |
|---|---|---|---|---|---|---|
| OA de Matemática | 26 | 27 | 27 | 24 | 19 | 17 |
| Banco de preguntas | 792 ✅ | 0 | 0 | 0 | 570 ✅ | 603 ✅ |
| Mini-clases | — | — | — | — | — | **17** ✅ |
| Capítulos de Matemática | 7 | — | — | — | 4 | 4 |

**140 OA de Matemática en los seis cursos, 17 con mini-clase: faltan 123.**

⚠️ **Pero la práctica de una mini-clase saca del banco** (`fromBank`), y **4°, 5° y 6° no tienen
banco**. Sus 78 mini-clases no se pueden escribir antes que su banco (Bloque B): es una
dependencia dura, no una preferencia de orden. Por eso el alcance de este trabajo son **3° y 7°**.

## Alcance

**Dentro:** 7° (19), 3° (26), las introducciones de Ciencias de 3°, 7° y 8°, el motor extraído y
la aprobación de lecciones.

**Fuera, y por qué:**

- **4°, 5° y 6°** — bloqueados por su banco. Quedan planificados, no escritos.
- **Historia y Lenguaje.** Historia ya tiene sus 4 dibujos propios en 3° (globo, zonas, línea de
  tiempo, cuadrícula) usados en 33 preguntas; una introducción ahí sería ambientación, no
  enseñanza. Lenguaje es la peor candidata al formato: **17 de sus 31 OA de 3° son producción o
  hábito**, y una clase que enseña a escribir no tiene cómo comprobar con un quiz que se aprendió.
- **Fusionar los dos catálogos de dibujo** (ver abajo).

## Las decisiones

### 1. El mapa de 3° y 7° pasa a «enseña → desafío», como 8°

La mini-clase de la unidad y a continuación su capítulo. Es el formato probado y es el que hace
que **aprender desbloquee el juego**, que era el punto del camino de aprendizaje.

**Sin migración cortés, y eso lo decide un hecho, no una preferencia.** El primer borrador de
este diseño la daba por obligatoria, porque 3° tiene un curso inscrito: un niño que iba en el
capítulo 4 se habría encontrado el juego pidiéndole volver atrás. Roberto confirmó el 02/09 que
**ese curso es de prueba y la invitación todavía no se manda**, así que no hay ninguna partida real
que proteger.

Se saca del alcance a propósito, y no por ahorrar trabajo: sería **una rama que nadie ejerce**, y
una rama que nadie ejerce es una rama que no se prueba. Además el comportamiento queda **igual al
de 8°**, que es lo que mantiene convergentes los forks.

> ⚠️ **Pero el día que se reordene un mapa con alumnos vivos, hace falta.** El patrón es el de la
> Sesión 29 al atar el Reto de Cálculo a las lecciones: *un nivel ya dominado antes sigue abierto*.
> Queda anotado aquí para no volver a descubrirlo.

**Lo que sí hay que decir, porque se ve:** un alumno de prueba con capítulos ya vencidos **no
pierde nada** —el progreso se guarda por id de ruta y los ids no cambian— pero verá el siguiente
capítulo pidiéndole su mini-clase. Eso es el comportamiento correcto, no un defecto.

### 2. El motor sale a `assets/js/lecciones.js`

Hoy vive **solo en `juego/index.html`**, y el corte es limpio porque el archivo ya lo tiene
separado por secciones:

| Líneas | Qué | Va |
|---|---|---|
| 1913–2235 | `CATÁLOGO DE DIAGRAMAS` (los 12 widgets interactivos) | al módulo |
| 2236–2391 | `MOTOR DE LECCIONES` (`abrirLeccion`, `renderBloque`, `avanzarBloque`…) | al módulo |
| 2392–2622 | `RETO DE CÁLCULO` | **se queda** |

Son **479 líneas** las que se mueven. La Sesión 65 las **cortó** de 3° y 7° porque ahí eran código
muerto; ahora tienen que volver, y la alternativa a extraerlas es copiarlas en cada fork —
exactamente lo que el Bloque M vino a deshacer, y con 4°, 5° y 6° por delante serían seis copias.

⚠️ **Y el corte tiene una SEGUNDA parte, que es la peligrosa.** La misma Sesión 65 se llevó
además cuatro funciones sueltas que viven **fuera** de ese tramo e **intercaladas con código
vivo**: `renderCampañaMate` (2931), `jefeFinalMateDesbloqueado` (2966), `capMateCompleto` (2967) y
`cargarPoolMate` (2974). Sin ellas el mapa «enseña → desafío» no se dibuja.

Ahí **no se corta por rangos sino por balance de llaves**, que es la regla que la Sesión 65 dejó
escrita. Las vecinas `odPreguntasCalc` (3023) y `odMapasMate` (3055) son del Reto y del duelo:
**no viajan**.

Sigue las reglas de módulo ya establecidas: **respaldo vacío obligatorio**, probado con el archivo
ausente; **se lleva su CSS**; y **nace dormido**, despertando con un `init` que recibe los datos
del curso — con la llamada **pegada a la declaración de esos datos**, nunca arriba con las otras
constantes (la trampa de la zona muerta temporal, que ya mordió cuatro veces).

⚠️ **El Reto de Cálculo NO viaja con él**, aunque vive pegado en el mismo tramo del archivo. Es
otra cosa: la Sesión 74 midió esa migración y la descartó (8° no carga `calculo.js`, y su Reto
tiene niveles, etapas y el Jefe El Autómata que ese módulo no sabe hacer). Su sección empieza
donde termina la del motor, así que el corte no tiene que desentreverar nada — pero sí hay que
**guardar las referencias cruzadas** antes de tocar, que es lo que casi mata las dos apps en la
Sesión 65 (`detenerTimersActivos` hace `clearInterval(RC.timer)` y la llama la barra inferior).

### 3. Los dos catálogos de dibujo se quedan separados

| | Dónde | Tipos | Qué son |
|---|---|---|---|
| `visuales.js` | compartido | 11 | **estáticos**, dentro de una pregunta |
| `lecciones.js` (hoy `DIAGRAMAS`) | pasará a compartido | 12 | **interactivos**, para enseñar |

Comparten tres nombres —`recta`, `barras`, `fraccion(es)`— con implementaciones distintas. **No se
fusionan:** un dibujo que ilustra una pregunta y uno que el niño arrastra para descubrir una regla
son dos cosas legítimamente distintas, y unificarlas es un refactor con riesgo sobre producción a
cambio de nada. Lo que sí se hace es **documentar el solape**, para que nadie lo lea como un
descuido.

### 4. Las introducciones de Ciencias reusan el motor, sin una línea nueva

**El motor ya admite lecciones sin práctica**: `avanzarBloque` llama a `terminarLeccion()` cuando
se acaban los bloques, y esa función marca la lección completa igual. Así que una introducción es
**una lección de 2-3 bloques sin bloque `practica`**: encuadre + un dibujo del modelo.

Es una por **capítulo**, no por OA: 4 en 3°, 5 en 7°, 4 en 8° = **13**. Una por objetivo serían 92
en los seis cursos, más que todo lo que falta de Matemática.

**Por qué Ciencias y no otra:** medido, **Ciencias tiene 0 preguntas con dibujo en sus 1.374**, en
los tres cursos escritos. Se enseña y se evalúa 100% con texto — célula, circuitos, sistemas del
cuerpo, cambios de estado. Y le calza la introducción y no la mini-clase porque el formato de
Matemática se sostiene en el bloque **`ejemplo` revelado paso a paso**, que solo tiene sentido
donde hay un procedimiento que ejecutar. En Ciencias lo que falta es el **modelo visual**.

### 5. ⚠️ La aprobación de lo que enseña, que hoy no existe

**Ninguna herramienta toca `lecciones.json`**: ni `generar-tablero.py`, ni un validador, ni
`generar-revision-preguntas.py`, ni los scripts de voz. Las 17 mini-clases de 8° llevan
**enseñando** desde la Sesión 29 sin ninguna firma, y no hay forma de dárselas.

No contradice lo que dice la landing —*"7.805 **preguntas** aprobadas"* es cierto— pero escribir 45
más multiplica por 3,6 el contenido que enseña sin revisar, y una mini-clase equivocada es peor que
una pregunta equivocada: la pregunta se falla y se corrige, la clase se cree.

**La herramienta va ANTES de escribir**, que es la lección de la Fase 0: descubrir un defecto del
estándar con 6 lecciones cuesta la sexta parte que con 45.

Alcance mínimo: que el informe de revisión (`generar-revision-preguntas.py`) incluya las lecciones
de la asignatura, **con sus diagramas dibujados de verdad** —reusando `visuales.js` y el módulo
nuevo, como ya hace con los apoyos visuales— y que el tablero las cuente aparte de las preguntas,
sin mezclarlas en el porcentaje de cobertura curricular.

### 6. La voz de 3° va al final, nunca en paralelo

Medido sobre las 17 lecciones de 8°: **8 fragmentos locutables por lección** (textos, la intro del
diagrama y los pasos del ejemplo). Para las 26 de 3° son **~230 clips ≈ US$0,15**.

⚠️ **El generador de voz tampoco sabe leer `lecciones.json`** — hay que extenderlo, y ahí aplica
el *gotcha* de la Sesión 60: el manifiesto se indexa por el **texto mostrado**, así que un texto
corregido después deja su clip huérfano sonando como antes, en silencio.

Y la regla de la Sesión 61, que ya se pagó una vez: **la voz se genera después de auditar**, nunca
junto con las auditorías. Cada texto corregido obliga a regenerar su clip y a pagarlo de nuevo.

## Orden de trabajo

El orden no es negociable en sus tres primeros pasos: cada uno desbloquea al siguiente.

| | Qué | Por qué va aquí |
|---|---|---|
| **1** | Extraer `assets/js/lecciones.js` | Sin esto, escribir mini-clases en 3° y 7° significa copiar 694 líneas por fork |
| **2** | El camino de aprobación de lecciones | La herramienta antes del contenido, no después |
| **3** | **7°: 19 mini-clases** | Es el curso más parecido a 8° —misma edad, mismo formato, sin voz—, así que valida el motor extraído con el menor riesgo |
| **4** | **3°: 26 mini-clases** + su voz | Suma `SIN_RELOJ`, la voz y los widgets de curso chico |
| **5** | Ciencias: 13 introducciones | Reusa todo lo anterior; cero motor nuevo |

**Tanda de validación antes de escalar**, en 7° y otra vez en 3°: las 4-5 primeras lecciones
completas y revisadas antes de escribir las demás.

## Los widgets

Entre los dos catálogos (11 + 12) 3° y 7° quedan casi cubiertos. Faltarían del orden de **4 a 6
nuevos**: dinero y pictograma para 3°; círculo y proporcionalidad para 7°. Se confirman al escribir
la tanda de validación, no antes — el catálogo de 8° también creció capítulo a capítulo.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Reordenar el mapa de un curso con alumnos inscritos | **No aplica hoy**: el curso de 3° es de prueba y la invitación no se ha mandado (confirmado 02/09). Si eso cambia antes de implementar, vuelve a hacer falta la migración cortés |
| **Cortar las 4 funciones sueltas intercaladas con código vivo** | Balance de llaves, no rangos; y guardar antes las referencias cruzadas con el Reto |
| El motor extraído rompe 8°, que está en producción | Respaldo vacío + canaria; verificar los **tres** cursos tras el corte, jugando; el corte con anclas exactas y aserciones, nunca por índices |
| 45 mini-clases sin aprobar, como las 17 de hoy | La herramienta va en el paso 2, antes de escribir |
| Corregir un texto después de generar la voz | La voz al final del curso, después de auditar |
| El catálogo de widgets se descubre tarde | Tanda de validación de 4-5 lecciones antes de escalar |

## Verificación

Corriendo la página con `scripts/cdp.mjs`, en **los tres cursos** y no solo en el que se tocó:

- [ ] Se juega una mini-clase entera en 7° y en 3°: texto → diagrama interactivo → ejemplo paso a
      paso → práctica del banco, y queda ✓.
- [ ] El mapa intercala lección y capítulo, y **una partida sembrada antes del cambio conserva su
      progreso** (los ids de ruta no cambian), aunque el siguiente capítulo pida su mini-clase.
- [ ] 8° sin regresión: 17 lecciones, 12 diagramas, 5 niveles del Reto, `scr-calc-mapa` abre.
- [ ] **Con `assets/js/lecciones.js` ausente**, los tres cursos siguen jugándose.
- [ ] El armador muestra las mini-clases de cada curso, y `?rev=1` sirve 3 preguntas por práctica.
- [ ] La voz de 3°: cobertura completa y ningún clip de 0 bytes.
- [ ] **Cero errores de consola y cero 404.**
