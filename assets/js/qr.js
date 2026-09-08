/* QR de los enlaces de VULPO — muestra (armador, ?armar=1) e inscripción (panel).
   Lo cargan los 6 forks del juego y profesor.html; ambos traen su respaldo vacío, así que un 404
   de este archivo no mata la pantalla (solo se queda sin QR).

   Dibuja el QR como SVG —escala sin pixelarse en "Mostrar grande"— a partir de la matriz que
   calcula qrcode-generator (assets/vendor/qrcode-generator-1.4.4.min.js, global `qrcode`), con el
   logo de Vulpi centrado sobre un cuadrado blanco redondeado.

   ⚠️ Corrección de errores ALTA ('H'): es lo que permite tapar el centro con el logo sin que el QR
   deje de leerse. El logo NO pasa de ~22% del lado; más que eso y deja de escanear. La prueba real
   es ESCANEARLO con el logo puesto, no mirar que se dibujó. */
window.QR = (function(){
  const LOGO = '/assets/web/vulpo-logo-320.png';

  function svg(url, px){
    const q = qrcode(0, 'H');            // 0 = versión automática según el largo del dato
    q.addData(url); q.make();
    const n = q.getModuleCount();
    const quiet = 4;                     // zona de silencio obligatoria del QR
    const total = n + quiet*2;
    const cell = px / total;
    let rects = '';
    for(let r=0;r<n;r++) for(let c=0;c<n;c++) if(q.isDark(r,c))
      rects += '<rect x="'+((c+quiet)*cell)+'" y="'+((r+quiet)*cell)+'" width="'+cell+'" height="'+cell+'"/>';
    const lw = px*0.22, lp = px*0.03, box = lw+lp*2, off=(px-box)/2, offL=(px-lw)/2;
    return '<svg xmlns="http://www.w3.org/2000/svg" width="'+px+'" height="'+px+'" viewBox="0 0 '+px+' '+px+'">'
      + '<rect width="'+px+'" height="'+px+'" fill="#fff"/>'
      + '<g fill="#0b0b1a">'+rects+'</g>'
      + '<rect x="'+off+'" y="'+off+'" width="'+box+'" height="'+box+'" rx="'+(box*0.18)+'" fill="#fff"/>'
      + '<image href="'+LOGO+'" x="'+offL+'" y="'+offL+'" width="'+lw+'" height="'+lw+'"/>'
      + '</svg>';
  }

  function pintar(elem, url){
    if(!elem) return;
    if(!url){ elem.innerHTML=''; return; }
    try{ elem.innerHTML = svg(url, 220); }catch(e){ elem.innerHTML=''; }
  }

  function grande(url){
    if(!url) return;
    let o = document.getElementById('qrOverlay');
    if(!o){
      o = document.createElement('div'); o.id='qrOverlay';
      o.style.cssText='position:fixed;inset:0;z-index:9999;background:#0b0b1aee;display:flex;'
        +'flex-direction:column;align-items:center;justify-content:center;gap:18px;cursor:pointer';
      document.body.appendChild(o);
      o.addEventListener('click', function(){ o.hidden=true; });
    }
    const lado = Math.min(window.innerWidth, window.innerHeight) - 80;
    const px = lado>520?520:(lado>160?lado:160);
    try{
      o.innerHTML = '<div style="background:#fff;padding:16px;border-radius:18px">'+svg(url, px)+'</div>'
        + '<p style="color:#fff;font-family:system-ui,sans-serif;font-weight:700;text-align:center;padding:0 20px">'
        + 'Escanéalo con la cámara del teléfono · toca para cerrar</p>';
      o.hidden=false;
    }catch(e){ o.hidden=true; }
  }

  return { pintar: pintar, grande: grande };
})();
