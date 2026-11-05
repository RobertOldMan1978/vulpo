# Prompts de arte de 1° básico

> **Qué es esto.** El arte que necesita 1° básico: la portada de cada uno de sus **22 capítulos**
> (reparto propuesto en [`reparto-1basico.md`](reparto-1basico.md)) y sus **4 villanos**. Mismo
> método que 2°, 4°, 5° y 6° ([`estandar-arte-portadas.md`](estandar-arte-portadas.md)): primero se
> busca entre las portadas existentes una que calce **por TEMA** (nunca por número de capítulo), y
> solo lo que no tiene candidato honesto pide imagen nueva.
>
> Flujo de siempre: **Roberto genera** con IA, **el asistente procesa** con
> `scripts/procesar-arte.py` y cablea el resultado en `1ro/index.html` (`portadaMapa:` explícito en
> cada capítulo, `villanoImg`/`villanoImgDerrotado` en cada `jefeFinal`).
>
> **Resultado: 15 capítulos reutilizan, 7 piden portada nueva, y los villanos son 8 imágenes.**
> En total, **15 imágenes por generar.**
>
> ⚠️ Las 9 portadas nuevas de 2° (`portada-*2-cap*.png`) **todavía no existen**: no se cuentan como
> candidatas aquí. Si al generarlas alguna calza mejor con 1°, se puede revisar entonces.

---

## PARTE 0 · Capítulo → portada

Revisadas **mirando** las 59 portadas del proyecto en un mosaico, no por nombre. Ninguna portada se
repite dentro de 1°.

### Matemática (6) — 5 reutilizan, 1 nueva

| Capítulo | Decisión | Archivo | Por qué |
|---|---|---|---|
| `mate1-cap1` Contar hasta 100 | Reutilizar | `portada-mate-numeros.png` | Vulpi salta por una recta numérica con números: contar y leer números |
| `mate1-cap2` Los números hasta 20 | **Nueva** | `portada-mate1-cap2.png` | Más y menos, estimar y la primera decena: ninguna muestra cantidades chicas para comparar |
| `mate1-cap3` Sumar y restar hasta 20 | Reutilizar | `portada-mat3-cap2.png` | «Sumar y restar» de 3°: + y − grandes, ábaco y fichas |
| `mate1-cap4` Figuras y posiciones | Reutilizar | `portada-mate-geometria.png` | Cubo, pirámide, esfera y figuras planas |
| `mate1-cap5` Medir el tiempo y el largo | Reutilizar | `portada-mat3-cap6.png` | Reloj y huincha de medir |
| `mate1-cap6` Contar datos | Reutilizar | `portada-mate-datos.png` | Gráfico de barras, dados y lupa |

### Lenguaje (8) — 7 reutilizan, 1 nueva

| Capítulo | Decisión | Archivo | Por qué |
|---|---|---|---|
| `leng1-cap1` Los sonidos de las palabras | **Nueva** | `portada-leng1-cap1.png` | Sonidos y sílabas: el capítulo más propio de 1°, sin nada parecido |
| `leng1-cap2` Leer en voz alta y escribir oraciones | Reutilizar | `portada-leng-escritura.png` | Pluma sobre pergamino: escribir oraciones |
| `leng1-cap3` Comprender cuentos | Reutilizar | `portada-leng-literarios.png` | Vulpi sale de un libro con castillo: mundos de cuento |
| `leng1-cap4` Poemas, rimas y teatro | Reutilizar | `portada-leng4-cap9.png` | Escenario, máscaras y micrófono |
| `leng1-cap5` Textos que informan | Reutilizar | `portada-leng-textos.png` | Diario, megáfono y pantalla |
| `leng1-cap6` Me gusta leer | Reutilizar | `portada-leng-lectura.png` | Vulpi leyendo un libro abierto |
| `leng1-cap7` Palabras nuevas | Reutilizar | `portada-len3-cap3.png` | Es «Palabras nuevas» de 3°: libro con lupa |
| `leng1-cap8` Hablar y escuchar | Reutilizar | `portada-len3-cap7.png` | Dos zorritos conversando, globos vacíos y una oreja |

### Ciencias (4) — 2 reutilizan, 2 nuevas

| Capítulo | Decisión | Archivo | Por qué |
|---|---|---|---|
| `cie1-cap1` Mi cuerpo y los seres vivos | Reutilizar | `portada-cien-cuerpo.png` | Corazón, pulmones, fruta y Vulpi corriendo: hábitos y cuerpo |
| `cie1-cap2` Animales y plantas de Chile | Reutilizar | `portada-cie6-cap1.png` | Vulpi riega un brote con un pájaro y una abeja: plantas y animales juntos |
| `cie1-cap3` Los materiales | **Nueva** | `portada-cie1-cap3.png` | `cien-materia` es un laboratorio de átomos (8°): nada de madera, metal, lana y vidrio |
| `cie1-cap4` El día, la noche y las estaciones | **Nueva** ⚠️ | `portada-cie1-cap4.png` | `cie3-cap2` (planetas) solo toca el día y la noche (ver dudas) |

### Historia (4) — 1 reutiliza, 3 nuevas

| Capítulo | Decisión | Archivo | Por qué |
|---|---|---|---|
| `hist1-cap1` Yo y el paso del tiempo | **Nueva** | `portada-hist1-cap1.png` | Calendario, antes y ahora, quién soy: no hay ninguna |
| `hist1-cap2` Mi familia y mi comunidad | **Nueva** ⚠️ | `portada-hist1-cap2.png` | Familia y trabajos del barrio (ver dudas) |
| `hist1-cap3` Mapas, paisajes y personas de Chile | Reutilizar | `portada-hist3-cap1.png` | Vulpi con globo terráqueo, mapa y brújula |
| `hist1-cap4` Chile y los niños del mundo | **Nueva** | `portada-hist1-cap4.png` | Símbolos, fiestas y niños de otros países: las de bandera son de la Independencia (8° y 6°) |

### Dudas (las ⚠️ de las tablas)

- **`cie1-cap4` → nueva.** `cie3-cap2` (Vulpi entre el Sol y los planetas) cubre el día y la noche,
  pero no las estaciones, que son la mitad del capítulo. Es el respaldo si se quiere ahorrar una
  imagen.
- **`hist1-cap2` → nueva.** `hist3-cap5` («Vivir juntos»: plaza con zorritos diversos) cubre la
  comunidad y las normas, no la familia. Respaldo aceptable.
- ⚠️ **El Marchitón se parece en la IDEA a La Sequía de 2°** (las dos secan plantas). Por eso su
  dibujo va por otro lado —hojas secas y viento frío, no tierra agrietada y calor—, pero si se
  prefiere otra idea, el reparto (P1) es el momento de cambiarlo.

> **Fuera de estos 22:** la expedición `voc-general` (Vocabulario) y el módulo 🏛️ Formación
> Ciudadana usan su portada de siempre en todos los cursos.

---

## PARTE 1 · Las 7 portadas nuevas

### BLOQUE DE ESTILO — pégalo ANTES de cada escena

Es el de 2°, con la línea de densidad bajada a 6-7 años.

```
Ilustración cuadrada para una app educativa infantil, estilo vectorial limpio y redondeado, tipo
videojuego amable. Composición: una VIÑETA CIRCULAR con grueso borde dorado, centrada sobre el
lienzo cuadrado. Dentro de la viñeta, fondo violeta profundo y cósmico (violeta #8f6bff sobre
morado oscuro) con pequeños destellos y estrellitas. Protagonista: VULPI, un zorro mascota
simpático de pelaje naranja y crema, con capucha (hoodie) violeta, DE CUERPO ENTERO y EN ACCIÓN
(haciendo algo, no posando). A su alrededor flotan objetos temáticos del capítulo. Paleta: violeta,
dorado y cian brillante. IMPORTANTE: la imagen NO lleva NINGÚN texto — ni palabras, ni títulos, ni
frases, ni letras del abecedario. (Los símbolos matemáticos sueltos —+ − = < >— y los numerales sí
se permiten como elemento decorativo cuando el tema lo pide.) Alta resolución, centrada, apta para
recortar a 512×512. Escena para niños de 6 o 7 años: la más simple de todas, Vulpi muy grande en
primer plano, solo 2 o 3 objetos alrededor, grandes, redondos y fáciles de reconocer, colores
luminosos y alegres.
```

> Si al calibrar la primera hay que ajustar el look, se cambia **solo aquí** y vale para las siete.

### Ciencias (2) — la tanda de calibración

**`cie1-cap3` · Los materiales**
```
Escena: Vulpi, sentado en el suelo, ordena objetos en tres cajas: en una hay bloques de MADERA, en
otra una cuchara y una olla de METAL brillante, y en la tercera un ovillo de LANA suave. Sostiene
en alto un vaso de vidrio transparente, mirándolo con curiosidad. Flota alrededor una pelota de
goma que rebota.
```

**`cie1-cap4` · El día, la noche y las estaciones**
```
Escena: Vulpi, de pie en el centro, señala hacia arriba con alegría: la viñeta está partida en dos
mitades, a un lado un cielo de DÍA con un sol sonriente y al otro un cielo de NOCHE con una luna y
estrellas. A sus pies, cuatro arbolitos pequeños en fila muestran las cuatro estaciones: con
flores, con hojas verdes, con hojas naranjas cayendo y con nieve.
```

### Matemática (1) y Lenguaje (1)

**`mate1-cap2` · Los números hasta 20**
```
Escena: Vulpi compara dos montones de manzanas rojas sobre una mesa: uno grande y uno chico, y
señala el más grande con una sonrisa. A su lado hay una caja de huevos con diez huevos en dos
filas (como una decena). Flotan los símbolos > y < grandes y dorados.
```

**`leng1-cap1` · Los sonidos de las palabras**
```
Escena: Vulpi, con una oreja levantada, escucha con mucha atención. De un tambor que golpea con
la mano salen burbujas de colores en fila, como palmadas que separan los sonidos de una palabra.
Flotan alrededor una campanita y unas notas musicales. Las burbujas van completamente vacías, sin
ninguna letra adentro.
```

### Historia (3)

**`hist1-cap1` · Yo y el paso del tiempo**
```
Escena: Vulpi, de pie junto a un espejo de marco dorado, se mira contento; en el reflejo aparece
él mismo más pequeño, como un cachorrito. A su lado cuelga un calendario de pared con casillas en
blanco (sin números ni letras), y flotan un reloj de arena y una fotografía antigua con borde
blanco.
```

**`hist1-cap2` · Mi familia y mi comunidad**
```
Escena: Vulpi camina de la mano de dos zorros adultos (su familia) por una calle de barrio con
casitas de colores. Al fondo, una panadería con pan en la vitrina, un bombero que riega un árbol
con una manguera y un cartero que reparte cartas, todos zorros simpáticos. Flota un corazón
dorado sobre la familia.
```

**`hist1-cap4` · Chile y los niños del mundo**
```
Escena: Vulpi, en el centro, encumbra un volantín de colores mientras sostiene una pequeña
bandera de Chile (sin escudo con letras). A su alrededor, tres zorritos amigos de pelajes
distintos juegan cada uno a algo diferente: uno salta la cuerda, otro hace girar un trompo de
madera y otro patea una pelota. Flota un globo terráqueo sonriente.
```

---

## PARTE 2 · Los 4 villanos (8 imágenes)

Cada villano necesita **dos imágenes**: la normal y la **derrotada**. Archivos:
`assets/villano-<asignatura>-1ro.png` y `assets/villano-<asignatura>-1ro-derrotado.png`.

**Estilo de referencia: los de 3°** (redondos, rechonchos y con ojos grandes), un paso más
tiernos todavía: a los 6 años un villano tiene que hacer reír, no asustar.

### BLOQUE DE ESTILO — pégalo antes de cada villano

```
Ilustración cuadrada para una app educativa infantil (videojuego amable): el personaje es un
VILLANO fantástico, travieso y juguetón, pero NUNCA da miedo — es un villano de dibujo animado para
niños de 6 o 7 años: cuerpo REDONDO, pequeño y rechoncho, ojos enormes y expresivos, sonrisa
pícara. Estilo vectorial limpio y redondeado, coherente con el resto del juego (mismo nivel de
detalle que Vulpi, la mascota zorro). Fondo LISO de un solo color bien distinto del personaje
(negro puro o violeta muy oscuro), sin viñeta ni decorado, para poder recortarlo después. Paleta
dominante: tonos oscuros con acentos ROJO/CARMESÍ y algún detalle dorado. El personaje va DE CUERPO
ENTERO, centrado, en una pose de burla. IMPORTANTE: la imagen NO lleva NINGÚN texto, ni palabras,
ni letras, ni números escritos; si aparecen globos de diálogo, van completamente en blanco. Alta
resolución, apta para recortar dejando solo la figura sobre fondo transparente.
```

**Para la versión DERROTADA, agregar al final del prompt** (en la misma conversación, como edición
de la imagen normal, para que el encuadre calce):
```
Ahora en su versión DERROTADA: el mismo personaje pero apagado y sin fuerza — menos brillo, ojos
entrecerrados o en espiral, postura caída o desinflada como un globo sin aire. Nunca partido en
pedazos ni con sangre: es para niños, la idea es "perdió", no "se rompió para siempre". Mismo
encuadre, tamaño y ángulo de cámara que la versión normal.
```

### Matemática · «El Comenúmeros» 🍪

Se come los números de la recta y deja huecos. Distinto de **El Desorden** de 2° (que los revuelve)
y de **El Número Perdido** de 3°. **Sin numerales en la imagen**: las cantidades van como puntos.
```
El villano: una criatura redonda y glotona con una boca enorme y sonriente, que muerde una RECTA
NUMÉRICA como si fuera una galleta larga: a la recta le faltan pedazos con marcas de mordiscos. De
la boca le caen migas brillantes, y en la otra mano sostiene una ficha de dominó (con puntos, sin
números) a medio comer. Lleva una servilleta amarrada al cuello.
```
*Derrotado:* el mismo, sentado y con la pancita llena, con hipo; la recta otra vez entera a su lado.

### Lenguaje · «La Bulla» 📢

Tapa los sonidos de las palabras con ruido. Distinta de **El Ladrón de Letras** de 2° y de **El
Borrón** de 3°: esta es **puro ruido**.
```
El villano: una criatura redonda y chillona con un cuerpo como un parlante, que toca a la vez una
corneta y unos platillos, con los cachetes inflados. De ella salen ondas de ruido en zigzag rojas y
naranjas que tapan unas burbujas de colores vacías (sin letras adentro). Se ríe a carcajadas.
```
*Derrotado:* la misma, con los platillos caídos y un tapón de corcho en la corneta, soltando apenas
una burbujita de sonido suave; las burbujas de colores otra vez limpias.

### Ciencias · «El Marchitón» 🍂

Marchita las plantas y deja a los animales sin su casa. ⚠️ Tiene que verse distinto de **La
Sequía** de 2° (tierra agrietada y calor): este es **hojas secas y viento frío**.
```
El villano: una criatura redonda hecha de hojas secas café y naranja, como un montón de hojarasca
con ojos grandes y una sonrisa traviesa. Sopla un viento frío en espiral que hace caer los pétalos
de una flor y deja un nido de pajaritos vacío y tambaleante en una rama. Un caracol y una
mariquita se esconden asustados detrás de una piedra.
```
*Derrotado:* el mismo, desarmado en un montoncito de hojas bajo un rayo de sol; la flor otra vez
abierta y el nido con sus pajaritos de vuelta.

### Historia · «El Remolino» 🌪️

Revuelve el calendario, los mapas y las fiestas. Distinto de **La Neblina** de 2° (que los borra)
y de **El Olvido** de 3°: este **gira y lo desordena todo**, sin personas ni culturas.
```
El villano: un remolino redondo y travieso de viento violeta con ojos grandes y una sonrisa
pícara, que gira sobre sí mismo como un trompo. En su torbellino vuelan revueltas las hojas de un
calendario (casillas en blanco, sin números), un mapa enrollado, un volantín de colores enredado y
una guirnalda de fiesta. Se tambalea feliz por el mareo que causa.
```
*Derrotado:* el mismo, quieto y mareado, con los ojos en espiral; las hojas del calendario
ordenadas en una pila y el volantín otra vez volando derecho.

---

## PARTE 3 · Cómo generarlas: 15 imágenes en 5 tandas

| Tanda | Qué | Imágenes | Por qué en este orden |
|---|---|---|---|
| 1 | Ciencias: `cie1-cap3`, `-cap4` | 2 | **Calibración.** Menor riesgo editorial |
| 2 | `mate1-cap2` y `leng1-cap1` | 2 | Escenas simples, ya con el estilo calibrado |
| 3 | Historia: `hist1-cap1`, `-cap2`, `-cap4` | 3 | Con el estilo ya firme |
| 4 | Villanos: Matemática y Lenguaje, normal + derrotado | 4 | Cada derrotado justo después de su normal |
| 5 | Villanos: Ciencias e Historia, normal + derrotado | 4 | Ídem |
| | **Total** | **15** | 7 portadas + 8 villanos |

### Después de generar

Los mismos nueve pasos de [`prompts-arte-2basico.md`](prompts-arte-2basico.md) (Parte 3), con
`1ro` en vez de `2do`. Los tres que más pesan: **identificar cada imagen MIRÁNDOLA** (el orden de
descarga engaña), **revisar que no se colaron letras** (en el calendario, las burbujas, la
bandera) y **medir el modo y el fondo de cada archivo antes de elegir `--fondo`**, contando después
los píxeles transparentes dentro de cada viñeta.
