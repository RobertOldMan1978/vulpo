# Cuidados — Historia, Geografía y Ciencias Sociales

Los puntos donde una pregunta de Historia **enseña algo falso, mide lo que no puede medir, o dice
algo que un colegio no querría ver en pantalla**. Sirve para escribir el banco y para revisarlo.

Como el de Matemática, este saber no estaba escrito: vivía repartido en los planes de contenido de
3° y de 7°. Vale para los seis niveles.

---

## 🔴 Lo más grave: los OA que miden conducta

**Historia es la asignatura con más objetivos actitudinales de todas.** En 3° son cuatro de
dieciséis —"asumir" deberes, "mostrar" actitudes, "mantener" una conducta honesta, "participar"—,
y en 7° hay varios equivalentes sobre respeto, tolerancia y valoración de la diversidad.

**Un quiz no puede medir conducta.** Solo puede medir si el estudiante **reconoce** cuál es la
acción correcta, que no es lo mismo y hay que decirlo.

Por qué importa tanto aquí: el mapa de dominio le va a mostrar al profesor **un porcentaje junto a
"mantener una conducta honesta"**, y eso se lee como una nota de conducta. La advertencia va
escrita en el `oa.json` del nivel (`nota_evaluacion`) justamente por eso.

**Las dos reglas, sin excepción:**

1. **La pregunta plantea siempre la situación de un tercero con nombre.** *"Ana encontró un
   estuche en el patio. ¿Qué debería hacer?"* — nunca *"¿tú qué harías?"* ni *"¿tú devuelves lo
   que encuentras?"*.
2. **Nunca se pregunta por la conducta del jugador.** Además de leerse como evaluación de
   conducta, se responde lo que se espera y no la verdad, así que ni siquiera mide.

Estos OA **se revisan completos, no por muestreo** (ver `docs/aprobacion-pedagogica.md`).

---

## 🔴 Pueblos originarios, religiones vivas y hechos dolorosos

No son historia lejana: hay mapuches, aymaras y rapanuí **sentados en la sala**, y familias de
todas las religiones que aparecen en el currículum.

- **Nada en pasado que siga vivo.** No *"los mapuches vivían"* sino *"los mapuches viven"*. Un
  pueblo existente descrito en pretérito se enseña como extinto.
- **Ni "primitivo", ni "atrasado", ni "salvaje", ni "descubrimiento" de un territorio habitado.**
- **La conquista no se ilustra ni se pregunta como hazaña.** El criterio editorial que ya se usó
  en el arte de 8° vale también para el texto: la unidad de la llegada de los europeos se trató
  por la **travesía** (carabela, brújula, astrolabio) y la colonia por la **vida cotidiana y el
  mestizaje**, evitando la conquista armada y el trabajo forzado como estampa.
- **Las religiones se describen, no se evalúan.** Ni la propia ni las ajenas, ni por comparación
  implícita ("a diferencia de los que creían…").
- **La esclavitud, la encomienda y las epidemias se nombran con precisión y sin adorno.** Están en
  el currículum y hay que enseñarlas; lo que no cabe es suavizarlas ni convertirlas en anécdota.

---

## 🟠 Precisión histórica y geográfica

**1. El anacronismo.** Es el error propio de la asignatura, y por eso el villano de 7° se llama
así. Atribuirle a una época una idea, una institución o un objeto que no existía todavía:
"democracia" en Egipto, "país" en la Edad Media, "científico" en la Antigüedad.

**2. Confundir el nombre con la cosa.** *Res publica*, ciudadanía, república y democracia
significan cosas distintas en Roma y hoy — y de hecho **hay un OA de 7° dedicado justamente a
compararlas**. Usar el sentido moderno en una pregunta sobre el mundo clásico enseña el error que
otro OA intenta corregir.

**3. Un distractor geográficamente defendible.** *"¿Qué mar rodea Italia y Grecia?"* con
**Adriático** entre las opciones: también baña Italia. En Geografía pasa seguido porque los
accidentes se tocan.

**4. Causa única.** "La caída de Roma se debió a las invasiones" convierte un proceso en un dato.
Cuando el OA pide explicar un proceso, la clave tiene que ser el factor que el OA nombra, y el
`tip` decir que hubo varios.

**5. Fechas que no aportan.** Preguntar el año exacto de algo mide memoria, no comprensión, salvo
que la fecha **sea** el contenido (1492, 1810). Preferir el orden y la relación: qué vino antes,
qué causó qué.

**6. Un OA que pide "su región" o "su localidad" no se puede escribir asumiendo cuál es.**
(`HI06 OA 13`, y va a repetirse en otros niveles.) El banco es único para todo Chile: no puede
saber en qué región vive cada alumno. La salida es que **cada pregunta dé la región o localidad
concreta dentro del propio enunciado** ("La Región de Valparaíso tiene puertos, viñedos y el
Congreso Nacional. ¿Cuál de esos es un rasgo económico?"), variando el ejemplo entre distintas
zonas de Chile para no sesgar el banco hacia una sola realidad geográfica. Lo que se mide es la
capacidad de clasificar/caracterizar, que es transferible a la región real del alumno sin
necesidad de acertarla.

**7. Los temas políticamente vigentes se miden en hechos, nunca en posturas.** El quiebre y la
recuperación de la democracia (`HI06 OA 08`) y la Constitución (`HI06 OA 16`) son currículum
oficial y de los pocos temas donde Chile sigue dividido hoy. La regla que funcionó: **fechas,
nombres, instituciones y resultados verificables sí; juicios sobre si algo estuvo justificado,
quién tuvo la razón, o si la Constitución debería cambiar, nunca**. Donde el propio OA exige
"considerar distintos puntos de vista", se pregunta por el **hecho de que existen** esas visiones
distintas, no por cuál es la correcta. Verificado con un barrido de palabras clave sensibles
(plebiscito, 1980, constituyente, etc.) antes de dar por buena la tanda de `HI06 OA 16`.

---

## 🟠 El solape entre OA, que en Historia es la trampa silenciosa

Los OA de Historia se pisan por naturaleza: un mismo hecho sirve para el eje de Historia, el de
Geografía y el de Formación Ciudadana. Cuando la misma pregunta mide dos OA, **el profesor ve dos
porcentajes que son el mismo dato**.

Pasó de verdad, y no es teórico: en el banco de 7° se encontraron **7 pares reales** —el Canon de
Avicena preguntado en dos OA, el Cisma de 1054, los metecos, las terrazas andinas, *res publica* y
los glaciares—. Los ocho (con uno de Lenguaje) hubo que reescribirlos.

→ `python scripts/auditar-solape-oa.py contenido/historia-<n>basico/preguntas.json`
`revisar-tanda.py` **no lo caza**: mira duplicados dentro de un OA, o sea dentro de una tanda.

---

## 🟡 Menores

**6. Sesgo de largo, con agravante.** En Historia aparece más que en ninguna otra asignatura,
porque la respuesta verdadera necesita precisión ("El Senado, cuyos miembros elegía el pueblo cada
año") y los distractores salen sueltos ("El Senado"). Medido en las primeras tandas de 7°: la
correcta era la más larga en **20 a 25 de cada 30**. → Dales cuerpo a los distractores desde el
primer borrador.

**7. Las parejas de contraste son legítimas.** El detector de casi-duplicados marca cosas como
*"opuesto al norte"* / *"opuesto al este"*: revisadas las 19 del banco de Historia de 3°, ninguna
estaba rota. Son deliberadas. Por eso el chequeo es **aviso y no error**.

**8. Los dibujos de Historia** (`cuadricula`, `globo`, `zonas`, `linea`) siguen las mismas dos
reglas de siempre: no pueden delatar la respuesta, ni su descripción para lector de pantalla
tampoco. Y hay un cuidado propio: **los colores a media opacidad sobre el fondo violeta del juego
quedan barrosos** —la zona cálida se veía marrón— y una línea a trazo lleno cruzando el globo
**parece una grieta**. Eso no se ve contando elementos del SVG: hay que **mirar la captura**.

---

## En los niveles con voz (3° y 4°)

- **Nada de números romanos** salvo que sean el contenido. *"Los números I, V y X"* se sintetizaba
  corrido y volvía como `YVYX` — y era justo la pregunta cuya respuesta es "romanos".
- **Nada de abreviaturas**: "antes de Cristo" completo, nunca "a. C.".
- **Las coordenadas se dicen enteras.** `(A, 2)` sonaba *"a, dos"* y `(D, 3)` *"de, tres"*, que en
  Historia es grave porque hay opciones que **son** solo la coordenada. Se pronuncian
  **"columna B, fila 3"**.
- **Convención de la cuadrícula:** la letra es la **columna** y el número la **fila**. Está
  declarada así en el banco de 3° y usada igual en sus 15 preguntas del OA. Un informe externo
  pidió invertirla; aplicarlo habría dejado dos preguntas contradiciendo a las otras trece.
