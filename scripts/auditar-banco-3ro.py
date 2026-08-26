# -*- coding: utf-8 -*-
"""
Auditoria de CONTENIDO del banco de 3 basico. Complementa a validar-banco-3ro.py,
que solo revisa estructura (4 opciones, OA valido, largo del enunciado).

Cada comprobacion nace de un defecto que ya aparecio de verdad, encontrado a mano.
Automatizarlas es lo unico que impide que vuelvan en la proxima tanda de preguntas:

  1. CLAVE ARITMETICA    - una operacion del enunciado cuyo resultado no es la clave.
  2. EL DIBUJO REGALA    - la recta muestra el numero que hay que deducir (paso dos veces).
  3. FORMATO MEZCLADO    - una opcion con unidad entre opciones sin unidad, etc.
  4. SESGO DE LARGO      - si la correcta es casi siempre la mas larga, el nino aprende
                           a elegir la mas larga sin leer.
  5. (retirada)          - ver el comentario en main sobre la escala de distractores.
  6. REVISAR A MANO      - casos donde hace falta criterio; se listan, no se acusan.

Uso:
    python scripts/auditar-banco-3ro.py matematicas-3basico
"""
import io, json, re, sys, unicodedata
from pathlib import Path
from collections import Counter

RAIZ = Path(__file__).resolve().parent.parent


def sinac(t):
    t = unicodedata.normalize("NFD", (t or "").lower())
    return "".join(c for c in t if unicodedata.category(c) != "Mn")


def num(t):
    """Convierte '1.000' o '25' a entero; None si no es un numero limpio."""
    s = str(t).strip().replace(".", "").replace("$", "").strip()
    return int(s) if re.fullmatch(r"-?\d+", s) else None


# --- 1. clave aritmetica -----------------------------------------------------
# Se evalua SOLO lo que se puede parsear sin ambiguedad: una cadena de + y - o un
# producto/cociente unico. Todo lo demas se deja fuera a proposito: un verificador
# que adivina produce falsos positivos, y ya paso (un regex que leia dos de tres
# sumandos acuso 5 preguntas correctas).
def clave_aritmetica(p):
    """Resultado esperado, o None si no se puede afirmar SIN ADIVINAR.

    Cubre ~10% del banco (82 preguntas). El resto son problemas con enunciado, que
    ningun script puede verificar: eso es un limite real, no un defecto a tapar.

    Es deliberadamente cobarde, porque un verificador que adivina cuesta mas que los
    errores que encuentra. La primera version acuso 13 preguntas CORRECTAS por dos
    motivos que conviene no repetir:

      (a) El punto final. "Suma 120 + 230 + 150." termina en punto, que entraba en la
          clase [digito o punto] del lookahead, forzando un retroceso: la expresion
          quedaba cortada en "120 + 230" = 350 en vez de 500.
      (b) Dos operaciones en un enunciado. En "Si 7 + 5 = 12, cuanto es 12 - 5?" el
          parser tomaba la primera y la comparaba con la clave de la segunda.

    De ahi las tres reglas: fuera cualquier enunciado con "="; exactamente UNA
    expresion; y todos los numeros del enunciado deben pertenecer a esa expresion
    (si sobra un numero de contexto, mejor no opinar).
    """
    q = p["pregunta"]
    if re.search(r"[▢🔺🔷🟡⬛_=]|red |aproxim|redonde|cerca|entre", q):
        return None
    cuerpo = q.replace("¿", "").replace("?", "")
    sumas = re.findall(r"\d+(?:\s*[-−+]\s*\d+)+", cuerpo)
    prods = re.findall(r"\d+\s*[x×]\s*\d+", cuerpo)
    divs = re.findall(r"\d+\s+:\s+\d+", cuerpo)
    if len(sumas) + len(prods) + len(divs) != 1:
        return None
    expr = (sumas or prods or divs)[0]
    if len(re.findall(r"\d+", cuerpo)) != len(re.findall(r"\d+", expr)):
        return None
    n = [int(x) for x in re.findall(r"\d+", expr)]
    if sumas:
        try:
            return eval(expr.replace("−", "-").replace(" ", ""))
        except Exception:
            return None
    if prods:
        return n[0] * n[1]
    return n[0] // n[1] if n[1] and n[0] % n[1] == 0 else None


def main():
    carpeta = sys.argv[1] if len(sys.argv) > 1 else "matematicas-3basico"
    base = RAIZ / "contenido" / carpeta
    ps = json.load(io.open(base / "preguntas.json", encoding="utf-8"))["preguntas"]

    errores, revisar = [], []

    # 1. claves aritmeticas
    comprobadas = 0
    for p in ps:
        esperado = clave_aritmetica(p)
        if esperado is None:
            continue
        comprobadas += 1
        real = num(p["opciones"][p["correcta"]])
        if real is not None and real != esperado:
            errores.append(("CLAVE", p["id"], "%s -> la clave dice %s, la operacion da %s"
                            % (p["pregunta"][:60], real, esperado)))

    # 2. el dibujo regala la respuesta
    for p in ps:
        v = p.get("visual") or {}
        ok = str(p["opciones"][p["correcta"]])
        if v.get("tipo") == "recta" and v.get("marca") is not None and not v.get("oculta"):
            if num(ok) == v["marca"]:
                errores.append(("DIBUJO", p["id"],
                                "la recta muestra %s, que es justo la respuesta" % v["marca"]))
        if v.get("tipo") == "cuerpo" and sinac(v.get("nombre", "")) == sinac(ok):
            # puede ser legitimo si la pregunta es "¿como se llama ESTE cuerpo?"
            if not re.search(r"\beste\b|\besta\b|\bdibujo\b|\bimagen\b", sinac(p["pregunta"])):
                revisar.append(("DIBUJO?", p["id"],
                                "el dibujo es un %s y esa es la respuesta; la pregunta no dice "
                                "que se refiera al dibujo: %s" % (v.get("nombre"), p["pregunta"][:55])))

    # 3. formato mezclado entre opciones
    for p in ps:
        ops = [str(o).strip() for o in p["opciones"]]
        conu = [bool(re.search(r"\b(cm|kg|g|m|pesos)\b|\$", o)) for o in ops]
        if 0 < sum(conu) < 4:
            revisar.append(("FORMATO", p["id"],
                            "unas opciones traen unidad y otras no: %s" % ops))
        esnum = [num(o) is not None for o in ops]
        if 0 < sum(esnum) < 4 and sum(esnum) >= 2:
            revisar.append(("FORMATO", p["id"],
                            "mezcla numeros y texto: %s" % ops))

    # 4. sesgo de largo: si la correcta es casi siempre la mas larga, se adivina
    mas_larga = 0
    contadas = 0
    for p in ps:
        ops = [str(o) for o in p["opciones"]]
        largos = [len(o) for o in ops]
        if len(set(largos)) == 1:
            continue
        contadas += 1
        if largos[p["correcta"]] == max(largos):
            mas_larga += 1
    tasa = mas_larga / contadas * 100 if contadas else 0

    # 5. ESCALA: comprobacion RETIRADA a proposito.
    #    Marcaba como sospechoso todo distractor de otro orden de magnitud, que es
    #    exactamente el distractor BUENO en las preguntas de valor posicional: para
    #    "300 + 40 + 5", el 3405 es el error tipico de escribir el numeral literal.
    #    De 34 avisos, 31 eran distractores correctos. Una comprobacion que acusa lo
    #    bueno entrena a ignorar el informe.

    # ---- informe ----
    print("preguntas: %d" % len(ps))
    print("claves comprobadas aritmeticamente: %d de %d" % (comprobadas, len(ps)))
    print("la respuesta correcta es la opcion MAS LARGA en %.1f%% de %d preguntas "
          "(al azar seria ~25%%)" % (tasa, contadas))
    print()
    print("=== ERRORES (%d) ===" % len(errores))
    for t, qid, msg in errores:
        print("  [%s] %-15s %s" % (t, qid, msg))
    if not errores:
        print("  ninguno.")
    print()
    print("=== REVISAR A MANO (%d) ===" % len(revisar))
    for t, qid, msg in revisar[:40]:
        print("  [%s] %-15s %s" % (t, qid, msg))
    if len(revisar) > 40:
        print("  ... y %d mas" % (len(revisar) - 40))
    return 1 if errores else 0


if __name__ == "__main__":
    sys.exit(main())
