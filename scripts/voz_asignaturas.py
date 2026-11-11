# -*- coding: utf-8 -*-
"""Catalogo unico de las asignaturas que tienen voz pregrabada.

Existe porque esta tabla estuvo DUPLICADA a mano entre el generador y el auditor, y se
desincronizo dos veces: primero le falto `ada3` -pedirle esa asignatura al auditor
auditaba Matematica en silencio, pisando evidencia ya pagada- y despues `voc3`, que
quedo directamente inauditable. Es el mismo defecto de lista paralela que este proyecto
ya pago en la Sesion 37 y en la 58.

Cada entrada declara:
    banco  carpeta de `contenido/` con su preguntas.json
    oa     prefijo del codigo de objetivo, para filtrar META_OA
    caps   prefijo del id de sus expediciones, para filtrar los nombres de etapa
    juego  carpeta del fork del nivel, de donde se leen META_OA y los nombres

`juego` va EXPLICITO y no deducido del sufijo: los forks se llaman `juego/`, `7mo/` y
`3ro/`, que no salen de "mat3" por ninguna regla.

Voz solo de 1 a 4 basico: de 5 hacia arriba el nino ya lee de corrido y no vale la pena
pagarla. Ademas es la unica aritmetica que cabe bajo el techo de 1 GB de GitHub Pages.
"""

ASIGS = {
    "mat3":  {"banco": "matematicas-3basico",    "oa": "MA03", "caps": "mat3-",           "juego": "3ro"},
    "hist3": {"banco": "historia-3basico",       "oa": "HI03", "caps": "hist3-",          "juego": "3ro"},
    "cie3":  {"banco": "ciencias-3basico",       "oa": "CN03", "caps": "cie3-",           "juego": "3ro"},
    "len3":  {"banco": "lenguaje-3basico",       "oa": "LE03", "caps": "len3-",           "juego": "3ro"},
    # Los modulos transversales entran por la misma puerta. Su codigo NO lleva el nivel
    # adentro (CA-T1, no LE03 OA 01), asi que el filtro de META_OA no encuentra nada y
    # esta bien: el libro no tiene metas de aprendizaje, y lo que se lee en su tarjeta
    # es el nombre del tramo, que si viaja por "caps".
    "ada3":  {"banco": "lectura-cuentos-de-ada", "oa": "CA",   "caps": "lect-cuentos-ada", "juego": "3ro"},
    # Vocabulario de 3: sus codigos son VOC-CIEN y VOC-HIST, sin nivel adentro, igual que
    # el libro. Su expedicion en el juego es voc-general.
    "voc3":  {"banco": "vocabulario-3basico",    "oa": "VOC",  "caps": "voc-general",     "juego": "3ro"},
    # 4 basico. Los cuatro "caps" se escribieron por extrapolacion cuando el fork "4to/"
    # todavia no existia, y quedaron VERIFICADOS contra el archivo real el 07/09/2026:
    # sus capitulos son mate4-capN, cie4-capN, hist4-capN y leng4-capN. La duda estaba
    # en Ciencias -sus preguntas son "cien4-" pero el capitulo podia ser "cie4-", como
    # en 5 y 6- y el fork confirmo "cie4-".
    "mat4":  {"banco": "matematicas-4basico",    "oa": "MA04", "caps": "mate4-",          "juego": "4to"},
    "hist4": {"banco": "historia-4basico",       "oa": "HI04", "caps": "hist4-",          "juego": "4to"},
    "cie4":  {"banco": "ciencias-4basico",       "oa": "CN04", "caps": "cie4-",           "juego": "4to"},
    "leng4": {"banco": "lenguaje-4basico",       "oa": "LE04", "caps": "leng4-",          "juego": "4to"},
    # Vocabulario de 4, igual que el de 3: codigos VOC-CIEN y VOC-HIST, sin nivel adentro,
    # y su expedicion en el juego es voc-general. El prefijo "VOC" no filtra ningun
    # META_OA y esta bien: un modulo transversal no tiene metas de aprendizaje.
    "voc4":  {"banco": "vocabulario-4basico",    "oa": "VOC",  "caps": "voc-general",     "juego": "4to"},
    # 2 y 1 basico (06/11/2026). Sus "caps" se comprobaron contra los forks antes de
    # agregarlos: 2do/ tiene mate2-, cie2-, hist2- y leng2-, y 1ro/ tiene mate1-, cie1-,
    # hist1- y leng1-. Las carpetas de voz (mat2, len2...) son las que el comentario
    # PLACEHOLDER de VOZ_DIRS de cada fork ya anunciaba.
    # Desde la Sesion 138 sus MP3 NO viajan por git: nacen fuera del repo (.gitignore) y
    # se suben a Cloudflare R2 con scripts/voz-r2.py.
    "mat2":  {"banco": "matematicas-2basico",    "oa": "MA02", "caps": "mate2-",          "juego": "2do"},
    "hist2": {"banco": "historia-2basico",       "oa": "HI02", "caps": "hist2-",          "juego": "2do"},
    "cie2":  {"banco": "ciencias-2basico",       "oa": "CN02", "caps": "cie2-",           "juego": "2do"},
    "len2":  {"banco": "lenguaje-2basico",       "oa": "LE02", "caps": "leng2-",          "juego": "2do"},
    "voc2":  {"banco": "vocabulario-2basico",    "oa": "VOC",  "caps": "voc-general",     "juego": "2do"},
    "mat1":  {"banco": "matematicas-1basico",    "oa": "MA01", "caps": "mate1-",          "juego": "1ro"},
    "hist1": {"banco": "historia-1basico",       "oa": "HI01", "caps": "hist1-",          "juego": "1ro"},
    "cie1":  {"banco": "ciencias-1basico",       "oa": "CN01", "caps": "cie1-",           "juego": "1ro"},
    "len1":  {"banco": "lenguaje-1basico",       "oa": "LE01", "caps": "leng1-",          "juego": "1ro"},
    "voc1":  {"banco": "vocabulario-1basico",    "oa": "VOC",  "caps": "voc-general",     "juego": "1ro"},
    # La efemeride del dia (Sesion 151): no es un banco de preguntas sino
    # contenido/efemerides/efemerides.json, y se locuta SOLO lo aprobado (revisada:true):
    # la voz se paga recien cuando Roberto firma el texto. La cargan los forks de 1° a 4°
    # en VOZ_DIRS. "juego" no se usa (no hay metas ni nombres de etapa que leer).
    "efem":  {"banco": "efemerides",             "oa": "EFEM", "caps": "",                "juego": "1ro",
              "efemerides": True},
}


def elegir(argv, por_defecto="mat3"):
    """Devuelve la asignatura pedida en la linea de comandos.

    Con un argumento que NO sea una asignatura conocida, MUERE en vez de caer a la de
    por defecto: el fallback callado generaba -y con --rehacer volvia a PAGAR- la
    asignatura equivocada sin decir nada.
    """
    import sys
    pedidas = [a for a in argv if not a.startswith("-")]
    malas = [a for a in pedidas if a not in ASIGS]
    if malas:
        sys.exit("No conozco la asignatura %s. Las que hay: %s"
                 % (", ".join(malas), ", ".join(sorted(ASIGS))))
    return pedidas[0] if pedidas else por_defecto


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
