# -*- coding: utf-8 -*-
"""
Aplica los parches de distractores al banco de Matematica 3 basico.

Los agentes revisores NO editan preguntas.json: cada uno escribe un parche en
_fix_distractores/*.json con la forma

    { "<id de pregunta>": { "opciones": [...4...], "motivo": "..." } }

Este script los aplica, pero antes VERIFICA que cada parche toque solo los
distractores. Si un parche cambia el enunciado, la respuesta correcta, su
posicion, el oa, el tip o el visual, se RECHAZA ese parche y se informa.

Uso:
    python scripts/aplicar-fix-distractores.py --simular   # no escribe, solo informa
    python scripts/aplicar-fix-distractores.py             # aplica
"""
import json, io, sys, glob
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
BANCO = RAIZ / "contenido" / "matematicas-3basico" / "preguntas.json"
PARCHES = RAIZ / "_fix_distractores"


def main():
    simular = "--simular" in sys.argv
    d = json.load(io.open(BANCO, encoding="utf-8"))
    ix = {p["id"]: p for p in d["preguntas"]}

    parches = {}
    for f in sorted(glob.glob(str(PARCHES / "*.json"))):
        try:
            trozo = json.load(io.open(f, encoding="utf-8"))
        except Exception as e:
            print("PARCHE ILEGIBLE %s: %s" % (f, e))
            continue
        for k, v in trozo.items():
            if k in parches:
                print("AVISO: %s viene en dos parches; gana el primero" % k)
                continue
            parches[k] = (v, Path(f).name)

    aplicados, rechazados = [], []
    for qid, (v, origen) in sorted(parches.items()):
        p = ix.get(qid)
        if p is None:
            rechazados.append((qid, origen, "no existe esa pregunta"))
            continue
        nuevas = v.get("opciones")
        if not isinstance(nuevas, list) or len(nuevas) != 4:
            rechazados.append((qid, origen, "no trae 4 opciones"))
            continue
        nuevas = [str(o) for o in nuevas]
        if len({o.strip().lower() for o in nuevas}) != 4:
            rechazados.append((qid, origen, "opciones repetidas"))
            continue
        c = p["correcta"]
        if nuevas[c].strip() != str(p["opciones"][c]).strip():
            rechazados.append((qid, origen,
                               "movio la respuesta correcta: esperaba %r en la posicion %d, trae %r"
                               % (p["opciones"][c], c, nuevas[c])))
            continue
        sin_cambio = [i for i in range(4) if i != c and
                      str(p["opciones"][i]).strip() == nuevas[i].strip()]
        aplicados.append((qid, origen, list(p["opciones"]), nuevas,
                          v.get("motivo", ""), 3 - len(sin_cambio)))
        if not simular:
            p["opciones"] = nuevas

    print("parches leidos: %d | aplicados: %d | rechazados: %d"
          % (len(parches), len(aplicados), len(rechazados)))
    print("distractores efectivamente cambiados: %d"
          % sum(a[5] for a in aplicados))
    if rechazados:
        print("\nRECHAZADOS:")
        for qid, origen, motivo in rechazados:
            print("  %-16s (%s): %s" % (qid, origen, motivo))
    print("\nEJEMPLOS:")
    for qid, origen, antes, despues, motivo, n in aplicados[:8]:
        print("  %s" % qid)
        print("     antes:   %s" % antes)
        print("     despues: %s" % despues)
        if motivo:
            print("     motivo:  %s" % motivo)

    if simular:
        print("\n(simulacion: no se escribio nada)")
        return
    io.open(BANCO, "w", encoding="utf-8").write(
        json.dumps(d, ensure_ascii=False, indent=2))
    print("\nBanco actualizado: %s" % BANCO)


if __name__ == "__main__":
    main()
