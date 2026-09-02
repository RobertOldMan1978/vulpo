# Estándar: las fracciones se dibujan apiladas

**Fijado el 02/09/2026.** Vale para los seis cursos y para todos los que vengan.

## La regla, en una línea

**El banco escribe `n/m`; el juego la apila al pintar. El banco no se toca.**

```
                     9        3
   ¿Cuánto es       ──   ÷   ──   ?          en vez de   ¿Cuánto es (9/10) ÷ (3/5)?
                     10       5
```

## Por qué, y no es estético

Un niño aprende la fracción **apilada**: numerador arriba, línea, denominador abajo. Leerla en
línea —`9/10`— le agrega un paso de traducción que la pregunta no quería medir. En Matemática de
7° hay **82 preguntas** con fracciones, en 8° **30** y en 3° **16**; en todas, ese paso extra es
ruido sobre lo que de verdad se está evaluando.

## ⚠️ Se cambia el DIBUJO, nunca el dato

Esta es la parte que hay que respetar al agregar un curso. Tres motivos, y el primero cuesta plata:

1. **La voz pregrabada se indexa por el texto MOSTRADO.** Cambiar el texto del banco dejaría los
   clips huérfanos —suenan como antes, en silencio— y habría que regenerarlos y pagarlos de nuevo.
   Es el *gotcha* de la Sesión 60.
2. **`contenido/` es la capa de datos y esto es presentación.** Un cambio de una capa no toca las
   otras.
3. Las marcas de aprobación son por `id`, así que sobrevivirían igual — pero **el texto que un
   profesor aprobó sigue siendo exactamente el mismo**, que es lo honesto.

## Cómo se escribe en el banco

Está en `docs/encargo-banco.md` §3, y es lo único que hay que decirle a quien escriba preguntas:

| Sí | No |
|---|---|
| `3/4`, `9/10`, `-3/4` | `¾`, `3 sobre 4`, `tres cuartos` (cuando el número **es** el contenido) |
| Solo dígitos arriba y abajo | `x/2` — no se apila |

Los **paréntesis alrededor de una fracción sola sobran**: el juego los quita al apilarla, así que
`(9/10) ÷ (3/5)` y `9/10 ÷ 3/5` se ven igual.

## ⚠️ Lo que NO es una fracción y comparte la forma

Tres casos, y los tres están cubiertos y probados:

| | Qué pasa |
|---|---|
| `PREGUNTA 1/10` (encabezado del quiz) | **No pasa por el módulo**: vive en `#qTag` |
| `1/10` (contador del Reto de Cálculo) | **No pasa**: vive en `#calcNum` |
| `12/05/2020`, `1/2/3` | **El módulo los rechaza**: mira el carácter pegado a cada lado y, si es un dígito o una barra, no apila |
| `2(3/4)` | **No se le quitan los paréntesis**: es una multiplicación, y sin ellos se leería como el número mixto 2¾, que es otro valor |
| `metal/no metal`, un verso con `/` | **No se tocan**: el patrón es solo de dígitos |

> **Ante la duda, el módulo NO apila.** Un falso negativo se ve como antes; un falso positivo
> deforma el dato en pantalla.

## Dónde se aplica

**Los nueve puntos de pintura**, en los tres cursos:

| Archivo | Dónde |
|---|---|
| `assets/js/motor.js` | Quiz (enunciado y opciones), Jefe Final, Duelo local, Duelo en línea, y la explicación al fallar (respuesta correcta + tip) |
| `8vo/index.html` | Reto de Cálculo (enunciado y opciones) y las mini-clases (texto, pie, intro y los pasos del ejemplo resuelto) |

## Para agregar un curso nuevo

Dos líneas en su `index.html`, junto a los otros módulos:

```html
<script src="assets/js/fracciones.js"></script>
<script>if(!window.FRAC)window.FRAC={html:function(t){/* solo escapa */},init:function(){}};</script>
```

Y pintar enunciado, opciones y tip con `FRAC.html()` en vez de `textContent` o `escHtml()`.

⚠️ **El respaldo vacío no es opcional, y tiene que ESCAPAR.** Las opciones se escapan desde el XSS
almacenado de la Sesión 51 —un nombre de rival con `<img onerror>`—, así que un respaldo que
devolviera el texto crudo reabriría ese agujero justo cuando el módulo no cargó. Probado con el
archivo ausente en los tres cursos: el juego sigue, y el escape se mantiene.

⚠️ **Y el módulo se lleva su propio CSS.** Si sus reglas quedaran sueltas en el `<style>` de cada
curso, un curso nuevo cargaría el módulo, generaría el marcado correcto y **no se vería** —el `9` y
el `10` pegados, sin barra— sin ningún error que mirar.
