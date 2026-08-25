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
Matemática— en vez de solo revelar la respuesta; al cerrar, un **semáforo** de autoevaluación.

La pantalla principal ofrece un **módulo por asignatura**. **Historia**, **Ciencias** y
**Lenguaje** se juegan como **campañas con hilo conductor**: capítulos en orden que cubren
todos los OA del año, con **Jefe Final multi-fase** (barra de vida, 3 corazones) y
**recompensas** (skin exclusiva, insignia coleccionable, corona y bono). **Matemáticas**
tiene un **camino de aprendizaje** completo (los 17 OA del año): mini-clases guiadas con
explicación, **diagramas interactivos** (recta, fracciones, potencias, plano cartesiano con
función, balanza de ecuaciones, triángulo de Pitágoras, sólidos, transformaciones en el plano,
diagrama de cajón, gráficos de barras y árbol de posibilidades) y práctica; aprender cada tema
**desbloquea** el **Reto de Cálculo** (cálculo mental rápido, por niveles, con su Jefe "El
Autómata"). Cada unidad **intercala clase y expedición** —primero se aprende y luego se enfrenta
un desafío con el banco de año completo— y la campaña culmina en su **Jefe Final "La Incógnita"**,
con las mismas recompensas que las demás asignaturas. Cada asignatura tiene un banco de preguntas
de año completo (todos sus OA del currículum).
Además hay un **📚 Vocabulario** (dentro de Lenguaje): ~150 palabras de todo el curso en un
quiz de opción múltiple, y una **📖 Lectura** del colegio (biblioteca; primer libro *El diario
de Ana Frank*) con un camino de preguntas de comprensión por tramos.
También hay **Duelo 1v1** en el mismo teléfono y en línea (Supabase), una **tienda de
skins** (incluidas skins deportivas ilustradas) y una **intro de bienvenida** en video que
se ve una vez. Todo en un solo archivo `index.html`, pensado para el celular.

El **ranking es real y por curso**: el profesor crea el curso e inscribe a los alumnos
desde `profesor.html` —una página aparte del juego, con correo y contraseña—, y cada uno
entra en su teléfono con un código de acceso. El XP se sincroniza con el servidor, así que
los compañeros compiten con datos de verdad.

Ese mismo panel trae el **mapa de dominio por objetivo de aprendizaje**: muestra, de peor a
mejor porcentaje, qué contenidos le están costando al curso y quiénes necesitan apoyo en
cada uno. Arriba del mapa, un bloque de **participación** dice quién jugó esta semana y
quién no ha entrado nunca. Es una brújula para decidir qué reforzar en clase, **no sirve
para calificar**.

## Cómo probarlo

La página de presentación está en **https://vulpo.cl**, el juego en
**https://vulpo.cl/juego** y el panel del profesor en **https://vulpo.cl/profesor.html**. Para desarrollo local conviene un servidor
(`python -m http.server 8765`), porque el JavaScript no funciona bien desde `file://`.

## Estado

Versión **v0.99**: completo y jugable de punta a punta, en vuelta de revisión
manual antes de coronar la v1. Login, multiusuario y modelo de negocio quedan
para más adelante.

Consulta [CLAUDE.md](CLAUDE.md) para el detalle de decisiones de diseño y el
roadmap.

## Tecnología

HTML + CSS + JavaScript puro, sin framework. Dependencias externas por CDN:
Google Fonts y `@supabase/supabase-js` (para el duelo 1v1 en línea).
Contenido de cada expedición en `contenido/<asignatura>/` (JSON). Mobile-first.

---

Proyecto personal de Roberto.
