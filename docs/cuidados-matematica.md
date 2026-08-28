# Cuidados de precisión — Matemática

Los puntos donde una pregunta de Matemática **castiga a quien razona bien**, ordenados por
gravedad. Sirve para escribir el banco y para revisarlo después.

Hasta ahora este saber no estaba escrito en ninguna parte: vivía **dentro de
`scripts/auditar-banco-3ro.py`** —hoy reemplazado por `auditar-banco-nivel.py`— y disperso en
los planes de contenido. Este documento lo saca a
la luz para que valga en los seis niveles.

> **Matemática es la única asignatura donde la clave se puede verificar por cálculo**, y por eso
> el encargo exige que **cada agente compruebe la aritmética de sus 30 claves con un script y lo
> reporte**. No es formalidad: los verificadores de 7° encontraron distractores cuya justificación
> no producía su propio número, y uno cuyo razonamiento era correcto y solo fallaba la cuenta.

---

## 🔴 Graves

**1. Dos opciones que valen lo MISMO escritas distinto.**
El caso que originó el chequeo: una pregunta cuya clave era **1/6** ofrecía **2/12** entre los
distractores. Otra tenía "4,5 pizzas" y "18/4 de pizza". **Son dos respuestas correctas**, y el
estudiante que reconoce que son el mismo número queda castigado por saber más.

La comprobación de "las 4 opciones son distintas" mira **texto**, así que no lo caza.
→ `python scripts/auditar-numerico.py <preguntas.json>` lo verifica por **valor**, con fracciones
exactas y comparando la unidad. Destapó además un caso vivo en el banco de 8°, aprobado y en
producción desde hacía un año: `x/4 = 5` ofrecía `1,25` y `5/4`, o sea llevaba un año siendo una
pregunta de tres opciones.

**2. Un distractor que es MÁS correcto que la clave.**
*"¿Cuál es menor: 728 o 782?"* con **708** entre las opciones. El niño que ordena bien no tiene
dónde ir. → Antes de cerrar cada pregunta, lee las otras tres preguntándote si alguna se puede
defender.

**3. El dibujo que regala la respuesta.**
Si la pregunta es *"¿cuántas zonas hay?"* y el dibujo las muestra, el niño **cuenta y no piensa**:
la pregunta desapareció. Peor cuando el número que se ve es uno de los distractores.

En 3° hubo que quitar el `visual` a **17 preguntas** por esto — 9 de ellas describían la red de un
cuerpo geométrico en palabras *y además* la dibujaban. Dos lo conservaron a propósito, porque
dicen *"¿cómo se llama **este** cuerpo?"*: ahí el dibujo **es** la pregunta.

**Y el reverso, que también pasó:** tres dibujos se **descartaron** porque inducían al error. En
*"¿cuántos trópicos tiene el planeta?"*, el globo dibuja **cinco** líneas (dos trópicos, dos
círculos polares y el Ecuador): el niño contaría cinco. Peor en *"¿cuántas zonas climáticas hay?"*,
donde **"Cinco" era justamente uno de los distractores**.
→ **Un dibujo que induce al error es peor que ninguno.** Si dudas, no lo pongas.

**4. El enunciado que cambia y deja atrás su clave.**
Al acortar el enunciado de una pregunta se le pegó encima el de la siguiente, **dejando intactas
sus opciones y su tip**: quedó una pregunta sobre un río cuya respuesta correcta era "al este",
con la clave marcando "al sur". No lo encontró ningún script. → **Al tocar el campo `pregunta`,
relee su `correcta` y su `tip`.**

## 🟠 Medios

**5. El distractor que miente sobre su propio origen.**
Si un distractor se justifica como "lo que resulta de dividir 2.400 entre 0,75", ese número tiene
que ser de verdad esa división. Uno que anuncia una operación y muestra otra es descartable de una
—o sea, la pregunta pasa a tener tres opciones— y encima el `tip` enseña algo falso.

**6. Contenido de otro año.**
Es el error más fácil de cometer en Matemática, porque los procedimientos se encadenan. Casos
reales detectados en 3°: preguntas que exigían **simplificar fracciones** (3/6 = 1/2), que es de
4°; y clasificar ángulos en agudo/obtuso/llano, que va más allá del OA.
→ Si el OA no alcanza para 30 preguntas honestas **dentro de su año**, entrega menos y dilo.

**7. El mismo contenido midiendo dos OA distintos.**
En Matemática los OA se solapan por naturaleza (un OA de números y otro de operatoria se tocan).
Cuando pasa, el mapa de dominio le muestra al profesor **dos porcentajes que son el mismo dato**.
→ `python scripts/auditar-solape-oa.py` lo caza entre OA; `revisar-tanda.py` solo mira dentro de
uno.

**8. Formato mezclado en las opciones.**
Cuatro opciones donde tres son decimales y una fracción, o tres llevan unidad y una no, delatan la
distinta por su forma antes de que se lea. → Mismo formato y misma unidad en las cuatro.

**9. La recta numérica ilegible.**
Con 11 etiquetas de 4 dígitos (`0..1000` de 100 en 100, o los años 1900-2000) los números se
encimaban y el dibujo no se podía leer. Se arregló **en el widget**, con rotulado adaptativo.
→ Al calibrar ese arreglo **se introdujo una regresión**: la recta `0..100`, que se veía perfecta,
pasó a mostrar 6 etiquetas de 11. Se detectó comparando capturas antes y después. **Si tocas un
widget, compara la imagen, no cuentes elementos del SVG.**

**10. La marca que no cae en una marca.**
Una recta que salta de 5 en 5 con el marcador en 38 no representa nada. → El valor marcado tiene
que existir en la escala dibujada.

## 🟡 Menores, pero se notan

**11. Distractores "fuera de escala" que en realidad son buenos.**
Una comprobación automática de esto **se retiró**: de 34 avisos, **31 eran distractores correctos**
— para "300 + 40 + 5", el `3405` es exactamente el error típico de escribir el numeral literal.
→ Un distractor lejano no es un error si es *el error que un niño comete*. Y una comprobación que
acusa lo correcto entrena a ignorar el informe.

**12. Preguntas con menos alternativas reales que las que muestran.**
Las dos preguntas de *"¿qué signo va aquí?"* de 3° tienen un cuarto distractor de relleno, porque
**solo existen tres signos de comparación**. El formato de 4 opciones es estructuralmente
imposible ahí y el niño queda siempre en un 1-de-3. No se arregla cambiando distractores: hay que
rediseñar el ítem.

**13. Sesgo de largo.** En Matemática es menos frecuente porque las opciones son números, pero
aparece en los ítems de razonamiento ("¿por qué…?"). Vale la regla general: dales cuerpo a los
distractores, no acortes la clave.

---

## En los niveles con voz (3° y 4°)

- **La operación tiene que sonar.** El signo `-` se perdía cuando no iba entre dígitos: `🔷 - 9 = 11`
  se leía *"el rombo nueve es igual a once"* — **la resta no estaba**, y suena coherente y
  equivocado, que es lo peor.
- **`:` es división solo con espacios a ambos lados.** `18 : 6` es división; `7:45` es una hora.
- **Un espacio en blanco hay que nombrarlo.** Colapsar las comas dejó *"35, 40, 50"* donde el
  enunciado decía *"35, 40, ___, 50"*: suena a que esa es la secuencia.
- **"de 10 en 10" se leía "10 de enero de 10"**, porque `en` es la abreviatura de enero.
- El chequeo automático es `scripts/auditar-audible-3ro.py`, y **la auditoría del audio real** con
  reconocimiento de voz es lo único que caza estos casos: leer el texto normalizado no basta.
