# -*- coding: utf-8 -*-
"""Genera el icono de la app instalada a partir de assets/kimun-512.png.

POR QUE NO SE USA kimun-512.png TAL CUAL. Android recorta los iconos a la forma
de su lanzador (circulo, cuadrado redondeado). La cara de Vulpi llena el cuadro
entero y las orejas tocan el borde, asi que al recortarse pierde las puntas de
las orejas y algo de barbilla. Un icono "maskable" necesita que lo importante
quepa en el circulo central del 80%.

La cara se reduce al 80% y se centra sobre su PROPIO color de fondo, leido del
pixel de la esquina, para que el resultado no tenga costura. El archivo original
NO se toca: sigue siendo el favicon y el apple-touch-icon.

Uso:  python scripts/generar-icono-app.py
"""
import os
import sys

from PIL import Image

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIGEN = os.path.join(RAIZ, "assets", "kimun-512.png")
ESCALA = 0.80  # la zona segura de un icono maskable es el circulo central del 80%

if not os.path.exists(ORIGEN):
    sys.exit("No existe %s" % ORIGEN)

src = Image.open(ORIGEN).convert("RGB")
fondo = src.getpixel((6, 6))
print("fondo detectado: #%02x%02x%02x" % fondo)

for lado in (512, 192):
    lienzo = Image.new("RGB", (lado, lado), fondo)
    cara = int(lado * ESCALA)
    lienzo.paste(src.resize((cara, cara), Image.LANCZOS), ((lado - cara) // 2,) * 2)
    salida = os.path.join(RAIZ, "assets", "icono-%d.png" % lado)
    lienzo.save(salida, optimize=True)
    print("  %-28s %d bytes" % (os.path.basename(salida), os.path.getsize(salida)))
