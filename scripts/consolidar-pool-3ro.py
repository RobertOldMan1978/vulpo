# -*- coding: utf-8 -*-
"""Consolida el banco de preguntas de una asignatura de 3 basico.

Un solo consolidador para todas. Antes habia uno por asignatura (Matematica e
Historia, casi identicos): este proyecto ya se quemo varias veces con listas
paralelas que se desincronizan, y un tercer y cuarto clon para Lenguaje y Ciencias
era pedirlo de nuevo.

Que hace:
- Lee las tandas de `contenido/<asignatura>/_pool/*.json` (acepta tanto `oaNN.json`
  sueltos como una subcarpeta `verificado/`).
- Quita duplicados por enunciado normalizado (gana la primera aparicion).
- **Baraja las opciones** con semilla fija. Esto NO es opcional: las tandas se
  escriben con la correcta casi siempre primera —comodo para redactar, desastroso
  para jugar— y sin barajar el banco entero tendria la respuesta en la posicion A.
- Reparte la correcta entre las 4 posiciones y lo informa, para poder comprobarlo.
- Conserva `visual` e `id`.
- Escribe `preguntas.json` ordenado por OA y numero.

Uso:
    python scripts/consolidar-pool-3ro.py historia-3basico
    python scripts/consolidar-pool-3ro.py lenguaje-3basico --seco   # no escribe
"""
import json, io, glob, random, sys, unicodedata
from collections import Counter
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SEMILLA = 42          # fija: consolidar dos veces da el mismo archivo


def norm(t):
    t = unicodedata.normalize("NFKD", str(t).lower())
    return "".join(c for c in t if not unicodedata.combining(c)).strip()


def cargar(ruta):
    d = json.load(io.open(ruta, encoding="utf-8"))
    return d["preguntas"] if isinstance(d, dict) else d


def num_id(pid):
    """El numero final del id, para ordenar. Un id sin numero va al final."""
    try:
        return int(str(pid).rsplit("-", 1)[1])
    except (IndexError, ValueError):
        return 10 ** 6


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args:
        sys.exit("uso: python scripts/consolidar-pool-3ro.py <carpeta-de-contenido>\n"
                 "     por ejemplo: historia-3basico")
    base = RAIZ / "contenido" / args[0]
    if not base.is_dir():
        sys.exit("no existe %s" % base)
    seco = "--seco" in sys.argv

    rutas = sorted(glob.glob(str(base / "_pool" / "*.json"))) + \
            sorted(glob.glob(str(base / "_pool" / "verificado" / "*.json")))
    if not rutas:
        sys.exit("no hay tandas en %s/_pool" % base)

    rnd = random.Random(SEMILLA)
    todas, vistos, dup = [], set(), 0
    for ruta in rutas:
        for p in cargar(ruta):
            k = norm(p["pregunta"])
            if k in vistos:
                dup += 1
                continue
            vistos.add(k)
            todas.append(p)

    salida, pos, sin_id = [], Counter(), 0
    for p in todas:
        ops = list(p["opciones"])
        correcta = ops[p["correcta"]]
        rnd.shuffle(ops)
        i = ops.index(correcta)
        pos[i] += 1
        q = {"oa": p["oa"], "pregunta": p["pregunta"], "opciones": ops, "correcta": i,
             "tip": p.get("tip", ""), "revisada": False, "id": p.get("id", "")}
        if not q["id"]:
            sin_id += 1
        if p.get("visual"):
            q["visual"] = p["visual"]
        salida.append(q)

    salida.sort(key=lambda q: (q["oa"], num_id(q["id"])))

    oas = Counter(q["oa"] for q in salida)
    print("preguntas: %d  (duplicados descartados: %d)" % (len(salida), dup))
    if sin_id:
        print("  OJO: %d preguntas sin id. El modo revision (?rev=1) las necesita." % sin_id)
    print("OA distintos: %d" % len(oas))
    for oa in sorted(oas):
        print("   %s: %d" % (oa, oas[oa]))
    print("con dibujo: %d" % sum(1 for q in salida if q.get("visual")))
    # Un reparto muy desparejo aqui significa que el barajado no corrio o que las
    # tandas traian un patron; con ~30 por OA lo normal es 22-28% en cada posicion.
    tot = max(1, len(salida))
    print("posicion de la correcta: %s"
          % {k: "%d (%.0f%%)" % (v, 100.0 * v / tot) for k, v in sorted(pos.items())})

    if seco:
        print("\n(--seco: no se escribio nada)")
        return
    destino = base / "preguntas.json"
    io.open(destino, "w", encoding="utf-8", newline="\n").write(
        json.dumps({"preguntas": salida}, ensure_ascii=False, indent=1))
    print("escrito en %s" % destino)


if __name__ == "__main__":
    main()
