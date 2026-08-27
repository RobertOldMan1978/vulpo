# Encargo: escribir una tanda de preguntas para 3° básico

Este archivo es el estándar del banco de 3° básico de VULPO. Cada regla de aquí nació de
un defecto real encontrado en las asignaturas anteriores (Matemática 792 preguntas,
Historia 480). Léelo completo antes de escribir la primera pregunta.

**A quién le escribes:** niños chilenos de **8 a 9 años** que recién leen de corrido. Muchos
van a **escuchar** la pregunta con la voz del juego en vez de leerla.

---

## 1. Formato exacto de salida

Un solo archivo JSON, UTF-8, en la ruta que te indiquen:

```json
{"preguntas": [
 {"oa": "CN03 OA 09",
  "pregunta": "¿Por qué se forma una sombra cuando tapas la linterna con la mano?",
  "opciones": ["Porque la luz viaja en línea recta y la mano la detiene",
               "Porque la luz se cansa al llegar a la mano",
               "Porque la mano se pone más oscura que la pared",
               "Porque la luz da la vuelta alrededor de la mano"],
  "correcta": 0,
  "tip": "La luz viaja derecho. Si algo se le pone al frente, no puede pasar y deja una zona sin luz: la sombra.",
  "id": "cie3-oa09-1"}
]}
```

- **`correcta` va SIEMPRE en 0** (la respuesta correcta primera). El consolidador baraja
  después con semilla fija. No intentes repartirla tú.
- **`id` obligatorio y correlativo**: `<prefijo>-oa<NN>-<n>`, con `n` de 1 a 30. El modo de
  revisión del profesor (`?rev=1`) identifica cada pregunta por su id; sin id, no se puede
  reportar.
- **Exactamente 4 opciones**, todas distintas entre sí.
- **`tip` obligatorio**: una o dos frases que EXPLIQUEN por qué, no que repitan la respuesta.
  Es lo que el niño lee cuando se equivoca, y es el único momento de enseñanza del juego.
- **30 preguntas** por OA, salvo que se te indique otra cosa.
- No agregues campos que no estén aquí (salvo `visual`, ver §5).

## 2. Las trampas que ya nos costaron caro

**a) El distractor más correcto que la clave.** Pasó de verdad: *"¿cuál es menor: 728 o
782?"* con **708** entre las opciones, y *"¿qué mar rodea Italia y Grecia?"* con
**Adriático** de distractor, que también baña Italia. Un niño que razona bien queda sin
salida y el juego lo marca como error. **Antes de cerrar cada pregunta, léete las otras
tres opciones preguntándote si alguna podría defenderse.**

**b) El sesgo de largo.** Si la respuesta correcta es sistemáticamente la más larga, el
niño aprende a elegir la larga y deja de leer. Aparece solo, porque la verdad necesita ser
precisa y los distractores salen sueltos. **La solución NO es acortar la correcta hasta
volverla imprecisa: es darles cuerpo a los distractores**, que de paso quedan más
plausibles. Apunta a que ninguna opción le saque más de 3 caracteres a las demás de forma
sistemática.

**c) El enunciado que cambia y deja atrás su clave.** Si reescribes una pregunta, **relee
su `correcta` y su `tip`**. Una vez quedó una pregunta sobre un río con la clave de otra
pregunta y un tip que hablaba de una escuela inexistente.

**d) Los casi-duplicados.** Dos preguntas con el mismo enunciado en distinto orden no
suman: gastan el pool. Las parejas de **contraste** deliberado ("opuesto al norte" /
"opuesto al este") sí son legítimas.

**e) Distractores absurdos.** "El Sol es un plátano gigante" no distrae a nadie: convierte
una pregunta de 4 opciones en una de 2. Todos los distractores tienen que ser **errores que
un niño realmente cometería**.

## 3. Cómo se escribe para 8 años

- **Enunciado corto: apunta a menos de 110 caracteres.** Si un texto de comprensión obliga
  a más, que sean **como máximo 220** y en frases cortas. 3° básico **no tiene cronómetro**,
  así que un fragmento breve sí cabe — es una ventaja de este nivel, úsala con criterio.
- Español de Chile **neutro**. Nada de modismos ni de "vosotros".
- Nombres chilenos comunes en las situaciones (Ana, Diego, Sofía, Matías, Camila…).
- **Una sola idea por pregunta.** Nada de "¿cuál de las siguientes afirmaciones es
  correcta?" con cuatro frases largas.
- Evita la negación en el enunciado ("¿cuál NO es…?"); si es imprescindible, la palabra
  negativa va en MAYÚSCULA.
- Varía el tipo de pregunta: reconocer, aplicar a una situación, ordenar, comparar,
  predecir un resultado. No 30 definiciones seguidas.

## 4. Lo que la voz va a leer (importante y fácil de olvidar)

Estas preguntas se sintetizan con una voz chilena. El texto que se ve **no** es el que se
pronuncia: pasa por `scripts/normalizar-voz-3ro.py`. Para no pelearte con eso:

- **Escribe los símbolos con palabras.** "25 grados", no "25 °C". "un medio", no "1/2",
  salvo que la fracción sea el contenido.
- **Nada de abreviaturas** ("a. C.", "etc.", "Sr."): se leen letra por letra o se
  interpretan mal.
- **Nada de números romanos** ni listas de letras sueltas, salvo que sean el contenido de
  la pregunta (y avisa si lo son).
- **Nada de guiones dentro de una frase** como puntuación: el normalizador los lee como
  restas.
- Los emoji **solo** si son un objeto contable del enunciado; nunca de adorno.

## 5. Dibujos (`visual`), solo si ayudan

Solo si el juego ya tiene el widget correspondiente y **te lo indican explícitamente**. Dos
reglas absolutas:

1. **El dibujo NO puede delatar la respuesta.** Si la pregunta es "¿cuántas zonas hay?" y el
   dibujo las muestra, el niño cuenta y no piensa: la pregunta desapareció. Peor todavía si
   el número que se ve en el dibujo es uno de los distractores.
2. **La descripción para lector de pantalla tampoco puede delatarla.** Se dice "hay una
   franja marcada", nunca cómo se llama.

Si dudas, **no pongas dibujo**. Un dibujo que induce al error es peor que ninguno.

## 6. Los OA que no se pueden medir

Varios OA de 3° son de **conducta, hábito o producción** (participar, escribir
frecuentemente, ejercitar la higiene, recitar). Un quiz **no puede medir ninguna de esas
cosas**, solo si el niño **reconoce cuál es la práctica correcta**.

Cuando te toque uno de esos:

- La pregunta plantea **siempre la situación de otra persona con nombre**: *"Diego viene de
  jugar en el patio y va a comer. ¿Qué debería hacer primero?"*.
- **Nunca** preguntes por la conducta del jugador (*"¿tú te lavas las manos?"*): se lee como
  una nota de conducta, y además el niño responde lo que se espera, no la verdad.
- No inventes una pregunta que finja medir lo inmedible. Si un OA no admite ninguna versión
  honesta, dilo en tu respuesta en vez de rellenar.

## 7. Antes de entregar

Valida tú mismo el archivo y **dilo en tu respuesta final**:

1. Es JSON válido y son exactamente 30 preguntas (o las pedidas).
2. Todas tienen los 6 campos, `correcta` es 0, las 4 opciones son distintas.
3. Los `id` son correlativos y sin repetir.
4. Ningún enunciado repetido ni casi repetido.
5. Releíste cada clave contra sus distractores buscando el caso "hay otra defendible".
6. Cuentas cuántas veces la correcta es la opción más larga: si pasa de 8 de 30, redistribuye.

En tu respuesta final entrega: la ruta escrita, cuántas preguntas, y **qué dudas o
decisiones tomaste** (un OA que no admitía cierta pregunta, un contenido que preferiste no
tocar, una imprecisión que evitaste). Esa parte importa tanto como el archivo.
