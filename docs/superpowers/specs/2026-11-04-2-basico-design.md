# 2° básico — diseño

**Fecha:** 04/11/2026 · **Estado:** aprobado por Roberto en la conversación, pendiente de plan.

## Qué y por qué

VULPO publica seis cursos (3° a 8°). Roberto quiere sumar **2° y 1° básico**, en ese orden. Este
documento cubre **2°**; 1° tendrá su propio diseño. El obstáculo de infraestructura —la voz
pregrabada no cabía en el techo de 1 GB de GitHub Pages— quedó resuelto en la Sesión 138: la voz
vive en Cloudflare R2 (`voz.vulpo.cl`) y los MP3 de cursos nuevos nacen fuera del repo.

## Decisiones de Roberto (04/11/2026)

| Pregunta | Decisión |
|---|---|
| Alcance | **Las 4 asignaturas completas** (Matemática, Lenguaje, Ciencias, Historia), todos los OA |
| Formato del quiz | **10 preguntas por etapa**, como 3°, pero **enunciados de hasta ~70 caracteres** y opciones de pocas palabras; sin reloj y con voz |
| Extras | **Reto Sin Fin** de cálculo y **Vocabulario**. Sin libro de lectura |
| Orden | **Currículum → banco → aprobación → fork → voz → arte → publicación** (el camino de 4°, 5° y 6°) |
| Google Play | Postergado hasta terminar 1° básico (una sola compilación de la app) |

Vienen además por regla del proyecto, sin decisión aparte: **mini-clases de Matemática** (una por
OA, `docs/estandar-miniclases.md`), **introducciones** donde el veredicto capítulo por capítulo las
justifique, y **Formación Ciudadana** si Historia de 2° trae ese eje.

## Parte 1 · Contenido

### Currículum
- Cuatro carpetas nuevas: `contenido/{matematicas,lenguaje,ciencias,historia}-2basico/`, con códigos
  **`MA02`, `LE02`, `CN02`, `HI02`**.
- Los OA se transcriben de `curriculumnacional.cl` usando la **página individual de cada OA**
  (`…/<asignatura>/2-basico/<cod>-oa-NN`). ⚠️ La ficha por asignatura devuelve los textos cortados
  a media frase y parecen completos (Sesión 71).
- Estimado ~85 OA; el número real sale de la transcripción. Cada `oa.json` pasa
  `scripts/validar-oa-json.py` en 0 errores, y después **`generar-tablero.py` tiene que seguir
  saliendo** (un `oa.json` con otro dialecto deja sin tablero a todos los bancos).
- **Fuera del banco**, declarado en `oa_excluidos_del_banco` y no en prosa: los OA que no admiten
  pregunta honesta (caligrafía y similares). Las habilidades (OAH) y actitudes (OAA) de Ciencias
  tampoco entran: miden desempeño observable, y su código con letra no calza con el servidor.
- OA **actitudinales** de Historia: se miden siempre sobre un tercero con nombre, nunca sobre la
  conducta del niño. Su advertencia va en `nota_evaluacion`.

### Reparto en capítulos
- Historia y Ciencias siguen las **unidades del Programa de Estudio**.
- Lenguaje va **por tema**, con `capitulos_del_juego` (como 3°), porque sus unidades repiten OA.
- Matemática: ~4 OA por capítulo, jefe de capítulo al final.
- Cada etapa es un OA; cada capítulo, 4 etapas + jefe (3 si la unidad tiene 3 OA).
- **Roberto ve el reparto antes de escribir una sola pregunta.**

### Banco
- **30 preguntas por OA** (~2.600 en total), 4 opciones, escritas según `docs/encargo-banco.md`
  más el `cuidados-<asignatura>.md` de turno. Se agrega la fila de 2° a la tabla del §0 del
  encargo: 7-8 años, sin reloj, **enunciado ≤ 70 caracteres**, con voz, `visual` permitido.
- **Todo debe poder responderse escuchando** (`auditar-audible-nivel.py`, como en 3° y 4°). Los OA
  de Lenguaje sobre letras, sílabas y sonidos son los de más riesgo: una pregunta que depende de
  ver la grafía no sirve por voz, y ese caso el auditor no lo caza, hay que leerlo.
- Matemática usa los 11 dibujos de `assets/js/visuales.js` (y, si hace falta, los widgets de
  `lecciones.js` con `kind`). Regla de siempre: **el dibujo no puede delatar la respuesta**.
- **Agentes de a 3-4 por vez**, 2-3 OA por agente (60-90 preguntas), escribiendo el archivo
  temprano. Antes de relanzar un agente caído, **mirar el disco**.
- **Tanda de validación primero** (2-3 OA de riesgo real): conciencia fonológica / lectura inicial
  de Lenguaje, un actitudinal de Historia y uno de Matemática con dibujo.
- Auditorías sobre el 100%: `revisar-tanda.py --largo=70`, `auditar-banco-nivel.py`,
  `auditar-numerico.py`, `auditar-solape-oa.py`, `auditar-audible-nivel.py`. Sesgo de largo ≤ 27%,
  corregido dando cuerpo a los distractores, nunca acortando la correcta.
- Consolidación con `consolidar-pool-nivel.py`; nace `revisada:false`; aprobación de Roberto en el
  tablero.
- **Vocabulario:** `contenido/vocabulario-2basico/`, ~60 preguntas en dos áreas (`VOC-CIEN`,
  `VOC-HIST`), palabras nuevas de esas asignaturas, sin repetir las de 3°. Sin contenido sensible.

## Parte 2 · El juego

- **Fork `2do/index.html`** clonado de `4to/` (el más reciente con voz y sin reloj). Ruta
  `vulpo.cl/2do/`, según la convención de nombres de curso.
- Identidad propia: `SUFIJO='_2do'`, `storageKey:'kimun-2do'`, `2do/manifest.webmanifest`
  (con `<link>` de ruta absoluta), portadas **explícitas** (`portadaMapa`) en todos los capítulos.
- Banderas, todas declaradas explícitamente:

| Bandera | Valor |
|---|---|
| `SIN_RELOJ` | `true` (el duelo sí lleva reloj) |
| `DUELO_SEG` | `30` |
| `DUELO_BANCO` | Historia de 2° |
| `HAY_MINICLASES` | `true`, pegada a `LECC.init` |
| `HAY_SINFIN` | `true`, con un generador propio de 2° (sumas y restas hasta 100, dobles), sin reloj, verificado con un recálculo independiente de 1.500 operaciones |
| `HAY_VOCABULARIO` | `true`, **junto con** la expedición `voc-general` |
| `HAY_CIVICA` | `true` si Historia de 2° trae el eje de Formación Ciudadana; si no, `false` |
| `HAY_DIFICIL`, `MAESTRIA_CALC`, `HAY_RETO_CALCULO`, `HAY_BIBLIOTECA` | `false` |

- Matemática como campaña de mini-clases (`esLecciones` + `capitulosMate`), con las lecciones
  bloqueando la primera etapa de su unidad. Su `lecciones.json` va en `rutas:[…]` de `LECC.init`.
- **`META_OA`**: una meta en lenguaje de niño por OA. Comprobación obligatoria: ninguna etapa sin
  meta (solo pueden faltar los `VOC-*`).
- **Puerta:** `FECHA_PUERTA='2026-10-01'` (ya cerrada, como los otros seis). `DEMO_LIBRE` = el
  capítulo 1 de Matemática, que `asigAbierta` y `renderCampañaMate` ya saben abrir (A64).
- **Backend:** una fila en `NIV.NIVELES` (`assets/js/niveles.js`) y una en
  `kimun_asignaturas_todas()` de `supabase/schema.sql`. Esta última **la aplica Roberto** y se
  verifica con control positivo y negativo (`MA02 OA 01` → `MA02`, un código inventado → `null`).
- **Contenido sensible:** al transcribir se revisa cada OA contra `docs/contenido-sensible.md`; lo
  que entre va también a `assets/js/sensible.js`.
- **Verificación con `cdp.mjs`, jugando:** JUGADOR navega (la pantalla cambia), se juega una etapa
  de cada asignatura, una mini-clase y el Sin Fin; el guardado de 2° no toca el de 3° ni el de 8°;
  con la puerta cerrada, sin código (solo la demo) y con código (todo); cero errores de consola y
  cero 404. `auditar-rotulos-etapa.py` en 0 errores.

## Parte 3 · Voz, arte y publicación

### Voz
- **Después de la aprobación del banco, nunca en paralelo.**
- Catalina (`es-CL-CatalinaNeural`) a −10%, 48 kbps, como 3° y 4°. Carpetas `mat2`, `len2`,
  `cie2`, `hist2`, `voc2` en `scripts/voz_asignaturas.py` y en `VOZ_DIRS` del fork.
- Antes de generar: recuento gratis (`--recuento`) y lectura de los textos que el normalizador
  cambia. Costo estimado US$7-9; se informa a Roberto antes de gastar.
- Los MP3 nacen fuera del repo (`.gitignore`), se suben con `voz-r2.py subir` y se comprueban con
  `voz-r2.py verificar`. Los manifiestos sí se versionan.
- Verificación: jugar hasta la pregunta, tocar 🔊 y **espiar el constructor `Audio`**; tiene que
  pedir `https://voz.vulpo.cl/<asig>2/…` y llegar a `playing`.

### Arte
- 4 villanos (normal + derrotado = 8 imágenes) y las portadas de capítulo: se reutiliza todo lo que
  calce por tema (sobre todo de 3°) y se generan las que falten, estimadas en 10-15, con el
  estándar de `docs/estandar-arte-portadas.md`.
- Claude escribe los prompts; Roberto genera; Claude procesa con `scripts/procesar-arte.py`,
  identificando cada imagen **mirándola**, eligiendo `--fondo` según el modo real del archivo y
  contando los píxeles transparentes dentro de cada viñeta.

### Publicación
- Solo con 2° completo (banco aprobado, fork, voz y arte): la landing pasa a 7 cursos, con los
  números recontados del disco; README, `docs/comercial.md`, `docs/aprobacion-pedagogica.md` y
  `pendiente.md` al día. Un curso a medias no se enlaza ni se anuncia.
- Google Play: después de 1° básico.

## Fuera de alcance
Libro de lectura, Modo Difícil, Reto de Cálculo con niveles. Cualquiera se suma después sin rehacer
nada.
