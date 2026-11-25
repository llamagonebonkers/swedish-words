(() => {
  'use strict';

  const STORAGE_KEY = 'svenska_ord_entries_v2';
  const HIDE_HINTS_KEY = 'svenska_ord_hide_hints_v1';
  const SWEDISH_ALPHABET = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    'Å', 'Ä', 'Ö'
  ];
  const collator = new Intl.Collator('sv', { sensitivity: 'base' });
  const DAY_MS = 24 * 60 * 60 * 1000;
  const SR_INTERVALS_DAYS = [1, 3, 7, 14, 30];

  const SAMPLE_ENTRIES = [
    { id: 'w1', type: 'word', term: 'anledning', en: 'Reason, cause', th: 'เหตุผล, สาเหตุ', example: 'Det finns ingen anledning att stressa.' },
    { id: 'w2', type: 'word', term: 'besvikelse', en: 'Disappointment', th: 'ความผิดหวัง', example: 'Det var en stor besvikelse.' },
    { id: 'w3', type: 'word', term: 'duktig', en: 'Good at, skilled, clever', th: 'เก่ง, ขยัน', example: 'Hon är väldigt duktig på att laga mat.' },
    { id: 'w4', type: 'word', term: 'egentligen', en: 'Actually, really', th: 'จริงๆ แล้ว, ที่จริง', example: 'Egentligen borde jag sova nu.' },
    { id: 'w5', type: 'word', term: 'fika', en: 'Coffee & pastry break with friends', th: 'พักดื่มกาแฟและกินขนม', example: 'Ska vi ta en fika efter jobbet?' },
    { id: 'w6', type: 'word', term: 'ganska', en: 'Quite, fairly, rather', th: 'ค่อนข้าง', example: 'Det är ganska kallt ute idag.' },
    { id: 'w7', type: 'word', term: 'hinna', en: 'To have time / make it in time', th: 'ทันเวลา, มีเวลาพอ', example: 'Jag tror inte att jag hinner med bussen.' },
    { id: 'w8', type: 'word', term: 'jättebra', en: 'Great, very good', th: 'ดีมาก, เยี่ยมมาก', example: 'Det låter som en jättebra idé!' },
    { id: 'w9', type: 'word', term: 'kanske', en: 'Maybe, perhaps', th: 'อาจจะ, บางที', example: 'Vi kanske ses imorgon.' },
    { id: 'w10', type: 'word', term: 'lagom', en: 'Just right, not too much or too little', th: 'พอดี, ไม่มากไม่น้อยเกินไป', example: 'Vattnet är lagom varmt.' },
    { id: 'w11', type: 'word', term: 'mysig', en: 'Cozy, pleasant, warm', th: 'อบอุ่น, น่ารัก, สบายๆ', example: 'Vi hade en mysig kväll i soffan.' },
    { id: 'w12', type: 'word', term: 'orka', en: 'To have the energy / strength to do something', th: 'มีแรง, ไหว', example: 'Jag orkar inte träna idag.' },
    { id: 'w13', type: 'word', term: 'precis', en: 'Exactly, just now', th: 'พอดีเป๊ะ, เพิ่งจะ', example: 'Jag kom precis hem.' },
    { id: 'w14', type: 'word', term: 'rolig', en: 'Fun, funny', th: 'สนุก, ตลก', example: 'Filmen var väldigt rolig.' },
    { id: 'w15', type: 'word', term: 'självklart', en: 'Of course, obviously', th: 'แน่นอน', example: 'Självklart kan jag hjälpa dig!' },
    { id: 'w16', type: 'word', term: 'trevlig', en: 'Nice, friendly, pleasant', th: 'ใจดี, น่ารัก, น่าคบ', example: 'Ha en trevlig helg!' },
    { id: 'w17', type: 'word', term: 'ungefär', en: 'Approximately, about', th: 'ประมาณ, ราวๆ', example: 'Det tar ungefär tio minuter.' },
    { id: 'w18', type: 'word', term: 'verkligen', en: 'Really, truly', th: 'จริงๆ, อย่างแท้จริง', example: 'Tack så mycket, verkligen!' },
    { id: 'w19', type: 'word', term: 'återkomma', en: 'To get back to someone, return', th: 'ติดต่อกลับ, กลับมา', example: 'Jag återkommer imorgon.' },
    { id: 'w20', type: 'word', term: 'äntligen', en: 'Finally, at last', th: 'ในที่สุด, สักที', example: 'Äntligen är det fredag!' },
    { id: 'w21', type: 'word', term: 'överens', en: 'In agreement, agreed', th: 'เห็นตรงกัน, ตกลงกัน', example: 'Vi är överens om planen.' },

    { id: 'p1', type: 'phrase', term: 'Det gör inget', en: 'No problem / It doesn’t matter', th: 'ไม่เป็นไร', example: 'Ursäkta att jag är sen! – Det gör inget.' },
    { id: 'p2', type: 'phrase', term: 'Ha det så bra', en: 'Take care / Have a great time', th: 'ดูแลตัวเองนะ / ขอให้โชคดี', example: 'Vi ses nästa vecka, ha det så bra!' },
    { id: 'p3', type: 'phrase', term: 'Hur är läget?', en: 'How’s it going? / What’s up?', th: 'เป็นไงบ้าง?', example: 'Tjena! Hur är läget?' },
    { id: 'p4', type: 'phrase', term: 'Ingen orsak', en: 'You’re welcome / No problem', th: 'ไม่เป็นไร / ด้วยความยินดี', example: 'Tack för hjälpen! – Ingen orsak.' },
    { id: 'p5', type: 'phrase', term: 'Jag hänger med', en: 'I understand / I’ll come along', th: 'ฉันเข้าใจ / ฉันไปด้วย', example: 'Ska vi gå? – Ja, jag hänger med.' },
    { id: 'p6', type: 'phrase', term: 'Komma överens', en: 'To get along / reach an agreement', th: 'เข้ากันได้ / ตกลงกันได้', example: 'De kommer väldigt bra överens.' },
    { id: 'p7', type: 'phrase', term: 'Lägga av', en: 'Stop it / Quit it (casual)', th: 'หยุดนะ / เลิกทำได้แล้ว', example: 'Lägg av, du skojar!' },
    { id: 'p8', type: 'phrase', term: 'Passa på', en: 'Take the opportunity', th: 'ถือโอกาส, คว้าโอกาส', example: 'Passa på att gå ut medan solen skiner.' },
    { id: 'p9', type: 'phrase', term: 'Ta det lugnt', en: 'Take it easy / Relax', th: 'ใจเย็นๆ / พักผ่อนสบายๆ', example: 'Ta det lugnt, vi har gott om tid.' },
    { id: 'p10', type: 'phrase', term: 'Vad synd!', en: 'What a pity! / Too bad!', th: 'น่าเสียดายจัง!', example: 'Kan du inte komma ikväll? Vad synd!' },
    { id: 'p11', type: 'phrase', term: 'Är du med?', en: 'Are you following? / Do you get it?', th: 'เข้าใจไหม? / ทันไหม?', example: 'Först klickar vi här, är du med?' }
  ];
  const SAMPLE_ID_SET = new Set(SAMPLE_ENTRIES.map((e) => e.id));

  // State
  let entries = loadEntries();
  let hideHints = loadHideHints();
  let activeTab = 'word'; // 'word' | 'phrase' | 'practice'
  let searchQuery = '';
  let selectedEntryId = null;
  let editingEntryId = null;
  let formType = 'word';
  let isScrubbing = false;
  let lastScrubbedLetter = null;
  let popupTimer = null;
  let suppressScrollPopup = false;
  let lastScrolledLetter = null;
  let scrollTicking = false;
  let lastFocusedEl = null;
  let pushedModalHistory = false;
  let lastDeletedEntry = null;
  let toastTimer = null;
  let toastActionHandler = null;
  let translateAbortController = null;
  let translateReqId = 0;
  let grammarAbortController = null;
  let duplicateEntryRef = null;
  let suggestedBaseForm = '';

  // Practice State
  let practiceFilter = 'all'; // 'all' | 'word' | 'phrase'
  let practiceQueue = [];
  let practiceDoneCount = 0;
  let practiceTotalSession = 0;
  let practiceRevealed = false;
  let practiceIgnoreDue = false;

  // Elements
  const mainEl = document.getElementById('listContainer');
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const toggleHintsBtn = document.getElementById('toggleHintsBtn');
  const eyeOpenIcon = document.getElementById('eyeOpenIcon');
  const eyeClosedIcon = document.getElementById('eyeClosedIcon');
  const settingsBtn = document.getElementById('settingsBtn');
  const addBtn = document.getElementById('addBtn');
  const tabs = document.querySelectorAll('.tab');
  const wordCountEl = document.getElementById('wordCount');
  const phraseCountEl = document.getElementById('phraseCount');
  const practiceCountEl = document.getElementById('practiceCount');
  const entriesList = document.getElementById('entriesList');
  const emptyState = document.getElementById('emptyState');
  const emptyTitle = document.getElementById('emptyTitle');
  const emptySub = document.getElementById('emptySub');
  const emptyActions = document.getElementById('emptyActions');
  const scrubber = document.getElementById('scrubber');
  const letterPopup = document.getElementById('letterPopup');
  const undoToast = document.getElementById('undoToast');
  const undoToastText = document.getElementById('undoToastText');
  const undoBtn = document.getElementById('undoBtn');

  // Practice elements
  const practiceView = document.getElementById('practiceView');
  const practiceFilters = document.querySelectorAll('.filter-pill');
  const practiceProgress = document.getElementById('practiceProgress');
  const flashcardWrap = document.getElementById('flashcardWrap');
  const flashcard = document.getElementById('flashcard');
  const cardBadge = document.getElementById('cardBadge');
  const cardSpeakBtn = document.getElementById('cardSpeakBtn');
  const cardTerm = document.getElementById('cardTerm');
  const cardTapHint = document.getElementById('cardTapHint');
  const cardAnswer = document.getElementById('cardAnswer');
  const cardEnWrap = document.getElementById('cardEnWrap');
  const cardEn = document.getElementById('cardEn');
  const cardThWrap = document.getElementById('cardThWrap');
  const cardTh = document.getElementById('cardTh');
  const cardExample = document.getElementById('cardExample');
  const practiceRevealWrap = document.getElementById('practiceRevealWrap');
  const revealAnswerBtn = document.getElementById('revealAnswerBtn');
  const practiceRateWrap = document.getElementById('practiceRateWrap');
  const rateAgainBtn = document.getElementById('rateAgainBtn');
  const rateKnewBtn = document.getElementById('rateKnewBtn');
  const practiceDone = document.getElementById('practiceDone');
  const practiceDoneTitle = document.getElementById('practiceDoneTitle');
  const practiceDoneSub = document.getElementById('practiceDoneSub');
  const practiceMoreBtn = document.getElementById('practiceMoreBtn');

  // Detail sheet
  const detailBackdrop = document.getElementById('detailBackdrop');
  const detailSheet = document.getElementById('detailSheet');
  const detailBadge = document.getElementById('detailBadge');
  const detailTerm = document.getElementById('detailTerm');
  const speakTermBtn = document.getElementById('speakTermBtn');
  const detailVoiceTip = document.getElementById('detailVoiceTip');
  const detailEnWrap = document.getElementById('detailEnWrap');
  const detailEn = document.getElementById('detailEn');
  const detailThWrap = document.getElementById('detailThWrap');
  const detailTh = document.getElementById('detailTh');
  const detailExampleWrap = document.getElementById('detailExampleWrap');
  const detailExample = document.getElementById('detailExample');
  const speakExampleBtn = document.getElementById('speakExampleBtn');
  const detailGrammarWrap = document.getElementById('detailGrammarWrap');
  const detailGrammarTitle = document.getElementById('detailGrammarTitle');
  const detailPos = document.getElementById('detailPos');
  const detailGrammarStatus = document.getElementById('detailGrammarStatus');
  const detailForms = document.getElementById('detailForms');
  const editEntryBtn = document.getElementById('editEntryBtn');
  const deleteEntryBtn = document.getElementById('deleteEntryBtn');
  const closeDetailBtn = document.getElementById('closeDetailBtn');

  // Form sheet
  const formBackdrop = document.getElementById('formBackdrop');
  const formSheet = document.getElementById('formSheet');
  const formTitle = document.getElementById('formTitle');
  const entryForm = document.getElementById('entryForm');
  const typePills = document.querySelectorAll('.type-pill');
  const termLabel = document.getElementById('termLabel');
  const termInput = document.getElementById('termInput');
  const enInput = document.getElementById('enInput');
  const thInput = document.getElementById('thInput');
  const exampleInput = document.getElementById('exampleInput');
  const suggestBtn = document.getElementById('suggestBtn');
  const duplicateNotice = document.getElementById('duplicateNotice');
  const duplicateText = document.getElementById('duplicateText');
  const editDuplicateBtn = document.getElementById('editDuplicateBtn');
  const baseFormNotice = document.getElementById('baseFormNotice');
  const useBaseFormBtn = document.getElementById('useBaseFormBtn');
  const translateStatus = document.getElementById('translateStatus');
  const svSuggestions = document.getElementById('svSuggestions');
  const enSuggestions = document.getElementById('enSuggestions');
  const thSuggestions = document.getElementById('thSuggestions');
  const exampleSuggestions = document.getElementById('exampleSuggestions');
  const retranslateThBtn = document.getElementById('retranslateThBtn');
  const formError = document.getElementById('formError');
  const cancelFormBtn = document.getElementById('cancelFormBtn');

  // Settings sheet
  const settingsBackdrop = document.getElementById('settingsBackdrop');
  const settingsSheet = document.getElementById('settingsSheet');
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const importFileInput = document.getElementById('importFileInput');
  const sampleWordsBtn = document.getElementById('sampleWordsBtn');
  const sampleWordsTitle = document.getElementById('sampleWordsTitle');
  const sampleWordsSub = document.getElementById('sampleWordsSub');
  const settingsVoiceNote = document.getElementById('settingsVoiceNote');
  const storageNote = document.getElementById('storageNote');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');

  function loadEntries() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) {
      // Ignore storage errors
    }
    return [];
  }

  function saveEntries() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (_) {
      // Ignore quota errors
    }
  }

  function loadHideHints() {
    try {
      return localStorage.getItem(HIDE_HINTS_KEY) === '1';
    } catch (_) {
      return false;
    }
  }

  function saveHideHints() {
    try {
      localStorage.setItem(HIDE_HINTS_KEY, hideHints ? '1' : '0');
    } catch (_) {}
  }

  // Request persistent storage so the browser won't silently evict localStorage
  if (navigator.storage && typeof navigator.storage.persist === 'function') {
    navigator.storage
      .persist()
      .then((persisted) => {
        if (persisted && storageNote) {
          storageNote.textContent = 'Persistent local storage enabled on this device.';
        }
      })
      .catch(() => {});
  }

  function stripLeadingArticle(term) {
    return (term || '').trim().replace(/^(en|ett)\s+/i, '');
  }

  function normalizeForSearch(str) {
    return (str || '')
      .toLocaleLowerCase('sv-SE')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function getArticleForItem(item) {
    if (!item || item.type !== 'word') return '';
    const trimmed = (item.term || '').trim();
    if (/^(en|ett)\s+/i.test(trimmed)) return '';
    const pos = item.grammar?.pos || '';
    if (pos === 'Noun (en)') return 'en';
    if (pos === 'Noun (ett)') return 'ett';
    return '';
  }

  function getSpokenTerm(item) {
    const article = getArticleForItem(item);
    return article ? `${article} ${item.term}` : item.term;
  }

  function renderTermWithArticle(container, item) {
    container.textContent = '';
    const article = getArticleForItem(item);
    if (article) {
      const tag = document.createElement('span');
      tag.className = 'article-tag';
      tag.textContent = article;
      container.appendChild(tag);
    }
    container.appendChild(document.createTextNode(item.term));
  }

  function getSortTerm(term) {
    return stripLeadingArticle(term);
  }

  function getFirstLetter(term) {
    const base = getSortTerm(term);
    if (!base) return '#';
    const first = base[0].toLocaleUpperCase('sv-SE');
    return SWEDISH_ALPHABET.includes(first) ? first : '#';
  }

  function getAlphabetOrder(letter) {
    const idx = SWEDISH_ALPHABET.indexOf(letter);
    return idx === -1 ? SWEDISH_ALPHABET.length : idx;
  }

  function matchesSearch(item, normalizedQ) {
    if (!normalizedQ) return true;
    return (
      normalizeForSearch(item.term).includes(normalizedQ) ||
      (item.en && normalizeForSearch(item.en).includes(normalizedQ)) ||
      (item.th && item.th.toLowerCase().includes(normalizedQ)) ||
      (item.example && normalizeForSearch(item.example).includes(normalizedQ))
    );
  }

  function isDueForPractice(item) {
    return !item.sr || !item.sr.dueAt || item.sr.dueAt <= Date.now();
  }

  function updateCounts() {
    const nq = normalizeForSearch(searchQuery.trim());
    let words = 0;
    let phrases = 0;
    let due = 0;

    for (const item of entries) {
      if (isDueForPractice(item)) due++;
      if (!matchesSearch(item, nq)) continue;
      if (item.type === 'phrase') phrases++;
      else words++;
    }

    wordCountEl.textContent = words;
    phraseCountEl.textContent = phrases;
    practiceCountEl.textContent = due;

    wordCountEl.classList.toggle('has-matches', Boolean(nq && words > 0 && activeTab !== 'word'));
    phraseCountEl.classList.toggle('has-matches', Boolean(nq && phrases > 0 && activeTab !== 'phrase'));
    return { words, phrases, due };
  }

  function getFilteredEntries(tabType = activeTab) {
    const nq = normalizeForSearch(searchQuery.trim());
    return entries
      .filter((item) => item.type === tabType)
      .filter((item) => matchesSearch(item, nq))
      .sort((a, b) => collator.compare(getSortTerm(a.term), getSortTerm(b.term)));
  }

  function applyHintsUI() {
    entriesList.classList.toggle('hide-hints', hideHints);
    toggleHintsBtn.setAttribute('aria-pressed', String(hideHints));
    toggleHintsBtn.setAttribute(
      'aria-label',
      hideHints ? 'Show English translations in list' : 'Hide English translations in list'
    );
    eyeOpenIcon.classList.toggle('hidden', hideHints);
    eyeClosedIcon.classList.toggle('hidden', !hideHints);
  }

  toggleHintsBtn.addEventListener('click', () => {
    hideHints = !hideHints;
    saveHideHints();
    applyHintsUI();
  });

  function switchTab(nextTab) {
    if (nextTab === activeTab) return;
    activeTab = nextTab;
    tabs.forEach((t) => {
      const active = t.dataset.tab === activeTab;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', String(active));
    });
    suppressScrollPopup = true;
    lastScrolledLetter = null;
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (activeTab === 'practice') {
      practiceIgnoreDue = false;
      buildPracticeQueue();
    }
    render();
    setTimeout(() => {
      suppressScrollPopup = false;
    }, 80);
  }

  function addSampleWords() {
    const existingKeys = new Set(entries.map((e) => normalizeForSearch(stripLeadingArticle(e.term))));
    let added = 0;
    for (const s of SAMPLE_ENTRIES) {
      const key = normalizeForSearch(stripLeadingArticle(s.term));
      if (!existingKeys.has(key)) {
        entries.push({ ...s });
        existingKeys.add(key);
        added++;
      }
    }
    saveEntries();
    render();
    showToast(added > 0 ? `Added ${added} sample words & phrases` : 'Sample words already present');
  }

  function removeSampleWords() {
    const before = entries.length;
    entries = entries.filter((e) => !SAMPLE_ID_SET.has(e.id));
    const removed = before - entries.length;
    saveEntries();
    render();
    showToast(removed > 0 ? `Removed ${removed} sample items` : 'No sample words to remove');
  }

  function render() {
    const counts = updateCounts();

    if (activeTab === 'practice') {
      mainEl.classList.add('practice-mode');
      entriesList.classList.add('hidden');
      emptyState.classList.add('hidden');
      scrubber.classList.add('hidden');
      practiceView.classList.remove('hidden');
      renderPracticeView();
      return;
    }

    mainEl.classList.remove('practice-mode');
    practiceView.classList.add('hidden');
    entriesList.classList.remove('hidden');
    scrubber.classList.remove('hidden');
    applyHintsUI();

    const filtered = getFilteredEntries(activeTab);
    entriesList.innerHTML = '';

    if (filtered.length === 0) {
      emptyState.classList.remove('hidden');
      emptyActions.innerHTML = '';
      const rawQ = searchQuery.trim();

      if (rawQ) {
        emptyTitle.textContent = 'No matches';
        emptySub.textContent = `Nothing matched "${rawQ}" in ${activeTab === 'word' ? 'Words' : 'Phrases'}.`;

        const addQBtn = document.createElement('button');
        addQBtn.type = 'button';
        addQBtn.className = 'btn-primary';
        addQBtn.textContent = `Add "${rawQ}"`;
        addQBtn.addEventListener('click', () => {
          const suggestedType = rawQ.split(/\s+/).length >= 3 ? 'phrase' : activeTab;
          openForm(null, { prefillTerm: rawQ, prefillType: suggestedType });
        });
        emptyActions.appendChild(addQBtn);

        const otherTab = activeTab === 'word' ? 'phrase' : 'word';
        const otherCount = otherTab === 'word' ? counts.words : counts.phrases;
        if (otherCount > 0) {
          const switchBtn = document.createElement('button');
          switchBtn.type = 'button';
          switchBtn.className = 'btn-secondary';
          switchBtn.textContent = `See ${otherCount} ${otherCount === 1 ? 'match' : 'matches'} in ${otherTab === 'word' ? 'Words' : 'Phrases'}`;
          switchBtn.addEventListener('click', () => switchTab(otherTab));
          emptyActions.appendChild(switchBtn);
        }
      } else if (entries.length === 0) {
        emptyTitle.textContent = activeTab === 'word' ? 'No words yet' : 'No phrases yet';
        emptySub.textContent = 'Tap + to add your own, or load starter Swedish words & phrases.';

        const sampleBtn = document.createElement('button');
        sampleBtn.type = 'button';
        sampleBtn.className = 'btn-secondary';
        sampleBtn.textContent = 'Add sample words';
        sampleBtn.addEventListener('click', addSampleWords);
        emptyActions.appendChild(sampleBtn);
      } else if (activeTab === 'word') {
        emptyTitle.textContent = 'No words yet';
        emptySub.textContent = 'Tap + to add your first word.';
      } else {
        emptyTitle.textContent = 'No phrases yet';
        emptySub.textContent = 'Tap + to add your first phrase.';
      }
      renderScrubber(new Set());
      return;
    }

    emptyState.classList.add('hidden');

    const groups = new Map();
    for (const item of filtered) {
      const letter = getFirstLetter(item.term);
      if (!groups.has(letter)) groups.set(letter, []);
      groups.get(letter).push(item);
    }

    const sortedLetters = Array.from(groups.keys()).sort(
      (a, b) => getAlphabetOrder(a) - getAlphabetOrder(b)
    );

    const fragment = document.createDocumentFragment();
    for (const letter of sortedLetters) {
      const section = document.createElement('section');
      section.className = 'letter-group';
      section.dataset.letter = letter;

      const header = document.createElement('div');
      header.className = 'letter-header';
      header.textContent = letter;
      section.appendChild(header);

      for (const item of groups.get(letter)) {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'entry-card';
        card.dataset.id = item.id;

        const textWrap = document.createElement('span');
        textWrap.className = 'entry-card-text';

        const termSpan = document.createElement('span');
        termSpan.className = 'entry-term';
        renderTermWithArticle(termSpan, item);
        textWrap.appendChild(termSpan);

        if (item.en && item.en.trim()) {
          const enSpan = document.createElement('span');
          enSpan.className = 'entry-en';
          enSpan.textContent = item.en;
          textWrap.appendChild(enSpan);
        }

        const chevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        chevron.setAttribute('class', 'entry-chevron');
        chevron.setAttribute('viewBox', '0 0 24 24');
        chevron.setAttribute('fill', 'none');
        chevron.setAttribute('stroke', 'currentColor');
        chevron.setAttribute('stroke-width', '2');
        chevron.setAttribute('stroke-linecap', 'round');
        chevron.setAttribute('stroke-linejoin', 'round');
        chevron.setAttribute('aria-hidden', 'true');
        const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        poly.setAttribute('points', '9 18 15 12 9 6');
        chevron.appendChild(poly);

        card.appendChild(textWrap);
        card.appendChild(chevron);
        card.addEventListener('click', () => openDetail(item.id));
        section.appendChild(card);
      }

      fragment.appendChild(section);
    }

    entriesList.appendChild(fragment);
    renderScrubber(new Set(sortedLetters));
  }

  function renderScrubber(availableLetters) {
    scrubber.innerHTML = '';
    for (const letter of SWEDISH_ALPHABET) {
      const el = document.createElement('span');
      el.className = 'scrubber-item' + (availableLetters.has(letter) ? ' available' : '');
      el.dataset.letter = letter;
      el.textContent = letter;
      scrubber.appendChild(el);
    }
  }

  function showLetterPopup(letter) {
    letterPopup.textContent = letter;
    letterPopup.classList.remove('hidden');
    void letterPopup.offsetWidth;
    letterPopup.classList.add('visible');

    clearTimeout(popupTimer);
    if (!isScrubbing) {
      popupTimer = setTimeout(() => {
        letterPopup.classList.remove('visible');
        popupTimer = setTimeout(() => {
          if (!isScrubbing) letterPopup.classList.add('hidden');
        }, 140);
      }, 650);
    }
  }

  function hideLetterPopup() {
    clearTimeout(popupTimer);
    popupTimer = setTimeout(() => {
      letterPopup.classList.remove('visible');
      popupTimer = setTimeout(() => {
        letterPopup.classList.add('hidden');
      }, 140);
    }, 250);
  }

  function highlightScrubberLetter(letter) {
    const items = scrubber.querySelectorAll('.scrubber-item');
    items.forEach((item) => {
      item.classList.toggle('current', item.dataset.letter === letter);
    });
  }

  function scrollToLetter(letter) {
    const groups = Array.from(entriesList.querySelectorAll('.letter-group'));
    if (groups.length === 0) return;

    const targetOrder = getAlphabetOrder(letter);
    let targetGroup = groups.find((g) => g.dataset.letter === letter);

    if (!targetGroup) {
      targetGroup =
        groups.find((g) => getAlphabetOrder(g.dataset.letter) >= targetOrder) ||
        groups[groups.length - 1];
    }

    if (targetGroup) {
      suppressScrollPopup = true;
      const headerHeight = document.querySelector('.header').offsetHeight;
      const top = targetGroup.getBoundingClientRect().top + window.scrollY - headerHeight - 4;
      window.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
      lastScrolledLetter = targetGroup.dataset.letter;
      setTimeout(() => {
        suppressScrollPopup = false;
      }, 80);
    }
  }

  function getLetterAtPointer(clientY) {
    const rect = scrubber.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(0.9999, (clientY - rect.top) / rect.height));
    const idx = Math.floor(ratio * SWEDISH_ALPHABET.length);
    return SWEDISH_ALPHABET[idx];
  }

  function handleScrub(clientY) {
    const letter = getLetterAtPointer(clientY);
    if (letter !== lastScrubbedLetter) {
      lastScrubbedLetter = letter;
      if (typeof navigator.vibrate === 'function') {
        try {
          navigator.vibrate(8);
        } catch (_) {}
      }
    }
    highlightScrubberLetter(letter);
    showLetterPopup(letter);
    scrollToLetter(letter);
  }

  scrubber.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    isScrubbing = true;
    lastScrubbedLetter = null;
    scrubber.classList.add('active');
    scrubber.setPointerCapture(e.pointerId);
    handleScrub(e.clientY);
  });

  scrubber.addEventListener('pointermove', (e) => {
    if (!isScrubbing) return;
    e.preventDefault();
    handleScrub(e.clientY);
  });

  function endScrub(e) {
    if (!isScrubbing) return;
    isScrubbing = false;
    lastScrubbedLetter = null;
    scrubber.classList.remove('active');
    if (scrubber.hasPointerCapture(e.pointerId)) {
      scrubber.releasePointerCapture(e.pointerId);
    }
    hideLetterPopup();
  }

  scrubber.addEventListener('pointerup', endScrub);
  scrubber.addEventListener('pointercancel', endScrub);
  scrubber.addEventListener(
    'touchmove',
    (e) => {
      if (e.cancelable) e.preventDefault();
    },
    { passive: false }
  );

  window.addEventListener(
    'scroll',
    () => {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(() => {
        scrollTicking = false;
        if (
          activeTab === 'practice' ||
          isScrubbing ||
          suppressScrollPopup ||
          isAnySheetOpen()
        ) {
          return;
        }
        const groups = entriesList.querySelectorAll('.letter-group');
        if (groups.length === 0) return;

        const headerHeight = document.querySelector('.header').offsetHeight + 16;
        let currentLetter = groups[0].dataset.letter;

        for (const group of groups) {
          const rect = group.getBoundingClientRect();
          if (rect.top <= headerHeight) {
            currentLetter = group.dataset.letter;
          } else {
            break;
          }
        }

        highlightScrubberLetter(currentLetter);
        if (window.scrollY > 20 && currentLetter !== lastScrolledLetter) {
          lastScrolledLetter = currentLetter;
          showLetterPopup(currentLetter);
        } else if (window.scrollY <= 20) {
          lastScrolledLetter = currentLetter;
        }
      });
    },
    { passive: true }
  );

  // Live Search
  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value;
    clearSearchBtn.classList.toggle('hidden', searchQuery.length === 0);
    if (activeTab === 'practice' && searchQuery.trim()) {
      switchTab('word');
      return;
    }
    render();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.classList.add('hidden');
    searchInput.focus();
    render();
  });

  // Tabs
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Practice (Flashcards + Spaced Repetition)
  function shuffleArray(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function getPracticeCandidates() {
    return entries.filter((item) => {
      if (practiceFilter !== 'all' && item.type !== practiceFilter) return false;
      return practiceIgnoreDue || isDueForPractice(item);
    });
  }

  function buildPracticeQueue() {
    const pool = getPracticeCandidates();
    practiceQueue = shuffleArray(pool.map((e) => e.id));
    practiceDoneCount = 0;
    practiceTotalSession = practiceQueue.length;
    practiceRevealed = false;
  }

  function renderPracticeView() {
    // Prune any deleted items from queue
    const entryMap = new Map(entries.map((e) => [e.id, e]));
    practiceQueue = practiceQueue.filter((id) => entryMap.has(id));

    const currentItem = practiceQueue.length > 0 ? entryMap.get(practiceQueue[0]) : null;
    if (!currentItem) {
      flashcardWrap.classList.add('hidden');
      practiceDone.classList.remove('hidden');
      practiceProgress.textContent = '';

      const totalForFilter = entries.filter(
        (e) => practiceFilter === 'all' || e.type === practiceFilter
      ).length;

      if (totalForFilter === 0) {
        practiceDoneTitle.textContent = 'Nothing to practice yet';
        practiceDoneSub.textContent = 'Add some words or phrases first to start practicing.';
        practiceMoreBtn.classList.add('hidden');
      } else {
        practiceDoneTitle.textContent = 'All caught up!';
        practiceDoneSub.textContent = `You’ve reviewed all due cards (${totalForFilter} total saved).`;
        practiceMoreBtn.classList.remove('hidden');
      }
      return;
    }

    practiceDone.classList.add('hidden');
    flashcardWrap.classList.remove('hidden');
    practiceProgress.textContent = `${practiceDoneCount + 1} / ${Math.max(practiceTotalSession, practiceDoneCount + practiceQueue.length)}`;

    cardBadge.textContent = currentItem.type === 'phrase' ? 'Phrase' : 'Word';
    renderTermWithArticle(cardTerm, currentItem);

    if (currentItem.en && currentItem.en.trim()) {
      cardEn.textContent = currentItem.en;
      cardEnWrap.classList.remove('hidden');
    } else {
      cardEnWrap.classList.add('hidden');
    }

    if (currentItem.th && currentItem.th.trim()) {
      cardTh.textContent = currentItem.th;
      cardThWrap.classList.remove('hidden');
    } else {
      cardThWrap.classList.add('hidden');
    }

    if (currentItem.example && currentItem.example.trim()) {
      cardExample.textContent = `"${currentItem.example}"`;
      cardExample.classList.remove('hidden');
    } else {
      cardExample.classList.add('hidden');
    }

    cardAnswer.classList.toggle('hidden', !practiceRevealed);
    cardTapHint.classList.toggle('hidden', practiceRevealed);
    practiceRevealWrap.classList.toggle('hidden', practiceRevealed);
    practiceRateWrap.classList.toggle('hidden', !practiceRevealed);
  }

  function revealPracticeCard() {
    if (practiceRevealed || practiceQueue.length === 0) return;
    practiceRevealed = true;
    renderPracticeView();
  }

  function ratePracticeCard(knewIt) {
    if (practiceQueue.length === 0) return;
    stopSpeaking();
    const id = practiceQueue.shift();
    const item = entries.find((e) => e.id === id);

    if (item) {
      if (knewIt) {
        const prevReps = item.sr?.reps || 0;
        const nextInterval = SR_INTERVALS_DAYS[Math.min(prevReps, SR_INTERVALS_DAYS.length - 1)];
        item.sr = {
          reps: prevReps + 1,
          intervalDays: nextInterval,
          dueAt: Date.now() + nextInterval * DAY_MS
        };
        practiceDoneCount++;
      } else {
        item.sr = {
          reps: 0,
          intervalDays: 0,
          dueAt: Date.now()
        };
        // Re-insert soon in the same session so the learner practices it again
        const reinsertAt = Math.min(2, practiceQueue.length);
        practiceQueue.splice(reinsertAt, 0, id);
      }
      saveEntries();
    }

    practiceRevealed = false;
    updateCounts();
    renderPracticeView();
  }

  practiceFilters.forEach((pill) => {
    pill.addEventListener('click', () => {
      const nextFilter = pill.dataset.filter;
      if (nextFilter === practiceFilter) return;
      practiceFilter = nextFilter;
      practiceIgnoreDue = false;
      practiceFilters.forEach((p) => p.classList.toggle('active', p.dataset.filter === practiceFilter));
      buildPracticeQueue();
      renderPracticeView();
    });
  });

  flashcard.addEventListener('click', (e) => {
    if (e.target.closest('button')) return;
    revealPracticeCard();
  });

  flashcard.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      revealPracticeCard();
    }
  });

  cardSpeakBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const id = practiceQueue[0];
    const item = entries.find((entry) => entry.id === id);
    if (item) speakSwedish(getSpokenTerm(item), cardSpeakBtn);
  });

  revealAnswerBtn.addEventListener('click', revealPracticeCard);
  rateAgainBtn.addEventListener('click', () => ratePracticeCard(false));
  rateKnewBtn.addEventListener('click', () => ratePracticeCard(true));
  practiceMoreBtn.addEventListener('click', () => {
    practiceIgnoreDue = true;
    buildPracticeQueue();
    renderPracticeView();
  });

  // Network helper with timeout + AbortController
  function fetchWithTimeout(url, { signal, timeoutMs = 8000 } = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const onParentAbort = () => controller.abort();
    if (signal) {
      if (signal.aborted) {
        clearTimeout(timer);
        controller.abort();
      } else {
        signal.addEventListener('abort', onParentAbort, { once: true });
      }
    }
    return fetch(url, { signal: controller.signal }).finally(() => {
      clearTimeout(timer);
      if (signal) signal.removeEventListener('abort', onParentAbort);
    });
  }

  // Modal History & Focus Management
  function isAnySheetOpen() {
    return (
      !detailBackdrop.classList.contains('hidden') ||
      !formBackdrop.classList.contains('hidden') ||
      !settingsBackdrop.classList.contains('hidden')
    );
  }

  function updateBodyScrollLock() {
    const anyOpen = isAnySheetOpen();
    document.documentElement.classList.toggle('sheet-open', anyOpen);
    document.body.classList.toggle('sheet-open', anyOpen);
  }

  function pushModalHistory() {
    if (!pushedModalHistory) {
      try {
        history.pushState({ swedishWordsModal: true }, '');
        pushedModalHistory = true;
      } catch (_) {}
    }
  }

  function popModalHistoryIfNeeded() {
    if (pushedModalHistory) {
      pushedModalHistory = false;
      try {
        history.back();
      } catch (_) {}
    }
  }

  function restoreFocus() {
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function' && document.contains(lastFocusedEl)) {
      try {
        lastFocusedEl.focus({ preventScroll: true });
      } catch (_) {}
    }
    lastFocusedEl = null;
  }

  // Toast helper (supports Undo & Reload actions)
  function hideToast() {
    clearTimeout(toastTimer);
    undoToast.classList.add('hidden');
    toastActionHandler = null;
    lastDeletedEntry = null;
  }

  function showToast(message, { actionLabel = '', onAction = null, durationMs = 3500 } = {}) {
    clearTimeout(toastTimer);
    undoToastText.textContent = message;
    toastActionHandler = onAction;
    if (actionLabel && onAction) {
      undoBtn.textContent = actionLabel;
      undoBtn.classList.remove('hidden');
    } else {
      undoBtn.classList.add('hidden');
    }
    undoToast.classList.remove('hidden');
    toastTimer = setTimeout(() => {
      undoToast.classList.add('hidden');
      toastActionHandler = null;
      lastDeletedEntry = null;
    }, durationMs);
  }

  function showUndoToast(deletedItem) {
    lastDeletedEntry = deletedItem;
    showToast(`Deleted "${deletedItem.term}"`, {
      actionLabel: 'Undo',
      durationMs: 5000,
      onAction: () => {
        if (!lastDeletedEntry) return;
        entries.push(lastDeletedEntry);
        saveEntries();
        hideToast();
        render();
      }
    });
  }

  undoBtn.addEventListener('click', () => {
    if (typeof toastActionHandler === 'function') {
      toastActionHandler();
    }
  });

  // Swedish Text-to-Speech
  const supportsSpeech = 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
  let swedishVoice = null;
  let voicesChecked = false;
  let activeSpeakingBtn = null;

  function loadSwedishVoice() {
    if (!supportsSpeech) return;
    const voices = window.speechSynthesis.getVoices() || [];
    if (voices.length > 0) voicesChecked = true;
    swedishVoice =
      voices.find((v) => v.lang && v.lang.toLowerCase() === 'sv-se') ||
      voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('sv')) ||
      null;
    settingsVoiceNote.classList.toggle('hidden', !(voicesChecked && !swedishVoice));
  }

  if (supportsSpeech) {
    loadSwedishVoice();
    window.speechSynthesis.addEventListener?.('voiceschanged', loadSwedishVoice);
    speakTermBtn.classList.remove('hidden');
    speakExampleBtn.classList.remove('hidden');
    cardSpeakBtn.classList.remove('hidden');
  }

  function stopSpeaking() {
    if (!supportsSpeech) return;
    try {
      window.speechSynthesis.cancel();
    } catch (_) {}
    if (activeSpeakingBtn) {
      activeSpeakingBtn.classList.remove('speaking');
      activeSpeakingBtn = null;
    }
  }

  function speakSwedish(text, btn) {
    if (!supportsSpeech || !text) return;
    stopSpeaking();
    loadSwedishVoice();

    if (voicesChecked && !swedishVoice && !detailBackdrop.classList.contains('hidden')) {
      detailVoiceTip.textContent =
        'No Swedish voice detected — install Swedish in your phone’s Text-to-Speech settings for accurate pronunciation.';
      detailVoiceTip.classList.remove('hidden');
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'sv-SE';
    utterance.rate = 0.92;
    if (swedishVoice) utterance.voice = swedishVoice;

    utterance.onstart = () => {
      activeSpeakingBtn = btn;
      if (btn) btn.classList.add('speaking');
    };
    utterance.onend = () => {
      if (btn) btn.classList.remove('speaking');
      if (activeSpeakingBtn === btn) activeSpeakingBtn = null;
    };
    utterance.onerror = () => {
      if (btn) btn.classList.remove('speaking');
      if (activeSpeakingBtn === btn) activeSpeakingBtn = null;
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (_) {
      if (btn) btn.classList.remove('speaking');
    }
  }

  speakTermBtn.addEventListener('click', () => {
    const item = entries.find((e) => e.id === selectedEntryId);
    const spoken = item ? getSpokenTerm(item) : detailTerm.textContent.trim();
    speakSwedish(spoken, speakTermBtn);
  });

  speakExampleBtn.addEventListener('click', () => {
    speakSwedish(detailExample.textContent.trim(), speakExampleBtn);
  });

  // Detail Sheet
  function openDetail(id) {
    const item = entries.find((e) => e.id === id);
    if (!item) return;
    if (!lastFocusedEl) lastFocusedEl = document.activeElement;
    selectedEntryId = id;
    detailBadge.textContent = item.type === 'phrase' ? 'Phrase' : 'Word';
    renderTermWithArticle(detailTerm, item);
    detailVoiceTip.classList.add('hidden');

    if (item.en && item.en.trim()) {
      detailEn.textContent = item.en;
      detailEnWrap.classList.remove('hidden');
    } else {
      detailEnWrap.classList.add('hidden');
    }

    if (item.th && item.th.trim()) {
      detailTh.textContent = item.th;
      detailThWrap.classList.remove('hidden');
    } else {
      detailThWrap.classList.add('hidden');
    }

    if (item.example && item.example.trim()) {
      detailExample.textContent = item.example;
      detailExampleWrap.classList.remove('hidden');
    } else {
      detailExampleWrap.classList.add('hidden');
    }

    detailSheet.style.transform = '';
    detailSheet.style.transition = '';
    detailBackdrop.style.background = '';
    detailBackdrop.classList.remove('hidden');
    updateBodyScrollLock();
    pushModalHistory();
    detailSheet.focus({ preventScroll: true });
    loadAndRenderGrammar(item);
  }

  const GRAMMAR_LABELS_EN = {
    infinitiv: 'Infinitive',
    presens: 'Present',
    preteritum: 'Past',
    supinum: 'Supine',
    imperativ: 'Imperative',
    nominativ: 'Base',
    genitiv: 'Possessive',
    singular: 'Singular',
    plural: 'Plural',
    obestämd: 'Indefinite',
    bestämd: 'Definite',
    'obestämd singular': 'Indef. singular',
    'bestämd singular': 'Def. singular',
    'obestämd plural': 'Indef. plural',
    'bestämd plural': 'Def. plural',
    obestämdsingular: 'Indef. singular',
    bestämdsingular: 'Def. singular',
    obestämdplural: 'Indef. plural',
    bestämdplural: 'Def. plural',
    neutrum: 'Neuter (ett)',
    utrum: 'Common (en)',
    alla: 'All (plural/def.)',
    positiv: 'Positive',
    komparativ: 'Comparative',
    superlativ: 'Superlative'
  };

  function toEnglishGrammarLabel(label) {
    const key = (label || '').trim().toLowerCase();
    return GRAMMAR_LABELS_EN[key] || label;
  }

  function createMiniSpeakerSvg() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'grammar-speak-icon');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('points', '11 5 6 9 2 9 2 15 6 15 11 19 11 5');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M15.54 8.46a5 5 0 0 1 0 7.07');
    svg.appendChild(poly);
    svg.appendChild(path);
    return svg;
  }

  function renderGrammarData(grammar) {
    detailGrammarStatus.classList.add('hidden');
    detailForms.innerHTML = '';

    if (!grammar || (!grammar.pos && (!grammar.forms || grammar.forms.length === 0))) {
      detailGrammarWrap.classList.add('hidden');
      return;
    }

    detailGrammarTitle.textContent = grammar.baseForm
      ? `Grammar & forms (base: ${grammar.baseForm})`
      : 'Grammar & forms';

    if (grammar.pos) {
      detailPos.textContent = grammar.pos;
      detailPos.classList.remove('hidden');
    } else {
      detailPos.classList.add('hidden');
    }

    if (Array.isArray(grammar.forms)) {
      for (const f of grammar.forms) {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'grammar-form-item';
        const spokenValue = f.value.split(',')[0].trim();
        card.setAttribute('aria-label', `Listen to ${spokenValue}`);

        const textWrap = document.createElement('span');
        textWrap.className = 'grammar-form-text';

        const lbl = document.createElement('span');
        lbl.className = 'grammar-form-label';
        lbl.textContent = toEnglishGrammarLabel(f.label);

        const val = document.createElement('span');
        val.className = 'grammar-form-value';
        val.textContent = f.value;

        textWrap.appendChild(lbl);
        textWrap.appendChild(val);
        card.appendChild(textWrap);

        if (supportsSpeech) {
          card.appendChild(createMiniSpeakerSvg());
          card.addEventListener('click', () => speakSwedish(spokenValue, card));
        }

        detailForms.appendChild(card);
      }
    }

    detailGrammarWrap.classList.remove('hidden');
  }

  // Wiktionary parsing helpers (base form, examples, grammar tables)
  function stripHtml(html) {
    const doc = new DOMParser().parseFromString(html || '', 'text/html');
    return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function extractWiktionaryHints(enWiktData, sourceWord) {
    let pos = '';
    let baseForm = '';
    const examples = [];

    const svBlocks = Array.isArray(enWiktData?.sv) ? enWiktData.sv : [];
    if (svBlocks.length > 0) {
      pos = svBlocks[0].partOfSpeech || '';
    }

    const srcLower = (sourceWord || '').trim().toLocaleLowerCase('sv-SE');
    for (const block of svBlocks) {
      const defs = Array.isArray(block.definitions) ? block.definitions : [];
      for (const def of defs) {
        if (!baseForm && def.definition && def.definition.includes('form-of-definition')) {
          const doc = new DOMParser().parseFromString(def.definition, 'text/html');
          const link = doc.querySelector('.form-of-definition-link a');
          const lemma = (link?.textContent || '').trim();
          if (lemma && lemma.toLocaleLowerCase('sv-SE') !== srcLower) {
            baseForm = lemma;
          }
        }
        if (Array.isArray(def.parsedExamples)) {
          for (const ex of def.parsedExamples) {
            const svText = stripHtml(ex.example);
            const enText = stripHtml(ex.translation);
            if (svText && svText.length <= 110 && !examples.some((e) => e.sv === svText)) {
              examples.push({ sv: svText, en: enText });
            }
          }
        } else if (Array.isArray(def.examples)) {
          for (const rawEx of def.examples) {
            const svText = stripHtml(rawEx);
            if (svText && svText.length <= 110 && !examples.some((e) => e.sv === svText)) {
              examples.push({ sv: svText, en: '' });
            }
          }
        }
      }
    }

    return { pos, baseForm, examples: examples.slice(0, 2) };
  }

  function isSwedishGrammarTable(table) {
    if (table.dataset.lang) return table.dataset.lang === 'sv';
    const cls = table.className || '';
    if (cls.includes('template-sv-')) return true;
    if (/template-(no|da|is|nn|fi|de|en|fr|es)-/.test(cls)) return false;
    const html = table.innerHTML || '';
    if (/#(Bokmål|Danska|Isländska|Nynorska|Norska)/i.test(html)) return false;
    return true;
  }

  function detectTablePos(table) {
    const h3 = (table.dataset.h3 || '').toLowerCase();
    const cls = (table.className || '').toLowerCase();
    if (h3 === 'verb' || cls.includes('verb')) return 'Verb';
    if (h3 === 'subst' || cls.includes('subst')) return 'Noun';
    if (h3 === 'adj' || cls.includes('adj')) return 'Adjective';
    if (h3 === 'adv' || cls.includes('adv')) return 'Adverb';

    const txt = (table.textContent || '').toLowerCase();
    if (txt.includes('infinitiv') && txt.includes('presens')) return 'Verb';
    if (txt.includes('komparativ') && txt.includes('superlativ')) return 'Adjective';
    if (txt.includes('singular') && txt.includes('plural') && txt.includes('obestämd')) return 'Noun';
    return '';
  }

  function cleanCellText(el) {
    if (!el) return '';
    return el.textContent.replace(/\s+/g, ' ').trim();
  }

  function validForm(val) {
    return Boolean(val && val !== '–' && val !== '-' && val !== '—');
  }

  function parseNounTable(table) {
    const forms = [];
    let gender = '';
    const mainThs = table.querySelectorAll('th.main');
    for (const th of mainThs) {
      const t = cleanCellText(th).toLowerCase();
      if (t === 'utrum') gender = 'en';
      else if (t === 'neutrum') gender = 'ett';
    }

    const rows = table.querySelectorAll('tr');
    for (const row of rows) {
      const th = row.querySelector('th');
      if (!th) continue;
      const label = cleanCellText(th).toLowerCase();
      if (label === 'nominativ') {
        const tds = row.querySelectorAll('td');
        const sgIndef = cleanCellText(tds[0]);
        const sgDef = cleanCellText(tds[1]);
        const plIndef = cleanCellText(tds[2]);
        const plDef = cleanCellText(tds[3]);
        if (validForm(sgIndef)) forms.push({ label: 'Singular indef.', value: sgIndef });
        if (validForm(sgDef)) forms.push({ label: 'Singular def.', value: sgDef });
        if (validForm(plIndef)) forms.push({ label: 'Plural indef.', value: plIndef });
        if (validForm(plDef)) forms.push({ label: 'Plural def.', value: plDef });
        break;
      }
    }
    return { pos: gender ? `Noun (${gender})` : 'Noun', forms };
  }

  function parseVerbTable(table) {
    const forms = [];
    let inParticip = false;
    let passiveForm = '';
    const rows = table.querySelectorAll('tr');

    for (const row of rows) {
      const ths = row.querySelectorAll('th');
      const tds = row.querySelectorAll('td');
      if (ths.length === 1 && tds.length === 0) {
        const headerText = cleanCellText(ths[0]).toLowerCase();
        if (headerText.includes('particip')) inParticip = true;
        continue;
      }
      if (ths.length === 0 || tds.length === 0) continue;

      const rawLabel = cleanCellText(ths[0]).toLowerCase();
      const val = cleanCellText(tds[0]);
      if (!validForm(val)) continue;

      if (rawLabel === 'infinitiv') {
        forms.push({ label: 'Infinitive', value: val });
        const pass = cleanCellText(tds[1]);
        if (validForm(pass)) passiveForm = pass;
      } else if (rawLabel === 'presens' && !inParticip) {
        forms.push({ label: 'Present', value: val });
      } else if (rawLabel === 'preteritum') {
        forms.push({ label: 'Past', value: val });
      } else if (rawLabel === 'supinum') {
        forms.push({ label: 'Supine', value: val });
      } else if (rawLabel === 'imperativ') {
        forms.push({ label: 'Imperative', value: val });
      } else if (rawLabel === 'presens' && inParticip) {
        forms.push({ label: 'Pres. participle', value: val });
      } else if (rawLabel === 'perfekt' && inParticip) {
        forms.push({ label: 'Past participle', value: val });
      }
    }

    if (passiveForm && forms.length < 6) {
      forms.push({ label: 'Passive', value: passiveForm });
    }
    return { pos: 'Verb', forms: forms.slice(0, 6) };
  }

  function parseAdjectiveTable(table) {
    const forms = [];
    let common = '';
    let neuter = '';
    let pluralDef = '';
    let comparative = '';
    let superlative = '';
    let adverb = '';

    const rows = table.querySelectorAll('tr');
    for (const row of rows) {
      const ths = Array.from(row.querySelectorAll('th')).map((th) => {
        th.querySelectorAll('br').forEach((br) => br.replaceWith(' '));
        return cleanCellText(th).toLowerCase();
      });
      const tds = row.querySelectorAll('td');
      if (tds.length === 0) continue;

      const rowHeader = ths.join(' ');
      if (rowHeader.includes('adverbavledning')) {
        const v = cleanCellText(tds[0]);
        if (validForm(v)) adverb = v;
        continue;
      }

      if (!common && rowHeader.includes('utrum')) {
        const v0 = cleanCellText(tds[0]);
        if (validForm(v0)) common = v0;
        const v1 = cleanCellText(tds[1]);
        if (validForm(v1)) comparative = v1;
      } else if (!neuter && rowHeader.includes('neutrum')) {
        const v0 = cleanCellText(tds[0]);
        if (validForm(v0)) neuter = v0;
      } else if (!pluralDef && (rowHeader.includes('alla') || rowHeader.includes('plural'))) {
        const v0 = cleanCellText(tds[0]);
        if (validForm(v0)) pluralDef = v0;
        if (!superlative && tds[1]) {
          const v1 = cleanCellText(tds[1]);
          if (validForm(v1)) superlative = v1;
        }
      }

      if (rowHeader.includes('singular') && rowHeader.includes('utrum') && tds.length >= 3) {
        const comp = cleanCellText(tds[1]);
        const sup = cleanCellText(tds[2]);
        if (!comparative && validForm(comp)) comparative = comp;
        if (validForm(sup)) superlative = sup;
      }
    }

    if (common) forms.push({ label: 'Common (en)', value: common });
    if (neuter) forms.push({ label: 'Neuter (ett)', value: neuter });
    if (pluralDef) forms.push({ label: 'Plural / def.', value: pluralDef });
    if (comparative) forms.push({ label: 'Comparative', value: comparative });
    if (superlative) forms.push({ label: 'Superlative', value: superlative });
    if (adverb && forms.length < 6) forms.push({ label: 'Adverb', value: adverb });

    return { pos: 'Adjective', forms };
  }

  function parseSvWiktionaryHtml(html, preferredPos) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const tables = Array.from(doc.querySelectorAll('table.grammar')).filter(isSwedishGrammarTable);
    if (tables.length === 0) return null;

    const posLower = (preferredPos || '').toLowerCase();
    let table = tables[0];

    if (tables.length > 1 && posLower) {
      const target =
        posLower === 'verb' ? 'Verb' : posLower === 'noun' ? 'Noun' : posLower === 'adjective' ? 'Adjective' : '';
      if (target) {
        table = tables.find((t) => detectTablePos(t) === target) || tables[0];
      }
    }

    const tablePos = detectTablePos(table);
    if (tablePos === 'Noun') return parseNounTable(table);
    if (tablePos === 'Verb') return parseVerbTable(table);
    if (tablePos === 'Adjective') return parseAdjectiveTable(table);

    const forms = [];
    const rows = table.querySelectorAll('tr');
    for (const row of rows) {
      const ths = row.querySelectorAll('th');
      const tds = row.querySelectorAll('td');
      if (ths.length === 0 || tds.length === 0) continue;
      ths[0].querySelectorAll('br').forEach((br) => br.replaceWith(' '));
      const label = cleanCellText(ths[0]);
      const value = cleanCellText(tds[0]);
      if (!label || !validForm(value)) continue;
      if (/^böjningar av/i.test(label) || /^particip$/i.test(label)) continue;
      forms.push({ label, value });
      if (forms.length >= 6) break;
    }
    return { pos: preferredPos || tablePos, forms };
  }

  async function fetchWiktionaryGrammar(word, signal) {
    const cleanWord = stripLeadingArticle(word).toLocaleLowerCase('sv-SE');
    if (!cleanWord || cleanWord.includes(' ')) return null;

    let pos = '';
    let forms = [];
    let baseForm = '';

    const [enRes, svRes] = await Promise.allSettled([
      fetchWithTimeout(
        `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(cleanWord)}`,
        { signal, timeoutMs: 8000 }
      ).then((r) => (r.ok ? r.json() : null)),
      fetchWithTimeout(
        `https://sv.wiktionary.org/w/api.php?action=parse&page=${encodeURIComponent(cleanWord)}&prop=text&format=json&origin=*`,
        { signal, timeoutMs: 8000 }
      ).then((r) => (r.ok ? r.json() : null))
    ]);

    if (enRes.status === 'fulfilled' && enRes.value) {
      const hints = extractWiktionaryHints(enRes.value, cleanWord);
      pos = hints.pos;
      baseForm = hints.baseForm;
    }

    let parsed = null;
    if (svRes.status === 'fulfilled' && svRes.value?.parse?.text?.['*']) {
      parsed = parseSvWiktionaryHtml(svRes.value.parse.text['*'], pos);
    }

    // If word is an inflected form (e.g. "tappade") without its own table, look up its base form ("tappa")
    if ((!parsed || parsed.forms.length === 0) && baseForm && !(signal && signal.aborted)) {
      try {
        const baseRes = await fetchWithTimeout(
          `https://sv.wiktionary.org/w/api.php?action=parse&page=${encodeURIComponent(baseForm.toLocaleLowerCase('sv-SE'))}&prop=text&format=json&origin=*`,
          { signal, timeoutMs: 8000 }
        ).then((r) => (r.ok ? r.json() : null));
        if (baseRes?.parse?.text?.['*']) {
          parsed = parseSvWiktionaryHtml(baseRes.parse.text['*'], pos);
        }
      } catch (_) {}
    }

    if (parsed) {
      pos = parsed.pos || pos;
      forms = parsed.forms || [];
    }

    if (!pos && forms.length === 0) return null;
    return { v: 4, pos, forms, baseForm: baseForm || '' };
  }

  async function loadAndRenderGrammar(item) {
    if (grammarAbortController) {
      grammarAbortController.abort();
      grammarAbortController = null;
    }

    const baseTerm = stripLeadingArticle(item.term);
    if (item.type !== 'word' || baseTerm.includes(' ')) {
      detailGrammarWrap.classList.add('hidden');
      return;
    }

    if (item.grammar && item.grammar.v >= 3) {
      renderGrammarData(item.grammar);
      return;
    }

    if (!navigator.onLine) {
      detailGrammarWrap.classList.add('hidden');
      return;
    }

    detailPos.classList.add('hidden');
    detailForms.innerHTML = '';
    detailGrammarTitle.textContent = 'Grammar & forms';
    detailGrammarStatus.textContent = 'Loading grammar...';
    detailGrammarStatus.classList.remove('hidden');
    detailGrammarWrap.classList.remove('hidden');

    const controller = new AbortController();
    grammarAbortController = controller;

    try {
      const grammar = await fetchWiktionaryGrammar(item.term, controller.signal);
      if (controller.signal.aborted) return;
      if (grammar) {
        item.grammar = grammar;
        saveEntries();
        // Refresh list & detail heading in case Noun (en)/(ett) was just discovered
        if (selectedEntryId === item.id) {
          renderTermWithArticle(detailTerm, item);
        }
        render();
      }
      if (selectedEntryId === item.id) {
        renderGrammarData(grammar);
      }
    } catch (_) {
      if (!controller.signal.aborted && selectedEntryId === item.id) {
        detailGrammarWrap.classList.add('hidden');
      }
    } finally {
      if (grammarAbortController === controller) grammarAbortController = null;
    }
  }

  function closeDetail({ keepHistory = false, fromPopstate = false } = {}) {
    stopSpeaking();
    if (grammarAbortController) {
      grammarAbortController.abort();
      grammarAbortController = null;
    }
    detailBackdrop.classList.add('hidden');
    detailSheet.style.transform = '';
    detailSheet.style.transition = '';
    detailBackdrop.style.background = '';
    selectedEntryId = null;
    updateBodyScrollLock();
    if (!keepHistory && !fromPopstate) {
      popModalHistoryIfNeeded();
      restoreFocus();
    }
  }

  closeDetailBtn.addEventListener('click', () => closeDetail());
  detailBackdrop.addEventListener('click', (e) => {
    if (e.target === detailBackdrop) closeDetail();
  });

  editEntryBtn.addEventListener('click', () => {
    const item = entries.find((e) => e.id === selectedEntryId);
    if (!item) return;
    closeDetail({ keepHistory: true });
    openForm(item);
  });

  deleteEntryBtn.addEventListener('click', () => {
    if (!selectedEntryId) return;
    const deletedItem = entries.find((e) => e.id === selectedEntryId);
    if (!deletedItem) return;
    entries = entries.filter((e) => e.id !== selectedEntryId);
    saveEntries();
    closeDetail();
    render();
    showUndoToast(deletedItem);
  });

  // Duplicate detection helper
  function findDuplicate(term, excludeId = null) {
    const key = normalizeForSearch(stripLeadingArticle(term));
    if (!key) return null;
    return (
      entries.find(
        (e) => e.id !== excludeId && normalizeForSearch(stripLeadingArticle(e.term)) === key
      ) || null
    );
  }

  function updateDuplicateNotice() {
    const dup = findDuplicate(termInput.value, editingEntryId);
    duplicateEntryRef = dup;
    if (dup) {
      duplicateText.textContent = `"${dup.term}" is already in ${dup.type === 'phrase' ? 'Phrases' : 'Words'}.`;
      duplicateNotice.classList.remove('hidden');
    } else {
      duplicateNotice.classList.add('hidden');
    }
  }

  editDuplicateBtn.addEventListener('click', () => {
    if (!duplicateEntryRef) return;
    openForm(duplicateEntryRef);
  });

  useBaseFormBtn.addEventListener('click', () => {
    if (!suggestedBaseForm) return;
    termInput.value = suggestedBaseForm;
    baseFormNotice.classList.add('hidden');
    suggestedBaseForm = '';
    updateDuplicateNotice();
    suggestBtn.click();
  });

  // Add / Edit Form Sheet
  function setFormType(type) {
    formType = type;
    typePills.forEach((pill) => {
      pill.classList.toggle('active', pill.dataset.type === type);
    });
    if (!editingEntryId) {
      formTitle.textContent = type === 'phrase' ? 'Add phrase' : 'Add word';
    } else {
      formTitle.textContent = type === 'phrase' ? 'Edit phrase' : 'Edit word';
    }
    termLabel.textContent = type === 'phrase' ? 'Swedish phrase' : 'Swedish word';
    termInput.placeholder = type === 'phrase' ? 'e.g. Det gör inget' : 'e.g. lagom';
    termInput.setAttribute('autocapitalize', type === 'phrase' ? 'sentences' : 'none');
  }

  typePills.forEach((pill) => {
    pill.addEventListener('click', () => setFormType(pill.dataset.type));
  });

  function clearFormSuggestions() {
    svSuggestions.innerHTML = '';
    svSuggestions.classList.add('hidden');
    enSuggestions.innerHTML = '';
    enSuggestions.classList.add('hidden');
    thSuggestions.innerHTML = '';
    thSuggestions.classList.add('hidden');
    exampleSuggestions.innerHTML = '';
    exampleSuggestions.classList.add('hidden');
    baseFormNotice.classList.add('hidden');
    suggestedBaseForm = '';
  }

  function openForm(existingItem = null, { prefillTerm = '', prefillType = null, autoSuggest = false } = {}) {
    if (!lastFocusedEl) lastFocusedEl = document.activeElement;
    if (translateAbortController) {
      translateAbortController.abort();
      translateAbortController = null;
    }
    translateReqId++;
    formError.classList.add('hidden');
    translateStatus.classList.add('hidden');
    translateStatus.classList.remove('error');
    clearFormSuggestions();
    suggestBtn.disabled = false;
    suggestBtn.textContent = 'Suggest';
    retranslateThBtn.disabled = false;

    if (existingItem) {
      editingEntryId = existingItem.id;
      setFormType(existingItem.type);
      termInput.value = existingItem.term;
      enInput.value = existingItem.en || '';
      thInput.value = existingItem.th || '';
      exampleInput.value = existingItem.example || '';
    } else {
      editingEntryId = null;
      const defaultType = prefillType || (activeTab === 'phrase' ? 'phrase' : 'word');
      setFormType(defaultType);
      termInput.value = prefillTerm || '';
      enInput.value = '';
      thInput.value = '';
      exampleInput.value = '';
    }

    updateDuplicateNotice();
    formSheet.style.transform = '';
    formSheet.style.transition = '';
    formBackdrop.style.background = '';
    formBackdrop.classList.remove('hidden');
    updateBodyScrollLock();
    pushModalHistory();
    setTimeout(() => {
      termInput.focus();
      if (autoSuggest && termInput.value.trim()) {
        suggestBtn.click();
      }
    }, 60);
  }

  function closeForm({ fromPopstate = false } = {}) {
    if (translateAbortController) {
      translateAbortController.abort();
      translateAbortController = null;
    }
    translateReqId++;
    formBackdrop.classList.add('hidden');
    formSheet.style.transform = '';
    formSheet.style.transition = '';
    formBackdrop.style.background = '';
    editingEntryId = null;
    updateBodyScrollLock();
    if (!fromPopstate) {
      popModalHistoryIfNeeded();
    }
    restoreFocus();
  }

  addBtn.addEventListener('click', () => openForm(null));
  cancelFormBtn.addEventListener('click', () => closeForm());
  formBackdrop.addEventListener('click', (e) => {
    if (e.target === formBackdrop) closeForm();
  });

  // Enter in termInput runs Suggest when translations are still empty
  termInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && termInput.value.trim() && !enInput.value.trim() && !thInput.value.trim()) {
      e.preventDefault();
      suggestBtn.click();
    }
  });

  termInput.addEventListener('input', () => {
    svSuggestions.querySelectorAll('.en-chip').forEach((c) => c.classList.remove('active'));
    updateDuplicateNotice();
    const wordCount = termInput.value.trim().split(/\s+/).filter(Boolean).length;
    if (!editingEntryId && formType === 'word' && wordCount >= 3) {
      setFormType('phrase');
    }
  });

  entryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const term = termInput.value.trim();
    const en = enInput.value.trim();
    const th = thInput.value.trim();
    const example = exampleInput.value.trim();

    if (!term || (!en && !th)) {
      formError.classList.remove('hidden');
      return;
    }

    if (editingEntryId) {
      entries = entries.map((item) => {
        if (item.id !== editingEntryId) return item;
        const termChanged = item.term.trim().toLowerCase() !== term.toLowerCase();
        return {
          ...item,
          type: formType,
          term,
          en,
          th,
          example,
          grammar: termChanged ? undefined : item.grammar
        };
      });
    } else {
      const id = 'e_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      entries.push({ id, type: formType, term, en, th, example });
    }

    saveEntries();

    if (activeTab !== formType) {
      activeTab = formType;
      tabs.forEach((t) => {
        const active = t.dataset.tab === activeTab;
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', String(active));
      });
    }

    closeForm();
    render();
  });

  // Settings & Backup Sheet
  function updateSettingsUI() {
    const hasSamples = entries.some((e) => SAMPLE_ID_SET.has(e.id));
    if (hasSamples) {
      sampleWordsTitle.textContent = 'Remove sample words';
      sampleWordsSub.textContent = 'Remove built-in starter words (keeps all your own)';
    } else {
      sampleWordsTitle.textContent = 'Add sample words';
      sampleWordsSub.textContent = 'Add starter Swedish words & phrases';
    }
    loadSwedishVoice();
  }

  function openSettings() {
    if (!lastFocusedEl) lastFocusedEl = document.activeElement;
    updateSettingsUI();
    settingsSheet.style.transform = '';
    settingsSheet.style.transition = '';
    settingsBackdrop.style.background = '';
    settingsBackdrop.classList.remove('hidden');
    updateBodyScrollLock();
    pushModalHistory();
    settingsSheet.focus({ preventScroll: true });
  }

  function closeSettings({ fromPopstate = false } = {}) {
    settingsBackdrop.classList.add('hidden');
    settingsSheet.style.transform = '';
    settingsSheet.style.transition = '';
    settingsBackdrop.style.background = '';
    updateBodyScrollLock();
    if (!fromPopstate) {
      popModalHistoryIfNeeded();
    }
    restoreFocus();
  }

  settingsBtn.addEventListener('click', openSettings);
  closeSettingsBtn.addEventListener('click', () => closeSettings());
  settingsBackdrop.addEventListener('click', (e) => {
    if (e.target === settingsBackdrop) closeSettings();
  });

  sampleWordsBtn.addEventListener('click', () => {
    const hasSamples = entries.some((e) => SAMPLE_ID_SET.has(e.id));
    if (hasSamples) removeSampleWords();
    else addSampleWords();
    updateSettingsUI();
  });

  exportBtn.addEventListener('click', () => {
    const payload = {
      app: 'Swedish Words',
      version: 1,
      exportedAt: new Date().toISOString(),
      entries
    };
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `swedish-words-backup-${dateStr}.json`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast(`Exported ${entries.length} items`);
  });

  importBtn.addEventListener('click', () => {
    importFileInput.value = '';
    importFileInput.click();
  });

  importFileInput.addEventListener('change', async () => {
    const file = importFileInput.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const list = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.entries) ? parsed.entries : null;
      if (!list) {
        showToast('Invalid backup file');
        return;
      }

      const existingKeys = new Set(entries.map((e) => normalizeForSearch(stripLeadingArticle(e.term))));
      let added = 0;
      for (const raw of list) {
        if (!raw || typeof raw.term !== 'string' || !raw.term.trim()) continue;
        const en = typeof raw.en === 'string' ? raw.en.trim() : '';
        const th = typeof raw.th === 'string' ? raw.th.trim() : '';
        if (!en && !th) continue;
        const key = normalizeForSearch(stripLeadingArticle(raw.term));
        if (existingKeys.has(key)) continue;

        entries.push({
          id: raw.id || 'e_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          type: raw.type === 'phrase' ? 'phrase' : 'word',
          term: raw.term.trim(),
          en,
          th,
          example: typeof raw.example === 'string' ? raw.example.trim() : '',
          grammar: raw.grammar || undefined,
          sr: raw.sr || undefined
        });
        existingKeys.add(key);
        added++;
      }

      saveEntries();
      render();
      updateSettingsUI();
      closeSettings();
      showToast(added > 0 ? `Imported ${added} new ${added === 1 ? 'item' : 'items'}` : 'All items already in your list');
    } catch (_) {
      showToast('Could not read backup file');
    }
  });

  // Back button & Escape handling
  window.addEventListener('popstate', () => {
    if (!formBackdrop.classList.contains('hidden')) {
      pushedModalHistory = false;
      closeForm({ fromPopstate: true });
    } else if (!detailBackdrop.classList.contains('hidden')) {
      pushedModalHistory = false;
      closeDetail({ fromPopstate: true });
    } else if (!settingsBackdrop.classList.contains('hidden')) {
      pushedModalHistory = false;
      closeSettings({ fromPopstate: true });
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!formBackdrop.classList.contains('hidden')) closeForm();
      else if (!detailBackdrop.classList.contains('hidden')) closeDetail();
      else if (!settingsBackdrop.classList.contains('hidden')) closeSettings();
    }
  });

  // Swipe-to-dismiss on all bottom sheets (with Samsung pull-to-refresh prevention)
  function enableSheetSwipeDismiss(backdrop, sheet, onClose) {
    let startY = 0;
    let startTime = 0;
    let currentY = 0;
    let tracking = false;
    let dragging = false;
    let activeMode = null;

    function canStart(target) {
      const onHandle = Boolean(target.closest('.sheet-handle-zone, .sheet-handle'));
      const onInteractive = Boolean(target.closest('input, textarea, button, select, a'));
      if (onHandle) return { allowed: true, onHandle: true };
      if (onInteractive || sheet.scrollTop > 0) return { allowed: false, onHandle: false };
      return { allowed: true, onHandle: false };
    }

    function applyDrag(deltaY) {
      currentY = Math.max(0, deltaY);
      sheet.style.transform = `translateY(${currentY}px)`;
      const fade = Math.max(0.08, 0.42 * (1 - currentY / 360));
      backdrop.style.background = `rgba(17, 24, 39, ${fade.toFixed(3)})`;
    }

    function finishDrag() {
      if (!dragging) return;
      dragging = false;

      const elapsed = Math.max(1, Date.now() - startTime);
      const velocity = currentY / elapsed;
      if (currentY > 90 || (velocity > 0.45 && currentY > 30)) {
        sheet.style.transition = 'transform 0.16s ease-out';
        sheet.style.transform = 'translateY(100%)';
        backdrop.style.background = 'rgba(17, 24, 39, 0)';
        setTimeout(() => onClose(), 150);
      } else {
        sheet.style.transition = 'transform 0.18s ease-out';
        sheet.style.transform = 'translateY(0)';
        backdrop.style.background = '';
      }
    }

    backdrop.addEventListener(
      'touchmove',
      (e) => {
        if (e.target === backdrop) e.preventDefault();
      },
      { passive: false }
    );

    sheet.addEventListener(
      'touchstart',
      (e) => {
        if (e.touches.length !== 1) return;
        const check = canStart(e.target);
        if (!check.allowed) return;
        tracking = true;
        dragging = false;
        activeMode = 'touch';
        startY = e.touches[0].clientY;
        startTime = Date.now();
        currentY = 0;
      },
      { passive: true }
    );

    sheet.addEventListener(
      'touchmove',
      (e) => {
        if (!tracking || activeMode !== 'touch' || e.touches.length !== 1) return;
        const deltaY = e.touches[0].clientY - startY;
        if (!dragging) {
          if (deltaY <= 6) {
            if (deltaY < -6) tracking = false;
            return;
          }
          if (sheet.scrollTop > 0) {
            tracking = false;
            return;
          }
          dragging = true;
          sheet.style.transition = 'none';
        }
        if (e.cancelable) e.preventDefault();
        applyDrag(deltaY);
      },
      { passive: false }
    );

    function endTouch() {
      if (!tracking || activeMode !== 'touch') return;
      tracking = false;
      activeMode = null;
      finishDrag();
    }

    sheet.addEventListener('touchend', endTouch, { passive: true });
    sheet.addEventListener('touchcancel', endTouch, { passive: true });

    sheet.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') return;
      if (e.button !== undefined && e.button !== 0) return;
      const check = canStart(e.target);
      if (!check.allowed) return;

      tracking = true;
      dragging = false;
      activeMode = 'pointer';
      startY = e.clientY;
      startTime = Date.now();
      currentY = 0;
      if (check.onHandle) {
        try {
          sheet.setPointerCapture(e.pointerId);
        } catch (_) {}
      }
    });

    sheet.addEventListener('pointermove', (e) => {
      if (!tracking || activeMode !== 'pointer') return;
      const deltaY = e.clientY - startY;
      if (!dragging) {
        if (deltaY <= 6) {
          if (deltaY < -6 && sheet.scrollTop > 0) tracking = false;
          return;
        }
        if (sheet.scrollTop > 0) {
          tracking = false;
          return;
        }
        dragging = true;
        sheet.style.transition = 'none';
      }
      applyDrag(deltaY);
    });

    function endPointer(e) {
      if (!tracking || activeMode !== 'pointer') return;
      tracking = false;
      activeMode = null;
      try {
        if (sheet.hasPointerCapture(e.pointerId)) {
          sheet.releasePointerCapture(e.pointerId);
        }
      } catch (_) {}
      finishDrag();
    }

    sheet.addEventListener('pointerup', endPointer);
    sheet.addEventListener('pointercancel', endPointer);
  }

  enableSheetSwipeDismiss(detailBackdrop, detailSheet, closeDetail);
  enableSheetSwipeDismiss(formBackdrop, formSheet, closeForm);
  enableSheetSwipeDismiss(settingsBackdrop, settingsSheet, closeSettings);

  // Translation & Wiktionary Suggestions (SV <-> EN <-> TH)
  async function fetchGoogleDict(text, fromLang, toLang, signal) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromLang}&tl=${toLang}&dt=t&dt=bd&q=${encodeURIComponent(text)}`;
    const res = await fetchWithTimeout(url, { signal, timeoutMs: 8000 });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();

    const primary = Array.isArray(data?.[0])
      ? data[0].map((seg) => seg?.[0] || '').join('').trim()
      : '';

    const dictEntries = [];
    if (Array.isArray(data?.[1])) {
      for (const posBlock of data[1]) {
        const pos = posBlock?.[0] || '';
        const detailed = posBlock?.[2];
        if (Array.isArray(detailed)) {
          for (const entry of detailed) {
            const word = (entry?.[0] || '').trim();
            const back = Array.isArray(entry?.[1]) ? entry[1].slice(0, 2).join(', ') : '';
            if (word) dictEntries.push({ text: word, pos, back });
          }
        } else if (Array.isArray(posBlock?.[1])) {
          for (const word of posBlock[1]) {
            if (word) dictEntries.push({ text: String(word).trim(), pos, back: '' });
          }
        }
      }
    }

    return { primary, dictEntries };
  }

  async function fetchMyMemoryFallback(text, fromLang, toLang, signal) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`;
    const res = await fetchWithTimeout(url, { signal, timeoutMs: 8000 });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const primary = (data?.responseData?.translatedText || '').trim();
    if (!primary || primary.toUpperCase().includes('MYMEMORY WARNING')) {
      throw new Error('No translation');
    }
    return { primary, dictEntries: [] };
  }

  async function translateWithDict(text, fromLang, toLang, signal) {
    try {
      return await fetchGoogleDict(text, fromLang, toLang, signal);
    } catch (err) {
      if (signal && signal.aborted) throw err;
      return await fetchMyMemoryFallback(text, fromLang, toLang, signal);
    }
  }

  function buildCandidateList(result, sourceText, maxItems = 5) {
    const seen = new Set();
    const list = [];

    const add = (text, hint = '') => {
      if (!text) return;
      const cleaned = text.trim();
      if (!cleaned) return;
      const key = cleaned.toLowerCase();
      if (key === sourceText.trim().toLowerCase() || seen.has(key)) return;
      seen.add(key);
      list.push({ text: cleaned, hint });
    };

    add(result.primary);
    for (const item of result.dictEntries) {
      const hint = item.back || item.pos || '';
      add(item.text, hint);
      if (list.length >= maxItems) break;
    }

    if (list.length === 0 && result.primary) {
      list.push({ text: result.primary, hint: '' });
    }
    return list.slice(0, maxItems);
  }

  function renderSwedishChips(candidates) {
    svSuggestions.innerHTML = '';
    if (candidates.length === 0) {
      svSuggestions.classList.add('hidden');
      return;
    }
    candidates.forEach((cand, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'en-chip' + (idx === 0 ? ' active' : '');
      btn.textContent = cand.text;
      btn.addEventListener('click', () => {
        svSuggestions.querySelectorAll('.en-chip').forEach((c) => c.classList.remove('active'));
        btn.classList.add('active');
        termInput.value = cand.text;
        updateDuplicateNotice();
      });
      svSuggestions.appendChild(btn);
    });
    svSuggestions.classList.remove('hidden');
  }

  function renderThaiChips(candidates) {
    thSuggestions.innerHTML = '';
    if (candidates.length <= 1) {
      thSuggestions.classList.add('hidden');
      return;
    }
    candidates.forEach((cand, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'en-chip' + (idx === 0 ? ' active' : '');
      btn.textContent = cand.text;
      if (cand.hint) {
        const hintSpan = document.createElement('span');
        hintSpan.className = 'chip-hint';
        hintSpan.textContent = `(${cand.hint})`;
        btn.appendChild(hintSpan);
      }
      btn.addEventListener('click', () => {
        thSuggestions.querySelectorAll('.en-chip').forEach((c) => c.classList.remove('active'));
        btn.classList.add('active');
        thInput.value = cand.text;
      });
      thSuggestions.appendChild(btn);
    });
    thSuggestions.classList.remove('hidden');
  }

  function renderExampleSuggestions(examples) {
    exampleSuggestions.innerHTML = '';
    if (!examples || examples.length === 0) {
      exampleSuggestions.classList.add('hidden');
      return;
    }
    for (const ex of examples) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'en-chip example-chip';
      btn.textContent = `Use: "${ex.sv}"`;
      btn.addEventListener('click', () => {
        exampleInput.value = ex.sv;
        exampleSuggestions.querySelectorAll('.en-chip').forEach((c) => c.classList.remove('active'));
        btn.classList.add('active');
      });
      exampleSuggestions.appendChild(btn);
    }
    exampleSuggestions.classList.remove('hidden');
  }

  function startTranslateRequest() {
    if (translateAbortController) {
      translateAbortController.abort();
    }
    translateAbortController = new AbortController();
    translateReqId++;
    return { reqId: translateReqId, signal: translateAbortController.signal };
  }

  async function translateThaiFromEnglish(enText, existingReq = null) {
    if (!enText) return;
    const { reqId, signal } = existingReq || startTranslateRequest();

    retranslateThBtn.disabled = true;
    thSuggestions.innerHTML = '';
    thSuggestions.classList.add('hidden');
    translateStatus.textContent = `Translating "${enText}" to Thai...`;
    translateStatus.classList.remove('error', 'hidden');
    try {
      const result = await translateWithDict(enText, 'en', 'th', signal);
      if (reqId !== translateReqId || signal.aborted) return;
      const candidates = buildCandidateList(result, enText, 5);
      if (candidates.length > 0) {
        thInput.value = candidates[0].text;
        renderThaiChips(candidates);
        translateStatus.textContent = 'Pick the best match above or tap Save.';
        translateStatus.classList.remove('error');
      } else {
        translateStatus.textContent = 'Could not translate to Thai right now.';
        translateStatus.classList.add('error');
      }
    } catch (_) {
      if (reqId !== translateReqId || signal.aborted) return;
      translateStatus.textContent = 'Could not translate to Thai right now.';
      translateStatus.classList.add('error');
    } finally {
      if (reqId === translateReqId) {
        retranslateThBtn.disabled = false;
      }
    }
  }

  function renderEnglishChips(candidates) {
    enSuggestions.innerHTML = '';
    if (candidates.length === 0) {
      enSuggestions.classList.add('hidden');
      return;
    }
    candidates.forEach((cand, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'en-chip' + (idx === 0 ? ' active' : '');
      btn.textContent = cand.text;
      btn.addEventListener('click', () => {
        enSuggestions.querySelectorAll('.en-chip').forEach((c) => c.classList.remove('active'));
        btn.classList.add('active');
        enInput.value = cand.text;
        translateThaiFromEnglish(cand.text);
      });
      enSuggestions.appendChild(btn);
    });
    enSuggestions.classList.remove('hidden');
  }

  enInput.addEventListener('input', () => {
    enSuggestions.querySelectorAll('.en-chip').forEach((c) => c.classList.remove('active'));
  });

  thInput.addEventListener('input', () => {
    thSuggestions.querySelectorAll('.en-chip').forEach((c) => c.classList.remove('active'));
  });

  retranslateThBtn.addEventListener('click', () => {
    const enText = enInput.value.trim();
    if (!enText) {
      translateStatus.textContent = 'Enter English text first.';
      translateStatus.classList.add('error');
      translateStatus.classList.remove('hidden');
      enInput.focus();
      return;
    }
    if (!navigator.onLine) {
      translateStatus.textContent = 'Offline – enter translation manually.';
      translateStatus.classList.add('error');
      translateStatus.classList.remove('hidden');
      return;
    }
    translateThaiFromEnglish(enText);
  });

  async function fetchWiktionaryFormSuggestions(svText, req) {
    const clean = stripLeadingArticle(svText).toLocaleLowerCase('sv-SE');
    if (!clean || clean.includes(' ')) return;
    try {
      const data = await fetchWithTimeout(
        `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(clean)}`,
        { signal: req.signal, timeoutMs: 7000 }
      ).then((r) => (r.ok ? r.json() : null));
      if (!data || req.reqId !== translateReqId || req.signal.aborted) return;

      const hints = extractWiktionaryHints(data, clean);
      if (hints.baseForm) {
        suggestedBaseForm = hints.baseForm;
        useBaseFormBtn.textContent = hints.baseForm;
        baseFormNotice.classList.remove('hidden');
      }
      if (hints.examples.length > 0 && !exampleInput.value.trim()) {
        renderExampleSuggestions(hints.examples);
      }
    } catch (_) {}
  }

  suggestBtn.addEventListener('click', async () => {
    const svText = termInput.value.trim();
    const enText = enInput.value.trim();
    const thText = thInput.value.trim();

    if (!svText && !enText && !thText) {
      translateStatus.textContent = 'Enter a Swedish, English, or Thai word first.';
      translateStatus.classList.add('error');
      translateStatus.classList.remove('hidden');
      termInput.focus();
      return;
    }

    if (!navigator.onLine) {
      translateStatus.textContent = 'Offline – enter translation manually.';
      translateStatus.classList.add('error');
      translateStatus.classList.remove('hidden');
      return;
    }

    const req = startTranslateRequest();
    suggestBtn.disabled = true;
    suggestBtn.textContent = 'Searching...';
    clearFormSuggestions();
    translateStatus.classList.remove('error', 'hidden');

    try {
      // Reverse Suggest: English or Thai -> Swedish!
      if (!svText && (enText || thText)) {
        let englishSource = enText;
        if (!englishSource && thText) {
          translateStatus.textContent = 'Translating Thai to English & Swedish...';
          const thToEn = await translateWithDict(thText, 'th', 'en', req.signal);
          if (req.reqId !== translateReqId || req.signal.aborted) return;
          if (thToEn.primary) {
            englishSource = thToEn.primary;
            enInput.value = englishSource;
          }
        } else {
          translateStatus.textContent = 'Finding Swedish options...';
        }

        const sourceForSv = englishSource || thText;
        const fromLang = englishSource ? 'en' : 'th';
        const svResult = await translateWithDict(sourceForSv, fromLang, 'sv', req.signal);
        if (req.reqId !== translateReqId || req.signal.aborted) return;

        const svCandidates = buildCandidateList(svResult, sourceForSv, 5);
        suggestBtn.disabled = false;
        suggestBtn.textContent = 'Suggest';

        if (svCandidates.length > 0) {
          termInput.value = svCandidates[0].text;
          updateDuplicateNotice();
          renderSwedishChips(svCandidates);
          fetchWiktionaryFormSuggestions(svCandidates[0].text, req);
          if (!thText && englishSource) {
            await translateThaiFromEnglish(englishSource, req);
          } else {
            translateStatus.textContent = 'Swedish options found – review and tap Save.';
          }
        } else {
          translateStatus.textContent = 'Could not find Swedish suggestions right now.';
          translateStatus.classList.add('error');
        }
        return;
      }

      // Forward Suggest: Swedish -> English -> Thai (+ Wiktionary base form & examples)
      translateStatus.textContent = 'Finding English options...';
      fetchWiktionaryFormSuggestions(svText, req);

      const enResult = await translateWithDict(svText, 'sv', 'en', req.signal);
      if (req.reqId !== translateReqId || req.signal.aborted) return;
      const candidates = buildCandidateList(enResult, svText, 5);
      suggestBtn.disabled = false;
      suggestBtn.textContent = 'Suggest';

      if (candidates.length > 0) {
        renderEnglishChips(candidates);
        enInput.value = candidates[0].text;
        await translateThaiFromEnglish(candidates[0].text, req);
      } else {
        translateStatus.textContent = 'Could not fetch suggestions right now.';
        translateStatus.classList.add('error');
      }
    } catch (_) {
      if (req.reqId !== translateReqId || req.signal.aborted) return;
      translateStatus.textContent = 'Could not fetch suggestions right now.';
      translateStatus.classList.add('error');
    } finally {
      suggestBtn.disabled = false;
      suggestBtn.textContent = 'Suggest';
    }
  });

  // Android PWA Share Target handler (?share_text=... or ?share_title=...)
  function handleIncomingShare() {
    try {
      const params = new URLSearchParams(window.location.search);
      const raw = (params.get('share_text') || params.get('share_title') || '').trim();
      if (!raw) return;
      const cleaned = raw.replace(/https?:\/\/\S+/gi, '').trim();
      history.replaceState(null, '', window.location.pathname);
      if (!cleaned) return;
      const wordCount = cleaned.split(/\s+/).filter(Boolean).length;
      openForm(null, {
        prefillTerm: cleaned,
        prefillType: wordCount >= 3 ? 'phrase' : 'word',
        autoSuggest: true
      });
    } catch (_) {}
  }

  // Service Worker registration + update toast
  if ('serviceWorker' in navigator) {
    let hadController = Boolean(navigator.serviceWorker.controller);
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (hadController) {
        showToast('New version ready', {
          actionLabel: 'Reload',
          durationMs: 8000,
          onAction: () => window.location.reload()
        });
      }
      hadController = true;
    });
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }

  render();
  handleIncomingShare();
})();
