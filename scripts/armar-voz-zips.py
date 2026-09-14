#!/usr/bin/env python3
# Arma los paquetes de voz de la app: dist-voz/voz-3ro.zip y voz-4to.zip.
# Solo 3° y 4° tienen voz pregrabada. Los zip llevan SOLO los .mp3 (los manifiestos
# van dentro del bundle www/), con la estructura <asignatura>/<clip>.mp3, para que la
# app los descomprima en el telefono y voz.js los sirva reescribiendo la ruta
# (window.VOZ_LOCAL_BASE -> <cache>/<asignatura>/<clip>.mp3). Ver el spec §3.
#
# Estos zip NO van al git (git topa en 100 MB por archivo): se suben a GitHub Releases.
# Las carpetas de voz de cada curso se LEEN del propio fork (su const VOZ_DIRS), no se
# adivinan (len3 vs leng4, ada3, etc.).

import os, re, zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "dist-voz")
CURSOS = ["3ro", "4to"]   # los unicos con voz pregrabada (regla del proyecto: voz 1°-4°)


def voz_dirs(curso):
    html = open(os.path.join(ROOT, curso, "index.html"), encoding="utf-8").read()
    m = re.search(r"const VOZ_DIRS\s*=\s*\[([^\]]*)\]", html)
    if not m:
        raise SystemExit("no encuentro VOZ_DIRS en " + curso)
    return re.findall(r"'([^']+)'", m.group(1))   # ['assets/voz/mat3/', ...]


def main():
    os.makedirs(OUT, exist_ok=True)
    for curso in CURSOS:
        dirs = voz_dirs(curso)
        zpath = os.path.join(OUT, "voz-%s.zip" % curso)
        n = 0
        with zipfile.ZipFile(zpath, "w", zipfile.ZIP_STORED) as z:   # mp3 ya comprimidos: STORED
            for d in dirs:                                   # 'assets/voz/mat3/'
                rel = d.replace("assets/voz/", "").strip("/")        # 'mat3'
                src = os.path.join(ROOT, *d.strip("/").split("/"))
                if not os.path.isdir(src):
                    print("  ⚠ falta la carpeta", src)
                    continue
                for f in sorted(os.listdir(src)):
                    if not f.endswith(".mp3"):               # los manifiestos NO (van en el bundle)
                        continue
                    z.write(os.path.join(src, f), arcname=rel + "/" + f)
                    n += 1
        mb = os.path.getsize(zpath) / 1024 / 1024
        etiquetas = ", ".join(d.replace("assets/voz/", "").strip("/") for d in dirs)
        print("voz-%s.zip: %d clips, %.1f MB  (%s)" % (curso, n, mb, etiquetas))


if __name__ == "__main__":
    main()
