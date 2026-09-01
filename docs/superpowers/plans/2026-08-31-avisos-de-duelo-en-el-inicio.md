# Avisos de duelo en la pantalla de inicio

**Reportado por Roberto (31/08/2026):** *"Hice un duelo, no salió aviso que me habían
desafiado y al terminar tampoco mandó el resultado. Eso déjalo en la página de inicio."*

---

## El diagnóstico, medido antes de proponer nada

Lo que falta no es un aviso: es **la mitad del ciclo del duelo asíncrono**, que nunca se
cerró.

| Pieza | Estado real |
|---|---|
| `kimun_pendientes` — *¿me desafiaron?* | ✅ Existe y funciona. Pero **solo se consulta al entrar a la pantalla del Duelo en línea** (`cargarPendientes`). Si no entras ahí, no te enteras de nada |
| `kimun_historial` — *¿cómo terminó?* | ✅ Existe en el servidor **desde la Sesión 6** · ❌ **ningún cliente la ha llamado nunca** |
| Aviso en `scr-rol` | ❌ No existe |

**La consecuencia:** el retado sí ve su resultado —se lo devuelve `kimun_responder` en su
pantalla al terminar de responder— pero **el retador no se entera jamás**. Desafías a
alguien, contesta al otro día, y para ti el duelo se queda en silencio para siempre. Es el
único modo social del juego y su ciclo no cierra.

## La decisión que hubo que tomar

El aviso de *"te desafiaron"* es **gratis**: `kimun_pendientes` ya devuelve solo los vivos,
así que el aviso se apaga solo al jugarlo o al expirar a las 24 h.

El del **resultado** no, porque la base **no tenía noción de "esto ya lo vi"** — sin eso el
aviso se queda pegado para siempre. Roberto eligió guardarlo **en el servidor** y no en
`localStorage`: así sobrevive a borrar los datos del navegador y no se repite en el tablet.
Es la misma decisión que la Sesión 73 tomó con el modo experimental, y por el mismo motivo.

---

## Diseño

Un banner propio en `scr-rol`, **copiando el patrón que ya existe** (`#bannerDesafio` +
`revisarDesafio()`, el del refuerzo del profe): `hidden` por defecto, best-effort, y que
**falla en silencio** sin tocar el resto de la pantalla.

**Elemento aparte, `#bannerDuelo`, y no reutilizar `#bannerDesafio`:** si el profe lanzó un
refuerzo y además te desafiaron, uno pisaría al otro. Reusa su **misma clase CSS**, así que
no se agrega ni una regla nueva.

### Qué muestra, y en qué orden

1. **Los resultados primero, de a uno y cerrables.** Son noticia de una sola vez.
2. **El desafío después.** Queda vivo hasta jugarlo o hasta que expire, así que no se pierde
   si hoy queda tapado por un resultado.

| Clase | Se ve así |
|---|---|
| `gane` | 🏆 ¡Ganaste tu duelo! · Contra Nico · 7 a 5 |
| `perdi` | 💪 Te ganaron esta vez · Contra Vale · 5 a 7 |
| `empate` | 🤝 ¡Empataron! · Contra Fran · 6 a 6 |
| `expiro` | ⌛ Tu duelo venció · Diego no alcanzó a responder |
| `desafio` | ⚔️ Te desafiaron · Vale te está esperando → **¡Jugar ahora!** |

### Dos guardas que no son opcionales

- **No aparece con la puerta cerrada.** `btnDuelo` cae al duelo local cuando `bloqueado()`,
  así que el duelo en línea es **inalcanzable**: anunciarlo sería ofrecer algo que no se
  puede tocar.
- **No aparece sin perfil ni en enlaces de muestra** (`!SB || !MI_PERFIL`), igual que el
  banner del profe.

### Dónde vive cada cosa

- **`revisarDuelos()` y `pintarAvisoDuelo()` van en `assets/js/motor.js`**: no tienen ni un
  dato propio del curso, así que se escriben **una vez** y los tres cursos lo heredan. Es
  para esto que sirvió la Sesión 75.
- El `<div id="bannerDuelo">` y las dos llamadas de arranque van en cada fork, **byte a byte
  idénticas**.

---

## Tareas

### 1 · Servidor (`supabase/schema.sql`)

- [x] **Columna `duelos.visto_retador`**, sembrada con el truco de la primera aplicación:

```sql
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema='public' and table_name='duelos'
                   and column_name='visto_retador') then
    alter table public.duelos add column visto_retador boolean not null default true;
    alter table public.duelos alter column visto_retador set default false;
  end if;
end $$;
```

> ⚠️ **Por qué así y no `add column if not exists ... default false`:** con `false` todos los
> duelos que ya existen pasarían a "sin ver", y Roberto abriría el juego con el resultado de
> un duelo de hace tres semanas. Y una migración `update ... set visto=true` **no es
> idempotente**: al re-aplicar el esquema —que en este proyecto es rutina— borraría avisos
> legítimos. El `if not exists` sobre la columna corre **una sola vez** por construcción.

- [x] **`kimun_duelos_avisos()`** — lo que vale la pena mostrar en el inicio.
- [x] **`kimun_duelo_visto(p_id uuid)`** — marca uno, y solo si es mío como retador.
- [x] Las dos al bloque `grant execute`.

> ⚠️ **El desempate se duplica y hay que decirlo:** `kimun_responder` decide el ganador (más
> aciertos; si empatan, menos tiempo) y **no lo guarda**, así que `kimun_duelos_avisos` lo
> vuelve a calcular. Si se cambia una regla, hay que cambiar las dos. Va anotado en el código.

### 2 · Motor (`assets/js/motor.js`)

- [x] `revisarDuelos()` + `pintarAvisoDuelo()`.
- [x] Llamarla junto a `revisarDesafio()` en `go()` y en `btnMap`.
- [x] ⚠️ **`escHtml` en el nombre del rival.** Es texto escrito por otra persona —desde la
  Sesión 73 los autoinscritos escriben su propio nombre— y este proyecto ya tuvo un **XSS
  almacenado por esta vía exacta** (Sesión 51, 4 rutas del duelo con `innerHTML` sin escapar).

### 3 · Los tres forks

- [x] `<div id="bannerDuelo" class="banner-desafio" hidden></div>` bajo `#bannerDesafio`.
- [x] `revisarDuelos()` junto a las dos llamadas a `revisarDesafio()` (arranque y post-canje).

### 4 · Verificación (`scripts/cdp.mjs`, jugando)

- [x] El banner **no aparece** sin perfil, con la puerta cerrada, ni en `?solo=`.
- [x] Con avisos simulados: sale el resultado, "¡Entendido!" lo cierra y **aparece el
  siguiente**; agotados los resultados sale el desafío y su botón abre el duelo.
- [x] Un nombre con `<img src=x onerror=...>` **sale como texto**.
- [x] Los tres cursos juegan una etapa real · **cero errores de consola y cero 404**.
- [x] Las dos funciones nuevas quedan **byte a byte idénticas** en los tres forks.

---

## Lo que NO se hace

- ❌ **Notificaciones push.** Siguen fuera de alcance (necesitan la PWA, Bloque C).
- ❌ Avisar al **retado** de su propio resultado: ya lo ve en pantalla al terminar.
- ❌ Historial completo de duelos. `kimun_historial` sigue sin llamarse, y está bien: lo que
  faltaba era **cerrar el ciclo**, no una pantalla de estadísticas.

---

## Resultado (31/08/2026) — ejecutado y verificado

Verificado **jugando**, con `scripts/cdp.mjs`, y **los tres cursos dan lo mismo**:

| Caso | Resultado |
|---|---|
| **Sin el esquema aplicado** | Banner oculto, **inicio intacto**. Es el caso que más importaba |
| Sin perfil (enlace de muestra, sin conexión) | Oculto |
| Con avisos | 🏆 *¡Ganaste tu duelo! · Contra … · 7 a 5* — el resultado primero |
| Nombre con `<img src=x onerror=…>` | **Sale como texto, el payload no se ejecuta** |
| «¡Entendido!» | Encadena al siguiente (⌛ venció) y luego al ⚔️ desafío |
| Marcados como vistos | `["r1","r2"]` — **solo los resultados**, nunca el desafío |
| Botón del desafío | Lleva a `scr-duelo-online` |
| Con la puerta cerrada | Oculto |
| Regresión | Etapa real jugada en los tres · guardado de 8° intacto (777 XP) · `__MOTOR_OK` |
| | **0 errores de consola · 0 404** (aparte de la función que todavía no existe) |

### Un defecto vivo encontrado de paso, y arreglado

`odResponder` acumulaba el tiempo con **`OD.tiempo += (15 - OD.t)`**, con el 15 escrito a
mano — y el reloj arranca en `DUELO_SEG`, que en **3° vale 30**. O sea que en 3° cada
respuesta sumaba **tiempo negativo**: contestar al toque daba −15.

Es hermano de los `t:15` que la Sesión 74 migró; este quedó porque no está en la
declaración del estado sino en la aritmética. **No cambiaba quién ganaba** —los dos
jugadores del mismo curso llevan el mismo desfase, y `kimun_jugadores` no cruza cursos— pero
dejaba `retador_tiempo` y `retado_tiempo` en valores sin sentido, que es justo lo que
desempata. Corregido a `DUELO_SEG - OD.t`, idéntico en los tres cursos.

> ⚠️ **Un duelo de 3° creado antes del arreglo y respondido después desempata mal** (compara
> un tiempo negativo contra uno correcto). Los duelos expiran a las 24 h, así que se limpia
> solo; no hace falta tocar datos.

### Orden de despliegue

**No aplica la regla del `drop function` de la Sesión 73:** acá no hay ninguno, las dos
funciones son nuevas y la columna se agrega con guarda. Si el cliente sale antes que el
esquema, el único costo es un **404 por entrada al inicio** que la función traga en silencio
y un banner que no aparece. Aun así conviene aplicar el esquema **primero**.

---

## El ciclo completo, probado contra el Supabase de PRODUCCIÓN (31/08/2026)

Dos identidades anónimas reales en el mismo navegador, respaldando el token de sesión
**dentro de `localStorage`** —que sobrevive a navegar en el mismo origen; pasarlo por una
cadena de Node lo rompe, porque trae comillas—.

```
A = KIM-4AAC · B = KIM-277E
B desafía a A          -> {"id":"d1867a72-…","tipo":"async"}
── vuelve A · banner   -> ⚔️ Te desafiaron · Jugador te está esperando
   A responde y gana   -> ganador: "yo"  (7 a 5)
── vuelve B · banner   -> 💪 Te ganaron esta vez · Contra Jugador · 5 a 7
   B cierra            -> ok
   tras recargar       -> banner oculto
errores: 0 · fallos de red: 0
```

**La línea que importa es la de B.** Ese aviso es exactamente el que antes no llegaba nunca:
el retador desafiaba, el rival contestaba, y él no se enteraba jamás. Y al cerrarlo **no
vuelve**, o sea que la marca en el servidor hace su trabajo.

## ⚠️ Un defecto que solo apareció al probar: el duelo contra BOT se duplicaba

El duelo contra un bot **se resuelve en el mismo `kimun_crear_duelo`** (`estado='completado'`
al instante) y `odFin` le pinta el marcador al jugador ahí mismo. Pero nacía con
`visto_retador=false`, así que el banner del inicio **se lo repetía como si fuera noticia
nueva**. Comprobado contra el esquema en vivo:

```
duelo contra Diego  -> {"tipo":"bot","ganador":"yo"}   (el jugador YA lo vio en pantalla)
banner al volver    -> 🏆 ¡Ganaste tu duelo! · Contra Diego · 6 a 0   ← repetido
```

Corregido en `kimun_crear_duelo`: la rama del bot escribe `visto_retador=true` en su propio
`update`. Los duelos contra una **persona** siguen naciendo sin ver, que es justo para lo que
existe la columna.

> No lo habría encontrado leyendo el código: el `estado='completado'` del bot y el banner del
> inicio están a 2.500 líneas de distancia y en archivos distintos. Salió de **jugar el caso**.

⚠️ **Obliga a re-aplicar el esquema.** Es `create or replace`, sin `drop`, así que es seguro
en cualquier orden; mientras no se aplique, el único síntoma es ese aviso repetido y cerrable.

---

# Ranking de duelos del curso (mismo día, pedido de Roberto)

*"¿Se puede crear un ranking dentro del curso con los alumnos que más duelos han ganado, y
que se vea en la misma parte de los duelos?"*

**Sí, y no hubo que guardar nada nuevo:** `duelos` ya tiene los dos jugadores, sus aciertos
y sus tiempos. Es una función de lectura y una tarjeta.

## Las tres decisiones

| | |
|---|---|
| **Orden** | Por **duelos ganados** (elegido por Roberto sobre porcentaje y sobre puntos tipo fútbol). Es lo más legible en 3°, y premia jugar |
| **Bots** | **NO cuentan.** A Diego se le gana cincuenta veces en una tarde: contarlos convertiría el ranking en un contador de paciencia. Son práctica |
| **Alcance** | **El curso**, como `kimun_jugadores` desde la Sesión 39 y como el ranking por XP. No expone nombres de menores de otros cursos |

Solo aparece quien haya jugado al menos un duelo terminado. **Un cero y un "todavía no juega"
son dos cosas distintas**, y mezclarlas haría ver a medio curso como si perdiera siempre.

## La regla de desempate dejó de estar escrita cuatro veces

*Más aciertos; si empatan, menos tiempo; si todo empata, empate.* Estaba **copiada a mano en
tres lugares** —la rama del bot de `kimun_crear_duelo`, `kimun_responder` y los avisos de
arriba— y el ranking habría sido la cuarta. Es el patrón de lista paralela que ya causó un bug
real en este proyecto (Sesión 37).

Ahora vive una sola vez, en **`kimun_duelo_ganador(ac_a,t_a,ac_b,t_b)`**, y las cuatro la
llaman. Va declarada **antes** de sus usos: una función `language sql` se valida al crearse,
así que `kimun_duelos_avisos` no podría nombrarla si todavía no existiera.

## Verificación (`scripts/cdp.mjs`), idéntica en los tres cursos

| Caso | Resultado |
|---|---|
| Sin curso | *"Pide tu código para entrar al ranking de duelos de tu curso"* — **no** "nadie ha jugado", que sería falso |
| Sin la función en el servidor | *"No se pudo cargar."* — degrada, no rompe |
| Curso sin duelos | *"Todavía nadie ha jugado un duelo contra un compañero. ¡Sé el primero!"* |
| Con datos | 4 filas · 3 en el podio · 1 marcada como yo · orden 7G, 5G-1P, 5G-4P, 2G |
| Nombre con `<img src=x onerror=…>` | Sale como texto |
| Regresión | Etapa real en los tres · guardado de 8° intacto · **0 errores, 0 404** |

La tarjeta y su llamada quedan **byte a byte idénticas en los tres forks** (mismo md5), y
`cargarRankingDuelos` vive **una sola vez** en `motor.js`. Reusa las clases `.rk`, `.rk.top` y
`.rk.me` del ranking por XP: **no agrega ni una regla de CSS**.
