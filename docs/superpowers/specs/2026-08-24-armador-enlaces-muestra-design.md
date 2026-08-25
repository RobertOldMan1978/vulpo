# Armador de enlaces de muestra (`?armar=1`) + lista propia del modo prueba

**Fecha:** 2026-08-24
**Estado:** Diseño aprobado, pendiente de plan de implementación

## Contexto

La Sesión 41 agregó el modo prueba `?solo=` (ver
`2026-08-24-modo-prueba-enlace-acotado-design.md`): un enlace que muestra solo los
capítulos pedidos, todos abiertos, sin marcar respuestas y sin guardar nada. Hoy ese
enlace se escribe a mano, con los ids internos de `EXPEDICIONES`.

Roberto quiere poder **armarlo desde el panel**, sin recordar ids, para preparar
**cuestionarios de muestra** (material de difusión: enseñarle el juego a un colegio o a
un profesor). Es una herramienta suya, no de uso diario de los profesores.

Al diseñarlo apareció un problema de fondo: el modo prueba se montó reutilizando la
pantalla de campaña (`renderCampaña`), que por definición muestra **una** asignatura. El
enlace de Historia que se probó funciona, pero en cuanto el armador permita marcar
cualquier casilla quedan expuestos tres agujeros. Este diseño los corrige.

## Parte 1 — Corregir el modo prueba: lista propia

### Los tres agujeros actuales

1. **Matemáticas no se filtra (grave).** Su campaña tiene `esLecciones`, así que
   `renderCampaña` delega en `renderCampañaMate`, donde el filtro por `SOLO` no existe.
   `?solo=mate-exp-numeros` abre la campaña **completa** de Matemáticas: todas las
   lecciones, el Reto de Cálculo y el Jefe Final. El acotamiento no ocurre.
2. **Mezclar asignaturas descarta capítulos en silencio.** `arrancarModoPrueba` abre la
   campaña de `SOLO[0]`; los ids de otra asignatura simplemente no se dibujan y nadie
   avisa.
3. **Capítulos sin campaña** (Vocabulario `voc-general`, Lectura `lect-anafrank`) van por
   `entrarExpedicion` directo: si se piden varios, se abre solo el primero.

### La corrección

Dejar de reutilizar la pantalla de campaña y darle al modo prueba **su propia lista**:
una función `renderListaPrueba()` que recorre `SOLO` en su orden y dibuja una tarjeta por
capítulo con el mismo componente que ya usa la campaña (`nodoCampañaEl`), sin importar de
qué asignatura venga cada uno.

- **Encabezado:** "Modo prueba" y, debajo, la lista de asignaturas involucradas
  (p. ej. "Historia" o "Historia · Ciencias").
- **Numeración:** se conserva el número original del capítulo dentro de su campaña
  (el capítulo 2 se sigue llamando 2). Un capítulo sin campaña no lleva número: usa el
  ícono 📘.
- **Todas las tarjetas abiertas**, como hoy.
- **Sin** Desafío Extra ni Jefe Final (siguen exigiendo la campaña completa).
- La pantalla reusa `scr-campana` para no agregar marcado nuevo.

Con esto desaparece el filtro `if(PRUEBA && !SOLO.includes(id)) return;` dentro de
`renderCampaña`, y también el `if(!PRUEBA)` que envuelve al Desafío Extra y al Jefe Final:
la pantalla de campaña vuelve a ser exactamente lo que era antes de la Sesión 41. El modo
prueba deja de ser un caso especial injertado en ella.

`arrancarModoPrueba` pasa a llamar siempre a `renderListaPrueba()`, sin bifurcar entre
"tiene campaña" y "no tiene campaña". El botón "← Volver" de la campaña sigue oculto en
modo prueba (no hay a dónde volver).

**Regla que se mantiene:** las 5 etapas de cada capítulo nacen abiertas
(`nuevoProgreso` bajo `PRUEBA`), y volver desde el mapa lleva a esta lista.

## Parte 2 — El armador (`?armar=1`)

### Dónde vive

Una pantalla oculta dentro de **`index.html`**, activada con `?armar=1`. Se eligió esto
por sobre construirlo dentro de `profesor.html` porque el catálogo de capítulos
(`EXPEDICIONES`) ya vive en `index.html`: llevarlo al panel obligaría a copiarlo a mano
(se desincroniza sin aviso) o a sincronizarlo con un script (un paso más que recordar).
Dejándolo donde está el catálogo, **cualquier expedición nueva aparece sola**.

Es el mismo patrón que ya usa el Tablero de avance: un botón del panel abre otra página.

### Qué muestra

- **Todos los capítulos activos** (`EXPEDICIONES.filter(e => e.activa)`), agrupados por
  asignatura y en el orden de `ORDEN_ASIG`, cada uno con una casilla. Se muestra el
  nombre corto del capítulo (`nombreMapa`) y su número dentro de la campaña cuando lo
  tiene.
- Una casilla aparte: **"Mostrar las respuestas correctas"**, que agrega `&qa=1` al
  enlace. Sirve para enseñarle el contenido a un adulto; no para un enlace que alguien
  va a jugar.
- El **enlace armado**, que se actualiza en vivo, en un campo de texto seleccionable.
- Un botón **Copiar** y un botón **Probar** (abre el enlace en otra pestaña).

### Cómo arma el enlace

Con el origen desde el que se abrió la página:
`location.origin + location.pathname + '?solo=' + ids.join(',')`, más `&qa=1` si la
casilla está marcada. Así, abierto desde vulpo.cl genera enlaces de vulpo.cl y abierto en
local genera enlaces locales, sin ninguna URL escrita a mano que pueda quedar vieja.

Si no hay ninguna casilla marcada, el campo muestra un texto de ayuda ("Marca al menos un
capítulo") y los botones Copiar y Probar quedan deshabilitados.

**Copiar** usa `navigator.clipboard.writeText`. Si falla (navegador o contexto que lo
bloquea), se selecciona el texto del campo y se avisa "Selecciona y copia con Ctrl+C", en
vez de dejar al usuario sin saber si funcionó.

### Comportamiento

`?armar=1` no juega, así que se comporta como el modo prueba en lo que toca al estado: no
escribe en `localStorage`, no crea perfil en Supabase y se salta la intro. Se implementa
sumando la condición del armador a las guardas que ya existen para `PRUEBA`.

## Parte 3 — El botón en el panel

En `profesor.html`, dentro del bloque **"Administración"**, junto a "📊 Tablero de avance":

    🔗 Armar enlace de muestra

Abre `index.html?armar=1`, igual que el botón del Tablero abre `dev/tablero.html`.

**Visible solo para el Administrador de plataforma** (`YO.es_admin`), el mismo candado que
usa "🧹 Limpiar perfiles de prueba" — no lo ven los SuperUsuarios de un colegio. Es la
lectura estricta de "solo admin" y encaja con que sea una herramienta de difusión del
proyecto, no de gestión de un curso.

## Verificación

En el navegador (`preview_start`):

**Del modo prueba corregido:**
1. `?solo=hist-cap2,hist-cap3,hist-cap4` → los tres, numerados 2/3/4, abiertos, sin marcar
   (no debe haber regresión respecto de la Sesión 41).
2. `?solo=mate-exp-numeros` → **solo esa expedición**. No aparecen las lecciones de
   Matemáticas, ni el Reto de Cálculo, ni el Jefe Final.
3. `?solo=hist-cap2,cien-celula` → **los dos**, uno de cada asignatura.
4. `?solo=voc-general,lect-anafrank` → **los dos**, sin número y con ícono 📘.
5. Sin parámetro → la pantalla de campaña de Historia vuelve a mostrar sus 5 capítulos,
   el Desafío Extra y el Jefe Final, como antes de la Sesión 41.

**Del armador:**
6. `?armar=1` → lista con todos los capítulos activos agrupados por asignatura.
7. Marcar dos capítulos → el enlace se arma en vivo y contiene ambos ids.
8. Marcar "Mostrar las respuestas correctas" → el enlace termina en `&qa=1`.
9. Sin casillas marcadas → Copiar y Probar deshabilitados.
10. El enlace generado, pegado en la barra de direcciones, abre exactamente esos
    capítulos.
11. `?armar=1` no escribe en `localStorage` ni llama a Supabase.

**Del panel:** el botón aparece para el Admin y no para un profesor normal, y abre el
armador.

En los once casos, consola sin errores.

## Límites conocidos (aceptados)

- **Ni el armador ni el enlace son un candado.** Es un sitio estático: quien escriba
  `?armar=1` llega al armador. **No expone nada nuevo** — ya podía escribir `?solo=…` o
  `?qa=1` a mano.
- **El armador no valida pedagógicamente nada.** Deja armar combinaciones raras (dos
  asignaturas mezcladas); si Roberto las arma, se muestran tal cual.
- **La respuesta correcta viaja en el HTML** (`data-correcta`) en todos los modos, no solo
  con `?qa=1`. Es previo a este trabajo y no tiene solución sin mover las preguntas al
  servidor. Los enlaces de muestra sirven para practicar y mostrar, no para evaluar.
