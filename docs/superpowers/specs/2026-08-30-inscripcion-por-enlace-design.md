# Inscripción por enlace único (modo experimental)

**Fecha:** 2026-08-30 · **Estado:** diseño aprobado, sin implementar

## Qué pidió Roberto

Mandar **un solo enlace a un chat** y que cada persona:

1. se **cree sola** en un curso que él ya abrió;
2. tenga **acceso a todo el contenido**, no a una demo;
3. con **solo los jefes bloqueados** hasta que recorra los caminos;
4. y que **su uso quede registrado** y su avance guardado, para que sirva de experimento.

## Lo que ya funciona y no hay que construir

**El punto 4 sale gratis.** En cuanto un dispositivo queda vinculado a un perfil con curso, el
XP, el mapa de dominio por objetivo, la participación y el ranking del curso **empiezan a
registrarse solos**. No hace falta ni una línea nueva para eso.

Lo que falta es únicamente la **puerta de entrada** y el **modo de desbloqueo**.

> ⚠️ Esto **no** es el enlace de muestra (`?solo=`, `?m=`). Aquel es `EFIMERO`: no guarda nada, no
> crea perfil y no toca la partida del teléfono. Aquí se quiere exactamente lo contrario, así que
> es un camino nuevo y no una variante de aquel.

## Las cuatro piezas

### 1. La tabla `inscripciones`

```sql
create table public.inscripciones (
  id       uuid primary key default gen_random_uuid(),
  curso_id uuid not null references public.cursos(id) on delete cascade,
  token    text not null unique,              -- INS-XXXXXXXX
  cupo     int  not null,
  usados   int  not null default 0,
  activo   boolean not null default true,
  creado   timestamptz default now()
);
```

RLS activo y **sin políticas de lectura**, como el resto: nada se consulta directo, todo pasa por
funciones `SECURITY DEFINER`.

> **`activo` existe aunque no tenga botón.** Roberto eligió el cupo como único límite; la columna
> hace falta igual para contar, y deja una salida de emergencia si un enlace se reenvía a donde no
> debía. Se cierra con un `update` de una línea.

### 2. `kimun_inscribirse(token, nombre, avatar)`

En este orden, que importa:

1. **Si este dispositivo ya tiene perfil en ese curso, lo devuelve** y no consume cupo. Es lo que
   hace que recargar la página, o volver al día siguiente, no cree un segundo perfil huérfano
   arrastrando el avance del primero.
2. Valida el nombre: recortado, entre 2 y 40 caracteres. Vacío o basura → error, no perfil mudo.
3. **Toma el cupo de forma atómica**: `update inscripciones set usados = usados + 1 where token = ?
   and activo and usados < cupo returning curso_id`. Sin fila devuelta, el cupo está lleno. Hacerlo
   con un `select` y luego un `update` deja pasar de más cuando entran veinte a la vez, que es
   justo lo que va a ocurrir cuando el enlace caiga en el chat.
4. Crea el `perfil` con su `codigo_acceso` (el `ALU-` de siempre) y el `vinculo` del dispositivo.

**El alumno recibe su `ALU-` igual**, aunque no lo haya escrito: es lo que le permite recuperar su
avance en otro aparato o si borra los datos del navegador.

### 3. La pantalla de bienvenida

`vulpo.cl/juego/?inscribir=INS-XXXXXXXX` → una pantalla que pide el nombre y entra. Sin códigos que
copiar, que es donde más se cae el canje hoy.

Si el token no existe, está cerrado o sin cupo, se explica **cuál de las tres cosas pasó** y se
ofrece el juego normal. Un mensaje genérico deja al apoderado sin saber si escribió mal o si llegó
tarde.

### 4. `MODO_ABIERTO` se parte en dos

Hoy una sola bandera abre **capítulos y jefes a la vez**, y por eso `?qa=1` y el modo prueba
desbloquean todo. Lo que pide Roberto es un tercer estado, así que se separan las dos preguntas —
el mismo movimiento que la Sesión 41 hizo con `QA`, que mezclaba cuatro cosas distintas:

| Bandera | Qué ignora | QA | Prueba | **Experimental** | Normal |
|---|---|:-:|:-:|:-:|:-:|
| `CAPS_ABIERTOS` | los candados entre capítulos y entre etapas | ✅ | ✅ | **✅** | ❌ |
| `JEFES_ABIERTOS` | los candados de los jefes | ✅ | ✅ | **❌** | ❌ |

Con eso, en modo experimental: se puede entrar a cualquier asignatura y a cualquier capítulo desde
el primer día, pero **el jefe de un capítulo pide sus 4 etapas** y **el Jefe Final pide todos los
capítulos**. Los jefes siguen siendo la recompensa que hay que ganarse, que es lo que Roberto pidió.

Toca cinco funciones, todas de una línea: `nodoCampDesbloqueado`, `desafioDesbloqueado`,
`jefeFinalDesbloqueado`, `jefeCalcDesbloqueado` y `jefeFinalMateDesbloqueado`, más el
`nuevoProgreso` que abre las etapas.

**Dónde vive el modo:** es una propiedad **del curso**, no del enlace ni del aparato
(`cursos.experimental`). Así un alumno que borra los datos del navegador y vuelve a canjear su
`ALU-` recupera el mismo modo, en vez de caer en el juego normal sin saber por qué.

## La puerta de acceso

`tieneLicencia()` mira `S.alumno`, así que **un inscrito por enlace pasa la puerta como cualquier
alumno con código**. No hay nada que tocar ahí, y es lo correcto: se inscribió en un curso real.

## Lo que Roberto acepta, dicho de frente

- **El enlace es la credencial, y abre el producto completo.** Hoy un `ALU-` filtrado regala un
  cupo de la demo; este enlace reenviado fuera del chat regala VULPO entero, hasta llenar el cupo.
  **Por eso el cupo va ajustado al grupo, no holgado.**
- **Sin vencimiento**, por decisión suya: los cupos que sobren quedan abiertos indefinidamente.
- **Los nombres dejan de estar verificados.** Llegan apodos, duplicados y "asdf". El panel ya tiene
  ✎ y 🗑️ para limpiar; conviene que el listado los marque como **autoinscritos**, para
  distinguirlos de los que escribió el profesor.
- **Un niño escribe su nombre en un formulario público, sin autenticar.** Hoy el nombre lo pone el
  colegio. Es exactamente lo que pregunta una UTP, y hay que poder responderlo.

## Verificación

- **Veinte inscripciones simultáneas contra un cupo de diez** dejan exactamente diez perfiles. Es
  la prueba que justifica el `update` atómico, y hay que hacerla de verdad, no razonarla.
- Recargar la pantalla, o volver al día siguiente, **no crea un segundo perfil**.
- Un token inexistente, uno cerrado y uno sin cupo dan **tres mensajes distintos**.
- En el juego: todos los capítulos abiertos desde el primer día, **el jefe del capítulo cerrado
  hasta completar sus 4 etapas**, y el Jefe Final cerrado hasta completar los capítulos.
- El XP, el dominio por objetivo y la participación del inscrito **aparecen en el panel del
  profesor** sin ninguna acción extra.
- El modo experimental **sobrevive** a borrar los datos del navegador y volver a canjear el `ALU-`.
- Los otros dos cursos y el juego normal **no cambian**: sin `?inscribir=`, todo sigue igual.
