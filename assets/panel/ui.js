/* Kit de interfaz del panel de profesores (Sesión 154).
   - toast(texto, tipo)            aviso flotante ('ok' | 'error' | 'info'); reemplaza al
                                    mensaje de una línea al pie del panel, que no se veía.
   - cargando(true|false)          barra fina arriba mientras una vista carga.
   - confirmar({titulo,texto,peligro,si,no})  -> Promise<boolean>
   - pedirTexto({titulo,texto,valor,etiqueta,si}) -> Promise<string|null>
     Reemplazan a confirm()/prompt(): esos cuadros del navegador no se pueden diseñar, en
     algunos navegadores dejan de aparecer ("evitar que la página cree diálogos") y no
     dicen de qué sistema vienen.
   - modal(html, {alCerrar})       ventana con role="dialog", foco atrapado y Esc.
   - vacio(icono, texto, accionHTML) / esqueleto(n)  -> HTML
   Depende de ICO (iconos.js) pero degrada si no está. */
(function(){
  const ico = n => (window.ICO ? window.ICO(n) : '');
  const escT = t => String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  function caja(id){
    let el = document.getElementById(id);
    if(!el){ el = document.createElement('div'); el.id = id; document.body.appendChild(el); }
    return el;
  }

  window.toast = function(texto, tipo){
    if(!texto) return;
    const cont = caja('toasts');
    cont.setAttribute('role','status'); cont.setAttribute('aria-live','polite');
    const t = document.createElement('div');
    t.className = 'toast ' + (tipo||'info');
    t.innerHTML = ico(tipo==='ok' ? 'ok' : tipo==='error' ? 'alerta' : 'info')
      + '<span>' + escT(texto) + '</span><button type="button" aria-label="Cerrar aviso">×</button>';
    const quitar = () => { if(t.parentNode) t.parentNode.removeChild(t); };
    t.querySelector('button').onclick = quitar;
    cont.appendChild(t);
    // Los errores se quedan más: hay que alcanzar a leerlos.
    setTimeout(quitar, tipo==='error' ? 9000 : 4500);
  };

  let nCarga = 0;
  window.cargando = function(on){
    nCarga = Math.max(0, nCarga + (on ? 1 : -1));
    if(on === 'fin') nCarga = 0;
    caja('cargando').classList.toggle('on', nCarga > 0);
  };

  let abiertos = 0;
  window.modal = function(html, op){
    op = op || {};
    const previo = document.activeElement;
    const fondo = document.createElement('div');
    fondo.className = 'dlg-fondo';
    fondo.innerHTML = '<div class="dlg" role="dialog" aria-modal="true">' + html + '</div>';
    document.body.appendChild(fondo);
    abiertos++;
    const dlg = fondo.firstChild;
    const enfocables = () => [...dlg.querySelectorAll(
      'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(e=>!e.disabled);
    function cerrar(valor){
      document.removeEventListener('keydown', tecla, true);
      if(fondo.parentNode) fondo.parentNode.removeChild(fondo);
      abiertos--;
      try{ previo && previo.focus && previo.focus(); }catch(e){}
      if(op.alCerrar) op.alCerrar(valor);
    }
    function tecla(e){
      if(e.key === 'Escape'){ e.preventDefault(); cerrar(op.valorEsc); }
      else if(e.key === 'Tab'){
        const f = enfocables(); if(!f.length) return;
        const pri = f[0], ult = f[f.length-1];
        if(e.shiftKey && document.activeElement === pri){ e.preventDefault(); ult.focus(); }
        else if(!e.shiftKey && document.activeElement === ult){ e.preventDefault(); pri.focus(); }
      }
    }
    document.addEventListener('keydown', tecla, true);
    fondo.addEventListener('mousedown', e => { if(e.target === fondo) cerrar(op.valorEsc); });
    setTimeout(() => { const f = enfocables(); (dlg.querySelector('[autofocus]') || f[f.length-1] || dlg).focus(); }, 0);
    return {dlg, cerrar};
  };

  window.confirmar = function(o){
    o = o || {};
    return new Promise(res => {
      const m = modal(
        '<h2>' + escT(o.titulo || '¿Continuar?') + '</h2>'
        + (o.texto ? '<p>' + escT(o.texto) + '</p>' : '')
        + '<div class="dlg-acc"><button type="button" class="b b-sec" data-v="0">' + escT(o.no || 'Cancelar') + '</button>'
        + '<button type="button" class="b ' + (o.peligro ? 'b-peligro' : 'b-pri') + '" data-v="1">'
        + escT(o.si || (o.peligro ? 'Sí, continuar' : 'Aceptar')) + '</button></div>',
        {alCerrar: v => res(!!v), valorEsc: false});
      m.dlg.querySelectorAll('[data-v]').forEach(b => b.onclick = () => m.cerrar(b.dataset.v === '1'));
    });
  };

  window.pedirTexto = function(o){
    o = o || {};
    return new Promise(res => {
      const m = modal(
        '<h2>' + escT(o.titulo || 'Escribe') + '</h2>'
        + (o.texto ? '<p>' + escT(o.texto) + '</p>' : '')
        + '<label class="campo" for="dlgTexto">' + escT(o.etiqueta || '') + '</label>'
        + '<input id="dlgTexto" autofocus value="' + escT(o.valor || '') + '"'
        + (o.tipo ? ' type="' + escT(o.tipo) + '"' : '') + '>'
        + '<div class="dlg-acc"><button type="button" class="b b-sec" data-v="0">Cancelar</button>'
        + '<button type="button" class="b b-pri" data-v="1">' + escT(o.si || 'Guardar') + '</button></div>',
        {alCerrar: v => res(v == null ? null : v), valorEsc: null});
      const inp = m.dlg.querySelector('#dlgTexto');
      setTimeout(() => { inp.focus(); inp.select(); }, 0);
      const ok = () => m.cerrar(inp.value);
      inp.addEventListener('keydown', e => { if(e.key === 'Enter'){ e.preventDefault(); ok(); } });
      m.dlg.querySelector('[data-v="0"]').onclick = () => m.cerrar(null);
      m.dlg.querySelector('[data-v="1"]').onclick = ok;
    });
  };

  window.vacio = function(icono, texto, accionHTML){
    return '<div class="vacio">' + ico(icono) + '<p>' + escT(texto) + '</p>' + (accionHTML || '') + '</div>';
  };
  window.esqueleto = function(n){
    let h = ''; for(let i = 0; i < (n||4); i++) h += '<div class="esq" style="width:' + (60 + (i*17)%40) + '%"></div>';
    return h;
  };
})();
