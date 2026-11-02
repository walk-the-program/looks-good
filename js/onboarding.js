/* ---------------------------------------------------------------------
   onboarding.js — everything that makes the first minute good.

     - Onboarding.createFromPreset(preset): turns a plain preset object into a saved
       library brand (used by the logo start, the three questions and the showcase brands).
     - Onboarding.newBrand(): the "New brand" dialog with three ways in: your logo,
       three questions, or just a name.
     - The empty-library state: one animated example cycling through three styles.
     - Coach marks: three one-time tips, at most one per session, remembered in localStorage; "Turn off tips" in a tip stops them for good.

   A preset is:
     { name, tagline, colors:{primary,secondary,accent,neutralDark,neutralLight},
       headingFont, bodyFont, aesthetic, bgMode?, logoDataUrl?,
       content?:{sectionTitle,quoteText,quoteAuthor} }

   Depends on app.js (freshState, defaultTypography, CONTENT_DEFAULTS), persistence.js,
   library-store.js, aesthetic-board.js (abView, boardHtml), logo-start.js. Optional:
   showcase-brands.js, Show.reveal() from another module (always type-guarded).
   Plain <script>, no modules.
------------------------------------------------------------------------ */

const Onboarding = (function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const reduceMotion = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const isShowcase = () => document.body.dataset.showcase === 'on' || (typeof window.isShowcase === 'function' && window.isShowcase());

  function hashOf(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  /* ======================= presets -> saved brands ======================= */

  const COLOR_KEYS = ['primary', 'secondary', 'accent', 'neutralDark', 'neutralLight'];

  // A serialized brand (the same shape serializeState() writes) built from a preset,
  // without touching the open editor's `state`.
  function buildSavedState(preset) {
    const st = freshState();
    const aesthetic = aestheticByKey(preset.aesthetic);
    const colors = preset.colors && COLOR_KEYS.every(k => /^#[0-9a-f]{6}$/i.test(preset.colors[k])) ? preset.colors : generatePalette('analogous', 210);
    st.colors = Object.fromEntries(COLOR_KEYS.map(k => [k, String(colors[k]).toLowerCase()]));
    st.scheme = 'custom';
    st.hue = Math.round(hexToHsl(st.colors.primary).h);
    st.headingFont = fontByName(preset.headingFont) || fontByName('Inter') || FONTS[0];
    st.bodyFont = fontByName(preset.bodyFont) || fontByName('Inter') || FONTS[0];
    st.aesthetic = aesthetic.key;
    // The aesthetic's own recommended mode, unless the preset says otherwise.
    st.bgMode = preset.bgMode === 'dark' || preset.bgMode === 'light' ? preset.bgMode : aesthetic.mode;
    st.content = Object.assign({}, CONTENT_DEFAULTS, preset.content || {}, { brandName: preset.name, tagline: preset.tagline });
    st.logoDataUrl = preset.logoDataUrl || null;
    st.typography = defaultTypography();
    return serializeState(st);
  }

  // Adds the brand to the library. open:true (default) also opens it in the editor.
  async function createFromPreset(preset, opts) {
    const open = !opts || opts.open !== false;
    const now = (opts && opts.at) || Date.now();
    const rec = {
      id: LibraryStore.newId(), name: preset.name, createdAt: now, updatedAt: now,
      savedState: buildSavedState(preset), draftState: null,
    };
    if (preset.source) rec.source = preset.source;
    await LibraryStore.put(rec);
    if (open) await BrandSession.openBrand(rec.id);
    return rec;
  }

  /* ======================= mini boards ======================= */

  // A real board at a fixed design width, shrunk with CSS zoom into a small frame
  // (the same technique as the Compare wall). Built from a throwaway state.
  const MINI_DESIGN_W = 900;

  function presetView(preset, over) {
    const merged = Object.assign({}, preset, over || {});
    const saved = buildSavedState(merged);
    const st = freshState();
    st.colors = generatePalette('analogous', 210);
    const { logoDataUrl, ...rest } = saved;
    applySavedSessionToState(rest, st);
    st.logoDataUrl = logoDataUrl;
    return abView(st);
  }

  function miniBoardHtml(preset, over) {
    const v = presetView(preset, over);
    const merged = Object.assign({}, preset, over || {});
    const heading = fontByName(merged.headingFont) || FONTS[0];
    const body = fontByName(merged.bodyFont) || FONTS[0];
    // The board reads its copy from the editor's own `state` (effectiveContent), so the
    // preset's words are swapped in for the duration of this one synchronous render.
    let html;
    const keep = state.content;
    state.content = Object.assign({}, CONTENT_DEFAULTS, merged.content || {}, { brandName: merged.name, tagline: merged.tagline });
    try { html = boardHtml(v.state, v.def); } catch (e) { html = '<div class="ob-mini-fail"></div>'; } finally { state.content = keep; }
    return {
      html,
      style: `--font-heading:${heading.css.replace(/"/g, "'")};--font-body:${body.css.replace(/"/g, "'")}`,
      fonts: [heading, body],
      name: v.def.name || '',
    };
  }

  function fitMini(frame) {
    const w = frame.clientWidth;
    if (!w) return;
    frame.style.setProperty('--ob-zoom', (w / MINI_DESIGN_W).toFixed(4));
  }
  const miniObserver = 'ResizeObserver' in window ? new ResizeObserver(entries => entries.forEach(e => {
    // A frame removed from the page reports once (size 0): stop watching it so frames don't pile up.
    if (!e.target.isConnected) miniObserver.unobserve(e.target); else fitMini(e.target);
  })) : null;

  // Returns an element: frame > board. Fonts load in the background; the frame fades in.
  function miniBoardEl(preset, over) {
    const m = miniBoardHtml(preset, over);
    const frame = document.createElement('div');
    frame.className = 'ob-mini-frame is-loading';
    frame.setAttribute('style', m.style);
    frame.innerHTML = `<div class="ob-mini-board" inert>${m.html}</div>`;
    const reveal = () => { fitMini(frame); frame.classList.remove('is-loading'); };
    const loads = window.loadFontFamily ? m.fonts.map(f => { try { return window.loadFontFamily(f); } catch (e) { return null; } }) : [];
    Promise.all(loads).then(reveal, reveal);
    // Never wait forever on a slow font request.
    setTimeout(reveal, 1800);
    if (miniObserver) miniObserver.observe(frame);
    requestAnimationFrame(() => fitMini(frame));
    frame.dataset.aesthetic = m.name;
    return frame;
  }

  /* ======================= keeping the logo visible ======================= */

  // Some aesthetics set the logo on their own dark band, or on a canvas it disappears into.
  // This renders the real board off screen, finds what the logo actually sits on, and checks
  // every colour of the mark against it. Returns the lowest contrast ratio found.
  function parseRgb(css) {
    const m = /rgba?\(([^)]+)\)/.exec(css || '');
    if (!m) return null;
    const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }
  function logoContrast(preset, over, tones) {
    if (!tones || !tones.length) return 21;
    const m = miniBoardHtml(preset, over);
    const host = document.createElement('div');
    host.setAttribute('style', 'position:fixed;left:-9999px;top:0;width:900px;pointer-events:none;' + m.style);
    host.innerHTML = m.html;
    document.body.appendChild(host);
    let worst = 21;
    try {
      let el = host.querySelector('.ab-logo');
      let bg = null;
      while (el && el !== document.body) {
        const c = parseRgb(getComputedStyle(el).backgroundColor);
        if (c && c.a > 0.9) { bg = '#' + [c.r, c.g, c.b].map(v => Math.round(v).toString(16).padStart(2, '0')).join(''); break; }
        el = el.parentElement;
      }
      if (bg) tones.forEach(t => { worst = Math.min(worst, contrastRatio(t, bg)); });
    } finally { host.remove(); }
    return worst;
  }

  // Tries the suggested aesthetic in its own mode and the other mode, then the fallbacks,
  // and keeps the first where the logo is clearly visible (best one if none is).
  function fitLogo(an) {
    const make = () => LogoStart.presetFromAnalysis(an, { name: 'Preview' });
    const tries = [];
    [an.aesthetic].concat(an.alts || []).forEach((key, i) => {
      const def = aestheticByKey(key);
      const first = i === 0 ? an.bgMode : def.mode;
      [first, first === 'dark' ? 'light' : 'dark'].forEach(mode => tries.push({ key, mode, i }));
    });
    const NEED = 3.5;
    let best = null;
    for (const t of tries) {
      let c;
      try { c = logoContrast(make(), { aesthetic: t.key, bgMode: t.mode }, an.tones); } catch (e) { c = 21; }
      if (!best || c > best.c) best = { t, c };
      if (c >= NEED) { best = { t, c }; break; }
    }
    if (best && (best.t.key !== an.aesthetic || best.t.mode !== an.bgMode)) {
      const changed = best.t.key !== an.aesthetic;
      an.aesthetic = best.t.key;
      an.bgMode = best.t.mode;
      if (changed) {
        an.fonts = LogoStart.suggestFonts(an.character, an.aesthetic, an.seed);
        an.why = 'Chosen so your logo stays easy to see.';
      }
    }
    an.logoContrast = best ? best.c : null;
    return an;
  }

  async function analyzeLogo(file) {
    const res = await LogoStart.analyzeFile(file);
    fitLogo(res.analysis);
    return res;
  }

  /* ======================= the three questions ======================= */

  // loud: 0 quiet .. 1 loud. kinds: what it suits. hue: its signature colour.
  const STYLE_TABLE = [
    { key: 'soft-form', loud: 0.15, kinds: 'app product shop studio', hue: 20 },
    { key: 'japanese-minimal', loud: 0.05, kinds: 'website shop studio product', hue: 150 },
    { key: 'editorial-serif', loud: 0.2, kinds: 'website studio shop', hue: 12 },
    { key: 'dystopian-luxury', loud: 0.3, kinds: 'website product shop studio', hue: 215 },
    { key: 'aurora-noir', loud: 0.35, kinds: 'app product', hue: 268 },
    { key: 'industrial-device', loud: 0.3, kinds: 'product app', hue: 28 },
    { key: 'bento-grid', loud: 0.4, kinds: 'app website product', hue: 228 },
    { key: 'data-pebble', loud: 0.2, kinds: 'app product website', hue: 150 },
    { key: 'toy-press', loud: 0.6, kinds: 'app product website', hue: 192 },
    { key: 'live-tile', loud: 0.35, kinds: 'app product website', hue: 215 },
    { key: 'mainframe', loud: 0.25, kinds: 'app product website', hue: 215 },
    { key: 'tonal-shape', loud: 0.3, kinds: 'app product website', hue: 265 },
    { key: 'isogrid', loud: 0.25, kinds: 'app product website', hue: 225 },
    { key: 'tab-stack', loud: 0.55, kinds: 'app product website', hue: 165 },
    { key: 'patchbay', loud: 0.35, kinds: 'app product website', hue: 245 },
    { key: 'paddock-pass', loud: 0.6, kinds: 'website product app', hue: 205 },
    { key: 'holo-iridescent', loud: 0.5, kinds: 'app product studio', hue: 285 },
    { key: 'mesh-gradient', loud: 0.5, kinds: 'app website studio', hue: 262 },
    { key: 'gorpcore', loud: 0.55, kinds: 'shop product website', hue: 98 },
    { key: 'naive-doodle', loud: 0.55, kinds: 'shop studio website', hue: 36 },
    { key: 'old-web', loud: 0.65, kinds: 'website studio', hue: 42 },
    { key: 'wpa-screenprint', loud: 0.5, kinds: 'website shop studio', hue: 140 },
    { key: 'xerox', loud: 0.6, kinds: 'studio shop website', hue: 4 },
    { key: 'corporate-vandalism', loud: 0.75, kinds: 'website studio app', hue: 218 },
    { key: 'xerox-punk', loud: 0.85, kinds: 'shop studio website', hue: 8 },
    { key: 'radical-memphis', loud: 0.85, kinds: 'shop app studio', hue: 332 },
    { key: 'neo-brutal-pop', loud: 0.8, kinds: 'app shop website product', hue: 48 },
    { key: 'pirate-broadcast', loud: 0.9, kinds: 'studio website app', hue: 352 },
    { key: 'acid-graphics', loud: 0.95, kinds: 'app studio product', hue: 92 },
  ];
  const LOUD_TARGET = { quiet: 0.12, middle: 0.5, loud: 0.92 };
  const NAME_POOL = ['Fieldnote', 'Kestrel', 'Northlight', 'Tandem', 'Juniper & Co.', 'Marlow', 'Halfmoon', 'Pilot Light', 'Common Ground', 'Odd Socks'];

  function ownPair(key) {
    const m = typeof aestheticMeta === 'function' ? aestheticMeta(key) : null;
    const list = (m && m.fonts && m.fonts.pairings) || [];
    const ok = list.find(p => fontByName(p[0]) && fontByName(p[1]));
    return ok ? { heading: ok[0], body: ok[1] } : { heading: 'Inter', body: 'Inter' };
  }

  function taglineFromAudience(audience) {
    const a = String(audience || '').trim().replace(/[.!?\s]+$/, '');
    if (!a) return '';
    if (/^(for|made for|built for)\b/i.test(a)) return a.charAt(0).toUpperCase() + a.slice(1) + '.';
    return `Made for ${a.charAt(0).toLowerCase() + a.slice(1)}.`;
  }

  // Three presets that fit the answers, side by side. Pure given the answers.
  function questionPresets(ans) {
    const target = LOUD_TARGET[ans.loud] != null ? LOUD_TARGET[ans.loud] : 0.5;
    const jit = k => (hashOf(k + '|' + (ans.who || '') + '|' + (ans.kind || '')) % 100) / 400;
    const scored = STYLE_TABLE
      .filter(r => aestheticByKey(r.key).key === r.key)
      .map(r => ({ r, score: (r.kinds.split(' ').includes(ans.kind) ? 1 : 0.3) + (1 - Math.abs(r.loud - target) * 1.5) * 1.4 + jit(r.key) }))
      .sort((a, b) => b.score - a.score);
    // Three that look different from each other: skip a second pick within 40 degrees of a chosen hue.
    const picks = [];
    for (const s of scored) {
      if (picks.length === 3) break;
      if (picks.some(p => hueDiff(p.r.hue, s.r.hue) < 40)) continue;
      picks.push(s);
    }
    for (const s of scored) { if (picks.length === 3) break; if (!picks.includes(s)) picks.push(s); }

    const name = (ans.name || '').trim() || NAME_POOL[hashOf((ans.who || '') + (ans.kind || '')) % NAME_POOL.length];
    const sat = { quiet: 40, middle: 60, loud: 88 }[ans.loud] || 60;
    const lit = { quiet: 40, middle: 46, loud: 52 }[ans.loud] || 46;
    return picks.map((p, i) => {
      const hue = (p.r.hue + (ans.who ? (hashOf(ans.who) % 21) - 10 : 0) + 360) % 360;
      const ex = { chromatic: [{ h: hue, s: sat, l: lit, share: 1, hex: '#000000' }], seed: hashOf(p.r.key + (ans.who || '')) };
      const pal = LogoStart.tastePalette(ex);
      const fonts = ownPair(p.r.key);
      return {
        name,
        tagline: taglineFromAudience(ans.who) || LogoStart.taglineFor(p.r.key, i + hashOf(name)),
        colors: pal.colors, headingFont: fonts.heading, bodyFont: fonts.body, aesthetic: p.r.key,
        source: 'questions',
      };
    });
  }

  /* ======================= the New brand dialog ======================= */

  const KINDS = [['app', 'An app'], ['website', 'A website'], ['product', 'A product'], ['shop', 'A shop'], ['studio', 'A studio']];
  const LOUDS = [['quiet', 'Quiet'], ['middle', 'In between'], ['loud', 'Loud']];

  const ICON_UP = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M5 20h14"/></svg>';

  function dialogHtml() {
    return `
      <form class="dlg ob-dlg" role="dialog" aria-modal="true" aria-label="New brand" novalidate>
        <h2 class="dlg-title">New brand</h2>
        <div class="ob-tabs" role="tablist" aria-label="How do you want to start?">
          <button type="button" role="tab" class="ob-tab" data-tab="logo" id="obTabLogo" aria-controls="obPaneLogo">Your logo</button>
          <button type="button" role="tab" class="ob-tab" data-tab="questions" id="obTabQuestions" aria-controls="obPaneQuestions">Three questions</button>
          <button type="button" role="tab" class="ob-tab" data-tab="name" id="obTabName" aria-controls="obPaneName">Just a name</button>
        </div>

        <section class="ob-pane" id="obPaneLogo" data-pane="logo" role="tabpanel" aria-labelledby="obTabLogo">
          <div class="ob-drop" id="obDrop" tabindex="0" role="button" aria-label="Choose a logo image, or drop one here">
            <span class="ob-drop-icon">${ICON_UP}</span>
            <strong>Drop your logo here</strong>
            <span class="ob-drop-sub">or <u>choose a file</u> &middot; PNG, JPG or SVG</span>
            <span class="ob-drop-priv">Read on this computer only. Nothing is uploaded.</span>
            <input type="file" id="obFile" accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif,.svg" hidden />
          </div>
          <p class="dlg-error ob-logo-error" id="obLogoError" role="alert" hidden></p>
          <div class="ob-result" id="obResult" hidden>
            <div class="ob-result-preview" id="obPreview" aria-label="Preview of the brand"></div>
            <div class="ob-result-side">
              <div class="ob-logo-chip" id="obLogoChip"></div>
              <div class="ob-swatches" id="obSwatches" aria-label="Brand colours"></div>
              <p class="ob-suggest" id="obSuggest"></p>
              <label class="field dlg-field"><span>Brand name</span>
                <input type="text" id="obLogoName" autocomplete="off" spellcheck="false" placeholder="e.g. Northwind Provisions" /></label>
              <label class="field dlg-field"><span>Tagline</span>
                <input type="text" id="obLogoTag" autocomplete="off" spellcheck="false" placeholder="e.g. Good food, simply sourced" /></label>
              <button type="button" class="btn btn-ghost btn-small ob-again" id="obAgain">Choose another logo</button>
            </div>
          </div>
        </section>

        <section class="ob-pane" id="obPaneQuestions" data-pane="questions" role="tabpanel" aria-labelledby="obTabQuestions" hidden>
          <div class="ob-q">
            <fieldset class="ob-fieldset"><legend>What are you making?</legend>
              <div class="ob-chips" data-q="kind">${KINDS.map(([v, l]) => `<button type="button" class="ob-chip" data-v="${v}" aria-pressed="false">${l}</button>`).join('')}</div>
            </fieldset>
            <label class="field ob-who"><span>Who is it for?</span>
              <input type="text" id="obWho" autocomplete="off" spellcheck="false" placeholder="e.g. climbers who hate crowds" /></label>
            <fieldset class="ob-fieldset"><legend>Quiet or loud?</legend>
              <div class="ob-chips" data-q="loud">${LOUDS.map(([v, l]) => `<button type="button" class="ob-chip" data-v="${v}" aria-pressed="false">${l}</button>`).join('')}</div>
            </fieldset>
            <label class="field ob-who"><span>Name <em>(optional)</em></span>
              <input type="text" id="obQName" autocomplete="off" spellcheck="false" placeholder="We will suggest one" /></label>
          </div>
          <p class="ob-hint" id="obQHint">Answer the first and last question to see three directions.</p>
          <div class="ob-three" id="obThree" hidden></div>
        </section>

        <section class="ob-pane" id="obPaneName" data-pane="name" role="tabpanel" aria-labelledby="obTabName" hidden>
          <label class="field dlg-field"><span>Brand name</span>
            <input type="text" id="obName" autocomplete="off" spellcheck="false" placeholder="e.g. Northwind Provisions" /></label>
          <label class="field dlg-field"><span>Tagline</span>
            <input type="text" id="obTag" autocomplete="off" spellcheck="false" placeholder="e.g. Good food, simply sourced" /></label>
          <p class="dlg-error" id="obNameError" role="alert" hidden></p>
        </section>

        <div class="dlg-actions">
          <button type="button" class="btn btn-ghost" data-act="cancel">Cancel</button>
          <button type="submit" class="btn btn-primary" data-act="create" disabled>Create brand</button>
        </div>
      </form>`;
  }

  // The staged reveal belongs to another module (js/reveal.js); when it exists, the new brand
  // arrives with it. Never awaited, never fatal.
  function reveal(source) {
    if (window.Show && typeof window.Show.reveal === 'function') {
      try { window.Show.reveal({ source }); } catch (err) { /* the brand is already open */ }
    }
  }

  // fileFirst: a file dropped on the library, handed straight to the logo tab.
  function openNewBrand(fallback, fileFirst) {
    if (document.querySelector('.ob-overlay')) return Promise.resolve();
    return new Promise(resolve => {
      const previousFocus = document.activeElement;
      const overlay = document.createElement('div');
      overlay.className = 'dlg-overlay ob-overlay';
      overlay.innerHTML = dialogHtml();
      document.body.appendChild(overlay);
      document.body.classList.add('has-dialog');
      const form = overlay.querySelector('form');
      const q = sel => overlay.querySelector(sel);
      const createBtn = q('[data-act="create"]');

      let tab = 'logo';
      let analysis = null;        // { dataUrl, analysis, name }
      let answers = { kind: '', loud: '', who: '' };
      let qPresets = [];
      let busy = false;

      // The dialog is already gone when the brand is made, so a failure must be told, not swallowed.
      async function make(job, source) {
        try { await job(); } catch (err) { showToast('Could not create the brand'); return; }
        if (source) reveal(source);
      }

      function close() {
        clearTimeout(previewTimer); clearTimeout(qTimer);
        overlay.remove();
        document.body.classList.remove('has-dialog');
        if (previousFocus && previousFocus.focus) previousFocus.focus();
        resolve();
      }

      function setTab(next) {
        tab = next;
        overlay.querySelectorAll('.ob-tab').forEach(b => {
          const on = b.dataset.tab === tab;
          b.setAttribute('aria-selected', String(on));
          b.tabIndex = on ? 0 : -1;
        });
        overlay.querySelectorAll('.ob-pane').forEach(p => { p.hidden = p.dataset.pane !== tab; });
        form.classList.toggle('is-wide', tab === 'questions' || (tab === 'logo' && !!analysis));
        syncCreate();
      }
      function syncCreate() {
        createBtn.hidden = tab === 'questions';
        if (tab === 'logo') createBtn.disabled = !analysis || busy;
        else createBtn.disabled = busy;
      }

      /* ---- logo tab ---- */
      const drop = q('#obDrop'), fileInput = q('#obFile'), logoErr = q('#obLogoError');
      const showLogoError = msg => { logoErr.textContent = msg; logoErr.hidden = !msg; };

      function logoPreset() {
        const name = q('#obLogoName').value.trim() || 'Your brand';
        const tagline = q('#obLogoTag').value.trim();
        return LogoStart.presetFromAnalysis(analysis.analysis, { name, tagline });
      }
      let previewTimer = null;
      function paintPreview() {
        if (!analysis) return;
        const host = q('#obPreview');
        host.replaceChildren(miniBoardEl(logoPreset()));
      }
      function schedulePreview() { clearTimeout(previewTimer); previewTimer = setTimeout(paintPreview, 220); }

      async function takeFile(file) {
        showLogoError('');
        if (!file) return;
        drop.classList.add('is-working');
        try {
          const res = await analyzeLogo(file);
          analysis = res;
          const an = res.analysis;
          q('#obLogoName').value = res.name || '';
          q('#obLogoTag').value = LogoStart.taglineFor(an.aesthetic, an.seed);
          const c = an.palette.colors;
          q('#obLogoChip').innerHTML = `<img src="${esc(res.dataUrl)}" alt="Your logo" />`;
          q('#obLogoChip').style.background = an.bgMode === 'dark' ? c.neutralDark : c.neutralLight;
          q('#obSwatches').innerHTML = ['primary', 'secondary', 'accent', 'neutralLight', 'neutralDark']
            .map(k => `<i style="background:${c[k]}" title="${k}"></i>`).join('');
          const aes = aestheticByKey(an.aesthetic);
          q('#obSuggest').innerHTML = `<strong>${esc(aes.name)}</strong> with ${esc(an.fonts.heading)}${an.fonts.body !== an.fonts.heading ? ' and ' + esc(an.fonts.body) : ''}. ${esc(an.why)}`;
          drop.hidden = true;
          q('#obResult').hidden = false;
          form.classList.add('is-wide');
          paintPreview();
          syncCreate();
          (q('#obLogoName')).focus();
        } catch (e) {
          showLogoError(e && e.message ? e.message : 'That file could not be read.');
        } finally {
          drop.classList.remove('is-working');
        }
      }
      drop.addEventListener('click', () => fileInput.click());
      drop.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); } });
      fileInput.addEventListener('change', () => { const f = fileInput.files[0]; fileInput.value = ''; takeFile(f); });
      ['dragenter', 'dragover'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.add('is-over'); }));
      ['dragleave', 'dragend'].forEach(t => drop.addEventListener(t, () => drop.classList.remove('is-over')));
      drop.addEventListener('drop', e => {
        e.preventDefault(); e.stopPropagation();
        drop.classList.remove('is-over');
        takeFile(e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]);
      });
      q('#obAgain').addEventListener('click', () => {
        analysis = null;
        q('#obResult').hidden = true;
        drop.hidden = false;
        form.classList.remove('is-wide');
        syncCreate();
        drop.focus();
      });
      q('#obLogoName').addEventListener('input', () => { showLogoError(''); schedulePreview(); });
      q('#obLogoTag').addEventListener('input', schedulePreview);

      /* ---- questions tab ---- */
      function renderThree() {
        const ready = answers.kind && answers.loud;
        q('#obQHint').hidden = !!ready;
        q('#obThree').hidden = !ready;
        if (!ready) return;
        qPresets = questionPresets(Object.assign({ name: q('#obQName').value }, answers));
        const host = q('#obThree');
        host.innerHTML = '';
        qPresets.forEach((p, i) => {
          const card = document.createElement('button');
          card.type = 'button';
          card.className = 'ob-card';
          card.dataset.i = String(i);
          card.setAttribute('aria-label', `Use ${aestheticByKey(p.aesthetic).name}`);
          const frame = miniBoardEl(p);
          card.appendChild(frame);
          const cap = document.createElement('span');
          cap.className = 'ob-card-cap';
          cap.innerHTML = `<strong>${esc(aestheticByKey(p.aesthetic).name)}</strong><em>${esc(aestheticByKey(p.aesthetic).descriptor || '')}</em>`;
          card.appendChild(cap);
          host.appendChild(card);
        });
      }
      let qTimer = null;
      const scheduleThree = () => { clearTimeout(qTimer); qTimer = setTimeout(renderThree, 260); };
      overlay.querySelectorAll('.ob-chips').forEach(group => {
        group.addEventListener('click', e => {
          const b = e.target.closest('.ob-chip');
          if (!b) return;
          answers[group.dataset.q] = b.dataset.v;
          group.querySelectorAll('.ob-chip').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
          renderThree();
        });
      });
      q('#obWho').addEventListener('input', () => { answers.who = q('#obWho').value.trim(); scheduleThree(); });
      q('#obQName').addEventListener('input', scheduleThree);
      q('#obThree').addEventListener('click', async e => {
        const card = e.target.closest('.ob-card');
        if (!card || busy) return;
        busy = true;
        const preset = qPresets[Number(card.dataset.i)];
        close();
        await make(() => createFromPreset(preset), 'questions');
      });

      /* ---- name tab ---- */
      async function submitName() {
        const name = q('#obName').value.trim(), tagline = q('#obTag').value.trim();
        const err = q('#obNameError');
        const missing = !name ? ['Brand name', q('#obName')] : (!tagline ? ['Tagline', q('#obTag')] : null);
        if (missing) { err.textContent = `${missing[0]} is required.`; err.hidden = false; missing[1].focus(); return; }
        busy = true;
        close();
        await make(() => BrandSession.createBrand(name, tagline));
      }
      q('#obName').addEventListener('input', () => { q('#obNameError').hidden = true; });
      q('#obTag').addEventListener('input', () => { q('#obNameError').hidden = true; });

      /* ---- shared ---- */
      overlay.querySelectorAll('.ob-tab').forEach(b => b.addEventListener('click', () => setTab(b.dataset.tab)));
      form.querySelector('[role="tablist"]').addEventListener('keydown', e => {
        const tabs = Array.from(overlay.querySelectorAll('.ob-tab'));
        const i = tabs.findIndex(t => t.dataset.tab === tab);
        if (e.key === 'ArrowRight') { e.preventDefault(); const t = tabs[(i + 1) % tabs.length]; setTab(t.dataset.tab); t.focus(); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); const t = tabs[(i - 1 + tabs.length) % tabs.length]; setTab(t.dataset.tab); t.focus(); }
      });
      q('[data-act="cancel"]').addEventListener('click', close);
      form.addEventListener('submit', async e => {
        e.preventDefault();
        if (busy) return;
        if (tab === 'name') return submitName();
        if (tab === 'logo' && analysis) {
          if (!q('#obLogoName').value.trim()) {
            showLogoError('Brand name is required.');
            q('#obLogoName').focus();
            return;
          }
          busy = true; syncCreate();
          const preset = logoPreset();
          close();
          await make(() => createFromPreset(preset), 'logo');
        }
      });
      overlay.addEventListener('mousedown', e => { if (e.target === overlay) close(); });
      overlay.addEventListener('keydown', e => {
        e.stopPropagation();    // keep Space-to-shuffle and friends out of the dialog
        if (e.key === 'Escape') { e.preventDefault(); close(); return; }
        if (e.key === 'Enter' && e.target.tagName === 'BUTTON' && !e.target.matches('[type="submit"]')) return;
        if (e.key === 'Tab') {
          const items = Array.from(overlay.querySelectorAll('input:not([type="file"]), button, [tabindex="0"]')).filter(x => x.offsetParent !== null && !x.disabled && x.tabIndex >= 0);
          if (!items.length) return;
          const first = items[0], last = items[items.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      });

      setTab(fileFirst ? 'logo' : 'logo');
      if (fileFirst) takeFile(fileFirst); else drop.focus();
    });
  }

  // The library's entry point: the three-way dialog when this module is loaded, otherwise
  // the plain name-and-tagline form passed in.
  function newBrand(fallback, fileFirst) {
    if (typeof LogoStart === 'undefined') return fallback ? fallback() : Promise.resolve();
    return openNewBrand(fallback, fileFirst);
  }

  /* ======================= the empty library ======================= */

  let cycleTimer = null;
  let cycleBuilt = false;

  function exampleBrand() {
    const fromShowcase = window.ShowcaseBrands && ShowcaseBrands.example && ShowcaseBrands.example();
    return fromShowcase || {
      name: 'Little Kiln Coffee', tagline: 'Roasted small. Poured slow.',
      colors: { primary: '#b8482a', secondary: '#f0bd4a', accent: '#3d6a55', neutralDark: '#2b1d16', neutralLight: '#fbf4e8' },
      headingFont: 'Fraunces', bodyFont: 'Work Sans', aesthetic: 'soft-form',
    };
  }
  const CYCLE = [['soft-form', null], ['pirate-broadcast', null], ['naive-doodle', null]];

  function buildEmpty(host) {
    const showcaseReady = !!window.ShowcaseBrands;
    host.classList.add('ob-empty');
    host.innerHTML = `
      <div class="ob-empty-stage" aria-hidden="true">
        <div class="ob-empty-frames" id="obCycle"></div>
        <div class="ob-empty-label"><span id="obCycleName"></span></div>
      </div>
      <div class="ob-empty-copy">
        <h2>One brand, any number of worlds</h2>
        <p>Give it a logo, or just a name, and watch it take on a whole style: colour, type, and a board to brief anyone who builds with it.</p>
        <div class="ob-empty-actions">
          <button type="button" class="btn btn-primary" id="obMakeYours">Make yours</button>
          ${showcaseReady ? '<button type="button" class="btn btn-ghost" id="obEmptyShowcase">Load showcase brands</button>' : ''}
        </div>
      </div>`;
    const frames = host.querySelector('#obCycle');
    const label = host.querySelector('#obCycleName');
    const base = exampleBrand();
    const items = CYCLE.map(([key]) => {
      const aes = aestheticByKey(key);
      const el = miniBoardEl(base, { aesthetic: key });
      el.classList.add('ob-cycle-item');
      frames.appendChild(el);
      return { el, name: aes.name };
    });
    let i = 0;
    const show = n => {
      items.forEach((it, k) => it.el.classList.toggle('is-on', k === n));
      label.textContent = items[n].name;
    };
    show(0);
    clearInterval(cycleTimer);
    cycleTimer = setInterval(() => {
      if (host.hidden || document.hidden || document.body.dataset.view !== 'library') return;
      i = (i + 1) % items.length;
      show(i);
    }, 3200);
    host.querySelector('#obMakeYours').addEventListener('click', () => LibraryUI.newBrandFlow());
    const sc = host.querySelector('#obEmptyShowcase');
    if (sc) sc.addEventListener('click', () => loadShowcase(sc));
    cycleBuilt = true;
  }

  function stopCycle() { clearInterval(cycleTimer); cycleTimer = null; cycleBuilt = false; }

  /* ======================= showcase button ======================= */

  let headBtn = null;

  async function loadShowcase(btn) {
    if (!window.ShowcaseBrands) return;
    if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = 'Adding…'; }
    let res = { added: 0, skipped: 0 };
    try { res = await ShowcaseBrands.load(); } catch (e) { showToast('Could not add the showcase brands'); }
    if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label || btn.textContent; }
    if (res.added) showToast(res.added === 1 ? 'Added 1 showcase brand' : `Added ${res.added} showcase brands`);
    else if (!res.skipped) showToast('Nothing to add');
    await LibraryUI.refresh();
  }

  function ensureHeadButton() {
    if (headBtn || !window.ShowcaseBrands) return;
    const newBtn = $('libNew');
    if (!newBtn || !newBtn.parentNode) return;
    const wrap = document.createElement('div');
    wrap.className = 'lib-head-actions';
    newBtn.parentNode.insertBefore(wrap, newBtn);
    headBtn = document.createElement('button');
    headBtn.type = 'button';
    headBtn.className = 'btn btn-ghost';
    headBtn.id = 'libShowcase';
    headBtn.textContent = 'Load showcase brands';
    headBtn.addEventListener('click', () => loadShowcase(headBtn));
    wrap.appendChild(headBtn);
    wrap.appendChild(newBtn);
  }

  // Called by the library after every refresh.
  function libraryChanged(records) {
    ensureHeadButton();
    if (headBtn) {
      const have = new Set((records || []).map(r => String(r.name || '').trim().toLowerCase()));
      const missing = ShowcaseBrands.names().some(n => !have.has(n.toLowerCase()));
      headBtn.hidden = !missing;
    }
    const empty = $('libEmpty');
    if (!empty) return;
    if (!records || records.length === 0) {
      if (!cycleBuilt) buildEmpty(empty);
    } else if (cycleBuilt) {
      stopCycle();
    }
  }

  /* ======================= dropping a logo anywhere on the library ======================= */

  function wireWindowDrop() {
    const hasFiles = e => e.dataTransfer && Array.from(e.dataTransfer.types || []).includes('Files');
    window.addEventListener('dragover', e => { if (hasFiles(e)) e.preventDefault(); });
    window.addEventListener('drop', e => {
      if (!hasFiles(e)) return;
      e.preventDefault();      // never let the window navigate to a dropped file
      if (document.querySelector('.ob-overlay') || document.body.dataset.view !== 'library') return;
      const f = e.dataTransfer.files && e.dataTransfer.files[0];
      if (f && typeof LogoStart !== 'undefined' && LogoStart.accepts(f)) openNewBrand(null, f);
    });
  }

  /* ======================= coach marks ======================= */

  const COACH_KEY = 'bd.coach.v1';
  const TIPS = [
    { id: 'shuffle', find: () => $('shuffleAll'), side: 'bottom', title: 'Shuffle everything', text: 'Press Space, or click here. Every press is a fresh combination of colour, type and style.' },
    // The Mix in control lives in the sidebar's Style tab; when another tab is open the tip points at that tab.
    { id: 'mix', find: () => { const b = $('blendPick'); return b && b.getClientRects().length ? b : $('sdTab-style'); }, side: 'bottom', title: 'Mix in a second style', text: 'Borrow another style’s art, type, colour or finish and blend it into this one.' },
    { id: 'built', find: () => { const r = document.querySelector('input[name="boardMode"][value="built"]'); return r && (r.closest('label') || r); }, side: 'bottom', title: 'See it built', text: 'Put your brand on a real product screen and compare it with a plain version.' },
  ];

  function coachSeen() {
    try { return JSON.parse(localStorage.getItem(COACH_KEY)) || {}; } catch (e) { return {}; }
  }
  function coachMark(id) {
    try { const s = coachSeen(); s[id] = 1; localStorage.setItem(COACH_KEY, JSON.stringify(s)); } catch (e) { /* tips may repeat without storage */ }
  }
  const COACH_OFF_KEY = 'bd.coach.off';
  let coachOff = false;       // kept in memory too, so "Turn off tips" holds this session even when storage is blocked
  function tipsOff() {
    if (coachOff) return true;
    try { return localStorage.getItem(COACH_OFF_KEY) === '1'; } catch (e) { return false; }
  }
  function turnTipsOff() {
    coachOff = true;
    try { localStorage.setItem(COACH_OFF_KEY, '1'); } catch (e) { /* off for this session only */ }
  }
  const visible = el => !!el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';

  let coachEl = null;
  let coachBusy = false;
  let coachShown = false;     // one tip per session: set the first time any tip opens

  // A tip never sits on the header toolbar or on a button that rewrites the brand.
  const COACH_KEEP_CLEAR = '.workspace-header .ws-tools, #shuffleAll, #undoShuffle, #shuffleAesthetic, #shuffleFonts, #resetTypography, #shuffleColors, #removeLogo';
  const overlaps = (a, b, pad) => a.left < b.right + pad && a.right > b.left - pad && a.top < b.bottom + pad && a.bottom > b.top - pad;

  // Tips stand aside while the brand is being shown or saved: the demo loop, present
  // mode, presenter view, and a native picture or slide capture (the deck veil or a
  // share raster on screen). A tip open when one starts closes and comes back next time.
  function coachBlocked() {
    const b = document.body;
    if (!b || b.classList.contains('is-demo') || b.classList.contains('is-presenter')) return true;
    if (document.documentElement.classList.contains('is-presenting')) return true;
    const S = window.Show || {};
    if ((typeof S.isDemo === 'function' && S.isDemo()) || (typeof S.isPresenting === 'function' && S.isPresenting())) return true;
    return !!document.querySelector('.deck-native-veil, .sh-raster');
  }
  function coachUnmark(id) {
    try { const s = coachSeen(); delete s[id]; localStorage.setItem(COACH_KEY, JSON.stringify(s)); } catch (e) { /* ignore */ }
  }

  let coachEnd = null;        // releases the open tip's timer and listeners
  function closeCoach() {
    if (coachEnd) { const end = coachEnd; coachEnd = null; end(); }
    if (coachEl) { coachEl.remove(); coachEl = null; }
  }

  function showTip(tip, target) {
    return new Promise(resolve => {
      closeCoach();
      coachShown = true;       // one tip per session
      coachMark(tip.id);       // shown once, whatever happens next
      try { target.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) { /* ignore */ }
      const el = document.createElement('div');
      el.className = 'ob-coach';
      el.setAttribute('role', 'dialog');
      el.setAttribute('aria-label', tip.title);
      el.dataset.side = tip.side;
      el.innerHTML = `<strong>${esc(tip.title)}</strong><p>${esc(tip.text)}</p><div class="ob-coach-actions"><button type="button" class="btn btn-primary btn-small" data-coach="ok">Got it</button><button type="button" class="ob-coach-off" data-coach="off">Turn off tips</button></div>`;
      document.body.appendChild(el);
      coachEl = el;
      // Try the preferred side, then the others; take the first spot that fits on screen without
      // covering the target, the header toolbar or a shuffle/reset button. Falls back to below.
      const place = () => {
        const r = target.getBoundingClientRect(), c = el.getBoundingClientRect();
        const vw = window.innerWidth, vh = window.innerHeight, M = 12, GAP = 14;
        const clear = Array.from(document.querySelectorAll(COACH_KEEP_CLEAR)).filter(visible).map(n => n.getBoundingClientRect());
        const clamp = (v, lo, hi) => Math.max(lo, Math.min(v, Math.max(lo, hi)));
        const spot = side => {
          let left, top;
          if (side === 'bottom') { left = r.left + r.width / 2 - c.width / 2; top = r.bottom + GAP; }
          else if (side === 'top') { left = r.left + r.width / 2 - c.width / 2; top = r.top - c.height - GAP; }
          else if (side === 'left') { left = r.left - c.width - GAP; top = r.top + r.height / 2 - c.height / 2; }
          else { left = r.right + GAP; top = r.top + r.height / 2 - c.height / 2; }
          const L = clamp(left, M, vw - c.width - M), T = clamp(top, M, vh - c.height - M);
          const box = { left: L, top: T, right: L + c.width, bottom: T + c.height };
          const shifted = (side === 'bottom' || side === 'top') ? Math.abs(T - top) > 2 : Math.abs(L - left) > 2;
          return { side, L, T, box, ok: !shifted && !overlaps(box, r, 2) && !clear.some(k => k !== r && overlaps(box, k, 0)) };
        };
        const order = [tip.side, 'bottom', 'right', 'top', 'left'].filter((x, i, a) => a.indexOf(x) === i);
        const pick = order.map(spot).find(x => x.ok) || spot('bottom');
        el.dataset.side = pick.side;
        el.style.left = pick.L + 'px';
        el.style.top = pick.T + 'px';
        const ax = r.left + r.width / 2 - pick.L, ay = r.top + r.height / 2 - pick.T;
        el.style.setProperty('--ob-ax', Math.max(18, Math.min(ax, c.width - 18)) + 'px');
        el.style.setProperty('--ob-ay', Math.max(18, Math.min(ay, c.height - 18)) + 'px');
      };
      place();
      requestAnimationFrame(() => { place(); el.classList.add('is-in'); });
      target.classList.add('ob-coach-target');
      // Closed by a show starting (not by the person): the tip is not used up.
      const watch = setInterval(() => { if (coachBlocked()) { coachUnmark(tip.id); done(); } }, 250);
      const done = () => {
        coachEnd = null;
        clearInterval(watch);
        target.classList.remove('ob-coach-target');
        window.removeEventListener('resize', place);
        document.removeEventListener('keydown', onKey, true);
        target.removeEventListener('click', done);
        target.removeEventListener('click', guard, true);
        closeCoach();
        resolve();
      };
      const onKey = e => {
        if (e.key !== 'Escape') return;
        if (coachBlocked()) { coachUnmark(tip.id); done(); return; }   // the show's Esc goes through
        // Esc inside an open menu or dialog belongs to it; the tip stays.
        const t = e.target;
        if (t && t.closest && !el.contains(t) && t.closest('[role="menu"], [role="dialog"], [role="listbox"], dialog')) return;
        e.stopPropagation(); done();
      };
      window.addEventListener('resize', place);
      document.addEventListener('keydown', onKey, true);
      coachEnd = done;
      // A click aimed at the tip must never fall through to the control it points at: for the
      // first moments the tip is open, a click on the target only closes the tip.
      const shownAt = performance.now();
      const guard = e => { if (performance.now() - shownAt < 800) { e.preventDefault(); e.stopImmediatePropagation(); done(); } };
      target.addEventListener('click', guard, true);
      target.addEventListener('click', done, { once: true });
      el.querySelector('[data-coach="ok"]').addEventListener('click', done);
      el.querySelector('[data-coach="off"]').addEventListener('click', () => { turnTipsOff(); done(); });
    });
  }

  async function runCoach() {
    if (coachBusy || coachShown || tipsOff() || isShowcase()) return;
    coachBusy = true;
    try {
      await new Promise(r => setTimeout(r, 1700));      // let the board settle
      // A running reveal or worlds view owns the screen: wait it out (at most 10 seconds).
      for (let n = 0; n < 33 && document.querySelector('.m-reveal, .m-worlds'); n++) await new Promise(r => setTimeout(r, 300));
      if (coachBlocked()) return;
      await new Promise(r => setTimeout(r, 400));
      for (const tip of TIPS) {
        if (document.body.dataset.view !== 'editor' || isShowcase()) break;
        if (document.body.classList.contains('has-dialog')) break;
        if (document.querySelector('.m-reveal, .m-worlds') || coachBlocked()) break;
        if (coachSeen()[tip.id]) continue;
        const target = tip.find();
        if (!visible(target)) continue;                 // not on screen in this build: skip it
        await showTip(tip, target);
        break;                                          // at most one tip per session
      }
    } finally { coachBusy = false; }
  }

  function wireCoach() {
    new MutationObserver(() => {
      if (document.body.dataset.view === 'editor') runCoach(); else closeCoach();
    }).observe(document.body, { attributes: true, attributeFilter: ['data-view'] });
  }

  /* ======================= init ======================= */

  function init() {
    wireWindowDrop();
    wireCoach();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  return {
    createFromPreset, buildSavedState, newBrand, libraryChanged, questionPresets,
    miniBoardEl, loadShowcase, taglineFromAudience, analyzeLogo, fitLogo, logoContrast,
    resetCoach() { coachOff = false; coachShown = false; try { localStorage.removeItem(COACH_KEY); localStorage.removeItem(COACH_OFF_KEY); } catch (e) { /* none */ } },
  };
})();

window.Onboarding = Onboarding;   // a top-level const is not a window property; library-ui.js looks it up here
