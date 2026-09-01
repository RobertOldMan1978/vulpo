# Estándar de arte: las portadas de capítulo

**Fijado el 01/09/2026.** Antes de generar arte nuevo, leer esto.

## La regla, en una línea

**Cada capítulo tiene su propia portada.** Es como quedó 8° básico —20 capítulos, 20 imágenes
distintas— y desde ahora vale para todos los cursos.

## Por qué, y no es estético

Un niño de 3° abre Lenguaje y ve **nueve tarjetas idénticas**: la única diferencia entre ellas es
el número y el nombre en letra chica. En 8°, donde cada capítulo tiene su dibujo, reconoce dónde
va de un vistazo. **Es un problema de orientación, no de decoración**, y pesa más donde hay más
capítulos por asignatura (Lenguaje de 3° tiene 9; el de 7°, 7).

## El estándar visual

Sale de las portadas de 8° que ya funcionan (`mate-numeros`, `cien-celula`, `hist-cap2`,
`leng-lectura`):

| | |
|---|---|
| **Composición** | **Viñeta circular** con borde dorado sobre el lienzo cuadrado |
| **Fondo** | Violeta profundo / cósmico, con destellos |
| **Personaje** | **Vulpi de cuerpo entero**, haciendo la actividad del capítulo — no posando |
| **Alrededor** | Objetos temáticos del capítulo flotando en la viñeta |
| **Paleta** | Violeta, dorado y cian — la del juego (`--violet #8f6bff`, `--gold #ffc93c`, `--cyan #4dd8ff`) |
| **Formato** | PNG **512×512**, ~400 KB. Se procesa con `scripts/procesar-arte.py` |
| **Sin texto** | Ni palabras ni letras: el nombre del capítulo lo pone el juego debajo |

> ⚠️ **Nunca pedir texto dentro de la imagen.** En la Sesión 66, dos villanos llegaron con globos
> de diálogo escritos y hubo que regenerarlos. El prompt debe decirlo explícitamente.

### Un solo estilo para los seis cursos

**Decidido el 01/09/2026.** No hay un "estilo infantil" y otro "adolescente": es **el mismo Vulpi
y la misma viñeta de 3° a 8°**, y lo que cambia con la edad es la **densidad de la escena** —menos
objetos alrededor y colores más cálidos en 3° y 4°, más elementos y más contraste hacia 8°—.

Se evaluaron dos cortes por banda etaria (3-4-5 / 6-7-8, y 3-4 / 5-8) y se descartaron por tres
razones:

1. **Una sola identidad de marca es más fuerte** que dos, y `mate-numeros` —Vulpi saltando entre
   números— funciona igual de bien a los 8 que a los 14. Lo que sí se ve "de grandes" en el arte
   actual no son las viñetas sino los **retratos realistas** de las genéricas de asignatura.
2. **Permite reutilizar entre cursos.** Con dos estilos, 20 de las 47 portadas pendientes dejaban
   de servir.
3. **El riesgo es asimétrico:** a los 10-11 años los niños rechazan activamente lo que les parece
   "de guagua", mientras que un niño de 4° con arte algo más grande no se ofende. Infantilizar
   cuesta más caro que lo contrario.

### ⚠️ Tres portadas de 8° están FUERA del estándar

`leng-literarios`, `leng-textos` y `mate-algebra` son **retratos de busto sobre fondo claro**, no
viñetas circulares sobre violeta. Conviven desde que se generaron en lotes distintos.

Importa porque **son de las que se reutilizan**: dejarlas así propaga el estilo ajeno a **8
ubicaciones** (3 de 8°, 3 de 7°, 2 de 3°). **Rehacer esas 3 arregla las 8**, y de paso deja 8°
uniforme.

## Convención de nombres

`assets/portada-<id de la expedición>.png` — el id tal cual aparece en `EXPEDICIONES`.

> ⚠️ **En 3° y 7° la portada se declara EXPLÍCITA** con el campo `portadaMapa:`, no por
> convención implícita. La convención implícita es lo que produce 404 tapados por el `onerror`,
> que se ven bien en pantalla y solo aparecen mirando la red. En 8° se le dio `portadaMapa:`
> explícito a las 15 que tienen arte por la misma razón (Sesión 75).

Excepciones legítimas, ya en uso: `portada-lectura-anafrank.png` y `portada-mate-numeros.png`
(compartida con la lección de su unidad). No se renombran.

## Quién hace qué

| | |
|---|---|
| **Roberto** | Genera las imágenes con IA, a partir de los prompts |
| **El asistente** | Escribe los prompts calibrados al estándar, y **procesa** el resultado con `scripts/procesar-arte.py` (quitar fondo por inundación, recortar, cuadrar, 512 px) |

**El asistente no genera ilustraciones**: no tiene herramienta de imagen. Sí dibuja por código los
apoyos visuales SVG de las preguntas, que son otra cosa.

## Estado al 01/09/2026

| Curso | Capítulos | Con portada propia | Faltan |
|---|---|---|---|
| 8° | 20 | 20 | **0** |
| 7° | 23 | 1 | **22** |
| 3° | 27 | 2 | **25** |

### Reutilizaciones aprobadas (20)

Matemática y Lenguaje son los que más rinden, porque **sus ejes se repiten en todos los cursos**.
Historia no rinde nada: los contenidos son completamente distintos por nivel.

| 7° básico | usa | 3° básico | usa |
|---|---|---|---|
| Números | `mate-numeros` | Números hasta 1.000 | `mate-numeros` |
| Álgebra y proporciones | `mate-algebra` ⚠️ | Geometría | `mate-geometria` |
| Geometría | `mate-geometria` | Datos | `mate-datos` |
| Datos y azar | `mate-datos` | Vida saludable | `cien-cuerpo` |
| La materia y sus cambios | `cien-materia` | Leer y entender | `leng-lectura` |
| Microorganismos y defensas | `cien-celula` | Mundos de cuento | `leng-literarios` ⚠️ |
| Sexualidad y autocuidado | `cien-cuerpo` | Escribir historias | `leng-escritura` |
| Narraciones y héroes | `leng-literarios` ⚠️ | Textos que sirven | `leng-textos` ⚠️ |
| Argumentar y leer los medios | `leng-textos` ⚠️ | Libros y búsqueda | `lectura` |
| Leer para aprender | `leng-lectura` | | |
| Escribir con un propósito | `leng-escritura` | | |

⚠️ = usa una de las tres portadas fuera del estándar.

### Por generar: 30

| | 7° | 3° | |
|---|---|---|---|
| Historia | 6 | 5 | Cero reutilización posible |
| Ciencias | 2 | 3 | |
| Lenguaje | 3 | 5 | |
| Matemática | 0 | 4 | Las cuatro propias de 3° (sumar, multiplicar, fracciones, medir) |
| **Nuevas** | **11** | **16** | = 27 |
| **Rehechas** | | | + 3 (`leng-literarios`, `leng-textos`, `mate-algebra`) |

### Lo que costará terminar la v1

Con 4°, 5° y 6° por venir, y contando la reutilización que este estándar habilita, quedan del
orden de **60 a 70 imágenes más** para los seis cursos completos. Conviene saberlo antes del
cuarto curso, no después.
