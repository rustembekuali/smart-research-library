/* =====================================================================
   12. Actions
   ===================================================================== */
function toast(msg) {
  const box = document.getElementById('toasts');
  if (!box || !msg) return;
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  box.appendChild(t);
  setTimeout(() => t.remove(), 3400);
}
async function copyText(text, opening) {
  const done = () => toast(opening ? 'Запрос скопирован — вставьте его в поле расширенного поиска' : 'Скопировано в буфер обмена');
  try { await navigator.clipboard.writeText(text); done(); return; } catch (e) { }
  try {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    const ok = document.execCommand('copy'); ta.remove();
    if (ok) { done(); return; }
  } catch (e) { }
  toast('Не удалось скопировать автоматически — выделите текст вручную');
}
function clearDrafts(prefix) { Object.keys(S.ui.drafts).forEach(k => { if (k.startsWith(prefix)) delete S.ui.drafts[k]; }); }
const splitList = (s, sep) => String(s || '').split(sep).map(x => x.trim()).filter(Boolean);
function hashFor(role, view) { return role === 'staff' ? 'staff-' + view : view; }
function parseHash() {
  const h = (location.hash || '').slice(1);
  if (!h) return null;
  if (h.startsWith('staff-')) { const v = h.slice(6); return VIEWS.staff[v] ? ['staff', v] : null; }
  return VIEWS.student[h] ? ['student', h] : null;
}
function go(role, view) {
  S.role = role; S.view[role] = view; S.ui.bell = false; S.ui.mobileDetail = false;
  persist();
  const h = hashFor(role, view);
  try { if (location.hash !== '#' + h) location.hash = h; } catch (e) { }
  render();
  try { window.scrollTo(0, 0); } catch (e) { }
}
function pushChat(m) { S.me.chat = (S.me.chat || []).concat([m]).slice(-40); }
function updateMsgDom(m) {
  const el = document.getElementById('mb-' + m.id);
  const log = document.getElementById('chat-log');
  const atBottom = log && log.scrollHeight - log.scrollTop - log.clientHeight < 60;
  if (el) el.innerHTML = md(m.text);
  if (log && atBottom) log.scrollTop = log.scrollHeight;
}

/* ---------- Assistant ---------- */
function groundedPrompt(q, entries) {
  return `Ты — «AI Library Assistant ENU», виртуальный библиотекарь Научной библиотеки Евразийского национального университета имени Л. Н. Гумилёва (Астана). Ответь пользователю, опираясь ТОЛЬКО на утверждённые записи базы знаний ниже.
Правила:
- Язык ответа: ${LANG_NAME[detectLang(q)]}.
- Не добавляй сведений, которых нет в записях: никаких адресов, часов работы, ссылок, названий подписок или сроков от себя.
- Если записи отвечают только на часть вопроса, ответь на эту часть и прямо скажи, что остальное лучше уточнить у библиотекаря через кнопку «Задать вопрос библиотекарю».
- Кратко: до 120 слов, шаги — нумерованным списком, без вступлений и без заголовков.

Утверждённые записи базы знаний:
${entries.map(e => `[${e.id}] Вопрос: ${e.q}\nОтвет: ${e.a}`).join('\n\n')}

Вопрос пользователя: ${q}`;
}
function generalPrompt(q) {
  return `Ты — виртуальный библиотекарь Научной библиотеки ЕНУ имени Л. Н. Гумилёва и помогаешь магистрантам и докторантам с научно-информационными вопросами. В утверждённой базе знаний библиотеки ответа на этот вопрос нет, поэтому дай краткий предварительный ответ.
Правила:
- Язык ответа: ${LANG_NAME[detectLang(q)]}.
- До 90 слов. Только общие сведения, верные для любого университета.
- Не придумывай правила, адреса, часы работы, подписки, контакты и сроки ЕНУ.
- Если вопрос не связан с наукой, литературой или библиотекой, вежливо скажи, что помогаешь только с научно-библиотечными вопросами.
- Последней строкой предложи передать вопрос библиотекарю для точного ответа.

Вопрос: ${q}`;
}
async function sendAssistant(text) {
  const q = String(text || '').trim();
  if (!q || S.ui.asking) return;
  S.ui.drafts['chat-input'] = '';
  pushChat({ id: uid('m'), role: 'user', text: q, at: Date.now() });
  const res = kbSearch(q), best = res[0];
  const confirmed = !!best && best.score >= 0.5;
  const ctx = confirmed ? [best.e].concat(res.slice(1).filter(r => r.score >= 0.45).slice(0, 1).map(r => r.e)) : [];
  const msg = { id: uid('m'), role: 'bot', at: Date.now(), q, kind: confirmed ? 'kb' : 'none', orig: confirmed ? best.e.id : null, text: '', state: 'pending', cat: guessCategory(q, best) };
  pushChat(msg);
  const st = S.local.stats; st.bot.asked++; if (confirmed) { st.bot.kb++; st.views[best.e.id] = (st.views[best.e.id] || 0) + 1; }
  S.ui.asking = true; persist(); renderMain();
  const ok = await aiReady();
  const msgRef = () => (S.me.chat || []).find(x => x.id === msg.id) || msg;
  try {
    if (confirmed && ok) {
      const m = msgRef(); m.state = 'streaming'; m.ai = true; renderMain();
      const r = await aiText(groundedPrompt(q, ctx), { tier: 'quick', cache: false, onText: ({ text }) => { const mm = msgRef(); mm.text = text; updateMsgDom(mm); } });
      msgRef().text = r.text;
    } else if (confirmed) {
      msgRef().text = best.e.a;
    } else if (ok) {
      const m = msgRef(); m.kind = 'ai'; m.state = 'streaming'; renderMain();
      const r = await aiText(generalPrompt(q), { tier: 'default', cache: false, onText: ({ text }) => { const mm = msgRef(); mm.text = text; updateMsgDom(mm); } });
      msgRef().text = r.text;
    } else {
      msgRef().text = 'В утверждённой базе знаний пока нет ответа на этот вопрос. Передайте его библиотекарю — ответ придёт в историю обращений, а типовой ответ после проверки попадёт в базу знаний.';
    }
  } catch (e) {
    const m = msgRef();
    if (confirmed) { m.text = best.e.a; m.ai = false; }
    else { m.kind = 'none'; m.text = 'В утверждённой базе знаний пока нет ответа на этот вопрос. Передайте его библиотекарю — ответ придёт в историю обращений.'; }
    m.note = aiErrorText(e);
  }
  msgRef().state = 'done';
  S.ui.asking = false; persist(); renderMain();
}
function openEscalate(q, cat) {
  clearDrafts('esc-');
  S.ui.drafts['esc-q'] = q || '';
  S.ui.drafts['esc-cat'] = cat && CATEGORIES.includes(cat) ? cat : guessCategory(q || '', q ? kbSearch(q)[0] : null);
  S.ui.drafts['esc-attach'] = true;
  openModal('escalate');
}
async function createTicket({ cat, q, attach }) {
  const p = S.me.passport, now = Date.now();
  const num = Math.max(1043, ...all('tickets').map(t => +t.num || 0)) + 1;
  const t = { id: uid('t'), num, cat, q, status: 'waiting', createdAt: now, updatedAt: now, authorId: myId(), author: attach ? { name: p.name, status: p.status, course: p.course, spec: p.spec, topic: p.topic } : { name: p.name, status: p.status } };
  closeModal();
  await put('tickets', t);
  await put('messages', { id: uid('msg'), ticketId: t.id, from: 'student', name: p.name, text: q, at: now });
  S.me.seen[t.id] = now;
  pushChat({ id: uid('m'), role: 'bot', kind: 'ticket', ticketId: t.id, at: now, state: 'done' });
  clearDrafts('esc-'); persist();
  toast(`Обращение №${num} отправлено библиотекарю`);
  if (!(S.role === 'student' && curView() === 'assistant')) go('student', 'assistant'); else render();
}
function openTicket(id) { S.me.seen[id] = Date.now(); persist(); openModal('ticket', { id }); render(); }

/* ---------- Staff ticket workflow ---------- */
async function takeTicket(id) {
  const now = Date.now();
  await patch('tickets', id, { status: 'progress', updatedAt: now, lastEventAt: now, lastEvent: 'taken', takenAt: now });
  await put('messages', { id: uid('msg'), ticketId: id, from: 'system', text: 'Обращение взято в работу', at: now });
  toast('Обращение взято в работу — пользователь видит новый статус');
}
async function resolveTicket(id) {
  const now = Date.now();
  await patch('tickets', id, { status: 'resolved', updatedAt: now, resolvedAt: now, lastEventAt: now, lastEvent: 'resolved' });
  await put('messages', { id: uid('msg'), ticketId: id, from: 'system', text: 'Обращение отмечено как решённое', at: now });
  toast('Обращение отмечено как решённое');
}
async function staffReply(id, close) {
  const key = 'reply-' + id, text = (dv(key) || '').trim();
  if (!text) { toast('Напишите текст ответа'); const ta = document.getElementById(key); if (ta) ta.focus(); return; }
  const t = byId('tickets', id), now = Date.now();
  S.ui.drafts[key] = '';
  await put('messages', { id: uid('msg'), ticketId: id, from: 'staff', name: 'Библиотекарь-консультант', text, at: now });
  const ch = { status: close ? 'resolved' : 'progress', updatedAt: now, lastEventAt: now, lastEvent: 'reply' };
  if (!t.firstReplyAt) ch.firstReplyAt = now;
  if (close) ch.resolvedAt = now;
  await patch('tickets', id, ch);
  toast(close ? `Ответ отправлен, обращение №${t.num} решено` : `Ответ по обращению №${t.num} отправлен`);
}
async function ticketAIDraft(id) {
  if (!(await aiReady())) { toast('ИИ недоступен в этом просмотре'); return; }
  const t = byId('tickets', id);
  const hits = kbSearch(t.q).filter(r => r.score >= 0.3).slice(0, 3).map(r => r.e);
  const thread = threadOf(id);
  const prompt = `Ты помогаешь сотруднику Научной библиотеки ЕНУ имени Л. Н. Гумилёва ответить на обращение ${t.author && t.author.status === 'Магистрант' ? 'магистранта' : 'докторанта'}.
Составь черновик ответа от имени библиотекаря: вежливо и по делу, 60–140 слов, на языке обращения.
Опирайся на записи базы знаний, если они подходят. Сведения, которые должен уточнить сотрудник (сроки, наличие подписки, контакты), оставь в квадратных скобках как заготовки, например [уточнить срок]. Не выдумывай факты. Верни только текст ответа.

Категория: ${t.cat}
Переписка:
${thread.map(m => `${m.from === 'staff' ? 'Библиотекарь' : m.from === 'system' ? 'Система' : 'Пользователь'}: ${m.text}`).join('\n')}

Записи базы знаний:
${hits.length ? hits.map(e => `[${e.id}] ${e.q}\n${e.a}`).join('\n\n') : '(подходящих записей нет)'}`;
  const key = 'reply-' + id;
  S.ui.tkAiBusy = true; renderMain();
  try {
    const r = await aiText(prompt, { tier: 'quick', cache: false, onText: ({ text }) => { S.ui.drafts[key] = text; const ta = document.getElementById(key); if (ta) ta.value = text; } });
    S.ui.drafts[key] = r.text;
    toast('Черновик готов — проверьте его перед отправкой');
  } catch (e) { const m = aiErrorText(e); if (m) toast(m); }
  S.ui.tkAiBusy = false; renderMain();
}
async function kbGeneralizeAI() {
  const m = S.ui.modal;
  if (!m || !m.fromTicket) return;
  if (!(await aiReady())) { toast('ИИ недоступен в этом просмотре'); return; }
  const t = byId('tickets', m.fromTicket);
  const staff = threadOf(t.id).filter(x => x.from === 'staff').map(x => x.text).join('\n\n');
  S.ui.kbAiBusy = true; renderModal();
  try {
    const r = await aiJson(`Преобразуй вопрос пользователя и ответ библиотекаря в типовую запись базы знаний научной библиотеки.
- Вопрос обобщи и убери личные детали.
- Ответ сделай инструкцией из 2–5 шагов («1. …»), сохрани только факты из ответа библиотекаря, ничего не добавляй.
- Ключевые слова: 8–14 слов в разных формах через пробел (русский, названия сервисов латиницей).
Ответь только JSON: {"q":"...","keys":"...","a":"..."}

Вопрос пользователя: ${t.q}
Ответ библиотекаря: ${staff}`, { tier: 'quick', cache: false });
    if (r && r.q && r.a) { S.ui.drafts['ke-q'] = String(r.q); S.ui.drafts['ke-a'] = String(r.a); if (r.keys) S.ui.drafts['ke-keys'] = String(r.keys); toast('ИИ обобщил запись — проверьте её перед сохранением'); }
    else throw { code: 'invalid_json' };
  } catch (e) { const x = aiErrorText(e); if (x) toast(x); }
  S.ui.kbAiBusy = false; renderModal();
}

/* ---------- Other AI features ---------- */
async function builderAI() {
  if (!(await aiReady())) { toast('ИИ недоступен в этом просмотре — добавьте термины вручную'); return; }
  const topic = (dv('s-q') || S.ui.search.q || '').trim() || S.me.passport.topic;
  S.ui.bBusy = true; renderMain();
  try {
    const r = await aiJson(`Ты — библиотекарь-эксперт по систематическому поиску литературы. Тема исследования: «${topic}».
Разбей тему на 2–4 ключевых концепта (схема PICO или PEO). Для каждого дай 3–6 англоязычных поисковых терминов: синонимы, варианты написания, усечение * там, где оно уместно. Не используй AND/OR внутри терминов.
Ответь только JSON: {"concepts":[{"label":"краткое название концепта по-русски","terms":["term one","term two"]}]}`, { tier: 'quick', cache: false });
    const cs = (r && Array.isArray(r.concepts) ? r.concepts : []).slice(0, 4).map(c => ({ label: String(c.label || '').slice(0, 40), terms: (Array.isArray(c.terms) ? c.terms : []).map(x => String(x).trim()).filter(Boolean).slice(0, 8) })).filter(c => c.terms.length);
    if (!cs.length) throw { code: 'invalid_json' };
    S.me.builder.concepts = cs; persist();
    toast('Термины предложены ИИ — проверьте и отредактируйте их');
  } catch (e) { const t = aiErrorText(e); if (t) toast(t); }
  S.ui.bBusy = false; renderMain();
}
async function libraryAI() {
  const items = libItems();
  if (!items.length) { toast('Сначала сохраните публикации'); return; }
  if (!(await aiReady())) { S.ui.libAi = { state: 'done', text: libSummary(items), fallback: true }; renderMain(); return; }
  S.ui.libAi = { state: 'loading', text: '' }; renderMain();
  const prompt = `Ты — научный библиотекарь-консультант. Исследователь работает над темой «${S.me.passport.topic}». Ниже — его сохранённые публикации (год, название, статус чтения).
Сделай краткий анализ подборки на русском языке:
1) 2–3 тематических кластера;
2) чего не хватает для этой темы (методы, контекст, годы) — 3 пункта;
3) с чего продолжить чтение — 2–3 пункта с названиями ТОЛЬКО из списка ниже.
Не придумывай новые публикации, авторов и DOI. До 170 слов, маркированные списки, короткие заголовки.

Публикации:
${items.map(o => `- ${o.c.year}. ${o.c.title} (${LIB_STATUS[o.x.status]})`).join('\n')}`;
  try {
    const r = await aiText(prompt, { tier: 'default', cache: false, onText: ({ text }) => { S.ui.libAi = { state: 'streaming', text }; const el = document.getElementById('lib-ai-out'); if (el) { el.innerHTML = md(text); el.classList.add('streaming'); } } });
    S.ui.libAi = { state: 'done', text: r.text };
  } catch (e) { S.ui.libAi = { state: 'done', text: libSummary(items), fallback: true, note: aiErrorText(e) }; }
  renderMain();
}
function updatePromptPreview() {
  const m = S.ui.modal;
  if (!m || m.type !== 'prompt') return;
  const P = PROMPTS.find(p => p.id === m.id), filled = fillPrompt(P);
  const pv = document.getElementById('p-preview'), cp = document.getElementById('p-copy');
  if (pv) pv.innerHTML = esc(filled).replace(/\{\{([^}]+)\}\}/g, '<mark>{{$1}}</mark>');
  if (cp) cp.dataset.text = filled;
}
async function runPrompt(id) {
  const P = PROMPTS.find(p => p.id === id);
  const miss = promptVars(P).find(v => (v === 'текст' || (PROMPT_VARS[v] || {}).req) && !String(promptVal(P, v)).trim());
  if (miss) { toast(`Заполните поле «${(PROMPT_VARS[miss] || {}).label || miss}»`); const el = document.getElementById(`pv-${id}-${miss}`); if (el) el.focus(); return; }
  if (!(await aiReady())) { toast('ИИ недоступен в этом просмотре — скопируйте промпт и используйте его в Claude'); return; }
  const ctl = new AbortController(); S.ui.modalCtl = ctl;
  S.ui.promptOut[id] = { state: 'loading', text: '' }; renderModal();
  try {
    const r = await aiText(fillPrompt(P), { tier: 'default', cache: false, signal: ctl.signal, onText: ({ text }) => { S.ui.promptOut[id] = { state: 'streaming', text }; const el = document.getElementById('p-out'); if (el) el.innerHTML = md(text); else renderModal(); } });
    S.ui.promptOut[id] = { state: 'done', text: r.text, truncated: r.truncated };
  } catch (e) { S.ui.promptOut[id] = { state: 'done', text: (e && e.text) || '', note: e && e.code === 'cancelled' ? 'Остановлено' : aiErrorText(e) }; }
  S.ui.modalCtl = null;
  renderModal();
}
async function reportAI() {
  if (!(await aiReady())) { toast('ИИ недоступен в этом просмотре'); return; }
  const base = S.ui.reportText != null ? S.ui.reportText : monthlyReport();
  S.ui.reportBusy = true; renderModal();
  try {
    const r = await aiText(`Отредактируй ежемесячный отчёт о научной работе в официально-деловом стиле на русском языке. Сохрани структуру, нумерацию, все факты, даты и цифры; ничего не добавляй от себя. Верни только текст отчёта без пояснений.\n\n${base}`, { tier: 'default', cache: false, onText: ({ text }) => { const el = document.getElementById('report-out'); if (el) el.textContent = text; } });
    S.ui.reportText = r.text; S.ui.reportNote = 'Формулировки отредактированы ИИ — проверьте факты перед отправкой.';
  } catch (e) { S.ui.reportNote = aiErrorText(e); }
  S.ui.reportBusy = false; renderModal();
}
async function runBeta() {
  const tab = S.ui.beta;
  if (!(await aiReady())) { toast('ИИ недоступен в этом просмотре'); return; }
  const stream = async (prompt) => {
    S.ui.betaOut[tab] = { state: 'loading', text: '' }; renderMain();
    try {
      const r = await aiText(prompt, { tier: 'default', cache: false, onText: ({ text }) => { S.ui.betaOut[tab] = { state: 'streaming', text }; const el = document.getElementById('beta-out'); if (el) el.innerHTML = md(text); else renderMain(); } });
      S.ui.betaOut[tab] = { state: 'done', text: r.text };
    } catch (e) { S.ui.betaOut[tab] = { state: 'done', text: (e && e.text) || '', note: aiErrorText(e) }; }
    renderMain();
  };
  if (tab === 'journal') {
    const text = (dv('bj-text') || '').trim();
    if (text.length < 80) { toast('Вставьте аннотацию — хотя бы два-три предложения'); return; }
    const idx = [dv('bj-scopus', true) ? 'Scopus' : '', dv('bj-wos', true) ? 'Web of Science' : ''].filter(Boolean).join(' и ') || 'любая';
    return stream(`Ты — консультант научной библиотеки по выбору журнала. На основе аннотации предложи 5 научных журналов, тематически подходящих для статьи.
Требования: индексация — ${idx}; ${dv('bj-oa', false) ? 'только журналы открытого доступа' : 'открытый доступ не обязателен'}; язык публикации — ${dv('bj-lang', 'английский')}.
Для каждого журнала: название, издатель, почему подходит по теме (1–2 предложения), что проверить перед подачей.
Не указывай квартили, импакт-факторы, сроки и стоимость публикации — их проверяют в Scopus Sources, SJR, JCR и на сайте журнала. Не обещай принятие статьи. Называй только журналы, в существовании которых уверен.
Формат: нумерованный список, затем одна строка общего совета. Ответ на русском языке.

Аннотация:
${text.slice(0, 6000)}`);
  }
  if (tab === 'translator') {
    const text = (dv('bt-text') || '').trim();
    if (!text) { toast('Вставьте текст для перевода'); return; }
    const from = dv('bt-from', 'русский'), to = dv('bt-to', 'английский');
    if (from === to) { toast('Выберите разные языки'); return; }
    return stream(`Переведи академический текст с языка «${from}» на язык «${to}». Сохрани терминологию и стиль научной статьи, ничего не добавляй. После перевода с новой строки напиши «Глоссарий:» и дай 5 ключевых терминов в формате «оригинал — перевод».

Текст:
${text.slice(0, 8000)}`);
  }
  const text = (dv('br-text') || '').trim();
  if (text.length < 200) { toast('Вставьте фрагмент рукописи — хотя бы по абзацу на раздел'); return; }
  S.ui.betaOut.reviewer = { state: 'loading' }; renderMain();
  try {
    const r = await aiJson(`Ты — рецензент международного научного журнала. Дай предварительную рецензию рукописи по пяти критериям: «Актуальность исследования» (достаточно ли обоснована научная проблема), «Методология» (соответствуют ли методы цели и гипотезам), «Статистика» (корректно ли представлены статистические результаты), «Обсуждение» (сопоставлены ли результаты с предыдущими исследованиями), «Выводы» (подтверждаются ли они полученными данными).
Для каждого критерия: оценка от 1 до 5, комментарий в 1–2 предложения по существу текста и конкретная рекомендация. Пиши на русском языке.
Ответь только JSON: {"overall":"2–3 предложения","criteria":[{"name":"Актуальность исследования","score":3,"comment":"...","fix":"..."}]}

Рукопись:
${text.slice(0, 12000)}`, { tier: 'default', cache: false });
    if (!r || !Array.isArray(r.criteria)) throw { code: 'invalid_json' };
    S.ui.betaOut.reviewer = { state: 'done', data: r };
  } catch (e) { S.ui.betaOut.reviewer = { state: 'done', text: '', note: aiErrorText(e) }; }
  renderMain();
}

/* ---------- Action map ---------- */
const ACT = {
  nav: el => go(S.role, el.dataset.view),
  role: el => { const r = el.dataset.role; if (r !== S.role) go(r, S.view[r]); },
  about: () => openModal('about'),
  scenario: () => openModal('scenario'),
  'modal-close': () => closeModal(),
  'reset-ask': () => openModal('reset-ask'),
  'reset-do': () => { resetDemo(); closeModal(); go('student', 'passport'); toast('Демо-данные на этом устройстве сброшены'); },
  goto: el => {
    closeModal(); go(el.dataset.role, el.dataset.view);
    if (el.dataset.then === 'escalate') openEscalate('Есть ли у ЕНУ доступ к базе ERIC? Ищу исследования по цифровой грамотности докторантов.', 'Электронные ресурсы');
  },
  bell: () => { S.ui.bell = !S.ui.bell; renderTop(); },
  'notif-all': () => { const now = Date.now(); myTickets().forEach(t => { S.me.seen[t.id] = now; }); all('notices').forEach(n => { if (!S.me.readNotices.includes(n.id)) S.me.readNotices.push(n.id); }); persist(); render(); },
  'notif-open': el => {
    const k = el.dataset.key; S.ui.bell = false;
    if (k.startsWith('t:')) openTicket(k.slice(2));
    else { const id = k.slice(2); if (!S.me.readNotices.includes(id)) S.me.readNotices.push(id); persist(); render(); }
  },
  'hint-off': () => { S.me.hintDismissed = true; persist(); renderMain(); },
  'pp-edit': () => { clearDrafts('pe-'); openModal('pp-edit'); },
  'pp-preview': () => { S.ui.ppPreview = !S.ui.ppPreview; renderMain(); },
  'pp-vis': el => {
    const k = el.dataset.key, vis = Object.assign({}, S.me.passport.vis);
    vis[k] = vis[k] === false;
    S.me.passport = Object.assign({}, S.me.passport, { vis }); persist(); renderMain();
    toast(vis[k] ? 'Поле открыто другим исследователям' : 'Поле скрыто от других исследователей');
  },
  'pp-save': () => {
    const p = S.me.passport;
    const name = String(dv('pe-name', p.name)).trim();
    if (!name) { toast('Укажите ФИО'); return; }
    const orcid = String(dv('pe-orcid', p.orcid)).trim();
    if (orcid && !orcidValid(orcid)) { toast('ORCID не прошёл проверку контрольной цифры'); const el = document.getElementById('pe-orcid'); if (el) el.focus(); return; }
    const np = Object.assign({}, p, {
      name, orcid, status: dv('pe-status', p.status), course: +dv('pe-course', p.course), spec: dv('pe-spec', p.spec),
      topic: String(dv('pe-topic', p.topic)).trim(), sup: String(dv('pe-sup', p.sup)).trim(), cons: String(dv('pe-cons', p.cons)).trim(), defense: dv('pe-defense', p.defense),
      interests: splitList(dv('pe-interests', (p.interests || []).join(', ')), ','), pubs: splitList(dv('pe-pubs', (p.pubs || []).join('\n')), '\n'), projects: splitList(dv('pe-projects', (p.projects || []).join('\n')), '\n')
    });
    if (np.status === 'Магистрант' && np.course > 2) np.course = 2;
    const replan = np.status !== p.status || np.course !== p.course || np.defense !== p.defense;
    S.me.passport = np;
    if (replan) S.me.planner.milestones = buildPlan(np, S.me.planner.milestones, false);
    clearDrafts('pe-'); persist(); closeModal(); render();
    toast(replan ? 'Паспорт сохранён, научный план пересобран' : 'Паспорт сохранён');
  },
  's-type': el => { S.ui.search.type = el.dataset.v; renderMain(); },
  'save-pub': el => {
    const id = el.dataset.id, L = S.me.library, i = L.findIndex(x => x.pid === id);
    if (i >= 0) { L.splice(i, 1); toast('Убрано из библиотеки'); }
    else { const c = CATALOG.find(x => x.id === id); L.push({ id: uid('L'), pid: id, status: 'unread', coll: c.topic, notes: '', added: Date.now() }); toast(`Сохранено в «Мою библиотеку» · коллекция «${TOPICS[c.topic]}»`); }
    persist(); renderMain();
  },
  cite: el => { const id = el.dataset.id; S.ui.citeOpen[id] = !S.ui.citeOpen[id]; renderMain(); },
  copy: el => copyText(el.dataset.text || ''),
  'copy-open': el => copyText(el.dataset.text || '', true),
  'b-tab': el => { S.ui.builderTab = el.dataset.v; renderMain(); },
  'b-del': el => { S.me.builder.concepts.splice(+el.dataset.i, 1); persist(); renderMain(); },
  'b-term-del': el => { S.me.builder.concepts[+el.dataset.i].terms.splice(+el.dataset.j, 1); persist(); renderMain(); },
  'b-add-concept': () => { S.me.builder.concepts.push({ terms: [] }); persist(); renderMain(); const el = document.getElementById('b-in-' + (S.me.builder.concepts.length - 1)); if (el) el.focus(); },
  'b-add': el => {
    const i = +el.dataset.i, v = String(dv('b-in-' + i)).trim();
    if (!v) return;
    v.split(/[;,]/).map(s => s.trim()).filter(Boolean).forEach(t => { if (!S.me.builder.concepts[i].terms.includes(t)) S.me.builder.concepts[i].terms.push(t); });
    S.ui.drafts['b-in-' + i] = ''; persist(); renderMain();
  },
  'b-ai': () => builderAI(),
  'lib-coll': el => { S.ui.lib.coll = el.dataset.v; renderMain(); },
  'lib-filter-status': el => { S.ui.lib.status = el.dataset.v; renderMain(); },
  'lib-status': el => { const x = S.me.library.find(i => i.id === el.dataset.id); if (x) { x.status = el.dataset.v; persist(); renderMain(); } },
  'lib-note': el => { const k = 'lib-open-' + el.dataset.id; S.ui.drafts[k] = !S.ui.drafts[k]; delete S.ui.drafts['lib-n-' + el.dataset.id]; renderMain(); const ta = document.getElementById('lib-n-' + el.dataset.id); if (ta) ta.focus(); },
  'lib-note-save': el => { const x = S.me.library.find(i => i.id === el.dataset.id); if (!x) return; x.notes = String(dv('lib-n-' + x.id, x.notes)).trim(); S.ui.drafts['lib-open-' + x.id] = false; persist(); renderMain(); toast('Заметка сохранена'); },
  'lib-del': el => { S.me.library = S.me.library.filter(i => i.id !== el.dataset.id); persist(); renderMain(); toast('Публикация убрана из библиотеки'); },
  'lib-style': el => { S.ui.lib.style = el.dataset.v; renderMain(); },
  'lib-ai': () => libraryAI(),
  ask: el => sendAssistant(el.dataset.q),
  escalate: el => openEscalate(el.dataset.q || '', el.dataset.cat || ''),
  'esc-send': async () => {
    const q = String(dv('esc-q')).trim();
    if (q.length < 5) { toast('Опишите вопрос подробнее'); return; }
    await createTicket({ cat: dv('esc-cat', 'Другие вопросы'), q, attach: dv('esc-attach', true) });
  },
  'chat-clear': () => { S.me.chat = []; persist(); renderMain(); },
  helpful: el => { const m = (S.me.chat || []).find(x => x.id === el.dataset.id); if (m) { m.helpful = !m.helpful; persist(); renderMain(); } },
  'open-ticket': el => openTicket(el.dataset.id),
  't-follow': async el => {
    const id = el.dataset.id, key = 'tf-' + id, text = String(dv(key)).trim();
    if (!text) { toast('Напишите сообщение'); return; }
    const t = byId('tickets', id), now = Date.now();
    S.ui.drafts[key] = '';
    await put('messages', { id: uid('msg'), ticketId: id, from: 'student', name: S.me.passport.name, text, at: now });
    await patch('tickets', id, Object.assign({ updatedAt: now }, t.status === 'resolved' ? { status: 'waiting' } : {}));
    S.me.seen[id] = now; persist();
    toast(t.status === 'resolved' ? 'Обращение открыто снова' : 'Сообщение добавлено к обращению');
  },
  't-solved': async el => {
    const id = el.dataset.id, now = Date.now();
    await patch('tickets', id, { status: 'resolved', resolvedAt: now, updatedAt: now });
    await put('messages', { id: uid('msg'), ticketId: id, from: 'system', text: 'Пользователь отметил вопрос как решённый', at: now });
    S.me.seen[id] = now; persist(); toast('Спасибо! Обращение закрыто');
  },
  'kb-view': el => openModal('kb-view', { id: el.dataset.id }),
  'slot-book': async el => { const s = byId('slots', el.dataset.id); await patch('slots', s.id, { bookedBy: myId(), bookedName: S.me.passport.name }); toast(`Вы записаны на консультацию: ${fmtD(s.at)}, ${fmtT(s.at)}`); },
  'slot-cancel': async el => { await patch('slots', el.dataset.id, { bookedBy: null, bookedName: null }); toast('Запись на консультацию отменена'); },
  'ev-reg': async el => {
    const e = byId('events', el.dataset.id), att = (e.attendees || []).slice(), me = myId(), i = att.indexOf(me);
    if (i >= 0) att.splice(i, 1); else att.push(me);
    await patch('events', e.id, { attendees: att });
    toast(i >= 0 ? 'Запись отменена' : `Вы записаны: «${e.title}»`);
  },
  'plan-rebuild': () => { S.me.planner.milestones = buildPlan(S.me.passport, S.me.planner.milestones, false); persist(); renderMain(); toast('План пересобран по паспорту — отметки о выполнении сохранены'); },
  report: () => { S.ui.reportText = null; S.ui.reportNote = ''; openModal('report'); },
  'report-ai': () => reportAI(),
  'diary-del': el => { S.me.planner.diary = S.me.planner.diary.filter(d => d.id !== el.dataset.id); persist(); renderMain(); },
  'p-cat': el => { S.ui.prompts.cat = el.dataset.v; S.ui.prompts.fav = false; renderMain(); },
  'p-fav': () => { S.ui.prompts.fav = !S.ui.prompts.fav; renderMain(); },
  'p-open': el => openModal('prompt', { id: el.dataset.id }),
  'p-favtoggle': el => { const f = S.me.favPrompts || (S.me.favPrompts = []), i = f.indexOf(el.dataset.id); if (i >= 0) f.splice(i, 1); else f.push(el.dataset.id); persist(); render(); },
  'p-run': el => runPrompt(el.dataset.id),
  'p-example': el => {
    const P = PROMPTS.find(p => p.id === el.dataset.id);
    if (!P || !P.ex) return;
    Object.entries(P.ex.vals).forEach(([k, v]) => { S.ui.drafts[`pv-${P.id}-${k}`] = v; });
    renderModal();
    toast(P.lang === 'kk' ? 'Өрістер мысалмен толтырылды — журнал мен деректерді өзіңіз қосыңыз' : 'Поля заполнены примером — журнал и данные добавьте сами');
  },
  'p-goto': el => { S.ui.prompts.cat = el.dataset.v; S.ui.prompts.fav = false; go('student', 'prompts'); },
  'p-stop': () => { if (S.ui.modalCtl) S.ui.modalCtl.abort(); },
  'beta-tab': el => { S.ui.beta = el.dataset.v; if (!(S.role === 'student' && curView() === 'roadmap')) go('student', 'roadmap'); else renderMain(); const b = document.getElementById('beta'); if (b) b.scrollIntoView({ block: 'start' }); },
  'beta-sample': el => { const v = el.dataset.v; if (v === 'journal') S.ui.drafts['bj-text'] = SAMPLES.abstract; if (v === 'reviewer') S.ui.drafts['br-text'] = SAMPLES.manuscript; if (v === 'translator') S.ui.drafts['bt-text'] = SAMPLES.translate; renderMain(); },
  'beta-run': () => runBeta(),
  'chart-table': el => { S.ui.chartTable[el.dataset.k] = !S.ui.chartTable[el.dataset.k]; renderMain(); },
  'tk-status': el => { S.ui.tk.status = el.dataset.v; S.ui.tk.sel = null; renderMain(); },
  'tk-sel': el => { S.ui.tk.sel = el.dataset.id; S.ui.mobileDetail = true; renderMain(); if (window.innerWidth < 860) try { window.scrollTo(0, 0); } catch (e) { } },
  'tk-open': el => { S.ui.tk.sel = el.dataset.id; S.ui.tk.status = 'open'; go('staff', 'tickets'); },
  'tk-back': () => { S.ui.mobileDetail = false; renderMain(); },
  'tk-take': el => takeTicket(el.dataset.id),
  'tk-resolve': el => resolveTicket(el.dataset.id),
  'tk-reply': el => staffReply(el.dataset.id, false),
  'tk-reply-close': el => staffReply(el.dataset.id, true),
  'tk-ai': el => ticketAIDraft(el.dataset.id),
  'tk-insert-kb': el => {
    const e = byId('kb', el.dataset.kb), key = 'reply-' + el.dataset.id, cur = String(dv(key)).trim();
    S.ui.drafts[key] = (cur ? cur + '\n\n' : 'Добрый день!\n') + e.a;
    renderMain(); const ta = document.getElementById(key); if (ta) ta.focus();
  },
  'tk-to-kb': el => {
    const t = byId('tickets', el.dataset.id), staff = threadOf(t.id).filter(m => m.from === 'staff').pop();
    clearDrafts('ke-');
    S.ui.drafts['ke-q'] = t.q; S.ui.drafts['ke-a'] = staff ? staff.text : '';
    S.ui.drafts['ke-cat'] = KB_CATEGORIES.includes(t.cat) ? t.cat : 'Другие вопросы';
    S.ui.drafts['ke-keys'] = [...new Set(tokens(t.q))].join(' ');
    S.ui.drafts['ke-status'] = 'approved';
    S.ui.kbSrc = [{ t: `Ответ сотрудника библиотеки (обращение №${t.num})`, u: '' }];
    openModal('kb-edit', { id: null, fromTicket: t.id, fromNum: t.num });
  },
  'kb-new': () => { clearDrafts('ke-'); S.ui.kbSrc = []; openModal('kb-edit', { id: null }); },
  'kb-edit': el => { clearDrafts('ke-'); const e = byId('kb', el.dataset.id); S.ui.kbSrc = ((e && e.src) || []).slice(); openModal('kb-edit', { id: el.dataset.id }); },
  'ke-src-del': el => { S.ui.kbSrc.splice(+el.dataset.i, 1); renderModal(); },
  'kb-ai': () => kbGeneralizeAI(),
  'kb-save': async () => {
    const m = S.ui.modal, e = m.id ? byId('kb', m.id) : null;
    const q = String(dv('ke-q', e ? e.q : '')).trim(), a = String(dv('ke-a', e ? e.a : '')).trim();
    if (!q || !a) { toast('Заполните вопрос и ответ'); return; }
    const src = (S.ui.kbSrc || []).slice(), st = String(dv('ke-st', '')).trim(), su = String(dv('ke-su', '')).trim();
    if (st || (su && su !== 'https://')) src.push({ t: st || su, u: /^https?:\/\/\S+\.\S+/.test(su) ? su : '' });
    const doc = Object.assign({}, e ? cleanDoc(e) : { views: 0 }, { id: e ? e.id : uid('kb'), cat: dv('ke-cat', e ? e.cat : 'Электронные ресурсы'), status: dv('ke-status', e ? (e.status || 'approved') : 'approved'), q, keys: String(dv('ke-keys', e ? e.keys || '' : '')).trim(), a, src, updated: Date.now() });
    closeModal();
    await put('kb', doc);
    KB_IDX = null; clearDrafts('ke-');
    toast(doc.status === 'approved' ? 'Запись подтверждена — виртуальный библиотекарь уже использует её' : 'Черновик сохранён — ассистент не использует его до подтверждения');
    render();
  },
  'kb-del': async el => { closeModal(); await removeDoc('kb', el.dataset.id); KB_IDX = null; toast('Запись удалена из базы знаний'); },
  'kb-status': el => { S.ui.kb.status = el.dataset.v; renderMain(); },
  'ev-new': () => { clearDrafts('ev-'); openModal('ev-new'); },
  'ev-save': async () => {
    const title = String(dv('ev-title')).trim(), at = Date.parse(dv('ev-at', ''));
    if (!title) { toast('Укажите название'); return; }
    if (!at) { toast('Укажите дату и время'); return; }
    const ev = { id: uid('ev'), title, at, format: dv('ev-format', 'Онлайн'), place: String(dv('ev-place', '')).trim(), seats: Math.max(1, +dv('ev-seats', 30) || 30), base: 0, attendees: [], tags: String(dv('ev-tags', '')).trim() };
    closeModal();
    await put('events', ev);
    if (dv('ev-notify', true)) await put('notices', { id: uid('n'), at: Date.now(), audience: 'all', title: `Новое мероприятие: ${title}`, text: `${fmtD(at)}, ${fmtT(at)} · ${ev.format}. Записаться можно в научном паспорте, блок «Мероприятия».` });
    clearDrafts('ev-'); toast('Мероприятие опубликовано');
  },
  'ev-del': el => removeDoc('events', el.dataset.id),
  'slot-new': () => { clearDrafts('sl-'); openModal('slot-new'); },
  'slot-save': async () => {
    const at = Date.parse(dv('sl-at', '')), topic = String(dv('sl-topic')).trim();
    if (!at || !topic) { toast('Укажите дату и тему'); return; }
    closeModal();
    await put('slots', { id: uid('sl'), at, mins: +dv('sl-mins', '30'), topic, who: String(dv('sl-who', 'Библиограф-консультант')).trim(), bookedBy: null });
    clearDrafts('sl-'); toast('Слот консультации добавлен');
  },
  'slot-del': el => removeDoc('slots', el.dataset.id),
  'res-new': () => { clearDrafts('re-'); openModal('res-edit', { id: null }); },
  'res-edit': el => { clearDrafts('re-'); openModal('res-edit', { id: el.dataset.id }); },
  'res-save': async () => {
    const m = S.ui.modal, r = m.id ? byId('resources', m.id) : null;
    const name = String(dv('re-name', r ? r.name : '')).trim(), url = String(dv('re-url', r ? r.url : '')).trim();
    if (!name) { toast('Укажите название'); return; }
    if (!/^https?:\/\/\S+\.\S+/.test(url)) { toast('Укажите ссылку, начинающуюся с https://'); return; }
    closeModal();
    await put('resources', Object.assign({}, r ? cleanDoc(r) : { show: true }, { id: r ? r.id : uid('r'), name, url, kind: dv('re-kind', r ? r.kind : 'Национальная подписка МНВО РК'), note: String(dv('re-note', r ? r.note : '')).trim() }));
    clearDrafts('re-'); toast('Ресурс сохранён');
  },
  'res-del': async el => { closeModal(); await removeDoc('resources', el.dataset.id); toast('Ресурс удалён'); },
  'notice-del': el => removeDoc('notices', el.dataset.id)
};

/* =====================================================================
   13. Event delegation & boot
   ===================================================================== */
document.addEventListener('click', e => {
  if (S.ui.bell && !e.target.closest('.bell-wrap')) { S.ui.bell = false; renderTop(); }
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const act = el.dataset.act;
  if (act === 'modal-bg') { if (e.target === el) closeModal(); return; }
  const fn = ACT[act];
  if (!fn) return;
  if (el.tagName === 'A' && act !== 'copy-open') e.preventDefault();
  if (el.disabled) return;
  fn(el, e);
});
let liveTimer = null;
document.addEventListener('input', e => {
  const el = e.target;
  if (!el.dataset) return;
  if (el.dataset.draft) S.ui.drafts[el.dataset.draft] = el.value;
  if (el.id === 'chat-input') { el.style.height = 'auto'; el.style.height = Math.min(150, el.scrollHeight) + 'px'; }
  if (el.id === 'pe-orcid') {
    const h = document.getElementById('orcid-hint'), v = el.value.trim();
    if (h) { h.textContent = !v ? '16 цифр, последняя может быть X' : orcidValid(v) ? 'Контрольная цифра верна' : 'Проверьте номер: контрольная цифра не совпадает'; h.classList.toggle('err', !!v && !orcidValid(v)); }
  }
  if (el.dataset.livePrompt) updatePromptPreview();
  if (el.dataset.live) { clearTimeout(liveTimer); liveTimer = setTimeout(renderMain, 160); }
});
document.addEventListener('change', e => {
  const el = e.target;
  if (!el.dataset) return;
  if (el.dataset.ms) {
    const m = S.me.planner.milestones.find(x => x.k === el.dataset.ms);
    if (m) { m.done = el.checked; m.doneAt = el.checked ? Date.now() : null; persist(); renderMain(); toast(el.checked ? 'Этап отмечен выполненным' : 'Отметка снята'); }
    return;
  }
  if (el.dataset.libColl) { const x = S.me.library.find(i => i.id === el.dataset.libColl); if (x) { x.coll = el.value; persist(); renderMain(); toast(`Перенесено в коллекцию «${TOPICS[el.value]}»`); } return; }
  if (el.dataset.tkcat) { patch('tickets', el.dataset.tkcat, { cat: el.value }); toast('Категория изменена'); return; }
  if (el.dataset.resShow) { patch('resources', el.dataset.resShow, { show: el.checked }); return; }
  const id = el.id;
  const filters = { 's-idx': ['search', 'idx'], 's-from': ['search', 'from'], 's-sort': ['search', 'sort'], 's-free': ['search', 'free'], 'tk-cat': ['tk', 'cat'], 'kb-cat': ['kb', 'cat'] };
  if (filters[id]) { const [g, k] = filters[id]; S.ui[g][k] = el.type === 'checkbox' ? el.checked : el.value; if (g === 'tk') S.ui.tk.sel = null; renderMain(); return; }
  if (id && (el.tagName === 'SELECT' || el.type === 'checkbox' || el.type === 'radio')) {
    S.ui.drafts[id] = el.type === 'checkbox' ? el.checked : el.value;
    if (id === 'esc-cat') renderModal();
    if (id.startsWith('pv-')) updatePromptPreview();
  }
});
document.addEventListener('submit', e => {
  const f = e.target.closest('form[data-form]');
  if (!f) return;
  e.preventDefault();
  const k = f.dataset.form;
  if (k === 'search') { S.ui.search.q = String(dv('s-q')).trim(); renderMain(); }
  else if (k === 'chat') sendAssistant(dv('chat-input'));
  else if (k === 'meeting') {
    const at = Date.parse(dv('mt-at', '')), topic = String(dv('mt-topic')).trim();
    if (!at || !topic) { toast('Укажите дату и тему встречи'); return; }
    S.me.planner.meetings.push({ id: uid('mt'), at, topic, outcome: '' });
    S.ui.drafts['mt-topic'] = ''; persist(); renderMain(); toast('Встреча добавлена в планер');
  } else if (k === 'diary') {
    const text = String(dv('d-text')).trim();
    if (!text) { toast('Напишите запись'); return; }
    S.me.planner.diary.push({ id: uid('d'), at: Date.now(), tag: dv('d-tag', 'Идея'), text });
    S.ui.drafts['d-text'] = ''; persist(); renderMain(); toast('Запись добавлена в дневник');
  } else if (k === 'notice') {
    const title = String(dv('nt-title')).trim(), text = String(dv('nt-text')).trim();
    if (!title || !text) { toast('Заполните заголовок и текст'); return; }
    put('notices', { id: uid('n'), at: Date.now(), audience: dv('nt-aud', 'all'), title, text });
    clearDrafts('nt-'); toast('Уведомление отправлено пользователям');
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { if (S.ui.modal) { closeModal(); return; } if (S.ui.bell) { S.ui.bell = false; renderTop(); } return; }
  const el = e.target;
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
    if (el.id === 'chat-input') { e.preventDefault(); sendAssistant(el.value); return; }
    if (el.dataset && el.dataset.enter && ACT[el.dataset.enter]) { e.preventDefault(); ACT[el.dataset.enter](el); }
  }
});
window.addEventListener('hashchange', () => {
  const r = parseHash();
  if (!r || (r[0] === S.role && r[1] === S.view[r[0]])) return;
  S.role = r[0]; S.view[r[0]] = r[1]; render();
});
/* Tooltips: values lead, labels follow; text set with textContent */
const tipEl = () => document.getElementById('tooltip');
function showTip(el, x, y) {
  const t = tipEl(); if (!t) return;
  t.textContent = '';
  const b = document.createElement('b'); b.textContent = el.dataset.tipv || '';
  const s = document.createElement('span'); s.textContent = el.dataset.tip || '';
  t.append(b, s); t.hidden = false;
  const r = t.getBoundingClientRect();
  let L = x + 14, T = y + 14;
  if (L + r.width > window.innerWidth - 8) L = x - r.width - 14;
  if (T + r.height > window.innerHeight - 8) T = y - r.height - 14;
  t.style.left = Math.max(8, L) + 'px'; t.style.top = Math.max(8, T) + 'px';
}
document.addEventListener('pointermove', e => {
  const el = e.target.closest && e.target.closest('[data-tip]');
  if (el) showTip(el, e.clientX, e.clientY);
  else { const t = tipEl(); if (t && !t.hidden) t.hidden = true; }
});
document.addEventListener('focusin', e => { const el = e.target.closest && e.target.closest('[data-tip]'); if (el) { const r = el.getBoundingClientRect(); showTip(el, r.left + Math.min(r.width / 2, 120), r.top); } });
document.addEventListener('focusout', () => { const t = tipEl(); if (t) t.hidden = true; });

function boot() {
  loadState();
  const h = parseHash();
  if (h) { S.role = h[0]; S.view[h[0]] = h[1]; }
  document.getElementById('app').innerHTML = '<div class="app"><header class="topbar" id="topbar"></header><nav class="nav" id="nav" aria-label="Модули кабинета"></nav><main class="main" id="main"></main></div>';
  render();
  initLive();
}
boot();
