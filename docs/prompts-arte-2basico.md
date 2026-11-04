# Prompts de arte de 2° básico

> **Qué es esto.** El arte que necesita 2° básico: la portada de cada uno de sus **23 capítulos**
> (reparto propuesto en [`reparto-2basico.md`](reparto-2basico.md)) y sus **4 villanos**. Mismo
> método que 4°, 5° y 6° ([`estandar-arte-portadas.md`](estandar-arte-portadas.md)): primero se
> busca entre las 60 portadas existentes una que calce **por TEMA** (nunca por número de capítulo),
> y solo lo que no tiene candidato honesto pide imagen nueva.
>
> Flujo de siempre: **Roberto genera** con IA, **el asistente procesa** con
> `scripts/procesar-arte.py` y cablea el resultado en `2do/index.html` (que todavía no existe: el
> `portadaMapa:` de cada capítulo se escribe al construir el fork, Task 11 del plan).
>
> **Resultado: 14 capítulos reutilizan, 9 piden portada nueva, y los villanos son 8 imágenes.**
> En total, **17 imágenes por generar**.

---

## PARTE 0 · Capítulo → portada

Revisadas **mirando** las 60 portadas del proyecto (un mosaico de todas), no por nombre. Ninguna
portada se repite dentro de 2°: cada capítulo queda distinguible del vecino, que es el motivo del
estándar.

### Matemática (7) — 6 reutilizan, 1 nueva

| Capítulo | Decisión | Archivo | Por qué |
|---|---|---|---|
| `mate2-cap1` Contar hasta 1.000 | Reutilizar | `portada-mate-numeros.png` | Vulpi salta por una recta numérica con números y ábaco: contar, leer y patrones |
| `mate2-cap2` Decenas y unidades | **Nueva** | `portada-mate2-cap2.png` | `mate-numeros` ya es del cap. 1; no hay ninguna con bloques de base diez |
| `mate2-cap3` Sumar y restar | Reutilizar | `portada-mat3-cap2.png` | Es «Sumar y restar» de 3°: + y − grandes, ábaco, fichas de conteo |
| `mate2-cap4` Familias de operaciones y multiplicar | Reutilizar ⚠️ | `portada-mat3-cap3.png` | Grupos iguales ordenados en filas: es justo cómo se multiplica en 2° (ver dudas) |
| `mate2-cap5` Figuras y posiciones | Reutilizar | `portada-mate-geometria.png` | Cubo, pirámide, esfera, triángulos: figuras planas y cuerpos |
| `mate2-cap6` Medir el tiempo y el largo | Reutilizar | `portada-mat3-cap6.png` | Huincha de medir + reloj: tiempo y largo |
| `mate2-cap7` Datos con dados y monedas | Reutilizar | `portada-mate-datos.png` | Gráfico de barras, dados y lupa |

### Lenguaje (8) — 7 reutilizan, 1 nueva

| Capítulo | Decisión | Archivo | Por qué |
|---|---|---|---|
| `leng2-cap1` Leer bien las palabras | Reutilizar | `portada-leng-lectura.png` | Vulpi lee un libro; es la que usa 4° para «Leer con fluidez» |
| `leng2-cap2` Me gusta leer | **Nueva** | `portada-leng2-cap2.png` | Biblioteca y gusto por leer: no hay ninguna biblioteca en viñeta (ver dudas) |
| `leng2-cap3` Comprender cuentos | Reutilizar | `portada-leng-literarios.png` | Vulpi sale de un libro con castillo y dragón: mundos de cuento, como en 3° |
| `leng2-cap4` Poemas, rimas y teatro | Reutilizar | `portada-leng4-cap9.png` | Es «Actuar y recitar» de 4°: escenario, máscaras y micrófono |
| `leng2-cap5` Textos que informan | Reutilizar | `portada-leng-textos.png` | Diario, megáfono y pantalla; es «Textos que sirven» en 3° |
| `leng2-cap6` Palabras que nombran y describen | Reutilizar | `portada-len3-cap4.png` | «Las palabras y sus reglas» de 3°: piezas que encajan, lápiz y signos |
| `leng2-cap7` Escribir mis historias | Reutilizar | `portada-leng-escritura.png` | Pluma sobre pergamino |
| `leng2-cap8` Hablar y escuchar | Reutilizar | `portada-len3-cap7.png` | «Escuchar y conversar» de 3°: dos zorritos, globos vacíos y una oreja |

### Ciencias (4) — 1 reutiliza, 3 nuevas

| Capítulo | Decisión | Archivo | Por qué |
|---|---|---|---|
| `cie2-cap1` El cuerpo y los vertebrados | Reutilizar | `portada-cien-cuerpo.png` | Corazón, pulmones, esqueleto y Vulpi corriendo: 2 de sus 3 etapas |
| `cie2-cap2` Invertebrados y ciclos de vida | **Nueva** | `portada-cie2-cap2.png` | No hay insectos ni ciclos de vida; `cie6-cap1` tiene una abeja pero ya es de ecosistemas |
| `cie2-cap3` Animales en peligro y el agua | **Nueva** | `portada-cie2-cap3.png` | Nada sobre fauna nativa ni sobre el agua |
| `cie2-cap4` El agua y el tiempo | **Nueva** | `portada-cie2-cap4.png` | No existe ninguna de clima ni estaciones |

### Historia (4) — 0 reutilizan, 4 nuevas

Historia de 2° es **Chile**, y el estándar ya lo dice: entre cursos, Historia no rinde.

| Capítulo | Decisión | Archivo | Por qué |
|---|---|---|---|
| `hist2-cap1` Planos, mapas y paisajes de Chile | **Nueva** ⚠️ | `portada-hist2-cap1.png` | El objeto que orienta es el plano del barrio y el mapa largo de Chile (ver dudas) |
| `hist2-cap2` Los pueblos originarios de Chile | **Nueva** | `portada-hist2-cap2.png` | `hist7-cap6` es maya/inca: otros pueblos, y Vulpi va de explorador disfrazado |
| `hist2-cap3` Una sociedad mestiza y diversa | **Nueva** ⚠️ | `portada-hist2-cap3.png` | El mestizaje se ve en la mesa (lo que aportó cada uno) (ver dudas) |
| `hist2-cap4` El patrimonio de Chile | **Nueva** | `portada-hist2-cap4.png` | Tradiciones, flora y fauna de Chile: no hay nada parecido |

### Dudas (las ⚠️ de las tablas), para que Roberto decida antes de generar

- **`mate2-cap4` → `mat3-cap3`.** Calza en lo central —multiplicar como grupos iguales en filas—,
  pero el dibujo trae también un **÷**, y 2° todavía no divide; y no muestra nada de «familias de
  operaciones» ni de la balanza de igual/mayor/menor. Se reutiliza porque un niño lo lee como
  «multiplicar»; si molesta, es una portada nueva más (Vulpi equilibrando una balanza con grupos
  de fichas).
- **`leng2-cap2` → nueva.** Había un candidato aceptable, `len3-cap3` («Palabras nuevas»: libro
  con gemas y lupa), pero solo cubre una de sus tres etapas (averiguar palabras nuevas); el
  capítulo es sobre todo el gusto por leer y la biblioteca. Si se prefiere ahorrar una imagen,
  `len3-cap3` sirve de respaldo y no repite ninguna otra portada de 2°.
- **`hist2-cap1` → nueva.** `hist4-cap3` («Paisajes de América»: Vulpi explorador con
  binoculares, brújula, desierto, cascada y glaciar) calza en los paisajes, pero es América y le
  falta lo que el niño aprende primero: el plano de su entorno y la forma larga de Chile. Es el
  respaldo si se quiere ahorrar.
- **`hist2-cap3` → nueva.** `hist3-cap5` («Vivir juntos»: plaza con zorritos diversos) calza en
  «diversa» y «respetar», pero no en «mestiza», que es lo que da nombre al capítulo. Respaldo
  aceptable.
- **`cie2-cap1` → `cien-cuerpo`.** Cubre el cuerpo y el movimiento, no los vertebrados (1 de 3
  etapas). Se acepta: es la más usada del proyecto y el título del capítulo empieza por el cuerpo.

> **Fuera de estos 23:** la expedición `voc-general` (Vocabulario) y el módulo 🏛️ Formación
> Ciudadana usan su portada de siempre en todos los cursos; no piden nada nuevo.

---

## PARTE 1 · Las 9 portadas nuevas

### BLOQUE DE ESTILO — pégalo ANTES de cada escena

Es el de 3°/7° y 5°/6°, con la línea de densidad de 2° ya incluida al final.

```
Ilustración cuadrada para una app educativa infantil, estilo vectorial limpio y redondeado, tipo
videojuego amable. Composición: una VIÑETA CIRCULAR con grueso borde dorado, centrada sobre el
lienzo cuadrado. Dentro de la viñeta, fondo violeta profundo y cósmico (violeta #8f6bff sobre
morado oscuro) con pequeños destellos y estrellitas. Protagonista: VULPI, un zorro mascota
simpático de pelaje naranja y crema, con capucha (hoodie) violeta, DE CUERPO ENTERO y EN ACCIÓN
(haciendo algo, no posando). A su alrededor flotan objetos temáticos del capítulo. Paleta: violeta,
dorado y cian brillante. IMPORTANTE: la imagen NO lleva NINGÚN texto — ni palabras, ni títulos, ni
frases, ni letras del abecedario. (Los símbolos matemáticos sueltos —+ − × ÷ = < >— y los
numerales sí se permiten como elemento decorativo cuando el tema lo pide; los signos de
puntuación —¿ ? ¡ ! . ,— también.) Alta resolución, centrada, apta para recortar a 512×512.
Escena para niños de 7 u 8 años: muy simple y cálida, Vulpi grande en primer plano, solo 3 o 4
objetos alrededor, grandes y fáciles de reconocer, colores luminosos y alegres.
```

> Si al calibrar la primera hay que ajustar el look (más borde, otro violeta, Vulpi más grande),
> se cambia **solo aquí** y vale para las nueve.

### Ciencias (3) — la tanda de calibración

**`cie2-cap2` · Invertebrados y ciclos de vida**
```
Escena: Vulpi, agachado y con una LUPA grande, observa con asombro una mariposa que acaba de salir
de su crisálida sobre una rama. En la rama se ven, en fila, las etapas de su vida: unos huevitos,
una oruga verde y la crisálida. Flotan alrededor una mariquita roja, una pequeña telaraña con una
araña simpática y un caracol.
```

**`cie2-cap3` · Animales en peligro y el agua**
```
Escena: Vulpi, arrodillado a la orilla de un lago de agua clara, ayuda con cuidado a una RANITA
pequeña y verde a volver al agua. En la orilla, un ciervo pequeño de cuernos cortos (un huemul)
lo mira tranquilo. Flotan alrededor una gota de agua brillante, un cubito de hielo y una nubecita
de vapor, como las tres formas del agua.
```

**`cie2-cap4` · El agua y el tiempo**
```
Escena: Vulpi, con botas de lluvia amarillas y un paraguas, mira una nube que deja caer gotas
sobre un vaso medidor de lluvia (pluviómetro). A su lado gira una VELETA con forma de flecha, y un
termómetro grande marca el frío. Atrás, un árbol pequeño dividido en cuatro partes muestra las
cuatro estaciones: flores, hojas verdes, hojas naranjas y nieve. Un sol sonriente asoma detrás de
la nube.
```

### Matemática (1) y Lenguaje (1)

**`mate2-cap2` · Decenas y unidades**
```
Escena: Vulpi arma números con PALITOS: junta diez palitos de colores y los amarra con una cinta
formando un atado, y los deja en una caja; en otra caja hay palitos sueltos de a uno. Flotan
barras de diez cubitos unidos y cubitos sueltos (bloques de base diez) y los símbolos < y > grandes
y dorados.
```

**`leng2-cap2` · Me gusta leer**
```
Escena: Vulpi, en una biblioteca acogedora, se estira en puntas de pie para sacar un libro de un
estante alto lleno de libros de colores (lomos lisos, sin letras ni títulos). Al lado hay un cojín
grande para leer y una lámpara encendida. Flotan corazones y estrellitas que salen del libro que
está sacando.
```

### Historia (4)

⚠️ **Pueblos originarios (`hist2-cap2`):** sin personas dibujadas, sin disfraz para Vulpi y sin
objetos ceremoniales o sagrados como decorado (nada de kultrún, rewe, tocados de plumas ni
pinturas en la cara). Se muestran **lugares y objetos de la vida cotidiana**, como en el criterio
del villano de Historia de 4°: el concepto se dibuja con objetos, no con gente, porque una
caricatura de un pueblo real en un juego para niños es exactamente lo que no puede pasar.

**`hist2-cap1` · Planos, mapas y paisajes de Chile**
```
Escena: Vulpi, sentado sobre un gran PLANO de su barrio visto desde arriba (casitas, una plaza
con árboles, una escuela y las calles), traza con un lápiz grande el camino de su casa a la
escuela. Detrás de él flota una franja larga y angosta, de arriba abajo, con los paisajes de Chile
en orden: un desierto con cactus arriba, valles verdes al medio y montañas nevadas con un glaciar
abajo. Flota también una brújula dorada.
```

**`hist2-cap2` · Los pueblos originarios de Chile**
```
Escena: Vulpi, con su capucha violeta de siempre (sin disfraces ni ropa de otros pueblos), camina
con una mochila por un sendero que une tres paisajes dentro de la viñeta, mirando todo con
respeto y curiosidad, mientras acaricia con suavidad a una llama. A la izquierda, el altiplano del
norte con llamas, casas de piedra y plantas de quinoa; al medio, un bosque del sur con una
araucaria y una ruka (casa redonda de techo de paja); a la derecha, una isla en el mar con un moai
de piedra mirando hacia la tierra. Flotan un cántaro de greda y un tejido de colores con dibujos
geométricos. Sin personas en la escena.
```

**`hist2-cap3` · Una sociedad mestiza y diversa**
```
Escena: Vulpi comparte una mesa grande con zorritos amigos de pelajes distintos (gris, blanco,
café y rojizo), todos contentos. Vulpi reparte pan recién horneado; en la mesa hay choclos,
papas, uvas y una olla humeante, como alimentos que se juntaron en la misma cocina. Flota una
pelota de juego y un corazón, como signo de jugar limpio y respetarse.
```

**`hist2-cap4` · El patrimonio de Chile**
```
Escena: Vulpi encumbra feliz un VOLANTÍN de colores en un parque, con un trompo de madera girando
a sus pies. Al fondo, una araucaria y flores de copihue rojas colgando de una enredadera; en el
cielo vuela un cóndor de alas abiertas. Una pequeña bandera de Chile (sin ningún escudo con
letras) flamea en un mástil.
```

---

## PARTE 2 · Los 4 villanos (8 imágenes)

Cada villano necesita **dos imágenes**: la normal (intro del jefe y HUD de la pelea) y la
**derrotada** (3 segundos en la cinemática de victoria, cambio automático). Archivos:
`assets/villano-<asignatura>-2do.png` y `assets/villano-<asignatura>-2do-derrotado.png`.

**Estilo de referencia: los de 3°** (`villano-*-3ro.png`), no los de 4°. Mirados lado a lado, los
de 3° son criaturas **redondas, rechonchas y con ojos grandes** —una mancha de tinta, una nube
de números, un fantasma—, mientras que los de 4° ya son personajes de cuerpo entero más
angulosos. Para 7-8 años va lo de 3°: villano que hace reír más de lo que asusta. Por eso el
bloque de estilo cambia una línea respecto del de 4°.

### BLOQUE DE ESTILO — pégalo antes de cada villano

```
Ilustración cuadrada para una app educativa infantil (videojuego amable): el personaje es un
VILLANO fantástico, travieso y con actitud de desafío, pero NUNCA da miedo — es un villano de
dibujo animado para niños de 7 u 8 años: cuerpo REDONDO y rechoncho, ojos grandes y expresivos,
sonrisa pícara. Estilo vectorial limpio y redondeado, coherente con el resto del juego (mismo
nivel de detalle que Vulpi, la mascota zorro). Fondo LISO de un solo color bien distinto del
personaje (negro puro o violeta muy oscuro), sin viñeta ni decorado, para poder recortarlo
después. Paleta dominante: tonos oscuros con acentos ROJO/CARMESÍ y algún detalle dorado, en
contraste con el violeta/cian amable del resto del juego. El personaje va DE CUERPO ENTERO,
centrado, en una pose de burla o desafío. IMPORTANTE: la imagen NO lleva NINGÚN texto, ni
palabras, ni letras, ni números escritos; si aparecen globos de diálogo, van completamente en
blanco. Alta resolución, apta para recortar dejando solo la figura sobre fondo transparente.
```

**Para la versión DERROTADA, agregar al final del prompt** (idealmente en la misma conversación,
justo después de la normal y pidiéndola como edición de esa imagen, para que el encuadre calce):
```
Ahora en su versión DERROTADA: el mismo personaje pero apagado y sin fuerza — menos brillo, ojos
entrecerrados o en espiral, alguna pieza suelta o torcida, postura caída o desinflada como un globo
sin aire. Nunca partido en pedazos ni con sangre: es para niños, la idea es "perdió", no "se rompió
para siempre". Mismo encuadre, tamaño y ángulo de cámara que la versión normal, para que el juego
pueda mostrar una sobre la otra en la animación de victoria.
```

### Matemática · «El Desorden» 🌀

Revuelve los números de la recta. **Sin numerales en la imagen**: un generador escribe dígitos
deformes con facilidad, así que las cantidades van como puntos y cubitos.
```
El villano: una criatura redonda y traviesa que hace girar sobre su cabeza una RECTA NUMÉRICA
doblada y anudada como un lazo, con sus marquitas torcidas. Con la otra mano lanza al aire
cubitos de colores y fichas de dominó (con puntos, sin números) que caen revueltos y fuera de
lugar. Lleva una bufanda hecha con un ábaco desarmado cuyas cuentas cuelgan sueltas.
```
*Derrotado:* el mismo, sentado y mareado, con la recta desanudada y extendida derecha a su lado y
los cubitos ordenados en fila.

### Lenguaje · «El Ladrón de Letras» 🎒

Se lleva letras de las palabras. Como no puede haber letras en la imagen, el botín son **fichas
brillantes en blanco**. Tiene que verse distinto de El Borrón de 3° (una mancha de tinta) y de El
Trabalenguas de 4° (cintas rojas enredadas): este es un **ladronzuelo**.
```
El villano: una criatura pequeña y redonda con antifaz de ladrón, que se escabulle de puntillas
cargando a la espalda un saco lleno de FICHAS brillantes como de juego de mesa (fichas en blanco,
sin ninguna letra dibujada). Con una red de cazar mariposas atrapa una ficha más que se escapa de
un libro abierto en el suelo; al libro le quedan huecos vacíos en sus páginas. Mira hacia atrás
con una sonrisa pícara.
```
*Derrotado:* el mismo, con el saco roto y las fichas volviendo al libro, el antifaz caído sobre un
ojo y la red enredada en sus pies.

### Ciencias · «La Sequía» ☀️

Se lleva el agua de los hábitats.
```
El villano: una criatura redonda hecha de tierra seca y agrietada, como un charco que se secó,
con un halo de calor naranja a su alrededor. En la cabeza le crece una plantita marchita y
caída. Sorbe con una pajita gigante el último charquito de agua que queda en el suelo, mientras
sostiene una regadera vacía boca abajo. Unas pocas gotas de agua escapan asustadas de él.
```
*Derrotado:* el mismo, bajo una lluvia suave, empapado y desinflado, con la grieta de la tierra
cerrándose y la plantita de su cabeza otra vez verde y derecha.

### Historia · «La Neblina» 🌫️

Tapa los mapas, los paisajes y los caminos de Chile: donde pasa, ya no se ve de dónde venimos ni
hacia dónde ir. Tiene que verse distinta de **El Olvido** de 3° (un fantasma violeta con fotos y
ruinas) y de **El Apagón** de 3°: esta es una **nube baja y espesa**, no un fantasma. Abstracta
como El Anacronismo y La Discordia: ni personas ni culturas, solo paisaje y objetos.
```
El villano: una nube de neblina gris perla, baja, espesa y esponjosa, con ojos somnolientos y
una sonrisa traviesa, que se arrastra por el suelo como una alfombra de niebla. Con sus brazos
de bruma envuelve un mapa de Chile largo y angosto enrollado, y lo va borrando: la mitad que
toca queda en blanco. A su lado, la punta nevada de una montaña y una brújula asoman apenas
entre la niebla, desdibujadas. Sin texto ni letras en el mapa.
```
*Derrotado:* la misma neblina, delgada y deshilachada, deshaciéndose en gotitas bajo un rayo de
sol; el mapa desenrollado y otra vez a color, la montaña y la brújula nítidas.

---

## PARTE 3 · Cómo generarlas: 17 imágenes en 5 tandas

| Tanda | Qué | Imágenes | Por qué en este orden |
|---|---|---|---|
| 1 | Ciencias: `cie2-cap2`, `-cap3`, `-cap4` | 3 | **Calibración.** Menor riesgo editorial; se ajusta el bloque de estilo con la primera |
| 2 | `mate2-cap2` y `leng2-cap2` | 2 | Escenas simples, ya con el estilo calibrado |
| 3 | Historia: `hist2-cap1` a `-cap4` | 4 | La de pueblos originarios va con el estilo ya firme, y **se revisa con calma** antes de aceptarla |
| 4 | Villanos: Matemática y Lenguaje, normal + derrotado | 4 | Cada derrotado justo después de su normal, en la misma conversación |
| 5 | Villanos: Ciencias e Historia, normal + derrotado | 4 | Ídem |
| | **Total** | **17** | 9 portadas + 8 villanos |

### Después de generar

1. ⚠️ **Identificar cada imagen MIRÁNDOLA, una por una, nunca por el orden de descarga.** Llegan
   con nombre UUID, y el orden engaña: en 4° la tanda de villanos derrotados llegó **invertida**
   (Lenguaje, Historia, Ciencias, Matemática) y asumir el orden habría cableado cada villano en el
   jefe equivocado. Mirar **todas**, no solo la primera de cada tanda.
2. **Revisar que no se colaron letras** —en lomos de libros, en la bandera, en los globos, en las
   fichas del ladrón— y regenerar la que traiga texto. Pasó con dos villanos en la Sesión 66.
3. **Antes de procesar, mirar el MODO de cada archivo** (`im.mode` y el color de las esquinas): si
   trae transparencia real (RGBA con alfa en gradiente) va con `--fondo=alfa`; si viene aplanada
   sobre negro, `--fondo=negro`, calibrando `--negromax` (en 4° hizo falta 8 en vez del 60 por
   defecto; las portadas sobre violeta oscuro de 6° pidieron 120); si viene sobre blanco, el modo
   `--fondo=blanco` (el valor por defecto). En una misma entrega pueden venir formatos distintos.
4. `python scripts/procesar-arte.py --fondo=<el que corresponda> <uuid>=<nombre-destino> …` →
   512×512 (la sintaxis exacta está en la cabecera del script).
5. **Contar los píxeles transparentes DENTRO de la viñeta** de cada portada: tienen que ser cero.
   «N procesadas» no es lo mismo que «N procesadas sin agujeros» (Sesión 96).
6. Guardar como `assets/portada-<id>.png` y `assets/villano-<asignatura>-2do[-derrotado].png`.
7. Al construir `2do/index.html`: **`portadaMapa:` explícito en los 23 capítulos** —las 9 nuevas a
   su archivo y las 14 reutilizadas al de la tabla de la Parte 0—, nunca por convención implícita
   (produce 404 tapados por el `onerror`). Y `villanoImg` / `villanoImgDerrotado` en los 4
   `jefeFinal`.
8. Verificar jugando con `scripts/cdp.mjs`: las campañas cargan sus portadas sin caer al
   respaldo, los 4 jefes abren su intro con la imagen real, cero 404 y consola limpia.
9. Los originales no se copian a `assets/originales/`: quedan en Descargas.
