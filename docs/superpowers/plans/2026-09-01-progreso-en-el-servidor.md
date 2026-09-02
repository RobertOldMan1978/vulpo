# Progreso en el servidor (Bloque D) — Plan de implementación

> **Para quien ejecute:** las tareas van en orden y **cada una se verifica antes de seguir**. Los
> pasos usan casilla (`- [ ]`).

**Meta:** que el avance del alumno —monedas, skins, insignias y campañas— sobreviva a cambiar de
teléfono, canjeando su `ALU-`.

**Arquitectura:** una **foto completa del save en `jsonb`**, una fila por alumno. Sube enganchada a
`guardar()` con rebote de 15 s; baja **solo al canjear**. Si los dos lados tienen avance, se
pregunta una vez.

**Spec:** [`docs/superpowers/specs/2026-09-01-progreso-en-el-servidor-design.md`](../specs/2026-09-01-progreso-en-el-servidor-design.md)

---

## Reglas de este plan

- ⚠️ **No hay pasos de commit.** En este proyecto **nada se commitea hasta la orden 66** de Roberto.
  Se implementa, se verifica, y se espera.
- **Las pruebas son en un navegador de verdad** (`scripts/cdp.mjs`), no unitarias: este proyecto no
  tiene framework de tests, y los 404 y los fallos de arranque **no llegan a la consola de forma
  fiable**. Cada tarea trae su archivo de pasos y la salida esperada.
- **Los tres forks se editan con el mismo script**, con anclas exactas que **abortan si la ancla
  aparece más de una vez**, y escribiendo con `newline=""` (LF). Nunca por aritmética de índices —
  es la lección de la Sesión 56, que dejó 3° injugable.
- **Rama:** se puede trabajar en `main`, porque la orden 66 ya es la compuerta. Si Roberto prefiere
  aislarlo, `feature/progreso-servidor`.

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| `supabase/schema.sql` | La tabla `progreso` y las dos funciones. **Lo aplica Roberto a mano** |
| `assets/js/motor.js` | Toda la lógica: armar la foto, aplicarla, subir, bajar, resumir y rutear. **Una edición, tres cursos** |
| `juego/index.html`, `7mo/index.html`, `3ro/index.html` | La pantalla `scr-progreso` + su CSS, y dos enganches (canje y arranque). **Idénticos en los tres** |

---

## Task 1: El esquema

**Files:**
- Modify: `supabase/schema.sql` (insertar antes del bloque `grant execute on function`, ~línea 1672)

- [ ] **Paso 1: Agregar la tabla y las dos funciones**

Insertar **justo antes** de la línea `grant execute on function`:

```sql
/* ── Progreso del alumno (Bloque D) ──────────────────────────────────────────
   Una FOTO completa del save en jsonb, no columnas normalizadas. El save del
   juego gana campos seguido (mateLecciones en la Sesion 29, metasVistas y
   semaforo en la 52) y una foto los lleva sin migrar el esquema, que aqui
   significa que Roberto va a pegar SQL a mano. Medido: 9,4 KB el save mas
   grande que el juego puede producir hoy.                                     */
create table if not exists public.progreso (
  perfil_id    uuid primary key references public.perfiles(id) on delete cascade,
  datos        jsonb       not null,
  actualizado  timestamptz not null default now()
);
alter table public.progreso enable row level security;   -- sin politicas: todo por funciones

drop function if exists public.kimun_progreso_subir(jsonb);
create or replace function public.kimun_progreso_subir(p_datos jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare mi uuid;
begin
  mi := public.kimun_yo();
  if mi is null then return; end if;
  -- 6x el maximo medido. Ataja un bug del cliente que llene la base; no es
  -- un ajuste fino y no hay que bajarlo "para apretar".
  if octet_length(p_datos::text) > 65536 then
    raise exception 'progreso_muy_grande';
  end if;
  insert into public.progreso(perfil_id, datos, actualizado)
       values (mi, p_datos, now())
  on conflict (perfil_id) do update
     set datos = excluded.datos, actualizado = now();
end $$;

drop function if exists public.kimun_progreso_bajar();
create or replace function public.kimun_progreso_bajar()
returns table(datos jsonb, actualizado timestamptz)
language plpgsql security definer set search_path = public as $$
declare mi uuid;
begin
  mi := public.kimun_yo();
  if mi is null then return; end if;
  return query select p.datos, p.actualizado from public.progreso p where p.perfil_id = mi;
end $$;
```

> Los `drop function if exists` van **a propósito** aunque las funciones sean nuevas: sin ellos, el
> día que alguien le agregue una columna al resultado, re-aplicar el esquema **falla**. Es el
> hallazgo de la Sesión 39.

- [ ] **Paso 2: Sumarlas al `grant execute`**

Al final de la lista de `grant execute on function`, antes del `to anon, authenticated;`, agregar:

```sql
  , public.kimun_progreso_subir(jsonb), public.kimun_progreso_bajar()
```

⚠️ **No es opcional.** PostgreSQL le da `EXECUTE` a `PUBLIC` por defecto, así que omitir una función
de la lista **no la protege** — pero además, sin el `grant` explícito el patrón del archivo queda
inconsistente y la próxima revisión no sabe si fue deliberado.

- [ ] **Paso 3: Roberto lo aplica y verifica**

Pegar `supabase/schema.sql` **completo** en el SQL Editor de Supabase (es idempotente). Después,
pegar esta consulta, que debe devolver **3 filas, todas en `ok`**:

```sql
select 'tabla' as que,
       case when to_regclass('public.progreso') is not null then 'ok' else 'FALTA' end as estado
union all
select 'rls',
       case when (select relrowsecurity from pg_class where oid='public.progreso'::regclass)
            then 'ok' else 'FALTA' end
union all
select 'funciones',
       case when (select count(*) from pg_proc
                   where proname in ('kimun_progreso_subir','kimun_progreso_bajar')) = 2
            then 'ok' else 'FALTAN' end;
```

⚠️ **El SQL Editor de Supabase solo muestra el resultado de la última sentencia**, por eso va como
una sola consulta con `union all` — es la lección de la Sesión 46.

- [ ] **Paso 4: Registrar la aplicación**

Anotar la fecha en la tabla de aplicaciones de `docs/aplicar-schema.md`, como se hace siempre.

---

## Task 2: Sacar `payloadSave()` y `aplicarSave()` de donde están

Refactor puro: **no cambia ningún comportamiento**. Se hace primero porque las tareas 3 y 4 lo
necesitan.

**Por qué, y no es estética:** hoy la forma del save está escrita **dos veces** —`guardar()` la
arma campo por campo y `cargar()` la lee campo por campo—. Si el camino de bajada la escribiera una
tercera vez, el día que el juego sume un campo se caería en una de las tres, **sin ningún error**.
Es exactamente el bug que este proyecto ya pagó tres veces: el `oa` en la Sesión 23, el `visual` en
la 55 y el `META_OA` en la 63.

**Files:**
- Modify: `assets/js/motor.js:1033-1078` (`guardar()` y `cargar()`)

- [ ] **Paso 1: Agregar `payloadSave()` justo antes de `guardar()`**

```js
/* La forma del save, en UN solo lugar. La usan guardar() (disco) y subirProgreso()
   (servidor), asi que un campo nuevo llega a los dos sin que nadie se acuerde. */
function payloadSave(){
 return {nombre:S.nombre,avatar:S.avatar,xp:S.xp,monedas:S.monedas,
  skins:S.skins,logros:[...S.logros], rutaActual:EXP_ACT?EXP_ACT.id:null, rutas:S.rutas,
  campañasCompletas:[...S.campañasCompletas], insignias:[...S.insignias], insigniaActiva:S.insigniaActiva,
  calc:S.calc, curso:S.curso, alumno:S.alumno, maestro:S.maestro, mateLecciones:S.mateLecciones,
  metasVistas:S.metasVistas, semaforo:S.semaforo};
}
```

- [ ] **Paso 2: Que `guardar()` la use**

Reemplazar el bloque `localStorage.setItem(SAVE_KEY,JSON.stringify({ … }));sincronizarXP();` por:

```js
 localStorage.setItem(SAVE_KEY,JSON.stringify(payloadSave()));sincronizarXP();}catch(e){}}
```

(las líneas de los 17 campos se van; el resto de `guardar()` no se toca)

- [ ] **Paso 3: Partir `cargar()` en dos**

`cargar()` pasa a ser solo la lectura del disco. **El corte es exacto y va por anclas, no por
números de línea:** el tramo que se mueve empieza en `S.nombre=d.nombre||"";` y termina en
`return !!d.nombre;` — **31 líneas, sin tocar ni un byte**. La línea de la firma y el
`}catch(e){return false;}}` del final **no** se mueven: se reescriben en las dos funciones.

⚠️ **Ojo con la última línea**, porque trae dos cosas pegadas:
`return !!d.nombre;}catch(e){return false;}}`. Al cortar hay que partirla, no arrastrarla entera —
arrastrarla dejaría `aplicarSave` con dos `catch` y `cargar` sin ninguno.

Queda así:

```js
function cargar(){try{const d=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(!d)return false;
 return aplicarSave(d);}catch(e){return false;}}
/* Aplica un save a S, venga del disco o del servidor. Incluye a proposito las
   migraciones de partidas antiguas: una foto bajada tambien puede ser vieja. */
function aplicarSave(d){try{
 // <-- aqui van, sin cambios, las lineas 1048..1078 de la version anterior:
 //     desde  S.nombre=d.nombre||"";  hasta  return !!d.nombre;
 }catch(e){return false;}}
```

⚠️ **Se mueve entero, incluidas las dos migraciones** (`hist-europeos` y la cortesía del Capítulo 1),
el bloque `const st=estadoRuta(EXP_ACT)` y el `guardar()` del final. Un `aplicarSave` que se saltara
las migraciones dejaría a un save viejo bajado del servidor sin convertir, **y sin ningún error**.

**Comprobación antes de seguir:** `node --check` no sirve para esto —un corte a medias puede seguir
siendo JavaScript válido, como el `/*` huérfano de la Sesión 75—. Lo que sí sirve es contar: la
función `aplicarSave` debe tener **31 líneas** de cuerpo, y `git diff` sobre `motor.js` debe mostrar
**solo** las líneas de la firma nueva, no las 31 movidas.

- [ ] **Paso 4: Verificar que NADA cambió**

Crear `<scratchpad>/pasos-t2.mjs`:

```js
export default async (ev) => {
  for (const [n, ruta] of [['8','/juego/'],['7','/7mo/'],['3','/3ro/']]) {
    await ev.ir('http://localhost:8765' + ruta);
    await ev.espera(2200);
    const r = await ev(`(()=>{
      S.nombre='Test'; S.xp=123; S.monedas=45; S.skins=['kimun-astronauta'];
      S.logros.add('primer-nivel'); guardar();
      const enDisco = localStorage.getItem(SAVE_KEY);
      const armado  = JSON.stringify(payloadSave());
      S.xp=0; S.monedas=0; S.nombre='';
      const volvio = cargar();
      return JSON.stringify({iguales: enDisco===armado, volvio, xp:S.xp, monedas:S.monedas});
    })()`);
    console.log(n + 'o  ' + r);
  }
  console.log('excepciones:', ev.consola.filter(l=>l.includes('EXCEPCION')).length);
  console.log('fallos de red:', ev.fallos.length);
};
```

Correr:

```
python -m http.server 8765 &
node scripts/cdp.mjs about:blank <scratchpad>/pasos-t2.mjs
```

Esperado, en los tres:

```
8o  {"iguales":true,"volvio":true,"xp":123,"monedas":45}
7o  {"iguales":true,"volvio":true,"xp":123,"monedas":45}
3o  {"iguales":true,"volvio":true,"xp":123,"monedas":45}
excepciones: 0
fallos de red: 0
```

`iguales:true` es lo que prueba que el refactor no cambió la forma del save.

---

## Task 3: Subir la foto

**Files:**
- Modify: `assets/js/motor.js` (agregar tras `sincronizarXP()`, ~línea 1096; y una llamada en `guardar()`)

- [ ] **Paso 1: Agregar el estado y `subirProgreso()`**

Después de la función `sincronizarXP()`:

```js
/* ── Progreso en el servidor ─────────────────────────────────────────────────
   Sube una FOTO completa, no eventos, y por eso NO necesita la cola de reintentos
   que si necesita dominio: el proximo envio que llegue lleva todo.             */
let _progTimer=null, _progUlt=0, _progEnviado=null;

function subirProgreso(){
 if(!SB||!MI_PERFIL) return;
 /* ⚠️ NO se sube en EFIMERO, y esta es la diferencia deliberada con el XP.
    El XP es un numero que solo sube; la FOTO es un REEMPLAZO COMPLETO. Abrir
    ?qa=1 en un telefono vinculado a un alumno real, completar una etapa para
    revisar algo y que eso suba, le PISA LA PARTIDA DEL ANO. */
 if(EFIMERO) return;
 if(_progTimer) return;                     // ya hay un envio programado
 const espera=Math.max(0,15000-(Date.now()-_progUlt));
 _progTimer=setTimeout(async ()=>{
  _progTimer=null; _progUlt=Date.now();
  const json=JSON.stringify(payloadSave());
  if(json===_progEnviado) return;           // guardar() corre en CADA respuesta
  try{
   const {error}=await SB.rpc('kimun_progreso_subir',{p_datos:JSON.parse(json)});
   if(error) throw error;
   _progEnviado=json;
  }catch(e){ console.error('progreso:',e.message||e); }   // best-effort: no interrumpe
 }, espera);
}
```

- [ ] **Paso 2: Engancharla a `guardar()`**

En `guardar()`, cambiar `sincronizarXP();` por `sincronizarXP();subirProgreso();`.

- [ ] **Paso 3: Verificar que sube una vez y no dos, y que QA no sube**

Crear `<scratchpad>/pasos-t3.mjs`:

```js
export default async (ev) => {
  for (const [modo, url] of [['normal','/3ro/'], ['qa','/3ro/?qa=1']]) {
    await ev.ir('http://localhost:8765' + url);
    await ev.espera(2200);
    const r = await ev(`(()=>{
      const llam=[]; SB.rpc=(f,a)=>{llam.push(f); return Promise.resolve({data:null,error:null});};
      MI_PERFIL={id:'x'};
      S.nombre='Test'; S.xp=1; guardar();
      S.xp=2; guardar();                         // dos guardar() seguidos
      return JSON.stringify({programado:_progTimer!==null, efimero:EFIMERO});
    })()`);
    await ev.espera(16000);                      // pasa el rebote de 15 s
    const subidas = await ev(`(()=>window.__subs||0)()`);
    console.log(modo, r, 'subidas tras el rebote:', subidas);
  }
};
```

> Nota para quien ejecute: para contar las subidas, el doble de `SB.rpc` debe llevar
> `if(f==='kimun_progreso_subir') window.__subs=(window.__subs||0)+1;` antes del `return`.

Esperado:

- `normal` → `{"programado":true,"efimero":false}` y **`subidas tras el rebote: 1`** (dos
  `guardar()` producen **una** subida).
- `qa` → `{"programado":false,"efimero":true}` y **`subidas tras el rebote: 0`**.

El `0` de QA es la comprobación que protege la partida de un alumno real.

---

## Task 4: Bajar la foto y rutear los dos caminos automáticos

**Files:**
- Modify: `assets/js/motor.js` (tras `subirProgreso()`)
- Modify: `juego/index.html`, `7mo/index.html`, `3ro/index.html` (el canje y el arranque)

- [ ] **Paso 1: Los helpers, en `motor.js`**

```js
/* Resumen comparable de un save, para decidir si hay conflicto y para pintarlo.
   "capitulos" cuenta las rutas cuyo ULTIMO nodo (el jefe) esta vencido. */
function resumenAvance(d){
 if(!d) return null;
 const rutas=(d.rutas&&typeof d.rutas==='object')?d.rutas:{};
 let caps=0;
 for(const k in rutas){
  const p=rutas[k]&&rutas[k].progreso;
  if(Array.isArray(p)&&p.length&&p[p.length-1]&&p[p.length-1].est==='done') caps++;
 }
 return {xp:d.xp||0, capitulos:caps, monedas:d.monedas||0,
         skins:Array.isArray(d.skins)?d.skins.length:0};
}
function hayAvance(r){ return !!r && (r.xp>0 || r.capitulos>0); }

function haceCuanto(iso){
 const dias=Math.floor((Date.now()-new Date(iso).getTime())/86400000);
 if(!isFinite(dias)||dias<0) return '';
 if(dias===0) return 'hoy';
 if(dias===1) return 'ayer';
 if(dias<30)  return 'hace '+dias+' días';
 const m=Math.floor(dias/30);
 return m===1?'hace un mes':'hace '+m+' meses';
}
```

- [ ] **Paso 2: `bajarProgreso()` y `aplicarProgresoRemoto()`**

```js
let PROG_REMOTO=null;                       // {datos, fecha, xpServidor}
/* Las claves se derivan de SAVE_KEY para no repetir SUFIJO, que vive en el fork. */
function claveBajado(){ return SAVE_KEY+'_bajado'; }
function clavePrevio(){ return SAVE_KEY+'_previo'; }
function yaBajo(){ try{ return localStorage.getItem(claveBajado())==='1'; }catch(e){ return false; } }
function marcarBajado(){ try{ localStorage.setItem(claveBajado(),'1'); }catch(e){} }

/* Devuelve true si tomo la pantalla (hay conflicto y hay que esperar al usuario).
   xpServidor: lo que devolvio kimun_xp en el canje. El XP lo manda el SERVIDOR. */
async function bajarProgreso(xpServidor){
 if(!SB||!MI_PERFIL||EFIMERO) return false;
 try{
  const {data,error}=await SB.rpc('kimun_progreso_bajar');
  if(error) throw error;
  const fila=Array.isArray(data)?data[0]:data;
  if(!fila||!fila.datos){                   // servidor vacio: sube lo que hay aqui
   marcarBajado(); _progEnviado=null; subirProgreso(); return false;
  }
  PROG_REMOTO={datos:fila.datos, fecha:fila.actualizado, xpServidor:xpServidor};
  if(!hayAvance(resumenAvance(payloadSave()))){   // telefono recien empezado
   aplicarProgresoRemoto(); return false;
  }
  mostrarConflictoProgreso(); return true;        // ambos con avance: preguntar
 }catch(e){ console.error('progreso:',e.message||e); return false; }
 /* Si la RPC falla NO se marca como bajado: se reintenta al abrir el juego.
    Sin eso, un fallo de red se lleva la promesa en silencio. */
}

function aplicarProgresoRemoto(){
 const d=PROG_REMOTO&&PROG_REMOTO.datos; if(!d) return;
 try{ localStorage.setItem(clavePrevio(), JSON.stringify(payloadSave())); }catch(e){}
 const alumno=S.alumno, curso=S.curso;      // vienen del canje recien hecho, no de la foto
 aplicarSave(d);
 S.alumno=alumno; S.curso=curso;
 /* ⚠️ El XP lo manda el SERVIDOR, no la foto. Si no, una foto vieja con 900 XP
    deshace sola la correccion que el profesor hizo con kimun_prof_xp_fijar. */
 if(typeof PROG_REMOTO.xpServidor==='number') S.xp=PROG_REMOTO.xpServidor;
 marcarBajado(); PROG_REMOTO=null;
 _progEnviado=null; guardar(); refreshHud();
}
```

- [ ] **Paso 3: Enganchar el canje, en los tres forks**

En `<curso>/index.html`, capturar lo que devuelve `kimun_xp`. Ancla exacta:

```js
   await SB.rpc('kimun_xp',{p_xp:S.xp});        // conserva el avance local
```

pasa a:

```js
   const rxp=await SB.rpc('kimun_xp',{p_xp:S.xp});   // conserva el avance local
```

Y el remate del canje. Ancla exacta:

```js
   setTimeout(cambioModo?recargarPorModo:cerrarCanje,1600);
```

pasa a:

```js
   // El XP autoritativo es el que acaba de devolver el servidor, no el de la foto.
   const tomo=await bajarProgreso(typeof rxp.data==='number'?rxp.data:null);
   if(tomo) return;                          // la pantalla de conflicto se encarga
   setTimeout(cambioModo?recargarPorModo:cerrarCanje,1600);
```

- [ ] **Paso 4: El reintento al arrancar, en los tres forks**

Ancla exacta, dentro del bloque `setTimeout(async …, 1200)`:

```js
  revisarDificil();   // sincroniza la marca 🔥 y otorga premios de Difícil ya logrados
```

pasa a:

```js
  revisarDificil();   // sincroniza la marca 🔥 y otorga premios de Difícil ya logrados
  // Si la bajada del progreso fallo al canjear (o quedo a medias), se reintenta aqui.
  if(p.codigo_acceso && !yaBajo()) bajarProgreso(null);
```

- [ ] **Paso 5: Verificar los dos caminos automáticos**

Crear `<scratchpad>/pasos-t4.mjs` con dos casos, en los tres cursos:

```js
const FOTO = {nombre:'Ana',avatar:'🦊',xp:900,monedas:1240,skins:['kimun-mago','kimun-ninja'],
  logros:[],rutaActual:null,rutas:{},campañasCompletas:[],insignias:[],insigniaActiva:null,
  calc:null,curso:null,alumno:'Ana',maestro:false,mateLecciones:{},metasVistas:{},semaforo:{}};

export default async (ev) => {
  for (const [n, ruta] of [['8','/juego/'],['7','/7mo/'],['3','/3ro/']]) {
    // Caso A: servidor VACIO -> sube lo local, no pinta nada
    await ev.ir('http://localhost:8765' + ruta); await ev.espera(2200);
    const a = await ev(`(()=>{
      window.__subs=0;
      SB.rpc=(f)=>{ if(f==='kimun_progreso_subir') window.__subs++;
                    return Promise.resolve({data:(f==='kimun_progreso_bajar'?[]:null),error:null}); };
      MI_PERFIL={id:'x'}; S.nombre='Test'; S.xp=50;
      return bajarProgreso(50).then(t=>JSON.stringify({tomo:t, bajado:yaBajo()}));
    })()`);
    // Caso B: servidor CON foto y telefono recien empezado -> baja en silencio
    await ev.ir('http://localhost:8765' + ruta); await ev.espera(2200);
    const b = await ev(`(()=>{
      SB.rpc=(f)=>Promise.resolve({data:(f==='kimun_progreso_bajar'
        ? [{datos:${JSON.stringify(FOTO)}, actualizado:new Date(Date.now()-3*86400000).toISOString()}]
        : null), error:null});
      MI_PERFIL={id:'x'}; S.alumno='Pedro'; S.xp=0; S.monedas=0; S.rutas={};
      return bajarProgreso(500).then(t=>JSON.stringify(
        {tomo:t, xp:S.xp, monedas:S.monedas, alumno:S.alumno, skins:S.skins.length}));
    })()`);
    console.log(n + 'o  A=' + a + '  B=' + b);
  }
  console.log('excepciones:', ev.consola.filter(l=>l.includes('EXCEPCION')).length);
};
```

Esperado, en los tres:

```
8o  A={"tomo":false,"bajado":true}  B={"tomo":false,"xp":500,"monedas":1240,"alumno":"Pedro","skins":2}
```

Lo que cada número prueba:

| | |
|---|---|
| `A.tomo:false` | Con el servidor vacío no aparece ninguna pantalla |
| `B.monedas:1240` | La foto sí se aplicó |
| **`B.xp:500`, no 900** | ⚠️ **El XP lo mandó el servidor, no la foto.** Es la comprobación que protege la corrección del profesor |
| **`B.alumno:"Pedro"`, no "Ana"** | La foto **no** pisó la identidad del canje recién hecho |

---

## Task 5: La pantalla de conflicto

**Files:**
- Modify: `juego/index.html`, `7mo/index.html`, `3ro/index.html` (CSS + HTML, idénticos)
- Modify: `assets/js/motor.js` (`mostrarConflictoProgreso()`)

- [ ] **Paso 1: El CSS, en los tres forks**

Insertar en el `<style>`, **justo después** de la regla `.res-sem-msg{…}`:

```css
#progComp{display:flex;gap:10px;margin:14px 0 18px}
.prog-col{flex:1;min-width:0;background:#00000033;border:1px solid #ffffff1f;border-radius:14px;padding:12px 10px}
.prog-col h4{margin:0 0 6px;font-size:12px;font-weight:900;color:var(--gold);text-transform:uppercase;letter-spacing:.03em}
.prog-col p{margin:0;font-size:13px;font-weight:800;line-height:1.5}
#scr-progreso .btn{margin-top:8px}
```

> `.meta-card`, `.meta-ic` y `.meta-kick` **se reusan tal cual**: desde la Sesión 74 son selectores
> sueltos y ya no están anclados a `#scr-meta`, así que heredan bien en una pantalla nueva. Ese
> mismo defecto —un estilo anclado al id de otra pantalla— dejó `scr-pred` sin caja al nacer, y no
> lo delató ningún conteo.

- [ ] **Paso 2: El HTML, en los tres forks**

Insertar **justo después** del cierre de `</section>` de `scr-pred`:

```html
  <section class="screen" id="scr-progreso">
    <div class="meta-card">
      <span class="meta-ic">🎒</span>
      <div class="meta-kick">Encontramos tu avance guardado</div>
      <p class="meta-frase">¿Cuál quieres usar?</p>
      <div id="progComp">
        <div class="prog-col"><h4 id="progRemTit">Guardado</h4><p id="progRemDatos"></p></div>
        <div class="prog-col"><h4>Este teléfono</h4><p id="progLocDatos"></p></div>
      </div>
      <button class="btn" id="progUsarRem">Usar el guardado</button>
      <button class="btn" id="progUsarLoc">Seguir con este teléfono</button>
    </div>
  </section>
```

Los dos botones son `.btn` **a propósito**: pesan igual, y no hay uno por defecto que destruya en
silencio.

- [ ] **Paso 3: `mostrarConflictoProgreso()` en `motor.js`**

```js
function mostrarConflictoProgreso(){
 const rRem=resumenAvance(PROG_REMOTO.datos), rLoc=resumenAvance(payloadSave());
 const linea=r=>'Nivel '+(Math.floor(r.xp/XP_POR_NIVEL)+1)+' · '+r.capitulos+
   (r.capitulos===1?' capítulo':' capítulos')+'<br>'+r.monedas+' monedas · '+
   r.skins+(r.skins===1?' skin':' skins');
 const cuando=haceCuanto(PROG_REMOTO.fecha);
 $('progRemTit').textContent='Guardado'+(cuando?' ('+cuando+')':'');
 $('progRemDatos').innerHTML=linea(rRem);
 $('progLocDatos').innerHTML=linea(rLoc);
 $('progUsarRem').onclick=()=>{ aplicarProgresoRemoto(); cerrarCanje(); };
 $('progUsarLoc').onclick=()=>{
  /* El que pierde tambien se guarda: 10 KB de seguro contra un reclamo. */
  try{ localStorage.setItem(clavePrevio(), JSON.stringify(PROG_REMOTO.datos)); }catch(e){}
  marcarBajado(); PROG_REMOTO=null;
  _progEnviado=null; guardar();            // pisa el servidor con lo de este telefono
  cerrarCanje();
 };
 go('scr-progreso');
}
```

- [ ] **Paso 4: Verificar las dos ramas y que el perdedor quedó guardado**

Crear `<scratchpad>/pasos-t5.mjs`, en los tres cursos, con una foto remota (xp 900, 1240 monedas,
2 skins) y un teléfono con avance (xp 400, 310 monedas, 1 skin). Comprobar, para cada rama:

```
rama "usar el guardado":   pantalla=scr-progreso -> monedas=1240, respaldo tiene monedas=310
rama "seguir con este":    pantalla=scr-progreso -> monedas=310,  respaldo tiene monedas=1240
```

Y **mirando la captura, no el conteo** (`ev.movil(375,667)` + `ev.foto()`): que las dos columnas
caben, que ningún texto se corta y que **los dos botones se ven enteros**. Este proyecto ya tropezó
tres veces con una pantalla que medía bien y se veía mal — la Sesión 59 con las franjas climáticas,
la 74 con el reloj tapado y la 77 con el botón JUGADOR cortado.

---

## Task 6: Verificación integral

**Files:** ninguno — solo se corre.

- [ ] **Paso 1: Regresión en los tres cursos**

Crear `<scratchpad>/pasos-t6.mjs` que, por curso, juegue **una etapa real con clics de verdad** y
reporte:

```
8o  motor:true  exps:20  guardado8:777XP  claves:3
7o  motor:true  exps:23
3o  motor:true  exps:27
excepciones: 0   fallos de red: 0
```

Debe sembrar una partida en 8° (777 XP), jugar en 7° y 3°, volver a 8° y confirmar que **sigue
intacta** y que las tres claves de disco conviven.

- [ ] **Paso 2: Que el juego sobreviva sin conexión**

Con `SB.rpc` devolviendo siempre `{data:null,error:{message:'network'}}`: jugar una etapa completa.
Esperado: **se juega igual, cero excepciones**, y solo aparecen los `console.error('progreso:…')`
que son best-effort por diseño.

- [ ] **Paso 3: Que el tope de 64 KB rechace**

Contra Supabase de verdad, desde la consola del navegador con una sesión anónima:

```js
await SB.rpc('kimun_progreso_subir',{p_datos:{basura:'x'.repeat(70000)}})
```

Esperado: `error` con `progreso_muy_grande`. Y con un payload normal, `error:null`.

- [ ] **Paso 4: Actualizar la documentación**

- `CLAUDE.md`: en la sección de Backend, la tabla `progreso` y las dos funciones; y **corregir el
  límite conocido** que hoy dice *«el progreso de campañas y las skins siguen siendo del aparato, no
  del alumno»*, que deja de ser cierto.
- `pendiente.md`: cerrar **D1, D2, D3 y D4** — D4 se cierra sin código y conviene decir por qué.
- `docs/comercial.md`: ahora **sí** se puede decir que el avance se recupera al cambiar de teléfono.
  ⚠️ Y sigue **sin** poder decirse que funciona sin conexión: eso lo daría el service worker, que no
  existe.

---

## Orden de publicación

**El esquema primero, en su propio momento.** No hay ningún `drop function` sobre una firma en uso
—las dos funciones son nuevas—, así que el riesgo es bajo. Pero si el cliente sale antes, la bajada
al canjear falla hasta el reintento del arranque.

Después, **un solo push** con `motor.js` y los tres forks. `motor.js` no admite respaldo vacío, así
que si en algún momento se separa en dos pushes, va **primero** — es la regla de las Sesiones 75 y
76.
