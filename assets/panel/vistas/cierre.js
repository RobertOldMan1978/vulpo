/* Vista INFORME DE CIERRE del panel de profesores (Sesión 154). Migrada de verCierre() de
   profesor.html. Dos rutas, una vista:
     #/curso/:cod/cierre             todas las unidades cerradas (el informe de fin de año)
     #/curso/:cod/cierre/:asig/:uni  una unidad ("Cómo quedó")
   Muestra cómo estaba el curso cuando la unidad terminó, reconstruido de la foto del
   domingo que la cierra (kimun_prof_dominio_foto), con la comparación "hoy" al lado
   (kimun_prof_dominio): es el argumento entero, porque un objetivo que cerró en 78% y hoy
   marca 61% no bajó, entraron alumnos que lo tocaron por primera vez después.

   ⚠️ Se abre también desde un enlace directo o una recarga, y entonces nada está cargado:
   ni la planificación (PLAN), ni las fotos que existen, ni las unidades del oa.json. Por eso
   la vista trae las tres cosas ella misma y reconstruye la unidad desde los parámetros de la
   ruta. Las fotos que existen se guardan AQUÍ (no en el SEMANAS global, que no sabe de qué
   curso es) y la foto de cierre se calcula con el mismo criterio de fotoDeCierre(): la
   PRIMERA tomada en la fecha de término o después. */
(function(){
  window.VISTAS = window.VISTAS || {};

  if(!document.getElementById('css-vista-cierre')){
    const st = document.createElement('style');
    st.id = 'css-vista-cierre';
    st.textContent = `
.vci-intro{font-size:13px;color:var(--cuerpo);line-height:1.55;margin:0 0 18px;padding:12px 14px;
  border-left:3px solid var(--violet);background:var(--violet-t);border-radius:0 8px 8px 0;max-width:86ch}
.vci-barra-acc{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 18px}
.vci-sec{break-inside:avoid}
.vci-sec .sec-cab{flex-wrap:wrap}
.vci-meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}
.vci-cab-txt{flex:1;min-width:0}
.vci-cab-txt h2{margin:0}
.vci-fila{display:flex;align-items:center;gap:18px;padding:11px 18px;border-bottom:1px solid var(--linea)}
.vci-fila:last-child{border-bottom:0}
.vci-texto{flex:1;min-width:0;font-size:14px;color:var(--cuerpo);line-height:1.45}
.vci-med{flex:0 0 400px;display:flex;align-items:center;gap:10px}
.vci-barra{flex:1;height:8px;background:var(--sutil);border-radius:4px;overflow:hidden;min-width:60px}
.vci-barra>div{height:100%}
.vci-pct{min-width:44px;text-align:right;font-variant-numeric:tabular-nums}
.vci-alu{font-size:12px;color:var(--dim);white-space:nowrap;min-width:72px;text-align:right}
.vci-hoy{font-size:12px;color:var(--dim);white-space:nowrap;border-left:1px solid var(--linea);padding-left:10px;min-width:62px}
.vci-sin{visibility:hidden}
.vci-vacio{font-size:13px;color:var(--dim);line-height:1.5;margin:0;max-width:72ch}
.vci-nota{font-size:13px;color:var(--dim);line-height:1.55;margin:0;max-width:86ch}
.vci-nota b{color:var(--cuerpo)}
.vci-hoja{margin:0 0 12px}
.vci-hoja b{font-size:16px;display:block;margin-bottom:2px}
.vci-hoja div{font-size:11pt;color:var(--cuerpo)}
@media (max-width:899px){
  .vci-fila{flex-direction:column;align-items:stretch;gap:6px;padding:10px 14px}
  .vci-med{flex:none;flex-wrap:wrap}
  .vci-barra{flex-basis:100%;order:3}
  .vci-pct{text-align:left;min-width:0}
  .vci-alu,.vci-hoy{min-width:0;text-align:left}
  .vci-sin{display:none}
}
@media print{
  /* panel.css carga después de profesor.html y su .b{display:inline-flex} (y .kpis{display:grid})
     le gana al .no-print{display:none} de allá: sin esto los botones salían en el papel. */
  #lista .no-print{display:none !important}
  .vci-intro{background:none;font-size:9.5pt;padding:0 0 0 10px}
  .vci-sec{border:1px solid var(--linea2);box-shadow:none;margin:0 0 12px}
  .vci-sec .sec-cab{padding:8px 10px}
  .vci-fila{padding:5px 10px;font-size:10pt;break-inside:avoid;flex-direction:row;align-items:center}
  .vci-texto{font-size:10pt}
  .vci-med{flex:0 0 auto;gap:8px;flex-wrap:nowrap}
  .vci-barra{display:none}
  .vci-meta .ins{background:none;padding:0 6px 0 0}
  .vci-nota{font-size:9.5pt}
}`;
    document.head.appendChild(st);
  }

  const color = p => p >= 70 ? 'var(--green)' : p >= 45 ? 'var(--ambar)' : 'var(--pink)';
  const pctDe = f => { const r = Number(f.resp_1) || 0; return r ? Math.round((Number(f.ok_1) || 0) * 100 / r) : null; };

  // La primera foto tomada en la fecha de término o después (mismo criterio que fotoDeCierre).
  function fotoDe(termino, semanas){
    if(!termino || !semanas.length) return null;
    const t = String(termino).slice(0,10);
    const f = semanas.find(s => String(s.semana).slice(0,10) >= t);
    return f ? String(f.semana).slice(0,10) : null;
  }

  function fila(f, hoy){
    const pct = pctDe(f);
    const alumnos = Number(f.alumnos_1) || 0;
    const pHoy = hoy ? pctDe(hoy) : null;
    const dif = (pct != null && pHoy != null && pHoy !== pct);
    const c = color(pct || 0);
    return '<div class="vci-fila"><div class="vci-texto">' + esc(OA_TEXTO[f.oa] || f.oa) + '</div>'
      + '<div class="vci-med"><div class="vci-barra" aria-hidden="true"><div style="width:' + (pct || 0) + '%;background:' + c + '"></div></div>'
      + '<b class="vci-pct" style="color:' + c + '">' + (pct == null ? '—' : pct + '%') + '</b>'
      + '<span class="vci-alu">' + alumnos + ' alumno' + (alumnos === 1 ? '' : 's') + '</span>'
      + (dif ? '<span class="vci-hoy" title="Así se ve hoy el mismo objetivo. La diferencia casi siempre son alumnos que lo tocaron por primera vez DESPUÉS del cierre: su primer intento entra al promedio de esta unidad aunque el curso ya esté en otra.">hoy ' + pHoy + '%</span>' : '<span class="vci-hoy vci-sin" aria-hidden="true"></span>')
      + '</div></div>';
  }

  function bloque(u, filas, mapaHoy){
    const mios = filas.filter(f => String(f.oa).slice(0,4) === u.asig && OA_UNIDAD[f.oa] && OA_UNIDAD[f.oa].id === u.uni);
    const hoyPorOa = {};
    (mapaHoy || []).forEach(f => { hoyPorOa[f.oa] = f; });
    const pcts = mios.map(pctDe).filter(p => p != null);
    const prom = pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : null;
    const bajos = pcts.filter(p => p < 70).length;
    return '<section class="sec vci-sec"><div class="sec-cab"><div class="vci-cab-txt">'
      + '<h2>' + esc(ASIG_NOMBRE[u.asig] || u.asig) + ' · ' + esc(u.uni) + ' ' + esc(u.titulo) + '</h2>'
      + '<div class="vci-meta">'
      + '<span class="ins">' + ICO('calendario') + 'Cerrada el ' + esc(fechaCortita(u.termino)) + '</span>'
      + '<span class="ins">Foto del domingo ' + esc(fechaCortita(u.foto)) + '</span>'
      + '<span class="ins">' + mios.length + ' objetivo' + (mios.length === 1 ? '' : 's') + '</span>'
      + (prom != null ? '<span class="ins ' + (prom >= 70 ? 'ins-verde' : prom >= 45 ? 'ins-ambar' : 'ins-rosa') + '">Promedio ' + prom + '%</span>' : '')
      + (bajos ? '<span class="ins ins-ambar">' + bajos + ' bajo 70%</span>' : '')
      + '</div></div></div>'
      + '<div class="sec-cuerpo sin-pad">' + (mios.length ? mios.map(f => fila(f, hoyPorOa[f.oa])).join('')
        : '<div class="sec-cuerpo"><p class="vci-vacio">Esta unidad no registra actividad en esa foto. Puede que el curso la haya trabajado fuera de VULPO, o que las fechas no correspondan.</p></div>')
      + '</div></section>';
  }

  function sinInforme(cod, texto){
    return '<div class="sec">' + vacio('calendario', texto,
      '<a class="b b-sec" href="#/curso/' + esc(encodeURIComponent(cod)) + '/planificacion">' + ICO('atras') + 'Ir a la planificación</a>') + '</div>';
  }

  window.VISTAS.cierre = {
    titulo: 'Informe de cierre',
    async render(p){
      const lista = $('lista');
      const hash = location.hash;
      const cod = p.cod, curso = p.curso || CURSO_INFO[p.cod] || {};
      const sola = !!(p.asig && p.uni);
      const tit = sola ? 'Cómo quedó la unidad' : 'Unidades cerradas del año';
      ponerTitulo(tit, curso.nombre || cod);
      lista.innerHTML = '<div class="sec"><div class="sec-cuerpo">' + esqueleto(6) + '</div></div>';
      cargando(true);

      const asigs = (curso.misAsig && curso.misAsig.length ? curso.misAsig
                    : NIV.deNivel(curso.nivel || '')).filter(a => ASIG_NOMBRE[a]);
      let semanas = [], unidades = [], fotos = {}, mapaHoy = [];
      try{
        // Las unidades del oa.json (UNIDADES/OA_UNIDAD), la planificación (PLAN) y las
        // fotos que existen: en un enlace directo, ninguna de las tres está cargada.
        const pedirAsigs = sola ? [...new Set(asigs.concat([p.asig]))] : asigs;
        const [, , sem] = await Promise.all([
          cargarTextosOA(pedirAsigs),
          traerPlan(cod),
          SB.rpc('kimun_prof_semanas', {p_curso_codigo:cod})
        ]);
        semanas = (sem && !sem.error) ? (sem.data || []) : [];

        if(sola){
          const def = (UNIDADES[p.asig] || []).find(x => x.id === p.uni);
          const plan = PLAN[claveUnidad(p.asig, p.uni)];
          const termino = plan && plan.termino;
          const foto = fotoDe(termino, semanas);
          if(!def || !termino || !foto){
            cargando('fin');
            if(location.hash !== hash) return;
            lista.innerHTML = sinInforme(cod, !def
              ? 'Esa unidad no existe en el temario de este curso.'
              : !termino
                ? 'Esta unidad todavía no tiene fecha de término en la planificación, así que no hay un cierre que mostrar.'
                : 'No hay una foto semanal que cubra el cierre de esta unidad: terminó después de la última foto o antes de que existiera el historial'
                  + (semanas.length ? ' (empieza el ' + fechaCortita(semanas[0].semana) + ')' : '') + '.');
            return;
          }
          unidades = [{asig:p.asig, uni:p.uni, titulo:def.titulo, termino:termino, foto:foto}];
        }else{
          asigs.forEach(asig => (UNIDADES[asig] || []).forEach(u => {
            const plan = PLAN[claveUnidad(asig, u.id)];
            if(!plan || !plan.termino) return;
            const foto = fotoDe(plan.termino, semanas);
            if(foto) unidades.push({asig, uni:u.id, titulo:u.titulo, termino:plan.termino, foto});
          }));
          if(!unidades.length){
            cargando('fin');
            if(location.hash !== hash) return;
            lista.innerHTML = sinInforme(cod, 'Todavía no hay unidades cerradas con una foto que las cubra. Una unidad aparece aquí cuando tiene fecha de término y existe una foto semanal desde esa fecha.');
            return;
          }
        }

        // Una consulta por FOTO distinta, no por unidad: varias unidades suelen cerrar el
        // mismo domingo (pedirFoto además las guarda en caché).
        const distintas = [...new Set(unidades.map(u => u.foto))];
        await Promise.all(distintas.map(async s => { fotos[s] = await pedirFoto(cod, s); }));
        // El mapa de hoy, para la comparación. Su fallo no impide ver el informe.
        try{
          const r = await SB.rpc('kimun_prof_dominio', {p_curso_codigo:cod});
          if(!r.error) mapaHoy = r.data || [];
        }catch(e){}
      }catch(e){
        cargando('fin');
        if(location.hash !== hash) return;
        lista.innerHTML = '<div class="sec">' + vacio('alerta', errorPanel(e)) + '</div>';
        return;
      }
      cargando('fin');
      if(location.hash !== hash) return;

      const hoy = new Date();
      const nombreCurso = curso.nombre || cod;
      lista.innerHTML =
        '<div class="solo-print vci-hoja"><b>' + esc(tit) + ' · ' + esc(nombreCurso) + '</b>'
        + '<div>VULPO · impreso el ' + esc(fechaLarga(hoy)) + '</div>'
        + '<div>' + esc(YO.nombre || YO.correo) + '</div></div>'
        + '<p class="vci-intro">Cada unidad se muestra <b>como estaba en la foto del domingo que la cierra</b>, '
        + 'no como está hoy. Donde el número de hoy es distinto, va al lado: casi siempre son alumnos que '
        + 'tocaron ese objetivo por primera vez después del cierre.</p>'
        + '<div class="vci-barra-acc no-print">'
        + '<button type="button" class="b b-sec" id="vciImprimir">' + ICO('imprimir') + 'Imprimir</button>'
        + '<a class="b b-txt" href="#/curso/' + esc(encodeURIComponent(cod)) + '/planificacion">' + ICO('atras') + 'Volver a la planificación</a>'
        + (sola ? '<a class="b b-txt" href="#/curso/' + esc(encodeURIComponent(cod)) + '/cierre">Ver todas las unidades cerradas</a>' : '')
        + '</div>'
        + unidades.map(u => bloque(u, fotos[u.foto] || [], mapaHoy)).join('')
        + '<div class="sec"><div class="sec-cuerpo"><p class="vci-nota">' + AVISO_NO_CALIFICA
        + '<br>Los números son los de la foto semanal del domingo indicado, no los de hoy: por eso el módulo '
        + 'puede seguir abierto sin que el informe cambie.'
        + (semanas.length ? ' El historial de este curso empieza el ' + esc(fechaCortita(semanas[0].semana)) + '.' : '')
        + '</p></div></div>';
      const bi = document.getElementById('vciImprimir');
      if(bi) bi.onclick = () => window.print();
    }
  };
})();
