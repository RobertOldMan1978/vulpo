# -*- coding: utf-8 -*-
"""Busca preguntas que NO se pueden responder escuchando.

Por que existe: 3 basico lee las preguntas en voz alta, y el nino que usa ese boton es
justamente el que peor lee. Una pregunta como

    ¿Cual esta bien escrita?   lapices / lápices / lapizes / lápizes

**suena idéntica en las cuatro opciones**: para quien escucha es irresoluble, y ningun
validador de estructura lo detecta, porque el JSON esta perfecto.

Aparecio al escribir el OA 22 de Lenguaje (ortografia), pero afecta a cualquier pregunta
cuya respuesta dependa de VER la grafia: tildes, mayusculas, comas, ge/je, y tambien
numeros escritos de dos formas.

Que hace: normaliza cada opcion como la oiria el nino (sin tildes, sin mayusculas, sin
puntuacion) y avisa cuando dos opciones de la misma pregunta colapsan en lo mismo.

    python scripts/auditar-audible-3ro.py contenido/lenguaje-3basico/preguntas.json
    python scripts/auditar-audible-3ro.py contenido/*-3basico/preguntas.json

No es un error automatico: a veces la pregunta ES sobre la escritura y hay que decidir
que hacer (reformularla por la regla, o marcarla para que no se lea en voz alta). Por eso
informa y no falla.
"""
import io, json, re, sys, glob, unicodedata, importlib.util
from collections import defaultdict
from pathlib import Path

# La comparacion tiene que hacerse sobre lo que el sintetizador PRONUNCIA, no sobre el
# texto crudo. Es la diferencia entre acusar y acertar: "15 + 9" y "15 - 9" se ven
# parecidos y suenan clarisimamente distinto ("mas" / "menos"), porque el normalizador
# los convierte en palabras antes de mandarlos a Azure. Comparar el texto crudo daba
# decenas de falsos positivos en el banco de Matematica.
_RAIZ = Path(__file__).resolve().parent.parent
_spec = importlib.util.spec_from_file_location("nv", str(_RAIZ / "scripts" / "normalizar-voz-3ro.py"))
_nv = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(_nv)


# Pares de letras que en el español de Chile suenan IGUAL. Sin esto, el chequeo pierde
# justo lo que la ortografia pone a prueba: "Habia / Havia / Abia" se escriben distinto
# y se pronuncian identico (hache muda, be y ve iguales, seseo, yeismo).
def _fonetica(t):
    t = t.replace("ch", "")          # la che si suena distinto: se protege
    t = t.replace("ll", "")          # yeismo: ll y y suenan igual, pero l+l no
    t = t.replace("rr", "")          # la erre doble si suena distinto
    t = t.replace("qu", "k").replace("h", "")
    t = t.replace("v", "b").replace("w", "b")
    t = t.replace("ce", "se").replace("ci", "si")
    t = t.replace("ge", "je").replace("gi", "ji")
    t = t.replace("z", "s").replace("c", "k").replace("x", "ks")
    t = t.replace("", "y")
    t = t.replace("", "ch").replace("", "rr")
    return t


def oido(t, oa=""):
    """Como suena de verdad: se normaliza como para la voz, se ignoran tilde y
    mayuscula —que el oido no distingue— y se aplican las igualdades foneticas."""
    t = _nv.normalizar(str(t), oa)
    t = unicodedata.normalize("NFD", t.lower())
    # La eñe SI se oye distinto de la n: se protege antes de quitar los diacriticos.
    t = t.replace("ñ", "ñ")
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    t = re.sub(r"[^\wñ ]+", " ", t, flags=re.UNICODE)
    # Una letra SOLA no se pronuncia por su sonido sino por su NOMBRE ("la letra ese",
    # "la letra zeta"), que si se distinguen. Aplicarle la fonetica acusaba como
    # homofona una pregunta de ortografia bien hecha.
    t = " ".join(w if len(w) == 1 else _fonetica(w) for w in t.split())
    return re.sub(r"\s+", " ", t).strip()


def revisar(ruta):
    d = json.load(io.open(ruta, encoding="utf-8"))["preguntas"]
    choques = []
    for p in d:
        grupos = defaultdict(list)
        for o in p.get("opciones", []):
            grupos[oido(o, p.get("oa", ""))].append(str(o))
        iguales = [v for v in grupos.values() if len(v) > 1]
        if iguales:
            # ¿La correcta esta entre las que se confunden? Ese es el caso grave: el nino
            # que escucha no tiene forma de elegir bien.
            correcta = str(p["opciones"][p["correcta"]])
            grave = any(correcta in g for g in iguales)
            choques.append((p.get("id"), p.get("pregunta", "")[:70], iguales, grave))
    return d, choques


def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
    rutas = []
    for a in sys.argv[1:]:
        rutas += sorted(glob.glob(a))
    if not rutas:
        sys.exit("uso: python scripts/auditar-audible-3ro.py <preguntas.json> [...]")

    total_p = total_c = total_g = 0
    for ruta in rutas:
        d, choques = revisar(ruta)
        total_p += len(d)
        total_c += len(choques)
        total_g += sum(1 for c in choques if c[3])
        print("\n%s — %d preguntas" % (ruta.replace("\\", "/"), len(d)))
        if not choques:
            print("  todas se pueden responder escuchando.")
            continue
        print("  %d preguntas con opciones que SUENAN IGUAL:" % len(choques))
        for pid, txt, iguales, grave in choques:
            print("   %s %s" % ("GRAVE" if grave else "     ", pid))
            print("      %s" % txt)
            for g in iguales:
                print("      suenan igual: %s" % " / ".join(g))

    print("\n=== %d preguntas revisadas · %d con opciones homofonas · %d de ellas GRAVES "
          "(la correcta se confunde) ===" % (total_p, total_c, total_g))


if __name__ == "__main__":
    main()
