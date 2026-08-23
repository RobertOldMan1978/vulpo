# Victoria épica contra el Jefe Final — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el salto directo a recompensas al vencer un Jefe Final por una mini-cinemática de 2 tiempos (caída del villano con música de victoria → recompensas con confeti y aparición escalonada).

**Architecture:** Todo vive en `index.html` (juego de un solo archivo). Se agrega un overlay `#jefe-caida` a pantalla completa para el Tiempo 1, se dispara desde `jefeVictoria()`, y al terminar entrega a la pantalla de recompensas existente (`scr-jefe-win`), enriquecida. La música de victoria se integra al motor `MUSIC` existente (dirigido por pantalla en `contexto()`), con fallback silencioso; el arte "derrotado" usa un campo nuevo por villano con fallback a la imagen normal atenuada.

**Tech Stack:** HTML + CSS + JavaScript puro, sin framework ni build. Motor de música `MUSIC` por `<audio>`. Verificación en el navegador con `python -m http.server` + herramientas del Browser (no hay framework de tests).

## Global Constraints

- Todo el código va en `index.html`. Seguir el estilo compacto existente (funciones cortas, `$('id')` como `getElementById`).
- **Sin commits por tarea:** la regla del proyecto ("orden 66") prohíbe commit/push hasta que Roberto lo pida. Cada tarea termina en **verificación en el navegador**, no en commit. Todo se commitea junto en el próximo orden 66.
- Assets **opcionales con fallback** (como el sistema de música actual): sin arte "derrotado" → imagen normal en grises/atenuada; sin `musica-victoria.mp3` → silencio.
- Respetar `prefers-reduced-motion` en toda animación nueva (sin temblor/caída/confeti; estados finales estáticos).
- La cinemática del Tiempo 1 es **saltable** (tap) y **auto-avanza** (~3 s), con guard contra doble avance.
- Verificación en el navegador: `cd C:/Proyectos/kimun && python -m http.server 8765`, abrir `http://localhost:8765/?qa=1`, y usar `javascript_tool` para disparar `jefeVictoria()` con un `JF` armado desde `CAMPAÑAS`.

---

### Task 1: Datos del villano derrotado y pista de música de victoria

**Files:**
- Modify: `index.html` (los 4 `jefeFinal` en `CAMPAÑAS`; el objeto `MUSIC`)

**Interfaces:**
- Produces: campo `villanoImgDerrotado` (string) en cada `camp.jefeFinal`; clave `victoria` en `MUSIC.srcs`; `MUSIC` reproduce `'victoria'` en la pantalla `scr-jefe-win`.

- [ ] **Step 1: Agregar el campo `villanoImgDerrotado` a los 4 villanos**

En cada `jefeFinal`, tras su línea `derrota:'...',`, agregar la ruta del arte "derrotado":

Historia (tras la `derrota` de El Guardián del Tiempo):
```js
    villanoImgDerrotado:'assets/villano-historia-derrotado.png',
```
Ciencias (tras la `derrota` de La Entropía):
```js
    villanoImgDerrotado:'assets/villano-ciencias-derrotado.png',
```
Lenguaje (tras la `derrota` de El Borrón):
```js
    villanoImgDerrotado:'assets/villano-lenguaje-derrotado.png',
```
Matemáticas (tras la `derrota` de La Incógnita):
```js
    villanoImgDerrotado:'assets/villano-matematicas-derrotado.png',
```

- [ ] **Step 2: Agregar la pista `victoria` al motor de música**

En `MUSIC.srcs`, la última línea es:
```js
   sinfin:'assets/audio/musica-sinfin.mp3' },
```
Reemplazar por:
```js
   sinfin:'assets/audio/musica-sinfin.mp3', victoria:'assets/audio/musica-victoria.mp3' },
```

- [ ] **Step 3: Dirigir la pantalla de victoria a la música `victoria`**

En `MUSIC.contexto(id)`, hoy dice:
```js
   if(id==='scr-jefe-intro'||id==='scr-jefe'||id==='scr-jefe-win') n='jefe';       // jefes de campaña
```
Reemplazar por:
```js
   if(id==='scr-jefe-intro'||id==='scr-jefe') n='jefe';                            // combate del jefe
   else if(id==='scr-jefe-win') n='victoria';                                      // triunfo
```

- [ ] **Step 4: Verificar en el navegador (consola)**

Levantar el server y, con `javascript_tool`, evaluar:
```js
({
  villanos: CAMPAÑAS.map(c=>c.jefeFinal.villanoImgDerrotado),
  victoria: MUSIC.srcs.victoria
})
```
Esperado: 4 rutas `assets/villano-<asig>-derrotado.png` y `assets/audio/musica-victoria.mp3`. Sin errores de consola.

---

### Task 2: Overlay de la caída del villano (Tiempo 1)

**Files:**
- Modify: `index.html` (HTML del overlay junto a `#maestroOverlay`; CSS tras el bloque de la pantalla de derrota `.jl-fase`; JS: `renderCaidaVillano`, `jefeVictoria`)

**Interfaces:**
- Consumes: `camp.jefeFinal` (`villano`, `villanoImg`, `villanoIc`, `villanoImgDerrotado`), `MUSIC.play`, `SND.win`, `otorgarRecompensasCampaña`, `renderJefeVictoria`.
- Produces: `renderCaidaVillano(camp, alTerminar)` — muestra el overlay `#jefe-caida`, corre la animación, arranca `MUSIC.play('victoria')`, auto-avanza a ~3 s o al tap, y al terminar llama `alTerminar()`.

- [ ] **Step 1: Agregar el HTML del overlay**

Tras el bloque `<div id="maestroOverlay" hidden>…</div>` agregar:
```html
<div id="jefe-caida" hidden>
  <div id="jcFlash" class="jc-flash"></div>
  <div id="jcVillano" class="jc-villano"></div>
  <h2 id="jcTexto" class="jc-texto disp"></h2>
</div>
```

- [ ] **Step 2: Agregar el CSS del overlay y sus animaciones**

Tras la regla `.jl-fase{…}` (bloque de la pantalla de derrota) agregar:
```css
/* Jefe Final · overlay de caída del villano (Tiempo 1 de la victoria) */
#jefe-caida{position:fixed;inset:0;z-index:100000;display:flex;flex-direction:column;align-items:center;
  justify-content:center;gap:18px;background:radial-gradient(circle at 50% 0%,#3d0a16,#0a0410 70%);
  cursor:pointer;padding:20px;text-align:center}
#jefe-caida[hidden]{display:none}
.jc-flash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:2}
.jc-flash.go{animation:jcFlash .5s ease-out}
@keyframes jcFlash{0%{opacity:0}18%{opacity:.9}100%{opacity:0}}
.jc-villano{width:220px;height:220px;display:grid;place-items:center;font-size:120px;position:relative;z-index:1}
.jc-villano img{width:220px;height:220px;object-fit:contain;filter:drop-shadow(0 0 22px #ff4d6a)}
.jc-villano.jc-shake{animation:jefeShake .26s}
.jc-villano.caido{animation:jcCaida 1.1s cubic-bezier(.5,0,.7,1) forwards}
@keyframes jcCaida{0%{transform:translateY(0) rotate(0)}100%{transform:translateY(26px) rotate(8deg)}}
/* solo el fallback (imagen normal) se atenúa para leerse como "derrotado" */
.jc-villano.jc-fallback.caido img{filter:grayscale(.85) brightness(.6) drop-shadow(0 0 22px #ff4d6a);transition:filter 1.1s ease}
.jc-texto{color:#fff;font-size:26px;opacity:0;z-index:1}
.jc-texto.show{animation:jcTexto .5s ease-out forwards}
@keyframes jcTexto{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){
  .jc-flash.go{animation:none}
  .jc-villano.caido{animation:none;transform:translateY(26px) rotate(8deg)}
  .jc-texto.show{animation:none;opacity:1}
}
```

- [ ] **Step 3: Escribir `renderCaidaVillano` y ajustar `jefeVictoria`**

Reemplazar la función actual `jefeVictoria()`:
```js
function jefeVictoria(){
 SND.win();
 document.body.classList.remove('en-jefe');
 otorgarRecompensasCampaña(JF.camp); // Fase 4
 renderJefeVictoria();               // pantalla de celebración
}
```
por:
```js
let JC_LOCK=false;
function jefeVictoria(){
 SND.win();
 otorgarRecompensasCampaña(JF.camp); // Fase 4
 renderCaidaVillano(JF.camp, ()=>{   // Tiempo 1: caída; luego recompensas
  document.body.classList.remove('en-jefe');   // el carmesí se conserva hasta aquí
  renderJefeVictoria();
 });
}
// Tiempo 1: overlay a pantalla completa donde el villano cae y arranca la música de victoria.
function renderCaidaVillano(camp, alTerminar){
 const jf=camp.jefeFinal;
 const ov=$('jefe-caida'), vic=$('jcVillano'), txt=$('jcTexto'), fl=$('jcFlash');
 JC_LOCK=false;
 vic.className='jc-villano';                     // estado inicial: imagen de combate
 vic.innerHTML=jf.villanoImg?`<img src="${jf.villanoImg}" alt="${jf.villano}">`:jf.villanoIc;
 txt.className='jc-texto disp'; txt.textContent='¡'+jf.villano+' ha sido derrotado!';
 fl.classList.remove('go');
 ov.hidden=false;
 MUSIC.play('victoria');
 const avanzar=()=>{ if(JC_LOCK)return; JC_LOCK=true; ov.hidden=true; alTerminar(); };
 ov.onclick=avanzar;
 setTimeout(()=>{ fl.classList.add('go'); vic.classList.add('jc-shake'); }, 300);
 setTimeout(()=>{
  const usarFallback=!jf.villanoImgDerrotado;
  const src=jf.villanoImgDerrotado||jf.villanoImg;
  vic.classList.remove('jc-shake');
  vic.innerHTML=jf.villanoImg
   ? `<img src="${src}" alt="${jf.villano}" onerror="this.onerror=null;this.src='${jf.villanoImg}';this.closest('.jc-villano').classList.add('jc-fallback')">`
   : jf.villanoIc;
  if(usarFallback) vic.classList.add('jc-fallback');
  vic.classList.add('caido');
  txt.classList.add('show');
 }, 550);
 setTimeout(avanzar, 3000);
}
```

- [ ] **Step 4: Verificar en el navegador (con y sin arte)**

Con `javascript_tool` (arte "derrotado" aún no existe, así que se prueba el fallback):
```js
(function(){var c=CAMPAÑAS[0];document.body.classList.add('en-jefe');
 JF={camp:c,fase:3,idx:0,preguntas:[],vidaMax:16,vida:0,vidas:3,lock:false};
 jefeVictoria();
 var ov=document.getElementById('jefe-caida');
 return {overlayVisible:!ov.hidden, texto:document.getElementById('jcTexto').textContent,
   enJefe:document.body.classList.contains('en-jefe')};})();
```
Esperado: `overlayVisible:true`, texto "¡El Guardián del Tiempo ha sido derrotado!", `enJefe:true` (carmesí conservado). Tomar screenshot para ver la caída. Luego verificar el **tap** (click en `#jefe-caida`) → el overlay se oculta, `en-jefe` se retira y aparece `scr-jefe-win`. Confirmar sin errores de consola. Repetir el auto-avance esperando ~3 s (o revisar que `scr-jefe-win` quede activo).

---

### Task 3: Recompensas enriquecidas (Tiempo 2)

**Files:**
- Modify: `index.html` (CSS del confeti y la aparición escalonada; JS: `renderJefeVictoria`, helper `confetiVictoria`)

**Interfaces:**
- Consumes: `renderJefeVictoria` (existente), `go`, `MUSIC` (ya reproduce `victoria` por `contexto`).
- Produces: `confetiVictoria()` — lanza confeti a pantalla completa; `renderJefeVictoria` con tarjetas que aparecen escalonadas.

- [ ] **Step 1: Agregar el CSS del confeti y la aparición escalonada**

Tras el CSS agregado en la Task 2 agregar:
```css
/* Jefe Final · Tiempo 2: confeti y aparición escalonada de recompensas */
.confeti{position:fixed;top:-16px;width:9px;height:14px;border-radius:2px;opacity:.95;z-index:100002;
  pointer-events:none;animation:confetiCae 2.2s linear forwards}
@keyframes confetiCae{0%{transform:translateY(0) translateX(0) rotate(0);opacity:1}
  100%{transform:translateY(105vh) translateX(var(--dx,0)) rotate(540deg);opacity:.9}}
.jw-item{opacity:0;animation:jwItemIn .45s ease forwards}
@keyframes jwItemIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){
  .confeti{display:none}
  .jw-item{opacity:1;animation:none}
}
```

- [ ] **Step 2: Escribir `confetiVictoria` y escalonar las recompensas en `renderJefeVictoria`**

Agregar el helper (junto a `renderJefeVictoria`):
```js
function confetiVictoria(){
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const cols=['#ffc93c','#ff4d8d','#4dd8ff','#3ee089','#8f6bff'];
 for(let i=0;i<26;i++){
  const c=document.createElement('span'); c.className='confeti';
  c.style.left=(Math.random()*100)+'%';
  c.style.background=cols[i%cols.length];
  c.style.animationDelay=(Math.random()*0.6).toFixed(2)+'s';
  c.style.setProperty('--dx',Math.round(Math.random()*60-30)+'px');
  document.body.appendChild(c);
  setTimeout(()=>c.remove(),2900);
 }
}
```
En `renderJefeVictoria`, cada tarjeta se arma con `class="jw-item"`; agregar un `animation-delay` por índice para que aparezcan una a una. Cambiar la construcción de `items` para que cada push incluya el delay. Reemplazar el bloque que arma `items` por:
```js
 const items=[];
 const it=(ic,titulo,sub)=>`<div class="jw-item" style="animation-delay:${(items.length*0.15).toFixed(2)}s"><span class="jw-ic">${ic}</span><div><b>${titulo}</b><small>${sub}</small></div></div>`;
 if(sk){const ic=sk.img?`<img src="${sk.img}" alt="${sk.nombre}">`:sk.e;
  items.push(it(ic,'Skin exclusiva',`${sk.nombre} — ya equipable en la tienda`));}
 if(ins) items.push(it(ins.ic,'Insignia',ins.tx));
 items.push(it('👑','Corona dorada',`en la tarjeta de ${camp.asignatura}`));
 items.push(it('🎁','Bono',`+${r.bonoMonedas||0} monedas · +${r.bonoXP||0} XP`));
 $('jwRecompensas').innerHTML=items.join('');
```
Y justo después de `go('scr-jefe-win');` (al final de `renderJefeVictoria`), disparar el confeti:
```js
 confetiVictoria();
```

- [ ] **Step 3: Verificar en el navegador**

Repetir el disparo de `jefeVictoria()` (Task 2, Step 4) y saltar la cinemática (tap) para llegar a `scr-jefe-win`. Confirmar con screenshot: las tarjetas de recompensa aparecen escalonadas, cae confeti, y `MUSIC.actual === 'victoria'`. Evaluar:
```js
({musica: MUSIC.actual, items: document.querySelectorAll('#jwRecompensas .jw-item').length})
```
Esperado: `musica:'victoria'` (o `null` si el archivo no existe aún — fallback silencioso), `items` = 3 o 4 según recompensas. Pulsar "Volver a la campaña" → confirmar que va a `scr-campana` y que `MUSIC.actual` pasa a `'menu'`. Sin errores de consola. Probar `prefers-reduced-motion` (emular) → sin confeti, tarjetas visibles de inmediato.

---

## Notas de cierre

- Al terminar las 3 tareas, actualizar la bitácora y el estado en `CLAUDE.md`, y subir todo (código + spec + plan) en el próximo **orden 66**, informando además al AI Brain (NotebookLM).
- Recordarle a Roberto los assets que debe generar: `assets/villano-{historia,ciencias,lenguaje,matematicas}-derrotado.png` (512px, mismo encuadre) y `assets/audio/musica-victoria.mp3`.
