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
  const shot = async (name) => page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: false });
  await shot('01-passport');
  // ORCID check + KB search sanity
  const checks = await page.evaluate(() => ({
    orcid: orcidValid('0000-0002-1825-0097'),
    kbScopus: kbSearch('Как получить доступ к Scopus?').slice(0,2).map(r => [r.e.id, +r.score.toFixed(2)]),
    kbKz: kbSearch('Scopus-қа қалай кіруге болады?').slice(0,2).map(r => [r.e.id, +r.score.toFixed(2)]),
    kbEn: kbSearch('How do I install Zotero?').slice(0,2).map(r => [r.e.id, +r.score.toFixed(2)]),
    kbTrain: kbSearch('Как записаться на обучение по научным базам данных?').slice(0,2).map(r => [r.e.id, +r.score.toFixed(2)]),
    kbDiss: kbSearch('Где найти диссертации по моей специальности?').slice(0,2).map(r => [r.e.id, +r.score.toFixed(2)]),
    kbMiss: kbSearch('Как оформить академический отпуск?').slice(0,2).map(r => [r.e.id, +r.score.toFixed(2)]),
    kbEric: kbSearch('Есть ли у ЕНУ доступ к базе ERIC? Ищу исследования по цифровой грамотности докторантов.').slice(0,2).map(r => [r.e.id, +r.score.toFixed(2)]),
    kbBib: kbSearch('Как работать с Bibliometrix и Biblioshiny?').slice(0,1).map(r => [r.e.id, +r.score.toFixed(2)]),
    kbDup: kbSearch('Как удалить дубликаты?').slice(0,1).map(r => [r.e.id, +r.score.toFixed(2)]),
    kbDoi: kbSearch('Как найти статью по DOI?').slice(0,1).map(r => [r.e.id, +r.score.toFixed(2)]),
    kbWos: kbSearch('Как пользоваться Web of Science?').slice(0,1).map(r => [r.e.id, +r.score.toFixed(2)]),
    gost1: citeGost(CATALOG.find(c=>c.id==='c13')),
    gost2: citeGost(CATALOG.find(c=>c.id==='c01')),
    gost3: citeGost(CATALOG.find(c=>c.id==='c31')),
    gost4: citeGost(CATALOG.find(c=>c.id==='c32')),
    apa1: citeApa(CATALOG.find(c=>c.id==='c19')),
    apa2: citeApa(CATALOG.find(c=>c.id==='c25')),
    van: citeVancouver(CATALOG.find(c=>c.id==='c01')),
    search1: searchCatalog({q:'систематический обзор', type:'all', free:false, idx:'any', from:'', sort:'rel'}).items.slice(0,4).map(c=>c.id),
    search2: searchCatalog({q:'bibliometrix', type:'all', free:false, idx:'any', from:'', sort:'rel'}).items.map(c=>c.id),
    search3: searchCatalog({q:'10.1136/bmj.n71', type:'all', free:false, idx:'any', from:'', sort:'rel'}).items.map(c=>c.id),
    search4: searchCatalog({q:'ChatGPT в образовании', type:'all', free:false, idx:'any', from:'', sort:'rel'}).items.map(c=>c.id),
    search5: searchCatalog({q:'Page', type:'all', free:false, idx:'any', from:'', sort:'rel'}).items.map(c=>c.id),
    builder: builderQueries(S.me.builder.concepts),
    plan: S.me.planner.milestones.map(m => [m.k, new Date(m.due).toISOString().slice(0,10), m.done]),
  }));
  console.log(JSON.stringify(checks, null, 1));
  console.log('ERRORS', errors);
  await browser.close();
})();
