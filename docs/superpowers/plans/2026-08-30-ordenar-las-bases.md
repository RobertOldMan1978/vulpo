# Ordenar las bases antes de 4°, 5° y 6°

**Fecha:** 2026-08-30 · **Origen:** auditoría con cuatro agentes (motor, scripts, documentación,
contenido y assets), con cada hallazgo verificado a mano antes de entrar aquí.

**Por qué ahora:** lo que se sume desde mañana se copia tres veces más. Ordenar cuesta una
fracción de lo que cuesta desordenar seis cursos.

---

## Lo que la auditoría midió

| | |
|---|---|
| Líneas de JS duplicadas en los tres forks | **~3.964** (1.982 comunes × 2 copias) |
| Duplicación del JS de 7° | **77,6 %** |
| Funciones **byte a byte idénticas** en los tres | **71** (piso medido, no total) |
| Formatos de serialización distintos entre 16 bancos | **9** |
| Scripts sin una sola referencia viva | **10** de 25 |
| Afirmaciones falsas o contradictorias en documentación viva | **22** |

---

## Bloque 0 · La causa raíz (va primero, es una línea)

**No existe `.gitattributes`.** Por eso conviven LF y CRLF, por eso hay 9 formatos de
serialización, y por eso el 30/08 un solo `\r` suelto hizo que git reportara las 5.400 líneas de
`CLAUDE.md` como cambiadas.

- [ ] Crear `.gitattributes` declarando el fin de línea por tipo de archivo.
- [ ] ⚠️ **La renormalización produce un commit gigante.** Va **sola en su commit**, sin ningún
      otro cambio mezclado, y verificando antes que `git diff --stat` después de normalizar no
      cambie **contenido**, solo saltos de línea.
- [ ] ⚠️ **Cuidado con los tres forks:** la regla del proyecto es preservar CRLF en ellos porque
      compararlos entre sí es la herramienta principal para mantenerlos. Declararlo explícito en
      el archivo.

---

## Bloque 1 · La documentación dice cosas falsas

Los cinco graves —contradicciones en `docs/comercial.md` y `docs/aprobacion-pedagogica.md`
creadas el mismo 30/08 al aprobar 3° y 7°— **ya están corregidos**. Queda:

- [ ] **`CLAUDE.md`, seis puntos concretos:**
  - dice *"ranking (aún simulado)"* en dos lugares; es real desde la Sesión 19, y el propio
    archivo lo contradice más abajo
  - la tabla de banderas dice que 7° no tiene Vocabulario (**lo tiene** desde la Sesión 68) y
    **le falta `HAY_SINFIN`**, que existe en los tres forks
  - dice que el armador ofrece 2 niveles; ofrece **3**
  - dice que `revision.js` está *"en 8° y en 3°"*; está en **los tres**
  - la meta de cobertura por OA aparece como **8** en un lugar y **25** en otro (la real es 8)
  - cinco rutas con el patrón viejo `contenido/<asignatura>/`, que ya no existe
- [ ] **El peso, en cuatro documentos con cuatro cifras distintas.** La correcta es la de
      `pendiente.md`: `assets/` 475 MB, voz 263 MB. Las otras son de antes de la voz del libro.
- [ ] `docs/modulos-transversales.md`: *Cuentos de Ada* figura como sin aprobar.
- [ ] `docs/foto-semanal-aplicar.md`: se contradice a sí mismo sobre si el trabajo está agendado.
- [ ] `docs/contenido-sensible.md`: dice 20 OA sensibles; son **21**, y su propia tabla lista 21.
- [ ] `pendiente.md`: A10 y A14 son la misma tarea con dos estados; "11.078 clips" son 11.077.
- [ ] `README.md`: *"dos cursos más en construcción"*, que contradice a la landing y a sí mismo.

---

## Bloque 2 · Las herramientas

- [ ] **Retirar 10 scripts sin referencia viva:** los 8 procesadores de arte,
      `aplicar-fix-distractores.py` (cableado a un banco, tarea de un día) y
      `generar-pdf-preguntas.py` (superado).
  - [ ] ⚠️ **Antes de borrar, rescatar `quitar_fondo` / `recortar_y_centrar`** a un
        `scripts/procesar-arte.py` que reciba los archivos por argumento. Es lo único reutilizable
        de esos ocho, y un plan vivo todavía apunta a "el patrón de `procesar-lote*.py`".
- [ ] **Salir con error cuando se encuentran errores.** `revisar-tanda.py` y `auditar-numerico.py`
      imprimen los defectos y **salen con 0**, así que un `&&` en una cadena los ignora. Son la
      primera puerta del pipeline y el que caza dos respuestas correctas.
- [ ] **Generalizar lo cableado a 3°**, que es lo que rompe 4°:
  - `normalizar-voz-3ro.py:82` decide si `7:45` es hora mirando códigos **`MA03`**. En 4° no
    empareja, el texto llega crudo a Azure, **el clip se paga, se genera y suena mal**, y nadie se
    entera. También sus números en palabras llegan **solo hasta 1.000**.
  - `generar-voz-3ro.py:36` y `generar-revision-preguntas.py:21` leen `3ro/index.html` **siempre**,
    para cualquier asignatura.
  - `auditar-banco-nivel.py`: `TIPOS` es una copia manual del catálogo de dibujos y `LARGO` solo
    conoce 3° y 4°. Convendría leer el catálogo del juego, como ya hace otro script.
- [ ] ✅ **Hecho el 30/08:** los dos scripts de voz caían **en silencio** a Matemática cuando se
      les pedía una asignatura que no conocían, y al auditor le faltaba `ada3` — o sea que auditar
      el libro habría auditado Matemática y pagado por ello. Ahora mueren con un mensaje.

---

## Bloque 3 · El contrato del contenido, antes de escribir 8.490 preguntas

- [ ] **Fijar la convención de `id` para 4°, 5° y 6°.** Hoy no es derivable: `cie3`/`cie7`/**`cien8`**,
      `mat3`/**`mate7`**, `len3`/**`leng7`**, `voc7`/**`voc`**.
      ⚠️ **NO renombrar los existentes:** las marcas de aprobación del tablero se guardan por id,
      y renombrarlas dejaría huérfanas las 7.685 recién firmadas. Se declara la regla para lo
      nuevo y se documenta por qué los viejos quedan como están.
- [ ] **Un solo formato de `preguntas.json`** (después del Bloque 0). Hoy son 9 variantes de
      indentación, fin de línea y salto final, y un script que escriba con la equivocada
      reformatea el archivo entero — pasó el 30/08 con `aplicar-revisadas.py`.
- [ ] **Un solo contrato de `_pool/`.** Hoy hay tres: `matematicas-3basico` usa un subdirectorio
      `verificado/`, nombres `uN-oaNN` y preguntas **sin `id`**; tres pools traen `revisada` y
      siete no; y **72 de 180 archivos están formateados a mano**.
- [ ] **Decidir la cabecera de `preguntas.json`.** 10 de 16 bancos no tienen la que exige
      `contenido/_plantilla/`, que es el contrato documentado. O se cumplen los 16, o se cambia la
      plantilla — pero no las dos cosas a la vez.

---

## Bloque 4 · El motor (el orden lo fijó la medición)

**Preparación**, que hace idénticas cinco funciones más antes de mover nada:

- [ ] Propagar `visual:q.visual` en los **tres** forks. Es inocuo cuando el campo no existe, y con
      una línea en 8° y otra en 7° las cinco funciones de mapeo pasan a ser idénticas.
- [ ] Definir `window.callarVoz = window.callarVoz || function(){}` para que las tres inserciones
      de 3° dejen de ser divergencia.

**Extracción, de menor a mayor riesgo:**

| # | Módulo | Líneas | Por qué en esa posición |
|---|---|---|---|
| M1 | `visuales.js` | 281 | Función **pura**: recibe un objeto, devuelve SVG. No toca estado ni DOM. Un solo punto de entrada, cero efectos al cargar |
| M2 | `voz.js` | 134 | Igual de aislado, un escalón arriba por sus tres efectos al cargar |
| M4 | `niveles-*.js` | 212 / 249 / 299 | No quita duplicación —los catálogos son distintos por definición— pero es **el paso habilitante**: sin el dato afuera y cargado antes, el motor cae en zona muerta temporal |
| M3a | `jefes.js` | ~180 | 12 de 13 funciones idénticas byte a byte |
| M3b | `duelo.js` | ~240 | 16 de 18 idénticas |
| M3c | `armador.js` | ~143 | Herramienta, no juego: si se rompe no afecta a ningún alumno |
| M3d | `persistencia.js` | ~90 | **Riesgo medio: un error aquí borra partidas guardadas** |
| M3e | `quiz.js` | ~200 | El último, y solo después de la preparación de arriba |

**Trampas que la medición dejó dichas:**

- ⚠️ **`motor.js` no puede ir en el `<head>`.** Hay cientos de `$('id').onclick=` **en el nivel
  superior** del script; hoy funcionan porque va al final del `<body>`. `visuales.js` y `voz.js`
  son los **únicos dos** que no sufren esto.
- ⚠️ **`SUFIJO` no existe en 8°** y es la causa única de tres divergencias. Al extraer algo que
  toque `localStorage`, 8° necesita `const SUFIJO='';`. **No migrar la clave:** `kimun_save` sin
  sufijo es la partida real de todos los alumnos de 8°.
- ⚠️ **Zona muerta temporal**, que ya mató las tres apps dos veces esta semana: las globales son
  `const`/`let`, así que un orden equivocado de `<script>` da `ReferenceError` en el arranque, no
  un `undefined` silencioso.
- ⚠️ **`EXTRAS` referencia banderas declaradas 1.500 líneas más abajo** y hoy no explota solo
  porque están dentro de arrow functions. Al separar el catálogo hay que **preservar esa pereza**.
- ⚠️ Cortar `visuales.js` exactamente donde termina: la línea siguiente es `const $`, que es
  núcleo compartido.
- Un comentario de 3° advierte que `NS` está tomado por el namespace SVG. **Es falso**: no existe
  ningún `const NS` en 3°. Viene copiado de 8°. Es el mismo tipo de candado que la Sesión 65 ya
  desmontó una vez.

---

## Bloque 5 · Bugs vivos encontrados de paso

- [ ] **⚠️ 3° tiene Modo Difícil, y su diseño lo había descartado.** El spec dice *"Sin Modo
      Difícil (los 15 s / 80% no van para 8 años)"* y *"descartado por edad"*, pero el fork lo
      conservó: `renderModoSel` solo mira `S.dificilDesbloqueado`, así que un niño que vence un
      jefe recibe el botón 🔥. **Decisión de Roberto**, no técnica.
      (Comprobado que el cronómetro sí está apagado: el `setInterval` vive dentro del `else` de
      `SIN_RELOJ`, así que no se crea.)
- [ ] **La Maestría Total es inalcanzable en 3°.** `esMaestro()` se copió de 8° y exige
      `S.calc.jefe`, que en 3° **nada escribe** (no hay Reto de Cálculo con jefe). La skin
      "Vulpi Maestro" y el marco dorado del ranking quedan fuera de alcance. 7° ya lo corrigió a
      su manera. Se resuelve junto con la decisión anterior.
      ⚠️ **Arreglar antes de extraer `quiz.js`**, o la extracción congela el bug en código
      compartido.
- [ ] **Cinco assets huérfanos** (~900 KB), verificados con búsqueda exacta: `kimun-cumpleanos.png`,
      `kimun-enojado.png`, `kimun-real.svg`, `kimun.svg` y `kimun-clasico.png` — este último
      además **no está en el catálogo `SKINS`**.

---

## Lo que NO se toca

- **La bitácora de `CLAUDE.md`** y los informes fechados: son registro histórico, no describen el
  presente.
- **Los `oa.json` y `libro.json` formateados a mano** (7 archivos con listas compactadas a
  propósito): ningún script puede reescribirlos sin destruir ese formato. Se documenta y se dejan.
- **Los ids existentes** de las 7.685 preguntas aprobadas.
- **La clave `kimun_save`** de 8°.

---

## Decisiones que son de Roberto

1. **¿Se apaga el Modo Difícil en 3°?** Su diseño lo descartó por edad; el fork lo dejó vivo.
2. **¿`Historia 8°` para todos**, o 8° se queda sin sufijo? (de M4, `niveles.js`)
3. **La cabecera de `preguntas.json`:** ¿se cumplen los 16 bancos, o se cambia la plantilla?
