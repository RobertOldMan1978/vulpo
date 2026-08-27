-- ============================================================================
-- Foto semanal del desempeño — aplicación en UN SOLO pegado
--
-- Qué hace: habilita pg_cron, agenda el trabajo `foto-semanal` (lunes 04:05 UTC =
-- 00:05 o 01:05 del lunes en Chile) y **se verifica solo**, devolviendo una tabla
-- que dice si quedó todo en su lugar.
--
-- Cómo se usa: Supabase → SQL Editor → pegar este archivo COMPLETO → Run.
-- Después mirar el resultado: las 4 filas tienen que decir "ok".
--
-- Por qué existe, si el runbook ya tenía los pasos: el bloque que agenda vive dentro
-- de `schema.sql` y **falla en silencio** cuando pg_cron no está habilitado (a
-- propósito, para que una migración nunca aborte a medias). O sea que se puede pegar
-- el esquema entero, no ver ningún error, y que el trabajo no haya quedado agendado.
-- Este archivo habilita la extensión PRIMERO, así que ese caso no puede ocurrir.
--
-- Requisito: `schema.sql` ya aplicado alguna vez (ahí viven las tablas
-- `dominio_semanal` / `xp_semanal` y la función `kimun_foto_semanal`). Si falta algo,
-- la verificación de abajo lo dice en vez de dejarlo pasar.
--
-- Ojo con el SQL Editor de Supabase: ejecuta todas las sentencias pero **solo muestra
-- el resultado de la última**. Por eso la verificación es UNA consulta con `union all`
-- y no cuatro sueltas.
-- ============================================================================

-- 1) La extensión. Sin esto no hay dónde agendar nada.
create extension if not exists pg_cron;

-- 2) La agenda. Mismo bloque que `schema.sql`, para que re-pegar el esquema más
--    adelante no cambie nada (los dos hacen unschedule + schedule del mismo nombre).
do $$
begin
  if not exists (select 1 from pg_extension where extname = 'pg_cron') then
    raise exception 'pg_cron no quedó habilitado. Habilítalo en Database → Extensions y vuelve a correr este archivo.';
  end if;

  -- Idempotente: sin el unschedule previo, volver a correr esto podría dejar el
  -- trabajo duplicado en versiones antiguas de pg_cron. El exception lo tolera
  -- cuando el trabajo todavía no existe.
  begin
    perform cron.unschedule('foto-semanal');
  exception when others then null;
  end;

  perform cron.schedule('foto-semanal', '5 4 * * 1',
                        'select public.kimun_foto_semanal()');
end $$;

-- 3) La verificación. Las 4 filas deben empezar con "ok".
select 'pg_cron' as parte,
       case when exists (select 1 from pg_extension where extname='pg_cron')
            then 'ok: extensión habilitada'
            else 'FALTA: la extensión no está' end as estado
union all
select 'tablas',
       case when to_regclass('public.dominio_semanal') is not null
             and to_regclass('public.xp_semanal') is not null
            then 'ok: dominio_semanal y xp_semanal existen'
            else 'FALTA: aplica primero supabase/schema.sql' end
union all
select 'función',
       case when exists (select 1 from pg_proc where proname='kimun_foto_semanal')
            then 'ok: kimun_foto_semanal existe'
            else 'FALTA: aplica primero supabase/schema.sql' end
union all
select 'trabajo agendado',
       coalesce((select 'ok: ' || jobname || ' · ' || schedule || ' · ' ||
                        case when active then 'activo' else 'INACTIVO' end
                 from cron.job where jobname='foto-semanal'),
                'FALTA: el trabajo no quedó agendado');

-- ============================================================================
-- Opcional, para el día que haya datos reales: sembrar la foto de la semana en
-- curso sin esperar al lunes. Corre como dueño, así que el `revoke` no lo impide.
--
--     select public.kimun_foto_semanal();
--     select semana, count(*) from public.dominio_semanal group by semana order by semana;
--
-- Ojo: pasarle una fecha (`kimun_foto_semanal('2025-01-01')`) solo cambia la ETIQUETA
-- de la foto; NO reconstruye una semana pasada, porque los contadores de `dominio`
-- son los acumulados de hoy. El historial hacia atrás no se puede rellenar.
-- ============================================================================
