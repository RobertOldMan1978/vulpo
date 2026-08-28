# VULPO — Pendientes

> **Qué es este archivo.** La lista viva de lo que falta para llegar a la meta que fijan
> [`docs/roadmap-tecnico.md`](docs/roadmap-tecnico.md) (el plan técnico de mediano plazo,
> nacido de los tres análisis externos del 27/08/2026) y la v1 de seis cursos. Está pensado
> para abrir una rama y ponerse a programar sabiendo exactamente qué toca y en qué orden.
>
> **Se actualiza en cada orden 66.** Si una tarea se hizo, se tacha aquí; si aparece una nueva,
> se agrega. Un pendiente que nadie vuelve a medir se arrastra solo — pasó tres sesiones
> seguidas con "re-aplicar el esquema", que ya estaba aplicado.
>
> ⚠️ **Este repositorio es PÚBLICO.** Acá no van números de ingreso, precios, estimaciones de
> inversión ni el estado de conversaciones comerciales. Eso vive fuera del repo. Lo que sí va
> son tareas técnicas, pesos de trabajo y costos operativos de infraestructura.

---

## La meta, en una línea

```
Terminar VULPO v1 (3° a 8°) → PWA → piloto y métricas → progreso en el servidor
   → modelo de usuario y suscripción → pagos → Capacitor → Android → iOS
```

**La decisión de fondo ya está tomada: no se reescribe VULPO en Flutter ni React Native.**
Es una app web mobile-first y se reutiliza. Ver `docs/roadmap-tecnico.md` §1.

---

## Dónde estamos hoy (28/08/2026, medido en disco)

| Curso | OA | Preguntas | Aprobadas | Voz | Arte propio |
|---|---|---|---|---|---|
| 3° | 86 | 2.558 | **0** | ✅ 10.563 clips | ❌ |
| 4° | — | — | — | pendiente | — |
| 5° | — | — | — | no lleva | — |
| 6° | — | — | — | no lleva | — |
| 7° | 81 | 2.430 | **0** | no lleva | ❌ |
| 8° | 69 | 2.314 (+222 apoyo) | ✅ todas | no lleva | ✅ |

- **7.524 preguntas escritas · 2.536 aprobadas · 4.988 sin aprobar.**
- **Sitio publicado: 273 MB** (techo de GitHub Pages: 1 GB).
- **Backend al día:** `schema.sql` aplicado y verificado, los códigos de los tres cursos en las
  dos listas de `kimun_prof_asignaturas`, y la foto semanal agendada.
- **Paridad de funcionalidad entre los tres cursos: completa.** No queda motor pendiente para
  que 3°, 7° y 8° funcionen igual.

---

## 🔴 El bloqueo real, y no es técnico

**La aprobación pedagógica de 3° y 7°: 167 objetivos, 1.336 preguntas por muestreo, 7 a 11
horas de Roberto.** Nadie puede hacerlo por él.

Es el camino crítico de todo lo demás: 3° y 7° llevan meses escritos y sin una sola pregunta
firmada, y **anunciarlos antes de aprobarlos contradice la regla del proyecto de no prometer lo
que no hay** (la landing dice "todas aprobadas una a una").

- Herramienta: `dev/tablero.html`, ya ordenado por curso, con "✓ todo el OA" y "✓ aprobar la
  asignatura". Se regenera con `python scripts/generar-tablero.py`.
- Criterio: **8 de 30 por OA** — está en [`docs/aprobacion-pedagogica.md`](docs/aprobacion-pedagogica.md),
  con las probabilidades calculadas y el límite dicho de frente (el muestreo caza un OA mal
  escrito, no una pregunta suelta).
- Después: "Exportar revisadas" → `python scripts/aplicar-revisadas.py` → regenerar el tablero.
- **Los OA actitudinales se revisan completos, no por muestreo** (ver `docs/cuidados-historia.md`).

**Se puede empezar hoy y avanza en paralelo con todo lo demás.**

---

## Bloque A · Cerrar los tres cursos que ya existen

Para poder decir "tengo 3°, 7° y 8°". Es el hito más cercano y el de mejor relación esfuerzo/valor.

| # | Tarea | Peso | Quién |
|---|---|---|---|
| A1 | **Aprobación pedagógica de 3° y 7°** (arriba) | 7–11 h | Roberto |
| A2 | **8 villanos** (4 de 3° + 4 de 7°). Hoy usan los de 8°, declarado en 7 comentarios `PLACEHOLDER` | ~1 sesión | Roberto genera, se procesan |
| A3 | Landing y `docs/comercial.md` hablando de tres cursos — **solo después de A1** | ~½ sesión | código |
| A4 | Conversación con el colegio sobre `CN07 OA 01/02/03` (sexualidad, currículum obligatorio; el colegio piloto es salesiano) | — | Roberto |
| A5 | Escuchar el clip de voz de **copihue** (`assets/voz/cie3/acb4dae9f7c13d0e.mp3`): el transcriptor no sirve para juzgar palabras que no conoce | 1 min | Roberto |
| A6 | Confirmar el **lunes 31/08** que apareció la primera foto semanal | 1 min | Roberto |

**Las portadas de capítulo siguen prestadas a propósito.** Son ~46 imágenes más para una
diferencia que casi nadie mira; el Jefe Final es donde el préstamo chirría.

---

## Bloque B · Terminar la v1 (4°, 5° y 6°)

**Orden decidido: 5° → 6° → 4°.** Los dos sin voz primero; 4° al final porque suma ~227 MB.

**Voz solo hasta 4°, y no es preferencia sino restricción:** con voz en 4°, 5° y 6° el sitio
publicado llegaría a ~950 MB y roza el techo de 1 GB de GitHub Pages. Con voz solo en 4°, queda
en ~500 MB.

| # | Curso | Contenido estimado | Peso | Costo |
|---|---|---|---|---|
| B1 | **5° básico** | ~80 OA, ~2.400 preguntas | 1–2 sesiones | — |
| B2 | **6° básico** | ~80 OA, ~2.400 preguntas | 1–2 sesiones | — |
| B3 | **4° básico** + voz + dibujos + auditoría de audibilidad | ~85 OA, ~2.550 preguntas, ~10.500 clips | 2–3 sesiones | ~US$8 de Azure |

> Los conteos de OA son **estimación**, no medición: salen de que 3° tiene 86, 7° tiene 81 y 8°
> tiene 69. El número exacto aparece al transcribir el currículum oficial (paso 0 de cada fase).

**El molde es el plan de 7°**, en 8 pasos: currículum contrastado contra dos fuentes → fork y
cascarón → códigos en el servidor y el panel → **tanda de validación de 6 OA antes de escalar**
→ banco por oleadas de agentes → campañas y villanos → auditoría → verificación en navegador.

Estándar y trampas ya escritos, **no reinventarlos**:
`docs/prompt-generador-preguntas.md` (criterio pedagógico y estándar de calidad del generador) ·
`docs/prompt-validador-preguntas.md` (control de calidad independiente del banco) ·
`docs/encargo-banco.md` (parametrizado por curso) · `docs/cuidados-matematica.md` ·
`docs/cuidados-historia.md` · `docs/cuidados-ciencias.md` · `docs/cuidados-lenguaje-3basico.md` ·
`docs/esquema-oa-json.md`.

> **La regla que más ahorra:** un defecto del encargo descubierto con 6 tandas cuesta la sexta
> parte que con 38. **La tanda de validación no se salta nunca.**

### Antes de B1, o en paralelo: terminar de desduplicar el motor

Tras el corte de la Sesión 65, **7° es 89% idéntico a 8° y 3° un 77%**: quedan **~3.050 líneas
duplicadas tres veces**, y con seis cursos serían seis. Ya no es código muerto: es motor vivo.

| # | Módulo a extraer a `assets/js/` | Estado |
|---|---|---|
| M1 | `visuales.js` — `renderVisual` + `textoVisual`, 11 dibujos, hoy solo en 3° | pendiente (lo necesita 4°) |
| M2 | `voz.js` — hoy solo en 3° | pendiente (lo necesita 4°) |
| M3 | `motor.js` — quiz, campaña, jefes, tienda, duelo | pendiente, va al final |
| M4 | `niveles.js` — un solo catálogo del que se derive todo | pendiente |

**M4 es el que más duele hoy:** dar de alta un curso toca ~24 puntos en 3 archivos, 8 de ellos
listas paralelas. `SB_asigDe` de `profesor.html` es un espejo escrito a mano de
`kimun_oa_asignatura`, que es el patrón que ya causó un bug real.

> ⚠️ **Al mover código a un `<script src>`, PROBAR SIEMPRE qué pasa si NO carga.** Un 404 de
> `revision.js` mató una vez todo el JavaScript del juego, y el síntoma engaña: la pantalla se
> ve bien y ningún botón responde. Cada módulo lleva su respaldo vacío antes de usarse.

---

## Bloque C · PWA v1.0

Plan completo en `docs/roadmap-tecnico.md` §3. **Nada de esto está implementado.**

**Rama propia: `feature/pwa-v1`. No se trabaja sobre `main`.**

| # | Tarea |
|---|---|
| C1 | Auditoría sin modificar: URLs absolutas, `fetch`, `localStorage`, Supabase, audio, video, y qué se rompe al instalar |
| C2 | Manifiesto **por curso** e íconos (192/512 + maskable) |
| C3 | `pwa.js`: registro del SW, `beforeinstallprompt`, detección de modo instalado |
| C4 | `sw.js` con las estrategias de caché de la tabla del roadmap |
| C5 | Instalación probada en Android Chrome, iPhone Safari y escritorio |
| C6 | **Prueba obligatoria de actualización**: instalar → jugar → publicar → abrir → confirmar que actualizó y que la caché vieja se borró |
| C7 | Offline: inicio → asignatura → campaña → pregunta → respuesta → resultado |
| C8 | Con internet: login, ranking, XP, duelo, panel |

**Tres correcciones al análisis externo que hay que respetar** (`docs/roadmap-tecnico.md` §2):

1. **Un manifiesto por curso, no uno solo.** Hay tres apps forkeadas; un `start_url` único
   instalaría "VULPO" y abriría el curso equivocado para dos de cada tres alumnos.
2. **La precarga cache-first que proponen es inviable.** `assets/` son 459 MB, de los cuales
   **227 MB son la voz de 3°**: cachearlo todo en el `install` le bajaría ~250 MB al teléfono de
   un niño la primera vez que abre. La voz se cachea **clip a clip al reproducir**.
3. **El `<base href="/">`** de los tres juegos obliga a que el alcance del SW sea `/`, no
   `/juego/`.

---

## Bloque D · Progreso en el servidor

**Es el requisito real del modelo de suscripción, y no depende de la PWA.**

Hoy el XP y el dominio por OA están en Supabase, pero **las monedas, las skins y el avance de
campaña viven solo en `localStorage`**. Mientras siga así, prometerle a un apoderado que su hijo
cambia de teléfono y recupera todo **sería falso**.

| # | Tarea |
|---|---|
| D1 | Decidir qué se sube y con qué frecuencia (el patrón de `kimun_dominio` ya resuelve el reintento sin interrumpir la partida) |
| D2 | Tabla y funciones en Supabase |
| D3 | Resolución de conflictos: dos dispositivos, el mismo alumno |
| D4 | Migración cortés del avance que ya vive en los teléfonos |

---

## Bloque E · Suscripción y pagos

**No se programa hasta terminar D.** Modelo conceptual en `docs/roadmap-tecnico.md` §4; el
modelo comercial, en `docs/comercial.md`.

- E1 · Modelo de usuario y suscripción en Supabase (el producto es **el curso, con vigencia
  anual**; la cuenta es permanente y la suscripción cambia — eso convierte el paso de 7° a 8° en
  retención en vez de baja).
- E2 · **Decidir la arquitectura de distribución ANTES de programar pagos.** Web y tiendas de
  apps tienen reglas distintas: una app que vende contenido digital dentro de la aplicación cae
  bajo las políticas de compra in-app de Google y Apple. Diseñar el pago antes de decidir esto
  es rehacerlo dos veces.
- E3 · Pasarela.

> **La puerta actual es blanda y hay que saberlo:** `tieneLicencia()` solo lee `localStorage`,
> **no revalida contra Supabase**. El discurso comercial no debe prometer que "el acceso se apaga
> si el colegio deja de pagar", porque hoy no ocurre.

---

## Bloque F · Capacitor, Android, iOS

**No se toca antes de estabilizar la PWA v1.0.** Android primero: valida la publicación en
tienda y permite probar notificaciones antes de enfrentar iOS. Detalle en
`docs/roadmap-tecnico.md` §5.

---

## Trámites, fuera del código

- **Registrar la marca VULPO en INAPI.** Verificado disponible el 18/08/2026, **no registrada**.
  Mientras no se inscriba, cualquiera puede registrarla primero y el proyecto quedaría en el
  mismo problema que tuvo con el nombre anterior. Clases: software y educación.
- **Constituir la SpA** (Empresa en un Día) para poder facturar. Si un colegio acepta y no hay
  cómo emitir factura, la venta se cae en el último paso.
- **Enlace de agenda real** (Calendly o similar) para el botón de la landing, hoy en WhatsApp.

---

## Ramas

- **`main`** — lo que se publica. GitHub Pages sirve desde aquí, así que todo lo que entre está
  en vivo en `vulpo.cl`.
- **`feature/pwa-v1`** — Bloque C. No mezclar con nada más.
- **Una rama por curso nuevo** para el Bloque B (`feature/5basico`, etc.). El contenido son
  miles de archivos y conviene aislarlo.
- **`feature/motor-<modulo>`** para cada extracción del motor, **una a la vez**, verificando en
  los tres cursos antes de seguir.

> **Regla del roadmap:** no mezclar la migración a PWA con la evolución de 3° o 7°.
> **Una variable a la vez.**

---

## Reglas que no se negocian

Cada una nació de un defecto real; el detalle está en `CLAUDE.md`.

1. **Verificar corriendo la página, no leyendo el código.**
   `node scripts/cdp.mjs about:blank <pasos.mjs>`. Los 404 **no llegan a la consola de forma
   fiable**: hay que mirarlos en la red. Toda verificación cierra con **cero errores de consola
   y cero 404** en los tres cursos, no solo en el que se tocó.
2. **Las diferencias entre cursos van como DATO, no como `if`.** Banderas con nombre
   (`HAY_RETO_CALCULO`, `HAY_MINICLASES`, `HAY_VOCABULARIO`, `HAY_BIBLIOTECA`, `SIN_RELOJ`), cada
   una pegada al comentario que explica qué pasa si se pone mal. **Al crear un curso, ponerlas
   todas explícitamente**, aunque el valor coincida con el original.
3. **Nunca borrar código por aritmética de índices ni por filtros de prefijo.** Anclas exactas,
   aserciones que aborten antes de escribir, y balance de llaves para funciones sueltas.
4. **Preservar CRLF** en los tres `index.html`. Pasarlos a LF deja inservible la comparación
   entre cursos, que es la herramienta principal para mantenerlos.
5. **Nunca escribir un glob, una ruta con comodín ni una expresión regular dentro de un
   comentario de bloque.** Un cierre de comentario prematuro mata el juego entero.
6. **El mensaje de commit va siempre en un archivo, con `git commit -F`.** Comprobación:
   `git log -1 --format="%s"` debe devolver el título de verdad.
7. **Al tocar `supabase/schema.sql`, Roberto lo re-aplica a mano** y se **mira el número** de la
   verificación. Si a `kimun_prof_asignaturas` le falta un código, ese contenido queda invisible
   para el Profesor Jefe **sin ningún error**.
8. **La voz se genera DESPUÉS de auditar el banco, nunca en paralelo.** Cada texto corregido
   obliga a regenerar su clip y a pagarlo de nuevo.
9. **`META_OA` es lo primero que se olvida al forkear, y muere en silencio.** La comprobación
   está escrita en `CLAUDE.md`, en los gotchas de 7°, y debe dar arreglo vacío.

---

## Lo que NO se hace

- ❌ Rehacer VULPO en Flutter o React Native.
- ❌ Android e iOS en paralelo desde el primer día.
- ❌ Offline completo con cola de sincronización antes de saber qué necesita funcionar sin conexión.
- ❌ Pagos antes de estabilizar el producto y el modelo de usuario.
- ❌ **Prometer "VULPO 100% offline".** La PWA da offline *parcial*; ranking, duelo,
  sincronización y panel siguen exigiendo internet.
- ❌ Unificar los seis juegos en una sola app multinivel de un salto. La extracción por módulos
  converge hacia allá sin el big-bang.
- ❌ Portadas propias de capítulo para todos los cursos (~110 imágenes). Solo villanos en la v1.
