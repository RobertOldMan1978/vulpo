# Contenido sensible — código de color

> **Qué es este archivo.** La lista de contenido que un colegio (sobre todo confesional) podría
> querer **revisar antes de activar**, con un **código de color por categoría**. Es a la vez la
> **leyenda que muestra el armador** (`?armar=1`) y el **insumo de la feature** que marca lo sensible
> en los enlaces de muestra y de venta para preguntar al usuario si lo activa. Nace del inventario de
> los 20 OA sensibles de 3°, 7° y 8° (Matemática no tiene). Ver A4 en `pendiente.md`.

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

## Resumen por categoría

| Categoría | Nº de OA |
|---|---|
| ❤️ Sexualidad | 3 |
| ⚔️ Violencia y muerte | 11 |
| 🛐 Religión y creencias | 6 |
| 🪶 Pueblos originarios | 7 |
| 🚭 Sustancias | 1 |

*(La suma es mayor que 20 porque varios OA llevan dos categorías.)*

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
