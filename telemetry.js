(() => {
  'use strict';

  const KEY = 'svenska_ord_telemetry_v1';
  const MAX_EVENTS = 400;
  const SCHEMA_VERSION = 1;

  let enabled = true;
  let dirty = false;
  let flushTimer = null;
  let activeStartMs = document.visibilityState === 'visible' ? Date.now() : 0;
  const sessionId = 's_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  let sessionActiveMs = 0;

  let activeFormCtx = null;
  let activeCardCtx = null;
  let activePracticeCtx = null;

  function defaultStore() {
    return {
      v: SCHEMA_VERSION,
      agg: {
        sessions: 0,
        totalActiveMs: 0,
        byPos: {},
        funnel: {
          formOpen: 0,
          formSave: 0,
          formAbandon: 0,
          suggestOk: 0,
          suggestFail: 0,
          searchZeroHit: 0,
          searchZeroToAdd: 0
        },
        sw: {
          cacheHits: 0,
          netHits: 0,
          offlineBoots: 0
        }
      },
      events: []
    };
  }

  function loadStore() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultStore();
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        parsed.v === SCHEMA_VERSION &&
        Array.isArray(parsed.events) &&
        parsed.agg &&
        typeof parsed.agg === 'object'
      ) {
        const base = defaultStore();
        return {
          v: SCHEMA_VERSION,
          agg: {
            sessions: Number(parsed.agg.sessions) || 0,
            totalActiveMs: Number(parsed.agg.totalActiveMs) || 0,
            byPos: parsed.agg.byPos && typeof parsed.agg.byPos === 'object' ? parsed.agg.byPos : {},
            funnel: { ...base.agg.funnel, ...(parsed.agg.funnel || {}) },
            sw: { ...base.agg.sw, ...(parsed.agg.sw || {}) }
          },
          events: parsed.events.slice(-MAX_EVENTS)
        };
      }
    } catch (_) {}
    return defaultStore();
  }

  let store = loadStore();

  function flush() {
    if (!dirty || !enabled) return;
    clearTimeout(flushTimer);
    flushTimer = null;
    try {
      localStorage.setItem(KEY, JSON.stringify(store));
      dirty = false;
    } catch (_) {
      if (store.events.length > 50) {
        store.events = store.events.slice(-Math.floor(store.events.length / 2));
        try {
          localStorage.setItem(KEY, JSON.stringify(store));
          dirty = false;
          return;
        } catch (_) {}
      }
      enabled = false;
    }
  }

  function scheduleFlush() {
    if (!enabled) return;
    dirty = true;
    if (!flushTimer) {
      flushTimer = setTimeout(flush, 1500);
    }
  }

  function pushEvent(type, data = {}) {
    if (!enabled) return;
    store.events.push({ ts: Date.now(), sid: sessionId, t: type, d: data });
    if (store.events.length > MAX_EVENTS) {
      store.events.splice(0, store.events.length - MAX_EVENTS);
    }
    scheduleFlush();
  }

  function recordActiveTime() {
    if (activeStartMs > 0) {
      const delta = Math.max(0, Math.min(Date.now() - activeStartMs, 3600000));
      sessionActiveMs += delta;
      store.agg.totalActiveMs += delta;
      activeStartMs = 0;
    }
  }

  function initLifecycle() {
    store.agg.sessions++;
    if (!navigator.onLine) store.agg.sw.offlineBoots++;
    pushEvent('session_start', { online: navigator.onLine });

    window.addEventListener('load', () => {
      setTimeout(() => {
        try {
          const resources = performance.getEntriesByType('resource') || [];
          let cacheHits = 0;
          let netHits = 0;
          for (const r of resources) {
            if (!r.name || !r.name.startsWith(location.origin)) continue;
            if (r.transferSize === 0) cacheHits++;
            else netHits++;
          }
          store.agg.sw.cacheHits += cacheHits;
          store.agg.sw.netHits += netHits;
          const nav = performance.getEntriesByType('navigation')?.[0];
          pushEvent('boot_perf', {
            cacheHits,
            netHits,
            dclMs: nav ? Math.round(nav.domContentLoadedEventEnd) : 0,
            swControlled: Boolean(navigator.serviceWorker?.controller)
          });
        } catch (_) {}
      }, 250);
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        recordActiveTime();
        pushEvent('session_pause', { activeMs: sessionActiveMs });
        flush();
      } else {
        activeStartMs = Date.now();
      }
    });

    window.addEventListener('pagehide', () => {
      recordActiveTime();
      if (activePracticeCtx && !activePracticeCtx.completed && activePracticeCtx.initialCount > 0) {
        pushEvent('practice_abandon', {
          rated: activePracticeCtx.ratedCount,
          initial: activePracticeCtx.initialCount
        });
      }
      pushEvent('session_end', { activeMs: sessionActiveMs });
      flush();
    });
  }

  function trackFormOpen(source = 'fab') {
    store.agg.funnel.formOpen++;
    if (source === 'search_empty') store.agg.funnel.searchZeroToAdd++;
    activeFormCtx = { source, startedAt: Date.now(), suggested: false };
    pushEvent('form_open', { source });
  }

  function trackSuggestResult({ dir, ok, ms, provider = 'google' }) {
    if (activeFormCtx) activeFormCtx.suggested = true;
    if (ok) store.agg.funnel.suggestOk++;
    else store.agg.funnel.suggestFail++;
    pushEvent('suggest', { dir, ok: ok ? 1 : 0, ms: Math.round(ms || 0), provider });
  }

  function trackFormClose({ saved, hasTerm, hasEn, hasTh }) {
    if (!activeFormCtx) return;
    const durationMs = Math.max(0, Date.now() - activeFormCtx.startedAt);
    if (saved) {
      store.agg.funnel.formSave++;
      pushEvent('form_save', {
        source: activeFormCtx.source,
        durationMs,
        suggested: activeFormCtx.suggested ? 1 : 0
      });
    } else {
      store.agg.funnel.formAbandon++;
      pushEvent('form_abandon', {
        source: activeFormCtx.source,
        durationMs,
        suggested: activeFormCtx.suggested ? 1 : 0,
        filled: `${hasTerm ? 'S' : ''}${hasEn ? 'E' : ''}${hasTh ? 'T' : ''}`
      });
    }
    activeFormCtx = null;
  }

  function trackPracticeStart(queueLen, filter) {
    if (activePracticeCtx && !activePracticeCtx.completed && activePracticeCtx.ratedCount > 0) {
      pushEvent('practice_abandon', {
        rated: activePracticeCtx.ratedCount,
        initial: activePracticeCtx.initialCount
      });
    }
    activePracticeCtx = { startedAt: Date.now(), initialCount: queueLen, ratedCount: 0, completed: false };
    pushEvent('practice_start', { queueLen, filter });
  }

  function trackCardShown(item) {
    if (!item) return;
    activeCardCtx = {
      entryId: item.id,
      pos: item.grammar?.pos || (item.type === 'phrase' ? 'Phrase' : 'Unknown'),
      shownAt: Date.now(),
      revealedAt: 0
    };
  }

  function trackCardRevealed() {
    if (activeCardCtx && !activeCardCtx.revealedAt) {
      activeCardCtx.revealedAt = Date.now();
    }
  }

  function trackCardRated(item, knewIt, remainingInQueue) {
    if (!item) return;
    const pos = activeCardCtx?.pos || item.grammar?.pos || (item.type === 'phrase' ? 'Phrase' : 'Unknown');
    const recallMs = activeCardCtx ? Math.min(Math.max(0, Date.now() - activeCardCtx.shownAt), 60000) : 0;

    if (!store.agg.byPos[pos]) {
      store.agg.byPos[pos] = { ok: 0, fail: 0, totalMs: 0 };
    }
    if (knewIt) store.agg.byPos[pos].ok++;
    else store.agg.byPos[pos].fail++;
    store.agg.byPos[pos].totalMs += recallMs;

    if (activePracticeCtx) {
      activePracticeCtx.ratedCount++;
      if (remainingInQueue === 0) activePracticeCtx.completed = true;
    }

    pushEvent('practice_rate', {
      pos,
      knew: knewIt ? 1 : 0,
      repsBefore: item.sr?.reps || 0,
      recallMs,
      rem: remainingInQueue
    });
    activeCardCtx = null;
  }

  function trackSearchZeroHit(queryLen, tab, otherTabHits) {
    store.agg.funnel.searchZeroHit++;
    pushEvent('search_zero', { len: queryLen, tab, otherHits: otherTabHits });
  }

  function getSummary() {
    const liveActiveMs =
      store.agg.totalActiveMs + (activeStartMs > 0 ? Math.max(0, Date.now() - activeStartMs) : 0);

    const posStats = Object.entries(store.agg.byPos)
      .map(([pos, s]) => {
        const total = (s.ok || 0) + (s.fail || 0);
        return {
          pos,
          total,
          ok: s.ok || 0,
          fail: s.fail || 0,
          errorRatePct: total ? Math.round(((s.fail || 0) / total) * 100) : 0,
          avgRecallMs: total ? Math.round((s.totalMs || 0) / total) : 0
        };
      })
      .sort((a, b) => b.errorRatePct - a.errorRatePct || b.total - a.total);

    const totalRated = posStats.reduce((acc, p) => acc + p.total, 0);
    const totalOk = posStats.reduce((acc, p) => acc + p.ok, 0);
    const { cacheHits, netHits } = store.agg.sw;
    const swTotal = cacheHits + netHits;
    const { formOpen, formAbandon } = store.agg.funnel;

    return {
      sessions: store.agg.sessions,
      avgSessionSec: store.agg.sessions ? Math.round(liveActiveMs / store.agg.sessions / 1000) : 0,
      totalRated,
      accuracyPct: totalRated ? Math.round((totalOk / totalRated) * 100) : null,
      formDropOffPct: formOpen ? Math.round((formAbandon / formOpen) * 100) : null,
      swCacheHitRatePct: swTotal ? Math.round((cacheHits / swTotal) * 100) : null,
      hardestPos: posStats.find((p) => p.fail > 0) || null,
      posStats,
      bufferedEvents: store.events.length
    };
  }

  function toCsvCell(val) {
    const str = val === undefined || val === null ? '' : String(val);
    return /[",\r\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  }

  function exportCSV() {
    flush();
    const header = ['timestamp_iso', 'session_id', 'event_type', 'details_json'];
    const lines = [header.join(',')];
    for (const ev of store.events) {
      lines.push(
        [new Date(ev.ts).toISOString(), ev.sid, ev.t, JSON.stringify(ev.d || {})]
          .map(toCsvCell)
          .join(',')
      );
    }
    return '\uFEFF' + lines.join('\r\n');
  }

  function exportJSON() {
    flush();
    return JSON.stringify(
      {
        app: 'Swedish Words',
        type: 'local-flow-analytics',
        exportedAt: new Date().toISOString(),
        summary: getSummary(),
        raw: store
      },
      null,
      2
    );
  }

  function clear() {
    store = defaultStore();
    store.agg.sessions = 1;
    sessionActiveMs = 0;
    activeStartMs = document.visibilityState === 'visible' ? Date.now() : 0;
    dirty = false;
    try {
      localStorage.removeItem(KEY);
    } catch (_) {}
  }

  initLifecycle();

  window.SwedishWordsTelemetry = {
    trackFormOpen,
    trackSuggestResult,
    trackFormClose,
    trackPracticeStart,
    trackCardShown,
    trackCardRevealed,
    trackCardRated,
    trackSearchZeroHit,
    getSummary,
    exportJSON,
    exportCSV,
    clear
  };
})();
