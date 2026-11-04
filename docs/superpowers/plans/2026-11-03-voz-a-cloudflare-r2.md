# La voz a Cloudflare R2 — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que los 24.250 MP3 de la voz pregrabada se sirvan desde Cloudflare R2 (`voz.vulpo.cl`) en vez de GitHub Pages, sonando exactamente igual que hoy y con el respaldo en tres lugares.

**Architecture:** Los MP3 suben a R2 con la misma ruta relativa (`mat3/<hash>.mp3`). Los manifiestos se quedan en el sitio. `voz.js` reescribe el prefijo `assets/voz/` a `https://voz.vulpo.cl/` al reproducir, y si un clip no carga cae a la voz del navegador. La app Android descarga de la misma dirección. Un script `voz-r2.py` (sobre `rclone`) sube, baja y verifica sin borrar nunca, y el generador y el auditor se niegan a correr si al disco le faltan clips.

**Tech Stack:** Python 3 (scripts), rclone (S3 contra R2), JavaScript del navegador (`assets/js/voz.js`, `voz-descarga.js`), `scripts/cdp.mjs` para verificar.

**Spec:** `docs/superpowers/specs/2026-11-03-voz-a-cloudflare-r2-design.md`

---

## Reglas del proyecto que este plan respeta

- **No se hace commit ni push hasta la "orden 66" de Roberto.** Los pasos dicen "queda para la orden 66" donde normalmente iría un commit. Cuando llegue, el mensaje va en un archivo con `git commit -F`.
- **El repositorio es público:** la clave de R2 nunca entra al repo, ni a un log, ni a la salida de un comando.
- **Finales de línea LF** (`.gitattributes`). Al escribir archivos desde Python, `newline="\n"`.
- **Se aprueba mirando y midiendo, no por el "listo" de un script.** Cada tarea trae su comprobación.

## Estado de partida (ya hecho, Sesión 138)

- Bucket `vulpo-voz` creado (clase Estándar), dominio `voz.vulpo.cl` conectado con TLS 1.2 mínimo, URL `r2.dev` desactivada, sin CORS (no hace falta).
- Token de cuenta "Object Read & Write" **solo sobre `vulpo-voz`**, sin vencimiento, guardado en `C:\Users\Rodrigo\Desktop\r2-vulpo-voz.txt` con tres líneas: `access_key_id=…`, `secret_access_key=…`, `endpoint=https://….r2.cloudflarestorage.com`.
- `https://voz.vulpo.cl/x.mp3` responde 404 (dominio activo, bucket vacío).
- `rclone` **no** está instalado en el PC de casa.

## Mapa de archivos

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `scripts/voz_asignaturas.py` | Modificar | Agrega `clips_faltantes(carpeta)` y `exigir_clips_locales(carpeta)`: la regla compartida "no generar ni auditar si faltan clips en el disco" |
| `scripts/voz-r2.py` | Crear | `subir` / `bajar` / `verificar` contra el bucket, con rclone, sin borrar nunca |
| `scripts/generar-voz-nivel.py` | Modificar | Llama a `exigir_clips_locales` antes de sintetizar; recuerda subir al final; docstring al día |
| `scripts/auditar-voz-nivel.py` | Modificar | Llama a `exigir_clips_locales` antes de transcribir |
| `assets/js/voz.js` | Modificar | `VOZ_ORIGEN`, reescritura de la ruta, respaldo a la voz del navegador si el clip falla |
| `assets/js/voz-descarga.js` | Modificar | `ORIGEN = 'https://voz.vulpo.cl/'` y URL relativa |
| `scripts/armar-webdir.py` | Modificar | Solo el comentario (dónde viven los clips) |
| `.gitignore` | Modificar | `assets/voz/**/*.mp3` y el archivo de la clave de R2 |
| `CLAUDE.md`, `pendiente.md`, `docs/roadmap-tecnico.md` | Modificar | Peso del sitio, cómo se genera y respalda la voz, la orden 99 del otro PC |

---

### Task 1: Instalar rclone y comprobar la clave

**Files:** ninguno del repo.

- [ ] **Step 1: Instalar rclone con winget**

Run (PowerShell):
```powershell
winget install --id Rclone.Rclone -e --accept-source-agreements --accept-package-agreements
```
Expected: `Instalado correctamente` (o "ya está instalado").

- [ ] **Step 2: Ubicar el ejecutable**

winget lo deja bajo `%LOCALAPPDATA%\Microsoft\WinGet\Packages\Rclone.Rclone_*\rclone-*\rclone.exe` y agrega un alias en `%LOCALAPPDATA%\Microsoft\WinGet\Links\rclone.exe`, que puede no estar en el PATH de una sesión ya abierta.

Run (Git Bash):
```bash
ls "$LOCALAPPDATA/Microsoft/WinGet/Links/rclone.exe" 2>/dev/null || ls -d "$LOCALAPPDATA"/Microsoft/WinGet/Packages/Rclone.Rclone_*/rclone-*/rclone.exe
```
Expected: una ruta a `rclone.exe`. `voz-r2.py` (Task 3) la busca solo; este paso es para confirmarla.

- [ ] **Step 3: Comprobar la clave sin mostrarla**

Se prueba en la Task 3, Step 3, con `voz-r2.py verificar --solo-r2` sobre el bucket vacío. No se escribe ninguna configuración de rclone a disco: las credenciales viajan por variables de entorno del proceso hijo.

---

### Task 2: La regla compartida "faltan clips en el disco"

**Files:**
- Modify: `scripts/voz_asignaturas.py` (agregar al final)

- [ ] **Step 1: Escribir la comprobación que debe fallar**

Run:
```bash
cd /f/PROYECTOS/kimun/scripts && python -c "from voz_asignaturas import clips_faltantes; print(clips_faltantes)"
```
Expected: `ImportError: cannot import name 'clips_faltantes'`.

- [ ] **Step 2: Implementar**

Agregar al final de `scripts/voz_asignaturas.py`:

```python


def clips_faltantes(carpeta):
    """Clips que el manifiesto de `carpeta` nombra y NO estan en el disco (o pesan 0).

    Desde que los MP3 viven en Cloudflare R2 (Sesion 138) ya no viajan por git, asi que
    en un PC recien sincronizado pueden faltar. El generador decide que sintetizar
    mirando si el archivo existe: sin esta comprobacion, en ese PC volveria a sintetizar
    -y a PAGAR- toda la voz. Devuelve la lista de nombres de archivo faltantes.
    """
    import io, json
    from pathlib import Path
    carpeta = Path(carpeta)
    man = carpeta / "manifiesto.json"
    if not man.exists():
        return []
    m = json.load(io.open(man, encoding="utf-8"))
    vistos, faltan = set(), []
    for arch in m.values():
        if arch in vistos:
            continue
        vistos.add(arch)
        f = carpeta / arch
        if not f.exists() or f.stat().st_size == 0:
            faltan.append(arch)
    return faltan


def exigir_clips_locales(carpeta):
    """Detiene el script si al disco le faltan clips que el manifiesto dice que existen.

    No hay forma de saltarse esto con una bandera, ni siquiera con --rehacer: el caso que
    protege es justamente el de un PC que todavia no bajo la voz.
    """
    import sys
    faltan = clips_faltantes(carpeta)
    if faltan:
        sys.exit("Faltan %d clips de %s en el disco (los MP3 viven en Cloudflare R2).\n"
                 "Corre primero:  python scripts/voz-r2.py bajar\n"
                 "y despues vuelve a intentarlo. Nada se genero ni se gasto."
                 % (len(faltan), carpeta))
```

- [ ] **Step 3: Comprobar los tres casos**

Run:
```bash
cd /f/PROYECTOS/kimun/scripts && python - <<'EOF'
import tempfile, json, os, io
from pathlib import Path
from voz_asignaturas import clips_faltantes, exigir_clips_locales
d = Path(tempfile.mkdtemp())
io.open(d/"manifiesto.json","w",encoding="utf-8").write(json.dumps({"hola":"a.mp3","chao":"b.mp3","otra vez hola":"a.mp3"}))
(d/"a.mp3").write_bytes(b"x")
assert clips_faltantes(d) == ["b.mp3"], clips_faltantes(d)
(d/"b.mp3").write_bytes(b"")
assert clips_faltantes(d) == ["b.mp3"], "un mp3 de 0 bytes cuenta como faltante"
(d/"b.mp3").write_bytes(b"y")
assert clips_faltantes(d) == []
assert clips_faltantes(Path(tempfile.mkdtemp())) == [], "sin manifiesto no falta nada"
os.remove(d/"a.mp3")
try:
    exigir_clips_locales(d); raise AssertionError("debio detenerse")
except SystemExit as e:
    assert "voz-r2.py bajar" in str(e)
print("OK clips_faltantes y exigir_clips_locales")
EOF
```
Expected: `OK clips_faltantes y exigir_clips_locales`

- [ ] **Step 4: Confirmar que hoy no falta nada en este PC**

Run:
```bash
cd /f/PROYECTOS/kimun/scripts && python -c "
from voz_asignaturas import ASIGS, clips_faltantes
from pathlib import Path
t=0
for a in ASIGS:
    f=clips_faltantes(Path('../assets/voz')/a); t+=len(f); print(a, len(f))
print('TOTAL faltantes', t)"
```
Expected: `TOTAL faltantes 0` (todos los clips de las 11 carpetas están en el disco del PC de casa). Si no da 0, detenerse y averiguar antes de subir nada.

---

### Task 3: `scripts/voz-r2.py`

**Files:**
- Create: `scripts/voz-r2.py`

- [ ] **Step 1: Escribir el script**

```python
# -*- coding: utf-8 -*-
"""Sincroniza la voz pregrabada (los MP3 de assets/voz/) con Cloudflare R2.

Desde la Sesion 138 los MP3 NO viven en el repositorio: el sitio publicado no cabia en
el techo de 1 GB de GitHub Pages con la voz de 1 y 2 basico. Se sirven desde el bucket
`vulpo-voz`, en https://voz.vulpo.cl/<asig>/<hash>.mp3. Los manifiestos SI se quedan en
el repo (son chicos y el juego los pide por fetch). Spec:
docs/superpowers/specs/2026-11-03-voz-a-cloudflare-r2-design.md

Uso:
    python scripts/voz-r2.py subir        # sube los MP3 locales que falten en R2
    python scripts/voz-r2.py bajar        # baja los MP3 de R2 que falten en el disco
    python scripts/voz-r2.py verificar    # cruza manifiestos, disco y R2 (sale 1 si falta algo)
    python scripts/voz-r2.py verificar --solo-r2   # solo cruza manifiestos contra R2

⚠️ NUNCA BORRA, en ningun lado y a proposito: usa `rclone copy`, no `rclone sync`. Un
sync que borra es la forma mas rapida de perder el respaldo. Limpiar clips huerfanos es
una decision aparte, a mano.

La clave vive FUERA del repo (que es publico), en un archivo de texto del escritorio:
    access_key_id=...
    secret_access_key=...
    endpoint=https://<cuenta>.r2.cloudflarestorage.com
Las credenciales viajan por variables de entorno del proceso hijo: rclone no escribe
ninguna configuracion a disco y la clave no aparece en la linea de comandos.
"""
import glob, io, json, os, shutil, subprocess, sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
VOZ = RAIZ / "assets" / "voz"
BUCKET = "vulpo-voz"
REMOTO = "r2:" + BUCKET
# El nombre de cada clip es un hash de su texto: un clip nunca cambia (un texto
# corregido genera OTRO nombre). Por eso el navegador puede guardarlo un ano.
CACHE = "Cache-Control: public, max-age=31536000, immutable"

CLAVE_CANDIDATAS = [
    Path.home() / "Desktop" / "r2-vulpo-voz.txt",
    Path.home() / "Escritorio" / "r2-vulpo-voz.txt",
    Path.home() / "OneDrive" / "Desktop" / "r2-vulpo-voz.txt",
    Path.home() / "OneDrive" / "Escritorio" / "r2-vulpo-voz.txt",
    Path.home() / "Desktop" / "VULPO - correos profesores" / "r2-vulpo-voz.txt",
    Path.home() / "Escritorio" / "VULPO - correos profesores" / "r2-vulpo-voz.txt",
]


def credenciales():
    a = next((c for c in CLAVE_CANDIDATAS if c.exists()), None)
    if a is None:
        sys.exit("No encuentro r2-vulpo-voz.txt en el escritorio (ver el docstring).")
    d = {}
    for l in io.open(a, encoding="utf-8-sig"):
        if "=" in l:
            k, _, v = l.partition("=")
            d[k.strip().lower()] = v.strip()
    for k in ("access_key_id", "secret_access_key", "endpoint"):
        if not d.get(k):
            sys.exit("A %s le falta la linea %s=..." % (a, k))
    return d


def rclone_exe():
    r = shutil.which("rclone")
    if r:
        return r
    loc = os.environ.get("LOCALAPPDATA", "")
    cand = [os.path.join(loc, "Microsoft", "WinGet", "Links", "rclone.exe")]
    cand += glob.glob(os.path.join(loc, "Microsoft", "WinGet", "Packages",
                                   "Rclone.Rclone_*", "rclone-*", "rclone.exe"))
    for c in cand:
        if os.path.exists(c):
            return c
    sys.exit("No encuentro rclone. Instalalo con:  winget install --id Rclone.Rclone -e")


def entorno():
    c = credenciales()
    e = dict(os.environ)
    e.update({
        "RCLONE_CONFIG_R2_TYPE": "s3",
        "RCLONE_CONFIG_R2_PROVIDER": "Cloudflare",
        "RCLONE_CONFIG_R2_ACCESS_KEY_ID": c["access_key_id"],
        "RCLONE_CONFIG_R2_SECRET_ACCESS_KEY": c["secret_access_key"],
        "RCLONE_CONFIG_R2_ENDPOINT": c["endpoint"],
        # El token solo tiene permiso sobre ESTE bucket: no puede listar ni crear buckets.
        "RCLONE_CONFIG_R2_NO_CHECK_BUCKET": "true",
    })
    return e


def rclone(*args, capturar=False):
    cmd = [rclone_exe()] + list(args)
    r = subprocess.run(cmd, env=entorno(), capture_output=capturar, text=True,
                       encoding="utf-8", errors="replace")
    if r.returncode != 0:
        if capturar:
            sys.stderr.write(r.stderr[-2000:])
        sys.exit("rclone fallo (codigo %d) en: rclone %s" % (r.returncode, " ".join(args[:2])))
    return r.stdout if capturar else ""


def esperados():
    """{ 'mat3/<hash>.mp3' } que nombran los manifiestos de assets/voz/*/."""
    s = set()
    for man in sorted(VOZ.glob("*/manifiesto.json")):
        asig = man.parent.name
        for arch in json.load(io.open(man, encoding="utf-8")).values():
            s.add(asig + "/" + arch)
    return s


def en_r2():
    """{ 'mat3/<hash>.mp3': tamano } de lo que hay en el bucket."""
    out = rclone("lsjson", REMOTO, "--recursive", "--files-only", "--fast-list", capturar=True)
    return {o["Path"]: o["Size"] for o in json.loads(out or "[]")}


def subir():
    rclone("copy", str(VOZ), REMOTO,
           "--include", "*/*.mp3",
           "--header-upload", CACHE,
           "--header-upload", "Content-Type: audio/mpeg",
           "--transfers", "16", "--checkers", "32",
           "--stats", "30s", "--stats-one-line")
    print("Subida terminada. Corre `python scripts/voz-r2.py verificar` para comprobarla.")


def bajar():
    rclone("copy", REMOTO, str(VOZ),
           "--include", "*/*.mp3",
           "--transfers", "16", "--checkers", "32",
           "--stats", "30s", "--stats-one-line")
    print("Bajada terminada. Corre `python scripts/voz-r2.py verificar`.")


def verificar(solo_r2=False):
    esp = esperados()
    remoto = en_r2()
    problemas = 0
    faltan_r2 = sorted(p for p in esp if p not in remoto)
    vacios_r2 = sorted(p for p in esp if remoto.get(p) == 0)
    print("clips en los manifiestos: %d | objetos en R2: %d" % (len(esp), len(remoto)))
    print("faltan en R2: %d | de 0 bytes en R2: %d" % (len(faltan_r2), len(vacios_r2)))
    problemas += len(faltan_r2) + len(vacios_r2)
    if not solo_r2:
        faltan_disco = sorted(p for p in esp if not (VOZ / p).exists())
        distintos = sorted(p for p in esp if (VOZ / p).exists() and p in remoto
                           and (VOZ / p).stat().st_size != remoto[p])
        print("faltan en el disco: %d | tamano distinto disco/R2: %d"
              % (len(faltan_disco), len(distintos)))
        problemas += len(faltan_disco) + len(distintos)
        if not faltan_disco and not faltan_r2:
            # Comparacion de contenido (MD5) de cada clip del disco contra R2.
            # --one-way: solo que lo local este igual en R2; R2 puede tener de mas.
            print("comparando contenido (md5)...", flush=True)
            rclone("check", str(VOZ), REMOTO, "--include", "*/*.mp3", "--one-way",
                   "--checkers", "32")
            print("contenido identico en el disco y en R2")
        for p in (faltan_disco + distintos)[:10]:
            print("   ", p)
    for p in (faltan_r2 + vacios_r2)[:10]:
        print("   ", p)
    if problemas:
        sys.exit("VERIFICACION FALLIDA: %d problemas" % problemas)
    print("VERIFICACION OK")


def main():
    pedidos = [a for a in sys.argv[1:] if not a.startswith("-")]
    cmd = pedidos[0] if pedidos else ""
    if cmd == "subir":
        subir()
    elif cmd == "bajar":
        bajar()
    elif cmd == "verificar":
        verificar(solo_r2="--solo-r2" in sys.argv)
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Sin subcomando, muestra la ayuda y sale con 1**

Run: `cd /f/PROYECTOS/kimun && python scripts/voz-r2.py; echo "salida=$?"`
Expected: imprime el docstring y `salida=1`.

- [ ] **Step 3: Probar la clave contra el bucket vacío**

Run: `cd /f/PROYECTOS/kimun && python scripts/voz-r2.py verificar --solo-r2; echo "salida=$?"`
Expected:
```
clips en los manifiestos: 24250 | objetos en R2: 0
faltan en R2: 24250 | de 0 bytes en R2: 0
...
VERIFICACION FALLIDA: 24250 problemas
salida=1
```
Esto prueba que la clave funciona (rclone listó el bucket) y que `verificar` detecta lo que falta. Si rclone falla con 403, la clave o el endpoint están mal: revisar el archivo **sin imprimir el secreto**.

---

### Task 4: Subir los 603 MB y verificar

**Files:** ninguno.

- [ ] **Step 1: Subir**

Run (en segundo plano; tarda del orden de 10-30 minutos según la conexión):
```bash
cd /f/PROYECTOS/kimun && python scripts/voz-r2.py subir
```
Expected: termina con `Subida terminada.`

- [ ] **Step 2: Verificar todo**

Run: `cd /f/PROYECTOS/kimun && python scripts/voz-r2.py verificar; echo "salida=$?"`
Expected:
```
clips en los manifiestos: 24250 | objetos en R2: 24250 (o más)
faltan en R2: 0 | de 0 bytes en R2: 0
faltan en el disco: 0 | tamano distinto disco/R2: 0
comparando contenido (md5)...
contenido identico en el disco y en R2
VERIFICACION OK
salida=0
```

- [ ] **Step 3: Comprobar un clip por la dirección pública, con sus cabeceras**

Run:
```bash
cd /f/PROYECTOS/kimun && P=$(python -c "import json;m=json.load(open('assets/voz/mat3/manifiesto.json',encoding='utf-8'));print('mat3/'+next(iter(m.values())))") && curl -sSI "https://voz.vulpo.cl/$P" | grep -iE "^HTTP|content-type|content-length|cache-control" && ls -l "assets/voz/$P" | awk '{print "disco:", $5}'
```
Expected: `HTTP/2 200`, `content-type: audio/mpeg`, `cache-control: public, max-age=31536000, immutable`, y `content-length` igual al tamaño en disco.

---

### Task 5: `voz.js` pide a R2 y cae a la voz del navegador si un clip falla

**Files:**
- Modify: `assets/js/voz.js` (bloque de `sonarClip`, líneas ~62-89)

- [ ] **Step 1: Medir el comportamiento actual (la prueba que debe fallar)**

Crear `C:\Users\Rodrigo\AppData\Local\Temp\claude\f--PROYECTOS-kimun\8715e8f2-370f-4dfa-802f-1e14ea1a7f33\scratchpad\voz-r2.mjs`:

```js
export default async (ev) => {
  await ev.movil(390, 844);
  await ev.ir('http://localhost:8799/3ro/?intro=0');
  await ev.espera(4000);
  const r = await ev(`(async () => {
    const urls = []; const dichos = [];
    const A = window.Audio;
    window.Audio = function(u){ urls.push(u); const a = new A(u); return a; };
    window.speechSynthesis.speak = (u) => { dichos.push(u.text); };
    const t = Object.keys(VOZ_MAP || {})[0];
    if (!t) return { error: 'sin VOZ_MAP' };
    sonarClip(t);
    // Clip que no existe en el servidor: debe caer a la voz del navegador.
    const malo = 'zzz-texto-de-prueba';
    VOZ_MAP[malo] = 'assets/voz/mat3/no-existe-0000.mp3';
    sonarClip(malo);
    await new Promise(r => setTimeout(r, 4000));
    return { urls, dichos, origen: typeof VOZ_ORIGEN === 'string' ? VOZ_ORIGEN : null };
  })()`);
  console.log(JSON.stringify(r, null, 1));
  console.log('consola:', JSON.stringify(ev.consola));
};
```

Run:
```bash
cd /f/PROYECTOS/kimun && (python -m http.server 8799 --directory . >/dev/null 2>&1 &) && node scripts/cdp.mjs about:blank "C:/Users/Rodrigo/AppData/Local/Temp/claude/f--PROYECTOS-kimun/8715e8f2-370f-4dfa-802f-1e14ea1a7f33/scratchpad/voz-r2.mjs"
```
Expected (ANTES del cambio): `urls` empiezan con `assets/voz/…`, `origen: null` y `dichos: []`. El clip malo **no** se lee: hoy queda mudo.

- [ ] **Step 2: Implementar**

En `assets/js/voz.js`, reemplazar desde la línea `let VOZ_MAP=null;` hasta el cierre de `sonarClip` (la línea `}catch(e){ return false; }` seguida de `}`) por:

```js
let VOZ_MAP=null;
let _AUDIO=null;
/* Los MP3 viven en Cloudflare R2 desde la Sesión 138, no en el sitio: con la voz de 1° y
   2° el sitio no cabía en el techo de 1 GB de GitHub Pages. Los MANIFIESTOS siguen en
   assets/voz/<asig>/ (el juego los pide con fetch al mismo dominio), y las rutas que
   traen se reescriben aquí. Un <audio> reproduce desde otro dominio sin CORS.
   Spec: docs/superpowers/specs/2026-11-03-voz-a-cloudflare-r2-design.md */
var VOZ_ORIGEN='https://voz.vulpo.cl/';
/* Reproduce el clip pregrabado de `texto`. Devuelve false si no existe, para que el
   llamador caiga a la voz del navegador. `alTerminar` se llama también al fallar: sin
   eso, un clip roto dejaría la cadena de lectura colgada a mitad. */
function sonarClip(texto,alEmpezar,alTerminar){
 const t=(texto||'').trim();
 let arch=VOZ_MAP&&VOZ_MAP[t];
 if(!arch) return false;
 // En la app Android la voz vive DESCARGADA en el teléfono. El arranque de la app fija
 // window.VOZ_LOCAL_BASE tras bajar el paquete del curso, y esa carpeta MANDA. En la web
 // queda sin definir y la ruta apunta a R2.
 if(window.VOZ_LOCAL_BASE){ arch = arch.replace(/^\/?assets\/voz\//, window.VOZ_LOCAL_BASE); }
 else { arch = arch.replace(/^\/?assets\/voz\//, VOZ_ORIGEN); }
 try{
  const a=new Audio(arch);   // `arch` ya viene con su carpeta
  _AUDIO=a;
  let empezo=false, cerrado=false;
  /* Si el clip no carga (servidor caído, internet malo del colegio), ese texto NO queda
     mudo: lo lee la voz del navegador, igual que un texto sin clip. ⚠️ Solo si este audio
     sigue siendo el vigente: callarVoz() lo pausa y lo suelta (_AUDIO=null), y esa pausa
     TAMBIÉN rechaza play(). Sin el control `_AUDIO===a`, mandar callar haría hablar al
     navegador. Y solo si no alcanzó a sonar: un corte a mitad no repite la frase. */
  const fallar=()=>{
   if(cerrado) return; cerrado=true;
   if(_AUDIO===a && !empezo){ _AUDIO=null; decir(t,alEmpezar,alTerminar); }
   else if(alTerminar) alTerminar();
  };
  a.onplay=()=>{ empezo=true; if(alEmpezar) alEmpezar(); };
  a.onended=()=>{ if(cerrado) return; cerrado=true; if(alTerminar) alTerminar(); };
  a.onerror=fallar;
  a.play().catch(fallar);
  return true;
 }catch(e){ return false; }
}
```

- [ ] **Step 3: Sintaxis**

Run: `cd /f/PROYECTOS/kimun && node --check assets/js/voz.js && echo SINTAXIS_OK`
Expected: `SINTAXIS_OK`

- [ ] **Step 4: Repetir la medición del Step 1**

Expected (DESPUÉS):
- `origen: "https://voz.vulpo.cl/"`
- la primera URL empieza con `https://voz.vulpo.cl/` (la de un clip real).
- `dichos` contiene `"zzz-texto-de-prueba"`: el clip que no existe se leyó con la voz del navegador.
- ⚠️ En Chrome headless el autoplay puede rechazar `play()` también para el clip real, y entonces su texto aparece en `dichos`. Es la política de autoplay del conductor, no un defecto. La comprobación de que el clip real **existe** es la del Step 5.
- `consola` sin errores.

- [ ] **Step 5: El clip que el juego pide responde desde R2**

Run:
```bash
cd /f/PROYECTOS/kimun && for a in mat3 hist3 cie3 len3 ada3 voc3 mat4 hist4 cie4 leng4 voc4; do P=$(python -c "import json,sys;m=json.load(open('assets/voz/$a/manifiesto.json',encoding='utf-8'));print(list(m.values())[-1])"); echo "$a $(curl -s -o /dev/null -w '%{http_code} %{content_type}' https://voz.vulpo.cl/$a/$P)"; done
```
Expected: las 11 carpetas con `200 audio/mpeg`.

- [ ] **Step 6: Callar no hace hablar al navegador**

Agregar al final de la función del script de verificación (antes del `console.log` final) y repetir la corrida:

```js
  const r2 = await ev(`(async () => {
    const dichos = [];
    window.speechSynthesis.speak = (u) => { dichos.push(u.text); };
    const t = Object.keys(VOZ_MAP)[1];
    sonarClip(t); callarVoz();
    await new Promise(r => setTimeout(r, 2000));
    return { dichosTrasCallar: dichos };
  })()`);
  console.log('callar:', JSON.stringify(r2));
```
Expected: `callar: {"dichosTrasCallar":[]}`.

- [ ] **Step 7: Regresión de los seis cursos**

Run: el script de regresión habitual (JUGADOR navega en 3°, 4°, 5°, 6°, 7° y 8°, `__MOTOR_OK` en true, cero errores de consola y cero 404). En 7° y 8° la voz no se toca (no tienen `VOZ_DIRS`).
Expected: los seis navegan; en 3° y 4° el 🔊 de una pregunta pide `https://voz.vulpo.cl/…`.

- [ ] **Step 8: Queda para la orden 66.**

---

### Task 6: La app Android descarga de `voz.vulpo.cl`

**Files:**
- Modify: `assets/js/voz-descarga.js:3-10` y la línea del `downloadFile`
- Modify: `scripts/armar-webdir.py` (comentario de las líneas 15-17)

- [ ] **Step 1: Cambiar el origen**

En `assets/js/voz-descarga.js`, reemplazar:
```js
   Descarga la voz Catalina del curso (los clips, uno a uno, desde vulpo.cl con la
```
por:
```js
   Descarga la voz Catalina del curso (los clips, uno a uno, desde voz.vulpo.cl —Cloudflare
   R2 desde la Sesion 138— con la
```
y:
```js
  var ORIGEN = 'https://vulpo.cl/';   // los clips ya estan hospedados aca
```
por:
```js
  // Los MP3 viven en Cloudflare R2 (Sesion 138), con la misma ruta relativa que en
  // assets/voz/: <asig>/<hash>.mp3. Las apps instaladas antes de este cambio pedian a
  // vulpo.cl/assets/voz/, que deja de servir los MP3 cuando salen del repo.
  var ORIGEN = 'https://voz.vulpo.cl/';
```
y en el worker:
```js
          await FS.downloadFile({ url: ORIGEN + p.replace(/^\//, ''), path: base + '/' + rel(p), directory: DIR });
```
por:
```js
          await FS.downloadFile({ url: ORIGEN + rel(p), path: base + '/' + rel(p), directory: DIR });
```

- [ ] **Step 2: Sintaxis y que en la web siga sin hacer nada**

Run: `cd /f/PROYECTOS/kimun && node --check assets/js/voz-descarga.js && grep -n "ORIGEN" assets/js/voz-descarga.js`
Expected: sin error, y las dos apariciones de `ORIGEN` con `voz.vulpo.cl`. En la web `init` sigue retornando de inmediato (`nativo()` es null), sin cambios.

- [ ] **Step 3: Comentario de `armar-webdir.py`**

En `scripts/armar-webdir.py`, en el comentario de la línea ~15, reemplazar `(pesan ~580 MB; la app los descarga y cachea, ver spec §3).` por `(pesan ~600 MB; viven en Cloudflare R2 desde la Sesion 138 y la app los descarga de voz.vulpo.cl y los cachea).`

- [ ] **Step 4: Queda para la orden 66.**

---

### Task 7: El generador y el auditor se niegan a correr si faltan clips

**Files:**
- Modify: `scripts/generar-voz-nivel.py` (docstring y `main`)
- Modify: `scripts/auditar-voz-nivel.py` (import y antes de transcribir)

- [ ] **Step 1: Generador**

En `scripts/generar-voz-nivel.py`:

1. En el docstring, reemplazar:
```
La voz es es-CL-CatalinaNeural (chilena). Se genera UNA VEZ y los MP3 quedan
versionados en el repo; el juego los reproduce desde archivo y cae a la voz del
navegador si falta alguno.
```
por:
```
La voz es es-CL-CatalinaNeural (chilena). Se genera UNA VEZ. Desde la Sesion 138 los
MP3 NO van al repo: viven en Cloudflare R2 (voz.vulpo.cl) y en el disco de cada PC.
El manifiesto si se versiona. Despues de generar hay que SUBIR:
    python scripts/voz-r2.py subir
y en un PC recien sincronizado, BAJAR antes de generar (el script se niega si faltan).
```

2. Cambiar la línea del import:
```python
from voz_asignaturas import ASIGS, elegir   # catalogo unico; ver ese archivo
```
por:
```python
from voz_asignaturas import ASIGS, elegir, exigir_clips_locales   # catalogo unico
```

3. En `main()`, justo después de `unicos = textos()`, agregar:
```python
    # Sin los MP3 en el disco, el calculo de "faltan" de abajo creeria que hay que
    # sintetizar TODO y lo volveria a pagar (Sesion 138). Va antes de --probar y de
    # --rehacer: no hay bandera que lo salte.
    exigir_clips_locales(SALIDA)
```

4. Al final de `main()`, después del `print("\nListo: ...")`, agregar:
```python
    if faltan:
        print("Ahora sube los clips nuevos a R2:  python scripts/voz-r2.py subir")
```

- [ ] **Step 2: Auditor**

En `scripts/auditar-voz-nivel.py`:

1. Cambiar `from voz_asignaturas import ASIGS, elegir` por `from voz_asignaturas import ASIGS, elegir, exigir_clips_locales`.
2. Justo antes de la línea `if "--informe" not in sys.argv:`, agregar:
```python
    # Transcribe los MP3 del disco: sin ellos fallaria a mitad o auditaria de menos.
    if "--informe" not in sys.argv:
        exigir_clips_locales(S)
```

- [ ] **Step 3: Con todo en el disco, el recuento sigue igual (no gasta)**

Run: `cd /f/PROYECTOS/kimun && python scripts/generar-voz-nivel.py mat3 --recuento`
Expected: `faltan: 0` y `(recuento: no se genero nada ni se uso la clave)`.

- [ ] **Step 4: Con un clip apartado, se detiene sin gastar**

Run:
```bash
cd /f/PROYECTOS/kimun && P=$(python -c "import json;m=json.load(open('assets/voz/voc3/manifiesto.json',encoding='utf-8'));print(list(m.values())[0])") && mv "assets/voz/voc3/$P" "$TEMP/$P" && python scripts/generar-voz-nivel.py voc3 --recuento; echo "salida=$?"; python scripts/auditar-voz-nivel.py voc3; echo "salida=$?"; mv "$TEMP/$P" "assets/voz/voc3/$P" && python scripts/generar-voz-nivel.py voc3 --recuento | tail -2
```
Expected: las dos primeras corridas imprimen `Faltan 1 clips de …voc3 en el disco … voz-r2.py bajar` y `salida=1`; tras restaurar, `faltan: 0`. **No se llamó a Azure en ningún momento** (el guard corre antes de pedir la clave).

- [ ] **Step 5: Queda para la orden 66.**

---

### Task 8: Publicar el código (orden 66)

Precondición: Task 4 con `VERIFICACION OK` y Tasks 5-7 hechas. **Los MP3 siguen en el repo y en el sitio**: este push solo cambia de dónde los pide el juego, así que se puede deshacer revirtiendo `voz.js`.

- [ ] **Step 1:** Cuando Roberto dé la orden 66: bitácora en `CLAUDE.md`, commit con `git commit -F` y push.
- [ ] **Step 2: Verificar en vivo** (tras ~2 minutos de despliegue): `curl -s https://vulpo.cl/assets/js/voz.js | grep -c "voz.vulpo.cl"` da `1` o más, y en `vulpo.cl/3ro/` el 🔊 de una pregunta pide `https://voz.vulpo.cl/…` (espiando `Audio` con `cdp.mjs`, igual que en la Task 5).

---

### Task 9: App nueva en Google Play (Roberto + Claude)

- [ ] **Step 1:** En GitHub → Actions → **App Bundle de Release** → *Run workflow* sobre `main`. Esperar el ✅.
- [ ] **Step 2:** Bajar el `.aab` del artefacto y subirlo a la **prueba interna** en Play Console.
- [ ] **Step 3:** En el teléfono, actualizar la app, **borrar sus datos** (para que vuelva a descargar la voz) y entrar a 3°: la barra *"Preparando la voz…"* llega a *"Voz lista"* y el 🔊 suena con Catalina.

---

### Task 10: Sacar los MP3 del repositorio

Precondición: Tasks 8 y 9 verificadas.

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Ignorar los MP3 y la clave**

Agregar al final de `.gitignore`:
```
# La voz pregrabada vive en Cloudflare R2 desde la Sesion 138 (voz.vulpo.cl). Los
# MANIFIESTOS si se versionan; los MP3 no. Ver scripts/voz-r2.py.
assets/voz/**/*.mp3
# La clave de R2 vive en el escritorio, pero por si alguien la copia al repo.
r2-vulpo-voz.txt
```

- [ ] **Step 2: Sacarlos del índice SIN borrarlos del disco**

Run:
```bash
cd /f/PROYECTOS/kimun && git rm -r --cached -q 'assets/voz/*.mp3' && git status --short | grep -c "^D " && ls assets/voz/mat3/*.mp3 | wc -l
```
Expected: `24250` líneas `D` en el índice, y los MP3 de `mat3` **siguen en el disco** (el `ls` da su cantidad, no 0). `git ls-files 'assets/voz/*manifiesto.json' | wc -l` sigue dando `11`.

- [ ] **Step 3: El generador y `verificar` siguen viendo todo**

Run: `cd /f/PROYECTOS/kimun && python scripts/voz-r2.py verificar && python scripts/generar-voz-nivel.py mat4 --recuento | tail -2`
Expected: `VERIFICACION OK` y `faltan: 0`.

- [ ] **Step 4: Orden 66 de este cambio**, con un aviso explícito a Roberto (Task 11) en el mismo mensaje.

- [ ] **Step 5: Verificar en vivo:** `curl -s -o /dev/null -w "%{http_code}" https://vulpo.cl/assets/voz/mat3/<un clip>.mp3` da `404`, y en `vulpo.cl/3ro/` la voz sigue sonando desde `voz.vulpo.cl`. Medir de nuevo el peso publicado (archivos versionados sin `assets/originales/`): del orden de **100 MB**.

---

### Task 11: El otro PC (Roberto)

⚠️ **Al hacer `git pull` después de la Task 10, git BORRA los MP3 del disco de ese PC**, porque eran archivos versionados que dejaron de estarlo. No se pierde nada (están en R2 y en el PC de casa), pero hasta que corra `bajar` ese PC no tiene la voz, y el generador se niega a correr.

- [ ] **Step 1:** En el PC de la oficina: `git pull` (orden 99).
- [ ] **Step 2:** `winget install --id Rclone.Rclone -e`, y copiar `r2-vulpo-voz.txt` a su escritorio (no por el repo).
- [ ] **Step 3:** `python scripts/voz-r2.py bajar` y después `python scripts/voz-r2.py verificar` → `VERIFICACION OK`. Ese es el tercer lugar del respaldo.

---

### Task 12: Documentación

**Files:**
- Modify: `CLAUDE.md` — la tabla "El peso, medido hoy" (con la medición nueva y en bytes reales), la regla de voz ("ya no es la única aritmética que cabe": el techo deja de aplicarle a la voz), la nota de la voz pregrabada de los gotchas de 3° (los clips se suben con `voz-r2.py subir`), y en la orden 99 que un PC recién sincronizado corre `voz-r2.py bajar`.
- Modify: `pendiente.md` — la cifra de peso y el estado de este proyecto.
- Modify: `docs/roadmap-tecnico.md` — la cifra de peso; la precarga `cache-first` de la PWA sigue siendo inviable por tamaño, pero ahora la voz además está en otro origen.

- [ ] **Step 1:** Hacer los tres cambios con las cifras medidas en la Task 10, Step 5 (no las estimadas).
- [ ] **Step 2:** Queda para la orden 66 de la Task 10.
