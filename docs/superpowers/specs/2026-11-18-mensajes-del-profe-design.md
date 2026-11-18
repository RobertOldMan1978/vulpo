# Mensajes del profe al curso o a un alumno — diseño

**Fecha:** 18/11/2026 · **Estado:** aprobado por Roberto en conversación, pendiente de plan.

## Qué es

El profesor le manda **un aviso de una sola vía** a su curso completo o a un alumno. Lo elige de una
**lista fija de 20 mensajes**, y el niño lo ve al abrir el juego, con una imagen de Vulpi propia del
mensaje. El aviso tiene un botón **"✓ Listo"**, y el profe ve quién lo leyó.

## Decisiones (de Roberto)

| Pregunta | Decisión |
|---|---|
| ¿El niño puede responder? | **No.** Solo de ida, con acuse de lectura ("✓ Listo"). |
| ¿Texto libre? | **No.** Solo la lista. Para sumar un mensaje, se agrega a la lista para todos. |
| ¿Quién envía? | **Cualquier profe con acceso al curso** (jefe o de asignatura). Su nombre va en el mensaje. |
| ¿Cómo lo ve el niño? | **Aviso con Vulpi al abrir el juego, más un buzón** 📬 en el inicio para releer. |
| ¿Imagen? | **Cada mensaje tiene su imagen fija**, sacada del catálogo existente `contenido/efemerides/imagenes.json`. No se genera arte nuevo. |

## Por qué es seguro de mostrar a un colegio y a Google Play

- **Ningún adulto escribe texto libre a un menor.** El servidor guarda y acepta **solo el id** del
  mensaje (`msg-01`…`msg-20`). El texto vive en el repositorio. La restricción está en la **firma**
  de la función, no en la pantalla, así que manipular el panel no permite enviar otra cosa.
- **No hay respuesta del niño:** no es una conversación.
- **El historial lo ven la UTP y el admin.**
- **El texto que se escapa es el nombre del profe** (`escHtml`). Lo escribe un adulto, pero este
  proyecto ya tuvo un XSS almacenado por un nombre (Sesión 51).

## Componentes

### 1. Contenido — `contenido/mensajes/mensajes.json`

Formato canónico del proyecto (`indent=1`, LF, sin salto final). Cada mensaje trae:

`{ "id": "msg-01", "texto": "…", "img": "kimun-oro.png", "solo_curso": false }`

`solo_curso: true` hace que el mensaje aparezca solo cuando el destinatario es el curso completo.

| id | Texto | Imagen |
|---|---|---|
| msg-01 | ¡Muy buen trabajo! Me alegra mucho tu esfuerzo. | kimun-oro.png |
| msg-02 | ¡Qué bueno verte aprender cada día! | kimun-fiesta.png |
| msg-03 | ¡Vas muy bien! Sigue así. | kimun-feliz.png |
| msg-04 | Se nota que estás practicando. ¡Bien hecho! | skin-kimun-superheroe.png |
| msg-05 | ¡Sigue explorando! Aprender es una gran aventura. | skin-kimun-astronauta.png |
| msg-06 | No te rindas: equivocarse también es aprender. | kimun-neutral.png |
| msg-07 | Si algo te costó, vuelve a intentarlo con calma. | vulpo-mascota.png |
| msg-08 | Confío en ti. ¡Tú puedes! | skin-kimun-superheroe.png |
| msg-09 | Te echamos de menos en VULPO. ¡Vuelve a jugar! | vulpi.png |
| msg-10 | Repasa "Mis errores": ahí está lo que más te ayuda. | kimun-cientifico.png |
| msg-11 | Juega la unidad que estamos viendo en clases. | portada-hist2-cap1.png |
| msg-12 | Recuerda jugar un rato esta semana. | kimun-neutral.png |
| msg-13 | Tienes un desafío de refuerzo esperándote. | kimun-sorprendido.png |
| msg-14 | Antes de la prueba, repasa la unidad en VULPO. | kimun-escritor.png |
| msg-15 | Mira primero la mini-clase y después juega. | kimun-matematico.png |
| msg-16 | Lee con calma cada pregunta antes de responder. | kimun-escritor.png |
| msg-17 | Mañana usaremos VULPO en clases. | kimun-sorprendido.png |
| msg-18 | ¡Felicitaciones al curso! Avanzamos mucho juntos. (`solo_curso`) | kimun-fiesta.png |
| msg-19 | Gracias por tu esfuerzo esta semana. | kimun-feliz.png |
| msg-20 | ¡Que tengas un buen fin de semana! | skin-kimun-skate.png |

⚠️ **Un id nunca se reutiliza ni cambia de significado.** El servidor solo guarda el id, así que
reescribir el texto de `msg-07` cambiaría retroactivamente lo que dicen los mensajes ya enviados.
Si un mensaje cambia de sentido, el texto nuevo lleva un id nuevo y el viejo se marca `retirado: true`:
deja de ofrecerse y sigue mostrándose en el historial.

### 2. Backend — `supabase/schema.sql`

**Tablas** (RLS activo, sin políticas, como todas):
- `mensajes`: `id uuid`, `curso_id → cursos (on delete cascade)`, `perfil_id → perfiles (on delete
  cascade)`, nullable (null = todo el curso), `msg text` (el id), `profesor_id`, `creado timestamptz`.
- `mensajes_leidos`: `mensaje_id → mensajes (cascade)`, `perfil_id → perfiles (cascade)`, `leido
  timestamptz`, con PK `(mensaje_id, perfil_id)`.

**Funciones:**
- `kimun_prof_mensaje_enviar(p_curso text, p_msg text, p_alumno uuid default null)`. Portero:
  `kimun_prof_acceso(cid)`. Valida `p_msg ~ '^msg-[0-9]{2}$'` y valida que el alumno pertenezca al
  curso. Rechaza el mismo `msg` al mismo destinatario el mismo día (`repetido`).
- `kimun_prof_mensajes(p_curso text)`: el historial de los últimos 90 días, con quién envió, a quién,
  `leidos` y `destinatarios`. Portero `kimun_prof_acceso`.
- `kimun_prof_mensaje_lectores(p_mensaje uuid)`: los nombres de quién leyó y quién no, para expandir
  una fila. Va con el mismo portero, sobre el curso del mensaje.
- `kimun_mis_mensajes()`: los mensajes del alumno (vía `kimun_yo()`) de su curso actual con menos de
  **30 días**. Cada uno trae `id`, `msg`, nombre del profe, `creado` y `leido`. Un anónimo sin curso
  recibe `[]`.
- `kimun_mensaje_leido(p_mensaje uuid)`: marca la lectura **solo si el mensaje es para ese alumno**
  (a su curso o a él). Es idempotente (`on conflict do nothing`).
- Grants: las dos del alumno a `anon, authenticated`, igual que `kimun_mi_plan`.

⚠️ El nombre del profe que ve el alumno es solo `profesores.nombre`. **Nunca el correo.**

### 3. Panel — `assets/panel/vistas/curso.js`

Pestaña nueva **"Mensajes"** (`#/curso/COD/mensajes`), visible para todo el que tenga acceso al
curso:
- **Destinatario:** "Todo el curso" o un selector de alumno.
- **Mensaje:** la lista como tarjetas con su imagen. Si hay un alumno elegido, se ocultan los
  `solo_curso` y los `retirado`.
- **Vista previa** de cómo lo verá el niño, y el botón **Enviar**.
- **Historial:** fecha, mensaje, destinatario, quién lo envió y "Leído por 18 de 25". Una fila se
  expande para mostrar quién leyó y quién no, en orden alfabético y sin fecha individual (la regla de
  la participación).

### 4. Juego — `assets/js/motor.js` (los 8 cursos, ningún fork)

- Al entrar a `scr-rol`, `revisarMensajes()` llama `kimun_mis_mensajes()` (best-effort, falla en
  silencio) y carga `mensajes.json`.
- **Aviso:** se reusa `popupVulpi`, con la imagen del mensaje, el título *"📬 Mensaje de tu profe
  ‹nombre›"*, el texto y el botón **"✓ Listo"**, que llama `kimun_mensaje_leido` y muestra el
  siguiente mensaje sin leer. La ✕ cierra sin marcarlo leído, así que vuelve a aparecer en la próxima
  apertura.
- **Prioridad:** refuerzo del profe > duelo > **mensaje del profe** > efeméride. Si el modal está
  ocupado, el mensaje espera, igual que el resto.
- **Buzón:** en el inicio aparece una línea **"📬 Mensajes (N sin leer)"** si hay algún mensaje en los
  últimos 30 días. Abre una lista para releer, y desde ahí también se puede marcar Listo.
- **Voz:** con `LEE_SOLO` (1° a 4°) se lee el texto del mensaje. El nombre del profe no se lee, porque
  no tiene clip.
- No sale con `EFIMERO || SIN_DISCO` (QA, muestras, armador, docente) ni sin perfil.
- Un `msg` que el JSON no conoce (cliente viejo en caché) no se muestra.

### 5. Voz

Asignatura nueva `msj` en `scripts/voz_asignaturas.py` (`assets/voz/msj/`, sin `caps`), agregada al
final de `VOZ_DIRS` de 1° a 4°, con un `manifiesto.json` vacío versionado mientras no se genere.
Son 20 clips, del orden de centavos, y **la generación necesita la autorización de Roberto**. Después:
`voz-r2.py subir`, `paquetes msj` y `verificar`.

### 6. Herramientas

`scripts/validar-mensajes.py` revisa:
- ids `msg-NN` únicos y nunca reutilizados.
- texto de 70 caracteres como máximo, sin emoji.
- la imagen existe en `assets/` y está en `imagenes.json`.
- formato canónico.

## Verificación

- **Backend contra producción, con control positivo y negativo:** enviar un `msg-99` inexistente o
  un texto da `datos_invalidos`; enviar a un curso ajeno da `no_autorizado`; una función inventada da
  404; el alumno de un curso de prueba recibe el mensaje y lo marca leído; un alumno de otro curso
  no puede marcarlo.
- **Panel con el doble** (`panel-demo.py`, stubs nuevos) y `cdp.mjs`, mirando: enviar, la vista
  previa, el historial y la expansión de lectores, a 1.440 y 375 px.
- **Juego jugando:** el aviso aparece con su imagen, "Listo" pasa al siguiente y lo marca, la ✕ hace
  que reaparezca, el buzón cuenta bien, la prioridad con el refuerzo y la efeméride, y la voz en 1°
  (espiando `Audio`). Los 8 cursos navegan con cero errores de consola y de red.

## Fuera de alcance

- Notificaciones push (el niño lo ve al abrir el juego).
- Texto libre, respuestas o mensajes a apoderados.
- Mensajes programados a futuro.
