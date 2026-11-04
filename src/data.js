/* =====================================================================
   Smart Research Library 1.0 — данные демоверсии
   Сведения о ресурсах ЕНУ взяты с сайта lib.enu.kz (раздел «Ресурсы по
   национальной подписке МНВО РК», «История»). Каталог публикаций —
   реальные работы с проверяемыми DOI. Люди, обращения и мероприятия —
   вымышленные демо-данные.
   ===================================================================== */

const CATEGORIES = [
  'Электронные ресурсы', 'Библиографические менеджеры', 'Поиск литературы',
  'Библиометрия', 'Научные консультации', 'Техническая поддержка', 'Другие вопросы'
];
const KB_CATEGORIES = CATEGORIES.slice(0, 6).concat(['Услуги библиотеки', 'Другие вопросы']);
const CAT_EXAMPLES = {
  'Электронные ресурсы': 'Не могу открыть статью в научной базе',
  'Библиографические менеджеры': 'Как экспортировать ссылки в EndNote?',
  'Поиск литературы': 'Помогите найти диссертацию по психологии',
  'Библиометрия': 'Как выполнить анализ публикаций в Bibliometrix?',
  'Научные консультации': 'Можно ли записаться на консультацию?',
  'Техническая поддержка': 'Не работает доступ к электронной библиотеке',
  'Другие вопросы': 'Свободное обращение'
};

const SRC = {
  natsub: { t: 'Ресурсы по национальной подписке МНВО РК · lib.enu.kz', u: 'https://lib.enu.kz/en/page/for-researchers/search-for-scientific-information/resursy-po-natsional-noi-podpiske-mnvo-rk' },
  lib: { t: 'Научная библиотека ЕНУ · lib.enu.kz', u: 'https://lib.enu.kz/ru' },
  hours: { t: 'Режим работы библиотеки · lib.enu.kz', u: 'https://lib.enu.kz/en/page/working-hours' },
  repo: { t: 'Репозиторий ЕНУ', u: 'https://repository.enu.kz/' },
  wileyRemote: { t: 'Инструкция: удалённый доступ к Wiley Online Library (PDF)', u: 'https://lib.enu.kz/ru/wp-content/uploads/2023/04/udalennyj-dostup-k-wiley-online-library-instrukcziya.pdf' },
  scopus: { t: 'Scopus', u: 'https://www.scopus.com/' },
  scopusHelp: { t: 'Scopus Support Center', u: 'https://service.elsevier.com/app/home/supporthub/scopus/' },
  wosRules: { t: 'Web of Science: правила поиска', u: 'https://webofscience.help.clarivate.com/en-us/Content/search-rules.htm' },
  doi: { t: 'DOI Foundation', u: 'https://www.doi.org/' },
  unpaywall: { t: 'Unpaywall', u: 'https://unpaywall.org/' },
  oatd: { t: 'OATD — Open Access Theses and Dissertations', u: 'https://oatd.org/' },
  dart: { t: 'DART-Europe E-theses Portal', u: 'https://www.dart-europe.org/' },
  zoteroDl: { t: 'Zotero: загрузка', u: 'https://www.zotero.org/download/' },
  zoteroDocs: { t: 'Документация Zotero', u: 'https://www.zotero.org/support/' },
  zoteroStyles: { t: 'Стили цитирования Zotero', u: 'https://www.zotero.org/styles' },
  endnote: { t: 'EndNote', u: 'https://endnote.com/' },
  bibliometrix: { t: 'bibliometrix.org', u: 'https://www.bibliometrix.org/' },
  bramer: { t: 'Bramer et al., 2016 (JMLA)', u: 'https://doi.org/10.3163/1536-5050.104.3.014' },
  rayyan: { t: 'Rayyan', u: 'https://www.rayyan.ai/' },
  prisma: { t: 'PRISMA Statement', u: 'https://www.prisma-statement.org/' },
  prospero: { t: 'PROSPERO', u: 'https://www.crd.york.ac.uk/prospero/' },
  sjr: { t: 'SCImago Journal Rank', u: 'https://www.scimagojr.com/' },
  jcr: { t: 'Journal Citation Reports', u: 'https://jcr.clarivate.com/' },
  orcid: { t: 'ORCID', u: 'https://orcid.org/' },
  wra: { t: 'Wiley Researcher Academy', u: 'https://wileyresearcheracademy.com/' }
};

/* ---------- База знаний виртуального библиотекаря ---------- */
const KB_BASE = [
  { id: 'kb01', cat: 'Электронные ресурсы', views: 128,
    q: 'Как получить доступ к Scopus?',
    keys: 'scopus доступ доступа войти зайти открыть получить удаленный удаленно из дома вне университета регистрация аккаунт elsevier',
    a: 'Scopus входит в национальную подписку МНВО РК, поэтому у ЕНУ есть к нему доступ.\n1. Откройте scopus.com с компьютера или Wi‑Fi в сети университета — доступ определяется по IP-адресу.\n2. Создайте личный аккаунт Elsevier («Create account»), находясь в сети ЕНУ: так сохраняются поиски, оповещения и списки.\n3. Порядок работы вне кампуса уточните у библиотеки: «Задать вопрос библиотекарю» → категория «Электронные ресурсы».\nМетодические рекомендации по работе со Scopus размещены на сайте библиотеки.',
    src: ['natsub', 'scopus'] },
  { id: 'kb02', cat: 'Электронные ресурсы', views: 97,
    q: 'Как пользоваться Web of Science?',
    keys: 'webofscience пользоваться работать искать поиск clarivate core collection теги полей ts расширенный',
    a: 'Web of Science доступен ЕНУ по национальной подписке МНВО РК.\n1. Откройте webofscience.com из сети университета и выберите Web of Science Core Collection.\n2. В расширенном поиске используйте теги полей: TS= — тема (название, аннотация, ключевые слова), TI= — название, AU= — автор, SO= — журнал.\n3. Уточняйте выдачу фильтрами: годы, тип документа, категории Web of Science, открытый доступ.\n4. «Citation report» строит отчёт о цитировании, «Export» выгружает записи: RIS — для Zotero и EndNote, Plain text — для Bibliometrix.',
    src: ['natsub', 'wosRules'] },
  { id: 'kb03', cat: 'Электронные ресурсы', views: 84,
    q: 'Какие электронные научные ресурсы доступны через библиотеку ЕНУ?',
    keys: 'ресурсы ресурсов базы баз базам данных подписка доступны какие список электронные научные журналы издательства wiley springer elsevier',
    a: 'По национальной подписке МНВО РК ЕНУ имеет доступ к Web of Science, Scopus и Wiley Online Library, а также к курсам Wiley Researcher Academy.\nСобственные ресурсы библиотеки: электронный каталог, база «Труды учёных ЕНУ» и институциональный репозиторий repository.enu.kz.\nАктуальный перечень с инструкциями ведут сотрудники библиотеки — он показан в блоке «Доступные ресурсы». Если нужного издательства нет в списке, задайте вопрос библиотекарю: подскажем легальные способы получить текст.',
    src: ['natsub', 'repo'] },
  { id: 'kb04', cat: 'Поиск литературы', views: 91,
    q: 'Как найти статью по DOI?',
    keys: 'doi найти найду статью статья идентификатор ссылка открыть по doi',
    a: '1. Добавьте DOI к адресу https://doi.org/ — например, https://doi.org/10.1136/bmj.n71. Ссылка откроет страницу статьи у издателя.\n2. В Scopus ищите по полю DOI, в Web of Science — по тегу DO=.\n3. В Zotero нажмите «Добавить по идентификатору» (волшебная палочка) и вставьте DOI — запись с метаданными создастся сама.\nЕсли полный текст закрыт, смотрите ответ «Как получить доступ к полному тексту публикации».',
    src: ['doi'] },
  { id: 'kb05', cat: 'Электронные ресурсы', views: 76,
    q: 'Как получить доступ к полному тексту публикации?',
    keys: 'полный текст полному тексту pdf скачать закрыт закрыта платный доступ статья открыть недоступна прочитать',
    a: 'Проверьте варианты по порядку:\n1. Откройте статью из сети ЕНУ: если журнал входит в подписку (например, Wiley Online Library), полный текст откроется.\n2. Поищите открытую версию: расширение Unpaywall, ссылка [PDF] в Google Scholar, репозиторий организации автора.\n3. Проверьте препринт (arXiv, SSRN и другие серверы препринтов).\n4. Напишите автору — исследователи обычно охотно присылают свои статьи.\n5. Если не помогло, отправьте библиотекарю DOI статьи — подскажем легальный способ получить текст.',
    src: ['unpaywall', 'natsub'] },
  { id: 'kb06', cat: 'Услуги библиотеки', views: 58,
    q: 'Как пользоваться электронным каталогом университета?',
    keys: 'электронный каталог каталогом книги книгу найти фонд наличие шифр заказать издание',
    a: 'Электронный каталог раскрывает фонд библиотеки: около 220 тыс. библиографических записей и 80 тыс. полнотекстовых документов.\n1. Откройте каталог с сайта lib.enu.kz.\n2. Ищите по автору, заглавию или ключевым словам; уточняйте вид издания и год.\n3. В записи смотрите наличие и место хранения — эти данные нужны для заказа.\n4. Электронные документы открываются прямо из записи.\nЕсли издания нет в фонде, задайте вопрос библиотекарю в категории «Поиск литературы».',
    src: ['lib'] },
  { id: 'kb07', cat: 'Поиск литературы', views: 88,
    q: 'Где найти диссертации по моей специальности?',
    keys: 'диссертации диссертацию специальности специальность найти защищенные phd казахстан репозиторий автореферат',
    a: '1. Репозиторий ЕНУ (repository.enu.kz) — научные работы университета; ищите по ключевым словам темы.\n2. Сайты диссертационных советов вузов Казахстана: перед защитой там, как правило, размещают диссертации и аннотации.\n3. Зарубежные работы — см. ответ «Как найти зарубежные диссертации».\n4. Нужна подборка по теме — отправьте вопрос библиотекарю в категории «Поиск литературы»: специальность, ключевые слова, годы.',
    src: ['repo'] },
  { id: 'kb08', cat: 'Поиск литературы', views: 47,
    q: 'Как найти зарубежные диссертации?',
    keys: 'зарубежные иностранные диссертации диссертацию thesis dissertation proquest oatd dart europe найти',
    a: 'Открытые источники:\n• OATD.org — поисковик по открытым диссертациям и магистерским работам университетов мира;\n• DART-Europe — европейские диссертации;\n• Google Scholar — добавьте к запросу слово thesis или dissertation;\n• репозитории конкретных университетов.\nProQuest Dissertations & Theses Global — коммерческая база, доступна только по подписке; уточните в библиотеке. Поиск по OATD можно запустить из модуля «Поиск литературы».',
    src: ['oatd', 'dart'] },
  { id: 'kb09', cat: 'Библиографические менеджеры', views: 102,
    q: 'Как оформить список литературы?',
    keys: 'оформить оформление список литературы библиография гост apa vancouver ссылки стиль цитирования',
    a: '1. Уточните стиль: для диссертации — требования диссертационного совета (часто ГОСТ 7.1–2003), для статьи — правила журнала (APA, Vancouver, Harvard и др.).\n2. Собирайте источники в Zotero или EndNote — менеджер оформит список в выбранном стиле автоматически.\n3. Проверьте обязательные элементы: авторы, заглавие, источник, год, том, номер, страницы, DOI.\n4. В модуле «Моя библиотека» список можно получить сразу в ГОСТ 7.1–2003, APA 7 или Vancouver.\nСомневаетесь — пришлите 2–3 записи библиотекарю на проверку.',
    src: ['zoteroStyles'] },
  { id: 'kb10', cat: 'Библиографические менеджеры', views: 39,
    q: 'Где получить консультацию по библиографическим менеджерам?',
    keys: 'консультация консультацию библиографические менеджеры менеджерам zotero endnote mendeley помощь научиться',
    a: '1. Запишитесь на практикум в блоке «Мероприятия по вашему профилю» (страница «Научный паспорт») — там проходят занятия по Zotero и EndNote.\n2. Забронируйте индивидуальную онлайн-консультацию в блоке «Консультации».\n3. Задайте вопрос библиотекарю в категории «Библиографические менеджеры» — ответ придёт в историю обращений.',
    src: [] },
  { id: 'kb11', cat: 'Библиографические менеджеры', views: 64,
    q: 'Как пользоваться EndNote?',
    keys: 'endnote пользоваться работать cite while you write word стиль импорт группы',
    a: '1. Создайте библиотеку: File → New. С аккаунтом Web of Science доступен EndNote Online.\n2. Импортируйте записи: выгрузите их из Scopus или Web of Science в формате RIS и откройте файл в EndNote.\n3. Раскладывайте записи по группам (Groups) — например, по главам диссертации.\n4. В Word используйте вкладку EndNote (Cite While You Write): Insert Citation, затем выберите стиль — список литературы соберётся автоматически.\n5. Дубликаты ищите командой Library → Find Duplicates.',
    src: ['endnote'] },
  { id: 'kb12', cat: 'Библиографические менеджеры', views: 112,
    q: 'Как установить Zotero?',
    keys: 'zotero установить установка скачать connector коннектор плагин word браузер',
    a: '1. Скачайте Zotero для своей системы на zotero.org/download и установите.\n2. Там же установите Zotero Connector для браузера: он сохраняет статьи со страниц Scopus, Web of Science и сайтов издателей одним кликом.\n3. Плагин для Word и LibreOffice ставится вместе с программой — проверьте вкладку Zotero в Word.\n4. Зарегистрируйте бесплатный аккаунт и включите синхронизацию: Правка → Настройки → Синхронизация. Бесплатно доступно 300 МБ для файлов.',
    src: ['zoteroDl', 'zoteroDocs'] },
  { id: 'kb13', cat: 'Библиографические менеджеры', views: 73,
    q: 'Как экспортировать статьи из Scopus?',
    keys: 'экспорт экспортировать выгрузить выгрузка scopus записи ris csv bibtex результаты скачать',
    a: '1. Выполните поиск и отметьте нужные записи (или «Select all»).\n2. Нажмите «Export» и выберите формат: RIS — для Zotero, EndNote и Mendeley; BibTeX — для LaTeX; CSV — для таблиц и Bibliometrix.\n3. Отметьте поля: для списка литературы достаточно «Citation information» и «Bibliographical information»; для библиометрии добавьте «Abstract & keywords» и «References».\n4. Большие выборки выгружайте частями — например, по годам.',
    src: ['scopusHelp'] },
  { id: 'kb14', cat: 'Библиографические менеджеры', views: 41,
    q: 'Как объединить библиографические записи?',
    keys: 'объединить объединение слить записи библиотеки merge scopus webofscience две базы',
    a: '• Zotero: раздел Duplicate Items («Дубликаты») → выберите пару записей → «Объединить»; укажите главную версию, остальные поля дополнятся.\n• EndNote: Library → Find Duplicates, сравните записи и оставьте полную.\n• Для библиометрии (Scopus + Web of Science) в R: загрузите выгрузки функцией convert2df(), затем объедините их mergeDbSources(..., remove.duplicated = TRUE) из пакета bibliometrix.',
    src: ['zoteroDocs', 'bibliometrix'] },
  { id: 'kb15', cat: 'Библиографические менеджеры', views: 69,
    q: 'Как удалить дубликаты?',
    keys: 'дубликаты дубликатов удалить удаление дубли повторы повторяющиеся duplicates',
    a: '• Zotero: раздел Duplicate Items («Дубликаты») → выберите группу → «Объединить».\n• EndNote: Library → Find Duplicates → оставьте одну запись из пары.\n• Rayyan: при импорте находит возможные дубликаты, решение остаётся за вами.\n• Bibliometrix: mergeDbSources(..., remove.duplicated = TRUE).\nВ систематическом обзоре зафиксируйте число удалённых дубликатов — оно нужно для блок-схемы PRISMA 2020. Проверенный метод для EndNote описан в статье Bramer et al. (2016).',
    src: ['bramer', 'rayyan'] },
  { id: 'kb16', cat: 'Библиометрия', views: 54,
    q: 'Как работать с Bibliometrix и Biblioshiny?',
    keys: 'bibliometrix biblioshiny библиометрия библиометрический анализ r rstudio работать',
    a: '1. Установите R и RStudio.\n2. В консоли выполните install.packages("bibliometrix"), затем library(bibliometrix) и biblioshiny() — откроется веб-интерфейс.\n3. Загрузите выгрузку: Scopus — CSV или BibTeX, Web of Science — Plain text с полной записью и цитируемой литературой.\n4. Начните с разделов Overview и Sources, затем Conceptual structure (co-word), Intellectual structure (co-citation) и Social structure (сотрудничество).\n5. Сохраняйте графики и таблицы для приложения к диссертации.\nПрактикум по Bibliometrix есть в разделе мероприятий.',
    src: ['bibliometrix'] },
  { id: 'kb17', cat: 'Услуги библиотеки', views: 22, status: 'draft',
    q: 'Как зарегистрироваться в библиотеке?',
    keys: 'зарегистрироваться регистрация записаться в библиотеку читательский билет формуляр',
    a: 'Черновик: порядок записи читателей подтверждается сотрудниками. Адрес библиотеки: г. Астана, ул. Пушкина, 11; режим работы опубликован на сайте lib.enu.kz. Электронные ресурсы национальной подписки открываются из сети университета по IP-адресу.',
    src: ['hours'] },
  { id: 'kb18', cat: 'Услуги библиотеки', views: 35,
    q: 'Как заказать необходимую литературу?',
    keys: 'заказать заказ литературу книгу книги выдача бронь забронировать нет в фонде доставка',
    a: '1. Найдите издание в электронном каталоге и оформите заказ — библиотека поддерживает дистанционный заказ литературы.\n2. Если издания нет в фонде, отправьте библиотекарю запрос в категории «Поиск литературы»: автор, название, год, ISBN или DOI.\n3. Для статей укажите DOI — подскажем легальные варианты получения текста.',
    src: ['lib'] },
  { id: 'kb19', cat: 'Научные консультации', views: 61,
    q: 'Как получить консультацию библиотекаря?',
    keys: 'консультация консультацию библиотекаря получить спросить помощь специалиста встреча',
    a: 'Три способа:\n1. Кнопка «Задать вопрос библиотекарю» — ответ придёт в историю обращений.\n2. Блок «Консультации» — выберите свободное время для онлайн-встречи со специалистом.\n3. Очно — в библиотеке; режим работы указан на сайте lib.enu.kz.\nДля сложных задач (поисковая стратегия для обзора, анализ публикаций) лучше бронировать консультацию.',
    src: ['hours'] },
  { id: 'kb20', cat: 'Научные консультации', views: 33,
    q: 'Где проходят обучающие семинары?',
    keys: 'семинары семинар обучающие где проходят вебинары мастер-классы тренинги расписание',
    a: 'Библиотека проводит тренинги, вебинары и мастер-классы по информационной грамотности и научным базам данных — очно и онлайн. Расписание публикуется в блоке «Мероприятия по вашему профилю» на странице «Научный паспорт»: формат и место указаны в карточке занятия. Онлайн-участники получают ссылку в уведомлении перед началом.',
    src: ['lib'] },
  { id: 'kb21', cat: 'Научные консультации', views: 45,
    q: 'Как записаться на обучение по научным базам данных?',
    keys: 'записаться запись обучение обучения базы базам базах данных научным курсы тренинг регистрация семинар',
    a: '1. Откройте «Научный паспорт» → блок «Мероприятия по вашему профилю».\n2. Нажмите «Записаться» у нужного занятия — место закрепится за вами, сотрудники увидят вас в списке участников.\n3. Для самостоятельного обучения подойдут курсы Wiley Researcher Academy: полный доступ открывается после регистрации аккаунта из сети университета (по IP-адресу).',
    src: ['wra', 'natsub'] },
  { id: 'kb22', cat: 'Поиск литературы', views: 66,
    q: 'Как организовать систематический обзор литературы?',
    keys: 'систематический обзор обзора организовать провести prisma протокол скрининг метаанализ обзор литературы',
    a: '1. Сформулируйте вопрос по схеме PICO/PEO и зарегистрируйте протокол (PROSPERO для наук о здоровье или OSF).\n2. Составьте поисковую стратегию минимум для двух баз (Scopus, Web of Science, PubMed) — помогут конструктор запросов и консультация библиотекаря.\n3. Удалите дубликаты, проведите скрининг по названиям и аннотациям, затем по полным текстам — желательно вдвоём (например, в Rayyan).\n4. Извлеките данные и оцените риск систематической ошибки (RoB 2, ROBINS-I).\n5. Опишите процесс по PRISMA 2020 и постройте блок-схему.',
    src: ['prisma', 'prospero'] },
  { id: 'kb23', cat: 'Библиометрия', views: 79,
    q: 'Как узнать квартиль журнала?',
    keys: 'квартиль квартиля журнала журнал q1 q2 импакт-фактор citescore sjr jcr рейтинг проверить индексацию',
    a: '• Scopus: Sources → найдите журнал → CiteScore и процентиль по каждой предметной категории.\n• SJR (scimagojr.com) — бесплатные квартили на основе данных Scopus.\n• Web of Science: Journal Citation Reports — импакт-фактор и квартиль по категориям.\nКвартили пересчитываются каждый год и различаются по категориям — проверяйте актуальные данные перед подачей статьи.',
    src: ['sjr', 'jcr'] },
  { id: 'kb24', cat: 'Библиометрия', views: 57,
    q: 'Как создать ORCID и связать его со Scopus?',
    keys: 'orcid создать зарегистрировать связать профиль автора scopus author id researcherid идентификатор',
    a: '1. Зарегистрируйтесь на orcid.org — получите 16-значный идентификатор вида 0000-0002-1825-0097.\n2. Добавьте место работы и публикации (Add works → Search & link: Scopus, Crossref).\n3. Проверьте свой профиль автора в Scopus и при необходимости исправьте его через Author Feedback Wizard, связав с ORCID.\n4. В Web of Science создайте профиль исследователя (бывший ResearcherID) и импортируйте публикации из ORCID.\nУкажите ORCID в научном паспорте — рекомендации станут точнее.',
    src: ['orcid'] },
  { id: 'kb25', cat: 'Техническая поддержка', views: 38,
    q: 'Не открывается научная база из университета — что делать?',
    keys: 'не открывается не работает ошибка доступ запрещен access denied база не грузится техническая проблема вход',
    a: '1. Убедитесь, что вы в сети ЕНУ (не через мобильный интернет и не через VPN).\n2. Очистите cookies или откройте сайт в режиме инкогнито либо в другом браузере.\n3. Проверьте, входит ли журнал в подписку: платформа может открываться, а конкретный журнал — нет.\n4. Если ошибка повторяется, создайте обращение в категории «Техническая поддержка»: укажите ресурс, время и текст ошибки.',
    src: [] },
  { id: 'kb26', cat: 'Электронные ресурсы', views: 44,
    q: 'Есть ли удалённый доступ к Wiley Online Library?',
    keys: 'wiley online library удаленный удалённый доступ из дома журналы',
    a: 'Да. Для работы вне университета воспользуйтесь инструкцией по удалённому доступу к Wiley Online Library на сайте библиотеки. ЕНУ доступны журналы национальной подписки МНВО РК и материалы открытого доступа.',
    src: ['wileyRemote', 'natsub'] }
];

const ASSIST_SUGGEST = [
  'Как получить доступ к Scopus?', 'Как пользоваться Web of Science?', 'Как найти статью по DOI?',
  'Как установить Zotero?', 'Как удалить дубликаты?', 'Как работать с Bibliometrix и Biblioshiny?',
  'Где найти диссертации по моей специальности?', 'Как записаться на обучение по научным базам данных?',
  'Scopus-қа қалай кіруге болады?'
];

/* ---------- Демо-индекс публикаций (реальные работы) ---------- */
const TOPICS = {
  reviews: 'Систематические обзоры',
  biblio: 'Библиометрия и наукометрия',
  ai: 'ИИ в образовании и науке',
  methods: 'Методология и статистика',
  writing: 'Академическое письмо',
  data: 'Открытая наука и данные'
};
const TYPE_LABEL = { article: 'Статья', conf: 'Доклад', book: 'Книга', report: 'Отчёт', standard: 'Стандарт' };

const CATALOG = [
  { id: 'c01', type: 'article', title: 'The PRISMA 2020 statement: an updated guideline for reporting systematic reviews', au: 'Page M J; McKenzie J E; Bossuyt P M; Boutron I; Hoffmann T C; Mulrow C D', etal: true, year: 2021, src: 'BMJ', jab: 'BMJ', vol: '372', art: 'n71', doi: '10.1136/bmj.n71', free: true, idx: ['Scopus', 'WoS', 'PubMed'], topic: 'reviews', keys: 'prisma систематический обзор отчётность руководство чек-лист блок-схема systematic review reporting guideline', note: 'Обновлённое руководство по отчётности систематических обзоров: чек-лист из 27 пунктов и шаблоны блок-схемы отбора исследований.' },
  { id: 'c02', type: 'article', title: 'Preferred reporting items for systematic reviews and meta-analyses: the PRISMA statement', au: 'Moher D; Liberati A; Tetzlaff J; Altman D G', year: 2009, src: 'PLoS Medicine', jab: 'PLoS Med', vol: '6', iss: '7', art: 'e1000097', doi: '10.1371/journal.pmed.1000097', free: true, idx: ['Scopus', 'WoS', 'PubMed'], topic: 'reviews', keys: 'prisma метаанализ систематический обзор отчётность meta-analysis', note: 'Первая версия заявления PRISMA, заложившая стандарт описания систематических обзоров и метаанализов.' },
  { id: 'c03', type: 'article', title: 'PRISMA-S: an extension to the PRISMA Statement for Reporting Literature Searches in Systematic Reviews', au: 'Rethlefsen M L; Kirtley S; Waffenschmidt S; Ayala A P; Moher D; Page M J; Koffel J B', year: 2021, src: 'Systematic Reviews', jab: 'Syst Rev', vol: '10', art: '39', doi: '10.1186/s13643-020-01542-z', free: true, idx: ['Scopus', 'WoS', 'PubMed'], topic: 'reviews', keys: 'prisma-s поиск литературы поисковая стратегия отчёт о поиске search reporting библиотекарь', note: 'Расширение PRISMA о документировании поиска: базы, запросы, фильтры и даты — 16 пунктов для воспроизводимости.' },
  { id: 'c04', type: 'article', title: 'PRISMA Extension for Scoping Reviews (PRISMA-ScR): checklist and explanation', au: 'Tricco A C; Lillie E; Zarin W; O’Brien K K; Colquhoun H; Levac D', etal: true, year: 2018, src: 'Annals of Internal Medicine', jab: 'Ann Intern Med', vol: '169', iss: '7', pages: '467–473', doi: '10.7326/M18-0850', free: false, idx: ['Scopus', 'WoS', 'PubMed'], topic: 'reviews', keys: 'scoping review обзор предметного поля картирующий обзор prisma-scr', note: 'Чек-лист для обзоров предметного поля (scoping reviews) и их отличия от систематических обзоров.' },
  { id: 'c05', type: 'article', title: 'Scoping studies: towards a methodological framework', au: 'Arksey H; O’Malley L', year: 2005, src: 'International Journal of Social Research Methodology', jab: 'Int J Soc Res Methodol', vol: '8', iss: '1', pages: '19–32', doi: '10.1080/1364557032000119616', free: false, idx: ['Scopus', 'WoS'], topic: 'reviews', keys: 'scoping study обзор предметного поля методология рамка этапы', note: 'Классическая пятиэтапная рамка проведения обзора предметного поля.' },
  { id: 'c06', type: 'article', title: 'Rayyan — a web and mobile app for systematic reviews', au: 'Ouzzani M; Hammady H; Fedorowicz Z; Elmagarmid A', year: 2016, src: 'Systematic Reviews', jab: 'Syst Rev', vol: '5', art: '210', doi: '10.1186/s13643-016-0384-4', free: true, idx: ['Scopus', 'WoS', 'PubMed'], topic: 'reviews', keys: 'rayyan скрининг отбор исследований приложение screening инструмент', note: 'Сервис Rayyan для совместного скрининга названий и аннотаций при подготовке обзора.' },
  { id: 'c07', type: 'article', title: 'De-duplication of database search results for systematic reviews in EndNote', au: 'Bramer W M; Giustini D; de Jonge G B; Holland L; Bekhuis T', year: 2016, src: 'Journal of the Medical Library Association', jab: 'J Med Libr Assoc', vol: '104', iss: '3', pages: '240–243', doi: '10.3163/1536-5050.104.3.014', free: true, idx: ['Scopus', 'WoS', 'PubMed'], topic: 'reviews', keys: 'дубликаты удаление endnote дедупликация de-duplication библиотекарь', note: 'Пошаговый метод удаления дубликатов в EndNote после поиска в нескольких базах.' },
  { id: 'c08', type: 'article', title: 'Optimal database combinations for literature searches in systematic reviews: a prospective exploratory study', au: 'Bramer W M; Rethlefsen M L; Kleijnen J; Franco O H', year: 2017, src: 'Systematic Reviews', jab: 'Syst Rev', vol: '6', art: '245', doi: '10.1186/s13643-017-0644-y', free: true, idx: ['Scopus', 'WoS', 'PubMed'], topic: 'reviews', keys: 'базы данных комбинация поиск полнота embase medline web of science google scholar', note: 'Какие сочетания баз данных дают наиболее полный поиск для систематического обзора.' },
  { id: 'c09', type: 'article', title: 'PRESS Peer Review of Electronic Search Strategies: 2015 guideline statement', au: 'McGowan J; Sampson M; Salzwedel D M; Cogo E; Foerster V; Lefebvre C', year: 2016, src: 'Journal of Clinical Epidemiology', jab: 'J Clin Epidemiol', vol: '75', pages: '40–46', doi: '10.1016/j.jclinepi.2016.01.021', free: false, idx: ['Scopus', 'WoS', 'PubMed'], topic: 'reviews', keys: 'press рецензирование поисковой стратегии проверка запроса библиотекарь search strategy', note: 'Руководство по взаимной проверке поисковых стратегий — полезно на консультации с библиотекарем.' },
  { id: 'c10', type: 'article', title: 'RoB 2: a revised tool for assessing risk of bias in randomised trials', au: 'Sterne J A C; Savović J; Page M J; Elbers R G; Blencowe N S; Boutron I', etal: true, year: 2019, src: 'BMJ', jab: 'BMJ', vol: '366', art: 'l4898', doi: '10.1136/bmj.l4898', free: false, idx: ['Scopus', 'WoS', 'PubMed'], topic: 'reviews', keys: 'риск систематической ошибки rob 2 рандомизированные исследования risk of bias оценка качества', note: 'Инструмент Cochrane для оценки риска систематической ошибки в рандомизированных исследованиях.' },
  { id: 'c11', type: 'article', title: 'ROBINS-I: a tool for assessing risk of bias in non-randomised studies of interventions', au: 'Sterne J A; Hernán M A; Reeves B C; Savović J; Berkman N D; Viswanathan M', etal: true, year: 2016, src: 'BMJ', jab: 'BMJ', vol: '355', art: 'i4919', doi: '10.1136/bmj.i4919', free: true, idx: ['Scopus', 'WoS', 'PubMed'], topic: 'reviews', keys: 'robins-i нерандомизированные исследования риск систематической ошибки оценка', note: 'Оценка риска систематической ошибки для нерандомизированных исследований вмешательств.' },
  { id: 'c12', type: 'article', title: 'GRADE: an emerging consensus on rating quality of evidence and strength of recommendations', au: 'Guyatt G H; Oxman A D; Vist G E; Kunz R; Falck-Ytter Y; Alonso-Coello P; Schünemann H J', year: 2008, src: 'BMJ', jab: 'BMJ', vol: '336', iss: '7650', pages: '924–926', doi: '10.1136/bmj.39489.470347.AD', free: true, idx: ['Scopus', 'WoS', 'PubMed'], topic: 'reviews', keys: 'grade качество доказательств сила рекомендаций доказательная', note: 'Подход GRADE к оценке качества доказательств и силы рекомендаций.' },
  { id: 'c13', type: 'article', title: 'bibliometrix: an R-tool for comprehensive science mapping analysis', au: 'Aria M; Cuccurullo C', year: 2017, src: 'Journal of Informetrics', jab: 'J Informetr', vol: '11', iss: '4', pages: '959–975', doi: '10.1016/j.joi.2017.08.007', free: false, idx: ['Scopus', 'WoS'], topic: 'biblio', keys: 'bibliometrix biblioshiny библиометрия наукометрия r картирование науки science mapping', note: 'Пакет bibliometrix для R и интерфейс biblioshiny для библиометрического анализа.' },
  { id: 'c14', type: 'article', title: 'Software survey: VOSviewer, a computer program for bibliometric mapping', au: 'van Eck N J; Waltman L', year: 2010, src: 'Scientometrics', jab: 'Scientometrics', vol: '84', iss: '2', pages: '523–538', doi: '10.1007/s11192-009-0146-3', free: true, idx: ['Scopus', 'WoS'], topic: 'biblio', keys: 'vosviewer библиометрические карты визуализация сети соавторства co-citation', note: 'Программа VOSviewer для построения и визуализации библиометрических карт.' },
  { id: 'c15', type: 'article', title: 'How to conduct a bibliometric analysis: an overview and guidelines', au: 'Donthu N; Kumar S; Mukherjee D; Pandey N; Lim W M', year: 2021, src: 'Journal of Business Research', jab: 'J Bus Res', vol: '133', pages: '285–296', doi: '10.1016/j.jbusres.2021.04.070', free: false, idx: ['Scopus', 'WoS'], topic: 'biblio', keys: 'библиометрический анализ руководство как провести performance analysis science mapping', note: 'Этапы библиометрического анализа, методы и типичные ошибки.' },
  { id: 'c16', type: 'article', title: 'An index to quantify an individual’s scientific research output', au: 'Hirsch J E', year: 2005, src: 'Proceedings of the National Academy of Sciences of the USA', jab: 'Proc Natl Acad Sci U S A', vol: '102', iss: '46', pages: '16569–16572', doi: '10.1073/pnas.0507655102', free: true, idx: ['Scopus', 'WoS', 'PubMed'], topic: 'biblio', keys: 'индекс хирша h-index наукометрия показатели автора цитирование', note: 'Статья, в которой предложен индекс Хирша (h-index).' },
  { id: 'c17', type: 'article', title: 'The history and meaning of the journal impact factor', au: 'Garfield E', year: 2006, src: 'JAMA', jab: 'JAMA', vol: '295', iss: '1', pages: '90–93', doi: '10.1001/jama.295.1.90', free: false, idx: ['Scopus', 'WoS', 'PubMed'], topic: 'biblio', keys: 'импакт-фактор журнала jcr история метрики журналов', note: 'Создатель импакт-фактора объясняет историю показателя и его корректное использование.' },
  { id: 'c18', type: 'article', title: 'The journal coverage of Web of Science and Scopus: a comparative analysis', au: 'Mongeon P; Paul-Hus A', year: 2016, src: 'Scientometrics', jab: 'Scientometrics', vol: '106', iss: '1', pages: '213–228', doi: '10.1007/s11192-015-1765-5', free: false, idx: ['Scopus', 'WoS'], topic: 'biblio', keys: 'покрытие web of science scopus сравнение журналов базы данных', note: 'Сравнение охвата журналов в Web of Science и Scopus по областям знаний и странам.' },
  { id: 'c19', type: 'article', title: 'Google Scholar, Scopus and the Web of Science: a longitudinal and cross-disciplinary comparison', au: 'Harzing A-W; Alakangas S', year: 2016, src: 'Scientometrics', jab: 'Scientometrics', vol: '106', iss: '2', pages: '787–804', doi: '10.1007/s11192-015-1798-9', free: false, idx: ['Scopus', 'WoS'], topic: 'biblio', keys: 'google scholar scopus web of science сравнение цитирования дисциплины', note: 'Как различаются число публикаций и цитирований в трёх системах в разных дисциплинах.' },
  { id: 'c20', type: 'article', title: 'Google Scholar, Microsoft Academic, Scopus, Dimensions, Web of Science, and OpenCitations’ COCI: a multidisciplinary comparison of coverage via citations', au: 'Martín-Martín A; Thelwall M; Orduna-Malea E; Delgado López-Cózar E', year: 2021, src: 'Scientometrics', jab: 'Scientometrics', vol: '126', iss: '1', pages: '871–906', doi: '10.1007/s11192-020-03690-4', free: true, idx: ['Scopus', 'WoS'], topic: 'biblio', keys: 'охват цитирований dimensions opencitations google scholar сравнение источников', note: 'Сравнение охвата цитирований в шести источниках данных — аргумент при выборе базы для анализа.' },
  { id: 'c21', type: 'article', title: 'Growth rates of modern science: a bibliometric analysis based on the number of publications and cited references', au: 'Bornmann L; Mutz R', year: 2015, src: 'Journal of the Association for Information Science and Technology', jab: 'J Assoc Inf Sci Technol', vol: '66', iss: '11', pages: '2215–2222', doi: '10.1002/asi.23329', free: false, idx: ['Scopus', 'WoS'], topic: 'biblio', keys: 'рост науки число публикаций библиометрия темпы', note: 'Оценка темпов роста научной литературы по числу публикаций и цитируемых работ.' },
  { id: 'c22', type: 'article', title: 'The FAIR Guiding Principles for scientific data management and stewardship', au: 'Wilkinson M D; Dumontier M; Aalbersberg I J; Appleton G; Axton M; Baak A', etal: true, year: 2016, src: 'Scientific Data', jab: 'Sci Data', vol: '3', art: '160018', doi: '10.1038/sdata.2016.18', free: true, idx: ['Scopus', 'WoS', 'PubMed'], topic: 'data', keys: 'fair данные открытая наука управление данными data management репозиторий', note: 'Принципы FAIR: как сделать исследовательские данные находимыми, доступными, совместимыми и пригодными для повторного использования.' },
  { id: 'c23', type: 'article', title: 'Why most published research findings are false', au: 'Ioannidis J P A', year: 2005, src: 'PLoS Medicine', jab: 'PLoS Med', vol: '2', iss: '8', art: 'e124', doi: '10.1371/journal.pmed.0020124', free: true, idx: ['Scopus', 'WoS', 'PubMed'], topic: 'methods', keys: 'воспроизводимость статистическая значимость дизайн исследования ложноположительные reproducibility', note: 'Почему многие опубликованные результаты не воспроизводятся: мощность, предвзятость, гибкость анализа.' },
  { id: 'c24', type: 'article', title: 'Using thematic analysis in psychology', au: 'Braun V; Clarke V', year: 2006, src: 'Qualitative Research in Psychology', jab: 'Qual Res Psychol', vol: '3', iss: '2', pages: '77–101', doi: '10.1191/1478088706qp063oa', free: false, idx: ['Scopus', 'WoS'], topic: 'methods', keys: 'тематический анализ качественные методы интервью кодирование qualitative', note: 'Шестиэтапный тематический анализ — один из самых цитируемых текстов о качественных методах.' },
  { id: 'c25', type: 'article', title: 'Systematic review of research on artificial intelligence applications in higher education – where are the educators?', au: 'Zawacki-Richter O; Marín V I; Bond M; Gouverneur F', year: 2019, src: 'International Journal of Educational Technology in Higher Education', jab: 'Int J Educ Technol High Educ', vol: '16', art: '39', doi: '10.1186/s41239-019-0171-0', free: true, idx: ['Scopus', 'WoS'], topic: 'ai', keys: 'искусственный интеллект высшее образование систематический обзор ai higher education преподаватели', note: 'Систематический обзор применения ИИ в высшем образовании и вывод о недостатке педагогической перспективы.' },
  { id: 'c26', type: 'article', title: 'ChatGPT for good? On opportunities and challenges of large language models for education', au: 'Kasneci E; Sessler K; Küchemann S; Bannert M; Dementieva D; Fischer F', etal: true, year: 2023, src: 'Learning and Individual Differences', jab: 'Learn Individ Differ', vol: '103', art: '102274', doi: '10.1016/j.lindif.2023.102274', free: false, idx: ['Scopus', 'WoS'], topic: 'ai', keys: 'chatgpt большие языковые модели образование возможности риски llm генеративный искусственный интеллект', note: 'Возможности и риски больших языковых моделей для обучения на разных уровнях образования.' },
  { id: 'c27', type: 'article', title: '“So what if ChatGPT wrote it?” Multidisciplinary perspectives on opportunities, challenges and implications of generative conversational AI for research, practice and policy', au: 'Dwivedi Y K; Kshetri N; Hughes L; Slade E L; Jeyaraj A; Kar A K', etal: true, year: 2023, src: 'International Journal of Information Management', jab: 'Int J Inf Manage', vol: '71', art: '102642', doi: '10.1016/j.ijinfomgt.2023.102642', free: false, idx: ['Scopus', 'WoS'], topic: 'ai', keys: 'генеративный искусственный интеллект chatgpt исследования политика академическая честность авторство', note: 'Междисциплинарный взгляд на последствия генеративного ИИ для исследований, практики и политики.' },
  { id: 'c28', type: 'article', title: 'ChatGPT is fun, but not an author', au: 'Thorp H H', year: 2023, src: 'Science', jab: 'Science', vol: '379', iss: '6630', pages: '313', doi: '10.1126/science.adg7879', free: false, idx: ['Scopus', 'WoS', 'PubMed'], topic: 'ai', keys: 'авторство искусственный интеллект этика публикаций chatgpt редакционная политика', note: 'Позиция журнала Science: инструменты ИИ не могут быть авторами научных работ.' },
  { id: 'c29', type: 'article', title: 'Deep learning', au: 'LeCun Y; Bengio Y; Hinton G', year: 2015, src: 'Nature', jab: 'Nature', vol: '521', iss: '7553', pages: '436–444', doi: '10.1038/nature14539', free: false, idx: ['Scopus', 'WoS', 'PubMed'], topic: 'ai', keys: 'глубокое обучение нейронные сети машинное обучение deep learning искусственный интеллект', note: 'Обзор основ глубокого обучения от трёх ключевых авторов направления.' },
  { id: 'c30', type: 'conf', title: 'Attention is all you need', au: 'Vaswani A; Shazeer N; Parmar N; Uszkoreit J; Jones L; Gomez A N; Kaiser Ł; Polosukhin I', year: 2017, src: 'Advances in Neural Information Processing Systems 30 (NIPS 2017)', vol: '30', pages: '5998–6008', doi: '10.48550/arXiv.1706.03762', free: true, idx: [], topic: 'ai', keys: 'трансформер внимание языковые модели transformer attention нейросеть искусственный интеллект', note: 'Статья, в которой предложена архитектура «трансформер» — основа современных языковых моделей.' },
  { id: 'c31', type: 'book', title: 'Cochrane handbook for systematic reviews of interventions', au: 'Higgins J P T; Thomas J; Chandler J; Cumpston M; Li T; Page M J; Welch V A', editors: true, year: 2019, ed: '2nd', city: 'Chichester', publisher: 'John Wiley & Sons', doi: '10.1002/9781119536604', free: false, idx: [], topic: 'reviews', keys: 'cochrane руководство систематические обзоры вмешательств метаанализ handbook', note: 'Главное руководство Cochrane по методологии систематических обзоров и метаанализа; актуальная онлайн-версия открыта на сайте Cochrane.' },
  { id: 'c32', type: 'book', title: 'Research design: qualitative, quantitative, and mixed methods approaches', au: 'Creswell J W; Creswell J D', year: 2018, ed: '5th', city: 'Thousand Oaks', publisher: 'SAGE', idx: [], topic: 'methods', keys: 'дизайн исследования качественные количественные смешанные методы mixed methods методология', note: 'Базовый учебник по выбору дизайна исследования: качественный, количественный и смешанный подходы.' },
  { id: 'c33', type: 'book', title: 'Discovering statistics using IBM SPSS Statistics', au: 'Field A', year: 2018, ed: '5th', city: 'London', publisher: 'SAGE', idx: [], topic: 'methods', keys: 'статистика spss анализ данных учебник регрессия дисперсионный анализ', note: 'Учебник по статистическому анализу в SPSS с разбором допущений и интерпретации.' },
  { id: 'c34', type: 'book', title: 'Statistical power analysis for the behavioral sciences', au: 'Cohen J', year: 1988, ed: '2nd', city: 'Hillsdale, NJ', publisher: 'Lawrence Erlbaum Associates', idx: [], topic: 'methods', keys: 'мощность исследования размер эффекта объём выборки power analysis effect size статистика', note: 'Классический источник о мощности, размере эффекта (d Коэна) и расчёте объёма выборки.' },
  { id: 'c35', type: 'book', title: 'Writing your journal article in twelve weeks: a guide to academic publishing success', au: 'Belcher W L', year: 2019, ed: '2nd', city: 'Chicago', publisher: 'University of Chicago Press', idx: [], topic: 'writing', keys: 'академическое письмо статья публикация план написания журнал writing', note: 'Пошаговая программа подготовки статьи к подаче в журнал за 12 недель.' },
  { id: 'c36', type: 'book', title: 'The craft of research', au: 'Booth W C; Colomb G G; Williams J M; Bizup J; FitzGerald W T', year: 2016, ed: '4th', city: 'Chicago', publisher: 'University of Chicago Press', idx: [], topic: 'writing', keys: 'исследовательская работа аргументация вопрос исследования академическое письмо', note: 'Как сформулировать исследовательский вопрос, выстроить аргументацию и изложить результаты.' },
  { id: 'c37', type: 'book', title: 'How to write and publish a scientific paper', au: 'Gastel B; Day R A', year: 2022, ed: '9th', city: 'Cambridge', publisher: 'Cambridge University Press', idx: [], topic: 'writing', keys: 'научная статья написание публикация imrad рецензирование академическое письмо', note: 'Структура научной статьи, подача в журнал и работа с рецензентами.' },
  { id: 'c38', type: 'report', title: 'Procedures for performing systematic reviews', au: 'Kitchenham B', year: 2004, city: 'Keele', publisher: 'Keele University', series: 'Technical Report TR/SE-0401', idx: [], topic: 'reviews', keys: 'систематический обзор программная инженерия процедура протокол kitchenham', note: 'Методика систематических обзоров, адаптированная для инженерных и компьютерных наук.' },
  { id: 'c39', type: 'standard', lang: 'ru', title: 'ГОСТ 7.1–2003. Библиографическая запись. Библиографическое описание. Общие требования и правила составления', au: '', year: 2004, city: 'Москва', publisher: 'ИПК Издательство стандартов', idx: [], topic: 'writing', keys: 'гост библиографическое описание оформление списка литературы стандарт библиография', note: 'Межгосударственный стандарт библиографического описания — основа оформления списков литературы в диссертациях.' },
  { id: 'c40', type: 'article', title: 'PRISMA2020: an R package and Shiny app for producing PRISMA 2020-compliant flow diagrams, with interactivity for optimised digital transparency and Open Synthesis', au: 'Haddaway N R; Page M J; Pritchard C C; McGuinness L A', year: 2022, src: 'Campbell Systematic Reviews', jab: 'Campbell Syst Rev', vol: '18', iss: '2', art: 'e1230', doi: '10.1002/cl2.1230', free: true, idx: [], topic: 'reviews', keys: 'prisma блок-схема диаграмма r shiny flow diagram инструмент', note: 'Бесплатный инструмент для построения блок-схемы PRISMA 2020 по данным отбора исследований.' }
];

const JOURNALS = [
  { t: 'International Journal of Educational Technology in Higher Education', p: 'SpringerOpen', oa: true, topics: ['ai'], keys: 'искусственный интеллект образование технологии высшее' },
  { t: 'Computers & Education', p: 'Elsevier', topics: ['ai'], keys: 'искусственный интеллект цифровое обучение образование' },
  { t: 'Education and Information Technologies', p: 'Springer', topics: ['ai'], keys: 'образование информационные технологии искусственный интеллект' },
  { t: 'Studies in Higher Education', p: 'Taylor & Francis', topics: ['ai', 'writing'], keys: 'высшее образование докторантура исследовательская подготовка' },
  { t: 'Systematic Reviews', p: 'BMC', oa: true, topics: ['reviews'], keys: 'систематические обзоры протоколы методология' },
  { t: 'Research Synthesis Methods', p: 'Wiley', topics: ['reviews'], keys: 'метаанализ синтез доказательств систематические обзоры' },
  { t: 'Scientometrics', p: 'Springer', topics: ['biblio'], keys: 'библиометрия наукометрия цитирование' },
  { t: 'Journal of Informetrics', p: 'Elsevier', topics: ['biblio'], keys: 'библиометрия информетрия показатели' },
  { t: 'Learned Publishing', p: 'Wiley', topics: ['writing', 'biblio'], keys: 'научные публикации издательское дело академическое письмо' }
];

const SPECIALTIES = [
  'Педагогика и психология', 'Языки и литература', 'Журналистика и информация', 'Социальные науки',
  'Бизнес и управление', 'Право', 'Биологические и смежные науки', 'Физические и химические науки',
  'Математика и статистика', 'Информационно-коммуникационные технологии', 'Инженерия и инженерное дело',
  'Архитектура и строительство', 'Здравоохранение', 'Искусство и гуманитарные науки'
];

/* ---------- Шаблоны научного плана (типовые, уточняются с руководителем) ---------- */
const TRACKS = { dis: 'Диссертация', pub: 'Публикации', conf: 'Конференции', intern: 'Стажировка', def: 'Защита', prac: 'Практика' };
const PLAN_PHD = [
  { k: 'topic', t: 'Утвердить тему диссертации и индивидуальный учебный план', tr: 'dis', m: 1 },
  { k: 'prospect', t: 'Согласовать план-проспект диссертации с научным руководителем', tr: 'dis', m: 3 },
  { k: 'review', t: 'Систематический обзор литературы по PRISMA 2020', tr: 'dis', m: 6 },
  { k: 'method', t: 'Методология и дизайн исследования, этическое одобрение', tr: 'dis', m: 8 },
  { k: 'conf1', t: 'Доклад на конференции молодых учёных (тезисы)', tr: 'conf', m: 9 },
  { k: 'art1', t: 'Статья 1 (обзорная): подача в журнал Scopus / Web of Science', tr: 'pub', m: 11 },
  { k: 'data', t: 'Сбор эмпирических данных', tr: 'dis', m: 15 },
  { k: 'intern', t: 'Зарубежная научная стажировка', tr: 'intern', m: 18 },
  { k: 'art2', t: 'Статья 2 (эмпирическая): подача в журнал', tr: 'pub', m: 21 },
  { k: 'analysis', t: 'Анализ данных, главы 2–3', tr: 'dis', m: 24 },
  { k: 'conf2', t: 'Международная конференция: доклад', tr: 'conf', m: 26 },
  { k: 'art3', t: 'Статья 3 в рекомендованном издании РК', tr: 'pub', m: 28 },
  { k: 'full', t: 'Полный текст диссертации, проверка на заимствования', tr: 'dis', m: 30 },
  { k: 'pre', t: 'Предзащита на кафедре', tr: 'dis', m: 32 },
  { k: 'defense', t: 'Защита в диссертационном совете', tr: 'def', m: 33 }
];
const PLAN_MA = [
  { k: 'topic', t: 'Утвердить тему магистерской диссертации и индивидуальный учебный план', tr: 'dis', m: 1 },
  { k: 'review', t: 'Обзор литературы по теме', tr: 'dis', m: 3 },
  { k: 'method', t: 'Методология и план исследования', tr: 'dis', m: 5 },
  { k: 'conf1', t: 'Тезисы на конференции', tr: 'conf', m: 7 },
  { k: 'data', t: 'Сбор и обработка данных', tr: 'dis', m: 10 },
  { k: 'art1', t: 'Статья по результатам исследования', tr: 'pub', m: 13 },
  { k: 'practice', t: 'Научно-исследовательская практика', tr: 'prac', m: 15 },
  { k: 'text', t: 'Текст диссертации, проверка на заимствования', tr: 'dis', m: 18 },
  { k: 'pre', t: 'Предзащита', tr: 'dis', m: 20 },
  { k: 'defense', t: 'Защита магистерской диссертации', tr: 'def', m: 21 }
];

/* ---------- Библиотека научных промптов ---------- */
const PROMPTS = [
  { id: 'p01', cat: 'Поиск', title: 'Поисковая стратегия для Scopus и Web of Science', desc: 'Ключевые концепты, синонимы на трёх языках и готовые запросы.',
    tpl: 'Ты — библиотекарь-эксперт по систематическому поиску литературы.\nТема исследования: {{тема}}.\n1) Выдели 2–4 ключевых концепта (схема PICO или PEO).\n2) Для каждого концепта предложи синонимы и варианты написания на английском, а также эквиваленты на русском и казахском.\n3) Составь запросы для Scopus (TITLE-ABS-KEY), Web of Science (TS=) и PubMed с операторами AND/OR и усечением *.\n4) Предложи фильтры (годы, тип документа, язык) и объясни, как расширить или сузить выдачу.' },
  { id: 'p02', cat: 'Поиск', title: 'Ключевые слова для статьи', desc: '6–8 ключевых слов на трёх языках с учётом терминов научных баз.',
    tpl: 'Предложи 6–8 ключевых слов для статьи на тему «{{тема}}» на английском, русском и казахском языках. Учитывай термины, которые используются в Scopus и Web of Science, и избегай слишком общих слов.\nАннотация (если есть):\n{{текст}}' },
  { id: 'p03', cat: 'Обзор', title: 'Матрица синтеза литературы', desc: 'Таблица по исследованиям: цель, дизайн, выборка, результаты, ограничения.',
    tpl: 'Ниже — аннотации исследований. Составь таблицу: автор и год | цель | дизайн и выборка | основные результаты | ограничения | значение для темы «{{тема}}». Ничего не добавляй от себя: если сведений нет, пиши «нет данных».\n\nАннотации:\n{{текст}}' },
  { id: 'p04', cat: 'Обзор', title: 'Пробелы в исследованиях', desc: 'Что изучено недостаточно и какие вопросы из этого следуют.',
    tpl: 'Проанализируй аннотации ниже и определи 3–5 исследовательских пробелов по теме «{{тема}}»: что изучено недостаточно, какие методы, выборки или контексты (например, Казахстан и Центральная Азия) не представлены. Для каждого пробела предложи формулировку исследовательского вопроса.\n\nАннотации:\n{{текст}}' },
  { id: 'p05', cat: 'Методология', title: 'Соответствие методов цели и гипотезам', desc: 'Проверка дизайна исследования до сбора данных.',
    tpl: 'Тема: {{тема}}.\nЦель, задачи и гипотезы исследования:\n{{текст}}\n\nОцени, соответствует ли выбранный дизайн цели и гипотезам; укажи риски для валидности и предложи улучшения. Ответ — по пунктам.' },
  { id: 'p06', cat: 'Статистика', title: 'Выбор статистического метода', desc: 'Методы, допущения и представление результатов по APA.',
    tpl: 'Подбери статистические методы для моего исследования. Переменные, шкалы измерения, размер и структура выборки:\n{{текст}}\n\nДля каждого метода укажи допущения, способ их проверки и как представить результат по требованиям APA (статистика, df, p, размер эффекта).' },
  { id: 'p07', cat: 'Письмо', title: 'План статьи в структуре IMRaD', desc: 'Что писать в каждом разделе, какие нужны таблицы и рисунки.',
    tpl: 'Составь подробный план научной статьи по теме «{{тема}}» в структуре IMRaD: что писать в каждом разделе, примерный объём, какие таблицы и рисунки нужны.\nТип статьи и данные, которые у меня есть:\n{{текст}}' },
  { id: 'p08', cat: 'Письмо', title: 'Структурированная аннотация', desc: 'Purpose, Methods, Results, Conclusions — до 250 слов.',
    tpl: 'Перепиши текст в структурированную аннотацию (Purpose, Methods, Results, Conclusions) объёмом до 250 слов на английском. Сохрани все факты и ничего не добавляй.\n\nТекст:\n{{текст}}' },
  { id: 'p09', cat: 'Письмо', title: 'Академическая редактура абзаца', desc: 'Ясность и точность терминов без изменения смысла.',
    tpl: 'Отредактируй абзац в академическом стиле: ясность, точность терминов, связность. Не меняй смысл и данные. После текста перечисли основные правки.\n\nАбзац:\n{{текст}}' },
  { id: 'p10', cat: 'Перевод', title: 'Академический перевод с глоссарием', desc: 'Перевод с сохранением терминологии дисциплины.',
    tpl: 'Переведи текст на {{язык}} в академическом стиле. Сохрани терминологию области «{{специальность}}». После перевода дай глоссарий из 5–10 ключевых терминов: оригинал — перевод.\n\nТекст:\n{{текст}}' },
  { id: 'p11', cat: 'Перевод', title: 'Аннотация на трёх языках', desc: 'Қазақша, русский и English с единой терминологией.',
    tpl: 'Подготовь аннотацию и ключевые слова на казахском, русском и английском языках по тексту ниже. Сохрани единую терминологию во всех трёх версиях.\n\nТекст:\n{{текст}}' },
  { id: 'p12', cat: 'Рецензирование', title: 'Самопроверка перед подачей', desc: 'Рецензия по пяти критериям с оценками и рекомендациями.',
    tpl: 'Выступи в роли рецензента международного журнала. Оцени рукопись по критериям: актуальность и обоснование проблемы; соответствие методов цели и гипотезам; корректность статистики; сопоставление результатов с предыдущими исследованиями; обоснованность выводов. Для каждого критерия — оценка от 1 до 5 и конкретные рекомендации.\n\nРукопись:\n{{текст}}' },
  { id: 'p13', cat: 'Рецензирование', title: 'Ответ рецензенту', desc: 'Вежливый ответ по пунктам с указанием внесённых правок.',
    tpl: 'Помоги составить вежливый ответ рецензенту по пунктам: благодарность, ответ на каждое замечание, что изменено в рукописи (с указанием раздела).\nЗамечания рецензента и мои правки:\n{{текст}}' },
  { id: 'p14', cat: 'Публикация', title: 'Критерии выбора журнала', desc: 'Что проверить на сайте журнала и в научных базах.',
    tpl: 'Тема статьи: «{{тема}}».\nАннотация:\n{{текст}}\n\nПредложи критерии выбора журнала (тематика, аудитория, тип статей, сроки, открытый доступ) и список вопросов, которые нужно проверить на официальном сайте журнала и в Scopus / Web of Science. Не называй квартили и стоимость публикации — их нужно проверять в актуальных источниках.' },
  { id: 'p15', cat: 'Планирование', title: 'План главы диссертации', desc: 'Разделы, аргументы и источники, которые нужно найти.',
    tpl: 'Тема диссертации: «{{тема}}». Составь подробный план главы «{{текст}}»: разделы, ключевые аргументы, источники, которые нужно найти, и связь с задачами исследования.' },
  { id: 'p16', cat: 'Этика', title: 'Декларация об использовании ИИ', desc: 'Текст для раздела «Методы» или «Благодарности».',
    tpl: 'Составь краткую декларацию об использовании инструментов искусственного интеллекта для раздела «Методы» или «Благодарности»: какие инструменты использовались, для каких задач ({{текст}}), как проверялись результаты. Учти, что ИИ не может быть автором публикации.' },

  /* ---- Журналы из перечня КОКСОН: статья по педагогике (рус. и каз.) ---- */
  { id: 'p17', cat: 'КОКСОН', title: 'Статья по педагогике для журнала КОКСОН', desc: 'Структура статьи на русском, аннотации на трёх языках; результаты — только по вашим данным.',
    ex: { label: 'Пример: адаптация иностранных студентов', vals: {
      'тема': 'Социокультурная адаптация в структуре кросс-культурной коммуникации иностранных студентов',
      'дизайн': 'эмпирическое (опрос, тестирование, интервью)',
      'основа': 'разграничение психологической и социокультурной адаптации (Searle & Ward, 1990); шкала социокультурной адаптации SCAS (Ward & Kennedy, 1999); интегративная теория коммуникации и кросс-культурной адаптации Y. Y. Kim (2001); компетентностный подход — межкультурная коммуникативная компетенция',
      'данные': 'Выборка: иностранные студенты [вуз, город], n = [ ]; страна происхождения, курс, специальность, язык обучения, срок пребывания в Казахстане.\nМетодики: SCAS (Ward & Kennedy, 1999) — [версия, перевод, альфа Кронбаха]; [шкала межкультурной коммуникативной компетентности]; [анкета об общении с казахстанскими студентами и соотечественниками].\nРезультаты: [вставьте таблицы из SPSS или R].' } },
    tpl: `Ты — опытный учёный-педагог и научный редактор журналов из перечня изданий, рекомендуемых Комитетом по обеспечению качества в сфере науки и высшего образования МНВО РК (перечень КОКСОН).

ЗАДАЧА: помоги подготовить научную статью по педагогике на русском языке на тему «{{тема}}» для журнала: {{журнал}}. Правила журнала для авторов важнее общих требований ниже.

ДИЗАЙН ИССЛЕДОВАНИЯ: {{дизайн}}.
ТЕОРЕТИКО-МЕТОДОЛОГИЧЕСКАЯ ОСНОВА: {{основа}}.
МОИ ДАННЫЕ (выборка, методики, результаты):
{{данные}}

ПРАВИЛА ЧЕСТНОСТИ:
1. Не придумывай данные, результаты, статистику, цитаты, авторов, публикации и DOI.
2. Результаты пиши только по моим данным. Если данных нет, ставь метки [ДАННЫЕ: что нужно] и давай шаблоны таблиц без чисел.
3. Ссылайся только на источники, которые можно проверить; где источника нет, ставь [НУЖЕН ИСТОЧНИК: какой].
4. Высказывания участников приводи только из моих материалов.

СТРУКТУРА СТАТЬИ:
1. Заголовок на казахском, русском и английском — до 12 слов, с ключевыми терминами темы.
2. Сведения об авторах — шаблон для заполнения: ФИО на трёх языках, учёная степень, звание, должность, организация, город, страна, ORCID, e-mail.
3. Аннотации на казахском, русском и английском — по 200–250 слов: актуальность, цель, методы, результаты, выводы; без ссылок и нерасшифрованных аббревиатур; числа — только из моих данных.
4. Ключевые слова — 6–8 на трёх языках: предметная область, объект, метод.
5. Введение (400–600 слов): актуальность для высшего образования Казахстана с опорой на действующие стратегические документы (например, Концепцию развития высшего образования и науки РК на 2023–2029 годы — проверь, что документ действует); анализ не менее 8 исследований за последние 5 лет; проблема, цель и задачи.
6. Материалы и методы (300–500 слов): дизайн; выборка — численность, возраст, курс, специальность, регион Казахстана, а для иностранных студентов ещё страна происхождения, язык обучения и срок пребывания; методики с обоснованием, источником, сведениями о переводе и надёжности (альфа Кронбаха); этапы и сроки; обработка данных (SPSS, R или Excel); этика — информированное согласие, анонимность, одобрение этического комитета.
7. Результаты (600–900 слов): по задачам исследования; не менее 2 таблиц и рисунок; точные p-значения и размеры эффекта по APA 7. Динамику «до и после» описывай только при экспериментальном дизайне; в теоретико-обзорной статье вместо статистики — сравнительные таблицы и аналитический синтез источников.
8. Обсуждение (400–600 слов): интерпретация через теоретическую основу; сопоставление с отечественными и зарубежными исследованиями; неожиданные результаты; практическая значимость для вузов Казахстана; ограничения.
9. Заключение (200–300 слов): выводы по каждой задаче, рекомендации преподавателям и вузам, направления дальнейших исследований.
10. Список литературы — APA 7 или стиль журнала: не менее 20 источников, около 60% за последние 5 лет, не менее 40% зарубежных, не менее 2 на казахском языке; DOI или URL, где они есть.

ТРЕБОВАНИЯ К ТЕКСТУ: 6000–8000 слов основного текста; академический стиль без разговорных выражений; каждое утверждение подкреплено ссылкой; оригинальность не ниже 80% (проверю в системе антиплагиата).
ПЕДАГОГИЧЕСКИЙ ФОКУС: соответствие стандартам и стратегическим документам РК в сфере образования; полиязычное образование и цифровизация; компетентностный подход.

ПОРЯДОК РАБОТЫ: сначала дай план статьи и список недостающих данных; после моего подтверждения пиши по одному-два раздела за ответ.` },
  { id: 'p18', cat: 'КОКСОН', lang: 'kk', title: 'КОКСОН журналына педагогика бойынша мақала', desc: 'Қазақ тіліндегі мақала құрылымы, үш тілдегі аңдатпа; нәтижелер — тек сіздің деректеріңіз бойынша.',
    ex: { label: 'Мысал: шетелдік студенттердің бейімделуі', vals: {
      'тақырып': 'Шетелдік студенттердің кросс-мәдени коммуникация құрылымындағы әлеуметтік-мәдени бейімделуі',
      'зерттеу': 'эмпирикалық (сауалнама, тестілеу, сұхбат)',
      'негіз': 'психологиялық және әлеуметтік-мәдени бейімделудің ажыратылуы (Searle & Ward, 1990); әлеуметтік-мәдени бейімделу шкаласы SCAS (Ward & Kennedy, 1999); Y. Y. Kim ұсынған коммуникация мен кросс-мәдени бейімделудің интегративтік теориясы (Kim, 2001); құзыреттілік тәсіл — мәдениетаралық коммуникативтік құзыреттілік',
      'деректер': 'Іріктеме: шетелдік студенттер [ЖОО, қала], n = [ ]; шыққан елі, курсы, мамандығы, оқыту тілі, Қазақстанда болу мерзімі.\nӘдістемелер: SCAS (Ward & Kennedy, 1999) — [нұсқасы, аудармасы, Кронбах альфасы]; [мәдениетаралық коммуникативтік құзыреттілік шкаласы]; [қазақстандық студенттермен және отандастарымен қарым-қатынас туралы сауалнама].\nНәтижелер: [SPSS немесе R кестелерін қойыңыз].' } },
    tpl: `Сен — Қазақстан Республикасы Ғылым және жоғары білім министрлігінің Ғылым және жоғары білім саласында сапаны қамтамасыз ету комитеті ұсынатын ғылыми басылымдар тізбесіндегі (КОКСОН тізбесі) журналдармен жұмыс тәжірибесі мол педагог-ғалым әрі ғылыми редакторсың.

МІНДЕТ: «{{тақырып}}» тақырыбы бойынша педагогикадан қазақ тіліндегі ғылыми мақаланы дайындауға көмектес. Журнал: {{басылым}}. Журналдың авторларға қойылатын талаптары төмендегі жалпы талаптардан басым.

ЗЕРТТЕУ ДИЗАЙНЫ: {{зерттеу}}.
ТЕОРИЯЛЫҚ-ӘДІСНАМАЛЫҚ НЕГІЗ: {{негіз}}.
МЕНІҢ ДЕРЕКТЕРІМ (іріктеме, әдістемелер, нәтижелер):
{{деректер}}

АДАЛДЫҚ ЕРЕЖЕЛЕРІ:
1. Деректерді, нәтижелерді, статистиканы, дәйексөздерді, авторларды, жарияланымдарды және DOI-ды ойдан шығарма.
2. Нәтижелерді тек менің деректерім бойынша жаз. Деректер болмаса, [ДЕРЕКТЕР: не қажет] белгісін қойып, кестелерді сансыз үлгі ретінде бер.
3. Тек тексеруге болатын дереккөздерге сілтеме жаса; дереккөз жоқ жерде [ДЕРЕККӨЗ ҚАЖЕТ: қандай] белгісін қой.
4. Қатысушылардың сөздерін тек менің материалдарымнан келтір.

МАҚАЛА ҚҰРЫЛЫМЫ:
1. Тақырып қазақ, орыс және ағылшын тілдерінде — 12 сөзге дейін, тақырыптың негізгі терминдерімен.
2. Авторлар туралы мәлімет — толтыруға арналған үлгі: аты-жөні үш тілде, ғылыми дәрежесі, ғылыми атағы, лауазымы, ұйымы, қаласы, елі, ORCID, e-mail.
3. Аңдатпа қазақ, орыс және ағылшын тілдерінде — әрқайсысы 200–250 сөз: өзектілігі, мақсаты, әдістері, нәтижелері, қорытындылары; сілтемесіз және ашылмаған қысқартуларсыз; сандар — тек менің деректерімнен.
4. Түйін сөздер — үш тілде 6–8: пәндік сала, зерттеу нысаны, әдіс.
5. Кіріспе (400–600 сөз): Қазақстанның жоғары білім беру жүйесі үшін өзектілігі — қолданыстағы стратегиялық құжаттарға сүйеніп (мысалы, ҚР Үкіметінің 2023 жылғы 28 наурыздағы № 248 қаулысымен бекітілген жоғары білім мен ғылымды дамытудың 2023–2029 жылдарға арналған тұжырымдамасы — құжаттың күшінде екенін тексер); соңғы 5 жылдағы кемінде 8 зерттеуге талдау; мәселе, мақсат және міндеттер.
6. Материалдар мен әдістер (300–500 сөз): дизайн; іріктеме — саны, жасы, курсы, мамандығы, Қазақстан өңірі, ал шетелдік студенттер үшін шыққан елі, оқыту тілі және Қазақстанда болу мерзімі; әдістемелер — таңдау негіздемесімен, дереккөзімен, аудармасы мен сенімділігі туралы мәліметпен (Кронбах альфасы); кезеңдері мен мерзімдері; деректерді өңдеу (SPSS, R немесе Excel); этика — ақпараттандырылған келісім, анонимдік, этика комитетінің мақұлдауы.
7. Нәтижелер (600–900 сөз): зерттеу міндеттері бойынша; кемінде 2 кесте және сурет; APA 7 бойынша нақты p-мәндері мен әсер мөлшері. «Дейін және кейін» динамикасын тек эксперименттік дизайнда сипатта; теориялық-шолу мақаласында статистиканың орнына салыстырмалы кестелер мен дереккөздердің талдамалы синтезі беріледі.
8. Талқылау (400–600 сөз): нәтижелерді теориялық негіз тұрғысынан түсіндіру; отандық және шетелдік зерттеулермен салыстыру; күтпеген нәтижелер; Қазақстан жоғары оқу орындары үшін практикалық маңызы; зерттеудің шектеулері.
9. Қорытынды (200–300 сөз): әр міндет бойынша тұжырымдар, оқытушылар мен ЖОО-ға ұсынымдар, болашақ зерттеу бағыттары.
10. Әдебиеттер тізімі — APA 7 немесе журнал стилі: кемінде 20 дереккөз, шамамен 60%-ы соңғы 5 жылдағы, кемінде 40%-ы шетелдік, кемінде 2-еуі қазақ тілінде; бар болса, DOI немесе URL.

МӘТІНГЕ ҚОЙЫЛАТЫН ТАЛАПТАР: негізгі мәтін 6000–8000 сөз; ауызекі сөйлеу тіркестерінсіз академиялық стиль; әр тұжырым сілтемемен расталады; түпнұсқалығы кемінде 80% (антиплагиат жүйесінде тексеремін).
ПЕДАГОГИКАЛЫҚ БАҒДАР: ҚР білім беру саласындағы стандарттар мен стратегиялық құжаттарға сәйкестік; көптілді білім беру және цифрландыру; құзыреттілік тәсіл.

ЖҰМЫС ТӘРТІБІ: алдымен мақала жоспарын және жетіспейтін деректер тізімін бер; мен растағаннан кейін әр жауапта бір-екі бөлім жаз.` },

  /* ---- Проверка научной новизны ---- */
  { id: 'p19', cat: 'Публикация', title: 'Проверка научной новизны и план библиометрической статьи', desc: 'Сравнение с опубликованными обзорами, пробелы, пять названий, IMRaD и запросы для трёх баз.',
    tpl: `Выступай в роли международного эксперта по библиометрическому анализу, систематическим обзорам и подготовке публикаций для журналов Scopus и Web of Science. Тема исследования: «{{тема}}».

ПРАВИЛА: не придумывай публикации, авторов, DOI и результаты исследований. Называй только работы, которые можешь проверить, с DOI или ссылкой. Если у тебя нет доступа к поиску в реальном времени, не перечисляй статьи, а дай стратегию проверки.

ЗАДАНИЕ 1. Научная новизна
1. Оцени актуальность, новизну и оригинальность темы.
2. Найди опубликованные библиометрические и систематические обзоры по теме и сравни их с моей темой в таблице: база, период, число записей, инструменты, главные выводы, чем отличается моя работа.
3. Определи исследовательские пробелы и недостаточно изученные направления, в том числе для Казахстана и Центральной Азии.
4. Объясни, какой новый вклад может внести исследование, и предложи способы усилить новизну.

ЗАДАНИЕ 2. Название и структура
1. Предложи пять названий статьи на английском и выбери лучшее с обоснованием.
2. Разработай структуру IMRaD с подробными заголовками и подзаголовками.
3. Сформулируй цель, задачи, исследовательские вопросы и ожидаемый вклад.

ЗАДАНИЕ 3. Поисковые запросы
Составь воспроизводимые запросы для Scopus (TITLE-ABS-KEY), Web of Science Core Collection (TS=) и PubMed (MeSH и [tiab]) с операторами AND, OR, NOT, усечением и полями каждой базы. Обоснуй каждое ограничение и отметь, что проверить перед запуском.` },

  /* ---- Цепочка PRISMA 2020: систематический обзор и метаанализ ---- */
  { id: 'p20', cat: 'PRISMA 2020', lang: 'en', chain: true, title: '0. Мастер-промпт', desc: 'Правила работы и карточка проекта. Вставьте один раз в начале чата.',
    tpl: `You are my methodological co-author for a systematic review and meta-analysis (SR/MA). Follow PRISMA 2020 (the 27-item checklist and PRISMA 2020 for Abstracts), PRISMA-S for reporting the search, the Cochrane Handbook for methods and GRADE for the certainty of evidence.

PROJECT CARD
- Topic: {{тема}}
- Review question (PICO/PECO): Population [P]; Intervention/Exposure [I]; Comparator [C]; Outcomes: primary [O1], secondary [O2, O3]
- Eligible study designs: [e.g., RCTs, cohort, case-control, cross-sectional, diagnostic accuracy]
- Effect measure: [MD / SMD / OR / RR / proportion / sensitivity and specificity]
- Databases: PubMed/MEDLINE, Scopus, Web of Science Core Collection; other sources: [reference lists, ClinicalTrials.gov, grey literature]
- Search period: [inception] to [DD Month YYYY]; language limits: [none]
- Protocol: [PROSPERO CRD... / OSF / not registered]
- Target journal and reference style: [journal; Vancouver / APA / AMA]
- Tools: R and RStudio (meta, metafor, PRISMA2020, robvis); [Rayyan / Zotero / EndNote] for deduplication and screening

RULES
1. Never invent studies, authors, titles, DOIs, numbers or quotations. Every data point must come from files I attach or text I paste, with its location (page, table or figure).
2. If information is missing or unclear, write NR (not reported) or [VERIFY: ...]. Do not guess.
3. Do not calculate pooled estimates yourself. Write runnable R code; I will run it and paste the output; then write results using only that output.
4. Cite only references from the library I attach (RIS, BibTeX or a list of DOIs). Where a statement needs a source that is not in my library, insert [CITATION NEEDED: type of evidence].
5. Your screening, data extraction and risk-of-bias judgements are suggestions for two independent human reviewers. Mark every uncertain decision as "Unclear".
6. Keep numbers identical across the flow diagram, tables, figures, results and abstract, and report any mismatch you notice.
7. Formats: tables in Markdown; Excel as an .xlsx file (or a tab-separated table I can paste into Excel); R code as one runnable script with install/library lines and comments; manuscript text in formal academic English, past tense for Methods and Results.

Reply "Ready" and list any fields of the project card that are still empty.` },
  { id: 'p21', cat: 'PRISMA 2020', lang: 'en', chain: true, title: '1. План статьи и поисковая стратегия', desc: 'Структура по пунктам PRISMA 2020, запросы для трёх баз, Table S1 и текст Methods о поиске.',
    tpl: `STAGE 1 - Article outline, search strategy (Table S1) and search methods

Using the project card:
1. Propose 3 titles in the format "[topic]: a systematic review and meta-analysis" (20 words or fewer).
2. Write the full outline of the article with all headings and subheadings: Title page; Abstract; Introduction; Methods (protocol and registration, eligibility criteria, information sources, search strategy, selection process, data collection process, data items, study risk of bias assessment, effect measures, synthesis methods, reporting bias assessment, certainty assessment); Results; Discussion; Conclusions; Declarations; References; Supplementary material. Next to each subheading, give the PRISMA 2020 item number it covers.
3. Build a concept table: for each PICO concept, list MeSH terms and free-text synonyms, spelling variants and truncations.
4. Write the complete search strings:
   - PubMed/MEDLINE: MeSH terms [Mesh] plus free text [tiab];
   - Scopus: TITLE-ABS-KEY(...);
   - Web of Science Core Collection: TS=(...).
   Combine synonyms with OR within a concept and concepts with AND. Do not add filters that reduce sensitivity unless the project card requires them; justify every limit you apply.
5. Present the strings as "Table S1. Full electronic search strategies for PubMed/MEDLINE, Scopus and Web of Science Core Collection (last searched [DATE])" with the columns: Database | Platform | Search string | Limits | Date searched | Records retrieved. Leave "Records retrieved" empty - I will fill it in.
6. Write the Methods text for "Information sources" and "Search strategy" (PRISMA 2020 items 6-7, PRISMA-S): databases and platforms, coverage dates and the date of the last search, other sources, language and date limits, peer review of the search (PRESS) and the deduplication tool. Cite Table S1. Use [NUMBER] placeholders instead of any numbers you do not have.` },
  { id: 'p22', cat: 'PRISMA 2020', lang: 'en', chain: true, att: 'записи после удаления дубликатов (.txt, .ris или .csv), затем полные тексты', title: '2. Скрининг и схема PRISMA 2020', desc: 'Решения по записям с кодами исключения, список включённых исследований и код схемы в R.',
    tpl: `STAGE 2 - Screening, list of included studies and PRISMA 2020 flow diagram (R)

Search results: PubMed/MEDLINE = [n]; Scopus = [n]; Web of Science Core Collection = [n]; total = [n]; after removal of duplicates = [n].
Attached: [file names] - the deduplicated records (title and abstract) exported from [Rayyan / Zotero / EndNote].

1. Restate the eligibility criteria as an Include/Exclude table by PICOS element and define exclusion codes: E1 wrong population; E2 wrong intervention or exposure; E3 wrong comparator; E4 wrong outcome; E5 wrong study design; E6 review, editorial, letter or conference abstract; E7 duplicate or overlapping sample; E8 insufficient data for meta-analysis; E9 full text not available.
2. Title/abstract screening: work through the records in batches of 50-100 and return a table: Record ID | First author | Year | Title | Decision (Include / Exclude / Unclear) | Exclusion code | One-line justification. When in doubt, choose Unclear (it goes to full-text review).
3. When I upload the full texts of the Include and Unclear records, assess them with the same table and one exclusion code per excluded report (the main reason).
4. Give the final list of included studies: Author et al., year | Title | Journal | DOI | Design | Sample size.
5. Write R code for the PRISMA 2020 flow diagram with the PRISMA2020 package (fill its CSV template, then PRISMA_data() and PRISMA_flowdiagram()), using the numbers from steps 2-3 and the exclusion reasons with their counts. Add stopifnot() checks that the numbers add up at every stage. If the package fails, give an alternative with DiagrammeR. Save the figure as 300 dpi TIFF and PDF.
6. Write R code to calculate Cohen's kappa for the agreement between two reviewers (input: a CSV with both reviewers' decisions).
7. Write the Methods text for "Selection process" (item 8): two independent reviewers, how disagreements were resolved, and that AI-assisted pre-screening was verified by both reviewers. Then write the Results text for "Study selection" (items 16a-16b), citing Figure 1.` },
  { id: 'p23', cat: 'PRISMA 2020', lang: 'en', chain: true, att: 'PDF включённых исследований', title: '3. Характеристики и риск систематической ошибки', desc: 'Table 1 со ссылками на страницы PDF, предварительная оценка риска и код robvis.',
    tpl: `STAGE 3 - Characteristics of included studies and risk of bias

Attached: PDFs of the included studies.

1. Build "Table 1. Characteristics of the included studies" with the columns: Study (author, year) | Country | Design | Setting and recruitment | Sample size (total; per group) | Population (age mean +/- SD or range; % female; key clinical features) | Intervention or exposure | Comparator | Outcomes and measurement instruments | Follow-up | Funding and conflicts of interest. Write NR when something is not reported; do not infer.
2. Add a column "Source (page/table)" for each row and list every uncertain value under the table as a [VERIFY] item.
3. Choose the risk-of-bias tool for each design: RoB 2 for randomised trials, ROBINS-I for non-randomised studies of interventions, the Newcastle-Ottawa Scale for cohort and case-control studies, QUADAS-2 for diagnostic accuracy studies, the JBI checklist for prevalence studies. Pre-fill the domain-level judgements, each with a supporting quotation and page number, and mark them as preliminary.
4. Write R code (robvis) for the traffic-light and summary plots, with a CSV template of the judgements.
5. Write the Methods text for the data collection process, data items and study risk of bias assessment (items 9-11), and the Results text for study characteristics and risk of bias in studies (items 17-18), citing Table 1 and Figure 2.` },
  { id: 'p24', cat: 'PRISMA 2020', lang: 'en', chain: true, att: 'PDF включённых исследований', title: '4А. Извлечение данных и код метаанализа', desc: 'Таблица извлечения для Excel и скрипт R (meta или metafor) — считает R, а не ИИ.',
    tpl: `STAGE 4A - Data extraction (Excel) and meta-analysis code (R)

Attached: PDFs of the included studies. Outcomes to extract: [O1, O2 ...]; time points: [...]; effect measure: [...]; pre-specified subgroups: [...].

1. Create the extraction sheet as an .xlsx file (or a tab-separated table I can paste into Excel), one row per study x outcome x time point, with the columns: study_id, author, year, outcome, time_point, design, n_exp, n_ctrl, mean_exp, sd_exp, mean_ctrl, sd_ctrl (or events_exp, total_exp, events_ctrl, total_ctrl; or effect estimate with lower and upper 95% CI), unit/scale, direction of effect, source (page/table/figure), notes.
2. If a study reports median and IQR or range, SE or a CI instead of the SD, do not convert silently: keep the raw values in separate columns and propose the conversion method (e.g., Wan et al. 2014; Luo et al. 2018) in the notes.
3. Write one runnable R script (meta or metafor) that: reads the Excel file; fits random-effects models (REML estimator for tau^2, Hartung-Knapp adjustment); reports the pooled effect with 95% CI, the 95% prediction interval, I^2, tau^2 and Cochran's Q; draws forest plots; runs leave-one-out analysis and a sensitivity analysis excluding studies at high risk of bias; runs only the pre-specified subgroup analyses; and, only for outcomes with 10 or more studies, draws a funnel plot and runs Egger's test. Save every figure as 300 dpi TIFF and PDF (Figure_3.tiff and so on).
4. List the figures and tables the script will produce, with draft titles.

I will run the script and paste the console output in my next message.` },
  { id: 'p25', cat: 'PRISMA 2020', lang: 'en', chain: true, title: '4Б. Результаты по выводу R', desc: 'Текст Results, таблица GRADE, подписи рисунков и таблиц — только по вашему выводу R.',
    tpl: `STAGE 4B - Results text, tables and figure legends (from my R output)

My R console output:
{{вывод}}

1. Using only these values, write the Results subsections: results of individual studies; results of syntheses (one paragraph per outcome: number of studies and participants, pooled effect with 95% CI, prediction interval, heterogeneity); sensitivity and subgroup analyses; reporting biases; certainty of evidence (PRISMA 2020 items 19-22).
2. Build "Table 2. Summary of findings (GRADE)": outcome | studies (participants) | effect (95% CI) | certainty (high / moderate / low / very low) | reasons for downgrading (risk of bias, inconsistency, indirectness, imprecision, publication bias) | plain-language statement.
3. Write numbered titles and legends for all figures and tables (PRISMA flow diagram, risk-of-bias plots, forest plots, funnel plot, Table 1, Table 2, Table S1), with abbreviations and model details in each legend.
4. Show where each figure and table is first cited in the text; numbering must follow the order of first citation (Figure 1, Figure 2...; Table 1...; Supplementary Table S1...).
5. List any inconsistency between the R output and the earlier tables.` },
  { id: 'p26', cat: 'PRISMA 2020', lang: 'en', chain: true, title: '5.0. Поиск свежей литературы', desc: 'Запросы для PubMed и Scopus за 2021–2026 годы, если библиотеки источников ещё нет.',
    tpl: `STAGE 5.0 - Search for recent literature (only if I have no reference library yet)

For the Introduction and Discussion I need studies and reviews published in 2021-2026 on: [background topics, e.g., burden of the condition; previous reviews; mechanisms; clinical guidelines]. Give me search strings for PubMed and Scopus limited to 2021-2026, one per topic, and tell me which article types to keep. Do not list any articles yourself - I will run the searches and attach the export.` },
  { id: 'p27', cat: 'PRISMA 2020', lang: 'en', chain: true, att: 'библиотека источников 2021–2026 (RIS, BibTeX или список DOI) и черновик Methods и Results', title: '5. Discussion, Conclusions, Introduction, Abstract', desc: 'Разделы статьи и ключевые слова MeSH — только по вашей библиотеке источников.',
    tpl: `STAGE 5 - Discussion, Conclusions, Introduction, Abstract, keywords

Attached: my reference library for 2021-2026 [RIS / BibTeX / list of DOIs] and the current draft (Methods and Results).
Write in this order:
1. Discussion (900-1,100 words, about 2 pages): principal findings; comparison with previous reviews and primary studies; possible explanations and mechanisms; interpretation of heterogeneity and certainty of evidence; strengths and limitations of the evidence and of the review process; implications for practice, policy and research.
2. Conclusions (one paragraph, 150 words or fewer): consistent with the GRADE certainty, no new data.
3. Introduction (450-550 words, about 1 page): burden of the problem; current knowledge; gaps and inconsistencies in previous reviews; rationale; objective stated in PICO terms.
4. Structured abstract (250 words or fewer, PRISMA 2020 for Abstracts): Background; Objectives; Methods (eligibility criteria, information sources with the date of the last search, risk of bias tool, synthesis methods); Results (number of studies and participants, main effect estimates with 95% CI and heterogeneity); Conclusions; Registration. Give the exact word count.
5. Five keywords as exact MeSH headings (I will check them in the MeSH Browser).

Citation rules: cite only references from my attached library published in 2021-2026 (methodological references such as RoB 2, GRADE or the Cochrane Handbook may be older). Use [Author, Year] markers that I can convert in Zotero or EndNote. Where my library has no suitable source, insert [CITATION NEEDED: type of evidence]. At the end, list the references you used in [STYLE].` },
  { id: 'p28', cat: 'PRISMA 2020', lang: 'en', chain: true, att: 'рукопись и приложения', title: '6. Финальная проверка', desc: 'Чек-листы PRISMA 2020, расхождения в числах и декларации перед подачей.',
    tpl: `STAGE 6 - Final check before submission

Attached: the full manuscript and the supplementary files.

1. Fill in the PRISMA 2020 checklist (27 items) and the PRISMA 2020 for Abstracts checklist (12 items) as a table: Item | Reported (Yes / Partly / No) | Location (section, page or paragraph) | What to add.
2. Check that all numbers are consistent across the abstract, the flow diagram, the tables, the figures and the text; list each mismatch with its locations.
3. Check that every figure and table is cited in numerical order and that every in-text citation has an entry in the reference list.
4. Draft the declarations: statement on the use of AI tools (which tools, for which tasks, how outputs were verified by the authors; AI is not an author), data and code availability, funding, conflicts of interest, and author contributions (CRediT).` }
];
const PROMPT_VARS = {
  'тема': { label: 'Тема исследования', from: 'topic' },
  'специальность': { label: 'Научная специальность', from: 'spec' },
  'язык': { label: 'Язык перевода', options: ['английский', 'казахский', 'русский'] },
  'текст': { label: 'Ваш текст', area: true },
  'журнал': { label: 'Журнал и его требования', ph: 'Журнал из перечня, язык статьи, объём, стиль ссылок' },
  'дизайн': { label: 'Дизайн исследования', options: ['эмпирическое (опрос, тестирование, интервью)', 'экспериментальное (до и после эксперимента)', 'теоретико-обзорное'] },
  'основа': { label: 'Теоретико-методологическая основа', area: true, ph: 'Теории, модели и методики, на которые вы опираетесь' },
  'данные': { label: 'Ваши данные: выборка, методики, результаты', area: true, ph: 'Описание выборки и результаты из SPSS, R или Excel. Если данных пока нет, оставьте поле пустым — ИИ поставит метки вместо чисел.' },
  'тақырып': { label: 'Зерттеу тақырыбы', from: 'topic' },
  'басылым': { label: 'Журнал және оның талаптары', ph: 'Тізбедегі журнал, мақала тілі, көлемі, сілтеме стилі' },
  'зерттеу': { label: 'Зерттеу дизайны', options: ['эмпирикалық (сауалнама, тестілеу, сұхбат)', 'эксперименттік (эксперименттен бұрын және кейін)', 'теориялық-шолу'] },
  'негіз': { label: 'Теориялық-әдіснамалық негіз', area: true, ph: 'Сүйенетін теориялар, модельдер және әдістемелер' },
  'деректер': { label: 'Деректеріңіз: іріктеме, әдістемелер, нәтижелер', area: true, ph: 'Іріктеме сипаттамасы және SPSS, R немесе Excel нәтижелері. Деректер әлі жоқ болса, өрісті бос қалдырыңыз — ЖИ сандардың орнына белгі қояды.' },
  'вывод': { label: 'Вывод консоли R', area: true, req: true, ph: 'Вставьте вывод R целиком' }
};

/* ---------- Модули следующего этапа ---------- */
const ROADMAP = [
  { id: 'dissertation', n: 4, en: 'Dissertation Bot', ru: 'Помощник по диссертации', ic: 'file', d: 'Структура глав, требования к оформлению и проверка согласованности цели, задач и выводов.' },
  { id: 'stats', n: 5, en: 'Statistics Bot', ru: 'Статистический анализ', ic: 'pie', d: 'Выбор метода, проверка допущений и описание результатов по требованиям APA.' },
  { id: 'writing', n: 6, en: 'Academic Writing Bot', ru: 'Академическое письмо', ic: 'pen', d: 'Подготовка и редактирование рукописей, аннотации на трёх языках.' },
  { id: 'prisma', n: 7, en: 'PRISMA Bot', ru: 'Систематические обзоры', ic: 'list', prompts: 'PRISMA 2020', d: 'Поисковые запросы, импорт записей, дубликаты, скрининг с фиксацией причин исключения, данные для диаграммы PRISMA 2020. Решения о включении подтверждает исследователь. Цепочка промптов для этих этапов уже есть в библиотеке.' },
  { id: 'journal', n: 8, en: 'AI Journal Finder', ru: 'Подбор журнала', ic: 'target', d: 'Анализ аннотации и подбор журналов с фильтрами. Индексацию, квартиль и стоимость проверяют по официальным источникам; принятие статьи не гарантируется.', beta: true },
  { id: 'reviewer', n: 9, en: 'AI Reviewer Simulator', ru: 'Виртуальный рецензент', ic: 'clip', d: 'Предварительная рецензия: актуальность, методология, статистика, обсуждение, выводы.', beta: true },
  { id: 'translator', n: 10, en: 'AI Academic Translator', ru: 'Академический перевод', ic: 'globe', d: 'Перевод между казахским, русским и английским с сохранением терминологии.', beta: true },
  { id: 'collab', n: 11, en: 'AI Research Collaboration', ru: 'Совместные исследования', ic: 'network', d: 'Поиск соавторов по открытым данным научных паспортов и совместные проекты.' },
  { id: 'dashboard', n: 12, en: 'AI Dissertation Dashboard', ru: 'Панель диссертации', ic: 'chart', d: 'Графики выполнения индивидуального плана, написания глав, публикаций и исправления замечаний экспертов. Готовность текста и готовность к защите показываются отдельно.' },
  { id: 'archive', n: 13, en: 'AI Research Archive', ru: 'Научный архив за три года', ic: 'database', d: 'Защищённое хранилище: документы докторанта, версии глав, литература, данные, публикации, заключения экспертов и материалы защиты — с поиском, экспортом и историей изменений.' },
  { id: 'report', n: 14, en: 'AI Academic Report', ru: 'Автоматические отчёты', ic: 'file', d: 'Ежемесячный, семестровый, годовой отчёт и отчёт для предзащиты из подтверждённых данных платформы; неподтверждённые сведения отмечаются для проверки.' },
  { id: 'evidence', n: 15, en: 'Research Evidence Map', ru: 'Режим предзащиты', ic: 'network', d: 'Интерактивная карта исследования для комиссии: от научного результата к главе, таблице, статистическому анализу и исходному документу.' }
];

const SAMPLES = {
  abstract: 'Цель исследования — оценить, как цифровые сервисы научной библиотеки и инструменты генеративного искусственного интеллекта влияют на исследовательскую подготовку докторантов. В смешанном дизайне сочетались анкетирование 214 магистрантов и докторантов трёх университетов Казахстана и 18 полуструктурированных интервью с научными руководителями и библиотекарями. Регулярное использование консультаций библиотеки было связано с более высокой самооценкой навыков поиска литературы, тогда как самостоятельное использование чат-ботов без обучения сопровождалось ошибками в цитировании. Результаты обосновывают модель сопровождения, сочетающую ИИ-инструменты с подтверждёнными ответами библиотекарей.',
  manuscript: 'Введение. Искусственный интеллект активно используется в высшем образовании, однако влияние ИИ-инструментов на подготовку докторантов изучено мало. Цель работы — выявить связь между использованием сервисов научной библиотеки и навыками поиска литературы.\nМетоды. Проведено онлайн-анкетирование (n = 214). Навыки поиска оценивались по шкале самооценки из 12 пунктов. Для сравнения групп использован t-критерий Стьюдента.\nРезультаты. Участники, посещавшие консультации библиотеки, показали более высокие баллы (M = 4,1 против 3,6; p < 0,05).\nОбсуждение. Полученные данные подтверждают важность библиотечного сопровождения.\nВыводы. Консультации библиотеки повышают навыки поиска литературы у всех докторантов.',
  translate: 'Систематический обзор литературы позволяет обобщить результаты исследований по заранее определённому протоколу. Поиск проводился в базах Scopus и Web of Science; после удаления дубликатов два исследователя независимо провели скрининг названий и аннотаций.'
};
