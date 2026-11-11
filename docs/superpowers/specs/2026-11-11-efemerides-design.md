# La efeméride del día — diseño

> Pedido de Roberto (10/11/2026): *"una pantalla inicial con noticias o efemérides de Chile, para
> cada día del año, con imágenes de Vulpi, reciclando todas las imágenes que tenemos"*. Aprobado
> el 11/11/2026 con un ajuste: **la voz la lee sola de 1° a 4°**.

## 1. Qué es

Al abrir VULPO por primera vez en el día, aparece un popup con Vulpi:

> 📅 **Hoy, 11 de noviembre**
> *[imagen del día dentro del medallón dorado]*
> En 1520, Magallanes entró al estrecho que hoy lleva su nombre…  ← (ejemplo de formato; la
> fecha real se verifica al escribir)
> **[ ¡Vamos! ]**

- **Un hecho por día del año: 366 entradas** (incluido el 29 de febrero).
- **Un solo texto para los ocho cursos**, de una o dos frases simples (≤130 caracteres).
- **De 1° a 4° la voz de Catalina lo lee sola** al aparecer (los cursos con voz pregrabada).
  De 5° a 8° no hay voz: se lee.
- **Imágenes recicladas, cero arte nuevo:** cada día elige una de las ~170 ilustraciones que ya
  existen (las ~31 de Vulpi —expresiones, trajes, skins— y las ~141 portadas de capítulo).

**Qué NO es:** no son noticias. Noticias reales exigen una fuente diaria, moderación para niños y
conexión permanente. Las efemérides son un listado fijo que se escribe una vez, se verifica, se
aprueba como el banco de preguntas y viaja con el juego.

## 2. Contenido: «Chile, de todo un poco»

Historia de Chile, ciencia y naturaleza chilenas, cultura (Mistral, Neruda, Violeta Parra), deporte,
días oficiales (Día del Libro, de la Tierra, de los Pueblos Indígenas). Si un día no tiene nada
bueno de Chile, un hito mundial de ciencia o exploración.

### Fechas delicadas: ese día va OTRO hecho

No se nombra el hecho delicado; se elige otra efeméride del mismo día. Lista mínima, que el
validador comprueba:

| Fecha | Lo que NO se nombra |
|---|---|
| 11-09 | 1973 |
| 18-10 | 2019 |
| 29-03 | Día del Joven Combatiente |
| 05-10, 25-10, 04-09 | plebiscitos y elecciones |
| 27-02 | el terremoto de 2010 |

Reglas generales, mismas que el banco:

- **Ningún hecho político de 1970 en adelante.**
- **Terremotos solo como ciencia** (el mayor registrado, cómo prepararse), sin víctimas.
- **Guerras y batallas solo si son currículum o feriado oficial** (Maipú, 21 de mayo), contadas
  por lo que significan, sin violencia gráfica.
- **Feriados religiosos con encuadre cultural y neutro**, o se elige otro hecho.
- **Nada del contenido sexual** que el proyecto ya aparta (`docs/contenido-sensible.md`).

## 3. Datos (capa de contenido)

`contenido/efemerides/efemerides.json`, formato canónico del proyecto (`indent=1`, LF, sin salto
final):

```json
{
 "efemerides": [
  {
   "id": "efem-11-10",
   "fecha": "11-10",
   "texto": "…",
   "img": "portada-hist-cap2.png",
   "tema": "historia",
   "fuente": "https://…",
   "revisada": false
  }
 ],
 "revisadas": 0
}
```

- **`fuente`** es una URL donde se verificó la fecha. **No se muestra**, pero es la defensa contra
  un dato inventado: 366 fechas escritas de memoria es justo donde se cuelan errores.
- **`tema`**: `historia` · `ciencia` · `naturaleza` · `cultura` · `deporte` · `dia-oficial` ·
  `mundo`. Sirve para revisar el equilibrio, no se muestra.
- **`img`**: nombre de archivo dentro de `assets/`, elegido del catálogo (§5).
- **El juego solo muestra entradas con `revisada:true`.** Un día sin efeméride aprobada no tiene
  popup: no falla y no inventa nada.

La carpeta no lleva `oa.json`, así que `generar-tablero.py`, `validar-oa-json.py` y
`aplicar-revisadas.py` no la confunden con una asignatura (comprobado: los tres saltan las carpetas
sin `oa.json`).

## 4. Pantalla (motor)

Todo en `assets/js/motor.js`, para los ocho cursos.

- **`popupVulpi(o)` gana un campo opcional `o.img`** (sin él sigue mostrando
  `kimun-sorprendido.png`, así que el profe y el duelo no cambian). El texto se escapa con `escHtml`.
- **`popupEfemeride()`**: arma el popup con `titulo:'📅 Hoy, <d> de <mes>'`, la imagen y el texto
  del día, y botón **«¡Vamos!»**.
  - **Clave `kimun_efem_pop`, SIN sufijo de curso, con la fecha `AAAA-MM-DD` como id**: se ve una
    vez por día en el aparato, entre todos los cursos.
  - **Prioridad más baja:** se llama al volver a `scr-rol` y tras la intro, con una espera corta
    para dejar que el desafío del profe y el del duelo (que llegan del servidor) pasen primero. Si
    hay otro popup abierto, `popupVulpi` ya hace esperar a la efeméride sin marcarla vista: sale en
    la próxima apertura.
  - **Nunca** en `EFIMERO`, `SIN_DISCO` (modo prueba, QA, armador) ni en modo docente.
  - **El JSON se descarga solo si corresponde mostrar** (no vista hoy, no efímero). Si falla o no
    hay entrada aprobada para hoy, no pasa nada.
- **Voz:** con `LEE_SOLO` (1° a 4°) se lee sola, con `leerEnVoz(texto)`, que ya cae a la voz del
  navegador si falta el clip. ⚠️ `callarVoz()` al cerrar.
- **Fecha del aparato** (no del servidor): es lo que el niño ve como "hoy".

## 5. Catálogo de imágenes

`contenido/efemerides/imagenes.json`: cada imagen reutilizable con una línea que dice qué muestra
(«Vulpi navegando en carabela con brújula», «Vulpi con microscopio en el laboratorio»). Se arma
**mirando cada imagen**, no por el nombre del archivo. Es lo que los redactores usan para elegir,
y el validador comprueba que toda `img` esté en él.

Quedan fuera los villanos (son de los jefes) y las genéricas de asignatura de estilo distinto.

## 6. Voz (1° a 4°)

- Carpeta nueva **`assets/voz/efem/`**, con su entrada en `scripts/voz_asignaturas.py` leyendo
  `contenido/efemerides/efemerides.json` (solo `texto` de las revisadas).
- Se agrega `'assets/voz/efem/'` a `VOZ_DIRS` de `1ro/`, `2do/`, `3ro/` y `4to/` (una línea cada
  uno). La app la baja offline con el resto.
- **366 clips, ~US$0,30, se generan SOLO después de que Roberto apruebe los textos** y con su
  autorización. Van a R2 (`voz-r2.py subir` y `paquetes`); los MP3 nacen fuera de git.

## 7. Escritura, en tandas

- **Tanda de validación primero: un mes** (noviembre, que es el que se probará primero). Valida el
  encargo antes de escalar.
- Después **un mes por agente, de a 2**, cada uno buscando y verificando cada fecha en la web, con
  el catálogo de imágenes y las reglas de §2 al lado.
- Encargo por escrito en `docs/encargo-efemerides.md` (tono para niños de 6 a 14, sin modismos,
  frases cortas, año dentro del texto, fuente obligatoria, nada de §2).
- Los agentes **no usan git** para cambiar el árbol.

## 8. Validación automática: `scripts/validar-efemerides.py`

Sale con 1 si:

- no hay exactamente **366 fechas distintas** (`01-01` … `12-31`, con `02-29`);
- un `id` no es `efem-<fecha>` o se repite;
- un `texto` pasa de 130 caracteres, va vacío o lleva emoji (la voz lo leería por su nombre);
- una `img` no existe en `assets/` o no está en el catálogo;
- falta `fuente` o no empieza con `https://`;
- un texto de una fecha de §2 nombra lo vetado (lista de patrones por fecha).

Avisos (no cambian la salida): el mismo `img` en días seguidos; un mes con más del 50% de un solo
`tema`.

## 9. Aprobación

Por el circuito de siempre, para que no haya dos puertas:

- **`generar-tablero.py` gana una sección «📅 Efemérides»** con cada entrada en una fila: miniatura
  de la imagen, fecha, texto y casilla. Mismo almacén de marcas (ids `efem-…`), mismo «Exportar
  revisadas».
- **`aplicar-revisadas.py`** escribe `revisada:true` en `efemerides.json`.
- Control positivo al aplicar: desmarcar una, comprobar que el tablero la detecta, restaurar.

## 10. Verificación (con `scripts/cdp.mjs`, jugando)

- Aparece una vez al día y **no vuelve** al recargar; con la fecha simulada a mañana, aparece otra.
- Muestra la imagen del día cargada (`naturalWidth>0`) y el texto correcto.
- Con un desafío del profe pendiente, sale el desafío y la efeméride espera.
- No sale en `?solo=`, `?qa=1`, `?armar=1` ni modo docente.
- Con `efemerides.json` ausente o con el día sin aprobar: nada, cero errores.
- En 1° a 4° pide el clip de `voz.vulpo.cl/efem/…` solo (espiando `Audio`); en 6° no suena.
- 375×667: el popup cabe y el botón JUGADOR sigue entero al cerrarlo.
- Los ocho cursos arrancan y JUGADOR navega; cero errores de consola y de red.

## 11. Lo que queda fuera de esta primera versión

- Que el profe vea o elija la efeméride, o que se use en clase.
- Efemérides por curso o por región.
- Una pantalla para ver los días anteriores.
