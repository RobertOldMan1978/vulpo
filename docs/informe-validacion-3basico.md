# Informe de validación COMPLETA del banco de 3° básico

**Fecha:** 2026-08-28 · **Método:** el pipeline de calidad de VULPO. **Alcance: COMPLETO** — Nivel 2
determinista sobre las 2.558 preguntas + Nivel 1 pedagógico **pregunta por pregunta** (no muestreo),
con 23 revisores independientes aplicando el validador V2, con foco en niños de 8-9 años.

> **Por qué completo y no muestreo:** 3° es para niños de 8-9 años (lectura inicial, voz pregrabada,
> apoyo visual). Por la edad, se revisó **cada una de las 2.558 preguntas**, no una muestra.
> **Este informe no reemplaza la aprobación humana** (`aprobacion-pedagogica.md`): la firma
> `revisada:true` sigue siendo de Roberto. Es una ayuda de alta cobertura, no la autoridad final.

---

## Resultado en una línea

**El banco de 3° está en muy buen estado: 0 claves equivocadas en las 2.558 preguntas y 0 problemas
de audibilidad (crítico para el niño que escucha). El único punto que conviene corregir antes de que
llegue a niños es un grupo de preguntas de fracciones (OA11) de Matemática; el resto son detalles
menores.**

---

## Nivel 2 — auditoría determinista (banco completo, 2.558 preguntas)

- **Audibilidad (propia de 3°, la más importante): PERFECTA.** 0 preguntas con opciones que suenan
  igual al escucharlas (tildes, mayúsculas, ge/je, números escritos de dos formas). El niño que usa
  el botón 🔊 nunca se topa con una pregunta irresoluble por oído.
- **0 errores estructurales** en Matemática, Historia y Ciencias; posición de la clave balanceada;
  todos los `visual` de tipo conocido y bien formados.
- **0 preguntas con dos opciones de igual valor numérico** (Matemática).
- **1 error de longitud dura:** `len3-oa23-28` tiene un enunciado de **231 caracteres** (pasa el
  tope duro de 220 para niños). Hay que **acortarlo**.
- **~200 avisos de enunciado sobre el límite blando** (110 caracteres para 3°) — estilo, no defecto;
  conviene mirarlos si se quiere aligerar la lectura.
- **16 pares de casi-duplicados entre OA distintos** (Lenguaje 3° tiene OA en dos capítulos) — a
  revisar por si dos OA quedan midiéndose con la misma pregunta.

## Nivel 1 — validación pedagógica COMPLETA (pregunta por pregunta)

| Asignatura | Preguntas | Aprobadas | A revisar | Críticos | Rechazadas |
|---|---:|---:|---:|---:|---:|
| Matemática | 792 | 780 | 12 | 0 | 0 |
| Historia | 480 | 480 | 0 | 0 | 0 |
| Ciencias | 390 | 390 | 0 | 0 | 0 |
| Lenguaje | 896 | 896 | 0 | 0 | 0 |
| **Total** | **2.558** | **2.546** | **12** | **0** | **0** |

**Cero claves equivocadas en las 2.558.** Cada revisor resolvió cada pregunta por su cuenta antes de
mirar la respuesta: en Matemática se recalculó cada operación; en Ciencias/Historia se verificó cada
hecho (incluida flora nativa chilena, geografía, sistema solar); en Lenguaje se comprobó que la
respuesta salga del texto dado. **Historia, Ciencias y Lenguaje quedaron 100% aprobadas.**

### Los 12 puntos a revisar (todos en Matemática)

**1. OA11 — Fracciones (el hallazgo principal, 9 preguntas). Conviene corregir antes de publicar.**
- **Nivel fuera de 3° (7):** `mat3-oa11-7, -8, -9, -10, -11, -12, -13` piden **equivalencia/simplificación**
  de fracciones con denominadores 6, 8, 9 y 12 (ej. 3/6, 2/8, 6/8, 3/12, 3/9). El OA oficial (MA03 OA
  11) solo pide comparar fracciones **de igual denominador** y con denominadores {2, 3, 4}; simplificar
  con 9 y 12 es habilidad de **4°-5°** y difícil de resolver mentalmente a los 8-9 años. *Los cálculos
  están bien; el problema es de nivel.* Se sugiere bajarlas a denominadores 2/3/4 o moverlas a un banco
  de nivel superior.
- **Distractor mayor que la respuesta correcta (2):** `mat3-oa11-16` y `mat3-oa11-18` preguntan "¿cuál
  es mayor?" (respuesta 3/4) pero incluyen entre las opciones **4/4 (=1) y 4/3 (≈1,33)**, que son
  numéricamente **mayores** que la clave. Un niño que interprete "la fracción más grande de las cuatro"
  elegiría esas. Se sugiere reemplazar esos distractores por fracciones menores que 3/4.
- *(Menor: `mat3-oa11-14` usa 4/4 como clave, fuera de la lista de "fracciones de uso común" del OA.)*

**2. Retroalimentación que confunde (2, la clave es correcta pero el `tip` explica mal):**
- `mat3-oa03-7`: el `tip` habla de "comparar decenas" cuando lo que decide es la **centena** (209 vs
  199). Un niño que siga la explicación se confunde.
- `mat3-oa03-18`: el `tip` explica por qué 88 es menor que los números de 3 cifras, pero **no** por
  qué es menor que 98. Incompleto.

**3. Sensibilidad por edad (1):** `mat3-oa22-16` pregunta "¿cuánto pesa un niño de **8 años**?"
(respuesta correcta, ~28 kg). Al ser justo la edad del jugador, un niño podría sentirse comparado.
Se sugiere cambiar el referente (ej. "un perro grande", "una guagua").

**4. Ambigüedad de redacción (1):** `mat3-oa26-25` ("Sobre el 0 hay 3 puntos, ¿qué significa?") no
dice qué se está contando; la respuesta exige inferir el contexto. Se sugiere explicitarlo.

### Lo que salió especialmente bien (por la edad)

- **Trato cuidadoso de temas sensibles** en las 4 asignaturas: esclavitud en Grecia/Roma, maltrato
  infantil y discriminación (Historia), seguridad ocular en eclipses y "preguntar a un adulto antes
  de usar una planta como remedio" (Ciencias), pérdidas suaves en poesía (Lenguaje) — todo con enfoque
  educativo, **sin dramatismo ni detalle perturbador**, y siempre planteado sobre un tercero con
  nombre, nunca sobre la conducta del propio niño.
- **Distractores calibrados a errores típicos de niño** (olvidar una decena al "llevar", confundir
  perímetro con área), no trampas.
- **Los apoyos visuales por código** (rectas, cuadrículas, cuerpos, barras) calzan con su pregunta en
  el 100% de los casos revisados; ningún dibujo contradice o vuelve irresoluble la pregunta.

---

## Conclusión y recomendaciones

1. **3° está muy bien, con una excepción concreta y acotada:** el grupo de **fracciones (OA11) de
   Matemática** (9 preguntas). Conviene **corregirlo antes de que llegue a niños** — es contenido de
   nivel superior y dos ambigüedades reales.
2. **Arreglos puntuales, rápidos:** los 2 `tip` que confunden (`mat3-oa03-7`, `-18`), el referente de
   `mat3-oa22-16` (sensibilidad), la redacción de `mat3-oa26-25`, y el enunciado largo `len3-oa23-28`.
3. **Historia, Ciencias y Lenguaje:** sin cambios necesarios de contenido (0 a revisar en 1.766
   preguntas). Listas para la aprobación humana.
4. **Fuera del muestreo:** revisar los 16 pares de casi-duplicados entre OA.

**Cobertura del método:** esta vez fue **completo** (las 2.558, no una muestra), así que el margen de
"pregunta suelta no vista" no aplica al contenido; el límite que queda es el propio de una IA (puede
pasar por alto un matiz que un profesor de aula sí ve). El gate final sigue siendo la firma humana.

### Lista rápida de ids a corregir en Matemática
`mat3-oa11-7, -8, -9, -10, -11, -12, -13` (nivel) · `mat3-oa11-16, -18` (distractor mayor) ·
`mat3-oa11-14` (clave 4/4) · `mat3-oa03-7, -18` (tip) · `mat3-oa22-16` (sensibilidad) ·
`mat3-oa26-25` (contexto). Más `len3-oa23-28` (enunciado largo, Lenguaje).

---

## Ajustes aplicados (2026-08-28)

Todos los hallazgos anteriores **se corrigieron** en los bancos (`contenido/matematicas-3basico/` y
`contenido/lenguaje-3basico/`) y se re-verificó el Nivel 2: **0 errores estructurales, 0 problemas de
audibilidad, 0 dobles-correctas**. Los bancos siguen `revisada:false` (la firma humana pendiente no
se toca). Detalle de cada cambio:

**OA11 — Fracciones (Matemática):**
- `mat3-oa11-7…13` (7 preguntas): el apoyo visual pasó a denominadores **2, 3 o 4** (antes 6/8/9/12),
  manteniendo la misma respuesta correcta (la mitad, un cuarto, un tercio, dos tercios, tres cuartos)
  y con `tip` directo ("Está pintada 1 de 4 partes iguales: un cuarto"). Ya no exige equivalencia de
  4°-5°: queda dentro del OA11.
- `mat3-oa11-16` y `-18`: se reemplazaron los distractores **mayores** que la respuesta correcta
  (4/4, 4/3) por fracciones **menores** que 3/4. Ahora 3/4 es inequívocamente la mayor.
- `mat3-oa11-14`: dejó de usar 4/4 como clave; ahora muestra 3/4 con distractores que son fracciones
  de uso común (1/4, 1/2, 2/3).

**Retroalimentación (Matemática):**
- `mat3-oa03-7`: `tip` corregido — ahora explica que 209 gana por tener **más centenas** (antes hablaba
  erróneamente de decenas).
- `mat3-oa03-18`: `tip` completado — ahora explica también por qué 88 < 98 (menos decenas), no solo
  frente a los números de 3 cifras.

**Sensibilidad por edad (Matemática):**
- `mat3-oa22-16`: el referente pasó de "un **niño de 8 años**" a "un **perro grande**" (misma respuesta,
  28 kg). Un niño ya no se compara con la pregunta.

**Redacción (Matemática):**
- `mat3-oa26-25`: se agregó el contexto ("gráfico de puntos sobre las **mascotas** de cada niño"), así
  la respuesta no exige adivinar qué se contaba.

**Longitud (Lenguaje):**
- `len3-oa23-28`: enunciado acortado de **231 a 194 caracteres** (bajo el tope duro de 220), sin perder
  el sentido ni la respuesta.

**Casi-duplicados entre OA (16 pares): revisados, sin cambios.** Son **variedad de plantilla**, no
duplicación real: los de similitud 1.00 en Matemática (ej. "Un número tiene N centenas, N decenas y N
unidades") son la misma estructura con **números distintos** (el script neutraliza los números al
comparar), así que tienen respuestas diferentes; los de Lenguaje son situaciones parecidas legítimas en
OA distintos (buscar una palabra, contar estrofas). Quedan listados para tu criterio; no se tocaron
para no reducir la cobertura.

> **Verificación de los ajustes:** por los scripts de Nivel 2 (estructura, audibilidad, numérico) y por
> inspección de cada pregunta corregida (opciones/clave/visual/tip coherentes). Cambios de datos solamente
> (no se tocó código); la app de 3° sirve el mismo JSON.
