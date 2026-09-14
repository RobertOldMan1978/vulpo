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

import json, os, re, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WWW = os.path.join(ROOT, "www")

CURSOS = ["3ro", "4to", "5to", "6to", "7mo", "8vo"]
ASSETS_EXCLUIR = {"originales"}   # voz/ se maneja aparte (manifiestos si, mp3 no)

# --- Contenido sensible que NO va en la app Android (opcion 2 de Roberto, para Google Play) ---
# El sitio web (vulpo.cl) lo conserva ENTERO; esto solo lo saca del paquete de la app. Son los
# capitulos de sexualidad/reproduccion de 6 y 7 basico: curriculum oficial del MINEDUC, pero
# contenido que un colegio confesional y la politica de Familias de Play miran con lupa. Cada
# capitulo se saca de su fork (deja de existir en la app: no se muestra ni cuenta para el Jefe
# Final, porque su id sale de la lista `capitulos`) y sus PREGUNTAS + la leccion sexual se
# borran del bundle. El motor (assets/js/motor.js) y los forks del repo NO se tocan: todo el
# corte vive aqui, sobre la copia en www/, que es un artefacto de build (gitignorado).
#   ⚠️ cie6-cap2 ("Mi cuerpo y mi salud") mezcla 3 OA sexuales (CN06 OA 04/05/06) con 1 de drogas
#      (OA 07), y el jefe DEL CAPITULO cruza los cuatro, asi que no se puede partir: se oculta el
#      capitulo entero. Consecuencia: la app pierde el NODO de drogas de 6 -pero el OA 07 SIGUE
#      en la app dentro del Jefe Final de Ciencias (fase 1: 'Vida y ecosistemas'), y el web lo
#      mantiene todo-. Por eso los OA de drogas NO se borran del bundle: el jefe los necesita.
SENSIBLE_FUERA = [
    {"fork": "7mo", "cap": "cie7-cap5", "carpeta": "ciencias-7basico",
     "leccion": "ci7-sexualidad", "oas": ["CN07 OA 01", "CN07 OA 02", "CN07 OA 03"]},
    {"fork": "6to", "cap": "cie6-cap2", "carpeta": "ciencias-6basico",
     "leccion": "ci6-cuerpo", "oas": ["CN06 OA 04", "CN06 OA 05", "CN06 OA 06"]},
]


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


def _quitar_capitulo(html_path, cap):
    """Saca el objeto del capitulo de EXPEDICIONES y su id de la lista `capitulos` de la
       copia en www/. Aborta si no calza EXACTO: es un artefacto de build, y mejor fallar la
       compilacion que empacar un capitulo sensible a medias."""
    with open(html_path, encoding="utf-8", newline="") as f:
        html = f.read()
    # el objeto: de "{ id:'<cap>'," hasta el primer "]}," (cierre de etapas + del objeto).
    # etapas es el unico "[...]" del objeto y sus items son "{...}", asi que el primer "]},"
    # tras la linea del id es siempre el cierre del capitulo. Tolera LF y CRLF.
    obj = re.compile(r"[ \t]*\{ id:'" + re.escape(cap) + r"',.*?\n[ \t]*\]\},[^\r\n]*\r?\n", re.S)
    hits = obj.findall(html)
    if len(hits) != 1:
        raise SystemExit("strip: %s -> esperaba 1 objeto de capitulo, hay %d" % (cap, len(hits)))
    html = obj.sub("", html, count=1)
    # el id en la lista `capitulos`, con su coma adyacente, exactamente una vez.
    for tok in (",'" + cap + "'", "'" + cap + "',"):
        if html.count(tok) == 1:
            html = html.replace(tok, "", 1)
            break
    else:
        raise SystemExit("strip: %s -> no encontre 1 entrada en la lista capitulos" % cap)
    if cap in html:
        raise SystemExit("strip: %s -> quedo una referencia despues de sacarlo" % cap)
    with open(html_path, "w", encoding="utf-8", newline="") as f:
        f.write(html)


def _escribir_json(path, data):
    with open(path, "w", encoding="utf-8", newline="") as f:
        f.write(json.dumps(data, ensure_ascii=False, indent=1))


def _strip_contenido(base, oas, leccion):
    """Borra del bundle las preguntas de los OA sexuales y la leccion de introduccion."""
    pf = os.path.join(base, "preguntas.json")
    with open(pf, encoding="utf-8") as f:
        d = json.load(f)
    antes = len(d["preguntas"])
    d["preguntas"] = [p for p in d["preguntas"] if p.get("oa") not in oas]
    quit_p = antes - len(d["preguntas"])
    if quit_p != 30 * len(oas):
        raise SystemExit("strip %s: quite %d preguntas, esperaba %d" % (base, quit_p, 30 * len(oas)))
    if isinstance(d.get("revisadas"), int):   # contador de metadata, se recalcula para no mentir
        d["revisadas"] = sum(1 for p in d["preguntas"] if p.get("revisada"))
    _escribir_json(pf, d)
    lf = os.path.join(base, "lecciones.json")
    with open(lf, encoding="utf-8") as f:
        L = json.load(f)
    antes = len(L["lecciones"])
    L["lecciones"] = [x for x in L["lecciones"] if x.get("id") != leccion]
    quit_l = antes - len(L["lecciones"])
    if quit_l != 1:
        raise SystemExit("strip %s: quite %d lecciones '%s', esperaba 1" % (base, quit_l, leccion))
    _escribir_json(lf, L)
    return quit_p, quit_l


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

    # 5) sacar el contenido sensible de la app (el web lo conserva; ver SENSIBLE_FUERA)
    print("contenido sensible fuera de la app:")
    for s in SENSIBLE_FUERA:
        _quitar_capitulo(os.path.join(WWW, s["fork"], "index.html"), s["cap"])
        qp, ql = _strip_contenido(os.path.join(WWW, "contenido", s["carpeta"]),
                                  s["oas"], s["leccion"])
        print("  %-4s cap %-10s fuera + %d preguntas + %d leccion (%s)"
              % (s["fork"], s["cap"], qp, ql, s["leccion"]))

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

    # verificacion final: nada sensible sobrevive en el bundle
    for s in SENSIBLE_FUERA:
        with open(os.path.join(WWW, s["fork"], "index.html"), encoding="utf-8") as f:
            forkhtml = f.read()
        if s["cap"] in forkhtml:
            raise SystemExit("VERIF: %s quedo en %s/index.html" % (s["cap"], s["fork"]))
        base = os.path.join(WWW, "contenido", s["carpeta"])
        with open(os.path.join(base, "preguntas.json"), encoding="utf-8") as f:
            blob = f.read()
        with open(os.path.join(base, "lecciones.json"), encoding="utf-8") as f:
            blob += f.read()
        for oa in s["oas"]:
            if oa in blob:
                raise SystemExit("VERIF: %s quedo en el contenido de %s" % (oa, s["carpeta"]))
        if s["leccion"] in blob:
            raise SystemExit("VERIF: leccion %s quedo en %s" % (s["leccion"], s["carpeta"]))
    print("  sensible fuera: OK (0 capitulos, 0 preguntas, 0 lecciones sexuales en el bundle)")


if __name__ == "__main__":
    main()
