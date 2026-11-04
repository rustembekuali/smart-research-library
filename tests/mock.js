// Mock of the artifact runtime: sample (Claude), db (shared store), user
window.__calls = [];
(function () {
  const store = {}; const listeners = [];
  const parent = p => p.split('/').slice(0, -1).join('/');
  const snapDocs = coll => Object.keys(store).filter(p => parent(p) === coll).map(p => ({ id: p.split('/').pop(), exists: true, data: () => Object.freeze(JSON.parse(JSON.stringify(store[p]))), metadata: { fromCache: false, hasPendingWrites: false } }));
  const notify = coll => listeners.filter(l => l.coll === coll).forEach(l => setTimeout(() => l.cb({ docs: snapDocs(coll), size: 0, empty: false, docChanges: () => [], metadata: { fromCache: false, hasPendingWrites: false } }), 5));
  const docRef = path => ({
    id: path.split('/').pop(), path,
    get: async () => ({ id: path.split('/').pop(), exists: path in store, data: () => (store[path] ? JSON.parse(JSON.stringify(store[path])) : undefined), metadata: { fromCache: false, hasPendingWrites: false } }),
    set: async d => { store[path] = JSON.parse(JSON.stringify(d)); notify(parent(path)); },
    update: async d => { if (!(path in store)) throw { code: 'invalid_argument', message: 'missing' }; Object.assign(store[path], JSON.parse(JSON.stringify(d))); notify(parent(path)); },
    delete: async () => { delete store[path]; notify(parent(path)); },
    onSnapshot: () => () => {}
  });
  const db = {
    doc: p => docRef(p),
    collection: coll => ({ path: coll, doc: id => docRef(coll + '/' + (id || Math.random().toString(36).slice(2))), onSnapshot: (cb) => { const l = { coll, cb }; listeners.push(l); setTimeout(() => cb({ docs: snapDocs(coll), metadata: { fromCache: false, hasPendingWrites: false } }), 30); return () => {}; } })
  };
  window.__mockStore = store; window.__mockDb = db;
  const sample = async (input, opts = {}) => {
    window.__calls.push({ kind: 'text', input: typeof input === 'string' ? input.slice(0, 160) : input, tier: opts.modelTier });
    const text = /черновик ответа/i.test(input) ? 'Добрый день! ERIC — бесплатная база по образованию: eric.ed.gov. [уточнить, нужна ли помощь с поисковой стратегией]'
      : 'Ответ ИИ по теме.\n1. Первый шаг\n2. Второй шаг';
    await new Promise(r => setTimeout(r, 60));
    if (opts.onText) { opts.onText({ text: text.slice(0, 12), delta: text.slice(0, 12) }); await new Promise(r => setTimeout(r, 60)); opts.onText({ text, delta: text.slice(12) }); }
    return { text, truncated: false, modelTierApplied: opts.modelTier || 'default' };
  };
  sample.json = async (input) => {
    window.__calls.push({ kind: 'json', input: input.slice(0, 120) });
    await new Promise(r => setTimeout(r, 60));
    if (/"concepts"/.test(input)) return { concepts: [{ label: 'Искусственный интеллект', terms: ['artificial intelligence', 'generative AI'] }, { label: 'Докторанты', terms: ['doctoral student*', 'PhD candidate*'] }] };
    if (/"steps"/.test(input)) return { explain: 'Эксперт просит явно описать, кого и по каким признакам включали в выборку.', steps: ['Перечислите критерии включения и исключения.', 'Укажите, как набирали участников.', 'Добавьте таблицу с характеристиками выборки.'] };
    if (/"topics"/.test(input)) return { topics: [{ title: 'Развитие академической честности магистрантов при использовании генеративного ИИ', title_kk: 'Генеративті ЖИ қолдану кезінде магистранттардың академиялық адалдығын дамыту', object: 'Магистранты педагогических специальностей', subject: 'Академическая честность при работе с генеративным ИИ', novelty: 'Уточняются условия ответственного использования ИИ в учебных работах.', hypothesis: 'Обучающий модуль повышает показатели академической честности.', methods: 'Формирующий эксперимент; парный t-критерий.' }] };
    if (/"criteria"/.test(input)) return { overall: 'Рукопись актуальна, но выводы шире данных.', criteria: [{ name: 'Актуальность исследования', score: 4, comment: 'Проблема обоснована.', fix: 'Добавить данные по Казахстану.' }, { name: 'Выводы', score: 2, comment: 'Вывод обобщён на всех докторантов.', fix: 'Сузить вывод до выборки.' }] };
    return { q: 'Есть ли доступ к базе ERIC?', keys: 'eric база образование доступ педагогика', a: '1. ERIC — бесплатная база по образованию.\n2. Откройте eric.ed.gov.' };
  };
  sample.limits = async () => ({ maxPromptBytes: 262144 });
  const user = { id: async () => 'u-test', can: async () => true, isOwner: () => true, canEdit: () => true };
  window.claude = { use: async name => { await new Promise(r => setTimeout(r, 20)); return name === 'sample' ? sample : name === 'db' ? db : name === 'user' ? user : null; } };
})();
