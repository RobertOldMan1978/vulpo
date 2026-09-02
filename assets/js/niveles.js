/* ================= CATÁLOGO DE NIVELES Y ASIGNATURAS =================
   Lo usa el panel del profesor (profesor.html). Los juegos NO lo cargan a propósito:
   sería una dependencia dura en el arranque a cambio de cuatro cadenas de texto, y este
   proyecto ya pagó esa factura —un 404 de revision.js mató todo el JavaScript, con un
   síntoma que engaña: la pantalla se ve bien y ningún botón responde—.

   POR QUÉ EXISTE
   Dar de alta un curso obligaba a escribir la misma información en ocho listas a mano,
   repartidas en tres archivos y dos lenguajes. La peor era `SB_asigDe`: un espejo,
   escrito a mano en JavaScript, de la función `kimun_oa_asignatura` que vive en
   PostgreSQL. Es el patrón que ya causó un defecto real (Sesión 37) y que **cuando falla
   no da error**: si a una lista le falta un código, ese contenido queda invisible para el
   Profesor Jefe y no hay nada que mirar.

   LA OBSERVACIÓN QUE LO HACE CHICO
   Casi ninguna de esas listas necesitaba existir, porque **el código ya contiene la
   información**: `HI08` es `HI` (Historia) + `08` (el nivel). Es la regla que el proyecto
   ya tenía escrita —"la convención de nombres ES la configuración"— aplicada donde
   todavía no estaba.

   Aquí se guarda SOLO lo que no se puede derivar. Agregar un curso es UNA fila. */

var NIV = {};

/* Los cuatro prefijos. `carpeta` es el prefijo de `contenido/`, `orden` el del panel.
   Tabla CERRADA: no crece al agregar un curso. */
NIV.ASIGS = {
  HI: {nombre:'Historia',   carpeta:'historia',    orden:1},
  MA: {nombre:'Matemática', carpeta:'matematicas', orden:2},
  CN: {nombre:'Ciencias',   carpeta:'ciencias',    orden:3},
  LE: {nombre:'Lenguaje',   carpeta:'lenguaje',    orden:4}
};

/* LA lista de niveles del proyecto. De aquí salen el armador de enlaces de muestra, el
   selector del enlace de inscripción y el nivel del curso. `nivel` son los dos dígitos
   que van dentro del código de asignatura (MA03 = MA + 03), así que una asignatura es de
   este nivel si su código TERMINA en él. Orden descendente, y así debe quedar.
   AGREGAR UN CURSO NUEVO ES ESTA FILA. */
NIV.NIVELES = [
  {nivel:'08', nombre:'8° básico', ruta:'/8vo/'},
  {nivel:'07', nombre:'7° básico', ruta:'/7mo/'},
  {nivel:'03', nombre:'3° básico', ruta:'/3ro/'}
];

/* Los módulos transversales —Vocabulario, las lecturas— NO llevan el nivel en su código
   (`VOC-HIST`, `AF-T1`, y no `LE03 OA 01`), así que no se derivan y van a mano.
   Tabla CERRADA: tampoco crece al agregar un curso.

   ⚠️ NO se puede borrar "porque ya nadie usa esos códigos": hay filas históricas de 8° en
   producción con ellos (Vocabulario y Ana Frank están desde la Sesión 30). Sin esta tabla
   ese avance desaparecería del panel del profesor SIN NINGÚN ERROR. */
NIV.TRANSVERSALES = {'VOC-HIST':'HI08', 'VOC-CIEN':'CN08', 'VOC-MATE':'MA08',
                     'VOC-LENG':'LE08', 'VOC-LECT':'LE08'};

/* La etiqueta de 8° no lleva el año —fue el primer nivel y su nombre ya está repartido
   por el panel— y dice "Matemáticas" en plural, mientras el resto usa el nombre oficial
   del MINEDUC en singular. Se conserva tal cual para no cambiarle la etiqueta a un
   colegio que ya la ve; los niveles nuevos usan la forma derivada.
   Tabla CERRADA: solo 8°. */
NIV.ETIQUETA_8 = {HI08:'Historia', MA08:'Matemáticas', CN08:'Ciencias', LE08:'Lenguaje'};

/* Todos los códigos, en el orden canónico del panel: por nivel descendente y, dentro de
   cada uno, Historia · Matemática · Ciencias · Lenguaje. Antes 3° iba en otro orden
   (MA, HI, LE, CN) porque su lista se escribió a mano; al derivarla, los tres quedan
   iguales. */
NIV.codigos = function(){
  var pre = Object.keys(NIV.ASIGS).sort(function(a,b){
    return NIV.ASIGS[a].orden - NIV.ASIGS[b].orden;
  });
  var out = [];
  NIV.NIVELES.forEach(function(n){
    pre.forEach(function(p){ out.push(p + n.nivel); });
  });
  return out;
};

/* De un código de objetivo a su asignatura. Reemplaza a `SB_asigDe`, que era el espejo
   a mano de `kimun_oa_asignatura`. Devuelve null si no se reconoce —un `CA-T1` del libro,
   por ejemplo—, y eso está bien: desde la Sesión 72 el juego solo manda al servidor lo
   que tiene forma de código curricular. */
NIV.asigDe = function(oa){
  var s = String(oa || '');
  if (NIV.TRANSVERSALES[s]) return NIV.TRANSVERSALES[s];
  if (s.indexOf('AF-T') === 0) return 'LE08';          // el diario de Ana Frank, en 8°
  var cod = s.slice(0, 4);
  return NIV.codigos().indexOf(cod) >= 0 ? cod : null;
};

/* 'HI08' -> 'Historia'  ·  'MA03' -> 'Matemática 3°' */
NIV.nombre = function(cod){
  if (NIV.ETIQUETA_8[cod]) return NIV.ETIQUETA_8[cod];
  var a = NIV.ASIGS[String(cod).slice(0, 2)];
  if (!a) return cod;
  return a.nombre + ' ' + parseInt(String(cod).slice(2), 10) + '°';
};

/* 'HI08' -> 'historia-8basico' (la carpeta de `contenido/`) */
NIV.carpeta = function(cod){
  var a = NIV.ASIGS[String(cod).slice(0, 2)];
  if (!a) return null;
  return a.carpeta + '-' + parseInt(String(cod).slice(2), 10) + 'basico';
};

/* Las asignaturas de un nivel, o todas si no se pide ninguno. El nivel vive DENTRO del
   código, así que pertenecer a un curso es terminar en su nivel: no hay ninguna lista
   paralela que mantener. */
NIV.deNivel = function(n){
  return n ? NIV.codigos().filter(function(c){ return c.slice(-2) === n; })
           : NIV.codigos();
};
