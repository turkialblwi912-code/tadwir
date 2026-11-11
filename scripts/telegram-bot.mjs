/* ==========================================================
   Tadwir — تدوير | Telegram bot → website
   Run by GitHub Actions (.github/workflows/telegram-bot.yml).

   What the bot owner can do from Telegram:
     • shop products: add, edit, price, stock, sold out, delete, change image
     • "روح الفريق" gallery: add photos with captions, edit captions, delete
   Every change is saved to data/products.json / data/gallery.json
   (+ images in assets/store, assets/team) and pushed to the repository,
   which republishes the site.

   Secrets (GitHub → Settings → Secrets and variables → Actions):
     TELEGRAM_BOT_TOKEN  the bot token from @BotFather   (never put it in a file)
     TELEGRAM_CHAT_ID    chat id(s) allowed to control the site, comma-separated
   Optional environment:
     LISTEN_MINUTES      keep listening this long (long polling) so changes
                         are picked up within seconds; 0 = check once and exit
     LISTEN_UNTIL        yyyy-mm-dd; after this day the script only checks once
   ========================================================== */
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ALLOWED = String(process.env.TELEGRAM_CHAT_ID || '').split(',').map((s) => s.trim()).filter(Boolean);
const GIT = process.env.GITHUB_ACTIONS === 'true' || process.env.GIT_SYNC === '1';
const PRODUCTS = 'data/products.json';
const GALLERY = 'data/gallery.json';
const STATE = 'data/bot-state.json';
const TEAM_DIR = 'assets/team';
const STORE_DIR = 'assets/store';
const MAX_BYTES = 10 * 1024 * 1024;
const SOON = 'يظهر في الموقع خلال دقيقة تقريباً.';

// Not set up yet: finish quietly, so the schedule does not report a failure every few minutes.
if (!TOKEN) { console.log('TELEGRAM_BOT_TOKEN is not set yet. Add it as a repository secret to switch the bot on.'); process.exit(0); }

let listenMin = Number(process.env.LISTEN_MINUTES || 0);
if (process.env.LISTEN_UNTIL && Date.now() > Date.parse(process.env.LISTEN_UNTIL + 'T23:59:59Z')) listenMin = 0;
const deadline = Date.now() + listenMin * 60000;

/* ---------- Telegram ---------- */
async function api(method, params = {}, waitSec = 0) {
  try {
    const r = await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params),
      signal: AbortSignal.timeout((waitSec + 20) * 1000)
    });
    return await r.json();
  } catch (e) {
    return { ok: false, description: 'network error' };
  }
}
// o.kb = inline buttons, o.editMid = update that menu message instead of sending a new one
async function say(chatId, text, replyTo, o = {}) {
  const base = { chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true, ...(o.kb ? { reply_markup: { inline_keyboard: o.kb } } : {}) };
  if (o.editMid) {
    const r = await api('editMessageText', { ...base, message_id: o.editMid });
    if (r.ok) return r;
  }
  return api('sendMessage', { ...base, ...(replyTo ? { reply_to_message_id: replyTo, allow_sending_without_reply: true } : {}) });
}
async function download(fileId) {
  const info = await api('getFile', { file_id: fileId });
  if (!info.ok || !info.result.file_path) return null;
  let res;
  try { res = await fetch(`https://api.telegram.org/file/bot${TOKEN}/${info.result.file_path}`, { signal: AbortSignal.timeout(60000) }); } catch (e) { return null; }
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length === 0 || buf.length > MAX_BYTES) return null;
  const ext = buf[0] === 0xff && buf[1] === 0xd8 ? 'jpg' : buf[0] === 0x89 && buf[1] === 0x50 ? 'png' : buf.slice(8, 12).toString() === 'WEBP' ? 'webp' : '';
  return ext ? { buf, ext } : null;
}

/* ---------- helpers ---------- */
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const digits = (s) => String(s)
  .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x660))
  .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x6f0));
// Loose Arabic matching: no diacritics, unified alef / ya / ta-marbuta, optional "ال"
const norm = (s) => digits(s).toLowerCase().replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/\s+/g, ' ').trim();
const bare = (s) => norm(s).replace(/^ال/, '');
const readJson = (p, fallback) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return fallback; } };
const writeJson = (p, v) => fs.writeFileSync(p, JSON.stringify(v, null, 2) + '\n');
const sh = (cmd) => execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'] }).toString();

function findProduct(list, ref) {
  const r = norm(ref);
  if (!r) return null;
  if (/^\d+$/.test(r) && +r >= 1 && +r <= list.length) return list[+r - 1];
  const exact = list.filter((p) => [p.nameAr, p.nameEn, p.id].some((n) => n && (norm(n) === r || bare(n) === bare(r))));
  if (exact.length === 1) return exact[0];
  const part = list.filter((p) => [p.nameAr, p.nameEn].some((n) => n && bare(n).includes(bare(r))));
  return part.length === 1 ? part[0] : null;
}
const statusLine = (p, cur) => {
  const out = p.status !== 'available';
  const stock = Number.isInteger(p.stock) ? ` · الكمية ${p.stock}` : '';
  return `${out ? '🔴 نفدت' : '🟢 متوفر'} · ${p.price} ${cur}${stock}`;
};
const HELP = [
  '<b>بوت موقع تدوير</b>',
  '',
  '🛍 <b>المنتجات</b>',
  '• <code>المنتجات</code> — عرض القائمة بأرقامها',
  '• <code>سعر الموجة 50</code> — تغيير السعر',
  '• <code>كمية الموجة 5</code> — تحديد الكمية (0 = نفدت)',
  '• <code>نفد الموجة</code> / <code>متوفر الموجة</code>',
  '• <code>اسم الموجة = الاسم الجديد</code>',
  '• <code>انجليزي الموجة = Wave</code>',
  '• <code>وصف الموجة = الوصف الجديد</code>',
  '• <code>حذف منتج الموجة</code>',
  '• منتج جديد: أرسل صورة واكتب تحتها:',
  '<code>منتج\nالاسم\nالسعر\nالوصف</code>',
  '• تغيير صورة منتج: أرسل الصورة واكتب تحتها <code>صورة الموجة</code>',
  'يمكنك كتابة رقم المنتج بدل اسمه، مثل: <code>سعر 2 40</code>',
  '',
  '📸 <b>روح الفريق</b>',
  '• أرسل أي صورة مع نصها وستُضاف للموقع',
  '• لتعديل النص: عدّل تعليق الصورة في تيليجرام، أو ردّ عليها بـ <code>نص النص الجديد</code>',
  '• للحذف: ردّ على الصورة بكلمة <code>حذف</code> (أو أرسل <code>حذف</code> لحذف آخر صورة)'
].join('\n');

/* ---------- one message ---------- */
/* ---------- buttons ---------- */
const pending = new Map(); // chat id → what the next message answers, e.g. { a: 'price', pid: 'wave' }
const B = (text, data) => ({ text, callback_data: data });
const CANCEL = [[B('✖️ إلغاء', 'c')]];
const MAIN = '<b>لوحة تحكم موقع تدوير</b>\nاختر من الأزرار 👇\n\n📸 لإضافة صورة إلى «روح الفريق»: أرسل الصورة مع نصها هنا مباشرة.';
const mainKb = () => [[B('🛍 المنتجات', 'pl'), B('➕ منتج جديد', 'new')], [B('📸 صور روح الفريق', 'g')], [B('❓ شرح سريع', 'h')]];
const listKb = (products) => [
  ...products.map((p) => [B(`${p.status === 'available' ? '🟢' : '🔴'} ${p.nameAr} · ${p.price}`, 'p:' + p.id)]),
  [B('➕ منتج جديد', 'new')], [B('⬅️ رجوع', 'm')]
];
function card(p, cur, note) {
  const out = p.status !== 'available';
  const text = (note ? note + '\n\n' : '') + `<b>${esc(p.nameAr)}</b>${p.nameEn ? ' / ' + esc(p.nameEn) : ''}\n${statusLine(p, cur)}\n${esc(p.descAr || '')}`;
  const id = p.id;
  return { text, kb: [
    [B('💰 السعر', 'pp:' + id), B('🔢 الكمية', 'pq:' + id)],
    [B(out ? '🟢 رجّعه متوفر' : '🔴 نفدت الكمية', 'ps:' + id)],
    [B('✏️ الاسم', 'pn:' + id), B('📝 الوصف', 'pd:' + id)],
    [B('🖼 الصورة', 'pi:' + id), B('🔤 الاسم بالإنجليزي', 'pe:' + id)],
    [B('🗑 حذف المنتج', 'px:' + id)],
    [B('⬅️ المنتجات', 'pl')]
  ] };
}
const galleryMenu = (gallery) => ({
  text: `<b>صور روح الفريق</b> (${gallery.length})\nلإضافة صورة: أرسلها هنا مع نصها.\nللحذف اضغط على الصورة من القائمة:`,
  kb: [...gallery.slice(-6).reverse().map((g) => [B('🗑 ' + ((g.caption || 'صورة بدون نص').replace(/\s+/g, ' ').slice(0, 28)), 'gd:' + g.mid)]), [B('⬅️ رجوع', 'm')]]
});
const botMadeFile = (f) => f && new RegExp(`^${STORE_DIR}/p\\d+[\\w.\\-]*$`).test(f);

async function handleCallback(cq, ctx) {
  const msg = cq.message;
  await api('answerCallbackQuery', { callback_query_id: cq.id });
  if (!msg) return;
  const chatId = String(msg.chat.id);
  if (!ALLOWED.includes(chatId)) return;
  const { products, gallery, settings } = ctx;
  const cur = settings.currency || 'ريال';
  const show = (text, kb) => ctx.replies.push([chatId, text, null, { kb, editMid: msg.message_id }]);
  const [act, arg] = String(cq.data || '').split(':');
  const p = arg ? products.find((x) => x.id === arg) : null;
  const ask = (a, text, extra) => { pending.set(chatId, { a, pid: arg, ...(extra || {}) }); show(text, CANCEL); };
  const prev = pending.get(chatId);
  pending.delete(chatId);

  if (act === 'm' || act === 'c') return show(MAIN, mainKb());
  if (act === 'h') return show(HELP, [[B('⬅️ رجوع', 'm')]]);
  if (act === 'pl') return show(products.length ? '<b>المنتجات</b>\nاضغط على المنتج للتحكم فيه:' : 'لا توجد منتجات بعد.', listKb(products));
  if (act === 'new') return ask('new_name', '➕ <b>منتج جديد</b>\nاكتب <b>اسم</b> المنتج:', { d: {} });
  if (act === 'skip') { pending.set(chatId, { a: 'new_photo', d: (prev && prev.d) || {} }); return show('أرسل الآن <b>صورة</b> المنتج 🖼', CANCEL); }
  if (act === 'g') { const g = galleryMenu(gallery); return show(g.text, g.kb); }
  if (act === 'gd') {
    const i = gallery.findIndex((g) => String(g.mid) === arg);
    if (i >= 0) {
      const [gone] = gallery.splice(i, 1);
      if (/^assets\/team\/[\w.\-]+$/.test(gone.file)) fs.rmSync(gone.file, { force: true });
      ctx.changed = true;
    }
    const g = galleryMenu(gallery);
    return show((i >= 0 ? '🗑 حُذفت الصورة. ' + SOON + '\n\n' : '') + g.text, g.kb);
  }
  if (act === 'gc') return ask('gcap', 'اكتب <b>النص الجديد</b> للصورة:', { mid: Number(arg) });
  if (!p) return show('⚠️ هذا المنتج غير موجود.', listKb(products));

  if (act === 'p') { const c = card(p, cur); return show(c.text, c.kb); }
  if (act === 'pp') return ask('price', `💰 اكتب <b>السعر الجديد</b> لـ «${esc(p.nameAr)}» (رقم فقط):`);
  if (act === 'pq') return ask('qty', `🔢 اكتب <b>الكمية</b> المتوفرة من «${esc(p.nameAr)}» (0 = نفدت):`);
  if (act === 'pn') return ask('name', `✏️ اكتب <b>الاسم الجديد</b> لـ «${esc(p.nameAr)}»:`);
  if (act === 'pe') return ask('en', `🔤 اكتب <b>الاسم بالإنجليزي</b> لـ «${esc(p.nameAr)}»:`);
  if (act === 'pd') return ask('desc', `📝 اكتب <b>الوصف الجديد</b> لـ «${esc(p.nameAr)}»:`);
  if (act === 'pi') return ask('pimg', `🖼 أرسل <b>الصورة الجديدة</b> لـ «${esc(p.nameAr)}»:`);
  if (act === 'ps') {
    if (p.status === 'available') { p.status = 'soldout'; if (Number.isInteger(p.stock)) p.stock = 0; }
    else { p.status = 'available'; if (p.stock === 0) delete p.stock; }
    ctx.changed = true;
    const c = card(p, cur, '✅ تم. ' + SOON);
    return show(c.text, c.kb);
  }
  if (act === 'px') return show(`متأكد أنك تريد حذف «${esc(p.nameAr)}»؟`, [[B('🗑 نعم، احذفه', 'pX:' + p.id), B('لا', 'p:' + p.id)]]);
  if (act === 'pX') {
    products.splice(products.indexOf(p), 1);
    for (const f of [p.image, p.image2]) if (botMadeFile(f)) fs.rmSync(f, { force: true });
    ctx.changed = true;
    return show(`🗑 حُذف «${esc(p.nameAr)}». ${SOON}`, listKb(products));
  }
}

// The next message after a button like "السعر" is the answer to it.
async function answerPending(pend, msg, ctx, reply, fileId, text) {
  const chatId = String(msg.chat.id);
  const { products, gallery, settings } = ctx;
  const cur = settings.currency || 'ريال';
  const p = pend.pid ? products.find((x) => x.id === pend.pid) : null;
  const again = (t) => reply(t, { kb: CANCEL });
  const done = (note) => { pending.delete(chatId); const c = card(p, cur, note); reply(c.text, { kb: c.kb }); };

  if (pend.a === 'new_name') {
    if (!text) return again('اكتب اسم المنتج نصاً:');
    pend.d.name = text.slice(0, 60); pend.a = 'new_price';
    return again('💰 اكتب <b>السعر</b> (رقم فقط):');
  }
  if (pend.a === 'new_price') {
    const price = Number(digits(text).replace(/[^\d.]/g, ''));
    if (!(price > 0) || price > 100000) return again('⚠️ اكتب السعر رقماً فقط، مثل: 45');
    pend.d.price = price; pend.a = 'new_desc';
    return reply('📝 اكتب <b>وصفاً قصيراً</b> للمنتج، أو اضغط تخطي:', { kb: [[B('⏭ تخطي', 'skip')], ...CANCEL] });
  }
  if (pend.a === 'new_desc') {
    if (!text) return again('اكتب الوصف نصاً:');
    pend.d.desc = text.slice(0, 300); pend.a = 'new_photo';
    return again('أرسل الآن <b>صورة</b> المنتج 🖼');
  }
  if (pend.a === 'new_photo' || pend.a === 'pimg') {
    if (!fileId) return again('أرسل صورة (وليس نصاً) 🖼');
    if (pend.a === 'pimg' && !p) { pending.delete(chatId); return reply('⚠️ هذا المنتج غير موجود.', { kb: mainKb() }); }
    const img = await download(fileId);
    if (!img) return again('⚠️ تعذّر تنزيل الصورة. أعد إرسالها.');
    fs.mkdirSync(STORE_DIR, { recursive: true });
    if (pend.a === 'pimg') {
      const file = `${STORE_DIR}/${p.id}-${msg.message_id}.${img.ext}`;
      fs.writeFileSync(file, img.buf);
      for (const f of [p.image, p.image2]) if (botMadeFile(f)) fs.rmSync(f, { force: true });
      p.image = file; delete p.image2;
      ctx.changed = true;
      return done('✅ تم تغيير الصورة. ' + SOON);
    }
    const d = pend.d || {};
    if (!d.name || !(d.price > 0)) { pending.delete(chatId); return reply('⚠️ انقطعت إضافة المنتج. ابدأ من جديد.', { kb: mainKb() }); }
    const id = 'p' + msg.message_id;
    const file = `${STORE_DIR}/${id}.${img.ext}`;
    fs.writeFileSync(file, img.buf);
    const np = { id, nameAr: d.name, nameEn: '', descAr: d.desc || '', descEn: '', price: d.price, status: 'available', image: file };
    products.push(np);
    ctx.changed = true;
    pending.delete(chatId);
    const c = card(np, cur, `✅ أُضيف المنتج. ${SOON}`);
    return reply(c.text, { kb: c.kb });
  }
  if (pend.a === 'gcap') {
    const ph = gallery.find((g) => g.mid === pend.mid);
    pending.delete(chatId);
    if (!ph) return reply('⚠️ هذه الصورة غير موجودة في الموقع.', { kb: mainKb() });
    ph.caption = text.slice(0, 600); ctx.changed = true;
    return reply('✅ تم تعديل نص الصورة. ' + SOON, { kb: mainKb() });
  }
  if (!p) { pending.delete(chatId); return reply('⚠️ هذا المنتج غير موجود.', { kb: mainKb() }); }
  if (!text) return again('اكتب القيمة نصاً:');
  if (pend.a === 'price') {
    const price = Number(digits(text).replace(/[^\d.]/g, ''));
    if (!(price > 0) || price > 100000) return again('⚠️ اكتب السعر رقماً فقط، مثل: 45');
    p.price = price; ctx.changed = true;
    return done(`✅ السعر صار ${price} ${cur}. ${SOON}`);
  }
  if (pend.a === 'qty') {
    const q = digits(text).trim();
    if (!/^\d{1,4}$/.test(q)) return again('⚠️ اكتب الكمية رقماً فقط، مثل: 5');
    p.stock = Number(q); p.status = p.stock > 0 ? 'available' : 'soldout'; ctx.changed = true;
    return done(p.stock > 0 ? `✅ الكمية صارت ${p.stock}. ${SOON}` : `🔴 صارت «نفدت الكمية». ${SOON}`);
  }
  if (pend.a === 'name') { p.nameAr = text.slice(0, 60); ctx.changed = true; return done('✅ تم تغيير الاسم. ' + SOON); }
  if (pend.a === 'en') { p.nameEn = text.slice(0, 60); ctx.changed = true; return done('✅ تم حفظ الاسم بالإنجليزي. ' + SOON); }
  if (pend.a === 'desc') { p.descAr = text.slice(0, 300); ctx.changed = true; return done('✅ تم تغيير الوصف. ' + SOON); }
  pending.delete(chatId);
}

const albumProduct = new Map(); // media_group_id → product id (second album photo becomes image2)

async function handle(msg, edited, ctx) {
  const chatId = String(msg.chat.id);
  if (!ALLOWED.includes(chatId)) {
    console.log(`Ignored a message from chat id ${chatId} (not in TELEGRAM_CHAT_ID).`);
    if (!ALLOWED.length && !edited) ctx.replies.push([chatId, `رقم محادثتك هو <code>${chatId}</code>\nأضِفه في GitHub كسرّ باسم TELEGRAM_CHAT_ID ليبدأ البوت بالعمل.`, msg.message_id]);
    return;
  }
  const { products, gallery, settings } = ctx;
  const cur = settings.currency || 'ريال';
  const reply = (t, o) => ctx.replies.push([chatId, t, msg.message_id, o]);
  const fileId = msg.photo && msg.photo.length ? msg.photo[msg.photo.length - 1].file_id
    : (msg.document && /^image\/(jpeg|png|webp)$/.test(msg.document.mime_type || '') ? msg.document.file_id : '');
  const caption = String(msg.caption || '').trim();
  const text = String(msg.text || '').trim();

  /* edited caption of a gallery photo */
  if (edited) {
    const ph = gallery.find((g) => g.mid === msg.message_id);
    if (ph && fileId && ph.caption !== caption) { ph.caption = caption.slice(0, 600); ctx.changed = true; reply('✅ تم تعديل نص الصورة. ' + SOON); }
    return;
  }

  /* ----- answering a button's question ----- */
  const pend = pending.get(chatId);
  if (pend) {
    if (/^(الغاء|إلغاء|cancel|\/start|\/cancel)$/i.test(text)) { pending.delete(chatId); reply(MAIN, { kb: mainKb() }); return; }
    await answerPending(pend, msg, ctx, reply, fileId, text);
    return;
  }

  /* ----- photos ----- */
  if (fileId) {
    const first = norm(caption.split('\n')[0]);
    const isNew = first === 'منتج' || first === 'product' || /^(منتج|product)\s*\|/.test(first);
    const imgFor = caption.match(/^\s*(?:صوره|صورة|image)\s+(.+)$/i);
    const albumPid = msg.media_group_id && albumProduct.get(msg.media_group_id);

    if (isNew) {
      const parts = (caption.includes('|') ? caption.split('|') : caption.split('\n')).map((s) => s.trim()).filter(Boolean).slice(1);
      const name = (parts[0] || '').slice(0, 60);
      const price = Number(digits(parts[1] || '').replace(/[^\d.]/g, ''));
      const desc = parts.slice(2).join(' ').slice(0, 300);
      if (!name || !(price > 0) || price > 100000) { reply('⚠️ لإضافة منتج اكتب تحت الصورة:\n<code>منتج\nالاسم\nالسعر\nالوصف</code>'); return; }
      const img = await download(fileId);
      if (!img) { reply('⚠️ تعذّر تنزيل الصورة. أعد إرسالها.'); return; }
      const id = 'p' + msg.message_id;
      const file = `${STORE_DIR}/${id}.${img.ext}`;
      fs.mkdirSync(STORE_DIR, { recursive: true });
      fs.writeFileSync(file, img.buf);
      products.push({ id, nameAr: name, nameEn: '', descAr: desc, descEn: '', price, status: 'available', image: file });
      if (msg.media_group_id) albumProduct.set(msg.media_group_id, id);
      ctx.changed = true;
      reply(`✅ أُضيف المنتج «${esc(name)}» بسعر ${price} ${cur}. ${SOON}`);
      return;
    }
    // "صورة <منتج>" changes a product image; if no product has that name it is an ordinary gallery caption
    const target = albumPid ? products.find((x) => x.id === albumPid) : (imgFor ? findProduct(products, imgFor[1]) : null);
    if (target) {
      const p = target;
      const img = await download(fileId);
      if (!img) { reply('⚠️ تعذّر تنزيل الصورة. أعد إرسالها.'); return; }
      const file = `${STORE_DIR}/${p.id}-${msg.message_id}.${img.ext}`;
      fs.mkdirSync(STORE_DIR, { recursive: true });
      fs.writeFileSync(file, img.buf);
      const botMade = (f) => f && new RegExp(`^${STORE_DIR}/p\\d+[\\w.\\-]*$`).test(f);
      if (albumPid) p.image2 = file;
      else {
        for (const f of [p.image, p.image2]) if (botMade(f)) fs.rmSync(f, { force: true }); // drop the pictures it replaces
        p.image = file; delete p.image2;
      }
      ctx.changed = true;
      if (!albumPid) reply(`✅ تم تغيير صورة «${esc(p.nameAr)}». ${SOON}`);
      return;
    }
    /* anything else → team gallery */
    if (gallery.some((g) => g.mid === msg.message_id)) return;
    const img = await download(fileId);
    if (!img) { reply('⚠️ تعذّر تنزيل الصورة. أعد إرسالها.'); return; }
    const date = new Date(msg.date * 1000).toISOString();
    const file = `${TEAM_DIR}/${date.slice(0, 10)}-${msg.message_id}.${img.ext}`;
    fs.mkdirSync(TEAM_DIR, { recursive: true });
    fs.writeFileSync(file, img.buf);
    gallery.push({ file, caption: caption.slice(0, 600), date, mid: msg.message_id });
    ctx.changed = true;
    if (!msg.media_group_id || caption) reply('✅ أُضيفت الصورة إلى «روح الفريق». ' + SOON, { kb: [[B('✏️ تعديل النص', 'gc:' + msg.message_id), B('🗑 حذف', 'gd:' + msg.message_id)], [B('🏠 القائمة', 'm')]] });
    return;
  }

  /* ----- text commands ----- */
  if (!text) return;
  const t = norm(text);
  const repliedMid = msg.reply_to_message && msg.reply_to_message.message_id;

  if (/^(\/start|\/menu|قائمه|القائمه|menu|مرحبا|هلا|السلام عليكم)/.test(t)) { reply(MAIN, { kb: mainKb() }); return; }
  if (/^(\/help|مساعده|help|الاوامر)/.test(t)) { reply(HELP, { kb: [[B('🏠 القائمة', 'm')]] }); return; }

  if (/^(\/products|المنتجات|منتجات)$/.test(t)) {
    reply(products.length
      ? '<b>المنتجات</b>\n' + products.map((p, i) => `${i + 1}. ${esc(p.nameAr)}${p.nameEn ? ' / ' + esc(p.nameEn) : ''}\n    ${statusLine(p, cur)}`).join('\n')
      : 'لا توجد منتجات بعد.');
    return;
  }

  /* gallery: delete / edit by replying to the photo */
  const delWord = /^(\/delete(@\w+)?|حذف|احذف)$/.test(t);
  if (delWord) {
    const i = repliedMid ? gallery.findIndex((g) => g.mid === repliedMid) : gallery.length - 1;
    if (i < 0) { reply(repliedMid ? '⚠️ هذه الصورة غير موجودة في الموقع.' : 'لا توجد صور في «روح الفريق».'); return; }
    const [gone] = gallery.splice(i, 1);
    if (/^assets\/team\/[\w.\-]+$/.test(gone.file)) fs.rmSync(gone.file, { force: true });
    ctx.changed = true;
    reply('🗑 حُذفت الصورة من «روح الفريق». ' + SOON);
    return;
  }
  const cap = text.match(/^\s*(?:نص|تعليق|caption)\s+([\s\S]+)$/i);
  if (cap && repliedMid) {
    const ph = gallery.find((g) => g.mid === repliedMid);
    if (!ph) { reply('⚠️ هذه الصورة غير موجودة في الموقع.'); return; }
    ph.caption = cap[1].trim().slice(0, 600);
    ctx.changed = true;
    reply('✅ تم تعديل نص الصورة. ' + SOON);
    return;
  }

  /* products */
  const notFound = () => reply('⚠️ لم أجد هذا المنتج. أرسل <code>المنتجات</code> لعرض القائمة بأرقامها.');
  let m;
  if ((m = text.match(/^\s*(?:حذف|احذف)\s+(?:منتج|المنتج)\s+(.+)$/))) {
    const p = findProduct(products, m[1]);
    if (!p) return notFound();
    products.splice(products.indexOf(p), 1);
    for (const f of [p.image, p.image2]) if (f && new RegExp(`^${STORE_DIR}/p\\d+[\\w.\\-]*$`).test(f)) fs.rmSync(f, { force: true });
    ctx.changed = true;
    reply(`🗑 حُذف المنتج «${esc(p.nameAr)}». ${SOON}`);
    return;
  }
  if ((m = digits(text).match(/^\s*(?:سعر|السعر|price)\s+(.+?)\s+(\d+(?:\.\d+)?)\s*(?:ريال|ر\.?س|sar)?\s*$/i))) {
    const p = findProduct(products, m[1]);
    if (!p) return notFound();
    const price = Number(m[2]);
    if (!(price > 0) || price > 100000) { reply('⚠️ السعر غير صحيح.'); return; }
    p.price = price; ctx.changed = true;
    reply(`✅ سعر «${esc(p.nameAr)}» صار ${price} ${cur}. ${SOON}`);
    return;
  }
  if ((m = digits(text).match(/^\s*(?:كميه|كمية|الكميه|الكمية|عدد|stock|qty)\s+(.+?)\s+(\d{1,4})\s*$/i))) {
    const p = findProduct(products, m[1]);
    if (!p) return notFound();
    p.stock = Number(m[2]);
    p.status = p.stock > 0 ? 'available' : 'soldout';
    ctx.changed = true;
    reply(p.stock > 0 ? `✅ كمية «${esc(p.nameAr)}» صارت ${p.stock}. ${SOON}` : `🔴 «${esc(p.nameAr)}» صارت «نفدت الكمية». ${SOON}`);
    return;
  }
  if ((m = text.match(/^\s*(?:نفد|نفذ|نفدت|نفذت|خلص|خلصت)\s+(.+)$/))) {
    const p = findProduct(products, m[1]);
    if (!p) return notFound();
    p.status = 'soldout'; if (Number.isInteger(p.stock)) p.stock = 0;
    ctx.changed = true;
    reply(`🔴 «${esc(p.nameAr)}» صارت «نفدت الكمية». ${SOON}`);
    return;
  }
  if ((m = text.match(/^\s*(?:متوفر|متوفره|متوفرة|رجع|رجعت)\s+(.+)$/))) {
    const p = findProduct(products, m[1]);
    if (!p) return notFound();
    p.status = 'available'; if (p.stock === 0) delete p.stock;
    ctx.changed = true;
    reply(`🟢 «${esc(p.nameAr)}» صارت «متوفر». ${SOON}`);
    return;
  }
  if ((m = text.match(/^\s*(اسم|الاسم|انجليزي|إنجليزي|english|وصف|الوصف|وصف انجليزي|description)\s+(.+?)\s*=\s*([\s\S]+)$/i))) {
    const p = findProduct(products, m[2]);
    if (!p) return notFound();
    const key = norm(m[1]), val = m[3].trim();
    if (!val) { reply('⚠️ اكتب القيمة الجديدة بعد علامة ='); return; }
    if (key === 'اسم' || key === 'الاسم') p.nameAr = val.slice(0, 60);
    else if (key === 'انجليزي' || key === 'english') p.nameEn = val.slice(0, 60);
    else if (key === 'وصف انجليزي' || key === 'description') p.descEn = val.slice(0, 300);
    else p.descAr = val.slice(0, 300);
    ctx.changed = true;
    reply(`✅ تم تعديل «${esc(p.nameAr)}». ${SOON}`);
    return;
  }
  reply(MAIN, { kb: mainKb() });
}

/* ---------- save & publish ---------- */
function publish() {
  if (!GIT) return true;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      sh('git add -A data assets/team assets/store');
      try { sh('git -c user.name="tadwir-bot" -c user.email="actions@users.noreply.github.com" commit -m "Site update from Telegram"'); } catch (e) { /* nothing to commit */ }
      sh('git pull --rebase --autostash');
      sh('git push');
      return true;
    } catch (e) {
      console.error(`Publish attempt ${attempt} failed: ${String(e.stderr || e.message).slice(0, 300)}`);
    }
  }
  return false;
}

/* ---------- main loop ---------- */
await api('setMyCommands', { commands: [{ command: 'start', description: 'القائمة الرئيسية' }] });
let offset = (readJson(STATE, {}).offset) || (readJson(GALLERY, {}).offset) || 0;
let passes = 0;
do {
  const waitSec = listenMin ? Math.max(0, Math.min(50, Math.floor((deadline - Date.now()) / 1000))) : 0;
  const res = await api('getUpdates', { offset, timeout: waitSec, allowed_updates: ['message', 'edited_message', 'channel_post', 'edited_channel_post', 'callback_query'] }, waitSec);
  passes++;
  if (!res.ok) {
    console.error('getUpdates failed:', res.description);
    if (!listenMin) process.exit(1);
    await new Promise((r) => setTimeout(r, 5000));
    continue;
  }
  if (!res.result.length) continue;

  if (GIT) { try { sh('git pull --rebase --autostash'); } catch (e) { console.error('pull failed'); } }
  const store = readJson(PRODUCTS, { settings: {}, products: [] });
  const gal = readJson(GALLERY, { photos: [] });
  const ctx = { products: store.products || (store.products = []), settings: store.settings || {}, gallery: Array.isArray(gal.photos) ? gal.photos : [], replies: [], changed: false };

  for (const up of res.result) {
    offset = up.update_id + 1;
    if (up.callback_query) {
      try { await handleCallback(up.callback_query, ctx); } catch (e) { console.error('button error:', e.message); }
      continue;
    }
    const edited = up.edited_message || up.edited_channel_post;
    const msg = up.message || up.channel_post || edited;
    if (!msg) continue;
    try { await handle(msg, !!edited, ctx); } catch (e) { console.error('handler error:', e.message); }
  }

  let saved = true;
  if (ctx.changed) {
    writeJson(PRODUCTS, store);
    writeJson(GALLERY, { photos: ctx.gallery });
    writeJson(STATE, { offset });
    saved = publish();
    console.log(saved ? 'Saved changes.' : 'Could not publish changes.');
  }
  for (const [chatId, text, replyTo, o] of ctx.replies) {
    if (saved) await say(chatId, text, replyTo, o || {});
    else await say(chatId, '⚠️ تعذّر حفظ التغيير الآن. أعد المحاولة بعد قليل.', replyTo, { kb: mainKb() });
  }
} while (listenMin && Date.now() < deadline);

// Tell Telegram everything up to `offset` is handled, so nothing is processed twice next run.
if (offset) await api('getUpdates', { offset, timeout: 0, limit: 1 });
console.log(`Finished after ${passes} check(s).`);
