# -*- coding: utf-8 -*-
"""
KIMUN - Generador del tablero de desarrollo (Admin).

Genera dev/tablero.html con:
  - Bloqueo suave por contrasena (modo Admin).
  - Acordeon: al pinchar un OA se despliegan sus preguntas (enunciado +
    respuesta correcta) con una casilla para marcarlas como "revisadas".
  - Dos metricas por OA: COBERTURA (cantidad vs meta) y REVISADAS (aprobadas
    por un humano).
  - Boton "Exportar revisadas" (descarga revisadas.json) para luego aplicarlo
    con scripts/aplicar-revisadas.py.
  - Boton para volver al juego.

Uso:
    python scripts/generar-tablero.py

CONTRASENA: cambia CLAVE_ADMIN y vuelve a generar. Bloqueo suave, NO seguridad
real (sitio estatico).
"""

import json
import re
from datetime import datetime
from pathlib import Path
from html import escape

CLAVE_ADMIN = "112358"   # <-- cambia aqui la contrasena del panel Admin

RAIZ = Path(__file__).resolve().parent.parent
CONTENIDO = RAIZ / "contenido"
SALIDA = RAIZ / "dev" / "tablero.html"

COLOR_EJE = {
    "Historia": "var(--gold)",
    "Formación ciudadana": "var(--pink)",
    "Geografía": "var(--cyan)",
}


def djb2(s):
    h = 5381
    for c in s:
        h = ((h * 33) + ord(c)) & 0xFFFFFFFF
    return h


def cargar_json(ruta):
    with open(ruta, encoding="utf-8") as f:
        return json.load(f)


def color_avance(pct):
    if pct <= 0:
        return "var(--dim)"
    if pct >= 100:
        return "var(--green)"
    return "var(--cyan)"


def etiqueta_estado(pct):
    if pct <= 0:
        return "Pendiente"
    if pct >= 100:
        return "Listo"
    return "En progreso"


def barra(pct, alto=10, color=None):
    pct = max(0, min(100, pct))
    col = color or color_avance(pct)
    return (
        f'<div class="track" style="height:{alto}px">'
        f'<div class="fill" style="width:{pct:.0f}%;background:{col}"></div>'
        f"</div>"
    )


# Orden en que se muestran las asignaturas en el tablero. Las que no estén en la
# lista (por ejemplo libros de lectura, presentes y futuros) van al final, ordenadas
# alfabéticamente entre sí.
# Se deduce del nombre de la carpeta (`historia-7basico` -> nivel 7, asignatura
# historia), asi que un nivel nuevo se ordena solo, sin tocar este archivo. Antes era
# una lista escrita a mano con las cinco carpetas de 8: con seis niveles habria sido
# una lista paralela mas que mantener, y los bancos de 3 y 7 quedaban mezclados
# alfabeticamente al final. Eso importa de verdad, porque la aprobacion pedagogica se
# hace por nivel y tenerlos revueltos obliga a saltar entre bloques.
ORDEN_ASIGNATURA = ["historia", "matematicas", "ciencias", "lenguaje"]
SIN_NIVEL = 99   # vocabulario, libros de lectura: al final


def _clave_orden(carpeta):
    n = carpeta.name
    if "-" in n and n.rsplit("-", 1)[1].endswith("basico"):
        asig, nivel = n.rsplit("-", 1)
        try:
            num = int(nivel.replace("basico", ""))
        except ValueError:
            num = SIN_NIVEL
        pos = ORDEN_ASIGNATURA.index(asig) if asig in ORDEN_ASIGNATURA else len(ORDEN_ASIGNATURA)
        return (num, pos, n)
    return (SIN_NIVEL, 0, n)   # los de apoyo, alfabeticos entre si


def recolectar_asignaturas():
    asignaturas = []
    if not CONTENIDO.exists():
        return asignaturas
    for carpeta in sorted(CONTENIDO.iterdir(), key=_clave_orden):
        if carpeta.name.startswith("_"):   # plantilla y auxiliares: no son asignaturas
            continue
        oa_path = carpeta / "oa.json"
        if not oa_path.exists():
            continue
        oa_data = cargar_json(oa_path)
        preg_path = carpeta / "preguntas.json"
        preg_data = cargar_json(preg_path) if preg_path.exists() else {"preguntas": [], "meta_preguntas_por_oa": 8}
        # Las mini-clases se cuentan APARTE: una leccion no es una pregunta, y meterlas
        # en la cobertura (preguntas/meta por OA) inflaria el porcentaje.
        lec_path = carpeta / "lecciones.json"
        lecciones = cargar_json(lec_path).get("lecciones", []) if lec_path.exists() else []
        asignaturas.append((carpeta.name, oa_data, preg_data, lecciones))
    return asignaturas


# --- Tolerancia a los dialectos de oa.json -----------------------------------
# Los oa.json se escribieron en tres generaciones y sus grupos de OA no usan las
# mismas claves: 8 y 3 basico traen `unidades` con {id, titulo, descripcion}, y 7
# las trae con {n, nombre}; ademas lenguaje-7basico no tiene `unidades` sino
# `capitulos_del_juego` + `unidades_oficiales_del_programa`.
#
# Esto NO es cosmetico: `oa_data["unidades"]` y `u["id"]` son accesos duros, y
# como este script recorre TODAS las carpetas, un solo banco con otro dialecto
# **deja sin tablero a los quince**, o sea bloquea la aprobacion pedagogica
# completa. Paso en la Sesion 55 (KeyError: 'unidades') y volvio a pasar en la 62
# con 7 basico (KeyError: 'id'). Por eso ahora se lee con tolerancia en vez de
# confiar en que todos los archivos esten alineados.
def grupos_de(oa_data):
    return (oa_data.get("unidades")
            or oa_data.get("capitulos_del_juego")
            or oa_data.get("unidades_oficiales_del_programa")
            or [])


def u_id(u):
    v = u.get("id", u.get("n", ""))
    return str(v) if v != "" else "-"


def u_titulo(u):
    return u.get("titulo") or u.get("nombre") or "(sin nombre)"


def render_lecciones(lecciones, oa_por_codigo):
    """Las mini-clases e introducciones, CON su casilla y renderizadas.

    ⚠️ Hasta el 02/09 el tablero solo las CONTABA con un chip, y el informe decia
    "marca la casilla si la apruebas" sobre una casilla que no existia. O sea que las
    58 lecciones del proyecto no tenian ningun tramite de aprobacion, siendo lo unico
    que ENSEÑA: una pregunta equivocada se falla y se corrige, una clase se cree.

    Reusa el mismo mecanismo de las preguntas —`.pq-check input` con `data-id`— asi que
    el guardado, el contador y "Exportar revisadas" funcionan sin tocar nada. Los ids de
    leccion (ma3-oa01, ci8-celula) no chocan con los de pregunta.

    Los diagramas se dibujan de verdad: el modulo assets/js/lecciones.js va incrustado
    al final del documento y aqui solo se deja el nodo con sus datos.
    """
    if not lecciones:
        return ""
    H = ['<div class="lecs">',
         '<div class="lecs-head"><b>📘 Mini-clases e introducciones</b>'
         '<span class="lecs-n">%d</span>'
         '<button class="bulk lecs-bulk">✓ Aprobar todas</button></div>' % len(lecciones),
         '<div class="lecs-sub">Enseñan antes de preguntar, así que se aprueban aparte. '
         'Una clase equivocada no se falla: se cree.</div>']
    for l in lecciones:
        rev = "1" if l.get("revisada") else "0"
        oa = l.get("oa", "")
        txt_oa = oa_por_codigo.get(oa, {}).get("texto", "") if oa else ""
        H.append('<details class="lec" data-lid="%s"><summary>'
                 '<span class="pq-check"><input type="checkbox" data-id="%s" data-rev="%s"></span>'
                 '<b>%s</b><span class="lec-id">%s</span></summary>'
                 % (escape(l["id"]), escape(l["id"]), rev,
                    escape(l.get("titulo", l["id"])), escape(l["id"])))
        if oa:
            H.append('<div class="lec-oa"><b>%s</b> · %s</div>' % (escape(oa), escape(txt_oa)))
        for b in l.get("bloques", []):
            tipo = b.get("t")
            if tipo == "texto":
                H.append("<p>%s</p>" % escape(b.get("md", "")))
            elif tipo == "diagrama":
                if b.get("intro"):
                    H.append('<p class="lec-sub">%s</p>' % escape(b["intro"]))
                H.append("<div class='lec-diag-slot' data-k=\"%s\" data-p=\"%s\"></div>"
                         % (escape(b.get("kind", "")), escape(json.dumps(b.get("params", {})))))
            elif tipo == "ejemplo":
                if b.get("intro"):
                    H.append("<p><b>Ejemplo:</b> %s</p>" % escape(b["intro"]))
                H.append("<ol>")
                for paso in b.get("pasos", []):
                    H.append("<li>%s</li>" % escape(paso))
                H.append("</ol>")
            elif tipo == "practica":
                fb = b.get("fromBank", {})
                H.append('<div class="lec-prac">Práctica: %d preguntas de %s del banco</div>'
                         % (fb.get("n", 0), escape(fb.get("oa", "?"))))
        H.append("</details>")
    H.append("</div>")
    return "".join(H)


def render_asignatura(oa_data, preg_data, lecciones=()):
    meta = int(preg_data.get("meta_preguntas_por_oa", 8))
    preguntas = preg_data.get("preguntas", [])

    conteo = {}
    revis = {}
    preg_por_oa = {}
    for p in preguntas:
        oa = p.get("oa", "")
        conteo[oa] = conteo.get(oa, 0) + 1
        if p.get("revisada"):
            revis[oa] = revis.get(oa, 0) + 1
        preg_por_oa.setdefault(oa, []).append(p)

    oa_por_codigo = {oa["codigo"]: oa for oa in oa_data["oa"]}

    total_oa = len(oa_data["oa"])
    total_preg = len(preguntas)
    total_rev = sum(1 for p in preguntas if p.get("revisada"))
    oa_con_algo = sum(1 for oa in oa_data["oa"] if conteo.get(oa["codigo"], 0) > 0)
    oa_listos = sum(1 for oa in oa_data["oa"] if conteo.get(oa["codigo"], 0) >= meta)
    utiles = sum(min(conteo.get(oa["codigo"], 0), meta) for oa in oa_data["oa"])
    avance_global = (utiles / (meta * total_oa) * 100) if total_oa else 0
    rev_global = (total_rev / total_preg * 100) if total_preg else 0

    partes = []
    pend_preg = total_preg - total_rev
    partes.append('<section class="asig" data-pend-preg="%d">' % pend_preg)
    partes.append(
        f'<div class="asig-head">'
        f'<div><h2><span class="a-caret">▾</span>{escape(oa_data["asignatura"])}</h2>'
        f'<div class="sub">{escape(oa_data["nivel"])} · meta {meta} preguntas por OA</div></div>'
        f'<div class="global"><div class="pct">{avance_global:.0f}%</div>'
        f'<div class="pct-lbl">cobertura</div></div>'
        f"</div>"
    )
    partes.append(
        '<div class="asig-bulk">'
        f'<button class="bulk asig-bulk-btn" title="Aprobar las {total_preg} preguntas de '
        f'{escape(oa_data["asignatura"])} de una vez">✓ Aprobar toda la asignatura</button>'
        '<button class="bulk sec asig-bulk-off" title="Quitar la marca a todas">✕ Quitar todas</button>'
        '<span class="asig-bulk-info"></span>'
        "</div>"
    )
    partes.append(barra(avance_global, alto=14))
    partes.append(f'<div class="rev-lbl" style="margin-top:8px">🔍 Revisadas por ti: {total_rev}/{total_preg} ({rev_global:.0f}%)</div>')
    partes.append(barra(rev_global, alto=8, color="var(--pink)"))
    partes.append(
        '<div class="chips">'
        f'<span class="chip">📚 {total_preg} preguntas</span>'
        f'<span class="chip">🎯 {oa_con_algo}/{total_oa} OA con contenido</span>'
        f'<span class="chip ok">✅ {oa_listos} OA listos</span>'
        f'<span class="chip rev2">🔍 {total_rev} revisadas</span>'
        # Las mini-clases ENSEÑAN, asi que llevan su propia seccion con sus propias
        # casillas (mas abajo). El chip queda como resumen.
        + (f'<span class="chip">📘 {len(lecciones)} mini-clases</span>' if lecciones else "")
        + "</div>"
    )

    partes.append(render_lecciones(lecciones, oa_por_codigo))

    for u in grupos_de(oa_data):
        codigos = u.get("oa", [])
        u_util = sum(min(conteo.get(c, 0), meta) for c in codigos)
        u_avance = (u_util / (meta * len(codigos)) * 100) if codigos else 0
        u_preg = sum(conteo.get(c, 0) for c in codigos)

        partes.append('<div class="unidad">')
        partes.append(
            f'<div class="u-head"><div class="u-tit"><span class="u-caret">▾</span>{escape(u_id(u))} · {escape(u_titulo(u))}</div>'
            f'<div class="u-pct">{u_avance:.0f}%</div></div>'
        )
        partes.append(barra(u_avance, alto=8))
        partes.append(f'<div class="u-sub">{u_preg} preguntas · {len(codigos)} OA</div>')

        partes.append('<div class="oa-list">')
        for c in codigos:
            oa = oa_por_codigo.get(c)
            if not oa:
                continue
            n = conteo.get(c, 0)
            r = revis.get(c, 0)
            pct = min(100, n / meta * 100) if meta else 0
            rpct = (r / n * 100) if n else 0
            eje = oa.get("eje", "")
            col_eje = COLOR_EJE.get(eje, "var(--violet)")

            filas = []
            for j, q in enumerate(preg_por_oa.get(c, []), 1):
                try:
                    resp = q["opciones"][q["correcta"]]
                except Exception:
                    resp = "(respuesta no disponible)"
                qid = q.get("id", "")
                rev = "1" if q.get("revisada") else "0"
                filas.append(
                    f'<div class="pq"><span class="pq-n">{j}.</span>'
                    f'<div class="pq-body"><div class="pq-q">{escape(q.get("pregunta",""))}</div>'
                    f'<div class="pq-a">✔ {escape(resp)}</div>'
                    + (f'<div class="pq-tip">💡 {escape(q.get("tip",""))}</div>'
                       if q.get("tip") else "")
                    + '</div>'
                    f'<label class="pq-check" title="Marcar como revisada">'
                    f'<input type="checkbox" data-id="{escape(qid)}" data-rev="{rev}"></label>'
                    "</div>"
                )
            panel = f'<div class="oa-preguntas">{"".join(filas)}</div>' if filas else ""
            abrible = " abrible" if filas else ""

            partes.append(
                f'<div class="oa{abrible}">'
                f'<div class="oa-top">'
                f'<span class="caret">{"▸" if filas else ""}</span>'
                f'<span class="oa-cod" style="color:{col_eje}">{escape(c)}</span>'
                f'<span class="oa-badge" style="border-color:{col_eje};color:{col_eje}">{escape(eje)}</span>'
                f'<span class="oa-count">{n}/{meta}</span>'
                f'<span class="oa-estado" style="color:{color_avance(pct)}">{etiqueta_estado(pct)}</span>'
                + (f'<button class="bulk oa-bulk" title="Aprobar o quitar las {len(filas)} '
                   f'preguntas de este OA de una vez">✓ todo el OA</button>' if filas else "")
                + f"</div>"
                f'<div class="oa-txt">{escape(oa["texto"])}</div>'
                f'{barra(pct, alto=7)}'
                f'<div class="rev-line"><span class="rev-lbl">🔍 revisadas {r}/{n}</span>{barra(rpct, alto=5, color="var(--pink)")}</div>'
                f'{panel}'
                "</div>"
            )
        partes.append("</div>")
        partes.append("</div>")

    partes.append("</section>")
    return "\n".join(partes)


# Un banco es del CURRICULUM si su codigo lleva el nivel adentro (HI07, MA03). Los
# transversales no (VOC, AF): acompanan al curso sin ser cobertura curricular, y por
# eso van agrupados aparte. Mismo criterio que usa scripts/validar-oa-json.py: la
# FORMA del codigo, no una lista de carpetas que haya que ir manteniendo.
CURRICULAR_TAB = re.compile(r'^[A-Z]{2}[0-9]{2}$')


def es_transversal(oa_data):
    return not CURRICULAR_TAB.match(oa_data.get('codigo_asignatura') or '')


def generar():
    asignaturas = recolectar_asignaturas()
    # Dos bloques porque son dos trabajos distintos: aprobar el curriculum de un curso
    # es medir cobertura de sus OA oficiales; aprobar un modulo transversal es revisar
    # un apoyo que no responde a ningun OA. Mezclados, el Vocabulario de 8 aparecia al
    # final -despues de Ana Frank- mientras el de 7 se ordenaba entre las de 7.
    curric = [(oa, pg, lec) for _, oa, pg, lec in asignaturas if not es_transversal(oa)]
    trans = [(oa, pg, lec) for _, oa, pg, lec in asignaturas if es_transversal(oa)]
    cuerpo = chr(10).join(render_asignatura(oa, pg, lec) for oa, pg, lec in curric)
    if trans:
        cuerpo += ('<div class="grupo-tit">Módulos transversales</div>'
                   '<div class="grupo-sub">Acompañan al curso pero <b>no son cobertura'
                   ' curricular</b>: sus códigos no son Objetivos de Aprendizaje del'
                   ' MINEDUC y no entran al mapa de dominio del profesor. Se aprueban'
                   ' igual, con el mismo criterio de muestreo.</div>')
        cuerpo += chr(10).join(render_asignatura(oa, pg, lec) for oa, pg, lec in trans)
    if not cuerpo:
        cuerpo = '<p class="vacio">Aún no hay contenido en la carpeta <code>contenido/</code>.</p>'
    marca = datetime.now().strftime("%d-%m-%Y %H:%M")
    hash_clave = str(djb2(CLAVE_ADMIN))

    css = """
:root{
  --bg1:#140f33; --bg2:#2a1b5e; --panel:#1e1747; --panel2:#271f56;
  --gold:#ffc93c; --cyan:#4dd8ff; --green:#3ee089; --pink:#ff4d8d; --violet:#8f6bff;
  --txt:#f3f0ff; --dim:#a89fd6; --r:16px;
}
*{margin:0;padding:0;box-sizing:border-box}
body{
  font-family:'Nunito',sans-serif;color:var(--txt);min-height:100vh;
  background:radial-gradient(1200px 800px at 70% -10%, #3b2a7a 0%, transparent 55%),
             linear-gradient(160deg,var(--bg1),var(--bg2));
  padding:20px 16px 60px;
}
.wrap{max-width:900px;margin:0 auto}
.grupo-tit{font-family:'Titan One',cursive;font-size:20px;color:var(--violet);margin:34px 0 4px;padding-top:20px;border-top:2px solid #ffffff1a}
.grupo-sub{color:var(--dim);font-size:13px;font-weight:700;margin-bottom:16px;max-width:70ch}
/* --- Modo de aprobacion por muestreo --- */
#muestreo{position:fixed;inset:0;background:linear-gradient(160deg,#140f33,#241a52);z-index:60;
  overflow-y:auto;padding:0 0 40px}
/* La barra de acciones es sticky abajo, asi que se monta sobre el contenido. Sin este
   aire, la ultima pregunta de la muestra queda tapada y no hay forma de leerla. */
#muestreo .mz{padding-bottom:110px}
#muestreo .mz{max-width:820px;margin:0 auto;padding:16px}
.mz-top{position:sticky;top:0;background:#140f33f2;backdrop-filter:blur(6px);
  padding:12px 0 10px;border-bottom:1px solid #ffffff18;margin-bottom:14px;z-index:2}
.mz-fila{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.mz-cod{font-family:'Titan One',cursive;color:var(--violet);font-size:17px}
.mz-pos{color:var(--dim);font-weight:800;font-size:12px;margin-left:auto}
.mz-asig{color:var(--dim);font-weight:800;font-size:12px}
.mz-txt{color:var(--txt);font-weight:700;font-size:14px;margin-top:6px;line-height:1.45}
.mz-prog{height:6px;border-radius:99px;background:#ffffff1a;overflow:hidden;margin-top:10px}
.mz-prog i{display:block;height:100%;background:linear-gradient(90deg,var(--violet),var(--cyan));
  transition:width .2s ease}
.mz-aviso{background:#ffc93c1a;border:1px solid #ffc93c44;color:var(--gold);font-weight:800;
  font-size:12px;padding:8px 12px;border-radius:10px;margin-bottom:12px}
.mz-q{background:var(--panel);border:1px solid #ffffff12;border-radius:12px;padding:12px 14px;margin-bottom:10px}
.mz-q .n{color:var(--dim);font-weight:900;font-size:12px}
.mz-q .q{font-weight:800;margin:4px 0 8px;line-height:1.45}
.mz-q .a{color:var(--green);font-weight:800;font-size:14px}
.mz-q .tip{color:var(--dim);font-size:13px;margin-top:6px}
.mz-acc{position:sticky;bottom:0;background:#140f33f2;backdrop-filter:blur(6px);
  padding:12px 0;border-top:1px solid #ffffff18;display:flex;gap:8px;flex-wrap:wrap}
.mz-b{border:0;border-radius:12px;padding:12px 16px;font-weight:900;font-size:14px;cursor:pointer;
  font-family:'Nunito',sans-serif}
.mz-ok{background:linear-gradient(135deg,var(--green),#2bbf72);color:#08301c;flex:1;min-width:180px}
.mz-no{background:var(--panel2);color:var(--pink);border:1px solid #ff4d8d55}
.mz-sk{background:var(--panel2);color:var(--dim);border:1px solid #ffffff18}
.mz-x{background:transparent;color:var(--dim);border:1px solid #ffffff18}
.mz-teclas{color:var(--dim);font-size:11px;font-weight:800;margin-top:8px;text-align:center}
.mz-fin{text-align:center;padding:60px 20px}
.mz-fin h2{font-family:'Titan One',cursive;color:var(--green);font-size:26px;margin-bottom:10px}
h1,h2,.disp{font-family:'Titan One',cursive;letter-spacing:.5px}
.topbar{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px;flex-wrap:wrap}
.volver{display:inline-flex;align-items:center;gap:6px;background:var(--panel2);border:1px solid #ffffff18;
  color:var(--txt);text-decoration:none;font-weight:900;font-size:13px;padding:9px 14px;border-radius:12px}
.tb-right{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.rev-count{color:var(--dim);font-weight:800;font-size:12px}
.exportar{background:var(--panel2);border:1px solid #4dd8ff55;color:var(--cyan);font-weight:800;font-size:12px;padding:8px 12px;border-radius:12px;cursor:pointer}
.salir{background:none;border:1px solid #ffffff22;color:var(--dim);font-weight:800;font-size:12px;padding:8px 12px;border-radius:12px;cursor:pointer}
.top{text-align:center;margin-bottom:6px}
.top h1{font-size:28px;color:var(--gold)}
.top .lema{color:var(--dim);font-weight:800;margin-top:2px;font-size:14px}
.gen{text-align:center;color:var(--dim);font-size:12px;margin-bottom:22px}
.asig{background:var(--panel);border:1px solid #ffffff18;border-radius:var(--r);padding:20px;margin-bottom:24px;box-shadow:0 10px 30px #0004}
.asig-head{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:12px;cursor:pointer}
.asig-head h2{font-size:20px}
.sub{color:var(--dim);font-weight:800;font-size:13px;margin-top:2px}
.global{text-align:center;flex-shrink:0}
.global .pct{font-family:'Titan One',cursive;font-size:38px;line-height:1;color:var(--cyan)}
.pct-lbl{color:var(--dim);font-size:12px;font-weight:800;text-transform:uppercase}
.track{background:#00000038;border-radius:99px;overflow:hidden;width:100%}
.fill{height:100%;border-radius:99px;transition:width .4s}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 6px}
.chip{background:var(--panel2);border:1px solid #ffffff14;border-radius:99px;padding:6px 12px;font-weight:800;font-size:13px}
.chip.ok{color:var(--green)} .chip.rev2{color:var(--pink)}
.unidad{background:var(--panel2);border-radius:14px;padding:14px 14px 6px;margin-top:16px}
.u-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;cursor:pointer}
.u-caret{display:inline-block;color:var(--dim);font-size:11px;margin-right:6px;transition:transform .15s}
.unidad.cerrado .u-caret{transform:rotate(-90deg)}
.unidad.cerrado .oa-list{display:none}
.a-caret{display:inline-block;color:var(--cyan);font-size:15px;margin-right:8px;transition:transform .15s}
.asig.cerrado .a-caret{transform:rotate(-90deg)}
.asig.cerrado .unidad{display:none}
.tb-controls{display:flex;gap:8px;margin:12px 0 4px;flex-wrap:wrap}
.ctrl{background:var(--panel2);border:1px solid #ffffff2a;color:#fff;border-radius:8px;padding:6px 12px;font-family:inherit;font-weight:800;font-size:13px;cursor:pointer}
.ctrl:hover{border-color:var(--gold)}
.u-tit{font-weight:900;font-size:15px}
.u-pct{font-family:'Titan One',cursive;color:var(--gold);font-size:18px}
.u-sub{color:var(--dim);font-size:12px;font-weight:800;margin:6px 0 10px}
.oa-list{display:flex;flex-direction:column;gap:10px;padding-bottom:8px}
.oa{background:#00000026;border-radius:10px;padding:10px 12px}
.oa.abrible{cursor:pointer}
.oa.abrible:hover{background:#00000038}
.oa-top{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px}
.caret{color:var(--dim);font-size:12px;width:12px;display:inline-block;transition:transform .15s}
.oa.abierto .caret{transform:rotate(90deg);color:var(--gold)}
.oa-cod{font-weight:900;font-size:13px}
.oa-badge{font-size:11px;font-weight:800;border:1px solid;border-radius:99px;padding:1px 8px}
.oa-count{margin-left:auto;font-weight:900;font-size:13px;color:var(--txt)}
.oa-estado{font-size:12px;font-weight:800}
.oa-txt{color:var(--dim);font-size:12.5px;line-height:1.35;margin-bottom:8px}
.rev-line{margin-top:7px}
.rev-lbl{font-size:11px;font-weight:800;color:var(--pink);display:block;margin-bottom:3px}
.oa-preguntas{margin-top:10px;border-top:1px dashed #ffffff1f;padding-top:8px;display:none;flex-direction:column;gap:2px}
.oa.abierto .oa-preguntas{display:flex}
.pq{display:flex;gap:8px;align-items:flex-start;padding:7px 4px;border-bottom:1px solid #ffffff0f}
.pq:last-child{border:none}
.pq-n{color:var(--dim);font-weight:900;font-size:12px;min-width:22px;text-align:right}
.pq-body{flex:1}
.pq-q{font-weight:800;font-size:13px;line-height:1.3}
.pq-a{color:var(--green);font-weight:800;font-size:12.5px;margin-top:2px}
.pq-tip{color:var(--dim);font-weight:700;font-size:12px;margin-top:3px;line-height:1.35}
.pq-check{display:flex;align-items:center;padding-left:6px}
.pq-check input{width:20px;height:20px;accent-color:var(--green);cursor:pointer}
/* Aprobacion masiva. Existe porque con 12.800 preguntas en la v1, marcar de a una
   son entre 18 y 36 horas de clic: el cuello de botella del proyecto no es escribir
   el contenido sino aprobarlo. Ver docs/aprobacion-pedagogica.md. */
.bulk{background:var(--panel2);border:1px solid #3ee08955;color:var(--green);font-weight:800;
      font-size:11px;padding:5px 10px;border-radius:10px;cursor:pointer;white-space:nowrap}
.bulk:hover{border-color:#3ee089;background:#3ee0891a}
.bulk.sec{border-color:#ff4d8d55;color:var(--pink)}
.bulk.sec:hover{border-color:#ff4d8d;background:#ff4d8d1a}
.oa-bulk{margin-left:auto}
.asig-bulk{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:10px 0 2px}
.asig-bulk-info{font-size:11px;color:#9aa;font-weight:700}
.vacio{text-align:center;color:var(--dim);padding:40px}
.leyenda{display:flex;gap:16px;justify-content:center;color:var(--dim);font-size:12px;font-weight:800;margin-top:6px;flex-wrap:wrap}
.dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:5px;vertical-align:middle}
.gate{position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;padding:20px;
  background:radial-gradient(1000px 700px at 50% 0%, #3b2a7a 0%, transparent 60%), linear-gradient(160deg,var(--bg1),var(--bg2))}
.gate-box{background:var(--panel);border:1px solid #ffffff1f;border-radius:20px;padding:28px 24px;max-width:340px;width:100%;text-align:center;box-shadow:0 20px 50px #0006}
.gate-ic{font-size:48px}
.gate-box h2{font-size:24px;color:var(--gold);margin-top:6px}
.gate-box p{color:var(--dim);font-weight:800;margin:6px 0 16px;font-size:14px}
.gate-box input{width:100%;padding:14px;border-radius:14px;border:2px solid #ffffff1f;background:#00000040;color:var(--txt);
  font-family:'Nunito';font-weight:800;font-size:16px;outline:none;text-align:center}
.gate-box input:focus{border-color:var(--cyan)}
.gate-box button{width:100%;margin-top:12px;padding:14px;border:none;border-radius:14px;cursor:pointer;
  font-family:'Titan One';font-size:16px;color:#2a1400;background:linear-gradient(180deg,var(--gold),#ff9d3c)}
.gate-err{color:var(--pink);font-weight:800;font-size:13px;min-height:18px;margin-top:10px}
.gate-volver{display:inline-block;margin-top:8px;color:var(--dim);font-weight:800;font-size:13px;text-decoration:none}

 /* Mini-clases e introducciones: su propia seccion, con casilla propia */
 .lecs{margin:14px 0 6px;border:1px solid #3a2f60;border-radius:12px;padding:10px 12px;background:#20183d}
 .lecs-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
 .lecs-n{background:#8f6bff;color:#fff;border-radius:10px;padding:1px 8px;font-size:12px}
 .lecs-sub{color:#a99fd0;font-size:12px;margin:4px 0 8px}
 .lec{border-top:1px solid #302753;padding:6px 0}
 .lec summary{cursor:pointer;display:flex;align-items:center;gap:8px;list-style:none}
 .lec summary::-webkit-details-marker{display:none}
 .lec-id{color:#7a6ab0;font-size:11px;margin-left:auto}
 .lec-oa{color:#a99fd0;font-size:12px;margin:6px 0}
 .lec-sub{color:#a99fd0;font-size:12px;margin:6px 0 2px}
 .lec p{font-size:13px;line-height:1.45;margin:6px 0}
 .lec ol{font-size:13px;margin:4px 0 4px 18px}
 .lec-prac{color:#3ee089;font-size:12px;margin:6px 0}
 /* ⚠️ Las dos clases: montarDiagrama hace nodo.className='lec-diag' al dibujar, asi que
    una regla que solo mire .lec-diag-slot deja de aplicar justo cuando hay algo que ver. */
 .lec-diag-slot,.lec-diag{margin:6px 0;max-width:360px}
 .lec-diag-slot svg,.lec-diag svg{width:100%;height:auto}
 /* "Solo lo pendiente": lo aprobado se pliega detras de una linea */
 body.solo-pend .asig.aprobada > *:not(.asig-head):not(.aprobada-nota){display:none}
 .aprobada-nota{color:#3ee089;font-size:13px;padding:6px 0}
 .filtro{display:flex;align-items:center;gap:8px;margin:10px 0;font-size:13px;color:#cfc7ea}
 .filtro button{background:#2a2150;color:#cfc7ea;border:1px solid #3a2f60;border-radius:8px;
   padding:6px 12px;cursor:pointer;font-size:13px}
 .filtro button.on{background:#8f6bff;color:#fff;border-color:#8f6bff}
"""

    # El modulo de mini-clases va ANTES del script del tablero: se usa para dibujar
    # los diagramas de cada leccion, igual que en el informe de revision. Si el
    # archivo no esta, el tablero sigue sirviendo y solo se pierde el dibujo.
    ruta_lecc = RAIZ / "assets" / "js" / "lecciones.js"
    lecc_js = ruta_lecc.read_text(encoding="utf-8") if ruta_lecc.exists() else ""

    js = """
(function(){
  var HASH = __HASH__;
  function djb2(s){var h=5381;for(var i=0;i<s.length;i++){h=((h*33)+s.charCodeAt(i))>>>0;}return h;}
  var gate=document.getElementById('gate');
  var panel=document.getElementById('panel');
  function abrir(){gate.style.display='none';panel.style.display='block';}
  if(sessionStorage.getItem('kimun_admin_ok')==='1'){abrir();}
  function intentar(){
    var v=document.getElementById('gpass').value;
    if(djb2(v)===HASH){sessionStorage.setItem('kimun_admin_ok','1');abrir();}
    else{document.getElementById('gerr').textContent='Contraseña incorrecta';
      document.getElementById('gpass').value='';}
  }
  document.getElementById('gbtn').onclick=intentar;
  document.getElementById('gpass').addEventListener('keydown',function(e){if(e.key==='Enter')intentar();});
  var salir=document.getElementById('salir');
  if(salir)salir.onclick=function(){sessionStorage.removeItem('kimun_admin_ok');location.reload();};

  // Acordeon de OA (no togglear si el clic ocurre dentro del panel de preguntas)
  document.querySelectorAll('.oa.abrible').forEach(function(oa){
    oa.addEventListener('click',function(e){
      if(e.target.closest('.oa-preguntas'))return;
      oa.classList.toggle('abierto');
    });
  });

  // Acordeon de UNIDAD: pincha el encabezado para contraer/expandir sus OA.
  document.querySelectorAll('.u-head').forEach(function(h){
    h.addEventListener('click',function(){h.closest('.unidad').classList.toggle('cerrado');});
  });

  // Acordeon de ASIGNATURA: pincha el encabezado para contraer/expandir sus unidades.
  document.querySelectorAll('.asig-head').forEach(function(h){
    h.addEventListener('click',function(){h.closest('.asig').classList.toggle('cerrado');});
  });

  // Expandir todo: abre asignaturas, unidades y OA (ver todas las preguntas).
  var eTodo=document.getElementById('expandirTodo');
  if(eTodo)eTodo.onclick=function(){
    document.querySelectorAll('.asig').forEach(function(a){a.classList.remove('cerrado');});
    document.querySelectorAll('.unidad').forEach(function(u){u.classList.remove('cerrado');});
    document.querySelectorAll('.oa.abrible').forEach(function(oa){oa.classList.add('abierto');});
  };
  // Contraer todo: deja solo las asignaturas (contrae cada asignatura). Al reabrir una,
  // sus unidades aparecen con los OA cerrados.
  var cTodo=document.getElementById('contraerTodo');
  if(cTodo)cTodo.onclick=function(){
    document.querySelectorAll('.asig').forEach(function(a){a.classList.add('cerrado');});
    document.querySelectorAll('.unidad').forEach(function(u){u.classList.remove('cerrado');});
    document.querySelectorAll('.oa.abrible').forEach(function(oa){oa.classList.remove('abierto');});
  };

  // Revisadas: casillas + exportar (persisten en el navegador)
  var LS='kimun_revisadas';
  var ov={};
  try{ov=JSON.parse(localStorage.getItem(LS)||'{}');}catch(e){ov={};}
  function idsMarcados(){
    var s={};
    document.querySelectorAll('.pq-check input:checked').forEach(function(cb){s[cb.dataset.id]=1;});
    return Object.keys(s);
  }
  function updateCount(){
    // Contar por id UNICO y no por casilla: un OA puede pertenecer a dos capitulos
    // (pasa en Lenguaje de 3, con 9 OA en dos grupos), asi que 270 preguntas se
    // dibujan dos veces y el total salia 7.944 donde el banco tiene 7.524.
    var vistos={}, marc={};
    document.querySelectorAll('.pq-check input').forEach(function(cb){
      vistos[cb.dataset.id]=1; if(cb.checked) marc[cb.dataset.id]=1;
    });
    var n=Object.keys(marc).length;
    var t=Object.keys(vistos).length;
    var el=document.getElementById('revCount');
    if(el)el.textContent='🔍 '+n+'/'+t+' marcadas';
  }
  document.querySelectorAll('.pq-check input').forEach(function(cb){
    var id=cb.dataset.id, jsonRev=cb.dataset.rev==='1';
    cb.checked=(id in ov)?ov[id]:jsonRev;
    cb.addEventListener('click',function(e){e.stopPropagation();});
    cb.addEventListener('change',function(){fijar([cb],cb.checked);});
  });
  // --- Aprobacion masiva -------------------------------------------------
  // Marcar de a una es inviable: en la v1 son ~12.800 preguntas, o sea entre 18 y 36
  // horas de clic. Estos botones marcan un OA completo o una asignatura completa.
  // Ojo: viven DENTRO de encabezados que ya son clicables para plegar/desplegar, asi
  // que necesitan stopPropagation o cada clic ademas contrae la seccion.
  function fijar(inputs, valor){
    var tocados={};
    inputs.forEach(function(cb){ tocados[cb.dataset.id]=1; ov[cb.dataset.id]=valor; });
    // Sincronizar TODAS las casillas de esos ids, no solo las de la lista: una
    // pregunta cuyo OA esta en dos capitulos se dibuja dos veces, y dejar la copia
    // sin actualizar hace ver el OA como aprobado a medias.
    document.querySelectorAll('.pq-check input').forEach(function(cb){
      if(tocados[cb.dataset.id]) cb.checked=valor;
    });
    localStorage.setItem(LS,JSON.stringify(ov));
    updateCount();
    if(typeof marcarAprobadas==='function') marcarAprobadas();
  }
  function inputsDe(raiz){
    return Array.prototype.slice.call(raiz.querySelectorAll('.pq-check input'));
  }
  // --- Mini-clases: dibujar sus diagramas y aprobarlas ---------------------
  // El modulo LECC viene incrustado al final. Si por lo que sea no esta, la leccion se
  // sigue leyendo y aprobando: solo no se ve el dibujo, que es degradar y no romper.
  document.querySelectorAll('.lec-diag-slot').forEach(function(d){
    if(!window.LECC || !LECC.diagrama) { d.textContent='(diagrama: recarga el tablero)'; return; }
    var p={}; try{p=JSON.parse(d.dataset.p||'{}');}catch(e){}
    try{ LECC.diagrama(d.dataset.k, p, d); }catch(e){ d.textContent='(no se pudo dibujar)'; }
  });
  document.querySelectorAll('.lec summary input').forEach(function(cb){
    cb.addEventListener('click',function(e){e.stopPropagation();});
  });
  document.querySelectorAll('.lecs-bulk').forEach(function(b){
    b.addEventListener('click',function(e){
      e.stopPropagation();
      var ins=inputsDe(b.closest('.lecs'));
      var todas=ins.length>0&&ins.every(function(c){return c.checked;});
      fijar(ins,!todas);
      b.textContent=todas?'✕ Quitar todas':'✓ Aprobar todas';
      marcarAprobadas();
    });
  });

  // --- "Solo lo pendiente" ------------------------------------------------
  // Con 7.805 de 7.805 preguntas firmadas, abrir el tablero completo es recorrer 235
  // objetivos verdes para llegar a nada. Se marca aprobada la asignatura cuyas casillas
  // estan TODAS marcadas, y el filtro la pliega a una linea.
  // ⚠️ Corre DESPUES de inicializar las casillas desde el almacen, no antes.
  function marcarAprobadas(){
    document.querySelectorAll('.asig').forEach(function(a){
      // Las preguntas se pintan solo al desplegar su OA, asi que NO se pueden contar
      // desde el DOM: el generador declara cuantas quedan en data-pend-preg. Las
      // lecciones si estan siempre, y se cuentan en vivo porque son lo que se aprueba hoy.
      var pendPreg=parseInt(a.dataset.pendPreg||'0',10);
      var lecs=Array.prototype.slice.call(a.querySelectorAll('.lec summary input'));
      var pendLec=lecs.filter(function(c){return !c.checked;}).length;
      var todas=(pendPreg+pendLec)===0;
      a.classList.toggle('aprobada',todas);
      var nota=a.querySelector('.aprobada-nota');
      if(todas && !nota){
        nota=document.createElement('div');
        nota.className='aprobada-nota';
        nota.textContent='✓ Todo aprobado · pincha el título para verlo';
        a.appendChild(nota);
      }else if(!todas && nota){ nota.remove(); }
    });
    // Y se mandan al FINAL: 23 asignaturas aprobadas arriba son ~2.700 px de scroll
    // antes de llegar a lo unico que hay que revisar, que es justo lo que el filtro
    // venia a evitar. Plegarlas no basta; hay que sacarlas del camino.
    document.querySelectorAll('.asig.aprobada').forEach(function(a){
      if(a.parentNode) a.parentNode.appendChild(a);
    });
    var n=document.querySelectorAll('.asig.aprobada').length;
    var el=document.getElementById('filtroInfo');
    if(el) el.textContent=n+' de '+document.querySelectorAll('.asig').length+' asignaturas sin pendientes';
  }
  marcarAprobadas();
  var btnPend=document.getElementById('soloPend');
  if(btnPend){
    btnPend.addEventListener('click',function(){
      var on=document.body.classList.toggle('solo-pend');
      btnPend.classList.toggle('on',on);
      btnPend.textContent=on?'👁 Solo lo pendiente':'👁 Ver todo';
      marcarAprobadas();
    });
  }
  // Abre filtrado: es lo que hace util el tablero hoy.
  document.body.classList.add('solo-pend');

  document.querySelectorAll('.oa-bulk').forEach(function(b){
    b.addEventListener('click',function(e){
      e.stopPropagation();
      var oa=b.closest('.oa');
      var ins=inputsDe(oa);
      // Alterna: si ya estan todas marcadas, el boton las quita. Asi el mismo control
      // sirve para corregir un OA aprobado por error, sin agregar un segundo boton.
      var todas=ins.length>0&&ins.every(function(cb){return cb.checked;});
      fijar(ins,!todas);
      b.textContent=todas?'✓ todo el OA':'✕ quitar el OA';
    });
  });
  document.querySelectorAll('.asig').forEach(function(sec){
    var info=sec.querySelector('.asig-bulk-info');
    var si=sec.querySelector('.asig-bulk-btn'), no=sec.querySelector('.asig-bulk-off');
    function aviso(n,verbo){ if(info)info.textContent=n+' preguntas '+verbo+'.'; }
    if(si)si.addEventListener('click',function(e){
      e.stopPropagation();
      var ins=inputsDe(sec);
      // Confirmar: aprobar cientos de preguntas de un clic no debe poder pasar sin querer.
      if(ins.length>60&&!confirm('Vas a marcar como revisadas '+ins.length+' preguntas de esta asignatura. ¿Seguro?'))return;
      fijar(ins,true); aviso(ins.length,'marcadas');
    });
    if(no)no.addEventListener('click',function(e){
      e.stopPropagation();
      var ins=inputsDe(sec);
      if(ins.length>60&&!confirm('Vas a QUITAR la marca a '+ins.length+' preguntas. ¿Seguro?'))return;
      fijar(ins,false); aviso(ins.length,'sin marcar');
    });
  });


  // ====================================================================
  // MODO DE APROBACION POR MUESTREO
  //
  // El criterio de docs/aprobacion-pedagogica.md es revisar 8 de las 30 preguntas de
  // cada OA y aprobar el OA si la muestra pasa. El tablero no lo implementaba: dibuja
  // las ~8.000 preguntas y quedaba en manos de quien revisa decidir cuales mirar, o
  // leerlas todas -que triplica el trabajo-. Sin teclado y sin forma de retomar.
  //
  // Este modo NO guarda aparte: reusa `fijar`, asi que las marcas viven en el mismo
  // localStorage y las copias de un OA que pertenece a dos capitulos se sincronizan
  // solas (el defecto de las 270 preguntas dibujadas dos veces en Lenguaje de 3).
  // --------------------------------------------------------------------
  var MUESTRA = 8;                 // cuantas se muestran por OA (el criterio escrito)
  var LS_POS  = 'kimun_muestreo_pos';
  var MZ = { cola: [], i: 0 };

  // PRNG determinista sembrado con el codigo del OA. La muestra tiene que ser ESTABLE:
  // si cambiara al recargar, uno podria aprobar un OA habiendo visto ocho preguntas y
  // volver a verlo con otras ocho, sin saber cual version aprobo.
  function _sem(s){ var h=2166136261; for(var i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619);} return h>>>0; }
  function _rnd(estado){ estado.s^=estado.s<<13; estado.s>>>=0; estado.s^=estado.s>>17; estado.s^=estado.s<<5; estado.s>>>=0; return estado.s/4294967296; }
  function muestraDe(codigo, n, total){
    var e={s:_sem(codigo)||1}, idx=[], i;
    for(i=0;i<total;i++) idx.push(i);
    for(i=total-1;i>0;i--){ var j=Math.floor(_rnd(e)*(i+1)); var t=idx[i]; idx[i]=idx[j]; idx[j]=t; }
    return idx.slice(0, Math.min(n,total)).sort(function(a,b){return a-b;});
  }

  // La cola son los OA con al menos una pregunta sin marcar. Un OA ya aprobado no
  // aparece, asi que 8 basico -aprobado entero- se salta solo.
  function armarCola(){
    var vistos={}, cola=[];
    document.querySelectorAll('.oa').forEach(function(oa){
      var cod=(oa.querySelector('.oa-cod')||{}).textContent||'';
      if(!cod || vistos[cod]) return;         // el mismo OA puede estar en dos capitulos
      var ins=inputsDe(oa);
      if(!ins.length) return;
      var faltan=ins.filter(function(cb){return !cb.checked;}).length;
      if(!faltan) return;
      vistos[cod]=1;
      cola.push({cod:cod, nodo:oa});
    });
    return cola;
  }

  function esc(s){ var d=document.createElement('div'); d.textContent=s==null?'':s; return d.innerHTML; }

  function pintarMuestreo(){
    var c=document.getElementById('mzCuerpo');
    if(MZ.i>=MZ.cola.length){
      c.innerHTML='<div class="mz-fin"><h2>¡No queda nada por revisar!</h2>'
        +'<p style="color:var(--dim);font-weight:800">Todos los objetivos con preguntas pendientes están aprobados.</p>'
        +'<button class="mz-b mz-x" id="mzCerrar2" style="margin-top:18px">← Volver al tablero</button></div>';
      document.getElementById('mzCerrar2').onclick=cerrarMuestreo;
      return;
    }
    var it=MZ.cola[MZ.i], oa=it.nodo;
    var asig=(oa.closest('section.asig')||{}).querySelector ? (oa.closest('section.asig').querySelector('h2')||{}).textContent||'' : '';
    var sub=(oa.closest('section.asig')||{}).querySelector ? (oa.closest('section.asig').querySelector('.sub')||{}).textContent||'' : '';
    var txt=(oa.querySelector('.oa-txt')||{}).textContent||'';
    var pqs=Array.prototype.slice.call(oa.querySelectorAll('.pq'));
    var idx=muestraDe(it.cod, MUESTRA, pqs.length);

    var h='<div class="mz-top">'
      +'<div class="mz-fila"><span class="mz-cod">'+esc(it.cod)+'</span>'
      +'<span class="mz-asig">'+esc(asig.split('▾').join('').trim())+' · '+esc(sub.split('·')[0].trim())+'</span>'
      +'<span class="mz-pos">'+(MZ.i+1)+' de '+MZ.cola.length+'</span></div>'
      +'<div class="mz-txt">'+esc(txt)+'</div>'
      +'<div class="mz-prog"><i style="width:'+((MZ.i)/MZ.cola.length*100)+'%"></i></div></div>';

    h+='<div class="mz-aviso">Muestra de '+idx.length+' de '+pqs.length+' preguntas. '
      +'Si las '+idx.length+' están bien, se aprueba el OA completo. Si alguna falla, revisa las '+pqs.length+'.</div>';

    idx.forEach(function(k,n){
      var p=pqs[k];
      var q=(p.querySelector('.pq-q')||{}).textContent||'';
      var a=(p.querySelector('.pq-a')||{}).textContent||'';
      var tip=(p.querySelector('.pq-tip')||{}).textContent||'';
      h+='<div class="mz-q"><div class="n">'+(n+1)+' / '+idx.length+' &nbsp;·&nbsp; pregunta '+(k+1)+' de '+pqs.length+'</div>'
        +'<div class="q">'+esc(q)+'</div><div class="a">'+esc(a)+'</div>'
        +(tip?'<div class="tip">'+esc(tip)+'</div>':'')+'</div>';
    });

    h+='<div class="mz-acc">'
      +'<button class="mz-b mz-ok" id="mzOk">✓ Aprobar el OA completo</button>'
      +'<button class="mz-b mz-no" id="mzNo">✗ Ver las '+pqs.length+'</button>'
      +'<button class="mz-b mz-sk" id="mzSk">Saltar</button>'
      +'<button class="mz-b mz-x"  id="mzCerrar">Salir</button>'
      +'</div>'
      +'<div class="mz-teclas">espacio o Enter aprobar · V ver todas · S saltar · Esc salir</div>';
    c.innerHTML=h;
    c.parentNode.scrollTop=0;

    document.getElementById('mzOk').onclick=aprobarActual;
    document.getElementById('mzNo').onclick=verTodasActual;
    document.getElementById('mzSk').onclick=function(){MZ.i++;guardarPos();pintarMuestreo();};
    document.getElementById('mzCerrar').onclick=cerrarMuestreo;
  }

  // Se guarda el CODIGO del objetivo y no el indice. El indice no sirve: la cola se
  // recalcula en cada apertura y encoge al aprobar, asi que un indice viejo apunta a
  // otro OA -o al final-. Paso de verdad: con la cola en 170 y luego en 2, el clamp
  // dejaba MZ.i=2 sobre una cola de 2 y el modo anunciaba que no quedaba nada.
  function guardarPos(){ try{
    var it=MZ.cola[MZ.i];
    localStorage.setItem(LS_POS, it? it.cod : '');
  }catch(e){} }

  function aprobarActual(){
    var it=MZ.cola[MZ.i];
    if(it) fijar(inputsDe(it.nodo), true);   // marca las 30, no solo las 8 mostradas
    MZ.i++; guardarPos(); pintarMuestreo();
  }

  // "Ver las 30": no se aprueba nada y se lleva al OA en el tablero, desplegado, para
  // revisarlo pregunta por pregunta. Es la salida cuando la muestra falla.
  function verTodasActual(){
    var it=MZ.cola[MZ.i];
    cerrarMuestreo();
    if(!it) return;
    var s=it.nodo.closest('section.asig'); if(s) s.classList.remove('cerrado');
    var u=it.nodo.closest('.unidad');      if(u) u.classList.remove('cerrado');
    it.nodo.classList.add('abierto');
    it.nodo.scrollIntoView({block:'start'});
  }

  function cerrarMuestreo(){
    document.getElementById('muestreo').style.display='none';
    document.removeEventListener('keydown', teclasMuestreo);
  }

  function teclasMuestreo(e){
    if(document.getElementById('muestreo').style.display==='none') return;
    if(e.key===' '||e.key==='Enter'){ e.preventDefault(); aprobarActual(); }
    else if(e.key==='v'||e.key==='V'){ e.preventDefault(); verTodasActual(); }
    else if(e.key==='s'||e.key==='S'){ e.preventDefault(); MZ.i++; guardarPos(); pintarMuestreo(); }
    else if(e.key==='Escape'){ e.preventDefault(); cerrarMuestreo(); }
  }

  var btnMz=document.getElementById('abrirMuestreo');
  if(btnMz) btnMz.onclick=function(){
    MZ.cola=armarCola();
    // Retomar donde se quedo: se busca el OA guardado en la cola NUEVA. Si ya no esta
    // -porque se aprobo, o porque la cola es otra- se empieza del principio, que es lo
    // unico util. Empezar del final es como no tener modo.
    var g=''; try{ g=localStorage.getItem(LS_POS)||''; }catch(e){}
    MZ.i=0;
    if(g) for(var k=0;k<MZ.cola.length;k++){ if(MZ.cola[k].cod===g){ MZ.i=k; break; } }
    document.getElementById('muestreo').style.display='block';
    document.addEventListener('keydown', teclasMuestreo);
    pintarMuestreo();
  };

  var exp=document.getElementById('exportar');
  if(exp)exp.onclick=function(){
    var ids=idsMarcados();
    var blob=new Blob([JSON.stringify({revisadas:ids},null,2)],{type:'application/json'});
    var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='revisadas.json';
    document.body.appendChild(a);a.click();a.remove();
  };
  updateCount();
})();
""".replace("__HASH__", hash_clave)

    html = (
        '<!DOCTYPE html>\n<html lang="es">\n<head>\n'
        '<meta charset="UTF-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
        '<title>VULPO · Tablero de desarrollo</title>\n'
        '<link rel="icon" type="image/png" sizes="32x32" href="../assets/favicon-32.png">\n'
        '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
        '<link href="https://fonts.googleapis.com/css2?family=Titan+One&family=Nunito:wght@600;800;900&display=swap" rel="stylesheet">\n'
        "<style>" + css + "</style>\n</head>\n<body>\n"
        '<div class="gate" id="gate">\n'
        '  <div class="gate-box">\n'
        '    <div class="gate-ic">🔒</div>\n'
        '    <h2>Modo Admin</h2>\n'
        '    <p>Ingresa la contraseña para ver el panel</p>\n'
        '    <input id="gpass" type="password" placeholder="Contraseña" autocomplete="off">\n'
        '    <button id="gbtn">Entrar</button>\n'
        '    <div class="gate-err" id="gerr"></div>\n'
        '    <a class="gate-volver" href="../index.html">← Volver al juego</a>\n'
        '  </div>\n'
        '</div>\n'
        '<div class="wrap" id="panel" style="display:none">\n'
        '  <div class="topbar">\n'
        '    <a class="volver" href="../index.html">← Volver al juego</a>\n'
        '    <div class="tb-right">\n'
        '      <span class="rev-count" id="revCount"></span>\n'
        '      <button class="exportar" id="exportar">⬇ Exportar revisadas</button>\n'
        '      <button class="salir" id="salir">🔒 Bloquear</button>\n'
        '    </div>\n'
        '  </div>\n'
        '  <div class="filtro">\n'
        '    <button id="soloPend" class="on">👁 Solo lo pendiente</button>\n'
        '    <span id="filtroInfo"></span>\n'
        '  </div>\n'
        '  <div class="top">\n'
        '    <h1>VULPO · Tablero</h1>\n'
        '    <div class="lema">Panel de desarrollo · avance por materia y OA</div>\n'
        '  </div>\n'
        '  <div class="gen">Generado el ' + marca + ' · <code>python scripts/generar-tablero.py</code></div>\n'
        '  <div class="tb-controls">\n'
        '    <button class="ctrl" id="abrirMuestreo" style="border-color:#3ee08966;color:var(--green)">'
        '⚡ Aprobar por muestreo</button>\n'
        '    <button class="ctrl" id="expandirTodo">▾ Expandir todo (ver todas las preguntas)</button>\n'
        '    <button class="ctrl" id="contraerTodo">▸ Contraer todo</button>\n'
        '  </div>\n'
        + cuerpo +
        '\n  <div class="leyenda">\n'
        '    <span><span class="dot" style="background:var(--dim)"></span>Pendiente</span>\n'
        '    <span><span class="dot" style="background:var(--cyan)"></span>En progreso</span>\n'
        '    <span><span class="dot" style="background:var(--green)"></span>Listo (meta cumplida)</span>\n'
        '    <span><span class="dot" style="background:var(--pink)"></span>Revisadas por ti</span>\n'
        '  </div>\n'
        '  <div class="gen" style="margin-top:18px">Pincha un OA para ver sus preguntas, o usa <b>Expandir todo</b> para verlas todas. Pincha el encabezado de una asignatura o unidad para contraerla; <b>Contraer todo</b> deja solo las asignaturas. Marca la casilla de las que apruebes y usa "Exportar revisadas".</div>\n'
        '</div>\n'
        '<div id="muestreo" style="display:none"><div class="mz" id="mzCuerpo"></div></div>\n'
        "<script>" + lecc_js + "</script>\n"
        "<script>" + js + "</script>\n"
        "</body>\n</html>\n"
    )

    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    # newline="" preserva LF: es la regla del proyecto desde .gitattributes (31/08). Sin esto
    # Python escribe CRLF en Windows y git avisa en cada generacion del tablero.
    with open(SALIDA, "w", encoding="utf-8", newline="") as f:
        f.write(html)
    print(f"Tablero generado: {SALIDA}")


if __name__ == "__main__":
    generar()
