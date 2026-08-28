# Encargo: escribir una tanda de preguntas para 7° básico

Este archivo es el estándar del banco de 7° básico de VULPO. Cada regla nació de un
defecto real encontrado en los bancos anteriores (8° básico, ~2.300 preguntas; 3°
básico, ~2.500). Léelo completo antes de escribir la primera pregunta.

**A quién le escribes:** estudiantes chilenos de **12 a 13 años**. Leen de corrido y
razonan con abstracción, pero **responden contra un cronómetro de 20 segundos**. Eso
gobierna el largo de todo lo que escribas.

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

- **`correcta` va SIEMPRE en 0** (la correcta primera). El consolidador baraja después
  con semilla fija. No intentes repartirla tú.
- **`id` obligatorio y correlativo**: `<prefijo>-oa<NN>-<n>`, con `n` de 1 a 30. El modo
  de revisión del profesor (`?rev=1`) identifica cada pregunta por su id; **sin id no se
  puede reportar**.
- **Exactamente 4 opciones**, todas distintas entre sí.
- **`tip` obligatorio**: una o dos frases que EXPLIQUEN por qué, no que repitan la
  respuesta. Es lo que el estudiante lee cuando se equivoca, y es el único momento de
  enseñanza del juego. A esta edad el buen `tip` además **dice por qué el error típico
  es error**.
- **30 preguntas** por OA, salvo que se te indique otra cosa.
- No agregues campos que no estén aquí. **7° no tiene widget de dibujos**: el campo
  `visual` NO existe en este motor y se descartaría en silencio.

## 2. Las trampas que ya nos costaron caro

**a) El distractor más correcto que la clave.** Pasó de verdad: *"¿cuál es menor: 728 o
782?"* con **708** entre las opciones, y *"¿qué mar rodea Italia y Grecia?"* con
**Adriático** de distractor, que también baña Italia. Quien razona bien queda sin salida
y el juego lo marca como error. **Antes de cerrar cada pregunta, léete las otras tres
opciones preguntándote si alguna podría defenderse.**

**b) El sesgo de largo.** Si la correcta es sistemáticamente la más larga, se aprende a
elegir la larga y se deja de leer. Aparece solo, porque la verdad necesita ser precisa y
los distractores salen sueltos. **La solución NO es acortar la correcta hasta volverla
imprecisa: es darles cuerpo a los distractores**, que de paso quedan más plausibles.

> **Escríbelos con cuerpo DESDE EL PRIMER BORRADOR, no al final.** Medido sobre las
> primeras tandas de 7°: de cada 30 preguntas, la correcta salía siendo la más larga en
> **20 a 25** en la primera pasada. Arreglarlo después obliga a reescribir medio banco, y
> es donde el trabajo se cae si algo interrumpe. Un distractor con cuerpo no es relleno:
> es el error *con su razón* — no "El Senado", sino "El Senado, cuyos miembros elegía el
> pueblo cada año".

**c) El enunciado que cambia y deja atrás su clave.** Si reescribes una pregunta,
**relee su `correcta` y su `tip`**. Una vez quedó una pregunta sobre un río con la clave
de otra y un tip que hablaba de una escuela inexistente.

**d) Los casi-duplicados.** Dos preguntas con el mismo enunciado en distinto orden no
suman: gastan el pool. Las parejas de **contraste** deliberado sí son legítimas.

**e) Distractores absurdos.** Un distractor imposible convierte una pregunta de 4
opciones en una de 2. Todos tienen que ser **errores que un estudiante realmente
cometería** — a esta edad, los errores conceptuales conocidos de cada materia.

**f) El `tip` no puede nombrar la posición de una opción.** Las tandas se escriben con la
correcta primera y el consolidador **baraja**: un tip que dice *"solo la primera lleva
signos de interrogación"* termina contradiciendo la pantalla.

**g) Dos opciones que valen lo MISMO.** Las cuatro opciones tienen que ser distintas
*como texto* y también *como valor*. Pasó de verdad en Matemática: una pregunta cuya clave
era **1/6** ofrecía **2/12** entre los distractores, y otra tenía "4,5 pizzas" y "18/4 de
pizza". **Eso da dos respuestas correctas** y el estudiante que las reconoce como iguales
queda castigado por saber más. La comprobación de que las opciones son distintas mira el
texto, así que **no caza esto**: hay que verificarlo por valor, con `Fraction`.

**h) El distractor que miente sobre su propio origen.** Si un distractor dice "que resulta
de dividir 2.400 entre 0,75", ese número tiene que ser de verdad esa división. Uno que
anuncia una operación y muestra otra es descartable de una, y además el `tip` termina
enseñando algo falso.

**i) Contenido de otro año.** Ni más arriba (que solo se puede memorizar) ni más abajo
(que no evalúa el OA). Si el OA no alcanza para 30 preguntas honestas, **entrega menos y
explica por qué**.

## 3. Cómo se escribe para 12-13 años, contra un reloj de 20 segundos

- **Enunciado corto: apunta a menos de 120 caracteres.** El banco de 8° tiene mediana 69
  y percentil 90 en 93-150 según asignatura; ese es el rango sano. Si necesitas un
  fragmento de texto (comprensión lectora, un dato, un gráfico descrito en palabras),
  **el total no debe pasar de 250 caracteres** — a 20 segundos, más que eso no se
  alcanza a leer y la pregunta mide velocidad de lectura, no aprendizaje.
- Español de Chile **neutro**. Nada de modismos ni de "vosotros".
- Nombres chilenos comunes en las situaciones (Camila, Matías, Javiera, Benjamín…).
- **Una sola idea por pregunta.** Evita "¿cuál de las siguientes afirmaciones es
  correcta?" con cuatro frases largas: obliga a leer cuatro preguntas en el tiempo de una.
- Evita la negación en el enunciado ("¿cuál NO es…?"); si es imprescindible, la palabra
  negativa va en MAYÚSCULA.
- **Varía la exigencia cognitiva.** A esta edad el banco no puede ser 30 definiciones:
  apunta a un reparto aproximado de **1/3 reconocer, 1/3 aplicar a una situación nueva,
  1/3 analizar, comparar, interpretar evidencia o predecir un resultado**. Es lo que pidió
  la revisión pedagógica de 8° y lo que hace que el banco sirva para evaluar y no solo
  para repasar.
- **Sin abreviaturas ni símbolos ambiguos.** "25 grados Celsius" antes que "25 °C"; escribe
  "antes de Cristo" completo. No es por la voz (7° no la tiene) sino porque a 20 segundos
  cada símbolo que hay que decodificar es tiempo perdido.

## 4. Los OA que no se pueden medir con un quiz

Varios OA son de **producción, hábito o actitud** (escribir textos, exponer oralmente,
leer habitualmente, participar en debates, trabajar colaborativamente). Un quiz **no
puede medir ninguna de esas cosas**, solo si el estudiante **reconoce cuál es la práctica
correcta o el criterio que la evalúa**.

Cuando te toque uno de esos:

- La pregunta plantea **la situación o el texto de otra persona**: *"Camila escribió esta
  introducción para su ensayo. ¿Qué le falta para cumplir su propósito?"*.
- **Nunca** preguntes por la conducta del propio jugador: se lee como una nota de
  conducta, y además se responde lo que se espera, no la verdad.
- Se puede preguntar legítimamente por **el criterio, el procedimiento y el error
  típico**: qué hace que una tesis sea una tesis, en qué orden se revisa un borrador, por
  qué una fuente no sirve.
- **Si un OA no admite ninguna versión honesta, dilo en tu respuesta y entrega menos.**
  Preferimos un OA con 20 preguntas verdaderas que 30 con relleno. En 3° básico un OA
  quedó **fuera del banco** por esto y se documentó, en vez de fingir que se medía.

## 5. Antes de entregar

Valida tú mismo el archivo y **dilo en tu respuesta final**:

1. Es JSON válido y son exactamente 30 preguntas (o las que hayas justificado).
2. Todas tienen los 6 campos, `correcta` es 0, las 4 opciones son distintas.
3. Los `id` son correlativos y sin repetir.
4. Ningún enunciado repetido ni casi repetido.
5. Releíste cada clave contra sus distractores buscando el caso "hay otra defendible".
6. Cuentas cuántas veces la correcta es la más larga: si pasa de 8 de 30, redistribuye
   dándole cuerpo a los distractores.
7. Cuentas el reparto por exigencia cognitiva y no te quedaste en puras definiciones.
8. Ningún enunciado pasa de 250 caracteres.

En tu respuesta final entrega: la ruta escrita, cuántas preguntas, y **qué dudas o
decisiones tomaste** (un OA que no admitía cierta pregunta, un contenido que preferiste
no tocar, una imprecisión que evitaste). Esa parte importa tanto como el archivo.
