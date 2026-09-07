# El estándar de las introducciones de Historia

> **Regla de Roberto, 07/09/2026, y vale para los SEIS cursos:** *"en las de Historia me
> gustaría siempre una introducción diciendo en qué siglo estamos, entre qué años pasa lo que
> vamos a hablar y en qué lugar del planeta estamos ubicados; eso es lo mínimo, el resto lo
> complementas."*

**Todos los capítulos de Historia llevan introducción.** Son **33** en los seis cursos, y no hay
excepción: a diferencia de Ciencias —donde la introducción se escribe *si amerita*, según
[`docs/estandar-miniclases.md`](estandar-miniclases.md)— aquí la ubicación en el tiempo y en el
espacio es el andamiaje que el capítulo necesita para leerse.

El motivo es concreto: sin sistema de referencia, *"la Colonia"* y *"la Independencia"* son dos
nombres sueltos que un niño memoriza sin poder ordenar. El dato no es lo que falta — lo que falta
es **dónde va ese dato**.

---

## El marco va como WIDGET, no redactado

Primer bloque de toda introducción de Historia:

```json
{"t":"diagrama","kind":"marco","params":{
  "siglo":"Siglos XV y XVI",
  "epoca":"1492 – 1600",
  "lugar":"América y Europa: del Caribe a Sevilla"
}}
```

> ⚠️ **Por qué widget y no un párrafo bien escrito.** Redactado a mano, el día que alguien escriba
> una introducción sin el marco **no lo nota nadie** — es exactamente la clase de omisión muda que
> este proyecto ya pagó con el `META_OA` de 7° y con el campo `visual`. Como dato, se ve que falta
> **y lo puede comprobar un script**: `scripts/revisar-marco-historia.py`.

Los tres campos son **opcionales** y la ficha se achica sola. Eso es lo que permite la regla de
abajo sin inventar datos.

---

## Los tres tipos de capítulo, y qué marco lleva cada uno

De los 33 capítulos de Historia, **solo 12 son históricos en el sentido temporal**. Los otros 21
son de geografía o de formación ciudadana, y ahí *"en qué siglo estamos"* se responde con *"hoy,
siglo XXI"*, que no ubica nada.

**Decisión de Roberto (07/09/2026): el LUGAR va siempre; el tiempo, cuando aporta.**

| Tipo | `siglo` | `epoca` | `lugar` | Ejemplo |
|---|---|---|---|---|
| **Histórico** | ✅ el siglo o los siglos | ✅ el rango de años | ✅ | *Descubrimiento y conquista* |
| **Geografía** | ❌ | ❌ (o el dato que sí fecha algo) | ✅ **obligatorio** | *Paisajes de América* |
| **Ciudadanía** | ❌ | ✅ **lo que de verdad fecha**, no "hoy" | ✅ **obligatorio** | *La Constitución* |

> ⚠️ **En ciudadanía, `epoca` NO es "el presente".** Es el dato con fecha que ancla el tema: *"la
> Constitución actual se escribió en 1980"*, *"Chile firmó la Convención de los Derechos del Niño
> en 1990"*. Si no existe un dato así, el campo **se omite** — una ficha de dos filas es correcta,
> y rellenarla con "siglo XXI" es peor que dejarla corta.

**Cómo se decide el tipo:** por lo que miden sus objetivos, no por el nombre del capítulo. Un
capítulo que pregunta por hechos fechables es histórico; uno que pregunta por el espacio es
geografía; uno que pregunta por derechos, deberes o convivencia es ciudadanía.

---

## Qué lleva la introducción además del marco

El marco es **el mínimo**, no el contenido. Después van 2 o 3 bloques que arman el capítulo:

1. **El marco** (`kind:'marco'`) — siempre primero.
2. **Un texto que dé sentido al lugar y a la época.** No repetir la ficha en prosa: explicar
   *por qué ahí y por qué entonces*. («El Mediterráneo no separaba a los pueblos: los conectaba.»)
3. **Una línea de tiempo** (`kind:'tiempo'`) en los capítulos históricos, con 3 a 5 hitos. Es el
   widget que ya existe y el que mejor le sirve a Historia.
4. **Un cierre que diga qué viene**, en una frase: *«En este capítulo vas a ver…»*.

**Sin práctica.** Una introducción no mide ni bloquea: es un ofrecimiento al empezar el capítulo,
no un peaje. Eso la distingue de una mini-clase y es lo que hace que **no agregue ninguna medición
al mapa de dominio del profesor**.

---

## Cuidados que ya se pagaron

- ⚠️ **El marco no puede contradecir al banco.** Si la ficha dice *1810 – 1830* y una pregunta del
  capítulo trata de 1833, el alumno que estudió la introducción responde mal. **El rango se saca
  de los objetivos del capítulo, no de la memoria.**
- ⚠️ **La introducción no puede regalar la respuesta de una pregunta del banco.** Es el defecto
  documentado en `docs/estandar-miniclases.md`: enseñar el concepto está bien; resolver el caso
  numérico o el dato exacto que una pregunta va a preguntar, no. Un año que aparece como hito de
  la línea de tiempo **sí puede** ser el de una pregunta —es el andamiaje que el capítulo enseña—,
  pero un dato de detalle que solo aparece en una pregunta, no.
- **Fechas con criterio en los cursos chicos.** En 3° y 4° el rango va redondeado y en palabras
  cuando ayuda (*«hace unos 2.000 años»*), porque un niño de 8 años todavía no ordena números
  negativos. La ficha admite cualquier texto: `epoca` es una cadena, no un número.
- ⚠️ **Contenido sensible:** los capítulos de conquista, dictadura y pueblos originarios están
  listados en [`docs/contenido-sensible.md`](contenido-sensible.md). La introducción **no puede
  suavizar ni tomar partido**: nombra el hecho con el término del currículum oficial —que en el
  `HI06 OA 08` es *"el régimen o dictadura militar"*, con los dos términos— y deja el juicio fuera.
- **La voz.** 3° y 4° llevan voz pregrabada, así que sus introducciones **se locutan**: hay que
  generar sus clips después de aprobar. ⚠️ El texto del widget `marco` **no** se locuta (no es un
  bloque de texto), así que lo que el marco dice tiene que estar también en la prosa si importa
  que se oiga.

---

## Cómo se comprueba

```bash
python scripts/revisar-marco-historia.py
```

Comprueba, sobre los seis `historia-*/lecciones.json`, que **cada capítulo de Historia tiene su
introducción** y que **cada introducción abre con un bloque `kind:'marco'`** que trae al menos el
`lugar`. Sale con código 1 si algo falta, para que encadenarlo con `&&` sirva de algo.
