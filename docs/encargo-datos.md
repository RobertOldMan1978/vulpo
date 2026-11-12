# Encargo · Datos curiosos (el banco de «💡 Otro dato»)

El popup de la efeméride del día tiene un botón **«💡 Otro dato»** que muestra hasta dos datos
más, de temas distintos. Esos datos salen de este banco, **sin fecha**. Diseño:
`docs/superpowers/specs/2026-11-11-datos-extra-design.md`.

**Todo lo de `docs/encargo-efemerides.md` vale aquí igual** —para quién (6 a 14 años, un solo texto,
se escucha de 1° a 4°), largo (máximo 170 caracteres, apunta a 120-150), sin emoji ni
abreviaturas, palabras de Chile, la regla de fondo (**cada dato tiene que ENSEÑAR**: la prueba de
las dos preguntas), las citas (≤ 10 palabras, entre **comillas simples** como en las efemérides —`'Que el verso sea una llave'`—, autor **y** obra, copiadas de una
fuente que las muestre textuales, nunca cortadas donde cambia el sentido), y todo lo que **NO va**
(nada político de 1970 en adelante, terremotos solo como ciencia, nada de muertes, drogas,
sexualidad, crímenes, accidentes con víctimas, marcas, títulos de UN club). **Léelo entero antes
de empezar.** Lo que cambia:

## Sin fecha

- No hay día del año: el dato vale cualquier día. **No empieces con "Un día como hoy" ni "Hoy".**
  Si el hecho tiene año, el año puede ir en el texto, pero no es obligatorio.
- `fuente` es una URL https donde se verifica **lo que dice el texto** (el dato, la cifra, la
  cita). Búscalo en la web; no escribas de memoria. Si dos fuentes no coinciden, elige otro dato.

## Tu tema

Te toca **un tema** y escribes **50 datos** de él. Al menos **2 de cada 3 de Chile**.

| tema | qué va |
|---|---|
| `literatura` | versos y líneas de autores chilenos (con autor y obra), libros, poetas, cuentos, leyendas chilenas |
| `historia` | historia de Chile: pueblos originarios, la Colonia, la Independencia, cómo se vivía antes, inventos y costumbres |
| `ciencia` | científicos chilenos y lo que descubrieron, astronomía (los observatorios), el cuerpo, inventos, cómo funcionan las cosas |
| `naturaleza` | fauna y flora chilenas, volcanes, glaciares, desiertos, la Antártica, el mar, récords naturales |
| `deporte` | deportistas chilenos y sus logros, el origen de deportes, récords, juegos tradicionales chilenos (rayuela, trompo, emboque) |
| `curioso` | datos frikis verificables: el porqué de un nombre, palabras que vienen del mapudungun o el quechua, rarezas, récords insólitos |

**Variedad dentro del tema:** no repitas a la misma persona más de dos veces ni el mismo subtema
cinco veces seguidas.

## No repetir lo que ya está

`contenido/efemerides/efemerides.json` ya tiene 366 hechos aprobados. **Antes de escribir cada
dato, busca ahí** (por el nombre de la persona, el lugar o la cita):

- **Ninguna cita puede estar ya en las efemérides.** Un verso va en un solo lugar de VULPO.
- **El mismo hecho no se repite**: si la efeméride cuenta que Mistral ganó el Nobel, el dato puede
  contar otra cosa de Mistral, no eso.

## La imagen

Igual que en las efemérides: solo de `contenido/efemerides/imagenes.json`, la que mejor calce, y
**ninguna imagen más de 3 veces en tus 50**. Si ninguna calza, una cara de Vulpi
(`kimun-sorprendido.png`, `kimun-feliz.png`).

## Formato

Tu archivo: `contenido/efemerides/_datos/<tema>.json`, UTF-8, `indent=1`:

```json
{
 "datos": [
  {
   "id": "dato-ciencia-01",
   "texto": "…",
   "img": "portada-cie-celula.png",
   "tema": "ciencia",
   "fuente": "https://es.wikipedia.org/wiki/…",
   "revisada": false
  }
 ]
}
```

- `id` = `dato-<tema>-NN` con dos dígitos, del 01 al 50.
- `revisada` siempre `false`: la firma la pone Roberto.
- **Escribe el archivo temprano y ve completándolo** (de a 10): si la sesión se corta, lo escrito
  queda en disco.

## Antes de entregar

1. `python scripts/validar-datos.py _datos/<tema>.json` → **0 errores**. Mira los avisos.
2. Relee cada texto en voz alta en tu cabeza: ¿lo entiende un niño de 7 años escuchándolo?

**Prohibido usar comandos de git** (`git stash`, `checkout`, `reset`, `add`, `commit`…). Solo
escribe tu archivo.

**La respuesta final es un resumen de una o dos líneas** (cuántos, cuántos de Chile, errores del
validador, dudas), no la verificación narrada.
