#!/usr/bin/env python3
# Arma `www/` = el subconjunto del sitio que va DENTRO de la app Android (Capacitor).
# El sitio web (vulpo.cl) se sigue sirviendo tal cual desde la raiz del repo; esto es
# solo para el empaque. `www/` es un artefacto de build: esta en .gitignore y lo
# regenera la nube (GitHub Actions) en cada compilacion.
#
# Que INCLUYE:
#   - app/index.html  ->  www/index.html   (la puerta de entrada = selector de curso)
#   - los seis cursos (3ro 4to 5to 6to 7mo 8vo)
#   - assets/  MENOS  originales/  y  MENOS los .mp3 de voz/
#   - contenido/
# Que EXCLUYE:
#   - la landing comercial raiz, /colegio, /tutorial, /dev
#   - assets/originales/ (arte crudo)
#   - los .mp3 de assets/voz/  (pesan ~580 MB; la app los descarga y cachea, ver spec §3).
#     ⚠️ Los MANIFIESTOS de voz (manifiesto.json) SI van: son chicos y el juego los necesita
#     para saber que clip toca cada texto. voz.js reescribe la ruta del mp3 a la carpeta
#     cacheada en el telefono (window.VOZ_LOCAL_BASE); mientras no esta, cae al TTS del
#     navegador.
#
# Rutas: los cursos usan <base href="/"> y enlaces absolutos (/assets, /5to/), que en el
# WebView de Capacitor resuelven desde la raiz de www/. Por eso los seis cursos y assets/
# van en la raiz de www/.

import os, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WWW = os.path.join(ROOT, "www")

CURSOS = ["3ro", "4to", "5to", "6to", "7mo", "8vo"]
ASSETS_EXCLUIR = {"originales"}   # voz/ se maneja aparte (manifiestos si, mp3 no)


def _rm(p):
    if os.path.exists(p):
        shutil.rmtree(p)


def _mb(p):
    t = 0
    for dp, _, fs in os.walk(p):
        for f in fs:
            try:
                t += os.path.getsize(os.path.join(dp, f))
            except OSError:
                pass
    return t / 1024 / 1024


def main():
    _rm(WWW)
    os.makedirs(WWW)

    # 1) el selector como index.html de la app
    shutil.copy(os.path.join(ROOT, "app", "index.html"), os.path.join(WWW, "index.html"))

    # 2) los seis cursos
    for c in CURSOS:
        shutil.copytree(os.path.join(ROOT, c), os.path.join(WWW, c))

    # 3) assets/ (menos originales; y en voz/, solo los manifiestos, sin mp3)
    src = os.path.join(ROOT, "assets")
    dst = os.path.join(WWW, "assets")
    os.makedirs(dst)
    for name in sorted(os.listdir(src)):
        if name in ASSETS_EXCLUIR:
            continue
        s, d = os.path.join(src, name), os.path.join(dst, name)
        if name == "voz":
            shutil.copytree(s, d, ignore=shutil.ignore_patterns("*.mp3"))
        elif os.path.isdir(s):
            shutil.copytree(s, d)
        else:
            shutil.copy(s, d)

    # 4) contenido/
    shutil.copytree(os.path.join(ROOT, "contenido"), os.path.join(WWW, "contenido"))

    # --- reporte, para aprobar mirando el numero y la estructura ---
    print("www/ armado: %.1f MB" % _mb(WWW))
    faltan = []
    for c in CURSOS + ["assets", "contenido", "index.html", "assets/js/motor.js",
                        "assets/vulpo-mascota.png", "assets/intro.mp4"]:
        ok = os.path.exists(os.path.join(WWW, c))
        print("  %-26s %s" % (c, "ok" if ok else "FALTA"))
        if not ok:
            faltan.append(c)

    voz = os.path.join(WWW, "assets", "voz")
    n_mp3 = n_man = 0
    if os.path.exists(voz):
        for dp, _, fs in os.walk(voz):
            for f in fs:
                if f.endswith(".mp3"):
                    n_mp3 += 1
                elif f == "manifiesto.json":
                    n_man += 1
    print("  assets/voz: %d manifiestos, %d mp3 (debe ser 0 mp3)" % (n_man, n_mp3))
    if faltan or n_mp3 != 0 or n_man == 0:
        raise SystemExit("ERROR: www/ incompleto (faltan=%s, mp3=%d, manifiestos=%d)"
                         % (faltan, n_mp3, n_man))


if __name__ == "__main__":
    main()
