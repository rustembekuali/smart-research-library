/* =====================================================================
   9. Charts (single series: accent mark, text in text tokens, hover tooltips)
   ===================================================================== */
function barChartSVG(rows, aria) {
  const W = 620, labelW = 214, rowH = 32, barH = 14, padR = 44;
  const H = rows.length * rowH + 6;
  const max = Math.max(1, ...rows.map(r => r.v));
  const sx = v => (W - labelW - padR) * v / max;
  let g = `<line class="gl" x1="${labelW}" y1="0" x2="${labelW}" y2="${H - 2}"/>`;
  rows.forEach((r, i) => {
    const y = i * rowH + (rowH - barH) / 2 + 2, w = Math.max(2, sx(r.v)), rr = Math.min(4, w / 2);
    const d = `M${labelW},${y}h${(w - rr).toFixed(1)}a${rr},${rr} 0 0 1 ${rr},${rr}v${barH - 2 * rr}a${rr},${rr} 0 0 1 -${rr},${rr}h-${(w - rr).toFixed(1)}z`;
    g += `<text class="cat" x="${labelW - 10}" y="${y + barH / 2}" text-anchor="end" dominant-baseline="central">${esc(r.label)}</text>`;
    g += `<rect class="hit" x="0" y="${i * rowH}" width="${W}" height="${rowH}" tabindex="0" data-tip="${esc(r.label)}" data-tipv="${esc(r.tip || r.v)}" aria-label="${esc(r.label)}: ${r.v}"/>`;
    g += `<path class="bar" d="${d}"/>`;
    g += `<text class="val" x="${labelW + w + 6}" y="${y + barH / 2}" dominant-baseline="central">${r.v}</text>`;
  });
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(aria)}">${g}</svg></div>`;
}
function lineChartSVG(pts, aria) {
  const W = 620, H = 230, pl = 34, pr = 46, pt = 16, pb = 30;
  const max = niceMax(Math.max(1, ...pts.map(p => p.v)));
  const x = i => pl + (W - pl - pr) * i / Math.max(1, pts.length - 1);
  const y = v => pt + (H - pt - pb) * (1 - v / max);
  let g = '';
  [0, max / 2, max].forEach(t => { g += `<line class="gl" x1="${pl}" x2="${W - pr + 8}" y1="${y(t)}" y2="${y(t)}"/><text class="tick" x="${pl - 8}" y="${y(t)}" text-anchor="end" dominant-baseline="central">${t}</text>`; });
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join('');
  g += `<path class="area" d="${line}L${x(pts.length - 1).toFixed(1)},${y(0)}L${x(0)},${y(0)}Z"/><path class="line" d="${line}"/>`;
  const colW = (W - pl - pr) / Math.max(1, pts.length - 1);
  pts.forEach((p, i) => {
    g += `<text class="tick" x="${x(i)}" y="${H - 8}" text-anchor="middle">${esc(p.label)}</text>`;
    g += `<rect class="hit" x="${(x(i) - colW / 2).toFixed(1)}" y="${pt}" width="${colW.toFixed(1)}" height="${H - pt - pb}" tabindex="0" data-tip="${esc(p.tip)}" data-tipv="${p.v} ${plural(p.v, 'обращение', 'обращения', 'обращений')}" aria-label="${esc(p.tip)}: ${p.v}"/><line class="xh" x1="${x(i)}" x2="${x(i)}" y1="${pt}" y2="${H - pb}"/>`;
  });
  const li = pts.length - 1;
  g += `<circle class="dot" cx="${x(li)}" cy="${y(pts[li].v)}" r="4.5"/><text class="val" x="${x(li) + 9}" y="${y(pts[li].v)}" dominant-baseline="central">${pts[li].v}</text>`;
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(aria)}">${g}</svg></div>`;
}
function tableToggle(k) { return `<button class="btn xs ghost" data-act="chart-table" data-k="${k}" aria-pressed="${!!S.ui.chartTable[k]}">${ic(S.ui.chartTable[k] ? 'chart' : 'table')} ${S.ui.chartTable[k] ? 'График' : 'Таблица'}</button>`; }
function dataTable(head, rows) { return `<table class="data-table"><thead><tr>${head.map((h, i) => `<th class="${i ? 'num' : ''}">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((c, i) => `<td class="${i ? 'num' : ''}">${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`; }

/* =====================================================================
   10. Staff views
   ===================================================================== */
function kpi(label, value, sub, icon, attn) { return `<div class="kpi ${attn ? 'attn' : ''}"><div class="kpi-label">${ic(icon)}${esc(label)}</div><div class="kpi-value">${esc(value)}</div><div class="kpi-sub">${esc(sub)}</div></div>`; }
VIEWS.staff.overview = function () {
  const A = analytics();
  const oldest = A.waiting.length ? Math.min(...A.waiting.map(t => t.createdAt)) : 0;
  const kpis = `<div class="kpis">${kpi('Ожидают ответа', A.waiting.length, A.waiting.length ? `самое раннее — ${ago(oldest)}` : 'очередь пуста', 'inbox', A.waiting.length > 0)}${kpi('В работе', A.progress.length, `решено за 30 дней: ${A.resolved30.length}`, 'clock')}${kpi('Среднее время первого ответа', A.avg ? dur(A.avg) : '—', `по ${A.answeredN} ${plural(A.answeredN, 'обращению', 'обращениям', 'обращениям')} с ответом`, 'refresh')}${kpi('Ответы бота без сотрудника', Math.round(A.botShare * 100) + '%', `${A.bot.kb} из ${A.bot.asked} вопросов закрыты базой знаний`, 'database')}</div>`;
  const catChart = S.ui.chartTable.cats ? dataTable(['Категория', 'Обращений'], A.cats.map(c => [c.label, c.v])) : barChartSVG(A.cats, 'Обращения по категориям');
  const weekPts = A.weeks.map(w => ({ v: w.v, label: fmtDS(w.start), tip: `Неделя с ${fmtD(w.start)}` }));
  const weekChart = S.ui.chartTable.weeks ? dataTable(['Неделя', 'Обращений'], weekPts.map(p => [p.tip, p.v]).concat([[`Текущая неделя с ${fmtD(A.thisWeek.start)} (идёт)`, A.thisWeek.v]])) : lineChartSVG(weekPts, 'Обращения по неделям');
  const topMax = Math.max(1, ...A.top.map(t => t.v));
  const top = `<table class="data-table"><thead><tr><th>Вопрос</th><th>Категория</th><th class="num">Ответов</th><th style="width:22%"><span class="sr-only">Доля</span></th></tr></thead><tbody>${A.top.map(t => `<tr><td><button class="link-btn" data-act="kb-edit" data-id="${esc(t.e.id)}">${esc(t.e.q)}</button></td><td class="muted small">${esc(t.e.cat)}</td><td class="num">${t.v}</td><td><div class="meter"><span style="width:${(t.v / topMax * 100).toFixed(1)}%"></span></div></td></tr>`).join('')}</tbody></table>`;
  const queue = A.waiting.slice().sort((a, b) => a.createdAt - b.createdAt).slice(0, 5);
  return `<div class="page">${pageHead('Library Staff Dashboard', 'Кабинет сотрудника библиотеки', 'Обращения магистрантов и докторантов, база знаний виртуального библиотекаря и аналитика запросов — решения на основе реальных потребностей исследователей.', `<button class="btn primary" data-act="nav" data-view="tickets">${ic('inbox')} Открыть обращения</button>`)}
    ${kpis}
    <div class="split half">
      ${panel('Обращения по категориям', 'За 8 недель и текущую неделю', catChart, { actions: tableToggle('cats'), foot: 'Источник: демо-статистика пилотного периода и обращения, созданные в этой демоверсии.' })}
      ${panel('Динамика обращений', 'Новые обращения за завершённые недели', weekChart, { actions: tableToggle('weeks'), foot: `Восемь завершённых недель. Текущая неделя ещё идёт: ${A.thisWeek.v} ${plural(A.thisWeek.v, 'обращение', 'обращения', 'обращений')} с ${fmtD(A.thisWeek.start)}.` })}
    </div>
    <div class="split">
      ${panel('Частые вопросы к виртуальному библиотекарю', 'Сколько раз ассистент ответил по записи базы знаний', top, { flush: true })}
      ${panel('Требуют ответа', 'Самые ранние обращения в очереди', queue.length ? `<div class="row-list">${queue.map(t => `<button class="trow" data-act="tk-open" data-id="${t.id}"><span class="stripe ${t.status}"></span><span style="min-width:0;display:block"><span class="t-top"><span class="t-num">№${t.num}</span><span class="tag">${esc(t.cat)}</span></span><span class="t-q">${esc(t.q)}</span><span class="t-meta" style="display:block">${esc(t.author.name)} · ${esc(ago(t.createdAt))}</span></span></button>`).join('')}</div>` : '<div class="empty">Все вопросы получили ответ</div>', { flush: true })}
    </div></div>`;
};

const STATUS_ORDER = { waiting: 0, progress: 1, resolved: 2 };
function threadMsg(m) {
  if (m.from === 'system') return `<div class="tmsg system">${esc(m.text)} · ${esc(fmtDT(m.at))}</div>`;
  return `<div class="tmsg ${m.from === 'staff' ? 'staff' : ''}"><div class="tmsg-head"><b>${esc(m.from === 'staff' ? (m.name || 'Библиотекарь') : (m.name || 'Пользователь'))}</b><span>${esc(fmtDT(m.at))}</span></div><div class="tmsg-body">${esc(m.text)}</div></div>`;
}
function ticketDetail(t) {
  const thread = threadOf(t.id);
  const hits = kbSearch(t.q).filter(r => r.score >= 0.3).slice(0, 2);
  const a = t.author || {};
  const hasStaff = thread.some(m => m.from === 'staff');
  return `<section class="panel"><div class="panel-head"><div style="min-width:0">${S.ui.mobileDetail ? `<button class="btn xs ghost mobile-only" data-act="tk-back">${ic('back')} К списку</button>` : ''}<div class="t-top"><span class="t-num">№${t.num}</span><span class="pill ${t.status}">${STATUS[t.status]}</span><span class="muted small">${esc(fmtDT(t.createdAt))}</span></div><h2 style="margin-top:6px">${esc(t.cat)}</h2></div>
    <div class="toolbar">${t.status === 'waiting' ? `<button class="btn sm" data-act="tk-take" data-id="${t.id}">${ic('clock')} Взять в работу</button>` : ''}${t.status !== 'resolved' ? `<button class="btn sm ok" data-act="tk-resolve" data-id="${t.id}">${ic('check')} Отметить решённым</button>` : ''}</div></div>
    <div class="panel-body stack">
      <div class="person"><div class="avatar">${esc(initials(a.name))}</div><div style="min-width:0"><div style="font-weight:600">${esc(a.name || 'Пользователь')}</div><div class="person-meta">${esc(a.status || '')}${a.course ? `, ${a.course} курс` : ''}${a.spec ? ` · ${esc(a.spec)}` : ''}</div>${a.topic ? `<div class="person-meta">Тема: ${esc(a.topic)}</div>` : ''}</div></div>
      <div class="field" style="max-width:340px"><label for="tk-cat-${t.id}">Категория обращения</label><select class="select" id="tk-cat-${t.id}" data-tkcat="${t.id}">${CATEGORIES.map(c => `<option ${c === t.cat ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></div>
      <div class="thread">${thread.map(threadMsg).join('')}</div>
      ${hits.length ? `<div class="note">${ic('database')}<div style="flex:1;min-width:0"><b>Подсказки из базы знаний</b>${hits.map(r => `<div class="kb-hint"><span>${esc(r.e.q)}</span><button class="btn xs" data-act="tk-insert-kb" data-id="${t.id}" data-kb="${esc(r.e.id)}">Вставить в ответ</button></div>`).join('')}</div></div>` : ''}
      <div class="field"><label for="reply-${t.id}">Ответ пользователю</label><textarea class="textarea" id="reply-${t.id}" data-draft="reply-${t.id}" rows="5" placeholder="Ответ сразу появится у пользователя в истории обращений">${esc(dv('reply-' + t.id))}</textarea></div>
      <div class="toolbar"><button class="btn primary" data-act="tk-reply" data-id="${t.id}">${ic('send')} Ответить</button><button class="btn" data-act="tk-reply-close" data-id="${t.id}">${ic('check')} Ответить и закрыть</button><button class="btn ai" data-act="tk-ai" data-id="${t.id}" ${S.ui.tkAiBusy || AI.state === 'off' ? 'disabled' : ''} title="${AI.state === 'off' ? 'ИИ недоступен в этом просмотре' : 'ИИ составит черновик по базе знаний'}">${ic('sparkle')} ${S.ui.tkAiBusy ? 'ИИ пишет…' : 'Черновик ИИ'}</button><div class="grow"></div>${hasStaff ? `<button class="btn ghost" data-act="tk-to-kb" data-id="${t.id}">${ic('database')} Добавить ответ в базу знаний</button>` : ''}</div>
    </div></section>`;
}
VIEWS.staff.tickets = function () {
  const f = S.ui.tk, allT = all('tickets');
  let list = allT.slice();
  if (f.status === 'open') list = list.filter(t => t.status !== 'resolved'); else if (f.status !== 'all') list = list.filter(t => t.status === f.status);
  if (f.cat !== 'all') list = list.filter(t => t.cat === f.cat);
  const q = (dv('tk-q') || '').toLowerCase().trim();
  if (q) list = list.filter(t => `${t.q} ${t.author && t.author.name} ${t.num}`.toLowerCase().includes(q));
  list.sort((a, b) => (STATUS_ORDER[a.status] - STATUS_ORDER[b.status]) || (a.status === 'resolved' ? (b.resolvedAt || b.updatedAt) - (a.resolvedAt || a.updatedAt) : a.createdAt - b.createdAt));
  if (!f.sel || !byId('tickets', f.sel)) f.sel = (list[0] || allT[0] || {}).id || null;
  const sel = f.sel ? byId('tickets', f.sel) : null;
  const cnt = s => s === 'open' ? allT.filter(t => t.status !== 'resolved').length : s === 'all' ? allT.length : allT.filter(t => t.status === s).length;
  const tabs = [['open', 'Открытые'], ['waiting', 'Ожидают'], ['progress', 'В работе'], ['resolved', 'Решено'], ['all', 'Все']];
  const listPanel = `<section class="panel"><div class="panel-body stack"><div class="chips" role="group" aria-label="Статус">${tabs.map(([k, l]) => `<button class="chip-btn" data-act="tk-status" data-v="${k}" aria-pressed="${f.status === k}">${l} · ${cnt(k)}</button>`).join('')}</div>
    <div class="toolbar"><label class="sr-only" for="tk-cat">Категория</label><select class="select inline" id="tk-cat"><option value="all">Все категории</option>${CATEGORIES.map(c => `<option ${f.cat === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select><label class="sr-only" for="tk-q">Поиск по обращениям</label><input class="input" id="tk-q" data-draft="tk-q" data-live="1" type="search" placeholder="Поиск: текст, имя, номер" value="${esc(dv('tk-q'))}" style="flex:1;min-width:140px"></div></div>
    <div class="row-list tk-list">${list.map(t => `<button class="trow" data-act="tk-sel" data-id="${t.id}" aria-current="${t.id === f.sel}"><span class="stripe ${t.status}"></span><span style="min-width:0;display:block"><span class="t-top"><span class="t-num">№${t.num}</span><span class="pill ${t.status}">${STATUS[t.status]}</span></span><span class="t-q">${esc(t.q)}</span><span class="t-meta" style="display:block">${esc(t.cat)} · ${esc(t.author ? t.author.name : '')} · ${esc(ago(t.createdAt))}</span></span></button>`).join('') || '<div class="empty">Нет обращений по фильтру</div>'}</div></section>`;
  return `<div class="page">${pageHead('Library Staff Dashboard · Обращения', 'Обращения пользователей', 'Вопросы, которые виртуальный библиотекарь передал сотрудникам. Ответ сразу появляется у пользователя в истории обращений, а типовой ответ можно добавить в базу знаний.')}
    <div class="tk-split ${S.ui.mobileDetail ? 'show-detail' : ''}"><div class="tk-list-col">${listPanel}</div><div class="tk-detail-col">${sel ? ticketDetail(sel) : panel('Обращение', '', '<div class="empty">Выберите обращение слева</div>')}</div></div></div>`;
};

VIEWS.staff.kb = function () {
  const f = S.ui.kb, entries = all('kb');
  const q = (dv('kb-q') || '').toLowerCase().trim();
  const list = entries.filter(e => (f.cat === 'all' || e.cat === f.cat) && (f.status === 'all' || (e.status || 'approved') === f.status) && (!q || `${e.q} ${e.keys || ''} ${e.a}`.toLowerCase().includes(q)))
    .sort((a, b) => ((a.status === 'draft') === (b.status === 'draft') ? 0 : a.status === 'draft' ? -1 : 1) || (b.updated || 0) - (a.updated || 0));
  const approved = entries.filter(e => (e.status || 'approved') === 'approved').length;
  const views = S.local.stats.views || {};
  const rows = list.map(e => `<button class="kb-row" data-act="kb-edit" data-id="${esc(e.id)}"><span style="min-width:0;display:block"><span class="kb-q">${esc(e.q)}</span><span class="t-meta" style="display:block">${esc(e.cat)} · ${(e.src || []).length} ${plural((e.src || []).length, 'источник', 'источника', 'источников')} · обновлено ${esc(fmtD(e.updated || Date.now()))}</span></span><span class="kb-side"><span class="pill ${(e.status || 'approved') === 'approved' ? 'approved' : 'draft'}">${(e.status || 'approved') === 'approved' ? 'Подтверждено' : 'Черновик'}</span><span class="muted small nowrap">${(e.views || 0) + (views[e.id] || 0)} отв.</span></span></button>`).join('');
  return `<div class="page">${pageHead('Library Staff Dashboard · База знаний', 'База знаний', `Утверждённые инструкции, на которые опирается виртуальный библиотекарь: ${approved} подтверждено из ${entries.length}. Черновики не попадают в ответы, пока сотрудник их не подтвердит.`, `<button class="btn primary" data-act="kb-new">${ic('plus')} Новая запись</button>`)}
    <section class="panel"><div class="panel-body stack"><div class="toolbar"><label class="sr-only" for="kb-q">Поиск по базе знаний</label><input class="input" id="kb-q" data-draft="kb-q" data-live="1" type="search" placeholder="Поиск по вопросам и ответам" value="${esc(dv('kb-q'))}" style="flex:1;min-width:200px"><label class="sr-only" for="kb-cat">Категория</label><select class="select inline" id="kb-cat"><option value="all">Все категории</option>${KB_CATEGORIES.map(c => `<option ${f.cat === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select><div class="seg" role="group" aria-label="Статус">${[['all', 'Все'], ['approved', 'Подтверждённые'], ['draft', 'Черновики']].map(([k, l]) => `<button data-act="kb-status" data-v="${k}" aria-pressed="${f.status === k}">${l}</button>`).join('')}</div></div></div>
    <div class="row-list">${rows || '<div class="empty">Записей не найдено</div>'}</div></section></div>`;
};

VIEWS.staff.events = function () {
  const now = Date.now();
  const evs = all('events').slice().sort((a, b) => a.at - b.at);
  const up = evs.filter(e => e.at > now), past = evs.filter(e => e.at <= now);
  const slots = all('slots').slice().sort((a, b) => a.at - b.at).filter(s => s.at > now - DAY);
  const booked = slots.filter(s => s.bookedBy).length;
  return `<div class="page">${pageHead('Library Staff Dashboard · Обучение', 'Мероприятия и консультации', 'Обучающие семинары по научным базам и инструментам, онлайн-консультации со специалистами. Пользователи записываются из своего кабинета.', `<button class="btn" data-act="slot-new">${ic('plus')} Слот консультации</button><button class="btn primary" data-act="ev-new">${ic('plus')} Мероприятие</button>`)}
    <div class="split">
      ${panel('Обучающие мероприятия', `${up.length} ${plural(up.length, 'предстоящее', 'предстоящих', 'предстоящих')}`, `<div class="row-list">${up.map(e => eventRow(e, true)).join('') || '<div class="empty">Мероприятий нет</div>'}</div>${past.length ? `<details class="more"><summary>Прошедшие · ${past.length}</summary><div class="row-list">${past.map(e => eventRow(e, true)).join('')}</div></details>` : ''}`, { flush: true, foot: 'Счётчик мест учитывает демо-записи и записи, сделанные в этой демоверсии.' })}
      ${panel('Онлайн-консультации', `${booked} из ${slots.length} слотов занято`, `<div class="row-list">${slots.map(s => `<div class="slot"><div style="min-width:0"><div class="slot-when">${fmtWD(s.at)}, ${esc(fmtD(s.at))}, ${fmtT(s.at)} · ${s.mins} мин</div><div class="slot-topic">${esc(s.topic)}</div><div class="mini-meta">${esc(s.who)}${s.bookedBy ? ` · записан(а): ${esc(s.bookedName || 'пользователь')}` : ''}</div></div><div class="toolbar">${s.bookedBy ? '<span class="pill progress">Занято</span>' : '<span class="pill approved">Свободно</span>'}<button class="btn xs ghost" data-act="slot-del" data-id="${s.id}" aria-label="Удалить слот">${ic('trash')}</button></div></div>`).join('') || '<div class="empty">Слотов нет</div>'}</div>`, { flush: true })}
    </div></div>`;
};

VIEWS.staff.resources = function () {
  const res = all('resources'), notes = all('notices').slice().sort((a, b) => b.at - a.at);
  const AUD = { all: 'Все пользователи', phd: 'Докторанты', ma: 'Магистранты' };
  return `<div class="page">${pageHead('Library Staff Dashboard · Ресурсы', 'Ресурсы и уведомления', 'Перечень научных ресурсов, который видят пользователи, и рассылка уведомлений магистрантам и докторантам.', `<button class="btn primary" data-act="res-new">${ic('plus')} Ресурс</button>`)}
    <div class="split">
      ${panel('Научные ресурсы', 'Показываются в кабинете исследователя и используются в ответах', `<div class="row-list">${res.map(r => `<div class="res-row"><div style="min-width:0"><div class="mini-title"><a href="${esc(safeUrl(r.url) || '#')}" target="_blank" rel="noopener">${esc(r.name)}</a></div><div class="mini-meta">${esc(r.kind)} · ${esc(r.note)}</div></div><div class="toolbar"><label class="check small"><input type="checkbox" data-res-show="${esc(r.id)}" ${r.show !== false ? 'checked' : ''}> Видно</label><button class="btn xs ghost" data-act="res-edit" data-id="${esc(r.id)}" aria-label="Изменить ${esc(r.name)}">${ic('edit')}</button></div></div>`).join('')}</div>`, { flush: true, foot: 'Источник списка подписок: сайт lib.enu.kz, раздел «Ресурсы по национальной подписке МНВО РК».' })}
      <div class="col">
        ${panel('Новое уведомление', 'Появится у пользователей в колокольчике', `<form class="stack-sm" data-form="notice"><div class="field"><label for="nt-title">Заголовок</label><input class="input" id="nt-title" data-draft="nt-title" value="${esc(dv('nt-title'))}" placeholder="Например: открыта запись на вебинар"></div><div class="field"><label for="nt-text">Текст</label><textarea class="textarea" id="nt-text" data-draft="nt-text" rows="3">${esc(dv('nt-text'))}</textarea></div><div class="field"><label for="nt-aud">Кому</label><select class="select" id="nt-aud">${Object.entries(AUD).map(([k, v]) => `<option value="${k}" ${dv('nt-aud', 'all') === k ? 'selected' : ''}>${v}</option>`).join('')}</select></div><div><button class="btn primary" type="submit">${ic('send')} Отправить</button></div></form>`, { stack: true })}
        ${panel('Отправленные', `${notes.length}`, `<div class="row-list">${notes.map(n => `<div class="entry"><div class="entry-head"><span>${esc(fmtDT(n.at))} · ${esc(AUD[n.audience] || '')}</span><button class="btn xs ghost" data-act="notice-del" data-id="${esc(n.id)}" aria-label="Удалить уведомление">${ic('trash')}</button></div><div class="entry-title">${esc(n.title)}</div><div class="entry-text">${esc(n.text)}</div></div>`).join('') || '<div class="empty">Уведомлений нет</div>'}</div>`, { flush: true })}
      </div></div></div>`;
};

/* =====================================================================
   11. Modals
   ===================================================================== */
function openModal(type, data = {}) { S.ui.modal = Object.assign({ type, fresh: true }, data); S.ui.bell = false; renderTop(); renderModal(); }
function closeModal() { if (S.ui.modalCtl) { try { S.ui.modalCtl.abort(); } catch (e) { } S.ui.modalCtl = null; } S.ui.modal = null; renderModal(); }
function modalShell(title, sub, body, foot, wide) {
  return `<div class="modal-overlay" data-act="modal-bg"><div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-head"><div style="min-width:0"><h2 id="modal-title">${title}</h2>${sub ? `<div class="sub">${sub}</div>` : ''}</div><button class="icon-btn" data-act="modal-close" aria-label="Закрыть">${ic('x')}</button></div><div class="modal-body">${body}</div>${foot ? `<div class="modal-foot">${foot}</div>` : ''}</div></div>`;
}
const MODALS = {};
function renderModal() {
  const root = document.getElementById('modal-root');
  if (!root) return;
  const m = S.ui.modal;
  if (!m) { root.innerHTML = ''; return; }
  const st = captureFocus();
  const fn = MODALS[m.type];
  root.innerHTML = fn ? fn(m) : '';
  if (m.fresh) {
    m.fresh = false;
    const first = root.querySelector('[data-autofocus]') || root.querySelector('.modal-body input, .modal-body textarea, .modal-body select') || root.querySelector('.modal button');
    if (first) try { first.focus({ preventScroll: true }); } catch (e) { }
  } else restoreFocus(st);
}

MODALS['pp-edit'] = () => {
  const p = S.me.passport;
  const v = (k, d) => dv('pe-' + k, d);
  const orc = v('orcid', p.orcid);
  const body = `<div class="form-grid">
    <div class="field full"><label for="pe-name">ФИО</label><input class="input" id="pe-name" data-draft="pe-name" value="${esc(v('name', p.name))}"></div>
    <div class="field"><label for="pe-status">Статус</label><select class="select" id="pe-status">${['Магистрант', 'Докторант'].map(s => `<option ${v('status', p.status) === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
    <div class="field"><label for="pe-course">Курс</label><select class="select" id="pe-course">${[1, 2, 3].map(c => `<option ${String(v('course', p.course)) === String(c) ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
    <div class="field full"><label for="pe-spec">Научная специальность</label><select class="select" id="pe-spec">${SPECIALTIES.map(s => `<option ${v('spec', p.spec) === s ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select></div>
    <div class="field full"><label for="pe-topic">Тема диссертации</label><textarea class="textarea" id="pe-topic" data-draft="pe-topic" rows="2">${esc(v('topic', p.topic))}</textarea></div>
    <div class="field"><label for="pe-sup">Научный руководитель</label><input class="input" id="pe-sup" data-draft="pe-sup" value="${esc(v('sup', p.sup))}"></div>
    <div class="field"><label for="pe-cons">Зарубежный консультант</label><input class="input" id="pe-cons" data-draft="pe-cons" value="${esc(v('cons', p.cons))}"></div>
    <div class="field"><label for="pe-orcid">ORCID</label><input class="input mono" id="pe-orcid" data-draft="pe-orcid" value="${esc(orc)}" placeholder="0000-0000-0000-0000"><span class="hint" id="orcid-hint">${orc ? (orcidValid(orc) ? 'Контрольная цифра верна' : 'Проверьте номер: контрольная цифра не совпадает') : '16 цифр, последняя может быть X'}</span></div>
    <div class="field"><label for="pe-defense">Планируемая защита</label><input class="input" type="month" id="pe-defense" data-draft="pe-defense" value="${esc(v('defense', p.defense))}"></div>
    <div class="field full"><label for="pe-interests">Научные интересы</label><input class="input" id="pe-interests" data-draft="pe-interests" value="${esc(v('interests', (p.interests || []).join(', ')))}"><span class="hint">Через запятую — по ним подбираются публикации, журналы и мероприятия</span></div>
    <div class="field full"><label for="pe-pubs">Публикации</label><textarea class="textarea" id="pe-pubs" data-draft="pe-pubs" rows="3">${esc(v('pubs', (p.pubs || []).join('\n')))}</textarea><span class="hint">Каждая публикация с новой строки</span></div>
    <div class="field full"><label for="pe-projects">Научные проекты</label><textarea class="textarea" id="pe-projects" data-draft="pe-projects" rows="2">${esc(v('projects', (p.projects || []).join('\n')))}</textarea></div>
  </div><div class="note">${ic('lock')}<div>Видимость каждого поля для других исследователей настраивается значком глаза в паспорте.</div></div>`;
  return modalShell('Научный паспорт', 'Данные используются для рекомендаций и научного плана', body, `<button class="btn ghost" data-act="modal-close">Отмена</button><button class="btn primary" data-act="pp-save">${ic('check')} Сохранить</button>`, true);
};
MODALS.escalate = () => {
  const cat = dv('esc-cat', 'Другие вопросы');
  const body = `<div class="field"><label for="esc-cat">Категория обращения</label><select class="select" id="esc-cat">${CATEGORIES.map(c => `<option ${c === cat ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select><span class="hint">Пример: ${esc(CAT_EXAMPLES[cat] || '')}</span></div>
    <div class="field"><label for="esc-q">Вопрос</label><textarea class="textarea" id="esc-q" data-draft="esc-q" rows="5" data-autofocus placeholder="Опишите вопрос: какой ресурс, что пробовали, что не получилось">${esc(dv('esc-q'))}</textarea></div>
    <label class="check"><input type="checkbox" id="esc-attach" ${dv('esc-attach', true) ? 'checked' : ''}> Приложить данные научного паспорта: статус, курс, специальность и тему — библиотекарю будет проще ответить</label>
    <div class="steps" aria-label="Статусы обращения"><span class="step cur"><span class="sd"></span>Ожидает ответа</span><span class="step-line"></span><span class="step"><span class="sd"></span>В работе</span><span class="step-line"></span><span class="step"><span class="sd"></span>Решено</span></div>`;
  return modalShell('Задать вопрос библиотекарю', 'Ответ придёт в историю обращений и в уведомления', body, `<button class="btn ghost" data-act="modal-close">Отмена</button><button class="btn primary" data-act="esc-send">${ic('send')} Отправить библиотекарю</button>`);
};
MODALS.ticket = m => {
  const t = byId('tickets', m.id);
  if (!t) return modalShell('Обращение', '', '<div class="empty">Обращение не найдено</div>', '');
  const thread = threadOf(t.id);
  const step = s => STATUS_ORDER[t.status] > STATUS_ORDER[s] ? 'done' : t.status === s ? (s === 'resolved' ? 'done' : 'cur') : '';
  const body = `<div class="steps" aria-label="Статус обращения"><span class="step ${step('waiting')}"><span class="sd"></span>Ожидает ответа</span><span class="step-line ${STATUS_ORDER[t.status] > 0 ? 'done' : ''}"></span><span class="step ${step('progress')}"><span class="sd"></span>В работе</span><span class="step-line ${t.status === 'resolved' ? 'done' : ''}"></span><span class="step ${step('resolved')}"><span class="sd"></span>Решено</span></div>
    <div class="thread">${thread.map(threadMsg).join('')}</div>
    <div class="field"><label for="tf-${t.id}">${t.status === 'resolved' ? 'Остался вопрос? Напишите — обращение откроется снова' : 'Дополнить обращение'}</label><textarea class="textarea" id="tf-${t.id}" data-draft="tf-${t.id}" rows="3">${esc(dv('tf-' + t.id))}</textarea></div>`;
  return modalShell(`Обращение №${t.num}`, `${esc(t.cat)} · создано ${esc(fmtDT(t.createdAt))}`, body, `${t.status !== 'resolved' ? `<button class="btn ok" data-act="t-solved" data-id="${t.id}">${ic('check')} Вопрос решён</button>` : ''}<div class="grow"></div><button class="btn ghost" data-act="modal-close">Закрыть</button><button class="btn primary" data-act="t-follow" data-id="${t.id}">${ic('send')} Отправить</button>`, true);
};
MODALS['kb-view'] = m => {
  const e = byId('kb', m.id);
  if (!e) return modalShell('Запись базы знаний', '', '<div class="empty">Запись не найдена</div>', '');
  return modalShell(esc(e.q), `${esc(e.cat)} · подтверждено библиотекой · обновлено ${esc(fmtD(e.updated || Date.now()))}`, `<div class="md">${md(e.a)}</div>${(e.src || []).length ? `<div class="answer-src">${(e.src || []).map(srcOf).filter(Boolean).map(srcTag).join('')}</div>` : ''}`, `<button class="btn ghost" data-act="modal-close">Закрыть</button>`);
};
MODALS['kb-edit'] = m => {
  const e = m.id ? byId('kb', m.id) : null;
  const v = (k, d) => dv('ke-' + k, d);
  const srcs = (S.ui.kbSrc || []).map(srcOf).filter(Boolean);
  const body = `${m.fromTicket ? `<div class="note">${ic('info')}<div style="flex:1">Заготовка из обращения №${esc(String(m.fromNum || ''))}. Обобщите вопрос и уберите личные детали — запись увидят все пользователи.</div>${AI.state !== 'off' ? `<button class="btn sm ai" data-act="kb-ai" ${S.ui.kbAiBusy ? 'disabled' : ''}>${ic('sparkle')} ${S.ui.kbAiBusy ? 'Обобщаю…' : 'Обобщить с ИИ'}</button>` : ''}</div>` : ''}
    <div class="form-grid"><div class="field"><label for="ke-cat">Категория</label><select class="select" id="ke-cat">${KB_CATEGORIES.map(c => `<option ${v('cat', e ? e.cat : 'Электронные ресурсы') === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></div>
    <div class="field"><label for="ke-status">Статус</label><select class="select" id="ke-status"><option value="approved" ${v('status', e ? (e.status || 'approved') : 'approved') === 'approved' ? 'selected' : ''}>Подтверждено — используется ассистентом</option><option value="draft" ${v('status', e ? e.status : '') === 'draft' ? 'selected' : ''}>Черновик — не используется</option></select></div>
    <div class="field full"><label for="ke-q">Вопрос</label><input class="input" id="ke-q" data-draft="ke-q" value="${esc(v('q', e ? e.q : ''))}"></div>
    <div class="field full"><label for="ke-keys">Ключевые слова для поиска</label><input class="input" id="ke-keys" data-draft="ke-keys" value="${esc(v('keys', e ? e.keys : ''))}"><span class="hint">Разные формы слов и названия сервисов — так ассистент найдёт запись при любой формулировке</span></div>
    <div class="field full"><label for="ke-a">Ответ</label><textarea class="textarea" id="ke-a" data-draft="ke-a" rows="8">${esc(v('a', e ? e.a : ''))}</textarea><span class="hint">Шаги с новой строки: «1. …», «2. …»; пункты списка — «• …»</span></div>
    <div class="field full"><span class="label">Источники</span><div class="chips">${srcs.map((s, i) => `<span class="term">${esc(s.t)}<button data-act="ke-src-del" data-i="${i}" aria-label="Убрать источник">${ic('x')}</button></span>`).join('') || '<span class="hint">Источников нет</span>'}</div></div>
    <div class="field"><label for="ke-st">Новый источник: название</label><input class="input" id="ke-st" data-draft="ke-st" value="${esc(v('st', ''))}"></div>
    <div class="field"><label for="ke-su">Ссылка</label><input class="input" id="ke-su" data-draft="ke-su" value="${esc(v('su', ''))}" placeholder="https://"></div></div>`;
  return modalShell(e ? 'Запись базы знаний' : 'Новая запись базы знаний', e ? `Ответов по записи: ${(e.views || 0) + ((S.local.stats.views || {})[e.id] || 0)}` : 'Подтверждённые записи сразу использует виртуальный библиотекарь', body,
    `${e ? `<button class="btn danger ghost" data-act="kb-del" data-id="${esc(e.id)}">${ic('trash')} Удалить</button>` : ''}<div class="grow"></div><button class="btn ghost" data-act="modal-close">Отмена</button><button class="btn primary" data-act="kb-save">${ic('check')} Сохранить</button>`, true);
};
MODALS.prompt = m => {
  const P = PROMPTS.find(p => p.id === m.id);
  if (!P) return '';
  const vars = promptVars(P), fav = (S.me.favPrompts || []).includes(P.id);
  const fields = vars.map(vn => {
    const def = PROMPT_VARS[vn] || { label: vn }, key = `pv-${P.id}-${vn}`, val = promptVal(P, vn);
    if (def.options) return `<div class="field"><label for="${key}">${esc(def.label)}</label><select class="select" id="${key}">${def.options.map(o => `<option ${val === o ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></div>`;
    if (def.area) return `<div class="field full"><label for="${key}">${esc(def.label)}</label><textarea class="textarea" id="${key}" data-draft="${key}" data-live-prompt="${P.id}" rows="5" placeholder="${esc(def.ph || 'Вставьте текст')}">${esc(val)}</textarea></div>`;
    return `<div class="field full"><label for="${key}">${esc(def.label)}${def.from ? ' <span class="tag accent">из паспорта</span>' : ''}</label><input class="input" id="${key}" data-draft="${key}" data-live-prompt="${P.id}" value="${esc(val)}"${def.ph ? ` placeholder="${esc(def.ph)}"` : ''}></div>`;
  }).join('');
  const filled = fillPrompt(P);
  const out = S.ui.promptOut[P.id];
  const busy = out && (out.state === 'loading' || out.state === 'streaming');
  const copyOnly = !!(P.att || P.chain);
  const preview = esc(filled).replace(/\{\{([^}]+)\}\}/g, '<mark>{{$1}}</mark>');
  const chainNote = P.chain ? `<div class="note">${ic('info')}<div>Это шаг цепочки ${esc(P.cat)}: ведите все шаги в одном чате с ИИ, начиная с мастер-промпта.${P.att ? ` Приложите к сообщению: ${esc(P.att)}.` : ''}</div></div>` : P.att ? `<div class="note">${ic('info')}<div>Приложите к сообщению: ${esc(P.att)}.</div></div>` : '';
  const exBar = P.ex ? `<div class="toolbar"><button class="btn xs" data-act="p-example" data-id="${P.id}">${ic('sparkle')} ${esc(P.ex.label)}</button><span class="hint">Журнал и данные исследования укажите сами</span></div>` : '';
  const body = `<p class="small muted">${esc(P.desc)}</p>${chainNote}${exBar}${fields ? `<div class="form-grid">${fields}</div>` : ''}<div class="field"><span class="label">Готовый промпт</span><div class="tpl" id="p-preview">${preview}</div></div>
    ${out ? `<div class="divider"></div><div class="field"><span class="label">Ответ ИИ</span>${out.state === 'loading' ? '<div class="thinking">ИИ думает…</div>' : `<div class="md ${out.state === 'streaming' ? 'streaming' : ''}" id="p-out">${md(out.text)}</div>`}${out.note ? `<div class="hint">${esc(out.note)}</div>` : ''}${out.truncated ? '<div class="hint">Ответ сокращён — попросите меньше за один раз.</div>' : ''}</div>` : ''}`;
  const runBtn = copyOnly ? '' : busy ? `<button class="btn" data-act="p-stop">${ic('stop')} Остановить</button>` : `<button class="btn ai" data-act="p-run" data-id="${P.id}" ${AI.state === 'off' ? 'disabled title="ИИ недоступен в этом просмотре"' : ''}>${ic('sparkle')} Запустить с ИИ</button>`;
  return modalShell(esc(P.title), `${esc(P.cat)} · AI Prompt Library`, body, `<button class="btn ghost" data-act="p-favtoggle" data-id="${P.id}">${ic('star')} ${fav ? 'Убрать из избранного' : 'В избранное'}</button><div class="grow"></div><button class="btn ${copyOnly ? 'primary' : ''}" data-act="copy" data-text="${esc(filled)}" id="p-copy">${ic('copy')} Копировать</button>${runBtn}`, true);
};
MODALS.report = () => {
  const text = S.ui.reportText != null ? S.ui.reportText : monthlyReport();
  const busy = S.ui.reportBusy;
  return modalShell('Ежемесячный отчёт', 'Собран из плана, встреч с руководителем, дневника и обращений', `<pre class="codebox tall" id="report-out">${esc(text)}</pre>${S.ui.reportNote ? `<div class="hint">${esc(S.ui.reportNote)}</div>` : ''}`,
    `<button class="btn ai" data-act="report-ai" ${busy || AI.state === 'off' ? 'disabled' : ''}>${ic('sparkle')} ${busy ? 'ИИ редактирует…' : 'Улучшить формулировки (ИИ)'}</button><div class="grow"></div><button class="btn ghost" data-act="modal-close">Закрыть</button><button class="btn primary" data-act="copy" data-text="${esc(text)}">${ic('copy')} Скопировать</button>`, true);
};
MODALS['ev-new'] = () => {
  const d = startOfDay(Date.now()) + 10 * DAY + 15 * HOUR;
  const body = `<div class="form-grid"><div class="field full"><label for="ev-title">Название</label><input class="input" id="ev-title" data-draft="ev-title" value="${esc(dv('ev-title'))}" placeholder="Например: Web of Science для гуманитариев"></div>
    <div class="field"><label for="ev-at">Дата и время</label><input class="input" type="datetime-local" id="ev-at" data-draft="ev-at" value="${esc(dv('ev-at', dtInput(d)))}"></div>
    <div class="field"><label for="ev-format">Формат</label><select class="select" id="ev-format">${['Онлайн', 'Очно'].map(f => `<option ${dv('ev-format', 'Онлайн') === f ? 'selected' : ''}>${f}</option>`).join('')}</select></div>
    <div class="field"><label for="ev-place">Место или ссылка</label><input class="input" id="ev-place" data-draft="ev-place" value="${esc(dv('ev-place', 'Ссылка придёт в уведомлении'))}"></div>
    <div class="field"><label for="ev-seats">Мест</label><input class="input" type="number" min="1" id="ev-seats" data-draft="ev-seats" value="${esc(dv('ev-seats', '30'))}"></div>
    <div class="field full"><label for="ev-tags">Темы для рекомендаций</label><input class="input" id="ev-tags" data-draft="ev-tags" value="${esc(dv('ev-tags'))}" placeholder="scopus поиск систематические обзоры"><span class="hint">По ним мероприятие подбирается пользователям в научном паспорте</span></div>
    <label class="check full"><input type="checkbox" id="ev-notify" ${dv('ev-notify', true) ? 'checked' : ''}> Отправить уведомление всем пользователям</label></div>`;
  return modalShell('Новое мероприятие', 'Появится в кабинетах пользователей', body, `<button class="btn ghost" data-act="modal-close">Отмена</button><button class="btn primary" data-act="ev-save">${ic('check')} Опубликовать</button>`);
};
MODALS['slot-new'] = () => {
  const d = startOfDay(Date.now()) + 3 * DAY + 11 * HOUR;
  const body = `<div class="form-grid"><div class="field"><label for="sl-at">Дата и время</label><input class="input" type="datetime-local" id="sl-at" data-draft="sl-at" value="${esc(dv('sl-at', dtInput(d)))}"></div>
    <div class="field"><label for="sl-mins">Длительность</label><select class="select" id="sl-mins">${['30', '45', '60'].map(x => `<option value="${x}" ${dv('sl-mins', '30') === x ? 'selected' : ''}>${x} мин</option>`).join('')}</select></div>
    <div class="field full"><label for="sl-topic">Тема</label><input class="input" id="sl-topic" data-draft="sl-topic" value="${esc(dv('sl-topic'))}" placeholder="Например: поиск диссертаций и авторефератов"></div>
    <div class="field full"><label for="sl-who">Специалист</label><input class="input" id="sl-who" data-draft="sl-who" value="${esc(dv('sl-who', 'Библиограф-консультант'))}"></div></div>`;
  return modalShell('Слот онлайн-консультации', 'Пользователи смогут записаться из кабинета', body, `<button class="btn ghost" data-act="modal-close">Отмена</button><button class="btn primary" data-act="slot-save">${ic('check')} Добавить</button>`);
};
MODALS['res-edit'] = m => {
  const r = m.id ? byId('resources', m.id) : null;
  const v = (k, d) => dv('re-' + k, d);
  const kinds = ['Национальная подписка МНВО РК', 'Ресурс ЕНУ', 'Открытый доступ', 'Тестовый доступ'];
  const body = `<div class="form-grid"><div class="field full"><label for="re-name">Название</label><input class="input" id="re-name" data-draft="re-name" value="${esc(v('name', r ? r.name : ''))}"></div>
    <div class="field"><label for="re-kind">Тип доступа</label><select class="select" id="re-kind">${kinds.map(k => `<option ${v('kind', r ? r.kind : kinds[0]) === k ? 'selected' : ''}>${esc(k)}</option>`).join('')}</select></div>
    <div class="field"><label for="re-url">Ссылка</label><input class="input" id="re-url" data-draft="re-url" value="${esc(v('url', r ? r.url : 'https://'))}"></div>
    <div class="field full"><label for="re-note">Как получить доступ</label><input class="input" id="re-note" data-draft="re-note" value="${esc(v('note', r ? r.note : ''))}"></div></div>`;
  return modalShell(r ? 'Научный ресурс' : 'Новый научный ресурс', 'Пользователи видят ресурс в кабинете исследователя', body, `${r ? `<button class="btn danger ghost" data-act="res-del" data-id="${esc(r.id)}">${ic('trash')} Удалить</button>` : ''}<div class="grow"></div><button class="btn ghost" data-act="modal-close">Отмена</button><button class="btn primary" data-act="res-save">${ic('check')} Сохранить</button>`);
};
MODALS.about = () => {
  const body = `<p>Интеллектуальная платформа научно-информационного сопровождения магистрантов и докторантов. Объединяет три направления: научную библиотеку, исследовательские ИИ-инструменты и цифровое взаимодействие с библиотекарями.</p>
    <dl class="kv"><dt>Қазақша</dt><dd>Smart Research Library 1.0: Магистранттар мен докторанттарды ғылыми-ақпараттық сүйемелдеуге арналған жасанды интеллект платформасы</dd><dt>Русский</dt><dd>Smart Research Library 1.0: интеллектуальная платформа научно-информационного сопровождения магистрантов и докторантов</dd><dt>English</dt><dd>Smart Research Library 1.0: An AI-Powered Research Support Platform for Master’s and Doctoral Students</dd></dl>
    <div class="note brass">${ic('star')}<div><b>Главное преимущество.</b> ИИ ищет, анализирует и систематизирует научную информацию, а сотрудники библиотеки ЕНУ подтверждают ответы и решают вопросы, которым нужен специалист.</div></div>
    <div class="note">${ic('info')}<div>Демоверсия конкурсного проекта, не официальный сервис ЕНУ. Люди, обращения и мероприятия — демо-данные. Сведения о подписках — с сайта lib.enu.kz; публикации в каталоге — реальные работы с DOI. ${Live.state === 'live' ? 'Обращения, база знаний и мероприятия синхронизируются через общую базу.' : 'Данные демоверсии хранятся в этом браузере.'}</div></div>`;
  return modalShell('Smart Research Library 1.0', 'Проект для научной библиотеки ЕНУ им. Л. Н. Гумилёва', body, `<button class="btn ghost danger" data-act="reset-ask">${ic('reset')} Сбросить демо-данные</button><div class="grow"></div><button class="btn" data-act="scenario">${ic('play')} Сценарий показа</button><button class="btn primary" data-act="modal-close">Понятно</button>`, true);
};
MODALS['reset-ask'] = () => modalShell('Сбросить демо-данные?', '', `<p>Паспорт, библиотека, планер, чат и локальные обращения вернутся к исходному демо-состоянию на этом устройстве.${Live.state === 'live' ? ' Записи в общей базе останутся.' : ''}</p>`, `<button class="btn ghost" data-act="modal-close">Отмена</button><button class="btn primary" data-act="reset-do">${ic('reset')} Сбросить</button>`);
MODALS.scenario = () => {
  const steps = [
    ['student', 'passport', 'Научный паспорт', 'профиль, открытость полей и рекомендации по интересам.'],
    ['student', 'search', 'Поиск литературы', 'найдите «PRISMA», сохраните статью, откройте цитату по ГОСТ; соберите запрос для Scopus.'],
    ['student', 'library', 'Моя библиотека', 'коллекции, статусы чтения, список литературы в ГОСТ 7.1–2003 и анализ подборки.'],
    ['student', 'assistant', 'Виртуальный библиотекарь', 'спросите «Как получить доступ к Scopus?» — ответ с источником из базы знаний.'],
    ['student', 'assistant', 'Задать вопрос библиотекарю', 'отправьте вопрос, которого нет в базе знаний — создастся обращение со статусом «Ожидает ответа».', 'escalate'],
    ['staff', 'tickets', 'Кабинет сотрудника', 'откройте новое обращение, подготовьте черновик с ИИ, ответьте и закройте; добавьте ответ в базу знаний.'],
    ['student', 'assistant', 'Снова кабинет исследователя', 'уведомление в колокольчике, ответ и статус «Решено» в истории обращений.'],
    ['staff', 'overview', 'Аналитика', 'категории обращений, динамика по неделям и частые вопросы.'],
    ['student', 'planner', 'Научный планер и промпты', 'план по семестрам, встречи с руководителем, отчёт за месяц; затем «Библиотека промптов».']
  ];
  return modalShell('Сценарий показа', 'Около 7 минут: взаимодействие двух кабинетов — центральная часть демонстрации', `<ol class="scenario">${steps.map(([r, v, t, d, then], i) => `<li><b>${esc(t)}</b> — ${esc(d)} <button class="link-btn" data-act="goto" data-role="${r}" data-view="${v}" ${then ? `data-then="${then}"` : ''}>Перейти ${ic('arrow')}</button></li>`).join('')}</ol>${Live.state === 'live' ? '<div class="note">' + ic('info') + '<div>Общая база подключена: откройте демоверсию на втором устройстве как сотрудник — обращение появится там сразу.</div></div>' : ''}`, `<button class="btn primary" data-act="modal-close">Закрыть</button>`, true);
};
