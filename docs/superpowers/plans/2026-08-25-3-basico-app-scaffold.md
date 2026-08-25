# Plan 1 — App de 3° básico en `/3ro` (scaffold + UX de niños + Matemática semilla)

> **Para trabajadores agénticos:** SUB-SKILL REQUERIDA: usa
> superpowers:subagent-driven-development (recomendada) o superpowers:executing-plans
> para implementar tarea por tarea. Los pasos usan casillas (`- [ ]`) para seguimiento.

**Goal:** Tener en `vulpo.cl/3ro` una app de 3° básico **jugable de punta a punta con
Matemática semilla**, afinada para niños de 8 años (lectura por voz, sin reloj, etapas
cortas, texto grande, apoyo visual por código), aislada del juego de 8° y de las muestras.

**Architecture:** La app de 3° es una **copia adaptada** de `juego/index.html` en la
carpeta nueva `3ro/`, servida por GitHub Pages en `/3ro` sin ningún enlace desde el sitio.
El motor (data-driven) no cambia de forma: se reemplazan los catálogos por los de
Matemática de 3°, se agregan flags de UX de niños (`SIN_RELOJ`, texto grande, sin Modo
Difícil), un módulo de **lectura en voz** (Web Speech API) y **apoyo visual por código**.
El backend (Supabase) y `juego/index.html` **no se tocan** en este plan.

**Tech Stack:** HTML/CSS/JS estático (sin framework ni build), Web Speech API
(`speechSynthesis`), Python `http.server` para preview local. Verificación **en el
navegador** (no hay tests automatizados en el proyecto).

**Nota de commits:** el proyecto no commitea hasta la "orden 66" de Roberto. Cada tarea
termina con un `git add`/`commit` **propuesto**; en la práctica se agrupan y suben cuando
Roberto da la orden (o los toma el respaldo automático de las 18:00). Los pasos de commit
quedan igual para dejar la unidad de trabajo clara.

**Preview local:** el server ya existe (`.claude/launch.json`, `python -m http.server 8765`
en la raíz). La app de 3° queda en `http://localhost:8765/3ro/`. El juego de 8° sigue en
`http://localhost:8765/juego/` y **debe quedar idéntico** en cada tarea (no-regresión).

---

## Estructura de archivos

- **Crear** `3ro/index.html` — copia adaptada del motor (fork de `juego/index.html`).
- **Crear** `contenido/matematicas-3basico/oa.json` — OA semilla de Matemática 3°.
- **Crear** `contenido/matematicas-3basico/preguntas.json` — banco semilla (2 OA, a mano).
- **No tocar:** `juego/index.html`, `index.html` (landing), `profesor.html`,
  `supabase/schema.sql`. Cualquier cambio ahí es fuera de alcance de este plan.

Los assets de arte (portada/villano de Matemática 3°) **no** son bloqueantes: se usa
fallback a un emoji/portada existente y Roberto genera el arte propio en una tarea final
opcional.

---

## Task 1: Crear la carpeta `3ro/` como copia del motor y verificar aislamiento

**Files:**
- Create: `3ro/index.html` (copia byte a byte de `juego/index.html`)

- [ ] **Step 1: Copiar el motor**

```bash
cp juego/index.html 3ro/index.html
```

- [ ] **Step 2: Ajustar el título y el `<base>`**

En `3ro/index.html`, cambiar el `<title>` (línea ~10) a:

```html
<title>VULPO 3° — Aprende jugando</title>
```

Verificar que el `<base href="/">` siga presente (viene de la copia). Como `3ro/` está
un nivel bajo la raíz igual que `juego/`, las rutas relativas a `assets/` y `contenido/`
resuelven igual. **No cambiar el `<base>`.**

- [ ] **Step 3: Verificar en el navegador que `/3ro/` carga y que `/juego/` sigue igual**

Con el preview corriendo (`preview_start` name `kimun`):
- Navegar a `http://localhost:8765/3ro/` → debe cargar la pantalla de inicio (idéntica a
  8° por ahora), consola sin errores nuevos.
- Navegar a `http://localhost:8765/juego/` → debe seguir idéntico.

Expected: ambas cargan; `/3ro/` es por ahora una copia funcional de 8°.

- [ ] **Step 4: Verificar que NADA enlaza a `/3ro`**

```bash
grep -rn "3ro" index.html juego/index.html profesor.html || echo "OK: sin enlaces a /3ro"
```

Expected: `OK: sin enlaces a /3ro`. La app de 3° queda oculta por no estar enlazada.

- [ ] **Step 5: Commit**

```bash
git add 3ro/index.html
git commit -m "feat(3ro): scaffold app de 3 basico como fork del motor de juego/"
```

---

## Task 2: Banco semilla de Matemática 3° (contenido a mano)

**Files:**
- Create: `contenido/matematicas-3basico/oa.json`
- Create: `contenido/matematicas-3basico/preguntas.json`

- [ ] **Step 1: Crear `oa.json` con 2 OA semilla**

> Nota: los textos de OA aquí son de trabajo (semilla). Los textos oficiales exactos del
> currículum de 3° llegan en el Plan 2 (investigación en curriculumnacional.cl). El código
> sigue el patrón de nivel del proyecto: `MA03 OA NN`.

```json
{
  "asignatura": "Matemática",
  "nivel": "3° básico",
  "codigo_asignatura": "MA03",
  "fuente": "Bases Curriculares 1° a 6° básico — MINEDUC (curriculumnacional.cl) — SEMILLA, revisar textos oficiales en Plan 2",
  "oa": [
    { "codigo": "MA03 OA 01", "texto": "Contar números del 0 al 1000 de 5 en 5, de 10 en 10, de 100 en 100." },
    { "codigo": "MA03 OA 09", "texto": "Sumar y restar números hasta 1000 en situaciones cotidianas." }
  ]
}
```

- [ ] **Step 2: Crear `preguntas.json` con banco semilla (≥6 por OA)**

Formato idéntico al de 8° (`pregunta`, `opciones` de 4, `correcta` índice, `tip`, `oa`,
`revisada`), más un campo **opcional** `visual` que el motor de 3° dibuja por código
(ver Task 6). Frases cortas, para lector inicial.

```json
{
  "preguntas": [
    { "oa": "MA03 OA 09", "pregunta": "¿Cuánto es 6 + 7?", "opciones": ["12", "13", "14", "15"], "correcta": 1, "tip": "6 + 7 es 13.", "visual": {"tipo": "contar", "a": 6, "b": 7, "emoji": "🍎"}, "revisada": false },
    { "oa": "MA03 OA 09", "pregunta": "¿Cuánto es 10 - 4?", "opciones": ["5", "6", "7", "8"], "correcta": 1, "tip": "10 quitando 4 son 6.", "visual": {"tipo": "contar", "a": 10, "b": -4, "emoji": "⭐"}, "revisada": false },
    { "oa": "MA03 OA 09", "pregunta": "Ana tiene 8 lápices y le regalan 5. ¿Cuántos tiene?", "opciones": ["12", "13", "14", "11"], "correcta": 1, "tip": "8 + 5 son 13.", "revisada": false },
    { "oa": "MA03 OA 09", "pregunta": "¿Cuánto es 9 + 9?", "opciones": ["16", "17", "18", "19"], "correcta": 2, "tip": "9 + 9 son 18.", "revisada": false },
    { "oa": "MA03 OA 09", "pregunta": "Había 15 pájaros y volaron 6. ¿Cuántos quedan?", "opciones": ["8", "9", "10", "11"], "correcta": 1, "tip": "15 menos 6 son 9.", "revisada": false },
    { "oa": "MA03 OA 09", "pregunta": "¿Cuánto es 7 + 8?", "opciones": ["14", "15", "16", "13"], "correcta": 1, "tip": "7 + 8 son 15.", "revisada": false },
    { "oa": "MA03 OA 01", "pregunta": "Cuenta de 10 en 10: 10, 20, 30, ¿qué sigue?", "opciones": ["31", "40", "50", "35"], "correcta": 1, "tip": "Después de 30, de 10 en 10, viene 40.", "revisada": false },
    { "oa": "MA03 OA 01", "pregunta": "Cuenta de 5 en 5: 5, 10, 15, ¿qué sigue?", "opciones": ["16", "20", "25", "18"], "correcta": 1, "tip": "Después de 15, de 5 en 5, viene 20.", "revisada": false },
    { "oa": "MA03 OA 01", "pregunta": "Cuenta de 100 en 100: 100, 200, ¿qué sigue?", "opciones": ["250", "300", "210", "400"], "correcta": 1, "tip": "Después de 200, de 100 en 100, viene 300.", "revisada": false },
    { "oa": "MA03 OA 01", "pregunta": "¿Qué número va entre 40 y 60 contando de 10 en 10?", "opciones": ["45", "50", "55", "70"], "correcta": 1, "tip": "Entre 40 y 60 está el 50.", "revisada": false },
    { "oa": "MA03 OA 01", "pregunta": "Cuenta de 5 en 5: 20, 25, 30, ¿qué sigue?", "opciones": ["31", "35", "40", "45"], "correcta": 1, "tip": "Después de 30, de 5 en 5, viene 35.", "revisada": false },
    { "oa": "MA03 OA 01", "pregunta": "Cuenta de 10 en 10 hacia atrás: 50, 40, 30, ¿qué sigue?", "opciones": ["25", "20", "15", "35"], "correcta": 1, "tip": "Después de 30, bajando de 10 en 10, viene 20.", "revisada": false }
  ]
}
```

- [ ] **Step 3: Validar el JSON**

```bash
python -c "import json;d=json.load(open('contenido/matematicas-3basico/preguntas.json',encoding='utf-8'));print(len(d['preguntas']),'preguntas OK')"
python -c "import json;json.load(open('contenido/matematicas-3basico/oa.json',encoding='utf-8'));print('oa.json OK')"
```

Expected: `12 preguntas OK` y `oa.json OK`.

- [ ] **Step 4: Commit**

```bash
git add contenido/matematicas-3basico/
git commit -m "feat(3ro): banco semilla de Matematica 3 basico (2 OA, a mano, revisada:false)"
```

---

## Task 3: Catálogos de Matemática 3° (EXPEDICIONES + CAMPAÑAS) en la app de 3°

**Files:**
- Modify: `3ro/index.html` (arreglo `EXPEDICIONES`, arreglo `CAMPAÑAS`, `META_OA`, `DEMO_LIBRE`)

- [ ] **Step 1: Reemplazar `EXPEDICIONES` por la campaña de Matemática 3°**

En `3ro/index.html`, reemplazar **todo** el arreglo `const EXPEDICIONES=[ … ];` (empieza
~línea 1198) por una sola campaña de Matemática con **2 capítulos semilla** de **etapas
cortas** (`n:5`) más su jefe (`n:6`). Cada capítulo usa el banco semilla:

```javascript
const EXPEDICIONES=[
 { id:'mat3-cap1', asignatura:'Matemática', nivel:'3° Básico · Sumar y restar',
   portada:'assets/portada-matematicas.png',
   contenido:'contenido/matematicas-3basico/preguntas.json', activa:true, campaña:'mat3',
   etapas:[
     {oa:"MA03 OA 09",nombre:"Sumas hasta 20",icono:"➕",n:5},
     {oa:"MA03 OA 09",nombre:"Restas hasta 20",icono:"➖",n:5},
     {oa:"BOSS",nombre:"⚡ JEFE: Sumas y restas",icono:"🐲",n:6,oas:["MA03 OA 09"]},
   ]},
 { id:'mat3-cap2', asignatura:'Matemática', nivel:'3° Básico · Contar de a saltos',
   portada:'assets/portada-matematicas.png',
   contenido:'contenido/matematicas-3basico/preguntas.json', activa:true, campaña:'mat3',
   etapas:[
     {oa:"MA03 OA 01",nombre:"De 5 en 5 y de 10 en 10",icono:"🔢",n:5},
     {oa:"MA03 OA 01",nombre:"De 100 en 100",icono:"💯",n:5},
     {oa:"BOSS",nombre:"⚡ JEFE: Contar saltando",icono:"🐲",n:6,oas:["MA03 OA 01"]},
   ]},
];
```

> Nota: las dos etapas del cap1 comparten `MA03 OA 09` (el banco semilla tiene 6 de ese OA);
> con `n:5` por etapa y `pickN`, se toman 5 al azar — se aceptan repeticiones entre etapas en
> la semilla. En el Plan 2, cada etapa tendrá su propio OA/banco.

- [ ] **Step 2: Reemplazar `CAMPAÑAS` por la de Matemática 3°**

Reemplazar **todo** el arreglo `const CAMPAÑAS=[ … ];` (empieza ~línea 1447) por:

```javascript
const CAMPAÑAS=[{
  id:'mat3', asignatura:'Matemática', portada:'assets/portada-matematicas.png',
  intro:'Suma, resta y cuenta saltando con Vulpi.',
  capitulos:['mat3-cap1','mat3-cap2'],
  jefeFinal:{
    villano:'El Número Perdido', villanoIc:'🔟', villanoImg:'assets/portada-matematicas.png',
    dialogo:'¿Puedes encontrarme entre tantos números?',
    derrota:'¡Casi! Practica un poco más y vuelve a buscarme.',
    vidasJugador:3, nPorFase:3,
    fases:[
      {nombre:'Sumas y restas', oas:['MA03 OA 09']},
      {nombre:'Contar saltando', oas:['MA03 OA 01']},
    ],
  },
  recompensa:{ skin:'kimun-calculista', insignia:'maestro-matematica', bonoMonedas:200, bonoXP:100 },
},];
```

> `skin`/`insignia` reusan ids que ya existen en `SKINS`/`INSIGNIAS` de la copia (evita
> romper referencias). Ajustar arte propio queda para una tarea posterior.

- [ ] **Step 3: Reemplazar `META_OA` por metas de 3° (lenguaje de niño)**

Reemplazar el objeto `const META_OA={ … };` (empieza ~línea 1583) por:

```javascript
const META_OA={
 'MA03 OA 09':'Sumar y restar para resolver problemas del día a día.',
 'MA03 OA 01':'Contar de a saltos: de 5 en 5, de 10 en 10 y de 100 en 100.',
};
```

- [ ] **Step 4: Apuntar `DEMO_LIBRE` al primer capítulo de Matemática 3° y abrir la puerta**

Cambiar `const DEMO_LIBRE='hist-cap1';` (línea ~1417) por:

```javascript
const DEMO_LIBRE='mat3-cap1';
```

Y **dejar la puerta abierta** en la app de 3° durante el desarrollo (es un WIP oculto; la
puerta para 3° es una decisión posterior, Plan 3). Cambiar
`const FECHA_PUERTA='2026-09-01';` (línea ~1414) por:

```javascript
const FECHA_PUERTA='';   // app de 3° WIP oculta: sin puerta durante el desarrollo
```

Así Roberto prueba todo `/3ro` sin código, aunque ya haya pasado el 1 de septiembre.
(El `juego/index.html` de 8° conserva su `FECHA_PUERTA='2026-09-01'`: no se toca.)

- [ ] **Step 5: Verificar en el navegador**

Recargar `http://localhost:8765/3ro/`, entrar como Jugador:
- La pantalla de asignaturas muestra **solo Matemática** como campaña.
- Entrar a Matemática → campaña con 2 capítulos + jefe final.
- Jugar el cap1 etapa 1: la meta 🎯 dice "Sumar y restar…", el quiz saca **5 preguntas**,
  las preguntas son las del banco semilla.
- Consola sin errores. `http://localhost:8765/juego/` sigue idéntico (Historia, etc.).

Expected: campaña de Matemática 3° jugable con contenido semilla; 8° intacto.

- [ ] **Step 6: Commit**

```bash
git add 3ro/index.html
git commit -m "feat(3ro): catalogos de Matematica 3 basico (campana, etapas cortas, meta, demo)"
```

---

## Task 4: Quiz sin reloj y sin Modo Difícil (afinado para 3°)

**Files:**
- Modify: `3ro/index.html` (`pintaPregunta`, selector de modo del mapa)

- [ ] **Step 1: Agregar el flag `SIN_RELOJ` de la app de 3°**

Justo después de `function tiempoInicial(){…}` (línea ~1695) en `3ro/index.html`, agregar:

```javascript
// App de 3°: sin cuenta regresiva (el reloj estresa a los niños). Ver plan 3ro-app-scaffold.
const SIN_RELOJ=true;
```

- [ ] **Step 2: Hacer que `pintaPregunta` respete `SIN_RELOJ`**

En `pintaPregunta` (línea ~3794), donde arma el timer:

Reemplazar:

```javascript
 clearInterval(Q.timer);
 if(Q.repaso){ $('qTimer').style.visibility='hidden'; }
 else{
```

por:

```javascript
 clearInterval(Q.timer);
 if(Q.repaso || SIN_RELOJ){ $('qTimer').style.visibility='hidden'; }
 else{
```

Con esto no se crea el `setInterval`, así que no hay expiración por tiempo.

- [ ] **Step 3: Ocultar el selector Normal/Difícil del mapa**

Buscar en el CSS de `3ro/index.html` la regla `.modo-sel{` y agregarle `display:none`:

```css
.modo-sel{display:none}
```

(así el mapa nunca ofrece Difícil; `MODO` queda en `'normal'` por defecto). El Modo Difícil
no se desbloquea porque la barra queda oculta y no se usa.

- [ ] **Step 4: Verificar en el navegador**

Recargar `/3ro/`, jugar una etapa de Matemática:
- El **temporizador no aparece** y la pregunta **no se auto-falla** aunque pasen 30 s.
- El mapa **no muestra** el selector Normal/Difícil.
- `/juego/` sigue con su reloj de 20 s y su selector (no-regresión).

Expected: quiz de 3° sin reloj ni Difícil; 8° intacto.

- [ ] **Step 5: Commit**

```bash
git add 3ro/index.html
git commit -m "feat(3ro): quiz sin reloj (SIN_RELOJ) y sin Modo Dificil"
```

---

## Task 5: Botón "🔊 Escuchar" (lectura por voz del navegador)

**Files:**
- Modify: `3ro/index.html` (nueva función `leerEnVoz`, botón en el quiz, llamada en `pintaPregunta`)

- [ ] **Step 1: Agregar la función `leerEnVoz`**

Después del flag `SIN_RELOJ` (Task 4), agregar:

```javascript
// Lectura en voz alta con la voz del navegador (Web Speech API). Gratis, sin archivos.
// Fallback silencioso si no hay soporte o voz en español. Necesita gesto del usuario en móvil.
function leerEnVoz(texto){
 try{
  if(!('speechSynthesis' in window) || !texto) return;
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(texto);
  u.lang='es-CL'; u.rate=0.95;
  const v=(speechSynthesis.getVoices()||[]).find(x=>/^es/i.test(x.lang));
  if(v) u.voice=v;
  speechSynthesis.speak(u);
 }catch(e){}
}
```

- [ ] **Step 2: Agregar el botón "Escuchar" en el HTML del quiz**

En el markup de la pantalla del quiz (`#scr-quiz`), justo antes del contenedor de opciones
`#qOpts`, agregar el botón:

```html
<button class="btn-escuchar" id="btnEscuchar" type="button">🔊 Escuchar</button>
```

Y su CSS (junto a `.btn-ayuda`):

```css
.btn-escuchar{display:block;margin:6px auto 10px;padding:8px 18px;border:0;border-radius:20px;
  background:var(--gold);color:#3a2a12;font-family:'Nunito',sans-serif;font-weight:900;font-size:15px;cursor:pointer}
```

- [ ] **Step 3: Cablear el botón en `pintaPregunta`**

Al final de `pintaPregunta` (después de armar las opciones, antes del bloque del timer),
agregar:

```javascript
 // Botón de lectura: lee la pregunta y las 4 opciones en voz alta.
 const be=$('btnEscuchar');
 if(be){ be.onclick=()=>leerEnVoz(P.q+'. '+P.ops.map((o,i)=>('ABCD'[i]+'. '+o)).join('. ')); }
```

- [ ] **Step 4: Verificar en el navegador**

Recargar `/3ro/`, entrar a una pregunta, pulsar **🔊 Escuchar**:
- Se escucha la pregunta y las opciones (si el equipo tiene voz en español).
- Si no hay voz, no rompe (consola sin errores; el botón simplemente no suena).
- Verificar por consola que la función existe y no lanza:
  `typeof leerEnVoz === 'function'` → `true`.

Expected: botón presente y funcional; degradación silenciosa sin voz.

- [ ] **Step 5: Commit**

```bash
git add 3ro/index.html
git commit -m "feat(3ro): boton Escuchar con lectura por voz del navegador"
```

---

## Task 6: Apoyo visual por código en la pregunta

**Files:**
- Modify: `3ro/index.html` (función `renderVisual`, uso en `pintaPregunta`, CSS)

- [ ] **Step 1: Agregar `renderVisual`**

Después de `leerEnVoz`, agregar una función que dibuja el apoyo visual del campo
`P.visual` (tipo `contar`: dibuja grupos de emojis para sumar/restar):

```javascript
// Apoyo visual por código (liviano, infinito). Tipo "contar": grupos de emojis.
function renderVisual(v){
 if(!v||v.tipo!=='contar') return '';
 const e=v.emoji||'🔵';
 const g1=e.repeat(Math.max(0,Math.abs(v.a)));
 const signo=(v.b<0)?'➖':'➕';
 const g2=e.repeat(Math.max(0,Math.abs(v.b)));
 return `<div class="q-visual">${g1} ${signo} ${g2}</div>`;
}
```

CSS (junto a los estilos del quiz):

```css
.q-visual{font-size:30px;text-align:center;line-height:1.5;margin:6px 0 10px;word-break:break-word}
```

- [ ] **Step 2: Renderizar `P.visual` en `pintaPregunta`**

En `pintaPregunta`, después de fijar el texto de la pregunta (`$('qText').textContent=P.q;`),
insertar el apoyo visual en un contenedor. Agregar el contenedor al HTML del quiz, justo
debajo de `#qText`:

```html
<div id="qVisual"></div>
```

Y en `pintaPregunta`:

```javascript
 $('qVisual').innerHTML = renderVisual(P.visual);
```

- [ ] **Step 3: Verificar en el navegador**

Recargar `/3ro/`, jugar el cap1 (Sumas): la pregunta "6 + 7" muestra
`🍎🍎🍎🍎🍎🍎 ➕ 🍎🍎🍎🍎🍎🍎🍎`. Las preguntas sin `visual` no muestran nada extra.
Consola sin errores.

Expected: apoyo visual por código en las preguntas que lo traen.

- [ ] **Step 4: Commit**

```bash
git add 3ro/index.html
git commit -m "feat(3ro): apoyo visual por codigo en las preguntas (tipo contar)"
```

---

## Task 7: Texto grande y tono de niño (CSS + rótulos)

**Files:**
- Modify: `3ro/index.html` (CSS del quiz, clase de niño en el body)

- [ ] **Step 1: Marcar el `<body>` como app de niños**

En `3ro/index.html`, agregar la clase `ninos` al `<body>` (buscar `<body` y añadir la clase,
respetando las que ya tenga):

```html
<body class="ninos">
```

- [ ] **Step 2: Agrandar texto de pregunta y opciones bajo `.ninos`**

Agregar al CSS:

```css
.ninos #qText{font-size:22px;line-height:1.3}
.ninos .opt{font-size:18px;padding:18px 16px}
.ninos #qMeta{font-size:13px}
```

- [ ] **Step 3: Verificar en el navegador**

Recargar `/3ro/`, entrar a una pregunta: el enunciado y las 4 opciones se ven **más
grandes** que en 8°. Comparar abriendo `/juego/` (debe seguir con su tamaño normal).
Medir por consola en `/3ro/`:
`getComputedStyle(document.getElementById('qText')).fontSize` → `"22px"`.

Expected: texto grande solo en 3°; 8° sin cambios.

- [ ] **Step 4: Commit**

```bash
git add 3ro/index.html
git commit -m "feat(3ro): texto grande para lector inicial (body.ninos)"
```

---

## Task 8: Recorrido completo de validación del molde + no-regresión de 8°

**Files:**
- (Sin cambios de código; solo verificación. Si aparece un bug, se corrige en `3ro/index.html`.)

- [ ] **Step 1: Recorrido de niño de punta a punta en `/3ro/`**

Con el preview corriendo, en `http://localhost:8765/3ro/`:
1. Inicio → Jugador → crear perfil → Matemática.
2. Cap1 etapa 1: aparece la meta 🎯 la primera vez, texto grande, **🔊 Escuchar**, apoyo
   visual en "6 + 7", **sin reloj**, 5 preguntas.
3. Fallar la etapa a propósito → pantalla de reprobado con meta, **semáforo 🟢🟡🔴**, y
   "🧑‍🏫 Repasar sin presión" (heredado del motor, funciona con el OA de la etapa).
4. Aprobar las 2 etapas → se abre el jefe del cap1 → vencerlo.
5. Completar cap2 → se abre el **Jefe Final "El Número Perdido"** → vencerlo → recompensas
   (skin, insignia, corona, bono).
6. Revisar Tienda y Ranking (aunque el ranking sin backend de 3° muestre su estado
   "sin conexión/curso", no debe romper).

Expected: recorrido completo sin errores de consola; el molde de niño se ve y se juega bien.

- [ ] **Step 2: No-regresión de 8° y de las muestras**

- `http://localhost:8765/juego/` → Historia/Matemática/Ciencias/Lenguaje intactas, con
  reloj y selector Difícil.
- `http://localhost:8765/juego/?solo=hist-cap2,hist-cap3` → modo prueba de 8° intacto.
- `grep -rn "3ro" index.html juego/index.html profesor.html` → sin enlaces a `/3ro`.

Expected: 8° y muestras idénticas; `/3ro` sigue oculta.

- [ ] **Step 3: Anotar hallazgos y, si hay bugs, corregir en `3ro/index.html`**

Si el recorrido revela un problema propio del fork (por ejemplo, una referencia a un asset
o id que en 3° no existe), corregirlo en `3ro/index.html` y repetir el Step 1.

- [ ] **Step 4: Commit final del scaffold**

```bash
git add 3ro/index.html
git commit -m "chore(3ro): validacion del molde de ninos y no-regresion de 8"
```

---

## Task 9 (opcional): Arte propio de la campaña de Matemática 3°

**Files:**
- Modify: `3ro/index.html` (rutas de portada/villano)
- Add: `assets/portada-mat3-*.png`, `assets/villano-mat3.png` (Roberto genera; Claude procesa)

- [ ] **Step 1:** Roberto genera el arte (portada de la campaña y villano "El Número
  Perdido"), Claude lo procesa con el patrón de `scripts/procesar-lote*.py` (recorte,
  cuadrado, 512/384 px, original a `assets/originales/`).
- [ ] **Step 2:** Apuntar `portada`/`villanoImg` de la campaña `mat3` al arte nuevo.
- [ ] **Step 3:** Verificar en el navegador que las imágenes cargan (sin 404) en la campaña
  y en la intro del jefe.
- [ ] **Step 4:** Commit.

> Esta tarea **no bloquea** el resto: mientras no exista el arte, se usa el fallback a
> `assets/portada-matematicas.png` definido en la Task 3.

---

## Fuera de este plan (Planes 2 y 3)

- **Plan 2:** contenido completo de Matemática 3° (OA oficiales, agentes, consolidar/barajar,
  revisión humana), y reemplazo del banco semilla por el banco completo con más capítulos.
- **Plan 3:** capa de nivel en el backend (`cursos.nivel`, migración, `MA03` en
  `kimun_oa_asignatura`), panel consciente del nivel, y que el `ALU-` resuelva el mundo de 3°.
