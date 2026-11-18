"""Valida contenido/mensajes/mensajes.json, el catalogo de mensajes del profe (Sesion 155).

El servidor guarda SOLO el id del mensaje (msg-NN): el texto vive aqui. Por eso un id no puede
repetirse ni cambiar de sentido (cambiaria lo que dicen mensajes ya enviados). Sale con 1 si
encuentra un error.

    python scripts/validar-mensajes.py
"""
import io, json, re, sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ARCH = RAIZ / "contenido" / "mensajes" / "mensajes.json"
CAT = RAIZ / "contenido" / "efemerides" / "imagenes.json"
EMOJI = re.compile("[\U0001F300-\U0001FAFF☀-➿️]")

def main():
    errores = []
    crudo = io.open(ARCH, encoding="utf-8", newline="").read()
    d = json.loads(crudo)
    if crudo != json.dumps(d, ensure_ascii=False, indent=1):
        errores.append("formato no canonico (indent=1, sin salto final, LF)")
    cat = json.load(io.open(CAT, encoding="utf-8"))
    cat = cat if isinstance(cat, list) else cat.get("imagenes", [])
    imgs = {x["img"] for x in cat}
    vistos = set()
    ms = d.get("mensajes", [])
    for m in ms:
        i, t, im = m.get("id", ""), (m.get("texto") or "").strip(), m.get("img", "")
        if not re.fullmatch(r"msg-\d{2}", i): errores.append(f"{i!r}: id mal formado")
        if i in vistos: errores.append(f"{i}: id repetido")
        vistos.add(i)
        if not t: errores.append(f"{i}: texto vacio")
        if len(t) > 70: errores.append(f"{i}: texto de {len(t)} caracteres (maximo 70)")
        if EMOJI.search(t): errores.append(f"{i}: el texto lleva emoji")
        if not (RAIZ / "assets" / im).is_file(): errores.append(f"{i}: la imagen {im} no existe")
        elif im not in imgs: errores.append(f"{i}: la imagen {im} no esta en imagenes.json")
    for e in errores: print("ERROR", e)
    print(f"{len(ms)} mensajes · {len(errores)} errores")
    return 1 if errores else 0

if __name__ == "__main__":
    sys.exit(main())
