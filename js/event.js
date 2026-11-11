/* ==========================================================
   Tadwir — تدوير | Event countdown, live mode & team gallery

   EVENT TIMES (Cairo time, UTC+2). Change them here only.
   The switch happens at the same instant for every visitor,
   whatever their own time zone.

   Preview a state without waiting: add ?event=before | live | ended
   to the page address.
   ========================================================== */
(function () {
  'use strict';

  var START = Date.parse('2026-11-16T06:00:00+02:00'); // الإثنين 16 نوفمبر 6:00 ص — القاهرة
  var END = Date.parse('2026-11-18T23:59:00+02:00');   // الأربعاء 18 نوفمبر 11:59 م — القاهرة
  var GALLERY_URL = 'data/gallery.json';
  var GALLERY_REFRESH = 30000; // re-check for new photos every 30 seconds

  var tr = function (ar) { return window.TadwirI18n ? window.TadwirI18n.t(ar) : ar; };
  var isEn = function () { return window.TadwirI18n && window.TadwirI18n.lang() === 'en'; };
  var $ = function (id) { return document.getElementById(id); };
  var root = document.documentElement;
  var forced = (location.search.match(/[?&]event=(before|live|ended)\b/) || [])[1];

  var TEXT = {
    before: { badge: 'العد التنازلي', title: 'باقٍ على انطلاق المسابقة', when: 'الانطلاق: الإثنين 16 نوفمبر · 6:00 صباحاً بتوقيت القاهرة', pill: 'تنطلق المسابقة بعد' },
    live: { badge: 'مباشر الآن', title: 'المسابقة جارية الآن', sub: 'باقٍ على انتهاء الحدث', when: 'ينتهي الحدث: الأربعاء 18 نوفمبر · 11:59 مساءً بتوقيت القاهرة', pill: 'المسابقة جارية الآن' },
    ended: { badge: 'انتهى الحدث', title: 'شكراً لكم!', sub: 'انتهى الحدث. شكراً لكل من شاركنا الرحلة.' }
  };

  /* ---------- Countdown ---------- */
  var els = {
    pill: $('event-pill'), badge: $('event-badge'), title: $('event-title'), sub: $('event-sub'), when: $('event-when'),
    d: $('ev-d'), h: $('ev-h'), m: $('ev-m'), s: $('ev-s')
  };
  var current = '';
  var p2 = function (n) { return (n < 10 ? '0' : '') + n; };

  function stateAt(now) {
    if (forced) return forced;
    return now < START ? 'before' : now < END ? 'live' : 'ended';
  }
  // Each digit pair rolls: the old value slides up and out while the new one rises into place.
  function setNum(el, v) {
    if (!el) return;
    var cur = el.firstElementChild || el;
    if (cur.textContent === v) return;
    var first = !el.hasAttribute('data-prev');
    el.setAttribute('data-prev', cur.textContent);
    cur.textContent = v;
    if (first) return; // no roll on the very first paint
    var unit = el.parentNode;
    unit.classList.remove('is-tick'); void unit.offsetWidth; unit.classList.add('is-tick');
  }
  function paintState(st) {
    var t = TEXT[st];
    root.classList.remove('event-before', 'event-live', 'event-ended');
    root.classList.add('event-' + st);
    // the event look uses the report's heading font; load it only when needed
    if (st !== 'before' && !document.getElementById('ev-font')) {
      var f = document.createElement('link');
      f.id = 'ev-font'; f.rel = 'stylesheet';
      f.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@700;800&display=swap';
      document.head.appendChild(f);
    }
    if (!els.title) return;
    els.badge.lastChild.textContent = tr(t.badge);
    els.title.textContent = tr(t.title);
    els.sub.textContent = t.sub ? tr(t.sub) : '';
    els.sub.hidden = !t.sub;
    if (t.when) els.when.lastChild.textContent = tr(t.when);
    document.querySelectorAll('[data-ev-label]').forEach(function (el) { el.textContent = tr(el.getAttribute('data-ev-label')); });
  }
  function tick() {
    var now = Date.now();
    var st = stateAt(now);
    if (st !== current) { current = st; paintState(st); }
    var left = Math.max(0, (st === 'before' ? START : END) - now);
    var sec = Math.floor(left / 1000);
    var d = Math.floor(sec / 86400), h = Math.floor(sec % 86400 / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
    if (st !== 'ended') { setNum(els.d, p2(d)); setNum(els.h, p2(h)); setNum(els.m, p2(m)); setNum(els.s, p2(s)); }
    if (els.pill) {
      els.pill.hidden = st === 'ended';
      var u = isEn() ? ['d', 'h', 'm'] : ['ي', 'س', 'د'];
      var txt = tr(TEXT[st].pill || '');
      var time = st === 'before' ? (d ? d + u[0] + ' ' : '') + p2(h) + u[1] + ' ' + p2(m) + u[2] : '';
      els.pill.querySelector('span:last-of-type').textContent = txt + ' ';
      els.pill.querySelector('b').textContent = time;
    }
  }
  tick();
  setInterval(tick, 1000);
  document.addEventListener('tadwir:lang', function () { paintState(current); tick(); renderGallery(true); });

  /* ---------- Team spirit gallery (photos arrive from Telegram via GitHub Actions) ---------- */
  var section = $('team'), grid = $('team-grid'), box = $('lightbox');
  var photos = [], shown = {};

  function fmtDate(iso) {
    try {
      return new Intl.DateTimeFormat(isEn() ? 'en-GB' : 'ar-EG-u-nu-latn', { timeZone: 'Africa/Cairo', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' }).format(new Date(iso));
    } catch (e) { return ''; }
  }
  function renderGallery(all) {
    if (!section || !grid) return;
    section.hidden = photos.length === 0;
    if (all) { grid.textContent = ''; }
    var first = Object.keys(shown).length === 0;
    photos.forEach(function (ph, i) {
      if (!all && shown[ph.file]) return;
      var fig = document.createElement('figure');
      fig.className = 'card shot' + (!first && !all ? ' is-new' : '');
      fig.tabIndex = 0;
      fig.setAttribute('role', 'button');
      var wrap = document.createElement('div'); wrap.className = 'shot__img';
      var img = document.createElement('img');
      img.src = ph.file; img.alt = ph.caption || tr('روح الفريق'); img.loading = 'lazy'; img.decoding = 'async';
      wrap.appendChild(img);
      var cap = document.createElement('figcaption');
      var p = document.createElement('p'); p.textContent = ph.caption || '';
      var tm = document.createElement('time'); tm.dateTime = ph.date || ''; tm.textContent = ph.date ? fmtDate(ph.date) : '';
      cap.appendChild(p); cap.appendChild(tm);
      fig.appendChild(wrap); fig.appendChild(cap);
      var open = function () { openBox(ph); };
      fig.addEventListener('click', open);
      fig.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
      // newest first
      if (all || first) grid.appendChild(fig); else grid.insertBefore(fig, grid.firstChild);
      shown[ph.file] = true;
    });
  }
  function openBox(ph) {
    if (!box || !box.showModal) { window.open(ph.file, '_blank'); return; }
    box.querySelector('img').src = ph.file;
    box.querySelector('img').alt = ph.caption || '';
    box.querySelector('p').textContent = ph.caption || '';
    box.showModal();
  }
  if (box) {
    box.addEventListener('click', function (e) { if (e.target === box || e.target.closest('.lightbox__close')) box.close(); });
  }
  function loadGallery() {
    fetch(GALLERY_URL + '?t=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (!j || !Array.isArray(j.photos)) return;
        var list = j.photos.filter(function (ph) { return ph && typeof ph.file === 'string' && /^assets\/team\/[\w.\-]+$/.test(ph.file); }).reverse();
        var removed = photos.some(function (old) { return !list.some(function (n) { return n.file === old.file; }); });
        var isFirst = photos.length === 0 && Object.keys(shown).length === 0;
        // on later refreshes, feed new photos oldest-first so the newest ends up on top
        photos = list;
        if (removed) { shown = {}; renderGallery(true); }
        else if (isFirst) renderGallery(false);
        else { photos = list.slice().reverse(); renderGallery(false); photos = list; }
      })
      .catch(function () { /* gallery is optional */ });
  }
  if (section) { loadGallery(); setInterval(loadGallery, GALLERY_REFRESH); }
})();
