# El siguiente paso al fallar — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Al reprobar una etapa, ofrecer el siguiente paso (repaso sin presión / mini-clase) en vez de solo revelar la respuesta, y agregar un comodín 50/50 acotado antes de responder — sin contaminar el mapa de dominio del profesor.

**Architecture:** Todo vive en `juego/index.html` (un solo archivo). Se reusa el motor de quiz existente con dos flags nuevos en el objeto `Q` (`Q.asistidaActual` para el comodín, `Q.repaso` para el modo repaso), hermanos de los flags que ya existen (`Q.leccion`, `Q.desafio`). La pantalla de resultado (`scr-res`) gana un encabezado con el objetivo y un botón "siguiente paso". Cero cambios de backend (Supabase).

**Tech Stack:** HTML/CSS/JS a mano, sin framework ni tests unitarios. **La verificación es en el navegador** (preview en `http://localhost:8765/juego/` + `mcp__Claude_Browser__javascript_tool` + capturas), como todo el proyecto.

**Regla de commits:** este proyecto **no commitea por tarea**. El commit se hace solo con la "orden 66" de Roberto. Cada tarea termina con **verificación en el navegador**, no con `git commit`.

**Spec:** [`docs/superpowers/specs/2026-08-25-siguiente-paso-al-fallar-design.md`](../specs/2026-08-25-siguiente-paso-al-fallar-design.md).

---

## Mapa de archivos

Un único archivo: `juego/index.html`. Zonas que se tocan (anclas aproximadas, verificar antes de editar):

- **CSS** (dentro del `<style>` del `<head>`): estilos del botón de ayuda y de las opciones descartadas.
- **Markup `scr-quiz`** (~línea 945): botón "💡 Ayuda".
- **Markup `scr-res`** (~línea 963): encabezado de objetivo (`resObj`) y botón de siguiente paso (`btnPaso`).
- **`startQuiz`** (~3601): inicializar `Q.comodines`.
- **`pintaPregunta`** (~3610): reset de `Q.asistidaActual`, render del botón de ayuda, y rama sin cronómetro para repaso.
- **`responder`** (~3637): excluir de la medición y de la economía cuando corresponde.
- **`usarComodin`** (nueva): lógica 50/50.
- **`terminarNivel`** (~3736): encabezado de objetivo + botón de siguiente paso al reprobar.
- **`avanzar`** (~3731): rama `Q.repaso` → `finRepaso`.
- **`iniciarRepaso` / `finRepaso`** (nuevas): modo repaso.
- **`abrirMiniClaseDeOA`** (nueva) + **`volverAlCapituloMate`** (~2119): mini-clase de Matemática y su retorno.

---

## Task 1: Comodín 50/50 (pista antes de revelar)

**Files:**
- Modify: `juego/index.html` (CSS `<style>`, markup `scr-quiz` ~959, `startQuiz` ~3604, `pintaPregunta` ~3610, `responder` ~3639, y una función nueva `usarComodin`)

- [ ] **Step 1: CSS del botón de ayuda y las opciones descartadas**

Agregar dentro del `<style>` (junto a los estilos del quiz; ubicar una regla `.opt` existente y pegar cerca):

```css
.btn-ayuda{display:block;margin:10px auto 0;padding:8px 16px;border:0;border-radius:12px;
  font-family:'Nunito',sans-serif;font-weight:800;font-size:14px;cursor:pointer;
  color:#2a1400;background:linear-gradient(180deg,var(--gold),#ff9d3c);box-shadow:0 3px 10px rgba(0,0,0,.3)}
.btn-ayuda:disabled{opacity:.4;cursor:default;filter:grayscale(.4)}
.opt.descartada{opacity:.22;pointer-events:none;text-decoration:line-through}
```

- [ ] **Step 2: Botón de ayuda en el markup de `scr-quiz`**

En `scr-quiz`, justo **después** de `<div class="opts" id="qOpts"></div>` (línea ~956) y antes de `<div class="feedback" id="qFb"></div>`:

```html
    <button class="btn-ayuda" id="btnAyuda" type="button" hidden>💡 Ayuda (2)</button>
```

- [ ] **Step 3: Inicializar los comodines en `startQuiz`**

Reemplazar el cuerpo de `startQuiz` (~3601-3606) por (añade `comodines`):

```javascript
function startQuiz(lvl){
 if(!poolListo(lvl)){alert('Cargando preguntas… intenta de nuevo en un momento.');return;}
 const prg=progAct();
 const c=EXPEDICION[lvl];
 const esLibro=/^(VOC-|AF-)/.test(c.oa||'');
 // 2 comodines por etapa. Solo Normal, no en el nodo jefe (5.º) ni en los libros de apoyo.
 const comodines=(MODO==='normal' && lvl!==N_ETAPAS-1 && !esLibro)?2:0;
 Q={lvl,idx:0,aciertos:0,combo:0,comboMax:0,xpGanado:0,timer:null,t:15,lock:false,preguntas:buildPreguntas(lvl),
    repetida:!!(prg&&prg[lvl]&&prg[lvl].est==='done'), comodines};
 go('scr-quiz');pintaPregunta();}
```

- [ ] **Step 4: Reset del estado por pregunta y render del botón en `pintaPregunta`**

En `pintaPregunta`, al inicio (después de `Q.lock=false;` en ~3611), agregar el reset del flag y el render del botón:

```javascript
 Q.asistidaActual=false;
 // Botón de ayuda 50/50: visible solo si quedan comodines en esta etapa.
 const ba=$('btnAyuda');
 if(Q.comodines>0){ ba.hidden=false; ba.disabled=false; ba.textContent='💡 Ayuda ('+Q.comodines+')'; ba.onclick=usarComodin; }
 else { ba.hidden=true; }
```

- [ ] **Step 5: La función `usarComodin` (50/50)**

Agregar una función nueva junto a `pintaPregunta`/`responder` (p. ej. justo antes de `function responder`):

```javascript
// Comodín 50/50: elimina dos de las tres opciones incorrectas. Marca la pregunta como asistida
// (no se mide en el mapa de dominio). Gratis, tope de Q.comodines por etapa.
function usarComodin(){
 if(Q.lock || !Q.comodines || Q.comodines<=0 || Q.asistidaActual) return;
 const opts=[...document.querySelectorAll('#qOpts .opt')];
 const malas=opts.filter(o=>!o.dataset.correcta);
 // baraja las malas y descarta dos
 for(let i=malas.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[malas[i],malas[j]]=[malas[j],malas[i]];}
 malas.slice(0,2).forEach(o=>{o.classList.add('descartada');o.onclick=null;});
 Q.comodines--; Q.asistidaActual=true; SND.tap();
 const ba=$('btnAyuda');
 if(Q.comodines>0){ ba.textContent='💡 Ayuda ('+Q.comodines+')'; }
 else { ba.disabled=true; ba.textContent='💡 Sin ayudas'; }
}
```

- [ ] **Step 6: Excluir la pregunta asistida de la medición en `responder`**

En `responder` (~3639), reemplazar la línea de registro de dominio:

```javascript
 if(!Q.desafio) registrarOA(P&&P.oa, ok);   // el desafío mide aparte, no toca el mapa de dominio
```

por (agrega `!Q.repaso && !Q.asistidaActual`):

```javascript
 if(!Q.desafio && !Q.repaso && !Q.asistidaActual) registrarOA(P&&P.oa, ok);   // desafío/repaso miden aparte; una pregunta con comodín no se mide
```

- [ ] **Step 7: Verificar en el navegador**

Asegurar preview (`preview_start {name:"kimun"}` si no corre). Navegar a `http://localhost:8765/juego/?qa=1` (desbloquea todo; el comodín igual funciona). Entrar a una campaña normal (p. ej. Historia → Capítulo 1 → etapa 1).

Comprobar con `javascript_tool`:
```javascript
// El botón aparece con 2 comodines y no en jefe:
JSON.stringify({visible:!document.getElementById('btnAyuda').hidden, txt:document.getElementById('btnAyuda').textContent})
```
Esperado: `{"visible":true,"txt":"💡 Ayuda (2)"}`.

Pulsar el comodín (click en `#btnAyuda`), luego:
```javascript
JSON.stringify({descartadas:document.querySelectorAll('#qOpts .opt.descartada').length, txt:document.getElementById('btnAyuda').textContent})
```
Esperado: `{"descartadas":2,"txt":"💡 Ayuda (1)"}` (quedan la correcta + 1 mala).

Verificar consola limpia (`read_console_messages onlyErrors`). Verificar que en Modo Difícil y en el nodo jefe el botón queda oculto (repetir el chequeo `visible` en esos contextos → `false`).

---

## Task 2: Encabezado del objetivo + botón "siguiente paso" en la pantalla de reprobado

Esta tarea agrega los dos elementos nuevos a `scr-res` y los cablea en `terminarNivel`, con el botón de siguiente paso **inerte por ahora** (sus destinos —repaso y mini-clase— llegan en las tareas 3 y 4).

**Files:**
- Modify: `juego/index.html` (markup `scr-res` ~966, `terminarNivel` ~3736)

- [ ] **Step 1: Markup del objetivo y del botón en `scr-res`**

En `scr-res`, dentro de `.resbox`, agregar el encabezado de objetivo **después** de `<h2 id="resTitle">` (línea ~966):

```html
      <p id="resObj" class="res-obj" hidden></p>
```

Y el botón de siguiente paso **después** de `<button class="btn" id="btnNext">…</button>` (línea ~973):

```html
      <button class="btn" id="btnPaso" type="button" style="display:none;background:linear-gradient(180deg,var(--green),#1fa862);color:#04231a"></button>
```

CSS del encabezado (junto al resto del quiz/res en el `<style>`):

```css
.res-obj{color:var(--dim);font-weight:800;font-size:14px;margin:2px 0 8px}
```

- [ ] **Step 2: Cablear el objetivo y el botón al reprobar en `terminarNivel`**

En `terminarNivel`, localizar la línea `const esJefe=Q.lvl===N_ETAPAS-1;` (~3743) y **debajo** agregar las variables de contexto (capturan el estado antes de que un repaso/lección pise `Q`):

```javascript
 const cFail=EXPEDICION[Q.lvl], lvlFail=Q.lvl, oaFail=cFail.oa||'';
 const esLibro=/^(VOC-|AF-)/.test(oaFail);
 const esMate=EXP_ACT && EXP_ACT.asignatura==='Matemáticas';
 const vistos=Q.preguntas.map(p=>p.q);   // enunciados de la etapa fallada, para excluirlos en el repaso
```

Luego, en la rama de reprobado del botón `btnNext` (~3769-3773), reemplazar `()=>startQuiz(Q.lvl)` por `()=>startQuiz(lvlFail)` para que el REINTENTAR sobreviva a que `Q` cambie:

```javascript
 }else{
  $('btnNext').style.display='block';
  $('btnNext').textContent='🔁 REINTENTAR';
  $('btnNext').onclick=()=>startQuiz(lvlFail);
 }
```

Inmediatamente **después** de ese bloque `if(paso){…}else{…}` del botón (antes de `$('btnMap').onclick=…`, ~3774), agregar el encabezado de objetivo y el botón de siguiente paso:

```javascript
 // Siguiente paso al reprobar una etapa de un solo OA (no jefe, no libros).
 if(!paso && !esJefe && !esLibro){
  $('resObj').textContent='Estás practicando: '+(cFail.nombre||'este objetivo');
  $('resObj').hidden=false;
  $('btnPaso').style.display='block';
  if(esMate){ $('btnPaso').textContent='📘 Repasar la mini-clase'; $('btnPaso').onclick=()=>abrirMiniClaseDeOA(oaFail); }
  else      { $('btnPaso').textContent='🧑‍🏫 Repasar sin presión'; $('btnPaso').onclick=()=>iniciarRepaso(lvlFail,vistos); }
 }else{
  $('resObj').hidden=true;
  $('btnPaso').style.display='none';
 }
```

> Nota: `abrirMiniClaseDeOA` e `iniciarRepaso` se definen en las tareas 4 y 3. Hasta entonces el click dará un `ReferenceError`; se acepta durante esta tarea (los destinos llegan enseguida).

- [ ] **Step 3: Verificar en el navegador**

Navegar a `http://localhost:8765/juego/` (sin `?qa`, para reprobar de verdad). Entrar a Historia → Capítulo 1 → etapa 1 y responder mal a propósito 7+ de 10 hasta reprobar. En `scr-res`:
```javascript
JSON.stringify({obj:document.getElementById('resObj').hidden?null:document.getElementById('resObj').textContent, paso:document.getElementById('btnPaso').style.display, txtPaso:document.getElementById('btnPaso').textContent})
```
Esperado: `obj` = "Estás practicando: …", `paso` = "block", `txtPaso` = "🧑‍🏫 Repasar sin presión".

Comprobar que al **pasar** una etapa, `resObj` está oculto y `btnPaso` en `display:none`. Comprobar que en un **libro** (Lenguaje → Vocabulario, o Lectura·Ana Frank) al reprobar **no** aparece `btnPaso`.

---

## Task 3: Modo repaso (Historia / Ciencias / Lenguaje)

**Files:**
- Modify: `juego/index.html` (`pintaPregunta` ~3632 timer, `responder` ~3641 economía, `avanzar` ~3734, y funciones nuevas `iniciarRepaso` / `finRepaso`)

- [ ] **Step 1: `pintaPregunta` sin cronómetro y con tag de repaso**

En `pintaPregunta`, el tag (`$('qTag').textContent = …`, ~3613) ya distingue `Q.leccion`/`Q.desafio`. Agregar la rama de repaso **al inicio** de esa expresión ternaria:

```javascript
 $('qTag').textContent = Q.repaso
   ? `🧑‍🏫 Repaso · Pregunta ${Q.idx+1}/${Q.preguntas.length}`
   : Q.leccion
   ? `📘 ${Q.leccion.titulo} · Pregunta ${Q.idx+1}/${Q.preguntas.length}`
   : Q.desafio
   ? `📣 ${Q.desafio.titulo} · Pregunta ${Q.idx+1}/${Q.preguntas.length}`
   : `${MODO==='dificil'?'🔥 ':''}${N.icono} ${N.nombre} · Pregunta ${Q.idx+1}/${Q.preguntas.length}`;
```

Y el bloque del timer (~3632-3635) se salta en repaso. Reemplazar:

```javascript
 // timer
 clearInterval(Q.timer);Q.t=tiempoInicial();$('qTimer').textContent=Q.t;$('qTimer').className='timer';
 Q.timer=setInterval(()=>{Q.t--;$('qTimer').textContent=Q.t;
  if(Q.t<=5){$('qTimer').classList.add('low');if(Q.t>0)SND.tick();}
  if(Q.t<=0){clearInterval(Q.timer);responder(null,false,P);}},1000);
```

por:

```javascript
 // timer (el repaso no tiene cronómetro: es estudio, no evaluación)
 clearInterval(Q.timer);
 if(Q.repaso){ $('qTimer').style.visibility='hidden'; }
 else{
  $('qTimer').style.visibility='visible';
  Q.t=tiempoInicial();$('qTimer').textContent=Q.t;$('qTimer').className='timer';
  Q.timer=setInterval(()=>{Q.t--;$('qTimer').textContent=Q.t;
   if(Q.t<=5){$('qTimer').classList.add('low');if(Q.t>0)SND.tick();}
   if(Q.t<=0){clearInterval(Q.timer);responder(null,false,P);}},1000);
 }
```

- [ ] **Step 2: `responder` sin economía en repaso**

En `responder`, dentro de la rama `if(ok){…}` (~3643-3645), la línea que calcula y suma XP/monedas:

```javascript
  const xpGan=Q.repetida?Math.max(1,Math.round(pts*0.25)):pts, coinGan=Q.repetida?1:5;   // repeticiones pagan reducido (anti-farmeo)
  Q.xpGanado+=xpGan;S.xp+=xpGan;S.monedas+=coinGan;
```

reemplazar por (repaso no paga):

```javascript
  const xpGan=Q.repaso?0:(Q.repetida?Math.max(1,Math.round(pts*0.25)):pts), coinGan=Q.repaso?0:(Q.repetida?1:5);   // repaso no paga; repeticiones pagan reducido
  Q.xpGanado+=xpGan;S.xp+=xpGan;S.monedas+=coinGan;
```

Y la retroalimentación (~3647) para no mostrar "+0 XP" en repaso:

```javascript
  $('qFb').textContent=`✓ ¡Correcto! +${xpGan} XP`;$('qFb').classList.add('ok');
```

por:

```javascript
  $('qFb').textContent=Q.repaso?'✓ ¡Correcto!':`✓ ¡Correcto! +${xpGan} XP`;$('qFb').classList.add('ok');
```

- [ ] **Step 3: `avanzar` → `finRepaso` al terminar el repaso**

En `avanzar` (~3734), la línea:

```javascript
  Q.idx++;if(Q.idx<Q.preguntas.length)pintaPregunta();
  else if(Q.leccion)finPracticaLeccion();
  else if(Q.desafio)terminarDesafio();else terminarNivel();}
```

reemplazar por (agrega la rama repaso primero):

```javascript
  Q.idx++;if(Q.idx<Q.preguntas.length)pintaPregunta();
  else if(Q.repaso)finRepaso();
  else if(Q.leccion)finPracticaLeccion();
  else if(Q.desafio)terminarDesafio();else terminarNivel();}
```

- [ ] **Step 4: Las funciones `iniciarRepaso` y `finRepaso`**

Agregar junto a `startQuiz` (p. ej. después de `function startQuiz`):

```javascript
// Modo repaso: 10 preguntas nuevas del OA de la etapa fallada (excluye las que ya salieron),
// sin cronómetro, sin reprobar, sin medir dominio y sin pagar. Al terminar vuelve a scr-res.
function iniciarRepaso(lvl, vistos){
 const c=EXPEDICION[lvl];
 const oas=c.oas||[c.oa];
 let banco=[]; oas.forEach(oa=>{ banco=banco.concat(POOL[oa]||[]); });
 const set=new Set(vistos||[]);
 let disp=banco.filter(q=>!set.has(q.pregunta));
 if(disp.length<10) disp=banco;   // salvaguarda: si por alguna razón no alcanzan, usa todo el banco del OA
 const preguntas=pickN(disp,10).map(q=>({q:q.pregunta,ops:q.opciones,ok:q.correcta,tip:q.tip,oa:q.oa}));
 if(!preguntas.length){ go('scr-res'); return; }
 Q={lvl,idx:0,aciertos:0,combo:0,comboMax:0,xpGanado:0,timer:null,t:15,lock:false,preguntas,repaso:{lvl}};
 MODO='normal';
 go('scr-quiz'); pintaPregunta();
}
// Fin del repaso: no mide, no premia. Vuelve a la pantalla de reprobado (con REINTENTAR intacto).
function finRepaso(){
 clearInterval(Q.timer);
 Q={lvl:0,idx:0,aciertos:0,combo:0,comboMax:0,xpGanado:0,timer:null,t:15,lock:false};
 go('scr-res');
}
```

- [ ] **Step 5: Verificar en el navegador**

Navegar a `http://localhost:8765/juego/`. Historia → Cap 1 → etapa 1, reprobar. En `scr-res`, click en "🧑‍🏫 Repasar sin presión". Comprobar:
```javascript
JSON.stringify({pantalla:[...document.querySelectorAll('.screen.on')].map(s=>s.id), tag:document.getElementById('qTag').textContent, timer:getComputedStyle(document.getElementById('qTimer')).visibility, ayuda:document.getElementById('btnAyuda').hidden})
```
Esperado: pantalla `["scr-quiz"]`, tag empieza con "🧑‍🏫 Repaso", timer `hidden`, ayuda `true` (sin comodín en repaso).

Responder algunas mal (ver que muestra explicación) y otras bien (ver que NO suma XP: comparar `S.xp` antes/después). Al terminar las 10, comprobar que vuelve a `scr-res`:
```javascript
[...document.querySelectorAll('.screen.on')].map(s=>s.id)   // ["scr-res"]
```
y que "🔁 REINTENTAR" reinicia la etapa (click y verificar `scr-quiz` con timer visible).

**No-regresión de medición:** con el panel real no accesible aquí, verificar por código que el repaso no llamó a `registrarOA`: tras un repaso, `DOM_BUF` no debe tener el OA del repaso por esas respuestas (inspeccionar `Object.keys(DOM_BUF)` no crece con las respuestas del repaso). Verificar consola limpia.

---

## Task 4: Mini-clase como siguiente paso (Matemática)

**Files:**
- Modify: `juego/index.html` (`volverAlCapituloMate` ~2119, y una función nueva `abrirMiniClaseDeOA`; declarar `TRAS_LECCION`)

- [ ] **Step 1: Variable de retorno y hook en `volverAlCapituloMate`**

Declarar `TRAS_LECCION` junto a `CAP_MATE` (~2096):

```javascript
let CAP_MATE=null;
let TRAS_LECCION=null;   // si está seteada, la mini-clase vuelve aquí en vez de a la lista del capítulo
```

Reemplazar `volverAlCapituloMate` (~2119) por:

```javascript
// Vuelve desde una lección a la lista de su capítulo (o a la campaña). Si TRAS_LECCION está
// seteada (mini-clase abierta desde una etapa reprobada), la consume y va a ese destino.
function volverAlCapituloMate(){
 if(TRAS_LECCION){ const f=TRAS_LECCION; TRAS_LECCION=null; f(); return; }
 if(CAP_MATE)renderLeccionesMate(); else renderCampaña(); go('scr-campana');
}
```

- [ ] **Step 2: La función `abrirMiniClaseDeOA`**

Agregar junto a las funciones de lección (p. ej. después de `iniciarLeccionPorId`, ~2116):

```javascript
// Abre la mini-clase que enseña un OA (buscada por su fromBank.oa / oa). Al terminar o salir,
// vuelve a la pantalla de reprobado (scr-res) para que el alumno reintente la etapa.
async function abrirMiniClaseDeOA(oa){
 await cargarLecciones();
 const l=(LECCIONES||[]).find(x=>(x.fromBank&&x.fromBank.oa===oa) || x.oa===oa);
 if(!l){ go('scr-res'); return; }   // sin mini-clase mapeable: no hay a dónde llevar; se queda en reprobado
 TRAS_LECCION=()=>go('scr-res');
 abrirLeccion(l);
}
```

- [ ] **Step 3: Verificar en el navegador**

Navegar a `http://localhost:8765/juego/?qa=1` (desbloquea Matemática). Entrar a Matemática → campaña → una **expedición** de una unidad (p. ej. Números `mate-exp-numeros`), etapa 1. Salir de `?qa` para reprobar de verdad: mejor navegar a `http://localhost:8765/juego/` y, si la expedición no está desbloqueada, usar `?qa=1` solo para llegar y luego reprobar respondiendo mal (en `?qa` las respuestas se marcan, pero igual se puede clickear la incorrecta).

Reprobar una etapa de Matemática. En `scr-res`:
```javascript
document.getElementById('btnPaso').textContent   // "📘 Repasar la mini-clase"
```
Click en `#btnPaso`. Comprobar que abre la lección:
```javascript
JSON.stringify({pantalla:[...document.querySelectorAll('.screen.on')].map(s=>s.id), titulo:document.getElementById('lecTitulo').textContent})
```
Esperado: pantalla `["scr-leccion"]`, con el título de la unidad correspondiente al OA.

Salir de la mini-clase (botón `lecSalir`) y comprobar que **vuelve a `scr-res`** (no a la lista del capítulo):
```javascript
[...document.querySelectorAll('.screen.on')].map(s=>s.id)   // ["scr-res"]
```
Verificar que "🔁 REINTENTAR" sigue reiniciando la etapa correcta. Consola limpia.

- [ ] **Step 4: No-regresión del flujo normal de lecciones de Matemática**

Verificar que abrir una lección **desde la lista del capítulo** (flujo normal, sin reprobar) sigue volviendo a la lista al terminar/salir (o sea, `TRAS_LECCION` quedó en `null`):
Matemática → una unidad → "¡Aprender!" en una lección → completar/salir → debe volver a `scr-campana` con la lista de lecciones. Confirmar que `TRAS_LECCION===null` tras el flujo.

---

## Task 5: Regresión general y cuidados

**Files:** ninguno (solo verificación).

- [ ] **Step 1: La medición sin comodín no cambió**

En `http://localhost:8765/juego/`, jugar una etapa normal de Historia **sin usar el comodín**, respondiendo (mezcla de bien/mal). Antes de `enviarDominio` (al terminar la etapa), inspeccionar que `DOM_BUF` acumuló `n`/`ok` para el OA exactamente como hoy (una entrada por respuesta). Comparar con el comportamiento previo: 10 respuestas → `DOM_BUF[oa].n===10`.

- [ ] **Step 2: El comodín excluye de la medición**

Jugar una etapa usando 1 comodín en una pregunta. Comprobar que `DOM_BUF[oa].n===9` (la pregunta asistida no se contó), no 10.

- [ ] **Step 3: Contextos excluidos del comodín**

Confirmar que el botón de ayuda **no** aparece en: Modo Difícil, nodo jefe (5.º), Duelo, Desafío de refuerzo, práctica de lección de Matemática, y libros (Vocabulario / Ana Frank). En cada uno: `document.getElementById('btnAyuda').hidden === true`.

- [ ] **Step 4: `EFIMERO` (QA / modo prueba) no mide**

En `http://localhost:8765/juego/?qa=1`, jugar y usar el comodín / hacer un repaso; confirmar que `registrarOA` no acumula (ya retorna temprano por `EFIMERO`) y que nada rompe. Consola limpia.

- [ ] **Step 5: Timers y reentrada**

Verificar que salir del quiz con el ✕ (`btnBack`) durante un repaso no deja timers ni `setTimeout` huérfanos (no hay timer en repaso, pero confirmar que `btnBack` navega bien; hoy `btnBack` maneja `Q.leccion` y `Q.desafio` — el repaso cae al `else` → `go('scr-mapa')`, aceptable). Doble-tap en la última pregunta del repaso no debe romper (el guard `if(!Q||!Q.preguntas)return;` de `avanzar` ya cubre).

---

## Self-review (cobertura del spec)

- **Comodín 50/50, 2/etapa, gratis, solo Normal, no en jefes/duelo/desafío/repaso/libros** → Task 1 (+ Task 5 Step 3).
- **Pregunta asistida no se mide** → Task 1 Step 6 (+ Task 5 Step 2).
- **Siguiente paso al reprobar una etapa de un OA; jefe y libros solo Reintentar** → Task 2.
- **Objetivo en lenguaje de niño (versión mínima = nombre de etapa)** → Task 2 Step 2.
- **Repaso 10 preguntas distintas de la etapa fallada, sin reloj, sin reprobar, sin medir** → Task 3.
- **Mini-clase en Matemática, con retorno a la etapa reprobada** → Task 4.
- **Sin backend** → ninguna tarea toca Supabase.
- **Cuidados: EFIMERO, timers, no-regresión de medición y del flujo de lecciones** → Task 5 y Task 4 Step 4.
