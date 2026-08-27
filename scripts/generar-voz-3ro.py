# -*- coding: utf-8 -*-
"""
Genera los audios de la lectura por voz de 3 basico con Azure Speech.

La voz es es-CL-CatalinaNeural (chilena). Se genera UNA VEZ y los MP3 quedan
versionados en el repo; el juego los reproduce desde archivo y cae a la voz del
navegador si falta alguno.

El texto se pasa antes por scripts/normalizar-voz-3ro.py, porque el sintetizador
no sabe matematica: leeria "18 : 6" como "dieciocho dos puntos seis".

La clave de Azure vive FUERA del repositorio, que es publico. Formato del archivo:
    linea 1: la clave (KEY 1)
    linea 2: la region (por ejemplo brazilsouth)

Hay una carpeta de clips por asignatura (mat3, hist3). El primer argumento elige
cual; sin argumento, mat3. Separarlas evita volver a pagar lo ya generado al agregar
una asignatura nueva.

Uso:
    python scripts/generar-voz-3ro.py --recuento         # cuanto costaria (no gasta ni pide clave)
    python scripts/generar-voz-3ro.py --probar           # UN clip, para validar clave y region
    python scripts/generar-voz-3ro.py                    # genera lo que falte de mat3
    python scripts/generar-voz-3ro.py hist3              # genera lo que falte de Historia
    python scripts/generar-voz-3ro.py hist3 --recuento
    python scripts/generar-voz-3ro.py --rehacer          # regenera todo

OJO al cambiar scripts/normalizar-voz-3ro.py: el manifiesto se indexa por el texto
MOSTRADO, asi que cambiar como se PRONUNCIA algo no invalida ningun clip y los viejos
quedan sonando como antes, en silencio. Hay que borrarlos a mano del manifiesto.
"""
import json, io, re, sys, time, hashlib, importlib.util
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
JUEGO = RAIZ / "3ro" / "index.html"

# Una carpeta de clips por asignatura. Separarlas no es cosmetico: agregar una
# asignatura nueva NO obliga a regenerar las anteriores, y regenerar una no arriesga
# las otras. El juego carga los dos manifiestos y los fusiona.
ASIGS = {
    "mat3":  {"banco": "matematicas-3basico", "oa": "MA03", "caps": "mat3-"},
    "hist3": {"banco": "historia-3basico",    "oa": "HI03", "caps": "hist3-"},
}
ASIG = "mat3"
for _a in sys.argv[1:]:
    if _a in ASIGS:
        ASIG = _a
_CFG = ASIGS[ASIG]
BANCO = RAIZ / "contenido" / _CFG["banco"] / "preguntas.json"
SALIDA = RAIZ / "assets" / "voz" / ASIG
MANIFIESTO = SALIDA / "manifiesto.json"
# La clave puede estar en varios lugares: el escritorio de Windows se llama "Desktop"
# en disco aunque se muestre como "Escritorio", y con OneDrive activo vive dentro de
# OneDrive. Se prueban todos en vez de exigir una ruta unica.
CLAVE_CANDIDATAS = [
    Path.home() / "OneDrive" / "Escritorio" / "azure-tts.txt",
    Path.home() / "OneDrive" / "Desktop" / "azure-tts.txt",
    Path.home() / "Escritorio" / "azure-tts.txt",
    Path.home() / "Desktop" / "azure-tts.txt",
    Path.home() / "OneDrive" / "Escritorio" / "VULPO - correos profesores" / "azure-tts.txt",
    Path.home() / "Desktop" / "VULPO - correos profesores" / "azure-tts.txt",
    Path.home() / "Escritorio" / "VULPO - correos profesores" / "azure-tts.txt",
]
VOZ = "es-CL-CatalinaNeural"
# Un 10% mas lento que el habla normal. Roberto comparo las dos velocidades con la
# misma frase y prefirio esta: son ninos de 8 anos que recien decodifican, y medio
# segundo por pregunta les da tiempo a seguir.
RITMO = "-10%"
PRECIO_POR_MILLON = 16.0

_spec = importlib.util.spec_from_file_location("nv", str(RAIZ / "scripts" / "normalizar-voz-3ro.py"))
_nv = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_nv)


def credenciales():
    archivo = next((c for c in CLAVE_CANDIDATAS if c.exists()), None)
    if archivo is None:
        sys.exit("No encuentro azure-tts.txt. Lo busque en:\n  %s\n\n"
                 "Crea ese archivo con DOS lineas:\n"
                 "  linea 1: la clave (KEY 1 del recurso de Azure)\n"
                 "  linea 2: la region (por ejemplo brazilsouth)"
                 % "\n  ".join(str(c) for c in CLAVE_CANDIDATAS))
    # utf-8-sig: el Bloc de notas de Windows suele dejar un BOM al principio
    lineas = [l.strip() for l in io.open(archivo, encoding="utf-8-sig") if l.strip()]
    if len(lineas) < 2:
        sys.exit("El archivo de la clave necesita 2 lineas: clave y region.")
    return lineas[0], lineas[1]


def nombre(texto):
    """Hash estable del texto MOSTRADO -> nombre de archivo."""
    return hashlib.sha1(texto.strip().encode("utf-8")).hexdigest()[:16] + ".mp3"


def textos():
    """Devuelve [(texto mostrado, texto a pronunciar)] sin repetir."""
    d = json.load(io.open(BANCO, encoding="utf-8"))["preguntas"]
    pares = []
    for p in d:
        pares.append((p["pregunta"], _nv.normalizar(p["pregunta"], p["oa"])))
        for o in p["opciones"]:
            pares.append((str(o), _nv.normalizar(str(o), p["oa"])))

    h = io.open(JUEGO, encoding="utf-8").read()
    ini = h.index("const META_OA=")
    for m in re.findall(r"'%s OA \d\d':'([^']*)'" % _CFG["oa"], h[ini:h.index("};", ini)]):
        pares.append((m, _nv.normalizar(m)))
    # Los nombres de etapa llevan emoji decorativo, y el sintetizador los lee por su
    # nombre Unicode: "⚡ JEFE" sonaba "ALTO VOLTAJE jefe". Aqui el emoji no aporta
    # nada hablado (es adorno de pantalla), asi que se quita antes de sintetizar.
    adorno = re.compile("[\U0001F300-\U0001FAFF☀-➿⬀-⯿️⚡]")
    bloque = h[h.index("const EXPEDICIONES="):h.index("const CAMPAÑAS=")]
    # Las expediciones de las DOS asignaturas viven en el mismo arreglo, asi que hay
    # que quedarse solo con las de esta: si no, generar Historia volveria a pagar
    # todos los nombres de etapa de Matematica.
    for trozo in bloque.split("id:'")[1:]:
        if not trozo.startswith(_CFG["caps"]):
            continue
        for m in re.findall(r'nombre:"([^"]*)"', trozo):
            limpio = adorno.sub("", m).strip()
            pares.append((m, _nv.normalizar(limpio)))
    for m in ["¡Nivel superado!", "¿Cómo te fue?", "Lo que vas a aprender",
              "¡Muy bien!", "Inténtalo de nuevo", "Casi lo logras"]:
        pares.append((m, m))

    vistos, unicos = set(), []
    for ve, dice in pares:
        ve = (ve or "").strip()
        if ve and ve not in vistos:
            vistos.add(ve)
            unicos.append((ve, dice))
    return unicos


def sintetizar(texto, clave, region):
    import requests
    esc = texto.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    ssml = ('<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="es-CL">'
            '<voice name="%s"><prosody rate="%s">%s</prosody></voice></speak>' % (VOZ, RITMO, esc))
    url = "https://%s.tts.speech.microsoft.com/cognitiveservices/v1" % region
    cab = {"Ocp-Apim-Subscription-Key": clave,
           "Content-Type": "application/ssml+xml",
           "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
           "User-Agent": "vulpo-voz"}
    for intento in range(4):
        r = requests.post(url, headers=cab, data=ssml.encode("utf-8"), timeout=45)
        if r.status_code == 200:
            return r.content
        if r.status_code == 429:
            time.sleep(2 ** intento)
            continue
        if r.status_code == 401:
            sys.exit("Azure rechazo la clave (401). Revisa la KEY 1 del recurso.")
        if r.status_code == 403:
            sys.exit("Azure respondio 403. Suele ser la region equivocada: la del\n"
                     "archivo debe ser la misma del recurso (brazilsouth, eastus...).")
        sys.exit("Azure respondio %d: %s" % (r.status_code, r.text[:300]))
    sys.exit("Azure sigue limitando la tasa (429) despues de 4 intentos.")


# NO se recomprime. Azure entrega mp3 mono de 48 kbps a 24 kHz, y esa es la calidad
# que Roberto eligio al comparar: recomprimir a 24 kbps ahorraba la mitad del peso
# pero dejaba la voz metalica. El costo de conservarla son 39 MB en el repositorio
# y 78 KB por pregunta para el nino, que en un celular no se notan.


def main():
    SALIDA.mkdir(parents=True, exist_ok=True)
    unicos = textos()

    if "--probar" in sys.argv:
        clave, region = credenciales()
        prueba = "Hola, soy Vulpi. Vamos a contar de diez en diez."
        io.open(SALIDA / "_prueba.mp3", "wb").write(sintetizar(prueba, clave, region))
        print("OK: clave y region funcionan.")
        print("Escucha %s y confirma que es la voz de Catalina." % (SALIDA / "_prueba.mp3"))
        return

    manifiesto = {}
    if MANIFIESTO.exists() and "--rehacer" not in sys.argv:
        manifiesto = json.load(io.open(MANIFIESTO, encoding="utf-8"))

    faltan = [(ve, dice) for ve, dice in unicos
              if "--rehacer" in sys.argv or ve not in manifiesto
              or not (SALIDA / manifiesto[ve]).exists()]
    caracteres = sum(len(d) for _, d in faltan)
    print("textos unicos: %d | ya generados: %d | faltan: %d"
          % (len(unicos), len(unicos) - len(faltan), len(faltan)))
    print("caracteres a sintetizar: %d  ->  US$%.2f"
          % (caracteres, caracteres / 1_000_000 * PRECIO_POR_MILLON))
    if "--recuento" in sys.argv:
        print("\n(recuento: no se genero nada ni se uso la clave)")
        return

    clave, region = credenciales()
    for i, (ve, dice) in enumerate(faltan, 1):
        arch = nombre(ve)
        io.open(SALIDA / arch, "wb").write(sintetizar(dice, clave, region))
        manifiesto[ve] = arch
        if i % 50 == 0 or i == len(faltan):
            print("  %d/%d" % (i, len(faltan)), flush=True)
            io.open(MANIFIESTO, "w", encoding="utf-8").write(
                json.dumps(manifiesto, ensure_ascii=False, indent=1))

    io.open(MANIFIESTO, "w", encoding="utf-8").write(
        json.dumps(manifiesto, ensure_ascii=False, indent=1))
    clips = list(SALIDA.glob("*.mp3"))
    peso = sum(f.stat().st_size for f in clips)
    print("\nListo: %d clips, %.1f MB en %s" % (len(clips), peso / 1048576, SALIDA))


if __name__ == "__main__":
    main()
