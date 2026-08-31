-- ============================================================
-- Prueba del CUPO de la inscripción por enlace
--
-- Pégalo entero en el SQL Editor de Supabase DESPUÉS de aplicar `schema.sql`.
-- Crea un curso y un enlace de prueba, intenta tomar el cupo 20 veces contra un cupo
-- de 10, comprueba el resultado y BORRA todo lo que creó. No toca ningún curso real.
-- Se puede volver a correr las veces que haga falta.
--
-- Qué prueba y qué NO, dicho de frente:
--   ✔ Que el cupo es un techo duro: el intento 11 y los siguientes NO pasan.
--   ✔ Que el contador queda exactamente en el cupo, sin pasarse.
--   ✘ NO simula veinte teléfonos a la vez: el SQL Editor es UNA sesión. Contra la
--     concurrencia real lo que responde es la FORMA de la sentencia: el
--     `update … where usados < cupo` es UNA sola sentencia, y PostgreSQL vuelve a
--     evaluar ese `where` después de tomar el candado de la fila. Por eso dos sesiones
--     simultáneas no pueden pasar las dos. Con un `select` y después un `update` sí
--     podrían, y ese es justamente el error que esta forma evita.
--
-- El resultado son 2 filas y las dos tienen que decir `ok`.
-- ============================================================

do $$
declare cid uuid; i int; tok text := 'INS-PRUEBA00';
begin
  -- Curso y enlace de prueba, con un nombre inconfundible por si algo quedara colgado.
  insert into public.cursos(nombre, codigo) values ('ZZ prueba de cupo', 'CUR-ZZTEST')
    on conflict (codigo) do update set nombre = excluded.nombre
    returning id into cid;
  delete from public.inscripciones where curso_id = cid;
  insert into public.inscripciones(curso_id, token, cupo) values (cid, tok, 10);

  -- Veinte intentos contra un cupo de diez, con la MISMA sentencia que usa
  -- kimun_inscribirse. Solo diez pueden pasar.
  for i in 1..20 loop
    update public.inscripciones set usados = usados + 1
     where token = tok and activo and usados < cupo;
  end loop;
end $$;

-- La verificación y la limpieza en una sola sentencia: el SQL Editor muestra solo el
-- resultado de la última, así que borrar aparte taparía el veredicto. El `delete` de
-- la CTE se lleva el enlace por cascada, y `medido` lee la foto anterior al borrado.
with medido as (
  select usados, cupo from public.inscripciones where token = 'INS-PRUEBA00'
), borrado as (
  delete from public.cursos where codigo = 'CUR-ZZTEST' returning 1
)
select 'el cupo es un techo duro' as paso,
       case when (select usados from medido) = 10 and (select cupo from medido) = 10
            then 'ok: 20 intentos, pasaron 10'
            else 'FALLA: usados = ' ||
                 coalesce((select usados::text from medido), '(no se creó el enlace)') end as estado
union all
select 'limpieza',
       case when (select count(*) from borrado) = 1
            then 'ok: se borró el curso de prueba'
            else 'REVISA a mano el curso CUR-ZZTEST' end;
