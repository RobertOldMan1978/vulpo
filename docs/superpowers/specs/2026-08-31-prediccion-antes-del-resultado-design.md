# La predicción antes del resultado (el semáforo se adelanta y se vuelve obligatorio)

**Fecha:** 2026-08-31
**Estado:** aprobado por Roberto
**Alcance:** `juego/index.html`, `7mo/index.html`, `3ro/index.html`. Sin backend, sin contenido.

---

## El problema

El semáforo 🟢🟡🔴 de autoevaluación (Sesión 52, Grupo C) tiene dos defectos que se descubrieron
juntos, y el segundo explica al primero:

1. **Se salta.** Roberto lo saltó varias veces probando. Está en la pantalla de resultado, entre
   las recompensas y el botón grande, y el ojo va del premio al botón.
2. **Llega tarde.** Se pregunta **después** de que la pantalla ya dijo "¡Nivel superado!", mostró
   las estrellas y pagó las monedas. Aunque el niño lo marque con honestidad, en gran parte solo
   repite lo que ya vio.

El dato que guarda (`S.semaforo`) **no lo lee nadie**: verificado, tiene tres apariciones en cada
app —se escribe, se guarda, se carga— y cero lecturas. Pero el problema de fondo no es que nadie
lo lea: es que un juicio emitido después del veredicto mide poco, así que aunque lo leyéramos
valdría poco.

## La decisión

**Preguntarlo antes del resultado, en pantalla propia.** Con eso:

- **Se vuelve obligatorio sin ser peaje.** Es el único control de la pantalla, así que no hay
  botón que apagar ni aviso que explicar. La alternativa —dejarlo donde está y apagar los botones
  hasta marcar— produce toques reflejos: el niño toca el primero que pilla para seguir, y ahí se
  pierden las dos cosas a la vez, el dato *y* el acto pedagógico.
- **Pasa de juicio a predicción**, que es metacognición de verdad.
- **Habilita el cruce** entre lo que el niño creyó y lo que pasó, que hoy botamos.

### Lo que esto NO es (dicho para no exagerarlo después)

**No es una predicción a ciegas.** Durante el quiz el niño ve sus aciertos y su combo, así que
llega con una idea bastante formada. Lo que se gana es que **no vea el veredicto** —el titular,
las estrellas, el XP, las monedas— antes de declarar. Es mejor que hoy, donde el semáforo es un
eco de la pantalla; no es una medida limpia de calibración, y el material comercial no debe
presentarlo como tal.

---

## Diseño

### Flujo

```
avanzar()
   └── terminarNivel()                       ← compuerta (mismo nombre: nadie más la llama)
         ├── EFIMERO → mostrarResultado()    ← QA, enlaces de muestra y revisión: sin pantalla
         └── preguntarPrediccion() → [un toque] → mostrarResultado()
```

Es **el mismo patrón que ya existe** para la tarjeta de meta: `startQuiz` es la compuerta,
`mostrarMetaEtapa` la pantalla y `arrancarQuiz` el trabajo real. Se calca.

`terminarNivel` conserva su nombre porque su único llamador es `avanzar()`; el cuerpo actual pasa
íntegro a `mostrarResultado()`.

### La pantalla `scr-pred`

Reusa la tarjeta de `scr-meta` (`.meta-card`, `.meta-ic`, `.meta-kick`, `.meta-frase`), que ya
existe idéntica en los tres cursos:

> 🤔
> **ANTES DE VER TU PUNTAJE**
> ¿Cómo crees que te fue?
>
> 🟢 Lo entendí · 🟡 Más o menos · 🔴 Me costó

**Los emojis llevan etiqueta de texto.** Hoy son 🟢🟡🔴 pelados. En pantalla propia caben las
palabras, y eso hace tres cosas: el dato es más honesto, se puede leer en voz, y deja de depender
de que el niño interprete un color.

Los botones reusan la clase `.sem` que ya tiene estilo (opacidad, hover, seleccionado en dorado).

### El cruce, en la pantalla de resultado

La fila "¿Cómo te fue?" **se va** de `scr-res` y en su lugar queda una sola línea que responde.
Se compara la predicción contra el resultado real, clasificado con el mismo criterio con que el
juego ya reparte estrellas:

| real | cuándo |
|---|---|
| 🟢 | aprobó con `ratio >= 0.9` |
| 🟡 | aprobó bajo eso |
| 🔴 | reprobó |

| caso | mensaje |
|---|---|
| **acertó** | *"Te conoces bien: sabías cómo te iba a ir 👌"* |
| **se sobreestimó** | *"Creías que lo tenías y te fue N de M. Démosle otra vuelta."* (+ *"👉 Toca «Repasar»"* si hay repaso) |
| **se subestimó** | *"¡Te costó menos de lo que pensabas! N de M 💪"* |

Sin predicción (modo efímero, o una partida vieja) no se muestra nada: la línea queda vacía y la
pantalla se ve como antes.

### Excepciones

`EFIMERO` (`QA || PRUEBA`) salta la pantalla. **No hace falta una bandera nueva:** `REVISION`
implica `PRUEBA`, así que `?qa=1`, `?solo=`, `?m=` y `?rev=1` quedan cubiertos por la que ya
existe, y es la misma que gobierna la tarjeta de meta. Un profesor revisando contenido no queda
trancado.

### Voz (solo 3°)

La pantalla lleva su botón 🔊, cableado con el patrón existente —la lista
`[['btnEscucharMeta','metaTxt'], …]`, que lee el texto **en el momento del clic**—.

Lee un texto **fijo y escrito para el oído**, guardado en un elemento oculto, no el DOM de los
botones:

> *"¿Cómo crees que te fue? Verde: lo entendí. Amarillo: más o menos. Rojo: me costó."*

Sin emojis ni números, así que no depende del normalizador ni de que exista su clip: si no está en
el manifiesto cae a la voz del navegador, que para esa frase basta. Es **un solo clip** si algún
día se quiere generar.

---

## Alcance y lo que NO se toca

`montarSemaforo` se llama **en un solo lugar**, dentro de `terminarNivel`. Por lo tanto esto no
toca el repaso, la mini-clase, la práctica de lección, el desafío de refuerzo, el Jefe Final ni el
Reto de Cálculo. Sigue apareciendo en etapas normales, jefes de capítulo y libros, como hoy.

**Estado:** se conserva `S.semaforo['<expedición>:<etapa>']` con la misma forma. No hay migración.
Los valores guardados antes cambian de significado (eran juicio posterior, ahora son predicción);
como nadie los lee, no tiene consecuencias, pero queda dicho.

**Los tres cursos reciben la misma edición.** `terminarNivel` y `montarSemaforo` están hoy byte a
byte idénticas en los tres, y el objetivo es que sigan estándolo. Lo único propio de 3° es la voz.

---

## Verificación

Corriendo la página con `scripts/cdp.mjs`, no leyendo el código:

- ☐ En los tres cursos: se juega una etapa real, aparece `scr-pred`, un toque lleva al resultado.
- ☐ La línea del cruce dice lo correcto en los tres casos (acertó / se sobreestimó / se subestimó).
- ☐ `S.semaforo` queda escrito con la clave de esa etapa.
- ☐ Con `?qa=1` y con `?solo=`: **no** aparece la pantalla; el resultado sale directo y sin la
  línea del cruce.
- ☐ En 3°: el botón 🔊 existe y lee la frase.
- ☐ El guardado de 8° sigue aislado tras jugar 7° y 3°.
- ☐ **Cero errores de consola y cero 404** en los tres.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Una pantalla más por etapa cansa | Un solo toque, sin botón de confirmar; y es la misma tarjeta que el niño ya conoce de la meta |
| El niño toca cualquiera para seguir | Es el riesgo que no desaparece. Las etiquetas de texto ayudan; y el cruce, al responderle, le da motivo para contestar en serio la próxima |
| Romper el arranque al declarar algo tarde | Nada de esto es una constante nueva leída en el arranque. La bandera usada (`EFIMERO`) ya existe y ya se lee ahí |
| Que los tres forks diverjan | La edición es la misma en los tres; se compara byte a byte al cerrar |
