# -*- coding: utf-8 -*-
"""Revisa una tanda de preguntas recién escrita, antes de consolidarla.

Por qué existe: el banco de Historia se escribe de a un OA por vez, y los defectos que
importan no se ven leyendo (se ven contando). Cada comprobación de aquí nació de un
defecto real encontrado en Matemática 3°.

    python scripts/revisar-tanda.py contenido/historia-3basico/_pool/oa07.json
    python scripts/revisar-tanda.py contenido/historia-3basico/_pool/*.json

Qué mira:
- Estructura: 4 opciones distintas, `correcta` en rango, `tip` presente y que no sea la
  respuesta copiada.
- **Sesgo de largo**: que la correcta no sea la ÚNICA notoriamente más larga. Ojo: contar
  los empates (`(B, 2)` vs `(A, 2)`) infla el número sin que haya ninguna pista; la medida
  buena exige que supere a TODAS las demás por un margen.
- Enunciados largos: son niños de 8 años que recién leen de corrido.
- Duplicados de enunciado dentro de la tanda y entre tandas.
- OA declarado igual en todas, e ids únicos y correlativos.
"""
import io, json, re, sys, glob, unicodedata
from difflib import SequenceMatcher
from collections import Counter

MARGEN = 3        # caracteres que la correcta puede sacarle a la segunda sin ser sospechosa
PARECIDO = 0.82   # dos enunciados por encima de esto son casi la misma pregunta
LARGO_MAX = 110   # enunciado; sobre esto, para 8 años, ya cansa


def pelado(t):
    t = unicodedata.normalize("NFD", (t or "").lower())
    return "".join(c for c in t if unicodedata.category(c) != "Mn" and (c.isalnum() or c == " ")).strip()


def revisar(ruta, vistos):
    d = json.load(io.open(ruta, encoding="utf-8"))["preguntas"]
    fallas, avisos = [], []
    oas = Counter(p.get("oa") for p in d)
    if len(oas) != 1:
        fallas.append("la tanda mezcla OA: %s" % dict(oas))
    ids = [p.get("id") for p in d]
    if len(set(ids)) != len(ids):
        fallas.append("ids repetidos")

    sesgo, largos, pos = [], [], Counter()
    for p in d:
        ops = [str(o) for o in p.get("opciones", [])]
        ok = p.get("correcta")
        pid = p.get("id")
        if len(ops) != 4:
            fallas.append("%s: no tiene 4 opciones" % pid); continue
        if len(set(ops)) != 4:
            fallas.append("%s: opciones repetidas" % pid)
        if not isinstance(ok, int) or not 0 <= ok < 4:
            fallas.append("%s: 'correcta' fuera de rango" % pid); continue
        pos[ok] += 1
        # El tip NO puede referirse a la POSICION de una opcion: las tandas se escriben
        # con la correcta primera y el consolidador las baraja, asi que "solo la primera
        # lleva signos de interrogacion" queda contradiciendo la pantalla. Paso de verdad
        # (len3-oa01-14) y no se ve leyendo la tanda, porque ahi todavia es cierto.
        # Lo que delata el defecto es que la posicion vaya seguida de un VERBO ("la
        # primera LLEVA signos"): ahi el sujeto es la opcion. Si va seguida de un
        # sustantivo ("la primera oracion", "la ultima letra") esta anclada al texto y
        # es legitima. Excluir por lista de sustantivos daba 35 falsos positivos de 36,
        # y una comprobacion que acusa lo correcto entrena a ignorar el informe.
        if re.search(r"(la|el)\s+(primera?|segunda?|tercera?|cuarta?|[uú]ltima?)\s+"
                     r"(es|son|est[aá]|est[aá]n|lleva|llevan|dice|dicen|tiene|tienen|"
                     r"va|van|muestra|muestran|corresponde|corresponden|indica|se[nñ]ala|"
                     r"sirve|queda|quedan|responde|contiene)",
                     (p.get("tip") or ""), re.IGNORECASE):
            # AVISO y no error: un chequeo lexico no puede distinguir "la primera
            # LLEVA signos" (la opcion) de "si la primera ES igual" (la letra). Marca
            # 3 en los cuatro bancos y solo 1 es real; es un puntero, no un veredicto.
            avisos.append("%s: el tip dice 'la primera/última…' — revisa que NO se "
                          "refiera a una opción, porque el barajado la mueve" % pid)
        if not (p.get("tip") or "").strip():
            fallas.append("%s: sin tip" % pid)
        elif pelado(p["tip"]) == pelado(ops[ok]):
            avisos.append("%s: el tip solo repite la respuesta" % pid)
        # sesgo de largo: unica y por un margen sobre TODAS las demas
        otras = max(len(o) for i, o in enumerate(ops) if i != ok)
        if len(ops[ok]) > otras + MARGEN:
            sesgo.append((pid, ops[ok]))
        q = p.get("pregunta", "")
        largos.append(len(q))
        if len(q) > LARGO_MAX:
            avisos.append("%s: enunciado de %d caracteres" % (pid, len(q)))
        k = pelado(q)
        if k in vistos:
            fallas.append("%s: enunciado repetido de %s" % (pid, vistos[k]))
        else:
            # CASI-duplicados, no solo identicos. hist3-oa06-27 quedo roto porque al acortar
            # su enunciado le pegue encima el de la pregunta siguiente y deje sus opciones y
            # su tip viejos: la clave decia "al sur" en una pregunta cuya respuesta era "al
            # este". Los textos no eran identicos, asi que el chequeo exacto no lo veia, y un
            # nino que razonaba bien quedaba marcado como error.
            for otro, opid in vistos.items():
                if abs(len(otro) - len(k)) < 30 and SequenceMatcher(None, otro, k).ratio() > PARECIDO:
                    # AVISO y no error: las parejas de contraste ("opuesto al norte" /
                    # "opuesto al este") son deliberadas y correctas. Revisadas las 19 del
                    # banco de Historia 3°, ninguna estaba rota. Marcarlas como error
                    # entrenaria a ignorar el informe.
                    avisos.append("%s: casi igual a %s — revisa que su clave y su tip le correspondan" % (pid, opid))
                    break
            vistos[k] = pid

    n = len(d)
    print("\n%s — %d preguntas, OA %s" % (ruta.replace("\\", "/"), n, list(oas)[0]))
    print("  enunciado: medio %d, máximo %d caracteres" % (sum(largos) // max(1, len(largos)), max(largos or [0])))
    print("  con dibujo: %d" % sum(1 for p in d if p.get("visual")))
    print("  sesgo de largo: %d de %d (%.0f%%)" % (len(sesgo), n, 100.0 * len(sesgo) / max(1, n)))
    for pid, txt in sesgo:
        print("      %s -> %s" % (pid, txt))
    if fallas:
        print("  ERRORES (%d):" % len(fallas))
        for f in fallas:
            print("      " + f)
    if avisos:
        print("  avisos (%d):" % len(avisos))
        for a in avisos:
            print("      " + a)
    if not fallas and not sesgo:
        print("  sin errores.")
    return len(fallas), len(sesgo)


def main():
    rutas = []
    for a in sys.argv[1:]:
        rutas += sorted(glob.glob(a))
    if not rutas:
        sys.exit("uso: python scripts/revisar-tanda.py <archivo.json> [...]")
    vistos, tf, ts = {}, 0, 0
    for r in rutas:
        f, s = revisar(r, vistos)
        tf += f; ts += s
    print("\n=== %d archivos · %d errores · %d con sesgo de largo ===" % (len(rutas), tf, ts))


if __name__ == "__main__":
    main()
