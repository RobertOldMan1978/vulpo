/* assets/js/voz-descarga.js — SOLO en la app Android (Capacitor). En la web no hace NADA.

   Descarga la voz Catalina del curso (los clips, uno a uno, desde voz.vulpo.cl —Cloudflare
   R2 desde la Sesion 138— con la
   descarga NATIVA de Capacitor: sin CORS, sin descomprimir, sin cargar todo en memoria)
   la PRIMERA vez, la guarda en el telefono y fija window.VOZ_LOCAL_BASE para que voz.js
   la sirva local (offline). Mientras baja, el juego usa el TTS del navegador (no queda
   mudo). Si algo falla, se queda con el TTS. La lista de clips sale de VOZ_MAP (los
   manifiestos que ya van en el bundle). */
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
    ui('Preparando la voz… 0%');
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
          if(contar){ hechos++; if(hechos % 40 === 0 || hechos === n) ui('Preparando la voz… ' + Math.round(hechos / n * 100) + '%'); }
        }
      }
      var ws = []; for(var w = 0; w < CONC; w++) ws.push(worker());
      await Promise.all(ws);
      return malos;
    }
    var faltan = await pasada(clips, true);
    for(var r = 0; r < 2 && faltan.length; r++){
      ui('Terminando la voz… faltan ' + faltan.length);
      await new Promise(function(ok){ setTimeout(ok, 3000); });
      faltan = await pasada(faltan, false);
    }

    if(!faltan.length){
      try{ await FS.writeFile({ directory: DIR, path: base + '/.ok', data: btoa('1'), recursive: true }); }catch(e){}
    }
    await fijar(C, FS, DIR, base);
    if(faltan.length){
      ui('Voz casi lista: faltan ' + faltan.length + '. Se completan la próxima vez que abras VULPO con internet.');
      setTimeout(function(){ ui(null); }, 6000);
    }
    else { ui('Voz lista'); setTimeout(function(){ ui(null); }, 1500); }
  }

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
