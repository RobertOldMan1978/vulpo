# Estándar: las mini-clases y las introducciones

**Fijado el 02/09/2026.** Vale para las cuatro asignaturas y los seis cursos. El motor vive en
[`assets/js/lecciones.js`](../assets/js/lecciones.js) y las lecciones son **datos**, en
`contenido/<asignatura>-<n>basico/lecciones.json`.

> Nació como el estándar de Matemática, que es donde se construyó primero. Desde el 02/09 cubre
> también a Ciencias, Historia y Lenguaje, con la regla de abajo.

## Qué lleva cada asignatura

**La regla la fijó Roberto:**

| Asignatura | Qué lleva | Granularidad |
|---|---|---|
| **Matemática** | **Mini-clase SIEMPRE**, sin excepción | una por **OA** |
| **Ciencias** e **Historia** | Mini-clase **o** introducción, **si amerita** | mini-clase por OA · introducción por **capítulo** |
| **Lenguaje** | Introducción, o mini-clase **con `"mide": false`**. Solo si amerita | por **capítulo** |

### Lenguaje: por qué NO podía llevar mini-clase, y qué cambió el 06/09/2026

Sus OA son mayoritariamente de **producción o de hábito** —escribir, exponer, recitar, leer
habitualmente—: **17 de 31 en 3°** y **10 de 25 en 7°**. Una clase que enseña a escribir no tiene
cómo comprobar con un quiz que se aprendió, así que su práctica terminaría midiendo si el alumno
**reconoce una definición**, que es otra cosa.

> **Y ahí está la asimetría que ordena todo el estándar: una mini-clase AGREGA una medición al mapa
> de dominio del profesor; una introducción NO.** La introducción no tiene práctica, así que no
> llama a `registrarOA` y no puede ensuciar ningún porcentaje. Por eso es la forma segura donde la
> medición sería engañosa — y por eso Matemática, donde el quiz mide justo lo que la clase enseña,
> la lleva siempre.

**Hasta el 06/09/2026 la conclusión de eso era "Lenguaje nunca lleva mini-clase". Ya no, porque el
problema no era la clase sino el REPORTE.** Un bloque `practica` puede declarar **`"mide": false`**
y entonces no llama a `registrarOA`: enseña y hace practicar, pero **no le manda ningún porcentaje
al profesor**. El objetivo se sigue midiendo donde corresponde —en las etapas normales del
capítulo, con el banco completo—, así que el mapa de dominio no pierde nada y tampoco gana un
número engañoso junto a "escritura".

⚠️ **En Lenguaje esa bandera NO es opcional: toda práctica suya la lleva.** Sin ella vuelve
exactamente el defecto que esta sección existe para evitar. Se comprueba espiando `registrarOA`
mientras se responde la práctica: debe quedar en **0**, y una etapa normal del mismo capítulo debe
darlo en **más de 0** — sin ese control positivo, una medición rota para todos se ve igual que la
bandera funcionando.

> **Lo que esto NO cambia:** Lenguaje sigue teniendo **una sola lección por capítulo** (el cableado
> admite un `intro:'<id>'` y nada más), y sigue valiendo que la mayoría de sus capítulos no lleva
> nada. De sus 36 capítulos con lección posible, hoy hay **33 lecciones en los seis cursos**, y los
> descartes están ahí porque su banco ya enuncia lo que la clase diría.

### Cómo se decide "si amerita"

Se responde **por capítulo**, en este orden, y la primera que dé sí manda:

1. **¿El OA enseña un PROCEDIMIENTO que el alumno ejecuta?** —pasos que se repiten y en los que se
   puede equivocar: leer un gráfico con escala, ubicar en una cuadrícula, calcular con una línea de
   tiempo—. → **Mini-clase**, con su práctica de 10.
2. **¿El capítulo abre un MODELO o un mundo que el alumno no tiene?** —la célula, un circuito, los
   cambios de estado, la Edad Media, el sistema colonial—. → **Introducción** de 2-3 bloques, con
   **un dibujo del modelo**, sin práctica.
3. **Si no es ninguna de las dos**, no lleva nada. Es el caso del contenido que son **hechos
   sueltos**, donde cada pregunta ya enseña con su `tip` y una clase previa sería repetir el banco.

⚠️ **Lo que NO decide: la profundidad del banco.** Medido el 02/09, **los 235 OA con banco del
proyecto tienen 26 preguntas o más** (el mínimo es `LE03`, con 26), así que la práctica nunca se
queda corta y ese criterio no separa nada. Tampoco decide **"la asignatura no tiene dibujos"**: es
cierto de Ciencias, pero **también de Historia de 7° y 8° y de todo Lenguaje** —0% de sus 3.483
preguntas—, así que no distingue a nadie. Ese argumento se usó en el diseño de la Sesión 82 y **no
sobrevivió a volver a medirlo**.

### El techo, para que "si amerita" no se convierta en "siempre"

| | OA | Capítulos | Hoy |
|---|---|---|---|
| Matemática | 62 | 15 | ✅ **62 mini-clases** (una por OA) |
| Ciencias | 43 | 13 | ✅ **13 introducciones** (una por capítulo) |
| Historia | 61 | 16 | ✅ **1 mini-clase + 11 introducciones** (12 de 16 capítulos) |
| Lenguaje | 172 | 63 | ✅ **17 mini-clases + 16 introducciones** (33 de 63 capítulos) |

⚠️ **La fila de Lenguaje cuenta los SEIS cursos; las otras tres son de cuando el proyecto tenía
tres.** Se dejan así a propósito en vez de recalcularlas de memoria: al actualizar una fila hay que
volver a medirla contra los archivos, no estimarla.

O sea que aplicar el criterio con la mano suelta llega a **104 mini-clases más** en Ciencias e
Historia. Aplicado por capítulo como introducción, son **29**. La diferencia entre las dos lecturas
es de meses, así que la granularidad se decide **antes** de escribir, no mientras se escribe.

## La anatomía, medida sobre las 17 de 8°

| | |
|---|---|
| Bloques por lección | **5,2** de promedio |
| Reparto | 32 `texto` · 20 `diagrama` · 20 `ejemplo` · 17 `practica` |
| Fragmentos locutables | **8** por lección (importa solo de 1° a 4°) |
| Peso | 21 KB las 17 |

## Los cuatro tipos de bloque

```json
{"id":"ma7-oa01","oa":"MA07 OA 01","titulo":"Sumar y restar enteros","bloques":[
  {"t":"texto",    "md":"Los números enteros incluyen los positivos, el cero y los negativos."},
  {"t":"diagrama", "kind":"recta", "params":{"desde":-10,"hasta":10,"paso":1},
                   "intro":"Arrastra la marca para ver dónde cae cada número."},
  {"t":"ejemplo",  "intro":"Veamos −3 + 5 paso a paso.",
                   "pasos":["Partimos en −3.","Avanzamos 5 hacia la derecha.","Llegamos a 2."]},
  {"t":"practica", "fromBank":{"oa":"MA07 OA 01","n":10}}
]}
```

- **`texto`** — una idea por bloque. No es una clase entera: es el andamio antes del dibujo.
- **`diagrama`** — invoca un widget del catálogo. `intro` es opcional y **se locuta**.
- **`ejemplo`** — los `pasos` se revelan de a uno. Es la pieza que sostiene el formato: por eso
  las mini-clases solo tienen sentido donde hay **un procedimiento que ejecutar**.
- **`practica`** — reusa el motor de quiz. Va **última**, y es opcional: una lección que se queda
  sin bloques se marca completa igual (así funcionan las introducciones de Ciencias).

### El texto admite `**negrita**`, y SOLO eso (03/09/2026)

El motor no interpreta markdown: pinta con `FRAC.html`, que **escapa**. La única excepción es la
negrita, que agrega `fmtLec` en [`assets/js/lecciones.js`](../assets/js/lecciones.js).

**Se usa para el término que la clase enseña, y para nada más.** *"A eso el currículum le llama
**escasez relativa**"* sí; enfatizar media frase porque parece importante, no. La razón es que se
degrada sola: si cada lección negrita lo que le parece, en tres cursos más está todo resaltado y no
resalta nada. Como mucho, **un término por bloque**.

> ⚠️ **Y hay que tocar DOS sitios, no uno.** El informe de aprobación
> (`scripts/generar-revision-preguntas.py`) imprime el texto de las lecciones con su propio escapado
> en Python. Si el motor entiende la negrita y el informe no, **el profesor aprueba en papel un texto
> distinto del que ve el niño** —con los asteriscos a la vista— y nadie se entera. Por eso ese script
> tiene `esc_md()`, que es el espejo de `fmtLec`.

> ⚠️ **El orden no se invierte: se ESCAPA primero y se marca después.** `FRAC.html` escapa, y la
> negrita se aplica sobre el resultado ya escapado. Al revés se reabre el XSS almacenado de la
> Sesión 51. Probado metiendo `**<img src=x onerror=...>**` en una lección real: sale como texto,
> cero elementos creados.

**Escribir `**` en un texto que no sea eso rompe la pantalla en silencio**: hasta el 02/09 las 27
mini-clases de Matemática de 5° mostraban los asteriscos literales, porque se escribieron con marcas
de markdown que el motor no entendía. Los otros doce archivos tenían cero, así que la convención era
texto plano y se rompió al escribir un curso nuevo.

## ⚠️ Las reglas que ya se pagaron

1. **El `fromBank.oa` tiene que calzar EXACTO con el banco** (`"MA07 OA 01"`, con espacios). Si no,
   la práctica sale vacía y **la lección se marca completa igual, sin medir nada y sin ningún
   error visible**. Se valida contra el banco antes de dar la lección por buena:

   ```bash
   python - <<'EOF'
   import json, io
   NIV='7'
   L=json.load(io.open('contenido/matematicas-%sbasico/lecciones.json'%NIV,encoding='utf-8'))['lecciones']
   P=json.load(io.open('contenido/matematicas-%sbasico/preguntas.json'%NIV,encoding='utf-8'))['preguntas']
   for l in L:
       for b in l['bloques']:
           if b['t']=='practica':
               oa=b['fromBank']['oa']; n=sum(1 for q in P if q['oa']==oa)
               print(l['id'], oa, n, 'OK' if n>=10 else '*** FALLA ***')
   EOF
   ```

2. **La práctica sirve 10 preguntas** (`n:10`) y **3 en modo revisión** — eso lo resuelve el motor,
   no el dato.
3. **El dibujo no puede delatar la respuesta** de su práctica. En la Sesión 55, 17 preguntas de 3°
   tuvieron que perder su visual por esto, y una de ellas ofrecía como distractor justo el número
   que el dibujo dejaba contar.
   > ⚠️ **Pero en una mini-clase la regla se lee mal si se aplica a ciegas.** Un barrido automático
   > sobre las 26 de 3° marcó **49 coincidencias**, y casi todas eran el **vocabulario que la
   > lección existe para enseñar**: "traslación", "columna", "3/4", "ángulo recto". Una clase de
   > transformaciones que evite decir *traslación* no es una clase. **El defecto real es otro: que
   > la lección resuelva el CASO NUMÉRICO EXACTO que una pregunta va a preguntar**, cuando el
   > concepto se enseña igual con cualquier otro número. Pasó dos veces —el ejemplo llegaba a
   > `604` y a `405`, y el banco pregunta justo por esos— y se arregla cambiando el número, a
   > costo pedagógico cero. **Distinguir las dos cosas es a mano; un informe que marca lo correcto
   > se deja de leer.**
   > **Y hay una consecuencia que conviene decir:** el porcentaje que el mapa de dominio produce
   > justo después de una mini-clase mide **recuerdo inmediato**, no dominio del año. Es propio
   > del diseño "enseña → desafío", vale igual en 8° y 7°, y no se lee como maestría.
4. **De 1° a 4° el texto se va a locutar**: frases cortas, sin abreviaturas, y nada que solo se
   entienda **viendo** la grafía. La voz se genera **al final y después de aprobar** — cada texto
   corregido obliga a regenerar su clip y a pagarlo de nuevo.
5. **Las fracciones se escriben `n/m` y el juego las apila**
   ([`estandar-fracciones.md`](estandar-fracciones.md)). El dato no se toca.
6. ⚠️ **El banco de la práctica sale de `CFG.ruta`, NO del nombre de la asignatura.** Hasta el
   02/09 lo buscaba con `contenidoDeAsignatura('Matemáticas')`, y **3° escribe `'Matemática'` en
   singular**: la búsqueda devolvía `null`, caía a un respaldo literal al banco de **8°**, lo
   filtraba por `MA03` y no encontraba nada. Y una práctica vacía **marca la lección completa
   igual** (regla 1), así que el profesor veía la lección hecha y el objetivo sin datos. Es el
   quinto caso del mismo defecto del fork; la salida es la de siempre: **el banco de un curso vive
   al lado de sus lecciones**, así que se deduce de la ruta y no hay nombre que calzar.
7. **El 🔊 lo pone el motor, no el curso.** `textoLocutable(b)` arma lo que se lee **desde los
   datos y no desde el DOM** —el cuerpo pintado arrastra los rótulos del SVG ("centenas",
   "7 centenas"), que son apoyo visual y suenan a disparate leídos de corrido—. El botón aparece
   solo si `VOZ.activo` y el bloque tiene algo que decir, así que en 7° y 8° nunca se ve **sin
   necesidad de una bandera**. Esa función es además la lista exacta de fragmentos que
   `generar-voz-nivel.py` tiene que sacar de `lecciones.json`.
8. ⚠️ **Un widget se aprueba MIRANDO la captura, no contando elementos.** En la Fase 4 el
   `viewBox` de `cuadricula` medía 176 y su etiqueta *"Vulpi está en la casilla (C, 2)"* salía
   **cortada por el borde**: `scrollWidth` no desbordaba, el SVG tenía su `<svg>`, el alto era
   correcto y **ninguna medición lo decía**. Un widget con etiqueta larga lleva ancho mínimo.

### ⚠️ Un dibujo no puede regalar la clave de una pregunta del banco

Es la regla que ya tiene su sección más abajo, pero el widget **`barras`** merece su nota porque
**imprime el valor sobre cada barra**: en la introducción del agua de Ciencias de 5° la barra decía
`97` y `cien5-oa12-1` pregunta justamente *"¿qué parte del agua es salada?"* con clave *"Alrededor
del 97%"*. El niño lo leía y lo elegía de memoria treinta segundos después, y el mapa de dominio
habría medido **recuerdo**, no si entendió.

Desde el 03/09 se apaga con **`"valores": false`** en los `params`. Por omisión **se muestran**, y
eso no se cambia: la lección `ma-oa16` de 8° usa este widget para enseñar cómo un gráfico engaña, y
ahí los números *son* la lección.

    {"t":"diagrama","kind":"barras","intro":"Mira el tamaño de cada barra.",
     "params":{"datos":[{"etiqueta":"salada","valor":97},{"etiqueta":"dulce","valor":3}],
               "top":100,"valores":false}}

La pregunta que hay que hacerse al poner un gráfico: *¿la lección enseña una **proporción** o un
**número**?* Si es una proporción, el número sobra y puede hacer daño.

## El catálogo de dibujos: son DOS, y no se fusionan

| | Dónde | Tipos | Qué son |
|---|---|---|---|
| `assets/js/visuales.js` | compartido | **11** — contar, agrupar, fracción, recta, reloj, barras, cuerpo, cuadrícula, globo, zonas, línea | **estáticos**, dentro de una pregunta |
| `assets/js/lecciones.js` | compartido | **23** — algebra, arbol, balanza, barras, bloques, cajon, circulo, cuadricula, dinero, **esquema**, figura, fracciones, funcion, pictograma, poligono, posicional, potencias, puntos, recta, reloj, solido, transformacion, triangulo | **interactivos**, para enseñar |

⚠️ **Comparten tres nombres —`recta`, `barras`, `fraccion(es)`— a propósito y con
implementaciones distintas.** No es un descuido: un dibujo que ilustra una pregunta y uno que el
niño arrastra para descubrir una regla son dos cosas legítimamente distintas, y unificarlas es un
refactor con riesgo sobre producción a cambio de nada.

Al agregar un widget nuevo va con su **descripción para lector de pantalla**, que tampoco puede
delatar la respuesta (dice "una marca en uno de los saltos", nunca su número).

### `esquema`: el dibujo que no es de números (03/09/2026)

Los otros 22 widgets nacieron para Matemática, y por eso el déficit de dibujos estaba **medido**
donde nadie miraba: Lenguaje tenía **2 de 12** lecciones con dibujo y Ciencias **7 de 17**, contra
**87 de 89** en Matemática.

La salida no fue escribir 24 widgets a medida sino **uno data-driven con tres formas**, que cubre
casi todo lo que Lenguaje, Ciencias e Historia necesitan — y que 4° y 6° heredan gratis:

| forma | Para qué | Ejemplo real |
|---|---|---|
| `comparar` | 2 o 3 ideas enfrentadas | hecho / opinión · virus / bacterias / hongos |
| `secuencia` | pasos encadenados con flechas | respiras → sangre → célula |
| `niveles` | estratos apilados (`piramide:false` para que no se estrechen) | los estamentos coloniales · célula → tejido → órgano |

    {"t":"diagrama","kind":"esquema","intro":"La distinción que sostiene el capítulo.",
     "params":{"forma":"comparar","desc":"Diferencia entre un hecho y una opinión",
       "items":[{"titulo":"Un hecho","texto":"Se puede comprobar."},
                {"titulo":"Una opinión","texto":"Se puede discutir."}],
       "etiqueta":"Y casi ningún texto es solo una de las dos"}}

- **`items`: 2 a 4.** Con más, las columnas quedan ilegibles en un teléfono.
- **`titulo` corto y `texto` de una frase.** El widget parte las líneas solo, pero un párrafo
  dentro de una caja no se lee.
- **`desc`** es para el lector de pantalla, y en una mini-clase **con práctica** no puede delatar
  la clave de una pregunta del banco.
- **`etiqueta`** es el remate dorado al pie. Opcional, y sirve para la conclusión.

> **Con esto el proyecto queda en 129 de 130 lecciones con dibujo.** La única sin él es
> `ci7-sexualidad`, y es una decisión: es contenido sensible, un esquema no aporta nada ahí, y el
> estándar ya dice que **un dibujo que no aporta es peor que ninguno**.

> ⚠️ **Agregar un dibujo a una lección ya aprobada la devuelve a la cola.** El texto no cambia,
> pero lo que el profesor firmó sí: ahora se ve otra cosa. Las 23 tocadas quedaron con
> `revisada:false` a propósito — la marca es por id, así que si no se desmarcan se quedarían
> aprobadas mostrando algo que nadie revisó.

## Cómo se agrega un curso

Ya no se toca el motor. Son cuatro datos:

1. **El `<script src>` y su respaldo** — idénticos a los de los otros cursos (mismo hash).
2. **`HAY_MINICLASES=true`** y, **pegada a ella**, la llamada:
   ```js
   LECC.init({ ruta:'contenido/matematicas-<n>basico/lecciones.json', hayReto:HAY_RETO_CALCULO });
   ```
   ⚠️ **Pegada, no arriba con las otras constantes:** un `const` leído antes de declararse mata
   todo el JavaScript, y esa trampa ya mordió cuatro veces. Y `init` necesita el `<body>`, que
   solo existe cuando corre el script inline.
3. **`esLecciones:true` y `capitulosMate`** en su campaña de Matemática, una unidad por capítulo:
   ```js
   {id:'mate7-numeros', titulo:'Números', portada:'assets/portada-mate-numeros.png',
    lecciones:['ma7-oa01','ma7-oa02','ma7-oa03','ma7-oa04','ma7-oa05']},
   ```
   ⚠️ **La `portada` va EXPLÍCITA.** La convención implícita `portada-<id>.png` pediría archivos
   que no existen, y el `onerror` los tapa **a la vista, no en la red**. Es la doctrina de 3° y 7°.
   ⚠️ Y **el id de la unidad no puede chocar con ningún id de `EXPEDICIONES`**: se comprueba antes.
4. **Una introducción se cablea distinto: con `intro:'<id>'` en la expedición del capítulo.**
   El nodo 📘 lo dibuja `LECC.nodoIntro` desde `renderMapa`, **al principio del mapa**.
   ⚠️ **Va FUERA del arreglo indexado de etapas, y no es negociable:** el avance vive en
   `S.rutas[id].progreso` **indexado por posición**, así que meterla como etapa 0 correría todas
   las demás y **le rompería la partida a quien ya venía jugando**. Verificado sembrando un save
   con `done,done,open,lock,lock` y comprobando que sale idéntico con el nodo delante.
   Y **no bloquea**: es un ofrecimiento, no un peaje. Quien la salta juega igual.
5. **Cada asignatura trae su propio archivo**, y `LECC.init` recibe la lista:
   ```js
   LECC.init({ rutas:['contenido/matematicas-<n>basico/lecciones.json',
                      'contenido/ciencias-<n>basico/lecciones.json'], hayReto:HAY_RETO_CALCULO });
   ```
   Se fusionan como `voz.js` fusiona sus manifiestos, y **cada lección se queda con el banco de
   su propio archivo** — por eso la práctica no necesita saber de qué asignatura es.
6. ⚠️ **Las unidades NO van en `EXTRAS`** (desde la Sesión 98). Estuvieron ahí entre las Sesiones
   82 y 98 porque el armador solo lista `EXPEDICIONES` y sin eso un profesor con enlace de
   muestra nunca veía lo que enseña. Hoy eso está resuelto por otro lado y mejor: **las
   mini-clases viven dentro de su expedición** —son los primeros nodos de su mapa, y viajan con
   ella por los cuatro caminos de entrada (campaña, `?solo=`, `?m=` y el armador)— así que la
   casilla suelta le mostraba al profesor la misma unidad dos veces. `EXTRAS` queda solo para lo
   que de verdad es una pantalla aparte: el Reto de Cálculo y el Reto Sin Fin.
   > **Y de ahí la regla general:** qué lecciones le tocan a una expedición se resuelve en
   > `activarExpedicion` (`leccionesDeExpedicion`), **nunca en el clic de una pantalla**. A una
   > expedición se entra por cuatro caminos y en tres de ellos ese clic no ocurre.

## Cómo se aprueban (02/09/2026)

**Hasta el 02/09 no había forma de aprobarlas**, siendo lo único del proyecto que **enseña**: el
tablero solo las contaba con un chip y el informe traía su casilla impresa, pero esa marca no
llegaba a ninguna parte. Ahora el circuito es el mismo de las preguntas, de punta a punta:

1. **`dev/tablero.html`** las muestra **enteras** —texto, ejemplo y **el diagrama dibujado de
   verdad**, porque el generador incrusta `assets/js/lecciones.js`— con su casilla, en una sección
   propia por asignatura y un botón *"✓ Aprobar todas"*.
2. **"Exportar revisadas"** ya las incluye: usan el mismo almacén y su `id` (`ma3-oa01`,
   `ci8-celula`) no choca con ningún id de pregunta.
3. **`aplicar-revisadas.py`** escribe `revisada:true` en el `lecciones.json` que corresponda.

⚠️ **El `lecciones.json` va en el formato canónico** (`indent=1`, LF, sin salto final), igual que
un banco. Los tres de Ciencias nacieron escritos a mano con otro formato y **marcar dos lecciones
reformateaba el archivo entero —74 líneas por 2 marcas—**, que es el mismo defecto que la Sesión 72
arregló para los bancos. Canonizados, marcar una lección son **2 líneas**.

⚠️ **El tablero abre en "👁 Solo lo pendiente"** y manda las asignaturas sin pendientes **al final**,
no solo las pliega: con 23 de 29 aprobadas, dejarlas arriba son ~2.700 px de scroll antes de llegar
a lo que hay que revisar. Y decide qué está pendiente con **el dato que declara el generador**
(`data-pend-preg`), no contando casillas del DOM: **las preguntas solo se pintan al desplegar su
OA**, así que 12 de las 29 secciones tienen cero casillas y contarlas las daba por no aprobadas.

## ⚠️ Lo que hay que saber antes de publicar

**Cablear las unidades sin escribir sus lecciones deja la asignatura INJUGABLE.** Con el
`lecciones.json` vacío, en juego normal cada expedición queda en *"🔒 Termina las lecciones"* y no
hay forma de completarlas: las unidades se ven con el id crudo de cada lección. **El cableado y el
contenido se publican juntos.**

## Lo que el motor resuelve solo, y no hay que replicar

- El **nodo del Reto Sin Fin** lo dibuja `nodoSinFin()` de `motor.js`, que llaman **las dos**
  pantallas de campaña. Si se duplicara, un curso perdería su Reto al encender `esLecciones` —
  estuvo a punto de pasar en 7° y 3°.
- El **nodo del Reto de Cálculo** va guardado con `CFG.hayReto`: solo donde el Reto existe.
- El **modo revisión** (3 preguntas) y **`CAPS_ABIERTOS`** (todo abierto en modo prueba) ya están
  aplicados en la práctica y en el desbloqueo de las lecciones.
