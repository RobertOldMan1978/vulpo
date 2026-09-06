/* ================= LECTURA POR VOZ =================
   Compartido por todos los cursos (assets/js/voz.js). Pensada para quien todavía no lee
   de corrido, así que importa tanto QUÉ se lee como CUÁNDO: la pregunta primero, después
   cada opción, y la opción que suena se ilumina en pantalla. Si la voz leyera un orden
   distinto al de la pantalla, le estaría dictando al niño la respuesta equivocada.

   ⚠️ EL MÓDULO NACE DORMIDO. Solo habla después de `VOZ.init([carpetas])`, y esa llamada
   va en el curso, pegada a su `VOZ_DIRS`. Así 7° y 8° —donde el alumno ya lee de corrido
   y no hay clips— lo cargan y quedan mudos sin necesidad de una bandera más.

   ⚠️ La llamada a init va PEGADA a la declaración de sus datos, nunca "más arriba con las
   otras constantes": un `const` leído antes de su declaración lanza ReferenceError y mata
   TODO el JavaScript del juego, con un síntoma que engaña (la pantalla se ve bien y ningún
   botón responde). Esa trampa mordió cuatro veces en una semana.

   La voz pregrabada se genera con scripts/generar-voz-nivel.py. Regla del proyecto: voz
   solo de 1° a 4° básico. */

var VOZ = {
 activo: false,
 /* Carga y FUSIONA los manifiestos de las carpetas del curso.
    Una carpeta por asignatura: los clips se generan por banco, y así agregar una
    asignatura nueva no obliga a regenerar (ni volver a pagar) las anteriores. El mapa
    guarda la RUTA COMPLETA, no solo el nombre, porque no hay una base única. */
 init: function(dirs){
  if(!dirs || !dirs.length) return;
  VOZ.activo = true;
  Promise.all(dirs.map(function(dir){
    return fetch(dir+'manifiesto.json')
     .then(function(r){ return r.ok?r.json():null; })
     .then(function(m){ return [dir, m||{}]; })
     .catch(function(){ return [dir,{}]; });
  })).then(function(pares){
    var mapa={};
    // Un texto compartido (por ejemplo "¡Nivel superado!") existe en varias carpetas;
    // cualquiera de los clips sirve, así que gana el último y da lo mismo.
    pares.forEach(function(p){
      Object.keys(p[1]).forEach(function(t){ mapa[t]=p[0]+p[1][t]; });
    });
    VOZ_MAP=mapa;
  }).catch(function(){ VOZ_MAP={}; });
 }
};

// Las voces del navegador cargan de forma asíncrona: la primera llamada a
// getVoices() suele devolver [] y por eso antes caía siempre a la voz por defecto.
let _VOZ=null, _VOZ_LISTA=false;
function elegirVoz(){
 if(_VOZ_LISTA) return _VOZ;
 const vs=(window.speechSynthesis&&speechSynthesis.getVoices())||[];
 if(!vs.length) return null;               // todavía no cargan; se reintenta luego
 const es=vs.filter(v=>/^es/i.test(v.lang||''));
 // Preferencia: español de Chile > latinoamericano > cualquier español.
 const orden=[/es[-_]CL/i, /es[-_](MX|US|419|AR|CO|PE)/i, /^es/i];
 for(const re of orden){ const v=es.find(x=>re.test(x.lang||'')); if(v){_VOZ=v;break;} }
 _VOZ_LISTA=true;
 return _VOZ;
}
if(window.speechSynthesis){
 try{ speechSynthesis.onvoiceschanged=()=>{_VOZ_LISTA=false; elegirVoz();}; elegirVoz(); }catch(e){}
}

/* Audios pregrabados con la voz chilena de Catalina (ver scripts/generar-voz-nivel.py).
   El manifiesto dice qué textos tienen clip; lo que no esté, lo lee el navegador.
   Así la lectura suena igual en todos los aparatos, pero nunca se queda muda si los
   MP3 no cargan (colegio con internet malo, por ejemplo). */
let VOZ_MAP=null;
let _AUDIO=null;
/* Reproduce el clip pregrabado de `texto`. Devuelve false si no existe, para que el
   llamador caiga a la voz del navegador. `alTerminar` se llama también al fallar: sin
   eso, un clip roto dejaría la cadena de lectura colgada a mitad. */
function sonarClip(texto,alEmpezar,alTerminar){
 const arch=VOZ_MAP&&VOZ_MAP[(texto||'').trim()];
 if(!arch) return false;
 try{
  const a=new Audio(arch);   // `arch` ya viene con su carpeta
  _AUDIO=a;
  a.onplay=()=>{ if(alEmpezar) alEmpezar(); };
  a.onended=()=>{ if(alTerminar) alTerminar(); };
  a.onerror=()=>{ if(alTerminar) alTerminar(); };
  a.play().catch(()=>{ if(alTerminar) alTerminar(); });
  return true;
 }catch(e){ return false; }
}

let _COLA_ID=0;   // declarado ANTES de usarse: con `let` al reves queda en zona muerta
function callarVoz(){
 // Invalidar la cola es lo PRIMERO y no es opcional: speechSynthesis.cancel() dispara
 // el evento `end` de la frase en curso en varios navegadores, y ese evento es
 // justamente el que encadena el clip siguiente. Sin esta linea, mandar callar podria
 // ADELANTAR la lectura en vez de detenerla.
 _COLA_ID++;
 try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){}
 try{ if(_AUDIO){ _AUDIO.pause(); _AUDIO=null; } }catch(e){}
 try{ document.querySelectorAll('.opt.leyendo').forEach(o=>o.classList.remove('leyendo')); }catch(e){}
}

// Encola un texto. `alEmpezar`/`alTerminar` permiten sincronizar el resaltado.
function decir(texto,alEmpezar,alTerminar){
 if(!VOZ.activo || !('speechSynthesis' in window) || !texto) { if(alTerminar) alTerminar(); return; }
 const u=new SpeechSynthesisUtterance(texto);
 const v=elegirVoz();
 u.lang=(v&&v.lang)||'es-MX';
 if(v) u.voice=v;
 u.rate=0.9;                                // más pausado: son niños de 8 años
 if(alEmpezar) u.onstart=alEmpezar;
 if(alTerminar){ u.onend=alTerminar; u.onerror=alTerminar; }
 speechSynthesis.speak(u);
}

// Compatibilidad: leer un texto suelto (lo usa cualquier pantalla sin opciones).
// Usa el clip pregrabado si existe; si no, la voz del navegador.
function leerEnVoz(texto){ callarVoz(); if(!sonarClip(texto)) decir(texto); }


/* Lee la pregunta y luego las opciones EN EL ORDEN EN QUE SE VEN, iluminando cada
   una mientras suena. `opciones` debe venir ya barajada, igual que la pantalla.

   Es una COLA encadenada, no una serie de llamadas seguidas: el audio pregrabado es
   asíncrono de verdad, y sin encadenar sonarían los cinco clips encima. Con
   speechSynthesis bastaba encolar porque el navegador serializa solo.

   NO se dice la letra ("A.", "B.") por dos razones: el clip pregrabado es del texto
   solo —así el "6" sirve en cualquier posición y no hay que generar cuatro versiones
   de cada opción—, y el resaltado ya muestra de cuál se trata. Si se dijera la letra
   solo en el respaldo, el niño oiría cosas distintas según si el MP3 cargó o no. */
function leerPreguntaEnVoz(pregunta,opciones,contenedor){
 callarVoz();
 const cola=[{txt:pregunta,nodo:null}];
 (opciones||[]).forEach((txt,k)=>cola.push({
   txt:String(txt),
   nodo:contenedor?contenedor.children[k]:null
 }));
 let i=0;
 _COLA_ID++; const miId=_COLA_ID;             // una cola nueva invalida la anterior
 (function siguiente(){
  if(miId!==_COLA_ID || i>=cola.length) return;
  const it=cola[i++];
  const enciende=()=>{ if(it.nodo) it.nodo.classList.add('leyendo'); };
  const apaga=()=>{ if(it.nodo) it.nodo.classList.remove('leyendo'); siguiente(); };
  if(!sonarClip(it.txt, enciende, apaga)) decir(it.txt, enciende, apaga);
 })();
}

/* Lee los segmentos de un bloque de mini-clase (por ejemplo: la intro y cada paso de un
   "ejemplo") resaltando en pantalla el que va sonando, como una lectura de karaoke.

   ⚠️ NO hay un clip por segmento: `generar-voz-nivel.py` los junta con ". " y genera UN
   SOLO audio para el bloque completo (así lo indexa el manifiesto, por el texto unido).
   Así que el resaltado se reparte por PROPORCIÓN DE CARACTERES sobre la duración real del
   audio -aproximado a propósito, gratis y sin regenerar ni un clip-, no por un evento real
   de cada frase. Si el clip no existe (curso sin voz, o un texto recién agregado que aún no
   se generó), cae a la voz del navegador, que SÍ da un límite de palabra real
   (`onboundary`) y ahí el resaltado es exacto. */
function leerSegmentosEnVoz(segmentos, elementos){
 callarVoz();
 elementos=elementos||[];
 const segs=(segmentos||[]).map(s=>s||'');
 if(!segs.some(Boolean)) return;
 const juntos=segs.filter(Boolean).join('. ');   // el MISMO texto que indexa el manifiesto
 // Desplazamiento de cada segmento DENTRO del texto unido (mismo ". " que usa el generador).
 // Los segmentos vacíos (sin elemento que iluminar) no suman: no viajan en el audio.
 let acc=0; const desde=segs.map(s=>{ if(!s) return -1; const d=acc; acc+=s.length+2; return d; });
 const total=Math.max(1,juntos.length);
 const apagarTodo=()=>elementos.forEach(el=>el&&el.classList.remove('leyendo'));
 const activar=(pos)=>{ let idx=-1;
  for(let i=desde.length-1;i>=0;i--){ if(desde[i]>=0 && pos>=desde[i]){ idx=i; break; } }
  apagarTodo(); if(idx>=0 && elementos[idx]) elementos[idx].classList.add('leyendo'); };
 apagarTodo();   // por si quedó un resaltado de un 🔊 anterior sobre este MISMO bloque
 _COLA_ID++; const miId=_COLA_ID;
 const clipOk=sonarClip(juntos, function(){
   const a=_AUDIO;
   (function tick(){
     if(miId!==_COLA_ID || !a || a.paused || a.ended) return;
     activar(Math.min(total-1, Math.floor((a.currentTime/(a.duration||1))*total)));
     requestAnimationFrame(tick);
   })();
 }, apagarTodo);
 if(clipOk) return;
 if(!('speechSynthesis' in window)){ apagarTodo(); return; }
 const u=new SpeechSynthesisUtterance(juntos);
 const v=elegirVoz(); u.lang=(v&&v.lang)||'es-MX'; if(v) u.voice=v; u.rate=0.9;
 u.onboundary=(e)=>{ if(miId===_COLA_ID) activar(e.charIndex||0); };
 u.onend=u.onerror=()=>{ if(miId===_COLA_ID) apagarTodo(); };
 speechSynthesis.speak(u);
}

/* Los 🔊 de la meta y del resultado se cablean UNA vez y leen el texto en el momento
   del clic, no al cablear: el titular del resultado lo pintan tres caminos distintos
   (etapa aprobada, reprobada y refuerzo), y así ninguno tiene que acordarse de la voz. */
document.addEventListener('DOMContentLoaded',()=>{
 [['btnEscucharMeta','metaTxt'],['btnEscucharRes','resTitle'],['btnEscucharPred','predVoz']].forEach(([b,t])=>{
  const bt=document.getElementById(b);
  if(bt) bt.onclick=()=>leerEnVoz(document.getElementById(t).textContent);
 });
});

/* El CSS viaja con el módulo, igual que en assets/js/visuales.js y revision.js. Son las
   dos reglas de la voz: el botón 🔊 y la opción que suena. Si vivieran sueltas en el
   <style> de cada curso, un nivel nuevo leería en voz alta con un botón sin estilo y sin
   que se notara cuál opción va sonando — y eso no da ningún error.
   `--gold` y `Nunito` salen de la paleta del juego, que los tres definen. */
(function(){
 if(document.getElementById('css-voz')) return;
 var s=document.createElement('style');
 s.id='css-voz';
 s.textContent=
  /* ⚠️ [hidden] va PRIMERO y no es opcional: `display:block` en el selector de clase le gana
     al atributo hidden, asi que un boton oculto se sigue VIENDO. Es la tercera vez que este
     proyecto tropieza con lo mismo (#maestroOverlay en la Sesion 20, .btn del quiz en la 29),
     y aqui hizo que el 🔊 de la mini-clase apareciera en 7° y 8°, donde no hay voz que sonar.
     ⚠️ Y no lo delata mirar el DOM: el atributo decia hidden=true. Se vio en la captura. */
  ".btn-escuchar[hidden]{display:none}"+
  ".btn-escuchar{display:block;margin:6px auto 10px;padding:8px 18px;border:0;border-radius:20px;"+
  "background:var(--gold);color:#3a2a12;font-family:'Nunito',sans-serif;font-weight:900;"+
  "font-size:15px;cursor:pointer}"+
  ".opt.leyendo{outline:3px solid var(--gold);outline-offset:2px;background:#3a2f6b}";
 (document.head||document.documentElement).appendChild(s);
})();
