# Runbook — Aplicar y verificar la foto semanal del desempeño

## Registro

| Fecha | Qué se hizo | Verificado |
|---|---|---|
| **2026-08-27** | Roberto pegó `supabase/aplicar-foto-semanal.sql` | — |
| **2026-08-28** | Comprobación del agendamiento | **Sí: `count(*) from cron.job` = 1.** El trabajo está agendado. La primera foto la toma solo el lunes 31/08/2026 (etiquetada con el domingo 30/08); hasta entonces las tablas están vacías, y eso es lo esperado. |

> **No sembrar la primera foto a mano.** Los `insert` llevan `on conflict do nothing`: una foto
> sembrada antes del lunes se etiqueta con el mismo domingo y deja la corrida real sin efecto,
> congelando la semana con datos parciales.

**Qué es:** un trabajo de `pg_cron` (`foto-semanal`) que cada **lunes 04:05 UTC**
(00:05 / 01:05 del lunes en Chile según el horario) ejecuta
`kimun_foto_semanal()`, copiando los contadores de `dominio` y el XP de los
alumnos a `dominio_semanal` y `xp_semanal`, sellados con el domingo que cierra.

**Por qué es bloqueante:** `dominio` solo guarda acumulados, sin historial. Sin
estas fotos es imposible responder "¿cómo le fue al curso la semana pasada?", y
**el historial NO se puede reconstruir hacia atrás**: cada semana sin el trabajo
agendado se pierde para siempre.

**Estado actual:** el código está en `supabase/schema.sql` (Sesión 36) pero el
trabajo **no está agendado en Supabase todavía**, a la espera de tener datos
reales (hoy el curso demo `CUR-BA04` y las cuentas `profe-prueba*` son de prueba).

> ⚠️ **La trampa a evitar:** el bloque que agenda el trabajo (`schema.sql`, cerca
> de la línea 1371) **falla en silencio si `pg_cron` no está habilitado** — para
> que una migración nunca aborte a medias. Es decir, puedes pegar el `schema.sql`
> entero, no ver ningún error, y que el trabajo **no haya quedado agendado**. Por
> eso el paso de verificación (abajo) **no es opcional**.

---

## Camino corto (recomendado): un solo pegado

Pega **`supabase/aplicar-foto-semanal.sql`** completo en el SQL Editor y ejecútalo.
Ese archivo habilita `pg_cron`, agenda el trabajo y **se verifica solo**: devuelve
cuatro filas que deben empezar con `ok`. Como habilita la extensión *antes* de
agendar, la trampa del silencio (abajo) no puede ocurrir.

Si alguna fila dice `FALTA: aplica primero supabase/schema.sql`, aplica el esquema y
vuelve a pegar este archivo.

El procedimiento largo de abajo queda como referencia, y sigue siendo válido.

---

## Procedimiento largo (paso a paso)

### 1. Habilitar la extensión `pg_cron`
Supabase → **Database → Extensions** → busca **`pg_cron`** → **Enable**.
(Una sola vez por proyecto. Sin esto, el trabajo no se agenda.)

### 2. Re-pegar `supabase/schema.sql` completo
En el **SQL Editor**, pega el archivo entero y ejecútalo. Es idempotente. El
bloque `do $$ … cron.schedule('foto-semanal', '5 4 * * 1', …) … $$` se ejecuta al
pegarlo: si `pg_cron` ya está habilitado (paso 1), **agenda el trabajo solo**.

### 3. VERIFICAR que el trabajo quedó agendado (paso obligatorio)
```sql
select count(*) from cron.job where jobname = 'foto-semanal';
```
**Debe devolver 1.**
- Si da **1** → quedó agendado. Sigue al paso 4.
- Si da **0** → `pg_cron` no estaba habilitado cuando pegaste el esquema. Vuelve
  al **paso 1**, luego repite el **paso 2** y este **paso 3**.

Para ver el detalle del trabajo (horario y comando):
```sql
select jobname, schedule, command, active from cron.job where jobname = 'foto-semanal';
-- schedule esperado: '5 4 * * 1'  ·  command: select public.kimun_foto_semanal()
```

### 4. Confirmar que las tablas y la función existen
```sql
select to_regclass('public.dominio_semanal') as t1,
       to_regclass('public.xp_semanal')      as t2;   -- ambas no nulas
select proname from pg_proc where proname = 'kimun_foto_semanal';  -- 1 fila
```

### 5. (Opcional) Sembrar la primera foto a mano, cuando ya haya datos reales
El trabajo agendado tomará la foto el próximo lunes. Si quieres **sembrar la
semana en curso de inmediato** (por ejemplo, el día que arranques con datos
reales), ejecútala una vez en el SQL Editor (corre como dueño, así que el
`revoke` no lo impide):
```sql
select public.kimun_foto_semanal();
-- Verifica que se escribió la foto:
select semana, count(*) as filas from public.dominio_semanal group by semana order by semana;
select semana, count(*) as alumnos from public.xp_semanal   group by semana order by semana;
```
> Ojo: `kimun_foto_semanal('2025-01-01')` **solo cambia la etiqueta** de la foto,
> **no** reconstruye una semana pasada (los contadores de `dominio` son
> acumulados de hoy). No sirve para rellenar hacia atrás.

### 6. El lunes siguiente, confirmar que corrió solo
```sql
select semana, count(*) from public.dominio_semanal group by semana order by semana;
```
Debe aparecer **una segunda `semana`** sin que hayas hecho nada. Con eso queda
demostrado que el trabajo está vivo.

---

## Notas y cuidados

- **Retención:** el mismo trabajo limpia las fotos de más de 2 años. El corte se
  calcula desde `now()` (no desde el parámetro), a propósito, para que una llamada
  con fecha lejana no borre el historial.
- **Borrar un alumno borra sus fotos pasadas** (`on delete cascade` sobre
  `perfiles`): un informe de una semana ya cerrada puede cambiar retroactivamente
  si después se elimina un alumno. Es coherente con la privacidad del proyecto.
- **La función está revocada** de `public`, `anon` y `authenticated`: solo la
  llama `pg_cron` (y el SQL Editor como dueño, para el paso 5). Ningún cliente
  puede dispararla.
- **Es la base del informe semanal por correo**, que se diseñará aparte.

## Referencias
- Implementación: `docs/superpowers/plans/2026-08-23-foto-semanal-desempeno.md` y
  `docs/superpowers/specs/2026-08-23-foto-semanal-desempeno-design.md`.
- Código: `supabase/schema.sql` (tablas `dominio_semanal`/`xp_semanal`, función
  `kimun_foto_semanal`, bloque de agenda `cron.schedule`).
- Bitácora: Sesión 36 en `CLAUDE.md`.
