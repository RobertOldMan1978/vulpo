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

Y tampoco evalua EXPRESIONES ("700 + 20 + 6"), aunque se reporto como hueco. Medido
sobre las 95 preguntas del proyecto que las usan: aparecerian 2 pares y los DOS son
falsos positivos, porque ahi la pregunta pide que expresion REPRESENTA algo, no
cuanto vale. "Como se descompone 726?" ofrece "700 + 20 + 6" (la clave) y "700 + 26":
los dos valen 726 y solo uno es la descomposicion. Cerrar ese hueco acusaria
preguntas correctas de 3 basico, asi que se deja abierto a proposito.

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
# Numero MIXTO ("3 1/2"). Sin esta rama, valor() devolvia None y los mixtos se
# trataban como prosa: una pregunta con clave 7/2 y distractor 3 1/2 —el MISMO
# numero escrito de dos formas— pasaba el auditor con codigo de salida 0. Lo
# encontro la tanda de validacion de 6 basico, cuyo OA 05 trabaja justamente la
# equivalencia entre impropias y mixtos (tambien sus OA 06 y 08).
# Medido antes de aplicarlo sobre los 18 bancos: no cambia NINGUN veredicto
# —cero pares antes, cero despues— asi que cierra la puerta sin mover nada.
_RX_MIXTO = re.compile(r"^\s*(-?\d+)\s+(\d+)\s*/\s*(\d+)\s*$")
# Razon ("2:3"). Sin esto, «2:3» y «4:6» —la MISMA razon— pasaban como prosa.
# ⚠️ Pero «3:00» es una HORA y «24 : 6» una division, y las dos formas son
# identicas: el contexto decide, no el texto. Por eso la razon se lee salvo que
# el ENUNCIADO hable de horas o relojes, que es informacion que el script ya
# tiene. Medido antes de aplicarlo sobre los 10.595 items del proyecto (34 de
# ellos preguntas de hora): cero pares nuevos, o sea cierra el hueco sin mover
# ningun veredicto.
_RX_RAZON = re.compile(r"^\s*(\d+)\s*:\s*(\d+)\s*$")
_RX_HORA = re.compile(r"hora|reloj|minutos|a\.?m\.?|p\.?m\.?", re.IGNORECASE)
_RX_NUM = re.compile(r"^\s*(-?\d[\d.]*(?:,\d+)?|-?\d+(?:\.\d+)?)\s*(%)?\s*$")


_RX_UNIDAD = re.compile(r"^(.*?)\s*([A-Za-zÁÉÍÓÚÑáéíóúñ][\wÁÉÍÓÚÑáéíóúñ ]{0,24})?\s*$")


def valor(op, razon=False):
    """Devuelve (Fraction, unidad) si la opcion es un numero con o sin unidad.
    None si es prosa.

    La UNIDAD se devuelve y se compara: sin eso, «6 kg» y «6 g» parecerian el
    mismo valor, y «3 rectangulos» y «3 circulos» tambien. Acusar eso como error
    es peor que no revisar: un informe que marca lo correcto se deja de leer
    (leccion de la Sesion 56). La unidad se normaliza solo en minusculas y sin
    plural, para que «15 centimetro» y «15 centimetros» no se escapen."""
    t = str(op).strip()
    if razon:
        m = _RX_RAZON.match(t)
        if m:
            den = int(m.group(2))
            return (Fraction(int(m.group(1)), den), "") if den else None

    m = _RX_MIXTO.match(t)
    if m:
        den = int(m.group(3))
        if not den:
            return None
        ent, num = int(m.group(1)), int(m.group(2))
        signo = -1 if ent < 0 else 1
        return (signo * (Fraction(abs(ent)) + Fraction(num, den)), "")

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
    # Formato chileno: el punto separa miles y la coma es decimal.
    # ATENCION: antes el punto solo se quitaba SI ADEMAS habia coma, asi que
    # "2.500" se leia como 2,5. Eso daba las dos fallas a la vez: acusaba como
    # iguales a "5.000 m" y "5 m" (falso positivo, y en un OA de conversiones
    # los distractores son justo potencias de diez), y NO cazaba "2.500" contra
    # "2500", que si valen lo mismo (falso negativo, que es el peor). Lo
    # encontro el agente del MA05 OA 20 escribiendo el banco de 5, midiendo.
    # Se quita el punto solo cuando TODOS los puntos separan grupos de 3
    # digitos, para no romper un decimal escrito con punto ("2.5").
    if re.match(r"^\d{1,3}(?:\.\d{3})+(?:,\d+)?$", crudo):
        crudo = crudo.replace(".", "")
    elif "," in crudo:
        crudo = crudo.replace(".", "")
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
        # «3:00» es hora y «2:3» es razon: los distingue el enunciado, no la forma.
        es_hora = bool(_RX_HORA.search(q.get("pregunta") or ""))
        vals = [(i, valor(o, razon=not es_hora)) for i, o in enumerate(ops)]
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
    # Dos opciones que valen lo mismo convierten una pregunta de 4 en una de 3 y
    # castigan justo al que razona bien: es un ERROR, no un aviso. Salia con 0.
    sys.exit(1 if total else 0)


if __name__ == "__main__":
    main()
