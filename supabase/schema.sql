-- ============================================================
-- KIMÜN · Esquema de Supabase (duelo online asíncrono)
-- Ejecutar en: Supabase → SQL Editor → New query → Run.
-- Además, activar el login anónimo en: Authentication → Sign In / Providers
--   → "Anonymous sign-ins" → Enable.
-- La publishable key va en index.html (es pública; la seguridad la dan las
-- políticas RLS y las funciones SECURITY DEFINER de abajo).
-- ============================================================

create extension if not exists pgcrypto;

-- Perfiles (uno por usuario; los bots tienen es_bot=true y un uuid propio).
create table if not exists public.perfiles (
  id uuid primary key,                 -- usuarios reales: auth.uid(); bots: gen_random_uuid()
  nombre text not null default 'Jugador',
  avatar text not null default '🦊',
  codigo text unique not null,         -- código de amigo (KIM-XXXX)
  es_bot boolean not null default false,
  nivel int not null default 3,        -- dificultad del bot (1-5)
  creado timestamptz not null default now()
);

-- Duelos
create table if not exists public.duelos (
  id uuid primary key default gen_random_uuid(),
  retador_id uuid not null references public.perfiles(id) on delete cascade,
  retado_codigo text not null,
  retado_id uuid references public.perfiles(id) on delete set null,
  expedicion text not null,
  preguntas jsonb not null,            -- set fijo de preguntas (mismo para ambos)
  retador_aciertos int not null,
  retador_tiempo int not null,
  retado_aciertos int,
  retado_tiempo int,
  estado text not null default 'pendiente',  -- pendiente | completado | expirado
  creado timestamptz not null default now(),
  expira timestamptz not null default (now() + interval '24 hours')
);
create index if not exists idx_duelos_codigo on public.duelos(retado_codigo);

-- Cursos (los crea el profesor desde profesor.html)
create table if not exists public.cursos (
  id     uuid primary key default gen_random_uuid(),
  nombre text not null,
  codigo text unique not null,            -- CUR-AB12
  creado timestamptz not null default now()
);

-- Columnas nuevas de perfiles
alter table public.perfiles add column if not exists curso_id      uuid references public.cursos(id) on delete set null;
alter table public.perfiles add column if not exists xp            int not null default 0;
alter table public.perfiles add column if not exists codigo_acceso text unique;   -- ALU-XXXX
alter table public.perfiles add column if not exists dificil       int not null default 0;  -- asignaturas completadas en Modo Difícil
alter table public.perfiles add column if not exists visto timestamptz;   -- última vez que abrió el juego

-- Vínculo dispositivo -> perfil (permite jugar en varios equipos)
create table if not exists public.vinculos (
  auth_uid  uuid primary key,             -- auth.uid() del dispositivo
  perfil_id uuid not null references public.perfiles(id) on delete cascade,
  creado    timestamptz not null default now()
);

-- Ajustes del servidor en pares clave/valor. Aquí vivía la clave global del Modo
-- Admin, que ya no existe: los permisos ahora son por cuenta de profesor. La tabla
-- se conserva por si más adelante hace falta guardar algún ajuste, y al final de
-- este archivo se borra la fila 'admin_clave' de las bases donde quedó.
create table if not exists public.config (
  clave text primary key,
  valor text not null
);

-- ------------------------------------------------------------
-- Profesores. Este es el único modelo de administración: cada profesor entra con
-- su correo y su contraseña (Supabase Auth) y solo obtiene permisos si tiene fila
-- en la tabla "profesores". La antigua clave global compartida fue eliminada.
-- ------------------------------------------------------------

-- Profesores: una fila por cuenta de Supabase Auth. Los permisos viven aquí,
-- no en la cuenta: sin fila en esta tabla, una cuenta no puede hacer nada.
create table if not exists public.profesores (
  id       uuid primary key,                 -- auth.uid() de su cuenta
  correo   text unique not null,
  nombre   text,
  es_admin boolean not null default false,
  creado   timestamptz not null default now()
);

-- Nivel SuperUsuario (Sesión 38): la autoridad del colegio (UTP/dirección).
-- Jerarquía: Admin (es_admin) > SuperUsuario (es_super) > Profesor. Se conserva
-- es_admin; un Admin cuenta también como administrador del colegio.
alter table public.profesores add column if not exists es_super boolean not null default false;

-- Lista blanca: solo estos correos pueden completar su registro.
create table if not exists public.profesores_autorizados (
  correo       text primary key,
  invitado_por uuid references public.profesores(id) on delete set null,
  como_admin   boolean not null default false,   -- la primera alta hereda esta marca
  usado        boolean not null default false,
  creado       timestamptz not null default now()
);

-- Dominio por objetivo de aprendizaje: una fila por alumno y OA. Se guardan
-- contadores, no respuestas: no queda registro de qué pregunta falló ni cuándo,
-- así que no se puede reconstruir la sesión de un niño.
create table if not exists public.dominio (
  perfil_id   uuid not null references public.perfiles(id) on delete cascade,
  oa          text not null,                    -- "HI08 OA 01"
  respondidas int  not null default 0,
  correctas   int  not null default 0,
  actualizado timestamptz not null default now(),
  primary key (perfil_id, oa)
);
create index if not exists idx_dominio_perfil on public.dominio(perfil_id);

-- Primer contacto con el objetivo: se escriben una sola vez y no se vuelven a tocar.
-- Sin esto, el porcentaje queda sesgado: "respondidas" crece con los reintentos, y se
-- reintenta porque no se entendió, así que el alumno que menos sabe pesa más en el
-- promedio del curso.
alter table public.dominio add column if not exists resp_1 int not null default 0;
alter table public.dominio add column if not exists ok_1   int not null default 0;

-- ------------------------------------------------------------
-- Desafío de refuerzo (Sesión 28). El profesor lanza un desafío con los objetivos
-- flojos de una asignatura; el alumno lo juega como una cadena de preguntas. Se mide
-- APARTE del mapa de dominio (el primer intento queda intacto): estas tablas no las
-- toca kimun_dominio.
-- ------------------------------------------------------------
-- A lo más un desafío activo por curso. Guarda los OA, no las preguntas: cada alumno
-- juega preguntas al azar del pool (es refuerzo, no un examen calificado).
create table if not exists public.desafios (
  id         uuid primary key default gen_random_uuid(),
  curso_id   uuid not null references public.cursos(id) on delete cascade,
  asignatura text not null,
  objetivos  text[] not null,            -- {"HI08 OA 03","HI08 OA 04"}
  activo     boolean not null default true,
  creado     timestamptz not null default now()
);
-- "Uno por curso" garantizado en la base, no solo en el cliente: aunque dos pestañas
-- lancen a la vez, no quedan dos activos.
create unique index if not exists idx_desafio_activo_curso
  on public.desafios(curso_id) where activo;

-- Resultado de cada alumno en un desafío. El primer intento manda: no se puede "mejorar"
-- reintentando (la función de completar usa on conflict do nothing).
create table if not exists public.desafio_resultados (
  desafio_id uuid not null references public.desafios(id) on delete cascade,
  perfil_id  uuid not null references public.perfiles(id) on delete cascade,
  correctas  int  not null,
  total      int  not null,
  completado timestamptz not null default now(),
  primary key (desafio_id, perfil_id)
);

-- Dueño del curso. Nulo = curso huérfano, visible solo para administradores.
alter table public.cursos add column if not exists profesor_id uuid
  references public.profesores(id) on delete set null;
create index if not exists idx_cursos_profesor on public.cursos(profesor_id);

-- ------------------------------------------------------------
-- Roles por asignatura (Sesión 37). Un curso pasa de tener un dueño único a un
-- equipo: un Profesor Jefe (ve todo) y profes de asignatura (ven lo suyo). El
-- alcance es por (curso, profesor), no por profesor: un docente puede hacer
-- Ciencias en 8°A e Historia en 8°B. Por eso es una tabla de membresías y no
-- columnas en "profesores".
-- ------------------------------------------------------------
create table if not exists public.curso_profesores (
  curso_id    uuid not null references public.cursos(id)     on delete cascade,
  profesor_id uuid not null references public.profesores(id) on delete cascade,
  rol         text not null default 'asignatura',   -- 'jefe' | 'asignatura'
  asignaturas text[] not null default '{}',         -- {'MA08','CN08'}; el jefe lo ignora
  creado      timestamptz not null default now(),
  primary key (curso_id, profesor_id)
);
-- Un solo Profesor Jefe por curso, garantizado en la base (mismo patrón que
-- idx_desafio_activo_curso). El jefe alcanza todas las asignaturas por definición,
-- así que su columna asignaturas se guarda vacía.
create unique index if not exists idx_curso_jefe_unico
  on public.curso_profesores(curso_id) where rol = 'jefe';

alter table public.curso_profesores enable row level security;
-- ------------------------------------------------------------
-- Inscripción por enlace único (modo experimental)
--
-- Un solo enlace al chat del curso: cada persona se crea sola en un curso que el
-- profesor ya abrió, con todo el contenido salvo los jefes, y su avance queda
-- registrado como el de cualquier alumno. Diseño:
-- docs/superpowers/specs/2026-08-30-inscripcion-por-enlace-design.md
--
-- ⚠️ EL ENLACE ES LA CREDENCIAL, y abre el producto completo. Un ALU- filtrado
-- regala UN cupo de la demo; este enlace reenviado fuera del chat los regala todos
-- hasta llenar el cupo. Por eso el cupo va ajustado al grupo, no holgado.
-- ------------------------------------------------------------

-- El NIVEL del curso, en dos dígitos ('03', '07', '08'). Es el mismo dato que ya vive
-- dentro del código de asignatura (MA03 = MA + 03), así que no hace falta ninguna lista
-- nueva: una asignatura pertenece a este curso si su código termina en este nivel.
--
-- Va NULLABLE a propósito: los cursos creados antes de esto no lo tienen, y un curso sin
-- nivel se comporta como antes (ve todas las asignaturas). Se le fija con
-- kimun_prof_curso_nivel en vez de inventarle uno.
alter table public.cursos add column if not exists nivel text;

-- El modo experimental es propiedad del CURSO y no del enlace ni del aparato: así
-- un alumno que borra los datos del navegador y vuelve a canjear su ALU- recupera
-- el mismo modo, en vez de caer en el juego normal sin entender por qué.
alter table public.cursos add column if not exists experimental boolean not null default false;

-- Los nombres que escribe el profesor vienen verificados; los que escribe un nino en
-- un formulario publico, no. El panel los distingue con esto: sin la marca, un apodo o
-- un "asdf" se leen igual que un alumno de la lista de clase.
alter table public.perfiles add column if not exists autoinscrito boolean not null default false;

create table if not exists public.inscripciones (
  id       uuid primary key default gen_random_uuid(),
  curso_id uuid not null references public.cursos(id) on delete cascade,
  token    text not null unique,                 -- INS-XXXXXXXX
  cupo     int  not null check (cupo > 0),
  usados   int  not null default 0,
  activo   boolean not null default true,
  creado   timestamptz not null default now()
);
alter table public.inscripciones enable row level security;
-- Sin políticas, como el resto del esquema: nada se lee directo.

-- Un solo enlace vivo por curso. Igual que idx_desafio_activo_curso y que
-- idx_curso_jefe_unico: la regla se garantiza en la base y no en el panel, porque
-- el panel se puede tener abierto en dos pestañas.
create unique index if not exists idx_inscripcion_activa_curso
  on public.inscripciones(curso_id) where activo;

create or replace function public.kimun_gen_codigo_inscripcion() returns text
language plpgsql as $$
declare c text; begin
  loop c := 'INS-'||upper(substr(md5(gen_random_uuid()::text),1,8));
    exit when not exists (select 1 from public.inscripciones where token=c); end loop;
  return c; end $$;
revoke execute on function public.kimun_gen_codigo_inscripcion() from public, anon, authenticated;


-- Sin políticas, como el resto del esquema: nada se lee directo.

-- Migración: cada dueño actual (cursos.profesor_id no nulo) se vuelve Profesor
-- Jefe de su curso. Idempotente: si ya existe la membresía no la duplica ni la
-- pisa. Nadie pierde acceso.
insert into public.curso_profesores(curso_id, profesor_id, rol, asignaturas)
select c.id, c.profesor_id, 'jefe', '{}'
from public.cursos c
where c.profesor_id is not null
on conflict (curso_id, profesor_id) do nothing;

-- Normaliza desafios.asignatura de nombre visible al código canónico. Los
-- desafíos históricos se guardaron con "Historia"/"Ciencias"/"Lenguaje"
-- (nunca Matemática, por el bug). Idempotente: solo toca las filas con el
-- nombre viejo; re-ejecutar no cambia nada.
update public.desafios set asignatura = case asignatura
    when 'Historia'    then 'HI08'
    when 'Ciencias'    then 'CN08'
    when 'Lenguaje'    then 'LE08'
    when 'Matemáticas' then 'MA08'
    when 'Matematicas' then 'MA08'
    else asignatura end
where asignatura in ('Historia','Ciencias','Lenguaje','Matemáticas','Matematicas');

-- ------------------------------------------------------------
-- Alta de la primera cuenta de administrador (procedimiento manual)
--
-- Aquí NO se siembra ningún correo en profesores_autorizados, a propósito.
-- Este repositorio es público: una fila con como_admin = true escrita en el
-- archivo publica cuál es el correo del administrador y lo deja como una cuenta
-- esperando a que alguien la reclame. Bastaría con registrarse en Supabase Auth
-- con ese correo y llamar a kimun_prof_alta para quedar como administrador de
-- toda la plataforma. Por eso el primer administrador se crea a mano, una sola
-- vez, y nunca por lista blanca.
--
-- Procedimiento (una sola vez, por Roberto):
--   1. Panel de Supabase → Authentication → Users → "Add user". El usuario
--      creado desde el panel nace con el correo ya confirmado, que es lo que
--      kimun_prof_alta exige para dejar entrar a alguien.
--   2. Ejecutar en el SQL Editor, reemplazando el correo si corresponde:
--
--        insert into public.profesores(id, correo, nombre, es_admin)
--        select id, email, 'Roberto', true from auth.users
--         where email = 'vulpochile.app@gmail.com'
--        on conflict (id) do update set es_admin = true;
--
-- A partir de ahí, los demás profesores se autorizan desde el panel del
-- administrador con kimun_prof_autorizar, que nunca otorga como_admin.
-- ------------------------------------------------------------

-- RLS: ninguna tabla se lee directo; todo pasa por las funciones SECURITY DEFINER.
alter table public.perfiles enable row level security;
alter table public.duelos   enable row level security;
alter table public.cursos   enable row level security;
alter table public.vinculos enable row level security;
alter table public.config   enable row level security;
alter table public.dominio  enable row level security;
-- Refuerzo (Sesión 28): sin RLS quedaban legibles y ESCRIBIBLES con la clave
-- pública (perfil_id + puntajes de menores, y forjar/borrar resultados). Se
-- activa igual que el resto; sin políticas, todo pasa por las funciones.
alter table public.desafios           enable row level security;
alter table public.desafio_resultados enable row level security;
-- Sin políticas, igual que el resto del esquema. Importa especialmente en
-- profesores_autorizados, porque revela qué correos pueden registrarse.
alter table public.profesores             enable row level security;
alter table public.profesores_autorizados enable row level security;
drop policy if exists "perfiles_select" on public.perfiles;

-- Genera un código único tipo KIM-AB12
create or replace function public.kimun_gen_codigo() returns text
language plpgsql as $$
declare c text; begin
  loop c := 'KIM-'||upper(substr(md5(gen_random_uuid()::text),1,4));
    exit when not exists (select 1 from public.perfiles where codigo=c); end loop;
  return c; end $$;

-- Código de curso (CUR-AB12): no es una credencial, basta con 4 caracteres
create or replace function public.kimun_gen_codigo_curso() returns text
language plpgsql as $$
declare c text; begin
  loop c := 'CUR-'||upper(substr(md5(gen_random_uuid()::text),1,4));
    exit when not exists (select 1 from public.cursos where codigo=c); end loop;
  return c; end $$;

-- Código de alumno (ALU-AB12CD34): sí es una credencial (quien lo tenga se
-- apodera del perfil), así que usa 8 caracteres para que no se pueda adivinar
-- probando combinaciones desde un script.
create or replace function public.kimun_gen_codigo_alumno() returns text
language plpgsql as $$
declare c text; begin
  loop c := 'ALU-'||upper(substr(md5(gen_random_uuid()::text),1,8));
    exit when not exists (select 1 from public.perfiles where codigo_acceso=c); end loop;
  return c; end $$;

-- Perfil de este dispositivo (null si todavía no tiene vínculo)
create or replace function public.kimun_yo() returns uuid
language sql security definer stable set search_path=public as $$
  select perfil_id from public.vinculos where auth_uid = auth.uid();
$$;

-- Traduce cualquier objetivo de aprendizaje a su asignatura (código de 4 letras).
-- Es el ÚNICO lugar del sistema que conoce esta regla. immutable: el mismo OA
-- siempre cae en la misma asignatura, así el planificador puede cachearla.
-- Efecto lateral bienvenido: Vocabulario (VOC-*) y Lectura (VOC-LECT, AF-T*) hoy
-- no calzan con los cuatro prefijos y por eso no aparecen en el filtro del panel;
-- esta función los reparte por materia y los hace visibles.
create or replace function public.kimun_oa_asignatura(p_oa text)
returns text language sql immutable as $$
  select case
    when p_oa like 'HI08%' or p_oa = 'VOC-HIST' then 'HI08'
    when p_oa like 'CN08%' or p_oa = 'VOC-CIEN' then 'CN08'
    when p_oa like 'MA08%' or p_oa = 'VOC-MATE' then 'MA08'
    -- 3° básico. El nivel viaja en el prefijo del código, que es como el modelo ya
    -- distingue las asignaturas: no hace falta una columna "nivel" en cursos. Un curso
    -- de 3° usa MA03 y uno de 8° usa MA08, y el aislamiento por asignatura los separa.
    when p_oa like 'MA03%'                       then 'MA03'
    when p_oa like 'HI03%'                       then 'HI03'
    when p_oa like 'LE03%'                       then 'LE03'
    when p_oa like 'CN03%'                       then 'CN03'
    -- 7° básico (Sesión 62). Mismo principio: el año va en el prefijo.
    when p_oa like 'MA07%'                       then 'MA07'
    when p_oa like 'HI07%'                       then 'HI07'
    when p_oa like 'LE07%'                       then 'LE07'
    when p_oa like 'CN07%'                       then 'CN07'
    when p_oa like 'LE08%' or p_oa in ('VOC-LENG','VOC-LECT')
         or p_oa like 'AF-T%'                    then 'LE08'
    else null end;
$$;

-- Migración: los jugadores que ya existen quedan vinculados a sí mismos.
-- Solo los perfiles de dispositivo (codigo_acceso is null): los alumnos que
-- inscribe el adulto tienen un id inventado que no corresponde a ningún
-- dispositivo, así que un vínculo para ellos sería una fila basura.
insert into public.vinculos(auth_uid, perfil_id)
select id, id from public.perfiles where es_bot = false and codigo_acceso is null
on conflict (auth_uid) do nothing;

-- Crea/actualiza mi perfil (devuelve el perfil con su código)
create or replace function public.kimun_perfil(p_nombre text, p_avatar text)
returns public.perfiles language plpgsql security definer set search_path=public as $$
declare r public.perfiles; mi uuid; begin
  mi := public.kimun_yo();
  if mi is null then
    insert into public.perfiles(id,nombre,avatar,codigo)
    values (auth.uid(),coalesce(p_nombre,'Jugador'),coalesce(p_avatar,'🦊'),public.kimun_gen_codigo())
    on conflict (id) do update set nombre=excluded.nombre, avatar=excluded.avatar
    returning * into r;
    insert into public.vinculos(auth_uid,perfil_id) values (auth.uid(), r.id)
      on conflict (auth_uid) do update set perfil_id=excluded.perfil_id;
  else
    select * into r from public.perfiles where id=mi;
    -- A un alumno inscrito por el adulto no se le pisa el nombre con el del teléfono
    if r.codigo_acceso is null then
      update public.perfiles set nombre=coalesce(p_nombre,nombre), avatar=coalesce(p_avatar,avatar)
      where id=mi returning * into r;
    end if;
  end if;
  return r; end $$;

-- Busca un perfil por código
create or replace function public.kimun_buscar(p_codigo text)
returns table(nombre text, avatar text)
language sql security definer set search_path=public as $$
  select nombre,avatar from public.perfiles where codigo=upper(p_codigo); $$;

-- Lista de jugadores para desafiar (bots primero).
-- Solo aparecen los bots y los perfiles con un vínculo activo: un alumno que el
-- adulto inscribió pero que todavía no canjea su código no debe verse como
-- rival, porque no hay ningún dispositivo que pueda responder ese duelo.
-- Lista de jugadores para retar en el duelo. Acotada al MISMO CURSO del que llama
-- (más los bots de práctica), para no exponer los nombres de todos los menores de la
-- plataforma a cualquier cliente con la clave pública. A alguien de otro curso se le
-- puede retar igual escribiendo su código de amigo (KIM-). Si quien llama no tiene
-- curso, ve solo los bots.
create or replace function public.kimun_jugadores()
returns table(nombre text,avatar text,codigo text,es_bot boolean)
language sql security definer set search_path=public as $$
  select p.nombre,p.avatar,p.codigo,p.es_bot from public.perfiles p
  where p.id <> coalesce(public.kimun_yo(),'00000000-0000-0000-0000-000000000000'::uuid)
    and (
      p.es_bot
      or (
        p.curso_id is not null
        and p.curso_id = (select mp.curso_id from public.perfiles mp where mp.id = public.kimun_yo())
        and exists(select 1 from public.vinculos v where v.perfil_id = p.id)
      )
    )
  order by p.es_bot desc, p.nombre; $$;

-- Crear un duelo. Si el rival es bot, responde al instante y devuelve el resultado;
-- si es un jugador real, queda pendiente (24h).
create or replace function public.kimun_crear_duelo(p_retado_codigo text,p_expedicion text,p_preguntas jsonb,p_aciertos int,p_tiempo int)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v uuid; mi uuid; bot public.perfiles; b_ac int; b_t int; g text; total int; acc numeric; begin
  -- Sin vínculo no hay perfil que pueda retar; se avisa con un error claro en
  -- vez de dejar que falle la restricción not null de retador_id.
  mi := public.kimun_yo();
  if mi is null then raise exception 'sin_perfil'; end if;
  select * into bot from public.perfiles where codigo=upper(p_retado_codigo);
  if bot.id is null then raise exception 'codigo_invalido'; end if;
  total := coalesce(jsonb_array_length(p_preguntas),8);
  insert into public.duelos(retador_id,retado_codigo,expedicion,preguntas,retador_aciertos,retador_tiempo)
  values (mi,upper(p_retado_codigo),p_expedicion,p_preguntas,p_aciertos,p_tiempo) returning id into v;
  if bot.es_bot then
    acc := 0.45 + bot.nivel*0.1;                         -- nivel 1..5 -> 0.55..0.95
    b_ac := least(total, greatest(0, round(total*acc)::int + (floor(random()*3)-1)::int));
    b_t := 20 + floor(random()*40)::int;
    update public.duelos set retado_id=bot.id,retado_aciertos=b_ac,retado_tiempo=b_t,estado='completado' where id=v;
    if p_aciertos>b_ac then g:='yo'; elsif p_aciertos<b_ac then g:='rival';
      elsif p_tiempo<b_t then g:='yo'; elsif p_tiempo>b_t then g:='rival'; else g:='empate'; end if;
    return jsonb_build_object('tipo','bot','rival_nombre',bot.nombre,'rival_avatar',bot.avatar,
      'rival_aciertos',b_ac,'mis_aciertos',p_aciertos,'total',total,'ganador',g);
  end if;
  return jsonb_build_object('tipo','async','id',v);
end $$;

-- Duelos pendientes para mí (SIN revelar el puntaje del retador)
create or replace function public.kimun_pendientes()
returns table(id uuid,retador_nombre text,retador_avatar text,expedicion text,preguntas jsonb,expira timestamptz)
language sql security definer set search_path=public as $$
  select d.id,p.nombre,p.avatar,d.expedicion,d.preguntas,d.expira
  from public.duelos d join public.perfiles p on p.id=d.retador_id
  where d.retado_codigo=(select codigo from public.perfiles where id=public.kimun_yo())
    and d.estado='pendiente' and d.expira>now(); $$;

-- Responder un duelo (guarda mi puntaje, marca completado, devuelve resultado + ganador)
create or replace function public.kimun_responder(p_id uuid,p_aciertos int,p_tiempo int)
returns table(retador_nombre text,retador_avatar text,retador_aciertos int,retador_tiempo int,mis_aciertos int,mi_tiempo int,ganador text)
language plpgsql security definer set search_path=public as $$
declare d public.duelos; mi text; g text; begin
  select codigo into mi from public.perfiles where id=public.kimun_yo();
  select * into d from public.duelos where id=p_id and retado_codigo=mi and estado='pendiente' and expira>now() for update;
  if d.id is null then raise exception 'duelo_no_disponible'; end if;
  update public.duelos set retado_id=public.kimun_yo(),retado_aciertos=p_aciertos,retado_tiempo=p_tiempo,estado='completado' where id=p_id;
  if p_aciertos>d.retador_aciertos then g:='yo';
  elsif p_aciertos<d.retador_aciertos then g:='rival';
  elsif p_tiempo<d.retador_tiempo then g:='yo';
  elsif p_tiempo>d.retador_tiempo then g:='rival';
  else g:='empate'; end if;
  return query select p2.nombre,p2.avatar,d.retador_aciertos,d.retador_tiempo,p_aciertos,p_tiempo,g
    from public.perfiles p2 where p2.id=d.retador_id; end $$;

-- Historial de mis duelos (para "mis duelos" / ranking futuro)
create or replace function public.kimun_historial()
returns table(id uuid,rol text,rival text,mi_aciertos int,rival_aciertos int,estado text,creado timestamptz)
language sql security definer set search_path=public as $$
  select d.id,
    case when d.retador_id=public.kimun_yo() then 'retador' else 'retado' end,
    case when d.retador_id=public.kimun_yo() then rp.nombre else cp.nombre end,
    case when d.retador_id=public.kimun_yo() then d.retador_aciertos else d.retado_aciertos end,
    case when d.retador_id=public.kimun_yo() then d.retado_aciertos else d.retador_aciertos end,
    case when d.estado='pendiente' and d.expira<now() then 'expirado' else d.estado end,
    d.creado
  from public.duelos d
  left join public.perfiles cp on cp.id=d.retador_id
  left join public.perfiles rp on rp.codigo=d.retado_codigo
  where d.retador_id=public.kimun_yo() or d.retado_codigo=(select codigo from public.perfiles where id=public.kimun_yo()); $$;

-- Sube mi XP (monótono: nunca baja)
create or replace function public.kimun_xp(p_xp int) returns int
language plpgsql security definer set search_path=public as $$
declare mi uuid; v int; begin
  mi := public.kimun_yo();
  if mi is null then return 0; end if;
  update public.perfiles set xp = greatest(xp, coalesce(p_xp,0)), visto = now() where id=mi returning xp into v;
  return coalesce(v,0); end $$;

-- Sincroniza cuántas asignaturas completó el alumno en Modo Difícil. Solo sube (el estado
-- de Difícil es local del aparato, como el progreso de campañas), igual que kimun_xp.
create or replace function public.kimun_dificil(p_n int) returns int
language plpgsql security definer set search_path=public as $$
declare mi uuid; v int; begin
  mi := public.kimun_yo();
  if mi is null then return 0; end if;
  update public.perfiles set dificil = greatest(dificil, coalesce(p_n,0)) where id=mi returning dificil into v;
  return coalesce(v,0); end $$;

-- Suma el resumen de una etapa terminada. Recibe [{"oa":"HI08 OA 04","n":6,"ok":4}].
-- Es acumulativa: cada llamada se suma a lo que ya había.
create or replace function public.kimun_dominio(p_datos jsonb)
returns int language plpgsql security definer set search_path=public as $$
declare mi uuid; fila jsonb; n int := 0; begin
  mi := public.kimun_yo();
  if mi is null then return 0; end if;
  if p_datos is null or jsonb_typeof(p_datos) <> 'array' then return 0; end if;
  for fila in select * from jsonb_array_elements(p_datos) loop
    -- Se ignoran las entradas mal formadas en vez de fallar: esto corre en segundo
    -- plano mientras el niño juega y nunca debe interrumpirlo.
    continue when coalesce(fila->>'oa','') = '';
    -- El código tiene que verse como un objetivo de verdad ("HI08 OA 01"). Sin esta
    -- validación, cualquiera puede insertarse desde la consola del navegador miles de
    -- filas con códigos inventados, que después aparecen crudos en la tabla del
    -- profesor. No expone datos ajenos —solo se escribe sobre el propio perfil—, pero
    -- ensucia la herramienta hasta volverla inútil.
    continue when (fila->>'oa') !~ '^[A-Z]{2}[0-9]{2} OA [0-9]{2}$';
    -- Los contadores llegan como texto dentro del JSON. Si no son dígitos, el cast a
    -- entero de más abajo lanzaría una excepción, se perdería el lote completo y el
    -- teléfono lo reintentaría para siempre: el niño quedaría sin medición, en
    -- silencio. Por eso se descartan aquí, antes de cualquier cast.
    continue when (fila->>'n')  !~ '^[0-9]+$';
    continue when coalesce(fila->>'ok','0') !~ '^[0-9]+$';
    -- Un "n" ausente llega como nulo y no lo atrapa la expresión regular; este
    -- coalesce sí lo descarta.
    continue when coalesce((fila->>'n')::int, 0) <= 0;
    insert into public.dominio(perfil_id, oa, respondidas, correctas, resp_1, ok_1)
    values (mi, fila->>'oa',
            greatest(0,(fila->>'n')::int),
            least(greatest(0,coalesce((fila->>'ok')::int,0)), greatest(0,(fila->>'n')::int)),
            greatest(0,(fila->>'n')::int),
            least(greatest(0,coalesce((fila->>'ok')::int,0)), greatest(0,(fila->>'n')::int)))
    -- La tabla se nombra sin el esquema a propósito: esa es la forma que documenta
    -- PostgreSQL para leer la fila existente, y el search_path ya está fijado en
    -- public. Los cuerpos plpgsql no se validan al crearse, así que una referencia
    -- que no resolviera se pegaría sin quejarse y recién fallaría en producción, la
    -- primera vez que un niño terminara una etapa.
    --
    -- El "do update" NO toca resp_1 ni ok_1: esa es toda la idea. La primera vez que un
    -- alumno responde un objetivo es necesariamente un insert, así que quedan congeladas
    -- en su primer contacto. Si alguna vez alguien las agrega a esta lista, el número del
    -- panel vuelve a ser un acumulado sesgado por los reintentos y nada lo delata.
    on conflict (perfil_id, oa) do update set
      respondidas = dominio.respondidas + excluded.respondidas,
      correctas   = dominio.correctas   + excluded.correctas,
      actualizado = now();
    n := n + 1;
  end loop;
  return n; end $$;

-- Ranking de mi curso (vacío si no tengo curso). Devuelve "dificil" para la marca 🔥.
drop function if exists public.kimun_ranking();
create or replace function public.kimun_ranking()
returns table(nombre text, avatar text, xp int, soy_yo boolean, curso text, dificil int)
language sql security definer set search_path=public as $$
  select p.nombre, p.avatar, p.xp, coalesce(p.id = public.kimun_yo(), false), c.nombre, p.dificil
  from public.perfiles p
  join public.cursos c on c.id = p.curso_id
  where p.curso_id = (select curso_id from public.perfiles where id = public.kimun_yo())
  order by p.xp desc, p.nombre; $$;

-- Canjea un código de alumno: vincula este dispositivo a ese perfil
create or replace function public.kimun_canjear(p_codigo text)
returns public.perfiles language plpgsql security definer set search_path=public as $$
declare r public.perfiles; begin
  select * into r from public.perfiles where codigo_acceso = upper(trim(p_codigo));
  if r.id is null then raise exception 'codigo_invalido'; end if;
  insert into public.vinculos(auth_uid,perfil_id) values (auth.uid(), r.id)
    on conflict (auth_uid) do update set perfil_id = excluded.perfil_id;
  return r; end $$;

-- ------------------------------------------------------------
-- Funciones del rol de profesor. No reciben ninguna clave: identifican al
-- profesor por su sesión de Supabase Auth (auth.uid()) y consultan la tabla
-- profesores para saber qué puede hacer.
-- ------------------------------------------------------------

-- Mi fila de profesor, o null si esta cuenta no tiene permisos.
create or replace function public.kimun_prof_yo()
returns public.profesores language sql security definer stable set search_path=public as $$
  select * from public.profesores where id = auth.uid(); $$;

-- Completa el registro. El correo NO se pasa por parámetro: se toma de la sesión,
-- para que nadie pueda registrarse con el correo autorizado de otra persona.
create or replace function public.kimun_prof_alta(p_nombre text)
returns public.profesores language plpgsql security definer set search_path=public as $$
declare mi_correo text; aut public.profesores_autorizados; r public.profesores; begin
  if auth.uid() is null then raise exception 'sin_sesion'; end if;
  -- Defensa en profundidad: solo una cuenta de correo real y confirmada puede
  -- darse de alta. Cada teléfono que abre el juego tiene una sesión anónima, y
  -- desde ella se puede llamar a updateUser({email}); sin estos dos filtros esa
  -- sesión entraría por la misma puerta que un profesor.
  -- Por eso 'sin_correo' cubre ahora tres casos: la sesión no tiene correo,
  -- el correo todavía no está confirmado, o la sesión es anónima.
  select email into mi_correo from auth.users
   where id = auth.uid() and email_confirmed_at is not null
     and coalesce(is_anonymous, false) = false;
  if mi_correo is null then raise exception 'sin_correo'; end if;
  select * into aut from public.profesores_autorizados where lower(correo) = lower(mi_correo);
  if aut.correo is null then raise exception 'no_autorizado'; end if;
  -- Si la cuenta de Auth se borró y se recreó, el correo sigue tomado por un
  -- profesor cuyo id ya no existe. Se libera antes de insertar el nuevo, porque
  -- el "on conflict (id)" de abajo no atrapa ese choque (es contra la
  -- restricción única de correo) y el registro se volvería imposible, con un
  -- error de clave duplicada que en la página se lee como un mensaje genérico.
  -- El "not exists" es imprescindible: sin él, este delete alcanzaría a un
  -- profesor VIVO cuyo correo guardado quedó desalineado del real, lo borraría
  -- y la siguiente alta tomaría la rama del insert, volviendo a leer como_admin
  -- de la lista blanca. Es decir, sería una vía de escalada, no una limpieza.
  -- Consecuencia asumida: cursos.profesor_id tiene "on delete set null", así que
  -- los cursos del profesor borrado quedan huérfanos y pasan a verlos solo los
  -- administradores, hasta reasignarlos con kimun_prof_curso_asignar.
  delete from public.profesores p
   where lower(p.correo) = lower(mi_correo)
     and p.id <> auth.uid()
     and not exists (select 1 from auth.users u where u.id = p.id);
  -- Deliberado: el "do update" toca el nombre y el correo, nunca es_admin.
  -- Marcar como_admin en la lista blanca después del registro NO asciende a
  -- nadie; si lo hiciera, bastaría con volver a llamar a esta función para
  -- escalar permisos. Un ascenso se hace a mano, con un update sobre
  -- public.profesores. El correo sí se sincroniza para que no se desalinee del
  -- de Auth, que es justo la situación que el delete de arriba ya no limpia.
  -- La tabla se nombra sin el esquema por el mismo motivo que en kimun_dominio: es
  -- la forma documentada de leer la fila existente y el search_path ya apunta a
  -- public. Esta rama solo corre cuando alguien se registra por segunda vez, así que
  -- una referencia que no resolviera se habría quedado latente hasta ese día.
  insert into public.profesores(id, correo, nombre, es_admin)
  values (auth.uid(), lower(mi_correo), nullif(trim(p_nombre),''), aut.como_admin)
  on conflict (id) do update set
    nombre = coalesce(excluded.nombre, profesores.nombre),
    correo = excluded.correo
  returning * into r;
  update public.profesores_autorizados set usado = true where lower(correo) = lower(mi_correo);
  return r; end $$;

-- ¿Puedo hacer lo DESTRUCTIVO en este curso? Cambió de significado con los roles
-- por asignatura (Sesión 37): antes era "admin o dueño"; ahora es "admin o
-- Profesor Jefe". Todas las funciones destructivas ya la llaman, así que heredan
-- la nueva regla sin tocar su cuerpo. Los administradores pasan siempre.
create or replace function public.kimun_prof_es_mio(p_curso uuid)
returns boolean language sql security definer stable set search_path=public as $$
  select exists(select 1 from public.profesores pr
                where pr.id = auth.uid() and (pr.es_admin or pr.es_super))
      or exists(select 1 from public.curso_profesores cp
                where cp.curso_id = p_curso and cp.profesor_id = auth.uid()
                  and cp.rol = 'jefe');
$$;

-- ¿Puedo ENTRAR a este curso (verlo, leer su avance)? Admin, jefe, o profe con al
-- menos una asignatura asignada aquí. Una membresía sin asignaturas ('{}') da
-- falso a propósito: significa "todavía no le asignan materias", y se evita el
-- estado ambiguo de "entra pero no ve nada".
create or replace function public.kimun_prof_acceso(p_curso uuid)
returns boolean language sql security definer stable set search_path=public as $$
  select exists(select 1 from public.profesores pr
                where pr.id = auth.uid() and (pr.es_admin or pr.es_super))
      or exists(select 1 from public.curso_profesores cp
                where cp.curso_id = p_curso and cp.profesor_id = auth.uid()
                  and (cp.rol = 'jefe' or coalesce(array_length(cp.asignaturas,1),0) >= 1));
$$;

-- ¿Sobre qué asignaturas puedo actuar en este curso? Admin y jefe reciben TODAS
-- las que existen; un profe de asignatura recibe las suyas; sin membresía, vacío.
-- Al agregar un nivel o una asignatura hay que sumar su código a las dos listas de
-- abajo: si falta, ese contenido queda INVISIBLE para el Jefe, sin ningún error.
create or replace function public.kimun_prof_asignaturas(p_curso uuid)
returns text[] language sql security definer stable set search_path=public as $$
  select case
    when exists(select 1 from public.profesores pr
                where pr.id = auth.uid() and (pr.es_admin or pr.es_super))
      then array['HI08','CN08','MA08','LE08','MA03','HI03','LE03','CN03',
                 'MA07','HI07','LE07','CN07']
    when exists(select 1 from public.curso_profesores cp
                where cp.curso_id = p_curso and cp.profesor_id = auth.uid()
                  and cp.rol = 'jefe')
      then array['HI08','CN08','MA08','LE08','MA03','HI03','LE03','CN03',
                 'MA07','HI07','LE07','CN07']
    else coalesce((select cp.asignaturas from public.curso_profesores cp
                   where cp.curso_id = p_curso and cp.profesor_id = auth.uid()),
                  '{}'::text[])
  end;
$$;

-- ¿Administra el colegio? (crear/borrar curso, nombrar Jefe, autorizar y gestionar
-- profesores). Admin y SuperUsuario pasan; un Jefe NO. Crear/quitar SuperUsuarios y
-- Admins queda aparte, solo para es_admin.
create or replace function public.kimun_prof_admin_colegio()
returns boolean language sql security definer stable set search_path=public as $$
  select exists(select 1 from public.profesores pr
                where pr.id = auth.uid() and (pr.es_admin or pr.es_super));
$$;

-- Mis cursos con sus alumnos. Un administrador ve todos, incluidos los huérfanos.
-- El drop previo es el guardia de idempotencia que ya usa kimun_ranking: al ser
-- "returns table", cambiar cualquier columna del returns haría fallar el
-- re-pegado del archivo con "cannot change return type of existing function".
drop function if exists public.kimun_prof_listar();
create or replace function public.kimun_prof_listar()
returns table(curso text, curso_codigo text, alumno text, avatar text,
              codigo_acceso text, xp int, dificil int, pid uuid,
              puede_gestionar boolean, mis_asignaturas text[], mi_rol text,
              autoinscrito boolean, nivel text)
language plpgsql security definer set search_path=public as $$
declare yo public.profesores; begin
  select * into yo from public.profesores where id = auth.uid();
  if yo.id is null then raise exception 'no_autorizado'; end if;
  return query
    select c.nombre, c.codigo, p.nombre, p.avatar,
           -- El codigo_acceso (credencial del alumno) solo se entrega a quien gestiona
           -- el curso (Jefe/Super/Admin); un profe de asignatura recibe null y usa el
           -- id de perfil para abrir la ficha del alumno, sin ver la credencial.
           case when public.kimun_prof_es_mio(c.id) then p.codigo_acceso else null end,
           p.xp, p.dificil, p.id,
           -- "Puedo gestionar" = soy jefe o admin de este curso: gobierna los
           -- botones destructivos y el bloque de equipo en el panel.
           public.kimun_prof_es_mio(c.id),
           public.kimun_prof_asignaturas(c.id),
           -- Mi rol en ESTE curso: 'jefe' | 'asignatura' | null (admin/super sin membresía).
           (select cp.rol from public.curso_profesores cp
             where cp.curso_id = c.id and cp.profesor_id = yo.id),
           coalesce(p.autoinscrito,false),
           c.nivel
    from public.cursos c
    left join public.perfiles p on p.curso_id = c.id
    where yo.es_admin or yo.es_super
       or exists(select 1 from public.curso_profesores cp
                 where cp.curso_id = c.id and cp.profesor_id = yo.id
                   and (cp.rol='jefe' or coalesce(array_length(cp.asignaturas,1),0) >= 1))
    order by c.nombre, p.xp desc nulls last, p.nombre;
end $$;

-- ⚠️ Cambió de firma al sumarle el nivel (30/08/2026): sin este drop, re-aplicar el
-- archivo dejaría DOS versiones y PostgREST elegiría por los parámetros que le lleguen.
drop function if exists public.kimun_prof_curso_crear(text);
create or replace function public.kimun_prof_curso_crear(p_nombre text, p_nivel text)
returns public.cursos language plpgsql security definer set search_path=public as $$
declare r public.cursos; niv text; begin
  if not public.kimun_prof_admin_colegio() then raise exception 'no_autorizado'; end if;
  if coalesce(trim(p_nombre),'') = '' then raise exception 'nombre_vacio'; end if;
  niv := nullif(trim(coalesce(p_nivel,'')),'');
  -- Dos dígitos y nada más. Se valida aquí y no solo en el panel porque de este dato
  -- depende qué asignaturas se le pueden asignar al curso.
  if niv is not null and niv !~ '^[0-9]{2}$' then raise exception 'nivel_invalido'; end if;
  -- El curso nace SIN Jefe: quien lo crea (Admin/Super) no es Jefe de aula.
  -- profesor_id queda nulo; el Jefe se nombra después con kimun_prof_equipo_asignar.
  insert into public.cursos(nombre, codigo, nivel)
  values (trim(p_nombre), public.kimun_gen_codigo_curso(), niv) returning * into r;
  return r; end $$;

-- Fijarle el nivel a un curso que ya existía. Sin esto, los cursos creados antes de que
-- el nivel existiera se quedarían para siempre viendo las asignaturas de todos los niveles.
create or replace function public.kimun_prof_curso_nivel(p_curso_codigo text, p_nivel text)
returns void language plpgsql security definer set search_path=public as $$
declare cid uuid; niv text; begin
  select id into cid from public.cursos where codigo = upper(trim(p_curso_codigo));
  if cid is null or not public.kimun_prof_admin_colegio() then raise exception 'no_autorizado'; end if;
  niv := nullif(trim(coalesce(p_nivel,'')),'');
  if niv is not null and niv !~ '^[0-9]{2}$' then raise exception 'nivel_invalido'; end if;
  -- No se tocan las asignaturas ya asignadas al equipo: cambiar el nivel de un curso con
  -- gente adentro es raro, y borrarles el acceso en silencio sería peor que dejar una
  -- fila incoherente que el panel muestra.
  update public.cursos set nivel = niv where id = cid;
end $$;

-- Elimina un curso mío y sus alumnos (arrastra los duelos de esos alumnos).
create or replace function public.kimun_prof_curso_quitar(p_curso_codigo text)
returns int language plpgsql security definer set search_path=public as $$
declare cid uuid; n int; begin
  select id into cid from public.cursos where codigo = upper(trim(p_curso_codigo));
  -- Un código que no existe y un curso ajeno responden lo mismo a propósito: si
  -- se distinguieran, cualquier profesor podría recorrer los códigos CUR- y
  -- averiguar cuáles existen en la plataforma.
  if cid is null or not public.kimun_prof_admin_colegio() then raise exception 'no_autorizado'; end if;
  delete from public.perfiles where curso_id = cid;
  get diagnostics n = row_count;
  delete from public.cursos where id = cid;
  return n; end $$;

create or replace function public.kimun_prof_alumno_agregar(p_curso_codigo text, p_nombre text, p_avatar text)
returns public.perfiles language plpgsql security definer set search_path=public as $$
declare cid uuid; r public.perfiles; begin
  if coalesce(trim(p_nombre),'') = '' then raise exception 'nombre_vacio'; end if;
  select id into cid from public.cursos where codigo = upper(trim(p_curso_codigo));
  -- Mismo criterio que en kimun_prof_curso_quitar: no se distingue "no existe"
  -- de "no es tuyo", para no filtrar qué códigos de curso están en uso.
  if cid is null or not public.kimun_prof_es_mio(cid) then raise exception 'no_autorizado'; end if;
  insert into public.perfiles(id,nombre,avatar,codigo,curso_id,codigo_acceso)
  values (gen_random_uuid(), trim(p_nombre), coalesce(p_avatar,'🦊'),
          public.kimun_gen_codigo(), cid, public.kimun_gen_codigo_alumno())
  returning * into r;
  return r; end $$;

-- Un código que no existe, uno de un curso ajeno y uno sin curso responden lo
-- mismo (no_autorizado), igual que las funciones con código de curso: distinguir
-- "no existe" de "no es tuyo" dejaría verificar la existencia de códigos ALU
-- ajenos probándolos. El panel siempre llama con códigos de alumnos propios.
create or replace function public.kimun_prof_alumno_quitar(p_codigo_acceso text)
returns int language plpgsql security definer set search_path=public as $$
declare cid uuid; n int; begin
  select curso_id into cid from public.perfiles where codigo_acceso = upper(trim(p_codigo_acceso));
  if cid is null or not public.kimun_prof_es_mio(cid) then raise exception 'no_autorizado'; end if;
  delete from public.perfiles where codigo_acceso = upper(trim(p_codigo_acceso));
  get diagnostics n = row_count;
  -- Puede pasar si otra sesión borró al alumno entre la lectura y el delete.
  if n = 0 then raise exception 'no_autorizado'; end if;
  return n; end $$;

-- Corrige el XP de un alumno mío. kimun_xp solo sube, así que esta es la única
-- forma de bajar un valor inflado desde el teléfono.
create or replace function public.kimun_prof_xp_fijar(p_codigo_acceso text, p_xp int)
returns int language plpgsql security definer set search_path=public as $$
declare cid uuid; v int; begin
  select curso_id into cid from public.perfiles where codigo_acceso = upper(trim(p_codigo_acceso));
  -- Mismo criterio anti-enumeración que kimun_prof_alumno_quitar: no se distingue
  -- "no existe" de "no es tuyo".
  if cid is null or not public.kimun_prof_es_mio(cid) then raise exception 'no_autorizado'; end if;
  update public.perfiles set xp = greatest(0, coalesce(p_xp,0))
  where codigo_acceso = upper(trim(p_codigo_acceso)) returning xp into v;
  -- Si el alumno desapareció entre la lectura y el update, "v" queda nulo.
  if v is null then raise exception 'no_autorizado'; end if;
  return v; end $$;

-- Dominio agregado de un curso mío, por objetivo.
-- El drop previo es el mismo guardia de idempotencia que usan kimun_ranking y
-- kimun_prof_listar: al ser "returns table", cambiarle una columna al returns
-- haría fallar el re-pegado del archivo con "cannot change return type".
drop function if exists public.kimun_prof_dominio(text);
create or replace function public.kimun_prof_dominio(p_curso_codigo text)
returns table(oa text, respondidas bigint, correctas bigint, alumnos bigint,
              resp_1 bigint, ok_1 bigint, alumnos_1 bigint)
language plpgsql security definer set search_path=public as $$
declare cid uuid; asigs text[]; begin
  select id into cid from public.cursos where codigo = upper(trim(p_curso_codigo));
  if cid is null or not public.kimun_prof_acceso(cid) then raise exception 'no_autorizado'; end if;
  asigs := public.kimun_prof_asignaturas(cid);
  return query
    select d.oa, sum(d.respondidas), sum(d.correctas), count(distinct d.perfil_id),
           sum(d.resp_1), sum(d.ok_1),
           -- Cuántos alumnos aportaron un primer intento: es el número que decide si el
           -- porcentaje es creíble, y no es lo mismo que cuántos hay en el curso.
           count(distinct d.perfil_id) filter (where d.resp_1 > 0)
    from public.dominio d
    join public.perfiles p on p.id = d.perfil_id
    where p.curso_id = cid
      -- Solo los objetivos de MIS asignaturas. Un profe de Ciencias no ve Historia.
      and public.kimun_oa_asignatura(d.oa) = any(asigs)
    group by d.oa
    -- El orden se calcula sobre el primer intento, que es el número que se muestra.
    order by (sum(d.ok_1)::numeric / nullif(sum(d.resp_1),0)) asc nulls last, d.oa;
end $$;

-- Dominio de un alumno mío. Recibe el ID DE PERFIL, no el codigo_acceso: la
-- credencial del alumno solo la entrega kimun_prof_listar a Jefe/Super/Admin, así
-- que el panel abre la ficha de un alumno por su id, sin necesitar (ni exponer) el
-- código a un profe de asignatura.
drop function if exists public.kimun_prof_dominio_alumno(text);
drop function if exists public.kimun_prof_dominio_alumno(uuid);
create or replace function public.kimun_prof_dominio_alumno(p_perfil uuid)
returns table(oa text, respondidas int, correctas int, resp_1 int, ok_1 int)
language plpgsql security definer set search_path=public as $$
declare cid uuid; asigs text[]; begin
  select curso_id into cid from public.perfiles where id = p_perfil;
  if cid is null or not public.kimun_prof_acceso(cid)
    then raise exception 'no_autorizado'; end if;
  asigs := public.kimun_prof_asignaturas(cid);
  return query
    select d.oa, d.respondidas, d.correctas, d.resp_1, d.ok_1 from public.dominio d
    where d.perfil_id = p_perfil
      and public.kimun_oa_asignatura(d.oa) = any(asigs)
    order by (d.ok_1::numeric / nullif(d.resp_1,0)) asc nulls last, d.oa;
end $$;

-- Participación del curso: una fila por alumno inscrito, con la última vez que abrió el
-- juego y si alguna vez canjeó su código. El cliente la reparte en grupos.
drop function if exists public.kimun_prof_participacion(text);
create or replace function public.kimun_prof_participacion(p_curso_codigo text)
returns table(alumno text, avatar text, visto timestamptz, vinculado boolean)
language plpgsql security definer set search_path=public as $$
declare cid uuid; begin
  select id into cid from public.cursos where codigo = upper(trim(p_curso_codigo));
  if cid is null or not public.kimun_prof_acceso(cid) then raise exception 'no_autorizado'; end if;
  return query
    select p.nombre, p.avatar, p.visto,
           exists(select 1 from public.vinculos v where v.perfil_id = p.id)
    from public.perfiles p
    where p.curso_id = cid
    order by p.nombre;   -- alfabético a propósito: por fecha sería un ranking de niños
end $$;

-- Alumnos de un curso mío con su primer intento en UN objetivo, para saber a quiénes
-- reforzar. Devuelve a TODOS los alumnos inscritos, también a los que no lo jugaron:
-- "12 no lo han visto" es información, no un vacío. Ordena por nombre a propósito —un
-- orden por rendimiento convertiría esto en un ranking de niños, que es justo lo que no
-- se quiere.
-- El drop previo es el mismo guardia de idempotencia de las otras "returns table":
-- cambiarle una columna al returns haría fallar el re-pegado del archivo.
drop function if exists public.kimun_prof_dominio_oa(text,text);
create or replace function public.kimun_prof_dominio_oa(p_curso_codigo text, p_oa text)
returns table(alumno text, avatar text, resp_1 int, ok_1 int)
language plpgsql security definer set search_path=public as $$
declare cid uuid; begin
  select id into cid from public.cursos where codigo = upper(trim(p_curso_codigo));
  if cid is null or not public.kimun_prof_acceso(cid) then raise exception 'no_autorizado'; end if;
  -- El OA pedido debe pertenecer a una asignatura mía; si no, es como pedir un
  -- curso ajeno. Mismo mensaje para no filtrar qué objetivos existen.
  if not (public.kimun_oa_asignatura(p_oa) = any(public.kimun_prof_asignaturas(cid)))
    then raise exception 'no_autorizado'; end if;
  return query
    select p.nombre, p.avatar, coalesce(d.resp_1,0), coalesce(d.ok_1,0)
    from public.perfiles p
    left join public.dominio d on d.perfil_id = p.id and d.oa = p_oa
    -- Solo alumnos inscritos: los perfiles sueltos que crea cada teléfono al abrir el
    -- juego no son del curso, igual que en el resto del panel.
    where p.curso_id = cid and p.codigo_acceso is not null
    order by p.nombre;
end $$;

-- Pone en cero las mediciones de un curso mío. Devuelve cuántas filas borró.
create or replace function public.kimun_prof_dominio_reiniciar(p_curso_codigo text)
returns int language plpgsql security definer set search_path=public as $$
declare cid uuid; n int; begin
  select id into cid from public.cursos where codigo = upper(trim(p_curso_codigo));
  if cid is null or not public.kimun_prof_es_mio(cid) then raise exception 'no_autorizado'; end if;
  delete from public.dominio d
   using public.perfiles p
   where p.id = d.perfil_id and p.curso_id = cid;
  get diagnostics n = row_count;
  return n; end $$;

-- Autoriza un correo para que pueda crear su cuenta de profesor.
create or replace function public.kimun_prof_autorizar(p_correo text)
returns public.profesores_autorizados language plpgsql security definer set search_path=public as $$
declare yo public.profesores; r public.profesores_autorizados; begin
  select * into yo from public.profesores where id = auth.uid();
  if yo.id is null or not (yo.es_admin or yo.es_super) then raise exception 'no_autorizado'; end if;
  if coalesce(trim(p_correo),'') !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
    then raise exception 'correo_invalido'; end if;
  insert into public.profesores_autorizados(correo, invitado_por)
  values (lower(trim(p_correo)), yo.id)
  on conflict (correo) do update set invitado_por = excluded.invitado_por
  returning * into r;
  return r; end $$;

-- Lista de profesores y cuántos cursos tiene cada uno.
-- El join es "full outer" a propósito: si fuera desde profesores_autorizados,
-- un profesor ya registrado cuyo correo se quitó de la lista blanca dejaría de
-- aparecer, y el administrador no tendría cómo verlo ni revocarlo. Así se listan
-- los dos conjuntos: los correos autorizados y los profesores registrados.
-- Mismo guardia de idempotencia que kimun_prof_listar (es "returns table").
drop function if exists public.kimun_prof_profesores();
create or replace function public.kimun_prof_profesores()
returns table(correo text, nombre text, es_admin boolean, es_super boolean, cursos int, registrado boolean)
language plpgsql security definer set search_path=public as $$
declare yo public.profesores; begin
  select * into yo from public.profesores where id = auth.uid();
  if yo.id is null or not (yo.es_admin or yo.es_super) then raise exception 'no_autorizado'; end if;
  return query
    select coalesce(a.correo, p.correo), p.nombre, coalesce(p.es_admin,false), coalesce(p.es_super,false),
           -- Cuenta las membresías reales (curso_profesores), no la columna deprecada
           -- cursos.profesor_id: desde la Sesión 37 los cursos nuevos nacen con
           -- profesor_id nulo, así que contar por ahí daba 0 para todo Jefe nuevo.
           (select count(*)::int from public.curso_profesores cp where cp.profesor_id = p.id),
           (p.id is not null)
    from public.profesores_autorizados a
    full outer join public.profesores p on lower(p.correo) = lower(a.correo)
    order by coalesce(a.creado, p.creado);
end $$;

-- Revoca a un profesor: borra su fila de profesores y saca su correo de la lista
-- blanca, para que no pueda volver a registrarse solo. Devuelve cuántos
-- profesores borró (0 si el correo estaba autorizado pero nunca se registró).
-- Sus cursos NO se borran: cursos.profesor_id tiene "on delete set null", así
-- que quedan huérfanos, visibles solo para los administradores, hasta que se
-- reasignen con kimun_prof_curso_asignar.
create or replace function public.kimun_prof_quitar(p_correo text)
returns int language plpgsql security definer set search_path=public as $$
declare yo public.profesores; obj public.profesores; n int; begin
  select * into yo from public.profesores where id = auth.uid();
  if yo.id is null or not (yo.es_admin or yo.es_super) then raise exception 'no_autorizado'; end if;
  -- Un administrador no puede revocarse a sí mismo: si es el único, la
  -- plataforma quedaría sin nadie que pueda administrarla y solo se recuperaría
  -- con SQL a mano.
  if lower(trim(coalesce(p_correo,''))) = lower(yo.correo) then raise exception 'no_te_puedes_quitar'; end if;
  select * into obj from public.profesores where lower(correo) = lower(trim(coalesce(p_correo,'')));
  -- Un SuperUsuario no puede revocar a un Admin ni a otro SuperUsuario: eso es solo del Admin.
  if obj.id is not null and (obj.es_admin or obj.es_super) and not yo.es_admin then
    raise exception 'no_autorizado';
  end if;
  delete from public.profesores where lower(correo) = lower(trim(coalesce(p_correo,'')));
  get diagnostics n = row_count;
  delete from public.profesores_autorizados where lower(correo) = lower(trim(coalesce(p_correo,'')));
  return n; end $$;

-- Nombra o quita un SuperUsuario. Solo el Admin (dueño de la plataforma). No toca
-- cuentas de Admin: no se degrada ni asciende un Admin por esta vía.
create or replace function public.kimun_prof_super_fijar(p_correo text, p_es_super boolean)
returns void language plpgsql security definer set search_path=public as $$
declare yo public.profesores; obj public.profesores; begin
  select * into yo from public.profesores where id = auth.uid();
  if yo.id is null or not yo.es_admin then raise exception 'no_autorizado'; end if;
  select * into obj from public.profesores where lower(correo) = lower(trim(coalesce(p_correo,'')));
  if obj.id is null then raise exception 'profesor_invalido'; end if;
  if obj.es_admin then raise exception 'no_autorizado'; end if;  -- un Admin no se toca por aquí
  update public.profesores set es_super = coalesce(p_es_super,false)
   where id = obj.id;
end $$;

-- Reasigna un curso a un profesor nombrándolo Profesor Jefe. Es la contraparte de
-- kimun_prof_quitar: sin esto, un curso huérfano no tendría forma de volver a tener
-- jefe. Desde los roles por asignatura (Sesión 37) el acceso lo decide
-- curso_profesores, NO cursos.profesor_id (columna deprecada): por eso reasignar
-- debe crear la membresía 'jefe', no solo tocar la columna vieja. Baja al jefe
-- anterior (índice único). Admin/Super (admin_colegio), igual que nombrar Jefe.
create or replace function public.kimun_prof_curso_asignar(p_curso_codigo text, p_correo text)
returns public.cursos language plpgsql security definer set search_path=public as $$
declare cid uuid; pid uuid; r public.cursos; begin
  if not public.kimun_prof_admin_colegio() then raise exception 'no_autorizado'; end if;
  select id into cid from public.cursos where codigo = upper(trim(coalesce(p_curso_codigo,'')));
  if cid is null then raise exception 'curso_invalido'; end if;
  select id into pid from public.profesores where lower(correo) = lower(trim(coalesce(p_correo,'')));
  if pid is null then raise exception 'profesor_invalido'; end if;
  -- Un solo Jefe por curso: baja al actual (si es otro) y sube al nuevo.
  update public.curso_profesores set rol='asignatura'
   where curso_id = cid and rol='jefe' and profesor_id <> pid;
  insert into public.curso_profesores(curso_id, profesor_id, rol, asignaturas)
  values (cid, pid, 'jefe', '{}'::text[])
  on conflict (curso_id, profesor_id) do update set rol='jefe', asignaturas='{}'::text[];
  select * into r from public.cursos where id = cid;
  return r; end $$;

-- ------------------------------------------------------------
-- Gestión del equipo de un curso (Sesión 37). Exigen jefe o admin. El profesor
-- debe existir ya en "profesores" (autorizado y registrado): no se crean cuentas
-- desde aquí.
-- ------------------------------------------------------------

-- Lista el equipo del curso con el rol y las asignaturas de cada uno.
drop function if exists public.kimun_prof_equipo(text);
create or replace function public.kimun_prof_equipo(p_curso_codigo text)
returns table(correo text, nombre text, rol text, asignaturas text[])
language plpgsql security definer set search_path=public as $$
declare cid uuid; begin
  select id into cid from public.cursos where codigo = upper(trim(p_curso_codigo));
  if cid is null or not public.kimun_prof_es_mio(cid) then raise exception 'no_autorizado'; end if;
  return query
    select pr.correo, pr.nombre, cp.rol, cp.asignaturas
    from public.curso_profesores cp
    join public.profesores pr on pr.id = cp.profesor_id
    where cp.curso_id = cid
    order by (cp.rol='jefe') desc, pr.nombre;   -- el jefe primero
end $$;

-- Agrega o actualiza a un profesor en el curso. Si p_rol='jefe', el jefe anterior
-- baja a 'asignatura' primero (el índice único no permite dos). Idempotente: sobre
-- (curso, profesor) actualiza la fila existente.
create or replace function public.kimun_prof_equipo_asignar(
  p_curso_codigo text, p_correo text, p_rol text, p_asignaturas text[])
returns void language plpgsql security definer set search_path=public as $$
-- ⚠️ La variable se llama v_rol y NO rol: curso_profesores tiene una columna `rol`, y
-- con el mismo nombre PostgreSQL no sabe cual es cual en el `where` del update de abajo
-- ("column reference rol is ambiguous", 42702). El bug vivio desde la Sesion 37 sin que
-- nadie lo viera porque plpgsql prepara cada sentencia la PRIMERA vez que la ejecuta, y
-- esa vive dentro del `if rol='jefe'`: solo se disparaba al nombrar Profesor Jefe desde
-- el panel, que es un camino que casi no se usa (el Jefe inicial lo puso la migracion).
declare cid uuid; pid uuid; v_rol text; asigs text[]; niv text; begin
  select id into cid from public.cursos where codigo = upper(trim(p_curso_codigo));
  if cid is null then raise exception 'no_autorizado'; end if;
  v_rol := case when p_rol = 'jefe' then 'jefe' else 'asignatura' end;
  -- Nombrar Jefe = solo Admin/SuperUsuario. Agregar/editar profe de asignatura = jefe/super/admin.
  if v_rol = 'jefe' then
    if not public.kimun_prof_admin_colegio() then raise exception 'no_autorizado'; end if;
  else
    if not public.kimun_prof_es_mio(cid) then raise exception 'no_autorizado'; end if;
  end if;
  select id into pid from public.profesores where lower(correo) = lower(trim(coalesce(p_correo,'')));
  if pid is null then raise exception 'profesor_invalido'; end if;
  -- El jefe ignora asignaturas (alcanza todas); un profe de asignatura sin
  -- materias queda sin acceso, pero es una fila válida ("aún no le asignan").
  asigs := case when v_rol = 'jefe' then '{}'::text[] else coalesce(p_asignaturas,'{}'::text[]) end;
  -- Una asignatura de OTRO nivel no se le puede asignar a este curso. El panel ya no las
  -- dibuja, pero la interfaz nunca es el único guardia: cualquiera puede llamar la función
  -- con la clave pública. Un curso SIN nivel (los de antes de esta columna) no se valida,
  -- porque no hay contra qué comparar.
  select nivel into niv from public.cursos where id = cid;
  if niv is not null and exists (select 1 from unnest(asigs) as u(cod) where right(u.cod,2) <> niv) then
    raise exception 'asignatura_de_otro_nivel';
  end if;
  if v_rol = 'jefe' then
    -- Solo puede haber un jefe: baja al actual (si es otro) antes de insertar.
    update public.curso_profesores set rol='asignatura'
     where curso_id = cid and curso_profesores.rol='jefe' and profesor_id <> pid;
  end if;
  insert into public.curso_profesores(curso_id, profesor_id, rol, asignaturas)
  values (cid, pid, v_rol, asigs)
  on conflict (curso_id, profesor_id) do update
    set rol = excluded.rol, asignaturas = excluded.asignaturas;
end $$;

-- Saca a un profesor del curso (incluido el jefe). No toca ningún dato de
-- desempeño: borra solo la fila de membresía. Devuelve cuántas filas borró.
create or replace function public.kimun_prof_equipo_quitar(p_curso_codigo text, p_correo text)
returns int language plpgsql security definer set search_path=public as $$
declare cid uuid; pid uuid; rol_obj text; n int; begin
  select id into cid from public.cursos where codigo = upper(trim(p_curso_codigo));
  if cid is null then raise exception 'no_autorizado'; end if;
  select id into pid from public.profesores where lower(correo) = lower(trim(coalesce(p_correo,'')));
  if pid is null then raise exception 'profesor_invalido'; end if;
  select rol into rol_obj from public.curso_profesores where curso_id=cid and profesor_id=pid;
  -- Quitar al Jefe = solo Admin/Super; quitar un profe de asignatura = jefe/super/admin.
  if rol_obj = 'jefe' then
    if not public.kimun_prof_admin_colegio() then raise exception 'no_autorizado'; end if;
  else
    if not public.kimun_prof_es_mio(cid) then raise exception 'no_autorizado'; end if;
  end if;
  delete from public.curso_profesores where curso_id = cid and profesor_id = pid;
  get diagnostics n = row_count; return n;
end $$;

-- Ranking de un curso en UNA asignatura, por acierto de primer intento. Requiere
-- acceso al curso y que la asignatura sea mía. NO devuelve codigo_acceso (es la
-- credencial del alumno; un ranking de consulta no la necesita), igual que
-- kimun_prof_dominio_oa: identifica por nombre.
drop function if exists public.kimun_prof_ranking_asignatura(text,text,int);
create or replace function public.kimun_prof_ranking_asignatura(
  p_curso_codigo text, p_asignatura text, p_minimo int default 20)
returns table(alumno text, avatar text, resp_1 bigint, ok_1 bigint, pct numeric,
              oa_tocados bigint, suficiente boolean)
language plpgsql security definer set search_path=public as $$
declare cid uuid; begin
  select id into cid from public.cursos where codigo = upper(trim(p_curso_codigo));
  if cid is null or not public.kimun_prof_acceso(cid) then raise exception 'no_autorizado'; end if;
  if not (p_asignatura = any(public.kimun_prof_asignaturas(cid)))
    then raise exception 'no_autorizado'; end if;
  return query
    select p.nombre, p.avatar,
           sum(d.resp_1), sum(d.ok_1),
           -- pct = primer intento, el mismo criterio del mapa de OA.
           round(sum(d.ok_1)::numeric / nullif(sum(d.resp_1),0) * 100, 0),
           count(distinct d.oa) filter (where d.resp_1 > 0),
           sum(d.resp_1) >= p_minimo
    from public.perfiles p
    join public.dominio d on d.perfil_id = p.id
                          and public.kimun_oa_asignatura(d.oa) = p_asignatura
    where p.curso_id = cid and p.codigo_acceso is not null
    group by p.id, p.nombre, p.avatar
    -- Los que no llegan al mínimo quedan al final; entre ellos, mejor primero.
    order by (sum(d.resp_1) >= p_minimo) desc,
             (sum(d.ok_1)::numeric / nullif(sum(d.resp_1),0)) desc nulls last,
             p.nombre;
end $$;

-- Limpieza de perfiles de prueba. Cuenta con p_ejecutar=false y borra con true.
create or replace function public.kimun_prof_limpiar_pruebas(p_ejecutar boolean)
returns int language plpgsql security definer set search_path=public as $$
declare yo public.profesores; n int; begin
  select * into yo from public.profesores where id = auth.uid();
  if yo.id is null or not yo.es_admin then raise exception 'no_autorizado'; end if;
  if p_ejecutar then
    delete from public.perfiles where es_bot = false and codigo_acceso is null;
    get diagnostics n = row_count;
  else
    select count(*) into n from public.perfiles where es_bot = false and codigo_acceso is null;
  end if;
  return n; end $$;

-- Rivales dummy (bots) para poder jugar sin esperar a nadie
insert into public.perfiles (id,nombre,avatar,codigo,es_bot,nivel) values
 (gen_random_uuid(),'Vale','🐯','KIM-VALE',true,4),
 (gen_random_uuid(),'Nico','🐼','KIM-NICO',true,3),
 (gen_random_uuid(),'Fran','🦄','KIM-FRAN',true,5),
 (gen_random_uuid(),'Diego','🐸','KIM-DIEG',true,2)
on conflict (codigo) do nothing;

-- PostgreSQL otorga EXECUTE a PUBLIC en toda función nueva, así que no basta con
-- omitirlas del grant de abajo: hay que quitarles el permiso de forma explícita.
-- Los generadores de código no tienen por qué llamarse desde afuera.
-- kimun_prof_es_mio tampoco se otorga: solo la llaman las demás funciones del
-- rol de profesor, que corren como su propietario y por eso siguen pudiendo usarla.
revoke execute on function
  public.kimun_gen_codigo(),
  public.kimun_gen_codigo_curso(), public.kimun_gen_codigo_alumno(),
  public.kimun_prof_es_mio(uuid),
  public.kimun_prof_acceso(uuid), public.kimun_prof_asignaturas(uuid),
  public.kimun_prof_admin_colegio()
  from public;

-- ------------------------------------------------------------
-- Funciones del desafío de refuerzo (Sesión 28).
-- Panel (kimun_prof_refuerzo_*): identifican al profesor por su sesión y validan la
-- propiedad del curso con kimun_prof_es_mio. Juego (kimun_refuerzo_*): operan sobre el
-- propio perfil y su curso, vía kimun_yo().
-- ------------------------------------------------------------

-- Lanza un desafío para un curso mío. Cierra el activo previo (uno por curso).
create or replace function public.kimun_prof_refuerzo_lanzar(p_curso_codigo text, p_asignatura text, p_objetivos text[])
returns uuid language plpgsql security definer set search_path=public as $$
declare cid uuid; nid uuid; begin
  select id into cid from public.cursos where codigo = upper(trim(p_curso_codigo));
  if cid is null or not public.kimun_prof_acceso(cid) then raise exception 'no_autorizado'; end if;
  -- Solo puedo lanzar refuerzo de una asignatura que dicto en este curso. Esto
  -- ES la defensa del servidor que el spec exige: aunque la interfaz oculte el
  -- botón, la función igual rechaza una asignatura ajena.
  if not (p_asignatura = any(public.kimun_prof_asignaturas(cid)))
    then raise exception 'no_autorizado'; end if;
  if p_objetivos is null or array_length(p_objetivos,1) is null then raise exception 'sin_objetivos'; end if;
  update public.desafios set activo=false where curso_id=cid and activo;
  insert into public.desafios(curso_id, asignatura, objetivos)
  values (cid, p_asignatura, p_objetivos) returning id into nid;
  return nid;
end $$;

-- Cierra el desafío activo de un curso mío. Devuelve cuántos cerró (0 o 1).
create or replace function public.kimun_prof_refuerzo_cerrar(p_curso_codigo text)
returns int language plpgsql security definer set search_path=public as $$
declare cid uuid; asig text; n int; begin
  select id into cid from public.cursos where codigo = upper(trim(p_curso_codigo));
  if cid is null or not public.kimun_prof_acceso(cid) then raise exception 'no_autorizado'; end if;
  -- El profe de asignatura solo cierra el refuerzo si es de una materia suya. El
  -- jefe/admin reciben las cuatro, así que pasan siempre.
  select asignatura into asig from public.desafios where curso_id=cid and activo limit 1;
  if asig is not null and not (asig = any(public.kimun_prof_asignaturas(cid)))
    then raise exception 'no_autorizado'; end if;
  update public.desafios set activo=false where curso_id=cid and activo;
  get diagnostics n = row_count; return n;
end $$;

-- Estado del desafío activo de un curso mío, con las cifras para el seguimiento. El cliente
-- calcula acierto_curso = correctas/total y primer_intento = pi_ok/pi_resp. El drop previo
-- es el guardia de idempotencia de las "returns table".
drop function if exists public.kimun_prof_refuerzo_estado(text);
create or replace function public.kimun_prof_refuerzo_estado(p_curso_codigo text)
returns table(desafio_id uuid, asignatura text, objetivos text[], creado timestamptz,
              inscritos bigint, completaron bigint, correctas bigint, total bigint,
              pi_ok bigint, pi_resp bigint)
language plpgsql security definer set search_path=public as $$
declare cid uuid; begin
  select id into cid from public.cursos where codigo = upper(trim(p_curso_codigo));
  if cid is null or not public.kimun_prof_acceso(cid) then raise exception 'no_autorizado'; end if;
  return query
   -- Un profe de asignatura solo ve el estado si el desafío activo es de una materia
   -- suya (admin/jefe/super reciben las cuatro, así que siempre lo ven). Si no es
   -- suya, no hay fila y el panel lo trata como "sin desafío activo para ti".
   with d as (select * from public.desafios where curso_id = cid and activo
              and asignatura = any(public.kimun_prof_asignaturas(cid)) limit 1)
   select d.id, d.asignatura, d.objetivos, d.creado,
     (select count(*) from public.perfiles p where p.curso_id = cid and p.codigo_acceso is not null),
     (select count(*) from public.desafio_resultados r where r.desafio_id = d.id),
     coalesce((select sum(r.correctas) from public.desafio_resultados r where r.desafio_id = d.id),0),
     coalesce((select sum(r.total)     from public.desafio_resultados r where r.desafio_id = d.id),0),
     coalesce((select sum(dm.ok_1)   from public.dominio dm join public.perfiles p on p.id = dm.perfil_id
               where p.curso_id = cid and dm.oa = any(d.objetivos)),0),
     coalesce((select sum(dm.resp_1) from public.dominio dm join public.perfiles p on p.id = dm.perfil_id
               where p.curso_id = cid and dm.oa = any(d.objetivos)),0)
   from d;
end $$;

-- El desafío activo del curso del alumno, SOLO si no lo ha completado (para el banner).
drop function if exists public.kimun_refuerzo_activo();
create or replace function public.kimun_refuerzo_activo()
returns table(desafio_id uuid, asignatura text, objetivos text[])
language plpgsql security definer set search_path=public as $$
declare mi uuid; cid uuid; begin
  mi := public.kimun_yo(); if mi is null then return; end if;
  select curso_id into cid from public.perfiles where id = mi;
  if cid is null then return; end if;
  return query
   select d.id, d.asignatura, d.objetivos
   from public.desafios d
   where d.curso_id = cid and d.activo
     and not exists (select 1 from public.desafio_resultados r
                     where r.desafio_id = d.id and r.perfil_id = mi)
   limit 1;
end $$;

-- Registra el resultado del alumno en un desafío. Solo si el desafío está activo y es del
-- curso del alumno. El primer intento manda (on conflict do nothing).
create or replace function public.kimun_refuerzo_completar(p_desafio_id uuid, p_correctas int, p_total int)
returns void language plpgsql security definer set search_path=public as $$
declare mi uuid; cid uuid; existe boolean; begin
  mi := public.kimun_yo(); if mi is null then return; end if;
  select curso_id into cid from public.perfiles where id = mi;
  select true into existe from public.desafios d
   where d.id = p_desafio_id and d.activo and d.curso_id = cid;
  if not existe then return; end if;
  insert into public.desafio_resultados(desafio_id, perfil_id, correctas, total)
  values (p_desafio_id, mi, greatest(0,coalesce(p_correctas,0)), greatest(1,coalesce(p_total,1)))
  on conflict (desafio_id, perfil_id) do nothing;
end $$;

-- ------------------------------------------------------------
-- Foto semanal del desempeño (Sesión 36).
--
-- `dominio` guarda contadores acumulados y no tiene historial: por diseño no se
-- registra cuándo se respondió cada cosa. Eso hace imposible responder "¿cómo le
-- fue al curso la semana pasada?", porque no existe la foto anterior contra la
-- cual comparar. Estas tablas guardan esa foto, tomada al cerrar cada domingo.
--
-- Se copia al mismo detalle que `dominio` (alumno × objetivo) a propósito: con el
-- detalle se puede calcular la diferencia por alumno, por objetivo, por asignatura
-- o por curso. Guardar algo ya agregado cerraría esas puertas.
-- ------------------------------------------------------------
create table if not exists public.dominio_semanal (
  semana      date not null,          -- domingo que cierra, en hora de Chile
  perfil_id   uuid not null references public.perfiles(id) on delete cascade,
  oa          text not null,
  respondidas int  not null,
  correctas   int  not null,
  resp_1      int  not null,
  ok_1        int  not null,
  primary key (semana, perfil_id, oa)
);
create index if not exists idx_dominio_semanal_perfil
  on public.dominio_semanal(perfil_id, semana);

-- El XP va aparte porque es uno por alumno, no uno por objetivo. Sirve para decir
-- cuánto avanzó, además de qué tan bien responde.
create table if not exists public.xp_semanal (
  semana    date not null,
  perfil_id uuid not null references public.perfiles(id) on delete cascade,
  xp        int  not null,
  primary key (semana, perfil_id)
);

-- Ningún cliente lee estas tablas: las escribe un trabajo programado y las leerá
-- el informe semanal desde el servidor. Con RLS activo y sin políticas, PostgREST
-- no expone nada a los alumnos ni a los profesores.
alter table public.dominio_semanal enable row level security;
alter table public.xp_semanal      enable row level security;

-- Toma la foto de la semana. La llama pg_cron los lunes de madrugada, y se puede
-- correr a mano para probar.
--
-- OJO con p_semana: solo cambia la ETIQUETA de la foto, no de dónde salen los
-- datos. Siempre copia el `dominio` actual. No puede reconstruir una semana
-- pasada —esa información no existe—, así que pasar una fecha vieja guardaría los
-- números de hoy con una etiqueta equivocada. Sirve para corregir el sello si el
-- trabajo falló y se corre un día tarde, no para inventar historia.
create or replace function public.kimun_foto_semanal(p_semana date default null)
returns int language plpgsql security definer set search_path=public as $$
declare s date; n int; begin
  -- El último domingo cerrado, en hora de Chile. Dos detalles a propósito:
  --   * America/Santiago y no UTC: el trabajo corre pasada la medianoche chilena,
  --     cuando en UTC ya es lunes.
  --   * date_trunc('week') y no "ayer": "ayer" solo cae en domingo si se corre un
  --     lunes. El cron siempre corre lunes, pero esta función también se ejecuta a
  --     mano para probar, y cualquier otro día quedaría mal sellada. date_trunc
  --     devuelve el lunes de la semana en curso (ISO), así que restarle un día da
  --     siempre el domingo que cerró.
  s := coalesce(p_semana,
                date_trunc('week', timezone('America/Santiago', now()))::date - 1);

  -- Solo alumnos inscritos en un curso. Los perfiles sueltos que crea cada
  -- teléfono al abrir el juego no son de nadie: incluirlos inflaría la tabla sin
  -- aportar. Mismo criterio que usa el panel del profesor.
  insert into public.dominio_semanal(semana, perfil_id, oa,
                                     respondidas, correctas, resp_1, ok_1)
  select s, d.perfil_id, d.oa, d.respondidas, d.correctas, d.resp_1, d.ok_1
  from public.dominio d
  join public.perfiles p on p.id = d.perfil_id
  where p.curso_id is not null and p.codigo_acceso is not null
  on conflict (semana, perfil_id, oa) do nothing;
  get diagnostics n = row_count;

  insert into public.xp_semanal(semana, perfil_id, xp)
  select s, p.id, p.xp
  from public.perfiles p
  where p.curso_id is not null and p.codigo_acceso is not null
  on conflict (semana, perfil_id) do nothing;

  -- Retención: dos años. Suficiente para comparar contra el año anterior, y acota
  -- el crecimiento (cada curso aporta ~1.300 filas por semana, ~67.000 al año).
  --
  -- El corte se calcula desde HOY y NO desde `s`: `s` lo controla quien llama, y un
  -- error de tipeo en el año al corregir el sello de una foto tardía
  -- (kimun_foto_semanal('2030-01-01')) borraria todo el historial. Ese historial no
  -- se puede reconstruir: es justo lo que estas tablas existen para evitar.
  delete from public.dominio_semanal
   where semana < (timezone('America/Santiago', now()) - interval '2 years')::date;
  delete from public.xp_semanal
   where semana < (timezone('America/Santiago', now()) - interval '2 years')::date;

  return n;
end $$;

-- No se otorga a nadie: la llama pg_cron, que corre con permisos propios. Se revoca
-- de public por lo mismo que kimun_prof_es_mio: ningún cliente —alumno o profesor—
-- debe poder disparar el trabajo ni tocar el historial.
--
-- Se nombran anon y authenticated ademas de public porque Supabase suele otorgarles
-- EXECUTE directo por default privileges del proyecto, y en ese caso revocar solo de
-- public no se los quita. Revocar un permiso inexistente es inofensivo.
revoke execute on function public.kimun_foto_semanal(date) from public, anon, authenticated;

-- ------------------------------------------------------------
-- Inscripción por enlace: las tres funciones
-- ------------------------------------------------------------

-- El alumno se inscribe solo. El orden de los pasos IMPORTA y está razonado:
create or replace function public.kimun_inscribirse(p_token text, p_nombre text, p_avatar text)
returns public.perfiles language plpgsql security definer set search_path=public as $$
declare cid uuid; r public.perfiles; nom text; tok text; act boolean; begin
  tok := upper(trim(coalesce(p_token,'')));

  -- 1. Si este aparato YA tiene perfil en ese curso, se devuelve y NO se consume
  --    cupo. Sin esto, recargar la página o volver al día siguiente crearía un
  --    segundo perfil huérfano que se lleva el avance del primero.
  select p.* into r
    from public.perfiles p
    join public.vinculos v     on v.perfil_id = p.id
    join public.inscripciones i on i.curso_id = p.curso_id
   where v.auth_uid = auth.uid() and i.token = tok;
  if r.id is not null then return r; end if;

  nom := trim(coalesce(p_nombre,''));
  if length(nom) < 2 or length(nom) > 40 then raise exception 'nombre_invalido'; end if;

  -- 2. El cupo se toma de forma ATÓMICA, en el mismo update que lo cuenta. Con un
  --    select y después un update, veinte inscripciones simultáneas pasan de largo
  --    — y eso es exactamente lo que ocurre cuando el enlace cae en el chat.
  update public.inscripciones
     set usados = usados + 1
   where token = tok and activo and usados < cupo
   returning curso_id into cid;
  -- Los tres fallos se separan, y el diagnostico corre SOLO aqui, cuando ya se sabe
  -- que no se tomo ningun cupo: la atomicidad de arriba queda intacta. Se acepta a
  -- proposito que esto revele si un token existe (el resto del archivo funde "no
  -- existe" con "no es tuyo" para los codigos de curso, que son cortos y tecleables;
  -- estos son 8 hex que nadie escribe a mano, y a cambio el apoderado sabe si se
  -- equivoco de enlace o si llego tarde).
  if cid is null then
    select i.activo into act from public.inscripciones i where i.token = tok;
    if not found then raise exception 'token_invalido'; end if;
    if not act   then raise exception 'enlace_cerrado'; end if;
    -- Existe y esta abierto, asi que la unica razon que queda es que se lleno.
    raise exception 'sin_cupo';
  end if;

  -- 3. El alumno recibe su ALU- igual, aunque no lo haya escrito: es lo que le
  --    permite seguir en otro aparato o recuperar su avance si borra los datos.
  insert into public.perfiles(id,nombre,avatar,codigo,curso_id,codigo_acceso,autoinscrito)
  values (gen_random_uuid(), nom, coalesce(p_avatar,'🦊'),
          public.kimun_gen_codigo(), cid, public.kimun_gen_codigo_alumno(), true)
  returning * into r;
  insert into public.vinculos(auth_uid,perfil_id) values (auth.uid(), r.id)
    on conflict (auth_uid) do update set perfil_id = excluded.perfil_id;
  return r; end $$;

-- Crea (o reemplaza) el enlace de un curso mío. Cerrar el anterior es lo que hace
-- que el índice único no choque, y de paso invalida el enlace viejo, que es lo que
-- uno espera al pedir uno nuevo.
create or replace function public.kimun_prof_inscripcion_crear(
         p_curso_codigo text, p_cupo int, p_experimental boolean)
returns public.inscripciones language plpgsql security definer set search_path=public as $$
declare cid uuid; r public.inscripciones; begin
  select id into cid from public.cursos where codigo = upper(trim(p_curso_codigo));
  -- No se distingue "no existe" de "no es tuyo", igual que en el resto del archivo:
  -- separarlos dejaría descubrir qué códigos de curso están en uso probándolos.
  if cid is null or not public.kimun_prof_es_mio(cid) then raise exception 'no_autorizado'; end if;
  if coalesce(p_cupo,0) < 1 or p_cupo > 500 then raise exception 'cupo_invalido'; end if;

  update public.inscripciones set activo = false where curso_id = cid and activo;
  update public.cursos set experimental = coalesce(p_experimental,false) where id = cid;
  insert into public.inscripciones(curso_id, token, cupo)
  values (cid, public.kimun_gen_codigo_inscripcion(), p_cupo)
  returning * into r;
  return r; end $$;

-- El curso de ESTE dispositivo, con su bandera experimental. La necesita el juego al
-- arrancar para saber si abre los capítulos: el modo es propiedad del curso y no del
-- aparato, así que un alumno que borra los datos del navegador y vuelve a canjear su
-- ALU- recupera el mismo modo en vez de caer en el juego normal sin entender por qué.
drop function if exists public.kimun_mi_curso();
create or replace function public.kimun_mi_curso()
returns table(nombre text, experimental boolean)
language sql security definer stable set search_path=public as $$
  select c.nombre, c.experimental
    from public.perfiles p join public.cursos c on c.id = p.curso_id
   where p.id = public.kimun_yo();
$$;

-- El enlace vivo de un curso mío, con cuántos de cuántos se inscribieron. Devuelve
-- cero filas si no hay ninguno, que es distinto de fallar.
-- El drop previo es el guardia de idempotencia que el archivo ya usa en kimun_ranking
-- y kimun_prof_listar: al ser "returns table", cambiar cualquier columna del returns
-- haría fallar el re-pegado con "cannot change return type of existing function".
drop function if exists public.kimun_prof_inscripcion_estado(text);
create or replace function public.kimun_prof_inscripcion_estado(p_curso_codigo text)
returns table(token text, cupo int, usados int, experimental boolean)
language plpgsql security definer set search_path=public as $$
declare cid uuid; begin
  select id into cid from public.cursos where codigo = upper(trim(p_curso_codigo));
  if cid is null or not public.kimun_prof_es_mio(cid) then raise exception 'no_autorizado'; end if;
  return query
    select i.token, i.cupo, i.usados, c.experimental
      from public.inscripciones i join public.cursos c on c.id = i.curso_id
     where i.curso_id = cid and i.activo;
end $$;

grant execute on function
  public.kimun_perfil(text,text), public.kimun_buscar(text), public.kimun_jugadores(),
  public.kimun_crear_duelo(text,text,jsonb,int,int), public.kimun_pendientes(),
  public.kimun_responder(uuid,int,int), public.kimun_historial(),
  public.kimun_yo(), public.kimun_xp(int), public.kimun_dificil(int), public.kimun_ranking(), public.kimun_canjear(text),
  public.kimun_dominio(jsonb),
  public.kimun_prof_yo(), public.kimun_prof_alta(text),
  public.kimun_prof_listar(), public.kimun_prof_curso_crear(text,text),
  public.kimun_prof_curso_nivel(text,text),
  public.kimun_prof_curso_quitar(text), public.kimun_prof_alumno_agregar(text,text,text),
  public.kimun_prof_alumno_quitar(text), public.kimun_prof_xp_fijar(text,int),
  public.kimun_prof_autorizar(text), public.kimun_prof_profesores(),
  public.kimun_prof_quitar(text), public.kimun_prof_curso_asignar(text,text),
  public.kimun_prof_limpiar_pruebas(boolean),
  public.kimun_prof_dominio(text), public.kimun_prof_dominio_alumno(uuid),
  public.kimun_prof_dominio_reiniciar(text)
  , public.kimun_prof_dominio_oa(text,text)
  , public.kimun_prof_participacion(text)
  , public.kimun_prof_refuerzo_lanzar(text,text,text[])
  , public.kimun_prof_refuerzo_cerrar(text)
  , public.kimun_prof_refuerzo_estado(text)
  , public.kimun_refuerzo_activo()
  , public.kimun_refuerzo_completar(uuid,int,int)
  , public.kimun_prof_equipo(text)
  , public.kimun_prof_equipo_asignar(text,text,text,text[])
  , public.kimun_prof_equipo_quitar(text,text)
  , public.kimun_prof_ranking_asignatura(text,text,int)
  , public.kimun_prof_super_fijar(text,boolean)
  , public.kimun_inscribirse(text,text,text)
  , public.kimun_prof_inscripcion_crear(text,int,boolean)
  , public.kimun_prof_inscripcion_estado(text)
  , public.kimun_mi_curso()
  to anon, authenticated;

-- ------------------------------------------------------------
-- Retiro del modelo de clave global
--
-- El Modo Admin, que se abría con una sola contraseña compartida, fue
-- reemplazado por las cuentas de profesor (kimun_prof_*). Sus funciones ya no se
-- crean más arriba, pero eso no las quita de las bases donde alguna vez se
-- aplicó este archivo: hay que eliminarlas de verdad. Estos drop son idempotentes
-- (el "if exists" no falla si ya no están) y usan la firma exacta que tenían,
-- porque PostgreSQL identifica una función por sus tipos de parámetros.
-- ------------------------------------------------------------
drop function if exists public.kimun_admin_curso_crear(text,text);
drop function if exists public.kimun_admin_curso_quitar(text,text);
drop function if exists public.kimun_admin_alumno_agregar(text,text,text,text);
drop function if exists public.kimun_admin_listar(text);
drop function if exists public.kimun_admin_alumno_quitar(text,text);
drop function if exists public.kimun_admin_xp_fijar(text,text,int);
drop function if exists public.kimun_admin_limpiar_pruebas(text,boolean);
drop function if exists public.kimun_admin_ok(text);

-- Y la clave misma: ya no la valida nadie, así que no tiene por qué seguir ahí.
delete from public.config where clave = 'admin_clave';

-- ------------------------------------------------------------
-- Relleno inicial de "visto" (participación).
--
-- Sin esto, al aplicar la columna por primera vez el curso entero se vería como "nunca ha
-- jugado" hasta que cada niño vuelva a abrir el juego, y el profesor leería un curso
-- muerto. Se copia el último contacto conocido desde "dominio". Quien jugó campañas parte
-- con su fecha real; quien solo jugó Reto de Cálculo parte en nulo hasta su próxima
-- entrada (esa tabla no registra objetivos). El "where visto is null" lo hace idempotente:
-- re-pegar el archivo no pisa las fechas reales ya guardadas.
-- ------------------------------------------------------------
update public.perfiles p
   set visto = d.ult
  from (select perfil_id, max(actualizado) ult from public.dominio group by perfil_id) d
 where d.perfil_id = p.id and p.visto is null;

-- ------------------------------------------------------------
-- Agenda de la foto semanal.
--
-- pg_cron corre en UTC. "Domingo 23:59" en Santiago no es una hora fija en UTC:
-- es lunes 02:59 en verano (UTC−3) y lunes 03:59 en invierno (UTC−4). Por eso el
-- trabajo se agenda el lunes 04:05 UTC, que cae 00:05 o 01:05 del lunes en Chile
-- según la época: en ambos casos ya cerró el domingo y no hay nadie jugando.
-- La fecha de la foto la calcula la función con America/Santiago, no el cron.
do $$
begin
  -- Si pg_cron no esta habilitado, NO se agenda pero tampoco se rompe el pegado del
  -- archivo. schema.sql se re-pega entero en cada migracion y una llamada suelta a
  -- cron.schedule sobre una base sin la extension abortaria todo el script.
  if not exists (select 1 from pg_extension where extname = 'pg_cron') then
    raise notice 'pg_cron no esta habilitado: la foto semanal NO quedo agendada.';
    return;
  end if;

  -- El unschedule previo hace idempotente el re-pegado: sin el, volver a ejecutar
  -- schema.sql podria dejar el trabajo duplicado en versiones antiguas de pg_cron.
  -- El exception lo tolera cuando el trabajo todavia no existe.
  begin
    perform cron.unschedule('foto-semanal');
  exception when others then null;
  end;

  perform cron.schedule('foto-semanal', '5 4 * * 1',
                        'select public.kimun_foto_semanal()');
end $$;
