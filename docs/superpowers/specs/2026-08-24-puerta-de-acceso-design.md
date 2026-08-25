# Puerta de acceso: demo gratuita + código obligatorio, con aviso previo

**Fecha:** 2026-08-24
**Estado:** Diseño aprobado, pendiente de plan de implementación

## Contexto

VULPO está hoy **completamente abierto**: cualquiera que escriba `vulpo.cl` juega las cuatro
asignaturas enteras. Nunca se le puso una puerta porque hasta ahora no se necesitaba.

Roberto decidió que el juego deje de ser gratuito. Ya está repartiendo enlaces a apoderados y
no quiere que un colegio que no contrató tenga a sus alumnos jugando gratis.

**El código `ALU-` ya existe pero no es una puerta.** Hoy es opcional: el alumno juega
perfectamente sin él, y el código solo sirve para entrar al ranking de su curso y para que su
avance llegue al panel del profesor. Es un premio, no un requisito. Este diseño lo convierte en
la llave.

### Lo que este diseño NO tapa (verificado, no supuesto)

El 24/08/2026 se comprobó contra el sitio en vivo que **las 2.536 preguntas del proyecto son
descargables por cualquiera**, con sus respuestas correctas, pidiendo directamente los archivos:

| Archivo público | Preguntas |
|---|---|
| `contenido/historia-8basico/preguntas.json` | 663 |
| `contenido/matematicas-8basico/preguntas.json` | 603 |
| `contenido/ciencias-8basico/preguntas.json` | 534 |
| `contenido/lenguaje-8basico/preguntas.json` | 514 |
| `contenido/vocabulario/preguntas.json` | 150 |
| `contenido/lectura-anafrank/preguntas.json` | 72 |

No es un descuido: es cómo funciona un sitio estático. El navegador necesita esos archivos para
jugar, así que se los entrega a quien los pida.

**Por lo tanto esta puerta es un bloqueo blando**, de la misma familia que la contraseña del
tablero. Detiene al apoderado, al alumno y al colegio que no pagó — el 99% de los casos reales.
No detiene a quien sepa editar el almacenamiento del navegador o pedir el archivo directo.
Cerrar de verdad exige mover el contenido a Supabase y servirlo pregunta a pregunta: es un
proyecto aparte, de meses. Se decidió no hacerlo
ahora, porque protegería lo único reemplazable del producto (las preguntas son un commodity)
mientras que lo difícil de copiar —panel del profesor, ranking real, mapa de dominio— ya está
detrás de Supabase Auth.

## Decisiones tomadas

| Punto | Decisión |
|---|---|
| Demo gratuita | **Solo `hist-cap1`** ("Los inicios de la modernidad"): 4 etapas + jefe, ~55 preguntas. |
| Todo lo demás | Cerrado con candado y mensaje "Necesitas un código de tu profesor". |
| Llave | El código `ALU-` que ya existe, revalidado contra Supabase al arrancar. |
| Conexión caída | Vale la última licencia confirmada: una caída a mitad de partida no expulsa a un alumno con licencia. |
| Activación | **Con aviso previo**, controlado por una sola constante de fecha. |
| Excepciones | Los enlaces de muestra (`?solo=`, `?m=`) y `?qa=1` no pasan por la puerta. |

## Las tres fases, con una sola constante

Todo el comportamiento lo gobierna `FECHA_PUERTA` en `index.html`, con formato `AAAA-MM-DD`:

| Valor | Qué pasa |
|---|---|
| `''` (vacío) | **Nada cambia.** El juego sigue como hoy, abierto. Es el valor con que se publica. |
| Fecha futura | **Aviso.** Todo sigue abierto, pero se ve el mensaje de que desde esa fecha hará falta código. |
| Fecha de hoy o pasada | **Puerta cerrada.** Solo la demo sin código. |

Esto tiene dos propiedades que importan:

1. **Publicar es inocuo.** El código llega a producción sin cambiar nada para nadie. Roberto
   activa el aviso cuando el lado comercial esté listo, editando una línea.
2. **El cierre ocurre solo.** No hay que estar despierto ese día ni hacer un despliegue: llegada
   la fecha, la puerta se cierra sin intervención.

La comparación usa `hoyISO()`, la función que ya existe para la caducidad de las muestras.

## El aviso previo

Mientras `FECHA_PUERTA` sea futura, en la pantalla de inicio aparece una banda visible:

> **Desde el 15 de octubre necesitarás un código de tu profesor para seguir jugando.**
> Pídeselo a tu colegio · ¿Eres profesor? Escríbenos a vulpochile.app@gmail.com

No interrumpe ni bloquea nada: es informativa. Su función es que a nadie le llegue el candado
por sorpresa, sobre todo a los apoderados que ya recibieron enlaces.

## Con la puerta cerrada

### Qué queda abierto

Solo `hist-cap1`, completo: sus 4 etapas y su jefe, con estrellas, XP y monedas.

### Qué queda cerrado

Con candado y el texto "🔒 Necesitas un código de tu profesor":

- Los demás capítulos de Historia, su Desafío Extra y su Jefe Final.
- Matemáticas, Ciencias y Lenguaje completas.
- Vocabulario y la biblioteca de Lectura.
- La Tienda y los Logros (desaparecen de la barra inferior).
- El **Duelo en línea** (necesita perfil en el servidor). El **Duelo local** en el mismo teléfono **queda libre**: es gancho, no producto.

**El candado manda sobre el avance.** Un jugador sin código que ya había completado capitulos
o asignaturas enteras los verá igualmente cerrados: la licencia decide, no el progreso. Su
avance **no se borra** — queda guardado y reaparece intacto en cuanto canjee un código.

### Al terminar la demo

En vez de mandar al capítulo siguiente, aparece una pantalla propia:

> **¡Terminaste la muestra de VULPO!**
> El resto del juego —4 asignaturas, más de 2.500 preguntas— lo abre tu colegio.
>
> [🎟️ Tengo un código] [🏫 Soy profesor, quiero VULPO para mi curso]

El segundo botón muestra el contacto: **vulpochile.app@gmail.com · +569 7668 4967**.

## Cómo se decide si hay licencia

Se reutiliza la identidad que ya existe, sin inventar nada:

1. El alumno canjea su `ALU-` en "Tengo un código". Supabase lo valida y devuelve su perfil.
2. Queda guardado que es un alumno identificado.
3. **En cada arranque, con internet, se revalida contra Supabase.** Si el servidor ya no lo
   reconoce (el profesor lo dio de baja, el colegio dejó de pagar), la licencia se apaga.
4. **Si la revalidación falla por falta de conexión, vale lo último confirmado.** Es
   deliberado: una señal intermitente en la sala de clases no debe expulsar a un alumno cuyo
   colegio pagó.

> **Verificado el 24/08/2026:** VULPO **no funciona sin internet**. No hay service worker ni
> manifiesto de aplicación, así que sin conexión el sitio ni siquiera carga; y cada banco de
> preguntas se pide con `fetch` en el momento de usarlo, así que cambiar de asignatura tampoco
> funcionaría. La cláusula de arriba cubre **caídas de conexión a mitad de sesión**, no juego
> sin conexión. No se le puede prometer a un colegio que funciona sin internet.

## Las excepciones

- **Enlaces de muestra (`?solo=` y `?m=`)**: siguen siendo la puerta lateral. Abren los
  capítulos que Roberto elija, sin código, con su caducidad. No pasan por la puerta principal.
- **`?qa=1`**: sigue siendo la herramienta de revisión de contenido, sin restricciones.

## Verificación

Con `FECHA_PUERTA` en cada uno de sus tres estados:

1. **Vacía** → el juego se comporta exactamente como hoy: las cuatro asignaturas abiertas, sin
   aviso, sin candados.
2. **Fecha futura** → todo sigue abierto **y** se ve la banda de aviso con la fecha en
   castellano.
3. **Fecha pasada, sin código** → solo `hist-cap1` jugable; las demás asignaturas con candado;
   sin Tienda, Logros ni Duelo; al terminar el capítulo aparece la pantalla de cierre con el
   contacto correcto.
4. **Fecha pasada, con código** → juego completo, como siempre.
5. **Fecha pasada + enlace de muestra** → abre los capítulos de la muestra pese a no haber
   código.
6. **Fecha pasada + `?qa=1`** → sin restricciones.
7. Consola limpia en los seis casos.

## Riesgos aceptados

- **Bloqueo blando**, como se explicó arriba.
- **Le cierra la puerta a quien ya juega gratis**, incluidos apoderados con enlaces. Es el
  objetivo; el aviso previo existe para que no sea una sorpresa.
- **Depende de que el lado comercial esté listo.** El día que la puerta cierre, un colegio
  interesado tiene que poder contratar. Si la pantalla de cierre no lleva a ninguna parte, se
  convierten visitas en frustración. Por eso `FECHA_PUERTA` se publica vacía: la puerta se
  activa cuando exista la página de presentación que Roberto va a construir.
- **La página comercial futura choca con los enlaces ya repartidos.** Si `vulpo.cl` pasa a
  mostrar una página de presentación, los enlaces de muestra que apuntan a la raíz dejarían de
  abrir el juego. Se resuelve haciendo que esa página reenvíe al juego cuando la visita traiga
  un enlace de muestra. **Fuera del alcance de este diseño**, anotado para cuando se construya.
