# El marco de la etapa (meta + cierre) — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mostrar la meta de aprendizaje en lenguaje de niño antes de jugar (tarjeta la 1.ª vez + línea fija) y un semáforo de autoevaluación al cerrar la etapa, sin tocar el mapa de dominio.

**Architecture:** Todo en `juego/index.html` + contenido de texto nuevo (`META_OA`). Se refactoriza `startQuiz` en dos (una compuerta de meta + el arranque real), se agrega una pantalla `scr-meta`, una línea `qMeta` en el quiz y una fila de semáforo en `scr-res`. Estado nuevo persistido: `S.metasVistas`, `S.semaforo`. Cero backend.

**Tech Stack:** HTML/CSS/JS a mano, sin tests unitarios. **Verificación en el navegador** (`http://localhost:8765/juego/` + `javascript_tool` + capturas).

**Regla de commits:** sin commit por tarea; el commit se hace con la "orden 66" de Roberto. Cada tarea cierra con verificación en el navegador.

**Spec:** [`docs/superpowers/specs/2026-08-25-marco-de-la-etapa-design.md`](../specs/2026-08-25-marco-de-la-etapa-design.md).
**Depende de:** el grupo A (`2026-08-25-siguiente-paso-al-fallar`), ya implementado.

---

## Mapa de archivos

Un único archivo de código: `juego/index.html`. Zonas:

- **CSS** (`<style>`): tarjeta de meta, línea `qMeta`, fila de semáforo.
- **Estado** `S` (~1565) y `guardar`/`cargar` (~2427/2440): `metasVistas`, `semaforo`.
- **`META_OA` + helpers** (nuevo, junto a `buildPreguntas` ~1524).
- **Markup**: `scr-meta` (nueva pantalla, junto a `scr-quiz` ~945), `qMeta` (dentro de `scr-quiz`), fila de semáforo (dentro de `scr-res` ~963).
- **`startQuiz`** (~3601): compuerta de meta + `arrancarQuiz`.
- **`pintaPregunta`** (~3610): render de `qMeta`.
- **`terminarNivel`** (~3736): objetivo usa `metaDeEtapa`; montar el semáforo.

---

## Task 1: Estado nuevo, `META_OA` y helpers

**Files:**
- Modify: `juego/index.html` (`S` ~1565, `guardar` ~2435, `cargar` ~2447, y bloque nuevo junto a `buildPreguntas`)

- [ ] **Step 1: Campos nuevos en el estado `S`**

En el objeto `S` (~1573), cambiar la última línea:

```javascript
 mateLecciones:{}}; // { 'ma-oa01': true, ... } lecciones de Matemáticas completadas
```

por:

```javascript
 mateLecciones:{}, // { 'ma-oa01': true, ... } lecciones de Matemáticas completadas
 metasVistas:{},   // { 'exp:lvl': true } etapas cuya tarjeta de meta ya se vio
 semaforo:{}};     // { 'exp:lvl': '🟢'|'🟡'|'🔴' } autoevaluación local por etapa
```

- [ ] **Step 2: Persistir en `guardar`**

En `guardar`, dentro del `localStorage.setItem(...)`, la última línea (~2439):

```javascript
  calc:S.calc, curso:S.curso, alumno:S.alumno, maestro:S.maestro, mateLecciones:S.mateLecciones}));sincronizarXP();}catch(e){}}
```

por:

```javascript
  calc:S.calc, curso:S.curso, alumno:S.alumno, maestro:S.maestro, mateLecciones:S.mateLecciones,
  metasVistas:S.metasVistas, semaforo:S.semaforo}));sincronizarXP();}catch(e){}}
```

- [ ] **Step 3: Rehidratar en `cargar`**

En `cargar`, después de la línea de `mateLecciones` (~2447):

```javascript
 if(d.mateLecciones&&typeof d.mateLecciones==='object')S.mateLecciones=d.mateLecciones;
```

agregar:

```javascript
 if(d.metasVistas&&typeof d.metasVistas==='object')S.metasVistas=d.metasVistas;
 if(d.semaforo&&typeof d.semaforo==='object')S.semaforo=d.semaforo;
```

- [ ] **Step 4: Bloque `META_OA` y helpers**

Agregar justo **después** de `buildPreguntas` / `poolListo` (~1536, antes de `const LOGROS`):

```javascript
// Meta de aprendizaje en lenguaje de niño, por OA. Se completa por revisión (Task 2). La frase
// completa "Lo que vas a aprender: ‹…›", así que va sin "Vas a" (p. ej. "Por qué los europeos
// cruzaron el océano."). Fallback al nombre de la etapa si un OA no está aquí.
const META_OA={};   // { 'HI08 OA 01': 'Cómo empezó la época moderna.', ... }  ← se llena en Task 2
// La meta de una etapa: la frase amable del OA, o el nombre de la etapa como respaldo.
function metaDeEtapa(lvl){ const c=EXPEDICION[lvl]; if(!c) return ''; return META_OA[c.oa] || c.nombre || 'este objetivo'; }
// ¿Corresponde mostrar meta para esta etapa? Sí salvo libros de apoyo (no son OA del currículum).
function metaDisponible(lvl){ const c=EXPEDICION[lvl]; return !!(c && !/^(VOC-|AF-)/.test(c.oa||'')); }
```

- [ ] **Step 5: Verificar en el navegador**

Recargar `http://localhost:8765/juego/`. En consola:
```javascript
(async()=>{const e=EXPEDICIONES.find(x=>x.id==='hist-cap1');await activarExpedicion(e);
 return JSON.stringify({meta0:metaDeEtapa(0), disp0:metaDisponible(0), estado:{metas:typeof S.metasVistas,sem:typeof S.semaforo}});})()
```
Esperado: `meta0` = el nombre de la etapa (aún no hay `META_OA`), `disp0` = true, `estado` ambos "object". Sin errores de consola.

Verificar persistencia: `S.metasVistas={'x:0':true}; guardar(); location.reload();` y tras recargar `S.metasVistas` debe conservar `{'x:0':true}` (jugando con una partida real; si no hay partida, basta con que `cargar` no rompa).

---

## Task 2: Contenido `META_OA` (agentes + revisión de Roberto)

**Files:**
- Modify: `juego/index.html` (bloque `META_OA`)

- [ ] **Step 1: Enumerar los OA que están en etapas jugables**

En el navegador (o con un script), listar los OA de las etapas activas (excluye jefe `BOSS` y libros `VOC-`/`AF-`):
```javascript
JSON.stringify([...new Set(EXPEDICIONES.filter(e=>e.activa).flatMap(e=>(e.etapas||[]).map(t=>t.oa)).filter(oa=>oa&&!/^(BOSS|VOC-|AF-)/.test(oa)))].sort())
```
Guardar esa lista (son ~20–30 OA). Para el texto de cada OA, la fuente es `contenido/<asignatura>/oa.json`.

- [ ] **Step 2: Generar una frase por OA (agentes)**

Dispatchar agentes (uno o varios en paralelo) con esta instrucción, pasando la lista de OA y el texto oficial de cada uno (de `oa.json`):

> Para cada OA, escribe **una** frase corta (máx. ~12 palabras), en **español latino neutro**, en
> lenguaje de un niño de 8° básico, que complete la oración "Lo que vas a aprender: ‹frase›".
> **No** empieces con "Vas a"; usa un sustantivo o "Cómo/Por qué…" (p. ej. "Por qué los europeos
> cruzaron el océano.", "Cómo funciona una célula."). Sin tecnicismos, sin el código del OA, sin
> comillas. Devuelve un objeto JSON `{ '‹código OA›': '‹frase›' }`.

- [ ] **Step 3: Insertar en `META_OA`**

Pegar el objeto generado dentro de `const META_OA={ … }`. Verificar que **cada clave calza EXACTO**
con el `oa` de la etapa (formato `"HI08 OA 01"`, con espacios) — una clave mal escrita cae al
fallback en silencio.

- [ ] **Step 4: Revisión de Roberto**

Roberto lee las frases (en el juego o en el bloque) y ajusta las que no le gusten. Nace sin
aprobación formal; su lectura es la aprobación.

- [ ] **Step 5: Verificar en el navegador**

Recargar. Repetir el chequeo de Task 1 Step 5: `metaDeEtapa(0)` de `hist-cap1` ahora debe devolver la
**frase amable** (no el nombre). Para un OA sin entrada (si dejaste alguno), sigue cayendo al nombre.
Verificar que **todas** las claves calzan:
```javascript
(async()=>{const faltan=[];for(const e of EXPEDICIONES.filter(x=>x.activa)){for(const t of (e.etapas||[])){if(t.oa&&!/^(BOSS|VOC-|AF-)/.test(t.oa)&&!META_OA[t.oa])faltan.push(t.oa);}}return JSON.stringify([...new Set(faltan)]);})()
```
Esperado: `[]` (o la lista corta de OA que se decidió dejar con fallback).

---

## Task 3: Tarjeta de meta la primera vez (`scr-meta`)

**Files:**
- Modify: `juego/index.html` (CSS, markup nueva pantalla, `startQuiz` ~3601, funciones nuevas `arrancarQuiz`/`mostrarMetaEtapa`)

- [ ] **Step 1: CSS de la tarjeta**

En el `<style>` (junto a otros estilos de pantalla):

```css
#scr-meta .meta-card{max-width:460px;margin:40px auto 0;background:var(--panel2);border:1px solid #ffffff1f;
  border-radius:18px;padding:26px 22px;text-align:center;box-shadow:0 12px 34px rgba(0,0,0,.4)}
#scr-meta .meta-ic{font-size:44px;display:block;margin-bottom:8px}
#scr-meta .meta-kick{color:var(--gold);font-weight:900;font-size:14px;letter-spacing:.04em;text-transform:uppercase}
#scr-meta .meta-frase{color:var(--txt);font-weight:800;font-size:20px;line-height:1.35;margin:10px 0 20px}
```

- [ ] **Step 2: Markup de la pantalla `scr-meta`**

Agregar **antes** de `<section class="screen" id="scr-quiz">` (~945):

```html
  <!-- ============ META DE LA ETAPA (primera vez) ============ -->
  <section class="screen" id="scr-meta">
    <div class="meta-card">
      <span class="meta-ic">🎯</span>
      <div class="meta-kick">Lo que vas a aprender</div>
      <p class="meta-frase" id="metaTxt"></p>
      <button class="btn" id="metaVamos" type="button">¡Vamos! ▶</button>
    </div>
  </section>
```

- [ ] **Step 3: Refactor de `startQuiz` (compuerta de meta) + `arrancarQuiz`**

Reemplazar `startQuiz` completo (~3601-3607) por:

```javascript
function startQuiz(lvl){
 if(!poolListo(lvl)){alert('Cargando preguntas… intenta de nuevo en un momento.');return;}
 // Tarjeta de meta la primera vez (salvo libros de apoyo y modo efímero QA/prueba).
 const c0=EXPEDICION[lvl];
 const esLibro0=/^(VOC-|AF-)/.test(c0.oa||'');
 const clave=(EXP_ACT?EXP_ACT.id:'')+':'+lvl;
 if(!esLibro0 && !EFIMERO && !S.metasVistas[clave]){ mostrarMetaEtapa(lvl, clave); return; }
 arrancarQuiz(lvl);
}
// La tarjeta de meta: se marca vista, se pinta y su botón arranca el quiz de verdad.
function mostrarMetaEtapa(lvl, clave){
 S.metasVistas[clave]=true; guardar();
 $('metaTxt').textContent=metaDeEtapa(lvl);
 $('metaVamos').onclick=()=>{ SND.tap(); arrancarQuiz(lvl); };
 go('scr-meta');
}
// Arranque real del quiz de una etapa (lo que hacía startQuiz antes de la compuerta de meta).
function arrancarQuiz(lvl){
 const prg=progAct();
 const c=EXPEDICION[lvl];
 const esLibro=/^(VOC-|AF-)/.test(c.oa||'');
 const comodines=(MODO==='normal' && lvl!==N_ETAPAS-1 && !esLibro)?2:0;
 Q={lvl,idx:0,aciertos:0,combo:0,comboMax:0,xpGanado:0,timer:null,t:15,lock:false,preguntas:buildPreguntas(lvl),
    repetida:!!(prg&&prg[lvl]&&prg[lvl].est==='done'), comodines};
 go('scr-quiz');pintaPregunta();}
```

> Nota: los llamadores existentes de `startQuiz` (nodos del mapa, "SIGUIENTE ETAPA", "REINTENTAR")
> no cambian: siguen llamando `startQuiz(lvl)`, que ahora decide si intercalar la tarjeta.

- [ ] **Step 4: Verificar en el navegador**

Recargar. Entrar por primera vez a una etapa:
```javascript
(async()=>{const e=EXPEDICIONES.find(x=>x.id==='hist-cap1');await activarExpedicion(e);
 delete S.metasVistas['hist-cap1:0'];   // forzar "primera vez"
 startQuiz(0);
 return JSON.stringify({pantalla:[...document.querySelectorAll('.screen.on')].map(s=>s.id), txt:document.getElementById('metaTxt').textContent, vista:S.metasVistas['hist-cap1:0']});})()
```
Esperado: pantalla `["scr-meta"]`, `txt` = la meta, `vista` = true. Pulsar `#metaVamos` → `scr-quiz`.
Volver a `startQuiz(0)` (segunda vez): debe ir **directo** a `scr-quiz` (sin `scr-meta`). En `?qa=1`
(EFIMERO): `startQuiz(0)` va directo, sin tarjeta. En un libro (voc-general): directo, sin tarjeta.

---

## Task 4: Línea fija `qMeta` en el quiz + objetivo con `metaDeEtapa`

**Files:**
- Modify: `juego/index.html` (markup `scr-quiz`, CSS, `pintaPregunta` ~3610, `terminarNivel` objetivo ~3769)

- [ ] **Step 1: Markup y CSS de la línea**

En `scr-quiz`, dentro de `.qcard`, **después** de `<h2 id="qText">…</h2>`:

```html
      <div id="qMeta" class="qmeta" hidden></div>
```

CSS:

```css
.qmeta{color:var(--dim);font-weight:800;font-size:12px;margin-top:6px}
```

- [ ] **Step 2: Render en `pintaPregunta`**

En `pintaPregunta`, después de fijar `$('qText').textContent=P.q;` (~3618), agregar:

```javascript
 // Línea fija de meta: en etapa y repaso (mismo OA), no en lección/desafío/libros.
 const qm=$('qMeta');
 if(!Q.leccion && !Q.desafio && metaDisponible(Q.lvl)){ qm.textContent='🎯 '+metaDeEtapa(Q.lvl); qm.hidden=false; }
 else { qm.hidden=true; }
```

- [ ] **Step 3: El objetivo de `scr-res` usa la meta amable**

En `terminarNivel`, en el bloque del grupo A (~3769), cambiar:

```javascript
  $('resObj').textContent='Estás practicando: '+(cFail.nombre||'este objetivo');
```

por:

```javascript
  $('resObj').textContent='🎯 '+metaDeEtapa(lvlFail);
```

- [ ] **Step 4: Verificar en el navegador**

Entrar a una etapa (pasando la tarjeta). Comprobar la línea:
```javascript
JSON.stringify({vis:!document.getElementById('qMeta').hidden, txt:document.getElementById('qMeta').textContent})
```
Esperado: `vis` = true, `txt` empieza con "🎯 ". Comprobar que en un **repaso** también se ve (misma
comprobación tras lanzar `iniciarRepaso`), y que en un **libro** queda oculto (`vis` = false).
Reprobar una etapa y comprobar que `resObj` ahora muestra "🎯 ‹meta›".

---

## Task 5: Semáforo de autoevaluación en `scr-res`

**Files:**
- Modify: `juego/index.html` (markup `scr-res` ~966, CSS, `terminarNivel` ~3781, función nueva `montarSemaforo`)

- [ ] **Step 1: Markup de la fila de semáforo**

En `scr-res`, dentro de `.resbox`, **después** del `<div class="statgrid">…</div>` (~972) y antes de `<button id="btnNext">`:

```html
      <div class="res-sem">
        <span class="res-sem-tit">¿Cómo te fue?</span>
        <div id="resSem">
          <button class="sem" data-v="🟢" type="button">🟢</button>
          <button class="sem" data-v="🟡" type="button">🟡</button>
          <button class="sem" data-v="🔴" type="button">🔴</button>
        </div>
        <p id="resSemMsg" class="res-sem-msg"></p>
      </div>
```

- [ ] **Step 2: CSS del semáforo**

```css
.res-sem{margin:6px 0 12px}
.res-sem-tit{display:block;color:var(--dim);font-weight:800;font-size:14px;margin-bottom:6px}
#resSem{display:flex;gap:10px;justify-content:center}
.sem{font-size:30px;line-height:1;background:transparent;border:2px solid transparent;border-radius:14px;
  padding:4px 8px;cursor:pointer;opacity:.6;transition:.12s}
.sem:hover{opacity:1}
.sem.sel{opacity:1;border-color:var(--gold);background:#ffffff10;transform:scale(1.08)}
.res-sem-msg{min-height:18px;color:var(--txt);font-weight:800;font-size:13px;margin-top:8px}
```

- [ ] **Step 3: La función `montarSemaforo`**

Agregar junto a `terminarNivel` (p. ej. antes de esa función):

```javascript
// Semáforo de autoevaluación (local, privado). No mide ni sincroniza: solo guarda en S.semaforo.
// hayRepaso: si en esta pantalla se ofrece "Repasar", el mensaje empuja suave hacia él en 🟡/🔴.
function montarSemaforo(clave, hayRepaso){
 const msg=$('resSemMsg'); msg.textContent='';
 const btns=[...document.querySelectorAll('#resSem .sem')];
 btns.forEach(b=>b.classList.remove('sel'));
 const textos={'🟢':'¡Genial, lo dominas! Sigue así.','🟡':'Vas bien. Un repasito y queda redondo.','🔴':'Te costó, y está bien. El repaso te va a ayudar.'};
 btns.forEach(b=>{ b.onclick=()=>{
   btns.forEach(x=>x.classList.remove('sel')); b.classList.add('sel');
   const v=b.dataset.v;
   msg.textContent=textos[v] + ((v!=='🟢' && hayRepaso)?' 👉 Toca “Repasar”.':'');
   S.semaforo[clave]=v; guardar(); SND.tap();
 };});
}
```

- [ ] **Step 4: Montar el semáforo en `terminarNivel`**

En `terminarNivel`, justo **antes** de `go('scr-res');` (~3781), agregar:

```javascript
 montarSemaforo((EXP_ACT?EXP_ACT.id:'')+':'+lvlFail, !paso && !esJefe && !esLibro);
```

- [ ] **Step 5: Verificar en el navegador**

Terminar una etapa (pasar o reprobar). En `scr-res`:
```javascript
JSON.stringify({hayFila:!!document.querySelector('.res-sem'), botones:document.querySelectorAll('#resSem .sem').length})
```
Esperado: `hayFila` true, `botones` 3. Simular un toque:
```javascript
document.querySelector('#resSem .sem[data-v="🔴"]').click();
JSON.stringify({sel:document.querySelector('#resSem .sem.sel').dataset.v, msg:document.getElementById('resSemMsg').textContent, guardado:S.semaforo[Object.keys(S.semaforo)[0]]})
```
Esperado: `sel` = "🔴", `msg` con el texto de 🔴 (y "👉 Toca “Repasar”." si la etapa se reprobó),
`guardado` = "🔴". Confirmar que **no** se llamó a Supabase ni a `registrarOA` (el semáforo no los toca).
Confirmar que Reintentar/Siguiente/Volver siguen funcionando con el semáforo presente.

---

## Task 6: Regresión general

**Files:** ninguno (solo verificación).

- [ ] **Step 1: El grupo A sigue intacto**

Reprobar una etapa: el botón "🧑‍🏫 Repasar sin presión" (o "📘 Repasar la mini-clase" en Matemática)
aparece igual que antes; el repaso funciona; el comodín aparece en etapa Normal. La única diferencia
es que `resObj` ahora dice "🎯 ‹meta›" en vez de "Estás practicando: ‹nombre›".

- [ ] **Step 2: La tarjeta no molesta al reintentar**

Entrar a una etapa (ver tarjeta), jugar y reprobar, pulsar REINTENTAR: **no** debe reaparecer la
tarjeta de meta (la marca se puso en la primera entrada). Idem "SIGUIENTE ETAPA".

- [ ] **Step 3: Contextos sin meta ni tarjeta**

Libros (Vocabulario/Ana Frank): sin tarjeta, sin línea `qMeta`. Lección de Matemática y desafío: sin
línea `qMeta`. El semáforo **sí** aparece en `scr-res` de un libro o del jefe (reflexión genérica,
aceptado por el spec).

- [ ] **Step 4: `EFIMERO` (QA / prueba)**

En `?qa=1`: no aparece la tarjeta de meta (se entra directo); la línea `qMeta` y el semáforo se ven,
pero nada se mide. Consola limpia.

- [ ] **Step 5: Partida vieja no rompe**

Simular un save sin `metasVistas`/`semaforo` (`cargar` con un objeto viejo): `S.metasVistas` y
`S.semaforo` quedan en `{}` por el default del estado, y el juego arranca sin errores.

---

## Self-review (cobertura del spec)

- **B · texto por OA (`META_OA`), solo OA jugables, fallback a nombre** → Task 1 Step 4 + Task 2.
- **B · tarjeta la 1.ª vez (`scr-meta`), recordada, no en libros/EFIMERO** → Task 3.
- **B · línea fija `qMeta` en etapa y repaso, no en lección/desafío/libros** → Task 4 Steps 1-2.
- **B · el objetivo del grupo A usa la meta amable** → Task 4 Step 3.
- **C · semáforo local en `scr-res`, opcional, empuje suave al repaso, no mide** → Task 5.
- **Estado persistido `metasVistas`/`semaforo`; migración de partidas viejas** → Task 1 + Task 6 Step 5.
- **Sin backend** → ninguna tarea toca Supabase.
