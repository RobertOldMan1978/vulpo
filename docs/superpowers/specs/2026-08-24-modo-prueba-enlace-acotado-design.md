# Modo prueba: enlace acotado a capítulos sueltos (`?solo=`)

**Fecha:** 2026-08-24
**Estado:** Diseño aprobado, pendiente de plan de implementación

## Contexto

Roberto necesita pasarle a un grupo de alumnos un enlace para que **prueben** tres
capítulos concretos de Historia —`hist-cap2` (Los europeos llegan a América),
`hist-cap3` (El mundo colonial) y `hist-cap4` (Chile colonial y las nuevas ideas)—
sin que tengan que jugarse antes el capítulo 1 y sin que la prueba deje rastro.

Hoy no se puede. El motor encadena los capítulos: `nodoCampDesbloqueado` abre el
capítulo N solo si el N-1 está completo. El único atajo que existe es `?qa=1`, que
desbloquea todo **pero además marca la respuesta correcta** en cada pregunta
(clase `.qa-ok`), así que no sirve para que alguien juegue de verdad.

Objetivo: un enlace que muestre solo los capítulos elegidos, con todo abierto
dentro de ellos, dificultad normal (respuestas sin marcar) y sin persistir nada.

## Decisiones tomadas

| Punto | Decisión |
|---|---|
| Alcance | Solo los capítulos listados. Nada de otras asignaturas, otros capítulos, Jefe Final de campaña, Duelo, Tienda, Logros ni canje de código. |
| Desbloqueo | **Todo abierto** dentro de esos capítulos: los 5 nodos de cada uno, jefe de capítulo incluido. |
| Respuestas | **Sin marcar.** Dificultad normal. Es la diferencia central con `?qa=1`. |
| Persistencia | **Nada.** Ni `localStorage` ni Supabase. El progreso vive en memoria mientras la pestaña esté abierta. |
| Identidad | Entran como invitados, sin pedir nombre ni código `ALU-`. |
| Aviso | Sí: banda visible "🧪 Modo prueba · no se guarda tu avance". |
| Sintaxis | Parámetro genérico con la lista de ids, reutilizable para cualquier subconjunto. |

## El enlace

    https://vulpo.cl/?solo=hist-cap2,hist-cap3,hist-cap4

`?solo=` recibe ids de `EXPEDICIONES` separados por coma. **Sin el parámetro, el
juego se comporta exactamente como hoy.**

Se eligió el parámetro genérico por sobre un alias corto (`?demo=colonial`) para que
Roberto pueda armar cualquier combinación sin pedir un cambio de código. Ponerle
nombre corto a un paquete que se use seguido queda como agregado posterior, sobre
esta misma base.

## Diseño técnico

Todo ocurre en `index.html`. No se toca `profesor.html`, ni Supabase, ni
`supabase/schema.sql`.

### 1. Separar la constante `QA` en tres ideas

Hoy `const QA` (línea ~1015) mezcla tres comportamientos distintos en unos 15 usos.
Hay que separarlos en banderas independientes, **sin cambiar lo que hace `?qa=1`**:

| Bandera | Qué hace | `?qa=1` | `?solo=` | normal |
|---|---|---|---|---|
| `MODO_ABIERTO` | Ignora los candados de progresión | ✅ | ✅ | ❌ |
| `QA_MARCA` | Pinta la respuesta correcta (`.qa-ok`) | ✅ | ❌ | ❌ |
| `EFIMERO` | No escribe en disco ni sincroniza | ✅ | ✅ | ❌ |

Reparto de los usos actuales de `QA`:

- **→ `MODO_ABIERTO`:** `nivelCalcDesbloqueado`, `jefeCalcDesbloqueado`,
  `nodoCampDesbloqueado`, `desafioDesbloqueado`, `jefeFinalDesbloqueado`,
  `capMateCompleto` (~2708), `jefeFinalMateDesbloqueado`.
- **→ `QA_MARCA`:** los cuatro puntos que aplican `.qa-ok` (~2079, ~2799, ~3071, ~3292).
- **→ `EFIMERO`:** el corte de medición de dominio (~2302) y el de sincronización
  (~3506), que hoy ya se saltan bajo QA.

Ese reparto es el punto delicado del trabajo: hay que verificar que `?qa=1` siga
comportándose igual que antes.

### 2. La lista de capítulos permitidos

Una constante `SOLO` con los ids del parámetro (vacía = juego completo). Cuando trae
ids, el arranque se salta `scr-rol` y abre directamente la lista de capítulos,
reutilizando `abrirCampaña` con `camp.capitulos` **filtrado** por `SOLO`. Así la
pantalla se ve idéntica a la que ya conocen (tarjetas con portada, número y
"¡Jugar!"), sin código de render nuevo.

Ids desconocidos en el parámetro se ignoran. Si tras filtrar no queda ninguno
válido, se cae al juego normal en vez de mostrar una pantalla vacía.

Se ocultan: barra de navegación (Tienda y Logros no tienen sentido sin guardado),
Duelo, canje de código y el Jefe Final de la campaña (exige los 5 capítulos).

El invitado arranca con nombre fijo `Invitado` y un avatar por defecto de `AVATARES`,
para que la interfaz (encabezado, resultados, jefe) tenga qué mostrar sin pedirle nada
al alumno.

**Combinar `?solo=` con `?qa=1`** es válido y sirve para revisar contenido: manda
`?qa=1`, es decir, se marcan las respuestas dentro del subconjunto acotado.

### 3. No escribir nada

- `guardar()` (~2210) retorna sin tocar `localStorage` cuando `EFIMERO`.
- `sincronizarXP()` y el resto de llamadas a Supabase quedan inertes porque
  `MI_PERFIL` nunca se llena (no hay canje).
- **Requisito explícito:** el guardado que ya exista en ese teléfono bajo
  `kimun_save` **no se toca ni se borra**. Un alumno que ya venía jugando debe
  encontrar intactas sus monedas, skins y campañas después de probar el enlace.

### 4. Aviso en pantalla

Banda reutilizando el estilo `.qa-badge`, con texto "🧪 Modo prueba · no se guarda
tu avance", para que nadie se frustre al volver y no encontrar su progreso.

## Verificación

En el navegador (`preview_start`), sobre los tres enlaces:

1. `?solo=hist-cap2,hist-cap3,hist-cap4` → se ven **solo** esos tres, los tres
   abiertos; entrar a uno muestra sus 5 nodos abiertos; las preguntas **no** traen
   respuesta marcada; no aparecen Tienda, Logros, Duelo ni canje.
2. `?qa=1` → **idéntico a antes**: desbloquea y marca respuestas.
3. Sin parámetro → juego normal, capítulos encadenados como siempre.
4. Sembrar un `kimun_save` de prueba, entrar por `?solo=`, jugar, cerrar: el
   `kimun_save` sigue igual.
5. Consola sin errores en los tres casos.

## Límites conocidos (aceptados)

- **El enlace no es un candado.** Al ser un sitio estático, un alumno puede borrar
  el parámetro y llegar al juego completo. Aceptado: es el mismo juego y no se
  guarda nada.
- **Concurrencia:** no es un problema. GitHub Pages sirve archivos estáticos y el
  modo prueba no toca el backend, así que da lo mismo cuántos entren a la vez.
- **Sin registro:** por definición, el avance de estos alumnos no llega al panel del
  profesor ni al ranking del curso. Es lo pedido.
