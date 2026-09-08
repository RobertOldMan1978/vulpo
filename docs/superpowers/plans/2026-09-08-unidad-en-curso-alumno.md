# El semáforo de planificación en el juego del alumno — Plan de implementación

> **Para quien lo ejecute:** SUB-SKILL REQUERIDA: usar superpowers:subagent-driven-development o
> superpowers:executing-plans para implementar tarea por tarea. Los pasos usan casillas `- [ ]`.

**Meta:** que el niño (y su papá, desde el mismo teléfono) vean qué unidad está pasando su curso
esta semana — un semáforo 📖/🕒/📚 sobre los capítulos de la campaña y un renglón en el menú de
asignaturas —, leyendo la planificación que el profesor ya declara.

**Arquitectura:** una función de lectura nueva (`kimun_mi_plan()`) que devuelve solo asignatura,
unidad, título y fechas (sin `nota` ni log); un mapa OA→unidad generado por script; y toda la
lógica de cálculo y pintado **dentro de `assets/js/motor.js`**, que ya contiene
`renderCampaña`/`renderExpediciones`/`nodoCampañaEl`. **Cero ediciones a los seis forks.**

**Tech stack:** PostgreSQL/PL-pgSQL (Supabase), JS de navegador sin framework, Python 3 para el
generador. Verificación con `scripts/cdp.mjs` (Chrome por CDP) y `curl` contra producción.

**Spec:** `docs/superpowers/specs/2026-09-08-unidad-en-curso-alumno-design.md`.

---

## Estructura de archivos

| Archivo | Qué hace | Cambio |
|---|---|---|
| `supabase/schema.sql` | `kimun_mi_plan()` + su grant a `anon, authenticated` | Modificar |
| `scripts/generar-oa-unidad.py` | Genera el mapa OA→unidad desde los `oa.json` curriculares | Crear |
| `assets/plan/oa-unidad.json` | El mapa `{"HI05 OA 01":"U1", …}` (salida del script) | Crear |
| `assets/js/motor.js` | Estado, carga perezosa, pintado del semáforo y del menú, CSS | Modificar |

**Decisión de ubicación (spec §Cuidados técnicos):** el semáforo NO es un módulo nuevo. Extiende
funciones que ya viven en `motor.js`; un módulo aparte tendría que reexponer `renderCampaña` y
`renderExpediciones`. Va en `motor.js`, que es compartido por los seis forks, así que "toca los 6
forks por igual" se cumple sin editar ninguno. `motor.js` es la única pieza sin respaldo vacío
(es el juego), así que el semáforo hereda esa condición: sus guardas evitan cualquier error si el
plan o el mapa no cargan, pero no hay un no-op de reemplazo.

---

## Tarea 1: Backend — `kimun_mi_plan()`

**Archivos:**
- Modificar: `supabase/schema.sql` (insertar la función después de `kimun_mi_curso`, que termina
  en la línea 1885; y agregar el grant en el bloque `grant execute … to anon, authenticated`,
  junto a `public.kimun_mi_curso()` en la línea 2416)

Modela sobre `kimun_mi_curso` (1879-1885): `language sql`, resuelve el curso con `kimun_yo()` →
`perfiles.curso_id` y no recibe parámetros. La restricción de privacidad de la Sesión 108 es el
punto central: **NO expone `nota`, `profesor_id` ni nada de `unidades_plan_log`.**

- [ ] **Paso 1: Insertar la función después de `kimun_mi_curso` (tras la línea 1885)**

```sql

-- La planificación del alumno: su curso, solo lo que el juego necesita para el semáforo.
-- Modela sobre kimun_mi_curso: resuelve el curso con kimun_yo() y no recibe parámetros,
-- así el alumno solo puede ver EL SUYO. Sin curso, el join no da filas y el juego degrada
-- a "sin plan".
-- ⚠️ NO devuelve `nota`, `profesor_id` ni nada del log: el registro de quién movió qué fecha
-- y por qué es material de evaluación docente, solo para la UTP (Sesión 108). La restricción
-- vive en la FIRMA, no en el cliente, así que no se puede deshacer desde el juego. El alumno
-- recibe únicamente asignatura, unidad, título y las dos fechas.
-- El drop previo, como el resto de las "returns table" del archivo: al cambiar una columna
-- del returns algún día, sin él el re-pegado falla con "cannot change return type".
drop function if exists public.kimun_mi_plan();
create or replace function public.kimun_mi_plan()
returns table(asignatura text, unidad text, titulo text, inicio date, termino date)
language sql security definer stable set search_path=public as $$
  select u.asignatura, u.unidad, u.titulo, u.inicio, u.termino
    from public.perfiles p
    join public.unidades_plan u on u.curso_id = p.curso_id
   where p.id = public.kimun_yo();
$$;
```

- [ ] **Paso 2: Agregar el grant.** En el bloque `grant execute on function … to anon,
  authenticated;` (empieza en 2372), agregar una línea junto a `public.kimun_mi_curso()` (línea
  2416). El alumno es una sesión anónima, así que va a `anon` además de `authenticated`:

```sql
  , public.kimun_mi_curso()
  , public.kimun_mi_plan()
```

- [ ] **Paso 3: Comprobar la SINTAXIS del archivo entero** sin aplicarlo (el asistente no ejecuta
  SQL contra producción; lo pega Roberto). Contar que el `drop`/`create`/grant quedaron balanceados:

Run: `grep -n "kimun_mi_plan" supabase/schema.sql`
Expected: exactamente 3 líneas — el `drop`, el `create or replace` y el grant.

- [ ] **Paso 4: Registrar en `docs/aplicar-schema.md`** una fila nueva pendiente (fecha, "S111 ·
  kimun_mi_plan (semáforo del alumno)"), en el formato de tabla que ya usa el archivo — sin línea
  en blanco entre filas (lección de la Sesión 109: un blanco parte la tabla en Markdown).

**Verificación (Roberto pega el esquema; el asistente comprueba contra producción con la clave
pública):**

- [ ] La función existe y su portero corre. Un `anon` sin curso recibe **200 con `[]`** (el join
  no da filas — es de lectura, no lanza), NO un `no_autorizado`. Esto es distinto de las
  `kimun_prof_*`: `kimun_mi_plan` es del alumno y no tiene portero de rol.

```bash
curl -s "$SUPA_URL/rest/v1/rpc/kimun_mi_plan" -X POST \
  -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -d '{}'
# Esperado: []  (una sesión anónima recién creada no tiene curso)
```

- [ ] **Control negativo de existencia:** una función inventada da **404 `PGRST202`**, así que el
  `[]` de arriba prueba que `kimun_mi_plan` está aplicada y no es un eco genérico.

```bash
curl -s "$SUPA_URL/rest/v1/rpc/kimun_mi_plan_inventada" -X POST \
  -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -d '{}'
# Esperado: 404 PGRST202
```

- [ ] **La privacidad, comprobada en la FIRMA** (no solo confiando en el cuerpo): pedir que
  devuelva `nota` da error de columna inexistente, porque la firma no la tiene.

```bash
curl -s "$SUPA_URL/rest/v1/rpc/kimun_mi_plan?select=nota" -X POST \
  -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -d '{}'
# Esperado: error 42703 (column "nota" does not exist) — la función no la expone
```

- [ ] **Commit** (NO hasta la orden 66 de Roberto; este paso queda pendiente de esa orden).

---

## Tarea 2: El mapa OA→unidad — generador y salida

**Archivos:**
- Crear: `scripts/generar-oa-unidad.py`
- Crear: `assets/plan/oa-unidad.json` (salida del script)

El juego no carga `oa.json` y no queremos que lo haga. Este script cruza `unidades[].oa` de cada
banco **curricular** y produce un mapa plano `{"HI05 OA 01":"U1", …}` — mucho más chico que un solo
`oa.json`. El juego lo descarga **solo si su curso tiene plan**.

- [ ] **Paso 1: Escribir el generador.**

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genera assets/plan/oa-unidad.json: {"HI05 OA 01":"U1", ...}

Cruza unidades[].oa de cada banco CURRICULAR (historia/matematicas/ciencias/lenguaje).
Los transversales (vocabulario-*, lectura-*) NO entran: sus códigos (VOC-*, AF-*, CA-*) no
llevan el nivel adentro y NUNCA aparecen en unidades_plan (la planificación es por asignatura
curricular, kimun_prof_asignaturas). Incluirlos solo infla el archivo.

Un OA que pertenece a VARIAS unidades se asigna a la PRIMERA, igual que el mapa de dominio del
panel (Sesión 108: "Se agrupan en la primera"). Así el estado por capítulo sigue tomando el más
activo entre sus OAs, consistente con el panel.

Se regenera cuando cambia un oa.json, como el tablero. Corre desde la raíz del repo.
"""
import json, io, glob, os, re

CURRICULAR = re.compile(r'(historia|matematicas|ciencias|lenguaje)-\dbasico$')

def grupos_de(d):
    # Tolerante como generar-tablero.py: 'unidades' o, en lenguaje-7basico,
    # 'capitulos_del_juego'. Nunca 'unidades_oficiales_del_programa' (no rige el juego).
    return d.get('unidades') or d.get('capitulos_del_juego') or []

def u_id(u):
    return str(u.get('id', u.get('n', ''))).strip()

def main():
    mapa = {}
    carpetas = 0
    for f in sorted(glob.glob('contenido/*/oa.json')):
        car = os.path.basename(os.path.dirname(f))
        if not CURRICULAR.search(car):
            continue
        carpetas += 1
        d = json.load(io.open(f, encoding='utf-8'))
        for u in grupos_de(d):
            uid = u_id(u)
            if not uid:
                continue
            for oa in u.get('oa', []):
                mapa.setdefault(oa, uid)   # primera unidad gana
    if carpetas != 24:
        raise SystemExit('Esperaba 24 bancos curriculares (6 cursos x 4), vi %d' % carpetas)
    salida = 'assets/plan/oa-unidad.json'
    os.makedirs(os.path.dirname(salida), exist_ok=True)
    with io.open(salida, 'w', encoding='utf-8', newline='\n') as w:
        json.dump(dict(sorted(mapa.items())), w, ensure_ascii=False,
                  separators=(',', ':'), indent=0)
        w.write('\n')
    print('%d OA -> unidad, %d bancos, %s' % (len(mapa), carpetas, salida))

if __name__ == '__main__':
    main()
```

- [ ] **Paso 2: Correrlo.**

Run: `python scripts/generar-oa-unidad.py`
Expected: `NNN OA -> unidad, 24 bancos, assets/plan/oa-unidad.json` (del orden de 520-530 OA; el
`assert` de 24 bancos aborta si un `oa.json` cambió de dialecto — es la comprobación que ya mordió
al tablero dos veces).

- [ ] **Paso 3: Verificar el contenido con casos conocidos**, no solo el conteo:

```bash
python -c "import json,io; m=json.load(io.open('assets/plan/oa-unidad.json',encoding='utf-8')); \
print('HI05 OA 01 ->', m.get('HI05 OA 01')); \
print('total:', len(m)); \
print('sin VOC:', not any(k.startswith('VOC') for k in m)); \
print('sin AF:', not any(k.startswith('AF') for k in m))"
# Esperado: HI05 OA 01 -> U1 · total ~520-530 · sin VOC: True · sin AF: True
```

- [ ] **Paso 4: Peso** — confirmar que es chico (debe rondar 12-16 KB, muy por debajo de un
  `oa.json`):

Run: `ls -l assets/plan/oa-unidad.json`
Expected: tamaño < 20000 bytes.

---

## Tarea 3: `motor.js` — estado, carga perezosa y CSS

**Archivos:**
- Modificar: `assets/js/motor.js`

Toda la maquinaria de datos del semáforo, sin tocar todavía el pintado. Se ubica junto a las
funciones de campaña (después de `campañaPorId`, línea 705, antes de `portadaMapa`).

- [ ] **Paso 1: Agregar los globales y las funciones de datos** (insertar tras la línea 705,
  `function campañaPorId…`):

```javascript
/* ================= SEMÁFORO DE PLANIFICACIÓN =================
   El niño ve qué unidad está pasando su curso esta semana. Lee kimun_mi_plan() (la
   planificación que el profesor declara) y la cruza con un mapa OA->unidad generado por
   script. Todo es best-effort: si el plan no carga, o el curso no tiene fechas, o falla la
   red, la pantalla queda EXACTAMENTE como hoy — una feature que le cambia la pantalla a
   quien no la usa, estorba (misma regla del panel, Sesión 110).
   No hay semáforo en modo prueba/armador/QA: son sesiones sin curso ni identidad. */
let PLAN_ESTADO=null;   // null = sin cargar/reintentar · 'sin-plan' = cargado y vacío · {} = hay plan
let OA_UNIDAD=null;     // {"HI05 OA 01":"U1"} — solo se descarga si hay plan
let _planCargando=false;

// Estado de una unidad por sus fechas, igual que el panel (Sesión 110). Fechas 'YYYY-MM-DD'
// (así llegan de un date de Postgres), comparadas como texto = cronológico. Inclusivo: una
// unidad que termina HOY sigue "en clases" hoy y "terminada" mañana.
function estadoDeFechas(inicio,termino,hoy){
 if(termino && termino < hoy) return 'terminada';
 if(inicio  && inicio  > hoy) return 'futura';
 if(inicio || termino)        return 'clases';
 return '';
}

// Carga perezosa: la disparan renderCampaña y renderExpediciones. Una sola vez por sesión
// salvo fallo de red (deja PLAN_ESTADO en null para reintentar en la próxima navegación).
// No se llama desde el arranque del fork a propósito: así no hay ni una línea que editar en
// los seis index.html. Cuando MI_PERFIL aún no está listo (el fork lo resuelve ~1,2 s tras
// cargar), bail SIN marcar el intento, y el próximo render reintenta — el mismo modelo de
// tiempo que ya usa el ranking.
async function cargarPlan(){
 if(PLAN_ESTADO!==null || _planCargando) return;       // ya resuelto (objeto o 'sin-plan')
 if(EFIMERO || SIN_DISCO || !SB || !MI_PERFIL) return;  // prueba/QA/armador o sin perfil: reintenta luego
 _planCargando=true;
 try{
  const {data,error}=await SB.rpc('kimun_mi_plan');
  if(error) throw error;
  const filas=data||[];
  if(!filas.length){ PLAN_ESTADO='sin-plan'; return; } // sin plan: no reintentar, pantalla de hoy
  const r=await fetch('assets/plan/oa-unidad.json');    // solo AHORA se descarga el mapa
  if(!r.ok) throw new Error('mapa');
  OA_UNIDAD=await r.json();
  const est={}, hoy=hoyISO();
  filas.forEach(f=>{ est[f.asignatura+'|'+f.unidad]=
    {estado:estadoDeFechas(f.inicio,f.termino,hoy), titulo:f.titulo||''}; });
  PLAN_ESTADO=est;
  // Repinta la pantalla activa si es el menú o una campaña: la carga terminó después de
  // dibujarla, y sin esto el semáforo no aparecería hasta la próxima navegación.
  const on=document.querySelector('.screen.on');
  if(on && on.id==='scr-expediciones') renderExpediciones();
  else if(on && on.id==='scr-campana' && CAMP_ACT) renderCampaña();
 }catch(e){ /* best-effort: PLAN_ESTADO sigue null, reintenta; nunca impide jugar */ }
 finally{ _planCargando=false; }
}

// ¿Hay plan cargado y con filas? (ni null ni el centinela 'sin-plan')
function hayPlan(){ return PLAN_ESTADO && typeof PLAN_ESTADO==='object'; }

// Estado de un capítulo: el MÁS ACTIVO entre las unidades de sus OAs (clases > futura >
// terminada), igual que el panel. Devuelve {estado, titulo} o null si no aplica.
function estadoCapitulo(exp){
 if(!hayPlan() || !OA_UNIDAD) return null;
 const rank={clases:3,futura:2,terminada:1};
 let best=null, bestTit='';
 (exp.etapas||[]).forEach(et=>{
  const oas=et.oas||(et.oa&&et.oa!=='BOSS'?[et.oa]:[]);   // BOSS mezcla OA: se usan las etapas normales
  oas.forEach(oa=>{
   const uni=OA_UNIDAD[oa]; if(!uni) return;
   const asig=oa.split(' OA ')[0];                        // 'HI05 OA 01' -> 'HI05'
   const info=PLAN_ESTADO[asig+'|'+uni];
   if(!info || !info.estado) return;
   if(!best || rank[info.estado]>rank[best]){ best=info.estado; bestTit=info.titulo; }
  });
 });
 return best ? {estado:best, titulo:bestTit} : null;
}

// Inyecta el CSS del semáforo una sola vez. motor.js no tiene una hoja de estilo global del
// juego (esa vive en los forks), así que el semáforo se trae la suya, como cualquier módulo.
function _cssSemaforo(){
 if(document.getElementById('css-semaforo')) return;
 const st=document.createElement('style'); st.id='css-semaforo';
 st.textContent=
  /* Solo "en clases" lleva acento dorado: es lo único accionable, y la mirada del niño debe
     caer ahí. Los otros dos van suaves (contexto para el papá). Sin animación: es un borde,
     no un parpadeo (respeta prefers-reduced-motion sin esfuerzo). */
  '.camp-nodo.sem-clases{border-color:var(--gold);box-shadow:0 0 0 1px var(--gold),0 4px 18px #ffc93c33}'+
  '.cn-sem{display:block;margin-top:3px;font-size:12px;opacity:.7}'+
  '.camp-nodo.sem-clases .cn-sem{color:var(--gold);opacity:1;font-weight:800}'+
  '.exp-sem{display:block;margin-top:3px;font-size:12px;color:var(--gold);font-weight:700}';
 document.head.appendChild(st);
}
```

- [ ] **Paso 2: `node --check` sobre el script del fork más grande** para confirmar que no rompí
  la sintaxis de `motor.js` (se prueba embebiéndolo; o directamente):

Run: `node --check assets/js/motor.js`
Expected: sin salida (sintaxis OK).

- [ ] **Paso 3: Verificar en el navegador que el motor sigue vivo** (aún sin efecto visible):

Run: `node scripts/cdp.mjs about:blank <pasos que abren 8vo, tocan JUGADOR y leen __MOTOR_OK>`
Expected: `__MOTOR_OK` en `true`, JUGADOR navega a `scr-expediciones`, cero errores de consola.

---

## Tarea 4: `motor.js` — pintar el semáforo en la campaña

**Archivos:**
- Modificar: `assets/js/motor.js` (`renderCampaña`, 895-938)

- [ ] **Paso 1: Agregar `aplicarSemaforo`** (justo antes de `nodoCampañaEl`, línea 952):

```javascript
// Marca un nodo de capítulo con su estado del semáforo. No toca nodoCampañaEl (así
// renderListaPrueba, que también lo usa, queda intacto): post-procesa el nodo ya creado.
function aplicarSemaforo(nodo, exp){
 const s=estadoCapitulo(exp); if(!s) return;
 _cssSemaforo();
 nodo.classList.add('sem-'+s.estado);
 const etq={clases:'👉 Están viendo esto en tu curso',
            terminada:'Ya lo pasaron · repasa',
            futura:'Aún no lo ven'}[s.estado];
 const b=nodo.querySelector('.cn-body');
 if(b && etq){ const l=document.createElement('small'); l.className='cn-sem'; l.textContent=etq; b.appendChild(l); }
}
```

- [ ] **Paso 2: Disparar la carga y aplicar la marca en `renderCampaña`.** En la línea 896, tras
  `const c=CAMP_ACT; if(!c)return;`, agregar la carga perezosa:

Buscar:
```javascript
function renderCampaña(){
 const c=CAMP_ACT; if(!c)return;
```
Reemplazar por:
```javascript
function renderCampaña(){
 const c=CAMP_ACT; if(!c)return;
 cargarPlan();   // perezosa: al terminar repinta esta pantalla si sigue activa
```

- [ ] **Paso 3: Aplicar la marca a cada capítulo.** En el `forEach` de capítulos (903-911), el
  nodo se crea y se hace `appendChild` en una sola expresión. Separarla para post-procesarla.

Buscar:
```javascript
  cont.appendChild(nodoCampañaEl(`${i+1}`, titulo, abierto, hecho,
    abierto?()=>entrarExpedicion(exp):null,
    hecho?'Completado':(abierto?'¡Jugar!':(capAbierto(id)?'🔒 Bloqueado':'🔒 Necesitas un código')),
    portadaMapa(exp), portadaFallback(exp)));
```
Reemplazar por:
```javascript
  const nodoCap=nodoCampañaEl(`${i+1}`, titulo, abierto, hecho,
    abierto?()=>entrarExpedicion(exp):null,
    hecho?'Completado':(abierto?'¡Jugar!':(capAbierto(id)?'🔒 Bloqueado':'🔒 Necesitas un código')),
    portadaMapa(exp), portadaFallback(exp));
  aplicarSemaforo(nodoCap, exp);
  cont.appendChild(nodoCap);
```

Nota: el semáforo va **solo en los capítulos** (`c.capitulos`), no en el Desafío Extra ni en el
Jefe Final ni en el Reto Sin Fin — esos no son unidades del plan.

- [ ] **Paso 4: `node --check`** y verificación en el navegador con un plan simulado. Como
  verificar el semáforo real exige un `ALU-` de un curso con plan, se prueba la ruta completa
  **interceptando `SB.rpc`** para que `kimun_mi_plan` devuelva filas, y dejando que `cargarPlan`
  descargue el `oa-unidad.json` REAL y pinte:

```javascript
// pasos.mjs (esquema): antes de tocar JUGADOR, override de la RPC
await ev(`(()=>{ const orig=SB.rpc.bind(SB);
  SB.rpc=(fn,args)=>fn==='kimun_mi_plan'
    ? Promise.resolve({data:[
        {asignatura:'HI08',unidad:'U1',titulo:'Los inicios de la modernidad',inicio:'2026-03-09',termino:'2026-04-30'},
        {asignatura:'HI08',unidad:'U2',titulo:'Ilustración y revoluciones',inicio:'2026-08-01',termino:'2026-11-30'}
      ],error:null})
    : orig(fn,args);
  window.MI_PERFIL=window.MI_PERFIL||{id:'x'}; 1 })()`);
// …crear perfil, JUGADOR, abrir la campaña de Historia…
```
Expected (MIRANDO la captura, no contando — es la lección repetida del proyecto):
- El capítulo de U2 (agosto→noviembre, futura hoy 08/09) lleva la marca suave "Aún no lo ven".
- El de U1 (marzo→abril, terminada) lleva "Ya lo pasaron · repasa".
- Si se ajusta una fecha a que HOY caiga dentro, ese capítulo sale con **borde dorado** y "👉
  Están viendo esto en tu curso".
- Sin el override (`kimun_mi_plan` real → `[]`): **cero marcas, campaña idéntica a hoy**.

---

## Tarea 5: `motor.js` — el renglón del menú de asignaturas

**Archivos:**
- Modificar: `assets/js/motor.js` (`renderExpediciones`, 720-766)

- [ ] **Paso 1: Agregar el helper** (antes de `renderExpediciones`, junto a `mapasDe`, línea 718):

```javascript
// Título de una unidad EN CLASES de una asignatura (por nombre), o '' si no hay ninguna.
// Recorre los capítulos de esa asignatura y toma el primero cuyo estado sea 'clases'.
function unidadEnClasesDeAsignatura(asig){
 if(!hayPlan()) return '';
 const exps=EXPEDICIONES.filter(e=>e.activa&&e.asignatura===asig);
 for(const exp of exps){ const s=estadoCapitulo(exp); if(s&&s.estado==='clases') return s.titulo; }
 return '';
}
// Agrega el renglón "📖 Están viendo: X" a una tarjeta del menú, si su asignatura tiene una
// unidad en clases. Un solo helper para las dos ramas (mini-clases y campaña normal).
function agregarLineaMenu(card, asig){
 const tit=unidadEnClasesDeAsignatura(asig); if(!tit) return;
 _cssSemaforo();
 const inf=card.querySelector('.exp-info'); if(!inf) return;
 const l=document.createElement('small'); l.className='exp-sem';
 l.textContent='📖 Están viendo: '+tit; inf.appendChild(l);
}
```

- [ ] **Paso 2: Disparar la carga perezosa** al inicio de `renderExpediciones`. Buscar:
```javascript
function renderExpediciones(){
 ajustarNav();
```
Reemplazar por:
```javascript
function renderExpediciones(){
 ajustarNav();
 cargarPlan();   // perezosa: al terminar repinta el menú si sigue activo
```

- [ ] **Paso 3: Llamar `agregarLineaMenu` en las DOS ramas**, justo antes de cada
  `g.appendChild(card)`.

  Rama mini-clases (línea 740). Buscar:
```javascript
   if(bloqueado()) card.classList.add('lock');
   g.appendChild(card); return;
  }
```
Reemplazar por:
```javascript
   if(bloqueado()) card.classList.add('lock');
   agregarLineaMenu(card, asig);
   g.appendChild(card); return;
  }
```

  Rama normal (línea 755-756). Buscar:
```javascript
  if(bloqueado() && asig!=='Historia') card.classList.add('lock');
  g.appendChild(card);
 });
```
Reemplazar por:
```javascript
  if(bloqueado() && asig!=='Historia') card.classList.add('lock');
  agregarLineaMenu(card, asig);
  g.appendChild(card);
 });
```

El módulo Lectura (bib-entry, 759-765) NO recibe línea: es transversal, sin plan.

- [ ] **Paso 4: `node --check`** y verificación en el navegador con el mismo override de la Tarea
  4, pero mirando el MENÚ (`scr-expediciones`) con una unidad en clases:
Expected (mirando la captura): la tarjeta de Historia muestra bajo su subtítulo el renglón dorado
"📖 Están viendo: [título]". Una asignatura sin unidad en clases no muestra nada. Sin override,
cero renglones.

---

## Tarea 6: Verificación integral y no-regresión

**Archivos:** ninguno (solo `scripts/cdp.mjs` y `curl`).

- [ ] **Degradación (el caso más importante):** con `kimun_mi_plan` real devolviendo `[]`, abrir
  el menú y la campaña en 8° — **cero marcas, cero renglones, cero `fetch` a oa-unidad.json**
  (comprobar en la pestaña de red que NO se pide el mapa cuando no hay plan). PLAN_ESTADO queda en
  `'sin-plan'` y no se reintenta.

- [ ] **Modo prueba y QA sin semáforo:** abrir `8vo/?solo=hist-cap1` y `8vo/?qa=1` con el override
  activo — **cero marcas** (cargarPlan bail por `SIN_DISCO`/`EFIMERO`; PLAN_ESTADO nunca deja de
  ser null porque ni siquiera se intenta). Comprobar que `oa-unidad.json` **no se pide** en ninguno
  de los dos.

- [ ] **El caso "más activo":** un capítulo con OAs de dos unidades, una en clases y otra
  terminada, sale **en clases** (override con dos filas, una vigente y una pasada, sobre asignatura
  cuyos capítulos crucen unidades — Lenguaje).

- [ ] **Modo prueba (`renderListaPrueba`) intacto:** `nodoCampañaEl` no cambió de firma, así que la
  lista de prueba se ve igual. Abrir `8vo/?solo=hist-cap1,cien-celula` y confirmar dos grupos sin
  ninguna marca de semáforo.

- [ ] **No-regresión en los seis cursos:** JUGADOR navega, `__MOTOR_OK` true, las cuatro campañas
  abren, el guardado de 8° (sembrar 777 XP) sobrevive, cero 404 y cero errores de consola. Esta es
  la comprobación obligatoria desde que 7° estuvo caído en producción con la consola limpia.

- [ ] **Mirar, no contar:** capturar el nodo "en clases" y confirmar a la vista que el borde
  dorado se distingue de los suaves y que el texto no se recorta — el destacado es visual (la
  lección repetida del proyecto: un conteo dice "sin desborde, cero errores" sobre una pantalla
  rota).

- [ ] **A 375 px:** el renglón del menú y la etiqueta del nodo no desbordan ni aplastan la barra
  de progreso.

---

## Verificación (checklist de cierre)

- [ ] `kimun_mi_plan()` aplicada, con su control positivo (`[]`), negativo (`404`) y de privacidad
  (la firma no expone `nota`).
- [ ] `assets/plan/oa-unidad.json` generado, 24 bancos, sin claves VOC/AF, < 20 KB.
- [ ] Con plan: semáforo en la campaña (dorado solo "en clases") y renglón en el menú.
- [ ] Sin plan / prueba / QA: pantalla idéntica a hoy, sin `fetch` del mapa.
- [ ] Estado "más activo" para un capítulo que cruza unidades.
- [ ] `renderListaPrueba` sin cambios; seis cursos sin regresión; guardado de 8° intacto.
- [ ] Cero fork editado (verificar con `git diff --stat`: solo `schema.sql`, `motor.js`, el script
  y el JSON nuevo — ningún `*/index.html`).
- [ ] Cero errores de consola, cero 404, verificado MIRANDO la captura.

## Fuera de alcance

- El informe del apoderado ("Cómo va"): no se toca (decisión de Roberto, spec).
- Volver a bloquear el orden: sigue libre; esto solo destaca.
- Notificar/empujar al niño desde el inicio.
- Cambiar la planificación del profesor: esta feature solo la lee.
- Nada se commitea hasta la orden 66 de Roberto.
