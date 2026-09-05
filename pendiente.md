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

## Dónde estamos hoy (31/08/2026, medido en disco)

| Curso | OA | Preguntas | Aprobadas | Voz | Arte propio |
|---|---|---|---|---|---|
| 3° | 86 | 2.558 (+161 apoyo) | ✅ **todas** | ✅ 11.391 clips | villanos ✅ · portadas 27/27 |
| 4° | 92 | — | — | pendiente | — |
| 5° | 93 | — | — | no lleva | — |
| 6° | 99 | — | — | no lleva | — |
| 7° | 81 | 2.430 (+120 apoyo) | ✅ **todas** | no lleva | villanos ✅ · portadas 23/23 |
| 8° | 69 | 2.314 (+222 apoyo) | ✅ todas | no lleva | ✅ portadas 20/20 |

- **7.805 preguntas escritas · 7.805 aprobadas · 0 pendientes.** El currículum de 4°, 5°
  y 6° ya está fijado (284 OA), pero sin una sola pregunta escrita todavía.
- **Sitio publicado: 343 MB** (techo de GitHub Pages: 1 GB). `assets/` completo son 473 MB,
  de los cuales 252 MB son la voz de 3° y 174 MB los originales, ya excluidos del sitio.
  ⚠️ Medido en **bytes reales**: `du` sin `--apparent-size` cuenta bloques de 4 KB y con
  11.391 clips infla ~26 MB (las cifras viejas venían de ahí).
  El reparto y sus reglas, en `CLAUDE.md` → “Cómo se ordenan los archivos”.
- **Backend al día:** `schema.sql` aplicado y verificado, los códigos de los tres cursos en las
  dos listas de `kimun_prof_asignaturas`, y la foto semanal agendada.
- **Paridad de funcionalidad entre los tres cursos: completa.** No queda motor pendiente para
  que 3°, 7° y 8° funcionen igual.

---

## ✅ El bloqueo que era el camino crítico: LEVANTADO (30/08/2026)

**Roberto aprobó 3° y 7° por muestreo: 5.048 preguntas, y ese mismo día los 60 que habían
quedado saltados.** El proyecto pasa de 2.637 a **7.745 de 7.745: el banco entero firmado.**
Al día siguiente se le sumaron las **60 del Vocabulario de 3°**, escritas y aprobadas el mismo
día, así que hoy son **7.805 de 7.805**.

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
     revocación por persona. **El esquema ya está aplicado y verificado.** Ver A17.
3. **Publicar.** Nada existe en `vulpo.cl` hasta el commit + push: GitHub Pages sirve de `main`.

**Del día, según el curso:**

- **Si es 7°**, la conversación sobre `CN07 OA 01/02/03` va **antes** de repartir el enlace
  (ver A4). El armador (`?armar=1`) marca esos capítulos en rojo, justamente para poder
  mostrárselos.
- **Confirmar la foto semanal** el lunes siguiente (A6).
- **Decirle al curso que se puede instalar.** El juego lo ofrece solo en la pantalla de inicio,
  pero conviene que el mensaje que reparte el enlace lo mencione: es lo que hace que el niño
  vuelva mañana en vez de perder el enlace en el chat. ⚠️ **Sin prometer que funciona sin
  internet**: instalarlo no es lo mismo que offline.

**No bloquea, pero hay que decirlo antes de que lo descubran:**

- **No funciona sin internet**, ni la primera carga ni los bancos.
- **El progreso YA viaja al servidor** (Bloque D, 01/09): monedas, skins y avance de campaña
  suben como una foto y vuelven al canjear el `ALU-` en otro teléfono. Lo que sigue siendo del
  aparato es el **vínculo**: en un tablet compartido, dos hermanos que canjean uno tras otro se
  van pisando el vínculo, aunque cada uno recupere lo suyo al volver a canjear.
  ⚠️ **Recuperarlo necesita internet**, que es distinto de funcionar sin conexión.

**Los trámites bloquean COBRAR, no jugar:** un piloto gratuito no necesita ninguno. La **SpA
ya está** (02/09); queda INAPI, que no bloquea el piloto pero sí el lanzamiento.

---

## Bloque A · Cerrar los tres cursos que ya existen

Para poder decir "tengo 3°, 7° y 8°". Es el hito más cercano y el de mejor relación esfuerzo/valor.

| # | Tarea | Peso | Quién |
|---|---|---|---|
| ~~A1~~ | ~~**Aprobación pedagógica de 3° y 7°**~~ ✅ **HECHO (30/08)**: 5.048 preguntas aprobadas por muestreo. Quedan **60** (los `HI03 OA 01` y `OA 08`, saltados) | ~15 min | Roberto |
| ~~A2~~ | ~~**8 villanos** (4 de 3° + 4 de 7°)~~ ✅ **HECHO (28/08)**: 16 imágenes (normal + derrotado) generadas, procesadas (`procesar-lote8.py`) y cableadas; `PLACEHOLDER` fuera | — | — |
| ~~A3~~ | ~~Landing y `docs/comercial.md` hablando de tres cursos~~ ✅ **HECHO (28/08)**: se hizo **antes** de A1 sin romper la regla, diciendo el estado real — la landing declara que las 2.536 de 8° están aprobadas una a una y que 3° y 7° están **en revisión pedagógica**. Ver A8 | — | — |
| ~~A8~~ | ~~Al cerrar A1, actualizar esa frase~~ ✅ **HECHO (30/08)**: la landing dice **7.805 preguntas aprobadas** (partió en 7.685, esa misma tarde se firmaron los 60 que faltaban y el 31/08 se sumaron las 60 del Vocabulario de 3°). **NO dice "una a una"**, a propósito: 8° se revisó pregunta por pregunta, pero 3° y 7° se aprobaron **por muestreo** (8 de 30 por objetivo). La frase es *"aprobadas por un profesor, objetivo por objetivo"*, que es la verdad y sigue siendo un argumento fuerte | — | — |
| ~~A18~~ | ~~**El curso guarda su nivel**~~ ✅ **HECHO (30/08, Sesión 73)**: se elige al crear el curso, y las casillas de "Equipo del curso" muestran **solo sus 4 asignaturas** en vez de las 12 de todos los niveles (con 6 cursos habrían sido 24). El servidor rechaza una asignatura de otro nivel. Sin listas nuevas: el nivel ya vive dentro del código (`MA03` = `MA` + `03`), que es la idea de **M4** — o sea que adelanta parte de esa tarea. Los cursos viejos siguen funcionando y el panel les ofrece fijárselo | — | — |
| ~~A19~~ | ~~**Duelo 1v1 en 3° básico**~~ ✅ **HECHO (31/08, Sesión 74)**: encendido con **30 s por pregunta y el reloj en grande** —el duelo SÍ lleva reloj aunque 3° juegue `SIN_RELOJ` en todo lo demás, porque es una competencia—. Va como **dato y no como `if`** (`DUELO_BANCO`, `DUELO_SEG`), y con eso `cargarPoolDuelo` quedó **byte a byte idéntica en los tres forks**. ⚠️ **Y destapó un bug VIVO en producción**: los tres descargaban `historia-8basico`, y como en **7° el botón del Duelo nunca estuvo oculto**, un alumno de 7° recibía preguntas de 8° sobre la conquista de América. Es el cuarto caso del defecto del fork. De paso se vio, mirando la captura y no el conteo, que **los botones fijos de música y sonido tapaban el reloj** —también en el quiz normal de 8°— | — | — |
| ~~A4~~ | ~~**Contenido sensible: lo elige el colegio al contratar**~~ ✅ **RESUELTO (02/09)**, y con una decisión de Roberto más simple que la feature que se creía necesaria: **lo de índole sexual se excluye de los Jefes Finales**, sin configuración y para todos. El problema era que el Jefe Final **se abre al 100% de la campaña y mezcla objetivos de toda la asignatura**, así que tenía una fase entera de `CN07 OA 01/02/03`: un colegio que no incluyera ese capítulo **se lo encontraba igual ahí**. Sacarlo deja el contenido sensible **viviendo en un solo lugar —su capítulo—**, que es lo que hace que excluirlo sea posible de verdad. El jefe conserva sus **4 fases y 16 preguntas** (los 12 OA restantes se reparten por unidad, y queda más coherente que antes). ⚠️ **El jefe DEL CAPÍTULO se queda**: quien no incluye el capítulo nunca llega a él, y vaciarlo lo dejaría roto para el que sí. Verificado peleando el jefe: **800 preguntas sorteadas del banco real, 12 OA distintos, cero sexuales**. Regla y chequeo en [`docs/contenido-sensible.md`](docs/contenido-sensible.md); vale igual para los `CN06 OA 04/05/06` cuando se construya 6°. **Ratificado el 03/09 y ampliado a regla general:** es lo **único** que sale del jefe — todo el resto del contenido sensible (drogas y alcohol, la conquista, Arauco, la encomienda, la esclavitud, la Araucanía, el quiebre de la democracia) **entra completo, en todos los cursos**, y con eso la feature de opt-in por categoría queda **DESCARTADA, no pospuesta**. Medido en los cuatro cursos: cero sexuales en los jefes, 18 OA sensibles restantes sí presentes | — | — |
| ~~A5~~ | ~~Escuchar el clip de voz de **copihue**~~ ✅ **HECHO (28/08)**: Roberto eligió la pronunciación `ko.piˈwe` (IPA en `_FONEMAS`); los 2 clips regenerados y confirmados | — | — |
| ~~A6~~ | ~~Confirmar la primera foto semanal~~ ✅ **HECHO (31/08)**: `dominio_semanal` tiene **dos** filas —`2026-08-30` (1.274), la que tomó el cron esta madrugada sellada con el domingo que cierra, y `2026-08-23` (1.270), de una corrida a mano anterior—. El historial está andando y ya no se pierde ninguna semana. Las 4 filas de diferencia son coherentes con *"0 de 26 jugaron esta semana"*: todavía no hay a quién medir | — | — |
| ~~A9~~ | ~~**Vocabulario en 7°**~~ ✅ **HECHO (28/08)**: 120 palabras en 4 áreas (`contenido/vocabulario-7basico`), la bandera encendida y el handler restaurado. El código ya estaba en el fork: solo faltaba el dato | — | — |
| ~~A15~~ | ~~**Primer libro de 3°**~~ ✅ **HECHO (30/08, Sesión 72)**: *Cuentos de Ada* de Pepe Pelayo, 10 tramos y 101 preguntas en `contenido/lectura-cuentos-de-ada`. La biblioteca de 3° quedó encendida. Sello editorial **confirmado: Santillana Infantil**, y la portada **se queda en la genérica de Lectura a propósito**, para no ilustrar la tapa de un libro ajeno. **Las 101 quedaron aprobadas el 30/08** (aprobación forzada de Roberto) y con voz. Cerrada | — | — |
| ~~A16~~ | ~~**Voz de *Cuentos de Ada***~~ ✅ **HECHO (30/08)**: Roberto aprobó las 101 preguntas y se generaron los **515 clips** (12 MB, **US$0,32**) en `assets/voz/ada3/`, enganchados en `VOZ_DIRS`. Cobertura completa verificada y el clip suena en el navegador. **Ningún texto del libro cambia al pronunciarse**, así que el normalizador no lo toca. Queda opcional la auditoría por muestra con Azure STT (~US$0,06), que aquí solo sirve para los nombres propios (Ada, Yoyito, Pocho, Cary, Orco) | — | — |
| ~~A11~~ | ~~**Reto Sin Fin de cálculo en 7°**~~ ✅ **HECHO (28/08)**: motor compartido en `assets/js/calculo.js` + `genCalc7()` con el temario de 7°. **No consume banco de preguntas**: las operaciones se generan por código, así que no suma nada a la aprobación pedagógica ni a la voz | — | — |
| ~~A12~~ | ~~Migrar el Reto de Cálculo de 8° al motor compartido~~ ❌ **DESCARTADA (31/08), y la tarea estaba mal dimensionada.** Medido: 8° **no carga** `calculo.js` (solo tiene su respaldo vacío), y su Sin Fin inline son **~14 líneas** (`iniciarSinFin` 4 + `terminarSinFin` 10), no 171 — las otras ~157 son niveles, etapas y el Jefe El Autómata, que **`calculo.js` no sabe hacer**: ese módulo es *solo* Sin Fin. Migrarlo sumaría una segunda pantalla inyectada, un segundo reloj y un segundo HUD compitiendo con `scr-calc`, y cambiaría música y récord en una app con alumnos jugando. **De paso se auditó lo que sí importaba:** 5.000 operaciones de `genCalculo`, 100% verificadas por cálculo independiente → **0 claves malas, 0 opciones repetidas, 0 decimales** (en 7° y 3° ese mismo control sí encontró defectos). La única versión con valor sería mover el Reto **completo** al módulo para que 3° y 7° hereden niveles y jefe, y eso es producto, no limpieza | — | — |
| ~~A13~~ | ~~**Reto Sin Fin en 3°**~~ ✅ **HECHO (28/08)**: **sin reloj**, medido por escalones. Encaja mejor que en 7°: no es un extra sino la práctica de `MA03 OA 04` (cálculo mental hasta 100), `OA 08` (tablas) y `OA 09` (división). Sin banco, sin voz nueva, sin sumar horas de aprobación | — | — |
| ~~A14~~ | ~~**Vocabulario en 3°**~~ ✅ **HECHO (31/08)**: 60 preguntas en `contenido/vocabulario-3basico` (30 `VOC-CIEN` + 30 `VOC-HIST`), **aprobadas** y **con voz** (309 clips, ~US$0,23). **DOS áreas y no cuatro**, porque Lenguaje de 3° ya cubre vocabulario en su currículum (`LE03 OA 10` y `OA 11`, 30 preguntas cada uno) y medirlo otra vez sería duplicar; el ángulo que no se pisa son las palabras nuevas de Ciencias e Historia. Los seis filtros en cero, incluido `auditar-audible-nivel`. ⚠️ **Al abrirlo apareció que el modo de muestreo del tablero decía «no queda nada por revisar» sobre un banco recién escrito**: guardaba la posición como índice de una cola que se recalcula, así que con la cola más corta el clamp dejaba a Roberto al final. Ahora guarda el **código del objetivo** | — | — |
| ~~A7~~ | ~~**Marcar el contenido sensible en el armador**~~ ✅ **HECHO (28/08, Sesión 67)**: `assets/js/sensible.js` (mapa de los 20 OA + 5 categorías) + leyenda/emojis/resumen en `arrancarArmador` de las tres apps. La decisión se toma al construir el enlace (la casilla por capítulo es el control); el enlace de venta no cambió. Verificado con `cdp.mjs`, cero consola / cero 404 | — | — |

| ~~A20~~ | ~~**El duelo asíncrono no cerraba su ciclo**~~ ✅ **HECHO (31/08, Sesión 76)**: el retado veía su resultado, pero **el retador no se enteraba nunca** — `kimun_historial` existía desde la Sesión 6 y ningún cliente la había llamado jamás. Ahora la pantalla de inicio avisa ⚔️ que te desafiaron y 🏆 cómo terminó el tuyo, con la marca de visto **en el servidor** para que sobreviva a borrar los datos del navegador. Probado el **ciclo completo contra producción** con dos identidades reales. ⚠️ De paso apareció, **probando y no leyendo**, que el duelo contra un bot **repetía** el aviso: se resuelve al instante y el jugador ya lo vio en pantalla | — | — |
| ~~A21~~ | ~~**Ranking de duelos del curso**~~ ✅ **HECHO (31/08, Sesión 76)**: en la misma pantalla del duelo, por **duelos ganados**, **sin contar los bots** y acotado al curso. **No guarda nada nuevo**: el dato ya vivía entero en `duelos`. De paso, la regla de desempate dejó de estar **escrita a mano en tres lugares** y vive una sola vez en `kimun_duelo_ganador`. Y el reloj del duelo en línea acumulaba **tiempo negativo en 3°** (`15 - OD.t` con el 15 cableado y el reloj en 30) | — | — |
| ~~A17~~ | ~~**Inscripción por enlace único (modo experimental)**~~ ✅ **HECHO (30/08, Sesión 73)**: un enlace al chat del curso, cada persona escribe su nombre, se crea sola en un curso ya abierto, recibe su `ALU-` y su avance se registra. Backend, pantalla del juego en los tres cursos, bloque del panel y `?inscribir=`. Esquema aplicado y **aislamiento verificado en sus dos mitades** (cuenta ajena → `no_autorizado`; admin → funciona). **Queda opcional** correr `supabase/probar-inscripcion.sql` (2 filas en `ok`), que comprueba el techo del cupo | — | — |
| ~~A22~~ | ~~**Instalarlo en la pantalla del teléfono**~~ ✅ **HECHO (31/08)**: los tres cursos tienen `manifest.webmanifest` propio (ícono, nombre y sin barra del navegador) y `assets/js/instalar.js` le explica al apoderado cómo agregarlo, con el paso a paso de su sistema. **Un manifiesto POR CURSO**: un papá con hijos en dos cursos tiene dos íconos y cada uno abre el suyo. **Sin service worker a propósito** — en iPhone no existe la instalación automática ni con él, así que hay que explicar el paso a paso igual. ⚠️ El banner tuvo que quedar **de una línea**: medido en 375×667, la versión de dos líneas dejaba el botón **JUGADOR cortado** (658 px de 667) con el aviso de la puerta encima, y eso ningún conteo lo delata. ✅ **PROBADO EN ANDROID (31/08) y quedó perfecto**: ícono, nombre y sin barra del navegador. ⚠️ Roberto llegó a la opción **por el menú ⋮**, o sea que **Chrome NO lo ofreció solo** — eso confirma que el prompt automático de Android depende del service worker, y valida haber puesto el paso a paso dentro del juego en vez de confiar en que el navegador lo ofrezca. ✅ **PROBADO EN iPHONE (01/09)** y ahí apareció el defecto que motiva A23 — ver abajo | — | — |
| **A23** | ⚠️ **En iPhone la instalación solo sirve desde Safari — CORREGIDO, FALTA PROBARLO.** Roberto instaló desde **Chrome** y el ícono quedó, pero al abrirlo **aparece la barra de direcciones**: es un acceso directo, no una app. Solo el *Agregar a pantalla de inicio* de Safari respeta el `apple-mobile-web-app-capable`, y **el fallo engaña porque el ícono se ve igual**. Peor: el paso a paso decía *«Compartir ⬆️ en la barra de abajo»*, que es la barra de **Safari**, así que tampoco calzaba con lo que él veía. **Y el caso mayoritario del piloto no es Chrome sino WhatsApp**, cuyo navegador incrustado tampoco puede instalar. **Hecho el 01/09:** `assets/js/instalar.js` gana el caso **`ios-otro`** —detectado por **lista blanca de Safari**, no enumerando rivales— que primero manda a *Abrir en Safari*. Verificado con **8 user agents reales** (Safari, Chrome, Firefox y Edge de iPhone, los navegadores de WhatsApp e Instagram, Android y escritorio): **8 de 8**, cero consola y cero 404 en los tres cursos, y el banner sigue de una línea. ⚠️ **Lo que NO se puede verificar aquí: el iPhone mismo.** Falta que Roberto abra el enlace **desde Chrome** y **desde el chat de WhatsApp** y confirme (1) que el aviso ahora lo manda a Safari y (2) que instalado **desde Safari** abre **sin** la barra de direcciones | — | Roberto (probar en iPhone) |
| ~~A24~~ | ~~**El armador no mostraba las mini-clases**~~ ✅ **HECHO (02/09, Sesión 82)**: lo vio Roberto usándolo. El armador dibuja `EXPEDICIONES` + `EXTRAS`, y las mini-clases no son ninguna de las dos (viven en `capitulosMate`), así que **un profesor con enlace de muestra nunca veía el sub-producto más vistoso de 8°**. Mismo defecto que el Reto de Cálculo en la Sesión 70 y misma causa. Entran como **dato en `EXTRAS`**: 8° pasa de 21 a **25 casillas**. ⚠️ **Y detrás había tres fugas**, todas porque ese camino nunca pasó por los modos prueba y revisión: el "← Volver a Matemáticas" abría **la campaña entera** desde un enlace acotado; las lecciones estaban encadenadas **sin mirar `CAPS_ABIERTOS`** (4 de 5 bloqueadas para el profesor); y **`?rev=1` no llegaba a la práctica**, que sirve `fb.n` sin pasar por `nPreguntas()` — 30 preguntas en una unidad. Verificado jugando en los tres cursos: cero consola, cero 404 | — | — |
| **A25** | ✅ **COMPLETA (02/09).** ✅ **Fases 1 a 4 hechas: el motor está en `assets/js/lecciones.js` y las 45 mini-clases están escritas y jugadas** (7°: 19 · 3°: 26 · 8°: las 17 de siempre = **62**). Los tres forks bajan a **8.301 líneas** (−4.157). El catálogo de dibujos pasó de 12 a **22**: 3 para 7° (`circulo`, `poligono`, `figura`) y **5 para 3°** (`dinero`, `cuadricula`, `reloj`, `pictograma`, `puntos`) — el plan preveía 2. La mini-clase estrena **🔊 en 3°**, que era la pantalla con más texto del juego y la única sin voz. ⚠️ **Dos bugs reales de motor encontrados jugando:** la práctica sacaba el banco del **nombre de la asignatura**, y como 3° escribe `'Matemática'` en singular caía al banco de **8°**, no encontraba ningún `MA03` y **marcaba la lección completa sin medir nada, sin ningún error** (quinto caso del patrón del fork; ahora sale de `CFG.ruta`); y el botón «← Salir» se comía la barra de progreso entera (**406 px contra 0**), defecto **vivo en producción en 8°**, ahora 96/205. ✅ **Fase 5 · las 13 introducciones de Ciencias, HECHAS (02/09)**: 4 en 8°, 5 en 7° y 4 en 3°, cableadas con `intro:'<id>'` en la expedición y dibujadas por `LECC.nodoIntro` **al principio del mapa del capítulo**. ⚠️ **Fuera del arreglo indexado de etapas**, porque el avance vive en `S.rutas[id].progreso` por posición y meterla como etapa 0 le habría roto la partida a quien ya jugaba — verificado sembrando un save y comprobando que sale idéntico. `LECC.init` pasa a recibir **una lista de rutas** (cada asignatura su archivo, fusionadas como los manifiestos de voz), y el catálogo suma 3 dibujos de modelo: **`celula`, `circuito` y `estados`** (25 widgets). ⚠️ **Un bug encontrado en la captura, el tercero de su familia**: `.btn-escuchar{display:block}` le ganaba al atributo `hidden`, así que **el 🔊 de la mini-clase se veía en 7° y 8°**, donde no hay voz — el DOM decía `hidden=true` y el píxel decía lo contrario. Verificado: 13/13 introducciones se recorren, 🔊 solo en 3°, cero consola y cero 404. ✅ **Y desde el 02/09 se pueden aprobar**: hasta entonces el tablero solo las contaba con un chip y la marca del informe no llegaba a ninguna parte, **siendo lo único del proyecto que enseña**. Ahora `dev/tablero.html` las muestra **enteras con su diagrama dibujado** y su casilla, "Exportar revisadas" las incluye y `aplicar-revisadas.py` escribe en `lecciones.json`. El tablero además **abre en "solo lo pendiente"** y manda al final las asignaturas sin nada que revisar. ✅ **Y las tres cosas que faltaban quedaron hechas el 02/09.** **Historia y Lenguaje**: los 36 capítulos se juzgaron uno por uno antes de escribir ([`docs/veredicto-historia-lenguaje.md`](docs/veredicto-historia-lenguaje.md), aprobado por Roberto) y salieron **24 de 36** — 1 mini-clase + 23 introducciones, con 2 widgets nuevos (`tiempo`, `oracion`, total **27**) y uno que **no** se escribió, porque `montarDiagrama` ahora cae al catálogo de `visuales.js` en vez de copiar 80 líneas. **El proyecto queda en 99 lecciones** (63 mini-clases + 36 introducciones), **99 de 99 aprobadas** por Roberto. Y la **voz de 3°**: **145 clips, US$0,27**, con el generador leyendo `lecciones.json` — comprobado contra la `textoLocutable` **real recortada del módulo** que las dos producen los mismos 145 textos (0 de diferencia), que los 145 resuelven a un clip que responde 200, y auditados con STT los 5 que el normalizador toca. **El estándar de qué lleva cada asignatura** quedó fijado en [`docs/estandar-miniclases.md`](docs/estandar-miniclases.md): el estándar de qué lleva cada asignatura quedó fijado en [`docs/estandar-miniclases.md`](docs/estandar-miniclases.md) — **Matemática mini-clase siempre** (✅ hecho, 62), **Ciencias e Historia mini-clase o introducción si amerita** (43 y 61 OA · 13 y 16 capítulos), **Lenguaje solo introducción y nunca mini-clase** (20 capítulos), porque sus OA son de producción o de hábito y su práctica **le agregaría al profesor un porcentaje engañoso** — una introducción no, porque no llama a `registrarOA`. ⚠️ El argumento con que la Sesión 82 dejó fuera a Historia y Lenguaje —*"solo Ciencias tiene 0% de dibujos"*— **no sobrevivió a volver a medirlo**: es igual de cierto de Historia de 7° y 8° y de todo Lenguaje. Y la granularidad se decide **antes** de escribir: por OA el techo son **104** y por capítulo **29**. Detalle del formato en [`docs/estandar-miniclases.md`](docs/estandar-miniclases.md). **Lo que sigue vigente:** ⚠️ **4°, 5° y 6° NO entran**: la práctica saca del banco (`fromBank`) y sus bancos no existen — dependencia dura con el Bloque B, sus 78 quedan planificadas. Plan de **18 tareas en 5 fases**: [`docs/superpowers/plans/2026-09-02-miniclases-e-introducciones.md`](docs/superpowers/plans/2026-09-02-miniclases-e-introducciones.md) | ~3-4 sesiones | código |
| **A26** | ✅ **HECHA (02/09).** 8° se mudó de `/juego/` a **`/8vo/`**: los seis cursos siguen ya la misma convención (`/3ro`, `/4to`, `/5to`, `/6to`, `/7mo`, `/8vo`) en vez de tener uno llamado "juego", que con seis niveles **no dice de qué nivel es**. El cambio de código fue **una línea** —la fila de `NIV.NIVELES` en `assets/js/niveles.js`—, que es M4 pagándose sola. ⚠️ **`juego/index.html` queda como REENVÍO y no se borra a la ligera**: GitHub Pages es estático, no hay 301 posible, y conserva `search`+`hash` porque sin eso un enlace de muestra llegaría al juego **completo y sin su acotamiento** —peor que un 404, porque no se nota—. Verificado con los 6 tipos de enlace. **Nadie pierde avance** (`localStorage` es por origen, no por ruta), pero **quien tenga la app instalada debe reinstalarla** (su `scope` es `/juego/`). De paso se borró `fork_de`/`_tabla` de `scripts/niveles.py`, que **devolvían `None` para los tres niveles** desde M4 y eran código muerto. Detalle en `CLAUDE.md` §Las rutas de los cursos | hecha | código |
| **A27** | ✅ **HECHA (02/09).** Tutorial en **`/tutorial/`**, una página con dos secciones —Para el apoderado / Para el alumno— y **16 capturas y 3 clips del juego de verdad**. Cubre las asignaturas, el recorrido por capítulos, que **enseña** antes de preguntar, la **corrección al fallar**, las **ayudas** (50/50 y la voz de 3°), el ranking, el informe del apoderado y el panel del profesor. Se genera con `scripts/capturar-tutorial.mjs` + `scripts/armar-clips.py`, **re-ejecutables a propósito**: una captura tomada a mano no se rehace nunca. ⚠️ **Tres capturas salieron MAL con el script diciendo "cero errores"** —`abrirAsignatura()` es solo para asignaturas sin campaña, y la opción incorrecta no se sabe del DOM antes de responder—, así que ahora **aborta** si no llega a la pantalla que espera. Barra pegada arriba de **una fila** (53 px; envuelta serían ~80, la lección del banner de instalación) con la sección actual marcada **por geometría** y no por "la primera que intersecta", que dejaba el resaltado corrido en uno | hecha | código |
| **A28** | ✅ **HECHA (02/09).** **📊 Cómo va**, el informe para el apoderado, que **no existía** y sin el cual el tutorial habría prometido algo inexistente. Se mira en el teléfono del niño: **cero backend, cero credencial nueva, cero dato que sale**. Muestra cuándo jugó, etapas/estrellas/preguntas/nivel, el avance por asignatura, los logros y **los temas que le costaron** — que salen gratis porque **cada etapa ES un objetivo** y una etapa de **1 estrella** es un tema que pasó raspando, nombrado con `META_OA`. ⚠️ **NO muestra** porcentaje por objetivo (se lee como nota, y las estrellas ya son ese porcentaje), ni el ranking, ni el semáforo (al niño se le prometió que es suyo). **Tres defectos callados encontrados construyéndolo:** `S.insignias` es un `Set` y con `.length` daba 0 para siempre; la fecha en `guardar()` marcaba "jugó hoy" con solo ABRIR la app; y el pie decía "no se envía a nadie", **falso desde el Bloque D**. La pantalla la inyecta `motor.js` (un curso nuevo la trae gratis); el botón va en cada fork a propósito | hecha | código |

**Las portadas de capítulo dejaron de estar prestadas (decisión del 01/09).** La nota anterior
decía que eran *"~46 imágenes para una diferencia que casi nadie mira"*, y **medida la pantalla
resultó ser otra cosa**: un niño de 3° abre Lenguaje y ve **nueve tarjetas idénticas**, así que es
un problema de **orientación**, no de decoración. El estándar quedó fijado en
[`docs/estandar-arte-portadas.md`](docs/estandar-arte-portadas.md): **cada capítulo con su
portada, un solo estilo para los seis cursos**, con la escena más simple en los chicos.

✅ **HECHO (01/09, Sesión 79): las 30 generadas, procesadas y cableadas.** Roberto generó las
imágenes; el asistente escribió los prompts (`docs/prompts-arte-portadas.md`), las procesó y cableó
`portadaMapa` en los 47 capítulos de 3° y 7° (27 nuevas a su archivo, 20 reutilizando arte de 8°, y
las 3 de 8° rehechas). Verificado en el navegador: las 12 campañas cargan sus portadas, cero 404,
cero consola; **3° y 7° ya no repiten imagen por capítulo**. `procesar-arte.py` ganó `--fondo=negro`
y `--negromax=`. Solo faltan las de 4°, 5° y 6° cuando existan esos cursos.

---

## Bloque O · Ordenar las bases — ✅ **COMPLETO (31/08/2026)**

Cuatro agentes midieron el motor, los scripts, la documentación y el contenido; cada hallazgo se
verificó a mano antes de entrar aquí. Detalle y método:
[`docs/superpowers/plans/2026-08-30-ordenar-las-bases.md`](docs/superpowers/plans/2026-08-30-ordenar-las-bases.md).

Iba **antes del Bloque B**, porque todo lo que se sume después se copia tres veces más.

> **Dos de las tres tareas resultaron ser distintas de como estaban planteadas, y eso vale más
> que haberlas hecho:** O7 daba por hecho que faltaba normalizar el repositorio, y el repositorio
> **ya estaba normalizado** —el desorden estaba en el disco—; y O8 preguntaba si cumplir la
> cabecera de la plantilla o cambiarla, cuando la respuesta era que **la plantilla describía algo
> que la herramienta real no producía y que ningún banco cumplía**. En los dos casos la tarea se
> replanteó midiendo primero, no ejecutando el enunciado.

| # | Qué | Peso | Quién |
|---|---|---|---|
| ~~O1~~ | ~~Retirar los scripts muertos~~ ✅ **HECHO (30/08)**: 10 retirados (los 8 procesadores de arte, `aplicar-fix-distractores`, `generar-pdf-preguntas`), rescatando antes su parte reutilizable en **`scripts/procesar-arte.py`**, que recibe los archivos por argumento y se probó reprocesando un villano real | — | — |
| ~~O2~~ | ~~Salir con error cuando se encuentran errores~~ ✅ **HECHO (30/08)**: `revisar-tanda.py` y `auditar-numerico.py` imprimían los defectos y **salían con 0**, así que un `&&` los ignoraba. Probado con un banco roto a propósito | — | — |
| ~~O3~~ | ~~El fallback silencioso de los scripts de voz~~ ✅ **HECHO (30/08)**: pedirles una asignatura desconocida **generaba o auditaba Matemática sin avisar**, y al auditor le faltaba `ada3` — o sea que auditar el libro habría auditado Matemática y pagado por ello. Ahora mueren con un mensaje | — | — |
| ~~O4~~ | ~~Assets huérfanos~~ ✅ **HECHO (30/08)**: 5 retirados (~900 KB), verificados con búsqueda exacta | — | — |
| ~~O5~~ | ~~Documentación con afirmaciones falsas~~ ✅ **HECHO (30/08)**: 22 hallazgos. Los 5 graves eran contradicciones en `comercial.md` y `aprobacion-pedagogica.md`; más el ranking "simulado", la tabla de banderas, el peso con cuatro cifras distintas y el armador con 2 niveles en vez de 3 | — | — |
| ~~O6~~ | ~~Generalizar lo cableado a 3°~~ ✅ **HECHO (31/08)**: la hora se decide **por forma** y no por códigos `MA03` (medido en los 16 bancos: la forma acierta en los 4 OA que la traen, y los 4 son horas de verdad); números en palabras hasta **999.999**; los cuatro scripts se llaman `-nivel` y leen el fork **de su nivel**; la tabla de asignaturas es una sola (`scripts/voz_asignaturas.py`) y **estaba desincronizada otra vez** —sin `voc3`, o sea que auditar el Vocabulario moría—. **Cero regresión en 11.085 textos y `faltan: 0` en las seis asignaturas**: ningún clip pagado se toca | — | — |
| ~~O7~~ | ~~`.gitattributes`~~ ✅ **HECHO (31/08)**, y **la premisa era falsa**: el índice ya estaba **100% en LF** (376 archivos, ninguno con CRLF guardado) y lo que GitHub Pages sirve siempre fue LF. El desorden estaba **en el disco**: 187 CRLF contra 188 LF, más `.gitignore` mezclado — y el disco es lo que leen los scripts. Pasar los 188 a LF **no cambió ni un byte de contenido**: el `git diff` siguió mostrando exactamente los 11 archivos editados a mano | — | — |
| ~~O8~~ | ~~El contrato del contenido~~ ✅ **HECHO (31/08)**: el estándar es **el que ya producía `consolidar-pool-nivel.py`** (indent=1, sin salto final, LF), no uno nuevo; la cabecera se reduce a lo que alguien lee; el `_pool/` de `matematicas-3basico` se aplanó (estaba en `verificado/u1-oa01.json` y **quedaba en cero ante el comando estándar**); la convención de `id` quedó fijada en `docs/encargo-banco.md`; y `auditar-banco-nivel.py` **comprueba el formato**, probado rompiendo un banco a propósito. Contrato completo en `contenido/_plantilla/README.md` | — | — |
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
| B1 | **5° básico** — ✅ **COMPLETO (04/09)**: las cuatro asignaturas, **2.790 preguntas**, 27 mini-clases y 4 introducciones, jugables y auditadas. Falta su **aprobación** (abajo) y su **arte propio** | **93** ✅ | **2.790** ✅ | — | — |
| B2 | **6° básico** — ✅ **BANCO COMPLETO (05/09): las 4 asignaturas, 99/99 OA, 2.970 preguntas**, 0 errores en las cuatro, 0 opciones equivalentes, todos los pares de solape revisados uno por uno (la mayoría variedad legítima de plantilla; 3 duplicados reales corregidos y arreglados: ángulos en Matemática, "igualdad ante la ley" entre `HI06 OA16`/`OA17`). Matemática 24/24 (720) · Ciencias 18/18 (540) · Historia 26/26 (780) · Lenguaje 31/31 (930). `docs/cuidados-ciencias.md` y `docs/cuidados-historia.md` sumaron secciones con lo que dejaron las tandas de validación (evaporación≠ebullición; "investigar/demostrar"+120 caracteres es genuinamente difícil; `HI06 OA 13` "su región/localidad" resuelto dando la región DENTRO del enunciado, porque el banco no puede saber dónde vive cada alumno; `HI06 OA 08` —quiebre y recuperación de la democracia, el OA más delicado del currículum— midiendo solo hechos verificables, sin tomar partido; `LE06 OA 01` —leer de forma fluida, mide pronunciación/decodificación que ningún quiz puede evaluar— acotado al único ángulo medible, la prosodia de los signos de puntuación). Falta **cablear las cuatro campañas en un fork `6to/index.html` nuevo** (villanos con arte prestado, como se hizo con 5°) y su **aprobación pedagógica** | **99** ✅ | **2.970** ✅ | ~1 sesión (cablear el fork) | — |
| B3 | **4° básico** + voz + dibujos + auditoría de audibilidad | **92** (MA 27 · LE 30 · CN 17 · HI 18) | ~2.760 (−30 del OA excluido) | 2–3 sesiones | ~US$8 de Azure |

**284 OA y ~8.490 preguntas**, algo más que la estimación anterior (~7.350). El paso 0 del molde
de 7° —transcribir el currículum— **está hecho para los tres**; se entra directo al fork y al
banco.

> **Avance real al 05/09: 5.760 de ~8.490** (2.790 de 5° + 2.970 de 6°, banco COMPLETO). 5° y 6°
> básico quedan con **el banco de sus 4 asignaturas terminado y auditado** (192 OA, 5.760
> preguntas). Solo falta **4°** (92 OA, ~2.760 preguntas, con voz y dibujos) para que el Bloque B
> quede cerrado del todo.
>
> ### 📍 Punto de control — 05/09/2026
>
> **Hecho, en disco, sin commitear** (sigue esperando la orden 66):
> - **5° básico:** 4 asignaturas completas, 2.790 preguntas, jugable y cableado en `5to/index.html`.
> - **6° básico:** 4 asignaturas completas, **2.970 preguntas** (`contenido/matematicas-6basico/`,
>   `ciencias-6basico/`, `historia-6basico/`, `lenguaje-6basico/`, cada una con su `preguntas.json`
>   consolidado y su `_pool/` de respaldo), 0 errores en las cuatro auditorías estándar
>   (`revisar-tanda`, `auditar-numerico`, `auditar-solape-oa`, `validar-oa-json`).
> - `dev/tablero.html` regenerado, refleja el estado real de todo lo anterior.
> - Documentación de proceso actualizada: `docs/cuidados-ciencias.md`, `docs/cuidados-historia.md`
>   (secciones nuevas con lo aprendido en las tandas de validación de 6°).
>
> **Falta, en orden:**
> 1. **Fork `6to/index.html`** — no existe todavía. Clonar el patrón de `5to/index.html`: las 4
>    campañas, `META_OA` (99 entradas), `ORDEN_ASIG`/`DIF_ASIGS`, villanos con arte prestado
>    (declarado en comentarios), reparto en capítulos por asignatura.
> 2. **Aprobación pedagógica de 5° y 6°** (Roberto, en el tablero) — son las únicas 5.760
>    preguntas del proyecto sin firmar.
> 3. **4° básico** (Bloque B3): currículum ya transcrito (92 OA), falta todo el banco
>    (~2.760 preguntas) + voz (~US$8 de Azure) + dibujos + auditoría de audibilidad.
> 4. **Arte propio** de 5° y 6° (villanos + portadas) — hoy prestado y declarado, como en 3°/7°.
>
> `pendiente.md` es la fuente de verdad de qué falta; no hay ningún resumen paralelo que
> mantener sincronizado.
>
> ⚠️ **Pero 5° NO se habilita hasta que su banco esté aprobado** (decisión de Roberto,
> 03/09): un curso a medias no se enlaza ni se anuncia. La landing sigue diciendo
> «3 cursos completos», y sus **2.790 preguntas son las únicas del proyecto sin firmar**
> (7.805 de 10.595 aprobadas).

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

El orden lo fijó la medición, de menor a mayor riesgo. **Los cuatro están hechos: el motor del juego ya no está copiado tres veces.**

> **Cierre del 31/08, medido de nuevo:** los tres forks pasaron de **12.458 a 8.301 líneas** y `assets/js/` de 1.149 a **2.603**. Neto: **~2.700 líneas menos** en el repositorio, y —lo que importa de verdad— **una corrección de motor se escribe una vez y no tres**. Con 4°, 5° y 6° por delante habrían sido seis.

| # | Módulo a extraer a `assets/js/` | Líneas | Por qué en esa posición |
|---|---|---|---|
| ~~M1~~ | ~~`visuales.js`~~ ✅ **HECHO (31/08)** — 308 líneas, los 11 dibujos, **lo cargan los tres cursos**. Se lleva también **su CSS**, que si no un nivel nuevo generaría bien el SVG y no se vería. Los dos scripts que leían `renderVisual` **del index.html del fork** ahora leen el módulo, y con eso dejan de depender de que el fork exista: **5° va a poder aprobar su banco con dibujos antes de tener su juego** | 308 | — |
| ~~M2~~ | ~~`voz.js`~~ ✅ **HECHO (31/08)** — 170 líneas. **Nace dormido**: solo habla tras `VOZ.init([carpetas])`, y esa llamada va en el curso pegada a su `VOZ_DIRS`. Así 8° y 7° lo cargan y quedan mudos **sin una bandera más** (el patrón de `CALC.activo`). Se lleva sus dos reglas de CSS | 170 | — |
| ~~M4~~ | ~~`niveles.js`~~ ✅ **HECHO (31/08)** — dar de alta un curso pasa de **~24 puntos de edición en 3 archivos a 2**: una fila en `NIV.NIVELES` y una en `kimun_asignaturas_todas()`. Se comparó **contra una captura del comportamiento anterior**, no contra la memoria: mismos códigos, mismos nombres, mismas carpetas, mismo `asigDe`. ✅ **Esquema aplicado y verificado el 31/08**: los 12 códigos resuelven y `kimun_asignaturas_todas()` los devuelve en el orden del panel | — | — |
| ~~M3~~ | ~~`motor.js`~~ ✅ **HECHO (31/08)** — **1.454 líneas**, en seis rebanadas de menor a mayor riesgo (jefes → duelo → puerta/armador → campaña/mapa/tienda → persistencia → quiz). Las **139 funciones duplicadas quedaron en 0**: 7° y 3° conservan UNA función propia cada uno y 8° las 47 de su bloque de lecciones y Reto. ⚠️ Es el único módulo **sin respaldo posible** —si no carga, no hay juego—, así que lleva **canaria** y **se publica en un push anterior** al que lo referencia | 1.416 ×3 | Se hizo AHORA porque nadie está usando la plataforma todavía: es la única ventana para tocar el guardado y el quiz sin arriesgar la partida de un niño, y se cierra sola en cuanto parta el piloto |

### ✅ Preparación — HECHA (31/08). De **71** funciones idénticas a **139 de 139 (100 %)**

La primera pasada dejó 134 de 140. La segunda, ya con M3 encima, cerró las **cuatro que faltaban** convirtiéndolas en datos:

1. ⚠️ **`renderExpediciones` había vuelto a divergir**, con un `if(asig==='Matemáticas')` para el camino de mini-clases. Es el **quinto caso** del patrón que este proyecto documentó cuatro veces (Sesiones 63, 64, 69 y 72), y la Sesión 64 la daba por unificada. La bandera `HAY_MINICLASES` ya existía: solo faltaba usarla aquí. El bloque queda **guardado** en los tres —doctrina de la Sesión 65— y tras M3 existe **una sola vez**.
2. **`esMaestro` y `revisarDificil`** se unificaron con **`MAESTRIA_CALC`**: 8° cuenta 3 asignaturas en Difícil + El Autómata y 7° cuenta las 4, que son **el mismo número —cuatro hitos— contado distinto**. Equivalencia comprobada con la **tabla de verdad completa** (8 casos) contra la definición vieja, no por razonamiento.
3. **`portadaMapa`**: 8° la armaba por convención **implícita** (`assets/portada-<id>.png`), que es justo lo que este proyecto documenta como causa de 404 tapados por el `onerror`. Medido: de sus 20 expediciones, **6 pedían un archivo que no existe** —las cuatro `mate-exp-*` y Ana Frank—, salvadas solo por que ninguna pantalla llamaba ahí con ellas. ⚠️ Unificar sin más le habría **quitado a 8° el arte propio de sus 14 capítulos** (su campo `portada` es la genérica de la asignatura), así que se le dio `portadaMapa:` explícito a las 15 que sí tienen arte. Verificado: **15 idénticas y 5 que pasan de un archivo inexistente a uno que existe**.


Antes de mover una sola línea de código:

- **`visual:q.visual`** propagado en los constructores de 8° y 7°. Es **inerte** ahí —`renderVisual`
  solo existe en 3° y solo 3° lo llama— pero deja los cinco constructores compartidos idénticos.
- **Respaldo de `callarVoz`**, la *misma* línea en los tres: en 3° no hace nada (su `function` se
  iza antes) y en 8° y 7° permite que `go`, `pintaPregunta`, `responder` y `mostrarMetaEtapa`
  llamen a `callarVoz()` y queden idénticas. Es además el respaldo que hará que un 404 de
  `voz.js` (M2) no mate el juego.
- **`SUFIJO=''` en 8°**, que era «la causa única de tres divergencias». ⚠️ `'kimun_save'+''` es
  **exactamente** `'kimun_save'`: comprobado sembrando una partida con la clave literal y viendo
  que el juego la recupera con sus 777 XP y 4.242 monedas. Ningún alumno pierde nada.

**Y aparecieron dos defectos vivos en los que 3° era el correcto**, portados a 8° y 7°:

1. **`reconciliarProgreso` no existía fuera de 3°.** Repara una partida guardada cuyo capítulo
   cambió de número de etapas; sin ella el arreglo de progreso queda del largo viejo y el mapa se
   dibuja con nodos que no existen o le faltan. No lo había pisado nadie porque ninguna expedición
   de 8° ha cambiado de etapas — el día que pase, el síntoma sería una partida rota.
2. **El nodo del JEFE mostraba meta de aprendizaje.** `metaDisponible` no lo excluía en 8° ni 7°, y
   como `META_OA['BOSS']` no existe, `metaDeEtapa` caía al nombre de la etapa: el quiz del jefe
   anunciaba **«🎯 ⚡ JEFE FINAL»** como si fuera un objetivo.

**Las 6 que seguían difiriendo eran exactamente las que M1, M2 y M4 tenían que absorber.** Tras M1
y M2 quedan **136 de 140 (97 %)**, y las 4 restantes son `portadaMapa` y `renderExpediciones`
—que se lleva **M4**— más `esMaestro` y `revisarDificil`, que son **banderas y difieren a
propósito** (la Maestría de 7° exige sus cuatro asignaturas; la de 8° deja Matemáticas fuera
porque su dificultad es el Reto de Cálculo).

**Los tres módulos compartidos se probaron con el archivo AUSENTE**, que es la regla que este
proyecto pagó con `revision.js`: con `visuales.js`, `voz.js` o `niveles.js` en 404, los tres
cursos juegan un quiz completo, el 🔊 no revienta, el panel del profesor sigue abriendo y la
consola queda limpia. Un `<script src>` que no carga mata todo el JavaScript, y el síntoma
engaña: la pantalla se ve bien y ningún botón responde.

**Dos cosas que el spec de M4 daba por resueltas y no lo estaban:**

1. **`ASIG_DESAFIO_NOMBRE` no es una etiqueta: es la LLAVE con que `contenidoDeAsignatura`
   busca el banco.** El spec proponía derivar el nombre del código, y eso habría dejado a un
   curso sin banco en su desafío de refuerzo **sin ningún error** — porque los cursos no lo
   escriben igual: 8° y 7° dicen *"Matemáticas"* y 3° dice *"Matemática"*. Se deriva de las
   **propias expediciones del curso**, que además no puede desincronizarse; verificado en los
   12 casos reales antes de escribirlo.
2. **`kimun_oa_asignatura` conserva el `null` para códigos desconocidos.** Puramente estructural
   habría devuelto `MA99` para `MA99 OA 01`; el efecto visible era el mismo, pero preservar el
   comportamiento exacto costaba una línea. Contrastado contra la **función viva en producción**:
   0 diferencias en los 10 casos.

> ⚠️ **Este cambio es seguro de desplegar en cualquier orden.** No hay ningún `drop function`
> —las dos son `create or replace` y la tercera es nueva—, y mientras el esquema no se re-aplique
> la función vieja devuelve exactamente los mismos 12 códigos. No aplica la regla de la Sesión 73.

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

> **Lo que YA está hecho y NO es parte de este bloque (31/08):** los tres cursos tienen
> `manifest.webmanifest` propio, ícono de app y el módulo `assets/js/instalar.js`, que le explica
> al apoderado cómo agregarlo a la pantalla del teléfono. **Sin service worker**, porque en
> iPhone no existe la instalación automática ni con él. Lo que este bloque agrega encima es el
> prompt automático de Android y el **offline parcial** — que es lo único que de verdad falta:
> **instalarlo NO lo hace funcionar sin conexión**. Spec:
> `docs/superpowers/specs/2026-08-31-instalacion-pantalla-inicio-design.md`.

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
   **252 MB son la voz de 3°**: cachearlo todo en el `install` le bajaría ~250 MB al teléfono de
   un niño la primera vez que abre. La voz se cachea **clip a clip al reproducir**.
3. **El `<base href="/">`** de los tres juegos obliga a que el alcance del SW sea `/`, no
   `/8vo/`.

---

## Bloque D · Progreso en el servidor

**Es el requisito real del modelo de suscripción, y no depende de la PWA.**

Hoy el XP y el dominio por OA están en Supabase, pero **las monedas, las skins y el avance de
campaña viven solo en `localStorage`**. Mientras siga así, prometerle a un apoderado que su hijo
cambia de teléfono y recupera todo **sería falso**.

| # | Tarea |
|---|---|
| ~~D1~~ | ~~Decidir qué se sube y con qué frecuencia~~ ✅ **HECHO (01/09)**: una **foto completa del save** (9,4 KB el máximo medido) enganchada a `guardar()` con rebote de 15 s, que **no sube si nada cambió**. ⚠️ Y **no sube en `EFIMERO`**: el XP solo sube, pero la foto **reemplaza**, así que `?qa=1` en el teléfono de un alumno real le pisaría la partida del año. **La cola de reintentos que esta tarea daba por necesaria NO hace falta**: una foto es idempotente, así que el próximo envío que llegue lleva todo — `dominio` la necesita porque manda *eventos* |
| ~~D2~~ | ~~Tabla y funciones en Supabase~~ ✅ **HECHO (01/09)**: `progreso` (RLS sin políticas, `on delete cascade`) + `kimun_progreso_subir(jsonb)` y `kimun_progreso_bajar()`, con tope de 64 KB. ⚠️ **Roberto tiene que aplicar `supabase/schema.sql`**; hasta entonces el cliente da 404 en `kimun_progreso_subir` y el avance no viaja |
| ~~D3~~ | ~~Resolución de conflictos~~ ✅ **HECHO (01/09)**: se decidió **restaurar, no sincronizar** (un aparato a la vez). Tres caminos al canjear: servidor vacío → sube; teléfono recién empezado → baja en silencio; **los dos con avance → pregunta una vez** (`scr-progreso`), con los dos botones pesando igual y **el lado que pierde guardado** en `<SAVE_KEY>_previo`. ⚠️ Lo delicado no era el conflicto sino el **cruce con el XP**: al bajar, el XP lo manda el servidor, o una foto vieja deshace sola la corrección del profesor |
| ~~D4~~ | ~~Migración cortés del avance que ya vive en los teléfonos~~ ✅ **SE CIERRA SIN CÓDIGO (01/09)**: con una foto no hay migración — el primer `guardar()` después de la actualización sube lo que el niño ya tenía |

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
- ✅ **La SpA está constituida**, con **inicio de actividades ante el SII desde el 01/09/2026**
  (primera categoría, afecta a IVA). Era el trámite que bloqueaba cobrar. ⚠️ Sus datos NO van
  en este repositorio, que es público: están en `Escritorio\VULPO - correos profesores\`.
  **Queda la parte operativa:** habilitar la facturación electrónica y abrir la cuenta
  corriente de la empresa — sin eso se factura en el papel y no en la práctica.
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
4. **Escribir con `newline=""`**, o sea conservar los finales de línea del archivo. Desde el
   31/08 son **LF en todo el proyecto** (`.gitattributes`). La regla decía "preservar CRLF" y
   su motivo estaba mal contado: lo que rompe la comparación entre forks es que queden
   **distintos entre sí**, no que sean CRLF.
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
- ~~❌ Portadas propias de capítulo para todos los cursos~~ — **revertido el 01/09**: sí van, y
  el estándar está en `docs/estandar-arte-portadas.md`. El número real es bastante menor que
  las ~110 que decía esta línea, porque 20 se reutilizan entre cursos.
