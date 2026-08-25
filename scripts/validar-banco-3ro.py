# -*- coding: utf-8 -*-
"""
Valida el banco de Matematica 3 basico.

Uso:
    python scripts/validar-banco-3ro.py                       # valida preguntas.json
    python scripts/validar-banco-3ro.py ruta/al/parcial.json  # valida un parcial de agente

Comprueba, por pregunta:
  - 4 opciones, todas distintas y no vacias
  - 'correcta' es un indice valido (0-3)
  - 'oa' existe en oa.json
  - 'tip' presente y no vacio
  - enunciado corto para lector inicial (<= 90 caracteres)
  - 'visual', si viene, es de un tipo conocido y con sus campos
Y, sobre el conjunto:
  - enunciados duplicados (normalizados)
  - cobertura por OA
"""
import json, sys, io, unicodedata
from collections import Counter
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
BASE = RAIZ / "contenido" / "matematicas-3basico"
LARGO_MAX = 90
TIPOS = {
    "contar":   ("a", "b"),
    "agrupar":  ("grupos", "porGrupo"),
    "fraccion": ("partes", "pintadas"),
    "recta":    ("desde", "hasta", "paso"),
    "reloj":    ("hora", "minuto"),
    "barras":   ("etiquetas", "valores"),
    "cuerpo":   ("nombre",),
}
CUERPOS = {"cubo", "paralelepipedo", "esfera", "cono", "cilindro", "piramide"}


def norm(t):
    t = unicodedata.normalize("NFKD", str(t).lower())
    return "".join(c for c in t if not unicodedata.combining(c)).strip()


def main():
    ruta = Path(sys.argv[1]) if len(sys.argv) > 1 else BASE / "preguntas.json"
    datos = json.load(io.open(ruta, encoding="utf-8"))
    preguntas = datos["preguntas"] if isinstance(datos, dict) else datos
    oficiales = {o["codigo"] for o in json.load(io.open(BASE / "oa.json", encoding="utf-8"))["oa"]}

    errores, avisos, vistos = [], [], {}
    for i, p in enumerate(preguntas):
        ref = "#%d (%s)" % (i, p.get("pregunta", "")[:40])
        ops = p.get("opciones", [])
        if len(ops) != 4:
            errores.append("%s: tiene %d opciones, deben ser 4" % (ref, len(ops)))
        if len({norm(o) for o in ops}) != len(ops):
            errores.append("%s: opciones repetidas" % ref)
        if any(not str(o).strip() for o in ops):
            errores.append("%s: hay una opcion vacia" % ref)
        c = p.get("correcta")
        if not isinstance(c, int) or not (0 <= c < len(ops)):
            errores.append("%s: 'correcta' invalida (%r)" % (ref, c))
        if p.get("oa") not in oficiales:
            errores.append("%s: OA desconocido %r" % (ref, p.get("oa")))
        if not str(p.get("tip", "")).strip():
            errores.append("%s: sin 'tip' (explicacion al fallar)" % ref)
        if len(p.get("pregunta", "")) > LARGO_MAX:
            avisos.append("%s: enunciado de %d caracteres (max sugerido %d)"
                          % (ref, len(p["pregunta"]), LARGO_MAX))
        v = p.get("visual")
        if v:
            t = v.get("tipo")
            if t not in TIPOS:
                errores.append("%s: visual de tipo desconocido %r" % (ref, t))
            else:
                faltan = [k for k in TIPOS[t] if k not in v]
                if faltan:
                    errores.append("%s: visual '%s' sin campos %s" % (ref, t, faltan))
                if t == "cuerpo" and norm(v.get("nombre", "")) not in CUERPOS:
                    errores.append("%s: cuerpo %r no lo dibuja el motor" % (ref, v.get("nombre")))
                if t == "barras":
                    e, va = v.get("etiquetas", []), v.get("valores", [])
                    if not e or len(e) != len(va) or len(e) > 6:
                        errores.append("%s: barras mal formadas (%d etiquetas, %d valores)"
                                       % (ref, len(e), len(va)))
                if t == "reloj":
                    h, m = v.get("hora"), v.get("minuto")
                    if not (isinstance(h, int) and isinstance(m, int) and 1 <= h <= 12 and 0 <= m <= 59):
                        errores.append("%s: reloj fuera de rango (%r:%r)" % (ref, h, m))
        k = norm(p.get("pregunta", ""))
        if k in vistos:
            errores.append("%s: enunciado duplicado de #%d" % (ref, vistos[k]))
        else:
            vistos[k] = i

    porOA = Counter(p.get("oa") for p in preguntas)
    print("Archivo: %s" % ruta)
    print("Preguntas: %d | OA cubiertos: %d de %d" % (len(preguntas), len(porOA), len(oficiales)))
    for oa in sorted(oficiales):
        n = porOA.get(oa, 0)
        marca = "  " if n >= 30 else ("! " if n else "X ")
        print("%s%s: %d" % (marca, oa, n))
    if avisos:
        print("\nAVISOS (%d):" % len(avisos))
        for a in avisos[:20]:
            print("  - %s" % a)
    if errores:
        print("\nERRORES (%d):" % len(errores))
        for e in errores[:40]:
            print("  - %s" % e)
        sys.exit(1)
    print("\nSin errores.")


if __name__ == "__main__":
    main()
