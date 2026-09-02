/* ============================================================================
   VULPO · FRACCIONES APILADAS  (compartido por los tres cursos)

   POR QUÉ EXISTE. En el banco las fracciones se escriben en línea —"(9/10) ÷
   (3/5)"— y así se veían en pantalla. Un niño las aprende apiladas, numerador
   sobre denominador, y leer la forma en línea le agrega un paso que la pregunta
   no quería medir. Este módulo las dibuja como en el cuaderno.

   ⚠️ NO SE TOCA EL BANCO, Y ESA ES LA REGLA IMPORTANTE. Esto cambia CÓMO SE
   DIBUJA, no lo que está guardado. Tres motivos, y el primero cuesta plata:
     1. La voz pregrabada de 3° se indexa por el TEXTO MOSTRADO. Cambiar el texto
        del banco dejaría los clips huérfanos y habría que regenerarlos —y
        pagarlos— de nuevo. Es el gotcha de la Sesion 60.
     2. contenido/ es la capa de datos y esto es presentación: un cambio de una
        capa no toca las otras.
     3. Las marcas de aprobación son por id, pero el texto que un profesor
        aprobó sigue siendo exactamente el mismo, que es lo honesto.

   ⚠️ SOLO SE APLICA AL ENUNCIADO, LAS OPCIONES Y EL TIP. Hay dos numeros que
   comparten la forma y NO son fracciones: el "PREGUNTA 1/10" del encabezado del
   quiz y el contador "1/10" del Reto de Cálculo. Los dos viven en elementos
   aparte (#qTag, #calcNum) y no pasan por aquí. Aplicar esto a lo ancho de la
   pantalla dejaría el contador apilado.

   ⚠️ ESCAPA PRIMERO Y MARCA DESPUÉS. Las opciones se escapan desde el XSS
   almacenado de la Sesion 51 (un nombre de rival con <img onerror>). Marcar
   primero y escapar después reabriria ese agujero.

   SE LLEVA SU PROPIO CSS. Si sus reglas quedaran sueltas en el <style> de cada
   curso, un curso nuevo cargaría el módulo, generaría el marcado correcto y
   NO SE VERÍA —el "9" y el "10" pegados, sin barra— sin ningún error que mirar.

   PARA UN CURSO NUEVO: incluir este archivo con su respaldo vacio, y pintar
   enunciado, opciones y tip con FRAC.html(). Nada más.
   ============================================================================ */
(function () {
  'use strict';

  var CSS =
      '.frac{display:inline-flex;flex-direction:column;align-items:center;'
    + 'vertical-align:middle;margin:0 .14em;line-height:1.06;font-size:.86em;'
    + 'position:relative;top:-.06em}'
    + '.frac .fr-n{border-bottom:2px solid currentColor;padding:0 .2em}'
    + '.frac .fr-d{padding:0 .2em}'
    /* El signo se pega a su fraccion: suelto, "- 3/4" se lee como una resta. */
    + '.frac-sig{white-space:nowrap}'
    + '.frac-sig>.frac{margin-left:.04em}';

  function inyectarCSS() {
    if (document.getElementById('frac-css')) return;
    var s = document.createElement('style');
    s.id = 'frac-css';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  function esc(t) {
    return String(t == null ? '' : t)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* El signo menos va FUERA de la fracción y centrado, no pegado al numerador:
     en 8° el objetivo es justo "fracciones y decimales, aunque sean negativos",
     y -3/4 con el signo arriba se lee como otra cosa. */
  function apilar(signo, num, den) {
    var f = '<span class="frac"><span class="fr-n">' + num + '</span>'
          + '<span class="fr-d">' + den + '</span></span>';
    return signo ? '<span class="frac-sig">' + signo + f + '</span>' : f;
  }

  /* Solo digitos, y con guardas a los dos lados:
     - (?<![\d/])  no entra en el medio de una fecha 12/05/2020 ni de 1/2/3
     - (?![\d/])   tampoco por la derecha
     Se corre sobre el texto YA ESCAPADO, donde no queda ningun < ni &
     sin escapar, asi que el marcado que se inserta es el unico HTML. */
  var RE = /(-?)(\d+)\s*\/\s*(\d+)/g;

  /* Los parentesis que envuelven UNA sola fraccion sobran una vez apilada:
     "(9/10) ÷ (3/5)" se lee mejor sin ellos, y con ellos queda ruidoso.
     ⚠️ Solo se quitan si el parentesis contiene EXACTAMENTE una fraccion y nada
     mas, y si lo que viene antes no es un digito ni una letra: "2(3/4)" es una
     multiplicacion, y sin parentesis se leeria como el numero mixto 2 3/4, que
     es otro valor. Un parentesis con mas cosas dentro -"(3/4 + 1/2)"- no calza
     con este patron y se queda entero, que es lo correcto. */
  var RE_PAREN = /(^|[^0-9A-Za-zÀ-ÿ])\(\s*(-?\d+\s*\/\s*\d+)\s*\)/g;

  function html(texto) {
    inyectarCSS();
    var t = esc(texto).replace(RE_PAREN, '$1$2');
    return t.replace(RE, function (todo, signo, num, den, pos, cadena) {
      /* Guardas de contexto, mirando el caracter pegado a cada lado del match
         completo: si es un digito o una barra, no es una fraccion suelta sino
         una fecha (12/05/2020) o una lista (1/2/3). Ante la duda NO se apila:
         un falso negativo se ve como hoy, un falso positivo deforma el dato. */
      var cAntes   = pos > 0 ? cadena.charAt(pos - 1) : '';
      var cDespues = cadena.charAt(pos + todo.length);
      if (/[\d/]/.test(cAntes) || /[\d/]/.test(cDespues)) return todo;
      return apilar(signo, num, den);
    });
  }

  window.FRAC = { html: html, init: inyectarCSS };
})();
