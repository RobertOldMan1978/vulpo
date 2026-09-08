# `vulpo.cl/colegio` — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this
> plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Este proyecto NO usa
> worktrees ni commit hasta "orden 66": se trabaja en el working tree y se commitea al cierre.

**Goal:** Una página nueva `vulpo.cl/colegio`, con registro sobrio-institucional, que le muestra a
la dirección/UTP lo que se construyó para ese rol (el pulso del colegio, la planificación y el
cierre), con el pulso como héroe — y un enlace desde la landing raíz.

**Architecture:** Página estática `colegio/index.html` que reutiliza el sistema de CSS de la
landing raíz (Inter, tokens, `.seccion`/`.kicker`/`.tarjeta`/`.mock`/`.clara`/`.cita`) bajando la
temperatura (estrellas estáticas tenues, sin meteoros, más densidad). Las capturas se generan con
el doble del panel (`scripts/panel-demo.py`), del panel actual sobrio. Verificación **mirando la
captura** con `scripts/cdp.mjs`, no contando el DOM.

**Tech Stack:** HTML/CSS a mano (sin framework, como toda la cara web del proyecto); `panel-demo.py`
+ `cdp.mjs` para generar y verificar; Chrome headless por CDP.

**Reglas que NO se rompen** (de `docs/comercial.md`): sin precios en pesos en la cara pública; la
marca se dice *"en trámite"*, **nunca ® ni "registrada"**; **no** prometer que funciona sin
internet; **no** decir "revisadas una a una" (el 100% es de cobertura, no de método). Y de
`CLAUDE.md`: un widget/página **se aprueba mirando, no contando** — el defecto visual pasa con
"cero errores".

---

## File Structure

| Archivo | Responsabilidad |
|---|---|
| `colegio/index.html` (crear) | La página. HTML + `<style>` propio (derivado del de la raíz) + el JS mínimo de las estrellas estáticas. URL: `vulpo.cl/colegio` |
| `assets/web/panel-pulso.png` (crear) | Captura del pulso del colegio, panel actual sobrio, con "DATOS SIMULADOS" |
| `assets/web/panel-cierre.png` (crear) | Captura de la planificación / informe de cierre |
| `assets/web/panel-mapa.png` (crear) | Captura del mapa de dominio actual (reemplaza visualmente a `panel-dominio.png` viejo, solo para `/colegio`) |
| `assets/web/og-colegio.png` (crear) | Imagen Open Graph propia de `/colegio` |
| `index.html` (modificar) | Un enlace nuevo hacia `/colegio` en la sección "Para el colegio" |

⚠️ **Rutas absolutas en `colegio/index.html`:** al vivir en `/colegio/`, una ruta relativa
`assets/web/x.png` resolvería a `/colegio/assets/...` (404). Todas las rutas a assets y a otras
páginas van **absolutas** (`/assets/web/...`, `/profesor.html`, `/`). Es la contracara del
`<base href="/">` que el proyecto ya conoce.

---

## Task 1: Generar las capturas del panel actual con el doble

**Files:**
- Create: `assets/web/panel-pulso.png`, `assets/web/panel-cierre.png`, `assets/web/panel-mapa.png`
- Usa: `scripts/panel-demo.py`, `scripts/cdp.mjs` (no se modifican)

El doble ya simula `kimun_prof_pulso` con 4 cursos y cobertura, y `kimun_prof_yo` devuelve
`es_admin:true`, así que `window.ESADMINCOLEGIO` es true y el botón `#btnPulso` (🏫 El pulso del
colegio) aparece. **No hay que ajustar el doble.**

- [ ] **Step 1: Generar el panel-demo y servirlo**

```bash
cd /c/Proyectos/kimun
python scripts/panel-demo.py            # genera _panel-demo.html
python -m http.server 8765 &            # sirve desde la raíz del repo
```

- [ ] **Step 2: Escribir el archivo de pasos de cdp.mjs que captura el pulso**

Crear un archivo temporal en el scratchpad (`cap-colegio.mjs`) con:

```js
export default async (ev) => {
  await ev.escritorio(1440, 950);                       // adulto en notebook; mobile:false importa
  await ev.ir('http://localhost:8765/_panel-demo.html');
  await ev.espera(1500);
  // 1. El pulso del colegio
  await ev('document.getElementById("btnPulso")?.click()');
  await ev.espera(1200);
  await ev.foto('assets/web/panel-pulso.png');
  // 2. Volver y abrir "Ver avance" del curso 8° (CUR-BA04, donde el mapa calza)
  await ev('document.getElementById("btnVolverCab")?.click()'); await ev.espera(600);
  await ev('[...document.querySelectorAll(".avance")].find(b=>b.dataset.cod==="CUR-BA04")?.click()');
  await ev.espera(1400);
  await ev.foto('assets/web/panel-mapa.png');
  // 3. El informe de cierre / planificación: desplegar el bloque de planificación y capturar
  //    (el botón "📅 Informe de las unidades cerradas" o "📸 Cómo quedó" de una unidad con foto)
  await ev('[...document.querySelectorAll("button,summary")].find(b=>/cerradas|Cómo quedó|planificaci/i.test(b.textContent))?.click()');
  await ev.espera(1200);
  await ev.foto('assets/web/panel-cierre.png');
  return { consola: ev.consola, fallos: ev.fallos };   // ⚠️ propiedades, no funciones
};
```

Selectores confirmados contra `profesor.html`: el pulso es `#btnPulso` (línea 850, handler
`verPulso`); "Ver avance del curso" es `button.avance[data-cod]` (línea 872); el volver es
`#btnVolverCab` (línea 1305); el cierre es el botón **"📅 Informe de las unidades cerradas"**
(línea 1934) o **"📸 Cómo quedó"** (línea 1904), que aparecen dentro de "Ver avance" solo si hay
unidades cerradas con foto — el doble simula `kimun_prof_dominio_foto`, así que deberían salir.
⚠️ Si un conteo da cero, **el primer sospechoso es la prueba, no el producto**. `CUR-BA04` es el
8° del doble, donde planificación y mapa calzan (el primer curso es de 3° y sus datos de 8°,
discrepan a propósito).

- [ ] **Step 3: Correr la captura**

```bash
node scripts/cdp.mjs about:blank <scratchpad>/cap-colegio.mjs
```
Expected: tres PNG nuevos en `assets/web/`, consola y fallos vacíos.

- [ ] **Step 4: MIRAR las tres capturas (no contar)**

Abrir cada PNG con la herramienta Read. Comprobar de verdad: el pulso muestra **varios cursos con
cobertura por asignatura** y participación; el mapa muestra objetivos ordenados de peor a mejor con
sus barras; el cierre muestra la comparación de una unidad. Si alguna salió a medio dibujar (el
panel arma su pantalla después del `load`), subir el `ev.espera`. **Una captura equivocada es peor
que ninguna: se publica y nadie la mira dos veces** (lección del tutorial, Sesión 88).

- [ ] **Step 5: Confirmar que llevan datos simulados de forma legible**

Las tres son de un colegio de demostración. La etiqueta "DATOS SIMULADOS" se sobrepone **en la
página** (paso de la Task 3/5, con `.simulado`), no en la captura — así que aquí solo se verifica
que ningún dato parezca real (nombres de fantasía, no de alumnos reales). El doble usa nombres
inventados; confirmarlo mirando.

---

## Task 2: El esqueleto de `colegio/index.html` — head, estilo sobrio y hero

**Files:**
- Create: `colegio/index.html`

- [ ] **Step 1: Crear el `<head>` con OG propio y rutas absolutas**

```html
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>VULPO para tu colegio · El programa del año, curso por curso</title>
<meta name="description" content="VULPO le muestra a la dirección y la UTP cuánto del programa del año lleva cada curso, objetivo por objetivo — el trabajo que hoy se persigue con planillas. Alineado a las Bases Curriculares, de 3° a 8° básico.">
<link rel="icon" type="image/png" href="/assets/web/vulpo-logo-320.png">
<link rel="apple-touch-icon" href="/assets/web/vulpo-logo-320.png">
<meta name="theme-color" content="#0e1219">
<meta property="og:type" content="website">
<meta property="og:title" content="VULPO para tu colegio">
<meta property="og:description" content="El programa del año, curso por curso: cuánto se ha cubierto de cada objetivo, para la dirección y la UTP.">
<meta property="og:image" content="https://vulpo.cl/assets/web/og-colegio.png">
<meta property="og:url" content="https://vulpo.cl/colegio">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Titan+One&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
/* ... (Step 2) ... */
</style>
</head>
```

- [ ] **Step 2: El `<style>` — copiar el de la raíz y bajar la temperatura**

Copiar íntegro el bloque `<style>` de `index.html` (raíz) y cambiar SOLO estas tres cosas, para el
registro sobrio-institucional del spec (Sesión 106: le habla a una UTP con presupuesto):

1. **Estrellas estáticas, sin animación, y sin meteoros.** Reemplazar el `@keyframes tw` / `.shoot`
   por estrellas quietas y tenues; eliminar el bloque `.shoot`/`shootFall`/`METEOROS`. El fondo
   deja de "jugar":
   ```css
   .stars span{position:absolute;width:2px;height:2px;border-radius:50%;background:#fff;opacity:.28}
   /* sin @keyframes tw, sin .shoot */
   ```
2. **Fondo un punto más neutro** (menos saturación de juego), conservando el violeta como acento:
   ```css
   :root{ --bg1:#0f1024; --bg2:#1b1740; /* resto de tokens igual */ }
   ```
3. Nada más. `.seccion`, `.kicker`, `.tarjeta`, `.rejilla`, `.btn`, `.mock`, `.clara`, `.cita`,
   `.franja`, `.prof-top` se reutilizan **idénticos** — es lo que mantiene la marca y evita
   reescribir CSS.

- [ ] **Step 3: El `<body>`, las estrellas estáticas y el hero institucional**

```html
<body>
<div class="stars" id="stars" aria-hidden="true"></div>
<a class="prof-top" href="/profesor.html" aria-label="Panel del profesor"><span class="ic" aria-hidden="true">🧑‍🏫</span> Profes</a>

<header class="envoltura" style="padding-top:48px;padding-bottom:26px;text-align:center">
  <img src="/assets/web/vulpo-logo.png" alt="VULPO"
       style="width:min(150px,38vw);height:auto;display:block;margin:0 auto 22px">
  <h1 style="max-width:860px;margin:0 auto">Sabe exactamente cuánto del programa<br>lleva cada curso.</h1>
  <p class="dim" style="max-width:680px;margin:18px auto 0;font-size:clamp(16px,2.3vw,19px)">
    VULPO no mide solo cuánto juegan tus alumnos: mide, <b style="color:var(--txt)">objetivo por
    objetivo</b>, cuánto del programa del año ya trabajó cada curso — el trabajo que hoy la UTP
    persigue con planillas.
  </p>
  <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:26px">
    <a class="btn" href="https://calendar.app.google/uPos9ki8Xna17JYy7">📅 Agenda una demo de 15 minutos</a>
    <a class="btn wa" href="https://wa.me/56976684967?text=Hola%2C%20vi%20VULPO%20y%20quiero%20saber%20m%C3%A1s%20para%20mi%20colegio.">Escríbenos por WhatsApp</a>
  </div>
</header>
<!-- franja de legitimidad + secciones (Tasks siguientes) -->
</body></html>
```

⚠️ `https://calendar.app.google/uPos9ki8Xna17JYy7` y `https://wa.me/56976684967?text=Hola%2C%20vi%20VULPO%20y%20quiero%20saber%20m%C3%A1s%20para%20mi%20colegio.`: copiar los `href` **exactos** de la sección "Sin riesgo" de
`index.html` (raíz), no inventarlos. El de agenda es el enlace de Google Calendar de la Sesión 101;
el de WhatsApp lleva el `+569 7668 4967`.

- [ ] **Step 4: El script de las estrellas estáticas al final del body**

```html
<script>
(function(){
  var c=document.getElementById('stars'), n=window.matchMedia('(prefers-reduced-motion: reduce)').matches?28:44;
  var h='';
  for(var i=0;i<n;i++) h+='<span style="left:'+(Math.random()*100).toFixed(2)+'%;top:'+(Math.random()*100).toFixed(2)+'%"></span>';
  c.innerHTML=h;
})();
</script>
```

- [ ] **Step 5: Verificar el esqueleto**

```bash
python -m http.server 8765 &
node scripts/cdp.mjs about:blank <pasos que abren http://localhost:8765/colegio/ y ev.foto>
```
MIRAR la captura: el hero se lee, el logo es pequeño (no titular), el fondo es sobrio (estrellas
tenues, sin meteoros), los dos CTA presentes. Sin desborde a 375 px (repetir con `ev.movil(375,780)`).
`ev.consola` y `ev.fallos` vacíos (salvo el 404 esperado de las imágenes que aún no se referencian).

---

## Task 3: La sección héroe — el pulso del colegio

**Files:**
- Modify: `colegio/index.html` (agregar la sección tras el hero)

- [ ] **Step 1: La franja de legitimidad + la sección del pulso**

Insertar tras el `</header>`. Reutiliza `.franja`, `.seccion`, `.kicker`, `.cita`, `.mock`:

```html
<div class="franja"><div class="in">
  <span><b>MINEDUC</b> · alineado a las Bases Curriculares</span>
  <span><b>6 cursos</b> · de 3° a 8° básico</span>
  <span><b>16.865</b> preguntas aprobadas</span>
  <span>Prueba <b>sin costo</b></span>
</div></div>

<section class="seccion envoltura">
  <span class="kicker">Para la dirección y la UTP</span>
  <h2>El programa del año, curso por curso, de un vistazo.</h2>
  <p class="dim" style="max-width:760px">
    El Ministerio de Educación reconoce los cuestionarios interactivos —como Kahoot o Quizizz— como
    apoyo válido de la evaluación formativa. Esos miden <b style="color:var(--txt)">actividad</b>.
    VULPO va más allá: sabe, <b style="color:var(--txt)">objetivo por objetivo, cuánto del programa
    del año ya trabajó cada curso</b>, y cuánto falta por tocar. Es el trabajo que hoy tu UTP
    persigue con planillas — y se lee en una pantalla, o se imprime para el consejo.
  </p>
  <p class="dim" style="font-size:13px;margin-top:10px">
    La imagen corresponde a un <b>colegio de demostración</b>: los cursos y los porcentajes son simulados.
  </p>
  <div class="marco-captura mock" style="margin-top:20px">
    <div class="barra"><i></i><i></i><i></i></div>
    <img class="captura" src="/assets/web/panel-pulso.png"
         alt="El pulso del colegio: una fila por curso, con cuántos objetivos del año tienen actividad, desglosado por asignatura, y la participación de la semana.">
    <span class="simulado">DATOS SIMULADOS</span>
  </div>
  <p class="pie-captura">Una fila por curso: cuánto del programa se ha cubierto, y quién está entrando. Imprimible en una hoja.</p>
  <div class="rejilla" style="margin-top:26px">
    <div class="tarjeta"><h3 style="color:var(--cyan)">Cobertura real</h3>
      <p class="dim" style="font-size:14px;margin-top:6px">Cuántos de los objetivos del año ya se trabajaron, por curso y por asignatura. El denominador es honesto: VULPO tiene contenido para todo el programa, así que "31 de 86" significa de verdad "faltan 55 por tocar".</p></div>
    <div class="tarjeta"><h3 style="color:var(--cyan)">Participación</h3>
      <p class="dim" style="font-size:14px;margin-top:6px">Cuántos alumnos de cada curso entraron esta semana. De un vistazo, sin abrir curso por curso.</p></div>
    <div class="tarjeta"><h3 style="color:var(--cyan)">Para llevar al consejo</h3>
      <p class="dim" style="font-size:14px;margin-top:6px">La vista se imprime en una hoja, con la fecha. Sin nombres de alumnos, sin ranking de profesores: hechos, no juicios.</p></div>
  </div>
</section>
```

- [ ] **Step 2: Verificar la sección del pulso**

Correr la captura y MIRAR: la imagen del pulso se ve dentro del marco de ventana, la etiqueta
"DATOS SIMULADOS" está sobre la imagen, las tres tarjetas se leen. Sin desborde a 375 px.

---

## Task 4: La sección de planificación y cierre

**Files:**
- Modify: `colegio/index.html`

- [ ] **Step 1: La sección (fondo claro, para que resalte y dé aire de documento)**

```html
<section class="seccion clara">
 <div class="envoltura">
  <span class="kicker">Planificación del año</span>
  <h2>En diciembre, no sirve ver avances de lo que se pasó en abril.</h2>
  <p class="dim" style="max-width:760px">
    La UTP declara cuándo se pasa cada unidad. VULPO fecha cada objetivo y, cuando una unidad
    cierra, <b style="color:#1c1540">reconstruye cómo quedó el curso en ese momento</b> — no
    mezclado con lo que se está viendo hoy. Así el informe de fin de año dice cómo estaba cada
    curso cuando de verdad terminó cada unidad.
  </p>
  <p class="dim" style="font-size:13px;margin-top:10px">
    Imagen de un <b>colegio de demostración</b>: los datos son simulados.
  </p>
  <div class="marco-captura mock" style="margin-top:20px">
    <div class="barra"><i></i><i></i><i></i></div>
    <img class="captura" src="/assets/web/panel-cierre.png"
         alt="Informe de cierre de una unidad: cómo estaba el curso cuando la unidad terminó, comparado con hoy.">
    <span class="simulado">DATOS SIMULADOS</span>
  </div>
  <p class="pie-captura">El avance se ordena por momento del año: lo que se está pasando arriba, lo terminado al historial.</p>
 </div>
</section>
```

- [ ] **Step 2: Verificar** — MIRAR la captura: sección clara, imagen del cierre legible, texto oscuro
sobre claro sin problemas de contraste. Sin desborde a 375 px.

---

## Task 5: La sección "Para el profesor" y la de privacidad

**Files:**
- Modify: `colegio/index.html`

- [ ] **Step 1: "Para el profesor" — traída de la raíz, con la captura del mapa actual**

Adaptar la sección "Para el profesor" de `index.html` (raíz), pero con `/assets/web/panel-mapa.png`
(la captura nueva del panel sobrio) en vez de `panel-dominio.png`. Fondo oscuro (contraste con la
sección clara de arriba):

```html
<section class="seccion envoltura">
  <span class="kicker">Y tu equipo docente</span>
  <h2>El panel le dice al profesor qué reforzar, y con quién.</h2>
  <p class="dim" style="max-width:760px">
    El mapa de dominio ordena los objetivos de peor a mejor logro y muestra quiénes necesitan
    apoyo en cada uno. El profesor puede lanzar un desafío de refuerzo al curso en un clic, y ve
    quién jugó esta semana. <b style="color:var(--txt)">Es una brújula para reforzar, no una nota:
    no sirve para calificar y no está pensado para eso.</b>
  </p>
  <p class="dim" style="font-size:13px;margin-top:10px">
    Imagen de un <b>curso de demostración</b>: nombres y porcentajes simulados.
  </p>
  <div class="marco-captura mock" style="margin-top:20px">
    <div class="barra"><i></i><i></i><i></i></div>
    <img class="captura" src="/assets/web/panel-mapa.png"
         alt="Mapa de dominio del curso: objetivos ordenados de menor a mayor logro, con cuántos alumnos respaldan cada uno.">
    <span class="simulado">DATOS SIMULADOS</span>
  </div>
  <p class="pie-captura">Avance por objetivo: lo que está más flojo, primero.</p>
</section>
```

- [ ] **Step 2: "Sin calificar, datos cuidados" — la objeción de la UTP**

```html
<section class="seccion clara">
 <div class="envoltura">
  <span class="kicker">Privacidad y buen uso</span>
  <h2>Una brújula para reforzar, no una herramienta para calificar.</h2>
  <div class="rejilla" style="margin-top:8px">
    <div class="tarjeta"><h3>No pone notas</h3>
      <p class="dim" style="font-size:14px;margin-top:6px">El Decreto 67 recomienda que la evaluación formativa no se califique. VULPO entrega información para reforzar, no para poner nota.</p></div>
    <div class="tarjeta"><h3>No evalúa docentes</h3>
      <p class="dim" style="font-size:14px;margin-top:6px">El pulso muestra cobertura y participación —hechos—, no un ranking de cursos por rendimiento. No hay tabla que ordene a los profesores.</p></div>
    <div class="tarjeta"><h3>Datos de menores cuidados</h3>
      <p class="dim" style="font-size:14px;margin-top:6px">El informe que ve la familia se mira en el teléfono del niño y no sale de ahí. El colegio ve avance por objetivo, no un expediente de cada alumno.</p></div>
  </div>
 </div>
</section>
```

- [ ] **Step 3: Verificar** — MIRAR: las dos secciones, la captura del mapa nueva (sobria, no la
vieja colorida), las tarjetas de privacidad. Contraste de la sección clara OK. Sin desborde 375 px.

---

## Task 6: Cómo se implementa, cierre con CTA, y footer

**Files:**
- Modify: `colegio/index.html`

- [ ] **Step 1: "Cómo se implementa" + "Prueba sin costo" + footer**

```html
<section class="seccion envoltura">
  <span class="kicker">Cómo se implementa</span>
  <h2>Sin instalar nada, sin cambiar tu regla del celular en la sala.</h2>
  <p class="dim" style="max-width:760px">
    El colegio crea sus cursos, el profesor inscribe a sus alumnos y cada uno recibe un código
    personal. Los alumnos juegan <b style="color:var(--txt)">desde casa, en su teléfono</b> —como
    una tarea que sí quieren hacer— y el profesor llega a clase sabiendo qué reforzar. No hay app
    que instalar ni computadores que comprar.
  </p>
</section>

<section class="seccion envoltura" style="text-align:center">
  <span class="kicker">Sin riesgo</span>
  <h2 style="max-width:640px;margin:0 auto 12px">Pruébalo en tu colegio, sin costo.</h2>
  <p class="dim" style="max-width:600px;margin:0 auto 24px">
    Coordinemos una demostración de 15 minutos con tu equipo. Cuesta menos que una hora de
    reforzamiento particular por alumno, y la prueba no tiene costo.
  </p>
  <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
    <a class="btn" href="https://calendar.app.google/uPos9ki8Xna17JYy7">📅 Agenda una demo de 15 minutos</a>
    <a class="btn wa" href="https://wa.me/56976684967?text=Hola%2C%20vi%20VULPO%20y%20quiero%20saber%20m%C3%A1s%20para%20mi%20colegio.">Prefiero escribir por WhatsApp</a>
  </div>
</section>

<footer>
  <p>VULPO · Plataforma educativa de 3° a 8° básico · <a href="/">Ver el sitio completo</a> · <a href="/profesor.html">Panel del profesor</a></p>
  <p style="margin-top:8px">contacto@vulpo.cl · +569 7668 4967</p>
</footer>
```

⚠️ `https://calendar.app.google/uPos9ki8Xna17JYy7` / `https://wa.me/56976684967?text=Hola%2C%20vi%20VULPO%20y%20quiero%20saber%20m%C3%A1s%20para%20mi%20colegio.`: los mismos `href` exactos que en la raíz. **Sin precios en
pesos** — "cuesta menos que una hora de reforzamiento particular" es la fórmula aprobada
(`comercial.md`), los números van en la propuesta, no en la página.

- [ ] **Step 2: `node --check` del JS embebido** — extraer el `<script>` de las estrellas y correr
`node --check` para que no haya un error de sintaxis que mate la página. (Es una función, no hay
más JS.)

- [ ] **Step 3: Verificar la página completa** — recorrerla entera con `cdp.mjs`, MIRANDO capturas
a 1280 y a 375 px: sin desborde horizontal, las seis secciones presentes, los CTA al final navegan
(comprobar los `href`, no solo que existan). `ev.consola` y `ev.fallos` vacíos.

---

## Task 7: El enlace desde la landing raíz

**Files:**
- Modify: `index.html` (raíz), sección "Para el colegio" (~línea 210, tras el bloque "Cómo se implementa")

- [ ] **Step 1: Agregar el enlace a `/colegio` en la sección "Para el colegio"**

Tras la tarjeta "Cómo se implementa" (que cierra en `</div>` antes del `</section>` de la sección
"Para el colegio"), agregar un llamado claro para la dirección:

```html
  <div class="tarjeta" style="margin-top:14px;border-color:var(--violet)">
    <h3 style="color:var(--violet)">¿Diriges un colegio o la UTP?</h3>
    <p class="dim" style="font-size:15px;margin-top:8px">
      Hay una página pensada para ti: el <b style="color:var(--txt)">pulso del colegio</b> —cuánto
      del programa lleva cada curso—, la planificación del año y lo que ve tu equipo docente.
    </p>
    <a class="btn sec" style="margin-top:14px" href="/colegio">Ver el panel de gestión →</a>
  </div>
```

- [ ] **Step 2: Verificar** — MIRAR la landing raíz: el enlace nuevo aparece en "Para el colegio",
navega a `/colegio` de verdad (no solo que el `href` exista). La raíz no se rompió en nada más.

---

## Task 8: La imagen Open Graph de `/colegio`

**Files:**
- Create: `assets/web/og-colegio.png`

- [ ] **Step 1: Generar la OG**

La OG de `/colegio` debe verse institucional al compartir el enlace por correo/WhatsApp a un
director. Opción simple y coherente con el proyecto: una captura del **hero de `/colegio`** a
1200×630 (el tamaño OG), o el hero sobre el pulso. Generar con `cdp.mjs`:

```js
export default async (ev) => {
  await ev.escritorio(1200, 630);
  await ev.ir('http://localhost:8765/colegio/');
  await ev.espera(1200);
  await ev.foto('assets/web/og-colegio.png');
};
```

- [ ] **Step 2: MIRAR la OG** — a 1200×630 el hero se lee, el logo y el titular caben, no queda
texto cortado. Si el hero solo no basta, componer con el titular + un recorte del pulso.

---

## Verificación final (antes de la orden 66)

- [ ] La página completa a **1280 y 375 px**, MIRANDO las capturas: sin desborde horizontal, las
  seis secciones, las tres imágenes del panel cargando (no 404), los CTA navegando.
- [ ] **Las tres capturas del panel muestran el panel ACTUAL sobrio** (Inter, neutro), no el viejo
  violeta — es el punto entero del registro. Comparar con `panel-dominio.png` viejo para confirmar
  que son distintas.
- [ ] El enlace desde la raíz navega a `/colegio`, y `/colegio` enlaza de vuelta a `/` y a
  `/profesor.html`.
- [ ] La OG resuelve (`og-colegio.png` existe y se referencia con URL absoluta).
- [ ] **Reglas de `comercial.md`**: ningún `$` ni precio en pesos; sin "®" ni "registrada"; sin
  "una a una"; sin "funciona sin internet". Grep de control:
  `grep -iE '\$[0-9]|registrada|®|una a una|sin internet|sin conexión' colegio/index.html` → vacío.
- [ ] `ev.consola` y `ev.fallos` vacíos.

---

## Fuera de alcance (del spec)

- Rehacer las 3 capturas del panel viejo que siguen en la landing raíz (deuda visual de la raíz).
- Precios/propuesta/guion (viven fuera del repo).
- Cambiar el panel del profesor o el modelo de datos.
