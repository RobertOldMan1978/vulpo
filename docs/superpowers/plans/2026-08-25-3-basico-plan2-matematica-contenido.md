# 3° básico · Plan 2 — Matemática de año completo (contenido + visuales + campaña)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recomendado) o superpowers:executing-plans para implementar este plan tarea por tarea. Los pasos usan casillas (`- [ ]`) para el seguimiento.

**Goal:** Llevar Matemática de 3° básico de un banco semilla de 12 preguntas a **los 26 OA oficiales con ~30 preguntas cada uno (~780)**, con apoyo visual dibujado por código para los ejes que no se pueden preguntar solo con texto, y una campaña de año completo con etapas de 10 preguntas.

**Architecture:** Todo el contenido vive en `contenido/matematicas-3basico/` (`oa.json` + `preguntas.json`), igual que las cuatro asignaturas de 8°. La app `3ro/index.html` solo se toca para (a) ampliar el catálogo de apoyos visuales y (b) recablear `EXPEDICIONES`/`CAMPAÑAS`/`META_OA` a los 26 OA. **`juego/index.html` no se toca en ningún paso de este plan.**

**Tech Stack:** HTML/CSS/JS a mano (sin build), JSON de contenido, Python 3 para validación y consolidación, agentes en paralelo para redactar el banco.

**Spec:** `docs/superpowers/specs/2026-08-25-3-basico-nivel-nuevo-design.md`
**Plan previo:** `docs/superpowers/plans/2026-08-25-3-basico-app-scaffold.md` (Plan 1, ya ejecutado)

---

## Decisiones que este plan fija (aprobadas por Roberto, 2026-08-25)

| Decisión | Valor | Nota |
|---|---|---|
| Alcance | **Los 26 OA** de Matemática 3° | Los 5 ejes completos. |
| Densidad del banco | **~30 preguntas por OA** (~780) | Estándar de 8°. Necesario para etapas de 10 sin repetir. |
| Largo de etapa | **10 preguntas** (`n:10`) | Roberto pidió "misma extensión que 8°". **Deja constancia:** el spec §5 había fijado 5-6 por la edad. Es un campo de datos: si al probarlo resulta pesado, se baja sin rehacer nada. |
| Jefe de capítulo | **15 preguntas** | Igual que 8°. |
| Umbral de aprobación | **66%** (7 de 10), como 8° | El spec pedía "más amable"; queda pendiente de la prueba de Roberto en el teléfono. Es una línea: `3ro/index.html:3685`. |
| Apoyo visual | **Se amplía el catálogo** | Hoy solo existe `tipo:'contar'`. Sin tipos nuevos, Geometría/Medición/Datos quedarían como memorización. |

---

## Dos defectos que este plan corrige de entrada

Ambos verificados contra el repositorio el 2026-08-25, antes de escribir el plan:

1. **El tablero está roto.** `python scripts/generar-tablero.py` termina en `KeyError: 'unidades'`
   (`scripts/generar-tablero.py:156`), porque el `oa.json` semilla de 3° no trae esa clave y el
   script recorre todas las carpetas de `contenido/`. **No genera nada, para ninguna asignatura.**
   Como la revisión pedagógica de Roberto pasa por el tablero, esto bloquea el cierre de este
   plan. Lo arregla la Task 1.

2. **El banco semilla está mal etiquetado.** Las 6 preguntas marcadas `MA03 OA 09` son sumas y
   restas (`¿Cuánto es 6 + 7?`, `Había 15 pájaros y volaron 6…`), pero el texto oficial de
   **MA03 OA 09** es *"Demostrar que comprenden la división en el contexto de las tablas de hasta
   10x10"*. Sumar y restar hasta 1.000 es **MA03 OA 06**. El error está también en el cableado
   (`3ro/index.html`, capítulo `mat3-cap1`) y en `META_OA`. Importa porque el mapa de dominio le
   reporta al profesor **por código de OA**: tal como está, cuando 3° se conecte al panel (Plan 3)
   un profesor vería "división" flojo cuando los niños practicaron sumas. Lo arregla la Task 2.

---

## Estructura de archivos

| Archivo | Responsabilidad | Acción |
|---|---|---|
| `contenido/matematicas-3basico/oa.json` | Los 26 OA oficiales + los 5 ejes como `unidades` | Reescribir (Task 1) |
| `contenido/matematicas-3basico/preguntas.json` | Banco consolidado final (~780) | Reescribir por etapas (Tasks 2 y 10) |
| `contenido/matematicas-3basico/_pool/verificado/*.json` | Parciales por OA que entregan los agentes | Crear (Tasks 5-9) |
| `scripts/validar-banco-3ro.py` | Guardia de calidad (estructura, OA válidos, duplicados, largo de lector inicial, visuales) | Crear (Task 4) |
| `scripts/consolidar-pool-3ro.py` | Une parciales, deduplica, baraja opciones, asigna ids | Crear (Task 10) |
| `3ro/index.html` | Apoyos visuales (Task 3); `EXPEDICIONES`/`CAMPAÑAS` (Task 11); `META_OA` (Task 12) | Modificar |
| `scripts/generar-tablero.py` | — | **No se toca**: el arreglo va en el `oa.json` |
| `juego/index.html` | — | **No se toca en todo el plan** |

---

## Task 1: `oa.json` con los 26 OA oficiales y los 5 ejes (desbloquea el tablero)

**Files:**
- Modify: `contenido/matematicas-3basico/oa.json` (reescritura completa)

- [ ] **Step 1: Reproducir la falla del tablero**

Run: `cd /c/Proyectos/kimun && python scripts/generar-tablero.py`
Expected: falla con `KeyError: 'unidades'` en `scripts/generar-tablero.py:156`.

Esto confirma el defecto antes de arreglarlo. Si NO falla, alguien ya lo arregló: detente y avisa.

- [ ] **Step 2: Reescribir `oa.json` completo**

Reemplaza **todo** el archivo `contenido/matematicas-3basico/oa.json` por:

```json
{
  "asignatura": "Matemática",
  "nivel": "3° básico",
  "codigo_asignatura": "MA03",
  "fuente": "Bases Curriculares 1° a 6° básico — MINEDUC",
  "url_fuente": "https://www.curriculumnacional.cl/curriculum/1o-6o-basico/matematica/3-basico",
  "nota_fidelidad": "Textos transcritos del portal oficial el 2026-08-25. Validar contra el PDF del MINEDUC antes de publicar material impreso.",
  "unidades": [
    { "id": "U1", "titulo": "Números y operaciones",
      "descripcion": "Contar, leer y comparar hasta 1.000; valor posicional; las cuatro operaciones y fracciones de uso común.",
      "oa": ["MA03 OA 01","MA03 OA 02","MA03 OA 03","MA03 OA 04","MA03 OA 05","MA03 OA 06","MA03 OA 07","MA03 OA 08","MA03 OA 09","MA03 OA 10","MA03 OA 11"] },
    { "id": "U2", "titulo": "Patrones y álgebra",
      "descripcion": "Patrones numéricos y ecuaciones de un paso con un símbolo desconocido.",
      "oa": ["MA03 OA 12","MA03 OA 13"] },
    { "id": "U3", "titulo": "Geometría",
      "descripcion": "Localización en cuadrícula, figuras 3D y 2D, cuerpos geométricos, transformaciones y ángulos.",
      "oa": ["MA03 OA 14","MA03 OA 15","MA03 OA 16","MA03 OA 17","MA03 OA 18"] },
    { "id": "U4", "titulo": "Medición",
      "descripcion": "Líneas de tiempo y calendarios, la hora, perímetro y peso.",
      "oa": ["MA03 OA 19","MA03 OA 20","MA03 OA 21","MA03 OA 22"] },
    { "id": "U5", "titulo": "Datos y probabilidades",
      "descripcion": "Encuestas, tablas, gráficos de barra, pictogramas y diagramas de puntos.",
      "oa": ["MA03 OA 23","MA03 OA 24","MA03 OA 25","MA03 OA 26"] }
  ],
  "oa": [
    { "codigo": "MA03 OA 01", "texto": "Contar números del 0 al 1 000 de 5 en 5, de 10 en 10, de 100 en 100: empezando por cualquier número natural menor que 1 000 de 3 en 3, de 4 en 4, empezando por cualquier múltiplo del número correspondiente." },
    { "codigo": "MA03 OA 02", "texto": "Leer números hasta 1000 y representarlos en forma concreta, pictórica y simbólica." },
    { "codigo": "MA03 OA 03", "texto": "Comparar y ordenar números naturales hasta 1 000, utilizando la recta numérica o la tabla posicional de manera manual y/o por medio de software educativo." },
    { "codigo": "MA03 OA 04", "texto": "Describir y aplicar estrategias de cálculo mental para las adiciones y sustracciones hasta 100: por descomposición; completar hasta la decena más cercana; usar dobles; sumar en vez de restar; aplicar la asociatividad." },
    { "codigo": "MA03 OA 05", "texto": "Identificar y describir las unidades, decenas y centenas en números del 0 al 1000, representando las cantidades de acuerdo a su valor posicional, con material concreto, pictórico y simbólico." },
    { "codigo": "MA03 OA 06", "texto": "Demostrar que comprenden la adición y la sustracción de números del 0 al 1 000: usando estrategias personales con y sin material concreto; creando y resolviendo problemas de adición y sustracción que involucren operaciones combinadas, en forma concreta, pictórica y simbólica, de manera manual y/o por medio de software educativo; aplicando los algoritmos con y sin reserva, progresivamente, en la adición de hasta cuatro sumandos y en la sustracción de hasta un sustraendo." },
    { "codigo": "MA03 OA 07", "texto": "Demostrar que comprenden la relación entre la adición y la sustracción, usando la familia de operaciones en cálculos aritméticos y en la resolución de problemas." },
    { "codigo": "MA03 OA 08", "texto": "Demostrar que comprenden las tablas de multiplicar hasta 10 de manera progresiva: usando representaciones concretas y pictóricas; expresando una multiplicación como una adición de sumandos iguales; usando la distributividad como estrategia para construir las tablas hasta el 10; aplicando los resultados de las tablas de multiplicación hasta 10x10, sin realizar cálculos; resolviendo problemas que involucren las tablas aprendidas hasta el 10." },
    { "codigo": "MA03 OA 09", "texto": "Demostrar que comprenden la división en el contexto de las tablas de hasta 10x10: representando y explicando la división como repartición y agrupación en partes iguales, con material concreto y pictórico; creando y resolviendo problemas en contextos que incluyan la repartición y la agrupación; expresando la división como una sustracción repetida; describiendo y aplicando la relación inversa entre la división y la multiplicación; aplicando los resultados de las tablas de multiplicación hasta 10x10, sin realizar cálculos." },
    { "codigo": "MA03 OA 10", "texto": "Resolver problemas rutinarios en contextos cotidianos, que incluyan dinero e involucren las cuatro operaciones (no combinadas)." },
    { "codigo": "MA03 OA 11", "texto": "Demostrar que comprenden las fracciones de uso común 1/4, 1/3, 1/2, 2/3, 3/4: explicando que una fracción representa la parte de un todo, de manera concreta, pictórica, simbólica, de forma manual y/o con software educativo; describiendo situaciones en las cuales se puede usar fracciones; comparando fracciones de un mismo todo, de igual denominador." },
    { "codigo": "MA03 OA 12", "texto": "Generar, describir y registrar patrones numéricos, usando una variedad de estrategias en tablas del 100, de manera manual y/o con software educativo." },
    { "codigo": "MA03 OA 13", "texto": "Resolver ecuaciones de un paso que involucren adiciones y sustracciones y un símbolo geométrico que represente un número desconocido, en forma pictórica y simbólica del 0 al 100." },
    { "codigo": "MA03 OA 14", "texto": "Describir la localización de un objeto en un mapa simple o cuadrícula." },
    { "codigo": "MA03 OA 15", "texto": "Demostrar que comprenden la relación que existe entre figuras 3D y figuras 2D: construyendo una figura 3D a partir de una red (plantilla); desplegando la figura 3D." },
    { "codigo": "MA03 OA 16", "texto": "Describir cubos, paralelepípedos, esferas, conos, cilindros y pirámides de acuerdo a la forma de sus caras y el número de aristas y vértices." },
    { "codigo": "MA03 OA 17", "texto": "Reconocer en el entorno figuras 2D que están trasladadas, reflejadas y rotadas." },
    { "codigo": "MA03 OA 18", "texto": "Demostrar que comprenden el concepto de ángulo: identificando ejemplos de ángulos en el entorno; estimando la medida de ángulos, usando como referente ángulos de 45º y de 90º." },
    { "codigo": "MA03 OA 19", "texto": "Leer e interpretar líneas de tiempo y calendarios." },
    { "codigo": "MA03 OA 20", "texto": "Leer y registrar el tiempo en horas, medias horas, cuartos de hora y minutos en relojes análogos y digitales." },
    { "codigo": "MA03 OA 21", "texto": "Demostrar que comprenden el perímetro de una figura regular e irregular: midiendo y registrando el perímetro de figuras del entorno en el contexto de la resolución de problemas; determinando el perímetro de un cuadrado y de un rectángulo." },
    { "codigo": "MA03 OA 22", "texto": "Demostrar que comprende la medición del peso (g y kg): comparando y ordenando dos o más objetos a partir de su peso de manera informal; usando modelos para explicar la relación que existe entre gramos y kilogramos; estimando el peso de objetos de uso cotidiano, usando referentes; midiendo y registrando el peso de objetos en números y en fracciones de uso común, en el contexto de la resolución de problemas." },
    { "codigo": "MA03 OA 23", "texto": "Realizar encuestas y clasificar y organizar los datos obtenidos en tablas y visualizarlos en gráficos de barra." },
    { "codigo": "MA03 OA 24", "texto": "Registrar y ordenar datos obtenidos de juegos aleatorios con dados y monedas, encontrando el menor, el mayor y estimando el punto medio entre ambos." },
    { "codigo": "MA03 OA 25", "texto": "Construir, leer e interpretar pictogramas y gráficos de barra simple con escala, en base a información recolectada o dada." },
    { "codigo": "MA03 OA 26", "texto": "Representar datos usando diagramas de puntos." }
  ]
}
```

- [ ] **Step 3: Validar el JSON y el conteo**

Run:
```bash
cd /c/Proyectos/kimun && PYTHONIOENCODING=utf-8 python -c "
import json,io
d=json.load(io.open('contenido/matematicas-3basico/oa.json',encoding='utf-8'))
oas=[o['codigo'] for o in d['oa']]
print('OA totales:',len(oas))
print('unidades:',len(d['unidades']))
en_u=[c for u in d['unidades'] for c in u['oa']]
print('OA en unidades:',len(en_u))
print('faltan en unidades:',sorted(set(oas)-set(en_u)))
print('sobran en unidades:',sorted(set(en_u)-set(oas)))
esperado=['MA03 OA %02d'%i for i in range(1,27)]
print('secuencia 01-26 correcta:', oas==esperado)
"
```
Expected exactamente:
```
OA totales: 26
unidades: 5
OA en unidades: 26
faltan en unidades: []
sobran en unidades: []
secuencia 01-26 correcta: True
```

- [ ] **Step 4: Verificar que el tablero vuelve a generarse**

Run: `cd /c/Proyectos/kimun && python scripts/generar-tablero.py`
Expected: termina **sin traceback** y escribe `dev/tablero.html`.

Luego confirma que 3° aparece y que las otras asignaturas no se rompieron:
```bash
cd /c/Proyectos/kimun && grep -c "3° básico" dev/tablero.html && grep -o "Historia\|Ciencias\|Lenguaje" dev/tablero.html | sort -u
```
Expected: el conteo de "3° básico" es ≥1 y siguen apareciendo Historia, Ciencias y Lenguaje.

- [ ] **Step 5: Commit**

```bash
cd /c/Proyectos/kimun
git add contenido/matematicas-3basico/oa.json
git commit -m "3ro: oa.json con los 26 OA oficiales de Matematica 3 y sus 5 ejes (arregla el tablero roto)"
```

---

## Task 2: Corregir el mal etiquetado del banco semilla (OA 09 → OA 06)

**Files:**
- Modify: `contenido/matematicas-3basico/preguntas.json`
- Modify: `3ro/index.html` (bloques `EXPEDICIONES`, `CAMPAÑAS`, `META_OA`)

- [ ] **Step 1: Confirmar el defecto antes de tocarlo**

Run:
```bash
cd /c/Proyectos/kimun && PYTHONIOENCODING=utf-8 python -c "
import json,io
d=json.load(io.open('contenido/matematicas-3basico/preguntas.json',encoding='utf-8'))
for p in d['preguntas']:
    if p['oa']=='MA03 OA 09': print(p['pregunta'])
"
```
Expected: seis preguntas de sumas y restas (`¿Cuánto es 6 + 7?`, etc.), ninguna de división.

- [ ] **Step 2: Re-etiquetar las 6 preguntas**

Run:
```bash
cd /c/Proyectos/kimun && PYTHONIOENCODING=utf-8 python -c "
import json,io
p='contenido/matematicas-3basico/preguntas.json'
d=json.load(io.open(p,encoding='utf-8'))
n=0
for q in d['preguntas']:
    if q['oa']=='MA03 OA 09': q['oa']='MA03 OA 06'; n+=1
io.open(p,'w',encoding='utf-8').write(json.dumps(d,ensure_ascii=False,indent=2))
print('re-etiquetadas:',n)
"
```
Expected: `re-etiquetadas: 6`

- [ ] **Step 3: Corregir el cableado del capítulo 1 en `3ro/index.html`**

En el bloque `EXPEDICIONES`, capítulo `mat3-cap1`, cambia las **tres** apariciones de
`MA03 OA 09` por `MA03 OA 06`:

```javascript
 { id:'mat3-cap1', asignatura:'Matemática', nivel:'3° Básico · Sumar y restar',
   portada:'assets/portada-matematicas.png',
   contenido:'contenido/matematicas-3basico/preguntas.json', activa:true, campaña:'mat3',
   etapas:[
     {oa:"MA03 OA 06",nombre:"Sumas hasta 20",icono:"➕",n:5},
     {oa:"MA03 OA 06",nombre:"Restas hasta 20",icono:"➖",n:5},
     {oa:"BOSS",nombre:"⚡ JEFE: Sumas y restas",icono:"🐲",n:6,oas:["MA03 OA 06"]},
   ]},
```

> El `n:5` se mantiene en esta tarea a propósito: el cambio a `n:10` va en la Task 11, cuando el
> banco ya tenga ~30 por OA. Subirlo antes dejaría etapas que repiten preguntas.

- [ ] **Step 4: Corregir la fase del Jefe Final en `CAMPAÑAS`**

```javascript
    fases:[
      {nombre:'Sumas y restas', oas:['MA03 OA 06']},
      {nombre:'Contar saltando', oas:['MA03 OA 01']},
    ],
```

- [ ] **Step 5: Corregir la clave en `META_OA`**

```javascript
const META_OA={
 'MA03 OA 06':'Sumar y restar para resolver problemas del día a día.',
 'MA03 OA 01':'Contar de a saltos: de 5 en 5, de 10 en 10 y de 100 en 100.',
};
```

- [ ] **Step 6: Verificar que no queda ninguna referencia huérfana**

Run: `cd /c/Proyectos/kimun && grep -c "MA03 OA 09" 3ro/index.html contenido/matematicas-3basico/preguntas.json`
Expected: `0` en ambos archivos.

Run: `cd /c/Proyectos/kimun && grep -c "MA03 OA 06" 3ro/index.html`
Expected: `5` líneas — las dos etapas, el `oas` del jefe de capítulo, la fase del Jefe Final en
`CAMPAÑAS`, y la clave de `META_OA`.

- [ ] **Step 7: Verificar en el navegador que el capítulo 1 sigue jugable**

Levanta el servidor: `cd /c/Proyectos/kimun && python -m http.server 8765`
Abre `http://localhost:8765/3ro/` y comprueba:
1. JUGADOR → Matemática → capítulo 1 → la primera etapa carga preguntas (no "no se pudo cargar").
2. La tarjeta 🎯 de meta dice "Sumar y restar para resolver problemas del día a día."
3. Consola sin errores nuevos.

Si la etapa queda vacía, el `oa` de la etapa no calza con el del banco: revisa el espaciado
exacto (`MA03 OA 06`, con espacios).

- [ ] **Step 8: Commit**

```bash
cd /c/Proyectos/kimun
git add contenido/matematicas-3basico/preguntas.json 3ro/index.html
git commit -m "3ro: corregir el OA mal etiquetado del banco semilla (OA 09 division -> OA 06 adicion y sustraccion)"
```

---

## Task 3: Ampliar el catálogo de apoyos visuales de 3°

**Files:**
- Modify: `3ro/index.html` (función `renderVisual`, ~línea 1414; CSS `.q-visual`, ~línea 177)

> Hoy `renderVisual` solo entiende `tipo:'contar'`. Sin tipos nuevos, los ejes de Geometría,
> Medición y Datos quedarían preguntables solo de memoria. Se agregan **seis** tipos, todos
> dibujados por código (SVG inline), sin archivos ni librerías.

> ### ⚠️ Defecto encontrado al ejecutar (2026-08-25): el apoyo visual es código muerto
>
> `pintaPregunta` hace `$('qVisual').innerHTML = renderVisual(P.visual)` (línea ~3519), pero
> **ninguno de los 6 constructores de preguntas copia el campo `visual`**. Todos mapean
> `q=>({q:q.pregunta, ops:q.opciones, ok:q.correcta, tip:q.tip, oa:q.oa})`. Verificado en el
> navegador:
>
> ```
> banco: preguntas con campo visual = 2 de 6
> buildPreguntas -> claves: ["q","ops","ok","tip","oa"]
> buildPreguntas -> alguna trae visual?: false
> ```
>
> Es el mismo patrón del bug de la Sesión 23 (cuando `buildPreguntas` descartaba el `oa` y el
> mapa de dominio habría quedado vacío para siempre sin error visible). **Sin el Step 0 de abajo,
> los seis tipos nuevos nacen igual de muertos.**

- [ ] **Step 0: Propagar el campo `visual` en los seis constructores de preguntas**

Los seis están en `3ro/index.html`, líneas ~1339, ~1900, ~2494, ~2933, ~3490 y ~3767. En cada uno,
agrega `visual:q.visual` al objeto que se devuelve. Ejemplo del primero:

```javascript
 // Se conserva el `oa` de cada pregunta: lo necesita el mapa de dominio del profesor.
 // Y `visual`: lo necesita el apoyo visual de 3° (pintaPregunta lee P.visual).
 return sel.map(q=>({q:q.pregunta,ops:q.opciones,ok:q.correcta,tip:q.tip,oa:q.oa,visual:q.visual}));
```

El de la línea ~2494 (duelo) no lleva `oa`; ahí queda
`{q:q.pregunta,ops:q.opciones,ok:q.correcta,tip:q.tip,visual:q.visual}`.

Verificación:
```bash
cd /c/Proyectos/kimun && grep -c "visual:q.visual" 3ro/index.html
```
Expected: `6`

- [ ] **Step 1: Reemplazar `renderVisual` por el catálogo completo**

Sustituye la función `renderVisual` entera por:

```javascript
/* Apoyo visual dibujado por código para la app de 3°.
   Cada pregunta puede traer un objeto `visual`; si el tipo no existe, se ignora en silencio
   (la pregunta sigue siendo válida solo con texto). */
function svgEnvoltura(inner,alto){
 return `<div class="q-visual"><svg viewBox="0 0 200 ${alto}" width="100%" height="${alto}"
   role="img" aria-hidden="true" style="max-width:280px">${inner}</svg></div>`;
}
function renderVisual(v){
 if(!v||!v.tipo) return '';
 const T=v.tipo;

 // Sumar y restar: dos grupos de emojis separados por el signo.
 if(T==='contar'){
  const e=v.emoji||'🔵';
  const g1=e.repeat(Math.max(0,Math.abs(v.a)));
  const signo=(v.b<0)?'➖':'➕';
  const g2=e.repeat(Math.max(0,Math.abs(v.b)));
  return `<div class="q-visual">${g1} ${signo} ${g2}</div>`;
 }

 // Multiplicar y dividir: `grupos` montones de `porGrupo` cada uno.
 if(T==='agrupar'){
  const e=v.emoji||'🔵';
  const g=Math.max(0,Math.min(12,v.grupos|0)), n=Math.max(0,Math.min(12,v.porGrupo|0));
  let out='';
  for(let i=0;i<g;i++) out+=`<span class="qv-grupo">${e.repeat(n)}</span>`;
  return `<div class="q-visual qv-grupos">${out}</div>`;
 }

 // Fracciones: barra partida en `partes`, con `pintadas` coloreadas.
 if(T==='fraccion'){
  const p=Math.max(1,Math.min(12,v.partes|0)), k=Math.max(0,Math.min(p,v.pintadas|0));
  const w=180/p; let r='';
  for(let i=0;i<p;i++){
   r+=`<rect x="${10+i*w}" y="10" width="${w}" height="40"
        fill="${i<k?'#8f6bff':'#2a2350'}" stroke="#ffc93c" stroke-width="2"/>`;
  }
  return svgEnvoltura(r,60);
 }

 // Recta numérica: de `desde` a `hasta` cada `paso`, con una marca opcional.
 if(T==='recta'){
  const a=v.desde|0, b=v.hasta|0, s=Math.max(1,v.paso|0);
  const n=Math.max(1,Math.floor((b-a)/s));
  let r=`<line x1="10" y1="35" x2="190" y2="35" stroke="#4dd8ff" stroke-width="3"/>`;
  for(let i=0;i<=n;i++){
   const x=10+(180*i/n), val=a+i*s;
   const marcado=(v.marca!==undefined && val===v.marca);
   r+=`<line x1="${x}" y1="28" x2="${x}" y2="42" stroke="#4dd8ff" stroke-width="2"/>`;
   r+=`<text x="${x}" y="58" font-size="11" fill="${marcado?'#ffc93c':'#cfc9ee'}"
        text-anchor="middle" font-weight="bold">${val}</text>`;
   if(marcado) r+=`<circle cx="${x}" cy="35" r="6" fill="#ffc93c"/>`;
  }
  return svgEnvoltura(r,66);
 }

 // Reloj análogo: `hora` (1-12) y `minuto` (0-59).
 if(T==='reloj'){
  const h=((v.hora|0)%12), m=(v.minuto|0)%60;
  const cx=100, cy=60, R=48;
  let r=`<circle cx="${cx}" cy="${cy}" r="${R}" fill="#1a1430" stroke="#ffc93c" stroke-width="3"/>`;
  for(let i=1;i<=12;i++){
   const ang=(i/12)*2*Math.PI - Math.PI/2;
   r+=`<text x="${cx+Math.cos(ang)*(R-11)}" y="${cy+Math.sin(ang)*(R-11)+4}"
        font-size="11" fill="#cfc9ee" text-anchor="middle" font-weight="bold">${i}</text>`;
  }
  const angH=((h+m/60)/12)*2*Math.PI - Math.PI/2;
  const angM=(m/60)*2*Math.PI - Math.PI/2;
  r+=`<line x1="${cx}" y1="${cy}" x2="${cx+Math.cos(angH)*24}" y2="${cy+Math.sin(angH)*24}"
       stroke="#ffc93c" stroke-width="5" stroke-linecap="round"/>`;
  r+=`<line x1="${cx}" y1="${cy}" x2="${cx+Math.cos(angM)*36}" y2="${cy+Math.sin(angM)*36}"
       stroke="#4dd8ff" stroke-width="3" stroke-linecap="round"/>`;
  r+=`<circle cx="${cx}" cy="${cy}" r="4" fill="#ff4d8d"/>`;
  return svgEnvoltura(r,120);
 }

 // Gráfico de barras / pictograma numérico: `etiquetas` y `valores` (máximo 6 barras).
 if(T==='barras'){
  const et=(v.etiquetas||[]).slice(0,6), va=(v.valores||[]).slice(0,6);
  if(!et.length||et.length!==va.length) return '';
  const max=Math.max.apply(null,va.concat([1]));
  const w=170/et.length; let r='';
  et.forEach((e,i)=>{
   const alt=Math.round(60*va[i]/max);
   const x=15+i*w;
   r+=`<rect x="${x}" y="${75-alt}" width="${w*0.62}" height="${alt}" fill="#3ee089"/>`;
   r+=`<text x="${x+w*0.31}" y="${72-alt}" font-size="10" fill="#ffc93c"
        text-anchor="middle" font-weight="bold">${va[i]}</text>`;
   r+=`<text x="${x+w*0.31}" y="90" font-size="10" fill="#cfc9ee"
        text-anchor="middle">${String(e).slice(0,8)}</text>`;
  });
  r+=`<line x1="10" y1="75" x2="190" y2="75" stroke="#cfc9ee" stroke-width="2"/>`;
  return svgEnvoltura(r,98);
 }

 // Cuerpos geométricos: un dibujo simple por nombre.
 if(T==='cuerpo'){
  const n=(v.nombre||'').toLowerCase();
  const st='fill="#2a2350" stroke="#4dd8ff" stroke-width="3"';
  let r='';
  if(n==='cubo'||n==='paralelepipedo'){
   const an=(n==='cubo')?50:70;
   r=`<rect x="${100-an/2}" y="35" width="${an}" height="50" ${st}/>
      <polygon points="${100-an/2},35 ${100-an/2+18},18 ${100+an/2+18},18 ${100+an/2},35" ${st}/>
      <polygon points="${100+an/2},35 ${100+an/2+18},18 ${100+an/2+18},68 ${100+an/2},85" ${st}/>`;
  } else if(n==='esfera'){
   r=`<circle cx="100" cy="55" r="34" ${st}/><ellipse cx="100" cy="55" rx="34" ry="11"
      fill="none" stroke="#4dd8ff" stroke-width="2" opacity=".6"/>`;
  } else if(n==='cono'){
   r=`<polygon points="100,18 66,78 134,78" ${st}/><ellipse cx="100" cy="78" rx="34" ry="11" ${st}/>`;
  } else if(n==='cilindro'){
   r=`<rect x="66" y="30" width="68" height="52" ${st}/>
      <ellipse cx="100" cy="30" rx="34" ry="11" ${st}/><ellipse cx="100" cy="82" rx="34" ry="11" ${st}/>`;
  } else if(n==='piramide'){
   r=`<polygon points="100,18 64,80 136,80" ${st}/><polygon points="100,18 136,80 152,64" ${st}/>`;
  } else return '';
  return svgEnvoltura(r,100);
 }

 return '';   // tipo desconocido: la pregunta vale igual, solo con texto
}
```

- [ ] **Step 2: Agregar el CSS de los grupos**

Junto a la regla `.q-visual` existente (~línea 177), agrega:

```css
.q-visual.qv-grupos{font-size:22px;display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.qv-grupo{border:2px dashed var(--gold);border-radius:12px;padding:4px 8px;display:inline-block}
```

- [ ] **Step 3: Verificar los siete tipos en el navegador**

Con el servidor levantado, abre `http://localhost:8765/3ro/` y en la consola:

```javascript
['contar','agrupar','fraccion','recta','reloj','barras','cuerpo'].forEach(t=>{
  const v={contar:{tipo:'contar',a:3,b:4,emoji:'🍎'},
           agrupar:{tipo:'agrupar',grupos:3,porGrupo:4,emoji:'⭐'},
           fraccion:{tipo:'fraccion',partes:4,pintadas:3},
           recta:{tipo:'recta',desde:0,hasta:100,paso:10,marca:40},
           reloj:{tipo:'reloj',hora:3,minuto:30},
           barras:{tipo:'barras',etiquetas:['Rojo','Azul','Verde'],valores:[4,7,2]},
           cuerpo:{tipo:'cuerpo',nombre:'cubo'}}[t];
  const html=renderVisual(v);
  console.log(t, html.length>0 ? 'OK ('+html.length+' chars)' : 'VACIO');
});
console.log('tipo inventado:', renderVisual({tipo:'zzz'})==='' ? 'ignorado OK' : 'FALLA');
```
Expected: los siete imprimen `OK` con longitud > 0, y el tipo inventado imprime `ignorado OK`.

- [ ] **Step 4: Verificar que se ven de verdad, no solo que devuelven texto**

En la consola, inyecta cada visual y mira el resultado:
```javascript
document.body.insertAdjacentHTML('afterbegin',
 '<div id="pruebaViz" style="position:fixed;inset:0;z-index:99999;background:#151030;overflow:auto;padding:10px">'+
 [{tipo:'agrupar',grupos:3,porGrupo:4,emoji:'⭐'},{tipo:'fraccion',partes:4,pintadas:3},
  {tipo:'recta',desde:0,hasta:100,paso:10,marca:40},{tipo:'reloj',hora:3,minuto:30},
  {tipo:'barras',etiquetas:['Rojo','Azul','Verde'],valores:[4,7,2]},
  {tipo:'cuerpo',nombre:'cilindro'}].map(renderVisual).join('')+'</div>');
```
Comprueba a ojo: las manecillas marcan las 3:30, la barra de fracción tiene 3 de 4 partes
pintadas, la recta marca el 40 en dorado, las barras miden 4/7/2. Luego
`document.getElementById('pruebaViz').remove()`.

- [ ] **Step 5: Verificar que `/juego/` no se tocó**

Run: `cd /c/Proyectos/kimun && git status --short juego/index.html`
Expected: sin salida (el archivo de 8° no aparece modificado).

- [ ] **Step 6: Commit**

```bash
cd /c/Proyectos/kimun
git add 3ro/index.html
git commit -m "3ro: catalogo de apoyos visuales por codigo (agrupar, fraccion, recta, reloj, barras, cuerpo)"
```

---

## Task 4: Script de validación del banco de 3°

**Files:**
- Create: `scripts/validar-banco-3ro.py`

> Es la guardia que evita que ~780 preguntas escritas por agentes entren con defectos que solo
> aparecerían jugando. Se corre después de cada eje generado.

- [ ] **Step 1: Crear el script**

Crea `scripts/validar-banco-3ro.py` con:

```python
# -*- coding: utf-8 -*-
"""
Valida el banco de Matematica 3 basico.

Uso:
    python scripts/validar-banco-3ro.py                       # valida preguntas.json
    python scripts/validar-banco-3ro.py ruta/al/parcial.json  # valida un parcial de agente
"""
import json, sys, io, unicodedata
from collections import Counter
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
BASE = RAIZ / "contenido" / "matematicas-3basico"
LARGO_MAX = 90
TIPOS = {
    "contar":   ("a", "b"),
    "agrupar":  ("grupos", "porGrupo"),
    "fraccion": ("partes", "pintadas"),
    "recta":    ("desde", "hasta", "paso"),
    "reloj":    ("hora", "minuto"),
    "barras":   ("etiquetas", "valores"),
    "cuerpo":   ("nombre",),
}

def norm(t):
    t = unicodedata.normalize("NFKD", str(t).lower())
    return "".join(c for c in t if not unicodedata.combining(c)).strip()

def main():
    ruta = Path(sys.argv[1]) if len(sys.argv) > 1 else BASE / "preguntas.json"
    datos = json.load(io.open(ruta, encoding="utf-8"))
    preguntas = datos["preguntas"] if isinstance(datos, dict) else datos
    oficiales = {o["codigo"] for o in json.load(io.open(BASE / "oa.json", encoding="utf-8"))["oa"]}

    errores, avisos, vistos = [], [], {}
    for i, p in enumerate(preguntas):
        ref = "#%d (%s)" % (i, p.get("pregunta", "")[:40])
        ops = p.get("opciones", [])
        if len(ops) != 4:
            errores.append("%s: tiene %d opciones, deben ser 4" % (ref, len(ops)))
        if len({norm(o) for o in ops}) != len(ops):
            errores.append("%s: opciones repetidas" % ref)
        if any(not str(o).strip() for o in ops):
            errores.append("%s: hay una opcion vacia" % ref)
        c = p.get("correcta")
        if not isinstance(c, int) or not (0 <= c < len(ops)):
            errores.append("%s: 'correcta' invalida (%r)" % (ref, c))
        if p.get("oa") not in oficiales:
            errores.append("%s: OA desconocido %r" % (ref, p.get("oa")))
        if not str(p.get("tip", "")).strip():
            errores.append("%s: sin 'tip' (explicacion al fallar)" % ref)
        if len(p.get("pregunta", "")) > LARGO_MAX:
            avisos.append("%s: enunciado de %d caracteres (max sugerido %d)"
                          % (ref, len(p["pregunta"]), LARGO_MAX))
        v = p.get("visual")
        if v:
            t = v.get("tipo")
            if t not in TIPOS:
                errores.append("%s: visual de tipo desconocido %r" % (ref, t))
            else:
                faltan = [k for k in TIPOS[t] if k not in v]
                if faltan:
                    errores.append("%s: visual '%s' sin campos %s" % (ref, t, faltan))
        k = norm(p.get("pregunta", ""))
        if k in vistos:
            errores.append("%s: enunciado duplicado de #%d" % (ref, vistos[k]))
        else:
            vistos[k] = i

    porOA = Counter(p.get("oa") for p in preguntas)
    print("Archivo: %s" % ruta)
    print("Preguntas: %d | OA cubiertos: %d de %d" % (len(preguntas), len(porOA), len(oficiales)))
    for oa in sorted(oficiales):
        n = porOA.get(oa, 0)
        marca = "  " if n >= 30 else ("! " if n else "X ")
        print("%s%s: %d" % (marca, oa, n))
    if avisos:
        print("\nAVISOS (%d):" % len(avisos))
        for a in avisos[:20]:
            print("  - %s" % a)
    if errores:
        print("\nERRORES (%d):" % len(errores))
        for e in errores[:40]:
            print("  - %s" % e)
        sys.exit(1)
    print("\nSin errores.")

if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Correrlo contra el banco semilla (debe pasar)**

Run: `cd /c/Proyectos/kimun && PYTHONIOENCODING=utf-8 python scripts/validar-banco-3ro.py`
Expected: termina con `Sin errores.`, reporta `Preguntas: 12 | OA cubiertos: 2 de 26`, y marca
con `X` los 24 OA todavía en cero.

- [ ] **Step 3: Comprobar que el validador de verdad atrapa fallas**

```bash
cd /c/Proyectos/kimun && PYTHONIOENCODING=utf-8 python -c "
import json,io
io.open('_mal.json','w',encoding='utf-8').write(json.dumps({'preguntas':[
 {'oa':'MA03 OA 99','pregunta':'x','opciones':['a','a','b'],'correcta':7,'tip':''}
]},ensure_ascii=False))
" && PYTHONIOENCODING=utf-8 python scripts/validar-banco-3ro.py _mal.json; echo "salida: $?"; rm -f _mal.json
```
Expected: imprime errores por OA desconocido, opciones repetidas, 3 opciones, `correcta`
inválida y `tip` vacío, y **sale con código 1**. Si sale 0, el validador no sirve: arréglalo.

- [ ] **Step 4: Commit**

```bash
cd /c/Proyectos/kimun
git add scripts/validar-banco-3ro.py
git commit -m "3ro: validador del banco de Matematica 3 (estructura, OA oficiales, duplicados, visuales)"
```

---

## Tasks 5-9: Generación del banco por eje (un eje por tarea)

> **Cómo se ejecutan:** cada tarea despacha **agentes en paralelo, uno por OA** del eje. Cada
> agente escribe un archivo parcial. Después se valida el eje completo y se commitea. Se hace eje
> por eje —y no todo de una vez— para que un problema de redacción se detecte a los 2-3 OA y no
> después de 780 preguntas.

### Reglas de redacción (van íntegras en el prompt de cada agente)

> Escribes preguntas de opción múltiple para niños chilenos de **8-9 años** (3° básico) que
> recién leen con fluidez. Reglas:
> 1. **Enunciado de máximo 90 caracteres.** Una sola frase. Sin subordinadas.
> 2. **Vocabulario cotidiano.** Nada de "determine", "identifique la alternativa", "cuál de las
>    siguientes". Se escribe como le hablarías a un niño: "¿Cuánto es…?", "¿Qué número sigue?",
>    "María tiene 6 lápices y…".
> 3. **Español latino neutro de Chile, sin modismos.** Objetos del día a día chileno (lápices,
>    galletas, pesos, micro, colegio), nunca marcas comerciales.
> 4. **Cuatro opciones**, todas plausibles y del mismo tipo (si la respuesta es un número, las
>    cuatro son números parecidos). Los distractores deben ser **errores típicos** del niño (no
>    llevar la reserva, contar de a uno en vez de a diez), no números al azar.
> 5. **`tip` obligatorio**: una frase corta que explique el porqué, no que repita la respuesta.
>    Bien: "Para sumar 7 + 8, completa hasta 10: 7 + 3 = 10, y quedan 5 más." Mal: "La respuesta es 15."
> 6. **Apoyo visual** cuando ayude de verdad, con el objeto `visual`. No lo pongas si el dibujo
>    no agrega nada.
> 7. **Nada de números fuera del rango del OA.** Si el OA dice "hasta 1.000", no aparece el 2.500.
> 8. **`revisada: false`** en todas: las aprueba un humano después.
>
> **Tipos de `visual` disponibles** (omite el campo si no corresponde):
> - `{"tipo":"contar","a":6,"b":7,"emoji":"🍎"}` — suma (b positivo) o resta (b negativo)
> - `{"tipo":"agrupar","grupos":3,"porGrupo":4,"emoji":"⭐"}` — multiplicación y división
> - `{"tipo":"fraccion","partes":4,"pintadas":3}` — fracciones de un todo
> - `{"tipo":"recta","desde":0,"hasta":100,"paso":10,"marca":40}` — recta numérica
> - `{"tipo":"reloj","hora":3,"minuto":30}` — reloj análogo
> - `{"tipo":"barras","etiquetas":["Rojo","Azul"],"valores":[4,7]}` — gráfico de barras (máx. 6)
> - `{"tipo":"cuerpo","nombre":"cubo"}` — nombres válidos exactos: `cubo`, `paralelepipedo`,
>   `esfera`, `cono`, `cilindro`, `piramide` (sin tilde, como los espera el motor)
>
> **Formato exacto de salida** (un archivo JSON, nada más):
> ```json
> {"preguntas":[
>   {"oa":"MA03 OA 06","pregunta":"¿Cuánto es 25 + 17?","opciones":["32","42","41","52"],
>    "correcta":1,"tip":"25 + 17: suma las decenas (30) y las unidades (12), y junta: 42.",
>    "visual":{"tipo":"contar","a":25,"b":17,"emoji":"🔵"},"revisada":false}
> ]}
> ```

### Task 5: Eje 1 · Números y operaciones (OA 01-11) — 11 agentes

**Files:**
- Create: `contenido/matematicas-3basico/_pool/verificado/u1-oa01.json` … `u1-oa11.json`

- [ ] **Step 1: Crear la carpeta de parciales**

Run: `cd /c/Proyectos/kimun && mkdir -p contenido/matematicas-3basico/_pool/verificado`

- [ ] **Step 2: Despachar un agente por OA (los 11 en paralelo)**

Cada agente recibe: las **Reglas de redacción** completas de arriba, **el texto oficial literal de
su OA** (de `contenido/matematicas-3basico/oa.json`), y esta instrucción:

> Escribe **30 preguntas** para el objetivo `MA03 OA NN`, cuyo texto oficial es: «‹texto›».
> Cubre el objetivo completo, repartiendo entre los distintos aspectos que el texto oficial
> enumera. Escribe el archivo en
> `contenido/matematicas-3basico/_pool/verificado/u1-oaNN.json` con el formato exacto indicado.
> No escribas ningún otro archivo.

> **Aviso para quien ejecute:** el OA 01 y el OA 06 **ya tienen 6 preguntas cada uno** en
> `preguntas.json` (el banco semilla). Los agentes de esos dos OA escriben sus 30 igual; la
> deduplicación de la Task 10 se encarga de los choques.

- [ ] **Step 3: Validar el eje completo**

```bash
cd /c/Proyectos/kimun && for f in contenido/matematicas-3basico/_pool/verificado/u1-*.json; do
  PYTHONIOENCODING=utf-8 python scripts/validar-banco-3ro.py "$f" || echo "FALLA EN $f"
done
```
Expected: cada archivo termina en `Sin errores.` y ninguno imprime `FALLA EN`.

- [ ] **Step 4: Revisar a mano una muestra de 5 preguntas**

```bash
cd /c/Proyectos/kimun && PYTHONIOENCODING=utf-8 python -c "
import json,io,glob,random
random.seed(7)
ps=[q for f in glob.glob('contenido/matematicas-3basico/_pool/verificado/u1-*.json')
      for q in json.load(io.open(f,encoding='utf-8'))['preguntas']]
for q in random.sample(ps,5):
    print(q['oa'],'|',q['pregunta'])
    print('   ',q['opciones'],'-> correcta:',q['opciones'][q['correcta']])
    print('    tip:',q['tip']); print()
"
```
Lee las cinco y comprueba a ojo: la respuesta marcada es **realmente** la correcta, el `tip`
explica en vez de repetir, y el lenguaje es de niño. Si alguna falla, re-despacha ese OA.

- [ ] **Step 5: Commit**

```bash
cd /c/Proyectos/kimun
git add contenido/matematicas-3basico/_pool/verificado/u1-*.json
git commit -m "3ro: banco parcial eje Numeros y operaciones (OA 01-11)"
```

### Task 6: Eje 2 · Patrones y álgebra (OA 12-13) — 2 agentes

**Files:**
- Create: `contenido/matematicas-3basico/_pool/verificado/u2-oa12.json`, `u2-oa13.json`

- [ ] **Step 1: Despachar los 2 agentes**

Mismas Reglas de redacción y misma instrucción de la Task 5 Step 2, con los códigos `MA03 OA 12`
y `MA03 OA 13` y sus textos oficiales, escribiendo en `u2-oaNN.json`.

Indicación extra para el agente del **OA 13** (ecuaciones con un símbolo desconocido): el símbolo
se escribe en el enunciado como un cuadrito `▢` o un emoji, **nunca como `x`** — a los 8 años
todavía no hay letras. Ejemplo: `5 + ▢ = 12. ¿Cuánto vale ▢?`

- [ ] **Step 2: Validar**

```bash
cd /c/Proyectos/kimun && for f in contenido/matematicas-3basico/_pool/verificado/u2-*.json; do
  PYTHONIOENCODING=utf-8 python scripts/validar-banco-3ro.py "$f" || echo "FALLA EN $f"
done
```
Expected: `Sin errores.` en ambos, sin `FALLA EN`.

- [ ] **Step 3: Commit**

```bash
cd /c/Proyectos/kimun
git add contenido/matematicas-3basico/_pool/verificado/u2-*.json
git commit -m "3ro: banco parcial eje Patrones y algebra (OA 12-13)"
```

### Task 7: Eje 3 · Geometría (OA 14-18) — 5 agentes

**Files:**
- Create: `contenido/matematicas-3basico/_pool/verificado/u3-oa14.json` … `u3-oa18.json`

- [ ] **Step 1: Despachar los 5 agentes**

Mismas Reglas y misma instrucción, con estas indicaciones extra por OA:
- **OA 16** (describir cuerpos): usa `{"tipo":"cuerpo","nombre":"…"}` en al menos la mitad de las
  preguntas, solo con los seis nombres válidos.
- **OA 14** (localización en cuadrícula): describe la cuadrícula **en palabras** dentro del
  enunciado (ej. "En el mapa, el árbol está en la fila 2, columna 3"), porque no hay visual de
  cuadrícula.
- **OA 18** (ángulos): apóyate en referencias del entorno (la esquina de una hoja mide 90°) y en
  comparaciones con 45° y 90°, sin transportador.

- [ ] **Step 2: Validar**

```bash
cd /c/Proyectos/kimun && for f in contenido/matematicas-3basico/_pool/verificado/u3-*.json; do
  PYTHONIOENCODING=utf-8 python scripts/validar-banco-3ro.py "$f" || echo "FALLA EN $f"
done
```
Expected: `Sin errores.` en los cinco.

- [ ] **Step 3: Comprobar que los `cuerpo` usan nombres que el motor dibuja**

```bash
cd /c/Proyectos/kimun && PYTHONIOENCODING=utf-8 python -c "
import json,io,glob
from collections import Counter
c=Counter()
for f in glob.glob('contenido/matematicas-3basico/_pool/verificado/u3-*.json'):
    for q in json.load(io.open(f,encoding='utf-8'))['preguntas']:
        v=q.get('visual')
        if v and v.get('tipo')=='cuerpo': c[v.get('nombre')]+=1
validos={'cubo','paralelepipedo','esfera','cono','cilindro','piramide'}
print('nombres usados:',dict(c))
print('invalidos:',sorted(set(c)-validos))
"
```
Expected: `invalidos: []`. Cualquier nombre fuera de esa lista se dibujaría vacío en el juego.

- [ ] **Step 4: Commit**

```bash
cd /c/Proyectos/kimun
git add contenido/matematicas-3basico/_pool/verificado/u3-*.json
git commit -m "3ro: banco parcial eje Geometria (OA 14-18)"
```

### Task 8: Eje 4 · Medición (OA 19-22) — 4 agentes

**Files:**
- Create: `contenido/matematicas-3basico/_pool/verificado/u4-oa19.json` … `u4-oa22.json`

- [ ] **Step 1: Despachar los 4 agentes**

Mismas Reglas y misma instrucción, con indicaciones extra:
- **OA 20** (la hora): usa `{"tipo":"reloj","hora":H,"minuto":M}` en al menos la mitad. Cubre
  horas en punto, medias horas, cuartos y minutos, y también **relojes digitales escritos en el
  texto** (ej. "El reloj digital marca 7:45").
- **OA 19** (líneas de tiempo y calendarios): describe el calendario en palabras dentro del
  enunciado; no hay visual de calendario.
- **OA 21** (perímetro): da las medidas de los lados en el enunciado, **sin visual**.
- **OA 22** (peso): trabaja con g y kg y referentes cotidianos (un kilo de pan, una manzana).

- [ ] **Step 2: Validar**

```bash
cd /c/Proyectos/kimun && for f in contenido/matematicas-3basico/_pool/verificado/u4-*.json; do
  PYTHONIOENCODING=utf-8 python scripts/validar-banco-3ro.py "$f" || echo "FALLA EN $f"
done
```
Expected: `Sin errores.` en los cuatro.

- [ ] **Step 3: Comprobar que las horas de los relojes son válidas**

```bash
cd /c/Proyectos/kimun && PYTHONIOENCODING=utf-8 python -c "
import json,io,glob
malas=[]
for f in glob.glob('contenido/matematicas-3basico/_pool/verificado/u4-*.json'):
    for q in json.load(io.open(f,encoding='utf-8'))['preguntas']:
        v=q.get('visual')
        if v and v.get('tipo')=='reloj':
            h,m=v.get('hora'),v.get('minuto')
            if not(isinstance(h,int) and isinstance(m,int) and 1<=h<=12 and 0<=m<=59):
                malas.append((q['pregunta'],h,m))
print('relojes fuera de rango:',malas)
"
```
Expected: `relojes fuera de rango: []`

- [ ] **Step 4: Commit**

```bash
cd /c/Proyectos/kimun
git add contenido/matematicas-3basico/_pool/verificado/u4-*.json
git commit -m "3ro: banco parcial eje Medicion (OA 19-22)"
```

### Task 9: Eje 5 · Datos y probabilidades (OA 23-26) — 4 agentes

**Files:**
- Create: `contenido/matematicas-3basico/_pool/verificado/u5-oa23.json` … `u5-oa26.json`

- [ ] **Step 1: Despachar los 4 agentes**

Mismas Reglas y misma instrucción, con indicaciones extra:
- **OA 23 y OA 25** (tablas, gráficos de barra, pictogramas): usa
  `{"tipo":"barras","etiquetas":[…],"valores":[…]}` en al menos la mitad, **máximo 6 barras** y
  etiquetas de hasta 8 caracteres (el motor las recorta).
- **OA 24** (dados y monedas): preguntas sobre el menor, el mayor y el punto medio de datos ya
  registrados.
- **OA 26** (diagramas de puntos): descríbelo en el enunciado (ej. "Sobre el 3 hay 4 puntos");
  no hay visual de diagrama de puntos.

- [ ] **Step 2: Validar**

```bash
cd /c/Proyectos/kimun && for f in contenido/matematicas-3basico/_pool/verificado/u5-*.json; do
  PYTHONIOENCODING=utf-8 python scripts/validar-banco-3ro.py "$f" || echo "FALLA EN $f"
done
```
Expected: `Sin errores.` en los cuatro.

- [ ] **Step 3: Comprobar que las barras calzan (etiquetas y valores del mismo largo)**

```bash
cd /c/Proyectos/kimun && PYTHONIOENCODING=utf-8 python -c "
import json,io,glob
malas=[]
for f in glob.glob('contenido/matematicas-3basico/_pool/verificado/u5-*.json'):
    for q in json.load(io.open(f,encoding='utf-8'))['preguntas']:
        v=q.get('visual')
        if v and v.get('tipo')=='barras':
            e,va=v.get('etiquetas',[]),v.get('valores',[])
            if len(e)!=len(va) or not e or len(e)>6: malas.append(q['pregunta'][:50])
print('barras mal formadas:',malas)
"
```
Expected: `barras mal formadas: []` — si etiquetas y valores no calzan, `renderVisual` devuelve
vacío y la pregunta se queda sin el gráfico que hace falta para responderla.

- [ ] **Step 4: Commit**

```bash
cd /c/Proyectos/kimun
git add contenido/matematicas-3basico/_pool/verificado/u5-*.json
git commit -m "3ro: banco parcial eje Datos y probabilidades (OA 23-26)"
```

---

## Task 10: Consolidar, deduplicar y barajar el banco completo

**Files:**
- Create: `scripts/consolidar-pool-3ro.py`
- Modify: `contenido/matematicas-3basico/preguntas.json`

> `scripts/consolidar-pool.py` existe pero está **cableado a `historia-8basico`** (constante
> `BASE`, línea ~30). No se toca: se crea uno propio para 3°, con la misma lógica.

- [ ] **Step 1: Crear el consolidador**

Crea `scripts/consolidar-pool-3ro.py` con:

```python
# -*- coding: utf-8 -*-
"""
Consolida el banco de Matematica 3 basico.

- Lee los parciales de contenido/matematicas-3basico/_pool/verificado/*.json
- Suma las preguntas que ya estaban en preguntas.json (el banco semilla)
- Quita duplicados por enunciado normalizado (gana la primera aparicion)
- Baraja las opciones con semilla fija, repartiendo la correcta entre las 4 posiciones
- Asigna ids estables por OA (mat3-oaNN-n)
- Escribe preguntas.json ordenado por OA

Uso:
    python scripts/consolidar-pool-3ro.py
"""
import json, io, glob, random, unicodedata
from collections import defaultdict, Counter
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
BASE = RAIZ / "contenido" / "matematicas-3basico"
VERIF = BASE / "_pool" / "verificado"
SALIDA = BASE / "preguntas.json"
SEMILLA = 42

def norm(t):
    t = unicodedata.normalize("NFKD", str(t).lower())
    return "".join(c for c in t if not unicodedata.combining(c)).strip()

def cargar(ruta):
    d = json.load(io.open(ruta, encoding="utf-8"))
    return d["preguntas"] if isinstance(d, dict) else d

def main():
    rnd = random.Random(SEMILLA)
    todas = []
    if SALIDA.exists():
        todas += cargar(SALIDA)
    for f in sorted(glob.glob(str(VERIF / "*.json"))):
        todas += cargar(f)

    vistos, unicas = set(), []
    for p in todas:
        k = norm(p.get("pregunta", ""))
        if k in vistos:
            continue
        vistos.add(k)
        unicas.append(p)

    porOA = defaultdict(list)
    for p in unicas:
        porOA[p["oa"]].append(p)

    salida = []
    for oa in sorted(porOA):
        for i, p in enumerate(porOA[oa], 1):
            ops = list(p["opciones"])
            texto_correcto = ops[p["correcta"]]
            destino = (i - 1) % len(ops)          # reparto ciclico: 0,1,2,3,0,1,...
            resto = [o for j, o in enumerate(ops) if j != p["correcta"]]
            rnd.shuffle(resto)
            p["opciones"] = resto[:destino] + [texto_correcto] + resto[destino:]
            p["correcta"] = destino
            p["id"] = "mat3-%s-%d" % (oa.replace("MA03 OA ", "oa"), i)
            salida.append(p)

    io.open(SALIDA, "w", encoding="utf-8").write(
        json.dumps({"preguntas": salida}, ensure_ascii=False, indent=2))

    c = Counter(p["oa"] for p in salida)
    pos = Counter(p["correcta"] for p in salida)
    print("Escritas %d preguntas en %s" % (len(salida), SALIDA))
    print("Descartadas por duplicado: %d" % (len(todas) - len(unicas)))
    print("Reparto de la correcta por posicion: %s" % dict(sorted(pos.items())))
    for oa in sorted(c):
        print("  %s: %d" % (oa, c[oa]))

if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Ejecutarlo**

Run: `cd /c/Proyectos/kimun && PYTHONIOENCODING=utf-8 python scripts/consolidar-pool-3ro.py`
Expected: reporta ~780 preguntas, los 26 OA con ~30 cada uno, y un reparto de posiciones
parejo (cada una entre el 20% y el 30% del total). Si una posición se lleva más del 40%, el
barajado no está funcionando: revísalo antes de seguir.

- [ ] **Step 3: Validar el banco consolidado**

Run: `cd /c/Proyectos/kimun && PYTHONIOENCODING=utf-8 python scripts/validar-banco-3ro.py`
Expected: `Sin errores.`, `OA cubiertos: 26 de 26`, y **ningún OA marcado con `X` ni con `!`**
(es decir, los 26 con 30 o más).

- [ ] **Step 4: Commit**

```bash
cd /c/Proyectos/kimun
git add scripts/consolidar-pool-3ro.py contenido/matematicas-3basico/preguntas.json
git commit -m "3ro: banco de Matematica 3 consolidado, deduplicado y barajado (26 OA)"
```

---

## Task 11: Campaña de año completo — 7 capítulos, etapas de 10

**Files:**
- Modify: `3ro/index.html` (bloques `EXPEDICIONES` y `CAMPAÑAS`)

> Los 26 OA se reparten en **7 capítulos**. Números y operaciones tiene 11 OA: como un solo
> capítulo serían 11 etapas, demasiado largo, así que se parte en tres por tema. El resto sigue
> los ejes oficiales.

- [ ] **Step 1: Reemplazar `EXPEDICIONES` completo**

```javascript
const EXPEDICIONES=[
 { id:'mat3-cap1', asignatura:'Matemática', nivel:'3° Básico · Números hasta 1.000',
   portada:'assets/portada-matematicas.png',
   contenido:'contenido/matematicas-3basico/preguntas.json', activa:true, campaña:'mat3',
   etapas:[
     {oa:"MA03 OA 01",nombre:"Contar de a saltos",icono:"🔢",n:10},
     {oa:"MA03 OA 02",nombre:"Leer números",icono:"👀",n:10},
     {oa:"MA03 OA 03",nombre:"Comparar y ordenar",icono:"⚖️",n:10},
     {oa:"MA03 OA 05",nombre:"Unidades, decenas y centenas",icono:"💯",n:10},
     {oa:"BOSS",nombre:"⚡ JEFE: Números hasta 1.000",icono:"🐲",n:15,
      oas:["MA03 OA 01","MA03 OA 02","MA03 OA 03","MA03 OA 05"]},
   ]},
 { id:'mat3-cap2', asignatura:'Matemática', nivel:'3° Básico · Sumar y restar',
   portada:'assets/portada-matematicas.png',
   contenido:'contenido/matematicas-3basico/preguntas.json', activa:true, campaña:'mat3',
   etapas:[
     {oa:"MA03 OA 04",nombre:"Cálculo mental",icono:"🧠",n:10},
     {oa:"MA03 OA 06",nombre:"Sumar y restar hasta 1.000",icono:"➕",n:10},
     {oa:"MA03 OA 07",nombre:"Familia de operaciones",icono:"🔁",n:10},
     {oa:"BOSS",nombre:"⚡ JEFE: Sumar y restar",icono:"🐲",n:15,
      oas:["MA03 OA 04","MA03 OA 06","MA03 OA 07"]},
   ]},
 { id:'mat3-cap3', asignatura:'Matemática', nivel:'3° Básico · Multiplicar y dividir',
   portada:'assets/portada-matematicas.png',
   contenido:'contenido/matematicas-3basico/preguntas.json', activa:true, campaña:'mat3',
   etapas:[
     {oa:"MA03 OA 08",nombre:"Tablas de multiplicar",icono:"✖️",n:10},
     {oa:"MA03 OA 09",nombre:"Repartir en partes iguales",icono:"➗",n:10},
     {oa:"MA03 OA 10",nombre:"Problemas con dinero",icono:"💰",n:10},
     {oa:"BOSS",nombre:"⚡ JEFE: Multiplicar y dividir",icono:"🐲",n:15,
      oas:["MA03 OA 08","MA03 OA 09","MA03 OA 10"]},
   ]},
 { id:'mat3-cap4', asignatura:'Matemática', nivel:'3° Básico · Fracciones y patrones',
   portada:'assets/portada-matematicas.png',
   contenido:'contenido/matematicas-3basico/preguntas.json', activa:true, campaña:'mat3',
   etapas:[
     {oa:"MA03 OA 11",nombre:"Fracciones de uso común",icono:"🍕",n:10},
     {oa:"MA03 OA 12",nombre:"Patrones numéricos",icono:"🔷",n:10},
     {oa:"MA03 OA 13",nombre:"El número escondido",icono:"❓",n:10},
     {oa:"BOSS",nombre:"⚡ JEFE: Fracciones y patrones",icono:"🐲",n:15,
      oas:["MA03 OA 11","MA03 OA 12","MA03 OA 13"]},
   ]},
 { id:'mat3-cap5', asignatura:'Matemática', nivel:'3° Básico · Geometría',
   portada:'assets/portada-matematicas.png',
   contenido:'contenido/matematicas-3basico/preguntas.json', activa:true, campaña:'mat3',
   etapas:[
     {oa:"MA03 OA 14",nombre:"¿Dónde está?",icono:"🗺️",n:10},
     {oa:"MA03 OA 15",nombre:"De la red al cuerpo",icono:"📦",n:10},
     {oa:"MA03 OA 16",nombre:"Cuerpos geométricos",icono:"🧊",n:10},
     {oa:"MA03 OA 17",nombre:"Mover, reflejar y girar",icono:"🔄",n:10},
     {oa:"MA03 OA 18",nombre:"Ángulos",icono:"📐",n:10},
     {oa:"BOSS",nombre:"⚡ JEFE: Geometría",icono:"🐲",n:15,
      oas:["MA03 OA 14","MA03 OA 15","MA03 OA 16","MA03 OA 17","MA03 OA 18"]},
   ]},
 { id:'mat3-cap6', asignatura:'Matemática', nivel:'3° Básico · Medir',
   portada:'assets/portada-matematicas.png',
   contenido:'contenido/matematicas-3basico/preguntas.json', activa:true, campaña:'mat3',
   etapas:[
     {oa:"MA03 OA 19",nombre:"Calendarios y líneas de tiempo",icono:"📅",n:10},
     {oa:"MA03 OA 20",nombre:"Leer la hora",icono:"🕒",n:10},
     {oa:"MA03 OA 21",nombre:"Perímetro",icono:"📏",n:10},
     {oa:"MA03 OA 22",nombre:"Peso: gramos y kilos",icono:"⚖️",n:10},
     {oa:"BOSS",nombre:"⚡ JEFE: Medir",icono:"🐲",n:15,
      oas:["MA03 OA 19","MA03 OA 20","MA03 OA 21","MA03 OA 22"]},
   ]},
 { id:'mat3-cap7', asignatura:'Matemática', nivel:'3° Básico · Datos',
   portada:'assets/portada-matematicas.png',
   contenido:'contenido/matematicas-3basico/preguntas.json', activa:true, campaña:'mat3',
   etapas:[
     {oa:"MA03 OA 23",nombre:"Encuestas y tablas",icono:"📋",n:10},
     {oa:"MA03 OA 24",nombre:"Dados y monedas",icono:"🎲",n:10},
     {oa:"MA03 OA 25",nombre:"Gráficos y pictogramas",icono:"📊",n:10},
     {oa:"MA03 OA 26",nombre:"Diagramas de puntos",icono:"⚫",n:10},
     {oa:"BOSS",nombre:"⚡ JEFE: Datos",icono:"🐲",n:15,
      oas:["MA03 OA 23","MA03 OA 24","MA03 OA 25","MA03 OA 26"]},
   ]},
];
```

- [ ] **Step 2: Actualizar `CAMPAÑAS` con los 7 capítulos y las fases del Jefe Final**

```javascript
const CAMPAÑAS=[{
  id:'mat3', asignatura:'Matemática', portada:'assets/portada-matematicas.png',
  intro:'Cuenta, suma, mide y descubre con Vulpi.',
  capitulos:['mat3-cap1','mat3-cap2','mat3-cap3','mat3-cap4','mat3-cap5','mat3-cap6','mat3-cap7'],
  jefeFinal:{
    villano:'El Número Perdido', villanoIc:'🔟', villanoImg:'assets/portada-matematicas.png',
    dialogo:'¿Puedes encontrarme entre tantos números?',
    derrota:'¡Casi! Practica un poco más y vuelve a buscarme.',
    vidasJugador:3, nPorFase:4,
    fases:[
      {nombre:'Números',      oas:['MA03 OA 01','MA03 OA 02','MA03 OA 03','MA03 OA 05']},
      {nombre:'Operaciones',  oas:['MA03 OA 04','MA03 OA 06','MA03 OA 07','MA03 OA 08','MA03 OA 09','MA03 OA 10','MA03 OA 11','MA03 OA 12','MA03 OA 13']},
      {nombre:'Formas',       oas:['MA03 OA 14','MA03 OA 15','MA03 OA 16','MA03 OA 17','MA03 OA 18']},
      {nombre:'Medir y datos',oas:['MA03 OA 19','MA03 OA 20','MA03 OA 21','MA03 OA 22','MA03 OA 23','MA03 OA 24','MA03 OA 25','MA03 OA 26']},
    ],
  },
  recompensa:{ skin:'kimun-calculista', insignia:'maestro-matematica', bonoMonedas:200, bonoXP:100 },
},];
```

> El Jefe Final queda en **4 fases × 4 preguntas = 16 aciertos**, igual que los de 8°. Las cuatro
> fases entre todas cubren los 26 OA.

- [ ] **Step 3: Verificar que cada etapa tiene banco suficiente y que están los 26 OA**

```bash
cd /c/Proyectos/kimun && PYTHONIOENCODING=utf-8 python -c "
import json,io,re
from collections import Counter
banco=Counter(p['oa'] for p in json.load(io.open('contenido/matematicas-3basico/preguntas.json',encoding='utf-8'))['preguntas'])
html=io.open('3ro/index.html',encoding='utf-8').read()
bloque=html[html.index('const EXPEDICIONES='):html.index('const CAMPAÑAS=')]
faltan=[]
for oa,n in re.findall(r'\{oa:\"(MA03 OA \d\d)\",nombre:\"[^\"]*\",icono:\"[^\"]*\",n:(\d+)\}',bloque):
    if banco.get(oa,0) < int(n): faltan.append((oa,banco.get(oa,0),int(n)))
print('etapas sin banco suficiente:',faltan)
print('OA usados en etapas:',len(set(re.findall(r'oa:\"(MA03 OA \d\d)\"',bloque))))
"
```
Expected: `etapas sin banco suficiente: []` y `OA usados en etapas: 26`.

- [ ] **Step 4: Verificar en el navegador el recorrido completo**

Con `python -m http.server 8765` corriendo, abre `http://localhost:8765/3ro/`:
1. JUGADOR → Matemática → la campaña muestra **7 capítulos + el Jefe Final** (8 nodos).
2. Capítulo 1 abierto, capítulos 2-7 con 🔒 (desbloqueo secuencial).
3. Entra a la primera etapa: **10 preguntas**, sin reloj, con la tarjeta 🎯 de meta.
4. Abre una etapa de Geometría con `?qa=1` y confirma que el **cuerpo geométrico se dibuja**.
5. Abre una etapa de Medición con `?qa=1` y confirma que el **reloj se dibuja**.
6. Consola sin errores.

- [ ] **Step 5: Commit**

```bash
cd /c/Proyectos/kimun
git add 3ro/index.html
git commit -m "3ro: campana de Matematica 3 de ano completo (7 capitulos, 26 OA, etapas de 10)"
```

---

## Task 12: `META_OA` para los 26 objetivos

**Files:**
- Modify: `3ro/index.html` (bloque `META_OA`)

> Una frase por OA, **en lenguaje de niño de 8 años**, que se muestra antes de la etapa y bajo el
> enunciado. No es el texto oficial: es lo que el niño va a poder hacer.

- [ ] **Step 1: Reemplazar `META_OA` completo**

```javascript
const META_OA={
 'MA03 OA 01':'Contar de a saltos: de 5 en 5, de 10 en 10 y de 100 en 100.',
 'MA03 OA 02':'Leer y escribir números hasta el 1.000.',
 'MA03 OA 03':'Decir qué número es más grande y ordenarlos.',
 'MA03 OA 04':'Sumar y restar de memoria, con trucos que te ayudan.',
 'MA03 OA 05':'Saber cuántas unidades, decenas y centenas tiene un número.',
 'MA03 OA 06':'Sumar y restar números grandes, hasta el 1.000.',
 'MA03 OA 07':'Descubrir que sumar y restar se ayudan entre sí.',
 'MA03 OA 08':'Aprender las tablas de multiplicar hasta el 10.',
 'MA03 OA 09':'Repartir en partes iguales: eso es dividir.',
 'MA03 OA 10':'Resolver problemas del día a día, también con dinero.',
 'MA03 OA 11':'Entender los pedazos de un todo: 1/2, 1/3, 1/4.',
 'MA03 OA 12':'Descubrir el patrón que siguen los números.',
 'MA03 OA 13':'Encontrar el número escondido en una operación.',
 'MA03 OA 14':'Decir dónde está algo en un mapa o una cuadrícula.',
 'MA03 OA 15':'Armar un cuerpo con su plantilla, y desarmarlo.',
 'MA03 OA 16':'Reconocer cubos, esferas, conos, cilindros y pirámides.',
 'MA03 OA 17':'Ver cuándo una figura se movió, se reflejó o giró.',
 'MA03 OA 18':'Reconocer ángulos y compararlos con una esquina.',
 'MA03 OA 19':'Leer calendarios y líneas de tiempo.',
 'MA03 OA 20':'Leer la hora en el reloj de agujas y en el digital.',
 'MA03 OA 21':'Medir el contorno de una figura: el perímetro.',
 'MA03 OA 22':'Medir el peso en gramos y en kilos.',
 'MA03 OA 23':'Preguntar, anotar los datos y ponerlos en un gráfico.',
 'MA03 OA 24':'Ordenar datos de dados y monedas: el menor y el mayor.',
 'MA03 OA 25':'Leer gráficos de barras y pictogramas.',
 'MA03 OA 26':'Mostrar datos con diagramas de puntos.',
};
```

- [ ] **Step 2: Verificar que no falta ninguna meta**

```bash
cd /c/Proyectos/kimun && PYTHONIOENCODING=utf-8 python -c "
import json,io,re
html=io.open('3ro/index.html',encoding='utf-8').read()
ini=html.index('const META_OA=')
metas=set(re.findall(r\"'(MA03 OA \d\d)':\",html[ini:html.index('};',ini)]))
oficiales={o['codigo'] for o in json.load(io.open('contenido/matematicas-3basico/oa.json',encoding='utf-8'))['oa']}
print('metas:',len(metas),'| sin meta:',sorted(oficiales-metas))
"
```
Expected: `metas: 26 | sin meta: []`

- [ ] **Step 3: Verificar una meta en el navegador**

Abre una etapa de Geometría en `http://localhost:8765/3ro/` y confirma que la tarjeta 🎯 muestra
la frase de niño, no el texto oficial del MINEDUC (que es larguísimo).

- [ ] **Step 4: Commit**

```bash
cd /c/Proyectos/kimun
git add 3ro/index.html
git commit -m "3ro: metas de aprendizaje en lenguaje de nino para los 26 OA"
```

---

## Task 13: Cierre — tablero, revisión pedagógica y verificación final

**Files:**
- Modify: `dev/tablero.html` (regenerado), `CLAUDE.md` (bitácora)

- [ ] **Step 1: Regenerar el tablero**

Run: `cd /c/Proyectos/kimun && python scripts/generar-tablero.py`
Expected: sin traceback.

Verifica que 3° aparece completo:
```bash
cd /c/Proyectos/kimun && grep -o "MA03 OA [0-9][0-9]" dev/tablero.html | sort -u | wc -l
```
Expected: `26`

- [ ] **Step 2: Confirmar que el banco nace sin revisar**

```bash
cd /c/Proyectos/kimun && PYTHONIOENCODING=utf-8 python -c "
import json,io
ps=json.load(io.open('contenido/matematicas-3basico/preguntas.json',encoding='utf-8'))['preguntas']
print('total:',len(ps),'| revisadas:',sum(1 for p in ps if p.get('revisada')))
"
```
Expected: `revisadas: 0`. La aprobación es de Roberto, por el flujo de siempre: tablero →
"Exportar revisadas" → `python scripts/aplicar-revisadas.py` → regenerar tablero.

- [ ] **Step 3: Verificar que 8° quedó intacto en todo el plan**

```bash
cd /c/Proyectos/kimun && git diff --stat 7d932d8..HEAD -- juego/ && echo "--- (sin salida arriba = 8° intacto) ---"
```
Expected: el comando **no imprime nada** para `juego/`.

- [ ] **Step 4: Verificar que nada enlaza a `/3ro`**

Run: `cd /c/Proyectos/kimun && grep -rn "3ro" index.html juego/index.html profesor.html`
Expected: sin resultados. 3° sigue aislado hasta que el Plan 3 decida cómo se accede.

- [ ] **Step 5: Recorrido final en el navegador**

Con el servidor arriba, en `http://localhost:8765/3ro/?qa=1` (QA desbloquea todo):
1. Los 7 capítulos abiertos y el Jefe Final accesible.
2. Una etapa de cada capítulo: 10 preguntas, sin reloj, meta 🎯, 🔊 Escuchar funciona.
3. Los visuales se dibujan donde corresponde (cuerpo, reloj, barras, fracción, recta, agrupar).
4. El Jefe Final arranca con sus 4 fases.
5. Consola sin errores.

Y confirma la no-regresión de 8°: `http://localhost:8765/juego/` carga, muestra sus 4
asignaturas y el quiz sigue **con reloj**.

- [ ] **Step 6: Actualizar la bitácora y commitear**

Agrega la sesión a `CLAUDE.md`: qué se construyó, los dos defectos corregidos (tablero roto y OA
mal etiquetado), y que el banco nace `revisada:false` esperando la aprobación de Roberto.

```bash
cd /c/Proyectos/kimun
git add CLAUDE.md dev/tablero.html
git commit -m "3ro Plan 2: Matematica 3 de ano completo (26 OA, ~780 preguntas) + bitacora"
```

---

## Fuera de este plan

- **Revisión pedagógica humana** del banco (Roberto, por el tablero). El plan la deja lista, no la hace.
- **Arte propio** de los 7 capítulos y del villano "El Número Perdido" (hoy todos caen a
  `assets/portada-matematicas.png`). Es trabajo de Roberto generando imágenes.
- **Plan 3:** capa de nivel en el backend (`cursos.nivel`, `MA03` en `kimun_oa_asignatura`, panel
  consciente del nivel, `ALU-` que resuelve el mundo de 3°) y el `localStorage` compartido entre
  `/3ro` y `/juego`.
- **Las otras 3 asignaturas de 3°** (Lenguaje, Ciencias, Historia): se construyen recién con el
  molde de Matemática probado jugando, como manda el spec §7.
