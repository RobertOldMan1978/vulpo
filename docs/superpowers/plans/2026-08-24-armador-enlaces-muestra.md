# Armador de enlaces de muestra (`?armar=1`) — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: usa superpowers:subagent-driven-development (recomendado) o superpowers:executing-plans para ejecutar este plan tarea por tarea. Los pasos usan casillas (`- [ ]`) para seguimiento.

**Goal:** Que el Administrador pueda armar enlaces de muestra desde el panel, marcando capítulos en una pantalla, y que el modo prueba `?solo=` funcione correctamente con cualquier combinación de capítulos (hoy falla con Matemáticas, con asignaturas mezcladas y con capítulos sin campaña).

**Architecture:** Dos partes. Primero se le da al modo prueba **su propia lista** (`renderListaPrueba`), en vez de injertar filtros en la pantalla de campaña — con eso `renderCampaña` vuelve a ser exactamente lo que era antes de la Sesión 41 y desaparecen los tres agujeros. Segundo, una pantalla oculta `?armar=1` dentro de `index.html` construye el enlace desde `EXPEDICIONES`, y un botón en "Administración" de `profesor.html` la abre.

**Tech Stack:** HTML/JS vanilla en `index.html` y `profesor.html`, sin framework ni build. `navigator.clipboard` para copiar.

**Fuente de verdad del diseño:** `docs/superpowers/specs/2026-08-24-armador-enlaces-muestra-design.md`.

## Global Constraints

- **NO se hace commit ni push** en ningún paso. Regla del proyecto (CLAUDE.md → "Regla de commits"): se espera la **orden 66** de Roberto, que además exige actualizar la bitácora antes de subir.
- **No hay suite de tests automatizados.** La verificación es en el navegador con `preview_start` + lectura del DOM y de la consola. Cada tarea trae sus chequeos.
- **Sin regresión de la Sesión 41:** `https://vulpo.cl/?solo=hist-cap2,hist-cap3,hist-cap4` ya está repartido y debe seguir funcionando igual.
- **`?qa=1` no se toca** en ningún paso: sigue desbloqueando, marcando respuestas, guardando en disco y creando perfil.
- **Sin ningún parámetro, el juego se comporta EXACTAMENTE como hoy**, incluida la pantalla de campaña con sus 5 capítulos, el Desafío Extra y el Jefe Final.
- **El armador es solo para `YO.es_admin`** (el mismo candado que "🧹 Limpiar perfiles de prueba"), no para SuperUsuarios.
- Idioma de interfaz y comentarios: **español**.
- No se toca `supabase/schema.sql` ni el contenido JSON.

---

## Estructura de archivos

- **`index.html`** (modificar) — tres zonas:
  - Markup: nueva `<section class="screen" id="scr-armar">` después de `scr-campana` (~745).
  - Banderas (~1021 y ~1225): se agrega `ARMAR` y `SIN_DISCO`.
  - Lógica (~2664 `renderCampaña`, ~2619 `arrancarModoPrueba`, ~2688 `btnMapaCamp`): la lista propia del modo prueba y el armador.
- **`profesor.html`** (modificar) — bloque "Administración" (~436-450): un botón más.
- **`CLAUDE.md`** (modificar, Task 4) — documentar `?armar=1` y dejar la bitácora lista para la orden 66.

**Orden:** Task 1 (lista propia, corrige los tres agujeros) → Task 2 (armador) → Task 3 (botón del panel) → Task 4 (verificación integral + docs).

---

### Task 1: Lista propia del modo prueba

Corrige los tres agujeros y deja `renderCampaña` como estaba antes de la Sesión 41.

**Files:**
- Modify: `index.html` — `renderCampaña` (~2664), `arrancarModoPrueba` (~2619), `btnMapaCamp` (~2688).

**Interfaces:**
- Consumes: `SOLO` (`string[]`), `PRUEBA` (`boolean`), `campañaPorId(id)`, `nombreMapa(exp)`, `portadaMapa(exp)`, `portadaFallback(exp)`, `nodoCampañaEl(marca,titulo,abierto,hecho,onClick,estado,img,imgAlt)`, `expedicionCompleta(id)`, `entrarExpedicion(exp)`.
- Produces: `renderListaPrueba()` — `void`, sin parámetros. Dibuja la lista de `SOLO` en `scr-campana` y hace `go('scr-campana')`. La llaman `arrancarModoPrueba` y `btnMapaCamp`.

- [ ] **Step 1: Agregar `renderListaPrueba`**

Insertar justo **antes** de `function arrancarModoPrueba(){`:

```js
/* Lista propia del modo prueba: dibuja EXACTAMENTE los capítulos de ?solo=, vengan de la
   asignatura que vengan. No se reutiliza la pantalla de campaña porque esa es de UNA
   asignatura y, en Matemáticas, delega en renderCampañaMate (donde el filtro no llegaba:
   ?solo=mate-* abría la campaña entera). Reusa scr-campana para no agregar marcado. */
function renderListaPrueba(){
 if($('btnCampBack')) $('btnCampBack').style.display='none';   // no hay a dónde volver
 const exps=SOLO.map(id=>EXPEDICIONES.find(e=>e.id===id)).filter(Boolean);
 const asigs=[...new Set(exps.map(e=>e.asignatura))];
 $('campHead').innerHTML=`<h1 style="font-size:26px">Modo prueba</h1><p>${asigs.join(' · ')}</p>`;
 const cont=$('campNodos'); cont.innerHTML='';
 exps.forEach(exp=>{
  const camp=exp.campaña?campañaPorId(exp.campaña):null;
  const i=camp?camp.capitulos.indexOf(exp.id):-1;
  const hecho=expedicionCompleta(exp.id);
  cont.appendChild(nodoCampañaEl(i>=0?`${i+1}`:'📘', nombreMapa(exp), true, hecho,
    ()=>entrarExpedicion(exp), hecho?'Completado':'¡Jugar!',
    portadaMapa(exp), portadaFallback(exp)));
 });
 go('scr-campana');
}
```

- [ ] **Step 2: Simplificar `arrancarModoPrueba`**

Reemplazar la función completa por:

```js
/* Modo prueba (?solo=): entra como invitado y abre su propia lista de capítulos,
   saltándose "¿Cómo quieres entrar?" y la pantalla de nombre/avatar. */
function arrancarModoPrueba(){
 S.nombre='Invitado'; S.avatar=AVATARES[4];   // 🦊, la mascota
 $('nav').style.display='none';
 renderListaPrueba();
}
```

- [ ] **Step 3: Volver desde el mapa a la lista de prueba**

En el handler de `btnMapaCamp`, agregar la primera línea del cuerpo. Sin esto, un capítulo
sin campaña (Vocabulario, Lectura) se fuga a `scr-lenguaje` o `scr-biblioteca`:

```js
$('btnMapaCamp').onclick=()=>{SND.tap();
 if(PRUEBA){renderListaPrueba();return;}   // modo prueba: vuelve a su propia lista
 if(EXP_ACT&&EXP_ACT.campaña){CAMP_ACT=campañaPorId(EXP_ACT.campaña);renderCampaña();go('scr-campana');return;}
 if(EXP_ACT&&EXP_ACT.id==='voc-general'){go('scr-lenguaje');return;}   // Vocabulario → landing de Lenguaje
 if(EXP_ACT&&EXP_ACT.asignatura==='Lectura'){go('scr-biblioteca');return;} // Lectura → biblioteca
 go('scr-expediciones');};
```

- [ ] **Step 4: Devolver `renderCampaña` a su estado original**

Quitar los tres injertos de la Sesión 41. La función debe quedar así en sus partes tocadas:

```js
function renderCampaña(){
 const c=CAMP_ACT; if(!c)return;
 if(c.esLecciones){ renderCampañaMate(c); return; }
 $('campHead').innerHTML=`<h1 style="font-size:26px">${c.asignatura} ${campañaCompleta(c)?'👑':''}</h1><p>${c.intro}</p>`;
 const cont=$('campNodos'); cont.innerHTML='';
 // capítulos en orden
 c.capitulos.forEach((id,i)=>{
  const exp=EXPEDICIONES.find(e=>e.id===id);
  const abierto=nodoCampDesbloqueado(c,i), hecho=expedicionCompleta(id);
```

es decir: se borra la línea `if($('btnCampBack')) $('btnCampBack').style.display=PRUEBA?'none':'';`
(y su comentario de tres líneas), se borra `if(PRUEBA && !SOLO.includes(id)) return;` y se
acorta el comentario de los capítulos.

Más abajo, el Desafío Extra vuelve a su condición original:

```js
 // desafío extra (solo si la campaña lo define)
 if(c.desafioExtra){
```

Y el Jefe Final pierde el envoltorio `if(!PRUEBA){ … }`, volviendo a sus tres líneas sueltas
con la indentación original:

```js
 // jefe final (luce al villano de la campaña)
 const jfAb=jefeFinalDesbloqueado(c), jfHecho=campañaCompleta(c);
 cont.appendChild(nodoCampañaEl('👑','JEFE FINAL DE '+c.asignatura.toUpperCase(), jfAb, jfHecho,
   jfAb?()=>iniciarJefeFinal(c):null, jfHecho?'¡Vencido!':(jfAb?'¡Al 100%! Enfréntalo':'🔒 Completa todo'),
   c.jefeFinal.villanoImg||''));
}
```

- [ ] **Step 5: Confirmar que no queda `PRUEBA` dentro de `renderCampaña`**

```bash
grep -n "PRUEBA" index.html
```

Esperado: `PRUEBA` aparece en la definición de banderas, en `nuevoProgreso`, en `guardar`,
en el arranque, en `entrarExpedicion`, en `btnMapaCamp`, en la intro, en el aviso y en
`renderListaPrueba`. **No debe aparecer dentro de `renderCampaña`.**

- [ ] **Step 6: Verificar los tres agujeros y la no-regresión**

Con `preview_start` (config `kimun` de `.claude/launch.json`, puerto 8765). En cada URL,
borrar la intro con `javascript_tool` (`document.getElementById('introOverlay')?.remove()`)
y leer `#campNodos`:

| URL | Esperado |
|---|---|
| `/?solo=hist-cap2,hist-cap3,hist-cap4` | 3 tarjetas, numeradas 2/3/4, todas "¡Jugar!" (no-regresión de la Sesión 41) |
| `/?solo=mate-exp-numeros` | **1 sola tarjeta.** Sin lecciones de Matemáticas, sin Reto de Cálculo, sin Jefe Final |
| `/?solo=hist-cap2,cien-celula` | **2 tarjetas**, una de cada asignatura; el encabezado dice "Historia · Ciencias" |
| `/?solo=voc-general,lect-anafrank` | **2 tarjetas**, ambas con la marca 📘 (no tienen campaña) |
| `/` (juego normal) | Historia muestra sus **5 capítulos + Desafío Extra + Jefe Final**, con "← Volver" visible |

Además: entrar a un capítulo desde `?solo=voc-general,lect-anafrank` y pulsar "← Volver":
debe volver a la **lista de prueba**, no a la biblioteca ni al landing de Lenguaje.

Consola sin errores en los cinco casos.

---

### Task 2: La pantalla del armador (`?armar=1`)

**Files:**
- Modify: `index.html` — markup nuevo tras `scr-campana` (~745); banderas (~1021 y ~1225); guardas de persistencia; arranque.

**Interfaces:**
- Consumes: `EXPEDICIONES`, `ORDEN_ASIG` (`string[]`), `campañaPorId(id)`, `nombreMapa(exp)`, `go(id)`.
- Produces:
  - `ARMAR` — `boolean`. `true` con `?armar=1`.
  - `SIN_DISCO` — `boolean`. `PRUEBA || ARMAR`. No escribe en disco ni usa Supabase.
  - `armarUrl()` — devuelve el enlace armado (`string`, vacío si no hay nada marcado) y refresca el campo y los botones.
  - `arrancarArmador()` — `void`. Monta la lista y abre `scr-armar`.

- [ ] **Step 1: Agregar el markup de la pantalla**

Insertar después del cierre de `<section class="screen" id="scr-campana"> … </section>` (~745):

```html
  <!-- ====== ARMADOR DE ENLACES DE MUESTRA (?armar=1) ====== -->
  <section class="screen" id="scr-armar">
    <div class="logo" style="margin:20px 0 4px">
      <span class="badge">🔗</span>
      <h1 style="font-size:24px">Armar enlace de muestra</h1>
      <p>Marca los capítulos que quieres incluir.</p>
    </div>
    <div id="armarLista"></div>
    <div class="card" style="margin-top:14px">
      <label style="display:flex;gap:8px;align-items:center;font-weight:800;font-size:13px">
        <input type="checkbox" id="armarQA"> Mostrar las respuestas correctas
      </label>
      <input id="armarUrl" readonly
             style="width:100%;padding:10px;border-radius:12px;border:2px solid var(--violet);
                    background:#1a1440;color:#fff;font-weight:700;font-size:12px;margin:10px 0">
      <button class="btn" id="armarCopiar">📋 Copiar</button>
      <button class="btn sec" id="armarProbar">▶ Probar</button>
      <p id="armarMsg" style="text-align:center;font-weight:800;font-size:12px;margin-top:8px;color:var(--dim)"></p>
    </div>
  </section>
```

- [ ] **Step 2: Agregar la bandera `ARMAR`**

En el bloque de banderas (~1021), después de `const _SOLO_PEDIDO=…`, agregar:

```js
const ARMAR=_PARAMS.has('armar');      // pantalla para armar enlaces de muestra
```

Y en el segundo bloque (~1225), después de `const EFIMERO=…`, agregar:

```js
const SIN_DISCO=PRUEBA||ARMAR;   // ni localStorage ni Supabase ni intro
```

- [ ] **Step 3: Extender las guardas de persistencia a `ARMAR`**

Cuatro reemplazos de `PRUEBA` por `SIN_DISCO`, uno por sitio:

- En `guardar()`: `if(PRUEBA){ if(EXP_ACT) S.rutas…` → `if(SIN_DISCO){ if(EXP_ACT) S.rutas…`
- En el arranque: `if(!PRUEBA) cargar();` → `if(!SIN_DISCO) cargar();`
- En el arranque: `if(!PRUEBA) setTimeout(async ()=>{` → `if(!SIN_DISCO) setTimeout(async ()=>{`
- En la intro: `if(PRUEBA){ ov.remove(); return; }` → `if(SIN_DISCO){ ov.remove(); return; }`

**Ojo:** NO cambiar `if(PRUEBA||i===0)` de `nuevoProgreso`, ni `PRUEBA?true:hayPartida()` de
`entrarExpedicion`, ni `if(PRUEBA){renderListaPrueba();return;}` de `btnMapaCamp`, ni el
aviso `if(PRUEBA&&!QA)`. Esos son del modo prueba y el armador no juega.

- [ ] **Step 4: Agregar la lógica del armador**

Insertar después de `renderListaPrueba()` (antes de `arrancarModoPrueba`):

```js
/* ===== Armador de enlaces de muestra (?armar=1) =====
   Vive aquí y no en profesor.html a propósito: el catálogo (EXPEDICIONES) ya está en este
   archivo, así que una expedición nueva aparece sola, sin listas paralelas que mantener.
   El panel solo abre esta pantalla, igual que hace con el Tablero de avance. */
function armarUrl(){
 const ids=[...document.querySelectorAll('#armarLista input[type=checkbox]:checked')].map(c=>c.value);
 const url=ids.length
   ? location.origin+location.pathname+'?solo='+ids.join(',')+($('armarQA').checked?'&qa=1':'')
   : '';
 $('armarUrl').value=url||'Marca al menos un capítulo';
 $('armarCopiar').disabled=!url; $('armarProbar').disabled=!url;
 return url;
}
function arrancarArmador(){
 const cont=$('armarLista'); cont.innerHTML='';
 const activas=EXPEDICIONES.filter(e=>e.activa);
 const asigs=[...new Set(activas.map(e=>e.asignatura))]
   .sort((a,b)=>((ORDEN_ASIG.indexOf(a)+1)||99)-((ORDEN_ASIG.indexOf(b)+1)||99));
 asigs.forEach(asig=>{
  const h=document.createElement('h3');
  h.textContent=asig; h.style.cssText='color:var(--cyan);font-size:14px;margin:14px 0 6px';
  cont.appendChild(h);
  activas.filter(e=>e.asignatura===asig).forEach(exp=>{
   const camp=exp.campaña?campañaPorId(exp.campaña):null;
   const i=camp?camp.capitulos.indexOf(exp.id):-1;
   const l=document.createElement('label');
   l.style.cssText='display:flex;gap:8px;align-items:center;font-size:13px;font-weight:700;padding:4px 0';
   l.innerHTML=`<input type="checkbox" value="${exp.id}"><span>${i>=0?(i+1)+'. ':''}${nombreMapa(exp)}</span>`;
   cont.appendChild(l);
  });
 });
 cont.addEventListener('change',armarUrl);
 $('armarQA').onchange=armarUrl;
 $('armarCopiar').onclick=()=>{
  const u=armarUrl(); if(!u) return;
  Promise.resolve(navigator.clipboard&&navigator.clipboard.writeText(u))
   .then(()=>{ $('armarMsg').textContent='Enlace copiado.'; })
   .catch(()=>{ $('armarUrl').select(); $('armarMsg').textContent='Selecciona y copia con Ctrl+C.'; });
 };
 $('armarProbar').onclick=()=>{ const u=armarUrl(); if(u) window.open(u,'_blank'); };
 armarUrl();
 $('nav').style.display='none';
 go('scr-armar');
}
```

- [ ] **Step 5: Llamarlo desde el arranque**

En el arranque, junto a la llamada del modo prueba:

```js
 if(PRUEBA) setTimeout(arrancarModoPrueba,0);   // tras montar la UI
 if(ARMAR)  setTimeout(arrancarArmador,0);
```

- [ ] **Step 6: Verificar el armador en el navegador**

Abrir `http://localhost:8765/?armar=1` y comprobar:

1. Aparece la lista con todos los capítulos activos, agrupados por asignatura, en el orden
   Historia · Matemáticas · Ciencias · Lenguaje (y el resto al final).
2. Sin nada marcado: el campo dice "Marca al menos un capítulo" y **Copiar y Probar están
   deshabilitados** (`document.getElementById('armarCopiar').disabled === true`).
3. Marcar `hist-cap2` y `hist-cap3` → el campo muestra
   `http://localhost:8765/?solo=hist-cap2,hist-cap3` y los botones se habilitan.
4. Marcar además "Mostrar las respuestas correctas" → el enlace termina en `&qa=1`.
5. Desmarcar todo → vuelve al estado del punto 2.
6. `Object.keys(localStorage)` no gana claves nuevas y `read_network_requests` con patrón
   `supabase` no muestra llamadas.
7. Navegar al enlace generado en el punto 3: abre exactamente esos dos capítulos.
8. Consola sin errores.

---

### Task 3: El botón en el panel del profesor

**Files:**
- Modify: `profesor.html` — bloque "Administración" (~436-450).

**Interfaces:**
- Consumes: `YO.es_admin` (`boolean`), `$(id)`.

- [ ] **Step 1: Agregar el botón al bloque de Administración**

En la plantilla del bloque, después de la línea del Tablero, agregar una línea con el mismo
patrón condicional que ya usa "Limpiar perfiles de prueba":

```js
        <button class="btn sec" id="btnTablero">📊 Tablero de avance</button>
        ${YO.es_admin?`<button class="btn sec" id="btnArmar">🔗 Armar enlace de muestra</button>`:''}
      </div>`);
```

- [ ] **Step 2: Enlazar el handler**

Junto al handler de `btnLimpiar`, que ya está bajo la misma condición:

```js
    // "Limpiar perfiles de prueba" y el armador son de plataforma: solo el Admin los ve.
    if(YO.es_admin){
      $('btnLimpiar').onclick=limpiarPruebas;
      $('btnArmar').onclick=()=>{ window.location.href='index.html?armar=1'; };
    }
```

(reemplazando la línea `if(YO.es_admin){ $('btnLimpiar').onclick=limpiarPruebas; }`)

- [ ] **Step 3: Verificar con backend simulado**

No se puede iniciar sesión de profesor desde el entorno de desarrollo, así que se verifica
con un stub de `SB.rpc`, como en las Sesiones 26-28 y 39. En el navegador, sobre
`http://localhost:8765/profesor.html`, con `javascript_tool`:

1. Con `YO={es_admin:true, es_super:true, correo:'a@b.cl'}` y `ESADMINCOLEGIO=true`:
   el bloque "Administración" muestra **ambos** botones, y `#btnArmar` existe.
2. Con `YO={es_admin:false, es_super:true, correo:'a@b.cl'}` (SuperUsuario, no Admin):
   `#btnArmar` **no existe** (`document.getElementById('btnArmar') === null`), igual que
   `#btnLimpiar`.
3. Pulsar el botón como Admin navega a `index.html?armar=1`.
4. Consola sin errores.

---

### Task 4: Verificación integral y documentación

**Files:**
- Modify: `CLAUDE.md` — "Parámetros de URL (ocultos)" (~226) y Bitácora (al final).

- [ ] **Step 1: Regresión completa**

| URL | Esperado |
|---|---|
| `/` | Juego normal: capítulo 1 abierto, 2-5 bloqueados, Desafío Extra y Jefe Final presentes, "← Volver" visible, guarda al jugar |
| `/?qa=1` | Desbloquea capítulos **y marca respuestas**, badge verde, **guarda en disco** |
| `/?solo=hist-cap2,hist-cap3,hist-cap4` | 3 tarjetas 2/3/4, 5 etapas abiertas cada una, 0 respuestas marcadas, badge celeste, no guarda |
| `/?solo=mate-exp-numeros` | 1 tarjeta; sin lecciones, Reto ni Jefe Final de Matemáticas |
| `/?solo=hist-cap2,cien-celula` | 2 tarjetas, dos asignaturas |
| `/?armar=1` | Armador; no escribe en disco ni llama a Supabase |
| `/?solo=noexiste` | Juego normal, sin errores |

- [ ] **Step 2: Documentar `?armar=1` en `CLAUDE.md`**

En "Parámetros de URL (ocultos)", después del bloque de `?solo=`, agregar:

```markdown
- **`?armar=1` — Armador de enlaces de muestra (solo Admin):** pantalla oculta que lista
  todos los capítulos activos agrupados por asignatura, con casillas, y construye el
  enlace `?solo=…` correspondiente (con `&qa=1` opcional, casilla "Mostrar las respuestas
  correctas"). Botones Copiar y Probar. El enlace se arma con `location.origin`, así que
  abierto desde vulpo.cl genera enlaces de vulpo.cl y en local genera locales. Se llega
  desde `profesor.html` → Administración → "🔗 Armar enlace de muestra", visible solo para
  `YO.es_admin`. **Vive en `index.html` a propósito:** el catálogo (`EXPEDICIONES`) ya está
  ahí, así que una expedición nueva aparece sola, sin listas paralelas que mantener.
  Como `?solo=`, **no es un candado** (sitio estático), pero tampoco expone nada nuevo.
```

- [ ] **Step 3: Dejar la entrada de bitácora redactada**

Agregar al final de la Bitácora una entrada de sesión que cubra: el armador, la corrección
de los tres agujeros del modo prueba (Matemáticas, asignaturas mezcladas, capítulos sin
campaña), el hecho de que `renderCampaña` volvió a su estado original, y lo verificado.
**No se hace commit**: queda escrita para la orden 66.

- [ ] **Step 4: Informar a Roberto**

Decir qué se verificó y con qué evidencia, confirmar que el enlace de Historia ya repartido
sigue funcionando, y recordar que el commit espera la orden 66.

---

## Notas de revisión del plan

- **Cobertura del spec:** Parte 1 (lista propia y los tres agujeros) → Task 1; Parte 2
  (armador, casilla de respuestas, copiar/probar, no persistencia) → Task 2; Parte 3
  (botón del panel, solo Admin) → Task 3. Las once verificaciones del spec están en
  Task 1 paso 6, Task 2 paso 6, Task 3 paso 3 y Task 4 paso 1.
- **Agujero adicional encontrado al planificar:** `btnMapaCamp` mandaba los capítulos sin
  campaña a `scr-lenguaje` o `scr-biblioteca`, otra fuga fuera del modo prueba. Cubierto en
  Task 1 paso 3, con su verificación al final del paso 6.
- **`SIN_DISCO` vs `PRUEBA`:** el armador comparte las guardas de persistencia pero **no**
  las de juego (etapas abiertas, entrada de invitado, vuelta a la lista, aviso). El paso 3
  de la Task 2 lo dice explícitamente para que nadie reemplace de más.
