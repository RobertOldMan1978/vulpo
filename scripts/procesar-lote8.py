# -*- coding: utf-8 -*-
"""
Lote 8: los 8 villanos propios de 3 y 7 basico (normal + derrotado) = 16 imagenes.

Cierra la tarea A2: hasta ahora 3 y 7 prestaban los villanos de 8 (comentarios
PLACEHOLDER). Cada campana usa `villanoImg` (normal) y `villanoImgDerrotado`
(cinematica de victoria).

  villano-<asig>-3ro.png / -3ro-derrotado.png   (4 asignaturas de 3)
  villano-<asig>-7mo.png / -7mo-derrotado.png   (4 asignaturas de 7)

Las imagenes vienen con fondo blanco: se recorta por relleno de inundacion desde
las esquinas (mismo metodo del lote 6/7). A DIFERENCIA de lotes anteriores, NO se
copian los originales a assets/originales (esa carpeta ya pesa ~175 MB y el sitio
es sensible al tamano): los originales quedan en la carpeta de Descargas de Roberto.

Uso: python scripts/procesar-lote8.py
"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ASSETS = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "assets"))
SRC = os.path.join(os.path.expanduser("~"), "Downloads")
BLANCO_MIN = 200
UMBRAL_FILL = 30

# (uuid, nombre)  -- todos flood, 512 px, margen 0.06
LOTE = [
    # --- 3 basico ---
    ("3aa8c4ce-e42e-4be7-9899-c3bb329e2e9c", "villano-matematicas-3ro"),
    ("f612fe28-6334-4919-86e8-4c7047a37481", "villano-matematicas-3ro-derrotado"),
    ("b5e4584d-3f46-48c7-9c9d-39d23e2a32cd", "villano-historia-3ro"),
    ("db9485ea-2647-41b3-ae27-790694803445", "villano-historia-3ro-derrotado"),
    ("d8010ae4-20f2-4741-bb70-c98ef6c54c8f", "villano-ciencias-3ro"),
    ("c250258f-d72c-4f48-8409-b8ba08e4a9c7", "villano-ciencias-3ro-derrotado"),
    ("68583b80-449a-4ba6-8e2e-f990a1a6c091", "villano-lenguaje-3ro"),
    ("68f2406b-9cdc-489f-a2e8-33137bd376e7", "villano-lenguaje-3ro-derrotado"),
    # --- 7 basico ---
    ("f327ffe5-d5cb-4b87-86b4-67469e2d8863", "villano-historia-7mo"),
    ("91274c63-7569-41c2-a4e9-650bb64d6149", "villano-historia-7mo-derrotado"),
    ("5b4d47a6-3eac-4924-a4fa-c4d74a449b30", "villano-matematicas-7mo"),
    ("ce48d6d1-4cbf-4cbf-a9d3-f8841332c187", "villano-matematicas-7mo-derrotado"),
    ("10c5c9f6-430c-422b-9ddd-42733463ad2e", "villano-ciencias-7mo"),
    ("29df6ed2-e7d6-40e0-a609-e57acedef45c", "villano-ciencias-7mo-derrotado"),
    ("9a8872d0-895d-459b-ad69-ef167c98023e", "villano-lenguaje-7mo"),
    ("025ca2bf-b547-4e24-9a4d-fc6930b409d7", "villano-lenguaje-7mo-derrotado"),
]
TAM = 512
MARGEN = 0.06


def quitar_fondo(im):
    im = im.convert("RGB")
    gris = im.convert("L")
    marca = gris.copy()
    for esquina in [(0, 0), (im.width - 1, 0), (0, im.height - 1), (im.width - 1, im.height - 1)]:
        if gris.getpixel(esquina) >= BLANCO_MIN:
            ImageDraw.floodfill(marca, esquina, 1, thresh=UMBRAL_FILL)
    fondo = (np.asarray(marca) == 1) & (np.asarray(gris) >= BLANCO_MIN)
    alfa = Image.fromarray(np.where(fondo, 0, 255).astype(np.uint8), "L")
    alfa = alfa.filter(ImageFilter.GaussianBlur(0.8))
    out = im.convert("RGBA")
    out.putalpha(alfa)
    return out


def recortar_y_centrar(im, margen):
    a = np.asarray(im)[:, :, 3]
    ys, xs = np.where(a > 10)
    if len(xs) == 0:
        return im
    im = im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    lado = max(im.width, im.height)
    m = int(lado * margen)
    lienzo = Image.new("RGBA", (lado + 2 * m, lado + 2 * m), (0, 0, 0, 0))
    lienzo.paste(im, ((lienzo.width - im.width) // 2, (lienzo.height - im.height) // 2), im)
    return lienzo


def main():
    print("Procesamiento lote 8 (villanos de 3 y 7)\n" + "=" * 52)
    faltan = 0
    for uuid, nombre in LOTE:
        src = os.path.join(SRC, uuid + ".png")
        if not os.path.exists(src):
            print(f"  [!] falta {uuid}.png ({nombre})"); faltan += 1; continue
        im = Image.open(src)
        final = recortar_y_centrar(quitar_fondo(im), MARGEN).resize((TAM, TAM), Image.LANCZOS)
        dst = os.path.join(ASSETS, nombre + ".png")
        final.save(dst, "PNG", optimize=True)
        print(f"  {nombre:34s} {os.path.getsize(src)//1024:5d} KB -> {os.path.getsize(dst)//1024:4d} KB")
    print("=" * 52 + f"\nListo. {len(LOTE)-faltan}/{len(LOTE)} procesados (originales NO copiados al repo).")


if __name__ == "__main__":
    main()
