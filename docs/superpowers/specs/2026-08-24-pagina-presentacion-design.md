# Página de presentación en `vulpo.cl` y traslado del juego a `/juego`

**Fecha:** 2026-08-24
**Estado:** Diseño aprobado, pendiente de plan de implementación

## Contexto

La Sesión 44 dejó construida —y apagada— la puerta de acceso: cuando Roberto ponga una fecha en
`FECHA_PUERTA`, jugar más allá del capítulo 1 de Historia exigirá un código `ALU-`.

**Esa puerta no se puede activar todavía**, porque el día que cierre, un colegio interesado tiene
que poder contratar. Hoy la pantalla de fin de demo lleva a un correo y un teléfono, y nada más.
Esta página es lo que falta para poder activarla.

Hoy `vulpo.cl` sirve el juego directamente en la raíz. La página comercial ocupará ese lugar y el
juego se moverá a `vulpo.cl/juego`.

## Decisiones tomadas

| Punto | Decisión |
|---|---|
| Herramienta | **HTML y CSS a mano**, sin framework ni paso de compilación. |
| Audiencia | **Colegio → profesor → apoderado**, en ese orden. |
| Precio | **No se muestra.** Invita a conversar. |
| Contacto | **WhatsApp** como botón principal. |
| Imágenes | **Capturas reales** del juego y del panel. Nada de maquetas. |
| Testimonios | **Ninguno.** No se inventan citas de colegios que no existen. |

### Por qué HTML a mano y no un framework

- Todo el proyecto funciona así: un `git push` publica. No se agrega nada que aprender ni
  mantener.
- Roberto trabaja en dos computadores con un respaldo automático diario. Meter `node_modules` y
  un compilador complica algo que hoy no tiene fricción.
- Una página de presentación es texto, imágenes y dos botones.
- Reutiliza la identidad visual del juego sin costo: tipografías Titan One y Nunito, paleta
  violeta y dorada, e ilustraciones de Vulpi que ya están en `assets/`.

Si algún día la página crece a varias secciones (precios, blog, documentación), migrarla a un
generador estático es media tarde. Empezar con uno para una página que quizá nunca crezca es
pagar por adelantado.

---

## Parte 1 — Trasladar el juego a `/juego`

Se hace **primero y se verifica completo** antes de tocar la página nueva, para que si algo se
rompe se sepa exactamente qué lo rompió.

### El problema de las rutas

El juego vive en `index.html` y referencia **118 rutas relativas** (91 a `assets/`, 27 a
`contenido/`). Movido a un subdirectorio, todas apuntarían a `/juego/assets/…` y darían 404.

**Solución: `<base href="/">`** como primera etiqueta del `<head>`. Una línea que hace que todas
las rutas relativas se resuelvan desde la raíz. Se verificó que el archivo solo tiene **3**
enlaces `href="#"`, y los tres llevan `preventDefault`, así que la etiqueta `<base>` no les
afecta.

`<base href="/">` es correcto **porque el sitio vive en el dominio propio**: con `CNAME` a
`vulpo.cl`, la raíz del sitio es la raíz del dominio. La URL antigua
`robertoldman1978.github.io/vulpo/` redirige al dominio, así que no hay caso en que la base deba
ser otra.

### Los cambios

- `index.html` (el juego) pasa a **`juego/index.html`**, con `<base href="/">` añadido.
  La URL queda `vulpo.cl/juego/`.
- **`profesor.html`**: el botón del armador pasa de `index.html?armar=1` a `/juego/?armar=1`.
- **El armador no necesita cambios.** Construye los enlaces con `location.origin +
  location.pathname`, así que desde `/juego/` los generará correctos por sí solo.
- **La pantalla de muestra vencida tampoco.** Su botón usa la misma construcción.
- `README.md` y `CLAUDE.md` se actualizan con las direcciones nuevas.

### Consecuencia aceptada

Los enlaces de muestra ya repartidos apuntan a la raíz y **dejarán de abrir el juego**: llevarán
a la página de presentación. Roberto lo aceptó explícitamente — el enlace de Historia que está en
manos de apoderados no sobrevive la semana. **No se construye ningún reenvío.**

---

## Parte 2 — La página de presentación

Un solo archivo, `index.html` en la raíz, con su CSS embebido como hace el resto del proyecto.

### Estructura

**1. Portada**

Qué es VULPO en una frase, la ilustración de Vulpi, y dos botones:
*Probar la demo* → `/juego` · *Hablemos por WhatsApp*.

El botón de la demo no necesita un enlace de muestra: con la puerta activada, `/juego` **ya es**
la demo pública (capítulo 1 de Historia, abierto para cualquiera). Los enlaces `?solo=` quedan
para muestras a medida de un colegio concreto.

**2. Para el colegio**

El argumento de peso: no es un juego suelto, es un sistema con información para el profesor.

- Cobertura: **4 asignaturas, 2.536 preguntas** alineadas a los Objetivos de Aprendizaje de 8°
  básico (MINEDUC), todas revisadas.
- El **panel del profesor**: ranking real por curso, participación semanal, y el **mapa de
  dominio por OA** que muestra qué contenidos le están costando al curso.
- Cómo se implementa: el colegio crea sus cursos, el profesor inscribe a sus alumnos, cada uno
  entra con su código.

**3. Para el profesor**

Capturas reales del panel: quiénes necesitan apoyo, participación, desafíos de refuerzo, ranking
del curso. El mensaje: **es una brújula para decidir qué reforzar en clase, no una herramienta
para calificar** — que es como está descrito en el propio proyecto.

**4. Para el apoderado**

Tono cercano y la historia real: **lo hizo un papá chileno para su hijo de 8° básico**. Qué gana
su hijo: estudia jugando, contenido del currículum chileno, y compite sanamente con su curso. La
demo a un clic.

**5. Cierre**

WhatsApp, grande.

### Identidad visual

La misma del juego —violeta profundo, dorado, cian; Titan One para títulos y Nunito para el
texto— para que se sienta el mismo producto y no dos cosas distintas.

**Responsive de verdad, en los dos sentidos:** el apoderado llega por teléfono y el jefe de UTP
por computador. A diferencia del juego (mobile-first a propósito, 480px), esta página debe verse
bien en pantalla ancha.

### Capturas

Se toman del navegador, del juego y del panel corriendo en local, y se guardan en
`assets/web/`. **Ninguna imagen inventada ni maqueta:** lo que se muestra es lo que hay.

Para las capturas del panel se usa el mismo procedimiento de sesiones anteriores (backend
simulado), porque no se puede iniciar sesión de profesor desde el entorno de desarrollo.

### Metadatos

Es una página comercial que se va a compartir por WhatsApp, así que necesita `title`,
`description` y etiquetas Open Graph con una imagen, para que el enlace se vea bien al pegarlo en
un chat. Es la diferencia entre un enlace con tarjeta y un enlace pelado.

## Lo que NO lleva

- **Precios.** Decidido.
- **Formulario.** Un sitio estático no puede enviar correos; exigiría Supabase o un servicio
  externo. El botón de WhatsApp cumple la misma función sin infraestructura.
- **Testimonios**, hasta que exista una cita real de un colegio real.
- **Analítica.** Roberto había mencionado que le gustaría saber quién entra; medir visitas es un
  proyecto aparte y con implicaciones de privacidad. **Fuera de alcance**, anotado como tema
  pendiente.
- **Blog, precios, documentación**: si algún día llegan, se replantea la herramienta.

### Un dato de contacto añadido, sujeto a veto

El botón principal es WhatsApp, como se decidió. En el pie se agrega además el correo
**vulpochile.app@gmail.com** en letra discreta, como salida para quien no use WhatsApp o prefiera
escribir formalmente (un jefe de UTP, por ejemplo). **Es una decisión de quien implementa, no de
Roberto:** si prefiere solo WhatsApp, se quita.

## Verificación

**Del traslado (Parte 1):**

1. `localhost:8765/juego/` carga el juego completo, con todas las imágenes y el banco de
   preguntas — **cero 404** en la red, salvo los `portada-*.png` que ya fallaban por convención.
2. Se juega una etapa completa de principio a fin.
3. `?solo=`, `?m=`, `?armar=1` y `?qa=1` funcionan desde la ruta nueva.
4. El armador abierto en `/juego/?armar=1` genera enlaces que empiezan por
   `http://localhost:8765/juego/?m=…`, no por la raíz.
5. `profesor.html` sigue funcionando y su botón del armador lleva a `/juego/?armar=1`.
6. `dev/tablero.html` sigue abriendo.

**De la página (Parte 2):**

7. `localhost:8765/` muestra la página, no el juego.
8. El botón *Probar la demo* lleva a `/juego`.
9. El botón de WhatsApp abre un chat al **+569 7668 4967** con un mensaje predefinido.
10. Se ve correctamente a 375px de ancho (teléfono) y a 1280px (computador), sin desborde
    horizontal en ninguno.
11. Todas las imágenes cargan y tienen texto alternativo.
12. Consola limpia en ambas páginas.

## Riesgos y límites

- **La página promete y el producto tiene que sostenerlo.** Todo lo que afirme debe ser
  verificable hoy: las 2.536 preguntas revisadas lo son (se corrigió en esta misma sesión la nota
  interna de tres bancos que decía lo contrario).
- **No prometer funcionamiento sin internet.** Verificado en la Sesión 44: VULPO no funciona sin
  conexión.
- **El teléfono queda público** en una página indexable, con el riesgo de spam que eso implica.
  Es el contacto oficial del proyecto y fue decisión de Roberto.
- **Los enlaces de muestra viejos se rompen** con el traslado. Aceptado.
- **La página no activa la puerta.** `FECHA_PUERTA` sigue vacía al terminar este trabajo;
  activarla es una decisión aparte de Roberto.
