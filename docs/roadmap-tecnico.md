# Roadmap técnico de VULPO — de web a PWA y aplicación móvil

**Origen:** tres documentos de análisis externo entregados por Roberto el **27 de agosto de 2026**
(`Estrategia_VULPO_PWA_Android_iOS`, `Proyecto_VULPO_PWA_v1.0_Analisis_Tecnico` y
`Modelo_Suscripcion_VULPO`). Este archivo recoge su contenido técnico y lo **contrasta con el
estado real del repositorio**, que los documentos no conocían.

> **Nada de esto está implementado.** Es la dirección acordada, no trabajo hecho. Hoy VULPO es un
> sitio estático en GitHub Pages y **no funciona sin internet** (verificado: no hay service worker
> y cada banco de preguntas se pide con `fetch` al usarse).

---

## 1. La decisión de fondo: no reescribir

La recomendación central de los tres documentos, y se adopta:

**NO** rehacer VULPO en Flutter ni React Native. El juego ya es una aplicación web mobile-first
que funciona. La ruta es reutilizar el código:

```
VULPO v1  →  PWA  →  piloto y métricas  →  Capacitor  →  Android  →  iOS
```

Principio rector: **primero validar, después invertir. No reconstruir lo que ya funciona.**

Evaluación técnica del análisis externo: PWA 9/10 · Capacitor 9/10 · Android 9/10 · iOS 8/10 ·
offline completo 6/10 · **reescritura en Flutter/React Native 2/10**.

---

## 2. Lo que los documentos NO sabían (y cambia el plan)

Los tres se escribieron mirando la arquitectura de agosto. Cinco hechos del repositorio los
corrigen. **Estos son los puntos a resolver antes de escribir una línea de `sw.js`.**

### 2.1 Ya no hay "un juego": hay tres, y son FORKS

El análisis asume `start_url: /juego/`. Pero hoy conviven:

| Ruta | Qué es | Aislamiento |
|---|---|---|
| `/juego/` | 8° básico | `kimun_save`, `storageKey` por defecto |
| `/3ro/` | 3° básico | `SUFIJO='_3ro'`, `storageKey:'kimun-3ro'` |
| `/7mo/` | 7° básico | `SUFIJO='_7mo'`, `storageKey:'kimun-7mo'` |

Son **copias del mismo motor**, no un producto multinivel. Un manifiesto único con
`start_url:/juego/` instalaría "VULPO" y abriría **8° básico**, que para dos de cada tres alumnos
sería el curso equivocado.

**Y esto choca de frente con el modelo de suscripción** (§4), donde *el producto es el nivel*.
Hay dos salidas y hay que elegir una antes de empezar:

- **A · Un manifiesto por nivel** (`/juego/manifest.webmanifest`, `/3ro/…`, `/7mo/…`), cada uno
  con su `scope`, su `start_url`, su nombre visible ("VULPO 7° Básico") y su propio service
  worker. Calza con el modelo comercial: se instala el nivel que se compró. Cuesta mantener tres
  de todo, que es exactamente el costo que ya se paga por el fork.
- **B · Un manifiesto en la raíz** con un selector de nivel al abrir. Una sola app, un solo
  ícono. Rompe la promesa de "instalaste tu curso" y obliga a resolver a qué nivel pertenece el
  alumno, cosa que hoy **sí** sabe el servidor (el nivel viaja en el prefijo del OA: `MA07`,
  `HI03`) pero no sabe el juego hasta que se canjea un `ALU-`.

**Recomendación:** A, por coherencia con el modelo comercial y porque no exige backend nuevo.

### 2.2 El peso hace inviable el `cache-first` que propone el análisis

Medido en el repositorio hoy:

| Carpeta | Peso |
|---|---|
| `assets/voz/` (voz pregrabada de 3°) | **252 MB** en bytes reales — 6 asignaturas, 11.536 clips |
| `assets/originales/` (arte crudo, nunca se sirve) | **174 MB** |
| `assets/audio/` (música) | 5,0 MB |
| `contenido/` (los bancos de preguntas) | 7,3 MB |
| **Sitio publicado** (sin `.git` ni `originales`, ya excluidos) | **343 MB** |

Un service worker con `cache-first` sobre "imágenes, audio y fuentes" —tal cual lo propone el
documento— **le bajaría 250 MB a un teléfono en la primera apertura de 3° básico**. En el
público objetivo (colegios chilenos, planes de datos limitados) eso no es una optimización: es
un motivo para desinstalar.

**Reglas que se derivan, y que el documento no podía anticipar:**

- La voz de 3° se cachea **bajo demanda, clip a clip, al reproducirse** — nunca en el `install`.
- `assets/originales/` **no se cachea jamás**. **Resuelto en la Sesión 63:** se verificó que
  GitHub Pages los estaba publicando (`https://vulpo.cl/assets/originales/<archivo>.png`
  respondía HTTP 200 con 2,4 MB) y se excluyeron del sitio con `_config.yml`. **Siguen en el
  repositorio**, porque son el respaldo del arte crudo y la forma de sincronizarlo entre los dos
  computadores; lo que ya no ocurre es publicarlos. Libera 175 MB del techo de 1 GB.
- `contenido/` (7,6 MB) sí es buen candidato a precarga, pero **por nivel**, no completo.
- El `install` debe precargar solo el casco: HTML, CSS, JS, íconos y la mascota. Todo lo demás,
  a medida que se usa.

### 2.3 El `<base href="/">` de los tres juegos

Cada `index.html` de juego lleva `<base href="/">` con un comentario de "NO borrar": es lo que
permitió mover el juego a `/juego/` sin romper 118 rutas relativas. **Un `scope` de service
worker acotado a `/juego/` no cubre `/assets/` ni `/contenido/`**, que es de donde sale todo.
El scope tiene que ser `/`, con las estrategias diferenciadas por ruta dentro del `fetch`.

### 2.4 La cuenta permanente ya existe a medias, y el hueco es el progreso

El modelo de suscripción exige que el alumno cambie de teléfono y recupere todo. Hoy:

| Dato | Dónde vive | ¿Sobrevive al cambio de aparato? |
|---|---|---|
| Identidad del alumno | `perfiles` + `vinculos` (Supabase), vía código `ALU-` | ✅ sí, re-canjeando el código |
| XP y ranking | `perfiles.xp` (Supabase) | ✅ sí |
| Dominio por OA | `dominio` (Supabase) | ✅ sí |
| **Monedas, skins, avance de campaña, estrellas, insignias** | **`localStorage` del aparato** | ❌ **no** |

Es una limitación ya documentada ("en un tablet compartido dos hermanos comparten avance aunque
tengan XP distinto"). **Subir el progreso al servidor es trabajo de backend, no de PWA**, y es
prerrequisito del modelo de suscripción — no de la PWA. Conviene no mezclarlos.

### 2.5 La puerta ya existe, y es blanda

`FECHA_PUERTA` cierra el juego desde el 1 de octubre de 2026 y la llave es el código `ALU-`.
Pero **es un bloqueo blando**: `tieneLicencia()` solo lee `localStorage`, no revalida contra
Supabase, y las preguntas se descargan pidiendo el archivo directo. Un modelo de suscripción con
vencimiento **hereda ese hueco tal cual**. Cerrarlo de verdad exige servir el contenido desde
Supabase pregunta a pregunta: proyecto de meses, aparte.

---

## 3. Plan de construcción — PWA v1.0

Tomado del análisis externo, con las correcciones de §2 incorporadas.

### Archivos nuevos

```
manifest.webmanifest      (o uno por nivel — ver §2.1)
sw.js
pwa.js
assets/pwa/icon-192.png · icon-512.png · maskable-192.png · maskable-512.png
docs/pwa-v1.md            (documentación operativa)
```

### Qué NO se toca

- `contenido/` — la PWA consume los mismos JSON.
- `supabase/` — ninguna tabla, política ni función nueva.
- La lógica del juego: preguntas, XP, ranking, duelos, mecánicas.

> **Regla:** la PWA v1 **no es una refactorización del juego.** En el `index.html` de cada juego
> se agrega el manifiesto, los meta de móvil y `pwa.js`. Nada más.

### Estrategias de caché

| Recurso | Estrategia |
|---|---|
| Casco (HTML, CSS, JS, íconos, mascota) | Precarga en `install` |
| Imágenes y música | Cache-first, **bajo demanda** |
| Voz pregrabada de 3° | Cache-first, **clip a clip al reproducir** (§2.2) |
| `contenido/*/preguntas.json` | Cache-first con actualización controlada |
| Supabase (ranking, XP, duelo, dominio) | **Network-only** — un ranking servido de caché vieja es un dato falso |
| `profesor.html` | Network-first, o fuera de la estrategia offline |
| `assets/originales/` | **Nunca** |

### Versionado

Nombres versionados (`VULPO_CACHE_v1`, `v2`, …). Al subir versión: instalar la nueva, activar,
**borrar la anterior**. El fallo clásico de una PWA es dejar al usuario atrapado en una versión
vieja sin saberlo, y en este proyecto sería peor de lo normal: un alumno con la caché de agosto
seguiría viendo el juego abierto después de que la puerta cerró.

### Orden de trabajo

0. Rama `feature/pwa-v1`. **No trabajar sobre `main`.**
1. Auditoría sin modificar: URLs absolutas, `fetch`, `localStorage`, Supabase, audio, video,
   recursos externos, y qué se rompe al instalar.
2. Manifiesto(s) e íconos.
3. `pwa.js` (registro del SW, `beforeinstallprompt`, detección de modo instalado).
4. `sw.js` con las estrategias de la tabla.
5. Instalación probada en Android Chrome, iPhone Safari y escritorio.
6. **Prueba obligatoria de actualización:** instalar → jugar → publicar versión nueva → abrir →
   confirmar que actualizó y que la caché vieja se borró.
7. Offline: inicio → asignatura → campaña → pregunta → respuesta → resultado.
8. Con internet: login, ranking, XP, duelo, panel.
9. Rendimiento en Android económico, medio, moderno e iPhone.

### Criterios de aceptación

☐ Instalable · ☐ ícono y splash correctos · ☐ arranca en el nivel correcto · ☐ **cero errores de
consola y cero 404** · ☐ juego funciona · ☐ Supabase funciona · ☐ ranking · ☐ duelo · ☐ panel ·
☐ offline parcial · ☐ actualizaciones · ☐ caché vieja se elimina · ☐ escritorio sigue andando ·
☐ `vulpo.cl` sigue andando · ☐ **3° y 7° no se rompen** · ☐ el guardado de cada nivel sigue
aislado de los otros dos.

> La verificación se hace **corriendo la página** con `scripts/cdp.mjs`, no leyendo el código.
> Los 404 no llegan a la consola de forma fiable: hay que mirarlos en la red.

---

## 4. Modelo de suscripción (implicancias técnicas)

El modelo comercial completo vive en [`comercial.md`](comercial.md). Lo que importa aquí:

**El producto es el nivel escolar, con vigencia anual.** "VULPO 7° Básico — año escolar 2027",
del 01/03/2027 al 28/02/2028. **No se vende acceso permanente**: el contenido cambia, el alumno
avanza de curso y la plataforma necesita mantenimiento.

**La cuenta es permanente; la suscripción cambia.** El alumno conserva identidad, historial y
logros al pasar de 7° a 8°. Eso es lo que convierte el cambio de curso en **retención** en vez
de en una baja.

**Modelo de datos conceptual** (no crear estas tablas todavía — primero hay que decidir el
modelo definitivo):

```
USUARIO ──< SUSCRIPCIÓN >── NIVEL_ESCOLAR
                │
                └── año escolar · fecha_inicio · fecha_vencimiento · estado
```

Estados: `PENDIENTE · ACTIVA · VENCIDA · CANCELADA · SUSPENDIDA` (+ `PRUEBA`, `REEMBOLSADA`).
Se fijan cuando se implemente el pago, no antes.

**Tres líneas comerciales posibles:** Individual (1 alumno / 1 nivel / 1 año) · Familiar (varios
hijos en distintos niveles) · Colegio (licencias institucionales — la que existe hoy).

### Lo que esto exige del código, en orden

1. **Subir el progreso local al servidor** (§2.4). Sin esto, "cambia de teléfono y recupera
   todo" es falso. Es el trabajo de fondo, y no depende de la PWA.
2. Modelo de usuario y de suscripción en Supabase.
3. Recién entonces, pagos.

### El punto que hay que decidir antes de programar pagos

**Web y tienda de apps tienen reglas distintas.** En la web se integra una pasarela y listo. En
Android/iOS, una app que vende contenido digital **dentro de la aplicación** cae bajo las
políticas de compra in-app de Google Play y Apple, con su comisión. Diseñar el sistema de pagos
antes de decidir la arquitectura de distribución móvil es rehacerlo dos veces.

---

## 5. Después de la PWA: Capacitor

**No incorporar Capacitor antes de estabilizar la PWA v1.0.** Luego, la misma base web se
empaqueta para Android e iOS, y las capacidades nativas se agregan cuando aporten valor real.

**Android primero:** valida la publicación en tienda, detecta problemas de dispositivos y
permite probar notificaciones, todo antes de enfrentar iOS.

Funciones nativas por prioridad — **alta:** pantalla completa, ícono y splash, notificaciones
push, vibración, almacenamiento local, detección de conexión, control de navegación.
**Media:** descargas y caché avanzada, audio optimizado, sincronización offline/online.
**Futura:** cámara y funciones específicas del dispositivo.

Riesgos asumidos: Capacitor no convierte mágicamente la web en una app; sigue siendo una capa
web (WebView); y aparecen dos ecosistemas que mantener, con certificados, versiones y revisiones
de tienda.

---

## 6. Lo que NO se hace

- ❌ Rehacer VULPO en Flutter o React Native.
- ❌ Desarrollar Android e iOS en paralelo desde el primer día.
- ❌ Construir offline completo con cola de sincronización antes de saber qué necesita de verdad
  funcionar sin conexión.
- ❌ Implementar el pago antes de estabilizar el producto y el modelo de usuario.
- ❌ **Prometer "VULPO 100% offline".** La PWA da offline *parcial*: interfaz, recursos ya
  descargados y preguntas ya vistas. Ranking, duelo, sincronización y panel siguen exigiendo
  internet. Ya es una regla comercial escrita en `comercial.md`, y la PWA no la deroga.
- ❌ Mezclar la migración a PWA con la evolución de 3° o 7°. Una variable a la vez.

---

## 7. Orden recomendado, de punta a punta

```
Terminar y estabilizar VULPO v1
        ↓
PWA v1.0  (§3)
        ↓
Piloto real y métricas: uso, sesión, retención, asignaturas, rendimiento
        ↓
Optimizar solo lo que dio problemas de verdad
        ↓
Progreso en el servidor (§2.4) → modelo de usuario y suscripción → pagos
        ↓
Capacitor → Android → funciones nativas → iOS
```

> **Las estimaciones de inversión por fase** que traían los documentos **no se escriben aquí:
> este repositorio es público.** Viven fuera, en `Escritorio\VULPO - correos profesores\`.
