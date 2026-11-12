# Datos extra en el popup de la efeméride (diseño)

Fecha: 11/11/2026 · Aprobado por Roberto («sí, me parece con el banco de datos»; «¿no íbamos a
mostrar 3 por día?»). Extiende `2026-11-11-efemerides-design.md`.

## Qué es

El popup de la efeméride del día suma un botón **«💡 Otro dato»**. Cada toque cambia, en el mismo
popup, el texto y la imagen por un dato de un **banco sin fecha**. Se puede tocar **dos veces**:
máximo **3 datos al día** (la efeméride + 2). Tras el tercero el botón desaparece. Cerrado el
popup, ese día no vuelve (la marca diaria `kimun_efem_pop` no cambia).

## El banco: `contenido/efemerides/datos.json`

```json
{ "revisadas": 0, "datos": [
  { "id": "dato-ciencia-01", "texto": "…", "img": "…png", "tema": "ciencia",
    "fuente": "https://…", "revisada": false } ] }
```

- **Seis temas, 50 datos cada uno (300):** `literatura` (versos y libros chilenos), `historia`,
  `ciencia`, `naturaleza`, `deporte`, `curioso`.
- Mismas reglas que las efemérides (`docs/encargo-efemerides.md`) menos la fecha. Estándar propio:
  `docs/encargo-datos.md`. Regla nueva: **un dato no repite un hecho ni una cita que ya esté en
  `efemerides.json`**, ni otro dato.
- Se escribe en tandas `contenido/efemerides/_datos/<tema>.json` y se consolida con
  `scripts/consolidar-datos.py`, que **conserva la firma si el texto y la imagen no cambiaron**.
- Validador `scripts/validar-datos.py`: ids, largo ≤ 170, sin emoji, imagen del catálogo, fuente
  https, tema válido, `revisada` booleana, ids únicos, textos repetidos; avisos de política reciente,
  de cita repetida con las efemérides, y de imagen usada más de 3 veces en un tema.

## El juego (`assets/js/motor.js`)

- `popupVulpi(o)` acepta `o.otro`: una función que devuelve el siguiente dato
  (`{titulo, texto, img}`) o `null`. Si está, se dibuja un botón secundario «💡 Otro dato» bajo el
  principal; al tocarlo se reemplazan imagen, título y texto **sin cerrar** y, con `LEE_SOLO`, la
  voz lee el dato nuevo (cortando la anterior). Si devuelve `null`, o es el último, el botón se va.
- **El botón solo aparece si hay al menos un dato aprobado** distinto de tema: con 0 aprobados el
  popup es idéntico al de hoy.
- **Elección:** entre los aprobados, primero un tema que no haya salido en este popup (el tema de la
  efeméride se traduce: cultura→literatura, mundo→ciencia, dia-oficial→ninguno); dentro del tema, uno
  que el aparato no haya visto. Si ya vio todos los de ese tema, ese tema vuelve a empezar.
- **Vistos:** `localStorage['kimun_datos_vistos']`, lista de ids, **sin SUFIJO** (entre todos los
  cursos, como la marca diaria). Se marca al mostrarse.
- El JSON se pide junto con el de efemérides, una sola vez por carga.

## Aprobación y voz

- Tablero: sección **«💡 Datos curiosos»** con la misma forma que las efemérides (casilla por
  dato, imagen y fuente, «✓ Aprobar todas»), agrupada por tema. `aplicar-revisadas.py` escribe la
  firma en `datos.json`.
- Voz: la asignatura `efem` locuta también los datos **aprobados** (mismo `assets/voz/efem/`, que
  ya está en `VOZ_DIRS` de 1° a 4°). ~300 clips más, del orden de US$0,25, con autorización.

## Fuera de alcance

Elegir datos por curso o por edad, un historial de datos vistos, y datos que paguen o midan algo.
