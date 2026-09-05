# -*- coding: utf-8 -*-
"""Busca preguntas casi iguales que pertenecen a OA DISTINTOS.

Por que existe: `revisar-tanda.py` caza casi-duplicados DENTRO de una tanda, que
es un archivo y por tanto un solo OA. Nadie miraba el cruce entre OA, y ese es el
defecto que quedo documentado como limite conocido en Lenguaje de 3 basico: dos
objetivos medidos con las mismas preguntas. Cuando eso pasa, el mapa de dominio le
muestra al profesor dos porcentajes que en realidad son el mismo dato.

Solo compara pares de OA distintos y solo dentro de la misma asignatura. Informa
el par, su parecido y el texto, para que un humano decida: dos preguntas parecidas
sobre el mismo hecho pueden ser legitimas si miden operaciones distintas.

Uso:
    python scripts/auditar-solape-oa.py contenido/lenguaje-7basico/preguntas.json
    python scripts/auditar-solape-oa.py contenido/*-7basico/preguntas.json --umbral=0.5
"""
import glob
import io
import json
import os
import re
import sys
import unicodedata
from collections import Counter, defaultdict

# Palabras que no distinguen nada: sin quitarlas, dos preguntas cualquiera comparten
# "de", "que", "cual" y el parecido se infla hasta volver inutil el informe.
VACIAS = set("""a al ante bajo con contra de del desde durante e en entre hacia hasta la las le les lo los
mas me mi ni no o para pero por porque que se segun sin sobre su sus tras un una unas uno unos y ya
el es son era eran ser fue como cual cuales cuando cuanto donde quien quienes cuyo cuya
si te tu tus esta este esto estas estos esa ese eso esas esos aquel
siguiente siguientes opcion opciones pregunta texto""".split())


MIN_PALABRAS = 5   # ver el comentario en revisar()


def norm(t):
    t = unicodedata.normalize("NFKD", str(t).lower())
    t = "".join(c for c in t if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9ñ ]+", " ", t)


def bolsa(t):
    return {w for w in norm(t).split() if len(w) > 2 and w not in VACIAS}


def jaccard(a, b):
    if not a or not b:
        return 0.0
    return len(a & b) / float(len(a | b))


def revisar(ruta, umbral):
    d = json.load(io.open(ruta, encoding="utf-8"))
    preguntas = d["preguntas"] if isinstance(d, dict) else d
    datos = [(q.get("id", "?"), q["oa"], q["pregunta"], bolsa(q["pregunta"])) for q in preguntas]
    pares, por_par = [], Counter()
    for i in range(len(datos)):
        for j in range(i + 1, len(datos)):
            if datos[i][1] == datos[j][1]:
                continue                      # mismo OA: eso ya lo mira revisar-tanda
            # Piso de palabras de contenido. Sin esto, dos enunciados cortos como
            # "¿Cuál es el resultado de -3 - 5?" y "¿Cuál es el resultado de 2/5 por
            # 5/8?" quedan con una sola palabra util cada uno y el parecido se dispara
            # a 0,50 siendo preguntas totalmente distintas. Medido: en Matematica de 7
            # producia 21 falsos positivos y ni un hallazgo real.
            if len(datos[i][3]) < MIN_PALABRAS or len(datos[j][3]) < MIN_PALABRAS:
                continue
            s = jaccard(datos[i][3], datos[j][3])
            if s >= umbral:
                pares.append((s, datos[i], datos[j]))
                por_par[tuple(sorted((datos[i][1], datos[j][1])))] += 1
    pares.sort(key=lambda p: -p[0])
    print("%s — %d preguntas" % (os.path.basename(os.path.dirname(ruta)), len(preguntas)))
    # ⚠️ Este script compara OA ENTRE SI, asi que un archivo con un solo OA no puede
    # encontrar nada y su "sin solape" es cero por vacuidad. Pasaba de verdad: correrlo
    # sobre `_pool/*.json` —donde cada tanda es un OA— devolvia un informe limpio por
    # cada archivo sin haber comparado una sola pareja, y se leia como si el nivel
    # estuviera verificado. Para revisar un nivel a medio escribir hay que UNIR las
    # tandas en un archivo y correrlo sobre ese.
    n_oa = len(set(x[1] for x in datos))
    if n_oa < 2:
        print("  AVISO: un solo OA en el archivo — no hay nada que comparar.")
        print("         Une las tandas del nivel en un archivo y corre el script sobre ese.")
        return 0
    if not pares:
        print("  sin solape entre OA sobre %.2f (%d OA comparados)." % (umbral, n_oa))
        return 0
    print("  %d pares por sobre %.2f, en %d combinaciones de OA:" % (len(pares), umbral, len(por_par)))
    for par, n in por_par.most_common():
        print("     %s  ~  %s   (%d pares)" % (par[0], par[1], n))
    print("  los 10 mas parecidos:")
    for s, a, b in pares[:10]:
        print("     %.2f  %s [%s]" % (s, a[0], a[1]))
        print("           %s" % a[2][:100])
        print("           %s [%s]" % (b[0], b[1]))
        print("           %s" % b[2][:100])
    return len(pares)


def main():
    umbral = 0.5
    rutas = []
    for a in sys.argv[1:]:
        if a.startswith("--umbral="):
            umbral = float(a.split("=", 1)[1]); continue
        rutas += sorted(glob.glob(a))
    if not rutas:
        sys.exit("uso: python scripts/auditar-solape-oa.py <preguntas.json> [--umbral=0.5]")
    tot = 0
    for r in rutas:
        tot += revisar(r, umbral)
    print("\n=== %d archivos · %d pares de OA distintos por sobre el umbral ===" % (len(rutas), tot))


if __name__ == "__main__":
    main()
