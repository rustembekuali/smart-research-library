// AI Expert Commission: путь замечания от эксперта до подтверждённого исправления.
const path = require('path');
const { chromium } = require('playwright');
const PAGE = 'file://' + path.resolve(__dirname, '../dist/index.html');
const fail = [];
const check = (ok, msg) => { if (!ok) fail.push(msg); console.log((ok ? 'ok   ' : 'FAIL ') + msg); };
async function open(browser, mock) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.errors = [];
  page.on('pageerror', e => page.errors.push(e.message));
  await page.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
  if (mock) await page.addInitScript({ path: path.resolve(__dirname, 'mock.js') });
  await page.goto(PAGE + '#commission');
  await page.waitForTimeout(mock ? 500 : 400);
  return page;
}
const cnt = (page, sel) => page.$$eval(sel, e => e.length);
(async () => {
  const browser = await chromium.launch();
  const page = await open(browser, false);
  const kv = await page.$$eval('.kpi .kpi-value', e => e.map(x => x.textContent.trim()));
  check(kv.join(',') === '16,12,1,4', 'сводка: 16 замечаний, 12 исправлено, 1 на проверке, 4 осталось — ' + kv.join(','));
  const foot = await page.$$eval('.cm-table tfoot td', e => e.map(x => x.textContent.trim()));
  check(foot.join('|') === 'Всего|16|12|4', 'таблица комиссии: итоговая строка ' + foot.join('|'));
  check(await cnt(page, '.cm-remark') === 3, 'фильтр «Нужно исправить»: 3 замечания');
  check(await page.$eval('.nav-item[data-view="commission"] .ni-badge', e => e.textContent.trim()) === '3', 'в меню — счётчик незакрытых замечаний');
  const bell = await page.$eval('.icon-btn[data-act="bell"] .count', e => +e.textContent);

  // ИИ недоступен → типовой план
  await page.click('#cm-r-r10 [data-act="cm-explain"]');
  await page.waitForTimeout(300);
  check(await cnt(page, '#cm-r-r10 .cm-ai li') === 5, 'без ИИ — типовой план из 5 шагов');

  // Докторант исправляет замечание и прикладывает новую версию
  await page.click('#cm-r-r10 [data-act="cm-fix"]');
  await page.waitForTimeout(150);
  await page.fill('#cmf-note', 'Добавлены критерии включения и исключения участников.');
  await page.fill('#cmf-text', 'Новая версия: участники отбирались по критериям включения — обучение в докторантуре по педагогическим специальностям, согласие на участие.');
  await page.click('[data-act="cm-fix-save"]');
  await page.waitForTimeout(250);
  const r10 = await page.evaluate(() => { const c = cmState(); const r = c.remarks.find(x => x.id === 'r10'); return [r.st, r.fix && r.fix.v, c.versions.ch2.length]; });
  check(r10[0] === 'fixed' && r10[1] === 3 && r10[2] === 3, 'исправление отправлено эксперту, создана версия 3 главы 2');

  // Эксперт (профессор кафедры) проверяет и подтверждает
  await page.click('[data-act="cm-as-expert"][data-id="ex3"]');
  await page.waitForTimeout(250);
  check(await page.evaluate(() => S.role === 'expert' && document.querySelector('.cm-tabs [aria-selected="true"]').textContent.includes('2')), 'кабинет эксперта открыт на главе с исправлением');
  check(await page.$eval('.cm-doc', e => e.textContent.startsWith('Новая версия')), 'эксперт видит новую версию главы');
  check(await cnt(page, '.cm-remark.st-fixed') === 2, 'у эксперта 2 исправления на проверке');
  await page.click('#cm-r-r10 [data-act="cm-accept"]');
  await page.waitForTimeout(200);
  await page.click('#cm-r-r12 [data-act="cm-return-open"]');
  await page.fill('#cm-ret-text', 'Добавьте параметры расчёта в текст, а не только в таблицу.');
  await page.click('#cm-r-r12 [data-act="cm-return"]');
  await page.waitForTimeout(200);
  await page.fill('#cm-new', 'Уточните, как обеспечивалась анонимность ответов.');
  await page.click('form[data-form="cm-remark"] button[type="submit"]');
  await page.waitForTimeout(200);
  const st = await page.evaluate(() => { const c = cmState(); return [c.remarks.find(x => x.id === 'r10').st, c.remarks.find(x => x.id === 'r12').st, c.remarks.length, c.remarks[c.remarks.length - 1].ex]; });
  check(st[0] === 'accepted' && st[1] === 'returned' && st[2] === 17 && st[3] === 'ex3', 'эксперт подтвердил одно, вернул другое и оставил новое замечание');

  // Докторант получает уведомления
  await page.click('.role-switch [data-role="student"]');
  await page.waitForTimeout(250);
  const bell2 = await page.$eval('.icon-btn[data-act="bell"] .count', e => +e.textContent);
  check(bell2 >= bell + 2, `уведомления докторанта: было ${bell}, стало ${bell2}`);
  const kv2 = await page.$$eval('.kpi .kpi-value', e => e.map(x => x.textContent.trim()));
  check(kv2.join(',') === '17,13,0,4', 'сводка обновилась: ' + kv2.join(','));

  // Приглашение и доступ
  await page.click('.page-actions [data-act="cm-invite"]');
  await page.fill('#cmi-name', 'к.п.н. Тестовый эксперт');
  await page.uncheck('#cmi-ch-concl');
  await page.click('[data-act="cm-invite-save"]');
  await page.waitForTimeout(200);
  const inv = await page.evaluate(() => { const e = cmState().experts.slice(-1)[0]; return [e.st, e.ch.length, /^EXP-\d{4}$/.test(e.code)]; });
  check(inv[0] === 'invited' && inv[1] === 4 && inv[2], 'приглашение с кодом доступа к 4 главам');
  await page.evaluate(() => { const e = cmState().experts.slice(-1)[0]; document.querySelector(`[data-act="cm-accept-invite"][data-id="${e.id}"]`).click(); });
  await page.waitForTimeout(150);
  check(await page.evaluate(() => cmState().experts.slice(-1)[0].st) === 'active', 'эксперт принял приглашение');
  await page.evaluate(() => { const e = cmState().experts.slice(-1)[0]; document.querySelector(`[data-act="cm-revoke"][data-id="${e.id}"]`).click(); });
  await page.waitForTimeout(150);
  check(await page.evaluate(() => cmState().experts.length) === 5, 'доступ эксперта отозван');

  // Сохранение после перезагрузки
  await page.reload();
  await page.waitForTimeout(400);
  check(await page.evaluate(() => cmState().remarks.length) === 17, 'данные комиссии сохраняются после перезагрузки');
  check(page.errors.length === 0, 'ошибок на странице нет ' + page.errors.join('; '));

  // С ИИ (имитация)
  const p2 = await open(browser, true);
  await p2.click('#cm-r-r10 [data-act="cm-explain"]');
  await p2.waitForTimeout(500);
  check(await cnt(p2, '#cm-r-r10 .cm-ai li') === 3 && await p2.$eval('#cm-r-r10 .cm-ai p', e => e.textContent.includes('выборку')), 'ИИ объяснил замечание и предложил шаги');
  await p2.click('[data-act="cm-analyze"]');
  await p2.waitForTimeout(500);
  check(await cnt(p2, '.score-row') >= 1, 'ИИ-анализ по экспертным критериям показан');
  check(await cnt(p2, '.note.brass') >= 2, 'предупреждение: ИИ не принимает решение о допуске');
  check(p2.errors.length === 0, 'ошибок на странице с ИИ нет ' + p2.errors.join('; '));

  await browser.close();
  if (fail.length) { console.log(fail.length + ' проверок не прошло'); process.exit(1); }
  console.log('commission: все проверки пройдены');
})();
