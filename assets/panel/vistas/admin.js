/* Vista ADMINISTRACIÓN del panel de profesores (Sesión 154).
   Atiende #/admin (abre Profesores) y #/admin/:sec con cuatro pestañas:
     profesores · colegios · cursos · herramientas
   Migrada del bloque plegable #admBloque de pintarLista() y del árbol de agruparArbol() /
   conectarArbol() de profesor.html: mismos RPC con los mismos parámetros, mismas
   condiciones de visibilidad (ESADMINCOLEGIO lo exige ya la ruta; `accede('limpiar'|'armar'|
   'gestiona_permisos', legado)` para lo operativo) y los mismos textos de advertencia.
   Lo que cambia es la presentación, y que confirm()/prompt() pasan a confirmar()/pedirTexto().

   ⚠️ El 🔑 sigue abriendo el modal de siempre (abrirMantenedor, al final de profesor.html):
   aquí solo se re-estiliza al tema claro con CSS. Mover un curso de colegio NO vive aquí:
   está en la pestaña Ajustes de cada curso. */
(function(){
  window.VISTAS = window.VISTAS || {};

  if(!document.getElementById('css-vista-admin')){
    const st = document.createElement('style');
    st.id = 'css-vista-admin';
    st.textContent = `
.va-form{display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end}
.va-form .va-campo{flex:1 1 240px;max-width:360px;min-width:0}
.va-form .va-campo.va-corto{flex:0 1 200px}
.va-form input,.va-form select{margin:0;height:38px;padding:0 12px;background:var(--panel)}
.va-form .campo{margin:0 0 4px;font-weight:500;color:var(--cuerpo);font-size:13px}
.va-form .b{flex:0 0 auto}
.va-nota{font-size:13px;color:var(--dim);margin:10px 0 0;line-height:1.5}
.va-nota b{color:var(--cuerpo)}
.va-tabla td{vertical-align:middle}
.va-nom{display:block;font-weight:600;color:var(--texto);word-break:break-word}
.va-mail{display:block;font-size:12px;color:var(--dim);word-break:break-all}
.va-rango{font-size:13px;color:var(--cuerpo);white-space:nowrap}
.va-amb{display:flex;flex-wrap:wrap;gap:4px}
.va-amb .ins{white-space:normal;text-align:left}
.va-amb-txt{font-size:12px;color:var(--dim)}
.va-acc{text-align:right;white-space:nowrap;width:1%}
.va-acc .b + .b{margin-left:6px}
.va-acc .b-ico svg{width:16px;height:16px}
.va-del{color:var(--pink)}
.va-del:hover{color:var(--pink);background:var(--sutil)}
.va-oculto{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.va-sos-cab h2{display:flex;align-items:center;gap:8px}
.va-sos-cab h2 svg{width:18px;height:18px;color:var(--dim);flex:0 0 auto}
.va-sos-cab .b-ico svg{width:16px;height:16px}
.va-nuevo-col{border-top:1px solid var(--linea)}
.va-num{font-variant-numeric:tabular-nums;color:var(--cuerpo)}
.va-herr{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px}
.va-herr .sec{margin:0;display:flex;flex-direction:column}
.va-herr .sec-cuerpo{flex:1;display:flex;flex-direction:column;gap:12px}
.va-herr p{margin:0;font-size:13px;color:var(--cuerpo);line-height:1.5}
.va-herr .va-form{margin-top:auto}
.va-herr .va-pie{margin-top:auto}
@media screen and (max-width:700px){
  .va-tabla thead{display:none}
  .va-tabla,.va-tabla tbody,.va-tabla tr,.va-tabla td{display:block;width:100%}
  .va-tabla tr{border-bottom:1px solid var(--linea);padding:12px 14px}
  .va-tabla tr:last-child{border-bottom:0}
  .va-tabla td{border-bottom:0;padding:3px 0}
  .va-tabla td[data-rot]:not(:first-child)::before{content:attr(data-rot);display:block;
    font-size:11px;font-weight:600;color:var(--dim);text-transform:uppercase;letter-spacing:.04em;margin-top:6px}
  .va-acc{text-align:left;width:auto;padding-top:8px !important}
  .va-form .va-campo,.va-form .va-campo.va-corto{flex:1 1 100%;max-width:none}
  .va-sos-cab{flex-wrap:wrap}
  .va-sos-cab .sec-sub{order:3;flex-basis:100%;padding-left:26px;margin-top:-4px}
}
.va-tabs{scrollbar-width:none}
.va-tabs::-webkit-scrollbar{display:none}
@media screen and (max-width:420px){ .va-tabs .tab{padding:10px 9px;font-size:13px} }

/* ---- El modal de permisos (#mantOverlay, de profesor.html) al tema claro ----
   Sus variables ya son las claras de panel.css; lo que se ajusta es forma, peso y los
   botones viejos (.btn, .btn-chip, .ico) para que hablen como el resto del panel. */
#mantOverlay{z-index:105}
#mantOverlay .mant-modal{border:0;border-radius:14px;box-shadow:var(--sombra-alta);max-width:620px;
  margin:40px auto;padding:22px 24px 22px;color:var(--texto)}
#mantOverlay .mant-modal h2{font-size:17px;font-weight:700;color:var(--texto)}
#mantOverlay .mant-sub{font-size:13px;color:var(--dim);margin:4px 0 16px}
#mantOverlay .mant-cerrar{width:34px;height:34px;border-radius:8px;color:var(--dim);font-size:16px;margin:-4px -6px 0 0}
#mantOverlay .mant-cerrar:hover{background:var(--sutil);color:var(--texto)}
#mantOverlay hr{border-top-color:var(--linea);margin:18px 0}
#mantOverlay .mant-h3{font-size:14px;font-weight:600;color:var(--texto);margin:0 0 10px;text-transform:none;letter-spacing:0}
#mantOverlay .mant-grant{background:var(--fondo);border-color:var(--linea);border-radius:10px;padding:10px 12px;align-items:center}
#mantOverlay .mant-grant .g-ambito{color:var(--texto)}
#mantOverlay .mant-grant .g-caps{color:var(--dim);font-size:12px}
#mantOverlay .mant-grant .btn-chip{margin:0;background:var(--panel)}
#mantOverlay .mant-grant .ico{min-width:34px;height:34px;margin-left:2px;border-radius:8px}
#mantOverlay .mant-grant .ico:hover{background:var(--sutil)}
#mantOverlay .mant-ambito{gap:16px;padding:10px 12px;background:var(--fondo);border:1px solid var(--linea);border-radius:10px}
#mantOverlay .mant-radio{color:var(--cuerpo);font-weight:500;cursor:pointer}
#mantOverlay .mant-radio input,#mantOverlay .mant-cap input{accent-color:var(--violet);width:16px;height:16px;flex:0 0 auto;margin:1px 0 0}
#mantOverlay .mant-nodo select{background:var(--panel);border-color:var(--linea2);height:38px;padding:0 10px;margin:0}
#mantOverlay .mant-mats{border-color:var(--linea2);background:var(--panel)}
#mantOverlay .mant-mats-h,#mantOverlay .mant-lbl{color:var(--dim);font-size:12px}
#mantOverlay .mant-presets .btn-chip{margin:0;background:var(--panel);color:var(--texto);font-weight:500}
#mantOverlay .mant-presets .btn-chip:hover{border-color:var(--violet);color:var(--violet);background:var(--violet-t)}
#mantOverlay .mant-total{padding:10px 12px;border:1px solid var(--linea);border-radius:10px;background:var(--violet-t);color:var(--texto)}
#mantOverlay .mant-cat{border-color:var(--linea);border-radius:10px;padding:10px 12px;background:var(--panel)}
#mantOverlay .mant-cat h4{color:var(--texto);font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.04em}
#mantOverlay .mant-catall{color:var(--violet);font-weight:600;text-transform:none;letter-spacing:0;font-size:12px}
#mantOverlay .mant-catall:hover{text-decoration:underline}
#mantOverlay .mant-cap{color:var(--cuerpo);cursor:pointer}
#mantOverlay .mant-msg{font-weight:500}
#mantOverlay #mantGuardar{width:auto;max-width:none;height:38px;padding:0 20px;margin:0;border-radius:8px;
  background:var(--violet);color:var(--panel);font-weight:600}
#mantOverlay #mantGuardar:hover{filter:brightness(.88)}
@media (max-width:600px){ #mantOverlay .mant-modal{margin:12px auto;padding:18px 16px} }
`;
    document.head.appendChild(st);
  }

  const PESTANAS = [
    {id:'profesores',   txt:'Profesores',   ico:'usuario'},
    {id:'colegios',     txt:'Colegios',     ico:'colegio'},
    {id:'cursos',       txt:'Cursos',       ico:'cursos'},
    {id:'herramientas', txt:'Herramientas', ico:'herramienta'}
  ];
  /* Hoy las cuatro partes las ve TODA persona que administra el colegio (el bloque entero
     dependía de ESADMINCOLEGIO, que ya exige la ruta). Lo operativo de Herramientas
     (limpiar, armar) se decide dentro con `accede`, como antes. */
  const visibles = () => window.ESADMINCOLEGIO ? PESTANAS : [];

  // Mismo cálculo que pintarLista: el rango efectivo de quien administra.
  const miRango = () => (window.MI_ACCESO && window.MI_ACCESO.rango)
    || (YO.es_admin ? 'Administrador' : YO.es_operador ? 'Operador' : YO.es_super ? 'SuperUsuario' : 'Profesor');

  function marcarMenu(){
    /* El menú marca "Administración" solo con #/admin exacto; en #/admin/colegios queda sin
       marcar (el listener de 'ruta' corre antes que esta vista, así que esto prevalece). */
    const a = document.querySelector('#nav .nav-it[data-ruta="#/admin"]');
    if(a){ a.classList.add('on'); a.setAttribute('aria-current', 'page'); }
  }

  window.VISTAS.admin = {
    titulo: 'Administración',
    async render(p){
      const lista = $('lista');
      const tabs = visibles();
      if(!tabs.length){ ir('#/inicio', {reemplazar:true}); return; }
      let sec = (p && p.sec) || '';
      if(sec && !tabs.some(t => t.id === sec)){ ir('#/admin/' + tabs[0].id, {reemplazar:true}); return; }
      if(!sec) sec = tabs[0].id;
      const tab = tabs.find(t => t.id === sec);
      ponerTitulo('Administración', tab.txt);
      marcarMenu();
      lista.innerHTML = '<nav class="tabs va-tabs" aria-label="Secciones de administración">'
        + tabs.map(t => '<a class="tab' + (t.id === sec ? ' on' : '') + '" href="#/admin/' + t.id + '"'
          + (t.id === sec ? ' aria-current="page"' : '') + '>' + esc(t.txt) + '</a>').join('')
        + '</nav><div id="vaCuerpo"><div class="sec"><div class="sec-cuerpo">' + esqueleto(5) + '</div></div></div>';
      await SECCION[sec](document.getElementById('vaCuerpo'), location.hash);
    }
  };

  // ¿Sigue siendo esta la pantalla? (otra navegación pudo pisar la carga)
  const vigente = (caja, hash) => location.hash === hash && document.body.contains(caja);

  /* --------------------------------------------------------------------------- */
  const SECCION = {

    /* ---------------- Profesores ---------------- */
    async profesores(caja, hash){
      cargando(true);
      const {data:profes, error} = await SB.rpc('kimun_prof_profesores');
      cargando('fin');
      if(!vigente(caja, hash)) return;
      let html = '<div class="sec"><div class="sec-cab"><h2>Autorizar a un profesor</h2></div>'
        + '<div class="sec-cuerpo"><form class="va-form" id="vaAutorizar" novalidate>'
        + '<div class="va-campo"><label class="campo" for="vaCorreo">Correo del profesor nuevo</label>'
        + '<input id="vaCorreo" type="email" autocomplete="off" placeholder="nombre@colegio.cl"></div>'
        + '<button type="submit" class="b b-pri">' + ICO('usuarioMas') + 'Autorizar profesor</button></form>'
        + '<p class="va-nota">Con el correo autorizado, la persona puede crear su cuenta en este panel. '
        + 'Sus permisos se asignan después con <b>Permisos</b>.</p></div></div>';

      html += '<div class="sec"><div class="sec-cab"><h2>Profesores</h2>'
        + (error ? '' : '<span class="sec-sub">' + (profes||[]).length + ((profes||[]).length === 1 ? ' persona' : ' personas') + '</span>')
        + '</div>';
      if(error){
        html += vacio('alerta', 'No se pudo cargar la lista de profesores.');
      }else if(!(profes||[]).length){
        html += vacio('usuario', 'Todavía no hay profesores autorizados.');
      }else{
        html += '<div class="sec-cuerpo sin-pad"><table class="tabla va-tabla"><thead><tr>'
          + '<th scope="col">Persona</th><th scope="col">Rango</th><th scope="col">Ámbito</th>'
          + '<th scope="col"><span class="va-oculto">Acciones</span></th></tr></thead><tbody>'
          + profes.map(filaProfe).join('') + '</tbody></table></div>';
      }
      html += '</div>';
      caja.innerHTML = html;

      document.getElementById('vaAutorizar').onsubmit = async e => {
        e.preventDefault();
        const c = (document.getElementById('vaCorreo').value || '').trim();
        if(!c){ aviso('Escribe un correo.'); return; }
        await accion(() => SB.rpc('kimun_prof_autorizar', {p_correo:c}), 'Correo autorizado');
      };
      caja.querySelectorAll('.va-quitar').forEach(b => b.onclick = async () => {
        const reg = b.dataset.reg === '1';
        const ok = await confirmar(reg
          ? {titulo:'¿Revocar a este profesor?', peligro:true, si:'Revocar',
             texto:b.dataset.correo + '\n\nPierde el acceso y sale de la lista blanca; sus cursos NO se borran (quedan sin dueño hasta reasignarlos). No afecta el desempeño de los alumnos.'}
          : {titulo:'¿Cancelar la invitación de este correo?', peligro:true, si:'Cancelar invitación', no:'Volver',
             texto:b.dataset.correo + '\n\nYa no podrá registrarse.'});
        if(!ok) return;
        await accion(() => SB.rpc('kimun_prof_quitar', {p_correo:b.dataset.correo}),
                     reg ? 'Profesor revocado' : 'Invitación cancelada');
      });
      caja.querySelectorAll('.va-permisos').forEach(b => b.onclick = () => abrirMantenedor(b.dataset.correo));
    },

    /* ---------------- Colegios ---------------- */
    async colegios(caja, hash){
      cargando(true);
      let arbol = [], porColegio = {}, sinColegio = 0;
      try{
        const {data:sos, error} = await SB.rpc('kimun_prof_sostenedores');
        if(error) throw error;
        for(const s of (sos || [])){
          const {data:cols, error:e2} = await SB.rpc('kimun_prof_colegios', {p_sostenedor:s.id});
          if(e2) throw e2;
          arbol.push({id:s.id, nombre:s.nombre, colegios:cols || []});
        }
        /* Cuántos cursos tiene cada colegio: de kimun_prof_listar, que es lo que contaba el
           árbol de antes (una tarjeta de curso por fila distinta). */
        const {data:filas, error:e3} = await SB.rpc('kimun_prof_listar');
        if(e3) throw e3;
        const vistos = {};
        (filas || []).forEach(f => {
          if(vistos[f.curso_codigo]) return;
          vistos[f.curso_codigo] = 1;
          if(f.colegio_id) porColegio[f.colegio_id] = (porColegio[f.colegio_id] || 0) + 1;
          else sinColegio++;
        });
      }catch(e){
        cargando('fin');
        if(!vigente(caja, hash)) return;
        caja.innerHTML = '<div class="sec">' + vacio('alerta', errorPanel(e)) + '</div>';
        return;
      }
      cargando('fin');
      if(!vigente(caja, hash)) return;

      const plural = k => k + (k === 1 ? ' curso' : ' cursos');
      let html = '<div class="sec"><div class="sec-cab"><h2>Sostenedor nuevo</h2></div>'
        + '<div class="sec-cuerpo"><form class="va-form" id="vaSosForm" novalidate>'
        + '<div class="va-campo"><label class="campo" for="vaSosNombre">Nombre del sostenedor</label>'
        + '<input id="vaSosNombre" autocomplete="off" placeholder="Fundación Educacional…"></div>'
        + '<button type="submit" class="b b-sec">' + ICO('mas') + 'Crear sostenedor</button></form>'
        + '<p class="va-nota">Un sostenedor agrupa uno o más colegios. Borrar un colegio no borra sus cursos: '
        + 'quedan <b>sin colegio</b>. Para mover un curso de colegio, abre el curso y entra a <b>Ajustes</b>.</p>'
        + '</div></div>';

      if(!arbol.length){
        html += '<div class="sec">' + vacio('colegio', 'Todavía no hay sostenedores. Crea el primero arriba.') + '</div>';
      }
      arbol.forEach(s => {
        const nCur = s.colegios.reduce((t, c) => t + (porColegio[c.id] || 0), 0);
        html += '<div class="sec"><div class="sec-cab va-sos-cab"><h2>' + ICO('colegio') + esc(s.nombre)
          + '</h2><span class="sec-sub">' + s.colegios.length + (s.colegios.length === 1 ? ' colegio' : ' colegios')
          + ' · ' + plural(nCur) + '</span>'
          + '<button type="button" class="b b-txt b-ico va-sos-ren" data-sos="' + esc(s.id) + '" data-nom="' + esc(s.nombre)
          + '" aria-label="Renombrar sostenedor ' + esc(s.nombre) + '" title="Renombrar sostenedor">' + ICO('editar') + '</button>'
          + '<button type="button" class="b b-txt b-ico va-del va-sos-del" data-sos="' + esc(s.id)
          + '" aria-label="Borrar sostenedor ' + esc(s.nombre) + '" title="Borrar sostenedor">' + ICO('borrar') + '</button>'
          + '</div>';
        if(s.colegios.length){
          html += '<div class="sec-cuerpo sin-pad"><table class="tabla va-tabla"><thead><tr>'
            + '<th scope="col">Colegio</th><th scope="col">Cursos</th>'
            + '<th scope="col"><span class="va-oculto">Acciones</span></th></tr></thead><tbody>'
            + s.colegios.map(c => '<tr><td data-rot="Colegio"><span class="va-nom">' + esc(c.nombre) + '</span></td>'
              + '<td data-rot="Cursos"><span class="va-num">' + plural(porColegio[c.id] || 0) + '</span></td>'
              + '<td class="va-acc">'
              + '<button type="button" class="b b-txt b-ico va-col-ren" data-col="' + esc(c.id) + '" data-nom="' + esc(c.nombre)
              + '" aria-label="Renombrar colegio ' + esc(c.nombre) + '" title="Renombrar colegio">' + ICO('editar') + '</button>'
              + '<button type="button" class="b b-txt b-ico va-del va-col-del" data-col="' + esc(c.id)
              + '" aria-label="Borrar colegio ' + esc(c.nombre) + '" title="Borrar colegio">' + ICO('borrar') + '</button>'
              + '</td></tr>').join('')
            + '</tbody></table></div>';
        }else{
          html += '<div class="sec-cuerpo"><p class="va-nota" style="margin:0">Este sostenedor todavía no tiene colegios.</p></div>';
        }
        html += '<div class="sec-cuerpo va-nuevo-col"><form class="va-form va-col-form" data-sos="' + esc(s.id) + '" novalidate>'
          + '<div class="va-campo"><label class="campo" for="vaCol-' + esc(s.id) + '">Colegio nuevo en ' + esc(s.nombre) + '</label>'
          + '<input id="vaCol-' + esc(s.id) + '" class="va-col-nombre" autocomplete="off" placeholder="Nombre del colegio"></div>'
          + '<button type="submit" class="b b-sec">' + ICO('mas') + 'Crear colegio</button></form></div></div>';
      });

      if(sinColegio){
        html += '<div class="sec"><div class="sec-cuerpo"><p class="va-nota" style="margin:0"><b>' + plural(sinColegio)
          + ' sin colegio.</b> Asígnales uno desde <a href="#/cursos">Cursos</a> › el curso › Ajustes.</p></div></div>';
      }
      caja.innerHTML = html;

      document.getElementById('vaSosForm').onsubmit = async e => {
        e.preventDefault();
        const n = (document.getElementById('vaSosNombre').value || '').trim();
        if(!n){ aviso('Escribe un nombre.'); return; }
        await accion(() => SB.rpc('kimun_prof_sostenedor_crear', {p_nombre:n}), 'Sostenedor creado');
      };
      caja.querySelectorAll('.va-col-form').forEach(f => f.onsubmit = async e => {
        e.preventDefault();
        const n = (f.querySelector('.va-col-nombre').value || '').trim();
        if(!n){ aviso('Escribe un nombre.'); return; }
        await accion(() => SB.rpc('kimun_prof_colegio_crear', {p_sostenedor:f.dataset.sos, p_nombre:n}), 'Colegio creado');
      });
      caja.querySelectorAll('.va-sos-ren').forEach(b => b.onclick = async () => {
        const n = ((await pedirTexto({titulo:'Renombrar sostenedor', etiqueta:'Nuevo nombre del sostenedor', valor:b.dataset.nom})) || '').trim();
        if(!n) return;
        await accion(() => SB.rpc('kimun_prof_sostenedor_renombrar', {p_id:b.dataset.sos, p_nombre:n}), 'Sostenedor renombrado');
      });
      caja.querySelectorAll('.va-sos-del').forEach(b => b.onclick = async () => {
        if(!await confirmar({titulo:'¿Borrar este sostenedor?', peligro:true, si:'Borrar sostenedor',
          texto:'Se borran también sus colegios; sus cursos quedan SIN colegio (no se borran).'})) return;
        await accion(() => SB.rpc('kimun_prof_sostenedor_borrar', {p_id:b.dataset.sos}), 'Sostenedor borrado');
      });
      caja.querySelectorAll('.va-col-ren').forEach(b => b.onclick = async () => {
        const n = ((await pedirTexto({titulo:'Renombrar colegio', etiqueta:'Nuevo nombre del colegio', valor:b.dataset.nom})) || '').trim();
        if(!n) return;
        await accion(() => SB.rpc('kimun_prof_colegio_renombrar', {p_id:b.dataset.col, p_nombre:n}), 'Colegio renombrado');
      });
      caja.querySelectorAll('.va-col-del').forEach(b => b.onclick = async () => {
        if(!await confirmar({titulo:'¿Borrar este colegio?', peligro:true, si:'Borrar colegio',
          texto:'Sus cursos quedan SIN colegio (no se borran).'})) return;
        await accion(() => SB.rpc('kimun_prof_colegio_borrar', {p_id:b.dataset.col}), 'Colegio borrado');
      });
    },

    /* ---------------- Cursos ---------------- */
    async cursos(caja, hash){
      cargando(true);
      const cols = [];   // {id, etiqueta}: igual que COLS_FLAT de pintarLista
      try{
        const {data:sos, error} = await SB.rpc('kimun_prof_sostenedores');
        if(error) throw error;
        for(const s of (sos || [])){
          const {data:cs} = await SB.rpc('kimun_prof_colegios', {p_sostenedor:s.id});
          (cs || []).forEach(c => cols.push({id:c.id, etiqueta:s.nombre + ' · ' + c.nombre}));
        }
      }catch(e){ /* sin colegios a la vista: el selector simplemente no aparece, como antes */ }
      cargando('fin');
      if(!vigente(caja, hash)) return;

      /* Preselección como antes: si hay UN solo colegio, va elegido (quien administra un solo
         colegio crea ahí); con varios, "Sin colegio" hasta que se elija. */
      const pre = cols.length === 1 ? cols[0].id : '';
      caja.innerHTML = '<div class="sec"><div class="sec-cab"><h2>Crear un curso</h2></div>'
        + '<div class="sec-cuerpo"><form class="va-form" id="vaCursoForm" novalidate>'
        + '<div class="va-campo"><label class="campo" for="vaCursoNombre">Nombre del curso</label>'
        + '<input id="vaCursoNombre" autocomplete="off" placeholder="8° A"></div>'
        + '<div class="va-campo va-corto"><label class="campo" for="vaCursoNivel">Nivel</label>'
        + '<select id="vaCursoNivel">' + NIVELES_MUESTRA.map(n => '<option value="' + esc(n.nivel) + '">' + esc(n.nombre) + '</option>').join('') + '</select></div>'
        + (cols.length ? '<div class="va-campo"><label class="campo" for="vaCursoColegio">Colegio</label>'
          + '<select id="vaCursoColegio"><option value="">Sin colegio</option>'
          + cols.map(x => '<option value="' + esc(x.id) + '"' + (x.id === pre ? ' selected' : '') + '>' + esc(x.etiqueta) + '</option>').join('')
          + '</select></div>' : '')
        + '<button type="submit" class="b b-pri">' + ICO('mas') + 'Crear curso</button></form>'
        + '<p class="va-nota">El curso nace <b>sin Profesor Jefe</b>: nómbralo después en la pestaña <b>Equipo</b> del curso. '
        + 'El nivel decide qué asignaturas y objetivos tendrá.</p></div></div>'
        + '<div class="sec"><div class="sec-cuerpo"><p class="va-nota" style="margin:0">Los cursos existentes están en '
        + '<a href="#/cursos">Cursos</a>.</p></div></div>';

      document.getElementById('vaCursoForm').onsubmit = async e => {
        e.preventDefault();
        const n = (document.getElementById('vaCursoNombre').value || '').trim();
        if(!n){ aviso('Escribe un nombre.'); return; }
        const niv = (document.getElementById('vaCursoNivel') || {}).value || null;
        // El colegio va al servidor desde el 07/11/2026: un curso sin colegio solo lo ve la
        // plataforma, así que la UTP que lo creaba sin elegir lo perdía de vista.
        const col = (document.getElementById('vaCursoColegio') || {}).value || null;
        const args = {p_nombre:n, p_nivel:niv}; if(col) args.p_colegio = col;
        const btn = e.submitter || document.querySelector('#vaCursoForm button[type=submit]');
        if(btn) btn.disabled = true;
        cargando(true);
        try{
          const {data, error} = await SB.rpc('kimun_prof_curso_crear', args);
          if(error) throw error;
          const fila = Array.isArray(data) ? data[0] : data;
          const cod = fila && fila.codigo;
          // La lista en memoria todavía no conoce el curso nuevo: sin esto su ruta daría "no encontrado".
          try{ await asegurarCursos(true); }catch(_){}
          cargando('fin');
          toast('Curso creado', 'ok');
          ir(cod ? '#/curso/' + encodeURIComponent(cod) : '#/cursos');
        }catch(err){
          cargando('fin');
          aviso(errorPanel(err));
          if(btn) btn.disabled = false;
        }
      };
    },

    /* ---------------- Herramientas ---------------- */
    async herramientas(caja){
      const armar = accede('armar', YO.es_admin || YO.es_operador);
      const limpiar = accede('limpiar', YO.es_admin || YO.es_operador);
      let html = '<div class="va-herr">';
      if(armar){
        html += '<div class="sec"><div class="sec-cab"><h2>Enlace de muestra</h2></div><div class="sec-cuerpo">'
          + '<p>Arma un enlace con los capítulos que quieras mostrar, para un apoderado o un colegio. '
          + 'Se abre el armador del juego del nivel elegido.</p>'
          + '<form class="va-form" id="vaArmarForm" novalidate><div class="va-campo"><label class="campo" for="vaArmarNivel">Nivel</label>'
          + '<select id="vaArmarNivel">' + NIVELES_MUESTRA.map(n => '<option value="' + esc(n.ruta) + '">' + esc(n.nombre) + '</option>').join('') + '</select></div>'
          + '<button type="submit" class="b b-sec">' + ICO('enlace') + 'Abrir armador</button></form></div></div>';
      }
      html += '<div class="sec"><div class="sec-cab"><h2>Tablero de avance</h2></div><div class="sec-cuerpo">'
        + '<p>El tablero de cobertura y aprobación del banco de preguntas, por asignatura y objetivo. Pide su propia clave.</p>'
        + '<div class="va-pie"><button type="button" class="b b-sec" id="vaTablero">' + ICO('grafico') + 'Abrir tablero</button></div>'
        + '</div></div>';
      if(limpiar){
        html += '<div class="sec"><div class="sec-cab"><h2>Perfiles de prueba</h2></div><div class="sec-cuerpo">'
          + '<p>Borra los perfiles que se crean solos al abrir el juego y que nunca canjearon un código de alumno. '
          + 'No toca a los alumnos inscritos ni a los rivales de práctica. <b>No se puede deshacer.</b></p>'
          + '<div class="va-pie"><button type="button" class="b b-peligro" id="vaLimpiar">' + ICO('borrar') + 'Limpiar perfiles de prueba</button></div>'
          + '</div></div>';
      }
      caja.innerHTML = html + '</div>';

      const fa = document.getElementById('vaArmarForm');
      if(fa) fa.onsubmit = e => { e.preventDefault(); window.location.href = document.getElementById('vaArmarNivel').value + '?armar=1'; };
      document.getElementById('vaTablero').onclick = () => { window.location.href = 'dev/tablero.html'; };
      const bl = document.getElementById('vaLimpiar');
      if(bl) bl.onclick = () => limpiarPruebasNuevo(bl);
    }
  };

  /* Igual que limpiarPruebas() de profesor.html, en dos pasos (contar y borrar), con
     confirmar() en vez del confirm() del navegador. */
  async function limpiarPruebasNuevo(btn){
    btn.disabled = true;
    try{
      const {data:n, error} = await SB.rpc('kimun_prof_limpiar_pruebas', {p_ejecutar:false});
      if(error) throw error;
      if(!n){ aviso('No hay perfiles de prueba', 'var(--green)'); return; }
      const ok = await confirmar({titulo:'¿Borrar ' + n + ' perfil' + (n === 1 ? '' : 'es') + ' de prueba?', peligro:true,
        si:'Borrar perfiles',
        texto:'Se van a borrar ' + n + ' perfil' + (n === 1 ? '' : 'es') + ' de prueba.\n\n'
          + 'Son los que se crean solos cuando alguien abre el juego y nunca escribió un código de alumno.\n\n'
          + 'También se pierden sus duelos. No se borran los alumnos inscritos ni los rivales de práctica.'});
      if(!ok) return;
      const {data:b, error:e2} = await SB.rpc('kimun_prof_limpiar_pruebas', {p_ejecutar:true});
      if(e2) throw e2;
      await refrescarVista();
      aviso('Se borraron ' + b + ' perfil' + (b === 1 ? '' : 'es') + ' de prueba', 'var(--green)');
    }catch(e){ aviso(traducir(e)); }
    finally{ if(document.body.contains(btn)) btn.disabled = false; }
  }

  /* Una fila de la tabla de profesores: misma lógica que la lista de pintarLista (rango con la
     regla "Profesor Jefe", chips de ámbito, matriz de revocar y condición del 🔑). */
  function filaProfe(p){
    // Si un Profesor es JEFE en algún curso, el cargo lo dice ("Profesor Jefe"). Solo el texto
    // de display: el p.rango real (que usa la matriz de revocar) NO se toca.
    const esJefeCurso = p.registrado && Array.isArray(p.ambito) && p.ambito.some(a => a.nivel === 'curso' && a.rol === 'jefe');
    const rango = !p.registrado ? null
      : ((p.rango || 'Profesor') === 'Profesor' && esJefeCurso ? 'Profesor Jefe' : (p.rango || 'Profesor'));
    const esYo = p.correo && (p.correo.toLowerCase() === (YO.correo || '').toLowerCase());
    const mr = miRango();
    // Matriz de revocar por RANGO efectivo: a un Admin/Operador solo lo revoca un Admin; a un
    // Super, un Admin u Operador; a un profe común, cualquiera que administre. El servidor manda.
    const puedeRevocar = !esYo && !p.es_admin && (
      p.rango === 'Operador'       ? mr === 'Administrador'
      : p.rango === 'SuperUsuario' ? (mr === 'Administrador' || mr === 'Operador')
      :                              true);
    const verPermisos = accede('gestiona_permisos', YO.es_admin || YO.es_operador) && p.registrado && !esYo && !p.es_admin;
    const nom = (p.nombre || '').trim();
    const persona = (nom ? '<span class="va-nom">' + esc(nom) + '</span><span class="va-mail">' + esc(p.correo) + '</span>'
                         : '<span class="va-nom">' + esc(p.correo) + '</span>')
      + (esYo ? '<span class="va-mail">Tú</span>' : '');
    const rangoHtml = rango
      ? '<span class="va-rango">' + esc(rango) + '</span>'
      : '<span class="ins ins-ambar">Invitación pendiente</span>';
    const acc = (verPermisos ? '<button type="button" class="b b-sec va-permisos" data-correo="' + esc(p.correo) + '">'
        + ICO('llave') + 'Permisos</button>' : '')
      + (puedeRevocar ? '<button type="button" class="b b-peligro b-ico va-quitar" data-correo="' + esc(p.correo)
        + '" data-reg="' + (p.registrado ? '1' : '') + '" aria-label="' + (p.registrado ? 'Revocar a ' : 'Cancelar la invitación de ')
        + esc(p.correo) + '" title="' + (p.registrado ? 'Revocar profesor' : 'Cancelar invitación') + '">' + ICO('borrar') + '</button>' : '');
    return '<tr><td data-rot="Persona">' + persona + '</td>'
      + '<td data-rot="Rango">' + rangoHtml + '</td>'
      + '<td data-rot="Ámbito"><div class="va-amb">' + ambito(p) + '</div></td>'
      + '<td class="va-acc">' + acc + '</td></tr>';
  }

  /* Ámbito de cada usuario (Sesión 120): el colegio de un Super, Jefe/Asignatura de un profe y
     sus materias, "toda la plataforma" de un Operador. Degrada al conteo de cursos si el esquema
     con la columna `ambito` aún no se aplicó. */
  function ambito(p){
    if(!Array.isArray(p.ambito))
      return '<span class="va-amb-txt">' + (Number(p.cursos) || 0) + ' curso' + (p.cursos === 1 ? '' : 's') + '</span>';
    if(p.es_admin) return '<span class="ins ins-violeta">Toda la plataforma</span>';
    if(!p.ambito.length) return '<span class="va-amb-txt">Sin ámbito asignado</span>';
    return p.ambito.map(a => {
      if(a.nivel === 'plataforma') return '<span class="ins ins-violeta">Toda la plataforma</span>';
      if(a.nivel === 'sostenedor') return '<span class="ins ins-violeta">Sostenedor: ' + esc(a.nombre) + '</span>';
      if(a.nivel === 'colegio')    return '<span class="ins ins-violeta">' + esc(a.nombre) + '</span>';
      if(a.nivel === 'curso'){
        // La materia va SIN el nivel (Opción B): el nombre del curso ya lo dice.
        const rol = a.rol === 'jefe' ? 'Jefe'
          : a.rol === 'asignatura' ? ((a.asignaturas && a.asignaturas.length)
              ? a.asignaturas.map(x => (ASIG_NOMBRE[x] || x).replace(/\s+\d+°$/, '')).join(', ') : 'Asignatura')
          : '';
        return '<span class="ins">' + esc(a.nombre) + (rol ? ' · ' + esc(rol) : '') + '</span>';
      }
      return '';
    }).join('');
  }
})();
