# Contenido sensible — código de color

> **Qué es este archivo.** La lista de contenido que un colegio (sobre todo confesional) podría
> querer **conocer antes de contratar**, con un **código de color por categoría**. Es la **leyenda
> que muestra el armador** (`?armar=1`), para que un enlace de muestra diga qué trae. Nace del
> inventario de los 21 OA sensibles de 3°, 7° y 8° (Matemática no tiene).

## ⚠️ Lo que este archivo NO es, desde el 03/09/2026

**No es el insumo de ninguna feature de opt-in.** Roberto decidió que **el único contenido que no
entra en los Jefes Finales es el sexual, y todo lo demás entra, en todos los cursos**. O sea:

- **No se construye** la pantalla que preguntaba al colegio qué categorías activar. Queda
  descartada, no pospuesta.
- **No hay OA apagables.** Drogas y alcohol, la conquista, la guerra de Arauco, la encomienda, la
  esclavitud, la ocupación de la Araucanía y el quiebre de la democracia **son currículum oficial y
  se juegan completos**, jefe incluido.
- Lo que este archivo sigue sirviendo es para **decir qué trae** un enlace de muestra, no para
  quitar nada.

**Medido el 03/09 en los cuatro cursos**, y es la comprobación que sostiene la regla:

| | sexual en los jefes | resto del contenido sensible en los jefes |
|---|---|---|
| 8° | ninguno | 10 OA de Historia y Ciencias |
| 7° | ninguno | 7 OA de Historia |
| 3° | ninguno | 1 OA de Historia |
| 5° | ninguno | ninguno todavía |

Los únicos OA sensibles que quedan fuera de un jefe son los tres de sexualidad de 7°, que es
exactamente la regla.

## ⚠️ Regla: lo sexual NO entra en ningún Jefe Final (02/09/2026)

**Decidida por Roberto**, y resuelve el problema que dejaba abierta la tarea A4.

El contenido de índole sexual es **currículum obligatorio** y se juega en su capítulo. Pero el
**Jefe Final se abre al 100% de la campaña y MEZCLA objetivos de toda la asignatura**, así que
tenía una fase entera de ese contenido: un colegio que decidiera no incluir ese capítulo **se lo
encontraba igual en el jefe**, y ahí ya no hay forma de evitarlo.

Sacarlo del jefe deja el contenido sensible **viviendo en un solo lugar —su capítulo—**, que es lo
que hace que excluirlo sea posible de verdad.

| | |
|---|---|
| **Aplicado hoy** | `CN07 OA 01`, `02` y `03` fuera del Jefe Final de Ciencias de 7° |
| **Vale igual para** | los `CN06 OA 04`, `05` y `06` cuando se construya 6° básico. **Y solo para esos**: ningún otro contenido sensible sale del jefe |
| **NO se toca** | el **jefe del capítulo**, que es su cierre natural. Quien no incluye el capítulo nunca llega a él, y vaciarlo lo dejaría roto para el colegio que sí lo incluye |

**El jefe conserva su tamaño**: los 12 OA restantes se reparten en las mismas 4 fases de 4
preguntas. En 7° el reparto quedó además **más coherente** que antes, porque la fase 1 juntaba
materia con presión solo para hacerle sitio a la de sexualidad.

**Cómo se comprueba** (y hay que hacerlo, porque un jefe que pregunta de más no da ningún error):

```js
// en la consola de cualquiera de los tres cursos
CAMPAÑAS.filter(c => c.jefeFinal)
  .flatMap(c => c.jefeFinal.fases.flatMap(f => f.oas))
  .filter(o => (SENSIBLE.oa[o] || []).includes('sex'))
```

Debe dar **arreglo vacío**. Verificado el 02/09 peleando el jefe: **800 preguntas sorteadas del
banco real, 12 OA distintos, cero sexuales.**

## Leyenda — qué representa cada color (para el armador)

| Color | Ícono | Categoría | Qué agrupa |
|---|---|---|---|
| 🔴 rojo `#ff4d6d` | ❤️ | **Sexualidad** | sexualidad, pubertad, reproducción, **anticoncepción**, ITS |
| ⚫ gris oscuro `#4a4a5e` | ⚔️ | **Violencia y muerte** | esclavitud, guerra, trabajo forzado, muerte masiva/epidemias, conquista armada |
| 🟡 dorado `#ffc93c` | 🛐 | **Religión y creencias** | religiones vivas, credos distintos, Reforma protestante, evolución / origen del universo |
| 🟤 café `#b5793a` | 🪶 | **Pueblos originarios** | culturas vivas, conquista, derechos indígenas, cosmovisión (mapuche, maya, azteca, inca) |
| 🔵 celeste `#4dd8ff` | 🚭 | **Sustancias** | alcohol, tabaco, drogas |

> **Un OA puede tener más de un color** (ej. la esclavitud de la conquista es Violencia + Pueblos
> originarios). El armador muestra los puntitos que correspondan.

## Mapeo de los OA sensibles → categorías (insumo de la feature)

Severidad: **ALTA** (un colegio confesional casi seguro querrá revisarlo) · **MEDIA** (podría querer
avisar) · **BAJA** (mención menor).

### 3° básico
| OA | Tema | Categorías | Severidad |
|---|---|---|---|
| HI03 OA 05 | Esclavitud en Grecia/Roma (tema de investigación) | ⚔️ | MEDIA |

### 7° básico
| OA | Tema | Categorías | Severidad |
|---|---|---|---|
| CN07 OA 01 | Sexualidad (pubertad, intimidad) | ❤️ | ALTA |
| CN07 OA 02 | Reproducción, **anticoncepción**, paternidad/maternidad | ❤️ | ALTA |
| CN07 OA 03 | ITS (VIH/sida, herpes) | ❤️ | ALTA |
| HI07 OA 01 | Evolución humana, poblamiento de América | 🛐 | MEDIA |
| HI07 OA 07 | Esclavitud en el Imperio romano | ⚔️ | MEDIA |
| HI07 OA 11 | Convivencia cristiandad / islam (religiones vivas) | 🛐 | ALTA |
| HI07 OA 14 | Mita y yanaconaje (trabajo forzado inca) | ⚔️ 🪶 | MEDIA |
| HI07 OA 15 | Creencias religiosas de pueblos originarios vivos | 🪶 🛐 | ALTA |
| HI07 OA 19 | Aportes de culturas y religiones (islam, judaísmo, cristianismo) | 🛐 | MEDIA |
| HI07 OA 20 | Convivencia y conflicto entre culturas | 🪶 | BAJA |

### 8° básico
| OA | Tema | Categorías | Severidad |
|---|---|---|---|
| HI08 OA 02 | Reforma protestante y Contrarreforma | 🛐 | MEDIA |
| HI08 OA 05 | "Enfrentamiento entre culturas" (llegada de europeos) | ⚔️ 🪶 | MEDIA |
| HI08 OA 06 | Catástrofe demográfica, epidemias, viruela | ⚔️ | MEDIA-ALTA |
| HI08 OA 07 | Debate de Valladolid (condición humana de los indígenas) | 🪶 ⚔️ | ALTA |
| HI08 OA 10 | Mano de obra esclava (comercio atlántico) | ⚔️ | ALTA |
| HI08 OA 11 | Esclavitud, encomienda, mita, evangelización forzada | ⚔️ 🪶 | ALTA |
| HI08 OA 12 | Guerra de Arauco, resistencia mapuche | 🪶 ⚔️ | MEDIA-ALTA |
| HI08 OA 13 | Hacienda colonial: inquilinaje y peonaje | ⚔️ | BAJA |
| HI08 OA 17 | Legitimidad de la conquista y derechos indígenas | 🪶 | ALTA |
| CN08 OA 07 | Vida saludable: alcohol, tabaco y drogas | 🚭 | MEDIA |

### 6° básico
| OA | Tema | Categorías | Severidad |
|---|---|---|---|
| CN06 OA 04 | Sistema reproductor humano femenino y masculino | ❤️ | ALTA |
| CN06 OA 05 | Cambios de la pubertad | ❤️ | ALTA |
| CN06 OA 06 | Higiene corporal en la pubertad | ❤️ | MEDIA |
| CN06 OA 07 | Efectos nocivos de las drogas | 🚭 | MEDIA |
| HI06 OA 05 | Ocupación de la Araucanía, Guerra del Pacífico | 🪶 ⚔️ | MEDIA-ALTA |
| HI06 OA 08 | Quiebre y recuperación de la democracia (dictadura) | ⚔️ | ALTA |

Los `CN06 OA 04/05/06` son exactamente los que la regla de arriba excluye del Jefe Final de
Ciencias de 6°. El `OA 07` (drogas) y los dos de Historia **no** se excluyen: solo lo
sexual/reproductivo sale del jefe, el resto del contenido sensible entra completo.

## Resumen por categoría

| Categoría | Nº de OA |
|---|---|
| ❤️ Sexualidad | 6 |
| ⚔️ Violencia y muerte | 13 |
| 🛐 Religión y creencias | 6 |
| 🪶 Pueblos originarios | 8 |
| 🚭 Sustancias | 2 |

*(La suma es mayor que 26 porque varios OA llevan dos categorías.)*

## Estado de la feature (implementada, Sesión 67)

El marcado **ya está implementado en el armador** (`?armar=1`). La decisión de qué contenido
sensible entra se toma **al construir el enlace**: la casilla por capítulo que el armador ya tenía
es el control, así que lo que no se marca no viaja y quien recibe abre solo lo aprobado. **El enlace
de muestra/venta (`?solo=`, `?m=`) no cambió** — no hay opt-in en tiempo de apertura (VULPO es
estático; sería blando). Los enlaces trabajan por **capítulo**, que hereda las categorías de los OA
que contiene.

Cómo se ve: el armador muestra una **leyenda** con solo las categorías presentes en ese nivel, un
**emoji** por capítulo sensible (con `title` de la categoría), y el **resumen** dice "· incluye: …"
según los capítulos marcados.

- **`assets/js/sensible.js`** es el espejo-máquina de la tabla de OA de este documento: el mapa
  `SENSIBLE.oa` de arriba y las 5 categorías de `SENSIBLE.cats`. **Al agregar o cambiar un OA
  sensible aquí, actualizar también ese `.js`** (la severidad ALTA/MEDIA/BAJA vive solo aquí; la UI
  no la usa). Lo lee `arrancarArmador` en las tres apps, con respaldo vacío por si el archivo no
  carga.
- Diseño y plan: `docs/superpowers/specs/2026-08-28-contenido-sensible-armador-design.md` y
  `docs/superpowers/plans/2026-08-28-contenido-sensible-armador.md`.
