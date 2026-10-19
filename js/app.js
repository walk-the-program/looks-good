/* ---------------------------------------------------------------------
   app.js — main controller: state, rendering, and event wiring.
   Depends on data.js, color.js, rules.js, brand-deck.js (loaded first
   as plain <script> tags — no build step, no modules).
------------------------------------------------------------------------ */

const LOGO_MAX_PX = 1024;
const LOGO_MAX_BYTES = 400 * 1024;

function defaultTypography() {
  return {
    headingSize: 44, bodySize: 16,
    headingWeight: 700, bodyWeight: 400,
    headingTracking: 0, bodyTracking: 0,
    headingCase: 'none', bodyCase: 'none',
  };
}

// A fresh editor state with the same shape as `state`; the Brands library builds one per
// tile to render a saved brand without touching the open one.
function freshState() {
  return {
    headingFont: FONTS[0],
    bodyFont: FONTS[0],
    typography: defaultTypography(),
    scheme: 'analogous',
    hue: 210,
    colors: null,
    bgMode: 'light',
    pureBg: false,   // true: canvas is pure #FFFFFF (light) / #000000 (dark), not the style's tint (js/aesthetic-board.js)
    logoImg: null,
    logoDataUrl: null,
    content: {},
    aesthetic: 'soft-form',   // key into AESTHETICS (js/aesthetics/registry.js)
    aestheticVersion: 'current',   // 'current' | 'classic' (the r6-0-baseline copy; registry.js)
    blend: null,     // { with, strength, channels } — second aesthetic blended in (js/blend.js)
    locks: { typography: false, color: false, aesthetic: false },
    dismissed: [],   // suggestion ids dismissed for this brand
    patterns: [],    // patterns in the brief (the cart): [{ key, params, colorway, seed, use, svg }] (js/patterns-ui.js)
  };
}
const state = freshState();

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

// Selecting an aesthetic also takes its recommended background mode.
function applyAesthetic(key) {
  const def = aestheticByKey(key);
  state.aesthetic = def.key;
  // A blend cannot use the base as its own donor: choosing the donor clears the blend.
  if (state.blend && state.blend.with === def.key) state.blend = null;
  applyAestheticLook(resolveAestheticDef(state));
}
// The recommended background mode of the version that renders: the classic copy can
// recommend something else than the current one.
function applyAestheticLook(def) {
  state.bgMode = def.mode;
}
// Panel tiles, prev/next and Compare tiles: one undo step, then a normal render
// (which also marks the brand unsaved via the serialized state).
function chooseAesthetic(key) {
  if (key === state.aesthetic) return;
  pushUndoSnapshot(state);
  applyAesthetic(key);
  const fonts = followAestheticFonts();
  render();
  if (fonts) announceFollowedFonts(fonts);
}
// Fonts follow the style: an explicit style switch takes the new style's first
// recommended pairing (what "Use recommended fonts" applies) unless Typography is
// locked. Runs inside the caller's undo step; returns the pairing when fonts changed.
// Opening a saved brand never goes through here, so its fonts stay as saved.
// opts.random picks any of the style's pairings instead of the first, so shuffles stay
// varied but faithful to the style.
function followAestheticFonts(opts) {
  if (state.locks.typography) return null;
  const meta = window.aestheticMeta ? aestheticMeta(state.aesthetic) : null;
  const pairs = meta && meta.fonts && meta.fonts.pairings;
  const pair = pairs && pairs.length ? (opts && opts.random ? pickRandom(pairs) : pairs[0]) : null;
  const heading = pair && fontByName(pair[0]);
  const body = pair && fontByName(pair[1]);
  if (!heading || !body) return null;
  if (state.headingFont === heading && state.bodyFont === body) return null;
  state.headingFont = heading;
  state.bodyFont = body;
  return { heading, body };
}
function announceFollowedFonts(f) {
  showToast(`Fonts: ${f.heading.name} / ${f.body.name}. Lock Type to keep your own.`);
}
// Classic | Current (the switch next to the aesthetic lock). One undo step; the
// preference stays when another aesthetic is chosen, and applies to any that has a classic.
function setAestheticVersion(version) {
  const next = version === 'classic' ? 'classic' : 'current';
  if (next === state.aestheticVersion || !hasClassicAesthetic(state.aesthetic)) return;
  pushUndoSnapshot(state);
  state.aestheticVersion = next;
  applyAestheticLook(resolveAestheticDef(state));
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

function googleFontChunkUrls(fonts) {
  const sorted = (fonts || FONTS).slice().sort((a, b) => a.name.localeCompare(b.name));
  const urls = [];
  for (let i = 0; i < sorted.length; i += GOOGLE_FONT_CHUNK_SIZE) {
    const families = sorted.slice(i, i + GOOGLE_FONT_CHUNK_SIZE)
      .map(f => googleFamilyParam(f))
      .join('&');
    urls.push(`https://fonts.googleapis.com/css2?${families}&display=swap`);
  }
  return urls;
}

// Family names in the bundled fonts/fonts.css (<link id="localFonts"> in index.html).
function localFontFamilies() {
  const names = new Set();
  const link = document.getElementById('localFonts');
  try {
    Array.from((link && link.sheet && link.sheet.cssRules) || []).forEach(r => {
      if (r.type === CSSRule.FONT_FACE_RULE) names.add(r.style.getPropertyValue('font-family').trim().replace(/^["']|["']$/g, ''));
    });
  } catch (err) { /* unreadable sheet: treat it as empty */ }
  return names;
}

// Fonts load from the bundled copies first, so the app looks right offline. Google
// Fonts is only the fallback, for families fonts.css does not have: a font added to
// FONTS before dev/vendor-fonts.py was re-run, or a copy of the app served without fonts/.
function injectGoogleFonts() {
  const addLink = href => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  };
  const fallback = () => {
    const have = localFontFamilies();
    googleFontChunkUrls(FONTS.filter(f => !have.has(f.name))).forEach(addLink);
    if (!have.has('Geist')) addLink('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap');
  };
  // The <link> is in <head>, so it has loaded (or failed) before this script runs.
  fallback();
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

/* ---------------- Brand copy ---------------- */

// Every piece of user-editable copy, its input id, and the copy used while a
// field is untouched or empty. These read like a real brand, never like "your
// tagline here": no board, slide or guide may show placeholder copy. Untouched
// fields follow the brand name (contentDefaultsFor), so a new brand reads as itself.
const CONTENT_DEFAULTS = {
  brandName: 'Aster & Co.',
  tagline: 'Made with care, built to last.',
  sectionTitle: 'How we work',
  quoteText: 'We would rather do one thing well than ten things nearly.',
  quoteAuthor: 'The founding team',
};
const CONTENT_FIELDS = Object.keys(CONTENT_DEFAULTS);
// Placeholder copy earlier versions stored in brands; it counts as untouched.
const CONTENT_OLD_PLACEHOLDERS = {
  brandName: ['Brand Name'],
  tagline: ['A short tagline that captures the brand.'],
  sectionTitle: ['Our Approach'],
  quoteText: ['Design is the silent ambassador of your brand.'],
  quoteAuthor: ['Paul Rand', 'Author Name'],
};
// A word in the brand name hints at what it is: [pattern, taglines, section titles].
const CONTENT_HINTS = [
  [/coffee|roast|espresso|cafe|café|brew|tea\b/i, ['Coffee worth getting up for.', 'Roasted slowly, poured with care.'], ['From bean to cup', 'How we roast']],
  [/bake|bakery|bread|kitchen|food|provision|pantry|market|farm|grocer|deli|table/i, ['Good food, simply sourced.', 'Honest food, made the slow way.'], ['Where it comes from', 'How we cook']],
  [/bank|pay|capital|fund|money|finance|ledger|wallet|invest/i, ['Money, made simple.', 'Clear numbers, calm decisions.'], ['How it works', 'Built on trust']],
  [/lab|labs|tech|soft|cloud|data|ai\b|app|systems|digital|code|stack|logic/i, ['Software that gets out of your way.', 'Tools that make hard work feel light.'], ['How it works', 'What we build']],
  [/studio|design|creative|agency|works|atelier|make|craft/i, ['Ideas, made real.', 'Careful work for curious people.'], ['How we work', 'What we make']],
  [/sound|audio|synth|music|record|radio|wave/i, ['Sound, shaped by hand.', 'Instruments for the curious ear.'], ['Signal path', 'How we build']],
  [/climb|gym|fit|sport|run|cycle|bike|surf|trail|outdoor|peak|summit/i, ['Stronger every session.', 'Made for the long way round.'], ['How we train', 'Out there']],
  [/book|press|journal|paper|letter|ink|story|stories|print/i, ['Stories worth keeping.', 'Words, well made.'], ['What we publish', 'Our readers']],
  [/home|house|living|interior|furniture|nest/i, ['Rooms you want to stay in.', 'Made for everyday living.'], ['How we make', 'At home']],
  [/health|care|clinic|dental|well|skin|bloom|calm/i, ['Care that feels personal.', 'Feel better, simply.'], ['How we care', 'Our promise']],
  [/travel|hotel|stay|trip|voyage|air|journey/i, ['Go further, rest easier.', 'Places worth the trip.'], ['Where we go', 'How we host']],
];
const CONTENT_TAGLINES = ['Made with care, built to last.', 'Good work, done properly.', 'Simple things, done well.',
  'Thoughtful by design.', 'Made for the long run.', 'Small details, real difference.'];
const CONTENT_SECTIONS = ['How we work', 'What we believe', 'Why it matters', 'What we stand for'];
const CONTENT_QUOTES = ['We would rather do one thing well than ten things nearly.',
  'Every detail is a promise we intend to keep.', 'Make it simple, make it honest, make it last.',
  'Good design is the quiet part of good service.'];

function contentHash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

// Believable copy for a brand of this name, the same every time for the same name.
function contentDefaultsFor(name) {
  const brandName = String(name || '').trim() || CONTENT_DEFAULTS.brandName;
  const h = contentHash(brandName.toLowerCase());
  const hint = CONTENT_HINTS.find(([rx]) => rx.test(brandName));
  const taglines = hint ? hint[1] : CONTENT_TAGLINES;
  const sections = hint ? hint[2] : CONTENT_SECTIONS;
  return {
    brandName,
    tagline: taglines[h % taglines.length],
    sectionTitle: sections[(h >>> 4) % sections.length],
    quoteText: CONTENT_QUOTES[(h >>> 8) % CONTENT_QUOTES.length],
    quoteAuthor: `Founder, ${brandName}`,
  };
}

// True while a field holds no copy of the user's own.
function contentIsDefault(key, value) {
  if (typeof value !== 'string' || !value.trim()) return true;
  return value === CONTENT_DEFAULTS[key] || (CONTENT_OLD_PLACEHOLDERS[key] || []).includes(value.trim());
}

// state.content holds exactly what the user typed (possibly ''); this is the
// version everything renders from. Pass another brand's content to resolve that.
function effectiveContent(content) {
  const src = content || state.content || {};
  const derived = contentDefaultsFor(contentIsDefault('brandName', src.brandName) ? '' : src.brandName);
  const out = {};
  CONTENT_FIELDS.forEach(key => {
    out[key] = contentIsDefault(key, src[key]) ? derived[key] : src[key];
  });
  return out;
}

function updateControlsFromState() {
  // Session restore and "Start fresh" both need the inputs re-seeded from
  // state — but never the field the user is currently typing in. An untouched
  // field shows the copy the board is actually using.
  const shown = effectiveContent();
  CONTENT_FIELDS.forEach(id => {
    const el = document.getElementById(id);
    if (!el || el === document.activeElement) return;
    const value = state.content[id];
    el.value = contentIsDefault(id, value) ? shown[id] : value;
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
  // Role rows, wheel, brightness, hex and guidance (js/color-picker.js).
  if (window.ColorPicker) ColorPicker.sync();
  document.querySelectorAll('input[name="bgMode"]').forEach(r => { r.checked = r.value === state.bgMode; });
  const pureBtn = document.getElementById('pureBgToggle');
  pureBtn.setAttribute('aria-pressed', String(!!state.pureBg));
  pureBtn.dataset.mode = state.bgMode === 'dark' ? 'dark' : 'light';
  // Lock toggles must mirror state too — a restored session can arrive with a
  // lock already on, and a lock the UI doesn't show is a lock nobody can find.
  document.getElementById('lockTypography').checked = !!state.locks.typography;
  document.getElementById('lockColor').checked = !!state.locks.color;
  document.getElementById('lockAesthetic').checked = !!state.locks.aesthetic;
}

/* ---------------- Rendering ---------------- */

// Null-safe: null and undefined become '' (never the text "null"), so aesthetic files
// can use it (or ctx.e) for any value instead of a private escape helper.
function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({
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

// Developer mode shows the owner tools: the recommendations panel and the Classic | Current switch.
// Off for everyone by default. Turn it on with localStorage 'bd.dev' = '1', or open the app with
// ?dev=1 (?dev=0 turns it off again).
const DEV_STORE = 'bd.dev';
function devMode() {
  try { return localStorage.getItem(DEV_STORE) === '1'; } catch (err) { return false; }
}
function setDevMode(on) {
  try { if (on) localStorage.setItem(DEV_STORE, '1'); else localStorage.removeItem(DEV_STORE); } catch (err) { /* this session only */ }
  applyDevMode();
  if (on) renderFindings();
}
function applyDevMode() {
  if (devMode()) document.body.dataset.dev = 'on';
  else delete document.body.dataset.dev;
}

function renderFindings() {
  if (!devMode()) return;   // the panel is hidden, so there is nothing to draw
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
  // An aesthetic switch morphs instead of snapping (js/reveal.js); anything else renders at once.
  if (window.Show && typeof Show.morphBoard === 'function') Show.morphBoard(renderAestheticBoard);
  else renderAestheticBoard();
  renderFontSpecimen();
  if (window.syncFontPickers) syncFontPickers();
  renderFindings();
  renderBrandDeck();
  if (typeof PatternCart !== 'undefined') PatternCart.refresh();   // brief cart: count, sidebar line, open tray
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

// Weights are the nearest ones the face really publishes (abWeightNear): a single-weight face such
// as Anton or VT323 is never asked for 700 (font-synthesis is off, so it would not be bold).
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
  --heading-weight: ${abWeightNear(s.headingFont, s.typography.headingWeight)};
  --body-weight: ${abWeightNear(s.bodyFont, s.typography.bodyWeight)};
  --heading-tracking: ${s.typography.headingTracking}px;
  --body-tracking: ${s.typography.bodyTracking}px;
  --heading-transform: ${s.typography.headingCase};
  --body-transform: ${s.typography.bodyCase};
}`;
}

/* ---------------- Palette PNG export ---------------- */

const PALETTE_EXPORT_KEYS = ['primary', 'secondary', 'accent', 'neutralDark', 'neutralLight'];
const PALETTE_EXPORT_LABELS = {
  primary: 'Primary', secondary: 'Secondary', accent: 'Accent',
  neutralDark: 'Neutral dark', neutralLight: 'Neutral light',
};

// Built as real DOM (not Canvas ctx.fillText) so it always uses whatever
// font is actually on screen — same reasoning as brand-deck.js.
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

// Every shuffle button is exactly one undo step, taken from the committed state
// (a suggestion hover preview is dropped first so it can't leak into the shuffle).
function beginShuffle() {
  if (window.endSuggestPreview) endSuggestPreview();
  pushUndoSnapshot(state);
}

function wireEvents() {
  document.getElementById('shuffleAll').addEventListener('click', () => {
    beginShuffle();
    if (!state.locks.typography) randomizeTypography();
    if (!state.locks.color) randomizeColor();
    if (!state.locks.aesthetic) {
      randomizeAesthetic();
      // Faithful to the new style: a random one of its pairings (no-op when Type is locked).
      followAestheticFonts({ random: true });
    }
    render();
  });

  document.getElementById('shuffleFonts').addEventListener('click', () => {
    if (state.locks.typography) return showToast('Unlock typography to shuffle');
    beginShuffle(); randomizeTypography(); render();
  });
  document.getElementById('shuffleColors').addEventListener('click', () => {
    if (state.locks.color) return showToast('Unlock color to shuffle');
    beginShuffle(); randomizeColor(); render();
  });

  document.getElementById('shuffleAesthetic').addEventListener('click', () => {
    if (state.locks.aesthetic) return showToast('Unlock aesthetic to shuffle');
    beginShuffle(); randomizeAesthetic();
    const fonts = followAestheticFonts();
    render();
    if (fonts) announceFollowedFonts(fonts);
  });

  document.getElementById('lockAesthetic').addEventListener('change', e => state.locks.aesthetic = e.target.checked);
  document.getElementById('aeVersion').addEventListener('click', e => {
    const btn = e.target.closest('button[data-version]');
    if (btn) setAestheticVersion(btn.dataset.version);
  });
  document.getElementById('lockTypography').addEventListener('change', e => state.locks.typography = e.target.checked);
  document.getElementById('lockColor').addEventListener('change', e => state.locks.color = e.target.checked);

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
    state.typography = defaultTypography();
    render();
  });

  document.querySelectorAll('input[name="bgMode"]').forEach(r => {
    r.addEventListener('change', e => { if (e.target.checked) { state.bgMode = e.target.value; render(); } });
  });

  // Quick pure white / black ground, one undo step. Unsaved state comes from the snapshot
  // comparison in brand-session.js, so the re-render marks the brand dirty by itself.
  document.getElementById('pureBgToggle').addEventListener('click', () => {
    pushUndoSnapshot(state);
    state.pureBg = !state.pureBg;
    render();
  });

  document.getElementById('logoInput').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        // The logo is inlined into every board, slide and saved file, so store a
        // copy no larger than LOGO_MAX_PX on its long side. Small files keep their bytes.
        const src = ev.target.result;
        const scale = Math.min(1, LOGO_MAX_PX / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
        let url = src;
        if (scale < 1 || src.length > LOGO_MAX_BYTES) {
          const c = document.createElement('canvas');
          c.width = Math.max(1, Math.round((img.naturalWidth || LOGO_MAX_PX) * scale));
          c.height = Math.max(1, Math.round((img.naturalHeight || LOGO_MAX_PX) * scale));
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          // PNG keeps transparency; JPEG only for photos without it.
          url = /^data:image\/jpe?g/i.test(src) ? c.toDataURL('image/jpeg', 0.88) : c.toDataURL('image/png');
        }
        const done = () => {
          state.logoImg = shown;
          state.logoDataUrl = url;
          document.getElementById('logoPreview').src = url;
          document.getElementById('logoPreviewRow').hidden = false;
          render();
        };
        const shown = url === src ? img : new Image();
        if (shown === img) done(); else { shown.onload = done; shown.src = url; }
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
    const checked = buildAiBriefChecked(state);
    if (!aibLintConfirm(checked.issues)) return;
    copyText(checked.md)
      .then(() => showToast('AI brief copied'))
      .catch(() => showToast('Clipboard blocked — try again from the app window'));
  });

  document.getElementById('exportPalettePng').addEventListener('click', exportPalettePng);

  // Slide PNG / Download all / Download PDF are wired by js/brand-deck.js.

  // Space is the shuffle shortcut, but only when it isn't already doing a
  // more obvious job: typing into a field, toggling a focused control, or
  // scrolling a dialog. Anything else would hijack a keystroke the user
  // meant for something else.
  const SHORTCUT_BLOCKING_TAGS = ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'A'];

  function spaceShortcutBlocked(e) {
    if (e.repeat) return true;
    if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return true;

    if (document.body.dataset.view !== 'editor' || document.body.classList.contains('has-dialog') || document.body.classList.contains('has-cart')) return true;
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
    const shuffle = () => document.getElementById('shuffleAll').click();
    // Tap shuffles as before; holding Space spins the aesthetic reel (js/reveal.js).
    if (window.Show && typeof Show.spaceDown === 'function') Show.spaceDown(shuffle);
    else shuffle();
  });
}

/* ---------------- Init ---------------- */

function init() {
  injectGoogleFonts();

  populateFontSelect(document.getElementById('headingFont'));
  populateFontSelect(document.getElementById('bodyFont'));
  if (window.initFontPickers) initFontPickers();
  populateSchemeSelect();

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

  try {
    const q = new URLSearchParams(location.search).get('dev');
    if (q === '1' || q === '0') { if (q === '1') localStorage.setItem(DEV_STORE, '1'); else localStorage.removeItem(DEV_STORE); }
  } catch (err) { /* no storage: developer mode stays off */ }
  applyDevMode();
  initAestheticUi();
  wireEvents();
  render();
}

document.addEventListener('DOMContentLoaded', init);
