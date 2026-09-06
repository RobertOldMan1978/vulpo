# Prompts de arte de 4° básico — HECHO (06/09/2026)

> **Qué es esto.** El arte que necesitaba 4° básico para dejar de usar el genérico prestado, ya
> **generado, procesado y cableado**. Se aplicó el mismo método que en 5°/6°
> (`docs/estandar-arte-portadas.md`): buscar por TEMA, no por número de capítulo, entre TODAS las
> portadas ya generadas del proyecto.
>
> **Resultado: 0 portadas nuevas.** El fork `4to/index.html` (construido el 06/09/2026) terminó
> con **26 capítulos** —siguiendo la regla de "4 OA por capítulo, jefe al final" que ya usan 5° y
> 6°, en vez del reparto de 23 capítulos por tema que se había propuesto antes de construirlo—.
> **24 de los 26 reutilizan una portada existente** (Parte 0); los otros 2 (`hist4-cap3` y
> `leng4-cap9`) caen al fallback genérico de su asignatura porque no hay ninguna portada existente
> que calce por tema.
>
> **Los 4 villanos —también hechos el 06/09/2026.** Las 8 imágenes (normal + derrotada) llegaron
> en dos formatos distintos y ninguno le calzaba al pipeline de arte tal cual: ver el detalle en
> `pendiente.md`, punto B3. Quedaron cableadas en los 4 `jefeFinal` de `4to/index.html`,
> verificado jugando: los 4 abren su intro con la imagen real.

---

## PARTE 0 · El reparto en capítulos, YA CABLEADO en `4to/index.html`

Esto ya no es propuesta: es lo que el fork tiene hoy. Si algún capítulo cambia de nombre o de OA
más adelante, actualizar esta tabla junto con el código.

### Matemática (27 OA → 7 capítulos)

| Capítulo | OA | Portada | De |
|---|---|---|---|
| `mate4-cap1` Números hasta 10.000 | MA04 OA01–04 | `portada-mate-numeros.png` | 8°/7°/3°/5°/6° |
| `mate4-cap2` Multiplicar y dividir | MA04 OA05–08 | `portada-mat3-cap3.png` ("Multiplicar y dividir") | 3° |
| `mate4-cap3` Fracciones y decimales | MA04 OA09–12 | `portada-mate6-cap2.png` ("Fracciones y decimales") | 6° — coincidencia exacta |
| `mate4-cap4` Patrones, mapas y figuras 3D | MA04 OA13–16 | `portada-mate-geometria.png` | 8°/7°/3° |
| `mate4-cap5` Simetría y ángulos | MA04 OA17–19 | `portada-mate6-cap5.png` ("Ángulos") | 6° — coincidencia exacta |
| `mate4-cap6` Medir tiempo y longitud | MA04 OA20–23 | `portada-mate6-cap6.png` ("Medición") | 6° — coincidencia exacta |
| `mate4-cap7` Área, volumen y datos | MA04 OA24–27 | `portada-mate-datos.png` | 8°/7°/3° |

### Ciencias (17 OA → 5 capítulos)

| Capítulo | OA | Portada | De |
|---|---|---|---|
| `cie4-cap1` Ecosistemas de Chile | CN04 OA01–04 | `portada-cie6-cap1.png` ("Ecosistemas y energía de la vida") | 6° — coincidencia exacta |
| `cie4-cap2` Mi cuerpo | CN04 OA05–08 (incluye el OA sensible del alcohol/tabaco) | `portada-cien-cuerpo.png` | 8°/7°/3°/5°/6° |
| `cie4-cap3` La materia | CN04 OA09–11 | `portada-cien-materia.png` | 8°/7°/5°/6° |
| `cie4-cap4` Fuerzas y máquinas | CN04 OA12–14 | `portada-cie7-cap2.png` ("Fuerzas y presión") | 7° — coincidencia exacta |
| `cie4-cap5` La Tierra y sus riesgos | CN04 OA15–17 | `portada-cie6-cap5.png` ("La Tierra y el suelo") | 6° — coincidencia exacta |

### Historia (18 OA → 5 capítulos)

| Capítulo | OA | Portada | De |
|---|---|---|---|
| `hist4-cap1` Civilizaciones de América | HI04 OA01–04 (maya, azteca, inca, comparar) | `portada-hist7-cap6.png` ("Civilizaciones de América") | 7° — coincidencia exacta |
| `hist4-cap2` Investigar mapas y recursos | HI04 OA05–07 | `portada-hist3-cap1.png` ("Nuestro planeta") | 3° |
| `hist4-cap3` Paisajes de América | HI04 OA08–10 | **sin portada específica** — cae al genérico `portada-historia.png` | — |
| `hist4-cap4` Ciudadanía y derechos | HI04 OA11–14 (incluye los actitudinales de honestidad/respeto) | `portada-hist3-cap4.png` ("Mis deberes y mis derechos") | 3° |
| `hist4-cap5` Participar y resolver conflictos | HI04 OA15–18 (actitudinales: participar, resolver conflictos, proyecto, opinar) | `portada-hist7-cap5.png` ("Ciudadanía, de Atenas a hoy") | 7° |

### Lenguaje (29 OA jugables, `LE04 OA 15` excluido → 9 capítulos)

| Capítulo | OA | Portada | De |
|---|---|---|---|
| `leng4-cap1` Leer con fluidez y comprender | LE04 OA01–04 | `portada-leng-lectura.png` | 8°/7°/3°/5°/6° |
| `leng4-cap2` Poesía y hábito lector | LE04 OA05–08 | `portada-leng-literarios.png` | 8°/7°/3°/5°/6° |
| `leng4-cap3` Investigar y ampliar el vocabulario | LE04 OA09–10 | `portada-len3-cap3.png` ("Palabras nuevas") | 3° |
| `leng4-cap4` Escribir para crear e informar | LE04 OA11–14 | `portada-leng-escritura.png` | 8°/7°/3°/5° |
| `leng4-cap5` Planificar y revisar lo escrito | LE04 OA16–18 | `portada-leng-textos.png` | 8°/7°/3°/5°/6° |
| `leng4-cap6` Adverbios, verbos y buena redacción | LE04 OA19–21 | `portada-len3-cap4.png` ("Las palabras y sus reglas") | 3° |
| `leng4-cap7` Escuchar y disfrutar | LE04 OA22–24 | `portada-len7-cap7.png` | 7° |
| `leng4-cap8` Conversar y exponer | LE04 OA25–28 | `portada-len3-cap8.png` ("Voz y escena") | 3° |
| `leng4-cap9` Actuar y recitar | LE04 OA29–30 | **sin portada específica** — cae al genérico `portada-lenguaje.png` | — |

---

## PARTE 1 · Los 4 villanos propios (8 imágenes)

Nombres **nuevos**, revisados contra los 19 ya usados en el proyecto (Incógnita, Azar, Número
Perdido, Descuadre, Desproporción · Entropía, Erosión, Apagón, Cortocircuito, Desequilibrio ·
Guardián del Tiempo, Anacronismo, Olvido, Rumor, Versión Única · Borrón, Silencio, Malentendido,
Enredo) para que ninguno se repita. Cada villano necesita **dos imágenes**: la normal (intro del
jefe + HUD de la pelea) y la **derrotada** (3 segundos en la cinemática de victoria, swap
automático). Nombre de archivo: `assets/villano-<asignatura>-4to.png` /
`-4to-derrotado.png`.

### BLOQUE DE ESTILO — pégalo antes de cada villano

```
Ilustración cuadrada para una app educativa infantil (videojuego amable): el personaje es un
VILLANO fantástico, expresivo y con actitud de desafío, pero NUNCA da miedo real — es el tipo de
villano de dibujo animado, no de terror. Estilo vectorial limpio y redondeado, coherente con el
resto del juego (mismo nivel de detalle que Vulpi, la mascota zorro). Fondo LISO de un solo color
bien distinto del personaje (negro puro o violeta muy oscuro), sin viñeta ni decorado, para poder
recortarlo después. Paleta dominante: tonos oscuros con acentos ROJO/CARMESÍ y algún detalle
dorado, en contraste con el violeta/cian amable del resto del juego. El personaje va DE CUERPO
ENTERO, centrado, en una pose de desafío o burla. IMPORTANTE: la imagen NO lleva NINGÚN texto, ni
palabras, ni letras, ni números escritos. Alta resolución, apta para recortar dejando solo la
figura sobre fondo transparente.
```

**Para la versión DERROTADA, agregar al final de cada prompt:**
```
Ahora en su versión DERROTADA: el mismo personaje pero apagado y sin fuerza — menos brillo, ojos
entrecerrados o en espiral, alguna pieza suelta o torcida, postura caída o desinflada como un globo
sin aire. Nunca partido en pedazos ni con sangre: es para niños, la idea es "perdió", no "se rompió
para siempre". Mismo encuadre, tamaño y ángulo de cámara que la versión normal, para que el juego
pueda mostrar una sobre la otra en la animación de victoria.
```

### Matemática · "El Trueque" 🔄

Ata a la equivalencia entre fracciones y decimales (MA04 OA08–12): el villano hace que las cosas
"parezcan" cambiar de valor sin que nadie se dé cuenta.

```
El villano: una criatura hecha de piezas de fracciones y decimales que se INTERCAMBIAN solas sin
avisar — un brazo termina en una barra partida en mitades, el otro en un bloque decimal que gotea
puntos brillantes. Sostiene una balanza trucada cuyos platillos cambian de contenido cada vez que
alguien mira para otro lado. Su ropa es un mosaico de cuadrículas y ángulos torcidos que nunca
terminan de encajar entre sí.
```

### Ciencias · "El Revoltijo" 🌪️

Ata a la mezcla de ecosistemas, cuerpo, materia y fuerzas: el villano junta cosas que no deberían
combinarse.

```
El villano: una criatura que es una MEZCLA IMPOSIBLE de piezas que no deberían combinarse — un
brazo es una rama frondosa con hojas, el otro una raíz de metal oxidado con un engranaje atascado
en la punta. Su torso burbujea al mismo tiempo entre hielo, agua y vapor, sin decidirse por ningún
estado. De su espalda brotan cables sueltos enredados con enredaderas, soltando chispas apagadas y
gotitas heladas.
```

### Historia · "La Discordia" ⚡

⚠️ Diseñado a propósito de forma **abstracta** (mapas, brújulas, clima), nunca representando
personas ni culturas — mismo criterio que ya usan "El Anacronismo" y "La Versión Única": el
concepto se dibuja con objetos, no con gente.

```
El villano: una figura hecha de dos MAPAS ANTIGUOS que no logran encajar entre sí, doblados y
cosidos a la fuerza formando su cuerpo, con los bordes rasgados chocando en el centro como un
cierre mal cerrado. Sostiene en cada mano una BRÚJULA que apunta en direcciones opuestas. De sus
hombros brotan pequeñas nubes de tormenta con rayos apagados, y su rostro está partido por una
grieta dorada que nunca cierra del todo.
```

### Lenguaje · "El Trabalenguas" 👅

Ata a la fluidez lectora y la expresión oral (LE04 OA01, OA22–30): el villano hace que las
palabras se enreden al salir.

```
El villano: una criatura cuya "lengua" es una cinta elástica enredada en nudos y lazos, saliendo
de una boca torcida en una sonrisa burlona. Sus brazos son signos de exclamación e interrogación
GARABATEADOS (formas torcidas, nunca letras reales) que se enredan entre sí. Pequeñas burbujas de
diálogo VACÍAS (sin ninguna palabra dentro) flotan alrededor, deformándose y multiplicándose.
```

---

## Después de generar — HECHO el 06/09/2026

1. ✅ Los 8 archivos se identificaron **uno por uno mirándolos**, no por orden de descarga: la
   tanda de las 4 normales (11:46-11:51) sí siguió el orden de los prompts, pero la de las 4
   derrotadas (13:09-13:13) llegó en **orden inverso** (Lenguaje, Historia, Ciencias, Matemática).
   Asumir que las dos tandas comparten orden habría cableado el villano equivocado a cada jefe.
2. ✅ Procesadas con `scripts/procesar-arte.py`, pero **no con un solo comando**: los 4 normales
   traían transparencia real (RGBA con alfa en gradiente) y el flood-fill de `--fondo=negro` les
   dejaba agujeros —un halo de color alrededor del personaje bloqueaba la inundación desde las
   esquinas—, así que se reprocesaron a partir de su propio alfa. Los 4 derrotados venían
   aplanados sobre negro opaco (sin alfa) y sí necesitaban el flood-fill, pero con
   **`--negromax=8`** en vez del 60 por defecto —el mismo halo de color rompía agujeros con el
   umbral por defecto—, calibrado probando varios valores y **mirando el resultado**, no el "N
   procesadas" del script.
3. ✅ Guardados como `assets/villano-matematicas-4to.png`, `-ciencias-`, `-historia-`,
   `-lenguaje-4to.png` y sus `-derrotado`.
4. ✅ Cableados en los 4 `jefeFinal` de `4to/index.html` (`villanoImg`+`villanoImgDerrotado`, los
   comentarios `PLACEHOLDER` reemplazados). Verificado jugando con `scripts/cdp.mjs`: los 4 jefes
   abren su intro con la imagen real, 0 errores de consola, 0 fallos de imagen.
5. Los originales no se copiaron a `assets/originales/` (ya pesa 175 MB); quedan en Descargas.
