#!/usr/bin/env python3
# Fuerza que el APK de debug se firme con el keystore ESTABLE de ~/.android/debug.keystore
# (el que el workflow cachea entre builds), para poder ACTUALIZAR la app sin desinstalar.
#
# Por que hace falta: el Android Gradle Plugin, por su cuenta, genera un keystore de debug
# AL AZAR en cada build (medido: dos APK del mismo codigo salieron con firmas distintas),
# asi que Android rechaza la actualizacion ("conflicto de paquetes"). Este parche le pone
# un signingConfig.debug explicito apuntando al keystore estable. El android/ se regenera
# en cada corrida (`npx cap add android`), asi que esto corre despues, sobre el generado.
import os, re, sys

g = os.path.join("android", "app", "build.gradle")
s = open(g, encoding="utf-8").read()
if "VULPO_DEBUG_SIGNING" in s:
    print("ya parcheado"); sys.exit(0)

block = (
    "\n    // VULPO_DEBUG_SIGNING: firma de debug estable (actualizar sin desinstalar)\n"
    "    signingConfigs {\n"
    "        debug {\n"
    '            storeFile file(System.getProperty("user.home") + "/.android/debug.keystore")\n'
    '            storePassword "android"\n'
    '            keyAlias "androiddebugkey"\n'
    '            keyPassword "android"\n'
    "        }\n"
    "    }\n"
)
s2 = re.sub(r'android\s*\{', 'android {' + block, s, count=1)
if s2 == s:
    sys.stderr.write("ERROR: no se encontro 'android {' en " + g + "\n"); sys.exit(1)
open(g, "w", encoding="utf-8", newline="\n").write(s2)
print("build.gradle parcheado: firma de debug estable")
