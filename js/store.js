/* ==========================================================
   Tadwir — تدوير | Store: products, cart, order via WhatsApp
   Products, prices, stock and the WhatsApp number come from
   data/products.json. Ordering opens a WhatsApp chat with a
   ready-made message listing the pieces and the total.
   ========================================================== */
(function () {
  'use strict';

  var CART_KEY = 'tadwir-cart';
  var DEFAULT_WA = '966545400462';

  /* ---------- Strings (Arabic / English) ---------- */
  var STR = {
    pageTitle: ['المتجر | تدوير — ميداليات من بوردات معاد تدويرها', 'Shop | Tadwir — Keychains from recycled circuit boards'],
    pageDesc: ['ميداليات وقلادات مصنوعة يدوياً من بوردات إلكترونيات معاد تدويرها، من متجر تدوير.', 'Handmade keychains and necklaces made from recycled electronics circuit boards, from the Tadwir shop.'],
    heroEyebrow: ['متجر تدوير', 'Tadwir Shop'],
    heroTitleA: ['قطعٌ كانت داخل أجهزة…', 'Parts that lived inside devices…'],
    heroTitleB: ['صارت تُلبس', 'now made to wear'],
    heroLead: ['ميداليات وقلادات مصنوعة يدوياً من بوردات إلكترونيات معاد تدويرها. كل قطعة فريدة، وكل شراء يمنح جهازاً قديماً حياةً ثانية.',
      'Handmade keychains and necklaces made from recycled electronics circuit boards. Every piece is one of a kind, and every purchase gives an old device a second life.'],
    chip1: ['من أجهزة حقيقية', 'From real devices'],
    chip2: ['صناعة يدوية', 'Handmade'],
    chip3: ['الطلب عبر واتساب', 'Order on WhatsApp'],
    shopEyebrow: ['القطع', 'The pieces'],
    shopTitle: ['اختر قطعتك', 'Pick your piece'],
    loading: ['جارٍ تحميل المنتجات…', 'Loading products…'],
    loadFail: ['تعذّر تحميل المنتجات. حدّث الصفحة وحاول مرة أخرى.', 'Couldn’t load the products. Refresh the page and try again.'],
    available: ['متوفر', 'In stock'],
    left: ['باقي', 'Only'],
    leftUnit: ['فقط', 'left'],
    soldout: ['نفدت الكمية', 'Sold out'],
    addToCart: ['أضف إلى السلة', 'Add to cart'],
    added: ['أُضيفت ✓', 'Added ✓'],
    addedSr: ['أُضيفت إلى السلة: ', 'Added to cart: '],
    maxQty: ['وصلت للحد الأعلى لهذه القطعة', 'Maximum quantity reached'],
    coEyebrow: ['إتمام الطلب', 'Checkout'],
    coTitle: ['سلتك جاهزة؟', 'Ready to order?'],
    cartTitle: ['سلتك', 'Your cart'],
    cartEmpty: ['سلتك فارغة. أضف قطعة من الأعلى.', 'Your cart is empty. Add a piece from above.'],
    cartFab: ['السلة', 'Cart'],
    total: ['المجموع', 'Total'],
    qtyLess: ['إنقاص الكمية', 'Decrease quantity'],
    qtyMore: ['زيادة الكمية', 'Increase quantity'],
    remove: ['حذف من السلة', 'Remove from cart'],
    each: ['للقطعة', 'each'],
    waOrder: ['اطلب عبر واتساب', 'Order on WhatsApp'],
    waHint: ['يُفتح واتساب برسالة جاهزة فيها القطع والمجموع، ونتفق معك هناك على الدفع والتوصيل.',
      'WhatsApp opens with a ready message listing your pieces and total; we’ll arrange payment and delivery with you there.'],
    eCartEmpty: ['السلة فارغة. أضف قطعة واحدة على الأقل.', 'Your cart is empty. Add at least one piece.'],
    msgHello: ['السلام عليكم، أبغى أطلب من متجر تدوير:', 'Hello, I’d like to order from the Tadwir shop:'],
    msgTotal: ['المجموع', 'Total']
  };

  var lang = function () { return window.TadwirI18n ? window.TadwirI18n.lang() : 'ar'; };
  var en = function () { return lang() === 'en'; };
  var t = function (k) { var s = STR[k]; return s ? s[en() ? 1 : 0] : k; };
  var $ = function (id) { return document.getElementById(id); };
  var store = {
    get: function (k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  };

  /* ---------- State ---------- */
  var data = null;
  var byId = {};
  var cart = store.get(CART_KEY) || {};

  var els = {
    grid: $('products'), list: $('cart-list'), empty: $('cart-empty'), total: $('cart-total'),
    alert: $('form-alert'), wa: $('wa-btn'),
    fab: $('cart-fab'), fabCount: $('cart-fab-count'), sr: $('sr-status')
  };

  function currency() { return data ? (en() ? data.settings.currencyEn : data.settings.currency) : ''; }
  function money(n) { return n + ' ' + currency(); }
  function maxQty(p) {
    var max = (data && data.settings.maxQtyPerItem) || 10;
    return p && typeof p.stock === 'number' && p.stock > 0 ? Math.min(max, p.stock) : max;
  }
  // The bot adds products in Arabic first; English falls back to Arabic until it is filled in.
  function pName(p) { return en() ? (p.nameEn || p.nameAr) : p.nameAr; }
  function pDesc(p) { return en() ? (p.descEn || p.descAr || '') : (p.descAr || ''); }
  function pImg(src) { return typeof src === 'string' && /^assets\/store\/[\w.\-]+$/.test(src) ? src : ''; }
  function waNumber() { return String((data && data.settings.whatsapp) || DEFAULT_WA).replace(/\D/g, ''); }

  /* ---------- Static text ---------- */
  function applyStatic() {
    document.querySelectorAll('[data-t]').forEach(function (el) { el.textContent = t(el.getAttribute('data-t')); });
    document.title = t('pageTitle');
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', t('pageDesc'));
  }

  /* ---------- Products ---------- */
  function renderProducts() {
    if (!data) return;
    els.grid.innerHTML = data.products.map(function (p) {
      var out = p.status !== 'available';
      var name = pName(p), alt = en() ? p.nameAr : (p.nameEn || '');
      if (alt === name) alt = '';
      var imgs = '<img src="' + esc(pImg(p.image)) + '" alt="' + esc(name) + '" width="800" height="800" loading="lazy" decoding="async">' +
        (pImg(p.image2) ? '<img src="' + esc(pImg(p.image2)) + '" alt="" width="800" height="800" loading="lazy" decoding="async" aria-hidden="true">' : '');
      var few = !out && typeof p.stock === 'number' && p.stock > 0 && p.stock <= 5;
      return '<article class="card product' + (out ? ' is-soldout' : '') + '">' +
        '<div class="product__media">' + imgs + '<span class="sol__tag">' + t(out ? 'soldout' : 'available') + '</span></div>' +
        '<div class="product__body">' +
          '<div class="product__name"><h4>' + esc(name) + '</h4><span lang="' + (en() ? 'ar' : 'en') + '">' + esc(alt) + '</span></div>' +
          '<p>' + esc(pDesc(p)) + '</p>' +
          (few ? '<p class="product__stock">' + t('left') + ' ' + p.stock + ' ' + t('leftUnit') + '</p>' : '') +
          '<div class="product__foot">' +
            '<p class="price">' + p.price + '<small>' + esc(currency()) + '</small></p>' +
            '<button class="btn btn--primary" type="button" data-add="' + esc(p.id) + '"' + (out ? ' disabled' : '') + '>' +
              (out ? t('soldout') : '<svg class="ic"><use href="#i-cart"/></svg><span>' + t('addToCart') + '</span>') +
            '</button>' +
          '</div>' +
        '</div>' +
      '</article>';
    }).join('');
  }

  els.grid.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-add]');
    if (!btn || btn.disabled) return;
    var id = btn.getAttribute('data-add');
    var p = byId[id];
    if (!p || p.status !== 'available') return;
    if ((cart[id] || 0) >= maxQty(p)) { announce(t('maxQty')); return; }
    cart[id] = (cart[id] || 0) + 1;
    saveCart();
    btn.classList.add('is-added');
    btn.querySelector('span').textContent = t('added');
    clearTimeout(btn._t);
    btn._t = setTimeout(function () { btn.classList.remove('is-added'); btn.querySelector('span').textContent = t('addToCart'); }, 1300);
    els.fab.classList.remove('is-bump'); void els.fab.offsetWidth; els.fab.classList.add('is-bump');
    announce(t('addedSr') + pName(p));
  });

  /* ---------- Cart ---------- */
  function cartItems() {
    return Object.keys(cart).filter(function (id) { return byId[id] && byId[id].status === 'available' && cart[id] > 0; })
      .map(function (id) { return { p: byId[id], qty: cart[id] }; });
  }
  function cartTotal() { return cartItems().reduce(function (s, it) { return s + it.p.price * it.qty; }, 0); }
  function cartCount() { return cartItems().reduce(function (s, it) { return s + it.qty; }, 0); }

  function saveCart() {
    Object.keys(cart).forEach(function (id) {
      if (!byId[id] || byId[id].status !== 'available' || cart[id] <= 0) delete cart[id];
      else cart[id] = Math.min(cart[id], maxQty(byId[id]));
    });
    store.set(CART_KEY, cart);
    renderCart();
  }

  function renderCart() {
    var items = cartItems();
    els.empty.hidden = items.length > 0;
    els.list.innerHTML = items.map(function (it) {
      var p = it.p, name = pName(p);
      return '<li class="cart__item">' +
        '<img src="' + esc(pImg(p.image)) + '" alt="" width="56" height="56" loading="lazy">' +
        '<div><b>' + esc(name) + '</b><small>' + money(p.price) + ' ' + t('each') + '</small></div>' +
        '<div class="cart__side">' +
          '<span class="cart__line">' + money(p.price * it.qty) + '</span>' +
          '<div class="qty">' +
            '<button type="button" data-qty="1" data-id="' + esc(p.id) + '" aria-label="' + t('qtyMore') + '"' + (it.qty >= maxQty(p) ? ' disabled' : '') + '><svg class="ic"><use href="#i-plus"/></svg></button>' +
            '<output aria-live="polite">' + it.qty + '</output>' +
            '<button type="button" data-qty="-1" data-id="' + esc(p.id) + '" aria-label="' + t('qtyLess') + '"' + (it.qty <= 1 ? ' disabled' : '') + '><svg class="ic"><use href="#i-minus"/></svg></button>' +
          '</div>' +
          '<button type="button" class="cart__remove" data-remove="' + esc(p.id) + '" aria-label="' + t('remove') + '"><svg class="ic"><use href="#i-trash"/></svg></button>' +
        '</div>' +
      '</li>';
    }).join('');
    els.total.textContent = money(cartTotal());
    els.fabCount.textContent = cartCount();
    els.wa.href = waLink();
    els.wa.classList.toggle('is-disabled', items.length === 0);
    els.wa.setAttribute('aria-disabled', items.length === 0 ? 'true' : 'false');
    if (items.length) hideAlert();
    updateFab();
  }

  els.list.addEventListener('click', function (e) {
    var q = e.target.closest('[data-qty]'), r = e.target.closest('[data-remove]');
    if (q && !q.disabled) {
      var id = q.getAttribute('data-id');
      cart[id] = Math.max(1, Math.min(maxQty(byId[id]), (cart[id] || 0) + parseInt(q.getAttribute('data-qty'), 10)));
      saveCart();
      var again = els.list.querySelector('[data-id="' + id + '"][data-qty="' + q.getAttribute('data-qty') + '"]');
      if (again && !again.disabled) again.focus();
    } else if (r) {
      delete cart[r.getAttribute('data-remove')];
      saveCart();
    }
  });

  /* ---------- WhatsApp ---------- */
  function waMessage() {
    var lines = [t('msgHello'), ''];
    cartItems().forEach(function (it) {
      lines.push('• ' + it.p.nameAr + (it.p.nameEn ? ' (' + it.p.nameEn + ')' : '') + ' × ' + it.qty + ' = ' + money(it.p.price * it.qty));
    });
    lines.push('', t('msgTotal') + ': ' + money(cartTotal()));
    return lines.join('\n');
  }
  function waLink() {
    var base = 'https://wa.me/' + waNumber();
    return cartItems().length ? base + '?text=' + encodeURIComponent(waMessage()) : base;
  }
  els.wa.addEventListener('click', function (e) {
    if (!cartItems().length) {
      e.preventDefault();
      showAlert(t('eCartEmpty'));
      document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
      return;
    }
    els.wa.href = waLink();
  });

  function showAlert(msg) { els.alert.textContent = msg; els.alert.hidden = false; }
  function hideAlert() { els.alert.hidden = true; els.alert.textContent = ''; }

  /* Floating cart button: shown while browsing products with items in the cart */
  var checkoutVisible = false;
  function updateFab() { els.fab.hidden = cartCount() === 0 || checkoutVisible; }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { checkoutVisible = en[0].isIntersecting; updateFab(); }, { rootMargin: '0px 0px -40% 0px' })
      .observe(document.getElementById('checkout'));
  }

  function announce(msg) { els.sr.textContent = ''; setTimeout(function () { els.sr.textContent = msg; }, 30); }

  /* ---------- Language switch ---------- */
  function renderAll() { applyStatic(); renderProducts(); renderCart(); }
  document.addEventListener('tadwir:lang', renderAll);

  /* ---------- Load data (and keep it fresh: the Telegram bot can change products at any time) ---------- */
  var lastJson = '';
  function load(first) {
    fetch('data/products.json?t=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (txt) {
        if (txt === lastJson) return;
        var json = JSON.parse(txt);
        if (!json || !Array.isArray(json.products)) throw new Error('bad data');
        lastJson = txt;
        data = json;
        data.settings = data.settings || {};
        byId = {};
        data.products.forEach(function (p) { byId[p.id] = p; });
        saveCart();
        renderAll();
      })
      .catch(function () {
        if (first) els.grid.innerHTML = '<p class="store-note">' + esc(t('loadFail')) + '</p>';
      });
  }
  applyStatic();
  load(true);
  setInterval(function () { if (!document.hidden) load(false); }, 30000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) load(false); });
})();
