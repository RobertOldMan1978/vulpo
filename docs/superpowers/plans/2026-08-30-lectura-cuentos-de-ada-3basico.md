# Lectura *Cuentos de Ada* en 3° básico — plan de implementación

**Spec:** [`../specs/2026-08-30-lectura-cuentos-de-ada-3basico-design.md`](../specs/2026-08-30-lectura-cuentos-de-ada-3basico-design.md)

**Objetivo:** que 3° básico tenga su módulo 📖 Lectura con *Cuentos de Ada* (10 tramos, ~100
preguntas), sin que el libro contamine el mapa de dominio del profesor y sin mover 7° ni 8°.

**Arquitectura:** el motor de biblioteca **ya existe entero** en los tres forks, solo apagado en
3°. El trabajo es (a) volver **estructural** la exclusión de los módulos transversales del mapa de
dominio, (b) escribir el contenido, (c) encender la bandera y cablear el catálogo. La voz va al
final, como paso aparte.

**Verificación:** este proyecto no usa framework de tests. Se verifica **corriendo la página** con
`scripts/cdp.mjs` y con los validadores de `scripts/`. Los 404 no llegan a la consola de forma
fiable: hay que mirarlos en la red.

> ⚠️ **No se hace commit en ningún paso.** Regla del proyecto: se commitea solo con la **orden
> 66** de Roberto. Los pasos de "commit" del formato estándar están omitidos a propósito.

---

## Estructura de archivos

| Archivo | Qué hace | Tarea |
|---|---|---|
| `juego/index.html` · `7mo/index.html` · `3ro/index.html` | una línea idéntica en `registrarOA` | 1 |
| `contenido/lectura-cuentos-de-ada/libro.json` | título, autor, editorial, los 10 tramos | 2 |
| `contenido/lectura-cuentos-de-ada/oa.json` | fuente curricular del módulo + `nota_fidelidad` | 2 |
| `contenido/lectura-cuentos-de-ada/_pool/ada-t01..t10.json` | las 10 tandas de preguntas | 3 |
| `contenido/lectura-cuentos-de-ada/preguntas.json` | banco consolidado y barajado | 3 |
| `3ro/index.html` | bandera, `LIBROS`, expedición de 10 etapas | 4 |
| `assets/voz/ada/` + su manifiesto | voz pregrabada | 6 |

---

## Task 1: La exclusión del mapa de dominio pasa a ser estructural

**Files:**
- Modify: `3ro/index.html` (en `registrarOA`)
- Modify: `7mo/index.html` (misma línea)
- Modify: `juego/index.html` (misma línea)

- [ ] **Step 1: Ver el estado actual y confirmar que la línea es idéntica en los tres**

```bash
grep -n "AF-|VOC-" juego/index.html 7mo/index.html 3ro/index.html
```

Esperado: **una** coincidencia por archivo, con el mismo texto.

- [ ] **Step 2: Reemplazar la lista escrita a mano por la comprobación de forma**

En los **tres** archivos, cambiar:

```js
 if(/^(AF-|VOC-)/.test(oa)) return;     // OA de apoyo (Vocabulario/Lectura): no van al mapa de dominio
```

por:

```js
 // Al mapa de dominio del profesor va SOLO el currículum, y se reconoce por la FORMA del
 // código: lleva el nivel adentro (`HI07 OA 04`). Los módulos transversales no (`VOC-HIST`,
 // `AF-T1`, `CA-T1`), y por eso no se miden: un porcentaje junto a "Cuentos de Ada" se leería
 // como cobertura de Lenguaje, y no lo es.
 // Antes esto era una lista escrita a mano (`/^(AF-|VOC-)/`) y había que ampliarla en los tres
 // forks cada vez que entraba un módulo nuevo — el patrón de lista paralela que este proyecto
 // ya pagó caro. Es además el MISMO criterio que usan validar-oa-json.py y generar-tablero.py,
 // y el mismo patrón con que el servidor descarta lo que no reconoce.
 if(!/^[A-Z]{2}[0-9]{2} OA [0-9]{2}$/.test(oa)) return;
```

- [ ] **Step 3: Confirmar que quedó idéntica en los tres (el objetivo es que no diverjan)**

```bash
for f in juego 7mo 3ro; do grep -c 'OA \[0-9\]{2}\$/\.test(oa)' $f/index.html; done
```

Esperado: `1` tres veces.

- [ ] **Step 4: Comprobar en el navegador que se mide lo que debe y no lo que no**

Archivo de pasos `verif-registrar.mjs`:

```js
export default async (ev) => {
  for (const app of ['juego','7mo','3ro']) {
    await ev.ir(`http://localhost:8765/${app}/`);
    await ev.espera(1500);
    const r = await ev(`(()=>{
      DOM_BUF={};
      ['HI08 OA 04','MA03 OA 01','CN07 OA 02','LE06 OA 12'].forEach(o=>registrarOA(o,true));
      const miden=Object.keys(DOM_BUF).length;
      DOM_BUF={};
      ['AF-T1','VOC-HIST','CA-T1','BOSS','','MA03 OA 1'].forEach(o=>registrarOA(o,true));
      const nomiden=Object.keys(DOM_BUF).length;
      DOM_BUF={};
      return app_ok = miden+'/'+nomiden;
    })()`);
    console.log(app, 'curriculares medidos / transversales medidos =', r);
  }
  console.log('404:', ev.fallos.length, 'consola:', ev.consola.filter(c=>c.type==='error').length);
};
```

Correr: `python -m http.server 8765` y en otra terminal
`node scripts/cdp.mjs about:blank verif-registrar.mjs`

Esperado, en las tres apps: **`4/0`** — los cuatro códigos de currículum se miden, y ninguno de
los transversales ni de los malformados. Y **cero 404, cero errores de consola**.

---

## Task 2: Los datos del libro

**Files:**
- Create: `contenido/lectura-cuentos-de-ada/libro.json`
- Create: `contenido/lectura-cuentos-de-ada/oa.json`

- [ ] **Step 1: Crear la carpeta**

```bash
mkdir -p contenido/lectura-cuentos-de-ada/_pool
```

- [ ] **Step 2: Escribir `libro.json`**

```json
{
 "titulo": "Cuentos de Ada",
 "autor": "Pepe Pelayo",
 "editorial": "Santillana Infantil",
 "tramos": [
  {"oa":"CA-T1","titulo":"Las vacaciones","periodo":"Ada acepta cuidar a Yoyito a cambio de una tabla de surf, y el día se le va de las manos"},
  {"oa":"CA-T2","titulo":"La mentira","periodo":"Ada cuenta una aventura enorme para no quedar mal, y la historia crece más de la cuenta"},
  {"oa":"CA-T3","titulo":"El sándwich","periodo":"Ada quiere comerse un sándwich gigante sin compartirlo con su hermano"},
  {"oa":"CA-T4","titulo":"Primer intento","periodo":"Ada trata de llamar la atención de Cary y de parecer más valiente de lo que se siente"},
  {"oa":"CA-T5","titulo":"Segundo intento","periodo":"Un nuevo acercamiento a Cary que no sale como Ada lo había planeado"},
  {"oa":"CA-T6","titulo":"Último intento","periodo":"El tercer intento con Cary, ahora con Orco de por medio"},
  {"oa":"CA-T7","titulo":"La renuncia","periodo":"Ada se cansa de Orco y piensa en dejar de enfrentarlo"},
  {"oa":"CA-T8","titulo":"El acto heroico","periodo":"Ada busca demostrar que es valiente, con su imaginación de por medio"},
  {"oa":"CA-T9","titulo":"La venganza","periodo":"Orco lo humilla y lo deja mojado delante de otros; Ada escapa"},
  {"oa":"CA-T10","titulo":"La batalla decisiva","periodo":"La guerra de agua contra Orco, y el plan de Yoyito que lo cambia todo"}
 ]
}
```

> ✅ **Confirmado por Roberto contra la tapa (30/08): Santillana Infantil.** La guía decía
> "Alfaguara Infantil (Chile, 2003)", que es del mismo grupo. Este campo se muestra al alumno,
> así que se preguntó en vez de elegir por probabilidad.

- [ ] **Step 3: Escribir `oa.json`**

```json
{
 "asignatura": "Lectura · Cuentos de Ada",
 "nivel": "3° básico · Comprensión lectora",
 "codigo_asignatura": "CA",
 "fuente": "Cuentos de Ada, Pepe Pelayo (ilustraciones de Alex Pelayo), Santillana Infantil",
 "url_fuente": "https://pepepelayo.com/libros/cuentos-de-ada",
 "nota_fidelidad": "Preguntas de comprensión originales; NO reproducen el texto del libro. Se escribieron desde dos documentos de estudio aportados por Roberto (un resumen extenso y una guía con banco de preguntas), no desde el ejemplar. La propia guía se declara compilación de resúmenes escolares en línea, advierte que no sustituye al libro original y avisa que las fuentes discrepan en nombres (Yoyito / Yayito / Yayo, Cary / Cari) y en detalles como cuántos personajes participan en la batalla final. Por eso el banco se limita a trama, personajes, motivaciones, causa-consecuencia y desenlace —que coinciden entre ambos documentos— y NO pregunta detalle fino: una pregunta de detalle inventado castiga justamente al niño que sí leyó el libro.",
 "nota_evaluacion": "Es comprensión lectora de un libro, no cobertura curricular: no entra al mapa de dominio del profesor y no se le presenta a un colegio como Lenguaje cubierto. Las preguntas miden si el niño siguió la historia y entendió por qué los personajes actúan como actúan, nunca su opinión ni su conducta.",
 "unidades": [
  {"id":"L1","titulo":"Cuentos de Ada","descripcion":"Comprensión lectora por cuento (lectura del colegio).",
   "oa":["CA-T1","CA-T2","CA-T3","CA-T4","CA-T5","CA-T6","CA-T7","CA-T8","CA-T9","CA-T10"]}
 ],
 "oa": [
  {"codigo":"CA-T1","eje":"El hermanito","texto":"Las vacaciones — Ada acepta cuidar a Yoyito a cambio de una tabla de surf, y lo que parecía fácil se le va de las manos."},
  {"codigo":"CA-T2","eje":"El hermanito","texto":"La mentira — Ada exagera una aventura para parecer valiente, y la distancia entre lo que cuenta y lo que pasó genera el conflicto."},
  {"codigo":"CA-T3","eje":"El hermanito","texto":"El sándwich — Ada quiere comerse un sándwich enorme sin compartirlo con su hermano, y la situación se vuelve absurda."},
  {"codigo":"CA-T4","eje":"El romance","texto":"Primer intento — Ada trata de llamar la atención de Cary mostrándose más valiente de lo que se siente."},
  {"codigo":"CA-T5","eje":"El romance","texto":"Segundo intento — Un nuevo acercamiento a Cary que no resulta como Ada lo había planeado."},
  {"codigo":"CA-T6","eje":"El romance","texto":"Último intento — El tercer intento con Cary, ahora complicado por la presencia de Orco."},
  {"codigo":"CA-T7","eje":"El enemigo","texto":"La renuncia — Ada se cansa de Orco y piensa en dejar de enfrentarlo; muestra que también tiene miedo y dudas."},
  {"codigo":"CA-T8","eje":"El enemigo","texto":"El acto heroico — Ada busca demostrar que es valiente, y su imaginación vuelve a intervenir."},
  {"codigo":"CA-T9","eje":"El enemigo","texto":"La venganza — Orco lo humilla y lo deja mojado delante de otros; Ada escapa y el conflicto queda abierto."},
  {"codigo":"CA-T10","eje":"El final","texto":"La batalla decisiva — La guerra de agua contra Orco, y el plan de Yoyito que demuestra que la inteligencia y la colaboración pueden más que la fuerza."}
 ]
}
```

- [ ] **Step 4: Validar**

```bash
python scripts/validar-oa-json.py lectura-cuentos-de-ada
```

Esperado: **0 errores**. Se admiten avisos: el validador trata los bancos de apoyo con menos
exigencia porque `codigo_asignatura` no calza con `^[A-Z]{2}[0-9]{2}$`, que es justamente lo que
lo marca como transversal.

---

## Task 3: El banco de preguntas

**Files:**
- Create: `contenido/lectura-cuentos-de-ada/_pool/ada-t01.json` … `ada-t10.json`
- Create: `contenido/lectura-cuentos-de-ada/preguntas.json` (lo genera el consolidador)

- [ ] **Step 1: Escribir las 10 tandas, una por cuento**

Formato de cada archivo (el mismo de cualquier tanda del proyecto):

```json
{"preguntas":[
 {"oa":"CA-T1",
  "pregunta":"¿Por qué Ada acepta cuidar a Yoyito?",
  "opciones":["Porque su mamá le ofrece a cambio una tabla de surf",
              "Porque quería quedarse en casa ese día",
              "Porque Yoyito le prometió ayudarlo con las tareas",
              "Porque sus amigos se habían ido de vacaciones"],
  "correcta":0,
  "tip":"Ada no acepta por gusto: acepta porque hay un premio de por medio."}
]}
```

Reglas, todas del estándar ya escrito en `docs/encargo-banco.md` (fila de 3° básico):

- **Enunciado corto** (≤ 90 caracteres es la meta) y vocabulario de 8-9 años.
- **La correcta va primera** en la tanda: el consolidador baraja.
- **Distractores con cuerpo desde el primer borrador.** El sesgo de largo aparece siempre en la
  primera pasada y corregirlo al final obliga a reescribir medio banco.
- **El `tip` no puede nombrar la posición de una opción** ("la primera dice…"), porque después de
  barajar contradice la pantalla.
- **Nada de detalle fino** que la fuente marca como inseguro (ver `nota_fidelidad`).
- **Meta de 10 por tramo; un cuento delgado entrega menos y no se rellena.** *La renuncia* y *El
  acto heroico* son breves: si dan 6 u 8 honestas, se entregan 6 u 8.

- [ ] **Step 2: Revisar las tandas antes de consolidar**

```bash
python scripts/revisar-tanda.py --largo=90 contenido/lectura-cuentos-de-ada/_pool/*.json
```

Esperado: 0 errores. Los avisos de casi-duplicado se revisan **uno por uno**: un par deliberado de
contraste es legítimo, un duplicado real no.

- [ ] **Step 3: Consolidar (deduplica, baraja las opciones y asigna ids)**

```bash
python scripts/consolidar-pool-nivel.py lectura-cuentos-de-ada
```

- [ ] **Step 4: Comprobar el reparto de la respuesta correcta y el conteo por tramo**

```bash
python -c "
import json,io,collections
d=json.load(io.open('contenido/lectura-cuentos-de-ada/preguntas.json',encoding='utf-8'))
p=d['preguntas'] if isinstance(d,dict) else d
print('total',len(p))
print('por tramo',dict(collections.Counter(x['oa'] for x in p)))
print('posicion de la correcta',dict(collections.Counter(x['correcta'] for x in p)))
print('sin revisar',sum(1 for x in p if not x.get('revisada')))"
```

Esperado: total ~100, **los 10 tramos presentes y ninguno bajo 6**, la correcta repartida entre
las 4 posiciones (ninguna bajo ~18% ni sobre ~32%), y **todas `revisada:false`**.

- [ ] **Step 5: Buscar solapamiento entre tramos**

```bash
python scripts/auditar-solape-oa.py contenido/lectura-cuentos-de-ada/preguntas.json
```

Esperado: sin pares reales. Dos cuentos del mismo arco (los tres intentos con Cary) pueden dar
avisos legítimos; se revisan a mano.

- [ ] **Step 6: Regenerar el tablero y confirmar que el libro aparece bajo transversales**

```bash
python scripts/generar-tablero.py
```

Esperado: termina sin error y *Cuentos de Ada* sale en el grupo **"Módulos transversales"**, no
entre las asignaturas de 3°.

---

## Task 4: Cablear el módulo en 3°

**Files:**
- Modify: `3ro/index.html` (bandera, `LIBROS`, `EXPEDICIONES`)

- [ ] **Step 1: Encender la bandera**

Cambiar `const HAY_BIBLIOTECA=false;` por:

```js
const HAY_BIBLIOTECA=true;
```

- [ ] **Step 2: Reemplazar el catálogo de libros**

⚠️ **Reemplazar, no agregar.** Hoy dice `lect-anafrank`, que es contenido de 8°: dejarlo le abriría
*El diario de Ana Frank* a un niño de 8 años.

```js
const LIBROS=[{id:'lect-cuentos-ada', titulo:'Cuentos de Ada', autor:'Pepe Pelayo', tramos:10}];
```

- [ ] **Step 3: Agregar la expedición al arreglo `EXPEDICIONES`**

Portada **explícita** (3° no usa la convención implícita `assets/portada-<id>.png`, que pediría
archivos inexistentes y daría 404 tapados por el `onerror`).

```js
 { id:'lect-cuentos-ada', asignatura:'Lectura', nivel:'Cuentos de Ada',
   portada:'assets/portada-lectura-cuentos-ada.png',
   portadaMapa:'assets/portada-lectura-cuentos-ada.png',
   contenido:'contenido/lectura-cuentos-de-ada/preguntas.json', activa:true,
   etapas:[
     {oa:"CA-T1",  nombre:"Las vacaciones",     icono:"🏖️", n:6},
     {oa:"CA-T2",  nombre:"La mentira",         icono:"🤥", n:6},
     {oa:"CA-T3",  nombre:"El sándwich",        icono:"🥪", n:6},
     {oa:"CA-T4",  nombre:"Primer intento",     icono:"💌", n:6},
     {oa:"CA-T5",  nombre:"Segundo intento",    icono:"💃", n:6},
     {oa:"CA-T6",  nombre:"Último intento",     icono:"🌹", n:6},
     {oa:"CA-T7",  nombre:"La renuncia",        icono:"😔", n:6},
     {oa:"CA-T8",  nombre:"El acto heroico",    icono:"🦸", n:6},
     {oa:"CA-T9",  nombre:"La venganza",        icono:"💦", n:6},
     {oa:"CA-T10", nombre:"La batalla decisiva",icono:"🌊", n:6}
   ] },
```

- [ ] **Step 4: Confirmar que no se rompió el JavaScript**

El fallo típico de este archivo es que un error de sintaxis mata **todo** el juego y el síntoma
engaña: la pantalla se ve bien y ningún botón responde.

```bash
node -e "const s=require('fs').readFileSync('3ro/index.html','utf8');
const m=s.match(/<script>([\s\S]*?)<\/script>/g)||[];
console.log('bloques de script:',m.length)"
```

Y la comprobación de verdad es la del navegador, en la Task 5.

- [ ] **Step 5: Confirmar que 3° conserva CRLF**

```bash
file 3ro/index.html
```

Esperado: `with CRLF line terminators`. Pasarlo a LF deja inservible la comparación entre forks.

---

## Task 5: Verificación en el navegador

**Files:** ninguno (solo se corre)

- [ ] **Step 1: Escribir el archivo de pasos**

`verif-ada.mjs`:

```js
export default async (ev) => {
  // --- 3°: la biblioteca abre y muestra el libro correcto
  await ev.ir('http://localhost:8765/3ro/'); await ev.espera(1800);
  console.log('HAY_BIBLIOTECA:', await ev('HAY_BIBLIOTECA'));
  console.log('libros:', await ev('JSON.stringify(LIBROS.map(l=>l.titulo))'));
  console.log('¿asoma Ana Frank?:', await ev("LIBROS.some(l=>/Ana Frank/.test(l.titulo))"));
  await ev('abrirBiblioteca()'); await ev.espera(600);
  console.log('pantalla activa:', await ev("document.querySelector('.screen.on').id"));
  console.log('tarjetas:', await ev("document.querySelectorAll('#biblioGrid .exp-card').length"));

  // --- un tramo sirve preguntas reales
  const exp = await ev("JSON.stringify((()=>{const e=EXPEDICIONES.find(x=>x.id==='lect-cuentos-ada');return{etapas:e.etapas.length,n:e.etapas[0].n};})())");
  console.log('expedicion:', exp);
  await ev("entrarExpedicion(EXPEDICIONES.find(e=>e.id==='lect-cuentos-ada'))");
  await ev.espera(1500);
  console.log('pool cargado:', await ev('POOL.length'));
  console.log('tramos con banco:', await ev("EXPEDICIONES.find(e=>e.id==='lect-cuentos-ada').etapas.filter(t=>POOL.some(p=>p.oa===t.oa)).length"));

  // --- 8° conserva SU biblioteca
  await ev.ir('http://localhost:8765/juego/'); await ev.espera(1800);
  console.log('8° libros:', await ev('JSON.stringify(LIBROS.map(l=>l.titulo))'));

  console.log('404:', JSON.stringify(ev.fallos));
  console.log('errores consola:', ev.consola.filter(c=>c.type==='error').length);
};
```

- [ ] **Step 2: Correr**

```bash
python -m http.server 8765 &
node scripts/cdp.mjs about:blank verif-ada.mjs
```

Esperado:
- `HAY_BIBLIOTECA: true`; `libros: ["Cuentos de Ada"]`; **`¿asoma Ana Frank?: false`**
- `pantalla activa: scr-biblioteca`, `tarjetas: 1`
- `expedicion: {"etapas":10,"n":6}`, `pool cargado` ≈ 100, **`tramos con banco: 10`**
- `8° libros: ["El diario de Ana Frank"]` — sin regresión
- **`404: []` y `errores consola: 0`**

- [ ] **Step 3: Jugar una etapa de verdad, con clics**

Abrir el tramo 1 desde la pantalla, responder las 6 preguntas y llegar al resultado. Comprobar de
paso que **el botón "← Volver" del mapa regresa a la biblioteca**, no a Expediciones.

- [ ] **Step 4: Comprobar que 7° y 3° no se movieron en lo demás**

Jugar una etapa de campaña en 7° y otra en 3°, y confirmar que el guardado de 8° sigue intacto:
sembrar `kimun_save` con un XP conocido antes, y releerlo después.

---

## Task 6: Voz pregrabada (paso aparte, al final)

**Files:**
- Create: `assets/voz/ada/` + su manifiesto
- Modify: `scripts/generar-voz-3ro.py` (registrar la asignatura `ada`)

> **No empezar esta tarea hasta que el banco esté aprobado.** Cada texto corregido después obliga
> a regenerar su clip y a **pagarlo de nuevo**, y deja huérfano el anterior. Pasó en la Sesión 61.

- [ ] **Step 1: Auditar que las preguntas se puedan responder ESCUCHANDO**

```bash
python scripts/auditar-audible-3ro.py contenido/lectura-cuentos-de-ada/preguntas.json
```

Esperado: 0 opciones homófonas entre sí. Quien usa el botón 🔊 es el que peor lee.

- [ ] **Step 2: Revisar qué va a PRONUNCIAR el sintetizador antes de gastar**

Pasar los textos por `scripts/normalizar-voz-3ro.py` y leer la salida. Es el paso que cazó el
"enero" de "de 10 en 10" y la resta que desaparecía.

- [ ] **Step 3: Generar, con autorización explícita de Roberto**

```bash
python scripts/generar-voz-3ro.py ada
```

~500 clips, del orden de **US$0,3**. La clave de Azure vive **fuera del repositorio**.

- [ ] **Step 4: Auditar por muestra**

```bash
python scripts/auditar-voz-3ro.py ada --muestra=120
```

`--muestra` no es opcional: el auditor gasta siempre, y una muestra de 120 caza un defecto
sistemático por una fracción del costo.

- [ ] **Step 5: Comprobar en el navegador que un tramo suena**

Que el enunciado y las 4 opciones resuelvan a un archivo que responde 200, en el orden que se ve
en pantalla — no en el orden del banco, que está barajado.

---

## Al terminar

- `pendiente.md`: marcar **A10 / A14** (Vocabulario en 3°) con lo que este trabajo deja resuelto —
  la biblioteca de 3° ya está encendida— y anotar el libro como hecho.
- `CLAUDE.md`: entrada de bitácora, y actualizar la tabla de banderas de nivel
  (`HAY_BIBLIOTECA` pasa a ✅ en 3°).
- `docs/modulos-transversales.md`: sumar *Cuentos de Ada* a la lista de módulos vivos y registrar
  que la exclusión del mapa de dominio ya es estructural.
- Arte: `assets/portada-lectura-cuentos-ada.png` (la genera Roberto; sin ella cae al respaldo y no
  rompe nada).
