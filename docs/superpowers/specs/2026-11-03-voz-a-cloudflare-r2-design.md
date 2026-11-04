# La voz pregrabada se muda a Cloudflare R2 (`voz.vulpo.cl`)

**Fecha:** 03/11/2026 · **Estado:** diseño aprobado por Roberto, sin implementar.
**Es el proyecto 1 de 3.** Los otros dos son 2° básico y después 1° básico, y los dos
dependen de este.

## 1. Por qué

GitHub Pages admite como máximo **1 GB** de sitio publicado. Medido el 03/11/2026 (bytes reales
de los archivos versionados, sin `assets/originales/`):

| | MB |
|---|---|
| Sitio publicado | **~704** |
| …de eso, la voz (`assets/voz/`) | **603** |
| Voz de un curso chico | 254 (3°) · 349 (4°) |

La voz de 1° y 2° básico sumaría otros 500-700 MB, y no cabe. El proyecto ya lo había escrito:
*"no hay margen para una séptima asignatura con voz"*. Sin voz, 1° y 2° no sirven: son niños que
todavía están aprendiendo a leer.

**Decisión de Roberto:** mover **toda** la voz (la de 3° y 4° incluida) a **Cloudflare R2**,
servida en `voz.vulpo.cl`. R2 trae 10 GB gratis y no cobra las descargas, y el DNS de `vulpo.cl` ya
vive en Cloudflare.

## 2. Los dos criterios de aceptación

1. **Funciona igual que hoy.** Para un alumno, nada cambia: suena la misma voz, en los mismos
   textos, con el mismo resaltado. Lo que no tenga clip sigue cayendo a la voz del navegador.
2. **Queda bien respaldado.** Cada clip existe en **al menos tres lugares**: R2, el PC de casa y
   el PC de la oficina (más el historial de git para los 603 MB que ya existen).

## 3. Qué se mueve y qué se queda

| | Dónde vive después |
|---|---|
| Los **MP3** (`assets/voz/<asig>/<hash>.mp3`, 24.250 hoy) | **R2**, bucket `vulpo-voz`, como `<asig>/<hash>.mp3` |
| Los **manifiestos** (`assets/voz/<asig>/manifiesto.json`) | **Se quedan en el sitio**, versionados en git |
| Los almacenes de auditoría (`dev/auditoria-voz-*.json`) | Se quedan en git, sin cambios |

**Por qué los manifiestos se quedan:** son chicos, el juego los pide con `fetch` (en el mismo
dominio no necesitan CORS), la app Android ya los lleva dentro de su paquete, y son la lista
maestra de qué clips deben existir. Moverlos obligaría a configurar CORS y a cambiar cómo se arma la
app, sin ganar nada.

**Y por eso no hace falta configurar CORS en R2:** un `<audio src>` reproduce desde otro dominio sin
CORS, y la descarga nativa de Capacitor (`Filesystem.downloadFile`) tampoco lo necesita.

## 4. Cambios de código

### 4.1 `assets/js/voz.js` (el juego en la web)
- Constante nueva `VOZ_ORIGEN = 'https://voz.vulpo.cl/'`. `sonarClip` reescribe el prefijo
  `assets/voz/` de la ruta a `VOZ_ORIGEN`. La reescritura de la app (`VOZ_LOCAL_BASE`) **tiene
  prioridad** sobre esta: un clip ya descargado en el teléfono se sigue sirviendo local.
- **Mejora de robustez:** hoy, si un clip falla (`onerror`), ese texto queda **mudo** y la cadena
  sigue. Con un servidor externo el caso es más probable, así que un clip que no carga **cae a la
  voz del navegador** para ese mismo texto. Es exactamente lo que ya pasa cuando no hay clip.
- Los forks **no cambian**: `VOZ_DIRS` sigue apuntando a `assets/voz/<asig>/`, que es donde viven
  los manifiestos.

### 4.2 `assets/js/voz-descarga.js` (la app Android)
- `ORIGEN` pasa de `https://vulpo.cl/` a `https://voz.vulpo.cl/`, y la URL de cada clip se arma con
  la ruta relativa (`<asig>/<hash>.mp3`). La carpeta local del teléfono no cambia, así que una voz
  ya descargada sigue sirviendo.
- ⚠️ La app instalada hoy (prueba interna de Play) pide la voz a `vulpo.cl`. **Hay que compilar y
  subir una versión nueva ANTES del paso 6** (§5), o una instalación que todavía no haya bajado la
  voz se quedaría con la del navegador.

### 4.3 `scripts/armar-webdir.py`
Sin cambios de lógica: ya excluye los MP3 y conserva los manifiestos. Solo se actualiza su
comentario, que dice que los clips están en `vulpo.cl`.

### 4.4 `scripts/voz-r2.py` (nuevo)
Sincroniza la carpeta local `assets/voz/` con el bucket, usando `rclone` (S3 compatible):

| Subcomando | Qué hace |
|---|---|
| `subir` | Sube los MP3 locales que falten en R2. **Nunca borra nada en R2.** |
| `bajar` | Baja los MP3 de R2 que falten en el disco. **Nunca borra nada local.** |
| `verificar` | Cruza los manifiestos con el disco **y** con R2. Lista los clips que el manifiesto nombra y faltan en algún lado, y los archivos de 0 bytes. Sale con código 1 si falta algo. |

- Las subidas fijan `Cache-Control: public, max-age=31536000, immutable`: el nombre de cada clip es
  un hash de su texto, así que un clip nunca cambia. Un texto corregido genera **otro** nombre.
- **Nunca borra** a propósito: limpiar clips huérfanos es una decisión aparte, a mano. Un sync
  que borra es la forma más rápida de perder el respaldo.
- Las credenciales (clave de acceso de R2) viven **fuera del repo**, igual que la clave de Azure, en
  un archivo del escritorio que el script busca en rutas candidatas. `.gitignore` lo blinda.

### 4.5 `scripts/generar-voz-nivel.py` — el riesgo de plata
Hoy decide qué sintetizar mirando **si el MP3 existe en el disco** (línea ~266:
`not (SALIDA / manifiesto[ve]).exists()`). Cuando los MP3 dejen de viajar por git, en el otro PC
esos archivos no estarán, y el generador **volvería a sintetizar (y a pagar) toda la voz**.

**Guard:** antes de sintetizar, si el manifiesto nombra clips que no están en el disco, el script
**se detiene** con el mensaje *"faltan N clips en el disco: corre `python scripts/voz-r2.py bajar`
primero"*. `--rehacer` no se salta este guard. Y al terminar de generar recuerda correr `subir`.

`auditar-voz-nivel.py` necesita el mismo guard: transcribe archivos locales, y sin ellos fallaría o
auditaría de menos.

### 4.6 `.gitignore`
Agrega `assets/voz/**/*.mp3`. Los manifiestos siguen versionados.

## 5. El orden de la migración

Cada paso se verifica antes de pasar al siguiente. Hasta el paso 6 el sitio sigue sirviendo los
MP3 como hoy, así que cualquier cosa se puede deshacer sin que nadie lo note.

| # | Quién | Qué | Cómo se verifica |
|---|---|---|---|
| 1 | Roberto | Activar R2 (pide tarjeta), crear el bucket `vulpo-voz`, conectar el dominio `voz.vulpo.cl`, crear la clave de acceso y guardarla en el escritorio | `voz.vulpo.cl` responde |
| 2 | Claude | Instalar `rclone`, escribir `voz-r2.py`, **subir los 603 MB** | `voz-r2.py verificar`: los **24.250** clips (11 carpetas) de los manifiestos están en R2 con el **mismo tamaño y el mismo hash** que en el disco |
| 3 | Claude | `voz.js` y `voz-descarga.js` apuntan a `voz.vulpo.cl`, más el respaldo a la voz del navegador | Jugando 3° y 4° con `cdp.mjs`, espiando el constructor `Audio`: el juego pide a `voz.vulpo.cl` y recibe 200 `audio/mpeg`. Con R2 inaccesible, el texto se lee con la voz del navegador en vez de quedar mudo |
| 4 | Claude + Roberto | Publicar el código (orden 66). Compilar la app nueva y subirla a Play | En `vulpo.cl` y en el teléfono: la voz suena, y en la app baja desde `voz.vulpo.cl` |
| 5 | Roberto | En el **otro PC**, `voz-r2.py bajar` y después `verificar` | Tercer lugar del respaldo completo |
| 6 | Claude | Sacar los MP3 del árbol de git (`git rm --cached`) y agregar el `.gitignore` | El sitio publicado baja a ~100 MB; los MP3 siguen en el disco de los dos PC y en R2 |
| 7 | Claude | Guards en el generador y el auditor; actualizar `CLAUDE.md` (peso, cómo se genera la voz), `pendiente.md` y `docs/roadmap-tecnico.md` | El generador, con un clip borrado a propósito del disco, se niega a correr |

⚠️ **El paso 6 NO borra el historial:** los 603 MB siguen en el historial de git (el repositorio
no adelgaza), y eso es un respaldo más de lo que ya existe. Lo que cambia es lo **publicado**.

## 6. Qué NO cambia

- Los manifiestos, su formato y su indexado por el texto mostrado.
- `generar-voz-nivel.py` sigue escribiendo en `assets/voz/<asig>/`, en el disco.
- La app: su carpeta local, su barra de *"Preparando la voz…"* y su tolerancia de 5% de fallos.
- Los seis forks (`VOZ_DIRS` y `VOZ.init` quedan igual).

## 7. Riesgos

| Riesgo | Qué lo cubre |
|---|---|
| R2 caído o `voz.vulpo.cl` mal configurado | La caída a la voz del navegador (§4.1): el juego nunca queda mudo |
| El otro PC regenera y paga toda la voz | El guard del generador (§4.5) |
| Un `sync` que borra en R2 o en el disco | `voz-r2.py` nunca borra |
| Perder la clave de R2 | Se regenera desde el panel de Cloudflare; los datos no dependen de ella |
| La cuenta de Cloudflare cae (tarjeta vencida, etc.) | Dos copias completas en los PC; volver a subir es `voz-r2.py subir` |
| App vieja pidiendo a `vulpo.cl` tras el paso 6 | Compilar y publicar la app nueva en el paso 4 |

## 8. Costo

Dentro del tramo gratis de R2 (10 GB de almacenamiento, descargas sin costo). Con 1° y 2° la voz
quedaría en torno a 1,2-1,4 GB. Sobre 10 GB el almacenamiento cuesta centavos de dólar por GB al
mes. Cloudflare exige una tarjeta registrada para activar R2 aunque no se cobre nada.
