# Jerarquía de roles de usuario (Admin · SuperUsuario · Profe Jefe · Profe Asignatura)

**Fecha:** 2026-08-24
**Estado:** Diseño aprobado, pendiente de plan de implementación

## Contexto

La Sesión 37 introdujo los **roles por asignatura**: un curso pasó de tener un
dueño único a un equipo (Profesor Jefe + profes de asignatura), con la tabla
`curso_profesores` y los porteros `kimun_prof_es_mio` (jefe o admin),
`kimun_prof_acceso` y `kimun_prof_asignaturas`. Los permisos globales, en cambio,
siguen siendo un solo booleano: `profesores.es_admin`. Solo hay dos niveles
globales: administrador (ve todo, autoriza cuentas) y profesor.

Eso no calza con un colegio real. La autoridad del colegio —UTP o dirección—
necesita administrar sus cursos (crearlos, nombrar Profes Jefe, gestionar a los
profesores) sin ser el dueño de la plataforma. Y hoy **cualquier profesor puede
crear un curso** y quedar como su Jefe, lo que no debería poder hacer un profe de
asignatura.

Objetivo: una jerarquía de cuatro roles con atribuciones claras, y que el
encabezado de cada cuenta diga quién eres, tu rango y qué cursos controlas.

**Fuera de alcance (proyecto aparte):** modelar la entidad **"Colegio"**. Por ahora
hay un solo colegio (el piloto), así que el SuperUsuario administra **todos** los
cursos existentes. Cuando entre un segundo colegio, se agregará `colegios` para
aislar a cada SuperUsuario dentro del suyo. Este diseño deja el terreno listo (el
SuperUsuario es un nivel de cuenta, no una propiedad del colegio) sin construir esa
capa todavía.

## Los cuatro roles

- **Admin** — el dueño de la plataforma (Roberto). Global, por encima de todo. Es el
  único que crea y quita SuperUsuarios y Admins. Se crea a mano en Supabase, como hoy.
- **SuperUsuario** — la autoridad del colegio (UTP / director). Administra el colegio:
  crea cursos, nombra Profes Jefe, autoriza y gestiona a los profesores. No puede tocar
  a Admins ni a otros SuperUsuarios.
- **Profe Jefe** — conduce un curso. Ve y gestiona **todas** las asignaturas de su
  curso, arma su equipo de profes de asignatura, y hace lo destructivo *dentro* del
  curso (alumnos, XP, reiniciar mediciones). No crea cursos ni nombra Jefes.
- **Profe Asignatura** — ve y refuerza **solo sus asignaturas** en el curso.

Los dos primeros son roles **globales de la cuenta**; los dos últimos son **por
curso** (una misma cuenta puede ser Jefe en un curso y de asignatura en otro).

## Matriz de atribuciones (aprobada)

| Acción | Admin | SuperUsuario | Profe Jefe | Profe Asignatura |
|---|:--:|:--:|:--:|:--:|
| Crear / quitar SuperUsuarios y Admins | ✓ | ✗ | ✗ | ✗ |
| Autorizar cuentas de profesor nuevas | ✓ | ✓ | ✗ | ✗ |
| Ver todos los cursos | ✓ | ✓ | solo los suyos | solo los suyos |
| Crear un curso | ✓ | ✓ | ✗ | ✗ |
| Nombrar / cambiar al Profe Jefe | ✓ | ✓ | ✗ | ✗ |
| Agregar / quitar Profe de asignatura al equipo | ✓ | ✓ | ✓ | ✗ |
| Modificar las asignaturas de un profe | ✓ | ✓ | ✓ | ✗ |
| Borrar un curso | ✓ | ✓ | ✗ | ✗ |
| Agregar/quitar alumnos · fijar XP · reiniciar mediciones | ✓ | ✓ | ✓ | ✗ |
| Ver mapa de dominio / ranking | todo | todo | todo su curso | solo sus asignaturas |
| Lanzar / cerrar refuerzo | ✓ | ✓ | ✓ (su curso) | solo sus asignaturas |

Decisiones tomadas en el diseño:
1. El **SuperUsuario autoriza** cuentas de profesor (para que el colegio maneje sus
   altas sin depender del Admin).
2. El **Profe Jefe ya no borra el curso** (subió a Admin/SuperUsuario); conserva todo
   lo demás de su curso.
3. **Crear curso y nombrar Jefe = solo Admin/SuperUsuario**; el Jefe solo agrega y edita
   **Profes de asignatura**.

## Modelo de datos

**Nivel global de la cuenta.** Se agrega una columna a `profesores`:

```sql
alter table public.profesores add column if not exists es_super boolean not null default false;
```

Jerarquía: **Admin (`es_admin`) ▸ SuperUsuario (`es_super`) ▸ Profesor**. Se conserva
`es_admin` (ya cableado en todas las funciones); un Admin cuenta también como
administrador del colegio. No hay migración de datos: nadie es SuperUsuario al inicio,
y Roberto sigue siendo Admin. (Se descartó reemplazar `es_admin` por una columna `rol`
única: sería más limpio pero tocaría cada referencia a `es_admin`, con más riesgo.)

**Roles por curso.** Sin cambios: siguen en `curso_profesores.rol` (`'jefe'` |
`'asignatura'`), con el índice único de un Jefe por curso.

### Porteros (helpers de permiso)

- **`kimun_prof_admin_colegio()` (nuevo)** = `es_admin OR es_super`. Es el portero de
  lo que administra el colegio: **crear curso, nombrar/cambiar Jefe, borrar curso,
  autorizar y gestionar profesores**.
- **`es_admin`** queda solo para lo exclusivo del dueño de la plataforma: **crear/quitar
  SuperUsuarios y Admins**, y revocar a un Admin/SuperUsuario.
- **`kimun_prof_es_mio(curso)`** (lo destructivo *dentro* de un curso: alumnos, XP,
  reiniciar, y agregar/editar profes de asignatura) pasa a: **admin ∨ super ∨ Jefe del
  curso**. (Hoy es admin ∨ Jefe; solo se le suma `es_super`.)
- **`kimun_prof_acceso(curso)`**, **`kimun_prof_asignaturas(curso)`** y el `where` de
  **`kimun_prof_listar`**: se les suma `es_super` al nivel "ve todo / recibe las cuatro
  asignaturas" (donde hoy dicen `es_admin`).

### Funciones que cambian

| Función | Cambio |
|---|---|
| `kimun_prof_yo` | Devuelve la fila de `profesores`, así que `es_super` aparece solo (no cambia su firma). |
| `kimun_prof_es_mio` | + `es_super` (ver arriba). |
| `kimun_prof_acceso` / `_asignaturas` | + `es_super` en la rama "ve todo / todas". |
| `kimun_prof_listar` | + `es_super` en el `where`; **agrega la columna `mi_rol text`** (mi rol en ese curso, o null si soy admin/super sin membresía) para el encabezado. |
| `kimun_prof_curso_crear` | Exige `admin_colegio` (ya no cualquier profesor). **Deja de auto-nombrar Jefe al creador**: el curso nace sin Jefe y el Admin/Super lo nombra después. |
| `kimun_prof_curso_quitar` (borrar) | Exige `admin_colegio` (ya no el Jefe). |
| `kimun_prof_equipo_asignar` | Si `p_rol='jefe'` exige `admin_colegio`; si `'asignatura'` exige `es_mio`. |
| `kimun_prof_equipo_quitar` | Quitar una fila con `rol='jefe'` exige `admin_colegio`; quitar `'asignatura'` exige `es_mio`. |
| `kimun_prof_autorizar` | Exige `admin_colegio` (el SuperUsuario también). |
| `kimun_prof_profesores` | Exige `admin_colegio`. Devuelve además `es_super` por profesor (para que el Admin lo gestione). |
| `kimun_prof_quitar` (revocar) | Exige `admin_colegio`; **un SuperUsuario no puede revocar a un Admin ni a otro SuperUsuario** (solo el Admin). Un Admin no puede revocarse a sí mismo (ya existe esa guarda). |
| `kimun_prof_limpiar_pruebas` | Sin cambio: sigue siendo solo `es_admin` (herramienta de plataforma, no de colegio). |

### Función nueva

```sql
kimun_prof_super_fijar(p_correo text, p_es_super boolean) returns void
```
Nombra o quita un SuperUsuario. **Solo `es_admin`.** No puede tocar a otro Admin
(no se degrada ni asciende un Admin por esta vía; eso se hace a mano en SQL, como el
alta del primer Admin). El profesor debe existir en `profesores`.

## Cambios en `profesor.html`

Bandera de cliente nueva, derivada de `kimun_prof_yo`:
`const esAdminColegio = YO.es_admin || YO.es_super;`

1. **Encabezado (`#profId`).** Pasa de "👤 Nombre — Administrador/Profesor" a
   **usuario · rango · cursos**:
   - **Rango:** Administrador / SuperUsuario / Profesor (de `es_admin`/`es_super`).
   - **Cursos:** Admin y SuperUsuario → "· Todos los cursos". Profesor → sus cursos con
     su rol en cada uno, por ejemplo **"8°A (Jefe) · 8°B (Matemática, Ciencias)"**,
     derivado de `kimun_prof_listar` (`mi_rol` + `mis_asignaturas` por curso).
2. **"+ Crear curso":** visible solo si `esAdminColegio` (hoy lo ve cualquiera).
3. **🗑️ Borrar curso:** pasa de `c.puede_gestionar` (Jefe incluido) a `esAdminColegio`.
   El resto de lo destructivo del curso (✎ XP, ✕ alumno, agregar alumno, carga masiva,
   🔄 reiniciar) sigue con `c.puede_gestionar` (el Jefe lo conserva).
4. **Bloque "Equipo del curso":**
   - **Alineación arreglada:** los radios y las casillas quedan junto a su etiqueta (hoy
     la etiqueta cae debajo del cuadro).
   - La opción **"Profesor Jefe"** del formulario **solo aparece si `esAdminColegio`**; un
     Jefe solo puede agregar/editar **Profes de asignatura** (el rol se fuerza a
     `'asignatura'` cuando no hay opción de Jefe).
   - **✎ Editar asignaturas** por cada profe de asignatura: precarga su correo y sus
     materias en el formulario y el botón pasa a "Guardar cambios" (reusa
     `kimun_prof_equipo_asignar`, que ya es upsert).
   - El **✕ sobre la fila del Jefe** solo aparece si `esAdminColegio`; el ✕ de las filas
     de asignatura lo ve quien gestiona el curso (Jefe incluido).
5. **Bloque "Administración"** (autorizar profesor, lista de profesores): visible para
   Admin **y** SuperUsuario. Dentro, un control para **nombrar/quitar SuperUsuario** por
   profesor (llama a `kimun_prof_super_fijar`) que **solo ve el Admin**; la lista muestra
   el rango de cada profesor.

## Migración

1. `alter table … add column es_super` (idempotente con `if not exists`).
2. Nada más se migra: no hay SuperUsuarios previos y Roberto sigue Admin. Para nombrar el
   primer SuperUsuario, el Admin usa el control nuevo (o un `update` a mano).
3. Todo idempotente: re-pegar `schema.sql` completo no rompe ni duplica.

## Verificación

En el navegador con cuentas reales (como en la Sesión 37), sobre `CUR-BA04` y las cuentas
`profe-prueba*`:

1. **Nombrar un SuperUsuario:** como Admin, marca a `profe-prueba` como SuperUsuario.
   Entra con esa cuenta: ve **todos los cursos**, puede **crear curso** y **nombrar Jefe**,
   ve el bloque Administración y puede **autorizar**; pero **no** ve el control de
   nombrar SuperUsuarios (ese es solo del Admin).
2. **Profe Jefe acotado:** entra como un Jefe. Puede armar su equipo de **profes de
   asignatura** y editar sus materias, pero **no** ve la opción "Profesor Jefe" en el
   formulario, **no** ve "+ Crear curso" ni el 🗑️ de borrar curso. Conserva ✎ XP, ✕
   alumno, agregar alumno y 🔄 reiniciar.
3. **Profe de asignatura:** como en la Sesión 37, ve solo sus materias; además **no** ve
   "+ Crear curso".
4. **El servidor rechaza (no solo la interfaz):** desde la consola, un Jefe intentando
   `kimun_prof_curso_crear`, `kimun_prof_curso_quitar` o `kimun_prof_equipo_asignar` con
   `p_rol='jefe'` recibe `no_autorizado`. Un SuperUsuario intentando `kimun_prof_super_fijar`
   recibe `no_autorizado`.
5. **Encabezado:** cada cuenta muestra arriba su usuario, su rango correcto y sus cursos
   (Admin/Super: "Todos los cursos"; profesor: la lista con su rol por curso).
6. **Revocar acotado:** un SuperUsuario no puede revocar (`kimun_prof_quitar`) a un Admin
   ni a otro SuperUsuario.
7. Sin errores en la consola.

## Lo que queda fuera a propósito

- **La entidad "Colegio"** y el aislamiento entre colegios (ver Contexto). Por ahora el
  SuperUsuario ve todos los cursos.
- **Reemplazar `es_admin` por una columna `rol`.** Se prefirió agregar `es_super` por
  churn mínimo.
- **Jerarquías más finas** (coordinador de ciclo, jefe de departamento). No se pidieron.
- **Tocar el juego (`index.html`).** Esta feature es del panel del profesor.
