# Publicar un carrusel de desafío en Instagram

> Procedimiento para armar y publicar un carrusel de "desafío" en el Instagram de VULPO
> (3 preguntas de una asignatura + una slide de "Modo prueba"). Pensado para repetirlo rápido.
> Herramienta de composición: [`scripts/armar-carrusel-ig.py`](../scripts/armar-carrusel-ig.py).

## Qué es una publicación de estas

- **Carrusel de 4 slides, formato 4:5 (1080×1350):**
  1. **Modo prueba** del nivel (la lista de capítulos de la asignatura o del curso).
  2-4. Las **3 primeras preguntas** limpias de un capítulo (sin respuesta marcada).
- Cada slide es la captura montada sobre el **fondo violeta de la marca**, como tarjeta con
  esquinas redondeadas y el pie **"VULPO · vulpo.cl"**.
- Se publica en la cuenta **vulpo.cl** y se **menciona a @solucionesvulpo** en el texto.

Ejemplos ya publicados (01-02/10/2026): Álgebra de 8° e Historia de 8° ("El encuentro de dos mundos").

## Paso 1 · Conseguir las capturas (dos caminos)

**Camino A — Roberto las saca** (como la primera vez): screenshots del juego en modo prueba
(la pantalla "Modo prueba" + las 3 preguntas **sin** la versión con la respuesta en verde) y las
deja en Descargas.

**Camino B — generarlas desde el navegador interno** (lo que se usó para Historia; no molesta a
Roberto). Con el navegador interno (`mcp__Claude_Browser__*`):

1. Servir el juego: `python -m http.server 8765` en la raíz (o usar `https://vulpo.cl`).
   ⚠️ **8° se sirve en `/8vo/`** (no `/juego/`, se renombró); 3° en `/3ro/`, 7° en `/7mo/`.
2. Abrir el **modo prueba** del nivel: `.../8vo/?solo=hist-cap1,hist-cap2,...` (lista TODOS los
   capítulos de la asignatura para la slide 1). `?solo=` **salta la puerta** aunque esté cerrada.
3. Vista móvil: `resize_window` a **460×920** (las capturas salen a 2×, o sea 920×1840).
4. Ocultar lo que ensucia, por JS (`javascript_tool`): `.qa-badge` (aviso), `.sndbtn` (audio),
   y en el quiz `#btnBack` (la ✕), `#qTimer` y `.qprog` (barra de tiempo/progreso). Poner
   `style.visibility='hidden'` (persisten entre preguntas).
5. **Congelar el temporizador** antes de cada captura (8°/7° tienen 20 s):
   `let hi=setInterval(()=>{},9e9); for(let i=1;i<=hi;i++) clearInterval(i);`
6. **Slide 1:** capturar la lista de modo prueba.
7. **Preguntas:** `entrarExpedicion(EXPEDICIONES.find(e=>e.id==='hist-cap2'))` abre la ruta;
   clic en el `.orb` del nodo de la etapa (o `node.querySelector('.orb').click()`) arranca el quiz.
   Para avanzar entre preguntas: `document.querySelectorAll('.opt')[0].click()` (responde) y luego
   **`document.getElementById('btnSeguir').click()`** — el "Continuar" real es `#btnSeguir`
   (ojo: hay un `#lecCont` oculto que NO sirve). Capturar cada pregunta recién cargada (opciones
   con clase `opt` a secas, sin `bad`/`ok`).
8. Al terminar: `resize_window` preset **desktop**, cerrar la pestaña y matar el servidor.

> Las capturas quedan guardadas por el navegador en `...\tool-results\mcp-Claude_Browser-blob-*.jpg`
> (la ruta sale en el resultado de cada screenshot).

## Paso 2 · Componer las slides

```bash
python scripts/armar-carrusel-ig.py --salida <scratchpad>/ig --prefijo ig3 \
  slide1.png preg1.png:bot=1540 preg2.png:bot=1540 preg3.png:bot=1540
```

- `:bot=1540` recorta el **espacio vacío de abajo** de las preguntas (ajustar al alto real; con
  capturas 920×1840 del camino B, ~1540 deja justo hasta el botón "Ayuda").
- `:top=0.09` si hay que quitar una **barra superior** (solo si no se ocultó por JS en el paso 1).
- Las capturas que Roberto saca a mano (ya recortadas, con el zorro arriba) van **sin** recorte.
- Revisar las 4 slides (que el zorro no quede cortado y no sobre espacio vacío).

## Paso 3 · Publicar (Claude en Chrome, cuenta vulpo.cl)

Con `mcp__claude-in-chrome__*` (Chrome real, sesión de Roberto):

1. `tabs_context_mcp` → abrir/usar una pestaña en `https://www.instagram.com/`. Si pide elegir
   perfil, **iniciar sesión con el perfil `vulpo.cl`** (sesión guardada, sin escribir contraseña).
2. Barra izquierda **Crear → Publicación**.
3. **Subir con `file_upload`**, NO con el botón: `find` "file input" → el input del diálogo
   ("Crear nueva publicación") → `file_upload` con las 4 rutas EN ORDEN. (Clic en "Seleccionar de
   la computadora" abre un diálogo nativo que no se puede manejar.)
4. **Proporción 4:5:** ícono de aspecto (abajo-izquierda del recorte) → **4:5**.
5. **Siguiente** → paso de filtros: dejar **Original** (no aplicar filtro; es fácil seleccionar uno
   sin querer) → **Siguiente**.
6. **Texto:** clic en "Agrega una descripción…" y escribir la plantilla (abajo). Emojis y acentos
   se escriben bien con la acción `type`. La mención **@solucionesvulpo** se deja como texto;
   Instagram la enlaza al publicar.
7. ⚠️ **Confirmar con Roberto antes de "Compartir"** — es contenido público e irreversible.
8. Al dar OK: clic en **Compartir**; esperar el aviso "Se compartió tu publicación." y cerrar con
   "Listo".

## Plantilla de texto (ajustar por asignatura)

```
🦊 DESAFÍO VULPO · ¿Cuánto sabes de <TEMA>? <emojis>

Tres preguntas de <ASIGNATURA> de <CURSO>, directo del juego. ¿Las respondes todas? Desliza 👉

1️⃣ <pregunta 1>
2️⃣ <pregunta 2>
3️⃣ <pregunta 3>

Piénsalas… y compruébalo jugando. 😏

En VULPO cada asignatura es una expedición: campañas, jefes finales, duelos con tu curso y
preguntas alineadas al currículum chileno. Estudiar se siente como jugar. 🎮

📚 3° a 8° básico · Historia · Matemática · Ciencias · Lenguaje
🔗 Prueba la demo gratis en vulpo.cl
✨ Un proyecto de @solucionesvulpo 💜

👉 ¿Cuáles crees que son las respuestas? Déjalas en los comentarios.

#VULPO #<Asignatura> #<Tema> #<Curso> #AprenderJugando #EdTechChile #CurriculumChileno
#JuegosEducativos #EducacionChile #ColegiosChile #EstudiarJugando
```

> **Honestidad:** desde el 01/10/2026 la puerta está cerrada, así que lo gratis es **la demo**
> ("Prueba la demo gratis"), no el juego completo. No prometer acceso total gratis.

## Gotchas (todos pagados ya)

- **El 8° vive en `/8vo/`**, no en `/juego/`.
- **`file_upload` evita el diálogo nativo**; clic en "Seleccionar de la computadora" no sirve.
- **El "Continuar" del quiz es `#btnSeguir`** (no `#lecCont`, que está oculto).
- **Las capturas del navegador interno salen a 2×** (460×920 → 920×1840); las coordenadas de clic
  van en el marco lógico, pero para navegar el quiz es más fiable hacerlo por JS que por píxeles.
- **No aplicar filtro** sin querer en el paso de edición: dejar **Original**.
- El **autocompletado** de hashtag/mención que aparece es inofensivo; no hay que cerrarlo.
- **Publicar es irreversible y público**: siempre confirmar con Roberto antes de "Compartir".
