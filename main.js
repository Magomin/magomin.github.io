/* Portfolio — aurora, parallax, scroll-reveal, scroll-spy. Native only, no deps. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var RAY_ELS = []; // {el, base opacity, lc: left %} — populated by buildAurora, used by the mouse-reactive handler

  /* ---- Aurora (ported verbatim from the Claude Design source) ---- */
  var RAYS = [
    { l: "1%",  c: "#a85607", w: 130, b: 40, o: 0.55, d: 15,   delay: -2 },
    { l: "7%",  c: "#ff7a0a", w: 70,  b: 20, o: 0.9,  d: 11,   delay: -6 },
    { l: "13%", c: "#ff9500", w: 44,  b: 13, o: 1,    d: 9,    delay: -1 },
    { l: "19%", c: "#ffac0a", w: 84,  b: 30, o: 0.78, d: 14,   delay: -8 },
    { l: "26%", c: "#ffbe3d", w: 40,  b: 12, o: 0.95, d: 10,   delay: -3 },
    { l: "33%", c: "#ffcd7d", w: 70,  b: 26, o: 0.72, d: 12,   delay: -5 },
    { l: "40%", c: "#ffe6c0", w: 42,  b: 14, o: 0.9,  d: 8.5,  delay: -7 },
    { l: "47%", c: "#ffffff", w: 60,  b: 18, o: 1,    d: 9.5,  delay: -2.5 },
    { l: "53%", c: "#eef3ff", w: 42,  b: 14, o: 0.92, d: 11,   delay: -6.5 },
    { l: "60%", c: "#c2d4ff", w: 70,  b: 26, o: 0.74, d: 13,   delay: -1.5 },
    { l: "67%", c: "#7da4ff", w: 42,  b: 13, o: 0.95, d: 10.5, delay: -4.5 },
    { l: "74%", c: "#3d84ff", w: 78,  b: 28, o: 0.85, d: 12.5, delay: -9 },
    { l: "81%", c: "#0175ff", w: 44,  b: 14, o: 0.92, d: 9,    delay: -3.5 },
    { l: "88%", c: "#2f5bd6", w: 84,  b: 32, o: 0.66, d: 14,   delay: -7.5 },
    { l: "95%", c: "#232f8e", w: 130, b: 42, o: 0.5,  d: 15.5, delay: -2 }
  ];

  function el(tag, style) {
    var d = document.createElement(tag);
    d.setAttribute("aria-hidden", "true");
    Object.assign(d.style, style);
    return d;
  }

  function buildAurora() {
    var root = el("div", {
      position: "absolute", inset: "0", overflow: "hidden", zIndex: "0",
      background: "radial-gradient(150% 120% at 50% 122%, #1c1408 0%, #0a0a0e 40%, #050507 72%, #040406 100%)"
    });

    // starfield
    root.appendChild(el("div", {
      position: "absolute", inset: "0", opacity: "0.8",
      backgroundImage: "radial-gradient(1.2px 1.2px at 12% 14%, rgba(255,255,255,.7), transparent), radial-gradient(1px 1px at 34% 9%, rgba(255,255,255,.45), transparent), radial-gradient(1.2px 1.2px at 58% 17%, rgba(255,255,255,.6), transparent), radial-gradient(1px 1px at 78% 8%, rgba(255,255,255,.4), transparent), radial-gradient(1px 1px at 88% 20%, rgba(255,255,255,.5), transparent), radial-gradient(1px 1px at 22% 26%, rgba(255,255,255,.35), transparent), radial-gradient(1px 1px at 68% 28%, rgba(255,255,255,.35), transparent), radial-gradient(1px 1px at 46% 6%, rgba(255,255,255,.4), transparent)",
      maskImage: "linear-gradient(to bottom, #000 0%, transparent 48%)",
      WebkitMaskImage: "linear-gradient(to bottom, #000 0%, transparent 48%)"
    }));

    // ray group — static container; each ray inside sways on its own (see raySway below).
    var group = el("div", { position: "absolute", inset: "0" });
    group.className = "aurora-group";
    RAYS.forEach(function (r, i) {
      // Outer wrap = mouse-boost target (transform + brightness). Inner = the visible ray, which
      // sways on its own via a per-ray CSS animation. Nesting keeps the two transforms from clashing.
      var wrap = el("div", {
        position: "absolute", left: r.l, bottom: "-4%", width: r.w + "px", height: "112%",
        transformOrigin: "bottom center", opacity: r.o // per-ray base opacity; inner fades on top of this
      });
      wrap.className = "aurora-ray";
      var inner = el("div", {
        position: "absolute", inset: "0", transformOrigin: "bottom center",
        background: "linear-gradient(to top, " + r.c + " 0%, " + r.c + "dd 18%, " + r.c + "88 44%, " + r.c + "22 68%, " + r.c + "00 90%)",
        mixBlendMode: "screen" // opacity is animated by raySway (near-0 at the breath's low, full at the peak)
      });
      inner.className = "aurora-ray-inner";
      inner.style.setProperty("--b", r.b + "px");
      inner.style.filter = "blur(var(--b))";
      // Clean travelling WAVE: same duration, delay spread EVENLY (dur / N) and NO `alternate`, so the
      // bright pulse sweeps continuously right→left and loops seamlessly (keyframe 0% == 100%, both faded).
      // Flip the sign of the delay to reverse the sweep direction (− = one way, + = the other).
      inner.style.animation = reduce ? "none" : ("raySway 5.5s ease-in-out " + (-i * 5.5 / RAYS.length) + "s infinite");
      wrap.appendChild(inner);
      RAY_ELS.push({ el: wrap, base: r.o, lc: parseFloat(r.l) });
      group.appendChild(wrap);
    });
    root.appendChild(group);

    // bloom
    root.appendChild(el("div", {
      position: "absolute", left: "50%", bottom: "6%", transform: "translateX(-50%)",
      width: "min(560px, 62%)", height: "300px",
      background: "radial-gradient(ellipse at 50% 100%, rgba(255,255,255,1) 0%, rgba(255,240,210,0.95) 8%, rgba(255,190,120,0.7) 22%, rgba(255,120,60,0.28) 45%, transparent 74%)",
      filter: "blur(2px)", mixBlendMode: "screen",
      animation: reduce ? "none" : "auroraPulse 9s ease-in-out infinite"
    }));

    // horizon glow
    root.appendChild(el("div", {
      position: "absolute", left: "50%", bottom: "4%", transform: "translateX(-50%)",
      width: "120%", height: "220px",
      background: "radial-gradient(ellipse at 50% 100%, rgba(255,175,90,0.5) 0%, rgba(255,120,70,0.18) 34%, rgba(90,120,255,0.12) 60%, transparent 80%)",
      filter: "blur(10px)", mixBlendMode: "screen"
    }));

    // horizon arc
    root.appendChild(el("div", {
      position: "absolute", left: "50%", bottom: "-62%", transform: "translateX(-50%)",
      width: "185%", height: "126%", borderRadius: "50%",
      borderTop: "2px solid rgba(255,244,228,0.98)",
      boxShadow: "0 -3px 120px 12px rgba(255,190,130,0.4), 0 -1px 40px 2px rgba(255,255,255,0.35), inset 0 4px 60px rgba(255,200,140,0.28)",
      background: "radial-gradient(135% 64% at 50% 0%, rgba(6,7,10,0) 0%, rgba(5,6,9,0.6) 52%, #040406 100%)"
    }));

    // vignette
    root.appendChild(el("div", {
      position: "absolute", inset: "0",
      background: "radial-gradient(120% 90% at 50% 40%, transparent 40%, rgba(4,4,6,0.5) 100%), linear-gradient(to bottom, rgba(4,4,6,0.55) 0%, rgba(4,4,6,0) 30%, rgba(4,4,6,0) 78%, rgba(4,4,6,0.3) 100%)"
    }));

    return root;
  }

  // Each init block is wrapped so one failure never halts the rest (reveal safety net below still runs).
  var hero = document.getElementById("top");
  var para = hero && hero.querySelector(".hero-aurora");

  /* ---- Aurora ---- */
  try {
    if (para) para.appendChild(buildAurora());
    // PERF: pause the 15 ray animations whenever the hero scrolls out of view.
    if (para && !reduce && "IntersectionObserver" in window) {
      new IntersectionObserver(function (ents) {
        para.classList.toggle("aura-off", !ents[0].isIntersecting);
      }, { rootMargin: "80px" }).observe(hero);
    }
  } catch (e) { /* aurora is decorative; ignore */ }

  /* ---- Hero aurora reacts to the cursor: rays near the mouse brighten, come forward, shimmer ---- */
  try {
    if (hero && RAY_ELS.length && !reduce) {
      var pctX = 50, pending = false;
      var TH = 17; // reach in % of hero width — how far the effect spreads around the cursor
      function apply() {
        pending = false;
        for (var i = 0; i < RAY_ELS.length; i++) {
          var ray = RAY_ELS[i];
          var boost = 1 - Math.abs(pctX - ray.lc) / TH;
          if (boost < 0) boost = 0;
          ray.el.style.filter = boost ? "brightness(" + (1 + boost * 1.15) + ")" : "";
          ray.el.style.transform = boost
            ? "scaleX(" + (1 + boost * 0.55) + ") scaleY(" + (1 + boost * 0.12) + ") translateY(" + (-boost * 3) + "%)"
            : "";
        }
      }
      hero.addEventListener("mousemove", function (e) {
        var r = hero.getBoundingClientRect();
        pctX = ((e.clientX - r.left) / r.width) * 100;
        if (pending) return;
        pending = true;
        requestAnimationFrame(apply);
      }, { passive: true });
      hero.addEventListener("mouseleave", function () {
        for (var i = 0; i < RAY_ELS.length; i++) {
          RAY_ELS[i].el.style.filter = "";
          RAY_ELS[i].el.style.transform = "";
        }
      });
    }
  } catch (e) { /* aurora interactivity is progressive enhancement */ }

  /* ---- Icons (mark decorative SVGs hidden from AT) ---- */
  function paint() {
    if (window.lucide) window.lucide.createIcons({ attrs: { "aria-hidden": "true", focusable: "false" } });
  }
  try {
    paint();
    [120, 350, 800].forEach(function (t) { setTimeout(paint, t); });
  } catch (e) { /* icons optional */ }

  /* ---- Scroll-reveal with per-group stagger ---- */
  function revealAll() {
    document.querySelectorAll(".reveal").forEach(function (n) { n.classList.add("in"); });
  }
  try {
    // Language bars animate from 0 only when motion is allowed; otherwise CSS keeps them filled.
    if (!reduce) document.querySelectorAll(".lang-block").forEach(function (b) { b.classList.add("anim"); });
    if ("IntersectionObserver" in window && !reduce) {
      var seen = new WeakMap();
      var ro = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var t = en.target;
          var delay = seen.get(t);
          if (delay != null) t.style.transitionDelay = delay + "ms"; // skill cards omit this → CSS nth-child cascade wins
          t.classList.add("in");
          ro.unobserve(t);
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

      // stagger by index within each containing section (cap 240ms)
      document.querySelectorAll("main section, header").forEach(function (sec) {
        var items = sec.querySelectorAll(".reveal");
        items.forEach(function (it, i) {
          if (it.closest(".skills-col")) return; // handled by the column-group observer below
          seen.set(it, Math.min(i * 60, 240));
          ro.observe(it);
        });
      });
      // Skill cards reveal AS A GROUP the moment their column reaches view — one trigger,
      // consistent CSS nth-child cascade (fixes the ragged per-card timing).
      document.querySelectorAll(".skills-col").forEach(function (col) {
        var co = new IntersectionObserver(function (ents) {
          ents.forEach(function (en) {
            if (!en.isIntersecting) return;
            col.querySelectorAll(".card.reveal").forEach(function (c) { c.classList.add("in"); });
            co.unobserve(col);
          });
        }, { threshold: 0, rootMargin: "0px 0px -18% 0px" });
        co.observe(col);
      });
    } else {
      revealAll();
    }
  } catch (e) { revealAll(); }

  // Safety net: never leave .reveal invisible if init failed or IO is unsupported.
  if (!("IntersectionObserver" in window)) revealAll();
  setTimeout(revealAll, 5000);

  /* ---- Hero staggered reveal at load ---- */
  try {
    if (hero) requestAnimationFrame(function () { hero.classList.add("hero-in"); });
  } catch (e) { /* hero-rise forced visible by reduced-motion/noscript fallbacks */ }
  // Safety net: force hero visible if the rAF above never ran.
  setTimeout(function () { if (hero) hero.classList.add("hero-in"); }, 5000);

  /* ---- Nav scroll-spy + sliding pill ---- */
  try {
    var links = {};
    document.querySelectorAll(".nav-link").forEach(function (a) {
      links[a.getAttribute("href").slice(1)] = a;
    });
    var navCenter = document.getElementById("nav-center");
    var pill = navCenter && navCenter.querySelector(".nav-pill");
    var pillPlaced = false;
    // Write the active link's box onto the pill. animate=false → snap (suspend transition + reflow).
    // Pill is display:none on mobile (offsetParent null) → skip so it never snaps to a 0-width box.
    function movePill(link, animate) {
      if (!pill || !link || pill.offsetParent === null) return;
      if (!animate) {
        var prev = pill.style.transition;
        pill.style.transition = "none";
        pill.style.transform = "translateX(" + link.offsetLeft + "px)";
        pill.style.width = link.offsetWidth + "px";
        void pill.offsetWidth; // force reflow so the snap lands before transition restores
        pill.style.transition = prev;
      } else {
        pill.style.transform = "translateX(" + link.offsetLeft + "px)";
        pill.style.width = link.offsetWidth + "px";
      }
    }
    function snapToActive() {
      var a = navCenter && navCenter.querySelector(".nav-link.active");
      if (a) movePill(a, false);
    }
    requestAnimationFrame(snapToActive);
    window.addEventListener("resize", snapToActive);
    var sections = ["about", "work", "projects", "contact"]
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);
    if ("IntersectionObserver" in window) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          Object.keys(links).forEach(function (k) { links[k].classList.remove("active"); });
          var a = links[en.target.id];
          if (a) { a.classList.add("active"); movePill(a, pillPlaced); pillPlaced = true; }
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      sections.forEach(function (s) { spy.observe(s); });
    }
  } catch (e) { /* scroll-spy is cosmetic */ }

  /* ---- Mobile nav toggle ---- */
  try {
    var nav = document.querySelector(".nav");
    var toggle = nav && nav.querySelector(".nav-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      nav.querySelectorAll(".nav-link").forEach(function (a) {
        a.addEventListener("click", function () {
          nav.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
        });
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && nav.classList.contains("open")) {
          nav.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
          toggle.focus();
        }
      });
    }
  } catch (e) { /* nav still usable via CTA/anchors */ }

  /* ---- Videos: respect reduced motion; pause off-screen (same pattern as the aurora .aura-off) ---- */
  try {
    if (reduce) {
      document.querySelectorAll("video").forEach(function (v) {
        v.removeAttribute("autoplay");
        v.pause();
      });
    } else if ("IntersectionObserver" in window) {
      var vidIO = new IntersectionObserver(function (ents) {
        ents.forEach(function (en) {
          var v = en.target;
          if (en.isIntersecting) {
            var p = v.play();
            if (p && p.catch) p.catch(function () {}); // autoplay promise can reject
          } else {
            v.pause();
          }
        });
      }, { rootMargin: "100px" });
      document.querySelectorAll(".proj-media video").forEach(function (v) { vidIO.observe(v); });
    }
  } catch (e) { /* video playback is decorative */ }

  /* ---- Project card 3D tilt + glare (mouse only; touch keeps native scroll) ---- */
  try {
    if (!reduce) {
      var TILT_MAX = 8; // peak lean in degrees at the card edges — subtle
      document.querySelectorAll(".t-tilt").forEach(function (tilt) {
        var card = tilt.querySelector(".card");
        if (!card) return;
        function reset() {
          tilt.classList.remove("is-hover");
          card.classList.remove("is-tilting");
          card.style.setProperty("--tilt-rx", "0deg");
          card.style.setProperty("--tilt-ry", "0deg");
        }
        // mousemove (not pointermove) → mouse only, so touch scroll is never blocked.
        tilt.addEventListener("mousemove", function (e) {
          if (tilt.closest(".deck-dragging")) return; // deck drag in progress — tilt yields
          var r = tilt.getBoundingClientRect();
          var px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
          var py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
          tilt.classList.add("is-hover");
          card.classList.add("is-tilting");
          card.style.setProperty("--tilt-ry", ((px - 0.5) * TILT_MAX).toFixed(2) + "deg");
          card.style.setProperty("--tilt-rx", ((0.5 - py) * TILT_MAX).toFixed(2) + "deg");
          card.style.setProperty("--tilt-gx", (px * 100).toFixed(1) + "%");
          card.style.setProperty("--tilt-gy", (py * 100).toFixed(1) + "%");
        }, { passive: true });
        tilt.addEventListener("mouseleave", reset);
      });
    }
  } catch (e) { /* tilt is progressive enhancement */ }

  /* ---- Projects deck (desktop ≥900px): fanned 3D stack over the .proj-list stage ----
     No DOM moves — CSS display:contents flattens .proj-grid, JS only writes data-pos/classes.
     Below 900px (or with JS off) the normal stacked/grid layout stands untouched. */
  try {
    var projList = document.querySelector("#projects .proj-list");
    var deckNav = document.querySelector("#projects .deck-nav");
    var deckSlides = projList ? Array.prototype.slice.call(projList.querySelectorAll(".t-tilt")) : [];
    if (projList && deckNav && deckSlides.length > 1) {
      var deckDots = Array.prototype.slice.call(deckNav.querySelectorAll(".deck-dot"));
      var deckMQ = window.matchMedia("(min-width:900px)");
      var deckActive = 0, deckOn = false, justDragged = false;

      function deckLayout() {
        var n = deckSlides.length;
        deckSlides.forEach(function (s, i) {
          var pos = (((i - deckActive) % n) + n) % n;
          s.setAttribute("data-pos", pos);
          s.classList.toggle("is-active", pos === 0);
          s.classList.toggle("is-behind", pos !== 0);
          // PERF: only the front card's video decodes. Behind cards sit under a
          // brightness filter — compositing a *playing* video through it every frame
          // is what janks the switch. Pause them; play resumes on becoming active.
          var v = s.querySelector("video");
          if (v) { if (pos === 0) v.play().catch(function () {}); else v.pause(); }
        });
        deckDots.forEach(function (d, i) {
          d.setAttribute("aria-current", i === deckActive ? "true" : "false");
        });
      }
      function deckSet(i) {
        var n = deckSlides.length;
        deckActive = ((i % n) + n) % n;
        deckLayout();
      }
      // Stage = tallest slide + fan stagger/shadow slack, so nothing clips.
      function fitStage() {
        if (!deckOn) return;
        var max = 0;
        deckSlides.forEach(function (s) { max = Math.max(max, s.offsetHeight); });
        if (max) projList.style.height = (max + 40) + "px";
      }
      function deckToggle() {
        deckOn = deckMQ.matches;
        if (deckOn) {
          projList.classList.add("deck-on");
          projList.setAttribute("role", "group");
          projList.setAttribute("aria-roledescription", "carousel");
          projList.setAttribute("aria-label", "Projects");
          // absolute slides can dodge the reveal IO — force their cards visible
          deckSlides.forEach(function (s) {
            var c = s.querySelector(".card.reveal");
            if (c) c.classList.add("in");
          });
          deckLayout();
          requestAnimationFrame(fitStage);
        } else {
          projList.classList.remove("deck-on");
          projList.removeAttribute("role");
          projList.removeAttribute("aria-roledescription");
          projList.removeAttribute("aria-label");
          projList.style.height = "";
          deckSlides.forEach(function (s) {
            s.removeAttribute("data-pos");
            s.classList.remove("is-active", "is-behind");
            var v = s.querySelector("video");   // deck off (mobile grid): resume native autoplay
            if (v) v.play().catch(function () {});
          });
        }
      }
      deckToggle();
      if (deckMQ.addEventListener) deckMQ.addEventListener("change", deckToggle);
      else if (deckMQ.addListener) deckMQ.addListener(deckToggle);
      window.addEventListener("resize", fitStage);

      // Arrows + dots
      deckNav.addEventListener("click", function (e) {
        var arrow = e.target.closest(".deck-arrow");
        if (arrow) { deckSet(deckActive + (+arrow.getAttribute("data-dir") || 1)); return; }
        var dot = e.target.closest(".deck-dot");
        if (dot) deckSet(deckDots.indexOf(dot));
      });

      // Click a peeking card → bring it front. Capture beats the Konklue cover <a>;
      // also swallows the click that follows a real drag.
      projList.addEventListener("click", function (e) {
        if (!deckOn) return;
        if (justDragged) { e.preventDefault(); e.stopPropagation(); justDragged = false; return; }
        var s = e.target.closest(".t-tilt");
        if (s && s.classList.contains("is-behind")) { e.preventDefault(); deckSet(deckSlides.indexOf(s)); }
      }, true);

      // Horizontal drag on the front card (mouse only). >8px of travel suppresses the tilt
      // (.deck-dragging — the tilt handler yields); ≥60px advances and swallows the click.
      // Native link/image dragging (Konklue cover <a>, Hexband <img>) would cancel the pointer
      // stream mid-drag — suppress it inside the deck.
      projList.addEventListener("dragstart", function (e) {
        if (deckOn) e.preventDefault();
      });
      var dragX = 0, dragging = false;
      projList.addEventListener("pointerdown", function (e) {
        if (!deckOn || e.pointerType !== "mouse") return;
        var s = e.target.closest(".t-tilt");
        if (!s || !s.classList.contains("is-active")) return;
        dragging = true; dragX = e.clientX;
      });
      window.addEventListener("pointermove", function (e) {
        if (dragging && Math.abs(e.clientX - dragX) > 8) projList.classList.add("deck-dragging");
      });
      window.addEventListener("pointerup", function (e) {
        if (!dragging) return;
        dragging = false;
        projList.classList.remove("deck-dragging");
        var dx = e.clientX - dragX;
        if (Math.abs(dx) >= 60) {
          justDragged = true;
          deckSet(deckActive + (dx < 0 ? 1 : -1));
          setTimeout(function () { justDragged = false; }, 0);
        }
      });

      // ← / → while focus is inside the projects container
      projList.parentNode.addEventListener("keydown", function (e) {
        if (!deckOn) return;
        if (e.key === "ArrowLeft") { deckSet(deckActive - 1); e.preventDefault(); }
        else if (e.key === "ArrowRight") { deckSet(deckActive + 1); e.preventDefault(); }
      });
    }
  } catch (e) { /* deck is progressive enhancement — grid layout stands */ }

  /* ---- Paper Shaders (lazy-loaded from esm.sh, React loaded ONCE) ----
     Same technique the design's GlowBorder uses: isolated React root rendered into a host.
     Reduced-motion or CDN failure → the CSS fallbacks stay. */
  var _libPromise;
  function loadShaders() {
    var CDN = "https://esm.sh/";
    return _libPromise || (_libPromise = Promise.all([
      import(CDN + "react@18.3.1"),
      import(CDN + "react-dom@18.3.1/client"),
      import(CDN + "@paper-design/shaders-react@latest?deps=react@18.3.1,react-dom@18.3.1")
    ]).then(function (m) {
      return { R: m[0].default || m[0], createRoot: m[1].createRoot, shaders: m[2] };
    }));
  }

  // Render `make(lib)`-produced element into `host`, measuring `measureEl` px + resizing.
  // Paper Shaders sizes its canvas from EXPLICIT numeric width/height, not "100%" — feed it px.
  function mountShader(host, measureEl, make, opts) {
    if (!host || reduce) return;
    opts = opts || {};
    var baseSpeed = opts.speed != null ? opts.speed : 1;
    loadShaders().then(function (lib) {
      var root = lib.createRoot(host);
      var lastW = 0, lastH = 0, ready = false, visible = true, hovered = !opts.hoverEl;
      function speed() { return (visible && hovered) ? baseSpeed : 0; } // hoverEl set → only runs while hovered
      function render() {
        var w = measureEl.clientWidth, h = measureEl.clientHeight;
        if (!w || !h) return; // not laid out yet
        lastW = w; lastH = h;
        root.render(make(lib, w, h, speed()));
        if (!ready && opts.onReady) { ready = true; opts.onReady(); }
      }
      if (opts.hoverEl) {
        opts.hoverEl.addEventListener("mouseenter", function () { hovered = true; render(); });
        opts.hoverEl.addEventListener("mouseleave", function () { hovered = false; render(); });
      }
      (function first() {
        if (measureEl.clientWidth > 0 && measureEl.clientHeight > 0) render();
        else requestAnimationFrame(first);
      })();
      new ResizeObserver(function () {
        var w = measureEl.clientWidth, h = measureEl.clientHeight;
        if (!w || !h || (Math.abs(w - lastW) <= 1 && Math.abs(h - lastH) <= 1)) return;
        render();
      }).observe(measureEl);
      // PERF: pause the WebGL rAF loop (speed 0) whenever the card is off-screen.
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (ents) {
          var vis = ents[0].isIntersecting;
          if (vis === visible) return;
          visible = vis; render();
        }, { rootMargin: "150px" }).observe(measureEl);
      }
    }).catch(function () { /* offline / CSP-blocked → CSS fallback stays */ });
  }

  // Contact GrainGradient — measures its own host.
  try {
    var contactHost = document.getElementById("contact-shader");
    if (contactHost) mountShader(contactHost, contactHost, function (lib, w, h, speed) {
      return lib.R.createElement(lib.shaders.GrainGradient, {
        width: w, height: h, minPixelRatio: 1,
        style: { width: "100%", height: "100%", display: "block" },
        colors: ["#ffac0a", "#ffcd7d", "#7da4ff", "#0175ff"],
        colorBack: "rgba(0,0,0,0)",
        softness: 0.7, intensity: 0.3, noise: 0.15, shape: "corners", speed: speed
      });
    }, { speed: 0.6 });
  } catch (e) { /* shader is decorative */ }

  // Contact PulsingBorder rim — measures the CARD, adds 52px (2×26 bleed) to fill .pulse-host.
  try {
    var contactCard = document.querySelector("#contact .card.feature");
    var pulseHost = contactCard && contactCard.querySelector(".pulse-host");
    if (pulseHost) mountShader(pulseHost, contactCard, function (lib, w, h, speed) {
      return lib.R.createElement(lib.shaders.PulsingBorder, {
        width: w, height: h, minPixelRatio: 1,
        colors: ["#ff9500", "#ffac0a", "#7da4ff", "#0175ff"],
        colorBack: "rgba(0,0,0,0)",
        roundness: 0.08, thickness: 0.09, softness: 0.8, intensity: 0.3,
        bloom: 0.12, spots: 5, spotSize: 0.55, pulse: 0.2,
        smoke: 0.2, smokeSize: 0.6, speed: speed, scale: 1,
        style: { display: "block", width: "100%", height: "100%" }
      });
    }, { speed: 1 });
  } catch (e) { /* shader is decorative */ }

  // "Get in touch" CTAs — a single centered GrainGradient sphere (blue center → amber edge) inside each.
  try {
    var grainHosts = document.querySelectorAll(".btn--grain .btn-shader");
    for (var gi = 0; gi < grainHosts.length; gi++) {
      var host = grainHosts[gi];
      mountShader(host, host, function (lib, w, h, speed) {
        return lib.R.createElement(lib.shaders.GrainGradient, {
          width: w, height: h, minPixelRatio: 1,
          style: { width: "100%", height: "100%", display: "block" },
          colors: ["#ffac0a", "#ffcd7d", "#7da4ff", "#0175ff"], // last = center (blue), first = edge (amber)
          colorBack: "rgba(0,0,0,0)",
          shape: "sphere", fit: "cover", scale: 1.3,
          softness: 0.75, intensity: 0.35, noise: 0.18, speed: speed
        });
      }, { speed: 2.2, hoverEl: host.closest(".btn--grain") }); // runs only while the button is hovered
    }
  } catch (e) { /* shader is decorative */ }
})();
