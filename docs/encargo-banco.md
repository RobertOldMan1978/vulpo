# Encargo: escribir una tanda de preguntas para VULPO

Este archivo es **el estándar del banco de preguntas de todos los niveles**. Cada regla nació de
un defecto real encontrado en los bancos anteriores (8° ~2.300 preguntas, 3° ~2.500, 7° 2.430).
Léelo completo antes de escribir la primera pregunta.

> **El criterio pedagógico de fondo** (qué es una pregunta de calidad, el rol del generador, el
> auto-control) vive en [`prompt-generador-preguntas.md`](prompt-generador-preguntas.md). Este
> archivo es lo operativo (formato, largos por nivel, trampas); aquel es el porqué y el estándar.

Antes existía uno por nivel (`encargo-banco-3basico.md` y `-7basico.md`). Se fundieron porque las
reglas son casi todas las mismas y lo que cambia cabe en una tabla — y porque el de 3° **no tenía
las trampas f, g, h e i**, que se descubrieron escribiendo 7°: cuatro defectos conocidos que se
habrían repetido gratis en cada nivel nuevo.

> **Desde el 05/09/2026, un mismo agente puede recibir 2 o 3 OA en un solo encargo** (60-90
> preguntas en total), para repartir entre más preguntas el costo de cargar este documento. Nada
> cambia en el formato: sigues entregando **un archivo por objetivo** en `_pool/`, cada uno con
> sus 30 preguntas propias — solo cambia cuántos objetivos te tocan por llamado.

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

⚠️ **Y antes de escribir la primera pregunta, lee `docs/cuidados-<asignatura>.md`.** Está
nombrado también al final, en el §8, y por eso un agente que lea de arriba abajo puede tomarlo
por post-proceso y saltárselo. No lo es: son **los errores que ya se colaron una vez**.
⚠️ **Busca por TEMA, no por número de OA.** Esos documentos se escribieron para un nivel y se
generalizaron después, así que un «OA 12» de ahí puede ser de otro año: en Ciencias, el
`CN03 OA 12` es la rotación de la Tierra y el `CN05 OA 12` es el agua.

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
  - **El prefijo son las 4 primeras letras de la asignatura + el dígito del nivel**:
    `hist`, `mate`, `cien`, `leng` — o sea `hist5`, `mate5`, `cien5`, `leng5` para 5° básico.
    Sale del nombre de la carpeta, así que no hay nada que elegir ni recordar.
  - ⚠️ **Los bancos ya escritos NO se renombran**, y por eso hay tres formas conviviendo
    (`cie3`/`cie7`/`cien8`, `mat3`/`mate7`, `len3`/`leng7`): **las marcas de aprobación del
    tablero se guardan POR ID**, así que renombrarlas dejaría huérfanas las 7.805 firmadas.
    La regla es para lo que venga; lo viejo se documenta y se deja.
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

> ⚠️ **Y el sesgo tiene DOS direcciones: que la correcta sea la más CORTA es la misma pista al
> revés.** Enseña "elige la breve", y se acierta igual sin leer. Aparece sola justo al corregir
> el sesgo clásico —se les da cuerpo a los distractores y no a la clave, y uno se pasa al otro
> lado—, así que es el error del segundo borrador, no del primero.
>
> Medido en todo el proyecto el 03/09/2026, con el azar en 25%:
>
> | | correcta más LARGA | correcta más CORTA |
> |---|---|---|
> | `vocabulario-8basico` | **148 / 150** | 0 |
> | `historia-8basico` | **469 / 663** | 35 |
> | `ciencias-8basico` | **391 / 534** | 30 |
> | `lenguaje-7basico` | 91 | **287 / 720** |
> | `matematicas-7basico` | 68 | **263 / 570** |
>
> Los bancos viejos están sesgados a la larga porque cuando se escribieron nadie lo medía; los
> nuevos, a la corta, por haber corregido lo primero sin mirar lo segundo. **Hasta el 03/09
> `revisar-tanda.py` solo veía una de las dos mitades**, así que una tanda podía salir "0% de
> sesgo" con la correcta siendo la más corta en 29 de 30. Ya mide las dos y las informa por
> separado.
>
> **El umbral es un TECHO, no una meta: por debajo de 8 de 30 (27%) en CADA dirección.** No hay
> que apuntarle a 8 — apuntarle invita a fabricar diferencias de largo que no aportan nada.
>
> ⚠️ **Y en Matemática lo normal es CERO, sin que eso sea un defecto.** Cuando las cuatro
> opciones son números o expresiones paralelas (`13/5`, `23/5`, `10/5`, `16/5`) sus largos
> quedan casi iguales solos, que es justamente el ideal: ninguna señal de largo. Medido en los
> cuatro bancos de Matemática del proyecto, la dirección larga da 0%, 0%, 2% y 12%. Forzar un
> reparto ahí obligaría a convertir preguntas numéricas en prosa y **empeoraría la tanda**.
> Lo dijeron por separado dos agentes de la tanda de validación de 6°, con la evidencia de las
> tandas de 5° ya aprobadas (0/3 y 0/1).
>
> Donde cero SÍ es sospechoso es en las asignaturas de prosa: significa que las cuatro opciones
> están midiendo lo mismo.

> **Y si después de darles cuerpo el sesgo sigue sobre el umbral, no sigas reescribiendo.**
> Entrégalo con el número real en tu resumen y sigue adelante: hay una reparación aparte, acotada
> solo a los distractores que sobran, que lo corrige después sin volver a cargar todo el contexto.
> Un intento honesto desde el primer borrador basta; insistir más allá de eso no es tu costo.

**a bis) El `tip` que nombra la posición de una opción, y el hueco del validador.** Las tandas se
escriben con la correcta primera y **el consolidador baraja**, así que un tip que diga *"solo el
primero cierra"* termina contradiciendo la pantalla. No se ve revisando la tanda, porque ahí
todavía es cierto.

> ⚠️ **Y `revisar-tanda.py` NO caza todos los casos: escríbelo bien igual.** Su patrón busca las
> formas femeninas y apocopadas (*la primera, el primer*), así que **las masculinas en -o se le
> escapan**: *"el primero", "el segundo", "el tercero", "el último"*. Un agente de la tanda de
> validación de 6° escribió *"Solo el primero cierra"* y el validador calló.
>
> **Se midió si convenía ampliarlo y la respuesta fue que no**: ampliar el patrón a las formas
> en -o lleva los avisos de 17 a 32 en el proyecto, y **los 15 nuevos son falsos positivos** —
> *"el último Estado musulmán"*, *"el primer paso; el segundo es que la ley valga"*, *"el tercero
> tiene que medir menos"*—, donde el ordinal nombra un sustantivo del enunciado y no una opción.
> Un chequeo léxico no puede separar los dos casos, y un informe que marca lo correcto se deja de
> leer. **Así que la responsabilidad es tuya y no del script: ninguna referencia a una opción por
> su posición, aunque el validador no diga nada.**

**b bis) El distractor que acierta por casualidad.** Apareció escribiendo el OA de cálculo de 6°:
en un ítem de redondeo por contexto, el distractor *"redondear al entero más cercano"* **da la
misma respuesta que la clave** cuando el decimal cae del lado que corresponde. `337,5 → 338` se
acierta con el atajo, así que la pregunta deja de medir el razonamiento contextual y nadie lo
nota. La salida es elegir los números **contra** el atajo: redondear hacia arriba con decimal
bajo (`281,25 → 282`, porque son buses y no caben) y hacia abajo con decimal alto (`12,5 → 12`,
porque el material no alcanza). Vale para cualquier tanda con redondeo, estimación o truncado.

**c) El enunciado que cambia y deja atrás su clave.** Si reescribes una pregunta, **relee su
`correcta` y su `tip`**. Una vez quedó una pregunta sobre un río con la clave de otra y un tip que
hablaba de una escuela inexistente.

**d) Los casi-duplicados.** Dos preguntas con el mismo enunciado en distinto orden no suman:
gastan el pool. Las parejas de **contraste** deliberado sí son legítimas.

**e) Distractores absurdos.** Un distractor imposible convierte una pregunta de 4 opciones en una
de 2. Todos tienen que ser **errores que un estudiante realmente cometería**: los errores
conceptuales conocidos de cada materia.

**e bis) El distractor demasiado cierto POR SER UN MATIZ AVANZADO.** Es un tercer caso, distinto
de la (a) —el distractor defendible— y de la (e) —el absurdo—: una opción que **un niño de 10 años
lee como error y un especialista marcaría como correcta**. En Ciencias aparece seguido. El agente
del `CN05 OA 13` descartó cuatro ya escritos: *"los peces suben a la superficie de mañana"* (la
migración vertical existe), *"durante El Niño los peces se hunden a aguas más frías"* (pasa de
verdad) y dos más. **Antes de cerrar, pregúntate si tu distractor es falso o solo POCO CONOCIDO.**

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

**h bis) El objetivo VECINO del mismo año.** La trampa (i) habla de otro *año*; esta es peor,
porque el mapa de dominio le reporta al profesor **por objetivo**: si tu pregunta se responde
igual desde el OA de al lado, le va a mostrar **dos porcentajes que son el mismo dato**. Antes de
escribir, lee el texto de tus vecinos en `oa.json` y decide qué es tuyo y qué no. `auditar-solape-oa.py`
lo caza **después**; a ti te sirve saberlo antes.

**h ter) Cuando la verdad lleva un «suele», ese «suele» NO se borra.** Muchos fenómenos son
probabilísticos o de causa múltiple: en un año de El Niño **suele** llover más en Chile central,
pero no siempre y no en todas partes; Humboldt **contribuye a** la aridez de Atacama, que además
tiene la sombra de lluvia andina. Borrar el matiz deja la opción más limpia y **enseña una regla
que no existe**. El hedge va en el enunciado o en la clave, no se sacrifica por prolijidad.

**i) Contenido de otro año.** Ni más arriba (que solo se puede memorizar) ni más abajo (que no
evalúa el OA). Si el OA no alcanza para 30 preguntas honestas, **entrega menos y explica por qué**.

  > **Y la salida, que casi siempre existe: el CONCEPTO sí, el TÉRMINO no.** Se puede preguntar
  > que las aguas profundas suben cargadas de nutrientes sin decir «surgencia»; que abajo no llega
  > nada de luz sin decir «zona afótica»; que dos aristas de un cubo pueden cruzarse sin tocarse
  > sin decir «alabeadas». Es la técnica que vuelve escribible casi cualquier OA con vocabulario
  > de enseñanza media, y la levantó el agente del `CN05 OA 13`.

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
- **Las fracciones se escriben `n/m` y nada más:** `3/4`, `9/10`, `-3/4`. **El juego las dibuja
  apiladas solo** —numerador sobre denominador— con `assets/js/fracciones.js`, así que no uses
  `¾`, ni `3 sobre 4`, ni `tres cuartos` cuando el número es el contenido. Escribirla de otra
  forma es lo único que impide que se dibuje bien.
  - Para el numerador y el denominador, **solo dígitos**: `x/2` no se apila.
  - Los **paréntesis alrededor de una fracción sola sobran** —el juego los quita al apilarla—,
    así que `(9/10) ÷ (3/5)` y `9/10 ÷ 3/5` se ven igual. Escribe la que prefieras.
  - ⚠️ **Cuidado con una fecha o una lista con barras** (`12/05/2020`, `1/2/3`): el juego las
    respeta y NO las apila, pero conviene no escribirlas junto a fracciones en la misma frase.
- ⚠️ **Si el OA ENUMERA categorías, cúbrelas todas y di el reparto en tu respuesta.** Cuando el
  texto del objetivo dice «beneficiosos y dañinos», «positivos y negativos» o «renovables y no
  renovables», la mitad incómoda es la que se olvida — y es justo la que el OA existe para
  enseñar. Nadie te lo va a recordar en el encargo por objetivo.
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

### 6 bis. Los OA que piden una ACTIVIDAD (construir, investigar, experimentar)

Es distinto del §6. Ahí el contenido mismo era inmedible —una conducta, un hábito—; aquí **el
contenido SÍ se mide y lo que no se mide es la acción**: «construir un circuito», «investigar en
diversas fuentes», «observar experimentalmente».

La receta, que funcionó en Ciencias de 5°: **el experimento ya lo hizo un tercero con nombre**, y
tú preguntas por **su resultado, su causa o su corrección**. *«Sofía conectó la pila, el cable y la
ampolleta, pero dejó el interruptor abierto. ¿Qué pasa?»* mide exactamente lo que el laboratorio
deja instalado, sin fingir que el alumno armó algo.

⚠️ Varios `oa.json` traen esto escrito en su `nota_evaluacion`. **Léela**: es específica de tu
nivel y de tu asignatura, y dice cuáles de tus objetivos están en este caso.

---

## 7. Antes de entregar

Valida tú mismo el archivo y **dilo en tu respuesta final**:

1. Es JSON válido y son exactamente 30 preguntas (o las que hayas justificado).
2. Todas tienen los campos, `correcta` es 0, las 4 opciones son distintas.
3. Los `id` son correlativos y sin repetir.
4. Ningún enunciado repetido ni casi repetido. ⚠️ **Incluido el casi-duplicado de PLANTILLA:**
   cuando el OA tiene elementos paralelos —las cuatro piezas de un circuito, los órganos de un
   sistema, los planetas— lo natural es preguntarlos todos con la misma frase cambiando una
   palabra, y eso *es* un casi-duplicado aunque el contenido difiera. Varía la forma.
5. Releíste cada clave contra sus distractores buscando el caso "hay otra defendible".
6. Cuentas cuántas veces la correcta es la más larga **y cuántas es la más corta**: si alguna de
   las dos pasa de 8 de 30, redistribuye — a la larga dándole cuerpo a los distractores, a la
   corta dándosela a la clave (con sustancia real, nunca con relleno). ⚠️ **La medida que manda es la de `revisar-tanda.py`**, que exige
   que la correcta le saque margen a **todas** las demás — no basta con empatar. Midiendo de otra
   forma vas a reportar un número distinto del suyo, y ya pasó varias veces: un agente informó
   «10 de 30» por su cuenta y «1 de 30» por el script. Reporta el del script. Si no te cierra en
   un intento razonable, anota el número en una línea y sigue — no hace falta explicarlo pregunta
   por pregunta (ver la nota de la §2).
7. Ninguna pregunta tiene dos opciones que valgan lo mismo (trampa **g**).
7 bis. **Relees cada `tip` preguntándote si enseña algo FALSO o de otro año.** El checklist solo
   pedía que no repitiera la respuesta, y eso deja fuera el riesgo real: el `tip` es el único
   momento de enseñanza del juego, así que una imprecisión ahí se aprende. En Ciencias es donde
   más se cuela —«el jabón mata los microbios», «el refrigerador los mata» (los frena)— y en
   Matemática ya hubo tips que afirmaban una regla falsa. Lo pidió el agente del `CN05 OA 07`.
8. Ningún enunciado pasa del largo de tu fila en el §0.
9. De 5° hacia arriba: cuentas el reparto por exigencia cognitiva y no te quedaste en puras
   definiciones.
10. **En Matemática, verifica la aritmética de tus 30 claves con un script y repórtalo.** No es
    formalidad: los verificadores de 7° encontraron distractores cuya justificación no producía su
    propio número, y uno cuyo razonamiento era correcto y solo fallaba la cuenta.

En tu respuesta final entrega, **en 5 a 8 líneas y sin narrar el razonamiento completo**: la ruta
escrita, cuántas preguntas, el sesgo de largo en una línea, y **qué dudas o decisiones tomaste**
(un OA que no admitía cierta pregunta, un contenido que preferiste no tocar, una imprecisión que
evitaste). Esa última parte importa tanto como el archivo — pero en una frase, no en un párrafo
por pregunta.

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

Y en los niveles con voz, además `scripts/auditar-audible-nivel.py`.

Los cuidados de precisión propios de cada asignatura están en `docs/cuidados-<asignatura>.md`.
**Léelos: son los errores que ya se colaron una vez.**
