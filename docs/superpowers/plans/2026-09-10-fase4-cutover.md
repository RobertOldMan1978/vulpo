# Fase 4 — Cutover: los grants como única fuente de verdad

> **Sub-skill:** ejecutar a mano, tarea por tarea. **Nada se commitea hasta la orden 66; el
> esquema lo re-aplica Roberto.** Spec: `docs/superpowers/specs/2026-09-10-multi-tenant-permisos-granular-design.md`.
> Prerrequisito de las Fases 1-3: aplicadas y verdes. Este plan **retira la lectura dual** que
> venía protegiendo la transición.

**Goal:** Apagar el legado (banderas `es_super`/`es_operador` + membresías `curso_profesores` como
autorización) y los toggles/bloques viejos del panel, dejando `permisos_usuario` (grants) + el
atajo `es_admin` como la única fuente de verdad de la autorización.

**Architecture:** El motor de la Fase 2 ya enruta TODO por `kimun_prof_puede*`, y cada resolutor
hace `es_admin OR grant OR legado`. El cutover es, en el fondo, **quitar el tercer término**: que
`kimun_prof_legado_cubre` devuelva `false` y que las dos funciones que inline-ean el legado
(`tiene_todas_asig`, `admin_colegio`) suelten sus ramas de bandera. Desde ahí, el panel deja de
ofrecer los toggles viejos y todo pasa por el 🔑 mantenedor.

---

## ⚠️ EL GATE (no es mío, es de Roberto)

El cutover **quita la red de seguridad**. Mientras la lectura dual existe, un usuario con bandera
legada (o su membresía) tiene acceso aunque su grant fallara. Después del cutover, **el grant es la
única vía** — y la única forma de crear grants es el mantenedor.

Hoy en producción eso es de bajo riesgo (solo el Admin, que sobrevive por `es_admin`, y 7
membresías de curso ya migradas a grants; **cero Super/Operador reales**). Pero cuando arranque el
piloto, dar de alta a la UTP o a un profesor pasará **solo** por el mantenedor. Por eso el cutover
debe ir **después** de:

1. **Fase 3 aplicada y con control verde** (la rejilla fina).
2. **Una prueba real del mantenedor**: Roberto, con una **segunda cuenta real** (no admin), le
   otorga desde el 🔑 un grant (p. ej. Super de colegio, o Jefe de un curso) y confirma —entrando
   con esa cuenta— que **ve los cursos y puede actuar**. Esa sola prueba valida dos cosas: que los
   grants de la rejilla fina funcionan end-to-end, y que el mantenedor crea acceso de verdad.

Sin (2), el cutover se aplica a ciegas sobre la única puerta de entrada del piloto.

---

> ✅ **CONSTRUIDO el 11/09 (falta que Roberto aplique el esquema + orden 66).** Se hizo el cutover
> completo: Parte A (legado→false, ramas inline soltadas, `super_fijar`/`operador_fijar` retiradas),
> B0 (ya estaba), B1 (toggles quitados), y el "Equipo del curso" con **Opción 2** (espeja grants).
> Además `kimun_prof_rango(pid)` nueva y `kimun_prof_profesores` devuelve `rango`. Verificado con el
> doble (rango por grant, 0 toggles, roberto.lorca sigue Operador). El handoff trae el **diagnóstico
> de huérfanos** (`docs/aplicar-schema.md`) para correr antes del flip. Lo de abajo es el diseño.

## Parte A · Schema (`supabase/schema.sql`) — cerrada, mecánica

### Task A1: `kimun_prof_legado_cubre` → `false`
- [ ] Reemplazar todo el cuerpo por `select false;` (conservar la firma `(p_cap text, p_curso uuid)`
      y el comentario, reescrito a "retirado en la Fase 4 — el grant es la única verdad"). Con esto
      `puede`, `puede_en_colegio`, `puede_en_sostenedor`, `puede_algun` y `puede_ambito` pierden el
      legado **automáticamente** (todos lo llaman). No hace falta tocarlos.

### Task A2: `kimun_prof_tiene_todas_asig` — soltar las ramas de bandera
- [ ] Quitar las dos ramas inline del legado: `exists(... es_super or es_operador)` y
      `exists(curso_profesores ... rol='jefe')`. Conservar las dos ramas de grant (colegio/sostenedor/
      plataforma con `avance.ver`, y curso con `avance.ver` sin asignaturas). Un Jefe/Super real ya
      tiene su grant equivalente (migración Fase 2), así que sigue recibiendo todas las asignaturas.

### Task A3: `kimun_prof_admin_colegio` — soltar la rama de bandera
- [ ] Quitar `exists(... es_super or es_operador)`. Conservar `es_admin_raw()` y la rama de grant
      administrativo (`capacidades && array[...]`). Un Super creado por el mantenedor tiene el
      preset con esas capacidades, así que sigue pintando "Todos los cursos" y el bloque Admin.

### Task A4: los toggles muertos
- [ ] `kimun_prof_super_fijar` y `kimun_prof_operador_fijar` escriben banderas que ya no se leen.
      Decisión: **dejarlos** (son escrituras inofensivas a columnas ahora muertas) o **borrarlos**
      con sus grants. El spec pide borrar el andamiaje muerto; borrarlos es más limpio pero toca el
      bloque de grants. Recomendado: borrarlos, y de paso quitar `es_super`/`es_operador` del
      `returns table` de `kimun_prof_profesores` (cambia de firma → su `drop` ya está).
- [ ] ⚠️ **`kimun_prof_equipo_asignar`/`_quitar` NO se borran todavía** si el panel aún los usa para
      leer/mostrar el equipo (ver Parte B). Las columnas `curso_profesores` siguen sirviendo para
      **display** (`mi_rol` en `listar`) aunque no para authz.

### Verificación de A (control positivo/negativo + FOTO de acceso)
- [ ] La foto de acceso de los 7 curso-grants y del Admin debe ser **idéntica antes y después**
      (medida, no supuesta): cada uno ve y puede exactamente lo mismo. Es lo que prueba que el
      legado no estaba sosteniendo a nadie que el grant no sostenga.
- [ ] Control: cada portero desde anon → 400/`no_autorizado`; inventada → 404; `MA06 OA 01`→`MA06`.

---

## Parte B · Panel (`profesor.html`) — con UNA pregunta de UX para Roberto

El spec dice que el mantenedor "reemplaza los toggles y bloques sueltos (Hacer Super, Hacer
Operador, equipo del curso)".

### ✅ B0 — El panel grant-aware (HECHO y verificado con el doble, 11/09; falta aplicar el esquema + publicar)
> Construido: `kimun_prof_mi_acceso()` en el esquema (aditivo, legado intacto) + el panel lee de ahí
> el rango, `esAdminColegio`, y la visibilidad de limpiar/armar/🔑, con degradación por bandera si la
> función no está aplicada. Verificado con `panel-demo.py` (`?rol=grantop` = banderas false + grant
> Operador): el panel lo pinta **Operador · Todos los cursos · pulso · 🔑 · limpiar · armar**. Lo que
> sigue abajo era el diseño; queda como registro de lo hecho.

#### ⚠️ B0 (diseño) — El panel tiene que volverse grant-aware (descubierto en la prueba real, 11/09)
Hallazgo de la prueba del mantenedor: `roberto.lorca` con **solo** un grant de plataforma (sin
banderas) ve **todos los cursos por el servidor** (el WHERE de `kimun_prof_listar` ya es
`kimun_prof_acceso`, grant-aware), **pero el panel lo pinta como "PROFESOR"** —título "MIS CURSOS",
sin el botón 🏫 del pulso— porque **el CLIENTE calcula el rango y la visibilidad del chrome de admin
leyendo las banderas `YO.es_admin/es_super/es_operador`** (que vienen de `kimun_prof_yo`), no el
grant. La acción va por grant; la etiqueta va por bandera. Después del cutover (banderas apagadas)
un Operador/Super por grant tendría **acceso correcto pero panel recortado**. Hay que cerrar esa
brecha ANTES de que el cutover tenga sentido pleno.
- [ ] **Backend:** una función `kimun_prof_mi_acceso()` (o extender `kimun_prof_yo`) que devuelva
      el **rango efectivo** y las capacidades de nivel superior del usuario logueado, derivados de
      sus grants (`es_admin` → Administrador; grant plataforma con todo → Operador; grant de colegio
      administrativo → SuperUsuario; si no, Profesor). Resuelto con los resolutores ya existentes
      (`puede_algun('pulso.ver')`, `admin_colegio`, etc.), no leyendo banderas.
- [ ] **Panel:** `pintarIdentidad` (rango), `esAdminColegio` (título "Todos los cursos" + `#admBloque`),
      `#btnPulso` y los botones hoy gateados por bandera (crear curso, autorizar, limpiar, armar) pasan
      a leer ese acceso efectivo, no `YO.es_*`. Con eso `roberto.lorca` (grant-only) vería "Operador ·
      Todos los cursos · 🏫 pulso".

### B1 — Los toggles viejos
- [ ] **Quitar los toggles `super-toggle` y `operador-toggle`** de la lista de profesores (líneas
      ~1145/1149 y sus handlers ~1177/1184). El 🔑 Permisos (mantenedor) ya está ahí y los reemplaza.
- [ ] **`prof-quitar` se queda** (revocar la cuenta de un profesor sigue siendo válido).

⚠️ **La pregunta abierta — el bloque "Equipo del curso".** Hoy es **por curso** (abres un curso,
ves su equipo, agregas un profe de asignatura con sus materias). El mantenedor es **por usuario**
(abres un profe, le das un grant de curso). Son dos flujos distintos:

- **Opción 1 — puro mantenedor (lo que dice el spec):** quitar el bloque "Equipo del curso" y
  gestionar todo desde el 🔑 por usuario. Más simple, un solo lugar. Costo: para armar el equipo de
  un curso hay que abrir cada profe por separado.
- **Opción 2 — conservar una vista de equipo por curso**, pero que **escriba grants** (no
  `curso_profesores`): el bloque sigue existiendo por comodidad, pero por debajo llama a
  `kimun_prof_permisos_fijar` con ámbito curso. Más trabajo, conserva el flujo cómodo.

**Roberto decide.** Hasta entonces, la Parte B no se ejecuta. (La "quién está a cargo" del
encabezado del curso y la vista `kimun_prof_equipo` dependen de esta decisión: si se conservan,
pasan a leer grants; si no, se van.)

---

## Fuera de alcance
- El juego (seis forks) no se toca.
- La entidad Colegio para aislar múltiples colegios (ya existe la tabla; el aislamiento real por
  colegio lo dan los grants, que este cutover deja como única verdad).
- Borrar las columnas `es_super`/`es_operador`/la tabla `curso_profesores`: se **conservan** (datos
  históricos + display de `mi_rol`); dejan de leerse para authz, que es lo que importa.
