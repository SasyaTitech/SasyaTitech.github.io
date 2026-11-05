/* =============================================================
   site.js · Mingda Liu · no dependencies
   1 Language   2 Bar   3 Copy   4 Light (hero)   5 Prints
   ============================================================= */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- 1. Language ------------------------------------ */
  function setLang(l) {
    root.setAttribute("data-lang", l);
    root.setAttribute("lang", l === "zh" ? "zh-CN" : "en");
    document.querySelectorAll("[data-set-lang]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-set-lang") === l));
    });
    try { localStorage.setItem("ml-lang", l); } catch (e) {}
  }
  document.querySelectorAll("[data-set-lang]").forEach(function (b) {
    b.addEventListener("click", function () { setLang(b.getAttribute("data-set-lang")); });
  });
  setLang(root.getAttribute("data-lang") === "zh" ? "zh" : "en");

  /* ---------- 2. Bar: stitch appears once you scroll --------- */
  var bar = document.querySelector(".bar");
  if (bar) {
    var onScroll = function () { bar.classList.toggle("scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 3. Copy email ---------------------------------- */
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    var original = btn.innerHTML;
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      var done = function () {
        btn.classList.add("done");
        btn.innerHTML = '<span class="en">Copied</span><span class="zh">已复制</span>';
        setTimeout(function () { btn.classList.remove("done"); btn.innerHTML = original; }, 1600);
      };
      var fallback = function () {
        var mail = document.querySelector(".mail");
        if (!mail) return;
        var r = document.createRange(); r.selectNodeContents(mail);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      };
      try { navigator.clipboard.writeText(text).then(done, fallback); }
      catch (e) { fallback(); }
    });
  });

  /* ---------- 4. Light --------------------------------------- */
  /* One hard light on the hero wall. It drifts slowly toward the
     cursor; the portrait's cast shadow follows. Static on touch
     screens and when reduced motion is requested.               */
  var hero = document.querySelector("[data-light]");
  if (hero) {
    var portrait = hero.querySelector(".portrait");
    var home = {
      x: parseFloat(hero.getAttribute("data-lx")) || 58,
      y: parseFloat(hero.getAttribute("data-ly")) || 24
    };
    var edge = parseFloat(hero.getAttribute("data-edge")) || 21;
    var cur = { x: home.x, y: home.y };
    var tgt = { x: home.x, y: home.y };
    var raf = 0;

    var paint = function () {
      hero.style.setProperty("--lx", cur.x.toFixed(2) + "%");
      hero.style.setProperty("--ly", cur.y.toFixed(2) + "%");
      // moving the light right/down pushes the off-frame object's shadow edge the other way
      hero.style.setProperty("--edge", (edge - (cur.x - home.x) * 0.35 - (cur.y - home.y) * 0.2).toFixed(2) + "%");
      if (!portrait) return;
      var h = hero.getBoundingClientRect(), p = portrait.getBoundingClientRect();
      var lx = h.left + h.width * cur.x / 100, ly = h.top + h.height * cur.y / 100;
      var dx = p.left + p.width / 2 - lx, dy = p.top + p.height / 2 - ly;
      var d = Math.hypot(dx, dy) || 1;
      var k = Math.max(4, Math.min(24, d / 20)); // farther from the light, longer shadow
      hero.style.setProperty("--sx", (dx / d * k).toFixed(1) + "px");
      hero.style.setProperty("--sy", (dy / d * k).toFixed(1) + "px");
    };
    var step = function () {
      cur.x += (tgt.x - cur.x) * 0.045;
      cur.y += (tgt.y - cur.y) * 0.045;
      paint();
      raf = Math.abs(tgt.x - cur.x) + Math.abs(tgt.y - cur.y) > 0.02 ? requestAnimationFrame(step) : 0;
    };
    var kick = function () { if (!raf) raf = requestAnimationFrame(step); };

    var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    hero.addEventListener("pointermove", function (e) {
      if (reduceMotion.matches || !finePointer.matches) return;
      var r = hero.getBoundingClientRect();
      tgt.x = home.x + ((e.clientX - r.left) / r.width - 0.5) * 24;
      tgt.y = home.y + ((e.clientY - r.top) / r.height - 0.5) * 20;
      kick();
    });
    hero.addEventListener("pointerleave", function () { tgt.x = home.x; tgt.y = home.y; kick(); });
    window.addEventListener("resize", paint);
    paint();
  }

  /* ---------- 5. Prints -------------------------------------- */
  /* Deterministic: the same seed always draws the same cloth.    */
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  var NS = "http://www.w3.org/2000/svg";
  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function num(host, key, fallback) {
    var v = parseFloat(host.getAttribute("data-" + key));
    return isNaN(v) ? fallback : v;
  }
  var W = 700, H = 440;

  /* rain: N marks across S stitched strips.
     data-count = marks, data-strips = strips, data-seed */
  function rain(host) {
    var n = num(host, "count", 257), strips = num(host, "strips", 7);
    var rnd = mulberry32(num(host, "seed", n));
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, "aria-hidden": "true", focusable: "false" });

    // strips of unequal width, like pieces cut from different garments
    var ws = [], sum = 0, i;
    for (i = 0; i < strips; i++) { var w = 0.55 + rnd(); ws.push(w); sum += w; }
    var x = 0, tones = ["--s1", "--s2", "--s3", "--s4", "--s5"];
    var seams = el("g", { stroke: "currentColor", "stroke-width": "1", "stroke-dasharray": "5 4", opacity: ".45" });
    for (i = 0; i < strips; i++) {
      var sw = ws[i] / sum * W;
      el("rect", { x: x.toFixed(1), y: 0, width: (sw + 0.6).toFixed(1), height: H, style: "fill:var(" + tones[(i * 3) % tones.length] + ")" }, svg);
      if (i > 0) el("line", { x1: (x + 3).toFixed(1), y1: 0, x2: (x + 3).toFixed(1), y2: H }, seams);
      x += sw;
    }
    svg.appendChild(seams);

    // marks: denser toward the top left, where the cloth caught the rain
    var pts = [], tries = 0, minD = 11;
    while (pts.length < n && tries < 60000) {
      tries++;
      var px = 6 + rnd() * (W - 12), py = 6 + rnd() * (H - 12);
      var density = 0.28 + 0.72 * Math.pow(1 - (px / W) * 0.55 - (py / H) * 0.45, 1.3);
      if (rnd() > density) continue;
      var ok = true;
      for (var j = 0; j < pts.length; j++) {
        var ddx = pts[j][0] - px, ddy = pts[j][1] - py;
        if (ddx * ddx + ddy * ddy < minD * minD) { ok = false; break; }
      }
      if (ok) pts.push([px, py]);
    }
    while (pts.length < n) pts.push([6 + rnd() * (W - 12), 6 + rnd() * (H - 12)]);

    var marks = el("g", { fill: "currentColor", stroke: "currentColor" }, svg);
    var slant = 0.14; // the wind
    pts.forEach(function (p) {
      var t = rnd();
      if (t < 0.55) {                          // dried drop with a darker rim
        var r = 1.6 + Math.pow(rnd(), 2) * 5.4;
        el("ellipse", {
          cx: p[0].toFixed(1), cy: p[1].toFixed(1), rx: r.toFixed(2), ry: (r * (0.8 + rnd() * 0.2)).toFixed(2),
          transform: "rotate(" + (rnd() * 180).toFixed(0) + " " + p[0].toFixed(1) + " " + p[1].toFixed(1) + ")",
          "fill-opacity": (0.08 + rnd() * 0.14).toFixed(2), "stroke-opacity": (0.3 + rnd() * 0.3).toFixed(2), "stroke-width": ".9"
        }, marks);
      } else if (t < 0.86) {                   // a drop that ran
        var len = 6 + rnd() * 16;
        var x2 = p[0] + len * slant, y2 = p[1] + len;
        el("path", {
          d: "M" + p[0].toFixed(1) + " " + p[1].toFixed(1) + "L" + x2.toFixed(1) + " " + y2.toFixed(1),
          fill: "none", "stroke-width": (1 + rnd() * 0.8).toFixed(2), "stroke-linecap": "round",
          "stroke-opacity": (0.26 + rnd() * 0.26).toFixed(2)
        }, marks);
        el("circle", { cx: x2.toFixed(1), cy: y2.toFixed(1), r: (1.1 + rnd() * 0.8).toFixed(2), stroke: "none", "fill-opacity": ".5" }, marks);
      } else {                                 // a single ink dot
        el("circle", { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: (0.9 + rnd() * 0.8).toFixed(2), stroke: "none", "fill-opacity": ".7" }, marks);
      }
    });
    host.appendChild(svg);
  }

  /* threads: T pinstripes, P of them pulled (only needle holes left).
     data-total, data-pulled, data-seed */
  function threads(host) {
    var total = num(host, "total", 100), pulled = num(host, "pulled", 0);
    var rnd = mulberry32(num(host, "seed", total));
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, "aria-hidden": "true", focusable: "false" });

    var idx = [], i;
    for (i = 0; i < total; i++) idx.push(i);
    for (i = idx.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = idx[i]; idx[i] = idx[j]; idx[j] = t; }
    var gone = {};
    idx.slice(0, pulled).forEach(function (k) { gone[k] = true; });

    // Top of the cloth = before (every thread). Pulled threads stop at a
    // ragged line partway down; below it only their needle holes remain.
    var pad = 26, gap = (W - pad * 2) / (total - 1);
    var kept = el("g", { stroke: "currentColor", fill: "none" }, svg);
    var holes = el("g", { stroke: "currentColor", fill: "none", "stroke-dasharray": "0.1 9", "stroke-linecap": "round", "stroke-width": "1.6", opacity: ".42" }, svg);
    for (i = 0; i < total; i++) {
      var x = (pad + i * gap).toFixed(1);
      var w = (0.9 + rnd() * 0.4).toFixed(2), o = (0.62 + rnd() * 0.22).toFixed(2);
      if (gone[i]) {
        var cut = (H * (0.4 + rnd() * 0.14)).toFixed(1);
        el("line", { x1: x, y1: 0, x2: x, y2: cut, "stroke-width": w, "stroke-opacity": o }, kept);
        el("line", { x1: x, y1: (+cut + 6).toFixed(1), x2: x, y2: H, "stroke-dashoffset": (rnd() * 9).toFixed(1) }, holes);
      } else {
        el("line", { x1: x, y1: 0, x2: x, y2: H, "stroke-width": w, "stroke-opacity": o }, kept);
      }
    }
    host.appendChild(svg); // in the DOM first, so labels can be measured
    var labels = host.getAttribute("data-labels");
    if (labels) {
      labels.split("|").forEach(function (t, k) {
        var y = k === 0 ? 30 : H - 18;
        var txt = el("text", { x: pad, y: y, fill: "currentColor", "font-size": "13", "letter-spacing": "1.6" }, svg);
        txt.setAttribute("style", "font-family:var(--f-mono);font-weight:700;text-transform:uppercase");
        txt.textContent = t;
        var bb = txt.getBBox();
        var bg = el("rect", { x: bb.x - 8, y: bb.y - 5, width: bb.width + 16, height: bb.height + 10, style: "fill:var(--print-bg)" });
        svg.insertBefore(bg, txt);
      });
    }
  }

  var printers = { rain: rain, threads: threads };
  document.querySelectorAll("[data-print]").forEach(function (host) {
    var fn = printers[host.getAttribute("data-print")];
    if (fn) fn(host);
  });
})();
