# G1 · La lente de Formación Ciudadana en el panel (evidencia Ley 20.911)

**Fecha:** 2026-09-16 · **Estado:** ✅ IMPLEMENTADO (Sesión 130) — aplicado y verde en producción. Ver la bitácora de la Sesión 130 en `CLAUDE.md`. Las fechas de realización quedaron **por curso** (corrección de Roberto), reutilizando la planificación del año (Sesión 108).

## Objetivo

Darle al panel del profesor una vista y un informe de **Formación Ciudadana**: los **43 OA
cívicos** (eje "Formación ciudadana" del currículum, hoy bancarizados dentro de Historia como
códigos `HI0n`) tienen contenido aprobado y se juegan, pero **no tienen vista propia en el
panel**. G1 los saca a la superficie como **evidencia del Plan de Formación Ciudadana (Ley
20.911)** —lo que la UTP pasa en orientación/consejo de curso y le cuesta evidenciar— **con datos
reales del juego de los alumnos**. Nace del gancho institucional de la Sesión 117.

⚠️ **Solo evidencia CONOCIMIENTO cívico (respondieron bien las preguntas), nunca conducta ni
valores** — la línea de siempre del proyecto. La medición sigue el mismo criterio que el mapa de
dominio.

## Lo que ya existe (medido, no de memoria)

- Los **43 OA cívicos** ya están enumerados en la expedición `civica` de cada fork (Sesión 119):
  3° 6 · 4° 8 · 5° 10 · 6° 12 · 7° 4 · 8° 3 = **43**. Son la lista autoritativa.
- El panel **ya mide** su cobertura y dominio: son `HI0n`, así que cuentan como Historia en el
  pulso (`kimun_prof_pulso`) y en el mapa (`kimun_prof_dominio`).
- **Infra de impresión A4** ya montada: el pulso del colegio y el informe de cierre de unidad usan
  `@media print` (Sesiones 107 y 109).
- El **registro sobrio** del panel (Inter, tokens, color donde informa; Sesión 106).

## Decisiones de diseño (Roberto)

1. **Las DOS caras:** un informe de colegio (evidencia para la UTP) **y** una vista por curso
   (para el Profesor Jefe).
2. **El informe de colegio muestra SOLO COBERTURA, no % de acierto por curso.** Sigue la regla del
   pulso (Sesión 107): nada de rendimiento por curso, para que la UTP no lo lea como ranking ni
   como "nota de ciudadanía". La vista por curso del Profesor Jefe **sí** trae el dominio (como el
   mapa ya lo hace ahí dentro).
3. **Datos de HOY, con fecha de emisión** ("Generado el <fecha>"). No una foto reconstruida: el
   estado acumulado del año, que es lo que la UTP imprime cuando lo necesita. El % de primer
   intento ya queda congelado por diseño, así que refleja lo trabajado.

## Componentes

### 1. Los datos · `assets/plan/oa-civica.json`

Un JSON machine-readable con los 43 OA cívicos por nivel, **generado de las expediciones `civica`
de los seis forks** por un script re-ejecutable (`scripts/generar-oa-civica.py`), como el
`oa-unidad.json` del semáforo (Sesión 114). **Cero contenido nuevo.** Forma tentativa:
`{"03":["HI03 OA 11", ...], "04":[...], ...}`. El script **aborta si no encuentra las seis
expediciones `civica`** (el guard que ya salvó al tablero y al `oa-unidad.json`).

### 2. Blindaje de 8° (G2, prerrequisito chico)

`contenido/historia-8basico/oa.json` no trae la advertencia de medición por OA que sí tienen
3°-6° (solo un array `actitudes` transversal), y sus `HI08 OA 17/19` son valorativos. Se agrega la
`nota_evaluacion` / marca por OA equivalente a la de los otros cursos, para que la advertencia
"mide conocimiento, no conducta" sea consistente en los seis. Higiene de datos, sin tocar
preguntas.

### 3. El informe de colegio (evidencia Ley 20.911)

- **Dónde:** junto a "🏫 El pulso del colegio", mismo público (**Admin / SuperUsuario / Operador**,
  portero `pulso.ver`). Un botón "📋 Formación Ciudadana (Ley 20.911)" que abre el informe.
- **Qué muestra, por curso:** cuántos de sus OA cívicos se trabajaron (**cobertura**, "N de M
  objetivos cívicos con actividad") y **cuántos alumnos** tocaron contenido cívico (participación
  cívica). **NO** muestra % de acierto por curso.
- **Encabezado:** nombre del colegio (o lo que el sistema sepa, como el pulso — no hay entidad
  "Colegio" en el título del papel), fecha de emisión, y el ⚠️ "mide conocimiento cívico, no
  conducta ni valores".
- **Imprimible A4** (`@media print`, invirtiendo la paleta a papel como el pulso y el cierre;
  oculta botones y navegación).
- **Casos de borde** dichos, no rellenados con ceros (como el pulso): curso sin alumnos → `—`;
  curso sin nivel → "Sin nivel asignado"; un `oa.json` que no cargue → "cobertura no disponible".

### 4. La vista por curso (Profesor Jefe)

- **Dónde:** dentro de "📊 Ver avance" de un curso, una lente/sección **"🏛️ Formación Ciudadana"**.
- **Qué muestra:** los OA cívicos de ese curso con su **cobertura + dominio** (el % de primer
  intento, como el mapa ya lo muestra ahí dentro — este es el lugar donde el dominio SÍ va, porque
  es el detalle de UN curso para su profe, no un ranking entre cursos).
- **Imprimible:** su propio botón para la evidencia cívica de ese curso.
- **Reutiliza `kimun_prof_dominio`** filtrando client-side a los 43 OA cívicos (patrón del
  semáforo: el servidor devuelve por OA, el cliente cruza con `oa-civica.json`). **Cero backend
  nuevo para esta cara.**

## Backend

- **La vista por curso: cero backend nuevo** — reutiliza `kimun_prof_dominio(curso)` filtrado
  client-side.
- **El informe de colegio: UNA función chica nueva**, `kimun_prof_civica()`, porque la `cobertura`
  de `kimun_prof_pulso` son *counts por asignatura* (`jsonb_object_agg(asig, n)`), no la lista de
  códigos, y el servidor **no sabe cuáles OA son cívicos** (eso vive en el repo). La función
  devuelve, por curso, los **códigos `HI0n` DISTINTOS con actividad** (para que el cliente los
  cruce con los 43 cívicos) + los **alumnos distintos que tocaron esos OA** (participación cívica).
  - Portero **`pulso.ver`** (Admin/Super/Operador), como el pulso, y en el SQL además de esconder
    el botón.
  - ⚠️ **NO devuelve % de acierto, ni nombres de alumno** — la restricción vive en la **FIRMA**,
    igual que `kimun_prof_pulso`, así que no se puede deshacer desde el cliente.
  - Mismo criterio de forma curricular (`^[A-Z]{2}[0-9]{2} OA [0-9]{2}$` + `substr(d.oa,3,2) =
    k.nivel`) que el pulso, para no contar `VOC-*`/`AF-*`.
  - Su `drop function if exists` aunque sea nueva (es `returns table`).

## Verificación

- Con `scripts/panel-demo.py` (doble) + `scripts/cdp.mjs`, **mirando** (regla del proyecto):
  el informe de colegio con su cobertura por curso, imprimible A4 (paleta a papel, sin acierto,
  sin nombres — asertos sobre el texto renderizado), y la vista cívica por curso con su
  cobertura + dominio.
- El script `generar-oa-civica.py` **probado extrayendo los 43 de los forks** y comprobando el
  total.
- **Degradación:** con la función SQL ausente el informe lo dice y el panel queda intacto; con
  `oa-civica.json` ausente la vista por curso no rompe (best-effort, patrón del semáforo).
- Sin regresión en el pulso, el mapa, la tendencia ni el resto de Ver avance; consola limpia.
- Los dos controles del backend contra producción tras aplicar: `kimun_prof_civica` anon →
  `no_autorizado` (existe y su portero funciona) vs una función inventada → `PGRST202` (no es
  eco).

## Fuera de alcance

- **No hay entidad "Colegio"** con nombre en el título del papel (igual que el pulso): se titula
  con lo que el sistema sabe.
- **No se toca el juego del alumno** (la lente `HAY_CIVICA` de la Sesión 119 ya existe y es otra
  cosa).
- **No se mide conducta ni valores**, y no hay ranking de cursos por rendimiento cívico.
