# -*- coding: utf-8 -*-
"""
Procesa arte generado por IA para dejarlo listo como asset del juego.

Reemplaza a los ocho `procesar-lote*.py`, que eran el MISMO codigo con una lista de
UUID distinta cada vez. Aqui los archivos van por argumento, asi que no hace falta
un script nuevo por lote.

Que hace con cada imagen:
  1. Quita el fondo blanco por RELLENO DE INUNDACION desde las cuatro esquinas.
     Es la parte que costo aprender (Sesion 18): estas imagenes vienen en RGB con
     fondo blanco OPACO, sin canal alfa, asi que recortarlas por alfa las dejaria
     como cuadrados blancos. Y hay que inundar desde las esquinas y no borrar "todo
     lo blanco", porque si no desaparecen los blancos INTERIORES: el delantal, una
     bandera, un pergamino.
  2. Recorta al contenido y lo centra en un lienzo cuadrado con margen.
  3. Escala al tamano pedido y guarda PNG optimizado en assets/.

Uso:
    python scripts/procesar-arte.py <archivo>=<nombre-destino> [...]
    python scripts/procesar-arte.py --tam=384 --margen=0.08 foto.png=skin-vulpi-mago

  <archivo> puede ser una ruta o, si no existe, se busca en la carpeta de Descargas
  (asi se puede pasar el UUID que deja el generador de imagenes).
  <nombre-destino> va SIN extension: se guarda como assets/<nombre>.png

Los ORIGINALES no se copian a assets/originales/ (esa carpeta ya pesa ~175 MB y el
sitio es sensible al tamano). Quedan donde esten.
"""
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ASSETS = os.path.join(RAIZ, "assets")
DESCARGAS = os.path.join(os.path.expanduser("~"), "Downloads")

# Un pixel se considera fondo si es casi blanco Y lo alcanza la inundacion desde
# una esquina. Los dos umbrales salieron de probar con arte real; bajarlos come
# bordes claros del dibujo.
BLANCO_MIN = 200
UMBRAL_FILL = 30

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
    # Un desenfoque minimo suaviza el borde: sin el, el recorte queda dentado.
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


def buscar(origen):
    """La ruta tal cual, o el mismo nombre dentro de Descargas (con o sin .png)."""
    for c in (origen, os.path.join(DESCARGAS, origen),
              os.path.join(DESCARGAS, origen + ".png")):
        if os.path.exists(c):
            return c
    return None


def main():
    tam, margen, pares = TAM, MARGEN, []
    for a in sys.argv[1:]:
        if a.startswith("--tam="):
            tam = int(a.split("=", 1)[1])
        elif a.startswith("--margen="):
            margen = float(a.split("=", 1)[1])
        elif "=" in a:
            pares.append(a.split("=", 1))
        else:
            sys.exit("No entiendo '%s'. Formato: <archivo>=<nombre-destino>" % a)

    if not pares:
        sys.exit(__doc__.strip())

    os.makedirs(ASSETS, exist_ok=True)
    hechos = faltan = 0
    print("Procesando %d imagen(es) a %d px, margen %.2f" % (len(pares), tam, margen))
    print("=" * 60)
    for origen, nombre in pares:
        src = buscar(origen)
        if src is None:
            print("  [!] no encuentro %s (ni en %s)" % (origen, DESCARGAS))
            faltan += 1
            continue
        im = Image.open(src)
        final = recortar_y_centrar(quitar_fondo(im), margen).resize((tam, tam), Image.LANCZOS)
        dst = os.path.join(ASSETS, nombre + ".png")
        final.save(dst, "PNG", optimize=True)
        hechos += 1
        print("  %-38s %5d KB -> %4d KB" % (nombre, os.path.getsize(src) // 1024,
                                            os.path.getsize(dst) // 1024))
    print("=" * 60)
    print("Listo: %d procesadas, %d sin encontrar. Los originales NO se copian al repo." %
          (hechos, faltan))
    # Que falte un archivo tiene que NOTARSE: si no, se cree que el lote entero salio.
    sys.exit(1 if faltan else 0)


if __name__ == "__main__":
    main()
