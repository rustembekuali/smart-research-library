const path = require('path');
const fs = require('fs');
const PAGE = 'file://' + path.resolve(__dirname, '../dist/index.html');
const SHOTS = path.resolve(__dirname, '../shots');
fs.mkdirSync(SHOTS, { recursive: true });
const { chromium } = require('playwright');
// Тема: по умолчанию дневная (даже при тёмной системной теме), вечерняя вручную, авто — по времени суток
(async () => {
  const browser = await chromium.launch();
  const out = {}, errors = [];
  const theme = p => p.evaluate(() => [document.documentElement.getAttribute('data-theme'), getComputedStyle(document.body).backgroundColor]);

  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(e.message));
  await page.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
  await page.goto(PAGE);
  await page.waitForTimeout(300);
  out.defaultOnDarkSystem = await theme(page);
  out.buttons = await page.locator('.theme-switch button').evaluateAll(b => b.map(x => [x.dataset.v, x.getAttribute('aria-pressed')]));
  await page.screenshot({ path: SHOTS + '/theme-day.png' });
  await page.click('.theme-switch [data-v="evening"]');
  await page.waitForTimeout(150);
  out.evening = await theme(page);
  await page.screenshot({ path: SHOTS + '/theme-evening.png' });
  await page.reload(); await page.waitForTimeout(300);
  out.eveningAfterReload = await theme(page);
  await page.click('.theme-switch [data-v="day"]');
  await page.waitForTimeout(150);
  out.backToDay = await theme(page);
  await ctx.close();

  for (const [label, iso] of [['auto14', '2026-11-04T14:00:00'], ['auto21', '2026-11-04T21:00:00'], ['auto0630', '2026-11-04T06:30:00']]) {
    const c = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await c.addInitScript(() => { try { localStorage.setItem('srl-theme', 'auto'); } catch (e) { } });
    const p = await c.newPage();
    p.on('pageerror', e => errors.push(e.message));
    await p.clock.install({ time: new Date(iso) });
    await p.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
    await p.goto(PAGE);
    await p.waitForTimeout(300);
    out[label] = await theme(p);
    if (label === 'auto21') {
      await p.screenshot({ path: SHOTS + '/theme-auto-mobile-evening.png' });
      out.mobileOverflow = await p.evaluate(() => [...document.querySelectorAll('.topbar *')].filter(e => e.getBoundingClientRect().right > window.innerWidth + 1).length);
      await p.clock.runFor(10 * 60 * 60 * 1000); // до 07:00 следующего дня
      await p.waitForTimeout(100);
      out.autoNextMorning = await theme(p);
    }
    await c.close();
  }
  console.log(JSON.stringify(out, null, 1));
  console.log('ERRORS', errors);
  await browser.close();
})();
