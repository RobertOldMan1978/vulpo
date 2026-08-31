# -*- coding: utf-8 -*-
"""De que nivel es un banco, y en que carpeta vive el juego de ese nivel.

NO lleva su propia lista de niveles: la LEE de `NIVELES_MUESTRA` en profesor.html, que
desde la Sesion 73 es LA lista de niveles del proyecto -de ahi salen el armador de
enlaces de muestra, el selector del enlace de inscripcion y el nivel del curso-. Asi
agregar 4 basico sigue siendo UNA linea, en un solo archivo.

Es el mismo motivo por el que `SB_asigDe` sobra en el panel y por el que el bug de la
Sesion 37 fue posible: en este proyecto las listas paralelas son la fuente de error mas
repetida.
"""
import io
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
PANEL = RAIZ / "profesor.html"


def _tabla():
    h = io.open(PANEL, encoding="utf-8").read()
    i = h.index("const NIVELES_MUESTRA")
    bloque = h[i:h.index("]", i)]
    return re.findall(r"nivel:'(\d\d)'.*?ruta:'/([^/']*)/?'", bloque)


def nivel_de(carpeta):
    """'matematicas-3basico' -> '03'. None si es un transversal sin nivel (un libro)."""
    m = re.search(r"-(\d)basico$", carpeta)
    return "0" + m.group(1) if m else None


def fork_de(carpeta):
    """Carpeta del fork del nivel de ese banco, o None si no se puede saber.

    8 basico se sirve en /juego/, asi que su `ruta` vacia no existe: se nombra aparte.
    """
    n = nivel_de(carpeta)
    if not n:
        return None
    for niv, ruta in _tabla():
        if niv == n:
            return ruta or "juego"
    return None


VISUALES = RAIZ / "assets" / "js" / "visuales.js"


def tipos_de_dibujo(fork=None):
    """Los tipos que `renderVisual` sabe dibujar, leidos del modulo compartido.

    Existe porque los scripts llevaban una COPIA A MANO de ese catalogo, y si se
    desincroniza el sintoma es mudo: el juego devuelve '' y la pregunta sale sin su
    apoyo sin que nada avise.

    Desde M1 el catalogo es UNICO (assets/js/visuales.js) y no del fork de cada nivel,
    asi que `fork` se ignora: se conserva el parametro para no romper a quien lo pase.
    """
    if not VISUALES.exists():
        return None
    h = io.open(VISUALES, encoding="utf-8").read()
    return set(re.findall(r"T==='(\w+)'", h))


if __name__ == "__main__":
    print("niveles declarados en profesor.html:", _tabla())
    for c in ["matematicas-3basico", "historia-7basico", "lenguaje-8basico",
              "lectura-cuentos-de-ada"]:
        print("  %-24s nivel=%-4s fork=%s" % (c, nivel_de(c), fork_de(c)))
    print("  tipos de dibujo (assets/js/visuales.js):",
          sorted(tipos_de_dibujo() or []))
