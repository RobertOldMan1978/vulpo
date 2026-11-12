"""Valida el banco de datos curiosos (spec docs/superpowers/specs/2026-11-11-datos-extra-design.md).

    python scripts/validar-datos.py                    # el consolidado contenido/efemerides/datos.json
    python scripts/validar-datos.py _datos/ciencia.json  # una tanda suelta

Sale con 1 si hay ERRORES. Los AVISOS no cambian la salida: se juzgan a mano.
Comparte las reglas de texto con validar-efemerides.py (largo, emoji, politica reciente).
"""
import io, json, re, sys
from pathlib import Path
from collections import Counter

RAIZ = Path(__file__).resolve().parent.parent
CARP = RAIZ / "contenido" / "efemerides"
TEMAS = {"literatura", "historia", "ciencia", "naturaleza", "deporte", "curioso"}
LARGO = 170
EMOJI = re.compile("[\U0001F300-\U0001FAFF☀-➿⬀-⯿️]")
POLITICO = re.compile(r"\b(19[789]\d|20[0-2]\d)\b.*\b(elecci|plebiscit|presidente|gobierno|golpe|dictadura)", re.I)
# Lo que va entre comillas (rectas, tipograficas o latinas) es una cita: no se repite en VULPO.
# Las efemerides citan con comilla simple ('Que el verso sea...'); el apostrofo de O'Higgins no
# abre cita porque va pegado a una letra.
CITA = re.compile(r"(?:^|(?<=[\s:(]))['«\"“]([^'«»\"“”]{8,}?)['»\"”](?=[\s.,;:!?)]|$)")
INICIO_FECHA = re.compile(r"^\s*(hoy|un d[ií]a como hoy)\b", re.I)


def citas(t):
    return {c.strip().lower().rstrip(".,;:") for c in CITA.findall(t or "")}


def main():
    arg = [a for a in sys.argv[1:] if not a.startswith("-")]
    ruta = (CARP / arg[0]) if arg else (CARP / "datos.json")
    if not ruta.exists():
        sys.exit("No existe %s" % ruta)
    lista = json.load(io.open(ruta, encoding="utf-8"))["datos"]
    cat = {x["img"] for x in json.load(io.open(CARP / "imagenes.json", encoding="utf-8"))["imagenes"]}
    efem = json.load(io.open(CARP / "efemerides.json", encoding="utf-8"))["efemerides"]
    citas_efem = {}
    for e in efem:
        for c in citas(e.get("texto")):
            citas_efem[c] = e.get("fecha")
    err, avi = [], []

    ids = Counter(d.get("id") for d in lista)
    for i, n in ids.items():
        if n > 1:
            err.append("id repetido %s (%d veces)" % (i, n))
    textos = Counter((d.get("texto") or "").strip().lower() for d in lista)
    for t, n in textos.items():
        if n > 1 and t:
            err.append("texto repetido %d veces: %s" % (n, t[:70]))

    vistas = {}
    for d in lista:
        i, t, tema = d.get("id", "?"), d.get("texto", ""), d.get("tema")
        if tema not in TEMAS:
            err.append("%s: tema %r invalido" % (i, tema))
        elif not re.fullmatch(r"dato-%s-\d{2}" % re.escape(tema), str(i)):
            err.append("%s: el id deberia ser dato-%s-NN" % (i, tema))
        if not t.strip():
            err.append("%s: texto vacio" % i)
        if len(t) > LARGO:
            err.append("%s: texto de %d caracteres (max %d)" % (i, len(t), LARGO))
        if EMOJI.search(t):
            err.append("%s: el texto lleva emoji (la voz lo leeria por su nombre)" % i)
        if d.get("img") not in cat:
            err.append("%s: la imagen %r no esta en imagenes.json" % (i, d.get("img")))
        elif not (RAIZ / "assets" / d["img"]).exists():
            err.append("%s: la imagen %r no existe en assets/" % (i, d["img"]))
        if not str(d.get("fuente", "")).startswith("https://"):
            err.append("%s: falta la fuente https" % i)
        if not isinstance(d.get("revisada"), bool):
            err.append("%s: falta revisada (true/false)" % i)
        if INICIO_FECHA.search(t):
            err.append("%s: un dato no tiene fecha, no empieza con 'Hoy'" % i)
        if POLITICO.search(t):
            avi.append("%s: parece politico reciente, revisar a mano: %s" % (i, t))
        for c in citas(t):
            if c in citas_efem:
                avi.append("%s: la cita ya esta en la efemeride del %s: %s" % (i, citas_efem[c], c))
            if c in vistas:
                avi.append("%s: la cita ya esta en %s: %s" % (i, vistas[c], c))
            vistas[c] = i

    por_tema = {}
    for d in lista:
        por_tema.setdefault(d.get("tema"), []).append(d.get("img"))
    for tema, imgs in por_tema.items():
        for img, n in Counter(imgs).items():
            if n > 3:
                avi.append("%s: %s se usa %d veces (max 3)" % (tema, img, n))

    n_tema = Counter(d.get("tema") for d in lista)
    print("%d datos (%s) · %d errores · %d avisos" % (
        len(lista), ", ".join("%s %d" % kv for kv in sorted(n_tema.items(), key=str)), len(err), len(avi)))
    for x in err:
        print("  ERROR ", x)
    for x in avi:
        print("  aviso ", x)
    sys.exit(1 if err else 0)


if __name__ == "__main__":
    main()
