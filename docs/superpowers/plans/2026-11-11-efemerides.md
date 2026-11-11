# La efeméride del día — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Un popup con Vulpi que, la primera vez del día, muestra una efeméride de Chile con una imagen ya existente; de 1° a 4° la voz la lee sola.

**Architecture:** Los 366 hechos viven como DATO en `contenido/efemerides/efemerides.json` (solo se muestran los `revisada:true`). `assets/js/motor.js` los descarga perezosamente y reusa `popupVulpi`. La aprobación pasa por el tablero de siempre y la voz por `generar-voz-nivel.py` + R2, en una carpeta propia `assets/voz/efem/`.

**Tech Stack:** JS del motor compartido, Python 3 para scripts, `scripts/cdp.mjs` para verificar en Chrome.

**Spec:** `docs/superpowers/specs/2026-11-11-efemerides-design.md`

**Puntos de parada (son de Roberto, no se cruzan sin él):** aprobar los textos en el tablero · autorizar la voz (Azure) · orden 66.

**Reglas que valen para todo el plan:** no hay commits hasta la orden 66 · LF en todo lo que se escriba (`newline="\n"`) · agentes de a 2, sin comandos de git que cambien el árbol · se verifica MIRANDO, no solo contando.

---

## Estructura de archivos

| Archivo | Qué es |
|---|---|
| `contenido/efemerides/imagenes.json` (nuevo) | Catálogo: cada imagen reutilizable con una línea que dice qué muestra |
| `contenido/efemerides/_tandas/<mm>.json` (nuevo) | Lo que escribe cada agente, un mes por archivo |
| `contenido/efemerides/efemerides.json` (nuevo) | Las 366 consolidadas, formato canónico |
| `scripts/consolidar-efemerides.py` (nuevo) | Une las tandas en `efemerides.json` conservando las marcas `revisada` |
| `scripts/validar-efemerides.py` (nuevo) | El validador del §8 del spec |
| `docs/encargo-efemerides.md` (nuevo) | El estándar que leen los redactores |
| `assets/js/motor.js` | `popupVulpi` gana `o.img`; `revisarEfemeride()` nueva |
| `scripts/generar-tablero.py` | Sección «📅 Efemérides» con casilla |
| `scripts/aplicar-revisadas.py` | Escribe las marcas en `efemerides.json` |
| `scripts/voz_asignaturas.py`, `scripts/generar-voz-nivel.py` | La asignatura de voz `efem` |
| `1ro/`, `2do/`, `3ro/`, `4to/index.html` | `'assets/voz/efem/'` en `VOZ_DIRS` |

---

### Task 1: El catálogo de imágenes

**Files:** Create `contenido/efemerides/imagenes.json`

- [ ] **Step 1: Hojas de contacto.** Un script en el scratchpad arma mosaicos de 6×5 miniaturas (160 px, con el nombre de archivo debajo) de todos los `assets/*.png` salvo `villano-*`, `icono-*`, `favicon*`, `og*`, `kimun-180/512.png` y los genéricos `portada-<asignatura>.png` de estilo distinto. Se guardan en el scratchpad.
- [ ] **Step 2: Mirar cada hoja** con Read y escribir una descripción de una línea por imagen (qué hace Vulpi, qué objetos hay). Nada se describe por el nombre del archivo.
- [ ] **Step 3: Escribir el catálogo** con este formato (`indent=1`, LF, sin salto final):

```json
{
 "imagenes": [
  {"img": "portada-hist-cap2.png", "muestra": "Vulpi en carabela con brújula y astrolabio, mar abierto"}
 ]
}
```

- [ ] **Step 4: Comprobar** que cada `img` existe en `assets/` y que no hay repetidos:

```bash
python -c "import json,os;d=json.load(open('contenido/efemerides/imagenes.json',encoding='utf-8'))['imagenes'];n=[x['img'] for x in d];print(len(n),len(set(n)),[i for i in n if not os.path.exists('assets/'+i)])"
```
Esperado: `N N []`.

### Task 2: El validador

**Files:** Create `scripts/validar-efemerides.py`

- [ ] **Step 1: Escribir el validador.**

```python
"""Valida contenido/efemerides/efemerides.json (spec §8). Sale con 1 si hay errores.

    python scripts/validar-efemerides.py                 # el consolidado
    python scripts/validar-efemerides.py _tandas/11.json # una tanda suelta (no exige 366)
"""
import io, json, re, sys, calendar
from pathlib import Path
from collections import Counter

RAIZ = Path(__file__).resolve().parent.parent
CARP = RAIZ / "contenido" / "efemerides"
TEMAS = {"historia", "ciencia", "naturaleza", "cultura", "deporte", "dia-oficial", "mundo"}
LARGO = 130
EMOJI = re.compile("[\U0001F300-\U0001FAFF☀-➿⬀-⯿️]")
# Fechas delicadas: ese dia va OTRO hecho. Si el texto nombra lo vetado, es error.
VETOS = {
    "09-11": r"1973|golpe|Allende|Pinochet|La Moneda",
    "10-18": r"2019|estallido",
    "03-29": r"combatiente|Vergara",
    "10-05": r"plebiscito|1988",
    "10-25": r"plebiscito|2020|constituci",
    "09-04": r"elecci|plebiscito|1970|2022",
    "02-27": r"2010|terremoto|tsunami|maremoto",
}
# Ningun hecho politico de 1970 en adelante (aviso: se juzga a mano).
POLITICO = re.compile(r"\b(19[789]\d|20[0-2]\d)\b.*\b(elecci|plebiscit|presidente|gobierno|golpe|dictadura)", re.I)


def todas_las_fechas():
    return ["%02d-%02d" % (m, d) for m in range(1, 13)
            for d in range(1, calendar.monthrange(2024, m)[1] + 1)]   # 2024 es bisiesto


def main():
    arg = [a for a in sys.argv[1:] if not a.startswith("-")]
    ruta = CARP / arg[0] if arg else CARP / "efemerides.json"
    completo = not arg
    lista = json.load(io.open(ruta, encoding="utf-8"))["efemerides"]
    cat = {x["img"] for x in json.load(io.open(CARP / "imagenes.json", encoding="utf-8"))["imagenes"]}
    err, avi = [], []
    fechas = Counter(e.get("fecha") for e in lista)
    for f, n in fechas.items():
        if n > 1:
            err.append("fecha repetida %s (%d)" % (f, n))
    if completo:
        faltan = sorted(set(todas_las_fechas()) - set(fechas))
        if faltan:
            err.append("faltan %d fechas: %s" % (len(faltan), ", ".join(faltan[:12])))
    for e in lista:
        f, t = e.get("fecha", "?"), e.get("texto", "")
        if f not in todas_las_fechas():
            err.append("%s: fecha invalida" % f)
        if e.get("id") != "efem-" + f:
            err.append("%s: id deberia ser efem-%s" % (f, f))
        if not t.strip():
            err.append("%s: texto vacio" % f)
        if len(t) > LARGO:
            err.append("%s: texto de %d caracteres (max %d)" % (f, len(t), LARGO))
        if EMOJI.search(t):
            err.append("%s: el texto lleva emoji (la voz lo leeria por su nombre)" % f)
        if e.get("img") not in cat:
            err.append("%s: img %r no esta en imagenes.json" % (f, e.get("img")))
        elif not (RAIZ / "assets" / e["img"]).exists():
            err.append("%s: img %r no existe en assets/" % (f, e["img"]))
        if not str(e.get("fuente", "")).startswith("https://"):
            err.append("%s: falta fuente https" % f)
        if e.get("tema") not in TEMAS:
            err.append("%s: tema %r invalido" % (f, e.get("tema")))
        if f in VETOS and re.search(VETOS[f], t, re.I):
            err.append("%s: nombra un hecho vetado ese dia" % f)
        if POLITICO.search(t):
            avi.append("%s: parece politico reciente, revisar: %s" % (f, t))
    orden = sorted(lista, key=lambda e: e.get("fecha", ""))
    for a, b in zip(orden, orden[1:]):
        if a.get("img") == b.get("img"):
            avi.append("%s y %s usan la misma imagen" % (a["fecha"], b["fecha"]))
    for m in range(1, 13):
        del_mes = [e.get("tema") for e in lista if e.get("fecha", "").startswith("%02d-" % m)]
        if del_mes:
            tema, n = Counter(del_mes).most_common(1)[0]
            if n / len(del_mes) > 0.5:
                avi.append("mes %02d: %d de %d son %s" % (m, n, len(del_mes), tema))
    print("%d efemerides · %d errores · %d avisos" % (len(lista), len(err), len(avi)))
    for x in err:
        print("  ERROR ", x)
    for x in avi:
        print("  aviso ", x)
    sys.exit(1 if err else 0)


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Probarlo ROMPIÉNDOLO.** En el scratchpad, un `_tandas/99.json` con: una fecha repetida, un texto de 140 caracteres, un emoji, una img inexistente, sin fuente, y el 09-11 nombrando 1973. Correr `python scripts/validar-efemerides.py _tandas/99.json` → esperado: salida 1 con los seis errores. Borrar el archivo.

### Task 3: El encargo

**Files:** Create `docs/encargo-efemerides.md`

- [ ] **Step 1: Escribirlo** con: público (6 a 14 años, español latino neutro, sin modismos), formato JSON exacto de una entrada, **≤130 caracteres, una o dos frases, el año dentro del texto**, sin emoji, temas permitidos (spec §2), la tabla de fechas vetadas y las reglas generales (nada político desde 1970, terremotos solo como ciencia, guerras solo currículum o feriado sin violencia, feriados religiosos neutros o se cambia), **fuente https obligatoria y verificada en la web** (Wikipedia en español vale para fechas; si dos fuentes discrepan, se elige otro hecho), equilibrio de temas (ninguno sobre la mitad del mes), la imagen elegida del catálogo sin repetir la del día anterior, y **prohibido usar git**. La respuesta final: un renglón de resumen, no la verificación narrada.

### Task 4: Tanda de validación — noviembre

**Files:** Create `contenido/efemerides/_tandas/11.json`

- [ ] **Step 1:** Un agente escribe noviembre (30 entradas, `revisada:false`) leyendo `docs/encargo-efemerides.md` y `contenido/efemerides/imagenes.json`.
- [ ] **Step 2:** `python scripts/validar-efemerides.py _tandas/11.json` → 0 errores.
- [ ] **Step 3: Leer las 30** y comprobar al azar 5 fuentes con WebFetch. Si el encargo falló en algo, se corrige el encargo antes de escalar.

### Task 5: El consolidador

**Files:** Create `scripts/consolidar-efemerides.py`

- [ ] **Step 1: Escribirlo.** Lee todas las `_tandas/*.json`, ordena por fecha, **conserva `revisada:true`** de lo que ya esté en `efemerides.json` para el mismo `id` **si el texto no cambió** (si cambió, vuelve a `false`: la firma ya no le corresponde), recalcula `revisadas` y escribe con `json.dumps(..., ensure_ascii=False, indent=1)`, `newline="\n"`, sin salto final.

```python
import io, json
from pathlib import Path
CARP = Path(__file__).resolve().parent.parent / "contenido" / "efemerides"
CAMPOS = ("id", "fecha", "texto", "img", "tema", "fuente", "revisada")

def main():
    prev = {}
    destino = CARP / "efemerides.json"
    if destino.exists():
        prev = {e["id"]: e for e in json.load(io.open(destino, encoding="utf-8"))["efemerides"]}
    todas = []
    for t in sorted((CARP / "_tandas").glob("*.json")):
        todas += json.load(io.open(t, encoding="utf-8"))["efemerides"]
    todas.sort(key=lambda e: e["fecha"])
    for e in todas:
        p = prev.get(e["id"])
        e["revisada"] = bool(p and p.get("revisada") and p.get("texto") == e["texto"]
                             and p.get("img") == e["img"])
    salida = {"revisadas": sum(e["revisada"] for e in todas),
              "efemerides": [{k: e[k] for k in CAMPOS} for e in todas]}
    io.open(destino, "w", encoding="utf-8", newline="\n").write(
        json.dumps(salida, ensure_ascii=False, indent=1))
    print("%d efemerides, %d revisadas" % (len(todas), salida["revisadas"]))

if __name__ == "__main__":
    main()
```

- [ ] **Step 2:** Correrlo con solo noviembre → `30 efemerides, 0 revisadas`.

### Task 6: El popup en el motor

**Files:** Modify `assets/js/motor.js` (`popupVulpi` ~423; `go()` ~835)

- [ ] **Step 1: `o.img` opcional en `popupVulpi`.** Reemplazar `'<img src="assets/kimun-sorprendido.png" alt="Vulpi">'` por `'<img src="assets/'+(o.img||'kimun-sorprendido.png')+'" alt="'+(o.alt||'Vulpi')+'">'`. Y como una portada es cuadrada y más ancha que Vulpi, sumar al CSS: `#popupDes img.pd-efem{width:150px;border-radius:50%}` y pasar `o.clase` (`'<img class="'+(o.clase||'')+'" …'`).
- [ ] **Step 2: `revisarEfemeride()`**, debajo de `popupDuelo`:

```js
/* ===== La efemeride del dia (Sesion 151) =====
   Un hecho de Chile por dia del ano, con una imagen que ya existe. Prioridad MAS BAJA que el
   desafio del profe y el del duelo: se llama tarde (setTimeout) y, si hay otro popup abierto,
   popupVulpi la hace esperar sin marcarla vista. La clave NO lleva SUFIJO: se ve una vez al
   dia en el aparato, entre todos los cursos. Solo muestra entradas revisada:true. */
const _MESES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
let _EFEM=null;   // promesa: se descarga una sola vez y solo si corresponde mostrar
function revisarEfemeride(){
 if(EFIMERO || SIN_DISCO) return;
 const h=new Date(), hoy=h.getFullYear()+'-'+String(h.getMonth()+1).padStart(2,'0')+'-'+String(h.getDate()).padStart(2,'0');
 try{ if(localStorage.getItem('kimun_efem_pop')===hoy) return; }catch(e){}
 const ov=$('introOv'); if(ov && ov.style.display!=='none' && !ov.hidden) return;   // la intro manda
 if(!_EFEM) _EFEM=fetch('contenido/efemerides/efemerides.json').then(r=>r.ok?r.json():null).catch(()=>null);
 _EFEM.then(d=>{
  if(!d) return;
  const e=(d.efemerides||[]).find(x=>x.fecha===hoy.slice(5) && x.revisada);
  if(!e) return;
  if(!$('scr-rol') || !$('scr-rol').classList.contains('on')) return;   // ya se fue del inicio
  popupVulpi({ clave:'kimun_efem_pop', id:hoy,
   titulo:'📅 Hoy, '+h.getDate()+' de '+_MESES[h.getMonth()],
   texto:escHtml(e.texto), img:e.img, clase:'pd-efem', alt:'',
   boton:'¡Vamos!', jugar:()=>{ try{callarVoz();}catch(x){} } });
  if($('popupDes') && $('popupDes').style.display==='flex' && typeof LEE_SOLO!=='undefined' && LEE_SOLO
     && window.VOZ && VOZ.activo){ try{ leerEnVoz(e.texto); }catch(x){} }
 });
}
```

⚠️ Antes de escribir, comprobar el id real del overlay de la intro (`grep -n "intro" 1ro/index.html`) y reemplazar `introOv` por el que corresponda. Y que la ✕ y el fondo también callen la voz: en `popupVulpi`, `cerrar` llama `try{callarVoz();}catch(e){}` (inocuo para el profe y el duelo).

- [ ] **Step 3: Engancharla** en `go()`: `if(id==='scr-rol'){pintarInicio();revisarDesafio();revisarDuelos();setTimeout(revisarEfemeride,2500);}`.
- [ ] **Step 4: `node --check`** sobre `motor.js` → sin salida.

### Task 7: Verificar el popup (cdp, jugando)

- [ ] **Step 1:** Marcar a mano `revisada:true` en la entrada de HOY de `efemerides.json` (se revierte en el Step 4). Servidor `python -m http.server 8799 --directory .`.
- [ ] **Step 2:** `scripts/cdp.mjs` en 1°, 4° y 6° con `?intro=0`: el popup aparece con título «📅 Hoy, …», imagen cargada (`naturalWidth>0`), texto correcto; «¡Vamos!» cierra; recargar → no vuelve; `localStorage.kimun_efem_pop` = hoy; en 1° y 4° se pide un clip o habla el navegador (espiar `Audio` y `speechSynthesis.speak`), en 6° nada. Captura mirada a 375×667.
- [ ] **Step 3:** `?solo=<demo>`, `?qa=1`, `?armar=1` → sin popup. JSON renombrado → sin popup y cero errores. Con un desafío inyectado (`popupDesafio({desafio_id:'x',asignatura:'HI08'})` antes) → la efeméride espera y no marca el día.
- [ ] **Step 4:** Revertir la marca de prueba (`revisada:false`) y volver a correr el consolidador para que el contador cuadre. Los ocho cursos: `__MOTOR_OK`, JUGADOR navega, cero errores de consola y de red.

### Task 8: Aprobación en el tablero

**Files:** Modify `scripts/generar-tablero.py`, `scripts/aplicar-revisadas.py`

- [ ] **Step 1: Sección en el tablero.** Al final de `generar()`, si existe `contenido/efemerides/efemerides.json`, agregar un `<div class="grupo-tit">📅 Efemérides</div>` y una `<section class="asig" data-pend-preg="0" data-carpeta="efemerides">` con su `<h2>` y, dentro, un bloque con la misma forma de las lecciones (`details.lec`, `.pq-check input data-id data-rev`, botón `.lecs-bulk`) para que «Aprobar todas», el guardado, el contador, el filtro de pendientes y «Exportar revisadas» funcionen sin tocar el JS. Cada fila: miniatura `<img src="../assets/<img>" width=64>`, fecha, texto y fuente como enlace.
- [ ] **Step 2: Mirarlo** en el navegador: la sección aparece arriba con «solo lo pendiente», marcar una sube el contador, «Aprobar todas» marca las 30.
- [ ] **Step 3: `aplicar-revisadas.py`.** Después del bloque de lecciones, el mismo patrón sobre `contenido/efemerides/efemerides.json` (lista `efemerides`), y en `escribir_banco` la lista pasa a `"preguntas" if … else "lecciones" if "lecciones" in d else "efemerides"`.
- [ ] **Step 4: Control positivo.** Un `revisadas.json` de prueba en el scratchpad con dos ids `efem-11-…` → `python scripts/aplicar-revisadas.py <ruta> --seco` las reporta; sin `--seco` las escribe y el diff son 2 marcas + el contador. Revertir con `git checkout -- contenido/efemerides/efemerides.json`… (no está versionado aún: revertir corriendo el consolidador sobre una copia previa guardada en el scratchpad).

### Task 9: La voz (código; la generación espera a Roberto)

**Files:** Modify `scripts/voz_asignaturas.py`, `scripts/generar-voz-nivel.py`, `1ro/2do/3ro/4to/index.html`

- [ ] **Step 1:** En `ASIGS`: `"efem": {"banco": "efemerides", "oa": "EFEM", "caps": "", "juego": "1ro", "efemerides": True},` con un comentario.
- [ ] **Step 2:** En `generar-voz-nivel.py`, `BANCO` y `textos()` con una rama al principio:

```python
if _CFG.get("efemerides"):
    BANCO = RAIZ / "contenido" / "efemerides" / "efemerides.json"
```
```python
def textos():
    if _CFG.get("efemerides"):
        # Solo las APROBADAS: la voz se paga recien cuando Roberto firma el texto.
        d = json.load(io.open(BANCO, encoding="utf-8"))["efemerides"]
        vistos, out = set(), []
        for e in d:
            t = e["texto"].strip()
            if e.get("revisada") and t not in vistos:
                vistos.add(t); out.append((t, _nv.normalizar(t)))
        return out
    ...
```
Revisar también `auditar-voz-nivel.py`: si lee `BANCO["preguntas"]`, que `efem` salga con un mensaje claro en vez de reventar.
- [ ] **Step 3:** `python scripts/generar-voz-nivel.py efem --recuento` → `0` textos (no hay aprobadas). Es gratis.
- [ ] **Step 4:** `'assets/voz/efem/'` al final de `VOZ_DIRS` en los cuatro forks (voz.js tolera el manifiesto ausente: devuelve `{}`). Verificar que los cuatro arrancan sin errores ni 404 nuevos que importen (el 404 del manifiesto inexistente es esperado hasta generar; si aparece en la lista de fallos de red, crear `assets/voz/efem/manifiesto.json` con `{}`).

### Task 10: Los otros once meses

- [ ] **Step 1:** Agentes **de a 2**, cada uno 2 meses (un archivo por mes en `_tandas/`), con el encargo de la Task 3 corregido por lo aprendido en noviembre. Rondas: (12,01) y (02,03) → (04,05) y (06,07) → (08,09) y (10). Antes de relanzar algo, mirar el disco.
- [ ] **Step 2:** Tras cada ronda: `validar-efemerides.py _tandas/<mm>.json` por mes, leer los textos, comprobar 3 fuentes al azar por mes.
- [ ] **Step 3:** Consolidar y validar el completo: `python scripts/validar-efemerides.py` → `366 efemerides · 0 errores`. Revisar los avisos uno por uno.
- [ ] **Step 4:** Regenerar el tablero y comprobar que la sección muestra 366 casillas pendientes.

### Task 11: Cierre

- [ ] Los ocho cursos arrancan, JUGADOR navega, cero errores. Tablero «Generado el» de hoy.
- [ ] **PARADA:** Roberto aprueba en el tablero → `aplicar-revisadas.py` → con su autorización, `generar-voz-nivel.py efem` (~366 clips), `voz-r2.py subir`, `paquetes efem`, `verificar`.
- [ ] **PARADA:** orden 66 (bitácora Sesión 151, `pendiente.md`, commit con `-F`).
