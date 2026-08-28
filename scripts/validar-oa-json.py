# -*- coding: utf-8 -*-
"""Valida los `contenido/<asignatura>/oa.json` contra el esquema canonico.

POR QUE EXISTE (Sesion 63):
    Los oa.json se escribieron en tres generaciones y cada una agrego sus propias
    claves sin volver a alinear las anteriores: de las claves de nivel superior,
    solo 7 son universales. Eso no es cosmetico. `generar-tablero.py` recorre TODAS
    las carpetas en una sola pasada, asi que **un banco con otro dialecto deja sin
    tablero a los quince** y con eso bloquea la aprobacion pedagogica completa. Ya
    paso dos veces: Sesion 55 (`KeyError: 'unidades'`) y Sesion 62 (`KeyError: 'id'`,
    por las unidades de 7 que usan {n, nombre}).

    Con seis niveles en la v1 son 24 archivos escritos por agentes distintos en
    momentos distintos. Sin un validador, la deriva es cuestion de tiempo.

QUE COMPRUEBA:
    - Las claves obligatorias, y que `codigo_asignatura` calce con los codigos de OA.
    - Que exista UNA agrupacion que cubra todos los OA del banco, y que sus grupos
      traigan {id, titulo}. Se acepta `capitulos_del_juego` en vez de `unidades`
      cuando los capitulos del juego NO siguen las unidades del Programa (caso real:
      lenguaje de 3 y de 7), pero entonces se exige `nota_unidades` que lo explique.
    - Que ningun OA quede fuera de la agrupacion ni se repita en dos grupos.
    - Que los OA excluidos del banco se declaren en `oa_excluidos_del_banco` con su
      motivo, y no solo en prosa: hoy `LE03 OA 16` (caligrafia) esta excluido de
      verdad pero solo lo dice un comentario, mientras `LE07 OA 12` si lo declara.
    - Coherencia con el banco: que todo OA con preguntas exista en el oa.json y que
      los OA declarados excluidos NO tengan preguntas.

Uso:
    python scripts/validar-oa-json.py                 (todas las carpetas)
    python scripts/validar-oa-json.py historia-7basico
"""

import io
import json
import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENIDO = os.path.join(RAIZ, "contenido")

OBLIGATORIAS = ["asignatura", "nivel", "codigo_asignatura", "fuente", "url_fuente",
                "nota_fidelidad", "oa"]
RECOMENDADAS = ["nota_evaluacion"]
AGRUPACIONES = ["unidades", "capitulos_del_juego", "unidades_oficiales_del_programa"]

# Los bancos de apoyo no son currículum: no tienen OA oficiales ni fuente MINEDUC.
APOYO = {"vocabulario", "lectura-anafrank"}


def carpetas(args):
    if args:
        return args
    return sorted(d for d in os.listdir(CONTENIDO)
                  if not d.startswith("_")
                  and os.path.isfile(os.path.join(CONTENIDO, d, "oa.json")))


def revisar(carpeta):
    base = os.path.join(CONTENIDO, carpeta)
    d = json.load(io.open(os.path.join(base, "oa.json"), encoding="utf-8"))
    errores, avisos = [], []
    apoyo = carpeta in APOYO

    for k in OBLIGATORIAS:
        if k not in d:
            (avisos if apoyo else errores).append("falta la clave obligatoria '%s'" % k)
    for k in RECOMENDADAS:
        if k not in d:
            avisos.append("sin '%s' (no es obligatoria, pero cada asignatura tiene "
                          "algun OA que el quiz no puede medir de verdad)" % k)

    oas = d.get("oa") or []
    codigos = [o.get("codigo") for o in oas]
    for o in oas:
        if not o.get("codigo") or not o.get("texto"):
            errores.append("un OA sin 'codigo' o sin 'texto'")
    dup = {c for c in codigos if codigos.count(c) > 1}
    if dup:
        errores.append("codigos de OA repetidos: %s" % ", ".join(sorted(dup)))

    # El prefijo tiene que calzar: el nivel viaja en el codigo (MA03, HI07...).
    pref = d.get("codigo_asignatura")
    if pref and not apoyo:
        malos = [c for c in codigos if c and not c.startswith(pref + " ")]
        if malos:
            errores.append("%d OA no empiezan con '%s': %s"
                           % (len(malos), pref, ", ".join(malos[:4])))

    # Una sola agrupacion, que cubra todo y traiga {id, titulo}.
    usadas = [k for k in AGRUPACIONES if k in d]
    grupos = d.get("unidades") or d.get("capitulos_del_juego") or []
    if not grupos:
        errores.append("sin agrupacion de OA: falta 'unidades' o 'capitulos_del_juego' "
                       "(sin ella generar-tablero.py se cae y deja sin tablero a TODOS "
                       "los bancos, no solo a este)")
    else:
        cual = "unidades" if d.get("unidades") else "capitulos_del_juego"
        if cual == "capitulos_del_juego" and not d.get("nota_unidades"):
            avisos.append("agrupa por 'capitulos_del_juego' y no por 'unidades', pero no "
                          "explica por que en 'nota_unidades'")
        for i, g in enumerate(grupos, 1):
            if "id" not in g:
                errores.append("%s[%d] sin 'id' (7° usa 'n'; el canon es 'id')" % (cual, i))
            if "titulo" not in g:
                errores.append("%s[%d] sin 'titulo' (7° usa 'nombre'; el canon es 'titulo')"
                               % (cual, i))
            if not g.get("oa"):
                errores.append("%s[%d] sin lista 'oa'" % (cual, i))

        agrupados = [c for g in grupos for c in (g.get("oa") or [])]
        excluidos = {e.get("codigo") for e in (d.get("oa_excluidos_del_banco") or [])}
        sueltos = [c for c in codigos if c not in agrupados and c not in excluidos]
        if sueltos:
            errores.append("%d OA no estan en ningun grupo: %s"
                           % (len(sueltos), ", ".join(sueltos[:5])))
        repetidos = {c for c in agrupados if agrupados.count(c) > 1}
        if repetidos:
            avisos.append("OA en mas de un grupo: %s" % ", ".join(sorted(repetidos)))
        fantasma = [c for c in agrupados if c not in codigos]
        if fantasma:
            errores.append("grupos que citan OA inexistentes: %s" % ", ".join(fantasma[:5]))

    if len(usadas) > 1 and "unidades" not in usadas:
        avisos.append("usa %s pero ninguna se llama 'unidades'" % " + ".join(usadas))

    # Coherencia con el banco de preguntas.
    pjson = os.path.join(base, "preguntas.json")
    if os.path.isfile(pjson):
        pd = json.load(io.open(pjson, encoding="utf-8"))
        preguntas = pd["preguntas"] if isinstance(pd, dict) else pd
        con_preguntas = {q.get("oa") for q in preguntas}
        huerfanos = sorted(c for c in con_preguntas if c and c not in codigos)
        if huerfanos:
            errores.append("el banco tiene preguntas de OA que el oa.json no declara: %s"
                           % ", ".join(huerfanos[:5]))
        excl = {e.get("codigo") for e in (d.get("oa_excluidos_del_banco") or [])}
        chocan = sorted(excl & con_preguntas)
        if chocan:
            errores.append("OA declarados EXCLUIDOS que si tienen preguntas: %s"
                           % ", ".join(chocan))
        sin_preg = [c for c in codigos if c not in con_preguntas and c not in excl]
        if sin_preg:
            avisos.append("%d OA declarados sin ninguna pregunta y sin declararse "
                          "excluidos: %s" % (len(sin_preg), ", ".join(sin_preg[:5])))

    return errores, avisos


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    total_e = total_a = 0
    for c in carpetas(args):
        errores, avisos = revisar(c)
        total_e += len(errores)
        total_a += len(avisos)
        estado = "ERROR" if errores else ("aviso" if avisos else "ok")
        print("%-26s %s" % (c, estado))
        for e in errores:
            print("   ERROR  %s" % e)
        for a in avisos:
            print("   aviso  %s" % a)
    print("\n=== %d errores · %d avisos ===" % (total_e, total_a))
    sys.exit(1 if total_e else 0)


if __name__ == "__main__":
    main()
