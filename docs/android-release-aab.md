# Armar el `.aab` firmado para Google Play

El APK de `android.yml` sirve para **probar en el teléfono**. Para **publicar en Play** hace falta
un **App Bundle (`.aab`) firmado**, que arma el workflow **`android-release.yml`** (Actions → *App
Bundle de Release* → *Run workflow*). Este runbook es lo único que Roberto hace **una sola vez**:
crear la *upload key* y cargar 4 secretos. Después, cada `.aab` sale con un clic.

> ### ⚠️ La upload key y sus contraseñas NUNCA van al repositorio (es PÚBLICO)
> Viven **solo** en tu PC (el archivo `.jks`) y como **secretos de GitHub**. El repo, el workflow y
> el `.aab` no las contienen: el workflow las lee de los secretos y las pasa por el entorno.

## Cómo funciona la firma (Play App Signing), en una línea
Google guarda la **clave maestra** con que firma lo que descargan los usuarios; tú subes el `.aab`
firmado con tu **upload key**. Si algún día pierdes la upload key, Google la **resetea** (no se
pierde la app) — pero igual respáldala, ver el final.

---

## Paso 1 — Instalar un JDK (trae `keytool`, que crea la clave)
Tu PC no tiene Java. En **PowerShell**:

```powershell
winget install --id Microsoft.OpenJDK.21 -e
```

Cierra y reabre la terminal. Comprueba que quedó:

```powershell
keytool -help
```

Si `keytool` no aparece, cierra sesión de Windows y vuelve a entrar (para que tome el PATH nuevo).

## Paso 2 — Crear la upload key (una vez)
En **PowerShell**, en una carpeta tuya **fuera del repo** (p. ej. el Escritorio):

```powershell
keytool -genkeypair -v -keystore vulpo-upload.jks -keyalg RSA -keysize 2048 -validity 10000 -alias vulpo-upload
```

Te va a pedir:
- **Contraseña del almacén (keystore password):** invéntala y **anótala**. Úsala también cuando te
  pregunte la de la clave (la *key password*): déjala **igual** — presiona Enter para reusarla.
  (El formato PKCS12 que crea keytool hoy usa una sola contraseña; mantenerlas iguales evita líos.)
- Nombre, organización, ciudad, país: pon lo que quieras (no se muestra a nadie). País: `CL`.
- Al final confirma con `sí`.

Queda el archivo **`vulpo-upload.jks`**. Los datos que vas a cargar como secretos son:
- **alias:** `vulpo-upload`
- **contraseña:** la que inventaste (la misma para almacén y clave)

## Paso 3 — Codificar la clave en base64
Un secreto de GitHub es texto, así que el `.jks` (binario) se codifica. En **PowerShell**, en la
misma carpeta:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("vulpo-upload.jks")) | Set-Content -NoNewline vulpo-upload.b64
```

Abre `vulpo-upload.b64` (es una sola línea larga) y **copia todo su contenido**: eso va en el
secreto `ANDROID_KEYSTORE_BASE64`.

## Paso 4 — Cargar los 4 secretos en GitHub
GitHub → el repo **vulpo** → **Settings** → **Secrets and variables** → **Actions** → *New
repository secret*. Crea estos cuatro (los nombres deben ser **exactos**):

| Nombre del secreto | Valor |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | todo el contenido de `vulpo-upload.b64` |
| `ANDROID_KEYSTORE_PASSWORD` | la contraseña que inventaste |
| `ANDROID_KEY_ALIAS` | `vulpo-upload` |
| `ANDROID_KEY_PASSWORD` | la **misma** contraseña (paso 2) |

## Paso 5 — Armar el `.aab`
GitHub → **Actions** → **App Bundle de Release** → **Run workflow** (rama `feature/android`). Si
falta algún secreto, el workflow **se detiene con un aviso claro** en vez de un error de Gradle.
Al terminar (~5-10 min), en la corrida hay un artefacto **`vulpo-aab-release`**: descárgalo, adentro
está **`app-release.aab`**.

> El `versionCode` sube solo con cada corrida (usa el número de ejecución), así que cada `.aab`
> nuevo es mayor que el anterior — que es justo lo que Play exige para actualizar.

## Paso 6 — Subir a Play Console
En Play Console, al crear el release, **acepta Play App Signing** (deja que Google genere y guarde
la clave maestra). Sube el `app-release.aab`; tu upload key es la de este keystore. La guía de los
formularios (nombre, Data safety, Familias, etc.) está en `guia-play-console.md`
(fuera del repo, en la carpeta de material comercial).

---

## ⚠️ Respalda el keystore
Guarda **`vulpo-upload.jks`** y su contraseña en un lugar seguro (gestor de contraseñas / respaldo
cifrado), **fuera del repositorio y de cualquier carpeta que se suba a GitHub**. Con Play App
Signing perderla es recuperable (Google resetea la upload key), pero es un trámite: mejor tenerla.

## Si algo falla
- **"Falta el secreto ANDROID_KEYSTORE_BASE64":** no cargaste los secretos (paso 4) o un nombre
  quedó mal escrito.
- **Error de contraseña / alias en Gradle:** el `ANDROID_KEY_ALIAS` no es `vulpo-upload`, o las dos
  contraseñas de los secretos no coinciden con la del keystore.
- **"You uploaded an APK/AAB that is not signed":** revisa que el workflow que corriste sea *App
  Bundle de Release* (no el APK de debug).
