# Muestras con caducidad y token `?m=` — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: usa superpowers:subagent-driven-development (recomendado) o superpowers:executing-plans para ejecutar este plan tarea por tarea. Los pasos usan casillas (`- [ ]`) para seguimiento.

**Goal:** Que los enlaces de muestra puedan caducar en una fecha, viajando en un token codificado (`?m=…`) que no muestra sus datos, y que el armador los genere y sepa leerlos de vuelta.

**Architecture:** Un token base64url guarda `ids|fecha|qa` y alimenta las mismas variables `SOLO` y `QA` que ya existen, así que toda la maquinaria del modo prueba funciona sin cambios. Si la fecha pasó, el arranque desvía a una pantalla de "muestra vencida" en vez de a la lista. El armador gana campo de fecha, resumen en castellano y un lector de enlaces.

**Tech Stack:** HTML/JS vanilla en `index.html`, sin framework. `btoa`/`atob` para el token, `<input type="date">` para la fecha.

**Fuente de verdad del diseño:** `docs/superpowers/specs/2026-08-24-muestras-con-caducidad-design.md`.

## Global Constraints

- **NO se hace commit ni push** en ningún paso. Se espera la **orden 66** de Roberto.
- **No hay tests automatizados.** Verificación en el navegador con `preview_start`, DOM y consola.
- **`?solo=` no se toca.** El enlace `https://vulpo.cl/?solo=hist-cap2,hist-cap3,hist-cap4` ya está repartido: debe seguir funcionando igual y **sin caducidad**.
- **`?qa=1` no se toca:** desbloquea, marca respuestas, guarda en disco, crea perfil.
- **Sin ningún parámetro, el juego se comporta EXACTAMENTE como hoy.**
- **El token es un disfraz, no un cifrado.** Base64url es público y reversible. Se documenta como tal; no se presenta como seguridad.
- **Vigencia inclusiva:** un enlace con fecha `2026-09-15` funciona todo el 15 y deja de servir el 16.
- **Nada de dominios escritos a mano:** las URLs se arman con `location.origin + location.pathname`.
- Idioma de interfaz y comentarios: **español**.
- Solo se toca `index.html` (y `CLAUDE.md` al final). No se tocan `profesor.html`, `supabase/schema.sql` ni el contenido.

---

## Estructura de archivos

- **`index.html`** (modificar) — cuatro zonas:
  - Banderas (~1045-1049): decodificar `?m=` y alimentar `QA`, `_SOLO_PEDIDO` y `VENCE`.
  - Markup: nueva `<section id="scr-vencida">` tras `scr-armar` (~1010), y campos nuevos dentro de `scr-armar`.
  - Arranque (~2537): desvío a la pantalla de vencido.
  - Lógica del armador (`armarUrl`, `arrancarArmador`): fecha, token, resumen y lector.
- **`CLAUDE.md`** (modificar, Task 4) — documentar `?m=` y dejar la bitácora lista para la orden 66.

**Orden:** Task 1 (token y caducidad, el motor) → Task 2 (pantalla de vencido) → Task 3 (armador: fecha, resumen y lector) → Task 4 (verificación integral + docs).

---

### Task 1: El token `?m=` y la fecha de caducidad

Al terminar, un enlace `?m=` abre el modo prueba igual que `?solo=`, y `VENCIDA` dice si caducó. Todavía no hay pantalla de vencido (eso es la Task 2) ni forma de generarlos desde el armador (Task 3): se prueban con tokens hechos a mano en la consola.

**Files:**
- Modify: `index.html:1045-1049` (bloque de banderas), `index.html:1251-1255` (segundo bloque).

**Interfaces:**
- Produces:
  - `b64uCod(txt)` — `string`. Codifica a base64url (sin `=`).
  - `b64uDec(txt)` — `string`. Decodifica base64url. Devuelve `''` si no se puede.
  - `leerToken(t)` — devuelve `{ids:string[], hasta:string, qa:boolean}` o `null` si el token es inválido. `hasta` es `'AAAA-MM-DD'` o `''`.
  - `hoyISO()` — `string` `'AAAA-MM-DD'` con la fecha **local** del dispositivo.
  - `VENCE` — `string`. Fecha de caducidad del enlace actual, o `''` si no tiene.
  - `VENCIDA` — `boolean`. `true` si `VENCE` existe y ya pasó.

- [ ] **Step 1: Agregar los ayudantes y la decodificación del token**

Reemplazar el bloque de banderas actual (líneas ~1045-1049, desde `const _PARAMS=` hasta la línea de `const ARMAR=`) por:

```js
/* base64url: base64 con +/ cambiados por -_ y sin = al final, para viajar limpio en la URL.
   OJO: esto es un DISFRAZ, no un cifrado. Base64 es un formato público y reversible; sirve
   para que la fecha no se vea en la barra de direcciones (y nadie sienta la invitación a
   editarla), no para detener a quien sepa lo que mira. */
function b64uCod(txt){ return btoa(txt).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
function b64uDec(txt){
 try{ return atob(String(txt).replace(/-/g,'+').replace(/_/g,'/')); }catch(e){ return ''; }
}
/* Token de muestra: "ids separados por coma | AAAA-MM-DD | 1 si respuestas".
   Devuelve null si no se puede leer, y quien lo llama cae al juego normal. */
function leerToken(t){
 if(!t) return null;
 const crudo=b64uDec(t); if(!crudo) return null;
 const p=crudo.split('|');
 const ids=(p[0]||'').split(',').map(s=>s.trim()).filter(Boolean);
 if(!ids.length) return null;
 const hasta=/^\d{4}-\d{2}-\d{2}$/.test(p[1]||'') ? p[1] : '';
 return { ids:ids, hasta:hasta, qa:(p[2]||'')==='1' };
}
/* Fecha local del dispositivo como AAAA-MM-DD (no UTC: interesa el día del visitante). */
function hoyISO(){
 const d=new Date(), z=n=>String(n).padStart(2,'0');
 return d.getFullYear()+'-'+z(d.getMonth()+1)+'-'+z(d.getDate());
}
const _PARAMS=new URLSearchParams(location.search);
const _M=leerToken(_PARAMS.get('m'));   // null si no hay ?m= o si viene corrupto
const QA=_PARAMS.has('qa')||!!(_M&&_M.qa);
const QA_MARCA=QA;                     // solo QA pinta la respuesta correcta
const _SOLO_PEDIDO=_M ? _M.ids
                      : (_PARAMS.get('solo')||'').split(',').map(s=>s.trim()).filter(Boolean);
const VENCE=_M?_M.hasta:'';            // '' = no caduca. ?solo= nunca caduca.
const ARMAR=_PARAMS.has('armar');      // pantalla para armar enlaces de muestra
```

- [ ] **Step 2: Agregar `VENCIDA` al segundo bloque**

Después de `const SIN_DISCO=PRUEBA||ARMAR;` agregar:

```js
/* Vigencia inclusiva: un enlace con hasta=2026-09-15 sirve todo el 15 y muere el 16. */
const VENCIDA=!!VENCE && hoyISO()>VENCE;
```

- [ ] **Step 3: Verificar el motor en la consola del navegador**

Levantar con `preview_start` (config `kimun`, puerto 8765). En `http://localhost:8765/`,
con `javascript_tool`:

```js
JSON.stringify({
  ida: b64uCod('hist-cap2,hist-cap3|2026-09-15|'),
  vuelta: leerToken(b64uCod('hist-cap2,hist-cap3|2026-09-15|')),
  basura: leerToken('xxxx'),
  vacio: leerToken(''),
  sinFecha: leerToken(b64uCod('hist-cap2||')),
  conQA: leerToken(b64uCod('hist-cap2||1')),
  hoy: hoyISO()
})
```

Esperado: `ida` es `aGlzdC1jYXAyLGhpc3QtY2FwM3wyMDI2LTA5LTE1fA`; `vuelta` trae los dos ids,
`hasta:'2026-09-15'` y `qa:false`; `basura` y `vacio` son `null`; `sinFecha` trae
`hasta:''`; `conQA` trae `qa:true`; `hoy` es la fecha de hoy.

- [ ] **Step 4: Verificar que un `?m=` vigente abre el modo prueba**

Navegar a `http://localhost:8765/?m=aGlzdC1jYXAyLGhpc3QtY2FwM3wyMDI2LTA5LTE1fA` y comprobar
con `javascript_tool` que `SOLO` es `['hist-cap2','hist-cap3']`, `PRUEBA` es `true`,
`VENCE` es `'2026-09-15'`, `VENCIDA` es `false` (hoy es 2026-08-24), y que `#campNodos`
muestra las dos tarjetas numeradas 2 y 3.

- [ ] **Step 5: Verificar que `?solo=` y el juego normal no cambiaron**

- `http://localhost:8765/?solo=hist-cap2,hist-cap3,hist-cap4` → 3 tarjetas 2/3/4, y
  `VENCE===''`, `VENCIDA===false`.
- `http://localhost:8765/?m=xxxx` → `PRUEBA===false`, pantalla `scr-rol` (juego normal).
- `http://localhost:8765/` → juego normal intacto.
- Consola sin errores en los tres.

---

### Task 2: La pantalla de muestra vencida

**Files:**
- Modify: `index.html` — markup tras el cierre de `scr-armar`; arranque (~2537).

**Interfaces:**
- Consumes: `VENCE`, `VENCIDA`, `PRUEBA`, `go(id)`.
- Produces: `mostrarVencida()` — `void`. Pinta la fecha y abre `scr-vencida`.

- [ ] **Step 1: Agregar el markup**

Insertar inmediatamente después del `</section>` que cierra `scr-armar`:

```html
  <!-- ====== MUESTRA VENCIDA (?m= con fecha pasada) ====== -->
  <section class="screen" id="scr-vencida">
    <div class="logo" style="margin:40px 0 10px">
      <span class="badge">⌛</span>
      <h1 style="font-size:24px">Esta muestra ya no está disponible</h1>
      <p id="vencidaFecha"></p>
    </div>
    <div class="card">
      <p style="color:var(--dim);font-weight:800;font-size:13px;text-align:center">
        El juego completo sigue disponible para todos.
      </p>
      <button class="btn" id="vencidaIr">Ir al juego completo</button>
    </div>
  </section>
```

- [ ] **Step 2: Agregar `mostrarVencida`**

Insertar justo antes de `function arrancarModoPrueba(){`:

```js
/* Pantalla de muestra vencida. No da acceso a los capítulos, pero sí al juego completo:
   VULPO es público, así que caducar el enlace apaga la muestra, no el juego. */
function mostrarVencida(){
 const MESES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto',
              'septiembre','octubre','noviembre','diciembre'];
 const p=VENCE.split('-');
 $('vencidaFecha').textContent='Venció el '+Number(p[2])+' de '+MESES[Number(p[1])-1]+' de '+p[0]+'.';
 $('vencidaIr').onclick=()=>{ location.href=location.origin+location.pathname; };
 $('nav').style.display='none';
 go('scr-vencida');
}
```

- [ ] **Step 3: Desviar desde el arranque**

Reemplazar la línea del arranque:

```js
 if(PRUEBA) setTimeout(arrancarModoPrueba,0);   // tras montar la UI
```

por:

```js
 if(PRUEBA) setTimeout(VENCIDA?mostrarVencida:arrancarModoPrueba,0);   // tras montar la UI
```

- [ ] **Step 4: Verificar con un token vencido**

Construir un token con fecha pasada y abrirlo. En la consola del juego normal:

```js
b64uCod('hist-cap2,hist-cap3|2026-08-01|')
```

Navegar a `http://localhost:8765/?m=<ese token>` y comprobar:

1. La pantalla activa es `scr-vencida`.
2. `#vencidaFecha` dice exactamente `Venció el 1 de agosto de 2026.`
3. No se ve `#campNodos` con tarjetas ni la barra inferior.
4. Pulsar "Ir al juego completo" lleva a `http://localhost:8765/` y aparece `scr-rol`.
5. `Object.keys(localStorage)` no gana claves nuevas respecto de antes de abrirlo.

- [ ] **Step 5: Verificar la vigencia inclusiva**

Construir un token con la fecha de **hoy** (`b64uCod('hist-cap2|'+hoyISO()+'|')`) y abrirlo:
debe **abrir la muestra**, no la pantalla de vencido. Es el caso límite del diseño.

---

### Task 3: El armador genera y lee tokens

**Files:**
- Modify: `index.html` — markup de `scr-armar`; `armarUrl()`; `arrancarArmador()`.

**Interfaces:**
- Consumes: `b64uCod`, `b64uDec`, `leerToken`, `hoyISO`, `EXPEDICIONES`, `nombreMapa`.
- Produces: `fechaLarga(iso)` — `string`. Convierte `'2026-09-15'` en `'15 de septiembre de 2026'`. La usan el resumen y el lector.

- [ ] **Step 1: Agregar los campos al markup de `scr-armar`**

Dentro de la `<div class="card">` de `scr-armar`, **antes** del `<label>` de "Mostrar las
respuestas correctas", insertar el bloque de caducidad:

```html
      <p style="font-weight:900;font-size:13px;margin:0 0 6px">Caducidad</p>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
        <button class="btn-chip" id="armarSinFin">Sin caducidad</button>
        <button class="btn-chip" id="armarSemana">1 semana</button>
        <button class="btn-chip" id="armarMes">1 mes</button>
      </div>
      <input type="date" id="armarHasta"
             style="width:100%;padding:10px;border-radius:12px;border:2px solid var(--violet);
                    background:#1a1440;color:#fff;font-weight:800;font-size:13px;margin-bottom:10px">
```

Y **después** del `<p id="armarMsg">`, dentro de la misma tarjeta, el resumen:

```html
      <p id="armarResumen" style="text-align:center;font-weight:800;font-size:12px;margin-top:6px;color:var(--cyan)"></p>
```

Luego, **después** de esa tarjeta y antes del `</section>`, el lector:

```html
    <div class="card" style="margin-top:14px">
      <p style="font-weight:900;font-size:13px;margin:0 0 6px">¿Qué contiene un enlace?</p>
      <input id="armarLeer" placeholder="Pega aquí un enlace de muestra"
             style="width:100%;padding:10px;border-radius:12px;border:2px solid var(--violet);
                    background:#1a1440;color:#fff;font-weight:700;font-size:12px;margin-bottom:8px">
      <button class="btn sec" id="armarLeerBtn">🔍 Leer</button>
      <p id="armarLeido" style="font-weight:800;font-size:12px;margin-top:8px;color:var(--dim)"></p>
    </div>
```

- [ ] **Step 2: Agregar `fechaLarga`**

Insertar justo antes de `function armarUrl(){`:

```js
/* '2026-09-15' -> '15 de septiembre de 2026'. La usan el resumen y el lector. */
function fechaLarga(iso){
 const MESES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto',
              'septiembre','octubre','noviembre','diciembre'];
 const p=(iso||'').split('-');
 if(p.length!==3) return iso||'';
 return Number(p[2])+' de '+MESES[Number(p[1])-1]+' de '+p[0];
}
```

- [ ] **Step 3: Reemplazar `armarUrl` para que genere el token**

Reemplazar la función completa por:

```js
function armarUrl(){
 const ids=[...document.querySelectorAll('#armarLista input[type=checkbox]:checked')].map(c=>c.value);
 const hasta=$('armarHasta').value||'';
 const qa=$('armarQA').checked;
 const url=ids.length
   ? location.origin+location.pathname+'?m='+b64uCod(ids.join(',')+'|'+hasta+'|'+(qa?'1':''))
   : '';
 $('armarUrl').value=url||'Marca al menos un capítulo';
 $('armarCopiar').disabled=!url; $('armarProbar').disabled=!url;
 $('armarResumen').textContent = url
   ? ids.length+(ids.length===1?' capítulo':' capítulos')
     +(hasta?' · vence el '+fechaLarga(hasta):' · sin caducidad')
     +(qa?' · con respuestas':'')
   : '';
 return url;
}
```

- [ ] **Step 4: Enlazar los atajos de fecha y el lector**

Dentro de `arrancarArmador()`, justo **antes** de la línea `armarUrl();` del final, insertar:

```js
 const enDias=n=>{ const d=new Date(); d.setDate(d.getDate()+n);
   const z=x=>String(x).padStart(2,'0');
   return d.getFullYear()+'-'+z(d.getMonth()+1)+'-'+z(d.getDate()); };
 $('armarHasta').onchange=armarUrl;
 $('armarSinFin').onclick=()=>{ $('armarHasta').value=''; armarUrl(); };
 $('armarSemana').onclick=()=>{ $('armarHasta').value=enDias(7); armarUrl(); };
 $('armarMes').onclick=()=>{ $('armarHasta').value=enDias(30); armarUrl(); };
 $('armarHasta').min=hoyISO();          // no ofrecer fechas ya pasadas
 $('armarLeerBtn').onclick=()=>{
  const txt=($('armarLeer').value||'').trim();
  const t=(txt.match(/[?&]m=([^&\s]+)/)||[])[1] || txt;   // acepta enlace completo o token suelto
  const d=leerToken(t);
  if(!d){ $('armarLeido').textContent='No pude leer ese enlace.'; return; }
  const nombres=d.ids.map(id=>{const e=EXPEDICIONES.find(x=>x.id===id); return e?nombreMapa(e):id;});
  const estado=!d.hasta ? 'Sin caducidad.'
    : (hoyISO()>d.hasta ? 'VENCIÓ el '+fechaLarga(d.hasta)+'.' : 'Vence el '+fechaLarga(d.hasta)+'.');
  $('armarLeido').textContent=nombres.join(' · ')+' — '+estado+(d.qa?' Con respuestas.':'');
 };
```

- [ ] **Step 5: Verificar el armador en el navegador**

Abrir `http://localhost:8765/?armar=1` y comprobar:

1. Marcar `hist-cap2` → el enlace es `http://localhost:8765/?m=…` (empieza por `?m=`, **no**
   contiene `hist-cap2` legible) y el resumen dice `1 capítulo · sin caducidad`.
2. Pulsar "1 semana" → `#armarHasta` toma la fecha de hoy + 7 días y el resumen dice
   `1 capítulo · vence el <esa fecha en palabras>`.
3. Marcar "Mostrar las respuestas correctas" → el resumen añade `· con respuestas`.
4. Pulsar "Sin caducidad" → el campo de fecha queda vacío y el resumen vuelve a
   `· sin caducidad`.
5. Decodificar el enlace generado con `leerToken` y confirmar que trae los ids, la fecha y
   el `qa` correctos.
6. Pegar el enlace generado en "¿Qué contiene un enlace?" y pulsar Leer → responde con el
   nombre del capítulo y la vigencia.
7. Pegar solo el token (sin `http…?m=`) → responde igual.
8. Pegar `hola` → responde `No pude leer ese enlace.`
9. Consola sin errores.

---

### Task 4: Verificación integral y documentación

**Files:**
- Modify: `CLAUDE.md` — "Parámetros de URL (ocultos)" y Bitácora.

- [ ] **Step 1: Regresión completa**

| URL | Esperado |
|---|---|
| `/` | Juego normal: capítulo 1 abierto, 2-5 bloqueados, Desafío Extra y Jefe Final, guarda |
| `/?qa=1` | Desbloquea **y marca respuestas**, badge verde, **guarda en disco** |
| `/?solo=hist-cap2,hist-cap3,hist-cap4` | 3 tarjetas 2/3/4, sin marcar, sin caducidad |
| `/?m=` con fecha futura | Igual que el modo prueba, abre normal |
| `/?m=` con fecha de hoy | **Abre** (vigencia inclusiva) |
| `/?m=` con fecha pasada | Pantalla de vencido con la fecha en castellano |
| `/?m=xxxx` | Juego normal, sin errores |
| `/?armar=1` | Armador con fecha, resumen y lector; sin escribir en disco |

- [ ] **Step 2: Documentar `?m=` en `CLAUDE.md`**

En "Parámetros de URL (ocultos)", después del bloque de `?armar=1`, agregar:

```markdown
- **`?m=<token>` — Muestra con caducidad:** misma experiencia que `?solo=`, pero los datos
  viajan en un token **base64url** con el formato `ids|AAAA-MM-DD|1` (ids de capítulos,
  fecha de caducidad, y `1` si se muestran las respuestas). Sin fecha, no caduca. La
  **vigencia es inclusiva**: un enlace con `2026-09-15` sirve todo el 15 y muere el 16. Al
  vencer aparece una pantalla sobria con la fecha y un botón al juego completo (VULPO es
  público: caducar el enlace apaga la muestra, no el juego). Un token corrupto cae al juego
  normal. Lo genera el armador (`?armar=1`), que además **sabe leer un enlace** y decir qué
  contiene y cuándo vence.
  **El token es un DISFRAZ, no un cifrado:** base64 es público y reversible en un minuto.
  Sirve para que la fecha no se vea en la barra de direcciones —y nadie sienta la invitación
  a editarla—, no para detener a quien sepa lo que mira. Además se compara con el **reloj
  del dispositivo**, que se puede atrasar. **No hay revocación:** un enlace repartido vive
  hasta su fecha. Revocar de verdad exigiría Supabase, y se descartó por costo.
  `?solo=` sigue existiendo y **nunca caduca** (es el formato del enlace ya repartido).
```

- [ ] **Step 3: Dejar la entrada de bitácora redactada**

Agregar al final de la Bitácora una entrada que cubra: el token y por qué es disfraz y no
cifrado, la caducidad inclusiva, la pantalla de vencido, los tres agregados del armador
(fecha, resumen, lector), la decisión de **descartar la clave de acceso** con su motivo, y
los límites conocidos. **No se hace commit**: queda escrita para la orden 66.

- [ ] **Step 4: Informar a Roberto**

Entregar un enlace de ejemplo con caducidad, decir qué se verificó, y ser explícito sobre
qué protege y qué no. Recordar que el commit espera la orden 66.

---

## Notas de revisión del plan

- **Cobertura del spec:** token y formato → Task 1; pantalla de vencido y vigencia inclusiva
  → Task 2; armador (fecha, atajos, resumen) y lector → Task 3. Las diez verificaciones del
  spec están repartidas en Task 1 pasos 3-5, Task 2 pasos 4-5, Task 3 paso 5 y Task 4 paso 1.
- **Decisión al planificar:** `$('armarHasta').min=hoyISO()` impide elegir una fecha ya
  pasada en el selector. No está en el spec; evita generar un enlace nacido muerto.
- **`?solo=` nunca caduca**, por diseño: `VENCE` solo se llena desde `?m=`. Es lo que
  garantiza que el enlace ya repartido siga vivo.
- **`QA` ahora puede venir del token** (`_PARAMS.has('qa')||_M.qa`). Eso no altera `?qa=1`,
  que sigue activándolo por su cuenta.
