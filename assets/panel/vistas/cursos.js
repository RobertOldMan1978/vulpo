/* Vista CURSOS del panel de profesores (Sesión 154).
   Reemplaza a la vieja pintarLista() como pantalla de cursos: una TABLA, una fila por curso,
   y toda la fila lleva al curso (#/curso/COD). Lo que antes vivía dentro de cada tarjeta
   plegada —equipo, alumnos, inscripción— ahora son pestañas de la vista del curso.

   Datos, los mismos RPC que usaba la lista vieja:
   - asegurarCursos(true)      -> kimun_prof_listar (cursos, nivel, alumnos, colegio_id)
   - kimun_prof_resumen        -> participación de la semana (igual que pintarTitularCurso).
                                  Si falla, cae a kimun_prof_participacion por curso, como
                                  cargarTitularesParticipacion: el número sin el contexto.
   - kimun_prof_equipo         -> profesor jefe (como cargarJefes). A un profe de asignatura
                                  le responde no_autorizado y la celda queda en "—".
   - kimun_prof_sostenedores / kimun_prof_colegios -> los filtros, solo para quien administra
                                  el colegio (window.ESADMINCOLEGIO).
   La administración de sostenedores y colegios y crear un curso viven en #/admin (admin.js).
   ⚠️ La participación NO es asistencia: aquí van conteos por curso, nunca nombres. */
(function(){
  window.VISTAS = window.VISTAS || {};
  const n = v => Number(v) || 0;
  const enc = encodeURIComponent;

  if(!document.getElementById('css-vista-cursos')){
    const st = document.createElement('style'); st.id = 'css-vista-cursos';
    st.textContent = `
.vcs-barra{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end;margin:0 0 16px}
.vcs-filtro{display:flex;flex-direction:column;min-width:200px}
.vcs-filtro .campo{margin:0 0 4px}
.vcs-filtro select{margin:0;width:100%;max-width:280px;padding:8px 10px;border-radius:8px}
.vcs-barra .vcs-esp{flex:1}
.vcs-nom{font-weight:600;color:var(--texto);text-decoration:none}
.vcs-nom:hover{color:var(--violet);text-decoration:underline}
.vcs-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.vcs-cod{font-size:12px;color:var(--dim)}
.vcs-movil{display:none;font-size:12px;color:var(--dim);margin-top:2px}
.vcs-jefe-sin{color:var(--gold);font-weight:600;display:inline-flex;align-items:center;gap:4px}
.vcs-jefe-sin svg{width:14px;height:14px}
.vcs-ir{color:var(--dim);width:18px;height:18px}
.vcs-ir svg{width:18px;height:18px}
.vcs-cuenta{font-size:13px;color:var(--dim);margin:0 0 10px}
@media (max-width:699px){
  .vcs-col-nivel,.vcs-col-alu,.vcs-col-jefe,.vcs-col-acc{display:none}
  .vcs-movil{display:block}
  .vcs-filtro{min-width:0;flex:1 1 140px}
  .vcs-barra .b{flex:1 1 100%}
}`;
    document.head.appendChild(st);
  }

  // Filtros vigentes (sobreviven a volver a la lista dentro de la misma sesión de página).
  const FILTRO = {sos:'', col:''};

  function celdaPart(f){
    if(!f) return '<span class="vcs-cod">—</span>';
    const tot = n(f.inscritos), hoy = n(f.jugaron_semana);
    if(!tot) return '<span class="vcs-cod">Sin alumnos inscritos</span>';
    const pct = Math.round(100 * hoy / tot);
    let flecha = '', ayuda = 'De los ' + tot + ' alumnos inscritos, ' + hoy
      + ' abrieron el juego en los últimos 7 días.';
    if(f.hay_previa){
      const ant = n(f.jugaron_previa);
      flecha = hoy > ant ? ' ↑' : (hoy < ant ? ' ↓' : ' →');
      ayuda += ' La semana pasada jugaron ' + ant + '. Este número sale de la última vez que '
             + 'cada alumno abrió el juego; el de la semana pasada, de las fotos del domingo.';
    }else{
      ayuda += ' Todavía no hay una semana anterior con la que comparar.';
    }
    return '<span class="ins ' + (pct < 50 ? 'ins-ambar' : 'ins-verde') + '" title="' + esc(ayuda) + '">'
      + hoy + ' de ' + tot + ' · ' + pct + '%' + esc(flecha) + '</span>';
  }

  window.VISTAS.cursos = {
    titulo: 'Cursos',
    async render(){
      const titulo = window.ESADMINCOLEGIO ? 'Cursos' : 'Mis cursos';
      ponerTitulo(titulo);
      ponerMigas([]);
      const lista = $('lista');
      lista.innerHTML = '<div class="sec"><div class="sec-cuerpo">' + esqueleto(5) + '</div></div>';
      cargando(true);
      try{ await asegurarCursos(true); }
      catch(e){ cargando('fin'); lista.innerHTML = '<div class="sec">' + vacio('alerta', errorPanel(e)) + '</div>'; return; }

      // Árbol de inquilinos, solo para quien administra el colegio (como agruparArbol).
      let sostenedores = [];          // [{id, nombre, colegios:[{id,nombre}]}]
      const colASos = {};             // colegio_id -> sostenedor_id
      if(window.ESADMINCOLEGIO){
        try{
          const {data:sos, error} = await SB.rpc('kimun_prof_sostenedores');
          if(error) throw error;
          for(const s of (sos||[])){
            const {data:cols} = await SB.rpc('kimun_prof_colegios', {p_sostenedor:s.id});
            sostenedores.push({id:s.id, nombre:s.nombre, colegios:cols||[]});
            (cols||[]).forEach(c => { colASos[c.id] = s.id; });
          }
        }catch(e){ sostenedores = []; }   // sin árbol: la tabla sale igual, sin filtros
      }
      cargando('fin');
      if(document.getElementById('lista') !== lista) return;

      const cursos = Object.entries(CURSO_INFO).map(([cod, c]) => Object.assign({cod}, c))
        .sort((a, b) => ordenCursos(a, b));

      if(!cursos.length){
        lista.innerHTML = '<div class="sec">' + vacio('cursos',
          window.ESADMINCOLEGIO
            ? 'Todavía no hay cursos. Créalos en Administración.'
            : 'Todavía no tienes cursos asignados. Pídele al equipo directivo que te agregue a uno.',
          window.ESADMINCOLEGIO ? '<a class="b b-pri" href="#/admin/cursos">' + ICO('mas') + 'Crear curso</a>' : '')
          + '</div>';
        return;
      }

      // Si un filtro guardado ya no existe (se borró el colegio), se limpia.
      if(FILTRO.sos && !sostenedores.some(s => s.id === FILTRO.sos)) FILTRO.sos = '';
      if(FILTRO.col && FILTRO.col !== '-' && !colASos[FILTRO.col]) FILTRO.col = '';

      const hayFiltros = window.ESADMINCOLEGIO && sostenedores.length > 0;
      const barra = (hayFiltros || window.ESADMINCOLEGIO) ? '<div class="vcs-barra">'
        + (hayFiltros
          ? '<div class="vcs-filtro"><label class="campo" for="vcsSos">Sostenedor</label>'
            + '<select id="vcsSos"><option value="">Todos</option>'
            + sostenedores.map(s => '<option value="' + esc(s.id) + '"' + (s.id === FILTRO.sos ? ' selected' : '') + '>'
                + esc(s.nombre) + '</option>').join('') + '</select></div>'
            + '<div class="vcs-filtro"><label class="campo" for="vcsCol">Colegio</label>'
            + '<select id="vcsCol"></select></div>'
          : '')
        + '<span class="vcs-esp"></span>'
        + (window.ESADMINCOLEGIO ? '<a class="b b-pri" href="#/admin/cursos">' + ICO('mas') + 'Crear curso</a>' : '')
        + '</div>' : '';

      lista.innerHTML = barra
        + '<div class="sec"><div class="sec-cuerpo sin-pad" style="overflow-x:auto"><table class="tabla vcs-tabla">'
        + '<thead><tr><th>Curso</th><th class="vcs-col-nivel">Nivel</th><th class="num vcs-col-alu">Alumnos</th>'
        + '<th>Participación esta semana</th><th class="vcs-col-jefe">Profesor jefe</th>'
        + '<th class="vcs-col-acc"><span class="vcs-sr">Acción</span></th></tr></thead>'
        + '<tbody>' + cursos.map(c => {
            const href = '#/curso/' + enc(c.cod);
            const nivel = NIVEL_NOMBRE(c.nivel) || 'Sin nivel';
            const alu = n(c.nAlumnos);
            return '<tr class="fila-link" data-ir="' + esc(href) + '" data-cod="' + esc(c.cod) + '"'
              + ' data-col="' + esc(c.colegioId || '') + '">'
              + '<td><a class="vcs-nom" href="' + esc(href) + '">' + esc(c.nombre) + '</a>'
              + '<div class="vcs-cod">' + esc(c.cod) + (c.colegio ? ' · ' + esc(c.colegio) : '') + '</div>'
              + '<div class="vcs-movil">' + esc(nivel) + ' · ' + alu + ' alumno' + (alu === 1 ? '' : 's')
              + '<span class="vcs-jefe-m" data-jefe="' + esc(c.cod) + '"></span></div></td>'
              + '<td class="vcs-col-nivel">' + esc(nivel) + '</td>'
              + '<td class="num vcs-col-alu">' + alu + '</td>'
              + '<td class="vcs-part" data-part="' + esc(c.cod) + '"><span class="vcs-cod">…</span></td>'
              + '<td class="vcs-col-jefe" data-jefe="' + esc(c.cod) + '"><span class="vcs-cod">…</span></td>'
              + '<td class="num vcs-col-acc"><a class="b b-sec" href="' + esc(href) + '">Ver curso</a></td>'
              + '</tr>';
          }).join('') + '</tbody></table>'
        + '<div class="vacio" id="vcsVacio" hidden>' + ICO('buscar') + '<p>Ningún curso calza con el filtro.</p></div>'
        + '</div></div>';

      lista.querySelectorAll('tr[data-ir]').forEach(tr => tr.addEventListener('click', ev => {
        if(ev.target.closest('a,button')) return;   // el enlace ya navega solo
        ir(tr.dataset.ir);
      }));

      // ---- Filtros Sostenedor / Colegio ----
      if(hayFiltros){
        const selS = $('vcsSos'), selC = $('vcsCol');
        const opcionesColegio = () => {
          const lista = FILTRO.sos ? sostenedores.filter(s => s.id === FILTRO.sos) : sostenedores;
          const opts = [];
          lista.forEach(s => s.colegios.forEach(c => opts.push({id:c.id, etq: (FILTRO.sos ? '' : s.nombre + ' · ') + c.nombre})));
          if(FILTRO.col && FILTRO.col !== '-' && !opts.some(o => o.id === FILTRO.col)) FILTRO.col = '';
          selC.innerHTML = '<option value="">Todos</option>'
            + opts.map(o => '<option value="' + esc(o.id) + '"' + (o.id === FILTRO.col ? ' selected' : '') + '>' + esc(o.etq) + '</option>').join('')
            + (FILTRO.sos ? '' : '<option value="-"' + (FILTRO.col === '-' ? ' selected' : '') + '>Sin colegio</option>');
        };
        const aplicar = () => {
          let vis = 0;
          lista.querySelectorAll('tr[data-cod]').forEach(tr => {
            const col = tr.dataset.col;
            let ok = true;
            if(FILTRO.col === '-') ok = !col || !colASos[col];
            else if(FILTRO.col) ok = col === FILTRO.col;
            else if(FILTRO.sos) ok = !!col && colASos[col] === FILTRO.sos;
            tr.hidden = !ok; if(ok) vis++;
          });
          $('vcsVacio').hidden = vis > 0;
        };
        opcionesColegio();
        selS.onchange = () => { FILTRO.sos = selS.value; opcionesColegio(); aplicar(); };
        selC.onchange = () => { FILTRO.col = selC.value; aplicar(); };
        aplicar();
      }

      cargarParticipacionTabla(lista, cursos.map(c => c.cod));
      cargarJefesTabla(lista, cursos.map(c => c.cod));
    }
  };

  // Participación de la semana: una consulta (kimun_prof_resumen) para todos los cursos.
  async function cargarParticipacionTabla(lista, codigos){
    try{
      const {data, error} = await SB.rpc('kimun_prof_resumen');
      if(error) throw error;
      const por = {}; (data||[]).forEach(f => { por[f.curso_codigo] = f; });
      if(!document.contains(lista)) return;
      codigos.forEach(cod => {
        const td = lista.querySelector('[data-part="' + CSS.escape(cod) + '"]');
        if(td) td.innerHTML = celdaPart(por[cod]);
      });
    }catch(e){
      // Respaldo: el número sin el contexto, una consulta por curso (cargarTitularesParticipacion).
      codigos.forEach(async cod => {
        const td = lista.querySelector('[data-part="' + CSS.escape(cod) + '"]');
        if(!td) return;
        try{
          const {data, error} = await SB.rpc('kimun_prof_participacion', {p_curso_codigo:cod});
          if(error) throw error;
          const g = gruposParticipacion(data);
          const total = (data||[]).length;
          td.innerHTML = total ? '<span class="ins">' + g.semana.length + ' de ' + total + '</span>'
                               : '<span class="vcs-cod">Sin alumnos inscritos</span>';
        }catch(_){ td.innerHTML = '<span class="vcs-cod">No disponible</span>'; }
      });
    }
  }

  // Profesor jefe de cada curso (cargarJefes). Los nodos se capturan ANTES del await.
  function cargarJefesTabla(lista, codigos){
    codigos.forEach(async cod => {
      const nodos = [...lista.querySelectorAll('[data-jefe="' + CSS.escape(cod) + '"]')];
      if(!nodos.length) return;
      try{
        const {data, error} = await SB.rpc('kimun_prof_equipo', {p_curso_codigo:cod});
        if(error) throw error;
        const equipo = data || [];
        const jefe = equipo.find(m => m.rol === 'jefe');
        const otros = equipo.filter(m => m.rol !== 'jefe').length;
        const cola = otros ? '<div class="vcs-cod">' + otros + ' de asignatura</div>' : '';
        nodos.forEach(nd => {
          const movil = nd.classList.contains('vcs-jefe-m');
          if(jefe) nd.innerHTML = movil ? ' · Jefe: ' + esc(jefe.nombre || jefe.correo)
                                        : esc(jefe.nombre || jefe.correo) + cola;
          else nd.innerHTML = (movil ? ' · ' : '') + '<span class="vcs-jefe-sin">' + ICO('alerta') + 'Sin profesor jefe</span>'
                            + (movil ? '' : cola);
        });
      }catch(e){
        nodos.forEach(nd => { nd.innerHTML = nd.classList.contains('vcs-jefe-m') ? '' : '<span class="vcs-cod">—</span>'; });
      }
    });
  }
})();
