(() => {
  'use strict';

  const STORAGE_KEY = 'svenska_ord_entries_v2';
  const SWEDISH_ALPHABET = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    'Å', 'Ä', 'Ö'
  ];
  const collator = new Intl.Collator('sv', { sensitivity: 'base' });

  const DEFAULT_ENTRIES = [
    { id: 'w1', type: 'word', term: 'Anledning', en: 'Reason, cause', th: 'เหตุผล, สาเหตุ', example: 'Det finns ingen anledning att stressa.' },
    { id: 'w2', type: 'word', term: 'Besvikelse', en: 'Disappointment', th: 'ความผิดหวัง', example: 'Det var en stor besvikelse.' },
    { id: 'w3', type: 'word', term: 'Duktig', en: 'Good at, skilled, clever', th: 'เก่ง, ขยัน', example: 'Hon är väldigt duktig på att laga mat.' },
    { id: 'w4', type: 'word', term: 'Egentligen', en: 'Actually, really', th: 'จริงๆ แล้ว, ที่จริง', example: 'Egentligen borde jag sova nu.' },
    { id: 'w5', type: 'word', term: 'Fika', en: 'Coffee & pastry break with friends', th: 'พักดื่มกาแฟและกินขนม', example: 'Ska vi ta en fika efter jobbet?' },
    { id: 'w6', type: 'word', term: 'Ganska', en: 'Quite, fairly, rather', th: 'ค่อนข้าง', example: 'Det är ganska kallt ute idag.' },
    { id: 'w7', type: 'word', term: 'Hinna', en: 'To have time / make it in time', th: 'ทันเวลา, มีเวลาพอ', example: 'Jag tror inte att jag hinner med bussen.' },
    { id: 'w8', type: 'word', term: 'Jättebra', en: 'Great, very good', th: 'ดีมาก, เยี่ยมมาก', example: 'Det låter som en jättebra idé!' },
    { id: 'w9', type: 'word', term: 'Kanske', en: 'Maybe, perhaps', th: 'อาจจะ, บางที', example: 'Vi kanske ses imorgon.' },
    { id: 'w10', type: 'word', term: 'Lagom', en: 'Just right, not too much or too little', th: 'พอดี, ไม่มากไม่น้อยเกินไป', example: 'Vattnet är lagom varmt.' },
    { id: 'w11', type: 'word', term: 'Mysig', en: 'Cozy, pleasant, warm', th: 'อบอุ่น, น่ารัก, สบายๆ', example: 'Vi hade en mysig kväll i soffan.' },
    { id: 'w12', type: 'word', term: 'Orka', en: 'To have the energy / strength to do something', th: 'มีแรง, ไหว', example: 'Jag orkar inte träna idag.' },
    { id: 'w13', type: 'word', term: 'Precis', en: 'Exactly, just now', th: 'พอดีเป๊ะ, เพิ่งจะ', example: 'Jag kom precis hem.' },
    { id: 'w14', type: 'word', term: 'Rolig', en: 'Fun, funny', th: 'สนุก, ตลก', example: 'Filmen var väldigt rolig.' },
    { id: 'w15', type: 'word', term: 'Självklart', en: 'Of course, obviously', th: 'แน่นอน', example: 'Självklart kan jag hjälpa dig!' },
    { id: 'w16', type: 'word', term: 'Trevlig', en: 'Nice, friendly, pleasant', th: 'ใจดี, น่ารัก, น่าคบ', example: 'Ha en trevlig helg!' },
    { id: 'w17', type: 'word', term: 'Ungefär', en: 'Approximately, about', th: 'ประมาณ, ราวๆ', example: 'Det tar ungefär tio minuter.' },
    { id: 'w18', type: 'word', term: 'Verkligen', en: 'Really, truly', th: 'จริงๆ, อย่างแท้จริง', example: 'Tack så mycket, verkligen!' },
    { id: 'w19', type: 'word', term: 'Återkomma', en: 'To get back to someone, return', th: 'ติดต่อกลับ, กลับมา', example: 'Jag återkommer imorgon.' },
    { id: 'w20', type: 'word', term: 'Äntligen', en: 'Finally, at last', th: 'ในที่สุด, สักที', example: 'Äntligen är det fredag!' },
    { id: 'w21', type: 'word', term: 'Överens', en: 'In agreement, agreed', th: 'เห็นตรงกัน, ตกลงกัน', example: 'Vi är överens om planen.' },

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

  // State
  let entries = loadEntries();
  let activeTab = 'word'; // 'word' | 'phrase'
  let searchQuery = '';
  let selectedEntryId = null;
  let editingEntryId = null;
  let formType = 'word';
  let isScrubbing = false;
  let popupTimer = null;
  let suppressScrollPopup = false;
  let lastScrolledLetter = null;

  // Elements
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const addBtn = document.getElementById('addBtn');
  const tabs = document.querySelectorAll('.tab');
  const wordCountEl = document.getElementById('wordCount');
  const phraseCountEl = document.getElementById('phraseCount');
  const entriesList = document.getElementById('entriesList');
  const emptyState = document.getElementById('emptyState');
  const emptyTitle = document.getElementById('emptyTitle');
  const emptySub = document.getElementById('emptySub');
  const scrubber = document.getElementById('scrubber');
  const letterPopup = document.getElementById('letterPopup');

  // Detail sheet
  const detailBackdrop = document.getElementById('detailBackdrop');
  const detailBadge = document.getElementById('detailBadge');
  const detailTerm = document.getElementById('detailTerm');
  const detailEnWrap = document.getElementById('detailEnWrap');
  const detailEn = document.getElementById('detailEn');
  const detailThWrap = document.getElementById('detailThWrap');
  const detailTh = document.getElementById('detailTh');
  const detailExampleWrap = document.getElementById('detailExampleWrap');
  const detailExample = document.getElementById('detailExample');
  const detailGrammarWrap = document.getElementById('detailGrammarWrap');
  const detailPos = document.getElementById('detailPos');
  const detailGrammarStatus = document.getElementById('detailGrammarStatus');
  const detailForms = document.getElementById('detailForms');
  const editEntryBtn = document.getElementById('editEntryBtn');
  const deleteEntryBtn = document.getElementById('deleteEntryBtn');
  const closeDetailBtn = document.getElementById('closeDetailBtn');

  // Form sheet
  const formBackdrop = document.getElementById('formBackdrop');
  const formTitle = document.getElementById('formTitle');
  const entryForm = document.getElementById('entryForm');
  const typePills = document.querySelectorAll('.type-pill');
  const termLabel = document.getElementById('termLabel');
  const termInput = document.getElementById('termInput');
  const enInput = document.getElementById('enInput');
  const thInput = document.getElementById('thInput');
  const exampleInput = document.getElementById('exampleInput');
  const suggestBtn = document.getElementById('suggestBtn');
  const translateStatus = document.getElementById('translateStatus');
  const enSuggestions = document.getElementById('enSuggestions');
  const thSuggestions = document.getElementById('thSuggestions');
  const retranslateThBtn = document.getElementById('retranslateThBtn');
  const formError = document.getElementById('formError');
  const cancelFormBtn = document.getElementById('cancelFormBtn');

  function loadEntries() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) {
      // Ignore storage errors and fall back to defaults
    }
    return DEFAULT_ENTRIES.slice();
  }

  function saveEntries() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (_) {
      // Ignore quota errors
    }
  }

  function getFirstLetter(term) {
    const trimmed = (term || '').trim();
    if (!trimmed) return '#';
    const first = trimmed[0].toLocaleUpperCase('sv-SE');
    return SWEDISH_ALPHABET.includes(first) ? first : '#';
  }

  function getAlphabetOrder(letter) {
    const idx = SWEDISH_ALPHABET.indexOf(letter);
    return idx === -1 ? SWEDISH_ALPHABET.length : idx;
  }

  function updateCounts() {
    let words = 0;
    let phrases = 0;
    for (const item of entries) {
      if (item.type === 'phrase') phrases++;
      else words++;
    }
    wordCountEl.textContent = words;
    phraseCountEl.textContent = phrases;
  }

  function getFilteredEntries() {
    const q = searchQuery.trim().toLocaleLowerCase('sv-SE');
    return entries
      .filter((item) => item.type === activeTab)
      .filter((item) => {
        if (!q) return true;
        return (
          item.term.toLocaleLowerCase('sv-SE').includes(q) ||
          (item.en && item.en.toLocaleLowerCase('en').includes(q)) ||
          (item.th && item.th.toLowerCase().includes(q)) ||
          (item.example && item.example.toLocaleLowerCase('sv-SE').includes(q))
        );
      })
      .sort((a, b) => collator.compare(a.term, b.term));
  }

  function render() {
    updateCounts();
    const filtered = getFilteredEntries();
    entriesList.innerHTML = '';

    if (filtered.length === 0) {
      emptyState.classList.remove('hidden');
      if (searchQuery.trim()) {
        emptyTitle.textContent = 'No matches';
        emptySub.textContent = `Nothing matched "${searchQuery.trim()}".`;
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

        const termSpan = document.createElement('span');
        termSpan.className = 'entry-term';
        termSpan.textContent = item.term;

        const chevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        chevron.setAttribute('class', 'entry-chevron');
        chevron.setAttribute('viewBox', '0 0 24 24');
        chevron.setAttribute('fill', 'none');
        chevron.setAttribute('stroke', 'currentColor');
        chevron.setAttribute('stroke-width', '2');
        chevron.setAttribute('stroke-linecap', 'round');
        chevron.setAttribute('stroke-linejoin', 'round');
        const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        poly.setAttribute('points', '9 18 15 12 9 6');
        chevron.appendChild(poly);

        card.appendChild(termSpan);
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
    highlightScrubberLetter(letter);
    showLetterPopup(letter);
    scrollToLetter(letter);
  }

  scrubber.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    isScrubbing = true;
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
    scrubber.classList.remove('active');
    if (scrubber.hasPointerCapture(e.pointerId)) {
      scrubber.releasePointerCapture(e.pointerId);
    }
    hideLetterPopup();
  }

  scrubber.addEventListener('pointerup', endScrub);
  scrubber.addEventListener('pointercancel', endScrub);

  window.addEventListener(
    'scroll',
    () => {
      if (
        isScrubbing ||
        suppressScrollPopup ||
        !detailBackdrop.classList.contains('hidden') ||
        !formBackdrop.classList.contains('hidden')
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
    },
    { passive: true }
  );

  // Live Search
  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value;
    clearSearchBtn.classList.toggle('hidden', searchQuery.length === 0);
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
    tab.addEventListener('click', () => {
      const nextTab = tab.dataset.tab;
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
      render();
      setTimeout(() => {
        suppressScrollPopup = false;
      }, 80);
    });
  });

  // Detail Sheet
  function openDetail(id) {
    const item = entries.find((e) => e.id === id);
    if (!item) return;
    selectedEntryId = id;
    detailBadge.textContent = item.type === 'phrase' ? 'Phrase' : 'Word';
    detailTerm.textContent = item.term;

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

    detailBackdrop.classList.remove('hidden');
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

  function renderGrammarData(grammar) {
    detailGrammarStatus.classList.add('hidden');
    detailForms.innerHTML = '';

    if (!grammar || (!grammar.pos && (!grammar.forms || grammar.forms.length === 0))) {
      detailGrammarWrap.classList.add('hidden');
      return;
    }

    if (grammar.pos) {
      detailPos.textContent = grammar.pos;
      detailPos.classList.remove('hidden');
    } else {
      detailPos.classList.add('hidden');
    }

    if (Array.isArray(grammar.forms)) {
      for (const f of grammar.forms) {
        const card = document.createElement('div');
        card.className = 'grammar-form-item';

        const lbl = document.createElement('span');
        lbl.className = 'grammar-form-label';
        lbl.textContent = toEnglishGrammarLabel(f.label);

        const val = document.createElement('span');
        val.className = 'grammar-form-value';
        val.textContent = f.value;

        card.appendChild(lbl);
        card.appendChild(val);
        detailForms.appendChild(card);
      }
    }

    detailGrammarWrap.classList.remove('hidden');
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

  async function fetchWiktionaryGrammar(word) {
    const cleanWord = word.trim().toLocaleLowerCase('sv-SE');
    let pos = '';
    let forms = [];

    const [enRes, svRes] = await Promise.allSettled([
      fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(cleanWord)}`).then((r) =>
        r.ok ? r.json() : null
      ),
      fetch(
        `https://sv.wiktionary.org/w/api.php?action=parse&page=${encodeURIComponent(cleanWord)}&prop=text&format=json&origin=*`
      ).then((r) => (r.ok ? r.json() : null))
    ]);

    if (enRes.status === 'fulfilled' && Array.isArray(enRes.value?.sv) && enRes.value.sv.length > 0) {
      pos = enRes.value.sv[0].partOfSpeech || '';
    }

    if (svRes.status === 'fulfilled' && svRes.value?.parse?.text?.['*']) {
      const doc = new DOMParser().parseFromString(svRes.value.parse.text['*'], 'text/html');
      const tables = Array.from(doc.querySelectorAll('table.grammar')).filter(isSwedishGrammarTable);
      const posLower = pos.toLowerCase();
      let table = tables[0] || null;

      if (tables.length > 1 && posLower) {
        const target =
          posLower === 'verb' ? 'Verb' : posLower === 'noun' ? 'Noun' : posLower === 'adjective' ? 'Adjective' : '';
        if (target) {
          table = tables.find((t) => detectTablePos(t) === target) || tables[0];
        }
      }

      if (table) {
        const tablePos = detectTablePos(table);
        if (tablePos === 'Noun') {
          const parsed = parseNounTable(table);
          pos = parsed.pos;
          forms = parsed.forms;
        } else if (tablePos === 'Verb') {
          const parsed = parseVerbTable(table);
          pos = parsed.pos;
          forms = parsed.forms;
        } else if (tablePos === 'Adjective') {
          const parsed = parseAdjectiveTable(table);
          pos = parsed.pos;
          forms = parsed.forms;
        } else {
          if (!pos && tablePos) pos = tablePos;
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
        }
      }
    }

    if (!pos && forms.length === 0) return null;
    return { v: 3, pos, forms };
  }

  async function loadAndRenderGrammar(item) {
    if (item.type !== 'word' || item.term.trim().includes(' ')) {
      detailGrammarWrap.classList.add('hidden');
      return;
    }

    if (item.grammar && item.grammar.v === 3) {
      renderGrammarData(item.grammar);
      return;
    }

    if (!navigator.onLine) {
      detailGrammarWrap.classList.add('hidden');
      return;
    }

    detailPos.classList.add('hidden');
    detailForms.innerHTML = '';
    detailGrammarStatus.textContent = 'Loading grammar...';
    detailGrammarStatus.classList.remove('hidden');
    detailGrammarWrap.classList.remove('hidden');

    try {
      const grammar = await fetchWiktionaryGrammar(item.term);
      if (grammar) {
        item.grammar = grammar;
        saveEntries();
      }
      if (selectedEntryId === item.id) {
        renderGrammarData(grammar);
      }
    } catch (_) {
      if (selectedEntryId === item.id) {
        detailGrammarWrap.classList.add('hidden');
      }
    }
  }

  function closeDetail() {
    detailBackdrop.classList.add('hidden');
    selectedEntryId = null;
  }

  closeDetailBtn.addEventListener('click', closeDetail);
  detailBackdrop.addEventListener('click', (e) => {
    if (e.target === detailBackdrop) closeDetail();
  });

  editEntryBtn.addEventListener('click', () => {
    const item = entries.find((e) => e.id === selectedEntryId);
    if (!item) return;
    closeDetail();
    openForm(item);
  });

  deleteEntryBtn.addEventListener('click', () => {
    if (!selectedEntryId) return;
    entries = entries.filter((e) => e.id !== selectedEntryId);
    saveEntries();
    closeDetail();
    render();
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
  }

  typePills.forEach((pill) => {
    pill.addEventListener('click', () => setFormType(pill.dataset.type));
  });

  function openForm(existingItem = null) {
    formError.classList.add('hidden');
    translateStatus.classList.add('hidden');
    translateStatus.classList.remove('error');
    enSuggestions.innerHTML = '';
    enSuggestions.classList.add('hidden');
    thSuggestions.innerHTML = '';
    thSuggestions.classList.add('hidden');
    suggestBtn.disabled = false;
    suggestBtn.textContent = 'Suggest';
    retranslateThBtn.disabled = false;
    if (existingItem) {
      editingEntryId = existingItem.id;
      formTitle.textContent = existingItem.type === 'phrase' ? 'Edit phrase' : 'Edit word';
      setFormType(existingItem.type);
      termInput.value = existingItem.term;
      enInput.value = existingItem.en || '';
      thInput.value = existingItem.th || '';
      exampleInput.value = existingItem.example || '';
    } else {
      editingEntryId = null;
      formTitle.textContent = activeTab === 'phrase' ? 'Add phrase' : 'Add word';
      setFormType(activeTab);
      termInput.value = '';
      enInput.value = '';
      thInput.value = '';
      exampleInput.value = '';
    }
    formBackdrop.classList.remove('hidden');
    setTimeout(() => termInput.focus(), 60);
  }

  function closeForm() {
    formBackdrop.classList.add('hidden');
    editingEntryId = null;
  }

  addBtn.addEventListener('click', () => openForm(null));
  cancelFormBtn.addEventListener('click', closeForm);
  formBackdrop.addEventListener('click', (e) => {
    if (e.target === formBackdrop) closeForm();
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

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!formBackdrop.classList.contains('hidden')) closeForm();
      else if (!detailBackdrop.classList.contains('hidden')) closeDetail();
    }
  });

  async function fetchGoogleDict(text, fromLang, toLang) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromLang}&tl=${toLang}&dt=t&dt=bd&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
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

  async function fetchMyMemoryFallback(text, fromLang, toLang) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const primary = (data?.responseData?.translatedText || '').trim();
    if (!primary || primary.toUpperCase().includes('MYMEMORY WARNING')) {
      throw new Error('No translation');
    }
    return { primary, dictEntries: [] };
  }

  async function translateWithDict(text, fromLang, toLang) {
    try {
      return await fetchGoogleDict(text, fromLang, toLang);
    } catch (_) {
      return await fetchMyMemoryFallback(text, fromLang, toLang);
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

  async function translateThaiFromEnglish(enText) {
    if (!enText) return;
    retranslateThBtn.disabled = true;
    thSuggestions.innerHTML = '';
    thSuggestions.classList.add('hidden');
    translateStatus.textContent = `Translating "${enText}" to Thai...`;
    translateStatus.classList.remove('error', 'hidden');
    try {
      const result = await translateWithDict(enText, 'en', 'th');
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
      translateStatus.textContent = 'Could not translate to Thai right now.';
      translateStatus.classList.add('error');
    } finally {
      retranslateThBtn.disabled = false;
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

  suggestBtn.addEventListener('click', async () => {
    const text = termInput.value.trim();
    if (!text) {
      translateStatus.textContent = 'Enter a Swedish word or phrase first.';
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

    suggestBtn.disabled = true;
    suggestBtn.textContent = 'Searching...';
    enSuggestions.innerHTML = '';
    enSuggestions.classList.add('hidden');
    thSuggestions.innerHTML = '';
    thSuggestions.classList.add('hidden');
    translateStatus.textContent = 'Finding English options...';
    translateStatus.classList.remove('error', 'hidden');

    try {
      const enResult = await translateWithDict(text, 'sv', 'en');
      const candidates = buildCandidateList(enResult, text, 5);
      if (candidates.length > 0) {
        renderEnglishChips(candidates);
        enInput.value = candidates[0].text;
        await translateThaiFromEnglish(candidates[0].text);
      } else {
        translateStatus.textContent = 'Could not fetch suggestions right now.';
        translateStatus.classList.add('error');
      }
    } catch (_) {
      translateStatus.textContent = 'Could not fetch suggestions right now.';
      translateStatus.classList.add('error');
    } finally {
      suggestBtn.disabled = false;
      suggestBtn.textContent = 'Suggest';
    }
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }

  render();
})();
