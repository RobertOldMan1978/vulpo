# El QR de los enlaces (muestra e inscripción)

**Fecha:** 2026-09-08
**Estado:** diseño aprobado, pendiente de plan de implementación.

## El problema y la idea

Roberto quiere mostrar VULPO en exposiciones y reuniones desde su celular. Hoy, para que alguien
entre a una muestra o se inscriba a un curso, hay que **dictar o reenviar una URL larga** (un
`?m=token` o un `?inscribir=token`), uno por uno, con errores de tipeo. La idea: **generar un código
QR del enlace, ahí mismo en el celular**, para que cada asistente lo escanee y entre al instante a su
propio teléfono. Es un detalle que hace que el producto se vea terminado y cierra demos.

## Decisiones tomadas (con Roberto, 08/09/2026)

1. **El QR va en LOS DOS enlaces**, según el caso:
   - **La muestra** — el armador (`?armar=1`) genera un enlace `?solo=`/`?m=` para *probar* VULPO
     acotado (sin guardar, sin curso). El QR lleva el enlace **completo, con todas sus restricciones**
     (capítulos elegidos, caducidad, si muestra las respuestas).
   - **La inscripción** — el panel (`profesor.html`) genera un enlace `?inscribir=` para que la
     persona *se inscriba de verdad* en un curso abierto (nombre → código `ALU-` → su avance se
     guarda). Mismo QR, otro enlace.
2. **Mostrar + agrandar**: el QR aparece junto al enlace, y un botón **"📱 Mostrar grande"** lo abre
   a pantalla completa para escanearlo cómodo desde varios teléfonos o proyectado. (Descargar como
   imagen quedó fuera — no se eligió.)
3. **Vulpi al medio**: el QR lleva el logo de Vulpi centrado, como QR de marca.

## Cómo funciona

### Un módulo compartido: `assets/js/qr.js`
La lógica vive en un módulo que **cargan los dos mundos** —el juego (el armador, vía cada fork) y el
panel (`profesor.html`)—, porque son archivos distintos que no comparten código. Expone:

- `QR.pintar(elemento, url)` — dibuja el QR del `url` dentro de `elemento`, con Vulpi al medio.
- `QR.grande(url)` — abre el overlay a pantalla completa con el QR gigante, cerrable con un toque.

El módulo **inyecta su propio CSS** (el overlay), como los demás módulos del proyecto. Nace con
respaldo vacío: si no carga, `window.QR` es un no-op y quien lo llama degrada sin romperse.

### La librería de QR, auto-hospedada
El QR lo dibuja una **librería probada** (no un generador casero — un QR mal calibrado se ve bien y
no escanea). Como el proyecto **no usa CDN en runtime** (confirmado en la auditoría de seguridad,
Sesión 111), se **auto-hospeda** en `assets/vendor/` —igual que `supabase-js-2.112.4.min.js`—: se
obtiene una vez de una fuente pública, se guarda local con su versión fija, y se sirve desde ahí.
Va con `<script src>` en los forks y en `profesor.html`, con el respaldo de arriba.

### Vulpi al medio
⚠️ **El logo en el centro obliga a corrección de errores ALTA (nivel H).** Es lo que permite tapar
el centro sin que el QR deje de leerse. El logo (un `assets/web/vulpo-logo-320.png` o el ícono de
app) se dibuja centrado sobre un fondo blanco redondo, **sin pasar de ~25% del área** del QR. Más que
eso y deja de escanear.

### Los dos puntos de integración

**A · El armador (`arrancarArmador`/`armarUrl` en `motor.js`).** `armarUrl()` ya construye el enlace
y lo pone en `#armarUrl` con Copiar/Probar. Se suma: un contenedor del QR bajo el enlace, que
`armarUrl()` **repinta cada vez que cambia** (marcar un capítulo, cambiar la fecha), y el botón
"Mostrar grande". Con enlace vacío (nada marcado), no hay QR.

**B · El panel de inscripción (`pintarUrl` en `profesor.html`).** `pintarUrl()` arma
`location.origin + ruta + '?inscribir=' + token` en un input. Se suma el mismo par: QR bajo el
enlace + "Mostrar grande", repintado cuando cambia el enlace (crear otro, cambiar el nivel).

## Cuidados

- **Verificación = escanear, no mirar.** Se genera un QR real, se **decodifica** (con una librería de
  lectura o el propio Chrome) y se confirma que da la URL exacta —incluido el token—, **con el logo
  de Vulpi puesto**. Un QR con logo mal calibrado pasa el "se dibujó algo" y falla al escanear.
- **Enlaces largos**: el token `?m=` y el `?inscribir=` son largos; el QR sube su densidad para
  alojarlos. Con corrección H + logo + token largo, el QR necesita una versión grande — hay que
  comprobar que sigue siendo escaneable en la pantalla de un celular (de ahí el "Mostrar grande").
- **`location.origin`**: el enlace se arma con el origen actual, así que desde `vulpo.cl` el QR
  apunta a `vulpo.cl` solo, y en local a local. No se cablea el dominio.
- **`profesor.html` es sobrio** (Inter, neutro, Sesión 106) y el juego es el mundo violeta. El
  módulo `qr.js` es **agnóstico del estilo**: el QR es blanco y negro, y el overlay usa un fondo
  oscuro neutro que sirve en los dos.
- **Orden de publicación**: `qr.js` + la librería vendor + los assets primero; los forks y
  `profesor.html` que los referencian, después o a la vez. `qr.js` tiene respaldo, así que un 404 no
  rompe — pero se publica antes por prolijidad, como el resto de los módulos.

## Fuera de alcance

- **Descargar el QR como imagen** (no se eligió; se puede sumar después).
- **El QR del código `ALU-` individual** de un alumno ya inscrito — es una credencial, no un enlace
  de entrada, y no es el caso de la expo.
- **Analítica de escaneos** (cuántos escanearon). Exigiría backend y no es el objetivo.
