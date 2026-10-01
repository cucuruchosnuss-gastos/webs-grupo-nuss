/* ============================================================
   DOLCE PASTA PARAGUAY — interacciones
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
    var card = group.closest(".prod-card");
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
        alert("No pudimos enviar el mensaje. Proba de nuevo o escribinos por WhatsApp.");
      });
    });
  }
})();
