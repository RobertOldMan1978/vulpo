# QR de los enlaces (muestra e inscripción) — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox
> (`- [ ]`). Este proyecto NO usa worktrees ni commit hasta "orden 66": se trabaja en el working
> tree y se commitea al cierre.

**Goal:** Un código QR del enlace, con Vulpi al medio, en los dos lugares donde se genera un enlace
—el armador de muestras (`?armar=1`, en el juego) y el creador de enlaces de inscripción (en
`profesor.html`)—, con un botón para verlo a pantalla completa.

**Architecture:** Un módulo compartido `assets/js/qr.js` que envuelve una librería de QR
auto-hospedada, dibuja el QR como SVG con el logo de Vulpi centrado, y ofrece un overlay a pantalla
completa. Lo cargan los 6 forks del juego (para el armador) y `profesor.html` (para la inscripción),
con respaldo vacío. Sin backend.

**Tech Stack:** `qrcode-generator` (Kazuhiko Arase, MIT, sin dependencias) auto-hospedada en
`assets/vendor/`; SVG dibujado a mano desde la matriz del QR; `scripts/cdp.mjs` + `jsQR` (solo para
verificar) para confirmar que el QR escanea.

**Reglas del proyecto:** cero CDN en runtime (auto-hospedar, como supabase-js); un módulo compartido
con respaldo vacío para no matar la pantalla si el `<script>` da 404; y **el QR se aprueba
ESCANEÁNDOLO**, no mirando que "se dibujó algo".

---

## File Structure

| Archivo | Responsabilidad |
|---|---|
| `assets/vendor/qrcode-generator-1.4.4.min.js` (crear) | La librería de QR, obtenida una vez de cdnjs y guardada local. Solo calcula la matriz de módulos |
| `assets/js/qr.js` (crear) | El módulo: `QR.pintar(elem,url)` y `QR.grande(url)`. Dibuja el SVG + Vulpi, inyecta su CSS |
| `8vo/index.html` … `3ro/index.html` (modificar) | Cargar los dos `<script>` (vendor + qr.js) con respaldo; agregar `#armarQR` y el botón al `scr-armar` |
| `assets/js/motor.js` (modificar) | En `armarUrl()`: repintar el QR cuando cambia el enlace |
| `profesor.html` (modificar) | Cargar los dos `<script>`; en el bloque de inscripción, el QR bajo el enlace + botón grande, repintado en `pintarUrl()` |

⚠️ **Rutas de assets absolutas** (`/assets/...`): el juego usa `<base href="/">` y `profesor.html`
vive en la raíz; una ruta absoluta funciona en los dos. El logo de Vulpi para el centro va como
`/assets/web/vulpo-logo-320.png`.

---

## Task 1: Obtener la librería de QR y auto-hospedarla

**Files:**
- Create: `assets/vendor/qrcode-generator-1.4.4.min.js`

- [ ] **Step 1: Descargar de cdnjs (una sola vez, como se hizo con supabase-js)**

```bash
cd /c/Proyectos/kimun
curl -s -L -o assets/vendor/qrcode-generator-1.4.4.min.js \
  https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js
wc -c assets/vendor/qrcode-generator-1.4.4.min.js   # ~10-15 KB esperado
head -c 120 assets/vendor/qrcode-generator-1.4.4.min.js
```
Expected: un archivo de ~10-15 KB que empieza con el encabezado de la librería (define `qrcode`).
Si viene vacío o es un HTML de error, probar la versión `1.4.4` en jsdelivr:
`https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js`.

- [ ] **Step 2: Confirmar que expone el global `qrcode` en Node**

```bash
node -e "global.window=global; require('./assets/vendor/qrcode-generator-1.4.4.min.js'); const q=qrcode(0,'H'); q.addData('https://vulpo.cl/8vo/?m=abc'); q.make(); console.log('modulos:', q.getModuleCount());"
```
Expected: imprime un número de módulos (p. ej. `modulos: 29`). Si `qrcode is not defined`, la
librería se expone distinto — inspeccionar `head` y ajustar la forma de invocarla (algunos builds
usan `module.exports`). Anotar cómo se invoca, porque el módulo `qr.js` la usará igual.

---

## Task 2: El módulo `assets/js/qr.js`

**Files:**
- Create: `assets/js/qr.js`

- [ ] **Step 1: Escribir el módulo completo**

```javascript
/* QR de los enlaces de VULPO — muestra (armador) e inscripción (panel).
   Dibuja el QR como SVG (escala sin pixelarse en "grande") a partir de la matriz que calcula
   qrcode-generator, con el logo de Vulpi centrado sobre un fondo blanco redondo.
   ⚠️ Corrección de errores ALTA ('H'): es lo que deja tapar el centro con el logo sin que el QR
   deje de leerse. El logo NO pasa de ~22% del lado, o deja de escanear. */
window.QR = (function(){
  const LOGO = '/assets/web/vulpo-logo-320.png';
  function svg(url, px){
    const q = qrcode(0, 'H');          // 0 = versión automática según el largo del dato
    q.addData(url); q.make();
    const n = q.getModuleCount();
    const quiet = 4;                    // margen obligatorio del QR (zona de silencio)
    const total = n + quiet*2;
    const cell = px / total;
    let rects = '';
    for(let r=0;r<n;r++) for(let c=0;c<n;c++) if(q.isDark(r,c))
      rects += `<rect x="${(c+quiet)*cell}" y="${(r+quiet)*cell}" width="${cell}" height="${cell}"/>`;
    // Logo centrado: ~22% del lado, sobre un cuadrado blanco redondeado un poco mayor.
    const lw = px*0.22, lp = px*0.03, box = lw+lp*2, off=(px-box)/2, offL=(px-lw)/2;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 ${px} ${px}">`
      + `<rect width="${px}" height="${px}" fill="#fff"/>`
      + `<g fill="#0b0b1a">${rects}</g>`
      + `<rect x="${off}" y="${off}" width="${box}" height="${box}" rx="${box*0.18}" fill="#fff"/>`
      + `<image href="${LOGO}" x="${offL}" y="${offL}" width="${lw}" height="${lw}"/>`
      + `</svg>`;
  }
  function pintar(elem, url){
    if(!elem) return;
    if(!url){ elem.innerHTML=''; return; }
    try{ elem.innerHTML = svg(url, 220); }catch(e){ elem.innerHTML=''; }
  }
  function grande(url){
    if(!url) return;
    let o = document.getElementById('qrOverlay');
    if(!o){
      o = document.createElement('div'); o.id='qrOverlay';
      o.style.cssText='position:fixed;inset:0;z-index:9999;background:#0b0b1aee;display:flex;'
        +'flex-direction:column;align-items:center;justify-content:center;gap:18px;cursor:pointer';
      document.body.appendChild(o);
      o.addEventListener('click', ()=>{ o.hidden=true; });
    }
    const lado = Math.min(window.innerWidth, window.innerHeight) - 80;
    o.innerHTML = `<div style="background:#fff;padding:16px;border-radius:18px">${svg(url, lado>520?520:lado)}</div>`
      + `<p style="color:#fff;font-family:system-ui,sans-serif;font-weight:700">Escanéalo con la cámara · toca para cerrar</p>`;
    o.hidden=false;
  }
  return { pintar, grande };
})();
```

- [ ] **Step 2: `node --check`**

```bash
node --check assets/js/qr.js && echo OK
```

⚠️ El módulo asume que `qrcode` es un global (lo carga el `<script>` vendor antes). Si la Task 1
mostró que se invoca distinto, ajustar `qrcode(0,'H')` aquí en consecuencia.

---

## Task 3: Cargar los scripts en los 6 forks y en el panel, con respaldo

**Files:**
- Modify: `8vo/index.html`, `7mo/index.html`, `6to/index.html`, `5to/index.html`, `4to/index.html`, `3ro/index.html`, `profesor.html`

- [ ] **Step 1: En cada fork, agregar los dos `<script>` junto a los otros módulos**

Buscar dónde el fork carga `assets/js/sensible.js` (u otro módulo) y agregar, en el mismo orden,
ANTES del `<script>` inline del juego:

```html
<script src="assets/vendor/qrcode-generator-1.4.4.min.js"></script>
<script src="assets/js/qr.js"></script>
```

- [ ] **Step 2: Respaldo vacío en cada fork**

Junto a los otros respaldos (`if(!window.REV)…`), agregar:

```html
<script>if(!window.QR)window.QR={pintar:function(){},grande:function(){}};</script>
```

- [ ] **Step 3: Lo mismo en `profesor.html`**

Agregar los dos `<script>` (con `href` absoluto o relativo según cómo carga `profesor.html` sus
otros assets — usa rutas relativas `assets/...`, así que `assets/vendor/...` y `assets/js/qr.js`), y
el respaldo vacío.

- [ ] **Step 4: Verificar carga (con y sin el archivo)**

Servir y abrir con `cdp.mjs`: `typeof window.QR.pintar === 'function'` en un fork y en el panel.
Renombrar `qr.js` temporalmente y confirmar que la página **sigue viva** (el respaldo actúa), y que
el único fallo de red es su 404. Restaurar.

---

## Task 4: Integrar en el armador (muestra)

**Files:**
- Modify: los 6 forks (HTML del `scr-armar`) y `assets/js/motor.js` (`armarUrl`)

- [ ] **Step 1: Agregar el contenedor del QR y el botón al `scr-armar` de cada fork**

Tras el botón `#armarCopiar` / `#armarProbar` (en `8vo/index.html:~906` y equivalentes), agregar:

```html
<div id="armarQR" style="display:flex;justify-content:center;margin-top:14px"></div>
<button class="btn sec" id="armarQRgrande" style="margin-top:8px">📱 Mostrar QR grande</button>
```

- [ ] **Step 2: En `armarUrl()` (motor.js), repintar el QR cuando cambia el enlace**

Al final de `armarUrl()`, antes del `return url;` (línea ~464), agregar:

```javascript
 if(window.QR){ QR.pintar($('armarQR'), url); }
 const bg=$('armarQRgrande'); if(bg){ bg.disabled=!url; bg.onclick=()=>{ SND&&SND.tap&&SND.tap(); QR.grande(url); }; }
```

- [ ] **Step 3: Verificar en el armador** — servir, abrir `/8vo/?armar=1` con `cdp.mjs`, marcar un
capítulo, y comprobar: `#armarQR svg` existe; al desmarcar todo, el QR desaparece; el botón "Mostrar
grande" abre `#qrOverlay`. **MIRAR** la captura: el QR con Vulpi al medio se ve nítido.

---

## Task 5: Integrar en la inscripción (panel)

**Files:**
- Modify: `profesor.html` (el bloque de inscripción, alrededor de `pintarUrl`, ~1152)

- [ ] **Step 1: Agregar el contenedor y el botón al HTML del bloque de inscripción**

En el `caja.innerHTML` del bloque de inscripción, tras el input `.ins-url` y su botón `.ins-copiar`,
agregar (misma fila de estilos que el resto del bloque):

```html
<div class="ins-qr" style="display:flex;justify-content:center;margin-top:12px"></div>
<button class="btn sec ins-qr-grande" type="button" style="margin-top:8px">📱 Mostrar QR grande</button>
```

- [ ] **Step 2: En `pintarUrl()`, repintar el QR**

```javascript
  function pintarUrl(){
    if(url&&sel&&fila){
      url.value=location.origin+sel.value+'?inscribir='+fila.token;
      if(window.QR) QR.pintar(caja.querySelector('.ins-qr'), url.value);
      const g=caja.querySelector('.ins-qr-grande'); if(g) g.onclick=()=>QR.grande(url.value);
    }
  }
```

⚠️ Si `fila` es null (aún no hay enlace creado), no hay QR — no llamar `QR.pintar` con vacío deja el
contenedor limpio.

- [ ] **Step 3: Verificar en el panel** — con el doble (`panel-demo.py`) y `cdp.mjs`: abrir un curso
con enlace de inscripción, comprobar `.ins-qr svg`, y el botón grande. **MIRAR** que el QR sale con
Vulpi.

---

## Task 6: Verificación final — ESCANEAR el QR, no mirarlo

**Files:** ninguno (verificación)

- [ ] **Step 1: Decodificar el QR generado y confirmar que da la URL exacta**

Con `cdp.mjs`, en `/8vo/?armar=1` con un capítulo marcado: rasterizar el `#armarQR svg` a un canvas
y decodificarlo con **jsQR** (cargado SOLO para el test desde cdnjs, no queda en producción):

```js
// en el archivo de pasos de cdp.mjs, tras generar el QR:
//  - inyectar <script src="https://cdnjs.cloudflare.com/ajax/libs/jsQR/1.4.0/jsQR.js">
//  - dibujar el SVG en un canvas, sacar getImageData, pasarlo a jsQR
//  - devolver el texto decodificado
```
Expected: el texto decodificado **== el valor de `#armarUrl`** (la URL con su token `?m=`). Repetir
con un token largo (varios capítulos + caducidad) para confirmar que la versión grande del QR sigue
decodificándose **con el logo de Vulpi puesto**. Este es el corazón de la verificación: un QR con
logo mal calibrado se dibuja bien y no escanea.

- [ ] **Step 2: Lo mismo para el enlace de inscripción** — decodificar el `.ins-qr` del panel y
confirmar que da `…?inscribir=<token>`.

- [ ] **Step 3: Degradación** — con `qr.js` ausente (renombrado), el armador y el panel siguen: el
enlace, Copiar y Probar intactos; sin QR; el único fallo de red es su 404.

- [ ] **Step 4: Regresión y cierre** — los 6 cursos arrancan (`__MOTOR_OK`), el armador genera su
enlace como antes, `node --check` de `motor.js` y `qr.js`, cero errores de consola. Los 6 forks
reciben las 3 líneas (2 `<script>` + respaldo) **idénticas** — comprobar por diff que no divergen.

---

## Self-review / cobertura del spec

- QR en muestra (armador) → Task 4. QR en inscripción (panel) → Task 5. ✓
- Vulpi al medio, corrección H, ≤~22% → Task 2 (`svg`). ✓
- Mostrar grande (overlay) → Task 2 (`grande`) + botones en 4 y 5. ✓
- Módulo compartido + respaldo → Tasks 2, 3. ✓
- Librería auto-hospedada, cero CDN en runtime → Task 1 (jsQR del test es la única excepción, y no
  queda en producción). ✓
- Verificar escaneando → Task 6. ✓
- `location.origin`, rutas absolutas, enlaces largos → cubiertos en Tasks 2, 4, 6.

## Fuera de alcance (del spec)
- Descargar el QR como imagen.
- QR del código `ALU-` individual.
- Analítica de escaneos.
