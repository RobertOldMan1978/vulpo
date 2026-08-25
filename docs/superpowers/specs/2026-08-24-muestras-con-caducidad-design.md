# Enlaces de muestra con caducidad y token codificado (`?m=`)

**Fecha:** 2026-08-24
**Estado:** Diseño aprobado, pendiente de plan de implementación

## Contexto

Las Sesiones 41 y 42 dejaron el modo prueba (`?solo=`) y el armador de enlaces
(`?armar=1`). Roberto reparte esos enlaces como cuestionarios de muestra y quiere que
**dejen de servir pasado un tiempo**, para que una demostración no siga circulando meses
después.

Pidió también una clave de acceso. **Se descartó, de común acuerdo:** una clave viaja en
el mismo mensaje que el enlace, así que se reenvía junto con él. Sirve para filtrar *quién
entra*, no para que algo *deje de estar vivo*. Para el objetivo elegido la herramienta es
la caducidad.

**Lo que la caducidad NO hace, y hay que tener presente:** el juego completo es público y
gratuito en vulpo.cl. Caducar un enlace no impide jugar VULPO; solo apaga *esa muestra*. Su
función es "esta demostración terminó".

## Decisiones tomadas

| Punto | Decisión |
|---|---|
| Clave de acceso | **Fuera.** No sirve al objetivo. |
| Caducidad | Por fecha, opcional. Sin fecha = no caduca. |
| Formato del enlace | Un token codificado, `?m=…`, sin datos a la vista. |
| `?solo=` | **No se toca.** Sigue igual y sin caducidad. |
| Al vencer | Pantalla sobria con la fecha y un enlace al juego completo. |
| Token corrupto | Cae al juego normal, sin errores. |
| Lector de enlaces | Sí: pegar un enlace en el armador dice qué contiene. |

## El token `?m=`

    https://vulpo.cl/?m=aGlzdC1jYXAyLGhpc3QtY2FwM3wyMDI2LTA5LTE1fA

**Contenido:** los ids de capítulos, la fecha de caducidad y si se muestran las respuestas,
en un solo parámetro y sin pistas a la vista. Un enlace con caducidad y uno sin ella se ven
idénticos.

**Formato interno:** `ids separados por coma | fecha AAAA-MM-DD | '1' si respuestas`,
codificado en **base64url** (base64 estándar con `+`→`-`, `/`→`_` y sin `=` al final, para
que viaje limpio en una URL).

**Esto es un disfraz, no un cifrado, y así se documenta.** Base64 es un formato público:
quien reconozca el patrón lo revierte en un minuto. Lo que consigue es quitar la
invitación obvia — ver `&hasta=2026-09-15` en la barra de direcciones prácticamente pide
que le cambien la fecha; ver `?m=aGlzdC1jYXAy…` no sugiere nada. Es proporcional al
objetivo: que el enlace no siga circulando vivo, no detener a alguien técnico.

**Se compara contra el reloj del dispositivo**, que el visitante también puede cambiar.
Misma categoría de límite, aceptado.

**Vigencia inclusiva:** un enlace con `hasta=2026-09-15` funciona durante todo el 15 de
septiembre y deja de servir el 16.

## Comportamiento

### Al abrir un `?m=` válido y vigente

Idéntico a `?solo=` hoy: modo prueba con los capítulos del token, todos abiertos, sin
guardar nada. El token alimenta las mismas variables `SOLO` y `QA` que ya existen, así que
toda la maquinaria posterior (`PRUEBA`, `MODO_ABIERTO`, `EFIMERO`, `SIN_DISCO`) funciona sin
cambios.

### Al abrir un `?m=` vencido

Una pantalla propia, sin acceso a los capítulos:

> **Esta muestra ya no está disponible**
> Venció el 15 de septiembre de 2026.
> [Ir al juego completo]

El botón lleva a `location.origin + location.pathname` — el juego normal, sin parámetros.
No se escribe ningún dominio a mano, así que funciona igual en local y en producción.

### Al abrir un `?m=` corrupto o editado

Cae al juego normal, exactamente como hace hoy `?solo=` con un id inventado. Sin errores en
consola ni pantallas rotas.

## El armador

Se le agregan tres cosas:

1. **Campo de fecha** (`<input type="date">`) con tres atajos: **Sin caducidad · 1 semana ·
   1 mes**. Sin caducidad es el valor por defecto.
2. **El enlace generado pasa a ser `?m=…`**, siempre, tenga o no caducidad.
3. **Resumen en castellano** bajo el enlace, para no depender de descifrarlo mentalmente:
   *"3 capítulos · vence el 15 de septiembre de 2026 · con respuestas"*, o
   *"1 capítulo · sin caducidad"*.

### Lector de enlaces

Un campo aparte donde se pega un enlace `?m=…` y responde qué contiene: los nombres de los
capítulos, la fecha de caducidad y si ya venció. Es el contrapeso de haber ocultado los
datos: sin esto, un enlace viejo encontrado dentro de unos meses sería ilegible incluso
para Roberto.

Si lo pegado no es un enlace válido, responde "No pude leer ese enlace" y nada más.

Acepta tanto el enlace completo (`https://vulpo.cl/?m=…`) como el token suelto.

## Verificación

1. Armar un enlace sin caducidad → abre normal, con sus capítulos.
2. Armar uno con caducidad futura → abre normal.
3. Tomar ese mismo enlace y cambiar el reloj del sistema, o construir un token con fecha
   pasada → muestra la pantalla de vencido con la fecha correcta en castellano.
4. Un enlace que vence **hoy** → **abre** (vigencia inclusiva).
5. `?m=` con basura (`?m=xxxx`) → juego normal, consola limpia.
6. `?solo=hist-cap2,hist-cap3,hist-cap4` → sigue funcionando igual que hoy, sin caducidad.
7. El armador muestra el resumen correcto en las tres variantes (sin caducidad, con
   caducidad, con respuestas).
8. El lector devuelve capítulos, fecha y estado, tanto con enlace completo como con token
   suelto, y avisa cuando no puede leer.
9. Ni el armador ni la pantalla de vencido escriben en `localStorage` ni llaman a Supabase.
10. El juego sin parámetros y `?qa=1` siguen intactos.

## Límites conocidos (aceptados)

- **El token es reversible.** Base64 no es cifrado. Quien lo reconozca ve el contenido y
  puede fabricarse un enlace sin caducidad.
- **La fecha se compara con el reloj del visitante**, que se puede atrasar.
- **Caducar el enlace no cierra el juego**, que es público en vulpo.cl.
- **No hay revocación.** Un enlace repartido vive hasta su fecha; no se puede apagar antes
  sin cambiar el código. Revocar de verdad exigiría Supabase, y se descartó por el costo
  (tabla, función, aplicar el SQL a mano) frente al objetivo.
