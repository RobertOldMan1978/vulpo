#!/usr/bin/env python3
# Sube el nivel de API OBJETIVO y de COMPILACION a 36 (Android 16), que Google Play EXIGE para
# publicar apps nuevas. Corre en la nube sobre el android/ recien generado por `npx cap add
# android` (que se regenera en cada corrida: no vive en el repo).
#
# Capacitor 6 genera variables.gradle con compileSdkVersion=34 y targetSdkVersion=34. Play
# rechaza el .aab por targetSdk < 36 ("debe orientarse, al menos, al nivel 36"). El Android
# Gradle Plugin exige compileSdk >= targetSdk, asi que se suben LOS DOS a 36.
#   ⚠️ minSdkVersion NO se toca (queda en 22): el error de Play es solo por el OBJETIVO, y bajar
#      el minimo dejaria telefonos viejos afuera sin necesidad.
#
# El AGP de Capacitor 6 (8.2.1) fue probado hasta compileSdk 34; contra un SDK ESTABLE mas nuevo
# solo emite una ADVERTENCIA (no un error) y compila igual. Se agrega
# android.suppressUnsupportedCompileSdk a gradle.properties para silenciarla.
#
# Estilo de los otros parches del proyecto: verifica-antes-de-escribir (aborta con mensaje claro
# si el formato cambio, en vez de escribir a medias), idempotente, LF, utf-8.
import re, sys, os

TARGET = "36"

# 1) variables.gradle: compileSdkVersion y targetSdkVersion al 36
v = os.path.join("android", "variables.gradle")
s = open(v, encoding="utf-8").read()


def subir(texto, clave):
    pat = r'(\b' + clave + r'\s*=\s*)\d+'
    if not re.search(pat, texto):
        sys.stderr.write("ERROR: no se encontro '" + clave + "' en " + v + "\n")
        sys.exit(1)
    return re.sub(pat, r'\g<1>' + TARGET, texto, count=1)


s = subir(s, "compileSdkVersion")
s = subir(s, "targetSdkVersion")
open(v, "w", encoding="utf-8", newline="\n").write(s)
print("variables.gradle: compileSdkVersion y targetSdkVersion -> " + TARGET)

# 2) gradle.properties: silenciar la advertencia de AGP por compileSdk mas nuevo que el probado
p = os.path.join("android", "gradle.properties")
gp = open(p, encoding="utf-8").read() if os.path.exists(p) else ""
if "suppressUnsupportedCompileSdk" not in gp:
    if gp and not gp.endswith("\n"):
        gp += "\n"
    gp += "android.suppressUnsupportedCompileSdk=" + TARGET + "\n"
    open(p, "w", encoding="utf-8", newline="\n").write(gp)
    print("gradle.properties: suppressUnsupportedCompileSdk=" + TARGET)
else:
    print("gradle.properties: ya tenia suppressUnsupportedCompileSdk")
