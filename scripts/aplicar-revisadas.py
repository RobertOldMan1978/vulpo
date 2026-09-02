# -*- coding: utf-8 -*-
"""
VULPO - Aplica las marcas de "revisada" a los bancos de preguntas.

Toma un archivo revisadas.json (exportado desde el tablero con el boton
"Exportar revisadas") y sincroniza el campo "revisada" de cada pregunta.

POR QUE RECORRE TODOS LOS BANCOS (Sesion 63):
    Hasta hoy este script tenia una sola ruta fija, `contenido/historia-8basico/
    preguntas.json`. El tablero, en cambio, exporta en UN SOLO archivo los ids de
    TODAS las asignaturas. O sea que el circuito de aprobacion que documenta
    CLAUDE.md solo cerraba para un banco de los quince, y los demas se marcaron
    aprobados por otras vias, a mano y en bloque. Con seis niveles en la v1 eso no
    escala: por eso ahora recorre `contenido/*/preguntas.json`.

QUE HACE EN CADA BANCO:
    - revisada = True  si el id de la pregunta esta en la lista exportada
    - revisada = False si no esta  <-- OJO, ver abajo

CUIDADO IMPORTANTE - el desmarcado:
    El tablero guarda las marcas en el localStorage del navegador, asi que una
    exportacion hecha desde otro equipo (o despues de limpiar el navegador) NO
    trae los ids aprobados antes. Aplicarla tal cual DESMARCARIA miles de
    preguntas ya aprobadas sin avisar. Por eso, por omision, este script solo
    AGREGA marcas y nunca las quita. Para desmarcar de verdad hay que pedirlo
    explicitamente con --sincronizar, que ademas informa cuantas va a desmarcar y
    en que banco.

Uso:
    python scripts/aplicar-revisadas.py [ruta_a_revisadas.json]
    python scripts/aplicar-revisadas.py --sincronizar     (permite desmarcar)
    python scripts/aplicar-revisadas.py --seco            (no escribe nada)

Si no se indica ruta, busca revisadas.json en la raiz del proyecto y, si no,
en la carpeta de Descargas del usuario.

Luego vuelve a generar el tablero:
    python scripts/generar-tablero.py
"""

import io, json
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
CONTENIDO = RAIZ / "contenido"


def bancos():
    """Todas las carpetas de contenido con preguntas, saltando las que empiezan
    con '_' (la plantilla no es contenido)."""
    for carpeta in sorted(CONTENIDO.iterdir()):
        if not carpeta.is_dir() or carpeta.name.startswith("_"):
            continue
        preg = carpeta / "preguntas.json"
        if preg.exists():
            yield carpeta.name, preg


def lecciones():
    """Los archivos de mini-clases e introducciones.

    ⚠️ Se aplican por el MISMO archivo exportado y por el mismo `id`: el tablero guarda
    todas las marcas juntas en localStorage y una leccion (ma3-oa01, ci8-celula) no
    choca con ningun id de pregunta. Sin esto, las 75 lecciones del proyecto se podian
    marcar en el tablero y la marca no llegaba a ninguna parte — que es como estuvieron
    hasta el 02/09, cuando ni siquiera habia casilla que marcar.
    """
    for carpeta in sorted(CONTENIDO.iterdir()):
        if not carpeta.is_dir() or carpeta.name.startswith("_"):
            continue
        lec = carpeta / "lecciones.json"
        if lec.exists():
            yield carpeta.name, lec


def ubicar_revisadas(args):
    rutas = [a for a in args if not a.startswith("--")]
    if rutas:
        return Path(rutas[0])
    cand = RAIZ / "revisadas.json"
    if cand.exists():
        return cand
    descargas = Path.home() / "Downloads" / "revisadas.json"
    if descargas.exists():
        return descargas
    return cand  # inexistente: se reportara el error


# Formato canonico de preguntas.json. Es el que ya producia consolidar-pool-nivel.py y
# el que cumplen los 16 bancos desde el 31/08: indent=1, sin salto final, LF, y como
# cabecera solo lo que alguien LEE de verdad. Ver contenido/_plantilla/README.md.
CABECERA = ("revisadas", "nota")


def escribir_banco(ruta, d):
    """Escribe el banco en el formato canonico.

    Antes esta funcion DETECTABA el formato de cada archivo y lo conservaba, porque
    convivian cuatro: sin eso, marcar 390 preguntas producia un diff de 5.463 lineas.
    Ahora los 16 bancos comparten formato, asi que conservar lo que se encuentre pasaria
    a ser el mecanismo por el que uno vuelve a divergir sin que nadie lo vea.
    """
    # La clave de la lista cambia segun el archivo: los bancos traen "preguntas" y los
    # de mini-clases "lecciones". Todo lo demas del formato canonico es identico.
    lista = "preguntas" if "preguntas" in d else "lecciones"
    orden = {}
    for k in CABECERA:
        if k in d and k != lista:
            orden[k] = d[k]
    orden[lista] = d[lista]
    io.open(ruta, "w", encoding="utf-8", newline="\n").write(
        json.dumps(orden, ensure_ascii=False, indent=1))


def main():
    args = sys.argv[1:]
    sincronizar = "--sincronizar" in args
    seco = "--seco" in args

    ruta = ubicar_revisadas(args)
    if not ruta.exists():
        print("No se encontro el archivo de revisadas: %s" % ruta)
        print("Exporta primero desde el tablero (boton 'Exportar revisadas') o indica la ruta.")
        sys.exit(1)

    data = json.load(open(ruta, encoding="utf-8"))
    ids = set(data.get("revisadas", []))
    print("Aplicando desde: %s  (%d ids marcados)" % (ruta, len(ids)))
    if seco:
        print("--seco: no se escribira ningun archivo.\n")
    elif sincronizar:
        print("--sincronizar: se PERMITE desmarcar preguntas ausentes de la lista.\n")
    else:
        print("Modo seguro: solo se AGREGAN marcas. Usa --sincronizar para poder desmarcar.\n")

    tot_lec_marcadas = tot_lec = 0
    tot_marcadas = tot_desmarcadas = tot_preg = tot_rev = 0
    sin_tocar = []
    huerfanos = set(ids)

    for nombre, preg in bancos():
        d = json.load(open(preg, encoding="utf-8"))
        preguntas = d["preguntas"] if isinstance(d, dict) else d
        marcadas = desmarcadas = 0

        for q in preguntas:
            qid = q.get("id")
            huerfanos.discard(qid)
            esta = qid in ids
            era = bool(q.get("revisada"))
            if esta and not era:
                q["revisada"] = True
                marcadas += 1
            elif era and not esta and sincronizar:
                q["revisada"] = False
                desmarcadas += 1

        rev = sum(1 for q in preguntas if q.get("revisada"))
        if isinstance(d, dict):
            d["revisadas"] = rev

        tot_preg += len(preguntas)
        tot_rev += rev
        tot_marcadas += marcadas
        tot_desmarcadas += desmarcadas

        if marcadas or desmarcadas:
            detalle = "+%d" % marcadas
            if desmarcadas:
                detalle += " / -%d" % desmarcadas
            print("  %-24s %4d/%4d revisadas   (%s)" % (nombre, rev, len(preguntas), detalle))
            if not seco:
                escribir_banco(preg, d)
        else:
            sin_tocar.append("%s %d/%d" % (nombre, rev, len(preguntas)))

    # --- las mini-clases y las introducciones ------------------------------
    # Mismo archivo exportado, mismo id, mismo modo seguro. Se escriben con el mismo
    # detector de formato que los bancos, asi que marcar 26 lecciones cambia 26 lineas
    # y no reformatea el archivo entero.
    for nombre, lec in lecciones():
        dl = json.load(open(lec, encoding="utf-8"))
        lista = dl.get("lecciones", [])
        marcadas = 0
        for l in lista:
            lid = l.get("id")
            huerfanos.discard(lid)
            esta = lid in ids
            era = bool(l.get("revisada"))
            if esta and not era:
                l["revisada"] = True
                marcadas += 1
            elif era and not esta and sincronizar:
                l["revisada"] = False
        rev = sum(1 for l in lista if l.get("revisada"))
        tot_lec += len(lista)
        tot_lec_marcadas += marcadas
        if marcadas:
            print("  %-24s %4d/%4d lecciones     (+%d)" % (nombre, rev, len(lista), marcadas))
            if not seco:
                escribir_banco(lec, dl)

    if sin_tocar:
        print("\n  sin cambios: " + " · ".join(sin_tocar))

    print("\n=== %d bancos · %d/%d revisadas en total ===" % (
        len(list(bancos())), tot_rev, tot_preg))
    print("marcadas: +%d   desmarcadas: -%d" % (tot_marcadas, tot_desmarcadas))
    if tot_lec:
        print("mini-clases e introducciones: +%d marcadas (de %d)" % (tot_lec_marcadas, tot_lec))

    if huerfanos:
        # Un id exportado que no existe en ningun banco casi siempre significa que el
        # banco se re-consolido despues de marcar (el consolidador reasigna ids).
        print("\nAVISO: %d ids del archivo no existen en ningun banco." % len(huerfanos))
        for h in sorted(huerfanos)[:10]:
            print("   %s" % h)
        if len(huerfanos) > 10:
            print("   ... y %d mas" % (len(huerfanos) - 10))
        print("Suele pasar si el banco se volvio a consolidar despues de marcar.")

    if not seco:
        print("\nRecuerda regenerar el tablero: python scripts/generar-tablero.py")


if __name__ == "__main__":
    main()
