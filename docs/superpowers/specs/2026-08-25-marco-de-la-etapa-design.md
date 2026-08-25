# El marco de la etapa: meta visible + cierre metacognitivo (grupos B y C)

**Fecha:** 2026-08-25
**Estado:** diseño aprobado, pendiente de plan de implementación.
**Fundamento pedagógico:** [`docs/fundamento-evaluacion-formativa.md`](../../fundamento-evaluacion-formativa.md), §7.
**Depende de:** el grupo A (`2026-08-25-siguiente-paso-al-fallar`), ya implementado. B reemplaza el
encabezado mínimo "Estás practicando: ‹nombre›" que dejó A; C convive con los botones de A en `scr-res`.

## Motivación

El MINEDUC pide que la meta de aprendizaje esté **visible y en lenguaje comprensible** antes de la
actividad (*"hacer comprensible la meta de aprendizaje… y que esté también visible"*, Orientaciones
2021, p. 12) y que el estudiante **reflexione sobre su propio aprendizaje** al cerrar (Escalera
Metacognitiva y Pausa Reflexiva, pp. 65 y 68; el estudiante como protagonista). Hoy VULPO entra
directo a las preguntas y cierra con el resultado, sin encuadre ni reflexión.

Dos mejoras, los dos extremos de una etapa:

- **B — Encuadre:** la meta de aprendizaje, en lenguaje de niño, antes de jugar.
- **C — Cierre metacognitivo:** un semáforo de autoevaluación al terminar.

## Alcance

- **Sí:** etapas de campaña de las 4 asignaturas (Historia, Ciencias, Lenguaje, expediciones
  `mate-exp-*`), en cualquier modo (Normal/Difícil).
- **B no aplica a:** libros de apoyo (Vocabulario, Lectura·Ana Frank — no son OA del currículum),
  lección de Matemática (ya tiene su enseñanza), desafío de refuerzo, duelo.
- **C (semáforo)** aparece en `scr-res`, o sea tras cualquier etapa/jefe/libro que termine ahí; no
  en desafío ni lección (que no pasan por `scr-res`).

Sin cambios de backend (Supabase). Todo vive en `juego/index.html` + contenido nuevo de texto.

## Parte B — Meta de aprendizaje

### El texto de la meta (contenido nuevo)

Un bloque de datos **`META_OA`** en `juego/index.html`: un objeto `{ '‹código OA›': '‹frase amable›' }`.

- Una frase corta, en segunda persona, en lenguaje de niño de 8° (p. ej. `'HI08 OA 01'` →
  *"Vas a entender cómo cambió la forma de ver el mundo al empezar la época moderna."*).
- **Solo para los OA que aparecen en etapas jugables** (no los 69 del currículum; son ~20–30). Se
  enumeran a partir de `EXPEDICIONES` al implementar.
- **Generado por agentes y revisado por Roberto**, como los bancos de preguntas. Nace sin marca de
  aprobación formal; Roberto lo lee y ajusta antes de dar por buena la tanda.
- **Fallback:** si un OA no tiene entrada en `META_OA`, se usa el `nombre` de la etapa (el mismo
  comportamiento mínimo que dejó el grupo A). Así la feature nunca queda en blanco.

Helper: `metaDeEtapa(lvl)` → devuelve `META_OA[EXPEDICION[lvl].oa]` o, si no existe, `EXPEDICION[lvl].nombre`.

### La tarjeta la primera vez (`scr-meta`)

Al **entrar** a una etapa (desde `startQuiz`), si es la **primera vez** en ese dispositivo:

- Se muestra una tarjeta previa (pantalla `scr-meta`): ícono 🎯, título "Lo que vas a aprender", la
  frase de meta, y un botón **"¡Vamos! ▶"** que arranca el quiz.
- Se marca como vista: `S.metasVistas[clave]=true`, con `clave = EXP_ACT.id + ':' + lvl`, persistido
  en `guardar()`/`cargar()`. En las siguientes entradas (incluidos los **reintentos**), la tarjeta
  **no** reaparece y `startQuiz` va directo al quiz.
- **No aplica** cuando la etapa es un libro (OA con prefijo `VOC-`/`AF-`): esos no tienen meta; se
  entra directo, como hoy.
- En **modo efímero** (`EFIMERO`: `?qa`, modo prueba) la tarjeta puede mostrarse pero **no se
  persiste** la marca (coherente con "no guardar nada"); para no estorbar las pruebas, en `EFIMERO`
  se **omite** la tarjeta y se entra directo.

### La línea fija en el quiz

Durante las preguntas de una etapa (y de un **repaso**, que es del mismo OA), una línea sutil en la
tarjeta de pregunta: **"🎯 ‹meta›"** (elemento nuevo `qMeta` en `scr-quiz`).

- Se muestra cuando hay meta para el OA actual y el contexto es una etapa o un repaso.
- **No** se muestra en lección (`Q.leccion`), desafío (`Q.desafio`) ni libros.
- Es informativa, no interactiva.

## Parte C — Cierre metacognitivo (semáforo)

En `scr-res`, tras cualquier etapa, una fila **"¿Cómo te fue?"** con tres botones: 🟢 (lo domino) /
🟡 (más o menos) / 🔴 (me costó).

- **Opcional y no bloqueante:** el niño puede ignorarla y pulsar Reintentar/Siguiente/Volver.
- Al tocar uno: se **resalta** el elegido y aparece un **mensaje breve** debajo:
  - 🟢 → *"¡Genial, lo dominas! Sigue así."*
  - 🟡 → *"Vas bien. Un repasito y queda redondo."*
  - 🔴 → *"Te costó, y está bien. El repaso te va a ayudar."*
  - En 🟡/🔴, si en esa pantalla está visible el botón "Repasar/mini-clase" del grupo A, el mensaje
    **empuja suave** hacia él (no lo abre solo).
- **Local y privado:** se guarda `S.semaforo[clave]=valor` (`clave = EXP_ACT.id + ':' + lvl`),
  persistido. **No se envía a Supabase, no toca `kimun_dominio` ni el mapa del profesor.** Es
  reflexión del niño, subjetiva; mezclarla con la medición la ensuciaría.
- Se **resetea visualmente** en cada apertura de `scr-res` (si ya había un valor guardado para esa
  etapa, se puede pre-resaltar; decisión menor, por defecto se muestra sin preselección para invitar
  a reflexionar de nuevo).
- En `EFIMERO` funciona igual en pantalla pero no persiste (coherente con no guardar).

## Estado nuevo (persistido)

- `S.metasVistas` — objeto `{clave: true}`, etapas cuya tarjeta de meta ya se vio.
- `S.semaforo` — objeto `{clave: '🟢'|'🟡'|'🔴'}`, última autoevaluación por etapa.

Ambos se inicializan en `cargar()` (con defaults `{}` si no existen, para partidas viejas) y se
escriben en `guardar()`.

## Superficie del cambio (resumen)

- **Contenido:** bloque `META_OA` (texto generado + revisado).
- **Markup:** `scr-meta` (tarjeta de meta), `qMeta` (línea en `scr-quiz`), fila de semáforo en `scr-res`.
- **Estado:** `S.metasVistas`, `S.semaforo` (en `guardar`/`cargar`).
- **`startQuiz`:** desvío a `scr-meta` la primera vez (salvo libro / `EFIMERO`).
- **`pintaPregunta`:** render/ocultar `qMeta` según contexto.
- **`terminarNivel`:** pintar la fila de semáforo; el encabezado de objetivo del grupo A pasa a usar
  `metaDeEtapa(lvl)` en vez del `nombre` pelado.
- **Backend:** ninguno.

## Riesgos y cuidados

- **No romper el grupo A:** el encabezado "Estás practicando:" pasa a `metaDeEtapa`; verificar que
  con y sin entrada en `META_OA` se ve bien (frase o nombre).
- **`startQuiz` es también el reintento:** la tarjeta solo la primera vez; el reintento (mismo
  `lvl`) no debe volver a mostrarla. La marca se pone al mostrarla, no al pasar la etapa.
- **`EFIMERO`:** ni la tarjeta persiste ni el semáforo persiste; se omite la tarjeta para no estorbar
  QA / modo prueba.
- **El semáforo no mide:** jamás llama a `registrarOA` ni a Supabase.
- **Libros y jefe:** B no aplica a libros; el semáforo (C) sí aparece en `scr-res` de un libro o del
  jefe (es reflexión genérica), y eso es aceptable.
