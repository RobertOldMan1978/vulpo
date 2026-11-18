# Mensajes del profe — plan de implementación

> **Para agentes:** se ejecuta con superpowers:executing-plans, tarea por tarea. Los pasos llevan
> casillas (`- [ ]`).

**Objetivo:** el profe le manda a su curso, o a un alumno, uno de 20 mensajes fijos. El niño lo ve al
abrir el juego, con Vulpi, y toca "✓ Listo".

**Arquitectura:** el texto vive en `contenido/mensajes/mensajes.json`, mientras que el servidor guarda
solo el id (`msg-NN`) más quién lo mandó y quién lo leyó. El panel suma la pestaña "Mensajes" al
curso, y el motor reusa `popupVulpi` y agrega un buzón. Todo degrada en silencio mientras el esquema
no esté aplicado.

**Spec:** `docs/superpowers/specs/2026-11-18-mensajes-del-profe-design.md`

**Reglas del proyecto que aplican:**
- Sin commit ni push hasta la orden 66.
- Sin SQL contra producción: el esquema lo pega Roberto.
- La voz se genera solo con autorización.
- Ningún fork cambia, salvo `VOZ_DIRS` de 1° a 4°.

---

### Tarea 1: el catálogo de mensajes y su validador

**Archivos:**
- Crear `contenido/mensajes/mensajes.json`, en formato canónico (`indent=1`, LF, sin salto final).
- Crear `scripts/validar-mensajes.py`.

- [ ] Escribir el JSON con `{"descripcion": "...", "mensajes": [ ... ]}`, donde cada mensaje es
  `{"id","texto","img","solo_curso"}` y son los 20 de la tabla del spec. Se genera con Python
  (`json.dumps(d, ensure_ascii=False, indent=1)`) para garantizar el formato.
- [ ] El validador falla (salida 1) si:
  - un id no calza con `^msg-\d{2}$` o está repetido;
  - un texto está vacío, mide más de 70 caracteres o trae emoji;
  - la imagen no existe en `assets/` o no está en `contenido/efemerides/imagenes.json`;
  - el archivo no está en formato canónico.
- [ ] Probarlo **rompiéndolo**: un id repetido, una imagen inexistente y un texto de 80 caracteres
  tienen que dar salida 1. Después restaurar y confirmar que da 0.

### Tarea 2: el esquema (`supabase/schema.sql`)

- [ ] Agregar las tablas `mensajes` y `mensajes_leidos` (RLS sin políticas) y las 5 funciones, antes
  del bloque de grants:
  - `kimun_prof_mensaje_enviar(text,text,uuid)`, que devuelve `uuid`. Portero `kimun_prof_acceso`,
    valida el formato del id, valida que el alumno pertenezca al curso y rechaza `repetido` dentro
    del mismo día en `America/Santiago`.
  - `kimun_prof_mensajes(text)`: el historial de 90 días con `leidos` y `destinatarios`.
  - `kimun_prof_mensaje_lectores(uuid)`: alumno y leído, ordenado por nombre.
  - `kimun_mis_mensajes()`: los mensajes de 30 días del alumno, vía `kimun_yo()`, con **solo el
    primer nombre** del profe.
  - `kimun_mensaje_leido(uuid)`: idempotente, y solo marca si el mensaje es para ese alumno.
- [ ] Toda referencia a columna va calificada con su tabla (son funciones `returns table` con un OUT
  `id`; es el bug de la Sesión 116). Cada `returns table` lleva su `drop function if exists`.
- [ ] Sumar las 5 al `grant execute … to anon, authenticated`.
- [ ] Revisar la sintaxis con `pglast` (instalado en la Sesión 144):
  `python -c "import pglast;pglast.parse_sql(open(...).read())"` sobre el fragmento.
- [ ] Dejar el fragmento listo para pegar en el scratchpad (`mensajes-fragmento.sql`), con
  solo las tablas, las funciones y un `grant` propio.

### Tarea 3: el panel — la pestaña Mensajes

**Archivos:**
- `assets/panel/iconos.js`: el ícono `mensaje`.
- `assets/panel/vistas/curso.js`: la pestaña.
- `profesor.html`: `ERRORES.repetido` y `ERRORES.datos_invalidos`.

- [ ] Agregar la pestaña `{id:'mensajes', txt:'Mensajes', ico:'mensaje', ver:() => true}` después de
  Refuerzo.
- [ ] `PESTANAS.mensajes(panel, cod, c)` hace tres cosas:
  1. Carga el catálogo (una promesa en `window._MSJ_CAT`), `kimun_prof_listar` (los alumnos del curso)
     y `kimun_prof_mensajes`.
  2. Dibuja la sección "Enviar un mensaje": el selector de destinatario, las tarjetas de mensaje con
     radio, imagen y texto (ocultando `solo_curso` cuando hay un alumno elegido y los `retirado`), la
     vista previa y el botón Enviar. Enviar llama al RPC, muestra un toast y vuelve a pintar el
     historial.
  3. Dibuja la sección "Enviados": una tabla con fecha, mensaje, para, quién lo envió y "N de M", más
     un botón "Ver quiénes" que llama a `kimun_prof_mensaje_lectores` y muestra dos grupos de nombres
     (leyeron / todavía no), en orden alfabético.
- [ ] Si `kimun_prof_mensajes` falla, el historial dice el error y la sección de envío se dibuja igual.
- [ ] Todos los nombres pasan por `esc()`.

### Tarea 4: el doble del panel (`scripts/panel-demo.py`)

- [ ] Agregar los stubs en memoria:
  - `kimun_prof_mensajes`, con 2 mensajes sembrados.
  - `kimun_prof_mensaje_enviar`, que agrega a la lista y lanza `repetido` si se repite el mismo día.
  - `kimun_prof_mensaje_lectores`.
- [ ] Respetar la forma de PostgREST (`{data, error}`) que ya usa el doble.

### Tarea 5: el juego (`assets/js/motor.js`)

- [ ] `popupVulpi` acepta `o.recordar===false`. Con eso no lee ni escribe `localStorage`, así que un
  mensaje cerrado con ✕ vuelve a salir. Los llamadores actuales no cambian.
- [ ] Agregar el bloque "Mensajes del profe":
  - `_catMsj()`, la promesa del catálogo.
  - `revisarMensajes()`, best-effort, que no corre sin `SB` o `MI_PERFIL`, ni con `EFIMERO` o
    `SIN_DISCO`.
  - `popupMensaje()`, el primer mensaje sin leer, solo en `scr-rol`. Espera a que pase la intro, lo
    lee en voz alta con `LEE_SOLO` y su botón "✓ Listo" llama a `marcarMsjLeido` y después muestra
    el siguiente.
  - `marcarMsjLeido(x)`.
  - `pintarBuzon()`: inserta `#buzonMsj` después de `#bannerDuelo` (o de `#bannerDesafio`).
  - `abrirBuzon()`: el overlay con la lista para releer y el "✓ Listo" de cada mensaje.
- [ ] `revisarDuelos()` llama `revisarMensajes()` en su **primera línea**, así se dispara en los
  mismos tres momentos (arranque, canje y vuelta al inicio) sin tocar los forks.
- [ ] El aviso del mensaje espera 1,2 s, después del refuerzo y del duelo; la efeméride espera 2,5 s.

### Tarea 6: la voz (preparación, sin generar)

- [ ] En `scripts/voz_asignaturas.py`, agregar
  `"msj": {"banco":"mensajes","oa":"MSJ","caps":"","juego":"1ro","mensajes":True}`.
- [ ] En `scripts/generar-voz-nivel.py`, con `mensajes`, `BANCO=contenido/mensajes/mensajes.json` y
  `textos()` devuelve el texto de cada mensaje. Como no hay paso de aprobación, son todos.
- [ ] Crear `assets/voz/msj/manifiesto.json` con `{}` y agregar `'assets/voz/msj/'` al final de
  `VOZ_DIRS` en `1ro/`, `2do/`, `3ro/` y `4to/` (una línea por fork).
- [ ] Correr `python scripts/generar-voz-nivel.py msj --recuento` (gratis), que debe contar 20 textos.
  **Generarlos requiere la autorización de Roberto.**

### Tarea 7: verificación

- [ ] `node --check` sobre `motor.js`, `curso.js` e `iconos.js`, y el validador en 0.
- [ ] El panel con el doble y `cdp.mjs`, a 1.440 y 375 px, mirando las capturas: la pestaña, enviar,
  el toast, el historial, "Ver quiénes" y `repetido`. Cero errores de consola y de red.
- [ ] El juego, con el stub de `SB.rpc` en 1° y 6°:
  - el aviso con su imagen;
  - "Listo" pasa al siguiente y llama `kimun_mensaje_leido`;
  - la ✕ hace que vuelva a salir al recargar;
  - el buzón cuenta los sin leer;
  - con el refuerzo abierto, el mensaje espera;
  - en `?qa=1` y `?solo=` no aparece;
  - la voz en 1° llama a `leerEnVoz`.
- [ ] Los 8 cursos navegan con `__MOTOR_OK` y sin errores.
- [ ] Con el esquema sin aplicar, el juego no muestra nada y no da errores, y la pestaña del panel
  avisa que no se pudo cargar.

### Tarea 8: documentación y entrega

- [ ] Agregar a `CLAUDE.md` la sección del Backend y la entrada de bitácora (Sesión 155), y a
  `pendiente.md`, lo que queda pendiente.
- [ ] Puntos donde decide Roberto:
  - pegar el fragmento del esquema;
  - autorizar la voz (20 clips);
  - dar la orden 66.
