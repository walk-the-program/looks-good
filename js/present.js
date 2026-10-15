/* ---------------------------------------------------------------------
   present.js — the scripted show: deck present mode, presenter view and
   the self-running demo loop. css/present.css holds the styles.

   Show.present(startIndex, opts)  Full-window (and real full screen where the
       engine allows it) presentation of the brand deck. Slides are built with
       the deck's own renderer (bdSlideHtml + bdFitDeck, js/brand-deck.js) at
       1280x720 and scaled to the screen with CSS zoom, so text stays crisp.
       Keys: → ↓ Space PageDown Enter next; ← ↑ PageUp Backspace back; Home/End;
       1-9, 0 jump to a slide; N notes; F full screen; Esc exit. Click: left
       third goes back, the rest goes forward.
   Show.presenter(on?)  Hides the sidebar and chrome, enlarges the board and maps
       number keys to demo beats (1 Reveal, 2 Worlds, 3 Mix in, 4 See it built,
       5 Deck). ← → step aesthetics. Esc exits. Shortcut: P.
   Show.demoLoop(on?)  Attract mode: reveal, worlds, a few aesthetic switches, a
       mix, see it built and three deck slides, then again. Any key, click or
       scroll takes over and stops it; the brand's look is put back as it was.
       Also starts from a ?demo=1 URL flag.

   Other modules' beats (Show.reveal, Show.worlds, Show.built) are optional:
   every call is guarded, and a missing beat falls back or is skipped.
   Optional for them: Show.dismiss() closes whatever beat overlay is open (the
   demo loop calls it between beats, then sends a synthetic Escape).
   Plain <script>, loaded after app.js and brand-session.js.
------------------------------------------------------------------------ */

window.Show = window.Show || {};

(function () {
  'use strict';

  const Show = window.Show;
  const DW = 1280;
  const DH = 720;

  const reduceMotion = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const inEditor = () => document.body.dataset.view === 'editor';
  const has = name => typeof Show[name] === 'function';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clean = s => String(s || '').replace(/\s+/g, ' ').trim();
  const toast = msg => { if (typeof showToast === 'function') showToast(msg); };

  // A synthetic Escape the demo loop sends to close another module's overlay:
  // this file's own Escape handlers ignore it.
  let synthEsc = false;

  // Typing in a field, or a dialog / tray is up: leave the keys alone.
  function keysBlocked(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return true;
    if (document.body.classList.contains('has-dialog') || document.body.classList.contains('has-cart')) return true;
    const modal = document.getElementById('brandGuideModal');
    if (modal && !modal.hidden) return true;
    return [e.target, document.activeElement].some(el => {
      if (!el || el === document.body || el === document.documentElement) return false;
      if (el.isContentEditable) return true;
      return ['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName);
    });
  }

  /* ======================= Present mode ======================= */

  // Slide transition by the aesthetic's family: soft for tactile, a push for
  // graphic, a wipe for digital, a slow fade for print, a glow for luminous.
  const FAMILY_TRANSITION = { tactile: 'rise', graphic: 'push', digital: 'wipe', print: 'fade', luminous: 'glow' };
  const TRANSITION_MS = { rise: 560, push: 460, wipe: 440, fade: 620, glow: 680 };

  function transitionFor(def) {
    if (reduceMotion()) return 'quick';
    const key = def && (def.blend && def.blend.base ? def.blend.base : def.key);
    const meta = typeof aestheticMeta === 'function' ? aestheticMeta(key || (typeof state !== 'undefined' ? state.aesthetic : '')) : null;
    return FAMILY_TRANSITION[meta && meta.family] || 'push';
  }

  let PR = null;   // the open presentation

  function text(root, sel) {
    const el = root.querySelector(sel);
    return el ? clean(el.textContent) : '';
  }
  function texts(root, sel, max) {
    return [...root.querySelectorAll(sel)].map(el => clean(el.textContent)).filter(Boolean).slice(0, max || 6);
  }
  function listWords(arr) {
    if (arr.length <= 1) return arr.join('');
    // Items that carry their own commas are kept apart with semicolons.
    if (arr.some(x => x.includes(','))) return arr.join('; ');
    return arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1];
  }

  // One plain line per slide, read from what the slide actually shows.
  function noteFor(slide, root, def, content) {
    const brand = clean(content.brandName) || 'The brand';
    try {
      switch (slide.key) {
        case 'cover': {
          const tag = clean(content.tagline);
          return `Open on ${brand}${tag ? `: “${tag}”` : ''}. Everything that follows is in the ${def.name} style.`;
        }
        case 'principles': {
          const p = texts(root, '.ab-deck-ptitle', 4);
          return p.length ? `The ideas behind the look: ${listWords(p.map(x => x.toLowerCase()))}.` : `What ${brand} should feel like.`;
        }
        case 'color': {
          const n = root.querySelectorAll('.ab-deck-seg').length;
          const r = text(root, '.ab-deck-pratio b');
          const word = n && typeof numberWord === 'function' ? numberWord(n) : (n || 'The');
          return `${word} brand colors and how much of each to use.${r ? ` Body text reads at ${r} contrast.` : ''}`;
        }
        case 'typography': {
          const f = texts(root, '.ab-deck-fname', 2);
          return f.length === 2 ? `Headings are set in ${f[0]}, body text in ${f[1]}.` : 'The type faces and the size scale.';
        }
        case 'interface': {
          const c = texts(root, '.ab-deck-cellname', 4).map(x => x.toLowerCase());
          return c.length ? `The everyday controls, drawn in this style: ${listWords(c)}.` : 'The everyday controls, drawn in this style.';
        }
        case 'material': {
          const m = texts(root, '.ab-deck-mat .ab-label > span', 4).map(x => x.toLowerCase());
          return m.length ? `Surfaces and finishes: ${listWords(m)}.` : 'The surfaces, finishes and signature graphics.';
        }
        case 'patterns': {
          const p = [...root.querySelectorAll('.ab-deck-pt img')].map(img => clean(img.alt).replace(/ pattern$/i, '').toLowerCase()).filter(Boolean).slice(0, 4);
          return p.length ? `Patterns that belong to the brand: ${listWords(p)}.` : 'Patterns that belong to the brand.';
        }
        case 'product': return `${brand} on a real product screen: a project list, a next step and the main action.`;
        case 'dodont': {
          const d = text(root, '[data-kind="do"] .ab-deck-rule p');
          const x = text(root, '[data-kind="dont"] .ab-deck-rule p');
          return d && x ? `Do: ${d.replace(/\.$/, '')}. Avoid: ${x.replace(/\.$/, '')}.` : 'What to do, and what to avoid.';
        }
        case 'closing': {
          const h = text(root, '.ab-deck-closing h2');
          return h ? `Close on “${h}” and take questions.` : 'Close and take questions.';
        }
        default: return clean(slide.title) + '.';
      }
    } catch (err) {
      return clean(slide.title) + '.';
    }
  }

  const ICON_CLOSE = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';

  function present(startIndex, opts) {
    opts = opts || {};
    if (PR) { go(clampIndex(startIndex || 0)); return true; }
    if (!inEditor()) return false;
    if (typeof DECK_SLIDES === 'undefined' || typeof bdSlideHtml !== 'function' || typeof abView !== 'function') {
      toast('The deck is still loading');
      return false;
    }
    const view = abView();
    const def = view.def;
    const content = typeof effectiveContent === 'function' ? effectiveContent() : (view.state.content || {});
    const st = Object.assign({}, view.state, { content });
    const slides = DECK_SLIDES.slice();

    const root = document.createElement('div');
    root.className = 'pr';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', `${clean(content.brandName) || 'Brand'} deck`);
    root.tabIndex = -1;
    root.dataset.trans = transitionFor(def);
    if (opts.auto) root.classList.add('is-auto');
    root.innerHTML = `
      <div class="pr-view"><div class="pr-stage"></div></div>
      <div class="pr-notes" hidden>
        <span class="pr-notes-n"></span>
        <p class="pr-notes-text"></p>
        <span class="pr-notes-next"></span>
      </div>
      <div class="pr-progress" aria-hidden="true"><i></i></div>
      <button type="button" class="pr-exit" aria-label="Exit presentation" title="Exit (Esc)">${ICON_CLOSE}</button>
      <p class="pr-hint" aria-hidden="true"><span><kbd>←</kbd><kbd>→</kbd> move</span><span><kbd>N</kbd> notes</span><span><kbd>F</kbd> full screen</span><span><kbd>Esc</kbd> exit</span></p>
      <p class="pr-live" aria-live="polite"></p>`;
    const stage = root.querySelector('.pr-stage');
    if (typeof setBoardFonts === 'function') setBoardFonts(stage);
    stage.innerHTML = slides.map((sl, i) =>
      `<div class="pr-slide" data-i="${i}" aria-hidden="true">${bdSlideHtml(st, def, sl, i, slides.length)}</div>`).join('');

    document.body.appendChild(root);
    document.documentElement.classList.add('is-presenting');
    // Fit at 1:1 (the deck's fitting measures layout), then scale.
    stage.style.zoom = '1';
    try {
      if (typeof bdApplyRadius === 'function') bdApplyRadius(stage, def);
      if (typeof bdFitDeck === 'function') bdFitDeck(stage);
    } catch (err) { /* an unfitted slide still shows */ }

    const roots = [...stage.querySelectorAll('.pr-slide')];
    PR = {
      root, stage, slides, roots, def,
      notes: roots.map((el, i) => noteFor(slides[i], el, def, content)),
      i: -1, notesOn: !!opts.notes, fs: false, auto: !!opts.auto,
      returnFocus: document.activeElement, timers: [], idle: null,
    };
    layout();
    go(clampIndex(startIndex || 0), 0);

    root.addEventListener('click', onStageClick);
    root.querySelector('.pr-exit').addEventListener('click', e => { e.stopPropagation(); exitPresent(); });
    root.addEventListener('mousemove', wake);
    const still = e => e.preventDefault();
    root.addEventListener('wheel', still, { passive: false });
    root.addEventListener('touchmove', still, { passive: false });
    window.addEventListener('resize', layout);
    if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', refit);
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);

    if (!opts.auto) {
      root.classList.add('show-hint');
      PR.timers.push(setTimeout(() => root.classList.remove('show-hint'), 3200));
      if (opts.fullscreen !== false) enterFullscreen();
      root.focus({ preventScroll: true });
    }
    setNotes(PR.notesOn);
    return true;
  }

  function clampIndex(i) {
    const n = PR ? PR.roots.length : 1;
    i = Number(i) || 0;
    return Math.max(0, Math.min(n - 1, i));
  }

  function layout() {
    if (!PR) return;
    const notes = PR.root.querySelector('.pr-notes');
    const nh = PR.notesOn && !notes.hidden ? notes.offsetHeight : 0;
    const W = window.innerWidth;
    const H = window.innerHeight - nh;
    // Whole device pixels across: the slide edge lands on a pixel, not between two.
    const z = Math.max(0.1, Math.floor(Math.min(W / DW, H / DH) * DW) / DW);
    PR.stage.style.zoom = String(z);
    PR.root.style.setProperty('--pr-notes-h', nh + 'px');
  }

  function refit() {
    if (!PR) return;
    try { if (typeof bdFitDeck === 'function') bdFitDeck(PR.stage); } catch (err) { /* keep the last fit */ }
  }

  function go(n, dir) {
    if (!PR) return;
    n = clampIndex(n);
    const prevI = PR.i;
    if (n === prevI) return;
    const d = dir != null ? dir : (n > prevI ? 1 : -1);
    const prev = PR.roots[prevI];
    const next = PR.roots[n];
    PR.root.dataset.dir = d < 0 ? 'back' : 'fwd';
    PR.roots.forEach(el => el.classList.remove('is-in', 'is-out'));
    if (prev && d !== 0) {
      prev.classList.remove('is-on');
      prev.classList.add('is-out');
      prev.setAttribute('aria-hidden', 'true');
    } else if (prev) {
      prev.classList.remove('is-on');
    }
    next.classList.add('is-on');
    if (d !== 0) next.classList.add('is-in');
    next.removeAttribute('aria-hidden');
    PR.i = n;
    const ms = (TRANSITION_MS[PR.root.dataset.trans] || 200) + 80;
    clearTimeout(PR.settle);
    PR.settle = setTimeout(() => { if (PR) PR.roots.forEach(el => el.classList.remove('is-in', 'is-out')); }, ms);
    const total = PR.roots.length;
    PR.root.querySelector('.pr-progress i').style.transform = `scaleX(${(n + 1) / total})`;
    PR.root.querySelector('.pr-notes-n').textContent = `${String(n + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    PR.root.querySelector('.pr-notes-text').textContent = PR.notes[n];
    PR.root.querySelector('.pr-notes-next').textContent = n + 1 < total ? `Next: ${PR.slides[n + 1].title}` : 'Last slide';
    PR.root.querySelector('.pr-live').textContent = `Slide ${n + 1} of ${total}: ${PR.slides[n].title}`;
  }

  const next = () => PR && go(PR.i + 1, 1);
  const prev = () => PR && go(PR.i - 1, -1);

  function setNotes(on) {
    if (!PR) return;
    PR.notesOn = !!on;
    PR.root.querySelector('.pr-notes').hidden = !PR.notesOn;
    PR.root.classList.toggle('has-notes', PR.notesOn);
    layout();
  }

  function onStageClick(e) {
    if (!PR || PR.auto) return;
    if (e.target.closest('.pr-exit, .pr-notes')) return;
    if (e.clientX < window.innerWidth * 0.3) prev(); else next();
  }

  // The cursor and the exit button hide after two still seconds.
  function wake() {
    if (!PR || PR.auto) return;
    PR.root.classList.add('is-awake');
    clearTimeout(PR.idle);
    PR.idle = setTimeout(() => PR && PR.root.classList.remove('is-awake'), 2000);
  }

  function fsElement() { return document.fullscreenElement || document.webkitFullscreenElement || null; }

  function enterFullscreen() {
    if (!PR) return;
    const el = PR.root;
    const req = el.requestFullscreen || el.webkitRequestFullscreen;
    const enabled = document.fullscreenEnabled || document.webkitFullscreenEnabled;
    if (!req || enabled === false) return;
    try {
      const p = req.call(el);
      PR.fs = true;
      if (p && typeof p.catch === 'function') p.catch(() => { if (PR) PR.fs = false; });
    } catch (err) {
      PR.fs = false;
    }
  }

  function exitFullscreen() {
    const exit = document.exitFullscreen || document.webkitExitFullscreen;
    if (fsElement() && exit) {
      try { const p = exit.call(document); if (p && p.catch) p.catch(() => {}); } catch (err) { /* already out */ }
    }
  }

  function toggleFullscreen() {
    if (!PR) return;
    if (fsElement()) { PR.fs = false; exitFullscreen(); } else enterFullscreen();
  }

  // Esc in real full screen is taken by the browser: leaving full screen ends the show.
  function onFsChange() {
    if (!PR) return;
    if (fsElement()) { PR.fsEntered = true; layout(); return; }
    if (PR.fs && PR.fsEntered) exitPresent();
    else layout();
  }

  function exitPresent() {
    if (!PR) return;
    const p = PR;
    PR = null;
    p.timers.forEach(clearTimeout);
    clearTimeout(p.idle);
    clearTimeout(p.settle);
    window.removeEventListener('resize', layout);
    if (document.fonts && document.fonts.removeEventListener) document.fonts.removeEventListener('loadingdone', refit);
    document.removeEventListener('fullscreenchange', onFsChange);
    document.removeEventListener('webkitfullscreenchange', onFsChange);
    if (fsElement()) exitFullscreen();
    p.root.remove();
    document.documentElement.classList.remove('is-presenting');
    const back = p.returnFocus;
    if (back && document.contains(back) && typeof back.focus === 'function') back.focus({ preventScroll: true });
  }

  function onPresentKey(e) {
    if (!PR) return false;
    if (PR.auto) return true;   // the demo loop's own listener decides
    const k = e.key;
    if (k === 'Escape') { if (!synthEsc) exitPresent(); return true; }
    if (e.ctrlKey || e.metaKey || e.altKey) return false;
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(k)) { if (!e.repeat || k !== ' ') next(); return true; }
    if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(k)) { prev(); return true; }
    if (k === 'Home') { go(0); return true; }
    if (k === 'End') { go(PR.roots.length - 1); return true; }
    if (/^[0-9]$/.test(k)) { go(k === '0' ? 9 : Number(k) - 1); return true; }
    if (k === 'n' || k === 'N') { setNotes(!PR.notesOn); return true; }
    if (k === 'f' || k === 'F') { toggleFullscreen(); return true; }
    return true;   // swallow everything else while presenting
  }

  /* ======================= Presenter view ======================= */

  let presenterOn = false;
  let legendTimer = null;
  let pillTimer = null;
  let mixIndex = 0;

  // Donors that read well over most bases (the owner's favourites), tried in turn.
  const MIX_DONORS = ['holo-iridescent', 'xerox', 'mesh-gradient', 'naive-doodle', 'blob-tracking', 'acid-graphics'];

  const BEATS = [
    { key: '1', label: 'Reveal', run: beatReveal },
    { key: '2', label: 'Worlds', run: beatWorlds },
    { key: '3', label: 'Mix in', run: () => beatMix() },
    { key: '4', label: 'See it built', run: beatBuilt },
    { key: '5', label: 'Deck', run: () => present(0) },
  ];

  function chrome() {
    let el = document.getElementById('showChrome');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'showChrome';
    el.className = 'show-chrome';
    el.innerHTML = `
      <div class="show-legend" role="note" aria-label="Presenter keys">
        ${BEATS.map(b => `<span data-beat="${b.key}"><kbd>${b.key}</kbd>${esc(b.label)}</span>`).join('')}
        <span class="show-legend-sep"><kbd>←</kbd><kbd>→</kbd>Style</span>
        <span><kbd>Esc</kbd>Exit</span>
      </div>
      <p class="show-pill" aria-live="polite"></p>
      <button type="button" class="show-exit" title="Exit presenter view (Esc)">Exit presenter view</button>
      <p class="show-demo-hint">Demo running · press any key to take over</p>`;
    document.body.appendChild(el);
    el.querySelector('.show-exit').addEventListener('click', () => presenter(false));
    return el;
  }

  function showLegend(ms) {
    const el = chrome();
    el.classList.add('show-legend-on');
    clearTimeout(legendTimer);
    legendTimer = setTimeout(() => el.classList.remove('show-legend-on'), ms || 4200);
  }

  function pill(msg) {
    const el = chrome().querySelector('.show-pill');
    el.textContent = msg;
    el.classList.add('is-on');
    clearTimeout(pillTimer);
    pillTimer = setTimeout(() => el.classList.remove('is-on'), 1800);
  }

  function presenter(on) {
    const want = on === undefined ? !presenterOn : !!on;
    if (want && !inEditor()) return false;
    if (want === presenterOn) return presenterOn;
    presenterOn = want;
    document.body.classList.toggle('is-presenter', want);
    chrome();
    if (want) {
      window.scrollTo(0, 0);
      if (!D) showLegend();
    } else {
      document.getElementById('showChrome').classList.remove('show-legend-on');
    }
    // The board measures its own width: let it re-fit to the new column.
    window.dispatchEvent(new Event('resize'));
    syncMenu();
    return presenterOn;
  }

  function setView(v) {
    if (typeof setBoardView === 'function' && typeof boardView !== 'undefined' && boardView !== v) setBoardView(v);
  }

  function callBeat(name, arg) {
    if (!has(name)) return undefined;
    try { const r = Show[name](arg); return r === undefined ? true : r; } catch (err) { return false; }
  }

  function beatReveal() {
    setView('board');
    window.scrollTo(0, 0);
    if (callBeat('reveal') !== undefined) return;
    // No reveal yet: a plain fade-up of the board.
    const card = document.getElementById('previewCard');
    if (card && !reduceMotion()) {
      card.classList.remove('show-fadeup');
      void card.offsetWidth;
      card.classList.add('show-fadeup');
    }
  }

  function beatWorlds() {
    if (callBeat('worlds') !== undefined) return;
    setView('compare');   // Compare all: every aesthetic at once
    window.scrollTo(0, 0);
  }

  function mixDonor() {
    const base = state.aesthetic;
    const known = k => typeof aestheticByKey === 'function' && AESTHETICS.some(a => a.key === k);
    const pool = MIX_DONORS.filter(k => k !== base && known(k));
    if (!pool.length) return null;
    const k = pool[mixIndex % pool.length];
    mixIndex++;
    return k;
  }

  function canMix() {
    return typeof BLEND_ENABLED !== 'undefined' && BLEND_ENABLED && typeof blendPreset === 'function' && typeof normalizeBlend === 'function';
  }

  // quiet: the demo loop's mix, kept out of the undo history.
  function beatMix(quiet) {
    if (!canMix()) { pill('Mixing is not available'); return false; }
    setView('board');
    window.scrollTo(0, 0);
    const donor = mixDonor();
    if (!donor) return false;
    const next = { with: donor, strength: 'balanced', channels: blendPreset('balanced') };
    if (typeof blendSetState === 'function' && !quiet) blendSetState(next);
    else { state.blend = normalizeBlend(next, state.aesthetic); render(); }
    pill(`3 · Mixed in ${aestheticByKey(donor).name}`);
    return true;
  }

  function beatBuilt() {
    const r = callBeat('built', 'dashboard');
    if (r === undefined) { pill('See it built is not available yet'); return false; }
    return r;
  }

  function runBeat(b) {
    if (b.key !== '3') pill(`${b.key} · ${b.label}`);
    b.run();
  }

  // A beat overlay (reveal, worlds) or a dialog is up.
  function overlayOpen() {
    return [...document.querySelectorAll('[aria-modal="true"]:not(.pr), [role="dialog"]:not(.pr)')]
      .some(el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');
  }

  function onPresenterKey(e) {
    if (!presenterOn) return false;
    // An open overlay owns the keys: Escape closes it first, beats wait for it.
    if (overlayOpen()) return false;
    if (e.key === 'Escape') {
      if (synthEsc || e.defaultPrevented) return false;
      // Compare or Built goes back to the board first.
      if (typeof boardView !== 'undefined' && boardView !== 'board') { setView('board'); return true; }
      presenter(false);
      return true;
    }
    if (keysBlocked(e)) return false;
    const beat = BEATS.find(b => b.key === e.key);
    if (beat) { runBeat(beat); return true; }
    if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && typeof stepAesthetic === 'function' && !e.shiftKey) {
      setView('board');
      stepAesthetic(e.key === 'ArrowRight' ? 1 : -1);
      return true;
    }
    if (e.key === '?' || e.key === 'h' || e.key === 'H') { showLegend(); return true; }
    return false;
  }

  /* ======================= Demo loop ======================= */

  let D = null;   // the running demo
  // Strong, varied looks for the attract loop's switches (the owner's favourites).
  const DEMO_LOOKS = ['dystopian-luxury', 'blob-tracking', 'mesh-gradient', 'old-web', 'acid-graphics', 'micrographics',
    'soft-form', 'xerox-punk', 'gorpcore', 'aurora-noir', 'radical-memphis', 'industrial-device'];

  function saveLook() {
    return {
      aesthetic: state.aesthetic, aestheticVersion: state.aestheticVersion, blend: state.blend ? JSON.parse(JSON.stringify(state.blend)) : null,
      bgMode: state.bgMode, shapePreset: state.shapePreset,
    };
  }
  // quiet: put the values back without a render (the caller renders next).
  function restoreLook(saved, quiet) {
    if (!saved) return;
    const same = Object.keys(saved).every(k => JSON.stringify(state[k]) === JSON.stringify(saved[k]));
    if (same) return;
    Object.assign(state, saved, { blend: saved.blend ? JSON.parse(JSON.stringify(saved.blend)) : null });
    if (!quiet) render();
  }
  function switchLook(key) {
    if (typeof applyAesthetic !== 'function' || !AESTHETICS.some(a => a.key === key)) return;
    state.blend = null;
    applyAesthetic(key);
    render();
  }

  function dwell(ms) {
    const tok = D;
    return new Promise(resolve => {
      if (!tok) return resolve(false);
      const t = setTimeout(() => resolve(D === tok), ms);
      tok.timers.push(t);
      tok.wakers.push(() => { clearTimeout(t); resolve(false); });
    });
  }

  // Let a beat play for `ms`, close it, then give its close animation (its promise,
  // when it returns one) up to 2.5s to finish. False once the demo has stopped.
  async function playBeat(name, arg, ms) {
    const ret = callBeat(name, arg);
    if (!await dwell(ms)) return false;
    dismissBeats();
    if (ret && typeof ret.then === 'function') await Promise.race([Promise.resolve(ret).catch(() => {}), dwell(2500)]);
    return !!D;
  }

  function dismissBeats() {
    if (has('dismiss')) { try { Show.dismiss(); } catch (err) { /* keep going */ } }
    // Most overlays close on Escape; this file's handlers ignore this one.
    synthEsc = true;
    try {
      const target = document.activeElement && document.activeElement !== document.body ? document.activeElement : document;
      target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true, cancelable: true }));
    } finally {
      synthEsc = false;
    }
  }

  async function demoCycle(n) {
    const tok = D;
    const alive = () => D === tok;
    restoreLook(tok.saved);
    setView('board');
    window.scrollTo(0, 0);

    // 1. Reveal
    if (has('reveal')) { if (!await playBeat('reveal', undefined, 6500)) return; }
    else { beatReveal(); if (!await dwell(2600)) return; }
    if (!await dwell(500)) return;

    // 2. Worlds
    if (has('worlds')) { if (!await playBeat('worlds', undefined, 7500)) return; }
    else { setView('compare'); window.scrollTo(0, 0); if (!await dwell(5200)) return; setView('board'); }
    if (!await dwell(500)) return;

    // 3. A few aesthetic switches
    const looks = DEMO_LOOKS.filter(k => k !== tok.saved.aesthetic && AESTHETICS.some(a => a.key === k));
    for (let j = 0; j < 3 && looks.length; j++) {
      switchLook(looks[(n * 3 + j) % looks.length]);
      window.scrollTo(0, 0);
      if (!await dwell(3400)) return;
    }

    // 4. Mix in a second style (back on the brand's own look, in one render)
    if (canMix()) {
      restoreLook(tok.saved, true);
      if (beatMix(true)) { if (!await dwell(4200)) return; }
    }
    restoreLook(tok.saved);
    if (!alive()) return;

    // 5. See it built
    if (has('built')) {
      if (!await dwell(400)) return;
      if (!await playBeat('built', 'dashboard', 7500)) return;
      setView('board');
      if (!await dwell(600)) return;
    }

    // 6. Three deck slides
    if (present(0, { auto: true, fullscreen: false })) {
      for (let s = 1; s < 3; s++) {
        if (!await dwell(3400)) return;
        next();
      }
      if (!await dwell(3400)) return;
      exitPresent();
    }
    if (!await dwell(400)) return;
  }

  async function runDemo() {
    const tok = D;
    for (let n = 0; D === tok; n++) {
      try { await demoCycle(n); } catch (err) { if (D === tok) await dwell(1000); }
    }
  }

  function demoTakeover(e) {
    if (!D || !e.isTrusted) return;
    if (e.type === 'keydown' && ['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    stopDemo();
  }

  const TAKEOVER = ['pointerdown', 'wheel', 'touchstart'];   // keys: onKeydown

  function startDemo() {
    if (D) return true;
    if (!inEditor() || typeof state === 'undefined') return false;
    if (PR) exitPresent();
    D = { saved: saveLook(), wasPresenter: presenterOn, timers: [], wakers: [] };
    presenter(true);
    document.body.classList.add('is-demo');
    TAKEOVER.forEach(t => window.addEventListener(t, demoTakeover, { capture: true, passive: false }));
    syncMenu();
    runDemo();
    return true;
  }

  function stopDemo() {
    if (!D) return false;
    const tok = D;
    D = null;
    tok.timers.forEach(clearTimeout);
    tok.wakers.forEach(w => w());
    TAKEOVER.forEach(t => window.removeEventListener(t, demoTakeover, { capture: true }));
    if (PR) exitPresent();
    dismissBeats();
    restoreLook(tok.saved);
    setView('board');
    document.body.classList.remove('is-demo');
    presenter(tok.wasPresenter);
    syncMenu();
    return true;
  }

  /* ======================= keys, buttons, menu ======================= */

  function onKeydown(e) {
    // The demo loop: a real key takes over; the loop's own synthetic Escape passes through.
    if (D) { if (e.isTrusted) demoTakeover(e); return; }
    let handled = false;
    if (PR) handled = onPresentKey(e);
    else if (presenterOn) handled = onPresenterKey(e);
    if (!handled && !PR && !e.repeat && (e.key === 'p' || e.key === 'P') && !e.shiftKey && inEditor() && !keysBlocked(e)) {
      presenter();
      handled = true;
    }
    if (handled) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }

  // While presenting, Space's keyup (Space-hold features) stays inside the show.
  function onKeyup(e) {
    if (PR && !PR.auto) { e.stopImmediatePropagation(); }
  }

  function syncMenu() {
    const item = document.querySelector('[data-show="presenter"]');
    if (item) item.setAttribute('aria-checked', String(presenterOn));
    const demo = document.querySelector('[data-show="demo"] .tb-label');
    if (demo) demo.textContent = D ? 'Stop the demo loop' : 'Run the demo loop';
  }

  function wireMenu() {
    const btn = document.getElementById('showMenuBtn');
    const menu = document.getElementById('showMenu');
    if (!btn || !menu) return;
    const open = on => {
      menu.hidden = !on;
      btn.setAttribute('aria-expanded', String(on));
      if (on) { syncMenu(); const first = menu.querySelector('[role^="menuitem"]'); if (first) first.focus(); }
    };
    // No stopPropagation: a click here must still close the Share menu (and the reverse).
    btn.addEventListener('click', () => open(menu.hidden));
    document.addEventListener('click', e => { if (!menu.hidden && !menu.contains(e.target) && !btn.contains(e.target)) open(false); });
    menu.addEventListener('keydown', e => {
      const items = [...menu.querySelectorAll('[role^="menuitem"]')];
      const i = items.indexOf(document.activeElement);
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); open(false); btn.focus(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
      else if (e.key === 'Home') { e.preventDefault(); items[0].focus(); }
      else if (e.key === 'End') { e.preventDefault(); items[items.length - 1].focus(); }
      else if (e.key === 'Tab') open(false);
    });
    menu.addEventListener('click', e => {
      const item = e.target.closest('[data-show]');
      if (!item) return;
      open(false);
      const what = item.dataset.show;
      if (what === 'reveal') { if (typeof Show.reveal === 'function') Show.reveal(); }
      else if (what === 'worlds') { if (typeof Show.worlds === 'function') Show.worlds(); }
      else if (what === 'present') present(0);
      else if (what === 'presenter') presenter();
      else if (what === 'demo') { if (D) stopDemo(); else startDemo(); }
    });
  }

  // ?demo=1: open the most recent brand and start the loop. An empty library gets the
  // showcase brands (the same set its empty state offers) rather than a made-up one.
  async function demoFromUrl() {
    let flag = null;
    try { flag = new URLSearchParams(location.search).get('demo'); } catch (err) { return; }
    if (flag !== '1' && flag !== 'true') return;
    const until = async (test, ms) => { const t0 = Date.now(); while (!test() && Date.now() - t0 < ms) await new Promise(r => setTimeout(r, 150)); return test(); };
    await new Promise(r => setTimeout(r, 600));
    if (!inEditor() && typeof BrandSession !== 'undefined' && typeof LibraryStore !== 'undefined') {
      try {
        let rows = await LibraryStore.list();
        if ((!rows || !rows.length) && window.ShowcaseBrands && typeof ShowcaseBrands.load === 'function') {
          await ShowcaseBrands.load();
          if (typeof LibraryUI !== 'undefined' && typeof LibraryUI.refresh === 'function') await LibraryUI.refresh();
          rows = await LibraryStore.list();
        }
        if (!rows || !rows.length) return;
        rows.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        await BrandSession.openBrand(rows[0].id);
      } catch (err) { return; }
    }
    if (!await until(inEditor, 4000)) return;
    await new Promise(r => setTimeout(r, 1200));
    startDemo();
  }

  function init() {
    window.addEventListener('keydown', onKeydown, true);
    window.addEventListener('keyup', onKeyup, true);
    const deckBtn = document.getElementById('presentDeck');
    if (deckBtn) deckBtn.addEventListener('click', () => present(0));
    wireMenu();
    demoFromUrl();
  }

  Show.present = present;
  Show.exitPresent = exitPresent;
  Show.presenter = presenter;
  Show.demoLoop = on => (on === false ? stopDemo() : startDemo());
  Show.stopDemo = stopDemo;
  Show.isPresenting = () => !!PR;
  Show.isPresenter = () => presenterOn;
  Show.isDemo = () => !!D;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
