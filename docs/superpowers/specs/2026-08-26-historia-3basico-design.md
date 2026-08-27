# Historia, Geografía y Ciencias Sociales de 3° básico — diseño

**Objetivo:** dejar Historia de 3° a la par de Matemática de 3°: año completo, campaña
jugable con Jefe Final, medible por el profesor y con lectura por voz.

**Estado:** diseño. No se ha escrito ni una pregunta ni una línea de motor.

---

## 1. El currículum, fijado antes de escribir nada

`contenido/historia-3basico/oa.json` ya existe con los **16 OA oficiales**, transcritos del
portal del MINEDUC el 2026-08-26 y contrastados contra la ficha individual de un objetivo
del mismo portal. El código de asignatura es **`HI03`**, que es el que usa el propio
MINEDUC y encaja con el prefijo de cuatro letras que el sistema ya usa para todo
(`HI08`, `MA08`, `MA03`).

Tres ejes: **Historia** (OA 1-5), **Geografía** (OA 6-10) y **Formación ciudadana**
(OA 11-16). El Programa de Estudio los reparte además en **cuatro unidades**, y esa es la
estructura que un profesor chileno realmente usa para planificar el año, así que la campaña
la sigue en vez de inventar una propia.

## 2. El problema que Matemática no tenía

**Cuatro de los dieciséis objetivos son actitudinales**, y eso cambia lo que el juego puede
prometer:

| OA | Verbo | Qué pide de verdad |
|----|-------|--------------------|
| 11 | *Asumir* sus deberes | que el niño cumpla |
| 12 | *Mostrar* actitudes y *realizar* acciones | que el niño se comporte |
| 13 | *Mantener* una conducta honesta | que el niño no haga trampa |
| 16 | *Participar* responsable y activamente | que el niño participe |

Un quiz de opción múltiple **no puede medir ninguna de esas cuatro cosas**. Puede medir si
el niño **reconoce cuál es la acción correcta**, que no es lo mismo: un niño puede marcar
"decir la verdad" y copiar en la prueba media hora después.

Esto importa porque el mapa de dominio le va a mostrar al profesor un porcentaje junto a
"Mantener una conducta honesta", y ese número **se puede leer como una nota de conducta**.
Es el mismo riesgo que ya está documentado para el mapa completo ("no sirve para
calificar"), pero aquí es más agudo, porque el objetivo habla de la persona y no de un
contenido.

**Recomendación:** incluir los cuatro, redactar sus preguntas como situaciones
("¿qué debería hacer Ana si…?"), y que `oa.json` lleve la advertencia por escrito —ya la
lleva, en el campo `nota_evaluacion`— para que llegue al panel cuando se muestre el texto
del objetivo.

**Decisión de Roberto.** La alternativa es dejarlos fuera y cubrir 12 de 16 OA, lo que es
más honesto pero deja de ser "año completo" y un colegio lo va a notar.

Un matiz parecido, más leve, afecta a los **OA 5 y 15**, que piden *investigar y comunicar*:
el juego puede evaluar el **contenido** de esa investigación (qué hacía un hoplita, qué hace
la Junaeb), no la habilidad de investigar.

## 3. Estructura de la campaña

Cinco capítulos y un Jefe Final, siguiendo las unidades oficiales. Cada etapa es un OA, y
cada capítulo cierra con su propio jefe de capítulo, igual que Matemática.

| Cap | Título | Unidad | OA | Etapas |
|-----|--------|--------|----|--------|
| 1 | Nuestro planeta | U1 | 06, 07, 08 | 3 + jefe |
| 2 | La antigua Grecia | U2 | 01, 05, 09, 10 | 4 + jefe |
| 3 | La antigua Roma | U3 | 02, 03, 04 | 3 + jefe |
| 4 | Mis deberes y mis derechos | U4 | 11, 13, 14 | 3 + jefe |
| 5 | Vivir juntos | U4 | 12, 15, 16 | 3 + jefe |

**Jefe Final** de 4 fases × 4 preguntas, cubriendo los 16 OA.

**Por qué la U4 se parte en dos:** seis OA en un capítulo lo harían el doble de largo que
los demás, y el corte cae natural —lo que le toca a uno mismo (deberes, honestidad,
derechos) frente a lo que le toca con los demás (convivencia, instituciones, participar)—.
Es el mismo criterio con que Matemática partió "Números y operaciones" en tres.

## 4. Banco de preguntas

**30 por OA = 480 preguntas**, la misma densidad que Matemática (que tiene 792 para 26 OA).
Nacen `revisada:false`, como todo contenido nuevo.

Formato idéntico al de Matemática 3°: `{oa, pregunta, opciones[4], correcta, tip, visual?,
revisada, id}` con ids `hist3-oaNN-N`. Etapas de 10 preguntas, jefe de capítulo de 15.

**Vocabulario y largo:** son niños de 8 años que recién leen de corrido. Enunciados cortos,
una idea por pregunta, sin subordinadas encadenadas, y ninguna palabra del OA oficial sin
explicar (un OA dice "archipiélago"; la pregunta tiene que enseñarlo, no darlo por sabido).

## 5. Apoyos visuales

Hoy el motor de 3° dibuja siete tipos por código (`contar`, `agrupar`, `fraccion`, `recta`,
`reloj`, `barras`, `cuerpo`). Historia necesita otros, y sin ellos **tres OA quedarían
preguntables solo de memoria**:

| Widget nuevo | Para qué | OA |
|--------------|----------|-----|
| `cuadricula` | ubicar algo por letra/número con la rosa de los vientos | 06 |
| `globo` | hemisferios, Ecuador, trópicos y polos sobre un esquema | 07 |
| `zonas` | las tres franjas climáticas del planeta | 08 |
| `linea` | línea de tiempo Antigüedad ↔ hoy | 04, 01, 02 |

Se dibujan con SVG por código, como los siete existentes: **sin archivos ni librerías**, y
así no dependen de que Roberto genere arte. Cada uno debe llevar su descripción
(`textoVisual`) para el lector de pantalla, **cuidando no delatar la respuesta**, como ya se
hizo en Matemática.

## 6. Ambientación

- **Villano propuesto: "El Olvido".** Borra lo que la gente recuerda; el jugador recupera la
  memoria del mundo. Encaja con la asignatura sin ser tétrico para 8 años, y da una
  ilustración clara (una figura de niebla que va borrando estatuas y mapas). Matemática 3°
  tiene "El Número Perdido", así que el registro es el mismo.
- **Arte:** 5 portadas de capítulo + el villano + su versión derrotada. Lo genera Roberto.
  Mientras no exista, los capítulos usan una portada genérica **declarada explícitamente**
  (`portadaMapa`), que es como quedó 3° tras corregir los 404 de la Sesión 57.
- **Recompensas del Jefe Final:** skin, insignia, corona y bono, como las demás campañas.
  La skin y la insignia necesitan nombre y arte.

## 7. Voz

La lectura por voz es lo que hace usable 3° para un niño que aún no lee de corrido, así que
Historia la necesita igual que Matemática. **Son unos 2.400 clips** (480 preguntas × 5
textos, menos los repetidos), con el mismo procedimiento ya montado: normalizador →
`es-CL-CatalinaNeural` a −10% → manifiesto por hash del texto.

**Cuesta plata de la cuenta Azure de Roberto: del orden de US$1,2.** No se genera sin que él
lo autorice, y conviene hacerlo **al final**, cuando el banco ya no vaya a cambiar: cada
pregunta que se corrija después obliga a regenerar su clip.

El normalizador va a necesitar reglas nuevas para esta asignatura: números romanos (`V`,
`X`), siglos, y años antes de Cristo (`480 a.C.` no se lee "a punto c punto").

## 8. Backend

**Nada nuevo.** `HI03` entra por el mismo camino que `MA03` en la Sesión 58: una línea en
`kimun_oa_asignatura`, el código en `kimun_prof_asignaturas`, y las tres entradas de
catálogo del panel (`OA_CARPETA`, `ASIG_NOMBRE`, `ASIG_ORDEN`) más el espejo `SB_asigDe`.
Requiere **re-aplicar `supabase/schema.sql`**.

## 9. Riesgos

- **El apoyo visual es código muerto hasta que un constructor copia el campo.** Ya pasó dos
  veces (el `oa` en la Sesión 23, el `visual` en la Sesión 55). Al agregar widgets hay que
  volver a comprobar los seis constructores.
- **Contenido histórico, no aritmético.** El auditor automático de Matemática verifica claves
  por cálculo; aquí eso no existe: **ninguna clave se puede verificar por script**. Toda la
  verificación de exactitud histórica es humana, o de un chequeo cruzado contra fuentes.
- **Sensibilidad.** La esclavitud aparece nombrada en el OA 5. Para 8 años se trata como
  "había personas que no eran libres y hoy eso está prohibido", sin detalle de violencia; el
  mismo criterio editorial con que se ilustró la conquista en 8°.

## 10. Decisiones abiertas (de Roberto)

1. **¿Se incluyen los 4 OA actitudinales?** Recomendación: sí, con la advertencia escrita.
2. **¿"El Olvido" como villano?** Necesita su arte.
3. **¿Se autoriza el gasto de la voz (~US$1,2)?** Solo al final, con el banco cerrado.
