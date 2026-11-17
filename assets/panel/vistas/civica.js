/* Vista FORMACIÓN CIUDADANA del colegio (Sesión 154): la evidencia del Plan de Formación
   Ciudadana (Ley 20.911) para la UTP. Migrada de verCivica() de profesor.html: mismos RPC
   (kimun_prof_civica con los 43 OA cívicos, kimun_prof_plan y kimun_prof_civica_obs_ver por
   curso), mismas fechas (fechaCivicaDe sobre la planificación) y mismos casos de borde.

   ⚠️ Hermana del pulso y con su misma regla: COBERTURA cívica y PARTICIPACIÓN, sin ningún
   porcentaje de acierto ni ningún nombre de alumno, y columnas que no se ordenan. Mide
   CONOCIMIENTO cívico, nunca conducta ni valores. La restricción vive en la firma de
   kimun_prof_civica, que no devuelve acierto ni nombres.
   Las observaciones se escriben en la vista cívica de cada curso; aquí solo se leen. */
(function(){
  window.VISTAS = window.VISTAS || {};

  if(!document.getElementById('css-vista-civica')){
    const st = document.createElement('style');
    st.id = 'css-vista-civica';
    st.textContent = `
.vcv-tabla td{vertical-align:top}
.vcv-tabla th:nth-child(1){width:28%}
.vcv-nom{display:block;font-weight:600;color:var(--texto)}
.vcv-sub{display:block;font-size:12px;color:var(--dim);margin-top:2px}
.vcv-sub code{font-size:11px}
.vcv-falta{color:var(--gold);font-weight:500}
.vcv-fechas{white-space:nowrap}
.vcv-acc{text-align:right;white-space:nowrap;width:1%;vertical-align:middle !important}
.vcv-nota{font-size:13px;color:var(--cuerpo);line-height:1.55;margin:0 0 18px;padding:12px 14px;
  border-left:3px solid var(--violet);background:var(--violet-t);border-radius:0 8px 8px 0;max-width:86ch}
.vcv-obs{margin:0;padding:0;list-style:none}
.vcv-obs li{padding:10px 0;border-bottom:1px solid var(--linea);font-size:14px;color:var(--cuerpo);white-space:pre-line}
.vcv-obs li:last-child{border-bottom:0}
.vcv-obs b{color:var(--texto)}
.vcv-obs-vacio{font-size:13px;color:var(--dim);margin:0}
.vcv-hoja{margin:0 0 12px}
.vcv-hoja b{font-size:16px;display:block;margin-bottom:2px}
.vcv-hoja div{font-size:11pt;color:var(--cuerpo)}
.vcv-firma{margin-top:48px;font-size:10pt;color:var(--cuerpo)}
.vcv-firma-linea{width:60%;border-top:1px solid var(--texto);margin-bottom:6px}
.vcv-oculto{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
@media screen and (max-width:700px){
  .vcv-tabla thead{display:none}
  .vcv-tabla,.vcv-tabla tbody,.vcv-tabla tr,.vcv-tabla td{display:block;width:100%}
  .vcv-tabla tr{border-bottom:1px solid var(--linea);padding:12px 14px}
  .vcv-tabla tr:last-child{border-bottom:0}
  .vcv-tabla td{border-bottom:0;padding:3px 0}
  .vcv-tabla td[data-rot]:not(:first-child)::before{content:attr(data-rot);display:block;
    font-size:11px;font-weight:600;color:var(--dim);text-transform:uppercase;letter-spacing:.04em;margin-top:6px}
  .vcv-fechas{white-space:normal}
  .vcv-acc{text-align:left;width:auto;padding-top:8px !important}
}
@media print{
  /* panel.css carga después de profesor.html y su .b{display:inline-flex} (y .kpis{display:grid})
     le gana al .no-print{display:none} de allá: sin esto los botones salían en el papel. */
  #lista .no-print{display:none !important}
  .vcv-sec{border:0;box-shadow:none;margin:0 0 14px}
  .vcv-sec .sec-cab{padding:0 0 6px;border:0}
  .vcv-sec .sec-cuerpo{padding:0}
  .vcv-tabla{font-size:10pt}
  .vcv-tabla th,.vcv-tabla td{padding:6px 8px 6px 0}
  .vcv-tabla thead{display:table-header-group}
  .vcv-tabla tr{break-inside:avoid}
  .vcv-nota{background:none;font-size:9.5pt;padding:0 0 0 10px}
  .vcv-obs li{break-inside:avoid;font-size:10pt}
}`;
    document.head.appendChild(st);
  }

  const n = v => Number(v) || 0;

  function fila(f, fecha){
    const nivel = f.nivel ? NIVEL_NOMBRE(f.nivel) : '';
    const ident = '<span class="vcv-nom">' + esc(f.curso) + '</span>'
      + '<span class="vcv-sub">' + (nivel ? esc(nivel) + ' · ' : '') + '<code>' + esc(f.curso_codigo) + '</code></span>';
    const fechaTxt = fecha ? esc(rangoFechasCorto(fecha.inicio, fecha.termino))
      : (f.nivel ? '<span class="vcv-falta">sin planificar</span>' : '—');
    let cob, part;
    if(!n(f.inscritos)){
      cob = '<span class="vcv-falta">—</span>';
      part = '<span class="vcv-falta">Sin alumnos inscritos</span>';
    }else if(f.nivel == null){
      cob = '<span class="vcv-falta">Sin nivel asignado</span>';
      part = '<span class="vcv-falta">—</span>';
    }else{
      const total = (CIVICA_OA[f.nivel] || []).length;
      cob = total ? '<b>' + Math.min(n(f.con_actividad), total) + ' de ' + total + '</b> objetivos'
                  : '<span class="vcv-falta">Cobertura no disponible</span>';
      const a = n(f.alumnos_civicos);
      part = '<b>' + a + '</b> alumno' + (a === 1 ? '' : 's');
    }
    return '<tr>'
      + '<td data-rot="Curso">' + ident + '</td>'
      + '<td data-rot="Fechas de realización" class="vcv-fechas">' + fechaTxt + '</td>'
      + '<td data-rot="Objetivos cívicos">' + cob + '</td>'
      + '<td data-rot="Alumnos con actividad cívica">' + part + '</td>'
      + '<td class="vcv-acc no-print"><a class="b b-txt" href="#/curso/' + esc(encodeURIComponent(f.curso_codigo))
      + '/civica">Ver curso ' + ICO('derecha') + '</a></td></tr>';
  }

  window.VISTAS.civica = {
    titulo: 'Formación Ciudadana',
    async render(){
      const lista = $('lista');
      const hash = location.hash;
      ponerTitulo('Formación Ciudadana', 'Evidencia · Ley 20.911');
      lista.innerHTML = '<div class="sec"><div class="sec-cuerpo">' + esqueleto(6) + '</div></div>';
      cargando(true);
      let filas;
      const fechas = {}, obs = {};
      try{
        await cargarCivica();
        const oas = civicaTodos();
        if(!oas.length) throw new Error('no se pudo leer el temario cívico');
        const {data, error} = await SB.rpc('kimun_prof_civica', {p_oas: oas});
        if(error) throw error;
        filas = (data || []).slice().sort((a, b) =>
          ordenCursos({nombre:a.curso, nivel:a.nivel}, {nombre:b.curso, nivel:b.nivel}));
        await cargarTextosOA(oas);   // OA_UNIDAD de todos los niveles, para mapear las fechas
        // Fecha cívica (del plan) y observaciones por curso. Su fallo no tumba el informe.
        await Promise.all(filas.map(async f => {
          if(f.nivel) try{
            const {data:pd} = await SB.rpc('kimun_prof_plan', {p_curso_codigo:f.curso_codigo});
            fechas[f.curso_codigo] = fechaCivicaDe(f.nivel, planMapa(pd || []));
          }catch(e){}
          try{
            const {data:od} = await SB.rpc('kimun_prof_civica_obs_ver', {p_curso_codigo:f.curso_codigo});
            if(typeof od === 'string' && od.trim()) obs[f.curso_codigo] = od;
          }catch(e){}
        }));
      }catch(e){
        cargando('fin');
        if(location.hash !== hash) return;
        lista.innerHTML = '<div class="sec">' + vacio('alerta', errorPanel(e)) + '</div>';
        return;
      }
      cargando('fin');
      if(location.hash !== hash) return;

      const hoy = new Date();
      const conObs = filas.filter(f => obs[f.curso_codigo]);
      let html =
        '<div class="solo-print vcv-hoja"><b>VULPO · Formación Ciudadana</b>'
        + '<div>Evidencia del Plan de Formación Ciudadana — Ley 20.911</div>'
        + '<div>Impreso el ' + esc(fechaLarga(hoy)) + ' · ' + esc(YO.nombre || YO.correo) + '</div></div>'
        + '<p class="vcv-nota">' + CIVICA_NOTA + '</p>'
        + '<div class="sec vcv-sec"><div class="sec-cab"><h2>Cobertura cívica por curso</h2>'
        + '<button type="button" class="b b-sec no-print" id="vcvImprimir">' + ICO('imprimir') + 'Imprimir para la UTP</button></div>'
        + (filas.length
          ? '<div class="sec-cuerpo sin-pad"><table class="tabla vcv-tabla"><thead><tr>'
            + '<th scope="col">Curso</th><th scope="col">Fechas de realización</th>'
            + '<th scope="col">Objetivos cívicos</th><th scope="col">Alumnos con actividad cívica</th>'
            + '<th class="no-print"><span class="vcv-oculto">Acciones</span></th></tr></thead><tbody>'
            + filas.map(f => fila(f, fechas[f.curso_codigo])).join('') + '</tbody></table></div>'
          : vacio('cursos', 'Todavía no hay cursos creados.'))
        + '</div>'
        + '<div class="sec vcv-sec' + (conObs.length ? '' : ' no-print') + '"><div class="sec-cab"><h2>Observaciones por curso</h2></div>'
        + '<div class="sec-cuerpo">' + (conObs.length
          ? '<ul class="vcv-obs">' + conObs.map(f =>
              '<li><b>' + esc(f.curso) + ':</b> ' + esc(obs[f.curso_codigo]) + '</li>').join('') + '</ul>'
          : '<p class="vcv-obs-vacio">Ningún curso tiene observaciones todavía. Se escriben en la vista de Formación Ciudadana de cada curso.</p>')
        + '</div></div>'
        + '<div class="vcv-firma solo-print"><div class="vcv-firma-linea"></div>Nombre, cargo y firma · Fecha: ______________</div>';

      lista.innerHTML = html;
      const bi = document.getElementById('vcvImprimir');
      if(bi) bi.onclick = () => window.print();
    }
  };
})();
