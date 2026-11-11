# Encargo · Efemérides del día

Escribes las efemérides que VULPO muestra en un popup con Vulpi la primera vez que el niño abre el
juego cada día. Una por día del año. Diseño completo en
`docs/superpowers/specs/2026-11-11-efemerides-design.md`.

## Para quién

**Niños chilenos de 6 a 14 años, de 1° a 8° básico, con UN SOLO texto para todos.** De 1° a 4°
la voz de Catalina lo lee en voz alta, así que tiene que entenderse **escuchándolo**.

- Español latino neutro, sin modismos ni voseo.
- **Una o dos frases simples, máximo 130 caracteres.** El año va dentro del texto.
- Tono de dato curioso que invita a saber más, no de enciclopedia. Nada de "¿sabías que…?" en
  todas: varía el comienzo.
- **Sin emoji, sin comillas tipográficas raras, sin abreviaturas** ("Sr.", "aprox.", "km/h"): la
  voz las lee mal. Números de año en cifras; números grandes con palabra si se puede ("más de mil").

## Qué contar: «Chile, de todo un poco»

Historia de Chile, ciencia y naturaleza chilenas (volcanes, fauna, observatorios, la Antártica),
cultura (Mistral, Neruda, Violeta Parra, Víctor Jara solo por su música), deporte, días oficiales
(Día del Libro, de la Tierra, de los Pueblos Indígenas, del Medio Ambiente). Si un día no tiene
nada bueno de Chile, un hito mundial de **ciencia o exploración** (la Luna, una vacuna, un invento).

**Equilibrio por mes:** ningún `tema` en más de la mitad de los días.

**Chile primero, de verdad: al menos 2 de cada 3 días son de Chile** (unos 20 de 30). La tanda
de noviembre salió con 12 de 30 y el resto eran hitos científicos del mundo: correctos, pero no es
lo que se pidió. Lo mundial va solo cuando de verdad no hay algo bueno de Chile ese día. Busca
primero en Chile: nacimientos de chilenos destacados (científicos, escritores, músicos,
deportistas), fundaciones de ciudades, parques nacionales, observatorios, museos, clubes,
universidades, récords y hallazgos (dinosaurios, momias chinchorro), días nacionales.

**Palabras de Chile:** "concientización" (no "concienciación"), "computador", "celular",
"auto", "polera". Si dudas, la forma que usa un profesor chileno.

## Lo que NO va (y es la parte más importante)

**Fechas vetadas: ese día va OTRO hecho, y el texto no nombra ni alude al vetado.**

| Fecha | Lo que NO se nombra |
|---|---|
| 11-09 | 1973, el golpe, Allende, Pinochet, La Moneda |
| 18-10 | 2019, el estallido |
| 29-03 | el Día del Joven Combatiente |
| 05-10, 25-10, 04-09 | plebiscitos y elecciones |
| 27-02 | el terremoto y tsunami de 2010 |

Y en cualquier día:

- **Ningún hecho político de 1970 en adelante** (elecciones, gobiernos, presidentes, conflictos).
- **Terremotos solo como ciencia** (el mayor registrado del mundo, cómo prepararse), sin víctimas
  ni daños.
- **Guerras y batallas solo si son currículum o feriado oficial** (Maipú, Chacabuco, 21 de mayo),
  contadas por lo que significan, sin muertos ni violencia.
- **Feriados religiosos**: con encuadre cultural y neutro, o se elige otro hecho.
- **Nada de sexualidad, drogas, crímenes, accidentes, catástrofes con víctimas ni muertes**
  (ni siquiera "murió X": se usa su nacimiento o una obra).
- Nada que divida a las familias hoy (política, religión, temas en debate).

## La fecha tiene que ser VERDAD

Se escriben 366 fechas y es justo donde la memoria inventa. Por eso:

- **Cada entrada lleva `fuente`: una URL https donde verificaste el día exacto** (Wikipedia en
  español sirve; mejor si es la página del hecho, no una lista de efemérides).
- **Búscalo en la web antes de escribirlo. No escribas de memoria.**
- Si dos fuentes dan días distintos, **elige otro hecho**.
- No inventes detalles que la fuente no dice.

## La imagen

`img` se elige de `contenido/efemerides/imagenes.json` (98 imágenes, cada una con lo que muestra).
**Solo de ahí**. Elige la que mejor calce con el hecho, **no repitas la del día anterior** y
**no uses la misma imagen más de dos veces en el mes**: hay 98, alcanza para variar.
Si ninguna calza bien, una cara de Vulpi (`kimun-sorprendido.png`, `kimun-feliz.png`) es mejor que
una que contradiga el texto.

## Formato

Un archivo por mes: `contenido/efemerides/_tandas/<MM>.json` (`11.json`, `01.json`…), UTF-8,
`indent=1`:

```json
{
 "efemerides": [
  {
   "id": "efem-11-10",
   "fecha": "11-10",
   "texto": "…",
   "img": "portada-hist-cap2.png",
   "tema": "historia",
   "fuente": "https://es.wikipedia.org/wiki/…",
   "revisada": false
  }
 ]
}
```

- `fecha` es `MM-DD`; `id` es `efem-` + la fecha. Todos los días del mes, sin saltarse ninguno
  (febrero incluye el 29).
- `tema`: `historia` · `ciencia` · `naturaleza` · `cultura` · `deporte` · `dia-oficial` · `mundo`.
- `revisada` siempre `false`: la firma la pone Roberto.

## Antes de entregar

1. `python scripts/validar-efemerides.py _tandas/<MM>.json` → **0 errores**. Mira los avisos.
2. Relee cada texto en voz alta en tu cabeza: ¿lo entiende un niño de 7 años escuchándolo?

**Prohibido usar comandos de git** (`git stash`, `checkout`, `reset`, `add`, `commit`…). Solo
escribe tu archivo.

**La respuesta final es un resumen de una o dos líneas** (cuántas, temas, errores del validador,
dudas), no la verificación narrada.
