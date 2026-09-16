# Modo docente (proyectar en clase) — Diseño

## Problema

El profesor necesita **jugar VULPO completo desde su PC para proyectar en clase** (cualquier
nivel y asignatura), sin distribuir un código y sin ensuciar datos. Hoy no existe un modo así:
`?qa=1` marca las respuestas y guarda; los enlaces de muestra (`?solo=`) son acotados y sin
menú completo; un código `ALU-` guarda avance y crea perfil.

## Decisión (Roberto, 16/09/2026)

- Se entra **desde `profesor.html`** (el profe ya se loguea con correo/contraseña): un botón
  **"🎮 Proyectar en clase"** + un **selector de nivel** (3°–8°).
- **Gateado (Opción B):** el panel genera un **token temporal de 6 horas**; el juego lo **valida
  contra Supabase** antes de entrar. Así el modo docente queda **solo para profesores logueados**
  y los links **caducan solos**.
- **Web** (no la app por ahora; la app necesitaría un `.aab` nuevo).

> ⚠️ **Honestidad (ya documentada para toda la puerta):** es "blando" contra alguien
> **determinado** —el juego es estático, si el navegador lo muestra se puede extraer—. Lo que B
> logra, y es el riesgo REAL, es cortar el **compartir casual**: nadie sin cuenta de profe lo
> activa, y el link se vence en 6 h. No es DRM; es una barrera contra que se comparta "el truco
> del juego gratis".

## Comportamiento del modo docente

Todo desbloqueado (capítulos, jefes, mini-clases, niveles del Reto), **no guarda NADA** (ni
`localStorage` ni Supabase; no crea perfil, no toca XP/ranking/panel), **NO marca las respuestas**
(se juega el quiz de verdad con los alumnos), **menú completo** (todas las asignaturas, tienda),
**pasa la puerta** (funciona también después del 1/10), **sin intro**.

Es como `?qa=1` pero **sin marcar respuestas y sin guardar**: reúsa los flags que ya existen.

## Backend (`supabase/schema.sql`)

Un bloque cohesivo (tabla + 2 funciones), modelado sobre la maquinaria de `inscripciones`:

- **Tabla `docente_tokens`** `(token uuid pk default gen_random_uuid(), profesor_id uuid → profesores
  on delete cascade, expira timestamptz, creado timestamptz)`. RLS activo, **sin políticas** (nada
  se lee directo, como el resto del esquema).
- **`kimun_prof_docente_link()` → uuid** — la llama el **panel** (profe autenticado). Verifica que
  es profesor con `kimun_prof_yo()` (fila en `profesores` = autorizado; **cualquier** profe
  autorizado, no solo admin: proyectar es tarea de todo docente); borra los vencidos; inserta un
  token con `expira = now() + interval '6 hours'`; lo devuelve. `security definer`. Grant a
  authenticated (va en la lista de grants con los demás `kimun_prof_*`).
- **`kimun_docente_ok(p_token uuid) → boolean`** — la llama el **juego** (sesión anónima).
  `select exists(select 1 from docente_tokens where token = p_token and expira > now())`. **No
  devuelve ningún dato.** `language sql security definer`. Grant a anon + authenticated.

## Panel (`profesor.html`)

- Botón **"🎮 Proyectar en clase"** + `<select>` de nivel (patrón de `NIVELES_MUESTRA`, `value=n.ruta`),
  **visible a cualquier profesor logueado** (no gateado por admin/operador — es tarea de todo docente).
- `onclick`: `SB.rpc('kimun_prof_docente_link')` → token → abre
  `location.origin + <ruta> + '?docente=' + token` en **pestaña nueva**.

## Juego (`assets/js/motor.js` + los 6 forks)

Flags por fork (byte a byte iguales entre forks):
- `const DOCENTE_TOKEN = _PARAMS.get('docente') || '';`
- `const DOC_OK_KEY = 'kimun_docente_ok';`
- `const DOCENTE = !!DOCENTE_TOKEN && sessionStorage.getItem(DOC_OK_KEY) === DOCENTE_TOKEN;`
  (verdadero solo si ese token ya se validó en esta pestaña → const de carga, síncrona).
- Composición: `JEFES_ABIERTOS`, `LECC_ABIERTAS`, `EFIMERO`, `SIN_DISCO`, `CAPS_ABIERTOS` suman
  `|| DOCENTE`. **`QA_MARCA` NO** (no marca).

`motor.js`:
- `bloqueado()` suma `&& !(typeof DOCENTE!=='undefined' && DOCENTE)` — **con `typeof`**, porque un
  fork cacheado viejo durante el deploy podría no declarar `DOCENTE` (lección de `HAY_CIVICA`/`LECC_ABIERTAS`).
- **`arrancarModoDocente()`** (nueva): `S.nombre='Docente'`, `renderExpediciones()` (menú completo),
  nav visible.

Arranque por fork (patrón de "validar y recargar una vez", como `sincronizarModoCurso`):
- Si `DOCENTE` (ya validado) → `setTimeout(arrancarModoDocente,0)`.
- Si `DOCENTE_TOKEN` presente y NO validado → mostrar una pantalla **"Validando acceso docente…"**,
  llamar `SB.rpc('kimun_docente_ok',{p_token:DOCENTE_TOKEN})`:
  - válido → `sessionStorage[DOC_OK_KEY]=DOCENTE_TOKEN` y **recargar una vez** (guard en
    sessionStorage para no recargar en bucle). En la recarga, `DOCENTE=true` y entra al modo.
  - inválido/vencido/sin conexión → juego normal (con un aviso breve).

## Despliegue / rama

Feature de la **web** → llega a `vulpo.cl` con el **merge `feature/android` → `main`**. Se construye
en `feature/android` (rama actual, con el fix del restore). El **backend** (`schema.sql`) se aplica a
producción cuando Roberto lo pegue (aditivo, inocuo hasta que el panel/juego lo usen). El panel y el
juego se verifican **localmente** con el doble (`panel-demo.py`) y `cdp.mjs`; el uso en vivo espera el merge.

## Verificación

- **Backend:** control positivo/negativo contra producción tras aplicar (`kimun_docente_ok` con un
  uuid random → `false`; una función inventada → 404).
- **Panel** (doble con stub de las 2 RPC): el botón genera el token y arma la URL correcta por nivel.
- **Juego** (cdp.mjs, jugando): con token válido entra en modo docente (todo abierto, **no marca**,
  **no guarda**, no crea perfil, menú completo, pasa la puerta); con token inválido/vencido → juego
  normal; **los 6 forks byte a byte iguales**; sin regresión (JUGADOR navega, `__MOTOR_OK`).
