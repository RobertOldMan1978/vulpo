"""Valida las efemerides del dia (spec docs/superpowers/specs/2026-11-11-efemerides-design.md, §8).

    python scripts/validar-efemerides.py                  # el consolidado: exige las 366 fechas
    python scripts/validar-efemerides.py _tandas/11.json  # una tanda suelta (no exige 366)

Sale con 1 si hay ERRORES. Los AVISOS no cambian la salida: se juzgan a mano.

⚠️ Las fechas vetadas son la mitad delicada del trabajo: ese dia va OTRO hecho, y si el texto
nombra lo vetado es error, no aviso. La lista vive aca y en docs/encargo-efemerides.md: al
tocar una, tocar la otra.
"""
import io, json, re, sys, calendar
from pathlib import Path
from collections import Counter

RAIZ = Path(__file__).resolve().parent.parent
CARP = RAIZ / "contenido" / "efemerides"
TEMAS = {"historia", "ciencia", "naturaleza", "cultura", "deporte", "dia-oficial", "mundo"}
LARGO = 170
# Un emoji se locuta por su nombre en ingles ("alto voltaje", Sesion 56): en el texto, nunca.
EMOJI = re.compile("[\U0001F300-\U0001FAFF☀-➿⬀-⯿️]")
VETOS = {
    "09-11": r"1973|golpe|Allende|Pinochet|La Moneda",
    "10-18": r"2019|estallido",
    "03-29": r"combatiente|Vergara",
    "10-05": r"plebiscito|1988",
    "10-25": r"plebiscito|2020|constituci",
    "09-04": r"elecci|plebiscito|1970|2022",
    "02-27": r"2010|terremoto|tsunami|maremoto",
}
# Ningun hecho politico de 1970 en adelante. Es AVISO: un chequeo lexico no distingue
# "en 1985 se fundo un parque" de un hecho politico, asi que se mira a mano.
POLITICO = re.compile(r"\b(19[789]\d|20[0-2]\d)\b.*\b(elecci|plebiscit|presidente|gobierno|golpe|dictadura)", re.I)


def todas_las_fechas():
    # 2024 es bisiesto: asi entra el 29 de febrero
    return ["%02d-%02d" % (m, d) for m in range(1, 13)
            for d in range(1, calendar.monthrange(2024, m)[1] + 1)]


def main():
    arg = [a for a in sys.argv[1:] if not a.startswith("-")]
    ruta = (CARP / arg[0]) if arg else (CARP / "efemerides.json")
    if not ruta.exists():
        sys.exit("No existe %s" % ruta)
    completo = not arg
    lista = json.load(io.open(ruta, encoding="utf-8"))["efemerides"]
    cat = {x["img"] for x in json.load(io.open(CARP / "imagenes.json", encoding="utf-8"))["imagenes"]}
    validas = set(todas_las_fechas())
    err, avi = [], []

    fechas = Counter(e.get("fecha") for e in lista)
    for f, n in sorted(fechas.items(), key=lambda x: str(x[0])):
        if n > 1:
            err.append("fecha repetida %s (%d veces)" % (f, n))
    if completo:
        faltan = sorted(validas - set(fechas))
        if faltan:
            err.append("faltan %d fechas: %s%s" % (len(faltan), ", ".join(faltan[:12]),
                                                    " ..." if len(faltan) > 12 else ""))

    for e in lista:
        f, t = e.get("fecha", "?"), e.get("texto", "")
        if f not in validas:
            err.append("%s: fecha invalida (formato MM-DD)" % f)
        if e.get("id") != "efem-%s" % f:
            err.append("%s: el id deberia ser efem-%s" % (f, f))
        if not t.strip():
            err.append("%s: texto vacio" % f)
        if len(t) > LARGO:
            err.append("%s: texto de %d caracteres (max %d)" % (f, len(t), LARGO))
        if EMOJI.search(t):
            err.append("%s: el texto lleva emoji (la voz lo leeria por su nombre)" % f)
        if e.get("img") not in cat:
            err.append("%s: la imagen %r no esta en imagenes.json" % (f, e.get("img")))
        elif not (RAIZ / "assets" / e["img"]).exists():
            err.append("%s: la imagen %r no existe en assets/" % (f, e["img"]))
        if not str(e.get("fuente", "")).startswith("https://"):
            err.append("%s: falta la fuente https" % f)
        if e.get("tema") not in TEMAS:
            err.append("%s: tema %r invalido" % (f, e.get("tema")))
        if not isinstance(e.get("revisada"), bool):
            err.append("%s: falta revisada (true/false)" % f)
        if f in VETOS and re.search(VETOS[f], t, re.I):
            err.append("%s: nombra un hecho vetado para ese dia" % f)
        if POLITICO.search(t):
            avi.append("%s: parece politico reciente, revisar a mano: %s" % (f, t))

    orden = sorted(lista, key=lambda e: str(e.get("fecha", "")))
    for a, b in zip(orden, orden[1:]):
        if a.get("img") == b.get("img"):
            avi.append("%s y %s usan la misma imagen" % (a.get("fecha"), b.get("fecha")))
    for m in range(1, 13):
        del_mes = [e.get("tema") for e in lista if str(e.get("fecha", "")).startswith("%02d-" % m)]
        if len(del_mes) >= 10:
            tema, n = Counter(del_mes).most_common(1)[0]
            if n / len(del_mes) > 0.5:
                avi.append("mes %02d: %d de %d son %s" % (m, n, len(del_mes), tema))
        imgs = Counter(e.get("img") for e in lista if str(e.get("fecha", "")).startswith("%02d-" % m))
        for img, n in imgs.items():
            if n > 2:
                avi.append("mes %02d: %s se usa %d veces (max 2)" % (m, img, n))

    print("%d efemerides · %d errores · %d avisos" % (len(lista), len(err), len(avi)))
    for x in err:
        print("  ERROR ", x)
    for x in avi:
        print("  aviso ", x)
    sys.exit(1 if err else 0)


if __name__ == "__main__":
    main()
