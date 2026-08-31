# Inscripción por enlace único — plan de implementación

> **Diseño:** `docs/superpowers/specs/2026-08-30-inscripcion-por-enlace-design.md`

**Meta:** un enlace al chat, cada uno se crea solo en un curso ya abierto, con todo el contenido
salvo los jefes, y su avance queda registrado.

**Método:** un paso por vez, verificando en navegador real con `scripts/cdp.mjs`. Los 404 no
llegan a la consola de forma fiable.

⚠️ **Toca `supabase/schema.sql`**, así que al final Roberto lo re-aplica a mano y hace la prueba de
aislamiento entre profesores. El asistente no ejecuta SQL contra producción.

---

## Tarea 1 · Partir `MODO_ABIERTO` en dos (sin el backend, sin cambiar nada todavía)

Va primero porque es lo único que se puede probar entero sin base de datos, y porque deja el
juego listo para cuando llegue la inscripción.

- [ ] **Paso 1: la foto de hoy.** Con `cdp.mjs`, en los tres cursos y en los tres modos
      (normal, `?qa=1`, `?solo=…`), volcar qué capítulos y qué jefes salen desbloqueados. Es el
      patrón contra el que se compara todo lo que sigue.

- [ ] **Paso 2: las dos banderas.** En los **tres** `index.html`, junto a la declaración actual:

```js
/* MODO_ABIERTO mezclaba DOS preguntas distintas, y el modo experimental necesita
   responderlas distinto: capítulos abiertos pero jefes cerrados. Es el mismo corte que
   la Sesión 41 le hizo a QA, que mezclaba cuatro cosas.
     CAPS_ABIERTOS   ignora los candados entre capítulos y entre etapas
     JEFES_ABIERTOS  ignora los candados de los jefes
   EXPERIMENTAL lo fija el curso, no el aparato: ver cargarCurso(). */
const CAPS_ABIERTOS  = QA||PRUEBA||EXPERIMENTAL;
const JEFES_ABIERTOS = QA||PRUEBA;
```

- [ ] **Paso 3: reemplazar los seis usos**, uno por uno, sin agrupar:
      `nodoCampDesbloqueado` y el `MODO_ABIERTO` de las etapas → `CAPS_ABIERTOS`;
      `desafioDesbloqueado`, `jefeFinalDesbloqueado`, `jefeCalcDesbloqueado` y
      `jefeFinalMateDesbloqueado` → `JEFES_ABIERTOS`.
      **`nuevoProgreso` abre todas las etapas menos la del jefe** cuando `CAPS_ABIERTOS &&
      !JEFES_ABIERTOS`.
      ⚠️ Con `EXPERIMENTAL=false` cableado a mano, el volcado del Paso 1 debe salir **idéntico**.

- [ ] **Paso 4: verificar.** Los tres cursos, los tres modos, contra la foto. Cero 404, cero
      errores. **Si algo difiere, parar**: `?qa=1` y el modo prueba están repartidos y no pueden
      cambiar de comportamiento.

- [ ] **Paso 5: commit.**

---

## Tarea 2 · El backend

- [ ] **Paso 1: la tabla y la columna del curso** (en `supabase/schema.sql`, idempotente como
      todo el archivo):

```sql
alter table public.cursos add column if not exists experimental boolean not null default false;

create table if not exists public.inscripciones (
  id       uuid primary key default gen_random_uuid(),
  curso_id uuid not null references public.cursos(id) on delete cascade,
  token    text not null unique,
  cupo     int  not null check (cupo > 0),
  usados   int  not null default 0,
  activo   boolean not null default true,
  creado   timestamptz default now()
);
alter table public.inscripciones enable row level security;
```

> Sin políticas de lectura, como las otras 13 tablas: nada se consulta directo.
> `activo` no tendrá botón —Roberto eligió el cupo como único límite— pero hace falta para contar
> y deja una salida de emergencia si el enlace llega a donde no debía.

- [ ] **Paso 2: `kimun_inscribirse(p_token, p_nombre, p_avatar)`**, en este orden exacto:

```sql
create or replace function public.kimun_inscribirse(p_token text, p_nombre text, p_avatar text)
returns public.perfiles language plpgsql security definer set search_path=public as $$
declare cid uuid; r public.perfiles; nom text; begin
  -- 1. Si este aparato YA tiene perfil en ese curso, devolverlo y NO consumir cupo.
  --    Sin esto, recargar la página o volver al día siguiente crea un segundo perfil
  --    huérfano que se lleva el avance del primero.
  select p.* into r from public.perfiles p
    join public.vinculos v on v.perfil_id = p.id
    join public.inscripciones i on i.curso_id = p.curso_id
   where v.auth_uid = auth.uid() and i.token = upper(trim(p_token));
  if r.id is not null then return r; end if;

  nom := trim(coalesce(p_nombre,''));
  if length(nom) < 2 or length(nom) > 40 then raise exception 'nombre_invalido'; end if;

  -- 2. Tomar el cupo de forma ATÓMICA. Con un select y luego un update, veinte
  --    inscripciones simultáneas pasan de largo — y eso es exactamente lo que ocurre
  --    cuando el enlace cae en el chat.
  update public.inscripciones
     set usados = usados + 1
   where token = upper(trim(p_token)) and activo and usados < cupo
   returning curso_id into cid;
  if cid is null then raise exception 'sin_cupo'; end if;

  insert into public.perfiles(id,nombre,avatar,codigo,curso_id,codigo_acceso)
  values (gen_random_uuid(), nom, coalesce(p_avatar,'🦊'),
          public.kimun_gen_codigo(), cid, public.kimun_gen_codigo_alumno())
  returning * into r;
  insert into public.vinculos(auth_uid,perfil_id) values (auth.uid(), r.id)
    on conflict (auth_uid) do update set perfil_id = excluded.perfil_id;
  return r; end $$;
```

- [ ] **Paso 3: para el panel**, `kimun_prof_inscripcion_crear(curso, cupo, experimental)` y
      `kimun_prof_inscripcion_estado(curso)`, ambas tras `kimun_prof_es_mio`. Y sumar las tres al
      `grant execute`.
      ⚠️ **PostgreSQL otorga EXECUTE a PUBLIC por defecto**: omitir una función del `grant` NO la
      protege. Es una trampa que este proyecto ya pagó en la Sesión 19.

- [ ] **Paso 4: que `cargarCurso` traiga `experimental`**, para que el modo viva en el curso y
      sobreviva a borrar los datos del navegador.

- [ ] **Paso 5: revisión del SQL antes de mandarlo a producción.** Cero `drop table`, cero
      `truncate`; los `delete` solo dentro de cuerpos de función. `docs/aplicar-schema.md` describe
      el procedimiento.

---

## Tarea 3 · La pantalla de inscripción

- [ ] **Paso 1:** leer `?inscribir=` junto a los otros parámetros, y `EXPERIMENTAL` desde el curso.
- [ ] **Paso 2:** pantalla que pide el nombre y llama a `kimun_inscribirse`.
- [ ] **Paso 3: los tres errores, con tres mensajes distintos** — token que no existe, cerrado, y
      sin cupo. Un mensaje genérico deja al apoderado sin saber si escribió mal o llegó tarde.
- [ ] **Paso 4:** al entrar, mostrarle su código `ALU-` una vez, con el texto de que sirve para
      seguir en otro aparato. Se lo ganó aunque no lo haya escrito.
- [ ] **Paso 5: verificar** que sin `?inscribir=` no cambia absolutamente nada.

---

## Tarea 4 · El panel

- [ ] Un bloque por curso: crear el enlace (con su cupo), verlo, copiarlo y ver **cuántos de
      cuántos** se inscribieron.
- [ ] Marcar en la lista de alumnos a los **autoinscritos**, para distinguirlos de los que
      escribió el profesor. Los nombres ya no vienen verificados.
- [ ] A 375 px sin desborde: es el panel que ya falló ahí en la Sesión 26.

---

## Tarea 5 · Las pruebas que no se saltan

- [ ] **Veinte inscripciones simultáneas contra un cupo de diez → exactamente diez perfiles.**
      Es la prueba que justifica el `update` atómico, y hay que correrla, no razonarla.
- [ ] Recargar y volver al día siguiente **no crean un segundo perfil**.
- [ ] En el juego: **todos los capítulos abiertos**, el jefe del capítulo cerrado hasta completar
      sus 4 etapas, el Jefe Final cerrado hasta completar los capítulos.
- [ ] El XP, el dominio por objetivo y la participación **aparecen en el panel** sin acción extra.
- [ ] El modo experimental **sobrevive** a borrar los datos del navegador y re-canjear el `ALU-`.
- [ ] **Aislamiento entre profesores** (de Roberto, necesita dos cuentas reales): un profe de
      asignatura no puede crear ni ver inscripciones de un curso ajeno.
- [ ] Los tres cursos y el juego normal, sin `?inscribir=`, **exactamente igual que hoy**.

---

## Tarea 6 · Dejarlo escrito

- [ ] `CLAUDE.md`: el parámetro `?inscribir=` junto a los otros, y las dos banderas nuevas.
- [ ] `pendiente.md` y `docs/comercial.md`: qué es el modo experimental y qué **no** prometer
      (el enlace es la credencial y abre el producto completo).
