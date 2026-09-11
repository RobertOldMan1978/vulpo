# -*- coding: utf-8 -*-
"""Genera _panel-demo.html: una copia de profesor.html con un DOBLE de Supabase, para
poder MIRAR el panel del profesor sin credenciales. No toca el archivo del repositorio.

    python scripts/panel-demo.py
    python -m http.server 8765      # y abrir http://localhost:8765/_panel-demo.html
    node scripts/cdp.mjs about:blank <pasos.mjs>

Existe porque `profesor.html` es la unica pantalla del proyecto que NO SE ABRE sin sesion,
y es la mas compleja que tiene. Sin esto no hay forma de verla, y en este panel los
defectos aparecen MIRANDO y no contando: la jerarquia invertida, los tres desplegables de
tres colores, el violeta sin contraste, la tarjeta estirada y el banner que empujaba el
boton de jugar fuera de pantalla se vieron todos en una captura, con el conteo diciendo
"sin desborde, cero errores".

⚠️ LOS NOMBRES DE COLUMNA SE COPIAN DE LAS FIRMAS REALES de supabase/schema.sql, nunca de
memoria. `kimun_prof_listar` devuelve `alumno` y `avatar`, no `nombre`; la primera version
uso `nombre` y el panel salio con la fila del alumno vacia -- parecia un defecto del
producto y era del doble. Cuando el resultado sorprende, el primer sospechoso es la prueba.

⚠️ Y el doble NO ES COHERENTE consigo mismo a proposito de un detalle que confunde: su
primer curso es de 3ro y sus datos de dominio son de 8vo, asi que el bloque de
planificacion (que mira las asignaturas del curso) y el mapa (que mira los OA de los datos)
pueden discrepar. Para verificar algo que cruce las dos cosas, abrir CUR-BA04, que es el
8vo y ahi todo calza.

⚠️ PostgREST NO lanza excepciones: devuelve {data, error}. Un `raise exception` del
servidor llega como `error`, asi que el doble hace lo mismo -- si no, el cliente se estaria
probando contra un camino que en produccion no existe.

Se versiona en el repo y no en un temporal porque es una herramienta de verificacion como
scripts/cdp.mjs: dejarla en el scratchpad obliga a reescribirla en cada sesion, y un doble
reescrito de memoria es justo el que inventa nombres de columna."""
import io, os, json

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = os.path.join(RAIZ, "profesor.html")
# Va al REPO y no al scratchpad: el panel pide assets/js/niveles.js con ruta relativa,
# asi que servido desde fuera del arbol se queda sin catalogo de niveles. Se borra al final.
OUT  = os.path.join(RAIZ, "_panel-demo.html")

STUB = r"""
<script>
/* Doble de Supabase: el panel no se abre sin sesion, y no hay credenciales aqui.
   Devuelve datos plausibles de un 8vo real para poder ver la pantalla. */
(function(){
  const alumnos = ['Antonia Reyes','Benjamin Soto','Camila Vera','Diego Munoz','Emilia Rojas',
    'Felipe Cortes','Gabriela Diaz','Hector Pino','Isidora Salas','Joaquin Bravo','Karla Neira',
    'Lucas Farias','Martina Godoy','Nicolas Arce','Olivia Tapia','Pablo Riquelme','Renata Poblete',
    'Simon Valenzuela','Tomas Herrera','Valentina Luna','Ximena Paredes','Ignacio Lorca'];
  /* Objetivos del curso simulado. Se eligen VARIOS DE LA MISMA UNIDAD a proposito: con uno
     por unidad el agrupado sale con diez grupos de una fila y no se puede juzgar si sirve.
     Los codigos son reales y sus unidades salen de los oa.json del repositorio:
       HI08 OA 01-04 -> U1 "Los inicios de la modernidad"
       HI08 OA 05-09 -> U2 "Formacion de la sociedad americana..."
       MA08 OA 01-05 -> U1 "Numeros"   ·   MA08 OA 11-14 -> U3 "Geometria"     */
  const oas = [
    ['HI08 OA 02','Explicar el humanismo y su vision del ser humano',41,21,18],
    ['HI08 OA 04','Analizar el impacto de la conquista de America en los pueblos originarios',38,21,14],
    ['HI08 OA 01','Describir el Renacimiento y sus expresiones artisticas',67,22,6],
    ['HI08 OA 05','Caracterizar el proceso de conquista de America',52,20,11],
    ['HI08 OA 07','Explicar el sistema de encomienda y sus consecuencias',63,22,7],
    ['HI08 OA 09','Analizar el mestizaje y la sociedad colonial',74,21,5],
    ['MA08 OA 05','Resolver problemas con potencias de base racional y exponente entero',44,19,26],
    ['MA08 OA 02','Operar con numeros racionales en distintas representaciones',58,20,15],
    ['MA08 OA 11','Aplicar el teorema de Pitagoras en situaciones reales',71,21,12],
    ['MA08 OA 13','Calcular el area de superficie de prismas y cilindros',80,20,8],
    ['CN08 OA 09','Explicar el funcionamiento de un circuito electrico simple',51,22,9],
    ['CN08 OA 02','Describir la estructura de la celula y sus organelos',78,22,4],
    ['LE08 OA 09','Argumentar por escrito sosteniendo una postura con evidencia',58,20,31],
    ['LE08 OA 03','Interpretar textos narrativos considerando el narrador',84,20,6],
    /* Dos objetivos de unidades que TODAVIA NO EMPIEZAN (U4 arranca el 28/09): pasa de
       verdad cuando un alumno juega adelantado, y sin ellos la seccion nunca se prueba. */
    ['MA08 OA 16','Representar datos en tablas y graficos, y evaluar su pertinencia',62,4,3],
    ['HI08 OA 21','Caracterizar la region en que se vive y sus principales actividades',55,3,2]
  ];
  /* Los cursos del colegio simulado. NOMBRES DESORDENADOS respecto al nivel a proposito:
     el servidor ordena solo por c.nombre, asi que "8A Prueba" cae antes que "Quinto B" y
     un curso sin nivel se cuela al medio. Es lo que el orden ascendente tiene que arreglar.
     Los dos ultimos son casos de borde: un curso SIN ALUMNOS y uno donde nadie ha jugado. */
  const CURSOS = [
    ['CUR-BA04','8A Prueba',    '08', true,  'jefe',       [],       22],
    ['CUR-3R09','3ro C',        '03', false, 'asignatura', ['HI03'], 14],
    ['CUR-5T77','Quinto B',     '05', true,  'jefe',       [],       18],
    ['CUR-TAL1','Taller tarde', '',   true,  null,         [],        6],
    ['CUR-6N01','Sexto A',      '06', true,  'jefe',       [],        0],
    ['CUR-4T22','Cuarto B',     '04', true,  'jefe',       [],       20]
  ];
  // Cobertura por asignatura, coherente con los oa.json reales (3°: 16/26/13/31 = 86;
  // 5°: 22/27/14/30 = 93; 8°: 22/17/15/26 = 80; 4°: 18/27/17/30 = 92).
  const COBERTURA = {
    'CUR-3R09':{HI03:8,  MA03:12, CN03:5,  LE03:6},                  // 31 de 86
    'CUR-5T77':{HI05:11, MA05:15, CN05:8,  LE05:13},                 // 47 de 93
    'CUR-BA04':{HI08:18, MA08:14, CN08:12, LE08:18, 'VOC-HIST':3},   // 62 de 80, NO 65
    'CUR-6N01':{},                                                    // sin alumnos
    'CUR-4T22':{}                                                     // nadie ha jugado
  };
  const JUGARON = {'CUR-6N01':0, 'CUR-4T22':0};

  /* Inquilinos (Sesion 116, Fase 1). Un sostenedor con un colegio, como el piloto. Dos
     cursos ya asignados y el resto "Sin colegio": asi se ve el selector preseleccionado Y
     el caso vacio. Las funciones _crear/_fijar MUTAN estas constantes, para que crear un
     colegio o asignar un curso se vea de verdad al re-renderizar, no como un no-op mudo. */
  const SOS = [{id:'sos-1', nombre:'San Francisco de Sales'}];
  const COLEGIOS = {'sos-1':[{id:'col-1', nombre:'Colegio San Francisco de Sales'}]};
  const CURSO_COLEGIO = {'CUR-BA04':'col-1', 'CUR-5T77':'col-1'};
  const COL_NOMBRE = {}; Object.values(COLEGIOS).forEach(a=>a.forEach(c=>COL_NOMBRE[c.id]=c.nombre));

  /* Motor de permisos granular (Fase 3, el mantenedor). Las capacidades y los presets copian
     el catalogo real (kimun_prof_capacidades_todas / kimun_prof_preset). GRANTS arranca con lo
     que dejaria la migracion: Operador->plataforma, Super->colegio, Jefe->curso; asi el modal
     abre con "grants actuales" poblados y se puede probar revocar y agregar. */
  const CAPS_TODAS = ['curso.crear','curso.borrar','curso.nivel','alumno.gestionar','inscripcion.crear','dominio.reiniciar',
    'equipo.jefe','equipo.asignatura','avance.ver','pulso.ver','plan.fijar','plan.historial','refuerzo.gestionar',
    'profesor.autorizar','permisos.gestionar','perfiles.limpiar','enlace.armar'];
  const SOSTEN_CAPS = ['curso.crear','curso.borrar','curso.nivel','alumno.gestionar','inscripcion.crear','dominio.reiniciar',
    'equipo.jefe','equipo.asignatura','avance.ver','pulso.ver','plan.fijar','plan.historial','refuerzo.gestionar','profesor.autorizar'];
  const PRESETS = { operador:CAPS_TODAS, sostenedor:SOSTEN_CAPS, super:SOSTEN_CAPS,
    jefe:['alumno.gestionar','inscripcion.crear','dominio.reiniciar','equipo.asignatura','avance.ver','plan.fijar','refuerzo.gestionar'],
    asignatura:['avance.ver','plan.fijar','refuerzo.gestionar'] };
  let GRANT_SEQ = 4;
  let GRANTS = [
    {id:'g-1', correo:'a.diaz@desales.cl', ambito_tipo:'plataforma', ambito_id:null, capacidades:PRESETS.operador.slice(), asignaturas:[]},
    {id:'g-2', correo:'r.perez@desales.cl', ambito_tipo:'colegio', ambito_id:'col-1', capacidades:PRESETS.super.slice(), asignaturas:[]},
    {id:'g-3', correo:'j.arteaga@desales.cl', ambito_tipo:'curso', ambito_id:'CUR-BA04', capacidades:PRESETS.jefe.slice(), asignaturas:['HI08']}
  ];
  function ambitoNombre(t,id){
    if(t==='plataforma') return 'Toda la plataforma';
    if(t==='sostenedor'){ const s=SOS.find(x=>x.id===id); return s?s.nombre:'?'; }
    if(t==='colegio')  return COL_NOMBRE[id]||'?';
    if(t==='curso'){ const c=CURSOS.find(x=>x[0]===id); return c?c[1]:id; }
    return '?';
  }

  /* Planificacion ya cargada: dos unidades con fechas para ver el caso poblado, y el resto
     sin fechas para ver el vacio. `_otro` marca la que puso OTRA persona (la UTP), que es
     la que exige justificacion para moverse. */
  /* Planificacion COMO LA DEJA EL SEED DEL ANIO: las 17 unidades de las cuatro
     asignaturas de 8vo, con U1 y U2 cerradas, U3 en curso y U4 sin empezar. Es el
     escenario que Roberto va a ver de verdad, y probar con dos unidades no dice como se
     comporta el informe del anio con OCHO bloques.
     `_otro` marca la que puso la UTP, que es la que exige justificacion para moverse. */
  const UNIS = {
    HI08:['Los inicios de la modernidad','Formacion de la sociedad americana y del Chile colonial',
          'Nuevos principios occidentales: Ilustracion e Independencia','Sociedad y territorio: la region'],
    MA08:['Numeros','Algebra y funciones','Geometria','Probabilidad y estadistica'],
    CN08:['La celula','Cuerpo humano y salud','Electricidad y calor','La materia y el atomo'],
    LE08:['Lectura literaria','Textos no literarios y medios','Escritura','Comunicacion oral','Investigacion']
  };
  const FECHAS = {U1:['2026-03-09','2026-04-30'], U2:['2026-05-04','2026-07-03'],
                  U3:['2026-07-20','2026-09-25'], U4:['2026-09-28','2026-11-27'],
                  U5:['2026-09-28','2026-11-27']};
  const PLANDB = {};
  Object.keys(UNIS).forEach(asig=>UNIS[asig].forEach((tit,i)=>{
    const u='U'+(i+1), f=FECHAS[u];
    PLANDB[asig+'|'+u]={asignatura:asig, unidad:u, titulo:tit, inicio:f[0], termino:f[1],
      nota:null, fijada_por:'Rossy Perez (UTP)', actualizado:'2026-03-01', cambios:1, _otro:true};
  }));
  // La fecha movida con justificacion que siembra el seed: el historial de la UTP tiene
  // que tener algo que mostrar, o esa pantalla se ve vacia justo en la demo.
  PLANDB['MA08|U2'].termino='2026-07-10';
  PLANDB['MA08|U2'].nota='La unidad se atraso una semana por la suspension de clases de junio.';
  PLANDB['MA08|U2'].fijada_por='Katherinne Rivas';
  PLANDB['MA08|U2'].cambios=2;
  PLANDB['MA08|U2']._otro=false;

  const PLANLOG = [
    {asignatura:'MA08', unidad:'U1', titulo:'Numeros', inicio_ant:'2026-03-09',
     termino_ant:'2026-04-30', inicio:'2026-03-09', termino:'2026-05-15',
     nota:'Se corrio dos semanas: el diagnostico tomo mas de lo previsto',
     quien:'Katherinne Rivas', creado:'2026-05-20'},
    {asignatura:'MA08', unidad:'U1', titulo:'Numeros', inicio_ant:null, termino_ant:null,
     inicio:'2026-03-09', termino:'2026-04-30', nota:null,
     quien:'Rossy Perez (UTP)', creado:'2026-03-01'}
  ];

  const R = {
    // Rango por ?rol=admin|operador|super|profe (por defecto admin), para poder MIRAR el
    // panel con cada rango sin regenerar el doble. En produccion kimun_prof_yo no lee la URL.
    kimun_prof_yo: ()=>{
      const rol=(new URLSearchParams(location.search).get('rol')||'admin');
      return {id:'prof-1', correo:'roberto.lorca@vulpo.cl', nombre:'Roberto Lorca',
        es_admin: rol==='admin', es_super: rol==='super', es_operador: rol==='operador'};
    },
    /* Cuatro cursos a proposito, y con los NOMBRES desordenados respecto al nivel: el
       servidor los devuelve ordenados solo por c.nombre, asi que "8A Prueba" cae antes
       que "Quinto B" y un curso sin nivel se cuela al medio. Es lo que el orden
       ascendente del panel tiene que arreglar. */
    kimun_prof_listar: ()=>{
      const filas=[];
      CURSOS.forEach(([cod,nom,niv,gest,rol,asig,n],k)=>{
        if(!n){
          // El servidor hace LEFT JOIN, asi que un curso SIN alumnos igual devuelve su
          // fila, con pid null. Sin esto el doble lo haria desaparecer de la lista y el
          // caso de borde no se podria probar.
          filas.push({curso_codigo:cod, curso:nom, nivel:niv, puede_gestionar:gest,
            mi_rol:rol, mis_asignaturas:asig, pid:null, alumno:null, avatar:null,
            xp:null, dificil:null, codigo_acceso:null, autoinscrito:false,
            colegio_id: CURSO_COLEGIO[cod]||null, colegio: CURSO_COLEGIO[cod]?COL_NOMBRE[CURSO_COLEGIO[cod]]:null});
          return;
        }
        alumnos.slice(0,n).forEach((a,i)=>filas.push({curso_codigo:cod, curso:nom, nivel:niv,
          puede_gestionar:gest, mi_rol:rol, mis_asignaturas:asig,
          pid:'p'+k+'-'+i, alumno:a, avatar:'🦊', xp:2400-i*97, dificil:0,
          codigo_acceso: gest ? 'ALU-'+(10000+k*97+i*7) : null, autoinscrito:i%5===0,
          colegio_id: CURSO_COLEGIO[cod]||null, colegio: CURSO_COLEGIO[cod]?COL_NOMBRE[CURSO_COLEGIO[cod]]:null}));
      });
      return filas;
    },
    /* Inquilinos (Fase 1). Nombres de columna de las firmas reales: kimun_prof_sostenedores
       -> (id, nombre, colegios); kimun_prof_colegios -> (id, nombre, cursos). Los _crear
       devuelven el id nuevo y los _fijar devuelven null (void), igual que en produccion. */
    kimun_prof_sostenedores: ()=>SOS.map(s=>({id:s.id, nombre:s.nombre,
      colegios:(COLEGIOS[s.id]||[]).length})),
    kimun_prof_colegios: (a)=>(COLEGIOS[(a&&a.p_sostenedor)]||[]).map(c=>({id:c.id, nombre:c.nombre,
      cursos: CURSOS.filter(x=>CURSO_COLEGIO[x[0]]===c.id).length})),
    kimun_prof_sostenedor_crear: (a)=>{
      const id='sos-'+(SOS.length+1); SOS.push({id, nombre:(a.p_nombre||'').trim()});
      COLEGIOS[id]=[]; return id; },
    kimun_prof_colegio_crear: (a)=>{
      const id='col-'+(Object.values(COLEGIOS).reduce((n,x)=>n+x.length,0)+1);
      (COLEGIOS[a.p_sostenedor]=COLEGIOS[a.p_sostenedor]||[]).push({id, nombre:(a.p_nombre||'').trim()});
      COL_NOMBRE[id]=(a.p_nombre||'').trim(); return id; },
    kimun_prof_curso_colegio_fijar: (a)=>{
      if(a.p_colegio) CURSO_COLEGIO[a.p_curso_codigo]=a.p_colegio;
      else delete CURSO_COLEGIO[a.p_curso_codigo];
      return null; },
    kimun_prof_sostenedor_renombrar: (a)=>{ const s=SOS.find(x=>x.id===a.p_id); if(s) s.nombre=(a.p_nombre||'').trim(); return null; },
    kimun_prof_sostenedor_borrar: (a)=>{
      const i=SOS.findIndex(x=>x.id===a.p_id); if(i<0) return null;
      (COLEGIOS[a.p_id]||[]).forEach(c=>{ Object.keys(CURSO_COLEGIO).forEach(k=>{ if(CURSO_COLEGIO[k]===c.id) delete CURSO_COLEGIO[k]; }); });
      delete COLEGIOS[a.p_id]; SOS.splice(i,1); return null; },
    kimun_prof_colegio_renombrar: (a)=>{
      Object.values(COLEGIOS).forEach(arr=>{ const c=arr.find(x=>x.id===a.p_id); if(c){ c.nombre=(a.p_nombre||'').trim(); COL_NOMBRE[a.p_id]=c.nombre; } }); return null; },
    kimun_prof_colegio_borrar: (a)=>{
      Object.keys(COLEGIOS).forEach(sid=>{ COLEGIOS[sid]=COLEGIOS[sid].filter(c=>c.id!==a.p_id); });
      Object.keys(CURSO_COLEGIO).forEach(k=>{ if(CURSO_COLEGIO[k]===a.p_id) delete CURSO_COLEGIO[k]; }); return null; },
    /* El pulso del colegio. Nombres de columna copiados de la firma REAL de
       kimun_prof_pulso (curso_codigo, curso, nivel, inscritos, jugaron_semana,
       cobertura, puede_gestionar): este archivo ya perdio una tarde por escribir
       `nombre` donde el servidor devuelve `alumno`.
       ⚠️ La cobertura de 8vo trae ademas VOC-HIST, que en la base EXISTE (filas
       historicas desde la Sesion 30) pero NO esta en historia-8basico/oa.json. La funcion
       real lo filtra por forma; aqui se deja a proposito para comprobar que el CLIENTE
       tampoco lo suma: 8vo tiene que decir 62 de 80, no 65. */
    kimun_prof_pulso: ()=>CURSOS.map(([cod,nom,niv,gest,rol,asig,n])=>({
      curso_codigo:cod, curso:nom, nivel:niv||null,
      inscritos:n, jugaron_semana:JUGARON[cod]===undefined ? Math.round(n*0.78) : JUGARON[cod],
      cobertura: niv ? (COBERTURA[cod]||{}) : null,
      puede_gestionar:gest
    })),
    /* ⚠️ Depende del CURSO que se le pide, y tiene que dar el mismo numero que
       kimun_prof_pulso: el titular de la tarjeta y la fila del pulso muestran la misma
       participacion, y si el doble se contradice a si mismo, la comprobacion de
       coherencia entre las dos pantallas acusa al producto por un defecto del doble.
       El criterio del cliente (gruposParticipacion) es vinculado Y visto en 7 dias. */
    kimun_prof_participacion: (a)=>{
      const c = CURSOS.find(x=>x[0]===(a&&a.p_curso_codigo)) || CURSOS[0];
      const n = c[6];
      const jug = JUGARON[c[0]]===undefined ? Math.round(n*0.78) : JUGARON[c[0]];
      return alumnos.slice(0,n).map((nom,i)=>({
        alumno:nom, avatar:'🦊',
        visto: i<jug ? new Date(Date.now()-i*3600e3).toISOString()
             : (i<n-1 ? new Date(Date.now()-12*864e5).toISOString() : null),
        vinculado: i<n-1 }));   // el ultimo nunca canjeo su codigo
    },
    /* `ultima` y `recientes` son de la Sesion 108: cuando se trabajo cada objetivo. Se
       simulan TRES situaciones a proposito, porque son las que la pantalla tiene que
       distinguir: una unidad viva (varios alumnos este mes), una cerrada hace meses, y el
       caso trampa -- cerrada hace meses pero con UN alumno que la repaso ayer, que con la
       fecha a secas se veria igual de viva que la primera. */
    kimun_prof_dominio: ()=>oas.map((o,i)=>{
      const dias = i<3 ? 2 : (i===3 ? 1 : 40+i*12);       // el indice 3 es el caso trampa
      const rec  = i<3 ? o[3] : (i===3 ? 1 : 0);
      return {oa:o[0], alumnos:o[3], alumnos_1:o[3], resp_1:o[3]*6,
        ok_1:Math.round(o[3]*6*o[2]/100), respondidas:o[3]*6+o[4],
        correctas:Math.round(o[3]*6*o[2]/100),
        ultima:new Date(Date.now()-dias*864e5).toISOString(), recientes:rec};
    }),
    /* Acumulados por semana, como los devuelve kimun_prof_tendencia. Los deltas dan
       -/62/40/70/73/68 %, o sea las tres bandas de color mas la primera sin comparacion. */
    kimun_prof_tendencia: ()=>[
      {semana:'2026-08-09', en_curso:false, objetivos:6,  respondidas:420,  correctas:231,  xp:12000},
      {semana:'2026-08-16', en_curso:false, objetivos:8,  respondidas:980,  correctas:578,  xp:19500},
      {semana:'2026-08-23', en_curso:false, objetivos:9,  respondidas:1520, correctas:794,  xp:25800},
      {semana:'2026-08-30', en_curso:false, objetivos:10, respondidas:2180, correctas:1254, xp:33900},
      {semana:'2026-09-06', en_curso:false, objetivos:10, respondidas:2810, correctas:1712, xp:41200},
      {semana:'2026-09-13', en_curso:true,  objetivos:10, respondidas:3050, correctas:1876, xp:44600}
    ],
    // En la ficha de UN alumno el servidor manda `ultima` pero NO `recientes`: con una sola
    // persona no hay nada que distinguir entre "la clase esta en esto" y "uno repaso".
    /* Los CATORCE, no seis: la ficha tiene que abarcar las cuatro asignaturas y unidades
       cerradas Y abiertas, o el corte abiertas/historial se prueba a medias.
       Columnas copiadas de la firma real: oa, respondidas, correctas, resp_1, ok_1, ultima
       -- y NO trae `alumnos_1`, igual que en produccion, porque es un alumno solo. */
    kimun_prof_dominio_alumno: ()=>oas.map((o,i)=>({oa:o[0], resp_1:6,
      ok_1:Math.round(6*o[2]/100), respondidas:12, correctas:8,
      ultima:new Date(Date.now()-(i<3?3:60+i*10)*864e5).toISOString()})),
    kimun_prof_dominio_oa: ()=>alumnos.map((n,i)=>({alumno:n, avatar:'🦊',
      resp_1: i<18?6:0, ok_1: i<18?Math.round(6*((i*13)%100)/100):0})),
    kimun_prof_equipo: ()=>[
      {nombre:'Roberto Lorca', correo:'roberto.lorca@vulpo.cl', rol:'jefe', asignaturas:[]},
      {nombre:'Jorge Arteaga', correo:'j.arteaga@desales.cl', rol:'asignatura', asignaturas:['HI08']},
      {nombre:'Rossy Perez', correo:'r.perez@desales.cl', rol:'asignatura', asignaturas:['CN08']}
    ],
    // Tabla vacia = sin desafio activo. El cliente hace data[0]; devolver un objeto suelto
    // lo mandaba a la rama de "desafio en curso" y pintaba una pantalla que no existe.
    kimun_prof_refuerzo_estado: ()=>[],
    kimun_prof_ranking_asignatura: ()=>alumnos.slice(0,12).map((n,i)=>({alumno:n, avatar:'🦊',
      resp_1:120-i*7, ok_1:Math.round((120-i*7)*(95-i*4)/100), pct:95-i*4,
      oa_tocados:22-i, suficiente:i<9})),
    // Ranking general: promedio simple de las asignaturas con evidencia. Se simula que
    // no todos jugaron las cuatro, que es el caso que el numero de asignaturas dice.
    kimun_prof_ranking_general: ()=>alumnos.slice(0,14).map((n,i)=>({alumno:n, avatar:'🦊',
      resp_1:420-i*23, pct:88-i*3, asignaturas: i<8?4:(i<11?3:2),
      oa_tocados:60-i*3, suficiente:i<12})),
    /* Planificacion del anio. Con ESTADO, para poder probar de verdad guardar, quitar y el
       historial -- un doble que solo devuelve una lista fija no prueba el camino de ida.
       Nombres copiados de las firmas reales de kimun_prof_plan / _fijar / _historial. */
    kimun_prof_plan: ()=>Object.keys(PLANDB).map(k=>PLANDB[k]),
    kimun_prof_plan_fijar: (a)=>{
      const k = a.p_asignatura+'|'+a.p_unidad, ant = PLANDB[k];
      // El mismo portero que el servidor: justificacion obligatoria al mover una fecha
      // ajena que ya estaba puesta.
      if(ant && (ant.inicio!==a.p_inicio || ant.termino!==a.p_termino)
         && ant._otro && !(a.p_nota||'').trim())
        throw {message:'falta_justificacion'};
      if(a.p_inicio && a.p_termino && a.p_termino < a.p_inicio)
        throw {message:'fechas_invertidas'};
      PLANLOG.unshift({asignatura:a.p_asignatura, unidad:a.p_unidad, titulo:a.p_titulo,
        inicio_ant: ant?ant.inicio:null, termino_ant: ant?ant.termino:null,
        inicio:a.p_inicio, termino:a.p_termino, nota:a.p_nota,
        quien:'Roberto Lorca', creado:new Date().toISOString().slice(0,10)});
      PLANDB[k] = {asignatura:a.p_asignatura, unidad:a.p_unidad, titulo:a.p_titulo,
        inicio:a.p_inicio, termino:a.p_termino, nota:a.p_nota,
        fijada_por:'Roberto Lorca', actualizado:new Date().toISOString(),
        cambios:(ant?Number(ant.cambios)||1:0)+1, _otro:false};
      return null;
    },
    kimun_prof_plan_quitar: (a)=>{ delete PLANDB[a.p_asignatura+'|'+a.p_unidad]; return null; },
    kimun_prof_plan_historial: ()=>PLANLOG,
    /* La propuesta que sale de las fotos semanales. Solo para algunos objetivos: de una
       unidad cerrada antes de la primera foto (30/08/2026) no hay nada que proponer, y esa
       mitad de la pantalla tiene que verse igual de bien. */
    kimun_prof_plan_sugerir: ()=>[
      {oa:'HI08 OA 05', primera:'2026-08-30', ultima:'2026-09-06'},
      {oa:'HI08 OA 07', primera:'2026-08-30', ultima:'2026-09-06'},
      {oa:'MA08 OA 11', primera:'2026-09-06', ultima:'2026-09-06'}
    ],
    /* --- A49 y A55, Sesion 109 -------------------------------------------------
       Nombres de columna copiados de las firmas REALES de supabase/schema.sql. La
       primera version de este archivo escribio `nombre` donde el servidor devuelve
       `alumno` y el panel salio con la fila del alumno vacia: parecia un defecto grave
       del producto y era del doble. */

    /* Resumen de todos los cursos, para el titular de participacion y la franja.
       Se arma DESDE las mismas constantes que kimun_prof_pulso y _participacion, no con
       numeros escritos aparte: si el doble se contradice a si mismo, la comprobacion de
       coherencia entre las tres pantallas acusa al producto por un defecto del doble. */
    kimun_prof_resumen: ()=>CURSOS.map(([cod,nom,niv,gest,rol,asig,n])=>{
      const jug = JUGARON[cod]===undefined ? Math.round(n*0.78) : JUGARON[cod];
      return {
        curso_codigo:cod, curso:nom, nivel:niv||null,
        inscritos:n, vinculados:Math.max(0,n-1), jugaron_semana:jug,
        // La semana pasada: uno mas en 8vo (flecha abajo), uno menos en 3ro (flecha
        // arriba) y el mismo numero en 5to (flecha al lado). Los tres casos.
        jugaron_previa: cod==='CUR-BA04' ? jug+3 : cod==='CUR-3R09' ? Math.max(0,jug-2) : jug,
        // Un curso sin fotos todavia: la comparacion NO se puede hacer y hay que decirlo
        // en vez de mostrar un cero que se leeria como "no jugo nadie".
        hay_previa: cod !== 'CUR-4T22',
        oa_bajos: cod==='CUR-BA04' ? 3 : cod==='CUR-5T77' ? 1 : 0,
        refuerzos: cod==='CUR-BA04' ? 1 : 0,
        sin_jefe: rol === null && gest,
        puede_gestionar:gest
      };
    }),

    /* Las fotos que existen. Van desde la quincena de marzo, como las deja el seed del
       anio: sin fotos anteriores al termino de una unidad no hay informe de cierre que
       probar, y con solo dos (lo que hay en produccion) no se puede ver un anio. */
    kimun_prof_semanas: ()=>{
      const out=[]; const d=new Date('2026-03-15T12:00:00');
      while(d <= new Date('2026-09-06T12:00:00')){
        out.push({semana:d.toISOString().slice(0,10), objetivos:10, alumnos:22});
        d.setDate(d.getDate()+7);
      }
      return out;
    },

    /* El mapa de una foto pasada. Misma forma que kimun_prof_dominio pero SIN `ultima` ni
       `recientes`: los dos salen de dominio.actualizado, que se sobreescribe, asi que en
       una foto pasada dirian cuando se toco por ultima vez HOY.
       ⚠️ Los numeros DIFIEREN de los de hoy a proposito, y eso es lo que hay que poder
       mirar: en la foto hay menos alumnos (los que llegaron despues no estan) y el
       porcentaje es otro. Un doble que devolviera lo mismo que hoy haria ver como
       correcta una pantalla que no estaria demostrando nada. */
    kimun_prof_dominio_foto: (a)=>{
      const s = (a&&a.p_semana)||'';
      // Cuanto mas vieja la foto, menos alumnos habian tocado cada objetivo.
      const sem = Math.max(0, Math.round((new Date(s) - new Date('2026-03-15'))/6048e5));
      return oas.filter((o,i)=> sem >= 2+i).map((o,i)=>{
        const alu = Math.max(3, o[3] - Math.max(0, 26-sem));
        // El % de la foto se aparta del de hoy: es el promedio de los alumnos que ya lo
        // habian tocado, no de los 22 de ahora.
        const pct = Math.min(97, o[2] + ((i%3)-1)*7);
        return {oa:o[0], alumnos:alu, alumnos_1:alu, resp_1:alu*6,
                ok_1:Math.round(alu*6*pct/100), respondidas:alu*6+o[4],
                correctas:Math.round(alu*6*pct/100)};
      });
    },

    kimun_prof_inscripcion_estado: ()=>[{token:'INS-7F2K9QX1', cupo:35, usados:22, experimental:true}],
    kimun_prof_profesores: ()=>[
      {correo:'j.arteaga@desales.cl', nombre:'Jorge Arteaga', es_admin:false, es_super:false, es_operador:false, cursos:1, registrado:true},
      {correo:'r.perez@desales.cl', nombre:'Rossy Perez', es_admin:false, es_super:true, es_operador:false, cursos:2, registrado:true},
      {correo:'a.diaz@desales.cl', nombre:'Ana Diaz', es_admin:false, es_super:false, es_operador:true, cursos:3, registrado:true},
      {correo:'k.rivas@desales.cl', nombre:null, es_admin:false, es_super:false, es_operador:false, cursos:0, registrado:false}
    ],
    /* Mantenedor de permisos (Fase 3). El doble no aplica la no-escalada del servidor —solo
       devuelve datos—; los rechazos se prueban con el control RPC contra produccion. Aqui se
       verifica el FLUJO de la UI: ver / agregar / revocar grants. */
    kimun_prof_capacidades_todas: ()=>CAPS_TODAS.slice(),
    kimun_prof_preset: (a)=>(PRESETS[((a&&a.p_nombre)||'').toLowerCase()]||[]).slice(),
    kimun_prof_cursos: ()=>CURSOS.map(([cod,nom,niv])=>({id:cod, codigo:cod, nombre:nom, nivel:niv||null,
      colegio_id:CURSO_COLEGIO[cod]||null, colegio: CURSO_COLEGIO[cod]?COL_NOMBRE[CURSO_COLEGIO[cod]]:null})),
    kimun_prof_permisos_ver: (a)=>GRANTS.filter(g=>g.correo===(a&&a.p_correo)).map(g=>({
      id:g.id, ambito_tipo:g.ambito_tipo, ambito_id:g.ambito_id,
      ambito_nombre:ambitoNombre(g.ambito_tipo,g.ambito_id),
      capacidades:g.capacidades.slice(), asignaturas:g.asignaturas.slice()})),
    kimun_prof_permisos_fijar: (a)=>{
      GRANTS = GRANTS.filter(g=>!(g.correo===a.p_correo && g.ambito_tipo===a.p_ambito_tipo
        && (g.ambito_id||null)===(a.p_ambito_id||null)));
      const caps=(a.p_capacidades||[]);
      if(caps.length) GRANTS.push({id:'g-'+(GRANT_SEQ++), correo:a.p_correo, ambito_tipo:a.p_ambito_tipo,
        ambito_id:a.p_ambito_id||null, capacidades:caps.slice(), asignaturas:(a.p_asignaturas||[]).slice()});
      return null; },
    kimun_prof_permisos_revocar: (a)=>{ GRANTS = GRANTS.filter(g=>g.id!==(a&&a.p_id)); return null; }
  };
  window.supabase = { createClient: ()=>({
    auth:{
      getSession: async ()=>({data:{session:{user:{id:'demo'}}}}),
      signOut: async ()=>({}), signUp: async ()=>({}), signInWithPassword: async ()=>({})
    },
    // PostgREST NO lanza: devuelve {data, error}. Un `raise exception` del servidor llega
    // como `error`, asi que el doble tiene que hacer lo mismo o el cliente se prueba contra
    // un camino que en produccion no existe.
    rpc: async (fn,args)=>{
      try{ return {data:(R[fn]? R[fn](args) : null), error:null}; }
      catch(e){ return {data:null, error:e}; }
    }
  })};
})();
</script>
"""

s = io.open(REPO, encoding="utf-8").read()
ancla = "<script>\nconst SUPA_URL"
assert s.count(ancla) == 1, "el ancla del script principal no aparece exactamente una vez"
s = s.replace(ancla, STUB + "\n<script>\nconst SUPA_URL")
io.open(OUT, "w", encoding="utf-8", newline="\n").write(s)
print("escrito", OUT)
