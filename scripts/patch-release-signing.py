#!/usr/bin/env python3
# Firma el APP BUNDLE (.aab) de RELEASE con la UPLOAD KEY de Google Play. Corre en la nube
# (workflow android-release.yml), sobre el android/ recien generado por `npx cap add android`
# (que se regenera en cada corrida: no vive en el repo).
#
# Modelo de firma (Play App Signing): Google guarda la clave MAESTRA de firma; tu subes el
# .aab firmado con una UPLOAD KEY. Este parche le pone a build.gradle un signingConfig.release
# apuntando a esa upload key y lo cablea al buildType release. Capacitor deja el release SIN
# firmar por defecto, asi que sin esto el .aab sale sin firmar y Play lo rechaza.
#
# ⚠️ La clave y sus contrasenas NUNCA van en el repo (que es PUBLICO): se leen del ENTORNO,
# que el workflow llena desde SECRETOS de GitHub. Por eso build.gradle referencia
# System.getenv(...) y no valores literales: ni la contrasena ni la ruta quedan escritas en
# ningun archivo. El keystore se decodifica desde el secreto base64 a un archivo efimero del
# runner, cuya ruta llega en VULPO_KEYSTORE_FILE.
#
# Variables de entorno que espera (las pone el workflow desde los secretos):
#   VULPO_KEYSTORE_FILE      ruta al .jks decodificado (efimero, en el runner)
#   VULPO_KEYSTORE_PASSWORD  contrasena del almacen
#   VULPO_KEY_ALIAS          alias de la clave
#   VULPO_KEY_PASSWORD       contrasena de la clave
#   VULPO_VERSION_CODE       (opcional) versionCode nuevo; cada .aab que sube a Play debe
#                            llevar uno MAYOR que el anterior. Si falta, deja el default (1).
import os, re, sys

g = os.path.join("android", "app", "build.gradle")
s = open(g, encoding="utf-8").read()
if "VULPO_RELEASE_SIGNING" in s:
    print("ya parcheado"); sys.exit(0)

# 1) signingConfigs.release apuntando a la upload key (todo desde el entorno)
block = (
    "\n    // VULPO_RELEASE_SIGNING: firma con la upload key de Play (valores desde secretos)\n"
    "    signingConfigs {\n"
    "        release {\n"
    '            storeFile file(System.getenv("VULPO_KEYSTORE_FILE"))\n'
    '            storePassword System.getenv("VULPO_KEYSTORE_PASSWORD")\n'
    '            keyAlias System.getenv("VULPO_KEY_ALIAS")\n'
    '            keyPassword System.getenv("VULPO_KEY_PASSWORD")\n'
    "        }\n"
    "    }\n"
)
# anclado a inicio de linea, para no pegar dentro de "noandroid {" ni "capacitor-android"
s2 = re.sub(r'(?m)^([ \t]*)android([ \t]*)\{', r'\1android\2{' + block, s, count=1)
if s2 == s:
    sys.stderr.write("ERROR: no se encontro el bloque 'android {' en " + g + "\n"); sys.exit(1)
s = s2

# 2) cablear el buildType release a ese signingConfig
s2 = re.sub(r'(buildTypes\s*\{\s*release\s*\{)',
            r'\1\n            signingConfig signingConfigs.release', s, count=1)
if s2 == s:
    sys.stderr.write("ERROR: no se encontro 'buildTypes { release {' en " + g + "\n"); sys.exit(1)
s = s2

# 3) versionCode: cada subida a Play debe ser mayor que la anterior. El workflow lo pone al
#    numero de corrida, que crece solo. Si el entorno no lo trae, se deja el default.
vc = os.environ.get("VULPO_VERSION_CODE", "").strip()
if vc:
    if not vc.isdigit():
        sys.stderr.write("ERROR: VULPO_VERSION_CODE no es numerico: %r\n" % vc); sys.exit(1)
    s2 = re.sub(r'\bversionCode\s+\d+', 'versionCode ' + vc, s, count=1)
    if s2 == s:
        sys.stderr.write("ERROR: no se encontro 'versionCode <n>' en " + g + "\n"); sys.exit(1)
    s = s2
    print("versionCode -> " + vc)

open(g, "w", encoding="utf-8", newline="\n").write(s)
print("build.gradle parcheado: firma de release con la upload key")
