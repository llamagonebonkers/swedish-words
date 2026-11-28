(() => {
  'use strict';

  const STORAGE_KEY = 'svenska_ord_entries_v2';
  const HIDE_HINTS_KEY = 'svenska_ord_hide_hints_v1';
  const GRAMMAR_SCHEMA_VERSION = 5;
  const SWEDISH_ALPHABET = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    'Å', 'Ä', 'Ö'
  ];
  const collator = new Intl.Collator('sv', { sensitivity: 'base' });
  const sharedDomParser = new DOMParser();
  const telemetry = window.SwedishWordsTelemetry || null;
  const DAY_MS = 24 * 60 * 60 * 1000;
  const SR_INTERVALS_DAYS = [1, 3, 7, 14, 30];

  const SAMPLE_ENTRIES = [
    { id: 'w1', type: 'word', term: 'anledning', en: 'Reason, cause', th: 'เหตุผล, สาเหตุ', example: 'Det finns ingen anledning att stressa.', exampleEn: 'There is no reason to stress.' },
    { id: 'w2', type: 'word', term: 'besvikelse', en: 'Disappointment', th: 'ความผิดหวัง', example: 'Det var en stor besvikelse.', exampleEn: 'It was a big disappointment.' },
    { id: 'w3', type: 'word', term: 'duktig', en: 'Good at, skilled, clever', th: 'เก่ง, ขยัน', example: 'Hon är väldigt duktig på att laga mat.', exampleEn: 'She is very good at cooking.' },
    { id: 'w4', type: 'word', term: 'egentligen', en: 'Actually, really', th: 'จริงๆ แล้ว, ที่จริง', example: 'Egentligen borde jag sova nu.', exampleEn: 'Actually, I should sleep now.' },
    { id: 'w5', type: 'word', term: 'fika', en: 'Coffee & pastry break with friends', th: 'พักดื่มกาแฟและกินขนม', example: 'Ska vi ta en fika efter jobbet?', exampleEn: 'Shall we have a fika after work?' },
    { id: 'w6', type: 'word', term: 'ganska', en: 'Quite, fairly, rather', th: 'ค่อนข้าง', example: 'Det är ganska kallt ute idag.', exampleEn: 'It is quite cold outside today.' },
    { id: 'w7', type: 'word', term: 'hinna', en: 'To have time / make it in time', th: 'ทันเวลา, มีเวลาพอ', example: 'Jag tror inte att jag hinner med bussen.', exampleEn: 'I don’t think I’ll catch the bus.' },
    { id: 'w8', type: 'word', term: 'jättebra', en: 'Great, very good', th: 'ดีมาก, เยี่ยมมาก', example: 'Det låter som en jättebra idé!', exampleEn: 'That sounds like a great idea!' },
    { id: 'w9', type: 'word', term: 'kanske', en: 'Maybe, perhaps', th: 'อาจจะ, บางที', example: 'Vi kanske ses imorgon.', exampleEn: 'Maybe we’ll see each other tomorrow.' },
    { id: 'w10', type: 'word', term: 'lagom', en: 'Just right, not too much or too little', th: 'พอดี, ไม่มากไม่น้อยเกินไป', example: 'Vattnet är lagom varmt.', exampleEn: 'The water is just the right temperature.' },
    { id: 'w11', type: 'word', term: 'mysig', en: 'Cozy, pleasant, warm', th: 'อบอุ่น, น่ารัก, สบายๆ', example: 'Vi hade en mysig kväll i soffan.', exampleEn: 'We had a cozy evening on the sofa.' },
    { id: 'w12', type: 'word', term: 'orka', en: 'To have the energy / strength to do something', th: 'มีแรง, ไหว', example: 'Jag orkar inte träna idag.', exampleEn: 'I don’t have the energy to work out today.' },
    { id: 'w13', type: 'word', term: 'precis', en: 'Exactly, just now', th: 'พอดีเป๊ะ, เพิ่งจะ', example: 'Jag kom precis hem.', exampleEn: 'I just got home.' },
    { id: 'w14', type: 'word', term: 'rolig', en: 'Fun, funny', th: 'สนุก, ตลก', example: 'Filmen var väldigt rolig.', exampleEn: 'The movie was very funny.' },
    { id: 'w15', type: 'word', term: 'självklart', en: 'Of course, obviously', th: 'แน่นอน', example: 'Självklart kan jag hjälpa dig!', exampleEn: 'Of course I can help you!' },
    { id: 'w16', type: 'word', term: 'trevlig', en: 'Nice, friendly, pleasant', th: 'ใจดี, น่ารัก, น่าคบ', example: 'Ha en trevlig helg!', exampleEn: 'Have a nice weekend!' },
    { id: 'w17', type: 'word', term: 'ungefär', en: 'Approximately, about', th: 'ประมาณ, ราวๆ', example: 'Det tar ungefär tio minuter.', exampleEn: 'It takes about ten minutes.' },
    { id: 'w18', type: 'word', term: 'verkligen', en: 'Really, truly', th: 'จริงๆ, อย่างแท้จริง', example: 'Tack så mycket, verkligen!', exampleEn: 'Thank you very much, really!' },
    { id: 'w19', type: 'word', term: 'återkomma', en: 'To get back to someone, return', th: 'ติดต่อกลับ, กลับมา', example: 'Jag återkommer imorgon.', exampleEn: 'I’ll get back to you tomorrow.' },
    { id: 'w20', type: 'word', term: 'äntligen', en: 'Finally, at last', th: 'ในที่สุด, สักที', example: 'Äntligen är det fredag!', exampleEn: 'Finally it’s Friday!' },
    { id: 'w21', type: 'word', term: 'överens', en: 'In agreement, agreed', th: 'เห็นตรงกัน, ตกลงกัน', example: 'Vi är överens om planen.', exampleEn: 'We agree on the plan.' },

    { id: 'p1', type: 'phrase', term: 'Det gör inget', en: 'No problem / It doesn’t matter', th: 'ไม่เป็นไร', example: 'Ursäkta att jag är sen! – Det gör inget.', exampleEn: 'Sorry I’m late! – No problem.' },
    { id: 'p2', type: 'phrase', term: 'Ha det så bra', en: 'Take care / Have a great time', th: 'ดูแลตัวเองนะ / ขอให้โชคดี', example: 'Vi ses nästa vecka, ha det så bra!', exampleEn: 'See you next week, take care!' },
    { id: 'p3', type: 'phrase', term: 'Hur är läget?', en: 'How’s it going? / What’s up?', th: 'เป็นไงบ้าง?', example: 'Tjena! Hur är läget?', exampleEn: 'Hey! How’s it going?' },
    { id: 'p4', type: 'phrase', term: 'Ingen orsak', en: 'You’re welcome / No problem', th: 'ไม่เป็นไร / ด้วยความยินดี', example: 'Tack för hjälpen! – Ingen orsak.', exampleEn: 'Thanks for the help! – You’re welcome.' },
    { id: 'p5', type: 'phrase', term: 'Jag hänger med', en: 'I understand / I’ll come along', th: 'ฉันเข้าใจ / ฉันไปด้วย', example: 'Ska vi gå? – Ja, jag hänger med.', exampleEn: 'Shall we go? – Yes, I’ll come along.' },
    { id: 'p6', type: 'phrase', term: 'Komma överens', en: 'To get along / reach an agreement', th: 'เข้ากันได้ / ตกลงกันได้', example: 'De kommer väldigt bra överens.', exampleEn: 'They get along very well.' },
    { id: 'p7', type: 'phrase', term: 'Lägga av', en: 'Stop it / Quit it (casual)', th: 'หยุดนะ / เลิกทำได้แล้ว', example: 'Lägg av, du skojar!', exampleEn: 'Stop it, you’re kidding!' },
    { id: 'p8', type: 'phrase', term: 'Passa på', en: 'Take the opportunity', th: 'ถือโอกาส, คว้าโอกาส', example: 'Passa på att gå ut medan solen skiner.', exampleEn: 'Take the opportunity to go out while the sun shines.' },
    { id: 'p9', type: 'phrase', term: 'Ta det lugnt', en: 'Take it easy / Relax', th: 'ใจเย็นๆ / พักผ่อนสบายๆ', example: 'Ta det lugnt, vi har gott om tid.', exampleEn: 'Take it easy, we have plenty of time.' },
    { id: 'p10', type: 'phrase', term: 'Vad synd!', en: 'What a pity! / Too bad!', th: 'น่าเสียดายจัง!', example: 'Kan du inte komma ikväll? Vad synd!', exampleEn: 'Can’t you come tonight? Too bad!' },
    { id: 'p11', type: 'phrase', term: 'Är du med?', en: 'Are you following? / Do you get it?', th: 'เข้าใจไหม? / ทันไหม?', example: 'Först klickar vi här, är du med?', exampleEn: 'First we click here, are you following?' }
  ];
  const SAMPLE_ID_SET = new Set(SAMPLE_ENTRIES.map((e) => e.id));

  // State
  let storageHealthy = true;
  let saveDebounceTimer = null;
  let saveDirty = false;
  let searchDebounceTimer = null;
  let lastLoggedZeroSearchKey = '';
  let entries = [];
  let hideHints = loadHideHints();
  let activeTab = 'word'; // 'word' | 'phrase' | 'practice'
  let searchQuery = '';
  let selectedEntryId = null;
  let editingEntryId = null;
  let formType = 'word';
  let formSavedThisSession = false;
  let isScrubbing = false;
  let lastScrubbedLetter = null;
  let popupTimer = null;
  let suppressScrollPopup = false;
  let lastScrolledLetter = null;
  let lastHighlightedScrubberLetter = null;
  let scrollTicking = false;
  let cachedLetterGroups = [];
  let cachedHeaderHeight = 109;
  const scrubberNodes = new Map();
  let lastFocusedEl = null;
  let pushedModalHistory = false;
  let modalHistorySeq = 0;
  let ignoringProgrammaticPop = false;
  let ignorePopResetTimer = null;
  let lastDeletedEntry = null;
  let pendingToast = null;
  let toastTimer = null;
  let toastActionHandler = null;
  let translateAbortController = null;
  let wiktFormAbortController = null;
  let translateReqId = 0;
  let grammarAbortController = null;
  let exampleAbortController = null;
  const inFlightEnrichments = new Map();
  let duplicateEntryRef = null;
  let suggestedBaseForm = '';
  let pendingExampleEn = '';
  let formWiktSenses = [];
  let formWiktTerm = '';
  let selectedFormPos = '';
  let currentThaiPosGroups = [];
  let activeThaiPos = '';
  let enSyncDebounceTimer = null;
  let exampleChipTranslateController = null;
  let detailThaiAbortController = null;

  // In-memory search & sort index (never persisted to localStorage)
  const entryIndexCache = new WeakMap();
  let sortedByTab = { word: [], phrase: [] };
  let sortDirty = true;

  // Practice State
  let practiceFilter = 'all'; // 'all' | 'word' | 'phrase'
  let practiceQueue = [];
  let practiceDoneCount = 0;
  let practiceTotalSession = 0;
  let practiceRevealed = false;
  let practiceIgnoreDue = false;
  let lastShownPracticeId = null;

  // Elements
  const headerEl = document.querySelector('.header');
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
  const cardExampleEn = document.getElementById('cardExampleEn');
  const cardDetailBtn = document.getElementById('cardDetailBtn');
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
  const detailThSuggest = document.getElementById('detailThSuggest');
  const detailThSuggestLabel = document.getElementById('detailThSuggestLabel');
  const detailThDismissBtn = document.getElementById('detailThDismissBtn');
  const detailThSuggestChips = document.getElementById('detailThSuggestChips');
  const detailExampleWrap = document.getElementById('detailExampleWrap');
  const detailExample = document.getElementById('detailExample');
  const detailExampleEn = document.getElementById('detailExampleEn');
  const speakExampleBtn = document.getElementById('speakExampleBtn');
  const detailGrammarWrap = document.getElementById('detailGrammarWrap');
  const detailGrammarTitle = document.getElementById('detailGrammarTitle');
  const detailPos = document.getElementById('detailPos');
  const detailPosSwitch = document.getElementById('detailPosSwitch');
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
  const thPosFilter = document.getElementById('thPosFilter');
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
  const analyticsStats = document.getElementById('analyticsStats');
  const exportTelemetryJsonBtn = document.getElementById('exportTelemetryJsonBtn');
  const exportTelemetryCsvBtn = document.getElementById('exportTelemetryCsvBtn');
  const clearTelemetryBtn = document.getElementById('clearTelemetryBtn');
  const settingsVoiceNote = document.getElementById('settingsVoiceNote');
  const storageNote = document.getElementById('storageNote');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');

  function generateEntryId() {
    return 'e_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function sanitizeGrammarForms(rawForms) {
    if (!Array.isArray(rawForms)) return [];
    return rawForms
      .filter((f) => f && typeof f.label === 'string' && typeof f.value === 'string')
      .map((f) => ({ label: f.label, value: f.value }));
  }

  function sanitizeAltSenses(rawAlt) {
    if (!Array.isArray(rawAlt)) return [];
    return rawAlt
      .filter((s) => s && typeof s.pos === 'string' && s.pos.trim())
      .slice(0, 4)
      .map((s) => ({
        pos: s.pos.trim(),
        ...(typeof s.hint === 'string' && s.hint.trim() ? { hint: s.hint.trim().slice(0, 80) } : {}),
        forms: sanitizeGrammarForms(s.forms),
        ...(typeof s.baseForm === 'string' && s.baseForm.trim() ? { baseForm: s.baseForm.trim() } : {})
      }));
  }

  function sanitizeEntry(raw, usedIds) {
    if (!raw || typeof raw !== 'object' || typeof raw.term !== 'string') return null;
    const term = raw.term.trim();
    const en = typeof raw.en === 'string' ? raw.en.trim() : '';
    const th = typeof raw.th === 'string' ? raw.th.trim() : '';
    if (!term || (!en && !th)) return null;

    let id = typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : '';
    if (!id || (usedIds && usedIds.has(id))) {
      do {
        id = generateEntryId();
      } while (usedIds && usedIds.has(id));
    }
    if (usedIds) usedIds.add(id);

    const clean = {
      id,
      type: raw.type === 'phrase' ? 'phrase' : 'word',
      term,
      en,
      th
    };
    const example = typeof raw.example === 'string' ? raw.example.trim() : '';
    const exampleEn = typeof raw.exampleEn === 'string' ? raw.exampleEn.trim() : '';
    if (example) clean.example = example;
    if (example && exampleEn) clean.exampleEn = exampleEn;

    if (raw.grammar && typeof raw.grammar === 'object') {
      const forms = sanitizeGrammarForms(raw.grammar.forms);
      const pos = typeof raw.grammar.pos === 'string' ? raw.grammar.pos : '';
      const baseForm = typeof raw.grammar.baseForm === 'string' ? raw.grammar.baseForm : '';
      const altSenses = sanitizeAltSenses(raw.grammar.altSenses);
      if (pos || forms.length > 0) {
        clean.grammar = {
          v: Number(raw.grammar.v) || 1,
          pos,
          forms,
          ...(baseForm ? { baseForm } : {}),
          ...(altSenses.length > 1 ? { altSenses } : {}),
          ...(raw.grammar.userLockedPos ? { userLockedPos: true } : {})
        };
      }
    }

    if (raw.sr && typeof raw.sr === 'object') {
      const reps = Number(raw.sr.reps);
      const intervalDays = Number(raw.sr.intervalDays);
      const dueAt = Number(raw.sr.dueAt);
      if (Number.isFinite(dueAt)) {
        clean.sr = {
          reps: Number.isFinite(reps) && reps >= 0 ? reps : 0,
          intervalDays: Number.isFinite(intervalDays) && intervalDays >= 0 ? intervalDays : 0,
          dueAt
        };
      }
    }

    return clean;
  }

  function compactEntryForStorage(item) {
    const out = {
      id: item.id,
      type: item.type === 'phrase' ? 'phrase' : 'word',
      term: item.term,
      en: item.en || '',
      th: item.th || ''
    };
    if (item.example) out.example = item.example;
    if (item.example && item.exampleEn) out.exampleEn = item.exampleEn;
    if (item.grammar) {
      const altSenses = sanitizeAltSenses(item.grammar.altSenses);
      out.grammar = {
        v: item.grammar.v,
        pos: item.grammar.pos || '',
        forms: item.grammar.forms || [],
        ...(item.grammar.baseForm ? { baseForm: item.grammar.baseForm } : {}),
        ...(altSenses.length > 1 ? { altSenses } : {}),
        ...(item.grammar.userLockedPos ? { userLockedPos: true } : {})
      };
    }
    if (item.sr) out.sr = item.sr;
    return out;
  }

  function markEntriesMutated() {
    sortDirty = true;
  }

  function invalidateEntryIndex(item) {
    if (item) entryIndexCache.delete(item);
  }

  function loadEntries() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) throw new Error('Invalid root schema');
        const usedIds = new Set();
        const sampleMap = new Map(SAMPLE_ENTRIES.map((s) => [s.id, s]));
        let backfilled = false;
        const cleanList = [];

        for (const rawItem of parsed) {
          const item = sanitizeEntry(rawItem, usedIds);
          if (!item) continue;
          if (item.example && !item.exampleEn) {
            const sample = sampleMap.get(item.id);
            if (sample && sample.example === item.example && sample.exampleEn) {
              item.exampleEn = sample.exampleEn;
              backfilled = true;
            }
          }
          cleanList.push(item);
        }

        storageHealthy = true;
        if (backfilled) {
          queueMicrotask(() => scheduleSave());
        }
        return cleanList;
      }
    } catch (_) {
      storageHealthy = false;
      try {
        const broken = localStorage.getItem(STORAGE_KEY);
        if (broken) {
          localStorage.setItem(`${STORAGE_KEY}_corrupt_backup`, broken);
        }
      } catch (__) {}
      queueMicrotask(() => {
        showToast('Local data could not be read — export or import a backup', { durationMs: 6000 });
      });
    }
    return [];
  }

  function persistEntriesNow() {
    clearTimeout(saveDebounceTimer);
    saveDebounceTimer = null;
    saveDirty = false;
    try {
      const payload = JSON.stringify(entries.map(compactEntryForStorage));
      localStorage.setItem(STORAGE_KEY, payload);
      storageHealthy = true;
      return true;
    } catch (err) {
      storageHealthy = false;
      const isQuota = err && (err.name === 'QuotaExceededError' || err.code === 22);
      const msg = isQuota
        ? 'Device storage is full — export a backup in Settings'
        : 'Cannot save locally (private mode or blocked storage)';
      showToast(msg, { durationMs: 6000 });
      return false;
    }
  }

  function saveEntries() {
    return persistEntriesNow();
  }

  function scheduleSave(delayMs = 280) {
    saveDirty = true;
    clearTimeout(saveDebounceTimer);
    saveDebounceTimer = setTimeout(() => {
      if (saveDirty) persistEntriesNow();
    }, delayMs);
  }

  function flushPendingSave() {
    if (saveDirty) persistEntriesNow();
  }

  window.addEventListener('pagehide', flushPendingSave);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushPendingSave();
      stopSpeaking();
    }
  });

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

  // Preserves Swedish å, ä, ö for exact deduplication and JSON import
  function getCanonicalKey(term) {
    return stripLeadingArticle(term)
      .normalize('NFC')
      .toLocaleLowerCase('sv-SE')
      .replace(/\s+/g, ' ');
  }

  // Strips Latin accents for tolerant search while preserving Thai ำ (U+0E33) in NFC
  function normalizeForSearch(str) {
    return (str || '')
      .normalize('NFC')
      .toLocaleLowerCase('sv-SE')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .normalize('NFC');
  }

  function normalizeThaiForSearch(str) {
    return (str || '').normalize('NFC').toLowerCase();
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

  function getEntryIndex(item) {
    let idx = entryIndexCache.get(item);
    if (!idx) {
      const sortTerm = getSortTerm(item.term);
      idx = {
        sortTerm,
        firstLetter: getFirstLetter(item.term),
        svSearch: normalizeForSearch(item.term),
        enSearch: item.en ? normalizeForSearch(item.en) : '',
        thSearch: item.th ? normalizeThaiForSearch(item.th) : '',
        exSearch: item.example ? normalizeForSearch(item.example) : '',
        exEnSearch: item.exampleEn ? normalizeForSearch(item.exampleEn) : ''
      };
      entryIndexCache.set(item, idx);
    }
    return idx;
  }

  function ensureSortedEntries() {
    if (!sortDirty) return;
    const words = [];
    const phrases = [];
    for (const item of entries) {
      getEntryIndex(item);
      if (item.type === 'phrase') phrases.push(item);
      else words.push(item);
    }
    const cmp = (a, b) => collator.compare(getEntryIndex(a).sortTerm, getEntryIndex(b).sortTerm);
    words.sort(cmp);
    phrases.sort(cmp);
    sortedByTab = { word: words, phrase: phrases };
    sortDirty = false;
  }

  function matchesSearch(item, qLatin, qThai) {
    if (!qLatin) return true;
    const idx = getEntryIndex(item);
    return (
      idx.svSearch.includes(qLatin) ||
      (idx.enSearch && idx.enSearch.includes(qLatin)) ||
      (idx.thSearch && idx.thSearch.includes(qThai)) ||
      (idx.exSearch && idx.exSearch.includes(qLatin)) ||
      (idx.exEnSearch && idx.exEnSearch.includes(qLatin))
    );
  }

  function isDueForPractice(item, now = Date.now()) {
    return !item.sr || !item.sr.dueAt || item.sr.dueAt <= now;
  }

  // Single-pass count + filtered list over pre-sorted arrays (O(N), zero sorting per keystroke)
  function computeSearchSnapshot(tabType = activeTab) {
    ensureSortedEntries();
    const trimmed = searchQuery.trim();
    const qLatin = trimmed ? normalizeForSearch(trimmed) : '';
    const qThai = trimmed ? normalizeThaiForSearch(trimmed) : '';
    const now = Date.now();

    let words = 0;
    let phrases = 0;
    let due = 0;
    const filtered = [];

    for (const item of sortedByTab.word) {
      if (isDueForPractice(item, now)) due++;
      if (!qLatin || matchesSearch(item, qLatin, qThai)) {
        words++;
        if (tabType === 'word') filtered.push(item);
      }
    }

    for (const item of sortedByTab.phrase) {
      if (isDueForPractice(item, now)) due++;
      if (!qLatin || matchesSearch(item, qLatin, qThai)) {
        phrases++;
        if (tabType === 'phrase') filtered.push(item);
      }
    }

    wordCountEl.textContent = words;
    phraseCountEl.textContent = phrases;
    practiceCountEl.textContent = due;

    wordCountEl.classList.toggle('has-matches', Boolean(qLatin && words > 0 && activeTab !== 'word'));
    phraseCountEl.classList.toggle('has-matches', Boolean(qLatin && phrases > 0 && activeTab !== 'phrase'));

    return { words, phrases, due, filtered };
  }

  function updateCounts() {
    const { words, phrases, due } = computeSearchSnapshot(activeTab);
    return { words, phrases, due };
  }

  function getFilteredEntries(tabType = activeTab) {
    ensureSortedEntries();
    const list = tabType === 'phrase' ? sortedByTab.phrase : sortedByTab.word;
    const trimmed = searchQuery.trim();
    if (!trimmed) return list;
    const qLatin = normalizeForSearch(trimmed);
    const qThai = normalizeThaiForSearch(trimmed);
    return list.filter((item) => matchesSearch(item, qLatin, qThai));
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
    const existingKeys = new Set(entries.map((e) => getCanonicalKey(e.term)));
    const usedIds = new Set(entries.map((e) => e.id));
    let added = 0;
    for (const s of SAMPLE_ENTRIES) {
      const key = getCanonicalKey(s.term);
      if (!existingKeys.has(key)) {
        const copy = sanitizeEntry({ ...s }, usedIds);
        if (copy) {
          entries.push(copy);
          existingKeys.add(key);
          added++;
        }
      }
    }
    if (added > 0) {
      markEntriesMutated();
      saveEntries();
      render();
    }
    showToast(added > 0 ? `Added ${added} sample words & phrases` : 'Sample words already present');
  }

  function removeSampleWords() {
    const before = entries.length;
    entries = entries.filter((e) => !SAMPLE_ID_SET.has(e.id));
    const removed = before - entries.length;
    if (removed > 0) {
      markEntriesMutated();
      saveEntries();
      render();
    }
    showToast(removed > 0 ? `Removed ${removed} sample items` : 'No sample words to remove');
  }

  // Event delegation for entry cards (1 listener instead of N per render)
  entriesList.addEventListener('click', (e) => {
    const card = e.target.closest('.entry-card');
    if (card && card.dataset.id) {
      openDetail(card.dataset.id);
    }
  });

  // Sync sticky --header-h for letter headers (prevents clipping at large mobile font scales)
  function syncHeaderHeight() {
    if (!headerEl) return;
    const h = Math.round(headerEl.offsetHeight);
    if (h > 0 && h !== cachedHeaderHeight) {
      cachedHeaderHeight = h;
      document.documentElement.style.setProperty('--header-h', `${h}px`);
    }
  }

  if (typeof ResizeObserver === 'function' && headerEl) {
    new ResizeObserver(syncHeaderHeight).observe(headerEl);
  }
  window.addEventListener('resize', syncHeaderHeight, { passive: true });

  function render() {
    const snapshot = computeSearchSnapshot(activeTab);

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

    const filtered = snapshot.filtered;
    entriesList.textContent = '';

    if (filtered.length === 0) {
      cachedLetterGroups = [];
      emptyState.classList.remove('hidden');
      emptyActions.textContent = '';
      const rawQ = searchQuery.trim();

      if (rawQ) {
        const otherTab = activeTab === 'word' ? 'phrase' : 'word';
        const otherCount = otherTab === 'word' ? snapshot.words : snapshot.phrases;
        const zeroKey = `${activeTab}:${rawQ.toLowerCase()}`;
        if (zeroKey !== lastLoggedZeroSearchKey) {
          lastLoggedZeroSearchKey = zeroKey;
          telemetry?.trackSearchZeroHit(rawQ.length, activeTab, otherCount);
        }

        emptyTitle.textContent = 'No matches';
        emptySub.textContent = `Nothing matched "${rawQ}" in ${activeTab === 'word' ? 'Words' : 'Phrases'}.`;

        const addQBtn = document.createElement('button');
        addQBtn.type = 'button';
        addQBtn.className = 'btn-primary';
        addQBtn.textContent = `Add "${rawQ}"`;
        addQBtn.addEventListener('click', () => {
          const suggestedType = rawQ.split(/\s+/).length >= 3 ? 'phrase' : activeTab;
          openForm(null, {
            prefillTerm: rawQ,
            prefillType: suggestedType,
            autoSuggest: true,
            source: 'search_empty'
          });
        });
        emptyActions.appendChild(addQBtn);

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

    lastLoggedZeroSearchKey = '';
    emptyState.classList.add('hidden');

    const groups = new Map();
    for (const item of filtered) {
      const letter = getEntryIndex(item).firstLetter;
      if (!groups.has(letter)) groups.set(letter, []);
      groups.get(letter).push(item);
    }

    const sortedLetters = Array.from(groups.keys()).sort(
      (a, b) => getAlphabetOrder(a) - getAlphabetOrder(b)
    );

    const fragment = document.createDocumentFragment();
    const groupEls = [];
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
        termSpan.lang = 'sv';
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
        section.appendChild(card);
      }

      groupEls.push(section);
      fragment.appendChild(section);
    }

    entriesList.appendChild(fragment);
    cachedLetterGroups = groupEls;
    renderScrubber(new Set(sortedLetters));
  }

  function initScrubber() {
    if (scrubberNodes.size > 0) return;
    const frag = document.createDocumentFragment();
    for (const letter of SWEDISH_ALPHABET) {
      const el = document.createElement('span');
      el.className = 'scrubber-item';
      el.dataset.letter = letter;
      el.textContent = letter;
      scrubberNodes.set(letter, el);
      frag.appendChild(el);
    }
    scrubber.appendChild(frag);
  }

  function renderScrubber(availableLetters) {
    initScrubber();
    for (const [letter, el] of scrubberNodes) {
      el.classList.toggle('available', availableLetters.has(letter));
    }
  }

  function showLetterPopup(letter) {
    letterPopup.textContent = letter;
    const wasHidden = letterPopup.classList.contains('hidden');
    if (wasHidden) {
      letterPopup.classList.remove('hidden');
      requestAnimationFrame(() => {
        if (!letterPopup.classList.contains('hidden')) {
          letterPopup.classList.add('visible');
        }
      });
    } else {
      letterPopup.classList.add('visible');
    }

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
    if (letter === lastHighlightedScrubberLetter) return;
    if (lastHighlightedScrubberLetter) {
      scrubberNodes.get(lastHighlightedScrubberLetter)?.classList.remove('current');
    }
    lastHighlightedScrubberLetter = letter;
    if (letter) {
      scrubberNodes.get(letter)?.classList.add('current');
    }
  }

  function scrollToLetter(letter) {
    const groups = cachedLetterGroups;
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
      const top = targetGroup.getBoundingClientRect().top + window.scrollY - cachedHeaderHeight - 4;
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
    if (letter === lastScrubbedLetter) return;
    lastScrubbedLetter = letter;
    if (typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(8);
      } catch (_) {}
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
        const groups = cachedLetterGroups;
        if (groups.length === 0) return;

        const headerHeight = cachedHeaderHeight + 16;
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

  // Live Search (debounced for large dictionaries) & Smart Enter
  function applySearchChange() {
    if (activeTab === 'practice' && searchQuery.trim()) {
      const counts = updateCounts();
      const targetTab = counts.words === 0 && counts.phrases > 0 ? 'phrase' : 'word';
      switchTab(targetTab);
      return;
    }
    render();
  }

  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value;
    clearSearchBtn.classList.toggle('hidden', searchQuery.length === 0);
    clearTimeout(searchDebounceTimer);
    if (entries.length > 150 && searchQuery.length > 0) {
      searchDebounceTimer = setTimeout(applySearchChange, 70);
    } else {
      applySearchChange();
    }
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const rawQ = searchInput.value.trim();
    if (!rawQ) return;
    e.preventDefault();
    clearTimeout(searchDebounceTimer);
    searchQuery = searchInput.value;

    const searchTab = activeTab === 'practice' ? 'word' : activeTab;
    const filtered = getFilteredEntries(searchTab);
    if (filtered.length === 1) {
      searchInput.blur();
      openDetail(filtered[0].id);
      return;
    }
    if (filtered.length === 0) {
      const otherTab = searchTab === 'word' ? 'phrase' : 'word';
      const otherFiltered = getFilteredEntries(otherTab);
      if (otherFiltered.length === 1) {
        searchInput.blur();
        switchTab(otherTab);
        openDetail(otherFiltered[0].id);
      } else if (otherFiltered.length > 1) {
        searchInput.blur();
        switchTab(otherTab);
      } else {
        const suggestedType = rawQ.split(/\s+/).length >= 3 ? 'phrase' : searchTab;
        openForm(null, {
          prefillTerm: rawQ,
          prefillType: suggestedType,
          autoSuggest: true,
          source: 'search_empty'
        });
      }
    }
  });

  clearSearchBtn.addEventListener('click', () => {
    clearTimeout(searchDebounceTimer);
    searchInput.value = '';
    searchQuery = '';
    lastLoggedZeroSearchKey = '';
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
    const now = Date.now();
    return entries.filter((item) => {
      if (practiceFilter !== 'all' && item.type !== practiceFilter) return false;
      return practiceIgnoreDue || isDueForPractice(item, now);
    });
  }

  function buildPracticeQueue() {
    const pool = getPracticeCandidates();
    practiceQueue = shuffleArray(pool.map((e) => e.id));
    practiceDoneCount = 0;
    practiceTotalSession = practiceQueue.length;
    practiceRevealed = false;
    lastShownPracticeId = null;
    if (practiceQueue.length > 0) {
      telemetry?.trackPracticeStart(practiceQueue.length, practiceFilter);
    }
  }

  function renderPracticeView() {
    // Prune any deleted items from queue
    const entryMap = new Map(entries.map((e) => [e.id, e]));
    practiceQueue = practiceQueue.filter((id) => entryMap.has(id));

    const currentItem = practiceQueue.length > 0 ? entryMap.get(practiceQueue[0]) : null;
    if (!currentItem) {
      lastShownPracticeId = null;
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

    if (!practiceRevealed && lastShownPracticeId !== currentItem.id) {
      lastShownPracticeId = currentItem.id;
      telemetry?.trackCardShown(currentItem);
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
      if (currentItem.exampleEn && currentItem.exampleEn.trim()) {
        cardExampleEn.textContent = currentItem.exampleEn;
        cardExampleEn.classList.remove('hidden');
      } else {
        cardExampleEn.classList.add('hidden');
      }
    } else {
      cardExample.classList.add('hidden');
      cardExampleEn.classList.add('hidden');
    }

    cardAnswer.classList.toggle('hidden', !practiceRevealed);
    cardTapHint.classList.toggle('hidden', practiceRevealed);
    practiceRevealWrap.classList.toggle('hidden', practiceRevealed);
    practiceRateWrap.classList.toggle('hidden', !practiceRevealed);
  }

  function revealPracticeCard() {
    if (practiceRevealed || practiceQueue.length === 0) return;
    practiceRevealed = true;
    telemetry?.trackCardRevealed();
    renderPracticeView();
    const currentItem = entries.find((e) => e.id === practiceQueue[0]);
    if (currentItem && currentItem.example && !currentItem.exampleEn) {
      loadExampleTranslation(currentItem);
    }
  }

  function ratePracticeCard(knewIt) {
    if (practiceQueue.length === 0) return;
    stopSpeaking();
    const id = practiceQueue.shift();
    const item = entries.find((e) => e.id === id);

    if (item) {
      const prevReps = item.sr?.reps || 0;
      if (knewIt) {
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
      telemetry?.trackCardRated({ ...item, sr: { ...item.sr, reps: prevReps } }, knewIt, practiceQueue.length);
      scheduleSave(300);
    }

    practiceRevealed = false;
    lastShownPracticeId = null;
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

  cardDetailBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const id = practiceQueue[0];
    if (id) openDetail(id);
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
        history.pushState({ swedishWordsModal: true, seq: ++modalHistorySeq }, '');
        pushedModalHistory = true;
      } catch (_) {}
    }
  }

  function popModalHistoryIfNeeded() {
    if (pushedModalHistory) {
      pushedModalHistory = false;
      ignoringProgrammaticPop = true;
      clearTimeout(ignorePopResetTimer);
      ignorePopResetTimer = setTimeout(() => {
        ignoringProgrammaticPop = false;
      }, 250);
      try {
        history.back();
      } catch (_) {
        ignoringProgrammaticPop = false;
      }
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

  // Toast helper (protects active Undo window from being clobbered by background toasts)
  function flushPendingToast() {
    if (!pendingToast) return;
    const next = pendingToast;
    pendingToast = null;
    showToast(next.message, next.opts);
  }

  function hideToast() {
    clearTimeout(toastTimer);
    undoToast.classList.add('hidden');
    toastActionHandler = null;
    lastDeletedEntry = null;
    flushPendingToast();
  }

  function showToast(message, { actionLabel = '', onAction = null, durationMs = 3500, priority = false } = {}) {
    if (lastDeletedEntry && !priority) {
      pendingToast = { message, opts: { actionLabel, onAction, durationMs, priority } };
      return;
    }
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
      flushPendingToast();
    }, durationMs);
  }

  function showUndoToast(deletedItem) {
    lastDeletedEntry = deletedItem;
    showToast(`Deleted "${deletedItem.term}"`, {
      actionLabel: 'Undo',
      durationMs: 5000,
      priority: true,
      onAction: () => {
        if (!lastDeletedEntry) return;
        entries.push(lastDeletedEntry);
        markEntriesMutated();
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
  let speechWatchdogTimer = null;

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

  function clearSpeakingVisual(btn = activeSpeakingBtn) {
    clearTimeout(speechWatchdogTimer);
    speechWatchdogTimer = null;
    if (btn) btn.classList.remove('speaking');
    if (activeSpeakingBtn && activeSpeakingBtn !== btn) {
      activeSpeakingBtn.classList.remove('speaking');
    }
    if (!btn || activeSpeakingBtn === btn) activeSpeakingBtn = null;
  }

  function stopSpeaking() {
    if (!supportsSpeech) return;
    try {
      window.speechSynthesis.cancel();
    } catch (_) {}
    clearSpeakingVisual();
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

    activeSpeakingBtn = btn || null;
    if (btn) btn.classList.add('speaking');

    // Watchdog prevents stuck .speaking state if mobile Chrome/Safari drops onend
    const maxSpeechMs = Math.max(4000, Math.min(20000, text.length * 140 + 2500));
    speechWatchdogTimer = setTimeout(() => {
      clearSpeakingVisual(btn);
    }, maxSpeechMs);

    utterance.onstart = () => {
      activeSpeakingBtn = btn || null;
      if (btn) btn.classList.add('speaking');
    };
    utterance.onend = () => clearSpeakingVisual(btn);
    utterance.onerror = () => clearSpeakingVisual(btn);

    try {
      window.speechSynthesis.speak(utterance);
    } catch (_) {
      clearSpeakingVisual(btn);
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
    hideDetailThaiSuggest();

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
      if (item.exampleEn && item.exampleEn.trim()) {
        detailExampleEn.textContent = item.exampleEn;
        detailExampleEn.classList.remove('hidden');
      } else {
        detailExampleEn.textContent = '';
        detailExampleEn.classList.add('hidden');
        loadExampleTranslation(item);
      }
      detailExampleWrap.classList.remove('hidden');
    } else {
      detailExampleEn.textContent = '';
      detailExampleEn.classList.add('hidden');
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

  async function loadExampleTranslation(item) {
    if (exampleAbortController) {
      exampleAbortController.abort();
      exampleAbortController = null;
    }
    const entryId = item.id;
    const ex = (item.example || '').trim();
    if (!ex || item.exampleEn) return;

    function applyExampleEnToUI(translatedEn) {
      const liveItem = entries.find((e) => e.id === entryId);
      if (!liveItem || (liveItem.example || '').trim() !== ex) return;
      liveItem.exampleEn = translatedEn;
      invalidateEntryIndex(liveItem);
      scheduleSave(300);
      if (selectedEntryId === entryId) {
        detailExampleEn.textContent = translatedEn;
        detailExampleEn.classList.remove('hidden');
      }
      if (activeTab === 'practice' && practiceRevealed && practiceQueue[0] === entryId) {
        cardExampleEn.textContent = translatedEn;
        cardExampleEn.classList.remove('hidden');
      }
    }

    // Instant offline backfill if this matches a built-in sample entry
    const sampleMatch = SAMPLE_ENTRIES.find((s) => s.id === entryId && s.example === ex && s.exampleEn);
    if (sampleMatch) {
      applyExampleEnToUI(sampleMatch.exampleEn);
      return;
    }

    if (!navigator.onLine) return;
    const controller = new AbortController();
    exampleAbortController = controller;
    try {
      const res = await translateWithDict(ex, 'sv', 'en', controller.signal);
      if (controller.signal.aborted) return;
      if (res.primary) {
        applyExampleEnToUI(res.primary);
      }
    } catch (_) {
    } finally {
      if (exampleAbortController === controller) exampleAbortController = null;
    }
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

  const EN_STOPWORDS = new Set([
    'a', 'an', 'the', 'to', 'of', 'in', 'on', 'at', 'for', 'by', 'with', 'from',
    'as', 'be', 'is', 'are', 'was', 'were', 'it', 'its', 'or', 'and', 'not',
    'someone', 'something', 'oneself', 'one', 'very', 'that', 'this'
  ]);
  const EN_MODAL_OR_AUX_VERBS = new Set([
    'may', 'might', 'can', 'could', 'must', 'shall', 'should', 'will', 'would',
    'get', 'gets', 'got', 'receive', 'receives', 'allowed', 'permitted'
  ]);

  function normalizePosCategory(rawPos) {
    const p = (rawPos || '').trim().toLowerCase();
    if (!p) return '';
    if (p.startsWith('adv') || p.includes('adverb')) return 'Adverb';
    if (p.startsWith('adj') || p.includes('adjektiv')) return 'Adjective';
    if (p.startsWith('noun') || p.includes('substantiv') || p === 'proper noun') return 'Noun';
    if (p === 'verb' || p === 'auxiliary verb' || p.startsWith('verb')) return 'Verb';
    if (p.startsWith('pron') || p.includes('pronomen') || p === 'determiner') return 'Pronoun';
    if (p.startsWith('prep') || p.includes('preposition')) return 'Preposition';
    if (p.startsWith('conj') || p.includes('konjunktion') || p.includes('subjunktion')) return 'Conjunction';
    if (p.startsWith('interj') || p.includes('interjektion')) return 'Interjection';
    if (p.startsWith('num') || p.includes('räkneord')) return 'Numeral';
    if (p.startsWith('art') || p.includes('artikel')) return 'Article';
    return '';
  }

  function shortPosLabel(posKey) {
    const map = {
      Noun: 'noun',
      Verb: 'verb',
      Adjective: 'adj',
      Adverb: 'adv',
      Pronoun: 'pron',
      Preposition: 'prep',
      Conjunction: 'conj',
      Interjection: 'interj',
      Numeral: 'num'
    };
    return map[posKey] || '';
  }

  function extractMeaningTokens(text) {
    return (text || '')
      .toLowerCase()
      .replace(/[()[\]{}"'“”’.,!?;:/–—-]+/g, ' ')
      .split(/\s+/)
      .map((w) => w.trim())
      .filter((w) => w.length >= 2 && !EN_STOPWORDS.has(w));
  }

  function hideDetailThaiSuggest() {
    if (detailThaiAbortController) {
      detailThaiAbortController.abort();
      detailThaiAbortController = null;
    }
    if (detailThSuggest) detailThSuggest.classList.add('hidden');
    if (detailThSuggestChips) detailThSuggestChips.textContent = '';
  }

  detailThDismissBtn?.addEventListener('click', hideDetailThaiSuggest);

  async function loadDetailThaiForPos(item, targetSense) {
    hideDetailThaiSuggest();
    if (!item || !targetSense || !navigator.onLine || !detailThSuggest) return;

    const entryId = item.id;
    const targetPosKey = normalizePosCategory(targetSense.pos);
    const controller = new AbortController();
    detailThaiAbortController = controller;

    try {
      let candidates = [];
      let sourceLabel = '';

      // 1. First check if the entry's current English word has Thai translations specifically for targetPosKey
      const currentEn = (item.en || '').trim();
      if (currentEn) {
        const res = await translateWithDict(currentEn, 'en', 'th', controller.signal);
        if (controller.signal.aborted || selectedEntryId !== entryId) return;
        const grouped = buildThaiPosGroups(res, currentEn, { preferredPos: targetPosKey });
        const exactGroup = grouped.groups.find((g) => g.posKey === targetPosKey);
        if (exactGroup && exactGroup.candidates.length > 0) {
          candidates = exactGroup.candidates;
        }
      }

      // 2. If current English belongs to a different sense (e.g. kort: "short" -> switched to Noun "card"),
      //    translate the new sense's primary English hint term!
      if (candidates.length === 0 && targetSense.hint) {
        const primaryHintEn = targetSense.hint
          .split(/[,;/]+/)[0]
          .replace(/\([^)]*\)/g, '')
          .trim();
        if (primaryHintEn && primaryHintEn.length <= 40) {
          const res = await translateWithDict(primaryHintEn, 'en', 'th', controller.signal);
          if (controller.signal.aborted || selectedEntryId !== entryId) return;
          const grouped = buildThaiPosGroups(res, primaryHintEn, { preferredPos: targetPosKey });
          const active = grouped.groups.find((g) => g.posKey === grouped.activePos) || grouped.groups[0];
          if (active && active.candidates.length > 0) {
            candidates = active.candidates;
            sourceLabel = primaryHintEn;
          }
        }
      }

      if (controller.signal.aborted || selectedEntryId !== entryId || candidates.length === 0) return;

      const currentTh = (item.th || '').trim();
      const topCands = candidates.slice(0, 4);
      // Skip showing bar if the single suggestion is already identical to current Thai
      if (topCands.length === 1 && topCands[0].text === currentTh) return;

      detailThSuggestLabel.textContent = sourceLabel
        ? `Thai for ${targetSense.pos} (${sourceLabel})`
        : `Thai for ${targetSense.pos}`;
      detailThSuggestChips.textContent = '';

      for (const cand of topCands) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'en-chip' + (cand.text === currentTh ? ' active' : '');
        btn.textContent = cand.text;
        if (cand.hint) {
          const hintSpan = document.createElement('span');
          hintSpan.className = 'chip-hint';
          hintSpan.textContent = `(${cand.hint})`;
          btn.appendChild(hintSpan);
        }
        btn.addEventListener('click', () => {
          const live = entries.find((e) => e.id === entryId);
          if (!live) return;
          live.th = cand.text;
          invalidateEntryIndex(live);
          scheduleSave(200);
          detailTh.textContent = cand.text;
          detailThWrap.classList.remove('hidden');
          hideDetailThaiSuggest();
          showToast(`Updated Thai to "${cand.text}"`);
        });
        detailThSuggestChips.appendChild(btn);
      }

      detailThSuggest.classList.remove('hidden');
    } catch (_) {
    } finally {
      if (detailThaiAbortController === controller) detailThaiAbortController = null;
    }
  }

  function switchSelectedEntrySense(targetPos) {
    const liveItem = entries.find((e) => e.id === selectedEntryId);
    if (!liveItem || !liveItem.grammar || !Array.isArray(liveItem.grammar.altSenses)) return;
    const target = liveItem.grammar.altSenses.find((s) => s.pos === targetPos);
    if (!target) return;

    liveItem.grammar = {
      ...liveItem.grammar,
      v: GRAMMAR_SCHEMA_VERSION,
      pos: target.pos,
      forms: target.forms || [],
      baseForm: target.baseForm || '',
      userLockedPos: true
    };
    scheduleSave(200);
    renderTermWithArticle(detailTerm, liveItem);
    renderGrammarData(liveItem.grammar);
    render();
    loadDetailThaiForPos(liveItem, target);
  }

  function renderGrammarData(grammar) {
    detailGrammarStatus.classList.add('hidden');
    detailForms.textContent = '';

    if (!grammar || (!grammar.pos && (!grammar.forms || grammar.forms.length === 0))) {
      detailGrammarWrap.classList.add('hidden');
      return;
    }

    detailGrammarTitle.textContent = grammar.baseForm
      ? `Grammar & forms (base: ${grammar.baseForm})`
      : 'Grammar & forms';

    const altSenses = Array.isArray(grammar.altSenses) ? grammar.altSenses : [];
    if (altSenses.length > 1 && detailPosSwitch) {
      detailPos.classList.add('hidden');
      detailPosSwitch.textContent = '';
      for (const s of altSenses) {
        const pill = document.createElement('button');
        pill.type = 'button';
        const isActive = s.pos === grammar.pos;
        pill.className = 'grammar-pos-pill' + (isActive ? ' active' : '');
        pill.textContent = s.pos;
        pill.setAttribute('aria-pressed', String(isActive));
        if (s.hint) pill.title = s.hint;
        pill.addEventListener('click', () => {
          if (!isActive) switchSelectedEntrySense(s.pos);
        });
        detailPosSwitch.appendChild(pill);
      }
      detailPosSwitch.classList.remove('hidden');
    } else {
      if (detailPosSwitch) {
        detailPosSwitch.textContent = '';
        detailPosSwitch.classList.add('hidden');
      }
      if (grammar.pos) {
        detailPos.textContent = grammar.pos;
        detailPos.classList.remove('hidden');
      } else {
        detailPos.classList.add('hidden');
      }
    }

    if (Array.isArray(grammar.forms) && grammar.forms.length > 0) {
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
    } else if (grammar.pos) {
      const note = document.createElement('p');
      note.className = 'grammar-invariable';
      note.textContent = 'Invariable (no inflected forms)';
      detailForms.appendChild(note);
    }

    detailGrammarWrap.classList.remove('hidden');
  }

  // Wiktionary parsing helpers (sense-aware base form, examples, translations & grammar tables)
  function stripHtml(html) {
    if (!html) return '';
    const doc = sharedDomParser.parseFromString(html, 'text/html');
    return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function isUsableExample(svText) {
    if (!svText) return false;
    if (svText.length < 8 || svText.length > 115) return false;
    if (!svText.includes(' ')) return false;
    if (/^(Synonymer|Antonymer|Etymologi|Uttal|Jämför|Se även|Besläktade|Sammansättningar|Källa|Varianter|Användning):/i.test(svText)) {
      return false;
    }
    return true;
  }

  function parseEnWiktionarySenses(enWiktData, sourceWord) {
    const senses = [];
    const svBlocks = Array.isArray(enWiktData?.sv) ? enWiktData.sv : [];
    const srcLower = (sourceWord || '').trim().toLocaleLowerCase('sv-SE');

    for (const block of svBlocks) {
      const posKey = normalizePosCategory(block.partOfSpeech);
      const posLabel = posKey || (block.partOfSpeech || '').trim();
      let baseForm = '';
      const definitions = [];

      const defs = Array.isArray(block.definitions) ? block.definitions : [];
      for (const def of defs) {
        const defText = stripHtml(def.definition || '');
        if (!baseForm && def.definition && def.definition.includes('form-of-definition')) {
          const doc = sharedDomParser.parseFromString(def.definition, 'text/html');
          const link = doc.querySelector('.form-of-definition-link a');
          const lemma = (link?.textContent || '').trim();
          if (lemma && lemma.toLocaleLowerCase('sv-SE') !== srcLower) {
            baseForm = lemma;
          }
        }

        const examples = [];
        if (Array.isArray(def.parsedExamples)) {
          for (const ex of def.parsedExamples) {
            const svText = stripHtml(ex.example);
            const enText = stripHtml(ex.translation);
            if (isUsableExample(svText) && !examples.some((e) => e.sv === svText)) {
              examples.push({ sv: svText, en: enText });
            }
          }
        } else if (Array.isArray(def.examples)) {
          for (const rawEx of def.examples) {
            const svText = stripHtml(rawEx);
            if (isUsableExample(svText) && !examples.some((e) => e.sv === svText)) {
              examples.push({ sv: svText, en: '' });
            }
          }
        }

        if (defText || examples.length > 0) {
          definitions.push({ text: defText, examples });
        }
      }

      if (posLabel || definitions.length > 0 || baseForm) {
        senses.push({
          posKey,
          posLabel,
          baseForm,
          definitions
        });
      }
    }

    return senses;
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

  function parseGrammarTableElement(table, fallbackPos = '') {
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
    return { pos: fallbackPos || tablePos, forms };
  }

  function getHeadingMeta(el) {
    if (!el || el.nodeType !== 1) return null;
    let h = null;
    if (/^H[234]$/.test(el.tagName)) {
      h = el;
    } else if (el.classList && el.classList.contains('mw-heading')) {
      h = el.querySelector('h2, h3, h4');
    }
    if (!h) return null;
    const level = Number(h.tagName[1]);
    const text = (h.textContent || '').replace(/\[redigera\]/gi, '').replace(/\s+/g, ' ').trim();
    return { level, text };
  }

  function parseTranslationTerms(rawText) {
    return rawText
      .replace(/^\s*(engelska|thailändska)\s*:\s*/i, '')
      .replace(/\([a-z]{2,3}\)/gi, ' ')
      .replace(/\[[^\]]*\]/g, ' ')
      .replace(/\([^)]*\)/g, ' ')
      .split(/[,;]+/)
      .map((s) => s.replace(/\s+/g, ' ').trim())
      .filter((s) => s.length >= 2 && s.length <= 50 && !/^[mfncu]$|^pl$/i.test(s));
  }

  // Strictly parses ONLY the Swedish (Svenska) h2 section, keeping grammar tables,
  // examples and translations isolated inside their owning h3 POS section!
  function parseSvWiktionarySections(html) {
    if (!html) return [];
    const doc = sharedDomParser.parseFromString(html, 'text/html');
    const root = doc.querySelector('.mw-parser-output') || doc.body;
    const children = Array.from(root.children);

    const sections = [];
    let inSwedish = false;
    let current = null;
    let inTranslations = false;

    for (const el of children) {
      const heading = getHeadingMeta(el);
      if (heading) {
        if (heading.level === 2) {
          if (heading.text.toLowerCase() === 'svenska') {
            inSwedish = true;
            current = null;
            inTranslations = false;
            continue;
          }
          if (inSwedish) break; // Reached next language (Danska, Isländska, etc.)
          continue;
        }
        if (!inSwedish) continue;

        if (heading.level === 3) {
          const posKey = normalizePosCategory(heading.text);
          if (posKey) {
            current = {
              posKey,
              posLabel: posKey,
              forms: [],
              enTerms: [],
              thTerms: [],
              examples: [],
              svDefs: []
            };
            sections.push(current);
          } else {
            current = null;
          }
          inTranslations = false;
          continue;
        }

        if (heading.level === 4 && current) {
          inTranslations = heading.text.toLowerCase().includes('översättning');
          continue;
        }
      }

      if (!inSwedish || !current) continue;

      // 1. Grammar table strictly bound to THIS h3 section
      if (!inTranslations && current.forms.length === 0) {
        const table = el.matches?.('table.grammar') ? el : el.querySelector?.('table.grammar');
        if (table && isSwedishGrammarTable(table)) {
          const tablePos = detectTablePos(table);
          if (!tablePos || tablePos === current.posKey) {
            const parsed = parseGrammarTableElement(table, current.posKey);
            if (parsed.pos) current.posLabel = parsed.pos;
            current.forms = parsed.forms || [];
          }
        }
      }

      // 2. Swedish definitions & usage examples from <ol> under THIS h3 section
      if (!inTranslations && el.tagName === 'OL') {
        const dds = el.querySelectorAll('dd');
        for (const dd of dds) {
          if (dd.classList.contains('semantic-relation')) continue;
          const italic = dd.querySelector('i');
          if (!italic) continue;
          const svEx = cleanCellText(italic);
          if (isUsableExample(svEx) && !current.examples.some((e) => e.sv === svEx)) {
            current.examples.push({ sv: svEx, en: '' });
          }
        }
      }

      // 3. English & Thai translations inside <h4 id="Översättningar"> of THIS h3 section
      if (inTranslations) {
        const lis = el.querySelectorAll('li');
        for (const li of lis) {
          const txt = cleanCellText(li);
          if (/^engelska\s*:/i.test(txt)) {
            for (const term of parseTranslationTerms(txt)) {
              if (!current.enTerms.some((t) => t.toLowerCase() === term.toLowerCase())) {
                current.enTerms.push(term);
              }
            }
          } else if (/^thailändska\s*:/i.test(txt)) {
            for (const term of parseTranslationTerms(txt)) {
              if (!current.thTerms.includes(term)) {
                current.thTerms.push(term);
              }
            }
          }
        }
      }
    }

    return sections;
  }

  function hasTermOverlap(enTerms, defs) {
    if (!enTerms.length || !defs.length) return false;
    const defBlob = defs.map((d) => d.text.toLowerCase()).join(' ');
    return enTerms.some((t) => {
      const tl = t.toLowerCase();
      return tl.length >= 3 && defBlob.includes(tl);
    });
  }

  function buildWordSenses(enWiktData, svHtml, cleanWord) {
    const svSections = parseSvWiktionarySections(svHtml);
    const enSenses = parseEnWiktionarySenses(enWiktData, cleanWord);
    const merged = svSections.map((s) => ({
      posKey: s.posKey,
      posLabel: s.posLabel,
      forms: s.forms,
      baseForm: '',
      enTerms: s.enTerms.slice(),
      thTerms: s.thTerms.slice(),
      definitions: [],
      svExamples: s.examples.slice()
    }));

    for (const enS of enSenses) {
      let target = null;
      const samePos = merged.filter((m) => m.posKey === enS.posKey);
      if (samePos.length === 1) {
        target = samePos[0];
      } else if (samePos.length > 1) {
        target = samePos.find((m) => hasTermOverlap(m.enTerms, enS.definitions)) || samePos[0];
      } else if (enS.posKey === 'Adverb') {
        // Bridge Swedish indefinite pronouns (e.g. "allting" = Pronoun on sv.wikt, Adverb on en.wikt)
        const pron = merged.find((m) => m.posKey === 'Pronoun' && hasTermOverlap(m.enTerms, enS.definitions));
        if (pron) target = pron;
      }

      if (target) {
        target.definitions.push(...enS.definitions);
        if (!target.baseForm && enS.baseForm) target.baseForm = enS.baseForm;
      } else {
        merged.push({
          posKey: enS.posKey,
          posLabel: enS.posLabel || enS.posKey,
          forms: [],
          baseForm: enS.baseForm,
          enTerms: [],
          thTerms: [],
          definitions: enS.definitions.slice(),
          svExamples: []
        });
      }
    }

    for (const s of merged) {
      const hintParts = [];
      if (s.enTerms.length > 0) hintParts.push(...s.enTerms.slice(0, 2));
      else if (s.definitions.length > 0) hintParts.push(s.definitions[0].text.slice(0, 50));
      s.hint = hintParts.join(', ');
    }

    return merged;
  }

  function scoreSenseAgainstMeaning(sense, enMeaning, preferredPos = '') {
    let score = 0;
    const rawEn = (enMeaning || '').trim().toLowerCase();
    const tokens = extractMeaningTokens(rawEn);
    const normPref = normalizePosCategory(preferredPos);

    if (normPref && sense.posKey === normPref) {
      score += 45;
    }

    if (rawEn) {
      // Infinitive "to <verb>" or English modal/aux hints strongly indicate Verb
      if (/^to\s+[a-z]{2,}/i.test(rawEn) || tokens.some((t) => EN_MODAL_OR_AUX_VERBS.has(t))) {
        if (sense.posKey === 'Verb') score += 30;
      }

      const chunks = rawEn
        .split(/[/,;]+/)
        .map((c) => c.replace(/^to\s+/i, '').trim())
        .filter((c) => c.length >= 2);

      // 1. Score against sv.wiktionary English translations in THIS h3 section
      for (const term of sense.enTerms || []) {
        const tl = term.toLowerCase();
        if (chunks.includes(tl)) {
          score += 100;
        } else {
          for (const tok of tokens) {
            if (tl === tok) score += 60;
            else if (tok.length >= 4 && tl.includes(tok)) score += 20;
          }
        }
      }

      // 2. Score against en.wiktionary definitions in THIS sense
      for (const def of sense.definitions || []) {
        const dl = (def.text || '').toLowerCase();
        if (!dl) continue;
        const cleanDef = dl.replace(/^to\s+/, '').replace(/\([^)]*\)/g, '').trim();
        if (chunks.some((c) => cleanDef === c || cleanDef.startsWith(c + ';') || cleanDef.startsWith(c + ','))) {
          score += 90;
        } else {
          const defTokens = new Set(extractMeaningTokens(dl));
          for (const tok of tokens) {
            if (defTokens.has(tok)) score += 45;
            else if (tok.length >= 4 && dl.includes(tok)) score += 15;
          }
        }
      }
    }

    return score;
  }

  function pickBestSense(senses, enMeaning = '', preferredPos = '') {
    if (!Array.isArray(senses) || senses.length === 0) return null;
    if (senses.length === 1) return senses[0];

    let best = senses[0];
    let bestScore = -1;
    for (const s of senses) {
      const sc = scoreSenseAgainstMeaning(s, enMeaning, preferredPos);
      if (sc > bestScore) {
        bestScore = sc;
        best = s;
      }
    }

    // If no sense matched the English text directly, avoid latching onto an unrelated specialized Noun
    // when an inflected verb/baseForm sense exists (e.g. "får" -> "may/get" vs "sheep")
    if (bestScore === 0 && (enMeaning || '').trim()) {
      const inflected = senses.find((s) => s.baseForm);
      if (inflected) return inflected;
    }

    return best;
  }

  function pickExamplesForSense(sense, enMeaning = '', maxItems = 2) {
    if (!sense) return [];
    const tokens = extractMeaningTokens(enMeaning);
    const rankedDefs = (sense.definitions || [])
      .map((def, idx) => {
        const defTokens = new Set(extractMeaningTokens(def.text || ''));
        let hits = 0;
        for (const tok of tokens) {
          if (defTokens.has(tok)) hits++;
        }
        return { def, hits, idx };
      })
      .sort((a, b) => b.hits - a.hits || a.idx - b.idx);

    const out = [];
    for (const { def } of rankedDefs) {
      for (const ex of def.examples || []) {
        if (!out.some((e) => e.sv === ex.sv)) out.push({ ...ex });
        if (out.length >= maxItems) return out;
      }
    }
    for (const ex of sense.svExamples || []) {
      if (!out.some((e) => e.sv === ex.sv)) out.push({ ...ex });
      if (out.length >= maxItems) return out;
    }
    return out;
  }

  async function fetchWordSensesData(word, signal) {
    const cleanWord = stripLeadingArticle(word).toLocaleLowerCase('sv-SE');
    if (!cleanWord || cleanWord.includes(' ')) return { cleanWord: '', senses: [] };

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

    const enData = enRes.status === 'fulfilled' ? enRes.value : null;
    const svHtml = svRes.status === 'fulfilled' ? svRes.value?.parse?.text?.['*'] || '' : '';
    const senses = buildWordSenses(enData, svHtml, cleanWord);
    return { cleanWord, senses };
  }

  async function resolveBaseFormTable(sense, signal) {
    if (!sense || sense.forms.length > 0 || !sense.baseForm || (signal && signal.aborted)) return;
    try {
      const baseRes = await fetchWithTimeout(
        `https://sv.wiktionary.org/w/api.php?action=parse&page=${encodeURIComponent(sense.baseForm.toLocaleLowerCase('sv-SE'))}&prop=text&format=json&origin=*`,
        { signal, timeoutMs: 8000 }
      ).then((r) => (r.ok ? r.json() : null));
      const baseHtml = baseRes?.parse?.text?.['*'] || '';
      if (!baseHtml) return;
      const baseSections = parseSvWiktionarySections(baseHtml);
      // Strictly match the sense's own POS category!
      const matching = baseSections.find((s) => s.posKey === sense.posKey && s.forms.length > 0);
      if (matching) {
        sense.posLabel = matching.posLabel || sense.posLabel;
        sense.forms = matching.forms;
      }
    } catch (_) {}
  }

  async function fetchWiktionaryGrammar(word, { signal, enMeaning = '', preferredPos = '', cachedSenses = null } = {}) {
    const cleanWord = stripLeadingArticle(word).toLocaleLowerCase('sv-SE');
    if (!cleanWord || cleanWord.includes(' ')) return null;

    let senses = Array.isArray(cachedSenses) && cachedSenses.length > 0 ? cachedSenses : null;
    if (!senses) {
      const res = await fetchWordSensesData(cleanWord, signal);
      senses = res.senses;
    }
    if (!senses || senses.length === 0) return null;

    const chosen = pickBestSense(senses, enMeaning, preferredPos);
    if (!chosen) return null;

    // Resolve base-form conjugation table strictly for the chosen sense (and any inflected alt senses)
    await resolveBaseFormTable(chosen, signal);
    const otherInflected = senses.filter((s) => s !== chosen && s.forms.length === 0 && s.baseForm).slice(0, 2);
    if (otherInflected.length > 0 && !(signal && signal.aborted)) {
      await Promise.allSettled(otherInflected.map((s) => resolveBaseFormTable(s, signal)));
    }

    const pos = chosen.posLabel || chosen.posKey || '';
    const forms = chosen.forms || [];
    const baseForm = chosen.baseForm || '';
    if (!pos && forms.length === 0) return null;

    // Deduplicate alternative senses by posLabel for the compact switcher
    const altSenses = [];
    const seenPos = new Set();
    for (const s of senses) {
      const pLabel = s.posLabel || s.posKey;
      if (!pLabel || seenPos.has(pLabel)) continue;
      seenPos.add(pLabel);
      altSenses.push({
        pos: pLabel,
        ...(s.hint ? { hint: s.hint } : {}),
        forms: s.forms || [],
        ...(s.baseForm ? { baseForm: s.baseForm } : {})
      });
    }

    return {
      v: GRAMMAR_SCHEMA_VERSION,
      pos,
      forms,
      baseForm,
      ...(altSenses.length > 1 ? { altSenses } : {})
    };
  }

  async function loadAndRenderGrammar(item) {
    if (grammarAbortController) {
      grammarAbortController.abort();
      grammarAbortController = null;
    }

    const entryId = item.id;
    const expectedTerm = item.term;
    const expectedEn = item.en || '';
    const baseTerm = stripLeadingArticle(item.term);
    if (item.type !== 'word' || baseTerm.includes(' ')) {
      detailGrammarWrap.classList.add('hidden');
      return;
    }

    if (item.grammar && item.grammar.v >= GRAMMAR_SCHEMA_VERSION) {
      renderGrammarData(item.grammar);
      return;
    }

    if (!navigator.onLine) {
      if (item.grammar && (item.grammar.pos || item.grammar.forms?.length)) {
        renderGrammarData(item.grammar);
      } else {
        detailGrammarWrap.classList.add('hidden');
      }
      return;
    }

    detailPos.classList.add('hidden');
    if (detailPosSwitch) detailPosSwitch.classList.add('hidden');
    detailForms.textContent = '';
    detailGrammarTitle.textContent = 'Grammar & forms';
    detailGrammarStatus.textContent = 'Loading grammar...';
    detailGrammarStatus.classList.remove('hidden');
    detailGrammarWrap.classList.remove('hidden');

    // If background enrichment is already running for this exact entry, wait for it instead of duplicating requests
    if (inFlightEnrichments.has(entryId)) {
      try {
        await inFlightEnrichments.get(entryId);
      } catch (_) {}
      const refreshed = entries.find((e) => e.id === entryId);
      if (selectedEntryId === entryId && refreshed?.grammar?.v >= GRAMMAR_SCHEMA_VERSION) {
        renderTermWithArticle(detailTerm, refreshed);
        renderGrammarData(refreshed.grammar);
        return;
      }
    }

    const controller = new AbortController();
    grammarAbortController = controller;

    try {
      const lockedPos = item.grammar?.userLockedPos ? item.grammar.pos : '';
      const grammar = await fetchWiktionaryGrammar(expectedTerm, {
        signal: controller.signal,
        enMeaning: expectedEn,
        preferredPos: lockedPos
      });
      if (controller.signal.aborted) return;
      const liveItem = entries.find((e) => e.id === entryId);
      if (!liveItem || liveItem.term !== expectedTerm) return;
      if (grammar) {
        if (lockedPos) grammar.userLockedPos = true;
        liveItem.grammar = grammar;
        scheduleSave(300);
        // Refresh list & detail heading in case Noun (en)/(ett) was just discovered or corrected
        if (selectedEntryId === entryId) {
          renderTermWithArticle(detailTerm, liveItem);
        }
        render();
      }
      if (selectedEntryId === entryId) {
        renderGrammarData(grammar || liveItem.grammar);
      }
    } catch (_) {
      if (!controller.signal.aborted && selectedEntryId === entryId) {
        const liveItem = entries.find((e) => e.id === entryId);
        if (liveItem?.grammar) renderGrammarData(liveItem.grammar);
        else detailGrammarWrap.classList.add('hidden');
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
    if (exampleAbortController) {
      exampleAbortController.abort();
      exampleAbortController = null;
    }
    hideDetailThaiSuggest();
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
    markEntriesMutated();
    saveEntries();
    closeDetail();
    render();
    showUndoToast(deletedItem);
  });

  // Duplicate detection helper (preserves Swedish å, ä, ö and supports distinct homograph meanings)
  function findDuplicate(term, excludeId = null) {
    const key = getCanonicalKey(term);
    if (!key) return null;
    return (
      entries.find((e) => e.id !== excludeId && getCanonicalKey(e.term) === key) || null
    );
  }

  function areSameMeaning(a, b) {
    const aEn = extractMeaningTokens(a.en || '');
    const bEn = extractMeaningTokens(b.en || '');
    if (aEn.length > 0 && bEn.length > 0) {
      const bSet = new Set(bEn);
      return aEn.some((t) => bSet.has(t));
    }
    const aTh = normalizeThaiForSearch(a.th || '');
    const bTh = normalizeThaiForSearch(b.th || '');
    if (aTh && bTh) return aTh === bTh || aTh.includes(bTh) || bTh.includes(aTh);
    return true;
  }

  function updateDuplicateNotice() {
    const dup = findDuplicate(termInput.value, editingEntryId);
    duplicateEntryRef = dup;
    if (dup) {
      const shortMeaning = (dup.en || dup.th || '').trim();
      const meaningHint = shortMeaning ? ` (${shortMeaning.slice(0, 28)})` : '';
      const typedEn = enInput.value.trim();
      const isDifferentMeaning =
        Boolean(typedEn && dup.en) && !areSameMeaning({ en: typedEn, th: thInput.value.trim() }, dup);
      duplicateText.textContent = isDifferentMeaning
        ? `"${dup.term}"${meaningHint} exists — Save adds another meaning.`
        : `"${dup.term}"${meaningHint} is already in ${dup.type === 'phrase' ? 'Phrases' : 'Words'}.`;
      duplicateNotice.classList.remove('hidden');
    } else {
      duplicateNotice.classList.add('hidden');
    }
  }

  editDuplicateBtn.addEventListener('click', () => {
    if (!duplicateEntryRef) return;
    openForm(duplicateEntryRef, { source: 'duplicate_notice' });
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
    if (exampleChipTranslateController) {
      exampleChipTranslateController.abort();
      exampleChipTranslateController = null;
    }
    svSuggestions.textContent = '';
    svSuggestions.classList.add('hidden');
    enSuggestions.textContent = '';
    enSuggestions.classList.add('hidden');
    if (thPosFilter) {
      thPosFilter.textContent = '';
      thPosFilter.classList.add('hidden');
    }
    thSuggestions.textContent = '';
    thSuggestions.classList.add('hidden');
    exampleSuggestions.textContent = '';
    exampleSuggestions.classList.add('hidden');
    baseFormNotice.classList.add('hidden');
    suggestedBaseForm = '';
    pendingExampleEn = '';
    formWiktSenses = [];
    formWiktTerm = '';
    selectedFormPos = '';
    currentThaiPosGroups = [];
    activeThaiPos = '';
  }

  function openForm(
    existingItem = null,
    { prefillTerm = '', prefillType = null, autoSuggest = false, source = '' } = {}
  ) {
    if (!lastFocusedEl) lastFocusedEl = document.activeElement;
    if (translateAbortController) {
      translateAbortController.abort();
      translateAbortController = null;
    }
    if (wiktFormAbortController) {
      wiktFormAbortController.abort();
      wiktFormAbortController = null;
    }
    if (exampleChipTranslateController) {
      exampleChipTranslateController.abort();
      exampleChipTranslateController = null;
    }
    clearTimeout(enSyncDebounceTimer);
    translateReqId++;
    formSavedThisSession = false;
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
      pendingExampleEn = existingItem.exampleEn || '';
    } else {
      editingEntryId = null;
      const defaultType = prefillType || (activeTab === 'phrase' ? 'phrase' : 'word');
      setFormType(defaultType);
      termInput.value = prefillTerm || '';
      enInput.value = '';
      thInput.value = '';
      exampleInput.value = '';
    }

    telemetry?.trackFormOpen(source || (existingItem ? 'edit' : 'fab'));

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

  function closeForm({ fromPopstate = false, saved = false } = {}) {
    if (translateAbortController) {
      translateAbortController.abort();
      translateAbortController = null;
    }
    if (wiktFormAbortController) {
      wiktFormAbortController.abort();
      wiktFormAbortController = null;
    }
    if (exampleChipTranslateController) {
      exampleChipTranslateController.abort();
      exampleChipTranslateController = null;
    }
    clearTimeout(enSyncDebounceTimer);
    translateReqId++;
    if (!formSavedThisSession) {
      telemetry?.trackFormClose({
        saved: Boolean(saved),
        hasTerm: Boolean(termInput.value.trim()),
        hasEn: Boolean(enInput.value.trim()),
        hasTh: Boolean(thInput.value.trim())
      });
      formSavedThisSession = true;
    }
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

  addBtn.addEventListener('click', () => openForm(null, { source: 'fab' }));
  cancelFormBtn.addEventListener('click', () => closeForm());
  formBackdrop.addEventListener('click', (e) => {
    if (e.target === formBackdrop) closeForm();
  });

  // Enter in termInput runs Suggest when translations are empty;
  // Enter in enInput / thInput runs reverse Suggest when termInput is empty.
  let suppressSubmitUntil = 0;
  const saveFormBtn = document.getElementById('saveFormBtn');
  saveFormBtn.addEventListener('click', () => {
    suppressSubmitUntil = 0;
  });

  function handleFieldEnter(e) {
    if (e.key !== 'Enter' && e.keyCode !== 13) return;
    const hasTerm = Boolean(termInput.value.trim());
    const hasTranslation = Boolean(enInput.value.trim() || thInput.value.trim());
    if (!hasTerm || !hasTranslation) {
      e.preventDefault();
      e.stopPropagation();
      suppressSubmitUntil = Date.now() + 300;
      if (e.type === 'keydown' && !suggestBtn.disabled && (hasTerm || hasTranslation)) {
        suggestBtn.click();
      }
    }
  }
  [termInput, enInput, thInput].forEach((inputEl) => {
    inputEl.addEventListener('keydown', handleFieldEnter);
    inputEl.addEventListener('keypress', handleFieldEnter);
    inputEl.addEventListener('input', () => formError.classList.add('hidden'));
  });

  exampleInput.addEventListener('input', () => {
    pendingExampleEn = '';
    exampleSuggestions.querySelectorAll('.en-chip').forEach((c) => c.classList.remove('active'));
  });

  function enrichEntryInBackground(
    entryId,
    expectedTerm,
    expectedExample,
    { enMeaning = '', preferredPos = '', cachedSenses = null } = {}
  ) {
    if (!entryId || !navigator.onLine) return Promise.resolve();
    if (inFlightEnrichments.has(entryId)) return inFlightEnrichments.get(entryId);

    const run = (async () => {
      const initial = entries.find((e) => e.id === entryId);
      if (!initial || initial.term !== expectedTerm) return;

      let fetchedGrammar = null;
      let fetchedExampleEn = '';
      const tasks = [];

      const baseTerm = stripLeadingArticle(initial.term);
      if (
        initial.type === 'word' &&
        baseTerm &&
        !baseTerm.includes(' ') &&
        (!initial.grammar || initial.grammar.v < GRAMMAR_SCHEMA_VERSION)
      ) {
        tasks.push(
          fetchWiktionaryGrammar(initial.term, {
            enMeaning: enMeaning || initial.en || '',
            preferredPos,
            cachedSenses
          })
            .then((grammar) => {
              if (grammar) fetchedGrammar = grammar;
            })
            .catch(() => {})
        );
      }

      if (expectedExample && !initial.exampleEn) {
        tasks.push(
          translateWithDict(expectedExample, 'sv', 'en')
            .then((res) => {
              if (res?.primary) fetchedExampleEn = res.primary;
            })
            .catch(() => {})
        );
      }

      if (tasks.length === 0) return;
      await Promise.allSettled(tasks);

      // Re-resolve live entry by ID to prevent mutating deleted or edited stale objects
      const liveEntry = entries.find((e) => e.id === entryId);
      if (!liveEntry) return;

      let changed = false;
      if (fetchedGrammar && liveEntry.term === expectedTerm && liveEntry.type === 'word') {
        liveEntry.grammar = fetchedGrammar;
        changed = true;
      }
      if (fetchedExampleEn && (liveEntry.example || '').trim() === expectedExample && !liveEntry.exampleEn) {
        liveEntry.exampleEn = fetchedExampleEn;
        invalidateEntryIndex(liveEntry);
        changed = true;
      }

      if (changed) {
        scheduleSave(300);
        if (selectedEntryId === entryId) {
          renderTermWithArticle(detailTerm, liveEntry);
          if (liveEntry.exampleEn) {
            detailExampleEn.textContent = liveEntry.exampleEn;
            detailExampleEn.classList.remove('hidden');
          }
          if (liveEntry.grammar) renderGrammarData(liveEntry.grammar);
        }
        render();
      }
    })().finally(() => {
      if (inFlightEnrichments.get(entryId) === run) {
        inFlightEnrichments.delete(entryId);
      }
    });

    inFlightEnrichments.set(entryId, run);
    return run;
  }

  termInput.addEventListener('input', () => {
    svSuggestions.querySelectorAll('.en-chip').forEach((c) => c.classList.remove('active'));
    if (getCanonicalKey(termInput.value) !== formWiktTerm) {
      formWiktSenses = [];
      formWiktTerm = '';
      selectedFormPos = '';
    }
    updateDuplicateNotice();
    const wordCount = termInput.value.trim().split(/\s+/).filter(Boolean).length;
    if (!editingEntryId && formType === 'word' && wordCount >= 3) {
      setFormType('phrase');
    }
  });

  entryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (Date.now() < suppressSubmitUntil) return;
    const term = termInput.value.trim();
    const en = enInput.value.trim();
    const th = thInput.value.trim();
    const example = exampleInput.value.trim();

    if (!term || (!en && !th)) {
      formError.classList.remove('hidden');
      return;
    }

    const isNewEntry = !editingEntryId;
    const chosenPosForSave = selectedFormPos;
    const cachedSensesForSave =
      formWiktTerm && formWiktTerm === getCanonicalKey(term) && formWiktSenses.length > 0
        ? formWiktSenses.slice()
        : null;
    let savedEntry = null;

    if (editingEntryId) {
      entries = entries.map((item) => {
        if (item.id !== editingEntryId) return item;
        const termChanged =
          item.term.trim().toLocaleLowerCase('sv-SE') !== term.toLocaleLowerCase('sv-SE');
        const enChanged = (item.en || '').trim().toLowerCase() !== en.toLowerCase();
        const exampleChanged = (item.example || '').trim() !== example;
        const clearGrammar =
          termChanged || formType !== 'word' || (enChanged && !item.grammar?.userLockedPos);
        savedEntry = {
          ...item,
          type: formType,
          term,
          en,
          th,
          example,
          exampleEn: example ? (exampleChanged ? pendingExampleEn : item.exampleEn || pendingExampleEn) : '',
          grammar: clearGrammar ? undefined : item.grammar
        };
        return savedEntry;
      });
    } else {
      const id = generateEntryId();
      savedEntry = {
        id,
        type: formType,
        term,
        en,
        th,
        example,
        exampleEn: example ? pendingExampleEn : ''
      };
      entries.push(savedEntry);
    }

    markEntriesMutated();
    saveEntries();

    if (isNewEntry && searchQuery.trim()) {
      clearTimeout(searchDebounceTimer);
      searchInput.value = '';
      searchQuery = '';
      lastLoggedZeroSearchKey = '';
      clearSearchBtn.classList.add('hidden');
    }

    if (activeTab !== 'practice' && activeTab !== formType) {
      activeTab = formType;
      tabs.forEach((t) => {
        const active = t.dataset.tab === activeTab;
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', String(active));
      });
    } else if (isNewEntry && activeTab === 'practice') {
      activeTab = formType;
      tabs.forEach((t) => {
        const active = t.dataset.tab === activeTab;
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', String(active));
      });
    }

    closeForm({ saved: true });
    render();
    if (savedEntry) {
      enrichEntryInBackground(savedEntry.id, savedEntry.term, savedEntry.example || '', {
        enMeaning: savedEntry.en,
        preferredPos: chosenPosForSave,
        cachedSenses: cachedSensesForSave
      });
    }
  });

  // Settings & Backup Sheet
  function updateAnalyticsSummaryUI() {
    if (!analyticsStats) return;
    if (!telemetry) {
      analyticsStats.textContent = 'Local analytics unavailable.';
      return;
    }
    const s = telemetry.getSummary();
    const parts = [`${s.sessions} ${s.sessions === 1 ? 'session' : 'sessions'}`];
    if (s.avgSessionSec > 0) {
      parts.push(`avg ${s.avgSessionSec}s`);
    }
    if (s.totalRated > 0 && s.accuracyPct !== null) {
      parts.push(`${s.accuracyPct}% recall (${s.totalRated} cards)`);
    }
    if (s.hardestPos) {
      parts.push(`hardest: ${s.hardestPos.pos} (${s.hardestPos.errorRatePct}% again)`);
    }
    if (s.swCacheHitRatePct !== null) {
      parts.push(`cache ${s.swCacheHitRatePct}%`);
    }
    analyticsStats.textContent = parts.join(' · ');
  }

  function updateSettingsUI() {
    const hasSamples = entries.some((e) => SAMPLE_ID_SET.has(e.id));
    if (hasSamples) {
      sampleWordsTitle.textContent = 'Remove sample words';
      sampleWordsSub.textContent = 'Remove built-in starter words (keeps all your own)';
    } else {
      sampleWordsTitle.textContent = 'Add sample words';
      sampleWordsSub.textContent = 'Add starter Swedish words & phrases';
    }
    updateAnalyticsSummaryUI();
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

  async function shareOrDownloadFile(content, filename, mimeType, shareTitle, toastMessage) {
    try {
      const file = new File([content], filename, { type: mimeType });
      if (
        typeof navigator.share === 'function' &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({ title: shareTitle, files: [file] });
        showToast(toastMessage);
        return;
      }
    } catch (err) {
      if (err && err.name === 'AbortError') return;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast(toastMessage);
  }

  exportBtn.addEventListener('click', async () => {
    const payload = {
      app: 'Swedish Words',
      version: 1,
      exportedAt: new Date().toISOString(),
      entries: entries.map(compactEntryForStorage)
    };
    const json = JSON.stringify(payload, null, 2);
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `swedish-words-backup-${dateStr}.json`;
    await shareOrDownloadFile(
      json,
      filename,
      'application/json',
      'Swedish Words Backup',
      `Exported ${entries.length} items`
    );
  });

  exportTelemetryJsonBtn?.addEventListener('click', async () => {
    if (!telemetry) return;
    const dateStr = new Date().toISOString().slice(0, 10);
    await shareOrDownloadFile(
      telemetry.exportJSON(),
      `swedish-words-analytics-${dateStr}.json`,
      'application/json',
      'Swedish Words Analytics (JSON)',
      'Exported local analytics (JSON)'
    );
  });

  exportTelemetryCsvBtn?.addEventListener('click', async () => {
    if (!telemetry) return;
    const dateStr = new Date().toISOString().slice(0, 10);
    await shareOrDownloadFile(
      telemetry.exportCSV(),
      `swedish-words-analytics-${dateStr}.csv`,
      'text/csv;charset=utf-8',
      'Swedish Words Analytics (CSV)',
      'Exported local analytics (CSV)'
    );
  });

  clearTelemetryBtn?.addEventListener('click', () => {
    if (!telemetry) return;
    telemetry.clear();
    updateAnalyticsSummaryUI();
    showToast('Local analytics cleared');
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

      const existingByKey = new Map();
      for (const e of entries) {
        const k = getCanonicalKey(e.term);
        if (!existingByKey.has(k)) existingByKey.set(k, []);
        existingByKey.get(k).push(e);
      }
      const usedIds = new Set(entries.map((e) => e.id));
      let added = 0;
      for (const raw of list) {
        const clean = sanitizeEntry(raw, usedIds);
        if (!clean) continue;
        const key = getCanonicalKey(clean.term);
        const sameTermList = existingByKey.get(key) || [];
        // Preserve homographs (same Swedish word with a clearly different English/Thai meaning)
        if (sameTermList.some((existing) => areSameMeaning(existing, clean))) continue;

        entries.push(clean);
        if (!existingByKey.has(key)) existingByKey.set(key, []);
        existingByKey.get(key).push(clean);
        added++;
      }

      if (added > 0) {
        markEntriesMutated();
        saveEntries();
        render();
      }
      updateSettingsUI();
      closeSettings();
      showToast(added > 0 ? `Imported ${added} new ${added === 1 ? 'item' : 'items'}` : 'All items already in your list');
    } catch (_) {
      showToast('Could not read backup file');
    }
  });

  // Back button, Escape & Practice keyboard shortcuts
  window.addEventListener('popstate', () => {
    if (ignoringProgrammaticPop) {
      ignoringProgrammaticPop = false;
      clearTimeout(ignorePopResetTimer);
      return;
    }
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
      return;
    }

    if (activeTab !== 'practice' || isAnySheetOpen() || practiceQueue.length === 0) return;
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    if (!practiceRevealed && (e.key === ' ' || e.key === 'Enter')) {
      if (document.activeElement === flashcard || document.activeElement === revealAnswerBtn) return;
      e.preventDefault();
      revealPracticeCard();
    } else if (practiceRevealed) {
      if (e.key === '1' || e.key === 'ArrowLeft') {
        e.preventDefault();
        ratePracticeCard(false);
      } else if (e.key === '2' || e.key === 'ArrowRight') {
        e.preventDefault();
        ratePracticeCard(true);
      }
    }
  });

  // Swipe-to-dismiss on all bottom sheets (with Samsung pull-to-refresh prevention & re-entrancy guard)
  function enableSheetSwipeDismiss(backdrop, sheet, onClose) {
    let startY = 0;
    let startTime = 0;
    let currentY = 0;
    let tracking = false;
    let dragging = false;
    let activeMode = null;
    let dismissTimer = null;

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
      sheet.classList.remove('dragging');

      const elapsed = Math.max(1, Date.now() - startTime);
      const velocity = currentY / elapsed;
      if (currentY > 90 || (velocity > 0.45 && currentY > 30)) {
        sheet.style.transition = 'transform 0.16s ease-out';
        sheet.style.transform = 'translateY(100%)';
        backdrop.style.background = 'rgba(17, 24, 39, 0)';
        clearTimeout(dismissTimer);
        dismissTimer = setTimeout(() => {
          dismissTimer = null;
          if (!backdrop.classList.contains('hidden')) {
            onClose();
          }
        }, 150);
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
        clearTimeout(dismissTimer);
        dismissTimer = null;
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
          sheet.classList.add('dragging');
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

      clearTimeout(dismissTimer);
      dismissTimer = null;
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
        sheet.classList.add('dragging');
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
            const backList = Array.isArray(entry?.[1])
              ? entry[1].map((b) => String(b || '').trim()).filter(Boolean)
              : [];
            const back = backList.slice(0, 2).join(', ');
            if (word) dictEntries.push({ text: word, pos, back, backList });
          }
        } else if (Array.isArray(posBlock?.[1])) {
          for (const word of posBlock[1]) {
            if (word) dictEntries.push({ text: String(word).trim(), pos, back: '', backList: [] });
          }
        }
      }
    }

    return { primary, dictEntries };
  }

  function isSuspiciousSingleCharTranslation(sourceText, translated, toLang) {
    if (!translated) return true;
    const srcLen = (sourceText || '').trim().length;
    if (srcLen >= 3 && translated.length === 1 && toLang !== 'th') {
      return true;
    }
    return false;
  }

  async function fetchMyMemoryFallback(text, fromLang, toLang, signal) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`;
    const res = await fetchWithTimeout(url, { signal, timeoutMs: 8000 });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    let primary = (data?.responseData?.translatedText || '').trim();
    if (primary.toUpperCase().includes('MYMEMORY WARNING') || isSuspiciousSingleCharTranslation(text, primary, toLang)) {
      primary = '';
    }
    // Check secondary MyMemory matches if primary was empty or single-char garbage
    if (!primary && Array.isArray(data?.matches)) {
      const good = data.matches.find((m) => {
        const t = (m?.translation || '').trim();
        return (
          t &&
          !t.toUpperCase().includes('MYMEMORY WARNING') &&
          !isSuspiciousSingleCharTranslation(text, t, toLang) &&
          t.toLowerCase() !== text.trim().toLowerCase()
        );
      });
      if (good) primary = good.translation.trim();
    }
    if (!primary) {
      throw new Error('No translation');
    }
    return { primary, dictEntries: [] };
  }

  async function translateWithDict(text, fromLang, toLang, signal) {
    try {
      const res = await fetchGoogleDict(text, fromLang, toLang, signal);
      return { ...res, provider: 'google' };
    } catch (err) {
      if (signal && signal.aborted) throw err;
      const res = await fetchMyMemoryFallback(text, fromLang, toLang, signal);
      return { ...res, provider: 'mymemory' };
    }
  }

  function buildCandidateList(result, sourceText, maxItems = 5, { preferredPos = '', priorityTerms = [] } = {}) {
    const seen = new Set();
    const list = [];
    const normPref = normalizePosCategory(preferredPos);

    const add = (text, hint = '', posKey = '') => {
      if (!text) return;
      const cleaned = text.trim();
      if (!cleaned) return;
      const key = cleaned.toLowerCase();
      if (key === sourceText.trim().toLowerCase() || seen.has(key)) return;
      seen.add(key);
      list.push({ text: cleaned, hint, posKey });
    };

    // 1. Optional Wiktionary sense-specific terms (e.g. Thai translations in matched h3 section)
    for (const term of priorityTerms) {
      add(term, 'Wiktionary', normPref);
      if (list.length >= maxItems) return list.slice(0, maxItems);
    }

    // 2. If preferredPos is given, prioritize Google dict entries with matching POS
    const dictEntries = Array.isArray(result.dictEntries) ? result.dictEntries : [];
    const matchingPosEntries = normPref
      ? dictEntries.filter((d) => normalizePosCategory(d.pos) === normPref)
      : [];

    if (matchingPosEntries.length > 0) {
      // Keep primary first only if it doesn't belong exclusively to a different POS
      const primaryKey = (result.primary || '').trim().toLowerCase();
      const primaryInWrongPos =
        primaryKey &&
        !matchingPosEntries.some((d) => d.text.toLowerCase() === primaryKey) &&
        dictEntries.some((d) => d.text.toLowerCase() === primaryKey);
      if (!primaryInWrongPos) {
        add(result.primary, '', normPref);
      }
      for (const item of matchingPosEntries) {
        const hint = item.back || shortPosLabel(normPref) || item.pos || '';
        add(item.text, hint, normPref);
        if (list.length >= maxItems) break;
      }
    } else {
      add(result.primary);
    }

    // 3. Fill remaining slots with diverse POS entries so homographs surface all key meanings
    if (list.length < maxItems) {
      const seenPosInDict = new Set(list.map((x) => x.posKey).filter(Boolean));
      for (const item of dictEntries) {
        const pk = normalizePosCategory(item.pos);
        if (pk && !seenPosInDict.has(pk)) {
          seenPosInDict.add(pk);
          const hint = item.back || shortPosLabel(pk) || item.pos || '';
          add(item.text, hint, pk);
          if (list.length >= maxItems) break;
        }
      }
    }

    if (list.length < maxItems) {
      for (const item of dictEntries) {
        const pk = normalizePosCategory(item.pos);
        const hint = item.back || shortPosLabel(pk) || item.pos || '';
        add(item.text, hint, pk);
        if (list.length >= maxItems) break;
      }
    }

    if (list.length === 0 && result.primary) {
      list.push({ text: result.primary, hint: '', posKey: normPref });
    }
    return list.slice(0, maxItems);
  }

  function buildEnglishCandidates(result, svText, senses = [], maxItems = 6) {
    const dictEntries = Array.isArray(result.dictEntries) ? result.dictEntries : [];
    const seen = new Set();
    const list = [];

    const inferPosForEn = (enWord, googlePosRaw) => {
      if (senses.length > 0) {
        const best = pickBestSense(senses, enWord, '');
        if (best && scoreSenseAgainstMeaning(best, enWord, '') >= 45) {
          return best.posKey;
        }
      }
      return normalizePosCategory(googlePosRaw);
    };

    const add = (text, googlePosRaw = '') => {
      if (!text) return;
      const cleaned = text.trim();
      if (!cleaned) return;
      const key = cleaned.toLowerCase();
      if (key === svText.trim().toLowerCase() || seen.has(key)) return;
      seen.add(key);
      const posKey = inferPosForEn(cleaned, googlePosRaw);
      list.push({ text: cleaned, posKey, posShort: shortPosLabel(posKey) });
    };

    const primaryDictMatch = dictEntries.find(
      (d) => d.text.toLowerCase() === (result.primary || '').trim().toLowerCase()
    );
    const isWeakFallback = result.provider === 'mymemory' || result.provider === 'wiktionary';

    // When machine translation fell back to MyMemory (no dictionary), prioritize verified Wiktionary sense translations first!
    if (isWeakFallback && senses.length > 0) {
      for (const s of senses) {
        for (const t of (s.enTerms || []).slice(0, 2)) {
          add(t, s.posKey);
          if (list.length >= maxItems) break;
        }
        if (list.length >= maxItems) break;
      }
    }

    if (!isSuspiciousSingleCharTranslation(svText, result.primary, 'en')) {
      add(result.primary, primaryDictMatch?.pos || '');
    }

    // First pass: ensure at least one top candidate from EACH distinct POS block (e.g. short (adj) + card (noun))
    const representedPos = new Set(list.map((c) => c.posKey).filter(Boolean));
    for (const item of dictEntries) {
      const pk = inferPosForEn(item.text, item.pos);
      if (pk && !representedPos.has(pk)) {
        representedPos.add(pk);
        add(item.text, item.pos);
        if (list.length >= maxItems) break;
      }
    }

    // Second pass: add Wiktionary sense translations if Google Translate missed an important POS
    if (list.length < maxItems && senses.length > 1) {
      for (const s of senses) {
        if (s.posKey && !representedPos.has(s.posKey) && s.enTerms && s.enTerms.length > 0) {
          representedPos.add(s.posKey);
          add(s.enTerms[0], s.posKey);
          if (list.length >= maxItems) break;
        }
      }
    }

    // Third pass: fill remaining slots in Google's relevance order
    for (const item of dictEntries) {
      if (list.length >= maxItems) break;
      add(item.text, item.pos);
    }

    if (list.length === 0 && result.primary) {
      const pk = inferPosForEn(result.primary, '');
      list.push({ text: result.primary, posKey: pk, posShort: shortPosLabel(pk) });
    }
    return list.slice(0, maxItems);
  }

  function renderSwedishChips(candidates) {
    svSuggestions.textContent = '';
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
        fetchWiktionaryFormSuggestions(cand.text, enInput.value.trim(), selectedFormPos);
      });
      svSuggestions.appendChild(btn);
    });
    svSuggestions.classList.remove('hidden');
  }

  function displayPosPillLabel(posKey) {
    const map = {
      Noun: 'Noun',
      Verb: 'Verb',
      Adjective: 'Adj',
      Adverb: 'Adv',
      Pronoun: 'Pron',
      Preposition: 'Prep',
      Conjunction: 'Conj',
      Interjection: 'Interj',
      Numeral: 'Num'
    };
    return map[posKey] || posKey;
  }

  // Group Thai dictionary entries by POS and rank exact back-translation matches first
  function buildThaiPosGroups(result, enText, { preferredPos = '', wiktThTerms = [] } = {}) {
    const srcLower = (enText || '').trim().toLowerCase().replace(/^to\s+/i, '');
    const primaryText = (result?.primary || '').trim();
    const normPref = normalizePosCategory(preferredPos);
    const dictEntries = Array.isArray(result?.dictEntries) ? result.dictEntries : [];

    const byPos = new Map();
    dictEntries.forEach((item, idx) => {
      const pk = normalizePosCategory(item.pos) || 'Other';
      if (!byPos.has(pk)) byPos.set(pk, []);
      const backList = Array.isArray(item.backList) ? item.backList : [];
      const firstBack = (backList[0] || '').toLowerCase();
      let score = 0;
      if (srcLower && firstBack === srcLower) score += 100;
      else if (srcLower && backList.some((b) => b.toLowerCase() === srcLower)) score += 50;
      if (primaryText && item.text.toLowerCase() === primaryText.toLowerCase()) score += 25;
      score -= idx * 0.01;
      byPos.get(pk).push({
        text: item.text,
        hint: item.back || '',
        posKey: pk,
        score
      });
    });

    const groups = [];
    for (const [posKey, items] of byPos.entries()) {
      items.sort((a, b) => b.score - a.score);
      const seen = new Set();
      const candidates = [];

      if (posKey === normPref && Array.isArray(wiktThTerms)) {
        for (const t of wiktThTerms) {
          const clean = (t || '').trim();
          if (clean && !seen.has(clean.toLowerCase())) {
            seen.add(clean.toLowerCase());
            candidates.push({ text: clean, hint: 'Wiktionary', posKey });
          }
        }
      }

      for (const it of items) {
        const key = it.text.toLowerCase();
        if (key === srcLower || seen.has(key)) continue;
        seen.add(key);
        candidates.push({ text: it.text, hint: it.hint, posKey });
        if (candidates.length >= 5) break;
      }

      if (candidates.length > 0) {
        groups.push({ posKey, label: displayPosPillLabel(posKey), candidates });
      }
    }

    // Fallback for phrases / MyMemory / single-primary responses with no POS dict blocks
    if (groups.length === 0) {
      const flat = buildCandidateList(result, enText, 5, {
        preferredPos: normPref,
        priorityTerms: wiktThTerms
      });
      if (flat.length > 0) {
        groups.push({ posKey: normPref || 'All', label: displayPosPillLabel(normPref || 'All'), candidates: flat });
      }
    }

    // Pick initial active POS: explicit preferredPos -> POS containing primary -> first group
    let activePos = '';
    if (normPref && groups.some((g) => g.posKey === normPref)) {
      activePos = normPref;
    } else if (primaryText) {
      const primaryGroup = groups.find((g) =>
        g.candidates.some((c) => c.text.toLowerCase() === primaryText.toLowerCase())
      );
      activePos = primaryGroup ? primaryGroup.posKey : groups[0]?.posKey || '';
    } else {
      activePos = groups[0]?.posKey || '';
    }

    // Ensure preferred/active group appears first if user has a clear POS context
    if (activePos && groups.length > 1) {
      groups.sort((a, b) => (a.posKey === activePos ? -1 : b.posKey === activePos ? 1 : 0));
    }

    return { groups, activePos };
  }

  function renderThaiPosFilter(groups, activePos) {
    if (!thPosFilter) return;
    thPosFilter.textContent = '';
    if (!Array.isArray(groups) || groups.length <= 1) {
      thPosFilter.classList.add('hidden');
      return;
    }

    for (const group of groups) {
      const btn = document.createElement('button');
      btn.type = 'button';
      const isActive = group.posKey === activePos;
      btn.className = 'th-pos-pill' + (isActive ? ' active' : '');
      btn.textContent = group.label;
      btn.setAttribute('aria-pressed', String(isActive));
      btn.addEventListener('click', () => {
        if (activeThaiPos === group.posKey) return;
        activeThaiPos = group.posKey;
        if (group.posKey && group.posKey !== 'Other' && group.posKey !== 'All') {
          selectedFormPos = group.posKey;
          applyMatchedFormWiktHints(enInput.value.trim(), selectedFormPos);
        }
        renderThaiPosFilter(currentThaiPosGroups, activeThaiPos);
        if (group.candidates.length > 0) {
          thInput.value = group.candidates[0].text;
          renderThaiChips(group.candidates);
        }
      });
      thPosFilter.appendChild(btn);
    }
    thPosFilter.classList.remove('hidden');
  }

  function renderThaiChips(candidates) {
    thSuggestions.textContent = '';
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
    if (exampleChipTranslateController) {
      exampleChipTranslateController.abort();
      exampleChipTranslateController = null;
    }
    exampleSuggestions.textContent = '';
    if (!examples || examples.length === 0) {
      exampleSuggestions.classList.add('hidden');
      return;
    }

    const toTranslate = [];
    for (const ex of examples) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'en-chip example-chip';
      btn.textContent = ex.en ? `Use: "${ex.sv}" (${ex.en})` : `Use: "${ex.sv}"`;
      btn.addEventListener('click', () => {
        exampleInput.value = ex.sv;
        pendingExampleEn = ex.en || '';
        exampleSuggestions.querySelectorAll('.en-chip').forEach((c) => c.classList.remove('active'));
        btn.classList.add('active');
      });
      exampleSuggestions.appendChild(btn);
      if (!ex.en && navigator.onLine) {
        toTranslate.push({ ex, btn });
      }
    }
    exampleSuggestions.classList.remove('hidden');

    // Translate Swedish-only Wiktionary examples in the background so English context shows right on the chip
    if (toTranslate.length > 0) {
      const ctrl = new AbortController();
      exampleChipTranslateController = ctrl;
      Promise.allSettled(
        toTranslate.map(async ({ ex, btn }) => {
          const res = await translateWithDict(ex.sv, 'sv', 'en', ctrl.signal);
          if (ctrl.signal.aborted || !res?.primary || !document.contains(btn)) return;
          ex.en = res.primary;
          btn.textContent = `Use: "${ex.sv}" (${ex.en})`;
          if (btn.classList.contains('active') && exampleInput.value.trim() === ex.sv) {
            pendingExampleEn = ex.en;
          }
        })
      ).finally(() => {
        if (exampleChipTranslateController === ctrl) exampleChipTranslateController = null;
      });
    }
  }

  function startTranslateRequest() {
    if (translateAbortController) {
      translateAbortController.abort();
    }
    translateAbortController = new AbortController();
    translateReqId++;
    return { reqId: translateReqId, signal: translateAbortController.signal };
  }

  async function translateThaiFromEnglish(enText, existingReq = null, preferredPos = '') {
    if (!enText) return;
    const { reqId, signal } = existingReq || startTranslateRequest();

    retranslateThBtn.disabled = true;
    currentThaiPosGroups = [];
    activeThaiPos = '';
    if (thPosFilter) {
      thPosFilter.textContent = '';
      thPosFilter.classList.add('hidden');
    }
    thSuggestions.textContent = '';
    thSuggestions.classList.add('hidden');
    translateStatus.textContent = `Translating "${enText}" to Thai...`;
    translateStatus.classList.remove('error', 'hidden');
    try {
      const result = await translateWithDict(enText, 'en', 'th', signal);
      if (reqId !== translateReqId || signal.aborted) return;

      // Boost Thai terms from matched sv.wiktionary sense (if available) + matching POS from Google dict
      let wiktThTerms = [];
      let effectivePos = preferredPos;
      if (formWiktSenses.length > 0) {
        const matched = pickBestSense(formWiktSenses, enText, preferredPos);
        if (matched) {
          if (!effectivePos && matched.posKey) effectivePos = matched.posKey;
          if (matched.thTerms && matched.thTerms.length > 0) {
            wiktThTerms = matched.thTerms.slice(0, 2);
          }
        }
      }

      const { groups, activePos } = buildThaiPosGroups(result, enText, {
        preferredPos: effectivePos,
        wiktThTerms
      });
      currentThaiPosGroups = groups;
      activeThaiPos = activePos;

      const activeGroup = groups.find((g) => g.posKey === activePos) || groups[0];
      const candidates = activeGroup ? activeGroup.candidates : [];

      if (candidates.length > 0) {
        thInput.value = candidates[0].text;
        renderThaiPosFilter(groups, activePos);
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

  function applyMatchedFormWiktHints(enMeaning = '', preferredPos = '') {
    if (!formWiktSenses.length || formBackdrop.classList.contains('hidden')) return;
    const sense = pickBestSense(formWiktSenses, enMeaning, preferredPos);
    if (!sense) return;

    if (sense.baseForm) {
      suggestedBaseForm = sense.baseForm;
      useBaseFormBtn.textContent = sense.baseForm;
      baseFormNotice.classList.remove('hidden');
    } else {
      suggestedBaseForm = '';
      baseFormNotice.classList.add('hidden');
    }

    if (!exampleInput.value.trim()) {
      const senseExamples = pickExamplesForSense(sense, enMeaning, 2);
      renderExampleSuggestions(senseExamples);
    }
  }

  function renderEnglishChips(candidates) {
    enSuggestions.textContent = '';
    if (candidates.length === 0) {
      enSuggestions.classList.add('hidden');
      return;
    }
    const distinctPosCount = new Set(candidates.map((c) => c.posKey).filter(Boolean)).size;
    const showPosHints = distinctPosCount > 1;

    candidates.forEach((cand, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'en-chip' + (idx === 0 ? ' active' : '');
      btn.dataset.enText = cand.text;
      btn.dataset.posKey = cand.posKey || '';
      btn.textContent = cand.text;
      if (showPosHints && cand.posShort) {
        const hintSpan = document.createElement('span');
        hintSpan.className = 'chip-hint';
        hintSpan.textContent = `(${cand.posShort})`;
        btn.appendChild(hintSpan);
      }
      btn.addEventListener('click', () => {
        enSuggestions.querySelectorAll('.en-chip').forEach((c) => c.classList.remove('active'));
        btn.classList.add('active');
        enInput.value = cand.text;
        selectedFormPos = cand.posKey || '';
        updateDuplicateNotice();
        applyMatchedFormWiktHints(cand.text, selectedFormPos);
        translateThaiFromEnglish(cand.text, null, selectedFormPos);
      });
      enSuggestions.appendChild(btn);
    });
    enSuggestions.classList.remove('hidden');
  }

  enInput.addEventListener('input', () => {
    enSuggestions.querySelectorAll('.en-chip').forEach((c) => c.classList.remove('active'));
    selectedFormPos = '';
    updateDuplicateNotice();
    clearTimeout(enSyncDebounceTimer);
    enSyncDebounceTimer = setTimeout(() => {
      if (formWiktSenses.length > 0 && !formBackdrop.classList.contains('hidden')) {
        applyMatchedFormWiktHints(enInput.value.trim(), '');
      }
    }, 220);
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
    translateThaiFromEnglish(enText, null, selectedFormPos);
  });

  async function fetchWiktionaryFormSuggestions(svText, enMeaning = '', preferredPos = '') {
    const clean = stripLeadingArticle(svText).toLocaleLowerCase('sv-SE');
    if (!clean || clean.includes(' ')) return [];
    if (wiktFormAbortController) {
      wiktFormAbortController.abort();
    }
    const controller = new AbortController();
    wiktFormAbortController = controller;
    try {
      const { senses } = await fetchWordSensesData(clean, controller.signal);
      if (!senses.length || controller.signal.aborted || formBackdrop.classList.contains('hidden')) {
        return [];
      }
      formWiktSenses = senses;
      formWiktTerm = getCanonicalKey(clean);
      applyMatchedFormWiktHints(enInput.value.trim() || enMeaning, selectedFormPos || preferredPos);
      return senses;
    } catch (_) {
      return [];
    } finally {
      if (wiktFormAbortController === controller) wiktFormAbortController = null;
    }
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
    const t0 = performance.now();
    const dir = !svText ? (enText ? 'en->sv' : 'th->sv') : 'sv->en';
    formError.classList.add('hidden');
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
        telemetry?.trackSuggestResult({
          dir,
          ok: svCandidates.length > 0,
          ms: performance.now() - t0,
          provider: svResult.provider || 'google'
        });

        if (svCandidates.length > 0) {
          termInput.value = svCandidates[0].text;
          updateDuplicateNotice();
          renderSwedishChips(svCandidates);
          fetchWiktionaryFormSuggestions(svCandidates[0].text, englishSource, '');
          if (!thText && englishSource) {
            await translateThaiFromEnglish(englishSource, req, '');
          } else {
            translateStatus.textContent = 'Swedish options found – review and tap Save.';
          }
        } else {
          translateStatus.textContent = 'Could not find Swedish suggestions right now.';
          translateStatus.classList.add('error');
        }
        return;
      }

      // Forward Suggest: Swedish -> English + Wiktionary Senses in parallel -> Sense-synced Thai & Examples
      translateStatus.textContent = 'Finding English options...';
      const wiktPromise = fetchWiktionaryFormSuggestions(svText, enText, '');

      let enResult = null;
      try {
        enResult = await translateWithDict(svText, 'sv', 'en', req.signal);
      } catch (err) {
        if (req.reqId !== translateReqId || req.signal.aborted) return;
        // Rescue with Wiktionary translations if both Google & MyMemory rate-limited/failed
        const rescueSenses = await wiktPromise;
        if (req.reqId !== translateReqId || req.signal.aborted) return;
        const firstWiktEn = rescueSenses.flatMap((s) => s.enTerms || [])[0] || '';
        if (firstWiktEn) {
          enResult = { primary: firstWiktEn, dictEntries: [], provider: 'wiktionary' };
        } else {
          throw err;
        }
      }
      if (req.reqId !== translateReqId || req.signal.aborted) return;

      // Wait briefly (up to 450ms) for Wiktionary senses if fast, otherwise re-refine when ready
      const fastSenses = await Promise.race([
        wiktPromise,
        new Promise((resolve) => setTimeout(() => resolve([]), 450))
      ]);
      if (req.reqId !== translateReqId || req.signal.aborted) return;

      const candidates = buildEnglishCandidates(enResult, svText, fastSenses, 6);
      suggestBtn.disabled = false;
      suggestBtn.textContent = 'Suggest';
      telemetry?.trackSuggestResult({
        dir,
        ok: candidates.length > 0,
        ms: performance.now() - t0,
        provider: enResult.provider || 'google'
      });

      if (candidates.length > 0) {
        renderEnglishChips(candidates);
        enInput.value = candidates[0].text;
        selectedFormPos = candidates[0].posKey || '';
        updateDuplicateNotice();
        applyMatchedFormWiktHints(candidates[0].text, selectedFormPos);

        // If Wiktionary finished slightly later, refine POS chips & matched examples/baseForm seamlessly
        if (fastSenses.length === 0) {
          wiktPromise.then((lateSenses) => {
            if (!lateSenses.length || req.reqId !== translateReqId || formBackdrop.classList.contains('hidden')) return;
            const refined = buildEnglishCandidates(enResult, svText, lateSenses, 6);
            const activeEn = enInput.value.trim();
            renderEnglishChips(refined);
            const matchBtn = Array.from(enSuggestions.querySelectorAll('.en-chip')).find(
              (b) => b.dataset.enText?.toLowerCase() === activeEn.toLowerCase()
            );
            if (matchBtn) {
              enSuggestions.querySelectorAll('.en-chip').forEach((c) => c.classList.remove('active'));
              matchBtn.classList.add('active');
              selectedFormPos = matchBtn.dataset.posKey || selectedFormPos;
            }
            applyMatchedFormWiktHints(activeEn, selectedFormPos);
          });
        }

        await translateThaiFromEnglish(candidates[0].text, req, selectedFormPos);
      } else {
        translateStatus.textContent = 'Could not fetch suggestions right now.';
        translateStatus.classList.add('error');
      }
    } catch (_) {
      if (req.reqId !== translateReqId || req.signal.aborted) return;
      telemetry?.trackSuggestResult({ dir, ok: false, ms: performance.now() - t0, provider: 'none' });
      translateStatus.textContent = 'Could not fetch suggestions right now.';
      translateStatus.classList.add('error');
    } finally {
      if (req.reqId === translateReqId) {
        suggestBtn.disabled = false;
        suggestBtn.textContent = 'Suggest';
      }
    }
  });

  // Android PWA Share Target & Shortcut launch params handler
  function handleLaunchParams() {
    try {
      const params = new URLSearchParams(window.location.search);
      const raw = (params.get('share_text') || params.get('share_title') || '').trim();
      if (raw) {
        const cleaned = raw.replace(/https?:\/\/\S+/gi, '').trim();
        history.replaceState(null, '', window.location.pathname);
        if (!cleaned) return;
        const wordCount = cleaned.split(/\s+/).filter(Boolean).length;
        openForm(null, {
          prefillTerm: cleaned,
          prefillType: wordCount >= 3 ? 'phrase' : 'word',
          autoSuggest: true,
          source: 'share_target'
        });
        return;
      }

      const action = params.get('action');
      if (action === 'add') {
        history.replaceState(null, '', window.location.pathname);
        openForm(null, { source: 'shortcut' });
      } else if (action === 'practice') {
        history.replaceState(null, '', window.location.pathname);
        switchTab('practice');
      }
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

  entries = loadEntries();
  markEntriesMutated();
  syncHeaderHeight();
  render();
  handleLaunchParams();
})();
