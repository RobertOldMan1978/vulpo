# VULPO 🎮📚

Plataforma de juegos educativos para escolares chilenos, alineada al currículum
del Ministerio de Educación de Chile. La idea: que estudiar sea entretenido,
desafiante y que genere comunidad entre compañeros.

> **Estado: v0.99** — completo y jugable de punta a punta (4 asignaturas con campaña
> y jefe final), en revisión antes de la v1.

## Piloto actual

**Campaña Historia — 8° básico** (los 22 OA del año, en orden).

Un juego tipo aventura con mapa de niveles, quiz con temporizador, combos, XP,
monedas, estrellas, logros y **ranking real por curso**. **Vulpi**, el zorro mascota,
acompaña y reacciona a cada respuesta. Incluye **Modo Difícil** desbloqueable.

Como **evaluación formativa** (alineada al enfoque del MINEDUC), cada etapa muestra su **meta
de aprendizaje en lenguaje de niño** antes de jugar, ofrece un **comodín 50/50** de ayuda, y al
fallar propone **el siguiente paso** —repasar el objetivo sin presión, o la mini-clase en
Matemática— en vez de solo revelar la respuesta. Y **antes de ver el puntaje** pide una
**predicción** («Lo entendí / Más o menos / Me costó»): el resultado le responde comparando lo
que creía con lo que pasó. Es local y privado, no se envía al profesor.

La pantalla principal ofrece un **módulo por asignatura**. **Historia**, **Ciencias** y
**Lenguaje** se juegan como **campañas con hilo conductor**: capítulos en orden que cubren
todos los OA del año, con **Jefe Final multi-fase** (barra de vida, 3 corazones) y
**recompensas** (skin exclusiva, insignia coleccionable, corona y bono). **Matemáticas**
tiene un **camino de aprendizaje** completo (los 17 OA del año, y desde el 02/09 también los 26
de 3° y los 19 de 7°: **62 mini-clases** en total): mini-clases guiadas con
explicación, **diagramas interactivos** (recta, fracciones, potencias, plano cartesiano con
función, balanza de ecuaciones, triángulo de Pitágoras, sólidos, transformaciones en el plano,
diagrama de cajón, gráficos de barras y árbol de posibilidades) y práctica; aprender cada tema
**desbloquea** el **Reto de Cálculo** (cálculo mental rápido, por niveles, con su Jefe "El
Autómata"). Cada unidad **intercala clase y expedición** —primero se aprende y luego se enfrenta
un desafío con el banco de año completo— y la campaña culmina en su **Jefe Final "La Incógnita"**,
con las mismas recompensas que las demás asignaturas. Cada asignatura tiene un banco de preguntas
de año completo (todos sus OA del currículum).

**Ciencias abre cada capítulo con una introducción**, en los tres cursos: dos o tres pantallas que
encuadran de qué se trata, con el dibujo del modelo —la célula, un circuito abierto y cerrado, las
partículas del sólido y del gas— y **sin preguntas**, porque no evalúan nada. Son 13 en total.

> **Y una regla de contenido que conviene conocer:** los objetivos de índole sexual —currículum
> obligatorio de 7° básico— se juegan **solo en su propio capítulo** y **no entran en ningún Jefe
> Final**, que es el que mezcla objetivos de toda la asignatura. Así un colegio que decida no
> incluir ese capítulo no se lo encuentra en otra parte.
Además hay un **📚 Vocabulario** (dentro de Lenguaje): ~150 palabras de todo el curso en un
quiz de opción múltiple, y una **📖 Lectura** del colegio (biblioteca; primer libro *El diario
de Ana Frank*) con un camino de preguntas de comprensión por tramos.
También hay **Duelo 1v1** en el mismo teléfono y en línea (Supabase) —con aviso en el inicio cuando te desafían o termina tu duelo, y un **ranking de duelos del curso**—, una **tienda de
skins** (incluidas skins deportivas ilustradas) y una **intro de bienvenida** en video que
se ve una vez. Todo en un solo archivo `index.html`, pensado para el celular.

El **ranking es real y por curso**: el profesor crea el curso e inscribe a los alumnos
desde `profesor.html` —una página aparte del juego, con correo y contraseña—, y cada uno
entra en su teléfono con un código de acceso. El XP y **el avance completo** —monedas, skins,
insignias y campañas— se sincronizan con el servidor, así que los compañeros compiten con datos
de verdad y **cambiar de teléfono no borra nada**: se canjea el mismo código y vuelve todo. Para un grupo que parte de cero —una demo, un
taller— el panel también genera un **enlace de inscripción** con cupo: cada persona escribe
su nombre, se crea sola en el curso y recibe su código. Ese enlace **es** la credencial, así
que el cupo se ajusta al grupo.

Ese mismo panel trae el **mapa de dominio por objetivo de aprendizaje**: muestra, de peor a
mejor porcentaje, qué contenidos le están costando al curso y quiénes necesitan apoyo en
cada uno. Arriba del mapa, un bloque de **participación** dice quién jugó esta semana y
quién no ha entrado nunca. Es una brújula para decidir qué reforzar en clase, **no sirve
para calificar**.

## Cómo probarlo

La página de presentación está en **https://vulpo.cl**, el juego en
**https://vulpo.cl/8vo** y el panel del profesor en **https://vulpo.cl/profesor.html**. Hay además un **tutorial** en **https://vulpo.cl/tutorial/**, con capturas y clips del juego real, dividido en dos secciones: para el apoderado y para el alumno. Para desarrollo local conviene un servidor
(`python -m http.server 8765`), porque el JavaScript no funciona bien desde `file://`.

**Se puede instalar en el teléfono.** Desde el menú del navegador, «Agregar a pantalla de
inicio»: queda con su ícono y su nombre (*VULPO 3°*, *VULPO 7°*, *VULPO 8°*) y se abre como una
aplicación, sin la barra del navegador. El juego mismo explica cómo hacerlo, con el paso a paso
del sistema que detecte. **En iPhone hay que hacerlo desde Safari**: desde Chrome el ícono queda
igual, pero al abrirlo aparece la barra de direcciones. Ojo: instalarlo **no** lo hace funcionar
sin internet — para eso haría falta un service worker, que todavía no existe.

## Estado

Versión **v0.99**: completo y jugable de punta a punta, en vuelta de revisión
manual antes de coronar la v1.

**La v1 será VULPO de 3° a 8° básico**, seis cursos completos con sus cuatro
asignaturas. Hoy existen **tres jugables completos** (3°, 7° y 8°) y **5° con su Matemática lista**
(810 preguntas y 27 mini-clases, en revisión pedagógica). De los que faltan —4°, 6° y las
otras tres asignaturas de 5°— ya está **fijado el currículum**: sus 284 objetivos están
transcritos del currículum oficial y validados, en `contenido/<asignatura>-<n>basico/oa.json`.
Lo que falta es escribir sus bancos de preguntas.

**Qué falta y en qué orden está en [`pendiente.md`](pendiente.md)**, la lista viva de tareas:
es el archivo por el que se empieza al abrir una rama. El plan de
organización y la programación están en
[`docs/roadmap-tecnico.md`](docs/roadmap-tecnico.md), junto con la dirección de
mediano plazo: web → PWA → Capacitor → Android → iOS, y el modelo de suscripción
anual por nivel escolar. Nada de eso está implementado todavía.

Aparte hay **dos cursos más completos y aprobados** —7° y 3°— y **5° con su Matemática**, cada uno como una app propia y **sin enlazar desde el sitio**. Todos comparten la misma puerta de acceso: desde el **1 de octubre de 2026** hace falta un código de alumno para jugar más allá de la demo de cada nivel.

**7° básico** (`7mo/`) sigue las mismas bases que 8°: campañas por asignatura con capítulos en orden, jefe de capítulo y Jefe Final multi-fase, Modo Difícil, comodín 50/50, meta de aprendizaje y repaso al fallar. Sus cuatro asignaturas son Historia, Geografía y Ciencias Sociales (23 objetivos), Matemática (19), Ciencias Naturales (15) y Lengua y Literatura (24). No lleva lectura por voz: a los 12-13 años ya se lee de corrido. Guarda su avance y su identidad en línea aparte de 8° y de 3°. Suma además dos **módulos transversales**: un **Vocabulario** de 120 palabras de sus cuatro asignaturas, y un **Reto Sin Fin** de cálculo mental —operaciones generadas por código, sin banco de preguntas— dentro de Matemática. Y desde el 02/09, Matemática se juega como **camino de aprendizaje**: **19 mini-clases**, una por objetivo, con su diagrama interactivo y su práctica.

Y una **app de 3° básico** en `3ro/`, adaptada a niños de
8-9 años (sin cronómetro, apoyo visual dibujado por código, texto grande y **lectura
por voz con una voz chilena grabada** —los MP3 viajan en el repo, y si alguno no
carga se lee con la voz del navegador). Tiene sus **cuatro asignaturas**: Matemática
(26 objetivos, 792 preguntas), Historia, Geografía y Ciencias Sociales (16 objetivos, 480),
Ciencias Naturales (13 objetivos, 390) y Lenguaje y Comunicación (30 objetivos, 896), todas
con su voz grabada; **no está enlazada desde el sitio**. Sus bancos quedaron **aprobados por
muestreo**, y desde el 31/08/2026 no queda ninguno pendiente. Matemática se juega como **camino
de aprendizaje**: **26 mini-clases**, una por objetivo, cada una con su diagrama interactivo
—bloques de cien, tabla de valor posicional, recta con saltos, reloj, monedas, pictograma,
diagrama de puntos—, su práctica del banco y **su voz grabada**, como todo lo demás del curso. Dentro de Matemática lleva además un **Reto Sin Fin** de cálculo mental
**sin cronómetro**, medido por escalones: practica sus objetivos de cálculo mental, tablas y
división, y como genera las operaciones por código no consume banco de preguntas ni voz. Y tiene su **📖 Lectura** con el primer libro del colegio, *Cuentos de Ada* de Pepe Pelayo (Santillana Infantil): 10 tramos, uno por cuento, con **101 preguntas de comprensión originales y aprobadas**, también con voz grabada. El niño lee el ejemplar: el juego no reproduce el texto del libro, y por eso su portada es la genérica de Lectura y no la tapa. Guarda su avance **y su identidad en línea aparte** de 8°, aunque
los dos se sirvan del mismo dominio, así que un curso de 3° y uno de 8° pueden convivir
en el panel del profesor.

Consulta [CLAUDE.md](CLAUDE.md) para el detalle de decisiones de diseño y el
roadmap.

## Tecnología

HTML + CSS + JavaScript puro, sin framework. La única dependencia externa por CDN
son las Google Fonts; `@supabase/supabase-js` (duelo 1v1 en línea, ranking y panel del
profesor) va **auto-hospedado** en `assets/vendor/`, con la versión fija, para no
depender de un script de terceros que puede cambiar.
Contenido de cada expedición en `contenido/<asignatura>/` (JSON). Mobile-first.

Cada curso se sirve de su propia carpeta (`8vo/`, `7mo/`, `3ro/`), pero **el motor del juego se escribe una sola vez** y vive en `assets/js/`: `motor.js` (quiz, campañas, jefes, duelo, tienda, guardado), más los módulos de apoyo `lecciones.js` (el motor de mini-clases e introducciones, con sus 27 diagramas interactivos), `visuales.js` (los dibujos por código), `voz.js` (la lectura en voz alta), `fracciones.js` (las fracciones apiladas), `instalar.js`, `calculo.js`, `revision.js`, `sensible.js` y `niveles.js`. Lo que cambia de un curso a otro son **datos y banderas**, no código.

---

Proyecto personal de Roberto.
