/* assets/js/voz-descarga.js — SOLO en la app Android (Capacitor). En la web no hace NADA.

   Descarga la voz Catalina del curso (los clips, uno a uno, desde vulpo.cl con la
   descarga NATIVA de Capacitor: sin CORS, sin descomprimir, sin cargar todo en memoria)
   la PRIMERA vez, la guarda en el telefono y fija window.VOZ_LOCAL_BASE para que voz.js
   la sirva local (offline). Mientras baja, el juego usa el TTS del navegador (no queda
   mudo). Si algo falla, se queda con el TTS. La lista de clips sale de VOZ_MAP (los
   manifiestos que ya van en el bundle). */
(function(){
  var ORIGEN = 'https://vulpo.cl/';   // los clips ya estan hospedados aca
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

    var n = clips.length, hechos = 0, fallos = 0, i = 0;
    ui('Preparando la voz… 0%');
    async function worker(){
      while(i < clips.length){
        var p = clips[i++];
        try{
          await FS.downloadFile({ url: ORIGEN + p.replace(/^\//, ''), path: base + '/' + rel(p), directory: DIR });
        }catch(e){ fallos++; }
        hechos++;
        if(hechos % 40 === 0 || hechos === n) ui('Preparando la voz… ' + Math.round(hechos / n * 100) + '%');
      }
    }
    var ws = []; for(var w = 0; w < CONC; w++) ws.push(worker());
    await Promise.all(ws);

    if(fallos <= n * 0.05){   // toleramos <5% de fallos: el TTS cubre esos clips
      try{ await FS.writeFile({ directory: DIR, path: base + '/.ok', data: btoa('1'), recursive: true }); }catch(e){}
    }
    await fijar(C, FS, DIR, base);
    if(fallos){ ui('Voz lista (' + fallos + ' no bajaron)'); }
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
