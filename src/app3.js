/* =====================================================================
   7. Rendering infrastructure
   ===================================================================== */
const VIEWS = { student: {}, staff: {} };
const NAV = {
  student: [
    { id: 'passport', ru: 'Научный паспорт', en: 'AI Research Passport', ic: 'idcard' },
    { id: 'topics', ru: 'Подбор темы', en: 'AI Topic Finder', ic: 'bulb' },
    { id: 'search', ru: 'Поиск литературы', en: 'Research Search Bot', ic: 'search' },
    { id: 'library', ru: 'Моя библиотека', en: 'Smart Library Bot', ic: 'book' },
    { id: 'assistant', ru: 'Виртуальный библиотекарь', en: 'AI Library Assistant ENU', ic: 'chat' },
    { id: 'planner', ru: 'Научный планер', en: 'AI Academic Planner', ic: 'calendar' },
    { id: 'prompts', ru: 'Библиотека промптов', en: 'AI Prompt Library', ic: 'sparkle' }
  ],
  roadmap: { id: 'roadmap', ru: 'Развитие платформы', en: 'Roadmap · бета-модули', ic: 'layers' },
  staff: [
    { id: 'overview', ru: 'Обзор и аналитика', en: 'Library Staff Dashboard', ic: 'chart' },
    { id: 'tickets', ru: 'Обращения', en: 'Requests', ic: 'inbox' },
    { id: 'kb', ru: 'База знаний', en: 'Knowledge base', ic: 'database' },
    { id: 'events', ru: 'Мероприятия и консультации', en: 'Events & consultations', ic: 'calendar' },
    { id: 'resources', ru: 'Ресурсы и уведомления', en: 'Resources & notices', ic: 'mega' }
  ]
};
const dv = (k, def = '') => (S.ui.drafts[k] !== undefined ? S.ui.drafts[k] : def);
const curView = () => S.view[S.role];
let renderQueued = false;
function scheduleRender() {
  if (renderQueued) return;
  renderQueued = true;
  (window.requestAnimationFrame || setTimeout)(() => { renderQueued = false; render(); });
}
function render() {
  if (!document.getElementById('topbar')) return;
  renderTop(); renderNav(); renderMain(); renderModal();
}
function captureFocus() {
  const ae = document.activeElement;
  const st = { id: ae && ae.id, ss: null, se: null, scroll: {} };
  if (st.id && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA')) { try { st.ss = ae.selectionStart; st.se = ae.selectionEnd; } catch (e) { } }
  $$('[data-keep-scroll]').forEach(el => { st.scroll[el.dataset.keepScroll] = { top: el.scrollTop, bottom: el.scrollHeight - el.scrollTop - el.clientHeight < 40 }; });
  return st;
}
function restoreFocus(st) {
  $$('[data-keep-scroll]').forEach(el => {
    const k = st.scroll[el.dataset.keepScroll];
    if (!k) { if (el.dataset.stickBottom) el.scrollTop = el.scrollHeight; return; }
    el.scrollTop = (k.bottom && el.dataset.stickBottom) ? el.scrollHeight : k.top;
  });
  if (st.id) {
    const el = document.getElementById(st.id);
    if (el && document.activeElement !== el) { try { el.focus({ preventScroll: true }); if (st.ss != null) el.setSelectionRange(st.ss, st.se); } catch (e) { } }
  }
}
function renderMain() {
  const main = document.getElementById('main');
  if (!main) return;
  const st = captureFocus();
  const v = VIEWS[S.role][curView()] ? curView() : (S.role === 'student' ? 'passport' : 'overview');
  const app = main.closest('.app'); if (app) app.dataset.sec = v;
  main.innerHTML = VIEWS[S.role][v]();
  restoreFocus(st);
}
function renderTop() {
  const top = document.getElementById('topbar');
  if (!top) return;
  const p = S.me.passport, student = S.role === 'student';
  const notes = student ? studentNotifications() : [];
  const unread = notes.filter(n => n.unread).length;
  const aiChip = AI.state === 'ready'
    ? `<span class="sys-chip on" title="Ассистент, черновики ответов и бета-модули используют Claude"><span class="dot"></span><span class="lbl">ИИ Claude</span></span>`
    : AI.state === 'checking' ? `<span class="sys-chip wait" title="Подключаю ИИ"><span class="dot"></span><span class="lbl">ИИ: подключение</span></span>`
      : `<span class="sys-chip" title="Генерация ИИ недоступна в этом просмотре; ассистент отвечает по базе знаний"><span class="dot"></span><span class="lbl">ИИ: без генерации</span></span>`;
  const liveChip = Live.state === 'live'
    ? `<span class="sys-chip on" title="Обращения, база знаний и мероприятия синхронизируются между устройствами${Live.canWrite ? '' : ' (только чтение)'}"><span class="dot"></span><span class="lbl">Общая база</span></span>`
    : Live.state === 'connecting' ? `<span class="sys-chip wait" title="Подключаю общую базу"><span class="dot"></span><span class="lbl">Синхронизация</span></span>`
      : (Live.state === 'slow' || Live.state === 'error') ? `<span class="sys-chip wait" title="Общая база пока недоступна — данные могут быть неактуальны"><span class="dot"></span><span class="lbl">Нет связи с базой</span></span>`
        : `<span class="sys-chip" title="Данные демоверсии хранятся в этом браузере"><span class="dot"></span><span class="lbl">Локальный режим</span></span>`;
  top.innerHTML = `
    <button class="brand" data-act="about" title="О проекте">${BRAND}<span><span class="brand-name">Smart Research Library <span class="ver">1.0</span></span><span class="brand-sub">Научная библиотека ЕНУ им. Л. Н. Гумилёва</span></span><span class="demo-flag">Демо</span></button>
    <div class="grow"></div>
    <div class="role-switch" role="group" aria-label="Выбор кабинета">
      <button data-act="role" data-role="student" aria-pressed="${student}">${ic('grad')}<span class="lbl-long">Магистрант / Докторант</span><span class="lbl-short">Исследователь</span></button>
      <button data-act="role" data-role="staff" aria-pressed="${!student}">${ic('building')}<span class="lbl-long">Сотрудник библиотеки</span><span class="lbl-short">Библиотекарь</span></button>
    </div>
    <div class="grow"></div>
    <div class="top-right">${aiChip}${liveChip}${langSwitch()}${themeSwitch()}
      ${student ? `<div class="bell-wrap"><button class="icon-btn" data-act="bell" aria-haspopup="true" aria-expanded="${S.ui.bell}" aria-label="Уведомления${unread ? ': новых ' + unread : ''}">${ic('bell')}${unread ? `<span class="count">${unread}</span>` : ''}</button>${S.ui.bell ? bellDropdown(notes) : ''}</div>` : ''}
      <div class="who">${student
      ? `<div class="avatar">${esc(initials(p.name))}</div><div class="who-text"><div class="who-name">${esc(shortName(p.name))}</div><div class="who-role">${esc(p.status)} · ${p.course} курс</div></div>`
      : `<div class="avatar staff">${ic('building')}</div><div class="who-text"><div class="who-name">Библиотекарь-консультант</div><div class="who-role">Поддержка исследований</div></div>`}</div>
    </div>`;
  requestAnimationFrame(fitTopbar);
}
/* Верхняя панель подстраивается под длину подписей на выбранном языке:
   сначала прячутся подписи статусов, затем длинные названия кабинетов, подзаголовок, метка «Демо» и сами статусы. */
const TOP_STEPS = ['t-chips', 't-roles', 't-sub', 't-flag', 't-nochip'];
function fitTopbar() {
  const bar = document.getElementById('topbar');
  if (!bar) return;
  TOP_STEPS.forEach(c => bar.classList.remove(c));
  if (getComputedStyle(bar).flexWrap !== 'nowrap') return;
  const R = s => { const e = bar.querySelector(s); return e ? e.getBoundingClientRect() : null; };
  const tight = () => {
    const flag = R('.demo-flag'), brand = R('.brand'), rs = R('.role-switch'), tr = R('.top-right'), b = bar.getBoundingClientRect();
    if (!rs || !tr) return false;
    const left = Math.max(brand ? brand.right : 0, flag && flag.width ? flag.right : 0);
    return left + 8 > rs.left || rs.right + 8 > tr.left || tr.right > b.right;
  };
  for (const c of TOP_STEPS) { if (!tight()) break; bar.classList.add(c); }
}
function langSwitch() {
  return `<div class="lang-switch no-i18n" role="group" aria-label="Тіл · Язык · Language">${[['kk', 'ҚАЗ', 'Қазақша'], ['ru', 'РУС', 'Русский'], ['en', 'ENG', 'English']].map(([l, s, n]) => `<button data-act="lang" data-v="${l}" aria-pressed="${LANG === l}" title="${n}" lang="${l}">${s}</button>`).join('')}</div>`;
}
function themeSwitch() {
  const auto = `По времени суток: дневная с ${THEME_DAY_FROM}:00, вечерняя с ${THEME_EVENING_FROM}:00`;
  return `<div class="theme-switch" role="group" aria-label="Тема оформления">${[['day', 'sun', 'Дневная тема'], ['evening', 'moon', 'Вечерняя тема'], ['auto', 'clock', auto]].map(([v, i, t]) => `<button data-act="theme" data-v="${v}" aria-pressed="${themeModeVal === v}" title="${t}" aria-label="${t}">${ic(i)}</button>`).join('')}</div>`;
}
function bellDropdown(notes) {
  return `<div class="dropdown" role="dialog" aria-label="Уведомления"><div class="dd-head"><span>Уведомления</span>${notes.some(n => n.unread) ? `<button class="btn xs ghost" data-act="notif-all">Прочитать все</button>` : ''}</div>
    ${notes.length ? notes.map(n => `<button class="dd-item ${n.unread ? 'unread' : ''}" data-act="notif-open" data-key="${esc(n.key)}"><span class="dd-dot"></span><span><span class="dd-title" style="display:block">${esc(n.title)}</span><span class="dd-text" style="display:block">${esc(n.text)}</span><span class="dd-time" style="display:block">${esc(ago(n.at))}</span></span></button>`).join('') : '<div class="empty">Уведомлений нет</div>'}</div>`;
}
function renderNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const cur = curView();
  const badge = id => {
    if (S.role === 'staff' && id === 'tickets') { const n = all('tickets').filter(t => t.status === 'waiting').length; return n ? `<span class="ni-badge" title="Ожидают ответа">${n}</span>` : ''; }
    if (S.role === 'student' && id === 'assistant') { const n = myTickets().filter(ticketUnread).length; return n ? `<span class="ni-badge" title="Новые ответы">${n}</span>` : ''; }
    return '';
  };
  const item = it => `<a class="nav-item" href="#${S.role === 'staff' ? 'staff-' + it.id : it.id}" data-act="nav" data-view="${it.id}" ${it.id === cur ? 'aria-current="page"' : ''}><span class="ni-ic">${ic(it.ic)}</span><span class="ni-text"><span class="ni-ru">${esc(it.ru)}</span><span class="ni-en">${esc(it.en)}</span></span>${badge(it.id)}</a>`;
  nav.innerHTML = `<div class="nav-title">${S.role === 'student' ? 'Кабинет исследователя' : 'Кабинет сотрудника'}</div>`
    + NAV[S.role].map(item).join('')
    + (S.role === 'student' ? `<div class="nav-sep"></div>${item(NAV.roadmap)}` : '')
    + `<div class="nav-foot"><button class="nav-item" data-act="scenario"><span class="ni-ic">${ic('play')}</span><span class="ni-text"><span class="ni-ru">Сценарий показа</span></span></button><button class="nav-item" data-act="about"><span class="ni-ic">${ic('info')}</span><span class="ni-text"><span class="ni-ru">О проекте</span></span></button></div>`;
}

/* ---------- Shared fragments ---------- */
function pageHead(eyebrow, title, lede, actions = '') {
  const v = curView(), it = (NAV[S.role] || []).concat(S.role === 'student' ? [NAV.roadmap] : []).find(x => x.id === v);
  return `<header class="page-head hero"><div class="hero-motif" aria-hidden="true"></div><div class="hero-main">${it ? `<div class="hero-ic" aria-hidden="true">${ic(it.ic)}</div>` : ''}<div class="hero-text"><div class="eyebrow">${esc(eyebrow)}</div><h1>${esc(title)}</h1>${lede ? `<p class="lede">${lede}</p>` : ''}</div></div>${actions ? `<div class="page-actions">${actions}</div>` : ''}</header>`;
}
function panel(title, sub, body, o = {}) {
  return `<section class="panel ${o.cls || ''}"${o.id ? ` id="${o.id}"` : ''}><div class="panel-head"><div><h2>${title}</h2>${sub ? `<div class="sub">${sub}</div>` : ''}</div>${o.actions ? `<div class="toolbar">${o.actions}</div>` : ''}</div><div class="panel-body ${o.flush ? 'flush' : ''} ${o.stack ? 'stack' : ''}">${body}</div>${o.foot ? `<div class="panel-foot">${o.foot}</div>` : ''}</section>`;
}
const srcTag = s => (safeUrl(s.u) ? `<a class="tag" href="${esc(s.u)}" target="_blank" rel="noopener">${ic('ext')} ${esc(s.t)}</a>` : `<span class="tag">${ic('file')} ${esc(s.t)}</span>`);
const BOT_AVA = `<div class="bot-ava" aria-hidden="true">${ic('book')}</div>`;
const pubUrl = c => c.doi ? `https://doi.org/${c.doi}` : `https://scholar.google.com/scholar?q=${encodeURIComponent(c.title)}`;
function authorsShort(c) { const A = parseAuthors(c.au); if (!A.length) return c.type === 'standard' ? 'Стандарт' : ''; return A[0].fam + (A.length > 1 || c.etal ? ' и др.' : ''); }
function authorsLine(c) { const A = parseAuthors(c.au); return A.map(a => `${a.fam} ${iniDots(a)}`).join(', ') + (c.etal ? ' и др.' : '') + (c.editors ? ' (ред.)' : ''); }
function sourceLine(c) {
  if (c.type === 'article') return `<i>${esc(c.src)}</i>${c.vol ? `, ${esc(c.vol)}` : ''}${c.iss ? `(${esc(c.iss)})` : ''}${c.pages ? `, ${esc(c.pages)}` : c.art ? `, ${esc(c.art)}` : ''}`;
  if (c.type === 'conf') return `<i>${esc(c.src)}</i>`;
  if (c.type === 'report') return `${esc(c.publisher)} · ${esc(c.series)}`;
  return `${esc(c.publisher)}, ${esc(c.city)}${c.ed ? ` · ${esc(c.ed)} ed.` : ''}`;
}
function pubMini(c, why) {
  const saved = S.me.library.some(x => x.pid === c.id);
  return `<div class="mini"><div style="min-width:0"><a class="mini-title" href="${esc(pubUrl(c))}" target="_blank" rel="noopener">${esc(c.title)}</a><div class="mini-meta">${esc(authorsShort(c))} · ${c.year} · <i>${esc(c.src || c.publisher || '')}</i>${c.free ? ' · <span class="ok-txt">свободный доступ</span>' : ''}</div>${why ? `<div class="mini-why">по интересу «${esc(why)}»</div>` : ''}</div><button class="btn sm ${saved ? 'is-on' : ''}" data-act="save-pub" data-id="${c.id}">${ic(saved ? 'check' : 'bookmark')} ${saved ? 'Сохранено' : 'Сохранить'}</button></div>`;
}
function eventRow(e, staff) {
  const reg = (e.attendees || []).includes(myId());
  const count = (e.base || 0) + (e.attendees || []).length;
  const full = count >= e.seats;
  const d = new Date(e.at);
  return `<div class="ev-row"><div class="ev-date" aria-hidden="true"><span class="ev-day">${d.getDate()}</span><span class="ev-mon">${MON_S[d.getMonth()]}</span></div><div style="min-width:0"><div class="ev-title">${esc(e.title)}</div><div class="ev-meta">${fmtWD(e.at)}, ${fmtD(e.at)}, ${fmtT(e.at)} · ${esc(e.format)}${e.place ? ` · ${esc(e.place)}` : ''} · ${count} из ${e.seats} мест</div></div>${staff
    ? `<div class="toolbar"><span class="tag">${(e.attendees || []).length} из демоверсии</span><button class="btn xs ghost" data-act="ev-del" data-id="${e.id}" aria-label="Удалить мероприятие">${ic('trash')}</button></div>`
    : `<button class="btn sm ${reg ? 'is-on' : ''}" data-act="ev-reg" data-id="${e.id}" ${full && !reg ? 'disabled' : ''}>${reg ? ic('check') + ' Вы записаны' : full ? 'Мест нет' : 'Записаться'}</button>`}</div>`;
}
function ticketMini(t) {
  const un = ticketUnread(t);
  return `<button class="trow" data-act="open-ticket" data-id="${t.id}"><span class="stripe ${t.status}"></span><span style="min-width:0;display:block"><span class="t-top"><span class="t-num">№${t.num}</span><span class="pill ${t.status}">${STATUS[t.status]}</span>${un ? '<span class="tag accent">новый ответ</span>' : ''}</span><span class="t-q">${esc(t.q)}</span><span class="t-meta" style="display:block">${esc(t.cat)} · ${esc(ago(t.lastEventAt || t.createdAt))}</span></span></button>`;
}
const TRACK_LABEL = Object.assign({ meet: 'Руководитель', event: 'Мероприятие' }, TRACKS);

/* =====================================================================
   8. Student views
   ===================================================================== */
const VIS_KEYS = ['topic', 'sup', 'cons', 'orcid', 'interests', 'pubs', 'projects', 'defense'];
function passportCard(p) {
  const prev = S.ui.ppPreview, vis = p.vis || {};
  const row = (key, label, html, toggle = true) => {
    const off = toggle && vis[key] === false;
    if (prev && off) return '';
    const btn = toggle && !prev ? `<button class="pp-vis ${off ? 'off' : ''}" data-act="pp-vis" data-key="${key}" aria-pressed="${!off}" title="${off ? 'Скрыто от других исследователей — открыть' : 'Видно другим исследователям — скрыть'}">${ic(off ? 'eyeoff' : 'eye')}<span class="sr-only">${off ? 'Скрыто' : 'Открыто'}: ${label}</span></button>` : '<span></span>';
    return `<div class="pp-row ${off ? 'is-hidden' : ''}"><div class="pp-k">${label}</div><div class="pp-v">${html || '<span class="missing">не указано</span>'}</div>${btn}</div>`;
  };
  const list = arr => (arr && arr.length ? `<ul>${arr.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '');
  const def = parseMonth(p.defense);
  const open = VIS_KEYS.filter(k => vis[k] !== false).length;
  return `<article class="passport" aria-label="Научный паспорт исследователя">
    <div class="passport-top"><span class="pp-label">MY RESEARCH PASSPORT</span><span class="pp-num">SRL-${new Date().getFullYear()}-${hash4(p.name + p.orcid)}</span></div>
    <div class="passport-main">${STAMP}<div class="pp-photo" aria-hidden="true">${esc(initials(p.name))}</div><div style="min-width:0"><div class="pp-name">${esc(p.name)}</div><div class="pp-sub"><span class="tag accent">${esc(p.status)} · ${p.course} курс</span><span class="tag">ЕНУ им. Л. Н. Гумилёва</span></div></div></div>
    <div class="pp-fields">
      ${row('spec', 'Научная специальность', esc(p.spec), false)}
      ${row('topic', 'Тема диссертации', esc(p.topic))}
      ${row('sup', 'Научный руководитель', esc(p.sup))}
      ${row('cons', 'Зарубежный консультант', esc(p.cons))}
      ${row('orcid', 'ORCID', p.orcid ? `<a class="mono" href="https://orcid.org/${esc(p.orcid)}" target="_blank" rel="noopener">${esc(p.orcid)}</a> ${orcidValid(p.orcid) ? `<span class="tag ok">${ic('check')} контрольная цифра верна</span>` : '<span class="tag">проверьте номер</span>'}` : '')}
      ${row('interests', 'Научные интересы', (p.interests || []).length ? `<div class="chips">${p.interests.map(i => `<span class="tag">${esc(i)}</span>`).join('')}</div>` : '')}
      ${row('pubs', 'Публикации', list(p.pubs))}
      ${row('projects', 'Научные проекты', list(p.projects))}
      ${row('defense', 'Планируемая защита', def ? esc(fmtMY(+def)) : '')}
    </div>
    <div class="pp-foot"><span class="small muted">${prev ? 'Так профиль видят другие исследователи' : `Открыто другим исследователям: ${open} из ${VIS_KEYS.length} полей`}</span><button class="btn sm" data-act="pp-edit">${ic('edit')} Изменить</button></div>
  </article>`;
}
VIEWS.student.passport = function () {
  const p = S.me.passport;
  const recs = recommendPubs(4);
  const evs = all('events').filter(e => e.at > Date.now()).map(e => ({ e, s: eventRelevance(e) })).sort((a, b) => b.s - a.s || a.e.at - b.e.at).slice(0, 3).map(x => x.e).sort((a, b) => a.at - b.at);
  const ups = upcomingItems(4);
  const tks = myTickets().slice(0, 3);
  const js = recommendJournals(3);
  const hint = !S.me.hintDismissed ? `<div class="note brass note-hint">${ic('info')}<div class="note-text">Это демоверсия конкурсного проекта. Вверху переключаются два кабинета: исследователя (магистранта, докторанта) и сотрудника библиотеки. Пошаговый сценарий показа — в меню.</div><button class="btn sm" data-act="scenario"><span class="ni-ic">${ic('play')}</span> Сценарий показа</button><button class="btn sm ghost" data-act="hint-off" aria-label="Скрыть подсказку">${ic('x')}</button></div>` : '';
  return `<div class="page">${hint}
    ${pageHead('AI Research Passport', 'Научный паспорт', 'Профиль исследователя — основа для рекомендаций публикаций, журналов, мероприятий и научного плана. Вы сами решаете, какие сведения видят другие исследователи.',
    `<button class="btn" data-act="pp-preview" aria-pressed="${S.ui.ppPreview}">${ic(S.ui.ppPreview ? 'eyeoff' : 'eye')} ${S.ui.ppPreview ? 'Обычный вид' : 'Как видят другие'}</button><button class="btn primary" data-act="pp-edit">${ic('edit')} Редактировать паспорт</button>`)}
    <div class="split left-fixed">
      <div class="col">${passportCard(p)}</div>
      <div class="col">
        ${panel('Публикации по вашим интересам', 'Подобраны по научным интересам и теме диссертации', recs.length ? `<div class="row-list">${recs.map(r => pubMini(r.c, r.why)).join('')}</div>` : '<div class="empty">Добавьте научные интересы в паспорт — появятся рекомендации</div>', { flush: true, actions: `<button class="btn sm ghost" data-act="nav" data-view="search">Все результаты ${ic('arrow')}</button>` })}
        ${panel('Мероприятия по вашему профилю', 'Обучение научной библиотеки ЕНУ: запись в один клик', evs.length ? `<div class="row-list">${evs.map(e => eventRow(e)).join('')}</div>` : '<div class="empty">Ближайших мероприятий нет</div>', { flush: true })}
        <div class="split half">
          ${panel('Ближайшие задачи', 'Из научного планера', ups.length ? `<div class="row-list">${ups.map(u => `<div class="up"><div class="up-due ${u.over ? 'over' : ''}">${fmtDS(u.due)}</div><div style="min-width:0"><div class="up-t">${esc(u.t)}</div><div class="up-k">${esc(TRACK_LABEL[u.tr] || '')}${u.over ? ' · срок прошёл' : ''}</div></div></div>`).join('')}</div>` : '<div class="empty">Все этапы выполнены</div>', { flush: true, actions: `<button class="btn sm ghost" data-act="nav" data-view="planner">Планер ${ic('arrow')}</button>` })}
          ${panel('Мои обращения', 'Вопросы библиотекарю и их статус', tks.length ? `<div class="row-list">${tks.map(ticketMini).join('')}</div>` : '<div class="empty">Обращений пока нет</div>', { flush: true, actions: `<button class="btn sm ghost" data-act="nav" data-view="assistant">Все ${ic('arrow')}</button>` })}
        </div>
        ${panel('Журналы для будущих публикаций', 'По теме диссертации и сохранённым статьям', `<div class="row-list">${js.map(j => `<div class="mini"><div style="min-width:0"><div class="mini-title">${esc(j.t)}</div><div class="mini-meta">${esc(j.p)}${j.oa ? ' · <span class="ok-txt">открытый доступ</span>' : ''}</div></div><a class="btn sm ghost" href="https://www.scimagojr.com/journalsearch.php?q=${encodeURIComponent(j.t)}" target="_blank" rel="noopener">${ic('ext')} Проверить в SJR</a></div>`).join('')}</div>`,
    { flush: true, foot: 'Индексацию, квартиль и стоимость публикации проверяйте в Scopus Sources, SJR и JCR перед подачей. Система не гарантирует принятие статьи.' })}
      </div>
    </div></div>`;
};

/* ---------- Research Search Bot ---------- */
function resultRow(c) {
  const saved = S.me.library.some(x => x.pid === c.id);
  const open = S.ui.citeOpen[c.id];
  return `<article class="result"><div class="r-meta-col"><div class="r-year">${c.year}</div><div class="r-type">${TYPE_LABEL[c.type]}</div></div><div style="min-width:0">
    <h3 class="r-title"><a href="${esc(pubUrl(c))}" target="_blank" rel="noopener">${esc(c.title)}</a></h3>
    ${c.au ? `<div class="r-authors">${esc(authorsLine(c))}</div>` : ''}
    <div class="r-src">${sourceLine(c)}</div>
    <p class="r-note">${esc(c.note)}</p>
    <div class="r-badges">${c.free ? '<span class="tag ok">Свободный доступ</span>' : ''}${(c.idx || []).map(i => `<span class="tag mono">${i === 'WoS' ? 'Web of Science' : i}</span>`).join('')}<span class="tag">${esc(TOPICS[c.topic])}</span>${c.doi ? `<span class="tag mono">DOI ${esc(c.doi)}</span>` : ''}</div>
    <div class="r-actions"><button class="btn sm ${saved ? 'is-on' : ''}" data-act="save-pub" data-id="${c.id}">${ic(saved ? 'check' : 'bookmark')} ${saved ? 'В библиотеке' : 'В библиотеку'}</button><button class="btn sm" data-act="cite" data-id="${c.id}" aria-expanded="${!!open}">${ic('copy')} Цитировать</button>${c.doi ? `<a class="btn sm ghost" href="https://doi.org/${esc(c.doi)}" target="_blank" rel="noopener">${ic('ext')} Открыть по DOI</a>` : ''}</div>
    ${open ? `<div class="cite-box">${['gost', 'apa', 'vancouver'].map(s => { const t = STYLES[s][1](c); return `<div><div class="cite-head"><span class="label">${STYLES[s][0]}</span><button class="btn xs" data-act="copy" data-text="${esc(t)}">${ic('copy')} Копировать</button></div><div class="codebox">${esc(t)}</div></div>`; }).join('')}</div>` : ''}
  </div></article>`;
}
function builderPanel() {
  const B = S.me.builder, Q = builderQueries(B.concepts), tab = S.ui.builderTab;
  const concepts = B.concepts.map((c, i) => `${i ? '<div class="and-sep">AND</div>' : ''}<div class="concept"><div class="concept-head"><b>КОНЦЕПТ ${'ABCD'[i]}${c.label ? ' · ' + esc(c.label) : ''}</b>${B.concepts.length > 1 ? `<button class="btn xs ghost" data-act="b-del" data-i="${i}" aria-label="Удалить концепт ${'ABCD'[i]}">${ic('trash')}</button>` : ''}</div>
    <div class="chips">${c.terms.map((t, j) => `<span class="term">${esc(t)}<button data-act="b-term-del" data-i="${i}" data-j="${j}" aria-label="Удалить термин ${esc(t)}">${ic('x')}</button></span>`).join('') || '<span class="hint">Добавьте синонимы — они объединятся через OR</span>'}</div>
    <input class="input" id="b-in-${i}" data-draft="b-in-${i}" data-enter="b-add" data-i="${i}" placeholder="Новый термин и Enter" value="${esc(dv('b-in-' + i))}" aria-label="Добавить термин в концепт ${'ABCD'[i]}"></div>`).join('');
  const tabs = [['scopus', 'Scopus'], ['wos', 'WoS'], ['pubmed', 'PubMed'], ['scholar', 'Scholar']];
  const FULL = { scopus: 'Scopus', wos: 'Web of Science', pubmed: 'PubMed', scholar: 'Google Scholar' };
  const OPEN = { scopus: 'https://www.scopus.com/search/form.uri?display=advanced', wos: 'https://www.webofscience.com/wos/woscc/advanced-search', pubmed: 'https://pubmed.ncbi.nlm.nih.gov/?term=' + encodeURIComponent(Q.pubmed), scholar: 'https://scholar.google.com/scholar?q=' + encodeURIComponent(Q.scholar) };
  const label = FULL[tab];
  const paste = tab === 'scopus' || tab === 'wos';
  const body = concepts + `<div class="toolbar">${B.concepts.length < 4 ? `<button class="btn sm" data-act="b-add-concept">${ic('plus')} Концепт</button>` : ''}<button class="btn sm ai" data-act="b-ai" ${S.ui.bBusy ? 'disabled' : ''}>${ic('sparkle')} ${S.ui.bBusy ? 'ИИ подбирает термины…' : 'Предложить термины (ИИ)'}</button></div>
    <div class="divider"></div>
    <div class="seg" role="group" aria-label="Синтаксис базы">${tabs.map(([k, l]) => `<button data-act="b-tab" data-v="${k}" aria-pressed="${tab === k}" title="${FULL[k]}">${l}</button>`).join('')}</div>
    <pre class="codebox" aria-label="Готовый запрос">${esc(Q[tab]) || 'Добавьте термины'}</pre>
    <div class="toolbar"><button class="btn sm" data-act="copy" data-text="${esc(Q[tab])}">${ic('copy')} Копировать</button><a class="btn sm primary" href="${esc(OPEN[tab])}" target="_blank" rel="noopener" data-act="copy-open" data-text="${esc(Q[tab])}">${ic('ext')} ${paste ? 'Скопировать и открыть' : 'Открыть'} ${label}</a></div>
    <div class="hint">${paste ? 'Запрос копируется в буфер — вставьте его в поле расширенного поиска. Полный доступ — из сети ЕНУ по национальной подписке МНВО РК.' : 'Ссылка откроет базу с готовым запросом.'}</div>`;
  return panel('Конструктор поисковой стратегии', 'Синонимы внутри концепта — OR, концепты между собой — AND', body, { stack: true });
}
function externalPanel(q) {
  const e = encodeURIComponent(q || '');
  const links = [
    ['Google Scholar', `https://scholar.google.com/scholar?q=${e}`, 'Мультидисциплинарный поиск'],
    ['Semantic Scholar', `https://www.semanticscholar.org/search?q=${e}`, 'Научные статьи с краткими аннотациями'],
    ['BASE', `https://www.base-search.net/Search/Results?lookfor=${e}`, 'Открытые репозитории мира'],
    ['PubMed', `https://pubmed.ncbi.nlm.nih.gov/?term=${e}`, 'Медицина и науки о жизни'],
    ['КиберЛенинка', `https://cyberleninka.ru/search?q=${e}`, 'Статьи на русском языке'],
    ['Репозиторий ЕНУ', `https://repository.enu.kz/discover?query=${e}`, 'Научные работы ЕНУ'],
    ['OATD', `https://oatd.org/oatd/search?q=${e}`, 'Диссертации открытого доступа']
  ];
  return panel('Искать во внешних базах', q ? `Запрос: «${esc(q)}»` : 'Введите запрос или соберите стратегию', `<div class="row-list">${links.map(([n, u, d]) => `<a class="ext-row" href="${esc(u)}" target="_blank" rel="noopener"><span><b>${esc(n)}</b><span class="muted small" style="display:block">${esc(d)}</span></span>${ic('ext')}</a>`).join('')}</div>`, { flush: true });
}
VIEWS.student.search = function () {
  const f = S.ui.search;
  const types = [['all', 'Все'], ['article', 'Статьи'], ['book', 'Книги'], ['guide', 'Руководства и стандарты'], ['diss', 'Диссертации']];
  const sel = (id, label, opts, val) => `<label class="sr-only" for="${id}">${label}</label><select class="select inline" id="${id}">${opts.map(([v, l]) => `<option value="${v}" ${String(val) === v ? 'selected' : ''}>${l}</option>`).join('')}</select>`;
  const form = `<form class="panel" data-form="search" role="search"><div class="panel-body stack">
    <div class="toolbar"><input class="input" id="s-q" data-draft="s-q" type="search" style="flex:1;min-width:220px" placeholder="Тема, автор или DOI: систематический обзор, bibliometrix, ChatGPT в образовании…" value="${esc(dv('s-q', f.q))}" aria-label="Поисковый запрос"><button class="btn primary" type="submit">${ic('search')} Найти</button></div>
    <div class="toolbar"><div class="seg" role="group" aria-label="Тип документа">${types.map(([k, l]) => `<button type="button" data-act="s-type" data-v="${k}" aria-pressed="${f.type === k}">${l}</button>`).join('')}</div>
      ${sel('s-idx', 'Индексация', [['any', 'Любая индексация'], ['Scopus', 'Scopus'], ['WoS', 'Web of Science'], ['PubMed', 'PubMed']], f.idx)}
      ${sel('s-from', 'Годы', [['', 'Все годы'], ['2015', 'С 2015 года'], ['2020', 'С 2020 года'], ['2023', 'С 2023 года']], f.from)}
      ${sel('s-sort', 'Сортировка', [['rel', 'По релевантности'], ['year', 'Сначала новые']], f.sort)}
      <label class="check"><input type="checkbox" id="s-free" ${f.free ? 'checked' : ''}> Свободный доступ</label></div>
  </div></form>`;
  let results;
  if (f.type === 'diss') {
    const q = encodeURIComponent(f.q || S.me.passport.topic);
    results = panel('Диссертации', 'Диссертации не входят в демо-индекс — поиск идёт по профильным источникам', `<div class="row-list">
      <a class="ext-row" href="https://repository.enu.kz/discover?query=${q}" target="_blank" rel="noopener"><span><b>Репозиторий ЕНУ</b><span class="muted small" style="display:block">Научные работы университета</span></span>${ic('ext')}</a>
      <a class="ext-row" href="https://oatd.org/oatd/search?q=${q}" target="_blank" rel="noopener"><span><b>OATD</b><span class="muted small" style="display:block">Открытые диссертации университетов мира</span></span>${ic('ext')}</a>
      <a class="ext-row" href="https://www.dart-europe.org/" target="_blank" rel="noopener"><span><b>DART-Europe</b><span class="muted small" style="display:block">Европейские диссертации</span></span>${ic('ext')}</a>
      <div class="ext-row"><span><b>ProQuest Dissertations &amp; Theses Global</b><span class="muted small" style="display:block">Коммерческая база по подписке — уточните доступ у библиотекаря</span></span><button class="btn sm" data-act="escalate" data-q="${esc('Есть ли доступ к ProQuest Dissertations & Theses Global? Ищу диссертации по теме: ' + (f.q || S.me.passport.topic))}" data-cat="Поиск литературы">Спросить</button></div></div>`, { flush: true });
  } else {
    const r = searchCatalog(f);
    const sub = r.profile ? 'Запрос пуст — показана подборка по вашему научному паспорту' : `Найдено: ${r.items.length} · демо-индекс содержит ${CATALOG.length} реальных публикаций с DOI`;
    results = panel(r.profile ? 'Подборка по вашему профилю' : 'Результаты поиска', sub, r.items.length ? `<div class="row-list">${r.items.map(resultRow).join('')}</div>` : `<div class="empty">В демо-индексе ничего не нашлось. Попробуйте другие слова или поищите во внешних базах справа.</div>`, { flush: true });
  }
  const extQ = (f.q || '').trim() || builderQueries(S.me.builder.concepts).scholar;
  return `<div class="page">${pageHead('Research Search Bot', 'Поиск научной литературы', 'Статьи, книги и руководства из демо-индекса библиотеки, готовые запросы для Scopus и Web of Science и переход в открытые базы.')}
    ${form}<div class="split"><div class="col">${results}</div><div class="col">${builderPanel()}${externalPanel(extQ)}</div></div></div>`;
};

/* ---------- Smart Library Bot ---------- */
function libItems() { return S.me.library.map(x => ({ x, c: CATALOG.find(c => c.id === x.pid) })).filter(o => o.c); }
function libSummary(items) {
  if (!items.length) return 'Библиотека пуста — сохраните публикации из поиска.';
  const by = {}; items.forEach(o => { by[o.x.coll] = (by[o.x.coll] || 0) + 1; });
  const ys = items.map(o => o.c.year);
  const unread = items.filter(o => o.x.status === 'unread');
  const missing = Object.keys(TOPICS).filter(k => !by[k] && relScore(profileTokens(), TOPICS[k]) > 0);
  const L = ['**Состав подборки**'];
  Object.entries(by).sort((a, b) => b[1] - a[1]).forEach(([k, n]) => L.push(`- ${TOPICS[k]}: ${n}`));
  L.push(`- Годы публикаций: ${Math.min(...ys)}–${Math.max(...ys)}; свежих (с 2021 года): ${ys.filter(y => y >= 2021).length}`);
  L.push('**Что усилить**');
  if (missing.length) missing.forEach(k => L.push(`- Нет источников по направлению «${TOPICS[k]}»`));
  if (ys.filter(y => y >= 2021).length < items.length / 2) L.push('- Добавьте публикации последних трёх лет');
  L.push('- Проверьте, есть ли исследования по Казахстану и Центральной Азии');
  if (unread.length) { L.push('**С чего продолжить**'); unread.slice(0, 3).forEach(o => L.push(`- ${o.c.title} (${o.c.year})`)); }
  return L.join('\n');
}
VIEWS.student.library = function () {
  const f = S.ui.lib, items = libItems();
  const counts = {}; items.forEach(o => { counts[o.x.coll] = (counts[o.x.coll] || 0) + 1; });
  const shown = items.filter(o => (f.coll === 'all' || o.x.coll === f.coll) && (f.status === 'all' || o.x.status === f.status));
  const ys = items.map(o => o.c.year);
  const kp = (l, v, s) => `<div class="kpi"><div class="kpi-label">${l}</div><div class="kpi-value">${v}</div><div class="kpi-sub">${s}</div></div>`;
  const kpis = `<div class="kpis">${kp('Сохранено', items.length, plural(items.length, 'публикация', 'публикации', 'публикаций'))}${kp('Прочитано', items.filter(o => o.x.status === 'done').length, `читаю сейчас: ${items.filter(o => o.x.status === 'reading').length}`)}${kp('Коллекции', Object.keys(counts).length, 'распределены автоматически по темам')}${kp('Годы', ys.length ? `${Math.min(...ys)}–${Math.max(...ys)}` : '—', 'диапазон публикаций')}</div>`;
  const colls = `<div class="chips"><button class="chip-btn" data-act="lib-coll" data-v="all" aria-pressed="${f.coll === 'all'}">Все · ${items.length}</button>${Object.entries(TOPICS).filter(([k]) => counts[k]).map(([k, v]) => `<button class="chip-btn" data-act="lib-coll" data-v="${k}" aria-pressed="${f.coll === k}">${esc(v)} · ${counts[k]}</button>`).join('')}</div>`;
  const statusSeg = `<div class="seg" role="group" aria-label="Статус чтения">${[['all', 'Любой статус']].concat(Object.entries(LIB_STATUS)).map(([k, v]) => `<button data-act="lib-filter-status" data-v="${k}" aria-pressed="${f.status === k}">${v}</button>`).join('')}</div>`;
  const rows = shown.map(({ x, c }) => {
    const open = S.ui.drafts['lib-open-' + x.id];
    return `<div class="lib-row"><a class="mini-title" href="${esc(pubUrl(c))}" target="_blank" rel="noopener">${esc(c.title)}</a><div class="mini-meta">${esc(authorsShort(c))} · ${c.year} · <i>${esc(c.src || c.publisher || '')}</i> · добавлено ${esc(fmtD(x.added))}</div>
      <div class="toolbar" style="margin-top:9px"><label class="sr-only" for="lib-c-${x.id}">Коллекция</label><select class="select inline sm-select" id="lib-c-${x.id}" data-lib-coll="${x.id}">${Object.entries(TOPICS).map(([k, v]) => `<option value="${k}" ${x.coll === k ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select>
        <div class="seg" role="group" aria-label="Статус чтения">${Object.entries(LIB_STATUS).map(([k, v]) => `<button data-act="lib-status" data-id="${x.id}" data-v="${k}" aria-pressed="${x.status === k}">${v}</button>`).join('')}</div>
        <button class="btn sm ghost" data-act="lib-note" data-id="${x.id}" title="${x.notes ? 'Изменить заметку' : 'Добавить заметку'}">${ic('edit')} Заметка</button>
        <button class="btn sm ghost" data-act="lib-del" data-id="${x.id}" aria-label="Убрать из библиотеки">${ic('trash')}</button></div>
      ${x.notes && !open ? `<div class="lib-note">${esc(x.notes)}</div>` : ''}
      ${open ? `<div class="stack-sm"><label class="sr-only" for="lib-n-${x.id}">Заметка</label><textarea class="textarea" id="lib-n-${x.id}" data-draft="lib-n-${x.id}" rows="2" placeholder="Мысли, цитаты, где использовать в диссертации">${esc(dv('lib-n-' + x.id, x.notes))}</textarea><div class="toolbar"><button class="btn sm primary" data-act="lib-note-save" data-id="${x.id}">Сохранить</button><button class="btn sm ghost" data-act="lib-note" data-id="${x.id}">Отмена</button></div></div>` : ''}</div>`;
  }).join('');
  const expItems = (f.coll === 'all' ? items : items.filter(o => o.x.coll === f.coll)).map(o => o.c);
  const text = expItems.length ? formatList(expItems, f.style) : '';
  const exportPanel = panel('Список литературы', `${expItems.length} ${plural(expItems.length, 'источник', 'источника', 'источников')}${f.coll !== 'all' ? ' · коллекция «' + esc(TOPICS[f.coll]) + '»' : ''}`,
    `<div class="chips" role="group" aria-label="Стиль оформления">${Object.entries(STYLES).map(([k, [l]]) => `<button class="chip-btn" data-act="lib-style" data-v="${k}" aria-pressed="${f.style === k}">${l}</button>`).join('')}</div>
     <pre class="codebox tall">${esc(text) || 'Нет источников'}</pre>
     <div class="toolbar"><button class="btn sm primary" data-act="copy" data-text="${esc(text)}" ${text ? '' : 'disabled'}>${ic('copy')} Скопировать список</button></div>
     <div class="hint">${f.style === 'ris' || f.style === 'bibtex' ? 'Zotero: Файл → Импорт из буфера обмена. Для EndNote сохраните текст в файл .ris и импортируйте его.' : 'Сверьте оформление с требованиями диссертационного совета или журнала.'}</div>`, { stack: true });
  const la = S.ui.libAi;
  const aiPanel = panel('Анализ подборки', 'Темы, пробелы и что читать дальше', `<button class="btn ai" data-act="lib-ai" ${la && (la.state === 'loading' || la.state === 'streaming') ? 'disabled' : ''}>${ic('sparkle')} ${la && la.state === 'loading' ? 'Анализирую…' : la ? 'Проанализировать заново' : 'Проанализировать подборку'}</button>
    ${la ? `${la.fallback ? '<div class="hint">ИИ недоступен в этом просмотре — показан автоматический анализ по метаданным.</div>' : ''}${la.note ? `<div class="hint">${esc(la.note)}</div>` : ''}<div class="md ${la.state === 'streaming' ? 'streaming' : ''}" id="lib-ai-out">${la.state === 'loading' ? '<div class="thinking">Изучаю сохранённые публикации…</div>' : md(la.text)}</div>` : '<div class="hint">ИИ сгруппирует публикации, покажет пробелы и предложит порядок чтения — только по вашему списку.</div>'}`, { stack: true });
  return `<div class="page">${pageHead('Smart Library Bot', 'Моя научная библиотека', 'Сохранённые публикации автоматически раскладываются по тематическим коллекциям. Отмечайте прочитанное, ведите заметки и получайте список литературы в нужном стиле.', `<button class="btn" data-act="nav" data-view="search">${ic('search')} Найти публикации</button>`)}
    ${kpis}<div class="split"><div class="col">${panel('Сохранённые публикации', `${shown.length} из ${items.length}`, `<div class="lib-filters">${colls}${statusSeg}</div>${rows ? `<div class="row-list lib-list">${rows}</div>` : '<div class="empty">В этой выборке пусто</div>'}`, { flush: true })}</div><div class="col">${exportPanel}${aiPanel}</div></div></div>`;
};

/* ---------- AI Library Assistant ENU ---------- */
function welcomeMsg() {
  const first = S.me.passport.name.split(' ')[0];
  return `<div class="msg bot">${BOT_AVA}<div class="answer"><div class="md">${L3(`<p>Здравствуйте, ${esc(first)}! Я виртуальный библиотекарь научной библиотеки ЕНУ. Отвечаю на вопросы о научных базах данных, библиографических менеджерах, поиске литературы и услугах библиотеки — на русском, казахском или английском.</p><p>Ответы строятся на утверждённой базе знаний. Если подтверждённого ответа нет, передам вопрос сотруднику библиотеки.</p>`, `<p>Сәлеметсіз бе, ${esc(first)}! Мен — ЕҰУ ғылыми кітапханасының виртуалды кітапханашысымын. Ғылыми дерекқорлар, библиографиялық менеджерлер, әдебиет іздеу және кітапхана қызметтері туралы сұрақтарға қазақ, орыс немесе ағылшын тілінде жауап беремін.</p><p>Жауаптар бекітілген білім базасына негізделеді. Расталған жауап болмаса, сұрақты кітапхана қызметкеріне жіберемін.</p>`, `<p>Hello, ${esc(first)}! I’m the virtual librarian of the ENU Research Library. I answer questions about research databases, reference managers, literature search and library services in Kazakh, Russian or English.</p><p>Answers come from the approved knowledge base. If there is no confirmed answer, I’ll pass your question to a library staff member.</p>`)}</div></div></div>`;
}
function noKbText(long) {
  return long
    ? L3('В утверждённой базе знаний пока нет ответа на этот вопрос. Передайте его библиотекарю — ответ придёт в историю обращений, а типовой ответ после проверки попадёт в базу знаний.', 'Бекітілген білім базасында бұл сұраққа әзірге жауап жоқ. Оны кітапханашыға жіберіңіз — жауап өтініштер тарихына келеді, ал үлгілік жауап тексерілгеннен кейін білім базасына енеді.', 'The approved knowledge base has no answer to this question yet. Send it to a librarian — the reply will appear in your request history, and a standard answer will be added to the knowledge base after review.')
    : L3('В утверждённой базе знаний пока нет ответа на этот вопрос. Передайте его библиотекарю — ответ придёт в историю обращений.', 'Бекітілген білім базасында бұл сұраққа әзірге жауап жоқ. Оны кітапханашыға жіберіңіз — жауап өтініштер тарихына келеді.', 'The approved knowledge base has no answer to this question yet. Send it to a librarian — the reply will appear in your request history.');
}
function chatMsgText(m) {
  if (m.sys) return noKbText(m.sys === 'nokb-long');
  if (m.kind === 'none' && /^В утверждённой базе знаний пока нет ответа/.test(m.text || '')) return noKbText(/типовой ответ/.test(m.text));
  return m.text;
}
function renderChatMsg(m) {
  if (m.role === 'user') return `<div class="msg user"><div class="bubble">${esc(m.text)}</div></div>`;
  if (m.kind === 'ticket') {
    const t = byId('tickets', m.ticketId);
    return `<div class="msg bot">${BOT_AVA}<div class="answer sys"><div class="answer-head"><span class="pill ${t ? t.status : 'waiting'}">${STATUS[t ? t.status : 'waiting']}</span><span>Обращение №${t ? t.num : '—'} передано сотруднику библиотеки</span></div><div class="md"><p>${L3(`Категория: ${esc(t ? t.cat : '')}. Ответ появится в истории обращений, а вы получите уведомление.`, `Санат: ${esc(trS(t ? t.cat : ''))}. Жауап өтініштер тарихында пайда болады, ал сізге хабарландыру келеді.`, `Category: ${esc(trS(t ? t.cat : ''))}. The reply will appear in your request history and you will be notified.`)}</p></div><div class="answer-actions"><button class="btn sm" data-act="open-ticket" data-id="${esc(m.ticketId)}">Открыть обращение</button></div></div></div>`;
  }
  const head = m.kind === 'kb' ? `<span class="pill approved">Подтверждённый ответ</span><span>по базе знаний библиотеки${m.ai ? ' · сформулировал ИИ' : ''}</span>`
    : m.kind === 'ai' ? '<span class="pill ai">Предварительный ответ ИИ</span><span>не подтверждён библиотекой</span>'
      : '<span class="pill draft">Нет подтверждённого ответа</span>';
  const entry = m.orig ? byId('kb', m.orig) : null;
  const body = m.state === 'pending' ? `<div class="thinking">${m.kind === 'kb' ? 'Нашёл инструкцию в базе знаний, формулирую ответ…' : 'Ищу в базе знаний…'}</div>` : `<div class="md ${m.state === 'streaming' ? 'streaming' : ''}" id="mb-${m.id}">${md(chatMsgText(m))}</div>`;
  const orig = m.kind === 'kb' && m.ai && entry && m.state === 'done' ? `<details class="orig"><summary>Исходная инструкция из базы знаний</summary><div class="md">${md(entry.a)}</div></details>` : '';
  const srcs = m.kind === 'kb' && entry ? `<div class="answer-src"><span>Источник:</span><button class="tag accent" data-act="kb-view" data-id="${esc(entry.id)}">${ic('database')} ${esc(entry.q)}</button>${(entry.src || []).map(srcOf).filter(Boolean).map(srcTag).join('')}</div>` : '';
  const note = m.note ? `<div class="hint" style="margin-top:6px">${esc(m.note)}</div>` : '';
  const acts = m.state === 'done' ? `<div class="answer-actions">${m.kind === 'kb' ? `<button class="btn xs ${m.helpful ? 'is-on' : ''}" data-act="helpful" data-id="${m.id}">${ic('thumb')} ${m.helpful ? 'Спасибо за оценку' : 'Помогло'}</button>` : ''}<button class="btn xs ${m.kind === 'kb' ? 'ghost' : 'primary'}" data-act="escalate" data-q="${esc(m.q)}" data-cat="${esc(m.cat || '')}">${ic('user')} ${m.kind === 'kb' ? 'Не помогло — спросить библиотекаря' : 'Передать вопрос библиотекарю'}</button></div>` : '';
  return `<div class="msg bot">${BOT_AVA}<div class="answer"><div class="answer-head">${head}</div>${body}${orig}${srcs}${note}${acts}</div></div>`;
}
VIEWS.student.assistant = function () {
  const chat = S.me.chat || [];
  const tks = myTickets();
  const now = Date.now();
  const slots = all('slots').filter(s => s.at > now).sort((a, b) => a.at - b.at);
  const res = all('resources').filter(r => r.show !== false);
  const chatPanel = `<section class="panel chat" aria-label="Чат с виртуальным библиотекарем"><div class="panel-head"><div><h2>Чат с виртуальным библиотекарем</h2><div class="sub">Русский · Қазақша · English</div></div><div class="toolbar">${chat.length ? `<button class="btn sm ghost" data-act="chat-clear">${ic('refresh')} Новый диалог</button>` : ''}</div></div>
    <div class="chat-log" id="chat-log" data-keep-scroll="chat" data-stick-bottom="1" aria-live="polite">${welcomeMsg()}${chat.map(renderChatMsg).join('')}</div>
    <div class="suggest" aria-label="Примеры вопросов">${ASSIST_SUGGEST.map(q => `<button class="chip-btn" data-act="ask" data-q="${esc(q)}" ${S.ui.asking ? 'disabled' : ''}>${esc(q)}</button>`).join('')}</div>
    <form class="chat-input" data-form="chat"><label class="sr-only" for="chat-input">Ваш вопрос</label><textarea class="textarea" id="chat-input" data-draft="chat-input" rows="1" placeholder="Например: как экспортировать статьи из Scopus в Zotero?">${esc(dv('chat-input'))}</textarea><button class="btn primary" type="submit" ${S.ui.asking ? 'disabled' : ''} aria-label="Отправить вопрос">${ic('send')}</button></form></section>`;
  const tPanel = panel('Мои обращения', 'Ожидает ответа → В работе → Решено', tks.length ? `<div class="row-list">${tks.map(ticketMini).join('')}</div>` : '<div class="empty">Обращений пока нет</div>', { flush: true, actions: `<button class="btn sm primary" data-act="escalate">${ic('plus')} Новое</button>` });
  const sPanel = panel('Консультации', 'Онлайн-встреча со специалистом библиотеки', slots.length ? `<div class="row-list">${slots.map(s => {
    const mine = s.bookedBy === myId() || s.bookedBy === DEMO_UID, busy = s.bookedBy && !mine;
    return `<div class="slot"><div style="min-width:0"><div class="slot-when">${fmtWD(s.at)}, ${esc(fmtD(s.at))}, ${fmtT(s.at)} · ${s.mins} мин</div><div class="slot-topic">${esc(s.topic)}</div><div class="mini-meta">${esc(s.who)}</div></div>${mine ? `<button class="btn sm is-on" data-act="slot-cancel" data-id="${s.id}" title="Отменить запись">${ic('check')} Вы записаны</button>` : busy ? '<span class="tag">Занято</span>' : `<button class="btn sm" data-act="slot-book" data-id="${s.id}">Записаться</button>`}</div>`;
  }).join('')}</div>` : '<div class="empty">Свободных слотов нет</div>', { flush: true });
  const natl = res.filter(r => r.kind !== 'Открытый доступ'), open = res.filter(r => r.kind === 'Открытый доступ');
  const rr = r => `<a class="ext-row" href="${esc(safeUrl(r.url) || '#')}" target="_blank" rel="noopener"><span style="min-width:0"><b>${esc(r.name)}</b><span class="muted small" style="display:block">${esc(r.kind)} · ${esc(r.note)}</span></span>${ic('ext')}</a>`;
  const rPanel = panel('Доступные ресурсы', 'Перечень ведут сотрудники библиотеки', `<div class="row-list">${natl.map(rr).join('')}</div>${open.length ? `<details class="more"><summary>Ресурсы открытого доступа · ${open.length}</summary><div class="row-list">${open.map(rr).join('')}</div></details>` : ''}`, { flush: true, foot: 'По данным сайта lib.enu.kz: Web of Science, Scopus и Wiley — национальная подписка МНВО РК.' });
  return `<div class="page">${pageHead('AI Library Assistant ENU', 'Виртуальный библиотекарь', 'Отвечает по утверждённой базе знаний научной библиотеки ЕНУ. Если подтверждённого ответа нет, вопрос уходит сотруднику — ответ придёт в историю обращений.', `<button class="btn primary" data-act="escalate">${ic('user')} Задать вопрос библиотекарю</button>`)}
    <div class="split"><div class="col">${chatPanel}</div><div class="col">${tPanel}${sPanel}${rPanel}</div></div></div>`;
};

/* ---------- AI Academic Planner ---------- */
VIEWS.student.planner = function () {
  const p = S.me.passport, pl = S.me.planner, info = programInfo(p), now = Date.now();
  const ms = pl.milestones.slice().sort((a, b) => a.due - b.due);
  const doneN = ms.filter(m => m.done).length, pct = ms.length ? Math.round(doneN / ms.length * 100) : 0;
  const next = ms.find(m => !m.done);
  const soon = ms.filter(m => !m.done && m.due - now < 30 * DAY).length + pl.meetings.filter(m => m.at > now && m.at - now < 30 * DAY).length;
  const curSem = semesterOf(now, info.start);
  const semN = Math.max(semesterOf(info.defense, info.start) + 1, ...ms.map(m => semesterOf(m.due, info.start) + 1));
  const sems = [];
  for (let i = 0; i < semN; i++) {
    const a = new Date(info.start.getFullYear(), info.start.getMonth() + i * 6, 1), b = new Date(info.start.getFullYear(), info.start.getMonth() + i * 6 + 6, 0);
    const items = ms.filter(m => semesterOf(m.due, info.start) === i);
    if (!items.length) continue;
    sems.push(`<div class="sem ${i === curSem ? 'now' : ''}"><div><div class="sem-title">${i + 1} семестр ${i === curSem ? '<span class="tag accent">сейчас</span>' : ''}<span class="sem-count ${items.every(m => m.done) ? 'ok' : 'todo'}" title="Выполнено этапов">${items.filter(m => m.done).length}/${items.length}</span></div><div class="sem-dates">${fmtMonShortY(+a)} – ${fmtMonShortY(+b)} · ${Math.floor(i / 2) + 1} курс</div></div><div>${items.map(m => {
      const over = !m.done && m.due < now, soonC = !m.done && !over && m.due - now < 30 * DAY;
      return `<div class="ms ${m.done ? 'done' : 'todo'} ${over ? 'over' : ''}"><input type="checkbox" id="ms-${m.k}" data-ms="${m.k}" ${m.done ? 'checked' : ''} aria-label="Выполнено: ${esc(m.t)}"><div><label class="ms-title" for="ms-${m.k}">${esc(m.t)}</label><div class="ms-meta"><span class="tag">${esc(TRACKS[m.tr])}</span>${m.done ? `<span class="tag done">${ic('check')} выполнено</span>` : over ? '<span class="tag todo">срок прошёл</span>' : soonC ? '<span class="tag brass">скоро</span>' : ''}</div></div><div class="ms-due ${over ? 'over' : soonC ? 'soon' : ''}">${esc(fmtDS(m.due))} ${new Date(m.due).getFullYear()}</div></div>`;
    }).join('')}</div></div>`);
  }
  const meetings = pl.meetings.slice().sort((a, b) => b.at - a.at);
  const diary = pl.diary.slice().sort((a, b) => b.at - a.at);
  const kp = (l, v, s, extra = '') => `<div class="kpi"><div class="kpi-label">${l}</div><div class="kpi-value">${v}</div>${extra}<div class="kpi-sub">${s}</div></div>`;
  const kpis = `<div class="kpis">${kp('Прогресс по плану', pct + '%', `${doneN} из ${ms.length} этапов`, `<div class="progress-bar" aria-hidden="true"><span style="width:${pct}%"></span></div>`)}${kp('Следующий этап', next ? esc(fmtDS(next.due)) : '—', next ? esc(next.t) : 'план выполнен')}${kp('Напоминания на 30 дней', soon, 'этапы и встречи с руководителем')}${kp('Программа', `${info.start.getFullYear()}–${info.defense.getFullYear()}`, `${p.status === 'Докторант' ? 'PhD, 3 года' : 'магистратура, 2 года'} · защита ${esc(fmtMY(+info.defense))}`)}</div>`;
  const mtPanel = panel('Встречи с научным руководителем', esc(p.sup), `<form class="inline-form" data-form="meeting"><label class="sr-only" for="mt-at">Дата и время</label><input class="input" type="datetime-local" id="mt-at" data-draft="mt-at" value="${esc(dv('mt-at', dtInput(startOfDay(now) + 7 * DAY + 15 * HOUR)))}"><label class="sr-only" for="mt-topic">Тема встречи</label><input class="input" id="mt-topic" data-draft="mt-topic" placeholder="Тема встречи" value="${esc(dv('mt-topic'))}"><button class="btn sm primary" type="submit">${ic('plus')} Добавить</button></form>
    <div class="row-list entries">${meetings.map(m => `<div class="entry"><div class="entry-head"><span>${esc(fmtDT(m.at))}</span>${m.at > now ? '<span class="tag accent">запланирована</span>' : ''}</div><div class="entry-title">${esc(m.topic)}</div>${m.outcome ? `<div class="entry-text">${esc(m.outcome)}</div>` : ''}</div>`).join('')}</div>`, { flush: true });
  const tags = ['Поиск', 'Скрининг', 'Данные', 'Анализ', 'Письмо', 'Идея'];
  const dPanel = panel('Дневник исследователя', 'Короткие записи о ходе работы — попадают в ежемесячный отчёт', `<form class="inline-form col-form" data-form="diary"><div class="toolbar"><label class="sr-only" for="d-tag">Метка</label><select class="select inline sm-select" id="d-tag">${tags.map(t => `<option ${dv('d-tag', 'Идея') === t ? 'selected' : ''}>${t}</option>`).join('')}</select><span class="hint">${esc(fmtD(now))}</span></div><label class="sr-only" for="d-text">Запись</label><textarea class="textarea" id="d-text" data-draft="d-text" rows="2" placeholder="Что сделано, что узнали, что дальше">${esc(dv('d-text'))}</textarea><div><button class="btn sm primary" type="submit">${ic('plus')} Записать</button></div></form>
    <div class="row-list entries">${diary.map(d => `<div class="entry"><div class="entry-head"><span>${esc(fmtDT(d.at))} · ${esc(d.tag)}</span><button class="btn xs ghost" data-act="diary-del" data-id="${d.id}" aria-label="Удалить запись">${ic('trash')}</button></div><div class="entry-text">${esc(d.text)}</div></div>`).join('')}</div>`, { flush: true });
  return `<div class="page">${pageHead('AI Academic Planner', 'Научный планер', `Персональный план на основе научного паспорта: ${esc(p.status.toLowerCase())}, ${p.course} курс, защита — ${esc(fmtMY(+info.defense))}.`, `<button class="btn" data-act="report">${ic('file')} Ежемесячный отчёт</button><button class="btn" data-act="plan-rebuild">${ic('refresh')} Пересобрать по паспорту</button>`)}
    ${kpis}
    ${panel('План научной работы', 'Типовой шаблон по семестрам — сроки уточняются с руководителем и по индивидуальному учебному плану', sems.join(''), { flush: true })}
    <div class="split half">${mtPanel}${dPanel}</div></div>`;
};

/* ---------- AI Prompt Library ---------- */
const PROMPT_CATS = [...new Set(PROMPTS.map(p => p.cat))];
function promptVars(P) { return [...new Set((P.tpl.match(/\{\{([^}]+)\}\}/g) || []).map(x => x.slice(2, -2)))]; }
function promptVal(P, v) {
  const key = `pv-${P.id}-${v}`;
  if (S.ui.drafts[key] !== undefined) return S.ui.drafts[key];
  const def = PROMPT_VARS[v] || {};
  if (def.from) return S.me.passport[def.from] || '';
  if (def.options) return def.options[0];
  return '';
}
function fillPrompt(P) { return P.tpl.replace(/\{\{([^}]+)\}\}/g, (m, v) => { const x = String(promptVal(P, v)).trim(); return x || m; }); }
VIEWS.student.prompts = function () {
  const f = S.ui.prompts, favs = S.me.favPrompts || [];
  const q = (dv('p-q') || '').toLowerCase();
  const list = PROMPTS.filter(p => (f.cat === 'all' || p.cat === f.cat) && (!f.fav || favs.includes(p.id)) && (!q || (p.title + ' ' + p.desc + ' ' + p.cat).toLowerCase().includes(q)));
  const chips = `<div class="chips"><button class="chip-btn" data-act="p-cat" data-v="all" aria-pressed="${f.cat === 'all' && !f.fav}">Все · ${PROMPTS.length}</button><button class="chip-btn" data-act="p-fav" aria-pressed="${f.fav}">${ic('star')} Избранное · ${favs.length}</button>${PROMPT_CATS.map(c => `<button class="chip-btn" data-act="p-cat" data-v="${esc(c)}" aria-pressed="${f.cat === c && !f.fav}">${esc(c)}</button>`).join('')}</div>`;
  const cards = list.map(p => {
    const vars = promptVars(p), defs = vars.map(v => PROMPT_VARS[v] || {});
    const tags = [
      defs.some(d => d.from === 'topic') ? '<span class="tag accent">тема из паспорта</span>' : '',
      defs.some(d => d.req) || vars.includes('текст') ? '<span class="tag">нужен ваш текст</span>' : '',
      p.att ? '<span class="tag">с файлами</span>' : '',
      p.lang === 'kk' ? '<span class="tag brass">қазақша</span>' : p.lang === 'en' ? '<span class="tag">English</span>' : ''
    ].join('');
    return `<button class="prompt-card" data-act="p-open" data-id="${p.id}"><span class="pc-cat"><span>${esc(p.cat)}</span>${favs.includes(p.id) ? `<span title="В избранном" style="color:var(--brass)">★</span>` : ''}</span><span class="pc-title">${esc(p.title)}</span><span class="pc-desc">${esc(p.desc)}</span><span class="pc-foot">${tags}</span></button>`;
  }).join('');
  return `<div class="page">${pageHead('AI Prompt Library', 'Библиотека научных промптов', 'Готовые запросы к ИИ для каждого этапа исследования. Тема и специальность подставляются из научного паспорта; промпт можно скопировать или запустить прямо здесь.')}
    <div class="note brass">${ic('info')}<div>ИИ — инструмент, а не соавтор. Проверяйте факты и ссылки, которые он предлагает, и указывайте использование ИИ по требованиям университета и журнала.</div></div>
    <div class="toolbar">${chips}<div class="grow"></div><label class="sr-only" for="p-q">Поиск промптов</label><input class="input" id="p-q" data-draft="p-q" data-live="1" type="search" placeholder="Поиск промптов" value="${esc(dv('p-q'))}" style="max-width:260px"></div>
    ${list.length ? `<div class="prompt-grid">${cards}</div>` : '<div class="panel"><div class="empty">Промптов по фильтру не найдено</div></div>'}</div>`;
};

/* ---------- Roadmap & beta modules ---------- */
function roadSum() {
  const d = ROADMAP.filter(r => r.beta).length, t = ROADMAP.length - d;
  return `<div class="panel-body road-sum"><div class="road-bar" role="img" aria-label="Реализовано: ${d}, не реализовано: ${t}">${'<i class="d" style="flex:1"></i>'.repeat(d)}${'<i class="t" style="flex:1"></i>'.repeat(t)}</div><div class="road-legend"><span><i style="background:var(--s-done)"></i>Реализовано: ${d}</span><span><i style="background:var(--s-todo)"></i>Не реализовано: ${t}</span></div></div>`;
}
VIEWS.student.roadmap = function () {
  const grid = `<div class="road-grid">${ROADMAP.map(r => `<div class="road ${r.beta ? 'done' : 'todo'}"><div class="road-head"><span class="road-ic">${ic(r.ic)}</span><div><div class="road-title">${esc(r.ru)}</div><div class="road-en">${String(r.n).padStart(2, '0')} · ${esc(r.en)}</div></div></div><p>${esc(r.d)}</p><div class="toolbar" style="margin-top:auto;padding-top:6px">${r.beta ? `<span class="tag done">${ic('check')} Реализовано · бета</span><button class="btn xs" data-act="beta-tab" data-v="${r.id}">Попробовать ${ic('arrow')}</button>` : `<span class="tag todo">${ic('x')} Не реализовано</span>`}${r.prompts ? `<button class="btn xs" data-act="p-goto" data-v="${esc(r.prompts)}">Промпты ${ic('arrow')}</button>` : ''}</div></div>`).join('')}</div>`;
  const tab = S.ui.beta;
  const tabs = [['journal', 'AI Journal Finder'], ['reviewer', 'AI Reviewer Simulator'], ['translator', 'AI Academic Translator']];
  const out = S.ui.betaOut[tab];
  const busy = out && (out.state === 'loading' || out.state === 'streaming');
  const aiOff = AI.state === 'off';
  let tool = '';
  if (tab === 'journal') {
    tool = `<div class="note brass">${ic('info')}<div>Сведения об индексации, квартилях и стоимости публикации необходимо проверять по актуальным официальным источникам. Система не гарантирует принятие статьи.</div></div>
      <div class="field"><label for="bj-text">Аннотация статьи</label><textarea class="textarea" id="bj-text" data-draft="bj-text" rows="6" placeholder="Вставьте аннотацию статьи">${esc(dv('bj-text'))}</textarea></div>
      <div class="toolbar"><label class="check"><input type="checkbox" id="bj-scopus" ${dv('bj-scopus', true) ? 'checked' : ''}> Scopus</label><label class="check"><input type="checkbox" id="bj-wos" ${dv('bj-wos', true) ? 'checked' : ''}> Web of Science</label><label class="check"><input type="checkbox" id="bj-oa" ${dv('bj-oa', false) ? 'checked' : ''}> Только Open Access</label><label class="sr-only" for="bj-lang">Язык публикации</label><select class="select inline sm-select" id="bj-lang">${['английский', 'русский', 'казахский'].map(l => `<option ${dv('bj-lang', 'английский') === l ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
      <div class="toolbar"><button class="btn sm ghost" data-act="beta-sample" data-v="journal">Вставить пример</button><button class="btn primary" data-act="beta-run" ${busy || aiOff ? 'disabled' : ''}>${ic('target')} ${busy ? 'Подбираю…' : 'Подобрать журналы'}</button></div>`;
  } else if (tab === 'reviewer') {
    tool = `<div class="field"><label for="br-text">Текст рукописи или её фрагмент</label><textarea class="textarea" id="br-text" data-draft="br-text" rows="8" placeholder="Вставьте введение, методы, результаты и выводы">${esc(dv('br-text'))}</textarea><div class="hint">В полной версии — загрузка файла Word или PDF.</div></div>
      <div class="toolbar"><button class="btn sm ghost" data-act="beta-sample" data-v="reviewer">Вставить пример</button><button class="btn primary" data-act="beta-run" ${busy || aiOff ? 'disabled' : ''}>${ic('clip')} ${busy ? 'Рецензирую…' : 'Получить предварительную рецензию'}</button></div>`;
  } else {
    const langs = ['русский', 'казахский', 'английский'];
    tool = `<div class="toolbar"><label class="label" for="bt-from">С языка</label><select class="select inline sm-select" id="bt-from">${langs.map(l => `<option ${dv('bt-from', 'русский') === l ? 'selected' : ''}>${l}</option>`).join('')}</select><label class="label" for="bt-to">на</label><select class="select inline sm-select" id="bt-to">${langs.map(l => `<option ${dv('bt-to', 'английский') === l ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
      <div class="field"><label for="bt-text">Текст</label><textarea class="textarea" id="bt-text" data-draft="bt-text" rows="6" placeholder="Вставьте фрагмент научного текста">${esc(dv('bt-text'))}</textarea></div>
      <div class="toolbar"><button class="btn sm ghost" data-act="beta-sample" data-v="translator">Вставить пример</button><button class="btn primary" data-act="beta-run" ${busy || aiOff ? 'disabled' : ''}>${ic('globe')} ${busy ? 'Перевожу…' : 'Перевести'}</button></div>`;
  }
  let result = '';
  if (out) {
    if (out.state === 'loading') result = '<div class="thinking">ИИ работает над ответом…</div>';
    else if (tab === 'reviewer' && out.data) {
      const d = out.data;
      result = `<div class="md"><p><b>Общая оценка.</b> ${esc(d.overall || '')}</p></div>${(d.criteria || []).map(c => { const sc = Math.max(0, Math.min(5, Math.round(+c.score || 0))); return `<div class="score-row"><div><b>${esc(c.name)}</b></div><div><div class="score-dots" aria-label="Оценка ${sc} из 5">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= sc ? 'on' : ''}"></i>`).join('')}</div><div class="hint">${sc} из 5</div></div><div class="small"><div>${esc(c.comment || '')}</div>${c.fix ? `<div class="muted" style="margin-top:4px">Рекомендация: ${esc(c.fix)}</div>` : ''}</div></div>`; }).join('')}<div class="hint">Предварительный аналитический отчёт ИИ не заменяет рецензию журнала.</div>`;
    } else result = `<div class="md ${out.state === 'streaming' ? 'streaming' : ''}" id="beta-out">${md(out.text || '')}</div>${out.text && out.state === 'done' ? `<div class="toolbar"><button class="btn sm" data-act="copy" data-text="${esc(out.text)}">${ic('copy')} Копировать</button></div>` : ''}`;
    if (out.note) result += `<div class="hint">${esc(out.note)}</div>`;
  }
  const betaPanel = panel('Бета-модули', aiOff ? 'Бета-модули работают через ИИ Claude — откройте демоверсию в приложении Claude, чтобы попробовать' : 'Работают через ИИ Claude', `<div class="seg" role="group" aria-label="Модуль">${tabs.map(([k, l]) => `<button data-act="beta-tab" data-v="${k}" aria-pressed="${tab === k}">${l}</button>`).join('')}</div>${tool}${result ? `<div class="divider"></div>${result}` : ''}`, { stack: true, id: 'beta' });
  return `<div class="page">${pageHead('Roadmap', 'Направления развития платформы', 'Модули следующего этапа Smart Research Library. Три из них уже можно попробовать в бета-режиме.')}
    ${panel('Модули следующего этапа', 'Нумерация — по структуре проекта (14 модулей)', roadSum() + grid, { flush: true, cls: 'clip' })}${betaPanel}</div>`;
};

/* ---------- AI Topic Finder ---------- */
const TF_YEARS = [['all', 'Все годы (2019–2025)'], ['2024', '2024–2025'], ['2022', '2022–2023'], ['2021', '2021–2022'], ['2019', '2019–2020']];
const TF_GROUPS = ['будущие педагоги-психологи', 'студенты', 'магистранты', 'учащиеся', 'учителя', 'родители'];
function tfNovelty(t) {
  const n = t.subj, q = `«${n}»`;
  const T = {
    ai: [`Новизна: ${q} рассматривается в контексте ИИ-инструментов в образовании (адаптивные платформы, генеративный ИИ). Исследование выявляет условия доверия к таким инструментам и их этические риски.`, `Жаңалығы: ${q} білім берудегі ЖИ құралдары (бейімделгіш платформалар, генеративті ЖИ) контекстінде қарастырылады. Зерттеу осындай құралдарға деген сенім шарттарын және олардың этикалық тәуекелдерін анықтайды.`, `Novelty: ${q} is examined in the context of AI tools in education (adaptive platforms, generative AI). The study identifies the conditions for trust in such tools and their ethical risks.`],
    digital: [`Новизна: ${q} анализируется в условиях цифровой трансформации вуза и школы: онлайн- и гибридное обучение, цифровая грамотность и информационная безопасность.`, `Жаңалығы: ${q} ЖОО мен мектептің цифрлық трансформациясы жағдайында талданады: онлайн және гибридті оқыту, цифрлық сауаттылық және ақпараттық қауіпсіздік.`, `Novelty: ${q} is analysed in the context of the digital transformation of universities and schools: online and hybrid learning, digital literacy and information security.`],
    inclusive: [`Новизна: ${q} рассматривается в инклюзивной образовательной среде с учётом разнообразия потребностей обучающихся и доступности цифровых ресурсов.`, `Жаңалығы: ${q} білім алушылар қажеттіліктерінің әртүрлілігі мен цифрлық ресурстардың қолжетімділігін ескере отырып, инклюзивті білім беру ортасында қарастырылады.`, `Novelty: ${q} is examined in an inclusive learning environment, taking into account the diversity of learners’ needs and the accessibility of digital resources.`],
    psychology: [`Новизна: уточняются структура и условия развития направления ${q} с учётом вызовов цифровой среды (социальные сети, дистанционное обучение) и инклюзивного подхода.`, `Жаңалығы: цифрлық орта сын-қатерлерін (әлеуметтік желілер, қашықтан оқыту) және инклюзивті тәсілді ескере отырып, ${q} бағытының құрылымы мен даму шарттары нақтыланады.`, `Novelty: the structure and conditions for developing ${q} are refined, taking into account the challenges of the digital environment (social media, distance learning) and an inclusive approach.`],
    thinking: [`Новизна: ${q} исследуется через цифровые и диалоговые практики (коучинг, рефлексия в онлайн-среде), что отличает подход от традиционных методик.`, `Жаңалығы: ${q} цифрлық және диалогтық тәжірибелер (коучинг, онлайн ортадағы рефлексия) арқылы зерттеледі, бұл тәсілді дәстүрлі әдістемелерден ерекшелейді.`, `Novelty: ${q} is studied through digital and dialogic practices (coaching, reflection in an online environment), which sets the approach apart from traditional methods.`],
    management: [`Новизна: ${q} рассматривается с учётом цифровой трансформации образования и требований к компетенциям, связанным с ИИ и инклюзивностью.`, `Жаңалығы: ${q} білім берудің цифрлық трансформациясы мен ЖИ және инклюзивтілікке байланысты құзыреттерге қойылатын талаптарды ескере отырып қарастырылады.`, `Novelty: ${q} is examined in light of the digital transformation of education and the requirements for competencies related to AI and inclusion.`],
    language: [`Новизна: ${q} связывается с цифровыми средами и ИИ-поддержкой (автоматическая обратная связь, мультимедийные материалы).`, `Жаңалығы: ${q} цифрлық ортамен және ЖИ қолдауымен (автоматты кері байланыс, мультимедиялық материалдар) байланыстырылады.`, `Novelty: ${q} is linked to digital environments and AI support (automated feedback, multimedia materials).`],
    career: [`Новизна: ${q} рассматривается в условиях цифровых сервисов профориентации и ИИ-рекомендаций с учётом требований рынка труда.`, `Жаңалығы: ${q} еңбек нарығының талаптарын ескере отырып, кәсіби бағдар берудің цифрлық сервистері мен ЖИ ұсынымдары жағдайында қарастырылады.`, `Novelty: ${q} is examined in the context of digital career-guidance services and AI recommendations, taking labour-market requirements into account.`],
    ecology: [`Новизна: ${q} рассматривается с учётом цифровых форматов обучения и целей устойчивого развития, включая ИИ-поддержку образовательных программ.`, `Жаңалығы: ${q} оқытудың цифрлық форматтары мен тұрақты даму мақсаттарын, соның ішінде білім беру бағдарламаларын ЖИ арқылы қолдауды ескере отырып қарастырылады.`, `Novelty: ${q} is examined in light of digital learning formats and the Sustainable Development Goals, including AI support for educational programmes.`],
    ethics: [`Новизна: ${q} исследуется в контексте этики использования ИИ и цифровых сред, влияющих на нравственное воспитание обучающихся.`, `Жаңалығы: ${q} білім алушылардың адамгершілік тәрбиесіне әсер ететін ЖИ мен цифрлық ортаны пайдалану этикасы контекстінде зерттеледі.`, `Novelty: ${q} is studied in the context of the ethics of using AI and digital environments that affect learners’ moral education.`],
    professional: [`Новизна: ${q} рассматривается с учётом цифровой трансформации образования и новых требований к компетенциям педагога, включая ИИ и инклюзивность.`, `Жаңалығы: ${q} білім берудің цифрлық трансформациясы мен педагог құзыреттеріне қойылатын жаңа талаптарды, соның ішінде ЖИ мен инклюзивтілікті ескере отырып қарастырылады.`, `Novelty: ${q} is examined in light of the digital transformation of education and new requirements for teacher competencies, including AI and inclusion.`]
  };
  return L3(...T[t.domain]);
}
function tfStats(t) {
  const base = L3('Описательная статистика, проверка нормальности распределения (Шапиро–Уилка), альфа Кронбаха для шкал.', 'Сипаттамалық статистика, үлестірімнің қалыптылығын тексеру (Шапиро–Уилк), шкалалар үшін Кронбах альфасы.', 'Descriptive statistics, normality testing (Shapiro–Wilk), Cronbach’s alpha for scales.');
  const cmp = L3('t-критерий или U Манна–Уитни; ANOVA для трёх и более групп; корреляция Пирсона; при большой выборке структурное моделирование (SEM).', 't-критерий немесе Манн–Уитни U; үш және одан көп топ үшін ANOVA; Пирсон корреляциясы; іріктеме үлкен болса құрылымдық модельдеу (SEM).', 't-test or Mann–Whitney U; ANOVA for three or more groups; Pearson correlation; structural equation modelling (SEM) for large samples.');
  const D = {
    ai: L3('Корреляция Пирсона или Спирмена; регрессия (влияние частоты использования ИИ-инструментов на компетентность); при формирующем эксперименте ANOVA с повторными измерениями.', 'Пирсон немесе Спирмен корреляциясы; регрессия (ЖИ құралдарын пайдалану жиілігінің құзыреттілікке әсері); қалыптастырушы экспериментте қайталама өлшемді ANOVA.', 'Pearson or Spearman correlation; regression (effect of AI-tool use frequency on competence); repeated-measures ANOVA for a formative experiment.'),
    digital: L3('Корреляция Пирсона или Спирмена; регрессия (влияние цифровой среды на результат); при формирующем эксперименте ANOVA с повторными измерениями.', 'Пирсон немесе Спирмен корреляциясы; регрессия (цифрлық ортаның нәтижеге әсері); қалыптастырушы экспериментте қайталама өлшемді ANOVA.', 'Pearson or Spearman correlation; regression (effect of the digital environment on outcomes); repeated-measures ANOVA for a formative experiment.'),
    inclusive: L3('U Манна–Уитни или t-критерий для сравнения групп; хи-квадрат для категориальных ответов; ANOVA при трёх и более группах.', 'Топтарды салыстыру үшін Манн–Уитни U немесе t-критерий; категориялық жауаптар үшін хи-квадрат; үш және одан көп топ болса ANOVA.', 'Mann–Whitney U or t-test to compare groups; chi-square for categorical responses; ANOVA for three or more groups.'),
    psychology: L3('Факторный анализ (EFA/CFA) для проверки структуры шкалы; корреляция Спирмена; t-критерий или U Манна–Уитни для сравнения групп.', 'Шкала құрылымын тексеру үшін факторлық талдау (EFA/CFA); Спирмен корреляциясы; топтарды салыстыру үшін t-критерий немесе Манн–Уитни U.', 'Factor analysis (EFA/CFA) to test scale structure; Spearman correlation; t-test or Mann–Whitney U to compare groups.'),
    thinking: L3('Парный t-критерий или критерий Уилкоксона (до/после); ANOVA с повторными измерениями; размер эффекта d Коэна.', 'Жұптық t-критерий немесе Уилкоксон критерийі (дейін/кейін); қайталама өлшемді ANOVA; Коэн d әсер мөлшері.', 'Paired t-test or Wilcoxon test (before/after); repeated-measures ANOVA; Cohen’s d effect size.'),
    management: cmp, professional: cmp,
    language: L3('Хи-квадрат для категориальных данных; парный t-критерий (до/после); корреляция Спирмена.', 'Категориялық деректер үшін хи-квадрат; жұптық t-критерий (дейін/кейін); Спирмен корреляциясы.', 'Chi-square for categorical data; paired t-test (before/after); Spearman correlation.'),
    career: L3('Регрессия; ANOVA для сравнения групп; корреляция Пирсона.', 'Регрессия; топтарды салыстыру үшін ANOVA; Пирсон корреляциясы.', 'Regression; ANOVA to compare groups; Pearson correlation.'),
    ecology: L3('t-критерий или U Манна–Уитни; ANOVA для трёх и более групп; корреляция Пирсона или Спирмена.', 't-критерий немесе Манн–Уитни U; үш және одан көп топ үшін ANOVA; Пирсон немесе Спирмен корреляциясы.', 't-test or Mann–Whitney U; ANOVA for three or more groups; Pearson or Spearman correlation.'),
    ethics: L3('t-критерий или U Манна–Уитни; корреляция Спирмена; регрессия для предикторов нравственной позиции.', 't-критерий немесе Манн–Уитни U; Спирмен корреляциясы; адамгершілік ұстанымның предикторлары үшін регрессия.', 't-test or Mann–Whitney U; Spearman correlation; regression for predictors of moral stance.')
  };
  return [base, D[t.domain]];
}
/* Подбор: та же логика, что в PhD AI Navigator — слова запроса сверяются с ключами направления и с началом слов темы */
function tfMatch(text, limit = 4) {
  const words = [...new Set(String(text || '').toLowerCase().match(/[\p{L}\p{N}-]+/gu) || [])];
  if (!words.length) return [];
  const hit = (w, k) => w === k || (k.length >= 5 && w.startsWith(k));
  return TF_TOPICS.map(t => {
    const ru = t.ru.toLowerCase(), kk = t.kk.toLowerCase(), keys = TF_DOMAINS[t.domain].keys;
    const terms = words.filter(w => keys.some(k => hit(w, k)) || (w.length >= 5 && (ru.includes(w.slice(0, 5)) || kk.includes(w.slice(0, 5)))));
    return { t, terms };
  }).filter(r => r.terms.length).sort((a, b) => b.terms.length - a.terms.length || b.t.y - a.t.y || a.t.no - b.t.no).slice(0, limit);
}
function tfCopyText(t) {
  return [`Тема: ${t.ru}`, `Тема (каз.): ${t.kk}`, `Год: ${t.ay}`, `Объект исследования: ${t.obj}`, `Предмет исследования: ${t.subj}`, tfNovelty(t), 'Статистический аппарат:', ...tfStats(t)].join('\n');
}
const tfDomTag = d => `<span class="tf-dom" style="--dc:${TF_DOMAINS[d].c}"><i></i>${esc(TF_DOMAINS[d].ru)}</span>`;
function tfCard(t, terms, o = {}) {
  const [main, second] = LANG === 'kk' ? [t.kk, t.ru] : [t.ru, t.kk];
  const blocks = [
    ['tf-obj', 'users', 'Объект исследования', `<p>${esc(t.obj)}</p>`],
    ['tf-subj', 'target', 'Предмет исследования', `<p>${esc(t.subj)}</p>`],
    ['tf-nov', 'sparkle', 'Научная новизна', `<p class="no-i18n">${esc(tfNovelty(t))}</p>`],
    ['tf-stat', 'pie', 'Статистический аппарат', `<ul class="no-i18n">${tfStats(t).map(s => `<li>${esc(s)}</li>`).join('')}</ul>`]
  ];
  return `<article class="tf-card${o.sel ? ' is-sel' : ''}" style="--dc:${TF_DOMAINS[t.domain].c}">
    <div class="tf-card-top"><span class="tf-official yr-${t.y}">${ic('check')} Официальная тема ${esc(t.ay)}</span>${tfDomTag(t.domain)}<span class="tf-acts"><button class="btn xs" data-act="tf-copy" data-no="${t.no}">${ic('copy')} Копировать</button><button class="btn xs" data-act="tf-lit" data-no="${t.no}">${ic('search')} Литература</button></span></div>
    <h3 class="tf-title no-i18n" lang="${LANG === 'kk' ? 'kk' : 'ru'}">${esc(main)}</h3><p class="tf-second no-i18n">${esc(second)}</p>
    <div class="tf-blocks">${blocks.map(([c, i, h, b]) => `<div class="tf-block ${c}"><div class="tf-bh">${ic(i)}<span>${h}</span></div>${b}</div>`).join('')}</div>
    ${terms && terms.length ? `<div class="tf-terms"><span>Совпадение с вашими интересами:</span>${terms.map(w => `<span class="tf-term no-i18n">${esc(w)}</span>`).join('')}</div>` : ''}
  </article>`;
}
function tfAiCard(v, i) {
  return `<article class="tf-card tf-ai" style="--dc:var(--accent)">
    <div class="tf-card-top"><span class="tf-official ai">${ic('sparkle')} Вариант ИИ ${i + 1}</span><span class="tag">черновик — обсудите с руководителем</span><span class="tf-acts"><button class="btn xs" data-act="tf-ai-copy" data-i="${i}">${ic('copy')} Копировать</button></span></div>
    <h3 class="tf-title no-i18n">${esc(v.title || '')}</h3>${v.title_kk ? `<p class="tf-second no-i18n">${esc(v.title_kk)}</p>` : ''}
    <div class="tf-blocks no-i18n">${[['tf-obj', 'users', L3('Объект исследования', 'Зерттеу объектісі', 'Object of study'), v.object], ['tf-subj', 'target', L3('Предмет исследования', 'Зерттеу пәні', 'Subject of study'), v.subject], ['tf-nov', 'sparkle', L3('Научная новизна', 'Ғылыми жаңалығы', 'Scientific novelty'), v.novelty], ['tf-hyp', 'bulb', L3('Гипотеза', 'Болжам', 'Hypothesis'), v.hypothesis], ['tf-stat', 'pie', L3('Методы и статистика', 'Әдістер және статистика', 'Methods and statistics'), v.methods]].filter(x => x[3]).map(([c, i, h, b]) => `<div class="tf-block ${c}"><div class="tf-bh">${ic(i)}<span>${esc(h)}</span></div><p>${esc(b)}</p></div>`).join('')}</div>
  </article>`;
}
VIEWS.student.topics = function () {
  const st = S.ui.tf, q = dv('tf-q', ''), year = dv('tf-year', 'all'), find = (dv('tf-find', '') || '').trim().toLowerCase();
  const res = st.res ? st.res.map(r => ({ t: TF_TOPICS.find(x => x.no === r.no), terms: r.terms })).filter(r => r.t) : null;
  const sel = st.sel ? TF_TOPICS.find(x => x.no === st.sel) : null;
  const base = TF_TOPICS.filter(t => (year === 'all' || String(t.y) === year) && (!find || t.ru.toLowerCase().includes(find) || t.kk.toLowerCase().includes(find)));
  const doms = Object.keys(TF_DOMAINS).map(d => [d, TF_TOPICS.filter(t => t.domain === d).length]).sort((a, b) => b[1] - a[1]);
  const maxD = doms[0][1];
  const years = [...new Set(TF_TOPICS.map(t => t.ay))];
  const interests = (S.me.passport.interests || []).join(', ');
  const aiOut = st.ai;
  const kpis = `<div class="kpis tf-kpis">${kpi('Утверждённых тем', TF_TOPICS.length, 'специальность 8D01103', 'file')}${kpi('Учебных лет', years.length, '2019–2025', 'calendar')}${kpi('Направлений', Object.keys(TF_DOMAINS).length, 'по ключевым понятиям', 'layers')}${kpi('Подобрано для вас', res ? res.length : '—', res ? 'из базы ЕНУ' : 'опишите интересы', 'target')}</div>`;
  const step = panel('1. Ваши интересы', 'Опишите понятия и группы участников. Подбор идёт по базе ЕНУ 2019–2025 (8D01103 «Педагогика и психология»).', `
    <label class="field"><span class="field-label">Интересующие понятия</span><textarea class="textarea" id="tf-q" data-draft="tf-q" rows="3" placeholder="цифровая грамотность, студенты педагогических вузов, мотивация">${esc(q)}</textarea><span class="field-hint">Перечислите через запятую или пробел.</span></label>
    <div class="tf-chips"><span class="tf-chips-label">Направления</span>${Object.keys(TF_DOMAINS).map(d => `<button class="tf-chip" style="--dc:${TF_DOMAINS[d].c}" data-act="tf-add" data-v="${esc(TF_DOMAINS[d].ru)}">${esc(TF_DOMAINS[d].ru)}</button>`).join('')}</div>
    <div class="tf-chips"><span class="tf-chips-label">Участники</span>${TF_GROUPS.map(g => `<button class="tf-chip plain" data-act="tf-add" data-v="${esc(g)}">${esc(g)}</button>`).join('')}</div>
    <div class="toolbar"><button class="btn primary" data-act="tf-run">${ic('search')} Подобрать темы из базы</button><button class="btn ai" data-act="tf-ai" ${aiOut && aiOut.state === 'loading' ? 'disabled' : ''}>${ic('sparkle')} ${aiOut && aiOut.state === 'loading' ? 'ИИ пишет…' : 'Сформулировать свои темы с ИИ'}</button>${interests ? `<button class="btn ghost" data-act="tf-passport">${ic('idcard')} Взять из паспорта</button>` : ''}${q ? `<button class="btn ghost" data-act="tf-clear">${ic('x')} Очистить</button>` : ''}</div>`, { cls: 'tf-step', stack: true });
  const results = res === null
    ? `<div class="tf-empty">${ic('bulb')}<p>Здесь появятся до четырёх тем из базы с объектом, предметом, новизной и статистическим аппаратом.</p></div>`
    : res.length ? res.map(r => tfCard(r.t, r.terms)).join('') : `<div class="tf-empty">${ic('search')}<p>Совпадений не найдено. Добавьте синонимы или выберите направление.</p></div>`;
  const aiBlock = !aiOut ? '' : aiOut.state === 'loading' ? `<div class="tf-empty">${ic('sparkle')}<p>ИИ формулирует варианты тем…</p></div>`
    : aiOut.items && aiOut.items.length ? `<div class="tf-sec-title">${ic('sparkle')} Варианты ИИ на основе ваших интересов</div>${aiOut.items.map(tfAiCard).join('')}` : aiOut.note ? `<div class="note">${ic('info')}<div>${esc(aiOut.note)}</div></div>` : '';
  const selBlock = sel && !(res || []).some(r => r.t.no === sel.no) ? `<div class="tf-sec-title">${ic('bookmark')} Тема из базы</div>${tfCard(sel, null, { sel: true })}` : '';
  const list = base.length ? `<ul class="tf-list" data-keep-scroll="tf-list">${base.map(t => `<li><button class="tf-row${st.sel === t.no ? ' is-sel' : ''}" data-act="tf-pick" data-no="${t.no}" style="--dc:${TF_DOMAINS[t.domain].c}"><span class="tf-row-top"><span class="tf-yr yr-${t.y}">${esc(t.ay)}</span><span class="tf-row-dom"><i></i>${esc(TF_DOMAINS[t.domain].ru)}</span></span><span class="tf-row-ru no-i18n">${esc(LANG === 'kk' ? t.kk : t.ru)}</span><span class="tf-row-kk no-i18n">${esc(LANG === 'kk' ? t.ru : t.kk)}</span></button></li>`).join('')}</ul>` : '<div class="empty">По этим условиям тем не найдено.</div>';
  const basePanel = panel('База утверждённых тем ЕНУ', 'Официальные темы диссертаций по специальности 8D01103 «Педагогика и психология», 2019–2025.', `
    <div class="tf-filters"><label class="field"><span class="field-label">Учебный год</span><select class="select" id="tf-year">${TF_YEARS.map(([v, l]) => `<option value="${v}" ${v === year ? 'selected' : ''}>${l}</option>`).join('')}</select></label><label class="field"><span class="field-label">Поиск по названию</span><input class="input" id="tf-find" data-draft="tf-find" data-live="1" type="search" value="${esc(dv('tf-find', ''))}" placeholder="Например: цифровой"></label></div>
    <div class="muted small">Найдено тем: ${base.length}</div>${list}`, { stack: true });
  const domPanel = panel('Направления в базе', 'Сколько утверждённых тем по каждому направлению', `<div class="tf-doms">${doms.map(([d, n]) => `<button class="tf-dom-row" data-act="tf-add" data-v="${esc(TF_DOMAINS[d].ru)}" style="--dc:${TF_DOMAINS[d].c}"><span class="tf-dom-name">${esc(TF_DOMAINS[d].ru)}</span><span class="tf-dom-bar"><i style="width:${Math.round(n / maxD * 100)}%"></i></span><b>${n}</b></button>`).join('')}</div>`);
  return `<div class="page">${pageHead('AI Topic Finder', 'Подбор темы диссертации', 'Уточните интересы — модуль подберёт 3–4 утверждённые темы ЕНУ с объектом, предметом, новизной и статистическим аппаратом. ИИ поможет сформулировать собственные варианты.')}
    ${kpis}
    <div class="split tf-split"><div class="col">${step}<div class="tf-results" id="tf-results">${selBlock}${res && res.length ? `<div class="tf-sec-title">${ic('target')} Подходящие темы из базы · ${res.length}</div>` : ''}${results}${aiBlock}</div></div><div class="col">${basePanel}${domPanel}</div></div></div>`;
};
