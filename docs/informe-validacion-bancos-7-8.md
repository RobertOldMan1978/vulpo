# Informe de validación de los bancos de 7° y 8° básico

**Fecha:** 2026-08-28 · **Método:** el pipeline de calidad de VULPO (Nivel 2 determinista sobre el
banco completo + Nivel 1 pedagógico por muestreo con el validador V2). **Alcance:** las 8 asignaturas
de 7° y 8° (2.430 + 2.314 = 4.744 preguntas).

> **Qué NO es este informe.** No reemplaza la aprobación pedagógica humana (`aprobacion-pedagogica.md`):
> en VULPO una pregunta solo se firma `revisada:true` cuando la revisa Roberto. El Nivel 1 es un
> **muestreo** con un validador de IA (independiente, resolviendo cada pregunta por su cuenta); caza
> OA sistemáticamente mal escritos y claves equivocadas evidentes, no garantiza cada pregunta suelta.

---

## Resultado en una línea

**Los dos bancos están en muy buen estado. Cero errores estructurales, cero claves equivocadas y cero
problemas mayores en toda la muestra. Los 22 hallazgos son todos menores (estilo y calibración fina),
ninguno bloqueante.**

---

## Nivel 2 — auditoría determinista (banco completo, las 4.744 preguntas)

Scripts `auditar-banco-nivel.py`, `auditar-numerico.py`, `auditar-solape-oa.py`:

- **0 errores estructurales** en los 8 bancos: 4 opciones distintas, `correcta` en rango, `tip`
  presente, `oa` existente, y **posición de la respuesta correcta balanceada** (~25% en cada una).
- **0 preguntas con dos respuestas correctas** por valor numérico (Matemática y Ciencias).
- **Casi-duplicados entre OA distintos:** 4 pares en 7°, 11 en 8° (a mirar; pueden ser legítimos si
  miden operaciones distintas — el script solo los señala).
- Únicos avisos: enunciados que pasan el **límite blando** de 120 caracteres (ninguno pasa el duro de
  250). Es una nota de estilo, no un defecto.

## Nivel 1 — validación pedagógica por muestreo (validador V2)

Ocho revisores independientes (uno por asignatura y curso), ~2 preguntas por OA, cada uno resolviendo
la pregunta por su cuenta antes de mirar la clave.

| Curso | Asignatura | Muestra | Aprobadas | A revisar (menores) | Críticos | Mayores |
|---|---|---:|---:|---:|---:|---:|
| 8° | Matemática | 34 | 34 | 0 | 0 | 0 |
| 8° | Historia | 44 | 40 | 4 | 0 | 0 |
| 8° | Ciencias | 30 | 23 | 7 | 0 | 0 |
| 8° | Lenguaje | 34 | 30 | 4 | 0 | 0 |
| 7° | Matemática | 38 | 38 | 0 | 0 | 0 |
| 7° | Historia | 46 | 44 | 2 | 0 | 0 |
| 7° | Ciencias | 54 | 52 | 2 | 0 | 0 |
| 7° | Lenguaje | 48 | 45 | 3 | 0 | 0 |
| **Total** | | **328** | **306** | **22** | **0** | **0** |

**Ningún crítico ni mayor en 328 preguntas revisadas.** Cada revisor recalculó/verificó de forma
independiente: en Matemática se rehízo cada operación (signos, fracciones, %, potencias, Pitágoras,
transformaciones); en Ciencias e Historia se contrastó cada clave contra el conocimiento de la materia
(fechas, procesos, definiciones, corrección científica); en Lenguaje se verificó que la respuesta se
derive del fragmento dado.

### Hallazgos menores, por tipo (22 en total)

- **Distractores algo flojos (varios):** opciones incorrectas demasiado obvias, resolubles por
  descarte, en algunas preguntas de Historia 8° (Geografía, `hist8-oa22-004`, `hist8-oa21-004`),
  Lenguaje 8° (`leng8-oa02-024`, `leng8-oa07-018`) y Matemática 8° (`mate8-oa16-008`). No invalidan la
  pregunta; se pueden endurecer en una pasada de pulido.
- **Ítems de nivel básico bajo un OA más exigente:** algunos ítems de recuerdo/vocabulario conviven
  con OA que piden análisis (ej. Lenguaje 8° `leng8-oa03-018/015`). Patrón ya conocido del proyecto
  (bancos enriquecidos con ítems de mayor orden sobre una base más simple).
- **Cobertura curricular tangencial:** en Ciencias 8°, algunas preguntas evalúan el contenido correcto
  pero no la arista exacta del OA (parte histórica de OA01, uso predictivo de la tabla periódica en
  OA14). Correcto, encaje un poco laxo.
- **Interpretaciones/juicios con matiz:** un par de afirmaciones historiográficas presentadas sin
  matiz (Historia 8° `hist8-oa05-024`, `hist8-oa04-005`; Historia 7° `hist7-oa16-18`, `hist7-oa06-22`)
  e inferencias/juicios estéticos algo abiertos en Lenguaje 7° (`leng7-oa02-16`, `-oa04-16`,
  `-oa13-16`). Aceptables para el nivel; candidatos a una segunda mirada.

### Nota especial — OA sensibles CN07 OA 01/02/03 (Ciencias 7°: sexualidad, reproducción, ITS)

Se revisaron con **doble densidad** (6 preguntas de cada uno). Resultado: **factualmente correctos y
con trato apropiado** — siempre en tercera persona (nunca sobre el cuerpo/conducta del alumno), sin
lenguaje estigmatizante (el ítem de "grupos de riesgo" enseña que el riesgo depende de la práctica, no
del grupo), y con distinciones clínicas correctas (VIH ≠ sida, bacteriana curable vs. viral
controlable, preservativo como única barrera que también reduce ITS). Los únicos 2 "a revisar" de todo
Ciencias 7° son dos ítems de esos OA que rozan lo valórico (`cie7-oa01-26`, `cie7-oa02-26`) — el propio
`oa.json` ya los anticipa como "parcialmente actitudinales". **Buena base para tu conversación con el
colegio (A4):** el contenido es sólido; lo que queda es el acuerdo institucional, no un arreglo de
contenido.

---

## Conclusión y recomendaciones

1. **7° y 8° están listos para la aprobación pedagógica humana (A1) sin bloqueadores de contenido.**
   Esta validación no encontró nada que obligue a re-generar o corregir antes de que Roberto firme.
2. **Los 22 hallazgos menores son opcionales:** una pasada de pulido de distractores flojos y de
   reemplazo de algún ítem básico subiría la calidad, pero no es urgente ni bloquea el lanzamiento.
3. **Revisar (fuera del muestreo)** los 15 pares de casi-duplicados entre OA (4 en 7°, 11 en 8°) que
   marcó `auditar-solape-oa.py`, por si dos OA quedan midiéndose con la misma pregunta.
4. **8° ya está `revisada:true`; 7° aún no** — este informe respalda avanzar su aprobación con
   confianza, pero la firma sigue siendo humana (el dato lo reporta la validación de IA, que es una
   ayuda, no la autoridad final).

**Límite del método:** muestreo (~2/OA) + IA. Cubre el 100% de los OA de 7° y 8°, pero no cada
pregunta; y una IA puede pasar por alto un matiz de materia que un profesor de aula sí ve. Por eso el
gate final sigue siendo la aprobación humana.
