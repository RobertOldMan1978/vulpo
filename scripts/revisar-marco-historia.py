# -*- coding: utf-8 -*-
"""Comprueba que TODO capitulo de Historia tenga su introduccion con el marco.

La regla (docs/estandar-introduccion-historia.md, 07/09/2026) es que cada capitulo de
Historia abre diciendo en que siglo estamos, entre que anos pasa y en que lugar del
planeta. El `lugar` es obligatorio siempre; el siglo y los anos solo donde aportan -en
geografia y formacion ciudadana se responderian con "hoy, siglo XXI", que es relleno-.

Existe porque una introduccion que falta NO SE VE: el capitulo se juega igual, sin el
nodo 📘, y nadie lo nota. Es la misma clase de omision muda que el META_OA de 7 basico.

Uso:  python scripts/revisar-marco-historia.py
Sale con codigo 1 si falta algo, para que encadenarlo con && sirva de algo.
"""
import io
import json
import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# El fork de cada curso, para leer de ahi los capitulos de Historia y su campo `intro`.
FORKS = {'3basico': '3ro', '4basico': '4to', '5basico': '5to',
         '6basico': '6to', '7basico': '7mo', '8basico': '8vo'}


def objeto_en(txt, pos):
    """El objeto `{...}` que contiene la posicion `pos`, por BALANCE DE LLAVES.

    ⚠️ Acotar con un `.*?` no sirve y ya dio un informe falso: cruza la frontera del objeto
    y se lleva la campana siguiente, asi que los capitulos de Matematica salian listados
    como de Historia. Es el mismo motivo por el que este proyecto corta codigo por balance
    y no por rangos.
    """
    ini = txt.rfind('{', 0, pos)
    if ini < 0:
        return ''
    n = 0
    for i in range(ini, len(txt)):
        c = txt[i]
        if c == '{':
            n += 1
        elif c == '}':
            n -= 1
            if n == 0:
                return txt[ini:i + 1]
    return ''


def capitulos_de_historia(fork):
    """Los ids de capitulo de Historia y el `intro` que declara cada uno.

    Se lee del index.html del fork y no de una lista escrita a mano: las listas paralelas
    son la fuente de bug mas repetida de este proyecto.
    """
    txt = io.open(os.path.join(RAIZ, fork, 'index.html'), encoding='utf-8').read()

    # Un capitulo de Historia es una EXPEDICION que declara esa asignatura. Se busca asi y
    # no por el `capitulos` de la campana porque `asignatura` vive en cada expedicion, y
    # porque de este modo un capitulo suelto -fuera de la campana- tampoco se escapa.
    out = []
    for m in re.finditer(r"asignatura\s*:\s*'Historia'", txt):
        exp = objeto_en(txt, m.start())
        mid = re.search(r"id\s*:\s*'([^']+)'", exp)
        if not mid:
            continue
        cid = mid.group(1)
        # Solo las expediciones JUGABLES. Con `asignatura:'Historia'` tambien se declaran la
        # campana, sus insignias y sus skins, que no son capitulos y no llevan introduccion.
        if 'etapas' not in exp or 'contenido' not in exp:
            continue
        # El Desafio Extra queda FUERA a proposito: mezcla objetivos de toda la asignatura,
        # asi que no tiene un siglo ni un lugar propios que declarar.
        if cid.endswith('-desafio'):
            continue
        mi = re.search(r"intro\s*:\s*'([^']+)'", exp)
        out.append((cid, mi.group(1) if mi else None))
    return out or None


def main():
    fallos = []
    avisos = []
    total = con_marco = 0

    for nivel, fork in sorted(FORKS.items()):
        caps = capitulos_de_historia(fork)
        if caps is None:
            fallos.append('%s: no encuentro la campana de Historia en %s/index.html'
                          % (nivel, fork))
            continue

        # ⚠️ Que el capitulo declare `intro` NO basta: el fork tiene que CARGAR el archivo
        # en LECC.init, o el nodo 📘 simplemente no se dibuja. Paso de verdad el 07/09 en
        # 4, 5 y 6 -sus lecciones.json de Historia son nuevos y no estaban en la lista-, y
        # este chequeo daba VERDE con el defecto vivo: el capitulo se juega igual, sin la
        # introduccion, y nadie lo nota. Es el hueco clasico de comprobar el dato y no el
        # camino que lo usa.
        html = io.open(os.path.join(RAIZ, fork, 'index.html'), encoding='utf-8').read()
        # ⚠️ Los comentarios HTML se quitan ANTES de buscar: la cabecera de cada fork
        # documenta el modulo escribiendo "LECC.init({ruta,hayReto})" dentro de un <!-- -->,
        # y sin esto el regex encuentra ESE texto y no la llamada real. Es el mismo falso
        # positivo que el comentario que contiene la cadena "<script>" y rompe la
        # comprobacion de sintaxis: el HTML de este proyecto habla de si mismo.
        html = re.sub(r'<!--.*?-->', '', html, flags=re.S)
        ruta_esperada = 'contenido/historia-%s/lecciones.json' % nivel
        mi = re.search(r'LECC\.init\s*\((.*?)\)\s*;', html, re.S)
        if caps and not (mi and ruta_esperada in mi.group(1)):
            fallos.append('%s: %s/index.html NO carga "%s" en LECC.init, asi que el nodo de introduccion '
                          'no se dibuja en ningun capitulo' % (nivel, fork, ruta_esperada))
            continue

        ruta_lec = os.path.join(RAIZ, 'contenido', 'historia-' + nivel, 'lecciones.json')
        lecciones = {}
        if os.path.exists(ruta_lec):
            for l in json.load(io.open(ruta_lec, encoding='utf-8'))['lecciones']:
                lecciones[l['id']] = l

        for cid, intro in caps:
            total += 1
            if not intro:
                fallos.append('%s %s: el capitulo NO declara intro' % (nivel, cid))
                continue
            lec = lecciones.get(intro)
            if lec is None:
                fallos.append('%s %s: declara intro "%s" y esa leccion no existe'
                              % (nivel, cid, intro))
                continue

            bloques = lec.get('bloques', [])
            if not bloques:
                fallos.append('%s %s: la introduccion "%s" no tiene bloques' % (nivel, cid, intro))
                continue

            b0 = bloques[0]
            if b0.get('kind') != 'marco':
                fallos.append('%s %s: "%s" NO abre con el bloque marco (abre con %s)'
                              % (nivel, cid, intro, b0.get('kind') or b0.get('t')))
                continue

            p = b0.get('params') or {}
            if not p.get('lugar'):
                fallos.append('%s %s: "%s" tiene marco SIN lugar, que es obligatorio'
                              % (nivel, cid, intro))
                continue

            con_marco += 1
            # Una practica en una introduccion la convierte en mini-clase: mediria, y una
            # introduccion no mide. Es aviso y no error porque el estandar lo permite en
            # Historia si el capitulo lo justifica (el HI03 OA 06 es el unico caso hoy).
            if any(x.get('t') == 'practica' for x in bloques):
                avisos.append('%s %s: "%s" lleva practica, asi que MIDE: es mini-clase, no '
                              'introduccion' % (nivel, cid, intro))

    for f in fallos:
        print('  ERROR  ' + f)
    for a in avisos:
        print('  aviso  ' + a)
    print()
    print('=== %d capitulos de Historia · %d con marco · %d errores · %d avisos ==='
          % (total, con_marco, len(fallos), len(avisos)))
    return 1 if fallos else 0


if __name__ == '__main__':
    sys.exit(main())
