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
    suggestBtn.disabled = false;
    suggestBtn.textContent = 'Suggest';
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
      entries = entries.map((item) =>
        item.id === editingEntryId
          ? { ...item, type: formType, term, en, th, example }
          : item
      );
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

  async function fetchTranslation(text, targetLang) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=sv|${targetLang}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    if (!translated || translated.toUpperCase().includes('MYMEMORY WARNING')) {
      throw new Error('No translation');
    }
    return translated.trim();
  }

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
    translateStatus.textContent = 'Fetching English and Thai suggestions...';
    translateStatus.classList.remove('error', 'hidden');

    try {
      const [enRes, thRes] = await Promise.allSettled([
        fetchTranslation(text, 'en'),
        fetchTranslation(text, 'th')
      ]);

      let filled = 0;
      if (enRes.status === 'fulfilled' && enRes.value) {
        enInput.value = enRes.value;
        filled++;
      }
      if (thRes.status === 'fulfilled' && thRes.value) {
        thInput.value = thRes.value;
        filled++;
      }

      if (filled > 0) {
        translateStatus.textContent = 'Suggestions filled – review and tap Save.';
        translateStatus.classList.remove('error');
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
