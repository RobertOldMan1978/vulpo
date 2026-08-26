# -*- coding: utf-8 -*-
"""
Convierte el texto que se VE en el texto que se DICE.

Un lector de voz no sabe matematica: lee "18 : 6" como "dieciocho dos puntos seis",
"3/4" como "tres barra cuatro" y "90" como "noventa grados ordinal". Este modulo
traduce la notacion a palabras antes de mandarla al sintetizador.

El texto mostrado en pantalla NO cambia: solo cambia lo que se pronuncia.

Ojo con los dos puntos: en este banco significan division (OA 09: "18 : 6") y
tambien hora (OA 20: "7:45"). Por eso `normalizar` recibe el OA y decide. Se
verifico que ningun texto con ":" aparece en los dos contextos a la vez.

Uso:
    python scripts/normalizar-voz-3ro.py            # ejemplos de prueba
    python scripts/normalizar-voz-3ro.py --banco    # revisa TODO el banco
"""
import re

# Fracciones de uso comun en 3 basico. El denominador manda el nombre.
_DENOM = {1: ("entero", "enteros"), 2: ("medio", "medios"), 3: ("tercio", "tercios"),
          4: ("cuarto", "cuartos"), 5: ("quinto", "quintos"), 6: ("sexto", "sextos"),
          7: ("septimo", "septimos"), 8: ("octavo", "octavos"), 9: ("noveno", "novenos"),
          10: ("decimo", "decimos"), 12: ("doceavo", "doceavos")}
_NUM = {1: "un", 2: "dos", 3: "tres", 4: "cuatro", 5: "cinco", 6: "seis",
        7: "siete", 8: "ocho", 9: "nueve", 10: "diez", 11: "once", 12: "doce"}

# Simbolos que el banco usa como incognita o como ficha.
_SIMBOLOS = {"▢": "el cuadrito", "\U0001f53a": "el triangulo",
             "\U0001f537": "el rombo", "\U0001f7e1": "el circulo amarillo",
             "⬛": "el cuadrado negro"}

# Unidades: singular cuando la cantidad es 1 ("1 kilo", no "1 kilos").
_UNIDADES = [(r"(\d+)\s*cm\b", "centimetro"),
             (r"(\d+)\s*kg\b", "kilo"),
             (r"(\d+)\s*g\b", "gramo"),
             (r"(\d+)\s*m\b", "metro")]

_OA_HORA = {"MA03 OA 18", "MA03 OA 20"}     # ahi ":" es hora, no division


def _fraccion(m):
    a, b = int(m.group(1)), int(m.group(2))
    if b not in _DENOM or a not in _NUM:
        return "%d sobre %d" % (a, b)
    sing, plur = _DENOM[b]
    return "un %s" % sing if a == 1 else "%s %s" % (_NUM[a], plur)


def _hora(m):
    h, mm = int(m.group(1)), int(m.group(2))
    if mm == 0:
        return "las %d en punto" % h
    if mm == 15:
        return "las %d y cuarto" % h
    if mm == 30:
        return "las %d y media" % h
    return "las %d %d" % (h, mm)


def _unidad(m, palabra):
    n = m.group(1)
    return "%s %s%s" % (n, palabra, "" if n == "1" else "s")


def normalizar(texto, oa=""):
    """Texto listo para el sintetizador. `oa` desambigua los dos puntos."""
    t = " " + (texto or "").strip() + " "

    for simbolo, palabra in _SIMBOLOS.items():
        t = t.replace(simbolo, " %s " % palabra)

    if oa in _OA_HORA:
        t = re.sub(r"\b(\d{1,2}):(\d{2})\b", _hora, t)
    else:
        t = re.sub(r"(\d)\s*:\s*(\d)", r"\1 dividido en \2", t)

    t = re.sub(r"\b(\d+)/(\d+)\b", _fraccion, t)          # antes que la barra suelta

    # El "+" y el "=" se convierten siempre: pueden venir despues de una palabra
    # ("el cuadrito + 7 = 15"). El "-" solo entre digitos, para no partir palabras
    # con guion.
    t = re.sub(r"(\d)\s*[x×]\s*(\d)", r"\1 por \2", t)
    t = t.replace("+", " mas ").replace("=", " es igual a ")
    t = re.sub(r"(\d)\s*[-−]\s*(\d)", r"\1 menos \2", t)
    t = re.sub(r"_{2,}", " , ", t)                        # el blanco de "506 __ 560"
    t = t.replace(" > ", " es mayor que ").replace(" < ", " es menor que ")
    t = re.sub(r"^\s*>\s*$", " mayor que ", t)
    t = re.sub(r"^\s*<\s*$", " menor que ", t)

    # El punto final de la frase NO es parte del monto: "$90." es 90, no "90."
    t = re.sub(r"\$\s*(\d{1,3}(?:\.\d{3})*)", r"\1 pesos", t)
    t = re.sub(r"(\d)\s*[º°]", r"\1 grados", t)

    # Coordenadas de cuadricula: (C, 6) -> "C, 6"
    t = re.sub(r"\(\s*([A-Z])\s*,\s*(\d+)\s*\)", lambda m: "%s, %s" % (m.group(1), m.group(2)), t)

    for rx, palabra in _UNIDADES:
        t = re.sub(rx, lambda m, w=palabra: _unidad(m, w), t)

    return re.sub(r"\s+", " ", t).strip()


def _revisar_banco():
    """Busca en TODO el banco textos que sigan trayendo notacion sin traducir."""
    import json, io
    from pathlib import Path
    banco = Path(__file__).resolve().parent.parent / "contenido" / "matematicas-3basico" / "preguntas.json"
    ps = json.load(io.open(banco, encoding="utf-8"))["preguntas"]
    sospechoso = re.compile(r"[/:+=<>$°º▢\U0001f53a\U0001f537\U0001f7e1⬛]|_{2,}|\b\d+\s*(cm|kg|g|m)\b")
    quedan = []
    total = 0
    for p in ps:
        for t in [p["pregunta"]] + [str(o) for o in p["opciones"]]:
            total += 1
            n = normalizar(t, p["oa"])
            if sospechoso.search(n):
                quedan.append((p["id"], p["oa"], t, n))
    print("textos revisados: %d" % total)
    print("con notacion sin traducir despues de normalizar: %d" % len(quedan))
    for qid, oa, antes, despues in quedan[:25]:
        print("  %-16s [%s]" % (qid, oa))
        print("     ve:   %s" % antes)
        print("     dice: %s" % despues)


if __name__ == "__main__":
    import sys
    if "--banco" in sys.argv:
        _revisar_banco()
    else:
        pruebas = [("¿Cuánto es 18 : 6?", "MA03 OA 09"),
                   ("El reloj digital marca 7:45. ¿Cómo se lee esa hora?", "MA03 OA 20"),
                   ("¿Cuál fracción es mayor: 3/4 o 1/4?", "MA03 OA 11"),
                   ("▢ + 7 = 15. ¿Cuánto vale ▢?", "MA03 OA 13"),
                   ("\U0001f53a + 6 = 14. ¿Cuánto vale \U0001f53a?", "MA03 OA 13"),
                   ("Un cuadrado tiene lados de 5 cm. ¿Cuál es su perímetro?", "MA03 OA 21"),
                   ("Un paquete pesa 500 g. ¿Cuántos gramos faltan para 1 kg?", "MA03 OA 22"),
                   ("¿Cuánto es 7 x 8?", "MA03 OA 08"),
                   ("Un pan cuesta $90. ¿Cuánto valen 3?", "MA03 OA 10"),
                   ("La esquina de la hoja mide 90°. ¿Es agudo?", "MA03 OA 18"),
                   ("El árbol está en (C, 6). ¿Y la casa?", "MA03 OA 14"),
                   ("¿Qué signo va aquí: 506 __ 560?", "MA03 OA 03")]
        for t, oa in pruebas:
            print("VE:   %s" % t)
            print("DICE: %s" % normalizar(t, oa))
            print()
