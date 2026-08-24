# Foto semanal del desempeño

**Fecha:** 2026-08-23
**Estado:** Diseño aprobado, pendiente de plan de implementación

## Contexto

`dominio` guarda **contadores acumulados** por alumno y objetivo (`respondidas`,
`correctas`, `resp_1`, `ok_1`) y una marca `actualizado`. No guarda historial, y
es una decisión deliberada de privacidad: no queda registro de qué pregunta falló
ni cuándo, así que no se puede reconstruir la sesión de un niño.

La consecuencia es que hoy **no se puede responder "¿cómo le fue al curso la
semana pasada?"**. No existe la foto anterior contra la cual comparar.

Este trabajo agrega esa foto: una copia semanal de los contadores, tomada al
cerrar el domingo. Es la base para el informe semanal por correo, que se
diseñará aparte.

**Por qué ahora y no junto con el correo:** el historial no se puede reconstruir
hacia atrás. Cada semana sin foto es una semana de datos que no se recupera
nunca. Conviene empezar a acumular de inmediato, aunque el informe llegue
después.

## Decisiones tomadas

1. **Se copia `dominio` tal cual**, a la misma granularidad (alumno × objetivo).
   Guardar algo ya agregado cerraría puertas: con el detalle se puede calcular la
   diferencia por alumno, por objetivo, por asignatura o por curso.
2. **Se guarda también el XP** de cada alumno, para poder decir cuánto avanzó
   además de qué tan bien responde.
3. **Solo alumnos inscritos en un curso.** Los perfiles sueltos que crea cada
   teléfono al abrir el juego no son de nadie; incluirlos inflaría la tabla sin
   aportar. Mismo criterio que usa el resto del panel.
4. **El trabajo corre el lunes 04:05 UTC**, por el cambio de hora (ver abajo).
5. **Retención de 2 años**, limpiada por el mismo trabajo.
6. **Sin interfaz.** Este trabajo no muestra nada: solo acumula. Lo que se ve
   llega con el informe semanal.

## El horario y el cambio de hora

`pg_cron` corre en **UTC**. "Domingo 23:59" en Santiago no es una hora fija en
UTC: es **lunes 02:59** en verano (UTC−3) y **lunes 03:59** en invierno (UTC−4).
Dejar una hora fija en UTC haría que la foto se corriera con las estaciones y
que algunos domingos cortara antes de terminar el día.

**Solución:** correr el trabajo el **lunes a las 04:05 UTC**, que cae a las 00:05
o 01:05 del lunes en Chile según la época — en ambos casos ya terminó el domingo
y no hay nadie jugando. La foto se **sella con la semana chilena que cierra**,
calculada con `America/Santiago`, no con la fecha UTC.

Como los contadores de `dominio` solo crecen, tomar la foto unos minutos después
de medianoche es inofensivo: lo que importa es que sea después de que terminó el
domingo en Chile y antes de la actividad del lunes.

Requiere habilitar la extensión **`pg_cron`** en el proyecto
(Database → Extensions). Es un paso manual, igual que el resto de las migraciones
de Supabase.

## Modelo de datos

```sql
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

create table if not exists public.xp_semanal (
  semana    date not null,
  perfil_id uuid not null references public.perfiles(id) on delete cascade,
  xp        int  not null,
  primary key (semana, perfil_id)
);
```

La clave primaria incluye `semana`, así que la foto de cada semana es
independiente y no se pisan entre sí.

Ambas tablas llevan **RLS activo y sin políticas**, como el resto del esquema.
Supabase expone por PostgREST todas las tablas de `public`, así que sin esto el
historial completo quedaría legible desde el cliente. Sin políticas, ningún
alumno ni profesor puede leerlas: las escribe el trabajo programado y las leerá
el informe semanal desde el servidor.

## El trabajo

```sql
kimun_foto_semanal(p_semana date default null) returns int
```

- Si `p_semana` es nulo, calcula **el último domingo cerrado** en hora de Chile:
  `date_trunc('week', timezone('America/Santiago', now()))::date - 1`.

  Se usa `date_trunc('week', …)` y no "ayer" porque "ayer" solo cae en domingo si
  el trabajo corre un lunes. El cron siempre corre lunes, pero la función también
  se ejecuta a mano para probar, y en cualquier otro día "ayer" sellaría la foto
  con una etiqueta que no es domingo. `date_trunc('week')` devuelve el lunes de la
  semana en curso (ISO), así que restarle un día da siempre el domingo que cerró,
  se corra el día que se corra.
- Copia a `dominio_semanal` las filas de `dominio` de alumnos **inscritos**
  (`perfiles.curso_id is not null and codigo_acceso is not null`).
- Copia el XP de esos mismos alumnos a `xp_semanal`.
- Borra las fotos con `semana` anterior a dos años.
- Devuelve cuántas filas de dominio guardó.

**Idempotente:** ambas copias usan `on conflict do nothing`. Si el trabajo corre
dos veces la misma semana, gana la primera —que es la más cercana al cierre real
del domingo— y la segunda no hace nada. Volver a pegar el `schema.sql` completo
tampoco duplica.

**Se puede correr a mano** pasando `p_semana`, que es como se probará y como se
recuperaría una semana si el trabajo fallara.

**Ojo con qué significa `p_semana`:** solo cambia la **etiqueta** de la foto, no
de dónde salen los datos. La función siempre copia el `dominio` **actual**. No
puede reconstruir una semana pasada —esa información no existe—, así que pasar
una fecha vieja no rellena el hueco: guardaría los números de hoy con una
etiqueta equivocada. Sirve para corregir el sello de una foto tomada tarde (por
ejemplo, si el trabajo falló el lunes y se corre el martes), no para inventar
historia.

### Permisos

La función **no se agrega a la lista de `grant execute`**: la llama `pg_cron`,
que corre con permisos propios. Además se revoca de `public`, siguiendo el mismo
patrón que `kimun_prof_es_mio`. Ningún cliente —alumno o profesor— debe poder
dispararla.

### Programación

```sql
select cron.schedule('foto-semanal', '5 4 * * 1',
                     $$select public.kimun_foto_semanal()$$);
```

Lunes 04:05 UTC. El nombre fijo `foto-semanal` permite reprogramar sin duplicar.

## Tamaño y retención

Con 26 alumnos y unos 50 objetivos tocados, cada curso aporta ~1.300 filas por
semana: unas 67.000 al año. Cómodo para Postgres, pero crece de forma lineal con
cursos y semanas, y el plan gratuito de Supabase tiene límite de espacio.

Por eso la retención de **2 años** se aplica en el mismo trabajo: suficiente para
comparar con el año anterior, y acota el crecimiento.

## Verificación

1. Habilitar `pg_cron` y confirmar que la extensión quedó activa.
2. Correr `select kimun_foto_semanal();` a mano sobre el curso demo `CUR-BA04` y
   confirmar que aparecen filas en `dominio_semanal` y `xp_semanal`.
3. Confirmar que `semana` es el **domingo correcto** en hora de Chile, no el de
   UTC.
4. Correr la función otra vez: no debe duplicar ni fallar.
5. Confirmar que **no** se guardaron perfiles sueltos (sin curso o sin
   `codigo_acceso`).
6. Confirmar que la función **no** es ejecutable desde el cliente.
7. Verificar que el trabajo quedó agendado: `select * from cron.job;`.

## Lo que queda fuera a propósito

- **El correo semanal.** Este trabajo solo acumula datos; el informe y su envío
  son un proyecto aparte, que se apoyará en estas tablas y en los roles por
  asignatura.
- **Mostrar la evolución en el panel.** Con las fotos se podría dibujar la
  tendencia de un curso, y probablemente valga la pena, pero no se pidió y suma
  trabajo de interfaz.
- **Fotos diarias.** Multiplicarían el espacio por siete para responder la misma
  pregunta.
