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

## Dónde estamos hoy (30/08/2026, medido en disco)

| Curso | OA | Preguntas | Aprobadas | Voz | Arte propio |
|---|---|---|---|---|---|
| 3° | 86 | 2.558 (+101 apoyo) | ✅ **todas** | ✅ 11.077 clips | villanos ✅ · portadas ❌ |
| 4° | 92 | — | — | pendiente | — |
| 5° | 93 | — | — | no lleva | — |
| 6° | 99 | — | — | no lleva | — |
| 7° | 81 | 2.430 (+120 apoyo) | ✅ **todas** | no lleva | villanos ✅ · portadas ❌ |
| 8° | 69 | 2.314 (+222 apoyo) | ✅ todas | no lleva | ✅ |

- **7.745 preguntas escritas · 7.745 aprobadas · 0 pendientes.** El currículum de 4°, 5°
  y 6° ya está fijado (284 OA), pero sin una sola pregunta escrita todavía.
- **Sitio publicado: 317 MB** (techo de GitHub Pages: 1 GB). `assets/` completo son 475 MB,
  de los cuales 263 MB son la voz de 3° y 175 MB los originales, ya excluidos del sitio.
  El reparto y sus reglas, en `CLAUDE.md` → “Cómo se ordenan los archivos”.
- **Backend al día:** `schema.sql` aplicado y verificado, los códigos de los tres cursos en las
  dos listas de `kimun_prof_asignaturas`, y la foto semanal agendada.
- **Paridad de funcionalidad entre los tres cursos: completa.** No queda motor pendiente para
  que 3°, 7° y 8° funcionen igual.

---

## ✅ El bloqueo que era el camino crítico: LEVANTADO (30/08/2026)

**Roberto aprobó 3° y 7° por muestreo: 5.048 preguntas, y ese mismo día los 60 que habían
quedado saltados.** El proyecto pasa de 2.637 a **7.745 de 7.745: el banco entero firmado.**

Con esto el Bloque A queda cerrado y **lo que manda ahora es el Bloque B** (los bancos de 4°, 5°
y 6°) con **M4** delante, que es lo que lo abarata.

> ⚠️ **Cómo se aprobó importa, y hay que sostenerlo si un colegio pregunta.** 8° se revisó
> **pregunta por pregunta**; 3° y 7° se aprobaron **por muestreo** —8 de cada 30 por objetivo—.
> Por eso la landing dice *"aprobadas por un profesor, objetivo por objetivo"* y **no** *"una a
> una"*, que sería exagerar. El muestreo caza un objetivo mal escrito, no una pregunta suelta
> mala, y eso está dicho en `docs/aprobacion-pedagogica.md`.

**No queda aprobación pendiente.** Lo que sigue describe la herramienta, que es la misma que
usarán 4°, 5° y 6°.

- Herramienta: `dev/tablero.html` → botón **"⚡ Aprobar por muestreo"** (Sesión 70). Una pantalla
  por objetivo con **sus 8 preguntas ya elegidas**, teclado (**espacio** aprueba y avanza, **V**
  manda a ver las 30, **S** salta), contador *"N de 170"* y **reanudar donde quedaste**. La cola
  son solo los OA pendientes, así que 8° no aparece. Se regenera con
  `python scripts/generar-tablero.py`. Siguen estando "✓ todo el OA" y "✓ aprobar la asignatura"
  para corregirse o ir a un objetivo puntual.
- Criterio: **8 de 30 por OA** — está en [`docs/aprobacion-pedagogica.md`](docs/aprobacion-pedagogica.md),
  con las probabilidades calculadas y el límite dicho de frente (el muestreo caza un OA mal
  escrito, no una pregunta suelta).
- Después: "Exportar revisadas" → `python scripts/aplicar-revisadas.py` → regenerar el tablero.
- **Los OA actitudinales se revisan completos, no por muestreo** (ver `docs/cuidados-historia.md`).

**Al aplicar aparecieron dos defectos de la herramienta, los dos ya corregidos:**
`aplicar-revisadas.py` re-escribía con `indent=2` fijo y **reformateaba entero** cualquier banco
con otro formato (el diff de marcar 390 preguntas pasaba de 390 líneas a 5.463), y no conservaba
el salto de línea final. Ahora detecta el formato de cada banco con un round-trip y lo respeta;
comprobado corriéndolo dos veces seguidas sin que toque un byte.

---

## Para lanzar con un curso REAL (medido el 30/08/2026)

Esto no es un bloque del roadmap: es la lista corta de lo que hay entre hoy y un curso jugando.

**Bloquea de verdad:**

1. **La puerta cierra el 1 de octubre** en los tres cursos (`FECHA_PUERTA='2026-10-01'`;
   corrida desde el 1 de septiembre el 31/08/2026, para que Fiestas Patrias no parta el piloto).
   Desde ese día, sin credencial solo se juega la demo (`hist-cap1` / `hist7-cap1` /
   `mat3-cap1`). O sea que **el curso tiene que entrar con credencial desde el primer día**.
2. **Elegir la puerta de entrada**, que son dos y no equivalen:
   - **Códigos `ALU-`** — funciona hoy, sin tocar nada. Se crea el curso, se pega la lista con
     "Cargar varios de una vez" y se reparte un código a cada uno. Un código perdido deja a un
     alumno fuera, pero **nadie más entra**.
   - **Enlace de inscripción** — más cómodo (uno al chat, cada uno escribe su nombre), pero
     **el enlace ES la credencial**: reenviado, entra cualquiera hasta llenar el cupo, y no hay
     revocación por persona. Necesita el schema re-aplicado. Ver A17.
3. **Publicar.** Nada existe en `vulpo.cl` hasta el commit + push: GitHub Pages sirve de `main`.

**Del día, según el curso:**

- **Si es 7°**, la conversación sobre `CN07 OA 01/02/03` va **antes** de repartir el enlace
  (ver A4). El armador (`?armar=1`) marca esos capítulos en rojo, justamente para poder
  mostrárselos.
- **Confirmar la foto semanal** el lunes siguiente (A6).

**No bloquea, pero hay que decirlo antes de que lo descubran:**

- **No funciona sin internet**, ni la primera carga ni los bancos.
- **El progreso local es del teléfono**, no del alumno: monedas, skins y avance de campaña
  viven en `localStorage`; al servidor suben el XP y el dominio por objetivo. Dos hermanos en
  el mismo tablet comparten avance aunque tengan XP distinto en el ranking.

**Los trámites bloquean COBRAR, no jugar:** un piloto gratuito no necesita ni la SpA ni INAPI.

---

## Bloque A · Cerrar los tres cursos que ya existen

Para poder decir "tengo 3°, 7° y 8°". Es el hito más cercano y el de mejor relación esfuerzo/valor.

| # | Tarea | Peso | Quién |
|---|---|---|---|
| ~~A1~~ | ~~**Aprobación pedagógica de 3° y 7°**~~ ✅ **HECHO (30/08)**: 5.048 preguntas aprobadas por muestreo. Quedan **60** (los `HI03 OA 01` y `OA 08`, saltados) | ~15 min | Roberto |
| ~~A2~~ | ~~**8 villanos** (4 de 3° + 4 de 7°)~~ ✅ **HECHO (28/08)**: 16 imágenes (normal + derrotado) generadas, procesadas (`procesar-lote8.py`) y cableadas; `PLACEHOLDER` fuera | — | — |
| ~~A3~~ | ~~Landing y `docs/comercial.md` hablando de tres cursos~~ ✅ **HECHO (28/08)**: se hizo **antes** de A1 sin romper la regla, diciendo el estado real — la landing declara que las 2.536 de 8° están aprobadas una a una y que 3° y 7° están **en revisión pedagógica**. Ver A8 | — | — |
| ~~A8~~ | ~~Al cerrar A1, actualizar esa frase~~ ✅ **HECHO (30/08)**: la landing dice **7.745 preguntas aprobadas** (partió en 7.685 y esa misma tarde se firmaron los 60 que faltaban). **NO dice "una a una"**, a propósito: 8° se revisó pregunta por pregunta, pero 3° y 7° se aprobaron **por muestreo** (8 de 30 por objetivo). La frase es *"aprobadas por un profesor, objetivo por objetivo"*, que es la verdad y sigue siendo un argumento fuerte | — | — |
| ~~A18~~ | ~~**El curso guarda su nivel**~~ ✅ **HECHO (30/08, Sesión 73)**: se elige al crear el curso, y las casillas de "Equipo del curso" muestran **solo sus 4 asignaturas** en vez de las 12 de todos los niveles (con 6 cursos habrían sido 24). El servidor rechaza una asignatura de otro nivel. Sin listas nuevas: el nivel ya vive dentro del código (`MA03` = `MA` + `03`), que es la idea de **M4** — o sea que adelanta parte de esa tarea. Los cursos viejos siguen funcionando y el panel les ofrece fijárselo | — | — |
| A19 | **Duelo 1v1 en 3° básico.** Hoy está apagado con una línea de CSS (`#btnDuelo{display:none}`, Sesión 54), **diferido, no descartado**. Roberto lo quiere: *"estoy seguro que les gustará desafiar a otros compañeros"* — y es el único modo social del juego, que a esa edad es justo el gancho. **Antes de encenderlo hay que medir dos cosas, y la primera es de diseño, no de código:** (1) el duelo es **contra el reloj**, y 3° juega `SIN_RELOJ` en todo el curso a propósito (a los 8-9 años el cronómetro da ansiedad, no foco) — la salida es la misma que se le dio al Reto Sin Fin de 3°: **quitarlo**, no aflojarlo; (2) revisar que `cargarPoolDuelo` y el selector de expedición no apunten al banco de **8°**, que es el defecto del fork que ya mordió tres veces (el Duelo de 7°, el botón de mini-clase, `cargarPoolMate`) | ~½ sesión | código |
| A4 | Conversación con el colegio sobre el **contenido sensible obligatorio**. Ya no es solo `CN07 OA 01/02/03` (sexualidad de 7°): al transcribir el currículum de 4°, 5° y 6° aparecieron `CN06 OA 04/05/06` (sistema reproductor y pubertad), `CN06 OA 07` y `CN04 OA 08` (drogas y alcohol, este último a los 9 años), `HI05 OA 02/03/04/07` (conquista, guerra de Arauco, encomienda, esclavitud) e `HI06 OA 05/08` (Araucanía, quiebre de la democracia). Todos declarados en su `nota_contenido_sensible`. **Conviene una sola conversación que los cubra**, no seis | — | Roberto |
| ~~A5~~ | ~~Escuchar el clip de voz de **copihue**~~ ✅ **HECHO (28/08)**: Roberto eligió la pronunciación `ko.piˈwe` (IPA en `_FONEMAS`); los 2 clips regenerados y confirmados | — | — |
| A6 | Confirmar el **lunes 31/08** que apareció la primera foto semanal | 1 min | Roberto |
| ~~A9~~ | ~~**Vocabulario en 7°**~~ ✅ **HECHO (28/08)**: 120 palabras en 4 áreas (`contenido/vocabulario-7basico`), la bandera encendida y el handler restaurado. El código ya estaba en el fork: solo faltaba el dato | — | — |
| ~~A15~~ | ~~**Primer libro de 3°**~~ ✅ **HECHO (30/08, Sesión 72)**: *Cuentos de Ada* de Pepe Pelayo, 10 tramos y 101 preguntas en `contenido/lectura-cuentos-de-ada`. La biblioteca de 3° quedó encendida. Sello editorial **confirmado: Santillana Infantil**, y la portada **se queda en la genérica de Lectura a propósito**, para no ilustrar la tapa de un libro ajeno. **Las 101 quedaron aprobadas el 30/08** (aprobación forzada de Roberto) y con voz. Cerrada | — | — |
| ~~A16~~ | ~~**Voz de *Cuentos de Ada***~~ ✅ **HECHO (30/08)**: Roberto aprobó las 101 preguntas y se generaron los **515 clips** (12 MB, **US$0,32**) en `assets/voz/ada3/`, enganchados en `VOZ_DIRS`. Cobertura completa verificada y el clip suena en el navegador. **Ningún texto del libro cambia al pronunciarse**, así que el normalizador no lo toca. Queda opcional la auditoría por muestra con Azure STT (~US$0,06), que aquí solo sirve para los nombres propios (Ada, Yoyito, Pocho, Cary, Orco) | — | — |
| ~~A11~~ | ~~**Reto Sin Fin de cálculo en 7°**~~ ✅ **HECHO (28/08)**: motor compartido en `assets/js/calculo.js` + `genCalc7()` con el temario de 7°. **No consume banco de preguntas**: las operaciones se generan por código, así que no suma nada a la aprobación pedagógica ni a la voz | — | — |
| A12 | **Migrar el Reto de Cálculo de 8° al motor compartido.** Hoy 8° tiene su propio motor inline (171 líneas) y `assets/js/calculo.js` existe aparte: hay solape. Es un cambio sobre la app en producción, así que va como paso propio y con su verificación | ~½ sesión | código |
| ~~A13~~ | ~~**Reto Sin Fin en 3°**~~ ✅ **HECHO (28/08)**: **sin reloj**, medido por escalones. Encaja mejor que en 7°: no es un extra sino la práctica de `MA03 OA 04` (cálculo mental hasta 100), `OA 08` (tablas) y `OA 09` (división). Sin banco, sin voz nueva, sin sumar horas de aprobación | — | — |
| A14 | **Vocabulario en 3°: decidir si va.** (Absorbe a la antigua A10, que era la misma tarea dada por decidida.) Medido, se solapa con su propio currículum —`LE03 OA 10` (significado por contexto y raíces) y `OA 11` (diccionario) ya tienen 30 preguntas cada uno—, y costaría ~120 preguntas + ~600 clips de voz + horas de aprobación. El ángulo que NO se pisa sería otro: las palabras nuevas que aparecen en Ciencias e Historia de 3°, que es distinto de *la estrategia* para deducirlas | decisión | Roberto decide |
| ~~A7~~ | ~~**Marcar el contenido sensible en el armador**~~ ✅ **HECHO (28/08, Sesión 67)**: `assets/js/sensible.js` (mapa de los 20 OA + 5 categorías) + leyenda/emojis/resumen en `arrancarArmador` de las tres apps. La decisión se toma al construir el enlace (la casilla por capítulo es el control); el enlace de venta no cambió. Verificado con `cdp.mjs`, cero consola / cero 404 | — | — |

| ~~A17~~ | ~~**Inscripción por enlace único (modo experimental)**~~ ✅ **HECHO (30/08, Sesión 73)**: un enlace al chat del curso, cada persona escribe su nombre, se crea sola en un curso ya abierto, recibe su `ALU-` y su avance se registra. Backend, pantalla del juego en los tres cursos, bloque del panel y `?inscribir=`. Esquema aplicado y **aislamiento verificado en sus dos mitades** (cuenta ajena → `no_autorizado`; admin → funciona). **Queda opcional** correr `supabase/probar-inscripcion.sql` (2 filas en `ok`), que comprueba el techo del cupo | — | — |

**Las portadas de capítulo siguen prestadas a propósito.** Son ~46 imágenes más para una
diferencia que casi nadie mira; el Jefe Final es donde el préstamo chirría.

---

## Bloque O · Ordenar las bases (auditoría del 30/08/2026)

Cuatro agentes midieron el motor, los scripts, la documentación y el contenido; cada hallazgo se
verificó a mano antes de entrar aquí. Detalle y método:
[`docs/superpowers/plans/2026-08-30-ordenar-las-bases.md`](docs/superpowers/plans/2026-08-30-ordenar-las-bases.md).

**Va antes del Bloque B**, porque todo lo que se sume después se copia tres veces más.

| # | Qué | Peso | Quién |
|---|---|---|---|
| ~~O1~~ | ~~Retirar los scripts muertos~~ ✅ **HECHO (30/08)**: 10 retirados (los 8 procesadores de arte, `aplicar-fix-distractores`, `generar-pdf-preguntas`), rescatando antes su parte reutilizable en **`scripts/procesar-arte.py`**, que recibe los archivos por argumento y se probó reprocesando un villano real | — | — |
| ~~O2~~ | ~~Salir con error cuando se encuentran errores~~ ✅ **HECHO (30/08)**: `revisar-tanda.py` y `auditar-numerico.py` imprimían los defectos y **salían con 0**, así que un `&&` los ignoraba. Probado con un banco roto a propósito | — | — |
| ~~O3~~ | ~~El fallback silencioso de los scripts de voz~~ ✅ **HECHO (30/08)**: pedirles una asignatura desconocida **generaba o auditaba Matemática sin avisar**, y al auditor le faltaba `ada3` — o sea que auditar el libro habría auditado Matemática y pagado por ello. Ahora mueren con un mensaje | — | — |
| ~~O4~~ | ~~Assets huérfanos~~ ✅ **HECHO (30/08)**: 5 retirados (~900 KB), verificados con búsqueda exacta | — | — |
| ~~O5~~ | ~~Documentación con afirmaciones falsas~~ ✅ **HECHO (30/08)**: 22 hallazgos. Los 5 graves eran contradicciones en `comercial.md` y `aprobacion-pedagogica.md`; más el ranking "simulado", la tabla de banderas, el peso con cuatro cifras distintas y el armador con 2 niveles en vez de 3 | — | — |
| **O6** | **Generalizar lo cableado a 3°, que es lo que rompe 4°.** `normalizar-voz-3ro.py` decide si `7:45` es hora mirando códigos **`MA03`**: en 4° no empareja, el texto llega crudo a Azure, **el clip se paga, se genera y suena mal**, y nadie se entera. Sus números en palabras además llegan solo hasta 1.000. Y `generar-voz-3ro.py` / `generar-revision-preguntas.py` leen `3ro/index.html` siempre | ~½ sesión | código |
| **O7** | **`.gitattributes`.** No existe, y de ahí salen los 9 formatos de serialización y la mezcla LF/CRLF. ⚠️ Su migración toca **todos** los archivos: va sola en su commit, y **antes de unificar formatos** (O8), no antes de todo | ~½ sesión | código |
| **O8** | **El contrato del contenido, antes de escribir 8.490 preguntas.** Un solo formato de `preguntas.json` (hoy 9 variantes); un solo contrato de `_pool/` (hoy 3, y 72 de 180 archivos formateados a mano); y **la convención de `id` para 4°, 5° y 6°** — hoy no es derivable (`cie3`/`cien8`, `mat3`/`mate7`) y ⚠️ **NO se renombran los existentes**: las marcas de aprobación se guardan por id | ~1 sesión | código |
| ~~O9~~ | ~~Modo Difícil en 3°~~ ✅ **HECHO (30/08)**: su diseño lo descartó por edad y el fork lo dejó vivo. Ahora es la bandera **`HAY_DIFICIL`**, con las mismas 4 guardas en los tres forks. De paso cierra que **la Maestría Total era inalcanzable en 3°** (`esMaestro` exigía `S.calc.jefe`, que ahí nadie escribe) | — | — |

## Bloque B · Terminar la v1 (4°, 5° y 6°)

**Orden decidido: 5° → 6° → 4°.** Los dos sin voz primero; 4° al final porque suma ~254 MB.

**Voz solo hasta 4°, y no es preferencia sino restricción:** con voz en 4°, 5° y 6° el sitio
publicado llegaría a ~950 MB y roza el techo de 1 GB de GitHub Pages. Con voz solo en 4°, queda
en ~500 MB.

### ✅ B0 · El currículum de los tres cursos ya está fijado (Sesión 71)

Las **12 carpetas de `contenido/` existen, con su `oa.json` transcrito del currículum oficial**
y validado. Ya no hay que estimar: los OA están contados y con su texto literal.

| # | Curso | OA | Preguntas a escribir (30 × OA) | Peso | Costo |
|---|---|---|---|---|---|
| B1 | **5° básico** | **93** (MA 27 · LE 30 · CN 14 · HI 22) | ~2.790 | 1–2 sesiones | — |
| B2 | **6° básico** | **99** (MA 24 · LE 31 · CN 18 · HI 26) | ~2.970 | 1–2 sesiones | — |
| B3 | **4° básico** + voz + dibujos + auditoría de audibilidad | **92** (MA 27 · LE 30 · CN 17 · HI 18) | ~2.760 (−30 del OA excluido) | 2–3 sesiones | ~US$8 de Azure |

**284 OA y ~8.490 preguntas**, algo más que la estimación anterior (~7.350). El paso 0 del molde
de 7° —transcribir el currículum— **está hecho para los tres**; se entra directo al fork y al
banco.

**Tres cosas quedaron declaradas en los `oa.json` y hay que respetarlas al escribir el banco:**

- **`LE04 OA 15` está EXCLUIDO** («escribir con letra clara»): es caligrafía manuscrita y no
  admite pregunta honesta. Mismo criterio que `LE03 OA 16` y `LE07 OA 12`, y declarado en
  `oa_excluidos_del_banco`, no en prosa.
- **Contenido sensible en cuatro asignaturas**, con su `nota_contenido_sensible`: `CN06 OA
  04/05/06` (sistema reproductor y pubertad) y `CN06 OA 07` (drogas) — hermanos de los `CN07 OA
  01/02/03` que ya hay que conversar con el colegio salesiano (tarea A4); `CN04 OA 08` (alcohol,
  a los 9 años); `HI05 OA 02/03/04/07` (conquista, guerra de Arauco, encomienda y esclavitud); y
  `HI06 OA 05/08` (ocupación de la Araucanía y quiebre de la democracia). **La conversación con
  el colegio crece: ya no es solo 7°.**
- **Lenguaje sigue siendo el menos evaluable por quiz**: 13 de 30 OA en 4°, 13 de 30 en 5° y 14
  de 31 en 6° son de producción o de hábito. Y **Historia suma 6 o 7 OA actitudinales por
  curso**. Las dos advertencias están escritas en cada `nota_evaluacion`.

> **Los `oa.json` agrupan por EJE, no por capítulo de juego, y es a propósito.** Se escribieron
> para fijar el currículum antes de que exista una sola pregunta; el reparto en capítulos
> jugables se decide al construir el nivel, cuando ya se sabe cuántas preguntas admite cada
> objetivo. Cada archivo lo dice en su `nota_unidades`.

**El molde es el plan de 7°**, en 8 pasos: currículum contrastado contra dos fuentes → fork y
cascarón → códigos en el servidor y el panel → **tanda de validación de 6 OA antes de escalar**
→ banco por oleadas de agentes → campañas y villanos → auditoría → verificación en navegador.

Estándar y trampas ya escritos, **no reinventarlos**:
`docs/prompt-generador-preguntas.md` (criterio pedagógico y estándar de calidad del generador) ·
`docs/prompt-validador-preguntas.md` (control de calidad independiente del banco) ·
`docs/arquitectura-pipeline-preguntas.md` (diseño objetivo del pipeline por pregunta, NO implementado
hoy) · `docs/arquitectura-construccion-etapas.md` (diseño objetivo OA→etapa, NO implementado hoy) ·
`docs/modulos-transversales.md` (el Reto de cálculo, las lecturas y el Vocabulario: son otra
categoría y tienen su propio estándar) ·
`docs/encargo-banco.md` (parametrizado por curso) · `docs/cuidados-matematica.md` ·
`docs/cuidados-historia.md` · `docs/cuidados-ciencias.md` · `docs/cuidados-lenguaje-3basico.md` ·
`docs/esquema-oa-json.md`.

> **La regla que más ahorra:** un defecto del encargo descubierto con 6 tandas cuesta la sexta
> parte que con 38. **La tanda de validación no se salta nunca.**

### Antes de B1, o en paralelo: terminar de desduplicar el motor

**Medido el 30/08** (auditoría con agentes, no estimación): **1.982 líneas de JS son comunes a
los tres forks**, o sea **~3.964 líneas redundantes** en el repositorio. Es el 63,5 % del JS de 8°,
el **77,6 % del de 7°** y el 64,8 % del de 3°. **71 funciones son byte a byte idénticas** en los
tres (y ese número es un piso, no un total). Ya no es código muerto: es motor vivo.

El orden lo fijó la medición, de menor a mayor riesgo:

| # | Módulo a extraer a `assets/js/` | Líneas | Por qué en esa posición |
|---|---|---|---|
| M1 | `visuales.js` — `renderVisual` + `textoVisual`, 11 dibujos, hoy solo en 3° | 281 | **Función pura**: recibe un objeto y devuelve SVG. No toca estado ni DOM, un solo punto de entrada, cero efectos al cargar. El más seguro del repo |
| M2 | `voz.js` — hoy solo en 3° | 134 | Igual de aislado, un escalón arriba por sus tres efectos al cargar |
| M4 | `niveles.js` — un solo catálogo del que se derive todo | — | No quita duplicación, pero es **el paso habilitante**: sin el dato afuera y cargado antes, el motor cae en zona muerta temporal. Spec y plan escritos |
| M3 | `motor.js` — **por rebanadas**: jefes → duelo → armador → persistencia → quiz | ~830 | Jefes primero (12 de 13 funciones idénticas); **persistencia y quiz al final**, porque un error ahí borra partidas guardadas |

**Preparación que hace idénticas cinco funciones más antes de mover nada:** propagar
`visual:q.visual` en los tres forks (es inocuo donde el campo no existe) y definir un no-op de
`callarVoz`.

**M4 es el que más duele hoy:** dar de alta un curso toca ~24 puntos en 3 archivos, 8 de ellos
listas paralelas. `SB_asigDe` de `profesor.html` es un espejo escrito a mano de
`kimun_oa_asignatura`, que es el patrón que ya causó un bug real. Verificado el 30/08: **hoy los
dos lados reconocen los mismos 18 códigos**, o sea nadie los ha desincronizado todavía — pero con
tres cursos más son ~96 ediciones a mano.

> ⚠️ **`motor.js` NO puede ir en el `<head>`.** Hay cientos de `$('id').onclick=` **en el nivel
> superior** del script; hoy funcionan porque va al final del `<body>`. `visuales.js` y `voz.js`
> son los **únicos dos** módulos que no sufren esto.

> ⚠️ **`SUFIJO` no existe en 8°**, y es la causa única de tres divergencias. Al extraer algo que
> toque `localStorage`, 8° necesita `const SUFIJO='';`. **No migrar la clave:** `kimun_save` sin
> sufijo es la partida real de todos los alumnos de 8°.

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
2. **La precarga cache-first que proponen es inviable.** `assets/` son 464 MB, de los cuales
   **251 MB son la voz de 3°**: cachearlo todo en el `install` le bajaría ~250 MB al teléfono de
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
