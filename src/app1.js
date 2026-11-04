'use strict';
/* =====================================================================
   1. Utilities
   ===================================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = (p = 'id') => p + '-' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-5);
const DAY = 864e5, HOUR = 36e5, MIN = 6e4;
const MON_G = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const MON_N = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
const MON_S = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const WD = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
const pad2 = n => String(n).padStart(2, '0');
const startOfDay = ts => { const d = new Date(ts); d.setHours(0, 0, 0, 0); return +d; };
const startOfWeek = ts => { const d = new Date(startOfDay(ts)); const wd = (d.getDay() + 6) % 7; return +d - wd * DAY; };
function fmtD(ts) { const d = new Date(ts); return `${d.getDate()} ${MON_G[d.getMonth()]}${d.getFullYear() !== new Date().getFullYear() ? ' ' + d.getFullYear() : ''}`; }
function fmtDY(ts) { const d = new Date(ts); return `${d.getDate()} ${MON_G[d.getMonth()]} ${d.getFullYear()}`; }
function fmtDS(ts) { const d = new Date(ts); return `${d.getDate()} ${MON_S[d.getMonth()]}`; }
function fmtT(ts) { const d = new Date(ts); return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; }
function fmtDT(ts) { return `${fmtD(ts)}, ${fmtT(ts)}`; }
function fmtWD(ts) { return WD[new Date(ts).getDay()]; }
function fmtMY(ts) { const d = new Date(ts); return `${MON_N[d.getMonth()]} ${d.getFullYear()}`; }
function fmtMonShortY(ts) { const d = new Date(ts); return `${MON_S[d.getMonth()]} ${d.getFullYear()}`; }
function monthInput(d) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`; }
function parseMonth(s) { const m = /^(\d{4})-(\d{2})$/.exec(String(s || '')); return m ? new Date(+m[1], +m[2] - 1, 1) : null; }
function dtInput(ts) { const d = new Date(ts); return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`; }
function dInput(ts) { const d = new Date(ts); return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }
function plural(n, a, b, c) { n = Math.abs(n) % 100; const n1 = n % 10; if (n > 10 && n < 20) return c; if (n1 > 1 && n1 < 5) return b; if (n1 === 1) return a; return c; }
function ago(ts) {
  const s = (Date.now() - ts) / 1000;
  if (s < 60) return 'только что';
  if (s < 3600) return `${Math.floor(s / 60)} мин назад`;
  if (s < 86400) return `${Math.floor(s / 3600)} ч назад`;
  const d = Math.floor(s / 86400);
  if (d === 1) return 'вчера';
  if (d < 7) return `${d} ${plural(d, 'день', 'дня', 'дней')} назад`;
  return fmtD(ts);
}
function dur(ms) { const m = Math.max(1, Math.round(ms / MIN)); const h = Math.floor(m / 60); return h ? `${h} ч ${m % 60} мин` : `${m} мин`; }
function monthsBetween(a, b) { return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()); }
function initials(name) { return String(name || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase(); }
function shortName(name) { const p = String(name || '').trim().split(/\s+/); return p.length > 1 ? `${p[0]} ${p[1][0]}.` : (p[0] || ''); }
function hash4(s) { let h = 0; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return String(h % 10000).padStart(4, '0'); }
function endP(s) { return /[.?!…]$/.test(s) ? s : s + '.'; }
function orcidValid(s) {
  const d = String(s || '').replace(/[^0-9Xx]/g, '').toUpperCase();
  if (!/^\d{15}[\dX]$/.test(d)) return false;
  let t = 0;
  for (let i = 0; i < 15; i++) t = (t + +d[i]) * 2;
  const r = (12 - (t % 11)) % 11;
  return (r === 10 ? 'X' : String(r)) === d[15];
}

/* Lightweight Markdown → HTML for assistant and AI output. Text is escaped first. */
function md(text) {
  const lines = String(text || '').replace(/\r/g, '').split('\n');
  let html = '', list = null, table = null;
  const inline = s => esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/(https?:\/\/[^\s<)]+[^\s<).,;:!?»])/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
  const closeList = () => { if (list) { html += `</${list}>`; list = null; } };
  const closeTable = () => {
    if (!table) return;
    const rows = table.filter(r => !/^\s*\|?\s*:?-{2,}/.test(r));
    const cells = r => r.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map(c => c.trim());
    html += '<table>' + rows.map((r, i) => '<tr>' + cells(r).map(c => i === 0 ? `<th>${inline(c)}</th>` : `<td>${inline(c)}</td>`).join('') + '</tr>').join('') + '</table>';
    table = null;
  };
  for (const raw of lines) {
    const l = raw.trim();
    let m;
    if (l.startsWith('|')) { closeList(); (table || (table = [])).push(l); continue; }
    closeTable();
    if (!l) { closeList(); continue; }
    if ((m = l.match(/^(\d+)[.)]\s+(.*)$/))) {
      if (list !== 'ol') { closeList(); html += `<ol start="${+m[1]}">`; list = 'ol'; }
      html += `<li>${inline(m[2])}</li>`; continue;
    }
    if ((m = l.match(/^[•\-–*]\s+(.*)$/))) {
      if (list !== 'ul') { closeList(); html += '<ul>'; list = 'ul'; }
      html += `<li>${inline(m[1])}</li>`; continue;
    }
    if ((m = l.match(/^#{1,4}\s+(.*)$/))) { closeList(); html += `<p class="md-h">${inline(m[1])}</p>`; continue; }
    closeList();
    html += `<p>${inline(l)}</p>`;
  }
  closeTable(); closeList();
  return html;
}

/* ---------- Язык интерфейса: қазақша · русский · English ----------
   Шаблоны написаны по-русски; переводчик меняет видимый текст и подписи (title, placeholder, aria-label).
   Числа, даты, «кавычки» и относительное время подставляются в ключ как {0}, {D0}, {R0}, {Q0}.
   Содержимое (обращения, ответы базы знаний, тексты промптов) остаётся на языке автора. */
const LANGS = ['kk', 'ru', 'en'];
let LANG = (() => { try { const v = localStorage.getItem('srl-lang'); return LANGS.includes(v) ? v : 'ru'; } catch (e) { return 'ru'; } })();
const L3 = (ru, kk, en) => LANG === 'kk' ? kk : LANG === 'en' ? en : ru;
const I18N = { kk: new Map(), en: new Map() };
(typeof I18N_ROWS !== 'undefined' ? I18N_ROWS : []).forEach(([ru, kk, en]) => { const k = String(ru).trim(); if (kk) I18N.kk.set(k, kk); if (en) I18N.en.set(k, en); });
const CYR = /[А-Яа-яЁё]/;
const RU_MON_G = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const RU_MON_N = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
const RU_MON_S = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const RU_WD = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
const KK_MON = ['қаңтар', 'ақпан', 'наурыз', 'сәуір', 'мамыр', 'маусым', 'шілде', 'тамыз', 'қыркүйек', 'қазан', 'қараша', 'желтоқсан'];
const KK_MON_S = ['қаң', 'ақп', 'нау', 'сәу', 'мам', 'мау', 'шіл', 'там', 'қыр', 'қаз', 'қар', 'жел'];
const KK_WD = ['жс', 'дс', 'сс', 'ср', 'бс', 'жм', 'сб'];
const EN_MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const EN_MON_S = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const EN_WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const I18N_DATE_RX = new RegExp(`(\\d{1,2}) (${RU_MON_G.join('|')})(?: (\\d{4}))?(?![а-я])|(\\d{1,2}) (${RU_MON_S.join('|')})(?![а-я])|(${RU_MON_N.join('|')}) (\\d{4})|(${RU_MON_S.join('|')}) (\\d{4})`, 'g');
const I18N_REL_RX = /только что|вчера|(\d+) мин назад|(\d+) ч назад|(\d+) (?:день|дня|дней) назад|(\d+) ч (\d+) мин|(\d+) мин(?![а-я])/g;
function i18nDate(m) {
  const [, d1, mg, y1, d2, ms, mn, y3, ms4, y4] = m;
  if (d1 && mg === 'мая' && y1) return L3(m[0], `${d1} ${KK_MON_S[4]} ${y1}`, `${d1} ${EN_MON_S[4]} ${y1}`); // «28 мая 2026» — краткая форма, как «28 мар 2026»
  if (d1) { const i = RU_MON_G.indexOf(mg); return L3(m[0], y1 ? `${y1} ж. ${d1} ${KK_MON[i]}` : `${d1} ${KK_MON[i]}`, y1 ? `${d1} ${EN_MON[i]} ${y1}` : `${d1} ${EN_MON[i]}`); }
  if (d2) { const i = RU_MON_S.indexOf(ms); return L3(m[0], `${d2} ${KK_MON_S[i]}`, `${d2} ${EN_MON_S[i]}`); }
  if (mn) { const i = RU_MON_N.indexOf(mn); return L3(m[0], `${y3} ж. ${KK_MON[i]}`, `${EN_MON[i]} ${y3}`); }
  const i = RU_MON_S.indexOf(ms4); return L3(m[0], `${KK_MON_S[i]} ${y4}`, `${EN_MON_S[i]} ${y4}`);
}
function i18nRel(m) {
  if (m[0] === 'только что') return L3(m[0], 'жаңа ғана', 'just now');
  if (m[0] === 'вчера') return L3(m[0], 'кеше', 'yesterday');
  if (m[1]) return L3(m[0], `${m[1]} мин бұрын`, `${m[1]} min ago`);
  if (m[2]) return L3(m[0], `${m[2]} сағ бұрын`, `${m[2]} h ago`);
  if (m[3]) return L3(m[0], `${m[3]} күн бұрын`, `${m[3]} days ago`);
  if (m[4]) return L3(m[0], `${m[4]} сағ ${m[5]} мин`, `${m[4]} h ${m[5]} min`);
  return L3(m[0], `${m[6]} мин`, `${m[6]} min`);
}
/* Ключ перевода: текст с подстановками вместо чисел, дат, времени и «цитат» */
function i18nKey(t) {
  const D = [], R = [], Q = [], N = [], W = [];
  let k = t.replace(I18N_DATE_RX, (...a) => { D.push(i18nDate(a)); return `{D${D.length - 1}}`; });
  k = k.replace(I18N_REL_RX, (...a) => { R.push(i18nRel(a)); return `{R${R.length - 1}}`; });
  k = k.replace(/«([^«»]+)»/g, (m, q) => { Q.push(trS(q)); return `«{Q${Q.length - 1}}»`; });
  k = k.replace(/(^|[\s(])(вс|пн|вт|ср|чт|пт|сб)(?=,)/g, (m, pre, w) => { W.push(L3(w, KK_WD[RU_WD.indexOf(w)], EN_WD[RU_WD.indexOf(w)])); return `${pre}{W${W.length - 1}}`; });
  k = k.replace(/\{[DRQW]\d+\}|\d+(?:[.,]\d+)?/g, m => { if (m[0] === '{') return m; N.push(m); return `{${N.length - 1}}`; });
  return { k, D, R, Q, N, W };
}
function trS(s) {
  if (LANG === 'ru' || s == null) return s;
  const str = String(s), t = str.trim();
  if (!t || !CYR.test(t)) return s;
  const out = trCore(t);
  if (out == null) return s;
  return str.match(/^\s*/)[0] + out + str.match(/\s*$/)[0];
}
function trCore(t) {
  const map = I18N[LANG];
  let out = map.get(t);
  if (out != null) return out;
  if (LANG === 'kk' && /[әғқңөұүһі]/i.test(t)) return t; // уже по-казахски
  let i = RU_MON_S.indexOf(t); if (i >= 0) return L3(t, KK_MON_S[i], EN_MON_S[i]);
  i = RU_WD.indexOf(t); if (i >= 0) return L3(t, KK_WD[i], EN_WD[i]);
  i = RU_MON_N.indexOf(t); if (i >= 0) return L3(t, KK_MON[i], EN_MON[i]);
  if (out == null) {
    const x = i18nKey(t), tpl = map.get(x.k);
    if (tpl != null) out = tpl.replace(/\{([DRQW]?)(\d+)\}/g, (m, kind, i) => (kind === 'D' ? x.D : kind === 'R' ? x.R : kind === 'Q' ? x.Q : kind === 'W' ? x.W : x.N)[+i] ?? m);
    else if (x.k !== t && /^(?:\{[DRQW]?\d+\}|[\s·,.:;—–()-])+$/.test(x.k)) out = x.k.replace(/\{([DRQW]?)(\d+)\}/g, (m, kind, i) => (kind === 'D' ? x.D : kind === 'R' ? x.R : kind === 'Q' ? x.Q : kind === 'W' ? x.W : x.N)[+i] ?? m);
  }
  if (out == null) for (const [re, kk, en] of (typeof I18N_PATTERNS !== 'undefined' ? I18N_PATTERNS : [])) {
    const m = t.match(re);
    if (m) { const f = LANG === 'kk' ? kk : en; out = typeof f === 'function' ? f(...m.slice(1)) : f; break; }
  }
  /* Составные подписи «A · B · C»: каждая часть переводится отдельно */
  if (out == null && t.includes(' · ')) {
    const parts = t.split(' · '), tp = parts.map(x => CYR.test(x) ? trCore(x.trim()) : x);
    if (tp.some((x, j) => x != null && x !== parts[j])) out = tp.map((x, j) => x == null ? parts[j] : x).join(' · ');
  }
  /* «Подпись: значение» — если подпись есть в словаре */
  if (out == null) {
    const c = t.indexOf(': ');
    if (c > 0 && c < 60) { let lab = map.get(t.slice(0, c + 1)); if (lab == null && /^[\d\s.,%:–-]+$/.test(t.slice(c + 2))) { const l2 = trCore(t.slice(0, c)); if (l2 != null) lab = l2 + ':'; } if (lab != null) { const v = t.slice(c + 2), vt = CYR.test(v) ? trCore(v) : null; out = lab + ' ' + (vt == null ? v : vt); } }
  }
  return out;
}
const I18N_SKIP = 'script,style,textarea,pre,code,.tpl,.md,.no-i18n';
const I18N_ATTRS = ['title', 'placeholder', 'aria-label', 'data-tip', 'data-tipv'];
const I18N_ORIG = new WeakMap(), I18N_SET = new WeakMap(), I18N_AREC = new WeakMap();
function i18nText(n) {
  const cur = n.nodeValue;
  if (!I18N_ORIG.has(n) && !CYR.test(cur)) return;
  let orig = I18N_ORIG.get(n);
  if (orig === undefined || cur !== I18N_SET.get(n)) { orig = cur; I18N_ORIG.set(n, orig); }
  const out = LANG === 'ru' ? orig : trS(orig);
  I18N_SET.set(n, out);
  if (out !== cur) {
    const p = n.parentNode;
    if (p && p.nodeName === 'OPTION' && !p.hasAttribute('value')) p.setAttribute('value', orig.trim());
    n.nodeValue = out;
  }
}
function i18nAttrs(el) {
  for (const a of I18N_ATTRS) {
    const cur = el.getAttribute(a);
    if (cur == null) continue;
    let rec = I18N_AREC.get(el);
    if (!(rec && rec[a]) && !CYR.test(cur)) continue;
    if (!rec) { rec = {}; I18N_AREC.set(el, rec); }
    if (!rec[a] || cur !== rec[a].set) rec[a] = { orig: cur, set: cur };
    const out = LANG === 'ru' ? rec[a].orig : trS(rec[a].orig);
    rec[a].set = out;
    if (out !== cur) el.setAttribute(a, out);
  }
}
function i18nTree(root) {
  if (!root) return;
  if (root.nodeType === 3) { const p = root.parentElement; if (!p || !p.closest(I18N_SKIP)) i18nText(root); return; }
  if (root.nodeType !== 1) return;
  // В зонах без перевода (поля ввода, код, шаблоны) содержимое не трогаем, но подсказки и подписи переводим
  const skipped = n => { if (!n.matches('.no-i18n')) i18nAttrs(n); return 2; };
  if (root.closest(I18N_SKIP)) { if (root.matches(I18N_SKIP) && !root.closest('.no-i18n')) i18nAttrs(root); return; }
  const w = document.createTreeWalker(root, 5, { acceptNode: n => n.nodeType === 1 && n.matches(I18N_SKIP) ? skipped(n) : 1 });
  for (let n = w.currentNode; n; n = w.nextNode()) { if (n.nodeType === 3) i18nText(n); else i18nAttrs(n); }
}
function i18nObserve() {
  new MutationObserver(ms => {
    if (LANG === 'ru') return;
    for (const m of ms) {
      if (m.type === 'childList') m.addedNodes.forEach(i18nTree);
      else if (m.type === 'characterData') { const p = m.target.parentElement; if (!p || !p.closest(I18N_SKIP)) i18nText(m.target); }
      else if (m.type === 'attributes') i18nAttrs(m.target);
    }
  }).observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: I18N_ATTRS });
}
function setLang(l) {
  if (!LANGS.includes(l)) return;
  LANG = l;
  try { localStorage.setItem('srl-lang', l); } catch (e) { }
  document.documentElement.lang = l;
  render();
  i18nTree(document.body);
}

/* ---------- Тема: дневная, вечерняя или по времени суток ---------- */
const THEME_KEY = 'srl-theme', THEME_DAY_FROM = 7, THEME_EVENING_FROM = 19;
let themeModeVal = (() => { try { const v = localStorage.getItem(THEME_KEY); return ['day', 'evening', 'auto'].includes(v) ? v : 'day'; } catch (e) { return 'day'; } })();
function themeIsDark(mode = themeModeVal, d = new Date()) { const h = d.getHours(); return mode === 'evening' || (mode === 'auto' && (h < THEME_DAY_FROM || h >= THEME_EVENING_FROM)); }
function applyTheme() { document.documentElement.setAttribute('data-theme', themeIsDark() ? 'dark' : 'light'); }
function setThemeMode(m) { themeModeVal = m; try { localStorage.setItem(THEME_KEY, m); } catch (e) { } applyTheme(); }

const IC = {
  idcard: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><circle cx="8.5" cy="12" r="2.5"/><path d="M13.5 10h5M13.5 14h3.5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
  book: '<path d="M2.5 4.5h6A3.5 3.5 0 0 1 12 8v12a2.6 2.6 0 0 0-2.6-2.6H2.5z"/><path d="M21.5 4.5h-6A3.5 3.5 0 0 0 12 8v12a2.6 2.6 0 0 1 2.6-2.6h6.9z"/>',
  chat: '<path d="M21 14.5a2 2 0 0 1-2 2H8l-4.5 4V5a2 2 0 0 1 2-2H19a2 2 0 0 1 2 2z"/><path d="M8 8.5h8M8 12h5"/>',
  calendar: '<rect x="3" y="4.5" width="18" height="17" rx="2"/><path d="M16 2.5v4M8 2.5v4M3 10h18"/>',
  sparkle: '<path d="M11 3.5l1.8 4.9 4.9 1.8-4.9 1.8L11 16.9l-1.8-4.9-4.9-1.8 4.9-1.8z"/><path d="M18.5 14.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
  layers: '<path d="m12 2.5 9.5 5-9.5 5-9.5-5z"/><path d="m2.5 12 9.5 5 9.5-5"/><path d="m2.5 16.5 9.5 5 9.5-5"/>',
  chart: '<path d="M3.5 3.5v17h17"/><path d="M8 16v-4M12.5 16V8M17 16v-6"/>',
  inbox: '<path d="M21.5 12.5h-6l-2 3h-3l-2-3h-6"/><path d="M5.5 5.2 2.5 12.5v6a2 2 0 0 0 2 2h15a2 2 0 0 0 2-2v-6l-3-7.3a2 2 0 0 0-1.8-1.2H7.3a2 2 0 0 0-1.8 1.2z"/>',
  database: '<ellipse cx="12" cy="5.5" rx="8.5" ry="3"/><path d="M3.5 5.5v13c0 1.7 3.8 3 8.5 3s8.5-1.3 8.5-3v-13"/><path d="M3.5 12c0 1.7 3.8 3 8.5 3s8.5-1.3 8.5-3"/>',
  bell: '<path d="M6 8.5a6 6 0 0 1 12 0c0 6.5 2.8 8.5 2.8 8.5H3.2S6 15 6 8.5"/><path d="M10.2 20.5a2 2 0 0 0 3.6 0"/>',
  ext: '<path d="M14.5 3.5h6v6"/><path d="M10 14 20.5 3.5"/><path d="M18.5 13.5v5a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2h5"/>',
  copy: '<rect x="8.5" y="8.5" width="12.5" height="12.5" rx="2"/><path d="M5.5 15.5h-1a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  star: '<path d="m12 2.8 2.85 5.78 6.38.93-4.62 4.5 1.09 6.35L12 17.36l-5.7 3 1.09-6.35-4.62-4.5 6.38-.93z"/>',
  check: '<path d="M20 6.5 9.5 17 4 11.5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  edit: '<path d="M16.5 3.5a2.4 2.4 0 0 1 3.4 3.4L7.5 19.3 3 20.5l1.2-4.5z"/>',
  trash: '<path d="M3.5 6.5h17M18.5 6.5v13a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-13M8.5 6.5v-2a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeoff: '<path d="M10.6 5.1A10.4 10.4 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-2.2 3.1M6.6 6.6C3.7 8.4 2 12 2 12s3.6 7 10 7a9.6 9.6 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/><path d="m3 3 18 18"/>',
  send: '<path d="M21.5 2.5 14.5 21.5l-3.8-8.2-8.2-3.8z"/><path d="M21.5 2.5 10.7 13.3"/>',
  refresh: '<path d="M20.5 11A8.5 8.5 0 0 0 5.8 6.3L3.5 8.5"/><path d="M3.5 3.5v5h5"/><path d="M3.5 13a8.5 8.5 0 0 0 14.7 4.7l2.3-2.2"/><path d="M20.5 20.5v-5h-5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  grad: '<path d="M22 9.5 12 4.5 2 9.5l10 5z"/><path d="M6 11.5v5c3.5 3 8.5 3 12 0v-5"/><path d="M22 9.5v6"/>',
  building: '<path d="M3 21h18M5 21V10.5M9.5 21V10.5M14.5 21V10.5M19 21V10.5"/><path d="M2.5 10.5 12 3.5l9.5 7z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/>',
  moon: '<path d="M20.5 14.2A8.5 8.5 0 1 1 9.8 3.5a6.8 6.8 0 0 0 10.7 10.7z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4.5M12 8h.01"/>',
  play: '<path d="M7 4.5v15l12-7.5z"/>',
  reset: '<path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8.5"/><path d="M3.5 3.5v5h5"/>',
  link: '<path d="M10 13.5a4.5 4.5 0 0 0 6.8.5l3-3a4.5 4.5 0 0 0-6.4-6.4L12 6"/><path d="M14 10.5a4.5 4.5 0 0 0-6.8-.5l-3 3a4.5 4.5 0 0 0 6.4 6.4L12 18"/>',
  bookmark: '<path d="M18.5 20.5 12 16.5l-6.5 4V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  file: '<path d="M14 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8z"/><path d="M14 2.5V8h5.5M15.5 13h-7M15.5 17h-7M10.5 9h-2"/>',
  pie: '<path d="M21 15.5A9.5 9.5 0 1 1 8.5 3"/><path d="M21.5 12A9.5 9.5 0 0 0 12 2.5V12z"/>',
  pen: '<path d="M12 20.5h9"/><path d="M16.5 3.5a2.4 2.4 0 0 1 3.4 3.4L7.5 19.3 3 20.5l1.2-4.5z"/>',
  list: '<path d="m3.5 6.5 1.8 1.8L8.5 5M3.5 13l1.8 1.8L8.5 11.5M3.5 19.5l1.8 1.8 3.2-3.3M12 7h8.5M12 13.5h8.5M12 20h8.5"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5.5"/><circle cx="12" cy="12" r="2"/>',
  clip: '<rect x="8" y="2.5" width="8" height="4" rx="1"/><path d="M16 4.5h2a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  network: '<circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M12 7.5v4M12 11.5 6.5 17M12 11.5l5.5 5.5"/>',
  mega: '<path d="M3.5 10v4a1 1 0 0 0 1 1H7l6 4.5V4.5L7 9H4.5a1 1 0 0 0-1 1z"/><path d="M17 8.5a5 5 0 0 1 0 7"/>',
  thumb: '<path d="M7 10.5v10M15 6.3 14 10.5h5.6a2 2 0 0 1 2 2.4l-1.2 6a2 2 0 0 1-2 1.6H7V10.5L11 2.5a2.5 2.5 0 0 1 4 2z"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
  table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16"/>'
};
const ic = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${IC[n] || ''}</svg>`;
const BRAND = `<svg class="brand-mark" viewBox="0 0 36 36" aria-hidden="true"><rect width="36" height="36" rx="9" fill="var(--accent)"/><rect x="8" y="11" width="4.6" height="16" rx="1.2" fill="var(--accent-ink)"/><rect x="14.4" y="8" width="4.6" height="19" rx="1.2" fill="var(--accent-ink)" opacity=".82"/><rect x="21" y="12.5" width="4.6" height="14.5" rx="1.2" fill="var(--accent-ink)" opacity=".64" transform="rotate(14 21 27)"/><path d="M28.4 4.6l.95 2.35 2.35.95-2.35.95-.95 2.35-.95-2.35-2.35-.95 2.35-.95z" fill="var(--spark)"/></svg>`;
const STAMP = `<svg class="stamp" viewBox="0 0 100 100" aria-hidden="true"><defs><path id="stampPath" d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0"/></defs><circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" stroke-width="1"/><text font-family="JetBrains Mono, monospace" font-size="7.6" letter-spacing="1.3" fill="currentColor"><textPath href="#stampPath">RESEARCH PASSPORT · SMART RESEARCH LIBRARY ·</textPath></text><text x="50" y="55.5" text-anchor="middle" font-family="Literata, Georgia, serif" font-weight="700" font-size="15" fill="currentColor">SRL</text></svg>`;

/* =====================================================================
   2. Seed data (relative to today so the demo always looks current)
   ===================================================================== */
const STATUS = { waiting: 'Ожидает ответа', progress: 'В работе', resolved: 'Решено' };
const LIB_STATUS = { unread: 'Не прочитано', reading: 'Читаю', done: 'Прочитано' };
const DEMO_UID = 'demo-user';

function academicYearStart(ts) { const d = new Date(ts); return new Date(d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1, 8, 1); }

function makeSeed(nowTs) {
  const d0 = startOfDay(nowTs);
  const at = (dd, hh = 10, mm = 0) => d0 + dd * DAY + hh * HOUR + mm * MIN;
  const ay = academicYearStart(nowTs);
  const passport = {
    name: 'Айгерим Сапарова', status: 'Докторант', course: 2, spec: 'Педагогика и психология',
    topic: 'Сопровождение исследовательской подготовки докторантов с помощью цифровых сервисов научной библиотеки и инструментов искусственного интеллекта',
    sup: 'д.п.н., профессор Р. К. Мусина (демо)', cons: 'Dr. L. Mendes, зарубежный вуз-партнёр (демо)',
    orcid: '0000-0002-1825-0097',
    interests: ['искусственный интеллект в образовании', 'систематические обзоры', 'академическое письмо', 'библиометрия'],
    pubs: ['Сапарова А. Цифровые сервисы университетской библиотеки в подготовке докторантов: обзор литературы (демо-запись)', 'Saparova A. Generative AI tools in doctoral research training: a scoping review protocol (демо-запись)'],
    projects: ['Внутривузовский проект «Научная грамотность магистрантов» (демо)'],
    defense: monthInput(new Date(ay.getFullYear() + 2, 5, 1)),
    vis: { topic: true, sup: true, cons: false, orcid: true, interests: true, pubs: true, projects: true, defense: false }
  };
  const me = {
    passport,
    library: [
      { id: 'L1', pid: 'c01', status: 'reading', coll: 'reviews', notes: 'Чек-лист — в приложение к главе 1.', added: at(-40) },
      { id: 'L2', pid: 'c25', status: 'done', coll: 'ai', notes: 'Ключевой обзор для введения: мало педагогической перспективы.', added: at(-38) },
      { id: 'L3', pid: 'c03', status: 'done', coll: 'reviews', notes: '', added: at(-30) },
      { id: 'L4', pid: 'c26', status: 'unread', coll: 'ai', notes: '', added: at(-12) },
      { id: 'L5', pid: 'c13', status: 'unread', coll: 'biblio', notes: '', added: at(-9) },
      { id: 'L6', pid: 'c31', status: 'reading', coll: 'reviews', notes: 'Глава 4 — поиск и отбор исследований.', added: at(-6) },
      { id: 'L7', pid: 'c35', status: 'unread', coll: 'writing', notes: '', added: at(-2) }
    ],
    planner: { milestones: [], meetings: [
      { id: 'mt1', at: at(-45, 15), topic: 'Протокол систематического обзора', outcome: 'Протокол одобрен, регистрация на OSF до конца месяца.' },
      { id: 'mt2', at: at(-24, 15), topic: 'Поисковая стратегия и выбор баз', outcome: 'Добавить Web of Science, согласовать запрос с библиотекарем.' },
      { id: 'mt3', at: at(-3, 16), topic: 'Инструменты сбора данных', outcome: 'Доработать анкету, пилот на 20 респондентах.' },
      { id: 'mt4', at: at(16, 15), topic: 'Результаты пилотного опроса', outcome: '' }
    ], diary: [
      { id: 'd1', at: at(-20, 21), tag: 'Поиск', text: 'Выгрузила 1 240 записей из Scopus и Web of Science, после удаления дубликатов осталось 868.' },
      { id: 'd2', at: at(-9, 20), tag: 'Скрининг', text: 'Скрининг аннотаций в Rayyan: включено 64, спорные 11 — обсудить с руководителем.' },
      { id: 'd3', at: at(-2, 22), tag: 'Анкета', text: 'Переписала блок вопросов о чат-ботах: убрала наводящие формулировки.' }
    ] },
    chat: [], seen: {}, readNotices: ['n2'], favPrompts: ['p01'], customPrompts: [],
    builder: { concepts: [
      { terms: ['artificial intelligence', 'generative AI', 'ChatGPT', 'large language model*'] },
      { terms: ['higher education', 'doctoral student*', 'PhD student*', 'postgraduate*'] },
      { terms: ['research skill*', 'research training', 'academic librar*', 'library service*'] }
    ] },
    hintDismissed: false
  };
  me.planner.milestones = buildPlan(passport, null, true, nowTs);

  const t = (o) => Object.assign({ updatedAt: o.createdAt }, o);
  const tickets = [
    t({ id: 'T1029', num: 1029, cat: 'Библиографические менеджеры', q: 'Как объединить библиотеки Zotero с двух компьютеров — рабочего и домашнего?', status: 'resolved', createdAt: at(-16, 9, 40), firstReplyAt: at(-16, 11, 5), resolvedAt: at(-16, 11, 5), lastEventAt: at(-16, 11, 5), lastEvent: 'reply', authorId: 'u-erlan', author: { name: 'Ерлан Жумабеков', status: 'Докторант', course: 1, spec: 'Информационно-коммуникационные технологии', topic: 'Методы машинного обучения для анализа научных текстов' } }),
    t({ id: 'T1031', num: 1031, cat: 'Электронные ресурсы', q: 'Не могу открыть полный текст статьи в Wiley Online Library из общежития — пишет, что нужна подписка.', status: 'resolved', createdAt: at(-12, 21, 12), firstReplyAt: at(-11, 9, 20), resolvedAt: at(-11, 9, 20), lastEventAt: at(-11, 9, 20), lastEvent: 'reply', authorId: 'u-daniyar', author: { name: 'Данияр Касымов', status: 'Магистрант', course: 1, spec: 'Социальные науки', topic: 'Цифровое участие молодёжи в местном самоуправлении' } }),
    t({ id: 'T1034', num: 1034, cat: 'Библиометрия', q: 'Сделала экспорт из Scopus в CSV, но Biblioshiny не показывает аффилиации и цитируемую литературу. Какие поля выбрать при экспорте?', status: 'resolved', createdAt: at(-9, 14, 3), firstReplyAt: at(-9, 15, 31), resolvedAt: at(-8, 10, 2), lastEventAt: at(-8, 10, 2), lastEvent: 'resolved', authorId: DEMO_UID, author: { name: passport.name, status: passport.status, course: passport.course, spec: passport.spec, topic: passport.topic } }),
    t({ id: 'T1036', num: 1036, cat: 'Другие вопросы', q: 'Можно ли продлить срок возврата книг, не приходя в библиотеку?', status: 'resolved', createdAt: at(-7, 10, 30), firstReplyAt: at(-7, 12, 10), resolvedAt: at(-7, 12, 10), lastEventAt: at(-7, 12, 10), lastEvent: 'reply', authorId: 'u-madina', author: { name: 'Мадина Ахметова', status: 'Магистрант', course: 2, spec: 'Языки и литература', topic: 'Терминология цифровой лингвистики в казахском языке' } }),
    t({ id: 'T1038', num: 1038, cat: 'Поиск литературы', q: 'Помогите найти диссертации по психологии о профессиональном выгорании педагогов, защищённые в Казахстане за последние пять лет.', status: 'progress', createdAt: at(-4, 11, 15), firstReplyAt: at(-4, 13, 40), lastEventAt: at(-4, 13, 40), lastEvent: 'reply', authorId: 'u-asel', author: { name: 'Асель Нурпеисова', status: 'Докторант', course: 3, spec: 'Педагогика и психология', topic: 'Профилактика профессионального выгорания педагогов' } }),
    t({ id: 'T1040', num: 1040, cat: 'Библиографические менеджеры', q: 'Как в EndNote переключить стиль оформления на ГОСТ? В списке стилей его нет.', status: 'waiting', createdAt: at(-1, 16, 20), authorId: 'u-erlan', author: { name: 'Ерлан Жумабеков', status: 'Докторант', course: 1, spec: 'Информационно-коммуникационные технологии', topic: 'Методы машинного обучения для анализа научных текстов' } }),
    t({ id: 'T1041', num: 1041, cat: 'Научные консультации', q: 'Можно ли записаться на индивидуальную консультацию по поисковой стратегии для систематического обзора? Нужна проверка запроса для Scopus и Web of Science.', status: 'waiting', createdAt: at(0, 9, 5), authorId: DEMO_UID, author: { name: passport.name, status: passport.status, course: passport.course, spec: passport.spec, topic: passport.topic } }),
    t({ id: 'T1042', num: 1042, cat: 'Техническая поддержка', q: 'Не получается войти в электронный читательский формуляр: пишет «неверный логин», хотя данные правильные.', status: 'progress', createdAt: at(-2, 18, 45), takenAt: at(-1, 9, 30), lastEventAt: at(-1, 9, 30), lastEvent: 'taken', authorId: 'u-timur', author: { name: 'Тимур Сейтказы', status: 'Магистрант', course: 1, spec: 'Инженерия и инженерное дело', topic: 'Энергоэффективность систем вентиляции' } }),
    t({ id: 'T1043', num: 1043, cat: 'Электронные ресурсы', q: 'Есть ли у ЕНУ доступ к журналам Springer Nature? Нужны статьи из Higher Education за 2023–2025 годы.', status: 'waiting', createdAt: at(0, 8, 12), authorId: 'u-asel', author: { name: 'Асель Нурпеисова', status: 'Докторант', course: 3, spec: 'Педагогика и психология', topic: 'Профилактика профессионального выгорания педагогов' } })
  ];
  const STAFF = 'Библиотекарь-консультант';
  const m = (tid, from, text, ts, name) => ({ id: 'M-' + tid + '-' + ts.toString(36), ticketId: tid, from, text, at: ts, name: name || (from === 'staff' ? STAFF : '') });
  const messages = [];
  tickets.forEach(tk => messages.push(m(tk.id, 'student', tk.q, tk.createdAt, tk.author.name)));
  messages.push(
    m('T1029', 'staff', 'Добрый день! Войдите в один и тот же аккаунт Zotero на обоих компьютерах и включите синхронизацию: Правка → Настройки → Синхронизация. Записи и коллекции объединятся автоматически; для файлов PDF бесплатно доступно 300 МБ.', at(-16, 11, 5)),
    m('T1031', 'staff', 'Добрый день! Вне сети университета нужен удалённый доступ. Воспользуйтесь инструкцией по удалённому доступу к Wiley Online Library на сайте библиотеки (раздел «Для исследователей»). Если не получится — ответьте здесь, разберём вместе.', at(-11, 9, 20)),
    m('T1034', 'staff', 'При экспорте из Scopus в CSV отметьте все группы полей: Citation information, Bibliographical information (в ней аффилиации), Abstract & keywords, Funding details и Other information (в ней References). Затем загрузите файл в Biblioshiny заново.', at(-9, 15, 31)),
    m('T1034', 'student', 'Спасибо, всё появилось!', at(-8, 9, 50), passport.name),
    m('T1034', 'system', 'Обращение отмечено как решённое', at(-8, 10, 2)),
    m('T1036', 'staff', 'Да. Напишите номер читательского билета и названия книг — продлим срок, если на издания нет очереди.', at(-7, 12, 10)),
    m('T1038', 'staff', 'Взяла вопрос в работу. Подборку диссертаций и авторефератов пришлю до конца недели.', at(-4, 13, 40)),
    m('T1042', 'system', 'Обращение взято в работу', at(-1, 9, 30))
  );

  const kb = KB_BASE.map(e => Object.assign({ status: 'approved', updated: at(-60) }, e));
  const events = [
    { id: 'ev1', title: 'Поиск в Scopus и Web of Science: поисковые стратегии', at: at(3, 15), format: 'Онлайн', place: 'Ссылка придёт в уведомлении', seats: 40, base: 23, attendees: [], tags: 'scopus web of science поиск поисковая стратегия систематические обзоры' },
    { id: 'ev2', title: 'Zotero для диссертации: от сбора источников до списка по ГОСТ', at: at(8, 14), format: 'Очно', place: 'Научная библиотека ЕНУ', seats: 25, base: 17, attendees: [], tags: 'zotero библиографические менеджеры список литературы гост академическое письмо' },
    { id: 'ev3', title: 'Bibliometrix и Biblioshiny: анализ публикаций по теме исследования', at: at(15, 15), format: 'Онлайн', place: 'Ссылка придёт в уведомлении', seats: 40, base: 12, attendees: [], tags: 'bibliometrix библиометрия анализ публикаций' },
    { id: 'ev4', title: 'Систематический обзор по PRISMA 2020: протокол, скрининг, блок-схема', at: at(22, 14), format: 'Очно', place: 'Научная библиотека ЕНУ', seats: 25, base: 9, attendees: [], tags: 'систематические обзоры prisma скрининг' },
    { id: 'ev5', title: 'Выбор журнала: индексация, квартили и признаки сомнительных изданий', at: at(29, 15), format: 'Онлайн', place: 'Ссылка придёт в уведомлении', seats: 50, base: 6, attendees: [], tags: 'журнал квартиль публикация индексация' },
    { id: 'ev6', title: 'Академическое письмо: структура IMRaD и аннотация на трёх языках', at: at(36, 14), format: 'Онлайн', place: 'Ссылка придёт в уведомлении', seats: 50, base: 3, attendees: [], tags: 'академическое письмо статья аннотация перевод' }
  ];
  const slots = [
    { id: 'sl1', at: at(2, 11), mins: 30, topic: 'Поисковая стратегия для систематического обзора', who: 'Библиограф-консультант', bookedBy: null },
    { id: 'sl2', at: at(2, 15, 30), mins: 30, topic: 'Zotero и EndNote: настройка, стили, дубликаты', who: 'Библиограф-консультант', bookedBy: null },
    { id: 'sl3', at: at(4, 10), mins: 45, topic: 'Профиль автора: ORCID, Scopus, Web of Science', who: 'Специалист по наукометрии', bookedBy: 'u-erlan', bookedName: 'Ерлан Жумабеков' },
    { id: 'sl4', at: at(7, 14), mins: 30, topic: 'Выбор журнала и проверка индексации', who: 'Специалист по наукометрии', bookedBy: null },
    { id: 'sl5', at: at(9, 16), mins: 45, topic: 'Bibliometrix: подготовка и объединение выгрузок', who: 'Специалист по наукометрии', bookedBy: null }
  ];
  const notices = [
    { id: 'n1', at: at(-5, 12), audience: 'all', title: 'Открыта запись на практикум по Zotero', text: `Практикум «Zotero для диссертации» пройдёт ${fmtD(at(8, 14))} в 14:00, очно. Записаться можно на странице «Научный паспорт», блок «Мероприятия».` },
    { id: 'n2', at: at(-13, 11), audience: 'all', title: 'Курсы Wiley Researcher Academy', text: 'Курсы по подготовке и публикации статей доступны по национальной подписке. Аккаунт регистрируется из сети университета.' }
  ];
  const resources = [
    { id: 'r1', name: 'Web of Science Core Collection', kind: 'Национальная подписка МНВО РК', note: 'Доступ из сети ЕНУ по IP-адресу', url: 'https://www.webofscience.com/', show: true },
    { id: 'r2', name: 'Scopus', kind: 'Национальная подписка МНВО РК', note: 'Доступ из сети ЕНУ; методические рекомендации — на сайте библиотеки', url: 'https://www.scopus.com/', show: true },
    { id: 'r3', name: 'Wiley Online Library', kind: 'Национальная подписка МНВО РК', note: 'Около 1 600 журналов; есть инструкция по удалённому доступу', url: 'https://onlinelibrary.wiley.com/', show: true },
    { id: 'r4', name: 'Wiley Researcher Academy', kind: 'Национальная подписка МНВО РК', note: 'Курсы по публикации; регистрация из сети ЕНУ', url: 'https://wileyresearcheracademy.com/', show: true },
    { id: 'r5', name: 'Репозиторий ЕНУ', kind: 'Ресурс ЕНУ', note: 'Научные работы университета', url: 'https://repository.enu.kz/', show: true },
    { id: 'r6', name: 'Сайт научной библиотеки ЕНУ', kind: 'Ресурс ЕНУ', note: 'Электронный каталог, режим работы, инструкции', url: 'https://lib.enu.kz/ru', show: true },
    { id: 'r7', name: 'PubMed', kind: 'Открытый доступ', note: 'Биомедицина и науки о жизни', url: 'https://pubmed.ncbi.nlm.nih.gov/', show: true },
    { id: 'r8', name: 'DOAJ', kind: 'Открытый доступ', note: 'Каталог рецензируемых журналов открытого доступа', url: 'https://doaj.org/', show: true },
    { id: 'r9', name: 'OATD', kind: 'Открытый доступ', note: 'Диссертации и магистерские работы', url: 'https://oatd.org/', show: true },
    { id: 'r10', name: 'КиберЛенинка', kind: 'Открытый доступ', note: 'Научные статьи на русском языке', url: 'https://cyberleninka.ru/', show: true }
  ];
  const stats = {
    weeks: [14, 17, 21, 19, 26, 24, 31, 28],
    cats: { 'Электронные ресурсы': 42, 'Библиографические менеджеры': 34, 'Поиск литературы': 37, 'Библиометрия': 17, 'Научные консультации': 24, 'Техническая поддержка': 15, 'Другие вопросы': 11 },
    bot: { asked: 640, kb: 452 },
    views: {}
  };
  me.seen = { T1034: at(-8, 10, 2) };
  return { me, local: { tickets, messages, kb, events, slots, notices, resources, stats } };
}

/* =====================================================================
   3. State & persistence
   ===================================================================== */
const LS_KEY = 'srl-enu-demo-v1';
const COLLS = ['tickets', 'messages', 'kb', 'notices', 'events', 'slots', 'resources'];
const S = {
  role: 'student',
  view: { student: 'passport', staff: 'overview' },
  me: null,
  local: null,
  remote: { tickets: [], messages: [], kb: [], notices: [], events: [], slots: [], resources: [] },
  ui: {
    bell: false, drafts: {}, modal: null, asking: false, ppPreview: false,
    search: { q: '', type: 'all', free: false, idx: 'any', from: '', sort: 'rel' }, citeOpen: {}, builderTab: 'scopus',
    lib: { coll: 'all', status: 'all', style: 'gost' }, libAi: null,
    kb: { q: '', cat: 'all', status: 'all' },
    tk: { status: 'open', cat: 'all', q: '', sel: null },
    prompts: { cat: 'all', q: '', fav: false }, promptOut: {},
    beta: 'journal', betaOut: {},
    chartTable: {}, reportText: null, mobileDetail: false
  }
};

function loadState() {
  let saved = null;
  try { const raw = localStorage.getItem(LS_KEY); if (raw) saved = JSON.parse(raw); } catch (e) { saved = null; }
  const seed = makeSeed(Date.now());
  if (saved && saved.v === 1 && saved.me && saved.local) {
    S.me = Object.assign({}, seed.me, saved.me);
    S.local = Object.assign({}, seed.local, saved.local);
    if (saved.role) S.role = saved.role;
    if (saved.view) S.view = Object.assign(S.view, saved.view);
  } else {
    S.me = seed.me; S.local = seed.local;
  }
  try { normalizeMe(); } catch (e) { S.me = seed.me; }
}
let persistTimer = null;
function persist() {
  clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify({ v: 1, me: S.me, local: S.local, role: S.role, view: S.view })); } catch (e) { /* storage unavailable: keep in memory */ }
    saveUserRemote();
  }, 200);
}
function resetDemo() {
  try { localStorage.removeItem(LS_KEY); } catch (e) { }
  const seed = makeSeed(Date.now());
  S.me = seed.me; S.local = seed.local;
  S.ui.drafts = {}; S.ui.tk.sel = null; S.ui.libAi = null; S.ui.promptOut = {}; S.ui.betaOut = {}; S.ui.reportText = null;
  persist();
}

/* =====================================================================
   4. Shared store: local data + live database when the viewer offers it
   ===================================================================== */
const Live = { state: 'off', db: null, user: null, me: null, canWrite: true, unsubs: [], userLoaded: false, saving: Promise.resolve(), lastSaved: '' };
const myId = () => Live.me || DEMO_UID;
const isMine = t => t.authorId === myId() || t.authorId === DEMO_UID;

function all(c) {
  const L = S.local[c] || [], R = S.remote[c] || [];
  let out;
  if (!R.length) out = L.slice();
  else { const ids = new Set(R.map(x => x.id)); out = L.filter(x => !ids.has(x.id)).concat(R); }
  return out.filter(x => x && !x.deleted);
}
const byId = (c, id) => all(c).find(x => x.id === id);
const isRemote = (c, id) => (S.remote[c] || []).some(x => x.id === id);
const cleanDoc = o => { const r = JSON.parse(JSON.stringify(o)); delete r._src; return r; };

async function put(c, doc) {
  if (Live.db && Live.canWrite) {
    const opt = Object.assign({}, doc, { _src: 'db' });
    const arr = S.remote[c] || (S.remote[c] = []);
    const i = arr.findIndex(x => x.id === doc.id);
    if (i >= 0) arr[i] = opt; else arr.push(opt);
    scheduleRender();
    try { await Live.db.collection(c).doc(doc.id).set(cleanDoc(doc)); return true; }
    catch (e) {
      console.warn('db set', c, e);
      S.remote[c] = (S.remote[c] || []).filter(x => x !== opt);
      if (e && e.code === 'quota_exceeded') toast('Общая база демоверсии заполнена — сохраняю только на этом устройстве.');
      if (e && e.code === 'invalid_argument') { Live.canWrite = false; renderTop(); }
    }
  }
  const arr = S.local[c] || (S.local[c] = []);
  const i = arr.findIndex(x => x.id === doc.id);
  if (i >= 0) arr[i] = doc; else arr.push(doc);
  persist(); scheduleRender();
  return true;
}
async function patch(c, id, changes) {
  if (isRemote(c, id)) {
    const item = S.remote[c].find(x => x.id === id);
    if (!(Live.db && Live.canWrite)) { toast('Нет прав на изменение общих данных.'); return false; }
    const before = Object.assign({}, item);
    Object.assign(item, changes); scheduleRender();
    try { await Live.db.collection(c).doc(id).update(cleanDoc(changes)); return true; }
    catch (e) { console.warn('db update', e); Object.assign(item, before); toast('Не удалось сохранить изменение в общей базе.'); scheduleRender(); return false; }
  }
  const item = (S.local[c] || []).find(x => x.id === id);
  if (!item) return false;
  Object.assign(item, changes); persist(); scheduleRender();
  return true;
}
async function removeDoc(c, id) {
  if (Live.db && Live.canWrite) return put(c, { id, deleted: true });
  S.local[c] = (S.local[c] || []).filter(x => x.id !== id);
  persist(); scheduleRender();
  return true;
}

const safeUrl = u => (/^https?:\/\/[^\s"'<>]+$/i.test(String(u || '')) ? String(u) : '');
const str = (v, d = '') => (typeof v === 'string' ? v : v == null ? d : String(v));
const num = (v, d = 0) => (Number.isFinite(+v) ? +v : d);
const NORM = {
  tickets: x => Object.assign({}, x, { num: num(x.num), cat: CATEGORIES.includes(x.cat) ? x.cat : 'Другие вопросы', q: str(x.q), status: STATUS[x.status] ? x.status : 'waiting', createdAt: num(x.createdAt, Date.now()), author: x.author && typeof x.author === 'object' ? Object.assign({}, x.author, { name: str(x.author.name, 'Пользователь') }) : { name: 'Пользователь' } }),
  messages: x => Object.assign({}, x, { ticketId: str(x.ticketId), from: ['student', 'staff', 'system'].includes(x.from) ? x.from : 'student', text: str(x.text), name: str(x.name), at: num(x.at) }),
  kb: x => Object.assign({}, x, { q: str(x.q), a: str(x.a), cat: str(x.cat, 'Другие вопросы'), keys: str(x.keys), src: Array.isArray(x.src) ? x.src.filter(s => typeof s === 'string' ? SRC[s] : s && typeof s === 'object').map(s => typeof s === 'string' ? s : { t: str(s.t), u: safeUrl(s.u) }) : [], status: x.status === 'draft' ? 'draft' : 'approved', views: num(x.views), updated: num(x.updated) }),
  notices: x => Object.assign({}, x, { title: str(x.title), text: str(x.text), at: num(x.at), audience: ['all', 'phd', 'ma'].includes(x.audience) ? x.audience : 'all' }),
  events: x => Object.assign({}, x, { title: str(x.title), at: num(x.at), format: str(x.format, 'Онлайн'), place: str(x.place), seats: Math.max(1, num(x.seats, 1)), base: num(x.base), attendees: Array.isArray(x.attendees) ? x.attendees.map(String) : [], tags: str(x.tags) }),
  slots: x => Object.assign({}, x, { at: num(x.at), mins: num(x.mins, 30), topic: str(x.topic), who: str(x.who), bookedBy: x.bookedBy ? String(x.bookedBy) : null, bookedName: str(x.bookedName) }),
  resources: x => Object.assign({}, x, { name: str(x.name), url: safeUrl(x.url), kind: str(x.kind), note: str(x.note), show: x.show !== false })
};
function normalizeMe() {
  const seed = makeSeed(Date.now()).me, m = S.me;
  if (!m.passport || typeof m.passport !== 'object') m.passport = seed.passport;
  m.passport = Object.assign({}, seed.passport, m.passport);
  ['interests', 'pubs', 'projects'].forEach(k => { if (!Array.isArray(m.passport[k])) m.passport[k] = []; });
  if (!m.passport.vis || typeof m.passport.vis !== 'object') m.passport.vis = {};
  ['library', 'chat', 'readNotices', 'favPrompts', 'customPrompts'].forEach(k => { if (!Array.isArray(m[k])) m[k] = seed[k] || []; });
  if (!m.planner || typeof m.planner !== 'object') m.planner = seed.planner;
  ['milestones', 'meetings', 'diary'].forEach(k => { if (!Array.isArray(m.planner[k])) m.planner[k] = seed.planner[k]; });
  if (!m.builder || !Array.isArray(m.builder.concepts)) m.builder = seed.builder;
  m.builder.concepts.forEach(c => { if (!Array.isArray(c.terms)) c.terms = []; });
  if (!m.seen || typeof m.seen !== 'object') m.seen = {};
  m.chat = m.chat.map(x => (x.state === 'pending' || x.state === 'streaming') ? Object.assign({}, x, { state: 'done', text: x.text || 'Ответ был прерван — задайте вопрос ещё раз.' }) : x);
}
async function initLive() {
  if (!window.claude || typeof window.claude.use !== 'function') { Live.state = 'off'; return; }
  let db = null, user = null;
  try { db = await window.claude.use('db'); } catch (e) { db = null; }
  if (!db) { Live.state = 'off'; renderTop(); return; }
  try { user = await window.claude.use('user'); } catch (e) { user = null; }
  Live.db = db; Live.user = user;
  try { Live.me = user ? await user.id() : null; } catch (e) { Live.me = null; }
  try { if (user && typeof user.can === 'function') { const c = await user.can('data.write'); if (c === false) Live.canWrite = false; } } catch (e) { }
  if (!Live.canWrite) { Live.db = null; Live.state = 'off'; renderTop(); return; }  // view-only viewers run the demo locally
  Live.state = 'connecting'; renderTop();
  const timer = setTimeout(() => { if (Live.state === 'connecting') { Live.state = 'slow'; renderTop(); } }, 10000);
  COLLS.forEach(c => {
    try {
      const un = db.collection(c).onSnapshot(snap => {
        S.remote[c] = snap.docs.map(d => { try { return NORM[c](Object.assign({}, d.data(), { id: d.id, _src: 'db' })); } catch (e) { return null; } }).filter(Boolean);
        if (!snap.metadata.fromCache && Live.state !== 'live') { clearTimeout(timer); Live.state = 'live'; renderTop(); }
        scheduleRender();
      }, err => {
        clearTimeout(timer); console.warn('db listener', c, err);
        if (Live.state !== 'live') { Live.state = 'error'; renderTop(); }
      });
      Live.unsubs.push(un);
    } catch (e) { console.warn(e); }
  });
  if (Live.me) {
    try {
      const snap = await db.doc(`data/users/${Live.me}/state`).get();
      if (snap.exists) {
        const data = snap.data() || {};
        S.me = Object.assign({}, S.me, JSON.parse(JSON.stringify(data)));
        normalizeMe();
        Live.lastSaved = JSON.stringify(data);
        scheduleRender();
      }
    } catch (e) { console.warn('user state', e); }
    Live.userLoaded = true;
  }
}
let userSaveTimer = null;
function saveUserRemote() {
  if (!Live.db || !Live.me || !Live.userLoaded) return;
  clearTimeout(userSaveTimer);
  userSaveTimer = setTimeout(() => {
    const data = Object.assign({}, S.me, { chat: (S.me.chat || []).slice(-30) });
    const json = JSON.stringify(data);
    if (json === Live.lastSaved || json.length > 240000) return;
    Live.lastSaved = json;
    Live.saving = Live.saving.then(() => Live.db.doc(`data/users/${Live.me}/state`).set(JSON.parse(json))).catch(e => console.warn('user save', e));
  }, 1500);
}

/* =====================================================================
   5. Claude (sample capability)
   ===================================================================== */
const AI = { fn: null, state: 'checking', promise: null };
AI.promise = (async () => {
  try {
    if (!window.claude || typeof window.claude.use !== 'function') { AI.state = 'off'; return null; }
    const s = await window.claude.use('sample');
    AI.fn = s || null; AI.state = s ? 'ready' : 'off';
  } catch (e) { AI.state = 'off'; }
  if (typeof renderTop === 'function' && document.getElementById('topbar')) { renderTop(); scheduleRender(); }
  return AI.fn;
})();
async function aiReady() { if (AI.state === 'checking') await AI.promise; return !!AI.fn && AI.state !== 'off'; }
const AI_OFF_CODES = ['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed'];
function aiFail(e) { if (e && AI_OFF_CODES.includes(e.code)) { AI.state = 'off'; renderTop(); } }
function aiErrorText(e) {
  const c = e && e.code;
  if (!c || c === 'cancelled') return '';
  if (AI_OFF_CODES.includes(c)) return 'ИИ недоступен в этом просмотре — показан ответ без генерации.';
  if (c === 'rate_limited') return 'Слишком много запросов к ИИ. Попробуйте через минуту.';
  if (c === 'session_expired') return 'Сессия истекла — войдите в Claude снова.';
  if (c === 'refused') return 'ИИ не стал отвечать на этот запрос. Переформулируйте его.';
  if (c === 'invalid_json') return 'Ответ ИИ пришёл в неожиданном формате. Попробуйте ещё раз.';
  if (c === 'prompt_too_large') return 'Текст слишком длинный — сократите его.';
  if (c === 'local_off') return 'ИИ недоступен в этом просмотре.';
  return 'Не удалось получить ответ ИИ. Попробуйте ещё раз.';
}
async function aiText(prompt, opts = {}) {
  const s = AI.fn || await AI.promise;
  if (!s) throw { code: 'local_off' };
  try {
    return await s(prompt, { onText: opts.onText, signal: opts.signal, modelTier: opts.tier || 'default', cache: opts.cache === undefined ? true : opts.cache });
  } catch (e) { aiFail(e); throw e; }
}
async function aiJson(prompt, opts = {}) {
  const s = AI.fn || await AI.promise;
  if (!s) throw { code: 'local_off' };
  try {
    if (typeof s.json === 'function') return await s.json(prompt, { modelTier: opts.tier || 'default', signal: opts.signal, cache: opts.cache === undefined ? true : opts.cache });
    const r = await s(prompt, { modelTier: opts.tier || 'default', signal: opts.signal });
    const t = r.text; const a = t.indexOf('{') >= 0 ? t.indexOf('{') : t.indexOf('['); const b = Math.max(t.lastIndexOf('}'), t.lastIndexOf(']'));
    return JSON.parse(t.slice(a, b + 1));
  } catch (e) { aiFail(e); throw (e && e.code ? e : { code: 'invalid_json' }); }
}
const LANG_NAME = { ru: 'русский', kk: 'казахский', en: 'английский' };
function detectLang(q) {
  if (/[әғқңөұүһі]/i.test(q)) return 'kk';
  const lat = (q.match(/[a-z]/gi) || []).length, cyr = (q.match(/[а-яё]/gi) || []).length;
  return lat > cyr ? 'en' : 'ru';
}
