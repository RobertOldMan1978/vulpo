# -*- coding: utf-8 -*-
"""Junta los cuadros que dejó capturar-tutorial.mjs en los .mp4 del tutorial.

    node scripts/cdp.mjs about:blank scripts/capturar-tutorial.mjs
    python scripts/armar-clips.py

Se hace con una RAFAGA de capturas y no con Page.startScreencast para no meterle una
maquina nueva a cdp.mjs, que es la herramienta con la que se verifica el juego y conviene
mantener chica. La contra es que el ritmo no es exacto: los cuadros salen a ~5 por segundo
segun lo que demore cada captura, y por eso el clip se arma a 5 fps y se REPITE en bucle,
que para un gesto de dos segundos es lo mismo a la vista.

MP4 y no GIF: el mismo gesto pesa del orden de diez veces menos, y un apoderado lo abre
por datos moviles. Va `muted autoplay loop playsinline`, que es lo unico que reproduce solo
en iPhone.
"""
import io
import os
import subprocess
import sys
from pathlib import Path

import imageio_ffmpeg

RAIZ = Path(__file__).resolve().parent.parent
CUADROS = Path(os.environ.get("LOCALAPPDATA", "")) / (
    "Temp/claude/c--Proyectos-kimun/936b2d86-188e-488e-9bba-c95b184acac1/scratchpad/cuadros")
SALIDA = RAIZ / "assets" / "web" / "tutorial"
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

# nombre -> que muestra (va al alt/aria del video, asi que se lee)
CLIPS = {
    "ayuda":    "El comodin 50/50 deja dos opciones",
    "error":    "Al fallar se muestra la respuesta correcta y su explicacion",
    "diagrama": "El diagrama de la mini-clase se arrastra",
}


def main():
    if not CUADROS.exists():
        sys.exit("No estan los cuadros en %s.\nCorre primero:\n"
                 "  node scripts/cdp.mjs about:blank scripts/capturar-tutorial.mjs" % CUADROS)
    SALIDA.mkdir(parents=True, exist_ok=True)
    hechos = 0
    for nombre, que in CLIPS.items():
        cs = sorted(CUADROS.glob(nombre + "-*.png"))
        if not cs:
            print("  AVISO: sin cuadros para '%s' (se salta)" % nombre)
            continue
        destino = SALIDA / (nombre + ".mp4")
        cmd = [FFMPEG, "-y", "-framerate", "5",
               "-i", str(CUADROS / (nombre + "-%02d.png")),
               # yuv420p + dimensiones pares: sin eso, Safari no lo reproduce.
               "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2",
               "-pix_fmt", "yuv420p", "-c:v", "libx264", "-crf", "28",
               "-movflags", "+faststart", "-an", str(destino)]
        r = subprocess.run(cmd, capture_output=True)
        if r.returncode != 0 or not destino.exists():
            print("  *** FALLO %s ***" % nombre)
            print((r.stderr or b"").decode("utf-8", "replace")[-600:])
            continue
        kb = destino.stat().st_size / 1024.0
        print("  %-10s %2d cuadros -> %6.0f KB   (%s)" % (nombre, len(cs), kb, que))
        hechos += 1
    if not hechos:
        sys.exit("No se armo ningun clip.")
    print("\nListo: %d clips en %s" % (hechos, SALIDA))


if __name__ == "__main__":
    main()
