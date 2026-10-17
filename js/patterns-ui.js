/* ---------------------------------------------------------------------
   patterns-ui.js — the "Patterns" workspace view (third option next to
   Board and Compare all) and the brief-cart storage shared with persistence,
   the deck, the AI brief and the cart tray (js/pattern-cart.js).

   Needs js/patterns/* (the engine, families and aesthetic fit), app.js
   (state, render, showToast, copyText), aesthetic-board.js (the view toggle
   calls PatternsUI.setVisible) and brand-deck.js (bdSaveBlob, brandFileSlug).

   - PatternPins: the patterns "in your brief" (state.patterns, the shopping
     cart; the name is historical). A list of immutable
     { key, params, colorway, seed, use, svg } entries (max PIN_MAX). Always
     replace the array and the entries, never mutate them, so undo snapshots
     stay valid. params.tone (0..1, 1 = full strength, the "Strength" slider) is
     part of params, so an entry remembers how quiet it is. `use` is where the
     pattern goes on the page (one of USES); `svg` says whether the AI brief
     should paste the SVG code (vector families only). Saved brands from before
     `use` / `svg` existed load with the family default.
   - PatternsUI: the view. UI-only working pattern (not saved); the brief list
     is what persists. Nothing renders while the view is hidden.
------------------------------------------------------------------------ */

const PatternPins = (function () {
  const PIN_MAX = 8;
  const SUITE_SEED = 'brand';   // seed behind the suite thumbnails, the deck wall and the default canvas

  // Where a pattern goes. The AI brief turns each value into placement rules.
  const USES = [
    { value: 'hero', label: 'Hero background' },
    { value: 'band', label: 'Section band' },
    { value: 'card', label: 'Card texture' },
    { value: 'divider', label: 'Divider strip' },
    { value: 'accent', label: 'Accent detail' },
  ];
  // Default role per family (anything not listed is a hero background).
  const USE_BY_FAMILY = {
    aura: 'hero', terrain: 'hero', flow: 'hero', counterchange: 'hero', arcrise: 'hero', oprings: 'hero', modulargrid: 'hero',
    halftone: 'card', stipple: 'card', glyphgrid: 'card', pixelquilt: 'card',
    zigzag: 'divider', chevron: 'divider',
    weave: 'band', signal: 'band', tornbands: 'band', gradpanes: 'band', typeterrain: 'band',
    thermal: 'hero', cutup: 'hero', sonar: 'hero', inkstill: 'hero', warpcheck: 'hero', burst: 'hero', ribbonrise: 'band',
    neonspray: 'hero', bloomgrid: 'hero', kaleidopix: 'hero', pixelgrid: 'card', parcels: 'card', prismpix: 'hero', totem: 'band',
    slipgrid: 'band', tokens: 'card', relief: 'card', colony: 'hero', tissue: 'card', seafan: 'hero', pebbles: 'card', marble: 'hero',
    thermalstreak: 'band', waves: 'hero', snow: 'band', onebit: 'band', satellite: 'hero', panels: 'hero', flyposter: 'hero',
    festival: 'hero', patchwork: 'card', specimens: 'card', sprigs: 'card', blades: 'card', rods: 'band',
  };
  const defaultUse = key => USE_BY_FAMILY[key] || 'hero';
  const useLabel = v => (USES.find(u => u.value === v) || USES[0]).label;

  function colorways() { return window.Patterns ? Patterns.E.COLORWAYS.map(c => c.value) : ['brand']; }

  // Clean one entry (from a saved file or the UI) into the stored shape, or null.
  function normalize(raw) {
    const P = window.Patterns;
    if (!P || !raw || typeof raw !== 'object' || typeof raw.key !== 'string' || !P.get(raw.key)) return null;
    const colorway = colorways().includes(raw.colorway) ? raw.colorway : 'brand';
    const seed = String(raw.seed == null || raw.seed === '' ? 'brand' : raw.seed).slice(0, 40);
    const vector = !!P.get(raw.key).vector;
    const use = USES.some(u => u.value === raw.use) ? raw.use : defaultUse(raw.key);
    const svg = vector && (raw.svg == null ? true : !!raw.svg);
    return { key: raw.key, params: P.resolve(raw.key, raw.params || {}), colorway, seed, use, svg };
  }

  function normalizeList(list) {
    return (Array.isArray(list) ? list : []).map(normalize).filter(Boolean).slice(0, PIN_MAX);
  }

  // Stable identity of a pattern (family, colorway, seed and every parameter). `use` and
  // `svg` are choices about the pattern, not part of which pattern it is.
  function sig(p) {
    const n = normalize(p);
    return n ? [n.key, n.colorway, n.seed, JSON.stringify(n.params)].join('|') : '';
  }

  // Identity plus the choices (use, svg): changes when anything the cart shows changes.
  function fullSig(p) {
    const n = normalize(p);
    return n ? sig(n) + '|' + n.use + '|' + (n.svg ? 1 : 0) : '';
  }

  const list = () => (Array.isArray(state.patterns) ? state.patterns : []);
  const indexOf = entry => { const s = sig(entry); return s ? list().findIndex(p => sig(p) === s) : -1; };
  const has = entry => indexOf(entry) >= 0;

  // Undoable, marks the brand unsaved, re-renders everything that shows the list.
  function commit(next, message) {
    pushUndoSnapshot(state);
    state.patterns = next;
    render();
    if (message) showToast(message);
  }

  // Add the pattern, or take it out when it is already in the brief.
  function toggle(entry) {
    const e = normalize(entry);
    if (!e) return null;
    const at = indexOf(e);
    if (at >= 0) { commit(list().filter((_, i) => i !== at), 'Removed from brief'); return 'removed'; }
    if (list().length >= PIN_MAX) { showToast(`Brief is full (${PIN_MAX} patterns). Remove one first`); return 'full'; }
    commit(list().concat([e]), 'Added to brief');
    if (typeof PatternCart !== 'undefined') PatternCart.pulse();
    return 'added';
  }

  function removeAt(i) {
    if (!list()[i]) return;
    commit(list().filter((_, k) => k !== i), 'Removed from brief');
  }

  // Change the use / svg choice of item i (a new object; one undo step).
  function patch(i, change) {
    const cur = list()[i];
    if (!cur) return;
    const next = normalize(Object.assign({}, cur, change));
    if (!next || fullSig(next) === fullSig(cur)) return;
    commit(list().map((p, k) => (k === i ? next : p)));
  }

  return { PIN_MAX, SUITE_SEED, USES, defaultUse, useLabel, normalize, normalizeList, sig, fullSig, list, indexOf, has, commit, toggle, removeAt, patch };
})();

const PatternsUI = (function () {
  const SUITE_SEED = PatternPins.SUITE_SEED;
  const THUMB_W = 240;
  const THUMB_H = 135;
  // Where a pattern can be sent. `frame` is the preview that goes with it; `calm` says the
  // "Calm area for text" option applies (a title or icons sit on that surface); size is the exact
  // export size in pixels (the desktop is this screen's, see screenSize()).
  const DESTS = [
    { id: 'desktop', label: "This Mac's desktop", frame: 'desktop', calm: true, slug: 'desktop' },
    { id: 'iphone', label: 'iPhone wallpaper', w: 1290, h: 2796, frame: 'phone', slug: 'iphone' },
    { id: 'slide', label: 'Slide 16:9', w: 1920, h: 1080, frame: 'slide', calm: true, slug: 'slide' },
    { id: 'slide4k', label: 'Slide 16:9 4K', w: 3840, h: 2160, frame: 'slide', calm: true, slug: 'slide-4k' },
    { id: 'square', label: 'Square', w: 2160, h: 2160, frame: 'plain', slug: 'square' },
    { id: 'portrait', label: 'Portrait 4:5', w: 2160, h: 2700, frame: 'plain', slug: 'portrait' },
    { id: 'tile', label: 'Seamless tile', w: 512, h: 512, frame: 'plain', slug: 'tile', tile: true },
    { id: 'custom', label: 'Custom\u2026', frame: 'plain', slug: 'custom' },
  ];
  const FRAMES = [
    { id: 'plain', label: 'Plain' },
    { id: 'desktop', label: 'Desktop', dest: 'desktop' },
    { id: 'phone', label: 'Phone lock screen', dest: 'iphone' },
    { id: 'slide', label: 'Slide', dest: 'slide' },
  ];
  const CUSTOM_MAX = 8192, CUSTOM_MIN = 16, MAX_PIXELS = 36e6;
  const SEND_KEY = 'bd-patterns-send';
  const LEGACY_EXPORTS = { png1: [1280, 720, '1x'], png2: [2560, 1440, '2x'], png4k: [3840, 2160, '4k'] };   // makeExport() callers from before destinations
  const CALM_STOPS = [[0, 0.92], [0.28, 0.92], [0.38, 0.84], [0.48, 0.56], [0.58, 0.24], [0.66, 0.07], [0.72, 0]];   // alpha of the ground colour, left to right

  const $ = id => document.getElementById(id);
  const P = () => window.Patterns;

  let root = null;            // #patternsView
  let canvas = null;
  let visible = false;
  let built = false;
  let cur = null;             // working pattern { key, params, colorway, seed }
  let origin = null;          // suite index the working pattern came from, or null
  let pristine = false;       // still exactly that suite preset
  let lastAesthetic = null;
  let lastBrandSig = '';
  let lastPinSig = null;
  let lastRenderSig = '';
  let refreshTimer = null;
  let fastTimer = null;
  let settleTimer = null;
  let queue = [];
  let pumping = false;
  // where the pattern is going (remembered): destination, preview frame, calm area, custom size
  const send = { dest: 'desktop', frame: 'desktop', calm: false, cw: 1920, ch: 1080 };
  let macScreen = null;       // { w, h } in pixels, from the Mac app (NSScreen.main x backingScaleFactor)
  const thumbCache = new Map();

  const ICO = d => `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const PLUS = ICO('<path d="M12 5v14M5 12h14"/>');
  const CHECK = ICO('<path d="m5 12.5 4.5 4.5L19 7.5"/>');

  /* ---------------- helpers ---------------- */

  // The rendered view (js/blend.js): a blend can tint the canvas (color) and mix the suite (patterns).
  const view = () => abView();
  const inksFor = entry => P().inksFor(typeof aestheticView === 'function' ? boardTokens(state, view().def) : state, entry.colorway, { tints: !!(entry.params && entry.params.tints) });
  const suite = () => (typeof blendSuite === 'function' ? blendSuite(view().def) : P().suiteFor(state.aesthetic));
  const famInfo = key => fams.find(f => f.key === key) || P().list().find(f => f.key === key);
  const colorwayLabel = v => (P().E.COLORWAYS.find(c => c.value === v) || {}).label || v;
  const entryOf = (key, params, colorway, seed) => PatternPins.normalize({ key, params, colorway, seed });
  const randomSeed = () => 'v' + Math.random().toString(36).slice(2, 7);
  const pins = () => (Array.isArray(state.patterns) ? state.patterns : []);
  const curTone = () => (cur && cur.params && cur.params.tone != null ? cur.params.tone : 1);

  // The aesthetic, plus the blend's donor and channels when one is active.
  function aeSig() {
    const d = view().def;
    return d.blend ? d.key + '>' + d.blend.donor.key + ':' + Object.keys(d.blend.channels).filter(c => d.blend.channels[c]).join(',') : d.key;
  }

  function brandSig() {
    const k = P().inksFor(typeof aestheticView === 'function' ? boardTokens(state, view().def) : state, 'brand');
    return [aeSig(), k.ground, k.ink1, k.ink2, k.spark, k.deep].join('|');
  }

  /* ---------------- thumbnails (lazy, cached) ---------------- */

  function drawThumb(cv) {
    const entry = cv._mk && cv._mk();
    if (!entry) return;
    const inks = inksFor(entry);
    const key = [entry.key, JSON.stringify(entry.params), entry.colorway, entry.seed, inks.ground, inks.ink1, inks.ink2, inks.spark, inks.deep, inks.t1, inks.t2].join('|');
    if (cv._drawn === key) return;
    let off = thumbCache.get(key);
    if (!off) {
      off = document.createElement('canvas');
      P().render(off, entry.key, entry.params, inks, entry.seed, { width: THUMB_W, height: THUMB_H, dpr: 1, setStyle: false });
      thumbCache.set(key, off);
      if (thumbCache.size > 220) thumbCache.delete(thumbCache.keys().next().value);
    }
    cv.width = off.width;
    cv.height = off.height;
    cv.getContext('2d').drawImage(off, 0, 0);
    cv._drawn = key;
  }

  function pump() {
    const t0 = performance.now();
    while (queue.length && performance.now() - t0 < 14) {
      const cv = queue.shift();
      if (cv.isConnected) drawThumb(cv);
    }
    if (queue.length) requestAnimationFrame(pump); else pumping = false;
  }

  function queueThumbs(list) {
    queue = queue.concat(list);
    if (!pumping && queue.length) { pumping = true; requestAnimationFrame(pump); }
  }

  function redrawThumbs() {
    queue = [];
    pumping = false;
    // visible-first order: suite, in your brief, then the family picker (on-screen tiles only)
    const order = ['#ptSuite canvas', '#ptPins canvas'];
    queueThumbs(order.flatMap(sel => Array.from(root.querySelectorAll(sel))));
    queuePicker();
  }

  /* ---------------- family picker: categories, search, lazy thumbnails ---------------- */

  let fams = [];                       // P().list(), with a lowercase search haystack
  const famFilter = { cat: '', q: '' };   // cat '' = All
  let thumbIO = null;

  // Redraw the picker thumbnails that are on screen (or about to be); the rest draw when scrolled in.
  function queuePicker() {
    const host = $('ptPicker');
    if (!host) return;
    const cvs = Array.from(host.querySelectorAll('.pt-fam-wrap:not([hidden]) canvas'));
    queueThumbs(thumbIO ? cvs.filter(c => c._vis) : cvs);
  }

  function famMatches(f, terms) {
    return terms.every(t => f._hay.indexOf(t) >= 0);
  }

  function applyFilter() {
    const terms = famFilter.q.toLowerCase().split(/\s+/).filter(Boolean);
    const counts = {};
    let shown = 0;
    const byKey = {};
    fams.forEach(f => {
      const m = famMatches(f, terms);
      if (m) counts[f.category] = (counts[f.category] || 0) + 1;
      byKey[f.key] = m && (!famFilter.cat || f.category === famFilter.cat);
      if (byKey[f.key]) shown++;
    });
    $('ptPicker').querySelectorAll('.pt-fam-wrap').forEach(w => { w.hidden = !byKey[w.dataset.key]; });
    const matched = Object.keys(counts).reduce((n, k) => n + counts[k], 0);
    root.querySelectorAll('.pt-cat').forEach(b => {
      const cat = b.dataset.cat;
      const n = cat ? (counts[cat] || 0) : matched;
      b.querySelector('i').textContent = n;
      b.setAttribute('aria-pressed', String(cat === famFilter.cat));
      b.classList.toggle('is-empty', n === 0);
    });
    $('ptFamCount').textContent = shown === fams.length ? `${fams.length} generators` : `${shown} of ${fams.length} generators`;
    $('ptFamEmpty').hidden = shown > 0;
    $('ptFamSearchX').hidden = !famFilter.q;
  }

  function setFilter(change) {
    Object.assign(famFilter, change);
    applyFilter();
  }

  /* ---------------- markup ---------------- */

  // chip: small colorway pill in the thumbnail's bottom-left corner
  function tileHtml(kind, i, caption, sub, chip) {
    return `<div class="pt-tile" data-kind="${kind}" data-i="${i}">
      <button type="button" class="pt-tile-main" aria-label="${escapeHtml(caption + (sub ? ', ' + sub : '') + (chip ? ', ' + chip : ''))}">
        <span class="pt-thumb"><canvas width="${THUMB_W}" height="${THUMB_H}" aria-hidden="true"></canvas>${chip ? `<span class="pt-chip" aria-hidden="true">${escapeHtml(chip)}</span>` : ''}</span>
        <span class="pt-tile-cap"><b>${escapeHtml(caption)}</b>${sub ? `<i>${escapeHtml(sub)}</i>` : ''}</span>
      </button>
    </div>`;
  }

  function build() {
    const cws = P().E.COLORWAYS;
    root.innerHTML = `
      <div class="pt-layout">
        <div class="pt-main">
          <div class="pt-stage">
            <div class="pt-send" role="group" aria-label="Send the pattern">
              <span class="pt-label">Send to</span>
              <div class="pt-pills" id="ptDests" role="radiogroup" aria-label="Destination">
                ${DESTS.map(d => `<button type="button" class="pt-pill" role="radio" data-dest="${d.id}" aria-checked="false">${escapeHtml(d.label)}</button>`).join('')}
              </div>
              <div class="pt-custom" id="ptCustom" hidden>
                <label class="pt-label" for="ptCW">Width</label><input type="number" id="ptCW" min="${CUSTOM_MIN}" max="${CUSTOM_MAX}" step="1" inputmode="numeric" />
                <span aria-hidden="true">\u00d7</span>
                <label class="pt-label" for="ptCH">Height</label><input type="number" id="ptCH" min="${CUSTOM_MIN}" max="${CUSTOM_MAX}" step="1" inputmode="numeric" />
                <span class="pt-size-unit">px</span>
              </div>
            </div>
            <div class="pt-exports" role="group" aria-label="Add to brief and export">
              <button type="button" class="btn btn-small pt-pin" id="ptPin" aria-pressed="false"></button>
              <button type="button" class="btn btn-small pt-export" id="ptExport" data-export="dest">Export PNG</button>
              <button type="button" class="btn btn-small pt-setdesk" id="ptSetDesk" data-export="wallpaper" hidden>Set as desktop picture</button>
              <span class="pt-size" id="ptSize" aria-live="polite"></span>
              <span class="pt-exports-more">
                <button type="button" class="btn btn-ghost btn-small" data-export="svg">SVG</button>
                <button type="button" class="btn btn-ghost btn-small" data-export="css">Copy CSS tile</button>
              </span>
            </div>
            <div class="pt-canvas-wrap" id="ptWrap" data-frame="plain">
              <canvas id="ptCanvas" aria-label="Pattern preview"></canvas>
              <div class="pt-fr pt-fr-desktop" aria-hidden="true">
                <div class="pt-fr-menubar"><b class="pt-fr-apple"></b><b class="pt-fr-app" id="ptFrApp"></b><i></i><i></i><i></i><span class="pt-fr-clock">Tue 9:41</span></div>
                <div class="pt-fr-icons"><div><u></u><em>Brand files</em></div><div><u></u><em>Exports</em></div><div><u></u><em>Notes</em></div></div>
                <div class="pt-fr-dock"><u></u><u></u><u></u><u></u><u></u><u></u></div>
              </div>
              <div class="pt-fr pt-fr-phone" aria-hidden="true">
                <span class="pt-fr-notch"></span>
                <div class="pt-fr-lock"><span class="pt-fr-date" id="ptFrDate"></span><b class="pt-fr-time">9:41</b></div>
                <span class="pt-fr-btn pt-fr-btn-l"></span><span class="pt-fr-btn pt-fr-btn-r"></span>
                <span class="pt-fr-home"></span>
              </div>
              <div class="pt-fr pt-fr-slide" aria-hidden="true">
                <div class="pt-fr-copy"><small id="ptFrKick"></small><h4>Title goes here</h4><span class="pt-fr-rule"></span><p id="ptFrSub"></p></div>
              </div>
            </div>
            <div class="pt-namebar">
              <div class="pt-bar-name"><strong id="ptName"></strong><span id="ptTiming"></span></div>
              <div class="pt-frames">
                <div class="pt-pills" id="ptFrames" role="radiogroup" aria-label="Preview in">
                  <span class="pt-label">Preview</span>
                  ${FRAMES.map(f => `<button type="button" class="pt-pill" role="radio" data-frame="${f.id}" aria-checked="false">${escapeHtml(f.label)}</button>`).join('')}
                </div>
                <button type="button" class="pt-pill pt-calm" id="ptCalm" aria-pressed="false" title="Fade the pattern behind the left half so a title or icons stay readable. Applies to the preview and the export">Calm area for text</button>
              </div>
            </div>
          </div>
          <section class="pt-block pt-block-suite" aria-label="Brand suite">
            <div class="pt-block-head"><h3>Brand suite</h3><span id="ptSuiteFor"></span></div>
            <div class="pt-strip" id="ptSuite"></div>
          </section>
          <section class="pt-block pt-block-pins" aria-label="In your brief">
            <div class="pt-block-head"><h3>In your brief</h3><span id="ptPinCount"></span></div>
            <div class="pt-strip pt-strip-pins" id="ptPins"></div>
            <p class="pt-empty" id="ptPinsEmpty">Add a pattern to include it in the AI brief, with its colors, where to use it and the SVG. Patterns in your brief also appear in the brand deck.</p>
          </section>
          <section class="pt-block pt-block-fams" aria-label="All families">
            <div class="pt-block-head"><h3>All families</h3><span id="ptFamCount" aria-live="polite"></span></div>
            <div class="pt-famtools">
              <div class="pt-famsearch">
                <input type="text" id="ptFamSearch" placeholder="Search families" aria-label="Search families by name, look or category" autocomplete="off" spellcheck="false" inputmode="search" enterkeyhint="search" maxlength="40" />
                <button type="button" class="pt-famsearch-x" id="ptFamSearchX" aria-label="Clear search" hidden>${ICO('<path d="M6 6l12 12M18 6 6 18"/>')}</button>
              </div>
              <div class="pt-cats" id="ptCats" role="group" aria-label="Category"></div>
            </div>
            <div class="pt-picker" id="ptPicker" role="group" aria-label="Pattern family"></div>
            <p class="pt-empty" id="ptFamEmpty" hidden>No family matches that search. Clear it or pick another category.</p>
          </section>
        </div>
        <aside class="pt-side" aria-label="Pattern controls">
          <details class="pt-adjust" id="ptAdjust" open>
            <summary>Adjust pattern</summary>
            <div class="pt-adjust-body">
          <p class="pt-blurb" id="ptBlurb"></p>
          <div class="pt-group">
            <span class="pt-label">Colorway</span>
            <div class="segmented pt-seg" role="radiogroup" aria-label="Colorway">
              ${cws.filter(c => !c.fixed).map(c => `<label><input type="radio" name="ptColorway" value="${c.value}" /> ${escapeHtml(c.label)}</label>`).join('')}
            </div>${cws.some(c => c.fixed) ? `
            <span class="pt-label pt-label-sub">Fixed colours</span>
            <div class="segmented pt-seg pt-seg-fixed" role="radiogroup" aria-label="Fixed colorway">
              ${cws.filter(c => c.fixed).map(c => `<label title="${escapeHtml(c.note || '')}"><input type="radio" name="ptColorway" value="${c.value}" /> ${escapeHtml(c.label)}</label>`).join('')}
            </div>` : ''}
          </div>
          <div class="pt-group">
            <label class="pt-ctl" for="ptTone"><span class="pt-ctl-top"><span class="pt-label">Strength</span><output id="ptTone-o">100%</output></span>
              <input type="range" id="ptTone" min="0" max="100" step="5" value="100" /></label>
          </div>
          <div class="pt-group">
            <label class="pt-label" for="ptSeed">Seed</label>
            <div class="pt-seedrow">
              <input type="text" id="ptSeed" maxlength="40" spellcheck="false" autocomplete="off" />
              <button type="button" class="btn btn-ghost btn-small" id="ptReseed">New variation</button>
            </div>
          </div>
          <div class="pt-group"><span class="pt-label">Parameters</span><div id="ptControls" class="pt-controls"></div></div>
          <div class="pt-group"><span class="pt-label">Finish</span><div id="ptCommon" class="pt-controls"></div></div>
          <button type="button" class="btn btn-ghost btn-small btn-block" id="ptReset">Reset pattern</button>
            </div>
          </details>
        </aside>
      </div>`;
    canvas = $('ptCanvas');
    buildPicker();
    wire();
    built = true;
    const nw = nativeWall();
    if (nw) {
      nw.postMessage({ op: 'screen' }).then(r => {
        if (r && r.w > 0 && r.h > 0) { macScreen = { w: Math.round(r.w), h: Math.round(r.h) }; lastRenderSig = ''; syncSend(); renderMain(false); }
      }).catch(() => { /* older app build without the wallpaper bridge: window.screen is used */ });
    }
  }

  function buildPicker() {
    const P_ = P();
    fams = P_.list().map(f => Object.assign({}, f, { _hay: [f.name, f.key, f.blurb, f.category].join(' ').toLowerCase() }));
    const cats = (P_.CATEGORIES || []).filter(c => fams.some(f => f.category === c));
    $('ptCats').innerHTML = [''].concat(cats).map(c =>
      `<button type="button" class="pt-cat" data-cat="${escapeHtml(c)}" aria-pressed="${c === ''}">${escapeHtml(c || 'All')} <i>${c ? fams.filter(f => f.category === c).length : fams.length}</i></button>`).join('');
    $('ptPicker').innerHTML = fams.map(f => `<div class="pt-fam-wrap" data-key="${f.key}">
        <button type="button" class="pt-fam" data-key="${f.key}" aria-pressed="false" title="${escapeHtml(f.category + ': ' + f.blurb)}">
          <canvas width="${THUMB_W}" height="${THUMB_H}" aria-hidden="true"></canvas><span>${escapeHtml(f.name)}</span></button>
        ${addButton(false, f.name)}</div>`).join('');
    if (window.IntersectionObserver) {
      thumbIO = new IntersectionObserver(entries => {
        const now = [];
        entries.forEach(en => { en.target._vis = en.isIntersecting; if (en.isIntersecting) now.push(en.target); });
        if (now.length) queueThumbs(now);
      }, { rootMargin: '240px 0px' });
    }
    $('ptPicker').querySelectorAll('.pt-fam').forEach(btn => {
      const f = famInfo(btn.dataset.key);
      const cv = btn.querySelector('canvas');
      cv._mk = () => entryOf(f.key, Object.assign({}, f.defaults, { tone: curTone() }), cur ? cur.colorway : 'brand', SUITE_SEED);
      if (thumbIO) thumbIO.observe(cv);
    });
    applyFilter();
  }

  function buildSuite() {
    const list = suite();
    const def = view().def;
    $('ptSuiteFor').textContent = def.name;
    const host = $('ptSuite');
    const before = Array.from(host.querySelectorAll('canvas'));   // keep the old thumbnails on screen until the new ones are drawn
    host.innerHTML = list.map((s, i) => tileHtml('suite', i, s.name, famInfo(s.key).name, colorwayLabel(s.colorway))).join('');
    host.querySelectorAll('.pt-tile').forEach((tile, i) => {
      const s = list[i];
      const cv = tile.querySelector('canvas');
      cv._mk = () => entryOf(s.key, Object.assign(P().defaults(s.key), s.params), s.colorway, SUITE_SEED);
      if (before[i] && before[i].width && before[i].height) {
        cv.width = before[i].width; cv.height = before[i].height;
        cv.getContext('2d').drawImage(before[i], 0, 0);
      }
      tile.insertAdjacentHTML('beforeend', addButton(false, s.name));
    });
  }

  // The round add / in-brief button on a thumbnail (pressed = in the brief).
  function addLabel(on, name) { return (on ? 'Remove ' : 'Add ') + name + (on ? ' from brief' : ' to brief'); }
  function addButton(on, name) {
    return `<button type="button" class="pt-add" aria-pressed="${on}" aria-label="${escapeHtml(addLabel(on, name))}" title="${escapeHtml(addLabel(on, name))}">${on ? CHECK : PLUS}</button>`;
  }
  function setAddButton(b, on, name) {
    b.setAttribute('aria-pressed', String(on));
    b.setAttribute('aria-label', addLabel(on, name));
    b.title = addLabel(on, name);
    b.innerHTML = on ? CHECK : PLUS;
  }
  function setPinButton(btn, on) {
    btn.setAttribute('aria-pressed', String(on));
    btn.innerHTML = (on ? CHECK : PLUS) + (on ? 'In brief' : 'Add to brief');
    btn.title = on ? 'In your AI brief. Click to remove' : 'Add this pattern, with its colorway, seed and settings, to the AI brief';
  }

  function buildPins() {
    const list = pins();
    lastPinSig = list.map(PatternPins.fullSig).join('\n');
    const host = $('ptPins');
    host.innerHTML = list.map((p, i) => tileHtml('pin', i, famInfo(p.key).name, PatternPins.useLabel(p.use), colorwayLabel(p.colorway))).join('');
    host.querySelectorAll('.pt-tile').forEach((tile, i) => {
      const p = list[i];
      tile.querySelector('canvas')._mk = () => p;
      tile.insertAdjacentHTML('beforeend', addButton(true, famInfo(p.key).name));
    });
    $('ptPinsEmpty').hidden = list.length > 0;
    host.hidden = list.length === 0;
    $('ptPinCount').textContent = list.length ? `${list.length} of ${PatternPins.PIN_MAX}` : '';
  }

  function buildControls() {
    const schema = P().schema(cur.key);
    const ctl = s => {
      const id = 'ptc-' + s.key;
      const v = cur.params[s.key];
      if (s.type === 'range') {
        return `<label class="pt-ctl" for="${id}"><span class="pt-ctl-top"><span>${escapeHtml(s.label)}</span><output id="${id}-o">${v}</output></span>
          <input type="range" id="${id}" data-k="${s.key}" min="${s.min}" max="${s.max}" step="${s.step}" value="${v}" /></label>`;
      }
      if (s.type === 'select') {
        return `<label class="pt-ctl" for="${id}"><span class="pt-ctl-top"><span>${escapeHtml(s.label)}</span></span>
          <select id="${id}" data-k="${s.key}">${(s.options || []).map(o => {
    const val = typeof o === 'object' ? o.value : o;
    const lab = typeof o === 'object' ? (o.label || o.value) : o;
    return `<option value="${escapeHtml(val)}"${val === v ? ' selected' : ''}>${escapeHtml(lab)}</option>`;
  }).join('')}</select></label>`;
      }
      return `<label class="lock pt-tog" for="${id}">${escapeHtml(s.label)}<input type="checkbox" id="${id}" data-k="${s.key}"${v ? ' checked' : ''} /></label>`;
    };
    $('ptControls').innerHTML = schema.filter(s => !s.common).map(ctl).join('') || '<p class="pt-empty">No family controls.</p>';
    $('ptCommon').innerHTML = schema.filter(s => s.common && s.key !== 'tone').map(ctl).join('');
  }

  /* ---------------- state of the working pattern ---------------- */

  function setCurrent(entry, from) {
    cur = { key: entry.key, params: Object.assign({}, entry.params), colorway: entry.colorway, seed: entry.seed };
    origin = from == null ? null : from;
    pristine = from != null;
    syncPanel();
    renderMain(false);
  }

  function syncPanel() {
    const info = famInfo(cur.key);
    $('ptName').textContent = info.name;
    $('ptBlurb').textContent = `${info.blurb} ${info.vector ? 'Vector' : 'Raster'}${info.seamless ? ', seamless' : ''}.`;
    $('ptSeed').value = cur.seed;
    root.querySelectorAll('input[name="ptColorway"]').forEach(r => { r.checked = r.value === cur.colorway; });
    syncTone();
    buildControls();
    syncChrome();
    $('ptPicker').querySelectorAll('.pt-fam').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.key === cur.key)));
    queuePicker();   // picker follows the colorway
  }

  function syncTone() {
    const pct = Math.round(curTone() * 100);
    $('ptTone').value = pct;
    $('ptTone-o').textContent = pct + '%';
  }

  // Everything that depends on "which pattern is this" but not on its pixels.
  function syncChrome() {
    const info = famInfo(cur.key);
    root.querySelector('[data-export="svg"]').disabled = !info.vector;
    root.querySelector('[data-export="css"]').disabled = !info.seamless;
    root.querySelector('[data-export="svg"]').title = info.vector ? 'Download as SVG' : 'This family is raster only';
    root.querySelector('[data-export="css"]').title = info.seamless ? 'Copy a seamless 128px CSS background tile' : 'This family does not tile seamlessly';
    setPinButton($('ptPin'), isPinned(cur));
    // the seamless tile needs a family that tiles: fall back to a slide if the picked one cannot
    if (destOf(send.dest).tile && !info.seamless) { send.dest = 'slide'; send.frame = 'slide'; saveSend(); }
    syncSend();
    const reset = $('ptReset');
    reset.disabled = pristine;
    root.querySelectorAll('#ptSuite .pt-tile').forEach((t, i) => t.classList.toggle('is-on', pristine && origin === i));
    root.querySelectorAll('#ptSuite .pt-add').forEach((b, i) => {
      const s = suite()[i];
      const e = entryOf(s.key, Object.assign(P().defaults(s.key), s.params), s.colorway, SUITE_SEED);
      setAddButton(b, isPinned(e), s.name);
    });
    syncPickerAdds();
  }

  // Family tiles show a check when the exact pattern their thumbnail draws is in the brief.
  function syncPickerAdds() {
    root.querySelectorAll('#ptPicker .pt-fam-wrap').forEach(w => {
      const e = w.querySelector('canvas')._mk();
      setAddButton(w.querySelector('.pt-add'), !!e && isPinned(e), famInfo(w.dataset.key).name);
    });
  }

  function isPinned(entry) { return PatternPins.has(entry); }

  function edited() {
    pristine = false;
    $('ptReset').disabled = false;
    root.querySelectorAll('#ptSuite .pt-tile').forEach(t => t.classList.remove('is-on'));
    setPinButton($('ptPin'), isPinned(cur));
    syncPickerAdds();
  }

  /* ---------------- destinations, frames and the calm area ---------------- */

  const destOf = id => DESTS.find(d => d.id === id) || DESTS[0];
  const nativeWall = () => {
    const mh = window.webkit && window.webkit.messageHandlers;
    return mh && mh.wallpaper && typeof mh.wallpaper.postMessage === 'function' ? mh.wallpaper : null;
  };

  // This screen in real pixels: the Mac app asks AppKit (NSScreen x backingScaleFactor), a browser uses window.screen.
  function screenSize() {
    if (macScreen) return macScreen;
    const k = window.devicePixelRatio || 1;
    const s = window.screen || {};
    return { w: Math.round((s.width || 1440) * k), h: Math.round((s.height || 900) * k) };
  }

  function clampDim(v, fallback) {
    const n = Math.round(Number(v));
    return Number.isFinite(n) && n > 0 ? Math.min(CUSTOM_MAX, Math.max(CUSTOM_MIN, n)) : fallback;
  }

  // Exact export size of a destination.
  function sizeOf(id) {
    const d = destOf(id);
    if (d.id === 'desktop') return screenSize();
    if (d.id === 'custom') return { w: send.cw, h: send.ch };
    return { w: d.w, h: d.h };
  }

  function loadSend() {
    try {
      const j = JSON.parse(localStorage.getItem(SEND_KEY) || 'null');
      if (!j || typeof j !== 'object') return;
      if (DESTS.some(d => d.id === j.dest)) send.dest = j.dest;
      if (FRAMES.some(f => f.id === j.frame)) send.frame = j.frame;
      send.calm = !!j.calm;
      send.cw = clampDim(j.cw, send.cw);
      send.ch = clampDim(j.ch, send.ch);
    } catch (err) { /* private mode or bad JSON: keep the defaults */ }
  }
  function saveSend() {
    try { localStorage.setItem(SEND_KEY, JSON.stringify(send)); } catch (err) { /* ignore */ }
  }

  // The calm area only exists on surfaces that carry text or icons (desktop, slides).
  const calmOn = () => !!send.calm && !!destOf(send.dest).calm;

  // Soften the pattern behind the left half: the ground colour at ~90% fading to nothing, so a
  // title or icons stay readable. The same function runs for the preview and for every export.
  function applyCalm(cv, ground) {
    const W = cv.width, H = cv.height;
    const m = document.createElement('canvas');
    m.width = W; m.height = H;
    const g = m.getContext('2d');
    g.fillStyle = ground;
    g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'destination-in';
    const gr = g.createLinearGradient(0, 0, W, 0);
    CALM_STOPS.forEach(st => gr.addColorStop(st[0], `rgba(0,0,0,${st[1]})`));
    g.fillStyle = gr;
    g.fillRect(0, 0, W, H);
    cv.getContext('2d').drawImage(m, 0, 0);
  }

  // One drawing path for preview and exports. opt: { tile, calm, maxPixels }
  function drawPattern(cv, e, w, h, dpr, opt) {
    opt = opt || {};
    const inks = inksFor(e);
    const params = opt.tile ? Object.assign({}, e.params, { grain: 0 }) : e.params;   // grain does not tile
    const r = P().render(cv, e.key, params, inks, e.seed, { width: w, height: h, dpr, setStyle: false, tile: !!opt.tile, maxPixels: opt.maxPixels });
    if (opt.calm) applyCalm(cv, inks.ground);
    return r;
  }

  // Everything that follows the destination / frame choice: pills, preview aspect, size readout, buttons.
  function syncSend() {
    if (!root || !built) return;
    const d = destOf(send.dest);
    const sz = sizeOf(send.dest);
    const fam = cur ? famInfo(cur.key) : null;
    const wrap = $('ptWrap');
    wrap.dataset.frame = send.frame;
    wrap.style.setProperty('--pt-arn', String(sz.w / sz.h));
    root.querySelectorAll('#ptFrames [data-frame]').forEach(b => b.setAttribute('aria-checked', String(b.dataset.frame === send.frame)));
    root.querySelectorAll('#ptDests [data-dest]').forEach(b => {
      const on = b.dataset.dest === send.dest;
      b.setAttribute('aria-checked', String(on));
      const dd = destOf(b.dataset.dest);
      b.disabled = !!(dd.tile && fam && !fam.seamless);
      b.title = b.disabled ? 'This family does not tile seamlessly' : (dd.id === 'desktop' ? 'This screen, in real pixels' : '');
    });
    $('ptCustom').hidden = d.id !== 'custom';
    if (document.activeElement !== $('ptCW')) $('ptCW').value = send.cw;
    if (document.activeElement !== $('ptCH')) $('ptCH').value = send.ch;
    const calmBtn = $('ptCalm');
    calmBtn.disabled = !d.calm;
    calmBtn.setAttribute('aria-pressed', String(calmOn()));
    $('ptSize').textContent = `${sz.w} \u00d7 ${sz.h} px${d.tile ? ' \u00b7 PNG + SVG' : ''}`;
    $('ptExport').textContent = d.tile ? 'Export tile' : 'Export PNG';
    const ds = screenSize();
    $('ptSetDesk').hidden = !nativeWall();
    $('ptSetDesk').title = `Render at this Mac's desktop size (${ds.w} \u00d7 ${ds.h}) and set it as the desktop picture on every screen`;
  }

  function setDest(id) {
    const d = destOf(id);
    send.dest = d.id;
    send.frame = d.frame;
    saveSend();
    syncSend();
    renderMain(false);
  }

  function setFrame(id) {
    const f = FRAMES.find(x => x.id === id);
    if (!f) return;
    send.frame = f.id;
    // a device frame needs a destination of that shape; plain works with any
    if (f.dest && destOf(send.dest).frame !== f.id) send.dest = f.dest;
    saveSend();
    syncSend();
    renderMain(false);
  }

  /* ---------------- main canvas ---------------- */

  function renderMain(fast) {
    if (!visible || !built || !cur) return;
    const wrap = canvas.parentElement;
    const w = wrap.clientWidth;
    if (!w) return;
    const sz = sizeOf(send.dest);
    const d = destOf(send.dest);
    const h = Math.max(1, Math.round(w * sz.h / sz.w));
    const dpr = fast ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    const inks = inksFor(cur);
    const calm = calmOn();
    const sig = [cur.key, JSON.stringify(cur.params), cur.colorway, cur.seed, inks.ground, inks.ink1, inks.ink2, inks.spark, inks.deep, inks.t1, inks.t2, w, h, dpr, calm, !!d.tile].join('|');
    if (sig === lastRenderSig) return;
    lastRenderSig = sig;
    const r = drawPattern(canvas, cur, w, h, dpr, { calm, tile: !!d.tile });
    $('ptTiming').textContent = `${Math.round(r.ms)} ms \u00b7 ${r.w}\u00d7${r.h}`;
  }

  // Brand tokens, fonts and copy for the frames and the colorway chips. Cheap DOM
  // writes only, so it runs on every refresh.
  function applyBrand() {
    const def = view().def;
    const t = boardTokens(state, def);
    const copy = effectiveContent();
    const set = (k, v) => root.style.setProperty(k, v);
    set('--pt-canvas', t.canvas); set('--pt-ink', t.ink); set('--pt-muted', t.muted); set('--pt-line', t.line);
    set('--pt-primary', t.primary); set('--pt-on-primary', t.onPrimary);
    set('--pt-accent', t.accent); set('--pt-on-accent', t.onAccent);
    const vs = view().state;
    set('--font-heading', vs.headingFont.css); set('--font-body', vs.bodyFont.css);
    const name = copy.brandName || 'Brand';
    $('ptFrApp').textContent = name;
    $('ptFrKick').textContent = name;
    $('ptFrSub').textContent = copy.tagline || '';
    $('ptFrDate').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  // While a control is being dragged: a quick 1x pass, then a full-resolution one once it settles.
  function scheduleRender() {
    clearTimeout(fastTimer);
    clearTimeout(settleTimer);
    fastTimer = setTimeout(() => renderMain(true), 60);
    settleTimer = setTimeout(() => renderMain(false), 260);
  }
  function renderNow() {
    clearTimeout(fastTimer);
    clearTimeout(settleTimer);
    renderMain(false);
  }

  /* ---------------- narrow layout (<= 760px) ----------------
     Order: destinations and exports, canvas, name and preview frames, "Adjust pattern" (a <details>, closed), brand suite,
     in your brief, all families. The CSS does the ordering off .is-narrow; wide layouts keep the
     sidebar, so the <details> is forced open and its summary is hidden there. */
  const NARROW_MAX = 760;
  let narrow = null;
  function syncNarrow() {
    const w = root.clientWidth;
    if (!w) return;
    const n = w <= NARROW_MAX;
    if (n === narrow) return;
    narrow = n;
    root.classList.toggle('is-narrow', n);
    $('ptAdjust').open = !n;
  }

  /* ---------------- brand changes ---------------- */

  function refresh() {
    clearTimeout(refreshTimer);
    if (!visible) return;
    refreshTimer = setTimeout(doRefresh, 60);
  }

  function doRefresh() {
    if (!visible) return;
    if (!root) root = $('patternsView');
    if (!root) return;
    if (!built) build();
    applyBrand();
    const aestheticChanged = lastAesthetic !== aeSig();
    const sig = brandSig();
    const pinSig = pins().map(PatternPins.fullSig).join('\n');
    if (aestheticChanged) {
      lastAesthetic = aeSig();
      buildSuite();
      const keep = cur && !pristine;
      if (!cur) { const s = suite()[0]; setCurrent(entryOf(s.key, Object.assign(P().defaults(s.key), s.params), s.colorway, SUITE_SEED), 0); }
      else if (!keep && origin != null) { const s = suite()[origin]; setCurrent(entryOf(s.key, Object.assign(P().defaults(s.key), s.params), s.colorway, SUITE_SEED), origin); }
    }
    if (pinSig !== lastPinSig) { buildPins(); syncChrome(); queueThumbs(Array.from($('ptPins').querySelectorAll('canvas'))); }
    if (aestheticChanged || sig !== lastBrandSig) {
      lastBrandSig = sig;
      redrawThumbs();
    }
    syncNarrow();
    renderMain(false);
  }

  function setVisible(on) {
    on = !!on;
    if (on === visible) { if (on) refresh(); return; }
    visible = on;
    if (on) {
      lastBrandSig = ''; lastRenderSig = '';
      clearTimeout(refreshTimer);
      doRefresh();   // draw straight away: opening the view never shows an empty canvas for a beat
    }
    else {
      clearTimeout(refreshTimer); clearTimeout(fastTimer); clearTimeout(settleTimer);
      queue = []; pumping = false;
    }
  }

  /* ---------------- the brief list (PatternPins: undoable, marks the brand unsaved) ---------------- */

  // Add the pattern to the brief, or take it out again when it is already there.
  const pinEntry = entry => PatternPins.toggle(entry);

  /* ---------------- exports ---------------- */

  function nextFrame() { return new Promise(r => requestAnimationFrame(() => setTimeout(r, 0))); }

  const slugOf = e => `${brandFileSlug()}-pattern-${e.key}`;
  const toBlob = (cv, type) => new Promise((resolve, reject) => cv.toBlob(b => (b ? resolve(b) : reject(new Error('toBlob failed'))), type || 'image/png'));

  // Builds an export without saving it, so it can be inspected.
  // kind: a destination id (desktop | iphone | slide | slide4k | square | portrait | tile | custom), svg, or css.
  // A PNG result is { blob, name, w, h }; the tile also carries { svg: { blob, name, text } } for vector families.
  // opts.size = { w, h } overrides the size (custom, or the desktop picture).
  async function makeExport(kind, entry, opts) {
    const e = entry || cur;
    const inks = inksFor(e);
    const base = slugOf(e);
    if (kind === 'svg') {
      const text = P().renderSVG(e.key, e.params, inks, e.seed, { width: 1600, height: 900 });
      if (!text) throw new Error('This family has no SVG output');
      return { blob: new Blob([text], { type: 'image/svg+xml' }), name: `${base}.svg`, text };
    }
    if (kind === 'css') {
      const text = P().tileCSS(e.key, e.params, inks, e.seed, 128);
      if (!text) throw new Error('This family does not tile');
      return { text, name: `${base}.css` };
    }
    const legacy = LEGACY_EXPORTS[kind];
    const d = legacy ? null : DESTS.find(x => x.id === kind);
    if (!legacy && !d) throw new Error('Unknown export: ' + kind);
    const sz = (opts && opts.size) || (legacy ? { w: legacy[0], h: legacy[1] } : sizeOf(d.id));
    const tile = !!(d && d.tile);
    if (tile && !famInfo(e.key).seamless) throw new Error('This family does not tile seamlessly');
    const calm = !!(opts && opts.calm != null ? opts.calm : calmOn()) && !!(d && d.calm);
    const c = document.createElement('canvas');
    drawPattern(c, e, sz.w, sz.h, 1, { calm, tile, maxPixels: 4e8 });
    const blob = await toBlob(c);
    const tag = legacy ? legacy[2] : `${d.slug}-${c.width}x${c.height}`;
    const out = { blob, name: `${base}-${tag}.png`, w: c.width, h: c.height, calm };
    if (tile && famInfo(e.key).vector) {
      const text = P().tileSVG(e.key, e.params, inks, e.seed, sz.w);
      if (text) out.svg = { blob: new Blob([text], { type: 'image/svg+xml' }), name: `${base}-tile.svg`, text };
    }
    return out;
  }

  // Save one or more files. In the Mac app several files share one folder prompt (the batch bridge
  // the slide "Download all" uses); elsewhere they are plain downloads.
  async function saveFiles(files) {
    const mh = window.webkit && window.webkit.messageHandlers;
    const batch = files.length > 1 && mh && mh.batch ? mh.batch : null;
    if (batch) batch.postMessage({ op: 'start', what: 'the pattern tile' });
    try {
      for (const f of files) { bdSaveBlob(f.blob, f.name); if (files.length > 1) await new Promise(r => setTimeout(r, 250)); }
    } finally {
      if (batch) batch.postMessage('end');
    }
  }

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result).replace(/^data:[^,]*,/, ''));
      fr.onerror = () => reject(fr.error || new Error('read failed'));
      fr.readAsDataURL(blob);
    });
  }

  // Mac app only: render at this Mac's desktop size and hand the PNG to AppKit to set on every screen.
  async function setDesktopPicture() {
    const nw = nativeWall();
    if (!nw) throw new Error('Not available outside the Mac app');
    const out = await makeExport('desktop', cur, { size: screenSize(), calm: send.calm });
    const png = await blobToBase64(out.blob);
    const res = await nw.postMessage({ op: 'set', name: slugOf(cur), png });
    if (res !== true) throw new Error('The desktop picture was not set');
    return out;
  }

  async function runExport(kind, btn) {
    if (btn) btn.disabled = true;
    try {
      if (kind === 'css') {
        const out = await makeExport('css');
        await copyText(out.text);
        showToast('Copied CSS tile (128px, seamless)');
      } else if (kind === 'svg') {
        const out = await makeExport('svg');
        await saveFiles([out]);
        showToast('SVG downloaded');
      } else if (kind === 'wallpaper') {
        showToast('Setting desktop picture...');
        await nextFrame();
        const out = await setDesktopPicture();
        showToast(`Desktop picture set (${out.w} \u00d7 ${out.h})`);
      } else {
        const id = kind === 'dest' ? send.dest : kind;
        const sz = sizeOf(id);
        if (sz.w * sz.h > 8e6) { showToast(`Rendering ${sz.w} \u00d7 ${sz.h}...`); await nextFrame(); }
        const out = await makeExport(id);
        const files = [out].concat(out.svg ? [out.svg] : []);
        await saveFiles(files);
        showToast(out.svg ? 'Tile downloaded (PNG and SVG)' : `PNG downloaded (${out.w} \u00d7 ${out.h})`);
      }
    } catch (err) {
      showToast(kind === 'css' ? 'Clipboard blocked. Try again from the app window' : kind === 'wallpaper' ? 'Could not set the desktop picture' : 'Export failed');
    } finally {
      if (btn) { btn.disabled = false; syncChrome(); }
    }
  }

  /* ---------------- events ---------------- */

  function loadSuite(i) {
    const s = suite()[i];
    if (!s) return;
    setCurrent(entryOf(s.key, Object.assign(P().defaults(s.key), s.params), s.colorway, SUITE_SEED), i);
  }

  function wire() {
    root.addEventListener('click', e => {
      const add = e.target.closest('.pt-add');
      const tile = e.target.closest('.pt-tile');
      if (add && tile) {
        const i = Number(tile.dataset.i);
        if (tile.dataset.kind === 'pin') return PatternPins.removeAt(i);
        const s = suite()[i];
        return pinEntry(entryOf(s.key, Object.assign(P().defaults(s.key), s.params), s.colorway, SUITE_SEED));
      }
      if (add) {
        const wrap = add.closest('.pt-fam-wrap');
        const en = wrap && wrap.querySelector('canvas')._mk();
        return en && pinEntry(en);
      }
      if (tile && e.target.closest('.pt-tile-main')) {
        const i = Number(tile.dataset.i);
        if (tile.dataset.kind === 'suite') return loadSuite(i);
        const p = pins()[i];
        if (p) setCurrent(p, null);
        return;
      }
      const catBtn = e.target.closest('.pt-cat');
      if (catBtn) return setFilter({ cat: catBtn.dataset.cat });
      if (e.target.closest('#ptFamSearchX')) {
        $('ptFamSearch').value = '';
        setFilter({ q: '' });
        return $('ptFamSearch').focus();
      }
      const fam = e.target.closest('.pt-fam');
      if (fam) {
        const f = famInfo(fam.dataset.key);
        return setCurrent(entryOf(f.key, Object.assign({}, f.defaults, { tone: curTone() }), cur.colorway, cur.seed), null);
      }
      const dst = e.target.closest('[data-dest]');
      if (dst) return dst.disabled ? undefined : setDest(dst.dataset.dest);
      const frm = e.target.closest('[data-frame]');
      if (frm) return setFrame(frm.dataset.frame);
      if (e.target.closest('#ptCalm')) {
        send.calm = !send.calm;
        saveSend();
        syncSend();
        return renderMain(false);
      }
      const ex = e.target.closest('[data-export]');
      if (ex) return runExport(ex.dataset.export, ex);
      if (e.target.closest('#ptPin')) return pinEntry(cur);
      if (e.target.closest('#ptReseed')) {
        cur.seed = randomSeed();
        $('ptSeed').value = cur.seed;
        edited();
        return renderNow();
      }
      if (e.target.closest('#ptReset')) {
        if (origin != null) return loadSuite(origin);
        const f = famInfo(cur.key);
        return setCurrent(entryOf(f.key, Object.assign({}, f.defaults, { tone: curTone() }), cur.colorway, cur.seed), null);
      }
    });

    root.addEventListener('input', e => {
      const el = e.target;
      if (el.id === 'ptFamSearch') return setFilter({ q: el.value });
      if (el.id === 'ptTone') {
        cur.params.tone = Number(el.value) / 100;
        $('ptTone-o').textContent = el.value + '%';
        edited();
        scheduleRender();
        return;
      }
      if (el.type === 'range' && el.dataset.k) {
        cur.params[el.dataset.k] = Number(el.value);
        const out = $(el.id + '-o');
        if (out) out.textContent = el.value;
        edited();
        scheduleRender();
      }
    });

    root.addEventListener('keydown', e => {
      if (e.key === 'Escape' && e.target.id === 'ptFamSearch' && e.target.value) {
        e.target.value = '';
        setFilter({ q: '' });
        e.preventDefault();
      }
    });

    root.addEventListener('change', e => {
      const el = e.target;
      if (el.dataset && el.dataset.k) {
        if (el.type === 'range') cur.params[el.dataset.k] = Number(el.value);
        else if (el.type === 'checkbox') cur.params[el.dataset.k] = el.checked;
        else cur.params[el.dataset.k] = el.value;
        edited();
        return renderNow();
      }
      if (el.id === 'ptTone') {
        cur.params.tone = Number(el.value) / 100;
        edited();
        queuePicker();   // picker follows the strength
        return renderNow();
      }
      if (el.id === 'ptCW' || el.id === 'ptCH') {
        const w = el.id === 'ptCW' ? clampDim(el.value, send.cw) : send.cw;
        const h = el.id === 'ptCH' ? clampDim(el.value, send.ch) : send.ch;
        const k = w * h > MAX_PIXELS ? Math.sqrt(MAX_PIXELS / (w * h)) : 1;   // keep the canvas inside what the browser can draw
        send.cw = Math.floor(w * k); send.ch = Math.floor(h * k);
        el.value = el.id === 'ptCW' ? send.cw : send.ch;
        saveSend();
        syncSend();
        return renderMain(false);
      }
      if (el.name === 'ptColorway' && el.checked) {
        cur.colorway = el.value;
        edited();
        queuePicker();
        return renderNow();
      }
      if (el.id === 'ptSeed') {
        const v = el.value.trim();
        if (!v) { el.value = cur.seed; return; }
        cur.seed = v.slice(0, 40);
        edited();
        renderNow();
      }
    });

    if (window.ResizeObserver) {
      new ResizeObserver(() => { if (visible) { clearTimeout(settleTimer); settleTimer = setTimeout(() => renderMain(false), 120); } }).observe(canvas.parentElement);
      new ResizeObserver(() => { if (visible) syncNarrow(); }).observe(root);
    }
  }

  function init() {
    root = $('patternsView');
    loadSend();
  }

  document.addEventListener('DOMContentLoaded', init);

  return {
    setVisible, refresh, makeExport, pinEntry, isPinned,
    // test / tooling access
    current: () => (cur ? { key: cur.key, params: Object.assign({}, cur.params), colorway: cur.colorway, seed: cur.seed } : null),
    setCurrent,
  };
})();
