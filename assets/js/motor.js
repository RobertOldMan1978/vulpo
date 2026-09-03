/* ══════════════════════════════════════════════════════════════════════════════
   VULPO · motor.js — el motor del juego, escrito UNA vez para los tres cursos.

   Nace de la medición del 31/08: 139 de 139 funciones de nivel superior eran byte a byte
   idénticas en los tres forks, o sea 1.310 líneas copiadas tres veces. Con 4°, 5° y 6° por
   delante, cada línea que siguiera aquí se copiaría tres veces más.

   ⚠️ ESTE MÓDULO NO PUEDE DEGRADAR. Los otros cinco de assets/js/ llevan un respaldo vacío:
   si no cargan, el juego sigue andando sin esa funcionalidad. Aquí no hay respaldo posible
   —esto ES el juego— y el síntoma de un 404 es el engañoso de siempre: la pantalla se ve
   bien y ningún botón responde. Por eso:
     · cada fork lleva una CANARIA al final de su script, que lo dice en pantalla;
     · y este archivo se publica en un push ANTERIOR al que lo referencia (misma lección
       que el `drop function` de la Sesión 73: el cliente nunca antes que su dependencia).

   ⚠️ Aquí NO se declaran datos ni banderas. Lee las de cada curso (S, EXPEDICIONES,
   CAMPAÑAS, HAY_DIFICIL, SUFIJO…), que viven en su index.html: son globales de script
   clásico y se comparten. Este archivo va ANTES del <script> inline; sus funciones se izan,
   así que para cuando alguien las llama esas constantes ya están declaradas.
   Si una función necesita algo que solo tiene un curso, eso va como DATO (una bandera con
   nombre), nunca como un `if` sobre el nombre de la asignatura. Ver CLAUDE.md.
   ══════════════════════════════════════════════════════════════════════════════ */
window.__MOTOR_OK = true;

/* ── Jefes Finales de campaña ─────────────────────────────────────────────────── */
// Arma las preguntas de una fase mezclando sus OA (reusa POOL y pickN)
function jefePreguntasFase(camp,faseIdx){
 const f=camp.jefeFinal.fases[faseIdx], n=camp.jefeFinal.nPorFase, per=Math.max(1,Math.ceil(n/f.oas.length));
 let sel=[]; f.oas.forEach(oa=>{sel=sel.concat(pickN(POOL[oa]||[],per));});
 // Igual que en las etapas: se conserva el `oa` para el mapa de dominio.
 return pickN(sel,n).map(q=>({q:q.pregunta,ops:q.opciones,ok:q.correcta,tip:q.tip,oa:q.oa,visual:q.visual,id:q.id}));
}
function iniciarJefeFinal(camp){
 const arrancar=()=>{
  const jf=camp.jefeFinal, total=jf.fases.length*jf.nPorFase;
  if(!jf.fases.every(f=>f.oas.every(oa=>(POOL[oa]||[]).length>0))){   // el banco no cargó (p. ej. sin conexión)
   alert('Cargando preguntas… intenta de nuevo en un momento.'); renderCampaña(); go('scr-campana'); return;
  }
  JF={camp,fase:0,idx:0,preguntas:[],vidaMax:total,vida:total,vidas:jf.vidasJugador,lock:false};
  renderJefeIntro();
 };
 if(HAY_MINICLASES&&camp.esLecciones){ LECC.cargarPool().then(arrancar); }   // campaña de Matemáticas
 else { const capExp=EXPEDICIONES.find(e=>e.id===camp.capitulos[0]); activarExpedicion(capExp).then(arrancar); }
}
function renderJefeIntro(){
 const jf=JF.camp.jefeFinal;
 $('jiVillano').innerHTML=jf.villanoImg?`<img src="${jf.villanoImg}" alt="${jf.villano}">`:jf.villanoIc;
 $('jiNombre').textContent=jf.villano;
 $('jiDialogo').textContent='«'+jf.dialogo+'»';
 document.body.classList.add('en-jefe');
 $('nav').style.display='none';
 go('scr-jefe-intro');
}
function cargarFaseJefe(){JF.preguntas=jefePreguntasFase(JF.camp,JF.fase);JF.idx=0;renderJefePregunta();}
function pintarHudJefe(){
 const jf=JF.camp.jefeFinal;
 $('jvVillanoIc').innerHTML=jf.villanoImg?`<img src="${jf.villanoImg}" alt="">`:jf.villanoIc;
 $('jvNombre').textContent=jf.villano;
 $('jvFill').style.width=Math.max(0,(JF.vida/JF.vidaMax*100))+'%';
 $('jvVidas').textContent='❤️'.repeat(Math.max(0,JF.vidas))+'🤍'.repeat(Math.max(0,jf.vidasJugador-JF.vidas));
 $('jvFase').textContent='Fase '+(JF.fase+1)+' de '+jf.fases.length+' · '+jf.fases[JF.fase].nombre;
}
function renderJefePregunta(){
 pintarHudJefe();
 const p=JF.preguntas[JF.idx], cont=$('jefePregunta');
 const orden=p.ops.map((o,i)=>({o,i})).sort(()=>Math.random()-.5);
 cont.innerHTML=`<div class="qcard"><div class="tag">👑 Jefe Final · Pregunta ${JF.idx+1}/${JF.preguntas.length}</div><h2>${FRAC.html(p.q)}</h2></div><div class="opts" id="jfOpts"></div>`;
 const ops=cont.querySelector('#jfOpts');
 orden.forEach((it,k)=>{const b=document.createElement('div');b.className='opt';
  if(it.i===p.ok)b.dataset.correcta='1';
  if(QA_MARCA&&it.i===p.ok)b.classList.add('qa-ok');
  b.innerHTML=`<span class="key">${'ABCD'[k]}</span>${FRAC.html(it.o)}`;
  b.onclick=()=>responderJefe(b,it.i===p.ok);ops.appendChild(b);});
 JF.lock=false;
}
function responderJefe(el,ok){
 if(JF.lock)return; JF.lock=true;
 marcarActividad();
 registrarOA(JF.preguntas[JF.idx] && JF.preguntas[JF.idx].oa, ok);   // mapa de dominio
 document.querySelectorAll('#jfOpts .opt').forEach(o=>o.classList.add('off'));
 if(ok){ SND.hit(); JF.vida=Math.max(0,JF.vida-1);
  if(el){el.classList.remove('off');el.classList.add('ok');}
  const r=el?el.getBoundingClientRect():null; if(r)particulas(r.left+r.width/2,r.top,['⚔️','💥','✨']);
 } else { SND.hurt(); JF.vidas--;
  if(el){el.classList.remove('off');el.classList.add('bad');}
  const c=document.querySelector('#jfOpts .opt[data-correcta]'); if(c)c.classList.add('ok');
  document.body.classList.add('jefe-hit'); setTimeout(()=>document.body.classList.remove('jefe-hit'),260);
  if(navigator.vibrate)navigator.vibrate(140);
 }
 pintarHudJefe();
 setTimeout(()=>{
  if(JF.vidas<=0){ enviarDominio(); return jefeDerrota(); }   // no se pierde lo que sí respondió
  if(JF.vida<=0){ return jefeVictoria(); }
  JF.idx++;
  if(JF.idx>=JF.preguntas.length){ // fin de fase → siguiente fase
   JF.fase++;
   if(JF.fase>=JF.camp.jefeFinal.fases.length){ JF.fase=0; } // salvaguarda: normalmente ya venció
   cargarFaseJefe();
  } else { renderJefePregunta(); }
 }, ok?700:1200);
}
function jefeDerrota(){
 SND.lose();
 renderJefeDerrota();   // pantalla temática (mantiene en-jefe para la atmósfera carmesí)
 go('scr-jefe-lose');
}
function renderJefeDerrota(){
 const jf=JF.camp.jefeFinal, camp=JF.camp;
 const dmg=Math.max(0,JF.vidaMax-JF.vida), pct=Math.round(dmg/JF.vidaMax*100);
 $('jlVillano').innerHTML=jf.villanoImg?`<img src="${jf.villanoImg}" alt="${jf.villano}">`:jf.villanoIc;
 $('jlTauntNom').textContent=jf.villano;
 $('jlTitulo').textContent=pct>=70?'¡Casi lo logras!':'¡Buen intento!';
 $('jlDialogo').textContent=jf.derrota?('«'+jf.derrota+'»'):'Aprende de esta ronda y vuelve más fuerte. ¡Tú puedes!';
 $('jlDmgPct').textContent=pct+'%';
 $('jlFase').textContent='Llegaste a la Fase '+(JF.fase+1)+' de '+jf.fases.length;
 const fill=$('jlDmgFill'); fill.style.width='0%'; requestAnimationFrame(()=>{fill.style.width=pct+'%';});
 $('jlRetry').onclick=()=>{SND.tap();iniciarJefeFinal(camp);};   // reintento con preguntas nuevas
 $('jlBack').onclick=()=>{SND.tap();document.body.classList.remove('en-jefe');go('scr-campana');renderCampaña();};
}
function jefeVictoria(){
 SND.win();
 otorgarRecompensasCampaña(JF.camp); // Fase 4
 renderCaidaVillano(JF.camp, ()=>{   // Tiempo 1: caída; luego recompensas
  document.body.classList.remove('en-jefe');   // el carmesí se conserva hasta aquí
  renderJefeVictoria();
 });
}
// Tiempo 1: overlay a pantalla completa donde el villano cae y arranca la música de victoria.
function renderCaidaVillano(camp, alTerminar){
 const jf=camp.jefeFinal;
 const ov=$('jefe-caida'), vic=$('jcVillano'), txt=$('jcTexto'), fl=$('jcFlash');
 JC_LOCK=false;
 vic.className='jc-villano';                     // estado inicial: imagen de combate
 vic.innerHTML=jf.villanoImg?`<img src="${jf.villanoImg}" alt="${jf.villano}">`:jf.villanoIc;
 const fem=/^la\b/i.test(jf.villano);   // "La Entropía"/"La Incógnita" → derrotada
 txt.className='jc-texto disp'; txt.textContent='¡'+jf.villano+' ha sido derrotad'+(fem?'a':'o')+'!';
 fl.classList.remove('go');
 ov.hidden=false;
 MUSIC.play('victoria');
 const avanzar=()=>{ if(JC_LOCK)return; JC_LOCK=true; ov.hidden=true; alTerminar(); };
 ov.onclick=avanzar;
 setTimeout(()=>{ fl.classList.add('go'); vic.classList.add('jc-shake'); }, 300);
 setTimeout(()=>{
  const usarFallback=!jf.villanoImgDerrotado;
  const src=jf.villanoImgDerrotado||jf.villanoImg;
  vic.classList.remove('jc-shake');
  vic.innerHTML=jf.villanoImg
   ? `<img src="${src}" alt="${jf.villano}" onerror="this.onerror=null;this.src='${jf.villanoImg}';this.closest('.jc-villano').classList.add('jc-fallback')">`
   : jf.villanoIc;
  if(usarFallback) vic.classList.add('jc-fallback');
  vic.classList.add('caido');
  txt.classList.add('show');
 }, 550);
 setTimeout(avanzar, 3000);
}
/* ===== Recompensas de campaña (Fase 4) ===== */
function otorgarRecompensasCampaña(camp){
 const r=camp.recompensa||{};
 const primera=!S.campañasCompletas.has(camp.id);   // el bono se paga UNA sola vez
 S.campañasCompletas.add(camp.id);
 if(r.insignia) S.insignias.add(r.insignia);
 if(r.skin){ // la skin exclusiva se identifica por id; guardamos su emoji (lo que usa el avatar)
  const sk=SKINS.find(s=>s.id===r.skin), val=sk?sk.e:r.skin;
  if(!S.skins.includes(val)) S.skins.push(val);
 }
 if(primera){ S.monedas+=(r.bonoMonedas||0); S.xp+=(r.bonoXP||0); }   // no re-otorgar al rejugar
 if(S.insigniaActiva===null && r.insignia) S.insigniaActiva=r.insignia; // luce la primera por defecto
 guardar(); refreshHud();
}
function renderJefeVictoria(){
 const camp=JF.camp, r=camp.recompensa||{};
 const sk=SKINS.find(s=>s.id===r.skin), ins=INSIGNIAS.find(i=>i.id===r.insignia);
 $('jwTitulo').textContent='¡'+camp.asignatura+' dominada!';
 const items=[];
 const it=(ic,titulo,sub)=>`<div class="jw-item" style="animation-delay:${(items.length*0.15).toFixed(2)}s"><span class="jw-ic">${ic}</span><div><b>${titulo}</b><small>${sub}</small></div></div>`;
 if(sk){const ic=sk.img?`<img src="${sk.img}" alt="${sk.nombre}">`:sk.e;
  items.push(it(ic,'Skin exclusiva',`${sk.nombre} — ya equipable en la tienda`));}
 if(ins) items.push(it(ins.ic,'Insignia',ins.tx));
 items.push(it('👑','Corona dorada',`en la tarjeta de ${camp.asignatura}`));
 items.push(it('🎁','Bono',`+${r.bonoMonedas||0} monedas · +${r.bonoXP||0} XP`));
 $('jwRecompensas').innerHTML=items.join('');
 enviarDominio();
 go('scr-jefe-win');
 confetiVictoria();
}
function confetiVictoria(){
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const cols=['#ffc93c','#ff4d8d','#4dd8ff','#3ee089','#8f6bff'];
 for(let i=0;i<26;i++){
  const c=document.createElement('span'); c.className='confeti';
  c.style.left=(Math.random()*100)+'%';
  c.style.background=cols[i%cols.length];
  c.style.animationDelay=(Math.random()*0.6).toFixed(2)+'s';
  c.style.setProperty('--dx',Math.round(Math.random()*60-30)+'px');
  document.body.appendChild(c);
  setTimeout(()=>c.remove(),2900);
 }
}

/* ── Duelo 1v1 (local y en línea) ─────────────────────────────────────────────────── */
function poolDuelo(){return DUELO_POOL||[];}function initDueloSetup(){
 $('d1Name').value='';$('d2Name').value='';
 D.j[0].em=DUELO_AV[0];D.j[1].em=DUELO_AV[1];
 [['d1Av',0],['d2Av',1]].forEach(par=>{const g=$(par[0]),pi=par[1];g.innerHTML='';
  DUELO_AV.forEach(a=>{const d=document.createElement('div');d.className='av'+(a===D.j[pi].em?' sel':'');d.textContent=a;
   d.onclick=()=>{SND.tap();D.j[pi].em=a;g.querySelectorAll('.av').forEach(x=>x.classList.remove('sel'));d.classList.add('sel');};
   g.appendChild(d);});});
 go('scr-duelo-setup');
}
function nuevaRondaDuelo(){
 D.j[0].pts=0;D.j[1].pts=0;D.ronda=0;D.turno=0;
 D.pr=pickN(poolDuelo(),DUELO_ROUNDS).map(q=>({q:q.pregunta,ops:q.opciones,ok:q.correcta,tip:q.tip,visual:q.visual,id:q.id}));
 dueloPass();
}
function dueloPass(){const jug=D.j[D.turno];$('dpEm').textContent=jug.em;$('dpMsg').textContent='Turno de '+jug.n;go('scr-duelo-pass');}
function pintaDuelo(){
 const P=D.pr[D.ronda],jug=D.j[D.turno];D.lock=false;
 $('dTurn').textContent=jug.em+' '+jug.n;
 $('dTag').textContent='Ronda '+(D.ronda+1)+'/'+DUELO_ROUNDS;
 $('dText').innerHTML=FRAC.html(P.q);$('dFb').textContent='';$('dFb').className='feedback';
 $('dProg').style.width=(D.ronda/DUELO_ROUNDS*100)+'%';
 $('dScore').textContent=`${D.j[0].em} ${D.j[0].pts}  —  ${D.j[1].pts} ${D.j[1].em}`;
 const orden=P.ops.map((o,i)=>({o,i})).sort(()=>Math.random()-.5);
 const box=$('dOpts');box.innerHTML='';
 orden.forEach((it,k)=>{const b=document.createElement('div');b.className='opt';
  b.innerHTML=`<span class="key">${'ABCD'[k]}</span>${FRAC.html(it.o)}`;
  b.onclick=()=>responderDuelo(b,it.i===P.ok,P);box.appendChild(b);});
 clearInterval(D.timer);D.t=DUELO_SEG;$('dTimer').textContent=D.t;$('dTimer').className='timer';
 D.timer=setInterval(()=>{D.t--;$('dTimer').textContent=D.t;if(D.t<=5){$('dTimer').classList.add('low');if(D.t>0)SND.tick();}
  if(D.t<=0){clearInterval(D.timer);responderDuelo(null,false,P);}},1000);
 go('scr-duelo-q');
}
function responderDuelo(el,ok,P){
 if(D.lock)return;D.lock=true;clearInterval(D.timer);
 document.querySelectorAll('#dOpts .opt').forEach(o=>o.classList.add('off'));
 if(ok){D.j[D.turno].pts++;if(el){el.classList.remove('off');el.classList.add('ok');}$('dFb').textContent='✓ ¡Correcto!';$('dFb').classList.add('ok');SND.correct();}
 else{if(el){el.classList.remove('off');el.classList.add('bad');}$('dFb').textContent='✗ '+P.tip;$('dFb').classList.add('bad');SND.wrong();}
 $('dScore').textContent=`${D.j[0].em} ${D.j[0].pts}  —  ${D.j[1].pts} ${D.j[1].em}`;
 setTimeout(()=>{
  if(D.turno===0){D.turno=1;dueloPass();}
  else{D.turno=0;D.ronda++;if(D.ronda<DUELO_ROUNDS)dueloPass();else finDuelo();}
 },ok?1100:2000);
}
function finDuelo(){
 clearInterval(D.timer);const a=D.j[0],b=D.j[1];let ic,title;
 if(a.pts===b.pts){ic='🤝';title='¡Empate!';}
 else{const w=a.pts>b.pts?a:b;ic=w.em;title='¡Gana '+w.n+'!';}
 SND.win();
 $('drIc').textContent=ic;$('drTitle').textContent=title;
 $('drScore').innerHTML=`${escHtml(a.em)} ${escHtml(a.n)}: <b style="color:var(--cyan)">${a.pts}</b> &nbsp;vs&nbsp; ${escHtml(b.em)} ${escHtml(b.n)}: <b style="color:var(--cyan)">${b.pts}</b>`;
 go('scr-duelo-res');
}
function odPreguntas(exp){let all=[],seen=new Set();
 exp.etapas.forEach(e=>{const oas=e.oas||(e.oa&&e.oa!=='BOSS'?[e.oa]:[]);oas.forEach(oa=>(POOL[oa]||[]).forEach(q=>{if(!seen.has(q.pregunta)){seen.add(q.pregunta);all.push(q);}}));});
 return pickN(all,8).map(q=>({pregunta:q.pregunta,opciones:q.opciones,correcta:q.correcta,tip:q.tip}));}
function odExpsDe(asig){return EXPEDICIONES.filter(e=>e.activa&&e.asignatura===asig);}
function odNMapas(asig){return (HAY_RETO_CALCULO&&asig==='Matemáticas')?NIVELES_CALC.length:odExpsDe(asig).length;}
// NIVEL 1 (duelo): un módulo por asignatura; al tocarlo se abren sus mapas.
function renderODExp(){const cont=$('odExpSel');cont.innerHTML='';OD_EXP_SEL=null;
 ORDEN_ASIG.forEach(asig=>{const n=odNMapas(asig);if(!n)return;
  const exps=odExpsDe(asig);
  const b=document.createElement('button');
  const portada=ASIG_PORTADA[asig]||(exps[0]&&exps[0].portada);
  b.innerHTML=`<img src="${portada}" alt=""><span class="od-exp-tx"><b>${asig}</b><small>${n} ${n===1?'mapa':'mapas'}</small></span>`;
  b.onclick=()=>{SND.tap();renderODExpMapas(asig);};
  cont.appendChild(b);});}
// NIVEL 2 (duelo): los mapas de una asignatura, con "volver" a materias.
function renderODExpMapas(asig){const cont=$('odExpSel');cont.innerHTML='';
 const volver=document.createElement('button');volver.className='od-exp-volver';
 volver.innerHTML=`<span class="od-exp-tx"><b>← Materias</b></span>`;
 volver.onclick=()=>{SND.tap();renderODExp();};cont.appendChild(volver);
 // Matemáticas: niveles de cálculo (ícono emoji, mismo estilo que el mapa del Reto).
 const esMate=HAY_RETO_CALCULO&&asig==='Matemáticas';
 const mapas=esMate?odMapasMate():odExpsDe(asig);
 mapas.forEach(e=>{const b=document.createElement('button');
  const ic=esMate?`<span class="od-exp-ic">${e.icono}</span>`
                 :`<img src="${portadaMapa(e)}" alt="" onerror="this.onerror=null;this.src='${portadaFallback(e)}'">`;
  const titulo=esMate?e.nombre:nombreMapa(e);
  const sub=esMate?e.sub:e.asignatura;
  b.innerHTML=`${ic}<span class="od-exp-tx"><b>${titulo}</b><small>${sub}</small></span>`;
  b.onclick=()=>{SND.tap();cont.querySelectorAll('button').forEach(x=>x.classList.remove('sel'));b.classList.add('sel');OD_EXP_SEL=e;};
  if(OD_EXP_SEL&&OD_EXP_SEL.id===e.id)b.classList.add('sel');
  cont.appendChild(b);});}
function abrirCrearDesafio(){renderODExp();$('odCodigo').value='';$('odSetupErr').textContent='';cargarJugadores();go('scr-od-setup');}
function responderDesafio(d){
 OD={preguntas:d.preguntas,idx:0,aciertos:0,tiempo:0,t:DUELO_SEG,timer:null,lock:false,modo:'responder',rivalCodigo:'',expedicion:d.expedicion,dueloId:d.id,rivalNombre:d.retador_nombre,expira:d.expira};
 SND.init();odPinta();
}
function odPinta(){
 const P=OD.preguntas[OD.idx];OD.lock=false;
 $('odTurn').textContent=OD.modo==='crear'?'Tu ronda':('Responde a '+OD.rivalNombre);
 $('odTag').textContent='Pregunta '+(OD.idx+1)+'/8';
 $('odText').innerHTML=FRAC.html(P.pregunta);$('odFb').textContent='';$('odFb').className='feedback';
 $('odProg').style.width=(OD.idx/8*100)+'%';
 if(OD.modo==='responder'&&OD.expira){$('odReloj').hidden=false;$('odReloj').textContent='⏳ Te quedan '+restante(OD.expira);}else $('odReloj').hidden=true;
 const orden=P.opciones.map((o,i)=>({o,i})).sort(()=>Math.random()-.5);
 const box=$('odOpts');box.innerHTML='';
 orden.forEach((it,k)=>{const b=document.createElement('div');b.className='opt';
  if(QA_MARCA&&it.i===P.correcta)b.classList.add('qa-ok');
  b.innerHTML=`<span class="key">${'ABCD'[k]}</span>${FRAC.html(it.o)}`;b.onclick=()=>odResponder(b,it.i===P.correcta);box.appendChild(b);});
 clearInterval(OD.timer);OD.t=DUELO_SEG;$('odTimer').textContent=OD.t;$('odTimer').className='timer';
 OD.timer=setInterval(()=>{OD.t--;$('odTimer').textContent=OD.t;if(OD.t<=5){$('odTimer').classList.add('low');if(OD.t>0)SND.tick();}
  if(OD.t<=0){clearInterval(OD.timer);odResponder(null,false);}},1000);
 go('scr-od-quiz');
}
function odResponder(el,ok){
 if(OD.lock)return;OD.lock=true;clearInterval(OD.timer);OD.tiempo+=(DUELO_SEG-OD.t);
 document.querySelectorAll('#odOpts .opt').forEach(o=>o.classList.add('off'));
 if(ok){OD.aciertos++;if(el){el.classList.remove('off');el.classList.add('ok');}$('odFb').textContent='✓ ¡Correcto!';$('odFb').classList.add('ok');SND.correct();}
 else{if(el){el.classList.remove('off');el.classList.add('bad');}$('odFb').textContent='✗ Incorrecto';$('odFb').classList.add('bad');SND.wrong();}
 setTimeout(()=>{OD.idx++;if(OD.idx<8)odPinta();else odFin();},ok?900:1400);
}

/* ===== Avisos de duelo en la pantalla de inicio (Sesion 76) =====
   El duelo asincrono estaba construido a medias: el RETADO ve su resultado al terminar de
   responder, pero el RETADOR no se enteraba NUNCA —kimun_historial existia desde la Sesion 6
   y ningun cliente la llamo jamas—. Desafiabas a alguien, contestaba al otro dia, y para ti
   el duelo quedaba en silencio para siempre.

   Vive en motor.js y no en cada fork porque no tiene ni un dato propio del curso: se escribe
   una vez y los tres cursos lo heredan. Copia el patron de revisarDesafio() (el banner del
   refuerzo del profe): best-effort, hidden por defecto y falla en silencio. */
let DUELO_AVISOS=[];
async function revisarDuelos(){
 const cont=$('bannerDuelo'); if(!cont) return;
 cont.hidden=true; DUELO_AVISOS=[];
 /* Con la puerta cerrada btnDuelo cae al duelo LOCAL, o sea que el duelo en linea es
    inalcanzable: anunciarlo seria ofrecer algo que no se puede tocar. Y sin perfil (enlaces
    de muestra, sin conexion) no hay a quien preguntarle. */
 if(!SB||!MI_PERFIL||bloqueado()) return;
 try{ const {data}=await SB.rpc('kimun_duelos_avisos'); DUELO_AVISOS=data||[]; }catch(e){ return; }
 pintarAvisoDuelo();
}
function pintarAvisoDuelo(){
 const cont=$('bannerDuelo'); if(!cont) return;
 cont.hidden=true;
 if(!DUELO_AVISOS.length) return;
 /* Los RESULTADOS van primero y de a uno: son noticia de una sola vez y se cierran. El
    desafio va despues porque queda vivo hasta jugarlo o hasta que expire a las 24 h, asi
    que no se pierde si hoy queda tapado. */
 const res=DUELO_AVISOS.find(a=>a.clase!=='desafio');
 if(res){
  const T={gane:['🏆','¡Ganaste tu duelo!'],perdi:['💪','Te ganaron esta vez'],
           empate:['🤝','¡Empataron!'],expiro:['⌛','Tu duelo venció']};
  const c=T[res.clase]||['⚔️','Tu duelo terminó'];
  /* escHtml: el nombre lo escribe otra persona —desde la Sesion 73 los autoinscritos
     escriben el suyo— y este proyecto ya tuvo un XSS almacenado por esta via exacta. */
  const linea=res.clase==='expiro'
   ? escHtml(res.rival)+' no alcanzó a responder'
   : 'Contra '+escHtml(res.rival)+' · '+res.mios+' a '+res.suyos;
  cont.innerHTML='<h4>'+c[0]+' '+c[1]+'</h4><p>'+linea+'</p><button id="btnDueloVisto">¡Entendido!</button>';
  $('btnDueloVisto').onclick=()=>{
   SND.tap();
   DUELO_AVISOS=DUELO_AVISOS.filter(a=>a.id!==res.id);
   pintarAvisoDuelo();                                  // encadena el siguiente, si hay
   try{Promise.resolve(SB.rpc('kimun_duelo_visto',{p_id:res.id})).catch(()=>{});}catch(e){}
  };
  cont.hidden=false; return;
 }
 const des=DUELO_AVISOS.filter(a=>a.clase==='desafio');
 cont.innerHTML='<h4>⚔️ Te desafiaron</h4><p>'+escHtml(des[0].rival)+' te está esperando'
  +(des.length>1?' · y '+(des.length-1)+' más':'')+'</p><button id="btnDueloIr">¡Jugar ahora!</button>';
 $('btnDueloIr').onclick=()=>{SND.init();SND.tap();$('nav').style.display='none';abrirDueloOnline();};
 cont.hidden=false;
}

/* ===== Ranking de duelos del curso (Sesion 76) =====
   Quien ha ganado mas duelos entre los companeros. El servidor deja fuera a los bots y
   acota al curso; aca solo se pinta. Reusa las clases .rk / .rk.top / .rk.me del ranking
   por XP, asi que no agrega ni una regla de CSS. */
const _RK_DIM='color:var(--dim);font-weight:800;font-size:13px';
async function cargarRankingDuelos(){
 const cont=$('rkDuelos'); if(!cont) return;
 cont.innerHTML='<p style="'+_RK_DIM+'">Cargando…</p>';
 if(!SB||!MI_PERFIL){ cont.innerHTML='<p style="'+_RK_DIM+'">Sin conexión.</p>'; return; }
 /* Sin curso el servidor devuelve vacio, y ahi "todavia nadie ha jugado" seria FALSO: no es
    que el curso no juegue, es que este jugador no tiene curso. Se dice lo que corresponde,
    igual que pintarSinCurso() en el ranking por XP. */
 if(!MI_PERFIL.curso_id){ cont.innerHTML='<p style="'+_RK_DIM+'">Pide tu código para entrar al ranking de duelos de tu curso.</p>'; return; }
 let d=[];
 try{ const {data,error}=await SB.rpc('kimun_ranking_duelos'); if(error)throw error; d=data||[]; }
 catch(e){ cont.innerHTML='<p style="'+_RK_DIM+'">No se pudo cargar.</p>'; return; }
 /* Vacio NO es lo mismo que "van 0": es que el curso todavia no juega duelos, y al empezar
    es el caso normal. Decir "sé el primero" invita; una tabla en blanco parece un error. */
 if(!d.length){ cont.innerHTML='<p style="'+_RK_DIM+'">Todavía nadie ha jugado un duelo contra un compañero. ¡Sé el primero! Los duelos contra Vale, Nico, Fran y Diego no cuentan: son para practicar.</p>'; return; }
 cont.innerHTML=d.map((r,i)=>
  '<div class="rk'+(i<3?' top':'')+(r.soy_yo?' me':'')+'">'
  +'<div class="pos">'+(i+1)+'</div>'
  +'<div class="em">'+escHtml(r.avatar||'🦊')+'</div>'
  +'<div>'+escHtml(r.nombre)+'</div>'
  +'<div class="pts">'+r.ganados+' G · '+r.perdidos+' P</div></div>').join('');
}

/* ── Puerta de acceso, enlaces de muestra, armador y canje ─────────────────────────────────────────────────── */
function b64uDec(txt){
 try{ return atob(String(txt).replace(/-/g,'+').replace(/_/g,'/')); }catch(e){ return ''; }
}
/* Token de muestra: "ids separados por coma | AAAA-MM-DD | 1 si respuestas".
   Devuelve null si no se puede leer, y quien lo llama cae al juego normal. */
function leerToken(t){
 if(!t) return null;
 const crudo=b64uDec(t); if(!crudo) return null;
 const p=crudo.split('|');
 // Se exige forma de id (letras, numeros y guiones). Sin esto, un texto cualquiera que
 // por casualidad sea base64 valido ('xxxx') pasaba como token y devolvia basura.
 const ids=(p[0]||'').split(',').map(s=>s.trim()).filter(x=>/^[a-z0-9-]+$/i.test(x));
 if(!ids.length) return null;
 const hasta=/^\d{4}-\d{2}-\d{2}$/.test(p[1]||'') ? p[1] : '';
 // 4.º campo: modo revisión de profesor. Un token viejo no lo trae y sigue valiendo.
 return { ids:ids, hasta:hasta, qa:(p[2]||'')==='1', rev:(p[3]||'')==='1' };
}
/* Fecha local del dispositivo como AAAA-MM-DD (no UTC: interesa el día del visitante). */
function hoyISO(){
 const d=new Date(), z=n=>String(n).padStart(2,'0');
 return d.getFullYear()+'-'+z(d.getMonth()+1)+'-'+z(d.getDate());
}
function extraPorId(id){ const x=EXTRAS.find(e=>e.id===id); return (x&&x.disponible())?x:null; }
/* La licencia se consulta EN VIVO (no se congela al arrancar): si el alumno canjea su
   código a mitad de sesión, la puerta se abre sin recargar la página. */
function tieneLicencia(){ return !!S.alumno; }
/* Excepciones incorporadas: los enlaces de muestra y ?qa=1 nunca pasan por la puerta. */
function bloqueado(){ return PUERTA && !PRUEBA && !QA && !tieneLicencia(); }
function capAbierto(id){ return !bloqueado() || id===DEMO_LIBRE; }
/* Mensaje único cuando se toca algo cerrado. */
function avisoCandado(){ alert('🔒 Necesitas un código de tu profesor para abrir esta parte de VULPO.\n\n¿Eres profesor? Escríbenos a vulpochile.app@gmail.com'); }
/* Remate de la demo: en vez del capítulo siguiente, la invitación a conseguir un código. */
function mostrarFinDemo(){
 $('demoContacto').hidden=true;
 $('demoCodigo').onclick=()=>{SND.tap();abrirCanje();};
 $('demoProfe').onclick=()=>{SND.tap();$('demoContacto').hidden=false;};
 $('nav').style.display='none';
 go('scr-demo-fin');
}
/* '2026-09-15' -> '15 de septiembre de 2026'. La usan el resumen y el lector. */
function fechaLarga(iso){
 const MESES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto',
              'septiembre','octubre','noviembre','diciembre'];
 const p=(iso||'').split('-');
 if(p.length!==3) return iso||'';
 return Number(p[2])+' de '+MESES[Number(p[1])-1]+' de '+p[0];
}
function armarUrl(){
 const ids=[...document.querySelectorAll('#armarLista input[type=checkbox]:checked')].map(c=>c.value);
 const hasta=$('armarHasta').value||'';
 const qa=$('armarQA').checked;
 const rev=$('armarRev').checked;
 const url=ids.length
   ? location.origin+location.pathname+'?m='+b64uCod(
       ids.join(',')+'|'+hasta+'|'+(qa?'1':'')+'|'+(rev?'1':''))
   : '';
 $('armarUrl').value=url||'Marca al menos un capítulo';
 $('armarCopiar').disabled=!url; $('armarProbar').disabled=!url;
 // Categorías sensibles incluidas en los capítulos marcados (assets/js/sensible.js).
 const scat=Object.keys(SENSIBLE.cats).filter(c=>
   ids.some(id=>{const e=EXPEDICIONES.find(x=>x.id===id); return e&&SENSIBLE.deExpedicion(e).includes(c);}))
   .map(c=>SENSIBLE.cats[c].icono+' '+SENSIBLE.cats[c].nombre).join(', ');
 $('armarResumen').textContent = url
   ? ids.length+(ids.length===1?' capítulo':' capítulos')
     +(hasta?' · vence el '+fechaLarga(hasta):' · sin caducidad')
     +(qa?' · con respuestas':'')
     +(rev?' · REVISIÓN de profesor (3 por etapa)':'')
     +(scat?' · incluye: '+scat:'')
   : '';
 return url;
}
function arrancarArmador(){
 const cont=$('armarLista'); cont.innerHTML='';
 const activas=EXPEDICIONES.filter(e=>e.activa);
 // Leyenda de contenido sensible: solo las categorías presentes en este nivel (assets/js/sensible.js).
 const catsPresentes=Object.keys(SENSIBLE.cats).filter(c=>
   activas.some(e=>SENSIBLE.deExpedicion(e).includes(c)));
 if(catsPresentes.length){
  const ley=document.createElement('div'); ley.className='sens-leyenda';
  ley.innerHTML='<b>Contenido sensible:</b> '+catsPresentes.map(c=>
    `<span style="color:${SENSIBLE.cats[c].color}">${SENSIBLE.cats[c].icono} ${SENSIBLE.cats[c].nombre}</span>`).join('&nbsp;&nbsp;&nbsp;');
  cont.appendChild(ley);
 }
 const asigs=[...new Set(activas.map(e=>e.asignatura).concat(EXTRAS.filter(x=>x.disponible()).map(x=>x.asignatura)))]
   .sort((a,b)=>((ORDEN_ASIG.indexOf(a)+1)||99)-((ORDEN_ASIG.indexOf(b)+1)||99));
 asigs.forEach(asig=>{
  const h=document.createElement('h3');
  h.textContent=asig; h.style.cssText='color:var(--cyan);font-size:14px;margin:14px 0 6px';
  cont.appendChild(h);
  activas.filter(e=>e.asignatura===asig).forEach(exp=>{
   const camp=exp.campaña?campañaPorId(exp.campaña):null;
   const i=camp?camp.capitulos.indexOf(exp.id):-1;
   const l=document.createElement('label');
   l.style.cssText='display:flex;gap:8px;align-items:center;font-size:13px;font-weight:700;padding:4px 0';
   const sc=SENSIBLE.deExpedicion(exp);
   const marcas=sc.map(c=>`<span class="sens-m" style="background:${SENSIBLE.cats[c].color}33" title="${SENSIBLE.cats[c].nombre}">${SENSIBLE.cats[c].icono}</span>`).join('');
   l.innerHTML=`<input type="checkbox" value="${exp.id}"><span>${i>=0?(i+1)+'. ':''}${nombreMapa(exp)}</span>${marcas}`;
   cont.appendChild(l);
  });
  // Los módulos de esta asignatura que no son expediciones (ver EXTRAS).
  EXTRAS.filter(x=>x.asignatura===asig && x.disponible()).forEach(x=>{
   const l=document.createElement('label');
   l.style.cssText='display:flex;gap:8px;align-items:center;font-size:13px;font-weight:700;padding:4px 0';
   l.innerHTML=`<input type="checkbox" value="${x.id}"><span>${x.icono} ${x.nombre}</span>`;
   cont.appendChild(l);
  });
 });
 cont.addEventListener('change',armarUrl);
 $('armarQA').onchange=armarUrl;
 $('armarRev').onchange=armarUrl;
 $('armarCopiar').onclick=()=>{
  const u=armarUrl(); if(!u) return;
  Promise.resolve(navigator.clipboard&&navigator.clipboard.writeText(u))
   .then(()=>{ $('armarMsg').textContent='Enlace copiado.'; })
   .catch(()=>{ $('armarUrl').select(); $('armarMsg').textContent='Selecciona y copia con Ctrl+C.'; });
 };
 $('armarProbar').onclick=()=>{ const u=armarUrl(); if(u) window.open(u,'_blank'); };
 const enDias=n=>{ const d=new Date(); d.setDate(d.getDate()+n);
   const z=x=>String(x).padStart(2,'0');
   return d.getFullYear()+'-'+z(d.getMonth()+1)+'-'+z(d.getDate()); };
 $('armarHasta').onchange=armarUrl;
 $('armarSinFin').onclick=()=>{ $('armarHasta').value=''; armarUrl(); };
 $('armarSemana').onclick=()=>{ $('armarHasta').value=enDias(7); armarUrl(); };
 $('armarMes').onclick=()=>{ $('armarHasta').value=enDias(30); armarUrl(); };
 $('armarHasta').min=hoyISO();          // no ofrecer fechas ya pasadas
 $('armarLeerBtn').onclick=()=>{
  const txt=($('armarLeer').value||'').trim();
  const t=(txt.match(/[?&]m=([^&\s]+)/)||[])[1] || txt;   // acepta enlace completo o token suelto
  const d=leerToken(t);
  if(!d){ $('armarLeido').textContent='No pude leer ese enlace.'; return; }
  // Los EXTRAS no estan en EXPEDICIONES: sin este respaldo el lector mostraba el id crudo
  // ("reto-calculo") en vez de su nombre.
  const nombres=d.ids.map(id=>{const e=EXPEDICIONES.find(x=>x.id===id); if(e) return nombreMapa(e);
    const x=EXTRAS.find(v=>v.id===id); return x?x.nombre:id;});
  const estado=!d.hasta ? 'Sin caducidad.'
    : (hoyISO()>d.hasta ? 'VENCIÓ el '+fechaLarga(d.hasta)+'.' : 'Vence el '+fechaLarga(d.hasta)+'.');
  $('armarLeido').textContent=nombres.join(' · ')+' — '+estado+(d.qa?' Con respuestas.':'')
    +(d.rev?' MODO REVISIÓN de profesor.':'');
 };
 armarUrl();
 $('nav').style.display='none';
 go('scr-armar');
}
/* Pantalla de muestra vencida. No da acceso a los capítulos, pero sí al juego completo:
   VULPO es público, así que caducar el enlace apaga la muestra, no el juego. */
function mostrarVencida(){
 const MESES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto',
              'septiembre','octubre','noviembre','diciembre'];
 const p=VENCE.split('-');
 $('vencidaFecha').textContent='Venció el '+Number(p[2])+' de '+MESES[Number(p[1])-1]+' de '+p[0]+'.';
 $('vencidaIr').onclick=()=>{ location.href=location.origin+location.pathname; };
 $('nav').style.display='none';
 go('scr-vencida');
}
/* Modo prueba (?solo=): entra como invitado y abre su propia lista de capítulos,
   saltándose "¿Cómo quieres entrar?" y la pantalla de nombre/avatar. */
function arrancarModoPrueba(){
 S.nombre='Invitado'; S.avatar=AVATARES[4];   // 🦊, la mascota
 $('nav').style.display='none';
 renderListaPrueba();
}
function arrancarInscripcion(){
 $('nav').style.display='none';          // la barra inferior no va encima de esta pantalla
 $('insForm').hidden=false; $('insListo').hidden=true;
 $('insMsg').textContent=''; $('insNombre').value=S.nombre||'';
 go('scr-inscribir');
}
/* Una sola recarga por pestaña. Si algo saliera mal —el servidor devolviendo una cosa
   y el disco guardando otra— el guard evita que el juego quede recargándose en bucle,
   que es peor que quedarse con el modo viejo. */
function recargarPorModo(){
 try{
  if(sessionStorage.getItem(EXPER_KEY+'_rc')==='1') return;
  sessionStorage.setItem(EXPER_KEY+'_rc','1');
 }catch(e){ return; }
 location.reload();
}
function abrirCanje(){
 const actual=document.querySelector('.screen.on');
 CANJE_VUELVE=(actual&&actual.id!=='scr-canje')?actual.id:'scr-rol';
 $('nav').style.display='none';                 // la barra inferior no va encima de esta pantalla
 $('canjeMsg').textContent='';$('canjeCodigo').value='';
 go('scr-canje');
}
function cerrarCanje(){
 const destino=CANJE_VUELVE;
 // La barra inferior solo reaparece si volvemos al mapa, que es la pantalla que la usa.
 $('nav').style.display=(destino==='scr-mapa')?'flex':'none';
 if(destino==='scr-mapa') renderRanking();      // al volver al mapa, con el ranking al día
 go(destino);
}

/* ── Navegación, campaña, mapa, tienda y perfil ─────────────────────────────────────────────────── */
/* Con la puerta cerrada, la barra inferior deja solo el Mapa. */
function ajustarNav(){
 const cerrado=bloqueado();
 document.querySelectorAll('#nav button').forEach(b=>{
  const destino=b.dataset.go;
  if(destino==='scr-tienda'||destino==='perfil') b.style.display=cerrado?'none':'';
 });
}
/* ================= UTIL ================= */
function go(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('on'));$(id).classList.add('on');window.scrollTo(0,0);
 var enJuego=(id==='scr-mapa'||id==='scr-quiz'||id==='scr-res');
 document.body.classList.toggle('en-dificil', enJuego && MODO==='dificil');
 if(id==='scr-rol'){pintarInicio();revisarDesafio();revisarDuelos();}
 callarVoz();   // ninguna pantalla hereda la lectura de la anterior
 REV.barra();   // modo revisión: la barra se oculta sola en su propia pantalla
 MUSIC.contexto(id);}
// Saluda al alumno por su nombre (mismas letras que VULPO) si canjeó un código.
function pintarInicio(){const el=$('rolNombre'),sub=$('rolSub');if(!el)return;
 if(S.alumno){el.textContent='¡Hola, '+S.alumno+'!';el.hidden=false;if(sub)sub.hidden=true;}
 else{el.hidden=true;if(sub)sub.hidden=false;}
 const av=$('avisoPuerta');
 if(av){
  av.hidden=!AVISO_PUERTA;
  if(AVISO_PUERTA) $('avisoPuertaTxt').textContent=
    'Desde el '+fechaLarga(FECHA_PUERTA)+' necesitarás un código de tu profesor para seguir jugando.';
 }}
function toast(l){if(S.logros.has(l))return;S.logros.add(l);SND.unlock();
 $('toastIc').textContent=LOGROS[l].ic;$('toastTx').textContent=LOGROS[l].tx;
 $('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),2600);}
function particulas(x,y,emojis,n=14){
 for(let i=0;i<n;i++){const p=document.createElement('span');p.className='pt';
  p.textContent=emojis[Math.floor(Math.random()*emojis.length)];
  p.style.left=x+'px';p.style.top=y+'px';
  p.style.setProperty('--dx',(Math.random()*220-110)+'px');
  p.style.setProperty('--dy',(Math.random()*-180-40)+'px');
  p.style.setProperty('--rot',(Math.random()*360)+'deg');
  document.body.appendChild(p);setTimeout(()=>p.remove(),1000);}}
function comboFx(n){const c=$('combo');c.textContent='COMBO x'+n+' 🔥';
 c.classList.remove('show');void c.offsetWidth;c.classList.add('show');}
function refreshHud(){
 $('hudAv').innerHTML=avatarHTML(S.avatar);
 $('hudName').textContent=insigniaIc()+S.nombre;
 const dentro=S.xp % XP_POR_NIVEL;
 const nuevoNivel=Math.floor(S.xp/XP_POR_NIVEL)+1;
 if(S._lastNivel!=null && nuevoNivel>S._lastNivel) levelUpFx(nuevoNivel);
 S._lastNivel=nuevoNivel; S.nivel=nuevoNivel;
 $('hudXp').style.width=(dentro/XP_POR_NIVEL*100)+'%';
 $('hudLvl').textContent='Nivel '+S.nivel+' · '+S.xp+' XP';
 $('hudCoins').textContent=S.monedas;}
function levelUpFx(n){
 SND.levelup();
 const el=$('levelup');el.querySelector('.lvl-num').textContent='NIVEL '+n;
 el.classList.remove('show');void el.offsetWidth;el.classList.add('show');
 particulas(window.innerWidth/2,window.innerHeight/2,['⭐','✨','🎉','💫','🌟'],30);
 setTimeout(()=>el.classList.remove('show'),1900);}
function kimReact(estado, id){
 const el=$(id||'kimBuddy');if(!el)return;
 const [img,cls]=KIM_REACT[estado]||KIM_REACT.neutral;
 el.src='assets/kimun-'+img+'.png';
 el.className='kim-buddy';void el.offsetWidth;
 if(cls)el.classList.add(cls);
}
/* Comentario/dato de Vulpi al iniciar la ruta: revela al azar una pregunta y su respuesta */
function datoKimun(){
 const bub=$('kimDato');if(!bub)return;
 let todas=[];Object.keys(POOL).forEach(oa=>{todas=todas.concat(POOL[oa]);});
 if(!todas.length){bub.hidden=true;return;}
 const q=todas[Math.floor(Math.random()*todas.length)];
 const cont=$('kimDatoTxt');cont.innerHTML='';
 const p=document.createElement('div');p.className='kd-q';p.textContent='¿Sabías esto? '+q.pregunta;
 const r=document.createElement('div');r.className='kd-a';r.textContent='➜ '+q.opciones[q.correcta];
 cont.append(p,r);
 bub.hidden=false;bub.classList.remove('show');void bub.offsetWidth;bub.classList.add('show');
 clearTimeout(datoKimun._t);
 datoKimun._t=setTimeout(()=>{bub.classList.remove('show');setTimeout(()=>{bub.hidden=true;},400);},10000);
}
// Detiene cualquier temporizador/avance en curso (quiz, Reto de Cálculo, duelo) para que
// no siga corriendo de fondo al cambiar de pantalla por la barra inferior u otro atajo.
function detenerTimersActivos(){ clearInterval(Q.timer); clearTimeout(Q._avanzarT); if(HAY_RETO_CALCULO){clearInterval(RC.timer); clearTimeout(RC._resolveT);} clearInterval(D.timer); CALC.detener(); }
function campañaDe(asig){return CAMPAÑAS.find(c=>c.asignatura===asig)||null;}
function campañaPorId(id){return CAMPAÑAS.find(c=>c.id===id)||null;}
/* Portada del mapa/capítulo, EXPLÍCITA: sale del campo `portadaMapa` de la expedición, con
   `portada` (la de su unidad o asignatura) como respaldo.
   ⚠️ Antes 8° la armaba por CONVENCIÓN implícita (`assets/portada-<id>.png`). Eso pedía un
   archivo por expedición y, en cuanto un curso no tiene arte propio, son 404 que el `onerror`
   tapa A LA VISTA PERO NO EN LA RED: 7° pedía 22 inexistentes y 3° siete. Medido el 31/08,
   en 8° eran 6 —las cuatro mate-exp-* y Ana Frank— salvados solo por que ninguna pantalla
   llamaba aquí con ellas. Al crear el arte de un capítulo se le agrega `portadaMapa:'…'`. */
function portadaMapa(exp){return exp.portadaMapa||exp.portada||portadaFallback(exp);}
function portadaFallback(exp){return ASIG_PORTADA[exp.asignatura]||exp.portada||'';}
// Nombre corto del mapa a partir del nivel ("8° Básico · La célula" -> "La célula")
function nombreMapa(exp){const p=(exp.nivel||'').split('·');return p.length>1?p.slice(1).join('·').trim():(exp.nivel||exp.asignatura);}
// Expediciones sueltas (no campaña) y activas de una asignatura
function mapasDe(asig){return EXPEDICIONES.filter(e=>e.activa&&e.asignatura===asig&&!e.campaña);}
// NIVEL 1: un módulo por asignatura
function renderExpediciones(){
 ajustarNav();
 const g=$('expGrid');g.innerHTML='';
 ORDEN_ASIG.forEach(asig=>{
  const camp=CAMPAÑAS.find(c=>c.asignatura===asig);
  /* ¿Esta asignatura se juega como camino de mini-clases? Es una propiedad de SU campaña
     —que tenga capitulosMate—, no el nombre de la asignatura ni el id que le tocó a 8°.
     Antes decía asig==='Matemáticas' y buscaba la campaña por id 'mate': en 7° se llama
     'mate7' y en 5° 'mate5', así que devolvía undefined y reventaba aquí. Y como esto
     corre ANTES del go('scr-expediciones'), el botón JUGADOR no navegaba y el curso
     quedaba inalcanzable SIN NINGÚN ERROR de consola. 3° se salvaba de casualidad, por
     escribir 'Matemática' en singular. Es el mismo patrón de las Sesiones 63, 64, 69 y 72:
     un `if` sobre el nombre de la asignatura no dice si el nivel tiene esa funcionalidad. */
  if(HAY_MINICLASES && camp && camp.capitulosMate){    // campaña de lecciones + Reto
   const cap0=camp.capitulosMate[0];
   const nHechas=cap0.lecciones.filter(id=>S.mateLecciones[id]).length;
   const card=document.createElement('div');card.className='exp-card';
   card.innerHTML=`<img src="${camp.portada||ASIG_PORTADA[asig]}" alt="${asig}"><div class="exp-info"><b>${asig}</b><small>Aprende y practica · ${cap0.titulo} ${nHechas}/${cap0.lecciones.length}</small></div><span class="exp-go">▶</span>`;
   card.onclick=()=>{SND.tap(); if(bloqueado()){avisoCandado();return;} abrirCampaña(camp);};
   if(bloqueado()) card.classList.add('lock');
   g.appendChild(card); return;
  }
  const exps=mapasDe(asig);
  if(!camp&&!exps.length)return;                       // sin contenido: no se muestra
  const portada=camp?camp.portada:(ASIG_PORTADA[asig]||exps[0].portada);
  const done=camp?campañaCompleta(camp):false;
  const sub=camp?`Campaña · ${capsCompletos(camp)}/${camp.capitulos.length} capítulos`
                :`${exps.length} ${exps.length===1?'mapa':'mapas'}`;
  const card=document.createElement('div');card.className='exp-card'+(done?' camp-done':'');
  const subL=(HAY_VOCABULARIO&&asig==='Lenguaje')?'Campaña + Vocabulario':sub;
  card.innerHTML=`<img src="${portada}" alt="${asig}"><div class="exp-info"><b>${asig} ${done?'👑':''}</b><small>${subL}</small></div><span class="exp-go">▶</span>`;
  card.onclick=()=>{SND.tap();
   // Historia entra siempre: dentro se decide qué capítulo está abierto (la demo).
   if(bloqueado() && asig!=='Historia'){avisoCandado();return;}
   if(HAY_VOCABULARIO&&asig==='Lenguaje')abrirLenguaje(); else if(camp)abrirCampaña(camp); else abrirAsignatura(asig);};
  if(bloqueado() && asig!=='Historia') card.classList.add('lock');
  g.appendChild(card);
 });
 // Módulo Lectura (biblioteca): fuera de las asignaturas, crece con más libros.
 if(HAY_BIBLIOTECA){
 const bib=document.createElement('div'); bib.className='exp-card bib-entry';
 bib.innerHTML=`<img src="assets/portada-lectura.png" alt="Lectura"><div class="exp-info"><b>📖 Lectura</b><small>Lecturas del colegio · ${LIBROS.length} libro${LIBROS.length===1?'':'s'}</small></div><span class="exp-go">▶</span>`;
 bib.onclick=()=>{SND.tap(); if(bloqueado()){avisoCandado();return;} abrirBiblioteca();};
 if(bloqueado()) bib.classList.add('lock');
 g.appendChild(bib);
 }
}
function abrirBiblioteca(){
 const g=$('biblioGrid'); g.innerHTML='';
 LIBROS.forEach(lb=>{const exp=EXPEDICIONES.find(e=>e.id===lb.id);
  const card=document.createElement('div'); card.className='exp-card';
  card.innerHTML=`<img src="${exp.portada}" alt="" onerror="this.onerror=null;this.src='assets/portada-lenguaje.png'"><div class="exp-info"><b>${lb.titulo}</b><small>${lb.autor} · ${lb.tramos} tramos</small></div><span class="exp-go">▶</span>`;
  card.onclick=()=>{SND.tap();entrarExpedicion(exp);};
  g.appendChild(card);});
 go('scr-biblioteca');
}
// Landing de Lenguaje: elegir entre la Campaña y el Vocabulario.
function abrirLenguaje(){ go('scr-lenguaje'); }
// NIVEL 2: los mapas de una asignatura (sin campaña), cada uno con su portada propia
function abrirAsignatura(asig){
 const exps=mapasDe(asig);
 $('mapasHead').innerHTML=`<h1 style="font-size:26px">${asig}</h1><p>Elige un mapa</p>`;
 const g=$('mapasGrid');g.innerHTML='';
 exps.forEach(exp=>{
  const card=document.createElement('div');card.className='exp-card';
  card.innerHTML=`<img src="${portadaMapa(exp)}" alt="${nombreMapa(exp)}" onerror="this.onerror=null;this.src='${portadaFallback(exp)}'"><div class="exp-info"><b>${nombreMapa(exp)}</b><small>${exp.nivel}</small></div><span class="exp-go">▶</span>`;
  card.onclick=()=>{SND.tap();entrarExpedicion(exp);};
  g.appendChild(card);
 });
 go('scr-mapas');
}
function entrarExpedicion(exp){
 if(!exp.activa){alert('🚀 La expedición de '+exp.asignatura+' viene pronto. ¡Sigue explorando Historia!');return;}
 // En modo prueba el invitado ya tiene nombre y avatar: nunca pasa por scr-inicio.
 const tienePartida=PRUEBA?true:hayPartida();
 if(tienePartida && !PRUEBA) cargar();
 activarExpedicion(exp).then(()=>{
  if(tienePartida){refreshHud();renderMapa();renderRanking();
   $('nav').style.display=PRUEBA?'none':'flex';ajustarNav();go('scr-mapa');datoKimun();}
  else go('scr-inicio');
 });
}
/* Lista propia del modo prueba: dibuja EXACTAMENTE los capítulos de ?solo=, vengan de la
   asignatura que vengan. No se reutiliza la pantalla de campaña porque esa es de UNA
   asignatura y, en Matemáticas, delega en renderCampañaMate (donde el filtro no llegaba:
   ?solo=mate-* abría la campaña entera). Reusa scr-campana para no agregar marcado. */
function renderListaPrueba(){
 if($('btnCampBack')) $('btnCampBack').style.display='none';   // no hay a dónde volver
 const exps=SOLO.map(id=>EXPEDICIONES.find(e=>e.id===id)).filter(Boolean);
 const extras=SOLO.map(extraPorId).filter(Boolean);
 const asigs=[...new Set(exps.map(e=>e.asignatura).concat(extras.map(x=>x.asignatura)))];
 $('campHead').innerHTML=`<h1 style="font-size:26px">Modo prueba</h1><p>${asigs.join(' · ')}</p>`;
 const cont=$('campNodos'); cont.innerHTML='';
 exps.forEach(exp=>{
  const camp=exp.campaña?campañaPorId(exp.campaña):null;
  const i=camp?camp.capitulos.indexOf(exp.id):-1;
  const hecho=expedicionCompleta(exp.id);
  cont.appendChild(nodoCampañaEl(i>=0?`${i+1}`:'📘', nombreMapa(exp), true, hecho,
    ()=>entrarExpedicion(exp), hecho?'Completado':'¡Jugar!',
    portadaMapa(exp), portadaFallback(exp)));
 });
 extras.forEach(x=>{
  cont.appendChild(nodoCampañaEl(x.icono, x.nombre, true, false,
    ()=>x.abrir(), '¡Jugar!', ''));
 });
 go('scr-campana');
}
function abrirCampaña(c){CAMP_ACT=c; renderCampaña(); go('scr-campana');}
function renderCampaña(){
 const c=CAMP_ACT; if(!c)return;
 // renderCampana devuelve false si el modulo no cargo: se sigue de largo con la campana
 // normal en vez de dejar la pantalla en blanco.
 if(HAY_MINICLASES&&c.esLecciones&&LECC.renderCampana(c)) return;
 $('campHead').innerHTML=`<h1 style="font-size:26px">${c.asignatura} ${campañaCompleta(c)?'👑':''}</h1><p>${c.intro}</p>`;
 const cont=$('campNodos'); cont.innerHTML='';
 // capítulos en orden
 c.capitulos.forEach((id,i)=>{
  const exp=EXPEDICIONES.find(e=>e.id===id);
  const abierto=capAbierto(id) && nodoCampDesbloqueado(c,i), hecho=expedicionCompleta(id);
  const titulo=(exp.nivel.split('· ')[1]||exp.nivel);
  cont.appendChild(nodoCampañaEl(`${i+1}`, titulo, abierto, hecho,
    abierto?()=>entrarExpedicion(exp):null,
    hecho?'Completado':(abierto?'¡Jugar!':(capAbierto(id)?'🔒 Bloqueado':'🔒 Necesitas un código')),
    portadaMapa(exp), portadaFallback(exp)));
 });
 // desafío extra (solo si la campaña lo define). Con la puerta cerrada no se muestra.
 if(c.desafioExtra && !bloqueado()){
  const de=EXPEDICIONES.find(e=>e.id===c.desafioExtra);
  const deAb=desafioDesbloqueado(c), deHecho=expedicionCompleta(c.desafioExtra);
  cont.appendChild(nodoCampañaEl('⭐','Desafío Extra: Chile hoy', deAb, deHecho,
    deAb?()=>entrarExpedicion(de):null, deHecho?'Completado':(deAb?'¡Desafío!':'🔒 Termina los capítulos'),
    portadaMapa(de), portadaFallback(de)));
 }
 // jefe final (luce al villano de la campaña). Con la puerta cerrada no se muestra.
 if(!bloqueado()){
  const jfAb=jefeFinalDesbloqueado(c), jfHecho=campañaCompleta(c);
  cont.appendChild(nodoCampañaEl('👑','JEFE FINAL DE '+c.asignatura.toUpperCase(), jfAb, jfHecho,
    jfAb?()=>iniciarJefeFinal(c):null, jfHecho?'¡Vencido!':(jfAb?'¡Al 100%! Enfréntalo':'🔒 Completa todo'),
    c.jefeFinal.villanoImg||''));
 }
 // Reto Sin Fin. Dos condiciones, y cada una responde algo distinto:
 //  · CALC.activo  -> ¿está DISPONIBLE? Es false si assets/js/calculo.js no cargó. Con la
 //    bandera del nivel a secas, un 404 dejaba el botón dibujado y muerto: el alumno toca y
 //    no pasa nada, el mismo defecto del botón de mini-clase de la Sesión 64.
 //  · c.sinfin     -> ¿esta CAMPAÑA lo ofrece? Va como campo de la campaña y NO como
 //    comparación contra el nombre de la asignatura. Ese `if` sobre el nombre es el patrón
 //    que causó los bugs de las Sesiones 63 y 64 —no dice si el nivel tiene la
 //    funcionalidad— y encima se rompe solo entre forks: 3° escribe 'Matemática' en
 //    singular, así que la comparación en plural nunca habría entrado.
 // Con las dos, esta función queda byte a byte igual en los tres cursos.
 nodoSinFin(c,cont);
}
/* El nodo del Reto Sin Fin lo dibujan DOS pantallas: la campaña normal y la de mini-clases
   (renderCampañaMate, en assets/js/lecciones.js). Vive aquí una sola vez porque duplicarlo
   es justo lo que este módulo vino a deshacer: al encender esLecciones en 7° y 3°, su Reto
   Sin Fin —que ya tenían— se habría perdido sin ningún error. */
function nodoSinFin(c,cont){
 if(CALC.activo && c.sinfin && !bloqueado()){
  const sf=document.createElement('div'); sf.className='camp-nodo';
  sf.innerHTML=`<div class="cn-marco"><div class="cn-circ" style="background:#8f6bff22">♾️</div></div>`+
    `<div class="cn-body"><b>Reto Sin Fin</b><small>Récord: ${(S.sinfin&&S.sinfin.record)||0} seguidas</small></div>`;
  sf.onclick=()=>{SND.tap();CALC.abrir();};
  cont.appendChild(sf);
 }
}
// img/imgAlt: portada del capítulo (o villano del jefe). Sin imagen, el círculo lleva la marca.
function nodoCampañaEl(marca,titulo,abierto,hecho,onClick,estado,img,imgAlt){
 const d=document.createElement('div');
 d.className='camp-nodo'+(abierto?'':' lock')+(hecho?' done':'');
 const circ=img
  ?`<div class="cn-circ cn-img"><img src="${img}" alt=""${imgAlt?` onerror="this.onerror=null;this.src='${imgAlt}'"`:''}></div><span class="cn-badge">${hecho?'✓':(abierto?marca:'🔒')}</span>`
  :`<div class="cn-circ">${hecho?'✓':marca}</div>`;
 d.innerHTML=`<div class="cn-marco">${circ}</div><div class="cn-body"><b>${titulo}</b><small>${estado}</small></div>`;
 if(onClick) d.onclick=()=>{SND.tap();onClick();};
 return d;
}
/* ================= MAPA ================= */
function renderMapa(){
 renderModoSel();
 const bc=$('btnMapaCamp');
 if(bc){ bc.style.display='block';
  bc.textContent=(EXP_ACT&&EXP_ACT.campaña)?'← Volver a la campaña':'← Volver'; }
 if($('mapaSub'))$('mapaSub').textContent=EXP_ACT.nivel;
 if($('mapaImg'))$('mapaImg').src=EXP_ACT.mapaImg||EXP_ACT.portada;
 const box=$('mapbox');box.innerHTML='';
 EXPEDICION.forEach((n,i)=>{
  const p=progAct()[i];
  const d=document.createElement('div');d.className='node '+p.est;
  const est=p.est==='done'?'✓ Completado':(p.est==='open'?'▶ ¡Jugar ahora!':'🔒 Bloqueado');
  const stars=p.estrellas?'★'.repeat(p.estrellas)+'☆'.repeat(3-p.estrellas):'';
  d.innerHTML=`<div class="orb">${p.est==='lock'?'🔒':n.icono}</div>
   <div class="info"><b>${i+1}. ${n.nombre}</b><small>${est}</small>
   <div class="stars-mini">${stars}</div></div>`;
  d.querySelector('.orb').onclick=()=>{if(p.est!=='lock')startQuiz(i);};
  box.appendChild(d);});
 // La introducción del capítulo, si la declara. Va DESPUÉS del bucle y se inserta al
 // principio: así no entra en el arreglo indexado y no corre el avance ya guardado.
 // Sin `intro` en los datos no pasa nada, y sin el módulo tampoco (su respaldo devuelve false).
 if(EXP_ACT.intro) LECC.nodoIntro(EXP_ACT.intro, box);
}
function renderModoSel(){
 const el=$('modoSel');if(!el)return;
 if(!HAY_DIFICIL||!S.dificilDesbloqueado){el.style.display='none';el.innerHTML='';return;}
 el.style.display='flex';
 el.innerHTML=`<button class="${MODO==='normal'?'on':''}" data-m="normal">🗺️ Normal</button>`+
  `<button class="dif ${MODO==='dificil'?'on':''}" data-m="dificil">🔥 Difícil</button>`;
 el.querySelectorAll('button').forEach(b=>b.onclick=()=>{SND.tap();MODO=b.dataset.m;
  document.body.classList.toggle('en-dificil', MODO==='dificil');renderMapa();});
}
// Si el avatar equipado es una skin con imagen, devuelve su ruta; si no, null.
function skinImg(av){const s=SKINS.find(k=>k.e===av&&k.img);return s?s.img:null;}
// HTML del avatar: <img> si la skin tiene imagen, o el emoji tal cual.
function avatarHTML(av){const img=skinImg(av);return img?`<img src="${img}" alt="avatar">`:av;}
function renderTienda(){
 $('tiendaCoins').textContent=S.monedas;
 const g=$('tiendaGrid');g.innerHTML='';
 SKINS.forEach(sk=>{
  const owned=S.skins.includes(sk.e), equipped=S.avatar===sk.e;
  const bloqueada=sk.bloqueada&&!owned;   // exclusiva aún no ganada
  const em=sk.img?`<img src="${sk.img}" alt="${sk.nombre||''}">`:sk.e; // imagen o emoji
  const it=document.createElement('div');it.className='shop-item'+(equipped?' equipped':'')+(bloqueada?' locked':'');
  if(bloqueada){ // visible pero no comprable: se gana venciendo al Jefe Final
   it.innerHTML=`<div class="em">${em}</div><div class="price">🔒 ${sk.req||'Bloqueada'}</div>`+
     `<div class="skin-lock">${sk.nombre||'Skin exclusiva'}</div>`;
   g.appendChild(it); return;
  }
  let btn;
  if(equipped)btn='<button class="on" disabled>✓ Equipado</button>';
  else if(owned)btn='<button class="equip">Equipar</button>';
  else btn=`<button class="buy"${S.monedas<sk.p?' disabled':''}>Comprar 🪙${sk.p}</button>`;
  const precio=owned?'<div class="price" style="color:var(--green)">Tuyo</div>':`<div class="price">🪙 ${sk.p}</div>`;
  const nombreHtml=sk.nombre?`<div class="skin-name">${sk.nombre}</div>`:'';
  it.innerHTML=`<div class="em">${em}</div>`+nombreHtml+precio+btn;
  const b=it.querySelector('button');
  if(b&&!equipped)b.onclick=()=>{
   if(owned){S.avatar=sk.e;SND.tap();}
   else{if(S.monedas<sk.p){SND.wrong();return;}S.monedas-=sk.p;S.skins.push(sk.e);S.avatar=sk.e;
    SND.coin();particulas(window.innerWidth/2,window.innerHeight/3,['🪙','✨','⭐'],16);}
   guardar();refreshHud();renderTienda();
  };
  g.appendChild(it);
 });
}
/* ===== Perfil: logros e insignias ===== */
function renderPerfil(){
 const lg=$('logrosGrid'); lg.innerHTML='';
 Object.keys(LOGROS).forEach(k=>{
  const tengo=S.logros.has(k), L=LOGROS[k];
  const d=document.createElement('div'); d.className='logro'+(tengo?'':' lock');
  d.innerHTML=`<span class="l-ic">${tengo?L.ic:'🔒'}</span><span>${L.tx}</span>`;
  lg.appendChild(d);
 });
 renderInsignias();
}
// Icono de la insignia activa (con espacio) para anteponer al nombre; '' si no hay
function insigniaIc(){const i=INSIGNIAS.find(x=>x.id===S.insigniaActiva);return i?i.ic+' ':'';}
function renderInsignias(){
 const cont=$('insigniasGrid'); cont.innerHTML='';
 INSIGNIAS.forEach(ins=>{
  const tengo=S.insignias.has(ins.id), activa=S.insigniaActiva===ins.id;
  const d=document.createElement('button');
  d.className='insignia'+(tengo?'':' lock')+(activa?' activa':'');
  d.innerHTML=`<span class="i-ic">${tengo?ins.ic:'🔒'}</span><span class="i-tx">${ins.tx}</span>`+
    (activa?'<span class="i-badge">Lucida</span>':(tengo?'<span class="i-badge sec">Tocar para lucir</span>':''));
  if(tengo) d.onclick=()=>{SND.tap();S.insigniaActiva=activa?null:ins.id; guardar(); renderInsignias(); refreshHud();};
  cont.appendChild(d);
 });
}
function restante(expira){const ms=new Date(expira)-new Date();if(ms<=0)return 'expira pronto';
 const h=Math.floor(ms/3600000),m=Math.floor((ms%3600000)/60000);return h+'h '+m+'m';}
function renderRanking(){
 const el=$('ranking');
 const cache=JSON.parse(localStorage.getItem('kimun_rank'+SUFIJO)||'null');
 if(cache) pintarRanking(cache);                       // muestra lo último mientras carga
 if(!SB||!MI_PERFIL){ if(!cache) pintarSinCurso(); return; }
 // Como máximo una consulta cada 30 s, pero solo si ya hay algo pintado:
 // sin caché la pediremos igual, para no dejar el ranking en blanco.
 if(cache && Date.now()-_rankUlt < 30000) return;
 _rankUlt=Date.now();
 SB.rpc('kimun_ranking').then(({data,error})=>{
  if(error) throw error;
  if(!data||!data.length){ pintarSinCurso(); localStorage.removeItem('kimun_rank'+SUFIJO); return; }
  localStorage.setItem('kimun_rank'+SUFIJO,JSON.stringify(data));
  pintarRanking(data);
 }).catch(e=>{
  console.error('Ranking:',e.message||e);
  if(!cache) el.innerHTML='<p style="color:var(--dim);font-weight:800;font-size:13px;text-align:center">Sin conexión. El ranking se actualizará más tarde.</p>';
 });
}
// Los nombres los escribió el profesor en su panel: se escapan antes de pintarlos.
function pintarRanking(filas){
 $('ranking').innerHTML=filas.map((r,i)=>{
  const marca=(r.dificil>0)?'🔥 ':'';
  const ins=r.soy_yo?insigniaIc():'';
  // Evita el 🔥 duplicado: si la insignia lucida ya es 🔥, no repetir la marca.
  const pre=(marca&&ins.trim()==='🔥')?ins:(marca+ins);
  const difcls=(r.dificil>0)?(' dif d'+Math.min(4,r.dificil)):'';   // d4 = maestría total (marco dorado)
  return `<div class="rk ${i<1?'top':''} ${r.soy_yo?'me':''}${difcls}"><div class="pos">${i+1}</div>
   <div class="em">${r.soy_yo?avatarHTML(S.avatar):escHtml(r.avatar)}</div>
   <div>${pre}${escHtml(r.nombre)}${r.soy_yo?' (tú)':''}</div>
   <div class="pts">${escHtml(r.xp)} XP</div></div>`;}).join('');
}
function pintarSinCurso(){
 $('ranking').innerHTML=
  `<p style="color:var(--dim);font-weight:800;font-size:13px;text-align:center;margin-bottom:10px">
     Pide tu código para entrar al ranking de tu curso.</p>
   <button class="btn sec" onclick="SND.tap();abrirCanje()">🎟️ Tengo un código</button>`;
}
/* Activa una expedición: fija etapas, carga su pool y apunta el progreso a esa ruta */
function activarExpedicion(exp){
 EXP_ACT=exp; EXPEDICION=exp.etapas; N_ETAPAS=EXPEDICION.length; MODO='normal';
 const st=estadoRuta(exp);
 S.progreso=st.progreso; S.progresoDificil=st.progresoDificil; S.dificilDesbloqueado=st.dificilDesbloqueado;
 return cargarPool(exp);
}

/* ── Progreso, guardado y medición por OA ─────────────────────────────────────────────────── */
/* ================= ESTADO ================= */
function nuevoProgreso(n){n=n||(EXPEDICION?EXPEDICION.length:5);
 // En modo prueba (?solo=) la ruta nace con TODAS las etapas abiertas, jefe del
 // capítulo incluido: el invitado entra a probar cualquiera, no a avanzar en orden.
 // En modo experimental se abren todas MENOS la del jefe, que sigue pidiendo el camino.
 // ⚠️ ?qa=1 NO abre etapas y nunca las abrió: por eso la condición mira PRUEBA y no
 //    CAPS_ABIERTOS, que también vale true en QA.
 return Array.from({length:n},(_,i)=>{
  const esJefe=(i===n-1);
  const abierta = PRUEBA || i===0 || (CAPS_ABIERTOS && !JEFES_ABIERTOS && !esJefe);
  return {est:abierta?"open":"lock",estrellas:0};});}
function progAct(){return MODO==='dificil'?S.progresoDificil:S.progreso;}
function esJefeLvl(lvl){return lvl===N_ETAPAS-1;}
function estadoRuta(exp){
 const n=exp.etapas.length;
 if(!S.rutas[exp.id]) S.rutas[exp.id]={progreso:nuevoProgreso(n),progresoDificil:nuevoProgreso(n),dificilDesbloqueado:false};
 const st=S.rutas[exp.id];
 if(!Array.isArray(st.progreso)||st.progreso.length!==n) st.progreso=reconciliarProgreso(st.progreso,n);
 if(!Array.isArray(st.progresoDificil)||st.progresoDificil.length!==n) st.progresoDificil=reconciliarProgreso(st.progresoDificil,n);
 return st;
}
/* ===== Helpers de progreso de campaña ===== */
// ¿el jefe (último nodo) de esta expedición está vencido en Normal?
function expedicionCompleta(id){
 const st=S.rutas[id]; if(!st||!st.progreso)return false;
 const ult=st.progreso[st.progreso.length-1];
 return !!ult && ult.est==='done';
}
// capítulos completados de una campaña (en orden)
function capsCompletos(camp){return camp.capitulos.filter(expedicionCompleta).length;}
// ¿está desbloqueado el capítulo i de la campaña? (cap 1 siempre; cap N tras vencer N-1)
function nodoCampDesbloqueado(camp,i){
 if(CAPS_ABIERTOS)return true;
 if(i===0)return true;
 const exp=EXPEDICIONES.find(e=>e.id===camp.capitulos[i]);
 if(exp&&exp.libre)return true;   // capítulo marcado como libre (siempre abierto)
 if(i<camp.capitulos.length)return expedicionCompleta(camp.capitulos[i-1]);
 return false;
}
function desafioDesbloqueado(camp){return JEFES_ABIERTOS||camp.capitulos.every(expedicionCompleta);}
function jefeFinalDesbloqueado(camp){return JEFES_ABIERTOS||(desafioDesbloqueado(camp)&&(!camp.desafioExtra||expedicionCompleta(camp.desafioExtra)));}
function campañaCompleta(camp){return S.campañasCompletas.has(camp.id);}
/* Almacén de progreso por ruta (id de expedición -> {progreso, progresoDificil, dificilDesbloqueado}) */
// Ajusta un progreso guardado al número de etapas que tiene HOY el capítulo.
// Hace falta porque los capítulos crecen: `mat3-cap1` pasó de 3 nodos a 5 al armar la campaña
// de año completo, y un teléfono que ya había jugado la versión corta traía un arreglo de 3.
// `renderMapa` recorre por índice y reventaba con "Cannot read properties of undefined".
function reconciliarProgreso(arr,n){
 const p=Array.isArray(arr)?arr.slice(0,n):[];
 while(p.length<n) p.push({est:'lock',estrellas:0});
 // Que no quede sin nodo jugable: el primero que no esté hecho se abre.
 if(!p.some(x=>x.est==='open')){
  const i=p.findIndex(x=>x.est!=='done');
  if(i>=0) p[i].est='open';
 }
 return p;
}
/* La forma del save, en UN SOLO lugar. La usan guardar() (disco) y subirProgreso()
   (servidor), asi que un campo nuevo llega a los dos sin que nadie se acuerde.
   Estaba escrita dos veces -aqui y al reves en cargar()-, que es como se cayeron
   el `oa` en la Sesion 23, el `visual` en la 55 y el META_OA en la 63. */
function payloadSave(){
 return {nombre:S.nombre,avatar:S.avatar,xp:S.xp,monedas:S.monedas,
  skins:S.skins,logros:[...S.logros], rutaActual:EXP_ACT?EXP_ACT.id:null, rutas:S.rutas,
  campañasCompletas:[...S.campañasCompletas], insignias:[...S.insignias], insigniaActiva:S.insigniaActiva,
  calc:S.calc, curso:S.curso, alumno:S.alumno, maestro:S.maestro, mateLecciones:S.mateLecciones,
  metasVistas:S.metasVistas, semaforo:S.semaforo,
  // Dos campos para el informe del apoderado. Nacen vacios en las partidas que ya
  // existen, y la pantalla lo DICE en vez de mostrar un cero que se leeria como
  // "no ha jugado nunca".
  visto:S.visto, respondidas:S.respondidas};
}
function guardar(){
 // Modo prueba: el avance vive solo en memoria. Se conserva el volcado a S.rutas
 // (si no, al volver del mapa a la lista se perdería el avance dentro de la misma
 // sesión), pero NO se toca localStorage ni se sincroniza con Supabase.
 // Deliberadamente NO se usa EFIMERO aquí: ?qa=1 siempre guardó, y se deja igual.
 if(SIN_DISCO){ if(EXP_ACT) S.rutas[EXP_ACT.id]={progreso:S.progreso,progresoDificil:S.progresoDificil,dificilDesbloqueado:S.dificilDesbloqueado}; return; }
 try{
 if(EXP_ACT) S.rutas[EXP_ACT.id]={progreso:S.progreso,progresoDificil:S.progresoDificil,dificilDesbloqueado:S.dificilDesbloqueado};
 localStorage.setItem(SAVE_KEY,JSON.stringify(payloadSave()));sincronizarXP();subirProgreso();}catch(e){}}
function cargar(){try{const d=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(!d)return false;
 return aplicarSave(d);}catch(e){return false;}}
/* Aplica un save a S, venga del DISCO o del SERVIDOR. Incluye a proposito las
   migraciones de partidas antiguas: una foto bajada tambien puede ser vieja. */
function aplicarSave(d){try{
 S.nombre=d.nombre||"";S.avatar=d.avatar||AVATARES[0];S.xp=d.xp||0;S.monedas=d.monedas||0;
 S.skins=Array.isArray(d.skins)?d.skins:[];S.logros=new Set(d.logros||[]);
 S.campañasCompletas=new Set(d.campañasCompletas||[]);
 S.insignias=new Set(d.insignias||[]);
 S.insigniaActiva=d.insigniaActiva||null;
 S.visto=d.visto||null; S.respondidas=d.respondidas||0;
 if(d.calc&&Array.isArray(d.calc.etapas))S.calc=d.calc;
 if(d.mateLecciones&&typeof d.mateLecciones==='object')S.mateLecciones=d.mateLecciones;
 if(d.metasVistas&&typeof d.metasVistas==='object')S.metasVistas=d.metasVistas;
 if(d.semaforo&&typeof d.semaforo==='object')S.semaforo=d.semaforo;
 S.curso=d.curso||null; S.alumno=d.alumno||null; S.maestro=!!d.maestro;
 S.rutas=(d.rutas&&typeof d.rutas==='object')?d.rutas:{};
 if(!d.rutas && Array.isArray(d.progreso)){ // migrar partidas antiguas (Historia)
  S.rutas['hist-europeos']={progreso:d.progreso,
   progresoDificil:Array.isArray(d.progresoDificil)?d.progresoDificil:nuevoProgreso(d.progreso.length),
   dificilDesbloqueado:!!d.dificilDesbloqueado};
 }
 // Cortesía de campaña: si el jugador ya había vencido el piloto (hist-europeos),
 // dar por completado el Capítulo 1 para que se abra el Capítulo 2. Lo global no se toca.
 if(S.rutas['hist-europeos']){
  const viejo=S.rutas['hist-europeos'];
  const ult=viejo.progreso&&viejo.progreso[viejo.progreso.length-1];
  if(ult&&ult.est==='done' && !S.rutas['hist-cap1']){
   const p=nuevoProgreso(5); p.forEach(n=>{n.est='done';});
   S.rutas['hist-cap1']={progreso:p,progresoDificil:nuevoProgreso(5),dificilDesbloqueado:false};
  }
  delete S.rutas['hist-europeos'];
 }
 const st=estadoRuta(EXP_ACT); // reflejar la ruta activa
 S.progreso=st.progreso;S.progresoDificil=st.progresoDificil;S.dificilDesbloqueado=st.dificilDesbloqueado;
 guardar(); // persistir la limpieza/migración con el progreso ya reflejado
 return !!d.nombre;}catch(e){return false;}}
function hayPartida(){try{const d=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');return !!(d&&d.nombre);}catch(e){return false;}}
function borrarPartida(){localStorage.removeItem(SAVE_KEY);}
function sincronizarXP(){
 if(!SB||!MI_PERFIL) return;
 if(_xpTimer) return;                       // ya hay un envío programado
 const espera = Math.max(0, 15000-(Date.now()-_xpUlt));
 _xpTimer=setTimeout(async ()=>{
  _xpTimer=null; _xpUlt=Date.now();
  try{
   const {data,error}=await SB.rpc('kimun_xp',{p_xp:S.xp});
   if(error) throw error;
   // El servidor manda: si el adulto corrigió un XP inflado, el teléfono lo adopta.
   // Hay que guardar: si no, al reabrir el juego se volvería a enviar el XP viejo
   // desde el disco y la corrección del adulto se desharía sola.
   if(typeof data==='number' && data < S.xp){ S.xp=data; refreshHud(); guardar(); }
  }catch(e){ console.error('XP:',e.message||e); }  // best-effort: no interrumpe el juego
 }, espera);
}

/* -- Progreso en el servidor (Bloque D) ---------------------------------------
   Sube una FOTO completa del save, no eventos. Por eso NO necesita la cola de
   reintentos que si necesita dominio: dominio manda eventos, que se pierden si
   no llegan; la foto es completa e idempotente, asi que el proximo envio que si
   llegue lleva todo. */
let _progTimer=null, _progUlt=0, _progEnviado=null;

function subirProgreso(){
 if(!SB||!MI_PERFIL) return;
 /* NO se sube en EFIMERO, y esta es una diferencia DELIBERADA con el XP.
    El XP es un numero que solo sube; la FOTO es un REEMPLAZO COMPLETO. Abrir
    ?qa=1 en un telefono vinculado a un alumno real, completar una etapa para
    revisar contenido y que eso suba, le PISA LA PARTIDA DEL ANO. */
 if(EFIMERO) return;
 if(_progTimer) return;                       // ya hay un envio programado
 const espera=Math.max(0,15000-(Date.now()-_progUlt));
 _progTimer=setTimeout(async ()=>{
  _progTimer=null; _progUlt=Date.now();
  const json=JSON.stringify(payloadSave());
  if(json===_progEnviado) return;             // guardar() corre en CADA respuesta
  try{
   const {error}=await SB.rpc('kimun_progreso_subir',{p_datos:JSON.parse(json)});
   if(error) throw error;
   _progEnviado=json;
  }catch(e){ console.error('progreso:',e.message||e); }   // best-effort: no interrumpe
 }, espera);
}

/* Resumen comparable de un save: sirve para decidir si hay conflicto y para
   pintarlo. "capitulos" cuenta las rutas cuyo ULTIMO nodo -el jefe- esta vencido. */
function resumenAvance(d){
 if(!d) return null;
 const rutas=(d.rutas&&typeof d.rutas==='object')?d.rutas:{};
 let caps=0;
 for(const k in rutas){
  const p=rutas[k]&&rutas[k].progreso;
  if(Array.isArray(p)&&p.length&&p[p.length-1]&&p[p.length-1].est==='done') caps++;
 }
 return {xp:d.xp||0, capitulos:caps, monedas:d.monedas||0,
         skins:Array.isArray(d.skins)?d.skins.length:0};
}
function hayAvance(r){ return !!r && (r.xp>0 || r.capitulos>0); }

function haceCuanto(iso){
 const dias=Math.floor((Date.now()-new Date(iso).getTime())/86400000);
 if(!isFinite(dias)||dias<0) return '';
 if(dias===0) return 'hoy';
 if(dias===1) return 'ayer';
 if(dias<30)  return 'hace '+dias+' días';
 const m=Math.floor(dias/30);
 return m===1?'hace un mes':'hace '+m+' meses';
}

let PROG_REMOTO=null;                       // {datos, fecha, xpServidor}
/* Las claves se derivan de SAVE_KEY para no repetir SUFIJO, que vive en el fork. */
function claveBajado(){ return SAVE_KEY+'_bajado'; }
function clavePrevio(){ return SAVE_KEY+'_previo'; }
function yaBajo(){ try{ return localStorage.getItem(claveBajado())==='1'; }catch(e){ return false; } }
function marcarBajado(){ try{ localStorage.setItem(claveBajado(),'1'); }catch(e){} }

/* Devuelve true si tomo la pantalla: hay conflicto y hay que esperar al usuario.
   xpServidor es lo que devolvio kimun_xp en el canje. Si la RPC falla NO se marca
   como bajado, y se reintenta al abrir el juego: sin eso, un fallo de red se
   lleva la promesa en silencio. */
async function bajarProgreso(xpServidor){
 if(!SB||!MI_PERFIL||EFIMERO) return false;
 try{
  const {data,error}=await SB.rpc('kimun_progreso_bajar');
  if(error) throw error;
  const fila=Array.isArray(data)?data[0]:data;
  if(!fila||!fila.datos){                   // servidor vacio: sube lo que hay aqui
   marcarBajado(); _progEnviado=null; subirProgreso(); return false;
  }
  PROG_REMOTO={datos:fila.datos, fecha:fila.actualizado, xpServidor:xpServidor};
  if(!hayAvance(resumenAvance(payloadSave()))){   // telefono recien empezado
   aplicarProgresoRemoto(); return false;
  }
  mostrarConflictoProgreso(); return true;        // los dos con avance: preguntar
 }catch(e){ console.error('progreso:',e.message||e); return false; }
}

function aplicarProgresoRemoto(){
 const d=PROG_REMOTO&&PROG_REMOTO.datos; if(!d) return;
 try{ localStorage.setItem(clavePrevio(), JSON.stringify(payloadSave())); }catch(e){}
 const alumno=S.alumno, curso=S.curso;      // vienen del canje recien hecho, NO de la foto
 aplicarSave(d);
 S.alumno=alumno; S.curso=curso;
 /* El XP lo manda el SERVIDOR, no la foto. Si no, una foto vieja con 900 XP
    deshace sola la correccion que el profesor hizo con kimun_prof_xp_fijar,
    que es la unica forma de BAJAR un XP inflado. */
 if(typeof PROG_REMOTO.xpServidor==='number') S.xp=PROG_REMOTO.xpServidor;
 marcarBajado(); PROG_REMOTO=null;
 _progEnviado=null; guardar(); refreshHud();
}

function mostrarConflictoProgreso(){
 const rRem=resumenAvance(PROG_REMOTO.datos), rLoc=resumenAvance(payloadSave());
 const linea=r=>'Nivel '+(Math.floor(r.xp/XP_POR_NIVEL)+1)+' &middot; '+r.capitulos+
   (r.capitulos===1?' capítulo':' capítulos')+'<br>'+r.monedas+' monedas &middot; '+
   r.skins+(r.skins===1?' skin':' skins');
 const cuando=haceCuanto(PROG_REMOTO.fecha);
 $('progRemTit').textContent='Guardado'+(cuando?' ('+cuando+')':'');
 $('progRemDatos').innerHTML=linea(rRem);
 $('progLocDatos').innerHTML=linea(rLoc);
 $('progUsarRem').onclick=()=>{ aplicarProgresoRemoto(); cerrarCanje(); };
 $('progUsarLoc').onclick=()=>{
  /* El que pierde tambien se guarda: 10 KB de seguro si un apoderado reclama. */
  try{ localStorage.setItem(clavePrevio(), JSON.stringify(PROG_REMOTO.datos)); }catch(e){}
  marcarBajado(); PROG_REMOTO=null;
  _progEnviado=null; guardar();             // pisa el servidor con lo de este telefono
  cerrarCanje();
 };
 go('scr-progreso');
}
function registrarOA(oa, ok){
 if(EFIMERO) return;                    // QA marca las respuestas y el modo prueba no guarda: no se mide nada
 if(!oa) return;
 // Al mapa de dominio del profesor va SOLO el curriculum, y se reconoce por la FORMA
 // del codigo: el curriculum lleva el nivel adentro (`HI07 OA 04`) y un modulo
 // transversal no (`VOC-HIST`, `AF-T1`, `CA-T1`). Por eso los transversales no se miden:
 // un porcentaje junto a "Cuentos de Ada" se leeria como cobertura de Lenguaje, y no lo es.
 //
 // Antes esto era una lista escrita a mano (/^(AF-|VOC-)/) que habia que ampliar en los
 // TRES forks cada vez que entraba un modulo nuevo. Es el mismo criterio que ya usan
 // validar-oa-json.py y generar-tablero.py, y el mismo patron con que el servidor
 // descarta lo que no reconoce: asi el cliente deja de mandarle cosas que bota en silencio.
 if(!/^[A-Z]{2}[0-9]{2} OA [0-9]{2}$/.test(oa)) return;
 const d = DOM_BUF[oa] || (DOM_BUF[oa] = {n:0, ok:0});
 d.n++; if(ok) d.ok++;
}
// Convierte el acumulador en el arreglo que espera el servidor y lo vacía.
function cerrarDominio(){
 const datos = Object.keys(DOM_BUF).map(oa => ({oa, n:DOM_BUF[oa].n, ok:DOM_BUF[oa].ok}));
 DOM_BUF = {};
 return datos;
}
function guardarPendiente(datos){
 // Se acota para que un teléfono sin conexión durante días no acumule sin límite.
 try{ localStorage.setItem(DOM_PEND, JSON.stringify(datos.slice(-200))); }catch(e){}
}

/* ── Quiz, resultado y Maestría ─────────────────────────────────────────────────── */
function cargarPool(exp){
 POOL={};
 if(!exp||!exp.contenido)return Promise.resolve();
 return fetch(exp.contenido).then(r=>r.json())
  .then(d=>{(d.preguntas||[]).forEach(q=>{(POOL[q.oa]=POOL[q.oa]||[]).push(q);});})
  .catch(e=>{console.error('No se pudo cargar el pool',e);});
}
function poolListo(lvl){
 const c=EXPEDICION[lvl];
 return c.oas?c.oas.every(oa=>(POOL[oa]||[]).length):(POOL[c.oa]||[]).length>0;
}
function pickN(arr,n){
 const a=(arr||[]).slice();
 for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
 return a.slice(0,n);
}
function buildPreguntas(lvl){
 const c=EXPEDICION[lvl];const N=nPreguntas(lvl);let sel;
 if(c.oas){const per=Math.ceil(N/c.oas.length);
  sel=[];c.oas.forEach(oa=>{sel=sel.concat(pickN(POOL[oa],per));});
  sel=pickN(sel,N);
 }else{sel=pickN(POOL[c.oa],N);}
 // Se conserva el `oa` de cada pregunta: lo necesita el mapa de dominio del profesor.
 // Y `visual`: lo necesita el apoyo visual (assets/js/visuales.js); pintaPregunta lee
 // P.visual. Es inocuo donde el banco no trae dibujos: el campo viaja como undefined.
 return sel.map(q=>({q:q.pregunta,ops:q.opciones,ok:q.correcta,tip:q.tip,oa:q.oa,visual:q.visual,id:q.id}));
}
// La meta de una etapa: la frase amable del OA, o el nombre de la etapa como respaldo.
function metaDeEtapa(lvl){ const c=EXPEDICION[lvl]; if(!c) return ''; return META_OA[c.oa] || c.nombre || 'este objetivo'; }
// ¿Corresponde mostrar meta para esta etapa? No en los libros de apoyo (no son OA del
// currículum) ni en los JEFES: el jefe mezcla varios objetivos, así que no hay una meta
// que enunciar, y `metaDeEtapa` caía al nombre de la etapa, repitiendo el encabezado
// ("JEFE: Números hasta 1.000") y de paso soplando el rango de las respuestas.
function metaDisponible(lvl){ const c=EXPEDICION[lvl];
 return !!(c && c.oa!=='BOSS' && !/^(VOC-|AF-)/.test(c.oa||'')); }
function nPreguntas(lvl){
 if(REV.activo) return REV.n;           // revisión de profesor: pocas por etapa
 if(MODO==='dificil')return esJefeLvl(lvl)?15:10;
 return EXPEDICION[lvl].n;}
function tiempoInicial(){return MODO==='dificil'?15:20;}
/* ================= QUIZ ================= */
function startQuiz(lvl){
 if(!poolListo(lvl)){alert('Cargando preguntas… intenta de nuevo en un momento.');return;}
 // Tarjeta de meta la primera vez (salvo libros de apoyo y modo efímero QA/prueba).
 const c0=EXPEDICION[lvl];
 const esLibro0=/^(VOC-|AF-)/.test(c0.oa||'');
 const clave=(EXP_ACT?EXP_ACT.id:'')+':'+lvl;
 if(!esLibro0 && !EFIMERO && !S.metasVistas[clave]){ mostrarMetaEtapa(lvl, clave); return; }
 arrancarQuiz(lvl);
}
// La tarjeta de meta: se marca vista, se pinta y su botón arranca el quiz de verdad.
function mostrarMetaEtapa(lvl, clave){
 S.metasVistas[clave]=true; guardar();
 $('metaTxt').textContent=metaDeEtapa(lvl);
 $('metaVamos').onclick=()=>{ SND.tap(); callarVoz(); arrancarQuiz(lvl); };
 go('scr-meta');
}
// Arranque real del quiz de una etapa (lo que hacía startQuiz antes de la compuerta de meta).
function arrancarQuiz(lvl){
 const prg=progAct();
 const c=EXPEDICION[lvl];
 const esLibro=/^(VOC-|AF-)/.test(c.oa||'');
 // 2 comodines por etapa. Solo Normal, no en el nodo jefe (5.º) ni en los libros de apoyo.
 const comodines=(MODO==='normal' && lvl!==N_ETAPAS-1 && !esLibro)?2:0;
 Q={lvl,idx:0,aciertos:0,combo:0,comboMax:0,xpGanado:0,timer:null,t:15,lock:false,preguntas:buildPreguntas(lvl),
    repetida:!!(prg&&prg[lvl]&&prg[lvl].est==='done'), comodines};   // ya superada antes en este modo → pago reducido
 go('scr-quiz');pintaPregunta();}
// Modo repaso: 10 preguntas nuevas del OA de la etapa fallada (excluye las que ya salieron),
// sin cronómetro, sin reprobar, sin medir dominio y sin pagar. Al terminar vuelve a scr-res.
function iniciarRepaso(lvl, vistos){
 const c=EXPEDICION[lvl];
 const oas=c.oas||[c.oa];
 let banco=[]; oas.forEach(oa=>{ banco=banco.concat(POOL[oa]||[]); });
 const set=new Set(vistos||[]);
 let disp=banco.filter(q=>!set.has(q.pregunta));
 if(disp.length<10) disp=banco;   // salvaguarda: si por alguna razón no alcanzan, usa todo el banco del OA
 const preguntas=pickN(disp,10).map(q=>({q:q.pregunta,ops:q.opciones,ok:q.correcta,tip:q.tip,oa:q.oa,visual:q.visual,id:q.id}));
 if(!preguntas.length){ go('scr-res'); return; }
 Q={lvl,idx:0,aciertos:0,combo:0,comboMax:0,xpGanado:0,timer:null,t:15,lock:false,preguntas,repaso:{lvl}};
 MODO='normal';
 go('scr-quiz'); pintaPregunta();
}
// Fin del repaso: no mide, no premia. Vuelve a la pantalla de reprobado (con REINTENTAR intacto).
function finRepaso(){
 clearInterval(Q.timer);
 Q={lvl:0,idx:0,aciertos:0,combo:0,comboMax:0,xpGanado:0,timer:null,t:15,lock:false};
 go('scr-res');
}
function pintaPregunta(){
 const N=EXPEDICION[Q.lvl],P=Q.preguntas[Q.idx];Q.lock=false;
 kimReact('neutral');
 Q.asistidaActual=false;
 // Botón de ayuda 50/50: visible solo si quedan comodines en esta etapa.
 const ba=$('btnAyuda');
 if(Q.comodines>0){ ba.hidden=false; ba.disabled=false; ba.textContent='💡 Ayuda ('+Q.comodines+')'; ba.onclick=usarComodin; }
 else { ba.hidden=true; }
 $('qTag').textContent = Q.repaso
   ? `🧑‍🏫 Repaso · Pregunta ${Q.idx+1}/${Q.preguntas.length}`
   : Q.leccion
   ? `📘 ${Q.leccion.titulo} · Pregunta ${Q.idx+1}/${Q.preguntas.length}`
   : Q.desafio
   ? `📣 ${Q.desafio.titulo} · Pregunta ${Q.idx+1}/${Q.preguntas.length}`
   : `${MODO==='dificil'?'🔥 ':''}${N.icono} ${N.nombre} · Pregunta ${Q.idx+1}/${Q.preguntas.length}`;
 $('qText').innerHTML=FRAC.html(P.q);
 $('qVisual').innerHTML = renderVisual(P.visual);
 $('qFb').textContent='';$('qFb').className='feedback';
 // Línea fija de meta: en etapa y repaso (mismo OA), no en lección/desafío/libros.
 const qm=$('qMeta');
 if(!Q.leccion && !Q.desafio && metaDisponible(Q.lvl)){ qm.textContent='🎯 '+metaDeEtapa(Q.lvl); qm.hidden=false; }
 else { qm.hidden=true; }
 $('qExpl').hidden=true;$('btnSeguir').hidden=true;
 $('qProg').style.width=(Q.idx/Q.preguntas.length*100)+'%';
 callarVoz();   // corta la lectura de la pregunta anterior
 // barajar opciones
 const orden=P.ops.map((o,i)=>({o,i})).sort(()=>Math.random()-.5);
 $('qOpts').innerHTML='';
 orden.forEach((it,k)=>{
  const b=document.createElement('div');b.className='opt';
  if(it.i===P.ok)b.dataset.correcta='1';
  if(QA_MARCA&&it.i===P.ok)b.classList.add('qa-ok');
  b.innerHTML=`<span class="key">${'ABCD'[k]}</span>${FRAC.html(it.o)}`;
  b.onclick=e=>responder(b,it.i===P.ok,P,e);
  $('qOpts').appendChild(b);});
 // Botón de lectura: lee la pregunta y las 4 opciones en voz alta.
 const be=$('btnEscuchar');
 // Se lee `orden` (el barajado que se está mostrando), NO P.ops: si se leyera el
 // arreglo original, la voz diría "A" señalando una opción distinta a la de pantalla.
 if(be){ be.onclick=()=>leerPreguntaEnVoz(P.q, orden.map(it=>it.o), $('qOpts')); }
 REV.boton(P);   // 🚩 del modo revisión (assets/js/revision.js)
 // timer (el repaso no tiene cronómetro: es estudio, no evaluación)
 clearInterval(Q.timer);
 if(Q.repaso || SIN_RELOJ){ $('qTimer').style.visibility='hidden'; }
 else{
  $('qTimer').style.visibility='visible';
  Q.t=tiempoInicial();$('qTimer').textContent=Q.t;$('qTimer').className='timer';
  Q.timer=setInterval(()=>{Q.t--;$('qTimer').textContent=Q.t;
   if(Q.t<=5){$('qTimer').classList.add('low');if(Q.t>0)SND.tick();}
   if(Q.t<=0){clearInterval(Q.timer);responder(null,false,P);}},1000);
 }
}
// Comodín 50/50: elimina dos de las tres opciones incorrectas. Marca la pregunta como asistida
// (no se mide en el mapa de dominio). Gratis, tope de Q.comodines por etapa.
function usarComodin(){
 if(Q.lock || !Q.comodines || Q.comodines<=0 || Q.asistidaActual) return;
 const opts=[...document.querySelectorAll('#qOpts .opt')];
 const malas=opts.filter(o=>!o.dataset.correcta);
 // baraja las malas y descarta dos
 for(let i=malas.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[malas[i],malas[j]]=[malas[j],malas[i]];}
 malas.slice(0,2).forEach(o=>{o.classList.add('descartada');o.onclick=null;});
 Q.comodines--; Q.asistidaActual=true; SND.tap();
 const ba=$('btnAyuda');
 if(Q.comodines>0){ ba.textContent='💡 Ayuda ('+Q.comodines+')'; }
 else { ba.disabled=true; ba.textContent='💡 Sin ayudas'; }
}
function responder(el,ok,P,e){
 if(Q.lock)return;Q.lock=true;clearInterval(Q.timer);
 marcarActividad();
 // Corta la lectura APENAS responde. Antes seguia leyendo las opciones que faltaban
 // encima del "¡Correcto!" y de la explicacion: ruido justo cuando hay que escuchar
 // otra cosa. No basta con cortar al pintar la pregunta siguiente, porque entre
 // responder y la siguiente hay una pausa (o el boton Continuar, que puede tardar).
 callarVoz();
 if(!Q.desafio && !Q.repaso && !Q.asistidaActual) registrarOA(P&&P.oa, ok);   // desafío/repaso miden aparte; una pregunta con comodín no se mide
 document.querySelectorAll('.opt').forEach(o=>o.classList.add('off'));
 if(ok){
  Q.combo++;Q.comboMax=Math.max(Q.comboMax,Q.combo);Q.aciertos++;
  const bonus=Math.max(Q.t,3),pts=10+bonus+ (Q.combo>=2?Q.combo*2:0);
  const xpGan=Q.repaso?0:(Q.repetida?Math.max(1,Math.round(pts*0.25)):pts), coinGan=Q.repaso?0:(Q.repetida?1:5);   // repaso no paga; repeticiones pagan reducido (anti-farmeo)
  Q.xpGanado+=xpGan;S.xp+=xpGan;S.monedas+=coinGan;
  el.classList.remove('off');el.classList.add('ok');
  $('qFb').textContent=Q.repaso?'✓ ¡Correcto!':`✓ ¡Correcto! +${xpGan} XP`;$('qFb').classList.add('ok');
  const r=el.getBoundingClientRect();
  particulas(r.left+r.width/2,r.top,['✨','⭐','🪙','💥']);
  SND.correct();
  if(Q.combo>=2){comboFx(Q.combo);SND.combo(Q.combo);kimReact('wow');}
  else kimReact('feliz');
  if(Q.combo>=3)toast('combo3');
 }else{
  Q.combo=0;
  if(el){el.classList.remove('off');el.classList.add('bad');}
  $('qFb').textContent='✗ Incorrecto';$('qFb').classList.add('bad');
  SND.wrong();kimReact('triste');
  if(navigator.vibrate)navigator.vibrate(120);
 }
 refreshHud();
 if(ok){Q._avanzarT=setTimeout(avanzar,1100);}
 else{
  // Revelar la respuesta correcta y una explicación más amplia; sin apuro (botón Continuar)
  const correcta=document.querySelector('#qOpts .opt[data-correcta]');
  if(correcta)correcta.classList.add('ok');
  const e=$('qExpl');e.innerHTML='';
  const b=document.createElement('b');b.textContent='Respuesta correcta: ';
  const s1=document.createElement('span');s1.innerHTML=FRAC.html(P.ops[P.ok]);
  const s2=document.createElement('span');s2.className='expl-tip';s2.innerHTML='💡 '+FRAC.html(P.tip);
  e.append(b,s1,document.createElement('br'),s2);
  e.hidden=false;$('btnSeguir').hidden=false;
 }
}
function avanzar(){if(!Q||!Q.preguntas)return;   // guard: evita reentrada (doble toque) tras resetear Q
  if(!$('scr-quiz').classList.contains('on'))return;   // el usuario salió del quiz: no continuar
  Q.idx++;if(Q.idx<Q.preguntas.length)pintaPregunta();
  else if(Q.repaso)finRepaso();
  else if(Q.leccion)LECC.finPractica();
  else if(Q.desafio)terminarDesafio();else terminarNivel();}
// Prediccion antes del resultado. El nino declara como cree que le fue ANTES de ver su puntaje:
// asi el semaforo deja de ser un eco de las estrellas y pasa a ser una prediccion, y el resultado
// puede responderle. Mismo patron que la tarjeta de meta (startQuiz -> mostrarMetaEtapa ->
// arrancarQuiz): esta es la compuerta y mostrarResultado el trabajo real.
// EFIMERO (QA || PRUEBA, y REVISION implica PRUEBA) la salta, asi que ?qa=1, ?solo=, ?m= y ?rev=1
// quedan cubiertos por la bandera que ya existe: quien revisa contenido no se tranca.
function terminarNivel(){
 if(EFIMERO){ mostrarResultado(); return; }
 preguntarPrediccion();
}
// La pantalla: un solo toque, sin boton de confirmar. Es el unico control, asi que es obligatoria
// sin necesidad de apagar nada ni de explicar un bloqueo.
function preguntarPrediccion(){
 const clave=(EXP_ACT?EXP_ACT.id:'')+':'+Q.lvl;
 const btns=[...document.querySelectorAll('#predOpts .sem')];
 btns.forEach(b=>{ b.classList.remove('sel');
  b.onclick=()=>{
   if(Q._pred)return;              // guard de reentrada: doble toque
   Q._pred=true; b.classList.add('sel'); SND.tap();
   S.semaforo[clave]=b.dataset.v; guardar();
   setTimeout(mostrarResultado,220);   // alcanza a verse la marca antes de cambiar de pantalla
  };});
 go('scr-pred');   // en 3ro el propio go() corta la voz de la pantalla anterior
}
// El resultado RESPONDE a la prediccion. Sin prediccion (modo efimero o partida vieja) la linea
// queda vacia y la pantalla se ve como antes. Local y privado: no mide ni viaja al profesor.
function mostrarCruce(clave, paso, ratio, aciertos, tot, hayRepaso){
 const el=$('resCruce'); if(!el)return; el.textContent='';
 const pred=S.semaforo[clave]; if(!pred)return;
 const real=!paso?'🔴':(ratio>=0.9?'🟢':'🟡');   // mismo corte con que ya se reparten las estrellas
 const ord={'🔴':0,'🟡':1,'🟢':2}, d=ord[pred]-ord[real], marca=aciertos+' de '+tot;
 el.textContent = d===0 ? 'Te conoces bien: sabías cómo te iba a ir 👌'
   : d>0 ? 'Creías que lo tenías y te fue '+marca+'. Démosle otra vuelta.'+(hayRepaso?' 👉 Toca “Repasar”.':'')
         : '¡Te costó menos de lo que pensabas! '+marca+' 💪';
}
function mostrarResultado(){
 const tot=Q.preguntas.length;
 const ratio=Q.aciertos/tot;
 const dif=MODO==='dificil';
 const estrellas=dif?(ratio>=1?3:(ratio>=0.90?2:(ratio>=0.80?1:0)))
                    :(ratio>=1?3:(ratio>=0.80?2:(ratio>=0.66?1:0)));
 const paso=dif?ratio>=0.80:ratio>=0.66;   // Difícil pasa con 80%, Normal con 66%
 const esJefe=Q.lvl===N_ETAPAS-1;
 const cFail=EXPEDICION[Q.lvl], lvlFail=Q.lvl, oaFail=cFail.oa||'';
 const esLibro=/^(VOC-|AF-)/.test(oaFail);
 const esMate=HAY_MINICLASES && EXP_ACT && EXP_ACT.asignatura==='Matemáticas';
 const vistos=Q.preguntas.map(p=>p.q);   // enunciados de la etapa fallada, para excluirlos en el repaso
 const prog=progAct();
 const p=prog[Q.lvl];
 if(paso){p.est='done';p.estrellas=Math.max(p.estrellas,estrellas);
  if(prog[Q.lvl+1]&&prog[Q.lvl+1].est==='lock')prog[Q.lvl+1].est='open';
  toast('primera');
  if(estrellas===3)toast('perfecto');
  if(esJefe)toast('jefe');
  S.monedas+=Q.repetida?0:estrellas*10;   // el bono de estrellas solo la primera vez (anti-farmeo)
  if(HAY_DIFICIL&&esJefe&&EXPEDICION[Q.lvl]&&EXPEDICION[Q.lvl].oa==='BOSS'&&!dif&&!S.dificilDesbloqueado){S.dificilDesbloqueado=true;setTimeout(()=>toast('dificil'),700);}
 }
 if(paso)SND.win();else SND.lose();
 [1,2,3].forEach(i=>{if(i<=estrellas)setTimeout(()=>SND.star(i),350+i*260);});
 let kimImg = !paso ? 'desanimado'
   : esJefe ? 'fiesta'
   : (estrellas===3?'oro':estrellas===2?'plata':'bronce');
 $('resKim').src='assets/kimun-'+kimImg+'.png';
 $('resTitle').textContent=paso?(esJefe?'¡EXPEDICIÓN COMPLETA!':'¡Nivel superado!'):('¡Casi! Necesitas '+(dif?'80%':'66%')+' para pasar');
 $('resStars').innerHTML=[1,2,3].map(i=>i<=estrellas?'<span class="g">★</span>':'<span class="w">★</span>').join('');
 $('resXp').textContent='+'+Q.xpGanado;
 $('resCoins').textContent='+'+((Q.repetida?0:estrellas*10)+Q.aciertos*(Q.repetida?1:5));
 $('resCombo').textContent='x'+Q.comboMax;
 if(paso){
  $('btnNext').style.display=(Q.lvl<N_ETAPAS-1)?'block':'none';
  $('btnNext').textContent='SIGUIENTE ETAPA ➜';
  $('btnNext').onclick=()=>startQuiz(Q.lvl+1);
 }else{
  $('btnNext').style.display='block';
  $('btnNext').textContent='🔁 REINTENTAR';
  $('btnNext').onclick=()=>startQuiz(lvlFail);
 }
 // Siguiente paso al reprobar una etapa de un solo OA (no jefe, no libros).
 if(!paso && !esJefe && !esLibro){
  $('resObj').textContent='🎯 '+metaDeEtapa(lvlFail);
  $('resObj').hidden=false;
  $('btnPaso').style.display='block';
  if(esMate){ $('btnPaso').textContent='📘 Repasar la mini-clase'; $('btnPaso').onclick=()=>LECC.abrirMiniClaseDeOA(oaFail); }
  else      { $('btnPaso').textContent='🧑‍🏫 Repasar sin presión'; $('btnPaso').onclick=()=>iniciarRepaso(lvlFail,vistos); }
 }else{
  $('resObj').hidden=true;
  $('btnPaso').style.display='none';
 }
 $('btnMap').onclick=()=>{
  // Terminó el jefe de la demo y no tiene código: se le ofrece el resto.
  if(bloqueado() && EXP_ACT && EXP_ACT.id===DEMO_LIBRE && expedicionCompleta(DEMO_LIBRE)){ mostrarFinDemo(); return; }
  renderMapa();renderRanking();go('scr-mapa');};
 refreshHud();guardar();enviarDominio();
 if(dif&&paso)revisarDificil();   // ¿completó una asignatura en Difícil? → insignia/skin + marca 🔥
 if(paso)particulas(window.innerWidth/2,window.innerHeight/3,['🎉','⭐','✨','🎊'],24);
 mostrarCruce((EXP_ACT?EXP_ACT.id:'')+':'+lvlFail, paso, ratio, Q.aciertos, tot, !paso && !esJefe && !esLibro);
 go('scr-res');
}
/* Nombre visible de una asignatura a partir de su codigo (`MA03` -> `Matemática`).

   Sale de las PROPIAS expediciones del curso y no de una lista escrita a mano, por dos
   razones. La primera es que asi no puede desincronizarse: si el curso tiene contenido de
   esa asignatura, su nombre esta ahi. La segunda es mas fina y costo entenderla — este
   nombre NO es una etiqueta, es la LLAVE con que `contenidoDeAsignatura` busca el banco,
   y los cursos no la escriben igual: 8° y 7° dicen "Matemáticas" y 3° dice "Matemática".
   Una tabla derivada del código habría dejado a un curso sin banco en su desafío de
   refuerzo, y sin ningún error visible.

   Si el curso no tiene esa asignatura devuelve el código, que es lo que se veía antes. */
function asigDesafioNombre(cod){
  const e=EXPEDICIONES.find(x=>(x.etapas||[]).some(t=>String(t.oa||'').indexOf(cod)===0));
  return e?e.asignatura:cod;
}
// Ruta del preguntas.json de una asignatura (cualquiera de sus expediciones sirve).
function contenidoDeAsignatura(asig){
  const e=EXPEDICIONES.find(x=>x.asignatura===asig&&x.contenido);
  return e?e.contenido:null;
}
// Fin del desafío: resultado propio + recompensa. No toca el progreso de campañas ni el
// mapa de dominio (se midió aparte). El +5/acierto ya se sumó en responder; aquí va el bono.
function terminarDesafio(){
  const tot=Q.preguntas.length, ac=Q.aciertos, ratio=ac/tot;
  const estrellas = ratio>=1?3:(ratio>=0.80?2:(ratio>=0.66?1:0));
  S.monedas += 30;
  let insigniaNueva=false;
  if(!S.insignias.has('mision-profe')){ S.insignias.add('mision-profe');
    if(!S.insigniaActiva)S.insigniaActiva='mision-profe'; insigniaNueva=true; }
  guardar(); refreshHud();
  if(!EFIMERO && SB && MI_PERFIL){
    try{ Promise.resolve(SB.rpc('kimun_refuerzo_completar',
      {p_desafio_id:Q.desafio.id,p_correctas:ac,p_total:tot})).catch(()=>{}); }catch(e){}
  }
  SND.win();
  $('resKim').src='assets/kimun-'+(estrellas>=2?'oro':estrellas===1?'plata':'bronce')+'.png';
  $('resTitle').textContent='¡Refuerzo cumplido!';
  $('resStars').innerHTML=[1,2,3].map(i=>i<=estrellas?'<span class="g">★</span>':'<span class="w">★</span>').join('');
  $('resXp').textContent='+'+Q.xpGanado;
  $('resCoins').textContent='+'+(30+ac*5);
  $('resCombo').textContent='x'+Q.comboMax;
  $('btnNext').style.display='none';
  $('btnMap').textContent='VOLVER AL INICIO';
  $('btnMap').onclick=()=>{revisarDesafio();revisarDuelos();pintarInicio();go('scr-rol');};
  if(insigniaNueva) setTimeout(()=>toast('mision-profe'),600);
  particulas(window.innerWidth/2,window.innerHeight/3,['🎉','⭐','✨','📣'],24);
  go('scr-res');
}
/* ===== Recompensas del Modo Difícil ===== */
function capDificilCompleto(capId){const r=S.rutas[capId];
 return !!(r&&Array.isArray(r.progresoDificil)&&r.progresoDificil.length&&r.progresoDificil.every(n=>n.est==='done'));}
function asignaturaDificilCompleta(asig){const c=CAMPAÑAS.find(x=>x.asignatura===asig);
 // Una campaña sin capítulos de expedición no cuenta para Difícil: exige capítulos
 // antes de evaluar para no generar una "Maestría" falsa.
 return !!(c&&c.capitulos.length&&c.capitulos.every(capDificilCompleto));}
function asignaturasDificil(){return DIF_ASIGS.filter(asignaturaDificilCompleta);}
// Maestría Total = CUATRO hitos. Cuáles son, lo declara MAESTRIA_CALC junto a HAY_DIFICIL:
// donde hay Reto de Cálculo son 3 asignaturas en Difícil + El Autómata; donde no lo hay,
// son las cuatro asignaturas en Difícil.
function esMaestro(){if(!HAY_DIFICIL) return false; return hitosMaestria()>=4;}
function hitosMaestria(){return asignaturasDificil().length+((MAESTRIA_CALC&&S.calc&&S.calc.jefe)?1:0);}
// Aura/halo dorados permanentes mientras se es maestro (clase en el body).
function aplicarMaestria(){document.body.classList.toggle('es-maestro', esMaestro());}
// La primera vez que se logra la maestría: skin cumbre + video de celebración.
function revisarMaestria(){
 aplicarMaestria();
 if(esMaestro() && !S.maestro){
  S.maestro=true;
  const sk=SKINS.find(s=>s.id==='kimun-maestro');
  if(sk&&!S.skins.includes(sk.e))S.skins.push(sk.e);
  guardar(); refreshHud(); aplicarMaestria();
  toast('dif-maestro');
  reproducirMaestro();
 }
}
// Otorga las insignias de Difícil por asignatura, sincroniza la marca (0–4, incluye El
// Autómata) y revisa la maestría. Idempotente. Se llama al pasar una etapa en Difícil,
// al vencer a El Autómata y al iniciar.
function revisarDificil(){
 if(!HAY_DIFICIL) return;
 const hechas=asignaturasDificil();
 const ins={Historia:'dif-historia',Ciencias:'dif-ciencias',Lenguaje:'dif-lenguaje'};
 let nuevo=false;
 hechas.forEach(asig=>{const id=ins[asig];
  if(id&&!S.insignias.has(id)){S.insignias.add(id);if(S.insigniaActiva===null)S.insigniaActiva=id;toast(id);nuevo=true;}});
 // Matemáticas: insignia propia de Difícil. Se otorga aparte de DIF_ASIGS (3 core),
 // así NO entra en asignaturasDificil() ni altera la Maestría Total.
 if(asignaturaDificilCompleta('Matemáticas') && !S.insignias.has('dif-matematicas')){
  S.insignias.add('dif-matematicas'); if(S.insigniaActiva===null)S.insigniaActiva='dif-matematicas'; toast('dif-matematicas'); nuevo=true;
 }
 if(nuevo){guardar();refreshHud();}
 const cnt=hitosMaestria();   // 0–4 hitos (ver MAESTRIA_CALC)
 if(SB&&MI_PERFIL){try{Promise.resolve(SB.rpc('kimun_dificil',{p_n:cnt})).catch(()=>{});}catch(e){}}  // best-effort
 revisarMaestria();
 return cnt;
}
// Video de celebración de la Maestría Total (una vez; con sonido, es tras una acción del usuario).
function reproducirMaestro(){
 const ov=$('maestroOverlay'),vid=$('maestroVid'),skip=$('maestroSkip'); if(!ov)return;
 ov.hidden=false; ov.classList.remove('fade');
 let cerrado=false,guard=null;
 function cerrar(){if(cerrado)return;cerrado=true;clearTimeout(guard);try{vid.pause();}catch(e){}
  ov.classList.add('fade');setTimeout(()=>{ov.hidden=true;ov.classList.remove('fade');},480);}
 skip.onclick=cerrar; vid.onended=cerrar;
 vid.addEventListener('playing',()=>{clearTimeout(guard);guard=setTimeout(cerrar,12000);},{once:true});
 vid.currentTime=0; vid.muted=false;
 const p=vid.play(); if(p&&p.catch)p.catch(()=>{vid.muted=true;const q=vid.play();if(q&&q.catch)q.catch(()=>cerrar());});
}

/* ================= INFORME PARA EL APODERADO ("📊 Cómo va") =================
   Se mira en el TELÉFONO DEL NIÑO, y por eso no tiene backend, ni credencial nueva, ni
   un solo dato que salga del aparato: todo lo que muestra ya está en `localStorage`.
   Es como un papá revisa de verdad, y evita de raíz la pregunta de UTP sobre qué se hace
   con los datos de un menor.

   ⚠️ TRES COSAS QUE NO MUESTRA, Y NO ES OLVIDO:

   1. El PORCENTAJE de acierto por objetivo. El dato lo reporta el teléfono -o sea que es
      falsificable, y el panel del profesor ya lo dice de sí mismo- y un apoderado lo lee
      como NOTA. Además no hace falta: en este juego cada etapa ES un objetivo y las
      ESTRELLAS ya son ese porcentaje traducido (3★=100%, 2★≥80%, 1★≥66%). Por eso "le
      costó" = etapa superada con UNA estrella: exacto, y sin inventar una métrica nueva.
   2. La POSICIÓN EN EL RANKING. Existe y es del niño; este informe es para acompañar, no
      para comparar.
   3. El SEMÁFORO (🟢🟡🔴) de su autoevaluación. Es el dato más valioso que hay aquí, y
      justamente por eso: al niño se le prometió que es privado y que no se envía a nadie
      (Sesiones 52 y 74). Mostrárselo al papá cambia el incentivo a contestarlo con
      honestidad, y entonces deja de servirle a él, que es para quien se hizo. */

/* Marca que el nino JUGO, para el informe del apoderado. Va donde se responde una
   pregunta y NO en guardar(), que tambien corre al abrir la app: ahi bastaba con que el
   papa entrara a mirar el informe para que dijera "jugo hoy", justo lo contrario de lo
   que el dato sirve.
   Alcance: el quiz de campana y el Jefe Final, que es de lo que habla el informe. Un nino
   que solo juegue el Reto de Calculo o el duelo va a mostrar su ultima partida de campana. */
function marcarActividad(){ S.visto=hoyISO(); S.respondidas=(S.respondidas||0)+1; }

function _infFecha(iso){
 if(!iso) return null;
 const hoy=new Date(hoyISO()+'T00:00:00'), d=new Date(iso+'T00:00:00');
 const dias=Math.round((hoy-d)/86400000);
 if(dias<=0) return 'hoy';
 if(dias===1) return 'ayer';
 if(dias<7)  return 'hace '+dias+' días';
 if(dias<14) return 'hace una semana';
 return 'hace '+Math.floor(dias/7)+' semanas';
}

/* Lo hecho en UNA expedición, leído del progreso guardado. Cuenta el modo Normal: el
   Difícil es un segundo recorrido del mismo contenido y sumarlo inflaría el avance. */
function _infExp(exp){
 const st=S.rutas[exp.id], p=(st&&st.progreso)||[], n=exp.etapas.length;
 let hechas=0, est=0;
 for(let i=0;i<n;i++){ const e=p[i]; if(e&&e.est==='done'){ hechas++; est+=(e.estrellas||0); } }
 return {n:n, hechas:hechas, est:est, max:n*3, completa:(hechas===n)};
}

/* Los temas que le costaron: etapas SUPERADAS con una sola estrella. Se nombran con
   META_OA, la meta en lenguaje de niño que ya está escrita para cada objetivo (69 en 8°,
   81 en 7°, 85 en 3°), así el papá lee "Repartir en partes iguales" y no "MA08 OA 05". */
function _infCuesta(exp){
 const st=S.rutas[exp.id], p=(st&&st.progreso)||[], out=[];
 for(let i=0;i<exp.etapas.length;i++){
  const e=p[i]; if(!e||e.est!=='done'||(e.estrellas||0)>1) continue;
  const et=exp.etapas[i], oa=et.oa||(et.oas&&et.oas[0]);
  // El jefe mezcla los objetivos del capítulo, así que no nombra UN tema: se salta.
  if(!oa||oa==='BOSS') continue;
  out.push({asig:exp.asignatura, tema:(META_OA[oa]||et.nombre||'')});
 }
 return out;
}

function datosInforme(){
 const d={asigs:[], extras:[], cuesta:[], etapas:0, estrellas:0, estrellasMax:0};
 const suma=exp=>{ const r=_infExp(exp); d.etapas+=r.hechas; d.estrellas+=r.est;
                   d.estrellasMax+=r.max; d.cuesta=d.cuesta.concat(_infCuesta(exp)); return r; };

 ORDEN_ASIG.forEach(asig=>{
  const c=campañaDe(asig);
  const exps=EXPEDICIONES.filter(e=>e.activa && e.asignatura===asig && (c? e.campaña===c.id : !e.campaña));
  if(!exps.length) return;
  let caps=0, est=0, max=0, port='';
  exps.forEach(exp=>{ const r=suma(exp); if(r.completa) caps++; est+=r.est; max+=r.max;
                      if(!port && !r.completa) port=portadaMapa(exp); });
  const fila={asig:asig, caps:caps, total:exps.length, est:est, max:max,
              portada:port||portadaMapa(exps[exps.length-1]), lecciones:null};
  // Matemáticas lleva además su camino de mini-clases, que no son expediciones.
  if(HAY_MINICLASES && c && c.capitulosMate){
   const ids=c.capitulosMate.reduce((a,x)=>a.concat(x.lecciones||[]),[]);
   fila.lecciones={hechas:ids.filter(id=>S.mateLecciones[id]).length, total:ids.length};
  }
  d.asigs.push(fila);
 });

 // Vocabulario y las lecturas: son apoyos, no currículum, así que van aparte y no se
 // mezclan con el avance del año. Su código no lleva el nivel adentro y por eso tampoco
 // tienen meta de aprendizaje: no aportan a "temas que le costaron".
 EXPEDICIONES.filter(e=>e.activa && !e.campaña && ORDEN_ASIG.indexOf(e.asignatura)<0)
  .forEach(exp=>{ const r=_infExp(exp); d.etapas+=r.hechas; d.estrellas+=r.est; d.estrellasMax+=r.max;
   d.extras.push({nombre:nombreMapa(exp)||exp.asignatura, hechas:r.hechas, total:r.n}); });

 d.visto=_infFecha(S.visto);
 d.respondidas=S.respondidas||0;
 d.nivel=Math.floor((S.xp||0)/XP_POR_NIVEL)+1;

 // OJO: insignias y campanasCompletas son Set, no arreglos: con .length darian 0 en
 // silencio, que es el tipo de error que no se nota hasta que alguien pregunta.
 d.insignias=(S.insignias&&S.insignias.size)||0;
 d.coronas=(S.campañasCompletas&&S.campañasCompletas.size)||0;
 return d;
}

function renderInforme(){
 const d=datosInforme(), $i=id=>document.getElementById(id);
 $i('infNombre').textContent=S.nombre||'Tu hijo o hija';

 /* La actividad se dice en una frase y no como fecha: "hace 3 días" es accionable y
    "2026-08-30" no. Si el campo todavía no existe -partida anterior a que se agregara-
    se DICE, en vez de mostrar un cero que se leería como "no ha jugado nunca". */
 $i('infVisto').textContent = d.visto ? ('Última vez que jugó: '+d.visto)
   : 'Aún no hay registro de cuándo jugó (se empieza a guardar desde ahora)';

 $i('infCifras').innerHTML=
   '<div class="inf-c"><b>'+d.etapas+'</b><span>etapas superadas</span></div>'+
   '<div class="inf-c"><b>'+d.estrellas+'<small>/'+d.estrellasMax+'</small></b><span>estrellas</span></div>'+
   '<div class="inf-c"><b>'+d.respondidas+'</b><span>preguntas respondidas</span></div>'+
   '<div class="inf-c"><b>'+d.nivel+'</b><span>nivel</span></div>';

 $i('infAsigs').innerHTML=d.asigs.map(a=>{
  const pct=a.total?Math.round(a.caps/a.total*100):0;
  const lec=a.lecciones?('<span class="inf-lec">'+a.lecciones.hechas+' de '+a.lecciones.total+' mini-clases</span>'):'';
  return '<div class="inf-a"><img src="'+escHtml(a.portada)+'" alt="" onerror="this.style.visibility=\'hidden\'">'+
   '<div class="inf-a-t"><b>'+escHtml(a.asig)+'</b>'+
   '<span>'+a.caps+' de '+a.total+' capítulos · '+a.est+' de '+a.max+' estrellas</span>'+lec+
   '<div class="inf-bar"><i style="width:'+pct+'%"></i></div></div></div>';
 }).join('');

 $i('infExtras').innerHTML=d.extras.length
  ? '<h3>También ha jugado</h3>'+d.extras.map(e=>'<p class="inf-x">'+escHtml(e.nombre)+
      ' · <b>'+e.hechas+' de '+e.total+'</b></p>').join('')
  : '';

 /* Los temas se agrupan por asignatura y se deduplican: un mismo objetivo puede aparecer
    en dos capítulos, y repetirlo haría ver peor de lo que está. */
 const vistos={}, porAsig={};
 d.cuesta.forEach(c=>{ if(!c.tema||vistos[c.tema])return; vistos[c.tema]=1;
   (porAsig[c.asig]=porAsig[c.asig]||[]).push(c.tema); });
 const asigs=Object.keys(porAsig), n=Object.keys(vistos).length;
 $i('infCuesta').innerHTML = n
  ? '<h3>🎯 '+n+(n===1?' tema en el que le vendría bien apoyo':' temas en los que le vendría bien apoyo')+'</h3>'+
    '<p class="inf-sub">Los pasó, pero le costaron. Preguntarle por ellos ayuda más que repetir la etapa.</p>'+
    asigs.map(a=>'<div class="inf-t"><b>'+escHtml(a)+'</b><ul>'+
      porAsig[a].map(t=>'<li>'+escHtml(t)+'</li>').join('')+'</ul></div>').join('')
  : '<h3>🎯 Sin temas pendientes</h3><p class="inf-sub">Todo lo que ha jugado le salió bien. '+
    'A medida que avance, aquí van a aparecer los temas que le cuesten.</p>';

 $i('infLogros').textContent = d.insignias
   ? (d.insignias+(d.insignias===1?' insignia':' insignias')+(d.coronas?' · '+d.coronas+(d.coronas===1?' corona':' coronas'):''))
   : 'Todavía sin insignias';
}

/* La pantalla y su CSS se INYECTAN, no viven en los tres forks: así un curso nuevo la
   trae gratis y una corrección se escribe una vez. Es el patrón de revision.js y
   lecciones.js. El botón del inicio SÍ va en cada fork, a propósito: un enlace inyectado
   que no aparece porque cambió su ancla es un fallo mudo, y prefiero verlo en el HTML. */
(function(){
 const CSS =
  "#scr-informe{padding:16px}#scr-informe.on{display:flex;flex-direction:column;gap:14px}"+
  ".inf-top{display:flex;align-items:center;gap:10px}.inf-top .btn{width:auto;flex:0 0 auto;padding:8px 16px;font-size:15px;margin:0}"+
  ".inf-h{font-family:'Titan One',sans-serif;font-size:20px;margin:0}"+
  ".inf-visto{color:var(--dim);font-size:13px;margin:-6px 0 0}"+
  ".inf-cifras{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}"+
  ".inf-c{background:#241a44;border:1px solid #3a2f60;border-radius:14px;padding:10px;text-align:center}"+
  ".inf-c b{display:block;font-family:'Titan One',sans-serif;font-size:22px;color:var(--gold)}"+
  ".inf-c b small{font-size:13px;color:var(--dim)}"+
  ".inf-c span{font-size:11px;color:var(--dim);line-height:1.2;display:block;margin-top:2px}"+
  ".inf-a{display:flex;gap:10px;align-items:center;background:#241a44;border:1px solid #3a2f60;"+
   "border-radius:14px;padding:10px;margin-bottom:8px}"+
  ".inf-a img{width:52px;height:52px;border-radius:12px;object-fit:cover;flex:0 0 auto}"+
  ".inf-a-t{flex:1;min-width:0}.inf-a-t b{display:block;font-size:15px}"+
  ".inf-a-t span{display:block;font-size:12px;color:var(--dim);margin-top:1px}"+
  ".inf-lec{color:var(--cyan)!important}"+
  ".inf-bar{height:7px;background:#1a1233;border-radius:5px;overflow:hidden;margin-top:6px}"+
  ".inf-bar i{display:block;height:100%;background:linear-gradient(90deg,var(--cyan),var(--violet))}"+
  "#scr-informe h3{font-family:'Titan One',sans-serif;font-size:16px;margin:4px 0 2px}"+
  ".inf-sub{font-size:13px;color:var(--dim);margin:0 0 8px;line-height:1.4}"+
  ".inf-t{background:#241a44;border:1px solid #3a2f60;border-radius:14px;padding:10px 12px;margin-bottom:8px}"+
  ".inf-t b{font-size:13px;color:var(--gold)}.inf-t ul{margin:4px 0 0;padding-left:18px}"+
  ".inf-t li{font-size:14px;line-height:1.45;margin:2px 0}"+
  ".inf-x{font-size:13px;color:var(--dim);margin:2px 0}"+
  ".inf-pie{font-size:12px;color:var(--dim);line-height:1.5;border-top:1px solid #3a2f60;padding-top:10px}";

 const HTML =
  '<div class="inf-top"><button class="btn" id="infSalir">← Salir</button></div>'+
  '<h2 class="inf-h">📊 Cómo va <span id="infNombre"></span></h2>'+
  '<p class="inf-visto" id="infVisto"></p>'+
  '<div class="inf-cifras" id="infCifras"></div>'+
  '<div id="infAsigs"></div>'+
  '<div id="infExtras"></div>'+
  '<div id="infCuesta"></div>'+
  '<h3>🏅 Logros</h3><p class="inf-sub" id="infLogros"></p>'+
  /* Este pie no es letra chica de trámite: es lo que evita que el informe se lea como
     una nota. Va dentro de la pantalla, no en un enlace que nadie abre. */
  '<p class="inf-pie">Esto no es una calificación: es para saber por dónde va y de qué '+
  'conversar en casa. Las estrellas miden cuánto le salió bien en cada etapa. '+
  /* ⚠️ Esta frase decía "no se envía a nadie" y era FALSA desde el Bloque D: el avance
     sube al servidor como una foto, para que no se pierda al cambiar de teléfono. Una
     afirmación de privacidad equivocada en una pantalla para apoderados es exactamente
     lo que pregunta una UTP, así que dice lo que de verdad pasa. */
  'Este resumen se arma en el teléfono. Su avance además se guarda en su cuenta para que '+
  'no se pierda si cambia de aparato; el profesor ve el avance del curso, no esta pantalla.</p>';

 function montar(){
  if(document.getElementById('scr-informe')) return;
  const st=document.createElement('style'); st.textContent=CSS; document.head.appendChild(st);
  const s=document.createElement('section'); s.id='scr-informe'; s.className='screen';
  s.innerHTML=HTML;
  const cont=document.querySelector('.wrap')||document.body; cont.appendChild(s);
  s.querySelector('#infSalir').onclick=()=>{ SND.tap(); go('scr-rol'); };
 }

 window.abrirInforme=function(){
  montar();
  renderInforme();
  go('scr-informe');
 };
})();
