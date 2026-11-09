/* Capturas e imágenes del tutorial (/tutorial/), tomadas del juego DE VERDAD.
 *
 *   python -m http.server 8799 --directory .     (en otra consola, desde la raíz del repo)
 *   node scripts/cdp.mjs about:blank scripts/capturar-tutorial.mjs
 *   python scripts/armar-clips.py                (junta los cuadros en los .mp4)
 *
 * Es re-ejecutable A PROPÓSITO: el tutorial muestra pantallas del producto, así que cuando
 * el juego cambie hay que rehacerlas, y una captura tomada a mano no se rehace nunca.
 *
 * ⚠️ NO usa ?qa=1: esa banda verde saldría en todas las imágenes. En vez de eso se siembra
 * una partida de alumno —con código canjeado, porque la puerta está cerrada desde el 1 de
 * octubre y sin código casi todo sale con candado—, que además es lo que ve un alumno real.
 * ⚠️ El puerto es 8799 y no 8765: en el PC de casa el 8765 lo ocupa otro servidor (Sesión 135).
 * Los cuadros de los clips quedan en dev/cuadros-tutorial/ (en .gitignore).
 */
const RAIZ = decodeURIComponent(new URL('../', import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
const DIR = RAIZ + 'assets/web/tutorial/';
const TMP = RAIZ + 'dev/cuadros-tutorial/';
const B = 'http://localhost:8799/';
const B8 = B + '8vo/?intro=0', B1 = B + '1ro/?intro=0';

/* Una partida realista: dos capítulos de Historia terminados, el tercero en curso, algunas
 * etapas con una sola estrella (para que el informe tenga qué mostrar), monedas para la tienda,
 * una racha de 4 días y cuatro preguntas falladas que tocan HOY (para que salga «Mis errores»).
 * `pc:'mio'` evita la pregunta del computador compartido, que taparía las capturas. */
const SEMBRAR = `(()=>{
  const caps = EXPEDICIONES.filter(e=>e.activa && e.campaña==='hist');
  const rutas = {};
  caps.forEach((exp,k)=>{ const n=exp.etapas.length;
    rutas[exp.id] = {progreso: Array.from({length:n},(_,i)=>({
      est: k<2 ? 'done' : (k===2 && i<3 ? 'done' : 'open'),
      estrellas: k<2 ? (i%3===1?1:3) : (k===2 && i<3 ? (i===1?1:2) : 0)})),
      progresoDificil: [], dificilDesbloqueado:false}; });
  const hoy=new Date().toISOString().slice(0,10), ayer=new Date(Date.now()-86400000).toISOString().slice(0,10);
  const c='contenido/historia-8basico/preguntas.json', err={};
  ['hist8-oa01-001','hist8-oa03-004','hist8-oa05-005','hist8-oa07-001'].forEach(id=>err[id]={c:c,k:0,d:ayer});
  localStorage.setItem(SAVE_KEY, JSON.stringify({
    nombre:'Ignacio', avatar:'🦊', alumno:'Ignacio', xp:1240, monedas:1930, respondidas:412,
    visto: ayer, rachaDias:{n:4, ult:hoy}, errores: err,
    rutas: rutas, skins:['kimun-astronauta'], logros:[], marcos:['oro'], marco:'oro',
    campañasCompletas:[], insignias:['mision-profe'], mateLecciones:{}}));
  localStorage.setItem('kimun_pc'+SUFIJO,'mio');
  localStorage.setItem('kimun_alufin'+SUFIJO,'7K2Q');
  return 1; })()`;

/* Ranking de muestra: el panel real necesita un curso inscrito. Nombres inventados. */
const RANKING = `(()=>{
  window.MI_PERFIL = window.MI_PERFIL || {id:'demo'};
  const f=(n,a,xp,sem,yo)=>({nombre:n,avatar:a,xp:xp,xp_semana:sem,soy_yo:!!yo,curso:'8°A',dificil:0});
  const filas=[f('Ignacio','🦊',1240,180,1),f('Martina','🐼',1610,140),f('Benjamín','🐯',980,95),
               f('Sofía','🦉',1450,60),f('Tomás','🐸',720,40)];
  SB.rpc=(fn)=>Promise.resolve({data: fn==='kimun_ranking_semanal'
    ? filas.slice().sort((a,b)=>b.xp_semana-a.xp_semana) : filas.slice().sort((a,b)=>b.xp-a.xp), error:null});
  return 1; })()`;

const pant = `document.querySelector('.screen.on').id`;

export default async (ev) => {
  await ev.movil(390, 800);
  const foto = (n) => ev.foto(DIR + n + '.png');
  const ir = async (u, ms) => { await ev.ir(u); await ev.espera(ms || 3000); };
  const exige = async (id, que) => { const p = await ev(pant);
    if (p !== id) throw new Error('no llegué a ' + que + '; estoy en ' + p); };

  // ---------- 8° básico ----------
  await ir(B8, 2600);
  await ev(SEMBRAR);
  await ir(B8 + '&s=1', 3400);
  await ev(`(window.alert=()=>{},1)`);

  await foto('inicio');                                    // saludo, código oculto y racha
  await ev(`(()=>{$('btnJugador').click();return 1;})()`); await ev.espera(1400);
  await exige('scr-expediciones', 'el menú');
  await foto('asignaturas');                               // las asignaturas + Mis errores

  /* ⚠️ abrirAsignatura() es SOLO para asignaturas sin campaña: siempre lleva a "Elige un
     mapa" y con Historia dejaba una captura de una pantalla vacía, sin ningún error. */
  await ev(`(()=>{const c=campañaDe('Historia'); if(c) abrirCampaña(c); return 1;})()`);
  await ev.espera(1800);
  await exige('scr-campana', 'la campaña de Historia');
  await foto('campana');                                   // los capítulos, con su arte

  await ev(`(()=>{entrarExpedicion(EXPEDICIONES.find(e=>e.id==='hist-cap3'));return 1;})()`);
  await ev.espera(1800);
  await foto('mapa');                                      // etapas + jefe del capítulo
  await ev(RANKING);
  await ev(`(()=>{ if(typeof _rankUlt!=='undefined') _rankUlt=0; renderRanking(); return 1;})()`);
  await ev.espera(900);
  await ev(`(()=>{const t=document.getElementById('rankTabs'); if(t) t.scrollIntoView({block:'start'}); else window.scrollTo(0,99999); return 1;})()`);
  await ev.espera(700);
  await foto('ranking');                                   // el ranking semanal del curso

  // --- la mini-clase, y el clip del diagrama que se arrastra ---
  /* Desde la Sesión 98 cada unidad de Matemática es UNA tarjeta que abre su expedición, y
     las mini-clases son los primeros nodos de ese mapa. */
  await ir(B8 + '&s=2', 3000);
  await ev(`(()=>{const c=CAMPAÑAS.find(x=>x.id==='mate'); if(c) abrirCampaña(c); return 1;})()`);
  await ev.espera(1800);
  await ev(`(()=>{const n=document.querySelectorAll('.camp-nodo'); if(n[0])n[0].click(); return 1;})()`);
  await ev.espera(1800);
  await ev(`(()=>{const o=document.querySelector('#mapbox .node .orb'); if(o)o.click(); return 1;})()`);
  await ev.espera(1800);
  await exige('scr-leccion', 'la mini-clase');
  for (let k = 0; k < 6; k++) {
    const hay = await ev(`(()=>{const p=document.querySelector('.screen.on');
      if(p.id!=='scr-leccion') return 'fuera';
      return document.querySelector('#lecCuerpo svg') ? 'si' : 'no';})()`);
    if (hay === 'si' || hay === 'fuera') break;
    await ev(`(()=>{document.getElementById('lecCont').click();return 1;})()`); await ev.espera(700);
  }
  await foto('leccion');
  await clip(ev, TMP, 'diagrama', 14, async (i) => {
    await ev(`(()=>{const s=document.querySelector('#lecCuerpo svg'); if(!s)return 0;
      const r=s.getBoundingClientRect(), x=r.left+r.width*(0.18+${'${i}'}*0.05), y=r.top+r.height*0.55;
      ['pointerdown','pointermove','pointerup'].forEach(t=>s.dispatchEvent(
        new PointerEvent(t,{clientX:x,clientY:y,bubbles:true,pointerId:1})));
      return 1;})()`.replace('${i}', String(i)));
  });

  // --- el quiz: meta, ayuda 50/50 y la corrección al fallar ---
  await ir(B8 + '&s=3', 3000);
  await ev(`(()=>{entrarExpedicion(EXPEDICIONES.find(e=>e.id==='hist-cap3'));return 1;})()`);
  await ev.espera(1600);
  await ev(`(()=>{startQuiz(3); return 1;})()`);
  await ev.espera(1600);
  if (await ev(pant) === 'scr-meta') { await foto('meta');
    await ev(`(()=>{const b=document.getElementById('metaVamos'); if(b)b.click(); return 1;})()`);
    await ev.espera(1400); }
  await exige('scr-quiz', 'el quiz');
  await ev(`(()=>{clearInterval(Q.timer);return 1;})()`);   // congela el reloj: si no, expira
  await foto('quiz');

  await clip(ev, TMP, 'ayuda', 10, async (i) => {
    if (i === 3) await ev(`(()=>{const b=document.getElementById('btnAyuda'); if(b)b.click(); return 1;})()`);
  });

  /* ⚠️ Cuál opción está MAL no se puede saber del DOM antes de responder: la clase `ok`
     se pone DESPUÉS. Se mira el dato (data-correcta). Desde la Sesión 147 la pantalla baja
     sola hasta la corrección, así que el clip ya la muestra. */
  await clip(ev, TMP, 'error', 16, async (i) => {
    // ⚠️ Una opción incorrecta que NO haya descartado el 50/50 del clip anterior: clicar una
    // descartada no hace nada, y la captura salía sin la corrección.
    if (i === 2) await ev(`(()=>{const m=[...document.querySelectorAll('#qOpts .opt')].find(o=>!o.hasAttribute('data-correcta')
        && !o.disabled && !/off|gone|descart/.test(o.className) && getComputedStyle(o).opacity>0.6);
      if(m) m.click(); return 1;})()`);
  });
  await ev(`(()=>{window.scrollTo(0,0);return 1;})()`); await ev.espera(500);
  await foto('error');
  await ev(`(()=>{const b=document.getElementById('btnSeguir'); if(b) b.scrollIntoView({block:'center'}); return 1;})()`); await ev.espera(600);
  await foto('error-explica');

  // --- predicción y resultado: se responden TODAS, que es el único camino real ---
  for (let k = 0; k < 40; k++) {
    if (await ev(pant) !== 'scr-quiz') break;
    await ev(`(()=>{
      const c=document.getElementById('btnSeguir');
      if(c && !c.hidden){ c.click(); return 'sigue'; }
      const b=document.querySelector('#qOpts .opt[data-correcta]')||document.querySelector('#qOpts .opt');
      b.click(); clearInterval(Q.timer); return 'responde';})()`);
    await ev.espera(700);
  }
  // la animación de subir de nivel tapa la pantalla unos segundos: se espera a que se vaya
  await ev.espera(3500);
  if (await ev(pant) === 'scr-pred') { await foto('prediccion');
    await ev(`(()=>{const b=document.querySelector('#scr-pred .sem'); if(b)b.click(); return 1;})()`);
    await ev.espera(1500); }
  if (await ev(pant) === 'scr-res') await foto('resultado');

  // --- tienda (skins y marcos), jefe e informe ---
  await ir(B8 + '&s=4', 3000);
  await ev(`(()=>{entrarExpedicion(EXPEDICIONES.find(e=>e.id==='hist-cap1'));return 1;})()`);
  await ev.espera(1400);
  await ev(`(()=>{go('scr-tienda');renderTienda&&renderTienda();return 1;})()`); await ev.espera(1300);
  await foto('tienda');
  await ev(`(()=>{const t=[...document.querySelectorAll('#tiendaGrid div')].find(d=>/Marcos para tu avatar/.test(d.textContent)&&d.children.length===0);
    if(t) t.scrollIntoView({block:'start'}); return 1;})()`); await ev.espera(700);
  await foto('marcos');

  await ir(B8 + '&s=5', 3000);
  await ev(`(()=>{const c=CAMPAÑAS.find(x=>x.id==='hist'); if(c&&c.jefeFinal) iniciarJefeFinal(c); return 1;})()`);
  await ev.espera(1800);
  if (await ev(pant) === 'scr-jefe-intro') await foto('jefe');

  await ir(B8 + '&s=6', 3000);
  await ev(`(()=>{abrirInforme();return 1;})()`); await ev.espera(1200);
  await foto('informe');
  await ev(`(()=>{window.scrollTo(0,99999);return 1;})()`); await ev.espera(600);
  await foto('informe-temas');

  // ---------- 1° básico: la voz que lee sola ----------
  await ir(B1, 2600);
  await ev(`(()=>{localStorage.setItem(SAVE_KEY,JSON.stringify({nombre:'Emilia',avatar:'🦊',alumno:'Emilia'}));
    localStorage.setItem('kimun_pc'+SUFIJO,'mio'); return 1;})()`);
  await ir(B1 + '&s=7', 3400);
  await ev(`(()=>{entrarExpedicion(EXPEDICIONES.find(e=>e.id==='hist1-cap1')||EXPEDICIONES.find(e=>e.activa&&e.campaña));return 1;})()`);
  await ev.espera(1600);
  await ev(`(()=>{startQuiz(0); return 1;})()`); await ev.espera(1600);
  if (await ev(pant) === 'scr-meta') {
    await ev(`(()=>{const b=document.getElementById('metaVamos'); if(b)b.click(); return 1;})()`);
    await ev.espera(1600); }
  await exige('scr-quiz', 'el quiz de 1°');
  await ev(`(()=>{clearInterval(Q.timer);
    const o=document.querySelectorAll('#qOpts .opt')[1]; if(o) o.classList.add('leyendo'); return 1;})()`);
  await ev.espera(400);
  await foto('voz');

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
