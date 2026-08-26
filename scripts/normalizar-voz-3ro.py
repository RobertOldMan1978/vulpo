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

# Numeros en palabras hasta 1000, que es todo lo que necesita 3 basico. Se usa para
# desarmar "de 10 en 10", que el sintetizador lee como fecha (ver _en_en mas abajo).
_U = ["cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve",
      "diez", "once", "doce", "trece", "catorce", "quince", "dieciseis", "diecisiete",
      "dieciocho", "diecinueve", "veinte", "veintiuno", "veintidos", "veintitres",
      "veinticuatro", "veinticinco", "veintiseis", "veintisiete", "veintiocho", "veintinueve"]
_D = {3: "treinta", 4: "cuarenta", 5: "cincuenta", 6: "sesenta", 7: "setenta",
      8: "ochenta", 9: "noventa"}
_C = {1: "ciento", 2: "doscientos", 3: "trescientos", 4: "cuatrocientos", 5: "quinientos",
      6: "seiscientos", 7: "setecientos", 8: "ochocientos", 9: "novecientos"}


def _en_palabras(n):
    if n < 30:
        return _U[n]
    if n < 100:
        d, u = divmod(n, 10)
        return _D[d] + ("" if u == 0 else " y " + _U[u])
    if n == 100:
        return "cien"
    if n < 1000:
        c, r = divmod(n, 100)
        return _C[c] + ("" if r == 0 else " " + _en_palabras(r))
    if n == 1000:
        return "mil"
    return str(n)

# Simbolos que el banco usa como incognita o como ficha.
_SIMBOLOS = {"▢": "el cuadrito", "\U0001f53a": "el triangulo",
             "\U0001f537": "el rombo", "\U0001f7e1": "el circulo amarillo",
             "⬛": "el cuadrado negro"}

# Emoji que el banco usa como OBJETO contable ("Cada 🍎 vale 2 frutas").
# Sin esto el sintetizador los lee por su nombre Unicode y salen frases torpes:
# "Cada LIBRO CERRADO vale dos libros", "cuatro MANZANA ROJA". Se guarda singular y
# plural porque casi siempre vienen precedidos de una cantidad ("Ana dibujo 4 🍎").
_EMOJI = {"\U0001f34e": ("manzana", "manzanas"),
          "⭐":     ("estrella", "estrellas"),
          "\U0001f68c": ("bus", "buses"),
          "\U0001f4d5": ("libro", "libros"),
          "\U0001f36c": ("dulce", "dulces"),
          "⚽":     ("pelota", "pelotas"),
          "\U0001f41f": ("pez", "peces"),
          "\U0001f33b": ("girasol", "girasoles"),
          "\U0001f36a": ("galleta", "galletas"),
          "\U0001f697": ("auto", "autos")}

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
    # El articulo solo se agrega si el texto no lo trae ya: muchos enunciados dicen
    # "a las 3:00", y anteponerlo a ciegas daba "a las LAS 3 en punto".
    antes = m.string[:m.start()].rstrip().lower()
    art = "" if antes.endswith((" las", " la")) or antes in ("las", "la") else \
          ("la " if h == 1 else "las ")
    if mm == 0:
        return "%s%d en punto" % (art, h)
    if mm == 15:
        return "%s%d y cuarto" % (art, h)
    if mm == 30:
        return "%s%d y media" % (art, h)
    return "%s%d %d" % (art, h, mm)


def _unidad(m, palabra):
    n = m.group(1)
    return "%s %s%s" % (n, palabra, "" if n == "1" else "s")


def _emoji_objeto(t):
    """Reemplaza los emoji contables por su palabra, concordando en numero."""
    for e, (sing, plur) in _EMOJI.items():
        if e not in t:
            continue
        # "4 🍎" -> "4 manzanas";  "1 🍎" -> "1 manzana";  "Cada 🍎" -> "cada manzana"
        t = re.sub(r"(\d+)\s*" + re.escape(e),
                   lambda m, s=sing, p=plur: "%s %s" % (m.group(1), s if m.group(1) == "1" else p), t)
        # "¿Cuantos 📕 dibuja?" pide plural aunque no venga un numero delante.
        t = re.sub(r"(?i)\b(cu[aá]nt[oa]s)\s*" + re.escape(e),
                   lambda m, p=plur: "%s %s" % (m.group(1), p), t)
        t = t.replace(e, " " + sing + " ")
    return t


def normalizar(texto, oa=""):
    """Texto listo para el sintetizador. `oa` desambigua los dos puntos."""
    t = " " + (texto or "").strip() + " "

    for simbolo, palabra in _SIMBOLOS.items():
        t = t.replace(simbolo, " %s " % palabra)
    t = _emoji_objeto(t)

    # Los dos puntos tienen TRES usos en este banco, y se distinguen por los espacios:
    #   division  -> "18 : 6"                 (espacio a los dos lados, siempre OA09)
    #   hora      -> "7:45"                   (pegado a los dos lados)
    #   listado   -> "de 10 en 10: 10, 20"    (pegado a la izquierda, espacio a la derecha)
    # Exigir espacios a ambos lados para la division es lo que impide que un listado
    # se lea "cuenta de diez en diez DIVIDIDO EN diez, veinte" — verificado sobre los
    # 124 textos del banco que llevan dos puntos.
    if oa in _OA_HORA:
        t = re.sub(r"\b(\d{1,2}):(\d{2})\b", _hora, t)
    t = re.sub(r"(\d)\s+:\s+(\d)", r"\1 dividido en \2", t)

    # "de 10 en 10" el sintetizador lo lee como FECHA: "10 de ENERO de 10", porque "en"
    # es la abreviatura de enero. Verificado sintetizando y transcribiendo de vuelta:
    # con 10 falla, con 3/4/5/100 no, pero se desarma la construccion entera —escribir
    # el numero con palabras la arregla— para no depender de que numero toque.
    t = re.sub(r"\b(\d+)\s+en\s+(\d+)\b",
               lambda m: "%s en %s" % (_en_palabras(int(m.group(1))),
                                       _en_palabras(int(m.group(2)))), t)

    t = re.sub(r"\b(\d+)/(\d+)\b", _fraccion, t)          # antes que la barra suelta

    # El "+" y el "=" se convierten siempre: pueden venir despues de una palabra
    # ("el cuadrito + 7 = 15"). El "-" solo entre digitos, para no partir palabras
    # con guion.
    t = re.sub(r"(\d)\s*[x×]\s*(\d)", r"\1 por \2", t)
    t = t.replace("+", " mas ").replace("=", " es igual a ")
    t = re.sub(r"(\d)\s*[-−]\s*(\d)", r"\1 menos \2", t)
    # Un guion CON ESPACIOS a los dos lados siempre es una resta, aunque a un lado
    # haya un simbolo y no un digito ("🔷 - 9 = 11", "20 - ___ = 12"). Sin esta regla
    # el sintetizador se lo salta y el nino oye "el rombo nueve es igual a once": la
    # operacion desaparece. Verificado transcribiendo el audio. Se comprobo que en las
    # 792 preguntas NO hay ningun guion usado como puntuacion, asi que es seguro.
    t = re.sub(r"(?<=\S)\s+[-−]\s+(?=\S)", " menos ", t)
    # El blanco a completar ("506 __ 560", "35, 40, ___, 50") hay que NOMBRARLO. Una
    # simple pausa no sirve: "35, 40, 50" suena a que esa es la secuencia, y el nino
    # que escucha en vez de leer se pierde justo el hueco que tiene que llenar.
    t = re.sub(r"_{2,}", " el espacio en blanco ", t)
    t = re.sub(r",(\s*,)+", ",", t)
    t = t.replace(" > ", " es mayor que ").replace(" < ", " es menor que ")
    t = re.sub(r"^\s*>\s*$", " mayor que ", t)
    t = re.sub(r"^\s*<\s*$", " menor que ", t)
    # Una opcion que es UN solo signo hay que nombrarla, o el sintetizador devuelve
    # silencio y el nino cree que el boton 🔊 esta roto. Paso al final, cuando las
    # reglas de arriba ya convirtieron los signos que aparecen dentro de una frase.
    t = re.sub(r"^\s*[-−]\s*$", " el signo menos ", t)
    t = re.sub(r"^\s*mas\s*$", " el signo mas ", t)
    t = re.sub(r"^\s*es igual a\s*$", " el signo igual ", t)

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
    # El ":" NO se marca: en 107 textos del banco es un dos puntos de enumeracion
    # ("cuenta de 10 en 10: 10, 20") que el sintetizador lee bien como pausa. Solo la
    # division ("18 : 6", con espacios) se traduce, y eso ya no deja ":" atras.
    sospechoso = re.compile(r"[/+=<>$°º▢\U0001f53a\U0001f537\U0001f7e1⬛]|_{2,}|\b\d+\s*(cm|kg|g|m)\b")
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
