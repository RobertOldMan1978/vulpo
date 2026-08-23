# VULPO v0.99 — Informe de estado

<img src="../assets/kimun-clasico.png" width="150" align="right" alt="Vulpi, la mascota de VULPO">

> **Estado:** completa y jugable de punta a punta; en la vuelta de revisión previa a la v1.
> **Fecha:** 23 de agosto de 2026 · **Commit:** `a06cbbf`
> **Piloto:** 8° básico · Un solo `index.html`, mobile-first.

Plataforma de juegos educativos para escolares chilenos, alineada al currículum del
MINEDUC (8° básico). Cuatro asignaturas con campaña y Jefe Final, un banco propio de
miles de preguntas y un panel del profesor con ranking real por curso.

## Cifras clave

| Indicador | Valor |
|---|---|
| Preguntas en el banco propio | **2.536** |
| Objetivos de aprendizaje (OA) cubiertos | **69** |
| Asignaturas + bancos de apoyo | **4 + 2** |
| Jefes Finales multi-fase | **4** (+ "El Autómata" del Reto de Cálculo) |
| Valor total de la tienda (19 skins) | **9.830 🪙** |

---

## 1. Qué es VULPO

- **Aprender jugando.** Aventura con mapa de niveles, quiz con temporizador, combos, XP,
  monedas, estrellas y logros. **Vulpi**, el zorro mascota, reacciona a cada respuesta.
- **Currículum real.** Contenido alineado a las Bases Curriculares del MINEDUC de Chile.
  Cada asignatura cubre los OA del año en orden, con banco de preguntas de año completo.
- **Comunidad de curso.** Ranking real por curso: el profesor inscribe a sus alumnos y el
  XP se sincroniza con el servidor, así que los compañeros compiten con datos de verdad.

## 2. Contenido curricular

Banco propio de **2.536 preguntas**, verificado archivo por archivo en el repositorio.

| Asignatura | Formato | OA | Unidades | Preguntas | Estado |
|---|---|--:|--:|--:|---|
| Historia, Geografía y Cs. Sociales | Campaña con hilo conductor | 22 | 4 | 663 | ✓ listo |
| Ciencias Naturales | Campaña con hilo conductor | 15 | 4 | 534 | ✓ listo |
| Lenguaje y Comunicación | Campaña con hilo conductor | 15 | 3 | 514 | ✓ listo |
| Matemáticas | Camino de aprendizaje · 17 lecciones | 17 | 4 | 603 | ✓ listo |
| 📚 Vocabulario *(apoyo, en Lenguaje)* | Quiz opción múltiple · ~150 palabras | — | — | 150 | rev. pedagógica |
| 📖 Lectura: *El diario de Ana Frank* *(apoyo)* | Comprensión por tramos · 8 tramos | — | — | 72 | rev. pedagógica |
| **Total** | 4 asignaturas + 2 bancos de apoyo | **69** | **15** | **2.536** | |

Cada OA de los cuatro bancos principales tiene ≥28 preguntas, holgura suficiente para
sortear 10 por etapa sin repetir. Los dos bancos de apoyo esperan la aprobación
pedagógica de Roberto antes de la v1.

## 3. Modos de juego

- **Campaña con hilo conductor** (Historia, Ciencias, Lenguaje): capítulos en orden que
  cubren los OA del año; expediciones de 40 preguntas + jefe (10 por etapa, 15 en el jefe
  de expedición).
- **Matemáticas — camino de aprendizaje:** 17 mini-clases guiadas con explicación y
  **diagramas interactivos** (recta, fracciones, plano cartesiano, balanza de ecuaciones,
  Pitágoras, sólidos…). Cada tema desbloquea el **Reto de Cálculo** (Jefe "El Autómata").
  Cada unidad intercala clase y expedición.
- **Modo Difícil:** desbloqueable al terminar una campaña. 15 s por pregunta y umbral del
  80% para las estrellas. Solo en campañas con Jefe Final real. El primer clear paga completo.
- **Duelo 1v1** en el mismo teléfono y en línea (Supabase).
- **Apoyo:** Vocabulario (15 palabras al azar por ronda) y Lectura del colegio (biblioteca
  con tema "papel cálido").

## 4. Jefes Finales

Multi-fase (4 fases × 4 rondas), con barra de vida y 3 corazones. Vencerlos da skin
exclusiva, insignia coleccionable, corona y bono.

| Villano | Asignatura |
|---|---|
| 🛡️ El Guardián | Historia |
| 🌀 La Entropía | Ciencias |
| 🖋️ El Borrón | Lenguaje |
| ❓ La Incógnita | Matemáticas |

Más **"El Autómata"** (Reto de Cálculo). Cada villano tiene pantalla de derrota temática
con frase propia, y una **cinemática de victoria**: caída del villano con su arte
"derrotado", música "Hero Theme" y confeti dorado.

## 5. Progresión y economía

- **Tienda:** 19 skins, valor total **9.830 🪙** (era 7.140; +38%), de 110🪙 la más barata
  a 1.250🪙 la premium. Reequilibrada para volver a exigir terminar el contenido si se
  quiere "comprarlo todo".
- **Bucle de recompensa:** XP, monedas, estrellas, combos y logros por acierto. Umbrales y
  estrellas por ratio (se ajustan solos). Bono grande al vencer un Jefe Final, solo la
  primera vez.
- **Guard anti-farmeo:** repetir una etapa ya superada paga reducido (+1🪙 / ~25% XP, sin
  bono de estrellas). Frena el farmeo de monedas y la inflación del XP del ranking.

Tres de las 19 skins que se desbloquean jugando:

| <img src="../assets/kimun-cientifico.png" width="110" alt="Vulpi científico"> | <img src="../assets/skin-kimun-karate.png" width="110" alt="Vulpi karateka"> | <img src="../assets/skin-kimun-ciclismo.png" width="110" alt="Vulpi ciclista"> |
|:--:|:--:|:--:|
| Científico | Karateka | Ciclista |

## 6. Panel del profesor

Página aparte (`profesor.html`). Una brújula para la clase, **no** una libreta de notas.

- **Curso real:** el profesor crea el curso con correo y contraseña, inscribe a los alumnos
  y cada uno entra en su teléfono con un código de acceso.
- **Mapa de dominio por OA:** de peor a mejor porcentaje, qué contenidos le están costando
  al curso y quiénes necesitan apoyo en cada uno.
- **Participación:** quién jugó esta semana y quién no ha entrado nunca. Sirve para decidir
  qué reforzar; **no sirve para calificar**.

## 7. Calidad y estado técnico

- **Revisión multi-agente:** revisión estática con 7 agentes especializados (navegación,
  progresión, motor, economía, datos, robustez + un senior que verifica contra el código).
  **9 bugs confirmados y arreglados, 0 descartados** —incluido el error de volver desde
  Matemáticas que salía a Historia—. Todo verificado en el navegador, sin errores de consola.
- **Arquitectura:** todo el juego en un solo archivo, pensado para el celular. Contenido de
  cada asignatura en JSON aparte, fácil de mantener y ampliar.
- **Stack:** HTML + CSS + JS puro, sin framework, mobile-first. CDN: Google Fonts y Supabase
  (para el duelo 1v1 en línea).
- **Producción audiovisual:** intro de bienvenida en video (una vez), 9 pistas de música,
  4 artes "villano derrotado" para la cinemática de victoria. Respeta `prefers-reduced-motion`.

## 8. Camino a la v1

| Pendiente | Detalle | Responsable |
|---|---|---|
| Aprobación pedagógica de los 2 bancos de apoyo | Vocabulario (150) y Ana Frank (72) siguen sin revisar. Flujo tablero → profesor → aplicar-revisadas. | Roberto |
| Trámites de lanzamiento | Marca en INAPI y dominio vulpo.cl. No hay SQL pendiente por aplicar. | Roberto |
| Deuda técnica menor | Decidir sobre la propiedad muerta `bonoMult:2` del desafío: implementarla como bono ×2 o eliminarla. | código |
| Fuera del alcance de la v1 | Login, multiusuario y modelo de negocio quedan para más adelante. | futuro |

---

*Proyecto personal de Roberto · datos verificados contra el repositorio.*
