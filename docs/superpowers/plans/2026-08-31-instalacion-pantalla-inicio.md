# Instalación en la pantalla de inicio — plan de implementación

> **Para quien lo ejecute:** las tareas van en orden y cada una se verifica antes de seguir.
> Los pasos usan casillas (`- [ ]`) para ir marcando.

**Objetivo:** que los tres cursos se puedan instalar como aplicación en el teléfono, con su
ícono, su nombre y sin la barra del navegador, y que el juego le explique al apoderado cómo
hacerlo.

**Arquitectura:** un `manifest.webmanifest` por curso (datos), un ícono generado por script
(recurso) y un módulo compartido `assets/js/instalar.js` que muestra el banner y el paso a paso
(motor). Seis ediciones idénticas en cada `index.html`. **Sin service worker** — ver el spec.

**Stack:** HTML + CSS + JavaScript sin dependencias. Python con Pillow solo para generar el
ícono. Verificación con `scripts/cdp.mjs`.

**Spec:** [`docs/superpowers/specs/2026-08-31-instalacion-pantalla-inicio-design.md`](../specs/2026-08-31-instalacion-pantalla-inicio-design.md)

---

## Reglas de este plan

1. **No se hace `git commit` ni `push`.** En este proyecto eso espera la **orden 66** de Roberto.
   Ningún paso de abajo commitea.
2. **No hay tests unitarios en este proyecto.** La verificación es **corriendo la página** con
   `scripts/cdp.mjs`, porque los 404 no llegan a la consola de forma fiable. Cada tarea termina
   con su comprobación ejecutable.
3. **Las ediciones en los tres forks son byte a byte idénticas** salvo dos valores: la ruta del
   `<link rel="manifest">` y el `nombre` que recibe `INST.init`. Si algo más difiere, está mal.
4. **`INST.init` va PEGADO a la declaración de `SUFIJO`.** Un `const` leído antes de declararse
   mata todo el JavaScript, y el síntoma engaña: la pantalla se ve bien y ningún botón responde.

---

## Estructura de archivos

| Archivo | Responsabilidad | Acción |
|---|---|---|
| `scripts/generar-icono-app.py` | Genera el ícono de la app desde `assets/kimun-512.png` | Crear |
| `assets/icono-512.png` · `assets/icono-192.png` | El ícono del manifiesto | Crear (generado) |
| `juego/manifest.webmanifest` | Identidad de la app de 8° | Crear |
| `7mo/manifest.webmanifest` | Identidad de la app de 7° | Crear |
| `3ro/manifest.webmanifest` | Identidad de la app de 3° | Crear |
| `assets/js/instalar.js` | Banner + pantalla de instrucciones. Compartido | Crear |
| `juego/index.html` · `7mo/index.html` · `3ro/index.html` | Las 6 ediciones de cableado | Modificar |
| `CLAUDE.md` · `pendiente.md` · `README.md` | Registro | Modificar |

---

## Task 1: El ícono de la app

**Files:**
- Create: `scripts/generar-icono-app.py`
- Create: `assets/icono-512.png`, `assets/icono-192.png`

- [ ] **Paso 1: Escribir el generador**

Crear `scripts/generar-icono-app.py`:

```python
# -*- coding: utf-8 -*-
"""Genera el icono de la app instalada a partir de assets/kimun-512.png.

POR QUE NO SE USA kimun-512.png TAL CUAL. Android recorta los iconos a la forma
de su lanzador (circulo, cuadrado redondeado). La cara de Vulpi llena el cuadro
entero y las orejas tocan el borde, asi que al recortarse pierde las puntas de
las orejas y algo de barbilla. Un icono "maskable" necesita que lo importante
quepa en el circulo central del 80%.

La cara se reduce al 80% y se centra sobre su PROPIO color de fondo, leido del
pixel de la esquina, para que el resultado no tenga costura. El archivo original
NO se toca: sigue siendo el favicon y el apple-touch-icon.
"""
import os
import sys

from PIL import Image

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIGEN = os.path.join(RAIZ, "assets", "kimun-512.png")
ESCALA = 0.80  # la zona segura de un icono maskable es el circulo central del 80%

if not os.path.exists(ORIGEN):
    sys.exit("No existe %s" % ORIGEN)

src = Image.open(ORIGEN).convert("RGB")
fondo = src.getpixel((6, 6))
print("fondo detectado: #%02x%02x%02x" % fondo)

for lado in (512, 192):
    lienzo = Image.new("RGB", (lado, lado), fondo)
    cara = int(lado * ESCALA)
    lienzo.paste(src.resize((cara, cara), Image.LANCZOS), ((lado - cara) // 2,) * 2)
    salida = os.path.join(RAIZ, "assets", "icono-%d.png" % lado)
    lienzo.save(salida, optimize=True)
    print("  %-28s %d bytes" % (os.path.basename(salida), os.path.getsize(salida)))
```

- [ ] **Paso 2: Generarlo**

```bash
python scripts/generar-icono-app.py
```

Esperado — el fondo detectado debe ser el durazno de la mascota:

```
fondo detectado: #fdcb7d
  icono-512.png                <N> bytes
  icono-192.png                <N> bytes
```

- [ ] **Paso 3: Comprobar que la cara cabe en el círculo**

```bash
python -c "
from PIL import Image
for f in ['assets/icono-512.png','assets/icono-192.png']:
    im=Image.open(f); w,h=im.size
    assert w==h, f
    # el margen a cada lado debe ser >= el 9% del ancho (mitad del 20% que se recorta)
    m=int(w*(1-0.80)/2)
    assert m >= w*0.09, ('margen insuficiente', f, m)
    print('OK', f, im.size, 'margen', m, 'px')
"
```

Esperado: `OK` en los dos, sin `AssertionError`.

---

## Task 2: Los tres manifiestos

**Files:**
- Create: `juego/manifest.webmanifest`, `7mo/manifest.webmanifest`, `3ro/manifest.webmanifest`

- [ ] **Paso 1: Crear el de 8°**

`juego/manifest.webmanifest`:

```json
{
  "name": "VULPO 8° Básico",
  "short_name": "VULPO 8°",
  "description": "Aprende jugando: Historia, Matemáticas, Ciencias y Lenguaje de 8° básico.",
  "start_url": "/juego/",
  "scope": "/juego/",
  "display": "standalone",
  "background_color": "#1e1747",
  "theme_color": "#1e1747",
  "orientation": "portrait",
  "lang": "es-CL",
  "dir": "ltr",
  "icons": [
    { "src": "/assets/icono-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/assets/icono-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

- [ ] **Paso 2: Crear el de 7°**

`7mo/manifest.webmanifest` — idéntico salvo cuatro valores:

```json
{
  "name": "VULPO 7° Básico",
  "short_name": "VULPO 7°",
  "description": "Aprende jugando: Historia, Matemática, Ciencias y Lenguaje de 7° básico.",
  "start_url": "/7mo/",
  "scope": "/7mo/",
  "display": "standalone",
  "background_color": "#1e1747",
  "theme_color": "#1e1747",
  "orientation": "portrait",
  "lang": "es-CL",
  "dir": "ltr",
  "icons": [
    { "src": "/assets/icono-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/assets/icono-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

- [ ] **Paso 3: Crear el de 3°**

`3ro/manifest.webmanifest`:

```json
{
  "name": "VULPO 3° Básico",
  "short_name": "VULPO 3°",
  "description": "Aprende jugando: Matemática, Historia, Ciencias y Lenguaje de 3° básico.",
  "start_url": "/3ro/",
  "scope": "/3ro/",
  "display": "standalone",
  "background_color": "#1e1747",
  "theme_color": "#1e1747",
  "orientation": "portrait",
  "lang": "es-CL",
  "dir": "ltr",
  "icons": [
    { "src": "/assets/icono-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/assets/icono-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

- [ ] **Paso 4: Validar los tres**

```bash
python -c "
import json
esperado = {'juego':'/juego/','7mo':'/7mo/','3ro':'/3ro/'}
for d,ruta in esperado.items():
    m = json.load(open(d+'/manifest.webmanifest', encoding='utf-8'))
    assert m['start_url']==ruta and m['scope']==ruta, (d, m['start_url'], m['scope'])
    assert m['display']=='standalone', d
    assert len(m['short_name'])<=12, (d,'short_name muy largo, se corta bajo el icono')
    for ic in m['icons']:
        import os; assert os.path.exists(ic['src'].lstrip('/')), (d, ic['src'])
    print('OK', d, m['short_name'], '->', m['start_url'])
"
```

Esperado:

```
OK juego VULPO 8° -> /juego/
OK 7mo VULPO 7° -> /7mo/
OK 3ro VULPO 3° -> /3ro/
```

---

## Task 3: El módulo `assets/js/instalar.js`

**Files:**
- Create: `assets/js/instalar.js`

- [ ] **Paso 1: Escribir el módulo completo**

```js
/* ============================================================================
   VULPO · INSTALAR EN LA PANTALLA DE INICIO  (compartido por los tres cursos)

   POR QUÉ EXISTE. El enlace del curso llega al chat de WhatsApp y se hunde ahí
   en dos días. Un ícono en la pantalla del teléfono es lo que hace que el niño
   vuelva mañana. Instalar se puede desde siempre, pero la opción está escondida
   en el menú del navegador y un apoderado no la encuentra solo.

   POR QUÉ NO HAY UN BOTÓN QUE INSTALE. En iPhone no existe: Safari nunca ofrece
   instalar una web, ni con service worker. La única vía es Compartir → Agregar a
   pantalla de inicio. Así que este módulo no instala: EXPLICA cómo hacerlo, con
   el paso a paso del teléfono que se tenga.

   POR QUÉ VIVE AQUÍ Y NO DENTRO DE CADA JUEGO. Cada curso es un fork del
   index.html: lo que se escribe adentro hay que volver a escribirlo en el
   siguiente. Este archivo se incluye con una línea y se engancha con otra.

   SE LLEVA SU PROPIO CSS. Si sus reglas quedaran sueltas en el <style> de cada
   curso, un nivel nuevo cargaría el módulo, funcionaría, y NO SE VERÍA — sin
   ningún error que mirar.

   LO QUE APORTA CADA CURSO (todo por init, nada por variable global):
     nombre   'VULPO 3°'    el nombre que queda bajo el ícono, para el texto
     sufijo   SUFIJO        la clave de localStorage, para no pisar otro curso
     activo   !SIN_DISCO    false en enlaces de muestra (?solo=, ?m=, ?rev=1) y
                            en el armador: son para que un profesor revise
                            contenido, no para instalar; y como esos modos no
                            escriben en disco, el "no mostrar de nuevo" tampoco
                            funcionaría.

   CÓMO SE INTEGRA EN UN CURSO NUEVO:
     1. <script src="assets/js/instalar.js"></script>  en el <head>
     2. su respaldo vacío en la línea siguiente
     3. <div id="bannerInstalar" class="banner-desafio" hidden></div> en scr-rol
     4. <a href="#" id="lnkInstalar"> junto al enlace de Créditos
     5. INST.init({...})  PEGADO a la declaración de SUFIJO
   ========================================================================== */
(function () {
  'use strict';

  var CSS = ''
    + '.inst-ov{position:fixed;inset:0;background:rgba(8,5,24,.86);z-index:9999;'
    + 'display:flex;align-items:center;justify-content:center;padding:18px;overflow:auto}'
    + '.inst-ov[hidden]{display:none}'
    + '.inst-box{background:var(--panel,#1e1747);border:2px solid var(--gold,#ffc93c);'
    + 'border-radius:18px;padding:18px;max-width:420px;width:100%;color:var(--txt,#f3f0ff)}'
    + '.inst-box h2{font-size:18px;color:var(--gold,#ffc93c);margin:0 0 4px}'
    + '.inst-box .inst-sub{color:var(--dim,#a89fd6);font-size:12px;font-weight:800;margin:0 0 12px}'
    + '.inst-box ol{margin:0 0 14px 20px;padding:0}'
    + '.inst-box li{font-size:14px;font-weight:700;margin:0 0 9px;line-height:1.45}'
    + '.inst-box .inst-nota{color:var(--dim,#a89fd6);font-size:12px;font-weight:700;margin:0 0 12px}'
    + '.inst-btn{background:var(--violet,#8f6bff);color:#fff;border:0;border-radius:10px;'
    + 'padding:11px 14px;font-weight:900;font-size:14px;width:100%;cursor:pointer}';

  /* El paso a paso, por sistema. Los textos van cortos y en segunda persona
     porque los lee un apoderado apurado, no un usuario técnico. */
  var PASOS = {
    ios: ['Toca <b>Compartir</b> ⬆️ en la barra de abajo.',
          'Desliza y toca <b>Agregar a pantalla de inicio</b>.',
          'Toca <b>Agregar</b> arriba a la derecha.'],
    android: ['Toca <b>⋮</b> arriba a la derecha.',
              'Toca <b>Instalar app</b> o <b>Agregar a pantalla de inicio</b>.',
              'Confirma con <b>Instalar</b> o <b>Agregar</b>.'],
    escritorio: ['Busca el ícono de instalar ⊕ al final de la barra de direcciones.',
                 'Si no aparece, abre el menú del navegador y busca <b>Instalar</b>.']
  };

  var INST = { activo: false };
  window.INST = INST;

  var CFG = null;

  /* ¿Ya está instalado? Hacen falta los DOS: Android/Chrome expone el display-mode
     y iOS Safari usa navigator.standalone, que es propietario y no tiene equivalente. */
  function instalado() {
    try {
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true;
    } catch (e) {}
    return window.navigator.standalone === true;
  }

  /* iPadOS 13+ se declara como Macintosh en el userAgent: se delata por el touch. */
  function plataforma() {
    var ua = navigator.userAgent || '';
    if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
    if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return 'ios';
    if (/Android/.test(ua)) return 'android';
    return 'escritorio';
  }

  /* localStorage lanza en modo privado de algunos navegadores, así que las dos
     puntas van envueltas: no poder recordar el cierre no puede romper nada. */
  function clave() { return 'kimun_inst_cerrado' + (CFG.sufijo || ''); }
  function yaCerro() { try { return localStorage.getItem(clave()) === '1'; } catch (e) { return false; } }
  function marcarCerrado() { try { localStorage.setItem(clave(), '1'); } catch (e) {} }

  function inyectarCSS() {
    if (document.getElementById('inst-css')) return;
    var s = document.createElement('style');
    s.id = 'inst-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function abrir() {
    inyectarCSS();
    var ov = document.getElementById('inst-ov');
    if (!ov) {
      ov = document.createElement('div');
      ov.id = 'inst-ov';
      ov.className = 'inst-ov';
      document.body.appendChild(ov);
    }
    var p = plataforma();
    var pasos = PASOS[p].map(function (t) { return '<li>' + t + '</li>'; }).join('');
    var nota = p === 'escritorio'
      ? 'En el computador no todos los navegadores lo permiten. Donde de verdad sirve es en el teléfono.'
      : 'Después va a aparecer <b>' + CFG.nombre + '</b> entre tus aplicaciones, y se abre sin el navegador.';
    ov.innerHTML = ''
      + '<div class="inst-box">'
      + '<h2>📲 Tener VULPO a mano</h2>'
      + '<p class="inst-sub">Queda como una aplicación más del teléfono.</p>'
      + '<ol>' + pasos + '</ol>'
      + '<p class="inst-nota">' + nota + '</p>'
      + '<button class="inst-btn" id="inst-cerrar">Entendido</button>'
      + '</div>';
    ov.hidden = false;
    document.getElementById('inst-cerrar').onclick = function () { ov.hidden = true; };
    ov.onclick = function (e) { if (e.target === ov) ov.hidden = true; };
  }
  INST.abrir = abrir;

  function pintarBanner() {
    var cont = document.getElementById('bannerInstalar');
    if (!cont || yaCerro()) return;
    cont.innerHTML = ''
      + '<h4>📲 Tenlo a mano</h4>'
      + '<p>Agrega <b>' + CFG.nombre + '</b> a la pantalla del teléfono y ábrelo de un toque, '
      + 'sin buscar el enlace.</p>'
      + '<button id="instVer">Ver cómo</button> '
      + '<button id="instNo" style="background:transparent;border:1px solid var(--dim,#a89fd6);'
      + 'color:var(--dim,#a89fd6)">Ahora no</button>';
    cont.hidden = false;
    document.getElementById('instVer').onclick = abrir;
    document.getElementById('instNo').onclick = function () {
      marcarCerrado();
      cont.hidden = true;
    };
  }

  /* El banner se cierra para siempre, así que el enlace junto a Créditos es el
     camino permanente: sin él, quien lo cerró se queda sin forma de instalar. */
  function cablearEnlace() {
    var a = document.getElementById('lnkInstalar');
    if (!a) return;
    a.hidden = false;
    a.onclick = function (e) { e.preventDefault(); abrir(); };
  }

  INST.init = function (cfg) {
    CFG = cfg || {};
    if (!CFG.activo) return;   // enlaces de muestra y armador: no aparece
    if (instalado()) return;   // ya está instalado: no hay nada que ofrecer
    INST.activo = true;
    inyectarCSS();
    cablearEnlace();
    pintarBanner();
  };
})();
```

- [ ] **Paso 2: Comprobar que es JavaScript válido**

```bash
node --check assets/js/instalar.js && echo "sintaxis OK"
```

Esperado: `sintaxis OK`

- [ ] **Paso 3: Comprobar el balance de comentarios de bloque**

Este proyecto ya perdió código por un `*/` prematuro (Sesión 63) y por un `/*` huérfano
(Sesión 75), y `node --check` **no delata ninguno de los dos**.

```bash
python -c "
s=open('assets/js/instalar.js',encoding='utf-8').read()
a,c=s.count('/*'),s.count('*/')
assert a==c, ('desbalance', a, c)
print('bloques de comentario balanceados:', a)
"
```

Esperado: `bloques de comentario balanceados: 2`

---

## Task 4: Cablear los tres forks

Las seis ediciones. **Se hacen en los tres archivos con las mismas anclas de texto**, que se
verificó que son idénticas en los tres.

**Files:**
- Modify: `juego/index.html`, `7mo/index.html`, `3ro/index.html`

- [ ] **Paso 1: El `<link rel="manifest">` y las metas de Apple**

Ancla (idéntica en los tres, línea 14): `<meta name="theme-color" content="#1e1747">`

Insertar **inmediatamente después**, cambiando solo la ruta según el archivo
(`/juego/`, `/7mo/`, `/3ro/`):

```html
<!-- Instalación en la pantalla de inicio. Un manifiesto POR CURSO: con uno solo en la raíz,
     el ícono abriría siempre el mismo nivel, y un papá con hijos en dos cursos necesita dos.
     ⚠️ RUTA ABSOLUTA: el <base href="/"> de arriba resolvería "manifest.webmanifest" a
     /manifest.webmanifest, que no existe. -->
<link rel="manifest" href="/3ro/manifest.webmanifest">
<!-- iOS ignora display:standalone del manifiesto; necesita estas dos. Sin la primera, la app
     instalada abre CON la barra del navegador y no se siente una app. -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="mobile-web-app-capable" content="yes">
```

- [ ] **Paso 2: El `<script>` y su respaldo vacío**

Ancla (idéntica en los tres): la línea que empieza con
`<script>if(!window.renderVisual)window.renderVisual=function(){return '';};</script>`

Insertar **inmediatamente después**, igual en los tres:

```html
<!-- Ofrecer instalar en la pantalla de inicio, compartido. Nace dormido: INST.init(). -->
<script src="assets/js/instalar.js"></script>
<script>if(!window.INST)window.INST={activo:false,init:function(){},abrir:function(){}};</script>
```

- [ ] **Paso 3: El `<div>` del banner**

Ancla (idéntica en los tres): `<div id="bannerDuelo" class="banner-desafio" hidden></div>`

Insertar **inmediatamente después**, igual en los tres:

```html
<!-- Ofrecimiento de instalar. Va APARTE de los otros dos banners: si hay refuerzo del profe
     y además te desafiaron, un tercer texto adentro los pisaría. Reusa su clase CSS.
     Lo llena INST.init() de assets/js/instalar.js. -->
<div id="bannerInstalar" class="banner-desafio" hidden></div>
```

- [ ] **Paso 4: El `id` de la salida y el enlace permanente**

Ancla A (idéntica en los tres, el primer `<a href="/">` del archivo, dentro de `scr-rol`):

```html
      <a href="/" style="color:var(--dim);font-weight:800;font-size:12px">← Volver a vulpo.cl</a>
```

Reemplazar **solo esa primera aparición** por:

```html
      <a href="/" id="salirWeb" style="color:var(--dim);font-weight:800;font-size:12px">← Volver a vulpo.cl</a>
```

> ⚠️ **El segundo `<a href="/">` del archivo NO se toca.** Es el del fin de la demo, y ahí el
> botón tiene que seguir visible: es el que lleva al contacto comercial.

Ancla B (byte a byte idéntica en los tres):

```html
      <a href="#" id="verCreditos" style="color:var(--cyan);font-weight:800;font-size:12px">Créditos</a>
```

Reemplazar por (agrega el enlace permanente en la misma línea):

```html
      <a href="#" id="lnkInstalar" hidden style="color:var(--cyan);font-weight:800;font-size:12px">📲 Instalar</a>
      <a href="#" id="verCreditos" style="color:var(--cyan);font-weight:800;font-size:12px;margin-left:10px">Créditos</a>
```

- [ ] **Paso 5: La regla CSS de la salida**

Ancla (idéntica en los tres): la línea `*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}`

Insertar **inmediatamente antes**:

```css
/* Corriendo como app instalada, el "Volver a vulpo.cl" del inicio es una fuga: un niño lo
   toca, se le abre el navegador encima y no sabe volver. El del FIN DE LA DEMO no se toca:
   ese es el que lleva al contacto y ahí abrir el navegador es lo que se quiere.
   Va acá y no en instalar.js —única excepción a "un módulo se lleva su CSS"— porque el
   navegador la aplica solo: meterla en el módulo la haría depender de que cargue el JS. */
@media (display-mode: standalone){ #salirWeb{display:none} }
```

- [ ] **Paso 6: La llamada `INST.init`**

Ancla: la línea `const SUFIJO=` de cada archivo (`''` en 8°, `'_7mo'` en 7°, `'_3ro'` en 3°).

Insertar **inmediatamente después**, cambiando solo el nombre (`VULPO 8°`, `VULPO 7°`,
`VULPO 3°`):

```js
/* ⚠️ PEGADO a SUFIJO a propósito, no arriba con las otras constantes: este módulo lo
   necesita, y un const leído antes de declararse mata todo el JavaScript con un síntoma
   que engaña (la pantalla se ve bien y ningún botón responde). Ya mordió cuatro veces. */
INST.init({nombre:'VULPO 3°', sufijo:SUFIJO, activo:!SIN_DISCO});
```

- [ ] **Paso 7: Comprobar que los tres siguen siendo HTML/JS válido**

```bash
for f in juego 7mo 3ro; do
  python -c "
import re,sys
s=open('$f/index.html',encoding='utf-8').read()
js=re.findall(r'<script>(.*?)</script>', s, re.S)
open('/tmp/chk_$f.js','w',encoding='utf-8').write('\n;\n'.join(js))
"
  node --check /tmp/chk_$f.js && echo "$f OK"
done
```

Esperado: `juego OK`, `7mo OK`, `3ro OK`

- [ ] **Paso 8: Comprobar que las ediciones son idénticas entre forks**

```bash
python -c "
import re
piezas = {
 'link manifest': r'<link rel=\"manifest\" href=\"/(juego|7mo|3ro)/manifest\.webmanifest\">',
 'apple-capable': r'<meta name=\"apple-mobile-web-app-capable\" content=\"yes\">',
 'script instalar': r'<script src=\"assets/js/instalar\.js\"></script>',
 'respaldo INST': r'if\(!window\.INST\)window\.INST=',
 'div banner': r'<div id=\"bannerInstalar\" class=\"banner-desafio\" hidden></div>',
 'id salirWeb': r'<a href=\"/\" id=\"salirWeb\"',
 'lnkInstalar': r'<a href=\"#\" id=\"lnkInstalar\" hidden',
 'media standalone': r'@media \(display-mode: standalone\)\{ #salirWeb\{display:none\} \}',
 'INST.init': r'INST\.init\(\{nombre:\'VULPO [873]°\', sufijo:SUFIJO, activo:!SIN_DISCO\}\);',
}
for f in ['juego','7mo','3ro']:
    s=open(f+'/index.html',encoding='utf-8').read()
    for nombre,rx in piezas.items():
        n=len(re.findall(rx,s))
        assert n==1, (f, nombre, 'apariciones:', n)
    # el segundo <a href=\"/\"> (fin de demo) sigue SIN id
    assert len(re.findall(r'<a href=\"/\" style=', s))==1, (f,'el fin de demo perdio su enlace')
    print('OK', f)
"
```

Esperado:

```
OK juego
OK 7mo
OK 3ro
```

---

## Task 5: Verificación en el navegador

**Files:**
- Create: `C:\Users\Rodrigo\AppData\Local\Temp\claude\c--Proyectos-kimun\936b2d86-188e-488e-9bba-c95b184acac1\scratchpad\pasos-instalar.mjs`

- [ ] **Paso 1: Levantar el servidor local**

```bash
python -m http.server 8765
```

- [ ] **Paso 2: Escribir los pasos de verificación**

Crear `pasos-instalar.mjs` en el scratchpad de la sesión (`C:\Users\Rodrigo\AppData\Local\Temp\claude\c--Proyectos-kimun\936b2d86-188e-488e-9bba-c95b184acac1\scratchpad`):

```js
export default async (ev) => {
  const B = 'http://localhost:8765';
  // sufijo de localStorage por curso, igual que el SUFIJO de cada fork
  const cursos = [['8°','/juego/','','hist-cap1'],
                  ['7°','/7mo/','_7mo','hist7-cap1'],
                  ['3°','/3ro/','_3ro','mat3-cap1']];

  // Defensivos a proposito: el Paso 4 corre este MISMO archivo con instalar.js
  // ausente, y ahi los elementos no existen. Un .click() sobre null abortaria la
  // corrida y no podriamos ver lo unico que interesa: que el juego siga vivo.
  const vis  = (id) => ev(`(document.getElementById('${id}')||{hidden:true}).hidden===false`);
  const clic = (id) => ev(`(document.getElementById('${id}')||{click(){}}).click()`);

  for (const [nom, ruta, suf, demo] of cursos) {
    console.log('
=== ' + nom + ' ' + ruta);

    // 1. El manifiesto responde y dice lo que debe
    await ev.ir(B + ruta);
    await ev.espera(1500);
    const man = await ev(`fetch('${ruta}manifest.webmanifest').then(r=>r.ok?r.json():null)`);
    console.log('  manifiesto:', man ? man.short_name + ' -> ' + man.start_url + ' scope ' + man.scope : 'NO CARGA');

    // 2. El <link> resuelve a una URL que existe (el <base href="/"> es la trampa)
    console.log('  <link> resuelve a:', await ev(`document.querySelector('link[rel=manifest]').href`),
                '->', await ev(`fetch(document.querySelector('link[rel=manifest]').href).then(r=>r.status)`));

    // 3. El banner y el enlace permanente aparecen en el inicio
    console.log('  banner visible:', await vis('bannerInstalar'));
    console.log('  enlace permanente visible:', await vis('lnkInstalar'));

    // 4. "Ver como" abre la pantalla con el paso a paso
    await clic('instVer');
    await ev.espera(300);
    console.log('  pasos mostrados:', await ev(`document.querySelectorAll('#inst-ov li').length`));
    await clic('inst-cerrar');

    // 5. "Ahora no" lo cierra y no vuelve al recargar
    await clic('instNo');
    await ev.ir(B + ruta);
    await ev.espera(1500);
    console.log('  tras cerrar y recargar, banner visible:', await vis('bannerInstalar'), '(debe ser false)');
    console.log('  pero el enlace sigue:', await vis('lnkInstalar'), '(debe ser true)');
    await ev(`localStorage.removeItem('kimun_inst_cerrado${suf}')`);   // dejar el disco como estaba

    // 6. NO aparece en enlaces de muestra ni en el armador
    await ev.ir(B + ruta + '?solo=' + demo);
    await ev.espera(1500);
    console.log('  con ?solo= banner visible:', await vis('bannerInstalar'), '(debe ser false)');
    await ev.ir(B + ruta + '?armar=1');
    await ev.espera(1500);
    console.log('  con ?armar=1 banner visible:', await vis('bannerInstalar'), '(debe ser false)');
  }

  console.log('
=== excepciones de consola:', ev.consola.filter(l => l.includes('EXCEPCION')).length);
  console.log('=== 404 / fallos de red:', JSON.stringify(ev.fallos));
};
```

- [ ] **Paso 3: Correrlo**

```bash
node scripts/cdp.mjs about:blank C:\Users\Rodrigo\AppData\Local\Temp\claude\c--Proyectos-kimun\936b2d86-188e-488e-9bba-c95b184acac1\scratchpad\pasos-instalar.mjs
```

Esperado, para cada curso:

```
  manifiesto: VULPO 3° -> /3ro/ scope /3ro/
  <link> resuelve a: http://localhost:8765/3ro/manifest.webmanifest -> 200
  banner visible: true
  enlace permanente visible: true
  pasos mostrados: 2        (escritorio; en móvil emulado son 3)
  tras cerrar y recargar, banner visible: false
  pero el enlace sigue: true
  con ?solo= banner visible: false (debe ser false)
  con ?armar=1 banner visible: false (debe ser false)
```

Y al final: **`excepciones de consola: 0`** y **`404 / fallos de red: []`**.

- [ ] **Paso 4: Probar con `instalar.js` AUSENTE**

Es la regla que este proyecto pagó con `revision.js`: un `<script src>` que no carga mata todo
el JavaScript, y la pantalla se ve bien igual.

```bash
mv assets/js/instalar.js assets/js/instalar.js.off
node scripts/cdp.mjs about:blank C:\Users\Rodrigo\AppData\Local\Temp\claude\c--Proyectos-kimun\936b2d86-188e-488e-9bba-c95b184acac1\scratchpad\pasos-instalar.mjs 2>&1 | grep -E "banner|excepciones|404"
mv assets/js/instalar.js.off assets/js/instalar.js
```

Esperado: el banner queda `false` en los tres, **`excepciones de consola: 0`**, y el único fallo
de red es `instalar.js`. El script no revienta porque `vis()` y `clic()` toleran que los
elementos no existan — sin eso, la corrida abortaría antes de llegar a lo que interesa.
Que el juego siga vivo se comprueba en el paso siguiente.

- [ ] **Paso 5: Regresión — que el juego siga jugándose**

Crear `pasos-regresion.mjs` en el mismo scratchpad:

```js
export default async (ev) => {
  const B = 'http://localhost:8765';
  // Partida sembrada en 8° antes de tocar los otros: el guardado debe quedar intacto.
  await ev.ir(B + '/juego/');
  await ev.espera(1200);
  await ev(`localStorage.setItem('kimun_save', JSON.stringify({nombre:'Test',xp:777,monedas:4242}))`);

  for (const [nom, ruta] of [['8°','/juego/'], ['7°','/7mo/'], ['3°','/3ro/']]) {
    await ev.ir(B + ruta + '?qa=1');
    await ev.espera(1800);
    await ev(`document.getElementById('btnJugador').click()`);
    await ev.espera(900);
    const exps = await ev(`typeof EXPEDICIONES!=='undefined' ? EXPEDICIONES.length : 'MOTOR MUERTO'`);
    const motor = await ev(`!!window.__MOTOR_OK`);
    console.log(nom, 'expediciones:', exps, '| motor vivo:', motor);
  }

  await ev.ir(B + '/juego/');
  await ev.espera(1200);
  console.log('guardado de 8° intacto:', await ev(`JSON.parse(localStorage.getItem('kimun_save')||'{}').xp`), '(debe ser 777)');
  console.log('excepciones:', ev.consola.filter(l => l.includes('EXCEPCION')).length, '| fallos:', JSON.stringify(ev.fallos));
};
```

```bash
node scripts/cdp.mjs about:blank C:\Users\Rodrigo\AppData\Local\Temp\claude\c--Proyectos-kimun\936b2d86-188e-488e-9bba-c95b184acac1\scratchpad\pasos-regresion.mjs
```

Esperado:

```
8° expediciones: 20 | motor vivo: true
7° expediciones: 24 | motor vivo: true
3° expediciones: 27 | motor vivo: true
guardado de 8° intacto: 777 (debe ser 777)
excepciones: 0 | fallos: []
```

---

## Task 6: Registro

**Files:**
- Modify: `CLAUDE.md`, `pendiente.md`, `README.md`

- [ ] **Paso 1: Sumar el módulo al conteo de `CLAUDE.md`**

En la sección **"Cómo se ordenan los archivos: las cinco capas"**, regla 2, la frase dice
*"Hoy son siete módulos"*. Reemplazar esa enumeración por:

```markdown
2. **Lo que se comparte entre cursos va a `assets/js/`, no se copia.** Hoy son ocho módulos:
   `revision.js`, `sensible.js`, `calculo.js`, `visuales.js` (los 11 dibujos), `voz.js` (la
   lectura en voz alta), `niveles.js` (el catálogo de niveles, que solo carga el panel),
   `instalar.js` (el ofrecimiento de agregar el juego a la pantalla del teléfono) y `motor.js`
   (el juego entero: quiz, campañas, jefes, duelo, tienda, guardado). **Siempre con su respaldo
   vacío antes de usarse**, porque un 404 de un `<script src>` mata todo el JavaScript y el
   síntoma engaña: la pantalla se ve bien y ningún botón responde. Cada uno se prueba **con el
   archivo ausente**, no solo presente.
```

- [ ] **Paso 2: La sección nueva de `CLAUDE.md`**

Insertar **después** de la sección "Modelo de acceso (la puerta)" y **antes** de "Tablero de
avance":

```markdown
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
service worker solo agregaría comodidad en Android. Queda para el Bloque C, y **la decisión de
si hace falta se toma probando en un teléfono real**.

**`assets/js/instalar.js`** muestra un banner en el inicio (mismo patrón y CSS que
`#bannerDesafio` y `#bannerDuelo`) y una pantalla con el paso a paso del sistema que detecte.
**No aparece** si ya está instalado, si el papá lo cerró, o con `SIN_DISCO` — o sea nunca en
`?solo=`, `?m=`, `?rev=1` ni `?armar=1`, que son para que un profesor revise contenido. Como el
banner se cierra para siempre, hay además un enlace permanente junto a Créditos.

**Corriendo instalada se oculta el «← Volver a vulpo.cl» del inicio** (`#salirWeb`), que para un
niño es una fuga: lo toca, se le abre el navegador encima y no sabe volver. **El del fin de la
demo se mantiene**, porque es el que lleva al contacto. Es CSS puro
(`@media (display-mode: standalone)`) y vive en el `<style>` de cada fork — **única excepción a
"un módulo se lleva su CSS"**, porque el navegador la aplica solo y meterla en el módulo la haría
depender de que cargue el JavaScript.

**El ícono es propio** (`assets/icono-512.png` / `-192.png`, generados con
`scripts/generar-icono-app.py`): la cara de Vulpi al 80% sobre su fondo durazno, porque Android
recorta a círculo y el `kimun-512.png` original pierde las orejas. Ese original **no se toca**:
sigue siendo el favicon y el `apple-touch-icon`.

⚠️ **Lo que no se puede verificar con `cdp.mjs`: la instalación misma.** Chrome headless no
instala PWAs. Se prueba en un teléfono.
```

- [ ] **Paso 3: `pendiente.md`**

Insertar en el **Bloque C**, justo debajo de la línea
la que empieza con **"Plan completo en `docs/roadmap-tecnico.md` §3"**:

```markdown
> **Lo que YA está hecho y NO es parte de este bloque (31/08):** los tres cursos tienen
> `manifest.webmanifest` propio, ícono de app y el módulo `assets/js/instalar.js`, que le explica
> al apoderado cómo agregarlo a la pantalla del teléfono. **Sin service worker**, porque en
> iPhone no existe la instalación automática ni con él. Lo que este bloque agrega encima es el
> prompt automático de Android y el offline parcial. Spec:
> `docs/superpowers/specs/2026-08-31-instalacion-pantalla-inicio-design.md`.
```

Y en **"Para lanzar con un curso REAL"**, al final del bloque "Del día, según el curso":

```markdown
- **Decirle al curso que se puede instalar.** El juego lo ofrece solo en la pantalla de inicio,
  pero conviene que el mensaje que reparte el enlace lo mencione: es lo que hace que el niño
  vuelva mañana en vez de perder el enlace en el chat.
```

- [ ] **Paso 4: `README.md`**

En la descripción del juego, agregar una línea:

```markdown
- **Se puede instalar en el teléfono:** desde el menú del navegador, «Agregar a pantalla de
  inicio». Queda con su ícono y se abre como una aplicación, sin la barra del navegador. El
  juego mismo explica cómo hacerlo.
```

- [ ] **Paso 5: Comprobar que no quedó ninguna cifra contradictoria**

```bash
grep -rn "siete módulos\|7 módulos" CLAUDE.md pendiente.md docs/*.md
```

Esperado: **sin resultados**. Si aparece alguno, es el conteo de módulos compartidos y hay que
subirlo a ocho.

---

## Lo que queda para Roberto, fuera de este plan

**Probarlo en un teléfono real**, uno Android y uno iPhone: instalar, comprobar que el ícono se
ve completo, que el nombre dice "VULPO 3°" y que abre sin la barra del navegador. Chrome headless
no instala PWAs, así que esto no se puede verificar acá.

**Ese resultado es el que decide si algún día hace falta el service worker** (Bloque C).


---

## Lo que cambió al ejecutarlo (31/08/2026)

El plan se ejecutó completo. Tres desviaciones, todas medidas y no supuestas:

1. ⚠️ **El banner tuvo que quedar de UNA LÍNEA, y es el hallazgo de la ejecución.** El plan lo
   dibujaba con título, párrafo y dos botones. Medido en 375×667 —la pantalla más chica real— con
   el aviso de la puerta encima, empujaba el botón **JUGADOR de 522 px a 658 px de un viewport de
   667**: un niño abría el juego y **no veía entero el botón de jugar**. Compacto queda en
   581 px. **Ningún conteo lo delataba** —sin desborde lateral, cero errores, cero 404, todos los
   elementos presentes—: se vio mirando la captura. Es la tercera vez que este proyecto tropieza
   con lo mismo (Sesiones 59 y 74), y por eso el porqué quedó escrito en el propio
   `instalar.js`, para que nadie lo "mejore" de vuelta a dos líneas.

2. **La comprobación de sintaxis del Paso 7 daba un falso positivo.** El regex
   `<script>(.*?)</script>` capturaba el **comentario HTML** de `motor.js`, que contiene
   literalmente la cadena `<script>` en su texto («Va ANTES del `<script>` inline»). Se corrigió
   quitando los comentarios HTML antes de extraer: `re.sub(r'<!--.*?-->', '', s, flags=re.S)`.
   Con eso, los 5 scripts inline de cada fork son válidos.

3. **7° tiene 23 expediciones, no 24.** La expectativa del plan estaba mal: el 24 es el conteo
   del **armador**, que suma el Reto Sin Fin como `EXTRAS`, y `EXPEDICIONES` no lo incluye.

Y dos cosas que el plan no pedía y se hicieron porque el registro lo exigía:

- **`CLAUDE.md` afirmaba «no hay service worker ni manifiesto»**, y con este trabajo la segunda
  mitad quedó falsa. Corregida, y con una ⚠️ nueva: **instalarlo NO lo hace funcionar sin
  conexión**, que es una confusión fácil y cara si se le dice a un colegio.
- **`pendiente.md` ganó la tarea A22** con su estado y lo que falta (probarlo en teléfono).
