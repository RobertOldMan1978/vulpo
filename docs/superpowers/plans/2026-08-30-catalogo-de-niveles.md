# M4 · Catálogo de niveles — plan de implementación

> **Diseño:** `docs/superpowers/specs/2026-08-30-catalogo-de-niveles-design.md`

**Meta:** que dar de alta un curso pase de ~24 puntos de edición a 2.

**Método:** un paso por vez, y **cada uno se verifica corriendo la página** con
`node scripts/cdp.mjs about:blank <pasos.mjs>` antes de seguir. Los 404 no llegan a la consola de
forma fiable: hay que mirar la red.

**Regla que no se salta:** al mover código a un `<script src>`, **probar qué pasa si NO carga**.

---

## Tarea 0 · La foto del comportamiento de HOY

Sin esto, las tareas 2 y 3 se comparan contra la memoria en vez de contra un hecho.

- [ ] **Paso 1: capturar lo que el panel produce hoy**

Con `cdp.mjs`, cargar `profesor.html` y volcar a un archivo del scratchpad:

```js
JSON.stringify({
  orden:   ASIG_ORDEN,
  nombres: Object.fromEntries(ASIG_ORDEN.map(c => [c, ASIG_NOMBRE[c]])),
  carpetas: Object.fromEntries(ASIG_ORDEN.map(c => [c, OA_CARPETA[c]])),
  niveles: NIVELES_MUESTRA,
  asigDe:  Object.fromEntries(
    ['HI08 OA 04','MA03 OA 01','CN07 OA 02','LE07 OA 12','VOC-HIST','VOC-LECT',
     'AF-T1','CA-T1','XX99 OA 01','basura'].map(o => [o, SB_asigDe(o)]))
})
```

- [ ] **Paso 2: capturar los tres juegos**

Para cada uno de `juego/`, `7mo/`, `3ro/`, volcar
`JSON.stringify(ASIG_DESAFIO_NOMBRE)` y el resultado de `asigDesafioNombre` sobre cada una de sus
claves más un código inventado.

**Expectativa:** el panel devuelve 12 códigos y `SB_asigDe('CA-T1')` devuelve `null`.
Guardar ambos volcados; son el patrón de comparación de todo lo que sigue.

---

## Tarea 1 · `assets/js/niveles.js`, sin usarlo todavía

- [ ] **Paso 1: crear el archivo**

`assets/js/niveles.js`:

```js
/* Catálogo de niveles y asignaturas de VULPO.
   Guarda SOLO lo que no se puede derivar. Todo lo demás se calcula del código:
   `HI08` es HI (Historia) + 08 (el nivel). Ver
   docs/superpowers/specs/2026-08-30-catalogo-de-niveles-design.md
   Agregar un curso = una fila en NIVELES. */
(function (raiz) {
  var ASIGS = {
    HI: {nombre: 'Historia',   carpeta: 'historia',    orden: 1},
    MA: {nombre: 'Matemática', carpeta: 'matematicas', orden: 2},
    CN: {nombre: 'Ciencias',   carpeta: 'ciencias',    orden: 3},
    LE: {nombre: 'Lenguaje',   carpeta: 'lenguaje',    orden: 4}
  };

  // Descendente a propósito: el curso mayor primero, como se ve hoy en el panel.
  var NIVELES = [
    {n: 8, etiqueta: '8° básico', ruta: '/juego/'},
    {n: 7, etiqueta: '7° básico', ruta: '/7mo/'},
    {n: 3, etiqueta: '3° básico', ruta: '/3ro/'}
  ];

  // Tabla CERRADA. Los módulos transversales no llevan el nivel en su código
  // (VOC, AF, CA contra HI08, MA03), así que no se derivan. NO crece al agregar
  // un curso. Los códigos CA- del libro no van aquí a propósito: desde la Sesión
  // 72 registrarOA solo manda al servidor lo que tiene forma de currículum.
  var TRANSVERSALES = {
    'VOC-HIST': 'HI08', 'VOC-CIEN': 'CN08', 'VOC-MATE': 'MA08',
    'VOC-LENG': 'LE08', 'VOC-LECT': 'LE08'
  };
  var PREFIJOS_TRANSVERSALES = [{pre: 'AF-', asig: 'LE08'}];

  var FORMA_CURRICULO = /^[A-Z]{2}[0-9]{2} OA [0-9]{2}$/;

  function dosDigitos(n) { return (n < 10 ? '0' : '') + n; }

  function codigos() {
    var out = [];
    var pre = Object.keys(ASIGS).sort(function (a, b) {
      return ASIGS[a].orden - ASIGS[b].orden;
    });
    NIVELES.forEach(function (niv) {
      pre.forEach(function (p) { out.push(p + dosDigitos(niv.n)); });
    });
    return out;
  }

  function nivelDe(cod) {
    var n = parseInt(String(cod).slice(2, 4), 10);
    for (var i = 0; i < NIVELES.length; i++) if (NIVELES[i].n === n) return NIVELES[i];
    return null;
  }

  function existe(cod) {
    return !!(ASIGS[String(cod).slice(0, 2)] && nivelDe(cod));
  }

  // El espejo de kimun_oa_asignatura. Devuelve el código de asignatura o null.
  function asigDe(oa) {
    var s = String(oa || '');
    if (FORMA_CURRICULO.test(s)) {
      var cod = s.slice(0, 4);
      return existe(cod) ? cod : null;
    }
    if (TRANSVERSALES[s]) return TRANSVERSALES[s];
    for (var i = 0; i < PREFIJOS_TRANSVERSALES.length; i++) {
      if (s.indexOf(PREFIJOS_TRANSVERSALES[i].pre) === 0) return PREFIJOS_TRANSVERSALES[i].asig;
    }
    return null;
  }

  function nombre(cod) {
    var a = ASIGS[String(cod).slice(0, 2)], niv = nivelDe(cod);
    if (!a || !niv) return String(cod);
    return a.nombre + ' ' + niv.n + '°';
  }

  function carpeta(cod) {
    var a = ASIGS[String(cod).slice(0, 2)], niv = nivelDe(cod);
    return (a && niv) ? a.carpeta + '-' + niv.n + 'basico' : null;
  }

  raiz.NIV = {
    ASIGS: ASIGS, NIVELES: NIVELES, TRANSVERSALES: TRANSVERSALES,
    codigos: codigos, asigDe: asigDe, nombre: nombre, carpeta: carpeta, existe: existe
  };
})(window);
```

> ⚠️ **Decisión visible que hay que confirmar con Roberto antes de seguir:** `nombre()` le pone el
> nivel a **todas** las asignaturas, así que 8° pasa de *"Historia"* a *"Historia 8°"*. Hoy solo
> 3° y 7° lo llevan. Con seis cursos conviene que sean todos iguales, pero **es un cambio que el
> profesor de 8° ve**. Si prefiere conservarlo, es una línea: no sufijar el primer nivel.

- [ ] **Paso 2: probarlo aislado, sin tocar el panel**

Correr en Node:

```
node -e "global.window={}; require('./assets/js/niveles.js'); const N=window.NIV;
console.log(N.codigos().join(' '));
['HI08 OA 04','MA03 OA 01','VOC-HIST','AF-T1','CA-T1','XX99 OA 01','basura']
  .forEach(o=>console.log(o,'->',N.asigDe(o)));
console.log(N.carpeta('HI08'), N.carpeta('CN07'), N.nombre('MA03'));"
```

**Esperado:** 12 códigos en el orden `HI08 MA08 CN08 LE08 HI07 MA07 CN07 LE07 HI03 MA03 CN03 LE03`;
`CA-T1`, `XX99 OA 01` y `basura` → `null`; `historia-8basico`, `ciencias-7basico`, `Matemática 3°`.

- [ ] **Paso 3: comparar contra la foto de la Tarea 0**

Los 12 códigos deben ser **los mismos** que `ASIG_ORDEN` (el orden dentro de 3° cambia: hoy es
`MA, HI, LE, CN`), y `carpeta()` debe coincidir con `OA_CARPETA` **en los 12**. Si alguno no
calza, parar y revisar antes de seguir.

- [ ] **Paso 4: commit**

```
git add assets/js/niveles.js
git commit -F <mensaje>
```

---

## Tarea 2 · El panel usa el catálogo

- [ ] **Paso 1: cargarlo con su respaldo vacío**

En `profesor.html`, junto al `<script src>` de supabase (línea ~13):

```html
<script src="assets/js/niveles.js"></script>
<script>if(!window.NIV)window.NIV={ASIGS:{},NIVELES:[],TRANSVERSALES:{},
  codigos:function(){return[];},asigDe:function(o){return null;},
  nombre:function(c){return String(c);},carpeta:function(){return null;},
  existe:function(){return false;}};</script>
```

- [ ] **Paso 2: reemplazar las cinco listas**

Borrar `OA_CARPETA`, `ASIG_NOMBRE`, `ASIG_ORDEN`, `NIVELES_MUESTRA` y la función `SB_asigDe`, y
dejar en su lugar:

```js
const OA_CARPETA      = Object.fromEntries(NIV.codigos().map(c => [c, NIV.carpeta(c)]));
const ASIG_NOMBRE     = Object.fromEntries(NIV.codigos().map(c => [c, NIV.nombre(c)]));
const ASIG_ORDEN      = NIV.codigos();
const NIVELES_MUESTRA = NIV.NIVELES.map(n => ({nombre: n.etiqueta, ruta: n.ruta}));
const SB_asigDe       = NIV.asigDe;
```

> Se conservan los nombres viejos como alias en vez de reescribir sus 19 usos. El objetivo del
> trabajo es **borrar las listas**, no renombrar consumidores; cambiar 19 sitios sumaría riesgo
> sin ganar nada.

- [ ] **Paso 3: verificar contra la foto**

Volver a correr el volcado de la Tarea 0 y comparar. **Debe calzar en todo**, salvo dos cosas
esperadas: el orden dentro de 3° y los nombres con sufijo de nivel.

- [ ] **Paso 4: probar que el panel sobrevive sin el archivo**

Renombrar `assets/js/niveles.js` a `niveles.js.off`, recargar y comprobar que el panel **abre
igual** (mostrando códigos en vez de nombres) y que la consola **no tiene errores** más allá del
404 del archivo. Devolver el nombre.

- [ ] **Paso 5: commit**

---

## Tarea 3 · Los tres juegos derivan el nombre

- [ ] **Paso 1: reemplazar `ASIG_DESAFIO_NOMBRE` en los tres**

**El mismo bloque, byte a byte, en `juego/index.html`, `7mo/index.html` y `3ro/index.html`** — que
es justo el objetivo. NO se agrega un `<script src>`: sería una dependencia dura en el arranque a
cambio de cuatro cadenas, y un 404 de un script ya mató el juego entero una vez.

```js
/* El nombre visible de una asignatura sale de su código: HI08 es HI (Historia) + 08.
   Antes era un mapa escrito a mano y divergía entre forks. Es el mismo criterio de
   assets/js/niveles.js, derivado aquí para no depender de un <script src> por 4 textos. */
const ASIG_PREFIJO_NOMBRE={HI:'Historia',MA:'Matemáticas',CN:'Ciencias',LE:'Lenguaje'};
function asigDesafioNombre(a){
  const n=ASIG_PREFIJO_NOMBRE[String(a).slice(0,2)];
  return n||a;
}
```

- [ ] **Paso 2: comprobar que quedó idéntico en los tres**

```
for f in juego 7mo 3ro; do
  sed -n '/ASIG_PREFIJO_NOMBRE/,/^}/p' $f/index.html | md5sum
done
```
Los tres hashes deben ser el mismo.

- [ ] **Paso 3: verificar jugando**

Los tres juegan una etapa real, **cero 404 y cero errores de consola**, y `asigDesafioNombre`
devuelve lo mismo que la foto de la Tarea 0 para los códigos de ese nivel.

> ⚠️ 3° escribe `'Matemática'` en singular en su `EXPEDICIONES`, y el mapa viejo de 3° también.
> Este bloque devuelve `'Matemáticas'` en plural para los tres. **Comprobar en 3° que el banner y
> el título del desafío de refuerzo siguen bien**, porque `contenidoDeAsignatura` busca por nombre.

- [ ] **Paso 4: commit**

---

## Tarea 4 · El servidor deja de enumerar

- [ ] **Paso 1: `kimun_oa_asignatura` estructural**

En `supabase/schema.sql`, reemplazar el `case` de ~12 ramas por:

```sql
create or replace function public.kimun_oa_asignatura(p_oa text)
returns text language sql immutable as $$
  select case
    -- El currículum lleva el nivel adentro del código, así que la asignatura son sus
    -- 4 primeros caracteres y no hace falta enumerarla. Al agregar un curso, esta
    -- función NO se toca.
    when p_oa ~ '^[A-Z]{2}[0-9]{2} OA [0-9]{2}$' then substring(p_oa from 1 for 4)
    -- Los transversales NO llevan el nivel, así que sí van a mano. Tabla CERRADA:
    -- no crece al agregar un curso. Hay filas históricas de 8° con estos códigos y
    -- quitarlas dejaría ese avance invisible en el panel, sin ningún error.
    when p_oa = 'VOC-HIST' then 'HI08'
    when p_oa = 'VOC-CIEN' then 'CN08'
    when p_oa = 'VOC-MATE' then 'MA08'
    when p_oa in ('VOC-LENG','VOC-LECT') or p_oa like 'AF-%' then 'LE08'
    else null
  end;
$$;
```

- [ ] **Paso 2: un solo arreglo de asignaturas**

```sql
-- El ÚNICO punto del servidor que hay que tocar al agregar un curso. Si falta un
-- código aquí, ese contenido queda INVISIBLE para el Profesor Jefe sin ningún error.
create or replace function public.kimun_asignaturas_todas()
returns text[] language sql immutable as $$
  select array['HI08','MA08','CN08','LE08',
               'HI07','MA07','CN07','LE07',
               'HI03','MA03','CN03','LE03'];
$$;
```

y en `kimun_prof_asignaturas` reemplazar **los dos arreglos literales** por
`public.kimun_asignaturas_todas()`. Agregar la función nueva al `grant execute`.

- [ ] **Paso 3: comprobar el SQL sin ejecutarlo**

Contar que no quedan arreglos literales de asignaturas:
```
grep -n "array\['HI08'" supabase/schema.sql
```
Debe salir **una sola vez**, dentro de `kimun_asignaturas_todas`.

- [ ] **Paso 4: Roberto re-aplica `schema.sql`**

El asistente **no ejecuta SQL contra producción**. Dejarle preparada una consulta de verificación
de una sola sentencia (el SQL Editor solo muestra el resultado de la última) que devuelva `ok`
para: los 12 códigos, los transversales, un código inventado → `null`, y que
`kimun_asignaturas_todas()` tenga 12 elementos.

- [ ] **Paso 5: verificar en vivo con la clave pública**

Con `curl` contra la función `kimun_oa_asignatura`, igual que en `docs/aplicar-schema.md`:
los 12 códigos devuelven su asignatura, `VOC-HIST` devuelve `HI08`, `AF-T1` devuelve `LE08`, y
`XX99 OA 01` devuelve `null`.

- [ ] **Paso 6: el aislamiento entre profesores**

**Esta prueba no se salta**, porque el cambio toca dos funciones de permisos: un profe de
asignatura debe seguir recibiendo `no_autorizado` al lanzar refuerzo o pedir el ranking de una
asignatura ajena, y datos al pedir la suya. Es de Roberto: necesita dos cuentas reales.

- [ ] **Paso 7: commit**

---

## Tarea 5 · Dejarlo escrito

- [ ] **Paso 1:** en `CLAUDE.md`, reemplazar la lista de puntos a tocar al dar de alta un curso
      por los 2 que quedan, y anotar que `SB_asigDe` ya no existe.
- [ ] **Paso 2:** en `pendiente.md`, marcar M4 como hecha y actualizar la frase de "~27 puntos de
      edición" que aparece en la sección de desduplicación.
- [ ] **Paso 3:** en `docs/aplicar-schema.md`, sumar la consulta de verificación de la Tarea 4.
- [ ] **Paso 4:** commit.

---

## Cómo se sabe que funcionó

Dar de alta un curso ficticio de 5° tocando **solo dos cosas** —una fila en `NIV.NIVELES` y los 4
códigos en `kimun_asignaturas_todas()`— y comprobar que el panel lo lista, lo nombra, le arma la
carpeta correcta y lo ofrece en el armador de enlaces. Después revertirlo.
