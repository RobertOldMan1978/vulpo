# -*- coding: utf-8 -*-
# Genera los 3 PNG fuente (1024x1024) que @capacitor/assets usa para armar el icono de la
# app Android (legacy + adaptativo). El zorro sale del logo (assets/web/vulpo-logo.png),
# sin la palabra "Vulpo", sobre el fondo durazno del icono de la ficha (V1).
#   resources/icon-only.png       -> icono legacy (zorro llenando, sobre durazno)
#   resources/icon-foreground.png -> capa de adelante del adaptativo (zorro CON MARGEN, transparente)
#   resources/icon-background.png -> capa de atras del adaptativo (durazno)
# Re-ejecutable. NO genera arte nuevo: recorta y compone el logo existente.
import os
import numpy as np
from PIL import Image, ImageFilter

SZ = 1024
BG = (253, 203, 125)
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RES = os.path.join(ROOT, "resources")
os.makedirs(RES, exist_ok=True)
logo = Image.open(os.path.join(ROOT, "assets", "web", "vulpo-logo.png")).convert("RGBA")


def fondo():
    yy, xx = np.mgrid[0:SZ, 0:SZ]
    d = np.sqrt(((xx-SZ/2)/SZ)**2 + ((yy-SZ*0.46)/SZ)**2)
    d = np.clip(d/0.72, 0, 1)
    c_in = np.array([255, 214, 150]); c_out = np.array(BG)
    arr = (c_in*(1-d[..., None]) + c_out*d[..., None]).astype(np.uint8)
    return Image.fromarray(arr, "RGB").convert("RGBA")


def cara():
    """Recorta la cara del zorro (sin la palabra), ajustada al contenido."""
    reg = logo.crop((0, 0, logo.width, 415))
    a = np.array(reg)[..., 3]
    cols = np.where(a.max(axis=0) > 20)[0]; rows = np.where(a.max(axis=1) > 20)[0]
    return reg.crop((cols.min(), rows.min(), cols.max()+1, rows.max()+1))


def pegar(base, zorro, ancho_frac, cy_frac, sombra=True):
    w = int(SZ*ancho_frac); h = int(zorro.height*w/zorro.width)
    z = zorro.resize((w, h), Image.LANCZOS)
    px = (SZ-w)//2; py = int(SZ*cy_frac) - h//2
    if sombra:
        sh = Image.new("RGBA", (SZ, SZ), (0, 0, 0, 0))
        sh.paste(z, (px, py+12), z); sh = sh.filter(ImageFilter.GaussianBlur(20))
        al = sh.split()[3].point(lambda p: int(p*0.28)); sh.putalpha(al)
        base = Image.alpha_composite(base, sh)
    base.alpha_composite(z, (px, py))
    return base

z = cara()

# 1) legacy: zorro llenando sobre durazno
icon_only = pegar(fondo(), z, 0.90, 0.50)
icon_only.convert("RGB").save(os.path.join(RES, "icon-only.png"), "PNG")

# 2) adaptativo - adelante: zorro CON MARGEN (safe zone ~66%), transparente
fg = Image.new("RGBA", (SZ, SZ), (0, 0, 0, 0))
fg = pegar(fg, z, 0.62, 0.50, sombra=False)
fg.save(os.path.join(RES, "icon-foreground.png"), "PNG")

# 3) adaptativo - atras: solo durazno
fondo().convert("RGB").save(os.path.join(RES, "icon-background.png"), "PNG")

print("generados en", RES, ":", sorted(os.listdir(RES)))
