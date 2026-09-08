#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genera assets/plan/oa-unidad.json: {"HI05 OA 01":"U1", ...}

Cruza unidades[].oa de cada banco CURRICULAR (historia/matematicas/ciencias/lenguaje).
Los transversales (vocabulario-*, lectura-*) NO entran: sus codigos (VOC-*, AF-*, CA-*) no
llevan el nivel adentro y NUNCA aparecen en unidades_plan (la planificacion es por asignatura
curricular, kimun_prof_asignaturas). Incluirlos solo infla el archivo.

Un OA que pertenece a VARIAS unidades se asigna a la PRIMERA, igual que el mapa de dominio del
panel (Sesion 108: "Se agrupan en la primera"). Asi el estado por capitulo sigue tomando el mas
activo entre sus OAs, consistente con el panel.

Se regenera cuando cambia un oa.json, como el tablero. Corre desde la raiz del repo.
"""
import json, io, glob, os, re

CURRICULAR = re.compile(r'(historia|matematicas|ciencias|lenguaje)-\dbasico$')

def grupos_de(d):
    # Tolerante como generar-tablero.py: 'unidades' o, en lenguaje-7basico,
    # 'capitulos_del_juego'. Nunca 'unidades_oficiales_del_programa' (no rige el juego).
    return d.get('unidades') or d.get('capitulos_del_juego') or []

def u_id(u):
    return str(u.get('id', u.get('n', ''))).strip()

def main():
    mapa = {}
    carpetas = 0
    for f in sorted(glob.glob('contenido/*/oa.json')):
        car = os.path.basename(os.path.dirname(f))
        if not CURRICULAR.search(car):
            continue
        carpetas += 1
        d = json.load(io.open(f, encoding='utf-8'))
        for u in grupos_de(d):
            uid = u_id(u)
            if not uid:
                continue
            for oa in u.get('oa', []):
                mapa.setdefault(oa, uid)   # primera unidad gana
    if carpetas != 24:
        raise SystemExit('Esperaba 24 bancos curriculares (6 cursos x 4), vi %d' % carpetas)
    salida = 'assets/plan/oa-unidad.json'
    os.makedirs(os.path.dirname(salida), exist_ok=True)
    with io.open(salida, 'w', encoding='utf-8', newline='\n') as w:
        json.dump(dict(sorted(mapa.items())), w, ensure_ascii=False,
                  separators=(',', ':'), indent=0)
        w.write('\n')
    print('%d OA -> unidad, %d bancos, %s' % (len(mapa), carpetas, salida))

if __name__ == '__main__':
    main()
