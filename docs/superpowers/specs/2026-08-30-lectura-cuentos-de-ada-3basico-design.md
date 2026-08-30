# Lectura en 3° básico: *Cuentos de Ada* — diseño

**Fecha:** 30/08/2026 · **Estado:** aprobado por Roberto, sin implementar.

## Qué se construye

El primer **módulo de Lectura de 3° básico**, con *Cuentos de Ada* de Pepe Pelayo. En la pantalla
principal aparece **📖 Lectura** junto a las cuatro asignaturas; adentro, la biblioteca con un
libro y sus 10 tramos.

Es un **módulo transversal** ([`modulos-transversales.md`](../../modulos-transversales.md)): no es
cobertura curricular, no entra al mapa de dominio del profesor y no se le presenta a un colegio
como "Lenguaje cubierto".

| | |
|---|---|
| Carpeta | `contenido/lectura-cuentos-de-ada/` |
| Código | `CA-T1` … `CA-T10` |
| Id de expedición | `lect-cuentos-ada` |
| Archivos | `libro.json` · `oa.json` · `preguntas.json` |
| Portada | `assets/portada-lectura-cuentos-ada.png` (con respaldo; no bloquea) |

**El nivel NO va en el nombre de la carpeta**, a propósito y por norma escrita: un libro es un
libro y el mismo podría asignarse a dos cursos. Qué curso lo ofrece se decide en `LIBROS`.

## El libro

*Cuentos de Ada*, Pepe Pelayo, ilustraciones de Alex Pelayo. **10 cuentos en 4 partes**, ~68
páginas. Protagonista Adalberto ("Ada"), su hermano menor Yoyito, su amigo Pocho, Cary —la niña
que le gusta— y Orco, el compañero abusivo.

> ✅ **Resuelto (30/08): el sello es Santillana Infantil**, confirmado por Roberto contra la tapa
> del ejemplar. La guía decía **Alfaguara Infantil (Chile, 2003)**, que pertenece al mismo grupo;
> como el dato se le muestra al alumno, se preguntó en vez de elegir por probabilidad.

> ✅ **Y la portada se queda en la genérica de Lectura**, no como préstamo temporal sino por
> **derechos de autor**: ilustrar la tapa de un libro ajeno sería obra derivada. Es coherente con
> el resto del módulo, que no reproduce nada del libro.

### Los 10 tramos

| # | Parte | Cuento |
|---|---|---|
| 1 | El hermanito | Las vacaciones |
| 2 | El hermanito | La mentira |
| 3 | El hermanito | El sándwich |
| 4 | El romance | Primer intento |
| 5 | El romance | Segundo intento |
| 6 | El romance | Último intento |
| 7 | El enemigo | La renuncia |
| 8 | El enemigo | El acto heroico |
| 9 | El enemigo | La venganza |
| 10 | El final | La batalla decisiva |

**Un tramo por cuento** (no por parte): calza con cómo el profesor asigna la lectura y con cómo un
niño de 8 años la vive — termina un cuento y quiere jugar ese tramo.

## El techo de la fuente, y por qué está escrito aquí

Las preguntas se escriben desde dos documentos que entregó Roberto
(`resumen_extenso_cuentos_de_ada_pepe_pelayo.txt` y
`Cuentos_de_Ada_Guia_Extensa_y_Preguntas_Prueba.txt`), **no desde el libro**. La guía se declara a
sí misma como compilación de resúmenes escolares en línea, advierte que **no sustituye al libro
original** y avisa que las fuentes discrepan en nombres y detalles (Yoyito/Yayito/Yayo,
Cary/Cari) y en "el número exacto de personajes que participan en la batalla".

Eso no la inutiliza —trama, personajes, motivaciones y desenlace **coinciden entre los dos
documentos**— pero fija qué se puede preguntar:

- ✅ **Sí:** trama, motivaciones, causa y consecuencia, quién es quién, evolución de Ada, el
  desenlace y su enseñanza.
- ❌ **No:** detalle fino que la propia guía marca como inseguro (cuántos participaron en la
  batalla, de quién es el chihuahua, nombres secundarios).

**Por qué importa y no es escrúpulo:** una pregunta de detalle inventado castiga justamente al
niño que sí leyó el libro. Queda declarado en el `nota_fidelidad` del `oa.json`.

## Volumen

**Meta de 10 preguntas por tramo (~100)**, sirviendo **6 por ronda**, las mismas proporciones que
Ana Frank (9 por tramo → 6 servidas).

**Regla explícita: un cuento delgado entrega menos, no se rellena.** *Las vacaciones*, *El
sándwich* y *La batalla decisiva* tienen resumen detallado y dan de sobra; *La renuncia* y *El acto
heroico* son breves. Es la decisión que el proyecto ya tomó cuando un OA de Lenguaje de 3° entregó
26 de 30 y explicó por qué.

Las preguntas siguen [`encargo-banco.md`](../../encargo-banco.md) para 3°: enunciado corto, **sin
cronómetro**, 4 opciones, distractores con cuerpo desde el primer borrador, y el `tip` **no puede
nombrar la posición de una opción** porque el consolidador baraja.

Nacen `revisada:false` y se aprueban por el muestreo de
[`aprobacion-pedagogica.md`](../../aprobacion-pedagogica.md).

## El motor

Todo en `3ro/index.html`, salvo un cambio que va en los tres forks (abajo):

1. **`HAY_BIBLIOTECA=true`** — hoy `false`.
2. **`LIBROS` reemplazado.** Hoy apunta a `lect-anafrank`, que es contenido de 8°.
   > ⚠️ **Este es el punto peligroso.** Encender la bandera sin tocar el catálogo le abriría a un
   > niño de 8 años *El diario de Ana Frank*. Es el mismo defecto del fork que ya mordió tres
   > veces: el Duelo que ofrecía el Reto de 8°, el botón que bajaba las lecciones de 8°, y
   > `cargarPoolMate` descargando el banco de otro nivel.
3. **Expedición `lect-cuentos-ada`** con sus 10 etapas (`oa`, `nombre`, `icono`, `n:6`), portada
   **explícita** —3° usa portadas explícitas, no la convención implícita— y `activa:true`.

**La biblioteca no se construye: ya está entera en el fork** (pantalla `scr-biblioteca`, su CSS de
papel cálido, `abrirBiblioteca`, `LIBROS`), solo apagada. Es el mismo caso del Vocabulario de 7°:
el código estaba y faltaba el dato.

### La exclusión del mapa de dominio pasa a ser estructural

Hoy `registrarOA` descarta los módulos de apoyo con una **lista escrita a mano**:

```js
if(/^(AF-|VOC-)/.test(oa)) return;
```

Con `CA-` el libro empezaría a contarse como currículum en el mapa del profesor. Se cambia por la
comprobación **estructural**, que es la regla que el proyecto ya escribió: un código del currículum
lleva el nivel adentro y uno transversal no.

```js
if(!/^[A-Z]{2}[0-9]{2} OA [0-9]{2}$/.test(oa)) return;
```

**Por qué la estructural y no sumar `CA-` a la lista:**

- Es la misma regla que ya usan `validar-oa-json.py` y `generar-tablero.py`, que preguntan por la
  **forma** del código justamente para no mantener listas paralelas.
- **Alinea el cliente con el servidor**, que descarta esos códigos con ese mismo patrón. Hoy el
  cliente le manda al servidor cosas que el servidor bota en silencio.
- **El próximo libro no vuelve a pedir un cambio de motor.** Una lista escrita a mano vuelve a
  morder al siguiente, que es el defecto que este proyecto ya pagó varias veces.

Va **idéntico en los tres forks**, aunque 7° y 8° no cambien de comportamiento: mantenerlos byte a
byte iguales es el objetivo.

> **Es más estricto que lo de hoy, y eso es lo que hay que verificar:** ahora solo se mide lo que
> tiene forma de OA oficial. Hay que confirmar que las cuatro asignaturas de los tres cursos
> **siguen midiendo**, y que Vocabulario, Lectura y el Reto **siguen sin medir**.

## Voz

**Se genera al final, nunca en paralelo con las auditorías**, porque cada texto corregido obliga a
regenerar su clip y a pagarlo de nuevo — pasó de verdad en la Sesión 61.

~100 preguntas × 5 clips (enunciado + 4 opciones) ≈ **500 clips, del orden de US$0,3** de la cuenta
Azure de Roberto. Carpeta propia `assets/voz/ada/`, como el resto: el juego **fusiona los
manifiestos**, así que agregar un libro no obliga a regenerar —ni volver a pagar— los 10.563 clips
que ya existen.

Antes de generar, pasar `scripts/auditar-audible-3ro.py`: una pregunta cuyas opciones se
pronuncian igual es irresoluble para quien usa el botón 🔊, que es justamente el que peor lee.

## Qué NO se hace

- ❌ **No se reproduce texto del libro.** Preguntas de comprensión originales; el niño lee el
  ejemplar. Mismo criterio que Ana Frank.
- ❌ **No se toca 8° ni 7°**, salvo la línea de `registrarOA`, que es a propósito idéntica.
- ❌ **No se agrega un jefe final al libro.** Ana Frank no tiene y no hay razón para estrenar esa
  forma aquí.
- ❌ **No entra al mapa de dominio del profesor** ni se presenta como cobertura curricular.

## Verificación

Con `scripts/cdp.mjs`, **jugando y no leyendo el código**:

- ☐ 3° muestra **📖 Lectura** y adentro *Cuentos de Ada* — y **NO** Ana Frank.
- ☐ Un tramo abre y sirve 6 preguntas reales con 4 opciones; se responde y avanza.
- ☐ El botón **← Volver** del mapa regresa a la biblioteca, no a Expediciones.
- ☐ **El mapa de dominio no recibe los `CA-`**, y las cuatro asignaturas de 3° **sí** siguen
  registrando.
- ☐ **8° y 7° sin regresión**: sus campañas abren, su dominio sigue midiendo, y 8° conserva su
  biblioteca de Ana Frank.
- ☐ El guardado de cada curso sigue aislado.
- ☐ **Cero errores de consola y cero 404** en los tres.

Y sobre el banco, antes de consolidar:

```
python scripts/revisar-tanda.py --largo=90 contenido/lectura-cuentos-de-ada/_pool/*.json
python scripts/consolidar-pool-nivel.py lectura-cuentos-de-ada
python scripts/auditar-solape-oa.py contenido/lectura-cuentos-de-ada/preguntas.json
python scripts/validar-oa-json.py lectura-cuentos-de-ada
python scripts/generar-tablero.py
```
