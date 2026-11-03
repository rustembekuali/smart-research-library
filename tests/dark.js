const path = require('path');
const fs = require('fs');
const PAGE = 'file://' + path.resolve(__dirname, '../dist/index.html');
const SHOTS = path.resolve(__dirname, '../shots');
fs.mkdirSync(SHOTS, { recursive: true });
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
  await page.goto(PAGE + '#staff-overview');
  await page.waitForTimeout(400);
  console.log('role/view', await page.evaluate(() => [S.role, S.view.staff]));
  await page.screenshot({ path: SHOTS + '/dark-overview.png' });
  await page.goto(PAGE + '#passport');
  await page.waitForTimeout(300);
  await page.screenshot({ path: SHOTS + '/dark-passport.png' });
  // persistence: save a pub, reload, check
  await page.evaluate(() => { ACT['save-pub']({ dataset: { id: 'c02' } }); });
  await page.waitForTimeout(400);
  await page.reload(); await page.waitForTimeout(300);
  console.log('persisted c02', await page.evaluate(() => S.me.library.some(x => x.pid === 'c02')));
  console.log('errors', errors);
  await browser.close();
})();
