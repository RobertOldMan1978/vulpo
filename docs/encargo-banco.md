# Encargo: escribir una tanda de preguntas para VULPO

Este archivo es **el estándar del banco de preguntas de todos los niveles**. Cada regla nació de
un defecto real encontrado en los bancos anteriores (8° ~2.300 preguntas, 3° ~2.500, 7° 2.430).
Léelo completo antes de escribir la primera pregunta.

Antes existía uno por nivel (`encargo-banco-3basico.md` y `-7basico.md`). Se fundieron porque las
reglas son casi todas las mismas y lo que cambia cabe en una tabla — y porque el de 3° **no tenía
las trampas f, g, h e i**, que se descubrieron escribiendo 7°: cuatro defectos conocidos que se
habrían repetido gratis en cada nivel nuevo.

---

## 0. Los parámetros de tu nivel

**Búscate en esta tabla antes de seguir.** Todo lo demás del documento es igual para todos.

| Nivel | Edad | Cronómetro | Enunciado | Con fragmento | Voz pregrabada | Campo `visual` |
|---|---|---|---|---|---|---|
| **3° básico** | 8-9 | **No** | < 110 | máx **220** | **Sí** | **Sí**, 11 tipos |
| **4° básico** | 9-10 | **No** | < 110 | máx **220** | **Sí** | **Sí** |
| **5° básico** | 10-11 | Sí, 20 s | < 120 | máx **250** | No | No |
| **6° básico** | 11-12 | Sí, 20 s | < 120 | máx **250** | No | No |
| **7° básico** | 12-13 | Sí, 20 s | < 120 | máx **250** | No | No |
| **8° básico** | 13-14 | Sí, 20 s | < 120 | máx **250** | No | No |

Tres consecuencias que la tabla no dice en voz alta:

- **Sin cronómetro (3° y 4°) un fragmento breve sí cabe.** Es la ventaja de esos niveles; úsala.
- **Con cronómetro, el largo no es estética: es la restricción.** A 20 segundos, un enunciado
  largo mide velocidad de lectura y no aprendizaje.
- **Si tu nivel no lleva `visual`, el campo no existe en ese motor y se descartaría en silencio.**
  Lo mismo al revés: si lo lleva, te lo van a indicar explícitamente.

**La voz es la que más cambia el trabajo.** Si tu nivel la tiene, la sección 4 es obligatoria.

---

## 1. Formato exacto de salida

Un solo archivo JSON, UTF-8, en la ruta que te indiquen:

```json
{"preguntas": [
 {"oa": "CN07 OA 05",
  "pregunta": "¿Por qué una lata cerrada se abomba al calentarse?",
  "opciones": ["Porque las partículas del gas se mueven más rápido y chocan más contra las paredes",
               "Porque el metal de la lata se vuelve más liviano con el calor",
               "Porque el calor crea partículas nuevas dentro de la lata",
               "Porque las partículas del gas aumentan de tamaño al calentarse"],
  "correcta": 0,
  "tip": "El calor aumenta la energía de las partículas: se mueven más rápido y golpean más seguido las paredes, así que la presión sube. Las partículas no crecen ni se multiplican.",
  "id": "cie7-oa05-1"}
]}
```

- **`correcta` va SIEMPRE en 0** (la correcta primera). El consolidador baraja después con semilla
  fija. No intentes repartirla tú.
- **`id` obligatorio y correlativo**: `<prefijo>-oa<NN>-<n>`, con `n` de 1 a 30. El modo de
  revisión del profesor (`?rev=1`) identifica cada pregunta por su id; **sin id no se puede
  reportar**.
- **Exactamente 4 opciones**, todas distintas entre sí.
- **`tip` obligatorio**: una o dos frases que EXPLIQUEN por qué, no que repitan la respuesta. Es
  lo que el estudiante lee cuando se equivoca, y es el único momento de enseñanza del juego. De 5°
  hacia arriba el buen `tip` además **dice por qué el error típico es error**.
- **30 preguntas** por OA, salvo que se te indique otra cosa.
- No agregues campos que no estén aquí.

---

## 2. Las trampas que ya nos costaron caro

**a) El distractor más correcto que la clave.** Pasó de verdad: *"¿cuál es menor: 728 o 782?"* con
**708** entre las opciones, y *"¿qué mar rodea Italia y Grecia?"* con **Adriático** de distractor,
que también baña Italia. Quien razona bien queda sin salida y el juego lo marca como error.
**Antes de cerrar cada pregunta, léete las otras tres opciones preguntándote si alguna podría
defenderse.**

**b) El sesgo de largo.** Si la correcta es sistemáticamente la más larga, se aprende a elegir la
larga y se deja de leer. Aparece solo, porque la verdad necesita ser precisa y los distractores
salen sueltos. **La solución NO es acortar la correcta hasta volverla imprecisa: es darles cuerpo
a los distractores**, que de paso quedan más plausibles.

> **Escríbelos con cuerpo DESDE EL PRIMER BORRADOR, no al final.** Medido sobre las primeras
> tandas de 7°: de cada 30 preguntas, la correcta salía siendo la más larga en **20 a 25** en la
> primera pasada. Arreglarlo después obliga a reescribir medio banco, y es donde el trabajo se cae
> si algo interrumpe. Un distractor con cuerpo no es relleno: es el error *con su razón* — no
> "El Senado", sino "El Senado, cuyos miembros elegía el pueblo cada año".

**c) El enunciado que cambia y deja atrás su clave.** Si reescribes una pregunta, **relee su
`correcta` y su `tip`**. Una vez quedó una pregunta sobre un río con la clave de otra y un tip que
hablaba de una escuela inexistente.

**d) Los casi-duplicados.** Dos preguntas con el mismo enunciado en distinto orden no suman:
gastan el pool. Las parejas de **contraste** deliberado sí son legítimas.

**e) Distractores absurdos.** Un distractor imposible convierte una pregunta de 4 opciones en una
de 2. Todos tienen que ser **errores que un estudiante realmente cometería**: los errores
conceptuales conocidos de cada materia.

**f) El `tip` no puede nombrar la posición de una opción.** Las tandas se escriben con la correcta
primera y el consolidador **baraja**: un tip que dice *"solo la primera lleva signos de
interrogación"* termina contradiciendo la pantalla. No se ve revisando tu tanda, porque ahí
todavía es cierto.

**g) Dos opciones que valen lo MISMO.** Las cuatro tienen que ser distintas *como texto* y también
*como valor*. Pasó de verdad en Matemática: una pregunta cuya clave era **1/6** ofrecía **2/12**
entre los distractores, y otra tenía "4,5 pizzas" y "18/4 de pizza". **Eso da dos respuestas
correctas** y castiga justamente a quien reconoce que son el mismo número. La comprobación de que
las opciones son distintas mira el texto, así que **no caza esto**: verifícalo por valor.

**h) El distractor que miente sobre su propio origen.** Si un distractor dice "que resulta de
dividir 2.400 entre 0,75", ese número tiene que ser de verdad esa división. Uno que anuncia una
operación y muestra otra es descartable de una, y además el `tip` termina enseñando algo falso.

**i) Contenido de otro año.** Ni más arriba (que solo se puede memorizar) ni más abajo (que no
evalúa el OA). Si el OA no alcanza para 30 preguntas honestas, **entrega menos y explica por qué**.

---

## 3. Cómo se escribe

- **Respeta el largo de tu fila en la tabla del §0.**
- Español de Chile **neutro**. Nada de modismos ni de "vosotros".
- Nombres chilenos comunes en las situaciones (Ana, Diego, Sofía, Matías, Camila, Javiera,
  Benjamín…).
- **Una sola idea por pregunta.** Evita "¿cuál de las siguientes afirmaciones es correcta?" con
  cuatro frases largas: obliga a leer cuatro preguntas en el tiempo de una.
- Evita la negación en el enunciado ("¿cuál NO es…?"); si es imprescindible, la palabra negativa
  va en MAYÚSCULA.
- **Sin abreviaturas ni símbolos ambiguos.** "25 grados Celsius" antes que "25 °C"; "antes de
  Cristo" completo. En los niveles con voz es obligatorio (§4); en los demás, porque a 20 segundos
  cada símbolo que hay que decodificar es tiempo perdido.
- **Varía la exigencia cognitiva.** El banco no puede ser 30 definiciones.
  - **3° y 4°:** alterna reconocer, aplicar a una situación, ordenar, comparar y predecir.
  - **5° a 8°:** apunta a **⅓ reconocer, ⅓ aplicar a una situación nueva, ⅓ analizar, comparar,
    interpretar evidencia o predecir**. Es lo que pidió la revisión pedagógica de 8° y lo que hace
    que el banco sirva para evaluar y no solo para repasar.

---

## 4. Lo que la voz va a leer — **solo 3° y 4°**

Estas preguntas se sintetizan con una voz chilena. El texto que se ve **no** es el que se
pronuncia: pasa por el normalizador de voz. Para no pelearte con eso:

- **Escribe los símbolos con palabras.** "25 grados", no "25 °C". "un medio", no "1/2", salvo que
  la fracción sea el contenido.
- **Nada de abreviaturas** ("a. C.", "etc.", "Sr."): se leen letra por letra o se interpretan mal.
- **Nada de números romanos** ni listas de letras sueltas, salvo que sean el contenido de la
  pregunta (y avisa si lo son).
- **Nada de guiones dentro de una frase** como puntuación: el normalizador los lee como restas.
- Los emoji **solo** si son un objeto contable del enunciado; nunca de adorno.

> **Y una que no es de formato sino de fondo: la pregunta tiene que poder responderse
> ESCUCHÁNDOLA.** Un ítem cuyas opciones son *"Había / Havía / Abia / Habia"* tiene el JSON
> perfecto y es irresoluble al oído, porque las cuatro suenan igual. Lo mismo con *"¿cuál se
> escribe con jota?"*. Si el contenido es la grafía, **nómbrala en el enunciado** en vez de
> mostrarla. Hay un chequeo automático para los homófonos, pero no cubre este segundo caso.

---

## 5. Dibujos (`visual`) — **solo si tu nivel lo tiene y te lo indican**

Dos reglas absolutas:

1. **El dibujo NO puede delatar la respuesta.** Si la pregunta es "¿cuántas zonas hay?" y el
   dibujo las muestra, el niño cuenta y no piensa: la pregunta desapareció. Peor todavía si el
   número que se ve en el dibujo es uno de los distractores.
2. **La descripción para lector de pantalla tampoco puede delatarla.** Se dice "hay una franja
   marcada", nunca cómo se llama.

Si dudas, **no pongas dibujo**. Un dibujo que induce al error es peor que ninguno.

---

## 6. Los OA que no se pueden medir con un quiz

Varios OA son de **producción, hábito, conducta o actitud** (escribir textos, exponer oralmente,
leer habitualmente, participar en debates, ejercitar la higiene, trabajar colaborativamente). Un
quiz **no puede medir ninguna de esas cosas**, solo si el estudiante **reconoce cuál es la
práctica correcta o el criterio que la evalúa**.

No es un caso raro: en Lenguaje de 3° son **17 de 31 OA**, y en el de 7°, **10 de 25**.

Cuando te toque uno de esos:

- La pregunta plantea **siempre la situación de otra persona con nombre**: *"Diego viene de jugar
  en el patio y va a comer. ¿Qué debería hacer primero?"*, *"Camila escribió esta introducción.
  ¿Qué le falta para cumplir su propósito?"*.
- **Nunca** preguntes por la conducta del propio jugador (*"¿tú te lavas las manos?"*): se lee
  como una nota de conducta —y el profesor va a ver un porcentaje junto a ese OA en su panel—,
  y además se responde lo que se espera, no la verdad.
- Sí se puede preguntar por **el criterio, el procedimiento y el error típico**: qué hace que una
  tesis sea una tesis, en qué orden se revisa un borrador, por qué una fuente no sirve.
- **Si un OA no admite ninguna versión honesta, dilo en tu respuesta y entrega menos.** Preferimos
  un OA con 20 preguntas verdaderas que 30 con relleno. Dos OA quedaron **fuera del banco** por
  esto (`LE03 OA 16`, caligrafía manuscrita; `LE07 OA 12`, escritura creativa libre) y se
  documentaron en su `oa.json`, en vez de fingir que se medían.

---

## 7. Antes de entregar

Valida tú mismo el archivo y **dilo en tu respuesta final**:

1. Es JSON válido y son exactamente 30 preguntas (o las que hayas justificado).
2. Todas tienen los campos, `correcta` es 0, las 4 opciones son distintas.
3. Los `id` son correlativos y sin repetir.
4. Ningún enunciado repetido ni casi repetido.
5. Releíste cada clave contra sus distractores buscando el caso "hay otra defendible".
6. Cuentas cuántas veces la correcta es la más larga: **si pasa de 8 de 30, redistribuye** dándole
   cuerpo a los distractores.
7. Ninguna pregunta tiene dos opciones que valgan lo mismo (trampa **g**).
8. Ningún enunciado pasa del largo de tu fila en el §0.
9. De 5° hacia arriba: cuentas el reparto por exigencia cognitiva y no te quedaste en puras
   definiciones.
10. **En Matemática, verifica la aritmética de tus 30 claves con un script y repórtalo.** No es
    formalidad: los verificadores de 7° encontraron distractores cuya justificación no producía su
    propio número, y uno cuyo razonamiento era correcto y solo fallaba la cuenta.

En tu respuesta final entrega: la ruta escrita, cuántas preguntas, y **qué dudas o decisiones
tomaste** (un OA que no admitía cierta pregunta, un contenido que preferiste no tocar, una
imprecisión que evitaste). Esa parte importa tanto como el archivo.

---

## 8. Lo que se corre después de tu entrega

No es tu trabajo, pero saber qué se comprueba te dice qué se va a devolver:

```
python scripts/revisar-tanda.py --largo=<N> contenido/<asig>-<n>basico/_pool/oa07.json
python scripts/consolidar-pool-nivel.py <asig>-<n>basico
python scripts/auditar-numerico.py    contenido/<asig>-<n>basico/preguntas.json
python scripts/auditar-solape-oa.py   contenido/<asig>-<n>basico/preguntas.json
python scripts/validar-oa-json.py     <asig>-<n>basico
```

Y en los niveles con voz, además `scripts/auditar-audible-3ro.py`.

Los cuidados de precisión propios de cada asignatura están en `docs/cuidados-<asignatura>.md`.
**Léelos: son los errores que ya se colaron una vez.**
