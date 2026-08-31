# M4 · Un solo catálogo de niveles (`niveles.js`)

**Fecha:** 2026-08-30 · **Estado:** diseño aprobado, sin implementar

## El problema

Dar de alta un curso obliga hoy a escribir la misma información en **ocho listas a mano**,
repartidas en tres archivos y dos lenguajes:

| Dónde | Lista | Línea |
|---|---|---|
| `supabase/schema.sql` | `kimun_oa_asignatura` | 287 |
| `supabase/schema.sql` | `kimun_prof_asignaturas` — **dos arreglos idénticos** | 624 |
| `profesor.html` | `OA_CARPETA` | 236 |
| `profesor.html` | `NIVELES_MUESTRA` | 681 |
| `profesor.html` | `ASIG_NOMBRE` | 688 |
| `profesor.html` | `ASIG_ORDEN` | 693 |
| `profesor.html` | `SB_asigDe` | 969 |
| `juego/`, `7mo/`, `3ro/` | `ASIG_DESAFIO_NOMBRE` | ×3 |

`SB_asigDe` es lo peor del conjunto: **un espejo, escrito a mano en JavaScript, de la función
`kimun_oa_asignatura` que vive en PostgreSQL**. Las dos hacen lo mismo línea por línea.

```js
if(s.slice(0,4)==='MA03') return 'MA03';      // profesor.html
```
```sql
when p_oa like 'MA03%'  then 'MA03'           -- schema.sql
```

Es el patrón que ya causó un defecto real (Sesión 37: faltaba Matemática en una lista y no se
podía lanzar su refuerzo). Y **cuando falla no da error**: si a `kimun_prof_asignaturas` le falta
un código, ese contenido queda invisible para el Profesor Jefe y no hay nada que mirar.

**Medido el 30/08/2026: los dos lados reconocen los mismos 18 códigos, o sea hoy están
sincronizados.** Nadie las ha desincronizado todavía. Pero con 4°, 5° y 6° por delante son 12
códigos más × 8 listas ≈ **96 ediciones a mano**, y basta que una se olvide.

## La observación que hace chico el diseño

Casi ninguna de esas listas necesita existir, porque **el código ya contiene la información**:
`HI08` es `HI` (Historia) + `08` (el nivel).

| Lista | ¿Hace falta? |
|---|---|
| `kimun_oa_asignatura` | **No** — devuelve los 4 primeros caracteres |
| `OA_CARPETA` | **No** — `HI08` → `historia-8basico` sale de 4 prefijos + el nivel |
| `ASIG_NOMBRE` | **No** — mismo origen |
| `ASIG_ORDEN` | **No** — es ordenar por nivel y por asignatura |
| `ASIG_DESAFIO_NOMBRE` (×3) | **No** — mismo origen |
| `kimun_prof_asignaturas` | **Sí, uno** (hoy son dos copiados) |
| `NIVELES_MUESTRA` | **Sí** — `08`→`/juego/` es arbitrario, no derivable |

Es la regla que el proyecto ya tiene escrita —*"la convención de nombres ES la configuración"*—
aplicada donde todavía no estaba. Y es el mismo movimiento que la Sesión 72 hizo con
`registrarOA`, que dejó de consultar una lista de prefijos y pasó a mirar la **forma** del código.

## El diseño

### `assets/js/niveles.js`

Guarda solo lo que no se puede derivar:

```js
NIV.ASIGS   = { HI:{nombre:'Historia',   carpeta:'historia',    orden:1},
                MA:{nombre:'Matemática', carpeta:'matematicas', orden:2},
                CN:{nombre:'Ciencias',   carpeta:'ciencias',    orden:3},
                LE:{nombre:'Lenguaje',   carpeta:'lenguaje',    orden:4} }

NIV.NIVELES = [ {n:8, etiqueta:'8° básico', ruta:'/juego/'},
                {n:7, etiqueta:'7° básico', ruta:'/7mo/'},
                {n:3, etiqueta:'3° básico', ruta:'/3ro/'} ]

// Tabla CERRADA: los módulos transversales no llevan el nivel en su código y por eso
// no se derivan. No crece al agregar un curso.
NIV.TRANSVERSALES = { 'VOC-HIST':'HI08', 'VOC-CIEN':'CN08', 'VOC-MATE':'MA08',
                      'VOC-LENG':'LE08', 'VOC-LECT':'LE08' }   // y el prefijo AF-
```

Y expone lo derivado:

| Función | Devuelve | Reemplaza |
|---|---|---|
| `NIV.codigos()` | `['HI08','MA08','CN08','LE08','HI07',…]` en orden canónico | `ASIG_ORDEN` |
| `NIV.asigDe(oa)` | `'HI08'` o `null` | `SB_asigDe` |
| `NIV.nombre(cod)` | `'Historia'` / `'Historia 3°'` | `ASIG_NOMBRE` |
| `NIV.carpeta(cod)` | `'historia-8basico'` | `OA_CARPETA` |
| `NIV.NIVELES` | tal cual | `NIVELES_MUESTRA` |

`profesor.html` lo carga con `<script src>` **y su respaldo vacío**, el patrón que ya usan
`SENSIBLE`, `CALC` y `REV`. Si el archivo no carga, el panel degrada a mostrar códigos en vez de
nombres, pero **no se cae**.

### El servidor

- **`kimun_oa_asignatura`** deja de enumerar. Si el código tiene forma de currículum
  (`^[A-Z]{2}[0-9]{2} OA [0-9]{2}$`), devuelve sus 4 primeros caracteres; si no, consulta la tabla
  de transversales. **Deja de crecer con cada nivel.**
- **Los dos arreglos gemelos** de `kimun_prof_asignaturas` pasan a una función
  `kimun_asignaturas_todas()`, que es el único punto del servidor que hay que tocar al sumar un
  curso.

### Los tres juegos: derivan, NO cargan el archivo

`ASIG_DESAFIO_NOMBRE` se reemplaza por una función corta que deriva el nombre del código,
**idéntica byte a byte en los tres forks** — que es justo el objetivo del trabajo.

**No se les agrega un `<script src>` a propósito.** Sería una dependencia dura en el arranque a
cambio de cuatro cadenas de texto, y este proyecto ya pagó esa factura: un 404 de `revision.js`
mató todo el JavaScript del juego, con un síntoma que engaña —la pantalla se ve bien y ningún
botón responde—.

## Alternativas consideradas y descartadas

**Un comodín `'*'` que signifique "todas las asignaturas"**, para eliminar también la enumeración
del servidor y dejar el alta de un curso en **un solo** punto de edición. Descartado: hay **7
sitios** que hacen `= any(kimun_prof_asignaturas(...))` en el camino de permisos, más el panel que
muestra `mis_asignaturas`. Olvidar uno falla **cerrado** —niega el acceso, no lo concede—, así que
no sería un agujero de seguridad, pero sí un fallo visible; y no vale el riesgo por ahorrar una
línea al año.

**Generar el SQL desde el catálogo con un script.** Descartado por innecesario una vez que
`kimun_oa_asignatura` se vuelve estructural: lo que queda por generar es una sola línea.

## Lo que hay que respetar

1. **`kimun_oa_asignatura` NO puede volverse puramente estructural.** También mapea `VOC-HIST` →
   `HI08` y `AF-T1` → `LE08`, y **hay filas históricas de 8° en producción con esos códigos**
   (Vocabulario y Ana Frank están desde la Sesión 30). Si se vuelve estructural a secas, ese
   avance **desaparece del panel del profesor sin ningún error**.
2. **El orden del filtro de 3° cambia.** Hoy es `MA, HI, LE, CN` mientras 8° y 7° son
   `HI, MA, CN, LE` — una inconsistencia escrita a mano. Al derivar, los tres quedan iguales. Es
   cosmético, pero se ve y hay que decirlo.
3. **El orden de los niveles es descendente** (8, 7, 3) y así debe quedar.
4. **`CA-T1…CA-T10`** (el libro *Cuentos de Ada*) no lo conoce ninguna de las dos listas, y **está
   bien**: desde la Sesión 72 `registrarOA` solo manda al servidor lo que tiene forma de código
   curricular, así que un `CA-` nunca llega. No hay que agregarlo.
5. **Hay que re-aplicar `supabase/schema.sql` a mano**, y toca dos funciones de permisos.

## El resultado

Dar de alta un curso pasa de **~24 puntos de edición en 3 archivos** a **2**:

1. una fila en `NIV.NIVELES`
2. los 4 códigos en `kimun_asignaturas_todas()` (+ re-aplicar el esquema)

## Verificación

- El panel abre y el filtro por asignatura lista los mismos códigos que hoy, con los mismos
  nombres. Se compara contra una captura del comportamiento actual, no contra la memoria.
- El panel **sobrevive si `niveles.js` no carga** (probado apuntando a un archivo inexistente).
- Los tres juegos juegan una etapa real, con cero 404 y cero errores de consola.
- El banner y el título del **desafío de refuerzo** siguen mostrando el nombre correcto en los
  tres niveles.
- En el servidor: `kimun_oa_asignatura` devuelve lo mismo que hoy para **los 18 códigos** y para
  los transversales, y `null` para un código inventado.
- **Aislamiento entre profesores**: un profe de asignatura sigue recibiendo `no_autorizado` al
  actuar sobre una asignatura ajena. Es la prueba que no puede saltarse, porque el cambio toca dos
  funciones de permisos.
