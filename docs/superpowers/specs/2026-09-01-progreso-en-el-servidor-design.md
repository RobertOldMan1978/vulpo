# Progreso en el servidor (Bloque D)

**Fecha:** 01/09/2026 · **Estado:** diseño aprobado, sin implementar

## El problema

El XP y el mapa de dominio ya viven en Supabase. **Las monedas, las skins y el avance de campaña
viven solo en `localStorage`.** Mientras siga así, prometerle a un apoderado que su hijo cambia de
teléfono y recupera todo **sería falso**, y eso es justamente lo que el modelo de suscripción tiene
que poder prometer.

No es un problema de la PWA ni depende de ella.

## Qué resuelve, y qué NO

**Resuelve: restaurar.** El niño cambia de teléfono, lo formatea o borra los datos del navegador;
canjea su `ALU-` y recupera monedas, skins, insignias y avance de campaña. Se asume **un aparato a
la vez**.

**No resuelve: sincronizar.** El mismo niño jugando en el teléfono y el tablet el mismo día, con los
dos al día, es otro problema —obliga a fundir estados divergentes— y **se descarta a propósito**.
Cubre bastante menos del caso real y cuesta bastante más.

> **Límite honesto, que hay que saber antes de venderlo:** el avance lo reporta el teléfono, igual
> que el XP. Un niño que sepa puede darse monedas en su propio aparato, y al subirlo esa trampa se
> vuelve **durable**. Esto no convierte el avance en un dato confiable: lo convierte en uno que no se
> pierde. Para el XP existe `kimun_prof_xp_fijar`; para el resto no hay corrección, y no se construye
> una porque nadie la ha pedido.

## La forma elegida: una foto completa en JSON

Medido en el navegador con todas las rutas al máximo y todas las skins compradas:

| | Save completo |
|---|---|
| 3° (27 rutas) | **9,4 KB** |
| 8° (20 rutas) | **7,7 KB** |

Cabe entero en una llamada. No hay que sincronizar campo por campo.

Se descartaron dos alternativas:

- **Columnas normalizadas** (`monedas`, `skins[]`, una fila por ruta). Su ventaja —resolver
  conflictos campo por campo— **no se necesita**, porque el alcance es restaurar y no sincronizar. Y
  su costo es real: cada campo nuevo del save pide una migración de esquema, que en este proyecto
  significa que Roberto va a pegar SQL a mano. El juego le agrega campos al save seguido
  (`mateLecciones` en la Sesión 29, `metasVistas` y `semaforo` en la 52): con una foto, un campo
  nuevo viaja solo.
- **Híbrido** (foto + columnas sueltas para el panel). Dos fuentes de verdad para el mismo número. Lo
  que daría se consigue leyendo el JSON (`datos->>'monedas'`).

## Modelo de datos

```sql
create table if not exists public.progreso (
  perfil_id    uuid primary key references public.perfiles(id) on delete cascade,
  datos        jsonb       not null,
  actualizado  timestamptz not null default now()
);
alter table public.progreso enable row level security;   -- sin politicas: todo por funciones
```

- **Una fila por alumno**, por eso `perfil_id` es la clave primaria.
- `on delete cascade` sigue la postura de privacidad del proyecto: se va el niño, se van sus datos.
- **RLS activo y sin políticas de lectura**, como las otras 14 tablas: nada se consulta directo.

**No hace falta una columna `nivel` ni separar por curso.** Un alumno pertenece a un curso, y el
curso a un nivel; su `ALU-` lo vincula a un solo perfil. Un mismo niño que además abriera otro curso
sería un perfil anónimo distinto, sin `ALU-`, y por lo tanto sin foto.

## Funciones del servidor

Las dos son `security definer`, resuelven al alumno con `kimun_yo()` y **no reciben ningún id** — el
patrón de `kimun_xp` y `kimun_dominio`.

| Función | Qué hace |
|---|---|
| `kimun_progreso_subir(p_datos jsonb)` | Upsert sobre `perfil_id = kimun_yo()`. **Rechaza payloads sobre 64 KB** |
| `kimun_progreso_bajar()` | Devuelve `datos` y `actualizado` del alumno, o nada |

**El tope de 64 KB** son 6× el máximo medido (9,4 KB). Existe para que un bug del cliente o alguien
curioso no llene la base; no para ajustar fino.

⚠️ **Las dos van al `grant execute`.** PostgreSQL le da `EXECUTE` a `PUBLIC` por defecto, así que
omitir una función de la lista **no la protege** — es la lección de la Sesión 19.

## Cliente: cuándo sube

Enganchada a `guardar()`, con el patrón de `sincronizarXP`: **rebote de 15 s**, best-effort, nunca
interrumpe la partida, y un fallo no se muestra.

Dos diferencias respecto del XP, las dos deliberadas:

1. **No sube si el JSON es idéntico al último enviado.** `guardar()` corre en cada respuesta, y casi
   siempre no cambió nada que justifique 9 KB. Se compara la cadena completa y no un hash: es más
   barato que calcularlo y no tiene colisiones.
2. ⚠️ **No sube en `EFIMERO`** (`?qa=1` y los enlaces de muestra `?solo=` / `?m=` / `?rev=1`). **Esta
   es la diferencia importante con el XP y hay que respetarla:** el XP es un número que solo sube,
   pero la foto es un **reemplazo completo**. Abrir `?qa=1` en un teléfono vinculado a un alumno real,
   completar una etapa para revisar algo y que eso suba, le **pisa la partida del año**. El XP no
   tiene esa forma de fallar; la foto sí.

**No hace falta una cola de reintentos** como la de `dominio`. La foto es completa e idempotente, así
que el próximo envío que sí llegue lleva todo. `dominio` necesita su cola porque manda **eventos**,
que se pierden si no llegan.

## Cliente: cuándo baja

**Un solo momento: justo después de canjear el `ALU-`.**

No hace falta otro. Si el niño borra los datos del navegador se lleva también la sesión de Supabase,
así que **su única entrada de vuelta ya es volver a canjear**, que es como el proyecto lo documenta
desde la Sesión 19. Un solo momento es fácil de razonar y de probar.

**Si la bajada falla por conexión**, queda una marca en disco (`kimun_prog_bajado<SUFIJO>`) y se
reintenta al abrir el juego mientras esa marca no esté puesta. Sin eso, un fallo de red se lleva la
promesa en silencio, que es el modo de fallar más caro de este proyecto.

## Los tres caminos al canjear

| Servidor | Este teléfono | Qué pasa |
|---|---|---|
| vacío | lo que sea | **Sube** lo local. Sin pantalla |
| con foto | recién empezado | **Baja** en silencio. Sin pantalla |
| con foto | con avance real | **Pregunta** (pantalla de abajo) |

**«Recién empezado»** = sin XP y sin ninguna etapa completada. Así el caso principal —el teléfono
nuevo— no muestra ningún diálogo: el niño canjea y aparece todo, que es la promesa entera.

## La pantalla de conflicto (`scr-progreso`)

```
        🎒 Encontramos tu avance guardado

   GUARDADO (hace 3 días)      ESTE TELÉFONO
   Nivel 12 · 8 capítulos      Nivel 4 · 2 capítulos
   1.240 monedas · 6 skins     310 monedas · 2 skins

   [ Usar el guardado ]    [ Seguir con este teléfono ]
```

- **Los dos botones pesan igual.** No hay uno por defecto que destruya en silencio.
- El resumen sale de un helper `resumenAvance(save)` → `{xp, capitulos, monedas, skins}`, donde
  **capítulos** cuenta las rutas cuyo último nodo (el jefe) está en `done`.
- **El lado que pierde se guarda** en `localStorage` bajo `kimun_save_previo<SUFIJO>` (~10 KB, sin
  interfaz). Es una salida de emergencia si un apoderado reclama, y este proyecto no destruye cosas
  sin dejar por dónde volver.
- Vive en el HTML de cada fork, **idéntica en los tres**, como el resto de las pantallas (`scr-pred`
  sentó ese precedente en la Sesión 74). No la inyecta el motor.

## ⚠️ El cruce con el XP, que es lo único que puede romper algo vivo

`S.xp` viaja dentro de la foto, pero el XP **ya tiene su propio camino**: `kimun_xp` solo sube, y el
profesor puede corregir un XP inflado con `kimun_prof_xp_fijar` — la única forma de bajarlo.

Si un teléfono nuevo baja una foto vieja con 900 XP después de que el profesor lo corrigió a 500, el
siguiente `guardar()` manda 900, el servidor toma el mayor y **la corrección del profesor se deshace
sola**, sin ningún error.

**La regla que lo cierra: al bajar la foto, el XP lo manda el servidor, no la foto.** Se aplica solo
en el camino de bajada.

Por lo mismo, **la foto no sobrescribe `alumno` ni `curso`**: esos vienen del canje que acaba de
ocurrir, y la foto podría traerlos viejos.

## La tarea D4 desaparece

`pendiente.md` listaba «D4 · Migración cortés del avance que ya vive en los teléfonos» como trabajo
aparte. Con una foto **no hay migración**: el primer `guardar()` después de la actualización sube lo
que el niño ya tenía. Se cierra sin escribir código.

## Alcance del cambio

| Archivo | Qué |
|---|---|
| `supabase/schema.sql` | La tabla y las dos funciones. **Lo aplica Roberto a mano** |
| `assets/js/motor.js` | Subida, bajada, `resumenAvance` y el ruteo de los tres caminos. **Una edición para los tres cursos** |
| `juego/index.html`, `7mo/index.html`, `3ro/index.html` | La pantalla `scr-progreso`, idéntica en los tres |

No se toca `profesor.html`, ni `contenido/`, ni ningún banco. El cambio vive en **dos capas**: motor
e infraestructura.

**Orden de publicación: el esquema primero.** No hay ningún `drop function` —son funciones nuevas—,
así que el riesgo es bajo; pero si el cliente sale antes, la bajada al canjear falla hasta el
reintento.

## Verificación

Con `scripts/cdp.mjs`, jugando y en los tres cursos:

- Los **tres caminos** de la tabla: servidor vacío, teléfono recién empezado, y ambos con avance.
- Las **dos ramas de la pantalla** de conflicto, y que el lado perdedor quedó en el respaldo.
- Que el mismo save **no se suba dos veces** seguidas.
- Que **`?qa=1` y los enlaces de muestra no suban nada** — el hallazgo del diseño.
- Que el juego **siga jugándose sin conexión**, sin interrupciones ni errores visibles.
- Que un **XP corregido por el profesor sobreviva** a bajar una foto vieja.
- Que `kimun_progreso_subir` **rechace** un payload sobre 64 KB.
- Regresión de siempre: **cero errores de consola, cero 404**, el guardado de 8° intacto tras jugar en
  los otros dos, y las tres claves de disco conviviendo.

## Fuera de alcance

- **Sincronizar dos aparatos a la vez** (decidido arriba).
- **Corregir el avance desde el panel**, como existe para el XP. Nadie lo ha pedido, y agrega una
  pantalla y una función por una necesidad hipotética.
- **Que el progreso viaje entre niveles.** Cada curso es una app con su identidad separada, a
  propósito desde la Sesión 58.
- **Dos hermanos en el mismo tablet.** Con esto mejora de hecho —cada uno recupera lo suyo al
  canjear— pero no se construye nada para ese caso, y el modelo sigue siendo un vínculo por aparato.
