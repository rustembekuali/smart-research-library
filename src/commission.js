/* =====================================================================
   AI Expert Commission — виртуальная экспертная комиссия
   Докторант приглашает экспертов, каждый получает индивидуальный доступ к главам,
   оставляет замечания, докторант исправляет (ИИ объясняет замечание и предлагает шаги),
   эксперт подтверждает исправление. ИИ не принимает решений о допуске к защите.
   ===================================================================== */
const CM_ROLES = {
  sup: { ru: 'Научный руководитель', c: '#15803D', ic: 'grad' },
  foreign: { ru: 'Зарубежный научный консультант', c: '#0369A1', ic: 'globe' },
  prof: { ru: 'Профессор кафедры', c: '#7C3AED', ic: 'building' },
  internal: { ru: 'Внутренний эксперт', c: '#0F766E', ic: 'user' },
  external: { ru: 'Внешний эксперт', c: '#C2410C', ic: 'users' },
  predef: { ru: 'Член комиссии предварительной защиты', c: '#B45309', ic: 'clip' },
  council: { ru: 'Уполномоченный член диссертационного совета', c: '#A21CAF', ic: 'star' }
};
const CM_CHAPTERS = [
  { id: 'intro', ru: 'Введение' },
  { id: 'ch1', ru: 'Глава 1. Теоретические основы цифрового сопровождения исследовательской подготовки докторантов' },
  { id: 'ch2', ru: 'Глава 2. Методология и организация исследования' },
  { id: 'ch3', ru: 'Глава 3. Опытно-экспериментальная проверка модели сопровождения' },
  { id: 'concl', ru: 'Заключение' }
];
const CM_ST = { open: 'Нужно исправить', fixed: 'На проверке у эксперта', accepted: 'Исправлено', returned: 'Возвращено на доработку' };
const CM_CRITERIA = ['Научная новизна', 'Методологическая обоснованность', 'Достоверность результатов', 'Соответствие выводов исследовательским задачам'];
const cmCh = id => CM_CHAPTERS.find(c => c.id === id) || { id, ru: id };
const cmShortCh = id => { const t = cmCh(id).ru; const i = t.indexOf('.'); return i > 0 && t.startsWith('Глава') ? t.slice(0, i) : t; };

function cmSeed(now, p) {
  const D = n => now - n * DAY;
  const v = (n, days, text) => ({ v: n, at: D(days), text });
  const r = (id, ex, ch, days, st, text, extra = {}) => Object.assign({ id, ex, ch, at: D(days), st, text, fix: null, ret: null, ai: null, hist: [{ st: 'open', at: D(days) }] }, extra);
  const acc = (rr, fixDays, okDays, note) => { rr.fix = { note, v: 1, at: D(fixDays) }; rr.hist.push({ st: 'fixed', at: D(fixDays) }, { st: 'accepted', at: D(okDays) }); return rr; };
  const R = [
    acc(r('r1', 'ex1', 'intro', 160, 'accepted', 'Сформулируйте цель исследования одним предложением и согласуйте её с задачами.'), 150, 148, 'Цель переписана одним предложением, задачи пронумерованы и выводятся из цели.'),
    acc(r('r2', 'ex1', 'intro', 158, 'accepted', 'Гипотеза сформулирована слишком общо — укажите условия, которые можно проверить.'), 149, 147, 'Гипотеза уточнена: добавлены проверяемые условия сопровождения.'),
    acc(r('r3', 'ex1', 'ch1', 120, 'accepted', 'Раздел 1.2 перегружен цитатами — добавьте собственный сравнительный анализ подходов.'), 110, 105, 'Добавлена сравнительная таблица подходов и авторский вывод.'),
    acc(r('r4', 'ex1', 'ch1', 118, 'accepted', 'Уточните понятие «цифровое сопровождение» и разведите его с понятием «цифровая поддержка».'), 109, 104, 'Дано рабочее определение, различие показано в п. 1.1.'),
    acc(r('r5', 'ex1', 'ch2', 70, 'accepted', 'Опишите этапы опытно-экспериментальной работы и сроки каждого этапа.'), 62, 60, 'Добавлена таблица этапов с задачами и сроками.'),
    r('r6', 'ex1', 'ch3', 9, 'open', 'Добавьте сравнение контрольной и экспериментальной групп на констатирующем этапе.'),
    acc(r('r7', 'ex2', 'intro', 140, 'accepted', 'Please clarify the research gap in relation to international studies on doctoral support.'), 131, 128, 'Research gap reformulated with reference to the international review in Chapter 1.'),
    acc(r('r8', 'ex2', 'ch1', 100, 'accepted', 'Add an international perspective: how research-support services for doctoral students are organised in other universities.'), 90, 86, 'Section 1.3 added with an overview of international practice.'),
    acc(r('r9', 'ex2', 'ch2', 66, 'accepted', 'Report the reliability of each scale (Cronbach’s alpha).'), 58, 55, 'Reliability coefficients added to Table 2.2.'),
    r('r10', 'ex3', 'ch2', 2, 'open', 'Необходимо уточнить критерии отбора участников исследования.'),
    acc(r('r11', 'ex3', 'ch1', 95, 'accepted', 'Вывод к первой главе повторяет введение — сформулируйте его через результаты теоретического анализа.'), 88, 84, 'Вывод переписан: три положения, вытекающие из анализа.'),
    r('r12', 'ex3', 'ch2', 20, 'fixed', 'Обоснуйте объём выборки.', { fix: { note: 'Добавлено обоснование объёма выборки через расчёт статистической мощности, параметры — в таблице 2.1.', v: 2, at: D(4) }, hist: [{ st: 'open', at: D(20) }, { st: 'fixed', at: D(4) }] }),
    acc(r('r13', 'ex3', 'ch3', 30, 'accepted', 'Согласуйте названия таблиц с текстом главы.'), 25, 23, 'Названия таблиц и ссылки в тексте приведены в соответствие.'),
    acc(r('r14', 'ex4', 'ch2', 60, 'accepted', 'Свяжите методы статистической обработки с гипотезой: какой критерий проверяет какое предположение?'), 52, 50, 'Добавлена таблица «гипотеза — показатель — критерий».'),
    r('r15', 'ex4', 'ch3', 24, 'returned', 'Интерпретация корреляции выходит за пределы данных: корреляция не доказывает влияние.', { fix: { note: 'Переписан вывод к п. 3.2.', v: 1, at: D(12) }, ret: { text: 'Формулировка в п. 3.2 всё ещё причинная — «свидетельствует о влиянии». Замените на описание связи.', at: D(3) }, hist: [{ st: 'open', at: D(24) }, { st: 'fixed', at: D(12) }, { st: 'returned', at: D(3) }] }),
    acc(r('r16', 'ex4', 'ch3', 28, 'accepted', 'Добавьте раздел об ограничениях исследования.'), 22, 20, 'Ограничения описаны в конце главы 3.')
  ];
  return {
    v: 1,
    experts: [
      { id: 'ex1', role: 'sup', name: (p && p.sup) || 'Научный руководитель (демо)', st: 'active', code: 'EXP-1042', ch: CM_CHAPTERS.map(c => c.id), at: D(200) },
      { id: 'ex2', role: 'foreign', name: ((p && p.cons) || 'Dr. L. Mendes (демо)').split(',')[0] + ' (демо)', st: 'active', code: 'EXP-2087', ch: ['intro', 'ch1', 'ch2'], at: D(180) },
      { id: 'ex3', role: 'prof', name: 'профессор А. Б. Ахметова (демо)', st: 'active', code: 'EXP-3315', ch: ['ch1', 'ch2', 'ch3'], at: D(130) },
      { id: 'ex4', role: 'external', name: 'к.п.н. Д. С. Омаров (демо)', st: 'active', code: 'EXP-4560', ch: ['ch2', 'ch3'], at: D(75) },
      { id: 'ex5', role: 'predef', name: 'PhD Г. Т. Сейткали (демо)', st: 'invited', code: 'EXP-5873', ch: CM_CHAPTERS.map(c => c.id), at: D(1) }
    ],
    versions: {
      intro: [v(1, 165, 'Актуальность исследования определяется ростом требований к исследовательской подготовке докторантов и цифровизацией научных библиотек. Цель исследования — теоретически обосновать и экспериментально проверить модель сопровождения исследовательской подготовки докторантов с помощью цифровых сервисов научной библиотеки и инструментов искусственного интеллекта. Гипотеза: сопровождение будет результативным, если сервисы библиотеки встроены в индивидуальный план докторанта и связаны с этапами исследования.')],
      ch1: [v(1, 125, 'В главе рассматриваются подходы к понятию исследовательской подготовки докторантов и роль научной библиотеки в её сопровождении. Уточняется понятие «цифровое сопровождение» как системы библиотечных сервисов, консультаций и ИИ-инструментов, встроенных в этапы исследования. Предложена структурно-функциональная модель сопровождения.')],
      ch2: [v(1, 75, 'Исследование проводилось на базе ЕНУ им. Л. Н. Гумилёва. В нём участвовали докторанты педагогических специальностей. Использовались анкетирование, тест исследовательских умений и анализ продуктов исследовательской деятельности. Данные обрабатывались методами описательной и индуктивной статистики.'),
        v(2, 4, 'Исследование проводилось на базе ЕНУ им. Л. Н. Гумилёва. В нём участвовали докторанты педагогических специальностей. Объём выборки обоснован предварительным расчётом статистической мощности для сравнения двух независимых групп; параметры расчёта приведены в таблице 2.1. Использовались анкетирование, тест исследовательских умений и анализ продуктов исследовательской деятельности. Данные обрабатывались методами описательной и индуктивной статистики.')],
      ch3: [v(1, 32, 'На формирующем этапе экспериментальная группа работала с цифровыми сервисами библиотеки по индивидуальному плану. Сравнение групп на контрольном этапе выполнено с помощью t-критерия Стьюдента. Выявлена положительная связь между частотой использования сервисов и уровнем исследовательских умений; это свидетельствует о влиянии сервисов на подготовку.')],
      concl: []
    },
    remarks: R,
    seen: R.filter(x => !['r10', 'r15'].includes(x.id)).map(x => x.id + ':' + x.st),
    analysis: null
  };
}
function cmState() {
  if (!S.me.cm || S.me.cm.v !== 1 || !Array.isArray(S.me.cm.remarks)) S.me.cm = cmSeed(Date.now(), S.me.passport);
  return S.me.cm;
}
function cmInitials(name) {
  const w = String(name || '').replace(/\(демо\)/g, '').split(/[\s,]+/).filter(x => x && !/^(д\.п\.н\.|к\.п\.н\.|phd|dr\.?|профессор)$/i.test(x));
  if (!w.length) return '?';
  const last = w[w.length - 1], first = w[0];
  return ((w.length > 1 ? first[0] : '') + last[0]).toUpperCase();
}
const cmExpert = id => cmState().experts.find(e => e.id === id);
const cmLatest = ch => { const a = cmState().versions[ch] || []; return a[a.length - 1] || null; };
const cmOpen = r => r.st !== 'accepted';
function cmStats(list) {
  const t = list.length, ok = list.filter(r => r.st === 'accepted').length, chk = list.filter(r => r.st === 'fixed').length;
  return { t, ok, chk, left: t - ok };
}
function cmMe() {
  const c = cmState(), act = c.experts.filter(e => e.st === 'active');
  if (!act.some(e => e.id === S.ui.cmExpert)) S.ui.cmExpert = (act.find(e => e.role === 'prof') || act[0] || {}).id || null;
  return cmExpert(S.ui.cmExpert);
}
/* Уведомления докторанта: новые и возвращённые замечания, подтверждённые исправления */
function cmNotifications() {
  const c = cmState(), out = [];
  c.remarks.forEach(r => {
    if (r.st === 'fixed') return;
    const e = cmExpert(r.ex); if (!e) return;
    const title = r.st === 'accepted' ? `Исправление подтверждено · ${CM_ROLES[e.role].ru}` : r.st === 'returned' ? `Замечание возвращено · ${CM_ROLES[e.role].ru}` : `Новое замечание · ${CM_ROLES[e.role].ru}`;
    const at = r.hist[r.hist.length - 1].at;
    out.push({ key: 'cm:' + r.id, kind: 'cm', at, title, text: `${cmShortCh(r.ch)}: ${r.st === 'returned' && r.ret ? r.ret.text : r.text}`, unread: !c.seen.includes(r.id + ':' + r.st) });
  });
  return out.sort((a, b) => b.at - a.at).slice(0, 6);
}
function cmMarkSeen(id) { const c = cmState(), r = c.remarks.find(x => x.id === id); if (r && !c.seen.includes(r.id + ':' + r.st)) c.seen.push(r.id + ':' + r.st); }

/* ---------- Общие фрагменты ---------- */
function cmPill(st) { const cls = { open: 'waiting', fixed: 'progress', accepted: 'resolved', returned: 'waiting' }[st]; return `<span class="pill ${cls}">${CM_ST[st]}</span>`; }
function cmWho(e, small) { const R = CM_ROLES[e.role]; return `<span class="cm-who${small ? ' sm' : ''}" style="--rc:${R.c}"><span class="cm-ava">${ic(R.ic)}</span><span class="cm-who-t"><b class="no-i18n">${esc(e.name)}</b><span>${R.ru}</span></span></span>`; }
function cmSummaryTable() {
  const c = cmState(), rows = c.experts.filter(e => c.remarks.some(r => r.ex === e.id));
  const tot = cmStats(c.remarks), maxT = Math.max(1, ...rows.map(e => c.remarks.filter(r => r.ex === e.id).length));
  return `<table class="cm-table"><thead><tr><th>Эксперт</th><th>Замечаний</th><th>Исправлено</th><th>Осталось</th></tr></thead><tbody>${rows.map(e => {
    const s = cmStats(c.remarks.filter(r => r.ex === e.id));
    return `<tr><td><span class="cm-role-dot" style="--rc:${CM_ROLES[e.role].c}"></span>${CM_ROLES[e.role].ru}<div class="cm-bar" style="width:${Math.round(s.t / maxT * 100)}%"><i class="ok" style="flex:${s.ok}"></i><i class="chk" style="flex:${s.chk}"></i><i class="left" style="flex:${s.left - s.chk}"></i></div></td><td>${s.t}</td><td class="ok">${s.ok}</td><td class="${s.left ? 'left' : 'ok'}">${s.left}</td></tr>`;
  }).join('')}</tbody><tfoot><tr><td>Всего</td><td>${tot.t}</td><td class="ok">${tot.ok}</td><td class="${tot.left ? 'left' : 'ok'}">${tot.left}</td></tr></tfoot></table>
  <div class="road-legend cm-legend"><span><i style="background:var(--s-done)"></i>Исправлено и подтверждено</span><span><i style="background:var(--warn)"></i>На проверке у эксперта</span><span><i style="background:var(--s-todo)"></i>Нужно исправить</span></div>`;
}
function cmChaptersPanel() {
  const c = cmState();
  return panel('Главы диссертации', 'Последняя версия текста и открытые замечания', `<div class="row-list">${CM_CHAPTERS.map(ch => {
    const last = cmLatest(ch.id), rs = c.remarks.filter(r => r.ch === ch.id), left = rs.filter(cmOpen).length;
    return `<div class="cm-ch"><span class="cm-ch-ic ${!last ? 'none' : left ? 'todo' : 'done'}">${ic(!last ? 'clock' : left ? 'x' : 'check')}</span><div style="min-width:0"><div class="cm-ch-t">${esc(ch.ru)}</div><div class="mini-meta">${last ? `версия ${last.v} · ${esc(fmtD(last.at))}` : 'текст ещё не загружен'}</div></div><span class="tag ${!last ? '' : left ? 'todo' : 'done'}">${!last ? 'не начато' : left ? `открыто: ${left}` : 'замечания закрыты'}</span></div>`;
  }).join('')}</div>`, { flush: true });
}
function cmAnalysisPanel() {
  const c = cmState(), a = S.ui.cmAnalysis || c.analysis, ch = dv('cm-an-ch', 'all');
  const opts = [['all', 'Вся диссертация (последние версии)']].concat(CM_CHAPTERS.filter(x => cmLatest(x.id)).map(x => [x.id, x.ru]));
  let body = '';
  if (a && a.state === 'loading') body = `<div class="tf-empty">${ic('sparkle')}<p>ИИ анализирует текст по экспертным критериям…</p></div>`;
  else if (a && a.criteria) body = `${(a.criteria || []).map(k => { const sc = Math.max(0, Math.min(5, Math.round(+k.score || 0))); return `<div class="score-row"><div><b>${esc(k.name)}</b></div><div><div class="score-dots" aria-label="Оценка ${sc} из 5">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= sc ? 'on' : ''}"></i>`).join('')}</div><div class="hint">${sc} из 5</div></div><div class="small no-i18n"><div>${esc(k.comment || '')}</div>${k.fix ? `<div class="muted" style="margin-top:4px">${esc(k.fix)}</div>` : ''}</div></div>`; }).join('')}<div class="hint">${esc(a.scope || '')}</div>`;
  else if (a && a.note) body = `<div class="note">${ic('info')}<div>${esc(a.note)}</div></div>`;
  return panel('Предварительный ИИ-анализ по экспертным критериям', CM_CRITERIA.join(' · '), `
    <div class="toolbar"><label class="sr-only" for="cm-an-ch">Что анализировать</label><select class="select" id="cm-an-ch" style="flex:1;min-width:220px">${opts.map(([v, l]) => `<option value="${v}" ${v === ch ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select><button class="btn ai" data-act="cm-analyze" ${a && a.state === 'loading' ? 'disabled' : ''}>${ic('sparkle')} Проанализировать</button></div>
    ${body}
    <div class="note brass">${ic('info')}<div>ИИ даёт только предварительный анализ. Решение о допуске к защите и присуждении степени принимают эксперты и диссертационный совет.</div></div>`, { stack: true });
}
function cmAiBlock(r) {
  if (!r.ai) return '';
  if (r.ai.state === 'loading') return `<div class="cm-ai"><div class="cm-ai-h">${ic('sparkle')} ИИ разбирает замечание…</div></div>`;
  return `<div class="cm-ai"><div class="cm-ai-h">${ic('sparkle')} ${r.ai.tpl ? 'Типовой план действий (без ИИ)' : 'ИИ объясняет замечание'}</div>${r.ai.explain ? `<p class="no-i18n">${esc(r.ai.explain)}</p>` : ''}<ol class="${r.ai.tpl ? '' : 'no-i18n'}">${(r.ai.steps || []).map(s => `<li>${esc(s)}</li>`).join('')}</ol></div>`;
}
function cmRemarkCard(r, mode) {
  const e = cmExpert(r.ex) || { name: '—', role: 'internal' };
  const last = r.hist[r.hist.length - 1];
  const fix = r.fix ? `<div class="cm-fix"><b>Исправление докторанта</b><span class="muted"> · </span><span>версия ${r.fix.v} · ${esc(fmtD(r.fix.at))}</span><p class="no-i18n">${esc(r.fix.note)}</p></div>` : '';
  const ret = r.st === 'returned' && r.ret ? `<div class="cm-ret"><b>Комментарий эксперта</b> · ${esc(fmtD(r.ret.at))}<p class="no-i18n">${esc(r.ret.text)}</p></div>` : '';
  let acts = '';
  if (mode === 'student') {
    acts = r.st === 'open' || r.st === 'returned'
      ? `<button class="btn sm ai" data-act="cm-explain" data-id="${r.id}" ${r.ai && r.ai.state === 'loading' ? 'disabled' : ''}>${ic('sparkle')} Разобрать с ИИ</button><button class="btn sm primary" data-act="cm-fix" data-id="${r.id}">${ic('check')} Отметить исправленным</button>`
      : r.st === 'fixed' ? `<span class="muted small">Эксперт проверит новую версию текста</span>` : '';
  } else if (mode === 'expert' && r.st === 'fixed') {
    acts = `<button class="btn sm primary" data-act="cm-accept" data-id="${r.id}">${ic('check')} Подтвердить исправление</button><button class="btn sm" data-act="cm-return-open" data-id="${r.id}">${ic('back')} Вернуть на доработку</button>`;
    if (S.ui.cmReturn === r.id) acts += `<div class="cm-return-form"><label class="sr-only" for="cm-ret-text">Комментарий</label><textarea class="textarea" id="cm-ret-text" data-draft="cm-ret-text" rows="2" placeholder="Что ещё нужно исправить">${esc(dv('cm-ret-text'))}</textarea><button class="btn sm danger" data-act="cm-return" data-id="${r.id}">Вернуть</button></div>`;
  }
  return `<article class="cm-remark st-${r.st}" id="cm-r-${r.id}" style="--rc:${CM_ROLES[e.role].c}">
    <div class="cm-remark-top">${mode === 'expert' ? `<button class="tag cm-tag-btn" data-act="cm-ch" data-v="${r.ch}" title="Открыть главу">${esc(cmShortCh(r.ch))}</button>` : `${cmWho(e, true)}<span class="tag">${esc(cmShortCh(r.ch))}</span>`}<span class="grow"></span>${cmPill(r.st)}</div>
    <p class="cm-text no-i18n">${esc(r.text)}</p>
    ${ret}${fix}${mode === 'student' ? cmAiBlock(r) : ''}
    <div class="cm-remark-foot"><span class="mini-meta">${esc(fmtD(r.at))}${last.st !== 'open' ? ` · ${CM_ST[last.st].toLowerCase()} ${esc(fmtD(last.at))}` : ''}</span>${acts ? `<span class="cm-acts">${acts}</span>` : ''}</div>
  </article>`;
}

/* ---------- Кабинет докторанта: Экспертная комиссия ---------- */
VIEWS.student.commission = function () {
  const c = cmState(), f = S.ui.cmFilter || 'todo', tot = cmStats(c.remarks);
  const filters = [['todo', 'Нужно исправить', r => r.st === 'open' || r.st === 'returned'], ['fixed', 'На проверке', r => r.st === 'fixed'], ['accepted', 'Исправлено', r => r.st === 'accepted'], ['all', 'Все', () => true]];
  const fx = filters.find(x => x[0] === f) || filters[0];
  const list = c.remarks.filter(fx[2]).sort((a, b) => b.hist[b.hist.length - 1].at - a.hist[a.hist.length - 1].at);
  const kpis = `<div class="kpis">${kpi('Замечаний всего', tot.t, `${c.experts.filter(e => e.st === 'active').length} экспертов с доступом`, 'clip')}${kpi('Исправлено', tot.ok, 'подтверждено экспертами', 'check')}${kpi('На проверке', tot.chk, 'ждут подтверждения эксперта', 'clock')}${kpi('Осталось', tot.left, tot.left ? 'не подтверждено' : 'все замечания закрыты', 'target', tot.left > 0)}</div>`;
  const seg = `<div class="seg" role="group" aria-label="Фильтр замечаний">${filters.map(([k, l, fn]) => `<button data-act="cm-filter" data-v="${k}" aria-pressed="${f === k}">${l} · ${c.remarks.filter(fn).length}</button>`).join('')}</div>`;
  const remarks = panel('Замечания экспертов', 'Эксперт оставляет замечание → вы исправляете и прикрепляете новую версию → эксперт подтверждает', `${seg}<div class="cm-list">${list.map(r => cmRemarkCard(r, 'student')).join('') || '<div class="empty">В этой выборке пусто</div>'}</div>`, { stack: true });
  const experts = panel('Состав комиссии и доступ', 'У каждого эксперта — индивидуальный доступ к выбранным главам', `<div class="row-list">${c.experts.map(e => `<div class="cm-ex"><div class="cm-ex-main">${cmWho(e)}<div class="cm-ex-meta"><span class="tag ${e.st === 'active' ? 'done' : ''}">${e.st === 'active' ? 'доступ активен' : 'приглашение отправлено'}</span><span class="tag mono no-i18n" title="Код доступа">${esc(e.code)}</span></div><div class="cm-ex-ch">${e.ch.map(id => `<span class="cm-chip">${esc(cmShortCh(id))}</span>`).join('')}</div></div><div class="cm-ex-acts">${e.st === 'invited' ? `<button class="btn xs" data-act="cm-accept-invite" data-id="${e.id}" title="В демоверсии эксперт принимает приглашение здесь">Принять (демо)</button>` : `<button class="btn xs" data-act="cm-as-expert" data-id="${e.id}">${ic('eye')} Как эксперт</button>`}<button class="btn xs ghost" data-act="cm-revoke" data-id="${e.id}" aria-label="Отозвать доступ">${ic('trash')}</button></div></div>`).join('')}</div>`, { flush: true, actions: `<button class="btn sm" data-act="cm-invite">${ic('plus')} Пригласить</button>` });
  return `<div class="page">${pageHead('AI Expert Commission', 'Экспертная комиссия', 'Научный руководитель, зарубежный консультант, профессора и эксперты работают с главами диссертации на одной платформе. Каждое замечание проходит путь до подтверждённого исправления.', `<button class="btn primary" data-act="cm-invite">${ic('plus')} Пригласить эксперта</button><button class="btn" data-act="cm-as-expert" data-id="">${ic('eye')} Кабинет эксперта</button>`)}
    <div class="note brass">${ic('info')}<div>ИИ объясняет замечания и предварительно анализирует текст, но не принимает решение о допуске к защите или присуждении степени — это полномочия экспертов и диссертационного совета. Эксперты, замечания и числа в демоверсии условные.</div></div>
    ${kpis}
    <div class="split cm-split"><div class="col">${remarks}${cmAnalysisPanel()}</div><div class="col">${panel('Сводка для комиссии', 'Замечания и их исправление по экспертам', cmSummaryTable())}${experts}${cmChaptersPanel()}</div></div></div>`;
};

/* ---------- Кабинет эксперта ---------- */
NAV.expert = [
  { id: 'review', ru: 'Рецензирование глав', en: 'Expert review', ic: 'pen' },
  { id: 'summary', ru: 'Сводка комиссии', en: 'Commission summary', ic: 'chart' }
];
VIEWS.expert = {};
VIEWS.expert.review = function () {
  const c = cmState(), me = cmMe(), p = S.me.passport;
  if (!me) return `<div class="page">${pageHead('Expert Workspace', 'Кабинет эксперта', '')}<div class="empty">Нет экспертов с активным доступом — пригласите эксперта в кабинете докторанта.</div></div>`;
  const chs = me.ch.filter(id => CM_CHAPTERS.some(x => x.id === id));
  if (!chs.includes(S.ui.cmCh)) S.ui.cmCh = chs.find(id => c.remarks.some(r => r.ex === me.id && r.ch === id && r.st === 'fixed')) || chs.find(id => cmLatest(id)) || chs[0];
  const ch = S.ui.cmCh, vers = c.versions[ch] || [], last = vers[vers.length - 1];
  const mine = c.remarks.filter(r => r.ex === me.id).sort((a, b) => (a.st === 'fixed' ? -1 : 0) - (b.st === 'fixed' ? -1 : 0) || b.at - a.at);
  const s = cmStats(mine);
  const sel = `<label class="field cm-as"><span class="field-label">Вы вошли как</span><select class="select no-i18n" id="cm-me">${c.experts.filter(e => e.st === 'active').map(e => `<option value="${e.id}" ${e.id === me.id ? 'selected' : ''}>${esc(e.name)} — ${esc(trS(CM_ROLES[e.role].ru))}</option>`).join('')}</select></label>`;
  const doc = panel('Диссертация докторанта', `${esc(p.name)} · ${esc(p.status)}, ${p.course} курс`, `
    <div class="cm-topic"><span class="muted small">Тема</span><b class="no-i18n">${esc(p.topic)}</b></div>
    <div class="cm-tabs" role="tablist">${chs.map(id => { const n = c.remarks.filter(r => r.ch === id && r.ex === me.id && r.st === 'fixed').length; return `<button role="tab" aria-selected="${id === ch}" data-act="cm-ch" data-v="${id}">${esc(cmShortCh(id))}${n ? `<span class="ni-badge">${n}</span>` : ''}</button>`; }).join('')}</div>
    <div class="cm-chapter"><div class="cm-chapter-h"><b>${esc(cmCh(ch).ru)}</b>${last ? `<span class="tag mono">v${last.v} · ${esc(fmtD(last.at))}</span>` : ''}</div>${last ? `<p class="cm-doc no-i18n">${esc(last.text)}</p>` : '<div class="empty">Докторант ещё не загрузил текст этой главы.</div>'}
      ${vers.length > 1 ? `<details class="more"><summary>Предыдущая версия · v${vers[vers.length - 2].v}</summary><p class="cm-doc old no-i18n">${esc(vers[vers.length - 2].text)}</p></details>` : ''}</div>
    <form class="cm-new" data-form="cm-remark"><label class="field"><span class="field-label">Новое замечание к главе</span><textarea class="textarea" id="cm-new" data-draft="cm-new" rows="3" placeholder="Например: необходимо уточнить критерии отбора участников исследования">${esc(dv('cm-new'))}</textarea></label><div class="toolbar"><button class="btn primary" type="submit">${ic('send')} Отправить замечание</button><span class="muted small">Докторант получит уведомление</span></div></form>`, { stack: true });
  const mineP = panel('Мои замечания', `Всего ${s.t} · исправлено ${s.ok} · осталось ${s.left}`, `<div class="cm-list">${mine.map(r => cmRemarkCard(r, 'expert')).join('') || '<div class="empty">Замечаний пока нет</div>'}</div>`, { stack: true });
  return `<div class="page">${pageHead('Expert Workspace', 'Кабинет эксперта', 'Индивидуальный доступ к главам диссертации: читайте последнюю версию, оставляйте замечания и подтверждайте исправления.', sel)}
    <div class="split cm-split"><div class="col">${doc}</div><div class="col">${mineP}</div></div></div>`;
};
VIEWS.expert.summary = function () {
  return `<div class="page">${pageHead('Commission Dashboard', 'Сводка комиссии', 'Сколько замечаний оставил каждый эксперт, сколько исправлено и сколько осталось. ИИ помогает с предварительным анализом, решения принимает комиссия.')}
    <div class="split cm-split"><div class="col">${panel('Что видит комиссия', 'Замечания и их исправление по экспертам', cmSummaryTable())}${cmAnalysisPanel()}</div><div class="col">${cmChaptersPanel()}</div></div></div>`;
};

/* ---------- Модальные окна ---------- */
MODALS['cm-fix'] = d => {
  const c = cmState(), r = c.remarks.find(x => x.id === d.id);
  if (!r) return modalShell('Замечание', '', '<div class="empty">Запись не найдена</div>', '');
  const last = cmLatest(r.ch);
  return modalShell('Отметить исправленным', `${esc(cmCh(r.ch).ru)}`, `
    <div class="note">${ic('clip')}<div class="no-i18n">${esc(r.text)}</div></div>
    <label class="field"><span class="field-label">Что исправлено</span><textarea class="textarea" id="cmf-note" data-draft="cmf-note" rows="3" placeholder="Кратко: что и где изменено">${esc(dv('cmf-note'))}</textarea></label>
    <label class="field"><span class="field-label">Новая версия текста главы${last ? ` (сейчас v${last.v})` : ''}</span><textarea class="textarea" id="cmf-text" data-draft="cmf-text" rows="8">${esc(dv('cmf-text', last ? last.text : ''))}</textarea><span class="field-hint">Сохранится как новая версия — эксперт увидит её вместе с предыдущей.</span></label>`,
    `<button class="btn" data-act="modal-close">Отмена</button><button class="btn primary" data-act="cm-fix-save" data-id="${r.id}">${ic('check')} Отправить эксперту</button>`, true);
};
MODALS['cm-invite'] = () => modalShell('Пригласить эксперта', 'Эксперт получит индивидуальный код доступа к выбранным главам', `
  <label class="field"><span class="field-label">Имя и учёная степень</span><input class="input" id="cmi-name" data-draft="cmi-name" value="${esc(dv('cmi-name'))}" placeholder="Например: д.п.н., профессор …"></label>
  <label class="field"><span class="field-label">Роль в комиссии</span><select class="select" id="cmi-role">${Object.entries(CM_ROLES).map(([k, v]) => `<option value="${k}" ${dv('cmi-role', 'internal') === k ? 'selected' : ''}>${v.ru}</option>`).join('')}</select></label>
  <fieldset class="cm-fs"><legend class="field-label">Доступ к главам</legend>${CM_CHAPTERS.map(ch => `<label class="check"><input type="checkbox" id="cmi-ch-${ch.id}" ${dv('cmi-ch-' + ch.id, true) ? 'checked' : ''}> ${esc(ch.ru)}</label>`).join('')}</fieldset>
  <div class="note">${ic('info')}<div>Доступ членов диссертационного совета предоставляется в соответствии с официальными процедурами университета.</div></div>`,
  `<button class="btn" data-act="modal-close">Отмена</button><button class="btn primary" data-act="cm-invite-save">${ic('send')} Отправить приглашение</button>`);

/* ---------- ИИ ---------- */
async function cmExplain(id) {
  const c = cmState(), r = c.remarks.find(x => x.id === id);
  if (!r) return;
  const e = cmExpert(r.ex), last = cmLatest(r.ch);
  const tpl = () => ({ tpl: true, explain: '', steps: [L3('Найдите в главе фрагмент, к которому относится замечание.', 'Ескерту қатысты тараудағы үзіндіні табыңыз.', 'Find the passage in the chapter that the remark refers to.'), L3('Сформулируйте, что требует эксперт: уточнить, добавить, переписать или обосновать.', 'Сарапшының не талап ететінін анықтаңыз: нақтылау, қосу, қайта жазу немесе негіздеу.', 'Decide what the expert is asking for: clarify, add, rewrite or justify.'), L3('Внесите правку и проверьте связанные разделы: задачи, выводы, таблицы.', 'Түзету енгізіп, байланысты бөлімдерді тексеріңіз: міндеттер, қорытындылар, кестелер.', 'Make the change and check related sections: aims, conclusions, tables.'), L3('Кратко опишите для эксперта, что и где изменено.', 'Сарапшыға не және қай жерде өзгергенін қысқаша сипаттаңыз.', 'Briefly describe for the expert what was changed and where.'), L3('Прикрепите новую версию текста и отметьте замечание исправленным.', 'Мәтіннің жаңа нұсқасын тіркеп, ескертуді түзетілді деп белгілеңіз.', 'Attach the new version of the text and mark the remark as fixed.')] });
  if (!(await aiReady())) { r.ai = tpl(); persist(); renderMain(); return; }
  r.ai = { state: 'loading' }; renderMain();
  const lang = LANG === 'kk' ? 'казахском' : LANG === 'en' ? 'английском' : 'русском';
  try {
    const out = await aiJson(`Ты — научный консультант докторанта. Эксперт (${CM_ROLES[e.role].ru}) оставил замечание к разделу «${cmCh(r.ch).ru}»:
«${r.text}»${r.st === 'returned' && r.ret ? `\nЭксперт вернул исправление с комментарием: «${r.ret.text}»` : ''}
Фрагмент текста раздела: «${last ? last.text.slice(0, 3000) : 'текст не загружен'}»
Объясни простыми словами, что требует эксперт (2–3 предложения), и предложи последовательность из 3–6 конкретных действий для устранения замечания. Не придумывай публикации, авторов, DOI и результаты исследований. Пиши на ${lang} языке.
Ответь только JSON: {"explain":"...","steps":["...","..."]}`, { tier: 'quick', cache: false });
    if (!out || !Array.isArray(out.steps)) throw { code: 'invalid_json' };
    r.ai = { explain: String(out.explain || ''), steps: out.steps.map(String).slice(0, 8) };
  } catch (err) { aiFail(err); r.ai = Object.assign(tpl(), { explain: aiErrorText(err) }); }
  persist(); renderMain();
}
async function cmAnalyze() {
  const ch = dv('cm-an-ch', 'all');
  const parts = (ch === 'all' ? CM_CHAPTERS : [cmCh(ch)]).map(x => [x, cmLatest(x.id)]).filter(x => x[1]);
  if (!parts.length) { toast('Нет текста для анализа'); return; }
  const scope = L3(`Проанализировано: ${ch === 'all' ? 'вся диссертация (последние версии глав)' : cmCh(ch).ru}.`, `Талданды: ${ch === 'all' ? 'бүкіл диссертация (тараулардың соңғы нұсқалары)' : cmCh(ch).ru}.`, `Analysed: ${ch === 'all' ? 'the whole dissertation (latest chapter versions)' : cmCh(ch).ru}.`);
  if (!(await aiReady())) { S.ui.cmAnalysis = { note: L3('ИИ недоступен в этом просмотре — откройте демоверсию в приложении Claude. Остальные функции комиссии работают без ИИ.', 'Бұл көріністе ЖИ қолжетімсіз — демонұсқаны Claude қосымшасында ашыңыз. Комиссияның басқа функциялары ЖИ-сіз жұмыс істейді.', 'AI is unavailable in this view — open the demo in the Claude app. Other commission features work without AI.') }; renderMain(); return; }
  S.ui.cmAnalysis = { state: 'loading' }; renderMain();
  const lang = LANG === 'kk' ? 'казахском' : LANG === 'en' ? 'английском' : 'русском';
  try {
    const out = await aiJson(`Ты — член экспертной комиссии предварительной защиты. Тема диссертации: «${S.me.passport.topic}».
Проанализируй текст по четырём критериям: ${CM_CRITERIA.map(x => `«${x}»`).join(', ')}. Для каждого: оценка от 1 до 5, комментарий в 1–2 предложения по существу текста и конкретная рекомендация.
Не принимай и не формулируй решение о допуске к защите. Не придумывай публикации, авторов, DOI и результаты. Названия критериев оставь как есть, остальное пиши на ${lang} языке.
Ответь только JSON: {"criteria":[{"name":"Научная новизна","score":3,"comment":"...","fix":"..."}]}

Текст:
${parts.map(([x, v]) => `${x.ru} (версия ${v.v})\n${v.text}`).join('\n\n').slice(0, 14000)}`, { tier: 'default', cache: false });
    if (!out || !Array.isArray(out.criteria)) throw { code: 'invalid_json' };
    S.ui.cmAnalysis = { criteria: out.criteria.slice(0, 6), scope };
    cmState().analysis = S.ui.cmAnalysis;
  } catch (err) { aiFail(err); S.ui.cmAnalysis = { note: aiErrorText(err) || L3('Не удалось получить ответ ИИ. Попробуйте ещё раз.', 'ЖИ жауабын алу мүмкін болмады. Қайталап көріңіз.', 'Couldn’t get an AI response. Please try again.') }; }
  persist(); renderMain();
}

/* ---------- Действия ---------- */
const CM_ACT = {
  'cm-filter': el => { S.ui.cmFilter = el.dataset.v; renderMain(); },
  'cm-explain': el => cmExplain(el.dataset.id),
  'cm-fix': el => { clearDrafts('cmf-'); cmMarkSeen(el.dataset.id); openModal('cm-fix', { id: el.dataset.id }); },
  'cm-fix-save': el => {
    const c = cmState(), r = c.remarks.find(x => x.id === el.dataset.id);
    if (!r) return;
    const note = String(dv('cmf-note')).trim(), last = cmLatest(r.ch), text = String(dv('cmf-text', last ? last.text : '')).trim();
    if (!note) { toast('Опишите, что исправлено'); return; }
    if (!text) { toast('Добавьте текст новой версии'); return; }
    const vers = c.versions[r.ch] = c.versions[r.ch] || [];
    let v = last ? last.v : 0;
    if (!last || last.text !== text) { v += 1; vers.push({ v, at: Date.now(), text }); }
    r.st = 'fixed'; r.fix = { note, v, at: Date.now() }; r.hist.push({ st: 'fixed', at: Date.now() }); r.ai = r.ai && r.ai.state === 'loading' ? null : r.ai;
    clearDrafts('cmf-'); closeModal(); persist(); render(); toast('Исправление отправлено эксперту на проверку');
  },
  'cm-invite': () => { clearDrafts('cmi-'); openModal('cm-invite'); },
  'cm-invite-save': () => {
    const name = String(dv('cmi-name')).trim(), role = dv('cmi-role', 'internal');
    const ch = CM_CHAPTERS.filter(x => dv('cmi-ch-' + x.id, true)).map(x => x.id);
    if (!name) { toast('Укажите имя эксперта'); return; }
    if (!ch.length) { toast('Выберите хотя бы одну главу'); return; }
    const c = cmState();
    c.experts.push({ id: uid('ex'), role, name, st: 'invited', code: 'EXP-' + String(1000 + Math.floor(Math.random() * 9000)), ch, at: Date.now() });
    clearDrafts('cmi-'); closeModal(); persist(); renderMain(); toast('Приглашение с кодом доступа отправлено');
  },
  'cm-accept-invite': el => { const e = cmExpert(el.dataset.id); if (e) { e.st = 'active'; persist(); renderMain(); toast('Эксперт принял приглашение — доступ активен'); } },
  'cm-revoke': el => {
    const c = cmState(), e = cmExpert(el.dataset.id);
    if (!e) return;
    if (c.remarks.some(r => r.ex === e.id && cmOpen(r))) { toast('У эксперта есть незакрытые замечания — сначала завершите их'); return; }
    c.experts = c.experts.filter(x => x.id !== e.id); persist(); renderMain(); toast('Доступ эксперта отозван');
  },
  'cm-as-expert': el => { if (el.dataset.id) S.ui.cmExpert = el.dataset.id; S.ui.cmCh = null; go('expert', 'review'); },
  'cm-ch': el => { S.ui.cmCh = el.dataset.v; S.ui.cmReturn = null; renderMain(); },
  'cm-accept': el => {
    const r = cmState().remarks.find(x => x.id === el.dataset.id);
    if (!r) return;
    r.st = 'accepted'; r.hist.push({ st: 'accepted', at: Date.now() }); persist(); render(); toast('Исправление подтверждено — докторант получит уведомление');
  },
  'cm-return-open': el => { S.ui.cmReturn = S.ui.cmReturn === el.dataset.id ? null : el.dataset.id; renderMain(); },
  'cm-return': el => {
    const r = cmState().remarks.find(x => x.id === el.dataset.id), text = String(dv('cm-ret-text')).trim();
    if (!r) return;
    if (!text) { toast('Напишите, что ещё нужно исправить'); return; }
    r.st = 'returned'; r.ret = { text, at: Date.now() }; r.hist.push({ st: 'returned', at: Date.now() });
    S.ui.cmReturn = null; S.ui.drafts['cm-ret-text'] = ''; persist(); render(); toast('Замечание возвращено на доработку');
  },
  'cm-analyze': () => cmAnalyze()
};
function cmSubmitRemark() {
  const me = cmMe(), text = String(dv('cm-new')).trim();
  if (!me) return;
  if (!text) { toast('Напишите замечание'); return; }
  const now = Date.now();
  cmState().remarks.push({ id: uid('r'), ex: me.id, ch: S.ui.cmCh, at: now, st: 'open', text, fix: null, ret: null, ai: null, hist: [{ st: 'open', at: now }] });
  S.ui.drafts['cm-new'] = ''; persist(); render(); toast('Замечание отправлено — докторант получил уведомление');
}
