# Contenido sensible en el armador (A7) — diseño

> **Fecha:** 2026-08-28 · **Estado:** aprobado, sin implementar.
> **Origen:** `pendiente.md` A7. El inventario y el código de color ya existen en
> `docs/contenido-sensible.md` (20 OA sensibles de 3°, 7° y 8°, cinco categorías). Esta spec
> define **cómo se muestra** eso en el armador de enlaces de muestra (`?armar=1`).

## El problema

Un colegio confesional (el piloto es salesiano) puede querer **revisar antes de activar** cierto
contenido: sexualidad (`CN07 OA 01/02/03`), violencia y conquista, religiones vivas, etc. Hoy el
armador (`?armar=1`) lista los capítulos con una casilla cada uno, pero **no dice cuáles tocan
temas sensibles**, así que quien arma un enlace de muestra no tiene cómo decidir informado qué
incluye ni qué le está mandando al colegio.

## Decisiones de diseño (tomadas en el brainstorming)

1. **La decisión se toma al CONSTRUIR el enlace, no al abrirlo.** La casilla por capítulo que el
   armador ya tiene **es** el control: lo que no se marca, no viaja en el enlace, y quien lo
   recibe abre exactamente lo aprobado. **El enlace de muestra/venta (`?solo=`, `?m=`, modo
   prueba) NO cambia:** cero código nuevo de ese lado. VULPO es estático; un opt-in en tiempo de
   apertura sería blando (reversible por cualquiera) y no aportaría sobre construir bien el enlace.
2. **El armador solo MUESTRA lo sensible, no filtra por categoría.** Como la única categoría
   verdaderamente delicada (sexualidad) vive solo en `CN07`, y sus tres OA están en su capítulo de
   Ciencias de 7°, la casilla del capítulo ya la aísla. Un filtro "ocultar sexualidad" sería
   código de más para un problema que una casilla resuelve.
3. **El mapa OA→categoría vive en un archivo compartido**, no repetido en las tres apps.

## Arquitectura

### El dato — `assets/js/sensible.js` (nuevo, compartido por las tres apps)

Módulo de solo datos + lógica, **sin UI propia** (a diferencia de `revision.js`, que inyecta
pantalla y CSS). Expone `window.SENSIBLE`:

- **`SENSIBLE.cats`** — las cinco categorías, en **orden canónico**, cada una
  `{icono, color, nombre}`:

  | clave | icono | color | nombre |
  |---|---|---|---|
  | `sex` | ❤️ | `#ff4d6d` | Sexualidad |
  | `violencia` | ⚔️ | `#4a4a5e` | Violencia y muerte |
  | `religion` | 🛐 | `#ffc93c` | Religión y creencias |
  | `pueblos` | 🪶 | `#b5793a` | Pueblos originarios |
  | `sustancias` | 🚭 | `#4dd8ff` | Sustancias |

- **`SENSIBLE.oa`** — el mapa de los 20 OA sensibles → arreglo de claves de categoría, copiado de
  `docs/contenido-sensible.md`. Cubre los tres niveles; cada armador solo consultará los OA que
  aparecen en sus propios capítulos, así que tener todos los niveles en un archivo es inofensivo.

  ```
  // 3°
  "HI03 OA 05": ["violencia"],
  // 7°
  "CN07 OA 01": ["sex"], "CN07 OA 02": ["sex"], "CN07 OA 03": ["sex"],
  "HI07 OA 01": ["religion"], "HI07 OA 07": ["violencia"], "HI07 OA 11": ["religion"],
  "HI07 OA 14": ["violencia","pueblos"], "HI07 OA 15": ["pueblos","religion"],
  "HI07 OA 19": ["religion"], "HI07 OA 20": ["pueblos"],
  // 8°
  "HI08 OA 02": ["religion"], "HI08 OA 05": ["violencia","pueblos"],
  "HI08 OA 06": ["violencia"], "HI08 OA 07": ["violencia","pueblos"],
  "HI08 OA 10": ["violencia"], "HI08 OA 11": ["violencia","pueblos"],
  "HI08 OA 12": ["violencia","pueblos"], "HI08 OA 13": ["violencia"],
  "HI08 OA 17": ["pueblos"], "CN08 OA 07": ["sustancias"]
  ```

- **`SENSIBLE.deExpedicion(exp)`** — dado un capítulo de `EXPEDICIONES`, devuelve las **claves de
  categoría presentes** en él: recorre `exp.etapas`, junta `SENSIBLE.oa[etapa.oa]` de cada una,
  deduplica y ordena por el orden canónico de `cats`. Ignora la etapa `BOSS` (su `oa` es `"BOSS"`;
  sus `oas` ya están cubiertos por las etapas del propio capítulo). La lógica vive **una vez**
  aquí; los tres armadores solo la llaman.

Se incluye con `<script src="assets/js/sensible.js"></script>` en el `<head>` de las tres apps,
junto a `revision.js`. **Respaldo vacío** en cada `index.html`, antes de usarlo:

```js
if(!window.SENSIBLE) window.SENSIBLE={cats:{},oa:{},deExpedicion:function(){return [];}};
```

Sin esto, un 404 de `sensible.js` (despliegue, red, bloqueador) mataría el JavaScript del armador.
Con el respaldo, degrada a "sin marcas": el armador se ve como hoy. Como **solo el armador lo lee**,
y solo con `?armar=1`, la degradación es invisible en el juego normal.

> **`sensible.js` es el espejo-máquina de `docs/contenido-sensible.md`.** El doc sigue siendo la
> explicación humana (con severidad ALTA/MEDIA/BAJA, que la UI no usa). Al agregar un OA sensible
> hay que tocar los dos; el doc lo recuerda en su encabezado.

### La UI — cambios en `arrancarArmador` (idénticos en las tres apps)

`arrancarArmador` (en `juego/index.html`, `3ro/index.html`, `7mo/index.html`) recibe tres bloques
nuevos. El cambio es **el mismo texto** en las tres, para que el fork no diverja.

1. **Cálculo previo:** las categorías que aparecen en los capítulos activos de ese nivel (unión de
   `SENSIBLE.deExpedicion(exp)` sobre las expediciones activas). Si el conjunto es vacío, no se
   dibuja ninguna leyenda ni marca: el armador queda **byte-idéntico a hoy** (regresión nula).

2. **Leyenda** al comienzo de `#armarLista`: "Contenido sensible:" seguido de **solo las
   categorías presentes en ese nivel**, cada una como su emoji + nombre con su color. El armador
   de 3° mostrará solo ⚔️ Violencia (su único OA sensible); el de 7° mostrará las cinco.

3. **Marca por capítulo:** en el `<label>` de cada capítulo con categorías sensibles, después del
   nombre, se agregan los **emojis** de sus categorías, con un `title` (tooltip de escritorio) que
   nombra la categoría y los OA afectados. Se eligen **emojis y no puntitos de color puros**
   porque en móvil no hay hover y el emoji se lee solo; el color va en la leyenda y como fondo
   tenue del emoji, así el código de color sigue presente. Es seguro para daltónicos.

4. **Resumen:** la línea `#armarResumen` (hoy "N capítulos · vence… · con respuestas") agrega,
   cuando los capítulos **marcados** incluyen algo sensible, "· incluye: ❤️ Sexualidad,
   ⚔️ Violencia". Se recalcula en `armarUrl()` a partir de los capítulos marcados. Sirve
   directamente a A4: al armar el enlace de `CN07` para el colegio, el resumen dice qué contiene.

### Estilos

CSS mínimo nuevo, junto al bloque de chips del armador: una clase para el emoji-marca (fondo tenue
con el color de la categoría, `title` heredado) y una para la fila de leyenda. Sin librerías.

## Qué NO se toca

- El enlace de muestra/venta (`?solo=`, `?m=`, `?m=` con caducidad, modo prueba, modo revisión).
- El juego normal, el panel del profesor, el backend, los bancos, la voz.
- La severidad ALTA/MEDIA/BAJA: es criterio para la conversación con el colegio (A4), no UI del
  armador. Queda solo en `docs/contenido-sensible.md`.

## Verificación (con `scripts/cdp.mjs`, las tres apps)

1. `?armar=1` en 7°: la leyenda muestra las cinco categorías; el capítulo de Ciencias de sexualidad
   lleva ❤️; un capítulo de Historia con conquista lleva ⚔️ 🪶; marcar ese capítulo hace que el
   resumen diga "· incluye: …".
2. `?armar=1` en 3°: la leyenda muestra solo ⚔️ (su único OA sensible, `HI03 OA 05`); los demás
   capítulos sin marca.
3. `?armar=1` en 8°: ⚔️/🪶 en los capítulos de conquista y colonial, 🚭 en el de vida saludable.
4. **Respaldo:** renombrando `sensible.js` a una ruta inexistente, el armador abre **sin marcas ni
   leyenda, sin crashear y sin 404** que rompa el resto.
5. **Regresión:** una etapa jugada en 8° hasta el resultado, sin cambios.
6. Cierre obligatorio: **cero errores de consola y cero 404** en las tres apps.

## Riesgos y límites

- **Es transparencia, no un candado.** Igual que el resto del modo muestra: si un capítulo entra
  en el enlace, entra completo (con sus etapas sensibles). El control es no marcarlo.
- **Granularidad de capítulo, no de OA.** Un capítulo mixto (OA sensibles + no sensibles) es todo o
  nada. Hoy no es problema porque la sexualidad de 7° está aislada en su capítulo; si en el futuro
  un capítulo mezclara sexualidad con contenido neutro, habría que partir el capítulo o filtrar por
  etapa (fuera de alcance).
- **Doble fuente `sensible.js` + doc:** al cambiar una categoría hay que tocar los dos. Es el costo
  aceptado de que el código lea un dato que el humano lee en prosa.
