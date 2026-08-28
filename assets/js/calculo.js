/* ============================================================================
   VULPO · RETO SIN FIN DE CÁLCULO  (compartido por todos los cursos)

   Un desafío de velocidad que no termina: operaciones generadas al vuelo, una
   tras otra, subiendo de dificultad con la racha. Se acaba al fallar o al
   quedarse sin tiempo, y deja un récord personal.

   POR QUÉ VIVE AQUÍ Y NO DENTRO DE CADA JUEGO. Cada curso es un fork del
   index.html: lo que se escribe adentro hay que volver a escribirlo en el
   siguiente. En la Sesión 65 se sacaron 792 líneas de 3° y 7° justamente por
   eso. Este archivo se incluye con una línea y se engancha con una llamada, así
   que el próximo curso lo hereda sin copiar nada.

   POR QUÉ NO NECESITA BANCO DE PREGUNTAS. Las operaciones se generan por código,
   así que no consume contenido, no pasa por aprobación pedagógica y no suma
   clips de voz. Es la razón por la que este modo es barato de agregar a un nivel
   nuevo: lo único propio del curso es su generador.

   LO QUE APORTA CADA CURSO (todo por `init`, nada por variable global):
     generar(dif) -> {q, ops, ok}   la operación, sus 4 opciones y el índice bueno
     sinReloj                        true: sin cuenta regresiva (ver abajo)
     etiqueta                        opcional, el rótulo del contador ("Racha", "Escalón")
     go(id)                          el conmutador de pantallas del juego
     volver()                        a dónde salir
     leerRecord() / guardarRecord(n) dónde vive el récord (el save del curso)
     premiar(racha)                  el juego decide XP y monedas, y guarda
     snd                             opcional: {ok, mal, tic, fin, tap}

   CÓMO SE INTEGRA EN UN CURSO NUEVO:
     1. <script src="/assets/js/calculo.js"></script>   antes del script del juego
     2. un respaldo vacío ANTES de usarlo (ver abajo, es obligatorio)
     3. CALC.init({...})
     4. un botón que llame a CALC.abrir()

   ⚠️ EL RESPALDO VACÍO NO ES OPCIONAL. Si este archivo no carga —404, red lenta,
   bloqueador— y el juego llama a CALC.init en el nivel superior, revienta TODO
   su JavaScript y el síntoma engaña: la pantalla inicial se ve bien porque es
   HTML, y ningún botón responde. Pasó de verdad con revision.js (Sesión 56).
   ========================================================================== */
window.CALC = (function () {

  /* El tiempo por operación es FIJO en 20 s y NO baja con la dificultad. Se
     decidió así en la Sesión 31 para el Reto de 8°: lo que sube con la racha es
     lo difícil de la operación, no la presión del reloj. Bajar los dos a la vez
     convierte el juego en una prueba de reflejos y deja fuera al que calcula
     bien pero despacio. */
  const SEGUNDOS = 20;

  /* SIN RELOJ. Un curso puede pedir el juego sin cuenta regresiva, y no es una
     concesión: en 3° básico el quiz entero se juega sin cronómetro a propósito,
     porque a los 8-9 años el reloj produce ansiedad y no foco. Poner uno solo en
     este modo contradiría esa decisión de producto.
     Sin reloj el juego sigue siendo infinito: lo que sostiene la tensión es la
     escalera de dificultad y el récord, no el tiempo. Termina únicamente al fallar. */

  const CSS = [
    "#scr-sinfin .sf-hud{display:flex;align-items:center;gap:10px;margin:14px 0 8px}",
    "#scr-sinfin .sf-racha{flex:1;text-align:center;font-weight:900;color:var(--violet);font-size:15px}",
    "#scr-sinfin .sf-racha b{color:var(--gold);font-size:19px}",
    "#scr-sinfin .sf-t{font-weight:900;font-size:16px;min-width:34px;text-align:right}",
    "#scr-sinfin .sf-t.low{color:var(--pink)}",
    "#scr-sinfin .sf-barra{height:6px;border-radius:99px;background:#ffffff1a;overflow:hidden;margin-bottom:16px}",
    "#scr-sinfin .sf-barra i{display:block;height:100%;background:linear-gradient(90deg,var(--violet),var(--cyan));transition:width .1s linear}",
    "#scr-sinfin .sf-op{font-family:'Titan One',system-ui,sans-serif;font-size:clamp(30px,9vw,44px);",
    "  text-align:center;margin:22px 0 26px;letter-spacing:1px}",
    "#scr-sinfin .sf-fb{text-align:center;font-weight:900;min-height:22px;margin-top:12px}",
    "#scr-sinfin .sf-fb.ok{color:var(--green)} #scr-sinfin .sf-fb.bad{color:var(--pink)}",
    "#scr-sinfin-res .sf-rec{font-family:'Titan One',system-ui,sans-serif;font-size:52px;color:var(--gold);text-align:center}",
  ].join("");

  const HTML = [
    '<section class="screen" id="scr-sinfin">',
    '  <div class="sf-hud">',
    '    <div class="sf-racha"><span id="sfRotulo">♾️ Racha</span>: <b id="sfRacha">0</b></div>',
    '    <div class="sf-t" id="sfTimer">20</div>',
    '  </div>',
    '  <div class="sf-barra"><i id="sfBarra" style="width:100%"></i></div>',
    '  <div class="sf-op" id="sfOp">—</div>',
    '  <div class="opts" id="sfOpts"></div>',
    '  <div class="sf-fb" id="sfFb"></div>',
    '  <button class="btn sec" id="sfSalir" style="margin-top:18px">← Salir</button>',
    '</section>',
    '<section class="screen" id="scr-sinfin-res">',
    '  <div class="logo" style="margin:26px 0 4px"><span class="badge">♾️</span>',
    '    <h1 style="font-size:26px" id="sfResTit">¡Buena racha!</h1></div>',
    '  <div class="card" style="text-align:center">',
    '    <div class="sf-rec" id="sfResN">0</div>',
    '    <p id="sfResSub" style="margin-top:2px"></p>',
    '  </div>',
    '  <button class="btn" id="sfOtra" style="margin-top:18px">Otra vez ➜</button>',
    '  <button class="btn sec" id="sfVolver" style="margin-top:10px">← Volver</button>',
    '</section>',
  ].join("");

  let cfg = null;
  let R = null;          // {racha, lock, timer, t0, ms}
  const conReloj = () => !cfg.sinReloj;
  const $ = (id) => document.getElementById(id);

  function inyectar() {
    const s = document.createElement("style");
    s.textContent = CSS;
    document.head.appendChild(s);
    // Las pantallas van dentro de .wrap, que es donde viven las del juego: go()
    // busca '.screen' en todo el documento, pero el ancho y el padding los pone
    // ese contenedor. Colgarlas del body las dejaría a lo ancho de la ventana.
    const cont = document.querySelector(".wrap") || document.body;
    const d = document.createElement("div");
    d.innerHTML = HTML;
    while (d.firstChild) cont.appendChild(d.firstChild);
    if (cfg.etiqueta) {
      const e = $("sfRotulo");
      if (e) e.textContent = cfg.etiqueta;
    }
    if (!conReloj()) {                 // fuera el contador y la barra, no solo ocultos
      const t = $("sfTimer"); if (t) t.remove();
      const b = document.querySelector("#scr-sinfin .sf-barra"); if (b) b.remove();
    }
  }

  function snd(n) { try { if (cfg.snd && cfg.snd[n]) cfg.snd[n](); } catch (e) {} }

  /* La dificultad sube con la racha, no con el tiempo: cada 5 aciertos, un
     escalón, hasta 5. Así el primer minuto es amable para cualquiera y el que
     va bien encuentra pared. */
  function dificultad() { return Math.min(5, 1 + Math.floor(R.racha / 5)); }

  function pintar() {
    const op = cfg.generar(dificultad());
    R.actual = op;
    R.lock = false;
    $("sfOp").textContent = op.q;
    $("sfRacha").textContent = R.racha;
    $("sfFb").textContent = "";
    $("sfFb").className = "sf-fb";

    // Las opciones se barajan aquí y NO en el generador, para que un generador
    // nuevo no tenga que acordarse de hacerlo. El sesgo de posición es el
    // defecto más fácil de introducir sin darse cuenta.
    const orden = op.ops.map((o, i) => ({ o: o, i: i })).sort(() => Math.random() - 0.5);
    const box = $("sfOpts");
    box.innerHTML = "";
    orden.forEach(function (it, k) {
      const b = document.createElement("div");
      b.className = "opt";
      b.innerHTML = '<span class="key">' + "ABCD"[k] + "</span>" + String(it.o);
      b.onclick = function () { responder(b, it.i === op.ok); };
      box.appendChild(b);
    });

    if (conReloj()) arrancarReloj();
  }

  function arrancarReloj() {
    clearInterval(R.timer);
    R.t0 = Date.now();
    const total = SEGUNDOS * 1000;
    let ultimoSeg = SEGUNDOS;
    R.timer = setInterval(function () {
      const queda = Math.max(0, total - (Date.now() - R.t0));
      const seg = Math.ceil(queda / 1000);
      $("sfBarra").style.width = (queda / total * 100) + "%";
      if (seg !== ultimoSeg) {
        ultimoSeg = seg;
        $("sfTimer").textContent = seg;
        $("sfTimer").className = "sf-t" + (seg <= 5 ? " low" : "");
        if (seg <= 5 && seg > 0) snd("tic");
      }
      if (queda <= 0) { clearInterval(R.timer); responder(null, false); }
    }, 80);
  }

  function responder(el, ok) {
    if (R.lock) return;
    R.lock = true;
    if (conReloj()) clearInterval(R.timer);
    document.querySelectorAll("#sfOpts .opt").forEach(function (o) { o.classList.add("off"); });
    if (ok) {
      R.racha++;
      if (el) { el.classList.remove("off"); el.classList.add("ok"); }
      $("sfFb").textContent = "✓ ¡Bien!";
      $("sfFb").className = "sf-fb ok";
      snd("ok");
      R.avanzar = setTimeout(pintar, 550);
    } else {
      if (el) { el.classList.remove("off"); el.classList.add("bad"); }
      // Marcar la correcta al perder: es lo último que ve, y verla enseña.
      const bien = document.querySelectorAll("#sfOpts .opt")[
        [].slice.call(document.querySelectorAll("#sfOpts .opt")).findIndex(function (n) {
          return n.textContent.slice(1) === String(R.actual.ops[R.actual.ok]);
        })];
      if (bien) { bien.classList.remove("off"); bien.classList.add("ok"); }
      $("sfFb").textContent = el ? "✗ Era " + R.actual.ops[R.actual.ok] : "⏱ Se acabó el tiempo";
      $("sfFb").className = "sf-fb bad";
      snd("mal");
      R.avanzar = setTimeout(terminar, 1400);
    }
  }

  function terminar() {
    if (conReloj()) clearInterval(R.timer);
    const rec = cfg.leerRecord();
    const nuevo = R.racha > rec;
    if (nuevo) cfg.guardarRecord(R.racha);
    if (cfg.premiar) cfg.premiar(R.racha);
    snd("fin");
    $("sfResTit").textContent = nuevo ? "¡Nuevo récord!" : (R.racha ? "¡Buena racha!" : "¡Otra vez!");
    $("sfResN").textContent = R.racha;
    $("sfResSub").textContent = R.racha === 1
      ? "Resolviste 1 cálculo." + (nuevo ? " ¡Tu mejor marca!" : " Récord: " + rec)
      : "Resolviste " + R.racha + " cálculos seguidos." + (nuevo ? " ¡Tu mejor marca!" : " Récord: " + rec);
    cfg.go("scr-sinfin-res");
  }

  function detener() {
    if (!R) return;
    clearInterval(R.timer);
    clearTimeout(R.avanzar);
  }

  return {
    activo: false,

    init: function (c) {
      cfg = c;
      this.activo = !!c.activo;
      if (!this.activo) return;          // apagado: no inyecta nada
      inyectar();
      $("sfSalir").onclick = function () { snd("tap"); detener(); cfg.volver(); };
      $("sfVolver").onclick = function () { snd("tap"); cfg.volver(); };
      $("sfOtra").onclick = function () { snd("tap"); CALC.abrir(); };
    },

    abrir: function () {
      if (!this.activo) return;
      detener();
      R = { racha: 0, lock: false, timer: null, avanzar: null, actual: null };
      cfg.go("scr-sinfin");
      pintar();
    },

    // El juego la llama desde su barra inferior y al cambiar de pantalla, igual
    // que hace con sus otros temporizadores. Sin esto, salir a mitad de una
    // operación deja el reloj corriendo de fondo (el defecto de la Sesión 33).
    detener: detener,
  };
})();
