# Aprobación pedagógica de los bancos

Cómo se aprueba el contenido de VULPO, y por qué se aprueba **por muestreo** y no pregunta a
pregunta.

---

## El problema

Una pregunta solo llega a un alumno cuando un humano la marca `revisada:true`. Ese humano es
Roberto. El tablero permitía marcar **de a una casilla**, y las cuentas no dan:

| | Preguntas | A 5 s cada una | A 10 s |
|---|---|---|---|
| Sin aprobar hoy (2 OA de Historia de 3°) | **60** | 5 minutos | 10 minutos |
| Proyección v1 (con 4°, 5° y 6°) | **~12.800** | **18 horas** | **36 horas** |

No es una molestia: fue el cuello de botella real del proyecto hasta el 30/08/2026, cuando 3° y 7°
se aprobaron por muestreo en una sola pasada. **Con 4°, 5° y 6° vuelve a serlo**, y esa es
exactamente la forma en que la v1 se cae — no por falta
de contenido, sino porque el contenido nunca se firma.

---

## Lo que ya revisa una máquina (y por eso el humano no tiene que)

Antes de que una pregunta llegue al tablero ya pasó por comprobaciones automáticas. Conviene
saber qué cubren, para no gastar ojos humanos en eso:

| Herramienta | Qué caza |
|---|---|
| `revisar-tanda.py` | 4 opciones distintas, clave en rango, `tip` que no copie la respuesta, **sesgo de largo**, enunciados largos, duplicados y casi-duplicados dentro del OA |
| `auditar-numerico.py` | Dos opciones que **valen lo mismo** escritas distinto (`1/6` y `2/12`) |
| `auditar-solape-oa.py` | El mismo tema medido en **dos OA distintos** |
| `validar-oa-json.py` | Que el currículum esté bien declarado y que ningún OA quede sin preguntas por olvido |
| `auditar-audible-3ro.py` | Preguntas irresolubles **para quien las escucha** (solo niveles con voz) |

**Lo que ninguna máquina puede ver, y es para lo que sirve la revisión humana:** una clave
equivocada que exige saber la materia, imprecisión científica o histórica, un contenido que es de
otro año, el trato de temas sensibles, y el registro (que suene a alguien hablándole a un niño de
esa edad).

---

## El criterio: muestreo por OA

**Revisar 8 de las 30 preguntas de un OA.** Si las 8 pasan, se aprueba el OA completo con el botón
**"✓ todo el OA"**. Si alguna falla, se revisan las 30 de ese OA.

Un banco de 90 OA pasa así de 2.700 preguntas a **720 revisadas**: de 7 horas a menos de 2.

### Por qué 8, y qué NO garantiza

Hay que decirlo con todas sus letras, porque es una decisión con costo:

| Si el OA tiene… | La muestra de 8 lo detecta con probabilidad |
|---|---|
| 30% de preguntas defectuosas (9 de 30) | **96,5%** |
| 20% (6 de 30) | **87,4%** |
| 10% (3 de 30) | 62,1% |
| 1 sola mala de 30 | 26,7% |

*(Hipergeométrica: la muestra es sin reemplazo. Calculado, no estimado.)*

**El muestreo caza un OA mal escrito, no una pregunta mala suelta.** Y eso es justo lo que se
necesita, porque los defectos de estos bancos vienen en tandas: los escribe un agente por OA, así
que cuando algo sale mal, sale mal en todo el OA — un criterio equivocado, un nivel de dificultad
que no corresponde al año, un sesgo de redacción. Los defectos aislados los cazan los scripts de
arriba o aparecen jugando.

**El costo asumido: algunas preguntas malas sueltas van a llegar a los alumnos.** Es preferible a
la alternativa real, que no es "revisar las 12.800" sino "no revisar ninguna", que es donde
estamos hoy.

### Cuándo NO se muestrea

Se revisan **las 30**, sin excepción, cuando:

- El OA es **actitudinal o de hábito** (conducta, respeto, participación). Ahí lo que se revisa no
  es si la clave es correcta, sino si la pregunta plantea la situación de un tercero con nombre en
  vez de juzgar al jugador.
- El OA toca **contenido sensible**. Caso concreto: `CN07 OA 01/02/03` (sexualidad, ciclo
  menstrual, métodos de control de la natalidad, ITS). Además de aprobarlo, **hay que conversarlo
  con el colegio antes de publicarlo**.
- El OA trata **pueblos originarios, religiones vivas o hechos históricos dolorosos**.
- La muestra de 8 falló.

---

## El procedimiento

1. Regenerar el tablero: `python scripts/generar-tablero.py`
2. Abrir `dev/tablero.html` y entrar con la contraseña.
3. Pulsar **"⚡ Aprobar por muestreo"** y recorrer la cola (ver abajo).
4. **"⬇ Exportar revisadas"** → descarga `revisadas.json`.
5. `python scripts/aplicar-revisadas.py` → escribe `revisada:true` en los bancos.
6. `python scripts/generar-tablero.py` → la barra rosada refleja el avance real.

### El modo de aprobación por muestreo

Hasta la Sesión 70 el criterio estaba escrito pero **el tablero no lo implementaba**: dibujaba
las ~8.000 preguntas y quedaba en manos de quien revisa decidir cuáles mirar —o leerlas todas,
que triplica el trabajo—. Sin teclado y sin forma de retomar.

El modo cierra ese hueco. Una pantalla por objetivo, con **sus 8 preguntas ya elegidas**:

| | |
|---|---|
| **espacio** o **Enter** | aprueba el OA completo y avanza |
| **V** | "ver las 30" — no aprueba nada y lleva al OA desplegado en el tablero |
| **S** | saltar, para volver después |
| **Esc** | salir |

- **La cola son solo los OA con preguntas pendientes.** 8°, aprobado entero, no aparece; hoy
  quedan **2**, y el contador dice en cuál vas. (Eran 170 antes de la pasada del 30/08.)
- **Se retoma donde se quedó**, aunque se cierre el navegador.
- **La muestra es estable**: se sortea con una semilla derivada del código del OA, así que las
  mismas 8 salen siempre. Si cambiaran al recargar, uno podría aprobar un OA habiendo visto ocho
  preguntas y volver a verlo con otras ocho, sin saber cuál versión aprobó.
- **Aprobar marca las 30, no las 8 mostradas** — eso es el criterio, no un atajo.
- **El `tip` se muestra junto a cada respuesta.** Se agregó a propósito: es parte de lo que hay
  que aprobar, y este proyecto ya tuvo tips equivocados (uno decía "20 pasos" donde eran
  unidades; otro contradecía su propia pregunta).
- No guarda aparte: reusa el mismo almacén del tablero, así que las copias de un OA que
  pertenece a dos capítulos se sincronizan solas.

> **Los botones de antes siguen ahí** —"✓ todo el OA" y "✓ Aprobar toda la asignatura"— para
> corregirse o para ir directo a un objetivo puntual. El modo es un camino más rápido, no un
> reemplazo.

### Dos cuidados que ya mordieron

> **Las marcas viven en el `localStorage` del navegador, no en el repositorio.** Si exportas desde
> el computador de la oficina, ese archivo **no trae** lo que marcaste en el de la casa. Por eso
> `aplicar-revisadas.py` **solo agrega marcas** por omisión: aplicar una exportación parcial con el
> comportamiento antiguo habría **desmarcado las 2.536 preguntas ya aprobadas de 8°** sin avisar.
> Para desmarcar de verdad hay que pedirlo con `--sincronizar`.

> **Una pregunta puede aparecer dos veces en el tablero.** Pasa cuando un OA pertenece a dos
> capítulos, como en Lenguaje de 3°: son 270 preguntas dibujadas dos veces. El tablero sincroniza
> las copias y cuenta por id único, pero si ves el mismo enunciado en dos capítulos, no es un
> duplicado del banco.

---

## Estado

| Banco | Preguntas | Aprobadas |
|---|---|---|
| 8° básico (4 asignaturas) | 2.314 | ✅ todas |
| Vocabulario y Ana Frank | 222 | ✅ todas |
| **3° básico** (4 asignaturas) | **2.558** | ✅ **todas** |
| **7° básico** (4 asignaturas) | **2.430** | ✅ **todas** |
| Vocabulario 7° y *Cuentos de Ada* | 221 | ✅ todas |

> **Cerrado el 30/08/2026: 7.745 de 7.745.** Primero 5.048 preguntas por muestreo en una
> pasada, y ese mismo día los **60** que habían quedado saltados (`HI03 OA 01` y `OA 08`). Lo que
> sigue abajo describe el método, y sirve igual para 4°, 5° y 6°, que son los que faltan.
>
> ⚠️ **100% de cobertura no es 100% del mismo método.** 8° y los módulos de apoyo se revisaron
> pregunta por pregunta; 3° y 7°, por muestreo de 8 de cada 30. Al decirlo afuera, la frase que
> se sostiene es *"objetivo por objetivo"*, no *"una a una"*.

Los informes en papel para revisar sin pantalla se generan con
`python scripts/generar-revision-preguntas.py <carpeta>` y quedan en `dev/` (ignorados por git:
son regenerables, y solo existen en el computador donde se generaron).
