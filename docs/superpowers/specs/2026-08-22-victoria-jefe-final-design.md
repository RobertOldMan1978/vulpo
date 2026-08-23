# Victoria épica contra el Jefe Final — Diseño

**Fecha:** 2026-08-22
**Estado:** aprobado (brainstorming con Roberto)

## Problema

Al vencer a un Jefe Final de campaña, el juego salta directo a la lista de recompensas
(`renderJefeVictoria` → `scr-jefe-win`): una corona emoji, un título y una lista. Es un
final plano para un combate que sí tiene épica (villano ilustrado, música de jefe, fases).
Ya se mejoró la **derrota** (pantalla temática con frase por villano); ahora toca la
**victoria**.

## Objetivo

Convertir la victoria en un momento memorable con una **mini-cinemática de 2 tiempos**:
1. la **caída del villano** (con su arte "derrotado" y música de victoria), y
2. la **entrega de recompensas** enriquecida (música + confeti + aparición escalonada).

## No-objetivos

- No se toca la pantalla de derrota (ya está hecha) ni El Autómata del Reto de Cálculo
  (que ya tiene su propia pantalla de victoria/derrota).
- No se cambian las recompensas ni su lógica (`otorgarRecompensasCampaña`), solo su presentación.
- No se agregan pistas de música por asignatura: una sola pista de victoria sirve para las 4.

## Flujo

Disparado por `jefeVictoria()` (cuando la vida del jefe llega a 0):

1. **Tiempo 1 — Caída del villano (~3 s, overlay a pantalla completa):**
   - Se conserva el fondo carmesí del combate (clase `en-jefe` del `<body>`).
   - Un **overlay** sobre la pantalla del combate muestra al villano: arranca con su
     **imagen de combate** (`villanoImg`) y, con un **destello blanco + temblor**, hace
     *swap* a su **imagen "derrotado"** (`villanoImgDerrotado`), que **cae y se apaga**
     (rota levemente, desatura y baja con fundido).
   - Texto: **"¡{villano} ha sido derrotado!"**.
   - Arranca la **música de victoria** (`MUS.play('victoria')`).
   - **Auto-avanza** al Tiempo 2 tras ~3 s. **Tocar el overlay** salta de inmediato.
2. **Tiempo 2 — Recompensas (`scr-jefe-win`, enriquecida):**
   - La música de victoria **sigue** sonando (no se reinicia).
   - **Confeti dorado** ligero de fondo.
   - Las tarjetas de recompensa (skin, insignia, corona, bono) **aparecen una a una**
     (animación escalonada de entrada).
   - Botón "Volver a la campaña" (igual que hoy); al volver se corta la música de victoria
     (vuelve a la música que corresponda al menú/campaña).

## Assets nuevos (los genera Roberto)

Convención y *fallbacks* (el código funciona aunque falten, como el sistema de música actual):

- **4 imágenes "derrotado"**, mismo tamaño y encuadre que las normales (512px) para que el
  *swap* calce:
  - `assets/villano-historia-derrotado.png`
  - `assets/villano-ciencias-derrotado.png`
  - `assets/villano-lenguaje-derrotado.png`
  - `assets/villano-matematicas-derrotado.png`
  - *Fallback si falta:* se usa `villanoImg` (la normal) con filtro de derrota
    (escala de grises + atenuada), vía `onerror` del `<img>`.
- **1 pista de audio:** `assets/audio/musica-victoria.mp3`.
  - *Fallback si falta:* silencio (solo suena el efecto `SND.win()` actual); el motor de
    música ya tolera archivos ausentes.

## Cambios de datos

- En cada `jefeFinal` de `CAMPAÑAS`: nuevo campo
  `villanoImgDerrotado:'assets/villano-<id>-derrotado.png'` (4 villanos).
- En el motor de música `MUS.srcs`: nueva entrada `victoria:'assets/audio/musica-victoria.mp3'`.

## Unidades de código

- **HTML:** un overlay `#jefe-caida` (a pantalla completa, `position:fixed`, sobre el combate)
  con: contenedor de imagen del villano (`#jcVillano`) y texto (`#jcTexto`). Oculto por defecto.
- **CSS:** clases para el overlay y las animaciones de "caída" (`@keyframes`), el destello,
  el temblor, el confeti del Tiempo 2 y la aparición escalonada de recompensas. Todo respeta
  `prefers-reduced-motion` (sin temblor ni caída; fundido simple).
- **JS:**
  - `renderCaidaVillano(camp, alTerminar)`: pinta el overlay con el villano de `camp`,
    dispara la animación y la música de victoria, arma el auto-avance (~3 s) y el salto por
    *tap*; al terminar (o saltar) oculta el overlay y llama `alTerminar()`. Un *guard* evita
    doble avance (auto + tap).
  - `jefeVictoria()`: en vez de llamar directo a `renderJefeVictoria()`, otorga las
    recompensas (como hoy) y dispara `renderCaidaVillano(JF.camp, renderJefeVictoria)`.
    **Mantiene `en-jefe`** durante el Tiempo 1 (fondo carmesí) y lo **retira al entrar al
    Tiempo 2** (la pantalla de recompensas conserva su fondo normal actual). Hoy `jefeVictoria`
    quita `en-jefe` de inmediato; ese `remove` se mueve al final de la cinemática.
  - `renderJefeVictoria()`: agrega el confeti y la aparición escalonada; ya no reinicia la
    música (la de victoria viene sonando desde el Tiempo 1).
  - `jwBack` (volver): corta la música de victoria y retoma la que corresponda.

## Detalle de animación (Tiempo 1)

Secuencia aproximada (skippable, y colapsada a un fundido si `prefers-reduced-motion`):
- 0.0 s: se muestra `villanoImg` (estado de combate) sobre el carmesí.
- 0.3 s: **destello blanco** + **temblor** (reusar/adaptar `jefeShake`).
- 0.5 s: *swap* a `villanoImgDerrotado`; el villano **rota ~8°, desatura y baja** con fundido
  parcial; aparece el texto "¡{villano} ha sido derrotado!".
- ~3.0 s: auto-avanza a las recompensas.

## Verificación

- Probar en el navegador con los 4 villanos (con y sin arte "derrotado" presente para
  comprobar el *fallback*).
- Confirmar: overlay aparece sobre el carmesí, animación corre, *tap* salta, auto-avance
  funciona, la música de victoria arranca en el Tiempo 1 y sigue en el Tiempo 2, el confeti
  y la aparición escalonada se ven, al volver la música se corta, y sin errores de consola.
- Confirmar `prefers-reduced-motion`: sin temblor/caída, fundido simple, sigue siendo saltable.
