/* Contenido sensible — mapa OA→categoría para el armador de enlaces (?armar=1).
   Compartido por juego/, 7mo/ y 3ro/. Espejo-máquina de docs/contenido-sensible.md
   (que lleva la explicación humana y la severidad ALTA/MEDIA/BAJA, que la UI no usa).
   Solo lo lee arrancarArmador. Si este archivo no carga, cada index.html define un
   respaldo vacío, así que el armador degrada a "sin marcas" y nunca crashea. */
(function(){
  var CATS={
    sex:       {icono:'❤️', color:'#ff4d6d', nombre:'Sexualidad'},
    violencia: {icono:'⚔️', color:'#4a4a5e', nombre:'Violencia y muerte'},
    religion:  {icono:'🛐', color:'#ffc93c', nombre:'Religión y creencias'},
    pueblos:   {icono:'🪶', color:'#b5793a', nombre:'Pueblos originarios'},
    sustancias:{icono:'🚭', color:'#4dd8ff', nombre:'Sustancias'}
  };
  var OA={
    // 3° básico
    "HI03 OA 05":["violencia"],
    // 7° básico
    "CN07 OA 01":["sex"], "CN07 OA 02":["sex"], "CN07 OA 03":["sex"],
    "HI07 OA 01":["religion"], "HI07 OA 07":["violencia"], "HI07 OA 11":["religion"],
    "HI07 OA 14":["violencia","pueblos"], "HI07 OA 15":["religion","pueblos"],
    "HI07 OA 19":["religion"], "HI07 OA 20":["pueblos"],
    // 8° básico
    "HI08 OA 02":["religion"], "HI08 OA 05":["violencia","pueblos"],
    "HI08 OA 06":["violencia"], "HI08 OA 07":["violencia","pueblos"],
    "HI08 OA 10":["violencia"], "HI08 OA 11":["violencia","pueblos"],
    "HI08 OA 12":["violencia","pueblos"], "HI08 OA 13":["violencia"],
    "HI08 OA 17":["pueblos"], "CN08 OA 07":["sustancias"],
    // 6° básico
    "CN06 OA 04":["sex"], "CN06 OA 05":["sex"], "CN06 OA 06":["sex"],
    "CN06 OA 07":["sustancias"],
    "HI06 OA 05":["violencia","pueblos"], "HI06 OA 08":["violencia"],
    // 4° básico
    "CN04 OA 08":["sustancias"]
  };
  window.SENSIBLE={
    cats:CATS, oa:OA,
    /* Categorías presentes en un capítulo, deduplicadas y en el orden canónico de cats.
       Ignora la etapa BOSS (su oa es "BOSS"; sus oas ya están cubiertos por las etapas). */
    deExpedicion:function(exp){
      var set={};
      ((exp && exp.etapas) || []).forEach(function(et){
        var cs=OA[et.oa]; if(cs) cs.forEach(function(c){ set[c]=1; });
      });
      return Object.keys(CATS).filter(function(c){ return set[c]; });
    }
  };
})();
