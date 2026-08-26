# -*- coding: utf-8 -*-
"""Audita como SUENA cada clip: lo transcribe con el reconocimiento de voz de Azure
y compara con lo que deberia decir.

Por que existe: leer el texto normalizado NO basta. "de 10 en 10" se ve perfecto en
texto y el sintetizador lo lee "10 de ENERO de 10", porque "en" abrevia enero. Ese
defecto solo se ve escuchando, y escuchar 1.987 clips a mano no es viable.

Como compara: el transcriptor escribe los numeros a su manera (pega "9, 12, 15" como
"91215"), asi que comparar textos completos daria puro ruido. Se comparan las PALABRAS:
se reportan las que aparecen en lo que se oyo y no estaban en lo que se pidio. Una
palabra intrusa que se repite —"enero"— delata un patron mal leido.

Uso:
    python scripts/auditar-voz-3ro.py            # audita lo que falte (reanudable)
    python scripts/auditar-voz-3ro.py --informe  # solo el informe de lo ya auditado
"""
import io, os, re, sys, json, subprocess, tempfile, unicodedata, importlib.util
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import requests, imageio_ffmpeg

RAIZ = Path(__file__).resolve().parent.parent
S = RAIZ / "assets" / "voz" / "mat3"
MANIFIESTO = S / "manifiesto.json"
# La transcripcion SI se versiona (son ~120 KB): es la evidencia de como suena cada
# clip, y permite revisar un cambio del banco sin volver a pagar el reconocimiento.
SALIDA = RAIZ / "dev" / "auditoria-voz-3ro.json"
BANCO = RAIZ / "contenido" / "matematicas-3basico" / "preguntas.json"
CAND = [Path.home()/"OneDrive"/"Escritorio"/"azure-tts.txt",
        Path.home()/"OneDrive"/"Desktop"/"azure-tts.txt",
        Path.home()/"Escritorio"/"azure-tts.txt",
        Path.home()/"Desktop"/"azure-tts.txt"]

_spec = importlib.util.spec_from_file_location("nv", str(RAIZ/"scripts"/"normalizar-voz-3ro.py"))
_nv = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(_nv)
FF = imageio_ffmpeg.get_ffmpeg_exe()


def credenciales():
    a = next((c for c in CAND if c.exists()), None)
    if a is None:
        sys.exit("No encuentro azure-tts.txt (ver scripts/generar-voz-3ro.py).")
    L = [l.strip() for l in io.open(a, encoding="utf-8-sig") if l.strip()]
    return L[0], L[1]


def transcribir(mp3, clave, region):
    w = tempfile.mktemp(suffix=".wav")
    subprocess.run([FF, "-y", "-v", "error", "-i", str(mp3),
                    "-ar", "16000", "-ac", "1", "-f", "wav", w], check=True)
    d = open(w, "rb").read(); os.unlink(w)
    url = ("https://%s.stt.speech.microsoft.com/speech/recognition/conversation"
           "/cognitiveservices/v1?language=es-CL" % region)
    for _ in range(3):
        r = requests.post(url, headers={"Ocp-Apim-Subscription-Key": clave,
            "Content-Type": "audio/wav; codecs=audio/pcm; samplerate=16000",
            "Accept": "application/json"}, data=d, timeout=90)
        if r.status_code == 200:
            j = r.json()
            return j.get("DisplayText") or ""
        if r.status_code == 429:
            continue
        return "ERROR %d" % r.status_code
    return "ERROR 429"


def palabras(t):
    t = unicodedata.normalize("NFD", (t or "").lower())
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    return [p for p in re.findall(r"[a-zñ]+", t) if len(p) > 1]


# El transcriptor escribe los numeros con digitos, asi que las palabras-numero que yo
# mando nunca vuelven como palabras: no son intrusas, hay que ignorarlas.
NUMEROS = set(palabras(" ".join(_nv._U) + " " + " ".join(_nv._D.values()) +
                       " " + " ".join(_nv._C.values()) + " cien mil y"))


def main():
    M = json.load(io.open(MANIFIESTO, encoding="utf-8"))
    d = json.load(io.open(BANCO, encoding="utf-8"))["preguntas"]
    oa_de = {}
    for p in d:
        oa_de.setdefault(p["pregunta"].strip(), p["oa"])
        for o in p["opciones"]:
            oa_de.setdefault(str(o).strip(), p["oa"])

    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    hecho = json.load(io.open(SALIDA, encoding="utf-8")) if SALIDA.exists() else {}

    if "--informe" not in sys.argv:
        clave, region = credenciales()
        faltan = [t for t in M if t not in hecho]
        print("clips: %d | ya auditados: %d | faltan: %d" % (len(M), len(hecho), len(faltan)))
        def uno(t):
            return t, transcribir(S / M[t], clave, region)
        with ThreadPoolExecutor(max_workers=6) as ex:
            for i, (t, oido) in enumerate(ex.map(uno, faltan), 1):
                hecho[t] = oido
                if i % 100 == 0 or i == len(faltan):
                    print("  %d/%d" % (i, len(faltan)), flush=True)
                    io.open(SALIDA, "w", encoding="utf-8").write(
                        json.dumps(hecho, ensure_ascii=False, indent=1))
        io.open(SALIDA, "w", encoding="utf-8").write(
            json.dumps(hecho, ensure_ascii=False, indent=1))

    # ---- informe ----
    from collections import Counter
    intrusas = Counter(); ejemplos = {}; errores = 0
    for ve, oido in hecho.items():
        if oido.startswith("ERROR"):
            errores += 1; continue
        dice = _nv.normalizar(ve, oa_de.get(ve.strip(), ""))
        esperadas = set(palabras(dice)) | NUMEROS
        for p in set(palabras(oido)) - esperadas:
            intrusas[p] += 1
            ejemplos.setdefault(p, (ve, oido))
    print("\n=== PALABRAS QUE SE OYERON Y NO SE PIDIERON ===")
    print("(clips con error de transcripcion: %d)" % errores)
    for p, n in intrusas.most_common(30):
        ve, oido = ejemplos[p]
        print("\n  %-14s x%d" % (p, n))
        print("     ve:    %s" % ve[:80])
        print("     suena: %s" % oido[:80])
    if not intrusas:
        print("  ninguna: todo lo que se oye estaba en el texto.")


if __name__ == "__main__":
    main()
