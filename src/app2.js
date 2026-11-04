/* =====================================================================
   6. Text matching (RU / KZ / EN) for the knowledge base and catalogue
   ===================================================================== */
const STOP = new Set(('как что где когда мне меня я мы вы ты он она можно ли в во на и по для с со к ко о об обо из у не а это то же бы мой моя мои моей моего моих мою его ее их есть нужно надо хочу какие какой какая каким каких чтобы или либо при над под про без через эти этот эта также только уже еще был была были будет быть все всё свой свою ' +
  'the a an how to do does i can what where when is are of in on for my me and or with from at by it be this that there which who ' +
  'қалай қайда бар ма ме ба бе па пе да де та те ға ге қа ке на не ны ні ды ді ты ті ның нің дың дің тың тің ге керек мен және үшін кім қандай бола болады маған менің сіз сен ол бұл осы').split(/\s+/));
const PHRASES = [
  [/web\s*of\s*science|веб\s*оф\s*сайнс|вэб\s*оф\s*сайнс/g, ' webofscience '],
  [/full[\s-]*text/g, ' полный текст '],
  [/h-index|индекс\s+хирша/g, ' хирша '],
  [/vos\s*viewer/g, ' vosviewer '],
  [/не\s+открывается|не\s+открыва|не\s+работает|ашылмай|жұмыс\s+істемей/g, ' неработает '],
  [/научн[а-я]*\s+баз[а-я]*\s+данн[а-я]*/g, ' базы данных научным ']
];
const TOKMAP = [
  ['e', 'bibliometrix', 'bibliometrix'], ['e', 'biblioshiny', 'biblioshiny'], ['e', 'вос', 'webofscience'], ['e', 'wos', 'webofscience'], ['p', 'скопус', 'scopus'], ['p', 'зотеро', 'zotero'], ['p', 'эндноут', 'endnote'], ['p', 'эндноте', 'endnote'],
  ['p', 'менделей', 'mendeley'], ['p', 'библиометрикс', 'bibliometrix'], ['p', 'библиошайни', 'biblioshiny'], ['e', 'дои', 'doi'], ['p', 'орсид', 'orcid'], ['p', 'призма', 'prisma'],
  ['p', 'уайли', 'wiley'], ['p', 'вайли', 'wiley'],
  ['p', 'кіру', 'доступ'], ['p', 'қолжетім', 'доступ'], ['p', 'access', 'доступ'], ['p', 'мақала', 'статья'], ['e', 'article', 'статья'], ['e', 'articles', 'статья'], ['e', 'paper', 'статья'], ['e', 'papers', 'статья'],
  ['p', 'кітапханашы', 'библиотекарь'], ['p', 'кітапхана', 'библиотека'], ['p', 'librarian', 'библиотекарь'], ['p', 'library', 'библиотека'],
  ['p', 'тіркел', 'регистрация'], ['p', 'regist', 'регистрация'], ['p', 'дерекқор', 'база'], ['p', 'database', 'база'],
  ['p', 'орнат', 'установить'], ['p', 'install', 'установить'], ['p', 'кеңес', 'консультация'], ['p', 'consult', 'консультация'],
  ['p', 'оқыту', 'обучение'], ['p', 'training', 'обучение'], ['p', 'webinar', 'вебинар'], ['p', 'duplicat', 'дубликаты'], ['p', 'қайталан', 'дубликаты'],
  ['p', 'dissertation', 'диссертация'], ['p', 'thes', 'диссертация'], ['p', 'диссертац', 'диссертация'],
  ['p', 'export', 'экспорт'], ['p', 'import', 'импорт'], ['p', 'catalog', 'каталог'], ['p', 'referenc', 'литература'], ['p', 'bibliograph', 'библиография'],
  ['p', 'әдебиет', 'литература'], ['p', 'іздеу', 'найти'], ['e', 'find', 'найти'], ['p', 'search', 'поиск'], ['p', 'табу', 'найти'], ['p', 'merg', 'объединить'], ['p', 'біріктір', 'объединить'],
  ['p', 'quartil', 'квартиль'], ['p', 'квартил', 'квартиль'], ['p', 'journal', 'журнал'], ['p', 'remote', 'удаленный'], ['p', 'қашықтан', 'удаленный'], ['e', 'home', 'дома'], ['p', 'үйден', 'дома'],
  ['p', 'review', 'обзор'], ['p', 'шолу', 'обзор'], ['p', 'systematic', 'систематический'], ['p', 'жүйелі', 'систематический'],
  ['p', 'order', 'заказать'], ['p', 'тапсырыс', 'заказать'], ['e', 'book', 'книга'], ['e', 'books', 'книга'], ['p', 'кітап', 'книга'],
  ['p', 'error', 'ошибка'], ['p', 'қате', 'ошибка'], ['p', 'artificial', 'искусственный'], ['p', 'intelligen', 'интеллект'],
  ['p', 'bibliometr', 'библиометрия'], ['p', 'библиометр', 'библиометрия'], ['p', 'statist', 'статистика'], ['p', 'статист', 'статистика'], ['p', 'writ', 'письмо'],
  ['p', 'educat', 'образование'], ['p', 'образован', 'образование'], ['p', 'student', 'студент'], ['p', 'doctoral', 'докторант'], ['p', 'докторант', 'докторант']
];
function normText(s) {
  let t = ' ' + String(s || '').toLowerCase().replace(/ё/g, 'е') + ' ';
  for (const [re, rep] of PHRASES) t = t.replace(re, rep);
  return t;
}
function tokens(s) {
  const out = [];
  for (let w of normText(s).split(/[^a-zа-яәғқңөұүһі0-9]+/i)) {
    if (!w || w.length < 2 || STOP.has(w)) continue;
    for (const [mode, p, c] of TOKMAP) { if (mode === 'e' ? w === p : w.startsWith(p)) { w = c; break; } }
    out.push(w);
  }
  return out;
}
function tokMatch(a, b) {
  if (a === b) return 1;
  const n = Math.min(a.length, b.length);
  if (n < 4) return 0;
  let i = 0;
  while (i < n && a[i] === b[i]) i++;
  if (i >= 5 || i === n) return 0.85;
  return 0;
}

/* ---------- Knowledge base retrieval ---------- */
function kbApproved() { return all('kb').filter(e => (e.status || 'approved') === 'approved'); }
let KB_IDX = null, KB_SIG = '';
function kbIndex() {
  const entries = kbApproved();
  const sig = entries.map(e => e.id + ':' + (e.updated || 0)).join('|');
  if (KB_IDX && sig === KB_SIG) return KB_IDX;
  const docs = entries.map(e => ({ e, toks: [...new Set(tokens(`${e.q} ${e.keys || ''}`))] }));
  const df = new Map();
  docs.forEach(d => d.toks.forEach(t => df.set(t, (df.get(t) || 0) + 1)));
  KB_IDX = { docs, df, N: Math.max(docs.length, 1) }; KB_SIG = sig;
  return KB_IDX;
}
function kbSearch(q) {
  const idx = kbIndex();
  const qt = [...new Set(tokens(q))];
  if (!qt.length) return [];
  const weight = t => {
    let df = idx.df.get(t);
    if (df == null) { let best = 0; idx.df.forEach((v, k) => { if (tokMatch(t, k)) best = Math.max(best, v); }); df = best; }
    return df ? Math.log(1 + idx.N / df) : Math.log(1 + idx.N) * 0.9;
  };
  const qw = qt.map(t => [t, weight(t)]);
  const total = qw.reduce((s, [, w]) => s + w, 0) || 1;
  return idx.docs.map(d => {
    let s = 0;
    for (const [t, w] of qw) { let best = 0; for (const u of d.toks) { const m = tokMatch(t, u); if (m > best) { best = m; if (m === 1) break; } } s += w * best; }
    return { e: d.e, score: s / total };
  }).filter(r => r.score > 0).sort((a, b) => b.score - a.score);
}
const CAT_RULES = [
  ['Техническая поддержка', ['неработает', 'ошибк', 'логин', 'парол', 'войти', 'вход', 'зависа', 'техническ']],
  ['Библиометрия', ['bibliometrix', 'biblioshiny', 'vosviewer', 'библиометр', 'хирша', 'цитирован', 'квартил', 'наукометр', 'orcid']],
  ['Библиографические менеджеры', ['zotero', 'endnote', 'mendeley', 'экспорт', 'импорт', 'дубликат', 'стил', 'гост', 'список', 'ссылк', 'библиограф']],
  ['Научные консультации', ['консультац', 'записат', 'семинар', 'вебинар', 'обучени', 'встреч']],
  ['Поиск литературы', ['найт', 'найд', 'поиск', 'диссертац', 'литератур', 'книг', 'подборк', 'обзор']],
  ['Электронные ресурсы', ['scopus', 'webofscience', 'wiley', 'доступ', 'баз', 'стать', 'журнал', 'подписк', 'полн']]
];
function guessCategory(q, best) {
  if (best && best.score >= 0.3) { const c = best.e.cat; return CATEGORIES.includes(c) ? c : 'Другие вопросы'; }
  const toks = tokens(q);
  let bestCat = 'Другие вопросы', bestN = 0;
  for (const [cat, keys] of CAT_RULES) { const n = toks.filter(t => keys.some(k => t.startsWith(k))).length; if (n > bestN) { bestN = n; bestCat = cat; } }
  return bestCat;
}
const srcOf = s => typeof s === 'string' ? SRC[s] : s;

/* ---------- Catalogue search & recommendations ---------- */
function relScore(qt, text) {
  const tt = tokens(text);
  let s = 0;
  for (const a of qt) { let best = 0; for (const b of tt) { const m = tokMatch(a, b); if (m > best) best = m; } s += best; }
  return s;
}
function searchCatalog(f) {
  let list = CATALOG.filter(c => {
    if (f.type === 'article' && !(c.type === 'article' || c.type === 'conf')) return false;
    if (f.type === 'book' && c.type !== 'book') return false;
    if (f.type === 'guide' && !(c.type === 'report' || c.type === 'standard')) return false;
    if (f.free && !c.free) return false;
    if (f.idx !== 'any' && !(c.idx || []).includes(f.idx)) return false;
    if (f.from && c.year < +f.from) return false;
    return true;
  });
  const q = (f.q || '').trim();
  if (!q) {
    const pt = profileTokens();
    return { profile: true, items: list.map(c => ({ c, s: relScore(pt, `${c.title} ${c.keys} ${TOPICS[c.topic]}`) })).sort((a, b) => b.s - a.s || b.c.year - a.c.year).slice(0, 12).map(x => x.c) };
  }
  const doi = q.match(/10\.\d{4,9}\/\S+/);
  if (doi) return { items: list.filter(c => c.doi && c.doi.toLowerCase() === doi[0].toLowerCase().replace(/[.,;]$/, '')) };
  const qt = [...new Set(tokens(q))];
  if (!qt.length) return { items: [] };
  const scored = list.map(c => {
    const hay = `${c.title} ${c.keys} ${c.src || ''} ${c.au || ''} ${TOPICS[c.topic]} ${c.publisher || ''}`;
    const cov = qt.filter(t => tokens(hay).some(u => tokMatch(t, u))).length / qt.length;
    const tm = relScore(qt, c.title);
    const s = tm * 3 + tm / Math.max(4, tokens(c.title).length) * 3 + relScore(qt, c.keys) * 2 + relScore(qt, `${c.src || ''} ${c.au || ''} ${TOPICS[c.topic]}`);
    return { c, s, cov };
  }).filter(x => x.cov >= (qt.length === 1 ? 1 : 0.5) && x.s > 0);
  if (f.sort === 'year') scored.sort((a, b) => b.c.year - a.c.year || b.s - a.s);
  else scored.sort((a, b) => b.s - a.s || b.c.year - a.c.year);
  return { items: scored.map(x => x.c) };
}
function profileTokens() { const p = S.me.passport; return [...new Set(tokens([p.topic, (p.interests || []).join(' '), p.spec].join(' ')))]; }
function recommendPubs(n) {
  const saved = new Set(S.me.library.map(x => x.pid));
  const interests = (S.me.passport.interests || []).filter(Boolean);
  const pool = CATALOG.filter(c => !saved.has(c.id)).map(c => ({ c, text: `${c.title} ${c.keys} ${TOPICS[c.topic]}` }));
  const picked = [], used = new Set();
  // one best match per interest first (diverse), then fill by overall profile score
  interests.forEach(i => {
    const it = [...new Set(tokens(i))];
    if (!it.length || picked.length >= n) return;
    const best = pool.filter(x => !used.has(x.c.id)).map(x => ({ x, s: relScore(it, x.text) / it.length })).filter(r => r.s >= 0.5).sort((a, b) => b.s - a.s || b.x.c.year - a.x.c.year)[0];
    if (best) { used.add(best.x.c.id); picked.push({ c: best.x.c, why: i }); }
  });
  if (picked.length < n) {
    const pt = profileTokens();
    pool.filter(x => !used.has(x.c.id)).map(x => ({ x, s: relScore(pt, x.text) })).filter(r => r.s > 0).sort((a, b) => b.s - a.s || b.x.c.year - a.x.c.year)
      .slice(0, n - picked.length).forEach(r => picked.push({ c: r.x.c, why: '' }));
  }
  return picked.slice(0, n);
}
function recommendJournals(n) {
  const pt = profileTokens();
  const lib = S.me.library.map(x => CATALOG.find(c => c.id === x.pid)).filter(Boolean);
  return JOURNALS.map(j => ({ j, s: relScore(pt, j.keys) + lib.filter(c => j.topics.includes(c.topic)).length * 0.6 })).sort((a, b) => b.s - a.s).slice(0, n).map(x => x.j);
}
function eventRelevance(ev) { return relScore(profileTokens(), `${ev.title} ${ev.tags || ''}`); }

/* ---------- Citation styles ---------- */
function parseAuthors(au) {
  if (!au) return [];
  return au.split(';').map(s => s.trim()).filter(Boolean).map(s => {
    const parts = s.split(/\s+/), ini = [];
    while (parts.length > 1 && /^[A-ZА-ЯЁŁÉ](?:-[A-ZА-ЯЁ])?\.?$/.test(parts[parts.length - 1])) ini.unshift(parts.pop().replace(/\.$/, ''));
    return { fam: parts.join(' '), ini };
  });
}
const iniDots = a => a.ini.map(i => i.split('-').map(x => x + '.').join('-')).join(' ');
const iniPlain = a => a.ini.map(i => i.replace('-', '')).join('');
function citeGost(c) {
  if (c.type === 'standard') return `${c.title}. – ${c.city} : ${c.publisher}, ${c.year}.`;
  const A = parseAuthors(c.au), en = c.lang !== 'ru';
  const L = en ? { vol: 'Vol.', no: 'No.', p: 'P.', art: 'Art.', etal: '[et al.]', ed: 'ed.', eds: 'ed. by' } : { vol: 'Т.', no: '№', p: 'С.', art: 'Ст.', etal: '[и др.]', ed: 'изд.', eds: 'под ред.' };
  const resp = list => list.map(a => `${iniDots(a)} ${a.fam}`).join(', ');
  let head = '', respPart = '';
  if (c.editors) respPart = ` / ${L.eds} ${resp(A.slice(0, 1))} ${L.etal}`;
  else if (A.length && A.length <= 3 && !c.etal) { head = `${A[0].fam}, ${iniDots(A[0])} `; respPart = ` / ${resp(A)}`; }
  else if (A.length) respPart = ` / ${resp(A.slice(0, 3))} ${L.etal}`;
  let s = head + c.title + respPart;
  if (c.type === 'article' || c.type === 'conf') {
    s += ` // ${c.src}. – ${c.year}.`;
    if (c.vol) s += ` – ${L.vol} ${c.vol}${c.iss ? `, ${L.no} ${c.iss}` : ''}.`;
    if (c.pages) s += ` – ${L.p} ${c.pages}.`; else if (c.art) s += ` – ${L.art} ${c.art}.`;
  } else {
    if (c.ed) s += `. – ${c.ed} ${L.ed}`;
    s += `. – ${c.city} : ${c.publisher}, ${c.year}.`;
    if (c.series) s += ` – (${c.series}).`;
  }
  if (c.doi) s += ` – DOI: ${c.doi}.`;
  return s.replace(/\.\.(?!\.)/g, '.').replace(/\s+/g, ' ');
}
function citeApa(c) {
  if (c.type === 'standard') return `${c.title}. (${c.year}). ${c.publisher}.`;
  const A = parseAuthors(c.au), names = A.map(a => `${a.fam}, ${iniDots(a)}`);
  let au = '';
  if (names.length === 1) au = names[0];
  else if (names.length && c.etal) au = names.join(', ') + ', et al.';
  else if (names.length) au = names.slice(0, -1).join(', ') + ', & ' + names[names.length - 1];
  if (c.editors) au += ' (Eds.)';
  let s = `${au} (${c.year}). `;
  if (c.type === 'article') {
    s += `${endP(c.title)} ${c.src}`;
    if (c.vol) s += `, ${c.vol}${c.iss ? `(${c.iss})` : ''}`;
    if (c.pages) s += `, ${c.pages}`; else if (c.art) s += `, Article ${c.art}`;
    s += '.';
  } else if (c.type === 'conf') s += `${endP(c.title)} In ${c.src}${c.pages ? ` (pp. ${c.pages})` : ''}.`;
  else if (c.type === 'report') s += `${c.title} (${c.series}). ${c.publisher}.`;
  else s += `${c.title}${c.ed ? ` (${c.ed} ed.)` : ''}. ${c.publisher}.`;
  if (c.doi) s += ` https://doi.org/${c.doi}`;
  return s;
}
function citeVancouver(c) {
  if (c.type === 'standard') return `${c.title}. ${c.city}: ${c.publisher}; ${c.year}.`;
  const A = parseAuthors(c.au);
  let au = A.slice(0, 6).map(a => `${a.fam} ${iniPlain(a)}`).join(', ');
  if (A.length > 6 || c.etal) au += ', et al';
  if (c.editors) au += ', editors';
  let s = au ? au + '. ' : '';
  const pg = (c.pages || '').replace('–', '-');
  if (c.type === 'article') s += `${endP(c.title)} ${c.jab || c.src}. ${c.year};${c.vol || ''}${c.iss ? `(${c.iss})` : ''}:${pg || c.art || ''}.`;
  else if (c.type === 'conf') s += `${endP(c.title)} In: ${c.src}; ${c.year}. p. ${pg}.`;
  else if (c.type === 'report') s += `${endP(c.title)} ${c.city}: ${c.publisher}; ${c.year}. (${c.series}).`;
  else s += `${endP(c.title)} ${c.ed ? c.ed + ' ed. ' : ''}${c.city}: ${c.publisher}; ${c.year}.`;
  if (c.doi) s += ` doi:${c.doi}`;
  return s;
}
function citeBibtex(c) {
  const A = parseAuthors(c.au);
  const key = ((A[0] ? A[0].fam : 'GOST').normalize('NFD').replace(/[^A-Za-z]/g, '') || 'ref') + c.year + ((c.title.match(/[A-Za-z]+/) || [''])[0]).toLowerCase();
  const type = { article: 'article', conf: 'inproceedings', book: 'book', report: 'techreport', standard: 'misc' }[c.type];
  const f = [];
  if (A.length) f.push(`  ${c.editors ? 'editor' : 'author'} = {${A.map(a => `${a.fam}, ${iniDots(a)}`).join(' and ')}${c.etal ? ' and others' : ''}}`);
  f.push(`  title = {${c.title}}`);
  if (c.type === 'article') f.push(`  journal = {${c.src}}`);
  if (c.type === 'conf') f.push(`  booktitle = {${c.src}}`);
  f.push(`  year = {${c.year}}`);
  if (c.vol) f.push(`  volume = {${c.vol}}`);
  if (c.iss) f.push(`  number = {${c.iss}}`);
  if (c.pages) f.push(`  pages = {${c.pages.replace('–', '--')}}`); else if (c.art) f.push(`  pages = {${c.art}}`);
  if (c.publisher) f.push(`  ${c.type === 'report' ? 'institution' : 'publisher'} = {${c.publisher}}`);
  if (c.city) f.push(`  address = {${c.city}}`);
  if (c.ed) f.push(`  edition = {${c.ed}}`);
  if (c.doi) f.push(`  doi = {${c.doi}}`);
  return `@${type}{${key},\n${f.join(',\n')}\n}`;
}
function citeRis(c) {
  const A = parseAuthors(c.au);
  const L = [`TY  - ${{ article: 'JOUR', conf: 'CONF', book: 'BOOK', report: 'RPRT', standard: 'STAND' }[c.type]}`];
  A.forEach(a => L.push(`${c.editors ? 'A2' : 'AU'}  - ${a.fam}, ${iniDots(a)}`));
  L.push(`TI  - ${c.title}`);
  if (c.src) L.push(`${c.type === 'conf' ? 'T2' : 'JO'}  - ${c.src}`);
  L.push(`PY  - ${c.year}`);
  if (c.vol) L.push(`VL  - ${c.vol}`);
  if (c.iss) L.push(`IS  - ${c.iss}`);
  if (c.pages) { const [sp, ep] = c.pages.split('–'); L.push(`SP  - ${sp}`); if (ep) L.push(`EP  - ${ep}`); } else if (c.art) L.push(`SP  - ${c.art}`);
  if (c.publisher) L.push(`PB  - ${c.publisher}`);
  if (c.city) L.push(`CY  - ${c.city}`);
  if (c.ed) L.push(`ET  - ${c.ed}`);
  if (c.doi) L.push(`DO  - ${c.doi}`);
  L.push('ER  - ');
  return L.join('\n');
}
const STYLES = { gost: ['ГОСТ 7.1–2003', citeGost], apa: ['APA 7', citeApa], vancouver: ['Vancouver', citeVancouver], bibtex: ['BibTeX', citeBibtex], ris: ['RIS', citeRis] };
function sortKey(c) { const A = parseAuthors(c.au); return (A[0] ? A[0].fam : c.title).toLowerCase(); }
function formatList(items, style) {
  const fn = STYLES[style][1];
  if (style === 'bibtex' || style === 'ris') return items.map(fn).join('\n\n');
  let arr = items.slice();
  if (style !== 'vancouver') arr.sort((a, b) => { const ca = /[а-я]/i.test(sortKey(a)), cb = /[а-я]/i.test(sortKey(b)); if (ca !== cb) return ca ? -1 : 1; return sortKey(a).localeCompare(sortKey(b), 'ru'); });
  if (style === 'apa') return arr.map(fn).join('\n\n');
  return arr.map((c, i) => `${i + 1}. ${fn(c)}`).join('\n');
}

/* ---------- Search strategy builder ---------- */
function builderQueries(concepts) {
  const cs = concepts.filter(c => c.terms && c.terms.length);
  if (!cs.length) return { scopus: '', wos: '', pubmed: '', scholar: '' };
  const q = t => (/[\s-]/.test(t) ? `"${t}"` : t);
  const grp = (c, f) => (c.terms.length > 1 ? '(' + c.terms.map(f).join(' OR ') + ')' : f(c.terms[0]));
  const body = cs.map(c => grp(c, q)).join(' AND ');
  return {
    scopus: `TITLE-ABS-KEY(${body})`,
    wos: `TS=(${body})`,
    pubmed: cs.map(c => '(' + c.terms.map(t => `${q(t)}[tiab]`).join(' OR ') + ')').join(' AND '),
    scholar: cs.map(c => q(c.terms[0].replace(/\*/g, ''))).join(' ')
  };
}

/* ---------- Academic planner ---------- */
function programInfo(p, nowTs) {
  const now = new Date(nowTs || Date.now());
  const ayY = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  const isPhD = p.status === 'Докторант';
  const course = Math.max(1, Math.min(+p.course || 1, isPhD ? 3 : 2));
  const start = new Date(ayY - (course - 1), 8, 1);
  let defense = parseMonth(p.defense);
  if (!defense || defense <= start) defense = new Date(start.getFullYear() + (isPhD ? 3 : 2), 5, 1);
  return { isPhD, start, defense };
}
function buildPlan(p, prev, seed, nowTs) {
  const now = nowTs || Date.now();
  const { isPhD, start, defense } = programInfo(p, now);
  const tpl = isPhD ? PLAN_PHD : PLAN_MA;
  const span = Math.max(6, monthsBetween(start, defense));
  const lastM = tpl[tpl.length - 1].m;
  return tpl.map(x => {
    const mo = Math.round(x.m * span / lastM);
    const due = +new Date(start.getFullYear(), start.getMonth() + mo, x.k === 'defense' ? 15 : 28, 12);
    const old = prev && prev.find(o => o.k === x.k);
    const done = old ? old.done : (seed ? due < now : false);
    return { k: x.k, t: x.t, tr: x.tr, due, done, doneAt: old ? old.doneAt : (done ? due : null) };
  });
}
function semesterOf(ts, start) { return Math.max(0, Math.floor(monthsBetween(start, new Date(ts)) / 6)); }
function upcomingItems(n) {
  const now = Date.now();
  const ms = S.me.planner.milestones.filter(m => !m.done).map(m => ({ kind: 'ms', t: m.t, due: m.due, tr: m.tr, over: m.due < now }));
  const mt = S.me.planner.meetings.filter(m => m.at > now).map(m => ({ kind: 'mt', t: `Встреча с руководителем: ${m.topic}`, due: m.at, tr: 'meet' }));
  const ev = all('events').filter(e => (e.attendees || []).includes(myId()) && e.at > now).map(e => ({ kind: 'ev', t: e.title, due: e.at, tr: 'event' }));
  return ms.concat(mt, ev).sort((a, b) => a.due - b.due).slice(0, n);
}
function monthlyReport() {
  const p = S.me.passport, now = new Date();
  const m0 = +new Date(now.getFullYear(), now.getMonth(), 1), m1 = +new Date(now.getFullYear(), now.getMonth() + 1, 1), m2 = +new Date(now.getFullYear(), now.getMonth() + 2, 1);
  const inM = ts => ts >= m0 && ts < m1;
  const ms = S.me.planner.milestones;
  const done = ms.filter(m => m.done && m.doneAt && inM(m.doneAt));
  const open = ms.filter(m => !m.done).sort((a, b) => a.due - b.due);
  const meet = S.me.planner.meetings.filter(m => inM(m.at));
  const diary = S.me.planner.diary.filter(d => inM(d.at));
  const evs = all('events').filter(e => (e.attendees || []).includes(myId()));
  const tks = all('tickets').filter(isMine);
  const next = open.filter(m => m.due < m2).slice(0, 3);
  const L = [];
  L.push(`Ежемесячный отчёт о научной работе — ${fmtMY(+now)}`);
  L.push(`Исследователь: ${p.name}, ${p.status.toLowerCase()}, ${p.course} курс`);
  L.push(`Специальность: ${p.spec}`);
  L.push(`Тема: ${p.topic}`);
  L.push(`Научный руководитель: ${p.sup}`);
  L.push('');
  L.push('1. Выполнено в этом месяце:');
  (done.length ? done.map(m => `   – ${m.t}`) : ['   – завершённых этапов плана нет']).forEach(x => L.push(x));
  L.push('2. В работе и ближайшие этапы:');
  open.slice(0, 3).forEach(m => L.push(`   – ${m.t} — срок ${fmtDY(m.due)}`));
  L.push('3. Встречи с научным руководителем:');
  (meet.length ? meet.map(m => `   – ${fmtD(m.at)}: ${m.topic}${m.outcome ? ' — ' + m.outcome : ' (запланирована)'}`) : ['   – встреч в этом месяце не было']).forEach(x => L.push(x));
  L.push(`4. Дневник исследователя: ${diary.length} ${plural(diary.length, 'запись', 'записи', 'записей')}`);
  diary.forEach(d => L.push(`   – ${fmtD(d.at)} (${d.tag}): ${d.text}`));
  L.push('5. Обучение и мероприятия библиотеки:');
  (evs.length ? evs.map(e => `   – ${e.title} — ${fmtD(e.at)}`) : ['   – записей на мероприятия нет']).forEach(x => L.push(x));
  L.push(`6. Обращения в научную библиотеку: ${tks.length} (решено: ${tks.filter(t => t.status === 'resolved').length})`);
  L.push('7. План на следующий месяц:');
  (next.length ? next.map(m => `   – ${m.t}`) : open.slice(0, 1).map(m => `   – ${m.t}`)).forEach(x => L.push(x));
  const dn = ms.filter(m => m.done).length;
  L.push('');
  L.push(`Общий прогресс по плану: ${dn} из ${ms.length} этапов (${Math.round(dn / ms.length * 100)}%).`);
  return L.join('\n');
}

/* ---------- Tickets, notifications, analytics ---------- */
const threadOf = tid => all('messages').filter(m => m.ticketId === tid).sort((a, b) => a.at - b.at);
const myTickets = () => all('tickets').filter(isMine).sort((a, b) => (b.lastEventAt || b.updatedAt || b.createdAt) - (a.lastEventAt || a.updatedAt || a.createdAt));
const ticketUnread = t => !!t.lastEventAt && t.lastEventAt > (S.me.seen[t.id] || 0);
function audienceOk(n) { return n.audience === 'all' || (n.audience === 'phd' && S.me.passport.status === 'Докторант') || (n.audience === 'ma' && S.me.passport.status === 'Магистрант'); }
function studentNotifications() {
  const out = [];
  const EV = { reply: 'Библиотекарь ответил на ваш вопрос', taken: 'Библиотекарь взял вопрос в работу', resolved: 'Обращение отмечено как решённое' };
  myTickets().forEach(t => { if (t.lastEventAt) out.push({ key: 't:' + t.id, kind: 'ticket', tid: t.id, at: t.lastEventAt, title: `Обращение №${t.num} · ${STATUS[t.status]}`, text: EV[t.lastEvent] || 'Статус обращения обновлён', unread: ticketUnread(t) }); });
  all('notices').filter(audienceOk).forEach(n => out.push({ key: 'n:' + n.id, kind: 'notice', nid: n.id, at: n.at, title: n.title, text: n.text, unread: !(S.me.readNotices || []).includes(n.id) }));
  if (typeof cmNotifications === 'function') out.push(...cmNotifications());
  return out.sort((a, b) => b.at - a.at).slice(0, 12);
}
function niceMax(v) { if (v <= 5) return 5; const p = Math.pow(10, Math.floor(Math.log10(v))); for (const m of [1, 2, 2.5, 4, 5, 10]) if (m * p >= v) return m * p; return 10 * p; }
function analytics() {
  const tickets = all('tickets');
  const st = S.local.stats;
  const now = Date.now(), wk = startOfWeek(now);
  const weeks = st.weeks.map((v, i) => ({ start: wk - (st.weeks.length - i) * 7 * DAY, v }));
  const thisWeek = { start: wk, v: tickets.filter(t => t.createdAt >= wk).length };
  const cats = CATEGORIES.map(c => ({ label: c, v: (st.cats[c] || 0) + tickets.filter(t => t.cat === c).length })).sort((a, b) => b.v - a.v);
  const answered = tickets.filter(t => t.firstReplyAt);
  const avg = answered.length ? answered.reduce((s, t) => s + (t.firstReplyAt - t.createdAt), 0) / answered.length : 0;
  const views = st.views || {};
  const top = kbApproved().map(e => ({ e, v: (e.views || 0) + (views[e.id] || 0) })).sort((a, b) => b.v - a.v).slice(0, 6);
  return {
    waiting: tickets.filter(t => t.status === 'waiting'), progress: tickets.filter(t => t.status === 'progress'),
    resolved30: tickets.filter(t => t.status === 'resolved' && (t.resolvedAt || t.updatedAt) > now - 30 * DAY),
    avg, answeredN: answered.length, weeks, thisWeek, cats, top,
    bot: st.bot, botShare: st.bot.asked ? st.bot.kb / st.bot.asked : 0
  };
}
