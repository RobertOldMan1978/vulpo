# Modelo comercial de VULPO

> ⚠️ **Este repositorio es PÚBLICO.** Lo que se escriba aquí lo puede leer cualquiera. Los
> precios y condiciones de abajo no son secretos —van en la propuesta que se entrega a los
> colegios—, pero **el análisis interno de estrategia, los números de ingreso proyectado y el
> estado de las conversaciones NO deben escribirse aquí.** Eso vive fuera del repo.

**Última revisión:** 30 de agosto de 2026.

## Precio

| | Valor |
|---|---|
| **Precio lista** | $10.000 por alumno · año escolar |
| **Precio Colegio Fundador** | **$6.000** por alumno · año escolar |
| **Licencia mínima** | **$250.000** al año (un curso) |

Valores **netos, más IVA (19%)**. Facturación electrónica, anual o semestral a convenir.

**Desde dos cursos se aplica el valor por alumno.** El mínimo existe porque a precio Fundador un
curso de 40 alumnos son $240.000, por debajo del costo de atender ese colegio durante un año
(reunión, prueba, soporte). Entre 1 y 41 alumnos, el precio efectivo es el mínimo.

| Tamaño | Fundador | Lista |
|---|---|---|
| Un 8° (hasta 41 alumnos) | $250.000 | $300.000 |
| Dos 8° (~70) | $420.000 | $700.000 |
| Los tres 8° (~105) | $630.000 | $1.050.000 |

**Argumento de valor:** una sola hora de reforzamiento particular cuesta entre $8.000 y $15.000.
VULPO entrega el año completo, en cuatro asignaturas, por menos que eso por alumno.

> **Regla de comunicación pública (decisión de Roberto, 25/08/2026):** en la **cara pública**
> —la landing `vulpo.cl` y el primer contacto— **NO se muestran valores en pesos.** Solo la
> comparación: *"cuesta menos que una hora de reforzamiento particular"*. Los números concretos
> (tabla de arriba, mínimo, Fundador) van en la **propuesta y en la reunión**, no en la web. La
> tabla de precios de este documento es referencia interna para armar esa propuesta.

## La tarifa Fundador es un intercambio, no un descuento

Está **reservada a los primeros 5 colegios que firmen antes del 31 de diciembre de 2026**, y a
cambio del 40% de rebaja el colegio entrega tres cosas concretas:

1. **Testimonio por escrito** del equipo docente.
2. **Autorización para nombrar al colegio** como parte del grupo fundador.
3. **Reunión de retroalimentación** al terminar el primer semestre de uso.

El precio Fundador **se congela mientras el colegio renueve**, sin alzas al valor de lista.

> El límite de 5 colegios y la fecha son un compromiso público: aparecen en la propuesta. No
> darle tarifa Fundador al colegio n.º 6 es parte del trato.

## La secuencia de venta

Tres etapas. **En la reunión no se cierra una venta: se cierra una prueba.**

| Etapa | Qué pasa |
|---|---|
| **1. La prueba engancha** | Enlace de muestra (`?solo=` / `?m=`) o la demo pública en `vulpo.cl/juego`. Al terminar, la pantalla de fin de demo ofrece el contacto |
| **2. La reunión** | 15 minutos con dirección/UTP. Se muestra la app y el panel con datos. Guion aparte |
| **3. El cierre** | Precio, mínimo, Fundador acotado y las tres condiciones |

**Prueba de 4 semanas, no de un semestre.** En cuatro semanas el panel ya muestra el mapa de
dominio poblado, y la decisión llega a tiempo para el presupuesto del año siguiente.

## El calendario manda

- **El año escolar chileno termina en diciembre.** Desde septiembre en adelante ya no se vende
  el año en curso: **se vende el año siguiente**.
- **Fiestas Patrias interrumpe septiembre.** Una prueba que arranque el 1 de septiembre se corta
  a los diez días. Conviene partir la última semana del mes.
- **El momento de compra de un colegio es noviembre–diciembre** (presupuesto) o enero–marzo.
  De ahí que la tarifa Fundador venza el 31 de diciembre: coincide con cuando deciden.

## Límite estructural, y por qué importa

El techo de lo que un colegio puede gastar no lo pone el precio: lo pone **cuántos niveles
cubre VULPO**. Con solo 8° básico eran **$630.000 al año** a precio Fundador con los tres 8°, y
vender a un colegio cuesta lo mismo pague lo que pague.

**Por eso la palanca nunca fue subir el precio, sino agregar niveles.** Estado al 28/08/2026:

| Nivel | Contenido | Estado |
|---|---|---|
| **8° básico** (`/juego/`) | 2.536 preguntas, 4 asignaturas + Vocabulario y Lectura | ✅ aprobado (pregunta por pregunta) y a la venta |
| **7° básico** (`/7mo/`) | 2.550 preguntas, 4 asignaturas + Vocabulario | ✅ aprobado por muestreo (30/08/2026) |
| **3° básico** (`/3ro/`) | 2.659 preguntas, 4 asignaturas + voz pregrabada + Lectura | ✅ aprobado por muestreo, salvo 2 OA de Historia |

Desde el 30/08/2026 los tres cursos están aprobados y la landing lo dice, **pero sin exagerar
cómo**: dice *"aprobadas por un profesor, objetivo por objetivo"* y **NO** *"una a una"*.
La diferencia es real y hay que sostenerla si un director pregunta: 8° se revisó **pregunta por
pregunta**; 3° y 7° se aprobaron **por muestreo** —8 preguntas de cada 30 por objetivo, y si la
muestra pasa se aprueba el objetivo completo (`docs/aprobacion-pedagogica.md`)—. El muestreo
detecta un objetivo mal escrito, no una pregunta suelta mala, y eso se dice tal cual. No es un
matiz de redacción, es la regla del proyecto: **no se promete lo que no hay**, y un director que
pregunte "¿quién revisó esto?"
merece la respuesta verdadera.

**Qué se puede vender hoy, entonces:** los tres cursos, **diciendo cómo se aprobó cada uno**.
8° se revisó pregunta por pregunta; 3° y 7° por muestreo de 8 por objetivo. Las dos cosas son
aprobación pedagógica de verdad, y la segunda hay que saber explicarla: **detecta un objetivo
mal escrito, no una pregunta suelta mala**.

Con los tres cursos aprobados (30/08/2026), el techo por colegio **se triplicó**: ya no hay
que vender un solo nivel. Lo que falta para cuadruplicarlo son 4°, 5° y 6°.

**En 7° hay además una conversación que ningún archivo resuelve:** los `CN07 OA 01/02/03` son
sexualidad, ciclo menstrual, métodos de control de la natalidad e ITS. Es currículum obligatorio
y el banco está escrito de forma factual, sin promover ninguna postura, pero **hay que avisarle
al colegio antes de publicarlo** — el colegio piloto es salesiano.

## Hacia dónde va el modelo (acordado el 27/08/2026, NO vigente)

Todo lo de arriba describe **lo que se vende hoy: una licencia anual a un colegio**. A partir de
un análisis externo del 27 de agosto de 2026 se acordó la dirección de mediano plazo. **Nada de
esta sección está implementado ni se le ofrece a nadie todavía.**

**El producto es el nivel escolar, con vigencia anual.** No "acceso a VULPO", sino
*"VULPO 7° Básico — año escolar 2027"*, vigente del 01/03/2027 al 28/02/2028. Al pasar de curso,
el alumno adquiere el nivel siguiente.

**No se vende acceso permanente.** El contenido educativo cambia, el alumno avanza, se publican
campañas nuevas y la plataforma necesita mantenimiento. Una compra única cobra una vez por algo
que hay que sostener todos los años.

**La cuenta es permanente; la suscripción es lo que cambia.** El alumno conserva su identidad,
su historial y sus logros al pasar de 7° a 8°. Eso convierte el cambio de curso en el momento de
**retención** —"terminaste 7°, tu próxima aventura es 8°"— en vez de en una baja. La renovación
puede tener precio preferente para quien ya es usuario.

**Qué incluiría una suscripción:** todas las asignaturas del nivel, campañas, preguntas, XP,
monedas, estrellas, logros, ranking, duelos, skins, progreso, **y el contenido nuevo publicado
durante la vigencia**.

**Tres líneas comerciales posibles**, en orden de dificultad:

| Línea | Alcance | Estado |
|---|---|---|
| **Colegio** | Licencias institucionales, panel docente, rankings por curso | ✅ es lo que existe hoy |
| **Individual** | 1 alumno · 1 nivel · 1 año | Producto base a futuro |
| **Familiar** | Varios hijos en distintos niveles | A evaluar después |

### Lo que bloquea este modelo, y no es comercial

1. **Hoy el progreso vive en el teléfono, no en la cuenta.** Monedas, skins, avance de campaña,
   estrellas e insignias están en `localStorage`; solo el XP y el dominio por OA están en el
   servidor. Prometerle a un apoderado que su hijo cambia de teléfono y recupera todo **sería
   falso hoy**. Es trabajo de backend y es el primer requisito.
2. **La puerta es un bloqueo blando.** El vencimiento de una suscripción heredaría el mismo
   hueco que ya tiene el código `ALU-`.
3. **Pagar en la web y pagar dentro de una app no son lo mismo.** Google Play y Apple tienen
   políticas de compra in-app con comisión, así que el sistema de pagos no se diseña antes de
   decidir cómo se distribuye en móvil.

**El detalle técnico, el modelo de datos conceptual y el orden de construcción están en
[`roadmap-tecnico.md`](roadmap-tecnico.md).** La prioridad inmediata **no es cobrar**: es
estabilizar VULPO v1 y la PWA. Primero construir bien el producto, después cobrar por algo con
valor claro.

## El argumento de evaluación formativa (el más fuerte ante UTP)

VULPO **es una herramienta de evaluación formativa en el sentido exacto del MINEDUC**, y eso se
puede respaldar con cita textual de documentos oficiales. El ministerio, en *Orientaciones de
Evaluación y Retroalimentación* (2021), nombra los cuestionarios interactivos digitales —del
tipo Kahoot y Quizizz— como apoyos válidos de la evaluación formativa; VULPO es de esa familia y
además suma el mapa de dominio por OA. Encaja en el Decreto 67 (la formativa "por lo general no
se califica"), y el MINEDUC afirma que reduce el tiempo de aprendizaje y ayuda especialmente a
quien más lo necesita.

**El fundamento completo, con las citas exactas y sus páginas, vive en el repo:**
[`docs/fundamento-evaluacion-formativa.md`](fundamento-evaluacion-formativa.md). Es la base para
la propuesta, el guion de reunión y la landing. **Léelo antes de una reunión con dirección/UTP.**

> **Honestidad al citar (para no exagerar ante un director informado):** "primer intento" NO es
> un término del MINEDUC (es diseño de VULPO); Kahoot/Quizizz se nombran solo en el documento de
> 2021, no en los de docentes/directivos ni en el Decreto 67. Detalle en el fundamento, §6.

## Qué se le promete a un colegio, y qué no

**Sí:** 4 asignaturas por curso en 3°, 7° y 8° básico —7.745 preguntas alineadas a las Bases del
MINEDUC, de las cuales **7.685 están aprobadas** (8° pregunta por pregunta; 3° y 7° por muestreo
de 8 por objetivo)—,
**evaluación formativa alineada al Decreto 67/2018** (ver sección anterior), panel del profesor
con mapa de dominio por OA, desafíos de refuerzo, ranking por curso, soporte y actualizaciones.
Funciona en cualquier celular con internet, sin instalar nada.

**No:**
- ❌ **No funciona sin internet.** Verificado: no hay service worker y los bancos de preguntas se
  piden con `fetch`. **Nunca prometer uso sin conexión.**
- ❌ **No cubre todos los niveles.** Hoy 3°, 7° y 8° básico. Faltan 4°, 5° y 6°.
- ⚠️ **No decir que las 7.685 están aprobadas "una a una".** Lo están *objetivo por objetivo*:
  8° se revisó pregunta por pregunta, pero 3° y 7° por **muestreo** de 8 de cada 30. Exagerarlo
  se cae a la primera pregunta de una UTP; decirlo bien no le quita fuerza al argumento.
- ❌ **No decir que están aprobadas las 7.745.** Quedan 60 sin aprobar, de Historia de 3°.
- ❌ **No es una herramienta de calificación.** El panel es una brújula; así está descrito en el
  producto y así hay que venderlo.
- ⚠️ **El enlace de inscripción NO es una licencia por persona.** Sirve para que un grupo entre
  solo a un curso ya abierto (una demo, un piloto, un taller), y **quien lo reciba entra hasta
  llenar el cupo**: es la credencial, y reenviarlo lo reparte. Se acota con el cupo, que hay que
  ajustar al grupo, y **no hay forma de revocarle el acceso a una persona**, solo de cerrar el
  enlace. No ofrecerlo como el mecanismo de acceso de un colegio que paga: para eso están los
  códigos `ALU-`, uno por alumno.
- ⚠️ **El "modo experimental" abre todos los capítulos y cierra los jefes.** Sirve para que
  alguien recorra el contenido sin jugarse el año en orden. **No venderlo como el modo normal**:
  el producto es la campaña con su progresión, y así se mide el dominio por objetivo.

## Material comercial

Vive **fuera del repositorio**, en `Escritorio\VULPO - correos profesores\`:

| Archivo | Qué es |
|---|---|
| `VULPO-propuesta-SanFranciscoDeSales-2026-08-25.pdf` | Propuesta vigente (versión 25/08) |
| `VULPO-guion-reunion-2026-08-25.pdf` | Guion de 15 minutos, vigente |
| `VULPO-ejecutivo.pdf` | Resumen ejecutivo (**sin actualizar**, del 23/08) |
| `seed-CUR-BA04.sql` | Curso demo: 26 alumnos, ~1.270 filas de dominio |
| `firma-*.png` | Firmas de correo por asignatura |

Las versiones anteriores (del 23/08) se conservan por si hay que comparar. **Están desfasadas:
mandan a la URL antigua y ofrecen piloto de un semestre.**

**Los PDF se generan** desde HTML con Chrome en modo headless:
`chrome.exe --headless --no-pdf-header-footer --print-to-pdf="salida.pdf" "file:///ruta.html"`.

## Antes de una reunión

1. **Verificar que el curso demo `CUR-BA04` siga sembrado.** Un panel vacío no vende nada; el
   mapa de dominio solo impresiona con datos.
2. **Llevar un código `ALU-` propio ya canjeado.** Desde el 1 de septiembre de 2026, sin código
   no se pasa del primer capítulo — ni siquiera para quien está mostrando el producto.
3. Propuesta impresa, para entregarla en el minuto 10.

## Pendiente que bloquea cobrar

**Con qué se factura.** La forma recomendada era una **SpA por Empresa en un Día** con factura
electrónica. Sin eso, el precio da lo mismo: si un colegio acepta y no hay cómo emitir la
factura, la venta se cae en el último paso.
