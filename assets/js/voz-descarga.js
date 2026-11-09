/* assets/js/voz-descarga.js — SOLO en la app Android (Capacitor). En la web no hace NADA.

   Descarga la voz Catalina del curso desde voz.vulpo.cl (Cloudflare R2, Sesion 138) con la
   descarga NATIVA de Capacitor —sin CORS y sin cargar todo en memoria— la PRIMERA vez, la
   guarda en el telefono y fija window.VOZ_LOCAL_BASE para que voz.js la sirva local
   (offline). Desde la Sesion 147 baja primero los PAQUETES de cada asignatura (trozos de
   ~8 MB, armados con `voz-r2.py paquetes`) y despues, uno por uno, lo que el paquete no
   traiga; mantiene la pantalla encendida mientras baja y retoma donde quedo si se corta.
   Mientras baja, voz.js pide a R2 lo que falte en el telefono. La lista de clips sale de
   VOZ_MAP (los manifiestos que ya van en el bundle). */
(function(){
  // Los MP3 viven en Cloudflare R2 (Sesion 138), con la misma ruta relativa que en
  // assets/voz/: <asig>/<hash>.mp3. Las apps instaladas antes de este cambio pedian a
  // vulpo.cl/assets/voz/, que deja de servir los MP3 cuando salen del repo.
  var ORIGEN = 'https://voz.vulpo.cl/';
  var CONC = 6;                        // descargas en paralelo

  window.VOZDESC = { init: init };

  function nativo(){
    var C = window.Capacitor;
    return (C && C.isNativePlatform && C.isNativePlatform()) ? C : null;
  }

  function init(curso){
    var C = nativo();
    if(!C) return;                     // web: nada
    run(curso, C).catch(function(e){ ui('Voz: ' + msg(e)); });
  }

  async function run(curso, C){
    var FS = C.Plugins && C.Plugins.Filesystem;
    if(!FS || !FS.downloadFile) return;      // plugin viejo/ausente: se queda con TTS
    var DIR = 'DATA', base = 'voz/' + curso;

    if(await existe(FS, DIR, base + '/.ok')){ await fijar(C, FS, DIR, base); return; }

    var mapa = await esperarMapa();
    if(!mapa) return;
    var clips = Array.from(new Set(Object.values(mapa)))
                     .filter(function(p){ return /^\/?assets\/voz\//.test(p); });
    if(!clips.length) return;

    // crear las carpetas de asignatura una vez (downloadFile no crea el padre)
    var asigs = {};
    clips.forEach(function(p){ asigs[rel(p).split('/')[0]] = 1; });
    for(var a in asigs){ try{ await FS.mkdir({ directory: DIR, path: base + '/' + a, recursive: true }); }catch(e){} }

    /* La descarga SE RETOMA (Sesión 147, 08/11/2026). Un curso son ~12.000 clips y ~20 minutos:
       si en ese rato se apaga la pantalla o el niño cambia de app, muchas descargas fallan. Antes
       eso dejaba el curso sin la marca .ok y la vez siguiente BAJABA TODO DE NUEVO, y los que
       faltaban sonaban con la voz robótica. Ahora: (1) lo que ya está en el teléfono no se vuelve
       a bajar; (2) cada clip se baja a un archivo .part y recién al terminar se renombra, así que
       un corte nunca deja un clip a medias con el nombre bueno; (3) lo que falla se reintenta dos
       veces más; y (4) la marca .ok solo se escribe con CERO faltantes: si queda alguno, la
       próxima apertura con internet baja solo esos. Mientras tanto voz.js los pide a R2. */
    var n = clips.length, hechos = 0;
    var AVISO = ' · No cierres VULPO mientras baja la voz';
    ui('Preparando la voz… 0%' + AVISO);
    pantalla(C, true);

    /* PAQUETES (Sesión 147): cada asignatura viene en trozos de ~8 MB (voz-r2.py paquetes) con
       un índice que dice dónde está cada clip. Unos 40 trozos en vez de 12.700 archivos: baja
       en minutos y no en 20, y una descarga ya empezada sigue aunque la app pase un rato a
       segundo plano. Cada trozo terminado deja su marca .p-<sha>, así que un corte retoma en el
       trozo siguiente. Lo que el paquete no traiga (clips más nuevos que el último paquete
       armado) lo baja después la pasada clip por clip. Si no hay paquete, se salta. */
    var escritos = {}, necesita = {};
    clips.forEach(function(p){ necesita[rel(p)] = 1; });   // el progreso cuenta solo los clips que este juego usa
    async function porPaquete(asig){
      var dir = base + '/' + asig, ind = dir + '/.indice.json', idx;
      try{
        await FS.downloadFile({ url: ORIGEN + 'paquetes/' + asig + '/indice.json?t=' + Date.now(), path: ind, directory: DIR });
        idx = JSON.parse((await FS.readFile({ directory: DIR, path: ind, encoding: 'utf8' })).data);
      }catch(e){ return; }
      if(!idx || !Array.isArray(idx.trozos)) return;
      for(var k = 0; k < idx.trozos.length; k++){
        var tr = idx.trozos[k], marca = dir + '/.p-' + tr.f, tmp = dir + '/.trozo.part';
        if(await existe(FS, DIR, marca)){
          tr.clips.forEach(function(c){ var q = asig + '/' + c[0]; if(!escritos[q]){ escritos[q] = 1; if(necesita[q]) hechos++; } });
          continue;
        }
        try{
          await FS.downloadFile({ url: ORIGEN + 'paquetes/' + asig + '/' + tr.f, path: tmp, directory: DIR });
          // sin encoding, readFile devuelve el archivo en base64; atob lo deja en bytes (1 char = 1 byte)
          var bin = atob((await FS.readFile({ directory: DIR, path: tmp })).data);
          if(bin.length !== tr.n) throw new Error('trozo incompleto');
          for(var j = 0; j < tr.clips.length; j++){
            var c = tr.clips[j];
            await FS.writeFile({ directory: DIR, path: dir + '/' + c[0], data: btoa(bin.substr(c[1], c[2])) });
            var q2 = asig + '/' + c[0]; if(!escritos[q2]){ escritos[q2] = 1; if(necesita[q2]) hechos++; }
          }
          bin = null;
          await FS.writeFile({ directory: DIR, path: marca, data: btoa('1') });
        }catch(e){ /* este trozo queda para la pasada clip por clip, o la próxima apertura */ }
        try{ await FS.deleteFile({ directory: DIR, path: tmp }); }catch(e){}
        ui('Preparando la voz… ' + Math.min(99, Math.round(hechos / n * 100)) + '%' + AVISO);
      }
    }
    for(var a2 in asigs){ await porPaquete(a2); }
    var sueltos = clips.filter(function(p){ return !escritos[rel(p)]; });

    async function bajarUno(p){
      var dest = base + '/' + rel(p);
      try{ var st = await FS.stat({ directory: DIR, path: dest }); if(st && st.size > 0) return true; }catch(e){}
      try{
        await FS.downloadFile({ url: ORIGEN + rel(p), path: dest + '.part', directory: DIR });
        await FS.rename({ from: dest + '.part', to: dest, directory: DIR, toDirectory: DIR });
        return true;
      }catch(e){
        try{ await FS.deleteFile({ directory: DIR, path: dest + '.part' }); }catch(e2){}
        return false;
      }
    }
    async function pasada(lista, contar){
      var malos = [], i = 0;
      async function worker(){
        while(i < lista.length){
          var p = lista[i++];
          if(!(await bajarUno(p))) malos.push(p);
          if(contar){ hechos++; if(hechos % 40 === 0 || hechos === n) ui('Preparando la voz… ' + Math.round(hechos / n * 100) + '%' + AVISO); }
        }
      }
      var ws = []; for(var w = 0; w < CONC; w++) ws.push(worker());
      await Promise.all(ws);
      return malos;
    }
    var faltan = await pasada(sueltos, true);
    for(var r = 0; r < 2 && faltan.length; r++){
      ui('Terminando la voz… faltan ' + faltan.length);
      await new Promise(function(ok){ setTimeout(ok, 3000); });
      faltan = await pasada(faltan, false);
    }

    if(!faltan.length){
      try{ await FS.writeFile({ directory: DIR, path: base + '/.ok', data: btoa('1'), recursive: true }); }catch(e){}
    }
    pantalla(C, false);
    await fijar(C, FS, DIR, base);
    if(faltan.length){
      ui('Voz casi lista: faltan ' + faltan.length + '. Se completan la próxima vez que abras VULPO con internet.');
      setTimeout(function(){ ui(null); }, 6000);
    }
    else { ui('Voz lista'); setTimeout(function(){ ui(null); }, 1500); }
  }

  /* Mantener la pantalla encendida mientras baja la voz (Sesión 147): con la pantalla apagada
     Android pausa la app y la descarga se detiene. Usa el plugin KeepAwake de la app; si no
     está (una app compilada antes), prueba la Wake Lock API del navegador. Si nada sirve, la
     descarga igual se retoma la próxima vez. */
  var _wl = null, _encendida = false;
  async function pantalla(C, on){
    _encendida = on;
    try{
      var K = C.Plugins && C.Plugins.KeepAwake;
      if(K && K.keepAwake){ await (on ? K.keepAwake() : K.allowSleep()); return; }
      if(on){ if(navigator.wakeLock && !_wl){ _wl = await navigator.wakeLock.request('screen');
               _wl.addEventListener('release', function(){ _wl = null; }); } }
      else if(_wl){ await _wl.release(); _wl = null; }
    }catch(e){}
  }
  // la Wake Lock del navegador se suelta sola al salir de la app: se vuelve a pedir al volver
  document.addEventListener('visibilitychange', function(){
    var C = nativo();
    if(C && _encendida && document.visibilityState === 'visible') pantalla(C, true);
  });

  function rel(p){ return p.replace(/^\/?assets\/voz\//, ''); }   // 'mat3/<hash>.mp3'

  async function existe(FS, DIR, path){
    try{ await FS.stat({ directory: DIR, path: path }); return true; }catch(e){ return false; }
  }
  async function fijar(C, FS, DIR, base){
    var u = await FS.getUri({ directory: DIR, path: base });
    window.VOZ_LOCAL_BASE = C.convertFileSrc(u.uri).replace(/\/+$/, '') + '/';
  }
  function esperarMapa(){
    return new Promise(function(res){
      var t = 0;
      (function chk(){
        if(typeof VOZ_MAP !== 'undefined' && VOZ_MAP && Object.keys(VOZ_MAP).length) return res(VOZ_MAP);
        if((t += 200) > 20000) return res(null);
        setTimeout(chk, 200);
      })();
    });
  }
  function msg(e){ return (e && (e.message || e.errorMessage)) || String(e); }

  // Barra de estado abajo (tambien sirve para que se vea un error en el telefono).
  var _bar;
  function ui(text){
    try{
      if(text == null){ if(_bar){ _bar.remove(); _bar = null; } return; }
      if(!_bar){
        _bar = document.createElement('div');
        _bar.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:99999;' +
          'background:rgba(20,16,40,.94);color:#fff;font-family:Nunito,sans-serif;' +
          'font-weight:700;font-size:13px;text-align:center;padding:9px 12px';
        (document.body || document.documentElement).appendChild(_bar);
      }
      _bar.textContent = text;
    }catch(e){}
  }
})();
