// Elroi Aviation Consult — interactions and motion.
// No third-party calls and no inline handlers, so the strict CSP holds.
(function () {
  "use strict";

  var doc = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Smooth scroll (Lenis) ---------- */
  var lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new window.Lenis({ autoRaf: true, lerp: 0.09, anchors: { offset: -72 } });
  }

  /* ---------- Header: hide on scroll down, show on scroll up ---------- */
  var header = $(".site-header");
  var lastY = window.scrollY;

  /* ---------- Mobile nav ---------- */
  var toggle = $(".nav-toggle");
  var nav = $("#site-nav");
  var setNav = function (open) {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
    if (lenis) { open ? lenis.stop() : lenis.start(); }
  };
  if (toggle && nav) {
    toggle.addEventListener("click", function () { setNav(toggle.getAttribute("aria-expanded") !== "true"); });
    nav.addEventListener("click", function (e) { if (e.target.tagName === "A") setNav(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setNav(false); });
  }

  /* ---------- Reveal on scroll, staggered within each group ---------- */
  var revealEls = $$("[data-reveal]");
  revealEls.forEach(function (el) {
    var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.hasAttribute("data-reveal"); });
    el.style.setProperty("--i", String(Math.max(0, sibs.indexOf(el))));
  });
  if ("IntersectionObserver" in window && !reduced) {
    // A fully clipped element never reports as intersecting, so masked
    // headings are watched through a proxy: their parent element.
    var proxies = new Map();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        (proxies.get(en.target) || [en.target]).forEach(function (el) { el.classList.add("is-in"); });
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0 });
    revealEls.forEach(function (el) {
      if (el.getAttribute("data-reveal") === "mask") {
        var host = el.parentNode;
        if (!proxies.has(host)) { proxies.set(host, []); io.observe(host); }
        proxies.get(host).push(el);
      } else {
        io.observe(el);
      }
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Schematic: live meter, pause when off screen ---------- */
  var heroSvg = $("#schematic");
  var meters = [];
  var litres = 4820;
  var fmt = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " L"; };

  /* The diagram lives in the Tank-to-wing section */
  var stageSvg = heroSvg;
  $$("[data-meter]").forEach(function (m) { meters.push(m); });
  if (!reduced) {
    setInterval(function () {
      litres += 7 + Math.floor(Math.random() * 6);
      var t = fmt(litres);
      meters.forEach(function (m) { m.textContent = t; });
    }, 90);
  } else {
    meters.forEach(function (m) { m.textContent = fmt(litres); });
  }

  [stageSvg].forEach(function (svg) {
    if (!svg || !svg.pauseAnimations) return;
    if (reduced) { svg.pauseAnimations(); return; }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        en[0].isIntersecting ? svg.unpauseAnimations() : svg.pauseAnimations();
      }).observe(svg);
    }
  });

  /* ---------- Tank-to-wing tabs + camera zoom on the diagram ---------- */
  // Focus boxes: [centre x, centre y, height]; width follows the stage's aspect ratio
  var focusBoxes = {
    storage: [215, 268, 345],
    sample: [505, 322, 216],
    filter: [655, 302, 262],
    meter: [860, 322, 216],
    wing: [1060, 292, 286]
  };
  // Width follows the stage's on-screen shape: wide on desktop, 4:3 on phones
  var views = {};
  var buildViews = function () {
    var r = stageSvg ? stageSvg.getBoundingClientRect() : null;
    var aspect = r && r.height ? r.width / r.height : 1200 / 430;
    Object.keys(focusBoxes).forEach(function (k) {
      var b = focusBoxes[k];
      var h = b[2] * (aspect < 1.8 && k !== "storage" ? 0.9 : 1), w = h * aspect;
      var x = Math.max(0, Math.min(1200 - w, b[0] - w / 2));
      var bottom = b[1] + b[2] / 2;          // keep the equipment labels in frame
      views[k] = [x, bottom - h, w, h];
    });
  };
  buildViews();
  var current = views.storage.slice();
  var anim = null;
  var tweenView = function (target) {
    if (!stageSvg) return;
    if (reduced) { current = target.slice(); stageSvg.setAttribute("viewBox", current.join(" ")); return; }
    var from = current.slice(), start = null, dur = 900;
    if (anim) cancelAnimationFrame(anim);
    var step = function (ts) {
      if (!start) start = ts;
      var t = Math.min(1, (ts - start) / dur);
      var e = 1 - Math.pow(1 - t, 4);
      current = from.map(function (v, i) { return v + (target[i] - v) * e; });
      stageSvg.setAttribute("viewBox", current.map(function (v) { return v.toFixed(2); }).join(" "));
      if (t < 1) anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
  };
  var focusPart = function (name) {
    if (!stageSvg) return;
    activeStage = views[name] ? name : "storage";
    $$(".part", stageSvg).forEach(function (p) { p.classList.toggle("is-dim", p.getAttribute("data-part") !== name); });
    tweenView(views[name] || views.storage);
  };
  if (stageSvg) {
    stageSvg.setAttribute("viewBox", current.join(" "));
    stageSvg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    focusPart("storage");
  }

  var activeStage = "storage";
  window.addEventListener("resize", function () {
    buildViews(); current = views[activeStage].slice();
    if (stageSvg) stageSvg.setAttribute("viewBox", current.join(" "));
  });

  var chain = $("[data-chain]");
  if (chain) {
    // start loading the stage photos just before the section arrives
    if ("IntersectionObserver" in window) {
      var pre = new IntersectionObserver(function (en) {
        if (!en[0].isIntersecting) return;
        $$(".panel-photo img", chain).forEach(function (img) { img.loading = "eager"; });
        pre.disconnect();
      }, { rootMargin: "600px 0px" });
      pre.observe(chain);
    }
    var tabs = $$('[role="tab"]', chain);
    var select = function (tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (!panel) return;
        panel.hidden = !on;
        if (on) {
          panel.classList.remove("is-entering");
          void panel.offsetWidth;
          panel.classList.add("is-entering");
        }
      });
      focusPart(tab.getAttribute("data-focus"));
      if (focus) tab.focus();
    };
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { select(tab, false); });
      tab.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") next = tabs[(i + 1) % tabs.length];
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === "Home") next = tabs[0];
        if (e.key === "End") next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); select(next, true); }
      });
    });
  }

  /* ---------- Spotlight on "Who we serve" cards ---------- */
  if (finePointer) {
    $$("[data-spotlight] > div").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--x", (e.clientX - r.left) + "px");
        card.style.setProperty("--y", (e.clientY - r.top) + "px");
      });
      card.addEventListener("pointerleave", function () {
        card.style.setProperty("--x", "-500px");
        card.style.setProperty("--y", "-500px");
      });
    });
  }

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduced) {
    $$(".magnetic").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = "translate(" + (dx * 0.18).toFixed(1) + "px," + (dy * 0.3).toFixed(1) + "px)";
      });
      btn.addEventListener("pointerleave", function () { btn.style.transform = ""; });
    });
  }

  /* ---------- Mission headline fills word by word ---------- */
  var scrub = $("[data-scrub]");
  var words = [];
  if (scrub && !reduced) {
    var text = scrub.textContent.trim();
    scrub.setAttribute("aria-label", text);
    scrub.textContent = "";
    text.split(/\s+/).forEach(function (w, i, arr) {
      var s = document.createElement("span");
      s.className = "w";
      s.setAttribute("aria-hidden", "true");
      s.textContent = w;
      scrub.appendChild(s);
      if (i < arr.length - 1) scrub.appendChild(document.createTextNode(" "));
      words.push(s);
    });
  }

  /* ---------- Approach progress line ---------- */
  var progressWrap = $("[data-progress]");

  var heroImg = $(".hero-media picture");

  /* ---------- One scroll loop for everything scroll-linked ---------- */
  var ticking = false;
  var onScroll = function () {
    var y = window.scrollY;
    var vh = window.innerHeight;
    if (header) {
      header.classList.toggle("is-scrolled", y > 8);
      var navOpen = nav && nav.classList.contains("is-open");
      header.classList.toggle("is-hidden", !navOpen && y > 300 && y > lastY + 2);
      if (y < lastY - 2) header.classList.remove("is-hidden");
    }
    lastY = y;

    if (heroImg && !reduced && y < vh * 1.2) {
      heroImg.style.setProperty("--hero-shift", (y * 0.25).toFixed(1) + "px");
    }

    if (words.length) {
      var r = scrub.getBoundingClientRect();
      var p = (vh * 0.85 - r.top) / (vh * 0.55);
      var on = Math.round(Math.max(0, Math.min(1, p)) * words.length);
      words.forEach(function (w, i) { w.classList.toggle("on", i < on); });
    }

    if (progressWrap) {
      var pr = progressWrap.getBoundingClientRect();
      var pp = (vh * 0.8 - pr.top) / (vh * 0.5);
      progressWrap.style.setProperty("--p", String(Math.max(0, Math.min(1, pp)).toFixed(3)));
    }
    ticking = false;
  };
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- Footer year ---------- */
  var yEl = $("[data-year]");
  if (yEl) yEl.textContent = String(new Date().getFullYear());
})();
