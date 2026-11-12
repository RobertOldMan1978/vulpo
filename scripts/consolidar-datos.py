"""Une las tandas de datos curiosos (contenido/efemerides/_datos/*.json) en datos.json.

    python scripts/consolidar-datos.py

⚠️ CONSERVA LAS FIRMAS, igual que consolidar-efemerides.py: un dato que ya estaba revisada:true
la conserva solo si su texto y su imagen no cambiaron.

Escribe el formato canonico del proyecto: indent=1, LF, sin salto final.
"""
import io, json
from pathlib import Path

CARP = Path(__file__).resolve().parent.parent / "contenido" / "efemerides"
CAMPOS = ("id", "texto", "img", "tema", "fuente", "revisada")


def main():
    destino = CARP / "datos.json"
    prev = {}
    if destino.exists():
        prev = {d["id"]: d for d in json.load(io.open(destino, encoding="utf-8"))["datos"]}
    todos = []
    for t in sorted((CARP / "_datos").glob("*.json")):
        todos += json.load(io.open(t, encoding="utf-8"))["datos"]
    todos.sort(key=lambda d: d["id"])
    perdidas = 0
    for d in todos:
        p = prev.get(d["id"])
        firmada = bool(p and p.get("revisada"))
        sigue = firmada and p.get("texto") == d["texto"] and p.get("img") == d["img"]
        if firmada and not sigue:
            perdidas += 1
        d["revisada"] = sigue
    salida = {"revisadas": sum(1 for d in todos if d["revisada"]),
              "datos": [{k: d[k] for k in CAMPOS} for d in todos]}
    io.open(destino, "w", encoding="utf-8", newline="\n").write(
        json.dumps(salida, ensure_ascii=False, indent=1))
    print("%d datos, %d revisados%s" % (
        len(todos), salida["revisadas"],
        (" · %d perdieron la firma porque cambio su texto o su imagen" % perdidas) if perdidas else ""))


if __name__ == "__main__":
    main()
