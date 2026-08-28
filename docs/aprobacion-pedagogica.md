# Aprobación pedagógica de los bancos

Cómo se aprueba el contenido de VULPO, y por qué se aprueba **por muestreo** y no pregunta a
pregunta.

---

## El problema

Una pregunta solo llega a un alumno cuando un humano la marca `revisada:true`. Ese humano es
Roberto. El tablero permitía marcar **de a una casilla**, y las cuentas no dan:

| | Preguntas | A 5 s cada una | A 10 s |
|---|---|---|---|
| Hoy sin aprobar (3° y 7°) | **4.988** | 7 horas | 14 horas |
| Proyección v1 (con 4°, 5° y 6°) | **~12.800** | **18 horas** | **36 horas** |

No es una molestia: es el cuello de botella real del proyecto. **3° y 7° llevan meses escritos y
sin una sola pregunta aprobada**, y esa es exactamente la forma en que la v1 se cae — no por falta
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
3. Por cada OA: desplegarlo, leer unas 8 preguntas repartidas, y pulsar **"✓ todo el OA"**.
   El mismo botón vuelve a **"✕ quitar el OA"** si hay que corregirse.
   También hay **"✓ Aprobar toda la asignatura"**, que pide confirmación sobre 60 preguntas.
4. **"⬇ Exportar revisadas"** → descarga `revisadas.json`.
5. `python scripts/aplicar-revisadas.py` → escribe `revisada:true` en los bancos.
6. `python scripts/generar-tablero.py` → la barra rosada refleja el avance real.

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
| **3° básico** (4 asignaturas) | **2.558** | ❌ **0** |
| **7° básico** (4 asignaturas) | **2.430** | ❌ **0** |

Los informes en papel para revisar sin pantalla se generan con
`python scripts/generar-revision-preguntas.py <carpeta>` y quedan en `dev/` (ignorados por git:
son regenerables, y solo existen en el computador donde se generaron).
