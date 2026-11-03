const path = require('path');
const fs = require('fs');
const PAGE = 'file://' + path.resolve(__dirname, '../dist/index.html');
const SHOTS = path.resolve(__dirname, '../shots');
fs.mkdirSync(SHOTS, { recursive: true });
const { chromium } = require('playwright');
const MOCK = process.argv[2] === 'mock';
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message + '\n' + e.stack));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED/.test(m.text())) errors.push('console: ' + m.text()); if (m.type() === 'warning') errors.push('warn: ' + m.text()); });
  await page.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
  if (MOCK) await page.addInitScript({ path: path.resolve(__dirname, 'mock.js') });
  await page.goto(PAGE);
  await page.waitForTimeout(500);
  const tag = MOCK ? 'm' : 'l';
  const shot = (n, full) => page.screenshot({ path: `${SHOTS}/${tag}-${n}.png`, fullPage: !!full });
  const chips = await page.$$eval('.sys-chip .lbl', els => els.map(e => e.textContent));
  console.log('chips', chips);
  // Assistant: KB question
  await page.click('a.nav-item[data-view="assistant"]');
  await page.click('.suggest .chip-btn[data-q="Как получить доступ к Scopus?"]');
  await page.waitForTimeout(500);
  // Not-in-KB question
  await page.fill('#chat-input', 'Есть ли у ЕНУ доступ к базе ERIC для поиска по педагогике?');
  await page.press('#chat-input', 'Enter');
  await page.waitForTimeout(600);
  await shot('assistant-chat');
  const kinds = await page.evaluate(() => S.me.chat.map(m => m.role + ':' + (m.kind || '') + ':' + (m.state || '') + ':' + (m.text || '').slice(0, 40)));
  console.log('chat', kinds);
  // escalate from last bot message
  const btns = await page.$$('.msg.bot [data-act="escalate"]');
  await btns[btns.length - 1].click();
  await page.waitForTimeout(150);
  await shot('escalate-modal');
  const cat = await page.$eval('#esc-cat', e => e.value);
  console.log('esc cat', cat);
  await page.click('[data-act="esc-send"]');
  await page.waitForTimeout(400);
  const t = await page.evaluate(() => all('tickets').filter(t => /ERIC/.test(t.q)).map(t => ({ num: t.num, status: t.status, src: t._src || 'local' })));
  console.log('ticket', t);
  // Staff
  await page.click('.role-switch [data-role="staff"]');
  await page.waitForTimeout(200);
  await shot('staff-overview', true);
  await page.click('a.nav-item[data-view="tickets"]');
  await page.waitForTimeout(150);
  const row = await page.$('.trow:has-text("ERIC")');
  await row.click();
  await page.waitForTimeout(150);
  if (MOCK) { await page.click('[data-act="tk-ai"]'); await page.waitForTimeout(500); }
  else { await page.fill('[id^="reply-"]', 'Добрый день! ERIC — бесплатная база по образованию: https://eric.ed.gov.'); }
  const draft = await page.$eval('[id^="reply-"]', e => e.value);
  console.log('draft', draft.slice(0, 80));
  await shot('staff-ticket');
  await page.click('[data-act="tk-reply-close"]');
  await page.waitForTimeout(400);
  const t2 = await page.evaluate(() => all('tickets').filter(t => /ERIC/.test(t.q)).map(t => ({ status: t.status, lastEvent: t.lastEvent })));
  console.log('after reply', t2);
  await page.click('[data-act="tk-to-kb"]');
  await page.waitForTimeout(150);
  if (MOCK) { await page.click('[data-act="kb-ai"]'); await page.waitForTimeout(400); }
  await shot('kb-from-ticket');
  await page.click('[data-act="kb-save"]');
  await page.waitForTimeout(300);
  const kbN = await page.evaluate(() => all('kb').length);
  console.log('kb count', kbN);
  // Back to student — notification
  await page.click('.role-switch [data-role="student"]');
  await page.waitForTimeout(200);
  const badge = await page.$eval('.bell-wrap .count', e => e.textContent).catch(() => 'none');
  console.log('bell badge', badge);
  await page.click('[data-act="bell"]');
  await page.waitForTimeout(100);
  await shot('bell');
  const item = await page.$('.dd-item:has-text("ответил")');
  if (item) await item.click();
  await page.waitForTimeout(200);
  await shot('student-ticket-modal');
  await page.keyboard.press('Escape');
  // New KB entry used by assistant
  await page.fill('#chat-input', 'Есть ли доступ к базе ERIC?');
  await page.press('#chat-input', 'Enter');
  await page.waitForTimeout(500);
  const last = await page.evaluate(() => { const c = S.me.chat; const m = c[c.length - 1]; return m.kind + ' ' + m.orig; });
  console.log('assistant after KB add', last);
  // Other views
  for (const v of ['passport', 'search', 'library', 'planner', 'prompts', 'roadmap']) {
    await page.click(`a.nav-item[data-view="${v}"]`);
    await page.waitForTimeout(150);
    await shot('s-' + v, true);
  }
  // search interactions
  await page.click('a.nav-item[data-view="search"]');
  await page.fill('#s-q', 'PRISMA');
  await page.press('#s-q', 'Enter');
  await page.waitForTimeout(100);
  await page.click('.result [data-act="cite"]');
  if (MOCK) { await page.click('[data-act="b-ai"]'); await page.waitForTimeout(300); }
  await page.waitForTimeout(100);
  await shot('search-prisma', true);
  // library ai + style
  await page.click('a.nav-item[data-view="library"]');
  await page.click('[data-act="lib-style"][data-v="apa"]');
  await page.click('[data-act="lib-ai"]');
  await page.waitForTimeout(400);
  await shot('library-ai', true);
  // planner report
  await page.click('a.nav-item[data-view="planner"]');
  await page.click('[data-act="report"]');
  await page.waitForTimeout(150);
  await shot('report');
  await page.keyboard.press('Escape');
  // prompt modal
  await page.click('a.nav-item[data-view="prompts"]');
  await page.click('.prompt-card[data-id="p01"]');
  await page.waitForTimeout(100);
  if (MOCK) { await page.click('[data-act="p-run"]'); await page.waitForTimeout(400); }
  await shot('prompt-modal');
  await page.keyboard.press('Escape');
  // beta reviewer
  await page.click('a.nav-item[data-view="roadmap"]');
  await page.click('[data-act="beta-tab"][data-v="reviewer"]');
  await page.click('[data-act="beta-sample"][data-v="reviewer"]');
  if (MOCK) { await page.click('[data-act="beta-run"]'); await page.waitForTimeout(400); }
  await shot('beta-reviewer', true);
  // staff other views
  await page.click('.role-switch [data-role="staff"]');
  for (const v of ['kb', 'events', 'resources']) { await page.click(`a.nav-item[data-view="${v}"]`); await page.waitForTimeout(120); await shot('st-' + v, true); }
  // pp edit
  await page.click('.role-switch [data-role="student"]');
  await page.click('a.nav-item[data-view="passport"]');
  await page.click('.page-actions [data-act="pp-edit"]');
  await page.waitForTimeout(100);
  await shot('pp-edit');
  await page.keyboard.press('Escape');
  // scenario + about
  await page.click('.nav-foot [data-act="scenario"]');
  await shot('scenario');
  await page.keyboard.press('Escape');
  // mobile
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(150);
  await shot('mobile-passport');
  await page.click('.role-switch [data-role="staff"]');
  await page.click('a.nav-item[data-view="tickets"]');
  await page.waitForTimeout(150);
  await shot('mobile-tickets', true);
  if (MOCK) { console.log('store keys', Object.keys(await page.evaluate(() => window.__mockStore)).length); console.log('calls', (await page.evaluate(() => window.__calls)).map(c => c.kind + ':' + c.tier).join(', ')); }
  console.log('ERRORS', errors.length ? errors : 'none');
  await browser.close();
})().catch(e => { console.error('TEST FAILED', e); process.exit(1); });
