# El contrato del contenido

Una asignatura de un nivel es **una carpeta en `contenido/`** con tres cosas: los objetivos,
el banco de preguntas y las tandas crudas de donde salió. Esta carpeta es la plantilla y,
sobre todo, **el contrato**: lo que dice acá es lo que los scripts dan por cierto.

> **Se escribió el 31/08/2026, y no describe un ideal sino lo que ya existe.** El formato es
> exactamente el que produce `scripts/consolidar-pool-nivel.py`, que es la herramienta que crea
> los bancos. Antes esta plantilla documentaba un contrato que **la herramienta real no
> producía** —una cabecera de seis claves que nadie escribía ni leía—, así que ningún banco la
> cumplía y nadie lo notaba.

## Cómo se llama la carpeta

`<asignatura>-<n>basico`, y **el nombre ES la configuración**: de ahí sale el nivel, y de ahí
salen la carpeta del fork y la asignatura en el panel del profesor.

Los **módulos transversales** —el Vocabulario, las lecturas— no llevan nivel en su código de
objetivo (`VOC-CIEN`, `CA-T1`, y no `LE03 OA 01`), y eso es lo que los distingue de una
asignatura del currículum. Ver [`docs/modulos-transversales.md`](../../docs/modulos-transversales.md).

## Los tres archivos

### `oa.json` — los objetivos, transcritos del currículum oficial

Su esquema está en [`docs/esquema-oa-json.md`](../../docs/esquema-oa-json.md) y lo comprueba
`python scripts/validar-oa-json.py`. **Es la fuente de la asignatura y el nivel**: el tablero, el
informe de revisión y el validador los leen de acá y de ningún otro lado.

### `preguntas.json` — el banco

```json
{"revisadas": 30,
 "preguntas": [
  {"oa": "MA05 OA 01",
   "pregunta": "…",
   "opciones": ["…", "…", "…", "…"],
   "correcta": 0,
   "tip": "…",
   "revisada": false,
   "id": "mate5-oa01-1"}
 ]}
```

**Formato canónico, y no es una preferencia: es lo que escribe el consolidador.**

| | |
|---|---|
| Indentación | **1** |
| Salto de línea final | **no** |
| Fin de línea | **LF** (lo fija `.gitattributes`) |
| Acentos | tal cual, sin escapar (`ensure_ascii=False`) |

**La cabecera es mínima a propósito**, porque un dato guardado en dos lugares se contradice:

- **`preguntas`** — obligatoria, y es lo único que necesita el juego.
- **`revisadas`** — opcional. La mantiene sola `aplicar-revisadas.py`; sirve de vistazo.
- **`nota`** — opcional. Texto libre con la procedencia del banco.

Y lo que **NO** va, con su motivo:

- `asignatura` y `nivel` → viven en `oa.json`, que es de donde los lee todo el mundo.
- `total_preguntas` → derivado, y **nadie lo leía**. Medido antes de sacarlo.
- `meta_preguntas_por_oa` → decía **25** en los cinco bancos que lo traían, cuando el valor real
  del proyecto es **8**, que es el que `generar-tablero.py` usa por defecto para los otros once.
  Hoy no cambiaba ningún número —ningún OA de 8° baja de 25 preguntas— pero era una trampa
  puesta para el primer banco de 4°, 5° o 6° con un OA corto: habría medido 80% donde
  corresponde 100%.

### `_pool/` — las tandas crudas

Un archivo **por objetivo**, plano en `_pool/`, con el nombre del objetivo:

```
_pool/oa01.json … _pool/oa26.json
```

Misma forma que el banco (`{"preguntas": […]}`), con la **correcta siempre en la posición 0**:
el consolidador baraja después con semilla fija. Nada de subcarpetas ni de nombres con la
unidad adentro: `matematicas-3basico` usaba `_pool/verificado/u1-oa01.json` y por eso **quedaba
en cero ante el comando estándar** `revisar-tanda.py _pool/*.json`, que es la primera puerta del
pipeline. Se aplanó el 31/08.

## El `id`

`<prefijo>-oa<NN>-<n>`, donde el prefijo son **las 4 primeras letras de la asignatura más el
dígito del nivel**: `hist5`, `mate5`, `cien5`, `leng5`. Sale del nombre de la carpeta.

> ⚠️ **Los bancos ya escritos no se renombran**, y por eso conviven `cie3`/`cie7`/`cien8`,
> `mat3`/`mate7` y `len3`/`leng7`. **Las marcas de aprobación del tablero se guardan por id**,
> así que renombrarlas dejaría huérfanas las 7.805 firmadas.

## Los tres pasos, y las herramientas de cada uno

1. **Escribir las tandas** siguiendo [`docs/encargo-banco.md`](../../docs/encargo-banco.md), que
   fija por nivel la edad, el largo del enunciado, si hay cronómetro, si hay voz y si se usan
   dibujos. Antes de escalar a 25 agentes, **una tanda de validación de 6 objetivos**: un defecto
   del encargo descubierto con 6 tandas cuesta la sexta parte que con 38.
2. **Revisar y consolidar**:
   ```
   python scripts/revisar-tanda.py --largo=<N> contenido/<carpeta>/_pool/*.json
   python scripts/consolidar-pool-nivel.py <carpeta>
   python scripts/auditar-banco-nivel.py <carpeta>
   python scripts/auditar-numerico.py    contenido/<carpeta>/preguntas.json
   python scripts/auditar-solape-oa.py   contenido/<carpeta>/preguntas.json
   ```
   En los niveles con voz, además `scripts/auditar-audible-nivel.py`.
3. **Cablear la expedición** en el `index.html` del curso (`juego/`, `7mo/`, `3ro/`…), dentro del
   arreglo `EXPEDICIONES`. La estructura estándar es **4 etapas + 1 jefe**, cada etapa un OA y el
   jefe mezclando los de la ruta con el campo `oas`. El progreso se guarda por `id` de
   expedición, así que dos rutas nunca se pisan.

## Lo que este contrato NO cubre

- **La aprobación pedagógica.** Las preguntas nacen `revisada: false` y las firma un humano desde
  `dev/tablero.html`. Ver [`docs/aprobacion-pedagogica.md`](../../docs/aprobacion-pedagogica.md).
- **Los `oa.json` formateados a mano** (siete archivos con listas compactadas a propósito).
  Ningún script puede reescribirlos sin destruir ese formato: se documentan y se dejan.
