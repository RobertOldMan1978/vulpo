# Puerta de acceso (demo + código, con aviso previo) — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: usa superpowers:subagent-driven-development (recomendado) o superpowers:executing-plans para ejecutar este plan tarea por tarea. Los pasos usan casillas (`- [ ]`) para seguimiento.

**Goal:** Que sin código `ALU-` solo se pueda jugar el capítulo 1 de Historia, con un periodo de aviso previo, y que todo se active con una sola constante de fecha.

**Architecture:** Una constante `FECHA_PUERTA` define tres fases (vacía = nada cambia, futura = aviso, llegada = puerta). Una función `bloqueado()` concentra la decisión, con las excepciones (muestras y QA) incorporadas, y los puntos de entrada del juego la consultan. La llave es la identidad de alumno que ya existe.

**Tech Stack:** HTML/JS vanilla en `index.html`, sin framework. Reutiliza `hoyISO()` y `S.alumno`.

**Fuente de verdad del diseño:** `docs/superpowers/specs/2026-08-24-puerta-de-acceso-design.md`.

## Global Constraints

- **NO se hace commit ni push** en ningún paso. Se espera la **orden 66**.
- **`FECHA_PUERTA` se publica VACÍA.** Al terminar este plan, desplegar no debe cambiar nada para nadie. La activa Roberto cuando el lado comercial esté listo.
- **No hay tests automatizados.** Verificación en el navegador con `preview_start`, DOM y consola.
- **Excepciones que nunca pasan por la puerta:** los enlaces de muestra (`PRUEBA`, o sea `?solo=` y `?m=`) y `?qa=1`.
- **La demo es exactamente `hist-cap1`** y nada más.
- **El Duelo local queda libre**; el Duelo en línea se cierra.
- **El avance del jugador NO se borra nunca.** El candado tapa, no destruye: al canjear un código reaparece intacto.
- **La licencia se consulta en vivo, no se congela al arrancar:** si el alumno canjea a mitad de sesión, la puerta se abre sin recargar.
- Idioma de interfaz y comentarios: **español**.
- Solo se toca `index.html` (y `CLAUDE.md` al final). No se tocan `profesor.html` ni el contenido.
- Contacto oficial en la pantalla de cierre: **vulpochile.app@gmail.com** y **+569 7668 4967**.

---

## Estructura de archivos

- **`index.html`** (modificar) — cuatro zonas:
  - Banderas (junto a `FECHA_PUERTA`, tras el bloque de `SIN_DISCO`): la lógica de fases y licencia.
  - Markup: banda de aviso en `scr-rol` y nueva `<section id="scr-demo-fin">`.
  - Puntos de entrada: `renderExpediciones`, `renderCampaña`, `abrirBiblioteca`, `abrirLenguaje`, la barra inferior, `btnExpTienda`, `btnDuelo`.
  - Fin de etapa: el remate del capítulo de la demo.
- **`CLAUDE.md`** (modificar, Task 5) — documentar el modelo de acceso y la bitácora.

**Orden:** Task 1 (motor, sin cambio visible) → Task 2 (aviso) → Task 3 (candados) → Task 4 (fin de demo) → Task 5 (verificación + docs).

---

### Task 1: El motor de la puerta

Al terminar **no cambia nada visible**, porque `FECHA_PUERTA` queda vacía. Se verifica por consola.

**Files:**
- Modify: `index.html` — bloque de banderas, justo después de `const VENCIDA=…`.

**Interfaces:**
- Produces:
  - `FECHA_PUERTA` — `string`. `''`, o `'AAAA-MM-DD'`.
  - `PUERTA` — `boolean`. `true` si la fecha existe y ya llegó (hoy incluido).
  - `AVISO_PUERTA` — `boolean`. `true` si la fecha existe y aún no llega.
  - `DEMO_LIBRE` — `string`. `'hist-cap1'`.
  - `tieneLicencia()` — `boolean`. Si el jugador es un alumno identificado. **Se consulta en vivo.**
  - `bloqueado()` — `boolean`. `true` cuando hay que cerrar: puerta activa, sin licencia, y sin excepción de muestra ni QA.
  - `capAbierto(id)` — `boolean`. Si ese capítulo se puede jugar.

- [ ] **Step 1: Agregar el bloque**

Después de `const VENCIDA=!!VENCE && hoyISO()>VENCE;` agregar:

```js
/* ===== Puerta de acceso =====
   Una sola constante gobierna las tres fases:
     ''            -> no pasa nada, el juego sigue abierto (valor con que se publica)
     fecha futura  -> AVISO: todo abierto, pero se anuncia el cierre
     fecha llegada -> PUERTA: sin código solo se juega DEMO_LIBRE
   Llegada la fecha el cierre ocurre solo, sin desplegar nada ese día.
   OJO: esto es un bloqueo BLANDO. Los bancos de preguntas son archivos públicos que
   cualquiera puede descargar (ver el spec). Detiene al 99%, no a quien sepa mirar. */
const FECHA_PUERTA='';                  // <-- Roberto la fija cuando el lado comercial esté listo
const PUERTA=!!FECHA_PUERTA && hoyISO()>=FECHA_PUERTA;
const AVISO_PUERTA=!!FECHA_PUERTA && !PUERTA;
const DEMO_LIBRE='hist-cap1';           // lo único jugable sin código
/* La licencia se consulta EN VIVO (no se congela al arrancar): si el alumno canjea su
   código a mitad de sesión, la puerta se abre sin recargar la página. */
function tieneLicencia(){ return !!S.alumno; }
/* Excepciones incorporadas: los enlaces de muestra y ?qa=1 nunca pasan por la puerta. */
function bloqueado(){ return PUERTA && !PRUEBA && !QA && !tieneLicencia(); }
function capAbierto(id){ return !bloqueado() || id===DEMO_LIBRE; }
```

- [ ] **Step 2: Verificar por consola que nada se activó**

Con `preview_start` (config `kimun`, puerto 8765), en `http://localhost:8765/`:

```js
JSON.stringify({FECHA_PUERTA, PUERTA, AVISO_PUERTA, bloqueado:bloqueado(),
  demoAbierta:capAbierto('hist-cap1'), otroAbierto:capAbierto('cien-celula')})
```

Esperado: `FECHA_PUERTA:''`, `PUERTA:false`, `AVISO_PUERTA:false`, `bloqueado:false`, y **ambos
capítulos abiertos**. El juego se comporta como hoy.

- [ ] **Step 3: Verificar las tres fases simulando la fecha**

Como `FECHA_PUERTA` es `const`, para probar se edita el archivo. Poner temporalmente
`const FECHA_PUERTA='2026-12-31';`, recargar y comprobar `AVISO_PUERTA:true, PUERTA:false`.
Luego `'2026-01-01'` y comprobar `PUERTA:true, AVISO_PUERTA:false, bloqueado:true`.
**Dejarla en `''` antes de seguir.**

---

### Task 2: El aviso previo

**Files:**
- Modify: `index.html` — markup de `scr-rol` y su pintado.

**Interfaces:**
- Consumes: `AVISO_PUERTA`, `FECHA_PUERTA`, `fechaLarga(iso)`.

- [ ] **Step 1: Agregar la banda al markup**

En `scr-rol`, justo después de `<div id="bannerDesafio" class="banner-desafio" hidden></div>`:

```html
    <div id="avisoPuerta" class="card" hidden
         style="border:2px solid var(--gold);background:#2a1f00">
      <p id="avisoPuertaTxt" style="font-weight:900;font-size:13px;margin:0 0 6px"></p>
      <p style="color:var(--dim);font-weight:800;font-size:12px;margin:0">
        Pídeselo a tu colegio · ¿Eres profesor? Escríbenos a vulpochile.app@gmail.com
      </p>
    </div>
```

- [ ] **Step 2: Pintarlo al mostrar la pantalla de inicio**

En `pintarInicio()`, antes de su cierre, agregar:

```js
 const av=$('avisoPuerta');
 if(av){
  av.hidden=!AVISO_PUERTA;
  if(AVISO_PUERTA) $('avisoPuertaTxt').textContent=
    'Desde el '+fechaLarga(FECHA_PUERTA)+' necesitarás un código de tu profesor para seguir jugando.';
 }
```

- [ ] **Step 3: Verificar**

Con `FECHA_PUERTA='2026-12-31'` temporalmente: en `http://localhost:8765/` la banda se ve y dice
`Desde el 31 de diciembre de 2026 necesitarás un código de tu profesor para seguir jugando.`, y
**todas las asignaturas siguen abiertas y jugables**. Con `FECHA_PUERTA=''` la banda no aparece
(`document.getElementById('avisoPuerta').hidden === true`). Dejarla en `''`.

---

### Task 3: Los candados

**Files:**
- Modify: `index.html` — `renderExpediciones`, `renderCampaña`, `abrirBiblioteca`, `abrirLenguaje`, `btnExpTienda`, `btnDuelo`, y el pintado de la barra inferior.

**Interfaces:**
- Consumes: `bloqueado()`, `capAbierto(id)`, `DEMO_LIBRE`.
- Produces: `avisoCandado()` — `void`. Muestra el mensaje de que hace falta código.

- [ ] **Step 1: Agregar el aviso reutilizable**

Junto a las demás funciones de la puerta:

```js
/* Mensaje único cuando se toca algo cerrado. */
function avisoCandado(){ alert('🔒 Necesitas un código de tu profesor para abrir esta parte de VULPO.\n\n¿Eres profesor? Escríbenos a vulpochile.app@gmail.com'); }
```

- [ ] **Step 2: Cerrar las asignaturas en la pantalla principal**

En `renderExpediciones`, la tarjeta de Matemáticas y la tarjeta genérica deben respetar la
puerta. Para **Matemáticas**, reemplazar su `card.onclick` por:

```js
   card.onclick=()=>{SND.tap(); if(bloqueado()){avisoCandado();return;} abrirCampaña(camp);};
   if(bloqueado()) card.classList.add('lock');
```

Para la **tarjeta genérica** (la de Historia, Ciencias y Lenguaje), reemplazar su `onclick` por:

```js
  card.onclick=()=>{SND.tap();
   // Historia entra siempre: dentro se decide qué capítulo está abierto (la demo).
   if(bloqueado() && asig!=='Historia'){avisoCandado();return;}
   if(asig==='Lenguaje')abrirLenguaje(); else if(camp)abrirCampaña(camp); else abrirAsignatura(asig);};
  if(bloqueado() && asig!=='Historia') card.classList.add('lock');
```

Y la tarjeta de la biblioteca de Lectura:

```js
 bib.onclick=()=>{SND.tap(); if(bloqueado()){avisoCandado();return;} abrirBiblioteca();};
 if(bloqueado()) bib.classList.add('lock');
```

- [ ] **Step 3: Cerrar los capítulos dentro de Historia**

En `renderCampaña`, dentro del `forEach` de capítulos, la apertura pasa a considerar la puerta:

```js
  const abierto=capAbierto(id) && nodoCampDesbloqueado(c,i), hecho=expedicionCompleta(id);
  const titulo=(exp.nivel.split('· ')[1]||exp.nivel);
  cont.appendChild(nodoCampañaEl(`${i+1}`, titulo, abierto, hecho,
    abierto?()=>entrarExpedicion(exp):null,
    hecho?'Completado':(abierto?'¡Jugar!':(capAbierto(id)?'🔒 Bloqueado':'🔒 Necesitas un código')),
    portadaMapa(exp), portadaFallback(exp)));
```

En la misma función, el Desafío Extra y el Jefe Final se cierran igual: envolver ambos bloques
en `if(!bloqueado()){ … }`.

> Nota: `capAbierto(id)` devuelve `false` para todo lo que no sea `hist-cap1` con la puerta
> cerrada, **aunque el jugador ya lo hubiera completado**. Es lo acordado: la licencia manda
> sobre el avance, y el avance no se borra.

- [ ] **Step 4: Cerrar Tienda, Logros y Duelo en línea**

- Tienda desde Expediciones:

```js
$('btnExpTienda').onclick=()=>{SND.tap(); if(bloqueado()){avisoCandado();return;}
 tiendaOrigen='scr-expediciones';$('nav').style.display='none';renderTienda();go('scr-tienda');};
```

- Duelo: con la puerta cerrada va **directo al duelo local**, que queda libre, en vez de mostrar
  la pantalla en línea llena de candados:

```js
$('btnDuelo').onclick=()=>{SND.init();SND.tap();$('nav').style.display='none';
 if(bloqueado()){ initDueloSetup(); return; }   // el duelo local queda libre
 abrirDueloOnline();};
```

- Barra inferior: Tienda y Logros desaparecen. Agregar junto a las funciones de la puerta y
  llamarla desde `renderExpediciones` (primera línea) y desde `entrarExpedicion` tras mostrar
  la barra:

```js
/* Con la puerta cerrada, la barra inferior deja solo el Mapa. */
function ajustarNav(){
 const cerrado=bloqueado();
 document.querySelectorAll('#nav button').forEach(b=>{
  const destino=b.dataset.go;
  if(destino==='scr-tienda'||destino==='perfil') b.style.display=cerrado?'none':'';
 });
}
```

- [ ] **Step 5: Verificar con la puerta cerrada y sin código**

Poner temporalmente `FECHA_PUERTA='2026-01-01'`, limpiar `localStorage` y comprobar en
`http://localhost:8765/`:

1. En Expediciones: **Historia entra**; Matemáticas, Ciencias, Lenguaje y Lectura muestran el
   aviso al tocarlas y no abren.
2. Dentro de Historia: el capítulo 1 dice "¡Jugar!"; los capítulos 2 a 5 dicen
   "🔒 Necesitas un código"; **no aparecen** Desafío Extra ni Jefe Final.
3. El capítulo 1 se juega completo, con sus 5 nodos según la progresión normal.
4. La barra inferior muestra **solo Mapa**.
5. El botón ⚔️ DUELO abre el **duelo local**, no la pantalla en línea.
6. Canjear un código válido y volver a Expediciones: **todo abierto**, sin recargar.

- [ ] **Step 6: Verificar que las excepciones siguen pasando**

Con `FECHA_PUERTA='2026-01-01'` todavía puesta:

- `?solo=cien-celula` → abre la expedición de Ciencias pese a no haber código.
- `?qa=1` → juego completo, sin candados.
- `?m=` con un token vigente → abre sus capítulos.

Después **dejar `FECHA_PUERTA=''`**.

---

### Task 4: La pantalla de fin de demo

**Files:**
- Modify: `index.html` — markup nuevo y el remate del capítulo.

**Interfaces:**
- Consumes: `bloqueado()`, `DEMO_LIBRE`, `EXP_ACT`, `go(id)`.
- Produces: `mostrarFinDemo()` — `void`.

- [ ] **Step 1: Agregar el markup**

Después del `</section>` de `scr-vencida`:

```html
  <!-- ====== FIN DE LA DEMO (puerta cerrada, sin código) ====== -->
  <section class="screen" id="scr-demo-fin">
    <div class="logo" style="margin:30px 0 10px">
      <span class="badge">🎉</span>
      <h1 style="font-size:24px">¡Terminaste la muestra de VULPO!</h1>
      <p>El resto del juego —4 asignaturas, más de 2.500 preguntas— lo abre tu colegio.</p>
    </div>
    <div class="card">
      <button class="btn" id="demoCodigo">🎟️ Tengo un código</button>
      <button class="btn sec" id="demoProfe">🏫 Soy profesor, quiero VULPO para mi curso</button>
      <p id="demoContacto" hidden style="text-align:center;font-weight:800;font-size:13px;margin-top:12px;color:var(--cyan)">
        vulpochile.app@gmail.com<br>+569 7668 4967
      </p>
    </div>
  </section>
```

- [ ] **Step 2: Agregar `mostrarFinDemo`**

Junto a las demás funciones de la puerta:

```js
/* Remate de la demo: en vez del capítulo siguiente, la invitación a conseguir un código. */
function mostrarFinDemo(){
 $('demoContacto').hidden=true;
 $('demoCodigo').onclick=()=>{SND.tap();abrirCanje();};
 $('demoProfe').onclick=()=>{SND.tap();$('demoContacto').hidden=false;};
 $('nav').style.display='none';
 go('scr-demo-fin');
}
```

- [ ] **Step 3: Enganchar el remate**

En el botón de "volver al mapa" de la pantalla de resultados (`$('btnMap').onclick=()=>{renderMapa();renderRanking();go('scr-mapa');};`), anteponer la comprobación:

```js
 $('btnMap').onclick=()=>{
  // Terminó el jefe de la demo y no tiene código: se le ofrece el resto.
  if(bloqueado() && EXP_ACT && EXP_ACT.id===DEMO_LIBRE && expedicionCompleta(DEMO_LIBRE)){ mostrarFinDemo(); return; }
  renderMapa();renderRanking();go('scr-mapa');};
```

- [ ] **Step 4: Verificar**

Con `FECHA_PUERTA='2026-01-01'` y sin código: jugar el capítulo 1 de Historia hasta vencer su
jefe y pulsar el botón de volver. Comprobar:

1. Aparece `scr-demo-fin`.
2. "Soy profesor" revela `vulpochile.app@gmail.com` y `+569 7668 4967`.
3. "Tengo un código" abre la pantalla de canje.
4. Con la puerta abierta (`FECHA_PUERTA=''`), terminar el mismo capítulo **no** muestra esta
   pantalla: vuelve al mapa como siempre.

Dejar `FECHA_PUERTA=''`.

---

### Task 5: Verificación integral y documentación

**Files:**
- Modify: `CLAUDE.md`.

- [ ] **Step 1: Regresión completa**

| Estado | Esperado |
|---|---|
| `FECHA_PUERTA=''` | Juego **exactamente como hoy**: 4 asignaturas abiertas, sin aviso, sin candados, barra completa |
| Fecha futura | Todo abierto **+ banda de aviso** con la fecha en castellano |
| Fecha llegada, sin código | Solo `hist-cap1`; resto con candado; barra solo Mapa; duelo local; fin de demo con contacto |
| Fecha llegada, con código | Juego completo |
| Fecha llegada + `?solo=`/`?m=` | La muestra abre igual |
| Fecha llegada + `?qa=1` | Sin restricciones |

Consola limpia en los seis. **Terminar con `FECHA_PUERTA=''`** y confirmarlo con
`grep -n "const FECHA_PUERTA" index.html`.

- [ ] **Step 2: Documentar el modelo de acceso en `CLAUDE.md`**

Agregar una sección nueva "Modelo de acceso (puerta)" tras "Parámetros de URL (ocultos)", que
explique las tres fases de `FECHA_PUERTA`, qué es la demo, qué queda cerrado, las excepciones,
que el duelo local es libre, y **que es un bloqueo blando porque los bancos de preguntas son
archivos públicos descargables** (con la tabla de las 2.536 preguntas del spec).

- [ ] **Step 3: Dejar la entrada de bitácora redactada**

Cubrir: la decisión de negocio, la demo de `hist-cap1`, las tres fases, el aviso previo, qué se
cierra, el duelo local libre, las excepciones, y los dos hallazgos verificados de la sesión
(las 2.536 preguntas descargables y que **el juego no funciona sin internet**: no hay service
worker y los bancos se piden con `fetch`). **No se hace commit.**

- [ ] **Step 4: Informar a Roberto**

Decir que quedó publicado en modo inocuo, cómo activarlo cuando quiera, y recordarle que la
puerta necesita que exista antes la página comercial. Recordar que el commit espera la orden 66.

---

## Notas de revisión del plan

- **Cobertura del spec:** tres fases → Task 1; aviso → Task 2; qué se cierra y las excepciones →
  Task 3; fin de demo y contacto → Task 4. Las siete verificaciones del spec están en Task 1
  paso 3, Task 2 paso 3, Task 3 pasos 5-6, Task 4 paso 4 y Task 5 paso 1.
- **`tieneLicencia()` es función y no constante** a propósito: el spec pide que canjear a mitad
  de sesión abra la puerta sin recargar.
- **Historia es la única asignatura que se entra con la puerta cerrada**, porque dentro vive la
  demo. El candado se aplica capítulo a capítulo, no a la asignatura.
- **Riesgo de la Task 3:** es la tarea que más puntos toca. Su paso 5 exige comprobar que con
  `FECHA_PUERTA=''` **nada** cambió, además de que con la puerta cerrada todo cierra.
