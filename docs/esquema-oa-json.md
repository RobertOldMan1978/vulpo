# El `oa.json` de una asignatura — esquema canónico

Cada carpeta de `contenido/<asignatura>-<n>basico/` tiene dos archivos: `preguntas.json` (el
banco) y **`oa.json`, que es la fuente curricular**. Este documento fija su forma.

**Se valida con:**

    python scripts/validar-oa-json.py

Debe dar **0 errores**. Correrlo al crear una asignatura nueva y antes de cualquier commit que
toque un `oa.json`.

---

## Por qué existe este documento

Los `oa.json` se escribieron en **tres generaciones** —8° en las Sesiones 5-16, 3° en las 54-61,
7° en la 62— y cada una agregó sus claves sin volver a alinear las anteriores. De las claves de
nivel superior, **solo 7 eran universales**.

Eso no era cosmético. `generar-tablero.py` recorre **todas** las carpetas en una sola pasada y
accede a las claves de forma dura, así que **un banco con otro dialecto deja sin tablero a los
quince** — y el tablero es la única puerta de la aprobación pedagógica. Pasó dos veces:

| Sesión | Síntoma | Causa |
|---|---|---|
| 55 | `KeyError: 'unidades'` | el `oa.json` semilla de 3° no traía la clave |
| 62 | `KeyError: 'id'` | las unidades de 7° usan `{n, nombre}` y las demás `{id, titulo}` |

La segunda arregló el caso y no la clase. Con **24 archivos en la v1**, escritos por agentes
distintos en momentos distintos, la deriva es cuestión de tiempo. De ahí el validador.

---

## Claves obligatorias

| Clave | Qué es |
|---|---|
| `asignatura` | Nombre oficial visible: `"Historia, Geografía y Ciencias Sociales"` |
| `nivel` | `"7° básico"` |
| `codigo_asignatura` | Las 4 letras: `HI07`, `MA03`, `CN08`, `LE05`. **El nivel viaja aquí**, no en una columna aparte |
| `fuente` | La fuente oficial citada, con su nombre completo |
| `url_fuente` | El enlace a `curriculumnacional.cl` |
| `nota_fidelidad` | **Cómo se transcribió y contra qué se contrastó.** Es lo que permite auditar el banco después |
| `unidades` | La agrupación de los OA (ver abajo) |
| `oa` | La lista de objetivos |

### `oa` — cada objetivo

```json
{ "codigo": "HI07 OA 01", "eje": "Historia", "texto": "<el texto oficial, literal>" }
```

`codigo` y `texto` son obligatorios; `eje` es recomendado. El `codigo` **debe empezar con
`codigo_asignatura`** — el validador lo comprueba, porque de ese prefijo depende que el servidor
sepa a qué asignatura pertenece (`kimun_oa_asignatura`).

### `unidades` — la agrupación

```json
{ "id": "U1", "titulo": "Los inicios de la modernidad",
  "descripcion": "…", "oa": ["HI08 OA 01", "HI08 OA 02"] }
```

- `id` va como `U1`, `U2`, … (`descripcion` es opcional).
- **Todo OA debe estar en algún grupo**, salvo los declarados en `oa_excluidos_del_banco`.
- Si los capítulos del juego **no siguen** las unidades del Programa, se usa
  **`capitulos_del_juego`** en su lugar (con `id` como `C1`, `C2`, …) y **hay que explicar por
  qué en `nota_unidades`**. Pasa de verdad en Lenguaje de 3° y de 7°, donde los mismos OA
  aparecen en casi todas las unidades y agruparlos así los mediría siete veces.
- Se puede conservar además `unidades_oficiales_del_programa` como registro de las unidades
  reales.

---

## Claves recomendadas (no obligatorias, pero casi siempre hacen falta)

| Clave | Cuándo |
|---|---|
| `nota_evaluacion` | **Siempre que haya OA que un quiz no pueda medir de verdad**, que es casi toda asignatura. Es la advertencia de que el mapa de dominio va a mostrar un porcentaje junto a algo como "conducta honesta", y eso se lee como nota de conducta si no se avisa |
| `oa_excluidos_del_banco` | `[{codigo, texto, por_que}]`. Un OA que no admite pregunta honesta se deja fuera y **se declara aquí, no en prosa** |
| `habilidades_excluidas` | `{cuantas, codigos, por_que}`. Los OAH y OAA que miden desempeño observable, y cuyos códigos con letra además no pasan la validación del servidor |
| `nota_unidades` | Obligatoria si se agrupa por `capitulos_del_juego` |
| `nota_contenido_sensible` | Cuando el currículum obliga a contenido que hay que conversar con el colegio antes de publicar (caso real: `CN07 OA 01/02/03`) |
| `ejes` | Segundo eje de agrupación, cuando aporta algo que `unidades` no da |

> **`oa_excluidos_del_banco` no es burocracia.** Antes de la Sesión 63, la exclusión del
> `LE03 OA 16` (caligrafía manuscrita) vivía solo en un comentario, mientras la del `LE07 OA 12`
> estaba declarada. Misma decisión, dos formatos, y ninguna herramienta podía distinguir "este OA
> no tiene preguntas porque decidimos excluirlo" de "a este OA se le olvidaron las preguntas".
> El validador ahora usa esa clave justamente para esa distinción.

---

## Lo que el validador comprueba

- Las claves obligatorias, y que el prefijo de los OA calce con `codigo_asignatura`.
- Que exista una agrupación con `{id, titulo, oa}` y que **cubra todos los OA**, sin repetirlos
  ni citar códigos inexistentes.
- Que los OA declarados excluidos **no tengan preguntas** en el banco, y que el banco no tenga
  preguntas de OA que el `oa.json` no declara.
- Avisa cuando un OA no tiene preguntas y tampoco se declaró excluido — que es como se ve un
  olvido.

Los bancos de apoyo (`vocabulario`, `lectura-anafrank`) **no son currículum**: no tienen fuente
MINEDUC ni OA oficiales, y el validador los trata con menos exigencia a propósito.
