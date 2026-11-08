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
    python scripts/voz-r2.py reemplazar mat4/<hash>.mp3 [...]   # sobrescribe clips puntuales

`reemplazar` existe porque `subir` compara por tamano, y hay UN caso en que eso falla: un
clip regenerado porque cambio la PRONUNCIACION (normalizar-voz-nivel.py) y no el texto en
pantalla. Conserva el nombre —el hash es del texto mostrado— y puede pesar lo mismo, asi que
`subir` lo da por igual y deja el viejo en R2. `verificar` lo caza por MD5. Paso en la
Sesion 145 con mat4/84b1fe20acc896f9.mp3 (el segundo x de "2 x 3 x 4").
Ojo: el CDN y los navegadores pueden seguir sirviendo el audio viejo de esa URL, porque se
publica como immutable; en Cloudflare se purga por URL (Caching > Purge Cache).

NUNCA BORRA, en ningun lado y a proposito: usa `rclone copy`, no `rclone sync`. Un sync
que borra es la forma mas rapida de perder el respaldo. Limpiar clips huerfanos es una
decision aparte, a mano.

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
    # --no-modtime y --no-mimetype NO son opcionales: sin ellos rclone hace un HEAD por
    # cada objeto para leer su fecha y su tipo (~5/s), y con 24.000 clips el listado tarda
    # mas de una hora y parece colgado. Aqui solo hacen falta el nombre y el tamano.
    out = rclone("lsjson", REMOTO, "--recursive", "--files-only", "--fast-list",
                 "--no-modtime", "--no-mimetype", capturar=True)
    return {o["Path"]: o["Size"] for o in json.loads(out or "[]")}


# --size-only NO es opcional en subir/bajar: sin el, rclone compara fechas, y en R2 la fecha
# de cada objeto se pide con un HEAD aparte (~5/s): con 24.000 clips, mas de una hora para
# no copiar nada. Comparar solo el tamano es seguro porque el nombre ES el hash del texto
# (mismo nombre + mismo tamano = mismo clip), y `verificar` compara ademas el MD5 de todos.
def subir():
    rclone("copy", str(VOZ), REMOTO,
           "--include", "*/*.mp3",
           "--header-upload", CACHE,
           "--header-upload", "Content-Type: audio/mpeg",
           "--size-only", "--fast-list",
           "--transfers", "16", "--checkers", "32",
           "--stats", "30s", "--stats-one-line")
    print("Subida terminada. Corre `python scripts/voz-r2.py verificar` para comprobarla.")


def bajar():
    rclone("copy", REMOTO, str(VOZ),
           "--include", "*/*.mp3",
           "--size-only", "--fast-list",
           "--transfers", "16", "--checkers", "32",
           "--stats", "30s", "--stats-one-line")
    print("Bajada terminada. Corre `python scripts/voz-r2.py verificar`.")


def reemplazar(rutas):
    for r in rutas:
        r = r.replace("\\", "/").strip("/")
        if not r.endswith(".mp3") or r.count("/") != 1:
            sys.exit("Ruta invalida (se espera <asig>/<hash>.mp3): %s" % r)
        if not (VOZ / r).exists() or (VOZ / r).stat().st_size == 0:
            sys.exit("No existe en el disco, o pesa 0 bytes: %s" % r)
        # copyto SIN --size-only: sobrescribe aunque el tamano coincida.
        rclone("copyto", str(VOZ / r), REMOTO + "/" + r,
               "--header-upload", CACHE,
               "--header-upload", "Content-Type: audio/mpeg")
        print("reemplazado en R2:", r)


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
    elif cmd == "reemplazar":
        if len(pedidos) < 2:
            sys.exit("Falta la ruta: python scripts/voz-r2.py reemplazar mat4/<hash>.mp3")
        reemplazar(pedidos[1:])
    elif cmd == "verificar":
        verificar(solo_r2="--solo-r2" in sys.argv)
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main()
