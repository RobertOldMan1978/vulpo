/* Vista FICHA DE UN ALUMNO del panel de profesores (Sesión 154). Migrada de
   verAvanceAlumno() de profesor.html: mismo RPC (kimun_prof_dominio_alumno, que recibe el
   ID DE PERFIL y nunca el código ALU-, que es la credencial del alumno), la planificación
   del curso en el MISMO Promise.all (decide qué unidades están cerradas) y el mismo corte:
   en clases ahora arriba, lo que todavía no empieza plegado, y lo terminado al historial,
   por asignatura.

   Las filas se dibujan con filaAvance/agruparFilas, compartidas con la vista del curso, para
   que las dos no discrepen. Lo que cambia es el envoltorio: las secciones y los controles.
   ⚠️ La ficha NO lleva los tres bloques del curso (Para reforzar / Van bien / Pocos datos):
   salen del corte de 10 alumnos y aquí el alumno es uno solo (el RPC no devuelve alumnos_1).
   ⚠️ Las filas NO se despliegan: no hay grupos de alumnos que mostrar en un alumno. */
(function(){
  window.VISTAS = window.VISTAS || {};

  if(!document.getElementById('css-vista-alumno')){
    const st = document.createElement('style');
    st.id = 'css-vista-alumno';
    st.textContent = `
.va-aviso{font-size:13px;color:var(--cuerpo);line-height:1.55;margin:0 0 18px;padding:12px 14px;
  border-left:3px solid var(--violet);background:var(--violet-t);border-radius:0 8px 8px 0;max-width:92ch}
.va-ctrl{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:0 0 10px}
.va-ctrl-lbl{font-size:12px;color:var(--dim);font-weight:600;margin-right:4px}
.va-ctrl .av-chip{margin:0}
.va-sec .sec-cab svg{width:18px;height:18px;color:var(--dim);flex:0 0 auto}
.va-sec.va-clases .sec-cab svg{color:var(--gold)}
.va-sec .sec-cab .ins{margin-left:auto}
.va-cuerpo{padding:4px 18px 10px}
.va-cuerpo .oa-fila>summary{cursor:default}
.va-cuerpo .oa-fila:last-child{border-bottom:0 !important}
.va-cuerpo .oa-grupo{margin:10px 0 4px}
.va-cuerpo .oa-grupo-tit{padding:6px 0 2px;border-bottom:1px solid var(--linea)}
.va-plegable>summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:10px;padding:14px 18px}
.va-plegable>summary::-webkit-details-marker{display:none}
.va-plegable>summary h2{font-size:15px;font-weight:600;margin:0;flex:1}
.va-plegable>summary .va-chev{transition:transform .15s;display:inline-flex}
.va-plegable[open]>summary .va-chev{transform:rotate(90deg)}
.va-plegable[open]>summary{border-bottom:1px solid var(--linea)}
.va-nota{font-size:12px;color:var(--dim);margin:10px 0 4px;max-width:78ch}
.va-hist-asig{margin:8px 0 14px}
.va-hist-asig-tit{font-size:12px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--cuerpo);margin:12px 0 2px}
.va-hist-asig-tit span{color:var(--dim);font-weight:400;letter-spacing:0}
.va-vacio-sec{font-size:13px;color:var(--dim);margin:12px 0}
.va-pie{display:flex;gap:8px;flex-wrap:wrap}
@media (max-width:600px){ .va-kpis{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px} .va-kpis .kpi{padding:12px 14px} .va-kpis .kpi-num{font-size:24px} }
@media (max-width:899px){ .va-cuerpo{padding:4px 14px 10px} .va-plegable>summary{padding:12px 14px} }`;
    document.head.appendChild(st);
  }

  const ESTADO_TXT = {clases:'En clases ahora', futura:'Todavía no empieza', cerrada:'Terminada'};
  const n = v => Number(v) || 0;
  const pctFila = f => { const r = n(f.resp_1); return r ? Math.round(n(f.ok_1) * 100 / r) : 0; };

  function kpi(icono, titulo, num, sub, clase){
    return '<div class="kpi"><div class="kpi-tit">' + ICO(icono) + esc(titulo) + '</div>'
      + '<div class="kpi-num"' + (clase ? ' style="color:var(' + clase + ')"' : '') + '>' + num + '</div>'
      + (sub ? '<div class="kpi-sub">' + esc(sub) + '</div>' : '') + '</div>';
  }

  // El historial: por ASIGNATURA y dentro por unidad en orden curricular, como se busca algo
  // pasado ("¿cómo quedó Historia?"). Sin los tres bloques: decir "refuerza esto" sobre una
  // unidad ya cerrada es justo lo que el corte viene a evitar.
  function historial(filas){
    const g = {};
    filas.forEach(f => { const a = String(f.oa).slice(0,4); (g[a] = g[a] || []).push(f); });
    return ASIG_ORDEN.filter(a => g[a]).map(a => {
      const porU = {};
      g[a].forEach(f => {
        const u = OA_UNIDAD[f.oa];
        const k = u ? u.id : '_sin';
        if(!porU[k]) porU[k] = {orden: u ? u.orden : 99, tit: u ? u.titulo : 'Sin unidad declarada',
                                clave: claveUnidad(a, u ? u.id : ''), filas: []};
        porU[k].filas.push(f);
      });
      return '<div class="va-hist-asig"><div class="va-hist-asig-tit">' + esc(ASIG_NOMBRE[a] || a)
        + ' <span>(' + g[a].length + ')</span></div>'
        + Object.keys(porU).sort((x, y) => porU[x].orden - porU[y].orden).map(k =>
            '<div class="oa-grupo"><div class="oa-grupo-tit">' + esc(porU[k].tit)
            + ' <span>(' + porU[k].filas.length + ')</span>' + fechasDeUnidad(porU[k].clave, false) + '</div>'
            + porU[k].filas.map(f => filaAvance(f, false)).join('') + '</div>').join('')
        + '</div>';
    }).join('');
  }

  function cuerpo(filas, agrupar, multi){
    const por = {clases:[], futura:[], cerrada:[], '':[]};
    filas.forEach(f => por[estadoDeOA(f.oa)].push(f));
    // Sin fechas no hay estado: esos objetivos van con lo que se está pasando, que es donde
    // el profesor los busca.
    const ahora = por.clases.concat(por['']);
    const hayCorte = por.cerrada.length || por.futura.length;
    if(!hayCorte){
      return '<section class="sec va-sec"><div class="sec-cab">' + ICO('objetivo')
        + '<h2>Objetivos</h2><span class="ins">' + filas.length + '</span></div>'
        + '<div class="va-cuerpo">' + agruparFilas(filas, agrupar, multi) + '</div></section>';
    }
    let h = '<section class="sec va-sec va-clases"><div class="sec-cab">' + ICO('libro')
      + '<h2>' + ESTADO_TXT.clases + '</h2><span class="ins ins-violeta">' + ahora.length + '</span></div>'
      + '<div class="va-cuerpo"><p class="va-nota">Lo que el curso está pasando en estas semanas.</p>'
      + (ahora.length ? agruparFilas(ahora, agrupar, multi)
        : '<p class="va-vacio-sec">Ninguna unidad en clases tiene objetivos medidos todavía.</p>')
      + '</div></section>';
    if(por.futura.length) h += '<details class="sec va-plegable"><summary><span class="va-chev">' + ICO('derecha') + '</span>'
      + ICO('reloj') + '<h2>' + ESTADO_TXT.futura + '</h2><span class="ins">' + por.futura.length + '</span></summary>'
      + '<div class="va-cuerpo"><p class="va-nota">Sus unidades empiezan más adelante. Si ya hay respuestas es porque el '
      + 'alumno se adelantó jugando por su cuenta, no porque el curso las esté viendo.</p>'
      + agruparFilas(por.futura, 'unidad', multi) + '</div></details>';
    if(por.cerrada.length) h += '<details class="sec va-plegable"><summary><span class="va-chev">' + ICO('derecha') + '</span>'
      + ICO('calendario') + '<h2>Historial · unidades terminadas</h2><span class="ins">' + por.cerrada.length + '</span></summary>'
      + '<div class="va-cuerpo"><p class="va-nota">Su fecha de término ya pasó, así que este porcentaje es el registro '
      + 'de cómo quedaron, no una tarea de esta semana.</p>' + historial(por.cerrada) + '</div></details>';
    return h;
  }

  // Ni fila desplegable, ni recorte a dos líneas, ni sellos con emoji: en la ficha de un
  // alumno no hay detalle que abrir, y un texto recortado no se podría leer entero.
  function pulir(caja){
    caja.querySelectorAll('.oa-fila').forEach(det => {
      det.addEventListener('click', e => { if(e.target.closest('summary')) e.preventDefault(); });
      const t = det.querySelector('.oa-texto'); if(t) t.classList.remove('oa-texto');
      const d = det.querySelector('.oa-detalle'); if(d) d.remove();
    });
    caja.querySelectorAll('.uni-sello').forEach(s => {
      const est = ['clases','futura','cerrada'].find(k => s.classList.contains('uni-' + k));
      if(est) s.textContent = ESTADO_TXT[est];
    });
  }

  function volver(cod){
    if(window.hayRutaPrevia && hayRutaPrevia()) history.back(); else ir('#/curso/' + encodeURIComponent(cod));
  }

  window.VISTAS.alumno = {
    titulo: 'Alumno',
    async render(p){
      const lista = $('lista');
      const hash = location.hash;
      const cod = p.cod, nombre = p.nombre || 'Alumno';
      ponerTitulo(nombre, 'Avance por objetivo');
      lista.innerHTML = '<div class="kpis"><div class="kpi">' + esqueleto(2) + '</div></div>'
        + '<div class="sec"><div class="sec-cuerpo">' + esqueleto(6) + '</div></div>';
      cargando(true);
      let data;
      try{
        /* El plan va en el MISMO Promise.all que el avance: decide qué unidades están
           cerradas. Su fallo NO rompe la ficha: sin plan no hay historial. */
        const [av] = await Promise.all([
          SB.rpc('kimun_prof_dominio_alumno', {p_perfil:p.pid}),
          cod ? traerPlan(cod).catch(() => { PLAN_CURSO = null; }) : Promise.resolve()
        ]);
        if(av.error) throw av.error;
        data = av.data || [];
        if(data.length) await cargarTextosOA(data.map(f => f.oa));
      }catch(e){
        cargando('fin');
        if(location.hash !== hash) return;
        lista.innerHTML = '<div class="sec">' + vacio('alerta', errorPanel(e)) + '</div>';
        return;
      }
      cargando('fin');
      if(location.hash !== hash) return;

      const botonVolver = '<button type="button" class="b b-sec" id="vaVolver">' + ICO('atras') + 'Volver al curso</button>';
      if(!data.length){
        lista.innerHTML = '<div class="sec">' + vacio('usuario',
          'Este alumno todavía no tiene datos. Aparecen cuando juega las campañas.', botonVolver) + '</div>';
        document.getElementById('vaVolver').onclick = () => volver(cod);
        return;
      }

      const medidos = data.filter(f => n(f.resp_1) > 0);
      const bien = medidos.filter(f => pctFila(f) >= 70).length;
      const camino = medidos.filter(f => { const x = pctFila(f); return x >= 45 && x < 70; }).length;
      const apoyo = medidos.filter(f => pctFila(f) < 45).length;
      const hay = new Set(data.map(f => String(f.oa).slice(0,4)));
      const asigs = ASIG_ORDEN.filter(a => hay.has(a));
      const multiTotal = asigs.length >= 2;

      lista.innerHTML =
        '<div class="kpis va-kpis">'
        + kpi('objetivo', 'Objetivos jugados', data.length, multiTotal ? asigs.length + ' asignaturas' : (ASIG_NOMBRE[asigs[0]] || ''))
        + kpi('ok', 'Van bien', bien, '70% o más en el primer intento', '--green')
        + kpi('grafico', 'En camino', camino, 'entre 45% y 69%', '--ambar')
        + kpi('alerta', 'Necesita apoyo', apoyo, 'bajo 45%', '--pink')
        + '</div>'
        + '<p class="va-aviso">Objetivos de este alumno, de menor a mayor acierto. ' + AVISO_NO_CALIFICA + '</p>'
        + (multiTotal ? '<div class="va-ctrl" role="group" aria-label="Filtrar por asignatura"><span class="va-ctrl-lbl">Asignatura</span>'
            + '<button type="button" class="av-chip on" data-asig="">Todas</button>'
            + asigs.map(a => '<button type="button" class="av-chip" data-asig="' + esc(a) + '">' + esc(ASIG_NOMBRE[a] || a) + '</button>').join('')
            + '</div>' : '')
        + '<div class="va-ctrl" role="group" aria-label="Agrupar"><span class="va-ctrl-lbl">Agrupar por</span>'
        + '<button type="button" class="av-chip on" data-agr="">Rendimiento</button>'
        + '<button type="button" class="av-chip" data-agr="unidad">Unidad</button>'
        + (multiTotal ? '<button type="button" class="av-chip" data-agr="asig">Asignatura</button>' : '')
        + '</div>'
        + '<div id="vaCuerpo"></div>'
        + '<div class="va-pie">' + botonVolver + '</div>';

      let filtro = '', agrupar = '';
      const caja = document.getElementById('vaCuerpo');
      const pintar = () => {
        const filas = filtro ? data.filter(f => String(f.oa).slice(0,4) === filtro) : data;
        const multi = new Set(filas.map(f => String(f.oa).slice(0,4))).size > 1;
        const modo = (agrupar === 'asig' && !multi) ? '' : agrupar;
        caja.innerHTML = filas.length ? cuerpo(filas, modo, multi)
          : '<div class="sec">' + vacio('objetivo', 'Esta asignatura todavía no tiene datos.') + '</div>';
        pulir(caja);
      };
      const marcar = (sel, btn) => lista.querySelectorAll(sel).forEach(b => {
        const on = b === btn; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      lista.querySelectorAll('[data-asig]').forEach(b => {
        b.setAttribute('aria-pressed', b.classList.contains('on') ? 'true' : 'false');
        b.onclick = () => { marcar('[data-asig]', b); filtro = b.dataset.asig || ''; pintar(); };
      });
      lista.querySelectorAll('[data-agr]').forEach(b => {
        b.setAttribute('aria-pressed', b.classList.contains('on') ? 'true' : 'false');
        b.onclick = () => { marcar('[data-agr]', b); agrupar = b.dataset.agr || ''; pintar(); };
      });
      document.getElementById('vaVolver').onclick = () => volver(cod);
      pintar();
    }
  };
})();
