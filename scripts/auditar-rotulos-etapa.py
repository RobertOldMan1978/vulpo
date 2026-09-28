# -*- coding: utf-8 -*-
"""Audita las ETAPAS cableadas en los seis forks, que es la capa que ningun otro
script miraba: los seis auditores (revisar-tanda, auditar-banco-nivel,
auditar-numerico, auditar-solape-oa, auditar-audible-nivel, validar-oa-json)
revisan el BANCO, no el juego.

Nacio en la Sesion 134: Roberto jugando 3ro se topo con preguntas de Roma en una
etapa llamada "Todos necesitamos lo mismo", que suena a Formacion Ciudadana. El
contenido estaba bien (era el HI03 OA 03, que habla de griegos y romanos); lo que
engañaba era el ROTULO, y nada lo comprobaba.

Dos niveles, y la diferencia importa:

  ERRORES (salida 1) - defectos MUDOS, que no dan ningun error en pantalla:
    E1  una etapa declara un OA que su banco no tiene -> pool vacio. La etapa se
        juega igual y se marca superada SIN MEDIR NADA (el fallo que este proyecto
        ya pago con las practicas de 3ro, Sesion 83).
    E2  un jefe (oas:[...]) nombra un OA que su banco no tiene: misma historia.
    E3  una etapa nombra un OA que ni siquiera existe en el oa.json del banco.

  AVISOS (no cambian la salida) - se JUZGAN a mano, no se obedecen:
    A1  el nombre de la etapa usa vocabulario caracteristico de otro eje.

AVISO sobre A1: marca correctos a proposito, y por eso es aviso y no error. De 572
etapas marca 6, y al mirarlas solo una era real. Lo que separa el defecto del falso
positivo es una sola pregunta: el nombre ANCLA su contexto? "La democracia en
Atenas" y "Ganar el derecho a votar" (en un capitulo del siglo XX) anclan;
"Todos necesitamos lo mismo" no nombra ni la epoca, ni el lugar, ni el contenido,
asi que funciona igual de bien como titulo de una etapa de derechos del niño.

    python scripts/auditar-rotulos-etapa.py
"""
import re
import io
import os
import sys
import json
import unicodedata

FORKS = ['3ro', '4to', '5to', '6to', '7mo', '8vo']

# Vocabulario que un lector asocia a Formacion Ciudadana. No es una lista de
# palabras prohibidas: es el disparador del aviso, que despues se juzga.
CIVICO = set("""derecho derechos deber deberes respeto respetar convivencia comunidad ciudadano ciudadana
ciudadanos participar participacion votar voto democracia igualdad iguales justo justicia honesto honestidad
honesta solidaridad tolerancia diversidad inclusion normas conflicto conflictos necesitamos necesidades""".split())


def norm(t):
    t = unicodedata.normalize('NFD', t.lower())
    t = ''.join(c for c in t if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9ñ ]+', ' ', t)


def bloque(s, ini):
    """El objeto JS que empieza en `ini`, por balance de llaves (nunca por indices:
    cortar con aritmetica de lineas ya dejo un curso injugable, Sesion 56)."""
    d, i = 0, ini
    while i < len(s):
        c = s[i]
        if c == '{':
            d += 1
        elif c == '}':
            d -= 1
            if d == 0:
                return s[ini:i + 1]
        i += 1
    return ''


def expediciones(fork):
    """Las expediciones de un fork: las que declaran una lista de etapas."""
    ruta = os.path.join(fork, 'index.html')
    if not os.path.exists(ruta):
        return []
    s = io.open(ruta, encoding='utf-8', newline='').read()
    out = []
    for m in re.finditer(r"\{\s*id:'([^']+)'", s):
        obj = bloque(s, m.start())
        if not re.search(r'etapas\s*:\s*\[', obj):
            continue
        cont = re.search(r"contenido:'([^']*)'", obj)
        niv = re.search(r"nivel:'([^']*)'", obj)
        etapas = []
        for e in re.finditer(r'\{\s*oa\s*:\s*"([^"]+)"([^{}]*)\}', obj):
            cod, resto = e.group(1), e.group(2)
            nom = re.search(r'nombre\s*:\s*"([^"]*)"', resto)
            mo = re.search(r'oas\s*:\s*\[([^\]]*)\]', resto)
            oas = re.findall(r'"([^"]+)"', mo.group(1)) if mo else []
            etapas.append((cod, nom.group(1) if nom else '', oas))
        out.append({'fork': fork, 'id': m.group(1), 'nivel': niv.group(1) if niv else '',
                    'contenido': cont.group(1) if cont else '', 'etapas': etapas})
    return out


def banco(ruta_preguntas):
    """Los OA que el banco declara (oa.json), su eje, y los que de verdad tienen
    preguntas. Sin preguntas, una etapa es un nodo vacio que nadie nota."""
    carpeta = os.path.dirname(ruta_preguntas)
    declarados, ejes, conpreg = set(), {}, set()
    f_oa = os.path.join(carpeta, 'oa.json')
    if os.path.exists(f_oa):
        d = json.load(io.open(f_oa, encoding='utf-8'))
        for o in d.get('oa', []):
            c = o.get('codigo')
            if c:
                declarados.add(c)
                ejes[c] = o.get('eje') or ''
        for u in d.get('unidades', []):
            for o in (u.get('oa') or []):
                if isinstance(o, dict) and o.get('codigo'):
                    declarados.add(o['codigo'])
                    ejes[o['codigo']] = o.get('eje') or ''
    if os.path.exists(ruta_preguntas):
        b = json.load(io.open(ruta_preguntas, encoding='utf-8'))
        for q in b.get('preguntas', []):
            if q.get('oa'):
                conpreg.add(q['oa'])
    return declarados, ejes, conpreg


def main():
    errores, avisos, n_etapas = [], [], 0
    cache = {}
    for fk in FORKS:
        for exp in expediciones(fk):
            ruta = exp['contenido']
            if not ruta:
                continue
            if ruta not in cache:
                cache[ruta] = banco(ruta)
            declarados, ejes, conpreg = cache[ruta]
            for cod, nom, oas in exp['etapas']:
                n_etapas += 1
                donde = '[%s] %s - "%s"' % (fk, exp['id'], nom or cod)
                if cod != 'BOSS':
                    if declarados and cod not in declarados:
                        errores.append('E3 %s: el OA %s no existe en %s/oa.json'
                                       % (donde, cod, os.path.dirname(ruta)))
                    elif conpreg and cod not in conpreg:
                        errores.append('E1 %s: el OA %s no tiene NI UNA pregunta en el banco '
                                       '-> la etapa se juega vacia y se marca superada sin medir'
                                       % (donde, cod))
                for o in oas:
                    if conpreg and o not in conpreg:
                        errores.append('E2 %s (jefe): el OA %s no tiene preguntas en el banco'
                                       % (donde, o))
                # A1 - el rotulo suena a otro eje.
                # El eje de un JEFE sale de los OA que mezcla: "JEFE: Derechos y
                # deberes" es correcto en un capitulo civico, y marcarlo seria ruido.
                # Y los modulos transversales (VOC-, AF-, TE-, CA-) no tienen eje
                # curricular, asi que el chequeo no les aplica: en un libro de lectura
                # "La convivencia y los roces" es el titulo del tramo, no un objetivo.
                curricular = re.match(r'^[A-Z]{2}[0-9]{2} OA [0-9]{2}$', cod)
                cods = oas if cod == 'BOSS' else ([cod] if curricular else [])
                cods = [c for c in cods if re.match(r'^[A-Z]{2}[0-9]{2} OA [0-9]{2}$', c)]
                civico = any(ejes.get(c, '').startswith('Formaci') for c in cods)
                if nom and cods and not civico:
                    civ = set(norm(nom).split()) & CIVICO
                    if civ:
                        ej = ', '.join(sorted({ejes.get(c, '') or '-' for c in cods}))
                        avisos.append('A1 %s\n      %s (eje %s) - palabras: %s'
                                      % (donde, ', '.join(cods), ej, ', '.join(sorted(civ))))

    print('etapas auditadas: %d' % n_etapas)
    print('')
    if errores:
        print('ERRORES (%d):' % len(errores))
        for e in errores:
            print('  ' + e)
        print('')
    else:
        print('0 errores.')
        print('')
    if avisos:
        print('AVISOS (%d) - se JUZGAN a mano: el nombre ancla su contexto?' % len(avisos))
        for a in avisos:
            print('  ' + a)
        print('')
    return 1 if errores else 0


if __name__ == '__main__':
    sys.exit(main())
