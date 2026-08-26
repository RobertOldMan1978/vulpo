# Voz pregrabada para 3° básico — Catalina (Azure), con respaldo al navegador

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recomendado) o superpowers:executing-plans para implementar este plan tarea por tarea. Los pasos usan casillas (`- [ ]`).

**Goal:** Que la lectura por voz de `/3ro` suene siempre con una **voz chilena neuronal** (es-CL-CatalinaNeural), en vez de depender de lo que el aparato del niño tenga instalado — que en el PC de Roberto es una voz robótica de España.

**Architecture:** Los audios se generan **una sola vez, en la máquina de Roberto**, con la API de Azure Speech, y quedan versionados en el repo como MP3 livianos. El juego los reproduce desde archivo; si un clip falta o no carga, **cae a la voz del navegador** (lo que hay hoy), así que la función nunca se rompe. Un **manifiesto JSON** dice qué textos tienen audio, para no intentar descargar lo que no existe.

**Tech Stack:** Python 3 + `requests` para llamar a Azure (sin SDK), `imageio-ffmpeg` para comprimir, HTML/JS a mano en `3ro/index.html`. **`juego/index.html` no se toca.**

---

## Decisiones tomadas (con Roberto, 2026-08-25)

| Decisión | Valor | Por qué |
|---|---|---|
| Voz | **es-CL-CatalinaNeural** (Azure) | Roberto comparó Catalina contra tres voces de Piper (mexicana Apache-2.0, argentina, mexicana media) y contra las de Windows. "Sigue siendo mucho mejor Catalina". |
| Motor | **Azure Speech, nivel S0 (pago por uso)** | El uso comercial del audio requiere nivel de pago; el F0 gratuito es para evaluar. **`edge-tts` queda descartado**: da la misma voz gratis, pero sus términos no autorizan claramente redistribuir el audio en un producto que se vende. |
| Costo | **US$0,75** (46.945 caracteres a $16/millón) | Medido sobre el banco real, no estimado. |
| Cuándo suena | **Solo al tocar 🔊** | Decisión de Roberto: no reproducir sola. Una sala con 30 niños y audio automático es un problema. |
| Alcance | Preguntas, opciones, **metas 🎯 y mensajes de resultado** | 1.991 clips. La app queda con voz pareja, no hablando solo en el quiz. |
| Cursos donde vale | **1° a 4° básico** | 1°-2° están aprendiendo a leer y sin voz la pregunta mide lectura, no matemática; 3° es el año bisagra; 4° como apoyo. De 5° hacia arriba es accesibilidad y basta la voz del navegador: **no gastar ahí**. |
| Alcance de hoy | **Solo Matemática 3°** | Es la única asignatura que existe en 3°. Cada asignatura nueva genera su audio al terminarse, como un paso más de su plan. |

**La clave de Azure NUNCA entra al repositorio.** Vive en
`C:\Users\Rodrigo\Escritorio\VULPO - correos profesores\azure-tts.txt` (fuera del repo, que es
público). Al repo llegan solo los MP3.

---

## Estructura de archivos

| Archivo | Responsabilidad | Acción |
|---|---|---|
| `scripts/generar-voz-3ro.py` | Llama a Azure, comprime a 24 kbps y escribe los MP3 + el manifiesto | Crear (Task 1) |
| `assets/voz/mat3/<hash>.mp3` | Un clip por texto único (~1.991, ~20 MB) | Generar (Task 2) |
| `assets/voz/mat3/manifiesto.json` | `{ "<texto>": "<archivo>.mp3" }` — qué textos tienen audio | Generar (Task 2) |
| `3ro/index.html` | Reproductor con respaldo + cableado del botón 🔊 | Modificar (Tasks 3-5) |
| `.gitignore` | Blindaje contra subir la clave por accidente | Modificar (Task 1) |
| `juego/index.html` | — | **No se toca** |

**Por qué el nombre es un hash del texto y no un id de pregunta:** si mañana se corrige la
redacción de una pregunta, su hash cambia y se regenera solo ese clip; y si dos preguntas de OA
distintos comparten una opción ("Cubo", "12"), comparten el archivo sin duplicarlo. Es lo que baja
las 3.168 opciones a 1.140 archivos.

---

## Task 1: Script generador + blindaje de la clave

**Files:**
- Create: `scripts/generar-voz-3ro.py`
- Modify: `.gitignore`

- [ ] **Step 1: Blindar la clave en `.gitignore`**

Agrega al final de `.gitignore`:

```
# Claves de servicios externos: NUNCA al repositorio (es público).
azure-tts.txt
*.key
```

- [ ] **Step 2: Crear el generador**

Crea `scripts/generar-voz-3ro.py` con:

```python
# -*- coding: utf-8 -*-
"""
Genera los audios de la lectura por voz de 3 basico con Azure Speech.

La voz es es-CL-CatalinaNeural (chilena). Se genera UNA VEZ y los MP3 quedan
versionados en el repo; el juego los reproduce desde archivo y cae a la voz del
navegador si falta alguno.

La clave de Azure vive FUERA del repositorio (es publico). Formato del archivo:
    linea 1: la clave
    linea 2: la region (ej. brazilsouth)

Uso:
    python scripts/generar-voz-3ro.py                 # genera lo que falte
    python scripts/generar-voz-3ro.py --recuento      # solo dice cuanto costaria
    python scripts/generar-voz-3ro.py --rehacer       # regenera todo
"""
import json, io, os, re, sys, time, hashlib, subprocess, unicodedata
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
BANCO = RAIZ / "contenido" / "matematicas-3basico" / "preguntas.json"
JUEGO = RAIZ / "3ro" / "index.html"
SALIDA = RAIZ / "assets" / "voz" / "mat3"
MANIFIESTO = SALIDA / "manifiesto.json"
CLAVE_ARCHIVO = Path.home() / "Escritorio" / "VULPO - correos profesores" / "azure-tts.txt"
VOZ = "es-CL-CatalinaNeural"
RITMO = "-10%"          # un poco mas pausado: son ninos de 8 anos
PRECIO_POR_MILLON = 16.0


def credenciales():
    if not CLAVE_ARCHIVO.exists():
        sys.exit("No encuentro la clave en %s\n"
                 "Crea ese archivo con la clave en la linea 1 y la region en la linea 2."
                 % CLAVE_ARCHIVO)
    lineas = [l.strip() for l in io.open(CLAVE_ARCHIVO, encoding="utf-8") if l.strip()]
    if len(lineas) < 2:
        sys.exit("El archivo de la clave necesita 2 lineas: clave y region.")
    return lineas[0], lineas[1]


def nombre(texto):
    """Hash estable del texto -> nombre de archivo."""
    return hashlib.sha1(texto.strip().encode("utf-8")).hexdigest()[:16] + ".mp3"


def textos_del_banco():
    d = json.load(io.open(BANCO, encoding="utf-8"))["preguntas"]
    t = [p["pregunta"] for p in d]
    t += [str(o) for p in d for o in p["opciones"]]
    return t


def textos_de_la_interfaz():
    """Metas de aprendizaje, nombres de etapa y mensajes de resultado."""
    h = io.open(JUEGO, encoding="utf-8").read()
    fuera = []
    ini = h.index("const META_OA=")
    fuera += re.findall(r"'MA03 OA \d\d':'([^']*)'", h[ini:h.index("};", ini)])
    bloque = h[h.index("const EXPEDICIONES="):h.index("const CAMPA\u00d1AS=")]
    fuera += re.findall(r'nombre:"([^"]*)"', bloque)
    fuera += ["\u00a1Nivel superado!", "Casi lo logras", "\u00bfC\u00f3mo te fue?",
              "Lo que vas a aprender", "\u00a1Muy bien!", "Int\u00e9ntalo de nuevo"]
    return fuera


def sintetizar(texto, clave, region):
    import requests
    ssml = (
        '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="es-CL">'
        '<voice name="%s"><prosody rate="%s">%s</prosody></voice></speak>'
        % (VOZ, RITMO, (texto.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")))
    )
    url = "https://%s.tts.speech.microsoft.com/cognitiveservices/v1" % region
    cab = {
        "Ocp-Apim-Subscription-Key": clave,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
        "User-Agent": "vulpo-voz",
    }
    for intento in range(4):
        r = requests.post(url, headers=cab, data=ssml.encode("utf-8"), timeout=45)
        if r.status_code == 200:
            return r.content
        if r.status_code == 429:          # limite de tasa: esperar y reintentar
            time.sleep(2 ** intento)
            continue
        sys.exit("Azure respondio %d: %s" % (r.status_code, r.text[:200]))
    sys.exit("Azure sigue limitando la tasa despues de 4 intentos.")


def ffmpeg():
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


def main():
    solo_contar = "--recuento" in sys.argv
    rehacer = "--rehacer" in sys.argv
    SALIDA.mkdir(parents=True, exist_ok=True)

    vistos, unicos = set(), []
    for t in textos_del_banco() + textos_de_la_interfaz():
        t = (t or "").strip()
        if t and t not in vistos:
            vistos.add(t)
            unicos.append(t)

    manifiesto = {}
    if MANIFIESTO.exists() and not rehacer:
        manifiesto = json.load(io.open(MANIFIESTO, encoding="utf-8"))

    faltan = [t for t in unicos
              if rehacer or t not in manifiesto or not (SALIDA / manifiesto[t]).exists()]
    caracteres = sum(len(t) for t in faltan)
    print("textos unicos: %d | ya generados: %d | faltan: %d"
          % (len(unicos), len(unicos) - len(faltan), len(faltan)))
    print("caracteres a sintetizar: %d  ->  US$%.2f"
          % (caracteres, caracteres / 1_000_000 * PRECIO_POR_MILLON))
    if solo_contar:
        return

    clave, region = credenciales()
    ff = ffmpeg()
    for i, t in enumerate(faltan, 1):
        arch = nombre(t)
        crudo = SALIDA / (arch + ".raw.mp3")
        io.open(crudo, "wb").write(sintetizar(t, clave, region))
        subprocess.run([ff, "-y", "-loglevel", "error", "-i", str(crudo),
                        "-ac", "1", "-ar", "22050", "-b:a", "24k", str(SALIDA / arch)],
                       check=True)
        crudo.unlink()
        manifiesto[t] = arch
        if i % 50 == 0 or i == len(faltan):
            print("  %d/%d" % (i, len(faltan)), flush=True)
            io.open(MANIFIESTO, "w", encoding="utf-8").write(
                json.dumps(manifiesto, ensure_ascii=False, indent=1))

    io.open(MANIFIESTO, "w", encoding="utf-8").write(
        json.dumps(manifiesto, ensure_ascii=False, indent=1))
    peso = sum(f.stat().st_size for f in SALIDA.glob("*.mp3"))
    print("\nListo: %d clips, %.1f MB en %s" % (len(list(SALIDA.glob('*.mp3'))),
                                                peso / 1048576, SALIDA))


if __name__ == "__main__":
    main()
```

- [ ] **Step 3: Comprobar el recuento SIN gastar ni un peso**

Run: `cd /c/Proyectos/kimun && PYTHONIOENCODING=utf-8 python scripts/generar-voz-3ro.py --recuento`

Expected: algo como
```
textos unicos: 1991 | ya generados: 0 | faltan: 1991
caracteres a sintetizar: 46945  ->  US$0.75
```
Si el número de textos únicos se dispara sobre 2.200, algo está mal en la deduplicación:
detente y revisa antes de gastar.

- [ ] **Step 4: Comprobar que la clave no puede colarse al repo**

```bash
cd /c/Proyectos/kimun
echo "clave-de-prueba" > azure-tts.txt
git status --porcelain azure-tts.txt
rm -f azure-tts.txt
```
Expected: **sin salida** (git lo ignora). Si aparece como archivo nuevo, el `.gitignore` no quedó bien.

- [ ] **Step 5: Commit**

```bash
cd /c/Proyectos/kimun
git add scripts/generar-voz-3ro.py .gitignore
git commit -m "3ro: generador de voz pregrabada con Azure (Catalina es-CL) y blindaje de la clave"
```

---

## Task 2: Generar los audios (requiere la clave de Roberto)

**Files:**
- Create: `assets/voz/mat3/*.mp3` y `assets/voz/mat3/manifiesto.json`

> **Esta tarea gasta dinero real** (unos 75 centavos de dólar). No la ejecutes sin que el archivo
> de la clave exista y sin que Roberto haya confirmado que el recuento del Step 3 anterior es el
> esperado.

- [ ] **Step 1: Instalar la dependencia**

Run: `cd /c/Proyectos/kimun && python -m pip install requests imageio-ffmpeg`

- [ ] **Step 2: Generar**

Run: `cd /c/Proyectos/kimun && PYTHONIOENCODING=utf-8 python scripts/generar-voz-3ro.py`

Expected: avanza de 50 en 50 y termina con `Listo: ~1991 clips, ~20 MB`.
Si se corta a mitad, **volver a correrlo continúa donde iba** (el manifiesto se guarda cada 50).

- [ ] **Step 3: Verificar que los clips existen y no están vacíos**

```bash
cd /c/Proyectos/kimun && PYTHONIOENCODING=utf-8 python -c "
import json,io,os
from pathlib import Path
S=Path('assets/voz/mat3')
m=json.load(io.open(S/'manifiesto.json',encoding='utf-8'))
faltan=[t for t,a in m.items() if not (S/a).exists()]
vacios=[a for a in m.values() if (S/a).exists() and (S/a).stat().st_size<500]
print('entradas en el manifiesto:',len(m))
print('archivos faltantes:',len(faltan))
print('archivos sospechosamente chicos (<500 B):',len(vacios))
print('peso total: %.1f MB'%(sum(f.stat().st_size for f in S.glob('*.mp3'))/1048576))
"
```
Expected: `archivos faltantes: 0`, `archivos sospechosamente chicos: 0`.

- [ ] **Step 4: Escuchar tres clips al azar**

Abre tres MP3 cualesquiera de `assets/voz/mat3/` y confirma que se oye la voz de Catalina, sin
cortes ni silencios. Es la única comprobación que ninguna verificación automática reemplaza.

- [ ] **Step 5: Commit**

```bash
cd /c/Proyectos/kimun
git add assets/voz/mat3
git commit -m "3ro: audios de la lectura por voz (Catalina es-CL, 1991 clips)"
```

---

## Task 3: Reproductor de audio pregrabado con respaldo

**Files:**
- Modify: `3ro/index.html` (bloque de lectura por voz, junto a `leerEnVoz`)

- [ ] **Step 1: Cargar el manifiesto al arrancar**

Junto al bloque de voz, agrega:

```javascript
/* Audios pregrabados con la voz chilena (ver scripts/generar-voz-3ro.py).
   El manifiesto dice qué textos tienen clip; lo que no esté, lo lee el navegador. */
const VOZ_BASE='assets/voz/mat3/';
let VOZ_MAP=null;
fetch(VOZ_BASE+'manifiesto.json')
 .then(r=>r.ok?r.json():null)
 .then(m=>{VOZ_MAP=m||{};})
 .catch(()=>{VOZ_MAP={};});   // sin manifiesto se sigue con la voz del navegador
```

- [ ] **Step 2: Reproductor de un clip, con respaldo**

```javascript
let _AUDIO=null;
// Reproduce el clip pregrabado de `texto`. Si no existe o falla, devuelve false
// para que el llamador use la voz del navegador.
function sonarClip(texto,alEmpezar,alTerminar){
 const arch=VOZ_MAP&&VOZ_MAP[(texto||'').trim()];
 if(!arch) return false;
 try{
  const a=new Audio(VOZ_BASE+arch);
  _AUDIO=a;
  a.onplay=()=>{ if(alEmpezar) alEmpezar(); };
  a.onended=()=>{ if(alTerminar) alTerminar(); };
  a.onerror=()=>{ if(alTerminar) alTerminar(); };   // no deja la cadena colgada
  a.play().catch(()=>{ if(alTerminar) alTerminar(); });
  return true;
 }catch(e){ return false; }
}
```

- [ ] **Step 3: Que `callarVoz` también corte el audio**

Reemplaza el cuerpo de `callarVoz` por:

```javascript
function callarVoz(){
 try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){}
 try{ if(_AUDIO){ _AUDIO.pause(); _AUDIO=null; } }catch(e){}
 try{ document.querySelectorAll('.opt.leyendo').forEach(o=>o.classList.remove('leyendo')); }catch(e){}
}
```

- [ ] **Step 4: Commit**

```bash
cd /c/Proyectos/kimun
git add 3ro/index.html
git commit -m "3ro: reproductor de voz pregrabada con respaldo a la voz del navegador"
```

---

## Task 4: Cola de reproducción (pregunta + opciones en orden)

**Files:**
- Modify: `3ro/index.html` (`leerPreguntaEnVoz`)

> El audio pregrabado es **asíncrono de verdad**: hay que encadenar los clips uno tras otro. Con
> `speechSynthesis` bastaba encolar porque el navegador ya serializa; con `Audio` no.

- [ ] **Step 1: Reescribir `leerPreguntaEnVoz` como una cola**

```javascript
let _COLA_ID=0;   // declarado ANTES de usarse: con `let` al revés queda en zona muerta

/* Lee la pregunta y luego las opciones EN EL ORDEN EN QUE SE VEN, iluminando cada
   una mientras suena. Usa el clip pregrabado si existe; si no, la voz del navegador.
   `opciones` debe venir ya barajada, igual que la pantalla.

   NO se dice la letra ("A.", "B.") por dos razones: el clip pregrabado es del texto
   solo —así "6" sirve en cualquier posición y no hay que generar 4 versiones de cada
   opción—, y el resaltado ya muestra de cuál se trata. Si se dijera la letra solo en
   el respaldo, el niño oiría cosas distintas según si el MP3 cargó o no. */
function leerPreguntaEnVoz(pregunta,opciones,contenedor){
 callarVoz();
 const cola=[{txt:pregunta,nodo:null}];
 (opciones||[]).forEach((txt,k)=>cola.push({
   txt:String(txt),
   nodo:contenedor?contenedor.children[k]:null
 }));
 let i=0;
 _COLA_ID++; const miId=_COLA_ID;             // una cola nueva invalida la anterior
 (function siguiente(){
  if(miId!==_COLA_ID || i>=cola.length) return;
  const it=cola[i++];
  const enciende=()=>{ if(it.nodo) it.nodo.classList.add('leyendo'); };
  const apaga=()=>{ if(it.nodo) it.nodo.classList.remove('leyendo'); siguiente(); };
  if(!sonarClip(it.txt, enciende, apaga)) decir(it.txt, enciende, apaga);
 })();
}
```

- [ ] **Step 2: Que `decir` encadene también sin audio pregrabado**

`decir` ya acepta `alTerminar`; confirma que lo llama tanto en `onend` como en `onerror` (ya está
así). Sin eso, un fallo de síntesis dejaría la cola detenida a mitad.

- [ ] **Step 3: Verificar en el navegador que se encadena y no se solapa**

Con `python -m http.server 8765`, abre `http://localhost:8765/3ro/?qa=1`, entra a una etapa y en
la consola:

```javascript
// contar cuántos audios suenan a la vez
let simultaneos=0, maximo=0;
const orig=Audio.prototype.play;
Audio.prototype.play=function(){ simultaneos++; maximo=Math.max(maximo,simultaneos);
  this.addEventListener('ended',()=>simultaneos--); return orig.apply(this,arguments); };
document.getElementById('btnEscuchar').click();
setTimeout(()=>console.log('máximo de audios simultáneos:',maximo),8000);
```
Expected: `máximo de audios simultáneos: 1`. Si sale 2 o más, la cola no está encadenando.

- [ ] **Step 4: Commit**

```bash
cd /c/Proyectos/kimun
git add 3ro/index.html
git commit -m "3ro: cola de lectura encadenada (el audio pregrabado es asincrono, no se solapa)"
```

---

## Task 5: Voz en las metas y en los resultados

**Files:**
- Modify: `3ro/index.html` (pantalla de meta `scr-meta` y pantalla de resultado)

- [ ] **Step 1: Botón 🔊 en la tarjeta de meta**

En el HTML de `scr-meta`, junto al texto de la meta, agrega:

```html
<button class="btn sec" id="btnEscucharMeta" style="margin-top:10px">🔊 Escuchar</button>
```

Y en la función que pinta esa pantalla, cablea:

```javascript
const bm=$('btnEscucharMeta');
if(bm) bm.onclick=()=>{ const t=$('metaTxt')&&$('metaTxt').textContent;
                        callarVoz(); if(!sonarClip(t)) decir(t); };
```

- [ ] **Step 2: Botón 🔊 en la pantalla de resultado**

Igual, con el titular del resultado ("¡Nivel superado!" / el mensaje de reprobado).

- [ ] **Step 3: Verificar**

Abre una etapa: la tarjeta 🎯 debe traer su botón y sonar con la voz chilena; al terminar la
etapa, el resultado también. Consola sin errores.

- [ ] **Step 4: Commit**

```bash
cd /c/Proyectos/kimun
git add 3ro/index.html
git commit -m "3ro: voz tambien en la meta de aprendizaje y en el resultado de la etapa"
```

---

## Task 6: Verificación final y no-regresión

- [ ] **Step 1: El respaldo funciona de verdad**

En la consola, con el juego abierto:
```javascript
VOZ_MAP={};                      // simular que no hay ningún audio pregrabado
document.getElementById('btnEscuchar').click();
```
Expected: se escucha igual, con la voz del navegador. **Esta es la prueba que garantiza que el
juego nunca se queda mudo** si los MP3 no cargan (colegio con internet malo, por ejemplo).

- [ ] **Step 2: La voz sigue leyendo el orden de la pantalla**

Repite la comprobación de la corrección anterior: compara `#qOpts .opt` (lo que se ve) contra los
textos que se mandan a sonar. Deben calzar uno a uno.

- [ ] **Step 3: 8° intacto y nada enlaza a /3ro**

Anota el commit en que empezó este plan (el último antes de la Task 1) y compara contra él:

```bash
cd /c/Proyectos/kimun
INICIO=$(git log --oneline --grep="generador de voz pregrabada" -1 --format=%H)^
git diff --stat $INICIO..HEAD -- juego/ | wc -l                    # esperado: 0
grep -rn "3ro" index.html juego/index.html profesor.html | wc -l   # esperado: 0
```

- [ ] **Step 4: Peso del repositorio**

```bash
cd /c/Proyectos/kimun && du -sh assets/voz && du -sh .
```
Expected: `assets/voz` ~20 MB. Si pasa de 40 MB, algo no se comprimió: revisar antes de commitear.

- [ ] **Step 5: Bitácora y commit final**

Agrega la sesión a `CLAUDE.md`: la voz elegida y por qué, el costo real, que la clave vive fuera
del repo, y que de 5° hacia arriba no conviene pregrabar.

---

## Fuera de este plan

- **Las otras 3 asignaturas de 3°** (Lenguaje, Ciencias, Historia): no existen todavía. Cuando se
  construyan, cada una genera su audio corriendo el mismo script con su banco.
- **1° y 2° básico:** es donde la voz más se necesita, pero esos niveles no existen en VULPO.
- **8° básico:** no tiene lectura por voz ni la necesita. **No generar audio ahí.**
- **Regenerar tras editar contenido:** el script solo sintetiza lo que falta, así que corregir una
  pregunta cuesta un clip nuevo (centésimas de centavo). Conviene correrlo después de cada tanda
  de correcciones del banco.
