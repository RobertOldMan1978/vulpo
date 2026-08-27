# Historia de 3° básico — plan de implementación

> Diseño: `docs/superpowers/specs/2026-08-26-historia-3basico-design.md`.
> **Nada de esto necesita subagentes:** el contenido lo escribe el asistente por tandas, y
> cada tanda se valida antes de seguir.

**Meta:** Historia 3° a la par de Matemática 3° — 16 OA, 480 preguntas, campaña de 5
capítulos + Jefe Final, medible por el profesor y con voz.

**Orden deliberado:** primero el contenido (que es el 80% del trabajo y no depende de nada),
después el motor, después la voz. La voz va **al final** porque cuesta dinero y cada
corrección posterior obliga a regenerar clips.

---

## Fase 1 · Banco de preguntas (16 tandas)

**Archivos:** crear `contenido/historia-3basico/_pool/oaNN.json`, consolidar en
`contenido/historia-3basico/preguntas.json`.

Una tanda por OA, **30 preguntas**, en este orden (el del juego, para poder probar el
capítulo 1 completo lo antes posible):

1. OA 06, 07, 08 → capítulo 1 jugable
2. OA 01, 05, 09, 10 → capítulo 2
3. OA 02, 03, 04 → capítulo 3
4. OA 11, 13, 14 → capítulo 4
5. OA 12, 15, 16 → capítulo 5

**Reglas de cada tanda** (se comprueban antes de pasar a la siguiente):
- 4 opciones, una correcta, sin repetidas; `tip` que explique, no que repita la respuesta.
- Enunciado corto: **una idea por pregunta**, sin subordinadas encadenadas.
- Ninguna palabra del OA oficial dada por sabida (si el OA dice "archipiélago", la pregunta
  lo enseña).
- La opción correcta **no puede ser sistemáticamente la más larga** (sesgo medido en
  Matemática: 32,8%).
- Reparto de la correcta entre las 4 posiciones, barajado al consolidar.
- `revisada:false`, ids `hist3-oaNN-N`.
- **Los OA 11, 12, 13 y 16 se redactan como situaciones** ("¿qué debería hacer Ana si…?"),
  nunca como preguntas sobre el propio comportamiento del jugador.

**Verificación de la fase:** `scripts/validar-banco-3ro.py` adaptado a `HI03` (estructura,
OA oficiales, duplicados, largo del enunciado). **No hay verificación aritmética posible:**
la exactitud histórica se comprueba a mano y por chequeo cruzado.

## Fase 2 · Apoyos visuales (4 widgets)

**Archivo:** `3ro/index.html`, junto a los siete que ya existen.

- `cuadricula` — grilla con rosa de los vientos y una ficha ubicada (OA 06)
- `globo` — esquema del planeta con Ecuador, trópicos, polos y hemisferios (OA 07)
- `zonas` — las tres franjas climáticas (OA 08)
- `linea` — línea de tiempo Antigüedad ↔ hoy (OA 01, 02, 04)

Cada uno con su `textoVisual` para el lector de pantalla, **sin delatar la respuesta**.

**Verificación:** una pregunta de cada tipo renderizada en el navegador con
`scripts/cdp.mjs`, y **los seis constructores comprobados** (el `visual` ya se cayó una vez
en silencio, Sesión 55).

## Fase 3 · Campaña en el motor

**Archivo:** `3ro/index.html`.

- 5 expediciones `hist3-cap1..5` en `EXPEDICIONES`, con `asignatura:'Historia'`,
  `contenido:'contenido/historia-3basico/preguntas.json'` y `portadaMapa` **explícita**
  (si no, 404 — lección de la Sesión 57).
- Entrada `'hist3'` en `CAMPAÑAS` con su Jefe Final de 4 fases × 4.
- Las **16 metas en lenguaje de niño** en `META_OA`.
- `ORDEN_ASIG` pasa a `['Matemática','Historia']`.
- Skin, insignia y villano de la campaña.

**Verificación:** recorrido real con `cdp.mjs` — menú → campaña → los 5 capítulos → una
etapa completa hasta el resultado. Cero 404 y consola limpia. **Matemática 3° y 8° intactos.**

## Fase 4 · Que el profesor lo vea

- `supabase/schema.sql`: `HI03` en `kimun_oa_asignatura` y en las dos listas de
  `kimun_prof_asignaturas`.
- `profesor.html`: `OA_CARPETA`, `ASIG_NOMBRE`, `ASIG_ORDEN` y el espejo `SB_asigDe`.
- `3ro/index.html`: `ASIG_DESAFIO_NOMBRE` para el refuerzo.

**Verificación:** con el doble de Supabase, que `HI03 OA 07` cargue el texto real del
objetivo y cuente sus 16 OA. **Requiere que Roberto re-aplique el esquema.**

## Fase 5 · Voz (solo con autorización)

- Reglas nuevas del normalizador: números romanos, siglos y `a.C.` / `d.C.`
- Generar (~2.400 clips, ~US$1,2), auditar con `scripts/auditar-voz-3ro.py` y corregir lo
  que suene mal, como se hizo en la Sesión 56.

## Fase 6 · Cierre

- Documento de revisión en PDF para la aprobación pedagógica humana.
- Bitácora, README y `CLAUDE.md`.

---

## Lo que queda del lado de Roberto

- Las **tres decisiones abiertas** del diseño (OA actitudinales, villano, gasto de la voz).
- El **arte**: 5 portadas, el villano y su versión derrotada, la skin.
- La **aprobación pedagógica** de las 480 preguntas.
- **Re-aplicar el esquema** cuando llegue la Fase 4.
