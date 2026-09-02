/* ============================================================================
   VULPO · MINI-CLASES (compartido por los tres cursos)

   POR QUE EXISTE. El camino de aprendizaje de Matematica —12 diagramas SVG
   interactivos + el motor que recorre los bloques de una leccion— vivia SOLO en
   8vo/index.html. La Sesion 65 lo corto de 3 y 7 porque ahi era codigo muerto;
   al darles su propio lecciones.json volvio a hacer falta, y copiarlo por fork
   serian SEIS copias al llegar a 6 basico.

   ⚠️ NACE DORMIDO. Despierta con LECC.init({ruta, hayReto}) desde cada curso, y esa
   llamada va PEGADA a la declaracion de sus datos: un `const` leido antes de
   declararse mata todo el JavaScript, y esa trampa ya mordio cuatro veces.

   ⚠️ INYECTA SU CSS **Y SU PANTALLA**. La Sesion 65 se llevo de 7 y 3 el markup de
   scr-leccion pero les dejo las 13 reglas de CSS, huerfanas desde entonces. En vez
   de restaurar el markup en cada fork, lo pone el modulo —el patron que revision.js
   ya valido en produccion—, asi integrar un curso nuevo son DOS lineas. Y por eso
   init() se llama DESPUES del HTML: los <script src> viven en el <head>, cuando el
   body todavia no existe.

   ⚠️ NO ES EL RETO DE CALCULO. Vivian pegados en el archivo pero son cosas distintas;
   el Reto se queda en 8vo/index.html (medido en la Sesion 74). Lo unico que los
   toca es el nodo del Reto en el mapa, guardado con CFG.hayReto.

   QUIEN LO LLAMA DESDE FUERA (medido al cortar, y eran CINCO y no tres):
     motor.js:42    cargarPoolMate       -> LECC.cargarPool
     motor.js:785   renderCampanaMate    -> LECC.renderCampana
     motor.js:1454  finPracticaLeccion   -> LECC.finPractica
     motor.js:1538  abrirMiniClaseDeOA   -> LECC.abrirMiniClaseDeOA
     btnBack (x3)   volverAlCapituloMate -> LECC.volverAlCapitulo
   Mas LECC.abrirUnidad(id), que usa el catalogo EXTRAS del armador.
   ============================================================================ */
(function () {
  'use strict';

  /* `rutas` es una LISTA porque una asignatura nueva trae su propio archivo de lecciones
     (Matemática las suyas, Ciencias sus introducciones). Se conserva `ruta` en singular por
     compatibilidad con los tres cursos que ya lo llaman así. Cada lección se marca al cargar
     con el banco que le toca —su archivo de al lado—, y por eso la práctica no necesita saber
     de qué asignatura es: ver el ⚠️ de preguntasDeOA. */
  var CFG = { rutas: [], hayReto: false };

  var CSS = "#scr-leccion{padding:16px}#scr-leccion.on{display:flex;flex-direction:column;gap:12px}.lec-top{display:flex;align-items:center;gap:10px}.lec-top .btn{width:auto;flex:0 0 auto;padding:8px 16px;font-size:15px;margin:0}.lec-prog{flex:1;height:8px;background:#241a44;border-radius:6px;overflow:hidden}#lecProgBar{height:100%;width:0;background:linear-gradient(90deg,var(--cyan),var(--violet));transition:width .3s}.lec-titulo{font-family:'Titan One',sans-serif;font-size:20px;margin:2px 0}.lec-cuerpo{background:#241a44;border:1px solid #3a2f60;border-radius:16px;padding:16px;min-height:220px}.lec-cuerpo p{font-size:15px;line-height:1.5}.lec-cuerpo img{max-width:100%;border-radius:12px;display:block;margin:0 auto}.lec-diag{width:100%;overflow-x:auto}.lec-ejemplo-paso{opacity:.35;transition:opacity .3s;margin:6px 0;font-size:15px}.lec-ejemplo-paso.on{opacity:1}.lec-cont{width:100%}";

  var PANTALLA = '  <section class="screen" id="scr-leccion">\n    <div class="lec-top">\n      <button id="lecSalir" class="btn sec">← Salir</button>\n      <div class="lec-prog"><div id="lecProgBar"></div></div>\n    </div>\n    <h2 id="lecTitulo" class="lec-titulo"></h2>\n    <div id="lecCuerpo" class="lec-cuerpo"></div>\n    <button id="lecEscuchar" class="btn-escuchar" hidden>🔊 Escuchar</button>\n    <button id="lecCont" class="btn lec-cont">Continuar</button>\n  </section>\n';

  /* Inyecta la pantalla y el CSS, y cablea sus dos botones. Se llama desde init(),
     nunca al cargar el archivo: aqui arriba el <body> todavia no existe. */
  function montar() {
    if (!document.getElementById('lecc-css')) {
      var s = document.createElement('style');
      s.id = 'lecc-css'; s.textContent = CSS;
      (document.head || document.documentElement).appendChild(s);
    }
    if (!document.getElementById('scr-leccion')) {
      var ref = document.querySelector('.screen');
      if (!ref || !ref.parentNode) return false;
      var caja = document.createElement('div');
      caja.innerHTML = PANTALLA;
      ref.parentNode.appendChild(caja.firstElementChild);
    }
    var salir = document.getElementById('lecSalir');
    var cont  = document.getElementById('lecCont');
    if (!salir || !cont) return false;
    /* El 🔊 lee el bloque que se esta mostrando, y se cablea UNA vez leyendo el texto en el
       momento del clic (mismo patron que los 🔊 de la meta y del resultado en voz.js). En 7° y
       8° el boton nunca se muestra, porque VOZ.activo es false: no hace falta una bandera. */
    var esc = document.getElementById('lecEscuchar');
    if (esc) esc.onclick = function () { leerEnVoz(textoLocutable(LEC && LEC.leccion ? LEC.leccion.bloques[LEC.idx] : null)); };
    salir.onclick = function () { SND.tap(); volverAlCapituloMate(); };
    cont.onclick  = function () { SND.tap(); avanzarBloque(); };
    return true;
  }

/* ================= CATÁLOGO DE DIAGRAMAS (SVG interactivo) =================
   Cada widget: DIAGRAMAS[kind](params, nodo) dibuja SVG dentro de `nodo`.
   Sin librerías. Limpia sus propios listeners al re-montar (nodo.innerHTML=''). */
const NS='http://www.w3.org/2000/svg';
function svgEl(tag,attrs){const e=document.createElementNS(NS,tag);
 for(const k in attrs)e.setAttribute(k,attrs[k]);return e;}
const DIAGRAMAS={};
function montarDiagrama(kind,params,nodo){
 nodo.innerHTML=''; nodo.className='lec-diag';
 const fn=DIAGRAMAS[kind];
 if(fn){
  try{fn(params||{},nodo);}catch(e){console.error('Diagrama',kind,e);nodo.textContent='';}
  return;
 }
 /* Si el tipo no esta en ESTE catalogo, se busca en el de assets/js/visuales.js, que son
    los 11 dibujos ESTATICOS de las preguntas. Los dos catalogos siguen siendo distintos a
    proposito -uno se arrastra y el otro ilustra- pero una leccion tiene todo el derecho a
    usar un dibujo estatico: el globo terraqueo y las zonas climaticas de HI03 ya existian
    ahi, y duplicarlos aqui habria sido copiar 80 lineas para tener dos versiones que
    divergen. renderVisual devuelve HTML, asi que se monta como texto. */
 if(typeof renderVisual==='function'){
  const p=Object.assign({tipo:kind}, params||{});
  const html=renderVisual(p);
  if(html){ nodo.innerHTML=html; return; }
 }
 nodo.textContent='(diagrama no disponible)';
}

// recta numérica: marca un punto (arrastrable) e intervalos con círculo abierto/cerrado.
// params: {min=-6,max=6, marca:number, interactivo:bool, intervalo:{desde,tipo:'>'|'>='|...},
//          paso=1, signo=true, saltos=false}
// ⚠️ `paso` y `signo` nacieron para 3°, y sus valores por omisión dejan 7° y 8° EXACTOS:
//    sin paso, contar de 100 en 100 hasta 1.000 dibujaría 1.001 marcas; y sin `signo:false`
//    la recta le escribe "+5" a un niño de 8 años, que todavía no ve números con signo.
//    `saltos` dibuja el arco entre marca y marca: es lo que convierte una regla en el gesto
//    de ir contando de 5 en 5, que es justo lo que pide el MA03 OA 01.
DIAGRAMAS.recta=function(p,nodo){
 const min=p.min??-6,max=p.max??6,paso=Math.max(1,p.paso??1),signo=p.signo!==false,x0=24,x1=336,y=54;
 const svg=svgEl('svg',{viewBox:'0 0 360 90',role:'img','aria-label':'Recta numérica'});
 svg.style.touchAction='none';
 const xOf=v=>x0+(v-min)/(max-min)*(x1-x0);
 svg.appendChild(svgEl('line',{x1:x0,y1:y,x2:x1,y2:y,stroke:'#5a4b8f','stroke-width':2}));
 for(let v=min;v<=max;v+=paso){
  svg.appendChild(svgEl('line',{x1:xOf(v),y1:y-4,x2:xOf(v),y2:y+4,stroke:'#5a4b8f','stroke-width':1.5}));
  const t=svgEl('text',{x:xOf(v),y:y+22,'text-anchor':'middle',fill:'#a99fd0','font-size':9});
  t.textContent=v; svg.appendChild(t);
  // el arco hasta la marca siguiente: el salto se VE, no se enuncia
  if(p.saltos && v+paso<=max){const xa=xOf(v),xb=xOf(v+paso);
   svg.appendChild(svgEl('path',{d:'M '+xa+' '+(y-6)+' Q '+((xa+xb)/2)+' '+(y-24)+' '+xb+' '+(y-6),
    fill:'none',stroke:'#3ee089','stroke-width':1.8}));
  }
 }
 // intervalo opcional (para inecuaciones): sombra + círculo abierto/cerrado
 if(p.intervalo){const it=p.intervalo, cerrado=/=/.test(it.tipo||''), haciaDer=/>/.test(it.tipo||'');
  const xd=xOf(it.desde), xf=haciaDer?x1:x0;
  svg.appendChild(svgEl('line',{x1:xd,y1:y,x2:xf,y2:y,stroke:'#3ee089','stroke-width':4}));
  svg.appendChild(svgEl('circle',{cx:xd,cy:y,r:6,fill:cerrado?'#3ee089':'#241a44',stroke:'#3ee089','stroke-width':2}));
 }
 // marcador (arrastrable si interactivo)
 let cur=p.marca??0;
 const knob=svgEl('circle',{cy:y,r:11,fill:'#8f6bff',stroke:'#4dd8ff','stroke-width':2.5});
 const lbl=svgEl('text',{y:y-24,'text-anchor':'middle',fill:'#ffc93c','font-family':"'Titan One',sans-serif",'font-size':16});
 function set(v){const n=min+Math.round((v-min)/paso)*paso;      // se posa en una marca, no entre dos
  cur=Math.max(min,Math.min(max,n));const x=xOf(cur);
  knob.setAttribute('cx',x);lbl.setAttribute('x',x);lbl.textContent=(signo&&cur>0?'+':'')+cur;}
 svg.appendChild(knob);svg.appendChild(lbl);set(cur);
 if(p.interactivo){
  const toVal=cx=>{const r=svg.getBoundingClientRect();const px=(cx-r.left)/r.width*360;
   return min+(px-x0)/(x1-x0)*(max-min);};
  let drag=false;
  knob.addEventListener('pointerdown',e=>{drag=true;knob.setPointerCapture(e.pointerId);});
  svg.addEventListener('pointermove',e=>{if(drag)set(toVal(e.clientX));});
  svg.addEventListener('pointerup',()=>{drag=false;});
  svg.addEventListener('pointerdown',e=>{if(e.target!==knob)set(toVal(e.clientX));});
 }
 nodo.appendChild(svg);
};

// fracciones/%: barra partida en `partes`, con `pintadas` resaltadas.
// params: {partes=4, pintadas=1, etiqueta:'1/4'}
DIAGRAMAS.fracciones=function(p,nodo){
 const partes=Math.max(1,p.partes??4), pint=Math.max(0,Math.min(partes,p.pintadas??0));
 const w=320,h=70,x0=20,y0=14,bw=w-40;
 const svg=svgEl('svg',{viewBox:`0 0 ${w} ${h+20}`,role:'img','aria-label':'Fracción'});
 const cw=bw/partes;
 for(let i=0;i<partes;i++){
  svg.appendChild(svgEl('rect',{x:x0+i*cw,y:y0,width:cw-2,height:38,rx:4,
   fill:i<pint?'#8f6bff':'#241a44',stroke:'#5a4b8f','stroke-width':1.5}));
 }
 const t=svgEl('text',{x:w/2,y:h+8,'text-anchor':'middle',fill:'#ffc93c',
  'font-family':"'Titan One',sans-serif",'font-size':16});
 t.textContent=p.etiqueta||`${pint}/${partes}`; svg.appendChild(t);
 nodo.appendChild(svg);
};

// potencias/raíces: cuadrícula base×base que ilustra un cuadrado (área) o la raíz como lado.
// params: {lado=3, etiqueta:'3² = 9'}
DIAGRAMAS.potencias=function(p,nodo){
 const lado=Math.max(1,Math.min(10,p.lado??3)), cell=24, o=16;
 const size=lado*cell, svg=svgEl('svg',{viewBox:`0 0 ${size+2*o} ${size+2*o+18}`,
  role:'img','aria-label':'Potencia'});
 for(let r=0;r<lado;r++)for(let c=0;c<lado;c++){
  svg.appendChild(svgEl('rect',{x:o+c*cell,y:o+r*cell,width:cell-2,height:cell-2,rx:3,
   fill:'#4dd8ff',opacity:.85,stroke:'#241a44','stroke-width':1}));
 }
 const t=svgEl('text',{x:o+size/2,y:size+2*o+8,'text-anchor':'middle',fill:'#ffc93c',
  'font-family':"'Titan One',sans-serif",'font-size':15});
 t.textContent=p.etiqueta||`${lado}² = ${lado*lado}`; svg.appendChild(t);
 nodo.appendChild(svg);
};

// circulo: radio, diametro y el contorno, con sus medidas. Para MA07 OA 11.
// params: {radio=60, mostrar:'radio'|'diametro'|'ambos', etiqueta}
DIAGRAMAS.circulo=function(p,nodo){
 const R=Math.max(30,Math.min(80,p.radio??60)), cx=120, cy=R+14, W=240, H=2*R+52;
 const svg=svgEl('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':'Círculo con su radio y su diámetro'});
 svg.appendChild(svgEl('circle',{cx,cy,r:R,fill:'#8f6bff22',stroke:'#4dd8ff','stroke-width':3}));
 svg.appendChild(svgEl('circle',{cx,cy,r:3.5,fill:'#ffc93c'}));
 const ver=p.mostrar||'ambos';
 if(ver==='diametro'||ver==='ambos'){
  svg.appendChild(svgEl('line',{x1:cx-R,y1:cy,x2:cx+R,y2:cy,stroke:'#ff4d8d','stroke-width':2.5}));
  // La etiqueta va corrida a la izquierda: centrada, la palabra choca con la linea
  // del radio, que sale del centro hacia arriba. Se vio mirando la captura.
  const d=svgEl('text',{x:cx-R/2,y:cy-8,'text-anchor':'middle',fill:'#ff4d8d','font-size':13});
  d.textContent='diámetro'; svg.appendChild(d);
 }
 if(ver==='radio'||ver==='ambos'){
  svg.appendChild(svgEl('line',{x1:cx,y1:cy,x2:cx,y2:cy-R,stroke:'#3ee089','stroke-width':2.5}));
  const r=svgEl('text',{x:cx+6,y:cy-R/2,fill:'#3ee089','font-size':13});
  r.textContent='radio'; svg.appendChild(r);
 }
 const t=svgEl('text',{x:cx,y:H-8,'text-anchor':'middle',fill:'#ffc93c',
  'font-family':"'Titan One',sans-serif",'font-size':14});
 t.textContent=p.etiqueta||'diámetro = 2 · radio'; svg.appendChild(t);
 nodo.appendChild(svg);
};

// poligono: un poligono regular de n lados, partido en triangulos desde un vertice.
// Es la idea que sostiene la formula (n-2)·180°, asi que el dibujo la MUESTRA en vez
// de enunciarla. Para MA07 OA 10.
// params: {lados=6, etiqueta}
DIAGRAMAS.poligono=function(p,nodo){
 const n=Math.max(3,Math.min(10,p.lados??6)), R=70, cx=110, cy=88, W=220, H=196;
 const svg=svgEl('svg',{viewBox:`0 0 ${W} ${H}`,role:'img',
  'aria-label':`Polígono de ${n} lados partido en triángulos`});
 const pt=[];
 for(let i=0;i<n;i++){
  const a=-Math.PI/2 + i*2*Math.PI/n;
  pt.push([cx+R*Math.cos(a), cy+R*Math.sin(a)]);
 }
 svg.appendChild(svgEl('polygon',{points:pt.map(q=>q[0].toFixed(1)+','+q[1].toFixed(1)).join(' '),
  fill:'#8f6bff22',stroke:'#4dd8ff','stroke-width':3}));
 // Las diagonales desde el primer vertice: n-2 triangulos.
 for(let i=2;i<n-1;i++){
  svg.appendChild(svgEl('line',{x1:pt[0][0],y1:pt[0][1],x2:pt[i][0],y2:pt[i][1],
   stroke:'#ffc93c','stroke-width':1.6,'stroke-dasharray':'4 3'}));
 }
 const t=svgEl('text',{x:cx,y:H-8,'text-anchor':'middle',fill:'#ffc93c',
  'font-family':"'Titan One',sans-serif",'font-size':14});
 t.textContent=p.etiqueta||`${n} lados → ${n-2} triángulos`; svg.appendChild(t);
 nodo.appendChild(svg);
};

// figura: triangulo, paralelogramo o trapecio con su base y su altura marcadas.
// params: {tipo:'triangulo'|'paralelogramo'|'trapecio', base=8, altura=5, etiqueta}
DIAGRAMAS.figura=function(p,nodo){
 const tipo=p.tipo||'triangulo', W=260, H=170, x0=30, y0=126, esc=18;
 const b=Math.max(2,Math.min(10,p.base??8)), h=Math.max(2,Math.min(6,p.altura??5));
 const bw=b*esc, hh=h*esc, svg=svgEl('svg',{viewBox:`0 0 ${W} ${H}`,role:'img',
  'aria-label':`Figura de base ${b} y altura ${h}`});
 let pts, apex=x0+bw/2;
 if(tipo==='paralelogramo') pts=[[x0,y0],[x0+bw,y0],[x0+bw+22,y0-hh],[x0+22,y0-hh]];
 else if(tipo==='trapecio')  pts=[[x0,y0],[x0+bw,y0],[x0+bw-26,y0-hh],[x0+26,y0-hh]];
 else                        pts=[[x0,y0],[x0+bw,y0],[apex+14,y0-hh]];
 svg.appendChild(svgEl('polygon',{points:pts.map(q=>q[0]+','+q[1]).join(' '),
  fill:'#8f6bff22',stroke:'#4dd8ff','stroke-width':3}));
 // altura: linea punteada desde el lado de arriba hasta la base, con su angulo recto
 const ax=(tipo==='triangulo')?apex+14:x0+22+bw/3;
 svg.appendChild(svgEl('line',{x1:ax,y1:y0-hh,x2:ax,y2:y0,stroke:'#3ee089',
  'stroke-width':2,'stroke-dasharray':'5 3'}));
 svg.appendChild(svgEl('rect',{x:ax,y:y0-11,width:11,height:11,fill:'none',
  stroke:'#3ee089','stroke-width':1.4}));
 const ta=svgEl('text',{x:ax+7,y:y0-hh/2,fill:'#3ee089','font-size':13});
 ta.textContent='altura'; svg.appendChild(ta);
 svg.appendChild(svgEl('line',{x1:x0,y1:y0+10,x2:x0+bw,y2:y0+10,stroke:'#ff4d8d','stroke-width':2}));
 const tb=svgEl('text',{x:x0+bw/2,y:y0+26,'text-anchor':'middle',fill:'#ff4d8d','font-size':13});
 tb.textContent='base'; svg.appendChild(tb);
 const t=svgEl('text',{x:W/2,y:H-6,'text-anchor':'middle',fill:'#ffc93c',
  'font-family':"'Titan One',sans-serif",'font-size':14});
 t.textContent=p.etiqueta||''; svg.appendChild(t);
 nodo.appendChild(svg);
};

// bloques: los bloques multibase de 3 basico. La centena es un cuadrado con su cuadricula
// de 10x10, la decena una barra de 10 y la unidad un cubito. Para MA03 OA 02 y OA 05.
// params: {numero=342, etiqueta}
DIAGRAMAS.bloques=function(p,nodo){
 const n=Math.max(0,Math.min(999,p.numero??342));
 const c=Math.floor(n/100), d=Math.floor((n%100)/10), u=n%10;
 const W=380,H=168, xb=68;
 const svg=svgEl('svg',{viewBox:'0 0 '+W+' '+H,role:'img',
  'aria-label':'El número '+n+' en bloques de cien, de diez y de uno'});
 function rotulo(y,txt){const t=svgEl('text',{x:6,y:y,fill:'#a99fd0','font-size':11});
  t.textContent=txt; svg.appendChild(t);}
 // centenas: cuadrado con su cuadricula, para que se vea que son 10 filas de 10
 for(let i=0;i<c;i++){const x=xb+i*34, y=14;
  svg.appendChild(svgEl('rect',{x,y,width:30,height:30,rx:2,fill:'#8f6bff',opacity:.85,
   stroke:'#4dd8ff','stroke-width':1.5}));
  for(let k=1;k<10;k++){
   svg.appendChild(svgEl('line',{x1:x+k*3,y1:y,x2:x+k*3,y2:y+30,stroke:'#241a44','stroke-width':.4}));
   svg.appendChild(svgEl('line',{x1:x,y1:y+k*3,x2:x+30,y2:y+k*3,stroke:'#241a44','stroke-width':.4}));
  }
 }
 rotulo(32, c+(c===1?' centena':' centenas'));
 // decenas: barra partida en 10
 for(let i=0;i<d;i++){const x=xb+i*14, y=58;
  svg.appendChild(svgEl('rect',{x,y,width:9,height:30,rx:2,fill:'#4dd8ff',opacity:.9,
   stroke:'#241a44','stroke-width':1}));
  for(let k=1;k<10;k++)svg.appendChild(svgEl('line',{x1:x,y1:y+k*3,x2:x+9,y2:y+k*3,
   stroke:'#241a44','stroke-width':.4}));
 }
 rotulo(76, d+(d===1?' decena':' decenas'));
 // unidades: cubitos sueltos
 for(let i=0;i<u;i++){
  svg.appendChild(svgEl('rect',{x:xb+i*13,y:102,width:9,height:9,rx:2,fill:'#ffc93c',
   stroke:'#241a44','stroke-width':1}));
 }
 rotulo(111, u+(u===1?' unidad':' unidades'));
 const t=svgEl('text',{x:W/2,y:H-14,'text-anchor':'middle',fill:'#ffc93c',
  'font-family':"'Titan One',sans-serif",'font-size':17});
 t.textContent=p.etiqueta||(c*100)+' + '+(d*10)+' + '+u+' = '+n; svg.appendChild(t);
 nodo.appendChild(svg);
};

// posicional: la tabla de centenas, decenas y unidades de uno o DOS numeros. Con `contra`,
// marca la primera columna en que se diferencian, que es como se ENSEÑA a comparar
// (MA03 OA 03): no se comparan los numeros enteros, se busca la primera cifra distinta.
// params: {numero=415, contra:null, etiqueta}
DIAGRAMAS.posicional=function(p,nodo){
 const a=Math.max(0,Math.min(999,p.numero??415));
 const hayB=p.contra!=null, b=hayB?Math.max(0,Math.min(999,p.contra)):0;
 const cif=v=>[Math.floor(v/100), Math.floor((v%100)/10), v%10];
 const A=cif(a), B=cif(b);
 let dif=-1; if(hayB) for(let i=0;i<3;i++) if(A[i]!==B[i]){dif=i;break;}
 const W=300, cw=70, x0=16, y0=16, rh=40, filas=hayB?2:1, H=y0+22+filas*rh+26;
 const svg=svgEl('svg',{viewBox:'0 0 '+W+' '+H,role:'img',
  'aria-label':hayB?'Tabla de valor posicional con dos números':('Tabla de valor posicional del número '+a)});
 ['centenas','decenas','unidades'].forEach((nom,i)=>{
  const t=svgEl('text',{x:x0+i*cw+(cw-4)/2,y:y0+10,'text-anchor':'middle',fill:'#a99fd0','font-size':11});
  t.textContent=nom; svg.appendChild(t);
 });
 [A,B].slice(0,filas).forEach((fila,f)=>{
  const y=y0+22+f*rh;
  fila.forEach((v,i)=>{
   const marcada=(i===dif);
   svg.appendChild(svgEl('rect',{x:x0+i*cw,y,width:cw-4,height:rh-6,rx:6,
    fill:marcada?'#8f6bff55':'#241a44',stroke:marcada?'#ffc93c':'#5a4b8f','stroke-width':marcada?2.5:1.5}));
   const t=svgEl('text',{x:x0+i*cw+(cw-4)/2,y:y+rh-16,'text-anchor':'middle',
    fill:marcada?'#ffc93c':'#fff','font-family':"'Titan One',sans-serif",'font-size':19});
   t.textContent=v; svg.appendChild(t);
  });
  const n=svgEl('text',{x:x0+3*cw+2,y:y+rh-16,fill:'#a99fd0','font-size':13});
  n.textContent=(f===0?a:b); svg.appendChild(n);
 });
 const t=svgEl('text',{x:W/2,y:H-6,'text-anchor':'middle',fill:'#ffc93c',
  'font-family':"'Titan One',sans-serif",'font-size':15});
 t.textContent=p.etiqueta||(hayB?(a>b?(a+' es mayor que '+b):(a+' es menor que '+b)):String(a));
 svg.appendChild(t);
 nodo.appendChild(svg);
};

// dinero: monedas y billetes chilenos. Para MA03 OA 10, que es el unico OA del proyecto
// cuyo contexto esta escrito en el curriculum ("problemas que incluyan dinero").
// params: {valores:[100,100,500], etiqueta}
DIAGRAMAS.dinero=function(p,nodo){
 const vals=(p.valores||[100,500]).slice(0,10);
 const W=360, H=118;
 const svg=svgEl('svg',{viewBox:'0 0 '+W+' '+H,role:'img','aria-label':'Monedas y billetes'});
 let x=14, total=0;
 vals.forEach(v=>{
  total+=v;
  if(v>=1000){   // billete
   svg.appendChild(svgEl('rect',{x,y:26,width:56,height:34,rx:4,fill:'#3ee089',opacity:.85,
    stroke:'#241a44','stroke-width':1.5}));
   const t=svgEl('text',{x:x+28,y:47,'text-anchor':'middle',fill:'#12102a',
    'font-family':"'Titan One',sans-serif",'font-size':13});
   t.textContent='$'+v; svg.appendChild(t);
   x+=62;
  }else{         // moneda
   svg.appendChild(svgEl('circle',{cx:x+18,cy:43,r:18,fill:'#ffc93c',
    stroke:'#c99a1e','stroke-width':2}));
   const t=svgEl('text',{x:x+18,y:48,'text-anchor':'middle',fill:'#4a3608',
    'font-family':"'Titan One',sans-serif",'font-size':12});
   t.textContent=v; svg.appendChild(t);
   x+=42;
  }
 });
 const t=svgEl('text',{x:W/2,y:H-14,'text-anchor':'middle',fill:'#ffc93c',
  'font-family':"'Titan One',sans-serif",'font-size':17});
 t.textContent=p.etiqueta||('Total: $'+total); svg.appendChild(t);
 nodo.appendChild(svg);
};

// cuadricula: un mapa simple con columnas por LETRA y filas por NUMERO, y una casilla
// marcada. Para MA03 OA 14. ⚠️ El orden (letra=columna, numero=fila) es el que declaran
// las 15 preguntas de ese OA en el banco: invertirlo dejaria la clase contradiciendo al
// banco, y ya paso una vez que un informe externo lo pidiera al reves (Sesion 56).
// params: {cols=5, filas=4, marca:[col,fila] (1..n), etiqueta}
DIAGRAMAS.cuadricula=function(p,nodo){
 const cols=Math.max(2,Math.min(8,p.cols??5)), filas=Math.max(2,Math.min(6,p.filas??4));
 // ⚠️ El viewBox se ancla a un MINIMO de 300: con 5 columnas el ancho natural son 176, y
 // una etiqueta como "Vulpi está en la casilla (C, 2)" se salia por el borde y quedaba
 // CORTADA. No lo delata ninguna medicion —scrollWidth no desborda, el SVG solo escala—:
 // se vio mirando la captura.
 const c=26, y0=22, anchoRejilla=cols*c, W=Math.max(300, anchoRejilla+46),
       x0=Math.round((W-anchoRejilla)/2)+8, H=y0+filas*c+34;
 const svg=svgEl('svg',{viewBox:'0 0 '+W+' '+H,role:'img',
  'aria-label':'Cuadrícula con una casilla marcada'});
 const LET='ABCDEFGH';
 for(let i=0;i<cols;i++){const tt=svgEl('text',{x:x0+i*c+c/2,y:y0-6,'text-anchor':'middle',
  fill:'#a99fd0','font-size':12}); tt.textContent=LET[i]; svg.appendChild(tt);}
 for(let j=0;j<filas;j++){const tt=svgEl('text',{x:x0-10,y:y0+j*c+c/2+4,'text-anchor':'middle',
  fill:'#a99fd0','font-size':12}); tt.textContent=(j+1); svg.appendChild(tt);}
 const mc=p.marca?p.marca[0]:0, mf=p.marca?p.marca[1]:0;
 for(let j=0;j<filas;j++)for(let i=0;i<cols;i++){
  const puesta=(i+1===mc && j+1===mf);
  svg.appendChild(svgEl('rect',{x:x0+i*c,y:y0+j*c,width:c,height:c,
   fill:puesta?'#8f6bff':'#241a44',stroke:'#5a4b8f','stroke-width':1}));
 }
 if(mc&&mf){const e=svgEl('text',{x:x0+(mc-1)*c+c/2,y:y0+(mf-1)*c+c/2+6,'text-anchor':'middle',
  'font-size':15}); e.textContent='🦊'; svg.appendChild(e);}
 const t=svgEl('text',{x:W/2,y:H-10,'text-anchor':'middle',fill:'#ffc93c',
  'font-family':"'Titan One',sans-serif",'font-size':15});
 t.textContent=p.etiqueta||''; svg.appendChild(t);
 nodo.appendChild(svg);
};

// reloj: reloj analogo con sus dos manecillas. Para MA03 OA 20.
// params: {hora=3, minutos=0, etiqueta}
DIAGRAMAS.reloj=function(p,nodo){
 const h=((p.hora??3)%12+12)%12, m=((p.minutos??0)%60+60)%60;
 const R=62, cx=90, cy=76, W=180, H=168;
 const svg=svgEl('svg',{viewBox:'0 0 '+W+' '+H,role:'img','aria-label':'Reloj con manecillas'});
 svg.appendChild(svgEl('circle',{cx,cy,r:R,fill:'#241a44',stroke:'#4dd8ff','stroke-width':3}));
 for(let i=0;i<12;i++){
  const a=(i/12)*2*Math.PI-Math.PI/2;
  const tt=svgEl('text',{x:cx+(R-13)*Math.cos(a),y:cy+(R-13)*Math.sin(a)+4,
   'text-anchor':'middle',fill:'#a99fd0','font-size':11});
  tt.textContent=(i===0?12:i); svg.appendChild(tt);
 }
 // el minutero primero (mas largo), despues el horario, que ademas AVANZA con los minutos
 const am=(m/60)*2*Math.PI-Math.PI/2;
 svg.appendChild(svgEl('line',{x1:cx,y1:cy,x2:cx+(R-22)*Math.cos(am),y2:cy+(R-22)*Math.sin(am),
  stroke:'#4dd8ff','stroke-width':3,'stroke-linecap':'round'}));
 const ah=((h+m/60)/12)*2*Math.PI-Math.PI/2;
 svg.appendChild(svgEl('line',{x1:cx,y1:cy,x2:cx+(R-36)*Math.cos(ah),y2:cy+(R-36)*Math.sin(ah),
  stroke:'#ffc93c','stroke-width':4.5,'stroke-linecap':'round'}));
 svg.appendChild(svgEl('circle',{cx,cy,r:4,fill:'#ff4d8d'}));
 const t=svgEl('text',{x:W/2,y:H-14,'text-anchor':'middle',fill:'#ffc93c',
  'font-family':"'Titan One',sans-serif",'font-size':17});
 t.textContent=p.etiqueta||''; svg.appendChild(t);
 nodo.appendChild(svg);
};

// pictograma: filas de iconos, cada uno con su ESCALA. Para MA03 OA 25, cuyo punto entero
// es que un dibujo puede valer mas de uno.
// params: {datos:[{etiqueta,valor}], icono:'🍎', escala=1, etiqueta}
DIAGRAMAS.pictograma=function(p,nodo){
 const datos=(p.datos||[]).slice(0,5), ic=p.icono||'⭐', esc=Math.max(1,p.escala??1);
 const W=360, fh=32, H=26+datos.length*fh+30;
 const svg=svgEl('svg',{viewBox:'0 0 '+W+' '+H,role:'img','aria-label':'Pictograma'});
 datos.forEach((d,i)=>{
  const y=26+i*fh;
  const et=svgEl('text',{x:8,y:y+16,fill:'#a99fd0','font-size':12});
  et.textContent=d.etiqueta; svg.appendChild(et);
  const n=Math.round(d.valor/esc);
  for(let k=0;k<Math.min(n,12);k++){
   const e=svgEl('text',{x:96+k*21,y:y+18,'font-size':17}); e.textContent=ic; svg.appendChild(e);
  }
 });
 const t=svgEl('text',{x:W/2,y:H-10,'text-anchor':'middle',fill:'#ffc93c',
  'font-family':"'Titan One',sans-serif",'font-size':15});
 t.textContent=p.etiqueta||(ic+' = '+esc); svg.appendChild(t);
 nodo.appendChild(svg);
};

// puntos: diagrama de puntos. Para MA03 OA 26, que lo pide POR SU NOMBRE — y hasta ahora
// sus preguntas se ilustraban con barras, que es otra cosa (anotado en la Sesion 55).
// params: {valores:[3,4,4,5], min, max, etiqueta}
DIAGRAMAS.puntos=function(p,nodo){
 const vals=(p.valores||[]).map(Number).filter(v=>!isNaN(v));
 const mn=p.min??Math.min.apply(null,vals.length?vals:[0]);
 const mx=p.max??Math.max.apply(null,vals.length?vals:[5]);
 const cuenta={}; vals.forEach(v=>cuenta[v]=(cuenta[v]||0)+1);
 const alto=Math.max(1,Math.max.apply(null,Object.values(cuenta).concat([1])));
 const c=30, x0=24, W=x0+(mx-mn+1)*c+14, base=24+alto*20, H=base+34;
 const svg=svgEl('svg',{viewBox:'0 0 '+W+' '+H,role:'img','aria-label':'Diagrama de puntos'});
 svg.appendChild(svgEl('line',{x1:x0-6,y1:base,x2:W-8,y2:base,stroke:'#5a4b8f','stroke-width':2}));
 for(let v=mn;v<=mx;v++){
  const x=x0+(v-mn)*c+c/2;
  const tt=svgEl('text',{x,y:base+18,'text-anchor':'middle',fill:'#a99fd0','font-size':12});
  tt.textContent=v; svg.appendChild(tt);
  for(let k=0;k<(cuenta[v]||0);k++){
   svg.appendChild(svgEl('circle',{cx:x,cy:base-12-k*20,r:7,fill:'#4dd8ff',
    stroke:'#241a44','stroke-width':1.5}));
  }
 }
 const t=svgEl('text',{x:W/2,y:H-8,'text-anchor':'middle',fill:'#ffc93c',
  'font-family':"'Titan One',sans-serif",'font-size':15});
 t.textContent=p.etiqueta||''; svg.appendChild(t);
 nodo.appendChild(svg);
};

// celula: la celula con sus partes rotuladas. Para las introducciones de Ciencias, que es la
// asignatura sin un solo dibujo en su banco: 0 de sus 1.374 preguntas lleva `visual`.
// ⚠️ Rotula solo lo que la introduccion nombra: un diagrama con las 12 organelas seria un
// poster, y la introduccion no evalua nada, asi que no gana precision, gana ruido.
// params: {tipo:'animal'|'vegetal', etiqueta}
DIAGRAMAS.celula=function(p,nodo){
 const veg=(p.tipo||'animal')==='vegetal';
 const W=320,H=206,cx=150,cy=96;
 const svg=svgEl('svg',{viewBox:'0 0 '+W+' '+H,role:'img',
  'aria-label':'Dibujo de una célula con sus partes'});
 if(veg) svg.appendChild(svgEl('rect',{x:cx-96,y:cy-62,width:192,height:124,rx:10,
  fill:'#3ee08922',stroke:'#3ee089','stroke-width':3}));
 svg.appendChild(svgEl(veg?'rect':'ellipse', veg
  ? {x:cx-88,y:cy-54,width:176,height:108,rx:8,fill:'#8f6bff22',stroke:'#4dd8ff','stroke-width':2.5}
  : {cx,cy,rx:92,ry:58,fill:'#8f6bff22',stroke:'#4dd8ff','stroke-width':3}));
 svg.appendChild(svgEl('circle',{cx:cx-16,cy,r:24,fill:'#8f6bff',opacity:.9,
  stroke:'#241a44','stroke-width':1.5}));
 svg.appendChild(svgEl('circle',{cx:cx-16,cy,r:8,fill:'#241a44'}));
 // mitocondria: la otra parte que la introduccion nombra
 svg.appendChild(svgEl('ellipse',{cx:cx+46,cy:cy-22,rx:20,ry:11,fill:'#ff4d8d',opacity:.85,
  stroke:'#241a44','stroke-width':1.2}));
 if(veg) svg.appendChild(svgEl('ellipse',{cx:cx+44,cy:cy+24,rx:18,ry:12,fill:'#3ee089',
  opacity:.9,stroke:'#241a44','stroke-width':1.2}));
 function rot(x,y,txt,col){const e=svgEl('text',{x,y,fill:col,'font-size':11});
  e.textContent=txt; svg.appendChild(e);}
 rot(6,cy+4,'núcleo','#a99fd0');
 svg.appendChild(svgEl('line',{x1:46,y1:cy,x2:cx-40,y2:cy,stroke:'#5a4b8f','stroke-width':1}));
 rot(cx+96,cy-24,'mitocondria','#ff4d8d');   // fuera del contorno: en cx+72 se encimaba
 if(veg) rot(cx+70,cy+28,'cloroplasto','#3ee089');
 rot(6,cy-66,veg?'pared celular':'membrana','#4dd8ff');
 const tt=svgEl('text',{x:W/2,y:H-10,'text-anchor':'middle',fill:'#ffc93c',
  'font-family':"'Titan One',sans-serif",'font-size':15});
 tt.textContent=p.etiqueta||(veg?'Célula vegetal':'Célula animal'); svg.appendChild(tt);
 nodo.appendChild(svg);
};

// circuito: pila, cable y ampolleta, abierto o cerrado. Es el modelo que explica por que la
// luz se enciende, y no hay forma honesta de decirlo solo con palabras.
// params: {cerrado:true, etiqueta}
DIAGRAMAS.circuito=function(p,nodo){
 const on=p.cerrado!==false;
 const W=300,H=170;
 const svg=svgEl('svg',{viewBox:'0 0 '+W+' '+H,role:'img',
  'aria-label':'Circuito eléctrico con una pila y una ampolleta'});
 const col=on?'#ffc93c':'#5a4b8f';
 // el cable
 const d='M 60 120 H 240 V 62 H 196';
 svg.appendChild(svgEl('path',{d,fill:'none',stroke:col,'stroke-width':3}));
 svg.appendChild(svgEl('path',{d:'M 60 120 V 62 H 104',fill:'none',stroke:col,'stroke-width':3}));
 // pila
 svg.appendChild(svgEl('rect',{x:104,y:48,width:34,height:28,rx:3,fill:'#3ee089',
  stroke:'#241a44','stroke-width':1.5}));
 const mas=svgEl('text',{x:121,y:68,'text-anchor':'middle',fill:'#12102a',
  'font-family':"'Titan One',sans-serif",'font-size':15}); mas.textContent='+';
 svg.appendChild(mas);
 // el interruptor: la parte que cambia
 svg.appendChild(svgEl('circle',{cx:152,cy:62,r:3.5,fill:col}));
 svg.appendChild(svgEl('circle',{cx:178,cy:62,r:3.5,fill:col}));
 svg.appendChild(svgEl('line',{x1:152,y1:62,x2:on?178:172,y2:on?62:42,
  stroke:col,'stroke-width':3,'stroke-linecap':'round'}));
 // ampolleta
 svg.appendChild(svgEl('circle',{cx:240,cy:120,r:0.1,fill:'none'}));
 svg.appendChild(svgEl('circle',{cx:150,cy:126,r:0.1,fill:'none'}));
 svg.appendChild(svgEl('circle',{cx:240,cy:120,r:1,fill:'none'}));
 svg.appendChild(svgEl('circle',{cx:150,cy:120,r:20,fill:on?'#ffc93c':'#241a44',
  stroke:on?'#fff4c2':'#5a4b8f','stroke-width':2.5,opacity:on?.95:1}));
 if(on) for(let i=0;i<8;i++){const a=i*Math.PI/4;
  svg.appendChild(svgEl('line',{x1:150+26*Math.cos(a),y1:120+26*Math.sin(a),
   x2:150+33*Math.cos(a),y2:120+33*Math.sin(a),stroke:'#ffc93c','stroke-width':2}));}
 const tt=svgEl('text',{x:W/2,y:H-8,'text-anchor':'middle',fill:'#ffc93c',
  'font-family':"'Titan One',sans-serif",'font-size':15});
 tt.textContent=p.etiqueta||(on?'Circuito cerrado: la ampolleta se enciende'
                               :'Circuito abierto: no pasa corriente'); svg.appendChild(tt);
 nodo.appendChild(svg);
};

// estados: solido, liquido y gas con sus particulas, y las flechas del cambio entre ellos.
// params: {etiqueta}
DIAGRAMAS.estados=function(p,nodo){
 const W=340,H=176;
 const svg=svgEl('svg',{viewBox:'0 0 '+W+' '+H,role:'img',
  'aria-label':'Las partículas en sólido, líquido y gas'});
 const cajas=[{x:14,nom:'sólido',n:16,orden:1},{x:126,nom:'líquido',n:12,orden:.5},
              {x:238,nom:'gas',n:7,orden:0}];
 cajas.forEach(c=>{
  svg.appendChild(svgEl('rect',{x:c.x,y:22,width:88,height:88,rx:6,fill:'#241a44',
   stroke:'#5a4b8f','stroke-width':2}));
  let k=0;
  for(let f=0;f<4 && k<c.n;f++)for(let g=0;g<4 && k<c.n;g++){
   // el orden es el punto: en el solido forman rejilla, en el gas van sueltas
   const jx=(1-c.orden)*(((k*37)%23)-11), jy=(1-c.orden)*(((k*53)%23)-11);
   svg.appendChild(svgEl('circle',{cx:c.x+18+g*18+jx,cy:40+f*18+jy,r:5.5,
    fill:'#4dd8ff',opacity:.9})); k++;
  }
  const e=svgEl('text',{x:c.x+44,y:126,'text-anchor':'middle',fill:'#a99fd0','font-size':12});
  e.textContent=c.nom; svg.appendChild(e);
 });
 [[102,'calor →'],[214,'calor →']].forEach(([x,txt])=>{
  const e=svgEl('text',{x:x+12,y:20,'text-anchor':'middle',fill:'#ff4d8d','font-size':11});
  e.textContent=txt; svg.appendChild(e);
 });
 const tt=svgEl('text',{x:W/2,y:H-8,'text-anchor':'middle',fill:'#ffc93c',
  'font-family':"'Titan One',sans-serif",'font-size':15});
 tt.textContent=p.etiqueta||'Las mismas partículas, más sueltas'; svg.appendChild(tt);
 nodo.appendChild(svg);
};

// tiempo: linea de tiempo con hitos ROTULADOS. Es el dibujo que pide Historia casi entera:
// lo que a un alumno le falta no es el dato sino saber DONDE ESTA en el tiempo.
// ⚠️ `recta` no sirve para esto: solo rotula numeros, y aqui hay que nombrar el hito
// ("1492 · llegan los europeos"). En el MA03 OA 19 alcanzaba porque eran anos sueltos.
// params: {desde, hasta, hitos:[{a:1492, txt:'...'}], etiqueta}
DIAGRAMAS.tiempo=function(p,nodo){
 const hitos=(p.hitos||[]).slice(0,6);
 const vals=hitos.map(h=>h.a);
 const desde=p.desde??(vals.length?Math.min.apply(null,vals):0);
 const hasta=p.hasta??(vals.length?Math.max.apply(null,vals):100);
 const W=360, x0=26, x1=334, y=76, H=150;
 const svg=svgEl('svg',{viewBox:'0 0 '+W+' '+H,role:'img','aria-label':'Línea de tiempo con sus hitos'});
 const xOf=v=>hasta===desde?(x0+x1)/2:x0+(v-desde)/(hasta-desde)*(x1-x0);
 svg.appendChild(svgEl('line',{x1:x0,y1:y,x2:x1,y2:y,stroke:'#5a4b8f','stroke-width':3}));
 // la flecha: el tiempo va hacia la derecha, y a los 8 anos eso no es obvio
 svg.appendChild(svgEl('path',{d:'M '+(x1-8)+' '+(y-5)+' L '+x1+' '+y+' L '+(x1-8)+' '+(y+5),
  fill:'none',stroke:'#5a4b8f','stroke-width':2.5}));
 /* El ano, escrito como se lee: "300.000 a.C." y no "-300000". Un numero negativo con
    seis cifras seguidas no lo lee nadie, y menos un nino de 8 anos. */
 const anio=v=>{
  if(v===0) return '0';
  const n=Math.abs(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  return v<0 ? n+' a.C.' : n;
 };
 hitos.forEach((h,i)=>{
  const x=xOf(h.a), arriba=(i%2===0);   // alternados: si no, los rotulos se enciman
  const yl=arriba?y-14:y+16;
  svg.appendChild(svgEl('line',{x1:x,y1:y-8,x2:x,y2:y+8,stroke:'#4dd8ff','stroke-width':2.5}));
  svg.appendChild(svgEl('circle',{cx:x,cy:y,r:4,fill:'#8f6bff',stroke:'#4dd8ff','stroke-width':1.8}));
  /* ⚠️ El rotulo se ancla al borde cuando el hito cae cerca de un extremo. Sin esto el
     primero se sale por la izquierda y se lee "neros humanos": el texto va centrado en x,
     asi que la mitad queda fuera del viewBox. No lo delata ninguna medicion. */
  const cerca=54, izq=x<cerca, der=x>W-cerca;
  const anc=izq?'start':(der?'end':'middle');
  const xr=izq?4:(der?W-4:x);
  const a=svgEl('text',{x:xr,y:arriba?yl-10:yl+10,'text-anchor':anc,fill:'#ffc93c',
   'font-family':"'Titan One',sans-serif",'font-size':11});
  a.textContent=anio(h.a); svg.appendChild(a);
  // el texto se parte en dos lineas si no cabe: a 10px caben ~18 caracteres
  const txt=String(h.txt||''), corte=txt.length>18?txt.lastIndexOf(' ',18):-1;
  const lineas=corte>0?[txt.slice(0,corte),txt.slice(corte+1)]:[txt];
  lineas.forEach((ln,k)=>{
   const e=svgEl('text',{x:xr,y:(arriba?yl-23:yl+23)+(arriba?-k*11:k*11),'text-anchor':anc,
    fill:'#a99fd0','font-size':10});
   e.textContent=ln; svg.appendChild(e);
  });
 });
 const tt=svgEl('text',{x:W/2,y:H-6,'text-anchor':'middle',fill:'#ffc93c',
  'font-family':"'Titan One',sans-serif",'font-size':14});
 tt.textContent=p.etiqueta||''; svg.appendChild(tt);
 nodo.appendChild(svg);
};

// oracion: sujeto y predicado marcados en una frase. Para len7-cap5 y len3-cap4, que son
// los dos capitulos de Lenguaje con algo que de verdad se puede DIBUJAR.
// params: {sujeto:'El perro de Ana', predicado:'corre por el patio', etiqueta}
DIAGRAMAS.oracion=function(p,nodo){
 const suj=String(p.sujeto||'El perro'), pre=String(p.predicado||'corre');
 const W=360, H=126, y=44, hh=34;
 // ancho proporcional al largo del texto, para que la caja calce con lo que rodea
 const tot=suj.length+pre.length||1;
 const util=W-32, ws=Math.max(70,Math.round(util*suj.length/tot)), wp=util-ws;
 const svg=svgEl('svg',{viewBox:'0 0 '+W+' '+H,role:'img',
  'aria-label':'Una oración con su sujeto y su predicado marcados'});
 function caja(x,w,txt,rot,col){
  svg.appendChild(svgEl('rect',{x,y,width:w-4,height:hh,rx:8,fill:col+'33',
   stroke:col,'stroke-width':2.5}));
  // el texto se encoge si no cabe: a 14px caben ~w/8 caracteres
  const fs=Math.max(10,Math.min(15,Math.floor((w-12)/(txt.length*0.55))));
  const e=svgEl('text',{x:x+(w-4)/2,y:y+hh/2+fs/3,'text-anchor':'middle',fill:'#fff','font-size':fs});
  e.textContent=txt; svg.appendChild(e);
  const r=svgEl('text',{x:x+(w-4)/2,y:y-8,'text-anchor':'middle',fill:col,'font-size':12});
  r.textContent=rot; svg.appendChild(r);
 }
 caja(16,ws,suj,'sujeto','#4dd8ff');
 caja(16+ws,wp,pre,'predicado','#3ee089');
 const q=svgEl('text',{x:16+ws/2,y:y+hh+18,'text-anchor':'middle',fill:'#a99fd0','font-size':11});
 q.textContent='¿quién?'; svg.appendChild(q);
 const q2=svgEl('text',{x:16+ws+wp/2,y:y+hh+18,'text-anchor':'middle',fill:'#a99fd0','font-size':11});
 q2.textContent='¿qué hace?'; svg.appendChild(q2);
 const tt=svgEl('text',{x:W/2,y:H-6,'text-anchor':'middle',fill:'#ffc93c',
  'font-family':"'Titan One',sans-serif",'font-size':14});
 tt.textContent=p.etiqueta||''; svg.appendChild(tt);
 nodo.appendChild(svg);
};

// funcion: recta f(x)=a·x+b sobre un plano cartesiano, con deslizadores de a y b.
// params: {a=1, b=0, interactivo=true}
DIAGRAMAS.funcion=function(p,nodo){
 const inter=p.interactivo!==false, a0=p.a??1, b0=p.b??0;
 const cx=150,cy=110,sc=13,W=300,H=220;   // sc = px por unidad
 const svg=svgEl('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':'Función lineal'});
 for(let i=-10;i<=10;i++){ if(i===0)continue;
  const gx=cx+i*sc, gy=cy+i*sc;
  if(gx>=0&&gx<=W) svg.appendChild(svgEl('line',{x1:gx,y1:0,x2:gx,y2:H,stroke:'#2c2350','stroke-width':1}));
  if(gy>=0&&gy<=H) svg.appendChild(svgEl('line',{x1:0,y1:gy,x2:W,y2:gy,stroke:'#2c2350','stroke-width':1}));
 }
 svg.appendChild(svgEl('line',{x1:0,y1:cy,x2:W,y2:cy,stroke:'#7a6ab0','stroke-width':1.5}));
 svg.appendChild(svgEl('line',{x1:cx,y1:0,x2:cx,y2:H,stroke:'#7a6ab0','stroke-width':1.5}));
 const linea=svgEl('line',{stroke:'#3ee089','stroke-width':3,'stroke-linecap':'round'});
 const punto=svgEl('circle',{r:4,fill:'#ff4d8d'});
 svg.appendChild(linea); svg.appendChild(punto);
 nodo.appendChild(svg);
 const eq=document.createElement('div'); eq.style.cssText='font-size:14px;margin-top:6px';
 nodo.appendChild(eq);
 function draw(a,b){
  eq.innerHTML=`f(x) = <b style="color:#4dd8ff">${a}</b>·x + <b style="color:#4dd8ff">${b}</b>`;
  const xL=-10,xR=10;
  linea.setAttribute('x1',cx+xL*sc); linea.setAttribute('y1',cy-(a*xL+b)*sc);
  linea.setAttribute('x2',cx+xR*sc); linea.setAttribute('y2',cy-(a*xR+b)*sc);
  punto.setAttribute('cx',cx); punto.setAttribute('cy',cy-b*sc);
 }
 if(inter){
  const mk=(lbl,min,max,st,val,on)=>{
   const r=document.createElement('div');
   r.style.cssText='display:flex;align-items:center;gap:8px;margin-top:6px;font-size:12px';
   const l=document.createElement('label');l.textContent=lbl;l.style.cssText='width:92px;color:#a99fd0';
   const inp=document.createElement('input');inp.type='range';inp.min=min;inp.max=max;inp.step=st;inp.value=val;
   inp.style.cssText='flex:1;accent-color:#8f6bff';
   const v=document.createElement('span');v.textContent=val;
   v.style.cssText='color:#ffc93c;font-family:"Titan One",sans-serif;min-width:24px;text-align:right';
   inp.addEventListener('input',()=>{v.textContent=inp.value;on();});
   r.append(l,inp,v); nodo.appendChild(r); return inp;
  };
  let aI,bI; const redo=()=>draw(parseFloat(aI.value),parseFloat(bI.value));
  aI=mk('pendiente a',-3,3,0.5,a0,redo);
  bI=mk('intercepto b',-5,5,1,b0,redo);
 }
 draw(a0,b0);
};

// algebra: fichas de una expresión. Fichas altas = "x", cuadritos = unidades.
// params: {x=0, u=0, etiqueta:'2x + 3'}
DIAGRAMAS.algebra=function(p,nodo){
 const nx=Math.max(0,p.x||0), nu=Math.max(0,p.u||0);
 const svg=svgEl('svg',{viewBox:'0 0 320 92',role:'img','aria-label':'Términos algebraicos'});
 let cxp=14;
 for(let i=0;i<nx;i++){
  svg.appendChild(svgEl('rect',{x:cxp,y:18,width:26,height:46,rx:5,fill:'#8f6bff',stroke:'#4dd8ff','stroke-width':1.5}));
  const t=svgEl('text',{x:cxp+13,y:47,'text-anchor':'middle',fill:'#fff','font-family':"'Titan One',sans-serif",'font-size':16});
  t.textContent='x'; svg.appendChild(t); cxp+=32;
 }
 cxp+=10;
 for(let i=0;i<nu;i++){
  svg.appendChild(svgEl('rect',{x:cxp,y:40,width:22,height:22,rx:4,fill:'#4dd8ff',stroke:'#241a44','stroke-width':1}));
  const t=svgEl('text',{x:cxp+11,y:56,'text-anchor':'middle',fill:'#241a44','font-size':12});
  t.textContent='1'; svg.appendChild(t); cxp+=26;
 }
 if(p.etiqueta){const t=svgEl('text',{x:160,y:84,'text-anchor':'middle',fill:'#ffc93c','font-family':"'Titan One',sans-serif",'font-size':15});t.textContent=p.etiqueta;svg.appendChild(t);}
 nodo.appendChild(svg);
};

// balanza: una ecuación como equilibrio. Fichas "x" (altas) y unidades a cada lado.
// params: {izqX=0, izqU=0, derX=0, derU=0, etiqueta:'2x + 1 = 7'}
DIAGRAMAS.balanza=function(p,nodo){
 const svg=svgEl('svg',{viewBox:'0 0 320 152',role:'img','aria-label':'Ecuación en balanza'});
 svg.appendChild(svgEl('line',{x1:44,y1:40,x2:276,y2:40,stroke:'#7a6ab0','stroke-width':4,'stroke-linecap':'round'}));
 svg.appendChild(svgEl('line',{x1:160,y1:40,x2:160,y2:120,stroke:'#7a6ab0','stroke-width':4}));
 svg.appendChild(svgEl('path',{d:'M142 120 H178 L168 134 H152 Z',fill:'#5a4b8f'}));
 function plato(cxp,nx,nu){
  svg.appendChild(svgEl('line',{x1:cxp,y1:40,x2:cxp,y2:66,stroke:'#5a4b8f','stroke-width':2}));
  svg.appendChild(svgEl('rect',{x:cxp-46,y:66,width:92,height:8,rx:4,fill:'#5a4b8f'}));
  let bx=cxp-40;
  for(let i=0;i<nx;i++){
   svg.appendChild(svgEl('rect',{x:bx,y:42,width:18,height:22,rx:3,fill:'#8f6bff'}));
   const t=svgEl('text',{x:bx+9,y:58,'text-anchor':'middle',fill:'#fff','font-size':11});t.textContent='x';svg.appendChild(t);
   bx+=22;
  }
  for(let i=0;i<nu;i++){
   svg.appendChild(svgEl('rect',{x:bx,y:50,width:14,height:14,rx:2,fill:'#4dd8ff'}));
   bx+=17;
  }
 }
 plato(90,p.izqX||0,p.izqU||0);
 plato(230,p.derX||0,p.derU||0);
 if(p.etiqueta){const t=svgEl('text',{x:160,y:148,'text-anchor':'middle',fill:'#ffc93c','font-family':"'Titan One',sans-serif",'font-size':15});t.textContent=p.etiqueta;svg.appendChild(t);}
 nodo.appendChild(svg);
};

// triangulo: triángulo rectángulo con los cuadrados de los catetos (Pitágoras).
// params: {a=3, b=4}  (c = √(a²+b²) se calcula)
DIAGRAMAS.triangulo=function(p,nodo){
 const a=p.a||3, b=p.b||4, c=Math.sqrt(a*a+b*b);
 const ox=88, oy=152;
 const sc=Math.min(14,(198-oy)/a, ox/b);   // cabe el cuadrado a² abajo y el b² a la izquierda
 const svg=svgEl('svg',{viewBox:'0 0 320 200',role:'img','aria-label':'Triángulo rectángulo (Pitágoras)'});
 svg.appendChild(svgEl('rect',{x:ox,y:oy,width:a*sc,height:a*sc,fill:'#8f6bff33',stroke:'#8f6bff','stroke-width':1.5}));
 svg.appendChild(svgEl('rect',{x:ox-b*sc,y:oy-b*sc,width:b*sc,height:b*sc,fill:'#4dd8ff33',stroke:'#4dd8ff','stroke-width':1.5}));
 svg.appendChild(svgEl('polygon',{points:`${ox},${oy} ${ox+a*sc},${oy} ${ox},${oy-b*sc}`,fill:'#3ee08944',stroke:'#3ee089','stroke-width':2}));
 svg.appendChild(svgEl('path',{d:`M${ox+11},${oy} L${ox+11},${oy-11} L${ox},${oy-11}`,fill:'none',stroke:'#eee6ff','stroke-width':1.5}));
 function tx(x,y,s,col,fs,fam){const t=svgEl('text',{x,y,'text-anchor':'middle',fill:col,'font-size':fs||12});if(fam)t.setAttribute('font-family',fam);t.textContent=s;svg.appendChild(t);}
 tx(ox+a*sc/2, oy+a*sc/2+4, 'a²', '#c9b8ff', 13);
 tx(ox-b*sc/2, oy-b*sc/2+4, 'b²', '#bfeeff', 13);
 tx(ox+a*sc/2, oy-8, 'a='+a, '#8f6bff', 12);
 tx(ox-12, oy-b*sc+16, 'b='+b, '#4dd8ff', 12);
 tx(ox+a*sc/2+18, oy-b*sc/2-2, 'c='+(Number.isInteger(c)?c:c.toFixed(2)), '#3ee089', 12);
 tx(234, 44, `${a}² + ${b}² = ${a*a+b*b}`, '#ffc93c', 15, "'Titan One',sans-serif");
 tx(234, 64, `${a*a} + ${b*b} = ${a*a+b*b}`, '#a99fd0', 12);
 nodo.appendChild(svg);
};

// solido: prisma recto o cilindro (pseudo-3D), con etiquetas y fórmula.
// params: {tipo:'prisma'|'cilindro', etiqueta}  ⚠️ `etiqueta` reemplaza la formula de
//         volumen, que es de 7°/8°: en 3° el mismo dibujo sirve para caras y vertices.
DIAGRAMAS.solido=function(p,nodo){
 const tipo=p.tipo||'prisma';
 const svg=svgEl('svg',{viewBox:'0 0 320 190',role:'img','aria-label':'Cuerpo geométrico'});
 function tx(x,y,s,col,fs,fam,rot){const t=svgEl('text',{x,y,'text-anchor':'middle',fill:col,'font-size':fs||12});if(fam)t.setAttribute('font-family',fam);if(rot)t.setAttribute('transform',`rotate(-90 ${x} ${y})`);t.textContent=s;svg.appendChild(t);}
 if(tipo==='cilindro'){
  const cx=120,rx=50,ry=15,topY=52,h=88;
  svg.appendChild(svgEl('line',{x1:cx-rx,y1:topY,x2:cx-rx,y2:topY+h,stroke:'#4dd8ff','stroke-width':2}));
  svg.appendChild(svgEl('line',{x1:cx+rx,y1:topY,x2:cx+rx,y2:topY+h,stroke:'#4dd8ff','stroke-width':2}));
  svg.appendChild(svgEl('path',{d:`M${cx-rx},${topY+h} A${rx},${ry} 0 0 0 ${cx+rx},${topY+h}`,fill:'none',stroke:'#4dd8ff','stroke-width':2}));
  svg.appendChild(svgEl('path',{d:`M${cx-rx},${topY+h} A${rx},${ry} 0 0 1 ${cx+rx},${topY+h}`,fill:'none',stroke:'#5a4b8f','stroke-width':1,'stroke-dasharray':'3 3'}));
  svg.appendChild(svgEl('ellipse',{cx:cx,cy:topY,rx:rx,ry:ry,fill:'#8f6bff55',stroke:'#8f6bff','stroke-width':1.5}));
  svg.appendChild(svgEl('line',{x1:cx,y1:topY,x2:cx+rx,y2:topY,stroke:'#ffc93c','stroke-width':1.5}));
  tx(cx+rx/2, topY-5, 'r', '#ffc93c', 12);
  tx(cx-rx-12, topY+h/2, 'altura', '#3ee089', 12, null, true);
  tx(234, 150, p.etiqueta||'V = π·r²·altura', '#ffc93c', 13, "'Titan One',sans-serif");
 } else {
  const x=78,y=72,w=96,h=84,dx=44,dy=28;
  svg.appendChild(svgEl('path',{d:`M${x},${y} L${x+dx},${y-dy} M${x},${y+h} L${x+dx},${y+h-dy} L${x+w+dx},${y+h-dy} L${x+w+dx},${y-dy}`,fill:'none',stroke:'#5a4b8f','stroke-width':1,'stroke-dasharray':'3 3'}));
  svg.appendChild(svgEl('polygon',{points:`${x},${y} ${x+dx},${y-dy} ${x+w+dx},${y-dy} ${x+w},${y}`,fill:'#8f6bff55',stroke:'#8f6bff','stroke-width':1.5}));
  svg.appendChild(svgEl('polygon',{points:`${x+w},${y} ${x+w+dx},${y-dy} ${x+w+dx},${y+h-dy} ${x+w},${y+h}`,fill:'#6f52cc55',stroke:'#8f6bff','stroke-width':1.5}));
  svg.appendChild(svgEl('rect',{x:x,y:y,width:w,height:h,fill:'#4dd8ff33',stroke:'#4dd8ff','stroke-width':2}));
  tx(x+w/2, y+h+18, 'base', '#4dd8ff', 12);
  tx(x-12, y+h/2, 'altura', '#3ee089', 12, null, true);
  tx(234, 150, p.etiqueta||'V = base × altura', '#ffc93c', 13, "'Titan One',sans-serif");
 }
 nodo.appendChild(svg);
};

// transformacion: una figura y su imagen tras reflexión, traslación o rotación (90°).
// params: {tipo:'reflexion'|'traslacion'|'rotacion', vector:[vx,vy], figura:[[x,y],...], etiqueta}
DIAGRAMAS.transformacion=function(p,nodo){
 const tipo=p.tipo||'reflexion';
 const fig=p.figura||[[1,1],[4,1],[1,3.5]];
 const cx=160,cy=100,sc=17;
 const svg=svgEl('svg',{viewBox:'0 0 320 190',role:'img','aria-label':'Transformación en el plano'});
 for(let i=-4;i<=4;i++){const gx=cx+i*sc,gy=cy+i*sc;
  if(gx>=8&&gx<=312)svg.appendChild(svgEl('line',{x1:gx,y1:12,x2:gx,y2:188,stroke:'#2c2350','stroke-width':1}));
  if(gy>=12&&gy<=188)svg.appendChild(svgEl('line',{x1:8,y1:gy,x2:312,y2:gy,stroke:'#2c2350','stroke-width':1}));}
 svg.appendChild(svgEl('line',{x1:8,y1:cy,x2:312,y2:cy,stroke:'#7a6ab0','stroke-width':1.5}));
 svg.appendChild(svgEl('line',{x1:cx,y1:12,x2:cx,y2:188,stroke:'#7a6ab0','stroke-width':1.5}));
 const S=(x,y)=>`${cx+x*sc},${cy-y*sc}`;
 let img, rotulo;
 if(tipo==='traslacion'){ const v=p.vector||[-5,0]; img=fig.map(q=>[q[0]+v[0],q[1]+v[1]]); rotulo='Traslación'; }
 else if(tipo==='rotacion'){ img=fig.map(q=>[-q[1],q[0]]); rotulo='Rotación (90°)'; }
 else { img=fig.map(q=>[-q[0],q[1]]); rotulo='Reflexión (eje y)'; }
 if(tipo==='reflexion') svg.appendChild(svgEl('line',{x1:cx,y1:12,x2:cx,y2:188,stroke:'#ffc93c','stroke-width':2,'stroke-dasharray':'5 4'}));
 svg.appendChild(svgEl('polygon',{points:fig.map(q=>S(q[0],q[1])).join(' '),fill:'#8f6bff66',stroke:'#8f6bff','stroke-width':2}));
 svg.appendChild(svgEl('polygon',{points:img.map(q=>S(q[0],q[1])).join(' '),fill:'#3ee08944',stroke:'#3ee089','stroke-width':2,'stroke-dasharray':'4 3'}));
 if(tipo==='traslacion'){
  svg.appendChild(svgEl('line',{x1:cx+fig[0][0]*sc,y1:cy-fig[0][1]*sc,x2:cx+img[0][0]*sc,y2:cy-img[0][1]*sc,stroke:'#ffc93c','stroke-width':2}));
 }
 const t=svgEl('text',{x:160,y:184,'text-anchor':'middle',fill:'#ffc93c','font-size':11});
 t.textContent=p.etiqueta||rotulo; svg.appendChild(t);
 nodo.appendChild(svg);
};

// cajon: diagrama de cajón (mín, Q1, mediana, Q3, máx).
// params: {min, q1, mediana, q3, max}
DIAGRAMAS.cajon=function(p,nodo){
 const mn=p.min??2, q1=p.q1??5, md=p.mediana??7, q3=p.q3??10, mx=p.max??14;
 const x0=36,x1=284,yy=62;
 const svg=svgEl('svg',{viewBox:'0 0 320 116',role:'img','aria-label':'Diagrama de cajón'});
 const den=(mx-mn)||1, xf=v=>x0+(v-mn)/den*(x1-x0);
 svg.appendChild(svgEl('line',{x1:xf(mn),y1:yy,x2:xf(q1),y2:yy,stroke:'#7a6ab0','stroke-width':2}));
 svg.appendChild(svgEl('line',{x1:xf(q3),y1:yy,x2:xf(mx),y2:yy,stroke:'#7a6ab0','stroke-width':2}));
 [mn,mx].forEach(v=>svg.appendChild(svgEl('line',{x1:xf(v),y1:yy-9,x2:xf(v),y2:yy+9,stroke:'#7a6ab0','stroke-width':2})));
 svg.appendChild(svgEl('rect',{x:xf(q1),y:yy-16,width:Math.max(1,xf(q3)-xf(q1)),height:32,rx:4,fill:'#8f6bff44',stroke:'#8f6bff','stroke-width':2}));
 svg.appendChild(svgEl('line',{x1:xf(md),y1:yy-16,x2:xf(md),y2:yy+16,stroke:'#ffc93c','stroke-width':2.5}));
 function tx(x,y,s,c,fs){const t=svgEl('text',{x,y,'text-anchor':'middle',fill:c,'font-size':fs});t.textContent=s;svg.appendChild(t);}
 [['mín',mn],['Q1',q1],['Med',md],['Q3',q3],['máx',mx]].forEach(pp=>{tx(xf(pp[1]),yy-24,pp[0],'#a99fd0',10);tx(xf(pp[1]),yy+34,''+pp[1],'#eee6ff',12);});
 nodo.appendChild(svg);
};

// barras: gráfico de barras cuyo eje puede empezar en `desde` (para mostrar distorsión).
// params: {datos:[{etiqueta,valor}], desde:0, top}
DIAGRAMAS.barras=function(p,nodo){
 const datos=p.datos||[{etiqueta:'A',valor:92},{etiqueta:'B',valor:95},{etiqueta:'C',valor:98}];
 const desde=p.desde||0;
 const maxV=Math.max.apply(null,datos.map(d=>d.valor));
 const top=p.top || (Math.ceil(maxV/10)*10) || (maxV+1);
 const x0=40,pt=22,pb=150,ph=pb-pt,W=320,area=W-x0-24;
 const bw=Math.min(56, area/datos.length*0.6), gap=(area-bw*datos.length)/(datos.length+1);
 const svg=svgEl('svg',{viewBox:`0 0 ${W} 176`,role:'img','aria-label':'Gráfico de barras'});
 svg.appendChild(svgEl('line',{x1:x0,y1:pb,x2:W-8,y2:pb,stroke:'#7a6ab0','stroke-width':1.5}));
 svg.appendChild(svgEl('line',{x1:x0,y1:pt,x2:x0,y2:pb,stroke:'#7a6ab0','stroke-width':1.5}));
 function tx(x,y,s,c,fs){const t=svgEl('text',{x,y,'text-anchor':'middle',fill:c,'font-size':fs});t.textContent=s;svg.appendChild(t);}
 tx(x0-14,pb,''+desde,'#a99fd0',10);
 const den=(top-desde)||1;
 datos.forEach((d,i)=>{
  const h=Math.max(2,(d.valor-desde)/den*ph), bx=x0+gap+i*(bw+gap);
  svg.appendChild(svgEl('rect',{x:bx,y:pb-h,width:bw,height:h,rx:3,fill:'#4dd8ff',stroke:'#8f6bff','stroke-width':1}));
  tx(bx+bw/2,pb-h-4,''+d.valor,'#ffc93c',12);
  tx(bx+bw/2,pb+15,d.etiqueta,'#a99fd0',11);
 });
 nodo.appendChild(svg);
};

// arbol: diagrama de árbol del principio multiplicativo (n1 × n2).
// params: {n1=2, n2=3}
DIAGRAMAS.arbol=function(p,nodo){
 const n1=Math.max(1,Math.min(4,p.n1||2)), n2=Math.max(1,Math.min(4,p.n2||3));
 const H=176, x0=26, x1=150, x2=262, cy=H/2;
 const svg=svgEl('svg',{viewBox:`0 0 320 ${H}`,role:'img','aria-label':'Diagrama de árbol'});
 const total=n1*n2, leafY=[];
 for(let k=0;k<total;k++) leafY.push(20+(H-40)*(total<=1?0.5:k/(total-1)));
 for(let i=0;i<n1;i++){
  const kids=leafY.slice(i*n2,i*n2+n2);
  const py=kids.reduce((a,b)=>a+b,0)/kids.length;
  svg.appendChild(svgEl('line',{x1:x0,y1:cy,x2:x1,y2:py,stroke:'#5a4b8f','stroke-width':1.5}));
  kids.forEach(ly=>{
   svg.appendChild(svgEl('line',{x1:x1,y1:py,x2:x2,y2:ly,stroke:'#5a4b8f','stroke-width':1.5}));
   svg.appendChild(svgEl('circle',{cx:x2,cy:ly,r:7,fill:'#4dd8ff'}));
  });
  svg.appendChild(svgEl('circle',{cx:x1,cy:py,r:10,fill:'#8f6bff'}));
 }
 svg.appendChild(svgEl('circle',{cx:x0,cy:cy,r:9,fill:'#3ee089'}));
 const t=svgEl('text',{x:244,y:16,'text-anchor':'middle',fill:'#ffc93c','font-family':"'Titan One',sans-serif",'font-size':14});
 t.textContent=`${n1} × ${n2} = ${n1*n2}`; svg.appendChild(t);
 nodo.appendChild(svg);
};

/* ================= MOTOR DE LECCIONES (camino de aprendizaje) ================= */
let LEC=null;  // {leccion, idx}  idx = bloque actual
function abrirLeccion(leccion){
 LEC={leccion, idx:0};
 $('lecTitulo').textContent=leccion.titulo;
 go('scr-leccion');
 renderBloque();
}

/* Lo que se LEE de un bloque, armado desde los datos y no desde el DOM: el cuerpo ya
   pintado arrastra los rotulos del SVG ("centenas", "3 cientos"), que son apoyo visual y
   suenan a disparate leidos de corrido. Es ademas la lista exacta de fragmentos que
   scripts/generar-voz-nivel.py tiene que sacar de lecciones.json. */
function textoLocutable(b){
 if(!b) return '';
 if(b.t==='texto')    return b.md||'';
 if(b.t==='imagen')   return b.pie||'';
 if(b.t==='diagrama') return b.intro||'';
 if(b.t==='ejemplo')  return [b.intro||''].concat(b.pasos||[]).filter(Boolean).join('. ');
 return '';
}

function renderBloque(){
 if(!LEC||!LEC.leccion)return;   // guard: sin lección activa no hay bloque que pintar
 const b=LEC.leccion.bloques[LEC.idx], cuerpo=$('lecCuerpo');
 cuerpo.innerHTML=''; cuerpo.onclick=null;
 $('lecProgBar').style.width=(LEC.idx/LEC.leccion.bloques.length*100)+'%';
 if(b.t==='texto'){
  const p=document.createElement('p'); p.innerHTML=FRAC.html(b.md); cuerpo.appendChild(p);
 }else if(b.t==='imagen'){
  const img=document.createElement('img'); img.src=b.src; img.alt=b.alt||'';
  img.onerror=function(){this.onerror=null;this.style.display='none';}; cuerpo.appendChild(img);
  if(b.pie){const p=document.createElement('p');p.innerHTML=FRAC.html(b.pie);p.style.textAlign='center';cuerpo.appendChild(p);}
 }else if(b.t==='diagrama'){
  if(b.intro){const p=document.createElement('p');p.innerHTML=FRAC.html(b.intro);cuerpo.appendChild(p);}
  const d=document.createElement('div'); cuerpo.appendChild(d);
  montarDiagrama(b.kind,b.params,d);
 }else if(b.t==='ejemplo'){
  if(b.intro){const p=document.createElement('p');p.innerHTML=FRAC.html(b.intro);cuerpo.appendChild(p);}
  b.pasos.forEach((paso,i)=>{const el=document.createElement('div');
   el.className='lec-ejemplo-paso'+(i===0?' on':'');el.innerHTML=FRAC.html(paso);cuerpo.appendChild(el);});
  let vis=1; cuerpo.onclick=()=>{const pasos=cuerpo.querySelectorAll('.lec-ejemplo-paso');
   if(vis<pasos.length){pasos[vis].classList.add('on');vis++;}};
 }
 // el 🔊 solo donde hay voz Y hay algo que leer (un diagrama sin `intro` no dice nada)
 const esc=$('lecEscuchar');
 if(esc) esc.hidden = !(window.VOZ && VOZ.activo && textoLocutable(b));
 const sig=LEC.leccion.bloques[LEC.idx+1];
 $('lecCont').textContent = (sig&&sig.t==='practica') ? 'Practicar ▶'
   : (LEC.idx===LEC.leccion.bloques.length-1?'Terminar':'Continuar');
}

function avanzarBloque(){
 if(!LEC||!LEC.leccion)return;   // guard: la lección ya se cerró (evita crash si se avanza sin lección activa)
 const sig=LEC.leccion.bloques[LEC.idx+1];
 if(sig&&sig.t==='practica'){ iniciarPracticaLeccion(LEC.leccion); return; }
 LEC.idx++;
 if(LEC.idx>=LEC.leccion.bloques.length){ terminarLeccion(); return; }
 renderBloque();
}

/* Toma n preguntas del banco de Matemáticas para un OA. Devuelve el formato del quiz.

   ⚠️ EL BANCO SALE DE CFG.ruta, NO DEL NOMBRE DE LA ASIGNATURA. Antes preguntaba
   contenidoDeAsignatura('Matemáticas') con un respaldo literal al banco de 8°, y en 3° eso
   fallaba en el peor modo posible: 3° escribe 'Matemática' en SINGULAR, así que la búsqueda
   devolvía null, la práctica descargaba el banco de OTRO NIVEL, lo filtraba por MA03 y no
   encontraba nada — y una práctica vacía marca la lección completa igual, sin medir el OA y
   SIN NINGÚN ERROR VISIBLE. El profesor habría visto la lección hecha y el objetivo sin datos.
   Es el quinto caso del mismo defecto del fork (Sesiones 63, 64, 65, 72 y este), y la salida
   es la de siempre: la convención de nombres ES la configuración. El banco de un curso vive
   al lado de sus lecciones, así que se deduce de la ruta y no hay nombre que calzar. */
async function preguntasDeOA(oa,n,banco){
 const url=banco||CFG.rutas[0].replace('lecciones.json','preguntas.json');
 let pool=[];
 try{ const d=await (await fetch(url)).json();
      pool=(d.preguntas||[]).filter(q=>q.oa===oa); }catch(e){ return []; }
 return pickN(pool,n).map(q=>({q:q.pregunta,ops:q.opciones,ok:q.correcta,tip:q.tip,oa:q.oa,visual:q.visual,id:q.id}));
}

// Lanza el quiz en modo lección (reusa el motor con el flag Q.leccion).
async function iniciarPracticaLeccion(leccion){
 const bloque=leccion.bloques.find(b=>b.t==='practica')||{};
 const fb=bloque.fromBank||{oa:leccion.oa,n:3};
 // La practica NO pasa por nPreguntas(), asi que el modo revision hay que respetarlo aqui:
 // 10 por leccion son 50 en una unidad, y ese modo existe porque 40 por capitulo agotan.
 const preguntas = await preguntasDeOA(fb.oa, REV.activo?REV.n:(fb.n||3), leccion._banco);
 if(!preguntas.length){ terminarLeccion(); return; }  // sin banco: se marca completa igual
 Q={lvl:0,idx:0,aciertos:0,combo:0,comboMax:0,xpGanado:0,timer:null,t:15,lock:false,
    preguntas, leccion:{id:leccion.id, titulo:leccion.titulo}, repetida:!!S.mateLecciones[leccion.id]};
 MODO='normal';
 go('scr-quiz'); pintaPregunta();
}

// Al terminar la práctica del quiz: envía dominio y marca la lección completa.
function finPracticaLeccion(){
 clearInterval(Q.timer);
 const id=Q.leccion.id;
 enviarDominio();                    // sube el primer intento por OA (reusa kimun_dominio)
 Q={lvl:0,idx:0,aciertos:0,combo:0,comboMax:0,xpGanado:0,timer:null,t:15,lock:false};
 marcarLeccionCompleta(id);
}

// Marca la lección, revisa el desbloqueo del Reto y vuelve al capítulo.
function marcarLeccionCompleta(id){
 S.mateLecciones[id]=true; guardar(); refreshHud();
 SND.win(); toast('primera');
 volverAlCapituloMate();
}

// terminarLeccion: fin sin práctica (lección solo teórica). Marca completa igual.
function terminarLeccion(){ marcarLeccionCompleta(LEC.leccion.id); }

// Carga bajo demanda las lecciones de Matemáticas (cacheadas tras el primer fetch).
let LECCIONES=null;   // cache del archivo
async function cargarLecciones(){
 if(LECCIONES) return LECCIONES;
 LECCIONES=[];
 // Se fusionan los archivos igual que voz.js fusiona sus manifiestos: una asignatura nueva
 // no obliga a tocar las que ya estaban. Un archivo que no carga se salta sin matar al resto.
 for(const ruta of CFG.rutas){
  try{ const d=await (await fetch(ruta)).json();
       (d.lecciones||[]).forEach(l=>{ l._banco=ruta.replace('lecciones.json','preguntas.json');
                                      LECCIONES.push(l); });
  }catch(e){ console.warn('lecciones: no cargó', ruta); }
 }
 return LECCIONES;
}
function leccionPorId(id){ return (LECCIONES||[]).find(l=>l.id===id); }

// Lista de lecciones de un capítulo de Matemáticas (reusa la pantalla scr-campana).
let CAP_MATE=null;
let TRAS_LECCION=null;   // si está seteada, la mini-clase vuelve aquí en vez de a la lista del capítulo
function abrirCapituloMate(cap){ CAP_MATE=cap; renderLeccionesMate(); go('scr-campana'); }
// Abre una unidad de mini-clases por su id. Lo usa el catalogo EXTRAS (armador, ?solo= y
// ?m=), que se declara ANTES que CAMPANAS y por eso no puede guardarse el objeto.
function abrirUnidadMate(id){
 const c=CAMPAÑAS.find(x=>x.esLecciones);
 const cap=c&&(c.capitulosMate||[]).find(u=>u.id===id);
 if(cap) abrirCapituloMate(cap);
}
async function renderLeccionesMate(){
 await cargarLecciones();
 const cap=CAP_MATE;
 $('campHead').innerHTML=`<h1 style="font-size:24px">${cap.titulo}</h1><p>Lecciones de la unidad</p>`;
 const cont=$('campNodos'); cont.innerHTML='';
 (cap.lecciones||[]).forEach((id,i)=>{
  const hecho=!!S.mateLecciones[id];
  // CAPS_ABIERTOS: en modo prueba/QA/experimental las lecciones van todas abiertas, igual
  // que las etapas de una expedicion. Sin esto, un profesor con enlace de muestra recibia
  // la unidad con 4 de sus 5 lecciones bloqueadas.
  const abierto = CAPS_ABIERTOS || i===0 || S.mateLecciones[cap.lecciones[i-1]];
  cont.appendChild(nodoCampañaEl(`${i+1}`, tituloLeccion(id), abierto, hecho,
    abierto?()=>iniciarLeccionPorId(id):null,
    hecho?'✓ Completada':(abierto?'¡Aprender!':'🔒 Bloqueada'), ''));
 });
 // En modo prueba este nodo NO puede llevar a renderCampana: abriria la campana ENTERA de
 // Matematicas (las 4 unidades, las 4 expediciones, el Reto y el Jefe Final) desde un
 // enlace acotado a una sola unidad. Es la misma fuga que la Sesion 41 cerro en el
 // "Volver" de la campana y la 42 con renderListaPrueba.
 const volver=document.createElement('div'); volver.className='camp-nodo';
 volver.innerHTML='<div class="cn-marco"><div class="cn-circ">←</div></div><div class="cn-body"><b>'+(PRUEBA?'Volver':'Volver a Matemáticas')+'</b></div>';
 volver.onclick=()=>{SND.tap(); if(PRUEBA)renderListaPrueba(); else renderCampaña();};
 cont.appendChild(volver);
}
function tituloLeccion(id){ const l=leccionPorId(id); return l?l.titulo:id; }
async function iniciarLeccionPorId(id){ await cargarLecciones(); const l=leccionPorId(id); if(l)abrirLeccion(l); }

// Vuelve desde una lección a la lista de su capítulo (o a la campaña). Si TRAS_LECCION está
// seteada (mini-clase abierta desde una etapa reprobada), la consume y va a ese destino.
function volverAlCapituloMate(){
 if(TRAS_LECCION){ const f=TRAS_LECCION; TRAS_LECCION=null; f(); return; }
 if(CAP_MATE)renderLeccionesMate(); else renderCampaña(); go('scr-campana');
}
// Abre la mini-clase que enseña un OA (buscada por su fromBank.oa / oa). Al terminar o salir,
// vuelve a la pantalla de reprobado (scr-res) para que el alumno reintente la etapa.
async function abrirMiniClaseDeOA(oa){
 await cargarLecciones();
 const l=(LECCIONES||[]).find(x=>(x.fromBank&&x.fromBank.oa===oa) || x.oa===oa);
 if(!l){ go('scr-res'); return; }   // sin mini-clase mapeable: no hay a dónde llevar; se queda en reprobado
 TRAS_LECCION=()=>go('scr-res');
 abrirLeccion(l);
}


// Campaña de Matemáticas: capítulos = grupos de lecciones. Además, acceso al Reto.
function renderCampañaMate(c){
 CAP_MATE=null;   // no dejar un capítulo colgante de una visita anterior
 $('campHead').innerHTML=`<h1 style="font-size:26px">${c.asignatura} ${campañaCompleta(c)?'👑':''}</h1><p>${c.intro}</p>`;
 const cont=$('campNodos'); cont.innerHTML='';
 c.capitulosMate.forEach((cap,i)=>{
  const hechas=(cap.lecciones||[]).filter(id=>S.mateLecciones[id]).length;
  const tot=(cap.lecciones||[]).length;
  const lecHecho=tot>0 && hechas===tot;
  const lecAbierto=!cap.proximamente && (i===0 || capMateCompleto(c.capitulosMate[i-1]));
  const lecEstado=cap.proximamente?'🔒 Pronto':(lecHecho?'Completado':(lecAbierto?`${hechas}/${tot} lecciones`:'🔒 Bloqueado'));
  cont.appendChild(nodoCampañaEl(`${i+1}`, cap.titulo, lecAbierto, lecHecho,
    lecAbierto?()=>abrirCapituloMate(cap):null, lecEstado,
    portadaUnidad(cap,c), c.portada));
  // Expedición de la unidad: se abre al completar sus lecciones (enseña → desafío)
  const exp=EXPEDICIONES.find(e=>e.id===c.capitulos[i]);
  if(exp){
   const expAb=CAPS_ABIERTOS||capMateCompleto(cap), expHecho=expedicionCompleta(exp.id);
   cont.appendChild(nodoCampañaEl('⚔️', 'Expedición · '+cap.titulo, expAb, expHecho,
     expAb?()=>entrarExpedicion(exp):null,
     expHecho?'Completada':(expAb?'¡Al desafío!':'🔒 Termina las lecciones'),
     portadaUnidad(cap,c), c.portada));
  }
 });
 // ⚠️ El nodo del Reto solo donde el Reto EXISTE. Al compartir esta funcion, en 7 y 3
 // `abrirRetoCalculo` no esta definida: sin este guard el nodo aparece ofreciendo algo que
 // no se puede abrir, y el clic lanza ReferenceError. Va como bandera y no como `if` sobre
 // el nombre de la asignatura, que es el patron que ya fallo cinco veces en este proyecto.
 if(CFG.hayReto){
  const reto=document.createElement('div');
  reto.className='camp-nodo';
  reto.innerHTML='<div class="cn-marco"><div class="cn-circ">⚡</div></div><div class="cn-body"><b>Reto de Cálculo</b><small>Práctica rápida · se desbloquea al aprender</small></div>';
  reto.onclick=()=>{SND.tap();abrirRetoCalculo();};
  cont.appendChild(reto);
 }
 nodoSinFin(c,cont);   // el Reto Sin Fin de los cursos que lo tienen (vive en motor.js)
 // Jefe Final "La Incógnita": ahora exige las 4 expediciones vencidas.
 const jfAb=jefeFinalMateDesbloqueado(c), jfHecho=campañaCompleta(c);
 cont.appendChild(nodoCampañaEl('👑','JEFE FINAL DE MATEMÁTICAS', jfAb, jfHecho,
   jfAb?()=>iniciarJefeFinal(c):null,
   jfHecho?'¡Vencido!':(jfAb?'¡Al 100%! Enfréntalo':'🔒 Vence las 4 expediciones'),
   c.jefeFinal.villanoImg||''));
}
function jefeFinalMateDesbloqueado(c){ return JEFES_ABIERTOS || (c.capitulos.length>0 && c.capitulos.every(expedicionCompleta)); }
/* La portada de la unidad va EXPLICITA cuando el nivel la declara, y solo cae a la
   convencion `portada-<id>.png` si no. Es la doctrina de 3 y 7: la convencion implicita
   pide archivos que no existen y el onerror los tapa a la vista, NO en la red. */
function portadaUnidad(cap,c){ return cap.portada || ('assets/portada-'+cap.id+'.png'); }
function capMateCompleto(cap){ if(!cap||!cap.lecciones||!cap.lecciones.length)return false;
 return cap.lecciones.every(id=>S.mateLecciones[id]); }

// Carga el banco completo de Matemáticas en el POOL global (keyed por OA), para el jefe
// de la campaña de lecciones (Matemáticas no tiene expedición de la cual tomar el POOL).
async function cargarPoolMate(){
 POOL={};
 try{ const d=await (await fetch('contenido/matematicas-8basico/preguntas.json')).json();
      (d.preguntas||[]).forEach(q=>{(POOL[q.oa]=POOL[q.oa]||[]).push(q);}); }catch(e){}
}

  window.LECC = {
    activo: false,
    init: function (cfg) {
      cfg = cfg || {};
      CFG.rutas = cfg.rutas || (cfg.ruta ? [cfg.ruta] : []);
      CFG.hayReto = !!cfg.hayReto;
      this.activo = montar() && CFG.rutas.length > 0;
      return this.activo;
    },
    /* Dibuja un diagrama suelto en un nodo. Lo usa el informe de aprobacion
       (scripts/generar-revision-preguntas.py), igual que visuales.js expone renderVisual:
       una mini-clase sin sus dibujos es irrevisable en papel. */
    diagrama: montarDiagrama,
    abrirLeccion: abrirLeccion,
    abrirUnidad: abrirUnidadMate,
    abrirMiniClaseDeOA: abrirMiniClaseDeOA,
    volverAlCapitulo: volverAlCapituloMate,
    finPractica: finPracticaLeccion,
    cargarPool: cargarPoolMate,
    /* Devuelve false si el modulo no esta activo, para que renderCampana de motor.js
       pueda caer a la campana normal en vez de quedarse con la pantalla en blanco. */
    renderCampana: function (c) { if (!this.activo) return false; renderCampañaMate(c); return true; },
    /* El nodo 📘 Introducción al principio del mapa de un capítulo.
       ⚠️ Se dibuja FUERA del arreglo indexado de etapas, y no es negociable: el avance vive en
       S.rutas[id].prog INDEXADO POR POSICIÓN, así que meterlo como etapa 0 correría todas las
       demás y le rompería la partida a quien ya venía jugando.
       Y NO bloquea: es un ofrecimiento, no un peaje. Un niño que la salta juega igual. */
    nodoIntro: function (id, caja) {
      if (!this.activo || !id || !caja) return false;
      var self = this;
      cargarLecciones().then(function (todas) {
        var l = todas.find(function (x) { return x.id === id; });
        if (!l) return;
        var hecho = !!S.mateLecciones[id];
        var d = document.createElement('div');
        d.className = 'node ' + (hecho ? 'done' : 'open');
        d.innerHTML = '<div class="orb">📘</div><div class="info"><b>' + escHtml(l.titulo) +
          '</b><small>' + (hecho ? '✓ Vista' : '▶ Empieza aquí') + '</small></div>';
        d.querySelector('.orb').onclick = function () { SND.tap(); abrirLeccion(l); };
        caja.insertBefore(d, caja.firstChild);
      });
      return true;
    }
  };
})();
