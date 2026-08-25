# 3° básico en VULPO — nivel nuevo (piloto: Matemática)

- **Fecha:** 2026-08-25
- **Estado:** diseño aprobado (brainstorming). Pendiente de plan de implementación.
- **Origen:** Sesión 53. VULPO cubre hoy solo 8° básico; agregar 3° básico como
  producto real para colegios amplía el catálogo y sube el techo por colegio.

## 1. Objetivo

Agregar **3° básico** a VULPO como **producto real para colegios**, con las **4
asignaturas** del currículum de 1°-6° del MINEDUC (Lenguaje, Matemática, Ciencias
Naturales, e Historia/Geografía/Cs. Sociales), usando el **mismo esqueleto de juego**
de 8° **afinado para niños de 8 años**. El motor data-driven no cambia de forma: se
suma contenido nuevo, una capa de nivel y un puñado de adaptaciones de UX.

El desafío central: un niño de 3° todavía está aprendiendo a leer con fluidez, así que
el mayor riesgo es que el juego termine evaluando **lectura** en vez de la asignatura.
Las adaptaciones de UX apuntan a evitar eso.

## 2. Decisiones tomadas (brainstorming)

1. **Público:** producto real para colegios (no solo prueba personal).
2. **Alcance:** 3° básico completo, las 4 asignaturas. **Se construye por etapas**,
   empezando por **Matemática** de punta a punta.
3. **UX para niños:** lectura en voz alta, texto corto/grande, apoyo visual mixto,
   4 opciones (se mantiene), sin cuenta regresiva.
4. **Convivencia:** el **nivel es propiedad del curso**; el código `ALU-` lo fija (para
   el panel y la identidad). El empaquetado es una **app aparte** (ver punto 6).
5. **Estructura:** mismo esqueleto (campañas, capítulos, **jefes**, **stickers/skins**,
   tienda, ranking), afinado; **sin Modo Difícil**; Reto de Cálculo/Duelo en fase
   posterior.
6. **Aislamiento y despliegue:** 3° se construye en su **propia carpeta/URL**
   (`vulpo.cl/3ro`), **sin aparecer** en el juego vivo (`/juego`) ni en las muestras
   hasta estar terminado. El 8° actual no se toca.

## 3. Aislamiento, convivencia y acceso (el cambio estructural)

**Aislamiento (restricción de Roberto).** 3° se construye como una **app aparte** en su
propia carpeta del repo (`3ro/`), servida por GitHub Pages en **`vulpo.cl/3ro`**. Durante
el desarrollo **no se enlaza desde ningún lado**: ni la landing (`/`), ni el juego vivo
(`/juego`), ni las muestras (`?solo=`, `?m=`, `?armar=1`) la exponen. El juego de 8°
(`juego/index.html`) **no se toca**. Se despliega a `/3ro` solo para que Roberto la
visualice tras commitear. Así el trabajo en curso nunca llega al público hasta terminar.

- *Trade-off asumido:* la app de 3° parte como una **copia del motor** de `juego/`
  adaptada a niños, no como un flag dentro del motor vivo. Es lo que garantiza que 8° y
  las muestras queden intactos. La eventual reunificación de ambos mundos bajo una sola
  URL con selector de nivel queda como **decisión futura**, cuando 3° esté terminado.

**Convivencia (modelo de datos, se mantiene).** El **nivel es propiedad del curso** que
crea el profesor. Nuevo campo `cursos.nivel` (valores tipo `'3basico'` / `'8basico'`; el
existente se migra a `'8basico'`). Al canjear el código `ALU-`, la app resuelve el nivel
del niño vía su curso. Como la app de 3° es 3°-only, un niño de 3° nunca ve contenido de
8° por construcción; el campo `nivel` sirve sobre todo para que el **panel** atribuya
bien los datos.

**Acceso/demo dentro de `/3ro`.** No hace falta el selector "¿En qué curso estás?" (la
app ya es 3°-only). La **demo libre** de 3° (`DEMO_LIBRE`) es el **primer capítulo de
Matemática de 3°**. La **puerta de acceso** (`FECHA_PUERTA`) para 3° es una **preocupación
posterior** (al lanzar a colegios); durante el desarrollo `/3ro` está oculta, no pública.

**Panel del profesor consciente del nivel.** El backend es **compartido** (misma base
Supabase). El mapa de dominio, el filtro de asignaturas, el ranking por asignatura y el
refuerzo se acotan al nivel del curso. Los códigos de OA nuevos (`MA03`, y a futuro
`LE03`, `CN03`, `HI03`) se suman a `kimun_oa_asignatura`. El panel (`profesor.html`) es
el **único lugar compartido** que se toca en esta fase, y con cuidado de no alterar 8°.

## 4. UX para niños de 8 años

Estas adaptaciones aplican **solo al mundo de 3°** (el de 8° no cambia):

- **🔊 Escuchar:** botón que hace que Vulpi lea la pregunta y las opciones en voz alta,
  con la **voz del navegador** (Web Speech API, `speechSynthesis`) — gratis, sin
  archivos de audio. *Notas técnicas:* la disponibilidad y calidad de la voz en español
  varía por dispositivo; en móvil la síntesis necesita un gesto del usuario para
  arrancar; si no hay voz en español, el botón se degrada en silencio (no rompe). VULPO
  no funciona sin conexión, así que no se promete lectura sin internet.
- **Texto corto y letra grande:** enunciados de una línea, sin la "línea de meta" larga
  ni tecnicismos. Vulpi habla más simple.
- **Apoyo visual mixto:**
  - **Grueso generado por código** (emojis, objetos para contar, rectas numéricas,
    formas, íconos), infinito y liviano — reusa el enfoque de los diagramas SVG de las
    mini-clases de Matemática de 8°.
  - **Pocas ilustraciones hechas a mano** (Roberto) para portadas, villanos y momentos
    especiales, como ya se hace con capítulos y jefes.
- **4 opciones** (se mantiene, decisión de Roberto), con botones grandes.
- **Sin cuenta regresiva:** se juega al ritmo del niño (el reloj de 20 s estresa a esa
  edad). No hay penalización por tiempo.

## 5. Estructura del juego

- **Mismo esqueleto:** asignatura → campaña → capítulos (etapas + **jefe final**) →
  recompensas (**skins/stickers**, insignias, corona), **tienda** y **ranking del
  curso**. Los desafíos, jefes y stickers **se conservan** — enganchan a los niños.
- **Afinado para 3°:**
  - Etapas **más cortas**: **5-6 preguntas** por etapa (en vez de 10).
  - Umbral de aprobación **más amable** (a definir en el plan; más bajo que el 66% de
    8°, coherente con etapas cortas).
  - **Sin reloj.**
  - **Sin Modo Difícil** (los 15 s / 80% no van para 8 años; el "desafío" lo dan los
    jefes).
- **Extras diferidos a fase posterior** (no en la primera entrega): un "Reto de Cálculo"
  de sumas simples y el Duelo entre compañeros.

## 6. Contenido

- Bancos por OA generados con **agentes en paralelo** (como en 8°), desde el currículum
  oficial de 3° básico (curriculumnacional.cl, Bases Curriculares 1°-6°), **redactados
  para lector inicial**: frases cortas, vocabulario simple, apoyables por voz e imagen
  de código.
- **Revisión pedagógica humana:** Roberto aprueba vía el tablero → `aplicar-revisadas`,
  igual que hoy. Las preguntas nacen `revisada:false`.
- **Convención de archivos:** `contenido/matematicas-3basico/` (con `oa.json` y
  `preguntas.json`), y análogas para las otras asignaturas. Códigos de OA con el patrón
  de nivel: `MA03 OA 01`, etc. Barajado de opciones con `consolidar-pool` como siempre.

## 7. Orden de construcción (de-riesgar)

Aunque el objetivo es 3° completo, se construye **una asignatura de punta a punta
primero — Matemática —** (contenido + UX de niño validada jugando de verdad), y recién
con el molde probado se generan las otras tres. Así, si algo del diseño para niños
falla, no se repite 4 veces. **No reduce el alcance; ordena el trabajo.**

## 8. Alcance de la primera entrega

**Dentro:**
- **App de 3° en carpeta `3ro/`** (copia adaptada del motor de `juego/`), servida en
  `vulpo.cl/3ro`, **aislada** y **no enlazada** desde el sitio ni las muestras.
- Capa de **nivel** en el backend compartido (`cursos.nivel`, migración del existente,
  panel consciente del nivel, `kimun_oa_asignatura` con códigos de 3°).
- Adaptaciones de **UX de niños** (🔊 lectura, texto corto/grande, apoyo visual de
  código, sin reloj, etapas cortas) en la app de 3°.
- **Matemática de 3° completa:** banco por OA (revisado), campaña con capítulos + jefe
  final, portadas/villano (arte de Roberto), integrada en la app de 3°.

**Fuera (fases posteriores):**
- Las otras 3 asignaturas de 3° (Lenguaje, Ciencias, Historia).
- Reto de Cálculo y Duelo para 3°.
- Modo Difícil para 3° (descartado por edad).

## 9. Riesgos y consideraciones

- **Voz del navegador (TTS):** variabilidad de voces en español y necesidad de gesto en
  móvil; se maneja con fallback silencioso. No se promete lectura sin conexión.
- **VULPO no funciona sin internet** (sin service worker; el banco se pide con `fetch`).
  No prometer juego sin conexión a un colegio.
- **Costo de ilustraciones:** el apoyo visual del grueso debe ser por código; solo unas
  pocas ilustraciones a mano, para no pedir miles de imágenes.
- **No romper 8°:** todas las adaptaciones se aplican solo al mundo de 3°; el de 8° debe
  quedar idéntico. Verificar no-regresión.
- **Panel filtrado por nivel:** cuidar que un profesor con cursos de ambos niveles vea
  cada uno con sus asignaturas/OA correctos.
- **Repositorio público:** el contenido de 3° será legible por cualquiera (igual que el
  de 8°); la puerta es bloqueo blando. Sin cambios respecto a hoy. **`/3ro` queda en el
  repo público y desplegado, solo que sin enlaces** — es "oculto por no estar enlazado",
  no un candado; alguien que adivine la URL puede entrar. Aceptable para un WIP.
- **Fork del motor:** `3ro/index.html` nace como copia de `juego/index.html` y **diverge**
  (arreglos de bugs de motor habría que aplicarlos en dos lados). Es el precio del
  aislamiento total. La reunificación futura bajo una sola app es una decisión aparte.

## 10. Cambios técnicos (esbozo, se detalla en el plan)

- **App de 3° (`3ro/index.html`):** copia del motor de `juego/index.html` adaptada a
  niños. `EXPEDICIONES`/`CAMPAÑAS` de 3°; menú y carga de contenido de 3°; módulo de
  **lectura en voz alta** (Web Speech API); quiz afinado (sin reloj, etapa de 5-6, sin
  Modo Difícil, texto grande, apoyo visual de código); `DEMO_LIBRE` = 1.º capítulo de
  Matemática de 3°. **Sin enlaces** desde/hacia la landing, `/juego` ni las muestras.
  *(La app 8° `juego/index.html` no se modifica.)*
- **Backend (`supabase/schema.sql`):** columna `cursos.nivel`; migración del existente a
  `'8basico'`; `kimun_oa_asignatura` reconoce los códigos de 3°; las funciones del panel
  ya filtran por curso, así que heredan el nivel del curso.
- **Panel (`profesor.html`):** consciente del nivel del curso al mostrar dominio,
  asignaturas, ranking y refuerzo (único archivo compartido que se toca; cuidar 8°).
- **Contenido:** `contenido/matematicas-3basico/` (banco + `oa.json`), arte de portadas
  y villano de la campaña de Matemática de 3°.
- **Tablero (`scripts/generar-tablero.py`):** incluir el nuevo banco de 3°.
- **Despliegue:** GitHub Pages ya sirve todo el repo; la carpeta `3ro/` queda disponible
  en `vulpo.cl/3ro` sin configuración extra. No agregar enlaces públicos a `/3ro`.
