# -*- coding: utf-8 -*-
"""Consolida el banco de Historia, Geografia y Ciencias Sociales de 3° basico.

- Lee las tandas de contenido/historia-3basico/_pool/oaNN.json
- Quita duplicados por enunciado normalizado (gana la primera aparicion)
- **Baraja las opciones** con semilla fija: las tandas se escriben con la correcta siempre
  en la primera posicion, que es comodo para redactarlas y desastroso para jugarlas.
- Reparte la correcta entre las 4 posiciones y lo informa, para poder comprobarlo
- Conserva el `visual` y el `id` de cada pregunta
- Escribe preguntas.json ordenado por OA

Uso:
    python scripts/consolidar-pool-hist3.py
"""
import json, io, glob, random, unicodedata
from collections import Counter
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
BASE = RAIZ / "contenido" / "historia-3basico"
POOL = BASE / "_pool"
SALIDA = BASE / "preguntas.json"
SEMILLA = 42          # fija: consolidar dos veces da el mismo archivo


def norm(t):
    t = unicodedata.normalize("NFKD", str(t).lower())
    return "".join(c for c in t if not unicodedata.combining(c)).strip()


def main():
    rnd = random.Random(SEMILLA)
    todas, vistos, dup = [], set(), 0
    for ruta in sorted(glob.glob(str(POOL / "oa*.json"))):
        d = json.load(io.open(ruta, encoding="utf-8"))
        for p in d["preguntas"]:
            k = norm(p["pregunta"])
            if k in vistos:
                dup += 1
                continue
            vistos.add(k)
            todas.append(p)

    salida, pos = [], Counter()
    for p in todas:
        ops = list(p["opciones"])
        correcta = ops[p["correcta"]]
        rnd.shuffle(ops)
        i = ops.index(correcta)
        pos[i] += 1
        q = {"oa": p["oa"], "pregunta": p["pregunta"], "opciones": ops, "correcta": i,
             "tip": p.get("tip", ""), "revisada": False, "id": p["id"]}
        if p.get("visual"):
            q["visual"] = p["visual"]
        salida.append(q)

    salida.sort(key=lambda q: (q["oa"], int(q["id"].rsplit("-", 1)[1])))
    io.open(SALIDA, "w", encoding="utf-8", newline="\n").write(
        json.dumps({"preguntas": salida}, ensure_ascii=False, indent=1))

    oas = Counter(q["oa"] for q in salida)
    print("preguntas: %d  (duplicados descartados: %d)" % (len(salida), dup))
    print("OA distintos: %d" % len(oas))
    for oa in sorted(oas):
        print("   %s: %d" % (oa, oas[oa]))
    print("con dibujo: %d" % sum(1 for q in salida if q.get("visual")))
    print("posicion de la respuesta correcta: %s" % dict(sorted(pos.items())))
    print("escrito en %s" % SALIDA)


if __name__ == "__main__":
    main()
