const path = require('path');
const fs = require('fs');
const PAGE = 'file://' + path.resolve(__dirname, '../dist/index.html');
const SHOTS = path.resolve(__dirname, '../shots');
fs.mkdirSync(SHOTS, { recursive: true });
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.route('**/*', r => { const u = r.request().url(); if (u.startsWith('file:')) return r.continue(); return r.abort(); });
  await page.goto(PAGE);
  await page.waitForTimeout(400);
  const shot = async (name, full = false) => page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: full });
  const out = {};

  await page.evaluate(() => go('student', 'prompts'));
  await page.waitForTimeout(150);
  out.cards = await page.locator('.prompt-card').count();
  out.chips = await page.locator('.chips .chip-btn').allInnerTexts();
  await shot('p1-library', true);

  await page.click('.chip-btn[data-v="КОКСОН"]');
  await page.waitForTimeout(100);
  out.koksonCards = await page.locator('.prompt-card').allInnerTexts();

  // Russian KOKSON prompt + example
  await page.click('.prompt-card[data-id="p17"]');
  await page.waitForTimeout(150);
  out.p17fields = await page.locator('.modal label').allInnerTexts();
  out.p17runBtn = await page.locator('[data-act="p-run"]').count();
  await page.click('[data-act="p-example"]');
  await page.waitForTimeout(150);
  const prev17 = await page.locator('#p-preview').innerText();
  out.p17prev = { topic: prev17.includes('Социокультурная адаптация в структуре кросс-культурной коммуникации иностранных студентов'), ward: prev17.includes('Ward & Kennedy, 1999'), design: prev17.includes('ДИЗАЙН ИССЛЕДОВАНИЯ: эмпирическое'), journalLeft: prev17.includes('{{журнал}}'), dataFilled: prev17.includes('Выборка: иностранные студенты') };
  out.p17select = await page.locator('#pv-p17-дизайн').inputValue();
  await shot('p2-p17-example');
  // change the select and check preview updates
  await page.selectOption('#pv-p17-дизайн', 'теоретико-обзорное');
  await page.waitForTimeout(100);
  out.p17afterSelect = (await page.locator('#p-preview').innerText()).includes('ДИЗАЙН ИССЛЕДОВАНИЯ: теоретико-обзорное');
  await page.fill('#pv-p17-журнал', 'Вестник ЕНУ (пример)');
  await page.waitForTimeout(100);
  out.p17journal = (await page.locator('#p-preview').innerText()).includes('для журнала: Вестник ЕНУ (пример)');
  out.p17copyText = (await page.locator('#p-copy').getAttribute('data-text')).slice(0, 80);
  await page.evaluate(() => closeModal());
  await page.waitForTimeout(100);

  // Kazakh KOKSON prompt + example
  await page.click('.prompt-card[data-id="p18"]');
  await page.waitForTimeout(150);
  out.p18title = await page.locator('.modal h2, .modal .modal-title').first().innerText().catch(() => '');
  await page.click('[data-act="p-example"]');
  await page.waitForTimeout(150);
  const prev18 = await page.locator('#p-preview').innerText();
  out.p18prev = { topic: prev18.includes('Шетелдік студенттердің кросс-мәдени коммуникация құрылымындағы әлеуметтік-мәдени бейімделуі'), design: prev18.includes('ЗЕРТТЕУ ДИЗАЙНЫ: эмпирикалық'), journalLeft: prev18.includes('{{басылым}}') };
  out.p18toast = await page.locator('.toast').allInnerTexts().catch(() => []);
  await shot('p3-p18-example');
  await page.evaluate(() => closeModal());

  // PRISMA chain step with files: copy only
  await page.evaluate(() => { S.ui.prompts.cat = 'PRISMA 2020'; renderMain(); });
  await page.waitForTimeout(100);
  out.prismaCards = await page.locator('.prompt-card .pc-title').allInnerTexts();
  await shot('p4-prisma-cards');
  await page.click('.prompt-card[data-id="p22"]');
  await page.waitForTimeout(150);
  out.p22 = { run: await page.locator('[data-act="p-run"]').count(), note: await page.locator('.modal .note').innerText(), copyPrimary: await page.locator('#p-copy.primary').count() };
  await shot('p5-p22');
  await page.evaluate(() => closeModal());
  await page.click('.prompt-card[data-id="p25"]');
  await page.waitForTimeout(150);
  out.p25 = { area: await page.locator('#pv-p25-вывод').count(), ph: await page.locator('#pv-p25-вывод').getAttribute('placeholder'), run: await page.locator('[data-act="p-run"]').count() };
  await page.evaluate(() => closeModal());

  // novelty prompt keeps the AI run button
  await page.evaluate(() => openModal('prompt', { id: 'p19' }));
  await page.waitForTimeout(150);
  out.p19 = { run: await page.locator('[data-act="p-run"]').count(), prevStart: (await page.locator('#p-preview').innerText()).slice(0, 120) };
  await page.evaluate(() => closeModal());

  // required-field check still works for the classic prompts
  await page.evaluate(() => { openModal('prompt', { id: 'p03' }); });
  await page.waitForTimeout(100);
  await page.evaluate(() => runPrompt('p03'));
  await page.waitForTimeout(150);
  out.p03toast = await page.locator('.toast').allInnerTexts().catch(() => []);
  await page.evaluate(() => closeModal());

  // roadmap -> PRISMA prompts
  await page.evaluate(() => go('student', 'roadmap'));
  await page.waitForTimeout(150);
  out.roadmapBtn = await page.locator('[data-act="p-goto"]').count();
  await page.click('[data-act="p-goto"]');
  await page.waitForTimeout(150);
  out.afterGoto = { view: await page.evaluate(() => curView()), cat: await page.evaluate(() => S.ui.prompts.cat), cards: await page.locator('.prompt-card').count() };

  // search
  await page.evaluate(() => { S.ui.prompts.cat = 'all'; renderMain(); });
  await page.fill('#p-q', 'новизн');
  await page.waitForTimeout(400);
  out.searchNovelty = await page.locator('.prompt-card .pc-title').allInnerTexts();

  // mobile layout
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => { S.ui.prompts.cat = 'КОКСОН'; S.ui.drafts['p-q'] = ''; renderMain(); });
  await page.waitForTimeout(200);
  await shot('p6-mobile-kokson', true);
  await page.evaluate(() => openModal('prompt', { id: 'p18' }));
  await page.waitForTimeout(200);
  await shot('p7-mobile-p18');
  out.overflow = await page.evaluate(() => [...document.querySelectorAll('.modal *, .prompt-card *')].filter(e => e.getBoundingClientRect().right > window.innerWidth + 1).map(e => e.className || e.tagName).slice(0, 8));

  console.log(JSON.stringify(out, null, 1));
  console.log('ERRORS', errors);
  await browser.close();
})();
