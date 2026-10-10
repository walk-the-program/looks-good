/* ---------------------------------------------------------------------
   patterns-ui.js — the "Patterns" workspace view (third option next to
   Board and Compare all) and the pin helpers shared with persistence, the
   deck and the AI brief.

   Needs js/patterns/* (the engine, families and aesthetic fit), app.js
   (state, render, showToast, copyText), aesthetic-board.js (the view toggle
   calls PatternsUI.setVisible) and brand-deck.js (bdSaveBlob, brandFileSlug).

   - PatternPins: pin storage rules. state.patterns is a list of immutable
     { key, params, colorway, seed } entries (max PIN_MAX). Always replace the
     array, never mutate it, so undo snapshots stay valid. params.tone (0..1,
     1 = full strength, the "Strength" slider) is part of params, so a pin
     remembers how quiet it is.
   - PatternsUI: the view. UI-only working pattern (not saved); pins are what
     persist. Nothing renders while the view is hidden.
------------------------------------------------------------------------ */

const PatternPins = (function () {
  const PIN_MAX = 8;
  const SUITE_SEED = 'brand';   // seed behind the suite thumbnails, the deck wall and the default canvas

  function colorways() { return window.Patterns ? Patterns.E.COLORWAYS.map(c => c.value) : ['brand']; }

  // Clean one entry (from a saved file or the UI) into the stored shape, or null.
  function normalize(raw) {
    const P = window.Patterns;
    if (!P || !raw || typeof raw !== 'object' || typeof raw.key !== 'string' || !P.get(raw.key)) return null;
    const colorway = colorways().includes(raw.colorway) ? raw.colorway : 'brand';
    const seed = String(raw.seed == null || raw.seed === '' ? 'brand' : raw.seed).slice(0, 40);
    return { key: raw.key, params: P.resolve(raw.key, raw.params || {}), colorway, seed };
  }

  function normalizeList(list) {
    return (Array.isArray(list) ? list : []).map(normalize).filter(Boolean).slice(0, PIN_MAX);
  }

  // Stable identity of an entry (family, colorway, seed and every parameter).
  function sig(p) {
    const n = normalize(p);
    return n ? [n.key, n.colorway, n.seed, JSON.stringify(n.params)].join('|') : '';
  }

  return { PIN_MAX, SUITE_SEED, normalize, normalizeList, sig };
})();

const PatternsUI = (function () {
  const SUITE_SEED = PatternPins.SUITE_SEED;
  const THUMB_W = 240;
  const THUMB_H = 135;
  const EXPORTS = { png1: [1280, 720, '1x'], png2: [2560, 1440, '2x'], png4k: [3840, 2160, '4k'] };

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
  const thumbCache = new Map();

  const STAR = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>';
  const STAR_LINE = STAR.replace('fill="currentColor"', 'fill="none"');

  /* ---------------- helpers ---------------- */

  const inksFor = entry => P().inksFor(state, entry.colorway, { tints: !!(entry.params && entry.params.tints) });
  const suite = () => P().suiteFor(state.aesthetic);
  const famInfo = key => P().list().find(f => f.key === key);
  const colorwayLabel = v => (P().E.COLORWAYS.find(c => c.value === v) || {}).label || v;
  const entryOf = (key, params, colorway, seed) => PatternPins.normalize({ key, params, colorway, seed });
  const randomSeed = () => 'v' + Math.random().toString(36).slice(2, 7);
  const pins = () => (Array.isArray(state.patterns) ? state.patterns : []);
  const curTone = () => (cur && cur.params && cur.params.tone != null ? cur.params.tone : 1);

  function brandSig() {
    const k = P().inksFor(state, 'brand');
    return [state.aesthetic, k.ground, k.ink1, k.ink2, k.spark, k.deep].join('|');
  }

  /* ---------------- thumbnails (lazy, cached) ---------------- */

  function drawThumb(cv) {
    const entry = cv._mk && cv._mk();
    if (!entry) return;
    const inks = inksFor(entry);
    const key = [entry.key, JSON.stringify(entry.params), entry.colorway, entry.seed, inks.ground, inks.ink1, inks.ink2, inks.spark, inks.deep, inks.t1, inks.t2].join('|');
    let off = thumbCache.get(key);
    if (!off) {
      off = document.createElement('canvas');
      P().render(off, entry.key, entry.params, inks, entry.seed, { width: THUMB_W, height: THUMB_H, dpr: 1, setStyle: false });
      thumbCache.set(key, off);
      if (thumbCache.size > 140) thumbCache.delete(thumbCache.keys().next().value);
    }
    cv.width = off.width;
    cv.height = off.height;
    cv.getContext('2d').drawImage(off, 0, 0);
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
    // visible-first order: suite, pinned, then the family picker
    const order = ['#ptSuite canvas', '#ptPins canvas', '#ptPicker canvas'];
    queueThumbs(order.flatMap(sel => Array.from(root.querySelectorAll(sel))));
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
      <div class="pt-grid">
        <div class="pt-main">
          <div class="pt-stage">
            <div class="pt-canvas-wrap"><canvas id="ptCanvas" aria-label="Pattern preview"></canvas></div>
            <div class="pt-bar">
              <div class="pt-bar-name"><strong id="ptName"></strong><span id="ptTiming"></span></div>
              <button type="button" class="btn btn-ghost btn-small pt-pin" id="ptPin" aria-pressed="false"></button>
            </div>
            <div class="pt-exports" role="group" aria-label="Export">
              <button type="button" class="btn btn-ghost btn-small" data-export="png1">PNG 1x</button>
              <button type="button" class="btn btn-ghost btn-small" data-export="png2">PNG 2x</button>
              <button type="button" class="btn btn-ghost btn-small" data-export="png4k">PNG 4K</button>
              <button type="button" class="btn btn-ghost btn-small" data-export="svg">SVG</button>
              <button type="button" class="btn btn-ghost btn-small" data-export="css">Copy CSS tile</button>
            </div>
          </div>
          <section class="pt-block pt-inuse" id="ptInuse" aria-label="In use">
            <div class="pt-block-head"><h3>In use</h3><span>Updates with the canvas</span></div>
            <div class="pt-iu-stage">
              <figure class="pt-iu pt-iu-card">
                <div class="pt-iu-face">
                  <canvas data-iu="card" aria-hidden="true"></canvas>
                  <div class="pt-iu-plate"><span class="pt-iu-mark" id="ptIuMark"></span><b id="ptIuName"></b></div>
                </div>
                <figcaption>Card</figcaption>
              </figure>
              <figure class="pt-iu pt-iu-phone">
                <div class="pt-iu-face">
                  <canvas data-iu="phone" aria-hidden="true"></canvas>
                  <span class="pt-iu-notch"></span>
                  <div class="pt-iu-lock"><b class="pt-iu-time">9:41</b><span class="pt-iu-date" id="ptIuDate"></span></div>
                  <span class="pt-iu-home"></span>
                </div>
                <figcaption>Phone wallpaper</figcaption>
              </figure>
              <figure class="pt-iu pt-iu-poster">
                <div class="pt-iu-face">
                  <div class="pt-iu-art"><canvas data-iu="poster" aria-hidden="true"></canvas></div>
                  <div class="pt-iu-copy"><small id="ptIuKick"></small><h4 id="ptIuTag"></h4><span class="pt-iu-rule"></span></div>
                </div>
                <figcaption>Poster</figcaption>
              </figure>
            </div>
          </section>
          <section class="pt-block pt-block-suite" aria-label="Brand suite">
            <div class="pt-block-head"><h3>Brand suite</h3><span id="ptSuiteFor"></span></div>
            <div class="pt-strip" id="ptSuite"></div>
          </section>
          <section class="pt-block pt-block-pins" aria-label="Pinned patterns">
            <div class="pt-block-head"><h3>Pinned</h3><span id="ptPinCount"></span></div>
            <div class="pt-strip pt-strip-pins" id="ptPins"></div>
            <p class="pt-empty" id="ptPinsEmpty">Star a pattern to keep it with this brand. Pinned patterns appear in the brand deck and the AI brief.</p>
          </section>
          <section class="pt-block pt-block-fams" aria-label="All families">
            <div class="pt-block-head"><h3>All families</h3><span>${P().list().length} generators</span></div>
            <div class="pt-picker" id="ptPicker" role="group" aria-label="Pattern family"></div>
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
              ${cws.map(c => `<label><input type="radio" name="ptColorway" value="${c.value}" /> ${escapeHtml(c.label)}</label>`).join('')}
            </div>
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
          <button type="button" class="btn btn-ghost btn-small btn-block" id="ptReset">Reset to suite preset</button>
            </div>
          </details>
        </aside>
      </div>`;
    canvas = $('ptCanvas');
    buildPicker();
    wire();
    built = true;
  }

  function buildPicker() {
    $('ptPicker').innerHTML = P().list().map((f, i) => `<button type="button" class="pt-fam" data-key="${f.key}" aria-pressed="false" title="${escapeHtml(f.blurb)}">
        <canvas width="${THUMB_W}" height="${THUMB_H}" aria-hidden="true"></canvas><span>${escapeHtml(f.name)}</span></button>`).join('');
    $('ptPicker').querySelectorAll('.pt-fam').forEach(btn => {
      const f = famInfo(btn.dataset.key);
      btn.querySelector('canvas')._mk = () => entryOf(f.key, Object.assign({}, f.defaults, { tone: curTone() }), cur ? cur.colorway : 'brand', SUITE_SEED);
    });
  }

  function buildSuite() {
    const list = suite();
    const def = aestheticByKey(state.aesthetic);
    $('ptSuiteFor').textContent = def.name;
    const host = $('ptSuite');
    host.innerHTML = list.map((s, i) => tileHtml('suite', i, s.name, famInfo(s.key).name, colorwayLabel(s.colorway))).join('');
    host.querySelectorAll('.pt-tile').forEach((tile, i) => {
      const s = list[i];
      tile.querySelector('canvas')._mk = () => entryOf(s.key, Object.assign(P().defaults(s.key), s.params), s.colorway, SUITE_SEED);
      tile.insertAdjacentHTML('beforeend', starButton(false, 'Pin ' + s.name));
    });
  }

  function starButton(on, label) {
    return `<button type="button" class="pt-star" aria-pressed="${on}" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}">${on ? STAR : STAR_LINE}</button>`;
  }

  function buildPins() {
    const list = pins();
    lastPinSig = list.map(PatternPins.sig).join('\n');
    const host = $('ptPins');
    host.innerHTML = list.map((p, i) => tileHtml('pin', i, famInfo(p.key).name, 'Seed ' + p.seed, colorwayLabel(p.colorway))).join('');
    host.querySelectorAll('.pt-tile').forEach((tile, i) => {
      const p = list[i];
      tile.querySelector('canvas')._mk = () => p;
      tile.insertAdjacentHTML('beforeend', starButton(true, 'Unpin ' + famInfo(p.key).name));
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
    queueThumbs(Array.from($('ptPicker').querySelectorAll('canvas')));   // picker follows the colorway
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
    const pinned = isPinned(cur);
    const btn = $('ptPin');
    btn.setAttribute('aria-pressed', String(pinned));
    btn.innerHTML = (pinned ? STAR : STAR_LINE) + (pinned ? 'Pinned to brand' : 'Pin to brand');
    const reset = $('ptReset');
    reset.disabled = pristine;
    root.querySelectorAll('#ptSuite .pt-tile').forEach((t, i) => t.classList.toggle('is-on', pristine && origin === i));
    root.querySelectorAll('#ptSuite .pt-star').forEach((b, i) => {
      const s = suite()[i];
      const e = entryOf(s.key, Object.assign(P().defaults(s.key), s.params), s.colorway, SUITE_SEED);
      const on = isPinned(e);
      b.setAttribute('aria-pressed', String(on));
      b.innerHTML = on ? STAR : STAR_LINE;
    });
  }

  function isPinned(entry) {
    const s = PatternPins.sig(entry);
    return pins().some(p => PatternPins.sig(p) === s);
  }

  function edited() {
    pristine = false;
    $('ptReset').disabled = false;
    root.querySelectorAll('#ptSuite .pt-tile').forEach(t => t.classList.remove('is-on'));
    const btn = $('ptPin');
    const pinned = isPinned(cur);
    btn.setAttribute('aria-pressed', String(pinned));
    btn.innerHTML = (pinned ? STAR : STAR_LINE) + (pinned ? 'Pinned to brand' : 'Pin to brand');
  }

  /* ---------------- main canvas ---------------- */

  function renderMain(fast) {
    if (!visible || !built || !cur) return;
    const wrap = canvas.parentElement;
    const w = wrap.clientWidth;
    if (!w) return;
    const h = Math.round(w * 9 / 16);
    const dpr = fast ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    const inks = inksFor(cur);
    const sig = [cur.key, JSON.stringify(cur.params), cur.colorway, cur.seed, inks.ground, inks.ink1, inks.ink2, inks.spark, inks.deep, inks.t1, inks.t2, w, dpr].join('|');
    if (sig === lastRenderSig) { renderInUse(inks, dpr); return; }   // previews can resize on their own
    lastRenderSig = sig;
    const r = P().render(canvas, cur.key, cur.params, inks, cur.seed, { width: w, height: h, dpr, setStyle: false });
    $('ptTiming').textContent = `${Math.round(r.ms)} ms · ${r.w}×${r.h}`;
    renderInUse(inks, dpr);
  }

  /* ---------------- "In use" previews: card, phone wallpaper, poster ---------------- */

  // Brand tokens, fonts and copy for the previews and the colorway chips. Cheap DOM
  // writes only, so it runs on every refresh.
  function applyBrand() {
    const def = aestheticByKey(state.aesthetic);
    const t = boardTokens(state, def);
    const copy = effectiveContent();
    const set = (k, v) => root.style.setProperty(k, v);
    set('--pt-canvas', t.canvas); set('--pt-ink', t.ink); set('--pt-muted', t.muted); set('--pt-line', t.line);
    set('--pt-primary', t.primary); set('--pt-on-primary', t.onPrimary);
    set('--pt-accent', t.accent); set('--pt-on-accent', t.onAccent);
    set('--font-heading', state.headingFont.css); set('--font-body', state.bodyFont.css);
    const name = copy.brandName || 'Brand';
    const mark = $('ptIuMark');
    if (state.logoDataUrl) mark.innerHTML = `<img src="${state.logoDataUrl}" alt="" />`;
    else mark.textContent = typeof abInitial === 'function' ? abInitial(name) : name.charAt(0).toUpperCase();
    mark.classList.toggle('is-logo', !!state.logoDataUrl);
    $('ptIuName').textContent = name;
    $('ptIuKick').textContent = name;
    $('ptIuTag').textContent = copy.tagline || '';
    $('ptIuDate').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  // Each preview is the pattern rendered at its own aspect ratio (the engine composes to the
  // box it is given), so scale and colorway decisions read as they would on the real asset.
  let lastUseSig = '';
  function renderInUse(inks, dpr) {
    const cvs = Array.from(root.querySelectorAll('canvas[data-iu]'));
    const dims = cvs.map(c => [c.clientWidth, c.clientHeight]);
    if (dims.some(d => !d[0] || !d[1])) return;
    const sig = [cur.key, JSON.stringify(cur.params), cur.colorway, cur.seed, inks.ground, inks.ink1, inks.ink2, inks.spark, inks.deep, inks.t1, inks.t2, dpr, dims.join(',')].join('|');
    if (sig === lastUseSig) return;
    lastUseSig = sig;
    cvs.forEach((c, i) => {
      P().render(c, cur.key, cur.params, inks, cur.seed, { width: dims[i][0], height: dims[i][1], dpr, setStyle: false });
    });
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
     Order: canvas, exports, "Adjust pattern" (a <details>, closed), In use, brand suite,
     pinned, all families. The CSS does the ordering off .is-narrow; wide layouts keep the
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
    const aestheticChanged = lastAesthetic !== state.aesthetic;
    const sig = brandSig();
    const pinSig = pins().map(PatternPins.sig).join('\n');
    if (aestheticChanged) {
      lastAesthetic = state.aesthetic;
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
    if (on) { lastBrandSig = ''; lastRenderSig = ''; lastUseSig = ''; refresh(); }
    else {
      clearTimeout(refreshTimer); clearTimeout(fastTimer); clearTimeout(settleTimer);
      queue = []; pumping = false;
    }
  }

  /* ---------------- pins (undoable, mark the brand unsaved) ---------------- */

  function commitPins(next, message) {
    pushUndoSnapshot(state);
    state.patterns = next;
    render();
    if (message) showToast(message);
  }

  function pinEntry(entry) {
    const e = PatternPins.normalize(entry);
    if (!e) return;
    const s = PatternPins.sig(e);
    const list = pins();
    const at = list.findIndex(p => PatternPins.sig(p) === s);
    if (at >= 0) return commitPins(list.filter((_, i) => i !== at), 'Unpinned');
    if (list.length >= PatternPins.PIN_MAX) return showToast(`Pin limit reached (${PatternPins.PIN_MAX}). Unpin one first`);
    commitPins(list.concat([e]), 'Pinned to this brand');
  }

  /* ---------------- exports ---------------- */

  function nextFrame() { return new Promise(r => requestAnimationFrame(() => setTimeout(r, 0))); }

  // Builds the export without saving it, so it can be inspected. kind: png1 | png2 | png4k | svg | css
  async function makeExport(kind, entry) {
    const e = entry || cur;
    const inks = inksFor(e);
    const base = `${brandFileSlug()}-pattern-${e.key}`;
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
    const spec = EXPORTS[kind];
    if (!spec) throw new Error('Unknown export: ' + kind);
    const c = document.createElement('canvas');
    P().render(c, e.key, e.params, inks, e.seed, { width: spec[0], height: spec[1], dpr: 1, setStyle: false });
    const blob = await new Promise((resolve, reject) => c.toBlob(b => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png'));
    return { blob, name: `${base}-${spec[2]}.png`, w: c.width, h: c.height };
  }

  async function runExport(kind, btn) {
    if (btn) btn.disabled = true;
    try {
      if (kind === 'png4k' || kind === 'png2') { showToast('Rendering ' + (kind === 'png4k' ? '4K' : '2x') + '...'); await nextFrame(); }
      const out = await makeExport(kind);
      if (kind === 'css') {
        await copyText(out.text);
        showToast('Copied CSS tile (128px, seamless)');
      } else {
        bdSaveBlob(out.blob, out.name);
        showToast(kind === 'svg' ? 'SVG downloaded' : 'PNG downloaded');
      }
    } catch (err) {
      showToast(kind === 'css' ? 'Clipboard blocked. Try again from the app window' : 'Export failed');
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
      const star = e.target.closest('.pt-star');
      const tile = e.target.closest('.pt-tile');
      if (star && tile) {
        const i = Number(tile.dataset.i);
        if (tile.dataset.kind === 'pin') return commitPins(pins().filter((_, k) => k !== i), 'Unpinned');
        const s = suite()[i];
        return pinEntry(entryOf(s.key, Object.assign(P().defaults(s.key), s.params), s.colorway, SUITE_SEED));
      }
      if (tile && e.target.closest('.pt-tile-main')) {
        const i = Number(tile.dataset.i);
        if (tile.dataset.kind === 'suite') return loadSuite(i);
        const p = pins()[i];
        if (p) setCurrent(p, null);
        return;
      }
      const fam = e.target.closest('.pt-fam');
      if (fam) {
        const f = famInfo(fam.dataset.key);
        return setCurrent(entryOf(f.key, Object.assign({}, f.defaults, { tone: curTone() }), cur.colorway, cur.seed), null);
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
        queueThumbs(Array.from($('ptPicker').querySelectorAll('canvas')));   // picker follows the strength
        return renderNow();
      }
      if (el.name === 'ptColorway' && el.checked) {
        cur.colorway = el.value;
        edited();
        queueThumbs(Array.from($('ptPicker').querySelectorAll('canvas')));
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
  }

  document.addEventListener('DOMContentLoaded', init);

  return {
    setVisible, refresh, makeExport, pinEntry,
    // test / tooling access
    current: () => (cur ? { key: cur.key, params: Object.assign({}, cur.params), colorway: cur.colorway, seed: cur.seed } : null),
    setCurrent,
  };
})();
