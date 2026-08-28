# Módulos transversales

> **La decisión (28/08/2026).** El Reto de cálculo, las lecturas y el Vocabulario **tienen una
> asignatura asignada, pero no son esa asignatura.** Se tratan como una categoría aparte,
> agrupada, e **independiente del nivel**. Así son más fáciles de programar y de estandarizar:
> el motor se escribe una vez y lo único que cambia por curso son los datos.
>
> Este archivo es el estándar de esa categoría. Para los bancos del currículum, el estándar es
> [`encargo-banco.md`](encargo-banco.md), que es otra cosa y no se mezcla.

---

## Qué es un módulo transversal

Un contenido que **acompaña al curso sin ser cobertura curricular**. Se reconoce por una
propiedad objetiva, no por criterio: **su código no lleva el nivel adentro.**

| | Código | Ejemplo |
|---|---|---|
| **Currículum** | dos letras + dos dígitos | `HI07`, `MA03`, `CN08` |
| **Transversal** | sin nivel | `VOC`, `AF` |

Esa forma es la que usan las herramientas para distinguirlos, **y por eso no hay ninguna lista
de carpetas que mantener**: `scripts/validar-oa-json.py` y `scripts/generar-tablero.py`
preguntan por la forma del código. Antes había un conjunto escrito a mano
(`{"vocabulario", "lectura-anafrank"}`) y se rompió al primer módulo de otro nivel.

## Los tres que existen

| Módulo | Qué es | Banco | Motor |
|---|---|---|---|
| **Vocabulario** | Palabras clave de las asignaturas del curso | uno **por nivel** | el quiz normal |
| **Lectura** | Comprensión de un libro del colegio | uno **por libro** | el quiz normal |
| **Reto de cálculo** | Velocidad de cálculo mental | **ninguno** | `assets/js/calculo.js` |

## Reglas que comparten

1. **No entran al mapa de dominio del profesor.** `registrarOA` los excluye por el prefijo de
   su código. Un porcentaje junto a "Palabras de Historia" se leería como cobertura de Historia,
   y no lo es.
2. **No se presentan a un colegio como cobertura curricular.** Son un apoyo. Decir "cubrimos
   Historia" porque hay 30 palabras de Historia sería falso.
3. **Se aprueban igual que el resto**, con el muestreo de
   [`aprobacion-pedagogica.md`](aprobacion-pedagogica.md) — salvo el Reto de cálculo, que no
   tiene banco que aprobar.
4. **Van agrupados aparte en el tablero**, bajo "Módulos transversales", después de los tres
   cursos. Mezclados, el Vocabulario de 8° aparecía al final —después de Ana Frank— mientras el
   de 7° se ordenaba entre las asignaturas de 7°.
5. **Se encienden por bandera de nivel** (`HAY_VOCABULARIO`, `HAY_BIBLIOTECA`, `HAY_SINFIN`),
   como cualquier otra diferencia entre cursos. Ver la sección "Banderas de nivel" de
   `CLAUDE.md`.

---

## Cómo se nombra cada uno, y por qué difiere

**Vocabulario: `contenido/vocabulario-<n>basico/`.** Las palabras son las del curso, así que el
nivel va en el nombre. *(Hasta el 28/08 el de 8° se llamaba solo `vocabulario`, y esa
inconsistencia era la que descolocaba el tablero.)*

**Lectura: `contenido/lectura-<libro>/`.** Aquí el nivel **no** va en el nombre, a propósito: un
libro es un libro, y el mismo podría asignarse a dos cursos. Qué curso lo ofrece se decide en su
catálogo `LIBROS`, no en la carpeta.

**Reto de cálculo: no tiene carpeta.** Genera las operaciones por código.

---

## El Reto de cálculo merece su propio párrafo

**Es el único contenido del proyecto que no consume banco.** Eso cambia su economía por completo:

- no suma preguntas que escribir,
- no suma horas de aprobación pedagógica,
- no suma clips de voz que pagar,
- y agregarlo a un curso nuevo es **un generador de ~45 líneas**.

Por eso es lo más barato que se le puede sumar a un nivel. Lo propio del curso es únicamente qué
operaciones salen; todo lo demás —pantallas, reloj, racha, récord, premio— vive en
`assets/js/calculo.js` y se comparte.

### El modo sin reloj

Un Reto es por definición un juego de **velocidad**, y eso choca con un curso que juega
`SIN_RELOJ` a propósito por la edad. **La salida no fue aflojar el reloj sino quitarlo**
(`sinReloj:true` en el `init`): el contador y la barra se sacan del DOM, y la partida termina
solo al fallar. Sigue siendo infinito — lo que sostiene la tensión es la escalera de dificultad
y el récord, no el tiempo.

| | Con reloj (7°, 8°) | Sin reloj (3°) |
|---|---|---|
| Presión | 20 s por operación | ninguna |
| Qué mide | racha contra el reloj | hasta dónde llegas |
| Termina | al fallar o al agotarse | **solo al fallar** |
| Rótulo | ♾️ Racha | 🪜 Escalón (`etiqueta`) |

> **En 3° el Reto encaja MEJOR que en 7°, y conviene saberlo.** En 7° es un extra al lado del
> currículum; en 3° es la práctica de tres objetivos suyos: `MA03 OA 04` (estrategias de **cálculo
> mental** hasta 100), `OA 08` (tablas) y `OA 09` (división en las tablas).

**La voz no necesita clips nuevos.** En los cursos con voz pregrabada, `sonarClip` cae a la voz
del navegador cuando un texto no está en el manifiesto — y una operación como "7 + 5" casi no
tiene palabras que leer. Generar audio para operaciones infinitas sería imposible de todos modos.

---

## Cómo se agrega uno a un curso

**Vocabulario o Lectura** (llevan banco):

1. Crear `contenido/<modulo>/` con su `oa.json` y su `_pool/`.
2. Escribir las tandas y pasarlas por `revisar-tanda.py --largo=<N>`. **El sesgo de largo aparece
   siempre en la primera pasada** — en la tanda de validación de Vocabulario de 7° fueron 18 de
   30— y se corrige **dándole cuerpo a los distractores, nunca acortando la correcta**.
3. Consolidar con `consolidar-pool-nivel.py <carpeta>` (baraja las opciones; las tandas se
   escriben con la correcta primera).
4. Auditar: `auditar-banco-nivel.py` y `auditar-solape-oa.py`.
5. En el juego: la entrada en `EXPEDICIONES` y la bandera del módulo.

**Reto de cálculo** (no lleva banco):

1. Incluir `assets/js/calculo.js` **y su respaldo vacío** (obligatorio: ver abajo).
2. Escribir `genCalc<n>(dif)` con el temario del curso.
3. `CALC.init({...})` **pegado a la declaración de su bandera**.
4. **Verificar la aritmética con un script**, recalculando cada clave por otro camino. No es
   formalidad: la primera versión del generador de 7° producía opciones repetidas en **889 de
   1.500** casos y no se veía leyendo el código.

---

## Dos trampas ya pagadas, para no repetirlas

**1. El `<script src>` que no carga mata el juego entero.** Si el archivo falta —404 durante un
despliegue, red lenta, bloqueador— y el juego llama a `init` en el nivel superior, revienta todo
su JavaScript. **El síntoma engaña**: la pantalla inicial se ve bien porque es HTML, y ningún
botón responde. Por eso cada módulo lleva un respaldo vacío **antes** de usarse.

**2. Y el mismo síntoma tiene una segunda causa que no es el 404: el orden.** `CALC.init({activo:
HAY_SINFIN})` colocado mil líneas antes de `const HAY_SINFIN` lanza `ReferenceError` por zona
muerta temporal — y la página se ve exactamente igual de rota. **La llamada `init` va pegada a la
declaración de su bandera**, no junto a las demás.

**3. Guardar el botón por `CALC.activo`, no por la bandera.** La bandera dice si el nivel *quiere*
el módulo; `activo` dice si de verdad está disponible. Con la bandera, un 404 dejaba el botón
dibujado y muerto: el alumno toca y no pasa nada — el mismo defecto del botón de mini-clase que
costó dos sesiones detectar.
