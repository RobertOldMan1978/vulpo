# Arquitectura de construcción de etapas de VULPO (diseño objetivo)

**Qué es este archivo.** El **diseño de referencia** del flujo que va de un OA a una **etapa
ejecutable** de VULPO: planificar el OA → generar ~30 preguntas → auditar y mejorar cada una →
seleccionar y balancear el banco → auditar el banco → **construir la etapa** → revisión humana →
publicación. Es la vista a **nivel de OA/etapa**; su gemelo,
[`arquitectura-pipeline-preguntas.md`](arquitectura-pipeline-preguntas.md), es la vista a **nivel de
pregunta individual** (generar→validar→corregir una pregunta, contrato de datos, códigos de error,
estados). Comparten catálogo de errores, estados y el gate humano final.

> ⚠️ **Esto es un objetivo, no lo que hoy existe.** El estado real de VULPO es más simple y funciona:
>
> | Pieza de esta arquitectura | Cómo existe hoy |
> |---|---|
> | 1 OA = 1 etapa | ✅ Real: cada etapa de `EXPEDICIONES` mapea un OA (el jefe mezcla OA a propósito) |
> | Banco ~30 por OA | ✅ Real: `contenido/<asig>-<nivel>/preguntas.json`, ~30 por OA |
> | 10 por intento | ✅ Real: campo `n:10` por etapa; el jefe `n:15` |
> | Selección de las 10 | ⚠️ `pickN` = **azar puro** (`random.sample`), **sin** la "aleatoriedad controlada" de §17 |
> | Anti-memorización por intento | ⚠️ **Débil**: no se registra qué preguntas vio el alumno, así que **no prioriza las no vistas**; solo baraja |
> | Registro de intentos (`question_ids`, seed) | ❌ No existe (necesitaría estado por alumno en el servidor → Bloque D de `pendiente.md`) |
> | Construcción automática de la etapa | ❌ No existe: las etapas se **cablean a mano** en `EXPEDICIONES` |
> | Versionado de banco/etapa, métricas del proceso | ❌ No existen (git es el único historial) |
> | Gate humano antes de publicar | ✅ Real: la aprobación por muestreo (`revisada:true`), ver `aprobacion-pedagogica.md` |
>
> Automatizar la construcción de etapas y la aleatoriedad pedagógica es un proyecto grande, **no está
> en `pendiente.md`**, y parte de él (registro de intentos) **depende del Bloque D** (progreso en el
> servidor). Este documento es el norte para cuando se decida.

**Relación con los otros docs:** [`encargo-banco.md`](encargo-banco.md) (formato y ~30/OA por nivel),
[`prompt-generador-preguntas.md`](prompt-generador-preguntas.md) (generar),
[`prompt-validador-preguntas.md`](prompt-validador-preguntas.md) (auditar),
[`aprobacion-pedagogica.md`](aprobacion-pedagogica.md) (el gate humano real).

---

## 1. Principio fundamental

```text
NIVEL → ASIGNATURA → OA → ETAPA → BANCO DEL OA (~30) → 10 preguntas por intento
```

**1 OA = 1 ETAPA.** No mezclar preguntas de distintos OA en una etapa (excepción declarada: el nodo
jefe mezcla los OA del capítulo a propósito). Cada pregunta pertenece inequívocamente al OA de su
etapa.

## 2. Estructura de una etapa

```text
ETAPA
├── Identificación curricular: nivel, asignatura, unidad, eje, OA
├── Banco de preguntas: ~30
└── Configuración de ejecución: 10 por intento
```

**~30 es el tamaño de referencia del banco del OA**, no una cifra por ejecución.

## 3. El estándar ~30 por OA

Definido en [`encargo-banco.md`](encargo-banco.md). Los totales del proyecto sirven de comprobación
(3° 2.558/86 OA, 7° 2.430/81, 8° 2.314/69 ≈ 30–33 por OA). No sustituir el estándar por 10, 15, 20 ni
50 salvo configuración explícita. Se permiten pequeñas variaciones alrededor de 30 por generación,
auditoría o disponibilidad, manteniendo ~30 como objetivo.

## 4. El pipeline

```text
OA → PLANIFICACIÓN → GENERACIÓN (~30) → AUDITORÍA INDIVIDUAL → MEJORA/REGENERACIÓN
   → REAUDITORÍA → SELECCIÓN Y BALANCE → AUDITORÍA DEL BANCO → CONSTRUCCIÓN DE LA ETAPA
   → REVISIÓN HUMANA → APROBACIÓN → PUBLICACIÓN
```

Resultado: una etapa funcional de VULPO asociada a **un único OA**.

## 5. Fase 1 — Planificación del OA

Antes de generar, un plan con: `stage_id`, nivel, asignatura, unidad, eje, oa,
`cantidad_objetivo_banco` (≈30), `preguntas_por_intento` (=10), habilidades, dificultades, tipos de
pregunta, requisitos de lectura. Las ~30 deben representar adecuadamente el OA.

## 6. Fase 2 — Generación del banco

El objetivo es **~30 preguntas aprobadas**. Puede requerir generar más de 30 inicialmente por los
rechazos de la auditoría (ej.: generar 40 → 32 aprobadas → 30 seleccionadas). **30 es el objetivo del
banco aprobado, no la cantidad a generar inicialmente.**

## 7. Regla de pertenencia

Toda pregunta pertenece a **un único OA** (`Pregunta → OA1`, `Etapa → OA1`). No aceptar
`Pregunta → OA1 + OA2` como pertenencia normal.

## 8. Auditoría individual

Cada pregunta se audita (alineación curricular, OA, nivel, contenido, habilidad, corrección,
claridad, dificultad, lectura, respuesta, alternativas, distractores, retroalimentación, sesgos,
integridad técnica), con el sistema de **códigos de error** de VULPO
([`prompt-validador-preguntas.md`](prompt-validador-preguntas.md)).

## 9. Mejora automática

`GENERADA → AUDITADA → REVISAR → MEJORAR → REAUDITAR`. Una pregunta corregida **no** vuelve
automáticamente al banco: debe superar la auditoría de nuevo.

## 10. Regeneración

Ante un error estructural o conceptual no seguro de reparar (OA incorrecto, error matemático
fundamental, respuesta incorrecta, información insuficiente, pregunta conceptualmente inválida), se
**regenera** — manteniendo el mismo OA.

## 11. Conformación del banco

Seleccionar las ~30 finales buscando: cobertura del OA, diversidad, dificultad equilibrada, variedad
de habilidades, variedad de contextos, sin duplicados ni preguntas excesivamente similares, y calidad
pedagógica. **No** tomar simplemente las primeras 30 aprobadas.

## 12. Auditoría del banco

Auditoría global del conjunto de ~30: cobertura del OA, diversidad, redundancia (¿demasiadas iguales?),
distribución de dificultad, variedad de habilidades y estándar homogéneo de calidad.

## 13. El banco NO es la etapa ejecutable

```text
BANCO (~30 disponibles) → ETAPA (10 por intento)
```

No convertir el banco completo en las preguntas de un único intento.

## 14. Ejecución de la etapa

```text
stage_id → identificar OA → obtener banco aprobado → seleccionar 10 → crear intento → presentar
```

Las 10 salen **exclusivamente** del banco de ese OA.

## 15. Repetición de la etapa

`MISMO OA · MISMA ETAPA · MISMO BANCO · NUEVA SELECCIÓN DE 10`. Priorizar preguntas que el alumno
no haya usado recientemente, si hay suficientes disponibles.

## 16. Objetivo anti-memorización

El banco de ~30 evita que la etapa se transforme en memorizar 10 preguntas fijas. No hace falta
garantizar que jamás se repita una pregunta; el objetivo es **reducir la repetición inmediata** y que
memorizar un intento no resuelva fácilmente los siguientes.

> **Realidad hoy:** `pickN` baraja y toma 10 al azar del banco del OA en cada intento. Cumple lo
> mínimo (dos intentos rara vez traen las mismas 10), pero **no** prioriza las no vistas (no hay
> registro de lo visto). El salto a §15/§17 exige el registro de intentos (§18) y estado por alumno.

## 17. Aleatoriedad controlada

**No** usar azar puro (`random.sample(pool, 10)` sin restricciones). La selección debe considerar
dificultad, habilidad, cobertura, uso anterior, diversidad y restricciones pedagógicas:
**aleatoriedad controlada pedagógicamente.**

## 18. Registro de los intentos

Cuando la arquitectura lo permita, registrar: `student_id`, `stage_id`, `attempt_id`,
`attempt_number`, `question_ids`, `random_seed`, `created_at`. Permite saber qué recibió el alumno,
evitar repeticiones, reconstruir un intento, auditar resultados y analizar comportamiento. *(Requiere
estado por alumno en el servidor → Bloque D de `pendiente.md`.)*

## 19. Construcción real de la etapa

Tras aprobar el banco, construir los **artefactos** para que la etapa exista dentro del código de
VULPO. La salida **no** puede quedar solo como `preguntas.json`: debe producir la configuración o
archivos que VULPO usa para ejecutar la etapa, **respetando la arquitectura existente** (hoy: una
entrada en `EXPEDICIONES` con su `oa`, `nombre`, `icono`, `n`).

## 20. Identificación de la etapa

Inequívoca por `stage_id` + nivel + asignatura + oa (ej. conceptual `MAT-05-OA03`). No crear dos
etapas para el mismo OA salvo que la planificación oficial lo establezca.

## 21. Versionado

Mantener versiones de banco (`Banco v1/v2/v3`) y de etapa (`Etapa v1/v2/v3`). Una modificación no
destruye silenciosamente la versión anterior.

## 22. Revisión humana

El sistema se **detiene antes de publicar** y entrega al responsable: la etapa, el OA, las ~30
seleccionadas, el resultado de auditoría, observaciones, métricas y la configuración de 10 por
intento. La persona revisa y aprueba o pide cambios.

## 23. Decisión humana (estados)

`READY_FOR_HUMAN_REVIEW` → `HUMAN_APPROVED` / `HUMAN_APPROVED_WITH_CHANGES` / `HUMAN_REJECTED` →
`PUBLISHED`. La IA prepara, audita, mejora y **recomienda**; **la decisión de publicación es humana.**

## 24. Regla de integridad

Nunca usar una pregunta de otro OA en una etapa: `question.oa == stage.oa` debe cumplirse antes de
usarla. *(En VULPO esto es real: `buildPreguntas` saca del `POOL[oa]` de la etapa; el único caso de
mezcla es el nodo jefe, por diseño.)*

## 25. Métricas del proceso

Por OA: `preguntas_generadas`, `_rechazadas`, `_mejoradas`, `_aprobadas`, `_seleccionadas`,
`intentos_promedio_de_generacion`, `errores_por_categoria`, `puntaje_promedio`. Por etapa:
`cantidad_banco`, `preguntas_por_intento`, `cantidad_intentos_alumno`, `repeticiones`, `diversidad`.

## 26. Criterio de éxito

```text
1 OA → ~30 auditadas → banco equilibrado → auditoría del conjunto superada
     → etapa construida → 10 por intento → lista para revisión humana
```

## 27. Principio final

- **El OA es la unidad pedagógica.**
- **La etapa es la unidad de ejecución.**
- **El banco de ~30 es el mecanismo de variación.**
- **Las 10 preguntas son la unidad de cada intento.**

```text
OA → 1 ETAPA → ~30 PREGUNTAS → 10 POR INTENTO → NUEVA COMBINACIÓN AL REPETIR
```

Pipeline: **construir → auditar → mejorar → reauditar → seleccionar → auditar el banco → construir la
etapa → preparar para revisión humana.** El resultado queda integrado en VULPO como una etapa real y
ejecutable, no solo como un banco almacenado. **La decisión final de publicación siempre es humana.**
