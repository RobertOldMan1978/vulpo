/* Vista INICIO del panel de profesores (Sesión 154).
   La primera pantalla al entrar: indicadores del día y lo que necesita atención, en vez de
   una lista de cursos plegados que había que abrir uno por uno para enterarse de algo.

   Datos: kimun_prof_resumen (una fila por curso, solo conteos) + asegurarCursos() (la lista
   de cursos del profesor). ⚠️ Ninguna línea nombra a un alumno: son conteos, igual que la
   franja de atención de antes, y la restricción vive en la firma de kimun_prof_resumen.
   Si esa función no está aplicada, la vista degrada a la tabla de cursos sin participación. */
(function(){
  window.VISTAS = window.VISTAS || {};
  const n = v => Number(v) || 0;
  const plural = (k, uno, varios) => k + ' ' + (k === 1 ? uno : varios);

  function kpi(icono, titulo, num, sub, alerta){
    return '<div class="kpi' + (alerta ? ' alerta' : '') + '"><div class="kpi-tit">' + ICO(icono)
      + esc(titulo) + '</div><div class="kpi-num">' + num + '</div>'
      + (sub ? '<div class="kpi-sub">' + sub + '</div>' : '') + '</div>';
  }

  window.VISTAS.inicio = {
    titulo: 'Inicio',
    async render(){
      ponerTitulo('Inicio');
      ponerMigas([]);
      const lista = $('lista');
      lista.innerHTML = '<div class="kpis">' + '<div class="kpi">' + esqueleto(2) + '</div>'.repeat(1)
        + '</div>' + '<div class="sec"><div class="sec-cuerpo">' + esqueleto(4) + '</div></div>';
      cargando(true);
      let filas = null;
      try{
        await asegurarCursos(true);
        try{
          const {data, error} = await SB.rpc('kimun_prof_resumen');
          if(error) throw error;
          filas = data || [];
        }catch(e){ filas = null; }   // degradación: sin resumen, solo la tabla de cursos
      }catch(e){
        cargando('fin');
        lista.innerHTML = vacio('alerta', errorPanel(e));
        return;
      }
      cargando('fin');
      if(document.getElementById('lista') !== lista) return;

      const cursos = Object.entries(CURSO_INFO).map(([cod, c]) => Object.assign({cod}, c))
        .sort((a, b) => ordenCursos(a, b));
      const porCod = {};
      (filas || []).forEach(f => { porCod[f.curso_codigo] = f; });

      if(!cursos.length){
        lista.innerHTML = '<div class="sec">' + vacio('cursos',
          window.ESADMINCOLEGIO
            ? 'Todavía no hay cursos. Créalos en Administración.'
            : 'Todavía no tienes cursos asignados. Pídele al equipo directivo que te agregue a uno.',
          window.ESADMINCOLEGIO ? '<a class="b b-pri" href="#/admin">' + ICO('mas') + 'Crear un curso</a>' : '')
          + '</div>' + bloqueProyectar();
        conectarProyectar();
        return;
      }

      // ---- Indicadores ----
      let ins = 0, hoy = 0, ant = 0, todasPrevia = true, bajos = 0, refu = 0, sinJefe = 0;
      cursos.forEach(c => {
        const f = porCod[c.cod]; if(!f) return;
        ins += n(f.inscritos); hoy += n(f.jugaron_semana);
        if(f.hay_previa) ant += n(f.jugaron_previa); else todasPrevia = false;
        bajos += n(f.oa_bajos); refu += n(f.refuerzos); if(f.sin_jefe) sinJefe++;
      });
      const pct = ins ? Math.round(100 * hoy / ins) : 0;
      const flecha = (filas && todasPrevia)
        ? (hoy > ant ? ' · ↑ ' + (hoy - ant) + ' más que la semana pasada'
          : hoy < ant ? ' · ↓ ' + (ant - hoy) + ' menos que la semana pasada' : ' · igual que la semana pasada')
        : '';
      let html = '<div class="kpis">'
        + kpi('cursos', window.ESADMINCOLEGIO ? 'Cursos' : 'Mis cursos', cursos.length,
              plural(ins, 'alumno inscrito', 'alumnos inscritos'))
        + (filas
          ? kpi('usuario', 'Jugaron esta semana', hoy + '<span style="font-size:15px;color:var(--dim);font-weight:500"> de ' + ins + '</span>',
                (ins ? pct + '% de los inscritos' : 'sin alumnos inscritos') + esc(flecha))
            + kpi('objetivo', 'Objetivos bajo 70%', bajos,
                'con datos suficientes, sumando tus cursos', bajos > 0)
            + kpi('refuerzo', 'Refuerzos abiertos', refu, refu ? 'desafíos que tus alumnos pueden jugar' : 'ninguno activo')
          : '')
        + (window.ESADMINCOLEGIO && sinJefe ? kpi('alerta', 'Sin profesor jefe', sinJefe, 'cursos por configurar', true) : '')
        + '</div>';

      // ---- Lo que necesita atención (sin nombres de alumnos) ----
      if(filas){
        const tareas = [];
        cursos.forEach(c => {
          const f = porCod[c.cod]; if(!f) return;
          const tot = n(f.inscritos), fuera = tot ? tot - n(f.jugaron_semana) : 0;
          const partes = [];
          if(fuera) partes.push(plural(fuera, 'alumno sin entrar esta semana', 'alumnos sin entrar esta semana'));
          if(n(f.oa_bajos)) partes.push(plural(n(f.oa_bajos), 'objetivo bajo 70%', 'objetivos bajo 70%'));
          if(n(f.refuerzos)) partes.push(plural(n(f.refuerzos), 'refuerzo abierto', 'refuerzos abiertos'));
          if(f.sin_jefe) partes.push('sin profesor jefe');
          if(partes.length) tareas.push({c, partes, sinJefe: !!f.sin_jefe, urg: tot ? fuera / tot : 0});
        });
        // Primero lo que falta CONFIGURAR; después por proporción de alumnos sin entrar.
        tareas.sort((a, b) => (b.sinJefe ? 1 : 0) - (a.sinJefe ? 1 : 0) || b.urg - a.urg);
        html += '<div class="sec"><div class="sec-cab"><h2>Necesita tu atención</h2>'
          + '<span class="sec-sub">Conteos por curso. Los nombres se ven al entrar al curso.</span></div>'
          + (tareas.length
            ? '<div class="tareas">' + tareas.map(t =>
                '<button type="button" class="tarea" data-ir="' + esc(t.sinJefe && window.ESADMINCOLEGIO
                  ? '#/admin' : '#/curso/' + encodeURIComponent(t.c.cod)) + '">'
                + '<span class="t-ico' + (t.sinJefe ? ' alerta' : '') + '">' + ICO(t.sinJefe ? 'alerta' : 'cursos') + '</span>'
                + '<span class="t-txt"><b>' + esc(t.c.nombre) + '</b><span>' + esc(t.partes.join(' · ')) + '</span></span>'
                + '<span class="t-ir">' + ICO('derecha') + '</span></button>').join('') + '</div>'
            : vacio('ok', 'Nada pendiente: todos entraron esta semana y no hay objetivos bajo 70% con datos suficientes.'))
          + '</div>';
      }

      // ---- Tabla de cursos ----
      html += '<div class="sec"><div class="sec-cab"><h2>' + (window.ESADMINCOLEGIO ? 'Cursos' : 'Mis cursos') + '</h2>'
        + '<a class="b b-txt" href="#/cursos">Ver todos ' + ICO('derecha') + '</a></div>'
        + '<div class="sec-cuerpo sin-pad" style="overflow-x:auto"><table class="tabla"><thead><tr>'
        + '<th>Curso</th><th>Nivel</th><th class="num">Alumnos</th>'
        + (filas ? '<th>Esta semana</th>' : '') + '<th></th></tr></thead><tbody>'
        + cursos.map(c => {
            const f = porCod[c.cod];
            let sem = '—';
            if(f && n(f.inscritos)){
              const p = Math.round(100 * n(f.jugaron_semana) / n(f.inscritos));
              sem = '<span class="ins ' + (p < 50 ? 'ins-ambar' : 'ins-verde') + '">'
                + n(f.jugaron_semana) + ' de ' + n(f.inscritos) + ' · ' + p + '%</span>';
            }
            return '<tr class="fila-link" data-ir="#/curso/' + esc(encodeURIComponent(c.cod)) + '">'
              + '<td><b>' + esc(c.nombre) + '</b><div style="font-size:12px;color:var(--dim)">' + esc(c.cod) + '</div></td>'
              + '<td>' + esc(NIVEL_NOMBRE(c.nivel) || '—') + '</td>'
              + '<td class="num">' + n(c.nAlumnos) + '</td>'
              + (filas ? '<td>' + sem + '</td>' : '')
              + '<td class="num"><a class="b b-sec" href="#/curso/' + esc(encodeURIComponent(c.cod)) + '">Ver avance</a></td></tr>';
          }).join('')
        + '</tbody></table></div></div>';

      html += bloqueProyectar();
      lista.innerHTML = html;
      lista.querySelectorAll('[data-ir]').forEach(el => el.addEventListener('click', ev => {
        if(ev.target.closest('a')) return;   // el enlace ya navega solo
        ir(el.dataset.ir);
      }));
      conectarProyectar();
    }
  };

  // "Proyectar en clase" también desde el inicio: es tarea de todo docente.
  function bloqueProyectar(){
    return '<div class="sec"><div class="sec-cab"><h2>Proyectar en clase</h2>'
      + '<span class="sec-sub">Abre el juego completo para mostrarlo al curso, sin guardar nada. El acceso dura 6 horas.</span></div>'
      + '<div class="sec-cuerpo" style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">'
      + '<label class="campo" for="inicioNivel" style="margin:0">Curso</label>'
      + '<select id="inicioNivel" style="width:auto;margin:0">'
      + NIVELES_MUESTRA.map(x => '<option value="' + esc(x.ruta) + '">' + esc(x.nombre) + '</option>').join('')
      + '</select><button class="b b-verde" type="button" id="inicioProyectar">' + ICO('jugar') + 'Abrir juego</button></div></div>';
  }
  function conectarProyectar(){
    const b = document.getElementById('inicioProyectar');
    if(b) b.onclick = () => abrirModoDocente(document.getElementById('inicioNivel').value, b);
  }
})();
