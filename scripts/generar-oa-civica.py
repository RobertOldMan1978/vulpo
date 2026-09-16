#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genera assets/plan/oa-civica.json: {"03":["HI03 OA 11",...], "04":[...], ...}

Los OA del eje "Formacion ciudadana" de cada oa.json de Historia (los 43 civicos, G1). El
campo por-OA `eje` es el UNICO marcador presente en los 6 cursos (la unidad "Formacion
ciudadana" solo existe titulada en 4/5/6; en 3/7/8 esta repartida), y da 43/43 exacto. NO se
parsean los forks (JS): el oa.json es la misma lista y es JSON.

El panel lo cruza client-side: por nivel para la vista de un curso (kimun_prof_dominio filtrado)
y aplanado para pasarlo a kimun_prof_civica (informe de colegio). Cero contenido nuevo; se
regenera si cambia un oa.json. Corre desde la raiz del repo.
"""
import json, io, glob, os, unicodedata

def norm(s):
    # tolera mayuscula/acento: "Formacion Ciudadana" == "Formación ciudadana"
    return ''.join(c for c in unicodedata.normalize('NFD', (s or '').strip())
                   if unicodedata.category(c) != 'Mn').lower()

EJE = norm('Formación ciudadana')

def main():
    por_nivel = {}
    niveles = 0
    for f in sorted(glob.glob('contenido/historia-*basico/oa.json')):
        d = json.load(io.open(f, encoding='utf-8'))
        niveles += 1
        for o in d.get('oa', []):
            if norm(o.get('eje')) == EJE:
                cod = (o.get('codigo') or '').strip()
                if cod:
                    por_nivel.setdefault(cod[2:4], []).append(cod)   # HI03 OA 11 -> "03"
    total = sum(len(v) for v in por_nivel.values())
    if niveles != 6:
        raise SystemExit('Esperaba 6 oa.json de Historia, vi %d' % niveles)
    if total != 43:
        raise SystemExit('Esperaba 43 OA civicos (el eje "Formacion ciudadana"), vi %d' % total)
    for k in por_nivel:
        por_nivel[k] = sorted(por_nivel[k])
    salida = 'assets/plan/oa-civica.json'
    os.makedirs(os.path.dirname(salida), exist_ok=True)
    with io.open(salida, 'w', encoding='utf-8', newline='\n') as w:
        json.dump(dict(sorted(por_nivel.items())), w, ensure_ascii=False,
                  separators=(',', ':'), indent=0)
        w.write('\n')
    print('%d OA civicos, %d niveles, %s' % (total, niveles, salida))

if __name__ == '__main__':
    main()
