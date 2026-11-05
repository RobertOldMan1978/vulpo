# 1° básico — diseño

**Fecha:** 05/11/2026 · **Estado:** aprobado por Roberto en la conversación.

## Qué y por qué

VULPO suma su octavo curso. 1° básico va después de 2° (spec
`docs/superpowers/specs/2026-11-04-2-basico-design.md`) y sigue **su mismo camino**. Este documento
dice solo lo que cambia. La voz pregrabada va directo a Cloudflare R2 (`voz.vulpo.cl`, Sesión 138),
así que el techo de 1 GB de GitHub Pages no limita.

**La diferencia de fondo:** a los 6-7 años muchos niños **todavía no leen**, sobre todo en el primer
semestre. En 1° la voz deja de ser una ayuda y pasa a ser la forma principal de jugar.

## Decisiones de Roberto (05/11/2026)

| Pregunta | Decisión |
|---|---|
| Alcance | **Las 4 asignaturas completas**, todos los OA que admitan una pregunta honesta |
| Formato | **4 opciones**, enunciados **≤ 50 caracteres** (≤ 110 con fragmento), opciones de 1-3 palabras o un número |
| Preguntas por etapa | **8** (jefe de capítulo 12). Umbral de 66% y estrellas por razón, como siempre |
| Extras | **Reto Sin Fin** (sumas y restas hasta 20, sin reloj) y **Vocabulario** (Ciencias e Historia) |
| Voz | **Lee sola** la pregunta y sus opciones al aparecer; el 🔊 queda para repetir |
| Orden | Igual que 2°: currículum → reparto (lo aprueba Roberto) → banco con lectura completa → aprobación → fork → voz → arte → publicación |
| Trabajo | De a poco: **2 agentes a la vez, 2-3 OA cada uno** |

## Parte 1 · Contenido

- Carpetas `contenido/{matematicas,lenguaje,ciencias,historia}-1basico/`, códigos **`MA01`, `LE01`,
  `CN01`, `HI01`**, transcritos de la **página individual de cada OA** en curriculumnacional.cl (la
  ficha por asignatura corta los textos).
- `oa.json` con el mismo esquema de 2°, `validar-oa-json.py` en 0 errores y `generar-tablero.py`
  saliendo.
- **Fuera del banco** en `oa_excluidos_del_banco`: lo que no admite una pregunta honesta
  (caligrafía, trazar letras, producción oral o escrita pura). En 1° probablemente son más que en 2°.
- **30 preguntas por OA**, escritas según `docs/encargo-banco.md` con una fila nueva de 1°: 6-7
  años, sin reloj, enunciado ≤ 50, con voz que lee sola, `visual` permitido y recomendado en
  Matemática (contar, agrupar, recta, cuerpo).
- ⚠️ **Todo se responde ESCUCHANDO.** En Lenguaje de 1° (sonido inicial, sílabas, rimas, vocales,
  letras) se aplican las reglas de 2°, más estrictas: se nombran las letras, nunca se escribe una
  sílaba que delate la respuesta, y en «¿qué palabra empieza/termina/rima…?» la correcta es la
  **única** opción que **suena** como se pide. `auditar-audible-nivel.py` no caza todo: la
  **lectura completa pregunta por pregunta** es obligatoria, como en 2°.
- Auditorías: `revisar-tanda.py --largo=50`, `auditar-banco-nivel.py` (topes de 1° en su `LARGO`),
  `auditar-numerico.py`, `auditar-audible-nivel.py` y `auditar-solape-oa.py` **sobre el
  `preguntas.json` consolidado** (sobre `_pool` no compara nada).
- **Vocabulario:** `contenido/vocabulario-1basico/`, ~60 preguntas en `VOC-CIEN` y `VOC-HIST`, sin
  repetir las de 2°.
- **Lecciones:** mini-clase por OA en Matemática; introducciones donde el veredicto capítulo por
  capítulo las justifique (Historia siempre, con su marco); en Lenguaje, práctica con `mide:false`.

## Parte 2 · El juego

- **Fork `1ro/index.html`** clonado de `2do/`. Ruta `vulpo.cl/1ro/`. `SUFIJO='_1ro'`,
  `storageKey:'kimun-1ro'`, manifiesto propio con `<link>` absoluto, portadas explícitas.
- Banderas como 2° (`SIN_RELOJ`, `DUELO_SEG=30`, `HAY_MINICLASES`, `HAY_SINFIN`, `HAY_VOCABULARIO`
  con `voc-general`, `HAY_CIVICA` si Historia de 1° trae el eje), más **`LEE_SOLO=true`**.
- **`LEE_SOLO` (nuevo, en `assets/js/motor.js`):** al pintar una pregunta del quiz (la única
  pantalla que hoy tiene 🔊: el Jefe Final y el duelo no llevan voz en ningún curso), llama a la misma lectura que el 🔊 (`leerPreguntaEnVoz`). Nace **apagada**: se lee con
  `typeof LEE_SOLO!=='undefined' && LEE_SOLO`, así ningún otro fork cambia y un fork viejo en caché
  no revienta. Se corta al responder y al cambiar de pantalla (`callarVoz`, ya existe). No lee en
  modo `?rev=1` ni en el armador.
- Generador `genCalc1` del Sin Fin (sumas y restas hasta 20), verificado con 1.500 operaciones
  recalculadas por otro camino.
- `META_OA` con una meta por OA; nivel `01` en `assets/js/niveles.js` y en
  `kimun_asignaturas_todas()` (se **aplica al publicar**); generadores de planificación a 8 cursos.
- Verificación jugando con `cdp.mjs`, como 2°, más: la voz arranca sola al aparecer la pregunta y
  se calla al responder.

## Parte 3 · Voz, arte y publicación

Igual que 2°: voz después de aprobar (Catalina, −10%, carpetas `mat1`, `len1`, `cie1`, `hist1`,
`voc1`, directo a R2); villanos y portadas nuevas con el estándar de arte, reutilizando por tema;
publicación solo con el curso completo.

## Fuera de alcance

Libro de lectura, Modo Difícil, Reto de Cálculo con niveles.
