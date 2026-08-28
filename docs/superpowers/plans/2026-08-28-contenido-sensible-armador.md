# Contenido sensible en el armador (A7) — Plan de implementación

> **Para el que ejecuta:** SUB-SKILL requerido: usar superpowers:subagent-driven-development
> (recomendado) o superpowers:executing-plans, tarea por tarea. Los pasos usan casillas
> (`- [ ]`) para seguimiento.

**Objetivo:** el armador de enlaces de muestra (`?armar=1`) muestra qué capítulos tocan contenido
sensible (leyenda por nivel + emojis por capítulo + resumen de lo incluido), para que quien arma un
enlace decida informado qué envía. Solo transparencia; la casilla por capítulo sigue siendo el
control.

**Arquitectura:** un módulo de datos compartido `assets/js/sensible.js` (mapa OA→categoría + las 5
categorías + `deExpedicion`), leído solo por el armador de las tres apps. Respaldo vacío en cada
`index.html` para que un 404 degrade a "sin marcas" sin crashear (patrón de `revision.js`). El
enlace de muestra/venta no cambia.

**Tech Stack:** HTML + JavaScript vanilla, sin build. Verificación con `scripts/cdp.mjs` (Chrome
por CDP). No hay framework de tests unitarios: se verifica corriendo la página.

---

## Reglas del proyecto que aplican a este plan

- **NO se hace commit hasta la orden 66.** Los pasos NO incluyen `git commit`; el commit se hace
  al final de la sesión cuando Roberto lo pida. Cada tarea deja el árbol listo pero sin commitear.
- **Preservar CRLF** en los tres `index.html`. Tras cada edición, confirmar que `git diff` muestra
  solo los hunks pequeños esperados y **no** un reformateo de todo el archivo (señal de que se
  volteó CRLF→LF). Si eso pasa, deshacer y rehacer el hunk con cuidado.
- **Verificar corriendo la página, no leyendo el código.** Cierre de toda verificación: **cero
  errores de consola y cero 404** en la app tocada.
- Las tres apps reciben **el mismo texto** (fork idéntico). Los anclajes están confirmados en las
  mismas líneas: include en la 21, CSS tras la 103, y las líneas de `arrancarArmador`/`armarUrl`
  byte a byte iguales.

---

## Estructura de archivos

- **Crear:** `assets/js/sensible.js` — mapa OA→categoría + `deExpedicion`. Único lugar con el dato.
- **Modificar:** `juego/index.html`, `7mo/index.html`, `3ro/index.html` — cada uno recibe el mismo
  conjunto de 4 ediciones (**Conjunto E**, abajo).
- **Crear (temporal, scratchpad):** un archivo de pasos para `scripts/cdp.mjs`.

---

## Conjunto E — las 4 ediciones idénticas en cada `index.html`

Cada tarea por app aplica exactamente estas cuatro ediciones (mismo `old_string`/`new_string` en
las tres). Se escriben una sola vez aquí; las Tareas 2, 3 y 4 las aplican verbatim.

### E1 · Incluir el módulo + respaldo vacío (junto a revision.js, línea 21)

`old_string`:
```html
<script src="assets/js/revision.js"></script>
```
`new_string`:
```html
<script src="assets/js/revision.js"></script>
<script src="assets/js/sensible.js"></script>
<script>if(!window.SENSIBLE)window.SENSIBLE={cats:{},oa:{},deExpedicion:function(){return[];}};</script>
```

### E2 · CSS de la marca y la leyenda (tras `.chip:active`, línea 103)

`old_string`:
```css
.chip:active{transform:translateY(1px)}
```
`new_string`:
```css
.chip:active{transform:translateY(1px)}
/* Marca de contenido sensible en el armador (assets/js/sensible.js). */
.sens-m{display:inline-block;margin-left:4px;padding:1px 5px;border-radius:6px;font-size:12px;line-height:1.4}
.sens-leyenda{font-size:11px;font-weight:800;color:var(--dim);margin:2px 0 8px;line-height:1.9}
```

### E3 · Leyenda por nivel en `arrancarArmador` (tras la línea de `const activas`)

`old_string`:
```js
 const activas=EXPEDICIONES.filter(e=>e.activa);
```
`new_string`:
```js
 const activas=EXPEDICIONES.filter(e=>e.activa);
 // Leyenda de contenido sensible: solo las categorías presentes en este nivel (assets/js/sensible.js).
 const catsPresentes=Object.keys(SENSIBLE.cats).filter(c=>
   activas.some(e=>SENSIBLE.deExpedicion(e).includes(c)));
 if(catsPresentes.length){
  const ley=document.createElement('div'); ley.className='sens-leyenda';
  ley.innerHTML='<b>Contenido sensible:</b> '+catsPresentes.map(c=>
    `<span style="color:${SENSIBLE.cats[c].color}">${SENSIBLE.cats[c].icono} ${SENSIBLE.cats[c].nombre}</span>`).join('&nbsp;&nbsp;&nbsp;');
  cont.appendChild(ley);
 }
```

### E4 · Emojis por capítulo (la línea del `l.innerHTML`)

`old_string`:
```js
   l.innerHTML=`<input type="checkbox" value="${exp.id}"><span>${i>=0?(i+1)+'. ':''}${nombreMapa(exp)}</span>`;
```
`new_string`:
```js
   const sc=SENSIBLE.deExpedicion(exp);
   const marcas=sc.map(c=>`<span class="sens-m" style="background:${SENSIBLE.cats[c].color}33" title="${SENSIBLE.cats[c].nombre}">${SENSIBLE.cats[c].icono}</span>`).join('');
   l.innerHTML=`<input type="checkbox" value="${exp.id}"><span>${i>=0?(i+1)+'. ':''}${nombreMapa(exp)}</span>${marcas}`;
```

### E5 · Resumen de lo incluido en `armarUrl` (el bloque `$('armarResumen').textContent`)

`old_string`:
```js
 $('armarResumen').textContent = url
   ? ids.length+(ids.length===1?' capítulo':' capítulos')
     +(hasta?' · vence el '+fechaLarga(hasta):' · sin caducidad')
     +(qa?' · con respuestas':'')
     +(rev?' · REVISIÓN de profesor (3 por etapa)':'')
   : '';
```
`new_string`:
```js
 // Categorías sensibles incluidas en los capítulos marcados (assets/js/sensible.js).
 const scat=Object.keys(SENSIBLE.cats).filter(c=>
   ids.some(id=>{const e=EXPEDICIONES.find(x=>x.id===id); return e&&SENSIBLE.deExpedicion(e).includes(c);}))
   .map(c=>SENSIBLE.cats[c].icono+' '+SENSIBLE.cats[c].nombre).join(', ');
 $('armarResumen').textContent = url
   ? ids.length+(ids.length===1?' capítulo':' capítulos')
     +(hasta?' · vence el '+fechaLarga(hasta):' · sin caducidad')
     +(qa?' · con respuestas':'')
     +(rev?' · REVISIÓN de profesor (3 por etapa)':'')
     +(scat?' · incluye: '+scat:'')
   : '';
```

> **Nota:** son cinco ediciones (E1–E5), no cuatro; "Conjunto E" es el nombre del grupo. E3, E4 y
> E5 usan `SENSIBLE.*` sin guardas porque E1 garantiza que `window.SENSIBLE` existe (real o
> respaldo vacío). Con el respaldo, `deExpedicion` devuelve `[]` y `SENSIBLE.cats` es `{}`, así que
> no se dibuja leyenda, marca ni resumen sensible: el armador queda igual que hoy.

---

## Task 1: Crear `assets/js/sensible.js`

**Files:**
- Create: `assets/js/sensible.js`

- [ ] **Step 1: Escribir el módulo**

Contenido exacto del archivo:

```js
/* Contenido sensible — mapa OA→categoría para el armador de enlaces (?armar=1).
   Compartido por juego/, 7mo/ y 3ro/. Espejo-máquina de docs/contenido-sensible.md
   (que lleva la explicación humana y la severidad ALTA/MEDIA/BAJA, que la UI no usa).
   Solo lo lee arrancarArmador. Si este archivo no carga, cada index.html define un
   respaldo vacío, así que el armador degrada a "sin marcas" y nunca crashea. */
(function(){
  var CATS={
    sex:       {icono:'❤️', color:'#ff4d6d', nombre:'Sexualidad'},
    violencia: {icono:'⚔️', color:'#4a4a5e', nombre:'Violencia y muerte'},
    religion:  {icono:'🛐', color:'#ffc93c', nombre:'Religión y creencias'},
    pueblos:   {icono:'🪶', color:'#b5793a', nombre:'Pueblos originarios'},
    sustancias:{icono:'🚭', color:'#4dd8ff', nombre:'Sustancias'}
  };
  var OA={
    // 3° básico
    "HI03 OA 05":["violencia"],
    // 7° básico
    "CN07 OA 01":["sex"], "CN07 OA 02":["sex"], "CN07 OA 03":["sex"],
    "HI07 OA 01":["religion"], "HI07 OA 07":["violencia"], "HI07 OA 11":["religion"],
    "HI07 OA 14":["violencia","pueblos"], "HI07 OA 15":["religion","pueblos"],
    "HI07 OA 19":["religion"], "HI07 OA 20":["pueblos"],
    // 8° básico
    "HI08 OA 02":["religion"], "HI08 OA 05":["violencia","pueblos"],
    "HI08 OA 06":["violencia"], "HI08 OA 07":["violencia","pueblos"],
    "HI08 OA 10":["violencia"], "HI08 OA 11":["violencia","pueblos"],
    "HI08 OA 12":["violencia","pueblos"], "HI08 OA 13":["violencia"],
    "HI08 OA 17":["pueblos"], "CN08 OA 07":["sustancias"]
  };
  window.SENSIBLE={
    cats:CATS, oa:OA,
    /* Categorías presentes en un capítulo, deduplicadas y en el orden canónico de cats.
       Ignora la etapa BOSS (su oa es "BOSS"; sus oas ya están cubiertos por las etapas). */
    deExpedicion:function(exp){
      var set={};
      ((exp && exp.etapas) || []).forEach(function(et){
        var cs=OA[et.oa]; if(cs) cs.forEach(function(c){ set[c]=1; });
      });
      return Object.keys(CATS).filter(function(c){ return set[c]; });
    }
  };
})();
```

- [ ] **Step 2: Prueba de humo en Node (deExpedicion deduplica y ordena canónicamente)**

Run:
```bash
node -e "global.window={}; require('./assets/js/sensible.js'); const S=window.window?window.window.SENSIBLE:window.SENSIBLE; console.log(JSON.stringify(S.deExpedicion({etapas:[{oa:'HI08 OA 07'},{oa:'HI08 OA 08'},{oa:'BOSS',oas:['HI08 OA 07']}]})));"
```
Nota: el módulo asigna a `window.SENSIBLE`; en Node se define `global.window={}` antes de requerir.
Simplificar si hace falta:
```bash
node -e "global.window={}; require('./assets/js/sensible.js'); console.log(JSON.stringify(window.SENSIBLE.deExpedicion({etapas:[{oa:'HI08 OA 07'},{oa:'HI08 OA 08'},{oa:'BOSS'}]})));"
```
Expected (orden canónico, sin duplicar, BOSS ignorado):
```
["violencia","pueblos"]
```

- [ ] **Step 3: Prueba de humo — capítulo sin OA sensible devuelve `[]`**

Run:
```bash
node -e "global.window={}; require('./assets/js/sensible.js'); console.log(JSON.stringify(window.SENSIBLE.deExpedicion({etapas:[{oa:'HI08 OA 03'},{oa:'HI08 OA 04'}]})));"
```
Expected:
```
[]
```

---

## Task 2: Aplicar el Conjunto E a `juego/index.html` (8°) y verificar

**Files:**
- Modify: `juego/index.html` (E1 línea 21, E2 tras 103, E3 tras `const activas` ~3027, E4 línea
  ~3039, E5 bloque `armarResumen` ~3017)

- [ ] **Step 1: Aplicar E1, E2, E3, E4 y E5** (los cinco `old_string`/`new_string` de arriba, verbatim).

- [ ] **Step 2: Confirmar que no se volteó el fin de línea**

Run:
```bash
git diff --stat juego/index.html
```
Expected: pocas líneas cambiadas (del orden de +18/−5), **no** el archivo entero. Si aparece todo el
archivo como cambiado, se volteó CRLF→LF: deshacer (`git checkout -- juego/index.html`) y rehacer.

- [ ] **Step 3: Levantar el servidor estático (si no está corriendo)**

Run (en segundo plano, desde la raíz del repo):
```bash
python -m http.server 8765
```

- [ ] **Step 4: Escribir el archivo de pasos de verificación**

Create: `scratchpad/verif-sensible.mjs` (usar la ruta real del scratchpad de la sesión). Contenido:

```js
export default async (ev) => {
  const R = {};
  await ev.ir('http://localhost:8765/juego/?armar=1');
  await ev.espera(1200);
  R.leyenda   = await ev(`!!document.querySelector('.sens-leyenda')`);
  R.leyText   = await ev(`(document.querySelector('.sens-leyenda')||{}).textContent||''`);
  R.marcas    = await ev(`document.querySelectorAll('#armarLista .sens-m').length`);
  R.caps      = await ev(`document.querySelectorAll('#armarLista label').length`);
  // Marcar todos los capítulos y leer el resumen.
  await ev(`document.querySelectorAll('#armarLista input[type=checkbox]').forEach(c=>{c.checked=true;});
            document.querySelector('#armarLista').dispatchEvent(new Event('change',{bubbles:true}));`);
  await ev.espera(300);
  R.resumen   = await ev(`document.getElementById('armarResumen').textContent`);
  R.incluye   = R.resumen.includes('incluye:');
  console.log('RESULTADO', JSON.stringify(R, null, 2));
  console.log('CONSOLA', JSON.stringify(ev.consola));
  console.log('FALLOS(404)', JSON.stringify(ev.fallos));
};
```

- [ ] **Step 5: Correr la verificación**

Run:
```bash
node scripts/cdp.mjs about:blank scratchpad/verif-sensible.mjs
```
Expected para 8°:
- `leyenda: true`, y `leyText` contiene `Violencia y muerte`, `Pueblos originarios`, `Religión` y
  `Sustancias` (8° tiene `CN08 OA 07` = 🚭 y varios de Historia). No contiene `Sexualidad`.
- `marcas` > 0 (los capítulos de conquista/colonial y el de vida saludable llevan emoji).
- `caps` > 0 y `incluye: true` con el resumen mostrando `· incluye: … 🚭 Sustancias …`.
- `CONSOLA` sin errores. `FALLOS(404)` vacío (`[]`).

Si algo falla, corregir la edición y repetir desde el Step 1.

---

## Task 3: Aplicar el Conjunto E a `7mo/index.html` (7°) y verificar

**Files:**
- Modify: `7mo/index.html` (mismos anclajes: E1 línea 21, E2 tras 103, E3 tras `const activas`
  ~2332, E4 línea ~2344, E5 bloque `armarResumen` ~2322)

- [ ] **Step 1: Aplicar E1, E2, E3, E4 y E5** (los cinco `old_string`/`new_string`, verbatim,
  idénticos a la Tarea 2).

- [ ] **Step 2: Confirmar fin de línea intacto**

Run:
```bash
git diff --stat 7mo/index.html
```
Expected: pocas líneas cambiadas, no el archivo entero. Si no, `git checkout -- 7mo/index.html` y rehacer.

- [ ] **Step 3: Ajustar el archivo de pasos y correr la verificación para 7°**

Editar `scratchpad/verif-sensible.mjs`: cambiar la URL a `http://localhost:8765/7mo/?armar=1`.
Run:
```bash
node scripts/cdp.mjs about:blank scratchpad/verif-sensible.mjs
```
Expected para 7°:
- `leyenda: true`, y `leyText` contiene las **cinco** categorías, incluida `Sexualidad` (7° tiene
  `CN07 OA 01/02/03`).
- `marcas` > 0; el capítulo de Ciencias de reproducción/sexualidad lleva ❤️.
- `incluye: true` al marcar todo, con `❤️ Sexualidad` en el resumen.
- `CONSOLA` sin errores. `FALLOS(404)` vacío.

---

## Task 4: Aplicar el Conjunto E a `3ro/index.html` (3°) y verificar

**Files:**
- Modify: `3ro/index.html` (mismos anclajes: E1 línea 21, E2 tras 103, E3 tras `const activas`
  ~2838, E4 línea ~2850, E5 bloque `armarResumen` ~2828)

- [ ] **Step 1: Aplicar E1, E2, E3, E4 y E5** (verbatim, idénticos a la Tarea 2).

- [ ] **Step 2: Confirmar fin de línea intacto**

Run:
```bash
git diff --stat 3ro/index.html
```
Expected: pocas líneas cambiadas, no el archivo entero. Si no, `git checkout -- 3ro/index.html` y rehacer.

- [ ] **Step 3: Ajustar el archivo de pasos y correr la verificación para 3°**

Editar `scratchpad/verif-sensible.mjs`: cambiar la URL a `http://localhost:8765/3ro/?armar=1`.
Run:
```bash
node scripts/cdp.mjs about:blank scratchpad/verif-sensible.mjs
```
Expected para 3°:
- `leyenda: true`, y `leyText` contiene **solo** `Violencia y muerte` (3° tiene un único OA
  sensible, `HI03 OA 05`). No contiene las otras cuatro.
- `marcas` >= 1 (solo el capítulo de Historia con `HI03 OA 05`).
- `incluye: true` al marcar todo, con `⚔️ Violencia y muerte`.
- `CONSOLA` sin errores. `FALLOS(404)` vacío.

---

## Task 5: Prueba del respaldo vacío y regresión final

**Files:**
- Ninguno permanente (se renombra temporalmente `assets/js/sensible.js`).

- [ ] **Step 1: Simular que `sensible.js` no carga (404)**

Run:
```bash
mv assets/js/sensible.js assets/js/sensible.js.bak
```

- [ ] **Step 2: Verificar que el armador degrada sin crashear (en las tres apps)**

Editar `scratchpad/verif-sensible.mjs`: dejar la URL en `http://localhost:8765/juego/?armar=1`.
Run:
```bash
node scripts/cdp.mjs about:blank scratchpad/verif-sensible.mjs
```
Expected con el respaldo activo:
- `leyenda: false`, `marcas: 0`, `incluye: false` — armador sin marcas, igual que antes de A7.
- `caps` > 0 — la lista de capítulos **sí** se dibujó (el armador no murió).
- `CONSOLA` sin errores. `FALLOS(404)` contiene **solo** `assets/js/sensible.js` (el que
  renombramos), ningún otro 404.

Repetir cambiando la URL a `/7mo/?armar=1` y `/3ro/?armar=1`: mismo resultado (sin marcas, sin
crash, sin error de consola).

- [ ] **Step 3: Restaurar el módulo**

Run:
```bash
mv assets/js/sensible.js.bak assets/js/sensible.js
```

- [ ] **Step 4: Regresión — jugar una etapa real en 8° sin tocar nada del juego normal**

Create/editar `scratchpad/verif-regresion.mjs`:
```js
export default async (ev) => {
  await ev.ir('http://localhost:8765/juego/?qa=1');
  await ev.espera(1500);
  const arranco = await ev(`document.querySelectorAll('.screen').length>0 && !!document.getElementById('nav')`);
  console.log('ARRANCO', arranco);
  console.log('CONSOLA', JSON.stringify(ev.consola));
  console.log('FALLOS(404)', JSON.stringify(ev.fallos.filter(f=>!/portada-|\.mp3|\.mp4/.test(f))));
};
```
Run:
```bash
node scripts/cdp.mjs about:blank scratchpad/verif-regresion.mjs
```
Expected: `ARRANCO true`, `CONSOLA` sin errores, `FALLOS(404)` vacío tras filtrar los 404 benignos
conocidos (portadas de capítulo y audio, que preexisten y los tapa el `onerror`).

- [ ] **Step 5: Limpiar los archivos temporales de verificación**

Run:
```bash
rm -f scratchpad/verif-sensible.mjs scratchpad/verif-regresion.mjs
```
(Usar la ruta real del scratchpad de la sesión.)

- [ ] **Step 6: Actualizar `docs/contenido-sensible.md`**

En la sección "Pendiente (feature)" del doc, reemplazar el párrafo de pendiente por una nota de que
el marcado en el armador **está implementado** (`assets/js/sensible.js` + `arrancarArmador`), que la
decisión se toma al construir el enlace, y que este `.js` debe mantenerse sincronizado con la tabla
de OA de este mismo doc al agregar contenido sensible.

- [ ] **Step 7: (NO commitear)**

El commit se hace en la orden 66, no aquí. Dejar el árbol listo. Para la bitácora de la sesión,
anotar: creado `assets/js/sensible.js`; Conjunto E aplicado a las tres apps; verificado con
`cdp.mjs` (leyenda por nivel, marcas, resumen, respaldo vacío y regresión), cero consola / cero 404.

---

## Auto-revisión del plan (hecha)

- **Cobertura de la spec:** dato compartido (Task 1) · respaldo vacío E1 · CSS E2 · leyenda por
  nivel E3 · emojis por capítulo E4 · resumen E5 · enlace sin tocar (no hay tarea, correcto) ·
  verificación en las tres apps + respaldo + regresión (Tasks 2–5). Todo cubierto.
- **Placeholders:** ninguno; todos los `old_string`/`new_string` y comandos están completos.
- **Consistencia de nombres:** `SENSIBLE`, `SENSIBLE.cats`, `SENSIBLE.oa`, `SENSIBLE.deExpedicion`,
  clases `.sens-m` / `.sens-leyenda` usadas igual en E1–E5, sensible.js y las verificaciones.
