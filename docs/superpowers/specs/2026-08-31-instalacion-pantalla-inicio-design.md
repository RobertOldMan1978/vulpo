# Instalación en la pantalla de inicio — diseño

**Fecha:** 31/08/2026 · **Estado:** aprobado, sin implementar

## El problema, en el escenario real

En pocas semanas empiezan a usarlo niños reales, y el camino de entrada previsto es:
**el enlace llega al chat del curso → un papá lo abre en su celular → le pasa el teléfono al
niño.** Ese camino tiene una fuga: el enlace se hunde en el chat de WhatsApp a los dos días, y
sin un ícono en la pantalla el niño no vuelve.

Hoy alguien *puede* hacer "Agregar a pantalla de inicio", y hasta le queda el ícono correcto
—los tres juegos ya declaran `apple-touch-icon` y un ícono de 512, y los archivos existen y
responden 200 en `vulpo.cl`—. Lo que falta es que **abra como aplicación y no como página web**:
al tocarlo aparece la barra de direcciones del navegador y se nota que es un sitio.

## Por qué esto NO es el Bloque C (la PWA)

El Bloque C está dimensionado como PWA completa, con service worker y offline parcial. Este
trabajo es un subconjunto mucho más chico y **se hace sin service worker**, por una razón que
decide sola:

> **En iPhone no existe la instalación automática, ni con service worker.** Safari nunca ofrece
> instalar una web; la única vía es *Compartir → Agregar a pantalla de inicio*. O sea que **hay
> que explicar el paso a paso de todos modos**, para el 20-25% de familias con iPhone. Si la
> explicación va igual, el service worker solo agrega comodidad en Android y no cambia el flujo.

El service worker queda para el Bloque C, y **la decisión de si hace falta se toma con el dato
en la mano**: después de probar esto en un teléfono real.

## Decisiones tomadas

| Decisión | Elegida | Por qué |
|---|---|---|
| **Alcance** | Manifiesto **+ ayuda dentro del juego** | El problema real no es que no se pueda instalar: es que el papá no encuentra la opción. Un instructivo en el mensaje de WhatsApp se pierde; uno dentro del juego está cuando se necesita |
| **Cómo se ofrece** | **Banner en el inicio**, cerrable | Mismo patrón que `#bannerDesafio` y `#bannerDuelo`, que ya viven ahí. Visible sin ser un peaje |
| **Salidas de la app** | Ocultar «← Volver a vulpo.cl» **del inicio**, mantener el **del fin de la demo** | En el inicio es una fuga accidental: el niño lo toca, se le abre Chrome encima y no sabe volver. Al terminar la demo es el botón comercial que lleva al contacto, y ahí abrir el navegador es lo que se quiere |
| **Ícono** | v3 — la cara al **80%** sobre el durazno `#fdcb7d` | Es el máximo que cabe en la zona segura que exige Android. Medido: el ícono actual pierde las puntas de las orejas y algo de barbilla al recortarse a círculo |
| **Manifiesto** | **Uno por curso**, con `scope` acotado | Ya decidido en `docs/roadmap-tecnico.md` §2.1, y este escenario lo vuelve concreto: un papá con un hijo en 3° y otro en 7° tiene **dos íconos distintos**, cada uno abre el suyo |

**La variante violeta del ícono se descartó por defecto técnico, no por gusto:** la mascota viene
con su fondo durazno opaco pegado, así que sobre el violeta queda un recuadro visible. Separarla
del fondo es trabajo de arte, no de script.

## Qué se construye

| Pieza | Qué es | Capa |
|---|---|---|
| `juego/manifest.webmanifest` · `7mo/…` · `3ro/…` | ~15 líneas de JSON por curso | Datos |
| `assets/icono-192.png` · `assets/icono-512.png` | El ícono v3, generado con script desde `kimun-512.png` | Recursos |
| `assets/js/instalar.js` | Banner + pantalla de instrucciones. **Compartido por los tres** | Motor |
| 6 ediciones en cada `index.html` | El `<link>`, las metas de Apple, el `<div>` del banner, el `<script>` + `init`, el `id="salirWeb"` y su regla CSS | Motor |

**No se toca:** `contenido/`, `supabase/`, el guardado, el quiz, `motor.js`. **Cero backend, cero
contenido, cero `schema.sql`.**

## El manifiesto

Uno por curso, idénticos salvo cuatro valores:

```json
{
  "name": "VULPO 3° Básico",
  "short_name": "VULPO 3°",
  "start_url": "/3ro/",
  "scope": "/3ro/",
  "display": "standalone",
  "background_color": "#1e1747",
  "theme_color": "#1e1747",
  "orientation": "portrait",
  "lang": "es-CL",
  "icons": [
    { "src": "/assets/icono-192.png", "sizes": "192x192",
      "type": "image/png", "purpose": "any maskable" },
    { "src": "/assets/icono-512.png", "sizes": "512x512",
      "type": "image/png", "purpose": "any maskable" }
  ]
}
```

| Curso | `name` | `short_name` | `start_url` y `scope` |
|---|---|---|---|
| 8° | VULPO 8° Básico | VULPO 8° | `/juego/` |
| 7° | VULPO 7° Básico | VULPO 7° | `/7mo/` |
| 3° | VULPO 3° Básico | VULPO 3° | `/3ro/` |

**`name` y `short_name` no son redundantes:** el primero se muestra en el diálogo de instalación,
el segundo es lo que cabe bajo el ícono. Por eso no hubo que elegir entre los dos.

**El `scope` acotado al curso es lo que hace que los tres convivan** en el mismo teléfono. Los
recursos compartidos (`/assets/`, `/contenido/`) se cargan como subrecursos, no como navegación,
así que un scope de `/3ro/` no los estorba.

> ⚠️ **El `<link rel="manifest">` va con ruta ABSOLUTA.** Los tres juegos llevan `<base href="/">`
> —es lo que permitió mover el juego a `/juego/` sin romper 118 rutas relativas— así que
> `href="manifest.webmanifest"` se resolvería a `/manifest.webmanifest` y daría 404. Va
> `href="/3ro/manifest.webmanifest"`.

**`purpose: "any maskable"` en el mismo archivo** es válido y correcto aquí, porque el ícono v3
ya respeta la zona segura y su fondo es opaco: sirve para los dos usos sin duplicar el archivo.

## El módulo `assets/js/instalar.js`

Sigue las tres reglas que el proyecto ya tiene escritas para sus siete módulos compartidos.

**Nace dormido.** No hace nada hasta `INST.init({nombre, sufijo})`. Esa llamada va **pegada a la
declaración de `SUFIJO`**, nunca arriba con las otras constantes: un `const` leído antes de
declararse mata todo el JavaScript, y esa trampa mordió cuatro veces en una semana
(`CALC.init`, `EXTRAS`, `HAY_DIFICIL`).

**Se lleva su CSS**, con clases propias (`.inst-*`) que usan las variables `--gold` y `--violet`
—presentes en el `:root` de los tres, verificado—. Si sus reglas quedaran sueltas en el `<style>`
de cada fork, un curso nuevo cargaría el módulo, funcionaría y **no se vería**, sin ningún error.

**Lleva respaldo vacío.** Un `<script src>` que da 404 mata todo el JavaScript del juego, y el
síntoma engaña: la pantalla se ve bien y ningún botón responde. Se prueba **con el archivo
ausente**, no solo presente.

### Cuándo NO aparece

Cuatro casos, y cada uno tiene su motivo:

1. **Ya está instalado** — `matchMedia('(display-mode: standalone)').matches` en Android,
   `navigator.standalone === true` en iOS Safari. Hacen falta los dos: son mecanismos distintos.
2. **El papá lo cerró** — se recuerda en `localStorage` con el sufijo del curso
   (`kimun_inst_cerrado` + `SUFIJO`), igual que el resto del guardado. Así 3° y 8° no se pisan.
3. **`SIN_DISCO`** (`PRUEBA || ARMAR`) — o sea nunca en `?solo=`, `?m=`, `?rev=1` ni `?armar=1`.
   Esos enlaces son para que un profesor revise contenido, no para instalar; y como esos modos no
   escriben en disco, el "no mostrar de nuevo" tampoco funcionaría.
4. **Sin `SUFIJO` no arranca** — el módulo exige el sufijo en `init` para no escribir jamás en la
   clave de otro curso.

**Sí aparece con la puerta cerrada.** Instalar es útil incluso para la demo: es justo el papá que
la probó y quiere volver a mostrarla.

### Qué muestra

Detecta el sistema y da el paso a paso correcto:

- **iPhone / iPad:** «Toca **Compartir** ⬆️ abajo, después **Agregar a pantalla de inicio**».
- **Android:** «Toca **⋮** arriba a la derecha, después **Instalar app** o **Agregar a pantalla
  de inicio**».
- **Escritorio:** el ícono de instalar en la barra de direcciones, si el navegador lo ofrece.

## Dos caminos, no uno

El **banner** es el descubrimiento y se cierra para siempre. Pero un papá que lo cerró y después
quiere instalarlo quedaría sin salida, así que va también un **enlace permanente en la pantalla de
inicio**, junto a Créditos, que abre la misma pantalla de instrucciones.

## Las salidas del scope

Los tres juegos tienen tres navegaciones que salen del curso, idénticas en los tres:

| Dónde | Destino | Qué pasa en la app instalada |
|---|---|---|
| `scr-rol` (inicio) | `/` | **Se oculta.** Fuga accidental para un niño |
| `scr-demo-fin` (fin de la demo) | `/` | **Se mantiene.** Es el botón que lleva al contacto |
| Armador (`?armar=1`) | `/profesor.html` | Se mantiene. Solo lo usa el administrador, y el banner ni siquiera aparece ahí |

Hoy **ninguno de los dos enlaces tiene `id`** (son dos `<a href="/">` idénticos, en `scr-rol` y en
`scr-demo-fin`). Se le da uno **solo al del inicio**:

```html
<a href="/" id="salirWeb" style="…">← Volver a vulpo.cl</a>
```

y se resuelve con **CSS puro**, sin JavaScript:

```css
@media (display-mode: standalone) { #salirWeb { display: none } }
```

**Se le pone `id` en vez de usar un selector `#scr-rol a[href="/"]`**, que hoy también funcionaría:
un selector por atributo es una convención implícita, y este proyecto ya pagó esa factura con
`portadaMapa` armando rutas por convención (6 archivos inexistentes, tapados por el `onerror`).

**Esta regla va en el `<style>` del fork, no en el módulo**, y es la única excepción a "un módulo
se lleva su CSS": no depende del módulo en absoluto —el navegador la aplica solo— así que meterla
adentro la haría depender de que el JavaScript cargue para algo que es puro CSS. Es una línea
idéntica en los tres.

## El ícono

Se genera con script desde `assets/kimun-512.png`, que **no se toca**: la cara al 80% centrada
sobre su propio color de fondo, medido en `#fdcb7d`. Salen `icono-512.png` e `icono-192.png`.

Los `<link rel="icon">` y `apple-touch-icon` que ya existen **se dejan como están**: son el
favicon y el ícono de iOS, y funcionan. El ícono nuevo es solo para el manifiesto.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| `instalar.js` en 404 mata el juego | Respaldo vacío, **probado con el archivo ausente** en los tres cursos |
| Manifiesto ausente o inválido | **No rompe nada**: el navegador lo ignora y la página sigue igual. Es la diferencia entre un `<link>` y un `<script>` |
| El `<base href="/">` rompe la ruta del manifiesto | Ruta absoluta, y se verifica que responda 200 |
| Los tres forks divergen | Las seis ediciones son **byte a byte idénticas** salvo dos: la ruta del `<link rel="manifest">` y el `nombre` que recibe `INST.init` |
| El banner tapa los otros dos | Elemento aparte, mismo patrón que `#bannerDuelo` respecto de `#bannerDesafio` |

## Verificación

Con `scripts/cdp.mjs`, en **los tres cursos**:

- Los tres manifiestos responden 200 y son JSON válido, con `start_url` y `scope` distintos.
- El banner aparece en el inicio, se cierra y **no vuelve al recargar**.
- **No** aparece con `?solo=`, `?m=`, `?rev=1` ni `?armar=1`.
- La pantalla de instrucciones muestra el texto de iOS o el de Android según el `userAgent`.
- El enlace permanente junto a Créditos abre la misma pantalla.
- **`#salirWeb` se oculta** con `display-mode: standalone` emulado por CDP, y el del fin de la
  demo **sigue visible**. Es lo único de este trabajo que sí se puede comprobar sin instalar.
- **Con `instalar.js` ausente**, los tres cursos juegan una etapa completa.
- El guardado sigue aislado: partida sembrada en 8°, jugar 3°, volver e intacta.
- **Cero errores de consola y cero 404.**

**Lo que no se puede verificar acá:** la instalación misma. Chrome headless no instala PWAs. Eso
lo prueba Roberto en un Android y en un iPhone, y **ese resultado es el que decide si algún día
hace falta el service worker**.

## Fuera de alcance

- ❌ Service worker y offline — es el Bloque C, y se decide con el resultado de la prueba en
  teléfono.
- ❌ Prompt automático de instalación en Android (`beforeinstallprompt`): requiere service worker.
- ❌ Subir el progreso al servidor. **Dos hermanos en el mismo teléfono siguen compartiendo
  monedas, skins y avance de campaña**, y canjear un segundo código `ALU-` sigue desplazando el
  vínculo del primero. Eso lo arregla el **Bloque D**, no esto — y con el enlace en un chat de
  curso va a aparecer como reporte, así que el mensaje que reparte el enlace no debe prometer que
  se puede compartir el teléfono.
- ❌ Capacitor y tiendas de aplicaciones — Bloque F.
