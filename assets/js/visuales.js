/* Apoyo visual de las preguntas: dibujos hechos por código, sin archivos ni librerías.

   Compartido por todos los cursos (assets/js/visuales.js). Cada pregunta puede traer un
   objeto `visual`; si el tipo no existe, se ignora en silencio y la pregunta sigue siendo
   válida solo con texto. Lo consume pintaPregunta vía P.visual, y los constructores de
   preguntas deben propagar el campo (ver `visual:q.visual`).

   ⚠️ Al agregar un tipo nuevo hay que agregarlo TAMBIÉN a `TIPOS` en
   scripts/auditar-banco-nivel.py, que declara qué campos exige cada uno. Ese script
   contrasta sus nombres contra este archivo y avisa si los dos no dicen lo mismo: sin esa
   comprobación, un tipo que el juego no conoce sale como `return ''` y la pregunta queda
   sin su apoyo SIN QUE NADA AVISE.

   ⚠️ Este archivo lo LEEN dos scripts —scripts/generar-revision-preguntas.py, que incrusta
   los dibujos reales en el informe de aprobación, y scripts/niveles.py, que lee el catálogo
   de tipos—. Si cambia el nombre o la ruta, hay que tocarlos a ellos. */

/* Descripcion en palabras del dibujo, para quien no lo ve (lector de pantalla).
   Antes el SVG iba con aria-hidden="true" y para esa persona simplemente no existia:
   "¿Que numero esta marcado?" quedaba sin nada que responder.

   CUIDADO — la descripcion NO puede delatar la respuesta. Una marca con `oculta`
   esta oculta a proposito (la pregunta es justamente deducir su valor), asi que aqui
   tampoco se dice: se describe la escala y donde cae la marca, no cuanto vale. Mismo
   criterio con las barras, que se describen por categoria y no por el maximo. */
function textoVisual(v){
 if(!v||!v.tipo) return '';
 const T=v.tipo;
 if(T==='recta'){
  const a=v.desde, b=v.hasta, s=v.paso||1;
  let d=`Recta numerica de ${a} a ${b}, de ${s} en ${s}.`;
  if(v.marca!==undefined){
   d += v.oculta ? ` Hay una marca en uno de los saltos, sin su numero.`
                 : ` La marca esta en ${v.marca}.`;
  }
  return d;
 }
 if(T==='contar')   return `Dibujo: ${v.a} y ${v.b} objetos iguales para juntar.`;
 if(T==='agrupar')  return `Dibujo: ${v.grupos} grupos de ${v.porGrupo} objetos cada uno.`;
 if(T==='fraccion') return `Barra dividida en ${v.partes} partes iguales, con ${v.pintadas} pintada${v.pintadas===1?'':'s'}.`;
 if(T==='cuerpo')   return `Dibujo de un cuerpo geometrico.`;   // nombrarlo seria dar la respuesta
 if(T==='reloj')    return `Reloj de agujas.`;                  // la hora es lo que se pregunta
 if(T==='barras'){
  const e=(v.etiquetas||[]).join(', ');
  return `Grafico de barras con ${(v.valores||[]).length} barras: ${e}.`;
 }
 if(T==='cuadricula'){
  const c=v.cols||4, f=v.filas||4, n=(v.fichas||[]).length;
  // No se dice EN QUE casilla esta cada objeto: esa suele ser la pregunta.
  return `Cuadricula de ${c} columnas y ${f} filas`
       + (n?`, con ${n} objeto${n===1?'':'s'} ubicado${n===1?'':'s'}.`:'.')
       + (v.rosa?' Arriba se indica el norte.':'');
 }
 if(T==='globo'){
  return 'Globo terraqueo con sus lineas imaginarias'
       + (v.destacar?', una de ellas marcada.':'.');   // marcada, no nombrada
 }
 if(T==='zonas'){
  return 'Esquema del planeta con sus franjas climaticas'
       + (v.destacar?', una de ellas marcada.':'.');
 }
 if(T==='linea'){
  const e=(v.hitos||[]).map(h=>h[0]).join(' y ');
  return `Linea de tiempo con ${e}.`;
 }
 return 'Dibujo de apoyo.';
}
// renderVisual la deja lista antes de dibujar, para no tener que pasarla por las
// ~15 llamadas a svgEnvoltura que hay adentro.
let _DESC_VISUAL='';
function svgEnvoltura(inner,alto,desc){
 const d=(desc||_DESC_VISUAL||'').replace(/"/g,'&quot;');
 return `<div class="q-visual"><svg viewBox="0 0 200 ${alto}" width="100%" height="${alto}" role="img" aria-label="${d}" style="max-width:280px">${inner}</svg></div>`;
}
function renderVisual(v){
 if(!v||!v.tipo) return '';
 _DESC_VISUAL=textoVisual(v);
 const T=v.tipo;

 // Sumar y restar: dos grupos de emojis separados por el signo.
 if(T==='contar'){
  const e=v.emoji||'🔵';
  const g1=e.repeat(Math.max(0,Math.abs(v.a)));
  const signo=(v.b<0)?'➖':'➕';
  const g2=e.repeat(Math.max(0,Math.abs(v.b)));
  // role/aria-label: el emoji repetido lo lee un lector de pantalla uno por uno
  //  ("manzana manzana manzana..."), inservible. Mejor una descripcion y ocultar lo demas.
  return `<div class="q-visual" role="img" aria-label="${_DESC_VISUAL}"><span aria-hidden="true">${g1} ${signo} ${g2}</span></div>`;
 }

 // Multiplicar y dividir: `grupos` montones de `porGrupo` cada uno.
 if(T==='agrupar'){
  const e=v.emoji||'🔵';
  const g=Math.max(0,Math.min(12,v.grupos|0)), n=Math.max(0,Math.min(12,v.porGrupo|0));
  let out='';
  for(let i=0;i<g;i++) out+=`<span class="qv-grupo">${e.repeat(n)}</span>`;
  return `<div class="q-visual qv-grupos" role="img" aria-label="${_DESC_VISUAL}"><span aria-hidden="true" style="display:contents">${out}</span></div>`;
 }

 // Fracciones: barra partida en `partes`, con `pintadas` coloreadas.
 if(T==='fraccion'){
  const p=Math.max(1,Math.min(12,v.partes|0)), k=Math.max(0,Math.min(p,v.pintadas|0));
  const w=180/p; let r='';
  for(let i=0;i<p;i++){
   r+=`<rect x="${10+i*w}" y="10" width="${w}" height="40" fill="${i<k?'#8f6bff':'#2a2350'}" stroke="#ffc93c" stroke-width="2"/>`;
  }
  return svgEnvoltura(r,60);
 }

 // Recta numérica: de `desde` a `hasta` cada `paso`, con una marca opcional.
 if(T==='recta'){
  const a=v.desde|0, b=v.hasta|0, s=Math.max(1,v.paso|0);
  const n=Math.max(1,Math.floor((b-a)/s));
  let r=`<line x1="10" y1="35" x2="190" y2="35" stroke="#4dd8ff" stroke-width="3"/>`;
  /* Rótulos legibles: con 11 etiquetas de 3 o 4 dígitos (500..600 de 10 en 10, o los años
     1900..2000) los números se encimaban y la recta quedaba ilegible. Primero se intenta
     achicar la letra —así no se pierde ninguna etiqueta— y solo si ni con la letra más
     chica caben, se rotula una marca sí y otra no. */
  const digitos=Math.max(String(a).length,String(b+0).length,String(a+n*s).length);
  const hueco=180/n;
  let fuente=11, cadaK=1;
  while(fuente>8 && digitos*fuente*0.55+2>hueco) fuente--;
  const anchoRotulo=digitos*fuente*0.55+2;
  if(anchoRotulo>hueco) cadaK=Math.ceil(anchoRotulo/hueco);
  const iMarca=(v.marca!==undefined && s>0)?Math.round((v.marca-a)/s):-1;
  for(let i=0;i<=n;i++){
   const x=10+(180*i/n), val=a+i*s;
   const marcado=(v.marca!==undefined && val===v.marca);
   r+=`<line x1="${x}" y1="28" x2="${x}" y2="42" stroke="#4dd8ff" stroke-width="2"/>`;
   // `oculta` tapa el número JUSTO en la marca: lo usan las preguntas del tipo
   // "¿qué número está marcado?", donde imprimirlo regala la respuesta y el niño
   // deja de leer la recta. En las demás la marca es una referencia y sí se rotula.
   const tapar = marcado && v.oculta;
   // Si la marca se rotula, sus vecinas se callan: si no, el número dorado choca
   // con los de al lado (pasaba con los años 1920-1930-1940).
   const pegadaAMarca = (iMarca>=0 && !v.oculta && i!==iMarca &&
                         Math.abs(i-iMarca)*hueco < anchoRotulo);
   if(!tapar && !pegadaAMarca && (marcado || i%cadaK===0 || i===n)){
    r+=`<text x="${x}" y="58" font-size="${fuente}" fill="${marcado?'#ffc93c':'#cfc9ee'}" text-anchor="middle" font-weight="bold">${val}</text>`;
   }
   if(marcado) r+=`<circle cx="${x}" cy="35" r="6" fill="#ffc93c"/>`;
  }
  return svgEnvoltura(r,66);
 }

 // Reloj análogo: `hora` (1-12) y `minuto` (0-59).
 if(T==='reloj'){
  const h=((v.hora|0)%12), m=(v.minuto|0)%60;
  const cx=100, cy=60, R=48;
  let r=`<circle cx="${cx}" cy="${cy}" r="${R}" fill="#1a1430" stroke="#ffc93c" stroke-width="3"/>`;
  for(let i=1;i<=12;i++){
   const ang=(i/12)*2*Math.PI - Math.PI/2;
   r+=`<text x="${cx+Math.cos(ang)*(R-11)}" y="${cy+Math.sin(ang)*(R-11)+4}" font-size="11" fill="#cfc9ee" text-anchor="middle" font-weight="bold">${i}</text>`;
  }
  const angH=((h+m/60)/12)*2*Math.PI - Math.PI/2;
  const angM=(m/60)*2*Math.PI - Math.PI/2;
  r+=`<line x1="${cx}" y1="${cy}" x2="${cx+Math.cos(angH)*24}" y2="${cy+Math.sin(angH)*24}" stroke="#ffc93c" stroke-width="5" stroke-linecap="round"/>`;
  r+=`<line x1="${cx}" y1="${cy}" x2="${cx+Math.cos(angM)*36}" y2="${cy+Math.sin(angM)*36}" stroke="#4dd8ff" stroke-width="3" stroke-linecap="round"/>`;
  r+=`<circle cx="${cx}" cy="${cy}" r="4" fill="#ff4d8d"/>`;
  return svgEnvoltura(r,120);
 }

 // Gráfico de barras / pictograma numérico: `etiquetas` y `valores` (máximo 6 barras).
 if(T==='barras'){
  const et=(v.etiquetas||[]).slice(0,6), va=(v.valores||[]).slice(0,6);
  if(!et.length||et.length!==va.length) return '';
  const max=Math.max.apply(null,va.concat([1]));
  const w=170/et.length; let r='';
  et.forEach((e,i)=>{
   const alt=Math.round(60*va[i]/max);
   const x=15+i*w;
   r+=`<rect x="${x}" y="${75-alt}" width="${w*0.62}" height="${alt}" fill="#3ee089"/>`;
   r+=`<text x="${x+w*0.31}" y="${72-alt}" font-size="10" fill="#ffc93c" text-anchor="middle" font-weight="bold">${va[i]}</text>`;
   r+=`<text x="${x+w*0.31}" y="90" font-size="10" fill="#cfc9ee" text-anchor="middle">${String(e).slice(0,8)}</text>`;
  });
  r+=`<line x1="10" y1="75" x2="190" y2="75" stroke="#cfc9ee" stroke-width="2"/>`;
  return svgEnvoltura(r,98);
 }

 // Cuerpos geométricos: un dibujo simple por nombre.
 if(T==='cuerpo'){
  const n=(v.nombre||'').toLowerCase();
  const st='fill="#2a2350" stroke="#4dd8ff" stroke-width="3"';
  let r='';
  if(n==='cubo'||n==='paralelepipedo'){
   const an=(n==='cubo')?50:70;
   r=`<rect x="${100-an/2}" y="35" width="${an}" height="50" ${st}/><polygon points="${100-an/2},35 ${100-an/2+18},18 ${100+an/2+18},18 ${100+an/2},35" ${st}/><polygon points="${100+an/2},35 ${100+an/2+18},18 ${100+an/2+18},68 ${100+an/2},85" ${st}/>`;
  } else if(n==='esfera'){
   r=`<circle cx="100" cy="55" r="34" ${st}/><ellipse cx="100" cy="55" rx="34" ry="11" fill="none" stroke="#4dd8ff" stroke-width="2" opacity=".6"/>`;
  } else if(n==='cono'){
   r=`<polygon points="100,18 66,78 134,78" ${st}/><ellipse cx="100" cy="78" rx="34" ry="11" ${st}/>`;
  } else if(n==='cilindro'){
   r=`<rect x="66" y="30" width="68" height="52" ${st}/><ellipse cx="100" cy="30" rx="34" ry="11" ${st}/><ellipse cx="100" cy="82" rx="34" ry="11" ${st}/>`;
  } else if(n==='piramide'){
   r=`<polygon points="100,18 64,80 136,80" ${st}/><polygon points="100,18 136,80 152,64" ${st}/>`;
  } else return '';
  return svgEnvoltura(r,100);
 }

 // Cuadricula con letras arriba y numeros al costado (OA 06). La letra es la COLUMNA
 // y el numero la FILA: el banco entero usa esa convencion y la declara en el enunciado.
 if(T==='cuadricula'){
  const c=Math.max(2,Math.min(6,v.cols||4)), f=Math.max(2,Math.min(6,v.filas||4));
  const cell=Math.min(30,150/c), x0=34, y0=26, an=cell*c, al=cell*f;
  let r='';
  for(let i=0;i<=c;i++) r+=`<line x1="${x0+i*cell}" y1="${y0}" x2="${x0+i*cell}" y2="${y0+al}" stroke="#8f6bff" stroke-width="1.5"/>`;
  for(let j=0;j<=f;j++) r+=`<line x1="${x0}" y1="${y0+j*cell}" x2="${x0+an}" y2="${y0+j*cell}" stroke="#8f6bff" stroke-width="1.5"/>`;
  for(let i=0;i<c;i++) r+=`<text x="${x0+(i+0.5)*cell}" y="${y0-5}" font-size="10" fill="#ffc93c" text-anchor="middle" font-weight="bold">${'ABCDEF'[i]}</text>`;
  for(let j=0;j<f;j++) r+=`<text x="${x0-7}" y="${y0+(j+0.5)*cell+4}" font-size="10" fill="#ffc93c" text-anchor="middle" font-weight="bold">${j+1}</text>`;
  (v.fichas||[]).forEach(fi=>{
   const cc=Math.max(1,Math.min(c,fi.col|0)), ff=Math.max(1,Math.min(f,fi.fila|0));
   r+=`<text x="${x0+(cc-0.5)*cell}" y="${y0+(ff-0.5)*cell+6}" font-size="${Math.round(cell*0.62)}" text-anchor="middle">${fi.emoji||'⭐'}</text>`;
  });
  if(v.rosa!==false){
   r+=`<line x1="14" y1="${y0+14}" x2="14" y2="${y0+2}" stroke="#4dd8ff" stroke-width="2"/>`
     +`<polygon points="14,${y0-3} 10,${y0+3} 18,${y0+3}" fill="#4dd8ff"/>`
     +`<text x="14" y="${y0+24}" font-size="9" fill="#4dd8ff" text-anchor="middle" font-weight="bold">N</text>`;
  }
  return svgEnvoltura(r, Math.round(y0+al+10));
 }

 // Globo con sus lineas imaginarias (OA 07). Nunca se rotulan: el nombre es la pregunta.
 if(T==='globo'){
  const cx=100, cy=58, R=44, D=(v.destacar||'');
  const oro='#ffc93c', gris='#7d76a8';
  const cuerda=dy=>Math.sqrt(Math.max(0,R*R-dy*dy));
  const linea=(dy,id,grosor)=>{
   const w=cuerda(dy), on=(D===id);
   return `<line x1="${cx-w}" y1="${cy+dy}" x2="${cx+w}" y2="${cy+dy}" stroke="${on?oro:gris}" stroke-width="${on?3.5:(grosor||1.5)}"/>`;
  };
  let r=`<circle cx="${cx}" cy="${cy}" r="${R}" fill="#1d1740" stroke="#4dd8ff" stroke-width="2.5"/>`;
  r+=`<ellipse cx="${cx}" cy="${cy}" rx="${R*0.42}" ry="${R}" fill="none" stroke="${gris}" stroke-width="1.2"/>`;
  r+=linea(-R*0.72,'circulo-norte'); r+=linea(-R*0.36,'tropico-norte');
  r+=linea(0,'ecuador',2.5);
  r+=linea(R*0.36,'tropico-sur');   r+=linea(R*0.72,'circulo-sur');
  r+=`<circle cx="${cx}" cy="${cy-R}" r="${D==='polo-norte'?5:3}" fill="${D==='polo-norte'?oro:'#4dd8ff'}"/>`;
  r+=`<circle cx="${cx}" cy="${cy+R}" r="${D==='polo-sur'?5:3}" fill="${D==='polo-sur'?oro:'#4dd8ff'}"/>`;
  return svgEnvoltura(r,118);
 }

 // Franjas climaticas (OA 08). Cinco bandas recortadas contra el circulo del planeta.
 if(T==='zonas'){
  const cx=100, cy=58, R=44, D=(v.destacar||'');
  const BANDAS=[
   ['fria-norte','fria','#9ad8ff',-1.00,-0.66],
   ['templada-norte','templada','#7fe0a8',-0.66,-0.26],
   ['calida','calida','#ffb35c',-0.26,0.26],
   ['templada-sur','templada','#7fe0a8',0.26,0.66],
   ['fria-sur','fria','#9ad8ff',0.66,1.00]];
  const id='zc'+Math.floor(cx+cy+R);
  let r=`<defs><clipPath id="${id}"><circle cx="${cx}" cy="${cy}" r="${R}"/></clipPath></defs>`;
  // Base clara bajo las franjas: sin ella, los colores a media opacidad sobre el fondo
  // violeta del juego quedan barrosos y la zona cálida se ve marrón (verificado mirando
  // la captura, no el codigo).
  r+=`<circle cx="${cx}" cy="${cy}" r="${R}" fill="#eceafa"/>`;
  r+=`<g clip-path="url(#${id})">`;
  BANDAS.forEach(b=>{
   const y1=cy+b[3]*R, y2=cy+b[4]*R;
   // Se puede destacar una banda concreta ("fria-sur") o su familia ("fria").
   const on=(D===b[0]||D===b[1]);
   r+=`<rect x="${cx-R}" y="${y1}" width="${2*R}" height="${y2-y1}" fill="${b[2]}" opacity="${on?1:0.5}"/>`;
  });
  // El realce va DESPUES de todas las franjas y solo con borde: si se dibuja franja por
  // franja, el borde de una queda tapado por la siguiente y se lee como dos lineas sueltas.
  BANDAS.forEach(b=>{
   if(D!==b[0]&&D!==b[1]) return;
   const y1=cy+b[3]*R, y2=cy+b[4]*R;
   r+=`<rect x="${cx-R-2}" y="${y1}" width="${2*R+4}" height="${y2-y1}" fill="none" stroke="#e0a400" stroke-width="2.5"/>`;
  });
  r+='</g>';
  r+=`<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#4dd8ff" stroke-width="2.5"/>`;
  // El Ecuador, marcado suave: a trazo lleno y oscuro parecia una grieta partiendo el planeta.
  r+=`<line x1="${cx-R}" y1="${cy}" x2="${cx+R}" y2="${cy}" stroke="#6b6396" stroke-width="1" stroke-dasharray="4 3" opacity="0.7"/>`;
  return svgEnvoltura(r,118);
 }

 // Linea de tiempo (OA 01, 02 y 04): hitos como [etiqueta, posicion entre 0 y 1].
 if(T==='linea'){
  const H=(v.hitos||[]).slice(0,4);
  if(!H.length) return '';
  const x0=22, x1=178, y=34;
  let r=`<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="#cfc9ee" stroke-width="2.5"/>`
       +`<polygon points="${x1},${y} ${x1-7},${y-4} ${x1-7},${y+4}" fill="#cfc9ee"/>`;
  H.forEach(h=>{
   const on=(v.destacar===h[0]);
   const x=x0+Math.max(0,Math.min(1,h[1]))*(x1-x0-10);
   r+=`<circle cx="${x}" cy="${y}" r="${on?6:4}" fill="${on?'#ffc93c':'#8f6bff'}"/>`;
   r+=`<text x="${x}" y="${y+20}" font-size="10" fill="${on?'#ffc93c':'#cfc9ee'}" text-anchor="middle" font-weight="bold">${String(h[0]).slice(0,14)}</text>`;
  });
  return svgEnvoltura(r,58);
 }

 return '';   // tipo desconocido: la pregunta vale igual, solo con texto
}

/* El CSS viaja con el módulo, igual que en assets/js/revision.js. Si viviera suelto en el
   <style> de cada curso, un nivel nuevo cargaría visuales.js, generaría bien el SVG y no
   se vería: el dibujo aparecería sin tamaño ni alineación, y eso no da ningún error.
   `--gold` sale de la paleta del juego, que ya define :root en los tres. */
(function(){
 if(document.getElementById('css-visuales')) return;
 var s=document.createElement('style');
 s.id='css-visuales';
 s.textContent='.q-visual{font-size:30px;text-align:center;line-height:1.5;margin:6px 0 10px;word-break:break-word}'+
   '.q-visual.qv-grupos{font-size:22px;display:flex;flex-wrap:wrap;gap:8px;justify-content:center}'+
   '.qv-grupo{border:2px dashed var(--gold);border-radius:12px;padding:4px 8px;display:inline-block}';
 (document.head||document.documentElement).appendChild(s);
})();
