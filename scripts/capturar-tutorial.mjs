/* Capturas e imágenes del tutorial (/tutorial/), tomadas del juego DE VERDAD.
 *
 *   python -m http.server 8765            (en otra consola)
 *   node scripts/cdp.mjs about:blank scripts/capturar-tutorial.mjs
 *   python scripts/armar-clips.py         (junta los cuadros en los .mp4)
 *
 * Es re-ejecutable A PROPÓSITO: el tutorial muestra pantallas del producto, así que cuando
 * el juego cambie hay que rehacerlas, y una captura tomada a mano no se rehace nunca.
 *
 * ⚠️ NO usa ?qa=1: esa banda verde saldría en todas las imágenes. En vez de eso se siembra
 * una partida con los capítulos ya abiertos, que además es lo que un apoderado ve de verdad.
 */
const DIR = 'C:/Proyectos/kimun/assets/web/tutorial/';
const TMP = 'C:/Users/Rodrigo/AppData/Local/Temp/claude/c--Proyectos-kimun/936b2d86-188e-488e-9bba-c95b184acac1/scratchpad/cuadros/';
const B8 = 'http://localhost:8765/8vo/', B3 = 'http://localhost:8765/3ro/';

/* Una partida realista: dos capítulos de Historia terminados, el tercero en curso, algunas
 * etapas con una sola estrella (para que el informe tenga qué mostrar) y monedas para la tienda. */
const SEMBRAR = `(()=>{
  const caps = EXPEDICIONES.filter(e=>e.activa && e.campaña==='hist');
  const rutas = {};
  caps.forEach((exp,k)=>{ const n=exp.etapas.length;
    rutas[exp.id] = {progreso: Array.from({length:n},(_,i)=>({
      est: k<2 ? 'done' : (k===2 && i<3 ? 'done' : (k===2 && i===3 ? 'open' : 'lock')),
      estrellas: k<2 ? (i%3===1?1:3) : (k===2 && i<3 ? (i===1?1:2) : 0)})),
      progresoDificil: [], dificilDesbloqueado:false}; });
  localStorage.setItem(SAVE_KEY, JSON.stringify({
    nombre:'Ignacio', avatar:'🦊', xp:1240, monedas:930, respondidas:412,
    visto: new Date(Date.now()-2*86400000).toISOString().slice(0,10),
    rutas: rutas, skins:['kimun-astronauta'], logros:[],
    campañasCompletas:[], insignias:['mision-profe'], mateLecciones:{}}));
  return 1; })()`;

const pant = `document.querySelector('.screen.on').id`;

export default async (ev) => {
  await ev.movil(390, 800);
  const foto = (n) => ev.foto(DIR + n + '.png');
  const ir = async (u, ms) => { await ev.ir(u); await ev.espera(ms || 3000); };

  // ---------- 8° básico ----------
  await ir(B8, 2600);
  await ev(SEMBRAR);
  await ir(B8, 3200);

  await foto('inicio');                                    // la puerta de entrada
  await ev(`(()=>{$('btnJugador').click();return 1;})()`); await ev.espera(1400);
  await foto('asignaturas');                               // las 4 materias + Lectura

  /* ⚠️ abrirAsignatura() es SOLO para asignaturas sin campaña: siempre lleva a "Elige un
     mapa" y con Historia dejaba una captura de una pantalla vacía, sin ningún error. El
     enrutado a la campaña lo decide la tarjeta del menú, así que aquí se llama derecho. */
  await ev(`(()=>{const c=campañaDe('Historia'); if(c) abrirCampaña(c); return 1;})()`);
  await ev.espera(1800);
  if (await ev(pant) !== 'scr-campana')
    throw new Error('no llegué a la campaña de Historia; estoy en ' + (await ev(pant)));
  await foto('campana');                                   // los capítulos, con su arte

  await ev(`(()=>{entrarExpedicion(EXPEDICIONES.find(e=>e.id==='hist-cap3'));return 1;})()`);
  await ev.espera(1800);
  await foto('mapa');                                      // etapas + jefe del capítulo
  await ev(`(()=>{window.scrollTo(0,99999);return 1;})()`); await ev.espera(700);
  await foto('ranking');                                   // el ranking del curso
  await ev(`(()=>{window.scrollTo(0,0);return 1;})()`); await ev.espera(400);

  // --- la mini-clase, y el clip del diagrama que se arrastra ---
  /* ⚠️ La campana de mini-clases NO se abre con abrirAsignatura: eso lleva a "Elige un
     mapa" y deja una captura de una pantalla vacia, sin ningun error. Son abrirCampaña +
     DOS clics (la unidad, y despues la leccion). */
  await ev(`(()=>{const c=CAMPAÑAS.find(x=>x.id==='mate'); if(c) abrirCampaña(c); return 1;})()`);
  await ev.espera(1800);
  await ev(`(()=>{const n=document.querySelectorAll('.camp-nodo'); if(n[0])n[0].click(); return 1;})()`);
  await ev.espera(1800);
  await ev(`(()=>{const n=document.querySelectorAll('.camp-nodo'); if(n[0])n[0].click(); return 1;})()`);
  await ev.espera(1800);
  // Si aqui no estamos en la mini-clase, ABORTAR: una captura equivocada es peor que ninguna.
  if (await ev(pant) !== 'scr-leccion')
    throw new Error('no llegue a la mini-clase; estoy en ' + (await ev(pant)));
  // avanza hasta el primer bloque con diagrama
  for (let k = 0; k < 6; k++) {
    const hay = await ev(`(()=>{const p=document.querySelector('.screen.on');
      if(p.id!=='scr-leccion') return 'fuera';
      return document.querySelector('#lecCuerpo svg') ? 'si' : 'no';})()`);
    if (hay === 'si' || hay === 'fuera') break;
    await ev(`(()=>{document.getElementById('lecCont').click();return 1;})()`); await ev.espera(700);
  }
  await foto('leccion');
  await clip(ev, TMP, 'diagrama', 14, async (i) => {
    // arrastra la marca de la recta: es lo que muestra que la clase se toca, no se mira
    await ev(`(()=>{const s=document.querySelector('#lecCuerpo svg'); if(!s)return 0;
      const r=s.getBoundingClientRect(), x=r.left+r.width*(0.18+${'${i}'}*0.05), y=r.top+r.height*0.55;
      ['pointerdown','pointermove','pointerup'].forEach(t=>s.dispatchEvent(
        new PointerEvent(t,{clientX:x,clientY:y,bubbles:true,pointerId:1})));
      return 1;})()`.replace('${i}', String(i)));
  });

  // --- el quiz: meta, ayuda 50/50 y la corrección al fallar ---
  await ir(B8, 3000);
  await ev(`(()=>{entrarExpedicion(EXPEDICIONES.find(e=>e.id==='hist-cap3'));return 1;})()`);
  await ev.espera(1600);
  await ev(`(()=>{const o=document.querySelectorAll('#mapbox .node .orb'); o[3].click(); return 1;})()`);
  await ev.espera(1600);
  if (await ev(pant) === 'scr-meta') { await foto('meta');
    await ev(`(()=>{const b=document.getElementById('metaVamos'); if(b)b.click(); return 1;})()`);
    await ev.espera(1400); }
  await ev(`(()=>{clearInterval(Q.timer);return 1;})()`);   // congela el reloj: si no, expira
  await foto('quiz');

  await clip(ev, TMP, 'ayuda', 10, async (i) => {
    if (i === 3) await ev(`(()=>{const b=document.getElementById('btnAyuda'); if(b)b.click(); return 1;})()`);
  });

  /* ⚠️ Cual opcion esta MAL no se puede saber del DOM antes de responder: la clase `ok`
     se pone DESPUES. Hay que mirar el dato -P.ok es el indice correcto- o se termina
     clicando la correcta, que fue lo que paso en el primer intento y dejo una captura de
     la pregunta SIGUIENTE en vez de la correccion. */
  await clip(ev, TMP, 'error', 14, async (i) => {
    if (i === 2) await ev(`(()=>{
      const P=Q.preguntas[Q.idx];
      const ops=[...document.querySelectorAll('#qOpts .opt')];
      const mala=ops.find(o=>{const n=+o.dataset.i; return !isNaN(n) ? n!==P.ok
        : o.textContent.indexOf(P.ops[P.ok])<0;});
      (mala||ops[ops.length-1]).click(); return 1;})()`);
  });
  await foto('error');
  /* Y una segunda, desplazada: la EXPLICACION es lo que hay que mostrar -"hay correccion
     de errores"- y a 800 px queda bajo la barra inferior. Se toman las dos y el tutorial
     usa la que lea mejor. */
  await ev(`(()=>{window.scrollTo(0,99999);return 1;})()`); await ev.espera(600);
  await foto('error-explica');

  // --- predicción y resultado: se responden TODAS, que es el unico camino real ---
  for (let k = 0; k < 40; k++) {
    const p = await ev(pant);
    if (p !== 'scr-quiz') break;
    await ev(`(()=>{
      const c=document.getElementById('btnSeguir');
      if(c && !c.hidden){ c.click(); return 'sigue'; }
      const P=Q.preguntas[Q.idx], ops=[...document.querySelectorAll('#qOpts .opt')];
      const buena=ops.find(o=>{const n=+o.dataset.i; return !isNaN(n) ? n===P.ok
        : o.textContent.indexOf(P.ops[P.ok])>=0;});
      (buena||ops[0]).click(); clearInterval(Q.timer); return 'responde';})()`);
    await ev.espera(700);
  }
  if (await ev(pant) === 'scr-pred') { await foto('prediccion');
    await ev(`(()=>{const b=document.querySelector('#scr-pred .sem'); if(b)b.click(); return 1;})()`);
    await ev.espera(1500); }
  if (await ev(pant) === 'scr-res') await foto('resultado');

  // --- tienda, jefe e informe ---
  await ir(B8, 3000);
  await ev(`(()=>{entrarExpedicion(EXPEDICIONES.find(e=>e.id==='hist-cap1'));return 1;})()`);
  await ev.espera(1400);
  await ev(`(()=>{go('scr-tienda');renderTienda&&renderTienda();return 1;})()`); await ev.espera(1300);
  await foto('tienda');

  await ir(B8, 3000);
  await ev(`(()=>{const c=CAMPAÑAS.find(x=>x.id==='hist'); if(c&&c.jefeFinal) iniciarJefeFinal(c); return 1;})()`);
  await ev.espera(1500);
  if (await ev(pant) === 'scr-jefe-intro') await foto('jefe');

  await ir(B8, 3000);
  await ev(`(()=>{abrirInforme();return 1;})()`); await ev.espera(1200);
  await foto('informe');
  await ev(`(()=>{window.scrollTo(0,99999);return 1;})()`); await ev.espera(600);
  await foto('informe-temas');

  // ---------- 3° básico: la voz y el texto grande ----------
  await ir(B3, 3400);
  await ev(`(()=>{const s=JSON.parse(localStorage.getItem(SAVE_KEY)||'{}');
    s.nombre='Emilia'; s.avatar='🦊'; localStorage.setItem(SAVE_KEY,JSON.stringify(s)); return 1;})()`);
  await ir(B3, 3400);
  await ev(`(()=>{entrarExpedicion(EXPEDICIONES.find(e=>e.activa&&e.campaña));return 1;})()`);
  await ev.espera(1600);
  await ev(`(()=>{const o=document.querySelectorAll('#mapbox .node .orb'); o[0].click(); return 1;})()`);
  await ev.espera(1800);
  if (await ev(pant) === 'scr-meta') {
    await ev(`(()=>{const b=document.getElementById('metaVamos'); if(b)b.click(); return 1;})()`);
    await ev.espera(1600); }
  for (let k = 0; k < 8 && await ev(pant) === 'scr-leccion'; k++) {
    await ev(`(()=>{document.getElementById('lecCont').click();return 1;})()`); await ev.espera(600);
  }
  if (await ev(pant) === 'scr-quiz') await foto('voz-3ro');

  console.log('capturas en', DIR);
  console.log('cuadros de clips en', TMP);
  console.log('excepciones:', ev.consola.filter(l => l.startsWith('EXCEPCION')).length);
  console.log('fallos:', JSON.stringify(ev.fallos));
};

/* Un clip = una ráfaga de capturas numeradas, que armar-clips.py junta con ffmpeg. Se hace
 * así y no con Page.startScreencast para no meterle una máquina nueva a cdp.mjs, que es la
 * herramienta con la que se VERIFICA el juego y conviene mantener chica. */
async function clip(ev, tmp, nombre, cuadros, paso) {
  for (let i = 0; i < cuadros; i++) {
    if (paso) await paso(i);
    await ev.foto(tmp + nombre + '-' + String(i).padStart(2, '0') + '.png');
    await ev.espera(120);
  }
}
