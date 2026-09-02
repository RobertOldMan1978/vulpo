/* ============================================================================
   VULPO · INSTALAR EN LA PANTALLA DE INICIO  (compartido por los tres cursos)

   POR QUÉ EXISTE. El enlace del curso llega al chat de WhatsApp y se hunde ahí
   en dos días. Un ícono en la pantalla del teléfono es lo que hace que el niño
   vuelva mañana. Instalar se puede desde siempre, pero la opción está escondida
   en el menú del navegador y un apoderado no la encuentra solo.

   POR QUÉ NO HAY UN BOTÓN QUE INSTALE. En iPhone no existe: Safari nunca ofrece
   instalar una web, ni con service worker. La única vía es Compartir → Agregar a
   pantalla de inicio. Así que este módulo no instala: EXPLICA cómo hacerlo, con
   el paso a paso del teléfono que se tenga.

   ⚠️ Y EN iPHONE ESO VALE SOLO EN SAFARI. Verificado en un iPhone real el
   01/09/2026: desde Chrome el ícono queda igual de bonito, pero al abrirlo
   APARECE LA BARRA DE DIRECCIONES — o sea que no es una app sino un acceso
   directo. Solo el "Agregar a pantalla de inicio" de Safari respeta el
   apple-mobile-web-app-capable que declaramos. De ahí el caso 'ios-otro', que
   primero manda a Safari. Y no es un caso de borde: el enlace llega por
   WhatsApp, cuyo navegador incrustado tampoco es Safari.

   POR QUÉ VIVE AQUÍ Y NO DENTRO DE CADA JUEGO. Cada curso es un fork del
   index.html: lo que se escribe adentro hay que volver a escribirlo en el
   siguiente. Este archivo se incluye con una línea y se engancha con otra.

   SE LLEVA SU PROPIO CSS. Si sus reglas quedaran sueltas en el <style> de cada
   curso, un nivel nuevo cargaría el módulo, funcionaría, y NO SE VERÍA — sin
   ningún error que mirar.

   LO QUE APORTA CADA CURSO (todo por init, nada por variable global):
     nombre   'VULPO 3°'    el nombre que queda bajo el ícono, para el texto
     sufijo   SUFIJO        la clave de localStorage, para no pisar otro curso
     activo   !SIN_DISCO    false en enlaces de muestra (?solo=, ?m=, ?rev=1) y
                            en el armador: son para que un profesor revise
                            contenido, no para instalar; y como esos modos no
                            escriben en disco, el "no mostrar de nuevo" tampoco
                            funcionaría.

   CÓMO SE INTEGRA EN UN CURSO NUEVO:
     1. <script src="assets/js/instalar.js"></script>  en el <head>
     2. su respaldo vacío en la línea siguiente
     3. <div id="bannerInstalar" class="banner-desafio" hidden></div> en scr-rol
     4. <a href="#" id="lnkInstalar"> junto al enlace de Créditos
     5. INST.init({...})  PEGADO a la declaración de SUFIJO
   ========================================================================== */
(function () {
  'use strict';

  var CSS = ''
    + '.inst-ov{position:fixed;inset:0;background:rgba(8,5,24,.86);z-index:9999;'
    + 'display:flex;align-items:center;justify-content:center;padding:18px;overflow:auto}'
    + '.inst-ov[hidden]{display:none}'
    + '.inst-box{background:var(--panel,#1e1747);border:2px solid var(--gold,#ffc93c);'
    + 'border-radius:18px;padding:18px;max-width:420px;width:100%;color:var(--txt,#f3f0ff)}'
    + '.inst-box h2{font-size:18px;color:var(--gold,#ffc93c);margin:0 0 4px}'
    + '.inst-box .inst-sub{color:var(--dim,#a89fd6);font-size:12px;font-weight:800;margin:0 0 12px}'
    + '.inst-box ol{margin:0 0 14px 20px;padding:0}'
    + '.inst-box li{font-size:14px;font-weight:700;margin:0 0 9px;line-height:1.45}'
    + '.inst-box .inst-nota{color:var(--dim,#a89fd6);font-size:12px;font-weight:700;margin:0 0 12px}'
    + '.inst-btn{background:var(--violet,#8f6bff);color:#fff;border:0;border-radius:10px;'
    + 'padding:11px 14px;font-weight:900;font-size:14px;width:100%;cursor:pointer}';

  /* El paso a paso, por sistema. Los textos van cortos y en segunda persona
     porque los lee un apoderado apurado, no un usuario técnico. */
  var PASOS = {
    ios: ['Toca <b>Compartir</b> ⬆️ en la barra de abajo.',
          'Desliza y toca <b>Agregar a pantalla de inicio</b>.',
          'Toca <b>Agregar</b> arriba a la derecha.'],
    'ios-otro': ['En iPhone esto solo funciona desde <b>Safari</b>.',
                 'Abre el menú de este navegador y toca <b>Abrir en Safari</b>.',
                 'Ya en Safari: <b>Compartir</b> ⬆️ y <b>Agregar a pantalla de inicio</b>.'],
    android: ['Toca <b>⋮</b> arriba a la derecha.',
              'Toca <b>Instalar app</b> o <b>Agregar a pantalla de inicio</b>.',
              'Confirma con <b>Instalar</b> o <b>Agregar</b>.'],
    escritorio: ['Busca el ícono de instalar ⊕ al final de la barra de direcciones.',
                 'Si no aparece, abre el menú del navegador y busca <b>Instalar</b>.']
  };

  var INST = { activo: false };
  window.INST = INST;

  var CFG = null;

  /* ¿Ya está instalado? Hacen falta los DOS: Android/Chrome expone el display-mode
     y iOS Safari usa navigator.standalone, que es propietario y no tiene equivalente. */
  function instalado() {
    try {
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true;
    } catch (e) {}
    return window.navigator.standalone === true;
  }

  /* iPadOS 13+ se declara como Macintosh en el userAgent: se delata por el touch. */
  /* ¿Es Safari de verdad? Se pregunta con lista blanca y no enumerando rivales,
     porque son muchos y cambian. Dos mitades, y cada una ataja un grupo:
     Chrome, Firefox y Edge de iPhone SÍ traen el token Safari/ y hay que
     descartarlos por su marca propia; los navegadores incrustados —el de
     WhatsApp, el de Instagram— NO traen ese token y caen solos. El segundo
     grupo es el caso mayoritario del piloto, porque el enlace llega al chat. */
  function safariDeVerdad(ua) {
    if (/CriOS|FxiOS|EdgiOS|OPiOS|OPT\//.test(ua)) return false;
    return /Safari\//.test(ua);
  }

  /* iPadOS 13+ se declara como Macintosh en el userAgent: se delata por el touch. */
  function plataforma() {
    var ua = navigator.userAgent || '';
    var esIOS = /iPad|iPhone|iPod/.test(ua)
             || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    if (esIOS) return safariDeVerdad(ua) ? 'ios' : 'ios-otro';
    if (/Android/.test(ua)) return 'android';
    return 'escritorio';
  }

  /* localStorage lanza en modo privado de algunos navegadores, así que las dos
     puntas van envueltas: no poder recordar el cierre no puede romper nada. */
  function clave() { return 'kimun_inst_cerrado' + (CFG.sufijo || ''); }
  function yaCerro() { try { return localStorage.getItem(clave()) === '1'; } catch (e) { return false; } }
  function marcarCerrado() { try { localStorage.setItem(clave(), '1'); } catch (e) {} }

  function inyectarCSS() {
    if (document.getElementById('inst-css')) return;
    var s = document.createElement('style');
    s.id = 'inst-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function abrir() {
    inyectarCSS();
    var ov = document.getElementById('inst-ov');
    if (!ov) {
      ov = document.createElement('div');
      ov.id = 'inst-ov';
      ov.className = 'inst-ov';
      document.body.appendChild(ov);
    }
    var p = plataforma();
    var pasos = PASOS[p].map(function (t) { return '<li>' + t + '</li>'; }).join('');
    var NOTAS = {
      escritorio: 'En el computador no todos los navegadores lo permiten. Donde de verdad sirve es en el teléfono.',
      'ios-otro': 'Desde aquí el ícono queda, pero abre el navegador encima. En Safari queda como una aplicación de verdad.'
    };
    var nota = NOTAS[p]
      || 'Después va a aparecer <b>' + CFG.nombre + '</b> entre tus aplicaciones, y se abre sin el navegador.';
    ov.innerHTML = ''
      + '<div class="inst-box">'
      + '<h2>📲 Tener VULPO a mano</h2>'
      + '<p class="inst-sub">Queda como una aplicación más del teléfono.</p>'
      + '<ol>' + pasos + '</ol>'
      + '<p class="inst-nota">' + nota + '</p>'
      + '<button class="inst-btn" id="inst-cerrar">Entendido</button>'
      + '</div>';
    ov.hidden = false;
    document.getElementById('inst-cerrar').onclick = function () { ov.hidden = true; };
    ov.onclick = function (e) { if (e.target === ov) ov.hidden = true; };
  }
  INST.abrir = abrir;

  /* ⚠️ EL BANNER VA COMPACTO, DE UNA LÍNEA, Y ESO NO ES ESTÉTICA.
     Medido en 375×667 (iPhone SE / Android económico, la pantalla más chica real):
     con el aviso de la puerta encima —que está activo en los tres cursos— una versión
     de dos líneas empujaba el botón JUGADOR de 522 px a 658 px de un viewport de 667,
     o sea que un niño abría el juego y NO VEÍA ENTERO el botón de jugar. El banner es
     para el papá; el botón es para el niño, y el niño manda. */
  function pintarBanner() {
    var cont = document.getElementById('bannerInstalar');
    if (!cont || yaCerro()) return;
    cont.style.padding = '8px 10px';
    cont.innerHTML = ''
      + '<div style="display:flex;align-items:center;gap:8px">'
      + '<span style="flex:1;min-width:0;font-size:12px;font-weight:800;color:#fff">'
      + '📲 Tenlo a mano en el teléfono</span>'
      + '<button id="instVer" style="padding:6px 10px;font-size:12px;flex:none">Ver cómo</button>'
      + '<button id="instNo" aria-label="Ahora no" style="background:transparent;flex:none;'
      + 'border:0;color:var(--dim,#a89fd6);font-size:16px;padding:4px 6px">✕</button>'
      + '</div>';
    cont.hidden = false;
    document.getElementById('instVer').onclick = abrir;
    document.getElementById('instNo').onclick = function () {
      marcarCerrado();
      cont.hidden = true;
    };
  }

  /* El banner se cierra para siempre, así que el enlace junto a Créditos es el
     camino permanente: sin él, quien lo cerró se queda sin forma de instalar. */
  function cablearEnlace() {
    var a = document.getElementById('lnkInstalar');
    if (!a) return;
    a.hidden = false;
    a.onclick = function (e) { e.preventDefault(); abrir(); };
  }

  INST.init = function (cfg) {
    CFG = cfg || {};
    if (!CFG.activo) return;   // enlaces de muestra y armador: no aparece
    if (instalado()) return;   // ya está instalado: no hay nada que ofrecer
    INST.activo = true;
    inyectarCSS();
    cablearEnlace();
    pintarBanner();
  };
})();
