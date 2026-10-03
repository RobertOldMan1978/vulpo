# -*- coding: utf-8 -*-
"""
Arma las slides de un carrusel de Instagram (4:5, 1080x1350) a partir de capturas
del juego, con el fondo violeta de la marca, la captura como tarjeta con esquinas
redondeadas + sombra, y el pie "VULPO · vulpo.cl".

Es la herramienta del procedimiento de docs/instagram-carrusel.md. La composición
normaliza capturas de distinto tamaño para que el carrusel se vea parejo.

Uso:
    python scripts/armar-carrusel-ig.py --salida <dir> --prefijo ig3 \
        slide1.png preg1.png preg2.png preg3.png

Recorte por imagen (opcional), para quitar barras o espacio vacío:
    preg1.png:top=0.0:bot=1540      # recorta arriba 0% y conserva hasta el px 1540
    slide1.png                      # sin recorte

  top = fracción (0-1) a quitar por ARRIBA (p. ej. una barra de tiempo).
  bot = píxel hasta el que se CONSERVA (quita el espacio vacío de abajo); también
        acepta fracción si es <=1 (0.8 = conserva el 80% superior).

Las imágenes salen como <salida>/<prefijo>-1.png, -2.png, ...  (RGB, PNG).
No sube nada: la publicación se hace aparte (ver el runbook).
"""
import os, sys, random, re
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1080, 1350          # 4:5, el formato vertical de Instagram
BOX_W, BOX_H = 912, 1120   # caja donde entra la captura
RAD = 30                   # radio de las esquinas de la tarjeta
GOLD = (255, 201, 60, 255)
CYAN = (77, 216, 255, 235)
TOP_BG, BOT_BG = (27, 18, 70), (11, 8, 30)   # degradado violeta de la marca


def fuente(tam):
    for p in (r'C:/Windows/Fonts/ariblk.ttf', r'C:/Windows/Fonts/arialbd.ttf',
              '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'):
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, tam)
            except Exception:
                pass
    return ImageFont.load_default()


def fondo(seed):
    g = Image.new('RGB', (1, H))
    for y in range(H):
        t = y / H
        g.putpixel((0, y), tuple(int(TOP_BG[i] + (BOT_BG[i] - TOP_BG[i]) * t) for i in range(3)))
    img = g.resize((W, H)).convert('RGBA')
    d = ImageDraw.Draw(img, 'RGBA')
    rnd = random.Random(seed)
    for _ in range(60):                       # estrellitas tenues
        x, y, r = rnd.randint(0, W), rnd.randint(0, H), rnd.choice([1, 1, 2])
        d.ellipse([x - r, y - r, x + r, y + r], fill=(255, 255, 255, rnd.randint(40, 130)))
    return img


def pie(img):
    d = ImageDraw.Draw(img, 'RGBA')
    fv, fc = fuente(34), fuente(30)
    t1, t2 = "VULPO", "  ·  vulpo.cl"
    w1, w2 = d.textlength(t1, font=fv), d.textlength(t2, font=fc)
    x, y = (W - (w1 + w2)) // 2, H - 72
    d.text((x, y), t1, font=fv, fill=GOLD)
    d.text((x + w1, y + 2), t2, font=fc, fill=CYAN)


def recortar(im, top, bot):
    w, h = im.size
    y0 = int(h * top) if 0 < top < 1 else int(top)
    if bot is None:
        y1 = h
    elif bot <= 1:
        y1 = int(h * bot)
    else:
        y1 = min(int(bot), h)
    return im.crop((0, max(0, y0), w, max(y0 + 1, y1)))


def tarjeta(path, top, bot):
    im = recortar(Image.open(path).convert('RGBA'), top, bot)
    w, h = im.size
    s = min(BOX_W / w, BOX_H / h)
    nw, nh = int(w * s), int(h * s)
    im = im.resize((nw, nh), Image.LANCZOS)
    mask = Image.new('L', (nw, nh), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, nw, nh], RAD, fill=255)
    im.putalpha(mask)
    return im


def una_slide(path, top, bot, seed):
    card = tarjeta(path, top, bot)
    nw, nh = card.size
    cx, cy = (W - nw) // 2, (H - 100 - nh) // 2 + 10
    bg = fondo(seed)
    sh = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle([cx, cy + 14, cx + nw, cy + nh + 14], RAD + 4, fill=(0, 0, 0, 150))
    sh = sh.filter(ImageFilter.GaussianBlur(22))
    bg = Image.alpha_composite(bg, sh)
    bg.alpha_composite(card, (cx, cy))
    pie(bg)
    return bg.convert('RGB')


def main():
    salida, prefijo, fuentes = '.', 'ig', []
    for a in sys.argv[1:]:
        if a == '--salida':
            salida = sys.argv[sys.argv.index(a) + 1]
        elif a == '--prefijo':
            prefijo = sys.argv[sys.argv.index(a) + 1]
        elif a.startswith('--'):
            pass
        elif a not in (salida, prefijo):
            # path[:top=..][:bot=..]  (el path puede traer 'C:/...' en Windows, así que
            #  solo se reconocen los sufijos :top= y :bot=, no cualquier ':')
            mt = re.search(r':top=([0-9.]+)', a)
            mb = re.search(r':bot=([0-9.]+)', a)
            top = float(mt.group(1)) if mt else 0.0
            bot = float(mb.group(1)) if mb else None
            path = re.sub(r':(top|bot)=[0-9.]+', '', a)
            fuentes.append((path, top, bot))
    if not fuentes:
        sys.exit(__doc__.strip())
    os.makedirs(salida, exist_ok=True)
    for i, (path, top, bot) in enumerate(fuentes, 1):
        if not os.path.exists(path):
            sys.exit("no encuentro: %s" % path)
        out = os.path.join(salida, "%s-%d.png" % (prefijo, i))
        una_slide(path, top, bot, seed=100 + i).save(out, 'PNG')
        print("ok", out)
    print("Listo: %d slides. Publicar segun docs/instagram-carrusel.md." % len(fuentes))


if __name__ == '__main__':
    main()
