# Modelo comercial de VULPO

> ⚠️ **Este repositorio es PÚBLICO.** Lo que se escriba aquí lo puede leer cualquiera. Los
> precios y condiciones de abajo no son secretos —van en la propuesta que se entrega a los
> colegios—, pero **el análisis interno de estrategia, los números de ingreso proyectado y el
> estado de las conversaciones NO deben escribirse aquí.** Eso vive fuera del repo.

**Última revisión:** 25 de agosto de 2026.

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

VULPO cubre **solo 8° básico**. Eso pone un techo a lo que un colegio puede gastar, por mucho
que le guste: **$630.000 al año** a precio Fundador con los tres 8°. Vender a un colegio cuesta
lo mismo pague lo que pague.

**La palanca que más movería el negocio no es subir el precio: es agregar 7° básico**, que
duplicaría el techo por colegio sin duplicar el esfuerzo de venta. Es un trabajo de contenido
grande (otro banco de ~2.500 preguntas) y está fuera de alcance por ahora, pero es la dirección.

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

**Sí:** 4 asignaturas de 8° básico, 2.536 preguntas revisadas alineadas a las Bases del MINEDUC,
**evaluación formativa alineada al Decreto 67/2018** (ver sección anterior), panel del profesor
con mapa de dominio por OA, desafíos de refuerzo, ranking por curso, soporte y actualizaciones.
Funciona en cualquier celular con internet, sin instalar nada.

**No:**
- ❌ **No funciona sin internet.** Verificado: no hay service worker y los bancos de preguntas se
  piden con `fetch`. **Nunca prometer uso sin conexión.**
- ❌ **No cubre otros niveles.** Hoy solo 8° básico.
- ❌ **No es una herramienta de calificación.** El panel es una brújula; así está descrito en el
  producto y así hay que venderlo.

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
