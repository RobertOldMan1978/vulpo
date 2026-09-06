# -*- coding: utf-8 -*-
"""
Convierte el texto que se VE en el texto que se DICE.

Un lector de voz no sabe matematica: lee "18 : 6" como "dieciocho dos puntos seis",
"3/4" como "tres barra cuatro" y "90" como "noventa grados ordinal". Este modulo
traduce la notacion a palabras antes de mandarla al sintetizador.

El texto mostrado en pantalla NO cambia: solo cambia lo que se pronuncia.

Ojo con los dos puntos: significan division ("18 : 6"), hora ("7:45") y enumeracion
("de 10 en 10: 10, 20"). Se distinguen por los ESPACIOS, no por el objetivo: antes
habia una lista de codigos MA03 y eso dejaba a 4 basico sin traducir en silencio.

Sirve para CUALQUIER nivel, y por eso su nombre lleva "nivel" y no "3ro".

Uso:
    python scripts/normalizar-voz-nivel.py                             # ejemplos
    python scripts/normalizar-voz-nivel.py --banco                     # revisa un banco
    python scripts/normalizar-voz-nivel.py --banco historia-3basico    # otro banco
"""
import re

# Fracciones de uso comun en 3 basico. El denominador manda el nombre.
_DENOM = {1: ("entero", "enteros"), 2: ("medio", "medios"), 3: ("tercio", "tercios"),
          4: ("cuarto", "cuartos"), 5: ("quinto", "quintos"), 6: ("sexto", "sextos"),
          7: ("septimo", "septimos"), 8: ("octavo", "octavos"), 9: ("noveno", "novenos"),
          10: ("decimo", "decimos"), 12: ("doceavo", "doceavos")}
_NUM = {1: "un", 2: "dos", 3: "tres", 4: "cuatro", 5: "cinco", 6: "seis",
        7: "siete", 8: "ocho", 9: "nueve", 10: "diez", 11: "once", 12: "doce"}

# Numeros en palabras. Se usa para desarmar "de 10 en 10", que el sintetizador lee como
# fecha (ver mas abajo). Llega hasta 999.999 y NO hasta 1.000, que era "todo lo que
# necesita 3 basico": 4 basico trabaja con numeros hasta 10.000, asi que "cuenta de
# 1.000 en 1.000" habria caido al `str(n)` y devuelto justo el defecto que esta regla
# existe para evitar.
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
    if n < 1000000:
        m, r = divmod(n, 1000)
        miles = "mil" if m == 1 else _en_palabras(m) + " mil"
        return miles + ("" if r == 0 else " " + _en_palabras(r))
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

# NO hay lista de OA que decida si ":" es hora: la FORMA ya alcanza, y una lista de
# codigos de 3 basico dejaba a 4 sin traducir EN SILENCIO (el clip se paga igual).
# Medido sobre los 16 bancos: la forma de hora pegada (una o dos cifras, dos puntos,
# dos cifras) aparece en cuatro OA -MA03 OA 18 y 20, LE07 OA 21 y LE08 OA 11- y en
# LOS CUATRO es una hora de verdad. Ninguna division ni enumeracion la empareja,
# porque esas llevan espacio a algun lado.

# Palabras que la voz NO sabe pronunciar, con su escritura fonetica.
#
# Por que un diccionario y NO una regla general "hue -> güe": el banco tiene quince
# palabras con hu mas vocal y casi todas son comunes (huevo, hueso, hueco, huerto,
# huella, huele, huir), que la voz dice bien. Aplicarles la regla las romperia todas, y
# en Chile "güevo" no es una pronunciacion alternativa sino una groseria.
#
# OJO: **pehuén y pehuenche NO van aca**. Roberto los escucho y la voz ya los dice
# bien; meterlos los habria roto el dia que alguno apareciera en un enunciado. Se
# verifica escuchando antes de agregar, no por parecido con otra palabra.
#
# Se aplica sobre el texto que se PRONUNCIA. En pantalla el nino sigue leyendo la
# palabra bien escrita, que es lo que tiene que aprender.
_LEXICO = {}
_RX_LEXICO = re.compile(r"(?!x)x") if not _LEXICO else re.compile(
    r"(%s)" % "|".join(_LEXICO), re.IGNORECASE)

# Nombre hablado de cada letra, para las listas de letras sueltas (ver `normalizar`).
_LETRA = {"A": "a", "B": "be", "C": "ce", "D": "de", "E": "e", "F": "efe", "G": "ge",
          "H": "hache", "I": "i", "J": "jota", "K": "ka", "L": "ele", "M": "eme",
          "N": "ene", "O": "o", "P": "pe", "Q": "cu", "R": "erre", "S": "ese",
          "T": "te", "U": "u", "V": "ve", "W": "doble ve", "X": "equis", "Y": "ye",
          "Z": "zeta"}


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
    """Texto listo para el sintetizador.

    `oa` se sigue recibiendo porque los cuatro llamadores lo pasan, pero YA NO decide
    nada: los dos puntos se desambiguan por la forma del texto. Se conserva el
    parametro para no tocar los llamadores, y porque el dia que haga falta una
    excepcion por objetivo este es su lugar.
    """
    t = " " + (texto or "").strip() + " "

    # Va primero: son palabras enteras y no deben verse afectadas por las reglas de
    # simbolos ni por las de letras sueltas.
    t = _RX_LEXICO.sub(lambda m: _LEXICO[m.group(0).lower()], t)

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
    t = re.sub(r"\b(\d{1,2}):(\d{2})\b", _hora, t)
    t = re.sub(r"(\d)\s+:\s+(\d)", r"\1 dividido en \2", t)

    # "de 10 en 10" el sintetizador lo lee como FECHA: "10 de ENERO de 10", porque "en"
    # es la abreviatura de enero. Verificado sintetizando y transcribiendo de vuelta:
    # con 10 falla, con 3/4/5/100 no, pero se desarma la construccion entera —escribir
    # el numero con palabras la arregla— para no depender de que numero toque.
    # ⚠️ El numero puede llevar el punto de los miles ("de 1.000 en 1.000", propio de
    # 4 basico): sin el "(?:\.\d{3})*" el regex cortaba en el punto y el resultado
    # sintetizado era "1.cero en uno.000" — la mitad del numero se perdia en silencio.
    # Encontrado por un agente redactor de MA04 OA 01, verificado antes de aplicarlo.
    t = re.sub(r"\b(\d+(?:\.\d{3})*)\s+en\s+(\d+(?:\.\d{3})*)\b",
               lambda m: "%s en %s" % (_en_palabras(int(m.group(1).replace(".", ""))),
                                       _en_palabras(int(m.group(2).replace(".", "")))), t)

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
    # ⚠️ Un numero NEGATIVO como opcion suelta ("-32") no queda cubierto por ninguna
    # regla de arriba: las dos exigen un digito ANTES del guion. Sin esto el guion se
    # sintetiza mudo o ambiguo y "32" / "-32" suenan IGUAL — dos opciones que se
    # confunden al oido. Encontrado por auditar-audible-nivel.py en MA04 OA 14
    # ("50 − ▢ = 18", opciones 32 y -32), verificado antes de aplicarlo.
    t = re.sub(r"(?<!\d)[-−](?=\d)", " menos ", t)
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

    # Una LISTA de letras sueltas ("los numeros I, V y X", "las letras A, B, C") se
    # sintetiza corrida y sale ininteligible: verificado transcribiendo el audio, "I, V
    # y X" volvio como "YVYX". Y es justo la pregunta cuya respuesta es "romanos", o sea
    # que el nino que escucha se queda sin nada. Nombrar cada letra lo resuelve y es como
    # las lee un profesor. Solo listas: una letra sola casi siempre es una coordenada
    # ("columna A"), que se pronuncia bien tal cual.
    t = re.sub(r"(?<![\(\w])([A-Z])((?:\s*,\s*[A-Z])+(?:\s+y\s+[A-Z])?|(?:\s+y\s+[A-Z]))(?![\w\)])",
               lambda m: re.sub(r"[A-Z]", lambda l: _LETRA.get(l.group(0), l.group(0)),
                                m.group(0)), t)

    # Coordenadas de cuadricula: (C, 6) -> "columna C, fila 6".
    # Decir solo la letra no sirve: "(D, 3)" suena "DE, tres" y "(A, 2)" suena "A dos",
    # o sea igual que una preposicion, y en Historia hay opciones que son SOLO la
    # coordenada — el nino que escucha no tendria como distinguirlas. Nombrar columna y
    # fila es ademas como lo dice el enunciado del banco y como lo diria un profesor.
    t = re.sub(r"\(\s*([A-Z])\s*,\s*(\d+)\s*\)",
               lambda m: "columna %s, fila %s" % (m.group(1), m.group(2)), t)

    for rx, palabra in _UNIDADES:
        t = re.sub(rx, lambda m, w=palabra: _unidad(m, w), t)

    return re.sub(r"\s+", " ", t).strip()


def _revisar_banco():
    """Busca en TODO el banco textos que sigan trayendo notacion sin traducir."""
    import json, io
    from pathlib import Path
    import sys as _s
    carpeta = ([a for a in _s.argv[1:] if not a.startswith("-")] or ["matematicas-3basico"])[0]
    banco = Path(__file__).resolve().parent.parent / "contenido" / carpeta / "preguntas.json"
    if not banco.exists():
        _s.exit("No existe %s" % banco)
    print("banco: %s" % carpeta)
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
    # La consola de Windows va en cp1252 y aca se imprimen tildes, emoji y simbolos
    # del banco. Sin esto el modo de ejemplos muere con UnicodeEncodeError a la
    # tercera linea, y parece que el script estuviera roto cuando el texto esta bien.
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
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
