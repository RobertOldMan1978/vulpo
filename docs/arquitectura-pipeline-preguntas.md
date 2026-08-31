# Arquitectura del pipeline de preguntas de VULPO (diseño objetivo)

**Qué es este archivo.** El **diseño de referencia** de un sistema para generar, validar, corregir,
versionar y almacenar preguntas de 3° a 8° básico como un **pipeline** (generar → verificar →
corregir → verificar de nuevo → aprobar → publicar → medir), y no como una sola llamada a una IA.

> ⚠️ **Esto es un objetivo, no lo que hoy existe.** Léelo como norte, no como descripción del
> sistema actual. **Hoy VULPO NO tiene este pipeline.** El estado real es deliberadamente más
> simple y funciona así:
>
> | Pieza de esta arquitectura | Cómo existe hoy en VULPO |
> |---|---|
> | Motor curricular | Los `oa.json` por asignatura/nivel (`esquema-oa-json.md`) |
> | Generador IA | Agentes que escriben **tandas por OA**, guiados por `prompt-generador-preguntas.md` y `encargo-banco.md` |
> | Banco de preguntas | Archivos **JSON estáticos** (`contenido/<asignatura>-<nivel>/preguntas.json`), servidos con `fetch` |
> | Validación programática (Nivel 2) | Los scripts `revisar-tanda.py`, `auditar-numerico.py`, `auditar-solape-oa.py`, `validar-oa-json.py`, `auditar-audible-nivel.py` |
> | Validación pedagógica (Nivel 1) | El estándar `prompt-validador-preguntas.md` (se aplica cuando se corre un validador IA sobre una tanda) |
> | Publicación / gate final | La **aprobación humana por muestreo** de Roberto (`revisada:true`), ver `aprobacion-pedagogica.md` |
> | Versionado, estados, códigos de error, métricas, control de duplicados semánticos | **No existen todavía** |
>
> Antes de "implementar esta arquitectura" hay que decidir explícitamente que se quiere pasar de
> bancos estáticos a un sistema con base de datos y estados — es un proyecto grande, no un encargo
> de una sesión, y **no está en `pendiente.md`**. Este documento sirve para cuando ese día llegue, y
> para que las piezas que sí se construyan (por ejemplo un validador IA por tanda) encajen en un
> marco pensado.

**Relación con los otros docs.** Este es el **cómo se orquesta a nivel de pregunta individual**; su
gemelo [`arquitectura-construccion-etapas.md`](arquitectura-construccion-etapas.md) es la vista a
**nivel de OA/etapa** (banco de ~30 por OA, selección/balance, construcción de la etapa ejecutable,
ejecución 10/intento, anti-memorización, registro de intentos). El **qué** de cada paso vive en
[`prompt-generador-preguntas.md`](prompt-generador-preguntas.md) (generar) y
[`prompt-validador-preguntas.md`](prompt-validador-preguntas.md) (validar); el formato y las trampas
por nivel en [`encargo-banco.md`](encargo-banco.md); el gate humano en
[`aprobacion-pedagogica.md`](aprobacion-pedagogica.md).

---

## 1. Objetivo general

Un pipeline pedagógico y técnico:

```text
CURRÍCULUM → CONFIGURACIÓN DEL GENERADOR → GENERADOR IA → PREGUNTA PROPUESTA
   → VALIDADOR PEDAGÓGICO → DECISIÓN
        ├── APROBADA → CONTROL FINAL → BANCO DE PREGUNTAS
        ├── REVISAR  → CORRECCIÓN / REGENERACIÓN → NUEVA VALIDACIÓN
        └── RECHAZADA → REGISTRO DE ERROR
```

El sistema debe **impedir que una pregunta no validada llegue al banco de producción**.

## 2. Separación de responsabilidades

- **A. Motor curricular** — niveles, asignaturas, unidades, ejes, OA, indicadores, contenidos,
  habilidades, progresión. **No genera preguntas.**
- **B. Configurador** — construye la instrucción específica para el generador (nivel, asignatura,
  OA, habilidad, dificultad, tipo, `requiere_lectura`, …).
- **C. Generador** — recibe la configuración y genera una pregunta usando el **prompt maestro del
  generador**. No decide por sí mismo qué OA usar.
- **D. Validador** — recibe la pregunta y su contexto curricular, usa el **prompt maestro del
  validador**, y funciona **independiente** del generador.
- **E. Corrector / regenerador** — ante un problema corregible, pide una nueva versión usando el
  diagnóstico del validador. No modifica el OA arbitrariamente.
- **F. Banco de preguntas** — solo recibe preguntas que superaron la validación requerida.

## 3. Flujo principal

```text
create_generation_request() → build_generation_context() → generate_question()
  → normalize_question() → validate_question() → evaluate_validation()
    if APPROVED:  save_question()
    if REVIEW:    repair_or_regenerate() → validate_again()
    if REJECTED:  record_failure() → regenerate_from_scratch()
```

## 4. Límite de reintentos

Nunca un ciclo infinito. Configurables:

```text
MAX_GENERATION_ATTEMPTS = 3
MAX_REPAIR_ATTEMPTS     = 2
MAX_VALIDATION_ATTEMPTS = 5
```

Al alcanzar el límite: `STATUS = "REJECTED_FINAL"` y registrar la causa.

## 5. Contrato de datos de la pregunta

Estructura normalizada (la implementación real puede usar otro esquema, pero conservando la
separación conceptual):

```json
{
  "id": null,
  "version": 1,
  "curriculum": { "nivel": 3, "asignatura": "", "unidad": "", "eje": "", "oa": "", "contenido": "", "habilidad": "", "indicador": "" },
  "assessment": { "tipo": "seleccion_multiple", "dificultad": "media", "nivel_comprension": null },
  "content": { "lectura": { "titulo": "", "texto": "" }, "pregunta": "", "alternativas": [], "respuesta_correcta": null, "retroalimentacion": "" },
  "quality": { "generator_version": "", "validator_version": "", "validation_status": "", "validation_score": null },
  "audit": { "created_at": "", "updated_at": "", "generation_attempt": 1, "validation_attempt": 1 }
}
```

> **Puente al esquema real de hoy.** El banco de producción usa `pregunta`, `opciones` (4),
> `correcta` (índice), `tip`, `oa`, `revisada`, y `visual` opcional en 3°/4° (ver
> `esquema-oa-json.md`). Al aterrizar una pregunta de este pipeline: `content.alternativas`→`opciones`,
> `content.respuesta_correcta`→`correcta`, `content.retroalimentacion`→`tip`,
> `curriculum.oa`→`oa`. El resto (`quality`, `audit`, `version`) es metadato del pipeline que hoy no
> se persiste.

## 6. Identidad y versionado

Cada pregunta lleva `question_id`, `version`, `generation_id`, `validation_id`. **Nunca sobrescribir
una pregunta validada:** al modificar, `v1 → v2 → v3`, conservando el historial de cada versión.

## 7. Trazabilidad

El sistema debe poder responder: qué OA la originó, qué prompt la generó, qué versión del generador
y del validador se usaron, cuántos intentos hubo, qué errores tuvo, si fue corregida, por qué fue
rechazada, qué alternativas tuvo, y qué versión llegó a producción.

## 8. Códigos de error (catálogo centralizado)

Formato `<CATEGORIA>_<NUMERO>`. Ejemplos: `CURRICULAR_001`, `NIVEL_001`, `AMBIGUA_001`,
`RESPUESTA_001`, `DISTRACTOR_001`, `LECTURA_001`, `MATEMATICA_001`, `CIENCIAS_001`, `HISTORIA_001`,
`RETROALIMENTACION_001`, `TECNICO_001`, `SESGO_001`. **El catálogo es único y centralizado; ningún
prompt inventa códigos nuevos.**

## 9. Clasificación de errores

```json
{ "code": "AMBIGUA_001", "severity": "MAJOR", "category": "claridad", "description": "", "field": "pregunta", "repairable": true }
```

Severidades: `CRITICAL`, `MAJOR`, `MINOR`.

## 10. Decisión del validador → estados internos

El validador devuelve `APPROVED` / `APPROVED_WITH_OBSERVATION` / `REVIEW` / `REJECTED`. El sistema lo
traduce a estados internos: `DRAFT`, `GENERATED`, `VALIDATING`, `APPROVED`, `REVIEW_REQUIRED`,
`REGENERATING`, `REJECTED`, `REJECTED_FINAL`, `PUBLISHED`, `ARCHIVED`.

## 11. Reglas de publicación

Una pregunta solo llega a `PUBLISHED` si `validation_status = APPROVED` **y** no hay errores
`CRITICAL` ni `MAJOR` pendientes. Nunca publicar algo que "parezca correcto".

## 12. Regeneración inteligente

```text
Pregunta → Diagnóstico → Errores → Prompt de reparación → Nueva pregunta → Validación
```

El regenerador recibe: pregunta original, OA, contexto curricular, errores detectados, correcciones
sugeridas y restricciones originales. **Conserva lo que estaba correcto:** si el problema es solo un
distractor, no regenera la pregunta completa; si hay error curricular, la regenera entera.

## 13. Reglas de reparación

- **Error menor:** modificar directamente.
- **Error mayor localizado:** reparar solo el componente afectado cuando sea seguro.
- **Error crítico:** regenerar desde cero.

Ejemplos: `DISTRACTOR_001`→reparar alternativas; `AMBIGUA_001`→reparar redacción;
`RETROALIMENTACION_001`→reparar explicación; `CURRICULAR_001` / `MATEMATICA_001` /
`RESPUESTA_001`→regenerar.

## 14. Control de duplicados

Antes de almacenar, comparar texto, OA, contenido, estructura, lectura, alternativas y **concepto
evaluado**. Detectar duplicados exactos, **semánticos** y preguntas demasiado similares. No basta la
comparación literal: dos preguntas distintas en redacción pero idénticas en habilidad y respuesta
pueden ser duplicadas. *(Hoy `revisar-tanda.py` caza duplicados y casi-duplicados dentro del OA por
texto; el duplicado semántico entre OA es lo que falta.)*

## 15. Balance del banco

Poder controlar, por OA: cantidad de preguntas, dificultad, habilidades, tipo de pregunta, tipo de
comprensión, **distribución de la respuesta correcta** (que hoy se equilibra al barajar con
`consolidar-pool-nivel.py`), y proporción con/sin lectura. Evita un banco desbalanceado.

## 16. Métricas del generador

`generation_success_rate`, `validation_pass_rate`, `validation_failure_rate`, `regeneration_rate`,
`average_attempts`, `average_validation_score`, `error_frequency_by_code`, `error_frequency_by_OA`,
`error_frequency_by_level`. Sirven para detectar problemas del propio generador.

## 17. Métricas del validador

Porcentaje de aprobación, falsos rechazos, errores más detectados, y OA / niveles / asignaturas con
mayor tasa de rechazo, y preguntas que requieren más regeneraciones. El objetivo es mejorar el
sistema progresivamente.

## 18. Control de calidad en dos niveles

- **Nivel 1 — validación IA:** currículum, pedagogía, claridad, contenido, alternativas,
  retroalimentación (el `prompt-validador-preguntas.md`).
- **Nivel 2 — validación programática (determinista, NO depende de la IA):** JSON válido, campos
  obligatorios, cantidad de alternativas, índice de respuesta válido, duplicados, valores
  permitidos, longitudes, caracteres inválidos, consistencia de IDs, integridad. *(Es lo que hoy
  hacen los scripts de auditoría; es la parte del pipeline que ya existe.)*

## 19. Regla de seguridad del banco

Nunca `GENERATED → PUBLISHED`. El flujo obligatorio es
`GENERATED → VALIDATING → APPROVED → PUBLISHED`. *(En VULPO, `PUBLISHED` equivale a
`revisada:true`, y ese salto lo da un humano — no se automatiza sin decisión explícita.)*

## 20. Diseño preparado para crecer

Agregar 3°…8° y nuevas asignaturas **sin modificar el motor central**: todo por **configuración y
datos curriculares**, no por lógica específica de curso. *(Es la misma dirección de la Fase 0 y de
`niveles.js` en `pendiente.md`: las diferencias entre cursos van como dato, no como `if`.)*

## 21. Principio final

VULPO no debe depender de una única llamada a una IA. La calidad es **un proceso, no una propiedad
asumida** de la generación: generar → verificar → corregir → verificar de nuevo → aprobar → publicar
→ medir.
