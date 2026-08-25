# El siguiente paso al fallar (retroalimentación formativa, grupo A)

**Fecha:** 2026-08-25
**Estado:** diseño aprobado, pendiente de plan de implementación.
**Fundamento pedagógico:** [`docs/fundamento-evaluacion-formativa.md`](../../fundamento-evaluacion-formativa.md), §7.

## Motivación

El MINEDUC pide que la retroalimentación **no se limite a corregir el error**, sino que
*"guíe a los estudiantes para solucionar y evitar sus errores"* (Orientaciones de Evaluación y
Retroalimentación, 2021, p. 49) y evite *"solucionar el problema o corregir el error del
estudiante"* (p. 49). Hoy VULPO, al fallar, solo revela la respuesta correcta y una explicación.
Este diseño agrega dos cosas sobre ese momento:

1. **Un comodín 50/50** que da andamiaje antes de revelar (el MINEDUC habla de "guiar" mediante
   apoyos; p. 12).
2. **El siguiente paso al reprobar una etapa:** en vez de solo "Reintentar", ofrecer aprender el
   objetivo (mini-clase en Matemática; repaso sin presión en las demás).

Es el primero de tres grupos de mejoras de retroalimentación. Los otros dos (encuadre del
objetivo; metacognición al cerrar) se diseñan aparte.

## Alcance

- **Sí:** etapas de campaña de las 4 asignaturas (Historia, Ciencias, Lenguaje y las expediciones
  de Matemática `mate-exp-*`), en **Modo Normal**.
- **No:** Jefes Finales (multi-fase y el 5.º nodo de expedición), Duelo, Desafío de refuerzo,
  Modo Difícil, práctica de las lecciones de Matemática, y los bancos de apoyo (Vocabulario,
  Lectura·Ana Frank).

No hay cambios de backend (Supabase). Todo vive en `juego/index.html`.

## Parte 1 — Comodín 50/50 (pista antes de revelar)

### Comportamiento

- En la pantalla de pregunta (`scr-quiz`) aparece un botón **"💡 Ayuda (N)"** con un contador.
- **2 comodines por etapa.** El contador arranca en 2 y baja al usarse; el botón se deshabilita
  en 0, o cuando la pregunta ya fue respondida.
- Al usarlo: se **eliminan dos de las tres opciones incorrectas** (al azar), dejando la correcta
  y una incorrecta. Las opciones eliminadas se atenúan/inhabilitan (no se pueden pinchar).
- El comodín solo actúa **antes de responder**.

### Dónde aparece (y dónde no)

Se muestra únicamente cuando: la pantalla es `scr-quiz`, `MODO==='normal'`, no es lección
(`!Q.leccion`), no es desafío (`!Q.desafio`), no es repaso (`!Q.repaso`) y **no es el nodo jefe**
de la expedición (`Q.lvl !== N_ETAPAS-1`). En cualquier otro contexto el botón no se dibuja.

### Efecto en la medición del profesor

Una pregunta respondida **con comodín no se mide**: cuenta para pasar la etapa, las estrellas y
el XP, pero **no llama a `registrarOA`**, de modo que no toca `resp_1`/`ok_1` (primer intento) ni
el acumulado. Así el mapa de dominio sigue reflejando lo que el alumno sabe **sin** ayuda.

- Implementación: un flag por pregunta `Q.asistidaActual`, puesto en `false` en `pintaPregunta`
  y en `true` cuando se usa el comodín. En `responder`, la llamada a `registrarOA` se condiciona:
  `if(!Q.desafio && !Q.asistidaActual) registrarOA(P&&P.oa, ok);`.

### Por qué 2 × 50/50 (decisiones tomadas)

- **50/50 y no "borrar una opción" (4→3):** borrar una sola se siente flojo, el niño no lo
  percibe como ayuda y casi no cambia la decisión. El 50/50 es el comodín reconocible.
- **Tope de 2, no por costo de monedas:** el niño que va fallando es el que necesita el comodín;
  cobrarlo lo dejaría afuera. La escasez la da el tope, no el bolsillo. Gratis.
- **No en Difícil ni en jefes:** su gracia es la exigencia; el comodín es para aprender una
  etapa, no para ganar una pelea.

## Parte 2 — El siguiente paso al reprobar una etapa

Cuando el alumno **no pasa** una etapa **de un solo OA** (nodos 1 a N−1, bajo el umbral: 66%
Normal), la pantalla de resultado de etapa reprobada muestra, además del botón
**"🔁 Reintentar"** ya existente, el siguiente paso descrito abajo.

**El 5.º nodo (jefe de la expedición) queda fuera:** mezcla los 4 OA de la ruta, así que un
repaso "de un OA" no aplica; ese nodo conserva solo "Reintentar". El siguiente paso es siempre
sobre **un** objetivo.

### Encabezado: el objetivo en lenguaje de niño (versión mínima)

Una línea **"Estás practicando: ‹nombre de la etapa›"**, reutilizando el `nombre` de la etapa
que ya existe en `EXPEDICION` (p. ej. "Enteros", "La célula"). No se inventa contenido nuevo. El
texto amable propiamente por OA es el **grupo B** (encuadre del objetivo) y enriquecerá esta
línea más adelante.

### Botón primario según la asignatura

- **Matemática (`mate-exp-*`):** **"📘 Repasar la mini-clase"** → abre la lección de esa unidad
  (el contenido de enseñanza ya existe en `lecciones.json`). Al terminar/volver, regresa a la
  pantalla de etapa reprobada para reintentar.
  - Requiere un mapa **expedición → lección** (`mate-exp-numeros` → lección de Números, etc.).
    Se define en datos, junto a la definición de las expediciones de Matemática.
- **Historia, Ciencias, Lenguaje:** **"🧑‍🏫 Repasar sin presión"** → **modo repaso** (ver abajo).

### El modo repaso (flag `Q.repaso`)

Hermano de `Q.leccion` / `Q.desafio`, reusa el motor de quiz con estas diferencias:

- **10 preguntas del OA de la etapa, siempre distintas de las 10 que aparecieron en la etapa
  recién fallada** (se excluyen esas 10 del sorteo). Igual cantidad que una etapa. Es siempre
  posible: el OA más chico tiene 28, la etapa usó 10, quedan ≥18 para sortear 10 (ver más abajo).
  Si el alumno falla y repasa varias veces, cada repaso excluye las 10 de *esa* ronda; puede
  reaparecer una de un repaso anterior, pero **nunca** las de la etapa que viene de fallar.
- **Sin cronómetro** y **sin poder reprobar**: es estudio, no evaluación.
- Al fallar, muestra la explicación (como hoy) y un botón para continuar; al acertar, sigue.
- **No mide dominio:** el repaso **no llama a `registrarOA`** en ninguna pregunta.
- **No hay comodín** en el repaso (ya es de baja presión).
- Al terminar, vuelve a la pantalla de etapa reprobada, desde donde el alumno reintenta la etapa
  real.

### Suficiencia del banco (verificado 2026-08-25)

Cada OA de las 4 asignaturas de campaña tiene **28 a 53 preguntas** (mínimo 28: Historia OA02,
OA03, OA13). Una etapa saca 10; el repaso saca otras 10 **excluyendo esas 10** → necesita 10 de
un remanente de ≥18, lo que **siempre alcanza** incluso en el OA más chico (28−10=18). El
reintento de la etapa real vuelve a sortear del OA completo. Además, **las opciones se rebarajan
en cada pregunta**, así que memorizar "la opción B" no funciona. Si alguna vez se quisiera que
también los repasos sucesivos fueran todos distintos entre sí, la acción sería **ampliar el
banco** del OA, no acortar el repaso.

### Por qué en los libros no hay repaso

Los bancos de apoyo son chicos: Ana Frank tiene **9 preguntas por tramo**, Vocabulario 30 por
área. Con 9, un repaso se solaparía casi entero. En Vocabulario y Lectura el siguiente paso es
solo **"Reintentar"** (ahí reintentar ya es avance).

## Superficie del cambio (resumen)

- **Datos:** mapa `mate-exp-* → lección` (para el botón de mini-clase).
- **Estado de quiz (`Q`):** flags `Q.asistidaActual` (comodín) y `Q.repaso` (modo repaso).
- **`scr-quiz`:** botón "💡 Ayuda (N)" y su lógica de 50/50; condición de visibilidad.
- **`responder`:** exclusión de `registrarOA` cuando la pregunta fue asistida o es repaso.
- **Pantalla de etapa reprobada:** encabezado con el objetivo + botón primario por asignatura
  (mini-clase en Matemática / repaso en las demás), junto al "Reintentar" actual.
- **Motor de repaso:** arranque sin cronómetro, sin reprobar, sin medir, con retorno a la etapa.
  Recibe los ids de las 10 preguntas de la etapa fallada (ya están en `Q.preguntas`) para
  **excluirlas** al sortear las 10 del repaso.
- **Backend:** ninguno.

## Riesgos y cuidados

- **Reentrada / timers:** el repaso y el comodín tocan el ciclo del quiz. Cuidar los `setTimeout`
  huérfanos y los guards de pantalla, como ya se hizo en la Sesión 33 (`Q._avanzarT`, guard de
  `avanzar`).
- **Navegación de la mini-clase:** abrir la lección desde la pantalla de reprobado y volver al
  lugar correcto (no a la campaña completa) es el punto más delicado; definir el retorno explícito.
- **QA / modo prueba / efímero:** el comodín y el repaso deben respetar `EFIMERO` (no medir) — ya
  cubierto porque `registrarOA` retorna temprano en `EFIMERO`, pero el repaso además no llama a
  `registrarOA` en absoluto.
- **No regresión de la medición:** verificar que una etapa jugada **sin** comodín sigue midiendo
  exactamente igual que hoy.
