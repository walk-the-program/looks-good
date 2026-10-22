/* ---------------------------------------------------------------------
   logo-studio.js — Logo Studio, the "Or make one" section of the sidebar's Logo & background
   tab. An owner with no logo picks a wordmark lockup built from the brand's own name, fonts
   and ink, tunes it, checks it at small sizes, and exports the files. The result is stored in
   state.content.logo and the rest of the app reads it from there (brandLogo() in app.js).

   Layers:
     - pure-ish builders: compute(recipe) -> { logo, warnings, cap }. Runs the engine
       (js/logo-engine.js), writes the SVG files and the legibility analysis. No DOM.
     - state glue: commit() writes state.content.logo (a new object each time) and calls
       render(); sync() is called after every render() and regenerates the files when the
       brand's fonts, ink or name changed.
     - the panel: presets grid, the controls, the size tests, warnings, export, remove.

   state.content.logo (contract v1; the app reads exactly this):
     { v:1, recipe:{ word, case:'upper'|'as-typed'|'lower',
                     wordFont:{family|'heading'|'body', weight, style}, tracking,
                     device:{type:'none'|'strip'|'rule'|'box', crop, height, gap},
                     secondary:{text, font:{family|'heading'|'body', weight}, size, gap,
                                spread, align, tracking} | null,
                     mono:{letters:1|2} },
       files:{ full:{ink,white}, wordmark:{ink,white}, mono:{light,dark} },
       minPx:{full, wordmark}, clearSpace, fonts:{word, secondary}, updatedAt }
   Absent or null = no generated logo. Uploads (state.logoDataUrl) are never touched.

   Legibility rule (warnings, never block an export):
     foot letters  with a strip, any of L E Z B D Ł ⅃ in the word whose bottom stroke is more
                   than 60% under the crop. The stroke is measured from the glyph outline: the
                   lowest point above 3% of the cap height is the top of the foot.
     secondary     cap height under 5 px at the tested heights -> "<text> gets too small below
                   N px wide"; N goes into minPx.full.
     device        strip / rule / box line thinner than 1 px at 16 px tall.
     word          cap height under 6 px counts toward minPx too.

   Depends on logo-engine.js, and on globals from the app: state, render, abView, boardTokens,
   aibZip, brandFileSlug, showToast, escapeHtml. Plain <script>.
------------------------------------------------------------------------ */

const LogoStudio = (function () {
  'use strict';

  const DEBOUNCE = 100;            // ms for slider / text input
  const REGEN_DELAY = 300;         // ms after a brand font / ink / name change
  const TEST_H = [16, 32, 64, 200];
  const MONO_T = [32, 180];
  const FOOT = 'LEZBDŁ⅃';
  const MAX_BYTES = 200000;        // all four lockup + mono files together
  const WHITE = '#FFFFFF';

  let eng = 'loading', engError = '';
  let man = [];                    // logo font manifest
  let host = null, panel = null;
  let seq = 0, timer = null, regenTimer = null, pending = null;
  let lastSig = '', needsPaint = true, paintSeq = 0;
  let cur = null;                  // { stamp, result } the last compute() that matches content.logo
  let presetKey = '', presets = [];
  let showStyles = false;
  let failedSig = '', staleNote = '', sizeNote = '';
  let secMemory = null;
  let exporting = false, booted = false;

  const $ = function (id) { return document.getElementById(id); };
  const clone = function (o) { return o == null ? o : JSON.parse(JSON.stringify(o)); };
  const clampN = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  const esc = function (s) { return typeof escapeHtml === 'function' ? escapeHtml(String(s)) : String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  const dataUrl = function (svg) { return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); };

  /* ======================= 1. the brand's inputs ======================= */

  function brandName() { return String((state.content && state.content.brandName) || '').trim(); }
  function inkColor() { return (state.colors && state.colors.neutralDark) || '#1C1F26'; }

  function resolveFamily(spec) {
    const f = spec && spec.family;
    if (f === 'heading') return state.headingFont.name;
    if (f === 'body') return state.bodyFont.name;
    return f;
  }

  function entriesOf(family) {
    const lc = String(family).toLowerCase();
    return man.filter(function (e) { return e.family.toLowerCase() === lc; });
  }
  function hasFamily(family) { return entriesOf(family).length > 0; }

  // The weights a family can be set in (normal style when it has one).
  function weightsOf(family) {
    const all = entriesOf(family);
    const normal = all.filter(function (e) { return e.style === 'normal'; });
    const pool = normal.length ? normal : all;
    const out = [];
    pool.forEach(function (e) {
      (Array.isArray(e.weight) ? e.weight : [e.weight]).forEach(function (w) { if (out.indexOf(w) < 0) out.push(w); });
    });
    return out.sort(function (a, b) { return a - b; });
  }
  function nearestWeight(family, want) {
    const ws = weightsOf(family);
    if (!ws.length) return want;
    return ws.reduce(function (best, w) { return Math.abs(w - want) < Math.abs(best - want) ? w : best; }, ws[0]);
  }
  const WEIGHT_NAMES = { 100: 'Thin', 200: 'Extra light', 300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'Semibold', 700: 'Bold', 800: 'Extra bold', 900: 'Black' };

  function headingWeight() {
    const w = state.typography && Number(state.typography.headingWeight);
    return w > 0 ? w : 400;
  }

  // The ground the logo sits on in the board: its canvas colour and whether it is dark.
  function ground() {
    try {
      const v = abView();
      const t = boardTokens(v.state, v.def);
      if (t && t.canvas) return { bg: t.canvas, dark: !!t.isDark };
    } catch (e) { /* fall through */ }
    const dark = state.bgMode === 'dark';
    return { bg: dark ? '#111111' : '#FFFFFF', dark: dark };
  }

  // The active style's own name when it has a signature move (the enormous cropped word under
  // a strip, today), else ''.
  function signatureStyle() {
    try {
      const def = abView().def;
      return def && def.signature ? def.name : '';
    } catch (e) { return ''; }
  }

  /* ======================= 2. recipe -> files ======================= */

  // Contract recipe -> what LogoEngine.lockup() reads: 'heading'/'body' resolved to families.
  function toEngine(recipe) {
    const wf = recipe.wordFont || {};
    const er = {
      word: recipe.word,
      case: recipe.case === 'as-typed' ? 'none' : recipe.case,
      wordFont: { family: resolveFamily(wf), weight: wf.weight || 400, style: wf.style || 'normal' },
      tracking: recipe.tracking || 0,
      device: Object.assign({ type: 'none' }, recipe.device),
      secondary: null,
      monogram: { letters: recipe.mono && recipe.mono.letters === 2 ? 2 : 1 }
    };
    const s = recipe.secondary;
    if (s && s.text && s.text.trim()) {
      er.secondary = {
        text: s.text.trim(),
        font: { family: resolveFamily(s.font), weight: (s.font && s.font.weight) || 500, style: 'normal' },
        size: s.size, gap: s.gap, spread: !!s.spread, align: s.align || 'left', tracking: s.tracking || 0
      };
    }
    return er;
  }

  // Sensible device numbers for a cap height (the Nominal strip is 610 / 170 at a 720 cap).
  function deviceDefaults(type, cap) {
    cap = cap || 720;
    const r = function (v) { return Math.round(v); };
    if (type === 'strip') return { type: type, crop: r(cap * 0.85), height: r(cap * 0.236), gap: 0 };
    if (type === 'rule') return { type: type, crop: 0, height: r(cap * 0.085), gap: r(cap * 0.11) };
    if (type === 'box') return { type: type, crop: 0, height: r(cap * 0.1), gap: r(cap * 0.125) };
    return { type: 'none', crop: 0, height: 0, gap: 0 };
  }

  function secondaryDefaults(text) {
    return { text: text, font: { family: 'body', weight: 500 }, size: 118, gap: 90, spread: true, align: 'left', tracking: 0 };
  }

  // Thickness of a letter's bottom stroke in layout units, read from its outline: the lowest
  // point above 3% of the cap height is where the foot ends.
  function footThickness(f, ch) {
    const gid = LogoEngine.shape(f, ch).glyphs[0].gid;
    const d = LogoEngine.glyphPath(f, gid).d || '';
    const re = /([MLQCZ])([^MLQCZ]*)/g;
    const cap = f.capHeight;
    let lo = Infinity, m;
    while ((m = re.exec(d))) {
      const v = m[2].split(/[\s,]+/).filter(Boolean).map(Number);
      for (let i = 1; i < v.length; i += 2) if (v[i] > cap * 0.03 && v[i] < lo) lo = v[i];
    }
    if (!isFinite(lo)) lo = cap * 0.1;
    return clampN(lo, cap * 0.04, cap * 0.3) * 1000 / f.upem;
  }

  function analyze(er, faces, full, word, cap) {
    const warnings = [];
    const bh = function (l) { return l.bounds[3] - l.bounds[1]; };
    const bw = function (l) { return l.bounds[2] - l.bounds[0]; };
    const H1 = bh(full), W1 = bw(full), H2 = bh(word), W2 = bw(word);
    const dev = er.device;
    const thick = dev.type === 'none' ? 0 : dev.height;
    // smallest rendered HEIGHT (px) at which each check passes, then converted to width
    let hFull = 6 * H1 / cap, hWord = 6 * H2 / cap;

    if (thick > 0) {
      hFull = Math.max(hFull, H1 / thick);
      hWord = Math.max(hWord, H2 / thick);
      if (thick * 16 / H1 < 1) {
        const label = dev.type === 'box' ? 'frame' : dev.type;
        warnings.push({ id: 'device', text: 'The ' + label + ' line is thinner than 1 px at 16 px tall, so it will break up or vanish when the logo is that small. A thicker line holds up better.' });
      }
    }

    let hSec = 0;
    if (er.secondary) {
      const sf = faces.secondary;
      const capSec = sf.capHeight * er.secondary.size / sf.upem;
      hSec = 5 * H1 / capSec;
      const minW = Math.ceil(hSec * W1 / H1);
      if (hSec > TEST_H[0]) warnings.push({ id: 'secondary', text: '"' + er.secondary.text + '" gets too small below ' + minW + ' px wide. Use the wordmark alone under that.' });
    }

    if (dev.type === 'strip') {
      const text = LogoEngine.applyCase(er.word, er.case);
      const seen = {}, bad = [];
      Array.from(text).forEach(function (ch) {
        if (FOOT.indexOf(ch) < 0 || seen[ch]) return;
        seen[ch] = true;
        let t;
        try { t = footThickness(faces.word, ch); } catch (e) { return; }
        const hidden = Math.max(0, cap - dev.crop);
        if (hidden / t > 0.6) bad.push(ch);
      });
      if (bad.length) {
        let alt = text;
        if (bad.indexOf('L') >= 0) alt = alt.replace(/L/g, 'I');
        if (bad.indexOf('E') >= 0) alt = alt.replace(/E/g, 'F');
        const read = alt !== text ? ' "' + text + '" can read as "' + alt + '".' : '';
        warnings.push({
          id: 'foot',
          text: 'The crop hides the foot of the ' + bad.join(', ') + '.' + read,
          fix: { label: 'Lift the crop', crop: Math.round(cap - 10) }
        });
      }
    }

    const px = function (h, W, H) { return Math.max(1, Math.ceil(h * W / H)); };
    return {
      warnings: warnings,
      minPx: { full: px(Math.max(hFull, hSec), W1, H1), wordmark: px(hWord, W2, H2) }
    };
  }

  // Everything for one recipe, or throws (missing font, a letter the font does not have).
  async function compute(recipe) {
    const er = toEngine(recipe);
    const faces = await LogoEngine.load(er);
    const full = LogoEngine.lockup(er, faces);
    const word = er.secondary ? LogoEngine.lockup(Object.assign({}, er, { secondary: null }), faces) : full;
    const mono = LogoEngine.monogram(er, faces);
    const ink = inkColor();
    const svg = function (layout, fill, bg) { return LogoEngine.toSVG(layout, { fill: fill, bg: bg }); };
    const fullInk = svg(full, ink), fullWhite = svg(full, WHITE);
    const wordInk = er.secondary ? svg(word, ink) : fullInk;
    const wordWhite = er.secondary ? svg(word, WHITE) : fullWhite;
    const cap = faces.word.capHeight * 1000 / faces.word.upem;
    const a = analyze(er, faces, full, word, cap);
    return {
      cap: cap,
      warnings: a.warnings,
      logo: {
        v: 1,
        recipe: clone(recipe),
        files: {
          full: { ink: fullInk, white: fullWhite },
          wordmark: { ink: wordInk, white: wordWhite },
          mono: { light: svg(mono, ink, WHITE), dark: svg(mono, WHITE, ink) }
        },
        minPx: a.minPx,
        clearSpace: 0.25,
        fonts: { word: er.wordFont.family, secondary: er.secondary ? er.secondary.font.family : null }
      }
    };
  }

  function bytesOf(logo) {
    const f = logo.files;
    return [f.full.ink, f.full.white, f.wordmark.ink, f.wordmark.white, f.mono.light, f.mono.dark]
      .reduce(function (n, s) { return n + s.length; }, 0);
  }

  /* ======================= 3. writing state.content.logo ======================= */

  // A new object every time, so snapshots (undo, library saves) never share it.
  function commit(result) {
    const bytes = bytesOf(result.logo);
    if (bytes > MAX_BYTES) {
      sizeNote = 'This logo is too detailed to save (' + Math.round(bytes / 1000) + ' KB of outlines). Try a shorter name, a simpler font or no second line.';
      paint();
      return false;
    }
    sizeNote = '';
    result.logo.updatedAt = Date.now();
    state.content.logo = result.logo;
    cur = { stamp: result.logo.updatedAt, result: result };
    secMemory = result.logo.recipe.secondary ? clone(result.logo.recipe.secondary) : secMemory;
    lastSig = signature();
    render();
    paint();
    return true;
  }

  // The signature that decides when sync() has work: anything the logo or the presets depend on.
  function signature() {
    const c = state.content || {};
    const lg = c.logo;
    return [
      brandName(), state.headingFont && state.headingFont.name, state.bodyFont && state.bodyFont.name,
      inkColor(), state.bgMode, state.pureBg ? 1 : 0, state.aesthetic, state.aestheticVersion || '',
      state.blend ? JSON.stringify(state.blend) : '', state.logoDataUrl ? 1 : 0,
      lg ? lg.updatedAt : 'none', state.typography && state.typography.headingWeight,
      lg && lg.ref ? refTokenSig() : ''
    ].join('|');
  }

  // Does the stored logo still match the brand's fonts, ink and name?
  function stale(logo) {
    if (!logo || !logo.files || !logo.recipe || !logo.fonts) return false;
    const r = logo.recipe;
    if (resolveFamily(r.wordFont) !== logo.fonts.word) return true;
    if (r.secondary && r.secondary.text && resolveFamily(r.secondary.font) !== logo.fonts.secondary) return true;
    const m = /fill="([^"]+)"/.exec(logo.files.full.ink || '');
    if (!m || m[1].toLowerCase() !== inkColor().toLowerCase()) return true;
    return !!brandName() && namedWord(r) !== r.word;
  }

  // The word (and second line) a recipe takes from the brand name. recipe.wordSource is
  // 'name' (the whole name), 'head' (its first word, with the rest as the second line,
  // secondary.textSource 'tail') or absent/'custom' (typed or applied text: never renamed).
  function namedWord(r) {
    if (r.wordSource === 'name') return brandName();
    if (r.wordSource === 'head') return nameParts().head;
    return r.word;
  }
  function renamed(r) {
    r.word = namedWord(r);
    if (r.secondary && r.secondary.textSource === 'tail') r.secondary.text = nameParts().tail;
    if (r.secondary && !r.secondary.text) r.secondary = null;
    return r;
  }

  async function regenerate() {
    const logo = state.content && state.content.logo;
    if (!logo || eng !== 'ready' || !stale(logo)) return;
    const sig = signature();
    const r = clone(logo.recipe);
    if (brandName()) renamed(r);
    const my = ++seq;
    try {
      const res = await compute(r);
      if (my !== seq) return;
      staleNote = '';
      commit(res);
    } catch (e) {
      failedSig = sig;
      staleNote = 'The logo keeps its old fonts: ' + (e && e.message ? e.message.replace(/^LogoEngine:\s*/, '') : 'it could not be rebuilt.');
      paint();
    }
  }

  /* ---- a logo attached from Logos (state.content.logo.ref; js/logos/attach.js) ---- */

  let refTimer = null, refChecked = '';

  // The committed brand state (a suggestion hover preview must not leak into the logo files).
  function committedState() {
    try { return window.withCommittedState ? window.withCommittedState(function () { return serializeState(state); }) : state; }
    catch (e) { return state; }
  }
  function refTokenSig() {
    return typeof LogoAttach === 'undefined' ? '' : LogoAttach.tokenSig(LogoAttach.tokensOf(committedState()));
  }
  function refStale(logo) { return !!(logo && logo.ref && typeof LogoAttach !== 'undefined' && logo.ref.sig !== refTokenSig()); }

  // Once per stored logo version: has the Logos document moved on since this copy was made?
  function refCheck(logo) {
    const key = logo.ref.logoId + '|' + logo.ref.updatedAt;
    if (refChecked === key || typeof LogoStore === 'undefined') return;
    refChecked = key;
    LogoStore.get(logo.ref.logoId).then(function (doc) {
      const now = state.content && state.content.logo;
      if (!now || !now.ref || now.ref.logoId !== logo.ref.logoId) return;
      if (!doc) { staleNote = 'This logo was deleted from Logos. The brand keeps its last copy.'; paint(); }
      else if ((doc.updatedAt || 0) > now.ref.updatedAt) { clearTimeout(refTimer); refTimer = setTimeout(regenRef, 0); }
    }).catch(function () { /* the stored copy stays */ });
  }

  async function regenRef() {
    const logo = state.content && state.content.logo;
    if (!logo || !logo.ref || typeof LogoAttach === 'undefined' || typeof LogoStore === 'undefined') return;
    const sig = signature();
    const my = ++seq;
    try {
      const doc = await LogoStore.get(logo.ref.logoId);
      if (my !== seq) return;
      if (!doc) { staleNote = 'This logo was deleted from Logos. The brand keeps its last copy.'; paint(); return; }
      const next = await LogoAttach.filesFor(doc, committedState());
      if (my !== seq) return;
      const now = state.content && state.content.logo;
      if (!now || !now.ref || now.ref.logoId !== logo.ref.logoId) return;
      staleNote = '';
      state.content.logo = next;
      cur = null;
      lastSig = signature();
      render();
      paint();
    } catch (e) {
      failedSig = sig;
      console.warn('Logo Studio: the Logos logo could not be rebuilt', e);
      staleNote = 'The logo keeps its old colours and fonts: ' + (e && e.message ? e.message.replace(/^LogoEngine:\s*/, '') : 'it could not be rebuilt.');
      paint();
    }
  }

  function refHtml(logo) {
    const g = ground();
    const f = logo.files.full;
    return '<div class="ls-ref">' +
      '<div class="ls-preview" style="background:' + esc(g.bg) + '"><img alt="Logo from Logos" src="' + dataUrl(g.dark ? f.white : f.ink) + '" /></div>' +
      '<p class="sd-note ls-note">Using <b>' + esc(logo.ref.name || 'a logo') + '</b> from Logos, in this brand’s colours and fonts. It updates when you change either one.</p>' +
      (staleNote ? '<p class="sd-note ls-note">' + esc(staleNote) + '</p>' : '') +
      '<div class="sd-row ls-foot">' +
        '<button type="button" class="btn btn-primary" data-act="edit-logos">Edit in Logos</button>' +
        '<button type="button" class="btn btn-ghost" data-act="export" id="lsExport">Export logo files</button>' +
        '<button type="button" class="btn btn-ghost" data-act="stop-using">Stop using</button>' +
      '</div></div>';
  }

  async function editInLogos() {
    const logo = state.content && state.content.logo;
    if (!logo || !logo.ref || typeof LogosHome === 'undefined') return;
    const doc = typeof LogoStore !== 'undefined' ? await LogoStore.get(logo.ref.logoId) : null;
    if (!doc) { if (typeof showToast === 'function') showToast('That logo isn’t in Logos any more'); return; }
    await LogosHome.open(doc.id, { push: true });
  }

  async function stopUsing() {
    const logo = state.content && state.content.logo;
    if (!logo || !logo.ref) return;
    const id = typeof BrandSession !== 'undefined' ? BrandSession.currentId() : null;
    try { if (id) await LogoAttach.detach(logo.ref.logoId, [id]); }
    catch (e) { console.warn('Logo Studio: detach failed', e); }
    const now = state.content && state.content.logo;
    if (now && now.ref) { remove(); return; }              // the Logos copy is gone: drop the brand's copy
    clearTimeout(refTimer); ++seq; cur = null; staleNote = ''; built = '';
    lastSig = signature();
    paint();
  }

  // New Logos document from the current recipe (or the brand name), attached to this brand.
  async function openInLogos() {
    if (typeof LogoDoc === 'undefined' || typeof LogoAttach === 'undefined' || typeof LogosHome === 'undefined') return;
    const btn = host && host.querySelector('[data-act="open-logos"]');
    if (btn) btn.disabled = true;
    try {
      const bid = typeof BrandSession !== 'undefined' ? BrandSession.currentId() : null;
      const tokens = LogoAttach.tokensOf(committedState());
      const logo = state.content && state.content.logo;
      const name = brandName() || 'Brand';
      const doc = LogoDoc.create({ name: name + ' logo', brandId: bid });
      if (logo && logo.recipe) {
        doc.nodes = LogoAttach.fitNodes((await LogoDoc.fromRecipe(clone(logo.recipe), { tokens: tokens })).nodes, doc.artboard, 0.8);
      } else {
        const n = LogoDoc.makeNode({
          type: 'text', name: 'Wordmark', text: name, font: { ref: 'heading', weight: headingWeight(), style: 'normal' },
          size: 160, lineHeight: 1.2, fill: { ref: 'ink' }
        });
        const g = await LogoRender.nodeGeometry(n, tokens);
        n.w = g.w; n.h = g.h;
        n.x = (doc.artboard.w - n.w) / 2; n.y = (doc.artboard.h - n.h) / 2;
        doc.nodes = [n];
      }
      doc.attached = [];
      doc.preview = await LogoRender.toSVG(doc, tokens, { box: 'artboard' });
      await LogoStore.put(doc);
      if (bid) await LogoAttach.attach(doc.id, [bid]);
      await LogosHome.open(doc.id, { push: true });
    } catch (e) {
      console.error('Logo Studio: Open in Logos failed', e);
      if (typeof showToast === 'function') showToast(String(e && e.message || e).replace(/^LogoEngine:\s*/, ''));
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  // Called after every render(): cheap when nothing relevant changed.
  function sync() {
    if (!host || !state || !state.content) return;
    const sig = signature();
    if (sig === lastSig) return;
    lastSig = sig;
    const logo = state.content.logo;
    if (logo && !booted) boot();                          // a stored logo may need its files rebuilt
    if (logo && logo.ref) {                               // a logo from Logos follows the brand's colours and fonts
      if (refStale(logo)) { clearTimeout(refTimer); refTimer = setTimeout(regenRef, REGEN_DELAY); }
      else refCheck(logo);
    }
    if (logo && eng === 'ready' && sig !== failedSig && stale(logo)) {
      clearTimeout(regenTimer);
      regenTimer = setTimeout(regenerate, REGEN_DELAY);
    }
    needsPaint = true;
    if (visible()) paint();
  }

  function visible() { return !!panel && !panel.hidden; }

  /* ======================= 4. edits ======================= */

  function working() {
    const logo = state.content.logo;
    return pending || (logo && logo.recipe);
  }

  function edit(mutator, now) {
    const base = working();
    if (!base) return;
    const r = clone(base);
    mutator(r);
    pending = r;
    controlsFrom(r);
    clearTimeout(timer);
    timer = setTimeout(flush, now ? 0 : DEBOUNCE);
  }

  async function flush() {
    const r = pending;
    if (!r) return;
    const my = ++seq;
    try {
      const res = await compute(r);
      if (my !== seq) return;
      pending = null;
      commit(res);
    } catch (e) {
      if (my !== seq) return;
      pending = null;
      console.warn('Logo Studio:', e);
      if (typeof showToast === 'function') showToast(String(e && e.message || e).replace(/^LogoEngine:\s*/, ''));
      paint();
    }
  }

  /* ======================= 5. presets ======================= */

  function presetSpecs() {
    const sig = signatureStyle();
    const dev = function (t) { return { type: t }; };
    // A two-word name ("Nominal Studios") splits into the word and a second line;
    // a one-word name has no second line, so the presets that need one are left out.
    const tail = nameParts().tail;
    const list = [
      { id: 'set', label: 'Set', note: 'The name alone', recipe: { case: 'as-typed', tracking: 0, device: dev('none'), secondary: null } }
    ];
    if (tail) list.push({ id: 'spaced', label: 'Spaced line', note: 'The second word, small and spaced below', recipe: { case: 'upper', tracking: 20, device: dev('none'), secondary: Object.assign(secondaryDefaults(tail), { spread: false, tracking: 260 }) } });
    list.push(
      { id: 'rule', label: 'Rule', note: 'A thin bar under the name', recipe: { case: 'upper', tracking: 40, device: dev('rule'), secondary: null } },
      { id: 'box', label: 'Box', note: 'The name in an outline frame', recipe: { case: 'upper', tracking: 60, device: dev('box'), secondary: null } });
    if (sig) list.push({ id: 'strip', label: 'Strip', note: sig + ': the cropped word', recipe: { case: 'upper', tracking: -40, device: dev('strip'), secondary: tail ? secondaryDefaults(tail) : null } });
    return list;
  }

  function nameParts() {
    const words = brandName().trim().split(/\s+/).filter(Boolean);
    return { head: words[0] || '', tail: words.slice(1).join(' ') };
  }

  // Full contract recipe for a preset (needs the heading face for its cap height).
  async function presetRecipe(spec) {
    const fam = state.headingFont.name;
    if (!hasFamily(fam)) throw new Error(fam + ' is not in the logo font set');
    const weight = nearestWeight(fam, headingWeight());
    const f = await LogoEngine.face(fam, { weight: weight });
    const cap = f.capHeight * 1000 / f.upem;
    const r = clone(spec.recipe);
    if (r.secondary && !hasFamily(state.bodyFont.name)) throw new Error(state.bodyFont.name + ' is not in the logo font set');
    r.secondary = r.secondary ? Object.assign({}, r.secondary, { font: { family: 'body', weight: nearestWeight(state.bodyFont.name, 500) } }) : null;
    // presets with a second line set only the first word above it
    r.wordSource = r.secondary ? 'head' : 'name';
    if (r.secondary) r.secondary.textSource = 'tail';
    r.word = namedWord(r);
    r.wordFont = { family: 'heading', weight: weight, style: 'normal' };
    r.device = deviceDefaults(r.device.type, cap);
    r.mono = { letters: 1 };
    return r;
  }

  async function buildPresets() {
    const key = [brandName(), state.headingFont.name, state.bodyFont.name, inkColor(), signatureStyle(), headingWeight(), ground().bg].join('|');
    if (key === presetKey && presets.length) return presets;
    const out = await Promise.all(presetSpecs().map(async function (spec) {
      const p = { id: spec.id, label: spec.label, note: spec.note, recipe: null, svg: '', reason: '' };
      try {
        p.recipe = await presetRecipe(spec);
        const res = await compute(p.recipe);
        p.svg = ground().dark ? res.logo.files.full.white : res.logo.files.full.ink;
      } catch (e) {
        p.reason = String(e && e.message || e).replace(/^LogoEngine:\s*/, '');
        if (/no glyph/.test(p.reason)) p.reason = state.headingFont.name + ' is missing a letter in the name';
      }
      return p;
    }));
    presetKey = key;
    presets = out;
    return out;
  }

  async function pick(id) {
    const p = presets.filter(function (x) { return x.id === id; })[0];
    if (!p || !p.recipe) return;
    clearTimeout(timer); pending = null;
    const my = ++seq;
    try {
      const res = await compute(clone(p.recipe));
      if (my !== seq) return;
      showStyles = false;
      commit(res);
    } catch (e) {
      if (typeof showToast === 'function') showToast(String(e && e.message || e).replace(/^LogoEngine:\s*/, ''));
    }
  }

  /* ======================= 6. the panel ======================= */

  const SKELETON = '<div id="lsUpload"></div><div class="ls-body" id="lsBody"></div>' +
    '<div class="ls-group" id="lsLogos"><p class="sd-adv-sub">Logos editor</p>' +
    '<p class="sd-note">Draw or refine a logo in the full editor. It starts from this one (or the brand name) and is used in this brand.</p>' +
    '<button type="button" class="btn btn-ghost btn-small" data-act="open-logos">Open in Logos</button></div>';

  function presetsHtml(list, current) {
    return '<div class="ls-presets" role="list">' + list.map(function (p) {
      const g = ground();
      const thumb = p.svg
        ? '<span class="ls-thumb" style="background:' + esc(g.bg) + '"><img alt="" src="' + dataUrl(p.svg) + '" /></span>'
        : '<span class="ls-thumb ls-thumb-off"></span>';
      return '<button type="button" class="ls-preset" role="listitem" data-act="pick" data-id="' + p.id + '"' + (p.recipe ? '' : ' disabled') + ' aria-label="' + esc(p.label) + '">' +
        thumb + '<b>' + esc(p.label) + '</b><small>' + esc(p.reason || p.note) + '</small></button>';
    }).join('') + '</div>';
  }

  function uploadNote(hasGenerated) {
    if (!state.logoDataUrl) return '';
    return '<p class="sd-note ls-note">' + (hasGenerated
      ? 'Your uploaded logo is used everywhere. This one stays saved as a fallback.'
      : 'You have an uploaded logo, so that one is used. A generated logo is kept as a fallback.') + '</p>';
  }

  function segHtml(name, label, items, n) {
    return '<div class="segmented ls-seg" style="--n:' + (n || items.length) + '" role="radiogroup" aria-label="' + esc(label) + '">' +
      items.map(function (it) {
        return '<label><input type="radio" name="' + name + '" value="' + esc(it[0]) + '" /> ' + esc(it[1]) + '</label>';
      }).join('') + '</div>';
  }

  function editorHtml() {
    return '' +
      '<div class="ls-preview" id="lsPreview"></div>' +
      '<div id="lsStale" class="sd-note ls-note" hidden></div>' +
      '<div class="sd-row ls-tools">' +
        '<button type="button" class="btn btn-ghost btn-small" data-act="styles" id="lsStylesBtn">Other styles</button>' +
      '</div>' +
      '<div id="lsStyles" hidden></div>' +
      '<div class="ls-group">' +
        '<p class="sd-adv-sub">Wordmark</p>' +
        segHtml('lsCase', 'Letter case', [['upper', 'Upper'], ['as-typed', 'As typed'], ['lower', 'Lower']]) +
        '<label class="field"><span>Letter spacing <output id="lsTrackVal"></output></span>' +
          '<input type="range" id="lsTrack" min="-100" max="300" step="2" value="0" /></label>' +
        '<label class="field" id="lsWeightRow"><span>Weight</span><select id="lsWeight"></select></label>' +
      '</div>' +
      '<div class="ls-group">' +
        '<p class="sd-adv-sub">Device</p>' +
        segHtml('lsDevice', 'Device', [['none', 'None'], ['strip', 'Strip'], ['rule', 'Rule'], ['box', 'Box']]) +
        '<label class="field" id="lsCropRow"><span>Crop depth <output id="lsCropVal"></output></span>' +
          '<input type="range" id="lsCrop" min="100" max="720" step="5" value="610" /></label>' +
      '</div>' +
      '<div class="ls-group">' +
        '<p class="sd-adv-sub">Second line</p>' +
        '<label class="field"><span>Text</span><input type="text" id="lsSecText" placeholder="e.g. Studios" maxlength="40" autocomplete="off" spellcheck="false" /></label>' +
        '<div class="ls-group" id="lsSecMore">' +
          '<button type="button" id="lsSpread" class="sd-toggle-row ls-toggle" aria-pressed="false">' +
            '<span class="sd-toggle-text"><b>Spread across the width</b><small>Letters run edge to edge under the word</small></span>' +
            '<i class="sd-switch" aria-hidden="true"></i></button>' +
          '<div id="lsSecLoose" class="ls-group">' +
            segHtml('lsAlign', 'Alignment', [['left', 'Left'], ['center', 'Center'], ['right', 'Right']]) +
            '<label class="field"><span>Line spacing <output id="lsSecTrackVal"></output></span>' +
              '<input type="range" id="lsSecTrack" min="0" max="400" step="5" value="0" /></label>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="ls-group">' +
        '<p class="sd-adv-sub">Monogram</p>' +
        segHtml('lsMono', 'Monogram letters', [['1', 'One letter'], ['2', 'Two letters']]) +
      '</div>' +
      '<div class="ls-group">' +
        '<p class="sd-adv-sub">At small sizes</p>' +
        '<div class="ls-sizes" id="lsSizes"></div>' +
        '<div class="ls-warns" id="lsWarns"></div>' +
        '<p class="sd-note" id="lsMin"></p>' +
      '</div>' +
      '<div class="sd-row ls-foot">' +
        '<button type="button" class="btn btn-primary ls-export" data-act="export" id="lsExport">Export logo files</button>' +
        '<button type="button" class="btn btn-ghost" data-act="remove">Remove</button>' +
      '</div>' +
      '<p class="sd-note" id="lsSizeNote" hidden></p>';
  }

  // Which editor is built right now: '' none, 'editor', or 'presets' / 'status' (rewritten each paint).
  let built = '';

  async function paint() {
    if (!host) return;
    if (!visible()) { needsPaint = true; return; }       // painted when the tab opens
    const my = ++paintSeq;
    needsPaint = false;
    const body = $('lsBody');
    const logo = state.content && state.content.logo;
    const hasLogo = !!(logo && logo.files && logo.recipe);
    const hasRef = !!(logo && logo.ref && logo.files);
    $('lsUpload').innerHTML = uploadNote(hasLogo || hasRef);

    if (hasRef) {
      body.innerHTML = refHtml(logo);
      built = 'ref';
      return;
    }

    if (eng === 'loading') { setStatus('Loading the logo tools…'); return; }
    if (eng === 'error') {
      body.innerHTML = '<p class="sd-note ls-note">The logo tools could not load (' + esc(engError) + ').</p><button type="button" class="btn btn-ghost btn-small" data-act="retry">Try again</button>';
      built = 'status';
      return;
    }

    if (hasLogo) {
      if (built !== 'editor') { body.innerHTML = '<div id="lsEditor" class="ls-editor">' + editorHtml() + '</div>'; built = 'editor'; }
      paintEditor(logo);
      if (!cur || cur.stamp !== logo.updatedAt) {
        try {
          const res = await compute(clone(logo.recipe));
          if (my !== paintSeq) return;
          cur = { stamp: logo.updatedAt, result: res };
          paintEditor(logo);
        } catch (e) { /* stored files still preview; no warnings */ }
      }
      return;
    }

    // no generated logo: the presets
    built = 'presets';
    if (!brandName()) {
      body.innerHTML = '<p class="sd-note ls-note">Give the brand a name to see logo options built from it.</p>';
      return;
    }
    if (!presets.length) body.innerHTML = '<p class="sd-note ls-note">Making options from your fonts…</p>';
    const list = await buildPresets();
    if (my !== paintSeq) return;
    const sigName = signatureStyle();
    body.innerHTML = presetsHtml(list) +
      '<p class="sd-note ls-note">Built from ' + esc(state.headingFont.name) + (sigName ? ' and the ' + esc(sigName) + ' style' : '') + '. Pick one to adjust it.</p>';
  }

  function setStatus(msg) {
    const body = $('lsBody');
    if (body) body.innerHTML = '<p class="sd-note ls-note">' + esc(msg) + '</p>';
    built = 'status';
  }

  function paintEditor(logo) {
    const g = ground();
    const f = logo.files;
    const pick = function (v) { return g.dark ? v.white : v.ink; };
    const prev = $('lsPreview');
    if (!prev) return;
    prev.style.background = g.bg;
    prev.innerHTML = '<img alt="Generated logo preview" src="' + dataUrl(pick(f.full)) + '" />';
    const st = $('lsStale');
    st.hidden = !staleNote;
    st.textContent = staleNote;
    controlsFrom(working());
    paintStyles();

    // size tests
    const avail = Math.max(120, ($('lsSizes').clientWidth || 280) - 24);
    const vb = /viewBox="[^"]*?([\d.]+) ([\d.]+)"/.exec(f.full.ink);
    const ratio = vb ? Number(vb[1]) / Number(vb[2]) : 3;
    let rows = '';
    TEST_H.forEach(function (h) {
      const w = h * ratio;
      const fit = w > avail;
      const shownH = fit ? avail / ratio : h;
      rows += '<div class="ls-size"><span>' + h + ' px' + (fit ? ' (fitted)' : '') + '</span>' +
        '<img alt="" src="' + dataUrl(pick(f.full)) + '" style="height:' + shownH.toFixed(1) + 'px;width:auto" /></div>';
    });
    const monoSvg = g.dark ? f.mono.dark : f.mono.light;
    rows += '<div class="ls-size ls-size-mono"><span>Monogram</span>' + MONO_T.map(function (s) {
      return '<span class="ls-mono"><img alt="" src="' + dataUrl(monoSvg) + '" style="width:' + s + 'px;height:' + s + 'px" /><small>' + s + ' px</small></span>';
    }).join('') + '</div>';
    $('lsSizes').style.background = g.bg;
    $('lsSizes').style.color = g.dark ? 'rgba(255,255,255,0.62)' : 'rgba(0,0,0,0.55)';
    $('lsSizes').innerHTML = rows;

    // warnings
    const res = cur && cur.stamp === logo.updatedAt ? cur.result : null;
    const warns = res ? res.warnings : [];
    $('lsWarns').innerHTML = warns.map(function (w, i) {
      return '<div class="ls-warn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg><span>' + esc(w.text) +
        (w.fix ? ' <button type="button" data-act="fix" data-i="' + i + '">' + esc(w.fix.label) + '</button>' : '') + '</span></div>';
    }).join('');
    const mp = logo.minPx;
    $('lsMin').textContent = mp ? 'Reads cleanly from ' + mp.full + ' px wide' + (mp.wordmark !== mp.full ? ' (the word alone from ' + mp.wordmark + ' px)' : '') + '.' : '';
    const sn = $('lsSizeNote');
    sn.hidden = !sizeNote;
    sn.textContent = sizeNote;
  }

  function paintStyles() {
    const box = $('lsStyles');
    if (!box) return;
    box.hidden = !showStyles;
    $('lsStylesBtn').textContent = showStyles ? 'Hide other styles' : 'Other styles';
    if (!showStyles) return;
    box.innerHTML = '<p class="sd-note ls-note">Picking one replaces your current settings.</p>';
    buildPresets().then(function (list) {
      if (!showStyles || $('lsStyles') !== box) return;
      box.innerHTML = presetsHtml(list);
    });
  }

  // Sets every control from a recipe without firing the handlers.
  function controlsFrom(r) {
    if (!r || !$('lsTrack')) return;
    const setRadio = function (name, val) {
      document.querySelectorAll('input[name="' + name + '"]').forEach(function (i) { i.checked = i.value === String(val); });
    };
    setRadio('lsCase', r.case);
    $('lsTrack').value = r.tracking || 0;
    $('lsTrackVal').textContent = (r.tracking || 0) + '';
    // weight
    const fam = resolveFamily(r.wordFont);
    const ws = weightsOf(fam);
    const sel = $('lsWeight');
    const key = ws.join(',');
    if (sel.dataset.key !== key) {
      sel.innerHTML = ws.map(function (w) { return '<option value="' + w + '">' + (WEIGHT_NAMES[w] || w) + '</option>'; }).join('');
      sel.dataset.key = key;
    }
    sel.value = String(nearestWeight(fam, r.wordFont.weight || 400));
    $('lsWeightRow').hidden = ws.length < 2;
    // device
    const dev = r.device || { type: 'none' };
    setRadio('lsDevice', dev.type);
    const cap = (cur && cur.result && cur.result.cap) || 720;
    $('lsCrop').max = String(Math.round(cap));
    $('lsCrop').value = dev.crop;
    $('lsCropVal').textContent = dev.crop + '';
    $('lsCropRow').hidden = dev.type !== 'strip';
    // second line
    const s = r.secondary;
    const txt = $('lsSecText');
    if (document.activeElement !== txt) txt.value = s ? s.text : '';
    $('lsSecMore').hidden = !s;
    if (s) {
      $('lsSpread').setAttribute('aria-pressed', String(!!s.spread));
      $('lsSecLoose').hidden = !!s.spread;
      setRadio('lsAlign', s.align || 'left');
      $('lsSecTrack').value = s.tracking || 0;
      $('lsSecTrackVal').textContent = (s.tracking || 0) + '';
    }
    setRadio('lsMono', r.mono && r.mono.letters === 2 ? 2 : 1);
  }

  /* ======================= 7. export ======================= */

  async function blobBytes(blob) { return new Uint8Array(await blob.arrayBuffer()); }

  async function exportZip() {
    const logo = state.content && state.content.logo;
    if (!logo || exporting) return;
    if (typeof aibZip !== 'function') { if (typeof showToast === 'function') showToast('Could not make the zip here'); return; }
    exporting = true;
    const btn = $('lsExport');
    if (btn) { btn.disabled = true; btn.textContent = 'Preparing…'; }
    try {
      const slug = typeof brandFileSlug === 'function' ? brandFileSlug() : 'brand';
      const f = logo.files;
      const files = [];
      const add = function (name, data) { files.push({ name: slug + '-logo-' + name, data: data }); };
      const sets = [
        ['full-ink', f.full.ink, 2400], ['full-white', f.full.white, 2400],
        ['wordmark-ink', f.wordmark.ink, 2400], ['wordmark-white', f.wordmark.white, 2400]
      ];
      for (const s of sets) {
        add(s[0] + '.svg', s[1]);
        add(s[0] + '.png', await blobBytes(await LogoEngine.toPNG(s[1], s[2])));
      }
      for (const m of [['mono-light', f.mono.light], ['mono-dark', f.mono.dark]]) {
        add(m[0] + '.svg', m[1]);
        for (const px of [1024, 180, 32]) add(m[0] + '-' + px + '.png', await blobBytes(await LogoEngine.toPNG(m[1], px)));
      }
      const blob = new Blob([aibZip(files)], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = slug + '-logo.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 20000);
      if (typeof showToast === 'function') showToast('Saved ' + files.length + ' logo files');
    } catch (e) {
      console.error('Logo Studio export failed', e);
      if (typeof showToast === 'function') showToast('Could not export the logo files');
    } finally {
      exporting = false;
      const b = $('lsExport');
      if (b) { b.disabled = false; b.textContent = 'Export logo files'; }
    }
  }

  /* ======================= 8. events ======================= */

  function onInput(e) {
    const t = e.target;
    if (!t || !t.id) return;
    const n = Number(t.value);
    if (t.id === 'lsTrack') edit(function (r) { r.tracking = n; });
    else if (t.id === 'lsCrop') edit(function (r) { r.device.crop = n; });
    else if (t.id === 'lsSecTrack') edit(function (r) { if (r.secondary) r.secondary.tracking = n; });
    else if (t.id === 'lsSecText') edit(function (r) { setSecondaryText(r, t.value); });
  }

  function setSecondaryText(r, text) {
    const clean = text.replace(/\s+/g, ' ').replace(/^\s+/, '');
    if (!clean.trim()) {
      if (r.secondary) secMemory = clone(r.secondary);
      r.secondary = null;
      return;
    }
    if (!r.secondary) r.secondary = Object.assign(secondaryDefaults(clean), secMemory || {}, { text: clean });
    else r.secondary.text = clean;
    delete r.secondary.textSource;  // typed text is the owner's; a rename no longer replaces it
  }

  function onChange(e) {
    const t = e.target;
    if (!t) return;
    if (t.name === 'lsCase') edit(function (r) { r.case = t.value; }, true);
    else if (t.id === 'lsWeight') edit(function (r) { r.wordFont.weight = Number(t.value); }, true);
    else if (t.name === 'lsDevice') edit(function (r) {
      const cap = (cur && cur.result && cur.result.cap) || 720;
      r.device = deviceDefaults(t.value, cap);
    }, true);
    else if (t.name === 'lsAlign') edit(function (r) { if (r.secondary) r.secondary.align = t.value; }, true);
    else if (t.name === 'lsMono') edit(function (r) { r.mono = { letters: t.value === '2' ? 2 : 1 }; }, true);
  }

  function onClick(e) {
    if (e.target.closest && e.target.closest('#lsSpread')) {
      edit(function (r) { if (r.secondary) r.secondary.spread = !r.secondary.spread; }, true);
      return;
    }
    const b = e.target.closest && e.target.closest('[data-act]');
    if (!b || !host.contains(b)) return;
    const act = b.dataset.act;
    if (act === 'pick') pick(b.dataset.id);
    else if (act === 'styles') { showStyles = !showStyles; paintStyles(); }
    else if (act === 'export') exportZip();
    else if (act === 'remove') remove();
    else if (act === 'edit-logos') editInLogos();
    else if (act === 'stop-using') stopUsing();
    else if (act === 'open-logos') openInLogos();
    else if (act === 'retry') { eng = 'loading'; booted = false; paint(); boot(); }
    else if (act === 'fix') {
      const res = cur && cur.result;
      const w = res && res.warnings[Number(b.dataset.i)];
      if (w && w.fix) edit(function (r) { r.device.crop = w.fix.crop; }, true);
    }
  }

  function remove() {
    clearTimeout(timer); clearTimeout(regenTimer);
    pending = null; ++seq; cur = null; staleNote = ''; sizeNote = ''; showStyles = false;
    state.content.logo = null;
    lastSig = signature();
    built = '';
    render();
    paint();
  }

  /* ======================= 9. boot ======================= */

  async function boot() {
    if (booted && eng !== 'error') return;
    booted = true;
    try {
      await LogoEngine.ready();
      man = await LogoEngine.manifest();
      eng = 'ready';
    } catch (e) {
      eng = 'error';
      engError = String(e && e.message || e).replace(/^LogoEngine:\s*/, '');
    }
    if (visible()) paint(); else needsPaint = true;
    const logo = state.content && state.content.logo;
    if (eng === 'ready' && logo && stale(logo)) regenerate();
  }

  function init() {
    panel = $('sdPanel-logo');
    host = $('logoStudio');
    if (!panel || !host || typeof LogoEngine === 'undefined') return;
    host.innerHTML = '<div class="sd-sec-head"><h3>Or make one</h3><p>A wordmark built from your brand name, fonts and colours.</p></div>' + SKELETON;
    host.addEventListener('input', onInput);
    host.addEventListener('change', onChange);
    host.addEventListener('click', onClick);
    new MutationObserver(function () {
      if (!visible()) return;
      if (!booted) boot();
      if (needsPaint || built === '') paint();
    })
      .observe(panel, { attributes: true, attributeFilter: ['hidden'] });
    // run after every render(): fonts, ink and name changes regenerate the stored files
    if (typeof window.render === 'function' && !window.render.__logoStudio) {
      const orig = window.render;
      const wrapped = function () {
        const r = orig.apply(this, arguments);
        try { sync(); } catch (e) { console.error('Logo Studio sync failed', e); }
        return r;
      };
      wrapped.__logoStudio = true;
      window.render = wrapped;
    }
    lastSig = '';
    if (visible()) { boot(); paint(); }
    sync();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  // Console / test hook: build and store a contract recipe, e.g. the Nominal one.
  async function apply(recipe) { const res = await compute(clone(recipe)); return commit(res) ? state.content.logo : null; }

  return { sync: sync, compute: compute, paint: paint, apply: apply };
})();
