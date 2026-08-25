# -*- coding: utf-8 -*-
"""
Consolida el banco de Matematica 3 basico.

- Lee los parciales de contenido/matematicas-3basico/_pool/verificado/*.json
- Suma las preguntas que ya estaban en preguntas.json (el banco semilla)
- Quita duplicados por enunciado normalizado (gana la primera aparicion)
- Baraja las opciones con semilla fija, repartiendo la correcta entre las 4 posiciones
- Asigna ids estables por OA (mat3-oaNN-n)
- Escribe preguntas.json ordenado por OA

Uso:
    python scripts/consolidar-pool-3ro.py
"""
import json, io, glob, random, unicodedata
from collections import defaultdict, Counter
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
BASE = RAIZ / "contenido" / "matematicas-3basico"
VERIF = BASE / "_pool" / "verificado"
SALIDA = BASE / "preguntas.json"
SEMILLA = 42


def norm(t):
    t = unicodedata.normalize("NFKD", str(t).lower())
    return "".join(c for c in t if not unicodedata.combining(c)).strip()


def cargar(ruta):
    d = json.load(io.open(ruta, encoding="utf-8"))
    return d["preguntas"] if isinstance(d, dict) else d


def main():
    rnd = random.Random(SEMILLA)
    todas = []
    if SALIDA.exists():
        todas += cargar(SALIDA)
    for f in sorted(glob.glob(str(VERIF / "*.json"))):
        todas += cargar(f)

    vistos, unicas = set(), []
    for p in todas:
        k = norm(p.get("pregunta", ""))
        if k in vistos:
            continue
        vistos.add(k)
        unicas.append(p)

    porOA = defaultdict(list)
    for p in unicas:
        porOA[p["oa"]].append(p)

    salida = []
    for oa in sorted(porOA):
        for i, p in enumerate(porOA[oa], 1):
            ops = list(p["opciones"])
            texto_correcto = ops[p["correcta"]]
            destino = (i - 1) % len(ops)          # reparto ciclico: 0,1,2,3,0,1,...
            resto = [o for j, o in enumerate(ops) if j != p["correcta"]]
            rnd.shuffle(resto)
            p["opciones"] = resto[:destino] + [texto_correcto] + resto[destino:]
            p["correcta"] = destino
            p["id"] = "mat3-%s-%d" % (oa.replace("MA03 OA ", "oa"), i)
            salida.append(p)

    io.open(SALIDA, "w", encoding="utf-8").write(
        json.dumps({"preguntas": salida}, ensure_ascii=False, indent=2))

    c = Counter(p["oa"] for p in salida)
    pos = Counter(p["correcta"] for p in salida)
    print("Escritas %d preguntas en %s" % (len(salida), SALIDA))
    print("Descartadas por duplicado: %d" % (len(todas) - len(unicas)))
    print("Reparto de la correcta por posicion: %s" % dict(sorted(pos.items())))
    for oa in sorted(c):
        print("  %s: %d" % (oa, c[oa]))


if __name__ == "__main__":
    main()
