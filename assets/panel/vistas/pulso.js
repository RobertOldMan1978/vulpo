/* Vista EL PULSO DEL COLEGIO del panel de profesores (Sesión 154).
   La única pantalla que mira TODOS los cursos a la vez, para dirección y UTP. Migrada de
   verPulso() de profesor.html: mismos datos (kimun_prof_pulso), mismo denominador
   (totalOaNivel, que sale de los oa.json que lee cargarTextosOA) y mismos casos de borde.

   ⚠️ Muestra COBERTURA y PARTICIPACIÓN y NINGÚN porcentaje de acierto, ningún nombre de
   alumno, y sus columnas NO se pueden ordenar: un tablero que ordene cursos por rendimiento
   es un ranking de profesores con otro nombre. Tampoco lleva barras de progreso: una barra
   rellena es un ranking dibujado como geometría. La restricción vive además en la firma de
   kimun_prof_pulso, que no devuelve ni porcentajes ni nombres.
   ⚠️ Por eso aquí no se escribe ni un "%": ni siquiera la participación va en porcentaje. */
(function(){
  window.VISTAS = window.VISTAS || {};

  if(!document.getElementById('css-vista-pulso')){
    const st = document.createElement('style');
    st.id = 'css-vista-pulso';
    st.textContent = `
.vp-tabla td{vertical-align:top}
.vp-tabla th:nth-child(1){width:24%}
.vp-tabla th:nth-child(3){width:22%}
.vp-nom{display:block;font-weight:600;color:var(--texto)}
.vp-sub{display:block;font-size:12px;color:var(--dim);margin-top:2px}
.vp-sub code{font-size:11px}
.vp-falta{color:var(--gold);font-weight:500}
.vp-desglose{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px}
.vp-desglose .ins{font-weight:500;font-variant-numeric:tabular-nums}
.vp-acc{text-align:right;white-space:nowrap;width:1%}
.vp-nota{font-size:13px;color:var(--dim);line-height:1.55;margin:0;max-width:78ch}
.vp-nota b{color:var(--cuerpo)}
.vp-hoja{margin:0 0 12px}
.vp-kpi-de{font-size:15px;color:var(--dim);font-weight:500}
.vp-oculto{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.vp-pie{border-top:1px solid var(--linea)}
.vp-hoja b{font-size:16px;display:block;margin-bottom:2px}
.vp-hoja div{font-size:11pt;color:var(--cuerpo)}
@media screen and (max-width:600px){ .vp-kpis{grid-template-columns:repeat(3,minmax(0,1fr));gap:8px} .vp-kpis .kpi{padding:10px 12px} .vp-kpis .kpi-num{font-size:22px} .vp-kpis .kpi-sub{display:none} .vp-kpis .kpi-tit{font-size:12px;line-height:1.3} .vp-kpis .kpi-tit svg{display:none} .vp-kpi-de{font-size:13px} }
@media screen and (max-width:700px){
  .vp-tabla thead{display:none}
  .vp-tabla,.vp-tabla tbody,.vp-tabla tr,.vp-tabla td{display:block;width:100%}
  .vp-tabla tr{border-bottom:1px solid var(--linea);padding:12px 14px}
  .vp-tabla tr:last-child{border-bottom:0}
  .vp-tabla td{border-bottom:0;padding:3px 0}
  .vp-tabla td[data-rot]:not(:first-child)::before{content:attr(data-rot);display:block;
    font-size:11px;font-weight:600;color:var(--dim);text-transform:uppercase;letter-spacing:.04em;margin-top:6px}
  .vp-acc{text-align:left;width:auto;padding-top:8px !important}
}
@media print{
  /* panel.css carga después de profesor.html y su .b{display:inline-flex} (y .kpis{display:grid})
     le gana al .no-print{display:none} de allá: sin esto los botones salían en el papel. */
  #lista .no-print{display:none !important}
  .vp-sec{border:0;box-shadow:none;margin:0}
  .vp-sec .sec-cab{display:none}
  .vp-tabla{font-size:10pt}
  .vp-tabla th,.vp-tabla td{padding:6px 8px 6px 0}
  .vp-tabla thead{display:table-header-group}
  .vp-tabla tr{break-inside:avoid}
  .vp-desglose .ins{background:none;padding:0 6px 0 0}
  .vp-nota{font-size:9.5pt;margin-top:10px}
}`;
    document.head.appendChild(st);
  }

  const n = v => Number(v) || 0;

  function fila(f){
    const nivel = f.nivel ? NIVEL_NOMBRE(f.nivel) : '';
    const ident = '<span class="vp-nom">' + esc(f.curso) + '</span>'
      + '<span class="vp-sub">' + (nivel ? esc(nivel) + ' · ' : '') + '<code>' + esc(f.curso_codigo) + '</code></span>';

    let cob;
    if(!n(f.inscritos)){
      /* Sin alumnos no hay nada que medir, y un "0 de 99 · 99 sin empezar" se leería como
         reproche a un curso que todavía no existe de verdad. */
      cob = '<span class="vp-falta">—</span>';
    }else if(f.cobertura == null){
      // Sin nivel no hay denominador: se dice qué falta y dónde se arregla.
      cob = '<span class="vp-falta">Sin nivel asignado</span>'
        + '<span class="vp-sub">Fíjaselo en «Ajustes» del curso para ver su cobertura</span>';
    }else{
      const asigs = NIV.deNivel(f.nivel);
      const por = f.cobertura || {};
      const total = totalOaNivel(f.nivel);
      if(!total){
        // Un oa.json que no cargó: un denominador parcial haría ver al curso más adelantado.
        cob = '<span class="vp-falta">Cobertura no disponible</span>'
          + '<span class="vp-sub">No se pudo leer el temario de este nivel</span>';
      }else{
        // Acotado: un "94 de 93" desacreditaría la hoja entera.
        const hechos = Math.min(asigs.reduce((s, a) => s + n(por[a]), 0), total);
        cob = '<b>' + hechos + ' de ' + total + '</b> objetivos trabajados'
          + '<span class="vp-sub">' + (total - hechos) + ' sin empezar</span>'
          + '<div class="vp-desglose">' + asigs.map(a =>
              '<span class="ins">' + esc(NIV.ASIGS[a.slice(0,2)].nombre) + ' '
              + n(por[a]) + '/' + n(OA_TOTAL[a]) + '</span>').join('') + '</div>';
      }
    }

    const part = n(f.inscritos) > 0
      ? '<b>' + n(f.jugaron_semana) + ' de ' + n(f.inscritos) + '</b> jugaron esta semana'
      : '<span class="vp-falta">Sin alumnos inscritos</span>';

    return '<tr>'
      + '<td data-rot="Curso">' + ident + '</td>'
      + '<td data-rot="Cobertura del programa">' + cob + '</td>'
      + '<td data-rot="Participación">' + part + '</td>'
      + '<td class="vp-acc no-print"><a class="b b-sec" href="#/curso/' + esc(encodeURIComponent(f.curso_codigo))
      + '">Ver avance ' + ICO('derecha') + '</a></td></tr>';
  }

  window.VISTAS.pulso = {
    titulo: 'El pulso del colegio',
    async render(){
      const lista = $('lista');
      const hash = location.hash;
      ponerTitulo('El pulso del colegio');
      lista.innerHTML = '<div class="sec"><div class="sec-cuerpo">' + esqueleto(6) + '</div></div>';
      cargando(true);
      let filas;
      try{
        const {data, error} = await SB.rpc('kimun_prof_pulso');
        if(error) throw error;
        // Mismo orden que la lista de cursos, por la misma función.
        filas = (data || []).slice().sort((a, b) =>
          ordenCursos({nombre:a.curso, nivel:a.nivel}, {nombre:b.curso, nivel:b.nivel}));
        /* Los oa.json de las CUATRO asignaturas de cada nivel presente, no solo de las que
           ya tienen actividad: la que nadie ha jugado tiene que verse en cero. */
        await cargarTextosOA([...new Set(filas.filter(f => f.nivel).flatMap(f => NIV.deNivel(f.nivel)))]);
      }catch(e){
        cargando('fin');
        if(location.hash !== hash) return;
        lista.innerHTML = '<div class="sec">' + vacio('alerta', errorPanel(e)) + '</div>';
        return;
      }
      cargando('fin');
      if(location.hash !== hash) return;

      const nCursos = filas.length + (filas.length === 1 ? ' curso' : ' cursos');
      ponerTitulo('El pulso del colegio', nCursos);
      const hoy = new Date();
      let ins = 0, jug = 0;
      filas.forEach(f => { ins += n(f.inscritos); jug += n(f.jugaron_semana); });

      let html =
        /* Encabezado del PAPEL. El colegio no existe como entidad en el modelo y no se
           inventa: la hoja se titula con lo que el sistema sí sabe. */
        '<div class="solo-print vp-hoja"><b>El pulso del colegio</b>'
        + '<div>VULPO · ' + esc(nCursos) + ' · impreso el ' + esc(fechaLarga(hoy)) + '</div>'
        + '<div>' + esc(YO.nombre || YO.correo) + '</div>'
        + '<div>«Esta semana» son los 7 días anteriores a la impresión.</div></div>';

      if(filas.length){
        html += '<div class="kpis vp-kpis no-print">'
          + kpi('cursos', 'Cursos', filas.length, '')
          + kpi('usuario', 'Alumnos inscritos', ins, 'en todos los cursos')
          + kpi('reloj', 'Jugaron esta semana', jug + '<span class="vp-kpi-de"> de ' + ins + '</span>', 'los últimos 7 días')
          + '</div>';
      }

      html += '<div class="sec vp-sec"><div class="sec-cab"><h2>Cobertura y participación por curso</h2>'
        + '<button type="button" class="b b-sec no-print" id="vpImprimir">' + ICO('imprimir') + 'Imprimir</button></div>'
        + (filas.length
          ? '<div class="sec-cuerpo sin-pad"><table class="tabla vp-tabla"><thead><tr>'
            + '<th scope="col">Curso</th><th scope="col">Cobertura del programa</th>'
            + '<th scope="col">Participación</th><th class="no-print"><span class="vp-oculto">Acciones</span></th>'
            + '</tr></thead><tbody>' + filas.map(fila).join('') + '</tbody></table></div>'
          : vacio('cursos', 'Todavía no hay cursos creados.'))
        + '<div class="sec-cuerpo vp-pie"><p class="vp-nota">' + PULSO_NOTA + '</p></div>'
        + '</div>';

      lista.innerHTML = html;
      const bi = document.getElementById('vpImprimir');
      if(bi) bi.onclick = () => window.print();
    }
  };

  function kpi(icono, titulo, num, sub){
    return '<div class="kpi"><div class="kpi-tit">' + ICO(icono) + esc(titulo) + '</div>'
      + '<div class="kpi-num">' + num + '</div>'
      + (sub ? '<div class="kpi-sub">' + esc(sub) + '</div>' : '') + '</div>';
  }
})();
