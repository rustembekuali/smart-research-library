// Переключение языка интерфейса: ҚАЗ → ENG → РУС, чат и обращение на каждом языке.
const path = require('path');
const { chromium } = require('playwright');
const PAGE = 'file://' + path.resolve(__dirname, '../dist/index.html');
const fail = [];
const check = (ok, msg) => { if (!ok) fail.push(msg); console.log((ok ? 'ok   ' : 'FAIL ') + msg); };
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
  await page.goto(PAGE);
  await page.waitForTimeout(400);
  const nav = () => page.$$eval('a.nav-item .ni-ru', els => els.map(e => e.textContent.trim()).filter(Boolean).join(' | '));
  const ruNav = await nav();

  // Чат на русском: вопрос вне базы знаний → обращение
  await page.click('a.nav-item[data-view="assistant"]');
  await page.fill('#chat-input', 'Есть ли у ЕНУ доступ к базе ERIC для поиска по педагогике?');
  await page.press('#chat-input', 'Enter');
  await page.waitForTimeout(700);
  const btns = await page.$$('.msg.bot [data-act="escalate"]');
  await btns[btns.length - 1].click();
  await page.waitForTimeout(150);
  await page.click('[data-act="esc-send"]');
  await page.waitForTimeout(400);

  const text = () => page.$eval('main', e => e.innerText);
  for (const [lang, expect] of [
    ['en', ['Hello,', 'The approved knowledge base has no answer', 'sent to library staff', 'The reply will appear in your request history']],
    ['kk', ['Сәлеметсіз бе,', 'Бекітілген білім базасында', 'кітапхана қызметкеріне жіберілді', 'Жауап өтініштер тарихында']],
    ['ru', ['Здравствуйте,', 'В утверждённой базе знаний пока нет ответа', 'передано сотруднику библиотеки', 'Ответ появится в истории обращений']]
  ]) {
    await page.click(`.lang-switch [data-v="${lang}"]`);
    await page.waitForTimeout(250);
    const t = await text();
    for (const s of expect) check(t.includes(s), `${lang}: «${s}»`);
    check(await page.evaluate(() => document.documentElement.lang) === lang, `${lang}: <html lang>`);
    check(await page.$eval(`.lang-switch [data-v="${lang}"]`, b => b.getAttribute('aria-pressed')) === 'true', `${lang}: кнопка нажата`);
  }
  check(await nav() === ruNav, 'ru: навигация вернулась к русскому оригиналу');

  // Язык сохраняется после перезагрузки
  await page.click('.lang-switch [data-v="en"]');
  await page.reload();
  await page.waitForTimeout(400);
  const enNav = await nav();
  check(!/[А-Яа-яЁё]/.test(enNav), 'en после перезагрузки: навигация без кириллицы — ' + enNav);
  // Выпадающие списки сохраняют значения
  await page.click('a.nav-item[data-view="search"]');
  await page.waitForTimeout(200);
  const opt = await page.$$eval('select option', os => os.filter(o => /[А-Яа-яЁё]/.test(o.textContent)).length);
  check(opt === 0, 'en: варианты в списках переведены');
  await page.click('.lang-switch [data-v="ru"]');

  check(errors.length === 0, 'ошибок на странице нет ' + errors.join('; '));
  await browser.close();
  if (fail.length) { console.log(fail.length + ' проверок не прошло'); process.exit(1); }
  console.log('i18n: все проверки пройдены');
})();
