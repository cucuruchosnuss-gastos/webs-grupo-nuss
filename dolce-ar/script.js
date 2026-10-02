/* ============================================================
   DOLCE PASTA — interacciones
   ============================================================ */
(function () {
  "use strict";

  /* ---- Año footer ---- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ---- Nav: fondo al hacer scroll ---- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 24) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Menú móvil ---- */
  var toggle = document.getElementById("navToggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }
  document.querySelectorAll("#navLinks a").forEach(function (a) {
    a.addEventListener("click", function () { nav.classList.remove("open"); });
  });

  /* ---- Reveal al scroll (IntersectionObserver) ---- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll(".reveal, .reveal-scale");
  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---- Contadores animados ---- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var dur = 1400, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(target * eased);
      el.textContent = val.toLocaleString("es-AR");
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString("es-AR");
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll("[data-count]");
  if (reduce || !("IntersectionObserver" in window)) {
    counters.forEach(function (el) {
      el.textContent = parseInt(el.getAttribute("data-count"), 10).toLocaleString("es-AR");
    });
  } else {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); co.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* ---- Variantes de producto ---- */
  document.querySelectorAll("[data-variants]").forEach(function (group) {
    var card = group.closest(".prod-row, .prod-card");
    if (!card) return;
    group.querySelectorAll(".variant-pill").forEach(function (pill) {
      pill.addEventListener("click", function () {
        group.querySelectorAll(".variant-pill").forEach(function (p) { p.classList.remove("active"); });
        pill.classList.add("active");
        ["d", "h", "u", "p"].forEach(function (key) {
          var val = pill.getAttribute("data-" + key);
          if (val == null) return;
          var cell = card.querySelector('[data-spec="' + key + '"]');
          if (cell) {
            cell.style.opacity = "0";
            setTimeout(function () { cell.textContent = val; cell.style.opacity = "1"; }, 120);
          }
        });
        var desc = pill.getAttribute("data-desc");
        if (desc) {
          var sub = card.querySelector(".prod-sub");
          if (sub) {
            sub.style.transition = "opacity .2s";
            sub.style.opacity = "0";
            setTimeout(function () { sub.textContent = desc; sub.style.opacity = "1"; }, 120);
          }
        }
      });
    });
  });
  // transición suave de specs
  document.querySelectorAll(".spec-row .v[data-spec]").forEach(function (c) {
    c.style.transition = "opacity .2s";
  });

  /* ---- FAQ acordeón ---- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");
    q.addEventListener("click", function () {
      var open = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function (other) {
        if (other !== item) { other.classList.remove("open"); other.querySelector(".faq-a").style.maxHeight = null; }
      });
      if (open) { item.classList.remove("open"); a.style.maxHeight = null; }
      else { item.classList.add("open"); a.style.maxHeight = a.scrollHeight + "px"; }
    });
  });

  /* ---- Carrusel de clientes ---- */
  document.querySelectorAll(".cl").forEach(function (cl) {
    var track = cl.querySelector(".cl-track");
    var slides = cl.querySelectorAll(".cl-slide");
    var dotsWrap = cl.querySelector(".cl-dots");
    var n = slides.length;
    if (!track || n === 0) return;
    var i = 0, timer = null;
    for (var k = 0; k < n; k++) {
      (function (idx) {
        var b = document.createElement("button");
        b.className = "cl-dot" + (idx === 0 ? " active" : "");
        b.setAttribute("aria-label", "Ir a la foto " + (idx + 1));
        b.addEventListener("click", function () { go(idx); restart(); });
        dotsWrap.appendChild(b);
      })(k);
    }
    var dots = dotsWrap.querySelectorAll(".cl-dot");
    function go(idx) {
      i = (idx + n) % n;
      track.style.transform = "translateX(-" + (i * 100) + "%)";
      dots.forEach(function (d, di) { d.classList.toggle("active", di === i); });
    }
    function next() { go(i + 1); }
    function prev() { go(i - 1); }
    function restart() { if (timer) clearInterval(timer); timer = setInterval(next, 4200); }
    var nx = cl.querySelector(".cl-arrow.next"), pv = cl.querySelector(".cl-arrow.prev");
    if (nx) nx.addEventListener("click", function () { next(); restart(); });
    if (pv) pv.addEventListener("click", function () { prev(); restart(); });
    cl.addEventListener("mouseenter", function () { if (timer) clearInterval(timer); });
    cl.addEventListener("mouseleave", restart);
    restart();
  });

  /* ---- Formulario de contacto ---- */
  var form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = "Enviando…"; }
      var data = new FormData(form);
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(data).toString()
      }).then(function (res) {
        if (!res.ok) throw new Error("Error " + res.status);
        form.style.display = "none";
        var ok = document.getElementById("formOk");
        if (ok) ok.style.display = "block";
      }).catch(function () {
        if (btn) { btn.disabled = false; btn.textContent = "Enviar mensaje"; }
        alert("No pudimos enviar el mensaje. Probá de nuevo o escribinos por WhatsApp.");
      });
    });
  }

  /* ---- Datos de esta web para el cuestionario de WhatsApp ---- */
  var QZ_SITIO = "dolcepasta.com.ar";
  var QZ_PRODUCTOS = ["Barquillo", "Cucuruchón", "Capelina", "Oblea", "Soft", "Cubanón", "Bocón", "Vaso 125", "Vaso 90", "Cono 0", "Vaso 0"];

  /* ---- Cuestionario antes de WhatsApp ----
     Todos los links a wa.me/543513125236 abren primero este cuestionario.
     El href original queda en el HTML: si este JS falla, el link va directo a WhatsApp. */
  var WA_NUM = "543513125236";
  var waLinks = document.querySelectorAll('a[href^="https://wa.me/' + WA_NUM + '"]');
  if (waLinks.length && typeof HTMLDialogElement === "function") {
    var PROVINCIAS = ["Buenos Aires", "Catamarca", "Chaco", "Chubut", "Ciudad Autónoma de Buenos Aires", "Córdoba", "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán"];
    var LOCALES = { "1": "1 local", "2-4": "2 a 4 locales", "5+": "5 o más locales" };
    var esc = function (t) { return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); };
    var opts = function (name, values, labels) {
      return values.map(function (v, i) {
        return '<label class="qz-opt"><input type="radio" name="' + name + '" value="' + esc(v) + '" /><span>' + esc(labels ? labels[i] : v) + "</span></label>";
      }).join("");
    };

    var dlg = document.createElement("dialog");
    dlg.className = "qz";
    dlg.setAttribute("aria-labelledby", "qz-title");
    dlg.setAttribute("aria-describedby", "qz-desc");
    dlg.innerHTML =
      '<form class="qz-panel" novalidate>' +
        '<div class="qz-head">' +
          '<h2 class="qz-title" id="qz-title">Antes de abrir WhatsApp</h2>' +
          '<button type="button" class="qz-close" aria-label="Cerrar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18" stroke-linecap="round"/></svg></button>' +
        "</div>" +
        '<p class="qz-desc" id="qz-desc">Así te atendemos más rápido y te derivamos a quien corresponda.</p>' +
        '<label class="qz-hp" aria-hidden="true">No completar: <input name="bot-field" tabindex="-1" autocomplete="off" /></label>' +
        '<fieldset class="qz-field" data-field="tipo" aria-describedby="qz-err-tipo"><legend>¿Quién sos?</legend>' +
          '<div class="qz-opts qz-opts--big">' + opts("tipo", ["Distribuidor", "Heladería", "Otro"]) + "</div>" +
          '<p class="qz-err" id="qz-err-tipo"></p></fieldset>' +
        '<fieldset class="qz-field" data-field="locales" aria-describedby="qz-err-locales" hidden><legend>¿Cuántos locales tenés?</legend>' +
          '<div class="qz-opts">' + opts("locales", Object.keys(LOCALES), ["1", "2 a 4", "5 o más"]) + "</div>" +
          '<p class="qz-err" id="qz-err-locales"></p></fieldset>' +
        '<div class="qz-field" data-field="nombre"><label for="qz-nombre">Nombre y apellido</label>' +
          '<input id="qz-nombre" name="nombre" type="text" autocomplete="name" aria-describedby="qz-err-nombre" />' +
          '<p class="qz-err" id="qz-err-nombre"></p></div>' +
        '<div class="qz-field" data-field="negocio"><label for="qz-negocio">Nombre del negocio <span class="qz-opcional" hidden>(opcional)</span></label>' +
          '<input id="qz-negocio" name="negocio" type="text" autocomplete="organization" aria-describedby="qz-err-negocio" />' +
          '<p class="qz-err" id="qz-err-negocio"></p></div>' +
        '<div class="qz-row">' +
          '<div class="qz-field" data-field="provincia"><label for="qz-provincia">Provincia</label>' +
            '<select id="qz-provincia" name="provincia" aria-describedby="qz-err-provincia"><option value="">Elegí una opción</option>' +
            PROVINCIAS.concat(["Otro país"]).map(function (p) { return '<option value="' + esc(p) + '">' + esc(p) + "</option>"; }).join("") +
            "</select>" +
            '<p class="qz-err" id="qz-err-provincia"></p></div>' +
          '<div class="qz-field" data-field="localidad"><label for="qz-localidad">Localidad</label>' +
            '<input id="qz-localidad" name="localidad" type="text" autocomplete="address-level2" aria-describedby="qz-err-localidad" />' +
            '<p class="qz-err" id="qz-err-localidad"></p></div>' +
        "</div>" +
        '<fieldset class="qz-field" data-field="productos"><legend>¿Qué productos te interesan? <span class="qz-opcional">(opcional)</span></legend>' +
          '<div class="qz-opts qz-opts--pills">' + QZ_PRODUCTOS.map(function (p) {
            return '<label class="qz-opt"><input type="checkbox" name="productos" value="' + esc(p) + '" /><span>' + esc(p) + "</span></label>";
          }).join("") + "</div></fieldset>" +
        '<div class="qz-field" data-field="consulta"><label for="qz-consulta">Consulta <span class="qz-opcional">(opcional)</span></label>' +
          '<textarea id="qz-consulta" name="consulta" maxlength="500" rows="3" aria-describedby="qz-count qz-err-consulta"></textarea>' +
          '<p class="qz-count" id="qz-count">0 / 500</p>' +
          '<p class="qz-err" id="qz-err-consulta"></p></div>' +
        '<button type="submit" class="btn btn-gold btn-lg qz-submit">' +
          '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Z"/></svg>' +
          "Abrir WhatsApp</button>" +
      "</form>";
    document.body.appendChild(dlg);

    var qf = dlg.querySelector("form");
    var fLocales = dlg.querySelector('[data-field="locales"]');
    var opcionalNegocio = dlg.querySelector('[data-field="negocio"] .qz-opcional');
    var consulta = qf.elements.consulta;
    var count = dlg.querySelector(".qz-count");
    var lastTrigger = null;

    var val = function (name) { return (qf.elements[name].value || "").replace(/\s+/g, " ").trim(); };
    var checked = function (name) { var el = qf.querySelector('input[name="' + name + '"]:checked'); return el ? el.value : ""; };
    var productos = function () {
      return Array.prototype.map.call(qf.querySelectorAll('input[name="productos"]:checked'), function (c) { return c.value; });
    };
    function setError(name, msg) {
      var box = dlg.querySelector('[data-field="' + name + '"]');
      var p = dlg.querySelector("#qz-err-" + name);
      if (!box) return;
      if (p) p.textContent = msg || "";
      if (box) box.classList.toggle("has-error", !!msg);
      box.querySelectorAll("input:not([type=radio]):not([type=checkbox]), select, textarea").forEach(function (el) {
        if (msg) el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid");
      });
    }
    function syncTipo() {
      var tipo = checked("tipo");
      fLocales.hidden = tipo !== "Heladería";
      opcionalNegocio.hidden = tipo !== "Otro";
      if (fLocales.hidden) setError("locales", "");
      if (tipo === "Otro") setError("negocio", "");
    }
    function validate() {
      var tipo = checked("tipo"), errs = [];
      var need = function (name, ok, msg) { setError(name, ok ? "" : msg); if (!ok) errs.push(name); };
      need("tipo", !!tipo, "Elegí una opción.");
      if (tipo === "Heladería") need("locales", !!checked("locales"), "Contanos cuántos locales tenés.");
      need("nombre", !!val("nombre"), "Escribí tu nombre y apellido.");
      if (tipo !== "Otro") need("negocio", !!val("negocio"), "Escribí el nombre del negocio.");
      need("provincia", !!val("provincia"), "Elegí tu provincia.");
      need("localidad", !!val("localidad"), "Escribí tu localidad.");
      need("consulta", consulta.value.length <= 500, "Máximo 500 caracteres.");
      return errs;
    }
    function buildText() {
      var tipo = checked("tipo");
      var parts = [tipo.toUpperCase()];
      if (tipo === "Heladería") parts.push(LOCALES[checked("locales")]);
      parts.push(val("nombre"));
      if (val("negocio")) parts.push(val("negocio"));
      parts.push(val("localidad") + ", " + val("provincia"));
      if (productos().length) parts.push("Le interesa: " + productos().join(", "));
      if (val("consulta")) parts.push("Consulta: " + val("consulta"));
      return parts.join(" · ") + " (desde " + QZ_SITIO + ")";
    }
    function enviarNetlify() {
      var tipo = checked("tipo");
      var data = new URLSearchParams();
      data.append("form-name", "consulta-whatsapp");
      data.append("bot-field", qf.elements["bot-field"].value);
      data.append("tipo", tipo);
      data.append("locales", tipo === "Heladería" ? LOCALES[checked("locales")] : "");
      data.append("nombre", val("nombre"));
      data.append("negocio", val("negocio"));
      data.append("provincia", val("provincia"));
      data.append("localidad", val("localidad"));
      data.append("productos", productos().join(", "));
      data.append("consulta", val("consulta"));
      try {
        fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: data.toString(),
          keepalive: true
        }).catch(function () {});
      } catch (e) {}
    }

    function openQuiz(trigger) {
      lastTrigger = trigger;
      nav.classList.remove("open");
      document.documentElement.classList.add("qz-lock");
      dlg.showModal();
      var first = qf.querySelector('input[name="tipo"]:checked') || qf.querySelector('input[name="tipo"]');
      first.focus();
    }
    function closeQuiz() { if (dlg.open) dlg.close(); }
    dlg.addEventListener("close", function () {
      document.documentElement.classList.remove("qz-lock");
      if (lastTrigger && lastTrigger.focus) lastTrigger.focus();
    });

    waLinks.forEach(function (a) {
      a.addEventListener("click", function (e) {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        openQuiz(a);
      });
    });

    dlg.querySelector(".qz-close").addEventListener("click", closeQuiz);
    // Tocar afuera (el fondo es el propio <dialog>; el panel lo cubre por dentro)
    dlg.addEventListener("click", function (e) { if (e.target === dlg) closeQuiz(); });
    // El foco no sale del cuestionario
    dlg.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var f = Array.prototype.filter.call(dlg.querySelectorAll("button, input:not([tabindex='-1']), select, textarea"), function (el) {
        return !el.disabled && el.getClientRects().length && !(el.type === "radio" && !el.checked && qf.querySelector('input[name="' + el.name + '"]:checked'));
      });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    qf.addEventListener("change", function (e) {
      if (e.target.name === "tipo") { syncTipo(); setError("tipo", ""); }
      else if (e.target.name) setError(e.target.name, "");
    });
    qf.addEventListener("input", function (e) {
      if (e.target.name && e.target.name !== "productos") setError(e.target.name, "");
      if (e.target === consulta) count.textContent = consulta.value.length + " / 500";
    });

    qf.addEventListener("submit", function (e) {
      e.preventDefault();
      var errs = validate();
      if (errs.length) {
        var box = dlg.querySelector('[data-field="' + errs[0] + '"]');
        var el = box.querySelector("input:checked, input:not([type=hidden]), select, textarea");
        if (el) el.focus();
        return;
      }
      var url = "https://wa.me/" + WA_NUM + "?text=" + encodeURIComponent(buildText());
      enviarNetlify();
      // En el mismo clic: si se abre en otra pestaña se usa esa; si el navegador la bloquea, en esta.
      var w = window.open(url, "_blank");
      if (w) { try { w.opener = null; } catch (err) {} }
      else window.location.href = url;
      closeQuiz();
    });
  }
})();
