# `vulpo.cl/colegio` — la página para la dirección y la UTP

**Fecha:** 2026-09-08
**Estado:** diseño aprobado, pendiente de plan de implementación.

## El problema

La landing de `vulpo.cl` le habla bien al **profesor de aula** (su sección "Para el profesor":
mapa de dominio, refuerzo, ranking) y a la **familia**. Al que **decide y paga** —la dirección o
la UTP— casi no: su sección "Para el colegio" es genérica (números de contenido) y **no muestra lo
que se construyó para ese rol** entre las Sesiones 106 y 110:

- **El pulso del colegio** (Sesión 107): la cobertura del programa curso por curso, de un vistazo,
  imprimible para el consejo. Es el diferenciador — el MINEDUC nombra a Kahoot y Quizizz al lado de
  VULPO, y esos miden *actividad*; VULPO sabe, objetivo por objetivo, cuánto del año ya se trabajó,
  que es el trabajo que hoy la UTP persigue con planillas.
- **La planificación del año y el informe de cierre** (Sesiones 108-109): la UTP declara cuándo se
  pasa cada unidad, y VULPO reconstruye cómo quedó el curso al cerrarla, sin mezclarlo con hoy.
- **La tendencia semanal, el corte en-clases/historial, la franja de atención** (Sesiones 106, 109,
  110).

Y ahora que el ciclo de cobro se cierra de punta a punta (SpA, facturación y cuenta lista, 08/09),
el cuello de botella es puramente comercial: poner el argumento institucional frente a un director.

## Decisiones tomadas (con Roberto, 08/09/2026)

1. **Audiencia: la dirección/UTP y el profesor, como lectores separados.** La dirección decide y no
   usa el panel a diario; su herramienta es el pulso. El profesor usa el panel en la semana.
2. **Una página aparte: `vulpo.cl/colegio`.** Un enlace institucional que se le manda a la UTP, sin
   el ruido de "juega desde casa".
3. **`/colegio` profundiza; la landing raíz se mantiene.** La raíz sigue sirviendo a todos (familia,
   profesor, colegio) y gana un enlace a `/colegio`. No se mueve ni se aligera lo que ya funciona.
   Roberto queda con **dos enlaces**: el general (`vulpo.cl`) y el institucional (`vulpo.cl/colegio`).
4. **Registro visual sobrio, no juguetón.** Mismo giro que el panel del profesor en la Sesión 106:
   conserva la marca (logo de Vulpi, violeta como acento, tipografía Inter) pero baja la temperatura
   —estrellas apagadas o ausentes, más densidad de datos y capturas, tono de herramienta de gestión—.
   Que un director piense *"esto es serio"*, no *"esto es un juego"*.
5. **El pulso es el héroe de la página**, arriba, justo después del hero.

## La página, sección por sección

### Hero institucional
Titular **tipográfico** (no el logo-mascota como titular — la Sesión 51 ya aprendió que se ve
infantil), con ángulo de **gestión** y no de juego. En la línea de *"Sabe exactamente cuánto del
programa lleva cada curso."* El logo de Vulpi va pequeño. CTA principal: **agendar una demo**
(el enlace de Google Calendar que ya existe desde la Sesión 101), con el WhatsApp como secundario.

### 🏫 El pulso del colegio — el héroe
El argumento diferenciador, abriendo con lo medido y honesto de la Sesión 107: el MINEDUC nombra
los cuestionarios interactivos (Kahoot, Quizizz) como apoyo válido de la evaluación formativa;
esos miden actividad, y VULPO sabe —objetivo por objetivo— **cuánto del programa del año ya se
trabajó**. Captura del pulso: una fila por curso, cobertura por asignatura, participación de la
semana, **imprimible en una hoja para el consejo**. Y el denominador es honesto (VULPO tiene
contenido para todos los OA del año salvo uno), así que *"31 de 86"* significa de verdad "faltan 55
por tocar", no "VULPO no los tiene".

### 📅 La planificación y el cierre
La UTP carga las fechas de cada unidad a principio de año; VULPO reconstruye, de las fotos
semanales, cómo estaba el curso cuando la unidad cerró. El argumento: *"en diciembre, no sirve ver
avances de asignaturas que se pasaron en abril"* — VULPO fecha cada unidad y muestra su cierre.
Captura de la planificación / el informe de cierre.

### Para el profesor (traído de la raíz y ampliado)
El bloque que ya existe —mapa de dominio ordenado de peor a mejor, refuerzo en un clic,
participación, ranking real— con **capturas actualizadas al panel sobrio de hoy**. Es el "y tu
equipo docente también gana", después del argumento de gestión.

### 🔒 Sin calificar, datos cuidados
Crítico para una UTP, y ya escrito como argumento en la landing: el panel **no sirve para
calificar** ni supervisar docentes (el dato lo reporta el teléfono, es una brújula para reforzar);
y los datos de los menores **no salen del aparato** más allá de lo necesario. Esto desarma la
primera objeción de una UTP responsable.

### Cómo se implementa + prueba sin costo
El colegio crea sus cursos, el profesor inscribe a sus alumnos, cada uno recibe un código, juegan
desde casa. **Sin instalar nada, sin cambiar la regla del celular en la sala.** Cierre con la
prueba sin costo y el CTA de agenda.

## El enlace desde la raíz
La landing de `vulpo.cl` gana **un enlace claro** hacia `/colegio` —en la línea de *"¿Diriges un
colegio o UTP? Mira el panel de gestión →"*—, ubicado donde no compita con "Probar la demo" (su
sección "Para el colegio" es el lugar natural). Sin tocar el resto de la raíz.

## Cuidados técnicos

- **`/colegio/` como carpeta con `index.html`** → URL limpia `vulpo.cl/colegio` sin `.html`.
  ⚠️ Al no estar en la raíz, las rutas relativas a `assets/` se rompen: van **absolutas**
  (`/assets/web/...`). Es la contracara del `<base href="/">` que el proyecto ya conoce.
- **Imagen y metadatos Open Graph propios** de `/colegio`, para que al compartir el enlace por
  WhatsApp o correo a un director se vea como una tarjeta institucional y no como la landing del
  juego.
- **Las capturas se generan con el doble del panel** (`scripts/panel-demo.py` + `cdp.mjs` con
  `ev.escritorio`), del **panel actual sobrio** (Sesión 106), con la etiqueta "DATOS SIMULADOS"
  sobrepuesta (no un pie de foto: viaja con la imagen si alguien la recorta), como las de la raíz.
  ⚠️ El doble puede necesitar ajuste para mostrar el pulso con **varios cursos** con cobertura —
  hoy su foco es el mapa de un curso—; es una tarea del plan, no un supuesto.
- **Reutiliza el sistema de la landing** (Inter, tokens CSS, la estructura de `.seccion`/`.kicker`)
  pero con la paleta corrida a neutro y las estrellas apagadas o muy sutiles. No se escribe un CSS
  desde cero.
- **Reglas de `docs/comercial.md`, sin excepción:** ningún precio en pesos en la cara pública; la
  marca se dice *"en trámite"*, **nunca "registrada" ni ®**; **no** prometer que funciona sin
  internet; y **no** decir "revisadas una a una" (el 100% es de cobertura, no de método — 8° y los
  módulos de apoyo se revisaron pregunta por pregunta, 3° a 7° por muestreo).
- **Responsive y theme-aware** como el resto del sitio: sin desborde a 375 px, y la verificación es
  **mirando la captura**, no contando el DOM (la lección repetida del banner de instalación y de
  las nueve veces que un defecto visual pasó con "cero errores").
- **Un push, con orden**: la página nueva y sus assets primero, el enlace desde la raíz después, o
  a la vez — no hay dependencia de módulo compartido aquí, así que el orden es sólo prolijidad.

## Fuera de alcance

- **Rehacer las 3 capturas del panel viejo que están en la landing raíz.** Son del panel colorido
  anterior a la Sesión 106 y hoy chocan con el panel real, pero arreglarlas es un trabajo aparte
  de la raíz; `/colegio` usa capturas nuevas y no depende de eso. Queda anotado como deuda visual
  de la raíz.
- **Precios, propuesta y guion**: viven fuera del repo (`docs/comercial.md` y la carpeta de
  correos). `/colegio` es la cara pública; los números van en la propuesta, no en la página.
- **Cambiar el panel del profesor.** Esta es una página de marketing sobre el panel, no el panel.
- **Una entidad "Colegio" en el modelo de datos.** Sigue sin existir y esta página no la necesita.
