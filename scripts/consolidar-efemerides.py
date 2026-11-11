"""Une las tandas de efemerides (contenido/efemerides/_tandas/*.json) en efemerides.json.

    python scripts/consolidar-efemerides.py

⚠️ CONSERVA LAS FIRMAS. Una entrada que ya estaba revisada:true en efemerides.json la conserva
solo si su texto y su imagen no cambiaron: si cambio, la firma anterior ya no le corresponde y
vuelve a false. Es la leccion de la Sesion 134: re-consolidar un banco sin esto habria borrado
130 firmas de golpe.

Escribe el formato canonico del proyecto: indent=1, LF, sin salto final.
"""
import io, json
from pathlib import Path

CARP = Path(__file__).resolve().parent.parent / "contenido" / "efemerides"
CAMPOS = ("id", "fecha", "texto", "img", "tema", "fuente", "revisada")


def main():
    destino = CARP / "efemerides.json"
    prev = {}
    if destino.exists():
        prev = {e["id"]: e for e in json.load(io.open(destino, encoding="utf-8"))["efemerides"]}
    todas = []
    for t in sorted((CARP / "_tandas").glob("*.json")):
        todas += json.load(io.open(t, encoding="utf-8"))["efemerides"]
    todas.sort(key=lambda e: e["fecha"])
    perdidas = 0
    for e in todas:
        p = prev.get(e["id"])
        firmada = bool(p and p.get("revisada"))
        sigue = firmada and p.get("texto") == e["texto"] and p.get("img") == e["img"]
        if firmada and not sigue:
            perdidas += 1
        e["revisada"] = sigue
    salida = {"revisadas": sum(1 for e in todas if e["revisada"]),
              "efemerides": [{k: e[k] for k in CAMPOS} for e in todas]}
    io.open(destino, "w", encoding="utf-8", newline="\n").write(
        json.dumps(salida, ensure_ascii=False, indent=1))
    print("%d efemerides, %d revisadas%s" % (
        len(todas), salida["revisadas"],
        (" · %d perdieron la firma porque cambio su texto o su imagen" % perdidas) if perdidas else ""))


if __name__ == "__main__":
    main()
