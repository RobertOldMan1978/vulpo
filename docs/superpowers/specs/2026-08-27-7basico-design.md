# 7° básico — diseño

> Estado: **borrador de arquitectura**. El contenido curricular se completa cuando
> vuelvan los investigadores del MINEDUC.

## Qué se pide

Un año escolar completo de **7° básico**, "con las mismas bases de 8°", auditado y
operativo. **Sin lectura por voz** (decisión de Roberto): a los 12-13 años ya se lee
de corrido, y la voz es lo caro y lo lento de 3°.

## La decisión de arquitectura

7° es un **fork de `juego/index.html` (8°)**, servido en `vulpo.cl/7mo/`, igual que 3°
vive en `/3ro/`. No se toca 8°.

**Por qué fork y no un motor multi-nivel:** ya hay dos precedentes (8° y 3°) y el
proyecto entero está construido sobre esa decisión. Unificarlos es un refactor mayor
del producto en producción, justo en la semana en que la puerta empieza a cobrar. El
costo del fork está medido y documentado: hay que re-aplicar las correcciones de motor
en cada copia.

## Lo que 7° hereda y lo que NO

**Hereda de 8°:** campañas por asignatura con capítulos en orden, jefe de capítulo
(5.º nodo), Jefe Final multi-fase con recompensas, Modo Difícil, quiz con reloj de
20 s (15 s en Difícil), comodín 50/50, meta de aprendizaje por OA, repaso al fallar,
semáforo de autoevaluación, tienda, logros, ranking, duelo, modo prueba/`?armar=1`/
`?rev=1`.

**NO hereda (y hay que desconectarlo activamente, es la trampa del fork):**
- **Vocabulario** y la **biblioteca de Lectura** (Ana Frank): son contenido de 8°.
  En 3° este mismo cableado dejó una asignatura **inalcanzable** (Sesión 61).
- El **Reto de Cálculo** y el **camino de lecciones de Matemática**.

## Matemática de 7°: campaña, no camino de lecciones

**Decisión tomada y declarada.** En 8°, Matemática tiene mini-clases con diagramas SVG
interactivos + expediciones + Reto de Cálculo: es un sub-producto que costó varias
sesiones (17 lecciones, 13 widgets). Reproducirlo en 7° multiplicaría el trabajo por
varias sesiones más y **no es lo que hace falta para tener el año operativo**.

Matemática de 7° se arma como **campaña normal** —capítulos = unidades oficiales, con
su Jefe Final—, exactamente como Historia, Ciencias y Lenguaje. Queda anotado que
agregarle lecciones después es aditivo: el motor de lecciones ya existe en el fork y
solo pide datos.

## Aislamiento (las tres cosas que en 3° costaron una sesión entera)

1. **`localStorage` con sufijo `_7mo`** (`kimun_save_7mo`, `kimun_dom_pend_7mo`,
   `kimun_rank_7mo`, `kimun_intro_7mo`). Sin esto, un alumno con 7° y 8° abiertos
   comparte monedas, skins y avance: se sirven del mismo origen.
   Los **ajustes de audio se comparten a propósito**.
2. **Identidad de Supabase con `storageKey:'kimun-7mo'`**. Sin esto, 7° y 8° son el
   **mismo usuario anónimo**: el mismo perfil, el mismo XP en el ranking y el mismo
   vínculo con un código `ALU-`.
3. **Portadas EXPLÍCITAS.** 8° usa la convención implícita `assets/portada-<id>.png`;
   como 7° no tendrá arte propio al principio, esa convención pide archivos que no
   existen y produce 404 que el `onerror` tapa a la vista pero no en la red.

## El nivel viaja en el código de OA

Nada de columna `nivel` ni entidad "Colegio": los códigos son **`HI07`, `MA07`,
`CN07`, `LE07`**, y el aislamiento por asignatura que existe desde la Sesión 37 separa
solo un curso de 7° de uno de 8°. Hay que tocar las mismas listas de siempre:

- `supabase/schema.sql`: `kimun_oa_asignatura` y **las dos** listas de
  `kimun_prof_asignaturas`. ⚠️ Si falta un código ahí, ese contenido queda **invisible
  para el Profesor Jefe sin ningún error**.
- `profesor.html`: `OA_CARPETA`, `ASIG_NOMBRE`, `ASIG_ORDEN`, el espejo `SB_asigDe`
  y `NIVELES_MUESTRA` (el selector del armador de enlaces).
- `7mo/index.html`: `ASIG_DESAFIO_NOMBRE`.

## Contenido

Banco de **año completo por asignatura**: todos los OA oficiales, **30 preguntas por
OA**, escritas por agentes contra el estándar de `docs/encargo-banco-3basico.md`
adaptado a 12-13 años, y consolidadas con barajado de opciones.

Nacen `revisada:false`. La aprobación pedagógica es de Roberto, por el flujo de
siempre (tablero → exportar → `aplicar-revisadas.py`).

**OA que no admiten pregunta honesta se dejan FUERA del banco**, documentándolo en su
`oa.json`, en vez de inventar un ítem que finja medirlos. En Lengua y Literatura esto
va a afectar a varios OA de producción y hábito.

## La puerta

7° nace **abierto** (`FECHA_PUERTA=''`), como nació 3°: es trabajo en curso y no está
enlazado desde el sitio. `DEMO_LIBRE` se fija al primer capítulo de Historia.

## Qué NO entra en este trabajo

- Arte propio (portadas de capítulo, villanos, skins): 7° empieza con arte prestado de
  8°, **declarado en comentarios**, igual que 3°.
- Voz pregrabada.
- Enlazar 7° desde la landing.
