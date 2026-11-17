/* Rutas del panel de profesores (Sesión 154).
   Hash y no History API: GitHub Pages es estático y no puede reescribir /profesor/curso/X
   a profesor.html. Con hash, el botón atrás funciona, se puede enlazar un curso y al recargar
   se queda en la misma pantalla.
     ruta('#/curso/:cod', async p => {...})   registra (en orden: gana la primera que calza)
     ir('#/curso/CUR-1234')                   navega (crea entrada en el historial)
     ir(h, {reemplazar:true})                 navega sin dejar entrada
     renderRuta()                             vuelve a pintar la ruta actual
     iniciarRutas()                           arranca (después de iniciar sesión)
   Cada cambio de ruta dispara el evento 'ruta' en document con {patron, params, hash}. */
(function(){
  const RUTAS = [];
  let activo = false, navegaciones = 0;
  window.RUTA_ACTUAL = null;

  window.ruta = function(patron, fn){
    const keys = [];
    const re = new RegExp('^' + patron.replace(/[.*+?^${}()|[\]\\]/g, m => m === ':' ? m : '\\' + m)
      .replace(/:([a-zA-Z]+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '$');
    RUTAS.push({patron, re, keys, fn});
  };

  window.ir = function(h, op){
    if(!h.startsWith('#')) h = '#' + h;
    if(location.hash === h){ return renderRuta(); }
    if(op && op.reemplazar) location.replace(h); else location.hash = h;
  };

  window.renderRuta = async function(){
    const h = location.hash || '#/inicio';
    for(const r of RUTAS){
      const m = h.match(r.re);
      if(!m) continue;
      const params = {};
      r.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i+1]); });
      navegaciones++;
      window.RUTA_ACTUAL = {patron: r.patron, params, hash: h};
      document.dispatchEvent(new CustomEvent('ruta', {detail: window.RUTA_ACTUAL}));
      try{ await r.fn(params); }catch(e){ console.error('[ruta]', h, e); }
      return;
    }
    location.replace('#/inicio');
  };

  // ¿Hubo una pantalla anterior dentro del panel? Sirve para que "Volver" sea history.back()
  // solo cuando eso no saca a la persona del panel.
  window.hayRutaPrevia = () => navegaciones > 1;

  window.iniciarRutas = function(){
    if(!activo){ activo = true; window.addEventListener('hashchange', renderRuta); }
    if(!location.hash || location.hash === '#') location.replace('#/inicio');
    else renderRuta();
  };
})();
