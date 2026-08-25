# Página de presentación + traslado del juego a `/juego` — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: usa superpowers:subagent-driven-development (recomendado) o superpowers:executing-plans para ejecutar este plan tarea por tarea. Los pasos usan casillas (`- [ ]`) para seguimiento.

**Goal:** Que `vulpo.cl` muestre una página de presentación comercial y el juego pase a vivir en `vulpo.cl/juego`, sin romper nada de lo que ya funciona.

**Architecture:** Dos fases. Primero se mueve el juego a `juego/index.html` con `<base href="/">`, que arregla de una línea las 118 rutas relativas, y se verifica completo. Después se escribe la página nueva en la raíz: un solo HTML con CSS embebido, misma paleta y tipografías del juego, y capturas reales tomadas del navegador.

**Tech Stack:** HTML y CSS a mano, sin framework ni compilación. GitHub Pages sirve los archivos tal cual.

**Fuente de verdad del diseño:** `docs/superpowers/specs/2026-08-24-pagina-presentacion-design.md`.

## Global Constraints

- **NO se hace commit ni push** en ningún paso. Se espera la **orden 66**.
- **No hay tests automatizados.** Verificación en el navegador con `preview_start`, DOM, red y consola.
- **`FECHA_PUERTA` sigue vacía** al terminar. Esta página no activa la puerta.
- **Nada inventado.** Sin testimonios, sin cifras que no estén respaldadas, sin capturas simuladas. Las únicas cifras permitidas son: **4 asignaturas** y **2.536 preguntas** (663 Historia + 603 Matemáticas + 534 Ciencias + 514 Lenguaje + 150 Vocabulario + 72 Ana Frank), todas marcadas como revisadas.
- **No prometer que funciona sin internet.** Verificado en la Sesión 44 que no funciona.
- **Contacto:** WhatsApp al **+569 7668 4967** (enlace `https://wa.me/56976684967`), y el correo **vulpochile.app@gmail.com** discreto en el pie.
- **Paleta exacta del juego:** `--bg1:#140f33; --bg2:#2a1b5e; --panel:#1e1747; --panel2:#271f56; --gold:#ffc93c; --cyan:#4dd8ff; --green:#3ee089; --pink:#ff4d8d; --violet:#8f6bff; --txt:#f3f0ff; --dim:#a89fd6;`
- **Tipografías:** Titan One (títulos) y Nunito 600/800/900 (texto), desde Google Fonts, igual que el juego.
- **Responsive en los dos sentidos:** debe verse bien a 375px y a 1280px, sin desborde horizontal.
- Idioma: **español de Chile**, sin tuteo excesivo ni jerga comercial vacía.

---

## Estructura de archivos

- **`juego/index.html`** (mover desde `index.html`) — el juego, con `<base href="/">`.
- **`index.html`** (nuevo, raíz) — la página de presentación. HTML + CSS embebido, un solo archivo. Es lo mismo que hace el resto del proyecto y mantiene el despliegue trivial.
- **`assets/web/`** (nueva carpeta) — capturas reales para la página. Se separa de `assets/` para no mezclar material comercial con los recursos del juego.
- **`profesor.html`** (modificar) — una línea: el botón del armador.
- **`README.md`** y **`CLAUDE.md`** (modificar) — direcciones nuevas y bitácora.

**Orden:** Task 1 (mover y verificar) → Task 2 (capturas) → Task 3 (la página) → Task 4 (responsive y metadatos) → Task 5 (verificación integral + docs).

---

### Task 1: Mover el juego a `/juego`

Al terminar, el juego funciona completo desde `/juego/` y la raíz queda libre. Todavía no hay página nueva: la raíz dará 404, y está bien.

**Files:**
- Move: `index.html` → `juego/index.html`
- Modify: `juego/index.html` (una línea), `profesor.html` (una línea)

- [ ] **Step 1: Mover el archivo conservando el historial**

```bash
mkdir -p juego && git mv index.html juego/index.html
```

- [ ] **Step 2: Agregar `<base href="/">`**

En `juego/index.html`, insertarlo como **primera** etiqueta dentro de `<head>`, antes del
`<meta charset>`:

```html
<head>
<base href="/">
<meta charset="UTF-8">
```

Comentario obligatorio encima, para que nadie lo borre por parecer inútil:

```html
<!-- El juego vive en /juego/ pero sus 118 rutas relativas (assets/, contenido/) apuntan a la
     raíz del sitio. Esta línea las resuelve. NO borrar: sin ella el juego queda sin imágenes
     ni preguntas. Es válida porque el sitio vive en el dominio propio vulpo.cl. -->
```

- [ ] **Step 3: Apuntar el botón del armador a la ruta nueva**

En `profesor.html`:

```js
      $('btnArmar').onclick=()=>{ window.location.href='/juego/?armar=1'; };
```

- [ ] **Step 4: Verificar el juego completo desde la ruta nueva**

Con `preview_start` (config `kimun`, puerto 8765), abrir `http://localhost:8765/juego/` y
comprobar:

1. El juego carga: se ve la pantalla "¿Cómo quieres entrar?" con la mascota.
2. Con `read_network_requests`, **cero 404** salvo los `portada-*.png` que ya fallaban por
   convención antes de este cambio (`portada-mate-exp-*`, `portada-lect-anafrank`).
3. Entrar a Historia, capítulo 1, jugar una etapa completa y volver al mapa.
4. `read_console_messages` sin errores.

- [ ] **Step 5: Verificar los cuatro parámetros ocultos desde la ruta nueva**

| URL | Esperado |
|---|---|
| `/juego/?qa=1` | Desbloquea y marca respuestas, badge verde |
| `/juego/?solo=hist-cap2,hist-cap3` | Dos tarjetas, 2 y 3, abiertas |
| `/juego/?armar=1` | El armador, con sus 20 capítulos |
| `/juego/?m=aGlzdC1jYXAyfHw` | Abre el capítulo 2 (token sin caducidad) |

- [ ] **Step 6: Verificar que el armador se adapta solo**

En `/juego/?armar=1`, marcar `hist-cap2` y comprobar que el enlace generado empieza por
`http://localhost:8765/juego/?m=` — **no** por `http://localhost:8765/?m=`. Es la prueba de que
`location.origin+location.pathname` hace su trabajo sin tocar código.

- [ ] **Step 7: Verificar el panel y el tablero**

`http://localhost:8765/profesor.html` carga sin errores de consola, y
`http://localhost:8765/dev/tablero.html` sigue abriendo.

---

### Task 2: Las capturas reales

**Files:**
- Create: `assets/web/juego-mapa.png`, `assets/web/juego-quiz.png`, `assets/web/panel-dominio.png`, `assets/web/og.png`

- [ ] **Step 1: Capturar el mapa del juego**

En `http://localhost:8765/juego/?qa=1`, entrar a Historia → capítulo 1, y con
`computer{action:"screenshot"}` capturar la pantalla del mapa (la ruta con los 5 nodos).
Guardar como `assets/web/juego-mapa.png`.

- [ ] **Step 2: Capturar una pregunta**

Desde el mismo mapa, entrar a la primera etapa **sin** `?qa=1` (para que no salga la respuesta
marcada, que en una página comercial se vería mal) y capturar la pantalla del quiz.
Guardar como `assets/web/juego-quiz.png`.

- [ ] **Step 3: Capturar el mapa de dominio del panel**

`profesor.html` necesita sesión, que no se puede iniciar desde el entorno de desarrollo. Se usa
el procedimiento de sesiones anteriores: abrir el panel y sustituir `SB.rpc` por un stub que
devuelva datos de ejemplo del mapa de dominio, con nombres **ficticios y evidentes** (Curso 8°A
de demostración, alumnos "Alumno 1", "Alumno 2"). **Nunca datos de alumnos reales en material
comercial.** Capturar y guardar como `assets/web/panel-dominio.png`.

- [ ] **Step 4: Preparar la imagen de vista previa**

Copiar `assets/kimun-512.png` a `assets/web/og.png`. Es la imagen que verá quien pegue el
enlace en WhatsApp. (Si más adelante se quiere una imagen compuesta con el logotipo y una frase,
se reemplaza ese archivo sin tocar el HTML.)

- [ ] **Step 5: Verificar los archivos**

```bash
ls -la assets/web/
```

Los cuatro archivos existen y ninguno está vacío.

---

### Task 3: La página de presentación

**Files:**
- Create: `index.html` (raíz)

- [ ] **Step 1: Crear el esqueleto con la identidad visual**

`index.html` en la raíz, con el `<head>` completo y el CSS embebido. Paleta y tipografías
idénticas al juego:

```html
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>VULPO · Aprende jugando — Plataforma educativa para 8° básico</title>
<meta name="description" content="Juego educativo alineado al currículum chileno de 8° básico. Cuatro asignaturas, 2.536 preguntas revisadas, y un panel que le muestra al profesor qué le está costando a su curso.">
<link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32.png">
<meta name="theme-color" content="#1e1747">
<meta property="og:type" content="website">
<meta property="og:title" content="VULPO · Aprende jugando">
<meta property="og:description" content="Juego educativo alineado al currículum chileno de 8° básico, con panel para el profesor.">
<meta property="og:image" content="https://vulpo.cl/assets/web/og.png">
<meta property="og:url" content="https://vulpo.cl/">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Titan+One&family=Nunito:wght@600;800;900&display=swap" rel="stylesheet">
<style>
:root{
  --bg1:#140f33; --bg2:#2a1b5e; --panel:#1e1747; --panel2:#271f56;
  --gold:#ffc93c; --cyan:#4dd8ff; --green:#3ee089; --pink:#ff4d8d; --violet:#8f6bff;
  --txt:#f3f0ff; --dim:#a89fd6; --r:18px;
}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Nunito',sans-serif;color:var(--txt);background:linear-gradient(160deg,var(--bg1),var(--bg2));
  min-height:100vh;line-height:1.6;overflow-x:hidden}
.envoltura{max-width:1080px;margin:0 auto;padding:0 20px}
h1,h2{font-family:'Titan One',cursive;font-weight:400;line-height:1.15;letter-spacing:.5px}
h1{font-size:clamp(30px,6vw,54px);color:var(--gold)}
h2{font-size:clamp(23px,4vw,36px);color:var(--cyan);margin-bottom:14px}
p{font-weight:600}
.seccion{padding:56px 0;border-top:1px solid #ffffff14}
.tarjeta{background:var(--panel);border:2px solid #ffffff14;border-radius:var(--r);padding:22px}
.rejilla{display:grid;gap:18px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
.btn{display:inline-block;text-decoration:none;padding:15px 28px;border-radius:16px;
  font-family:'Titan One',cursive;font-size:18px;color:#2a1400;
  background:linear-gradient(180deg,var(--gold),#ff9d3c);box-shadow:0 6px 0 #b56a10}
.btn.wa{background:linear-gradient(180deg,#3ee089,#1fa862);color:#04231a;box-shadow:0 6px 0 #14663c}
.btn:active{transform:translateY(4px);box-shadow:none}
img.captura{width:100%;border-radius:var(--r);border:2px solid #ffffff22;display:block}
.dato{font-family:'Titan One',cursive;font-size:34px;color:var(--gold);display:block}
ul{list-style:none}
li{position:relative;padding-left:22px}
li::before{content:"º6";position:absolute;left:0;color:var(--gold)}
footer{padding:34px 0;text-align:center;color:var(--dim);font-size:13px;font-weight:800}
footer a{color:var(--cyan)}
</style>
</head>
<body>
</body>
</html>
```

- [ ] **Step 2: Escribir la portada**

Dentro de `<body>`, primera sección:

```html
<header class="envoltura" style="padding-top:52px;padding-bottom:30px;text-align:center">
  <img src="assets/kimun-512.png" alt="Vulpi, la mascota de VULPO" width="150" height="150" style="margin-bottom:8px">
  <h1>VULPO</h1>
  <p style="font-size:clamp(17px,2.6vw,22px);color:var(--txt);max-width:640px;margin:12px auto 0">
    Un juego que enseña el currículum chileno de 8° básico, y que le dice al profesor
    exactamente qué le está costando a su curso.
  </p>
  <div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-top:28px">
    <a class="btn" href="/juego">🎮 Probar la demo</a>
    <a class="btn wa" href="https://wa.me/56976684967?text=Hola%2C%20vi%20VULPO%20y%20quiero%20saber%20m%C3%A1s%20para%20mi%20colegio." target="_blank" rel="noopener">💬 Hablemos por WhatsApp</a>
  </div>
</header>
```

- [ ] **Step 3: Escribir la sección del colegio**

```html
<section class="seccion envoltura">
  <h2>Para el colegio</h2>
  <p style="max-width:720px">
    VULPO no es un juego suelto: es contenido alineado a las Bases Curriculares
    más un panel que convierte lo que juegan los alumnos en información útil para el profesor.
  </p>
  <div class="rejilla" style="margin-top:26px">
    <div class="tarjeta"><span class="dato">4</span>
      <b>asignaturas</b>
      <p style="color:var(--dim);font-size:14px;margin-top:6px">Historia, Matemática, Ciencias y Lenguaje, con los Objetivos de Aprendizaje del año completo.</p></div>
    <div class="tarjeta"><span class="dato">2.536</span>
      <b>preguntas revisadas</b>
      <p style="color:var(--dim);font-size:14px;margin-top:6px">Originales, alineadas al currículum de 8° básico, todas aprobadas una a una.</p></div>
    <div class="tarjeta"><span class="dato">1</span>
      <b>panel para el profesor</b>
      <p style="color:var(--dim);font-size:14px;margin-top:6px">Ranking real por curso, participación semanal y mapa de dominio por objetivo de aprendizaje.</p></div>
  </div>
  <img class="captura" src="assets/web/juego-quiz.png" alt="Una pregunta de Historia dentro del juego, con sus cuatro alternativas" style="margin-top:22px;max-width:420px">
  <div class="tarjeta" style="margin-top:22px">
    <b style="color:var(--cyan)">Cómo se implementa</b>
    <p style="color:var(--dim);font-size:15px;margin-top:8px">
      El colegio crea sus cursos, el profesor inscribe a sus alumnos y cada uno recibe un código
      personal. Los alumnos entran desde su teléfono. No hay que instalar nada.
    </p>
  </div>
</section>
```

- [ ] **Step 4: Escribir la sección del profesor**

```html
<section class="seccion envoltura">
  <h2>Para el profesor</h2>
  <p style="max-width:720px">
    El mapa de dominio ordena los objetivos de aprendizaje de peor a mejor logro, y dice
    quiénes necesitan apoyo en cada uno. Es una brújula para decidir qué reforzar en clase:
    <b>no sirve para calificar, y no está pensado para eso.</b>
  </p>
  <img class="captura" src="assets/web/panel-dominio.png" alt="Mapa de dominio del panel del profesor, con los objetivos de aprendizaje ordenados por logro" style="margin-top:22px">
  <div class="rejilla" style="margin-top:22px">
    <div class="tarjeta"><b>Desafíos de refuerzo</b>
      <p style="color:var(--dim);font-size:14px;margin-top:6px">El profesor lanza un desafío sobre el objetivo que está flojo y le llega a todo el curso.</p></div>
    <div class="tarjeta"><b>Participación</b>
      <p style="color:var(--dim);font-size:14px;margin-top:6px">Quién jugó esta semana y quién no ha entrado nunca.</p></div>
    <div class="tarjeta"><b>Ranking real</b>
      <p style="color:var(--dim);font-size:14px;margin-top:6px">Los compañeros compiten con datos de verdad, por curso y por asignatura.</p></div>
  </div>
</section>
```

- [ ] **Step 5: Escribir la sección del apoderado**

```html
<section class="seccion envoltura">
  <h2>Para la familia</h2>
  <div class="rejilla" style="align-items:center">
    <div>
      <p>
        VULPO nació porque un papá chileno quiso ayudar a su hijo de 8° básico a estudiar
        <b>con los medios que ellos ya usan</b>: el teléfono.
      </p>
      <ul style="margin:16px 0 0 20px;font-weight:600">
        <li style="margin-bottom:10px"><b style="color:var(--gold)">Se hace suyo.</b>
          Gana monedas jugando y personaliza a su Vulpi con skins. Ningún zorro es igual a otro.</li>
        <li style="margin-bottom:10px"><b style="color:var(--gold)">Le pica.</b>
          Compite con sus propios compañeros de curso y ve cómo sube en el ranking, con datos de verdad.</li>
        <li><b style="color:var(--gold)">Vuelve solo.</b>
          Persigue la próxima skin y el primer lugar, no la tarea.</li>
      </ul>
      <p style="margin-top:16px;font-size:17px">
        Y mientras tanto está repasando los objetivos de aprendizaje del año.
        <b style="color:var(--cyan)">Sin darse cuenta, está aprendiendo.</b>
      </p>
      <p style="margin-top:12px;color:var(--dim);font-size:15px">
        Se juega desde el teléfono, en vertical, y cada capítulo toma unos minutos.
      </p>
      <a class="btn" href="/juego" style="margin-top:20px">🎮 Probar la demo</a>
    </div>
    <img class="captura" src="assets/web/juego-mapa.png" alt="Mapa de una expedición de Historia dentro del juego">
  </div>
</section>
```

- [ ] **Step 6: Escribir el cierre y el pie**

```html
<section class="seccion envoltura" style="text-align:center">
  <h2 style="color:var(--gold)">¿Lo llevamos a tu colegio?</h2>
  <p style="max-width:560px;margin:0 auto 24px">
    Cuéntame de tu curso y vemos cómo implementarlo. Sin compromiso.
  </p>
  <a class="btn wa" href="https://wa.me/56976684967?text=Hola%2C%20vi%20VULPO%20y%20quiero%20saber%20m%C3%A1s%20para%20mi%20colegio." target="_blank" rel="noopener">💬 Hablemos por WhatsApp</a>
</section>
<footer class="envoltura">
  VULPO · Creado por Roberto Lorca Pacheco, en Chile<br>
  <a href="mailto:vulpochile.app@gmail.com">vulpochile.app@gmail.com</a>
</footer>
```

- [ ] **Step 7: Verificar que la página carga**

`http://localhost:8765/` muestra la página (no el juego). Con `read_page`, comprobar que existen
los textos "Para el colegio", "Para el profesor" y "Para la familia", y que hay **tres** enlaces
`/juego` o `wa.me`. Consola sin errores.

---

### Task 4: Responsive y comprobación visual

**Files:**
- Modify: `index.html` (raíz), solo si aparecen problemas.

- [ ] **Step 1: Revisar en teléfono**

`resize_window` con preset `mobile` (375px), recargar, y con `computer{action:"screenshot"}`
revisar la página completa. Comprobar con `javascript_tool`:

```js
JSON.stringify({anchoDoc:document.documentElement.scrollWidth, anchoVentana:window.innerWidth})
```

`anchoDoc` **no debe superar** `anchoVentana`: si lo hace, hay desborde horizontal y hay que
corregirlo antes de seguir.

- [ ] **Step 2: Revisar en computador**

`resize_window` a 1280x800, recargar, screenshot. Comprobar que el contenido queda centrado con
un ancho máximo legible (la clase `.envoltura` lo limita a 1080px) y que las rejillas de tarjetas
se distribuyen en varias columnas, no en una sola larga.

- [ ] **Step 3: Comprobar los textos alternativos**

```js
JSON.stringify([...document.images].map(i=>({src:i.getAttribute('src'), alt:i.alt, cargo:i.complete&&i.naturalWidth>0})))
```

Todas las imágenes con `alt` no vacío y `cargo:true`.

- [ ] **Step 4: Comprobar los enlaces de WhatsApp**

```js
JSON.stringify([...document.querySelectorAll('a[href*="wa.me"]')].map(a=>a.href))
```

Ambos deben apuntar a `https://wa.me/56976684967?text=…`.

---

### Task 5: Verificación integral y documentación

**Files:**
- Modify: `README.md`, `CLAUDE.md`

- [ ] **Step 1: Regresión completa**

| URL | Esperado |
|---|---|
| `/` | La página de presentación |
| `/juego/` | El juego, completo, sin 404 nuevos |
| `/juego/?qa=1` | Desbloquea y marca respuestas |
| `/juego/?armar=1` | El armador, generando enlaces con `/juego/` |
| `/profesor.html` | El panel, con su botón hacia `/juego/?armar=1` |
| `/dev/tablero.html` | El tablero |

Consola limpia en todas.

- [ ] **Step 2: Actualizar `README.md`**

En "Cómo probarlo", cambiar la dirección del juego:

```markdown
El juego está publicado en **https://vulpo.cl/juego** y el panel del profesor en
**https://vulpo.cl/profesor.html**. La raíz **https://vulpo.cl** es la página de presentación.
```

- [ ] **Step 3: Actualizar `CLAUDE.md`**

Dos cosas: (a) en la sección "Modelo de acceso (la puerta)" y en los parámetros de URL, cambiar
los ejemplos de `https://vulpo.cl/?…` a `https://vulpo.cl/juego/?…`; (b) agregar a la Bitácora la
entrada de la sesión, cubriendo el traslado, la línea `<base href="/">` y por qué no se puede
borrar, la página nueva con sus secciones, la corrección de las notas de tres bancos, y que los
enlaces de muestra viejos quedaron rotos a propósito. **No se hace commit.**

- [ ] **Step 4: Informar a Roberto**

Entregar las direcciones nuevas, decir qué se verificó, recordar que la puerta sigue apagada y
que el commit espera la orden 66.

---

## Notas de revisión del plan

- **Cobertura del spec:** Parte 1 → Task 1; capturas → Task 2; las cinco secciones y los
  metadatos → Task 3; responsive y accesibilidad → Task 4. Las doce verificaciones del spec están
  en Task 1 pasos 4-7, Task 3 paso 7, Task 4 pasos 1-4 y Task 5 paso 1.
- **Riesgo mayor:** la Task 1. Si `<base href="/">` no bastara, el síntoma sería 404 masivos de
  `assets/` en el paso 4, y el plan se detiene ahí antes de tocar nada más.
- **Decisión al planificar:** las capturas del panel usan datos ficticios evidentes. No estaba
  explícito en el spec, pero mostrar datos de alumnos reales en material comercial sería
  indefendible.
- **La página promete solo lo verificable:** 4 asignaturas, 2.536 preguntas revisadas, panel con
  mapa de dominio. Nada sobre funcionamiento sin internet.
