# -*- coding: utf-8 -*-
"""Audita el banco de UNA asignatura, en cualquier nivel.

Reemplaza a `validar-banco-3ro.py` y `auditar-banco-3ro.py`, que estaban cableados a
Matematica de 3 basico: rutas fijas, `LARGO_MAX = 90` y un catalogo de 7 widgets. Con
seis niveles en la v1 eso no escala, y ademas ya estaba desfasado: los bancos de 3 usan
**11 tipos** de dibujo (`linea`, `cuadricula`, `globo` y `zonas` llegaron con Historia),
asi que 33 preguntas correctas salian marcadas como tipo desconocido. Una comprobacion
que acusa lo correcto entrena a ignorar el informe.

QUE MIRA, por pregunta:
  - 4 opciones, distintas y no vacias; `correcta` en rango; `tip` presente
  - el `oa` existe en el oa.json de la carpeta
  - largo del enunciado, con el limite que corresponde al NIVEL (lo deduce del codigo)
  - `visual`, si viene: tipo conocido y con sus campos
Y sobre el conjunto:
  - enunciados duplicados
  - cobertura por OA y reparto de la posicion de la correcta
  - **solo en Matematica**: verifica por calculo la clave de las preguntas cuya
    aritmetica se puede parsear sin ambiguedad

Uso:
    python scripts/auditar-banco-nivel.py matematicas-7basico
    python scripts/auditar-banco-nivel.py historia-3basico ruta/al/parcial.json
"""

import io
import json
import re
import sys
import unicodedata
from collections import Counter
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent

# Catalogo de dibujos: que CAMPOS exige cada tipo. Los NOMBRES se contrastan ademas
# contra el `renderVisual` del juego del nivel (ver `contrastar_tipos`), porque si esta
# copia se desincroniza el sintoma es mudo: el juego devuelve '' y la pregunta queda sin
# su apoyo sin que nada avise. Los campos NO se pueden leer del juego -no los declara en
# ninguna parte parseable-, asi que esa mitad si vive aca.
TIPOS = {
    "contar":     ("a", "b"),
    "agrupar":    ("grupos", "porGrupo"),
    "fraccion":   ("partes", "pintadas"),
    "recta":      ("desde", "hasta", "paso"),
    "reloj":      ("hora", "minuto"),
    "barras":     ("etiquetas", "valores"),
    "cuerpo":     ("nombre",),
    "cuadricula": (),
    "globo":      (),
    "zonas":      (),
    "linea":      (),
}
CUERPOS = {"cubo", "paralelepipedo", "esfera", "cono", "cilindro", "piramide"}


def diagramas_de_lecciones():
    """Los widgets del OTRO catalogo, el de las mini-clases (assets/js/lecciones.js).

    Desde la Sesion 100 una pregunta puede pedir uno de esos dibujos con `visual.kind`
    -- son los de geometria, con la base y la altura marcadas--. Los nombres se LEEN del
    modulo y no se copian aca: una lista escrita a mano es la fuente de bug mas repetida
    del proyecto, y con dos catalogos serian dos listas que mantener.
    """
    ruta = RAIZ / "assets" / "js" / "lecciones.js"
    if not ruta.exists():
        return set()
    return set(re.findall(r"DIAGRAMAS\.([A-Za-z_][\w]*)\s*=",
                          ruta.read_text(encoding="utf-8")))


DIAG_LECC = diagramas_de_lecciones()

# El limite del enunciado depende del nivel, y la razon NO es la edad sino el reloj:
# 3 y 4 basico no tienen cronometro, asi que un fragmento breve cabe. Ver el §0 de
# docs/encargo-banco.md. 5 y 6 NO van aca a proposito: llevan cronometro, asi que les
# corresponde el limite por defecto.
LARGO = {"03": (110, 220), "04": (110, 220)}
LARGO_POR_DEFECTO = (120, 250)


# Cabecera canonica de preguntas.json: `preguntas` obligatoria, y `revisadas` y `nota`
# opcionales. Todo lo demas sobra o vive en oa.json. Ver contenido/_plantilla/README.md.
CABECERA = ("revisadas", "nota")


def revisar_formato(ruta):
    """Avisa si el banco no esta escrito en el formato canonico.

    Sin esta comprobacion el contrato es solo un documento: la plantilla describia una
    cabecera que la herramienta real no producia y que NINGUNO de los 16 bancos cumplia,
    durante meses y sin que nada avisara.
    """
    crudo = io.open(ruta, encoding="utf-8", newline="").read()
    d = json.loads(crudo)
    m = []
    if "\r\n" in crudo:
        m.append("tiene CRLF; el proyecto va en LF (.gitattributes)")
    if crudo.endswith("\n"):
        m.append("termina en salto de linea; el formato canonico no lleva")
    sobran = [k for k in d if k != "preguntas" and k not in CABECERA]
    if sobran:
        m.append("claves de cabecera que sobran: %s" % ", ".join(sobran))
    orden = {k: d[k] for k in CABECERA if k in d}
    orden["preguntas"] = d.get("preguntas", [])
    if json.dumps(orden, ensure_ascii=False, indent=1) != crudo.rstrip("\n"):
        m.append("no calza con indent=1 y el orden canonico de claves; lo arregla volver "
                 "a escribirlo con consolidar-pool-nivel.py o aplicar-revisadas.py")
    return m


def contrastar_tipos(carpeta):
    """Avisa si el catalogo de arriba y assets/js/visuales.js no dicen lo mismo.

    Un tipo que este aca y no en el modulo pasa la auditoria y despues NO se dibuja: el
    renderVisual cae a `return ''` y la pregunta sale sin apoyo, sin ningun error.

    Desde M1 el catalogo es UNICO y compartido por todos los cursos, asi que ya no
    depende del fork del nivel: un banco de 5 basico se puede auditar entero antes de
    que exista su juego.
    """
    try:
        sys.path.insert(0, str(Path(__file__).resolve().parent))
        import niveles
    except Exception:
        return []
    del_modulo = niveles.tipos_de_dibujo()
    if del_modulo is None:
        return ["no encuentro assets/js/visuales.js: no puedo contrastar el catalogo"]
    faltan = sorted(set(TIPOS) - del_modulo)
    sobran = sorted(del_modulo - set(TIPOS))
    m = []
    if faltan:
        m.append("tipos que este script conoce y visuales.js NO dibuja: %s"
                 % ", ".join(faltan))
    if sobran:
        m.append("tipos que visuales.js dibuja y este script desconoce: %s"
                 % ", ".join(sobran))
    return m


def sinac(t):
    t = unicodedata.normalize("NFD", (t or "").lower())
    return "".join(c for c in t if unicodedata.category(c) != "Mn")


def norm(t):
    return " ".join(sinac(str(t)).split())


# --- Clave aritmetica (solo Matematica) --------------------------------------
# Se evalua SOLO lo que se puede parsear sin ambiguedad. Es deliberadamente cobarde:
# un verificador que adivina cuesta mas que los errores que encuentra. La primera
# version acuso 13 preguntas CORRECTAS por dos motivos que conviene no repetir:
#   (a) El punto final: "Suma 120 + 230 + 150." cortaba la expresion en "120 + 230".
#   (b) Dos operaciones en un enunciado: "Si 7 + 5 = 12, cuanto es 12 - 5?" tomaba la
#       primera y la comparaba con la clave de la segunda.
# De ahi las tres reglas: fuera los enunciados con "="; exactamente UNA expresion; y
# todos los numeros del enunciado deben pertenecer a ella.
def clave_aritmetica(p):
    q = p["pregunta"]
    # Y si la pregunta pide una PROPIEDAD del resultado y no el resultado —en que
    # digito termina, cuantas cifras tiene— compararla contra el producto acusa una
    # pregunta correcta: 45 x 32 da 1440 y la clave legitima es "0". Medido sobre los
    # 18 bancos, este guard apaga 2 comprobaciones de 99 y las 2 son de ese tipo.
    if re.search(r"[▢🔺🔷🟡⬛_=]|red |aproxim|redonde|cerca|entre|d[ií]gito|cifra", q):
        return None
    cuerpo = q.replace("¿", "").replace("?", "")
    # El signo del PRIMER termino: sin el `-?` inicial, "-3 - 5" empareja "3 - 5" = -2
    # y acusa la clave correcta (-8). El parser venia de 3 basico, que no tiene enteros;
    # 7 los introduce en su OA 01 y ahi aparecieron los 3 unicos falsos positivos.
    sumas = re.findall(r"-?\d+(?:\s*[-−+]\s*\d+)+", cuerpo)
    prods = re.findall(r"\d+\s*[x×]\s*\d+", cuerpo)
    divs = re.findall(r"\d+\s+:\s+\d+", cuerpo)
    if len(sumas) + len(prods) + len(divs) != 1:
        return None
    expr = (sumas or prods or divs)[0]
    if len(re.findall(r"\d+", cuerpo)) != len(re.findall(r"\d+", expr)):
        return None
    n = [int(x) for x in re.findall(r"\d+", expr)]
    if sumas:
        try:
            return eval(expr.replace("−", "-").replace(" ", ""))
        except Exception:
            return None
    if prods:
        return n[0] * n[1]
    return n[0] // n[1] if n[1] and n[0] % n[1] == 0 else None


def num(t):
    s = str(t).strip().replace(".", "").replace("$", "").strip()
    return int(s) if re.fullmatch(r"-?\d+", s) else None


def main():
    if len(sys.argv) < 2:
        sys.exit("uso: python scripts/auditar-banco-nivel.py <carpeta> [archivo.json]")
    carpeta = sys.argv[1]
    base = RAIZ / "contenido" / carpeta
    if not base.is_dir():
        sys.exit("no existe la carpeta: %s" % base)

    oa_data = json.load(io.open(base / "oa.json", encoding="utf-8"))
    cod = oa_data.get("codigo_asignatura", "")
    nivel = cod[2:4] if len(cod) >= 4 else ""
    blando, duro = LARGO.get(nivel, LARGO_POR_DEFECTO)
    es_mate = cod.startswith("MA")
    validos = {o["codigo"] for o in oa_data["oa"]}

    ruta = Path(sys.argv[2]) if len(sys.argv) > 2 else base / "preguntas.json"
    d = json.load(io.open(ruta, encoding="utf-8"))
    ps = d["preguntas"] if isinstance(d, dict) else d

    print("%s — %s (%s) · %d preguntas" % (ruta.name, oa_data.get("asignatura", carpeta), cod, len(ps)))
    print("limite de enunciado: %d blando / %d duro%s\n"
          % (blando, duro, "  · con verificacion aritmetica" if es_mate else ""))

    # Solo se contrasta si este banco de verdad trae dibujos: un libro o un nivel sin
    # fork todavia no tienen por que fallar aca.
    for m in revisar_formato(ruta):
        print("  AVISO formato del banco: %s" % m)

    if any(p.get("visual") for p in ps):
        for m in contrastar_tipos(carpeta):
            print("  AVISO catalogo de dibujos: %s" % m)

    errores, avisos = [], []
    vistos, por_oa, pos = {}, Counter(), Counter()
    verificadas = 0

    for p in ps:
        pid = p.get("id", "?")
        ops = [str(o) for o in p.get("opciones", [])]
        ok = p.get("correcta")
        por_oa[p.get("oa")] += 1

        if len(ops) != 4:
            errores.append("%s: %d opciones" % (pid, len(ops))); continue
        if any(not o.strip() for o in ops):
            errores.append("%s: alguna opcion vacia" % pid)
        if len(set(ops)) != 4:
            errores.append("%s: opciones repetidas" % pid)
        if not isinstance(ok, int) or not 0 <= ok < 4:
            errores.append("%s: 'correcta' fuera de rango" % pid); continue
        pos[ok] += 1
        if not (p.get("tip") or "").strip():
            errores.append("%s: sin tip" % pid)
        if p.get("oa") not in validos:
            errores.append("%s: su OA '%s' no esta en oa.json" % (pid, p.get("oa")))

        q = p.get("pregunta", "")
        if len(q) > duro:
            errores.append("%s: enunciado de %d caracteres (duro: %d)" % (pid, len(q), duro))
        elif len(q) > blando:
            avisos.append("%s: enunciado de %d caracteres (blando: %d)" % (pid, len(q), blando))

        k = norm(q)
        if k in vistos:
            errores.append("%s: enunciado repetido de %s" % (pid, vistos[k]))
        else:
            vistos[k] = pid

        v = p.get("visual")
        if v and v.get("kind"):
            # Dibujo del catalogo de las mini-clases: `kind` es el widget y `tipo`, si lo
            # lleva, es la FORMA que ese widget recibe (triangulo, cilindro). Los dos
            # catalogos usan la palabra `tipo` para cosas distintas, asi que la separacion
            # no es cosmetica: despachar por `tipo` mandaba un area de triangulo al widget
            # de Pitagoras, que dibuja a=3, b=4, c=5 y su calculo (Sesion 100).
            if v["kind"] not in DIAG_LECC:
                errores.append("%s: visual kind '%s' no existe en lecciones.js"
                               % (pid, v["kind"]))
            if "tipo" in v and v["tipo"] in TIPOS:
                avisos.append("%s: el visual lleva kind y ademas un tipo del catalogo de "
                              "preguntas ('%s'): renderVisual lo atenderia primero"
                              % (pid, v["tipo"]))
        elif v:
            t = v.get("tipo")
            if t not in TIPOS:
                errores.append("%s: visual de tipo desconocido '%s'" % (pid, t))
            else:
                faltan = [c for c in TIPOS[t] if c not in v]
                if faltan:
                    errores.append("%s: visual '%s' sin %s" % (pid, t, ", ".join(faltan)))
                if t == "cuerpo" and sinac(v.get("nombre", "")) not in CUERPOS:
                    avisos.append("%s: cuerpo '%s' fuera del catalogo" % (pid, v.get("nombre")))

        if es_mate:
            esperado = clave_aritmetica(p)
            # Solo se puede afirmar algo si la clave ES un numero. Cuando la respuesta
            # es una EXPRESION ("6 x 2 es lo mismo que sumar..." -> "2 + 2 + 2 + 2 + 2 + 2",
            # o "que multiplicacion resuelve 35 : 5?" -> "5 x 7 = 35"), el resultado del
            # enunciado no es lo que se pide y compararlos acusa preguntas correctas.
            # Los 3 unicos "errores" de la primera corrida sobre Matematica 3 eran justo
            # eso: los tres falsos.
            valor_clave = num(ops[ok])
            if esperado is not None and valor_clave is not None:
                verificadas += 1
                if valor_clave != esperado:
                    errores.append("%s: la clave dice '%s' y la cuenta da %s  «%s»"
                                   % (pid, ops[ok], esperado, q[:70]))

    sin_preg = sorted(validos - set(por_oa))
    if sin_preg:
        avisos.append("%d OA sin ninguna pregunta: %s" % (len(sin_preg), ", ".join(sin_preg[:5])))

    if errores:
        print("ERRORES (%d):" % len(errores))
        for e in errores[:40]:
            print("   " + e)
        if len(errores) > 40:
            print("   ... y %d mas" % (len(errores) - 40))
    if avisos:
        print("\navisos (%d):" % len(avisos))
        for a in avisos[:20]:
            print("   " + a)
        if len(avisos) > 20:
            print("   ... y %d mas" % (len(avisos) - 20))

    tot = sum(pos.values()) or 1
    print("\nposicion de la correcta: " + " · ".join(
        "%d: %d (%.0f%%)" % (i, pos[i], 100.0 * pos[i] / tot) for i in range(4)))
    print("OA con preguntas: %d de %d" % (len(set(por_oa) & validos), len(validos)))
    if es_mate:
        print("claves verificadas por calculo: %d de %d (%.0f%%) — el resto son problemas "
              "con enunciado, que ningun script puede comprobar"
              % (verificadas, len(ps), 100.0 * verificadas / max(1, len(ps))))
    print("\n=== %d errores · %d avisos ===" % (len(errores), len(avisos)))
    sys.exit(1 if errores else 0)


if __name__ == "__main__":
    main()
