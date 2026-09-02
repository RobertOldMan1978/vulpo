# -*- coding: utf-8 -*-
"""De que nivel es un banco, y que dibujos sabe hacer el modulo de visuales.

AQUI SE BORRO CODIGO MUERTO Y ROTO (02/09/2026), y conviene saber por que. Este archivo
tenia ademas `fork_de(carpeta)` -"en que carpeta vive el juego de ese nivel"- que leia la
tabla de niveles de `NIVELES_MUESTRA` en profesor.html. Desde M4 (Sesion 75) esa tabla
vive en assets/js/niveles.js y en el panel solo queda `const NIVELES_MUESTRA = NIV.NIVELES`,
asi que el parseo devolvia [] y `fork_de` devolvia None para los tres niveles.

No degradaba nada, y por eso llevaba una semana asi sin que nadie lo notara: sus dos
consumidores ya no lo usaban -`contrastar_tipos` lee visuales.js directo desde M1, y
generar-revision-preguntas.py solo lo IMPORTABA-. Pero una funcion que responde None a
todo es una mina para el proximo que la use, asi que se borra en vez de repararse.

Ahi vivia tambien el unico caso especial de que 8 basico se sirviera en /juego/. Con la
mudanza a /8vo/ los seis cursos siguen la misma convencion y el caso especial sobra.
"""
import io
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent


def nivel_de(carpeta):
    """'matematicas-3basico' -> '03'. None si es un transversal sin nivel (un libro)."""
    m = re.search(r"-(\d)basico$", carpeta)
    return "0" + m.group(1) if m else None


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
    print("tipos que dibuja visuales.js:", sorted(tipos_de_dibujo() or []))
    for c in ["matematicas-3basico", "historia-7basico", "lenguaje-8basico",
              "lectura-cuentos-de-ada"]:
        print("  %-24s nivel=%s" % (c, nivel_de(c)))
    print("  tipos de dibujo (assets/js/visuales.js):",
          sorted(tipos_de_dibujo() or []))
