# Multi-inquilino (Sostenedor ▸ Colegio) + motor de permisos granular + mantenedor de usuarios

> **Diseño aprobado (Sesión 116, 10/09/2026).** Es el cambio de fondo más grande del proyecto:
> reconstruye la capa de autorización de VULPO, de roles fijos a **capacidades granulares sobre un
> ámbito**, y agrega dos niveles de inquilino (Sostenedor ▸ Colegio). Se despliega junto pero se
> construye en cuatro fases, cada una con su propio plan.

## Contexto y objetivo

Hoy VULPO no tiene entidad "Colegio": un SuperUsuario ve **todos** los cursos que existen. Sirve con
un colegio piloto; es insostenible al entrar el segundo. Y la gestión de permisos vive en toggles
sueltos por el panel (Hacer Super, Hacer Operador, autorizar, equipo), difícil de ver de conjunto.

Roberto definió (Sesión 116):
1. **Estructura de dos niveles:** Sostenedor ▸ Colegio (para vender a colegios sueltos y a redes).
2. **Motor de permisos granular**, estilo editor de casillas por capacidad (referencia: un editor
   "Editar permisos — usuario" con categorías, un master "Acceso total" y "marcar todas" por grupo).
3. **Los permisos los dan Admin y Operador** (staff de VULPO), desde un **mantenedor de usuarios**;
   el usuario se identifica por su **correo**.
4. Los **roles** (Sostenedor, SuperUsuario, Profe Jefe, Profe Asignatura) siguen valiendo como
   **nombres**, pero pasan a ser **presets** de capacidades + forma de ámbito, no chequeos fijos.

## 1 · El modelo de inquilinos

```
VULPO (plataforma) ─ Sostenedor ─ Colegio ─ Curso ─ Alumno
```

- **`sostenedores`** (`id uuid pk`, `nombre`, `creado`). El cliente comercial: puede tener uno o
  varios colegios.
- **`colegios`** (`id uuid pk`, `sostenedor_id → sostenedores`, `nombre`, `creado`).
- **`cursos.colegio_id → colegios`** (nace **nullable** para migrar sin romper; al final del cutover
  todos los cursos lo tienen).
- El **alumno** no cambia: pertenece a un curso, que ahora pertenece a un colegio.

⚠️ **La entidad Colegio no es solo agrupación: reordena quién ve qué.** Un SuperUsuario deja de ver
todos los cursos y ve solo los de su colegio; sus acciones "globales" de hoy (crear curso, autorizar
profesor, el pulso) pasan a ser *dentro de su ámbito*.

## 2 · El motor de permisos granular (el corazón)

Debajo del **Admin** (dueño de la plataforma, sigue siendo SQL-only y salta todos los chequeos),
**todo acceso es una capacidad sobre un ámbito**. Se acaban los chequeos por bandera de rol.

### 2.1 · Las capacidades (las casillas del editor)

Códigos estables, agrupados por categoría (lo que el mantenedor muestra):

| Categoría | Capacidades |
|---|---|
| **Cursos y alumnos** | `curso.crear` · `curso.borrar` · `curso.nivel` · `alumno.gestionar` · `inscripcion.crear` · `dominio.reiniciar` |
| **Equipo** | `equipo.jefe` (nombrar/quitar Jefe) · `equipo.asignatura` (agregar/editar profes de materia) |
| **Seguimiento** | `avance.ver` · `pulso.ver` · `plan.fijar` (fechas) · `plan.historial` · `refuerzo.gestionar` |
| **Administración** | `profesor.autorizar` · `permisos.gestionar` (**el mantenedor**) · `perfiles.limpiar` · `enlace.armar` |

> La lista se deriva 1:1 de las funciones `kimun_prof_*` actuales; agregar una capacidad nueva es
> agregar un código y su casilla, no reescribir el motor.

### 2.2 · El ámbito

Cada **grant** ata un conjunto de capacidades a un nodo del árbol de inquilinos:

- **`permisos_usuario`** (`id`, `profesor_id → profesores`, `ambito_tipo`, `ambito_id uuid`,
  `capacidades text[]`, `asignaturas text[]`, `creado`, `creado_por`).
- `ambito_tipo` ∈ `'plataforma' | 'sostenedor' | 'colegio' | 'curso'`. `ambito_id` es el id de ese
  nodo (`null` para plataforma).
- `asignaturas` solo aplica al ámbito `curso` (mismas materias que hoy usa `curso_profesores`).
- Un usuario puede tener **varios grants** (p. ej. SuperUsuario del colegio A **y** profe de
  asignatura en el curso Y del colegio B).

⚠️ **Un grant sobre un nodo cubre todo lo que cuelga de él.** `avance.ver` sobre un colegio deja ver
el avance de todos sus cursos; sobre un sostenedor, de todos sus colegios; sobre la plataforma, de
todo. Es la herencia natural del árbol, y es lo que hace que Admin/Operador vean todo con un solo
grant de plataforma.

### 2.3 · Cómo deciden los porteros

Un portero `puede(capacidad, curso)` responde:

1. ¿`es_admin`? → sí (salta todo).
2. ¿existe un grant del usuario con esa `capacidad` cuyo ámbito **cubra** ese curso? — es decir el
   propio curso, **o** su colegio, **o** el sostenedor de su colegio, **o** plataforma. Para el
   ámbito `curso` con `asignaturas`, además la asignatura del contenido tiene que estar en la lista.

Hay versiones sin curso para lo que es de nivel superior: `puede_en_colegio(cap, colegio)` (crear
curso, autorizar, pulso) y `puede_en_sostenedor(cap, sostenedor)`.

⚠️ **No-escalada — la línea roja, con el cuidado de las auditorías 39 y 111:** `permisos.gestionar`
(operar el mantenedor) **nunca alcanza a un ámbito superior al del que otorga**, y **nadie puede
otorgarse a sí mismo una capacidad que no tiene, ni sobre un ámbito que no cubre**. Un usuario con
`permisos.gestionar` sobre el colegio A no puede darle permisos a nadie sobre el colegio B ni sobre
su sostenedor. `es_admin` se sigue escribiendo **solo por SQL a mano** (nunca por el mantenedor).
Esto es lo que el plan de la Fase 2 tiene que demostrar caso por caso.

## 3 · Los roles como presets

Un "rol" pasa a ser una **plantilla**: al elegirlo en el mantenedor, marca las casillas y arma el
grant típico. Admin/Operador pueden afinar desde ahí (dar o quitar casillas sueltas).

| Preset | Ámbito típico | Capacidades típicas |
|---|---|---|
| **Operador** | plataforma | todo lo operativo (todas menos las de dueño; ver §5) |
| **Sostenedor** | su sostenedor | `curso.*`, `equipo.*`, `avance.ver`, `pulso.ver`, `plan.*`, `refuerzo.*`, `profesor.autorizar` sobre su red |
| **SuperUsuario** | su colegio | igual que Sostenedor pero acotado a un colegio |
| **Profesor Jefe** | un curso | `alumno.gestionar`, `equipo.asignatura`, `avance.ver`, `plan.fijar`, `refuerzo.gestionar`, `inscripcion.crear`, `dominio.reiniciar` (todas las materias del curso) |
| **Profesor Asignatura** | un curso + materias | `avance.ver`, `plan.fijar`, `refuerzo.gestionar` (solo sus materias) |

⚠️ **`permisos.gestionar` NO entra en ningún preset salvo Operador**, porque los permisos los dan
Admin/Operador (decisión de Roberto). El motor lo soporta scoped a un sostenedor por si algún día un
Sostenedor gestiona a los suyos, pero el preset no lo incluye hoy.

## 4 · El mantenedor de usuarios (la pantalla)

Modal **"Editar permisos — ‹correo›"**, la cara que pidió Roberto:

- **Encabezado:** el correo del usuario y un master **"Acceso total"** (marca/desmarca todas).
- **Categorías** en tarjetas, cada una con **"marcar todas"** y sus casillas (§2.1). Casillas
  editables una por una; algunas con sub-casilla (p. ej. `avance.ver` → "permitir modificar fechas").
- **Selector de ámbito:** a qué **sostenedor / colegios / cursos (+materias)** alcanza este grant.
- **Presets:** botones "Aplicar rol: Sostenedor / Super / Jefe / Asignatura" que marcan lo típico,
  como punto de partida.
- **Lo opera Admin y Operador.** Un usuario se busca/crea por su **correo** (Supabase Auth), que es
  como ya se identifican los profesores hoy.

La pantalla vive en `profesor.html` y **reemplaza** los toggles y bloques sueltos de hoy
(Hacer Super, Hacer Operador, autorizar, equipo del curso, revocar): todo pasa por acá.

## 5 · Admin y Operador

- **Admin** (dueño): `es_admin`, SQL-only, salta todos los chequeos. Sin cambios.
- **Operador:** deja de ser una bandera aparte y pasa a ser **un grant de plataforma con el preset
  Operador** (todo lo operativo). Lo crea/quita el Admin desde el mantenedor. El rol Operador
  construido en la primera parte de la Sesión 116 (bandera `es_operador` + toggle) **se absorbe
  aquí** en la Fase 2 — su portero pasa a ser una capacidad, y el toggle se muda al mantenedor.

## 6 · Migración del piloto

El colegio San Francisco de Sales pasa a **un sostenedor con un colegio**, y todo lo actual queda ahí
sin que nadie pierda acceso:

- Se crea `sostenedores` (SFdS) y `colegios` (su colegio), y todos los `cursos` actuales reciben ese
  `colegio_id`.
- Cada `es_super` de hoy → un grant de **colegio** con el preset SuperUsuario sobre ese colegio.
- Cada `es_operador` de hoy → un grant de **plataforma** con el preset Operador.
- Cada fila de `curso_profesores` (Jefe/Asignatura) → un grant de **curso** con el preset y las
  materias correspondientes.
- `es_admin` queda igual.

Verificación de la migración: **cada persona ve exactamente lo mismo antes y después** — se comprueba
con una foto de acceso por usuario tomada antes del cutover.

## 7 · Las cuatro fases (se despliega junto, se construye en orden)

| Fase | Entregable | Riesgo |
|---|---|---|
| **1** | Inquilinos: tablas `sostenedores`/`colegios`, `cursos.colegio_id` nullable + migración del piloto. **Sin tocar permisos.** El panel gana el dato de colegio pero se comporta igual. | Bajo (aditivo) |
| **2** | El motor granular: `permisos_usuario`, los porteros nuevos, los presets, y la migración de `es_super`/`es_operador`/`curso_profesores` → grants. Verificado con la auditoría de no-escalada y la foto de acceso. | **Alto** (reescribe la autorización) |
| **3** | El mantenedor (la pantalla) sobre el motor. | Medio (UI + seguridad de la firma) |
| **4** | Cutover: apagar los toggles/bloques viejos; todo pasa por el mantenedor. Borrar el andamiaje de roles fijos que quede muerto. | Medio |

Cada fase tiene su propio plan en `docs/superpowers/plans/`. La Fase 1 se puede desplegar sola sin
peligro; de la 2 en adelante conviene un solo push coordinado (o feature-flag) porque cambia la
autorización.

## Fuera de alcance / lo que NO cambia

- El **juego** (los seis forks) no cambia: el alumno sigue con su `ALU-` por dispositivo. Solo el
  panel del profesor y el backend de permisos.
- El **informe del apoderado** (sin cuenta) no cambia.
- La **capa de programación/infraestructura** (GitHub, Supabase, Azure, DNS) no se toca.
- Los `es_admin` siguen siendo SQL-only; el mantenedor nunca crea Admins.

## Verificación (transversal a las fases)

- **Foto de acceso por usuario** antes y después de cada migración: mismo acceso, medido, no supuesto.
- **Auditoría de no-escalada** (estilo Sesión 111): un usuario con `permisos.gestionar` acotado no
  puede otorgar fuera de su ámbito ni por encima de su nivel; nadie se auto-asciende; `es_admin`
  intocable por RPC.
- **Panel por rol** con `scripts/panel-demo.py` + `scripts/cdp.mjs`: mirar qué ve y qué puede cada
  preset, y el mantenedor.
- **Control positivo/negativo** contra el RPC (400 `no_autorizado` vs 404 `PGRST202`) para cada
  función nueva, por el patrón de `docs/aplicar-schema.md`.
