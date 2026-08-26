/* ============================================================================
   VULPO · MODO REVISIÓN DE PROFESOR  (compartido por todos los cursos)

   Le pasamos a un profesor un enlace de muestra acotado para que revise el
   contenido y nos diga qué está mal. Sobre el modo prueba normal agrega:
     - pocas preguntas por etapa (revisar 40 por capítulo agota a cualquiera, y
       un profesor que se cansa deja de mirar con atención);
     - un 🚩 por pregunta, que guarda su id;
     - una pantalla al final para escribir o grabar sus comentarios.

   POR QUÉ VIVE AQUÍ Y NO DENTRO DE CADA JUEGO. Cada curso (8°, 3°, los que
   vengan) es un fork del index.html: lo que se escribe adentro hay que volver a
   escribirlo en el siguiente. Este archivo se incluye con una línea y se
   engancha con tres, así que un curso nuevo lo hereda sin copiar nada.

   POR QUÉ WHATSAPP Y NO UN BACKEND. El sitio es público: una tabla escribible
   por cualquiera sería una puerta abierta a basura, y el profesor ya conversa
   por ahí. La contra asumida es que si no completa el envío, ese comentario se
   pierde.

   CÓMO SE INTEGRA EN UN CURSO NUEVO:
     1. <script src="/assets/js/revision.js"></script>   antes del script del juego
     2. REV.init({activo: <bandera>, volver: ()=>go('scr-mapas')})
     3. en nPreguntas():    if(REV.activo) return REV.n;
     4. en pintaPregunta(): REV.boton(P);        // P debe traer P.id
     5. en go(id):          REV.barra();
   ========================================================================== */
window.REV = (function () {
  const CSS = [
    ".btn-rev{display:block;margin:8px auto 0;padding:7px 16px;border:1px dashed #ff4d8d;",
    "border-radius:18px;background:transparent;color:#ff4d8d;font-family:'Nunito',sans-serif;",
    "font-weight:800;font-size:13px;cursor:pointer}",
    ".btn-rev.marcada{background:#ff4d8d;color:#2a0a16;border-style:solid}",
    ".rev-barra{position:fixed;left:0;right:0;bottom:0;z-index:60;background:#2a1030;",
    "border-top:1px solid #ff4d8d;padding:8px 12px;display:flex;gap:10px;align-items:center;",
    "justify-content:center}",
    ".rev-barra b{color:#ff4d8d;font-size:13px}",
    ".rev-barra button{padding:8px 16px;border:0;border-radius:18px;background:#ff4d8d;",
    "color:#2a0a16;font-family:'Nunito',sans-serif;font-weight:900;font-size:14px;cursor:pointer}",
    "#scr-revision .rev-caja{max-width:520px;margin:30px auto 90px;background:#241a44;",
    "border:1px solid #ffffff1f;border-radius:16px;padding:20px;text-align:center}",
    "#scr-revision h2{font-family:'Titan One',cursive;color:#ffc93c;font-size:22px;margin:0 0 4px}",
    "#scr-revision p{color:#cfc9e8;font-size:15px;line-height:1.4}",
    "#revTexto{width:100%;box-sizing:border-box;border-radius:10px;border:1px solid #ffffff33;",
    "background:#1b1233;color:#fff;font-family:'Nunito',sans-serif;font-size:15px;padding:10px;",
    "margin-bottom:12px}",
    "#revMarcadas{background:#3a2f6b;border-radius:8px;padding:8px 10px;font-size:13px;margin:0 0 12px}",
    ".rev-audio{margin-top:18px;padding-top:14px;border-top:1px solid #ffffff22}",
    ".rev-audio-tit{font-weight:800;margin-bottom:8px;color:#fff}",
    "#revEstado{display:block;margin-top:8px;font-size:13px;color:#cfc9e8;min-height:18px}"
  ].join("");

  const HTML = [
    '<div class="rev-caja">',
    '<h2>💬 Sus comentarios</h2>',
    '<p>Cuéntenos qué mejoraría. Puede escribir o dejar un mensaje de voz, lo que le',
    ' resulte más cómodo.</p>',
    '<p id="revMarcadas" hidden></p>',
    '<textarea id="revTexto" rows="6" placeholder="Por ejemplo: las preguntas de fracciones',
    ' me parecieron difíciles para este curso; en geometría faltó…"></textarea>',
    '<button class="btn" id="revEnviarTexto" type="button">Enviar por WhatsApp ➜</button>',
    '<div class="rev-audio">',
    '<div class="rev-audio-tit">🎤 O deje un mensaje de voz</div>',
    '<button class="btn sec" id="revGrabar" type="button">Grabar</button>',
    '<span id="revEstado"></span>',
    '<audio id="revAudio" controls hidden style="width:100%;margin-top:8px"></audio>',
    '<button class="btn" id="revEnviarAudio" type="button" hidden>Enviar el audio ➜</button>',
    '</div>',
    '<button class="btn sec" id="revVolver" type="button" style="margin-top:14px">',
    '← Seguir revisando</button>',
    '</div>'
  ].join("");

  const R = {
    activo: false,
    n: 3,                       // preguntas por etapa en modo revisión
    marcadas: [],
    whatsapp: "56976684967",
    titulo: "VULPO · Revisión",
    _volver: null
  };

  R.init = function (o) {
    o = o || {};
    R.activo = !!o.activo;
    if (o.n) R.n = o.n;
    if (o.whatsapp) R.whatsapp = o.whatsapp;
    if (o.titulo) R.titulo = o.titulo;
    R._volver = o.volver || null;
    if (!R.activo) return R;
    const st = document.createElement("style");
    st.textContent = CSS;
    document.head.appendChild(st);
    // La pantalla se inyecta junto a las demás para que go('scr-revision') funcione.
    const otra = document.querySelector(".screen");
    const sec = document.createElement("section");
    sec.className = "screen";
    sec.id = "scr-revision";
    sec.innerHTML = HTML;
    (otra ? otra.parentNode : document.body).appendChild(sec);
    document.getElementById("revEnviarTexto").onclick = enviarTexto;
    document.getElementById("revGrabar").onclick = alternarGrabacion;
    document.getElementById("revEnviarAudio").onclick = enviarAudio;
    document.getElementById("revVolver").onclick = function () {
      if (R._volver) R._volver(); else history.back();
      R.barra();
    };
    R.barra();
    return R;
  };

  /* Barra fija con el contador de marcadas y el acceso a los comentarios. */
  R.barra = function () {
    if (!R.activo) return;
    let b = document.getElementById("revBarra");
    if (!b) {
      b = document.createElement("div");
      b.id = "revBarra";
      b.className = "rev-barra";
      b.innerHTML = '<b id="revCuenta"></b>' +
                    '<button type="button" id="revIr">💬 Comentarios</button>';
      document.body.appendChild(b);
      document.getElementById("revIr").onclick = R.abrir;
    }
    const n = R.marcadas.length;
    document.getElementById("revCuenta").textContent =
      n === 0 ? "Revisión de profesor"
              : (n === 1 ? "1 pregunta marcada" : n + " preguntas marcadas");
    const scr = document.getElementById("scr-revision");
    b.style.display = (scr && scr.classList.contains("on")) ? "none" : "flex";
  };

  R.abrir = function () {
    const m = document.getElementById("revMarcadas");
    if (R.marcadas.length) {
      m.hidden = false;
      m.textContent = "Marcó " + R.marcadas.length + " pregunta" +
        (R.marcadas.length === 1 ? "" : "s") + ": " + R.marcadas.join(", ");
    } else {
      m.hidden = true;
    }
    if (typeof go === "function") go("scr-revision");
    R.barra();
  };

  /* 🚩 de la pregunta actual. Se llama desde pintaPregunta con la pregunta viva.
     El botón se crea la primera vez, así el juego no necesita markup propio. */
  R.boton = function (P) {
    if (!R.activo) return;
    let bm = document.getElementById("btnMarcar");
    if (!bm) {
      const ops = document.getElementById("qOpts");
      if (!ops) return;
      bm = document.createElement("button");
      bm.id = "btnMarcar";
      bm.type = "button";
      bm.className = "btn-rev";
      ops.parentNode.insertBefore(bm, ops.nextSibling);
    }
    const pinta = function () {
      const m = P && P.id && R.marcadas.indexOf(P.id) >= 0;
      bm.classList.toggle("marcada", !!m);
      bm.textContent = m ? "🚩 Marcada" : "🚩 Marcar esta pregunta";
    };
    bm.hidden = false;
    bm.onclick = function () {
      if (!P || !P.id) return;
      const i = R.marcadas.indexOf(P.id);
      if (i >= 0) R.marcadas.splice(i, 1); else R.marcadas.push(P.id);
      pinta();
      R.barra();
    };
    pinta();
  };

  function mensaje(txt) {
    const L = [R.titulo];
    if (R.marcadas.length) L.push("Preguntas marcadas: " + R.marcadas.join(", "));
    if (txt) L.push("", txt);
    return L.join("\n");
  }
  R.mensaje = mensaje;

  function enviarTexto() {
    const t = (document.getElementById("revTexto").value || "").trim();
    if (!t && !R.marcadas.length) {
      document.getElementById("revEstado").textContent =
        "Escriba algo o marque alguna pregunta antes de enviar.";
      return;
    }
    window.open("https://wa.me/" + R.whatsapp + "?text=" + encodeURIComponent(mensaje(t)),
                "_blank", "noopener");
  }

  /* Grabación de voz. Si el navegador o el permiso fallan, se dice y no se rompe
     nada: queda el texto. El audio NO se sube a ninguna parte; se comparte con el
     botón nativo del teléfono, que en Android e iOS ofrece WhatsApp directo. */
  let _rec = null, _trozos = [], _blob = null;

  function tipoAudio() {
    const c = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm"];
    for (let i = 0; i < c.length; i++) {
      if (window.MediaRecorder && MediaRecorder.isTypeSupported(c[i])) return c[i];
    }
    return "";
  }
  R.tipoAudio = tipoAudio;

  function alternarGrabacion() {
    const bt = document.getElementById("revGrabar");
    const st = document.getElementById("revEstado");
    if (_rec && _rec.state === "recording") { _rec.stop(); return; }
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      st.textContent = "Este navegador no permite grabar. Escriba su comentario, por favor.";
      return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      const t = tipoAudio();
      _rec = t ? new MediaRecorder(stream, { mimeType: t }) : new MediaRecorder(stream);
      _trozos = [];
      _rec.ondataavailable = function (e) { if (e.data && e.data.size) _trozos.push(e.data); };
      _rec.onstop = function () {
        stream.getTracks().forEach(function (x) { x.stop(); });
        _blob = new Blob(_trozos, { type: _rec.mimeType || "audio/webm" });
        const a = document.getElementById("revAudio");
        a.src = URL.createObjectURL(_blob);
        a.hidden = false;
        document.getElementById("revEnviarAudio").hidden = false;
        bt.textContent = "Grabar de nuevo";
        st.textContent = "Listo. Escúchelo y envíelo, o grabe otra vez.";
      };
      _rec.start();
      bt.textContent = "⏹ Detener";
      st.textContent = "Grabando…";
    }).catch(function () {
      st.textContent = "No se pudo usar el micrófono. Escriba su comentario, por favor.";
    });
  }

  function enviarAudio() {
    const st = document.getElementById("revEstado");
    if (!_blob) { st.textContent = "Primero grabe un mensaje."; return; }
    const ext = (_blob.type.indexOf("mp4") >= 0) ? "m4a" : "webm";
    const arch = new File([_blob], "comentario-vulpo." + ext, { type: _blob.type });
    if (navigator.canShare && navigator.canShare({ files: [arch] })) {
      navigator.share({ files: [arch], text: mensaje("") })
        .then(function () { st.textContent = "¡Gracias!"; })
        .catch(function () { descargar(arch, st); });
      return;
    }
    descargar(arch, st);
  }

  // En computador no hay hoja de compartir: se descarga y se dice qué hacer, en vez
  // de dejar un botón que aparenta funcionar y no hace nada.
  function descargar(arch, st) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(_blob);
    a.download = arch.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    st.textContent = "Se descargó el audio. Adjúntelo por WhatsApp al +56 9 7668 4967.";
  }

  return R;
})();
