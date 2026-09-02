# Mini-clases en 3° y 7°, e introducciones de Ciencias — Plan

> **Para quien lo ejecute:** las tareas van en orden y cada fase se verifica **jugando** con
> `scripts/cdp.mjs` antes de pasar a la siguiente. Los pasos usan casillas (`- [ ]`).

**Meta:** que Matemática de 3° y 7° tenga su camino de mini-clases como 8°, y que Ciencias tenga
una introducción por capítulo.

**Arquitectura:** el motor de lecciones sale de `juego/index.html` a `assets/js/lecciones.js`,
compartido por los tres cursos; las lecciones son **datos** (`contenido/<asig>-<n>basico/
lecciones.json`) y el motor no se toca al agregar un curso.

**Diseño:** [`docs/superpowers/specs/2026-09-02-miniclases-e-introducciones-design.md`](../specs/2026-09-02-miniclases-e-introducciones-design.md)

---

## ⚠️ Dos reglas de este repositorio que NO son las del formato estándar

1. **No se hace commit ni push** hasta que Roberto dé la **orden 66**. Ningún paso de este plan
   incluye `git commit` a propósito.
2. **No hay pruebas automatizadas.** La verificación de este proyecto es correr la página con
   `node scripts/cdp.mjs about:blank <pasos.mjs>`, porque **los 404 no llegan a la consola de
   forma fiable** y una función llamada suelta no equivale a recorrer la pantalla (Sesión 56).
   Cada tarea termina con su verificación en el navegador.

---

## Estructura de archivos

| Archivo | Qué pasa |
|---|---|
| `assets/js/lecciones.js` | **Nuevo.** Catálogo de 12 diagramas interactivos + motor de lecciones + las 4 funciones de la campaña mate |
| `juego/index.html` | Pierde 479 líneas del tramo + 4 funciones sueltas; gana el `<script src>` y su respaldo |
| `7mo/index.html` · `3ro/index.html` | Ganan el `<script src>`, su respaldo, `HAY_MINICLASES=true`, `capitulosMate` y `esLecciones` |
| `contenido/matematicas-7basico/lecciones.json` | **Nuevo.** 19 mini-clases |
| `contenido/matematicas-3basico/lecciones.json` | **Nuevo.** 26 mini-clases |
| `contenido/ciencias-{3,7,8}basico/lecciones.json` | **Nuevos.** 4 + 5 + 4 introducciones |
| `scripts/generar-revision-preguntas.py` | Incluye las lecciones, con sus diagramas dibujados |
| `scripts/generar-tablero.py` | Cuenta las lecciones **aparte** de la cobertura curricular |
| `scripts/generar-voz-nivel.py` | Aprende a leer `lecciones.json` |
| `docs/estandar-miniclases.md` | **Nuevo.** El estándar, para los cursos que vengan |

---

# Fase 1 · El motor sale del fork

## Tarea 1: Guardar las referencias cruzadas antes de tocar nada

Es el paso que la Sesión 65 identificó como el que casi mata las dos apps: `detenerTimersActivos`
hace `clearInterval(RC.timer)` y **la llama la barra inferior**, o sea un toque que cualquier
alumno da.

**Archivos:** ninguno (solo medición)

- [ ] **Paso 1: Enumerar quién nombra lo que se va a mover**

```bash
cd /c/Proyectos/kimun
for s in DIAGRAMAS renderDiagrama abrirLeccion renderBloque avanzarBloque cargarLecciones \
         leccionPorId tituloLeccion iniciarLeccionPorId abrirCapituloMate renderLeccionesMate \
         volverAlCapituloMate abrirMiniClaseDeOA abrirUnidadMate iniciarPracticaLeccion \
         finPracticaLeccion terminarLeccion marcarLeccionCompleta preguntasDeOA \
         renderCampañaMate capMateCompleto jefeFinalMateDesbloqueado cargarPoolMate \
         LECCIONES LEC CAP_MATE TRAS_LECCION NS svgEl; do
  printf '%-28s juego=%s motor=%s 7mo=%s 3ro=%s\n' "$s" \
    "$(grep -c "$s" juego/index.html)" "$(grep -c "$s" assets/js/motor.js)" \
    "$(grep -c "$s" 7mo/index.html)" "$(grep -c "$s" 3ro/index.html)"
done
```

Anotar el resultado. **Todo símbolo que aparezca en `motor.js` o fuera del tramo que se corta es
una referencia cruzada** y tiene que seguir resolviendo después del corte.

- [ ] **Paso 2: Comprobar que `NS` no es una trampa**

`NS` es el namespace SVG y lo usan **los dos** catálogos de dibujo. La Sesión 65 midió que en 3°
su única aparición fuera del bloque **está dentro de un comentario**, pero eso fue antes de
`visuales.js`. Volver a medirlo:

```bash
grep -n "NS" assets/js/visuales.js | head
grep -n "createElementNS\|svgEl(" assets/js/visuales.js | head
```

Si `visuales.js` declara su propio namespace, **el módulo nuevo declara el suyo** y no hay
conflicto. Si lo toma de una global, hay que resolverlo antes de cortar.

- [ ] **Paso 3: Comprobar que ningún `id` del HTML que se conserva lo nombra el código que se va**

```bash
for id in scr-leccion lecCuerpo lecCont lecSalir lecProgBar lecTit; do
  printf '%-14s juego_html=%s\n' "$id" "$(grep -c "$id" juego/index.html)"
done
```

Este chequeo frenó el primer intento de la Sesión 65. **El HTML de `scr-leccion` se queda en cada
fork** (es markup, no motor); lo que se mueve es el JavaScript que lo llena.

---

## Tarea 2: Crear `assets/js/lecciones.js` con el contenido movido

**Archivos:**
- Crear: `assets/js/lecciones.js`
- Modificar: `juego/index.html` (quitar el tramo 1913–2391 y las 4 funciones sueltas)

- [ ] **Paso 1: Escribir el script de extracción con sus aserciones**

Crear `<scratchpad>/extraer-lecciones.py`. **Anclas exactas, nunca números de línea**, y el
script **aborta antes de escribir** si algo no calza:

```python
# -*- coding: utf-8 -*-
import io, sys

def leer(p):
    with io.open(p, encoding='utf-8', newline='') as f: return f.read()
def escribir(p, t):
    with io.open(p, 'w', encoding='utf-8', newline='') as f: f.write(t)

j = leer('juego/index.html')

INI = "/* ================= CATÁLOGO DE DIAGRAMAS (SVG interactivo) ================="
FIN = "/* ================= RETO DE CÁLCULO (Matemáticas) ================="

for a, n in [(INI, 'apertura'), (FIN, 'cierre')]:
    if j.count(a) != 1:
        sys.exit('ABORTA: ancla de %s aparece %d veces' % (n, j.count(a)))

i, f = j.index(INI), j.index(FIN)
tramo = j[i:f]

# --- Aserciones ANTES de escribir (Sesion 65)
n_lineas = tramo.count('\n')
if not (460 <= n_lineas <= 500):
    sys.exit('ABORTA: el tramo mide %d lineas, se esperaban ~479' % n_lineas)
if tramo.count('/*') != tramo.count('*/'):
    sys.exit('ABORTA: comentarios de bloque desbalanceados en la pieza (%d aperturas, %d cierres)'
             % (tramo.count('/*'), tramo.count('*/')))
if tramo.count('{') != tramo.count('}'):
    sys.exit('ABORTA: llaves desbalanceadas en la pieza')

print('tramo OK: %d lineas' % n_lineas)
# Guardar la pieza en el SCRATCHPAD (nunca en /tmp) para inspeccionarla antes de cortar.
escribir(SCRATCH + '/tramo-extraido.js', tramo)
```

Este paso **solo valida y guarda la pieza**; el corte real lo hace el paso 3, cuando ya se
comprobó que el tramo es el correcto.

> ⚠️ **La comprobación de `/*` contra `*/` no es opcional.** En la Sesión 75 el extractor se llevó
> la cola de un comentario sin su apertura y dejó un `/*` huérfano en los tres forks — y
> **`node --check` NO lo delató**, porque el bloque siguiente aportaba el cierre que faltaba. Este
> proyecto escribe los comentarios **sin prefijo en las líneas del medio**, así que el extractor
> tiene que llevárselos enteros.

- [ ] **Paso 2: Correr el script y confirmar que las aserciones pasan**

```bash
python "<scratchpad>/extraer-lecciones.py"
```

Esperado: `tramo OK: 479 lineas` (o el número real medido). Si aborta, **no tocar el archivo a
mano**: arreglar el script.

- [ ] **Paso 3: Sacar además las 4 funciones sueltas, por balance de llaves**

`renderCampañaMate`, `jefeFinalMateDesbloqueado`, `capMateCompleto` y `cargarPoolMate` viven
**intercaladas con código vivo** alrededor de la línea 2931. **No se cortan por rango**: se ubica
la línea `function <nombre>` y se avanza contando llaves hasta el cierre.

⚠️ `odPreguntasCalc` y `odMapasMate`, que están al lado, son del **Reto y del duelo**: no viajan.

- [ ] **Paso 4: Envolver el módulo con su cabecera, su CSS y su init**

El archivo nuevo empieza con el comentario que explica **por qué existe** y **qué pasa si no
carga**, como los otros ocho módulos. Estructura:

```js
/* ============================================================================
   VULPO · MINI-CLASES (compartido por los tres cursos)

   POR QUÉ EXISTE. El camino de aprendizaje de Matemática —12 diagramas SVG
   interactivos + el motor que recorre los bloques de una lección— vivía SOLO en
   juego/index.html. La Sesion 65 lo corto de 3 y 7 porque ahi era codigo muerto;
   al darles su propio lecciones.json volvio a hacer falta, y copiarlo por fork
   serian seis copias al llegar a 6 basico.

   ⚠️ NACE DORMIDO. Despierta con LECC.init(datos) desde cada curso, y esa llamada
   va PEGADA a la declaracion de sus datos: un `const` leido antes de declararse
   mata todo el JavaScript, y esa trampa ya mordio cuatro veces.

   ⚠️ NO ES EL RETO DE CÁLCULO. Vivian pegados en el archivo pero son cosas
   distintas; el Reto se queda en juego/index.html (ver Sesion 74).

   SE LLEVA SU CSS: si sus reglas quedaran sueltas en el <style> de cada curso, un
   curso nuevo cargaria el modulo, funcionaria y NO SE VERIA, sin ningun error.
   ============================================================================ */
(function () {
  'use strict';
  var CSS = '…';                       // las reglas .lec-*, .diag-* que hoy viven en el <style>
  function inyectarCSS() { /* mismo patron que fracciones.js */ }
  var NS = 'http://www.w3.org/2000/svg';
  // … el tramo movido, byte a byte …
  window.LECC = { init: …, abrirLeccion: …, abrirUnidad: …, renderCampana: …, activo: false };
})();
```

- [ ] **Paso 5: Reconectar los tres puntos donde `motor.js` entra al camino de lecciones**

`motor.js` es genérico y no puede llamar a una función que vive en un fork. Hoy nombra tres cosas
que se van al módulo, y las tres tienen que pasar a la interfaz `LECC.*`:

| Dónde | Hoy | Queda |
|---|---|---|
| `renderCampaña` | `if(HAY_MINICLASES&&c.esLecciones){ renderCampañaMate(c); return; }` | `LECC.renderCampana(c)` |
| `btnBack` del quiz | `if(HAY_MINICLASES&&Q.leccion){volverAlCapituloMate();}` | `LECC.volverAlCapitulo()` |
| El siguiente paso al reprobar | `abrirMiniClaseDeOA(oa)` | `LECC.abrirMiniClaseDeOA(oa)` |

⚠️ **Con el respaldo vacío, esas tres llamadas tienen que ser inocuas**, no romper: si el módulo no
cargó, `renderCampaña` debe seguir dibujando la campaña normal en vez de quedarse en blanco.

- [ ] **Paso 6: Poner el `<script src>` y su respaldo vacío en los tres forks**

**Va ANTES del `<script>` inline** que lo usa. Los tres reciben la **misma edición byte a byte**:

```html
<script src="assets/js/lecciones.js"></script>
<script>if(!window.LECC)window.LECC={init:function(){},abrirLeccion:function(){},
  abrirUnidad:function(){},volverAlCapitulo:function(){},abrirMiniClaseDeOA:function(){},
  renderCampana:function(){return false;},activo:false};</script>
```

- [ ] **Paso 7: Verificar en el navegador, los tres cursos, CON y SIN el archivo**

```bash
node scripts/cdp.mjs about:blank "<scratchpad>/v-fase1.mjs"
```

El archivo de pasos comprueba, en 8°, 7° y 3°:
- `window.__MOTOR_OK` es `true` y se juega una etapa real de punta a punta.
- En 8°: los **12 diagramas** renderizan, las **17 lecciones** cargan, `scr-calc-mapa` abre y el
  Reto genera una operación.
- **Renombrando `lecciones.js`**: los tres siguen jugándose, cero excepciones, y el único fallo de
  red es su propio 404.
- **Cero errores de consola y cero 404.**

---

## Tarea 3: Encender el motor en 7° y en 3°

**Archivos:** `7mo/index.html`, `3ro/index.html`

- [ ] **Paso 1: `HAY_MINICLASES=true`, pegada a su comentario**

La bandera ya existe en los tres forks (Sesión 64) y hoy vale `false` en 7° y 3°. Cambiarla **con
su comentario al lado**, que explica qué gobierna: el siguiente paso al reprobar, `renderCampaña`,
el Jefe Final y el ✕ del quiz.

- [ ] **Paso 2: Agregar `esLecciones:true` y `capitulosMate` a la campaña de Matemática**

**7°** (4 unidades, 19 lecciones):

```js
capitulosMate:[
  {id:'mate7-numeros',   titulo:'Números',                 lecciones:['ma7-oa01','ma7-oa02','ma7-oa03','ma7-oa04','ma7-oa05']},
  {id:'mate7-algebra',   titulo:'Álgebra y proporciones',  lecciones:['ma7-oa06','ma7-oa07','ma7-oa08','ma7-oa09']},
  {id:'mate7-geometria', titulo:'Geometría',               lecciones:['ma7-oa10','ma7-oa11','ma7-oa12','ma7-oa13','ma7-oa14']},
  {id:'mate7-datos',     titulo:'Datos y azar',            lecciones:['ma7-oa15','ma7-oa16','ma7-oa17','ma7-oa18','ma7-oa19']},
],
```

**3°** (7 unidades, 26 lecciones), respetando el reparto real de sus capítulos:

| Unidad | Título | OA |
|---|---|---|
| `mat3-numeros` | Números hasta 1.000 | 01, 02, 03, 05 |
| `mat3-sumar` | Sumar y restar | 04, 06, 07 |
| `mat3-multiplicar` | Multiplicar y dividir | 08, 09, 10 |
| `mat3-fracciones` | Fracciones y patrones | 11, 12, 13 |
| `mat3-geometria` | Geometría | 14, 15, 16, 17, 18 |
| `mat3-medir` | Medir | 19, 20, 21, 22 |
| `mat3-datos` | Datos | 23, 24, 25, 26 |

⚠️ **Los ids de unidad NO pueden chocar con ningún id de `EXPEDICIONES`.** Comprobarlo antes:

```bash
node -e "const h=require('fs').readFileSync('3ro/index.html','utf8');
['mat3-numeros','mat3-sumar','mat3-multiplicar','mat3-fracciones','mat3-geometria','mat3-medir','mat3-datos']
.forEach(x=>{const n=[...h.matchAll(new RegExp(\"id:'\"+x+\"'\",'g'))].length;
console.log(x, n===0?'libre':'CHOCA ('+n+')')})"
```

- [ ] **Paso 3: Agregar las 4 unidades de cada curso a `EXTRAS`**

Mismo patrón que 8° (ver la corrección del armador de esta sesión), pero **llamando al módulo**:
`disponible:()=>HAY_MINICLASES` y `abrir:()=>LECC.abrirUnidad('<id>')`. Así aparecen en el armador
y en los enlaces de muestra **sin tocar el motor**.

⚠️ **Y hay que cambiar también las 4 de 8°**, que hoy llaman a `abrirUnidadMate` porque esa función
todavía vive en su `index.html`. Al mudarse al módulo, las tres apps quedan **byte a byte iguales**
en ese literal salvo los ids — que es el objetivo de todo esto.

- [ ] **Paso 4: Verificar con `lecciones.json` todavía vacío**

Con `{"lecciones":[]}` en cada carpeta, el mapa debe dibujarse sin romperse: las unidades salen
con `0/N lecciones`. Es la comprobación de que el cableado está bien **antes** de escribir el
contenido.

---

## Tarea 4: El estándar de una mini-clase, escrito

**Archivos:** Crear `docs/estandar-miniclases.md`

- [ ] **Paso 1: Documentar la anatomía medida de las 17 de 8°**

| | |
|---|---|
| Bloques por lección | **5,2** de promedio |
| Reparto | 32 `texto` · 20 `diagrama` · 20 `ejemplo` · 17 `practica` |
| Fragmentos locutables | **8** por lección |
| Peso | 21 KB las 17 |

Y el contrato de cada tipo de bloque: `texto` (`{t,md}`), `diagrama` (`{t,kind,params,intro}`),
`ejemplo` (`{t,intro,pasos}`), `practica` (`{t,fromBank:{oa,n}}`).

- [ ] **Paso 2: Escribir las reglas que ya se pagaron**

- ⚠️ **El `fromBank.oa` debe calzar EXACTO con el banco** (`"MA07 OA 01"`, con espacios). Si no, la
  práctica sale vacía y **la lección se marca completa igual, sin medir nada y sin ningún error**.
  Se valida contra el banco antes de consolidar.
- La práctica sirve **10 preguntas** (`n:10`), y **3 en modo revisión** — eso lo resuelve el motor.
- **Los dibujos no pueden delatar la respuesta** de su práctica (Sesión 55: 17 preguntas de 3°
  tuvieron que perder su visual por esto).
- **En 3° el texto se va a locutar**: frases cortas, sin abreviaturas, y nada que solo se entienda
  viendo la grafía.
- Las fracciones se escriben `n/m` y **el juego las apila** (`docs/estandar-fracciones.md`).

- [ ] **Paso 3: Documentar el solape de los dos catálogos de dibujo**

Tabla de los 11 de `visuales.js` (estáticos, en preguntas) contra los 12 de `lecciones.js`
(interactivos, para enseñar), diciendo que `recta`, `barras` y `fraccion(es)` **comparten nombre a
propósito** y no se fusionan.

---

# Fase 2 · La aprobación de lo que enseña

> ⚠️ **Va antes de escribir las 45**, no después. Hoy ninguna herramienta lee `lecciones.json` y
> las 17 de 8° llevan enseñando desde la Sesión 29 sin firma. Descubrir un defecto del estándar
> con 5 lecciones cuesta la novena parte que con 45.

## Tarea 5: El informe de revisión incluye las lecciones

**Archivos:** Modificar `scripts/generar-revision-preguntas.py`

- [ ] **Paso 1: Leer `lecciones.json` si existe, junto al `preguntas.json`**

- [ ] **Paso 2: Renderizar cada lección con sus diagramas de verdad**

El script ya sabe incrustar dibujos reales (reusa `renderVisual` para los apoyos visuales de las
preguntas). Los diagramas de lección son SVG **interactivos**, así que en papel se dibuja su
estado inicial.

> ⚠️ **Trampa ya pagada (Sesión 56):** al extraer el renderizador por anclas, el script se dejó
> fuera una dependencia y **los 232 dibujos desaparecieron sin ningún error**, porque el `catch`
> los reemplazaba por texto. Por eso el documento **grita en rojo en su primera página** si algún
> dibujo falla. Mantener ese guard y extenderlo a los diagramas.

- [ ] **Paso 3: Verificar generando el informe de 8°, que ya tiene 17 lecciones**

```bash
python scripts/generar-revision-preguntas.py matematicas-8basico
```

Esperado: las 17 lecciones salen con sus 20 diagramas dibujados y **cero avisos en rojo**.

## Tarea 6: El tablero cuenta las lecciones aparte

**Archivos:** Modificar `scripts/generar-tablero.py`

- [ ] **Paso 1: Contarlas sin mezclarlas en la cobertura curricular**

La cobertura es `preguntas/meta` por OA. Una lección **no es una pregunta**: mezclarlas inflaría
el porcentaje. Van en su propia línea por asignatura: *"17 mini-clases · 0 aprobadas"*.

- [ ] **Paso 2: Regenerar y confirmar que las 562 barras de cobertura NO se movieron**

```bash
python scripts/generar-tablero.py
```

Es la comprobación que la Sesión 75 usó al sacar `meta_preguntas_por_oa`: si una barra cambia, el
cambio tocó algo que no debía. **Y el tablero es la única puerta de aprobación, así que cualquier
cosa que lo rompa detiene el proyecto** — confirmar que sale.

---

# Fase 3 · 7° básico: 19 mini-clases

> Va antes que 3° porque es **el curso más parecido a 8°**: misma edad, mismo formato, **sin voz**.
> Valida el motor extraído con el menor número de variables nuevas.

## Tarea 7: Tanda de validación — la unidad de Números (5 lecciones)

**Archivos:** Crear `contenido/matematicas-7basico/lecciones.json`

- [ ] **Paso 1: Escribir las 5 lecciones de `MA07 OA 01`–`OA 05`**

Siguiendo `docs/estandar-miniclases.md`. Reusar los widgets que ya existen (`recta`, `fracciones`,
`potencias`) antes de inventar uno nuevo.

- [ ] **Paso 2: Validar que cada `fromBank.oa` existe en el banco**

```bash
python - <<'EOF'
import json, io
L=json.load(io.open('contenido/matematicas-7basico/lecciones.json',encoding='utf-8'))['lecciones']
P=json.load(io.open('contenido/matematicas-7basico/preguntas.json',encoding='utf-8'))['preguntas']
oas={q['oa'] for q in P}
for l in L:
    for b in l['bloques']:
        if b['t']=='practica':
            oa=b['fromBank']['oa']
            n=sum(1 for q in P if q['oa']==oa)
            print(l['id'], oa, n, 'OK' if oa in oas and n>=10 else '*** FALLA ***')
EOF
```

**Cada línea debe decir OK.** Un `oa` que no calce deja la práctica vacía y la lección se marca
completa igual, sin ningún error.

- [ ] **Paso 3: Jugar las 5 en el navegador, de punta a punta**

Texto → diagrama interactivo (que responda al arrastre) → ejemplo paso a paso → práctica de 10 →
queda ✓ y se abre la siguiente. **Y mirar la captura**, no solo los conteos: es la cuarta vez que
este proyecto tiene una pantalla rota con todos los números correctos.

- [ ] **Paso 4: Revisar el estándar antes de escalar**

Si aparece un defecto del formato, **corregir el estándar y estas 5** antes de escribir las 14
restantes.

## Tarea 8: Las 14 restantes (Álgebra, Geometría, Datos)

- [ ] **Paso 1: Escribirlas** siguiendo el estándar ya validado
- [ ] **Paso 2: Correr la validación de `fromBank` sobre las 19**
- [ ] **Paso 3: Jugar una lección de cada unidad en el navegador**

## Tarea 9: Los widgets que falten

- [ ] **Paso 1: Ver cuáles pidió el contenido** (candidatos previstos: círculo, proporcionalidad)
- [ ] **Paso 2: Escribirlos en `assets/js/lecciones.js`**, con su descripción para lector de
      pantalla, que **no puede delatar la respuesta**
- [ ] **Paso 3: Renderizar los 12+N con datos reales** en el navegador

## Tarea 10: Verificación de la fase

- [ ] Los tres cursos juegan una etapa real; 8° conserva sus 17 lecciones y 12 diagramas
- [ ] El armador de 7° muestra sus 4 unidades y `?rev=1` sirve **3** preguntas por práctica
- [ ] El informe de revisión de 7° sale con sus 19 lecciones dibujadas
- [ ] **Cero errores de consola y cero 404**

---

# Fase 4 · 3° básico: 26 mini-clases y su voz

> Suma tres variables que 7° no tiene: `SIN_RELOJ`, la voz pregrabada y los widgets de curso chico.

## Tarea 11: Tanda de validación — Números hasta 1.000 (4 lecciones)

**Archivos:** Crear `contenido/matematicas-3basico/lecciones.json`

- [ ] **Paso 1: Escribir las 4 de `MA03 OA 01, 02, 03, 05`**, con lenguaje de niño de 8 años
- [ ] **Paso 2: Validar `fromBank`** con el script de la Tarea 7
- [ ] **Paso 3: Jugarlas, y confirmar que la práctica va SIN reloj**
- [ ] **Paso 4: Revisar el estándar antes de escalar a las 22 restantes**

## Tarea 12: Las 22 restantes

- [ ] Escribirlas · validar `fromBank` sobre las 26 · jugar una de cada unidad

## Tarea 13: Los widgets de curso chico

- [ ] Candidatos previstos: **dinero** y **pictograma**. Los demás (contar, agrupar, fracción,
      recta, reloj, barras, cuerpo, cuadrícula) ya están en `visuales.js` — evaluar si se usan
      desde ahí o si la versión interactiva justifica una propia

## Tarea 14: La aprobación pedagógica de las 45

- [ ] **Paso 1: Generar los informes**

```bash
python scripts/generar-revision-preguntas.py matematicas-7basico
python scripts/generar-revision-preguntas.py matematicas-3basico
```

- [ ] **Paso 2: Roberto las aprueba.** Es su trabajo y nadie puede hacerlo por él.

## Tarea 15: La voz de 3° — **después de aprobar, nunca en paralelo**

> ⚠️ La Sesión 61 lo pagó: se lanzó la voz de Ciencias junto con sus auditorías y hubo que rehacer
> los textos de 20 preguntas. **Cada texto corregido obliga a regenerar su clip y a pagarlo.**
> Y **generar voz gasta plata de Roberto: no se corre sin su autorización explícita.**

**Archivos:** Modificar `scripts/generar-voz-nivel.py`

- [ ] **Paso 1: Que el generador lea `lecciones.json`** además del banco: textos, la intro del
      diagrama y los pasos del ejemplo
- [ ] **Paso 2: Recuento SIN generar**, para confirmar el costo antes de gastar

```bash
python scripts/generar-voz-nivel.py mat3 --recuento
```

⚠️ El modo se llama **`--recuento`**. El generador **ignora las banderas que no conoce**, así que
inventar una (`--simular`) genera de verdad y cobra.

Esperado: del orden de **230 clips ≈ US$0,15**.

- [ ] **Paso 3: Generar, y verificar cobertura**

Que cada texto locutable tenga clip, que ninguno pese 0 bytes, y que en el navegador los clips de
una lección real respondan **HTTP 200 `audio/mpeg`**.

> ⚠️ El manifiesto se indexa por el **texto mostrado**: cambiar un texto después deja su clip
> huérfano sonando como antes, **en silencio**.

---

# Fase 5 · Ciencias: 13 introducciones

> **Cero motor nuevo:** `terminarLeccion()` ya marca completa una lección que se queda sin bloques,
> así que una introducción es una lección de 2-3 bloques **sin `practica`**.

## Tarea 16: Las introducciones de 8° (4 capítulos)

**Archivos:** Crear `contenido/ciencias-8basico/lecciones.json`

- [ ] **Paso 1: Escribir 4** — La célula · Cuerpo humano y salud · Electricidad y calor · La
      materia y el átomo. Encuadre + **un dibujo del modelo**, que es lo que Ciencias no tiene:
      medido, **0 de sus 1.374 preguntas llevan dibujo**
- [ ] **Paso 2: Los widgets del modelo** (célula, circuito, cambios de estado) en `lecciones.js`
- [ ] **Paso 3: Cablearlas** como nodo de introducción al principio de cada capítulo
- [ ] **Paso 4: Jugarlas** y confirmar que una lección sin práctica **queda ✓ igual**

## Tarea 17: Las de 7° (5) y 3° (4)

- [ ] Escribirlas reusando los widgets de la Tarea 16
- [ ] En 3°, sumar su voz al lote de la Tarea 15 **si aún no se generó**; si ya se generó, es un
      lote nuevo y hay que autorizarlo aparte

## Tarea 18: Verificación de cierre

- [ ] Los tres cursos juegan una etapa real y una mini-clase real
- [ ] 8° sin regresión: 17 lecciones, 12+N diagramas, 5 niveles del Reto, `scr-calc-mapa` abre
- [ ] El guardado de cada curso sigue **aislado**: sembrar 777 XP en 8°, jugar 3° y 7°, volver
- [ ] **Con `assets/js/lecciones.js` ausente**, los tres siguen jugándose
- [ ] El armador de los tres muestra sus unidades; `?solo=` y `?m=` las abren; el "Volver" **no
      abre la campaña entera**
- [ ] **Cero errores de consola y cero 404**

---

## Orden de publicación (para la orden 66)

**Dos pushes**, y el módulo va **primero**: `assets/js/lecciones.js` es el **proveedor** y los
tres `index.html` son los **consumidores**. Al revés, un fork nuevo sobre un módulo que todavía no
está sirviéndose daría 404 durante los ~90 segundos que tarda GitHub Pages — y aunque el respaldo
vacío evita que el juego muera, el camino de mini-clases quedaría mudo sin decir por qué.

Verificar **en el sitio en vivo**, no solo en local.
