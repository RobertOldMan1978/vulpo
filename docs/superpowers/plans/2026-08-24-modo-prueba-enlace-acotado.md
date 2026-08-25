# Modo prueba `?solo=` — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: usa superpowers:subagent-driven-development (recomendado) o superpowers:executing-plans para ejecutar este plan tarea por tarea. Los pasos usan casillas (`- [ ]`) para seguimiento.

**Goal:** Que `https://vulpo.cl/?solo=hist-cap2,hist-cap3,hist-cap4` abra un VULPO recortado a esos tres capítulos, con todo desbloqueado dentro de ellos, respuestas SIN marcar y sin escribir nada en el teléfono ni en Supabase.

**Architecture:** Todo en `index.html`. La constante `QA`, que hoy mezcla tres comportamientos, se parte en tres banderas independientes (`MODO_ABIERTO`, `QA_MARCA`, `EFIMERO`) sin cambiar lo que hace `?qa=1`. Un arreglo `SOLO` con los ids validados del parámetro activa el modo prueba: `renderCampaña` filtra los capítulos, el arranque salta directo a esa lista, y toda la persistencia queda inerte.

**Tech Stack:** HTML/JS vanilla en un solo archivo (`index.html`), sin framework ni build. Estado en `localStorage` (`kimun_save`) y backend Supabase vía `SB.rpc`.

**Fuente de verdad del diseño:** `docs/superpowers/specs/2026-08-24-modo-prueba-enlace-acotado-design.md`.

## Global Constraints

- **NO se hace commit ni push** en ningún paso de este plan. Regla del proyecto (CLAUDE.md → "Regla de commits"): se espera la **orden 66** de Roberto, que además exige actualizar la bitácora antes de subir. Los pasos de "Commit" del formato estándar están deliberadamente ausentes.
- **No hay suite de tests automatizados.** La verificación es en el navegador con `preview_start` + lectura del DOM y de la consola, como en sesiones anteriores. Cada tarea trae sus chequeos concretos.
- **Sin el parámetro `?solo=`, el juego debe comportarse EXACTAMENTE como hoy.** Es la condición de aceptación transversal de todas las tareas.
- **`?qa=1` debe seguir desbloqueando Y marcando respuestas**, igual que antes de este cambio.
- **`localStorage.kimun_save` no se lee, ni se escribe, ni se borra en modo prueba.** Un alumno que ya venía jugando en ese teléfono debe encontrar intactas sus monedas, skins y campañas.
- Solo se toca `index.html` (y `CLAUDE.md` al final). **No** se tocan `profesor.html`, `supabase/schema.sql` ni el contenido JSON.
- Idioma de la interfaz y de los comentarios de código: **español**, como todo el archivo.

---

## Estructura de archivos

- **`index.html`** (modificar) — único archivo de código. Cuatro zonas:
  - ~1012–1015: definición de las banderas de modo (hoy `const QA`).
  - ~1212: cierre de `EXPEDICIONES`, donde se validan los ids de `?solo=`.
  - ~2021–3506: los ~15 usos de `QA` que hay que repartir entre las tres banderas nuevas.
  - ~2484 (arranque), ~2581 (`entrarExpedicion`), ~2590 (`btnJugador`), ~2664 (`renderCampaña`), ~2210 (`guardar`): el comportamiento del modo prueba.
- **`CLAUDE.md`** (modificar, Task 4) — documentar el parámetro nuevo junto a `?qa=1` y `?intro=1`, y dejar la entrada de bitácora lista para la orden 66.

**Orden:** Task 1 (banderas, sin cambio visible) → Task 2 (la lista recortada) → Task 3 (cortar persistencia + aviso) → Task 4 (verificación integral + docs). Cada tarea deja el archivo en un estado jugable.

---

### Task 1: Separar `QA` en tres banderas y leer `?solo=`

Tarea de refactor puro: **al terminar, el juego se ve y se comporta igual que antes**. Es la base de todo lo demás y la de mayor riesgo, porque toca 15 puntos repartidos por el archivo.

**Files:**
- Modify: `index.html:1012-1015` (definición de banderas), `index.html:1212` (validación de ids), y los usos de `QA` listados abajo.

**Interfaces:**
- Produces (lo que usan las tareas siguientes):
  - `QA` — `boolean`. `true` con `?qa=1`. Se conserva el nombre.
  - `SOLO` — `string[]`. Ids de `EXPEDICIONES` pedidos por `?solo=` **que existen de verdad**. Vacío si no se pidió el parámetro o si ninguno era válido.
  - `PRUEBA` — `boolean`. `SOLO.length > 0`. Es "estamos en modo prueba".
  - `MODO_ABIERTO` — `boolean`. `QA || PRUEBA`. Ignora los candados de progresión.
  - `QA_MARCA` — `boolean`. Igual a `QA`. Pinta la respuesta correcta.
  - `EFIMERO` — `boolean`. `QA || PRUEBA`. No escribe en disco ni habla con Supabase.

- [ ] **Step 1: Reemplazar el bloque de la constante `QA`**

En `index.html`, sustituir las líneas 1012–1015 (el comentario `/* ===== Modo QA (oculto) ... */` y `const QA=...`) por:

```js
/* ===== Modos ocultos por URL =====
   ?qa=1        -> revisión de contenido: desbloquea todo Y marca la respuesta correcta.
   ?solo=a,b,c  -> modo prueba: muestra SOLO esos capítulos (ids de EXPEDICIONES),
                  todos abiertos, SIN marcar respuestas y sin guardar nada.
   Las tres banderas de más abajo (MODO_ABIERTO / QA_MARCA / EFIMERO) eran un solo
   booleano y se separaron a propósito: "desbloquear", "marcar la respuesta" y "no
   persistir" son tres cosas distintas, y el modo prueba necesita la primera y la
   tercera sin la segunda. Sin ningún parámetro, el juego se comporta como siempre. */
const _PARAMS=new URLSearchParams(location.search);
const QA=_PARAMS.has('qa');
const QA_MARCA=QA;                     // solo QA pinta la respuesta correcta
const _SOLO_PEDIDO=(_PARAMS.get('solo')||'').split(',').map(s=>s.trim()).filter(Boolean);
```

- [ ] **Step 2: Validar los ids después de `EXPEDICIONES`**

Inmediatamente después del `];` que cierra el arreglo `EXPEDICIONES` (línea ~1212), y antes del comentario `/* ===== CAMPAÑAS ...`, agregar:

```js
/* Ids de ?solo= que existen de verdad. Uno inventado se ignora en silencio; si no
   queda ninguno válido, PRUEBA es falso y se cae al juego normal (mejor eso que
   dejar al alumno en una pantalla vacía). */
const SOLO=_SOLO_PEDIDO.filter(id=>EXPEDICIONES.some(e=>e.id===id));
const PRUEBA=SOLO.length>0;
const MODO_ABIERTO=QA||PRUEBA;   // ignora los candados de progresión
const EFIMERO=QA||PRUEBA;        // no escribe en disco ni sincroniza con Supabase
```

- [ ] **Step 3: Repartir los usos de desbloqueo → `MODO_ABIERTO`**

Cambiar `QA` por `MODO_ABIERTO` en estos siete puntos (los números de línea son los del archivo antes de tocarlo; búscalos por su texto):

| Función | Cambio |
|---|---|
| `nivelCalcDesbloqueado` (~2021) | `if(QA)return true;` pasa a `if(MODO_ABIERTO)return true;` |
| `jefeCalcDesbloqueado` (~2027) | `return QA||calcEstado()...` pasa a `return MODO_ABIERTO||calcEstado()...` |
| `nodoCampDesbloqueado` (~2193) | `if(QA)return true;` pasa a `if(MODO_ABIERTO)return true;` |
| `desafioDesbloqueado` (~2200) | `return QA||camp.capitulos...` pasa a `return MODO_ABIERTO||camp.capitulos...` |
| `jefeFinalDesbloqueado` (~2201) | `return QA||(desafioDesbloqueado...` pasa a `return MODO_ABIERTO||(desafioDesbloqueado...` |
| mapa de Matemáticas (~2708) | `const expAb=QA||capMateCompleto(cap)` pasa a `const expAb=MODO_ABIERTO||capMateCompleto(cap)` |
| `jefeFinalMateDesbloqueado` (~2727) | `return QA || (c.capitulos.length>0...` pasa a `return MODO_ABIERTO || (c.capitulos.length>0...` |

- [ ] **Step 4: Repartir los usos de marcado → `QA_MARCA`**

Cambiar `QA` por `QA_MARCA` en los cuatro puntos que aplican la clase `.qa-ok`:

- ~2079 (Reto de Cálculo): `if(QA&&i===o.ok)b.classList.add('qa-ok');` pasa a `if(QA_MARCA&&i===o.ok)b.classList.add('qa-ok');`
- ~2799 (quiz normal): `if(QA&&it.i===p.ok)b.classList.add('qa-ok');` pasa a `if(QA_MARCA&&it.i===p.ok)b.classList.add('qa-ok');`
- ~3071 (jefe final): `if(QA&&it.i===P.correcta)b.classList.add('qa-ok');` pasa a `if(QA_MARCA&&it.i===P.correcta)b.classList.add('qa-ok');`
- ~3292 (duelo online): `if(QA&&it.i===P.ok)b.classList.add('qa-ok');` pasa a `if(QA_MARCA&&it.i===P.ok)b.classList.add('qa-ok');`

- [ ] **Step 5: Repartir los usos de no-persistencia → `EFIMERO`**

En `registrarOA` (~2302):

```js
 if(EFIMERO) return;   // QA marca las respuestas y el modo prueba no guarda: no se mide nada
```

En el cierre del refuerzo (~3506):

```js
  if(!EFIMERO && SB && MI_PERFIL){
```

- [ ] **Step 6: Dejar el aviso de QA apoyado en la bandera correcta**

En ~3525:

```js
/* Aviso visible del modo QA (solo con ?qa=1). El del modo prueba se agrega aparte. */
if(QA){const b=document.createElement('div');b.className='qa-badge';b.textContent='🧪 QA · respuestas marcadas · todo desbloqueado';document.body.appendChild(b);}
```

- [ ] **Step 7: Confirmar que no quedó ningún `QA` suelto mal repartido**

```bash
grep -n "\bQA\b" index.html
```

Esperado: solo las apariciones de `const QA=`, `const QA_MARCA=QA`, `MODO_ABIERTO=QA||PRUEBA`, `EFIMERO=QA||PRUEBA`, el `if(QA){` del aviso y los comentarios. **Ningún otro uso de `QA` a secas.** Si aparece alguno, es un punto que quedó sin repartir.

- [ ] **Step 8: Verificar en el navegador que NADA cambió**

Levantar el sitio con `preview_start` (config de `.claude/launch.json`; si no existe, crearla con `python -m http.server 8765` y puerto 8765) y comprobar:

1. `http://localhost:8765/` → juego normal. En Historia, el capítulo 1 abierto y los capítulos 2 a 5 con "🔒 Bloqueado".
2. `http://localhost:8765/?qa=1` → capítulos 2 a 5 abiertos, badge verde de QA visible y, al entrar a una pregunta, la respuesta correcta con borde verde y ✓.
3. Consola sin errores en ambos casos (`read_console_messages`).

**No continuar a la Task 2 si alguno de estos tres falla.**

---

### Task 2: La lista recortada a los capítulos de `?solo=`

Al terminar, `?solo=hist-cap2,hist-cap3,hist-cap4` ya muestra los tres capítulos abiertos. Todavía guarda en `localStorage` (eso es la Task 3).

**Files:**
- Modify: `index.html` — `renderCampaña` (~2664), `entrarExpedicion` (~2581), y el arranque (~2484).

**Interfaces:**
- Consumes: `SOLO`, `PRUEBA`, `MODO_ABIERTO` (Task 1).
- Produces: `arrancarModoPrueba()` — `void`, sin parámetros. Abre la pantalla de capítulos filtrada. La llama el arranque.

- [ ] **Step 1: Filtrar los capítulos en `renderCampaña`**

En `renderCampaña` (~2664), reemplazar:

```js
 // capítulos en orden
 c.capitulos.forEach((id,i)=>{
  const exp=EXPEDICIONES.find(e=>e.id===id);
  const abierto=nodoCampDesbloqueado(c,i), hecho=expedicionCompleta(id);
```

por:

```js
 // capítulos en orden. En modo prueba se muestran solo los pedidos por ?solo=,
 // conservando su número original (el capítulo 2 se sigue llamando 2, no 1).
 c.capitulos.forEach((id,i)=>{
  if(PRUEBA && !SOLO.includes(id)) return;
  const exp=EXPEDICIONES.find(e=>e.id===id);
  const abierto=nodoCampDesbloqueado(c,i), hecho=expedicionCompleta(id);
```

- [ ] **Step 2: Ocultar el Desafío Extra y el Jefe Final en modo prueba**

Más abajo en la misma función, ambos exigen la campaña completa, así que no tienen sentido con tres capítulos sueltos.

Para el Desafío Extra, cambiar la condición:

```js
 // desafío extra (solo si la campaña lo define). En modo prueba no se muestra:
 // exige haber completado todos los capítulos, que aquí no están.
 if(c.desafioExtra && !PRUEBA){
```

Para el Jefe Final, reemplazar las tres líneas que lo agregan por:

```js
 // jefe final (luce al villano de la campaña). Fuera del modo prueba por lo mismo.
 if(!PRUEBA){
  const jfAb=jefeFinalDesbloqueado(c), jfHecho=campañaCompleta(c);
  cont.appendChild(nodoCampañaEl('👑','JEFE FINAL DE '+c.asignatura.toUpperCase(), jfAb, jfHecho,
    jfAb?()=>iniciarJefeFinal(c):null, jfHecho?'¡Vencido!':(jfAb?'¡Al 100%! Enfréntalo':'🔒 Completa todo'),
    c.jefeFinal.villanoImg||''));
 }
```

- [ ] **Step 3: Entrar al capítulo sin pedir nombre**

`entrarExpedicion` (~2581) manda a `scr-inicio` (nombre y avatar) cuando no hay partida guardada. En modo prueba el invitado ya tiene nombre, así que debe ir directo al mapa. Reemplazar la función completa por:

```js
function entrarExpedicion(exp){
 if(!exp.activa){alert('🚀 La expedición de '+exp.asignatura+' viene pronto. ¡Sigue explorando Historia!');return;}
 // En modo prueba el invitado ya tiene nombre y avatar: nunca pasa por scr-inicio.
 const tienePartida=PRUEBA?true:hayPartida();
 if(tienePartida && !PRUEBA) cargar();
 activarExpedicion(exp).then(()=>{
  if(tienePartida){refreshHud();renderMapa();renderRanking();
   $('nav').style.display=PRUEBA?'none':'flex';go('scr-mapa');datoKimun();}
  else go('scr-inicio');
 });
}
```

- [ ] **Step 4: Arrancar directo en la lista de capítulos**

Agregar esta función justo antes de `$('btnJugador').onclick=...` (~2590):

```js
/* Modo prueba (?solo=): entra como invitado y abre directamente la lista de capítulos
   permitidos, saltándose "¿Cómo quieres entrar?" y la pantalla de nombre/avatar. */
function arrancarModoPrueba(){
 S.nombre='Invitado'; S.avatar=AVATARES[4];   // 🦊, la mascota
 const exp=EXPEDICIONES.find(e=>e.id===SOLO[0]);
 const camp=exp&&exp.campaña?campañaPorId(exp.campaña):null;
 $('nav').style.display='none';
 if(camp){abrirCampaña(camp);return;}
 entrarExpedicion(exp);      // capítulo suelto (sin campaña): directo a su mapa
}
```

- [ ] **Step 5: Llamarla desde el arranque**

En el bloque de arranque (~2484), reemplazar:

```js
 cargar();
 pintarInicio();
```

por:

```js
 if(!PRUEBA) cargar();       // el modo prueba nunca lee la partida guardada del teléfono
 pintarInicio();
 if(PRUEBA) setTimeout(arrancarModoPrueba,0);   // tras montar la UI
```

- [ ] **Step 6: Verificar en el navegador**

Con `preview_start`, abrir `http://localhost:8765/?solo=hist-cap2,hist-cap3,hist-cap4` y comprobar con `read_page`:

1. Se cae directo en la lista de capítulos (no aparece "¿Cómo quieres entrar?").
2. Hay **exactamente tres** tarjetas, numeradas **2, 3 y 4**, con los títulos "Los europeos llegan a América", "El mundo colonial" y "Chile colonial y las nuevas ideas".
3. Las tres dicen "¡Jugar!" — ninguna "🔒 Bloqueado".
4. **No** aparecen "Desafío Extra" ni "JEFE FINAL DE HISTORIA".
5. No se ve la barra inferior (Mapa / Tienda / Logros).
6. Al entrar al capítulo 3, sus 5 nodos están abiertos (incluido el jefe del capítulo) y **las preguntas NO traen respuesta marcada**.
7. `?solo=inventado-99` → cae al juego normal, con la pantalla "¿Cómo quieres entrar?".
8. Sin parámetro → juego normal intacto. Consola sin errores.

---

### Task 3: Cortar la persistencia y el backend, y avisar en pantalla

Al terminar, el modo prueba no deja rastro en el teléfono ni habla con Supabase.

**Files:**
- Modify: `index.html` — `guardar` (~2210), el `setTimeout` de perfil en el arranque (~2488), la intro (~3532) y el aviso (~3525).

**Interfaces:**
- Consumes: `EFIMERO`, `PRUEBA` (Task 1).

- [ ] **Step 1: `guardar()` no escribe en disco**

En `guardar()` (~2210), anteponer al `try` existente:

```js
function guardar(){
 if(EFIMERO){ if(EXP_ACT) S.rutas[EXP_ACT.id]={progreso:S.progreso,progresoDificil:S.progresoDificil,dificilDesbloqueado:S.dificilDesbloqueado}; return; }
 try{
```

Nota: se conserva el volcado a `S.rutas` **en memoria** (si no, al volver del mapa a la lista se pierde el avance del capítulo dentro de la misma sesión), pero no se toca `localStorage` ni se llama a `sincronizarXP()`.

- [ ] **Step 2: No crear perfil en Supabase**

En el arranque (~2488), condicionar el `setTimeout` que llama a `conectarKimun()`:

```js
 // Perfil en el servidor desde el inicio. En modo prueba no se toca Supabase:
 // el invitado no existe para el backend.
 if(!EFIMERO) setTimeout(async ()=>{
```

(el cierre sigue siendo `}, 1200);`)

- [ ] **Step 3: Saltar la intro en modo prueba**

La intro escribe `kimun_intro` en `localStorage` y alarga la entrada. En el bloque de la intro (~3532), justo después de `const ov=$('introOverlay'); if(!ov) return;`, agregar:

```js
 if(PRUEBA){ ov.remove(); return; }   // modo prueba: entrada directa, y no se escribe kimun_intro
```

- [ ] **Step 4: Aviso en pantalla**

Junto al aviso de QA (~3525), agregar:

```js
/* Aviso del modo prueba (?solo=): deja claro que el avance no se guarda. */
if(PRUEBA){const b=document.createElement('div');b.className='qa-badge';b.style.background='var(--cyan)';b.style.color='#04231a';
 b.textContent='🧪 Modo prueba · no se guarda tu avance';document.body.appendChild(b);}
```

- [ ] **Step 5: Verificar que el guardado ajeno queda intacto**

En el navegador, con `javascript_tool`:

1. Sembrar una partida falsa antes de entrar:
   `localStorage.setItem('kimun_save', JSON.stringify({nombre:'Prueba Previa', xp:999, monedas:777}))`
2. Abrir `?solo=hist-cap2,hist-cap3,hist-cap4`, jugar una etapa completa del capítulo 2 y volver a la lista.
3. Comprobar que `JSON.parse(localStorage.getItem('kimun_save'))` sigue siendo `{nombre:'Prueba Previa', xp:999, monedas:777}` — **sin tocar**.
4. Comprobar que no aparecieron `kimun_intro` ni `kimun_dom_pend` nuevos.
5. Con `read_network_requests`, confirmar que **no hay llamadas a Supabase** durante toda la sesión de prueba.
6. Recargar `?solo=...`: el avance del capítulo 2 volvió a cero (es lo esperado).
7. Abrir el juego sin parámetro: la partida "Prueba Previa" sigue ahí.

---

### Task 4: Verificación integral y documentación

**Files:**
- Modify: `CLAUDE.md` — sección "Parámetros de URL (ocultos)" (~226) y Bitácora (al final).

- [ ] **Step 1: Regresión completa de los modos**

En el navegador, uno por uno, con la consola limpia en todos:

| URL | Esperado |
|---|---|
| `/` | Juego normal. Capítulo 1 de Historia abierto, 2–5 bloqueados. Barra inferior visible. Guarda al jugar. |
| `/?qa=1` | Todo desbloqueado **y respuestas marcadas**. Badge verde de QA. |
| `/?solo=hist-cap2,hist-cap3,hist-cap4` | Tres capítulos (2, 3, 4), abiertos, **sin marcar**, sin barra inferior, badge celeste de prueba, sin escribir nada. |
| `/?solo=hist-cap2&qa=1` | Solo el capítulo 2, **con** respuestas marcadas (combinación válida para revisar contenido). |
| `/?solo=noexiste` | Juego normal, sin errores. |

- [ ] **Step 2: Documentar el parámetro en `CLAUDE.md`**

En la sección "Parámetros de URL (ocultos)", después del bloque de `?intro=1`, agregar:

```markdown
- **`?solo=id1,id2,…` — Modo prueba (enlace acotado):** muestra **solo** esos
  capítulos (ids de `EXPEDICIONES`), **todos abiertos** y con **dificultad normal**
  (a diferencia de `?qa=1`, NO marca las respuestas). No guarda nada: ni
  `localStorage` ni Supabase, y **no toca la partida** que ya exista en ese
  teléfono. Entra como "Invitado", sin pedir código `ALU-`. Oculta Tienda, Logros,
  Duelo, canje, Desafío Extra y Jefe Final. Pensado para pasarle a un grupo de
  alumnos un enlace de práctica acotado a las unidades que están viendo. Ejemplo:
  `https://vulpo.cl/?solo=hist-cap2,hist-cap3,hist-cap4`.
  Se puede combinar con `?qa=1` para revisar contenido acotado.
  Ids inválidos se ignoran; si no queda ninguno, cae al juego normal.
  **No es un candado:** al ser un sitio estático, quien borre el parámetro llega al
  juego completo. Es acotamiento, no seguridad.
```

- [ ] **Step 3: Dejar la entrada de bitácora redactada**

Agregar al final de la Bitácora de `CLAUDE.md` una entrada de sesión con: el enlace nuevo, la separación de `QA` en tres banderas, los modos verificados y el límite conocido (no es un candado). **No se hace commit**: queda escrita para cuando Roberto dé la orden 66.

- [ ] **Step 4: Informar a Roberto**

Entregar el enlace listo para copiar, decir qué se verificó y con qué evidencia, y recordar que el commit espera la orden 66.

---

## Notas de revisión del plan

- **Cobertura del spec:** las siete decisiones de la tabla del spec están cubiertas — alcance (Task 2, pasos 1–2), desbloqueo (Task 1, paso 3), respuestas sin marcar (Task 1, paso 4), persistencia (Task 3, pasos 1–3), identidad de invitado (Task 2, paso 4), aviso (Task 3, paso 4) y sintaxis del parámetro (Task 1, pasos 1–2). Los cinco chequeos de "Verificación" del spec están repartidos en Task 2 paso 6, Task 3 paso 5 y Task 4 paso 1.
- **Decisión tomada al planificar, no presente en el spec:** saltarse la intro en modo prueba (Task 3, paso 3). Motivo: la intro escribe `kimun_intro` en `localStorage`, lo que contradice "no guardar nada". Conviene confirmarlo con Roberto.
- **Numeración de los capítulos:** se conserva el número original (2, 3, 4), no el del arreglo filtrado. Es lo que Roberto vio en su captura.
