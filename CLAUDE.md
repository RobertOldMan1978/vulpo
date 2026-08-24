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
    skin "Vulpi Científico".
  - **Lenguaje:** 4 capítulos (15 OA; la U1 "Lectura literaria" partida en 2 —Leer y
    comprender / Mundos literarios— + Textos y medios + Escritura); villano "El Borrón";
    skin "Vulpi Escritor"; insignia "Maestro de las Letras".
  Capa `CAMPAÑAS` data-driven; el motor de campañas es **genérico** (Desafío Extra
  opcional, jefe con título dinámico).
- **Matemáticas · campaña "enseña→desafío" (Sesiones 29 y 31) + "Reto de Cálculo"
  (Sesión 15):** al entrar a Matemáticas se abre su **campaña** con las 4 unidades del año
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
- **Modo Difícil** desbloqueable (10 preguntas, 15 s, 80%, tema oscuro/carmesí).
- Persistencia (localStorage), **tienda de skins** (precios escalonados 110–1250;
  emojis baratos de entrada + skins ilustradas premium, incluidas **7 deportivas**:
  karate, fútbol, básquetbol, vóleibol, ciclismo, tenis, skate), animación de subida
  de nivel, logros, ranking (aún simulado).
- **Audio:** efectos procedurales (Web Audio, sin archivos) + **música de fondo**
  opcional por archivos (`assets/audio/`, con fallback si no están); control separado
  🎵 música / 🔊 efectos, persistido.
- **Duelo 1v1:** en el mismo teléfono y **en línea asíncrono (Supabase)** con
  código de amigo, lista de jugadores, bots de práctica y reto de 24h.

**Contenido (bancos de año completo, TODOS revisados):** Historia **663/663** ·
Matemáticas **603/603 (17 OA)** · Ciencias **534/534 (15 OA)** · Lenguaje
**514/514 (15 OA)**. ~2.314 preguntas, **100% marcadas como revisadas** (aprobación
humana de Roberto, ver Sesión 12). Los 3 bancos nuevos se llevaron a cobertura de
año completo desde el currículum oficial (ver Sesión 9) y se enriquecieron con ítems
de mayor orden por revisión pedagógica (ver Sesión 11); solo 4-5 OA de cada uno
están hoy en una expedición jugable, el resto es reserva. **Herramientas dev:** tablero con clave
(`dev/tablero.html`) y scripts (`consolidar-pool`, `aplicar-revisadas`,
`generar-pdf-preguntas` —por asignatura y con `--sin-revisar`—, `generar-tablero`).

## Decisiones de diseño

### Estética
- Paleta oscura violeta con acentos vibrantes (variables CSS en `:root`):
  `--gold #ffc93c`, `--cyan #4dd8ff`, `--green #3ee089`, `--pink #ff4d8d`,
  `--violet #8f6bff`.
- Tipografías: **Titan One** para títulos y **Nunito** para texto.
- Mobile-first, contenedor máximo de 480px, sin zoom del usuario.
- Fondo con estrellas animadas y degradados radiales.

### Mecánicas
- Progresión por etapas desbloqueables con jefe final.
- Refuerzo positivo: partículas, combos, XP, monedas, estrellas y logros.
- Retroalimentación educativa al fallar (no solo penalización).
- Competencia social: ranking de curso (por ahora simulado).

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

### Más adelante (fuera del alcance inmediato)
- Login y multiusuario.
- Modelo de negocio.
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

### Regla de commits (importante)

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
  pendiente) y subirlo al notebook con el CLI:
  `C:\Users\Rodrigo\.notebooklm-venv\Scripts\notebooklm.exe source add '<ruta-del-resumen>' --notebook '19408e05-1f37-48b6-b398-644519ac019e'`.
  Si la sesión del CLI caducó, avisar a Roberto para que corra `notebooklm.exe login`
  en su terminal (el login interactivo no se puede lanzar desde el asistente).
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

### Tablero de avance (`dev/tablero.html`)

Pantalla para el desarrollador (no para estudiantes) que muestra, por asignatura,
qué OA se están trabajando y el **% de avance por cobertura de preguntas**:

    avance_OA = min(100, preguntas_del_OA / meta_por_OA) · meta por defecto: 8

Se genera a partir de los datos con:

    python scripts/generar-tablero.py

Lee `contenido/<asignatura>/oa.json` y `preguntas.json`, y escribe
`dev/tablero.html` (estático y autocontenido, se abre con doble clic). Regenerar
cada vez que se agreguen o etiqueten preguntas. Está preparado para varias
asignaturas: basta con crear otra carpeta en `contenido/` con esos dos archivos.

**Cómo se llega al tablero (Sesión 22):** ya **no** se entra desde el juego. El
tablero se abre desde el panel del administrador en `profesor.html` (botón
"📊 Tablero de avance"), o escribiendo la dirección directamente. Sigue pidiendo su
propia contraseña, definida en la constante `CLAVE_ADMIN` de
`scripts/generar-tablero.py`; al cambiarla hay que volver a generar el tablero.

> Nota: esa contraseña es un **bloqueo suave** para que los niños no entren al
> tablero, NO seguridad real (es un sitio estático; quien sepa mirar el código
> puede saltársela). El acceso a los datos de cursos y alumnos, en cambio, sí es
> seguridad real: lo protege Supabase Auth desde `profesor.html`.

**En el tablero:** al pinchar un OA se despliegan sus preguntas (solo el
enunciado y la respuesta correcta).

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
adopta el valor del servidor cuando es menor). El progreso de campañas y las skins
siguen siendo del aparato, no del alumno: en un tablet compartido, dos hermanos
comparten avance aunque tengan XP distinto en el ranking.

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

### Consolidar el pool de preguntas (`scripts/consolidar-pool.py`)

Une los archivos verificados, elimina duplicados, **baraja las opciones** (evita
el sesgo de posición), asigna IDs por OA y escribe `preguntas.json`.

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
- Cobertura: `preguntas / 25` por OA.
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
- **Cuidado al editar el esquema:** `gen_random_uuid()` es nativa de PostgreSQL y no
  necesita nada especial, pero si alguna función vuelve a usar pgcrypto (`crypt`,
  `gen_salt`) necesita `set search_path = public, extensions`, porque en Supabase esa
  extensión no vive en `public`.
- **Pendiente:** notificaciones push.

## Trámites pendientes (fuera del código)

> **Recordar estos dos puntos CADA VEZ que se revisen los pendientes del proyecto.**
> No son tareas de programación, pero bloquean el lanzamiento a producción.

1. **Registrar la marca VULPO en INAPI.** El 2026-08-18 se verificó que estaba
   *disponible*, pero **no está registrada**. Mientras no se inscriba, cualquiera puede
   registrarla primero y el proyecto quedaría en el mismo problema que con KIMÜN. Clases
   relevantes: software y educación. Conviene hacerlo con un abogado de marcas.
   Trámite: https://www.inapi.cl/marcas

2. **Contratar el dominio propio `vulpo.cl`.** Hoy el juego vive en
   `robertoldman1978.github.io/vulpo/`. **GitHub Pages NO redirige las direcciones
   antiguas** —comprobado: la anterior devuelve 404—, así que cualquier cambio de nombre
   del repositorio rompe todos los enlaces que estén circulando. Un dominio propio elimina
   esa dependencia y da una dirección estable para colegios y apoderados.
   Trámite: https://www.nic.cl/

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
- **Pendiente (arrastre):** la foto semanal (runbook listo, sin aplicar por ser datos de prueba);
  aprobación pedagógica de los 2 bancos de apoyo; trámites de lanzamiento (INAPI, vulpo.cl). Los 4
  correos a los profesores quedaron **hechos**.
