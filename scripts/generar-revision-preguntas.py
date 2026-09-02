# -*- coding: utf-8 -*-
"""
Arma un documento de REVISION PEDAGOGICA del banco de preguntas: HTML listo para
imprimir o convertir a PDF con Chrome (--print-to-pdf), agrupado por unidad y OA.

Por que no se usa scripts/generar-pdf-preguntas.py: ese agrupa solo por OA, no
muestra los apoyos visuales y escribe con fpdf2, que no dibuja los simbolos del
banco de 3 basico (▢ 🔺 🍎) ni los emoji. Aqui el documento es HTML, asi que sale
todo, y ademas se INCRUSTA EL DIBUJO REAL de cada pregunta reutilizando la funcion
renderVisual del propio juego: sin el, "¿Como se llama este cuerpo?" es irrevisable
en papel, y 232 de las 792 preguntas de 3 basico llevan dibujo.

Uso:
    python scripts/generar-revision-preguntas.py matematicas-3basico
    python scripts/generar-revision-preguntas.py matematicas-3basico --sin-revisar
"""
import io, json, re, sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))


VISUALES = RAIZ / "assets" / "js" / "visuales.js"
LECCIONES_JS = RAIZ / "assets" / "js" / "lecciones.js"


def lecciones_js():
    """El modulo de mini-clases, para dibujar sus diagramas en el informe.

    Los diagramas de leccion son SVG INTERACTIVOS y su API no es la de visuales.js
    (renderVisual devuelve texto; aqui hay que montar dentro de un nodo), por eso se
    incrusta el modulo entero y se llama LECC.diagrama. En papel se ve su estado inicial.
    """
    if not LECCIONES_JS.exists():
        sys.exit("No existe %s: sin el, las mini-clases quedan sin dibujos." % LECCIONES_JS)
    return io.open(LECCIONES_JS, encoding="utf-8").read()


def bloque_leccion(l, texto_oa):
    """Una mini-clase con sus bloques, para revisar en papel."""
    H = ['<div class="q">']
    oa = l.get("oa", "")
    H.append('<div class="qh"><span class="chk"></span>%s<span class="id">%s</span></div>'
             % (esc(l.get("titulo", l["id"])), esc(l["id"])))
    if oa:
        H.append('<div class="oatxt"><b>%s</b> &middot; %s</div>'
                 % (esc(oa), esc(texto_oa.get(oa, "(sin texto de OA)"))))
    for b in l.get("bloques", []):
        tipo = b.get("t")
        if tipo == "texto":
            H.append("<p>%s</p>" % esc(b.get("md", "")))
        elif tipo == "diagrama":
            if b.get("intro"):
                H.append('<p class="sub">%s</p>' % esc(b["intro"]))
            H.append("<div class='diag' data-k='%s' data-p='%s'></div>"
                     % (esc(b.get("kind", "")), esc(json.dumps(b.get("params", {})))))
        elif tipo == "ejemplo":
            if b.get("intro"):
                H.append("<p><b>Ejemplo:</b> %s</p>" % esc(b["intro"]))
            H.append('<ol class="ops">')
            for paso in b.get("pasos", []):
                H.append("<li>%s</li>" % esc(paso))
            H.append("</ol>")
        elif tipo == "practica":
            fb = b.get("fromBank", {})
            H.append('<div class="tip">Practica: %s preguntas de <code>%s</code></div>'
                     % (fb.get("n", "?"), esc(fb.get("oa", "?"))))
    H.append("</div>")
    return H


def render_visual_js():
    """Devuelve el modulo de dibujos tal cual, sin copiarlo.

    Antes se recortaba del index.html del fork del nivel, y ese recorte fue una trampa:
    empezaba en textoVisual y terminaba justo antes de `const $`, asi que mover una linea
    dejaba fuera una dependencia y los 232 dibujos desaparecian SIN ERROR VISIBLE -el
    catch de la plantilla los reemplazaba por texto-. Ya paso una vez.

    Desde M1 el modulo es un archivo aparte, asi que se lee entero y no hay recorte que
    pueda quedar mal. Y de paso el informe deja de depender de que el fork del nivel
    exista: 5 basico va a poder aprobar su banco con dibujos antes de tener su juego.
    """
    if not VISUALES.exists():
        sys.exit("No existe %s: sin el, los dibujos no se pueden incrustar." % VISUALES)
    return io.open(VISUALES, encoding="utf-8").read()


def esc(t):
    return (str(t).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))


def main():
    if len(sys.argv) < 2:
        sys.exit("Uso: python scripts/generar-revision-preguntas.py <carpeta-asignatura>")
    carpeta = sys.argv[1]
    solo_pendientes = "--sin-revisar" in sys.argv
    base = RAIZ / "contenido" / carpeta
    oa_json = json.load(io.open(base / "oa.json", encoding="utf-8"))
    preguntas = json.load(io.open(base / "preguntas.json", encoding="utf-8"))["preguntas"]
    if solo_pendientes:
        preguntas = [p for p in preguntas if not p.get("revisada")]

    texto_oa = {o["codigo"]: o["texto"] for o in oa_json["oa"]}
    por_oa = {}
    for p in preguntas:
        por_oa.setdefault(p["oa"], []).append(p)

    total = len(preguntas)
    revisadas = sum(1 for p in preguntas if p.get("revisada"))

    H = []
    H.append("<h1>%s · %s</h1>" % (esc(oa_json.get("asignatura", carpeta)),
                                   esc(oa_json.get("nivel", ""))))
    H.append("<p class='sub'>Revisión pedagógica del banco de preguntas · "
             "%d preguntas · %d objetivos de aprendizaje</p>" % (total, len(texto_oa)))
    H.append("<div class='caja'><b>Cómo revisar.</b> Cada pregunta trae una casilla. "
             "Marca <b>✔</b> si la apruebas tal cual; si algo falla, escribe al lado qué "
             "cambiarías. La <b>respuesta correcta va marcada en verde</b>. Debajo de cada "
             "pregunta está la explicación que el niño ve al equivocarse.<br><br>"
             "<b>Los dibujos son los mismos que ve el alumno</b>, no una descripción: si el "
             "dibujo entrega la respuesta, se ve aquí igual que en el juego.<br><br>"
             "El identificador gris (por ejemplo <code>mat3-oa01-7</code>) sirve para "
             "señalar una pregunta sin transcribirla.</div>")
    if revisadas != total:
        H.append("<p class='aviso'>Estado actual: <b>%d de %d</b> marcadas como revisadas "
                 "en los datos.</p>" % (revisadas, total))

    # 3 basico usa "unidades"/"titulo"; 7 usa "unidades"/"nombre" y Lenguaje de 7
    # usa "capitulos_del_juego", porque sus capitulos NO siguen las unidades del
    # Programa (sus OA se repiten en casi todas). Se aceptan las tres formas para no
    # deformar los oa.json, que son la fuente curricular.
    grupos = oa_json.get("unidades") or oa_json.get("capitulos_del_juego") or []
    for u in grupos:
        oas = [c for c in u["oa"] if c in por_oa]
        if not oas:
            continue
        n = sum(len(por_oa[c]) for c in oas)
        H.append("<h2>%s · %s</h2>" % (esc(u.get("id", u.get("n", ""))),
                                       esc(u.get("titulo") or u.get("nombre", ""))))
        H.append("<p class='sub'>%s · %d objetivos · %d preguntas</p>"
                 % (esc(u.get("descripcion", "")), len(oas), n))
        for c in sorted(oas):
            ps = por_oa[c]
            H.append("<h3>%s <span class='cnt'>%d preguntas</span></h3>" % (esc(c), len(ps)))
            H.append("<p class='oatxt'>%s</p>" % esc(texto_oa.get(c, "(sin texto oficial)")))
            for k, p in enumerate(ps, 1):
                H.append("<div class='q'>")
                H.append("<div class='qh'><span class='chk'></span>"
                         "<span class='qn'>%d.</span> %s <span class='id'>%s</span></div>"
                         % (k, esc(p["pregunta"]), esc(p.get("id", ""))))
                if p.get("visual"):
                    H.append("<div class='vis' data-v='%s'></div>"
                             % esc(json.dumps(p["visual"], ensure_ascii=False)))
                H.append("<ol class='ops'>")
                for i, o in enumerate(p["opciones"]):
                    H.append("<li class='%s'>%s</li>"
                             % ("ok" if i == p["correcta"] else "", esc(o)))
                H.append("</ol>")
                if p.get("tip"):
                    H.append("<div class='tip'>%s</div>" % esc(p["tip"]))
                H.append("</div>")

    # --- Mini-clases de esta asignatura, si las tiene. Van ARRIBA: se aprueba primero lo
    # que ENSEÑA y despues lo que pregunta.
    lecciones = []
    f_lec = base / "lecciones.json"
    if f_lec.exists():
        lecciones = json.load(io.open(f_lec, encoding="utf-8")).get("lecciones", [])
    if lecciones:
        L = ['<h2>Mini-clases <span class="cnt">%d</span></h2>' % len(lecciones),
             '<div class="aviso">Cada mini-clase <b>ense&ntilde;a</b>: un error aqu&iacute; no se '
             'falla y se corrige como una pregunta, se cree. Marca la casilla si la apruebas.</div>']
        for l in lecciones:
            L += bloque_leccion(l, texto_oa)
        H = L + H

    doc = PLANTILLA.replace("{{TITULO}}", esc("Revisión · %s %s" % (
        oa_json.get("asignatura", carpeta), oa_json.get("nivel", ""))))
    doc = doc.replace("{{CUERPO}}", "\n".join(H))
    # Solo se va a buscar renderVisual al fork si este banco tiene algun dibujo. Sin
    # esto, un libro o un nivel sin fork todavia moririan pidiendo un archivo que no
    # necesitan.
    hay_dibujos = any(p.get("visual") for p in preguntas)
    doc = doc.replace("/*RENDER*/", render_visual_js() if hay_dibujos else "")
    hay_diagramas = any(b.get("t") == "diagrama" for l in lecciones for b in l.get("bloques", []))
    doc = doc.replace("/*LECC*/", lecciones_js() if hay_diagramas else "")

    salida = RAIZ / "dev" / ("revision-%s.html" % carpeta)
    salida.parent.mkdir(parents=True, exist_ok=True)
    io.open(salida, "w", encoding="utf-8").write(doc)
    print("escrito: %s  (%d preguntas)" % (salida, total))
    print("PDF:  chrome --headless --print-to-pdf=\"%s\" \"%s\""
          % (str(salida).replace(".html", ".pdf"), salida.as_uri()))


PLANTILLA = """<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>{{TITULO}}</title>
<style>
 @page { size: A4; margin: 14mm 12mm; }
 body{font:11pt/1.45 "Segoe UI",Arial,sans-serif;color:#111;margin:0}
 h1{font-size:20pt;margin:0 0 2px}
 h2{font-size:15pt;margin:22px 0 2px;padding:6px 8px;background:#eef1f7;
    border-left:5px solid #4a5bd0;page-break-after:avoid;break-after:avoid}
 h3{font-size:12.5pt;margin:16px 0 2px;color:#2b3a8c;page-break-after:avoid;break-after:avoid}
 .cnt{font-weight:400;font-size:9.5pt;color:#777}
 .sub{color:#555;font-size:9.5pt;margin:2px 0 8px}
 .oatxt{font-size:9.5pt;color:#333;background:#fafafa;border-left:3px solid #ccc;
        padding:5px 8px;margin:2px 0 10px}
 .caja{border:1px solid #bbb;background:#fbfbfd;padding:10px 12px;margin:12px 0;font-size:10pt}
 .aviso{font-size:10pt;color:#8a4b00;background:#fff6e5;padding:6px 9px;border-radius:4px}
 .q{margin:0 0 11px;padding:7px 9px;border:1px solid #e2e2e2;border-radius:5px;
    page-break-inside:avoid;break-inside:avoid}
 .qh{font-weight:600}
 .chk{display:inline-block;border:1.4px solid #444;width:13px;height:13px;
      margin-right:7px;vertical-align:-2px;border-radius:2px}
 .qn{color:#666;margin-right:4px}
 .id{float:right;color:#aaa;font-size:8pt;font-weight:400}
 .ops{margin:5px 0 0 26px;padding:0}
 .ops li{margin:1px 0}
 .ops li.ok{color:#0a6b2e;font-weight:700}
 .ops li.ok::after{content:" ✔"}
 .tip{margin-top:5px;font-size:9.5pt;color:#444;border-left:3px solid #d8b24a;padding-left:8px}
 .vis{margin:6px 0 2px 26px;max-width:260px}
 .vis svg{max-width:250px;height:auto}
 .diag{margin:6px 0;max-width:360px}
 .diag svg{max-width:355px;height:auto}
 .q-visual{font-size:16pt;line-height:1.4}
 .q-visual.qv-grupos{display:flex;flex-wrap:wrap;gap:6px}
 code{background:#eee;padding:1px 4px;border-radius:3px;font-size:9pt}
</style></head><body>
{{CUERPO}}
<script>
/*RENDER*/
/*LECC*/
let fallidos=0;
let total=document.querySelectorAll('.vis').length;
// Los diagramas de mini-clase: montarDiagrama TRAGA sus errores (deja el nodo vacio), asi
// que no basta con try/catch — hay que comprobar que quedo un <svg> dentro.
document.querySelectorAll('.diag').forEach(d=>{
  total++;
  try{ LECC.diagrama(d.dataset.k, JSON.parse(d.dataset.p), d); }catch(e){}
  if(!d.querySelector('svg')){ d.innerHTML='<i>(diagrama no disponible)</i>'; fallidos++; }
});
document.querySelectorAll('.vis').forEach(d=>{
  try{ d.innerHTML = renderVisual(JSON.parse(d.dataset.v)) || '<i>(dibujo no disponible)</i>'; }
  catch(e){ d.innerHTML = '<i>(dibujo no disponible)</i>'; fallidos++; }
});
// Un dibujo que no se dibuja NO puede pasar inadvertido: el documento se imprime y
// nadie nota que faltan. Si falla alguno, el aviso sale arriba, en rojo y grande.
if(fallidos){
  const a=document.createElement('div');
  a.style.cssText='background:#c00;color:#fff;padding:14px;font-size:14pt;font-weight:700';
  a.textContent='ATENCION: '+fallidos+' de '+total+' dibujos no se pudieron generar. '+
                'NO revises con este documento: revisa el extractor de dibujos.';
  document.body.insertBefore(a, document.body.firstChild);
}
</script>
</body></html>"""


if __name__ == "__main__":
    main()
