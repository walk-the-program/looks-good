/* ---------------------------------------------------------------------
   app.js — main controller: state, rendering, and event wiring.
   Depends on data.js, color.js, rules.js, slide-mocks.js (loaded first
   as plain <script> tags — no build step, no modules).
------------------------------------------------------------------------ */

const state = {
  headingFont: FONTS[0],
  bodyFont: FONTS[0],
  typography: {
    headingSize: 44, bodySize: 16,
    headingWeight: 700, bodyWeight: 400,
    headingTracking: 0, bodyTracking: 0,
    headingCase: 'none', bodyCase: 'none',
  },
  scheme: 'analogous',
  hue: 210,
  colors: null,
  shapePreset: SHAPE_PRESETS[0],
  bgMode: 'light',
  logoImg: null,
  logoDataUrl: null,
  content: {},
  aesthetic: 'soft-form',   // key into AESTHETICS (js/aesthetics/registry.js)
  locks: { typography: false, color: false, shape: false, aesthetic: false },
  dismissed: [],   // suggestion ids dismissed for this brand
};

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function fontByName(name) { return FONTS.find(f => f.name === name); }

// How often a shuffle draws from the hand-picked PAIRINGS list rather than
// sampling the whole library. Most shuffles should land on something the
// user could actually ship.
const PAIRING_SHUFFLE_CHANCE = 0.6;

function randomizeTypography() {
  if (Math.random() < PAIRING_SHUFFLE_CHANCE) {
    const pair = pickRandom(PAIRINGS);
    const heading = fontByName(pair[0]);
    const body = fontByName(pair[1]);
    if (heading && body) {
      state.headingFont = heading;
      state.bodyFont = body;
      return;
    }
  }
  // Free-form branch. Headings may be expressive; body copy is restricted
  // to text faces (never mono, never display) and never repeats the
  // heading family, so random results stay readable.
  const heading = pickRandom(FONTS.filter(f => f.category !== 'mono'));
  const bodyPool = FONTS.filter(f =>
    (f.category === 'sans' || f.category === 'serif') && f.name !== heading.name);
  state.headingFont = heading;
  state.bodyFont = pickRandom(bodyPool);
}
// 'custom' has no offset recipe, so it's never a candidate for a random
// shuffle — only the real schemes are.
const RANDOMIZABLE_SCHEMES = Object.keys(COLOR_SCHEMES).filter(k => COLOR_SCHEMES[k].offsets);

function randomizeColor() {
  state.scheme = pickRandom(RANDOMIZABLE_SCHEMES);
  state.hue = Math.random() * 360;
  state.colors = generatePalette(state.scheme, state.hue);
}
// Hand-editing one palette color. Primary drives the rest of the palette under
// a real scheme; under 'custom' it is just another color. Editing any other
// color means the palette no longer follows a formula, so drop into 'custom' —
// further scheme/primary changes won't clobber what was just set. Callers own
// the undo snapshot and the render().
function setBrandColor(key, hex) {
  if (key === 'primary' && state.scheme !== 'custom') {
    state.colors = derivePalette(hex, state.scheme);
    return;
  }
  state.colors = { ...state.colors, [key]: hex };
  if (key !== 'primary') state.scheme = 'custom';
}

// Several colors at once (Paste brand colors): always becomes a custom palette,
// and is exactly one undo step.
function applyBrandColors(colors) {
  pushUndoSnapshot(state);
  state.colors = { ...state.colors, ...colors };
  state.scheme = 'custom';
  render();
}
function randomizeShape() {
  state.shapePreset = pickRandom(SHAPE_PRESETS);
}

// Selecting an aesthetic also takes its recommended background mode and (unless
// shape is locked) its slide shape preset.
function applyAesthetic(key) {
  const def = aestheticByKey(key);
  state.aesthetic = def.key;
  state.bgMode = def.mode;
  if (!state.locks.shape) {
    const preset = SHAPE_PRESETS.find(p => p.key === def.slideShape);
    if (preset) state.shapePreset = preset;
  }
}
// Panel tiles, prev/next and Compare tiles: one undo step, then a normal render
// (which also marks the brand unsaved via the serialized state).
function chooseAesthetic(key) {
  if (key === state.aesthetic) return;
  pushUndoSnapshot(state);
  applyAesthetic(key);
  render();
}
// Picks among the aesthetics visible under the sidebar family filter (all of
// them when the filter is "All"; visibleAesthetics() is in aesthetic-board.js).
function randomizeAesthetic() {
  let pool = (window.visibleAesthetics ? visibleAesthetics() : AESTHETICS).filter(a => a.key !== state.aesthetic);
  if (!pool.length) pool = AESTHETICS.filter(a => a.key !== state.aesthetic);
  applyAesthetic(pickRandom(pool).key);
}

// "Use recommended fonts": the first pairing in the aesthetic's font
// recommendation (js/aesthetic-meta.js). One undo step; render() marks the
// brand unsaved. Respects the Typography lock with the same toast as shuffle/swap.
function applyRecommendedFonts() {
  const meta = window.aestheticMeta ? aestheticMeta(state.aesthetic) : null;
  const pair = meta && meta.fonts.pairings[0];
  const heading = pair && fontByName(pair[0]);
  const body = pair && fontByName(pair[1]);
  if (!heading || !body) return showToast('No font recommendation for this aesthetic');
  if (state.locks.typography) return showToast('Unlock typography to use recommended fonts');
  if (state.headingFont === heading && state.bodyFont === body) return showToast('Already using the recommended fonts');
  pushUndoSnapshot(state);
  state.headingFont = heading;
  state.bodyFont = body;
  render();
  showToast(`Using ${heading.name} / ${body.name}`);
}

/* ---------------- Google Fonts loading ---------------- */

// The css2 endpoint answers 400 for the ENTIRE request if any single family
// or weight in it is wrong, and it wants families in alphabetical order. One
// giant URL would therefore be all-or-nothing — a single bad entry would
// silently strip every webfont from the page. Emitting several smaller
// <link> tags keeps the blast radius to one chunk.
const GOOGLE_FONT_CHUNK_SIZE = 12;

function googleFontChunkUrls() {
  const sorted = FONTS.slice().sort((a, b) => a.name.localeCompare(b.name));
  const urls = [];
  for (let i = 0; i < sorted.length; i += GOOGLE_FONT_CHUNK_SIZE) {
    const families = sorted.slice(i, i + GOOGLE_FONT_CHUNK_SIZE)
      .map(f => googleFamilyParam(f))
      .join('&');
    urls.push(`https://fonts.googleapis.com/css2?${families}&display=swap`);
  }
  return urls;
}

function injectGoogleFonts() {
  googleFontChunkUrls().forEach(href => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  });
}

/* ---------------- Populate controls ---------------- */

const FONT_GROUPS = [
  { category: 'serif', label: 'Serif' },
  { category: 'sans', label: 'Sans-serif' },
  { category: 'display', label: 'Display' },
  { category: 'slab', label: 'Slab serif' },
  { category: 'mono', label: 'Monospace' },
];

function populateFontSelect(select) {
  // Option values stay the FONTS index, so nothing downstream cares that the
  // list is now grouped.
  //
  // f.css (e.g. `"Inter", -apple-system, sans-serif`) contains real
  // double-quote characters, which would otherwise prematurely close the
  // double-quoted style="..." attribute below and corrupt the markup.
  select.innerHTML = FONT_GROUPS.map(group => {
    const options = FONTS
      .map((f, i) => ({ f, i }))
      .filter(({ f }) => f.category === group.category)
      .map(({ f, i }) =>
        `<option value="${i}" style="font-family:${f.css.replace(/"/g, "'")}">${escapeHtml(f.name)}</option>`)
      .join('');
    return options ? `<optgroup label="${group.label}">${options}</optgroup>` : '';
  }).join('');
}
function populateSchemeSelect() {
  const sel = document.getElementById('schemeSelect');
  sel.innerHTML = Object.entries(COLOR_SCHEMES)
    .map(([key, v]) => `<option value="${key}">${v.label}</option>`).join('');
}
function populateShapeSelect() {
  const sel = document.getElementById('shapeSelect');
  sel.innerHTML = SHAPE_PRESETS.map(p => `<option value="${p.key}">${p.name}</option>`).join('');
}

/* ---------------- Brand copy ---------------- */

// Every piece of user-editable copy, its input id, and the fallback used
// whenever the field is left empty — so the preview, slide mockups and
// brand guide never render a blank line.
const CONTENT_DEFAULTS = {
  brandName: 'Aster & Co.',
  tagline: 'A short tagline that captures the brand.',
  sectionTitle: 'Our Approach',
  quoteText: 'Design is the silent ambassador of your brand.',
  quoteAuthor: 'Paul Rand',
};
const CONTENT_FIELDS = Object.keys(CONTENT_DEFAULTS);

// state.content holds exactly what the user typed (possibly ''); this is the
// version everything renders from.
function effectiveContent() {
  const out = {};
  CONTENT_FIELDS.forEach(key => {
    const value = state.content[key];
    out[key] = (typeof value === 'string' && value.trim()) ? value : CONTENT_DEFAULTS[key];
  });
  return out;
}

function updateControlsFromState() {
  // Session restore and "Start fresh" both need the inputs re-seeded from
  // state — but never the field the user is currently typing in.
  CONTENT_FIELDS.forEach(id => {
    const el = document.getElementById(id);
    if (!el || el === document.activeElement) return;
    const value = state.content[id];
    el.value = typeof value === 'string' ? value : CONTENT_DEFAULTS[id];
  });

  document.getElementById('headingFont').value = String(FONTS.indexOf(state.headingFont));
  document.getElementById('bodyFont').value = String(FONTS.indexOf(state.bodyFont));
  document.getElementById('headingSize').value = state.typography.headingSize;
  document.getElementById('headingSizeVal').textContent = state.typography.headingSize + 'px';
  document.getElementById('headingWeight').value = state.typography.headingWeight;
  document.getElementById('headingTracking').value = state.typography.headingTracking;
  document.getElementById('headingTrackingVal').textContent = state.typography.headingTracking + 'px';
  document.getElementById('headingCase').value = state.typography.headingCase;
  document.getElementById('bodySize').value = state.typography.bodySize;
  document.getElementById('bodySizeVal').textContent = state.typography.bodySize + 'px';
  document.getElementById('bodyWeight').value = state.typography.bodyWeight;
  document.getElementById('bodyTracking').value = state.typography.bodyTracking;
  document.getElementById('bodyTrackingVal').textContent = state.typography.bodyTracking + 'px';
  document.getElementById('bodyCase').value = state.typography.bodyCase;
  document.getElementById('schemeSelect').value = state.scheme;
  document.getElementById('shapeSelect').value = state.shapePreset.key;
  // Role rows, wheel, brightness, hex and guidance (js/color-picker.js).
  if (window.ColorPicker) ColorPicker.sync();
  document.querySelectorAll('input[name="bgMode"]').forEach(r => { r.checked = r.value === state.bgMode; });
  // Lock toggles must mirror state too — a restored session can arrive with a
  // lock already on, and a lock the UI doesn't show is a lock nobody can find.
  document.getElementById('lockTypography').checked = !!state.locks.typography;
  document.getElementById('lockColor').checked = !!state.locks.color;
  document.getElementById('lockShape').checked = !!state.locks.shape;
  document.getElementById('lockAesthetic').checked = !!state.locks.aesthetic;
}

/* ---------------- Rendering ---------------- */

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

// The board (js/aesthetic-board.js) replaced the old preview card. suggest-ui.js
// still calls this for hover previews, so it stays as the single entry point
// for "repaint the board from state".
function applyPreviewTheme() {
  renderAestheticBoard();
}

// Small live sample of the two selected faces, so the picker shows what the
// names actually look like without a trip to the preview card.
function renderFontSpecimen() {
  const copy = effectiveContent();
  const headingEl = document.getElementById('fontSpecimenHeading');
  const bodyEl = document.getElementById('fontSpecimenBody');
  if (!headingEl || !bodyEl) return;
  headingEl.style.fontFamily = state.headingFont.css;
  headingEl.textContent = copy.brandName;
  bodyEl.style.fontFamily = state.bodyFont.css;
  bodyEl.textContent = copy.tagline;
}

function renderFindings() {
  const findings = evaluateBrand(state);
  const wrap = document.getElementById('findings');
  wrap.innerHTML = findings.map(f => {
    const icon = f.level === 'good' ? '✓' : f.level === 'warn' ? '!' : '✕';
    return `<div class="finding ${f.level}">
      <div class="finding-icon">${icon}</div>
      <div class="finding-body">
        <div class="finding-cat">${escapeHtml(f.category)}</div>
        <div class="finding-title">${escapeHtml(f.title)}</div>
        <p class="finding-detail">${escapeHtml(f.detail)}</p>
      </div>
    </div>`;
  }).join('');

  const good = findings.filter(f => f.level === 'good').length;
  const warn = findings.filter(f => f.level === 'warn').length;
  const bad = findings.filter(f => f.level === 'bad').length;
  document.getElementById('scorePill').textContent = `${good} good · ${warn} to watch · ${bad} failing`;
}

function render() {
  updateControlsFromState();
  renderAestheticBoard();
  renderFontSpecimen();
  if (window.syncFontPickers) syncFontPickers();
  renderFindings();
  // Slide mocks get the blank-safe copy rather than raw state.content.
  renderSlideMocks(Object.assign({}, state, { content: effectiveContent() }));
}

/* ---------------- Toast + export ---------------- */

let toastTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

// Native-app bridge: WKWebView can refuse navigator.clipboard, so the Mac
// wrapper exposes a message handler that writes to NSPasteboard. In a normal
// browser this falls straight through to the async clipboard API.
function copyText(text) {
  const bridge = window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.clipboard;
  if (bridge) {
    bridge.postMessage(text);
    return Promise.resolve();
  }
  return navigator.clipboard.writeText(text);
}

function brandCssText(s = state) {
  const onPrimary = pickReadableText(s.colors.primary);
  const onAccent = pickReadableText(s.colors.accent);
  return `:root {
  --primary: ${s.colors.primary};
  --secondary: ${s.colors.secondary};
  --accent: ${s.colors.accent};
  --neutral-dark: ${s.colors.neutralDark};
  --neutral-light: ${s.colors.neutralLight};
  --on-primary: ${onPrimary};
  --on-accent: ${onAccent};
  --font-heading: ${s.headingFont.css};
  --font-body: ${s.bodyFont.css};
  --heading-size: ${s.typography.headingSize}px;
  --body-size: ${s.typography.bodySize}px;
  --heading-weight: ${s.typography.headingWeight};
  --body-weight: ${s.typography.bodyWeight};
  --heading-tracking: ${s.typography.headingTracking}px;
  --body-tracking: ${s.typography.bodyTracking}px;
  --heading-transform: ${s.typography.headingCase};
  --body-transform: ${s.typography.bodyCase};
  --radius: ${s.shapePreset.radius};
  --radius-lg: ${s.shapePreset.radiusLg};
}`;
}

/* ---------------- Palette PNG export ---------------- */

const PALETTE_EXPORT_KEYS = ['primary', 'secondary', 'accent', 'neutralDark', 'neutralLight'];
const PALETTE_EXPORT_LABELS = {
  primary: 'Primary', secondary: 'Secondary', accent: 'Accent',
  neutralDark: 'Neutral dark', neutralLight: 'Neutral light',
};

// Built as real DOM (not Canvas ctx.fillText) so it always uses whatever
// font is actually on screen — same reasoning as slide-mocks.js.
async function exportPalettePng() {
  const wrap = document.createElement('div');
  wrap.style.cssText = `position:fixed;left:-10000px;top:0;display:flex;gap:24px;
    padding:32px;background:#fff;font-family:${state.bodyFont.css};`;
  PALETTE_EXPORT_KEYS.forEach(key => {
    const hex = state.colors[key];
    const cell = document.createElement('div');
    cell.style.cssText = 'display:flex;flex-direction:column;align-items:center;width:140px;';
    cell.innerHTML = `
      <div style="width:140px;height:140px;border-radius:8px;background:${hex};box-shadow:inset 0 0 0 1px rgba(0,0,0,0.1);"></div>
      <div style="margin-top:14px;font-size:15px;font-weight:600;color:#111;">${PALETTE_EXPORT_LABELS[key]}</div>
      <div style="margin-top:4px;font-size:13px;color:#555;">${hex.toUpperCase()}</div>
    `;
    wrap.appendChild(cell);
  });
  document.body.appendChild(wrap);

  try {
    const canvas = await html2canvas(wrap, { scale: 2, backgroundColor: '#ffffff' });
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${brandFileSlug()}-color-palette.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
    showToast('Palette PNG downloaded');
  } catch (err) {
    showToast('Palette PNG export failed');
  } finally {
    wrap.remove();
  }
}

/* ---------------- Event wiring ---------------- */

function wireEvents() {
  document.getElementById('shuffleAll').addEventListener('click', () => {
    if (!state.locks.typography) randomizeTypography();
    if (!state.locks.color) randomizeColor();
    if (!state.locks.shape) randomizeShape();
    // Last, so an unlocked aesthetic's slide shape wins over the random one.
    if (!state.locks.aesthetic) randomizeAesthetic();
    render();
  });

  document.getElementById('shuffleFonts').addEventListener('click', () => {
    if (state.locks.typography) return showToast('Unlock typography to shuffle');
    randomizeTypography(); render();
  });
  document.getElementById('shuffleColors').addEventListener('click', () => {
    if (state.locks.color) return showToast('Unlock color to shuffle');
    randomizeColor(); render();
  });
  document.getElementById('shuffleShape').addEventListener('click', () => {
    if (state.locks.shape) return showToast('Unlock shape to shuffle');
    randomizeShape(); render();
  });

  document.getElementById('shuffleAesthetic').addEventListener('click', () => {
    if (state.locks.aesthetic) return showToast('Unlock aesthetic to shuffle');
    randomizeAesthetic(); render();
  });

  document.getElementById('lockAesthetic').addEventListener('change', e => state.locks.aesthetic = e.target.checked);
  document.getElementById('lockTypography').addEventListener('change', e => state.locks.typography = e.target.checked);
  document.getElementById('lockColor').addEventListener('change', e => state.locks.color = e.target.checked);
  document.getElementById('lockShape').addEventListener('change', e => state.locks.shape = e.target.checked);

  document.getElementById('headingFont').addEventListener('change', e => {
    state.headingFont = FONTS[Number(e.target.value)]; render();
  });
  document.getElementById('bodyFont').addEventListener('change', e => {
    state.bodyFont = FONTS[Number(e.target.value)]; render();
  });
  document.getElementById('applyRecFonts').addEventListener('click', applyRecommendedFonts);
  document.getElementById('swapFonts').addEventListener('click', () => {
    if (state.locks.typography) return showToast('Unlock typography to swap');
    const heading = state.headingFont;
    state.headingFont = state.bodyFont;
    state.bodyFont = heading;
    render();
  });

  document.getElementById('schemeSelect').addEventListener('change', e => {
    state.scheme = e.target.value;
    // Switching to 'custom' just stops auto-derivation — it doesn't touch
    // the current colors. Switching to a real scheme keeps the current
    // primary and regenerates everything else from it.
    if (state.scheme !== 'custom') {
      state.colors = derivePalette(state.colors.primary, state.scheme);
    }
    render();
  });

  // Palette colors are edited by the inline picker (js/color-picker.js), which
  // goes through setBrandColor() / applyBrandColors() above.
  if (window.ColorPicker) ColorPicker.init();

  document.getElementById('shapeSelect').addEventListener('change', e => {
    state.shapePreset = SHAPE_PRESETS.find(p => p.key === e.target.value); render();
  });

  document.getElementById('headingSize').addEventListener('input', e => {
    state.typography.headingSize = Number(e.target.value);
    document.getElementById('headingSizeVal').textContent = state.typography.headingSize + 'px';
    render();
  });
  document.getElementById('headingWeight').addEventListener('change', e => {
    state.typography.headingWeight = Number(e.target.value);
    render();
  });
  document.getElementById('headingTracking').addEventListener('input', e => {
    state.typography.headingTracking = Number(e.target.value);
    document.getElementById('headingTrackingVal').textContent = state.typography.headingTracking + 'px';
    render();
  });
  document.getElementById('bodySize').addEventListener('input', e => {
    state.typography.bodySize = Number(e.target.value);
    document.getElementById('bodySizeVal').textContent = state.typography.bodySize + 'px';
    render();
  });
  document.getElementById('bodyWeight').addEventListener('change', e => {
    state.typography.bodyWeight = Number(e.target.value);
    render();
  });
  document.getElementById('bodyTracking').addEventListener('input', e => {
    state.typography.bodyTracking = Number(e.target.value);
    document.getElementById('bodyTrackingVal').textContent = state.typography.bodyTracking + 'px';
    render();
  });

  document.getElementById('headingCase').addEventListener('change', e => {
    state.typography.headingCase = e.target.value;
    render();
  });
  document.getElementById('bodyCase').addEventListener('change', e => {
    state.typography.bodyCase = e.target.value;
    render();
  });

  document.getElementById('resetTypography').addEventListener('click', () => {
    state.typography = {
      headingSize: 44, bodySize: 16,
      headingWeight: 700, bodyWeight: 400,
      headingTracking: 0, bodyTracking: 0,
      headingCase: 'none', bodyCase: 'none',
    };
    render();
  });

  document.querySelectorAll('input[name="bgMode"]').forEach(r => {
    r.addEventListener('change', e => { if (e.target.checked) { state.bgMode = e.target.value; render(); } });
  });

  document.getElementById('logoInput').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        state.logoImg = img;
        state.logoDataUrl = ev.target.result;
        document.getElementById('logoPreview').src = ev.target.result;
        document.getElementById('logoPreviewRow').hidden = false;
        render();
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
  document.getElementById('removeLogo').addEventListener('click', () => {
    state.logoImg = null; state.logoDataUrl = null;
    document.getElementById('logoInput').value = '';
    document.getElementById('logoPreviewRow').hidden = true;
    render();
  });

  // All brand copy lives in the Brand panel now. updateControlsFromState()
  // skips the focused input, so a full render() per keystroke is safe.
  CONTENT_FIELDS.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', e => {
      state.content[id] = e.target.value;
      render();
    });
    // On blur, an empty field snaps back to its default so state.content
    // itself is never blank — the brand guide reads it directly.
    el.addEventListener('change', e => {
      if (!e.target.value.trim()) {
        state.content[id] = CONTENT_DEFAULTS[id];
        render();
      }
    });
  });

  document.getElementById('exportCss').addEventListener('click', () => {
    const text = brandCssText();
    copyText(text)
      .then(() => showToast('Copied brand CSS variables to clipboard'))
      .catch(() => showToast('Clipboard blocked — copy manually from devtools'));
  });

  document.getElementById('copyAiBrief').addEventListener('click', () => {
    copyText(buildAiBrief(state))
      .then(() => showToast('AI brief copied'))
      .catch(() => showToast('Clipboard blocked — try again from the app window'));
  });

  document.getElementById('exportPalettePng').addEventListener('click', exportPalettePng);

  document.querySelectorAll('[data-download-slide]').forEach(btn => {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      try {
        const el = document.getElementById(btn.dataset.downloadSlide);
        await downloadSlideMockPng(el, btn.dataset.name);
        showToast('PNG downloaded');
      } catch (err) {
        showToast('PNG export failed');
      } finally {
        btn.disabled = false;
      }
    });
  });

  // Space is the shuffle shortcut, but only when it isn't already doing a
  // more obvious job: typing into a field, toggling a focused control, or
  // scrolling a dialog. Anything else would hijack a keystroke the user
  // meant for something else.
  const SHORTCUT_BLOCKING_TAGS = ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'A'];

  function spaceShortcutBlocked(e) {
    if (e.repeat) return true;
    if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return true;

    if (document.body.dataset.view !== 'editor' || document.body.classList.contains('has-dialog')) return true;
    const modal = document.getElementById('brandGuideModal');
    if (modal && !modal.hidden) return true;

    const targets = [e.target, document.activeElement];
    return targets.some(el => {
      if (!el || el === document.body || el === document.documentElement) return false;
      if (el.isContentEditable) return true;
      return SHORTCUT_BLOCKING_TAGS.includes(el.tagName);
    });
  }

  document.addEventListener('keydown', e => {
    if (e.code !== 'Space') return;
    if (spaceShortcutBlocked(e)) return;
    e.preventDefault();
    document.getElementById('shuffleAll').click();
  });
}

/* ---------------- Init ---------------- */

function init() {
  injectGoogleFonts();

  populateFontSelect(document.getElementById('headingFont'));
  populateFontSelect(document.getElementById('bodyFont'));
  if (window.initFontPickers) initFontPickers();
  populateSchemeSelect();
  populateShapeSelect();

  // All brand copy is seeded from the Brand panel's inputs, which are the
  // single source of truth — the preview and slides just render from state.
  state.content = {};
  CONTENT_FIELDS.forEach(id => {
    const el = document.getElementById(id);
    const value = el ? el.value.trim() : '';
    state.content[id] = value || CONTENT_DEFAULTS[id];
  });

  randomizeTypography();
  randomizeColor();
  randomizeShape();

  initAestheticUi();
  wireEvents();
  render();
}

document.addEventListener('DOMContentLoaded', init);
