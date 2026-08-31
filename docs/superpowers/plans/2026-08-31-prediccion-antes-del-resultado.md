# Plan — La predicción antes del resultado

> **Spec:** `docs/superpowers/specs/2026-08-31-prediccion-antes-del-resultado-design.md`

**Meta:** el semáforo 🟢🟡🔴 se pregunta en pantalla propia **antes** de mostrar el resultado, y
el resultado le responde con el cruce entre lo que el niño creyó y lo que pasó.

**Arquitectura:** se calca el patrón de la tarjeta de meta (`startQuiz` compuerta →
`mostrarMetaEtapa` pantalla → `arrancarQuiz` trabajo real). `terminarNivel` pasa a ser la
compuerta y su cuerpo actual se muda íntegro a `mostrarResultado()`.

**Los tres cursos reciben la misma edición** salvo la voz de 3°. Hoy `terminarNivel` y
`montarSemaforo` son byte a byte idénticas en los tres; el cierre lo vuelve a comprobar.

---

## Aserciones previas (si alguna falla, el plan se detiene)

- [ ] **A1 · `terminarNivel` tiene un solo llamador.** En los tres archivos aparece exactamente
      2 veces: su definición y la llamada dentro de `avanzar()`.
- [ ] **A2 · `montarSemaforo` tiene un solo llamador**, dentro de `terminarNivel`.
- [ ] **A3 · Los ids que se borran no los nombra nadie más.** `resSem`, `resSemMsg` y
      `res-sem-tit` solo aparecen en el bloque HTML/CSS que se reemplaza y en `montarSemaforo`.
- [ ] **A4 · `go()` de 3° ya llama a `callarVoz()`**, así que la función nueva no necesita una
      línea propia de voz y queda idéntica a la de 8° y 7°.

Comando: contar `terminarNivel`, `montarSemaforo` y los ids en cada fork. Esperado: 2, 2 y 3.

---

## Tarea 1 — CSS: los botones se mudan a su pantalla

**Archivos:** los tres `index.html`, bloque `<style>` (~línea 190).

- [ ] **Paso 1.1 · Reemplazar el bloque `.res-sem*`** (7 líneas consecutivas, desde
      `.res-sem{margin:6px 0 12px}` hasta `.res-sem-msg{...margin-top:8px}`) por:

```css
/* Predicción antes del resultado: el niño declara cómo cree que le fue ANTES de ver su
   puntaje, así el semáforo deja de ser un eco de las estrellas. Los botones viven ahora
   en scr-pred; .res-sem-msg se conserva porque el resultado la usa para responderle. */
#predOpts{display:flex;gap:8px;justify-content:center;margin-bottom:18px}
.sem{flex:1;max-width:112px;font-size:30px;line-height:1;background:transparent;border:2px solid #ffffff1f;
  border-radius:14px;padding:12px 6px;cursor:pointer;opacity:.75;transition:.12s;color:var(--txt)}
.sem span{display:block;font-size:12px;font-weight:800;margin-top:7px;line-height:1.2}
.sem:hover{opacity:1}
.sem.sel{opacity:1;border-color:var(--gold);background:#ffffff10;transform:scale(1.06)}
.res-sem-msg{min-height:18px;color:var(--txt);font-weight:800;font-size:13px;margin:6px 0 12px}
```

- [ ] **Paso 1.2 · Verificar el balance de llaves del bloque `<style>`**, la comprobación que la
      Sesión 56 dejó escrita tras cortar CSS de más. Contar `{` y `}` entre `<style>` y `</style>`
      en los tres: deben coincidir.

---

## Tarea 2 — HTML: la pantalla nueva y la fila que se va

- [ ] **Paso 2.1 · Insertar `scr-pred` justo después de `scr-meta`**, antes del comentario del
      QUIZ:

```html
  <!-- ====== PREDICCION (antes de ver el resultado) ====== -->
  <section class="screen" id="scr-pred">
    <div class="meta-card">
      <span class="meta-ic">🤔</span>
      <div class="meta-kick">Antes de ver tu puntaje</div>
      <p class="meta-frase" id="predTxt">¿Cómo crees que te fue?</p>
      <div id="predOpts">
        <button class="sem" data-v="🟢" type="button">🟢<span>Lo entendí</span></button>
        <button class="sem" data-v="🟡" type="button">🟡<span>Más o menos</span></button>
        <button class="sem" data-v="🔴" type="button">🔴<span>Me costó</span></button>
      </div>
    </div>
  </section>
```

**Solo en `3ro/index.html`**, entre `predTxt` y `predOpts`, dos líneas más. El texto locutable va
aparte del DOM de los botones: sin emojis ni números, así no depende del normalizador ni de que
exista su clip.

```html
      <p id="predVoz" hidden>¿Cómo crees que te fue? Verde: lo entendí. Amarillo: más o menos. Rojo: me costó.</p>
      <button class="btn-escuchar" id="btnEscucharPred" type="button">🔊 Escuchar</button>
```

- [ ] **Paso 2.2 · En `scr-res`, reemplazar la fila del semáforo** (el `<div class="res-sem">`
      completo, 9 líneas) por una sola:

```html
      <p id="resCruce" class="res-sem-msg"></p>
```

---

## Tarea 3 — JS: la compuerta, la pantalla y el cruce

- [ ] **Paso 3.1 · Reemplazar `montarSemaforo` completa** (con su comentario de 2 líneas) por:

```js
// Prediccion antes del resultado. El nino declara como cree que le fue ANTES de ver su puntaje:
// asi el semaforo deja de ser un eco de las estrellas y pasa a ser una prediccion, y el resultado
// puede responderle. Mismo patron que la tarjeta de meta (startQuiz -> mostrarMetaEtapa ->
// arrancarQuiz): esta es la compuerta y mostrarResultado el trabajo real.
// EFIMERO (QA || PRUEBA, y REVISION implica PRUEBA) la salta, asi que ?qa=1, ?solo=, ?m= y ?rev=1
// quedan cubiertos por la bandera que ya existe: quien revisa contenido no se tranca.
function terminarNivel(){
 if(EFIMERO){ mostrarResultado(); return; }
 preguntarPrediccion();
}
// La pantalla: un solo toque, sin boton de confirmar. Es el unico control, asi que es obligatoria
// sin necesidad de apagar nada ni de explicar un bloqueo.
function preguntarPrediccion(){
 const clave=(EXP_ACT?EXP_ACT.id:'')+':'+Q.lvl;
 const btns=[...document.querySelectorAll('#predOpts .sem')];
 btns.forEach(b=>{ b.classList.remove('sel');
  b.onclick=()=>{
   if(Q._pred)return;              // guard de reentrada: doble toque
   Q._pred=true; b.classList.add('sel'); SND.tap();
   S.semaforo[clave]=b.dataset.v; guardar();
   setTimeout(mostrarResultado,220);   // alcanza a verse la marca antes de cambiar de pantalla
  };});
 go('scr-pred');   // en 3.o el propio go() corta la voz de la pantalla anterior
}
// El resultado RESPONDE a la prediccion. Sin prediccion (modo efimero o partida vieja) la linea
// queda vacia y la pantalla se ve como antes. Local y privado: no mide ni viaja al profesor.
function mostrarCruce(clave, paso, ratio, aciertos, tot, hayRepaso){
 const el=$('resCruce'); if(!el)return; el.textContent='';
 const pred=S.semaforo[clave]; if(!pred)return;
 const real=!paso?'🔴':(ratio>=0.9?'🟢':'🟡');   // mismo corte con que ya se reparten las estrellas
 const ord={'🔴':0,'🟡':1,'🟢':2}, d=ord[pred]-ord[real], marca=aciertos+' de '+tot;
 el.textContent = d===0 ? 'Te conoces bien: sabías cómo te iba a ir 👌'
   : d>0 ? 'Creías que lo tenías y te fue '+marca+'. Démosle otra vuelta.'+(hayRepaso?' 👉 Toca “Repasar”.':'')
         : '¡Te costó menos de lo que pensabas! '+marca+' 💪';
}
```

- [ ] **Paso 3.2 · Renombrar la función real.** El `function terminarNivel(){` que sigue —63
      líneas, empieza con `const tot=Q.preguntas.length;`— pasa a `function mostrarResultado(){`.

- [ ] **Paso 3.3 · Cambiar su última línea.** De:

```js
 montarSemaforo((EXP_ACT?EXP_ACT.id:'')+':'+lvlFail, !paso && !esJefe && !esLibro);
```

a:

```js
 mostrarCruce((EXP_ACT?EXP_ACT.id:'')+':'+lvlFail, paso, ratio, Q.aciertos, tot, !paso && !esJefe && !esLibro);
```

- [ ] **Paso 3.4 · Solo en `3ro/index.html`, cablear el 🔊.** Agregar `['btnEscucharPred','predVoz']`
      a la lista `[['btnEscucharMeta','metaTxt'],['btnEscucharRes','resTitle']]`.

---

## Tarea 4 — Verificación (corriendo la página, no leyendo el código)

- [ ] **4.1 · Los tres forks siguen convergentes:** `preguntarPrediccion`, `mostrarCruce` y
      `mostrarResultado` byte a byte idénticas en los tres.
- [ ] **4.2 · Jugar una etapa real en los tres** con `scripts/cdp.mjs`: aparece `scr-pred`, el
      toque lleva a `scr-res`, `S.semaforo` queda escrito y el cruce dice lo que corresponde.
- [ ] **4.3 · Los tres casos del cruce** (acertó / se sobreestimó / se subestimó).
- [ ] **4.4 · `?qa=1` y `?solo=` NO muestran la pantalla** y van directo al resultado.
- [ ] **4.5 · 3°: el botón 🔊 existe y lee la frase.**
- [ ] **4.6 · Sin regresión:** el guardado de 8° sobrevive a jugar 7° y 3°, y **cero errores de
      consola y cero 404** en los tres.
- [ ] **4.7 · CRLF preservado** (`git diff --numstat` no debe dar el archivo entero como cambiado).
