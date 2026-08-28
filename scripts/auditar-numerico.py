# -*- coding: utf-8 -*-
"""Caza opciones que valen lo MISMO aunque esten escritas distinto.

Por que existe: `revisar-tanda.py` comprueba que las 4 opciones sean distintas,
pero compara TEXTO. Una pregunta cuya clave es 1/6 y que ofrece 2/12 entre los
distractores pasa ese chequeo y tiene **dos respuestas correctas**; peor todavia,
castiga justamente al estudiante que reconoce que son el mismo numero. Aparecio de
verdad en Matematica de 7 (dos casos: 1/6 contra 2/12, y "4,5 pizzas" contra
"18/4 de pizza").

Que hace: extrae de cada opcion su valor numerico cuando la opcion ES un numero
(entero, decimal con coma o con punto, fraccion a/b, o porcentaje), y avisa si dos
opciones de la misma pregunta valen igual. Deliberadamente NO intenta interpretar
opciones en prosa: preferimos no avisar a llenar el informe de falsos positivos,
que es como se entrena a ignorarlo (leccion de la Sesion 56).

Uso:
    python scripts/auditar-numerico.py contenido/matematicas-7basico/preguntas.json
    python scripts/auditar-numerico.py contenido/*/preguntas.json
    python scripts/auditar-numerico.py contenido/matematicas-7basico/_pool/*.json
"""
import glob
import io
import json
import re
import sys
from fractions import Fraction

# Un numero suelto, con o sin unidad pegada detras. Se exige que la opcion sea
# CASI solo el numero: si trae mas de dos palabras extra, es prosa y no se toca.
_RX_FRAC = re.compile(r"^\s*(-?\d+)\s*/\s*(\d+)\s*$")
_RX_NUM = re.compile(r"^\s*(-?\d[\d.]*(?:,\d+)?|-?\d+(?:\.\d+)?)\s*(%)?\s*$")


_RX_UNIDAD = re.compile(r"^(.*?)\s*([A-Za-zÁÉÍÓÚÑáéíóúñ][\wÁÉÍÓÚÑáéíóúñ ]{0,24})?\s*$")


def valor(op):
    """Devuelve (Fraction, unidad) si la opcion es un numero con o sin unidad.
    None si es prosa.

    La UNIDAD se devuelve y se compara: sin eso, «6 kg» y «6 g» parecerian el
    mismo valor, y «3 rectangulos» y «3 circulos» tambien. Acusar eso como error
    es peor que no revisar: un informe que marca lo correcto se deja de leer
    (leccion de la Sesion 56). La unidad se normaliza solo en minusculas y sin
    plural, para que «15 centimetro» y «15 centimetros» no se escapen."""
    t = str(op).strip()
    m = _RX_FRAC.match(t)
    if m:
        den = int(m.group(2))
        return (Fraction(int(m.group(1)), den), "") if den else None

    m = _RX_UNIDAD.match(t)
    if not m:
        return None
    cabeza, unidad = m.group(1), (m.group(2) or "")
    m2 = _RX_NUM.match(cabeza)
    if not m2:
        # sin unidad: la opcion entera puede ser el numero
        m2 = _RX_NUM.match(t)
        if not m2:
            return None
        unidad = ""
    crudo, pct = m2.group(1), m2.group(2)
    # formato chileno: el punto separa miles, la coma es decimal
    crudo = crudo.replace(".", "") if "," in crudo else crudo
    crudo = crudo.replace(",", ".")
    try:
        v = Fraction(crudo)
    except (ValueError, ZeroDivisionError):
        return None
    u = unidad.strip().lower().rstrip("s")
    return (v / 100 if pct else v), ("%" if pct else u)


def revisar(ruta):
    d = json.load(io.open(ruta, encoding="utf-8"))
    preguntas = d["preguntas"] if isinstance(d, dict) else d
    choques = []
    for q in preguntas:
        ops = q.get("opciones", [])
        vals = [(i, valor(o)) for i, o in enumerate(ops)]
        vals = [(i, v) for i, v in vals if v is not None]
        # Solo colisionan si ademas la UNIDAD coincide.
        for a in range(len(vals)):
            for b in range(a + 1, len(vals)):
                if vals[a][1] == vals[b][1]:   # (valor, unidad)
                    ia, ib = vals[a][0], vals[b][0]
                    choques.append((q.get("id", "?"), ops[ia], ops[ib],
                                    q["correcta"] in (ia, ib)))
    print("%s — %d preguntas" % (ruta, len(preguntas)))
    if not choques:
        print("  sin opciones equivalentes.")
        return 0
    for pid, a, b, toca_clave in choques:
        print("  %s %s: «%s» vale lo mismo que «%s»"
              % ("ERROR" if toca_clave else "aviso", pid, a, b))
        if toca_clave:
            print("        (una de las dos ES la clave: hay dos respuestas correctas)")
    return sum(1 for c in choques if c[3])


def main():
    rutas = []
    for a in sys.argv[1:]:
        rutas += sorted(glob.glob(a))
    if not rutas:
        sys.exit("uso: python scripts/auditar-numerico.py <archivo.json> [...]")
    total = 0
    for r in rutas:
        total += revisar(r)
    print("\n=== %d archivos · %d con dos respuestas correctas ===" % (len(rutas), total))


if __name__ == "__main__":
    main()
