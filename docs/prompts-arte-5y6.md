# Prompts de arte: lo que falta de 5° y 6° básico

> **Qué es esto.** Los prompts para las **9 portadas de capítulo** que de verdad necesitan arte
> nuevo en 6° (5° no necesita ninguna: sus 20 capítulos ya reutilizan portadas existentes por
> tema, ver `docs/estandar-arte-portadas.md`) y los **8 villanos propios** (4 de 5°, 4 de 6°),
> que hoy juegan con arte prestado de 7° y de 3° respectivamente. Flujo de siempre: **Roberto
> genera** con IA, **el asistente procesa** con `scripts/procesar-arte.py` y cablea el resultado.
>
> **Antes de generar nada: 6° ya bajó de 25 portadas por hacer a solo 9.** Se revisaron los 25
> capítulos uno por uno buscando una portada existente que calzara por TEMA (la lección de Historia
> de 5°, más abajo en `estandar-arte-portadas.md`: nunca por número de capítulo). 16 sí calzaban y
> ya están cableados en `6to/index.html`; quedan 9 sin ningún candidato razonable.

---

## PARTE 1 · Las 9 portadas nuevas de 6° básico

Mismo estándar que las 30 de 3°/7° (Sesión 79): viñeta circular, fondo violeta cósmico, Vulpi de
cuerpo entero en acción, sin texto. Nombre de archivo: `assets/portada-<id>.png`.

### BLOQUE DE ESTILO — pégalo antes de cada escena

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
Escena algo más rica que en los cursos menores, con más elementos y algo más de contraste que en
3°, pero sin llegar a la densidad de 8°: tono seguro y curioso, propio de un niño de 11-12 años.
```

### Matemática (3)

**`mate6-cap2` · Fracciones y decimales**
```
Escena: Vulpi hace equilibrio sobre una gran BARRA DE FRACCIÓN partida en secciones desiguales,
sosteniendo en cada mano un bloque con un punto decimal grande. A su alrededor flotan monedas
partidas en mitades y cuartos, y pequeños números como "0,5" y "¾" en estilo decorativo.
```

**`mate6-cap5` · Ángulos**
```
Escena: Vulpi sostiene un TRANSPORTADOR gigante como si fuera un volante, midiendo el ángulo entre
dos rayos de luz dorada. Flotan alrededor triángulos con sus ángulos marcados en cian, un compás
abierto y pequeños arcos de medición.
```

**`mate6-cap6` · Medición**
```
Escena: Vulpi mide con una CINTA MÉTRICA flexible el contorno de una caja cúbica gigante y
transparente, dentro de la cual se ven cubitos apilados representando su volumen. Flotan una regla
dorada y pequeños cuadraditos de área.
```

### Ciencias (2)

**`cie6-cap1` · Ecosistemas y energía de la vida**
```
Escena: Vulpi está de pie en un pequeño claro de bosque, con un rayo de sol dorado cayendo sobre
una planta que él riega con una regadera; de la planta salen flechas curvas de energía hacia un
insecto y un pájaro pequeño, formando una cadena. Flotan hojas verdes y una gota de agua brillante.
```

**`cie6-cap5` · La Tierra y el suelo**
```
Escena: Vulpi de rodillas excava con una palita pequeña un corte transversal del SUELO, mostrando
capas de tierra, raíces y una lombriz asomando. Flotan alrededor una piedra, una hoja seca y un
pequeño globo terráqueo con sus capas internas visibles.
```

### Historia (3)

**`hist6-cap1` · Independencia y la nueva república**
```
Escena: Vulpi ondea con orgullo una BANDERA CHILENA (sin ningún texto ni escudo con letras) desde
lo alto de un cabildo colonial con arcos. Flotan una pluma de ganso sobre un pergamino enrollado
(sin escritura visible), una campana y un sable ceremonial cruzado con una rama de laurel.
```

**`hist6-cap2` · Chile en el siglo XIX y XX**
```
Escena: Vulpi sostiene con ambas manos un gran TROZO DE SALITRE brillante como si fuera un tesoro,
de pie sobre las vías de un ferrocarril antiguo. Al fondo, una urna de votación y una locomotora
pequeña de vapor. Flotan engranajes dorados y una nube de humo estilizada.
```

**`hist6-cap4` · La Constitución**
```
Escena: Vulpi sostiene con cuidado un gran LIBRO CERRADO con una balanza de la justicia dorada
grabada en la tapa (sin ninguna letra ni texto), como si fuera un tesoro importante. Flotan
alrededor una pluma, un martillo de juez pequeño y un escudo simple sin inscripciones.
```

### Lenguaje (1)

**`leng6-cap7` · Hablar y exponer**
```
Escena: Vulpi de pie sobre un pequeño podio, con un brazo levantado en gesto de estar explicando
algo con entusiasmo, frente a un atril con un papelógrafo en blanco (sin texto). Flotan globos de
diálogo VACÍOS (sin ninguna palabra dentro, solo la forma de la nube de diálogo) y notas musicales
de entonación.
```

---

## PARTE 2 · Los 8 villanos propios (4 de 5°, 4 de 6°)

Hoy 5° juega con el arte de los villanos de **7°** y 6° con el de **3°**, solo con nombre propio
(ver `5to/index.html` y `6to/index.html`, comentario "ARTE PRESTADO"). Cada villano necesita **dos
imágenes**: la normal (se ve en la intro del jefe y en el HUD de la pelea) y la **derrotada** (se
ve 3 segundos en la cinemática de victoria, swap automático). Nombre de archivo:
`assets/villano-<asignatura>-5to.png` / `-5to-derrotado.png` (y `-6to` / `-6to-derrotado.png`).

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

### 5° básico

**Matemática · "El Descuadre"** 📐
```
El villano: una criatura hecha de reglas, escuadras y ángulos TORCIDOS que no encajan entre sí —
un cuerpo formado por piezas geométricas mal alineadas, como un rompecabezas armado a la fuerza.
Un ojo más arriba que el otro, una mano gigante y la otra diminuta. Sostiene una regla doblada
como si fuera un bastón.
```

**Ciencias · "El Cortocircuito"** ⚡
```
El villano: una criatura mitad orgánica, mitad de cables pelados y chispas descontroladas, como un
enchufe con vida propia. Chispas rojas y azules saltan de sus "brazos", que son cables enredados
terminados en clavijas. Su cara tiene una expresión de electricidad estática, con el pelo (o
antenas) parado.
```

**Historia · "El Rumor"** 🗣️
```
El villano: una figura envuelta en una capa hecha de bocas y siluetas de ondas sonoras que se
repiten y distorsionan entre sí (sin ninguna letra ni palabra: solo formas de boca abierta y líneas
onduladas de sonido). Se ve borroso en los bordes, como un eco que se deforma cada vez que se
repite.
```

**Lenguaje · "El Malentendido"** ❓
```
El villano: una figura hecha de piezas que no combinan — la mitad de su cara sonríe y la otra mitad
frunce el ceño, su ropa es un parche de retazos desiguales. Sobre su cabeza flotan signos de
interrogación GARABATEADOS (formas de interrogación torcidas, no letras) que cambian de tamaño.
```

### 6° básico

**Matemática · "La Desproporción"** ⚖️📐
```
El villano: una criatura con el cuerpo visiblemente desbalanceado — un brazo enorme y el otro
diminuto, una pierna larguísima y la otra corta, sosteniendo una BALANZA rota con los platillos a
distinta altura. Ángulos torcidos decoran su ropa, como triángulos que no cierran bien.
```

**Ciencias · "El Desequilibrio"** ⚖️
```
El villano: una figura partida verticalmente en dos mitades que no combinan — un lado parece
congelado (cristales de hielo, azul pálido) y el otro derritiéndose (goteando, naranja/rojo), como
si nunca alcanzara el equilibrio térmico. Sostiene una balanza de laboratorio inclinada hacia un
solo lado.
```

**Historia · "La Versión Única"** 📜
```
El villano: una figura alta envuelta en una capa oscura, sosteniendo en alto un ÚNICO pergamino
gigante y cerrado (sin ninguna letra visible) que tapa con su sombra varios pergaminos pequeños y
abiertos en el suelo, como si los escondiera debajo. Postura rígida, mirada seria, sin sonreír.
```

**Lenguaje · "El Enredo"** 🧶
```
El villano: una criatura hecha completamente de HILOS Y LANA enredados en nudos imposibles, con
dos hebras sueltas terminando en forma de manos. Su "cabeza" es una madeja enorme con un solo nudo
apretado en el centro donde deberían ir los ojos. Cuerdas y lazos flotan sueltos a su alrededor.
```

---

## Después de generar

1. Identificar los archivos por orden de descarga (llegan con nombre UUID) — **mirar el primero de
   cada tanda antes de procesar**, no asumir el orden.
2. `python scripts/procesar-arte.py <archivos> --fondo=negro` (o el fondo que corresponda) para
   quitar fondo, recortar y dejar 512×512.
3. Portadas: van directo a `assets/portada-<id>.png`, ya están **cableadas** en `6to/index.html`
   con el `portadaMapa:` correspondiente puesto — no falta tocar código, solo generar el archivo.
4. Villanos: guardar como `assets/villano-<asignatura>-5to.png` (y `-6to`, y los `-derrotado`), y
   avisar para cablear el `villanoImg`/`villanoImgDerrotado` de cada `jefeFinal` en `5to/index.html`
   y `6to/index.html` (hoy apuntan al arte prestado).
5. No hace falta copiar los originales a `assets/originales/` (ya pesa 175 MB); quedan en
   Descargas.
