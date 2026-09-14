# VULPO en Android (Capacitor) — Diseño

**Fecha:** 2026-09-14
**Estado:** propuesta, para revisión de Roberto. No implementado. Nada se commitea hasta la orden 66.

## Objetivo

Publicar VULPO en Google Play como **una sola app gratuita** que empaqueta los seis cursos y
funciona en un teléfono Android, sin cambiar el modelo de acceso de hoy (descarga gratis →
se desbloquea con código `ALU-`).

## Alcance

**Esto es la Fase A del roadmap** (`Escritorio\VULPO - correos profesores\camino-google-play.html`).
Cubre: envolver el sitio con Capacitor, una pantalla de entrada con selector de curso, el build
en la nube y las pruebas en un teléfono real.

**Fuera de alcance, a propósito:**
- El **cobro directo a familias** (licencia/suscripción validada en el servidor) — es la Fase B.
  Hoy la puerta es blanda (`tieneLicencia()` lee `localStorage`); para este lanzamiento se
  conserva tal cual. La app **valida una licencia; no vende nada adentro**, y la compra ocurre
  en la web (definición aparte).
- El **pago en la web** (pasarela) — lo define Roberto por separado.
- Google Play Billing — descartado por diseño: la app no cobra adentro.
- **iOS** — más adelante; este spec es solo Android.

## Contexto medido (contra el repo, 2026-09-14)

Estos hechos determinan la arquitectura y se verificaron en el código, no de memoria:

- Los **seis** `<n>/index.html` llevan `<base href="/">` y todos sus recursos resuelven desde la
  raíz (`/assets/…`). La landing raíz enlaza los cursos con rutas **absolutas** (`/8vo/`, `/3ro/…`).
  → Si el `webDir` de la app tiene el sitio en su raíz, esas rutas funcionan sin reescribir nada.
- El cliente Supabase usa una **URL absoluta https** (`https://bdgzpjzlqidcexdkjhzy.supabase.co`).
  → Funciona desde la app como funciona en el navegador (es una llamada de red).
- La **voz** se sirve por un manifiesto que guarda rutas bajo `/assets/voz/<asig>/…mp3`, y el juego
  ya **cae a la voz del navegador** (`speechSynthesis`) cuando un clip no está disponible
  (`sonarClip` → respaldo). → La voz se puede **transmitir desde el servidor** cambiando una sola
  base de ruta, y si no hay señal el juego sigue con la voz del navegador.
- El peso: `assets/voz` son ~602 MB (solo 3° y 4°); el resto del sitio servible, sin la voz, es del
  orden de **~90 MB** (`contenido/` 17,8 MB + arte + audio + los seis forks). `assets/originales`
  (174 MB) ya está excluido del sitio y **no** se empaqueta.

## Arquitectura

Capacitor envuelve el sitio estático en una app nativa Android: un WebView que carga el sitio
**empaquetado dentro de la app** (esquema local `https://localhost`), más las llamadas de red que
ya hace (Supabase, y —si se transmite— la voz). No hay reescritura del motor: es el mismo sitio.

**El `webDir` de la app es un subconjunto curado del sitio**, ensamblado por un paso de build:
- **Incluye:** la nueva pantalla de entrada (selector), los seis `<n>/`, `assets/js/`, el arte y el
  audio de `assets/`, y `contenido/`.
- **Excluye:** la landing comercial raíz, `/colegio/`, `/tutorial/`, `dev/`, y `assets/voz/` (va
  aparte, descargada y cacheada por la app — §3). La app abre en el selector, no en la página de venta.

### 1. La pantalla de entrada: selector de curso

Una página nueva y liviana (p. ej. `app/index.html`, la `start_url` del paquete). Muestra los seis
cursos (3°–8°); al tocar uno navega a `/<n>/` dentro del paquete. Decisiones:
- **Recuerda el último curso** (`localStorage`) y, si existe, ofrece "seguir en 5°" además de la
  grilla — no salta directo, para no encerrar a una familia con dos hijos en distinto curso.
- Lleva **"🎟️ Tengo un código"** a la vista (el canje `ALU-` es la llave del modelo actual).
- Registro sobrio, coherente con la cara adulta del proyecto (Inter, no el cosmos del juego), pero
  con la marca VULPO — es la primera pantalla que ve el niño al abrir la app.
- **No** es la landing comercial: esa vende, y adentro de una app instalada sobra.

⚠️ Cada curso ya aísla su `localStorage` por `SUFIJO` (`kimun_save_3ro`…), así que cambiar de curso
en la misma app no mezcla avances. El selector no necesita tocar eso.

### 2. El empaque (Capacitor)

- Proyecto Capacitor con `webDir` = el sitio ensamblado de arriba; `appId` tipo `cl.vulpo.app`,
  nombre "VULPO".
- Ícono y splash propios (ya existe `assets/icono-512.png` de la instalación PWA, Sesión 77).
- Los `manifest.webmanifest` y el `<link rel="manifest">` de los forks son de la PWA web; en la app
  nativa no estorban, pero se revisa que no generen 404 dentro del paquete.
- **El repo no cambia su forma de servirse en la web** (`vulpo.cl` sigue igual); el empaque es un
  paso aparte que consume el sitio.

### 3. La voz — decidido: la app la descarga y la guarda (offline con Catalina)

Roberto decidió (2026-09-14) que la app lleve **siempre la voz Catalina, también offline**, y que se
entregue por **descarga + caché** (no por Play Asset Delivery), para poder **probarla en el teléfono
sin esperar la cuenta de desarrollador** — con PAD, Google Play es quien entrega los paquetes, así que
testear la voz exigiría la cuenta (A4). PAD queda como el camino de **escalamiento**, no del MVP.

- **Solo 3° y 4° tienen voz pregrabada** (~250 MB y ~326 MB); **5°-8° no llevan voz**, así que no
  descargan nada.
- La voz **no va en el módulo base** (excede los 500 MB de Google). Va en **un paquete por curso**
  (`voz-3ro.zip`, `voz-4to.zip`) hospedado en **GitHub Releases** (assets hasta 2 GB, fuera del git,
  URL estable) — NO en el repo (git topa en 100 MB por archivo) ni en GitHub Pages.
- **La primera vez que el niño entra a 3° o 4°**, la app descarga su paquete de voz (con barra de
  progreso), lo descomprime en el almacenamiento del teléfono (Capacitor Filesystem) y desde ahí queda
  **offline para siempre con la voz buena**. Mientras se baja, el juego usa el respaldo de voz del
  navegador (ya programado), así que nunca queda mudo.
- El WebView sirve la voz cacheada **reescribiendo la base de ruta**: `voz.js` reescribe `/assets/voz/…`
  a la ubicación local (`window.VOZ_LOCAL_BASE`, con `Capacitor.convertFileSrc`). Default vacío = la web
  intacta.

⚠️ **La pieza de ingeniería clave de la Fase A** es esa descarga + descompresión + servido en el
teléfono (Capacitor Filesystem + una utilidad de zip + el reescrito de `voz.js`). Se prueba en el
teléfono en A2/A3. Contra asumida: por ahora la descarga sale de GitHub Releases (bien para el piloto);
para escala grande se pasa a PAD o un CDN.

### 4. El build en la nube (GitHub Actions)

El build **no corre en el PC de Roberto** (no tiene Android Studio ni SDK, y no los instalará) ni en
este entorno. Corre en **GitHub Actions** (el repo ya está en GitHub; los runners traen el SDK de
Android):
- Un workflow que: instala Node, corre Capacitor, ensambla el `webDir`, y compila con Gradle.
- Produce **un APK de depuración** como artefacto descargable (para probar en el teléfono) y, para
  publicar, el **AAB firmado** (la clave de firma vive en los secretos del repo, nunca en el árbol).
- Se dispara con `git push` / a mano, así que en el fondo sigue el espíritu "git push y (la nube)
  arma la app".

⚠️ **Esto introduce un paso de build que el proyecto no tenía** (hoy es HTML/JS servido tal cual).
Es un cambio consciente y acotado al empaque Android; la web sigue sin build.

### 5. Rutas bajo el esquema de la app (riesgo conocido, mitigado)

Como todo resuelve desde la raíz (`<base href="/">` + rutas absolutas) y el `webDir` tiene el sitio
en su raíz, el riesgo es **bajo**. Pero **se confirma en un teléfono real** (no headless): que
carguen el motor, el arte, el contenido, y que el canje `ALU-` y el ranking hablen con Supabase.
Es el objetivo de la primera prueba de A2.

## Cómo se prueba

- **A2 (iteración):** descargar el APK del artefacto de GitHub Actions e **instalarlo en el teléfono
  Android de Roberto** (activando una vez "instalar apps de origen desconocido"). Verificar jugando
  —la regla del proyecto: mirar/jugar en un aparato real, no headless—: abre el selector, entra a un
  curso, juega una etapa, canjea un `ALU-`, y (con y sin señal) revisa la voz.
- **Antes de publicar:** subir el AAB al **canal de pruebas internas** de Play (requiere la cuenta,
  A4) y confirmar la instalación por la tienda.

## Riesgos y decisiones abiertas

1. **La descarga + caché de la voz** (§3) — decidido: la app baja el paquete de voz del curso, lo
   descomprime en el teléfono y lo sirve al WebView (`voz.js` reescribe la ruta). Es el mayor trabajo
   de ingeniería de la Fase A y se prueba en teléfono en A2/A3.
2. **Rutas bajo Capacitor** (§5) — bajo riesgo por el diseño de rutas absolutas, pero se verifica en
   teléfono en A2.
3. **El paso de build en la nube** (§4) — tooling nuevo; acotado a Android.
4. **Política de Familias/Niños de Google** — no es de este spec (es A5), pero condiciona el
   lanzamiento; se prepara en paralelo.

## Qué NO cambia

- Los seis forks no se tocan por esto. `assets/js/voz.js` gana **un solo enganche** seguro
  (`window.VOZ_LOCAL_BASE`, default vacío = la web intacta) para reescribir la ruta de la voz a la
  carpeta cacheada en el teléfono; el resto del motor no cambia.
- `supabase/schema.sql`: cero cambios en la Fase A.
- La web en `vulpo.cl`: sigue sirviéndose igual.
- El contenido: ni un banco, ni una pregunta, ni un clip.
