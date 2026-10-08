/* ==========================================================
   Tadwir — تدوير | Landing page interactions
   ========================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var animate = hasGsap && !reduceMotion;
  var desktop = window.matchMedia('(min-width: 961px)');
  var tr = function (ar) { return window.TadwirI18n ? window.TadwirI18n.t(ar) : ar; };
  var isLtr = function () { return document.documentElement.dir === 'ltr'; };

  /* ---------- Preloader ---------- */
  var preloader = document.getElementById('preloader');
  var started = window.performance && performance.now ? performance.now() : 0;
  function hidePreloader(cb) {
    var elapsed = (window.performance && performance.now ? performance.now() : 0) - started;
    var wait = reduceMotion ? 0 : Math.max(0, 1150 - elapsed);
    setTimeout(function () {
      if (preloader) preloader.classList.add('is-done');
      if (cb) cb();
      setTimeout(function () { if (preloader) preloader.remove(); }, 600);
    }, wait);
  }

  /* ---------- Navbar ---------- */
  var nav = document.getElementById('nav');
  var toggle = document.getElementById('nav-toggle');
  function onScroll() { nav.classList.toggle('is-scrolled', window.scrollY > 20); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', tr(open ? 'إغلاق القائمة' : 'فتح القائمة'));
    document.body.style.overflow = open ? 'hidden' : '';
  }
  toggle.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
  document.querySelectorAll('.nav__menu a').forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
  });
  desktop.addEventListener && desktop.addEventListener('change', function (e) { if (e.matches) setMenu(false); });

  // Active link highlighting
  var links = {};
  document.querySelectorAll('.nav__links a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        Object.keys(links).forEach(function (k) { links[k].classList.remove('is-active'); });
        var l = links[en.target.id];
        if (l) l.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { io.observe(s); });
  }

  /* ---------- Hero circuit canvas ---------- */
  (function circuit() {
    var canvas = document.getElementById('circuit');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var base = document.createElement('canvas');
    var bctx = base.getContext('2d');
    var traces = [], pulses = [], w = 0, h = 0, dpr = 1, running = false, visible = true, raf = 0;
    var G = 34; // grid size

    function rand(a, b) { return a + Math.random() * (b - a); }
    function build() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = base.width = Math.round(w * dpr);
      canvas.height = base.height = Math.round(h * dpr);
      traces = [];
      var count = Math.round((w * h) / 26000);
      var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];
      for (var i = 0; i < count; i++) {
        var x = Math.round(rand(0, w) / G) * G, y = Math.round(rand(0, h) / G) * G;
        var pts = [[x, y]], d = dirs[Math.floor(Math.random() * 4)];
        var steps = Math.floor(rand(2, 6));
        for (var s = 0; s < steps; s++) {
          var len = Math.floor(rand(1, 4)) * G;
          x += d[0] * len; y += d[1] * len;
          pts.push([x, y]);
          // turn 45° or keep
          if (Math.random() < .6) {
            var idx = dirs.indexOf(d);
            d = Math.abs(d[0]) + Math.abs(d[1]) === 2 ? dirs[Math.floor(Math.random() * 4)] : dirs[4 + Math.floor(Math.random() * 4)];
            if (idx === -1) d = dirs[0];
          }
        }
        var segs = [], total = 0;
        for (var k = 1; k < pts.length; k++) {
          var l = Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
          segs.push(l); total += l;
        }
        traces.push({ pts: pts, segs: segs, total: total });
      }
      // static layer
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bctx.clearRect(0, 0, w, h);
      bctx.lineWidth = 1.2; bctx.lineJoin = 'round';
      traces.forEach(function (t) {
        bctx.strokeStyle = 'rgba(106,176,76,0.22)';
        bctx.beginPath();
        t.pts.forEach(function (p, j) { j ? bctx.lineTo(p[0], p[1]) : bctx.moveTo(p[0], p[1]); });
        bctx.stroke();
        var e = t.pts[t.pts.length - 1], s0 = t.pts[0];
        bctx.fillStyle = 'rgba(106,176,76,0.45)';
        bctx.beginPath(); bctx.arc(e[0], e[1], 3, 0, Math.PI * 2); bctx.fill();
        bctx.strokeStyle = 'rgba(255,255,255,0.18)';
        bctx.beginPath(); bctx.arc(s0[0], s0[1], 3.5, 0, Math.PI * 2); bctx.stroke();
      });
      pulses = [];
      var n = Math.min(18, traces.length);
      for (var p = 0; p < n; p++) pulses.push(newPulse(true));
      draw(0);
    }
    function newPulse(randomStart) {
      var t = traces[Math.floor(Math.random() * traces.length)];
      return { t: t, d: randomStart ? Math.random() * t.total : 0, v: rand(.25, .6) };
    }
    function pointAt(t, d) {
      for (var i = 0; i < t.segs.length; i++) {
        if (d <= t.segs[i]) {
          var a = t.pts[i], b = t.pts[i + 1], r = d / t.segs[i];
          return [a[0] + (b[0] - a[0]) * r, a[1] + (b[1] - a[1]) * r];
        }
        d -= t.segs[i];
      }
      return t.pts[t.pts.length - 1];
    }
    var last = 0;
    function draw(ts) {
      var dt = last ? Math.min(ts - last, 50) : 16; last = ts;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(base, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (var i = 0; i < pulses.length; i++) {
        var p = pulses[i];
        p.d += p.v * dt * 0.06;
        if (p.d >= p.t.total) { pulses[i] = newPulse(false); continue; }
        var pt = pointAt(p.t, p.d);
        var g = ctx.createRadialGradient(pt[0], pt[1], 0, pt[0], pt[1], 10);
        g.addColorStop(0, 'rgba(160,230,130,0.95)');
        g.addColorStop(1, 'rgba(106,176,76,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(pt[0], pt[1], 10, 0, Math.PI * 2); ctx.fill();
      }
    }
    function loop(ts) {
      if (!running) return;
      draw(ts);
      raf = requestAnimationFrame(loop);
    }
    function start() { if (reduceMotion || running || !visible || document.hidden) return; running = true; last = 0; raf = requestAnimationFrame(loop); }
    function stop() { running = false; cancelAnimationFrame(raf); }

    build();
    start();
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        if (Math.abs(canvas.clientWidth - w) > 40 || Math.abs(canvas.clientHeight - h) > 120) build();
      }, 200);
    });
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        visible = en[0].isIntersecting;
        visible ? start() : stop();
      }).observe(canvas);
    }
  })();

  /* ---------- Device connector lines ---------- */
  var stage = document.getElementById('device-stage');
  var svg = document.getElementById('device-lines');
  var NS = 'http://www.w3.org/2000/svg';
  var lineEls = {};
  function drawLines() {
    if (!stage || !svg) return;
    if (!desktop.matches) return;
    var sr = stage.getBoundingClientRect();
    svg.setAttribute('viewBox', '0 0 ' + sr.width + ' ' + sr.height);
    stage.querySelectorAll('.hotspot').forEach(function (dot) {
      var id = dot.getAttribute('data-spot');
      var card = stage.querySelector('.spec[data-spot="' + id + '"]');
      if (!card) return;
      var dr = dot.getBoundingClientRect(), cr = card.getBoundingClientRect();
      var x1 = dr.left + dr.width / 2 - sr.left, y1 = dr.top + dr.height / 2 - sr.top;
      var cardIsRight = cr.left > dr.left;
      var x2 = (cardIsRight ? cr.left : cr.right) - sr.left;
      var y2 = cr.top + cr.height / 2 - sr.top;
      var mx = x2 + (cardIsRight ? -28 : 28);
      var item = lineEls[id];
      if (!item) {
        item = { path: document.createElementNS(NS, 'path'), end: document.createElementNS(NS, 'circle') };
        // pathLength=1 keeps the draw animation independent of the real length
        item.path.setAttribute('pathLength', '1');
        item.path.style.strokeDasharray = '1';
        item.path.style.strokeDashoffset = '0';
        item.end.setAttribute('r', 4);
        svg.appendChild(item.path); svg.appendChild(item.end);
        lineEls[id] = item;
      }
      item.path.setAttribute('d', 'M' + x1 + ' ' + y1 + ' L' + mx + ' ' + y1 + ' L' + mx + ' ' + y2 + ' L' + x2 + ' ' + y2);
      item.end.setAttribute('cx', x2); item.end.setAttribute('cy', y2);
    });
  }

  /* ---------- Counters ---------- */
  function formatNum(v, dec) { return Number(v).toFixed(dec); }
  function runCounter(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
    if (!animate) { el.textContent = formatNum(target, dec); return; }
    var obj = { v: 0 };
    el.textContent = formatNum(0, dec);
    gsap.to(obj, {
      v: target, duration: 2, ease: 'power2.out',
      onUpdate: function () { el.textContent = formatNum(obj.v, dec); }
    });
  }

  /* ---------- Theme (light / dark) ---------- */
  var root = document.documentElement;
  var themeBtn = document.getElementById('theme-toggle');
  var systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  function currentTheme() {
    var t = root.getAttribute('data-theme');
    return t === 'dark' || t === 'light' ? t : (systemDark.matches ? 'dark' : 'light');
  }
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('tadwir-theme', next); } catch (e) { /* storage unavailable */ }
    });
  }

  /* ---------- Scroll progress + back-to-top ---------- */
  var progress = document.getElementById('scroll-progress');
  var toTop = document.getElementById('to-top');
  var ticking = false;
  function updateScrollUi() {
    ticking = false;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var ratio = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    if (progress) progress.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
    if (toTop) toTop.classList.toggle('is-visible', window.scrollY > 700);
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(updateScrollUi); }
  }, { passive: true });
  window.addEventListener('resize', updateScrollUi);
  updateScrollUi();

  /* ---------- Section title underline ---------- */
  if (!reduceMotion && 'IntersectionObserver' in window) {
    root.classList.add('js-underline');
    var titleIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); titleIo.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -15% 0px' });
    document.querySelectorAll('.section__title').forEach(function (t) { titleIo.observe(t); });
  }

  /* ---------- Circuit dividers between light sections ---------- */
  var dividerPaths = [];
  (function dividers() {
    var D = 'M0 18 H360 l14 -12 H540 l14 12 H690 l14 12 H850 l14 -12 H1200';
    var sections = Array.prototype.slice.call(document.querySelectorAll('main > section'));
    var isLight = function (s) { return s.classList.contains('section') && !s.classList.contains('section--navy'); };
    sections.forEach(function (sec, i) {
      if (!i || !isLight(sec) || !isLight(sections[i - 1])) return;
      var wrap = document.createElement('div');
      wrap.className = 'circuit-divider';
      wrap.setAttribute('aria-hidden', 'true');
      wrap.innerHTML = '<svg viewBox="0 0 1200 36" preserveAspectRatio="none">' +
        '<path class="cd-base" d="' + D + '"/>' +
        '<path class="cd-draw" pathLength="1" style="stroke-dasharray:1;stroke-dashoffset:0" d="' + D + '"/></svg>';
      sec.insertBefore(wrap, sec.firstChild);
      dividerPaths.push(wrap.querySelector('.cd-draw'));
    });
  })();

  /* ---------- Language switch: re-measure layout ---------- */
  document.addEventListener('tadwir:lang', function () {
    toggle.setAttribute('aria-label', tr(nav.classList.contains('is-open') ? 'إغلاق القائمة' : 'فتح القائمة'));
    requestAnimationFrame(function () {
      if (animate) ScrollTrigger.refresh();
      drawLines();
    });
  });

  /* ---------- Without animation: show final state ---------- */
  if (!animate) {
    hidePreloader();
    drawLines();
    window.addEventListener('resize', drawLines);
    document.querySelectorAll('[data-count]').forEach(runCounter);
    return;
  }

  /* ==========================================================
     GSAP animations
     ========================================================== */
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power3.out' });

  // Split hero tagline into words
  document.querySelectorAll('.hero__tagline[data-split]').forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach(function (w, i) {
      var s = document.createElement('span');
      s.className = 'w'; s.textContent = w;
      el.appendChild(s);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
  });

  // Hero intro (prepared hidden behind the preloader)
  var intro = gsap.timeline({ paused: true });
  intro
    .from('.hero__brand', { y: 50, opacity: 0, duration: .9 })
    .from('.hero__tagline .w', { y: 28, opacity: 0, duration: .6, stagger: .07 }, '-=.55')
    .from('.hero .eyebrow', { y: 16, opacity: 0, duration: .5 }, '-=.5')
    .from('.hero__lead', { y: 20, opacity: 0, duration: .6 }, '-=.35')
    .from('.hero__actions > *', { y: 20, opacity: 0, duration: .5, stagger: .1 }, '-=.4')
    .from('.hero__chips li', { y: 14, opacity: 0, duration: .4, stagger: .07 }, '-=.3')
    .from('.hero__visual', { y: 80, scale: .88, opacity: 0, duration: 1.1, ease: 'power3.out' }, .1)
    .from('.hero__badge', { scale: .7, opacity: 0, duration: .5, stagger: .15, ease: 'back.out(1.8)' }, '-=.4');

  hidePreloader(function () { intro.play(); });

  // Parallax backgrounds
  gsap.to('.hero__canvas', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__glow', { yPercent: 30, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.fromTo('.device__bg', { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.device', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.fromTo('.market__bg', { yPercent: -10 }, { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.market', start: 'top bottom', end: 'bottom top', scrub: true } });

  // Generic reveals
  gsap.utils.toArray('[data-reveal]').forEach(function (el) {
    gsap.from(el, { y: 40, opacity: 0, duration: .9, scrollTrigger: { trigger: el, start: 'top 87%', once: true } });
  });
  gsap.utils.toArray('[data-stagger]').forEach(function (el) {
    gsap.from(el.children, { y: 36, opacity: 0, duration: .75, stagger: .09, scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });

  // Timeline progress + steps
  var tl = document.getElementById('timeline');
  gsap.fromTo('#timeline-fill', { scaleY: 0 }, {
    scaleY: 1, ease: 'none',
    scrollTrigger: { trigger: tl, start: 'top 65%', end: 'bottom 55%', scrub: .4 }
  });
  gsap.utils.toArray('.step').forEach(function (step) {
    var card = step.querySelector('.step__card');
    var side = isLtr() ? -1 : 1;
    var fromRight = (desktop.matches && step.matches(':nth-of-type(odd)') ? -1 : 1) * side;
    gsap.from(card, desktop.matches ? { x: 50 * fromRight, opacity: 0, duration: .8, scrollTrigger: { trigger: step, start: 'top 80%', once: true } } : { y: 30, opacity: 0, duration: .7, scrollTrigger: { trigger: step, start: 'top 85%', once: true } });
    gsap.from(step.querySelector('.step__dot'), { scale: 0, duration: .6, ease: 'back.out(2)', scrollTrigger: { trigger: step, start: 'top 80%', once: true } });
  });

  // Circuit dividers draw in as they scroll into view
  dividerPaths.forEach(function (path) {
    gsap.fromTo(path, { strokeDashoffset: 1 }, {
      strokeDashoffset: 0, ease: 'none',
      scrollTrigger: { trigger: path.closest('.circuit-divider'), start: 'top 92%', end: 'top 45%', scrub: .5 }
    });
  });

  // Counters
  document.querySelectorAll('[data-count]').forEach(function (el) {
    ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: function () { runCounter(el); } });
  });

  // Device: pinned hotspot sequence (desktop) / simple reveal (mobile)
  ScrollTrigger.matchMedia({
    '(min-width: 961px)': function () {
      drawLines();
      var specs = gsap.utils.toArray('.device .spec');
      var dots = gsap.utils.toArray('.device .hotspot');
      gsap.set(specs, { opacity: 0, y: 24 });
      gsap.set(dots, { scale: 0, opacity: 0 });
      Object.keys(lineEls).forEach(function (k) {
        gsap.set(lineEls[k].path, { strokeDashoffset: 1 });
        gsap.set(lineEls[k].end, { opacity: 0 });
      });

      var seq = gsap.timeline({
        scrollTrigger: {
          trigger: '.device', start: 'top top', end: '+=1800', pin: true, scrub: .6, anticipatePin: 1
        }
      });
      seq.fromTo('.device__figure', { scale: .9, opacity: .4 }, { scale: 1, opacity: 1, duration: .6, ease: 'power2.out' });
      ['1', '2', '3', '4'].forEach(function (id) {
        var dot = document.querySelector('.device .hotspot[data-spot="' + id + '"]');
        var spec = document.querySelector('.device .spec[data-spot="' + id + '"]');
        var line = lineEls[id];
        seq.fromTo(dot, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: .3, ease: 'back.out(2)' });
        if (line) {
          seq.fromTo(line.path, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: .5, ease: 'none' }, '<.1');
          seq.fromTo(line.end, { opacity: 0 }, { opacity: 1, duration: .1 });
        }
        seq.fromTo(spec, { opacity: 0, y: 24 }, {
          opacity: 1, y: 0, duration: .4,
          onStart: function () { specs.forEach(function (s) { s.classList.remove('is-active'); }); spec.classList.add('is-active'); },
          onReverseComplete: function () { spec.classList.remove('is-active'); }
        }, '<');
        seq.to({}, { duration: .35 });
      });

      var onResize = function () { drawLines(); ScrollTrigger.refresh(); };
      var rt;
      var handler = function () { clearTimeout(rt); rt = setTimeout(onResize, 250); };
      window.addEventListener('resize', handler);
      return function () {
        window.removeEventListener('resize', handler);
        gsap.set(specs.concat(dots), { clearProps: 'all' });
        drawLines();
      };
    },
    '(max-width: 960px)': function () {
      gsap.from('.device__figure', { y: 40, opacity: 0, duration: .9, scrollTrigger: { trigger: '.device__figure', start: 'top 85%', once: true } });
      gsap.from('.device .hotspot', { scale: 0, duration: .5, stagger: .15, ease: 'back.out(2)', scrollTrigger: { trigger: '.device__figure', start: 'top 70%', once: true } });
      gsap.from('.device .spec', { y: 30, opacity: 0, duration: .6, stagger: .12, scrollTrigger: { trigger: '.device .spec', start: 'top 88%', once: true } });
    }
  });

  // Recalculate after fonts/images settle
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
})();
