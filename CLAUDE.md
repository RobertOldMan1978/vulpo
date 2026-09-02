# VULPO — Plataforma de juegos educativos

> **Nota de marca:** el proyecto se llamó **KIMÜN** hasta la Sesión 21. El nombre estaba
> tomado como marca de terceros, incluido el rubro de enseñanza, así que la plataforma pasó
> a llamarse **VULPO** y la mascota **Vulpi**. La bitácora conserva el nombre antiguo porque
> es el registro histórico, y los identificadores internos (claves del navegador, funciones
> de Supabase, archivos de arte) también lo conservan a propósito: cambiarlos borraría el
> progreso de quienes ya juegan. Ver
> `docs/superpowers/specs/2026-08-18-renombre-vulpo-design.md`.

## Descripción del proyecto

VULPO es una plataforma de juegos educativos para escolares chilenos de 15 años
hacia abajo, alineada al currículum del Ministerio de Educación de Chile. La meta
es que estudiar sea entretenido, desafiante y que genere comunidad mediante
competencia sana entre compañeros.

La arquitectura se piensa como un conjunto de "expediciones" independientes, de
modo que cada asignatura y nivel escolar sea un módulo propio reutilizando el
mismo motor de juego.

- **Piloto actual:** Historia de 8° básico, unidad "Los europeos llegan a América".
- **Primera prueba real:** los hijos del autor, desde el celular, vía GitHub Pages.

## Público objetivo

- Estudiantes chilenos de enseñanza básica (hasta ~15 años).
- Uso principal desde teléfono móvil (diseño mobile-first).
- Contenido en español latino neutro, alineado al currículum chileno.

## Estado actual

**Versión 0.99 (candidata a v1)** — completa y jugable de punta a punta; en vuelta
manual antes de coronar la v1 (ver Sesión 17). Publicado en GitHub Pages y en prueba
real. Un `index.html` mobile-first + contenido en JSON (`contenido/<asignatura>/`) +
backend Supabase para el duelo en línea. Historia de v0 al detalle en la Bitácora (abajo).

**Jugable hoy:**
- **Intro de bienvenida (video):** al abrir por primera vez se reproduce una intro
  de ~11 s (`assets/intro.mp4`: el zorro llega desde el espacio con los símbolos de las
  4 asignaturas + fanfarria "Fanfare for Space"; fundido de entrada/salida). Se ve **una
  vez por dispositivo**; `?intro=1` la fuerza. Si el navegador bloquea el autoplay con
  sonido, muestra "▶ Toca para comenzar".
- Inicio con selección **Jugador / Duelo 1v1 / Admin** y el rostro de la mascota
  **Vulpi** (zorro; `assets/kimun.png`, con expresiones por respuesta).
- **Pantalla principal en 2 niveles (Sesión 15):** un **módulo por asignatura**
  (Historia, Matemáticas, Ciencias, Lenguaje); al entrar se abre su campaña o una
  lista de sus mapas (`scr-mapas`). Cada mapa usa su portada propia por convención
  `assets/portada-<id>.png` con fallback a la de la asignatura. **Los 14 capítulos
  tienen arte propio** y se lucen como ilustración en la pantalla de campaña (el
  Jefe Final muestra al villano de la asignatura).
- **Campañas de asignatura completa (Historia, Ciencias y Lenguaje):** cada una se juega
  como **campaña con hilo conductor** — capítulos en orden que cubren todos los OA del año +
  un **Jefe Final multi-fase** (barra de vida, 3 corazones, tema carmesí) que se abre al
  100%, con recompensas (skin exclusiva, insignia, corona y bono +500🪙/+300XP):
  - **Historia:** 5 capítulos (22 OA) + Desafío Extra; villano "El Guardián del Tiempo";
    skin "Vulpi Historiador".
  - **Ciencias:** 4 capítulos (15 OA = las 4 unidades); villano "La Entropía";
    **cada capítulo abre con una introducción** (nodo 📘 al principio de su mapa, sin práctica);
    skin "Vulpi Científico".
  - **Lenguaje:** 4 capítulos (15 OA; la U1 "Lectura literaria" partida en 2 —Leer y
    comprender / Mundos literarios— + Textos y medios + Escritura); villano "El Borrón";
    skin "Vulpi Escritor"; insignia "Maestro de las Letras".
  Capa `CAMPAÑAS` data-driven; el motor de campañas es **genérico** (Desafío Extra
  opcional, jefe con título dinámico).
- **Matemáticas · campaña "enseña→desafío" (Sesiones 29 y 31) + "Reto de Cálculo"
  (Sesión 15):** ⚠️ **Desde la Sesión 83 el camino "enseña→desafío" está en los TRES cursos**
  —**62 mini-clases**: 26 en 3°, 19 en 7° y las 17 de 8°—, con el motor compartido en
  `assets/js/lecciones.js` y **27 diagramas interactivos**. Lo que sigue es la descripción de 8°,
  que es el que además tiene el Reto de Cálculo.
  Al entrar a Matemáticas se abre su **campaña** con las 4 unidades del año
  (Números, Álgebra y funciones, Geometría, y Probabilidad y estadística), y el mapa
  **intercala por unidad lección → expedición**: primero la **mini-clase guiada**
  (explicación breve + **diagramas SVG interactivos** —recta arrastrable, barras de
  fracciones/%, cuadrículas de potencias/raíces— + ejemplo resuelto paso a paso + **10
  preguntas** de práctica del banco revisado, que **mide dominio por OA**), y a continuación
  su **expedición** (`mate-exp-numeros`, `-algebra`, `-geometria`, `-datos`), que pone a
  prueba lo aprendido usando el **banco de año completo (603)**. El **Reto de Cálculo**
  —cálculo mental rápido, **5 niveles × 3 etapas** + Jefe "El Autómata" + **Modo Sin Fin**—
  se conserva, con **cada nivel desbloqueado al completar su lección** ("aprender desbloquea
  el Reto"); sus tiempos son **fijos** (nivel y Sin Fin 20 s, El Autómata 15 s) y no bajan
  con la dificultad. En el **Duelo**, Matemáticas ofrece los 5 niveles del Reto (operaciones
  al vuelo), ver Sesión 16. **Jefe Final "La Incógnita"** (villano encapuchado hecho de
  ecuaciones; 4 fases × 4 preguntas) que **se abre al vencer las 4 expediciones** y entrega
  la skin **"Vulpi Matemático"** + insignia **"Maestro de las Matemáticas"** + corona + bono.
  Vencer las 4 expediciones en **Modo Difícil** suma la insignia 🔥 **"Matemáticas · Difícil"**
  (`dif-matematicas`); la **Maestría Total no cambia** (sigue exigiendo Historia + Ciencias +
  Lenguaje en Difícil + El Autómata). Es la asignatura más completa del juego.
- Regla de cada capítulo/expedición: **4 etapas + 1 jefe (5 nodos)** (algunos capítulos
  con 3 etapas cuando su unidad tiene 3 OA). Cada asignatura tiene, además, un **banco de
  año completo** (todos sus OA oficiales); con las 4 campañas activas ya casi no queda
  contenido de reserva sin usar.
- Quiz: 10 preguntas al azar/etapa, timer 20 s, pasa con 66%, 3 estrellas. Al
  fallar revela la respuesta correcta + explicación y botón "Continuar". Vulpi
  comenta un dato al iniciar la ruta.
- **Retroalimentación formativa (Sesión 52):** encuadre y andamiaje alineados al MINEDUC
  (ver `docs/fundamento-evaluacion-formativa.md`). Antes de la etapa, la **meta de aprendizaje
  en lenguaje de niño** (una frase amable por OA, `META_OA`): tarjeta 🎯 la primera vez +
  línea fija en el quiz. Durante la pregunta, un **comodín 50/50** (2 por etapa, gratis, solo
  Normal, nunca en jefes/duelo/desafío; la pregunta asistida no se mide). Al **reprobar** una
  etapa de un OA, el **siguiente paso**: en Matemática abre la **mini-clase** de la unidad; en
  Historia/Ciencias/Lenguaje, un **repaso sin reloj ni reprobar** (10 preguntas distintas de
  las falladas, que no mide ni paga). Y **antes de ver el puntaje** (Sesión 74), la
  **predicción**: pantalla propia y obligatoria de un toque —🟢 Lo entendí · 🟡 Más o menos ·
  🔴 Me costó— y el resultado le **responde** con el cruce entre lo que creyó y lo que pasó
  (*"Creías que lo tenías y te fue 4 de 10"*). Antes se preguntaba **al cerrar**, después del
  veredicto, así que era un eco de las estrellas y se saltaba. Local y privado: **no se envía
  al profesor**. La salta `EFIMERO`, o sea `?qa=1`, `?solo=`, `?m=` y `?rev=1`. Specs/planes
  `2026-08-25-siguiente-paso-al-fallar*`, `2026-08-25-marco-de-la-etapa*` y
  `2026-08-31-prediccion-antes-del-resultado*`.
- **Modo Difícil** desbloqueable (10 preguntas, 15 s, 80%, tema oscuro/carmesí).
- Persistencia (localStorage), **tienda de skins** (precios escalonados 110–1250;
  emojis baratos de entrada + skins ilustradas premium, incluidas **7 deportivas**:
  karate, fútbol, básquetbol, vóleibol, ciclismo, tenis, skate), animación de subida
  de nivel, logros y **ranking real del curso** (alumnos de verdad, ordenados por XP;
  ver "Cursos, profesores y ranking real").
- **Audio:** efectos procedurales (Web Audio, sin archivos) + **música de fondo**
  opcional por archivos (`assets/audio/`, con fallback si no están); control separado
  🎵 música / 🔊 efectos, persistido.
- **Duelo 1v1:** en el mismo teléfono y **en línea asíncrono (Supabase)** con
  código de amigo, lista de jugadores, bots de práctica y reto de 24h. **Está en los tres
  cursos** (3° desde la Sesión 74), y cada uno saca sus preguntas de **su propia Historia**:
  el banco y los segundos por pregunta van como dato (`DUELO_BANCO`, `DUELO_SEG`).
  Desde la Sesión 76 su ciclo **cierra**: la pantalla de inicio avisa **⚔️ que te desafiaron**
  y **🏆 cómo terminó el duelo que iniciaste** —antes el retador no se enteraba nunca—, y la
  pantalla del duelo trae el **🏆 ranking de duelos del curso**, por duelos ganados, **sin
  contar los bots** (a Diego se le gana cincuenta veces en una tarde).

**Contenido (bancos de año completo, TODOS revisados):** Historia **663/663** ·
Matemáticas **603/603 (17 OA)** · Ciencias **534/534 (15 OA)** · Lenguaje
**514/514 (15 OA)**. ~2.314 preguntas, **100% marcadas como revisadas** (aprobación
humana de Roberto, ver Sesión 12). Los 3 bancos nuevos se llevaron a cobertura de
año completo desde el currículum oficial (ver Sesión 9) y se enriquecieron con ítems
de mayor orden por revisión pedagógica (ver Sesión 11); solo 4-5 OA de cada uno
están hoy en una expedición jugable, el resto es reserva.

> **Estado de aprobación (31/08/2026): 7.805 de 7.805. El banco entero está firmado de nuevo**,
> incluidas las 60 del Vocabulario de 3° que se escribieron ese mismo día. Pero **cómo se aprobó cada banco no es lo mismo, y hay que saberlo antes de
> decírselo a un colegio:** los 2.536 de 8° y los módulos de apoyo se revisaron **pregunta por
> pregunta**; los de 3° y 7° se aprobaron **por muestreo** —8 de cada 30 por objetivo, criterio
> de `docs/aprobacion-pedagogica.md`—. Por eso la landing dice *"aprobadas por un profesor,
> objetivo por objetivo"* y **nunca** *"una a una"*: el 100% es de cobertura, no de método.

**Herramientas dev:** tablero con clave
(`dev/tablero.html`) y scripts (`consolidar-pool-nivel`, `aplicar-revisadas`,
`generar-revision-preguntas` —el informe de aprobación, con los dibujos reales—,
`generar-tablero`, `procesar-arte`).

## Decisiones de diseño

### Estética
- Paleta oscura violeta con acentos vibrantes (variables CSS en `:root`):
  `--gold #ffc93c`, `--cyan #4dd8ff`, `--green #3ee089`, `--pink #ff4d8d`,
  `--violet #8f6bff`.
- Tipografías: **Titan One** para títulos y **Nunito** para texto.
- Mobile-first, contenedor máximo de 480px, sin zoom del usuario.
- Fondo con estrellas animadas y degradados radiales.
- **Las fracciones se dibujan APILADAS**, numerador sobre denominador, como en el cuaderno —no
  `9/10` en línea—. Lo hace `assets/js/fracciones.js` **al pintar**, y por eso hay una regla que
  vale para todo curso nuevo: **el banco escribe `n/m` y el juego lo apila; el banco NO se toca**.
  Ver [`docs/estandar-fracciones.md`](docs/estandar-fracciones.md).
- **Portadas de capítulo: cada capítulo la suya**, con el estándar de 8° (viñeta circular
  sobre violeta, Vulpi de cuerpo entero haciendo la actividad, sin texto dentro de la
  imagen). **Un solo estilo para los seis cursos**; lo que cambia con la edad es la densidad
  de la escena, no el estilo. Fijado el 01/09/2026 en
  [`docs/estandar-arte-portadas.md`](docs/estandar-arte-portadas.md), que además lista las 20
  reutilizaciones aprobadas entre cursos y las 30 que faltan.

### Mecánicas
- Progresión por etapas desbloqueables con jefe final.
- Refuerzo positivo: partículas, combos, XP, monedas, estrellas y logros.
- Retroalimentación educativa al fallar (no solo penalización).
- Competencia social: ranking del curso, con datos reales desde la Sesión 19.

## Roadmap

Orden tentativo, sujeto a prioridad de "verlo funcionar y atractivo" primero:

1. ✅ **Duelo 1v1 en un mismo dispositivo** (HECHO) — por turnos, misma
   pregunta; 5 rondas, se pasa el teléfono, marcador y ganador.
2. ✅ **Tienda de skins con monedas** (HECHO) — 8 avatares premium comprables
   con monedas; equipado persistente.
3. ✅ **Sonidos** (HECHO) — efectos sintetizados con Web Audio (acierto, error,
   combo, subida de nivel, victoria/derrota) + botón de silencio. Sin archivos.
4. ✅ **Animación de subida de nivel** (HECHO) — overlay celebratorio a pantalla
   completa al cruzar 100 XP.
5. ✅ **Separar contenido del motor** (HECHO) — preguntas en
   `contenido/historia-8basico/preguntas.json`; el juego las lee con fetch.
6. ✅ **Persistencia de progreso** (HECHO) — guarda nombre, avatar, XP,
   monedas, estrellas, skins y logros en localStorage; continúa al reabrir.

### Hacia dónde va el producto (acordado el 27/08/2026)

**`pendiente.md` (en la raíz) es la lista viva de tareas** — qué falta, en qué orden, con su
peso y en qué rama va cada cosa. Se actualiza en cada orden 66, y es por donde se empieza al
retomar el proyecto o al abrir una rama nueva.

**`docs/roadmap-tecnico.md` es el plan de mediano plazo:** web → **PWA** → piloto y métricas →
**Capacitor** → Android → iOS, más el **modelo de suscripción anual por nivel escolar**. La
decisión de fondo es **no reescribir en Flutter ni React Native**: VULPO ya es una app web
mobile-first y se reutiliza. Nada de eso está implementado.

Antes de tocar `sw.js` hay que leer su §2, que corrige el análisis externo con hechos del
repositorio: hoy hay **tres apps forkeadas** (`/juego/`, `/3ro/`, `/7mo/`), así que un manifiesto
único abriría el curso equivocado; y **`assets/` pesa 455 MB** (244 MB solo de voz de 3°), así que
la precarga `cache-first` que propone el análisis le bajaría 250 MB al teléfono de un niño en la
primera apertura. El progreso local en `localStorage` es el requisito real del modelo de
suscripción, y es trabajo de backend, no de PWA.

### Más adelante (fuera del alcance inmediato)
- Múltiples asignaturas y niveles como expediciones independientes. **Motor
  data-driven listo:** el arreglo `EXPEDICIONES` (en `index.html`) define cada
  ruta (etapas → OA + contenido + portada) con progreso independiente por ruta;
  hay una **plantilla** en `contenido/_plantilla/` para clonar la siguiente.
  **Hecho:** Historia, Matemáticas, Ciencias y Lenguaje ya están generadas y
  activas, cada una con su **banco de año completo** (todos los OA oficiales). Con
  eso, armar nuevas expediciones de esas asignaturas es casi solo cablear
  `EXPEDICIONES` (ya hay preguntas para los OA que faltan). Falta la revisión
  pedagógica humana de los bancos nuevos.

## Reglas de trabajo

- Comunicación siempre en **español latino neutro** (ver instrucciones globales).
- No refactorizar el prototipo hasta que esté publicado tal cual.
- Flujo de trabajo entre oficina y casa sincronizando por **GitHub**.
- **Cierre de sesión:** al pedirlo, actualizar este `CLAUDE.md` con lo avanzado
  y lo pendiente, luego commit y push.

### ⚠️ El repositorio es PÚBLICO

`github.com/RobertOldMan1978/vulpo` es público, y GitHub Pages sirve desde él. **Todo lo que se
escriba aquí lo puede leer cualquiera**, incluidos `CLAUDE.md`, los `docs/` y los bancos de
preguntas. Antes de escribir algo en el repo, preguntarse si molestaría que lo leyera un colegio
o un competidor. **El análisis interno de estrategia, los números de ingreso y el estado de las
conversaciones comerciales van FUERA del repo** (`Escritorio\VULPO - correos profesores\`).

### Lado comercial

El modelo de precios, la secuencia de venta, qué se promete y qué no, y dónde vive el material
están en **`docs/comercial.md`**. Leerlo antes de tocar cualquier cosa que un colegio vaya a ver.

### Cómo se ordenan los archivos: las cinco capas

Los tres análisis externos del 27/08/2026 coinciden en un punto que este proyecto **ya cumplía
de hecho pero no tenía escrito**, y por lo tanto no obligaba a nada: VULPO se sostiene porque
**lógica, contenido, recursos, infraestructura y herramientas viven separados**. Es lo que
permitió sumar tres cursos y cuatro asignaturas sin tocar el motor, y es lo que la PWA da por
supuesto cuando pide "no modificar `contenido/` ni `supabase/`".

| Capa | Dónde vive | Qué es |
|---|---|---|
| **Presentación** | `index.html` (raíz) · `assets/web/` | La landing comercial. No es el juego |
| **Motor** | `<curso>/index.html` · `assets/js/*.js` | La lógica: quiz, campañas, jefes, tienda, duelo |
| **Contenido** | `contenido/<asignatura>-<n>basico/` | Los bancos, los OA y las lecciones. **Datos, nunca código** |
| **Recursos** | `assets/` (arte, audio, voz, video) | Lo que pesa. Ver la tabla de abajo |
| **Infraestructura** | `supabase/schema.sql` · `profesor.html` | Identidad, permisos, dominio por OA, cursos |
| **Herramientas** | `scripts/` · `dev/` | Nunca se sirven al alumno |

**Las cinco reglas que se derivan, y que valen para todo lo que venga (PWA incluida):**

1. **Un cambio de una capa no toca las otras.** Agregar preguntas es `contenido/`; cambiar una
   regla del juego es motor; ninguno de los dos toca `supabase/`. Cuando un trabajo obliga a
   tocar tres capas a la vez, casi siempre está mal planteado.
2. **Lo que se comparte entre cursos va a `assets/js/`, no se copia.** Hoy son **diez** módulos:
   `revision.js`, `sensible.js`, `calculo.js`, y desde el 31/08 **`visuales.js`** (los 11
   dibujos), **`voz.js`** (la lectura en voz alta), **`niveles.js`** (el catálogo de niveles,
   que solo carga el panel), **`instalar.js`** (el ofrecimiento de agregar el juego a la
   pantalla del teléfono) y **`motor.js`** (el juego entero: quiz, campañas, jefes, duelo,
   tienda, guardado); desde el 02/09, **`fracciones.js`** (las fracciones apiladas) y
   **`lecciones.js`** (el motor de mini-clases e introducciones, con sus 27 diagramas interactivos). **Siempre con su respaldo vacío antes de usarse**, porque un 404 de
   un `<script src>` mata todo el JavaScript y el síntoma engaña: la pantalla se ve bien y ningún
   botón responde. Cada uno se prueba **con el archivo ausente**, no solo presente.
   - ⚠️ **`motor.js` es la excepción: NO admite respaldo vacío, porque es el juego.** Lo que sí
     se puede es que el fallo **se diga**: cada fork lleva al final una **canaria** que comprueba
     `window.__MOTOR_OK` y, si no está, escribe en pantalla que hay que recargar. Cuesta seis
     líneas y convierte el fallo mudo más caro del proyecto en uno legible por un apoderado.
     Y por lo mismo **se publica en un push ANTERIOR al que lo referencia**: es la lección del
     `drop function` de la Sesión 73 —el cliente nunca antes que su dependencia—, agravada
     porque GitHub Pages tardó ~2 minutos en servir `revision.js` el día que se desplegó.
   - **Un módulo se lleva su CSS.** Si sus reglas quedan sueltas en el `<style>` de cada curso,
     un nivel nuevo carga el módulo, funciona, y **no se ve** — sin ningún error. Lo inyectan
     ellos mismos, que es lo que `revision.js` ya hacía.
   - **Un módulo con datos propios del curso nace dormido** y despierta con un `init` que recibe
     esos datos (`VOZ.init(VOZ_DIRS)`, `CALC.init({activo})`). Así no hace falta una bandera más
     para apagarlo donde no corresponde. ⚠️ **La llamada a `init` va PEGADA a la declaración de
     sus datos**, nunca arriba con las otras constantes: un `const` leído antes de declararse
     mata todo el JavaScript, y esa trampa mordió cuatro veces en una semana.
3. **Lo que difiere entre cursos va como DATO, no como `if`** — banderas con nombre, `EXTRAS`,
   `sinfin:true`. Un `if` sobre el nombre de la asignatura no dice si el nivel tiene esa
   funcionalidad, y al forkear se copia con su suposición adentro.
4. **La convención de nombres ES la configuración.** `historia-7basico` dice su nivel; un código
   con nivel adentro (`HI07`, `MA03`) es currículum y uno sin él (`VOC`, `AF`) es transversal.
   Por eso ningún script lleva una lista de carpetas escrita a mano: las listas paralelas son la
   fuente de bug más repetida del proyecto.
5. **Nada nuevo en la raíz sin motivo.** La raíz es la landing. La PWA sumará exactamente
   `manifest.webmanifest`, `sw.js` y `pwa.js`, y ahí se detiene.

#### El contrato de la capa de contenido (31/08/2026)

Vive en **[`contenido/_plantilla/README.md`](contenido/_plantilla/README.md)**, y ahí hay que
mirar antes de crear una carpeta de asignatura: nombre de la carpeta, los tres archivos, el
formato canónico de `preguntas.json`, el contrato de `_pool/` y la convención de `id`.

**El estándar no se inventó: es el que ya producía `scripts/consolidar-pool-nivel.py`**, que es
la herramienta que crea los bancos —`indent=1`, sin salto final, LF, y como cabecera solo lo que
alguien lee—. Antes la plantilla describía una cabecera de seis claves que **la herramienta real
no escribía y que ninguno de los 16 bancos cumplía**, durante meses y sin que nada avisara. Por
eso ahora lo comprueba `auditar-banco-nivel.py`, probado rompiendo un banco a propósito.

> ⚠️ **Los `id` de las preguntas ya escritas NO se renombran, aunque sean inconsistentes**
> (`cie3`/`cie7`/`cien8`, `mat3`/`mate7`, `len3`/`leng7`): **las marcas de aprobación del tablero
> se guardan por id**, así que renombrarlas dejaría huérfanas las 7.805 firmadas. La regla —las 4
> primeras letras de la asignatura más el dígito del nivel— es para lo que venga.

#### El peso, medido hoy (31/08/2026)

> Una sola medición para todo el proyecto. Antes vivía con **cuatro cifras distintas en
> cuatro documentos** y ninguna calzaba con el disco. Al actualizarla, actualizar también
> `pendiente.md` y `docs/roadmap-tecnico.md`.
>
> ⚠️ **Y hay que medir en BYTES REALES, no en tamaño de disco.** Las cifras anteriores venían
> de `du` sin `--apparent-size`, que cuenta bloques de 4 KB: con **11.391 archivos** de voz eso
> infla ~26 MB, y el proyecto se creía 20 MB más pesado de lo que es. Contra el techo de 1 GB de
> GitHub Pages lo que cuenta son los bytes. `du -sm assets` en Git Bash además devuelve un
> número **menor que el de su propia subcarpeta**, así que aquí no sirve: se mide recorriendo
> con `os.path.getsize`.

| | |
|---|---|
| `assets/voz/` (voz pregrabada de 3°, **6 asignaturas**) | **244 MB** |
| `assets/originales/` (arte crudo, **excluido del sitio** por `_config.yml`) | 174 MB |
| `contenido/` (los bancos completos) | 7,3 MB |
| `assets/audio/` (música) | 5,0 MB |
| **`assets/` completo** | **455 MB** |
| **Sitio publicado** (sin `.git` ni originales) | **324 MB** |

El techo de GitHub Pages es **1 GB**, y la voz de 4° suma otros ~254 MB. Por eso la regla del
proyecto —voz pregrabada solo de 1° a 4°— no es una preferencia pedagógica: **es también la
única aritmética que cabe**. Y por eso la precarga `cache-first` que propone el análisis de la
PWA es inviable tal cual: bajaría 250 MB al teléfono de un niño en la primera apertura de 3°.

### Gotchas del motor de expediciones

Al agregar expediciones nuevas al arreglo `EXPEDICIONES` de `juego/index.html`:

- **Portada del nodo:** `portadaMapa(exp)` devuelve `assets/portada-<id>.png`. Si ese PNG no
  existe hay **404 en consola**, aunque el `onerror` tape el problema visualmente. Para nodos
  pintados con `nodoCampañaEl(...)`, pasar una portada que SÍ exista (por ejemplo la de la
  unidad) en vez de `portadaMapa(exp)`. De paso respeta la regla de no crear arte nuevo.
- **Registrar una asignatura tiene efectos en cadena:** en cuanto una asignatura tiene una
  expedición con campo `contenido`, `contenidoDeAsignatura(asig)` deja de devolver `null`. Eso
  hace que (1) el **desafío de refuerzo del profesor** empiece a armar preguntas reales para esa
  asignatura, y (2) sus etapas **alimenten el mapa de dominio** vía `registrarOA`, que solo
  excluye los OA de apoyo con prefijo `VOC-` y `AF-`. Ambas cosas son deseables, pero conviene
  saberlas.
- **Modo Difícil y Maestría Total:** `asignaturaDificilCompleta(asig)` funciona genéricamente
  para cualquier campaña con `capitulos`. Para NO alterar la Maestría —definida como Historia +
  Ciencias + Lenguaje + El Autómata— dejar `DIF_ASIGS` en esos 3 y otorgar cualquier insignia
  de Difícil adicional con un chequeo aparte, fuera de `asignaturasDificil()` y `esMaestro()`.

### Verificar en un navegador de verdad (`scripts/cdp.mjs`)

Durante mucho tiempo las comprobaciones se hacían con Chrome headless y `--dump-dom`, que
**fotografía el DOM al `load`** —demasiado pronto para un juego que arma su pantalla después—
y con `--virtual-time-budget`, que **se cuelga con estos juegos** porque su audio corre en
tiempo real y el reloj virtual no avanza. Por eso muchas cosas se daban por verificadas
llamando funciones sueltas, que es justo como se colaron los bugs de la Sesión 56.

`scripts/cdp.mjs` es un conductor mínimo de Chrome por CDP (Node 22+ trae `WebSocket` nativo,
sin dependencias). Navega, espera, **hace clic y evalúa JavaScript en la página**, y además
**captura los 404** (que no llegan a la consola de forma fiable: hay que mirar la red).

    node scripts/cdp.mjs about:blank <archivo-de-pasos.mjs>

El archivo exporta `export default async (ev) => {...}`; `ev(expr)` evalúa una expresión en la
página, `ev.ir(url)` navega, `ev.espera(ms)`, `ev.consola` y `ev.fallos`. **Ganó su lugar en la
primera corrida:** delató que un cambio mío rompía todo el JavaScript de 3° (`NS` duplicado),
exactamente el fallo silencioso que ya había costado dos sesiones.

Cosas que ya sabemos y siguen valiendo: la pantalla activa es `.screen.on` (no `hidden`); el
nodo del mapa recibe el clic en su `.orb`, no en el `div`; y las tarjetas de campaña son
`.camp-nodo`.

### Módulos transversales: el cálculo, las lecturas y el vocabulario van aparte

El **Reto de cálculo**, las **lecturas** y el **Vocabulario** tienen una asignatura asignada pero
**no son esa asignatura**: son apoyos que acompañan al curso. Desde el 28/08/2026 se tratan como
una categoría propia, agrupada e **independiente del nivel**, para que el motor se escriba una vez
y lo único que cambie por curso sean los datos.

Se reconocen por una propiedad objetiva y no por criterio: **su código no lleva el nivel adentro**
(`VOC`, `AF` contra `HI07`, `MA03`). Esa forma es la que consultan `validar-oa-json.py` y
`generar-tablero.py`, así que **no hay ninguna lista de carpetas que mantener** — antes sí la
había, escrita a mano, y se rompió al primer módulo de otro nivel.

**El estándar completo está en [`docs/modulos-transversales.md`](docs/modulos-transversales.md):**
qué son, cómo se nombran (Vocabulario por nivel, Lectura por libro, el Reto sin carpeta), las
reglas que comparten, cómo se agrega uno a un curso y las trampas ya pagadas.

> **El Reto de cálculo es el único contenido del proyecto que no consume banco**: genera las
> operaciones por código, así que no suma preguntas que escribir, ni horas de aprobación, ni
> clips de voz. Agregarlo a un curso nuevo es un generador de ~45 líneas.

### Banderas de nivel: las diferencias entre cursos van como DATO, no como `if`

Cada curso es un fork, y lo que distingue a uno de otro **no es código de motor sino qué
funcionalidades tiene**. Desde la Sesión 63 esas diferencias se declaran como constantes
arriba del archivo, no como condiciones sueltas repartidas por el código.

| Bandera | Qué gobierna | 8° | 7° | 3° |
|---|---|---|---|---|
| `HAY_RETO_CALCULO` | Si Matemática se juega como Reto de Cálculo. Afecta al **Duelo** (`odNMapas`, `odMapasMate`, `odPreguntasCalc`), a `detenerTimersActivos` y a la música de `scr-calc` | ✅ | ❌ | ❌ |
| `HAY_MINICLASES` | Si existe el camino de mini-clases. Afecta al **siguiente paso al reprobar**, a `renderCampaña`, al Jefe Final (`cargarPoolMate`) y al ✕ del quiz. **Desde la Sesión 83 vale `true` en los tres**, y va **pegada a `LECC.init`** | ✅ | ✅ | ✅ |
| `HAY_VOCABULARIO` | Si Lenguaje abre el landing "Campaña + Vocabulario" en vez de su campaña | ✅ | ✅ | ✅ |
| `HAY_BIBLIOTECA` | Si la pantalla principal ofrece el módulo 📖 Lectura | ✅ | ❌ | ✅ |
| `HAY_SINFIN` | Si Matemática ofrece el **Reto Sin Fin** de `assets/js/calculo.js`. Gobierna el nodo del mapa y la llamada `CALC.init` | ❌ | ✅ | ✅ |
| `HAY_DIFICIL` | Si el nivel ofrece **Modo Difícil**, y con él las insignias 🔥, la skin de Maestro y la Maestría Total. ⚠️ Se declara **pegada a `DIF_ASIGS`** y no con las demás: la consulta `revisarDificil()`, que corre en el arranque | ✅ | ✅ | ❌ |
| `MAESTRIA_CALC` | Si el **cuarto hito** de la Maestría Total es El Autómata (el Jefe del Reto de Cálculo). En 8° la Maestría es Historia+Ciencias+Lenguaje en Difícil **más** El Autómata; donde no hay Reto son las **cuatro** asignaturas. Son el mismo número contado distinto, así que va como dato y no como dos `esMaestro()` distintos. ⚠️ También **pegada a `HAY_DIFICIL`** | ✅ | ❌ | ❌ |
| `SIN_RELOJ` | Quiz sin cuenta regresiva y sin selector Normal/Difícil. ⚠️ **No alcanza al Duelo**, que sí lleva reloj en los tres: es una competencia y ahí el tiempo es parte del juego | ❌ | ❌ | ✅ |
| `DUELO_BANCO` | De qué banco saca preguntas el Duelo (ruta + los 4 OA). Iba **fijo a `historia-8basico`** en los tres forks, así que en 7° un alumno recibía preguntas de 8° | `HI08` | `HI07` | `HI03` |
| `DUELO_SEG` | Segundos por pregunta del Duelo, local y en línea | 15 | 15 | **30** |
| `EXPERIMENTAL` | **No es de nivel sino del CURSO**: lo enciende la inscripción por enlace. Se lee del disco al arrancar y lo reconcilia `sincronizarModoCurso()`. Gobierna `CAPS_ABIERTOS` | según el curso | según el curso | según el curso |

`MODO_ABIERTO` se partió en **`CAPS_ABIERTOS`** (ignora los candados entre capítulos y
niveles: QA, modo prueba y experimental) y **`JEFES_ABIERTOS`** (ignora los de los jefes y
el Desafío Extra: solo QA y modo prueba). Es el mismo corte que la Sesión 41 le hizo a `QA`.
⚠️ **El Desafío Extra va con los JEFES**: `jefeFinalDesbloqueado` lo usa como precondición,
así que si se abriera con los capítulos, el Jefe Final de una campaña **sin** Desafío Extra
—Ciencias— se abriría solo.

Cada bandera va **pegada a su comentario**, que explica qué pasa si se pone mal. Una bandera cuyo
porqué vive catorce líneas más arriba no cumple su único propósito, que es **obligar a responder
la pregunta al crear un nivel**.

**Las dos primeras nacieron de dos defectos VIVOS en 7°**, encontrados jugando y no leyendo:

1. **El Duelo ofrecía la Matemática equivocada.** Daba los **5 niveles del Reto de Cálculo de
   8°** (Calentamiento, Enteros, Potencias y raíces…) en vez de los 4 capítulos de 7°, y
   generaba las operaciones con `genCalculo` **saltándose el banco propio del nivel**.
2. **El "siguiente paso al reprobar" ofrecía una mini-clase inexistente.** Al fallar una etapa
   de Matemáticas, el botón decía "📘 Repasar la mini-clase", **descargaba las 17 lecciones de
   8°** dentro de la app de 7° y no abría ninguna: el alumno tocaba y no pasaba nada.
   **3° se salvaba por accidente**, porque escribe `'Matemática'` en singular y la comparación
   era con el plural — o sea, la protección era una coincidencia de ortografía.

> **Por qué importa la forma y no solo el arreglo:** los dos bugs eran `asig==='Matemáticas'`
> escrito a mano en un archivo que se copió tres veces. Un `if` sobre el nombre de la asignatura
> **no dice** si el nivel tiene esa funcionalidad, así que al forkear se copia con su suposición
> adentro y nadie la vuelve a mirar. Una bandera con nombre obliga a responder la pregunta al
> crear el nivel.

**Al crear un curso nuevo, poner TODAS las banderas explícitamente**, aunque el valor sea el
mismo que en el original.

#### El bloque de lecciones ya NO está en NINGÚN fork (Sesiones 65 y 83)

> ⚠️ **Actualización del 02/09 (Sesión 83): el motor de mini-clases salió también de 8°** y vive
> en [`assets/js/lecciones.js`](assets/js/lecciones.js), porque 3° y 7° volvieron a necesitarlo al
> tener sus propias lecciones. Lo que queda abajo es el registro de por qué se cortó primero de
> 3° y 7°, y el método del corte, que sigue valiendo. **El Reto de Cálculo NO viajó**: seguía
> pegado en el archivo pero es otra cosa, y se queda en `juego/index.html` (medido en la Sesión
> 74). Lo único que los toca es el nodo del Reto en el mapa, guardado con `CFG.hayReto`.

Las **693 líneas** de 8° (catálogo de diagramas SVG + motor de mini-clases + Reto de Cálculo)
**salieron de `3ro/` y `7mo/`**, donde eran inalcanzables. Siguen vivas y sin tocar en
`juego/index.html`, que es donde se juegan. Con el HTML huérfano de sus cuatro pantallas y una
segunda zona muerta que había fuera del bloque, son **792 líneas menos por fork**.

**Se pudo recién ahora, y el orden importa:** primero las diferencias entre cursos pasaron a ser
**banderas** (Sesión 64) y solo después se cortó. Al revés no se podía, porque lo que sujetaba el
bloque no era el bloque sino los `if` sobre el nombre de la asignatura repartidos por el archivo.

**De los tres obstáculos que esta sección declaraba, uno era falso:**

- ✅ **`refreshHud` y `levelUpFx` viven dentro de esa zona** por accidente de ubicación, y son del
  HUD, no de las lecciones. Cierto: el bloque termina justo antes de ellas, y ahí se cortó.
- ❌ **"3° necesita `NS`, y borrarlo lo deja sin dibujos"** — **es falso, y estuvo escrito acá
  bloqueando el corte.** Medido en la Sesión 65, la única aparición de `NS` fuera del bloque
  **está dentro de un comentario**: el `renderVisual` de 3° arma el SVG como **texto**
  (`svgEnvoltura`), nunca con `createElementNS`. Comprobado renderizando los **once** widgets con
  datos reales de los bancos después del corte.
  > La lección es sobre esta bitácora, no sobre el código: **una advertencia que nadie vuelve a
  > medir se vuelve un candado**. Esta llevaba dos sesiones impidiendo un trabajo que resultó ser
  > barato.
- ⚠️ **Las referencias desde código vivo eran reales, y una era peligrosa de verdad:**
  `detenerTimersActivos` hace `clearInterval(RC.timer)` **y a esa función la llama la barra
  inferior**, o sea un toque que cualquier alumno da. Sin guardarla antes, el corte habría dejado
  las dos apps muertas al primer toque. Va guardada con `if(HAY_RETO_CALCULO){…}`.

**Las referencias muertas que quedaron NO se borran: se guardan.** `odNMapas`, `renderODExpMapas`
e `iniciarDesafio` siguen nombrando `NIVELES_CALC`, `odMapasMate` y `odPreguntasCalc`, que en 3° y
7° ya no existen. Se dejan así **a propósito**: la bandera hace inalcanzable esa rama, y mantener
esas tres funciones **byte a byte iguales en los tres forks** es justamente el objetivo. Borrarlas
las haría divergir, que es el problema que se está resolviendo.

**Y apareció otro caso del mismo defecto de fondo:** en 3° y 7°, `cargarPoolMate` descargaba
`contenido/matematicas-8basico/preguntas.json` — **el banco de otro nivel dentro de esta app**. Es
hermano del botón de mini-clase que bajaba las 17 lecciones de 8° (Sesión 64). Se fue con el corte.

#### Cómo se corta código de un fork sin matarlo

La Sesión 56 dejó dicho que **nunca se borra con aritmética de índices ni con filtros por prefijo
de línea**: los dos métodos cortaron por la mitad `const XP_POR_NIVEL=100;` y dejaron 3° injugable
en todos sus modos. Lo que sí funciona, y se usó en la Sesión 65:

- **Anclas exactas**, no números de línea: el corte se ubica por la cadena de la primera y la
  última línea, y **aborta si la ancla aparece más de una vez**.
- **Aserciones antes de escribir**: que sean exactamente 693 líneas; que la última esté vacía; y
  que el tramo **difiera del de 8° en a lo más una línea** (la del campo `visual`, que solo 3°
  propaga). Si algo no calza, el script no toca el archivo.
- **Balance de llaves** para las funciones sueltas intercaladas con código vivo, en vez de rangos.
- **Antes de borrar HTML, comprobar que ningún `id` de adentro lo nombre el JavaScript.** Ese
  chequeo frenó el primer intento (`scr-calc` seguía nombrado en `MUSIC.contexto`) y obligó a
  guardar también esa línea.
- Y **escribir con `newline=""`**, o sea conservar los finales de línea que trae el archivo.
  Desde el 31/08 eso significa **LF en todo el proyecto**, declarado en `.gitattributes` (ver
  abajo). Antes esta regla decía "preservar CRLF", y **su motivo estaba mal contado**: la
  comparación entre forks se rompía porque quedaban **distintos entre sí**, no porque fueran
  CRLF. Con los tres en LF siguen siendo comparables, que es lo único que importaba.

> ⚠️ **Y una que se pagó en M3 (31/08): una pieza extraída tiene que llevarse sus comentarios
> ENTEROS.** El extractor subía sobre las líneas que empiezan por `//`, `/*` o `*`, pero este
> proyecto escribe los bloques **sin prefijo en las líneas del medio**:
>
>     /* Una sola recarga por pestaña...
>        y el disco guardando otra...
>        que es peor que quedarse con el modo viejo. */
>
> así que se llevó **solo el último renglón** y dejó el `/*` **huérfano** en los tres forks,
> comentando lo que viniera detrás. Es el hermano exacto del `*/` de la Sesión 63.
>
> **Lo grave es que `node --check` NO lo delata**, y por eso hay que decirlo: el bloque siguiente
> aportaba el `*/` que faltaba, así que el archivo seguía siendo JavaScript válido — solo que con
> un comentario tragado. Si en vez de un comentario hubiera habido código, se habría ido en
> silencio. **El guard que sí lo caza es contar `/*` y `*/` en la pieza que sale: tienen que ser
> iguales.** Y de paso: los comentarios de una misma función divergían entre forks (3° conservaba
> el "por qué" y 8°/7° la versión vieja), así que **el extractor aborta si difieren** y obliga a
> escribir uno solo, que es lo que corresponde cuando la función pasa a ser una sola.

### ⚠️ Un `*/` dentro de un comentario lo cierra antes de tiempo (y mata el juego entero)

Pasó en la Sesión 63 escribiendo la documentación de una bandera: el comentario decía
`(contenido/*/lecciones.json)`, y ese `*/` **cerró el bloque `/* … */`** dejando el resto del
texto como JavaScript inválido. **Las tres apps quedaron muertas a la vez**
(`ORDEN_ASIG is not defined`, ningún botón respondía) por un comentario.

Es hermano del corte por índices de la Sesión 56: el archivo *parece* correcto al leerlo.
**Nunca escribir una ruta con comodín, un glob ni una expresión regular dentro de un comentario
de bloque.** Y por eso la verificación con `scripts/cdp.mjs` no es opcional: lo delató en el
minuto uno.

### Gotchas de 7° básico (`7mo/index.html`, otro FORK de 8°)

7° se sirve en `vulpo.cl/7mo/` y **no está enlazado desde el sitio**, igual que 3°. Es un
fork de 8° porque ya hay dos precedentes y unificarlos sería un refactor del producto en
producción; el costo del fork está medido y es re-aplicar cada corrección en cada copia.

- **`localStorage` con `SUFIJO='_7mo'`** y **`storageKey:'kimun-7mo'`** en el cliente de
  Supabase. Sin lo primero, un alumno con 7° y 8° abiertos comparte monedas, skins y
  avance; sin lo segundo, son el **mismo usuario anónimo** (mismo perfil, mismo XP, mismo
  vínculo `ALU-`). Los ajustes de audio se comparten a propósito.
- **Portadas EXPLÍCITAS** (`portadaMapa`), como en 3°: la convención implícita
  `assets/portada-<id>.png` pediría 22 archivos que no existen y el `onerror` los tapa a la
  vista, no en la red.
- **⚠️ `META_OA` es lo primero que se olvida al forkear, y muere en silencio.** 7° se
  publicó con el `META_OA` de 8° tal cual (los 69 códigos `HI08/CN08/MA08/LE08`, cero de
  7°), así que la **meta de aprendizaje —la tarjeta 🎯 y la línea del quiz— estuvo muda en
  todo el nivel** desde la Sesión 62 hasta la 63: `metaDeEtapa` cae a `c.nombre` y muestra
  el nombre de la etapa, que se ve razonable, así que nada delata el fallo. **No hay error,
  no hay 404, no hay nada que mirar.** Es el mismo punto ciego del `oa` (Sesión 23) y del
  `visual` (Sesión 55): un campo que se pierde al copiar y solo degrada.
  **La comprobación que lo caza, y que ahora va en toda verificación de nivel:**

      EXPEDICIONES.flatMap(e=>e.etapas).flatMap(t=>t.oas||[t.oa])
        .filter(o=>o&&o!=='BOSS').filter(o=>!META_OA[o])

  Debe dar **arreglo vacío**. En 8° devuelve los 13 códigos `VOC-*` y `AF-T*`, y eso **está
  bien**: Vocabulario y Ana Frank no son OA del currículum y no llevan meta a propósito.
- **Lo que hubo que desconectar del fork** (la trampa que ya mordió tres veces en 3°): el
  camino de lecciones de Matemática, el Reto de Cálculo, el landing de Vocabulario y la
  biblioteca de Ana Frank. Todo eso es contenido de 8°.
- **Matemática de 7° es campaña normal, no camino de lecciones.** El sub-producto de 8°
  (17 mini-clases con diagramas SVG) costó varias sesiones; el motor sigue en el fork, así
  que agregárselo después es solo datos.
- **Las CUATRO asignaturas tienen Modo Difícil** y la Maestría Total exige las cuatro. En
  8° Matemáticas queda fuera porque su dificultad es el Reto de Cálculo, que aquí no existe.
- **Se quitaron la skin `kimun-calculista` y la insignia `maestro-calculo`**: su requisito
  es El Autómata, que 7° no tiene, y habrían quedado bloqueadas para siempre en la tienda.
  Una recompensa inalcanzable es peor que no ofrecerla.
- **El nivel viaja en el código de OA**: `HI07`, `MA07`, `CN07`, `LE07`. Hay que sumarlos a
  `kimun_oa_asignatura` y a **las dos** listas de `kimun_prof_asignaturas` (si falta uno,
  ese contenido queda **invisible para el Jefe sin ningún error**), y en `profesor.html` a
  `OA_CARPETA`, `ASIG_NOMBRE`, `ASIG_ORDEN`, `SB_asigDe` y `NIVELES_MUESTRA`.
  ⚠️ **Requiere re-aplicar `supabase/schema.sql`.**
- **`FECHA_PUERTA='2026-10-01'`** (alineada con 8°) y `DEMO_LIBRE='hist7-cap1'`.
- **Arte prestado de 8°, declarado en comentarios.** Los villanos sí tienen nombre propio:
  El Anacronismo (Historia), El Azar (Matemática), La Erosión (Ciencias) y El Silencio
  (Lenguaje).

#### Cuidados del contenido de 7°

- **⚠️ Ciencias trae contenido sensible obligatorio:** los `CN07 OA 01/02/03` son
  sexualidad, ciclo menstrual, métodos de control de la natalidad e ITS. Es currículum
  oficial, el banco está escrito de forma factual y sin promover ninguna postura, pero
  **hay que avisarle al colegio antes de publicarlo** — el colegio piloto es salesiano.
  ⚠️ **Desde el 02/09 ese contenido NO entra en ningún Jefe Final**, y no es configurable: el
  Jefe Final se abre al 100% de la campaña y **mezcla objetivos de toda la asignatura**, así que
  tenía una fase entera de esos tres OA y un colegio que no incluyera el capítulo **se los
  encontraba igual ahí**. Sacarlos deja el contenido sensible **viviendo en un solo lugar —su
  capítulo—**, que es lo que hace que excluirlo sea posible de verdad. El jefe conserva sus 4
  fases y sus 16 preguntas. El **jefe del capítulo se queda**: quien no lo incluye nunca llega a
  él. Regla, alcance y chequeo en
  [`docs/contenido-sensible.md`](docs/contenido-sensible.md); vale igual para los
  `CN06 OA 04/05/06` cuando se construya 6°.
- **`LE07 OA 12` está FUERA del banco**: escritura creativa de tema, género y destinatario
  libres, cuyo indicador oficial es "escriben al menos una vez a la semana". Mismo criterio
  que el `LE03 OA 16` de 3°.
- **Lenguaje NO sigue las 7 unidades del Programa.** Sus OA 01, 02, 07 y 15 aparecen en
  casi todas: por unidades, el mismo objetivo quedaría medido siete veces. Los capítulos
  son del juego, por tema, y así se declara en su `oa.json`.
- **Historia parte la unidad 1 en dos y Ciencias parte la unidad 2 en dos**, por longitud;
  queda declarado en el plan.
- **Los OA de actitud y de producción se miden por reconocimiento y siempre sobre un
  tercero con nombre**, nunca sobre la conducta del jugador. El mapa de dominio le va a
  mostrar al profesor un porcentaje junto a "respeto y tolerancia", y eso se lee como nota
  de conducta si no se cuida.

#### Escribir el banco de 7°

El estándar es **`docs/encargo-banco.md`** (único para todos los niveles; búscate en la tabla
del §0), que para 7° fija 12-13 años
**con cronómetro de 20 s** (el largo del enunciado es la restricción, no la edad) y **sin
voz**: 7° no lleva audio pregrabado, y de 5° hacia arriba no vale la pena pagarlo.

- **El sesgo de largo aparece SIEMPRE en la primera pasada** y en una proporción que
  sorprende: medido sobre las primeras tandas de 7°, la correcta era la más larga en **20 a
  25 de cada 30**. El encargo pide ahora escribir los distractores con cuerpo **desde el
  primer borrador**; corregirlo al final obliga a reescribir medio banco y es justo donde
  el trabajo se cae si algo lo interrumpe.
- **En Matemática, cada agente verifica la aritmética de sus 30 claves con un script y lo
  reporta.** No es formalidad: los verificadores encontraron distractores cuya
  justificación no producía su propio número (uno decía "se divide por 100" y mostraba otra
  cifra), lo que convierte una pregunta de 4 opciones en una de 3. Ninguna revisión de
  estilo caza eso.
- **Herramientas ya generales, no clonar más:** `scripts/consolidar-pool-nivel.py <carpeta>`
  (antes `-3ro`) y `scripts/revisar-tanda.py --largo=N` sirven para cualquier nivel.

### Gotchas de 3° básico (`3ro/index.html`, que es un FORK de 8°)

- **`localStorage` está separado por sufijo.** `/3ro` y `/juego` se sirven del mismo origen, así
  que compartían `kimun_save`: un niño con los dos juegos abiertos compartía monedas, skins y
  avance. En 3° las claves llevan `SUFIJO='_3ro'` (`kimun_save_3ro`, `kimun_dom_pend_3ro`,
  `kimun_rank_3ro`, `kimun_intro_3ro`). Los **ajustes de audio se comparten a propósito**.
  Ojo: `NS` ya está tomado por el namespace de SVG — de ahí el nombre `SUFIJO`.
- **La portada de capítulo es EXPLÍCITA en 3°.** 8° usa la convención implícita
  `assets/portada-<id>.png`; en 3° ningún capítulo tiene arte propio todavía y esa convención
  pedía 7 archivos inexistentes (**404 verificados**; el `onerror` los tapaba a la vista, no en
  la red). `portadaMapa` usa `exp.portadaMapa || exp.portada`. Cuando exista el arte de un
  capítulo, se le agrega `portadaMapa:'…'`.
- **3° tiene sus cuatro asignaturas: Matemática (`MA03`, 26 OA / 792), Historia (`HI03`,
  16 / 480), Ciencias Naturales (`CN03`, 13 / 390) y Lenguaje (`LE03`, 30 / 896).** Los
  cuatro bancos nacen `revisada:false`.
  - **Ciencias** son 4 capítulos = las **4 unidades oficiales** del Programa, y quedan
    disparejas a propósito (3-3-5-2): el Programa parte por Física y deja las plantas en la
    unidad 3. Sus **6 OAH (habilidades) y 6 OAA (actitudes) quedan FUERA del banco**: miden
    desempeño observable que una pantalla no ve, y además sus códigos con letra
    (`CN03 OAH a`) **no calzan** con la validación del servidor, así que el backend los
    descartaría en silencio. Cuidados de precisión: `docs/cuidados-ciencias.md`.
  - **Lenguaje** es la asignatura menos evaluable por quiz de todo el proyecto: **17 de sus
    31 OA son de producción o de hábito**. Sus capítulos **NO siguen las unidades** del
    Programa —que no tienen nombre temático, reparten el mismo OA en varias y hasta parten
    OA por dentro—, sino temas reconocibles para un niño; los nombres son del juego y así
    queda dicho en su `oa.json`. El **`LE03 OA 16` ("escribir con letra clara") está
    EXCLUIDO del banco**: es caligrafía manuscrita y no admite ninguna pregunta honesta.
    Qué se puede preguntar de cada OA: `docs/cuidados-lenguaje-3basico.md`.
  - Historia son 16 OA en 5 capítulos que siguen las **unidades oficiales del Programa de
    Estudio**, no un corte inventado. Cuatro de sus OA (11, 12, 13 y
  16) son **actitudinales** —"asumir", "mostrar actitudes", "mantener una conducta",
  "participar"—: un quiz no puede medir conducta, solo si el niño **reconoce** la acción
    correcta, y por eso sus preguntas plantean siempre la situación de otra persona. La
    advertencia está escrita en `contenido/historia-3basico/oa.json` (`nota_evaluacion`),
    porque el mapa de dominio va a mostrar un porcentaje junto a "conducta honesta" y eso
    se puede leer como una nota de conducta. La **misma regla vale en Ciencias** (OA 07,
    higiene) y en **Lenguaje** (OA 01, 07, 08, 25, 26, 27, 28, 30 y 31).
- **Los dibujos de 3° son once**, todos por código: `contar`, `agrupar`, `fraccion`, `recta`,
  `reloj`, `barras`, `cuerpo` (Matemática) y `cuadricula`, `globo`, `zonas`, `linea`
  (Historia). **Ciencias y Lenguaje no tienen ninguno**: se les pidió a los redactores que
  NO pusieran `visual` y que en cambio dijeran cuáles lo pedirían, y la respuesta más
  repetida fue que el dibujo útil estaba a un paso de delatar la clave. El catálogo de
  candidatos quedó en los informes de esos agentes. Regla al agregar uno: **no puede delatar la respuesta**, y su descripción para
  lector de pantalla tampoco (dice "una línea marcada", nunca cómo se llama).
- **Al agregar una asignatura a 3°, revisar qué cableado de 8° hereda.** `3ro/index.html`
  es un FORK, y el fork trae rutas que en 3° no existen. Pasó dos veces: en la Sesión 54
  `renderExpediciones` crasheaba por buscar la campaña de lecciones de 8°, y en la Sesión
  61 **tocar Lenguaje abría el landing "Campaña + Vocabulario" de 8°** — en 3° no hay
  Vocabulario, así que la asignatura entera era inalcanzable. Lo delató jugar la pantalla,
  no leer el código.
- **Escribir el banco con agentes: el estándar vive en `docs/encargo-banco.md`**,
  y las trampas propias de cada asignatura en `docs/cuidados-<asignatura>-3basico.md`. El
  agente lee esos archivos; el encargo por agente son 6 líneas. Sirve además como criterio
  de revisión después. **Validar el estándar con las primeras tandas antes de escalar:**
  descubrir un defecto del encargo con 13 tandas escritas cuesta la mitad que con 43.
- **Un OA que no admite pregunta honesta se deja FUERA del banco.** `LE03 OA 16`
  ("escribir con letra clara") es caligrafía manuscrita: no hay versión preguntable, y se
  documenta en su `oa.json` en vez de inventar un ítem que finja medirlo. A los agentes se
  les pide explícitamente entregar **menos preguntas** antes que rellenar; el OA 07 de
  Lenguaje entregó 26 de 30 y explicó por qué.
- **`scripts/auditar-audible-nivel.py` — preguntas que no se pueden responder ESCUCHANDO.**
  3° lee en voz alta y quien usa ese botón es el que peor lee. Una pregunta cuyas opciones
  son *"Había / Havía / Abia / Habia"* tiene el JSON perfecto y es irresoluble por el oído.
  El chequeo compara lo que se **pronuncia** (pasa por el normalizador de voz) y aplica la
  fonética del español de Chile (hache muda, be=ve, seseo, yeísmo, ge/je). **Cuidados
  aprendidos armándolo:** comparar el texto crudo acusa `15 + 9` contra `15 - 9`, que
  suenan clarísimo distinto; y una **letra sola** se pronuncia por su nombre ("la ese",
  "la zeta"), así que no se le aplica la fonética.
  ⚠️ **No cubre** el caso en que la respuesta depende de ver la grafía sin que las opciones
  sean homófonas (*"¿cuál se escribe con jota: girasol, gente, jirafa, gigante?"*). Eso hay
  que cazarlo leyendo. Las dos vías se complementan.
- **El `tip` NO puede nombrar la posición de una opción.** Las tandas se escriben con la
  correcta primera y el consolidador **baraja**, así que *"solo la primera lleva signos de
  interrogación"* termina contradiciendo la pantalla. No se ve revisando la tanda, porque
  ahí todavía es cierto. `revisar-tanda.py` lo avisa (es aviso y no error: un chequeo
  léxico no distingue "la primera **lleva**" —la opción— de "si la primera **es** igual"
  —la letra—; marca 3 en los cuatro bancos y solo 1 es real).
- **La voz se genera DESPUÉS de auditar, nunca en paralelo.** Cada texto corregido obliga a
  regenerar su clip y a pagarlo de nuevo, y deja huérfano el anterior. En la Sesión 61 se
  lanzó la voz de Ciencias junto con sus auditorías y hubo que rehacer los textos de 20
  preguntas.
- **La voz pregrabada va por asignatura, una carpeta cada una** (`assets/voz/mat3/`,
  `assets/voz/hist3/`, `assets/voz/cie3/`, `assets/voz/len3/` y `assets/voz/ada3/`, la del
  libro), y el juego **carga y fusiona los manifiestos**. Los módulos transversales entran
  por la misma puerta: su entrada en `ASIGS` filtra los nombres de etapa por el id de su
  expedición (`caps`) en vez de por un prefijo de nivel. Separarlas
  evita volver a pagar Azure por lo ya generado al agregar una asignatura. El generador
  recibe la asignatura como primer argumento (`python scripts/generar-voz-nivel.py hist3`).
  ⚠️ **Gotcha caro:** el manifiesto se indexa por el texto **mostrado**, así que cambiar
  `normalizar-voz-nivel.py` —o sea cambiar cómo se PRONUNCIA algo— **no invalida ningún
  clip**: los viejos siguen sonando como antes, en silencio. Hay que borrarlos del
  manifiesto a mano y regenerarlos.
- **La identidad en línea también está separada** (Sesión 58). 3° crea su cliente de Supabase con
  `storageKey:'kimun-3ro'`, el mismo patrón que ya usaba `profesor.html`. Sin eso, 3° y 8° eran el
  **mismo usuario anónimo**: el mismo perfil, el mismo XP en el ranking y el mismo vínculo con un
  código `ALU-`. Verificado: 8° y 3° obtienen ids de perfil distintos y volver a 8° recupera el suyo.
- **El nivel viaja en el prefijo del código de OA**, que es como el modelo ya distingue asignaturas
  (`HI08`, `MA08`…). 3° usa **`MA03`**, sin columna `nivel` ni entidad "Colegio": un curso de 3° se
  administra con la asignatura `MA03` y el aislamiento por asignatura que ya existía los separa.
  Tocó cuatro listas —`kimun_oa_asignatura` y `kimun_prof_asignaturas` en el servidor, `OA_CARPETA`
  / `ASIG_NOMBRE` / `ASIG_ORDEN` y el espejo `SB_asigDe` en el panel, y `ASIG_DESAFIO_NOMBRE` en el
  juego de 3°— y de paso el bloque de refuerzo dejó de repetir la lista a mano (era la causa del bug
  de la Sesión 37). **Si falta un código en `kimun_prof_asignaturas`, ese contenido queda INVISIBLE
  para el Jefe sin ningún error**: por eso la función lleva ahora una advertencia encima.
- **El CURSO sí guarda su nivel desde la Sesión 73** (`cursos.nivel`, dos dígitos), y eso corrige
  la contrapartida que la Sesión 58 había asumido: las casillas de "Equipo del curso" mostraban
  **las asignaturas de todos los niveles en todos los cursos**. Con tres cursos eran 12 casillas;
  con seis serán 24, y nada impedía marcarle `MA08` a un curso de 3°. Ahora se muestran solo las
  suyas y **el servidor rechaza** una de otro nivel (`asignatura_de_otro_nivel`).
  - **No hizo falta ninguna lista nueva**, y ese es el punto: el nivel ya vive dentro del código
    de asignatura (`MA03` = `MA` + `03`), así que pertenecer al curso es *terminar en su nivel*.
    Es la misma idea que sostiene M4 (`niveles.js`), y esto adelanta un pedazo de esa tarea.
  - `NIVELES_MUESTRA` (en `profesor.html`) pasó a ser **LA lista de niveles del panel**: de ahí
    salen el armador de enlaces de muestra, el selector del enlace de inscripción y el nivel del
    curso. Agregar un curso nuevo sigue siendo **una línea**.
  - **`nivel` es NULLABLE a propósito.** Un curso creado antes de la columna se comporta como
    antes (ve todas las asignaturas) y el panel le ofrece fijárselo con `kimun_prof_curso_nivel`.
    Inventarle un nivel a partir del nombre habría sido adivinar.
  - Y el enlace de inscripción **se preselecciona con el nivel del curso**: mandarle a un 3° el
    enlace de `/juego/` era el error fácil de esa pantalla.

### Finales de línea: LF en todo, declarado en `.gitattributes` (31/08/2026)

`.gitattributes` fija **`* text=auto eol=lf`** para todo el proyecto y declara binarios los
tipos de arte, audio y video. Con eso el disco es igual al índice, y un script nuevo no
necesita ninguna ceremonia para no ensuciar el árbol.

> **La premisa con la que se planificó esta tarea era falsa, y conviene dejarlo escrito.**
> Se creía que faltaba normalizar el repositorio y que la migración *"toca todos los archivos
> y produce un commit gigante"*. Medido: **el índice ya estaba 100% en LF** —376 archivos de
> texto, ninguno con CRLF guardado—, y lo que GitHub Pages sirve siempre fue LF. El desorden
> estaba **en el disco**: 187 archivos con CRLF contra 188 con LF, casi una moneda al aire,
> más `.gitignore` con los dos mezclados. Y el disco es lo que leen y reescriben los scripts,
> varios de los cuales conservan el formato que encuentran — así es como un mismo script
> producía CRLF en un PC y LF en el otro.
>
> Pasar los 188 archivos a LF **no cambió ni un byte de contenido para git**: el `git diff`
> siguió mostrando exactamente los 11 archivos que se habían editado a mano. Verificado
> comparando `git status` antes y después.

Dos cosas que hay que saber al hacerlo, porque las dos asustan sin motivo:

- **`git status` marca cientos de archivos como modificados y `git diff` sale vacío.** Es la
  caché de `stat`, que quedó rancia al reescribirlos. `git update-index --refresh` **no la
  arregla** (solo mira `stat`, no vuelve a calcular el hash); lo que la limpia es
  `git add --renormalize .`, que no puede colar nada porque los blobs son idénticos.
- **Antes de renormalizar, mirar `git diff --numstat`**, que sí aplica los filtros. Ahí se ve
  el cambio real y se distingue del ruido.

### Regla de commits (importante)

> #### ⚠️ El mensaje de commit va SIEMPRE en un archivo, con `git commit -F`
>
> Pasó en la Sesión 65: el mensaje se pasó con una **here-string de PowerShell**
> (`-m @'…'@`) desde la herramienta Bash, que es **Git Bash, no PowerShell**. Ahí esa
> sintaxis no existe: el `@` se tomó como el primer renglón del mensaje, así que **el
> asunto del commit quedó siendo un solo carácter `@`** y el título real bajó al cuerpo.
> Cerró bien, sin error, y solo se vio mirando `git log`.
>
> Es hermano del `*/` dentro de un comentario (Sesión 63) y del corte por índices
> (Sesión 56): **sintaxis del shell equivocado que no falla, solo deforma.** Y aquí duele
> porque en este proyecto **el log de commits es parte del registro**, y arreglarlo obliga
> a reescribir historia ya subida.
>
> **La regla, que evita el problema entero sin depender de qué shell corra:**
>
> ```bash
> git commit -F <(cat <<'FIN'
> Titulo en una linea
>
> Cuerpo…
> FIN
> )
> ```
>
> o, más simple, escribir el mensaje a un archivo del scratchpad y pasarlo con `-F`.
> **Nunca `-m` con varias líneas**, y nunca `@'…'@` en Bash.
>
> Cómo se comprueba antes de dar el commit por bueno: `git log -1 --format="%s"` tiene que
> devolver el título de verdad, no un símbolo suelto.

- **"orden 99" = hacer `git pull`** de la rama `main` para traer lo último de
  GitHub. Se usa al empezar a trabajar desde otro PC (típicamente al llegar a casa
  o a la oficina), para sincronizar antes de tocar nada.
- **Durante las sesiones NO se hace commit ni push** hasta que Roberto lo pida
  explícitamente con la orden **"orden 66"**. Claude debe esperar la orden.
- **La "orden 66" SIEMPRE deja todo actualizado antes del commit+push.** Como parte
  del procedimiento, antes de subir hay que: (1) agregar a la bitácora de abajo lo
  avanzado y lo pendiente de la sesión, y (2) revisar que `CLAUDE.md` y `README.md`
  reflejen el estado real (estado, roadmap, decisiones). Recién entonces commit + push.
- **Después del push, informar los cambios en el AI Brain (NotebookLM) de Roberto.**
  Es parte de la orden 66: escribir un resumen breve de la sesión (lo avanzado y lo
  pendiente) y subirlo al notebook con el CLI de `notebooklm-py`:
  `<venv>\Scripts\notebooklm.exe source add '<ruta-del-resumen>' --notebook '19408e05-1f37-48b6-b398-644519ac019e'`.
  ⚠️ **Desde el 31/08 ese `.exe` NO corre en el PC de casa**: lo bloquea el Control de aplicaciones de Windows (*"Una directiva de Control de aplicaciones bloqueó este archivo"*), y desde Git Bash el síntoma engaña —dice `Permission denied`—. **La salida es invocar el MÓDULO en vez del ejecutable**, que hace exactamente lo mismo y no está bloqueado:
  `<venv>\Scripts\python.exe -m notebooklm source add '<ruta>' --notebook '<id>'`.
  **La ruta del CLI depende del equipo** (el usuario de Windows cambia entre el PC de casa y
  el de la oficina): venvs conocidos `C:\Users\Rodrigo\.notebooklm-venv\...` y
  `C:\Users\rlorc\.notebooklm-venv\...`. Si no está instalado en ese PC:
  `python -m venv ~/.notebooklm-venv && ~/.notebooklm-venv/Scripts/python.exe -m pip install "notebooklm-py[browser]"`.
  La **autenticación** vive en `<perfil>\.notebooklm\profiles\default\storage_state.json`;
  mientras no caduque, `source add` **no pide login** (usa las cookies, sin navegador).
- **Si el CLI dice "Authentication expired", PRIMERO probar esto — casi nunca hace falta molestar
  a Roberto (verificado Sesión 56):** el CLI y el navegador guardan la sesión en **dos lugares
  distintos**. Es habitual que `storage_state.json` caduque mientras el **perfil persistente**
  (`profiles\default\browser_profile`) sigue con sesión viva. Se comprueba abriendo ese perfil
  **headless** en `notebooklm.google.com`: si la URL final **no** es `accounts.google.com`, hay
  sesión. En ese caso basta `ctx.storage_state(path=...)` para **regenerar el archivo del CLI
  desde el perfil**, y `source add` vuelve a funcionar al instante. Respaldar el archivo anterior
  antes de sobrescribirlo.
- **Solo si el perfil TAMPOCO tiene sesión, rehacer el login por navegador. GOTCHA verificado
  (Sesión 52):** el Chromium empaquetado de playwright falla en este entorno con
  `spawn UNKNOWN` (headful) o timeout (headless). **Usar el Google Chrome instalado**
  (`channel="chrome"`, `headless=False`) para abrir la ventana; Roberto inicia sesión en Google
  → notebooklm.google.com, y recién entonces se capturan las cookies a `storage_state.json`.
  Con `channel="chrome"` el login interactivo **SÍ se puede lanzar desde el asistente** (se probó
  y funcionó); lo que no funciona es `notebooklm login` (entrada interactiva en terminal) ni el
  chromium de playwright. **Al esperar el login, NO esperar el evento `close` de la página**: la
  pestaña inicial se cierra sola en la redirección de Google y el script termina creyendo que
  Roberto ya entró (pasó en la Sesión 56). Esperar a que la URL sea la de los notebooks.
- **Respaldo automático a las 18:00:** cualquier día en que haya cambios sin
  guardar, una Tarea Programada de Windows ejecuta `scripts/auto-commit.ps1`,
  que hace commit y push solo si detecta cambios. Así no se pierde trabajo
  entre oficina y casa.
- Para activar el respaldo en otro PC, ejecutar una vez
  `scripts/registrar-tarea.ps1`.
- El registro de ejecuciones queda en `scripts/auto-commit.log` (ignorado por git).

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
- **✅ APLICADA Y AGENDADA. Verificada el 28/08/2026:**
  `select count(*) from cron.job where jobname='foto-semanal';` devuelve **1**. Roberto la
  aplicó el 27/08 pegando `supabase/aplicar-foto-semanal.sql` (Sesión 60), que habilita
  `pg_cron`, agenda el trabajo y **se verifica solo** devolviendo 4 filas en `ok`. Existe
  justamente para que el guard de abajo no pueda morder — y no mordió.
- **Todavía NO hay ninguna foto tomada, y está bien.** El archivo **solo agenda**; no siembra
  (lo de sembrar a mano es un comentario, no una sentencia). La primera la toma el trabajo el
  **lunes 31/08/2026 a las 04:05 UTC**, etiquetada con el domingo que cierra, **30/08**.
  > ⚠️ **No sembrarla a mano antes del lunes.** Los dos `insert` llevan `on conflict do
  > nothing`, así que una foto sembrada hoy —viernes 28— se etiquetaría igual, con el domingo
  > 30, y **la corrida del lunes no haría nada**: la primera semana quedaría congelada con los
  > datos del viernes en vez de los de la semana completa. Conviene dejarla correr sola.
- El guard de `pg_cron` **falla en silencio**: si la extensión no está habilitada,
  el `raise notice` no se ve en el panel de Supabase, el pegado termina "sin
  errores" y el trabajo queda sin agendar. Por eso, después de pegar el archivo,
  la comprobación obligatoria es
  `select count(*) from cron.job where jobname='foto-semanal';`, que debe dar 1.
  Si da 0, no quedó agendado y cada semana que pase se pierde.
- Las tablas tienen `on delete cascade` sobre `perfiles`: **borrar un alumno
  borra todas sus fotos pasadas**, así que un informe de una semana ya cerrada
  puede cambiar retroactivamente. Es coherente con la privacidad del proyecto (se
  va el niño, se van sus datos), pero hay que tenerlo presente cuando se
  construya el informe semanal.

## Herramientas de desarrollo

### Parámetros de URL (ocultos)
- **`?qa=1` — Modo QA:** marca la respuesta correcta en todas las preguntas (expedición,
  jefe, duelo, Reto de Cálculo) y **desbloquea todo** (capítulos, jefes, niveles del
  Reto), para probar cualquier parte sin avanzar en orden. Muestra un aviso arriba a la
  izquierda. No afecta el juego normal (sin el parámetro). Implementado con la constante
  global `QA` y la clase CSS `.qa-ok`.
- **`?intro=1`:** fuerza que la intro de bienvenida se reproduzca aunque ya se haya visto
  (por defecto se ve una sola vez por dispositivo; flag `kimun_intro` en localStorage).
- **`?solo=id1,id2,…` — Modo prueba (enlace acotado):** muestra **solo** esos capítulos
  (ids de `EXPEDICIONES`), **todos abiertos** — capitulos y las 5 etapas de cada uno,
  jefe de capítulo incluido — y con **dificultad normal**: a diferencia de `?qa=1`, **NO**
  marca las respuestas. **No guarda nada**: ni `localStorage` ni Supabase, y **no toca la
  partida** que ya exista en ese teléfono (el alumno que ya jugaba conserva monedas,
  skins y campañas). Entra como "Invitado", sin pedir código `ALU-` y sin la intro.
  Oculta la barra inferior (Tienda/Logros), el botón "Volver" de la campaña, el Desafío
  Extra y el Jefe Final. Pensado para pasarle a un grupo de alumnos un enlace de
  práctica acotado a las unidades que están viendo.
  Ejemplo: `https://vulpo.cl/juego/?solo=hist-cap2,hist-cap3,hist-cap4`.
  Se puede **combinar con `?qa=1`** para revisar contenido acotado (manda QA: marca las
  respuestas, pero se sigue sin guardar). Ids inválidos se ignoran; si no queda ninguno
  válido, cae al juego normal.
  **No es un candado:** al ser un sitio estático, quien borre el parámetro llega al juego
  completo. Es acotamiento, no seguridad.
- **`?armar=1` — Armador de enlaces de muestra (solo Admin):** pantalla oculta que lista
  todos los capítulos activos agrupados por asignatura, con casillas, y construye el enlace
  `?solo=…` correspondiente (con `&qa=1` opcional, casilla "Mostrar las respuestas
  correctas"). Botones Copiar y Probar. El enlace se arma con `location.origin`, así que
  abierto desde vulpo.cl genera enlaces de vulpo.cl y en local genera locales. Se llega
  desde `profesor.html` → Administración → "🔗 Armar enlace de muestra": un **selector de nivel**
  (8° → `/juego/`, 7° → `/7mo/`, 3° → `/3ro/`) + "Abrir armador", visible solo para `YO.es_admin`
  (no lo ven los SuperUsuarios). **Cada app tiene su propio armador** y lista solo sus capítulos;
  agregar un curso nuevo al selector es **una línea** en `NIVELES_MUESTRA` (`profesor.html`). **Vive en `index.html` a propósito:** el
  catálogo (`EXPEDICIONES`) ya está ahí, así que una expedición nueva aparece sola, sin
  listas paralelas que mantener.
  ⚠️ **Pero lo que no es una expedición hay que declararlo en `EXTRAS`, o no aparece.** Pasó dos
  veces con lo mismo: el **Reto de Cálculo** (Sesión 70) y las **4 unidades de mini-clases**
  (Sesión 82) no se veían, así que un profesor con un enlace de muestra nunca conocía esa parte
  del producto. Al agregar un módulo con pantalla propia, su entrada en `EXTRAS` va en el mismo
  trabajo — y con ella hay que **probar el camino completo en modo prueba y en `?rev=1`**, que es
  donde aparecieron las tres fugas de la Sesión 82. Como `?solo=`, **no es un candado**, pero tampoco expone
  nada nuevo.
- **`?m=<token>` — Muestra con caducidad:** misma experiencia que `?solo=`, pero los datos
  viajan en un token **base64url** con el formato `ids|AAAA-MM-DD|1` (ids de capítulos, fecha
  de caducidad, y `1` si se muestran las respuestas). Sin fecha, no caduca. La **vigencia es
  inclusiva**: un enlace con `2026-09-15` sirve todo el 15 y muere el 16. Al vencer aparece
  una pantalla sobria con la fecha y un botón al juego completo (VULPO es público: caducar el
  enlace apaga la muestra, no el juego). Un token corrupto cae al juego normal. Lo genera el
  armador (`?armar=1`), que además **sabe leer un enlace** y decir qué contiene y cuándo vence.
  **El token es un DISFRAZ, no un cifrado:** base64 es público y reversible en un minuto.
  Sirve para que la fecha no se vea en la barra de direcciones —y nadie sienta la invitación a
  editarla—, no para detener a quien sepa lo que mira. Además se compara con el **reloj del
  dispositivo**, que se puede atrasar. **No hay revocación:** un enlace repartido vive hasta
  su fecha. Revocar de verdad exigiría Supabase, y se descartó por costo.
  `?solo=` sigue existiendo y **nunca caduca** (es el formato del enlace ya repartido).
- **`?rev=1` — Modo revisión de profesor (Sesión 56):** se agrega a un enlace de muestra
  (`?solo=` o el 4.º campo del token `?m=`) y lo convierte en un recorrido para que un docente
  revise el contenido y opine. Cambia tres cosas: **3 preguntas por etapa** en vez de 10 (un
  capítulo pasa de 55 a 15; revisar 40 por capítulo agota a cualquiera, y quien se cansa deja de
  mirar con atención), un **🚩 por pregunta** que guarda su **id** (`mat3-oa14-8`) y una
  **pantalla final** para escribir o **grabar un mensaje de voz**. Hereda todo del modo prueba:
  no guarda nada ni toca la partida del dispositivo.
  - **El comentario llega por WhatsApp, no por un backend, a propósito.** El sitio es público:
    una tabla escribible por cualquiera sería una puerta a basura, y el profesor ya conversa por
    ahí. **La contra asumida es que si no completa el envío, ese comentario se pierde.** El audio
    no se sube a ninguna parte: se comparte con el botón nativo del teléfono (en computador se
    descarga y se explica qué hacer, en vez de dejar un botón que aparenta funcionar).
  - **La maquinaria vive FUERA de los juegos, en `assets/js/revision.js`**, porque cada curso es
    un fork y lo que se escribe adentro hay que reescribirlo en el siguiente. El módulo inyecta
    su CSS, su pantalla y el botón 🚩 él solo; **integrarlo en un curso nuevo son 5 líneas**
    (incluir el script, `REV.init`, y engancharlo en `nPreguntas`, `pintaPregunta` y `go`). Con
    el modo apagado no inyecta nada. Ya está en **los tres cursos**, y el armador (`?armar=1`) de
    ambos tiene su casilla.
  - **⚠️ Al agregar un `<script src>` al juego, PROBAR SIEMPRE que pasa si NO carga.**
    Sacar este módulo a un archivo aparte creó una **dependencia dura en el arranque**: la
    llamada `REV.init(...)` vive en el nivel superior del script, así que un 404 de
    `revision.js` **mataba todo el JavaScript del juego**. El síntoma es engañoso —la pantalla
    inicial se ve igual, porque es HTML, pero **ningún botón responde**, ya que el juego murió
    antes de cablearlos—. Pasó de verdad: al desplegar, el archivo tardó ~2 minutos en estar
    disponible en `vulpo.cl`, y quien abriera en esa ventana veía el juego muerto. **El alcance
    no era el modo revisión sino el juego entero**: cualquier alumno con red lenta o un
    bloqueador de scripts. Ambas apps traen ahora un **respaldo vacío** (`if(!window.REV)
    window.REV={...no-op...}`) antes de usarlo, verificado apuntando a un archivo inexistente.
  - **Requisito del motor:** las preguntas deben llevar `id`. Hubo que propagarlo en los **6
    constructores de cada app** — el mismo punto ciego que ya causó dos bugs silenciosos (el `oa`
    en la Sesión 23 y el `visual` en la 55). Al tocar un constructor, revisar que no se caiga un
    campo.

- **`?inscribir=<token>` — Inscripción por enlace (modo experimental):** un solo enlace
  al chat del curso; cada persona escribe su nombre, se crea sola en un curso que el
  profesor ya abrió, recibe su código `ALU-` y **su avance se registra como el de
  cualquier alumno** (XP, mapa de dominio, participación, refuerzos). El enlace lo genera
  el profesor desde su panel, con su **cupo**, y cada curso tiene **uno vivo a la vez**
  (índice único en la base): crear otro cierra el anterior.
  - **⚠️ El enlace ES la credencial, y abre el producto completo.** Un `ALU-` filtrado
    regala un cupo; este enlace reenviado fuera del chat los regala todos hasta llenarse.
    Por eso el cupo se ajusta al grupo y no se deja holgado. **No hay revocación por
    persona**, solo cerrar el enlace.
  - **El "modo experimental" es propiedad del CURSO, no del enlace ni del aparato**
    (`cursos.experimental`), y lo marca el profesor al crearlo. Abre **todos los
    capítulos** y deja **cerrados los jefes** —el de cada capítulo y el Jefe Final—, para
    que alguien pueda recorrer el contenido sin jugarse el año en orden pero conservando
    la meta. Que viva en el curso es lo que hace que **sobreviva a borrar los datos del
    navegador**: al re-canjear el `ALU-` vuelve solo.
  - **Cómo llega ese modo al juego, que es la parte delicada:** `CAPS_ABIERTOS` se evalúa
    al cargar el archivo y el curso llega del servidor un segundo después, así que el modo
    se **recuerda en `localStorage`** (`kimun_exper`, `kimun_exper_7mo`, `kimun_exper_3ro`)
    y `sincronizarModoCurso()` lo reconcilia con `kimun_mi_curso()`: si no calzan, escribe
    y **recarga una sola vez** (guard en `sessionStorage`, para que un desacuerdo no deje
    la página recargándose en bucle). El servidor siempre gana.
  - **Los nombres dejan de venir verificados**: los escribe el alumno. `perfiles.autoinscrito`
    los marca, y el panel muestra "se inscribió solo" junto a su XP.
  - **Los tres fallos se dicen distinto** —enlace que no existe, enlace cerrado, sin cupo—
    porque las tres cosas se resuelven de manera distinta y un mensaje genérico deja al
    apoderado sin saber cuál le tocó.
  - **Enlace por nivel**: cada curso es una app distinta, así que el enlace lleva la ruta
    adentro (`vulpo.cl/3ro/?inscribir=INS-XXXXXXXX`). El selector del panel sale de
    `NIVELES_MUESTRA`, el mismo del armador: sumar un curso nuevo sigue siendo una línea.

#### Modelo de acceso (la "puerta")

VULPO nació **completamente abierto**. Desde la Sesión 44 existe una **puerta** que exige el
código `ALU-` para jugar más allá de una demo. **Todo lo gobierna una sola constante en
`index.html`**, `FECHA_PUERTA` (formato `AAAA-MM-DD`):

| Valor | Qué pasa |
|---|---|
| `''` (vacío) | **Nada cambia**: el juego sigue abierto. |
| Fecha futura | **Aviso**: todo abierto, pero en la pantalla de inicio se anuncia el cierre. |
| Fecha llegada (hoy incluido) | **Puerta cerrada**: sin código solo se juega la demo. |

Llegada la fecha el cierre **ocurre solo**, sin desplegar nada ese día.

> **ESTADO ACTUAL: `FECHA_PUERTA='2026-10-01'` en los TRES niveles.** Roberto la fijó primero en
> 8° el 25/08/2026, en la Sesión 65 se alineó **3° y 7°** (que estaban abiertos y por lo tanto
> eran gratis), y el **31/08/2026 la corrió de septiembre a octubre**. Una plataforma, una fecha.
> Los tres muestran la banda que anuncia el cierre, y **el 1 de octubre de 2026 VULPO deja de ser
> gratuito**: sin código `ALU-` solo se juega la demo de cada nivel (`hist-cap1` en 8°,
> `hist7-cap1` en 7°, `mat3-cap1` en 3°). Para posponerlo o cancelarlo, editar esa constante en
> cada `index.html`.
>
> **Correrla es barato y no rompe nada**, pero recordar que el **aviso previo se muestra solo
> mientras la fecha es futura**: quien vea la banda hoy va a leer una fecha distinta de la que
> vio la semana pasada. Con un piloto en marcha eso conviene decirlo, no dejarlo aparecer.
>
> **La puerta NO estorba la revisión de un profesor:** `bloqueado()` exige `!PRUEBA`, así que los
> enlaces de muestra (`?solo=`, `?m=`) y el modo revisión (`?rev=1`) la esquivan por diseño.

- **La demo es exactamente `hist-cap1`** ("Los inicios de la modernidad"): 4 etapas + jefe, ~55
  preguntas. La constante es `DEMO_LIBRE`.
- **Se cierra:** el resto de Historia (con su Desafío Extra y Jefe Final), Matemáticas, Ciencias,
  Lenguaje, Vocabulario, Lectura, la Tienda, los Logros y el **Duelo en línea**.
- **Queda libre el Duelo local** en el mismo teléfono: es gancho, no producto. Con la puerta
  cerrada, el botón ⚔️ DUELO lleva directo a él.
- **La llave** es la identidad de alumno que ya existía (`S.alumno`, tras canjear el `ALU-`).
  `tieneLicencia()` se consulta **en vivo**: canjear a mitad de sesión abre la puerta **sin
  recargar**.
- **El candado manda sobre el avance**, pero **no lo borra**: quien ya había completado cosas las
  ve cerradas y las recupera intactas al canjear un código.
- **Excepciones que nunca pasan por la puerta:** los enlaces de muestra (`?solo=`, `?m=`) y
  `?qa=1`. Están incorporadas en `bloqueado()`.
- **Al terminar la demo** aparece `scr-demo-fin` con "Tengo un código" y el contacto
  (vulpochile.app@gmail.com · +569 7668 4967).

> **Es un bloqueo BLANDO, y hay que saberlo antes de venderlo.** Verificado el 24/08/2026 contra
> el sitio en vivo: **las 2.536 preguntas son descargables por cualquiera** pidiendo los archivos
> directo (`contenido/<asignatura>/preguntas.json`): Historia 663, Matemáticas 603, Ciencias 534,
> Lenguaje 514, Vocabulario 150, Ana Frank 72. Es cómo funciona un sitio estático. La puerta
> detiene al apoderado, al alumno y al colegio que no pagó — el 99% real — pero no a quien sepa
> pedir el archivo. Cerrar de verdad exige mover el contenido a Supabase y servirlo pregunta a
> pregunta: proyecto aparte, de meses.

> **VULPO NO funciona sin internet** (verificado 24/08/2026): **no hay service worker**, así que
> sin conexión el sitio ni carga, y cada banco de preguntas se pide con `fetch` al usarlo.
> **No prometerle a un colegio que funciona sin conexión.** La cláusula de "sin internet vale la
> última licencia confirmada" cubre **caídas a mitad de sesión**, no juego sin conexión.
> ⚠️ Desde el 31/08 **sí hay manifiesto** (ver la sección siguiente) y el juego se instala en el
> teléfono — pero **instalarlo no lo hace funcionar sin conexión**: eso lo daría el service
> worker, que no existe. Es una confusión fácil y cara si se la dice a un colegio.

### Instalación en la pantalla de inicio (31/08/2026)

Los tres cursos se pueden agregar a la pantalla del teléfono y quedan como una aplicación: ícono
propio, nombre propio y **sin la barra del navegador**. Nace de un escenario concreto: el enlace
llega al chat del curso, un papá lo abre y le pasa el teléfono al niño — y a los dos días ese
enlace está hundido en el chat.

**Un `manifest.webmanifest` POR CURSO** (`juego/`, `7mo/`, `3ro/`), con su `start_url` y su
`scope` acotados. Con uno solo en la raíz, el ícono abriría siempre el mismo nivel; un papá con
hijos en dos cursos necesita dos íconos y los tiene.

> ⚠️ **El `<link rel="manifest">` va con RUTA ABSOLUTA.** El `<base href="/">` de los tres juegos
> resolvería `manifest.webmanifest` a `/manifest.webmanifest`, que no existe.

**No hay service worker, y la razón decide sola:** en iPhone **no existe la instalación
automática, ni con service worker** — Safari nunca la ofrece, la única vía es *Compartir →
Agregar a pantalla de inicio*. O sea que hay que explicar el paso a paso de todos modos, y el
service worker solo agregaría comodidad en Android. Queda para el Bloque C, y **la decisión de si
hace falta se toma probando en un teléfono real**.

> ⚠️ **Y EN iPHONE ESO VALE SOLO EN SAFARI** (medido en un iPhone real el 01/09/2026). Desde
> **Chrome** el ícono queda igual de bonito, pero al abrirlo **aparece la barra de direcciones**:
> es un acceso directo, no una app. Solo el *Agregar a pantalla de inicio* de Safari respeta el
> `apple-mobile-web-app-capable` que declaramos, y **el fallo engaña porque el ícono se ve igual**.
> No es un caso de borde: el enlace llega al chat del curso, y el **navegador incrustado de
> WhatsApp tampoco es Safari** — ése es el camino mayoritario del piloto.

**`assets/js/instalar.js`** muestra un banner en el inicio y una pantalla con el paso a paso del
sistema que detecte (iPhone / **iPhone fuera de Safari** / Android / escritorio; iPadOS 13+ se
declara como Mac y se delata por el touch). El caso **`ios-otro`** manda primero a Safari, y se
detecta con **lista blanca** —descartando por marca propia a Chrome, Firefox y Edge, que sí traen
el token `Safari/`, y por la ausencia de ese token a los navegadores incrustados—, no enumerando
rivales uno por uno. **No aparece** si ya está instalado —hacen falta las dos comprobaciones,
`display-mode: standalone` en Android y `navigator.standalone` en iOS—, si el papá lo cerró, o
con `SIN_DISCO`, o sea nunca en `?solo=`, `?m=`, `?rev=1` ni `?armar=1`. Como el banner se cierra
para siempre, hay además un enlace permanente junto a Créditos.

> ⚠️ **El banner va COMPACTO, de una línea, y eso no es estética.** Medido en 375×667 (la
> pantalla más chica real): con el aviso de la puerta encima —activo en los tres cursos hasta
> octubre— una versión de dos líneas empujaba el botón **JUGADOR de 522 px a 658 px** de un
> viewport de 667, o sea que un niño abría el juego y **no veía entero el botón de jugar**. Con
> el banner compacto queda en 581 px. El banner es para el papá; el botón es para el niño.
> **Ningún conteo lo delata: se ve mirando la pantalla.**

**Corriendo instalada se oculta el «← Volver a vulpo.cl» del inicio** (`#salirWeb`), que para un
niño es una fuga: lo toca, se le abre el navegador encima y no sabe volver. **El del fin de la
demo se mantiene**, porque es el que lleva al contacto. Es CSS puro
(`@media (display-mode: standalone)`) y vive en el `<style>` de cada fork — **única excepción a
"un módulo se lleva su CSS"**, porque el navegador la aplica solo y meterla en el módulo la haría
depender de que cargue el JavaScript.

**El ícono es propio** (`assets/icono-512.png` / `-192.png`, generados con
`scripts/generar-icono-app.py`): la cara de Vulpi al 80% sobre su fondo durazno, porque Android
recorta a círculo y el `kimun-512.png` original pierde las puntas de las orejas. Ese original
**no se toca**: sigue siendo el favicon y el `apple-touch-icon`.

⚠️ **Lo que no se puede verificar con `cdp.mjs`: la instalación misma.** Chrome headless no
instala PWAs. Se prueba en un teléfono.

**Probado en Android el 31/08 y funciona**: ícono, nombre y sin barra del navegador. Pero la
opción hubo que buscarla **en el menú ⋮** — **Chrome no la ofreció solo**. Eso confirma que el
prompt automático de Android **sí depende del service worker**, y de paso valida la decisión de
poner el paso a paso dentro del juego: sin él, un apoderado no encuentra la opción. Falta
probarlo en iPhone.

> **Y el service worker sería necesario pero NO suficiente para ese prompt:** Chrome además
> exige que el usuario haya interactuado con el sitio, así que aun teniéndolo no aparece
> siempre ni en la primera visita. O sea que **el paso a paso del juego se queda igual**, y lo
> único que el Bloque C agregaría de verdad es el **offline parcial**.

## Tablero de avance (`dev/tablero.html`)

Pantalla para el desarrollador (no para estudiantes) que muestra, por asignatura,
qué OA se están trabajando y el **% de avance por cobertura de preguntas**:

    avance_OA = min(100, preguntas_del_OA / meta_por_OA) · meta por defecto: 8

Se genera a partir de los datos con:

    python scripts/generar-tablero.py

Lee `contenido/<asignatura>/oa.json` y `preguntas.json`, y escribe
`dev/tablero.html` (estático y autocontenido, se abre con doble clic). Regenerar
cada vez que se agreguen o etiqueten preguntas. Está preparado para varias
asignaturas: basta con crear otra carpeta en `contenido/` con esos dos archivos.

> **⚠️ Un `oa.json` con otro dialecto deja sin tablero a TODOS los bancos, no solo al suyo,
> y con eso bloquea la aprobación pedagógica entera.** El script recorre todas las carpetas
> en una sola pasada, así que un `KeyError` en la última mata la generación completa. **Ya
> pasó dos veces:** en la Sesión 55 por `unidades` ausente, y en la 62 por las unidades de 7°,
> que usan `{n, nombre}` donde las demás usan `{id, titulo}` (`lenguaje-7basico` ni siquiera
> tiene `unidades`: usa `capitulos_del_juego`). Desde la Sesión 63 los grupos se leen con los
> helpers tolerantes `grupos_de` / `u_id` / `u_titulo`, pero la lección de fondo es otra: **el
> tablero es la única puerta de aprobación, así que cualquier cosa que lo rompa detiene el
> proyecto.** Después de agregar un banco, correr el script y confirmar que sale.

**Cómo se llega al tablero (Sesión 22):** ya **no** se entra desde el juego. El
tablero se abre desde el panel del administrador en `profesor.html` (botón
"📊 Tablero de avance"), o escribiendo la dirección directamente. Sigue pidiendo su
propia contraseña, definida en la constante `CLAVE_ADMIN` de
`scripts/generar-tablero.py`; al cambiarla hay que volver a generar el tablero.

> Nota: esa contraseña es un **bloqueo suave** para que los niños no entren al
> tablero, NO seguridad real (es un sitio estático; quien sepa mirar el código
> puede saltársela). El acceso a los datos de cursos y alumnos, en cambio, sí es
> seguridad real: lo protege Supabase Auth desde `profesor.html`.

**Aprobar por muestreo (Sesión 70).** El botón **"⚡ Aprobar por muestreo"** abre un modo de
una pantalla por objetivo con **sus 8 preguntas ya elegidas** (sorteo estable, sembrado con el
código del OA), teclado —**espacio** aprueba y avanza, **V** manda a ver las 30, **S** salta—,
contador "vas en el N de 170" y **reanudar donde se quedó**. La cola son solo los OA con
preguntas pendientes, así que 8° no aparece. Aprobar marca **las 30**, que es el criterio.
Detalle en `docs/aprobacion-pedagogica.md`.

**Las mini-clases y las introducciones se aprueban ahí también (Sesión 85).** Hasta el 02/09 el
tablero solo las **contaba** con un chip, y el informe traía su casilla impresa pero esa marca **no
llegaba a ninguna parte**: las 75 lecciones del proyecto —lo único que **enseña**— no tenían
trámite de aprobación. Ahora cada asignatura trae su sección 📘 con las lecciones **enteras** —su
texto, su ejemplo y **el diagrama dibujado de verdad**, porque el generador incrusta
`assets/js/lecciones.js`—, su casilla y un "✓ Aprobar todas". Reusan el mismo almacén, así que
"Exportar revisadas" las incluye y `aplicar-revisadas.py` escribe en su `lecciones.json`.

> ⚠️ **El tablero abre en "👁 Solo lo pendiente"** y manda las asignaturas sin pendientes **al
> final**, no solo las pliega: con 7.805/7.805 preguntas firmadas, 23 de 29 secciones están
> aprobadas y dejarlas arriba son ~2.700 px de scroll antes de llegar a lo que hay que revisar.
> Y decide qué está pendiente con el dato que declara el generador (`data-pend-preg`), **no
> contando casillas del DOM**: las preguntas solo se pintan al desplegar su OA, así que 12 de las
> 29 secciones tienen cero casillas y contarlas las daba por no aprobadas.

**En el tablero:** al pinchar un OA se despliegan sus preguntas (solo el
enunciado y la respuesta correcta). Los controles **"Expandir todo / Contraer
todo"** (arriba) abren o cierran todas las preguntas de una vez, y cada
**unidad se pliega** al pinchar su encabezado.

**Para probar en local** (el navegador necesita servidor, no `file://` para el
JavaScript): `python -m http.server 8765` y abrir `http://localhost:8765/`.

### Cursos, profesores y ranking real (Sesiones 19 y 22)

El ranking del curso **ya no es simulado**: muestra a los alumnos reales del curso
del jugador, ordenados por XP, con datos de Supabase.

**Los cursos se administran en `profesor.html`**, una página aparte del juego. Se
entra con **correo y contraseña** (cuentas reales de Supabase Auth). Desde el panel
se crea un curso (genera un código `CUR-XXXX`), se inscriben alumnos por nombre
(cada uno recibe un código `ALU-XXXXXXXX`), se ve el XP de cada uno, se corrige y se
eliminan. No hace falta entrar a Supabase para nada de esto.

**Quién ve qué:**
- Un **profesor** ve y administra **solo sus cursos**. Los ajenos no le aparecen y
  las funciones del servidor rechazan cualquier intento de tocarlos.
- Un **administrador** ve **todos** los cursos (incluidos los que quedaron sin
  dueño) y además **autoriza los correos** de los profesores nuevos.

**Una cuenta no basta: hace falta estar autorizado.** Crear un usuario en Supabase
Auth no otorga ningún permiso. Los permisos viven en la tabla `profesores`: **sin
fila ahí, una cuenta no puede hacer nada**. Y solo se consigue esa fila si el
administrador autorizó antes ese correo (tabla `profesores_autorizados`). Por eso el
primer administrador se crea a mano, una sola vez, con el procedimiento comentado en
`supabase/schema.sql`; la lista blanca **no** se siembra en el repositorio, que es
público.

**El juego ya no tiene Modo Admin (Sesión 22).** La pantalla de inicio de
`index.html` ofrece solo **Jugador** y **Duelo 1v1**, más "🎟️ Tengo un código" y
Créditos. El tablero de avance se abre desde el panel del administrador.

> **La clave global de administración desapareció: que nadie la busque.** Antes el
> Modo Admin se abría con una sola contraseña compartida (guardada con hash en la
> tabla `config`, pero replicada en el repositorio a través del tablero) que daba
> acceso total a todos los cursos y alumnos. Ya no existe: ni la fila `admin_clave`,
> ni las funciones `kimun_admin_*`, ni el panel dentro del juego. El único camino es
> una cuenta de profesor autorizada.

**Mantenimiento (en el panel del profesor):**
- **`✎` en cada alumno:** fija su XP. Es la única forma de **bajar** un XP inflado,
  porque la sincronización normal (`kimun_xp`) solo sube.
- **🧹 Limpiar perfiles de prueba** (solo administrador): borra los perfiles que se
  crean solos al abrir el juego y que nunca canjearon un código de alumno. Cuenta
  primero y pide confirmación. **No borra** bots ni alumnos inscritos, pero sí
  arrastra los duelos de esos perfiles y **no tiene deshacer**. Conviene usarlo
  *después* de que los niños canjeen sus códigos: si se usa antes, un teléfono que
  ya venía jugando pierde su perfil en línea y sus duelos.

**Cómo entra un alumno:** Inicio → **"🎟️ Tengo un código"** → escribe su `ALU-`.
Queda vinculado a ese perfil en ese aparato, y puede repetirlo en otro para jugar
desde varios equipos. Si borra los datos del navegador, vuelve a canjear el mismo
código y recupera su lugar.

**Contraseñas de profesor:** las gestiona Supabase Auth. La **recuperación por
correo necesita SMTP configurado** en el proyecto de Supabase; sin eso, Roberto
restablece la contraseña a mano desde el panel de Supabase. Ojo también con el
servicio de correo integrado: permite **solo 2 correos por hora**, así que las altas
y confirmaciones seguidas se topan con `over_email_send_rate_limit` y hay que
esperar.

**Sesiones separadas:** `profesor.html` usa un cliente de Supabase con su propio
`storageKey` (`kimun-profesor`). Sin eso, que un adulto inicie sesión como profesor
en el teléfono de un niño le borraría al niño su identidad anónima del juego.

**Identidad del alumno:** la tabla `vinculos` separa la sesión anónima del
dispositivo del perfil del alumno. Por eso un mismo alumno puede jugar en el celular
y en el tablet sin duplicarse. Todas las funciones que antes asumían `auth.uid()`
como identidad del jugador resuelven el perfil con `kimun_yo()`.

**Límites conocidos:** el XP lo reporta el teléfono, así que puede falsearse; para
eso existe `kimun_prof_xp_fijar`, que permite al profesor corregirlo (el teléfono
adopta el valor del servidor cuando es menor). **El progreso de campañas, las
monedas y las skins ya NO son del aparato** (Bloque D, 01/09/2026): viajan al
servidor como una foto y vuelven al canjear el `ALU-` en otro teléfono. Lo que
sigue siendo por aparato es el **vínculo**: en un tablet compartido, dos hermanos
que canjean uno tras otro se van pisando el vínculo, aunque cada uno recupere lo
suyo al volver a canjear.

Diseño y plan de los cursos y el ranking:
`docs/superpowers/specs/2026-08-17-cursos-ranking-real-design.md` y
`docs/superpowers/plans/2026-08-17-cursos-ranking-real.md`.
Diseño y plan del rol de profesor:
`docs/superpowers/specs/2026-08-18-rol-profesor-design.md` y
`docs/superpowers/plans/2026-08-18-rol-profesor.md`.

### Mapa de dominio por OA (avance del curso y del alumno)

Responde la pregunta que el XP no contesta: **qué entienden los alumnos**, objetivo
por objetivo, para decidir qué reforzar en clase. Vive en `profesor.html`.

**Cómo se usa:** en el panel, **"📊 Ver avance"** junto al nombre de cada curso abre
la tabla del curso completo, y el botón **📊** de cada alumno abre la suya. La tabla
va **de peor a mejor porcentaje**, así que lo que hay que reforzar queda arriba,
muestra el **texto del objetivo** (no su código: `HI08 OA 04` no le dice nada a
nadie; el panel lo carga desde `contenido/<asignatura>/oa.json`) y **cuántos alumnos
respaldan cada porcentaje**. Un objetivo que nadie jugó **no aparece**: mostrarlo como
0% se leería como "no lo entienden" cuando en realidad es "todavía no lo ven".
Matemáticas **ya aparece** desde la Sesión 29: su **camino de aprendizaje** registra
dominio por OA como cualquier campaña. Lo que **no** se mide es el **Reto de Cálculo**,
que genera sus operaciones al vuelo sin objetivo asociado, y el panel lo dice.

**Qué significa el porcentaje: el PRIMER intento** (Sesión 24), no el acumulado del
año. Es decir, cuántos acertaron **la primera vez que vieron ese contenido**. El
acumulado estaba sesgado porque su denominador dependía justo de lo que se quería
medir: `respondidas` crece con los reintentos, y se reintenta porque no se entendió,
así que **el alumno que menos sabe pesaba más en el promedio del curso**. Con el primer
intento la base es pareja (a lo más 6 respuestas por alumno y objetivo), que es lo que
vuelve legítimo ordenar de peor a mejor. Los **reintentos** (`respondidas - resp_1`)
se muestran aparte, como señal de cuánto costó: 62% con pocos reintentos ("les costó
pero lo sacaron") pide algo muy distinto que 62% con cuarenta ("se están estrellando").

**Los colores están calibrados al piso del azar:** con cuatro opciones por pregunta,
responder sin saber ya da 25%, así que un 50% no es "la mitad" sino un tercio de
dominio real. Cortan en **45%** (rojo/ámbar) y **70%** (ámbar/verde), y una nota en
pantalla explica el 25%.

**Cómo se recorre (Sesión 26):** un **encabezado pegado arriba** dice de qué curso o
alumno es la tabla y deja el botón de volver siempre a mano; el texto de cada objetivo se
**recorta a dos líneas** y se abre entero al desplegar la fila; hay **filtro por
asignatura** y un botón flotante para **volver arriba**. Antes cabían tres objetivos por
pantalla y las 60 filas sumaban 8.228 px de desplazamiento.

**Tres bloques en vez de atenuar:** "Para reforzar" (10 alumnos o más, bajo 70%), "Van
bien" (10 o más, 70% o más) y **"Todavía con pocos datos"** (menos de 10 alumnos,
plegado). Menos de diez alumnos son unas 60 respuestas: ±12 puntos de margen, el borde
de lo interpretable. Antes se atenuaban esas filas, pero atenuar y ordenar de peor a
mejor se peleaban entre sí —la posición decía "mira esto primero" y la opacidad "ignora
esto"—, de modo que la primera fila podía ser justo la menos confiable.

> **Comparar objetivos entre sí es el uso menos defendible** de esta tabla: los bancos
> de preguntas no están calibrados entre sí (los escribieron agentes distintos en tandas
> distintas), así que parte de la brecha entre un objetivo en 45% y otro en 87% es que
> un banco es más duro. Comparar un objetivo consigo mismo en el tiempo, o contra un
> umbral fijo, sí es defendible.

**Qué se mide:** las **campañas y los jefes finales**, incluidas las **lecciones del
camino de aprendizaje de Matemáticas** (su práctica registra dominio por OA, Sesión 29).
El duelo queda fuera porque es contra el reloj y se falla por apuro, y el Reto de Cálculo
genera sus operaciones al vuelo, sin objetivo asociado. El **Modo Difícil sí cuenta** (usa las
mismas preguntas del banco) y el **modo QA (`?qa=1`) no registra nada**, para que las
pruebas del desarrollador no ensucien el mapa.

**Qué se guarda:** contadores por alumno y objetivo en la tabla `dominio`, **no las
respuestas**: el acumulado (`respondidas`, `correctas`) y el primer contacto (`resp_1`,
`ok_1`), que se escriben solo al insertar la fila y **nunca se vuelven a tocar** — por
eso quedan congeladas en el primer intento. No queda registro de qué pregunta falló ni de
cuándo, así que no se puede reconstruir la sesión de un niño. El juego acumula en
memoria durante la etapa y envía un resumen al terminarla; si no hay señal, queda
pendiente en el teléfono y se reintenta después, sin interrumpir la partida.

**🔄 Reiniciar mediciones** (por curso, con confirmación) pone los contadores en
cero. Existe porque **acumulan todo el año**: un alumno que falló mucho en marzo y
hoy domina el tema arrastraría un porcentaje bajo. Sirve al empezar una unidad o un
semestre. No borra alumnos ni XP, y no toca los otros cursos. Con el porcentaje de
primer intento es, además, **la única forma de volver a medir** un objetivo: `resp_1`
queda congelada para siempre, así que sin reiniciar el número no se mueve aunque el
curso repase el tema.

> **No sirve para calificar**, y la pantalla lo dice con todas sus letras: el dato lo
> reporta el teléfono del alumno, igual que el XP, así que es falsificable por alguien
> que sepa. Es una brújula para decidir qué repasar, no una nota.

**Participación y fecha (Sesión 26):** arriba del mapa, un bloque plegado responde la otra
pregunta del profesor —quién está jugando— que el porcentaje por objetivo no contesta. El
titular se ve sin abrir nada (*"Participación · 24 de 35 jugaron esta semana"*) y al
desplegar reparte a los alumnos en **cuatro grupos**: jugaron esta semana, hace más de una
semana, **canjearon su código pero no han jugado**, y **nunca canjearon su código**. Esos
dos últimos se separan a propósito: no canjear casi nunca es desinterés (es un papel
perdido, un código mal escrito o un teléfono que no tienen), y la acción es volver a
entregar el código, no insistirle al niño. Nombres como fichas en orden alfabético, **sin
fecha individual ni orden por inactividad**: una lista de menores ordenada por días sin
entrar se leería como lista de asistencia, y quien no tiene teléfono ni internet en casa
quedaría arriba.

Lo que mide es **la última vez que el niño abrió el juego** (columna `visto` en `perfiles`,
sellada dentro de `kimun_xp`), así que cuenta **todos los modos** —campaña, Reto de Cálculo,
duelo, tienda—, no solo las campañas como el mapa. La ventana de "esta semana" son 7 días
móviles. La participación se pide en paralelo con el mapa y **su fallo no impide ver el
avance**; aparece también cuando el curso todavía no tiene datos de dominio, que es justo
cuando más interesa saber quién no entró. **Límite del arranque:** al aplicar el esquema,
`visto` se rellena desde `dominio.actualizado`, así que quien solo jugó Reto de Cálculo
parte sin fecha hasta su próxima entrada. **Caso de borde:** un hermano que canjea otro
código en el mismo teléfono deja al primero como "nunca canjeó" en la siguiente consulta,
por el modelo un-dispositivo-un-vínculo. Y el mismo límite del mapa: **no es asistencia**,
el dato lo reporta el teléfono.

Diseño y plan: `docs/superpowers/specs/2026-08-18-mapa-dominio-oa-design.md` y
`docs/superpowers/plans/2026-08-18-mapa-dominio-oa.md`. El cambio al primer intento:
`docs/superpowers/specs/2026-08-18-primer-intento-design.md` y
`docs/superpowers/plans/2026-08-18-primer-intento.md`.

### Consolidar el pool de preguntas (`scripts/consolidar-pool-nivel.py <carpeta>`)

Une los archivos verificados, elimina duplicados, **baraja las opciones** (evita
el sesgo de posición), asigna IDs por OA y escribe `preguntas.json`. Sirve para
cualquier banco de cualquier nivel; la carpeta va como argumento.

> El viejo `consolidar-pool.py` **se retiró en la Sesión 65**: estaba cableado a
> `historia-8basico` y correrlo sobre otro banco no hacía nada visible. El genérico
> se validó reproduciendo el banco de Historia **byte a byte** (Sesión 61).

### Flujo de revisión pedagógica (marcar preguntas como "revisadas")

1. En el tablero (Admin), pincha un OA y marca la casilla de las preguntas que
   apruebes. Las marcas se guardan en el navegador.
2. Pulsa **"Exportar revisadas"** → descarga `revisadas.json`.
3. Aplica las marcas al banco: `python scripts/aplicar-revisadas.py` (busca el
   archivo en la raíz o en Descargas; también acepta la ruta como argumento).
4. Regenera el tablero: `python scripts/generar-tablero.py`. La barra rosada
   "Revisadas por ti" reflejará el avance real de revisión.

## Reglas de avance (acordadas)

### Del jugador (juego)
- **Estructura estándar de una expedición: 4 etapas + 1 jefe final (5 nodos).**
  Cada etapa mapea un OA; el jefe mezcla los 4 OA de la ruta. Regla para todas
  las asignaturas (Historia, Ciencias, y las próximas Matemáticas y Lenguaje).
- Cada etapa saca **10 preguntas al azar** del pool (jefe final: 15, mezcla de OA).
- **Pasa con ≥66%** de aciertos (4 de 6). Si no, repite la etapa con preguntas
  nuevas. Estrellas: 3★ = 100%, 2★ ≥ 80%, 1★ ≥ 66%.
- XP, monedas, combos y timer (20 s; 15 s en Difícil) se mantienen.
- Expedición piloto "Los europeos llegan a América": etapas OA04, OA05, OA06,
  OA07 + jefe final. El juego lee las preguntas de `preguntas.json` (fetch).

### Modo Difícil (desbloqueable)
- Se **desbloquea** al vencer al Jefe Final en Normal.
- Mismo mapa, pero: **10 preguntas** por etapa (jefe **15**), **15 s** por pregunta,
  se pasa con **≥80%**. Estrellas: 3★ = 100%, 2★ ≥ 90%, 1★ ≥ 80%.
- Progreso y estrellas **separados** del Normal (`S.progresoDificil`); se elige con
  el selector Normal/Difícil del mapa (variable global `MODO`).

### Del tablero (producción)
- Cobertura: `preguntas / meta` por OA, **meta 8**, que vive en `scripts/generar-tablero.py`
  y **ya no se declara en ningún banco** (31/08). Cinco bancos de 8° traían
  `meta_preguntas_por_oa: 25`, o sea que el tablero medía 8° contra una vara **tres veces
  más alta** que 3° y 7°. Hoy no cambiaba ningún número —ningún OA de 8° baja de 25
  preguntas, medido— pero era una trampa puesta para el primer banco de 4°, 5° o 6° con un
  OA corto: habría marcado 80% donde corresponde 100%. Al sacarlo, las **562 barras de
  cobertura quedaron idénticas** y las cuatro secciones de 8° pasaron a decir "meta 8".
- Revisión: `revisadas / total` (aprobadas por un humano).

## Backend (Supabase)

El **duelo 1v1 en línea**, el **ranking por curso** y las **cuentas de profesor** usan
Supabase (proyecto en São Paulo). Esquema y funciones en `supabase/schema.sql` (pegar
el archivo **completo** en el SQL Editor; es idempotente y se puede re-ejecutar sin
dañar los datos). Requiere activar el **login anónimo** en Authentication → Sign In /
Providers, y dejar activada la **confirmación de correo** para las cuentas de profesor.

- **Identidad sin contraseñas:** login anónimo → cada dispositivo es un usuario;
  perfil con `nombre`, `avatar` y **código de amigo** (`KIM-XXXX`).
- **Duelos:** se desafía desde una **lista de jugadores** (o por código). Contra
  **bots** (Vale/Nico/Fran/Diego) el resultado es **instantáneo**; contra
  **jugadores reales** es **asíncrono (24h)** y el puntaje del retador queda
  **oculto** hasta que el rival juega (funciones `SECURITY DEFINER`).
- **Seguridad:** RLS activo y **sin políticas de lectura**: ninguna tabla se consulta
  directo, todo pasa por funciones `SECURITY DEFINER`. Esto es importante desde la
  Sesión 19: `perfiles` guarda el `codigo_acceso` de cada alumno, que es su credencial,
  así que dejarla legible expondría los códigos de todos. La publishable key va en
  `index.html` (es pública por diseño; no es secreta).
- **Cursos y ranking (Sesión 19):** tablas `cursos` y `vinculos`; funciones
  `kimun_yo`, `kimun_xp`, `kimun_dificil`, `kimun_ranking` y `kimun_canjear`.
- **Profesores (Sesión 22):** tablas `profesores` (los permisos viven aquí: sin fila,
  una cuenta no puede nada), `profesores_autorizados` (lista blanca de correos) y la
  columna `cursos.profesor_id` (dueño del curso). La familia de funciones
  **`kimun_prof_*`** identifica al profesor por su sesión (`auth.uid()`) y **no recibe
  ninguna clave**; `kimun_prof_es_mio` decide si un curso le pertenece y por eso no se
  otorga a nadie desde afuera. Reemplazaron por completo a las viejas `kimun_admin_*`,
  que fueron eliminadas junto con la clave global. Ver "Cursos, profesores y ranking
  real" en Herramientas de desarrollo.
- **Participación (Sesión 26):** columna `perfiles.visto timestamptz`, sellada dentro de
  `kimun_xp` (la sincronización que el juego ya hace en todos los modos, no solo campañas),
  y la función `kimun_prof_participacion(curso)` que devuelve a cada alumno inscrito con su
  `visto` y si tiene fila en `vinculos`. Una migración al final del esquema rellena `visto`
  desde `max(dominio.actualizado)` la primera vez (idempotente con `where visto is null`).
- **Dominio por OA (Sesión 22):** tabla `dominio` (una fila por alumno y objetivo, con
  contadores; se borra en cascada junto con el alumno), `kimun_dominio` para registrar
  desde el juego y `kimun_prof_dominio`, `kimun_prof_dominio_alumno` y
  `kimun_prof_dominio_reiniciar` para el panel. Desde la Sesión 24 la tabla lleva además
  `resp_1` y `ok_1` (el primer contacto), que `kimun_dominio` escribe **solo en la rama
  `insert`**: el `on conflict do update` no las menciona a propósito, y ese detalle es
  toda la idea. Ver "Mapa de dominio por OA" en Herramientas de desarrollo.
- **Desafío de refuerzo (Sesión 28):** tablas `desafios` (con índice único parcial
  `where activo` → a lo más un desafío activo por curso) y `desafio_resultados`; funciones
  `kimun_prof_refuerzo_lanzar` / `_cerrar` / `_estado` (panel, aislamiento por
  `kimun_prof_es_mio`) y `kimun_refuerzo_activo` / `_completar` (juego, vía `kimun_yo`). Se
  mide **aparte** de `dominio`: el resultado del refuerzo va a `desafio_resultados` y **no**
  toca el primer intento del mapa. `_completar` usa `on conflict do nothing` (el primer intento
  manda). El profesor lanza desde el bloque "Refuerzo" de la vista de avance; el alumno lo ve
  como banner en el inicio y lo juega como una cadena de ~12 preguntas (el juego reusa el motor
  de quiz con el flag `Q.desafio`). Ver la Bitácora, Sesión 28.
- **Roles por asignatura (Sesión 37):** un curso pasa de tener un dueño único a un **equipo**.
  Tabla `curso_profesores(curso_id, profesor_id, rol, asignaturas[])` con índice único parcial
  `where rol='jefe'` (un solo Profesor Jefe por curso). `cursos.profesor_id` queda **deprecada**
  (no se lee ni se borra; sirvió de semilla en la migración). Función `kimun_oa_asignatura(oa)`:
  único lugar que traduce un OA a su asignatura (`HI08/CN08/MA08/LE08`), y de paso hace visibles
  Vocabulario y Lectura en el filtro del panel. Porteros: **`kimun_prof_es_mio` cambió de
  significado** —ahora es "admin o Jefe" (lo destructivo lo heredan sin tocar su cuerpo)—, más
  `kimun_prof_acceso` (¿puede entrar?) y `kimun_prof_asignaturas` (¿sobre qué actúa?). Las
  lecturas (`kimun_prof_dominio`, `_dominio_alumno`, `_dominio_oa`) filtran por asignatura; el
  refuerzo (`_lanzar`/`_cerrar`) valida la asignatura en el servidor; `kimun_prof_listar` informa
  rol y asignaturas por curso. Gestión de equipo: `kimun_prof_equipo` / `_equipo_asignar` (cambiar
  de Jefe respeta el índice único) / `_equipo_quitar` (no toca ningún dato de desempeño). Ranking
  por asignatura: `kimun_prof_ranking_asignatura` (acierto de primer intento, mínimo 20 respuestas,
  sin `codigo_acceso`). Migración: cada dueño actual → Jefe, y `desafios.asignatura` se normaliza
  de nombre visible a código. Ver la Bitácora, Sesión 37.
- **Jerarquía de roles (Sesión 38):** sobre lo anterior se agrega un cuarto rol. Jerarquía
  **Admin ▸ SuperUsuario ▸ Profe Jefe ▸ Profe Asignatura**. Los dos primeros son globales de la
  cuenta; los dos últimos, por curso (`curso_profesores.rol`). Modelo: columna nueva
  `profesores.es_super boolean` (se conserva `es_admin`; **Admin = Roberto/dueño de la
  plataforma**, **SuperUsuario = autoridad del colegio**, UTP/dirección). Portero nuevo
  `kimun_prof_admin_colegio()` = `es_admin OR es_super` → gobierna **crear/borrar curso, nombrar
  Jefe, autorizar y gestionar profesores**; `es_admin` a secas queda solo para **crear/quitar
  SuperUsuarios** (`kimun_prof_super_fijar`, función nueva) y revocar a un Admin/Super.
  `kimun_prof_es_mio` (destructivo dentro del curso: alumnos, XP, reiniciar, agregar profe de
  asignatura) suma `es_super`. Cambios: `kimun_prof_curso_crear` exige `admin_colegio` y **ya no
  auto-nombra Jefe al creador** (el curso nace sin Jefe); `_curso_quitar`, `_autorizar`,
  `_profesores`, `_quitar` suben a `admin_colegio`; `_equipo_asignar`/`_quitar` exigen
  `admin_colegio` para el rol Jefe y `es_mio` para asignatura; `kimun_prof_listar` agrega `mi_rol`
  y `kimun_prof_profesores` agrega `es_super` (para el encabezado y el panel). **Sin entidad
  "Colegio" todavía** (queda para cuando entre un segundo colegio): por ahora el SuperUsuario ve
  todos los cursos. En `profesor.html`, el encabezado muestra **usuario · rango · cursos**. Ver la
  Bitácora, Sesión 38.
- **Endurecimiento de seguridad (Sesión 39):** tras una auditoría, (1) `desafios` y
  `desafio_resultados` ahora tienen **RLS** (antes se leían/escribían directo con la clave
  pública); (2) el **`codigo_acceso`** (credencial del alumno) solo lo entrega `kimun_prof_listar`
  a Jefe/Super/Admin, y `kimun_prof_dominio_alumno` **recibe el id de perfil** (`pid`), no la
  credencial, para que el profe de asignatura abra la ficha sin verla; (3) **`kimun_jugadores`**
  (lista del duelo) quedó acotada al **mismo curso** + bots, para no exponer los nombres de todos
  los menores; (4) `kimun_prof_refuerzo_estado` filtra por asignatura; (5) `kimun_prof_curso_asignar`
  ahora crea la membresía de Jefe (reasignar de verdad otorga acceso) y `kimun_prof_profesores`
  cuenta cursos desde `curso_profesores`. Ver la Bitácora, Sesión 39.
- **Niveles (Sesión 58):** el nivel es parte del **código de asignatura** (`MA03` = Matemática de
  3°), no una columna nueva. `kimun_oa_asignatura` lo traduce y `kimun_prof_asignaturas` lo entrega
  a Admin/Super/Jefe. Un curso de 3° y uno de 8° conviven porque el aislamiento por asignatura ya
  los separa. ⚠️ **Requiere re-aplicar `supabase/schema.sql`** (ver `docs/aplicar-schema.md`);
  mientras no se haga, el dominio de 3° **no aparece** en el panel.
- **Cuidado al editar el esquema:** `gen_random_uuid()` es nativa de PostgreSQL y no
  necesita nada especial, pero si alguna función vuelve a usar pgcrypto (`crypt`,
  `gen_salt`) necesita `set search_path = public, extensions`, porque en Supabase esa
  extensión no vive en `public`.
- **Duelo: avisos y ranking (Sesión 76):** columna `duelos.visto_retador` (sembrada con un
  `if not exists` sobre la **columna**, que corre una sola vez: los duelos viejos nacen vistos
  y el default queda en `false`); `kimun_duelos_avisos()` y `kimun_duelo_visto(uuid)` para el
  banner del inicio; `kimun_ranking_duelos()` para el ranking del curso. Y
  **`kimun_duelo_ganador(int,int,int,int)`**: la regla de desempate del duelo —más aciertos;
  si empatan, menos tiempo— estaba **escrita a mano en tres lugares** y ahora vive una sola
  vez. ⚠️ Va declarada **antes** de sus usos: una función `language sql` se valida al crearse.
  ⚠️ El duelo contra **bot** nace con `visto_retador=true`, porque se resuelve al instante y el
  jugador ya vio su marcador en pantalla; sin eso el banner se lo repetía.
- **Progreso del alumno (Bloque D, 01/09/2026):** tabla `progreso` (una fila por alumno:
  `perfil_id` como clave, `datos jsonb`, `actualizado`; RLS sin políticas y `on delete cascade`)
  más `kimun_progreso_subir(jsonb)` y `kimun_progreso_bajar()`. Guarda **una foto completa del
  save**, no columnas normalizadas: el save gana campos seguido y así un campo nuevo viaja sin
  migrar el esquema. Medido, la foto más grande posible son **9,4 KB** (3°, 27 rutas), y el
  servidor **rechaza sobre 64 KB**.
  - **Sube** enganchada a `guardar()` con rebote de 15 s, y **no sube si el JSON es idéntico al
    último enviado** — `guardar()` corre en cada respuesta.
  - ⚠️ **NO sube en `EFIMERO`**, y es una diferencia deliberada con el XP: el XP es un número que
    solo sube, pero **la foto es un reemplazo completo**. Abrir `?qa=1` en un teléfono vinculado a
    un alumno real y completar una etapa le **pisaría la partida del año**.
  - **Baja en un solo momento: al canjear el `ALU-`.** No hace falta otro, porque borrar los datos
    del navegador se lleva también la sesión de Supabase. Si falla, **no** se marca como bajada y
    se reintenta al abrir el juego.
  - ⚠️ **Al bajar, el XP lo manda el SERVIDOR, no la foto.** Si no, una foto vieja con 900 XP
    deshace sola la corrección que el profesor hizo con `kimun_prof_xp_fijar`, que es la única
    forma de **bajar** un XP inflado. Por lo mismo la foto **no sobrescribe `alumno` ni `curso`**:
    esos vienen del canje recién hecho.
  - Si los dos lados tienen avance, la pantalla **`scr-progreso`** pregunta una vez, y **el lado
    que pierde se guarda** en `localStorage` bajo `<SAVE_KEY>_previo`.
  - **No necesita cola de reintentos** como `dominio`: una foto es completa e idempotente, así que
    el próximo envío que llegue lleva todo. `dominio` la necesita porque manda **eventos**.
- **Pendiente:** notificaciones push.

## Trámites pendientes (fuera del código)

> **Recordar estos dos puntos CADA VEZ que se revisen los pendientes del proyecto.**
> No son tareas de programación, pero bloquean el lanzamiento a producción.

1. **Registrar la marca VULPO en INAPI.** El 2026-08-18 se verificó que estaba
   *disponible*, pero **no está registrada**. Mientras no se inscriba, cualquiera puede
   registrarla primero y el proyecto quedaría en el mismo problema que con KIMÜN. Clases
   relevantes: software y educación. Conviene hacerlo con un abogado de marcas.
   Trámite: https://www.inapi.cl/marcas

2. ✅ **Dominio propio `vulpo.cl` — CONTRATADO Y CONECTADO (Sesión 40).** El juego se sirve
   ahora en **`https://vulpo.cl`** (panel del profesor en `https://vulpo.cl/profesor.html`). DNS
   en **Cloudflare** (2 nameservers en NIC → 4 registros A a las IP de GitHub Pages
   `185.199.108–111.153` + CNAME `www` → `robertoldman1978.github.io`, todos "Solo DNS"). El
   dominio en GitHub Pages se fija con el archivo **`CNAME`** (contenido `vulpo.cl`) en la raíz
   del repo. La URL vieja `robertoldman1978.github.io/vulpo/` **redirige** a `vulpo.cl`, así que
   los enlaces ya repartidos siguen sirviendo. **Cuidado documentado:** el progreso *local* del
   juego (skins, campañas, monedas, "intro vista") vive en `localStorage`, que es **por origen**,
   así que NO se traspasa de `github.io` a `vulpo.cl` (no se borra, solo no se ve desde el nuevo
   dominio); el XP/identidad del alumno se recupera re-canjeando el código `ALU-`. Los profesores
   solo re-inician sesión (sus datos están en Supabase). Pendiente menor: activar **"Enforce
   HTTPS"** en GitHub → Settings → Pages cuando el certificado quede emitido; opcional, activar el
   proxy naranja de Cloudflare (CDN) más adelante.

## Bitácora de sesiones

### Sesión 1 (2026-08-12)
- Renombrado `aventura-historia.html` → `index.html`.
- Creados `CLAUDE.md` y `README.md`.
- Inicializado git y primer commit; conexión con repositorio GitHub y push a `main`.
- Configuración de GitHub Pages para obtener la URL pública.
- **Pendiente:** avanzar el roadmap desde el punto 1 (duelo 1v1).

### Sesión 2 (2026-08-12)
- **Recuperación:** el repo local `C:\Proyectos\kimun` estaba vacío; se reclonó
  desde GitHub (nada se había perdido en el remoto).
- **Compañero Kimün (nuevo):** acompañante animado que reacciona en el quiz
  (neutral / feliz / sorprendido en combo / triste al fallar) y en la pantalla de
  resultado (oro / plata / bronce según estrellas, fiesta al vencer al jefe,
  desanimado si no pasa). Animación CSS sobre el sprite real → resuelve el pendiente
  de "animación de Kimün fiel a la marca".
- **Medallón dorado:** todos los sprites de Kimün se muestran dentro de un círculo
  con borde dorado (mismo sello de marca del inicio y la subida de nivel). El marco
  unifica el estilo mixto de las ilustraciones.
- **Estrella fugaz** ocasional cruzando el fondo del juego (cada 8–22 s).
- **Assets:** 18 sprites procesados (expresiones, vestuario de época, podio) + 4
  portadas de asignatura (Historia / Matemáticas / Ciencias / Lenguaje, con fondo).
  Originales crudos de respaldo en `assets/originales/`. Scripts nuevos:
  `scripts/procesar-expresiones.py` y `scripts/procesar-nuevas.py`.
  Nota: `demo-companero.html` es un banco de pruebas local, ignorado por git.
- **Pendientes acordados para próximas sesiones:**
  1. Vestir a Kimün según la época/unidad (piloto = traje de explorador; ya existe
     `assets/kimun-conquistador.png`).
  2. Modo Difícil desbloqueable (mismo mapa, menos tiempo, 8 preguntas/etapa,
     pasar con 80%).
  3. Aprovechar las portadas de asignatura como expediciones futuras.
- **Nota técnica:** el remoto cambió de mayúsculas; URL actualizada a
  `https://github.com/RobertOldMan1978/kimun.git`.

### Sesión 3 (2026-08-12)
Se completaron los tres pendientes que quedaron de la Sesión 2:
- **Vestuario de época:** Kimün conquistador (casco con pluma, capa, armadura) como
  ambientación de la Expedición Historia — en la pantalla de inicio de la expedición
  y en la cabecera del mapa. Usa `assets/kimun-conquistador.png`.
- **Modo Difícil desbloqueable:** se habilita al vencer al Jefe Final en Normal.
  Selector Normal/Difícil en el mapa; etapas de 8 preguntas (jefe 10), 10 s por
  pregunta, se pasa con **80%**. Progreso y estrellas propios del modo (3★=100%,
  2★≥90%, 1★≥80%), separados del Normal. Indicador 🔥 y logro de desbloqueo.
  Estado nuevo: `S.progresoDificil`, `S.dificilDesbloqueado`, variable global `MODO`.
- **Selección de expediciones (multi-asignatura):** nueva pantalla "Elige tu
  expedición" tras pulsar JUGADOR. Historia jugable; Matemáticas, Ciencias y
  Lenguaje con sello "🔒 Pronto" (usan `assets/portada-*.png`). Preparada para
  escalar con `const ASIGNATURAS`.

**Ideas para enriquecer gráficamente la asignatura (próxima sesión):**
- **Mapas:** rediseñar la ruta del mapa con estética de pergamino antiguo (papel
  envejecido, brújula, "X" del tesoro; ruta que se dibuja al avanzar); mapa del
  cruce del Atlántico con carabela.
- **Imágenes de época:** una ilustración de ambientación por etapa/OA (viajes,
  encuentro de dos mundos, conquista, mundo nuevo) como banner/portada del quiz;
  refuerzo visual en la retroalimentación al fallar.
- **Vestuarios/personajes:** más trajes de Kimün por etapa/rol; personajes
  históricos ilustrados como guías; avatares temáticos para la tienda.
- **Íconos y objetos:** reemplazar los emoji de etapa por íconos ilustrados;
  objetos coleccionables (brújula, astrolabio, carabela, cofre) como insignias.
- **A cuidar:** peso en móvil (optimizar cada imagen ~200 KB como los sprites);
  las imágenes las genera Roberto (IA) y Claude las procesa; sensibilidad del tema
  (pueblos originarios) y alineación al currículum chileno.
- Recomendación de partida: ilustración de ambientación por etapa, o el mapa
  tipo pergamino.

### Sesión 4 (2026-08-13)
- **Modo Difícil con look propio (oscuro/intenso):** clase `en-dificil` en el
  `<body>` (se sincroniza en `go()` y en el selector). CSS nuevo: fondo casi negro
  con tinte carmesí, viñeta, orbes color brasa con pulso rojo, estrellas rojizas,
  quiz/HUD/barra inferior tintados en rojo-fuego. En Normal no cambia nada.
- **Motor data-driven — PLANTILLA BASE (importante):** se sacó la ruta y el
  contenido a datos. Antes `const EXPEDICION` + `const ASIGNATURAS` estaban fijos
  en el código; ahora hay un solo arreglo **`EXPEDICIONES`** donde cada expedición
  trae sus `etapas` (OA→etapa), su `contenido` (ruta al `preguntas.json`), portada
  y `activa`. El motor lee la ruta activa desde datos (`activarExpedicion`,
  `cargarPool`). **Progreso independiente por ruta**: se guarda en `S.rutas[<id>]`
  (con migración automática de las partidas antiguas de Historia). Historia juega
  igual que antes, pero clonar la siguiente ruta/asignatura es solo cambiar datos.
- **Plantilla lista:** `contenido/_plantilla/` con `README.md` (receta de 3 pasos),
  `oa.json` y `preguntas.json` de ejemplo con el formato correcto.
- **Aprendizaje al fallar (nuevo):** al equivocarse ya no se avanza solo; se
  **revela la respuesta correcta** (opción en verde), se muestra un panel con
  "Respuesta correcta + 💡 explicación" (usa el campo `tip`) y un botón
  **"Continuar"** para leer sin apuro. Al acertar sigue rápido (1.1 s). Mejora a
  futuro: campo `explicacion` (2-3 frases) por pregunta para un texto más amplio.
- **Comentario de Kimün al iniciar la ruta (nuevo):** burbuja "🦊 Kimün te
  cuenta…" con una pregunta y su respuesta al azar del pool; se cierra con ✕ o
  sola a los ~10 s. Función `datoKimun()` disparada al entrar al mapa.
- **Pendientes:** generar el contenido (OA + pool) de la primera expedición nueva
  y activarla; ideas gráficas de la Sesión 3 (mapa pergamino, ambientación por etapa).

### Sesión 5 (2026-08-13)
- **Regla de estructura fijada:** toda expedición = **4 etapas (1 OA c/u) + 1 jefe
  final (5 nodos)**. Historia y Ciencias la cumplen; Matemáticas y Lenguaje seguirán.
- **Segunda expedición (Ciencias) — estrena la plantilla:** unidad "La célula"
  (`contenido/ciencias-8basico/`), con `oa.json` (los 15 OA de Ciencias 8°) y
  `preguntas.json` con **144 preguntas** de CN08 OA 01–04, generadas y verificadas
  por agentes (opciones barajadas, `revisada:false`). Expedición activa y jugable.
  **Confirmado:** agregarla fue solo datos + contenido, sin tocar el motor.
- **Encabezado del mapa data-driven:** antes el título/imagen del mapa estaban
  fijos en Historia; ahora reflejan la expedición activa (`mapaSub`, `mapaImg` en
  `renderMapa`). Campo opcional `mapaImg` por expedición (Historia mantiene su
  Kimün conquistador; el resto usa su portada).
- **Exportar preguntas a PDF:** `scripts/generar-pdf-preguntas.py` (usa fpdf2)
  genera un PDF por asignatura, agrupado por OA, con la respuesta correcta y la
  explicación, y casilla "Revisada" para revisión pedagógica en papel.
- **Pendientes:** revisión pedagógica de los bancos (Historia y Ciencias); un
  Kimün "científico" para el header de Ciencias; contenido de Matemáticas y Lenguaje.

### Sesión 6 (2026-08-13)
- **Duelo 1v1 EN LÍNEA (backend Supabase) — primer backend del proyecto:** se
  montó Supabase (proyecto en São Paulo) con login anónimo, perfiles con código
  de amigo y duelos asíncronos de 24h. Ver `supabase/schema.sql`.
  - **Asíncrono real:** A desafía, B tiene 24h; el puntaje de A queda **oculto**
    hasta que B juega (funciones `SECURITY DEFINER`, verificado). 8 preguntas, 15 s.
  - **Sin fricción de WhatsApp:** se desafía desde una **lista de jugadores**
    (o por código), no compartiendo enlaces.
  - **Bots de práctica:** rivales dummy (Vale/Nico/Fran/Diego) que **responden al
    instante** según su nivel, para poder jugar sin esperar a nadie.
  - El duelo "en este mismo teléfono" (pásame el celular) sigue disponible.
  - `index.html` carga `@supabase/supabase-js` (CDN) e incluye la publishable key
    (pública). Esto deja puesto el cimiento de **login/multiusuario** del roadmap.
- **Pendientes:** notificaciones push, ranking real (datos ya disponibles);
  revisión pedagógica de las preguntas; Matemáticas y Lenguaje.

### Sesión 7 (2026-08-13)
- **Revisión pedagógica de Historia aplicada:** a partir de un documento de
  revisión (9 observaciones AMARILLAS, 0 ROJAS — solo precisión/redacción, ninguna
  clave errónea) se corrigieron 9 preguntas del banco de Historia (indulgencias,
  absolutismo, cosmovisión, factores de la conquista, epidemias/inmunidad, 1492 y
  encomienda). Todo el banco de **Historia quedó marcado como revisado** (663/663);
  Ciencias sigue sin revisar.
- **Tablero:** ahora ignora las carpetas que empiezan con `_` (la `_plantilla`
  ya no aparece como asignatura).
- **Pendientes:** revisión pedagógica de Ciencias; Matemáticas y Lenguaje;
  notificaciones push y ranking real del duelo.

### Sesión 8 (2026-08-13)
- **Dos expediciones nuevas (clonando la plantilla, solo datos):**
  - **Matemáticas · "Álgebra y ecuaciones"** (`contenido/matematicas-8basico/`):
    OA MA08 06-09 (lenguaje algebraico, expresiones, ecuaciones, inecuaciones).
  - **Lenguaje · "Tipos de texto y medios"** (`contenido/lenguaje-8basico/`):
    OA LE08 01-04 (texto narrativo, textos informativos, medios/publicidad,
    argumentación).
  - Generadas por agentes en paralelo (120 preguntas c/u), activadas en
    `EXPEDICIONES` (`index.html`). El motor NO se tocó. Ya hay **4 expediciones
    jugables** (20 nodos). Probadas en el navegador (pool + mapa OK).
- **Revisión pedagógica externa aplicada a los 3 bancos sin revisar** (Matemáticas,
  Ciencias y Lenguaje). Los documentos (`Recomendaciones_*_8Basico.docx`) NO
  reportaron claves erróneas: pidieron mejoras de composición. Criterio elegido:
  mantener el banco, corregir lo puntual y **agregar ítems de mayor orden**.
  - **Matemáticas → 168:** corregida la representación en recta numérica
    (círculo abierto/cerrado + intervalo); +48 ítems (razonamiento, análisis de
    errores, aplicación con contexto, representación).
  - **Ciencias → 184:** suavizadas formulaciones demasiado absolutas y reducida la
    repetición; +40 ítems (aplicación experimental, análisis, comparación).
  - **Lenguaje → 168:** eliminadas ambigüedades y varias preguntas de memoria
    convertidas a aplicación; +48 ítems (comprensión con fragmento breve,
    inferencia, análisis de publicidad).
  - Los tres siguen **sin revisión humana** (`revisada:false`); la aprobación se
    hace luego con el tablero → `aplicar-revisadas.py`.
- **`scripts/generar-pdf-preguntas.py` generalizado:** funciona por asignatura
  (`python scripts/generar-pdf-preguntas.py <carpeta>`) y con `--sin-revisar`
  exporta un PDF por asignatura con solo lo pendiente. Los PDF quedan en `dev/`
  (ignorados por git; son regenerables).
- **Pendientes:** revisión pedagógica humana de Matemáticas, Ciencias y Lenguaje;
  un Kimün "científico" para el header de Ciencias; probar el duelo en 2 celulares;
  notificaciones push y ranking real; limpiar perfiles de prueba en Supabase.

### Sesión 9 (2026-08-13)
- **Bancos de AÑO COMPLETO para las 3 asignaturas nuevas** (todos los OA oficiales),
  alimentándose del sitio oficial (`curriculumnacional.cl`). Se hizo por fases, en
  secuencia, con agentes en paralelo por eje y consolidación validada:
  - **Ciencias 184 → 459** (15/15 OA): se agregaron OA05-15 (cuerpo humano y salud,
    electricidad y calor, materia y átomo), ~25/OA. Sin conflicto de códigos.
  - **Matemáticas 168 → 518** (17/17 OA): se agregaron Números (OA01-05), Funciones
    (OA07 lineal, OA10 afín), Geometría (OA11-14) y Prob./Estadística (OA15-17).
  - **Lenguaje 168 → 443** (15/15 OA): se agregaron poesía, teatro, epopeya, comedia,
    interpretación, estrategias de comprensión y escritura (OA01,02,04-08,12-15).
- **Re-mapeo a OA oficiales (fidelidad).** Al armar Matemáticas y Lenguaje (Sesión 8)
  se habían usado códigos internos que chocaban con la numeración oficial. Se corrigió:
  - **Matemáticas:** "lenguaje algebraico" + "expresiones" se fundieron en el oficial
    **OA06 (operaciones algebraicas)** y se liberó el **OA07 para función lineal**. La
    expedición pasó a "Álgebra y **funciones**" (OA06-09).
  - **Lenguaje:** los 4 temas se re-etiquetaron a sus códigos reales —narrativo→**OA03**,
    informativos→**OA11**, medios→**OA10**, argumentar→**OA09**— y se recableó la
    expedición. IDs renumerados de forma consistente.
- Cada `oa.json` ahora lista **todos los OA oficiales** con sus textos y `nota_fidelidad`
  (validar redacción literal contra el PDF del MINEDUC).
- **Calidad:** corrección verificada por muestra; se detectó y corrigió un problema
  sistemático de tildes en un lote de Matemáticas (~98 correcciones); Ciencias y
  Lenguaje salieron limpios; cero modismos. `generar-pdf-preguntas.py` ahora sanea
  glifos ausentes en la fuente del PDF (subíndices químicos, ∛) sin tocar el JSON.
- Todo sigue **`revisada:false`**. El motor NO se tocó (solo datos + `EXPEDICIONES`).
  Las 4 expediciones jugables se verificaron en el navegador (5 nodos con pool listo).
- **Documentada la "orden 99" (= `git pull`)** en la sección "Regla de commits",
  para que cualquier sesión (p. ej. el PC de casa) la entienda sin explicarla.
- **Pendientes:** revisión pedagógica humana de los bancos; armar nuevas expediciones
  aprovechando los OA de reserva; Kimün "científico"; duelo en 2 celulares; push y
  ranking real; limpiar perfiles de prueba en Supabase.

### Sesión 10 (2026-08-13)
- **Sincronización (orden 99):** `git pull` desde otro PC trajo el trabajo de las
  Sesiones 4-9 (motor data-driven, 3 asignaturas nuevas de año completo, Supabase,
  tablero, PDF). Fast-forward sin conflictos.
- **PDF de revisión generados:** los tres bancos sin revisar —Matemáticas (518),
  Ciencias (459) y Lenguaje (443)— con `generar-pdf-preguntas.py --sin-revisar`,
  para la revisión pedagógica en papel. Quedan en `dev/` (ignorados por git).
- **Pendientes:** sin cambios respecto a la Sesión 9 (revisión pedagógica humana de
  los 3 bancos nuevos; nuevas expediciones con OA de reserva; Kimün "científico";
  duelo en 2 celulares; notificaciones push y ranking real; limpiar perfiles de
  prueba en Supabase).

### Sesión 11 (2026-08-14)
- **Enriquecimiento por revisión pedagógica de los 3 bancos de año completo**
  (Matemática, Ciencias, Lenguaje). Se recibieron dos tandas de documentos externos:
  "recomendaciones_*" (estratégicas) y "revision_detallada_*" (por OA, con números
  de pregunta). **Ninguna aprobó preguntas** (son "previas a aplicación"), así que
  todo sigue **`revisada:false`**. Criterio acordado: **fixes concretos +
  enriquecimiento de mayor orden adaptado al formato de quiz (15 s)**, manteniendo
  los bancos (crecen).
  - **Matemática 518 → 603:** fixes (OA16 eje truncado como *efecto*, no regla
    absoluta —preguntas 2, 5, 15 y 17—; OA15 convención de cuartiles declarada;
    OA17 menos conteo repetido) + 85 ítems (análisis de errores, aplicación,
    interpretación). Se corrigió además un lote de tildes faltantes heredado.
  - **Ciencias 459 → 534:** fixes (excretor sin ambigüedad → riñón; distractor
    absurdo "rueda" reemplazado; OA01 con menos "¿quién descubrió?") + 75 ítems
    (situación experimental, evidencia→modelo, predicción de circuitos).
  - **Lenguaje 443 → 514:** +71 ítems (análisis de fragmentos breves, **efecto** de
    la figura literaria, inferencia con evidencia, emoción en publicidad, decisiones
    de escritura). Sin errores puntuales que corregir (la revisión es metodológica).
- Todo generado con agentes en paralelo (parciales por eje) y consolidado con
  validación (estructura, ids, opciones únicas, barrido de tildes y modismos).
- **`generar-pdf-preguntas.py`:** ahora sanea también superíndices/exponentes
  (`2⁵`→`2^5`, `2⁻¹`→`2^-1`) además de subíndices y ∛, para el PDF de revisión.
- **Límite de formato detectado:** varias recomendaciones (textos fuente + preguntas
  encadenadas; **producción escrita real** en OA13-15; sets sobre un mismo gráfico)
  **no caben en el quiz de 15 s**. Serían un **"modo lectura/evaluación" nuevo**
  (proyecto de motor, no de datos), que queda anotado como pendiente.
- El motor NO se tocó (solo datos + tablero + script). Las 4 expediciones se
  verificaron en el navegador (pool listo).
- **Pendientes:** aprobación humana / curación para la prueba final (las revisiones
  detalladas traen un mapa de "mejores ítems" por OA); eventual "modo lectura +
  escritura"; y los de siempre (nuevas expediciones con OA de reserva, Kimün
  "científico", duelo en 2 celulares, push y ranking real, limpiar Supabase).

### Sesión 12 (2026-08-14)
- **Aprobación humana de los 3 bancos:** Roberto marcó Matemática (603), Ciencias
  (534) y Lenguaje (514) como **revisadas** (`revisada:true` en todas; `revisadas =
  total`). Con Historia (663), el proyecto queda **100% revisado: 2.314/2.314**.
  Tablero regenerado (la barra "Revisadas por ti" marca 100% en las 4 asignaturas).
- Nota: el PDF `--sin-revisar` de esas tres ahora sale vacío (ya no hay pendientes).
- **Pendientes:** sin cambios (curación para la prueba final; eventual "modo lectura +
  escritura"; nuevas expediciones con OA de reserva; Kimün "científico"; duelo en 2
  celulares; push y ranking real; limpiar Supabase).

### Sesión 13 (2026-08-14)
- **Dos expediciones nuevas (OA de reserva, solo datos):** Ciencias "Electricidad y
  calor" (CN08 OA08-11) y Lenguaje "Mundos literarios" (OA04 poesía, OA05 teatro,
  OA06 epopeya, OA07 comedia). Cableadas en `EXPEDICIONES`; **6 expediciones jugables**
  (30 nodos). Verificadas en el navegador (pool + mapa OK). El motor no se tocó.
- **Diseño de la feature "campaña de asignatura completa" (piloto Historia):** se
  usó el flujo brainstorming → spec → plan. Idea: los OA de una asignatura, en orden,
  en capítulos de 4 OA (los sobrantes → "Desafío Extra" con recompensa mayor), un
  **Jefe Final grande** multi-fase (barra de vida, 3 corazones, se abre al 100%,
  puesta en escena épica) y **recompensas** (skin exclusiva bloqueada en tienda,
  insignias coleccionables con selector, corona dorada, bono). Se construye como
  **capa "Campaña" data-driven** sobre el motor actual (fase A), estrenando con
  Historia (fase C). Historia 8° se re-corta en 5 capítulos + Desafío Extra (OA20-22).
  - **Diseño aprobado** (página de revisión: artefacto privado).
  - **Spec:** `docs/superpowers/specs/2026-08-14-campana-historia-design.md`.
  - **Plan (5 fases, 17 tareas):** `docs/superpowers/plans/2026-08-14-campana-historia.md`.
  - **Aún sin implementar:** será la **primera feature de motor** (hasta ahora todo
    fue datos). Se retomará en sesión nueva / worktree aislado, tarea por tarea con
    subagent-driven-development, verificando en el navegador.
- **Pendientes:** implementar la campaña de Historia (plan listo); luego generalizar
  la plantilla a Matemática/Ciencias/Lengua; assets de Roberto (skin "Kimün
  historiador", arte del villano del Jefe Final); y los de siempre (Kimün "científico",
  duelo en 2 celulares, push y ranking real, limpiar Supabase).

### Sesión 14 (2026-08-14)
- **Campaña de Historia IMPLEMENTADA — primera feature de motor del proyecto.** Se
  ejecutó el plan de la Sesión 13 (5 fases, 17 tareas) con `executing-plans`, tarea
  por tarea, verificando cada una en el navegador (`preview_start` + `javascript_tool`
  + `read_page`). Todo el texto visible en español latino neutro; el motor
  data-driven publicado NO se rompió (las otras 3 asignaturas siguen como
  expediciones sueltas).
  - **Fase 1 · Datos:** se reemplazó `hist-europeos` por **6 rutas** de campaña
    (`hist-cap1`…`hist-cap5` + `hist-desafio`) que cubren los **22 OA** (mismo
    `preguntas.json`, distinto agrupamiento). Nuevos catálogos `CAMPAÑAS` (1: Historia)
    e `INSIGNIAS`; helpers `campañaDe`/`campañaPorId`. Estado nuevo en `S`
    (`campañasCompletas`, `insignias`, `insigniaActiva`) con `guardar()`/`cargar()`.
  - **Fase 2 · Pantalla de campaña:** helpers de desbloqueo (`expedicionCompleta`,
    `nodoCampDesbloqueado`, `desafioDesbloqueado`, `jefeFinalDesbloqueado`); tarjeta
    única por asignatura con campaña (+👑 al completar); pantalla `scr-campana` con
    desbloqueo secuencial (cap N tras vencer N-1; Desafío tras los 5 caps; Jefe al
    100%); botón "Volver a la campaña" en el mapa de capítulo.
  - **Fase 3 · Jefe Final multi-fase:** `scr-jefe-intro` (villano "El Guardián del
    Tiempo" 🐉, diálogo, tema carmesí `en-jefe`) + `scr-jefe` (barra de vida =
    fases×nPorFase = **16 aciertos**, **3 corazones**, **4 fases** por época, rótulo e
    indicador). Reusa el markup de opciones del quiz. Derrota → reintento con
    preguntas nuevas; victoria → recompensas + pantalla de celebración.
  - **Fase 4 · Recompensas:** `otorgarRecompensasCampaña` (marca campaña completa,
    desbloquea skin exclusiva, otorga insignia, corona y bono +500🪙/+300XP). Skin
    "Kimün Historiador" **visible-pero-bloqueada** en la tienda (🎓 marcador; el
    modelo real de skins es por emoji, no por imagen). Nueva pantalla de perfil
    (`scr-perfil`, reemplaza el `alert` de logros) con **vitrina de insignias +
    selector**; la insignia activa se luce junto al nombre en HUD, ranking y duelo.
    Pantalla de victoria `scr-jefe-win` con las 4 recompensas.
  - **Fase 5 · Migración:** cortesía en `cargar()` — si existe `hist-europeos` con el
    jefe vencido, se da por completado el Capítulo 1 (abre el Capítulo 2) y se elimina
    la clave vieja; XP/monedas/estrellas/skins/logros intactos. Recorrido real por la
    UI verificado de punta a punta.
- **Desviaciones del plan (justificadas):** reuso de las clases `.opts/.opt` del quiz
  en el Jefe Final; perfil como pantalla real (para el selector de insignias);
  migración marca todo el cap1 como completado (estado de mapa limpio) y solo si no se
  había empezado la campaña.
- **Assets reales integrados (fin de sesión):** Roberto generó (IA) y Claude procesó
  (recorte al contenido, cuadrado con margen, optimizado con paleta) los dos assets de
  la campaña:
  - **Skin "Kimün Historiador"** → `assets/kimun-historiador.png` (384×384, ~52 KB).
    Se cableó la **Opción A**: el sistema de skins (antes solo emoji) ahora soporta
    **skins con imagen** (`img` en `SKINS`, helpers `skinImg`/`avatarHTML`); la
    ilustración se muestra en HUD, tienda, ranking y pantalla de victoria. El emoji
    `🎓` queda solo como respaldo.
  - **Villano "El Guardián del Tiempo"** → `assets/villano-historia.png` (512×512,
    ~93 KB). Campo `villanoImg` en la campaña; se muestra grande en la intro del jefe
    y pequeño en el HUD del duelo, con `🐉` de respaldo.
- **Pendientes:** generalizar la campaña a Matemática/Ciencias/Lengua (plantilla ya
  probada; casi solo datos); y los de siempre (Kimün "científico" para Ciencias, duelo
  en 2 celulares, notificaciones push y ranking real, limpiar perfiles de prueba en
  Supabase).

### Sesión 15 (2026-08-15)
- **Sincronización (orden 99):** pull de las Sesiones 11-14 (campaña de Historia,
  jefe multi-fase, más expediciones sueltas).
- **Pantalla principal reorganizada en 2 niveles (4 módulos):** la pantalla de
  expediciones muestra ahora **un módulo por asignatura** (Historia, Matemáticas,
  Ciencias, Lenguaje) en vez de las expediciones sueltas mezcladas. Al entrar a una
  asignatura con campaña se abre su campaña; a una sin campaña, una nueva pantalla
  `scr-mapas` ("Elige un mapa"). Funciones `renderExpediciones` (nivel 1),
  `abrirAsignatura` (nivel 2), `mapasDe`, `ORDEN_ASIG`.
- **Portada propia por mapa (convención):** cada mapa usa `assets/portada-<id>.png`
  con **fallback** (onerror) a la portada de la asignatura; al crear la imagen aparece
  sola sin tocar código. Genéricas por asignatura en `ASIG_PORTADA`.
- **Ciencias convertida en CAMPAÑA completa (como Historia):** los 15 OA del año en
  **4 capítulos** = las 4 unidades oficiales (La célula, Cuerpo humano y salud,
  Electricidad y calor, La materia y el átomo). Se agregaron `cien-cuerpo` (OA05-07) y
  `cien-materia` (OA12-15); los 2 existentes pasaron a `campaña:'cien'`. **Jefe Final**
  de 4 fases (villano **"La Entropía"** 🌀), recompensa skin **"Kimün Científico"** +
  insignia **"Maestro de Ciencias"** + bono.
- **Motor de campañas generalizado:** estaba atado a Historia. Ahora el **"Desafío
  Extra" es opcional** por campaña, el título del jefe es dinámico
  (`JEFE FINAL DE <asignatura>`) y el jefe se desbloquea sin desafío. → Convertir
  Matemáticas/Lenguaje será casi solo datos.
- **Assets reales integrados (lote 3, `scripts/procesar-lote3.py`):**
  `villano-ciencias.png` (512, ~403 KB), `kimun-cientifico.png` (384, ~215 KB) y 3
  portadas de mapa (`portada-mate-algebra`, `portada-leng-textos`,
  `portada-leng-literarios`, 512, ~450 KB). Originales en `assets/originales/`.
  (Quedó una variante B del villano sin usar en Descargas.)
- **Corrección — nombres en el Duelo:** en "Elige la expedición" (duelo 1v1) cada
  opción mostraba solo la asignatura (6 "Historia" iguales, indistinguibles). Ahora
  muestra el **nombre del tema** en grande y la asignatura como subtítulo (`renderODExp`,
  reusa el helper `nombreMapa`).
- **Prueba con invitados:** el Capítulo 3 de Historia **"El mundo colonial"** queda
  **desbloqueado siempre** (flag `libre:true` en la expedición; `nodoCampDesbloqueado`
  lo respeta), para que los invitados prueben esa unidad sin completar las anteriores.
  Reversible quitando el flag cuando terminen las pruebas.
- **Audio — música de fondo + efectos (enfoque híbrido):** efectos procedurales
  nuevos en `SND` (tic-tac ≤5 s del timer en quiz y duelos; `hit` golpe al jefe;
  `hurt` daño; `unlock` desbloqueo de logro/insignia; `coin` compra en tienda).
  Nuevo objeto `MUSIC`: música de fondo por **archivos ligeros** con loop y volumen,
  cambia según contexto (`menu` para menú/mapa/quiz, `jefe` para el Jefe Final), con
  **fallback**: si el archivo no existe, no suena nada y no rompe (404 benigno).
  Control **separado**: botón 🎵 (música) y 🔊 (efectos), independientes y persistidos
  (`kimun_music`, `kimun_sound`). Las pistas (`assets/audio/musica-menu.mp3` y
  `musica-jefe.mp3`) las genera/consigue Roberto; specs y fuentes libres en
  `assets/audio/README.md`.
- **Matemáticas → "Reto de Cálculo" (nueva mecánica de cálculo mental rápido):** a
  pedido de Roberto, el camino de Matemáticas deja de ser el quiz de álgebra y pasa a
  ser un juego de **agilidad numérica**, alineado al eje Números de 8°. Generador
  **procedural** (`genCalculo`, sin banco, operaciones infinitas) con 5 niveles:
  Calentamiento (fluidez base), Enteros (OA01), Potencias y raíces (OA03-04),
  Fracciones y % (OA02/OA05) y Reto Relámpago (mixto + ecuaciones OA08). Mini-juego
  propio: mapa de niveles con desbloqueo (`scr-calc-mapa`), ronda de 10 operaciones
  con barra de tiempo por operación (10→6 s), combo y opción múltiple (`scr-calc`), y
  resultado con estrellas + XP/monedas (`scr-calc-res`). Progreso en `S.calc`
  (persistido). El módulo Matemáticas del menú abre el Reto; el banco de álgebra sigue
  disponible para el Duelo 1v1. Contenido verificado (respuestas correctas y alineación
  curricular). Ajustables: velocidad, nº de operaciones, dificultad, umbral de estrellas.
- **Reto de Cálculo ampliado (mismo peso que las campañas):** tras probarlo, Roberto
  notó que era corto y fácil comparado con las otras asignaturas. Se profundizó:
  cada nivel pasó a tener **3 sub-etapas** de dificultad creciente (**15 etapas** en
  total); **Jefe Final "El Autómata" 🤖** (se desbloquea al dominar los 5 niveles;
  barra de vida de 15, 3 corazones, 6 s/operación, mezcla de todos los tipos) que
  entrega skin **"Kimün Calculista" 🧮** + insignia **"Maestro del Cálculo" 🎖️** + bono
  (+500🪙/+300XP); y **Modo Sin Fin ♾️** con récord de racha máxima. Estado `S.calc`
  reescrito (`{etapas[5], jefe, record}`). Texto del candado de skins ahora usa `req`
  por skin (antes "Termina Historia" fijo). Dificultad retadora pero justa para 8°.
- **Hotfix (importante):** la reescritura de `S.calc` (estrellas→etapas) dejó una línea
  del menú (`renderExpediciones`, módulo Matemáticas) leyendo `.estrellas`, que ahora es
  `undefined`. Eso rompía `renderExpediciones` y **impedía entrar** (al pulsar JUGADOR no
  navegaba). Corregido a `.etapas.filter(e=>e>=RC_ETAPAS)`. Lección: al cambiar la forma
  de un objeto de estado, reprobar TODOS los flujos que lo leen (incluido el menú), no
  solo la feature nueva.
- **Reto de Cálculo con vida (Kimün + combos):** el Reto ahora tiene al compañero
  **Kimün reaccionando** en cada operación (neutral / feliz al acertar / sorprendido en
  combo / triste al fallar) — `kimReact` se generalizó para animar un elemento por id
  (`kimBuddyCalc`) — y la **animación de combo** ("COMBO x_ 🔥" + sonido) que ya usaba el
  quiz (`comboFx`, overlay global). Aplica en los tres modos (niveles, jefe y sin fin).
- **Assets reales (lote 4, `scripts/procesar-lote4.py`):** 8 imágenes generadas (IA) y
  procesadas. Integradas: skin **"Kimün Calculista"** 🧮 (premio del Reto, con imagen);
  villano **"El Autómata"** 🤖 ahora visible en el mapa del Reto y el HUD del jefe; y
  **4 skins ilustradas para la Tienda** — Astronauta (120🪙), Mago (130), Ninja (140),
  Superhéroe (160) — que dan valor real a las monedas (antes solo emojis). Guardadas para
  la **futura campaña de Lenguaje**: **Kimün Escritor** (`kimun-escritor.png`) y el jefe
  **"El Borrón"** (`villano-lenguaje.png`). Originales en `assets/originales/`; quedó una
  variante alternativa del Calculista sin usar (en Descargas de Roberto).
- **Banda sonora completa (5 pistas, mono 96 kbps, livianas):** Roberto generó los
  temas y Claude los recortó/comprimió con ffmpeg (vía `imageio-ffmpeg`, sin instalar
  nada al sistema). Cada momento suena distinto y `MUSIC.contexto(id)` enruta por
  pantalla: `menu` (menú/mapa/tienda/Reto, 60 s, 704 KB), `aventura` (quiz de
  expedición, 60 s, 704 KB), `jefe` (jefes de campaña, 45 s, 528 KB), `jefeCalc` (jefe
  del Reto "El Autómata", 45 s, 528 KB) y `duelo` (1v1, 43 s, 512 KB). ~2.9 MB en total,
  en loop y descargadas por contexto. Los originales pesaban 3-5 MB c/u (256 kbps
  estéreo) → recortados a loops de 45-60 s. Criterio de Roberto: jefes 45 s, menú ≤60 s.
- **Preview local:** `.claude/launch.json` levanta el servidor estático con
  `preview_start` (`python -m http.server 8765 --directory`, puerto fijo). Antes se
  arrancaba a mano; ahora lo gestiona el harness.
- **Banda sonora curada (Kevin MacLeod) + sección de créditos:** a Roberto no le
  convencieron los primeros temas (salvo el menú, de **Pixabay**). Claude buscó
  candidatas en Incompetech (**Kevin MacLeod**, CC BY 4.0 — FreePD cerró y Pixabay no
  se puede scrapear), le pasó previews de 40 s, y con las elegidas quedó: **Aventura**
  (Carefree / Sneaky Snitch) y **Jefe de campaña** (Death of Kings / Crossing the Chasm)
  que **se alternan al azar** (un contexto de `MUSIC.srcs` puede ser un arreglo; `play`
  elige una); **Autómata** (Digya) y **Duelo** (Severe Tire Damage). Todas mono 96k.
- **Sección de Créditos:** enlace "Créditos" en el inicio → recuadro con atribución
  precisa: música (Kevin MacLeod CC BY 4.0 + Pixabay), tipografías (Google Fonts · SIL
  OFL), contenido (**MINEDUC** de Chile), ilustraciones (IA de ChatGPT — sin atribución
  requerida). Revisión de licencias de todo lo de terceros: solo Kevin MacLeod obliga.
- **Fixes de audio:** (1) **desbloqueo en el primer gesto** del usuario para el autoplay
  en móvil (listener `pointerdown/touchstart/click/keydown` que arranca `MUSIC`); (2) las
  **etapas del Reto de Cálculo** ahora usan la música de `aventura` (antes `menu`, por
  eso "no cambiaba" al entrar al desafío) y el jefe su `jefeCalc`; (3) `MUSIC.play` hace
  `el.load()` al cambiar de pista (cambio de `src` fiable en móvil).
- **Música del Modo Sin Fin:** contexto propio `sinfin` con **"Voxel Revolution"**
  (Kevin MacLeod, electrónica intensa). El Reto quedó con música por modo: etapas
  `aventura`, sin fin `sinfin`, jefe `jefeCalc`.
- **Pendientes:** convertir Lenguaje en campaña (y decidir el enfoque de Matemáticas si
  se quiere además una campaña de álgebra); villano + skin por asignatura;
  portadas propias de los capítulos de Ciencias (opcional); duelo en 2 celulares,
  notificaciones push y ranking real, limpiar perfiles de prueba en Supabase.
  Recordatorio: quitar el `libre:true` de "El mundo colonial" al terminar las pruebas.

### Sesión 16 (2026-08-16)
- **Sincronización (orden 99):** `git pull` de `main` — ya estaba al día (nada nuevo
  que traer desde el otro PC).
- **Duelo 1v1 · "Elige la expedición" en 2 niveles (como la pantalla principal):**
  antes el selector del duelo mostraba **todas** las expediciones activas en una lista
  plana (13 opciones: 6 capítulos de Historia, álgebra, 4 de Ciencias, 2 de Lenguaje),
  difícil de recorrer. Ahora es de **2 niveles**: **nivel 1** = un módulo por asignatura
  (Historia · 6 mapas, Matemáticas · 1 mapa, Ciencias · 4 mapas, Lenguaje · 2 mapas);
  al tocar uno se abren sus mapas (**nivel 2**), cada uno seleccionable, con botón
  **"← Materias"** para volver. Todo dentro del mismo contenedor `#odExpSel` (sin
  pantallas nuevas).
  - **Implementación** (`index.html`): se reescribió `renderODExp()` (nivel 1) y se
    agregó `renderODExpMapas(asig)` (nivel 2) + helper `odExpsDe(asig)`. Reutiliza
    `ORDEN_ASIG`, `ASIG_PORTADA`, `nombreMapa`, `portadaMapa`/`portadaFallback`
    (portada propia por mapa con fallback a la de la asignatura), igual que la pantalla
    principal. Nota: en el duelo, **Matemáticas** usa su expedición de álgebra (no el
    Reto de Cálculo), coherente con que el banco de álgebra vive en el Duelo.
  - Como ya **no viene nada preseleccionado**, se agregó una validación en
    `iniciarDesafio`: si no hay expedición elegida, muestra *"Elige una expedición
    primero."* en vez de fallar. CSS nuevo para el botón `.od-exp-volver` (punteado,
    cian).
  - Verificado en el navegador (`preview_start` + `javascript_tool`): nivel 1 → abrir
    Historia → seleccionar un mapa (queda marcado) → "← Materias" vuelve a las 4
    asignaturas. Sin errores de consola (los 404 son los fallbacks benignos de
    portadas de capítulo y audio).
- **Duelo · Matemáticas ahora muestra el Reto de Cálculo (no "Álgebra y funciones"):**
  a pedido de Roberto, en el duelo Matemáticas debía verse **igual que su mapa** del
  juego principal (los niveles del Reto de Cálculo), no la vieja expedición de álgebra.
  Ahora el nivel 2 de Matemáticas lista los **5 niveles** del Reto (🔥 Calentamiento,
  ➖ Enteros, √ Potencias y raíces, ½ Fracciones y %, ⚡ Reto Relámpago) con su ícono
  emoji, mismo estilo que `renderNivelesCalc`. Al elegir uno, el duelo **genera 8
  operaciones al vuelo** con `genCalculo` (dificultad `RC_BASE[i]+1`), sin repetir, y
  las convierte al formato del duelo (`{pregunta, opciones, correcta, tip}`). Como el
  duelo asíncrono guarda las preguntas generadas, el rival recibe **las mismas
  operaciones**.
  - **Implementación** (`index.html`): helpers `odMapasMate()` (arma los niveles como
    "mapas" del duelo), `odNMapas(asig)` (conteo para el nivel 1) y `odPreguntasCalc(exp)`
    (genera las 8 operaciones); `renderODExpMapas` pinta ícono emoji para Matemáticas y
    portada para el resto; `iniciarDesafio` toma la rama de cálculo (sin `cargarPool`)
    cuando el mapa elegido trae `calc`. CSS nuevo `.od-exp-ic` (caja del emoji, 38×38).
  - **Alcance:** solo los 5 niveles (no el Jefe "El Autómata" ni el Modo Sin Fin, que no
    encajan en el formato de duelo de 8 preguntas). La expedición de álgebra deja de
    aparecer en el duelo. Verificado en el navegador (respuestas correctas, índices
    válidos, otras asignaturas intactas, sin errores de consola).
- **Lenguaje convertido en CAMPAÑA completa (como Historia y Ciencias) — cierra las 4
  asignaturas con campaña + jefe.** Se hizo con el flujo brainstorming → diseño aprobado →
  implementación (solo datos; el motor de campañas ya era genérico desde la Sesión 15).
  Las 2 expediciones sueltas de Lenguaje pasaron a ser **4 capítulos** que cubren los 15 OA
  (la U1 "Lectura literaria", con 8 OA, se partió en dos):
  - **Cap 1 · Leer y comprender** (OA01 hábito lector, OA02 experiencia humana, OA03
    narración, OA08 interpretación).
  - **Cap 2 · Mundos literarios** (OA04 poesía, OA05 teatro, OA06 epopeya, OA07 comedia).
  - **Cap 3 · Textos y medios** (OA09 argumentar, OA10 medios/publicidad, OA11 textos no
    literarios, OA12 estrategias de comprensión).
  - **Cap 4 · Escritura** (OA13 crear, OA14 explicar, OA15 persuadir).
  - **Jefe Final "El Borrón"** ✒️ (`assets/villano-lenguaje.png`), 4 fases (una por
    capítulo, las 15 OA repartidas), 3 corazones. Recompensas: skin **"Kimün Escritor"**
    (`assets/kimun-escritor.png`, visible-pero-bloqueada), insignia **"Maestro de las
    Letras"** ✍️, corona y bono +500🪙/+300XP.
  - **Implementación** (`index.html`, solo datos): las 4 expediciones con `campaña:'leng'`
    (se reusaron los ids `leng-literarios` y `leng-textos` para conservar sus portadas; los
    nuevos `leng-lectura` y `leng-escritura` caen al fallback `portada-lenguaje.png`);
    entrada `'leng'` en `CAMPAÑAS`; insignia en `INSIGNIAS`; skin `kimun-escritor` en
    `SKINS` (con imagen, `desbloqueaCon:'leng'`). El motor NO se tocó.
  - **Verificado en el navegador:** menú muestra Lenguaje como campaña (0/4 capítulos);
    desbloqueo secuencial (Cap 1 jugable, resto 🔒, jefe al 100%); pool carga para los OA
    de cada etapa; intro del jefe muestra a "El Borrón" con su arte; recompensas otorgadas
    OK (skin desbloqueada, insignia ganada, +500🪙). El duelo muestra los 4 capítulos de
    Lenguaje. Únicos 404: `portada-leng-lectura.png` y `portada-leng-escritura.png` (caen
    al fallback; arte propio opcional a futuro). Sin errores de JS.
- **Pendientes:** ¡las 4 asignaturas ya tienen campaña + jefe! Quedan: portadas propias de
  los 2 capítulos nuevos de Lenguaje y de los capítulos de Ciencias (opcional); duelo en 2
  celulares; notificaciones push y ranking real; limpiar perfiles de prueba en Supabase;
  quitar `libre:true` de "El mundo colonial" al terminar las pruebas.

### Sesión 17 (2026-08-16) — Preparación de la v0.99
Cierre de contenido, pulido y una intro. Se decidió etiquetar **v0.99** (candidata) para
dar una vuelta manual antes de la v1. Todo verificado en el navegador, sin errores de JS.
- **Revisión de completitud:** chequeo cruzado (script) de que **todos los assets
  referenciados existen** (31) y de que **cada etapa y jefe tiene preguntas**; los Jefes
  Finales cubren el 100% de los OA de su banco. Smoke test de las 4 campañas + Reto +
  duelo, carga limpia sin errores.
- **Limpieza v0.99:** se eliminó la expedición **`mate-algebra`** (quedaba inalcanzable:
  Matemáticas se juega como Reto de Cálculo y el duelo usa los niveles de cálculo; el banco
  de álgebra queda de reserva). Se quitó el flag **`libre:true`** de "El mundo colonial"
  → desbloqueo secuencial restaurado (probado con jugador nuevo).
- **Modo QA (`?qa=1`):** marca la respuesta correcta en todos los modos y desbloquea todo,
  para pruebas manuales; aviso visible; oculto y sin efecto en el juego normal. (Ver
  "Herramientas de desarrollo".)
- **Economía de la tienda re-escalonada:** los precios iban 40–160 (se compraba lo más caro
  con un capítulo). Ahora **80–900**: emojis de entrada (🦉80 … 👑350) + skins ilustradas
  premium (Astronauta 450, Mago 550, Ninja 700, Superhéroe 900). La tienda ahora muestra el
  **nombre** de las skins que lo tienen.
- **7 skins deportivas nuevas (premium, ilustradas · lote 5):** Karateka, Futbolista,
  Basquetbolista, Voleibolista, Ciclista, Tenista, Skater (🥋⚽🏀🏐🚴🎾🛹, 320–560).
  Roberto generó el arte (IA); Claude lo procesó con `scripts/procesar-lote5.py` (recorte,
  cuadrado, 384 px). En el mismo lote se integraron las **2 portadas** que faltaban de
  Lenguaje (`portada-leng-lectura`, `portada-leng-escritura`, 512 px) → ya no hay 404.
- **Intro de bienvenida (video):** `assets/intro.mp4` (~11 s, 9:16, 720×1278, ~1 MB). El
  zorro llega desde el fondo del espacio y orbitan símbolos de las 4 asignaturas (números y
  ÷+, átomo y matraz, pergamino y reloj de arena, pluma y letras) — sin palabras. Roberto
  generó el video (IA, varias iteraciones: sin texto, sin doble cola); Claude lo comprimió
  con ffmpeg (7–8 MB → ~1 MB), le antepuso **1 s de negro** y le puso **fundido de
  entrada/salida** (imagen + audio). **Audio:** "Fanfare for Space" de Kevin MacLeod
  (Incompetech, CC BY), tramo **7–17 s**, mono AAC, fusionado en el mp4 (atribución añadida
  a Créditos). Se reproduce **una vez por dispositivo** (flag `kimun_intro`), con botón
  "Saltar" y "▶ Toca para comenzar" cuando el navegador bloquea el autoplay con sonido;
  respeta `prefers-reduced-motion`; `?intro=1` la fuerza.
- **Documento de resumen (artefacto):** página visual con las 4 campañas y un diagrama de
  todo lo que se puede hacer en Kimün (privada, para compartir cuando Roberto quiera).
- **Pendientes:** dar la vuelta manual y decidir el paso a **v1**; versión del video en
  9:16 de pantalla completa ya lista; sigue opcional el arte de portadas de capítulos de
  Ciencias; y los de siempre (duelo en 2 celulares, push, ranking real, limpiar Supabase).

### Sesión 18 (2026-08-17)
- **Sincronización (orden 99):** `git pull` de `main` trajo las Sesiones 15-17 desde el
  otro PC (campañas de Ciencias y Lenguaje, Reto de Cálculo, banda sonora, intro en
  video, tienda re-escalonada, modo QA). Fast-forward sin conflictos.
- **Arte propio para los 14 capítulos (lote 6) — cierra el pendiente de portadas.**
  Roberto generó las 10 que faltaban (4 de Ciencias + 5 de Historia + el Desafío Extra);
  Claude escribió los prompts uno por uno, calibrados al estilo de las portadas de
  Lenguaje (Kimün de cuerpo entero haciendo la actividad del capítulo, objetos temáticos
  flotando, viñeta circular, paleta violeta/dorado/cian).
  - **Criterio editorial en los capítulos sensibles:** "Los europeos llegan a América" se
    centró en la **travesía** (carabela, brújula, astrolabio; sin armas ni banderas) y "El
    mundo colonial" en la **vida cotidiana y el mestizaje** (mercado, maíz, greda, adobe),
    evitando ilustrar la conquista armada o el trabajo forzado en una portada para niños.
  - **Procesamiento (`scripts/procesar-lote6.py`):** a diferencia del lote 5, estas vinieron
    en **RGB con fondo blanco opaco** (sin alfa), así que recortarlas por canal alfa las
    habría dejado como cuadrados blancos. El script detecta el fondo con **relleno por
    inundación desde las 4 esquinas** (así no borra los blancos interiores: delantal,
    bandera, pergaminos) y lo vuelve transparente con el borde suavizado; luego recorta,
    cuadra con margen y exporta a 512 px. De ~2,2 MB c/u a ~390 KB (3,8 MB en total).
    Originales en `assets/originales/`.
- **Las portadas ahora se lucen en la pantalla de campaña (cambio de motor chico):** antes
  los capítulos eran nodos con un número y las portadas solo se veían como miniaturas de
  ~40 px en el selector del duelo, donde el arte no se apreciaba.
  - `nodoCampañaEl` acepta imagen + respaldo (sin imagen conserva el círculo con la marca,
    compatible hacia atrás); `renderCampaña` pasa la portada de cada capítulo, la del
    Desafío Extra y el **villano de la campaña en el nodo del Jefe Final**.
  - CSS: círculo de 52 → **68 px** con la ilustración dentro, y el número pasó a una
    **insignia** (`.cn-badge`) que muestra número / ✓ / 🔒 según el estado. El gris de
    bloqueado se aplica solo a la ilustración, no a la insignia.
  - **Verificado en el navegador:** las 3 campañas (Historia 7 nodos, Ciencias 5,
    Lenguaje 5) cargan sus 17 imágenes sin caer al respaldo; los tres estados se ven
    correctos (completado verde con ✓, jugable violeta con número, bloqueado en gris con
    🔒). Sin errores de consola. Nota: el panel del navegador se cerró a mitad de la
    verificación, así que la comprobación final fue por DOM y estilos calculados, no por
    captura de pantalla.
- **Pendientes:** dar la vuelta manual y decidir el paso a **v1**; decidir qué hacer con
  los ~22 MB de originales en el repositorio y con el huérfano
  `assets/portada-mate-algebra.png` (la expedición de álgebra se eliminó en la v0.99);
  y los de siempre (duelo en 2 celulares, notificaciones push, ranking real, limpiar
  perfiles de prueba en Supabase).

### Sesión 19 (2026-08-17) — Cursos y ranking real
Cierra el pendiente más antiguo del proyecto: el ranking dejó de ser simulado. Se hizo con
el flujo completo brainstorming → diseño aprobado → plan → ejecución por subagentes, con dos
revisiones independientes del SQL. Diseño y plan en `docs/superpowers/`.
- **El problema de fondo no era el ranking, sino la identidad.** `renderRanking` inventaba
  cuatro nombres fijos, pero además Supabase no guardaba XP y **un jugador solo existía en el
  servidor si entraba al Duelo en línea**. Y la identidad era anónima por dispositivo: al
  limpiar el navegador se perdía todo. Por eso la feature terminó siendo "cursos + identidad
  + ranking", no solo el ranking.
- **Decisiones (Roberto):** el ranking mide **XP total**; se compite **por curso**; los cursos
  y alumnos los crea **el adulto desde el Modo Admin**; cada alumno entra con un **código de
  acceso** que lo vincula a su perfil en cualquier aparato.
- **Backend (`supabase/schema.sql`):** tablas `cursos`, `vinculos` y `config`; columnas `xp`,
  `curso_id` y `codigo_acceso` en `perfiles`. La tabla **`vinculos` separa la sesión anónima
  del dispositivo del perfil del alumno** — esa es la pieza que permite jugar en el celular y
  en el tablet sin duplicarse. Helper `kimun_yo()` y adaptación de las 6 funciones de duelo
  que asumían `auth.uid()`. Funciones nuevas: `kimun_xp`, `kimun_ranking`, `kimun_canjear` y
  cinco de administración.
- **Juego (`index.html`):** el perfil se crea **al abrir el juego** (antes solo en el duelo);
  pantalla de canje "🎟️ Tengo un código"; sincronización del XP enganchada a `guardar()` con
  un límite de 15 s; `renderRanking` reescrita con **tres estados** (con curso, sin curso, sin
  conexión) y caché; y **panel de administración de cursos** dentro del juego (`scr-admin`),
  de modo que ya no hace falta entrar a Supabase para inscribir alumnos.
- **Hallazgos de las revisiones (lo más valioso de la sesión).** El plan original tenía
  defectos que solo aparecieron al revisarlo:
  - **La política RLS de `perfiles` dejaba la tabla legible.** Al agregarle `codigo_acceso`,
    los códigos de todos los alumnos habrían quedado a la vista de cualquiera que abriera la
    consola. Se eliminó la política: ahora nada se lee directo.
  - **La clave de administración por defecto era explotable** (quedaba escrita en el
    repositorio). Ahora nace aleatoria y se guarda con hash bcrypt.
  - **PostgreSQL otorga EXECUTE a PUBLIC por defecto**: omitir una función del `grant` no la
    protege. Hubo que revocar explícitamente `kimun_admin_ok` y los generadores de código.
  - **pgcrypto vive en el esquema `extensions`, no en `public`** (particularidad de Supabase),
    así que `crypt()` no se resolvía dentro de las funciones y el Modo Admin habría muerto con
    un error indescifrable. `gen_random_uuid()` no sufre el problema porque es nativa de
    PostgreSQL desde la versión 13.
  - **`supabase-js` no lanza excepción cuando falla**: devuelve `{data, error}`. Tres
    manejadores del panel ignoraban el error y fallaban en silencio.
  - **El campo del código truncaba a 8 caracteres** cuando el código mide 12: el canje habría
    sido imposible.
  - **El XP corregido por el adulto se deshacía solo**, porque el teléfono volvía a enviar su
    valor local. Ahora el cliente adopta el valor del servidor cuando es menor y lo guarda.
- **Verificado con datos reales:** Roberto creó el curso "8vo csfs" con cuatro alumnos; el
  canje funciona y el ranking los muestra ordenados. Regresiones probadas: el duelo contra
  bots sigue operando con la identidad nueva, el juego no se rompe con Supabase caído, y un
  jugador sin curso ve la invitación a pedir su código en vez de nombres falsos.
- **Límites asumidos (documentados en el diseño):** el XP lo reporta el teléfono y puede
  falsearse —por eso existe `kimun_admin_xp_fijar`—; el progreso de campañas y las skins
  siguen siendo del aparato y no del alumno, así que en un tablet compartido dos hermanos
  comparten avance aunque tengan XP distinto; y la clave de administración sigue siendo un
  bloqueo suave, aunque ya no se puede leer del código fuente.
- **Mantenimiento desde el panel (cierre de la sesión):** se agregaron las dos herramientas
  que faltaban para no volver a depender del SQL Editor. **`✎` por alumno** usa
  `kimun_admin_xp_fijar` (que ya existía sin interfaz) para corregir un XP inflado, lo único
  que la sincronización normal no puede hacer porque solo sube. **🧹 Limpiar perfiles de
  prueba** usa la función nueva `kimun_admin_limpiar_pruebas(clave, ejecutar)`: con
  `ejecutar=false` cuenta y con `true` borra, así el botón informa cuántos son y pide
  confirmación antes de tocar nada. El criterio es "no es bot y no es alumno inscrito", es
  decir los perfiles que cada navegador o teléfono crea solo al abrir el juego.
  **Advertencia registrada:** borrar arrastra los duelos de esos perfiles y no tiene
  deshacer, así que conviene limpiar **después** de que los niños canjeen sus códigos; si se
  hace antes, un teléfono que ya venía jugando pierde su perfil en línea.
- **Pendientes:** probar el canje en los teléfonos de los niños y luego ejecutar la limpieza
  (la lista de rivales del duelo trae 18 entradas, casi todas de pruebas); dar la vuelta
  manual y decidir el paso a **v1**; los ~22 MB de originales y el huérfano
  `portada-mate-algebra.png`; duelo en 2 celulares; notificaciones push.

### Sesión 20 (2026-08-17)
- **Sincronización (orden 99):** llegó desde el otro PC la feature de Cursos y ranking real
  (Sesiones 18-19) + las portadas de capítulo de Historia y Ciencias (lote 6).
- **Botón para eliminar cursos (Modo Admin):** faltaba en el panel de cursos (solo se podían
  crear cursos y agregar/quitar alumnos). Ahora cada curso tiene un botón **🗑️** junto a su
  nombre que, tras confirmar (avisa que borra también sus alumnos y su lugar en el ranking),
  elimina el curso.
  - **Backend (`supabase/schema.sql`):** función nueva `kimun_admin_curso_quitar(clave,
    curso_codigo)` (SECURITY DEFINER, valida la clave con `kimun_admin_ok`): borra los
    `perfiles` con ese `curso_id` (arrastra sus duelos por cascade) y luego el curso;
    devuelve cuántos alumnos borró. Agregada al `grant`. **Roberto la aplicó en Supabase.**
  - **Juego (`index.html`):** botón `.adm-curso-del` en el encabezado de cada curso de
    `admListar`, con confirmación destructiva y refresco de la lista. Reusa el patrón del
    borrado de alumno y el traductor de errores `admError` (usa `curso_invalido`, ya definido).
- **Contraseña de Admin unificada (Cursos + Tablero):** había dos claves distintas —la de
  Cursos (servidor, bcrypt en `config.admin_clave`) y la del Tablero (bloqueo suave
  `CLAVE_ADMIN` en `generar-tablero.py`). Roberto eligió el enfoque **simple: una sola clave**
  para ambos, asumiendo que la de Cursos baja a "bloqueo suave" (queda en el repo vía el
  tablero). Se estandarizó en la que ya usaba el tablero (`112358`); Roberto la fijó en
  Supabase con `update public.config set valor = crypt('112358', gen_salt('bf',10)) where
  clave='admin_clave';`. Sin cambios en el repo (el tablero ya estaba en ese valor). Nota:
  esa clave también permite borrar cursos/alumnos; se puede endurecer cambiando `CLAVE_ADMIN`
  + regenerar el tablero + re-ejecutar el `update` con el nuevo valor.
- **Saludo al alumno en el inicio:** tras canjear su código, la pantalla de inicio muestra
  **"¡Hola, <Nombre>!"** con las mismas letras que KIMÜN (Titan One + degradado
  cian/violeta/rosa). Elemento `#rolNombre` + función `pintarInicio()` (se llama al cargar,
  tras el sync con el servidor, tras canjear y en `go('scr-rol')`). Si hay alumno, el saludo
  reemplaza el subtítulo genérico; si no, se ve el subtítulo normal. Solo `index.html`.
- **Recompensas del Modo Difícil (para motivar a estudiar más):** el Difícil era más difícil y
  rendía MENOS (10 s → menos bono de XP) y no daba recompensa propia. Se hizo con brainstorming →
  spec (`docs/superpowers/specs/2026-08-17-modo-dificil-recompensas-design.md`) → implementación.
  Roberto eligió recompensas de **prestigio/estatus, no inflar el XP** (para no distorsionar el
  ranking). Hito: completar **todos los capítulos de una asignatura en Difícil** (Historia,
  Ciencias, Lenguaje; Matemáticas queda fuera, tiene su propia dificultad).
  - **3 insignias 🔥** (`dif-historia/ciencias/lenguaje`), **skin "Kimün Maestro" 🏆** al completar
    las 3 (bloqueada, emoji hasta que haya arte), y **marca 🔥 social en el ranking** junto a
    cualquier alumno con Difícil, con **borde animado de 4 colores** (las asignaturas) cuya
    intensidad sube con el conteo (d1 borde · d2 +brillo · d3 grueso+brillo). Respeta
    `prefers-reduced-motion`.
  - **Backend (`supabase/schema.sql`, Roberto lo aplicó):** columna `perfiles.dificil`, función
    `kimun_dificil(n)` (sube el conteo, como `kimun_xp`) y `kimun_ranking` ahora devuelve `dificil`.
  - **Cliente (`index.html`):** helpers `asignaturasDificil()` + `revisarDificil()` (otorga
    insignias/skin, sincroniza el conteo; idempotente, retroactivo al iniciar), llamada al pasar
    una etapa en Difícil; marca 🔥 con dedupe (evita doble 🔥 en la fila propia). Best-effort: si el
    backend no está, no rompe (la marca simplemente no aparece).
- **Maestría Total (recompensa cumbre + celebración):** logro máximo = **los 4 jefes al
  máximo** — Historia + Ciencias + Lenguaje **en Difícil** y vencer a **El Autómata** (Reto de
  Cálculo). `esMaestro()` = `asignaturasDificil().length>=3 && S.calc.jefe`. Diseño en
  `docs/superpowers/specs/2026-08-18-maestria-total-design.md`.
  - **Al lograrlo:** (1) **video de celebración** `assets/maestro.mp4` (zorro rey, 10 s, con
    música épica **"Hero Down"** de Kevin MacLeod, CC BY) — overlay `#maestroOverlay`, una sola
    vez (flag `S.maestro`), con sonido (es tras una acción del usuario) y botón "Saltar";
    (2) **skin "Kimün Maestro" 🏆** (arte real integrado, `skin-kimun-maestro.png`, lote 5-bis)
    — su desbloqueo se movió de 3 → los 4; (3) **cambios visuales permanentes** con la clase
    `body.es-maestro`: **aura dorada** en el compañero Kimün (`#kimBuddy`/`#kimBuddyCalc`/
    `#resKim`) y el logo, **halo dorado** en el avatar/HUD, y **marco dorado** en la fila del
    ranking (`.rk.dif.d4`, sobre los bordes de 4 colores).
  - **Backend:** SIN migración nueva — reutiliza el `dificil` que ya se sincroniza; ahora el
    conteo **suma El Autómata** (0–4) y el ranking pinta el marco dorado si `dificil>=4`.
  - **Bug corregido de paso:** `#maestroOverlay` con `hidden` quedaba visible porque el CSS
    `id + display:flex` anulaba el atributo; se agregó `#maestroOverlay[hidden]{display:none}`.
  - **Video de intro/maestro:** ambos se comprimen con ffmpeg (imageio-ffmpeg) y guardan
    originales en `assets/originales/`. Créditos: añadida atribución de "Hero Down".
  - Verificado en el navegador (los 4 disparan la maestría, no antes; video una sola vez; aura
    persiste; ranking d4; sin errores de consola).
- **Pendientes:** sin cambios respecto a la Sesión 19.

### Sesión 21 (2026-08-18) — Rol de profesor (diseñado) y renombre a VULPO
- **Sincronización (orden 99):** llegó la Sesión 20 desde el otro PC (eliminar cursos,
  clave unificada, saludo al alumno, recompensas del Modo Difícil y Maestría Total).
- **Rol de profesor — diseño y plan, sin implementar.** Roberto pidió cuentas de profesor
  que administren uno o más cursos. El modelo actual no servía: una clave global (que además
  está en el repositorio) daba acceso total a todos los cursos, y `cursos` no tenía dueño.
  Decisiones: profesores de **un colegio real** (no solo gente de confianza), por lo que se
  pasa a **correo y contraseña** con Supabase Auth; **Roberto autoriza cada correo** con una
  lista blanca; cada profesor tiene **autonomía total sobre sus cursos** y nada sobre los
  ajenos; y el acceso es una **página propia** (`profesor.html`) con almacenamiento de sesión
  separado, para que iniciar sesión como profesor no le borre la identidad al niño que juega
  en ese mismo teléfono. **Idea de Roberto que mejoró el diseño:** sacar el Modo Admin del
  juego por completo, de modo que los niños solo vean Jugador y Duelo. Como consecuencia, la
  clave global y el panel de cursos dentro del juego se desmontan.
  Diseño: `docs/superpowers/specs/2026-08-18-rol-profesor-design.md`;
  plan de 11 tareas: `docs/superpowers/plans/2026-08-18-rol-profesor.md`. **Queda en cola.**
- **Renombre de la marca: KIMÜN → VULPO (plataforma) y Vulpi (mascota).** El nombre KIMÜN
  ya existe como marca de terceros, **incluida al menos una del rubro de enseñanza**, lo que
  bloqueaba el lanzamiento a producción. Se eligió una palabra de fantasía derivada de
  *vulpes* (zorro en latín): **Vulpo** para el colegio y los apoderados, **Vulpi** para el
  compañero de juego de los niños. Se descartó *Zorbi* porque ya es una app educativa activa;
  las empresas brasileñas *Vulpi* no bloquean porque las marcas se protegen por país y clase.
  Roberto confirmó la disponibilidad de **Vulpo** antes de ejecutar.
  Diseño: `docs/superpowers/specs/2026-08-18-renombre-vulpo-design.md`.
  - **Hallazgo que redujo el trabajo:** el nombre **nunca estuvo dibujado en el arte** (el
    logo es texto con tipografía web), así que **no hubo que regenerar ninguna ilustración**.
  - **Cambió lo visible:** título, logo, textos de la mascota ("🦊 Vulpi te cuenta…"), los
    nombres de las 17 skins, README, CLAUDE.md y el tablero.
  - **NO cambiaron los identificadores internos, a propósito:** las claves del navegador
    (`kimun_save`, `kimun_intro`…), las ~20 funciones de Supabase (`kimun_*`), los ids de las
    skins (`kimun-historiador`) y los 34 archivos de arte. **Cambiar las claves o los ids
    habría borrado el progreso y las skins compradas** de quien ya juega. Nadie los ve y no
    constituyen uso de marca.
  - **La bitácora conserva el nombre antiguo** porque es el registro histórico; se agregó una
    nota de marca al inicio de `CLAUDE.md` para que nadie lo lea como un descuido.
  - **Verificado:** siete pantallas más los créditos sin rastro del nombre anterior, y el
    progreso guardado (XP, monedas, skins) intacto tras el cambio. Sin errores de consola.
  - **Repositorio renombrado** a `vulpo`; GitHub deja una redirección desde la URL anterior.
- **Pendientes:** implementar el rol de profesor (plan listo); que los niños canjeen sus
  códigos y luego ejecutar la limpieza de perfiles de prueba; considerar un dominio propio
  (`vulpo.cl`) para no depender de la redirección de GitHub; dar la vuelta manual y decidir
  el paso a **v1**; los ~22 MB de originales y el huérfano `portada-mate-algebra.png`; duelo
  en 2 celulares; notificaciones push.

### Sesión 22 (2026-08-18) — Rol de profesor implementado
Se ejecutó el plan de 11 tareas con subagentes (implementador + revisión de seguridad por
separado). El resultado: **la clave global compartida desapareció** y la administración vive
en cuentas reales con aislamiento entre docentes.
- **Backend:** tablas `profesores` y `profesores_autorizados`, columna `cursos.profesor_id` y
  **14 funciones `kimun_prof_*`** que identifican al profesor por su sesión (`auth.uid()`) y
  ya no reciben ninguna clave. Helper `kimun_prof_es_mio` para la comprobación de propiedad.
- **`profesor.html` (nuevo):** ingreso, registro y panel, con un cliente de Supabase de
  **almacenamiento separado** (`storageKey:'kimun-profesor'`). Sin eso, un profesor que
  inicia sesión en el teléfono donde juega su hijo le borraría la identidad al niño.
- **Se retiró del juego:** el botón Modo Admin, la pantalla `scr-admin` y sus 148 líneas de
  JavaScript, más las 8 funciones `kimun_admin_*` y la fila `admin_clave`. **La pantalla de
  inicio quedó con solo Jugador y Duelo**, que era la idea de Roberto.
- **Hallazgos de las revisiones (lo más valioso).** El plan tenía defectos que solo
  aparecieron al revisarlo y ejecutarlo:
  - **La cuenta de administrador era reclamable desde internet.** Sembrar el correo del
    administrador en la lista blanca, con el repositorio público y la confirmación de correo
    desactivada, permitía que cualquiera se registrara con ese correo y quedara como
    administrador. Se eliminó la semilla: el administrador se crea a mano desde Supabase.
  - **La recomendación de desactivar la confirmación de correo era peligrosa** y se revirtió.
    Es lo único que impide registrarse con un correo ajeno.
  - **El `delete` que liberaba registros huérfanos permitía escalar a administrador** y podía
    borrar la cuenta de un profesor vivo. Quedó acotado con `not exists` sobre `auth.users`.
  - **`kimun_prof_yo` no devuelve null** para quien no es profesor, sino una fila de campos
    vacíos, que en JavaScript es un objeto verdadero: **el panel se habría abierto para
    cualquiera**. Se detectó probando contra el servidor real, no leyendo código.
  - **Un profesor no autorizado quedaba encerrado**, viendo "no tienes permiso" en cada
    visita sin poder cerrar sesión, porque el botón vivía dentro del panel oculto. Es el
    camino que recorre todo docente que se registra antes de ser autorizado.
  - **`admEsc` era usada por el ranking**, no solo por el panel: borrar el bloque del Modo
    Admin habría roto el ranking del curso. Se rescató como `escHtml`.
  - Faltaban por completo **revocar a un profesor** y **reasignar un curso huérfano**: sin
    ellas, un docente que deja el colegio conservaba acceso para siempre.
- **Riesgo activo encontrado y cerrado:** la clave `112358` estaba en el repositorio público
  y permitía a cualquiera leer los códigos de acceso de todos los alumnos y borrar cursos.
  Roberto la cambió por una que no está en el repositorio; con el retiro de las funciones
  `kimun_admin_*` el problema queda cerrado de raíz.
- **Límites conocidos:** el correo integrado de Supabase permite **2 envíos por hora**, así
  que para un colegio real hace falta SMTP propio (Resend o Brevo) antes de dar de alta
  varios profesores; sin él, tampoco hay autorrecuperación de contraseña.
- **Aislamiento VERIFICADO con dos cuentas reales.** Roberto creó un profesor de prueba y,
  desde su sesión, llamó directamente a las funciones del servidor saltándose la interfaz:
  `kimun_prof_curso_quitar` sobre el curso del administrador y `kimun_prof_xp_fijar` sobre un
  alumno ajeno. **Ambas respondieron `no_autorizado`** y los datos quedaron intactos. Además,
  el profesor de prueba ve "Mis cursos" en vez de "Todos los cursos", no ve los cursos ajenos
  y no tiene sección de administración.
- **Confusión detectada al probar, y corregida:** el servidor responde `no_autorizado` tanto
  cuando faltan permisos como cuando el curso no existe —es deliberado, separarlos permitiría
  descubrir qué códigos existen probándolos—, pero el panel mostraba "No tienes permiso" a un
  profesor que simplemente había borrado su propio curso en otra pestaña. Ahora el mensaje
  dice "No tienes permiso para esto, o el curso o alumno ya no existe" y la lista se refresca
  sola tras un fallo, para no seguir mostrando algo que ya no está.
- **Nota:** el curso "8vo csfs" y sus cuatro alumnos ya no existían al llegar aquí; se habían
  borrado antes del cambio. Los códigos `ALU-` entregados quedaron sin efecto.
- **Pendientes:** probar el aislamiento con un segundo profesor; crear el curso real de los
  niños y que canjeen sus códigos; los dos trámites (marca en INAPI y dominio `vulpo.cl`);
  configurar SMTP; la vuelta manual para decidir la v1; duelo en 2 celulares; push.

### Sesión 23 (2026-08-18) — Mapa de dominio por OA
Primera herramienta pensada para el **adulto** y no para el niño: el profesor ve, por
objetivo de aprendizaje, cómo va su curso y cada alumno, para decidir qué reforzar. Hecha
con el flujo brainstorming → spec → plan → subagentes, con revisión de seguridad aparte.
- **El problema:** el XP mide cuánto juega un niño, no qué entiende. Cada pregunta ya traía
  su campo `oa`, pero nada de eso subía al servidor.
- **Decisiones (Roberto):** se ve **el curso y también cada alumno**; se guardan
  **contadores por alumno y objetivo** (no cada respuesta, por privacidad y volumen); y solo
  cuentan **campaña y jefes**, no el duelo (contra el reloj, se falla por apuro) ni el Reto
  de Cálculo (operaciones generadas al vuelo, sin OA).
- **Backend:** tabla `dominio` (perfil, oa, respondidas, correctas), `kimun_dominio(jsonb)`
  que suma el resumen de cada etapa, y `kimun_prof_dominio`, `kimun_prof_dominio_alumno` y
  `kimun_prof_dominio_reiniciar` con el aislamiento por curso ya probado.
- **Juego:** acumulador en memoria durante la etapa y envío al terminar; el **modo QA no
  registra**; los envíos fallidos quedan pendientes y se reintentan. Nada interrumpe la
  partida.
- **Panel:** botón "📊 Ver avance" por curso y 📊 por alumno; tabla ordenada de peor a mejor
  con el **texto real del objetivo** (leído de `contenido/<asignatura>/oa.json`), la barra de
  color y **cuántas preguntas respaldan cada porcentaje**; botón de reinicio de mediciones.
- **Dos fallos silenciosos que se atajaron al implementar:**
  - `buildPreguntas` y `jefePreguntasFase` **descartaban el campo `oa`** al armar las
    preguntas. Con el plan tal cual, la tabla habría quedado **vacía para siempre sin ningún
    error visible**. Fue el hallazgo más importante de la sesión.
  - El backend descarta las entradas cuyo código no calce con `^[A-Z]{2}[0-9]{2} OA [0-9]{2}$`.
    La expresión se contrastó contra las **2.314 preguntas y los 69 códigos reales** antes de
    dejarla: un código legítimo que no calzara habría dejado ese objetivo sin medir, también
    en silencio.
  - Además, un cast sin validar podía perder un lote entero y dejarlo reintentándose para
    siempre, y una referencia calificada con esquema en un `ON CONFLICT` podía fallar recién
    en producción (los cuerpos plpgsql no se validan al crearse). Ambas corregidas, la
    segunda también en `kimun_prof_alta`, que ya estaba aplicada.
- **Decisión registrada:** una etapa abandonada a medias **no se descarta**; lo respondido
  viaja con el resumen de la siguiente etapa terminada. Son respuestas reales, y un alumno
  que abandona tras fallar es información útil. El jefe abandonado sí se pierde.
- **Probado con datos reales:** una etapa jugada por la interfaz registró exactamente 6
  respondidas y 4 correctas. Después se simuló un curso completo —**30 alumnos, ~460
  respuestas en 77 registros**— con dificultad distinta por asignatura, para ver el informe
  con contraste.
- **Límite asumido y visible en pantalla:** **no sirve para calificar**; el dato lo reporta
  el teléfono del alumno, igual que el XP.
- **Pendientes:** que Roberto revise el informe con su cuenta; borrar el curso de simulación;
  Matemáticas no aparece en el mapa (habría que mapear los niveles del Reto a los OA de
  Números si se quiere cubrir); los dos trámites (INAPI y `vulpo.cl`); SMTP antes de dar de
  alta profesores reales; la vuelta manual para decidir la v1; duelo en 2 celulares; push.

### Sesión 24 (2026-08-18) — Revisión del informe y corrección del porcentaje
Roberto pidió mejorar el área del profesor y se despacharon **tres agentes con miradas
distintas** —docente de aula, analista de datos y diseñador de producto— sobre la
herramienta recién construida. De ahí salió el trabajo de esta sesión.
- **El hallazgo que obligó a corregir:** el porcentaje era `correctas/respondidas` acumulado,
  y **el denominador dependía de lo que se quería medir**. Se reintenta una etapa cuando no
  se entendió, así que el alumno que menos sabe aporta más respuestas y pesa más en el
  promedio del curso. Ejemplo con 30 alumnos: el panel mostraba 66,7% donde el promedio real
  era 76,7%, con la mitad de la base aportada por seis niños repitiendo.
- **La corrección:** dos columnas `resp_1` y `ok_1` en `dominio`, escritas **solo en la rama
  `insert`** de `kimun_dominio` y jamás en el `on conflict do update`. El porcentaje pasa a
  ser "cuántos acertaron la primera vez que vieron este contenido", con el mismo denominador
  para todos los objetivos. `respondidas - resp_1` queda como señal propia: cuánto costó.
  **Cuatro líneas de SQL, cero cambios en `index.html`.**
- **Verificado contra la base real:** dos partidas sobre un objetivo nuevo (4 de 6 y luego 6
  de 6) dejaron `respondidas=12, correctas=10` y **`resp_1=6, ok_1=4`**. Ese objetivo reporta
  67% en vez del 83% inflado.
- **Otros cambios del panel:** colores calibrados al **piso del azar** (con 4 opciones,
  responder sin saber da 25%, así que los cortes van en 45% y 70%); la atenuación por base
  pequeña se reemplazó por **tres bloques** —Para reforzar, Van bien, Todavía con pocos
  datos— porque ordenar de peor a mejor y atenuar a la vez se peleaban: la posición decía
  "mira esto primero" y la opacidad decía "ignora esto", de modo que la primera fila podía
  ser justo la menos confiable; se muestra el número de alumnos que respaldan cada
  porcentaje (dato que ya viajaba del servidor y se descartaba); y se advierte que
  **Matemáticas no se mide**, para que el silencio no se lea como "todo bien".
- **Lo que los tres informes dejaron para más adelante**, sin implementar:
  - **Del objetivo a los nombres:** al tocar una fila, ver quiénes necesitan apoyo. Es el
    vacío que el profesor de aula puso primero, y los datos ya existen.
  - **Participación y fecha:** quién jugó esta semana y quién no ha entrado nunca.
    `dominio.actualizado` ya lo permite sin guardar nada nuevo.
  - **Presentación:** encabezado que diga de qué curso es, salto al inicio al abrir, botón de
    volver arriba, texto a dos líneas, filtro por asignatura. Con textos de 250 caracteres
    caben **tres objetivos por pantalla** y 60 filas son 8.228 px de scroll.
  - **Un defecto de hoy sin corregir:** el botón 📊 por alumno empujó esa fila y provocó
    **scroll horizontal** en móvil; los botones miden 21×25 px y el de borrar quedó a 30 px
    del de ver avance.
  - **Estadística por ítem** (~2.300 filas fijas, sin `perfil_id`) para calibrar los bancos,
    que hoy no lo están: parte de la brecha entre un objetivo en 45% y otro en 87% es que un
    banco es más duro, no que los niños sepan menos.
- **Advertencia registrada:** el riesgo real no es que la herramienta se use poco, sino que
  un colegio la use para **calificar o supervisar docentes**. El dato viene del teléfono del
  alumno: en cuanto tiene consecuencias, el camino corto a un buen número deja de ser
  estudiar. Y la cuenta de administrador —que en un colegio sería UTP— puede abrir el avance
  de cualquier curso.
- **Pendientes:** limpiar el curso de simulación y ver el informe con datos limpios; las
  mejoras listadas arriba; los dos trámites (INAPI y `vulpo.cl`); SMTP; la vuelta manual para
  decidir la v1.

### Sesión 25 (2026-08-18) — Quiénes necesitan apoyo, y el comando Titanic
- **Del objetivo a los nombres.** Era el vacío que el informe pedagógico puso primero: el
  mapa decía *qué* contenido estaba flojo, no *quiénes*. Un objetivo en 45% puede ser el
  curso completo —hay que reenseñar y se pierde una clase— o seis niños que arrastran el
  promedio —basta un grupo de refuerzo—, y distinguirlo exigía abrir 35 fichas a mano.
  - **Función nueva `kimun_prof_dominio_oa(curso, oa)`**: devuelve a **todos** los alumnos
    inscritos con su primer intento en ese objetivo, también a los que no lo jugaron
    ("12 no lo han visto" es información), **ordenados por nombre**. El orden alfabético es
    intencional: por rendimiento sería un ranking de niños.
  - **Cuatro grupos** al desplegar una fila: Necesitan apoyo (bajo 45%), En camino (45-70%),
    Lo lograron (70%+) y **Todavía sin evidencia** (menos de 4 preguntas de primer intento o
    sin jugar). Ese cuarto grupo evita mandar al refuerzo a un niño que falló **una sola
    pregunta** en un jefe final, donde cae una de cada objetivo.
  - **No se muestra el porcentaje individual ni se puede ordenar por rendimiento**, a
    propósito: una lista de menores ordenada por nota, con números al lado, es el artefacto
    que termina proyectado en un consejo o pegado en un libro de notas.
  - **No agrega ni una columna:** la información ya estaba en `dominio`.
  - **Verificado:** la clasificación reparte bien los cinco casos de prueba (incluido el que
    falló su única pregunta, que cae en "sin evidencia"); con 35 alumnos la suma de los
    cuatro grupos da 35, o sea nadie se pierde; no desborda en 375 px; y la función rechaza
    a un anónimo. **Falta que Roberto pruebe el aislamiento entre dos profesores**, que es lo
    que protege los nombres de los alumnos ajenos.
  - Hallazgos del subagente: faltaba el `drop function if exists` de la función nueva —sin
    él, el día que alguien agregue una columna al resultado, re-aplicar el esquema falla—; y
    `list-style:none` no oculta el triángulo del desplegable en Safari, hace falta
    `::-webkit-details-marker`.
- **Comando `/titanic`** (`.claude/skills/titanic/SKILL.md`): genera el prompt de traspaso
  para empezar una sesión nueva sin perder el hilo. Revisa el estado real del repositorio y
  entrega un prompt listo para copiar; **el `/clear` y el pegado son del usuario**. La
  decisión clave: el prompt **no repite lo que ya está en `CLAUDE.md`**, que se carga solo,
  sino el delta de la conversación que se cierra.
- **Pendientes:** probar el aislamiento entre profesores en la vista de apoyo; borrar el
  curso de simulación y generar datos nuevos para ver el mapa con el primer intento; las
  mejoras que dejaron los tres informes (participación y fecha, encabezado del curso, filtro
  por asignatura, el scroll horizontal que introdujo el botón por alumno); los dos trámites
  (INAPI y `vulpo.cl`); SMTP; la vuelta manual para decidir la v1.

### Sesión 26 (2026-08-19) — El mapa se puede recorrer, y participación
Dos trabajos sobre el panel del profesor. Primero, la **presentación del mapa**: tenía la
información correcta pero era incómoda en un teléfono (solo en `profesor.html`, sin tocar el
esquema). Después, una feature nueva, **participación y fecha**, que sí toca el backend.
- **El desborde en móvil no lo causaba el botón 📊.** Ese fue el disparador, pero la causa
  estaba desde antes: el nombre del alumno llevaba `flex:1` **sin `min-width:0`**, y un
  elemento flex no se encoge por debajo del ancho de su contenido salvo que se le diga. Con
  un nombre largo la fila crecía y arrastraba el panel entero: 382 px sobre 375. La fila del
  alumno pasó a **dos líneas** (nombre y botones arriba, código y XP abajo) y los botones de
  **21×25 px a 38×38**, con el de borrar apartado del resto porque es lo único sin deshacer.
  El mismo defecto estaba en la cabecera del curso y en la lista de profesores del
  administrador; los tres se corrigieron igual.
- **El mapa se recorre:** encabezado **pegado arriba** con el nombre del curso o del alumno
  y el botón de volver (el título del panel se oculta mientras tanto: decir "Mis cursos"
  sobre la tabla de un curso confunde); texto del objetivo **recortado a dos líneas**, que
  se abre entero al desplegar la fila —en la vista de un alumno, donde la fila no se
  despliega, va completo desde el principio—; **filtro por asignatura** en las dos vistas,
  que no se dibuja si hay una sola; salto al inicio al abrir cada vista y al cambiar de
  filtro; y botón flotante de **volver arriba** pasados 600 px. De **tres objetivos por
  pantalla a unos diez**.
- **Lo que más riesgo tenía:** el filtro rehace el cuerpo de la tabla, así que los `toggle`
  que cargan "quiénes necesitan apoyo" hay que **volver a cablearlos** en cada repintado. Sin
  eso el desplegable habría quedado mudo justo después de filtrar, que es cuando más se usa.
  Se extrajeron `conectarFilasOA` y `conectarFiltros` para que las dos vistas compartan el
  mismo cableado.
- **Verificado a 375 px con un banco de pruebas** que sustituye el backend (35 alumnos, 52
  objetivos, tres asignaturas), porque el panel real necesita credenciales: `scrollWidth`
  igual al viewport en todas las pantallas, filtro (52 → 22 Historia → 15 Ciencias), el
  desplegable de apoyo cargando después de filtrar, los tres bloques, la vista por alumno,
  el curso sin datos y el panel de administrador. Sin errores de consola. **Falta la
  confirmación con la cuenta real**, aunque las llamadas al servidor no cambiaron.
- **README corregido (primer trabajo):** decía que los cursos se crean "desde el Modo
  Admin", que se retiró en la Sesión 22. Ahora apunta a `profesor.html` y menciona el mapa.

**Participación y fecha (segundo trabajo).** El mapa decía *qué* contenidos costaban, no
*quiénes* están jugando. Se hizo con el flujo completo brainstorming → spec → plan →
subagentes (implementador + revisión de spec + revisión de calidad por separado).
- **El dato no salía de donde parecía.** La primera idea era usar `dominio.actualizado`, que
  ya existía, pero solo se escribe al terminar una etapa de **campaña o jefe**: un niño que
  juega Matemáticas (Reto de Cálculo) todos los días aparecería como "nunca entró". Se eligió
  una columna `visto` en `perfiles`, **sellada dentro de `kimun_xp`** —la sincronización que
  el juego ya hace cada 15 s en cualquier modo, y también al abrir—, así que mide la última
  entrada de verdad. Una línea de SQL, cero envíos nuevos desde el cliente.
- **Cuatro grupos, no una lista con fecha.** Jugaron esta semana / hace más de una semana /
  canjearon su código pero no han jugado / **nunca canjearon su código**. Los dos últimos se
  separan porque la acción es distinta: no canjear casi nunca es desinterés, es un código
  perdido o un teléfono que no tienen, y se resuelve volviendo a entregar el código. Fichas
  alfabéticas, **sin fecha individual ni orden por inactividad**: una lista de menores por
  días sin entrar se leería como lista de asistencia. Va en un bloque plegado arriba del
  mapa, porque la participación es el contexto que hace legible el porcentaje (un 45% no es
  lo mismo con 30 niños jugando que con cinco que nunca entraron).
- **Migración de arranque:** `visto` se rellena desde `max(dominio.actualizado)` al aplicar
  el esquema (idempotente con `where visto is null`). Quien solo jugó Reto de Cálculo parte
  sin fecha hasta su próxima entrada; es una limitación del primer momento, no permanente.
- **Hallazgo de la revisión de calidad (lo más valioso).** `cargarParticipacion` se lanza
  sin `await`; se cargaba con ids fijos, así que cambiar de curso con la consulta en vuelo
  hacía que la respuesta tardía escribiera **los datos de un curso bajo el encabezado de
  otro** —el cruce de identidad que la herramienta se cuida de evitar—. Corregido capturando
  los nodos antes del await, como ya hace `conectarFilasOA`. La revisión también rescató el
  marcador de Safari (`list-style:none` no oculta el triángulo del `<details>` en iOS sin
  `::-webkit-details-marker`, ya sabido desde la Sesión 25).
- **Backend:** columna `perfiles.visto`, `visto = now()` dentro de `kimun_xp`, función
  `kimun_prof_participacion(curso)` con el aislamiento por curso ya probado, y la migración
  de relleno. `index.html` **no se tocó**: el juego ya llama a `kimun_xp`.
- **Verificado a 375 px con backend simulado** (20 alumnos repartidos en los cuatro grupos):
  titular y conteos correctos sin perder a nadie, sin desborde lateral, el fallo de
  participación no tumba el mapa, el bloque aparece aunque el curso no tenga datos de
  dominio, y la carrera de cursos quedó demostrada (A lento no pisa a B). Sin errores de
  consola. Diseño y plan: `docs/superpowers/specs/2026-08-19-participacion-fecha-design.md` y
  `docs/superpowers/plans/2026-08-19-participacion-fecha.md`.
- **Falta por el lado de Roberto:** aplicar el esquema en el SQL Editor (hasta entonces la
  vista corre con datos simulados) y probar el aislamiento de `kimun_prof_participacion`
  entre dos profesores, igual que en la vista de apoyo.
- **Pendientes:** probar el aislamiento entre profesores en las vistas nuevas (apoyo y
  participación) y aplicar el SQL de participación; borrar el curso de simulación y generar
  datos nuevos; los dos trámites (INAPI y `vulpo.cl`); SMTP; la vuelta manual para decidir
  la v1.

### Sesión 27 (2026-08-20) — Se cierra participación y el panel se pliega en acordeón
Tres bloques: se cerró lo que quedaba pendiente de la Sesión 26, se generaron datos limpios
para ver los informes, y se reorganizó el panel del profesor.
- **Participación verificada en producción.** Roberto ya había pegado el esquema; se confirmó
  en el SQL Editor que existen `perfiles.visto` y `kimun_prof_participacion(p_curso_codigo text)`.
  El **aislamiento entre profesores** quedó probado en las dos vistas nuevas: desde la sesión
  del profesor de prueba (`profe-prueba@vulpo.cl`), llamar `kimun_prof_participacion` y
  `kimun_prof_dominio_oa` sobre un curso ajeno (`CUR-A692`, de otra cuenta) devolvió
  **HTTP 400 / `no_autorizado`** (la función hace `raise exception`, que PostgREST traduce a
  400). Cierra las dos pruebas que quedaban desde las Sesiones 25 y 26.
- **Datos limpios en `CUR-1939` (enfoque híbrido).** Se generaron **30 alumnos**: 28 por un
  bloque SQL de simulación (repartidos en los cuatro grupos de participación, con dominio de
  **primer intento** variado sobre los 12 OA de las primeras etapas de las tres campañas) y
  **2 jugados de verdad** desde el juego —**Renata Poblete** y **Simón Valenzuela**—, canjeando
  su código `ALU-` real y registrando por las **mismas funciones del servidor** que usa el
  juego (`kimun_dominio`, `kimun_xp`). Renata además **jugó el Reto de Cálculo por la interfaz**
  (etapa 1 superada), para demostrar que **Matemáticas cuenta para participación y XP** aunque
  —por diseño— no aparezca en el mapa de dominio. Detalle de automatización: el timer de las
  preguntas no deja seguir el ritmo clic a clic desde fuera, así que las etapas de campaña se
  registraron con la función real (idéntico pipeline) y el Reto se resolvió con un script en la
  propia página.
- **Panel del profesor reorganizado en acordeón (solo `profesor.html`, cero SQL).** Antes
  `pintarLista` pintaba **todos los cursos con todos sus alumnos expandidos**, un caos con más
  de un curso. Ahora:
  - **Identidad arriba:** "👤 &lt;nombre&gt; — Administrador/Profesor" (`#profId`), que se
    oculta en las vistas de avance (junto al título) y reaparece al volver.
  - **Cursos plegados** (`<details>`, el mismo patrón que las filas de objetivos): la cabecera
    muestra nombre, código, "N alumnos" y **"Participación · X/N jugaron esta semana"**, cargada
    en segundo plano por `cargarTitularesParticipacion` (una consulta por curso, reusa
    `gruposParticipacion`). El nodo del titular **se captura antes del `await`** para que la
    respuesta tardía de un curso no escriba bajo otro (misma precaución de la Sesión 26).
  - **Dentro del curso:** primero "📊 Ver avance del curso", luego un sub-acordeón
    **"👥 Alumnos (N)"** con las filas y el campo de agregar. El 🗑️ borra el curso **sin**
    alternar el acordeón (`stopPropagation`), y el marcador nativo del `<details>` se oculta con
    `::-webkit-details-marker` (fix de Safari ya conocido).
  - Ajuste sobre el plan: en móvil el nombre del curso se truncaba, así que "N alumnos" y la
    participación pasaron a sus propias líneas para que el nombre respire.
  - Diseño y plan: `docs/superpowers/specs/2026-08-20-panel-profesor-acordeon-design.md` y
    `docs/superpowers/plans/2026-08-20-panel-profesor-acordeon.md`.
- **Verificado a 375 px con un banco simulado** que sustituye el backend (no se puede iniciar
  sesión de profesor desde aquí): identidad y rol, dos cursos plegados con su titular correcto
  (1/3 y 1/2, sin cruce al repintar), avance primero + alumnos plegables, 🗑️ sin alternar,
  nombre completo, sin desborde lateral, bloque de administración intacto y cero errores de
  consola. **Falta la confirmación con la cuenta real** (donde el titular consulta de verdad),
  aunque las llamadas al servidor no cambiaron.
- **Pendientes:** confirmar el acordeón con la cuenta real; **la feature grande que pidió
  Roberto** —orientar por asignatura (qué repasar) y **preparar un desafío que obligue a rehacer
  una cadena de preguntas** para reforzar, con su propio brainstorming (toca panel + backend +
  el juego); borrar el curso de simulación cuando ya no se necesite; los dos trámites (INAPI y
  `vulpo.cl`); SMTP; la vuelta manual para decidir la v1.

### Sesión 28 (2026-08-20) — Desafío de refuerzo (feature completa, 3 fases)
La feature grande que pidió Roberto: el profesor lanza, con un clic, un desafío con los
objetivos flojos de una asignatura; el alumno lo ve como banner en el inicio y lo juega como
una cadena de preguntas; el profesor ve cuántos lo hicieron y con qué acierto. Flujo completo
brainstorming → spec → plan → ejecución por fases (executing-plans), verificando cada fase.
- **Decisiones del diseño (con mockups):** el sistema **sugiere** y el profesor **lanza** (no lo
  arma a mano); va a **todo el curso**; es una **cadena de los objetivos flojos de una
  asignatura** (< 70% de primer intento, con evidencia); **banner en el inicio**, insistente pero
  **no bloquea**; recompensa **XP + monedas + insignia "Misión del profe"** (única, la primera
  vez); seguimiento **quién lo hizo + acierto del curso**, medido **aparte**; **uno activo por
  curso**. Diseño y plan: `docs/superpowers/specs/2026-08-20-desafio-refuerzo-design.md` y
  `docs/superpowers/plans/2026-08-20-desafio-refuerzo.md`.
- **El punto delicado — medición aparte.** El mapa de dominio muestra el **primer intento**, que
  queda congelado a propósito (Sesión 24). El desafío repite esos objetivos, así que **no puede**
  haber un "segundo primer intento": su resultado se guarda en `desafio_resultados`, una medición
  independiente, y **no** llama a `kimun_dominio`. El seguimiento compara el acierto del refuerzo
  contra el primer intento original. El mapa no se altera (verificado: `registrarOA` no se llama
  en el desafío).
- **Fase 1 · Backend (aplicado):** tablas `desafios` (con índice único parcial `where activo` →
  uno por curso garantizado en la base) y `desafio_resultados`; funciones
  `kimun_prof_refuerzo_lanzar` / `_cerrar` / `_estado` (panel, con aislamiento `kimun_prof_es_mio`)
  y `kimun_refuerzo_activo` / `_completar` (juego, vía `kimun_yo`). El `_completar` usa
  `on conflict do nothing` (el primer intento manda). **Lección:** las `kimun_prof_*` dan
  `no_autorizado` desde el SQL Editor porque no hay sesión de profesor (`auth.uid()` null) — eso
  **confirma** que existen y que el aislamiento funciona; se prueban de verdad desde el panel.
- **Fase 2 · Panel (`profesor.html`):** bajo el mapa del curso, un bloque "Refuerzo" que muestra
  la sugerencia por asignatura (objetivos flojos con su texto y %) + botón lanzar, o el
  seguimiento del desafío activo (X/N completaron · acierto Y% · primer intento era Z%) + cerrar.
  No usa `accion` (que vuelve al panel); repinta solo el bloque para no salir de la vista de
  avance. Verificado con banco simulado.
- **Fase 3 · Juego (`index.html`), la delicada — reusa el motor de quiz con un flag `Q.desafio`,
  sin duplicarlo.** Banner `#bannerDesafio` en el inicio (aparece al cargar, al canjear y al
  volver); `construirPreguntasDesafio` arma ~12 preguntas de los OA con su propio fetch (no pisa
  el POOL de la expedición activa); `jugarDesafio` arranca el quiz; tres desvíos por `Q.desafio`
  en `pintaPregunta` (tag "📣"), `responder` (no registra dominio) y `avanzar` (→ `terminarDesafio`);
  `terminarDesafio` da el resultado propio + recompensa. Insignia nueva `mision-profe` en
  `INSIGNIAS`/`LOGROS`. **Verificado en el navegador:** el juego carga sin errores de sintaxis, el
  banner aparece, el desafío juega 12 preguntas de los objetivos correctos, al terminar otorga
  XP/monedas/insignia y llama `kimun_refuerzo_completar`, en `?qa` no registra, **y el juego normal
  quedó intacto** (etapa de campaña con tag normal, dominio sí se registra).
- **Falta por el lado de Roberto:** la prueba real end-to-end (lanzar desde su panel → jugar como
  alumno → confirmar que el banner desaparece al completar y que el seguimiento muestra las
  cifras), que no se pudo hacer aquí por no poder iniciar sesión de profesor.
- **Pendientes:** la prueba real end-to-end del refuerzo; confirmar el acordeón con la cuenta
  real; borrar el curso de simulación cuando ya no se necesite; los dos trámites (INAPI y
  `vulpo.cl`); SMTP; la vuelta manual para decidir la v1.

### Sesión 29 (2026-08-21) — Camino de aprendizaje de Matemáticas (Plan 1: motor + Unidad 1)
Hasta hoy Matemáticas **no enseñaba**: abría directo el Reto de Cálculo (entrenamiento de
agilidad, sin explicaciones ni dibujos), y era la única asignatura que el profesor no podía
medir (el Reto genera operaciones al vuelo, sin OA). Roberto pidió un **camino de aprendizaje
real** —enseñar con ejemplos gráficos y dibujos— conservando el camino de ejercicios. Se hizo
con el flujo completo brainstorming → diseño aprobado → plan → ejecución por subagentes (un
implementador por tarea + revisión de spec y de calidad por separado).
- **Decisiones (brainstorming, con Roberto):** lección con **formato mixto según el tema**
  (unos OA se manipulan, otros se explican); **aprender desbloquea el Reto** (cada nivel del
  Reto se abre al completar su lección); **año completo** (4 unidades) como campaña, construido
  como **motor de lecciones + contenido por unidad**; **diagramas dibujados con código (SVG
  interactivo)** + arte decorativo con imágenes de Roberto; **Matemáticas entra al mapa de
  dominio**; **villano nuevo "La Incógnita"** para el Jefe Final (El Autómata sigue en el Reto).
  Diseño: `docs/superpowers/specs/2026-08-21-camino-aprendizaje-matematicas-design.md`; plan:
  `docs/superpowers/plans/2026-08-21-camino-aprendizaje-matematicas.md`.
- **Enfoque elegido — motor de lecciones por bloques (data-driven).** Una lección es datos
  (`contenido/matematicas-8basico/lecciones.json`); el motor (`scr-leccion` +
  `abrirLeccion`/`renderBloque`/`avanzarBloque`) recorre bloques tipados: `texto`, `imagen`,
  `diagrama` (invoca un widget del catálogo `DIAGRAMAS[kind]`), `ejemplo` (revelado paso a paso)
  y `práctica` (reusa el motor de quiz con un flag `Q.leccion`, hermano de `Q.desafio`). Agregar
  una lección es agregar datos; el motor no se toca.
- **Catálogo de diagramas SVG (interactivos, sin librerías):** en este plan se construyeron
  `recta` (marcador arrastrable e intervalos con círculo abierto/cerrado), `fracciones` (barra
  partida) y `potencias` (cuadrícula lado×lado). El resto del catálogo (`funcion`, `plano`,
  `triangulo`, `transformacion`, `solido`, `cajon`, `barras`, `arbol`) llega con las unidades 2-4.
- **Unidad 1 (Números) completa y jugable:** 5 mini-clases (OA01–05) con explicación + diagrama
  + ejemplos + práctica del banco revisado. Matemáticas se sumó a `CAMPAÑAS` como campaña `'mate'`
  con 4 capítulos (Números activo; los otros 3 en "🔒 Pronto"). El desbloqueo del Reto
  (`nivelCalcDesbloqueado` + tabla `RETO_REQUISITO`) pasó a leer `S.mateLecciones`, con
  **migración cortés** (un nivel ya dominado antes sigue abierto). La medición **reusa
  `kimun_dominio` tal cual: cero backend nuevo**; se ajustó el aviso "Matemáticas no se mide" de
  `profesor.html`.
- **Hallazgos de las revisiones (lo valioso):**
  - **Matemáticas no está en `EXPEDICIONES`**, así que `contenidoDeAsignatura('Matemáticas')`
    devuelve `null`; con el plan literal, **toda práctica se habría saltado en silencio**. Se
    añadió una ruta de respaldo directa al banco (`contenido/matematicas-8basico/preguntas.json`).
  - **Dependencia de formato:** el `fromBank.oa` debe calzar EXACTO con el banco (`"MA08 OA 0N"`,
    con espacios); si no, la práctica sale vacía y la lección se marca completa sin medir. Se
    validaron los 5 códigos contra las 603 preguntas del banco.
  - **Trap latente de Maestría:** una campaña con `capitulos:[]` haría `[].every()===true`; se dio
    `capitulos:[]` a la entrada `'mate'` y se blindó `asignaturaDificilCompleta` (hoy protegido por
    `DIF_ASIGS`, que excluye Matemáticas). Auditados los ~10 usos de `.capitulos`.
- **Verificado en el navegador (revisión final, recorrido real):** menú → campaña de Matemáticas
  → Números → lección de enteros de punta a punta (texto → recta interactiva → ejemplos → práctica)
  → queda ✓, se abre la siguiente, **el dominio se registró de verdad** (Matemáticas ya aparece en
  el mapa) y el **nivel "Enteros" del Reto quedó desbloqueado**. **Sin regresión**: Historia,
  Ciencias, Lenguaje y el Reto intactos. Sin errores nuevos de consola. (La prueba end-to-end creó
  un perfil anónimo de prueba en Supabase, de los que limpia "🧹 Limpiar perfiles de prueba".)
- **Cap 2 (Álgebra y funciones, OA06–10) — construido el mismo día (Plan 2).** Reusó el motor
  sin tocarlo: 3 widgets nuevos —`funcion` (recta f(x)=ax+b con deslizadores de pendiente e
  intercepto), `algebra` (fichas de términos: "x" y unidades) y `balanza` (ecuación como
  equilibrio)—; OA09 (inecuaciones) reusa el `recta` con intervalos. 5 lecciones (lenguaje
  algebraico, función lineal, ecuaciones, inecuaciones, función afín) y se activó el capítulo
  `mate-algebra` (se abre al completar Números). Verificado end-to-end, sin regresión.
  Plan: `docs/superpowers/plans/2026-08-21-camino-matematicas-cap2-algebra.md`.
  - **Dos bugs pre-existentes del motor de quiz, hallados en la revisión y corregidos** (afectaban
    a todos los modos, no solo a las lecciones): (1) el botón **"Continuar" quedaba siempre
    visible** porque `.btn{display:block}` anulaba el atributo `hidden` —permitía **saltar
    preguntas sin responder**, incluso en campañas, ensuciando la medición—; se corrigió con
    `.btn[hidden]{display:none}`. (2) `avanzar` **sin guard de reentrada** lanzaba un `TypeError`
    con doble toque en la última pregunta; se agregó `if(!Q||!Q.preguntas)return;`.
- **Cap 3 (Geometría, OA11–14) — construido el mismo día (Plan 3).** 3 widgets nuevos:
  `triangulo` (Pitágoras: triángulo rectángulo con los cuadrados de los catetos + la ecuación
  con números; escala adaptativa para que ternas como 6-8-10 quepan), `solido`
  (prisma/cilindro pseudo-3D con base/altura/radio y fórmula de volumen) y `transformacion`
  (figura y su imagen tras reflexión, traslación o rotación de 90° en el plano cartesiano). 4
  lecciones (área y volumen, teorema de Pitágoras, movimientos en el plano, componer
  transformaciones y simetría) y se activó el capítulo `mate-geometria`. Verificado end-to-end,
  sin regresión (los dos fixes del quiz del Cap 2 siguen en pie).
  Plan: `docs/superpowers/plans/2026-08-21-camino-matematicas-cap3-geometria.md`.
- **Cap 4 (Probabilidad y estadística, OA15–17) — construido el mismo día (Plan 4), cierra las
  4 unidades.** 3 widgets nuevos: `cajon` (diagrama de cajón: mín/Q1/mediana/Q3/máx),
  `barras` (gráfico cuyo eje puede empezar en un valor distinto de 0, para enseñar cómo un
  gráfico distorsiona —OA16 se juega mostrando los mismos datos con eje desde 0 y desde 90—) y
  `arbol` (principio multiplicativo n1×n2). 3 lecciones (cuartiles, lectura crítica de
  gráficos, principio multiplicativo) y se activó el capítulo `mate-datos`. Con esto Matemáticas
  queda con **las 4 unidades y sus 17 lecciones jugables**. Verificado end-to-end, sin regresión.
  Plan: `docs/superpowers/plans/2026-08-21-camino-matematicas-cap4-estadistica.md`.
- **Pasada de tildes del banco de Matemáticas (corregida).** La revisión había notado tildes
  faltantes en preguntas de OA15/OA16 ("cajon", "linea", "esta", "que"…), pese a estar el banco
  marcado como revisado. Se corrigió con una pasada verificada: 3 agentes revisores sobre las 603
  preguntas (los OA01–14 estaban limpios; el problema estaba concentrado en Estadística OA15–17),
  aplicando **solo cambios de acentuación** —verificados por script (el texto sin diacríticos debe
  quedar idéntico y sin cambios de ñ, así no se altera ninguna palabra, número ni la respuesta
  correcta) y revisados a mano los casos de criterio (el→él, esta→está, que→qué)—. **61
  correcciones** en ~30 preguntas; el re-escaneo queda en cero. La estructura del banco quedó
  intacta (603 preguntas, `correcta` y 4 opciones). Herramientas en el scratchpad de la sesión.
- **Ajustes finos (mismo día):** (1) la **práctica de las lecciones de Matemáticas subió de 3 a
  6 preguntas** (`fromBank.n` en `lecciones.json`; los 17 OA tienen 30 preguntas, sobra) — más
  práctica y más datos de dominio por objetivo. (2) **Acceso a la tienda desde Expediciones:** la
  tienda solo se alcanzaba por la barra inferior del juego (oculta fuera del mapa) y **no tenía
  botón "Volver" propio**; se agregó un botón "🛍️ Tienda de skins" al final de `scr-expediciones`
  (antes de Volver) y un "← Volver" a `scr-tienda` que regresa a donde se abrió (variable
  `tiendaOrigen`: Expediciones o el mapa del juego).
- **Panel del profesor — dos mejoras (`profesor.html`):** (1) **el curso ya no se contrae al
  agregar un alumno.** `pintarLista` reconstruía toda la lista con los `<details>` cerrados;
  ahora captura qué cursos y sublistas de alumnos estaban desplegados (por `data-cod`) y los
  restaura tras el re-render, así el acordeón solo se cierra cuando el profe lo toca. (2)
  **Carga masiva de alumnos:** en cada curso, un bloque plegable "➕ Cargar varios de una vez"
  con un `textarea` donde se pegan los nombres (uno por línea) y "Agregar todos"; recorre la
  lista llamando a la función existente `kimun_prof_alumno_agregar` (una por nombre, muestra
  progreso, informa cuántos se agregaron y cuáles fallaron). **Sin cambios en Supabase.**
  Verificado con backend simulado (stub de `SB.rpc`); la prueba real end-to-end queda del lado
  de Roberto.
- **Jefe Final "La Incógnita" ACTIVADO (mismo día) — cierra Matemáticas.** Roberto generó el
  arte (5 imágenes: villano, skin y 3 portadas de capítulo) y Claude lo procesó con
  `scripts/procesar-lote7.py` (fondo blanco quitado por inundación, recorte, cuadrado, 512/384
  px; originales en `assets/originales/`). Las 3 portadas nuevas (`portada-mate-numeros/
  geometria/datos.png`) se usan solas; los capítulos ya no caen al fallback. Se registró la skin
  `kimun-matematico` en `SKINS` y la insignia `maestro-matematica` en `INSIGNIAS`; se dibujó el
  **nodo del Jefe Final** en `renderCampañaMate` (helper `campañaMateCompleta`: se abre al
  completar las 4 unidades) y se ramificó `iniciarJefeFinal` para que la campaña de lecciones
  cargue el banco de Matemáticas con `cargarPoolMate` (el motor asumía una expedición, y
  Matemáticas tiene `capitulos:[]`). El resto del motor del jefe ya era genérico. **Verificado
  en `?qa=1`:** intro con el villano → 16 aciertos → "¡Matemáticas dominada!" con las 4
  recompensas (skin equipable, insignia, corona, +500🪙/+300 XP), sin errores.
- **Pendientes:** portadas propias por capítulo de las OTRAS asignaturas (opcional); los dos
  trámites (INAPI y `vulpo.cl`), SMTP, la vuelta manual para decidir la v1.

### Sesión 30 (2026-08-21) — Vocabulario y Lectura del colegio
Dos módulos de estudio complementarios al plan, con flujo brainstorming → spec → plan →
subagentes. Specs/planes en `docs/superpowers/*/2026-08-21-vocabulario-y-lectura*`. Todo
data-driven sobre el motor de quiz existente (no se tocó el motor).
- **Decisiones (Roberto):** Vocabulario = quiz de opción múltiple; Lectura dividida por tramos
  de tiempo; Lectura como **módulo aparte** (biblioteca, crecerá con más libros) y Vocabulario
  **dentro de Lenguaje**; palabras de **todo el curso** (4 asignaturas + lecturas); contenido
  **generado con agentes**.
- **Derechos de autor:** la Lectura **no reproduce texto del libro** — el alumno lee el libro
  físico (edición Nube de Tinta) y el juego solo hace **preguntas de comprensión originales**.
- **Contenido (agentes en paralelo, `revisada:false`):** `contenido/vocabulario/preguntas.json`
  (**100 palabras**, 20 × VOC-HIST/CIEN/MATE/LENG/LECT) y `contenido/lectura-anafrank/`
  (`libro.json` con 8 tramos + `preguntas.json` con **72** preguntas, 9 × AF-T1…T8). **Catch de
  calidad:** los agentes dejaron la correcta casi siempre en posición 0/1 → se **barajaron las
  opciones** de ambos bancos (como `consolidar-pool`) para repartir en las 4 posiciones.
- **OA de apoyo:** las preguntas usan códigos `VOC-*` y `AF-T#` (no OA oficiales). Guard en
  `registrarOA`: los prefijos `AF-`/`VOC-` **no entran al mapa de dominio** del profesor.
- **Integración (`index.html`):** expediciones `voc-general` (5 etapas) y `lect-anafrank` (8
  tramos); módulo **📖 Lectura** (biblioteca, `LIBROS`, `abrirBiblioteca`, `scr-biblioteca`)
  como tarjeta extra en `renderExpediciones`; **Lenguaje** abre un landing (`scr-lenguaje`) con
  **Campaña** y **Vocabulario** (`abrirLenguaje`). Reusa `entrarExpedicion`/quiz sin cambios.
- **Arte (3 portadas 512px):** `portada-lectura.png` (zorro en biblioteca), `portada-voc-general.png`
  (zorro + palabras) y `portada-lectura-anafrank.png` (el diario a cuadros con candado y castaño —
  **respetuoso, sin mascota**, por el tema histórico). Originales en `assets/originales/`.
- **Verificado en el navegador:** pools cargan (20/origen, 9/tramo), se juega una etapa de cada
  módulo, las 3 portadas cargan 200, el dominio no se contamina, sin errores de consola. Spot-check
  factual del tramo final de Ana Frank correcto (Bergen-Belsen, tifus, delación incierta, Otto).
- **Fix (botón Volver):** el mapa (`scr-mapa`) ocultaba el botón `btnMapaCamp` para expediciones
  **sin campaña**, así que Vocabulario y Ana Frank quedaban sin salida; y su `onclick` caía por
  error a `CAMP_ACT`. Ahora el botón se muestra siempre ("← Volver a la campaña" en campañas,
  "← Volver" en el resto) y enruta explícito por contexto en `renderMapa`: campaña → `scr-campana`,
  `voc-general` → `scr-lenguaje`, Lectura → `scr-biblioteca`, resto → `scr-expediciones`.
- **Ajustes post-feedback de Roberto:** (1) **Vocabulario ampliado a 30 palabras por área**
  (150 total; agente `vocab-mas` generó 10 nuevas por origen sin repetir, ids `voc-*-1NN`; se
  fusionaron y **se barajaron todas** las opciones), y cada ronda ahora manda **15 al azar**
  (`n:15` en las 5 etapas). (2) **Portadas rehechas al estilo del juego** (zorro de frente con
  lentes redondos, marco circular, tono crema): `portada-lectura.png` (zorro con bufanda +
  libro en biblioteca), `portada-voc-general.png` (zorro + libro + letras flotantes) y
  `portada-lectura-anafrank.png` (diario a cuadros ilustrado, cálido y respetuoso, **sin
  mascota** por el tema). Las primeras versiones desentonaban (estilos mezclados / realista).
- **Pendientes:** **aprobación pedagógica** de los 2 bancos nuevos (nacen `revisada:false`);
  sin cambios en el resto respecto a la Sesión 29.

### Sesión 31 (2026-08-22) — Capa de expedición para Matemáticas, tiempos y barajado
Tres frentes; el grande con flujo brainstorming → spec → plan → subagentes (implementador +
revisor por tarea + revisión final). Spec y plan en
`docs/superpowers/{specs,plans}/2026-08-22-matematicas-expedicion*`.
- **Capa de expedición para Matemáticas (Opción B):** Matemáticas deja de ser solo "camino de
  aprendizaje". El mapa de campaña ahora **intercala por unidad enseña→desafío**: la lección
  (mini-clase) y a continuación su **expedición** (`mate-exp-numeros`, `-algebra`, `-geometria`,
  `-datos`), que reta lo aprendido usando el **banco de año completo (603)**. El **Jefe Final
  "La Incógnita"** ya **no se abre al completar las lecciones sino al vencer las 4 expediciones**;
  conserva sus recompensas (skin "Vulpi Matemático" + insignia "Maestro de las Matemáticas" +
  corona + bono). Nueva insignia 🔥 **`dif-matematicas`** por vencer las 4 expediciones en **Modo
  Difícil**. La **Maestría Total no cambia**: sigue siendo Historia + Ciencias + Lenguaje (en
  Difícil) + El Autómata. Portadas: las expediciones **reutilizan la portada de su unidad**
  (`assets/portada-<cap>.png`) para no pedir un asset inexistente (evita el 404 de
  `portada-<exp.id>.png`).
- **Ajustes de tiempo y longitud:** quiz Normal **15→20 s**, Difícil **10→15 s**
  (`tiempoInicial`). Reto de Cálculo con **tiempo fijo de 20 s** que **no baja con la dificultad**
  (`calcTiempo(){return 20}`) y **Sin Fin 20 s**; Jefe de Cálculo **El Autómata 6→15 s**. Las
  **lecciones de Matemáticas pasan de 6 a 10 preguntas** de práctica.
- **Barajado de los bancos de apoyo:** Vocabulario (**150**) y Ana Frank (**72**) se barajaron con
  colocación **balanceada** (respuesta correcta ~25% en cada posición), preservando `revisada:false`.
- **Cuidado con saves existentes:** como La Incógnita ahora exige las 4 expediciones, un alumno que
  tenía todas las lecciones pero no había vencido a La Incógnita la verá **re-bloqueada** hasta
  limpiar las 4 expediciones (por diseño; quien ya la venció conserva su corona).
- **Reparto disparejo de OA (evaluado, se deja como está):** Ciencias U1 (~50 preg/OA) y varios OA
  de Lenguaje (~47) sobresalen del piso de 30, pero **son `revisada:true`** y el desajuste es
  **invisible** en el juego (saca 10 al azar) y en el tablero (topa la cobertura). Se decidió **no
  tocarlos**: recortar borraría preguntas ya aprobadas y bajaría la variedad del pool.
- **Estado:** todo en `main` (commits hasta `0877600`). **Pendiente (Roberto):** aprobación
  pedagógica de los 2 bancos de apoyo (`vocabulario` 150 y `lectura-anafrank` 72, `revisada:false`)
  → flujo tablero → `aplicar-revisadas`.

### Sesión 32 (2026-08-22) — Más preguntas por etapa, Lectura con look propio y presentación v1
Preparando la v1. Se registró la Sesión 31 en la bitácora (commit aparte) y luego:
- **Más preguntas por etapa (afinamiento de dificultad):** las etapas de campaña pasan de **6 a
  10 preguntas** por OA (Historia, Ciencias, Lenguaje y las 4 `mate-exp-*`), así una expedición
  es **40 preguntas + jefe**. El **jefe de cada expedición** pasa de **8 a 15**. El **Modo Difícil**
  se iguala a **10 / 15** (la dificultad la dan el tiempo 15 s y el umbral 80%). Umbrales y estrellas
  se calculan por **ratio**, así que se ajustan solos (66% ahora = 7/10). Cambios en `EXPEDICIONES`
  (`n:6→10`, `n:8→15`) y en `nPreguntas` (Difícil `?15:10`).
- **No se tocaron:** Vocabulario (sigue **15** al azar por ronda) ni **Ana Frank** (solo **9**
  preguntas por tramo → no alcanza para 10; queda en 6). El sorteo `pickN` hace *clamp* con
  `slice(0,n)`, así que pedir de más nunca rompe. Todas las OA de los 4 bancos tienen **≥28**
  preguntas, holgura para sacar 10. **Los Jefes Finales de campaña multi-fase** (El Guardián, La
  Entropía, El Borrón, La Incógnita = 4 fases × 4) **no cambiaron**: son otra estructura; solo se
  tocó el jefe del 5.º nodo de cada expedición.
- **Lectura con apariencia propia (juego + presentación):** la biblioteca (`#scr-biblioteca`) deja
  el cosmos violeta y estrena un **tema de papel cálido** (crema/sepia, título marrón, tarjetas tipo
  libro con **lomo** café); el acceso "📖 Lectura" de la lista lleva un lomo cálido (`.bib-entry`)
  para distinguirse de las asignaturas. Verificado por estilos computados y sin errores de consola.
- **Presentación ejecutiva (artefacto):** dossier visual de la v1 (asignaturas, expediciones,
  tiempos, banco de 2.536 preguntas, estilo de jefes, y capítulos especiales de Matemáticas y
  Lectura), en el mundo visual del juego. Vive como artefacto de Claude (privado), fuera del repo.
- **Pantalla de derrota del Jefe Final:** la derrota contra un Jefe Final de campaña lanzaba un
  **`alert()` nativo** (feo). Ahora hay una **pantalla temática** (`scr-jefe-lose` +
  `renderJefeDerrota`) que conserva la atmósfera carmesí (`en-jefe`): villano ilustrado, titular
  dinámico ("¡Casi lo logras!" si daño ≥70%, si no "¡Buen intento!"), **barra de daño al jefe** con
  %, **fase alcanzada**, y botones **⚔️ Reintentar** / **← Volver a la campaña**. Cada villano tiene
  además su **frase de derrota propia** (campo `derrota` en su `jefeFinal`, en su voz). El Autómata
  del Reto de Cálculo ya tenía su propia pantalla (sin cambios). Verificado en el navegador con los
  4 villanos (imágenes cargan, barra anima, sin errores de consola).
- **Victoria épica contra el Jefe Final (brainstorm → spec → plan → ejecución):** al vencer un
  Jefe Final, en vez de saltar directo a las recompensas se intercala una **mini-cinemática de 2
  tiempos**. **Tiempo 1** (overlay `#jefe-caida`, ~3 s, carmesí): el villano hace *swap* de su
  imagen de combate a su **arte "derrotado"** con destello + temblor, cae y se apaga, texto
  "¡{villano} ha sido derrotado/a!" (concuerda en género), y arranca la **música de victoria**;
  auto-avanza y es saltable con tap. **Tiempo 2** (`scr-jefe-win`): confeti dorado + recompensas
  que aparecen escalonadas, con la música siguiendo. Datos: campo `villanoImgDerrotado` por villano
  y pista `victoria` en `MUSIC` (con `scr-jefe-win`→`victoria` en `contexto`; el volver retoma
  `menu`). *Fallback*: sin arte derrotado → imagen normal atenuada; sin música → silencio. Respeta
  `prefers-reduced-motion`. Spec/plan en `docs/superpowers/{specs,plans}/2026-08-22-victoria-jefe-final*`.
- **Assets de la victoria (Roberto generó, Claude procesó):** 4 imágenes `villano-{historia,ciencias,
  lenguaje,matematicas}-derrotado.png` (512px, originales crudos en `assets/originales/`), y la
  música **`musica-victoria.mp3`** = "Hero Theme" de **Kevin MacLeod** (Incompetech, CC BY 4.0),
  recortada a mono 96 kbps / 216 KB. Verificado en el navegador (arte real sin fallback, música
  carga, confeti, sin errores).
- **Jefes Finales de campaña: quedan igual** (decisión de Roberto) — su tamaño de preguntas
  (4 fases × 4) NO cambió con el ajuste general a 10/15 de las etapas/jefes de expedición.
- **Pendiente (Roberto):** aprobación pedagógica de los 2 bancos de apoyo (sin cambios).

### Sesión 33 (2026-08-23) — Revisión profunda multi-agente: 9 bugs + reequilibrio de economía
Se lanzó una **revisión estática con 7 agentes** (workflow: 6 revisores por dimensión —navegación,
progresión, motor, economía, datos, robustez— + 1 senior que dedupe/verifica contra el código).
Reportó **9 bugs confirmados, 0 descartados**. Se arreglaron los 9, más el reequilibrio de economía.
Todo verificado en el navegador (sin errores de consola).
- **Bug reportado por Roberto (volver desde Matemáticas salía a Historia): CONFIRMADO y arreglado.**
  El ✕ del quiz (`btnBack`) solo distinguía `Q.desafio` y caía en `scr-mapa`, que se dibuja según
  `EXP_ACT` (que quedaba "pegado" en la última expedición, por defecto Historia). Ahora enruta por
  `Q.leccion` → `volverAlCapituloMate()`.
- **Otros 8 bugs:** (2) la **barra inferior** dejaba el timer del quiz corriendo de fondo → nuevo
  `detenerTimersActivos()` en su handler; (3) **re-vencer el Jefe Final** re-otorgaba +500🪙/+300XP →
  bono solo la primera vez; (4) el **Duelo local** se rompía tras jugar otra asignatura (dependía del
  POOL global) → ahora carga su **propio banco de Historia** (`cargarPoolDuelo`); (5) el ✕ tras
  acertar no cancelaba el `setTimeout(avanzar)` → se guarda/cancela `Q._avanzarT` + guard de pantalla
  en `avanzar`; (6) **Reto de Cálculo** dejaba un `setTimeout` huérfano al salir → `RC._resolveT`
  guardado/cancelado + guard de pantalla; (7) el **Modo Difícil se desbloqueaba en Lectura/Vocabulario**
  → ahora solo si la última etapa es un **BOSS real** (`oa==='BOSS'`); (8) el **Jefe Final** crasheaba
  si el banco no cargó → valida el POOL antes de arrancar; (9) volver del **Reto de Cálculo** iba a
  Expediciones → ahora a la campaña de Matemáticas.
- **Economía reequilibrada (con el cambio 6→10/8→15, las monedas subieron +33-50%):**
  - **Precios de tienda +~38%** (`SKINS`): total **7.140 → 9.830🪙**, la más barata 80→**110**. Vuelve a
    exigir terminar el contenido para "comprarlo todo".
  - **Guard de primera vez (anti-farmeo):** repetir una etapa/lección ya superada paga **+1🪙 / ~25% XP**
    (vs. +5🪙 / XP completo la primera vez); el bono de estrellas no se paga en repeticiones. Frena el
    farmeo de monedas y la inflación del XP del ranking. El primer clear en Modo Difícil paga completo.
    (`Q.repetida` en `startQuiz`/`iniciarPracticaLeccion`; aplicado en `responder`/`terminarNivel`.)
  - *No tocado:* `XP_POR_NIVEL` (cosmético) y la propiedad muerta `bonoMult:2` del desafío (queda por
    decidir: implementarla como bono ×2 o eliminarla).
- **Pendiente (Roberto):** aprobación pedagógica de los 2 bancos de apoyo (sin cambios).

### Sesión 34 (2026-08-23) — Informe de estado v0.99 y ejecutivo para el colegio
Sesión de documentación; **sin cambios en el juego** (`index.html`/`profesor.html` intactos). Único
archivo nuevo en el repo: `docs/informe-v0.99.md`.
- **Informe integral v0.99 (`docs/informe-v0.99.md`):** documento de estado con datos **verificados
  contra el repositorio** (no de memoria): banco de **2.536** preguntas (Historia 663 / Ciencias 534 /
  Lenguaje 514 / Matemáticas 603 / Vocabulario 150 / Ana Frank 72), **69 OA**, tienda **9.830🪙** (19
  skins), 4 Jefes Finales, las 9 bugs de la S33, etc. Lleva la mascota Vulpi y una tira de 3 skins
  (científico/karateka/ciclista) con rutas relativas a `assets/`. Publicado también como **artefacto
  privado de Claude** (fuera del repo): `https://claude.ai/code/artifact/775a6046-b767-4cf7-9ae3-72b4edefcb75`.
- **Ejecutivo para enviar (profesor/apoderado/director):** una carilla en tono **no técnico**, con
  tronco común + **secciones por rol**, ilustraciones de Vulpi (hero + tira de skins) y contacto
  **vulpochile.app@gmail.com / +569 7668 4967**. Entregado como **artefacto HTML**
  (`https://claude.ai/code/artifact/208dd6cb-b155-408e-9b47-4d72b81e63b5`) **+ PDF** de 2 páginas A4
  (generado con Chrome headless; vive fuera del repo). *Contacto oficial del proyecto:* correo
  `vulpochile.app@gmail.com`, teléfono `+569 7668 4967`.
- **Pendiente (Roberto):** aprobación pedagógica de los 2 bancos de apoyo (sin cambios). Opcional de
  código sigue igual: decidir sobre `bonoMult:2`.

### Sesión 35 (2026-08-23) — Correos a los profesores + nueva mascota Vulpi
Continuación de la difusión; **sin cambios en el juego**. Único archivo nuevo en el repo:
`assets/vulpi.png` (el resto —ejecutivo, correos, firmas— vive fuera del repo, en artefactos/PDF/PNG).
- **Ejecutivo v2:** se le agregó una **banda de las 4 asignaturas** (Vulpi historiador/científico/
  escritor/matemático) en la portada y la **firma Roberto Lorca · Creador de VULPO**; quedó en 2 págs
  A4 (se quitó la tira de skins por espacio). Mismo artefacto/URL de la S34.
- **4 correos a los profesores de las 4 asignaturas** (Historia—Jorge Arteaga, Ciencias—Rossy Pérez,
  Lenguaje—Ana María Ganga, Matemática—Katherinne Rivas): invitación a probar + feedback, tono formal
  (usted), datos por asignatura, **Vulpi temático junto al saludo** y **firma común**. Artefacto:
  `https://claude.ai/code/artifact/19fca985-7d2c-4776-b53c-79f21008da88`. *Ojo:* el correo de Katherinne
  venía con doble `@` en la planilla → se usó `katherinne.rivas@desales.cl` (verificar).
- **Nueva mascota Vulpi (guardada en el repo):** zorro **adolescente/juvenil** con hoodie violeta-naranjo
  y el nombre "Vulpi", generado con GPT-Image (referencia de identidad `kimun-feliz`), fondo transparente
  1254×1254 → **`assets/vulpi.png`**. Se usa en la **firma** de los correos. Se preparó además una
  **firma-imagen** (Vulpi + texto en la tipografía de marca) y PNGs sueltos para Gmail, todo fuera del repo
  (carpeta `Escritorio/VULPO - correos profesores`).
- **Cargo/identidad de marca:** Roberto usa el cargo **"Creador de VULPO"**; correo `vulpochile.app@gmail.com`,
  teléfono `+569 7668 4967`.
- **Pendiente (Roberto):** aprobación pedagógica de los 2 bancos de apoyo (sin cambios); enviar los 4
  correos; trámites de lanzamiento (INAPI, vulpo.cl). Opcional de código: `bonoMult:2`.

### Sesión 36 (2026-08-24) — Foto semanal del desempeño (implementada, sin aplicar) y spec de roles
Sesión larga y de dos caras: **comercial** (precio, propuesta, guion) y **técnica** (dos diseños nuevos,
uno de ellos ya implementado). **El juego no se tocó**: `index.html` y `profesor.html` quedaron intactos.

- **Modelo de negocio y material comercial** (todo fuera del repo, en artefactos y en
  `Escritorio/VULPO - correos profesores`):
  - **Precio definido:** licencia anual **$10.000 por alumno**, con tarifa **Colegio Fundador $6.000**
    para los primeros colegios, y **piloto gratis de un semestre**. Valores netos + IVA.
  - **Propuesta comercial** para el **Colegio San Francisco de Sales** (el de Ignacio) y **guion de
    reunión de 15 minutos** para la dirección/UTP, ambos en PDF.
  - Forma legal recomendada para vender: **SpA** por Empresa en un Día, factura electrónica.
- **Curso demo para mostrar el panel:** script `seed-curso-demo.sql` que puebla un curso con **26
  alumnos** y ~1.270 filas de dominio, con OA flojos a propósito y participación realista (20 de 26
  jugaron esta semana, 3 nunca entraron). Se sembró en el curso **CUR-BA04**, asignado a
  `profe-prueba@vulpo.cl`. El script vive fuera del repo.
- **Recuperación del acceso de administrador.** El enlace de recuperación de Supabase apunta a
  `localhost:3000` (Site URL sin configurar), así que no sirve; la contraseña se fijó por SQL sobre
  `auth.users`. **Cuenta admin: `vulpochile.app@gmail.com`.** El bloqueo suave del panel Admin del
  juego sigue siendo `112358` (`scripts/generar-tablero.py`).
- **Spec aprobado (sin implementar): roles por asignatura.**
  `docs/superpowers/specs/2026-08-23-roles-por-asignatura-design.md`. Un curso pasa de tener **un**
  profesor (`cursos.profesor_id`) a un **equipo**: tabla `curso_profesores` con rol (`jefe` /
  `asignatura`) y un arreglo de asignaturas, más `kimun_prof_acceso` y `kimun_prof_asignaturas` en
  reemplazo de `kimun_prof_es_mio`. Incluye ranking por asignatura (% de primer intento, mínimo 20
  respuestas) y el mapa OA→asignatura (el vocabulario sigue a su materia; Ana Frank va a Lenguaje).
  **Detectó dos bugs que ese trabajo arreglará:** no se puede lanzar refuerzo de **Matemática**
  (`profesor.html:664` lista solo Historia/Ciencias/Lenguaje), y conviven **dos convenciones** de
  asignatura (el filtro usa `HI08`, el botón de refuerzo manda `"Historia"`).
  **Siguiente paso: escribir su plan de implementación.**
- **Implementado: foto semanal del desempeño** (spec + plan + código, 6 commits).
  `dominio` solo guarda acumulados, sin historial, así que hoy es imposible responder "¿cómo le fue al
  curso la semana pasada?". Se agregaron `dominio_semanal` y `xp_semanal` (RLS activo, sin políticas),
  la función `kimun_foto_semanal()` con retención de 2 años, el `revoke` de permisos y el trabajo
  `foto-semanal` de **pg_cron** (lunes 04:05 UTC = 00:05/01:05 del lunes en Chile). Ver la sección
  "Foto semanal del desempeño" más arriba en este archivo.
  - **Una revisión final multi-agente cazó un bug crítico** que ninguna revisión por tarea podía ver,
    porque nacía del cruce entre dos: los `delete` de retención calculaban el corte desde `s`
    (controlado por quien llama), así que `kimun_foto_semanal('2030-01-01')` habría **borrado todo el
    historial**. Corregido: el corte se calcula desde `now()`. También se amplió el `revoke` a `anon` y
    `authenticated` (Supabase suele darles execute directo por default privileges).
- **⚠️ PENDIENTE Y BLOQUEANTE: la foto semanal NO está aplicada ni verificada.** El código está en el
  repo, pero nadie lo ha ejecutado contra Supabase. Para dejarlo andando hay que, en este orden:
  1. Habilitar la extensión **`pg_cron`** (Supabase → Database → Extensions).
  2. Pegar `supabase/schema.sql` **completo** en el SQL Editor y ejecutarlo.
  3. Correr `verificar-foto-semanal.sql` (en `Escritorio/VULPO - correos profesores`). **El paso 9 es
     obligatorio:** `select count(*) from cron.job where jobname='foto-semanal';` debe dar **1**. Si da
     0, `pg_cron` no estaba habilitado y el trabajo no quedó agendado — y el pegado **no da ningún
     error** que lo delate (es a propósito, para que una migración nunca falle a medias).
  4. El lunes siguiente, confirmar que apareció una segunda semana sin intervención.
  Mientras no se haga, **cada semana que pasa se pierde para siempre**: el historial no se puede
  reconstruir hacia atrás.
- **Menores diferidos de la foto semanal** (decisión consciente, no olvido): agregar una columna
  `tomada timestamptz` para distinguir una semana saltada de una normal; un índice por `perfil_id` en
  `xp_semanal`; y evaluar cambiar `security definer` por `invoker` en la función.
- **Pendiente (Roberto):** aplicar y verificar la foto semanal (arriba); aprobación pedagógica de los 2
  bancos de apoyo; enviar los 4 correos a los profesores; trámites de lanzamiento (INAPI, vulpo.cl).

### Sesión 37 (2026-08-24) — Roles por asignatura (backend + panel implementados)
Un curso deja de tener un único profesor y pasa a tener un **equipo**: un Profesor Jefe (ve
todo) y profes de asignatura (ven y refuerzan lo suyo). Se hizo con el flujo completo
brainstorming (previo) → spec aprobado → plan → ejecución por subagentes (un implementador por
fase + revisión de spec y calidad). El juego (`index.html`) casi no se toca; el trabajo vive en
`supabase/schema.sql` y `profesor.html`.
- **Sincronización de arranque:** este PC estaba en Sesión 29; `git pull` (orden 99) lo llevó a
  Sesión 36 (foto semanal, mascota Vulpi, informe v0.99, specs de foto semanal y de roles).
  Fast-forward limpio.
- **Plan:** `docs/superpowers/plans/2026-08-24-roles-por-asignatura.md` (15 tareas, 3 fases).
  Spec: `docs/superpowers/specs/2026-08-23-roles-por-asignatura-design.md`.
- **Backend (`supabase/schema.sql`):** tabla `curso_profesores` (membresía por curso+profesor,
  con `rol` y `asignaturas[]`) e índice único de Jefe; `kimun_oa_asignatura` (mapa OA→asignatura,
  que hace visibles Vocabulario y Lectura); `kimun_prof_es_mio` redefinida a "admin o Jefe" (las
  destructivas la heredan) más `kimun_prof_acceso` y `kimun_prof_asignaturas`; lecturas y refuerzo
  ajustados para filtrar/validar por asignatura; `kimun_prof_listar` con rol y asignaturas por
  curso; gestión de equipo (`kimun_prof_equipo`/`_asignar`/`_quitar`); ranking por asignatura
  (`kimun_prof_ranking_asignatura`). Migración idempotente: dueños actuales → Jefe y
  `desafios.asignatura` normalizada a código. Ver la sección Backend arriba.
- **Panel (`profesor.html`):** asignatura canonizada al código de 4 letras, lo que arregla **dos
  bugs reales**: no se podía lanzar refuerzo de Matemática (la lista y el mapa omitían `MA08`), y
  convivían dos convenciones (el filtro usaba `HI08`, el botón mandaba `"Historia"`). Bloques
  nuevos "Equipo del curso" (alta por correo con casillas de materias, cambio de Jefe, baja) y
  "Ranking por asignatura" (con el grupo "aún sin datos suficientes" al final y la cobertura
  OA leída de `oa.json`). Los botones destructivos (🗑️, ✎, ✕, agregar alumno, reiniciar
  mediciones) **no se dibujan** para un profe de asignatura, y el servidor igual los rechaza.
- **Regresión descubierta en revisión y corregida (`index.html`, 13 líneas):** el juego lee
  `desafios.asignatura` para el banner y el título del refuerzo **y** para elegir el banco de
  preguntas (`contenidoDeAsignatura`, que busca por NOMBRE). Al normalizar ese campo a código, el
  refuerzo habría quedado **injugable** ("No se pudo cargar el desafío") para todas las
  asignaturas, no solo con texto feo. Se agregó `ASIG_DESAFIO_NOMBRE` (código→nombre) y
  `asigDesafioNombre()`, usados en `revisarDesafio`, `jugarDesafio` y `construirPreguntasDesafio`;
  tolera también el nombre antiguo. Verificado en el navegador: las cuatro asignaturas resuelven a
  su banco (incl. Matemática → `matematicas-8basico`) y un desafío de Matemática arma 12 preguntas
  reales, sin errores de consola.
- **Verificado hasta donde se puede sin credenciales:** backend por revisión de código
  (coherencia, idempotencia, grants/revokes, split de porteros); panel en el navegador con stub de
  `SB.rpc` (equipo, ranking, ocultar destructivo, sin desborde a 375 px); juego en el navegador.
- **Pendiente (Roberto), lo BLOQUEANTE de esta feature:** aplicar `schema.sql` completo en el SQL
  Editor y correr la prueba end-to-end del spec (Task 14, 9 pasos) con dos cuentas reales de
  profesor —aislamiento por asignatura, rechazo en el servidor de una asignatura ajena, rotación
  sin pérdida de datos, quitar al Jefe—. Es lo único que necesita credenciales de Supabase.
- **Pendiente (arrastre):** la foto semanal (aún sin aplicar); aprobación pedagógica de los 2
  bancos de apoyo; los 4 correos a los profesores; trámites de lanzamiento (INAPI, vulpo.cl).

### Sesión 38 (2026-08-24) — Roles por asignatura aplicado + jerarquía de 4 roles
Dos bloques: se **aplicó y verificó en producción** la feature de roles por asignatura de la
Sesión 37, y sobre ella se diseñó e implementó una **jerarquía de cuatro roles**.
- **Roles por asignatura, aplicado y probado end-to-end (Roberto + Claude).** Roberto pegó el
  `schema.sql` en Supabase. Se verificó la estructura (tabla, migración dueños→Jefe, normalización
  de `desafios.asignatura`, grants). Para la prueba se crearon cuentas de profesor de prueba
  saltando el correo de confirmación (que a un `@vulpo.cl` falso nunca llega): se crean en
  **Authentication → Users** (nacen confirmadas) o, si se usó el registro del panel, se confirman
  por SQL (`update auth.users set email_confirmed_at = now()`). Se armó el equipo de `CUR-BA04`
  (`profe-prueba` Jefe; prueba2/3/4/5 en Historia/Ciencias/Matemática/Lenguaje). **Aislamiento
  confirmado desde el navegador:** como `profe-prueba4` (Matemática), `kimun_prof_refuerzo_lanzar`
  y `kimun_prof_ranking_asignatura` sobre **HI08** devolvieron **400 `no_autorizado`**, y sobre
  **MA08** (su materia) 200 con datos. El rechazo es del servidor, no cosmético. **Nota de
  operación:** el correo de recuperación/confirmación de Supabase es poco fiable (apunta a
  localhost y hay límite de 2/hora); crear/confirmar cuentas por el panel + SQL es el camino.
- **Jerarquía de 4 roles (Admin ▸ SuperUsuario ▸ Profe Jefe ▸ Profe Asignatura).** A pedido de
  Roberto tras probar el equipo. Flujo brainstorming → spec → plan → subagentes. Decisiones:
  **Admin = Roberto** (dueño de la plataforma), **SuperUsuario = autoridad del colegio** (UTP/
  dirección) que administra todos los cursos por ahora (**sin entidad "Colegio"**, que queda para
  cuando entre un segundo colegio); solo Admin/Super crean cursos y nombran Jefes; el Jefe solo
  agrega/edita profes de asignatura y ya **no puede borrar el curso**; un profe de asignatura **no
  crea cursos**. Modelo: `profesores.es_super` + portero `kimun_prof_admin_colegio` +
  `kimun_prof_super_fijar` (solo Admin). El encabezado del panel muestra **usuario · rango ·
  cursos** (Profesor: "8°A (Jefe) · 8°B (Matemática, Ciencias)"). Detalle en la sección Backend y
  en `docs/superpowers/specs/2026-08-24-jerarquia-roles-usuarios-design.md` /
  `docs/superpowers/plans/2026-08-24-jerarquia-roles-usuarios.md`.
  - **Verificado hasta donde se puede sin credenciales:** backend por revisión de código
    (porteros con `es_super`, `curso_crear` sin auto-Jefe, `equipo_asignar`/`_quitar` con la
    validación correcta de Jefe, `quitar` que protege a Admin/Super, `super_fijar` solo del Admin);
    panel en el navegador con stub de `SB.rpc` (encabezado, ocultar crear/borrar curso al Jefe,
    equipo sin opción "Jefe" ni ✕ del Jefe para un Jefe con ✎ que precarga, Administración para el
    Super sin el toggle Super ni Limpiar).
  - **Pendiente (Roberto):** aplicar el `schema.sql` nuevo y la prueba end-to-end (spec, Task 9):
    nombrar Super a una cuenta, confirmar que el Jefe no ve crear/borrar/nombrar-Jefe, y que el
    servidor rechaza a un Jefe intentando crear curso o nombrar Jefe.
- **Pendiente (arrastre):** la foto semanal (aún sin aplicar); aprobación pedagógica de los 2
  bancos de apoyo; los 4 correos a los profesores; trámites de lanzamiento (INAPI, vulpo.cl).

### Sesión 39 (2026-08-24) — Auditoría de identidad y permisos (pre-v1.0) + 8 correcciones
Camino a la v1.0, se hizo una **auditoría general de usuarios, profesores y superusuarios** con
tres revisores en paralelo (escalada de privilegios · fuga de datos/credenciales · consistencia
cliente-servidor), y cada hallazgo se **verificó a mano contra el código** antes de actuar. Todo
el trabajo vive en `supabase/schema.sql` y `profesor.html`; el juego (`index.html`) no se tocó.
- **Lo que la auditoría confirmó sólido:** no hay escalada de privilegios (ni una sesión anónima
  llega a profesor, ni un profe de asignatura a Jefe, ni un Jefe a Super, ni un Super toca a un
  Admin); la interfaz nunca es el único guardia (cada acción oculta en el panel la rechaza también
  el servidor); RLS sin políticas de lectura en el resto de las tablas; último-Admin blindado.
- **8 correcciones aplicadas** (5 de correctitud/seguridad + 3 decisiones de Roberto):
  1. **RLS ausente (ALTO):** `desafios` y `desafio_resultados` eran las únicas 2 de 14 tablas sin
     `enable row level security` → con la clave pública se leían/escribían directo (puntajes de
     menores, forjar/borrar resultados). Se activó RLS en ambas.
  2. **`kimun_prof_curso_asignar` roto:** escribía `cursos.profesor_id` (columna deprecada que
     ningún portero lee) → reasignar un curso huérfano no daba acceso. Ahora crea la membresía de
     Jefe; portero a `admin_colegio`.
  3. **Conteo de cursos obsoleto:** `kimun_prof_profesores` contaba por `profesor_id` (0 para todo
     Jefe nuevo) → ahora cuenta membresías en `curso_profesores`.
  4. **`kimun_prof_refuerzo_estado`** no filtraba por asignatura → un profe de asignatura veía el
     estado agregado de un refuerzo de otra materia. Corregido.
  5. **Enumeración por diferencia de error:** `kimun_prof_alumno_quitar`/`_xp_fijar` respondían
     distinto si el `ALU-` existía; unificados a `no_autorizado`, como las funciones con código de
     curso.
  6. **`kimun_jugadores` (decisión):** acotada al **mismo curso** (+bots), no a toda la plataforma
     → deja de exponer los nombres de todos los menores a cualquier cliente con la clave pública;
     se sigue pudiendo retar por código de amigo.
  7. **Credencial del alumno (decisión):** el `codigo_acceso` solo se entrega a Jefe/Super/Admin;
     el profe de asignatura recibe `null`. El panel identifica al alumno por su **id de perfil**
     (`kimun_prof_listar` agrega `pid`; `kimun_prof_dominio_alumno` pasa a recibir el id, no la
     credencial). Verificado en el navegador que la lista y la ficha por alumno funcionan en los
     dos roles.
  8. **Gestión de profesores (decisión):** botón de **revocar profesor / cancelar invitación** en
     Administración (Admin a cualquiera salvo Admins y él mismo; Super solo a profes normales). La
     reasignación de un curso huérfano ya la cubría el bloque "Equipo del curso".
- **Verificado:** backend por revisión de código (no se corre SQL desde el asistente); panel en el
  navegador con stub de `SB.rpc` (credencial oculta al profe de asignatura, ficha por id, reglas de
  revocar). Sin errores de consola.
- **Panel responsivo en computador (solo `profesor.html`):** el panel del profesor se diseñó
  mobile-first (480px), pero lo usan adultos en notebook y quedaba angosto. Ahora se ensancha a
  **880px desde 760px de ancho** hacia arriba (bajo eso sigue en 480px); los campos y párrafos
  largos se acotan (inputs 460px, texto ~70ch) y las tablas/acordeones/filas de avance usan todo el
  ancho. El **juego (`index.html`) NO se tocó**: los alumnos siguen en 480px mobile-first, a
  propósito (juegan en el teléfono en vertical). Verificado por medición del DOM (móvil 375→480 sin
  desborde; escritorio 1280→880).
- **Tablero de avance mejorado (`scripts/generar-tablero.py`):** controles **"Expandir todo / Contraer
  todo"** (Expandir todo muestra todas las preguntas de una vez; Contraer todo deja **solo las
  asignaturas**), y ahora **asignaturas y unidades son plegables** (clic en su encabezado). Además, se
  crearon `contenido/vocabulario/oa.json` y `contenido/lectura-anafrank/oa.json` para que los **2
  bancos de apoyo aparezcan en el tablero** (antes no salían por no tener `oa.json`): Vocabulario
  (5 áreas, 150) y Lectura·Ana Frank (8 tramos, 72), ambos con **0 revisadas** — así se pueden
  revisar y cerrar su aprobación pedagógica. Esos `oa.json` solo los usa el tablero (el juego y el
  panel no los leen). Regenerar con `python scripts/generar-tablero.py`.
- **Pendiente (Roberto):** re-aplicar `schema.sql` en Supabase (incluye el cambio de firma de
  `kimun_prof_dominio_alumno` text→uuid, que los `drop` del archivo manejan). Quedan sin implementar
  (severidad baja) el rate-limit de `kimun_canjear` (fuerza bruta del `ALU-` impracticable, ~4.300
  millones) y otros límites conocidos del modelo (XP/dominio los reporta el teléfono; skins/campañas
  por dispositivo).
- **Runbook de la foto semanal (`docs/foto-semanal-aplicar.md`):** se dejó el procedimiento
  autocontenido para aplicarla y verificarla cuando haya datos reales (habilitar `pg_cron` →
  re-pegar `schema.sql` → confirmar `select count(*) from cron.job where jobname='foto-semanal'` = 1
  → sembrar la primera foto → confirmar el lunes siguiente). No se aplicó a propósito: hoy todo es
  data de prueba (`CUR-BA04`, cuentas `profe-prueba*`).
- **Aprobación de los 2 bancos de apoyo — HECHA.** Roberto aprobó Vocabulario (150) y
  Lectura·Ana Frank (72): se marcó `revisada:true` en todas sus preguntas (y el contador de nivel
  superior), y se regeneró el tablero (ambos 100% revisadas). Con esto el proyecto queda **2.536/2.536
  de contenido real revisado** (las únicas 2 sin revisar son las de ejemplo de `contenido/_plantilla/`,
  que no son contenido).
- **Pendiente (arrastre):** la foto semanal (runbook listo, sin aplicar por ser datos de prueba);
  trámites de lanzamiento (INAPI, vulpo.cl). Los 4 correos a los profesores y la aprobación de los 2
  bancos de apoyo quedaron **hechos**.

### Sesión 40 (2026-08-24) — Dominio propio `vulpo.cl`, tablero y aprobación de bancos
Sesión de producto/infraestructura, sin tocar el motor del juego (`index.html` solo suma el
archivo `CNAME`).
- **Dominio `vulpo.cl` conectado (el trámite más importante para "verse serio").** Se contrató en
  NIC.cl y se apuntó a GitHub Pages vía **Cloudflare** (DNS gratis + CDN): en NIC se pusieron los 2
  nameservers de Cloudflare; en Cloudflare, 4 registros **A** del dominio raíz a las IP de GitHub
  (`185.199.108–111.153`) + **CNAME** `www` → `robertoldman1978.github.io`, todos en **"Solo DNS"**.
  La delegación del `.cl` recién propagó **al completar el pago** en NIC (antes daba NXDOMAIN). En el
  repo se agregó el archivo **`CNAME`** (`vulpo.cl`) para que GitHub Pages sirva el sitio en el
  dominio. Ahora el juego vive en **`https://vulpo.cl`** y el panel en `vulpo.cl/profesor.html`; la
  URL vieja redirige. **Pendiente menor de Roberto:** activar "Enforce HTTPS" en Settings → Pages
  cuando el certificado se emita. Detalle y cuidados (progreso local por origen) en "Trámites
  pendientes" arriba.
- **Tablero de avance mejorado** (`scripts/generar-tablero.py`): controles **Expandir/Contraer todo**
  (Contraer todo deja **solo las asignaturas**), asignaturas y unidades **plegables**, y se agregaron
  los 2 bancos de apoyo creándoles su `oa.json` (Vocabulario 150, Ana Frank 72); orden fijo
  Historia · Matemática · Ciencias · Lenguaje · Vocabulario · libros.
- **Aprobación pedagógica de los 2 bancos de apoyo — HECHA:** Roberto aprobó Vocabulario y Ana
  Frank (`revisada:true` en todas). Contenido real del proyecto: **2.536/2.536 revisado**.
- **Panel del profesor responsivo en computador** (ensancha a 880px; el juego sigue mobile-first).

### Sesión 41 (2026-08-24) — Modo prueba `?solo=`: enlace acotado a capítulos sueltos
Roberto necesitaba pasarle a un grupo de alumnos un enlace para **probar** tres capítulos de
Historia (`hist-cap2`, `hist-cap3`, `hist-cap4`) sin jugarse antes el capítulo 1 y sin que la
prueba dejara rastro. `?qa=1` no servía porque además marca las respuestas. Todo el trabajo
es en `index.html`; no se tocó `profesor.html`, `schema.sql` ni el contenido.
- **Enlace nuevo:** `https://vulpo.cl/juego/?solo=hist-cap2,hist-cap3,hist-cap4`. Parámetro
  genérico (lista de ids de `EXPEDICIONES`), no un alias fijo, para que Roberto arme
  cualquier combinación sin pedir cambios de código. Documentado arriba, en "Parámetros de
  URL (ocultos)".
- **La constante `QA` se partió en cuatro banderas.** Mezclaba cosas distintas en ~15 usos:
  `MODO_ABIERTO` (ignora los candados entre capítulos, QA y prueba), `QA_MARCA` (pinta la
  respuesta correcta, **solo** QA), `EFIMERO` (no mide dominio por OA ni reporta refuerzos,
  QA y prueba) y `PRUEBA` (además no escribe en disco ni usa Supabase, **solo** prueba).
  **`?qa=1` quedó idéntico a como estaba** — verificado: desbloquea, marca, guarda en disco
  y crea perfil, igual que antes.
- **Dos fallos que aparecieron recién al probar en el navegador** (no estaban en el plan):
  1. Los capítulos se abrían, pero **las 5 etapas de adentro seguían encadenadas**:
     `nuevoProgreso()` abre solo la primera y ninguna bandera lo tocaba. Ahora en modo prueba
     la ruta nace con todas las etapas abiertas, jefe de capítulo incluido.
  2. El botón **"← Volver" de la campaña era una fuga**: llevaba a la pantalla completa de
     Expediciones (todas las asignaturas + tienda), justo lo que el modo prueba oculta. Se
     oculta el botón cuando `PRUEBA`.
- **Verificado en el navegador**, cinco modos con la consola limpia: juego normal (capítulo 1
  abierto, 2–5 bloqueados, guarda); `?qa=1` (desbloquea + marca + guarda, sin cambios);
  `?solo=` con los tres capítulos (2-3-4 abiertos, 5 etapas abiertas cada uno, **0 respuestas
  marcadas**, sin barra inferior, badge celeste); `?solo=…&qa=1` (un capítulo, marcado, sin
  guardar); e id inválido (cae al juego normal). **Prueba clave del no-guardado:** se sembró
  un `kimun_save` ajeno, se jugó en modo prueba (el XP subió a 30 en memoria) y el archivo
  quedó **byte a byte igual**; `guardar()` llamado a mano tampoco lo tocó; sin llamadas a
  Supabase; al recargar, el avance del invitado se evapora.
- **Límites conocidos (aceptados):** el enlace **no es un candado** (sitio estático: borrar el
  parámetro devuelve el juego completo); el avance de estos alumnos **no llega al panel del
  profesor** ni al ranking, por diseño; y la concurrencia no es problema (GitHub Pages sirve
  estáticos y el modo prueba no toca el backend).
- **Decisión tomada al implementar:** en modo prueba se **salta la intro** en video, porque
  escribe `kimun_intro` en `localStorage` y eso contradecía el "no guardar nada".
- **Diseño y plan:** `docs/superpowers/specs/2026-08-24-modo-prueba-enlace-acotado-design.md`
  y `docs/superpowers/plans/2026-08-24-modo-prueba-enlace-acotado.md`.

### Sesión 42 (2026-08-24) — Armador de enlaces de muestra + lista propia del modo prueba
Roberto pidió poder **armar los enlaces `?solo=` desde el panel**, sin recordar ids, para
preparar **cuestionarios de muestra** (material de difusión). Al diseñarlo se descubrió que el
modo prueba de la Sesión 41 tenía **cuatro agujeros** que el enlace de Historia nunca tocó,
pero que el armador iba a destapar apenas se marcara otra casilla. Se corrigieron primero.
- **Los cuatro agujeros (todos corregidos):**
  1. **Matemáticas no se filtraba (grave):** su campaña tiene `esLecciones`, así que
     `renderCampaña` delegaba en `renderCampañaMate`, donde el filtro por `SOLO` no existía.
     `?solo=mate-exp-numeros` abría la campaña **entera** de Matemáticas: lecciones, Reto de
     Cálculo y Jefe Final. El acotamiento simplemente no ocurría.
  2. **Mezclar asignaturas descartaba capítulos en silencio** (`?solo=hist-cap2,cien-celula`
     mostraba solo el de Historia).
  3. **Capítulos sin campaña** (Vocabulario, Lectura): si se pedían varios, se abría solo el
     primero.
  4. **El botón "← Volver" del mapa** mandaba esos capítulos sin campaña a `scr-lenguaje` o
     `scr-biblioteca`, otra fuga fuera del modo prueba.
- **La corrección de fondo:** el modo prueba dejó de injertarse en la pantalla de campaña (que
  por definición es de UNA asignatura) y tiene ahora **su propia lista**, `renderListaPrueba()`,
  que dibuja exactamente los capítulos de `SOLO` vengan de donde vengan, con su número original
  (o 📘 si no pertenecen a una campaña). Con eso **`renderCampaña` volvió a ser exactamente lo
  que era antes de la Sesión 41** (sin filtros, con su Desafío Extra y su Jefe Final), y el
  código quedó más simple que con el injerto.
- **Armador `?armar=1`:** pantalla oculta en `index.html` con todos los capítulos activos
  agrupados por asignatura, casillas, casilla "Mostrar las respuestas correctas" (`&qa=1`),
  enlace armado en vivo con `location.origin`, y botones Copiar y Probar (Copiar cae a
  "selecciona y copia con Ctrl+C" si el navegador bloquea el portapapeles). **Vive en el juego
  y no en el panel a propósito:** el catálogo ya está ahí, así que no hay dos listas que
  mantener y una expedición nueva aparece sola. Bandera `SIN_DISCO` (`PRUEBA||ARMAR`) para no
  escribir en disco, no crear perfil y saltar la intro.
- **Botón en el panel:** "🔗 Armar enlace de muestra" en Administración, junto al Tablero,
  con el mismo candado que "Limpiar perfiles de prueba" (`YO.es_admin`): no lo ven los
  SuperUsuarios.
- **Verificado en el navegador**, consola limpia: los 3 capítulos de Historia siguen igual
  (no-regresión del enlace ya repartido); `?solo=mate-exp-numeros` da **1 sola tarjeta**;
  `?solo=hist-cap2,cien-celula` da **2, de dos asignaturas**; `?solo=voc-general,lect-anafrank`
  da **2 con marca 📘** y su "Volver" regresa a la lista de prueba; el juego normal recupera
  los 5 capítulos + Desafío + Jefe Final; `?qa=1` sigue desbloqueando, marcando y **guardando**;
  el armador lista 20 capítulos en 6 grupos, arma las tres variantes de enlace, deshabilita
  Copiar/Probar sin selección y **no agrega ni una clave a `localStorage`** (comprobado
  comparando las claves antes y después).
- **Diseño y plan:** `docs/superpowers/specs/2026-08-24-armador-enlaces-muestra-design.md` y
  `docs/superpowers/plans/2026-08-24-armador-enlaces-muestra.md`.

### Sesión 43 (2026-08-24) — Muestras con caducidad y token `?m=`
Roberto pidió poder ponerle **clave y/o caducidad** a los enlaces de muestra, con el objetivo
de que **una demostración no siga circulando meses después**.
- **La clave se descartó, de común acuerdo.** No sirve al objetivo: viaja en el mismo mensaje
  que el enlace, así que se reenvía con él. Una clave filtra *quién entra*; para que algo
  *deje de estar vivo* la herramienta es la caducidad.
- **Token `?m=`:** los datos (ids, fecha, respuestas) viajan codificados en base64url, sin
  nada a la vista. Un enlace con caducidad y uno sin ella **se ven idénticos**. Alimenta las
  mismas variables `SOLO` y `QA` de siempre, así que toda la maquinaria del modo prueba
  funciona sin cambios.
- **Es un DISFRAZ, no un cifrado, y se documentó así.** Base64 se revierte en un minuto. Lo
  que consigue es quitar la invitación obvia: ver `&hasta=2026-09-15` prácticamente pide que
  le cambien la fecha; ver `?m=aGlzdC1jYXAy…` no sugiere nada. Es proporcional al objetivo.
- **Vigencia inclusiva:** un enlace con `2026-09-15` sirve todo el 15 y muere el 16.
- **Pantalla de vencido:** sobria, con la fecha en castellano ("Venció el 1 de agosto de
  2026.") y un botón al juego completo. Sin acceso a los capítulos por esa vía.
- **El armador ganó tres cosas:** campo de fecha con atajos (Sin caducidad / 1 semana / 1 mes,
  y `min` en hoy para no generar enlaces nacidos muertos); **resumen en castellano** bajo el
  enlace ("1 capítulo · vence el 31 de agosto de 2026 · con respuestas"); y un **lector**:
  se pega un enlace y dice qué contiene y si venció. El lector es el contrapeso de haber
  ocultado los datos — sin él, un enlace viejo sería ilegible hasta para Roberto.
- **Corregido al probar:** `leerToken('xxxx')` devolvía basura en vez de `null`, porque
  `xxxx` resulta ser base64 válido. Ahora se exige forma de id (letras, números y guiones).
  Y el aviso "🧪 Modo prueba" aparecía en la pantalla de vencido, donde no se juega nada.
- **Verificado en el navegador**, consola limpia: token de ida y vuelta; `?m=` vigente abre
  igual que el modo prueba; `?m=` con fecha de **hoy** abre (límite inclusivo); `?m=` vencido
  muestra la pantalla con la fecha correcta y **sin agregar claves a `localStorage`**;
  `?m=xxxx` cae al juego normal; `?solo=` sigue **sin caducidad**; `?qa=1` sigue
  desbloqueando, marcando y guardando; el armador genera las tres variantes y el lector
  responde a enlace completo, token suelto, enlace vencido y basura.
- **Límites conocidos (aceptados):** el token es reversible; la fecha se compara con el reloj
  del visitante, que se puede atrasar; caducar el enlace **no cierra el juego**, que es
  público en vulpo.cl; y **no hay revocación** (un enlace vive hasta su fecha).
- **Diseño y plan:** `docs/superpowers/specs/2026-08-24-muestras-con-caducidad-design.md` y
  `docs/superpowers/plans/2026-08-24-muestras-con-caducidad.md`.

### Sesión 44 (2026-08-24) — La puerta de acceso: VULPO deja de ser gratis (publicada apagada)
Decisión de negocio de Roberto: el juego deja de ser gratuito. Ya reparte enlaces a apoderados y
no quiere que un colegio que no contrató tenga a sus alumnos jugando gratis. Todo en `index.html`.
- **Lo construido:** `FECHA_PUERTA` con tres fases (vacía / aviso / cerrada), demo acotada a
  `hist-cap1`, candados en el resto, banda de aviso previo, y pantalla de fin de demo con el
  contacto. Detalle completo en "Modelo de acceso (la puerta)" arriba.
- **Se publicó APAGADA** (`FECHA_PUERTA=''`): desplegar no cambia nada para nadie. La activa
  Roberto editando una línea, **cuando exista la página comercial** — si la puerta cierra y un
  colegio interesado no tiene dónde contratar, se convierten visitas en frustración.
- **El código `ALU-` pasó de premio a llave.** Antes era opcional (solo daba ranking); ahora es
  lo que abre el juego. No hubo que inventar identidad: ya existía.
- **Dos hallazgos verificados que cambian lo que se puede prometer:**
  1. **Las 2.536 preguntas son descargables por cualquiera** desde el sitio en vivo. La puerta es
     un bloqueo blando y así quedó documentado.
  2. **El juego NO funciona sin internet.** No hay service worker y los bancos se piden con
     `fetch`. Se había afirmado lo contrario en el spec y se corrigió.
- **Decisiones de diseño:** el Duelo local queda libre (gancho); el candado tapa pero **no borra**
  el avance; la licencia se consulta en vivo para que canjear abra la puerta sin recargar; y los
  enlaces de muestra y `?qa=1` nunca pasan por la puerta.
- **Corregido al implementar:** el mensaje del candado se escribió con saltos de línea literales
  dentro de una cadena JavaScript — error de sintaxis que rompía el juego entero. Detectado y
  arreglado antes de seguir.
- **Verificado en el navegador**, consola limpia, en las tres fases: apagada (juego idéntico a
  hoy, 7 nodos en Historia, barra completa, sin candados); aviso (todo abierto + banda con la
  fecha en castellano); cerrada sin código (solo `hist-cap1`, resto "🔒 Necesitas un código",
  barra solo Mapa, duelo local, pantalla de fin de demo con el contacto correcto); y las
  excepciones (`?solo=`, `?m=`, `?qa=1`) pasando pese a la puerta cerrada. El enlace ya repartido
  `?solo=hist-cap2,hist-cap3,hist-cap4` sigue intacto.
- **Pendiente de Roberto (fuera del código):** la página comercial en `vulpo.cl`.
  **Arquitectura decidida (24/08/2026):** la raíz `vulpo.cl` pasará a ser la **página de
  presentación** y el juego se moverá a **`vulpo.cl/juego`**. Roberto descartó la preocupación por
  los enlaces de muestra ya repartidos: **el de Historia no pasa de esta semana**, así que no hace
  falta reenviar `?solo=`/`?m=` desde la raíz. Al mover el juego, recordar que el armador construye
  los enlaces con `location.origin+location.pathname`, o sea que **desde `/juego` los generará
  correctos solo**, sin tocar código.
- **Diseño y plan:** `docs/superpowers/specs/2026-08-24-puerta-de-acceso-design.md` y
  `docs/superpowers/plans/2026-08-24-puerta-de-acceso.md`.

### Sesión 45 (2026-08-24) — Página de presentación en la raíz y el juego a `/juego`
Para poder activar la puerta de la Sesión 44 hacía falta que un colegio interesado tuviera dónde
contratar. Esta sesión construye esa página. **Herramienta: HTML y CSS a mano**, sin framework ni
compilación — el proyecto entero funciona con `git push` y meter `node_modules` complicaría algo
que hoy no tiene fricción.
- **El juego se movió a `juego/index.html`** (URL `vulpo.cl/juego/`) y la raíz quedó para la
  página. El traslado rompía **118 rutas relativas** (91 a `assets/`, 27 a `contenido/`); se
  resolvió con **una línea, `<base href="/">`**, que lleva su propio comentario de "NO borrar".
  Los 3 `href="#"` del archivo ya tenían `preventDefault`, así que no se vieron afectados.
- **El armador no necesitó cambios:** construye los enlaces con `location.origin+location.pathname`,
  así que desde `/juego/` los genera correctos solo. Verificado.
- **En `profesor.html`** el botón del armador pasó a `/juego/?armar=1`.
- **Los enlaces de muestra ya repartidos quedaron rotos a propósito** (apuntan a la raíz). Roberto
  lo aceptó: el de Historia no sobrevivía la semana. No se construyó ningún reenvío.
- **La página** (`index.html` en la raíz) habla a colegio → profesor → familia, en ese orden, sin
  precios, con **WhatsApp** como llamada a la acción y el correo discreto en el pie. Misma paleta y
  tipografías del juego. Metadatos Open Graph para que el enlace se vea como tarjeta en WhatsApp.
- **Capturas reales, ninguna maqueta.** Como una captura headless no sabe hacer clics, se usó un
  archivo temporal (`_cap.html`, borrado después) que sembraba una partida de demostración y
  conducía el juego dentro de un marco del mismo origen; luego Chrome headless capturó a disco.
  Quedaron en `assets/web/`: mapa de expedición, pantalla de pregunta y la imagen Open Graph.
- **Dos fallos encontrados y corregidos al verificar:**
  1. **`.seccion{padding:56px 0}` anulaba el `padding:0 20px` de `.envoltura`**, y en teléfono
     todo el contenido quedaba pegado a los bordes. Se acotó a `padding-top/bottom`.
  2. Antes de eso se había agregado una media query para un desborde que **no existía**: la
     captura headless a 375px dibuja la página más ancha y la recorta, lo que simulaba texto
     cortado. Medido en un navegador real no había desborde; la media query se retiró.
     **Lección: para verificar responsive, medir el DOM en un navegador real, no fiarse de una
     captura headless.**
- **Verificado:** `/` muestra la página y `/juego/` el juego, sin 404 nuevos; los cuatro parámetros
  ocultos funcionan desde la ruta nueva; el panel y el tablero siguen abriendo; sin desborde
  horizontal a 375px ni a 1280px; imágenes con texto alternativo; consola limpia.
- **Capturas del panel: resueltas.** No se podían tomar desde el entorno de desarrollo
  (`profesor.html` exige sesión y simular sus llamadas encadenadas habría dado una pantalla a
  medio dibujar), así que **las tomó Roberto** desde su cuenta con el curso de demostración
  "8A Prueba". Quedaron tres: `panel-dominio.png`, `panel-refuerzo.png` y `panel-ranking.png`.
  - **Todas llevan una etiqueta "DATOS SIMULADOS" superpuesta**, no un pie de foto: así la
    advertencia viaja con la imagen si alguien la recorta o la reenvía suelta por WhatsApp.
    Además la sección lo dice en texto.
  - **A la del mapa de dominio se le recortó la franja de participación** ("0 de 26 jugaron esta
    semana"), por decisión de Roberto: en una página de venta un colegio podría leerlo como que
    nadie usa el producto, y esa franja no aporta al argumento de esa sección. Se cortaron 43px y
    se pegaron las dos mitades, sin dejar hueco.
  - **Reparto:** dominio y refuerzo en "Para el profesor"; el **ranking en "Para la familia"**,
    porque ahí el texto habla de competir con los compañeros y subir puestos.
- **Marca oficial incorporada.** Roberto entregó el logotipo de VULPO (zorro con capucha morada).
  De tres versiones se eligió la única con **marca denominativa Y fondo transparente** (verificado
  leyendo el canal alfa; otra tenía fondo negro sólido, que habría dejado un recuadro sobre el
  violeta). Quedó en la portada de la página, el ícono de pestaña y la imagen Open Graph. Como el
  logotipo ya trae la palabra "Vulpo", **se quitó el título de texto** que iba debajo: la imagen es
  el `h1`, con el nombre en su `alt`.
- **La pantalla inicial del juego** (`scr-rol`) usa ahora la versión **sin marca denominativa**
  (`assets/vulpo-mascota.png`), porque esa pantalla ya tiene su propio título "VULPO" debajo.
  Hubo que cambiar su estilo: `.logo .badge-img` recortaba en círculo con borde dorado y le
  cortaba la capucha; ahora va suelta, con sombra y el mismo flotar. **Las expresiones de Vulpi
  (75 imágenes: feliz, triste, skins, medallas) se dejaron como estaban**, por decisión de
  Roberto — rehacerlas es un trabajo de diseño aparte.
- **`FECHA_PUERTA` sigue vacía.** Esta página no activa la puerta.
- **Diseño y plan:** `docs/superpowers/specs/2026-08-24-pagina-presentacion-design.md` y
  `docs/superpowers/plans/2026-08-24-pagina-presentacion.md`.

### Sesión 46 (2026-08-25) — `schema.sql` aplicado en Supabase (cierra el pendiente de la Sesión 39)
Roberto pidió aplicar el schema. **El asistente no ejecuta SQL contra la base de producción** y
además no podía: no hay CLI de Supabase ni `psql` en el equipo, y las únicas credenciales del
proyecto son la clave pública anónima, que por diseño no altera la estructura. Lo aplicó Roberto
a mano; el asistente preparó el terreno y verificó el resultado.
- **Revisión previa de seguridad del archivo** (1.391 líneas), antes de mandar a pegarlo en
  producción: cero `drop table`, `truncate`, `drop column` y `drop schema`; los 12 `delete from`
  están **dentro de cuerpos de función** (pegar el archivo solo las define), salvo uno
  intencional que borra la clave de administrador obsoleta; y las 5 sentencias
  `insert`/`update` de nivel superior son migraciones idempotentes (`on conflict do nothing` o
  acotadas a filas antiguas). **Se puede re-pegar sin daño.**
- **Runbook nuevo: `docs/aplicar-schema.md`** — pasos en el panel, consulta de verificación y
  registro de aplicaciones con fecha.
- **Gotcha del SQL Editor de Supabase:** ejecuta todas las sentencias pero **solo muestra el
  resultado de la última**. La primera versión de la verificación eran 4 consultas separadas y
  Roberto solo vio la cuarta. Se reescribió como **una sola consulta con `union all` que
  devuelve 5 filas con una columna `estado`**. Queda anotado en el runbook.
- **Verificado en producción**, las 5 filas en `ok`: **13 de 13 tablas con RLS** (incluidas
  `desafios` y `desafio_resultados`, el hallazgo ALTO de la auditoría), ninguna sin RLS, la firma
  de `kimun_prof_dominio_alumno` en **`uuid`** (así el profe de asignatura ya no recibe la
  credencial `ALU-`), `admin_clave` en 0 filas, y 50 funciones `kimun_*`.
- **Con esto la auditoría de identidad y permisos de la Sesión 39 está en producción**, no solo
  en el repositorio. Era el pendiente de fondo que se arrastraba.
- **Recordatorio permanente:** cada vez que se toque `supabase/schema.sql` hay que **volver a
  aplicarlo a mano**. El repositorio y la base no se sincronizan solos.

### Sesión 47 (2026-08-25) — Enforce HTTPS activado y la puerta programada para el 1 de septiembre
Dos acciones cortas, las dos con consecuencias reales.
- **Enforce HTTPS activado en GitHub Pages.** `gh` estaba instalado pero sin autenticar (los
  `push` van por el gestor de credenciales de Windows, que es otra cosa); Roberto corrió
  `gh auth login` y desde ahí se hizo por API (`PUT repos/.../pages -F https_enforced=true`).
  **Antes de activarlo se comprobó que el certificado estuviera emitido** (Let's Encrypt para
  `vulpo.cl`, válido hasta el 22/11/2026, estado `approved`): activarlo sin certificado dejaría
  el sitio inaccesible.
  - **Hacía falta de verdad:** antes `http://vulpo.cl` respondía **200 directo**, sirviendo el
    sitio sin cifrar. Ahora las tres entradas (apáice, `www` y las rutas internas) devuelven 301
    a `https://`, verificado siguiendo la redirección completa hasta el destino final.
  - **De paso se arregló la URL vieja de `github.io`**, que redirigía a `http://vulpo.cl` y era
    la puerta de atrás para quien tuviera un enlace antiguo.
  - El certificado lo renueva GitHub solo; no hay que agendarlo.
- **La puerta quedó programada: `FECHA_PUERTA='2026-09-01'`.** Roberto eligió la fecha con 7
  días de aviso. Desde el despliegue se ve la banda en la pantalla de inicio y **el 1 de
  septiembre VULPO deja de ser gratuito**.
  - **Verificado en los tres escenarios:** hoy sin código (todo abierto, solo el aviso, con la
    fecha en castellano); el día 1 sin código (solo `hist-cap1`, el resto con "🔒 Necesitas un
    código", barra reducida a Mapa); y el día 1 **con** código (todo abierto, sin candados).
  - **Probado el límite** poniendo la constante en la fecha de hoy: **cierra el día 1, no el 2**,
    que es lo que promete el aviso. La comparación es `hoyISO() >= FECHA_PUERTA`.
- **Riesgo asumido y dicho:** quien empiece a jugar el 31 de agosto se topa con el candado al día
  siguiente sin haber visto el aviso el tiempo suficiente. Es inevitable con cualquier fecha.
- **Lo que ahora urge y no es técnico:** desde el 1 de septiembre cada persona que termine la
  demo ve el WhatsApp y el correo de Roberto. Hace falta tener decidido qué cobrarle a un
  colegio antes de que llegue el primer mensaje.

### Sesión 48 (2026-08-25) — Precio revisado, material comercial rehecho y traspaso a VS Code
Sesión **comercial**, sin tocar código del juego. Se revisó el precio definido en la Sesión 36 y se
rehizo el material para que calce con la realidad de agosto.
- **El precio por alumno no era el problema; el techo por colegio sí.** VULPO cubre solo 8°
  básico, así que un colegio no puede gastar más de **$630.000 al año** (tres 8°, tarifa
  Fundador), y vender a un colegio cuesta lo mismo pague lo que pague. **La palanca real no es
  subir el precio: es agregar 7° básico**, que duplicaría el techo sin duplicar el esfuerzo de
  venta. Anotado como dirección, fuera de alcance por ahora.
- **Tres arreglos al precio, aprobados por Roberto:**
  1. **Licencia mínima de $250.000** al año. Al calcularlo apareció que a tarifa Fundador un
     curso de 40 alumnos son $240.000, **por debajo del mínimo**, así que en la práctica
     cualquier venta de un curso solo queda en $250.000. Se dice de frente en la propuesta en vez
     de esconderlo en una nota: *un curso $250.000; desde dos cursos, $6.000 por alumno*.
  2. **Tarifa Fundador acotada:** primeros **5 colegios**, hasta el **31 de diciembre de 2026**.
     Antes decía "los primeros colegios", sin número ni fecha: no generaba urgencia y conveía
     los $6.000 en el precio real.
  3. **El 40% de rebaja se cobra:** testimonio por escrito, autorización para nombrar al colegio
     y reunión de retroalimentación. De favor a intercambio.
- **El calendario escolar cambió la estrategia.** El año termina en diciembre y Fiestas Patrias
  parte a mediados de septiembre: un piloto de un semestre iniciado el 1 de septiembre se
  interrumpía a los diez días y terminaba con el año. **La prueba pasó a 4 semanas** (última
  semana de septiembre) y **la venta es para el año escolar 2027**, decidida a tiempo para el
  presupuesto. La tarifa Fundador vence el 31/12 justamente porque coincide con esa decisión.
- **Material rehecho** (fuera del repo, en `Escritorio\VULPO - correos profesores\`), generado
  desde HTML con Chrome headless `--print-to-pdf`:
  - `VULPO-propuesta-SanFranciscoDeSales-2026-08-25.pdf`: precios nuevos, mínimo, Fundador
    acotado, condiciones del intercambio, secuencia de 3 pasos, `vulpo.cl`, y una sección nueva
    "Qué necesita el colegio para partir" (la primera objeción de UTP).
  - `VULPO-guion-reunion-2026-08-25.pdf`: objetivo cambiado a **cerrar la prueba, no la venta**;
    tres objeciones nuevas ("¿por qué ahora si el año se acaba?", "¿qué otros colegios lo usan?"
    —con la instrucción de responder la verdad—, "¿y si el próximo año no sirve?"); recordatorio
    de llevar **el código `ALU-` ya canjeado** (desde el 1/9 ni el vendedor pasa del primer
    capítulo); y un recuadro de **no prometer lo que no hay** (sin internet no funciona, solo 8°).
  - Las versiones del 23/08 se conservan pero están desfasadas.
- **`docs/comercial.md` (nuevo):** precio, condiciones, secuencia, calendario, límite estructural,
  qué se promete y qué no, y dónde vive el material. Es la fuente de verdad comercial dentro del
  repo.
- **Se documentó que el repositorio es PÚBLICO** y qué no debe escribirse en él.
- **Se pasaron al `CLAUDE.md` los gotchas del motor de expediciones**, que hasta ahora solo
  vivían en la memoria del asistente y no viajan al cambiar de directorio de trabajo.
- **Pendiente que bloquea cobrar:** con qué se factura (SpA por Empresa en un Día). Si un colegio
  acepta y no hay cómo emitir factura, la venta se cae en el último paso.

### Sesión 49 (2026-08-25) — Ida y vuelta entre la página comercial y el juego
Sesión corta de navegación. Hasta hoy la página de presentación y el juego eran **calles de un
solo sentido**: desde `vulpo.cl` se entraba a `/juego`, pero desde el juego no había forma de
volver, y el panel del profesor no se anunciaba en ninguna parte. Tres enlaces, 8 líneas, sin
CSS nuevo (se reusaron los estilos que ya existían) y sin tocar nada del motor.
- **Enlace al panel en el pie de la página comercial** (`index.html`): `vulpochile.app@gmail.com ·
  Panel del profesor` → `/profesor.html`. Va en el pie **a propósito**: el panel es una
  herramienta para quien ya tiene cuenta, no un argumento de venta; arriba competiría con
  "Probar la demo" y el WhatsApp, y mandaría a un visitante nuevo a una pantalla de ingreso que
  no puede usar. El pie es donde uno busca "iniciar sesión".
- **Salida del juego hacia `vulpo.cl`** (`juego/index.html`), en **dos** pantallas:
  1. **Inicio (`scr-rol`)**, bajo Créditos. Basta con esa: todo el juego desemboca ahí
     (`btnExpBack` → `scr-rol`).
  2. **Fin de la demo (`scr-demo-fin`)**, que **no tenía ningún botón de retorno**. Era un
     callejón sin salida, y es donde cae un apoderado justo al terminar la demo — el momento
     comercialmente más importante. Ese era el hallazgo de la sesión.
- **Decisión registrada:** la salida **también se ve en modo prueba** (`?solo=`, `?m=`). En la
  Sesión 41 se ocultó el "Volver" de la campaña porque era una fuga hacia el juego completo;
  este enlace no lo es (lleva a la página de venta), y sin él un alumno con enlace de muestra
  queda igual de atrapado. Revertirlo es una línea si alguna vez estorba.
- **Verificado en el navegador**, no solo en el archivo: el juego arranca bien con el cambio (el
  JS llena la banda de la puerta con "Desde el 1 de septiembre de 2026…", o sea que no se rompió
  el arranque); capturas de las dos pantallas con el enlace visible; y **el clic navega de
  verdad** — se condujo el juego desde un marco del mismo origen (la técnica del `_cap.html` de
  la Sesión 45, con archivo temporal borrado después) y tras el clic la captura muestra la
  página comercial. El servidor local confirma `/`, `/profesor.html` y `/juego/` en **200**.
- **Recordatorio de método reconfirmado (Sesión 45):** las capturas de Chrome headless salen
  **recortadas a la derecha** y eso NO es desborde. Se comprobó capturando `vulpo.cl/juego/` en
  producción —sin el cambio— y sale idéntico de recortado. Para responsive, medir el DOM.
- **Nota para capturar el juego en headless:** la intro en video tapa la pantalla de inicio (el
  autoplay bloqueado deja "▶ Toca para comenzar"). Se salta con
  `--force-prefers-reduced-motion=reduce`, porque la intro respeta esa preferencia.

### Sesión 50 (2026-08-25) — Mejora visual de la landing
Pasada estética a la página comercial (`index.html`, la landing en `vulpo.cl/`), para que
respire el mismo mundo del juego. El motor del juego (`juego/index.html`) no se toca.
- **Fondo de estrellas + estrella fugaz, portado del juego.** Capa `.stars` con 60 estrellas
  titilando (`@keyframes tw`) fija al viewport y **detrás del contenido** (`z-index:-1`, para no
  tener que ponerle z-index a cada sección) y decorativa (`pointer-events:none`, `aria-hidden`).
  Estrella fugaz `.shoot` con cola violeta en diagonal cada 8–22 s (mismo CSS/JS que el juego).
  Respeta `prefers-reduced-motion`: estrellas quietas y sin fugaces. Verificado por DOM (60
  estrellas, capa fija tras el contenido, sin errores de consola); el screenshot headless no
  renderiza si el panel del navegador no está a la vista, pero eso no es un problema de la página.

### Sesión 51 (2026-08-25) — Auditoría web (seguridad + diseño + persuasión) y correcciones
Se lanzaron **tres agentes en paralelo** sobre la cara web (landing `index.html`, `juego/index.html`,
`profesor.html`, y las features nuevas de enlaces/puerta): seguridad, diseño visual y persuasión.
Cada hallazgo de seguridad se **verificó a mano contra el código** antes de actuar.
- **Seguridad — 2 arreglos aplicados y verificados:**
  1. **XSS almacenado (ALTO) en el Duelo en línea:** el `nombre`/`avatar` de otro jugador (dato
     controlado por el usuario, vía Supabase) se inyectaba con `innerHTML` **sin escapar** en 4
     rutas del duelo (`juego/index.html` ~3316/3370/3427/3438) — un compañero del mismo curso podía
     ejecutar código en el navegador de la víctima (menores). Se aplicó el `escHtml()` que ya
     existía (y que el ranking sí usaba), más el duelo local (~2663). Verificado: un payload
     `<img onerror>` ahora renderiza como texto.
  2. **supabase-js desde CDN sin fijar versión ni SRI (MEDIO):** `juego/index.html` y `profesor.html`
     cargaban `@supabase/supabase-js@2` (mutable, sin `integrity`). Se **auto-hospedó** la versión
     fija **2.112.4** en `assets/vendor/supabase-js-2.112.4.min.js` y se quitó el CDN. Elimina el
     riesgo de cadena de suministro (crítico en el panel del profesor, que maneja su sesión).
     Verificado: juego y panel cargan supabase local, `createClient`/`SB` funcionan, cero CDN.
  - *Confirmado sólido:* sin tabnabbing en la landing (`_blank` con `noopener`); las features de
    token (`?m=`/`?solo=`/`?armar=1`) validan ids y usan `textContent`; `profesor.html` escapa todo;
    **sin analytics/pixeles de terceros**; sin secretos indebidos.
  - *Pendiente opcional (no urgente):* validar largo/caracteres del nombre en `kimun_perfil` (defensa
    en profundidad; el escape ya cierra la vulnerabilidad).
- **Texto comercial ajustado (decisión de Roberto):**
  - La **puerta de acceso NO revalida la licencia** contra Supabase (es bloqueo blando: `tieneLicencia()`
    solo lee `localStorage`). Se corrigió el spec `2026-08-24-puerta-de-acceso-design.md` para que lo
    diga, y se anotó que **el discurso comercial no debe prometer que "el acceso se apaga si el colegio
    deja de pagar"** (hoy no ocurre; queda descrito cómo implementarlo si se quisiera).
  - **Precios en la cara pública:** regla nueva en `docs/comercial.md` — la **landing y el primer
    contacto NO muestran valores en pesos**, solo *"cuesta menos que una hora de reforzamiento
    particular"*; los números van en la propuesta/reunión. La tabla de precios interna se conserva.
- **Diseño y persuasión — mapa de mejoras (pendiente de aplicar):** las otras dos revisiones dejaron
  un plan de mejoras de la landing (el logo-mascota como titular se ve infantil → titular tipográfico;
  falta franja de legitimidad MINEDUC + sección de privacidad de menores; reservar Titan One y usar una
  sans moderna; botones/tarjetas "pro" con `:focus-visible`; CTA agendable; hero que lidere con el
  beneficio; reencuadrar el celular como uso en casa). Se empieza a aplicar por lo de mayor impacto.
- **Rediseño de la landing — primer incremento (aplicado):** se mantiene la identidad (violeta +
  estrellas) pero subordinada a un registro formal. Tipografía **Inter** en todo (Titan One reservada
  al nombre de marca y los números); `h2` blanco sobrio con un "kicker" dorado por sección; hero con el
  logo achicado + **titular de beneficio** ("Tus alumnos repasan jugando. Tú ves exactamente qué les
  cuesta"); **franja de legitimidad** (MINEDUC · 2.536 revisadas · prueba sin costo · sin instalar);
  botones/tarjetas "pro" con hover y `:focus-visible`; **sección de privacidad de menores**; sección
  **"Sin riesgo"** con el mensaje de valor sin números ("cuesta menos que una hora de reforzamiento
  particular") y CTA "Coordinemos una demo de 15 minutos"; celular reencuadrado como **uso en casa**;
  micro-CTA de apoderado. Verificado en el navegador (Inter aplicada, franja y secciones presentes,
  sin desborde a 424/1280, sin errores).
- **Rediseño de la landing — segundo incremento (aplicado):** la sección **"Para el profesor" pasa a
  fondo claro** (rompe el muro oscuro y hace resaltar las capturas del panel; el texto se invierte a
  oscuro con las variantes `.clara .dim`/`.kicker`, verificadas legibles), y las **3 capturas del
  panel** (dominio, refuerzo, ranking) van dentro de un **marco de ventana de navegador** (`.mock`
  con barra + 3 puntos), con variante clara/oscura según la sección. Verificado sin desborde
  (375/1280) ni errores.
- **Rediseño de la landing — marco de teléfono (aplicado):** la captura vertical del juego
  (`juego-mapa`) va dentro de un **marco de teléfono** (`.tel`: cuerpo redondeado + pantalla con
  esquinas), para combinar con los marcos de navegador del panel. Con esto el rediseño queda
  bastante completo. **Único pendiente (necesita algo de Roberto):** reemplazar el CTA "Coordinemos
  una demo" de WhatsApp por un **enlace de agenda real** (Calendly/Google Calendar).

### Sesión 52 (2026-08-25) — Fundamento MINEDUC y retroalimentación formativa (3 grupos)
Sesión larga de dos caras: **mensaje** (fundamentar que VULPO es evaluación formativa según el
MINEDUC) y **producto** (tres grupos de mejoras de retroalimentación que el MINEDUC subraya).
Flujo brainstorming → spec → plan → ejecución por tareas, verificando cada una en el navegador.

- **Rescate del material MINEDUC (que solo vivía en una conversación anterior):** se recuperaron
  los 4 PDF oficiales y sus textos extraídos, y dos agentes sacaron las citas textuales con página.
- **`docs/fundamento-evaluacion-formativa.md` (nuevo):** el hallazgo central es que el MINEDUC, en
  *Orientaciones de Evaluación y Retroalimentación* (2021, p. 73), **nombra a Kahoot y Quizizz**
  como apoyos válidos de la evaluación formativa — VULPO es de esa familia. El documento reúne la
  definición oficial, el encaje con el Decreto 67 ("por lo general no se califica"), los beneficios,
  y **advertencias de honestidad** para no exagerar ("primer intento" NO es término del MINEDUC;
  Kahoot/Quizizz solo se nombran en el doc de 2021). Corrección de fuente: el doc del artículo 89342
  es "Orientaciones para directivos", **no** el de implementación del Decreto 67.
- **Landing + `comercial.md`:** sección nueva "Evaluación formativa" en la landing con cita
  atribuida al MINEDUC; `comercial.md` suma el argumento y apunta al fundamento. Pendiente de
  Roberto: pegar la sección en el HTML de la propuesta/guion (vive en el otro PC).
- **Grupo A — El siguiente paso al fallar** (spec/plan `2026-08-25-siguiente-paso-al-fallar*`):
  - **Comodín 50/50:** 2 por etapa, elimina dos opciones malas, gratis, contador "💡 Ayuda (N)".
    Solo Modo Normal; **nunca en jefes** (5.º nodo ni Jefe Final), duelo, desafío, repaso ni libros.
    La pregunta asistida cuenta para pasar/estrellas/XP pero **no llama a `registrarOA`** (no
    contamina el primer intento del profesor). Flag `Q.asistidaActual`.
  - **Siguiente paso al reprobar una etapa de un OA:** Matemática → **mini-clase** de la unidad
    (buscada por `fromBank.oa`, con retorno vía `TRAS_LECCION`); Historia/Ciencias/Lenguaje →
    **modo repaso** (`Q.repaso`): 10 preguntas **distintas de la etapa fallada**, sin cronómetro,
    sin reprobar, sin medir ni pagar; vuelve a la pantalla de reprobado. El 5.º nodo (jefe, mezcla
    OA) y los libros quedan solo con "Reintentar".
- **Grupos B y C — El marco de la etapa** (spec/plan `2026-08-25-marco-de-la-etapa*`):
  - **B · Meta de aprendizaje:** bloque `META_OA` con **una frase amable por OA (69 en total)**,
    generada por 4 agentes desde el texto oficial de cada `oa.json` y **aprobada por Roberto**
    (se corrigió un modismo). Tarjeta 🎯 "Lo que vas a aprender" la **primera vez** por etapa
    (`scr-meta`, recordada en `S.metasVistas`), línea fija "🎯 ‹meta›" en el quiz (etapa y repaso;
    no lección/desafío/libros), y el encabezado de reprobado del grupo A pasó a usar la meta.
    Fallback al nombre de la etapa. `startQuiz` se partió en compuerta de meta + `arrancarQuiz`.
  - **C · Cierre metacognitivo:** fila **"¿Cómo te fue?"** con 🟢🟡🔴 en la pantalla de resultado,
    opcional, de un toque; mensaje contextual (en 🟡/🔴 con repaso disponible, empuja suave hacia
    él). **Local y privado** (`S.semaforo`): no se envía al profesor ni toca el mapa de dominio.
- **Sin backend nuevo.** Todo en `juego/index.html` (+ las 69 frases). Verificado en el navegador:
  comodín 50/50 y su exclusión de la medición, repaso sin solapar/sin medir/sin pagar, mini-clase
  con retorno, tarjeta 1.ª vez y directo después, línea de meta, semáforo local, y `?qa`/EFIMERO
  sin medir; el juego normal (medición sin comodín) intacto. Consola limpia (solo el aviso benigno
  de `navigator.vibrate` al responder por script, preexistente).
- **Pendientes de Roberto (fuera del código):** pegar el argumento de evaluación formativa en la
  propuesta/guion (otro PC); enlace de agenda real para el CTA de la landing.

### Sesión 53 (2026-08-25) — Prueba de juego real de A/B/C + guard de `LEC`
Sesión corta de verificación. Se probaron **jugando de verdad** (clics reales en el navegador, no
solo por DOM) los tres grupos de retroalimentación de la Sesión 52, que hasta ahora solo se habían
verificado por DOM. Todo pasó. Único cambio de código: 2 líneas de blindaje.
- **Método:** el temporizador de 20 s expira entre acciones lentas y arruina las pruebas manuales,
  así que se **congeló el reloj por pregunta** (`clearInterval(Q.timer)`) para inspeccionar con
  calma, sin tocar la lógica de las features. Se recorrió Historia (etapa `hist-cap1` nº3) y
  Matemática (`mate-exp-numeros` etapa 1).
- **Grupo B — Meta de aprendizaje ✅:** tarjeta 🎯 la primera vez (Historia y Matemática), línea
  fija 🎯 bajo el enunciado en el quiz, y la meta también en la pantalla de reprobado.
- **Grupo A — Comodín 50/50 ✅:** clic real en "Ayuda (2)" elimina **dos** opciones incorrectas
  (nunca la correcta), baja el contador a (1), y la pregunta asistida **no se mide** (`registrarOA`
  no se llama; `asistidaActual=true`) pero sí cuenta para pasar.
- **Grupo A — Siguiente paso al reprobar ✅ (las dos ramas):** Historia → "🧑‍🏫 Repasar sin
  presión" (10 preguntas, sin cronómetro, sin medir, sin pagar); Matemática → "📘 Repasar la
  mini-clase" (abre la lección del OA y "← Salir" regresa al reprobado vía `TRAS_LECCION`).
- **Grupo C — Semáforo ✅:** clic real en 🔴 lo selecciona y muestra el mensaje que empuja al
  repaso; se guarda **solo local** en `S.semaforo`, no se envía al profesor.
- **Cambio de código — guard de `LEC` (2 líneas):** `avanzarBloque()` y `renderBloque()` ahora
  hacen `if(!LEC||!LEC.leccion)return;`. En juego normal el crash era inalcanzable (la lección
  siempre está activa cuando se ve `scr-leccion`); apareció solo al disparar el handler por
  JavaScript inyectado durante la prueba (el `<anonymous>` en el stack lo delataba). Verificado:
  con `LEC=null` los handlers retornan sin crashear y sin agregar error nuevo a la consola, y el
  flujo normal de la mini-clase sigue avanzando bloques.
- **Pendientes de Roberto (arrastre, fuera del código):** pegar el argumento de evaluación
  formativa en la propuesta/guion (otro PC); enlace de agenda real para el CTA de la landing.

### Sesión 54 (2026-08-25) — 3° básico: diseño + Plan 1 (app en `/3ro`, scaffold jugable)
Roberto pidió agregar **3° básico** como producto real para colegios. Es un salto grande: son
niños de 8-9 años, un público muy distinto. Flujo completo brainstorming (con companion visual)
→ spec → plan → ejecución por subagentes. **El juego de 8° (`juego/index.html`) NO se tocó.**
- **Decisiones (brainstorming):** producto para colegios; 3° completo (4 asignaturas) pero
  **construido por etapas, partiendo por Matemática**; UX de niños = **lectura por voz**, texto
  corto/grande, **apoyo visual mixto** (código para el grueso + pocas ilustraciones), **4 opciones**
  (se mantiene), **sin reloj**; mismo esqueleto (campañas, **jefes, stickers**, tienda, ranking)
  **sin Modo Difícil**; el **nivel es propiedad del curso** (`ALU-` lo fija). **Restricción clave de
  Roberto:** 3° se construye **aislado en una app aparte `3ro/` servida en `vulpo.cl/3ro`**, sin
  enlaces desde el sitio ni las muestras, y **no aparece hasta commitear**. Spec:
  `docs/superpowers/specs/2026-08-25-3-basico-nivel-nuevo-design.md`.
- **El feature se dividió en 3 planes secuenciales:** Plan 1 (app `/3ro` + UX de niños + Matemática
  semilla), Plan 2 (contenido completo con agentes + revisión humana), Plan 3 (capa de nivel en el
  backend + panel). Plan 1:
  `docs/superpowers/plans/2026-08-25-3-basico-app-scaffold.md`.
- **Plan 1 EJECUTADO (subagentes, verificación en navegador):**
  - `3ro/index.html` = **fork** de `juego/index.html` (motor data-driven). Catálogos reemplazados por
    una campaña de Matemática 3° (`mat3`): 2 capítulos semilla (`mat3-cap1` sumas/restas,
    `mat3-cap2` contar de a saltos) con **etapas de 5 preguntas** + jefe de cap + **Jefe Final "El
    Número Perdido"**. `META_OA` de niño; `DEMO_LIBRE='mat3-cap1'`; **`FECHA_PUERTA=''`** (WIP abierto).
  - Contenido semilla a mano: `contenido/matematicas-3basico/` (`oa.json` + `preguntas.json`, 2 OA
    `MA03 OA 01`/`OA 09`, 12 preguntas, `revisada:false`), con campo opcional `visual`.
  - **UX de niños:** flag `SIN_RELOJ` (quiz sin cuenta regresiva, selector Normal/Difícil oculto);
    función `leerEnVoz` + botón **🔊 Escuchar** (Web Speech API, fallback silencioso); `renderVisual`
    + `#qVisual` (apoyo visual por código, tipo "contar" = grupos de emojis); `body.ninos` (texto
    grande: enunciado 22px, opciones 18px).
  - **Fix de integración no previsto en el plan (lo más valioso):** `renderExpediciones` (el menú)
    **crasheaba** en 3° por el cableado de 8° (buscaba la campaña de lecciones `'mate'` →
    `capitulosMate` de `undefined`) y agregaba la biblioteca de Ana Frank. Se adaptó:
    `ORDEN_ASIG=['Matemática']` (singular, como el contenido), se quitó el bloque especial de
    Matemáticas de 8° y la biblioteca, y se ocultó el botón **Duelo** (`#btnDuelo{display:none}`,
    diferido). Detalle fino: `esMate` en `terminarNivel` compara con "Matemáticas" (plural), así que
    3° "Matemática" (singular) cae —bien— en el **repaso** al fallar (3° no tiene mini-clases).
  - **Verificado end-to-end en el navegador (por DOM/JS):** JUGADOR → menú (solo Matemática, sin
    crash) → campaña (2 caps + jefe) → etapa con meta 🎯, sin reloj, 🔊 Escuchar (lee enunciado + 4
    opciones), apoyo visual (6🍎➕7🍎), texto grande, 5 preguntas → **aprobar** ("¡Nivel superado!" +
    semáforo) y **reprobar** ("Repasar sin presión" + semáforo). **8° intacto** (20 expediciones,
    reloj, selector; `SIN_RELOJ` no existe en `/juego/`), **nada enlaza a `/3ro`**.
- **Observaciones (no bloqueantes):** 3° hereda el umbral de **66%** (4/5) — afinable; la Tienda
  muestra skins de 8° (sirven de stickers); Reto/Vocabulario/Lectura quedaron inalcanzables (bien,
  diferidos); `/3ro` y `/juego` **comparten `localStorage`** (mismo origen) → XP/monedas/skins se
  comparten, se resuelve en el Plan 3.
- **Pendiente de este feature:** Plan 2 (contenido completo de Matemática 3°) y Plan 3 (backend de
  nivel + panel). Roberto probará `/3ro` en el teléfono y decidirá ajustes (umbral, etc.).
- **Pendientes de arrastre (fuera del código):** pegar el argumento de evaluación formativa en la
  propuesta/guion (otro PC); enlace de agenda real para el CTA de la landing.

### Sesión 55 (2026-08-25) — 3° básico · Plan 2: Matemática de año completo (26 OA, 792 preguntas)
Se escribió y ejecutó el **Plan 2** de 3° básico
(`docs/superpowers/plans/2026-08-25-3-basico-plan2-matematica-contenido.md`, 13 tareas), con
26 agentes redactando el banco y 6 auditores revisándolo después. **`juego/index.html` (8°) NO se
tocó en ningún paso** (verificado con `git diff` al cierre).

- **Dos defectos que el plan encontró antes de empezar, y corrigió:**
  1. **El tablero estaba ROTO.** `python scripts/generar-tablero.py` moría con
     `KeyError: 'unidades'` porque el `oa.json` semilla de 3° no traía esa clave y el script
     recorre todas las carpetas de `contenido/`. **No generaba nada, para ninguna asignatura**, y
     nadie lo había notado porque nadie lo había regenerado desde la Sesión 54.
  2. **El banco semilla estaba MAL ETIQUETADO.** Las 6 preguntas de sumas y restas llevaban
     `MA03 OA 09`, que oficialmente es **división**; su código real es `MA03 OA 06`. Importaba
     porque el mapa de dominio le reporta al profesor **por código de OA**: un profesor habría
     visto "división" flojo cuando los niños practicaron sumas.
- **El hallazgo mayor de la sesión: el apoyo visual era código muerto.** `pintaPregunta` hace
  `renderVisual(P.visual)`, pero **ninguno de los 6 constructores de preguntas copiaba el campo
  `visual`** (todos mapeaban `{q,ops,ok,tip,oa}`). Es **el mismo patrón del bug de la Sesión 23**,
  cuando `buildPreguntas` descartaba el `oa` y el mapa de dominio habría quedado vacío para siempre
  sin error visible. La Sesión 54 dio el apoyo visual por verificado, pero esa comprobación no pasó
  por el juego real. Se agregó `visual:q.visual` a los seis.
- **Catálogo de apoyos visuales ampliado de 1 a 7 tipos**, todos dibujados por código (SVG inline,
  sin archivos ni librerías): `contar` (el que ya existía), `agrupar` (multiplicar y dividir),
  `fraccion`, `recta`, `reloj` análogo, `barras` y `cuerpo` (los 6 cuerpos geométricos). Sin ellos,
  Geometría, Medición y Datos habrían quedado preguntables solo de memoria.
- **Banco de año completo:** los **26 OA oficiales** transcritos de curriculumnacional.cl con sus
  5 ejes, y **30 preguntas por OA** generadas por 26 agentes en paralelo (uno por OA), cada uno
  validando su archivo antes de entregar. Consolidado: **792 preguntas** (780 nuevas + 12 de la
  semilla), deduplicadas y con las opciones barajadas repartiendo la correcta entre las 4
  posiciones (**210/210/186/186**). Todas nacen `revisada:false`.
- **Campaña de año completo:** 7 capítulos (Números y operaciones se parte en tres porque tiene 11
  OA), **26 etapas de 10 preguntas** + 7 jefes de capítulo de 15 + el Jefe Final "El Número
  Perdido" (4 fases × 4, cubriendo los 26 OA). Las 26 metas de aprendizaje en lenguaje de niño.
  **Decisión de Roberto:** etapas de **10** preguntas, "misma extensión que 8°" — el spec §5 había
  fijado 5-6 por la edad; queda anotado que es un campo de datos (`n:`) y se baja sin rehacer nada.
- **Herramientas nuevas:** `scripts/validar-banco-3ro.py` (estructura, OA oficiales, duplicados,
  largo de lector inicial, coherencia de los visuales) y `scripts/consolidar-pool-nivel.py`. El
  `consolidar-pool.py` viejo **no servía**: está cableado a `historia-8basico`.

**La auditoría (6 agentes) y lo que cambió por ella.** Los cinco auditores de contenido coinciden
en lo que más importaba: **cero claves erróneas en las 792 preguntas**, verificadas con script y no
a ojo (aritmética, datos de cuerpos geométricos, ángulos de reloj, calendario, conversiones g/kg,
puntos medios). Ortografía y tildes limpias. Lo que sí encontraron, y se corrigió:

- **17 preguntas donde el dibujo regalaba la respuesta.** 9 de OA15 (la pregunta describía la red
  en palabras y el visual mostraba el cuerpo), 5 de OA12 (la marca dorada de la recta *era* el
  número que había que deducir del patrón), `oa24-9` y `oa24-23`. Se les quitó el visual o se movió
  la marca al último término dado. **`oa16-21` y `oa16-22` conservan el suyo a propósito**: dicen
  "¿cómo se llama **este** cuerpo?", así que el dibujo es la pregunta, no la respuesta.
- **6 rectas ilegibles.** Con 11 etiquetas de 4 dígitos (`0..1000` de 100 en 100, o los años
  1900-2000) los números se encimaban. Se arregló **en el widget**, con rotulado adaptativo, para
  que cubra también el contenido futuro. **Al calibrarlo se introdujo una regresión** —la recta
  `0..100`, que se veía perfecta, pasó a mostrar 6 etiquetas de 11— detectada al comparar capturas
  antes y después, y corregida bajando el ancho estimado por dígito de 6 a 5 unidades.
- **2 distractores más correctos que la clave.** `oa03-2` preguntaba "¿cuál es menor: 728 o 782?"
  y ofrecía **708** entre las opciones; `oa03-13` lo mismo con 607. Un niño que razonaba bien
  quedaba sin salida. Reemplazados.
- **`oa04-7`:** la marca 38 no caía en ninguna marca de una recta que saltaba de 5 en 5.

> **Lección de método: tres de los seis auditores reportaron un "BLOQUEANTE" falso** —que el motor
> no renderiza `visual`— porque grepearon **`juego/index.html`** (8°) en vez de `3ro/index.html`.
> El encargo no les decía cuál era el motor. Al despachar auditores sobre una app que es un **fork**,
> hay que nombrar el archivo explícitamente o revisan el gemelo equivocado.

**Verificado en el navegador, jugando de verdad:** captura de una etapa real de Geometría con el
paralelepípedo dibujado, la meta 🎯, sin reloj y texto grande; y recorrido completo de los **7
capítulos (33 nodos): 365 preguntas servidas, 109 con apoyo visual, cero etapas vacías, consola
limpia**. **8° intacto** (20 expediciones, con reloj) y **nada enlaza a `/3ro`**.

- **Trampa latente anotada (no corregida, no rompe nada hoy):** las opciones se pintan con
  `innerHTML` sin escapar, así que una opción que empiece con `<` seguido de **letra** perdería
  texto en silencio. Caracterizado en el navegador: `<`, `<5` y `3 < 5` se ven bien; `a <b c` no.
  **Ningún banco tiene hoy ese caso**, ni en 3° ni en 8°, pero el patrón está en las dos apps.
- **Pendiente de Roberto (decisiones pedagógicas que no me corresponden):** 7 preguntas de OA11
  exigen simplificar fracciones (3/6 = 1/2), que es de 4° básico; ~10 ítems de OA02 son en realidad
  de OA03/OA05 y harían que el mapa de dominio mida dos objetivos con las mismas preguntas; las 5
  preguntas de OA26 con visual usan barras donde el OA pide diagramas de puntos; y 8 de OA18 piden
  clasificar agudo/obtuso/llano, que va más allá del OA. Nada de eso impide jugar.
- **Pendiente que sigue igual:** la **aprobación pedagógica humana** del banco (792 preguntas,
  todas `revisada:false`), por el flujo de siempre: tablero → "Exportar revisadas" →
  `aplicar-revisadas.py`. Y el arte propio de los 7 capítulos y del villano (hoy todos caen a
  `assets/portada-matematicas.png`). El **Plan 3** (capa de nivel en el backend, `MA03` en
  `kimun_oa_asignatura`, panel consciente del nivel, y el `localStorage` compartido entre `/3ro` y
  `/juego`) queda sin empezar.

**Continuación de la misma sesión — la lectura por voz.** Roberto probó `/3ro` y reportó que "la
lectura no está sincronizada con las opciones y la voz es horrible". Las dos cosas eran ciertas, y
la primera era un **bug serio**:

- **La voz leía un orden distinto al de la pantalla.** `pintaPregunta` baraja las opciones y las
  rotula A-D por su **posición en pantalla**, pero el botón 🔊 leía `P.ops` —el arreglo **original,
  sin barajar**—, así que la pantalla mostraba "A. 6" y la voz decía "A. 4". Para un niño que
  todavía no lee de corrido, que es exactamente el público del botón, **le dictaba la respuesta
  equivocada**: peor que no tener la función. Ahora se lee el arreglo `orden`, el mismo que se
  pinta. Verificado comparando opción por opción lo que se ve contra lo que se dice.
- **`leerEnVoz` reescrita.** Tenía dos defectos: (1) `getVoices()` devuelve `[]` en la primera
  llamada porque las voces cargan asíncronas, así que casi siempre caía a la voz por defecto del
  sistema; ahora se engancha a `voiceschanged` y se cachea. (2) Tomaba "la primera que empiece con
  es"; ahora prefiere **Chile → latinoamericano → España**.
- **Lectura por partes con resaltado:** primero la pregunta, después cada opción como enunciado
  propio, y **la opción que suena se ilumina** (`.opt.leyendo`). Cambiar de pregunta corta la
  lectura anterior (`callarVoz()`), que antes se encimaba. `leerEnVoz(texto)` se conserva para
  quien solo necesite leer un texto suelto.

> **Límite verificado, y hay que decirlo antes de mostrar la app en el notebook:** en el PC de
> Roberto **no hay ninguna voz latinoamericana instalada**. Chrome expone solo Helena, Laura y
> Pablo (las tres `es-ES`), y Windows tiene registradas únicamente Helena (es-ES) y Zira (inglés).
> Por buena que sea la selección, ahí se seguirá oyendo a Helena, robótica y con acento peninsular.
> **Donde sí mejora es en el teléfono del alumno** (Android trae Google TTS con voces `es-US`/
> `es-MX`, y la lógica nueva las prefiere). Para mejorarlo en Windows hay que agregar el idioma
> **Español (México o Chile) con su paquete de voz** en Configuración → Hora e idioma; es un cambio
> del sistema, no del código, y VULPO la elegirá sola.


### Sesión 56 (2026-08-26) — La voz chilena de 3° básico, grabada y en el repo
Cierra el pendiente que quedó abierto en la Sesión 55: la lectura por voz de `/3ro` dependía de lo
que el aparato tuviera instalado, y en el PC de Roberto eso es Helena, robótica y de España. Ahora
la voz **viaja con el proyecto**. Plan: `docs/superpowers/plans/2026-08-25-voz-pregrabada-3ro.md`.
**`juego/index.html` (8°) NO se tocó** (verificado al cierre).

- **Voz elegida: `es-CL-CatalinaNeural` de Azure**, a **−10%** de velocidad y **48 kbps sin
  recomprimir**. Las dos cosas las decidió Roberto escuchando: la velocidad porque son niños de 8
  años que recién decodifican, y la calidad porque recomprimir a 24 kbps ahorraba la mitad del peso
  pero dejaba la voz metálica. Quedaron documentadas **en el código con su porqué**, para que nadie
  las "optimice" más adelante sin saber que se tomaron con el oído.
- **Por qué Azure y no `edge-tts`:** da la misma voz gratis, pero sus términos no autorizan
  claramente redistribuir el audio en un producto que se vende. Se descartaron también tres voces
  de Piper (una con licencia limpia): Roberto las comparó y "sigue siendo mucho mejor Catalina".
- **1.987 clips · 39,3 MB · US$1,07 en total** (US$0,82 la primera tanda + US$0,25 de correcciones).
  El nombre de cada archivo es un **hash del texto mostrado**, así una opción repetida ("12",
  "Cubo") comparte archivo y corregir una pregunta regenera solo su clip.
- **La clave de Azure vive FUERA del repo** (que es público), y `.gitignore` la blinda por si acaso.

**Tres defectos reales del audio, encontrados comparando qué se VE contra qué se DICE.** Ningún
chequeo de bytes los habría visto; los tres estaban ya generados:
1. **Un clip mudo de 0 bytes:** la opción `-` de una pregunta de signos. El normalizador convertía
   el guion solo *entre dígitos*, así que llegó solo a Azure y no había nada que pronunciar. En
   pantalla el niño toca 🔊 y no pasa nada: parece un botón roto. Ahora los signos sueltos se
   nombran ("el signo menos").
2. **El peor — `:` leído como "dividido en" en el conteo salteado:** Catalina decía *"cuenta de
   diez en diez DIVIDIDO EN diez, veinte, treinta"*, un disparate y justo en el contenido que la
   pregunta enseña. El criterio que lo resuelve es limpio y se verificó sobre los 124 textos con
   dos puntos del banco: la **división siempre trae espacios a ambos lados** (`18 : 6`, todas de
   OA09) y la **hora y el listado lo traen pegado** (`7:45`, `de 10 en 10: 10`).
3. **"a las las 3 en punto"** en las 72 preguntas de reloj: la función de hora anteponía el
   artículo sin mirar que el enunciado ya lo traía.

> **Un error propio, corregido antes de generar:** al arreglar el punto 2 se colapsaron las comas
> repetidas y eso **se comió el espacio en blanco**: "35, 40, ___, 50" quedaba como *"35, 40, 50"*,
> que suena a que esa es la secuencia. Peor que el problema original, y peor justo para el niño que
> escucha en vez de leer. El blanco ahora **se nombra**: "el espacio en blanco".

Tras los arreglos se regeneraron **los 542 clips cuyo texto hablado difiere del mostrado** —el
único conjunto que el normalizador puede haber tocado— en vez de adivinar cuáles quedaron mal.

- **Reproductor (`3ro/index.html`):** `sonarClip()` busca el texto en el manifiesto y devuelve
  `false` si no está, para **caer a la voz del navegador**; `callarVoz()` ahora también detiene el
  MP3. La lectura es una **cola encadenada**, no una serie de llamadas seguidas: con
  `speechSynthesis` bastaba encolar porque el navegador serializa solo, pero `Audio` es asíncrono de
  verdad y sin encadenar sonarían los cinco clips encima. Cada clip arranca el siguiente en su
  `onended` **y en su `onerror`**, para que un archivo roto no deje la cadena colgada.
- **Se dejó de decir la letra ("A.", "B.")**: así el clip de "6" sirve en cualquier posición —si no,
  habría que generar cuatro versiones de cada opción— y, más importante, el niño oye lo mismo suene
  el MP3 o el respaldo.
- **Voz también en la meta 🎯 y en el resultado.** Los dos botones leen el texto **en el momento del
  clic**, no al cablearse: el titular del resultado lo pintan tres caminos distintos (etapa
  aprobada, reprobada y refuerzo), así ninguno tiene que acordarse de la voz.
- **Verificado.** En **Node** (determinista): orden exacto pregunta→4 opciones, **0 solapamientos**,
  mezcla correcta de clip y respaldo en la misma cola, y al cambiar de pregunta la cola vieja se
  corta. En el **navegador**: `VOZ_BASE` resuelve bien pese al `<base href="/">`, manifiesto HTTP
  200 con 1.987 entradas, una pregunta real encontrada en el mapa (o sea las claves calzan exacto
  con lo que se muestra) y los dos botones presentes. Banco sin errores y sintaxis JS OK.

> **Gotcha de método (nuevo):** `--virtual-time-budget` de Chrome headless **se cuelga en `/3ro`**,
> porque el audio del juego corre en tiempo real y el tiempo virtual no avanza. Por eso la cola se
> probó en Node y en el navegador solo lo que Node no puede ver. Segundo gotcha: al inyectar un
> bloque de prueba en el HTML desde Python, **las barras invertidas se colapsan** y dejan una
> cadena JS sin cerrar que falla **en silencio** (el `<pre>` queda vacío y parece que "no corrió").
> Escribir el bloque con un heredoc literal (`<<'HTML'`) lo evita.

- **Observación pedagógica que queda para Roberto:** las **dos preguntas de "¿qué signo va aquí?"**
  tienen un cuarto distractor de relleno (`-` en una, `+` en la otra). **No es corregible tocando
  distractores: solo existen tres signos de comparación**, así que el formato de 4 opciones es
  estructuralmente imposible ahí y el niño queda siempre en un 1-de-3. Arreglarlo es rediseñar el
  ítem.
- **Alcance decidido:** pregrabar la voz vale de **1° a 4° básico**. De 5° hacia arriba es
  accesibilidad y basta la voz del navegador: **no gastar ahí**. Cada asignatura nueva de 3° genera
  su audio corriendo el mismo script con su banco.
- **Pendientes de arrastre:** aprobación pedagógica humana de las 792 preguntas de Matemática 3°;
  arte de los 7 capítulos y del villano; **Plan 3** (capa de nivel en el backend y el
  `localStorage` compartido entre `/3ro` y `/juego`); y fuera del código, la SpA para facturar,
  INAPI, la foto semanal, el argumento de evaluación formativa en la propuesta y el enlace de
  agenda real para el CTA de la landing.

**Continuación de la Sesión 56 — la auditoría de cómo SUENA cada clip.** Roberto probó la voz y
reportó que "de 3 en 3" se leía "tres **enero** tres". Era cierto, y al perseguirlo aparecieron dos
defectos más que nadie había notado. Lo importante del episodio es el **método**: leer el texto
normalizado NO basta —"de 10 en 10" se ve perfecto en texto— y escuchar 1.987 clips a mano no es
viable.
- **Herramienta nueva `scripts/auditar-voz-3ro.py`:** transcribe cada MP3 con el **reconocimiento de
  voz** del mismo recurso de Azure y **reporta las palabras que se oyen y no estaban en el texto**.
  Una intrusa que se repite —"enero"— delata un patrón mal leído. Compara **palabras y no textos
  completos** a propósito: el transcriptor escribe los números a su manera (pega "9, 12, 15" como
  "91215") y comparar frases enteras daría puro ruido. La transcripción de los 1.987 clips **se
  versiona** en `dev/auditoria-voz-3ro.json` (~120 KB): es la evidencia de cómo suena cada uno y
  permite revisar un cambio del banco **sin volver a pagar**. Costo de la pasada completa: ~US$2
  (1,9 horas de audio).
- **1 · El "enero" (43 clips).** `en` es la abreviatura de enero, así que "de 10 en 10:" se leía
  "10 **de enero de** 10". El disparador resultó **específico del 10** (`3 en 3`, `4 en 4`, `5 en 5`
  y `100 en 100` leen bien), pero se desarmó la construcción entera escribiendo el número con
  palabras (`de diez en diez`) para no depender de qué número toque.
- **2 · La resta desaparecía (17 preguntas) — peor que el anterior, porque no suena raro sino
  coherente y equivocado.** La regla convertía el `-` solo **entre dígitos**, así que en
  `🔷 - 9 = 11` o `20 - ___ = 12` el signo se perdía y el niño oía *"el rombo nueve es igual a
  once"*: **la operación no estaba**. Antes de generalizar se verificó que en las 792 preguntas **no
  hay un solo guion usado como puntuación**, lo que hace seguro convertir cualquier guion con
  espacios.
- **3 · Los emoji leídos por su nombre Unicode (21 preguntas).** `⚡ JEFE` sonaba "**alto voltaje**
  jefe" y `Cada 📕 vale 2 libros` sonaba "cada **libro cerrado** vale dos libros". Ahora los 10
  emoji contables tienen nombre propio y **concuerdan en número** ("Ana dibujó 4 manzanas", no
  "cuatro manzana roja"), y el emoji **decorativo** de los nombres de etapa se quita antes de
  sintetizar (ahí no aporta nada hablado).
- **Una alarma falsa descartada, y vale registrarla:** la transcripción mostraba las listas pegadas
  (`9, 12, 15` → "91215") y parecía otro defecto. Se sintetizó la misma frase escrita **con palabras
  y con dígitos**: suenan **idéntico**. Era cómo el transcriptor escribe, no cómo la voz habla.
- **Lo que el informe sigue marcando y NO es problema:** artefactos del transcriptor —escribe "cm"
  donde se dice "centímetros", "Thomas" por "Tomás"— y **homófonos reales del castellano**
  ("de a saltos"/"de asaltos", "esa hora"/"es ahora"). Al leer el informe hay que separar eso de un
  defecto de verdad.
- **Queda a criterio de Roberto:** `(D, 3)` se lee "la casilla **de**, tres", porque la letra D se
  pronuncia así. Es correcto —un profesor diría lo mismo— pero al oído es ambiguo con "la casilla de
  3". No se cambió; si molesta, la salida es decir "columna D, fila 3".
- 130 clips regenerados y **re-auditados**. Costo de esta tanda: ~US$2,08.

**Cierre de la Sesión 56 — informe pedagógico externo, revisión final y modo profesor.**
Roberto encargó un informe de revisión del banco de Matemática 3° y pidió (1) corregir todo lo
corregible automáticamente y (2) montar la parte humana sobre el módulo de enlaces de muestra.

- **El informe externo, verificado uno por uno: 11 hallazgos correctos de 13.** Lo valioso no fue
  aplicarlo sino contrastarlo, porque **dos de sus correcciones habrían METIDO errores**:
  - `mat3-oa14-21` y `-22` **no tenían la clave mal**: el informe invirtió el convenio de la
    cuadrícula, que este banco declara y usa igual en sus 15 preguntas del OA 14 (*"la letra dice
    la columna y el número dice la fila"*). Aplicar su corrección habría dejado esas dos
    contradiciendo a las otras trece.
  - Pedía cambiar "Vulpi" por "Vulpo". Es al revés: **la plataforma es VULPO y la mascota Vulpi**.
- **Corregido (9 preguntas, sin tocar ninguna respuesta correcta, con aserción en el script):** el
  tip de `oa03-10` decía "20 pasos" donde son *unidades*; `oa14-8` preguntaba "¿cuántas filas hay
  **entre** ellos?", que se lee literal como las intermedias (3) **y 3 era una de las opciones**;
  `oa19-26` pedía 2019, que no estaba entre las opciones; `oa16-30` decía "una pirámide", que no
  tiene un número fijo de vértices; y 5 preguntas del OA 15 omitían que las piezas deben formar
  una **red** válida (término del OA oficial).
- **No se corrigió, con razón:** "parte curva" → "sector circular" (el informe mismo lo condiciona
  a que el término ya se haya enseñado, y **no es de 3° básico**); y `oa17-5`, cuya objeción es
  válida pero académica para 8 años.
- **El mejor hallazgo del informe era de accesibilidad y era cierto:** los dibujos iban con
  `aria-hidden="true"`, así que **para un lector de pantalla no existían**. Ahora cada uno lleva
  descripción (`textoVisual`), **cuidando no delatar la respuesta**: una marca `oculta` se
  describe como "hay una marca en uno de los saltos, sin su número", y un cuerpo geométrico no se
  nombra. Sus recomendaciones de voz (`$90`, `1/4`, emojis, `1.000`) **ya estaban hechas**: el
  informe se escribió mirando el HTML, sin ver la capa de normalización.
- **`scripts/generar-revision-preguntas.py` (nuevo):** documento de revisión agrupado por unidad →
  OA → preguntas, con el texto oficial del OA, la clave marcada y casilla. **Incrusta el dibujo
  real** reutilizando `renderVisual` del juego, porque 232 de las 792 preguntas llevan dibujo y sin
  él son irrevisables en papel. No se usó `generar-pdf-preguntas.py`: agrupa solo por OA, no
  muestra dibujos y su librería (fpdf2, ni siquiera instalada) no dibuja `▢ 🔺 🍎`.
  > **Trampa que costó caro:** al agregar `textoVisual` antes de `svgEnvoltura`, el extractor del
  > generador —que empezaba en `svgEnvoltura`— dejó fuera una dependencia y **los 232 dibujos
  > desaparecieron sin ningún error**, porque el `catch` los reemplazaba por texto. Se detectó
  > porque el PDF bajó de 172 a 146 páginas. Ahora el documento **grita en rojo** en su primera
  > página si algún dibujo falla.
- **`scripts/auditar-banco-3ro.py` (nuevo) — la capa automática.** Comprobaciones que antes se
  hacían a mano una vez: clave aritmética, el dibujo que regala la respuesta, formato mezclado y
  **sesgo de largo** (la correcta es la más larga en 32,8%, cuando al azar sería 25%). Resultado
  sobre las 792: **0 errores**, con **85 claves verificadas por cálculo**. Ese 10% es el límite
  real: el resto son problemas con enunciado que ningún script puede verificar, y por eso la capa
  humana no es opcional.
  > **Dos lecciones propias, porque la primera versión acusó 13 preguntas CORRECTAS:** (a) el
  > punto final de "Suma 120 + 230 + 150." entraba en la clase del lookahead y cortaba la
  > expresión en "120 + 230"; (b) en "Si 7 + 5 = 12, ¿cuánto es 12 − 5?" tomaba la primera
  > operación y la comparaba con la clave de la segunda. Además se **retiró** la comprobación de
  > "distractor fuera de escala": de 34 avisos, 31 eran distractores **buenos** (para
  > "300 + 40 + 5", el `3405` es el error típico de escribir el numeral literal). Una comprobación
  > que acusa lo correcto entrena a ignorar el informe.
- **Modo revisión de profesor:** ver la sección de parámetros de URL arriba. Se montó **fuera de
  los juegos** para no reescribirlo en cada curso, quedó en **3 preguntas por etapa** (decisión de
  Roberto) y está activo en **8° y 3°**. Verificado en ambos, con y sin el modo, sin regresión.
  **Pendiente de Roberto: probar la grabación de voz en el teléfono** — un navegador sin interfaz
  no puede dar permiso de micrófono, así que esa parte no se pudo comprobar aquí.

**Post scriptum de la Sesión 56 — el modo revisión podía matar el juego.** Roberto probó los dos
enlaces: el de 8° funcionó y el de 3° no ("se veía la pantalla inicial pero al apretar no
partía"). No era el enlace ni el token: era que `assets/js/revision.js` tardó ~2 minutos en
propagar y, mientras tanto, `REV.init` reventaba en el nivel superior y se llevaba puesto todo el
JavaScript del juego. Reproducido y corregido con un respaldo vacío; ver el detalle en `?rev=1`,
arriba. **La lección, que es más grande que el bug:** el módulo se dio por verificado probándolo
**con el archivo presente**, y nunca con el archivo ausente. Al mover código a un `<script src>`
hay que probar los dos casos.

**Post scriptum 2 — y el fallo real de 3°.** El respaldo del script no era toda la historia: al
volver a probar, la lista de capítulos se veía pero **al tocar uno no pasaba nada**. Causa: al
quitar de `3ro/index.html` el código de revisión que había inyectado antes de sacarlo al archivo
compartido, un cálculo de índices cortó de más y dejó `const XP_POR_NIVEL=100;` convertida en
`00;`. `refreshHud()` reventaba con *"XP_POR_NIVEL is not defined"* y **3° quedaba injugable en
todos sus modos**, no solo en revisión. El mismo corte dejó además una línea huérfana de CSS que
desbalanceaba el bloque (506 `{` contra 507 `}`) justo antes de `.q-visual`.
> **Dos lecciones de método, las dos caras:**
> 1. **Un error dentro de un `.then()` NO dispara `window.onerror`**: se convierte en un rechazo
>    silencioso. Por eso las primeras pruebas no mostraron nada y parecía que la función "se salía
>    sola". Al depurar el motor hay que escuchar **también** `unhandledrejection`.
> 2. **Nunca borrar código con aritmética de índices ni con filtros por prefijo de línea.** Los dos
>    métodos cortaron a la mitad cosas ajenas. Y las pruebas no lo vieron porque llamaban a
>    `activarExpedicion`/`buildPreguntas` directamente, **sin pasar por `refreshHud`**: probar por
>    funciones sueltas no equivale a recorrer la pantalla. Verificaciones nuevas que quedan:
>    `git diff` contra la versión anterior filtrando lo esperado, y contar llaves del bloque CSS.

**Post scriptum 3 — la voz no se callaba al responder.** Roberto: *"al seleccionar una opción el
juego sigue hablando la pregunta"*. Cortaba solo al **pintar** la pregunta siguiente, y entre
responder y esa pintura hay una pausa (o el botón Continuar, que puede tardar lo que el niño
quiera): mientras tanto seguía leyendo las opciones que faltaban **encima del "¡Correcto!" y de la
explicación**, que es justo cuando hay que escuchar otra cosa. Ahora `callarVoz()` se llama (1) al
**responder**, y (2) en `go()`, de modo que **ninguna pantalla hereda la lectura de la anterior**.
Aplica a todo el juego de 3°, no solo a los enlaces de muestra. 8° no tiene lectura por voz.
> **Trampa que casi arruina el arreglo:** `speechSynthesis.cancel()` **dispara el evento `end`**
> de la frase en curso en varios navegadores, y ese evento es justamente el que encadena el clip
> siguiente. Sin invalidar la cola (`_COLA_ID++`) **lo primero** dentro de `callarVoz`, mandar
> callar podía **adelantar** la lectura en vez de detenerla. Verificado con un doble de
> `sonarClip`: leyendo 2 de 5 y respondiendo, no se pide ninguno más; sin interrumpir se leen los
> 5; y cambiar de pantalla a mitad también corta.

### Sesión 57 (2026-08-26) — Enviar pruebas de 3° desde el panel, y una barrida de defectos con navegador real
Sesión corta de arreglos. Empezó con un reporte de Roberto —"en el panel de profes no puedo
mandar pruebas desde 3ro"— y terminó con una herramienta de verificación que cambia cómo se
comprueba todo lo demás. **No se tocó contenido**: ningún banco, ninguna pregunta, ningún audio.
- **El panel no ofrecía 3°.** El botón "🔗 Armar enlace de muestra" llevaba **fijo** a
  `/juego/?armar=1`, así que no era que 3° no apareciera: no existía como opción. Ahora hay un
  **selector de nivel** alimentado por `NIVELES_MUESTRA`, y **agregar un curso futuro es una
  línea**. Como cada app tiene su propio armador y lista su propio catálogo, no hay listas
  paralelas que mantener. Verificado en pantalla con un doble de Supabase (el panel no se abre
  sin sesión real): las dos opciones apuntan a `/juego/?armar=1` y `/3ro/?armar=1`, sin desborde.

**La herramienta: `scripts/cdp.mjs`.** Node 22+ trae `WebSocket` nativo, así que se puede manejar
Chrome por CDP sin instalar nada. Resuelve el problema que se arrastraba desde la Sesión 45:
`--dump-dom` fotografía el DOM al `load` —demasiado pronto para un juego que arma su pantalla
después— y `--virtual-time-budget` **se cuelga** con estos juegos porque su audio corre en tiempo
real. Ahora se navega, se hace clic y se evalúa JavaScript de verdad, y además **se capturan los
404**, que no llegan a la consola de forma fiable: hay que mirarlos en la red.
> **Se pagó sola en la primera corrida:** delató que un cambio propio de esta misma sesión rompía
> **todo el JavaScript de 3°** (declaré `NS`, que ya estaba tomado por el namespace de SVG). Es
> exactamente el fallo silencioso que costó dos post scriptums en la Sesión 56 — y esta vez se vio
> en el minuto uno en vez de después de desplegar.

**Cuatro defectos arreglados, los tres primeros invisibles hasta ahora:**
1. **3° y 8° compartían el archivo de guardado.** Las dos apps se sirven del mismo origen y las dos
   escribían en `kimun_save`: un niño con los dos juegos compartía monedas, skins y avance de
   campaña. En 3° las claves llevan `SUFIJO='_3ro'`. Los **ajustes de audio se comparten a
   propósito**. Probado sembrando una partida de 8° (777 XP), jugando 3° y volviendo: 8° intacto.
   **Consecuencia asumida: el avance local de 3° parte de cero**, porque estaba mezclado con el de
   8° y desenredarlo no vale la pena (solo Roberto había jugado 3°).
2. **Siete 404 en 3°.** Cada capítulo pedía `assets/portada-mat3-capN.png`, que no existe; el
   `onerror` los tapaba a la vista, **no en la red**. Es el gotcha que este mismo archivo ya
   advertía, cumpliéndose. La portada de capítulo pasó a ser **explícita** en 3°.
3. **El escapado de las opciones**, la trampa latente anotada en la Sesión 55. Antes de tocar nada
   se verificó que en las **19.980 cadenas** de los siete bancos no hay ni un `<` ni un `&`, así que
   escapar no rompe ningún contenido. Con un `<img src=x onerror=alert(1)>` inyectado en una
   pregunta real: sale como texto, **0 elementos creados**.
4. **`profesor.html` no tenía favicon** (un 404 en cada carga).

- **Verificado de punta a punta, con la consola limpia y cero 404:** etapa completa jugada hasta el
  resultado en 3° y en 8°; **los dos enlaces de revisión** (3 preguntas por etapa, 🚩, sin fuga por
  "Volver"); las 4 campañas, tienda, perfil, duelo, Reto de Cálculo y biblioteca. Los **1.987 clips
  de voz**: ninguno falta, ninguno pesa 0 bytes. Los validadores del banco de 3°: 0 errores.
- **Lección de método:** el barrido de referencias rotas **leyendo los archivos** dio puros falsos
  positivos (expresiones de plantilla) y no habría encontrado ni uno de los siete 404 reales, porque
  la ruta se arma en tiempo de ejecución. Los 404 hay que cazarlos **corriendo la página**.
- **Pendientes que quedan y NO dependen del asistente:** los trámites (INAPI, SpA, enlace de agenda);
  la aprobación pedagógica de las 792 preguntas de 3° y sus decisiones de contenido —dos de ellas
  cuestan plata, porque rehacer las preguntas de signos obliga a regenerar sus clips de Azure—; el
  arte de los 7 capítulos y del villano de 3°; **pegar el SQL de la foto semanal** (urge antes del
  piloto); y el **Plan 3**, con sus dos agujeros ya documentados: 3° y 8° comparten la sesión anónima
  de Supabase (el XP se mezcla en el ranking) y `kimun_oa_asignatura` no conoce `MA03`.

### Sesión 58 (2026-08-26) — 3° deja de compartir identidad con 8°: el nivel entra al modelo
Roberto pidió cerrar el punto que impedía conectar 3° a un curso real: 3° y 8° se sirven del
mismo origen y compartían **la sesión anónima de Supabase**, o sea el mismo perfil, el mismo XP
en el ranking y el mismo vínculo con un código `ALU-`; y el servidor no reconocía los objetivos
`MA03`, así que el avance de 3° no era filtrable por asignatura en el panel. Era el **Plan 3**.
Salió más chico de lo previsto porque **ninguna de las dos cosas necesitaba una entidad nueva**.
- **La identidad, sin una línea de SQL.** El patrón ya existía en el proyecto: `profesor.html` usa
  un `storageKey` propio justo para que un adulto que inicia sesión no le borre la identidad al
  niño. 3° ahora crea su cliente con `storageKey:'kimun-3ro'`. **Verificado en el navegador:** 8°
  obtiene un id de perfil, 3° crea otro distinto, y volver a 8° recupera el suyo.
- **El nivel viaja en el código de asignatura, que ya lo codificaba.** Estuve por proponer una
  columna `nivel` en `cursos` y el modelo ya lo resolvía: los códigos son cuatro letras que
  incluyen el año (`HI08`, `MA08`…). 3° es simplemente **`MA03`**, una asignatura más, y el
  aislamiento por asignatura que funciona desde la Sesión 37 separa solo un curso de 3° de uno de
  8°. **Sin tabla, sin columna, sin migración, sin entidad "Colegio".**
- **Cuatro listas que había que tocar** —`kimun_oa_asignatura` y `kimun_prof_asignaturas` en el
  servidor; `OA_CARPETA`, `ASIG_NOMBRE`/`ASIG_ORDEN` y el espejo `SB_asigDe` en el panel; y
  `ASIG_DESAFIO_NOMBRE` en el juego de 3°—. La segunda es la peligrosa: **si a
  `kimun_prof_asignaturas` le falta un código, ese contenido queda INVISIBLE para el Profesor
  Jefe sin ningún error**, así que la función lleva ahora una advertencia encima.
- **De paso se cerró la causa del bug de la Sesión 37:** la lista de asignaturas del bloque de
  refuerzo estaba escrita a mano —por eso una vez faltó Matemática y no se podía lanzar su
  refuerzo— y ahora se lee del catálogo. Una lista paralela menos que mantener.
- **Verificado en el panel** (con un doble de Supabase, porque no se abre sin sesión): `MA03 OA 07`
  mapea a `MA03`, carga el **texto real del objetivo** desde `matematicas-3basico/oa.json`, cuenta
  sus **26 OA** para el denominador del ranking, y aparece como "Matemática 3°" en el filtro, en el
  refuerzo y en las casillas del equipo. Regresión: etapa completa jugada en 3° y en 8°, el enlace
  de revisión de 3°, el guardado separado y la voz completa. Cero 404 y consola limpia.
- **`supabase/schema.sql` aplicado por Roberto en producción.** El asistente no ejecuta SQL contra
  la base; le dejó una consulta de verificación de **tres filas** (que `MA03` se reconoce, que
  `MA08` sigue igual, y que `kimun_prof_asignaturas` incluye `MA03`).
- **Callejón sin salida corregido:** al armador (`?armar=1`) solo se llega desde el panel, pero no
  tenía forma de volver —el modo armador apaga la barra inferior y el botón Volver—, así que había
  que escribir la dirección a mano. Los dos juegos tienen ahora "← Volver al panel del profesor".
  Comprobado que el clic **navega de verdad**, no solo que el enlace exista. Es el mismo tipo de
  callejón que se cerró en la Sesión 49 con la pantalla de fin de demo.
- **Decisión asumida:** las casillas de "Equipo del curso" muestran ahora cinco asignaturas en
  **todos** los cursos, incluidos los de 8°. Es el precio de no tener nivel en `cursos`, y se
  prefirió a inventar una entidad para un solo colegio.
- **Lo que esto habilita:** un curso de 3° ya puede convivir con uno de 8° en el mismo panel. Para
  **vender** 3° siguen faltando la aprobación pedagógica de sus 792 preguntas, su arte propio y las
  otras tres asignaturas.

**Continuación de la Sesión 58 — quién está a cargo, visible en el listado.** Roberto creó un
curso de 3° y notó que el encabezado no dice qué profesor lo tiene asignado. Ahora, entre "N
alumnos" y la participación, cada curso muestra **"👤 Profesor jefe: <nombre> · N de asignatura"**.
- **El caso que lo hizo evidente es el suyo:** desde la Sesión 38 **un curso nace sin Jefe** (el
  creador ya no se auto-nombra), así que su 3A recién creado no tenía a nadie a cargo. Eso antes
  solo se veía abriendo el curso y entrando a "Equipo del curso"; ahora el listado lo dice con
  **"⚠️ Sin profesor jefe"** en dorado, que es información accionable, no decoración.
- **Sin SQL:** sale de `kimun_prof_equipo`, que ya existía, cargada en segundo plano igual que la
  participación, y **capturando el nodo antes del `await`** para no repetir la carrera de la
  Sesión 26 (la respuesta lenta de un curso escribiéndose bajo el encabezado de otro).
- **A un profe de asignatura la línea le queda vacía**, no con un error: `kimun_prof_equipo` solo
  responde a Admin/Super/Jefe, y quién está a cargo no es información suya.
- Verificado con un doble de Supabase en los tres casos (sin jefe, con equipo completo, sin
  permiso) y **a 375 px sin desborde**, que es donde este panel ya falló en la Sesión 26. De paso
  `scripts/cdp.mjs` ganó emulación de teléfono (`ev.movil()`).

### Sesión 59 (2026-08-26) — Historia de 3° básico: 480 preguntas, campaña y cuatro dibujos nuevos
Roberto pidió, con `/loop`, desarrollar Historia de 3° "hasta que quede a la par de Matemática".
Se hizo en ocho vueltas autopautadas, con el flujo de siempre: currículum → diseño → plan →
ejecución por fases, verificando en el navegador. **Matemática 3° y 8° no se tocaron** (las dos
se jugaron completas al cierre).

**El currículum, fijado antes de escribir una sola pregunta.** Son **16 OA con código `HI03`**
—el mismo prefijo de cuatro letras que ya usa todo el sistema— en tres ejes, y el Programa de
Estudio los reparte en **cuatro unidades**. Esa estructura oficial es mejor que la que se iba a
inventar: es como un profesor chileno planifica el año. Los textos se transcribieron del portal
del MINEDUC y se contrastaron con una segunda ficha del mismo portal antes de fijarlos.

**El problema que Matemática no tenía.** Cuatro de los dieciséis objetivos son **actitudinales**
—*asumir* deberes, *mostrar* actitudes, *mantener* conducta honesta, *participar*—. Un quiz de
opción múltiple **no puede medir ninguna de esas cosas**: solo puede medir si el niño **reconoce**
la acción correcta, que no es lo mismo. Importa porque el mapa de dominio le va a mostrar al
profesor un porcentaje junto a "Mantener una conducta honesta", y **eso se lee como una nota de
conducta**. Decisión: incluirlos, redactados siempre como la situación de otra persona con nombre
("¿qué debería hacer Ana si…?") y **nunca** preguntando por la conducta del propio jugador; la
advertencia quedó escrita en `oa.json` (`nota_evaluacion`).

- **Banco: 480 preguntas** (16 OA × 30), cero duplicados, correcta repartida 125/104/122/129 entre
  las cuatro posiciones. Nacen `revisada:false`. Consolidador propio
  (`scripts/consolidar-pool-hist3.py`), que baraja: las tandas se escriben con la correcta siempre
  primera, cómodo para redactar y desastroso para jugar.
- **Campaña:** 5 capítulos siguiendo las unidades oficiales (Nuestro planeta · La antigua Grecia ·
  La antigua Roma · Mis deberes y mis derechos · Vivir juntos) + Jefe Final **"El Olvido"**, y las
  16 metas de aprendizaje en lenguaje de niño.
- **Cuatro dibujos nuevos por código** (SVG, sin archivos ni librerías): `cuadricula`, `globo`,
  `zonas` y `linea`. Sin ellos, tres OA quedaban preguntables solo de memoria. **33 preguntas**
  llevan apoyo visual.
- **El profesor ya ve `HI03`** por el mismo camino que `MA03` en la Sesión 58: una línea en
  `kimun_oa_asignatura`, el código en las dos listas de `kimun_prof_asignaturas`, y las cuatro
  entradas de catálogo del panel. ⚠️ **Requiere re-aplicar `supabase/schema.sql`.**

**Herramienta nueva: `scripts/revisar-tanda.py`**, que revisa cada tanda antes de consolidarla.
Cada comprobación nació de un defecto real, y **dos de ellas se corrigieron a sí mismas**:
- **Sesgo de largo, bien medido.** La primera versión contaba empates (`(B, 2)` vs `(A, 2)`) y daba
  57% donde no había ninguna pista. La medida buena exige que la correcta le saque margen a
  **todas** las demás. Con eso apareció el patrón real: las preguntas de **definición y de
  explicación** lo generan casi solas (OA 15 llegó a 30%), porque la respuesta verdadera necesita
  ser precisa y los distractores salen sueltos. La corrección nunca fue acortar la correcta hasta
  dejarla imprecisa, sino **darles cuerpo a los distractores**, que de paso quedaron más plausibles.
- **Un chequeo que hubo que tirar.** Marcar palabras del tip ausentes de la pregunta disparó en
  cientos de casos, porque un buen tip explica con vocabulario nuevo ("Zeus era el jefe de los
  dioses del Olimpo"). Se reemplazó por detección de **casi-duplicados**, que apunta al defecto
  real. Encontró 19 pares; se revisaron **uno por uno** y todos eran pares deliberados de contraste
  (*opuesto al norte / opuesto al este*), así que quedó como **aviso, no error**: marcarlos como
  error entrenaría a ignorar el informe, que es exactamente lo que pasó con una comprobación de la
  Sesión 56.

**El error propio más grave de la sesión, y cómo apareció.** Al acortar el enunciado de
`hist3-oa06-27` (medía 114 caracteres) se le pegó encima el texto de la pregunta siguiente
**dejando intactas sus opciones y su tip**. Quedó una pregunta sobre un río y un puente en la misma
fila —cuya respuesta es "al este"— con la clave **"al sur"** y un tip que hablaba de una escuela
inexistente: **un niño que razonaba bien quedaba marcado como equivocado**. No lo encontró ningún
script: apareció al listar el banco para decidir dónde poner dibujos.
> **Lección:** al cambiar el ENUNCIADO de una pregunta hay que releer su clave y su tip. Tocar solo
> el campo `pregunta` fue lo que la rompió.

**Verificar mirando, no contando.** Se le agregaron **captura de pantalla** y **emulación de
teléfono** a `scripts/cdp.mjs`, y ahí apareció lo que ningún conteo de elementos SVG habría dicho:
las franjas climáticas **no se leían como franjas climáticas** —los colores a media opacidad sobre
el violeta del juego quedaban barrosos y la zona cálida se veía **marrón**—, el realce dorado
parecía dos líneas sueltas, y la línea del Ecuador a trazo lleno **parecía una grieta partiendo el
planeta**. Las tres se corrigieron mirando la imagen.

**Tres dibujos descartados a propósito, y es la decisión más fina del trabajo.** En *"¿cuántos
trópicos tiene el planeta?"* el globo dibuja **cinco** líneas (dos trópicos, dos círculos polares y
el Ecuador): un niño contaría cinco y elegiría mal. Peor en *"¿cuántas zonas climáticas hay?"*,
donde **"Cinco" es justo uno de los distractores**. Un dibujo que induce al error es peor que
ninguno; los descartes quedaron comentados en el código para que nadie los "complete" después.

- **Pendiente de Roberto:** autorizar la **voz** (~2.400 clips, del orden de **US$1,2** de su cuenta
  Azure; es lo que hace usable 3° para quien aún no lee de corrido, y va al final porque cada
  corrección posterior obliga a regenerar su clip); el **arte** (5 portadas de capítulo y "El
  Olvido", que hoy usa prestado el villano de Historia de 8°); la **aprobación pedagógica** de las
  480 preguntas; y **re-aplicar el esquema**.
- Diseño: `docs/superpowers/specs/2026-08-26-historia-3basico-design.md`. Plan de 6 fases:
  `docs/superpowers/plans/2026-08-26-historia-3basico.md`.

### Sesión 60 (2026-08-26) — La voz de Historia 3° y la foto semanal en un solo pegado
Dos encargos de Roberto: aplicar la foto semanal y generar la voz de Historia de 3°.

- **La foto semanal NO la aplicó el asistente, y no por prudencia sino por imposibilidad:**
  no hay `psql` ni CLI de Supabase en el equipo, y la única credencial del proyecto es la
  clave pública, que por diseño no toca la estructura. Lo que sí se hizo fue convertir los
  seis pasos del runbook en **un solo pegado**, `supabase/aplicar-foto-semanal.sql`, que
  habilita `pg_cron`, agenda el trabajo y **se verifica solo** (4 filas que deben decir
  `ok`). La diferencia es de fondo: el bloque que agenda vive dentro de `schema.sql` y
  **falla en silencio** cuando la extensión no está habilitada —a propósito, para que una
  migración nunca aborte a medias—, y eso es exactamente por lo que esto llevaba meses sin
  quedar hecho sin que nadie viera un error. El archivo nuevo habilita la extensión
  **antes** de agendar, así que ese caso no puede ocurrir. El runbook quedó con el camino
  corto arriba y el largo como referencia.
- **Voz de Historia 3°: 2.287 clips, 36,8 MB, US$0,96.** Cobertura verificada contra el
  banco (los 480 enunciados y sus 1.920 opciones tienen clip y el archivo existe) y
  recorrido real en el navegador con `cdp.mjs`: enunciado y 4 opciones resuelven a un
  archivo que responde 200, sin reloj, consola limpia y cero 404.
- **Una carpeta de clips por asignatura** (`assets/voz/mat3/`, `assets/voz/hist3/`) y el
  juego **fusiona los dos manifiestos**, guardando la ruta completa en vez del nombre. Así
  agregar Historia no obligó a regenerar —ni volver a pagar— los 1.987 de Matemática. El
  generador y el auditor reciben la asignatura como primer argumento.

**Los dos defectos que aparecieron, y el método que los encontró.** Ninguno se ve leyendo
el texto normalizado: los dos salieron de **escuchar** (449 clips transcritos con el
reconocimiento de voz de Azure, ~US$0,45).
1. **Las coordenadas.** Una opción que es solo `(A, 2)` se pronunciaba *"a, dos"* y
   `(D, 3)` *"de, tres"*: la letra suena igual que una preposición, y en Historia hay
   opciones que son **solo** la coordenada, así que el niño que escucha no tenía cómo
   distinguirlas. Ahora dice **"columna B, fila 3"**, que además es como lo declara el
   enunciado del banco y como lo diría un profesor. Se detectó **antes** de generar, al
   revisar qué iba a decir el sintetizador en los 35 textos que el normalizador toca.
2. **`I, V y X`** en *"Los números I, V y X que a veces vemos en los relojes son…"* se
   sintetizaba corrido y volvía como `YVYX`. Y es justo la pregunta cuya respuesta es
   "romanos". La regla nueva nombra cada letra de una **lista** de letras sueltas
   ("i, ve y equis", "a, be, ce"), y solo listas: una letra sola casi siempre es una
   coordenada ("columna A") y se pronuncia bien tal cual. Verificado que no toca
   "rayos X" ni "la letra X".

> **Gotcha caro y nuevo: cambiar `normalizar-voz-3ro.py` no invalida ningún clip.** El
> manifiesto se indexa por el texto **mostrado**, así que cambiar cómo se PRONUNCIA algo
> deja los MP3 viejos sonando como antes, en silencio. Hay que borrarlos del manifiesto a
> mano. Por eso los 29 clips de coordenadas de Matemática se retiraron y regeneraron
> explícitamente; si no, Matemática habría quedado con la pronunciación vieja y Historia
> con la nueva, sin ninguna señal.

> **Límite del método, dicho porque importa:** el transcriptor **no sirve para juzgar
> nombres de letras** — convierte "a, be, ce" de vuelta en "a bi c". O sea que el clip de
> los números romanos quedó **sin verificar**, y se dejó anotado para que Roberto lo
> escuche. Es la contracara de la herramienta: caza patrones sistemáticos, no todo.

- **Error propio registrado:** al re-auditar se olvidó el `--muestra=` y el auditor arrancó
  a transcribir los 2.287 clips; alcanzó 449 antes de que un `head` cortara la tubería y lo
  matara. Unos 20 centavos de más y la evidencia extra quedó guardada, pero es plata de
  Roberto: el auditor gasta **siempre**, y hay que pasarle la muestra a propósito.
- **`--muestra=N` (nuevo en el auditor):** audita primero los clips cuyo texto hablado
  difiere del mostrado —los únicos que el normalizador pudo estropear— y rellena al azar.
  Un defecto que afecte al 2% de los clips (como el "enero" de la Sesión 56, 43 de 1.987)
  aparece en una muestra de 200 con ~99% de probabilidad, por US$0,20 en vez de US$2.
- **Pendiente de Roberto:** pegar `aplicar-foto-semanal.sql`; escuchar el clip de los
  números romanos; y lo de arrastre (re-aplicar `schema.sql` con `HI03`, arte de los 5
  capítulos y de "El Olvido", aprobación pedagógica de las 480 preguntas de Historia y las
  792 de Matemática, INAPI, la SpA, el enlace de agenda de la landing).

### Sesión 62 (2026-08-27) — 7° básico completo: 2.430 preguntas y el año operativo

VULPO pasa de dos cursos a tres. 7° se sirve en `vulpo.cl/7mo/`, sin enlazar desde el sitio,
y **sin voz pregrabada** (a los 12-13 años ya se lee de corrido; de 5° hacia arriba no vale la
pena pagarla). Detalle en "Gotchas de 7° básico", arriba.

**El resultado:** 81 objetivos oficiales, **30 preguntas en cada uno, 2.430 en total**, cero
duplicados y la correcta repartida entre 22% y 28% en las cuatro posiciones.

| Asignatura | Código | OA | Preguntas | Capítulos | Jefe Final |
|---|---|---|---|---|---|
| Historia, Geografía y Cs. Sociales | `HI07` | 23 | 690 | 6 | El Anacronismo |
| Matemática | `MA07` | 19 | 570 | 4 | El Azar |
| Ciencias Naturales | `CN07` | 15 | 450 | 5 | La Erosión |
| Lengua y Literatura | `LE07` | 24 | 720 | 7 | El Silencio |

**Verificado jugando en el navegador** con `scripts/cdp.mjs`, no leyendo código: las cuatro
campañas abren con sus jefes, todas las etapas tienen banco, el quiz sirve 10 preguntas con 4
opciones, **el guardado de 8° queda intacto** (se sembró una partida con 777 XP antes y seguía
ahí después), y **cero errores de consola y cero 404**.

#### Los tres defectos que la sesión encontró, y que valen más que el conteo

- **Un error mío que el proyecto ya tenía documentado y en el que caí igual.** Escribí el campo
  `portadaMapa` en las 22 expediciones, pero **no toqué la función del mismo nombre**, que en 8°
  arma la ruta por convención e ignora el campo: 22 × 404 que el `onerror` tapa a la vista y no
  en la red. Lo delató el navegador, no la lectura.
- **Opciones que valen lo MISMO escritas distinto.** Un agente encontró en su propia entrega una
  clave `1/6` con `2/12` entre los distractores: **dos respuestas correctas**, y castiga al que
  reconoce que son el mismo número. El chequeo que existía compara TEXTO y no lo caza. De ahí
  salió `scripts/auditar-numerico.py`, que además destapó un defecto **en el banco de 8°, en
  producción y marcado como revisado desde hace un año**: la ecuación `x/4 = 5` ofrecía `1,25` y
  `5/4`, o sea llevaba un año siendo de tres opciones y no de cuatro. Corregido sin tocar la
  clave (ahora `9`, `1`, `5/4`, `20`: las cuatro operaciones entre 5 y 4).
- **Dos objetivos midiéndose con las mismas preguntas**, que es el límite documentado de Lenguaje
  desde 3° y que nadie chequeaba: `revisar-tanda.py` mira duplicados **dentro** de una tanda, o
  sea dentro de un OA. `scripts/auditar-solape-oa.py` (nuevo) mira el cruce. Encontró **7 pares
  reales en Historia** —el Canon de Avicena preguntado en dos OA, el Cisma de 1054, los metecos,
  las terrazas andinas, *res publica*, los glaciares— y **1 en Lenguaje**. Los 8 se reescribieron
  del lado cuyo OA cubre el tema con menos propiedad.

> **Las dos herramientas nuevas acusaron primero lo correcto, y hubo que afinarlas.** El auditor
> numérico daba «6 kg» igual a «6 g» y «3 rectángulos» igual a «3 círculos» (no comparaba la
> unidad); el de solape daba 0,50 entre *"¿cuál es el resultado de −3 − 5?"* y *"¿cuál es el
> resultado de 2/5 por 5/8?"*, porque con enunciados cortos queda una sola palabra útil. **Un
> informe que marca lo correcto se deja de leer**, así que ambos llevan ahora su guarda —unidad
> que debe coincidir, y piso de 5 palabras de contenido— con el porqué escrito en el código.

#### Lo que cambió en las herramientas (ya no hay que clonarlas por nivel)

- `consolidar-pool-3ro.py` → **`consolidar-pool-nivel.py`**: no tenía nada específico de 3°.
- `revisar-tanda.py` acepta **`--largo=N`**: el límite del enunciado depende de la edad **y del
  reloj** (3° no tiene cronómetro; 7° y 8° sí, y a 20 segundos un enunciado largo mide velocidad
  de lectura).
- `generar-revision-preguntas.py` acepta `unidades`/`titulo`, `unidades`/`nombre` y
  `capitulos_del_juego`, para no deformar los `oa.json`, que son la fuente curricular.
- **Nuevos:** `auditar-numerico.py` y `auditar-solape-oa.py`.

#### Lecciones de método sobre escribir bancos con agentes

- **El sesgo de largo aparece SIEMPRE en la primera pasada, y en una proporción que sorprende:**
  medido en las primeras tandas de 7°, la correcta era la más larga en **20 a 25 de cada 30**.
  Peor: corregirlo al final es donde el trabajo se cae si algo lo interrumpe — el límite de
  sesión mató seis agentes justo mientras lo arreglaban. El encargo pide ahora escribir los
  distractores **con cuerpo desde el primer borrador**, y las 13 tandas posteriores al cambio
  salieron todas dentro del límite.
- **En Matemática, cada agente verifica la aritmética de sus 30 claves con un script y lo
  reporta.** No es formalidad: los verificadores encontraron distractores cuya justificación no
  producía su propio número ("se divide por 100" mostrando otra cifra) y uno cuyo razonamiento
  era *correcto* y solo fallaba la aritmética, o sea descartable de una. Un agente además
  **probó su propio verificador rompiendo el archivo a propósito**, porque "pasar limpio a la
  primera es sospechoso".
- **Decirles a los agentes qué tandas vecinas leer funciona.** Varios recortaron su propio
  alcance al descubrir que otro objetivo ya cubría algo; el de estrategias de comprensión dejó
  fuera "resumir" porque el de síntesis ya lo medía.
- **El límite de sesión mata agentes a mitad de trabajo, pero el archivo suele estar escrito.**
  Antes de relanzar nada, mirar el disco: en las dos caídas de esta sesión, 18 y 13 tandas ya
  existían y solo hacía falta terminarles la corrección.

#### Pendiente de Roberto

- **Re-aplicar `supabase/schema.sql`** (ahora con `HI07`, `MA07`, `CN07`, `LE07`). Sin eso el
  dominio de 7° **no aparece en el panel**, y sin ningún error visible.
- **Aprobación pedagógica de las 2.430 preguntas**, con los informes en
  `dev/revision-{historia,matematicas,ciencias,lenguaje}-7basico.pdf`.
- **⚠️ Conversar con el colegio la unidad de sexualidad de Ciencias** (`CN07 OA 01/02/03`): es
  currículum obligatorio y el banco está escrito para poder mostrarse tal cual a un colegio
  confesional —cero segunda persona, cero valoración moral, y el redactor descartó a propósito
  la anticoncepción de emergencia y las eficacias comparadas—, pero **esa conversación no la
  resuelve ningún archivo**.
- **El arte propio de 7°** (22 portadas de capítulo y 4 villanos): hoy usa arte prestado de 8°,
  declarado en comentarios.

### Sesión 61 (2026-08-27) — Ciencias y Lenguaje de 3° básico: 1.286 preguntas y su voz
3° básico pasa de dos asignaturas a **las cuatro**. Se hizo con `/loop`, autopautado, con
**43 agentes redactores** y **5 auditores**, siguiendo el flujo currículum oficial →
estándar escrito → banco → validación → campaña → auditoría → corrección → voz.

- **El currículum, antes que nada.** Dos investigadores transcribieron los OA oficiales
  contrastando dos fuentes del portal del MINEDUC. Ciencias son **13 OA** en 4 unidades;
  Lenguaje son **31** (no 30, como yo suponía). Detalle en "Gotchas de 3° básico".
- **Dos hallazgos que cambiaron el alcance antes de escribir una sola pregunta:** en
  Lenguaje **17 de los 31 OA son de producción o de hábito**, y el **OA 16 no admite
  ninguna pregunta honesta** (es caligrafía manuscrita), así que se excluyó del banco en
  vez de inventar un ítem que fingiera medirlo. En Ciencias quedaron fuera los 6 OAH y los
  6 OAA, que además el backend habría descartado en silencio por el formato de su código.
- **`docs/encargo-banco-3basico.md` (nuevo): el estándar del banco de 3°.** Cada regla
  nació de un defecto real de Matemática o Historia. El agente lo lee y el encargo por
  agente son 6 líneas. Se **validó con las primeras 13 tandas antes de escalar a 43**:
  descubrir un defecto del encargo con 13 escritas cuesta la mitad que con 43.
- **`docs/cuidados-ciencias-3basico.md` y `docs/cuidados-lenguaje-3basico.md` (nuevos):**
  las 15 trampas de precisión científica y qué se puede preguntar de verdad en cada OA de
  Lenguaje. Sirven para escribir y para revisar.
- **Resultado:** Ciencias 390 preguntas en 4 capítulos (villano "El Apagón") y Lenguaje 896
  en 9 capítulos (villano "El Borrón"), más 43 metas en lenguaje de niño, `LE03`/`CN03`
  registrados en el servidor y el panel, y **6.279 clips de voz** nuevos. Verificado
  jugando las cuatro asignaturas: sin errores de consola y sin un solo 404.

**Las auditorías: 42 preguntas corregidas, ninguna clave equivocada.** Lo valioso no fue el
recuento sino el tipo de defecto:
- **Un error científico** que solo vio uno de los tres auditores: las manchas de colores de
  un charco con aceite **no son dispersión** sino interferencia, y el `tip` enseñaba que
  funcionan "igual que un prisma".
- **Un sesgo que no se ve pregunta por pregunta sino mirando el patrón:** palta y almendras
  como modelo de colación saludable y la sopaipilla como ejemplo de consumo ocasional.
  Ninguna es culposa sola; juntas le dicen a un niño cuya colación es pan que lo suyo es lo
  ocasional. Cambiado a maní.
- **Dos auditores convergieron por separado** en el mismo ítem (el incendio forestal como
  "fuego natural"), pero el segundo aportó el argumento decisivo: **contradecía a otras dos
  preguntas del propio banco**, donde "natural porque su llama es fuego" está marcada
  incorrecta para la vela. El niño que aplicaba la regla recién aprendida quedaba castigado.
- **Contenido de 7°-8° metido en 3°:** ordenar la rapidez del sonido en sólido, líquido y
  gas no se puede observar a esa edad, solo memorizar.
- **Un duplicado literal entre dos OA** (misma oración, misma clave), que el consolidador
  habría descartado en silencio dejando ese OA con 29 preguntas.
- **Solapamiento entre objetivos** en Lenguaje (OA 10/19/29, 13/18, 18/22): dos OA medidos
  con preguntas equivalentes. Se corrigió lo peor; **el resto queda anotado como límite
  conocido**, porque deshacerlo del todo es rehacer decenas de ítems.

**Lo que este proyecto aprendió sobre escribir para una voz** (ver "Gotchas de 3° básico"):
- **`scripts/auditar-audible-3ro.py` (nuevo):** caza preguntas que **no se pueden responder
  escuchando**. Armarlo enseñó tres cosas: comparar el texto crudo acusa `15 + 9` contra
  `15 - 9`; hay que aplicar la **fonética del español de Chile** (la hache muda y la be/ve
  hacían que *"Había / Havía / Abia / Habia"* fueran la misma opción cuatro veces); y una
  **letra sola** se pronuncia por su nombre, así que no se le aplica esa fonética.
- **17 preguntas reescritas para que funcionen igual leídas que escuchadas**, nombrando el
  defecto en el enunciado en vez de mostrarlo. Una de ellas **la voz la regalaba**:
  preguntaba cuál oración se lee con entonación de pregunta, y el sintetizador leía la
  correcta con entonación de pregunta.
- **El `tip` no puede nombrar la posición de una opción**, porque el consolidador baraja.
  `revisar-tanda.py` lo avisa ahora.
- **Un consolidador único** (`consolidar-pool-nivel.py`, renombrado en la Sesion 62) en vez de uno por asignatura. Probado
  contra Historia: reproduce su banco **byte a byte**.

> **Dos límites del método, dichos porque importan.** El transcriptor de Azure **no sirve
> para juzgar palabras que no conoce**: quedó sin resolver si la voz pronuncia bien
> **copihue** (dice algo cercano a "copie", comiéndose el sonido /we/) y hay que
> escucharlo. Y el chequeo de audibilidad **no cubre** el caso en que la respuesta depende
> de ver la grafía sin que las opciones sean homófonas (*"¿cuál se escribe con jota?"*):
> eso lo cazó un auditor leyendo. Las dos vías se complementan.

- **Un bug real corregido:** tocar Lenguaje en 3° abría el landing "Campaña + Vocabulario"
  heredado de 8°. En 3° no hay Vocabulario, así que **la asignatura entera era
  inalcanzable**. Es la tercera vez que el fork trae cableado de 8° que en 3° no aplica.
- **Costo de Azure:** unos **US$5,5** (generación de las dos voces + auditorías por muestra).
- **Peso:** el audio de 3° suma ya **251 MB** en el repositorio, que iba en 247 MB de `.git`.
  No bloquea (el límite blando de GitHub es 1 GB), pero conviene saberlo antes del quinto banco.
- **Pendiente de Roberto:** escuchar el clip de **copihue** (`assets/voz/cie3/acb4dae9f7c13d0e.mp3`);
  **re-aplicar `supabase/schema.sql`** (ahora con `LE03` y `CN03`, sin eso su dominio no
  aparece en el panel); y la **aprobación pedagógica** de las 1.286 preguntas nuevas, con
  los informes en `dev/revision-ciencias-3basico.pdf` y `dev/revision-lenguaje-3basico.pdf`.

### Sesión 63 (2026-08-27) — La v1 pasa a ser 3° a 8°: se ordenan las bases
Sesión de dirección y de orden, no de contenido: **no se escribió ni una pregunta**. Roberto
entregó tres documentos de análisis externo (PWA, estrategia móvil y modelo de suscripción) y
después definió que **la v1 de VULPO cubra de 3° a 8° básico**. El trabajo fue incorporar esa
dirección al repositorio, medir el estado real y arreglar lo que ya estaba cobrando intereses.

- **`docs/roadmap-tecnico.md` (nuevo).** Recoge los tres documentos y adopta su recomendación
  central: **no rehacer VULPO en Flutter ni React Native**, sino web → PWA → piloto → Capacitor →
  Android → iOS. Pero su §2 **corrige el análisis externo con hechos del repositorio**, que los
  documentos no conocían:
  1. **Ya no hay "un juego": hay tres forks.** El `start_url:/juego/` que proponen instalaría
     "VULPO" y abriría 8°, el curso equivocado para dos de cada tres alumnos. Y choca con el
     modelo de suscripción, donde el producto *es* el nivel. Se recomienda un manifiesto por nivel.
  2. **El `cache-first` que proponen es inviable.** Medido: `assets/` son 459 MB, de los cuales
     **251 MB son la voz de 3°**. Cachear "imágenes y audio" en el `install` le bajaría 250 MB al
     teléfono de un niño la primera vez que abre 3°.
  3. **`assets/originales/` son 175 MB en 70 archivos versionados y NO ignorados**, o sea que se
     publican en `vulpo.cl` sin que nadie los pida.
  4. El `<base href="/">` obliga a que el scope del service worker sea `/`, no `/juego/`.
  5. **El requisito real de la suscripción no es la PWA: es subir el progreso al servidor.** Hoy
     monedas, skins y avance de campaña viven en `localStorage`; solo XP y dominio están en
     Supabase. Prometerle a un apoderado que su hijo cambia de teléfono y recupera todo sería falso.
- **`docs/comercial.md`:** el modelo de suscripción anual por nivel, marcado como **acordado pero
  NO vigente** (cuenta permanente, suscripción que cambia, líneas Colegio/Individual/Familiar). Se
  corrigió además la sección "Límite estructural", que seguía diciendo que VULPO cubre solo 8°.
  Las estimaciones de inversión en pesos **no se escribieron en el repo**, que es público.

**El estado real, medido en disco y no de memoria** (tres agentes de inventario + verificación
propia). Varias cosas no calzaban con la documentación:

- **7.524 preguntas escritas, 2.536 aprobadas, 4.988 sin aprobar.** La cifra "2.536" que
  `CLAUDE.md` repite como total del banco es en realidad solo el subconjunto aprobado.
- **Tres dialectos de `oa.json`**, uno por generación de trabajo: 8° trae `actitudes` y
  `habilidades_generales`; 3°, `ejes` y `nota_evaluacion`; 7°, `habilidades_excluidas`,
  `oa_excluidos_del_banco` y `capitulos_del_juego`. **Solo 7 claves son universales.** El esquema
  fue mejorando y nadie volvió a alinear los anteriores: la exclusión del `LE03 OA 16` vive en
  prosa mientras la del `LE07 OA 12` está en una clave legible por máquina. Y
  `matematicas-3basico/_pool/` usa `verificado/u1-oa01.json`, así que queda en cero ante cualquier
  script que recorra `_pool/*.json`.
- **El fork es 84% datos.** Entre 8° y 7° hay **16 líneas** de motor genuinamente distinto; entre
  8° y 3°, ~65 de pegamento más 419 de una capa de banda etaria (voz + dibujos) que es una
  *feature*, no divergencia. En cambio **cada fork arrastra ~691 líneas de motor muerto**
  (diagramas SVG + camino de lecciones + Reto de Cálculo), verificadas **byte a byte idénticas** e
  inalcanzables en 3° y 7°: 1.400 líneas duplicadas hoy, **2.800 con seis niveles**.
- **Dar de alta un nivel toca ~24 puntos en 3 archivos**, 8 de ellos listas paralelas. `SB_asigDe`
  de `profesor.html` es un **espejo escrito a mano de `kimun_oa_asignatura`** — el patrón que ya
  causó el bug de la Sesión 37.
- **Arte propio de 3° y 7°: cero.** Siete comentarios `PLACEHOLDER` declaran que los villanos son
  los de 8°.

**Plan aprobado para la v1** (guardado fuera del repo, en el archivo de planes de la sesión). Faltan
**~260 objetivos y ~7.800 preguntas** de 4°, 5° y 6°: más de lo que el proyecto lleva escrito en
todas sus sesiones juntas. Decisiones tomadas por Roberto:

| Decisión | Elegida |
|---|---|
| Motor | **Extracción progresiva a `assets/js/`**, el patrón que `revision.js` ya validó en producción |
| Orden | **5° → 6° → 4°**: los dos sin voz primero; 4° al final porque suma ~254 MB |
| Aprobación | **Muestreo + aprobación masiva** (con la herramienta de hoy son 18–36 horas de clic) |
| Arte | **Solo los 4 villanos por nivel** (20 imágenes); ~~las portadas siguen prestadas~~ → **revertido el 01/09/2026**: cada capítulo lleva la suya, ver `docs/estandar-arte-portadas.md` |

**Voz solo en 4°**, y no por preferencia: con voz en 4°, 5° y 6° el sitio publicado llegaría a
**~1.260 MB y revienta el techo de 1 GB de GitHub Pages**. Con voz solo en 4°, y sacando
`assets/originales`, queda en **577 MB**. La regla documentada (voz de 1° a 4°) resulta ser también
la respuesta de infraestructura.

**Fase 0.1 ejecutada — la deuda que ya estaba cobrando intereses.** Cuatro hallazgos, tres reales:

1. **`aplicar-revisadas.py` estaba cableado a un solo banco** (`contenido/historia-8basico/…`, fijo
   en la línea 26), así que **el circuito de aprobación que este archivo documenta no cerraba para
   ninguno de los otros catorce**. Ahora recorre todos. Al reescribirlo apareció algo peor que el
   cableado: **ponía `revisada = False` a toda pregunta ausente del archivo exportado**, y el
   tablero guarda las marcas en el `localStorage` del navegador — una exportación hecha desde el
   otro PC habría **desmarcado las 2.536 preguntas aprobadas de 8° sin avisar**. Por omisión ahora
   solo agrega; desmarcar exige `--sincronizar`.
2. **⚠️ El `META_OA` de 7° tenía los códigos de 8°**, así que la meta de aprendizaje estuvo **muda
   en todo el nivel** desde que se publicó. Escritas las **81 metas** de 7° desde el texto oficial
   de cada `oa.json`. Ver el gotcha de 7° arriba, que incluye la comprobación que lo caza.
3. **`btnLengVocab` apuntaba a una expedición inexistente** en los dos forks
   (`entrarExpedicion(undefined)`). Desactivado, sin borrar el botón: quitarlo sin quitar el
   handler dejaría `$('btnLengVocab')` en null y `.onclick` mataría todo el JavaScript (Sesión 56).
4. **La "divergencia" de `ASIG_DESAFIO_NOMBRE` NO era un defecto**, y se descartó: el desafío llega
   del curso del alumno y un curso tiene un solo nivel, así que el mapa mínimo de 7° es correcto.

**Verificado en el navegador** con `scripts/cdp.mjs`, las tres apps: 7° pasa de 0 a **81 de 81 OA
con meta**, 3° sigue en 85/85, 8° deja 13 sin meta que son los `VOC-*` y `AF-T*` y **está bien**
(no son OA del currículum). `btnLengVocab` vuelve a Expediciones y el JavaScript sigue vivo.
**Cero errores de consola y cero 404.**

- **Pendiente inmediato:** Fase 0.2, canonizar los `oa.json` sobre el esquema de 7° y migrar los
  doce existentes; luego el resto de la Fase 0 (encargo único, `cuidados-` de Matemática e
  Historia, aprobación masiva en el tablero, sacar `assets/originales` del sitio).
- **Pendiente de Roberto (arrastre):** re-aplicar `supabase/schema.sql` (con `HI07/MA07/CN07/LE07`,
  sin eso el dominio de 7° no aparece en el panel y sin ningún error); aprobación pedagógica de las
  4.988 preguntas de 3° y 7°; la conversación con el colegio sobre la unidad de sexualidad de
  Ciencias de 7°; escuchar el clip de **copihue**; pegar `aplicar-foto-semanal.sql`; y los trámites
  (INAPI, la SpA, el enlace de agenda de la landing).

### Sesión 64 (2026-08-28) — Se cierra la Fase 0 y arranca la extracción del motor
Continuación directa de la 63, ejecutando el plan de la v1. **No se escribió contenido:** todo es
herramienta, estándar y motor. Al final del tramo, dos defectos vivos de 7° corregidos.

#### Fase 0 — Ordenar las bases (COMPLETA)

- **El tablero estaba CAÍDO y nadie podía aprobar nada.** `generar-tablero.py` moría con
  `KeyError: 'id'` porque las unidades de 7° usan `{n, nombre}` y las de los otros once bancos
  `{id, titulo}` —y `lenguaje-7basico` no tiene `unidades` sino `capitulos_del_juego`—. Como el
  script recorre TODAS las carpetas en una pasada, **un banco con otro dialecto deja sin tablero
  a los quince**, o sea bloquea la aprobación pedagógica completa. Es la segunda vez (Sesión 55,
  `KeyError: 'unidades'`): esa vez se arregló el caso y no la clase. Ahora los grupos se leen con
  `grupos_de` / `u_id` / `u_titulo`, y hay validador.
- **`scripts/validar-oa-json.py` (nuevo) + `docs/esquema-oa-json.md`.** Declaran el contrato del
  `oa.json` y lo comprueban en los quince bancos. Encontró **38 errores**, todos la deriva de 7°;
  tras migrar, **0**. También destapó que la exclusión de `LE03 OA 16` (caligrafía) vivía solo en
  prosa mientras la de `LE07 OA 12` estaba declarada: ninguna herramienta podía distinguir "lo
  excluimos" de "se le olvidaron las preguntas". Migrados los cuatro `oa.json` de 7° al canon
  `{id, titulo}` (26 grupos) y declarada la exclusión de 3°.
- **`docs/encargo-banco.md`** funde los dos encargos por nivel en uno parametrizado (tabla del
  §0: edad, cronómetro, largo, voz, `visual`). El de 3° **no tenía las trampas f, g, h e i**
  descubiertas escribiendo 7°: cuatro defectos conocidos que se habrían repetido gratis en 4°, 5°
  y 6°.
- **`docs/cuidados-matematica.md` y `docs/cuidados-historia.md` (nuevos)**, y
  `cuidados-ciencias-3basico.md` → **`cuidados-ciencias.md`** generalizado. El saber de Matemática
  e Historia no estaba escrito: vivía **dentro de un script** y disperso en planes.
- **`scripts/auditar-banco-nivel.py`** reemplaza a `validar-banco-3ro.py` y `auditar-banco-3ro.py`
  (rutas fijas, `LARGO_MAX=90`, **7 widgets cuando los bancos usan 11**: los 33 ítems con `linea`,
  `cuadricula`, `globo` y `zonas` salían como tipo desconocido).
  > **Al estrenarlo dio 6 errores en Matemática y los SEIS eran del auditor, no del banco.** Tres
  > en 3°, donde la respuesta es una *expresión* (`"6 x 2 es lo mismo que sumar…"` →
  > `2+2+2+2+2+2`) y se comparaba contra el resultado numérico. Tres en 7°, por **números
  > negativos**: en `-3 - 5` el regex emparejaba `3 - 5` = −2 y acusaba la clave correcta, −8 (el
  > parser venía de 3°, que no tiene enteros). Las tres claves de 7° se verificaron por cálculo
  > independiente antes de tocar nada. Corregido, **los catorce bancos quedan en 0 errores**.
- **Aprobación masiva en el tablero** + `docs/aprobacion-pedagogica.md`: botón "✓ todo el OA" en
  los 262 objetivos y "✓ Aprobar toda la asignatura" en las 14, con el criterio de **revisar 8 de
  30 y aprobar el OA**. Probabilidades **hipergeométricas y calculadas**, no estimadas (96,5% de
  detección si el OA está 30% defectuoso; **26,7% si tiene una sola mala**): el muestreo caza un
  OA mal escrito, no una pregunta suelta, y eso se dice con todas sus letras.
  > **Al probarlo apareció un defecto de siempre:** el contador decía **7.944 preguntas** donde el
  > banco tiene **7.524**. Sobraban 420 porque **270 preguntas de Lenguaje de 3° se dibujan dos
  > veces** (nueve de sus OA pertenecen a dos capítulos, lo cual es correcto en los datos).
  > Marcar una copia dejaba la otra sin marcar —un OA aprobado que se ve a medias— y el export
  > repetía ids. Ahora las copias se sincronizan y se cuenta por id único.
- **`aplicar-revisadas.py`** recorre los quince bancos (antes uno fijo). Al reescribirlo apareció
  algo peor que el cableado: **desmarcaba toda pregunta ausente del archivo exportado**, y las
  marcas viven en el `localStorage` del navegador — una exportación hecha desde el otro PC habría
  **desmarcado las 2.536 preguntas aprobadas de 8° sin avisar**. Por omisión ahora solo agrega.
- **`revisar-tanda.py`** con un glob vacío imprimía el modo de uso y **salía con código 0**:
  revisar una carpeta sin tandas se veía igual que revisarla sin defectos. Ahora dice por qué y
  sale con 1.
- **`_config.yml` (nuevo):** `assets/originales/` son **175 MB en 70 archivos** que GitHub Pages
  estaba **publicando** (verificado: HTTP 200 con 2,4 MB por archivo). Excluidos del sitio y
  **conservados en el repositorio**, que es el respaldo del arte crudo. Libera el margen que
  necesita la voz de 4°. ⚠️ Declarar `exclude` **reemplaza** la lista por defecto de Jekyll, así
  que hubo que repetir sus siete entradas. **Esto solo se puede verificar después del deploy.**

#### Fase 1 — Banderas de nivel (en curso)

El plan decía "extraer `lecciones.js` y compartirlo". **Medido, el corte no es limpio:**
`refreshHud` y `levelUpFx` viven dentro de esa zona por accidente de ubicación; **3° necesita
`NS`** (namespace SVG) que se declara ahí y lo usa su `renderVisual`; y quedan **11 referencias**
más desde código vivo. El camino es convertir primero las diferencias en **datos**.

**Cuatro banderas nuevas** (`HAY_RETO_CALCULO`, `HAY_MINICLASES`, `HAY_VOCABULARIO`,
`HAY_BIBLIOTECA`), y **`renderExpediciones` quedó idéntica en las tres apps**. Detalle en la
sección "Banderas de nivel" arriba.

**Dos defectos VIVOS de 7°, encontrados jugando:**
1. **El Duelo ofrecía la Matemática equivocada:** los 5 niveles del Reto de Cálculo de 8° en vez
   de sus 4 capítulos, generando operaciones con `genCalculo` y **saltándose el banco de 7°**.
2. **El "siguiente paso al reprobar" ofrecía una mini-clase inexistente:** el botón decía
   "📘 Repasar la mini-clase", **descargaba las 17 lecciones de 8°** dentro de la app de 7° y no
   abría ninguna. **3° se salvaba por accidente**, porque escribe "Matemática" en singular.

**Dos errores propios en el camino, los dos atrapados por el navegador:**
- Un comentario con `(contenido/*/lecciones.json)`: ese `*/` **cerró el bloque de comentario** y
  **mató las tres apps a la vez**. Ver el gotcha arriba.
- Mis escrituras convirtieron `7mo` y `3ro` de **CRLF a LF**, dejando el árbol inconsistente y
  cualquier `diff` entre forks inútil. Restaurado.

> **El diff bruto contra 8° creció (7°: 541 → 701 líneas) y NO es un retroceso:** antes el
> `META_OA` de 7° era byte a byte el de 8° —ese era el bug de la Sesión 63— y ahora tiene sus 81
> metas propias. Casi todo el archivo son datos, que deben diferir por nivel; lo que hay que
> converger es el código.

**Verificado con `scripts/cdp.mjs` en las tres apps:** se juega una etapa real, 8° sin regresión
(conserva Lectura, "Campaña + Vocabulario" y sus 5 niveles del Reto), **el guardado de 8° queda
intacto tras jugar 7° y 3°**, y **cero errores de consola y cero 404**.

- **Pendiente inmediato:** el bloque de lecciones sigue duplicado (**693 líneas × 3 = 2.079**);
  ahora que las funcionalidades son datos, el camino está despejado. Después, las Fases 2-4
  (5°, 6° y 4°).
- **Pendiente de Roberto:** comprobar el `_config.yml` en producción tras el deploy; la consulta
  de `kimun_prof_asignaturas` (cada código debe dar **2**); pegar `aplicar-foto-semanal.sql`, que
  **cada lunes sin foto se pierde para siempre**; empezar la aprobación pedagógica con la
  herramienta nueva; y los de arrastre (copihue, INAPI, SpA, enlace de agenda).

### Sesión 65 (2026-08-28) — El bloque de lecciones sale de los forks: 792 líneas menos por curso
Continuación de la Fase 1. **No se escribió contenido ni se tocó ningún banco.** El trabajo es
todo motor, y `juego/index.html` (8°) queda **funcionalmente intacto**: sus únicos 6 cambios son
guardas que no alteran su comportamiento, porque ahí las banderas valen `true`.

**El resultado:** `7mo/index.html` pasa de 4.257 a 3.465 líneas y `3ro/index.html` de 4.768 a
3.976. **−792 líneas en cada fork, −1.584 en total**, y ninguna de ellas era alcanzable en su
nivel. Con seis niveles, esas mismas líneas se habrían copiado cinco veces.

**Qué salió, en cuatro tramos:**
1. Las **693 líneas** del bloque (diagramas SVG + motor de mini-clases + Reto de Cálculo).
2. Una **segunda zona muerta que nadie había medido**, fuera del bloque y **intercalada con código
   vivo**: `renderCampañaMate`, `capMateCompleto`, `jefeFinalMateDesbloqueado`, `cargarPoolMate`,
   `odPreguntasCalc` y `odMapasMate` (55 líneas).
3. El **HTML huérfano** de sus cuatro pantallas (`scr-calc-mapa`, `scr-calc`, `scr-calc-res`,
   `scr-leccion`), 53 líneas cuyos manejadores se habían ido con el bloque.
4. Antes que todo eso, los **guardas** que lo hicieron posible.

#### Lo que casi sale mal, y es lo que hay que recordar

**`detenerTimersActivos` hace `clearInterval(RC.timer)`, y a esa función la llama la barra
inferior.** O sea: cortar el bloque sin guardarla primero habría dejado 3° y 7° reventando al
primer toque de la barra — un toque que cualquier alumno da, en el colegio piloto incluido. No lo
delató leer el código sino **enumerar las referencias antes de tocar nada**, que es el paso que en
la Sesión 56 se saltó y costó dos post scriptums.

**Y una advertencia de este mismo archivo resultó falsa.** Decía que 3° necesita `NS` del bloque y
que borrarlo lo deja sin dibujos. Medido: la única aparición de `NS` fuera del bloque **está
dentro de un comentario**, y el `renderVisual` de 3° arma el SVG como texto. Se comprobó
renderizando los **once widgets con datos reales de los bancos** después del corte: los once
salen. Esa advertencia llevaba dos sesiones bloqueando un trabajo barato — **una nota que nadie
vuelve a medir deja de ser conocimiento y pasa a ser un candado**.

**Un tercer caso del defecto de fondo del fork:** en 3° y 7°, `cargarPoolMate` descargaba
`contenido/matematicas-8basico/preguntas.json`, el banco de **otro nivel**, dentro de esta app. Es
hermano del botón que bajaba las 17 lecciones de 8° (Sesión 64) y del Duelo que ofrecía el Reto de
8° (Sesión 63). Los tres nacieron de lo mismo: copiar un archivo con sus suposiciones adentro.

#### Decisión de diseño: las referencias muertas se GUARDAN, no se borran

`odNMapas`, `renderODExpMapas` e `iniciarDesafio` siguen nombrando `NIVELES_CALC`, `odMapasMate` y
`odPreguntasCalc`, que en 3° y 7° ya no existen. Se dejan **a propósito**: la bandera hace
inalcanzable esa rama, y mantener esas funciones **byte a byte iguales en los tres forks** es el
objetivo entero. Borrarlas las haría divergir, que es el problema que se está resolviendo.

#### Verificación (con `scripts/cdp.mjs`, jugando)

- Se **juega una etapa real** en las tres apps: meta 🎯 con el texto del OA correcto, quiz con 4
  opciones, se responde y avanza. **Cero errores de consola y cero 404.**
- **La prueba que cierra el caso del Duelo:** abriendo el módulo de Matemática del Duelo, 7° ofrece
  **sus 4 capítulos**, 3° **sus 7** y 8° **sus 5 niveles del Reto**. Cada nivel su Matemática.
- **8° sin regresión:** 12 diagramas, 5 niveles del Reto, `scr-calc-mapa` abre, 17 lecciones cargan.
- **Los 11 dibujos de 3°** renderizan con preguntas reales de sus bancos.
- **El guardado sigue aislado:** se sembró una partida en 8° (777 XP, 4.242 monedas), se jugó 7° y
  3°, y volvió intacta; las tres claves conviven (`kimun_save`, `kimun_save_7mo`, `kimun_save_3ro`).
- Aparecieron cuatro `429` de Supabase en `auth/v1/signup`. **No son del cambio**: es el límite de
  altas anónimas (30/hora) que gastaron mis propias corridas headless, y se verificó que **ni una
  línea del diff menciona auth, signup ni Supabase**.

#### Método del corte (queda escrito arriba, en "Cómo se corta código de un fork sin matarlo")

Anclas exactas en vez de números de línea, aserciones que abortan antes de escribir (693 líneas
exactas, la última vacía, y a lo más una línea de diferencia con 8°), balance de llaves para las
funciones intercaladas, comprobar que ningún `id` del HTML a borrar lo nombre el JavaScript —ese
chequeo frenó el primer intento— y preservar CRLF.

- **Pendiente inmediato:** las Fases 2-4 del plan de la v1 (5°, 6° y 4°). Los forks nuevos ya
  nacerán sin el bloque si se clonan desde 7°.
- **El backend quedó al día, y dos pendientes de arrastre se cerraron el 28/08:**
  - **`schema.sql` NO tenía nada pendiente.** Se venía repitiendo "re-aplicar el esquema" desde la
    Sesión 63 **sin volver a medirlo**, cuando ya se había aplicado el 27/08. Confirmado en vivo
    llamando `kimun_oa_asignatura` con la clave pública: los cuatro códigos de 7°, más `HI08` y
    `MA03`, devuelven su asignatura, y un código inventado devuelve `null`.
    > Es el mismo defecto que el candado del `NS`: **un pendiente que nadie vuelve a medir se
    > arrastra solo.** El `curl` que lo comprueba quedó escrito en `docs/aplicar-schema.md`, para
    > que ninguna sesión futura mande a re-aplicar algo aplicado.
  - **`kimun_prof_asignaturas` verificada:** los cuatro códigos de 7° están en **los dos** arreglos
    (`2 2 2 2`). Era la comprobación que la consulta general de cinco filas **no** detecta.
  - **La foto semanal está aplicada Y AGENDADA.** Roberto la pegó el 27/08 y el 28/08 se confirmó
    con `select count(*) from cron.job where jobname='foto-semanal';` → **1**. Es la comprobación
    obligatoria porque **el guard de `pg_cron` falla en silencio**: sin ella, el pegado termina
    "sin errores" y el trabajo puede no haber quedado agendado. La primera foto la toma solo el
    **lunes 31/08/2026**; hasta entonces las tablas están vacías y eso es lo correcto.
  > **Las tres comprobaciones de este bloque tienen algo en común y conviene decirlo:** ninguna
  > da error cuando falla. El código de 7° ausente de un arreglo, el trabajo de `pg_cron` sin
  > agendar y el esquema sin aplicar **se ven exactamente igual que si estuvieran bien**. Por eso
  > la regla del proyecto no es "aplicarlo" sino "aplicarlo y **mirar el número**".
- **Pendiente de Roberto (lo que queda, y ya es todo caro):** **la aprobación pedagógica de 3° y
  7°** —167 OA, 1.336 preguntas por muestreo, 7 a 11 horas—, que es el camino crítico de la v1;
  los **8 villanos** (4 de 3° + 4 de 7°); la conversación con el colegio sobre la unidad de
  sexualidad de 7°; escuchar el clip de copihue; y los trámites (INAPI, la SpA, el enlace de
  agenda de la landing).

#### `pendiente.md` (nuevo, en la raíz): la lista viva de tareas

Lo que falta estaba **disperso** entre esta bitácora, `docs/roadmap-tecnico.md` y el plan de la
v1, y para saber qué tocaba había que releer los tres. Ahora hay **un solo archivo por el que se
empieza** al retomar el proyecto o al abrir una rama, ordenado en seis bloques (A: cerrar 3°/7°/8°
· B: 4°, 5° y 6° más la desduplicación del motor · C: PWA · D: progreso en el servidor · E:
suscripción y pagos · F: Capacitor), cada tarea con su peso, quién la hace y en qué rama va.

Tres decisiones al escribirlo, que conviene respetar al mantenerlo:

- **El bloqueo va arriba y en rojo.** La aprobación pedagógica no es una tarea más de la lista:
  es el camino crítico de todo lo demás, y ponerla entre las otras la hacía invisible.
- **Sin números comerciales.** El repositorio es público, así que precios, ingresos y
  estimaciones de inversión quedan fuera y el propio archivo lo dice en su encabezado. El único
  costo que sí aparece es el de Azure para la voz de 4°, porque es infraestructura y no
  estrategia.
- **Cada regla lleva su porqué.** No dice "verifica con `cdp.mjs`" sino "verifica corriendo la
  página **porque los 404 no llegan a la consola de forma fiable**". Una regla sin su motivo se
  salta en cuanto aprieta el tiempo — que es exactamente cómo la advertencia del `NS` se
  convirtió en un candado durante dos sesiones.

**Se actualiza en cada orden 66**, y está enlazado desde `README.md` y desde el encabezado del
roadmap de este archivo.

**Cierre de la Sesión 65 — lo barato, cerrado.** Tras el corte del bloque se despacharon los
pendientes que costaban minutos, para que solo queden tareas caras:

- **La puerta quedó en los TRES niveles** (`FECHA_PUERTA='2026-09-01'`). 3° y 7° estaban en `''`,
  o sea **abiertos y gratis**: si se venden tres niveles, no puede haber dos sin candado.
  Verificado que los tres anuncian la banda, que su `DEMO_LIBRE` existe de verdad
  (`hist-cap1` / `hist7-cap1` / `mat3-cap1`), que los tres tienen el remate `scr-demo-fin` con el
  contacto, y que **los enlaces de muestra y de revisión la esquivan** (`bloqueado()` exige
  `!PRUEBA`), así que el recorrido del profesor no se toca.
- **El tablero se ordena por NIVEL y luego por asignatura**, deducido del nombre de la carpeta
  (`historia-7basico` → nivel 7). Antes era una lista escrita a mano con las cinco carpetas de 8°
  y los bancos de 3° y 7° quedaban revueltos alfabeticamente al final. Importa porque **la
  aprobación se hace por nivel** y son 7 a 11 horas de clic: saltar entre bloques se paga caro.
  Un nivel nuevo se ordena solo, sin tocar el script.
- **`scripts/consolidar-pool.py` retirado.** Estaba cableado a `historia-8basico`, así que
  correrlo sobre otro banco no hacía nada visible. Lo reemplaza `consolidar-pool-nivel.py`, que se
  validó reproduciendo Historia byte a byte (Sesión 61).
- **`bonoMult:2` eliminado** de `hist-desafio`: propiedad muerta desde la Sesión 33, nunca leída.
- **Pendiente cerrado sin trabajo:** `assets/portada-mate-algebra.png` figuraba como huérfano
  desde la Sesión 18 y **no lo está** — la usa el capítulo `mate-algebra` de la campaña. Estaba
  resuelto y nadie lo había tachado.

> **Lo que NO se hizo, y es a propósito: anunciar 3° y 7° en la landing.** El cambio son cinco
> frases, pero la landing promete *"todas aprobadas una a una"* y de 3° y 7° **no hay ni una
> aprobada**. Anunciarlos hoy contradice la regla de `docs/comercial.md` de no prometer lo que no
> hay. Se hace **el día que se apruebe su banco**, no antes.

### Sesión 66 (2026-08-28) — Habilitar A1 (revisión en papel) y documentar el pipeline de calidad
Sesión corta, de habilitación y documentación. Sin cambios en el juego ni en el motor.
- **Sincronización (orden 99):** este PC venía de la Sesión 54 (scaffold de `/3ro` recién nacido);
  el `git pull` trajo las Sesiones 55-65 (3° completo con voz, 7° completo, la v1 pasa a 3°-8°,
  Fase 0, el corte del bloque de lecciones fuera de los forks, y `pendiente.md`). Fast-forward
  limpio; el contexto viejo quedó superado y se re-orientó desde `pendiente.md`.
- **A1 habilitado (el bloqueo crítico, tarea de Roberto).** Se regeneró el tablero
  (`dev/tablero.html`, clave `112358`, ya ordenado por nivel) y se verificó que refleja 3° (2.558,
  0 aprobadas), 7° (2.430, 0) y 8° (2.314, todas). Se generaron los **8 informes de revisión en
  papel** (PDF, uno por asignatura y curso de 3° y 7°) con
  `scripts/generar-revision-preguntas.py` + Chrome `--print-to-pdf`, agrupados por unidad y OA y con
  los **dibujos reales** incrustados. Viven en `dev/` (ignorados por git). *Gotcha de Chrome:*
  `--print-to-pdf` **no** resuelve rutas relativas para el archivo de salida; hay que darle la ruta
  **absoluta de Windows** (`C:\...\dev\...pdf`), si no falla en silencio.
- **Documentado el pipeline de calidad del banco de preguntas** — cuatro "prompts maestros" que
  Roberto fue entregando, formateados como docs y enlazados entre sí, desde `encargo-banco.md` y en la
  lista de estándares de `pendiente.md` (Bloque B):
  - `docs/prompt-generador-preguntas.md` — rol y estándar de calidad del **generador** (qué crear).
  - `docs/prompt-validador-preguntas.md` — el **validador**, actualizado a **V2** (orden de
    validación, códigos de error explícitos, pesos de puntaje, reglas de decisión numéricas y formato
    JSON de salida). Deja explícito que **NO reemplaza la aprobación humana**.
  - `docs/arquitectura-pipeline-preguntas.md` — arquitectura del pipeline a **nivel de pregunta**
    (generar→validar→corregir→publicar, contrato de datos, códigos de error, estados, métricas).
  - `docs/arquitectura-construccion-etapas.md` — arquitectura a **nivel de OA/etapa** (1 OA = 1
    etapa, banco ~30, 10 por intento, selección/balance, construcción de la etapa ejecutable,
    anti-memorización, registro de intentos).
  - **Los dos docs de arquitectura llevan una tabla honesta de "qué existe hoy vs. qué no":** son
    **diseño objetivo, no implementado**. Hoy VULPO usa bancos JSON estáticos + scripts + `pickN`
    (azar puro, sin registrar lo visto) + aprobación humana; el pipeline con base de datos, estados,
    versionado y aleatoriedad controlada es un proyecto grande que **no está en `pendiente.md`**, y
    parte de él (registro de intentos, anti-memorización real) **depende del Bloque D** (progreso en
    el servidor). El pipeline queda documentado de punta a punta: **generador → scripts automáticos →
    validador → aprobación humana**.
- **Validación de los bancos de 7° y 8° con el nuevo pipeline** (`docs/informe-validacion-bancos-7-8.md`):
  se aplicó el Nivel 2 (scripts `auditar-banco-nivel`/`-numerico`/`-solape-oa` sobre las 4.744
  preguntas) y el Nivel 1 (muestreo pedagógico con el validador V2: 8 subagentes, uno por asignatura
  y curso, ~2 preguntas por OA, 328 en total, resolviendo cada una por su cuenta). **Resultado: 0
  errores estructurales, 0 dobles-correctas, y 0 críticos / 0 mayores en las 328; 306 aprobadas y 22
  hallazgos menores** (distractores flojos, algún ítem de nivel básico, matices historiográficos).
  Los OA sensibles **CN07 01/02/03** salieron factualmente correctos y con trato apropiado (respalda
  la conversación A4 con el colegio). `auditar-solape-oa` marcó 15 pares de casi-duplicados entre OA
  (4 en 7°, 11 en 8°) a mirar. Conclusión: 7° y 8° **listos para la aprobación humana (A1) sin
  bloqueadores de contenido**; la firma sigue siendo humana. *(Un subagente dejó un `_sample_mate.json`
  suelto en la raíz; se eliminó.)*
- **Validación COMPLETA de 3° básico (pregunta por pregunta) + correcciones**
  (`docs/informe-validacion-3basico.md`): por ser para niños de 8-9 años se revisó **cada una de las
  2.558 preguntas** (no muestreo): Nivel 2 (estructura + **audibilidad** propia de 3° + numérico +
  solape) y Nivel 1 con **23 subagentes** (trozos de ~120, guía compartida). Resultado: **0 claves
  equivocadas** en las 2.558 y **audibilidad perfecta** (0 opciones homófonas). Historia, Ciencias y
  Lenguaje quedaron 100% aprobadas; los únicos hallazgos (12) estaban en Matemática. **Se corrigió
  todo:** OA11 fracciones (7 preguntas `mat3-oa11-7…13` bajadas de denominadores 6/8/9/12 a 2/3/4, y
  `mat3-oa11-16/-18/-14` con distractores/clave arreglados), 2 `tip` erróneos (`mat3-oa03-7/-18`),
  sensibilidad por edad (`mat3-oa22-16` "niño de 8 años" → "perro grande"), contexto
  (`mat3-oa26-25`) y 1 enunciado largo de Lenguaje (`len3-oa23-28`, 231→194 chars). Los 16
  casi-duplicados entre OA se evaluaron como variedad de plantilla (sin cambios). Re-verificado el
  Nivel 2: 0 errores, audibilidad intacta, 0 dobles-correctas. Solo datos (`revisada:false` intacto).
  *Gotcha del formato:* `matematicas-3basico` usa JSON `indent=2` y `lenguaje-3basico` `indent=1`
  (por `autocrlf`, en disco CRLF); re-dumpar con el indent equivocado reformatea el archivo entero —
  hay que detectar el indent por archivo (round-trip) antes de escribir.
- **Voz de 3° resincronizada tras las correcciones (regla #8).** Al cambiar el **enunciado** de una
  pregunta, su clip de voz pregrabado queda desfasado. De las correcciones de 3°, solo 3 tocaron el
  enunciado (`mat3-oa22-16`, `mat3-oa26-25`, `len3-oa23-28`); el resto no afecta el audio (los `tip`
  **no se locutan**, y las opciones nuevas de OA11 ya tenían clip). Se regeneraron los **3 clips** con
  `generar-voz-3ro.py` (Azure, ~US$0; hubo que `pip install requests`, la clave vive en
  `Escritorio/azure-tts.txt`). Verificado: los 3 enunciados ahora tienen su clip (manifiesto), y los 2
  de Matemática auditados con Azure STT suenan correctos ("un"→"1" y "0"→"cero" son manías del
  transcriptor, no del audio). *Cómo verificar coincidencia audio↔texto:* el `manifiesto.json` de cada
  asignatura mapea **texto→clip**; una pregunta cuyo enunciado/opción no esté en el manifiesto quedó
  sin voz.
- **Landing: acceso al panel del profesor arriba a la derecha.** El enlace "Panel del profesor" solo
  estaba en el pie (`index.html` de la raíz). Se agregó un **botón fijo** `top-right` (`.prof-top`,
  `position:fixed`) con ícono 🧑‍🏫 y el texto **"Profes"** (`aria-label="Panel del profesor"` para
  lectores de pantalla) → `/profesor.html`, siempre visible sin bajar. Estilo acorde (pastilla violeta
  translúcida, responsive ≤520px). El enlace del pie se conservó. *(Verificado en el archivo; el panel
  del navegador integrado rechazó la raíz `localhost:8765/` esta sesión, así que no hubo captura en
  vivo — se ve en vulpo.cl al desplegar.)*
- **A2 cerrada: los 8 villanos propios de 3° y 7° (16 imágenes, normal + derrotado).** Hasta ahora 3°
  y 7° prestaban los villanos de 8° (comentarios `PLACEHOLDER`). Roberto generó las 16 (los nombres ya
  estaban cableados: 3° El Número Perdido/El Olvido/El Apagón/El Borrón; 7° El Anacronismo/El Azar/La
  Erosión/El Silencio). Se identificaron una por una (nombres UUID en Descargas) y se procesaron con
  `scripts/procesar-lote8.py` (fondo blanco por inundación, recorte, cuadrado, 512 px, ~5 MB total) a
  `assets/villano-<asig>-3ro.png` / `-7mo.png` + `-derrotado`. Se cableó `villanoImg` +
  `villanoImgDerrotado` de las 8 campañas (3° Mate e Historia no tenían la línea derrotado; se agregó)
  y se quitaron los 8 `PLACEHOLDER`. **8° intacto** (nombres nuevos, no se pisó `villano-historia.png`).
  *Gotchas:* dos derrotadas de Lenguaje (El Borrón 3°, El Silencio 7°) llegaron con **texto incrustado**
  (globos con palabras) y hubo que **regenerarlas sin texto** (el prompt debe insistir "sin palabras,
  sin letras, globos en blanco"); y **NO se copiaron los 16 originales** a `assets/originales` (ya pesa
  175 MB y el sitio es sensible al tamaño), quedan en Descargas de Roberto. Verificado estático: las 16
  rutas existen, 0 PLACEHOLDER (el panel del navegador vino inestable, sin captura en vivo).
- **A5 cerrada: pronunciación de "copihue" en la voz de 3°.** Roberto escuchó el clip (A5) y no le
  gustaba cómo sonaba "copihue" (flor chilena que Azure no sabe leer). El pipeline ya tenía el arreglo
  por SSML `<phoneme>` IPA en `_FONEMAS` de `generar-voz-3ro.py` (indexado por texto MOSTRADO, así que
  cambiar la pronunciación NO invalida el manifiesto ni el banco). Se generaron **4 variantes IPA** a
  archivos temporales para que eligiera de oído; eligió **`ko.piˈwe`** (co-pi-UÉ, acento final) sobre
  la anterior `koˈpiɣwe`. Se actualizó `_FONEMAS`, se **borraron los 2 clips de copihue** (solo cie3
  los tiene: `acb4dae9f7c13d0e`, `58958b47fe787ee0`) y se **regeneraron** (el generador solo rehace lo
  que falta, así que hay que borrar el clip viejo para forzar la nueva pronunciación). Verificado por
  Roberto. *Gotcha:* al cambiar una pronunciación en `_FONEMAS`, borrar los mp3 afectados antes de
  regenerar; si no, el script los ve "ya generados" y no los toca.
- **Contenido sensible: inventario, pool de CN07 y código de color (apoya A4 + feature nueva).**
  A pedido de Roberto: (1) **pool de las 90 preguntas de CN07 OA 01/02/03** (sexualidad/reproducción/
  ITS) en `docs/pool-cn07-sexualidad.md`, para mostrárselas al colegio con transparencia (A4). (2)
  **Inventario de TODO el contenido sensible** de 3°/7°/8° (un subagente barrió los `oa.json` y los
  `cuidados-*.md`): **20 OA sensibles** (Matemática ninguno), 9 ALTA; solo 5 estaban etiquetados antes,
  15 son hallazgos nuevos. (3) **Código de color de 5 categorías** aprobado por Roberto —🔴 Sexualidad,
  ⚫ Violencia y muerte, 🟡 Religión y creencias, 🟤 Pueblos originarios, 🔵 Sustancias— con el mapeo
  OA→categoría(s) (multi-etiqueta) en **`docs/contenido-sensible.md`** (leyenda del armador + insumo de
  la feature). **Feature pendiente de diseñar/implementar:** marcar lo sensible en el armador
  (`?armar=1`) y en el enlace de venta, con opt-in del usuario por categoría/capítulo (los enlaces
  trabajan por capítulo, que hereda las categorías de sus OA). Ver `pendiente.md`.
- **Pendiente (Roberto):** hacer A1 con los PDF/tablero (7-11 h, el camino crítico); cuando exporte
  el `revisadas.json`, se aplica con `aplicar-revisadas.py` y se regenera el tablero. Sigue en pie
  la reautenticación de NotebookLM (el paso del AI Brain de la orden 66 falla hasta rehacer el login
  por Chrome).

### Sesión 67 (2026-08-28) — A7: contenido sensible marcado en el armador
Feature chica y acotada del Bloque A. **No se tocó contenido** (ningún banco, voz ni pregunta): solo
el armador de enlaces de muestra (`?armar=1`). Flujo brainstorming → spec → plan → ejecución inline,
verificando con `scripts/cdp.mjs`.
- **La decisión de qué contenido sensible entra se toma AL CONSTRUIR el enlace, no al abrirlo.** La
  casilla por capítulo que el armador ya tenía es el control: lo que no se marca no viaja, y quien
  recibe abre solo lo aprobado. **El enlace de muestra/venta (`?solo=`, `?m=`) NO cambió** — no hay
  opt-in en tiempo de apertura, que sería blando (VULPO es estático). Descartado por diseño, no por
  falta de tiempo.
- **`assets/js/sensible.js` (nuevo, compartido por las tres apps):** mapa de los 20 OA sensibles →
  sus categorías + las 5 categorías del código de color (`SENSIBLE.cats`) + `deExpedicion(exp)` (las
  categorías presentes en un capítulo, deduplicadas y en orden canónico, ignorando el BOSS). Es el
  **espejo-máquina de `docs/contenido-sensible.md`**: al agregar un OA sensible hay que tocar los
  dos (la severidad ALTA/MEDIA/BAJA vive solo en el doc; la UI no la usa).
- **Lo lee solo `arrancarArmador`**, con **respaldo vacío** en cada `index.html` (patrón de
  `revision.js`): si `sensible.js` no carga (404), el armador degrada a "sin marcas" y **no
  crashea**. Verificado renombrando el archivo: en las tres apps la lista sigue viva y el único 404
  es `sensible.js`.
- **Qué se ve en el armador:** una **leyenda** con solo las categorías presentes en ese nivel (3°
  muestra solo ⚔️; 7° incluye ❤️ Sexualidad por CN07; 8° tiene 🚭 pero no ❤️), un **emoji** por
  capítulo sensible (con `title` de la categoría, fondo tenue de su color), y el **resumen** dice
  "· incluye: …" según los capítulos marcados — útil directo para A4 (armar el enlace de CN07 para
  el colegio salesiano y ver qué contiene).
- **Emojis, no puntitos de color puros:** en el teléfono no hay hover y el emoji se lee solo; el
  color va en la leyenda y como fondo del emoji. Es seguro para daltónicos. Única desviación del
  "puntitos de color" del doc.
- **Las tres apps recibieron el mismo Conjunto E** (5 ediciones byte a byte idénticas, anclas en las
  mismas líneas), para que el fork no diverja. **CRLF preservado** (verificado con `file` y
  `git diff --numstat`: 22/1 en cada `index.html`).
- **Verificado jugando con `cdp.mjs`** en las tres apps: leyenda correcta por nivel, marcas en los
  capítulos correctos, resumen que se actualiza al marcar, el respaldo vacío, y regresión (8° arranca
  normal). Cierre: **cero errores de consola y cero 404** en las tres.
- Spec y plan: `docs/superpowers/specs/2026-08-28-contenido-sensible-armador-design.md` y
  `docs/superpowers/plans/2026-08-28-contenido-sensible-armador.md`. `docs/contenido-sensible.md`
  actualizado (feature implementada + recordatorio de sincronizar el `.js`).
- **Pendiente de arrastre (Roberto):** A1 (aprobación pedagógica de 3° y 7°, el camino crítico); A4
  (conversar CN07 con el colegio — el armador ya se lo muestra); A6 (confirmar la foto del lunes
  31/08); y la reautenticación de NotebookLM (el paso del AI Brain sigue cayendo hasta rehacer el
  login por Chrome).

### Sesión 68 (2026-08-28) — Vocabulario y Reto Sin Fin en 7°, y los módulos transversales se separan
Tres frentes, y el tercero nació de una observación de Roberto que ordena el proyecto hacia
adelante. **8° y 3° casi no se tocan**: sus únicos cambios son guardas y respaldos que ahí no
hacen nada.

#### A3 · La landing habla de tres cursos, sin mentir

La tarea decía "solo después de A1", porque la página prometía *"todas aprobadas una a una"* y de
3° y 7° no hay ninguna firmada. Se resolvió **diciendo el estado real** en vez de saltarse la
regla o dejar la tarea sin hacer:

> **7.524 preguntas originales** — Escritas objetivo por objetivo desde las Bases Curriculares.
> Las **2.536 de 8° están aprobadas una a una**; los bancos de 3° y 7° están en revisión
> pedagógica.

Cambió el título, los metadatos (que es lo que ve Google y lo que se muestra al compartir por
WhatsApp), el titular, la franja de legitimidad y las tres tarjetas de datos: **3 cursos ·
7.524 preguntas · 236 objetivos**. `docs/comercial.md` suma dos prohibiciones nuevas, entre ellas
**no decir que 3° y 7° están "revisados"**.

> Tener un proceso de revisión documentado **es** la señal de credibilidad; prometer que todo está
> aprobado se cae a la primera pregunta de una UTP. Queda **A8**: cuando A1 cierre, esa frase pasa
> a "7.524 aprobadas una a una", que es un argumento bastante más fuerte.

#### Vocabulario en 7° (A9)

**El código ya estaba en el fork y solo faltaba el dato:** `scr-lenguaje` y `abrirLenguaje()`
venían del fork de 8° y solo estaban apagados. El trabajo de código fueron tres líneas.

**120 palabras en 4 áreas** (`contenido/vocabulario-7basico`), sacadas del temario real de 7°.
120 términos distintos, ninguno repetido, sin solape entre áreas. Dos decisiones escritas en su
`oa.json`: **4 áreas y no 5** —la quinta de 8° son palabras de sus lecturas y 7° no tiene módulo
de Lectura—, y **fuera el vocabulario de los `CN07 OA 01/02/03`**, porque esos objetivos están
cubiertos en la campaña de Ciencias, donde el armador **sí** los marca como sensibles.

**La tanda de validación se ganó el sueldo, otra vez.** Historia salió con **18 de 30 (60%) de
sesgo de largo**, escribiéndola tratando de evitarlo. Se corrigió **dándole cuerpo a los
distractores, sin tocar ni una respuesta correcta**, y la lección se transfirió sola: Ciencias 5,
Matemática 6, Lenguaje **2**. Todas quedaron en 0.

#### Reto Sin Fin de cálculo en 7° (A11)

Alcance decidido por Roberto: **solo el Modo Sin Fin**, como extra dentro de Matemática, sin
reemplazar su campaña ni sumarle un segundo jefe. El motor quedó en **`assets/js/calculo.js`**
(229 líneas, compartido); lo propio de 7° son 45 líneas de generador con su temario.

**Tres defectos que solo aparecieron probando, ninguno leyendo:**

1. **El generador producía opciones repetidas: 889 de 1.500.** En `−2 − 9` dos distractores daban
   7, y con resultado 0 el opuesto empataba con la clave. Lo cazó el verificador de aritmética que
   `cuidados-matematica.md` exige — recalcular cada clave por otro camino. Corregido con un guard
   que garantiza cuatro valores distintos: **0 errores en 1.500**.
2. **El juego quedó muerto, y NO era el 404.** Al hacer la prueba obligatoria salió
   `ORDEN_ASIG is not defined`, pero estaba roto **también con el archivo presente**:
   `CALC.init({activo:HAY_SINFIN})` estaba mil líneas antes de `const HAY_SINFIN`, y un `const`
   leído antes de su declaración lanza `ReferenceError`.
   > Es una trampa **nueva** para este proyecto: el síntoma es idéntico al del archivo que no
   > carga —la pantalla se ve bien y ningún botón responde—, así que se diagnostica mal. **La
   > llamada `init` va pegada a la declaración de su bandera.**
3. **Con el archivo ausente el botón igual aparecía y no hacía nada** — el mismo defecto del botón
   de mini-clase de la Sesión 64. Ahora se guarda por `CALC.activo`, que es false si el módulo no
   cargó: sin archivo 5 nodos, con archivo 6.

De paso: el modo revisión de 7° decía **"Revisión de 8° básico"**, otro resto del fork.

`detenerTimersActivos` quedó **byte a byte idéntica en los tres forks**: 8° y 3° llevan el
respaldo vacío de `CALC` aunque no tengan el módulo, que es lo que mantiene convergente el fork.

#### Los módulos transversales se separan (decisión de Roberto)

**El Reto de cálculo, las lecturas y el Vocabulario tienen asignatura asignada pero no son esa
asignatura.** Pasan a ser una categoría propia, agrupada e **independiente del nivel**, para que
el motor se escriba una vez y lo único que cambie por curso sean los datos.

Lo importante es que la distinción **no quedó como criterio sino como propiedad objetiva**: un
banco es del currículum si su código lleva el nivel adentro (`HI07`, `MA03`) y transversal si no
(`VOC`, `AF`). Eso ya lo consultan `validar-oa-json.py` y `generar-tablero.py`, así que **no hay
lista de carpetas que mantener** — antes sí la había, escrita a mano, y se rompió al primer módulo
de otro nivel.

- **`docs/modulos-transversales.md` (nuevo)** es su estándar: qué son, las reglas que comparten,
  cómo se agrega uno y las trampas ya pagadas.
- **`contenido/vocabulario/` → `contenido/vocabulario-8basico/`.** Esa inconsistencia era la que
  descolocaba el tablero: el Vocabulario de 7° se ordenaba con 7° y el de 8° caía al final,
  después de Ana Frank. Una sola referencia viva.
- **El tablero los agrupa** bajo "Módulos transversales", tras los tres cursos, con una bajada que
  aclara que **no son cobertura curricular**. Importa porque la aprobación son 7-11 horas ahí
  dentro, y currículum y apoyo son dos trabajos distintos.
- **Nombres que difieren a propósito:** Vocabulario por nivel; **Lectura por libro, sin nivel**
  (un libro podría ir a dos cursos); el Reto sin carpeta, porque no consume banco.

> **El Reto de cálculo es el único contenido del proyecto que no consume banco.** No suma
> preguntas que escribir, ni horas de aprobación, ni clips de voz: agregarlo a un curso nuevo son
> ~45 líneas. Es lo más barato que se le puede sumar a un nivel, y ahora está dicho donde se lee.

#### Un defecto encontrado al llegar, antes de todo lo demás

Tras el `git pull` el **tablero estaba desactualizado respecto al banco**: el otro PC corrigió 70
líneas de Matemática de 3° y no lo regeneró, así que mostraba el texto viejo de una pregunta que
ya no existe. Importa porque la aprobación se hace ahí: se habría firmado un texto ausente del
banco, y la marca se aplica por id. **La corrección de un banco y `generar-tablero.py` van
siempre juntas.**

#### Verificación

Con `scripts/cdp.mjs`, jugando: Vocabulario de 7° con sus 4 etapas de 30 y una pregunta real; el
Sin Fin con **7 aciertos seguidos**, récord guardado y premio pagado; 1.500 operaciones sin un
error de aritmética, sin opciones repetidas, sin empates de valor y **sin decimales**; el juego
sobrevive si `calculo.js` no carga; la landing sin desborde a 375 y 1280 px. **8° y 3° sin
regresión, y cero errores de consola y cero 404 en los tres.**

- **Pendiente inmediato:** 3° básico (Vocabulario y, si se decide, su Sin Fin).
- **Abiertas en `pendiente.md`:** **A8** (la frase de la landing cuando A1 cierre), **A10**
  (Vocabulario en 3°, que suma voz y va después de cerrar su banco), **A12** (migrar el Reto de
  Cálculo de 8° al motor compartido: hoy hay solape, y es un cambio sobre producción que merece su
  propio paso) y **A13** (Sin Fin en 3°, que antes necesita una decisión: 3° juega `SIN_RELOJ` a
  propósito y un Sin Fin es por definición un juego de velocidad).
- **Pendiente de Roberto:** sin cambios — **la aprobación pedagógica** sigue siendo el camino
  crítico, ahora con 171 objetivos.

### Sesión 69 (2026-08-28) — El desafío de cálculo llega a 3°, sin reloj
Sesión corta y de una sola pieza. **No se escribió contenido:** el Reto no consume banco.

#### La medición invirtió lo que parecía obvio

Roberto pidió ver la estructura del desafío y del Vocabulario para 3°, intuyendo que debían ser
distintos. Medido, la respuesta **se invierte** respecto a 7°:

- **El desafío encaja MEJOR en 3° que en 7°.** Allá era un extra al lado del currículum; acá es la
  práctica de tres objetivos suyos: **`MA03 OA 04`** —*"estrategias de **cálculo mental** para las
  adiciones y sustracciones hasta 100"*—, `OA 08` (tablas) y `OA 09` (división en las tablas).
- **El Vocabulario encaja PEOR.** Lenguaje de 3° **ya cubre vocabulario en su propio currículum**:
  `LE03 OA 10` (significado por contexto y raíces) y `OA 11` (diccionario) tienen **30 preguntas
  cada uno**. En 7° y 8° eso no pasa, y por eso allá el módulo agrega algo. Además costaría ~120
  preguntas + ~600 clips de voz + horas que se suman al cuello de botella.

Decisión de Roberto: **solo el desafío**. El Vocabulario queda como **A14**, con el ángulo que sí
serviría anotado —las palabras nuevas de Ciencias e Historia de 3°, que es distinto de *la
estrategia* para deducirlas.

#### Sin reloj, y no es una concesión

3° juega `SIN_RELOJ` en todo el curso a propósito: a los 8-9 años el cronómetro produce ansiedad
y no foco. **La salida no fue aflojar el reloj sino quitarlo.** El motor ganó `sinReloj:true`, que
saca el contador y la barra **del DOM** —no los oculta— y nunca expira. Sigue siendo infinito:
la tensión la da la escalera de dificultad y el récord. El rótulo es configurable y en 3° dice
**🪜 Escalón** en vez de ♾️ Racha.

**La voz se resolvió sola:** `sonarClip` ya cae a la voz del navegador cuando un texto no está en
el manifiesto, y "7 + 5" casi no tiene palabras que leer. **Cero clips nuevos de Azure.**

#### Dos defectos que cazó el verificador de aritmética, y el segundo era grave

1. **Los distractores producían negativos** (`5 + 8` ofrecía `−3`). En 3° eso es contenido de otro
   año: el niño lo descarta sin pensar, así que no mide nada.
2. **⚠️ Una clave estaba MAL.** En `▢ − 17 = 4` la respuesta correcta es **21** y el generador
   marcaba **4**. Es el peor defecto posible —castiga justo al que razona bien— y **no se veía
   leyendo el código**.

Los dos salieron de recalcular cada clave por un camino independiente, que es lo que exige
`docs/cuidados-matematica.md`. Corregidos: **0 errores en 1.500 operaciones**, sin negativos, sin
decimales, divisiones siempre exactas, multiplicaciones dentro de las tablas y sumas que no pasan
de 100.

#### Y se corrigió algo que la Sesión 68 había hecho mal en 7°

El botón del Reto se guardaba con `c.asignatura==='Matemáticas'` — **justo el patrón que causó los
bugs de las Sesiones 63 y 64**. Peor: en 3° la asignatura se escribe **`'Matemática'` en
singular**, así que esa comparación **nunca habría entrado** y el defecto habría sido silencioso.

Se movió al dato de la campaña (**`sinfin:true`**), y con eso **`renderCampaña` quedó byte a byte
idéntica en los tres cursos** — comprobado por hash.

> Vale la pena registrar el patrón, porque ya van tres veces: **un `if` sobre el nombre de la
> asignatura no dice si el nivel tiene esa funcionalidad.** La pregunta correcta se responde con
> un campo, no con una cadena de texto.

#### La landing dice ahora "…y creciendo"

En la tarjeta del **3**, que es justo el número que un colegio con 5° podría leer como "solo
tres". En la franja o el titular quedaría suelta; ahí desarma la objeción.

#### Verificación

- **Jugado**: 9 aciertos seguidos con operaciones reales de `MA03`, récord guardado, monedas
  pagadas. **Tras 8 segundos sin responder no terminó** — el modo sin reloj funciona.
- **Sin el archivo `calculo.js`** los tres cursos siguen vivos y el botón no se dibuja (3° con 8
  nodos, 7° con 5); con él aparece (9 y 6).
- **8° sin regresión** (12 diagramas, 5 niveles del Reto, 17 lecciones) y 3° conserva `SIN_RELOJ`
  en su quiz normal.
- **Cero errores de consola y cero 404** en los tres.

- **Pendiente inmediato:** ninguno de este trabajo. `docs/modulos-transversales.md` recoge el modo
  sin reloj como parte del estándar.
- **Abiertas en `pendiente.md`:** **A12** (migrar el Reto de Cálculo de 8° al motor compartido; hoy
  hay solape y es un cambio sobre producción), **A14** (decidir si 3° lleva Vocabulario), **A8** y
  **A10**.
- **Pendiente de Roberto:** sin cambios — **la aprobación pedagógica** sigue siendo el camino
  crítico.

### Sesión 70 (2026-08-28) — El modo de aprobación por muestreo, y el desafío entra en los enlaces
Roberto preguntó qué se podía hacer para avanzar hacia la v1. La respuesta, medida: **lo único
que ataca el camino crítico es acortar sus 7-11 horas de aprobación.** Todo lo demás se apila
detrás de eso.

#### El hueco que tenía el tablero

El criterio de `docs/aprobacion-pedagogica.md` es revisar **8 de las 30** preguntas de cada OA,
pero **el tablero no lo implementaba**: dibujaba las ~8.000 preguntas y quedaba en manos de
Roberto decidir cuáles mirar —o leerlas todas, que triplica el trabajo—. Sin teclado y sin forma
de retomar.

**Modo "⚡ Aprobar por muestreo":** una pantalla por objetivo con **sus 8 preguntas ya elegidas**.
**Espacio** aprueba el OA completo y avanza, **V** manda a ver las 30, **S** salta, **Esc** sale.
La cola son solo los OA con preguntas pendientes —**170**, porque 8° ya está aprobado— con
contador y **reanudar donde se quedó**, aunque se cierre el navegador.

Tres decisiones que conviene respetar:

- **La muestra es estable**, sorteada con una semilla derivada del código del OA. Si cambiara al
  recargar, uno podría aprobar un OA habiendo visto ocho preguntas y volver a verlo con otras
  ocho, **sin saber cuál versión aprobó**.
- **Aprobar marca las 30, no las 8 mostradas.** Eso es el criterio escrito, no un atajo.
- **No guarda aparte:** reusa el mismo almacén y la misma función `fijar` del tablero, así que
  las copias de un OA que pertenece a dos capítulos se sincronizan solas (el defecto de las 270
  preguntas de Lenguaje de 3° que se dibujan dos veces).

**Y se agregó el `tip` a la vista.** El tablero no lo mostraba, y es parte de lo que hay que
aprobar: este proyecto ya tuvo tips equivocados —uno decía "20 pasos" donde eran unidades, otro
contradecía su propia pregunta—. Suma ~1 MB al archivo y lo vale. De paso, favicon al tablero.

#### El desafío de cálculo no se podía mostrar a un colegio

Lo encontró Roberto: *"en el creador no veo los desafíos de mates ni los vocabularios"*. Medido,
tenía razón a medias — y la mitad que tenía razón importaba.

- **El Vocabulario sí estaba** en 7° y 8°, local y en producción. En 3° no aparece porque se
  decidió no construirlo (Sesión 69).
- **El desafío de cálculo no aparecía en NINGUNO.** El armador lista `EXPEDICIONES`, y ni el Reto
  de Cálculo de 8° ni el Reto Sin Fin son expediciones: son módulos con pantalla propia. **Un
  profesor con un enlace de muestra nunca veía esa parte del producto**, justo la más vistosa de
  enseñar.

**Catálogo `EXTRAS` por nivel:** módulos que no son expediciones pero sí pueden ir en un enlace.
Va **como dato y no como `if` por curso**, así que el armador, el filtro de `?solo=` y la lista
del modo prueba quedan iguales en los tres forks. El armador pasa de 20 a **21** casillas en 8°,
de 23 a **24** en 7° y de 25 a **26** en 3°.

#### ⚠️ Caí DOS VECES en la misma trampa, y la segunda ya estaba documentada

Escribí `const EXTRAS = HAY_SINFIN ? [...]`, y ese bloque corre **mil líneas antes** de que se
declare esa bandera: `ReferenceError` por zona muerta temporal, y **el juego muerto** con el
síntoma de siempre —la pantalla se ve bien y ningún botón responde—.

Es **exactamente** lo que la Sesión 69 dejó escrito en el código y en `docs/modulos-transversales.md`
después de que pasara con `CALC.init`. La nota no bastó.

> **La regla, ahora en forma de patrón y no de advertencia:** un literal que corre temprano **no
> puede leer una bandera declarada después**. La condición va dentro de una **función**
> (`disponible()`), que se evalúa recién al usarse. Y el filtro de `?solo=` mira **solo el id**,
> porque tampoco puede consultar la disponibilidad todavía.

#### Verificación

- **Usando el modo:** 5 aprobaciones con el teclado dejaron el contador en **2.536 → 2.686**,
  exactamente +150 (5 × 30). **V** abre el OA con sus 30 en el tablero. Recargar y reabrir vuelve
  al mismo punto. La última pregunta **no queda tapada** por la barra de acciones (medido, no
  supuesto).
- **Enlaces de muestra:** `?solo=hist7-cap1,sinfin` dibuja las dos tarjetas y el Reto **abre y
  genera** una operación real; 8° abre su `scr-calc-mapa`; **el token `?m=` también funciona**,
  generado por el propio armador con caducidad; un enlace con solo el extra funciona; un id
  inventado cae al juego normal; el **modo revisión** sigue bien.
- Las tres apps juegan una etapa real. **Cero errores de consola y cero 404.**

- **Pendiente inmediato:** **M4** (`niveles.js`), que es lo que abarata los tres cursos que
  faltan: dar de alta un curso toca hoy **27 puntos de edición en tres archivos**, ocho de ellos
  listas paralelas.
- **Pendiente de Roberto:** la **aprobación pedagógica**, ahora con la herramienta hecha para
  ella. Sigue siendo el camino crítico de la v1.

### Sesión 71 (2026-08-28) — El currículum de 4°, 5° y 6° queda fijado, y las capas se escriben
Dos trabajos, ninguno de código de juego: **no se tocó ningún `index.html`, ningún script ni una
sola pregunta existente** (verificado con `git status` al cierre).

#### Los tres análisis externos, releídos y aterrizados

Roberto pidió tener más presentes los tres documentos del 27/08 (`Estrategia_VULPO_PWA_Android_iOS`,
`Proyecto_VULPO_PWA_v1.0_Analisis_Tecnico` y `Modelo_Suscripcion_VULPO`), **especialmente en la
manera de programar y ordenar los archivos**. Se releyeron completos y se contrastaron con lo que
el repositorio ya recogía.

**El fondo ya estaba bien recogido** en `docs/roadmap-tecnico.md` (Sesión 63), que además los
**corrige** con hechos que ellos no conocían: el `start_url:/juego/` que abriría el curso
equivocado, la precarga `cache-first` que bajaría 250 MB al teléfono de un niño, y el
`<base href="/">` que obliga a que el alcance del service worker sea `/`. Eso no había que
rehacerlo.

**Lo que faltaba era justo lo que Roberto señaló: la forma de ordenar los archivos no estaba
escrita.** Los tres documentos la dan por supuesta —"esto permite mantener la separación entre
lógica, contenido y recursos", "NO modificar `/contenido/` ni `/supabase/` en PWA v1"— y el
proyecto la cumplía de hecho. Pero **una regla que no está escrita no obliga a nada**, y vienen
tres cursos más y una extracción de motor que la van a poner a prueba. Se agregó a este archivo la
sección **"Cómo se ordenan los archivos: las cinco capas"**, con sus cinco reglas derivadas.

**Y un número que estaba mal en tres archivos a la vez.** Los pesos venían de una medición vieja,
anterior a la voz de Ciencias y Lenguaje de 3°:

| | Decía | Medido el 28/08 |
|---|---|---|
| `assets/` | 459 MB | **464 MB** |
| Voz de 3° | 227 MB | **251 MB** |
| Sitio publicado | 273 MB | **333 MB** |

Corregido en `CLAUDE.md`, `pendiente.md` y `docs/roadmap-tecnico.md`, que se contradecían entre
sí. Y quedó dicho lo que ese número significa: con el techo de 1 GB de GitHub Pages y los ~254 MB
que suma la voz de 4°, **la regla de voz solo de 1° a 4° no es una preferencia pedagógica, es la
única aritmética que cabe**.

#### El currículum de 4°, 5° y 6°: 12 carpetas, 284 OA

Encargo de Roberto, acotado a propósito: *"solo descarga la info de los cursos que faltan,
ordénalos por carpeta y define los OA y sus objetivos, solo eso"*. **Cero preguntas escritas**,
que es lo correcto: el banco es el Bloque B y cuesta sesiones.

| | Matemática | Lenguaje | Ciencias | Historia | Total |
|---|---|---|---|---|---|
| **4°** | 27 | 30 | 17 | 18 | **92** |
| **5°** | 27 | 30 | 14 | 22 | **93** |
| **6°** | 24 | 31 | 18 | 26 | **99** |

Son **~8.490 preguntas por escribir**, más que las ~7.350 que estimaba `pendiente.md`. El número
ahora está **medido, no supuesto**: el paso 0 del molde de 7° —transcribir el currículum— está
hecho para los tres cursos, y B1/B2/B3 entran directo al fork y al banco.

**La trampa de la transcripción, y es una que hay que recordar:** la ficha web de una asignatura
en `curriculumnacional.cl` **devuelve los objetivos cortados a media frase**, y el peligro es que
*parecen* completos. El `CN04 OA 10` terminaba en "en relación con" y el `OA 07` se quedaba sin
mencionar el cerebro. Un texto cortado como fuente curricular es **peor que ninguno**, porque
nadie vuelve a mirarlo.

> **La ruta que sí funciona: la página individual del objetivo**,
> `…/<asignatura>/<n>-basico/<cod>-oa-NN`, que entrega el texto íntegro con sus ejemplos entre
> paréntesis. Se usó para **Ciencias de 4° entera** y para los tramos malos de **Lenguaje de 6°**
> (que además devolvía media Comunicación oral traducida al inglés) e **Historia de 5°**. Queda
> anotado en el `nota_fidelidad` de cada archivo: cuál pasó, y por qué.

**Verificación, en tres pasadas:**
- `validar-oa-json.py`: los 12 nuevos **`ok`, cero avisos**. Los 17 avisos que quedan son de
  bancos preexistentes (3°, 7°, 8° y los de apoyo), no de este trabajo.
- `generar-tablero.py` **vuelve a salir**. Es la comprobación obligatoria: un `oa.json` con otro
  dialecto deja sin tablero a los quince y bloquea la aprobación entera. Ya pasó dos veces.
- Un chequeo propio sobre los **284 textos** (truncados, puntos suspensivos, restos de inglés,
  placeholders): **0 sospechosos**.
  > **Su primera versión acusó 6, y los 6 eran falsos positivos míos:** `independientemente`
  > contiene `pendiente`, y el `MA04 OA 18` mide 38 caracteres porque el texto oficial es así de
  > corto. Se afinó antes de creerle. Es el mismo error que ya se cometió con el auditor numérico
  > (Sesión 62) y con el de "distractor fuera de escala" (Sesión 56): **un informe que marca lo
  > correcto se deja de leer.**

**Tres cosas que aparecieron y cambian trabajo futuro, todas declaradas en los `oa.json`:**

1. **`LE04 OA 15` queda EXCLUIDO del banco** ("escribir con letra clara"): es caligrafía
   manuscrita y no admite pregunta honesta. Va en `oa_excluidos_del_banco`, no en prosa — mismo
   criterio que `LE03 OA 16` y `LE07 OA 12`.
2. **⚠️ La conversación con el colegio ya NO es solo por 7°.** Aparecen `CN06 OA 04/05/06`
   (sistema reproductor y pubertad) y `CN06 OA 07` / `CN04 OA 08` (drogas y alcohol, este último
   a los 9 años), más `HI05 OA 02/03/04/07` (conquista, guerra de Arauco, encomienda, esclavitud)
   e `HI06 OA 05/08` (ocupación de la Araucanía, quiebre de la democracia). Cada uno con su
   `nota_contenido_sensible` y su categoría de `docs/contenido-sensible.md`.
3. **Lenguaje sigue siendo la asignatura menos evaluable por quiz** —13 de 30 OA en 4°, 13 de 30
   en 5° y 14 de 31 en 6° son de producción o de hábito— e **Historia suma 6 o 7 OA
   actitudinales por curso**. Escrito en cada `nota_evaluacion`, porque el mapa de dominio le
   muestra al profesor un porcentaje junto a "actuar con honestidad" y eso se lee como nota de
   conducta.

> **Decisión de forma: los `oa.json` agrupan por EJE oficial, no por capítulo de juego.** Se
> escribieron para fijar el currículum **antes** de que exista una sola pregunta, y el reparto en
> capítulos jugables se decide al construir el nivel, cuando ya se sabe cuántas preguntas admite
> cada objetivo. Decidirlo ahora sería adivinar. Cada archivo lo dice en su `nota_unidades`, y ahí
> queda indicado si conviene seguir las unidades del Programa (como Historia y Ciencias de 3°) o
> agrupar por tema con `capitulos_del_juego` (como Lenguaje de 3° y de 7°).

- **Pendiente inmediato:** sin cambios de prioridad. **M4** (`niveles.js`) sigue siendo lo que
  abarata los tres cursos nuevos, y **la aprobación pedagógica de 3° y 7°** sigue siendo el camino
  crítico de la v1.

### Sesión 72 (2026-08-30) — El primer libro de 3°: *Cuentos de Ada*
3° básico estrena su módulo **📖 Lectura** con *Cuentos de Ada*, de Pepe Pelayo. Es el segundo
libro del proyecto, después de Ana Frank en 8°, y el primero de un curso que lee en voz alta.

#### El motor no había que construirlo

**La biblioteca ya estaba entera en los tres forks** —la pantalla `scr-biblioteca`, su CSS de
papel cálido, `abrirBiblioteca` y `LIBROS`—, solo apagada en 3°. Es el mismo caso del Vocabulario
de 7° (Sesión 68): el código estaba y faltaba el dato. El cableado fueron tres cosas: la bandera,
el catálogo y la expedición de 10 etapas.

> ⚠️ **Y traía la trampa del fork.** El `LIBROS` de 3° apuntaba a `lect-anafrank`, que es
> contenido de **8°**. Encender `HAY_BIBLIOTECA` sin tocarlo le habría abierto *El diario de Ana
> Frank* a un niño de 8 años. Se **reemplaza**, no se agrega. Es el cuarto caso del mismo defecto,
> después del Duelo que ofrecía el Reto de 8°, el botón que bajaba las lecciones de 8° y
> `cargarPoolMate` descargando el banco de otro nivel.

#### La exclusión del mapa de dominio pasa a ser ESTRUCTURAL

`registrarOA` descartaba los módulos transversales con una **lista escrita a mano**
(`/^(AF-|VOC-)/`) que había que ampliar en los tres forks con cada módulo nuevo. Con `CA-` el
libro habría empezado a contarse como currículum en el mapa del profesor.

```js
if(!/^[A-Z]{2}[0-9]{2} OA [0-9]{2}$/.test(oa)) return;
```

Ahora se mide **solo lo que tiene forma de código curricular** —el que lleva el nivel adentro—,
que es el mismo criterio de `validar-oa-json.py` y `generar-tablero.py` y el mismo patrón con que
el servidor descarta lo que no reconoce. **El próximo libro ya no pide un cambio de motor.**
Verificado **4/0 en las tres apps**: los cuatro códigos de currículum se miden y ninguno de los
transversales; de paso rechaza malformados como `MA03 OA 1`, que el servidor botaba en silencio.
Va **idéntico en los tres forks** (10 líneas agregadas, 1 quitada en cada uno) aunque 7° y 8° no
cambien de comportamiento: mantenerlos convergentes es el objetivo.

#### El contenido, y el techo que se declaró por escrito

**10 tramos, uno por cuento** —Las vacaciones, La mentira, El sándwich, los tres intentos con
Cary, La renuncia, El acto heroico, La venganza y La batalla decisiva—, con **101 preguntas**
(~10 por tramo, 6 servidas por ronda). Nacen `revisada:false`.

**Las preguntas NO se escribieron desde el libro**, sino desde dos documentos de estudio que
entregó Roberto. La guía se declara a sí misma compilación de resúmenes escolares en línea,
advierte que **no sustituye al original** y avisa que las fuentes discrepan en nombres (Yoyito /
Yayito / Yayo, Cary / Cari) y en detalles como cuántos participan en la batalla final.

> Eso no la inutiliza —trama, personajes, motivaciones y desenlace **coinciden entre los dos
> documentos**— pero fija qué se puede preguntar. El banco se limita a eso y **no pregunta detalle
> fino**, porque *una pregunta de detalle inventado castiga justamente al niño que sí leyó el
> libro*. Queda escrito en el `nota_fidelidad`, con la fuente nombrada, para que nadie lo lea
> después como un banco escrito con el ejemplar en la mano.

#### Tres defectos propios, encontrados por las herramientas del proyecto

1. **Sesgo de largo del 60% en la primera pasada.** Es lo esperado —en 7° fue de 20 a 25 de cada
   30— y se corrigió como manda el estándar: **dándole cuerpo a 45 distractores, nunca acortando
   la correcta**, que la volvería imprecisa. Quedó en **0%**.
2. **Dos preguntas con el mismo enunciado** en cuentos distintos (`ada-t5-10` y `ada-t7-8`), que
   caza `revisar-tanda.py`. Al diferenciarlas **se releyó la clave y el tip de cada una**, que es
   justo la lección de la Sesión 59: al cambiar un enunciado se le puede pegar encima el de otra
   pregunta y dejarla con la clave equivocada.
3. **Una pregunta repetida entre dos tramos**, que caza `auditar-solape-oa.py`: T7 y T9
   preguntaban lo mismo con la misma clave. Se reemplazó la de T9. El par que queda (T4~T6, 0.57)
   es legítimo: los dos cuentos tratan de acercarse a Cary, pero preguntan cosas distintas.

#### El 404 de la portada, que no se dejó pasar

El arte propio del libro no existe todavía, y `assets/portada-lectura-cuentos-ada.png` daba **404
tapado por el `onerror`** — el defecto que 3° evita usando portadas explícitas. Se apunta a
`assets/portada-lectura.png`, que existe, **con un comentario que dice qué cambiar** cuando
Roberto genere el arte del libro.

#### Verificación (con `cdp.mjs`, jugando)

Recorrido real con clics: **📖 Lectura** aparece como quinto módulo → biblioteca → *Cuentos de
Ada* → mapa de **10 nodos** → tramo → tarjeta 🎯 → quiz de **6 preguntas, 4 opciones y sin
reloj**; se responde y avanza. El **"← Volver" regresa a la biblioteca**, no a Expediciones.

**Regresión:** 8° conserva su Ana Frank, sus 20 expediciones y sus 12 diagramas; 7° sigue con
`HAY_BIBLIOTECA=false` y sus 23 expediciones; las tres claves de guardado conviven y la partida
sembrada en 8° (777 XP) queda intacta. **Cero 404 y cero errores de consola.**

> **Un tropiezo de método que vale registrar:** la primera verificación decía que tocar el libro
> devolvía al inicio, y parecía un bug. No lo era: el navegador de prueba arranca **sin partida**,
> y el juego —con razón— manda a crear el perfil antes de dejar entrar a una expedición. Había que
> **sembrar una partida primero**. Un "defecto" que en realidad era el escenario de prueba mal
> montado.

**Cerrado el mismo día, con dos respuestas de Roberto:**

- **El sello es Santillana Infantil**, confirmado contra la tapa del ejemplar. La guía decía
  *Alfaguara Infantil (Chile, 2003)*, que es del mismo grupo; el dato **se le muestra al alumno**,
  así que valía preguntarlo en vez de elegir por probabilidad.
- **La portada se queda en la genérica de Lectura, y es una decisión, no un préstamo.**
  Dibujar la tapa de un libro ajeno es obra derivada de material con derechos, y es coherente con
  lo que el módulo ya hacía: el juego **no reproduce nada del libro** —por eso las preguntas son
  originales y el niño lee el ejemplar—. El comentario del código pasó de *"cambiar cuando exista
  el arte propio"* a **"no reemplazar"**, que es lo contrario: una nota que invita a un cambio que
  no debe hacerse es peor que ninguna.

- **Pendiente de Roberto:** **aprobar las 101 preguntas**, que ya salen en el tablero bajo
  "Módulos transversales"; y después la **voz** (~500 clips, del orden de US$0,3), que **va
  después de aprobar y nunca en paralelo**.
- Spec y plan: `docs/superpowers/specs/2026-08-30-lectura-cuentos-de-ada-3basico-design.md` y
  `docs/superpowers/plans/2026-08-30-lectura-cuentos-de-ada-3basico.md`.
#### Cierre de la Sesión 72 (30/08) — el libro queda aprobado y con voz

Roberto respondió las dos preguntas abiertas y luego pidió aprobar y generar. Todo el trabajo
es de datos y de audio: **el motor no se tocó** salvo una línea de configuración.

**Sus dos decisiones, y lo que cambió cada una:**

- **El sello es Santillana Infantil**, confirmado contra la tapa. La guía decía *Alfaguara
  Infantil (Chile, 2003)*, que es del mismo grupo. El dato **se le muestra al alumno**, así
  que valía preguntarlo en vez de elegir por probabilidad.
- **La portada se queda en la genérica de Lectura, por derechos de autor.** No es un préstamo
  a la espera de arte propio: ilustrar la tapa de un libro ajeno sería obra derivada, y es
  coherente con lo que el módulo ya hacía —el juego no reproduce nada del libro—.
  > Lo que había que corregir no era la ruta sino **el comentario**, que decía *"cuando exista
  > el arte propio del libro, cambiar las dos rutas"*. Ahora dice **NO reemplazar**, que es lo
  > contrario. **Una nota que invita a un cambio que no debe hacerse es peor que ninguna**, y
  > en este proyecto ya pasó que una advertencia sin revisar se volviera un candado (el `NS` de
  > la Sesión 65).

**Los seis filtros, corridos a pedido de Roberto y no de memoria.** Pasa todos: `validar-oa-json`
ok; `revisar-tanda --largo=120` 0 errores y **0% de sesgo de largo**; `auditar-banco-nivel` 0
errores y 0 avisos (correcta en 20/21/29/31%); `auditar-numerico` 0 opciones equivalentes;
`auditar-solape-oa` 1 par sobre el umbral; y **`auditar-audible-3ro`: las 101 se pueden responder
escuchando**, 0 homófonas. Se comprobó además que el banco **corresponde a sus tandas** (101 = 101)
y que el tablero está al día — el defecto de la Sesión 68 fue corregir un banco y no regenerarlo.

Los dos avisos se miraron uno por uno en vez de darlos por buenos: **T4~T6** (0.57) son dos cuentos
sobre acercarse a Cary que preguntan cosas distintas, y **`ada-t7-8`~`ada-t1-9`** comparten la
plantilla *"¿Qué muestra este cuento sobre… de Ada?"* pero no el contenido. En los dos se verificó
lo que el aviso pide: **la clave y el tip le corresponden a su propia pregunta**.

**Aprobación forzada de las 101** (decisión de Roberto). El proyecto pasa de **2.536 a 2.637
aprobadas**. El archivo cambió **102 líneas de 102**, o sea solo las marcas: el indent se detecta
con un round-trip antes de escribir, porque re-dumpar con el equivocado reformatea el banco entero.

**La voz: 515 clips, 12 MB, US$0,32** — clavado en la estimación. Entrada `ada3` en el generador
y en `VOZ_DIRS` del juego.

> **Un hallazgo que vale para todo módulo de lectura: ningún texto del libro cambia al
> pronunciarse — 0 de 515.** El normalizador no tiene nada que normalizar, porque es prosa pura,
> sin operaciones, símbolos ni emoji. Toda la familia de defectos de las Sesiones 56 y 60 —el
> "enero", el menos que desaparecía, las coordenadas leídas como preposición, los números
> romanos— **no puede ocurrir en un banco así**. Por eso la auditoría con reconocimiento de voz
> aquí rinde poco: lo único con riesgo real son los nombres propios (Ada, Yoyito, Pocho, Cary,
> Orco), que es el caso de *copihue*. Quedó sin correr, y anotada.

**Verificación (jugando, con `cdp.mjs`):** cobertura **505 de 505** textos del banco con clip y
**0 de 0 bytes**; el manifiesto carga pese al `<base href="/">` y aporta **515 entradas desde
`ada3/`**; en una ronda real **30 de 30** textos encuentran su clip; y los 5 clips de la pregunta
en pantalla responden **HTTP 200 `audio/mpeg`**, 24–28 KB. Cero 404 y cero errores de consola.

> **Un error de medición propio, registrado porque la conclusión falsa era alarmante.** La primera
> comprobación dijo *"opciones con clip: 0 de 4"*. Era falso: yo comparaba contra el `textContent`
> del DOM, que lleva la letra delante (*"A. Porque su mamá…"*), mientras el juego busca el clip con
> el texto **de los datos** (`orden.map(it=>it.o)`). Y busqué un botón `btnVoz` que no existe —se
> llama `btnEscuchar`—. **Medir la pantalla no siempre es medir lo que el juego hace**: hay que
> mirar por dónde pasa el dato.

- **Peso tras sumar la voz:** `assets/voz/` queda en **263 MB** y el sitio publicado en **317 MB**,
  lejos del techo de 1 GB.
- **Queda de este libro:** nada bloqueante. Opcional, la auditoría por muestra con Azure STT
  (~US$0,06) para los cinco nombres propios.

#### Una pregunta de producto que quedó abierta: la autoinscripción por un solo enlace

Roberto preguntó si puede repartir **un solo enlace** para que varias personas se inscriban solas
en un curso que él asignó, y que desde ahí se registren sus resultados. **Hoy no existe**: el
modelo es un `ALU-` por alumno, creado por el profesor con su nombre, y `kimun_canjear` engancha
el dispositivo a un perfil **que ya existe**. Ninguna función crea el perfil desde el lado del
alumno.

Es construible y es chico, porque **lo de "que se registren sus resultados" ya funciona solo**: en
cuanto un dispositivo queda vinculado a un perfil con curso, el XP, el mapa de dominio, la
participación, el ranking y los refuerzos empiezan a llegar sin tocar nada. Faltaría un **token de
inscripción** por curso, una pantalla que pida el nombre y una función `kimun_inscribirse`.

**Las cuatro cosas que hay que decidir antes** quedaron planteadas y sin resolver:

1. **El enlace *es* la credencial.** Hoy un `ALU-` filtrado regala **un** cupo; un enlace filtrado
   los regala **todos**. Se acota con cupo máximo, vencimiento (la maquinaria del token `?m=` ya
   existe) e interruptor.
2. **Los nombres dejan de estar verificados** — llegan apodos, duplicados y "asdf". Conviene
   marcarlos como autoinscritos para distinguirlos de los que escribió el profesor.
3. **Un dispositivo, un vínculo:** inscribirse dos veces dejaría dos perfiles y uno huérfano.
4. **Son datos de menores.** Hoy el nombre lo pone el colegio; con autoinscripción un niño lo
   escribe en un formulario público sin autenticar. Es exactamente lo que pregunta UTP.

Se le ofreció además una alternativa mucho más barata: **un enlace por alumno con el código
adentro** (`?alu=ALU-XXXX`), que elimina el error de tipeo —donde más se cae el canje— **sin tocar
el modelo de seguridad ni recoger datos de menores**. Roberto no eligió todavía.

#### Y el mismo día se levantó el bloqueo que llevaba meses: 3° y 7° quedaron aprobados

Roberto avisó *"ya aprobé varias en el módulo"*. No había nada en el repositorio, porque el
tablero guarda las marcas en `localStorage['kimun_revisadas']` **del navegador** y no salen de
ahí hasta apretar "Exportar revisadas". (Tampoco puedo leerlas yo: `cdp.mjs` arranca con un
perfil temporal nuevo cada vez, así que su almacenamiento está vacío por diseño.)

**Lo que llegó no eran "varias": eran 7.685 marcas, 5.048 de ellas nuevas** — o sea toda la
aprobación pendiente de 3° y 7° salvo 60 preguntas. **No se aplicó sin preguntar**, porque de eso
depende lo que la landing y la propuesta le dicen a un colegio. Roberto confirmó que lo respalda.

**El proyecto pasa de 2.637 a 7.685 de 7.745 aprobadas (99,2%).** Quedan los `HI03 OA 01` y
`HI03 OA 08`, que aparecen en **cero mientras los otros 14 OA de Historia de 3° están completos**:
la forma de dos objetivos **salteados** con la tecla `S`, no la de un trabajo cortado a la mitad.

**Cómo se aprobó cada cosa, que es lo que hay que sostener frente a una UTP:** 8° y los módulos de
apoyo se revisaron **pregunta por pregunta**; 3° y 7°, **por muestreo**. Por eso la landing quedó
en *"7.685 preguntas aprobadas… por un profesor, objetivo por objetivo"* y **no** en *"una a una"*,
que era lo que anticipaba la tarea A8 y habría sido exagerar. `docs/comercial.md` lleva ahora la
distinción escrita, para que nadie la redacte de nuevo hacia arriba.

**Dos defectos de `aplicar-revisadas.py`, encontrados al aplicar y corregidos:**

1. **Reformateaba los bancos.** Escribía con `indent=2` fijo, y la mayoría de los bancos usa
   `indent=1` (`matematicas-3basico` usa 2). El contenido quedaba bien, pero **el diff de marcar
   390 preguntas pasaba de 390 líneas a 5.463** y dejaba de poder leerse — justo lo que la Sesión
   66 había dejado anotado como trampa del formato.
2. **Ninguno de los bancos termina en salto de línea**, y el script sí lo agregaba.

   > **Mi primer detector de formato falló en los 9 bancos** y dijo "formato no reconocido".
   > Comparando byte a byte, la única diferencia era ese salto final. Vale la lección: cuando un
   > round-trip falla en el 100% de los casos, **el sospechoso es el detector, no los datos**.

   Ahora el script detecta indent y salto final con un round-trip contra el archivo en disco y los
   respeta. Comprobado corriéndolo **dos veces seguidas sin que toque un byte**.

**Un efecto de borde, benigno:** el script agrega el contador de nivel superior `revisadas`, que
los bancos de 3° y 7° no tenían y los de 8° y los módulos sí. Los deja **consistentes** con la
forma establecida; nadie lo lee como dato, es metadato. Se le agregó también al banco del libro,
que se había quedado sin él.

**Verificado tras tocar los 9 bancos:** 0 preguntas con estructura rota; los tres cursos juegan
una etapa real; el guardado de 8° queda intacto; **cero 404 y cero errores de consola**.

**Lo que esto cambia en el plan:** el Bloque A queda cerrado y **el camino crítico deja de ser la
aprobación**. Lo que manda ahora es el Bloque B —los bancos de 4°, 5° y 6°, ~8.490 preguntas— con
**M4 (`niveles.js`) delante**, porque es lo que abarata dar de alta un curso (hoy son ~27 puntos
de edición en tres archivos, ocho de ellos listas paralelas).

#### Y despues, ordenar las bases: cuatro agentes midiendo antes de sumar tres cursos

Roberto pidió **dejar todo ordenado antes** de entrar a los siguientes libros, vocabularios y
desafíos — porque lo que se sume desde ahora se copia tres veces más. Se despacharon **cuatro
agentes de solo lectura** (motor duplicado, scripts, documentación, contenido y assets) y **cada
hallazgo se verificó a mano** antes de actuar. Plan completo:
[`docs/superpowers/plans/2026-08-30-ordenar-las-bases.md`](docs/superpowers/plans/2026-08-30-ordenar-las-bases.md).

**Lo que midieron, que no se sabía con números:**

| | |
|---|---|
| Líneas de JS comunes a los tres forks | **1.982** → ~3.964 redundantes |
| Duplicación del JS de 7° | **77,6 %** |
| Funciones **byte a byte idénticas** en los tres | **71** (piso, no total) |
| Formatos de serialización distintos entre 16 bancos | **9** |
| Scripts sin una sola referencia viva | **10** de 25 |
| Afirmaciones falsas en documentación viva | **22** |

#### Dos bugs vivos que aparecieron de paso, y uno lo reportó Roberto

**1. 3° tenía Modo Difícil, y su propio diseño lo había descartado.** El spec dice *"Sin Modo
Difícil (los 15 s / 80% no van para 8 años)"* y *"descartado por edad"*, pero el fork lo conservó:
`renderModoSel` solo miraba `S.dificilDesbloqueado`, así que un niño de 8 años que vencía un jefe
recibía el botón 🔥. **Y de paso, la Maestría Total era inalcanzable ahí**: `esMaestro()` venía
copiado de 8° exigiendo `S.calc.jefe`, que en 3° nadie escribe.
Se cerró con la bandera **`HAY_DIFICIL`** y **cuatro guardas byte a byte iguales en los tres
forks** — no con `if` sueltos, que es lo que produjo el problema.
(Se comprobó de paso que el cronómetro **sí** está apagado en 3°: el `setInterval` vive dentro del
`else` de `SIN_RELOJ`, así que no se crea. Esa sospecha era infundada.)

**2. «En algunas pruebas creadas, aunque fueran de otro curso, siempre aparecía 8vo».** Reporte de
Roberto, y eran **dos pantallas**:

- `scr-rol`, la primerísima pantalla, decía *"Aprende jugando · **8° Básico**"* en 3° y en 7°. La
  ve **todo el que abre la app** sin código canjeado.
- `scr-inicio`, donde el jugador nuevo crea su perfil, decía *"**EXPEDICIÓN HISTORIA** · 8°
  Básico"*. Mal el nivel **y** la asignatura: ese título viene de cuando el juego era una sola
  expedición de Historia, y 3° empieza por Matemática.

Quedó *"TU EXPEDICIÓN"*, igual en los tres, con el nivel como único dato que cambia. **Va como
literal de HTML y no por JavaScript a propósito**: una constante leída en el arranque es justo el
patrón que mató las tres apps tres veces esta semana.

#### Lo que se ordenó

- **10 scripts retirados** (los 8 procesadores de arte, `aplicar-fix-distractores`,
  `generar-pdf-preguntas`), **rescatando antes** su parte reutilizable en
  **`scripts/procesar-arte.py`**, que recibe los archivos por argumento en vez de llevar una lista
  de UUID adentro. Probado reprocesando un villano real, no solo leído.
- **Códigos de salida:** `revisar-tanda.py` y `auditar-numerico.py` encontraban defectos y **salían
  con 0**, así que un `&&` en una cadena los ignoraba — y son la primera puerta del pipeline y el
  que caza dos respuestas correctas. Probado con un banco roto a propósito.
- **El fallback silencioso de los scripts de voz** (defecto mío del mismo día): pedirles una
  asignatura desconocida **generaba o auditaba Matemática sin avisar**, y al auditor le faltaba
  `ada3`. O sea que auditar el libro habría auditado Matemática **y pagado por ello**, mientras
  `pendiente.md` le decía al próximo que corriera justo ese comando. Ahora mueren con un mensaje.
- **5 assets huérfanos** (~900 KB), verificados con búsqueda exacta del nombre completo.
- **22 afirmaciones falsas en la documentación viva.** Las cinco graves eran contradicciones que
  yo mismo creé ese día al aprobar 3° y 7°: `docs/comercial.md` decía arriba que estaban aprobados
  y abajo *"nunca afirmando que su banco está aprobado"*, y `docs/aprobacion-pedagogica.md` —el
  documento que respalda la frase de la landing— seguía marcando **0 aprobadas**. Más el ranking
  descrito como "simulado" (es real desde la Sesión 19), la tabla de banderas sin `HAY_SINFIN` y
  con 7° sin Vocabulario, el armador con 2 niveles en vez de 3, y **el peso con cuatro cifras
  distintas en cuatro documentos**, ninguna igual al disco.

> **El peso quedó con una sola medición** (30/08): `assets/` **475 MB**, voz **263 MB**,
> originales 175 MB, `contenido/` 7,8 MB, sitio publicado **317 MB**. Al actualizarla hay que
> tocar `CLAUDE.md`, `pendiente.md` y `docs/roadmap-tecnico.md`, que es donde vivía repartida.

#### Un error propio que vale registrar

Al agregar `HAY_DIFICIL` la declaré **después** de su primer uso y **maté las tres apps** con zona
muerta temporal — `revisarDificil()` corre en el arranque. Es la **tercera vez esta semana** que
ese patrón muerde (`CALC.init`, `EXTRAS`, y ahora esto). La bandera quedó **pegada a `DIF_ASIGS`**,
con el porqué escrito encima para que nadie la "ordene" de vuelta junto a las otras.

> La lección de forma: en este archivo, **dónde se declara una constante es parte de su
> corrección**, no un detalle de estilo.

#### Lo que quedó diseñado y sin implementar

- **M4 · `niveles.js`** (spec y plan). Al medirlo el diseño salió **más chico** de lo que decía la
  tarea: casi ninguna de las ocho listas necesita existir, porque **el código ya contiene la
  información** (`HI08` = `HI` + `08`). El catálogo real son **4 prefijos y una fila por nivel**.
  Dar de alta un curso pasa de ~24 puntos de edición a **2**.
  ⚠️ Y una que hay que respetar: `kimun_oa_asignatura` **no** puede volverse puramente estructural,
  porque también mapea `VOC-HIST` y `AF-T1`, y **hay filas históricas de 8° con esos códigos** que
  desaparecerían del panel sin ningún error.
- **Inscripción por enlace único** (spec y plan), pedida por Roberto: un enlace al chat, cada uno
  se crea solo en un curso ya abierto, con **todo el contenido salvo los jefes**, y su avance
  registrado. Decisiones suyas: **el nombre lo escribe el alumno** y **el cupo es el único
  límite**. Lo que ya funciona solo es el punto que parecía más grande: **el registro de uso**, que
  arranca en cuanto el dispositivo queda vinculado a un perfil con curso.
  La pieza de motor es partir `MODO_ABIERTO` en **`CAPS_ABIERTOS`** y **`JEFES_ABIERTOS`** — el
  mismo corte que la Sesión 41 le hizo a `QA`.

### Sesión 73 (2026-08-30 y 31) — La inscripción por enlace único, y el primer curso real
Se ejecutó el plan que la Sesión 72 dejó diseñado: **un enlace al chat del curso**, cada
persona se crea sola en un curso que el profesor ya abrió, recibe su código `ALU-` y su
avance se registra como el de cualquier alumno. **No se tocó contenido**: ni un banco, ni
una pregunta, ni un clip de voz.

**El punto que parecía más grande no había que construirlo.** "Que se registren sus
resultados" ya funcionaba solo: en cuanto un dispositivo queda vinculado a un perfil con
curso, el XP, el mapa de dominio, la participación y los refuerzos empiezan a llegar sin
tocar nada. Lo que faltaba era la puerta de entrada.

#### El corte de motor: `MODO_ABIERTO` se partió en dos

Mezclaba **dos preguntas distintas** —¿ignoro los candados entre capítulos? ¿y los de los
jefes?— y el modo experimental las necesita distintas: **capítulos abiertos, jefes
cerrados**. Es el mismo corte que la Sesión 41 le hizo a `QA`, que mezclaba cuatro cosas.

- **`CAPS_ABIERTOS`** = QA, modo prueba y experimental.
- **`JEFES_ABIERTOS`** = solo QA y modo prueba.
- `nuevoProgreso` abre todas las etapas **menos la del jefe** cuando el modo es experimental.

**Antes de tocar nada se sacó una foto** de los tres cursos en los tres modos (normal,
`?qa=1`, `?solo=`) con `scripts/cdp.mjs`, y después se comparó contra ella. `?qa=1` y los
enlaces de muestra ya están repartidos: no pueden cambiar de comportamiento.

> ⚠️ **El Desafío Extra va con los JEFES, no con los capítulos.** `jefeFinalDesbloqueado`
> lo usa como precondición, así que enrutarlo a `CAPS_ABIERTOS` habría **abierto solo** el
> Jefe Final de Ciencias, que es la campaña sin Desafío Extra. Se detectó leyendo la
> cadena de dependencias antes de escribir, no después.

#### Tres cosas que el plan no había visto, y las tres eran del servidor

1. **`EXPERIMENTAL` no podía salir de `cargarCurso`.** El plan decía "que `cargarCurso`
   traiga `experimental`", pero esa función usa `kimun_ranking`, que no lo lleva, y sobre
   todo **corre después**: `CAPS_ABIERTOS` se evalúa al cargar el archivo. Se resolvió con
   **`kimun_mi_curso()`**, el modo **recordado en `localStorage`** y `sincronizarModoCurso()`
   reconciliándolo: si no calzan, escribe y **recarga una sola vez** (guard en
   `sessionStorage`, para que un desacuerdo no deje la página recargándose en bucle). El
   servidor siempre gana. Que el modo viva en el **curso** y no en el aparato es lo que hace
   que sobreviva a borrar los datos del navegador.
2. **Los tres mensajes de error exigían tocar el servidor.** El `update` atómico funde los
   tres casos en `sin_cupo`, y el cliente **no puede** separarlos: `inscripciones` tiene RLS
   sin políticas. El diagnóstico corre **solo en la rama de fallo**, cuando ya se sabe que no
   se tomó ningún cupo, así que la atomicidad queda intacta.
3. **Marcar a los autoinscritos, también.** `perfiles` no registraba cómo se creó un perfil.
   Columna `perfiles.autoinscrito`, que `kimun_inscribirse` pone en `true` y
   `kimun_prof_listar` devuelve. **No es cosmético:** los nombres que escribe el profesor
   vienen verificados y los que escribe un niño en un formulario público, no.

> **Error propio de planificación, y se paga en viajes de Roberto:** el schema se mandó a
> producción **tres veces** en la misma sesión porque estas tres cosas aparecieron al
> implementar y no al diseñar. Lo que había que hacer era medir el camino del dato —de dónde
> sale `experimental`, quién puede leer `inscripciones`— **antes** de escribir el plan.

#### La atomicidad del cupo, que es lo único que no admite un error

```sql
update public.inscripciones set usados = usados + 1
 where token = tok and activo and usados < cupo
 returning curso_id into cid;
```

Una sola sentencia. PostgreSQL vuelve a evaluar ese `where` **después** de tomar el candado
de la fila, así que dos sesiones simultáneas no pueden pasar las dos. Con un `select` y
después un `update` sí podrían — y veinte inscripciones simultáneas es exactamente lo que
pasa cuando el enlace cae en el chat del curso.

**`supabase/probar-inscripcion.sql` (nuevo)** crea un curso de prueba, intenta tomar el cupo
20 veces contra un cupo de 10, comprueba que pasan 10 y **borra lo que creó**. El archivo
dice de frente qué prueba y qué no: una sesión de SQL no simula veinte teléfonos; contra eso
responde la forma de la sentencia, no el test.

#### El panel

Un desplegable por curso con el cupo, la casilla del modo experimental, el enlace listo para
copiar y **"N de M se inscribieron"**. Un solo enlace vivo por curso, garantizado por un
índice único parcial en la base —no por el panel, que se puede tener abierto en dos
pestañas—: crear otro cierra el anterior. El **selector de nivel** sale de `NIVELES_MUESTRA`,
el mismo del armador, así que sumar un curso nuevo sigue siendo una línea.

#### Verificación (con `cdp.mjs`, jugando)

- **Sin `?inscribir=` el juego sale idéntico a la foto**: `prog5:"o...."`, un capítulo
  abierto por campaña, jefes cerrados. Es la comprobación que protege los enlaces repartidos.
- Con `?inscribir=` aparece la pantalla en los tres cursos y un token falso contra el
  servidor **de verdad** devuelve su mensaje (camino de solo lectura, no escribe nada).
- Con el modo experimental: `CAPS_ABIERTOS` sí, `JEFES_ABIERTOS` no, `prog5:"oooo."`, todos
  los capítulos abiertos y Jefe Final y Desafío Extra cerrados. En 3° se comprobó jugando:
  **8 de 9 nodos**. Y no se recarga en bucle.
- El panel a **375 px sin desborde**, que es donde ya falló en la Sesión 26.
- Los tres cursos juegan una etapa real, el guardado de 8° queda intacto, **cero 404 y cero
  errores de consola**.

> **Un tropiezo de método que vale registrar:** en 3° el arranque **ya había corrido** cuando
> `ev.ir()` devolvió —la página carga tarde, con sus manifiestos de voz—, así que el doble de
> Supabase llegaba después del `setTimeout(…,1200)` y parecía que la reconciliación no
> funcionaba en ese curso. No era el producto: era la prueba. **En una página pesada, `load`
> no es el principio de la vida de la página.** Se probó entonces por el otro lado —sembrando
> la bandera en disco— y salió correcto.

#### Qué NO se hizo, a propósito

- **El enlace de muestra (`?solo=`, `?m=`) no cambió.** El opt-in en tiempo de apertura sería
  blando: VULPO es estático. La decisión de qué contenido entra se sigue tomando **al
  construir** el enlace.
- **No hay revocación por persona.** Un enlace repartido vive hasta que se cierra o se llena.
  Revocar de verdad exigiría identidad por invitado, y no es lo que se pidió.

#### Lo que queda de esto para Roberto

Esquema aplicado el mismo día y **aislamiento verificado en sus dos mitades**. Queda opcional
`supabase/probar-inscripcion.sql`, que comprueba el techo del cupo. Los códigos `ALU-` siguen
igual: la inscripción por enlace es una puerta adicional, no un reemplazo.

#### El paso que casi se salta, y por qué se ganó el sueldo

La prueba de aislamiento tiene dos mitades: una cuenta ajena debe recibir `no_autorizado`, y la
**cuenta de admin debe recibir datos**. La primera salió al primer intento. La segunda **también
devolvió `no_autorizado`** — y no era el aislamiento, era que la segunda tanda del esquema aún no
estaba aplicada.

> Sin ese control se habría anotado "aislamiento verificado" sobre una función **rota para
> todos**: un `no_autorizado` universal se ve exactamente igual que el aislamiento funcionando.
> Es hermano de las tres comprobaciones de la Sesión 65 —el código ausente de un arreglo, el
> trabajo de `pg_cron` sin agendar, el esquema sin aplicar—: **ninguna da error cuando falla.**
> Por eso el control positivo quedó escrito en `docs/aplicar-schema.md` como parte de la prueba,
> no como un extra.

De paso salió un dato de operación: **Firefox bloquea pegar en la consola** hasta escribir
`permitir pegar`, y hay que **borrar ese texto** antes de pegar o queda concatenado al comando.

#### Y se cerró la aprobación: 7.745 de 7.745

Roberto firmó los **60** que quedaban —los `HI03 OA 01` ("Vivir en Grecia") y `HI03 OA 08`
("Climas y paisajes"), que se habían saltado con la tecla `S`—. El banco entero queda aprobado.

El diff del banco fueron **61 líneas de 61** y no 5.400: el arreglo de `aplicar-revisadas.py` de
la Sesión 72 —detectar el formato de cada banco con un round-trip antes de escribir— hizo
exactamente lo que se le pidió.

**Se actualizaron las afirmaciones vivas, no la bitácora:** la landing pasa a *"7.745 preguntas
aprobadas · Todo el banco, sin pendientes"*, y `docs/comercial.md` pierde la regla "no decir que
están aprobadas las 7.745", que ya no aplica.

> ⚠️ **La otra regla se queda, y ahora importa más: sigue sin poder decirse "una a una".** El
> 100% es de **cobertura**, no de método: 8° y los módulos de apoyo se revisaron pregunta por
> pregunta, pero 3° y 7° por **muestreo de 8 de cada 30**. Un 100% invita a redondear el discurso
> hacia arriba, y es justo cuando hay que sujetarlo.

#### Y el curso pasó a guardar su nivel

Lo pidió Roberto al ir a dar de alta un 3°: al armar el equipo, las casillas de asignaturas
mostraban **las de todos los niveles**. Con tres cursos son 12; **con seis serán 24**, y nada
impedía marcarle `MA08` a un curso de 3°.

Era una contrapartida asumida a propósito en la Sesión 58 —"sin columna `nivel` ni entidad
Colegio"— que aguantó bien mientras hubo un nivel y medio, y que dejó de aguantar al tercero.
**No fue un error de entonces: fue una decisión con fecha de vencimiento, y venció.**

- `cursos.nivel`, dos dígitos, elegido al crear el curso.
- **El servidor rechaza** una asignatura de otro nivel (`asignatura_de_otro_nivel`). El panel ya
  no las dibuja, pero cualquiera puede llamar la función con la clave pública.
- El enlace de inscripción **se preselecciona con el nivel del curso**: mandarle a un 3° el
  enlace de `/juego/` era el error fácil de esa pantalla.

> **Lo que lo abarató, y vale para M4:** no hizo falta ninguna lista nueva, porque **el nivel ya
> vive dentro del código de asignatura** (`MA03` = `MA` + `03`). Pertenecer al curso es
> *terminar en su nivel*. `NIVELES_MUESTRA` pasó a ser LA lista de niveles del panel —de ahí
> salen el armador, el enlace de inscripción y esto—, así que agregar un curso sigue siendo
> **una línea**. Es un pedazo de M4 adelantado, no deuda nueva.

**`nivel` es NULLABLE a propósito.** Los cursos creados antes se comportan como antes y el panel
les ofrece fijárselo. Inventarles el nivel a partir del nombre habría sido adivinar.

#### El error de secuencia que dejó producción rota unos minutos

`kimun_prof_curso_crear` **cambió de firma**, así que el archivo trae un `drop function` de la
vieja. Roberto aplicó el esquema **antes** de que el cliente estuviera publicado, y en esa
ventana el panel en vivo llamaba a una firma que ya no existía: **crear un curso fallaba en
producción**, con las tres comprobaciones dando `ok`.

> **La regla, que faltaba escrita:** si un cambio de esquema trae un `drop function`, **el
> cliente se publica ANTES o al mismo tiempo, nunca después**. Con un `create or replace` normal
> no pasa —la firma vieja sigue viva y el cliente viejo sigue funcionando—; pasa **solo** cuando
> hay un `drop`. Los dos cambios anteriores del día no mordieron porque sus funciones eran
> nuevas. Queda en `docs/aplicar-schema.md`.

#### Dar de alta el primer curso destapó tres defectos, y uno llevaba meses vivo

Roberto creó el curso de 3° y fue apareciendo todo lo que nadie había recorrido nunca por esa
pantalla. Los tres se encontraron **usándola**, no leyéndola.

**1 · Nombrar Profesor Jefe NUNCA había funcionado.** `kimun_prof_equipo_asignar` declaraba una
variable llamada `rol`, y `curso_profesores` tiene una columna `rol`. En el `update` que baja al
Jefe anterior chocan, y PostgreSQL aborta con *"column reference rol is ambiguous"* (42702).

> Lo que lo mantuvo escondido desde la **Sesión 37** es cómo funciona plpgsql: **prepara cada
> sentencia la primera vez que la ejecuta**, y esa vive dentro de un `if rol='jefe'`. O sea que
> el resto de la función —agregar y editar profes de asignatura— funcionaba perfecto, y solo
> fallaba la rama del Jefe. El Jefe de los cursos existentes había llegado por otro camino (la
> migración de la Sesión 37 y `kimun_prof_curso_asignar`), así que nadie la había pisado.
> La variable pasó a llamarse `v_rol`, con el porqué escrito encima.

Se auditó **la clase entera, no el caso**: un script comparó las variables declaradas de las 50
funciones contra las 42 columnas del esquema. **Un solo choque real.** El otro candidato
(`total` en `kimun_crear_duelo`) es falso positivo: esa columna vive en `desafio_resultados`,
una tabla que la función ni toca, y la variable solo aparece en expresiones sin `FROM`.

> **Error propio en el arreglo:** intenté el renombre con un regex a bulto y me dejó **dos
> líneas mal** —un `where` que debía seguir siendo la columna, y un `excluded.v_rol`—. Lo rehíce
> explícito. Es la misma trampa que el corte por índices de la Sesión 56, con otra herramienta.

**2 · El mensaje de error existía y estaba fuera de pantalla.** `aviso()` escribe en `#panelMsg`,
arriba del panel, y **todas** las acciones que lo disparan —equipo, enlace, alumnos— viven abajo
del todo. Roberto apretaba el botón y "no pasaba nada", cuando el servidor sí estaba respondiendo.
Ahora el aviso hace `scrollIntoView`. Es un defecto viejo que solo se nota cuando algo falla, que
es justo cuando más estorba.

**3 · El nivel se perdía al repintar, y lo cometí DOS VECES.** Los bloques del equipo y del
enlace se vuelven a dibujar tras cada acción, y esas recargas llamaban a su función **sin el
nivel**: las casillas volvían a mostrar las de todos los niveles, y el selector del enlace caía a
la primera opción —8°—, así que **el enlace de un curso de 3° salía apuntando a `/juego/`**. Lo
arreglé en el equipo y no revisé su gemelo del enlace, que hacía exactamente lo mismo. Ahora las
**tres** llamadas de repintado pasan el nivel, y el helper lo busca por `[data-nivel]` en vez de
por un bloque concreto, para que un bloque nuevo lo herede solo.

> **Dato útil para el enlace ya repartido:** el token no sabe de niveles. Lo único que decide a
> qué curso llega el alumno es la **ruta** de la URL, así que un enlace mal apuntado se arregla
> cambiando el selector y copiando de nuevo, sin crear otro ni invalidar el anterior.

#### El Duelo de 3° queda anotado, no descartado

Está apagado con una línea de CSS (`#btnDuelo{display:none}`, Sesión 54). Roberto lo quiere —*"es
el único modo social del juego"*— y quedó como **A19**, con las dos cosas que hay que medir
antes: que el duelo es **contra el reloj** y 3° juega `SIN_RELOJ` a propósito (la salida ya la
conoce el proyecto: al Reto Sin Fin de 3° se le **quitó** el cronómetro, no se le aflojó), y que
`cargarPoolDuelo` no traiga el banco de 8°, que es el defecto del fork que ya mordió tres veces.

#### La puerta se corre a octubre (31/08)

Roberto la movió de **`2026-09-01` a `2026-10-01`** en los tres cursos, el día antes de que
cerrara. La razón la tenía escrita `docs/comercial.md` desde la Sesión 48 y no se había cruzado
con la fecha: **Fiestas Patrias parte septiembre en dos**, así que cerrar el acceso el día 1
dejaba al piloto sin las semanas de uso continuo que lo hacen demostrable. Ahora el argumento y
la constante dicen lo mismo.

Verificado jugando: la banda anuncia sola la fecha nueva —la arma el JavaScript desde la
constante, no hay texto que corregir— y el límite sigue siendo **inclusivo**: `30/09` abierto,
`01/10` cerrado, que es lo que promete el aviso.

> **Lo que hay que decir antes de que lo noten:** el aviso previo solo se muestra **mientras la
> fecha es futura**, así que quien vio la banda la semana pasada leyó "1 de septiembre" y hoy lee
> "1 de octubre". Con gente ya jugando, correr la puerta es barato para el código y no tanto para
> la confianza: conviene avisarlo, no dejar que aparezca.

De paso, el comentario de `3ro/index.html` decía *"app de 3° WIP oculta: sin puerta durante el
desarrollo"* y **mentía desde la Sesión 65**, cuando se le puso fecha.

#### Un pendiente falso, inventado por mí

Tras el commit avisé de que "hay que re-aplicar el esquema", y **ya estaba aplicado**: el arreglo
de `v_rol` lo había pegado Roberto la noche anterior —por eso nombrar Jefe le funcionó— y desde
entonces solo se había tocado el cliente.

Es inofensivo, porque el archivo es idempotente. Pero es el mismo defecto que este archivo
documenta al revés, dado vuelta: **un pendiente que nadie vuelve a medir se arrastra solo**, y
esta vez lo creé yo. Mandar a re-aplicar por reflejo entrena a ignorar el aviso, que es
justamente lo que lo vuelve peligroso el día que sea de verdad. La comprobación quedó escrita en
`docs/aplicar-schema.md`:

    git log -1 --format=%cd -- supabase/schema.sql

contra la fecha de la última fila del registro. Si coinciden, ya está aplicado.

### Sesión 74 (2026-08-31) — El semáforo se adelanta: predecir antes de ver el puntaje
Roberto preguntó para qué servía el semáforo 🟢🟡🔴 y, al explicarlo, apareció que él mismo lo
había saltado varias veces probando. Las dos cosas juntas destaparon el problema real. **No se
tocó contenido**: ni un banco, ni una pregunta, ni un clip de voz.

#### El diagnóstico, que cambió la solución

Lo primero fue medir en vez de suponer: `S.semaforo` tiene **tres apariciones** en cada app —se
escribe, se guarda, se carga— y **cero lecturas**. Pero el problema de fondo no era ese:

> **Se preguntaba después de que la pantalla ya había dado el veredicto.** El niño veía
> "¡Nivel superado!", las estrellas, el XP y las monedas, y recién entonces se le pedía
> autoevaluarse. Aunque contestara con honestidad, en gran parte **repetía lo que ya había
> visto**. Por eso valía poco: no porque nadie leyera el dato, sino porque un juicio emitido
> después del resultado mide poco, así que aunque lo leyéramos valdría poco igual.

Eso descartó la solución obvia. **Obligarlo donde estaba** —apagar los botones hasta marcar—
produce toques reflejos: el niño toca el primero que pilla para seguir, y se pierden las dos
cosas a la vez, el dato *y* el acto pedagógico. Roberto eligió adelantarlo.

#### Lo construido

Una pantalla propia entre la última pregunta y el resultado, de **un solo toque**:

> 🤔 **ANTES DE VER TU PUNTAJE** · ¿Cómo crees que te fue?
> 🟢 Lo entendí · 🟡 Más o menos · 🔴 Me costó

- **Obligatoria sin ser peaje:** es el único control de la pantalla, así que no hay botón que
  apagar ni bloqueo que explicar —el patrón del aviso invisible que ya se pagó en la Sesión 73—.
- **Los emojis llevan etiqueta.** Antes eran 🟢🟡🔴 pelados; en pantalla propia caben las
  palabras, y eso hace el dato más honesto, permite leerlo en voz y deja de exigirle al niño que
  interprete un color.
- **El resultado dejó de preguntar y pasó a responder.** La fila "¿Cómo te fue?" salió de
  `scr-res` y en su lugar va el cruce: *"Te conoces bien 👌"* si acertó, *"Creías que lo tenías y
  te fue 4 de 10. Démosle otra vuelta. 👉 Toca «Repasar»"* si se sobreestimó, y *"¡Te costó menos
  de lo que pensabas! 💪"* si se subestimó. Sin predicción la línea queda vacía y la pantalla se
  ve como antes.
- **En 3° lleva su 🔊**, que lee una frase escrita para el oído —*"Verde: lo entendí. Amarillo:
  más o menos. Rojo: me costó."*—, guardada aparte del DOM de los botones: **sin emojis ni
  números**, así no depende del normalizador ni de que exista su clip. Es **un solo clip** si
  algún día se quiere generar.

**No hizo falta ninguna bandera nueva.** `EFIMERO` (`QA || PRUEBA`) ya existía con ese propósito
y gobierna también la tarjeta de meta; como `REVISION` implica `PRUEBA`, cubre de una `?qa=1`,
`?solo=`, `?m=` y `?rev=1`. Un profesor revisando contenido no queda trancado.

**Se calcó un patrón que ya estaba en el archivo** en vez de inventar otro: `startQuiz` es la
compuerta, `mostrarMetaEtapa` la pantalla y `arrancarQuiz` el trabajo real. Ahora `terminarNivel`
es la compuerta y su cuerpo entero se mudó a `mostrarResultado()`, sin tocar a `avanzar()`, su
único llamador.

#### El defecto que solo apareció mirando

Reusé la tarjeta de la pantalla de meta, pero sus estilos estaban anclados a
`#scr-meta .meta-card`, así que **la pantalla nueva no recibía ninguno**: el contenido salía
pegado al borde izquierdo, sin caja, sin centrar.

> **Y el conteo decía que todo estaba bien:** sin desborde lateral, botones de 109 px, etiquetas
> en una línea, cero errores, cero 404. La pantalla estaba rota igual. Lo delató la captura.
> Es la lección de la Sesión 59 repitiéndose, y ahora con una forma nombrable: **un estilo
> anclado al id de una pantalla no se hereda al reusar su HTML en otra**, y ninguna medición
> del DOM lo dice, porque cada número que se mide está bien.

Los cuatro selectores quedaron sueltos a la clase, que es lo que los vuelve reusables, y se
comprobó que `scr-meta` no se movió (tarjeta de 343 px, radio 18, kicker dorado `#ffc93c`).

#### Alcance y verificación

`montarSemaforo` se llamaba **en un solo lugar**, así que esto no toca el repaso, la mini-clase,
la práctica de lección, el desafío de refuerzo, el Jefe Final ni el Reto de Cálculo.

Verificado con `scripts/cdp.mjs` **jugando una etapa real con clics de verdad** en los tres
cursos: el quiz desemboca en `scr-pred`, el toque lleva a `scr-res`, `S.semaforo` queda escrito y
los tres mensajes del cruce salen correctos; `?qa=1` y `?solo=` van directo al resultado con el
cruce vacío; sin desborde a 375 px; el guardado de 8° (777 XP) sobrevive a jugar 3° con las
claves separadas; y **cero errores de consola y cero 404**. Las cuatro funciones quedan **byte a
byte idénticas en los tres forks**.

**Detalle menor conocido:** *"Más o menos"* cae en dos líneas dentro de su botón. Se ve parejo
porque los tres tienen la misma altura; se arregla acortando la etiqueta si molesta.

- **Dato de método:** los heredocs de Git Bash **sí** preservan tildes y emojis —se comprobó—;
  lo que falla es *imprimirlos* por `stdout`, que en este equipo va en `cp1252`. Lo que sí rompe
  un heredoc es anidar otro adentro.
- Spec y plan: `docs/superpowers/specs/2026-08-31-prediccion-antes-del-resultado-design.md` y
  `docs/superpowers/plans/2026-08-31-prediccion-antes-del-resultado.md`.

#### Segundo tramo — el Duelo llega a 3°, y aparece un bug vivo en 7°

Roberto decidió cuatro pendientes de una vez. El del Duelo cerró la duda de diseño que estaba
abierta desde la Sesión 73: **el duelo SÍ lleva reloj** aunque 3° juegue `SIN_RELOJ` en todo lo
demás —*"en el desafío el tiempo es válido, es una competencia"*—, pero con **30 s** en vez de 15
y el contador **en grande**. A los 8 años leer el enunciado ya se come la mitad del turno.

**El bug que apareció al medir, y que nadie había visto:** `cargarPoolDuelo` descargaba
`contenido/historia-8basico/preguntas.json` **en los tres forks**. Y como en **7° el botón del
Duelo nunca estuvo oculto**, un alumno de 7° que jugaba el duelo local recibía preguntas de 8°
sobre la conquista de América. Estaba en producción. Es el cuarto caso del mismo defecto —el Duelo
que ofrecía el Reto de 8° (Sesión 63), el botón de mini-clase (64), `cargarPoolMate` (65) y el
`LIBROS` de 3° que apuntaba a Ana Frank (72)—: **un fork copiado con su suposición adentro**.

La corrección va como **dato y no como `if` sobre el nivel** (`DUELO_BANCO`, `DUELO_SEG`), y con
eso `cargarPoolDuelo` quedó **byte a byte idéntica en los tres**, que es el objetivo.

#### El reloj estaba tapado, y llevaba así desde siempre

Al mirar la captura —no el conteo— apareció que **los botones fijos de música y sonido
(`.sndbtn`, `position:fixed`) se comían el reloj**: arrancan en x=275 y el reloj iba de 319 a 359.
No era solo el duelo de 3°: **también el quiz normal de 8°**, o sea que el jugador no veía su
cuenta regresiva. Corregido en los tres reservándoles el espacio con una media query.

> **La lección es la de la Sesión 59, otra vez, y ahora con dos formas nombrables.** El conteo
> decía que todo estaba bien —sin desborde, reloj de 30 px, cero errores— y la pantalla estaba
> mal. Los dos defectos de esta sesión que solo se vieron mirando son: **un estilo anclado al id
> de una pantalla no se hereda al reusar su HTML**, y **un elemento `position:fixed` tapa lo que
> haya debajo sin que ninguna medición del elemento tapado lo diga**.

De paso, el nombre del turno dejó de competir con la barra de progreso: en el duelo local dice a
quién le toca el teléfono, así que vale más que la barra.

#### A12 descartada, pero auditando lo que sí importaba

Roberto pidió "solucionar el Reto de Cálculo de 8°". Medido, **la tarea estaba mal dimensionada**:
8° **no carga** `calculo.js` (solo tiene su respaldo vacío) y su Sin Fin inline son **~14 líneas**,
no 171 — las otras ~157 son niveles, etapas y el Jefe El Autómata, que **`calculo.js` no sabe
hacer**, porque ese módulo es *solo* Sin Fin. Migrarlo habría sumado una segunda pantalla, un
segundo reloj y un segundo HUD compitiendo con `scr-calc`, cambiando música y récord en una app
con alumnos jugando.

**Lo que sí valía la pena era otra cosa:** el generador de 8° nunca había pasado el verificador de
aritmética que en 7° y 3° encontró claves equivocadas. Se le corrió: **5.000 operaciones, 100%
verificadas por cálculo independiente → 0 claves malas, 0 opciones repetidas, 0 decimales**. Está
sano.

#### Las otras dos decisiones

- **A4 · El contenido sensible lo elige el colegio al contratar**, no se conversa antes.
  ⚠️ Queda anotado que **eso implica una feature que no existe**: el armador solo *marca* lo
  sensible para enlaces de muestra; apagar un OA de verdad toca la campaña, el Jefe Final —que
  mezcla objetivos de todo el capítulo— y el mapa de dominio del profesor.
- **A14 · Vocabulario en 3° va, con 60 preguntas** (la medición proponía 120). Pendiente: es
  contenido, con su aprobación y ~300 clips de voz.

**Verificado jugando el duelo local en los tres**, con clics reales: cada curso trae su Historia,
3° arranca en 29 con el reloj a 30 px, 8° y 7° en 14 con 18 px, y el reloj ya no queda tapado en
ninguno. Cero 404 y cero errores de consola. La única divergencia que queda en el duelo es
`nuevaRondaDuelo`, que en 3° propaga el campo `visual` — **preexistente y correcta**, y ahora
además útil: las preguntas de Historia de 3° con dibujo lo muestran también en el duelo.

> **Corrección propia del mismo día:** el cambio dejó **cuatro `t:15` por fork** sin migrar,
> en el estado inicial del duelo en línea. No se veían —el reloj se repinta al arrancar— pero eran
> estado inconsistente. Al migrarlos se le puso al script la aserción que evita la trampa que ya
> mordió tres veces: **comprobar que `DUELO_SEG` se declare ANTES de su primer uso**, porque un
> `const` leído en zona muerta temporal mata todo el JavaScript y el síntoma engaña.
>
> **Y quedó zanjada una duda de producto de Roberto:** *"los duelos no pueden ser asincrónicos, los
> niños no pueden llevar celulares al colegio"*. Medido, es al revés — **el asíncrono es el único
> modo que funciona con esa restricción**: cada uno juega en su casa y el rival tiene 24 h, así que
> nunca coinciden ni necesitan el teléfono en la sala. El que exige estar juntos es el **local**.
> Se dejaron **los dos**: el local para jugar con un hermano, el asíncrono para competir con el
> curso. Los **bots** responden al instante, así que el primero en inscribirse ya puede jugar.


#### Tercer tramo — el Vocabulario llega a 3°, y son DOS áreas y no cuatro

Roberto pidió las 60 preguntas de A14 (había decidido bajarlas de 120). **Lo que la medición
cambió fue la forma, no el número:** en 7° y 8° el Vocabulario son 4 y 5 áreas, una por
asignatura, pero en 3° **Lenguaje ya cubre vocabulario en su propio currículum** —`LE03 OA 10`
(deducir el significado por contexto y por las raíces) y `OA 11` (usar el diccionario), con 30
preguntas cada uno—, así que un área `VOC-LENG` mediría dos veces lo mismo. Y Matemática de 3° no
tiene un vocabulario propio que se sostenga a esa edad.

> **El ángulo que no se pisa con nada, y que es lo que justifica el módulo, son las PALABRAS
> NUEVAS que traen Ciencias e Historia** —raíz, germinar, órbita, acueducto, hemisferio—. Eso es
> distinto de *la estrategia* para deducirlas, que es lo que enseña Lenguaje.

Quedaron **30 `VOC-CIEN` + 30 `VOC-HIST`**, elegidas leyendo los OA oficiales de esas dos
asignaturas y no una lista externa. El código ya estaba en el fork (`scr-lenguaje`,
`abrirLenguaje`): el cableado fueron la bandera, la expedición y **reconectar `btnLengVocab`**,
que estaba desactivado desde la Sesión 63 justamente porque apuntaba a una expedición inexistente.

#### El sesgo de largo apareció otra vez, y en la proporción de siempre

**16 de 60 en la primera pasada (27%)**, escribiéndolas ya sabiendo del defecto. Se corrigió como
manda el estándar: **dándole cuerpo a los distractores, nunca acortando la correcta** —acortarla
la vuelve imprecisa, que es peor que el sesgo—. Quedó en **0**.

**Los seis filtros en cero:** `validar-oa-json` ok, `revisar-tanda` sin errores y sin sesgo,
`auditar-banco-nivel` 0/0, `auditar-numerico` sin opciones equivalentes, `auditar-solape-oa` sin
solape, y el crítico de 3° —`auditar-audible-3ro`— **todas se pueden responder escuchando**, cero
homófonas. Los 4 avisos de casi-duplicados se revisaron uno por uno: son la plantilla *"¿Qué es
X?"*, inevitable en un banco de vocabulario, y cada clave y cada tip corresponden a su pregunta.

> **Un error propio que cazó el conteo:** el script escribió **56 y no 60**, porque el arreglo de
> destinos del barajado se calculaba con `len//4` —28 para 30 preguntas— y el `zip` cortaba dos de
> cada área **en silencio**. Se vio solo porque el script imprime el total. Ahora lleva un
> `assert` de 60.

#### Estado del banco, que cambia una afirmación de la landing

El proyecto pasó a 7.745 aprobadas de 7.805 escritas, y la landing perdió por un rato su frase
*"Todo el banco, sin pendientes"*. **Roberto las firmó el mismo día y quedó en 7.805 de 7.805.**

> **Y las revisó una a una, no por muestreo** — porque el modo de muestreo no se las mostraba (ver
> abajo). O sea que el bug del tablero terminó dejando ese banco firmado con el método **más
> fuerte** de los dos. Al aplicarlas, el diff fue de **61 líneas y no del archivo entero**: el
> detector de formato de `aplicar-revisadas.py`, que se arregló en la Sesión 72, hizo su trabajo.

#### El tablero decía "no queda nada por revisar" sobre un banco recién escrito

Roberto abrió el modo de aprobación y **no le aparecía nada**. No era el banco: era el tablero.

`armarCola()` recalcula la cola en cada apertura, y la posición para *reanudar donde te quedaste*
se guardaba como el **índice** de esa cola. Ayer la cola eran 170 objetivos y quedó guardado ~170;
hoy la cola son **2** (las dos áreas del Vocabulario), y el clamp hacía
`MZ.i = Math.min(170, 2) = 2` sobre una cola de 2 — o sea, **te dejaba al final**, y la primera
comprobación anunciaba que estaba todo aprobado.

> **No daba ningún error y se veía exactamente igual que si de verdad no quedara nada.** Es la
> misma familia de defectos que este archivo ya documenta —el código de OA ausente de un arreglo,
> el trabajo de `pg_cron` sin agendar, el esquema sin aplicar—: **fallan en silencio**. Y este
> además crecía con el proyecto: mientras solo se aprobaba, la cola encogía de a poco y el clamp
> disimulaba; el día que se agrega contenido nuevo **después** de haber aprobado todo, deja el
> modo permanentemente mudo.

#### Cierre: la voz, y un número del proyecto que estaba inflado

Aprobadas las 60, se generó su voz: **308 clips, 6,9 MB, US$0,23**, clavado en la estimación.
Cobertura verificada —los 300 textos del banco tienen clip, ninguno de 0 bytes— y comprobado en
el navegador que los cinco de una pregunta real responden 200. `voc3` quedó registrada en
`generar-voz-3ro.py` y en `VOZ_DIRS`.

> **Ojo con las banderas inventadas:** se lanzó con `--simular`, que **no existe**. El generador
> ignora lo que empiece con `-` que no conozca, así que **generó de verdad**. Aquí no importó
> —estaba autorizado— pero con `--rehacer` habría vuelto a pagar todo. El modo que sí existe se
> llama `--recuento`.

**Y al medir el peso apareció que la cifra del proyecto estaba inflada en ~20 MB.** Las anteriores
venían de `du` sin `--apparent-size`, que cuenta **bloques de 4 KB**: con **11.391 archivos** de
voz eso suma ~26 MB que no existen. Medido en bytes reales, `assets/voz` son **244 MB** y no 263,
`assets/` **455** y no 475, y el sitio publicado **324 MB**.

> No es un detalle contable: **ese número gobierna la decisión de poner voz solo hasta 4°**,
> porque es lo que se compara contra el techo de 1 GB de GitHub Pages. Y contra ese techo lo que
> cuenta son los bytes, no los bloques. Queda además anotado que **`du -sm assets` en Git Bash
> devuelve un número menor que el de su propia subcarpeta**, así que en este entorno no sirve: se
> mide recorriendo con `os.path.getsize`.

Ahora se guarda **el código del objetivo**, que sí es estable entre colas distintas: si sigue en
la cola nueva, reanuda ahí; si ya no está, empieza del principio, que es lo único útil. Probados
los cinco casos —índice viejo, reanudar en el primero, en el segundo, un OA ya aprobado y sin nada
guardado—, y **empezar del final es como no tener modo**.

**La voz va después de aprobar, nunca en paralelo** (~300 clips, ~US$0,2): cada texto corregido
obliga a regenerar su clip y a pagarlo de nuevo.

Verificado jugando: Lenguaje de 3° abre el landing "Campaña + Vocabulario", el módulo carga sus
dos etapas de 10, se juega sin reloj y con el botón 🔊, 3° pasa de 26 a **27 expediciones**, y 8°
y 7° quedan en 20 y 23 sin moverse. Cero 404 y cero errores.

- **Pendiente de arrastre (Roberto):** sin cambios — A4 (la conversación con el colegio sobre el
  contenido sensible), A12, A14 y A19; y el camino crítico sigue siendo el **Bloque B** (los
  bancos de 4°, 5° y 6°) con **M4 (`niveles.js`)** delante.

### Sesión 75 (2026-08-31) — El motor deja de estar copiado tres veces
Sesión larga de infraestructura. **No se escribió contenido**: ni un banco, ni una pregunta, ni
una lección. Todo es herramienta, estándar y motor, y cierra los dos bloques que estaban delante
del camino crítico de la v1.

#### Primero, terminar de ordenar las bases (Bloque O)

- **O6 · Lo cableado a 3° dejó de estarlo.** El normalizador de voz decidía si un número era
  **hora** con una lista de códigos de OA escrita a mano (`MA03 OA 18`, `MA03 OA 20`); ahora lo
  decide **por la forma** del texto. Medido en los 16 bancos: la forma acierta en los 4 objetivos
  que traen horas, y los cuatro son horas de verdad. Y sabía contar **solo hasta 1.000**, que era
  "todo lo que necesita 3° básico" — ahora llega al millón, que es lo que pide 4°.
  Los tres scripts de voz pasaron a `-nivel` y su catálogo de asignaturas vive en **uno solo**
  (`scripts/voz_asignaturas.py`), porque estaba copiado en dos y al auditor le faltaba `ada3`.
- **O7 · `.gitattributes`, y la premisa con la que se planificó era falsa.** Se creía que faltaba
  normalizar el repositorio y que sería "un commit gigante". Medido: **el índice ya estaba 100 %
  en LF** —376 archivos de texto, ninguno con CRLF guardado— y lo que GitHub Pages sirve siempre
  fue LF. El desorden estaba **en el disco**: 187 archivos con CRLF contra 188 con LF, casi una
  moneda al aire, y el disco es lo que leen y reescriben los scripts. Detalle en la sección de
  finales de línea, arriba.
- **O8 · El contrato de la capa de contenido.** El estándar **no se inventó**: es el que ya
  producía `consolidar-pool-nivel.py`. La plantilla, en cambio, describía una cabecera de seis
  claves que **la herramienta real no escribía y que ninguno de los 16 bancos cumplía**, durante
  meses y sin que nada avisara. Ahora lo comprueba `auditar-banco-nivel.py`, probado rompiendo un
  banco a propósito.
  > De paso apareció una trampa cara: cinco bancos de 8° traían `meta_preguntas_por_oa: 25`, o sea
  > que el tablero medía 8° contra una vara **tres veces más alta** que 3° y 7°. Hoy no cambiaba
  > ningún número —ningún OA de 8° baja de 25— pero estaba puesta para el primer banco de 4°, 5° o
  > 6° con un OA corto. Al sacarla, las **562 barras de cobertura quedaron idénticas**.

#### Después, desduplicar el motor (Bloque M): los cuatro módulos

La medición del 30/08 decía **1.982 líneas comunes a los tres forks** y **71 funciones byte a byte
idénticas**. Al cierre de esta sesión son **cero**.

| | Qué salió | Líneas |
|---|---|---|
| **M1** `visuales.js` | Los 11 dibujos por código, que vivían **solo en 3°** | 308 |
| **M2** `voz.js` | La lectura en voz alta. **Nace dormida** | 170 |
| **M4** `niveles.js` | El catálogo de niveles del panel | 110 |
| **M3** `motor.js` | **El juego entero**: quiz, campañas, jefes, duelo, tienda, guardado | 1.454 |

Los tres forks pasan de **12.458 a 8.301 líneas**. Lo que importa no es el número sino que **una
corrección de motor se escribe una vez y no tres** — y con 4°, 5° y 6° por delante habrían sido
seis.

**Dos decisiones de forma que valen para lo que venga:**
- **Un módulo se lleva su CSS.** Si sus reglas quedan sueltas en el `<style>` de cada curso, un
  nivel nuevo carga el módulo, funciona y **no se ve**, sin ningún error.
- **Un módulo con datos propios del curso nace dormido** y despierta con `init`. Así `voz.js` lo
  cargan los tres y 8° y 7° quedan mudos **sin una bandera más**.

Y una ganancia que no era el objetivo: los dos scripts que leían `renderVisual` **recortándolo del
`index.html` del fork** ahora leen el módulo. Con eso **5° va a poder aprobar su banco con dibujos
antes de que exista su juego**.

#### M3 se hizo AHORA por una razón con fecha de vencimiento

Roberto avisó que todavía no ha repartido el enlace, o sea que **nadie está usando la plataforma**.
Eso invierte el cálculo: el único argumento en contra de M3 era tocar `guardar()` y el quiz con
alumnos jugando. **Es la única ventana para hacerlo, y se cierra sola cuando parta el piloto.**

Seis rebanadas, de menor a mayor riesgo: jefes → duelo → puerta/armador → campaña/mapa/tienda →
**persistencia** → **quiz**. Las dos últimas al final a propósito, porque un error ahí borra
partidas guardadas.

> **La medición corrigió el plan.** `pendiente.md` estimaba ~830 líneas; eran **1.310 por fork**,
> 58 % más. Y solo **4 funciones** divergían.

#### ⚠️ `motor.js` es el único módulo que NO puede degradar

Los otros cinco llevan respaldo vacío: si no cargan, el juego sigue sin esa funcionalidad. Aquí no
hay respaldo posible —esto **es** el juego— y el síntoma de un 404 es el engañoso de siempre: la
pantalla se ve bien y ningún botón responde. Lo que sí se puede es que el fallo **se diga**:

- **Canaria** al final de cada fork. Si falta `window.__MOTOR_OK`, escribe en pantalla que hay que
  recargar. Seis líneas, probadas con el archivo ausente en los tres cursos.
- **Se publica en un push ANTERIOR** al que lo referencia. Es la lección del `drop function` de la
  Sesión 73 —el cliente nunca antes que su dependencia— agravada porque `revision.js` tardó ~2
  minutos en estar disponible el día que se desplegó.

#### La Preparación: las 4 divergencias pasaron a datos

1. ⚠️ **`renderExpediciones` había vuelto a divergir**, con un `if(asig==='Matemáticas')` para el
   camino de mini-clases. Es el **quinto caso** del patrón que este archivo documenta cuatro veces
   (Sesiones 63, 64, 69 y 72), y **la Sesión 64 la daba por unificada**. La bandera `HAY_MINICLASES`
   ya existía desde entonces: solo faltaba usarla aquí.
2. **`esMaestro` y `revisarDificil` → `MAESTRIA_CALC`.** 8° cuenta 3 asignaturas en Difícil + El
   Autómata; 7° cuenta las 4. Son **el mismo número —cuatro hitos— contado distinto**. La
   equivalencia se comprobó con la **tabla de verdad completa (8 casos)** contra la definición
   vieja, no razonando.
3. **`portadaMapa`**: 8° la armaba por convención **implícita** (`assets/portada-<id>.png`), que es
   justo lo que este archivo documenta como causa de 404 tapados por el `onerror`. Medido: de sus
   20 expediciones, **6 pedían un archivo que no existe** —las cuatro `mate-exp-*` y Ana Frank—,
   salvadas solo por que ninguna pantalla llamaba ahí con ellas.
   > ⚠️ Y unificarla sin más **le habría quitado a 8° el arte propio de sus 14 capítulos**, porque
   > su campo `portada` es la genérica de la asignatura. Por eso se le dio `portadaMapa:` explícito
   > a las 15 que sí tienen arte: quedan **15 idénticas y 5 que pasan de un archivo inexistente a
   > uno que existe**.

#### Mi error de la sesión, y por qué `node --check` no basta

El extractor se llevó **la cola de un bloque `/* */` sin su apertura**, porque este proyecto
escribe los comentarios **sin prefijo en las líneas del medio**. Dejó un `/*` **huérfano** en los
tres forks, comentando lo que viniera detrás.

> **Lo grave es que `node --check` NO lo delató**: el bloque siguiente aportaba el `*/` que
> faltaba, así que el archivo seguía siendo JavaScript válido —solo que con un comentario tragado—.
> Si en vez de un comentario hubiera habido código, se iba en silencio. Es el hermano exacto del
> `*/` de la Sesión 63. El guard que sí lo caza quedó puesto: **una pieza extraída tiene que salir
> con tantos `/*` como `*/`**.

El extractor **aborta además si el comentario difiere entre forks**, y eso destapó tres casos donde
3° conservaba el "por qué" y 8° y 7° arrastraban una versión vieja u obsoleta —`portadaMapa`,
`reconciliarProgreso` y `metaDisponible`—, más dos comentarios huérfanos en 7° que describían el
`ASIG_DESAFIO_NOMBRE` que M4 había eliminado. Los cinco se escribieron **una sola vez**, que es lo
que corresponde cuando la función pasa a ser una sola.

#### Verificación (con `scripts/cdp.mjs`, jugando)

- **El guardado se comporta byte a byte igual** que una foto tomada **antes** de mover la
  persistencia: lo que el juego lee, lo que escribe, las claves del disco y el aislamiento entre
  los tres cursos.
- Etapa completa jugada en los tres; **Jefe Final peleado** en los tres, cada uno con su villano
  propio; duelo con la Matemática correcta por curso (5 niveles del Reto en 8°, 4 capítulos en 7°,
  7 en 3°); armador generando su token; canje.
- **Predicción y resultado sin `?qa=1`** (con QA se salta a propósito): 10 preguntas → pantalla
  propia → el cruce **responde** ("Creías que lo tenías y te fue 0 de 10").
- 8° conserva sus 12 diagramas, los 5 niveles del Reto y las 17 lecciones. El panel del profesor,
  intacto.
- **Cero errores de consola y cero 404.** Los `429` de Supabase son el límite de altas anónimas
  gastado por las corridas headless: comprobado que **ni una línea del diff toca auth**.

#### M4 aplicado en producción y verificado

Roberto pegó el esquema. **La comprobación buena no fue "existe la función"** sino preguntarle por
los 12 códigos uno por uno: los 12 devuelven su asignatura por `kimun_oa_asignatura`, que consulta
justamente esa lista, así que ninguno falta. `kimun_asignaturas_todas()` los entrega en el orden del
panel, y los controles negativos (`XX99 OA 01`, `CA-T1`, el malformado `MA03 OA 1`) dan `null`, o
sea que la respuesta no es un eco. Los transversales siguen mapeando (`VOC-HIST`→`HI08`,
`AF-T3`→`LE08`), que era el ⚠️ del diseño: volver la función puramente estructural habría borrado
del panel el avance histórico de 8° en Vocabulario y Ana Frank.

**Agregar un curso al backend pasa a ser UNA fila.**

#### Cierre (orden 66)

Subido en **dos pushes**, y la regla se justificó sola: tras el primero, `motor.js` dio **404 durante ~60 segundos** antes de quedar servido por GitHub Pages. Con un solo push, ese minuto habría sido el juego muerto en los tres cursos. **Verificado en el sitio en vivo**, no solo en local: se juega una etapa real en `vulpo.cl/juego/`, `/7mo/` y `/3ro/`, con `__MOTOR_OK` en true, cero errores y cero 404.

> **Y un error propio de la orden 66:** el primer commit se llevó 41 archivos y no 4, porque un `git add --renormalize .` anterior había dejado el índice cargado. Lo crítico quedó intacto —ningún `index.html` entró, así que el orden de publicación se respetó— pero el mensaje no describía lo que había dentro. En este proyecto **el log es parte del registro**, así que se corrigió antes de subir. La lección: `git add <rutas>` no alcanza si el índice ya traía cosas; hay que mirar `git status` **staged** antes de commitear.

- **Pendiente inmediato:** el Bloque M está cerrado y el backend al día. El camino crítico es ahora
  **B1, el banco de 5° básico** (93 OA, ~2.790 preguntas), cuyo currículum ya quedó transcrito y
  validado en la Sesión 71: se entra directo al fork y al banco.

### Sesión 76 (2026-08-31) — El duelo cierra su ciclo, y estrena ranking del curso
Roberto reportó: *"Hice un duelo, no salió aviso que me habían desafiado y al terminar
tampoco mandó el resultado."* Al medirlo, lo que faltaba no era un aviso. **No se escribió
contenido**: ni un banco, ni una pregunta, ni un clip de voz.

#### El diagnóstico, que era más grande que el reporte

| Pieza | Estado real |
|---|---|
| `kimun_pendientes` — *¿me desafiaron?* | ✅ Funcionaba, pero **solo se consultaba al entrar a la pantalla del Duelo**. Si no entrabas ahí, no te enterabas |
| `kimun_historial` — *¿cómo terminó?* | ✅ Existe **desde la Sesión 6** · ❌ **ningún cliente la había llamado nunca** |

O sea: **el duelo asíncrono estaba construido a medias**. El retado ve su resultado en
pantalla al terminar de responder —se lo devuelve `kimun_responder`— pero **el retador no se
enteraba jamás**. Desafiabas a alguien, contestaba al otro día, y para ti el duelo quedaba en
silencio para siempre. Es el único modo social del juego y su ciclo no cerraba.

#### Lo construido

Un banner propio en `scr-rol` (`#bannerDuelo`), **copiando el patrón de `revisarDesafio()`**
—el del refuerzo del profe—: `hidden` por defecto, best-effort y falla en silencio. Va en
**elemento aparte** porque si el profe lanzó un refuerzo y además te desafiaron, uno pisaría
al otro; reusa su misma clase CSS, así que no agrega ni una regla.

- ⚔️ **Te desafiaron** → toca y entra al duelo. **Cero backend nuevo**: `kimun_pendientes` ya
  devuelve solo los vivos y el aviso se apaga solo al jugarlo o a las 24 h.
- 🏆 / 💪 / 🤝 **el resultado del que iniciaste** · ⌛ **el que venció** sin respuesta.

**Los resultados van primero y de a uno**, cerrables; el desafío después, porque queda vivo
hasta jugarlo y no se pierde si hoy queda tapado. Dos guardas: **no aparece con la puerta
cerrada** —ahí `btnDuelo` cae al duelo local, o sea que el en línea es inalcanzable y
anunciarlo sería ofrecer algo que no se puede tocar— ni sin perfil.

`revisarDuelos()` y `pintarAvisoDuelo()` viven en **`assets/js/motor.js`**: no tienen ni un
dato propio del curso, así que se escriben una vez y los tres cursos las heredan. Es para
esto que sirvió la Sesión 75.

#### La única decisión que no era obvia

El aviso de *"te desafiaron"* es gratis. El del **resultado** no, porque la base **no tenía
noción de "esto ya lo vi"** y el aviso se quedaría pegado para siempre. Roberto eligió
guardarlo **en el servidor** (`duelos.visto_retador`) y no en `localStorage`: así sobrevive a
borrar los datos del navegador y no se repite en el tablet. Misma decisión, y por el mismo
motivo, que el modo experimental de la Sesión 73.

> **La columna se siembra con un truco que hay que conservar:** el `if not exists` va sobre la
> **columna**, así que corre **una sola vez por construcción** — los duelos que ya existían
> nacen `true` (nadie abre el juego y se encuentra el resultado de hace tres semanas) y el
> default queda en `false`. Un `add column if not exists … default false` más un
> `update set visto=true` **no sirve**: ese update no es idempotente y al re-aplicar el
> esquema —que aquí es rutina— borraría avisos legítimos.

#### ⚠️ El defecto que solo apareció al PROBAR: el duelo contra bot se duplicaba

El duelo contra un bot **se resuelve dentro del propio `kimun_crear_duelo`** (queda
`completado` al instante) y `odFin` le pinta el marcador al jugador ahí mismo. Pero nacía sin
ver, así que el banner del inicio **se lo repetía como si fuera noticia nueva**. Comprobado
contra el esquema en vivo antes de arreglarlo:

    duelo contra Diego  -> {"tipo":"bot","ganador":"yo"}   (el jugador YA lo vio en pantalla)
    banner al volver    -> 🏆 ¡Ganaste tu duelo! · Contra Diego · 6 a 0    ← repetido

Corregido: la rama del bot escribe `visto_retador=true` en su propio `update`. Los duelos
contra una **persona** siguen naciendo sin ver, que es justo para lo que existe la columna.

> **No se habría encontrado leyendo:** el `estado='completado'` del bot y el banner del inicio
> están a 2.500 líneas de distancia y en archivos distintos. Salió de **jugar el caso**.

#### El ranking de duelos del curso (segundo pedido del mismo día)

*"¿Se puede crear un ranking dentro del curso con los alumnos que más duelos han ganado?"*
Sí, y **no hubo que guardar nada nuevo**: `duelos` ya tiene los dos jugadores, sus aciertos y
sus tiempos. Es una función de lectura y una tarjeta en la misma pantalla del duelo.

| | |
|---|---|
| **Orden** | Por **duelos ganados** (elegido sobre porcentaje y sobre puntos tipo fútbol). Lo más legible en 3°, y premia jugar |
| **Bots** | **NO cuentan.** A Diego se le gana cincuenta veces en una tarde: contarlos convertiría el ranking en un contador de paciencia |
| **Alcance** | **El curso**, como `kimun_jugadores` desde la Sesión 39 y como el ranking por XP |

Solo aparece quien haya jugado al menos un duelo terminado: **un cero y un "todavía no juega"
son dos cosas distintas**, y mezclarlas haría ver a medio curso como si perdiera siempre. Y
un jugador **sin curso** recibe *"pide tu código"*, no *"todavía nadie ha jugado"*, que sería
falso. Reusa las clases `.rk`, `.rk.top` y `.rk.me` del ranking por XP: **cero CSS nuevo**.

#### La regla de desempate dejó de estar escrita cuatro veces

*Más aciertos; si empatan, menos tiempo; si todo empata, empate.* Estaba **copiada a mano en
tres lugares** —la rama del bot, `kimun_responder` y los avisos nuevos— y el ranking habría
sido la cuarta. Es el patrón de lista paralela que ya causó un bug real (Sesión 37).

Ahora vive una sola vez en **`kimun_duelo_ganador(ac_a,t_a,ac_b,t_b)`** y las cuatro la
llaman. Va declarada **antes** de sus usos: una función `language sql` se valida al crearse,
así que `kimun_duelos_avisos` no podría nombrarla si todavía no existiera.

#### Otro defecto vivo, encontrado de paso

`odResponder` acumulaba el tiempo con **`OD.tiempo += (15 - OD.t)`**, con el 15 escrito a
mano — y el reloj arranca en `DUELO_SEG`, que en **3° vale 30**. Cada respuesta sumaba
**tiempo negativo**: contestar al toque daba −15. Es hermano de los `t:15` que la Sesión 74
migró; este se salvó porque no está en la declaración del estado sino en la aritmética. **No
cambiaba quién ganaba** —los dos jugadores del mismo curso llevan el mismo desfase— pero
dejaba sin sentido justo el número que desempata. Corregido a `DUELO_SEG - OD.t`.

#### Verificación

**El ciclo completo contra el Supabase de PRODUCCIÓN**, con dos identidades anónimas reales:

    A = KIM-4AAC · B = KIM-277E
    B desafía a A          -> {"tipo":"async"}
    -- vuelve A · banner   -> ⚔️ Te desafiaron · Jugador te está esperando
       A responde y gana   -> ganador: "yo"  (7 a 5)
    -- vuelve B · banner   -> 💪 Te ganaron esta vez · Contra Jugador · 5 a 7
       B cierra            -> tras recargar, oculto

**La línea de B es la que importa:** ese aviso es exactamente el que antes no llegaba nunca.
Además, contra producción: la **tabla de verdad completa** de `kimun_duelo_ganador` (6 de 6),
el arreglo del bot (banner **oculto** donde antes repetía) y `kimun_ranking_duelos`
respondiendo sin error.

Con `cdp.mjs` en los tres cursos: sin el esquema aplicado el banner queda oculto **y el inicio
intacto**; un nombre con `<img src=x onerror=…>` sale como texto —este proyecto ya tuvo un XSS
almacenado por esa vía exacta (Sesión 51)—; "¡Entendido!" marca vistos **solo los resultados**;
el ranking muestra 4 filas con podio y fila propia; etapa real jugada en los tres, guardado de
8° intacto, **cero errores de consola y cero 404**.

> **Lo único que NO se verificó contra producción es el ranking con datos reales de un curso**,
> porque haría falta meter dos alumnos de prueba en el 3° real de Roberto. Queda con datos
> simulados; el camino hasta el servidor sí está probado en vivo.

#### Dos trampas del método, las dos nuevas

1. **Los Chrome headless colgados se bloquean en cascada.** `cdp.mjs` usa el puerto 9333 fijo;
   una corrida que expira deja Chrome reteniéndolo y **la siguiente se cuelga sin decir nada**,
   así que el síntoma parece del código bajo prueba. Se limpia filtrando por
   `remote-debugging-port=9333` **y sus procesos hijos** — nunca por `Name='chrome.exe'` a
   secas, que cerraría el navegador de Roberto.
2. **`| tail -N` esconde la salida parcial de una corrida colgada**, porque `tail` no emite
   nada hasta que se cierra la entrada. Durante tres intentos pareció que el script moría en
   la primera línea, y en realidad llegaba hasta el final: el cuelgue estaba **después** de
   todo lo que interesaba. Al depurar algo que se cuelga, **sin `tail`**.

#### Orden de despliegue

Dos pushes, como en la Sesión 75: **`motor.js` primero**. Los forks llaman a `revisarDuelos()`
y a `cargarRankingDuelos()` en su arranque; con el `motor.js` viejo todavía en caché eso sería
un `ReferenceError` que **mata el resto del script de arranque**. El esquema, en cambio, ya
estaba aplicado y verificado por Roberto antes de subir.

### Sesión 77 (2026-08-31) — VULPO se instala en el teléfono
Roberto preguntó por el camino técnico a la v1 y si esa v1 era "la versión PWA". **La premisa
estaba invertida y conviene dejarlo escrito**, porque el roadmap técnico es prominente y se lee
como si fuera la meta: **la v1 es de contenido —3° a 8°— y la PWA va después**. Lo que falta para
la v1 son los bancos de 4°, 5° y 6°; el Bloque C empieza cuando eso esté.

De ahí salió el pedido real: *"¿hay alguna forma de que los que vean el enlace de 3° accedan
desde un ícono en el escritorio o en la pantalla del celular?"*, pensando en que **muchos papás
lo instalarán en su propio teléfono y se lo pasarán al niño**.

#### Estaba a mitad de camino sin que nadie lo supiera

Los tres juegos ya declaraban `apple-touch-icon` y un ícono de 512, y los archivos existían y
respondían 200 en `vulpo.cl`. O sea que "Agregar a pantalla de inicio" **ya dejaba el ícono
correcto**. Lo que faltaba era que **abriera como aplicación y no como página web**: sin
manifiesto, al tocarlo aparece la barra de direcciones y se nota que es un sitio.

#### La decisión que lo abarató: sin service worker

> **En iPhone no existe la instalación automática, ni con service worker.** Safari nunca la
> ofrece; la única vía es *Compartir → Agregar a pantalla de inicio*. O sea que **hay que
> explicar el paso a paso de todos modos** para el 20-25% de familias con iPhone, y si la
> explicación va igual, el service worker solo agrega comodidad en Android.

Por eso este trabajo **no es el Bloque C**: es un subconjunto que da el 80% del resultado en una
sesión en vez de dos, y deja la decisión del service worker para cuando haya el dato de un
teléfono real. Lo que el Bloque C sigue debiendo es el prompt automático de Android y el
**offline parcial** — que es lo único que de verdad falta, porque **instalarlo NO hace que
funcione sin conexión**.

#### Lo construido

**Un `manifest.webmanifest` por curso.** No es un tecnicismo: un papá con un hijo en 3° y otro en
7° tiene **dos íconos con dos nombres**, y cada uno abre el suyo. Con uno solo en la raíz, el
ícono abriría siempre el mismo nivel — es el defecto que `docs/roadmap-tecnico.md` §2.1 ya había
anticipado, y este escenario lo volvió concreto.

⚠️ **El `<link rel="manifest">` va con ruta absoluta**: el `<base href="/">` de los tres juegos
resolvería `manifest.webmanifest` a `/manifest.webmanifest`, que no existe.

**`assets/js/instalar.js`** (octavo módulo compartido) muestra un banner en el inicio y una
pantalla con el paso a paso del sistema que detecte. Nace dormido, se lleva su CSS y tiene
respaldo vacío, como los otros. No aparece si ya está instalado, si el papá lo cerró, o con
`SIN_DISCO` — nunca en `?solo=`, `?m=`, `?rev=1` ni `?armar=1`.

**El ícono es propio** (`scripts/generar-icono-app.py`): la cara de Vulpi al 80% sobre su fondo
durazno. El original llena el cuadro y Android recorta a círculo, así que perdía las puntas de
las orejas.

> **Y ahí corregí algo que había dicho de más.** Afirmé que el ícono actual "quedaría sin orejas
> y sin barbilla". Generando la comparativa con el recorte circular real, se ve que pierde las
> **puntas** y algo de barbilla, pero sigue siendo reconocible. La versión reducida es mejor, no
> imprescindible.

#### ⚠️ El hallazgo de la sesión: el banner dejaba el botón de jugar cortado

El diseño aprobado tenía título, párrafo y dos botones, como los otros banners del inicio.
Medido en **375×667** —la pantalla más chica real, un iPhone SE o un Android económico— con el
aviso de la puerta encima, que está activo en los tres cursos hasta octubre:

| | Botón JUGADOR |
|---|---|
| Antes de este trabajo | 522 px de 667 · se ve entero |
| Banner de dos líneas | **658 px** · se asoma 9 px |
| Banner de una línea | **581 px** · se ve entero |

O sea que un niño de 8 años habría abierto el juego y **no habría visto el botón de jugar**,
desde el primer día del piloto.

> **Lo grave es que ningún conteo lo delataba:** sin desborde lateral, cero errores de consola,
> cero 404, los once elementos presentes y cada uno una sola vez. **Se vio mirando la captura.**
> Es la tercera vez que este proyecto tropieza con lo mismo —la Sesión 59 con las franjas
> climáticas, la 74 con el estilo anclado al id y el reloj tapado por los botones de audio— y por
> eso el porqué quedó escrito **dentro de `instalar.js`**, no en la bitácora: para que nadie lo
> "mejore" de vuelta a dos líneas sin saber lo que cuesta.

#### Y un error que casi reporto como defecto del código

La comprobación de sintaxis marcó fallo en los tres forks. No era el código: el **comentario HTML
de `motor.js` contiene literalmente la cadena `<script>`** en su texto («Va ANTES del `<script>`
inline»), así que mi regex lo capturaba como si fuera JavaScript. Se corrige quitando los
comentarios HTML antes de extraer.

> Es hermano del `*/` de la Sesión 63 y del `/*` huérfano de la 75, pero **al revés**: ahí un
> comentario se comía código; acá un comentario se hacía pasar por código. La lección es la misma
> —el HTML de este proyecto habla de sí mismo en sus comentarios— y la regla que queda es
> **verificar la herramienta antes de creerle al informe**.

#### Otra afirmación falsa que este trabajo destapó

`CLAUDE.md` decía *"no hay service worker **ni manifiesto**"*, y la segunda mitad quedó falsa.
Corregida, con una advertencia nueva y deliberada: **instalarlo no lo hace funcionar sin
conexión**. Es la confusión más fácil de cometer al vender esto, y la más cara.

#### Verificación

Con `scripts/cdp.mjs`, en los tres cursos: manifiesto 200 con su `short_name` y `scope` propios,
el `<link>` resolviendo a una URL que existe, banner y enlace permanente visibles, el cierre que
persiste al recargar, ausencia en `?solo=` y `?armar=1`, y la detección de sistema acertando los
cuatro casos —incluido el **iPadOS 13+, que se declara como Macintosh** y se delata por el touch—.
**Con `instalar.js` ausente**, los tres siguen jugándose: cero excepciones y el único fallo de red
es su propio 404. Regresión: 20/23/27 expediciones, motor vivo, y el guardado de 8° (777 XP)
intacto con las tres claves conviviendo. **Cero errores de consola y cero 404.**

Las **18 ediciones** (6 × 3 forks) quedaron **byte a byte idénticas** salvo la ruta del manifiesto
y el nombre — comprobado por hash del diff normalizado, no por lectura.

#### Lo que falta, y no lo puede hacer el asistente

**Probarlo en un teléfono real**, un Android y un iPhone: que el ícono se vea completo, que diga
*VULPO 3°* y que abra sin la barra del navegador. **Chrome headless no instala PWAs**, así que
esto no se puede verificar acá. **Ese resultado decide si algún día hace falta el service
worker**: si Android ya lo ofrece solo, el Bloque C se achica bastante.

Spec y plan: `docs/superpowers/specs/2026-08-31-instalacion-pantalla-inicio-design.md` y
`docs/superpowers/plans/2026-08-31-instalacion-pantalla-inicio.md`.

#### Orden de despliegue

Dos pushes, y **por una razón distinta a la de las Sesiones 75 y 76**: `instalar.js` **sí tiene
respaldo vacío** y su 404 no mata nada —está probado—, así que un solo push no rompería el juego.
Se hacen dos igual para que ningún visitante encuentre, ni por los ~90 segundos que tarda GitHub
Pages, un manifiesto o un módulo que todavía no está. **El primero lleva lo nuevo** (módulo,
manifiestos, íconos, script), **el segundo los forks que lo referencian.**

**Post scriptum de la Sesión 77 — probado en Android, y el resultado achica el Bloque C.**
Roberto lo instaló en su teléfono el mismo día: *"en android quedó perfecto"* — ícono, nombre y
sin barra del navegador. Pero el dato que importaba era **cómo llegó a la opción**, y fue **por el
menú ⋮**: **Chrome no se la ofreció solo**.

- **Confirma lo que se había dicho con incertidumbre:** el prompt automático de instalación en
  Android **sí depende del service worker**. Ahora está medido en un teléfono real, no supuesto.
- **Valida la decisión de diseño.** Sin el paso a paso dentro del juego, un apoderado no habría
  encontrado la opción — que es exactamente el problema que este trabajo venía a resolver. El
  módulo no era un extra.
- ⚠️ **Y hay un matiz que cambia la prioridad del Bloque C:** el service worker sería **necesario
  pero NO suficiente** para ese prompt, porque Chrome además exige que la persona haya
  interactuado con el sitio — así que aun teniéndolo no aparece siempre ni en la primera visita.
  **El paso a paso del juego se queda igual pase lo que pase.**

> **Conclusión para la planificación:** lo único que el Bloque C agregaría de verdad es el
> **offline parcial**, no la instalación. Deja de justificarse como *"para que se pueda instalar"*
> —eso ya está resuelto— y pasa a ser *"para que funcione sin señal"*, que es un caso de uso mucho
> más chico. Baja de prioridad frente al Bloque B (los bancos de 4°, 5° y 6°) y al **Bloque D**
> (el progreso en el servidor), que es el que de verdad bloquea el modelo de suscripción.

**Falta el iPhone, y el riesgo ahí es distinto:** iOS **ignora el `display:standalone` del
manifiesto** y depende de la meta `apple-mobile-web-app-capable`, que Safari ha tratado de forma
irregular entre versiones. El síntoma a mirar es simple: si al abrirlo desde el ícono **aparece la
barra de Safari arriba**, eso es lo que quedaría por afinar.

### Sesión 78 (2026-09-01) — Cada capítulo con su portada: se fija el estándar de arte
Roberto notó jugando que *"las expediciones todas tienen una foto distinta, pero dentro de cada
asignatura también son distintas… ¿es así en todas?"*. **No lo era**, y medirlo dio un número que
no estaba en ningún documento.

| | Capítulos | Imágenes distintas |
|---|---|---|
| **8°** | 20 | **20** — cada capítulo la suya |
| **7°** | 23 | **5** — una por asignatura |
| **3°** | 27 | **6** — una por asignatura |

O sea que en 7° y 3° **los capítulos de una misma asignatura se ven todos idénticos**: los 6 de
Historia de 7° son la misma imagen, y los 9 de Lenguaje de 3° también.

#### La nota que lo justificaba era falsa, y se vio mirando la pantalla

`pendiente.md` decía desde hace sesiones: *"Las portadas de capítulo siguen prestadas a propósito.
Son ~46 imágenes más para una diferencia que **casi nadie mira**"*. Esa frase daba el asunto por
cerrado.

> **Y el argumento estaba mal planteado, no solo desactualizado.** No es que nadie mire la
> diferencia: es que **sin ella el niño no sabe en qué capítulo va**. Un alumno de 3° abre
> Lenguaje y ve **nueve tarjetas idénticas**, distinguibles solo por el número y el nombre en
> letra chica. Es un problema de **orientación**, no de decoración — y pesa justo donde hay más
> capítulos por asignatura.

Es el mismo patrón de la sesión anterior, cuando el banner de instalación dejaba el botón JUGADOR
cortado: **una afirmación sobre lo que el usuario ve, escrita sin mirar la pantalla.**

#### Un solo estilo para los seis cursos (decisión de Roberto)

Roberto propuso dos bandas etarias —3-4-5 infantil, 6-7-8 adolescente— y preguntó si convenía otra
diferenciación. Se evaluaron tres opciones y **se eligió no separar por banda**:

1. **Una sola identidad de marca es más fuerte**, y lo que se ve "de grandes" en el arte actual no
   son las viñetas de capítulo —`mate-numeros`, con Vulpi saltando entre números, funciona igual a
   los 8 que a los 14— sino los **retratos realistas** de las genéricas de asignatura.
2. **Permite reutilizar entre cursos:** con dos estilos, 20 de las 47 portadas pendientes dejaban
   de servir.
3. **El riesgo es asimétrico:** a los 10-11 años los niños rechazan activamente lo que les parece
   "de guagua", mientras que un niño de 4° con arte algo más grande no se ofende. **Infantilizar
   cuesta más caro que lo contrario.**

Lo que sí cambia con la edad es la **densidad de la escena** —menos objetos y colores más cálidos
en los cursos chicos—, no el estilo.

> Se había considerado además mover el corte a 4°/5°, que es donde el proyecto ya tiene su línea
> (la voz pregrabada va de 1° a 4°) y donde corta el ciclo oficial del MINEDUC. Queda anotado por
> si algún día se reabre.

#### 20 se reutilizan, 30 hay que generar

**Matemática y Lenguaje rinden mucho, porque sus ejes se repiten en todos los cursos**; Historia
no rinde **nada**, y era previsible: 8° es modernidad, colonia e independencia; 7° es prehistoria,
Grecia-Roma y Edad Media; 3° es el planeta, Grecia, Roma y los derechos. Ni un tema compartido.

- **27 nuevas** (11 en 7°, 16 en 3°).
- **3 rehechas**: `leng-literarios`, `leng-textos` y `mate-algebra` **están fuera del estándar**
  —son retratos de busto sobre fondo claro, no viñetas circulares sobre violeta—. Importa porque
  son de las que se reutilizan: dejarlas propaga el estilo ajeno a **8 ubicaciones**. Rehacer 3
  arregla las 8, y de paso deja 8° uniforme.

#### El estándar quedó escrito

[`docs/estandar-arte-portadas.md`](docs/estandar-arte-portadas.md): la composición (viñeta
circular, fondo violeta, Vulpi de cuerpo entero **haciendo** la actividad, objetos temáticos
flotando, sin texto dentro de la imagen), el formato (PNG 512×512, ~400 KB), la convención de
nombres con su ⚠️ de portada **explícita** y no por convención implícita, la tabla de las 20
reutilizaciones y el reparto de quién hace qué.

> **Y ese reparto conviene tenerlo claro: el asistente NO genera ilustraciones**, no tiene
> herramienta de imagen. Escribe los prompts calibrados al estándar y **procesa** el resultado con
> `scripts/procesar-arte.py`. Lo que sí dibuja por código son los apoyos visuales SVG de las
> preguntas, que son otra cosa.

#### Dos errores propios de medición, los dos corregidos antes de dar el número

1. **Conté 53 faltantes cuando eran 47.** Las 5 de 8° que marqué como pendientes **sí tienen arte
   propio**, solo que con un nombre que no sigue la convención (`portada-lectura-anafrank.png`,
   `portada-mate-numeros.png`). Se detectó midiendo la **imagen real** que usa cada capítulo en vez
   del nombre esperado.
2. **Mi primer intento de extraer los capítulos leyó el HTML con expresiones regulares y devolvió
   cero en los tres cursos.** Se resolvió preguntándole al juego en el navegador con sus propias
   funciones (`nombreMapa`, `portadaMapa`) — que además reveló que el campo del nombre se llama
   `nivel`, no `nombre`.

#### Lo que costará terminar la v1

Con 4°, 5° y 6° por venir, y contando la reutilización que este estándar habilita, quedan del
orden de **60 a 70 imágenes más** para los seis cursos completos. Conviene saberlo antes del
cuarto curso, no después.

**Siguiente paso acordado:** escribir los 30 prompts, por asignatura, para generar por tandas y
calibrar con la primera. Se empieza por **Historia de 3°** (5 imágenes): la que no tiene ninguna
reutilización posible y la de menor riesgo editorial.

### Sesión 79 (2026-09-01) — Las 30 portadas de capítulo: generadas, procesadas y cableadas
Se ejecutó el estándar de la Sesión 78. Roberto generó las 30 imágenes con IA; el asistente escribió
los prompts, las procesó y cableó cada capítulo. **3° y 7° pasan de portada genérica por asignatura a
portada propia por capítulo**, igual que 8°.
- **Prompts (`docs/prompts-arte-portadas.md`, nuevo):** las 30 en 8 tandas, con un **bloque de estilo
  compartido** (para calibrar el look en un solo lugar) + la escena de cada capítulo. Cuidados del
  estándar: **sin letras legibles** (Lenguaje va con gemas/piezas, no abecedario; solo se permiten
  símbolos matemáticos y de puntuación) y **densidad por edad** (3° más simple y cálido; 7°/8° más
  contraste).
- **Mapeo por orden de descarga = orden del MD.** Las 30 vienen con nombre UUID; se ordenaron por
  hora de modificación (30 PNGs del 01/09) y se asignaron a los 30 ids en orden. **Verificado
  MIRANDO** el primer archivo de cada tanda + las 3 de 8° antes de procesar: una mala asignación
  pone el arte equivocado en cada capítulo y no se nota sola.
- **`scripts/procesar-arte.py` ganó `--fondo=negro` y `--negromax=N`.** El arte de las portadas viene
  sobre **fondo negro** (una viñeta circular dorada), no blanco como los villanos y skins; el modo
  negro inunda desde las esquinas buscando oscuro. Una imagen (`len3-cap7`) vino sobre **violeta**
  (gris ~85), y se procesó con `--negromax=120`. Resultado: 30 PNG 512×512 RGBA, ~310–415 KB,
  círculo sobre transparente (la convención de las buenas de 8°).
- **Cableado de 47 capítulos** (`portadaMapa` en `3ro` y `7mo`), con un script **acotado al bloque de
  cada capítulo** (entre su `id` y el siguiente) para no editar el capítulo equivocado — el riesgo
  real, porque en 3° ningún capítulo tenía `portadaMapa` y un regex sin acotar habría saltado al
  `portadaMapa` de `lect-cuentos-ada` 20 capítulos más abajo. En **7°** se reemplazó el valor (ya
  apuntaban a la genérica); en **3°** se agregó el campo. **27 nuevas → su `portada-<id>.png`; 20
  reutilizan** una portada de 8° según la tabla del estándar; las **3 rehechas de 8°** conservan su
  nombre de archivo (solo se reemplazó la imagen), así 8° ya las usa sin cablear.
- **Nota de fin de línea:** la línea base del proyecto **ya es LF** en los tres forks (incluido
  `juego/`, que no se tocó), no CRLF. El script preservó LF y el diff es 47/47 (una línea por
  capítulo, sin churn). Esto ya está bien contado en las reglas: tanto la regla 4 de `pendiente.md`
  como la guía activa de `CLAUDE.md` se corrigieron el 31/08 (`.gitattributes`) y dicen "escribir
  con `newline=""`… LF en todo el proyecto". No queda nada que corregir ahí.
- **Verificado en el navegador** (`scripts/cdp.mjs`, las tres apps): las 4 campañas de cada curso
  cargan **todas** sus portadas (`fallan:[]`), **cero 404 de portada y cero errores de consola**. La
  captura de la campaña de Lenguaje de 3° muestra las tarjetas con arte **distinto** por capítulo
  (antes eran 9 idénticas) — el problema de orientación que motivó el estándar quedó resuelto.
- **Los originales NO se copiaron a `assets/originales/`** (ya pesa 175 MB y el sitio es sensible al
  tamaño); quedan en Descargas de Roberto.
- **Pendiente de arrastre:** la instalación en iPhone (Android quedó bien); y las portadas de 4°, 5°
  y 6° para cuando existan esos cursos (el estándar ya habilita ~20 reutilizaciones más).

### Sesión 80 (2026-09-01) — El avance deja de vivir solo en el teléfono (Bloque D)
Dos trabajos: se cerró el defecto que dejó la prueba en iPhone, y se implementó el **Bloque D**, que
es el requisito real del modelo de suscripción. **No se tocó contenido**: ni un banco, ni una
pregunta, ni un clip de voz.

#### ⚠️ En iPhone la instalación solo sirve desde Safari

Roberto probó la instalación y reportó dos cosas: *"pasó desde Chrome, y quedó el logo en pantalla"*
y, al preguntarle, *"se ve arriba la barra de dirección web"*. Eso lo cierra: **desde Chrome no se
instala de verdad**. Crea un acceso directo que abre el navegador encima, porque **solo el "Agregar
a pantalla de inicio" de Safari** produce una app que respeta el `apple-mobile-web-app-capable` que
el proyecto declara desde la Sesión 77.

> **El ícono se ve igual en los dos casos, así que el fallo engaña.** Y no lo delata ningún conteo:
> se supo preguntando qué se veía al abrirlo.

**Y al mirar el código apareció algo más grande que Chrome.** `plataforma()` devolvía `'ios'`
mirando solo si era iPhone, **sin mirar qué navegador era**, así que el paso a paso de Safari
—*"Toca Compartir ⬆️ en la barra de abajo"*, que es la barra de Safari— se le mostraba a cualquiera.
Y el camino más común del piloto **no es Chrome**: el enlace llega al chat del curso y el papá lo
abre **dentro de WhatsApp**, cuyo navegador incrustado tampoco puede instalar.

**El arreglo: un cuarto caso `ios-otro`, detectado por lista blanca de Safari** y no enumerando
rivales. Son dos mitades y cada una ataja un grupo: Chrome, Firefox y Edge de iPhone **sí** traen el
token `Safari/` y se descartan por su marca propia (`CriOS`/`FxiOS`/`EdgiOS`/`OPiOS`); los
navegadores incrustados **no** traen ese token y caen solos. Sus pasos mandan primero a *Abrir en
Safari*.

**Verificado con 8 user agents reales** —Safari, Chrome, Firefox y Edge de iPhone, los navegadores
de WhatsApp e Instagram, Android y escritorio—: **8 de 8**. Falta que Roberto lo pruebe en su
teléfono.

#### Bloque D · El progreso en el servidor

Hasta hoy el XP y el mapa de dominio vivían en Supabase, pero **las monedas, las skins y el avance
de campaña vivían solo en `localStorage`**. Mientras siguiera así, prometerle a un apoderado que su
hijo cambia de teléfono y recupera todo **era falso**.

**El diseño se decidió con una medición, no con una intuición.** Un save **completo** —todas las
rutas al máximo, todas las skins compradas— mide **9,4 KB en 3° y 7,7 KB en 8°**. Eso descarta media
discusión: cabe entero en una llamada y no hay que sincronizar campo por campo.

**Dos decisiones de Roberto fijaron el alcance:**

1. **Restaurar, no sincronizar.** Un aparato a la vez. Que el mismo niño juegue en el teléfono y el
   tablet el mismo día obliga a fundir estados divergentes, cubre bastante menos del caso real y
   cuesta bastante más.
2. **Cuando los dos lados tienen avance, se pregunta una vez** —pantalla propia, los dos botones
   pesando igual— en vez de que gane el mayor en silencio. **El lado que pierde se guarda** en
   `<SAVE_KEY>_previo`: 10 KB de seguro, sin interfaz.

**La forma: una foto completa en `jsonb`**, no columnas normalizadas. La ventaja de normalizar
—resolver conflictos campo por campo— **no se necesita** con "restaurar"; y su costo es real, porque
**el save gana campos seguido** (`mateLecciones` en la Sesión 29, `metasVistas` y `semaforo` en la
52) y cada uno pediría una migración de esquema, que aquí significa que Roberto va a pegar SQL a
mano. Detalle completo en la sección de Backend, arriba.

#### Dos cruces que rompen en silencio, y que son lo delicado del trabajo

1. ⚠️ **`?qa=1` no puede subir.** El XP es un número que solo sube, pero **la foto es un reemplazo
   completo**: abrir QA en un teléfono vinculado a un alumno real, completar una etapa para revisar
   contenido y que eso suba, le **pisa la partida del año**. El XP no tiene esa forma de fallar. Va
   guardado con `EFIMERO`, y es una diferencia **deliberada** con el XP.
2. ⚠️ **Al bajar la foto, el XP lo manda el servidor, no la foto.** `kimun_xp` solo sube, y
   `kimun_prof_xp_fijar` es la única forma de **bajar** un XP inflado. Un teléfono nuevo que bajara
   una foto vieja con 900 XP después de una corrección a 500 mandaría 900 en el siguiente
   `guardar()`, el servidor tomaría el mayor y **la corrección del profesor se desharía sola, sin
   ningún error**. Por lo mismo, la foto **no sobrescribe `alumno` ni `curso`**: vienen del canje.

#### Dos tareas del Bloque D se cerraron sin escribir su código

- **D4 (migración del avance que ya vive en los teléfonos): no hay migración.** El primer `guardar()`
  después de la actualización sube lo que el niño ya tenía.
- **D1 no necesita cola de reintentos**, aunque la tarea la daba por hecha copiando el patrón de
  `dominio`. **`dominio` la necesita porque manda eventos**, que se pierden si no llegan; una foto es
  completa e idempotente, así que el próximo envío que sí llegue lleva todo.

#### El refactor que hubo que hacer antes, y por qué no era opcional

La forma del save estaba escrita **dos veces** —`guardar()` la armaba campo por campo y `cargar()` la
leía campo por campo—. El camino de bajada la habría escrito una tercera vez, y el día que el juego
sume un campo se caería en una de las tres **sin ningún error**. Es exactamente el bug que este
proyecto ya pagó tres veces: el `oa` en la Sesión 23, el `visual` en la 55 y el `META_OA` en la 63.

Se extrajeron **`payloadSave()`** y **`aplicarSave(d)`**, con el cuerpo movido byte a byte (31
líneas). La comprobación que lo cierra no es `node --check` —un corte a medias puede seguir siendo
JavaScript válido, como el `/*` huérfano de la Sesión 75— sino que **`git diff` da +16/−6 y las 31
líneas movidas no aparecen**, más que en el navegador `lo que se escribe en disco es byte a byte lo
que arma payloadSave()`.

#### Verificación (con `cdp.mjs`, jugando)

| | |
|---|---|
| Dos `guardar()` seguidos | **1** subida (el rebote de 15 s) |
| Un tercero sin cambios | **sigue en 1** |
| `?qa=1` | **0 subidas** |
| Foto vieja de 900 XP contra un servidor en 500 | **queda 500** |
| Foto de "Ana" sobre el canje de "Pedro" | **queda Pedro** |
| Las dos ramas del conflicto | correctas, y el perdedor guardado en las dos |
| Sin conexión | no se marca como bajada → **reintenta**, y el juego sigue |

Regresión: 20/23/27 expediciones, guardado de 8° intacto (777 XP), las tres claves conviviendo,
**cero excepciones**. El único fallo de red es el `404` de `kimun_progreso_subir`, que es el esquema
todavía sin aplicar.

#### Tres cosas que aparecieron ejecutando

1. **Una ancla mía tenía 3 espacios de sangría y son 2.** El script **abortó antes de escribir
   nada** — es para eso que llevan la aserción. Y al medir bien apareció que **`revisarDificil()`
   aparece dos veces en 8°**, así que la otra ancla también habría pegado en el lugar equivocado.
2. **La captura delató dos tildes** que ningún conteo ve: *"capitulo"* y *"3 DIAS"*. En cambio se
   dejó **`1240` sin separador de miles a propósito**: el HUD del juego muestra las monedas así, y
   divergir en una sola pantalla se vería peor que el número crudo.
3. **`cerrarCanje()` ya navega solo.** El plan decía `cerrarCanje(); go('scr-rol')`, y ese `go`
   pisaba su destino y mandaba siempre al inicio, incluso a un niño que venía del mapa. Se detectó
   en la auto-revisión del plan, antes de escribir una línea.

#### Lo que esto cambia en lo que se puede prometer

`docs/comercial.md` listaba «el progreso vive en el teléfono, no en la cuenta» como **el primer
requisito que bloquea el modelo de suscripción**. Queda resuelto, y ahora **sí** se puede decir que
el niño cambia de teléfono y recupera todo.

> ⚠️ **Pero sigue sin poder decirse que funciona sin conexión**, que es la confusión fácil y cara:
> recuperar el avance necesita internet igual. Y **el avance lo sigue reportando el teléfono**, igual
> que el XP: es un dato que ya no se pierde, no un dato confiable.

- **Pendiente de Roberto:** **aplicar `supabase/schema.sql`** —hasta entonces el cliente da 404 en
  `kimun_progreso_subir` y el avance no viaja— y probar en el iPhone que el aviso ahora manda a
  Safari. Queda sin correr la comprobación del tope de 64 KB, que necesita el esquema aplicado.
- Spec y plan: `docs/superpowers/specs/2026-09-01-progreso-en-el-servidor-design.md` y
  `docs/superpowers/plans/2026-09-01-progreso-en-el-servidor.md`.
### Sesión 81 (2026-09-02) — Las fracciones se dibujan como en el cuaderno
Roberto lo vio jugando: la pregunta *"¿Cuánto es (9/10) ÷ (3/5)?"* mostraba las fracciones **en
línea**, y un niño las aprende **apiladas**. Pidió corregirlo *"y dejarlo como regla para los
siguientes cursos"*, que es la mitad más valiosa del encargo. **No se tocó ni un banco.**

#### La medición, antes de decidir nada

**128 preguntas** con fracciones —Matemática de 7° (82), de 8° (30) y de 3° (16)— en **278 formas
distintas**, todas de dígitos: `3/4`, `(9/10)`, `-3/4`, `35/2`, y muchas con puntuación pegada.

Se buscaron los falsos positivos antes de escribir el patrón: los 20 casos de `letra/letra` del
proyecto son **versos de poemas de Lenguaje** (*"que golpea tu ventana / y nadie me…"*) y
`metal/no metal`. Un patrón de solo dígitos no los toca.

#### ⚠️ Se cambia el DIBUJO, nunca el dato — y es la regla que hay que respetar

Tres motivos, y el primero cuesta plata:

1. **La voz pregrabada de 3° se indexa por el texto MOSTRADO.** Cambiar el texto del banco dejaría
   los clips huérfanos —siguen sonando como antes, en silencio— y habría que regenerarlos y
   pagarlos de nuevo. Es el *gotcha* de la Sesión 60.
2. `contenido/` es la capa de datos y esto es presentación: un cambio de una capa no toca las otras.
3. Las marcas de aprobación son por `id`, así que sobrevivirían igual — pero **el texto que un
   profesor aprobó sigue siendo exactamente el mismo**, que es lo honesto.

#### ⚠️ Dos números comparten la forma y NO son fracciones

`PREGUNTA 1/10`, en el encabezado del quiz, y el contador `1/10` del Reto de Cálculo. Los dos viven
en elementos aparte (`#qTag`, `#calcNum`) y **no pasan por el módulo**: aplicar esto a lo ancho de
la pantalla dejaría el contador de preguntas apilado. Verificado en pantalla.

#### El módulo

**`assets/js/fracciones.js`** (noveno compartido). `FRAC.html(texto)` **escapa primero y marca
después** —al revés reabriría el XSS almacenado de la Sesión 51—, se lleva su propio CSS y tiene
respaldo vacío que **también escapa**: un 404 no puede reabrir ese agujero.

Sus guardas, y las tres nacieron de mirar datos reales:

- **Fechas y listas** (`12/05/2020`, `1/2/3`): mira el carácter pegado a cada lado y, si es un
  dígito o una barra, no apila. **Ante la duda no apila** — un falso negativo se ve como antes, un
  falso positivo deforma el dato.
- **El signo va FUERA y pegado** a su fracción: en 8° el objetivo es *"fracciones y decimales,
  aunque sean negativos"*, y un `-` suelto se lee como una resta.
- **Los paréntesis de una fracción sola se quitan**, porque apilada sobran. ⚠️ Pero **solo** si el
  paréntesis contiene exactamente una fracción y lo anterior no es dígito ni letra: `2(3/4)` es una
  multiplicación y sin paréntesis se leería como el mixto 2¾, que es otro valor.

**Nueve puntos de pintura**: quiz, Jefe Final, duelo local, duelo en línea y la explicación al
fallar (`motor.js`); Reto de Cálculo y mini-clases (`juego/index.html`).

#### Lo que solo se vio MIRANDO la captura

La primera versión medía perfecto —2 fracciones en el enunciado, 4 en las opciones, 0 en el
contador— y aun así tenía dos defectos: **los paréntesis alrededor de una fracción apilada quedaban
ruidosos** (`( 9/10 ) ÷ ( 3/5 )`) y **el signo menos quedaba separado** de su fracción. Ningún
conteo lo dice. Es la cuarta vez que este proyecto tropieza con lo mismo —Sesiones 59, 74, 77— y por
eso la captura es parte de la verificación, no un extra.

#### Verificación

| | |
|---|---|
| Barrido sobre **los 16 bancos** | 46.842 textos, 762 fracciones apiladas, **0 escapes rotos** |
| Fechas, listas, versos, `metal/no metal` | intactos |
| `2(3/4)` | conserva sus paréntesis |
| `PREGUNTA 1/10` | no se apila |
| Con el módulo **ausente** | el juego sigue en los tres, y el respaldo **sigue escapando** |
| Regresión | 20/23/27 expediciones, motor vivo, cero consola y cero 404 |

**7° y 3° cambian byte a byte igual**; lo único que 8° tiene de más son las mini-clases y el Reto,
que en los otros dos no existen.

#### La regla, escrita para los cursos que vienen

- **[`docs/estandar-fracciones.md`](docs/estandar-fracciones.md)** (nuevo): la regla, los cinco
  casos que **no** son fracciones, y las dos líneas que necesita un curso nuevo.
- **`docs/encargo-banco.md` §3**: lo que necesita saber quien escriba preguntas — *escribe `n/m` y
  nada más; el juego lo apila solo*. Con eso **5°, 6° y 4° lo heredan sin trabajo extra**, que era
  el punto del encargo.

#### Orden de publicación: al revés que en la Sesión 80

Ahí `motor.js` era el **proveedor** y salía primero. Aquí es el **consumidor** —llama a
`FRAC.html()`— y el proveedor son el módulo y el respaldo que vive en los forks. Así que primero
`fracciones.js` **con** los tres forks, y `motor.js` después. Al revés, un `motor.js` nuevo sobre
forks viejos daría `FRAC is not defined` y **mataría el quiz**.
### Sesión 82 (2026-09-02) — El armador no mostraba las mini-clases, y detrás había tres fugas
Roberto lo vio usándolo: *"en el armador no se ven las mini clases"*. Confirmado, y al medirlo
aparecieron tres defectos más que nadie había visto. **No se tocó contenido**: ni un banco, ni una
pregunta, ni un clip de voz.

#### Por qué no se veían

El armador dibuja `EXPEDICIONES` + `EXTRAS`. **Las mini-clases no son ninguna de las dos**: viven
en `capitulosMate` de la campaña `mate`, y su contenido en `lecciones.json`.

Es **el mismo defecto que la Sesión 70 encontró con el Reto de Cálculo**, por la misma causa: el
armador solo entiende expediciones. De Matemática de 8° ofrecía las 4 expediciones y el Reto, pero
no las 4 unidades con sus 17 mini-clases — justo el sub-producto más vistoso del nivel, el de los
diagramas SVG interactivos, que costó cuatro planes.

Entran como **dato en `EXTRAS`**, no como caso especial, así que el armador, el filtro de `?solo=`
y la lista del modo prueba **siguen iguales en los tres forks**. 8° pasa de **21 a 25 casillas**.

#### Los tres defectos que aparecieron, y ninguno se veía

Nacen todos de lo mismo: **las mini-clases nunca fueron alcanzables desde un enlace de muestra**,
así que ese camino nunca pasó por los modos prueba y revisión.

1. ⚠️ **Una fuga que convertía el enlace de muestra en la llave del juego completo.** El nodo
   "← Volver a Matemáticas" de la lista de lecciones llama a `renderCampaña()`, que abre la
   campaña **entera**: las 4 unidades, las 4 expediciones, el Reto y el Jefe Final. Es la misma
   fuga que la Sesión 41 cerró en el "Volver" de la campaña y la 42 con `renderListaPrueba`.
2. **Las lecciones estaban encadenadas** (`i===0 || S.mateLecciones[anterior]`) **sin mirar
   `CAPS_ABIERTOS`**: el profesor recibía la unidad con 4 de sus 5 lecciones bloqueadas, contra
   la promesa del modo prueba.
3. **`?rev=1` no llegaba a la práctica.** `iniciarPracticaLeccion` toma `fb.n` del JSON **sin
   pasar por `nPreguntas()`**, así que servía 10 por lección — 30 en una unidad, cuando ese modo
   existe justamente porque 40 por capítulo agotan a cualquiera (Sesión 56).

De paso, el **lector de enlaces** del armador mostraba el id crudo (`reto-calculo`) para lo que no
es expedición. Con 4 ids más iba a empeorar.

#### Verificación (con `cdp.mjs`, jugando)

| | |
|---|---|
| Armador de 8° | **25 casillas**, las 4 mini-clases bajo Matemáticas |
| Lector | *"Mini-clases · Geometría"* y *"Reto de Cálculo"*, no el id |
| `?solo=mate-geometria` | 1 tarjeta · las 4 lecciones **abiertas** (`bloqueadas: 0`) |
| El "Volver" | vuelve a la lista de prueba (**1 nodo**), no a la campaña |
| `?rev=1` | **3** preguntas, y el 🚩 marca el id real (`mate8-oa15-102`) |
| Regresión | 8° con sus 20 expediciones, 10 nodos de campaña mate, 12 diagramas y 5 niveles del Reto; 7° y 3° con `HAY_MINICLASES=false` y cero mini-clases |

**Cero errores de consola y cero 404** en los tres.

> **Dos errores míos de medición, los dos del script y no del producto:** busqué el 🚩 por
> `.rev-flag` cuando se llama `btnMarcar`, y leí `xp:0` porque **`ev.ir()` a la URL actual no
> recarga la página**, así que el save sembrado nunca se leyó. Comprobados aparte: el 🚩 funciona
> y el guardado sobrevive con sus 777 XP. La segunda es una trampa nueva de `cdp.mjs` y conviene
> recordarla.

#### Y el encargo que salió de ahí: llevar las mini-clases al resto de los cursos

Roberto pidió el plan para los demás cursos de Matemática y evaluar si otra asignatura necesita
una introducción. Se midió antes de proponer, y la medición **partió el trabajo sola**:

| | 3° | 4° | 5° | 6° | 7° | 8° |
|---|---|---|---|---|---|---|
| OA de Matemática | 26 | 27 | 27 | 24 | 19 | 17 |
| Banco | 792 ✅ | 0 | 0 | 0 | 570 ✅ | 603 ✅ |
| Mini-clases | — | — | — | — | — | **17** ✅ |

**140 OA, 17 con mini-clase: faltan 123.** Pero ⚠️ **la práctica saca del banco** (`fromBank`), y
4°, 5° y 6° no tienen banco: sus 78 no se pueden escribir antes que el Bloque B. Es una
dependencia dura. Alcance decidido: **3° (26) y 7° (19) = 45**, con el mapa «enseña → desafío»
como en 8°.

**Tres hallazgos que cambian el trabajo:**

- ⚠️ **Ninguna herramienta lee `lecciones.json`** —ni el tablero, ni un validador, ni el generador
  de informes, ni los scripts de voz—. **Las 17 mini-clases de 8° llevan enseñando desde la
  Sesión 29 sin ninguna firma**, y hoy no hay forma de dárselas. No contradice la landing (dice
  *"7.805 **preguntas** aprobadas"*, y es cierto), pero escribir 45 más multiplica por 3,6 el
  contenido que enseña sin revisar. Y **una mini-clase equivocada es peor que una pregunta
  equivocada: la pregunta se falla y se corrige, la clase se cree.** Por eso la herramienta va
  **antes** de escribir.
- **El motor vive solo en `juego/index.html`** (la Sesión 65 lo cortó de 3° y 7° por ser código
  muerto). Hay que extraerlo a `assets/js/lecciones.js`: **479 líneas**, más **4 funciones sueltas
  intercaladas con código vivo** (`renderCampañaMate`, `jefeFinalMateDesbloqueado`,
  `capMateCompleto`, `cargarPoolMate`), que se cortan por balance de llaves y no por rangos.
  El Reto de Cálculo vive pegado pero **no viaja** (Sesión 74).
- **El motor ya admite lecciones sin práctica** (`terminarLeccion()` marca completa una lección que
  se queda sin bloques). Así que **una introducción de Ciencias no pide una línea de motor**: es
  una lección de 2-3 bloques sin `practica`. Y Ciencias es la única otra candidata medida —**0 de
  sus 1.374 preguntas llevan dibujo**, se enseña y evalúa 100% con texto—, con **una por capítulo**
  (4+5+4 = 13) y no por OA, que serían 92.

**Historia y Lenguaje quedan fuera, y con motivo:** Historia ya tiene sus 4 dibujos propios en 3°
usados en 33 preguntas, así que una introducción sería ambientación; Lenguaje es la peor candidata
al formato —17 de sus 31 OA de 3° son producción o hábito, y una clase que enseña a escribir no
tiene cómo comprobar con un quiz que se aprendió.

**La migración cortés se sacó del alcance** cuando Roberto confirmó que el curso de 3° es de prueba
y la invitación no se ha mandado: sería **una rama que nadie ejerce**, y una rama que nadie ejerce
es una rama que no se prueba. El patrón queda anotado en el spec para el día que haya alumnos vivos.

#### Lo que cazó la auto-revisión del plan, y habría matado los tres cursos

**`motor.js` nombra tres cosas que se van al módulo**: `renderCampañaMate` (en `renderCampaña`),
`volverAlCapituloMate` (en el ✕ del quiz) y `abrirMiniClaseDeOA` (en el siguiente paso al
reprobar). Cortarlas sin reconectarlas deja al motor genérico llamando funciones que ya no
existen, **en los tres cursos a la vez**. Es el hermano exacto del `detenerTimersActivos` de la
Sesión 65 — la referencia cruzada que solo aparece si la enumeras **antes** de cortar, que es por
lo que la Tarea 1 del plan es justamente enumerarlas.

Spec y plan: `docs/superpowers/specs/2026-09-02-miniclases-e-introducciones-design.md` y
`docs/superpowers/plans/2026-09-02-miniclases-e-introducciones.md` (18 tareas en 5 fases).

### Sesión 83 (2026-09-02) — Las mini-clases llegan a 3° y 7°, y el motor sale de 8°
Ejecución del plan A25, fases 1 a 4. El camino **"enseña → desafío"** deja de ser exclusivo de 8°:
el proyecto pasa de 17 a **62 mini-clases** (3°: 26 · 7°: 19 · 8°: 17). **No se tocó ningún banco
de preguntas**: las lecciones son contenido nuevo y aparte.

#### Fase 1 — El motor sale del fork, y esta vez también de 8°

Vive en **[`assets/js/lecciones.js`](assets/js/lecciones.js)** (décimo módulo compartido): las 479
líneas del bloque más **cuatro funciones sueltas** intercaladas con código vivo
—`renderCampañaMate`, `capMateCompleto`, `jefeFinalMateDesbloqueado`, `cargarPoolMate`—, cortadas
por balance de llaves y no por rangos. `juego/index.html` baja **535 líneas**; los tres forks
quedan en **8.301** en total.

**El módulo inyecta su CSS *y su pantalla*.** La Sesión 65 se llevó de 7° y 3° el markup de
`scr-leccion` pero les dejó sus 13 reglas de CSS, huérfanas desde entonces. En vez de restaurar el
markup en cada fork lo pone el módulo —el patrón que `revision.js` ya validó en producción—, así
**integrar un curso nuevo son dos líneas**.

> ⚠️ **La auto-revisión del plan cazó lo que habría matado los tres cursos a la vez:** `motor.js`
> nombra **cinco** de las funciones que se van al módulo, no las tres que el plan decía
> (`cargarPoolMate`, `renderCampañaMate`, `finPracticaLeccion`, `abrirMiniClaseDeOA` y
> `volverAlCapituloMate` desde el ✕ del quiz en los tres). Cortarlas sin reconectarlas deja al
> motor genérico llamando a funciones que ya no existen. Es el hermano del `detenerTimersActivos`
> de la Sesión 65: la referencia cruzada solo aparece si la enumeras **antes** de cortar, que es
> por lo que la primera tarea del plan era justamente enumerarlas.

**Y una que estuvo a punto de perderse en silencio:** el nodo del **Reto Sin Fin** lo dibujaba
solo `renderCampaña`, así que encender `esLecciones` en 7° y 3° —que los manda a
`renderCampañaMate`— les habría **borrado su Reto** sin ningún error. Se extrajo a `nodoSinFin()`,
que ahora llaman **las dos** pantallas de campaña.

**El Reto de Cálculo NO viajó.** Vivía pegado al bloque pero es otra cosa (medido en la Sesión
74): se queda en `juego/index.html`, y lo único que los toca es el nodo del Reto en el mapa,
guardado con `CFG.hayReto`.

#### Fase 2 — Las mini-clases entran al circuito de aprobación

**Ninguna herramienta leía `lecciones.json`**, así que las 17 de 8° llevaban **enseñando desde la
Sesión 29 sin ninguna firma**, y no había forma de dárselas. Ahora:

- `generar-revision-preguntas.py` abre el informe con una **sección de mini-clases**, **arriba de
  las preguntas** —se aprueba primero lo que enseña—, con sus diagramas **dibujados de verdad**
  reutilizando el módulo, y un **aviso en rojo** si alguno falla.
- `generar-tablero.py` las cuenta aparte, con una insignia `📘 N mini-clases` por asignatura. **Las
  1.287 barras de cobertura quedaron idénticas**: no movió ni un porcentaje.

> **Un falso negativo propio, y conviene registrarlo:** medí los diagramas del informe buscando
> `.diag` y daban **0**. No era el informe: `montarDiagrama` le **cambia la clase al nodo** al
> montarlo (`nodo.className='lec-diag'`). Medido bien, **20 de 20** en 8° y **19 de 19** en 7°.
> Un "0 errores" que en realidad era cierto **por vacuidad** es la peor clase de verificación.

#### Fase 3 — 7°: 19 mini-clases

5,3 bloques de promedio (8° tiene 5,2) y **19 de 19 llegan al quiz**, 18 con su dibujo. La tanda
de validación de 5 salió limpia a la primera, así que el estándar aguantó y se escaló sin
cambiarlo. **La única sin dibujo es la de construcciones con compás**, y es correcto: es un
procedimiento manual paso a paso, no un modelo que dibujar.

Tres widgets nuevos, elegidos por lo que el contenido pidió y no por lo que el plan preveía:
**`circulo`** (radio y diámetro), **`poligono`** (el n-gono partido en n−2 triángulos desde un
vértice, que es lo que *explica* la fórmula en vez de enunciarla) y **`figura`** (triángulo,
paralelogramo y trapecio con su base y su altura). La proporcionalidad, que el plan daba por
widget nuevo, se resolvió con el `funcion` que ya existía.

> Y una que se vio **mirando**: en el círculo la palabra "diámetro" **cruzaba por la línea del
> radio**. Corregida corriéndola a la izquierda.

#### Fase 4 — 3°: 26 mini-clases

5,2 bloques de promedio, **26 de 26 juegan y llegan a su quiz de 10**, todas con dibujo. El
catálogo pasa de 12 a **22 widgets**: el plan preveía 2 para 3° (`dinero` y `pictograma`) y
hicieron falta **5** — se suman **`cuadricula`**, **`reloj`** y **`puntos`**.

> **`puntos` cierra algo anotado desde la Sesión 55:** el `MA03 OA 26` pide diagramas de puntos
> **por su nombre** y hasta hoy sus preguntas se ilustraban con barras, que es otra cosa.

Y la cuadrícula respeta la convención que este proyecto ya pagó una vez: **la letra dice la
columna y el número dice la fila**, que es lo que declaran las 15 preguntas de ese OA (un informe
externo pidió invertirla en la Sesión 56 y estaba equivocado).

#### ⚠️ Dos bugs de motor, y el primero llevaba a un dato falso en el panel

**1 · La práctica de 3° no medía nada, y no daba ningún error.** `preguntasDeOA` sacaba el banco
del **nombre de la asignatura** (`contenidoDeAsignatura('Matemáticas')`) con un respaldo literal
al banco de 8°. **3° escribe `'Matemática'` en singular**, así que la búsqueda devolvía `null`,
descargaba el banco de **otro nivel**, lo filtraba por `MA03` y no encontraba una sola pregunta —
y **una práctica vacía marca la lección completa igual**. O sea: en el panel del profesor la
lección aparecía hecha y el objetivo sin datos.

> Es el **quinto caso** del mismo defecto del fork (Sesiones 63, 64, 65, 72 y esta), y la salida
> es la de siempre: **la convención de nombres ES la configuración**. El banco de un curso vive al
> lado de sus lecciones, así que ahora sale de `CFG.ruta` y no hay ningún nombre que calzar. De
> paso 7° y 8° dejaron de depender de esa búsqueda.

**2 · El botón «← Salir» se comía la barra de progreso entera**: 406 px contra **0**.
Preexistente y **vivo en producción en 8°** desde que existen las mini-clases; al llegar a 3° y 7°
se triplicaba. El `.btn` de los tres forks es `width:100%`, y dentro de `.lec-top` eso deja al
hermano `flex:1` sin espacio. La regla va en el CSS del **módulo**, que es quien trae esa barra.
Ahora **96 / 205**.

#### Lo que faltaba y no estaba en el plan: la voz de la mini-clase

La mini-clase es **la pantalla con más texto del juego**, y era la única de 3° sin botón 🔊 —
justo para el niño que todavía no lee de corrido, que es la razón entera de que 3° tenga voz.

- **`textoLocutable(b)`** arma lo que se lee **desde los datos y no desde el DOM**: el cuerpo ya
  pintado arrastra los rótulos del SVG ("centenas", "7 centenas"), que son apoyo visual y suenan a
  disparate leídos de corrido. Es además **la lista exacta de fragmentos** que
  `generar-voz-nivel.py` tiene que sacar de `lecciones.json` en la Tarea 15.
- El botón aparece solo si `VOZ.activo` **y** el bloque tiene algo que decir, así que en 7° y 8°
  nunca se ve **sin necesidad de una bandera más**.

#### Cinco correcciones de contenido, y tres solo se vieron mirando

- **Dos números regalaban la respuesta:** el ejemplo llegaba a `604` y a `405`, y el banco
  pregunta justo por esos dos **con la respuesta dicha en el paso** ("no tiene ninguna barra de
  diez", "hay un cero"). El niño la contestaría de memoria treinta segundos después y el mapa de
  dominio mediría recuerdo, no saber. Cambiados por `907` y `309`, a costo pedagógico cero.
- **"2 cientos" y "5 dieces"** eran plurales inventados: el OA se llama *unidades, decenas y
  centenas*, y así lo dice la profesora en la sala.
- **La tabla posicional no decía de qué número era cada fila**, así que el niño tenía que *armar*
  415 leyendo 4-1-5 — y el que todavía no puede hacer eso es justamente el que necesita la tabla.
- **La etiqueta de la cuadrícula salía CORTADA** (*"lpi está en la casilla (C"*): su `viewBox`
  medía 176 y el texto no cabía.

> ⚠️ **Esa última no la delata ninguna medición** —`scrollWidth` no desbordaba, el `<svg>` estaba,
> el alto era correcto—. **Se vio en la captura.** Es la quinta vez que este proyecto tropieza con
> lo mismo (Sesiones 59, 74, 77, 82), así que quedó escrita como regla en el estándar: **un widget
> se aprueba mirando, no contando.**

#### Un barrido que había que juzgar, no obedecer

El detector de "la lección regala la respuesta" marcó **49 coincidencias** sobre las 26 de 3°. Se
revisaron una por una y **casi todas eran el vocabulario que la lección existe para enseñar**:
*traslación*, *columna*, *3/4*, *ángulo recto*. Una clase de transformaciones que evite decir
"traslación" no es una clase.

> **El defecto real es otro: que la lección resuelva el CASO NUMÉRICO EXACTO** que una pregunta va
> a preguntar, cuando el concepto se enseña igual con cualquier otro número. Esos eran dos y están
> corregidos. Distinguir las dos cosas es a mano, y hay que hacerlo: **un informe que marca lo
> correcto se deja de leer**, que es lo que ya pasó en las Sesiones 56, 62 y 70.
>
> Y una consecuencia que conviene decir: **el porcentaje que el mapa de dominio produce justo
> después de una mini-clase mide recuerdo inmediato, no dominio del año.** Es propio del diseño
> "enseña → desafío", vale igual en 8° y 7°, y no se lee como maestría.

#### Verificación (con `scripts/cdp.mjs`, jugando)

- **Las 62 mini-clases se juegan por la interfaz**, con clics reales: 26 + 19 + 17, todas llegan a
  un quiz de **10 preguntas, 4 opciones y del OA correcto**. En 3° **sin reloj**.
- **El informe de aprobación** de 3° dibuja sus 26 con **30 de 30 diagramas**, sin aviso rojo; el
  de 7°, 19 de 19. El tablero cuenta **26 · 19 · 17**.
- **Sin regresión:** 20 / 23 / 27 expediciones, motor vivo en los tres, y el guardado de 8°
  sobrevive a jugar los otros dos con sus 777 XP y sus tres claves separadas.
- **Con `lecciones.js` ausente los tres siguen jugables** —`LECC.activo` en false, cero
  excepciones— y el único fallo de red es su propio 404.
- **Cero errores de consola y cero 404.**

#### Lo que queda de A25

- **Tarea 14 · la aprobación de las 45** (Roberto): ya salen en el tablero y en los informes.
- **Tarea 15 · la voz de 3°** (~230 clips ≈ US$0,15): **después de aprobar, nunca en paralelo**, y
  **gasta plata de Roberto, así que no se corre sin su autorización explícita**. Requiere enseñarle
  a `generar-voz-nivel.py` a leer `lecciones.json`, y `textoLocutable` ya define qué sacar.
- **Fase 5 · las 13 introducciones de Ciencias** (4 en 3°, 5 en 7°, 4 en 8°): **cero motor nuevo**,
  porque `terminarLeccion()` ya marca completa una lección sin práctica.

#### Trampas de método, todas nuevas

- **`ev.ir()` a la MISMA dirección no recarga la página**, así que un save sembrado antes nunca se
  lee y el progreso sale en cero. Parece un bug del producto y es de la prueba.
- **`DIAGRAMAS`, `LEC` y `renderBloque` viven dentro del IIFE del módulo**: desde `cdp.mjs` no se
  llegan, y hay que conducir por la interfaz —que además es la prueba que vale.
- **Un ancla con 4 espacios de sangría donde escribí 2**: el script **abortó antes de escribir**,
  que es exactamente para lo que llevan la aserción.

### Sesión 84 (2026-09-02) — El contenido sexual sale de los jefes, y Ciencias estrena introducciones
Continuación directa de la 83, con dos encargos de Roberto. **Ningún banco de preguntas se tocó.**

#### El estándar de qué lleva cada asignatura (decisión de Roberto)

Al revisar qué faltaba, Roberto preguntó por Historia y Lenguaje. **Estaban descartadas en el
diseño de la Sesión 82, y al volver a medirlo uno de los dos motivos no se sostuvo:**

> Se había escrito que Ciencias era la única candidata porque *"0 de sus 1.374 preguntas llevan
> dibujo"*. Medido: es **igual de cierto de Historia de 7° y 8° (1.353 preguntas) y de todo
> Lenguaje (2.130)** — 0% de 3.483 en total. **Ese criterio no distinguía a nadie.** Y la otra
> mitad —*"Historia ya tiene sus dibujos propios"*— vale **solo en 3°**, donde son 33 de 480 (7%).

La regla que fijó Roberto, ya escrita en
[`docs/estandar-miniclases.md`](docs/estandar-miniclases.md):

| Asignatura | Qué lleva | Granularidad |
|---|---|---|
| **Matemática** | **Mini-clase SIEMPRE**, sin excepción | una por **OA** |
| **Ciencias** e **Historia** | Mini-clase **o** introducción, **si amerita** | mini-clase por OA · introducción por **capítulo** |
| **Lenguaje** | **Solo introducción**, y solo si amerita. **Nunca mini-clase** | por **capítulo** |

**Y hay una asimetría que explica la regla entera, no solo la registra: una mini-clase AGREGA una
medición al mapa de dominio del profesor; una introducción NO.** La introducción no tiene
práctica, así que no llama a `registrarOA` y no puede ensuciar ningún porcentaje. Por eso Lenguaje
—donde 17 de 31 OA en 3° y 10 de 25 en 7° son de producción o de hábito— **nunca** lleva
mini-clase: su práctica mediría si el alumno reconoce una definición y **le mandaría al profesor
un número engañoso sobre "escritura"**.

**Qué NO decide "si amerita", medido:** la profundidad del banco (los **235 OA con banco tienen 26
preguntas o más**, el mínimo es `LE03`) ni "la asignatura no tiene dibujos". Decide si el OA enseña
**un procedimiento que el alumno ejecuta** (→ mini-clase) o si el capítulo **abre un modelo** que
el alumno no tiene (→ introducción). Y **la granularidad se decide antes de escribir**: por OA el
techo son **104 mini-clases** en Ciencias e Historia, por capítulo **29 introducciones**, y entre
las dos lecturas hay meses.

#### El contenido sexual fuera de los Jefes Finales — cierra la tarea A4

Roberto la resolvió con una decisión **más simple que la feature que se creía necesaria**. La
tarea decía que apagar un OA "toca la campaña, el Jefe Final y el mapa de dominio", y que mientras
tanto la única forma de excluirlo era no incluir el capítulo. **El problema era que eso no
funcionaba**, y la medición mostró exactamente por qué:

> El Jefe Final **se abre al 100% de la campaña y mezcla objetivos de toda la asignatura**, así que
> tenía una **fase entera** de `CN07 OA 01/02/03`. Un colegio que decidiera no incluir el capítulo
> de sexualidad **se lo encontraba igual en el jefe**, y ahí ya no hay forma de evitarlo.

Sacarlos deja el contenido sensible **viviendo en un solo lugar —su capítulo—**, que es lo que
hace que excluirlo sea posible de verdad. Sin configuración, para todos, y por eso no puede
quedar mal puesto.

- **El jefe conserva su tamaño:** 4 fases × 4 = 16 preguntas. Los 12 OA restantes se reparten por
  unidad, y **queda más coherente que antes** — la fase 1 juntaba materia con presión solo para
  hacerle sitio a la de sexualidad.
- ⚠️ **El jefe DEL CAPÍTULO se queda.** Quien no incluye el capítulo nunca llega a él, y vaciarlo
  lo dejaría roto para el colegio que sí lo incluye. Es una decisión tomada dentro de la
  instrucción, no una omisión.
- **Verificado peleando el jefe:** **800 preguntas sorteadas del banco real, 12 OA distintos,
  cero sexuales.**
- Regla, alcance y chequeo en [`docs/contenido-sensible.md`](docs/contenido-sensible.md). Vale
  igual para los `CN06 OA 04/05/06` cuando se construya 6°.

> **Y el chequeo que documenté no servía: usaba `SENSIBLE.deOA()`, que no existe** (el módulo
> expone `SENSIBLE.oa`). Corregido y **corrido en los tres cursos**, donde da vacío. Una
> comprobación escrita que no funciona es peor que ninguna: da la sensación de estar cubierto.

#### Fase 5 · las 13 introducciones de Ciencias

**4 en 8°, 5 en 7° y 4 en 3°**, una por capítulo. Son lecciones de 2 a 4 bloques **sin práctica**,
así que no miden, no pagan y no consumen banco. Tres dibujos de modelo nuevos —**`celula`**,
**`circuito`** (abierto y cerrado, que es lo que explica por qué la luz se enciende) y
**`estados`** (las mismas partículas ordenadas en el sólido y sueltas en el gas)—: el catálogo
llega a **25 widgets**.

**El punto delicado, que el plan no había visto:**

> ⚠️ **El nodo 📘 NO puede entrar en el arreglo indexado de etapas.** El avance vive en
> `S.rutas[id].progreso` **indexado por posición**, así que meterlo como etapa 0 correría todas
> las demás y **le rompería la partida a quien ya venía jugando**. Se dibuja aparte, desde
> `LECC.nodoIntro`, insertándose al principio del mapa. Verificado sembrando un save con
> `done,done,open,lock,lock`: sale **idéntico** con el nodo delante.

Y **no bloquea**: es un ofrecimiento, no un peaje. Quien la salta juega igual.

**`LECC.init` pasa a recibir una lista de rutas** (`rutas:[...]`, conservando `ruta` en singular
por compatibilidad), porque cada asignatura trae su propio archivo de lecciones. Se fusionan como
`voz.js` fusiona sus manifiestos, y **cada lección se queda con el banco de su propio archivo** —
por eso la práctica no necesita saber de qué asignatura es.

#### ⚠️ Un bug que solo se vio en la captura, y es el tercero de su familia

`.btn-escuchar{display:block}` **le gana al atributo `hidden`**, así que el 🔊 que la Sesión 83 le
puso a la mini-clase **se estaba viendo en 7° y 8°**, donde no hay voz que sonar.

> **El DOM decía `hidden=true` y el píxel decía lo contrario.** La verificación de la Sesión 83
> midió el atributo y reportó "🔊: 0" — estaba mal. Es exactamente lo que ya pasó con
> `#maestroOverlay` (Sesión 20) y con el botón Continuar del quiz (Sesión 29), y las tres veces
> el arreglo es el mismo: `[hidden]{display:none}` **primero**, en el CSS del módulo que define
> la clase.

#### Dos correcciones al revisar los pendientes

1. **`A25` en `pendiente.md` se contradecía a sí mismo:** arrastraba el encargo original diciendo
   *"el motor vive solo en 8° y hay que extraerlo"*, que se había hecho ese mismo día. Se fueron
   **1.275 caracteres** de trabajo ya cumplido. Es el patrón de nota rancia que este archivo
   documenta: **una nota que nadie vuelve a medir se vuelve un candado**.
2. **El esquema del Bloque D estaba aplicado y sin registrar.** El registro de
   `docs/aplicar-schema.md` se detenía el 31/08 y el archivo se editó el 01/09. Comprobado contra
   producción —`kimun_progreso_bajar` responde `[]` en vez de `PGRST202`— y anotado.
   > Es el defecto **inverso** al de la Sesión 73, cuando se mandó a re-aplicar algo ya aplicado.
   > Los dos salen de lo mismo: **mandar a re-aplicar por reflejo entrena a ignorar el aviso el
   > día que sea de verdad.**

#### Verificación

- **Las 13 introducciones se recorren enteras** en sus tres cursos (4/4, 5/5, 4/4), y el **🔊
  aparece solo en 3°** — cero en 8° y 7°, que es lo correcto.
- **El avance no se movió:** las etapas de cada capítulo siguen siendo las mismas con el nodo
  nuevo delante.
- El Jefe Final de Ciencias de 7° peleado: **800 sorteos, cero contenido sexual**.
- El chequeo de `docs/contenido-sensible.md` corrido en los tres: **arreglo vacío**.
- **Cero errores de consola y cero 404.**

#### Lo que queda de A25

- **La aprobación de las 45 mini-clases y las 13 introducciones** (Roberto). Salen en el tablero y
  en los informes.
- **La voz de 3°**: ~230 clips de las mini-clases **más ~10 de sus 4 introducciones** ≈ US$0,15.
  **Después de aprobar, nunca en paralelo, y con autorización explícita: gasta plata de Roberto.**
- **Historia (16 capítulos) y Lenguaje (20)**, aplicando el criterio capítulo por capítulo **antes**
  de escribir.

### Sesión 85 (2026-09-02) — Las 75 lecciones ya se pueden aprobar, y el tablero muestra solo lo pendiente
Sesión corta y de herramienta. **No se tocó contenido**: los tres `lecciones.json` de Ciencias solo
cambiaron de formato, no de texto.

#### El hueco lo encontró Roberto preguntando dónde revisar

Dijo: *"me imagino que lo debo revisar en `vulpo.cl/dev/tablero.html`, porque no escondes las ya
revisadas y dejas a la vista solo las pendientes"*. Las dos mitades de la frase resultaron ciertas,
y la segunda destapó algo peor que un tema de comodidad.

> ⚠️ **Se le había dicho DOS VECES que las mini-clases "ya salen en el tablero y en los informes",
> y era medio falso.** El tablero solo las **contaba** con un chip `📘 N mini-clases` — su propio
> código lo admitía en un comentario: *"su aprobación es otro trámite que el de las preguntas"*, y
> **ese trámite nunca se construyó**. O sea que las **75 lecciones del proyecto —lo único que
> ENSEÑA— no tenían forma de aprobarse.**

**Y una corrección dentro de la corrección:** al reportarlo se afirmó además que el informe decía
*"marca la casilla"* sobre una casilla inexistente. **Falso: el informe SÍ imprime su recuadro**
(`class="chk"`, igual que cada pregunta). El grep buscaba `check`/`input`/`casilla`. Lo que faltaba
era marcarlas **en el tablero** y que esa marca **llegara al archivo**.

#### El circuito, ahora completo

1. **`dev/tablero.html`** trae una sección 📘 por asignatura con las lecciones **enteras** —texto,
   ejemplo y **el diagrama dibujado de verdad**, porque el generador incrusta
   `assets/js/lecciones.js` igual que el informe—, su casilla y un botón *"✓ Aprobar todas"*.
2. **"Exportar revisadas"** ya las incluye: **reusan el mismo almacén** (`.pq-check input` con
   `data-id`), y el `id` de una lección (`ma3-oa01`, `ci8-celula`) no choca con ninguno de pregunta.
   No hubo que tocar el guardado, ni el contador, ni la exportación.
3. **`aplicar-revisadas.py`** escribe `revisada:true` en el `lecciones.json` que corresponda.
   Probado marcando 5 y volviendo a correrlo: la segunda vez marca **+0**.

**Verificado en el tablero: 75 lecciones con casilla, 74 diagramas, los 74 renderizados.** El
contador pasa de `7.805/7.880` a `7.806/7.880` al marcar una, y queda guardada.

#### "Solo lo pendiente", que era el pedido

Con **7.805 de 7.805 preguntas firmadas**, abrir el tablero era recorrer 235 objetivos verdes para
llegar a nada. Ahora abre filtrado y **las asignaturas sin pendientes se van al FINAL**.

> **Plegarlas no bastaba:** 23 de 29 aprobadas, a ~120 px cada encabezado, son **~2.700 px de
> scroll** antes de lo único que hay que revisar — justo lo que el filtro venía a evitar. Hay que
> sacarlas del camino, no solo encogerlas.

#### ⚠️ Dos defectos encontrados construyéndolo

1. **El filtro daba 11 de 29 aprobadas con todo firmado.** La causa no se ve leyendo: **las
   preguntas solo se pintan al desplegar su OA**, así que **12 de las 29 secciones tienen cero
   casillas en el DOM** y la regla `todas las casillas marcadas` las daba por pendientes. Se
   resolvió con el dato que sí conoce quien genera el archivo: `data-pend-preg` por asignatura.
   Quedó en **23 de 29**, que son exactamente las 6 con lecciones sin firmar.
2. **Marcar 2 lecciones reformateaba el archivo entero** — 74 líneas por 2 marcas. Los tres
   `lecciones.json` de Ciencias nacieron escritos a mano con otro formato, y `escribir_banco`
   además asumía la clave `preguntas`. Canonizados (`indent=1`, LF, sin salto final) y con el
   escritor generalizado, marcar una lección son **2 líneas**. Es el mismo defecto que la Sesión 72
   arregló para los bancos.

#### Y un error de medición propio, el tercero idéntico

Se midió **"0 diagramas dibujados"** y era falso: **`montarDiagrama` le cambia la clase al nodo**
(`lec-diag-slot` → `lec-diag`) al dibujar. Medido bien, **74 de 74**. De paso apareció que la regla
de CSS apuntaba solo a la clase vieja, o sea que **dejaba de aplicar justo cuando había algo que
ver**; ahora apunta a las dos.

> Es la tercera vez que este proyecto tropieza con lo mismo —la Sesión 83 lo hizo con el informe— y
> por eso quedó escrito en el CSS del generador, no en la bitácora.

#### Un push, y conviene decir por qué

Las últimas tres sesiones fueron en **dos pushes** porque había un proveedor (`assets/js/`) y unos
consumidores (los `index.html`). **Aquí no**: ningún fork cambió, el tablero se genera
autocontenido y el único cambio de `lecciones.js` es cosmético (el rótulo "mitocondria", que se
encimaba con el contorno de la célula). **Un push basta, y partirlo por costumbre sería ceremonia.**

### Sesión 86 (2026-09-02) — Historia y Lenguaje estrenan introducción, y se aplica la firma de las 75
Cierra el criterio que la Sesión 84 dejó fijado: **cada asignatura lleva lo que le corresponde**,
y ya no quedan capítulos donde el alumno entra sin saber qué va a hacer. **No se tocó ningún banco
de preguntas.**

#### El criterio, aplicado capítulo por capítulo antes de escribir

Los 36 capítulos de Historia y Lenguaje de los tres cursos se revisaron uno por uno contra la regla
—¿abre un modelo que el alumno no tiene?— y el veredicto quedó escrito en
[`docs/veredicto-historia-lenguaje.md`](docs/veredicto-historia-lenguaje.md), que Roberto aprobó
antes de escribir una sola pantalla. **Salieron 24 de 36**, y los 12 descartes son tan
informativos como los aprobados: un capítulo que solo agrupa contenido no necesita que alguien lo
presente.

| | Aprobados | Qué se escribió |
|---|---|---|
| **Historia** | 12 de 16 | 1 mini-clase + 11 introducciones |
| **Lenguaje** | 12 de 20 | 12 introducciones |

**La única mini-clase es `hi3-planeta`** (`HI03 OA 06`, ubicación en el planeta), y lleva práctica
porque es lo único de los 36 que enseña **un procedimiento que el alumno ejecuta** —encontrar algo
con coordenadas— y no un modelo que se explica. Las otras 23 no miden nada.

> Y ahí está la asimetría que sostiene la regla entera, no solo la registra: **una mini-clase
> AGREGA una medición al mapa de dominio del profesor; una introducción NO.** Sin práctica no se
> llama a `registrarOA`, así que no puede ensuciar ningún porcentaje. Por eso Lenguaje —donde 17 de
> 31 OA en 3° y 10 de 25 en 7° son de producción o de hábito— **nunca** lleva mini-clase: su
> práctica mediría si el alumno reconoce una definición y le mandaría al profesor **un número
> engañoso sobre "escritura"**.

El proyecto pasa de 75 a **99 lecciones**: 63 mini-clases y 36 introducciones.

#### Dos widgets nuevos, y uno que no hubo que escribir

`tiempo` (línea de tiempo con hitos alternados) y `oracion` (sujeto y predicado en cajas de colores,
con *¿quién?* y *¿qué hace?* debajo). El catálogo llega a **27**.

**El tercero no se escribió, y esa es la decisión:** `hi3-planeta` necesitaba `globo` y `zonas`, que
viven en **`visuales.js`** —los dibujos estáticos de pregunta— y no en el catálogo de lecciones.
Copiarlos habría sido tener dos versiones de 80 líneas que divergen. Ahora **`montarDiagrama`
consulta los dos catálogos**: si el tipo no está en el suyo, cae al de `visuales.js`. Los dos siguen
siendo catálogos distintos a propósito —uno se arrastra, el otro ilustra— pero una lección tiene
todo el derecho a usar un dibujo estático.

#### ⚠️ El widget de línea de tiempo estaba mal de tres formas, y ninguna la delata un conteo

El test decía *"1 diagrama, dibujado"* y estaba bien dicho. Los tres defectos salieron **mirando la
captura**:

1. **`−300000` no es un año que nadie lea.** Ahora dice **`300.000 a.C.`**, con separador de miles.
2. **El primer rótulo se salía por el borde** y se leía *"neros humanos"*: el texto va centrado en
   su `x`, así que la mitad quedaba fuera del `viewBox`. Ahora se ancla al borde cuando el hito cae
   cerca de un extremo.
3. Los dos hitos de la derecha se encaraman — **y eso se deja así a propósito**: la lección dice
   *"fíjate dónde caen la agricultura y la escritura: en el último tramo"*, y el dibujo lo está
   mostrando. Espaciarlos parejo haría el dibujo más bonito y la lección mentirosa.

> Es la sexta vez que este proyecto tropieza con lo mismo (Sesiones 59, 74, 77, 82, 83). El
> estándar ya lo dice: **un widget se aprueba mirando, no contando.**

#### La firma de las 75, que estaba exportada y sin aplicar

Roberto aprobó las mini-clases en el tablero y exportó, pero **el `revisadas.json` seguía en
Descargas**: los 12 `lecciones.json` estaban en **0 aprobadas**. Se aplicó con el circuito de
siempre (tablero → Exportar → `aplicar-revisadas.py` → regenerar). **75 de 99 marcadas**; las 24
nuevas quedan pendientes, que es lo correcto —se escribieron después de su exportación—.

> **Se encontró revisando antes de commitear, no porque alguien lo pidiera.** Un `revisadas.json`
> sin aplicar es de la familia de fallos que este archivo ya documenta: **no da ningún error y se ve
> exactamente igual que si estuviera aplicado.**

**Dos archivos se reformatearon enteros** (`matematicas-7basico` y `-8basico`, ~900 y ~770 líneas) y
**está bien**: nacieron con `indent=2` y el script ya no detecta el formato sino que **impone el
canónico** —decisión de la Sesión 85, porque conservar lo que se encuentre es justamente el
mecanismo por el que un archivo vuelve a divergir sin que nadie lo vea—. Comprobado que **el
contenido no cambió**: mismas 19 y 17 lecciones, cero diferencias fuera de la marca. Los **29
archivos de `contenido/` quedan canónicos**, así que la próxima firma vuelve a ser 2 líneas por
lección.

⚠️ Y `matematicas-8basico` perdió dos claves de nivel superior (`asignatura`, `unidad`). Se
verificó antes de darlo por bueno: **los tres consumidores leen solo `d.lecciones`**
(`lecciones.js:1042`, `generar-tablero.py:121`, `generar-revision-preguntas.py:171`). Eran
metadatos muertos, y la cabecera canónica es solo lo que alguien lee de verdad.

#### Verificación (con `scripts/cdp.mjs`, jugando)

- **Las 24 lecciones nuevas se recorren enteras** con clics reales: 8° 7/7, 7° 10/10, 3° 7/7.
- **El avance no se movió** en ninguno de los 24 capítulos: las etapas siguen siendo las mismas con
  el nodo 📘 delante.
- **El tablero, en el navegador:** 29 secciones, **99 casillas de lección, 75 marcadas**, y las
  **6 secciones pendientes son exactamente las 24 nuevas** (3+4+5+5+4+3), arriba de todo con
  Vocabulario y Lectura al final. **88 diagramas dibujados.**
- Sin regresión: 20 / 23 / 27 expediciones, motor vivo en los tres, y el guardado de 8° sobrevive
  con sus 777 XP y sus tres claves separadas.
- **Cero errores de consola y cero 404.**

> **Un error de medición propio, y ya con nombre:** medí *"0 casillas de lección"* buscando
> `.lec-card`, y se llaman `details.lec input`. Es el mismo tropiezo que la Sesión 83 con
> `.diag` y la 85 con `lec-diag`: **cuando un conteo da cero, el primer sospechoso es el selector,
> no el producto.**

#### Un push, y por qué

Las Sesiones 75, 76 y 77 fueron en dos pushes porque había un proveedor (`assets/js/`) y unos
consumidores (los forks). **Aquí el orden no importa**: el cambio de `lecciones.js` es aditivo —dos
widgets nuevos y un respaldo que consulta `visuales.js`—, así que un fork nuevo sobre el módulo
viejo simplemente no dibujaría esos dos diagramas, y el módulo nuevo sobre forks viejos no rompe
nada porque nadie lo llama todavía. **Un push basta.**

- **Pendiente de Roberto:** **aprobar las 24 lecciones nuevas** en el tablero (ya salen, y abre
  filtrado en ellas). Después de eso, la **voz de 3°** —ahora ~250 clips ≈ US$0,16— que va
  **después de aprobar, nunca en paralelo, y con autorización explícita porque gasta su cuenta de
  Azure**.
- **El camino crítico sigue siendo el Bloque B:** los bancos de 4°, 5° y 6°.
