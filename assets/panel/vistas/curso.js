/* Vista CURSO del panel de profesores (Sesión 154).
   Rutas #/curso/:cod y #/curso/:cod/:tab. Recibe {cod, tab, curso} con curso = CURSO_INFO[cod].

   Antes un curso era una tarjeta plegable con cuatro desplegables adentro (equipo, alumnos,
   enlace, ver avance) y el avance una pantalla aparte con todo apilado. Ahora es UNA pantalla
   con pestañas que son enlaces (#/curso/COD/<tab>), así que se pueden recargar, enlazar y
   volver con el botón atrás.

   Reutiliza las funciones de profesor.html (cargarTendencia, cargarParticipacion, cargarPlan,
   cargarRefuerzo, cargarRankingAsignatura, cargarEquipo, cargarInscripcion, cuerpoConHistorial…)
   en los MISMOS contenedores que esas funciones esperan, y llama los MISMOS RPC. Lo que cambia
   es la presentación. Las acciones de esas funciones (quitar del equipo, crear otro enlace,
   quitar fechas, lanzar/cerrar refuerzo, fijar el nivel) confirman ellas mismas con
   confirmar() de ui.js: aquí ya no se interceptan, o se confirmaría dos veces.

   Las pestañas se muestran con las mismas condiciones de la tarjeta vieja:
   - equipo, inscripción y agregar/quitar alumnos: solo si `gestiono`.
   - cívica: solo si veHistoria(cod, nivel) (un profe de otra asignatura no tiene esos OA).
   - ajustes: colegio y eliminar curso solo con ESADMINCOLEGIO; fijar el nivel, si el curso
     no lo tiene y `gestiono` (la vieja lo ofrecía dentro del equipo).
   ⚠️ Los porcentajes son de primer intento y no sirven para calificar; la participación no
   es asistencia. Los nombres de alumnos van siempre por esc(). */
(function(){
  window.VISTAS = window.VISTAS || {};
  const enc = encodeURIComponent;
  const n = v => Number(v) || 0;

  if(!document.getElementById('css-vista-curso')){
    const st = document.createElement('style'); st.id = 'css-vista-curso';
    st.textContent = `
.vcu-cab{display:flex;flex-wrap:wrap;align-items:center;gap:8px 16px;margin:0 0 6px}
.vcu-cab h2{margin:0;font-size:20px;font-weight:700;letter-spacing:-.01em;color:var(--texto)}
.vcu-meta{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:13px;color:var(--dim)}
.vcu-meta code{font-size:12px}
.vcu .tabs{margin-top:6px;overflow-y:hidden;scrollbar-width:none}
.vcu .tabs::-webkit-scrollbar{display:none}
.vcu .tab{display:inline-flex;align-items:center;gap:6px}
.vcu .tab svg{width:16px;height:16px}
.vcu-nota{color:var(--dim);font-size:13px;margin:0 0 12px;max-width:78ch}
.vcu-nota-pie{color:var(--dim);font-size:12px;margin:12px 0 0;max-width:78ch}
/* Los bloques viejos nacen como <details> con bordes y colores inline del tema oscuro: dentro
   de una .sec se les quita el marco propio y el summary hace de encabezado de la tarjeta. */
.vcu-blq > details{border:0 !important;border-radius:0 !important;padding:0 !important;margin:0 !important;background:none}
.vcu-blq > details > summary{display:flex;align-items:center;gap:8px;padding:14px 18px !important;
  font-size:15px !important;font-weight:600;color:var(--texto) !important;list-style:none;cursor:pointer}
.vcu-blq > details > summary::-webkit-details-marker{display:none}
.vcu-blq > details > summary::before{content:'▸';color:var(--dim);font-size:12px;width:12px}
.vcu-blq > details[open] > summary::before{content:'▾'}
.vcu-blq > details[open] > summary{border-bottom:1px solid var(--linea)}
.vcu-blq > details > div{padding:12px 18px 16px !important}
.vcu #rankingBloque > h3,.vcu #refuerzoBloque > h3{color:var(--texto) !important;font-size:15px !important;font-weight:600;text-transform:none;letter-spacing:0}
.vcu .equipo-fila{padding:10px 0 !important;border-bottom:1px solid var(--linea)}
.vcu .equipo-fila b{color:var(--texto) !important;font-weight:600}
.vcu .inscripcion-cuerpo label.campo{display:block;max-width:520px}
.vcu .inscripcion-cuerpo label.campo select{display:block;margin-top:4px}
.vcu .inscripcion-cuerpo .ins-qr{justify-content:flex-start !important}
.vcu .ref-grupo>summary{display:flex;align-items:center;gap:8px}
.vcu .ref-grupo>summary::before{content:'▸';color:var(--dim);font-size:12px}
.vcu .ref-grupo[open]>summary::before{content:'▾'}
.vcu .btn{width:auto;max-width:none;padding:9px 14px;margin-bottom:0}
.vcu .btn.sec{padding:8px 14px}
.vcu .btn-fila{gap:8px}
.vcu .equipo-cuerpo input[type=email]{max-width:420px}
.vcu .inscripcion-cuerpo .ins-url{max-width:520px}
.vcu .inscripcion-cuerpo .btn{margin:4px 0}
.vcu-buscar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:12px 18px;border-bottom:1px solid var(--linea)}
.vcu-buscar input{margin:0;max-width:320px;padding:8px 10px}
.vcu-alu-nom{font-weight:600;color:var(--texto);text-decoration:none}
.vcu-alu-nom:hover{color:var(--violet);text-decoration:underline}
.vcu-alu-sub{font-size:12px;color:var(--dim);margin-top:2px;display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.vcu-acc{display:flex;gap:6px;justify-content:flex-end}
.vcu-form{display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end}
.vcu-form .vcu-campo{display:flex;flex-direction:column;flex:1 1 260px;max-width:420px}
.vcu-form .vcu-campo .campo{margin:0 0 4px}
.vcu-form input,.vcu-form select{margin:0;height:38px;padding:0 10px}
.vcu-masivo{margin-top:14px}
.vcu-masivo > summary{cursor:pointer;color:var(--cyan);font-weight:600;font-size:14px;list-style:none}
.vcu-masivo > summary::-webkit-details-marker{display:none}
.vcu-masivo textarea{max-width:520px;margin:8px 0}
.vcu-peligro{border-color:#b42b4840}
.vcu-peligro .sec-cab h2{color:var(--pink)}
.vcu-civ .civ-lista{margin-top:6px}
.vcu-civ .civ-txt{white-space:normal;overflow:visible}
@media (max-width:699px){
  .vcu-col-xp{display:none}
  .vcu-cab h2{font-size:18px}
  .vcu-buscar{padding:10px 12px}
  .vcu .sec-cab{flex-wrap:wrap;gap:2px 10px}
  .vcu .sec-cab h2{flex:1 1 100%}
  .vcu-civ .civ-oa{flex-wrap:wrap;gap:4px 12px}
  .vcu-civ .civ-cod{order:1;flex:1 1 auto}
  .vcu-civ .civ-dom{order:1}
  .vcu-civ .civ-txt{order:2;flex:1 1 100%}
}
@media print{
  .vcu-cab,.vcu .tabs{display:none !important}
  .vcu-civ{border:0 !important}
  .vcu-civ .sec-cuerpo{padding:0}
}`;
    document.head.appendChild(st);
  }

  const TABS = [
    {id:'avance',        txt:'Avance',              ico:'grafico',    ver:() => true},
    {id:'alumnos',       txt:'Alumnos',             ico:'usuario',    ver:() => true},
    {id:'equipo',        txt:'Equipo',              ico:'usuarioMas', ver:c => !!c.gestiono},
    {id:'planificacion', txt:'Planificación',       ico:'calendario', ver:() => true},
    {id:'refuerzo',      txt:'Refuerzo',            ico:'refuerzo',   ver:() => true},
    {id:'civica',        txt:'Formación Ciudadana', ico:'civica',     ver:(c, cod) => veHistoria(cod, c.nivel || '')},
    {id:'inscripcion',   txt:'Inscripción',         ico:'enlace',     ver:c => !!c.gestiono},
    {id:'ajustes',       txt:'Ajustes',             ico:'ajustes',    ver:c => !!window.ESADMINCOLEGIO || (!!c.gestiono && !c.nivel)}
  ];

  // ¿Sigue a la vista este panel? Si el profesor ya cambió de pestaña o de curso, la respuesta
  // tardía de una consulta no debe escribir encima de otra pantalla (la carrera de la Sesión 26).
  const vivo = el => !!el && document.contains(el);

  function rolTexto(c){
    if(c.miRol === 'jefe') return 'Profesor jefe';
    if(c.miRol === 'asignatura' && c.misAsig && c.misAsig.length)
      return c.misAsig.map(a => ASIG_NOMBRE[a] || a).join(', ');
    return '';
  }

  window.VISTAS.curso = {
    titulo: 'Curso',
    async render(p){
      const cod = p.cod, c = p.curso || CURSO_INFO[cod];
      if(!c){ noEncontrado(); return; }
      const visibles = TABS.filter(t => t.ver(c, cod));
      let tab = visibles.find(t => t.id === (p.tab || 'avance'));
      if(!tab){ ir('#/curso/' + enc(cod), {reemplazar:true}); return; }
      const nivelNom = NIVEL_NOMBRE(c.nivel) || '';
      ponerTitulo(c.nombre, nivelNom || 'Sin nivel');
      ponerMigas(tab.id === 'avance' ? [[titCursos(), '#/cursos']]
        : [[titCursos(), '#/cursos'], [c.nombre, '#/curso/' + enc(cod)]]);
      const rol = rolTexto(c);
      const lista = $('lista');
      lista.innerHTML = '<div class="vcu">'
        // El nombre y el nivel ya los dice la barra superior: aquí va el resto de la ficha.
        + '<div class="vcu-cab"><div class="vcu-meta">'
        + '<code>' + esc(cod) + '</code>'
        + (c.colegio ? '<span class="ins ins-violeta">' + ICO('colegio') + esc(c.colegio) + '</span>' : '')
        + '<span>' + n(c.nAlumnos) + ' alumno' + (n(c.nAlumnos) === 1 ? '' : 's') + '</span>'
        + (rol ? '<span>· Tú: <b style="color:var(--texto);font-weight:600">' + esc(rol) + '</b></span>' : '')
        + '</div></div>'
        + '<nav class="tabs" aria-label="Secciones del curso">' + visibles.map(t =>
            '<a class="tab' + (t.id === tab.id ? ' on" aria-current="page' : '') + '" href="#/curso/' + enc(cod)
            + (t.id === 'avance' ? '' : '/' + t.id) + '">' + ICO(t.ico) + esc(t.txt) + '</a>').join('')
        + '</nav>'
        // Marca para nivelDeCurso(): los bloques viejos (equipo, inscripción) se repintan tras
        // cada acción y buscan el nivel en un <details data-cod data-nivel>.
        + '<details class="vcu-marca" hidden data-cod="' + esc(cod) + '" data-nivel="' + esc(c.nivel || '') + '"></details>'
        + '<div id="vcuPanel"></div></div>';
      const panel = $('vcuPanel');
      // En el teléfono las pestañas se desplazan de lado: la activa queda a la vista.
      const navTabs = lista.querySelector('.vcu .tabs'), tOn = navTabs && navTabs.querySelector('.tab.on');
      if(tOn && navTabs.scrollWidth > navTabs.clientWidth) navTabs.scrollLeft = Math.max(0, tOn.offsetLeft - navTabs.offsetLeft - 16);
      panel.innerHTML = '<div class="sec"><div class="sec-cuerpo">' + esqueleto(5) + '</div></div>';
      try{
        await PESTANAS[tab.id](panel, cod, c);
      }catch(e){
        cargando('fin');
        if(vivo(panel)) panel.innerHTML = '<div class="sec">' + vacio('alerta', errorPanel(e)) + '</div>';
      }
    }
  };


  const PESTANAS = {

    /* ===== Avance: tendencia, participación, mapa por objetivo, ranking ===== */
    async avance(panel, cod, c){
      cargando(true);
      const {data, error} = await SB.rpc('kimun_prof_dominio', {p_curso_codigo:cod});
      if(error) throw error;
      if(!vivo(panel)){ cargando('fin'); return; }
      if(!data || !data.length){
        cargando('fin');
        panel.innerHTML = '<div class="sec vcu-blq">' + bloqueParticipacionHTML() + '</div>'
          + '<div class="sec">' + vacio('grafico',
              'Todavía no hay datos de avance de este curso. Aparecen cuando los alumnos juegan las campañas.',
              '<a class="b b-sec" href="#/curso/' + enc(cod) + '/planificacion">' + ICO('calendario') + 'Ir a la planificación</a>')
          + '</div>';
        cargarParticipacion(cod);
        return;
      }
      await cargarTextosOA(data.map(f => f.oa));
      cargando('fin');
      if(!vivo(panel)) return;
      panel.innerHTML =
          '<div class="sec vcu-blq">' + bloqueTendenciaHTML() + '</div>'
        + '<div class="sec vcu-blq">' + bloqueParticipacionHTML() + '</div>'
        + '<div class="sec"><div class="sec-cab"><h2>Avance por objetivo</h2>'
        + '<span class="sec-sub">De menor a mayor acierto</span></div><div class="sec-cuerpo">'
        + '<p class="vcu-nota">' + AVISO_NO_CALIFICA + '</p>'
        + filtrosAsignatura(data) + '<div id="avCuerpo"></div>'
        + '<p class="vcu-nota-pie">El camino de aprendizaje de Matemáticas sí aparece aquí cuando los '
        + 'alumnos juegan sus lecciones. El Reto de Cálculo no se mide: genera operaciones al momento, '
        + 'sin un objetivo del currículum asociado.</p></div></div>'
        + '<div class="sec"><div class="sec-cuerpo"><div id="rankingBloque"></div></div></div>'
        + (c.gestiono ? '<div class="sec vcu-peligro"><div class="sec-cab"><h2>Reiniciar mediciones</h2></div>'
          + '<div class="sec-cuerpo"><p class="vcu-nota">Los porcentajes vuelven a cero y se empieza a medir '
          + 'de nuevo. Sirve al comenzar una unidad o un semestre. No se borra ningún alumno ni su XP.</p>'
          + '<button type="button" class="b b-peligro" id="vcuReiniciar">' + ICO('reiniciar') + 'Reiniciar mediciones</button>'
          + '</div></div>' : '');

      cargarTendencia(cod);
      cargarParticipacion(cod);

      let filtro = '', agrupar = '';
      const pintarCuerpo = () => {
        const cuerpo = $('avCuerpo'); if(!cuerpo) return;
        const filas = filtro ? data.filter(f => String(f.oa).slice(0,4) === filtro) : data;
        const multi = new Set(filas.map(f => String(f.oa).slice(0,4))).size > 1;
        const modo = (agrupar === 'asig' && !multi) ? '' : agrupar;
        cuerpo.innerHTML = filas.length ? cuerpoConHistorial(filas, modo, multi, true) : SIN_DATOS_ASIG;
        conectarFilasOA(cod);
      };
      conectarFiltros(a => { filtro = a; pintarCuerpo(); });
      conectarAgrupar(v => { agrupar = v; pintarCuerpo(); });
      pintarCuerpo();
      // El plan decide qué unidades están en clases y cuáles al historial: llega después
      // de la primera pintada, así que se repinta (como la vieja verAvance tras cargarPlan).
      const nodo = $('avCuerpo');
      traerPlan(cod).catch(() => {}).then(() => { if(vivo(nodo)) pintarCuerpo(); });
      cargarRankingAsignatura(cod, data);

      const bR = $('vcuReiniciar');
      if(bR) bR.onclick = async () => {
        const ok = await confirmar({titulo:'¿Reiniciar las mediciones de este curso?',
          texto:'Los porcentajes vuelven a cero y se empieza a medir de nuevo. Sirve al comenzar una '
            + 'unidad o un semestre. No se borra ningún alumno ni su XP, pero las mediciones '
            + 'anteriores no se pueden recuperar.', peligro:true, si:'Reiniciar mediciones'});
        if(!ok) return;
        try{
          const {error} = await SB.rpc('kimun_prof_dominio_reiniciar', {p_curso_codigo:cod});
          if(error) throw error;
          await renderRuta();
          toast('Mediciones reiniciadas', 'ok');
        }catch(e){ toast(errorPanel(e), 'error'); }
      };
    },

    /* ===== Alumnos ===== */
    async alumnos(panel, cod, c){
      cargando(true);
      const {data, error} = await SB.rpc('kimun_prof_listar');
      cargando('fin');
      if(error) throw error;
      if(!vivo(panel)) return;
      const alus = (data || []).filter(f => f.curso_codigo === cod && f.pid);
      alus.forEach(a => { ALUMNO_NOM[a.pid] = a.alumno; });
      const gest = !!c.gestiono;
      const filas = alus.map(a => {
        const ficha = '#/curso/' + enc(cod) + '/alumno/' + enc(a.pid);
        return '<tr data-nom="' + esc(String(a.alumno || '').toLowerCase()) + '">'
          + '<td><a class="vcu-alu-nom" href="' + esc(ficha) + '">' + esc(a.avatar || '') + ' ' + esc(a.alumno) + '</a>'
          + '<div class="vcu-alu-sub">' + (a.codigo_acceso ? '<code>' + esc(a.codigo_acceso) + '</code>' : '')
          + '<span class="vcu-xp-m">' + esc(a.xp) + ' XP</span>'
          + (a.autoinscrito ? '<span class="ins ins-ambar" title="Se inscribió por el enlace: este nombre lo escribió el alumno, no tú">se inscribió solo</span>' : '')
          + '</div></td>'
          + '<td class="num vcu-col-xp">' + esc(a.xp) + '</td>'
          + '<td><div class="vcu-acc">'
          + '<a class="b b-sec b-ico" href="' + esc(ficha) + '" aria-label="Ver avance de ' + esc(a.alumno) + '" title="Ver avance">' + ICO('grafico') + '</a>'
          + (gest && a.codigo_acceso ? '<button type="button" class="b b-sec b-ico vcu-xp" data-cod="' + esc(a.codigo_acceso)
              + '" data-xp="' + esc(a.xp) + '" data-nom="' + esc(a.alumno) + '" aria-label="Fijar XP de ' + esc(a.alumno) + '" title="Fijar XP">' + ICO('editar') + '</button>'
            + '<button type="button" class="b b-peligro b-ico vcu-del" data-cod="' + esc(a.codigo_acceso)
              + '" data-nom="' + esc(a.alumno) + '" aria-label="Eliminar a ' + esc(a.alumno) + '" title="Eliminar alumno">' + ICO('borrar') + '</button>' : '')
          + '</div></td></tr>';
      }).join('');
      panel.innerHTML = '<div class="sec"><div class="sec-cab"><h2>Alumnos</h2><span class="sec-sub">'
        + alus.length + ' inscrito' + (alus.length === 1 ? '' : 's') + ' · en orden alfabético del servidor</span></div>'
        + (alus.length
          ? (alus.length > 8 ? '<div class="vcu-buscar"><label class="campo" for="vcuBuscar" style="margin:0">Buscar</label>'
              + '<input id="vcuBuscar" type="search" placeholder="Nombre del alumno" autocomplete="off"></div>' : '')
            + '<div class="sec-cuerpo sin-pad" style="overflow-x:auto"><table class="tabla"><thead><tr>'
            + '<th>Alumno</th><th class="num vcu-col-xp">XP</th><th class="num">Acciones</th></tr></thead>'
            + '<tbody id="vcuAluBody">' + filas + '</tbody></table>'
            + '<div class="vacio" id="vcuAluVacio" hidden>' + ICO('buscar') + '<p>Ningún alumno calza con la búsqueda.</p></div></div>'
          : vacio('usuario', 'Sin alumnos todavía.'))
        + '</div>'
        + (gest ? '<div class="sec"><div class="sec-cab"><h2>Agregar alumnos</h2>'
            + '<span class="sec-sub">Cada uno recibe su código ALU- para entrar al juego</span></div><div class="sec-cuerpo">'
            + '<div class="vcu-form"><div class="vcu-campo"><label class="campo" for="vcuNuevo">Nombre del alumno nuevo</label>'
            + '<input id="vcuNuevo" placeholder="Ej.: Ana Pérez" autocomplete="off"></div>'
            + '<button type="button" class="b b-pri" id="vcuAgregar">' + ICO('usuarioMas') + 'Agregar alumno</button></div>'
            + '<details class="vcu-masivo"><summary>Cargar varios de una vez</summary>'
            + '<p class="vcu-nota" style="margin:8px 0 0">Pega un nombre por línea (como los copias de una lista).</p>'
            + '<label class="campo" for="vcuMasivo">Nombres, uno por línea</label>'
            + '<textarea id="vcuMasivo" rows="6" placeholder="Ana Pérez&#10;Benjamín Soto&#10;Catalina Rivas"></textarea>'
            + '<div><button type="button" class="b b-sec" id="vcuAgregarTodos">' + ICO('mas') + 'Agregar todos</button></div>'
            + '</details></div></div>' : '');

      const buscar = $('vcuBuscar');
      if(buscar) buscar.oninput = () => {
        const q = buscar.value.trim().toLowerCase();
        let vis = 0;
        panel.querySelectorAll('#vcuAluBody tr').forEach(tr => {
          const ok = !q || tr.dataset.nom.includes(q); tr.hidden = !ok; if(ok) vis++;
        });
        $('vcuAluVacio').hidden = vis > 0;
      };
      panel.querySelectorAll('.vcu-xp').forEach(b => b.onclick = async () => {
        const v = await pedirTexto({titulo:'Fijar XP', etiqueta:'XP de ' + b.dataset.nom,
          texto:'Es la única forma de bajar un XP inflado: la sincronización del juego solo lo sube.',
          valor:b.dataset.xp, tipo:'number'});
        if(v === null) return;
        if(!/^\d+$/.test(String(v).trim())){ toast('Escribe un número entero de 0 o más.', 'error'); return; }
        const xp = parseInt(v, 10);
        await accion(() => SB.rpc('kimun_prof_xp_fijar', {p_codigo_acceso:b.dataset.cod, p_xp:xp}), 'XP actualizado a ' + xp);
      });
      panel.querySelectorAll('.vcu-del').forEach(b => b.onclick = async () => {
        const ok = await confirmar({titulo:'¿Eliminar a ' + b.dataset.nom + '?',
          texto:'Pierde su lugar en el ranking y sus duelos. No se puede deshacer.', peligro:true, si:'Eliminar alumno'});
        if(!ok) return;
        await accion(() => SB.rpc('kimun_prof_alumno_quitar', {p_codigo_acceso:b.dataset.cod}), 'Alumno eliminado');
      });
      const bA = $('vcuAgregar');
      if(bA){
        const agregar = async () => {
          const nom = ($('vcuNuevo').value || '').trim();
          if(!nom){ toast('Escribe un nombre.', 'error'); return; }
          await accion(() => SB.rpc('kimun_prof_alumno_agregar', {p_curso_codigo:cod, p_nombre:nom, p_avatar:'🦊'}), 'Alumno agregado');
        };
        bA.onclick = agregar;
        $('vcuNuevo').addEventListener('keydown', e => { if(e.key === 'Enter'){ e.preventDefault(); agregar(); } });
      }
      const bT = $('vcuAgregarTodos');
      if(bT) bT.onclick = async () => {
        const nombres = ($('vcuMasivo').value || '').split('\n').map(s => s.trim()).filter(Boolean);
        if(!nombres.length){ toast('Pega al menos un nombre (uno por línea).', 'error'); return; }
        bT.disabled = true;
        let ok = 0; const fallos = [];
        for(let i = 0; i < nombres.length; i++){
          bT.textContent = 'Agregando… ' + (i + 1) + '/' + nombres.length;
          try{
            const {error} = await SB.rpc('kimun_prof_alumno_agregar', {p_curso_codigo:cod, p_nombre:nombres[i], p_avatar:'🦊'});
            if(error) throw error; ok++;
          }catch(e){ fallos.push(nombres[i]); }
        }
        await renderRuta();
        toast(ok + ' alumno' + (ok === 1 ? '' : 's') + ' agregado' + (ok === 1 ? '' : 's')
          + (fallos.length ? ' · ' + fallos.length + ' con error: ' + fallos.slice(0, 4).join(', ') + (fallos.length > 4 ? '…' : '') : ''),
          fallos.length ? 'error' : 'ok');
      };
    },

    /* ===== Equipo del curso ===== */
    async equipo(panel, cod, c){
      panel.innerHTML = '<div class="sec"><div class="sec-cab"><h2>Equipo del curso</h2>'
        + '<span class="sec-sub">Profesor jefe y profesores de asignatura</span></div>'
        + '<div class="sec-cuerpo"><div class="equipo-cuerpo" data-cod="' + esc(cod) + '"></div></div></div>';
      await cargarEquipo(cod, c.nivel || '');
    },

    /* ===== Planificación del año ===== */
    async planificacion(panel, cod){
      panel.innerHTML = '<div class="sec vcu-blq">' + bloquePlanHTML() + '</div>';
      const det = $('planBloque'); if(det) det.open = true;
      cargando(true);
      try{ await cargarPlan(cod); } finally { cargando('fin'); }
    },

    /* ===== Refuerzo ===== */
    async refuerzo(panel, cod){
      cargando(true);
      const {data, error} = await SB.rpc('kimun_prof_dominio', {p_curso_codigo:cod});
      if(error){ cargando('fin'); throw error; }
      if(!vivo(panel)){ cargando('fin'); return; }
      const filas = data || [];
      panel.innerHTML = '<div class="sec"><div class="sec-cuerpo"><div id="refuerzoBloque"></div></div></div>';
      try{ await cargarRefuerzo(cod, filas); } finally { cargando('fin'); }
    },

    /* ===== Formación Ciudadana (evidencia del curso, Ley 20.911) =====
       Misma lógica que la vieja verCivicaCurso: temario de oa-civica.json, dominio de
       primer intento, fecha de realización desde la planificación de Historia y las
       observaciones guardadas por curso. */
    async civica(panel, cod, c){
      const nivel = c.nivel || '';
      cargando(true);
      await cargarCivica();
      const civicos = CIVICA_OA[nivel] || [];
      if(!civicos.length){
        cargando('fin');
        panel.innerHTML = '<div class="sec">' + vacio('civica', 'No se pudo leer el temario cívico de este nivel.') + '</div>';
        return;
      }
      const {data, error} = await SB.rpc('kimun_prof_dominio', {p_curso_codigo:cod});
      if(error){ cargando('fin'); throw error; }
      await cargarTextosOA(civicos);
      let fecha = null;
      try{ const {data:pd} = await SB.rpc('kimun_prof_plan', {p_curso_codigo:cod}); fecha = fechaCivicaDe(nivel, planMapa(pd || [])); }catch(e){}
      let obsTxt = '';
      try{ const {data:od} = await SB.rpc('kimun_prof_civica_obs_ver', {p_curso_codigo:cod}); if(typeof od === 'string') obsTxt = od; }catch(e){}
      cargando('fin');
      if(!vivo(panel)) return;
      const porOa = {}; (data || []).forEach(f => { porOa[f.oa] = f; });
      const conAct = civicos.filter(o => porOa[o] && Number(porOa[o].resp_1)).length;
      panel.innerHTML = '<div class="sec vcu-civ">'
        + '<div class="solo-print pul-hoja" style="padding:0 0 8px">'
        + '<b>VULPO · Formación Ciudadana — ' + esc(c.nombre) + '</b>'
        + '<div>Evidencia del Plan de Formación Ciudadana — Ley 20.911</div>'
        + '<div>Impreso el ' + esc(fechaLarga(new Date())) + ' · ' + esc(YO.nombre || YO.correo) + '</div></div>'
        + '<div class="sec-cab no-print"><h2>Evidencia de Formación Ciudadana</h2>'
        + '<span class="sec-sub">Ley 20.911</span>'
        + '<button type="button" class="b b-sec no-print" id="vcuCivImp">' + ICO('imprimir') + 'Imprimir</button></div>'
        + '<div class="sec-cuerpo">'
        + '<div class="civ-fecha"><b>Realización:</b> ' + (fecha ? esc(rangoFechasCorto(fecha.inicio, fecha.termino))
            : '<span class="civ-sd">sin planificar — se fija en la planificación de Historia</span>') + '</div>'
        + '<p class="pul-nota" style="margin:0 0 12px">' + CIVICA_NOTA_CURSO + '</p>'
        + '<div class="civ-lista"><div class="civ-resumen"><b>' + conAct + ' de ' + civicos.length
        + '</b> objetivos cívicos con actividad</div>'
        + civicos.map(o => filaCivica(o, porOa[o])).join('') + '</div>'
        + '<div class="civ-obs-wrap"><label class="civ-obs-lbl no-print" for="civObsC" style="display:block">Observaciones (se guardan · van en el impreso)</label>'
        + '<div class="civ-obs-lbl solo-print">Observaciones</div>'
        + '<textarea class="civ-obs no-print" id="civObsC" placeholder="Observaciones de la evidencia cívica de este curso…">' + esc(obsTxt) + '</textarea>'
        + '<div class="civ-obs-box solo-print" id="civObsBox">' + esc(obsTxt) + '</div></div>'
        + '<div class="civ-firma solo-print"><div class="civ-firma-linea"></div>Nombre, cargo y firma · Fecha: ______________</div>'
        + '</div></div>';
      const ta = $('civObsC');
      if(ta) ta.onblur = () => {
        const box = $('civObsBox'); if(box) box.textContent = ta.value;
        SB.rpc('kimun_prof_civica_obs_fijar', {p_curso_codigo:cod, p_texto:ta.value}).catch(() => {});
      };
      $('vcuCivImp').onclick = () => {
        const box = $('civObsBox'); if(box && ta) box.textContent = ta.value;
        window.print();
      };
    },

    /* ===== Enlace de inscripción ===== */
    async inscripcion(panel, cod, c){
      panel.innerHTML = '<div class="sec"><div class="sec-cab"><h2>Enlace de inscripción</h2>'
        + '<span class="sec-sub">Un solo enlace vivo por curso: crear otro cierra el anterior</span></div>'
        + '<div class="sec-cuerpo"><div class="inscripcion-cuerpo" data-cod="' + esc(cod) + '"></div></div></div>';
      cargando(true);
      try{ await cargarInscripcion(cod, c.nivel || ''); } finally { cargando('fin'); }
    },

    /* ===== Ajustes del curso: colegio, nivel y eliminar ===== */
    async ajustes(panel, cod, c){
      let opciones = null;
      if(window.ESADMINCOLEGIO){
        cargando(true);
        opciones = [];
        try{
          const {data:sos, error} = await SB.rpc('kimun_prof_sostenedores');
          if(error) throw error;
          for(const s of (sos || [])){
            const {data:cols} = await SB.rpc('kimun_prof_colegios', {p_sostenedor:s.id});
            (cols || []).forEach(x => opciones.push({id:x.id, etq:s.nombre + ' · ' + x.nombre}));
          }
        }catch(e){ opciones = null; }
        cargando('fin');
        if(!vivo(panel)) return;
      }
      let html = '';
      if(window.ESADMINCOLEGIO){
        html += '<div class="sec"><div class="sec-cab"><h2>Colegio</h2>'
          + '<span class="sec-sub">A qué colegio pertenece este curso</span></div><div class="sec-cuerpo">'
          + (opciones
            ? '<div class="vcu-form"><div class="vcu-campo"><label class="campo" for="vcuColegio">Colegio</label>'
              + '<select id="vcuColegio"><option value="">Sin colegio</option>'
              + opciones.map(o => '<option value="' + esc(o.id) + '"' + (o.id === c.colegioId ? ' selected' : '') + '>' + esc(o.etq) + '</option>').join('')
              + '</select></div><button type="button" class="b b-pri" id="vcuColegioOk">Guardar</button></div>'
            : '<p class="vcu-nota">No se pudo cargar la lista de colegios.</p>')
          + '</div></div>';
      }
      if(c.gestiono && !c.nivel){
        html += '<div class="sec"><div class="sec-cab"><h2>Nivel del curso</h2></div><div class="sec-cuerpo">'
          + '<p class="vcu-nota">Este curso no tiene nivel, así que en el equipo se muestran las asignaturas de todos. '
          + 'Fíjaselo y quedan solo las suyas.</p>'
          + '<div class="vcu-form"><div class="vcu-campo"><label class="campo" for="vcuNivel">Nivel</label>'
          + '<select id="vcuNivel">' + NIVELES_MUESTRA.map(x => '<option value="' + esc(x.nivel) + '">' + esc(x.nombre) + '</option>').join('')
          + '</select></div><button type="button" class="b b-pri" id="vcuNivelOk">Fijar el nivel</button></div></div></div>';
      }
      if(window.ESADMINCOLEGIO){
        html += '<div class="sec vcu-peligro"><div class="sec-cab"><h2>Zona de peligro</h2></div><div class="sec-cuerpo">'
          + '<p class="vcu-nota">Eliminar el curso borra también todos sus alumnos y sus duelos. No se puede deshacer.</p>'
          + '<button type="button" class="b b-peligro" id="vcuBorrar">' + ICO('borrar') + 'Eliminar curso</button></div></div>';
      }
      panel.innerHTML = html || '<div class="sec">' + vacio('ajustes', 'No hay ajustes disponibles para este curso.') + '</div>';

      const bC = $('vcuColegioOk');
      if(bC) bC.onclick = async () => {
        const v = $('vcuColegio').value || null;
        try{
          const {error} = await SB.rpc('kimun_prof_curso_colegio_fijar', {p_curso_codigo:cod, p_colegio:v});
          if(error) throw error;
          await asegurarCursos(true);
          await renderRuta();
          toast(v ? 'Curso movido de colegio' : 'Curso sin colegio', 'ok');
        }catch(e){ toast(errorPanel(e), 'error'); }
      };
      const bN = $('vcuNivelOk');
      if(bN) bN.onclick = () => fijarNivel(cod, $('vcuNivel').value);
      const bB = $('vcuBorrar');
      if(bB) bB.onclick = async () => {
        const ok = await confirmar({titulo:'¿Eliminar el curso ' + c.nombre + '?',
          texto:'Se borran también todos sus alumnos y sus duelos. No se puede deshacer.', peligro:true, si:'Eliminar curso'});
        if(!ok) return;
        try{
          const {error} = await SB.rpc('kimun_prof_curso_quitar', {p_curso_codigo:cod});
          if(error) throw error;
          delete CURSO_INFO[cod];
          toast('Curso eliminado', 'ok');
          ir('#/cursos');
        }catch(e){ toast(errorPanel(e), 'error'); }
      };
    }
  };

  async function fijarNivel(cod, nivel){
    if(!nivel) return;
    try{
      const {error} = await SB.rpc('kimun_prof_curso_nivel', {p_curso_codigo:cod, p_nivel:nivel});
      if(error) throw error;
      await asegurarCursos(true);
      await renderRuta();
      toast('Nivel fijado', 'ok');
    }catch(e){ toast(errorPanel(e), 'error'); }
  }
})();
