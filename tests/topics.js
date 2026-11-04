// AI Topic Finder, цвета разделов, статусы и меню без прокрутки.
const path = require('path');
const { chromium } = require('playwright');
const PAGE = 'file://' + path.resolve(__dirname, '../dist/index.html');
const fail = [];
const check = (ok, msg) => { if (!ok) fail.push(msg); console.log((ok ? 'ok   ' : 'FAIL ') + msg); };
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
  await page.goto(PAGE + '#topics');
  await page.waitForTimeout(400);

  const navIds = await page.$$eval('a.nav-item', els => els.map(e => e.dataset.view));
  check(navIds[1] === 'topics', 'AI Topic Finder — второй пункт меню: ' + navIds.join(','));
  check(await page.$eval('.app', e => e.dataset.sec) === 'topics', 'у раздела свой цветовой профиль');
  check(await page.$$eval('.tf-row', e => e.length) === 42, 'в базе 42 утверждённые темы');

  await page.click('[data-act="tf-passport"]');
  await page.click('[data-act="tf-run"]');
  await page.waitForTimeout(200);
  const cards = await page.$$eval('.tf-results .tf-card', e => e.length);
  check(cards >= 1 && cards <= 4, 'подобрано от 1 до 4 тем: ' + cards);
  check(await page.$$eval('.tf-results .tf-card .tf-block', e => e.length) === cards * 4, 'у каждой темы объект, предмет, новизна и статистика');

  await page.fill('#tf-q', 'инклюзия аутизм родители');
  await page.click('[data-act="tf-run"]');
  await page.waitForTimeout(200);
  const first = await page.$eval('.tf-results .tf-card .tf-title', e => e.textContent);
  check(/аутизм/i.test(first), 'подбор по ключевым словам: ' + first.slice(0, 60));

  await page.selectOption('#tf-year', '2021');
  await page.waitForTimeout(200);
  check(await page.$$eval('.tf-row', e => e.length) === 3, 'фильтр по учебному году 2021–2022');
  await page.click('.tf-row');
  await page.waitForTimeout(200);
  check(await page.$$eval('.tf-card.is-sel', e => e.length) === 1, 'выбранная тема из базы показана карточкой');

  await page.click('[data-act="tf-ai"]');
  await page.waitForTimeout(400);
  check(await page.$$eval('.tf-results .note', e => e.length) === 1, 'без ИИ показано понятное сообщение');

  await page.click('.tf-card [data-act="tf-lit"]');
  await page.waitForTimeout(250);
  check(await page.evaluate(() => S.view.student === 'search' && !!S.ui.search.q), 'кнопка «Литература» открывает поиск по предмету темы');

  // Статусы: выполненное — зелёным, невыполненное — красным
  await page.evaluate(() => go('student', 'planner'));
  await page.waitForTimeout(200);
  const col = sel => page.$eval(sel, e => getComputedStyle(e).borderLeftColor);
  check(await col('.ms.done') !== await col('.ms.todo'), 'этапы планера: выполненные и невыполненные разного цвета');
  await page.evaluate(() => go('student', 'roadmap'));
  await page.waitForTimeout(200);
  check(await page.$$eval('.road.done', e => e.length) === 3 && await page.$$eval('.road.todo', e => e.length) === 5, 'дорожная карта: 3 реализовано, 5 нет');

  // Шапка каждого раздела в своём цвете
  const accents = new Set();
  for (const v of ['passport', 'topics', 'search', 'library', 'assistant', 'planner', 'prompts', 'roadmap']) {
    await page.evaluate(x => go('student', x), v);
    await page.waitForTimeout(80);
    accents.add(await page.$eval('.hero-ic', e => getComputedStyle(e).boxShadow));
  }
  check(accents.size === 8, 'восемь разделов — восемь цветов: ' + accents.size);

  // Меню без прокрутки: на компьютере и на телефоне
  check(await page.$eval('.nav', e => e.scrollHeight <= e.clientHeight + 1), 'меню на компьютере помещается без прокрутки');
  await page.setViewportSize({ width: 390, height: 800 });
  await page.waitForTimeout(200);
  check(await page.$eval('.nav', e => e.scrollWidth <= e.clientWidth + 1), 'меню на телефоне — плитками, без горизонтальной прокрутки');
  check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'страница на телефоне не шире экрана');

  // С ИИ (имитация): собственные формулировки
  const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p2 = await ctx2.newPage();
  p2.on('pageerror', e => errors.push(e.message));
  await p2.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
  await p2.addInitScript({ path: path.resolve(__dirname, 'mock.js') });
  await p2.goto(PAGE + '#topics');
  await p2.waitForTimeout(500);
  await p2.click('[data-act="tf-passport"]');
  await p2.click('[data-act="tf-ai"]');
  await p2.waitForTimeout(600);
  check(await p2.$$eval('.tf-card.tf-ai', e => e.length) === 1, 'ИИ сформулировал вариант темы с гипотезой');
  check(await p2.$$eval('.tf-card.tf-ai .tf-hyp', e => e.length) === 1, 'в варианте ИИ есть гипотеза');
  await ctx2.close();

  check(errors.length === 0, 'ошибок на странице нет ' + errors.join('; '));
  await browser.close();
  if (fail.length) { console.log(fail.length + ' проверок не прошло'); process.exit(1); }
  console.log('topics: все проверки пройдены');
})();
