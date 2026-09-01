# Prompts de las portadas de capítulo

> **Qué es esto.** Los prompts para generar las **30 portadas que faltan** (27 nuevas + 3 a
> rehacer), calibrados al estándar de `docs/estandar-arte-portadas.md`. Flujo: **Roberto genera**
> con IA, **el asistente procesa** con `scripts/procesar-arte.py`. Se genera **por tandas** y se
> calibra el BLOQUE DE ESTILO con la primera antes de seguir.
>
> **El nombre de archivo de cada imagen es `assets/portada-<id>.png`** (el id va en cada escena).

---

## BLOQUE DE ESTILO — pégalo ANTES de cada escena

> Si al calibrar la primera hay que ajustar el look (más borde, otro violeta, Vulpi más grande),
> se cambia **solo aquí** y vale para las 30.

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
```

**Densidad según la edad** (agréga la línea que corresponda al final del prompt):
- **3° básico:** `Escena cálida y algo más simple, pocos objetos grandes y claros, tono luminoso.`
- **7° básico:** `Escena más rica, con más elementos y mayor contraste, tono un poco más maduro.`

---

# TANDA 1 · HISTORIA de 3° (5) — la de calibración

*Sin reutilización posible; menor riesgo editorial. Empezar por aquí.*

**`hist3-cap1` · Nuestro planeta**
```
Escena: Vulpi vestido de pequeño explorador hace girar un GLOBO TERRÁQUEO entre sus manos. A su
alrededor flotan una brújula dorada, un mapa enrollado, nubes y los continentes iluminados.
+ línea de densidad de 3°.
```

**`hist3-cap2` · La antigua Grecia**
```
Escena: Vulpi con una túnica blanca y una corona de laurel, apoyado en una COLUMNA GRIEGA. Flotan
un pequeño templo con frontón (tipo Partenón), un ánfora de cerámica y una máscara de teatro.
+ línea de densidad de 3°.
```

**`hist3-cap3` · La antigua Roma**
```
Escena: Vulpi con casco de legionario romano y una capa, frente a un COLISEO en miniatura. Flotan
un acueducto de arcos, un águila romana dorada sobre un estandarte (sin letras) y una moneda antigua.
+ línea de densidad de 3°.
```

**`hist3-cap4` · Mis deberes y mis derechos**
```
Escena: Vulpi comparte y ayuda a dos zorritos amigos; se dan la mano. Flotan un corazón, una
balanza sencilla y equilibrada, y una pequeña escuela. Ambiente de convivencia y respeto.
+ línea de densidad de 3°.
```

**`hist3-cap5` · Vivir juntos**
```
Escena: Vulpi en una plaza de barrio con casitas de colores y un árbol grande, rodeado de zorritos
diversos y contentos. Flotan símbolos de comunidad: manos unidas, una banca, un tacho de reciclaje.
+ línea de densidad de 3°.
```

---

# TANDA 2 · MATEMÁTICA de 3° (4)

*`mat3-cap1` (Números), `mat3-cap5` (Geometría) y `mat3-cap7` (Datos) NO van: reutilizan
`portada-mate-numeros/geometria/datos.png`.*

**`mat3-cap2` · Sumar y restar**
```
Escena: Vulpi hace malabares sumando y quitando objetos de colores (manzanas, estrellas). Flotan
grandes símbolos + y − dorados, un ábaco de cuentas y fichas de conteo. Tono lúdico y numérico.
+ línea de densidad de 3°.
```

**`mat3-cap3` · Multiplicar y dividir**
```
Escena: Vulpi organiza objetos en filas y grupos iguales (arreglos ordenados de frutas o gemas).
Flotan grandes símbolos × y ÷, y grupos de estrellitas repartidas en partes iguales.
+ línea de densidad de 3°.
```

**`mat3-cap4` · Fracciones y patrones**
```
Escena: Vulpi parte una PIZZA (o torta) en porciones iguales y sostiene una. Flotan barras de
fracción de colores (mitades, cuartos) y una secuencia de figuras que se repite en un patrón.
+ línea de densidad de 3°.
```

**`mat3-cap6` · Medir**
```
Escena: Vulpi mide con una HUINCHA/REGLA. Flotan un reloj análogo, una balanza de platillos, un
vaso medidor con líquido y un termómetro. Tema de medición (largo, tiempo, peso, capacidad).
+ línea de densidad de 3°.
```

---

# TANDA 3 · CIENCIAS de 3° (3)

*`cie3-cap4` (Vida saludable) NO va: reutiliza `portada-cien-cuerpo.png`.*

**`cie3-cap1` · La luz y el sonido**
```
Escena: Vulpi juega con un RAYO DE LUZ que atraviesa un prisma y se abre en arcoíris. Flotan una
linterna encendida, ondas de sonido y una campana o un tambor. Tema luz + sonido.
+ línea de densidad de 3°.
```

**`cie3-cap2` · El Sistema Solar**
```
Escena: Vulpi con casco de astronauta flota en el espacio; a su alrededor ORBITAN los planetas
alrededor de un Sol dorado. Flotan un cohete, la Luna y estrellas brillantes.
+ línea de densidad de 3°.
```

**`cie3-cap3` · Las plantas**
```
Escena: Vulpi de jardinero riega con una regadera una PLANTA que crece desde una semilla hasta una
flor. Flotan hojas, una semilla, una flor abierta y un sol amable. Tema del crecimiento vegetal.
+ línea de densidad de 3°.
```

---

# TANDA 4 · LENGUAJE de 3° (4)

*`len3-cap1` (Leer y entender→`leng-lectura`), `len3-cap2` (Mundos de cuento→`leng-literarios`),
`len3-cap5` (Escribir historias→`leng-escritura`), `len3-cap6` (Textos que sirven→`leng-textos`) y
`len3-cap9` (Libros y búsqueda→`lectura`) NO van: reutilizan portadas existentes.*

**`len3-cap3` · Palabras nuevas**
```
Escena: Vulpi, curioso, abre un LIBRO grande del que salen destellos y gemas brillantes (las
palabras nuevas, como tesoros de luz, SIN letras legibles). Sostiene una lupa. Flotan una bombilla
de idea y chispas doradas.
+ línea de densidad de 3°.
```

**`len3-cap4` · Las palabras y sus reglas**
```
Escena: Vulpi de constructor ARMA palabras como si fueran bloques o piezas de rompecabezas que
encajan (piezas sin letras). Flotan un lápiz grande y signos de puntuación juguetones (¿ ? ¡ ! . ,).
+ línea de densidad de 3°.
```

**`len3-cap7` · Escuchar y conversar**
```
Escena: Vulpi conversa alegremente con un zorrito amigo; entre ellos hay globos de diálogo VACÍOS
(sin texto). Flotan una oreja estilizada, ondas de sonido suaves y un corazón. Tema de la oralidad.
+ línea de densidad de 3°.
```

**`len3-cap8` · Voz y escena**
```
Escena: Vulpi actúa sobre un pequeño ESCENARIO con cortinas de teatro rojas y un foco de luz, en
pose expresiva. Flotan una máscara de teatro y notas de aplauso/estrellas. Tema de la dramatización.
+ línea de densidad de 3°.
```

---

# TANDA 5 · HISTORIA de 7° (6)

*Sin reutilización posible. Densidad de 7° (más elementos, más contraste).*

**`hist7-cap1` · Los primeros humanos y su medio**
```
Escena: Vulpi de explorador prehistórico junto a la boca de una CAVERNA con pinturas rupestres
abstractas y una fogata. Flotan herramientas de piedra, una lanza y la silueta de un mamut al fondo.
+ línea de densidad de 7°.
```

**`hist7-cap2` · Las primeras civilizaciones**
```
Escena: Vulpi frente a PIRÁMIDES de Egipto y un zigurat de Mesopotamia. Flotan un papiro enrollado,
grabados jeroglíficos abstractos (sin letras reales), el río y un tocado de faraón.
+ línea de densidad de 7°.
```

**`hist7-cap3` · Grecia y Roma**
```
Escena: Vulpi entre una COLUMNA GRIEGA y el COLISEO romano, uniendo ambos mundos. Flotan una corona
de laurel, un casco romano, un pergamino de filósofo y un ánfora.
+ línea de densidad de 7°.
```

**`hist7-cap4` · La Edad Media**
```
Escena: Vulpi de caballero-erudito frente a un CASTILLO con torres. Flotan un escudo, una espada,
una catedral gótica y un manuscrito iluminado abstracto (sin letras). Un estandarte al viento.
+ línea de densidad de 7°.
```

**`hist7-cap5` · Ciudadanía, de Atenas a hoy**
```
Escena: Vulpi sostiene en alto una antorcha; a un lado, una asamblea griega antigua; al otro, una
URNA de votación moderna, uniendo pasado y presente. Flotan una balanza de la justicia y una mano
que vota.
+ línea de densidad de 7°.
```

**`hist7-cap6` · Civilizaciones de América**
```
Escena: Vulpi de explorador junto a una PIRÁMIDE ESCALONADA (tipo maya/inca) y terrazas andinas.
Flotan un sol de piedra tallado, una llama (animal), plumas y un quipu. Tono respetuoso y celebratorio
de los pueblos originarios.
+ línea de densidad de 7°.
```

---

# TANDA 6 · CIENCIAS de 7° (2)

*`cie7-cap1` (La materia→`cien-materia`), `cie7-cap4` (Microorganismos→`cien-celula`) y `cie7-cap5`
(Sexualidad→`cien-cuerpo`) NO van: reutilizan portadas existentes.*

**`cie7-cap2` · Fuerzas y presión**
```
Escena: Vulpi de científico hace un experimento de FUERZAS: empuja/tira con flechas que muestran la
fuerza. Flotan un manómetro de presión, un resorte, engranajes y un globo que se infla.
+ línea de densidad de 7°.
```

**`cie7-cap3` · La Tierra que se mueve**
```
Escena: Vulpi de geólogo junto a la TIERRA mostrando sus placas tectónicas y capas internas. Flotan
un volcán en erupción, montañas que se forman y un sismógrafo con su línea. Tema tectónica/sismos.
+ línea de densidad de 7°.
```

---

# TANDA 7 · LENGUAJE de 7° (3)

*`len7-cap1` (Narraciones→`leng-literarios`), `len7-cap3` (Argumentar/medios→`leng-textos`),
`len7-cap4` (Leer para aprender→`leng-lectura`) y `len7-cap6` (Escribir→`leng-escritura`) NO van.*

**`len7-cap2` · Poesía, mitos y relatos populares**
```
Escena: Vulpi de juglar/narrador toca una LIRA bajo un cielo estrellado; de su relato surge la
silueta de una criatura mítica. Flotan un pergamino, una pluma, una luna y una constelación.
+ línea de densidad de 7°.
```

**`len7-cap5` · Las palabras por dentro**
```
Escena: Vulpi de científico examina con una LUPA la estructura interna de las palabras, mostradas
como piezas/engranajes que encajan (raíces y prefijos, SIN letras legibles). Flotan un lápiz y
signos de puntuación.
+ línea de densidad de 7°.
```

**`len7-cap7` · Hablar, dialogar e investigar**
```
Escena: Vulpi expone desde un pequeño ATRIL con un micrófono; a su alrededor hay globos de diálogo
vacíos (sin texto), una lupa de investigación y nodos de ideas conectados por líneas.
+ línea de densidad de 7°.
```

---

# TANDA 8 · REHACER en 8° (3) — destraban 8 ubicaciones

*Están fuera del estándar (retratos de busto sobre fondo claro). Rehacerlas como VIÑETA CIRCULAR
sobre violeta arregla 8° y deja bien las reutilizaciones de 7° y 3°. Densidad de 8° (la más rica).*

**`leng-literarios` · Mundos literarios**
```
Escena: Vulpi ENTRA a un libro mágico del que emerge un mundo de fantasía: un castillo lejano, la
silueta de un dragón y estrellas. Un LIBRO ABIERTO grande como portal. Tema de los mundos de la
literatura. Escena rica, con más elementos y contraste.
```

**`leng-textos` · Textos y medios**
```
Escena: Vulpi de reportero con un DIARIO/periódico y un megáfono; flotan una pantalla o tablet,
globos de diálogo vacíos (sin texto) y una lupa. Tema de los medios y la argumentación. Escena rica,
con más elementos y contraste.
```

**`mate-algebra` · Álgebra y funciones**
```
Escena: Vulpi entre símbolos algebraicos: variables x e y, una BALANZA en equilibrio (la ecuación),
una cuadrícula de coordenadas con una recta trazada, y signos + − × ÷ =. Escena rica, con más
elementos y contraste.
```

---

## Resumen de la cola

| Tanda | Curso · Asignatura | Nuevas | ids |
|---|---|---|---|
| 1 | 3° Historia | 5 | hist3-cap1..5 |
| 2 | 3° Matemática | 4 | mat3-cap2, cap3, cap4, cap6 |
| 3 | 3° Ciencias | 3 | cie3-cap1, cap2, cap3 |
| 4 | 3° Lenguaje | 4 | len3-cap3, cap4, cap7, cap8 |
| 5 | 7° Historia | 6 | hist7-cap1..6 |
| 6 | 7° Ciencias | 2 | cie7-cap2, cap3 |
| 7 | 7° Lenguaje | 3 | len7-cap2, cap5, cap7 |
| 8 | 8° Rehacer | 3 | leng-literarios, leng-textos, mate-algebra |
| | **Total** | **30** | |
