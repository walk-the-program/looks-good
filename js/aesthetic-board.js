/* ---------------------------------------------------------------------
   aesthetic-board.js — the "Design language board".

   One function (boardHtml) builds the board for a (state, aesthetic) pair,
   so the main board and every Compare-all tile come from the same markup.
   Aesthetic files (js/aesthetics/<key>.js) only contribute art, extra
   CSS variables and descriptors; their look lives in css/aesthetics/.

   Depends on color.js / brand-deck.js (slMix, slVisible) and app.js
   (state, effectiveContent, escapeHtml, chooseAesthetic, ...), all called at
   render time, so load order only needs this file before app.js.
   Plain <script>, no modules.
------------------------------------------------------------------------ */

/* ---------------- tokens ---------------- */

function abAlpha(hex, a) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

// Accent as text: the accent itself when it reaches 3:1 on the canvas (large
// text AA). Otherwise the ink; the exact accent is then drawn as a marker
// behind the word (see accentMark). Never a shaded or tinted accent.
function abAccentInk(accent, canvas, ink) {
  if (contrastRatio(accent, canvas) >= 3) return accent;
  return ink;
}

/* ---------------- safe hook runner ---------------- */

// Every aesthetic hook (art, headline, tokens, canvas, printPrimary, states, panels,
// deck.*, the deck's pattern and stage hooks) runs through abRun, so one throwing hook
// costs only its own piece: the caller gets the fallback and the board, deck and brief
// still render. A failure is reported once per aesthetic and hook (console.warn), not on
// every render. `this` is the def.
const AB_WARNED = new Set();

function abRun(def, hook, fn, args, fallback) {
  if (typeof fn !== 'function') return fallback;
  try {
    return fn.apply(def, args);
  } catch (err) {
    const id = `${def && def.key}|${hook}`;
    if (!AB_WARNED.has(id)) {
      AB_WARNED.add(id);
      if (typeof console !== 'undefined') console.warn(`hook ${hook} (${def && def.key}) failed:`, err);
    }
    return fallback;
  }
}

// A hook that returns HTML: fn(ctx, ...rest) -> string. '' when fn is not a function,
// returns a non-string or '', or throws (the caller then uses its default markup).
function abHookHtml(def, fn, ctx, hook = 'hook', ...rest) {
  const html = abRun(def, hook, fn, [ctx, ...rest], '');
  return typeof html === 'string' ? html : '';
}

// def.tokens(t, state): the aesthetic's extra CSS variables ({} when absent, broken or not
// an object). `state` is the view state being rendered (a blend swaps the faces), so
// weights and copy are read from it, never from the global.
function abTokens(def, t, state) {
  const v = abRun(def, 'tokens', def && def.tokens, [t, state], null);
  return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
}

// Derived colors are computed here and nowhere else (the AI brief prints
// these exact hexes). `def.canvas(base, state)` may return an adjusted canvas hex
// (e.g. Soft Form lifts very dark canvases); everything derives from that.
function boardTokens(state, def) {
  const c = state.colors;
  const isDark = state.bgMode === 'dark';
  let canvas = isDark ? c.neutralDark : c.neutralLight;
  let ink = isDark ? c.neutralLight : c.neutralDark;
  if (def && typeof def.canvas === 'function') {
    const adjusted = abRun(def, 'canvas', def.canvas, [{
      canvas, ink, isDark, primary: c.primary, secondary: c.secondary, accent: c.accent,
      mix: slMix, hexToHsl, hslToHex,
    }, state], null);
    if (adjusted && typeof adjusted === 'string') canvas = adjusted;
  }
  // Pure ground (state.pureBg, the quick button by the mode control): the canvas is
  // #FFFFFF in light and #000000 in dark, replacing whatever def.canvas returned. The ink
  // stays unless it fails 4.5:1 on that ground; then the readable helper picks black or white.
  // Everything below derives from this canvas, so the board, deck, compare tiles and brief follow.
  if (state.pureBg) {
    canvas = isDark ? '#000000' : '#ffffff';
    if (contrastRatio(ink, canvas) < 4.5) ink = pickReadableText(canvas);
  }
  // muted = ink moved 40% toward canvas, then pulled back toward ink until
  // small labels clear 4.5:1 with a margin (>= 4.6:1; a 4.49 rounds to a fail).
  let toward = 0.4;
  let muted = slMix(canvas, ink, toward);
  while (toward > 0 && contrastRatio(muted, canvas) < 4.6) {
    toward = Math.max(0, toward - 0.025);
    muted = slMix(canvas, ink, toward);
  }
  const t = {
    canvas, ink, muted,
    line: slMix(canvas, ink, 0.85),
    primary: c.primary, onPrimary: pickReadableText(c.primary),
    // The hex the primary is printed as on the board: the brand primary unless
    // def.printPrimary(t) pushes it (see below). onPrimary, priTint and
    // primaryText always describe this color, because it is the one on screen.
    printPrimary: c.primary, printed: false,
    secondary: c.secondary, onSecondary: pickReadableText(c.secondary),
    accent: c.accent, onAccent: pickReadableText(c.accent),
    priTint: slMix(c.primary, canvas, 0.12),
    secTint: slMix(c.secondary, canvas, 0.16),
    isDark,
    // Legible-as-text versions of the two hue colors (accent falls back to
    // primary, then ink, when it would vanish on the canvas).
    accentText: slVisible(canvas, [c.accent, c.primary], 3, ink),
    // Accent as text when it reaches 3:1 on the canvas, else ink: the colour of the
    // highlight word when def.highlight is 'ink' (the default).
    accentInk: abAccentInk(c.accent, canvas, ink),
    // Exact accent drawn as a marker behind the highlight word when accentInk
    // falls back to ink (accent under 3:1); 'transparent' otherwise.
    accentMark: contrastRatio(c.accent, canvas) >= 3 ? 'transparent' : c.accent,
    primaryText: slVisible(canvas, [c.primary], 3, ink),
    // true when the accent itself is under 3:1 on the canvas (informational:
    // drives data-accent-text; the default 'ink' highlight no longer needs it).
    accentLow: contrastRatio(c.accent, canvas) < 3,
    mix: slMix,
    alpha: abAlpha,
    contrast: contrastRatio,
    readable: pickReadableText,
  };
  // def.printPrimary(t, state) (optional): the hex the primary is printed as (Xerox Punk
  // and Acid Graphics push it to Day-Glo). t.primary stays the brand hex; the
  // printed color replaces it in --ab-primary, and the colors derived from the
  // primary are recomputed from it. A value that is not a #rrggbb hex is ignored.
  if (def && typeof def.printPrimary === 'function') {
    const hex = abRun(def, 'printPrimary', def.printPrimary, [t, state], null);
    if (typeof hex === 'string' && /^#[0-9a-f]{6}$/i.test(hex.trim())) {
      const pp = hex.trim().toLowerCase();
      if (pp !== String(c.primary).toLowerCase()) {
        t.printPrimary = pp;
        t.printed = true;
        t.onPrimary = pickReadableText(pp);
        t.priTint = slMix(pp, canvas, 0.12);
        t.primaryText = slVisible(canvas, [pp], 3, ink);
      }
    }
  }
  return t;
}

function boardRoles(state, def) {
  const forDef = Object.assign({}, state, { aesthetic: def.key });
  if (typeof colorRolesFor === 'function') return colorRolesFor(forDef);
  // Minimal fallback built from the plan's universal roles table; replaced by
  // js/color-roles.js when that file is loaded.
  const base = {
    canvas: { label: 'Canvas', job: 'Page & panels', coverage: '60–70%' },
    ink: { label: 'Ink', job: 'Text & lines', coverage: '15–20%' },
    primary: { label: 'Primary', job: 'Main action', coverage: '≈10%' },
    secondary: { label: 'Secondary', job: 'Tags & support', coverage: '≈10–15%' },
    accent: { label: 'Accent', job: 'One spark', coverage: '≤5%' },
  };
  const over = def.roles || {};
  const out = {};
  Object.keys(base).forEach(k => { out[k] = Object.assign({}, base[k], over[k]); });
  return out;
}

function abInitial(name) {
  const ch = Array.from(String(name || '').trim().replace(/^[^\p{L}\p{N}]+/u, ''))[0];
  return (ch || '·').toUpperCase();
}

// Brand tagline as headline HTML with the last word wrapped in .ab-hl.
function abHeadline(tagline) {
  const text = String(tagline || '').trim();
  const m = text.match(/^([\s\S]*?)([^\s]+?)([.,;:!?…]*)$/);
  if (!m) return escapeHtml(text);
  // The highlight and its closing punctuation are one unbreakable unit, so a lone "." never wraps onto its own line.
  if (!m[3]) return `${escapeHtml(m[1])}<span class="ab-hl">${escapeHtml(m[2])}</span>`;
  return `${escapeHtml(m[1])}<span class="ab-hl-glue"><span class="ab-hl">${escapeHtml(m[2])}</span>${escapeHtml(m[3])}</span>`;
}

// The headline's h2 for the board hero and the deck's cover, principles and closing
// slides. Normal case: `<h2 class="ab-headline[ extra]">` with the last word wrapped in
// .ab-hl. When the def has a `headline(ctx, text)` hook (an aesthetic that draws its own
// headline: ransom tiles, mixed type) the h2 is still the headline, so the deck's
// fit code (bdFitHeadline, bdFitCover) can measure it:
//   <h2 class="ab-headline ab-headline--custom[ extra]" aria-label="text"><span aria-hidden="true">HOOK HTML</span></h2>
// `text` is the plain (unescaped, trimmed) headline string and the hook returns inner HTML
// it has escaped itself. A hook that returns a non-string or '' falls back to the normal h2.
// `extraClass` starts with a space; `extraAttrs` starts with a space too.
function abHeadlineH2(def, ctx, text, extraClass = '', extraAttrs = '') {
  if (def && typeof def.headline === 'function') {
    const plain = String(text == null ? '' : text).trim();
    const inner = abHookHtml(def, def.headline, ctx, 'headline', plain);
    if (inner) {
      return `<h2 class="ab-headline ab-headline--custom${extraClass}" aria-label="${escapeHtml(plain)}"${extraAttrs}><span aria-hidden="true">${inner}</span></h2>`;
    }
  }
  return `<h2 class="ab-headline${extraClass}"${extraAttrs}>${abHeadline(text)}</h2>`;
}

function abHeadlineScale(tagline) {
  const n = String(tagline || '').trim().length;
  return n <= 22 ? 1 : n <= 40 ? 0.86 : n <= 60 ? 0.72 : 0.6;
}

/* ---------------- interface type ---------------- */

const AB_MONO = 'ui-monospace, "SF Mono", Menlo, monospace';

// The brand face used for interface text when an aesthetic asks for 'sans':
// a sans face first (body, then heading), then mono, then a display face, else
// the heading face. Returns the FONTS entry.
function abSansFace(state) {
  const h = state.headingFont || {};
  const b = state.bodyFont || h;
  const tries = [[b, 'sans'], [h, 'sans'], [b, 'mono'], [h, 'mono'], [h, 'display'], [b, 'display']];
  for (const [f, cat] of tries) if (f && f.category === cat) return f;
  return h;
}

/* Weights a face really publishes. FONTS[].weights is a string ("400;700"); the font
   loader requests exactly those, and font-synthesis is off, so a weight outside the list
   would render as a neighbour. Tokens and art read weights through these, not by parsing
   the string. They are plain functions of the face, so they work for any face (the view
   state's, or a donor's pairing), and they are available wherever aesthetic-board.js is
   (aesthetic files call them at render time, from tokens(t, state) or art(ctx)). */

// The published weights, ascending, as numbers; [400] when the face lists none.
function abWeights(face) {
  const ws = String((face && face.weights) || '400').split(';').map(Number).filter(Boolean).sort((a, b) => a - b);
  return ws.length ? ws : [400];
}

// The heaviest published weight <= cap; the lightest when every weight is above it (a
// single-weight face stays at its one weight).
function abWeight(face, cap) {
  const ws = abWeights(face);
  const le = ws.filter(w => w <= cap);
  return le.length ? le[le.length - 1] : ws[0];
}

// The published weight nearest `wanted`: `wanted` itself, else the next one up when it is
// within 100, else the next one down, else the next one up.
function abWeightNear(face, wanted) {
  const ws = abWeights(face);
  if (ws.includes(wanted)) return wanted;
  const up = ws.find(w => w > wanted);
  const down = ws.filter(w => w < wanted).pop();
  return up && up - wanted <= 100 ? up : (down || up || 400);
}

// kind: 'body' | 'heading' | 'sans' | 'mono'. Returns { name, expr } where expr
// is the CSS value for the --ab-font-ui / --ab-font-label variables.
function abResolveFace(kind, state) {
  const h = state.headingFont || {};
  const b = state.bodyFont || h;
  if (kind === 'mono') return { name: 'System monospace', expr: AB_MONO };
  let face = b;
  if (kind === 'heading') face = h;
  else if (kind === 'sans') face = abSansFace(state);
  return { name: face.name, expr: face === h && face !== b ? 'var(--ab-font-h)' : 'var(--ab-font-b)' };
}

function abTypeFor(def) {
  return Object.assign({ ui: 'body', label: null, display: 1 }, def && def.type);
}

// def.highlight: 'ink' (default) | 'band' | 'custom'.
function abHighlightOf(def) {
  return def && (def.highlight === 'band' || def.highlight === 'custom') ? def.highlight : 'ink';
}

function boardVars(t, state, def, tagline) {
  const ty = state.typography || {};
  const hs = Math.min(1.25, Math.max(0.8, (ty.headingSize || 44) / 44));
  const vars = {
    '--ab-canvas': t.canvas, '--ab-ink': t.ink, '--ab-muted': t.muted, '--ab-line': t.line,
    '--ab-primary': t.printPrimary, '--ab-on-primary': t.onPrimary,
    '--ab-secondary': t.secondary, '--ab-on-secondary': t.onSecondary,
    '--ab-accent': t.accent, '--ab-on-accent': t.onAccent,
    '--ab-pri-tint': t.priTint, '--ab-sec-tint': t.secTint,
    '--ab-accent-text': t.accentText, '--ab-primary-text': t.primaryText,
    '--ab-font-h': `var(--font-heading, ${state.headingFont.css})`,
    '--ab-font-b': `var(--font-body, ${state.bodyFont.css})`,
    '--ab-hl-scale': abHeadlineScale(tagline),
    '--ab-hs': hs,
  };
  const ty2 = abTypeFor(def);
  const ui = abResolveFace(ty2.ui, state);
  const label = ty2.label ? abResolveFace(ty2.label, state) : ui;
  vars['--ab-accent-ink'] = t.accentInk;
  vars['--ab-accent-mark'] = t.accentMark || 'transparent';
  if (t.printed) {
    vars['--ab-primary-brand'] = t.primary;   // the true brand hex, only where the board prints another
    // its label colour: black or white, whichever reads better (no contrast-color() in older WebKit)
    vars['--ab-on-primary-brand'] = contrastRatio('#000000', t.primary) >= contrastRatio('#ffffff', t.primary) ? '#000000' : '#ffffff';
  }
  vars['--ab-font-ui'] = ui.expr;
  vars['--ab-font-label'] = label.expr;
  vars['--ab-display'] = Number(ty2.display) > 0 ? Number(ty2.display) : 1;
  // Scales an aesthetic's tight headline tracking by the heading face's width:
  // condensed/heavy faces collide when tightened, wide/techno need less. An
  // aesthetic's tokens(t, state) may override it (ASCII Art, Xerox, Editorial, Groovy do).
  vars['--ab-tr'] = { condensed: 0, heavy: 0, wide: 0.4, techno: 0.4 }[state.headingFont && state.headingFont.cls] ?? 1;
  Object.assign(vars, abTokens(def, t, state));
  return vars;
}

// 5x7 block capitals and digits (rows of 5 bits), shared by the aesthetics that
// draw the brand initial on a pixel grid (Blueprint, Pixel Arcade, ASCII Art).
const AB_FONT_5X7 = {
  A: '01110 10001 10001 11111 10001 10001 10001', B: '11110 10001 10001 11110 10001 10001 11110',
  C: '01110 10001 10000 10000 10000 10001 01110', D: '11110 10001 10001 10001 10001 10001 11110',
  E: '11111 10000 10000 11110 10000 10000 11111', F: '11111 10000 10000 11110 10000 10000 10000',
  G: '01110 10001 10000 10111 10001 10001 01110', H: '10001 10001 10001 11111 10001 10001 10001',
  I: '01110 00100 00100 00100 00100 00100 01110', J: '00111 00010 00010 00010 00010 10010 01100',
  K: '10001 10010 10100 11000 10100 10010 10001', L: '10000 10000 10000 10000 10000 10000 11111',
  M: '10001 11011 10101 10101 10001 10001 10001', N: '10001 11001 10101 10011 10001 10001 10001',
  O: '01110 10001 10001 10001 10001 10001 01110', P: '11110 10001 10001 11110 10000 10000 10000',
  Q: '01110 10001 10001 10001 10101 10010 01101', R: '11110 10001 10001 11110 10100 10010 10001',
  S: '01111 10000 10000 01110 00001 00001 11110', T: '11111 00100 00100 00100 00100 00100 00100',
  U: '10001 10001 10001 10001 10001 10001 01110', V: '10001 10001 10001 10001 10001 01010 00100',
  W: '10001 10001 10001 10101 10101 11011 10001', X: '10001 10001 01010 00100 01010 10001 10001',
  Y: '10001 10001 01010 00100 00100 00100 00100', Z: '11111 00001 00010 00100 01000 10000 11111',
  0: '01110 10001 10011 10101 11001 10001 01110', 1: '00100 01100 00100 00100 00100 00100 01110',
  2: '01110 10001 00001 00010 00100 01000 11111', 3: '11110 00001 00001 01110 00001 00001 11110',
  4: '00010 00110 01010 10010 11111 00010 00010', 5: '11111 10000 11110 00001 00001 10001 01110',
  6: '00110 01000 10000 11110 10001 10001 01110', 7: '11111 00001 00010 00100 01000 01000 01000',
  8: '01110 10001 10001 01110 10001 10001 01110', 9: '01110 10001 10001 01111 00001 00010 01100',
  '?': '01110 10001 00001 00110 00100 00000 00100',
};

/* ---------------- shared art helper ---------------- */

// Simulated refraction (not real optics): a lens that holds a clipped,
// slightly scaled and offset duplicate of the scene beneath it. Coordinates
// are percentages of the art box. Blur alone is not refraction, so glass
// aesthetics pair this with their backdrop-filter.
function abLens(sceneHtml, o) {
  const ox = o.x + o.w / 2;
  const oy = o.y + o.h / 2;
  const sceneStyle = `left:${(-o.x / o.w) * 100}%;top:${(-o.y / o.h) * 100}%;`
    + `width:${(100 / o.w) * 100}%;height:${(100 / o.h) * 100}%;`
    + `transform-origin:${ox}% ${oy}%;`
    + `transform:translate(${o.dx || 0}%,${o.dy || 0}%) scale(${o.scale || 1.15})`;
  return `<div class="ab-lens ${o.cls || ''}" style="left:${o.x}%;top:${o.y}%;width:${o.w}%;height:${o.h}%">`
    + `<div class="ab-lens-scene" style="${sceneStyle}">${sceneHtml}</div></div>`;
}

/* ---------------- markup ---------------- */

const AB_STAGES = {
  Design: ['Your next good idea.', 'A little structure. Room to play.'],
  Build: ['Give it shape.', 'Details that feel good to use.'],
  Launch: ['Ready for the world.', 'Make the first impression count.'],
};
const AB_ROWS = [
  ['Brand refresh', 'In review', 72],
  ['Launch site', 'Building', 45],
  ['Spring campaign', 'Planned', 10],
];
const AB_ROLE_ORDER = ['canvas', 'ink', 'primary', 'secondary', 'accent'];

const AB_LAYOUT_DEFAULT = { hero: 'split', palette: 'swatches', sections: 'two-col', subcopy: true };
// Heroes: split (default), centered, poster, scene, plus (round 6)
//   bleed      the art runs edge to edge across the board above the copy
const AB_HEROES = ['split', 'centered', 'poster', 'scene', 'bleed'];
// Palettes: swatches (default), strips, chips, plus (round 6) list (a ruled index table).
const AB_PALETTES = ['swatches', 'strips', 'chips', 'list'];
const AB_SECTIONS = ['two-col', 'stacked', 'asym'];
const AB_STATE_KINDS = ['swatch', 'button', 'chip'];
// Board block order (def.layout.order) between the header and the footer, and the
// order of the three numbered sections inside .ab-sections (def.layout.sectionOrder).
const AB_ORDER_DEFAULT = ['hero', 'palette', 'type', 'sections'];
const AB_SECTION_ORDER_DEFAULT = ['ui', 'touch', 'use'];

// A known-key permutation: unknown and repeated keys are dropped, missing keys are
// appended in their default order (nothing can be left off the board).
function abOrderOf(list, defaults) {
  const out = [];
  (Array.isArray(list) ? list : []).forEach(k => { if (defaults.includes(k) && !out.includes(k)) out.push(k); });
  defaults.forEach(k => { if (!out.includes(k)) out.push(k); });
  return out;
}

// Resolve def.layout against the defaults; unknown values fall back.
function abLayoutOf(def) {
  const l = Object.assign({}, AB_LAYOUT_DEFAULT, def && def.layout);
  if (!AB_HEROES.includes(l.hero)) l.hero = 'split';
  if (!AB_PALETTES.includes(l.palette)) l.palette = 'swatches';
  if (!AB_SECTIONS.includes(l.sections)) l.sections = 'two-col';
  l.subcopy = l.subcopy !== false;
  l.order = abOrderOf(l.order, AB_ORDER_DEFAULT);
  l.sectionOrder = abOrderOf(l.sectionOrder, AB_SECTION_ORDER_DEFAULT);
  return l;
}

// "60–70%" -> 65, "≈10%" -> 10, "≤5%" -> 5: the flex weight of a palette strip.
function abCoverageNum(text) {
  const nums = String(text || '').match(/\d+(?:\.\d+)?/g);
  if (!nums || !nums.length) return 10;
  const vals = nums.map(Number);
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

/* ---------------- type recommendation block ---------------- */

const AB_FIT_WORD = { match: '✓ Fits', consider: 'Consider', avoid: '✕ Avoid' };

function abFitPill(fit) {
  const f = AB_FIT_WORD[fit] ? fit : 'consider';
  return `<span class="ab-fit" data-fit="${f}">${AB_FIT_WORD[f]}</span>`;
}

// Plain-words avoid list: "didone, condensed, pixel".
function abAvoidWords(avoid) {
  return (avoid || []).map(c => c === 'serif' ? 'serif faces' : FONT_CLASSES[c] ? FONT_CLASSES[c].label : c).join(', ');
}

// True when the brand already wears the aesthetic's first recommended pairing.
function abUsingRecommended(state, meta) {
  const pair = meta && meta.fonts.pairings[0];
  return !!pair && state.headingFont.name === pair[0] && state.bodyFont.name === pair[1];
}

// Compact "Type" section between the palette and 01: what the aesthetic wants
// in plain words, three picks in their own faces, what to avoid, how the
// brand's current faces fit, and the one-click apply. Returns '' (no block, no
// rule) when the aesthetic has no entry in js/aesthetic-meta.js. Restyle it per
// aesthetic with the .ab-type* classes; the block holds no aesthetic logic.
function abTypeBlockHtml(state, def) {
  // A blend whose donor supplies the type (js/blend.js) shows the donor's recommendation;
  // its fonts are already in use, so there is nothing to apply.
  const fromBlend = !!(def.blend && def.blend.typeFrom);
  const metaKey = fromBlend ? def.blend.typeFrom : def.key;
  const meta = typeof aestheticMeta === 'function' ? aestheticMeta(metaKey) : null;
  if (!meta || !meta.fonts) return '';
  const f = meta.fonts;
  const e = escapeHtml;
  const fits = fontFitFor(metaKey, state);
  const picks = names => names.slice(0, 3).map(n => {
    const font = FONTS.find(x => x.name === n);
    return `<li class="ab-type-pick" style="font-family:${font ? e(font.css) : 'inherit'}">${e(n)}</li>`;
  }).join('');
  const col = (role, label, block, cur, fit) => `
      <div class="ab-type-col" data-role="${role}">
        <p class="ab-type-role">${label}</p>
        ${block.classes ? `<p class="ab-type-class">${e(fontClassWords(block.classes))}</p>` : (block.note ? `<p class="ab-type-class">${e(block.note)}</p>` : '<p class="ab-type-class">&nbsp;</p>')}
        <ul class="ab-type-picks">${picks(block.picks)}</ul>${cur ? `
        <p class="ab-type-fit"><span class="ab-type-cur">Your ${role}: <b style="font-family:${e(cur.css)}${abWeightNear(cur, 600) === 600 ? '' : `;font-weight:${abWeightNear(cur, 600)}`}">${e(cur.name)}</b></span>${abFitPill(fit)}</p>` : ''}
      </div>`;
  const cols = [col('heading', 'Headings', f.heading, state.headingFont, fits.heading),
    col('body', 'Body', f.body, state.bodyFont, fits.body)];
  // Skip the mono column when every mono pick is already a body pick (it would
  // just repeat the body card, e.g. Pixel Arcade's VT323).
  const bodyPicks = f.body && f.body.picks ? f.body.picks : [];
  if (f.mono && f.mono.picks.some(n => !bodyPicks.includes(n))) cols.push(col('mono', 'UI &amp; mono', f.mono, null, null));
  const pair = f.pairings[0];
  const used = abUsingRecommended(state, meta);
  return `<section class="ab-type" data-cols="${cols.length}" data-applied="${used}" aria-label="Type recommendations">
      <div class="ab-labelrow"><span class="ab-label">Type</span><span class="ab-label">Recommended for ${e(def.name)}</span></div>
      <div class="ab-type-grid">${cols.join('')}
      </div>
      <div class="ab-type-foot">
        <p class="ab-type-avoid"><span class="ab-type-k">Avoid</span> ${e(abAvoidWords(f.avoid))}</p>
        <p class="ab-type-why">${e(f.why)}</p>
        <div class="ab-type-act">${fromBlend ? '' : `
          <button type="button" class="ab-type-apply">Use recommended fonts</button>`}
          <span class="ab-type-pair">${e(pair[0])} / ${e(pair[1])}${used ? (fromBlend ? ' · from the blend' : ' · in use') : ''}</span>
        </div>
      </div>
    </section>
    <div class="ab-rule"></div>
    `;
}

let abSeq = 0;

const abKebab = name => String(name).replace(/[A-Z]/g, ch => '-' + ch.toLowerCase());

// {placeholder} resolution for def.materials (docs/aesthetics-plan.md "Board anatomy"):
// t[name] first, else the aesthetic's extra var --ab-<kebab(name)> from tokens(). A name that
// is neither goes to onMissing(name, whole), whose return value replaces it (the brief keeps
// the placeholder visible and lists it; a blend's sample paints 'transparent').
function abResolveMaterial(css, t, extras, onMissing) {
  return String(css).replace(/\{([A-Za-z][A-Za-z0-9]*)\}/g, (whole, name) => {
    const own = t[name];
    if (typeof own === 'string' || typeof own === 'number') return String(own);
    const extra = extras['--ab-' + abKebab(name)];
    return extra != null ? String(extra) : onMissing(name, whole);
  });
}

// The data attributes of an `.ab[data-ae]` root, written once for the board root
// (abBoardParts), a blend's donor scope (blScopeOpen) and the blend's probe board
// (blendProbe), so a new root attribute cannot differ between them. `over` replaces any
// of hero, palette, sections, highlight, states, subcopy (default: the def's own layout;
// a donor scope and the probe pin states 'swatch' and subcopy 'on').
function abRootAttrs(def, t, state, over) {
  const l = abLayoutOf(def);
  const a = Object.assign({
    hero: l.hero, palette: l.palette, sections: l.sections, highlight: abHighlightOf(def),
    states: 'swatch', subcopy: l.subcopy ? 'on' : 'off',
  }, over);
  const hf = (state && state.headingFont) || {};
  const bf = (state && state.bodyFont) || {};
  return `data-ae="${def.key}" data-mode="${t.isDark ? 'dark' : 'light'}" data-accent-text="${t.accentLow ? 'low' : 'ok'}" data-hero="${a.hero}" data-palette="${a.palette}" data-sections="${a.sections}" data-highlight="${a.highlight}" data-states="${a.states}" data-subcopy="${a.subcopy}" data-hcls="${escapeHtml(hf.cls || '')}" data-bcls="${escapeHtml(bf.cls || '')}"`;
}

// An inline style attribute value from { '--var': value }; double quotes become single so
// a value can never close the attribute.
function abStyle(vars) {
  return Object.entries(vars).map(([k, v]) => `${k}:${String(v).replace(/"/g, "'")}`).join(';');
}

// ctx.labels, one shape in every hook (art, headline, panels, states, deck.*): the three
// state names as an array (labels[i], labels.map(...)) that also carries .material (the 02
// section's title), .states and .names (the same array) and .statesKind.
function abLabelsCtx(labels) {
  const names = (labels && labels.states) || [];
  return Object.assign(names.slice(), {
    material: labels && labels.material, states: names, names, statesKind: labels && labels.statesKind,
  });
}

/* The board is assembled from these parts so other surfaces (the brand deck,
   js/brand-deck.js) render the same markup inside the same `.ab[data-ae]` root.
   abBoardParts(state, def) resolves tokens, copy, layout and root attributes once
   and returns builders; each builder returns an HTML string that starts at its own
   tag. boardHtml below is the only place that arranges them as the board. */
function abBoardParts(state, def) {
  const t = boardTokens(state, def);
  const copy = effectiveContent();
  const labels = def.labels || { material: 'Touch & depth', states: ['One', 'Two', 'Three'] };
  const ctx = {
    t, key: def.key, state,
    brandName: copy.brandName, tagline: copy.tagline,
    initial: abInitial(copy.brandName), logoDataUrl: state.logoDataUrl,
    labels: abLabelsCtx(labels),
    // True when the brand's typography is locked (state.locks.typography): the faces in
    // ctx.state are then the user's own, and a hook that would pick a face of its own must not.
    typographyLocked: !!(state.locks && state.locks.typography),
  };
  const roles = boardRoles(state, def);
  const vars = boardVars(t, state, def, copy.tagline);
  const style = abStyle(vars);
  const uid = 'ab' + (++abSeq);
  const e = escapeHtml;

  const brand = state.logoDataUrl
    ? `<img class="ab-logo" src="${e(state.logoDataUrl)}" alt="${e(copy.brandName)}" />`
    : `<span class="ab-mark" aria-hidden="true"><span>${e(ctx.initial)}</span></span><span class="ab-wordmark">${e(copy.brandName)}</span>`;

  const layout = abLayoutOf(def);
  const statesKind = AB_STATE_KINDS.includes(labels.statesKind) ? labels.statesKind : 'swatch';
  // Text colour that reads on each role's own fill (strips put labels inside the band).
  // The primary swatch is filled with the brand hex, so on a printed primary its label
  // colour is chosen for the brand hex, not for the printed one (t.onPrimary).
  const onRole = { canvas: t.ink, ink: t.canvas, primary: t.printed ? pickReadableText(t.primary) : t.onPrimary, secondary: t.onSecondary, accent: t.onAccent };

  const P = { state, def, t, copy, ctx, roles, vars, style, uid, labels, brand, layout, statesKind, onRole };

  // The root element's opening tag. `extraClass` / `extraAttrs` let a surface
  // add its own class (e.g. ab-slide) and data attributes; defaults add nothing.
  P.rootOpen = (extraClass = '', extraAttrs = '') =>
    `<section class="ab${extraClass ? ' ' + extraClass : ''}" ${abRootAttrs(def, t, state, { states: P.statesKind || statesKind })}${extraAttrs} style="${P.style}">`;

  P.head = (pre = 'Design language / ', name = def.name) => `<header class="ab-head">
      <div class="ab-brand">${brand}</div>
      <span class="ab-tag"><span class="ab-tag-pre">${pre}</span><b>${e(name)}</b></span>
    </header>`;

  P.art = () => abHookHtml(def, def.art, ctx, 'art');

  P.hero = () => `<section class="ab-hero">
      <div class="ab-hero-copy">
        <p class="ab-kicker">${e(def.kicker || def.descriptor)}</p>
        ${abHeadlineH2(def, ctx, copy.tagline)}${layout.subcopy
    ? `\n        <p class="ab-subcopy"><span class="ab-sub-lead">A design language for ${e(copy.brandName)}</span><span class="ab-sub-rest"> — type, color and material in one place.</span></p>` : ''}
      </div>
      <div class="ab-art" aria-hidden="true">${P.art()}</div>
    </section>`;

  P.swatches = () => AB_ROLE_ORDER.map(k => {
    const r = roles[k] || {};
    const hex = t[k];
    const cov = abCoverageNum(r.coverage);
    return `<div class="ab-swatch" data-role="${k}" style="--sw:${hex};--sw-on:${onRole[k]};--cov:${cov}">
      <span class="ab-chip" style="background:${hex}"></span>
      <b class="ab-sw-role">${e(r.label || k)}</b>
      <span class="ab-sw-job">${e(r.job || '')}${r.coverage ? ' · ' + e(r.coverage) : ''}</span>
      <code class="ab-sw-hex">${hex.toUpperCase()}</code>${k === 'primary' && t.printed ? `
      <code class="ab-sw-print">prints as ${t.printPrimary.toUpperCase()}</code>` : ''}
    </div>`;
  }).join('');

  P.palette = () => `<section class="ab-palette" aria-label="Palette">
      <div class="ab-labelrow"><span class="ab-label">The palette</span><span class="ab-label">${e(def.descriptor)}</span></div>
      <div class="ab-swatches" data-kind="${layout.palette}">${P.swatches()}</div>
    </section>`;

  P.type = () => abTypeBlockHtml(state, def);

  const stage = AB_STAGES.Design;
  const segs = Object.keys(AB_STAGES).map((s, i) =>
    `<button type="button" class="ab-seg-btn" aria-pressed="${i === 0}" data-stage="${s}">${s}</button>`).join('');

  // States row: three samples of the material (swatch), the real CTA in three
  // states (button, classes is-rest / is-hover / is-pressed on a non-interactive
  // .ab-cta clone) or three chips (chip, name inside the chip).
  const stateCls = ['is-rest', 'is-hover', 'is-pressed'];
  const states = (labels.states || []).map((s, i) => {
    if (statesKind === 'button') {
      return `<div class="ab-state" data-s="${i}"><span class="ab-cta ab-state-ctl ${stateCls[i] || ''}" data-s="${i}"><span class="ab-cta-label">Save</span><span class="ab-cta-arrow" aria-hidden="true"></span></span><span class="ab-state-name">${e(s)}</span></div>`;
    }
    if (statesKind === 'chip') {
      return `<div class="ab-state" data-s="${i}"><span class="ab-state-chip" data-s="${i}">${e(s)}</span></div>`;
    }
    return `<div class="ab-state"><span class="ab-disc" data-s="${i}"></span><span class="ab-state-name">${e(s)}</span></div>`;
  }).join('');

  const rows = AB_ROWS.map((r, i) => `<li class="ab-row">
      <span class="ab-row-n">${String(i + 1).padStart(2, '0')}</span>
      <span class="ab-av" aria-hidden="true">${e(r[0][0])}</span>
      <span class="ab-row-name">${e(r[0])}</span>
      <span class="ab-row-status">${e(r[1])}</span>
      <span class="ab-row-bar" aria-hidden="true"><i style="width:${r[2]}%"></i></span>
      <span class="ab-row-pct">${r[2]}%</span>
    </li>`).join('');

  // 01 card: segmented control, title, body, primary CTA.
  P.card = () => `<div class="ab-card">
          <div class="ab-seg" role="group" aria-label="Project stage">${segs}</div>
          <h3 class="ab-card-title" data-ab-title>${e(stage[0])}</h3>
          <p class="ab-card-body" data-ab-body>${e(stage[1])}</p>
          <button type="button" class="ab-cta"><span class="ab-cta-label">Save direction</span><span class="ab-cta-arrow" aria-hidden="true"></span></button>
        </div>`;

  // 02 panel: field, toggle, status line, the three states. P.panelPre (empty by
  // default) and P.states are separate so a blend (js/blend.js) can swap them.
  P.states = () => `<div class="ab-states" data-kind="${statesKind}">${states}</div>`;
  P.panelPre = () => '';
  P.panel = () => `<div class="ab-panel">${P.panelPre()}
          <label class="ab-fieldlabel" for="${uid}-f">Project name</label>
          <input class="ab-input" id="${uid}-f" type="text" value="Something good" maxlength="48" autocomplete="off" />
          <label class="ab-toggle" for="${uid}-t"><span>Focus mode</span><input class="ab-switch" id="${uid}-t" type="checkbox" checked /></label>
          <div class="ab-status" aria-live="polite">Focus mode on</div>
          ${P.states()}
        </div>`;

  // 03 list rows.
  P.list = () => `<ul class="ab-list">${rows}</ul>`;

  // def.panels = { card(ctx), panel(ctx), list(ctx) } (optional): the aesthetic's own
  // markup for the 01 card, the 02 panel or the 03 list, as one element's outer HTML
  // (real text and controls instead of CSS generated content). ctx is the board ctx plus
  // parts, e, rows (AB_ROWS) and stages (AB_STAGES). The default markup stays on
  // P.cardBase / P.panelBase / P.listBase (the deck takes components from it when the
  // aesthetic's own markup lacks one).
  P.cardBase = P.card; P.panelBase = P.panel; P.listBase = P.list;
  const panels = def.panels && typeof def.panels === 'object' ? def.panels : null;
  if (panels) {
    const pctx = Object.assign({}, ctx, { parts: P, e, rows: AB_ROWS, stages: AB_STAGES });
    [['card', 'cardBase'], ['panel', 'panelBase'], ['list', 'listBase']].forEach(([id, base]) => {
      if (typeof panels[id] !== 'function') return;
      P[id] = () => abHookHtml(def, panels[id], pctx, `panels.${id}`) || P[base]();
    });
  }

  P.secUi = () => `<section class="ab-sec ab-sec-ui" aria-label="Interface">
        <div class="ab-labelrow"><span class="ab-label"><i class="ab-n">01</i><span>Interface</span></span></div>
        ${P.card()}
      </section>`;
  P.secTouch = () => `<section class="ab-sec ab-sec-touch" aria-label="${e(labels.material)}">
        <div class="ab-labelrow"><span class="ab-label"><i class="ab-n">02</i><span>${e(labels.material)}</span></span></div>
        ${P.panel()}
      </section>`;
  P.secUse = () => `<section class="ab-sec ab-sec-use" aria-label="In use">
        <div class="ab-labelrow"><span class="ab-label"><i class="ab-n">03</i><span>In use</span></span></div>
        ${P.list()}
      </section>`;

  P.foot = () => `<footer class="ab-foot"><span class="ab-motto"><i class="ab-dot" aria-hidden="true"></i>${e(def.motto)}</span><span class="ab-infl">${e(def.influences)}</span></footer>`;

  // def.states(ctx) (optional): the aesthetic's own state component, as the inner HTML
  // of <div class="ab-states" data-kind="custom"> (root data-states="custom"). ctx is
  // the board ctx (ctx.labels: see abLabelsCtx) plus parts and e (escapeHtml).
  // '' / non-string / a throw keeps the statesKind row.
  const ownStates = abHookHtml(def, def.states, Object.assign({}, ctx, { parts: P, e }), 'states');
  if (ownStates) {
    P.statesKind = 'custom';
    P.states = () => `<div class="ab-states" data-kind="custom">${ownStates}</div>`;
  }

  // A blended def (js/blend.js) rewires the root attributes and the 02 states.
  if (def.blend && typeof blendParts === 'function') blendParts(P);
  return P;
}

// The board's blocks in def.layout.order (hero, palette, type, sections) and its three
// numbered sections in def.layout.sectionOrder (ui, touch, use). A hero or palette is
// followed by a rule unless it is the last block; the type block carries its own. The
// default order produces exactly the markup the board always had.
function boardHtml(state, def) {
  const P = abBoardParts(state, def);
  const L = P.layout;
  const sec = { ui: P.secUi, touch: P.secTouch, use: P.secUse };
  const block = {
    hero: () => P.hero(),
    palette: () => P.palette(),
    type: () => P.type(),
    sections: () => `<div class="ab-sections">
      ${L.sectionOrder.map(k => sec[k]()).join('\n      ')}
    </div>`,
  };
  const ruled = { hero: true, palette: true };
  let body = '';
  L.order.forEach((k, i) => {
    const last = i === L.order.length - 1;
    // `type` ends with its own rule + newline indent; every other block gets one here.
    body += block[k]() + (ruled[k] && !last ? '\n    <div class="ab-rule"></div>\n    ' : (k === 'type' ? '' : '\n    '));
  });
  return `${P.rootOpen()}
  <div class="ab-in">
    ${P.head()}
    <div class="ab-rule"></div>
    ${body}${P.foot()}
  </div>
</section>`;
}

/* ---------------- main board + compare grid ---------------- */

// What the stage shows (UI only, never saved). The four tabs in the toolbar are Board, Patterns,
// Deck and Brief; the Board tab has three modes inside the stage: 'board' (the UI), 'built' and 'compare'.
let boardView = 'board';          // 'board' | 'compare' | 'built' | 'patterns' | 'deck' | 'brief'
const BOARD_VIEWS = ['board', 'compare', 'built', 'patterns', 'deck', 'brief'];
const BOARD_MODES = ['board', 'built', 'compare'];
let boardMode = 'board';          // the mode the Board tab returns to
const CMP_WIDE = 900;             // design width of a tile board on a wide grid
const CMP_NARROW = 500;           // ...and on a one-column grid

function setBoardFonts(el) {
  el.style.setProperty('--font-heading', state.headingFont.css);
  el.style.setProperty('--font-body', state.bodyFont.css);
}

// The state and def the board, deck, patterns and brief render: the base aesthetic,
// or the blend of base and donor when one is active (js/blend.js). `st` defaults to the
// editor state; the brief passes its own copy.
function abView(st = state) {
  return typeof aestheticView === 'function' ? aestheticView(st) : { state: st, def: resolveAestheticDef(st), blend: null };
}

function renderMainBoard() {
  const host = document.getElementById('previewCard');
  if (!host) return;
  setBoardFonts(host);
  const v = abView();
  host.innerHTML = boardHtml(v.state, v.def);
  if (v.def.blend && typeof blendClearArtText === 'function') {
    blendClearArtText(host.firstElementChild);
    blendLegibility(host.firstElementChild);
  }
}

// Each tile previews its aesthetic in its own recommended mode (def.mode), the
// mode selecting it would switch to, via a per-tile state clone; the global
// state and the main board keep the brand's actual bgMode. The sidebar family
// filter applies here too.
function renderCompareGrid() {
  const grid = document.getElementById('compareGrid');
  if (!grid) return;
  setBoardFonts(grid);
  const defs = visibleAesthetics();
  const note = aeFamily === 'all' ? '' : `<p class="cmp-note">${escapeHtml(aestheticFamilyLabel(aeFamily))}: ${defs.length} of ${aePool().length} aesthetics. Choose All in the style gallery to see every one.</p>`;
  // The tile of the selected aesthetic follows the Classic | Current choice.
  const shown = d => (d.key === state.aesthetic ? resolveAestheticDef(state) : d);
  grid.innerHTML = note + defs.map(def => {
    const drawn = shown(def);
    return `
    <div class="cmp-tile${def.key === state.aesthetic ? ' is-current' : ''}" role="button" tabindex="0"
         data-key="${def.key}" aria-label="Use ${escapeHtml(def.name)}" aria-pressed="${def.key === state.aesthetic}">
      <div class="cmp-label"><span class="cmp-num">${aestheticNumber(def.key)}</span><span class="cmp-name">${escapeHtml(def.name)}</span><span class="cmp-desc">${escapeHtml(def.descriptor)}</span></div>
      <div class="cmp-frame"><div class="cmp-board" inert>${boardHtml(Object.assign({}, state, { bgMode: drawn.mode }), drawn)}</div></div>
    </div>`;
  }).join('');
  fitCompareGrid();
  observeCompareBoards(grid);
}

// Tiles show the real board at a fixed design width, shrunk with CSS zoom so
// the container queries inside still see the layout width they were drawn for.
function fitCompareGrid() {
  const grid = document.getElementById('compareGrid');
  const first = grid && grid.querySelector('.cmp-frame');
  if (!first) return;
  const w = first.clientWidth;
  if (!w) return;
  const design = w >= 380 ? CMP_WIDE : CMP_NARROW;
  const zoom = w / design;
  grid.style.setProperty('--cmp-w', design + 'px');
  const z = zoom.toFixed(4);
  if (grid.style.getPropertyValue('--cmp-zoom') === z) return;
  grid.style.setProperty('--cmp-zoom', z);
  // Frames already measured follow the new scale (next frame: this runs from the grid's
  // own ResizeObserver, and resizing the grid inside it would loop the observer).
  requestAnimationFrame(() => {
    grid.querySelectorAll('.cmp-board[data-h]').forEach(b => { b.parentElement.style.height = Math.ceil(b.dataset.h * zoom) + 'px'; });
  });
}

// Tile boards are scaled with a transform, not CSS zoom: WebKit's minimum font size
// would blow zoomed small text (labels, swatch codes) back up to 9px. A transform keeps
// the board's full height in the layout, so each frame is sized to the scaled height
// once its board has been laid out (off-screen frames skip layout until they are seen).
let cmpSizer = null;
function observeCompareBoards(grid) {
  if (typeof ResizeObserver !== 'function') return;
  if (!cmpSizer) {
    // Heights are written on the next frame: shrinking frames brings more of them on
    // screen, and sizing those inside the same callback loops ResizeObserver.
    cmpSizer = new ResizeObserver(entries => {
      const sized = entries.filter(en => en.contentRect.height).map(en => [en.target, en.contentRect.height]);
      requestAnimationFrame(() => {
        const g = document.getElementById('compareGrid');
        const zoom = parseFloat(g && g.style.getPropertyValue('--cmp-zoom')) || 0.5;
        sized.forEach(([b, h]) => {
          if (!b.isConnected) return;
          b.dataset.h = Math.round(h);
          b.parentElement.style.height = Math.ceil(h * zoom) + 'px';
        });
      });
    });
  }
  cmpSizer.disconnect();
  grid.querySelectorAll('.cmp-board').forEach(b => cmpSizer.observe(b));
}

function renderAestheticBoard() {
  const def = abView().def;
  const compare = boardView === 'compare';
  const patterns = boardView === 'patterns';
  const built = boardView === 'built';   // product screens, js/see-built.js
  const deck = boardView === 'deck';
  const brief = boardView === 'brief';
  const host = document.getElementById('previewCard');
  const grid = document.getElementById('compareGrid');
  const pview = document.getElementById('patternsView');
  const bview = document.getElementById('builtView');
  const dsec = document.getElementById('deckSection');
  const brv = document.getElementById('briefView');
  const modes = document.getElementById('boardMode');
  if (host) host.hidden = compare || patterns || built || deck || brief;
  if (grid) grid.hidden = !compare;
  if (pview) pview.hidden = !patterns;
  if (bview) bview.hidden = !built;
  if (dsec) dsec.hidden = !deck;
  if (brv) brv.hidden = !brief;
  if (modes) modes.hidden = !BOARD_MODES.includes(boardView);
  if (!built && bview && bview.firstChild) bview.innerHTML = '';
  if (!brief && brv && brv.firstChild) brv.innerHTML = '';
  // Each view draws only itself. The others are emptied (Compare holds one full board per
  // aesthetic, 48 of them; the deck holds ten slides) and rebuilt when their view is shown
  // again. The Patterns view (js/patterns-ui.js) keeps its own DOM but draws nothing while hidden.
  if (typeof PatternsUI !== 'undefined') PatternsUI.setVisible(patterns);
  if (typeof setBrandDeckActive === 'function') setBrandDeckActive(deck);
  if (patterns || built || deck || brief) {
    if (host && host.firstChild) host.innerHTML = '';
    if (grid && grid.firstChild) grid.innerHTML = '';
    if (built && typeof SeeBuilt !== 'undefined') SeeBuilt.render();
    if (brief) renderBriefView();
  } else if (compare) {
    renderCompareGrid();
    if (host && host.firstChild) host.innerHTML = '';
  } else {
    renderMainBoard();
    if (grid && grid.firstChild) grid.innerHTML = '';
  }
  syncAestheticChrome(def);
}

/* ---------------- Brief view ---------------- */

// The brief an AI builds from, as the Brief tab: the text itself, with Copy, the designed page
// (js/brief-view.js) and a Markdown download. The text is the same buildAiBrief(state) the
// sidebar's Copy AI brief copies.
function briefText() {
  if (window.Show && typeof Show.brief === 'function' && typeof Show.brief.text === 'function') return Show.brief.text();
  return typeof buildAiBrief === 'function' ? buildAiBrief(state) : '';
}

function renderBriefView() {
  const el = document.getElementById('briefView');
  if (!el) return;
  const text = briefText();
  if (!el.firstChild) {
    el.innerHTML = `
      <div class="section-head">
        <div class="deck-title">
          <h2>Brief</h2>
          <p class="deck-desc">What an AI coding tool reads to build with this brand. Paste it into the tool.</p>
        </div>
        <div class="deck-actions">
          <button type="button" class="btn btn-primary btn-small" data-brief="copy">Copy AI brief</button>
          <button type="button" class="btn btn-ghost btn-small" data-brief="page">View as a page</button>
          <button type="button" class="btn btn-ghost btn-small btn-ico-download" data-brief="download">Download .md</button>
        </div>
      </div>
      <pre class="bp-text" tabindex="0" aria-label="The brief, as Markdown"></pre>`;
    el.addEventListener('click', e => {
      const b = e.target.closest('[data-brief]');
      if (!b) return;
      if (b.dataset.brief === 'copy') {
        const src = document.getElementById('copyAiBrief');
        if (src) src.click();
      } else if (b.dataset.brief === 'page') {
        if (window.Show && typeof Show.brief === 'function') Show.brief(b);
      } else if (b.dataset.brief === 'download') {
        const blob = new Blob([briefText()], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${typeof brandFileSlug === 'function' ? brandFileSlug() : 'brand'}-brand-brief.md`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        if (typeof showToast === 'function') showToast('Brief downloaded');
      }
    });
  }
  const pre = el.querySelector('.bp-text');
  if (pre.textContent !== text) pre.textContent = text;
}

/* ---------------- family filter (sidebar + Compare) ---------------- */

const AE_FAMILY_STORE = 'bd.aestheticFamily';   // localStorage, per viewer
let aeFamily = 'all';                            // 'all' or an AESTHETIC_FAMILIES key

function aeFamiliesAvailable() {
  return typeof AESTHETIC_FAMILIES !== 'undefined' && typeof aestheticFamilyOf === 'function';
}

function loadAeFamily() {
  try {
    const v = localStorage.getItem(AE_FAMILY_STORE);
    if (aeFamiliesAvailable() && AESTHETIC_FAMILIES.some(f => f.key === v)) aeFamily = v;
  } catch (err) { /* storage unavailable: stay on All */ }
}

function saveAeFamily() {
  try { localStorage.setItem(AE_FAMILY_STORE, aeFamily); } catch (err) { /* ignore */ }
}

// The aesthetics the sidebar, step buttons, shuffle and Compare work over.
// In showcase mode (js/showcase.js) only the curated favourites are offered.
function aePool() {
  return typeof showcaseFilter === 'function' ? showcaseFilter(AESTHETICS) : AESTHETICS;
}
function visibleAesthetics() {
  const pool = aePool();
  if (aeFamily === 'all' || !aeFamiliesAvailable()) return pool;
  const list = pool.filter(a => aestheticFamilyOf(a.key) === aeFamily);
  return list.length ? list : pool;
}

function buildAestheticFamilies() {
  const host = document.getElementById('aeFamilies');
  if (!host) return;
  if (!aeFamiliesAvailable()) { host.hidden = true; return; }
  const chip = (key, label, n) =>
    `<button type="button" class="ae-fam" data-family="${key}" aria-pressed="false">${escapeHtml(label)}<i>${n}</i></button>`;
  const pool = aePool();
  host.innerHTML = chip('all', 'All', pool.length)
    + AESTHETIC_FAMILIES.map(f => [f, pool.filter(a => aestheticFamilyOf(a.key) === f.key).length])
      .filter(([, n]) => n).map(([f, n]) => chip(f.key, f.label, n)).join('');
}

function setAeFamily(key) {
  aeFamily = key;
  saveAeFamily();
  buildAestheticList();
  renderAestheticBoard();
}

/* ---------------- header + sidebar panel ---------------- */

function syncAestheticChrome(def) {
  const name = document.getElementById('aeName');
  if (name) name.textContent = def.name;
  const desc = document.getElementById('aeDesc');
  if (desc) desc.textContent = def.descriptor;
  const sum = document.getElementById('aeSummary');
  if (sum) sum.textContent = def.summary || '';
  document.querySelectorAll('#aeList .gal-tile').forEach(b => {
    const on = b.dataset.key === state.aesthetic;
    b.setAttribute('aria-pressed', String(on));
    b.classList.toggle('is-current', on);
  });
  syncAestheticVersionUi();
  document.querySelectorAll('#aeFamilies .ae-fam').forEach(b => {
    b.setAttribute('aria-pressed', String(b.dataset.family === aeFamily));
  });
  const shuffle = document.getElementById('shuffleAesthetic');
  if (shuffle) shuffle.textContent = aeFamily === 'all' ? 'Shuffle style' : `Shuffle ${aestheticFamilyLabel(aeFamily)}`;
  document.querySelectorAll('input[name="workView"]').forEach(r => { r.checked = r.value === (BOARD_MODES.includes(boardView) ? 'board' : boardView); });
  document.querySelectorAll('input[name="boardMode"]').forEach(r => { r.checked = r.value === boardMode; });
  renderFontRec(def.blend ? def.blend.base : def);
  if (typeof syncBlendUi === 'function') syncBlendUi();
  if (window.SidebarUI && typeof SidebarUI.syncStyle === 'function') SidebarUI.syncStyle();
}

// The Classic | Current switch: only for an aesthetic that has a classic copy.
function syncAestheticVersionUi() {
  const host = document.getElementById('aeVersion');
  if (!host) return;
  host.hidden = !hasClassicAesthetic(state.aesthetic);
  const classic = state.aestheticVersion === 'classic';
  // The switch stays hidden unless developer mode is on (css/styles.css), except to leave a classic look.
  if (classic) document.body.dataset.classic = 'on'; else delete document.body.dataset.classic;
  host.querySelectorAll('button[data-version]').forEach(b => {
    b.setAttribute('aria-pressed', String((b.dataset.version === 'classic') === classic));
  });
}

// Typography panel: one line naming the recommendation and how the current
// faces fit, plus the apply button (wired in app.js).
const AB_FIT_PLAIN = { match: 'fits', consider: 'consider', avoid: 'avoid' };
function renderFontRec(def) {
  const host = document.getElementById('fontRec');
  if (!host) return;
  const meta = typeof aestheticMeta === 'function' ? aestheticMeta(def.key) : null;
  if (!meta) { host.hidden = true; return; }
  const pair = meta.fonts.pairings[0];
  const fits = fontFitFor(def.key, state);
  host.hidden = false;
  document.getElementById('frText').textContent = `Suited to ${def.name}: ${pair[0]} / ${pair[1]}.`;
  document.getElementById('frFit').innerHTML =
    `Heading <b data-fit="${fits.heading}">${AB_FIT_PLAIN[fits.heading]}</b>, body <b data-fit="${fits.body}">${AB_FIT_PLAIN[fits.body]}</b>.`;
}

// The style gallery's tiles (js/style-gallery.js draws a live board into each frame
// while the gallery is open). A div, not a <button>: the board inside holds controls.
function buildAestheticList() {
  const list = document.getElementById('aeList');
  if (!list) return;
  list.innerHTML = visibleAesthetics().map(def => `
    <div class="gal-tile" role="button" tabindex="-1" data-key="${def.key}" aria-pressed="false"
         aria-label="${escapeHtml(def.name)}: ${escapeHtml(def.descriptor)}" title="${escapeHtml(def.summary || def.name)}"
         data-search="${escapeHtml(`${def.name} ${def.descriptor} ${def.influences || ''} ${def.summary || ''}`.toLowerCase())}">
      <div class="gal-frame"><div class="gal-board" inert></div></div>
      <div class="gal-meta"><span class="gal-num">${aestheticNumber(def.key)}</span><span class="gal-name">${escapeHtml(def.name)}</span><span class="gal-badge">Current</span><span class="gal-desc">${escapeHtml(def.descriptor)}</span></div>
    </div>`).join('');
  if (window.StyleGallery && typeof StyleGallery.listBuilt === 'function') StyleGallery.listBuilt();
}

// Prev / next walk the visible (filtered) list; from an aesthetic outside the
// filter they land on its first or last entry.
function stepAesthetic(dir) {
  const list = visibleAesthetics();
  const i = list.findIndex(a => a.key === state.aesthetic);
  const next = i < 0 ? (dir > 0 ? list[0] : list[list.length - 1]) : list[(i + dir + list.length) % list.length];
  chooseAesthetic(next.key);
}

function setBoardView(view) {
  boardView = BOARD_VIEWS.includes(view) ? view : 'board';
  if (BOARD_MODES.includes(boardView)) boardMode = boardView;
  renderAestheticBoard();
}

// The toolbar tabs: Board returns to the mode it was last in.
function setWorkView(tab) {
  setBoardView(tab === 'board' ? boardMode : tab);
}

/* ---------------- local interactions ---------------- */

function wireBoardInteractions(host) {
  host.addEventListener('click', e => {
    const board = e.target.closest('.ab');
    if (!board) return;
    const seg = e.target.closest('.ab-seg-btn');
    if (seg) {
      board.querySelectorAll('.ab-seg-btn').forEach(b => b.setAttribute('aria-pressed', String(b === seg)));
      const copy = AB_STAGES[seg.dataset.stage];
      board.querySelector('[data-ab-title]').textContent = copy[0];
      board.querySelector('[data-ab-body]').textContent = copy[1];
      const label = board.querySelector('.ab-cta-label');
      if (label) label.textContent = 'Save direction';
      return;
    }
    if (e.target.closest('.ab-type-apply')) { applyRecommendedFonts(); return; }
    const cta = e.target.closest('.ab-cta:not(.ab-state-ctl)');
    if (cta) {
      cta.querySelector('.ab-cta-label').textContent = 'Direction saved';
    }
  });
  host.addEventListener('change', e => {
    if (!e.target.classList.contains('ab-switch')) return;
    const status = e.target.closest('.ab-panel').querySelector('.ab-status');
    if (status) status.textContent = e.target.checked ? 'Focus mode on' : 'Focus mode off';
  });
}

function initAestheticUi() {
  loadAeFamily();
  buildAestheticFamilies();
  buildAestheticList();
  document.getElementById('aeFamilies').addEventListener('click', e => {
    const chip = e.target.closest('.ae-fam');
    if (chip) setAeFamily(chip.dataset.family);
  });
  wireBoardInteractions(document.getElementById('previewCard'));
  if (typeof initBlendUi === 'function') initBlendUi();

  document.getElementById('aeList').addEventListener('click', e => {
    const tile = e.target.closest('.gal-tile');
    if (tile) chooseAesthetic(tile.dataset.key);
  });
  document.getElementById('aePrev').addEventListener('click', () => stepAesthetic(-1));
  document.getElementById('aeNext').addEventListener('click', () => stepAesthetic(1));
  document.querySelectorAll('input[name="workView"]').forEach(r => {
    r.addEventListener('change', e => { if (e.target.checked) setWorkView(e.target.value); });
  });
  document.querySelectorAll('input[name="boardMode"]').forEach(r => {
    r.addEventListener('change', e => { if (e.target.checked) setBoardView(e.target.value); });
  });

  const grid = document.getElementById('compareGrid');
  const pick = tile => {
    if (!tile) return;
    boardView = 'board';
    boardMode = 'board';
    if (tile.dataset.key === state.aesthetic) renderAestheticBoard();
    else chooseAesthetic(tile.dataset.key);
  };
  grid.addEventListener('click', e => pick(e.target.closest('.cmp-tile')));
  grid.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const tile = e.target.closest('.cmp-tile');
    if (!tile) return;
    e.preventDefault();
    e.stopPropagation();   // Space is also the global shuffle shortcut
    pick(tile);
  });
  if (window.ResizeObserver) new ResizeObserver(fitCompareGrid).observe(grid);
}

/* ---------------- logo legibility (Board, Built, Deck) ----------------
   An uploaded logo is a fixed image, so on a surface its ink cannot read on (dark ink on
   a dark header) it vanishes. Every `img.ab-logo` that appears anywhere is checked once
   against the colour actually behind it: its main colours are sampled, and when any of
   them falls under 3:1 a monochrome mark is flipped to black or white, and any other mark
   sits on a small plate in the canvas (or ink) colour with the style's own corner radius.
   Images that carry their own opaque background are left alone. The result is inline
   style, so slide exports and clones keep it. */
const AB_LOGO_MIN = 3;
const abLogoTones = new Map();   // src -> Promise<{ tones: [{r,g,b,w}], opaque } | null>

function abLogoSample(src) {
  if (abLogoTones.has(src)) return abLogoTones.get(src);
  const p = new Promise(resolve => {
    const im = new Image();
    im.onload = () => {
      try {
        const nw = im.naturalWidth || 160, nh = im.naturalHeight || 160;
        const k = 96 / Math.max(nw, nh);
        const w = Math.max(1, Math.round(nw * k)), h = Math.max(1, Math.round(nh * k));
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        const cx = c.getContext('2d', { willReadFrequently: true });
        cx.drawImage(im, 0, 0, w, h);
        const d = cx.getImageData(0, 0, w, h).data;
        const buckets = new Map();
        let total = 0, solid = 0;
        for (let i = 0; i < d.length; i += 4) {
          const a = d[i + 3];
          if (a >= 240) solid++;
          if (a < 90) continue;
          const wt = a / 255;
          const key = (d[i] >> 4) << 8 | (d[i + 1] >> 4) << 4 | (d[i + 2] >> 4);
          const b = buckets.get(key) || { r: 0, g: 0, b: 0, w: 0 };
          b.r += d[i] * wt; b.g += d[i + 1] * wt; b.b += d[i + 2] * wt; b.w += wt;
          buckets.set(key, b);
          total += wt;
        }
        if (!total) return resolve(null);
        const tones = [...buckets.values()].filter(b => b.w / total >= 0.06)
          .map(b => ({ r: b.r / b.w, g: b.g / b.w, b: b.b / b.w, w: b.w / total }));
        resolve({ tones, opaque: solid / (w * h) > 0.97 });
      } catch (err) { resolve(null); }   // unreadable (tainted) image: leave it as it is
    };
    im.onerror = () => resolve(null);
    im.src = src;
  });
  abLogoTones.set(src, p);
  return p;
}

const abRgbLum = c => {
  const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
};
const abRgbContrast = (a, b) => {
  const la = abRgbLum(a), lb = abRgbLum(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};
function abParseColor(css) {
  const m = /rgba?\(([^)]+)\)/.exec(css || '');
  if (!m) return null;
  const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
  return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
}

// The colour a logo sits on: walks up the ancestors, stacking translucent fills until an
// opaque one (gradients count as the average of their stops).
function abBackdropOf(el) {
  const layers = [];
  for (let n = el.parentElement; n && n !== document.documentElement; n = n.parentElement) {
    const cs = getComputedStyle(n);
    const bi = cs.backgroundImage || '';
    // Only a gradient that really fills the box counts: hairline grids, stripes and bars
    // (repeating, sized, or with transparent stops) are decoration drawn over the fill.
    const fills = /gradient\(/.test(bi) && !/repeating-/.test(bi) && /^(auto( auto)?|100% 100%|cover)?(, ?(auto( auto)?|100% 100%|cover))*$/.test(cs.backgroundSize || 'auto');
    if (fills) {
      const cols = (bi.match(/rgba?\([^)]+\)/g) || []).map(abParseColor).filter(Boolean);
      if (cols.length && !cols.some(c => c.a < 0.3)) {
        const avg = cols.reduce((s, c) => ({ r: s.r + c.r, g: s.g + c.g, b: s.b + c.b, a: s.a + c.a }), { r: 0, g: 0, b: 0, a: 0 });
        const L = { r: avg.r / cols.length, g: avg.g / cols.length, b: avg.b / cols.length, a: avg.a / cols.length };
        if (L.a > 0.95) { layers.push({ ...L, a: 1 }); break; }
        if (L.a > 0.05) layers.push(L);
      }
    }
    const c = abParseColor(cs.backgroundColor);
    if (c && c.a > 0.05) { layers.push(c); if (c.a > 0.95) break; }
  }
  let out = { r: 255, g: 255, b: 255 };
  for (let i = layers.length - 1; i >= 0; i--) {
    const L = layers[i];
    out = { r: out.r * (1 - L.a) + L.r * L.a, g: out.g * (1 - L.a) + L.g * L.a, b: out.b * (1 - L.a) + L.b * L.a };
  }
  return out;
}

function abHexRgb(hex) {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec((hex || '').trim());
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].replace(/./g, '$&$&') : m[1];
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
}

function abClearLogoFit(img) {
  if (!img.hasAttribute('data-logo-fit')) return;
  img.removeAttribute('data-logo-fit');
  ['filter', 'background', 'padding', 'border-radius', 'box-sizing'].forEach(p => img.style.removeProperty(p));
}

// How much of a mark's ink is lost on a surface: the share under 3:1 and the share under
// 2:1 (a pale tint in an otherwise visible mark is fine, a wordmark that vanishes is not).
function abLogoLoss(tones, back) {
  let under3 = 0, under2 = 0, all = 0;
  tones.forEach(t => {
    const c = abRgbContrast(t, back);
    all += t.w;
    if (c < AB_LOGO_MIN) under3 += t.w;
    if (c < 2) under2 += t.w;
  });
  return { under3: all ? under3 / all : 0, under2: all ? under2 / all : 0 };
}
const abLogoLost = (tones, back) => { const l = abLogoLoss(tones, back); return l.under2 >= 0.25 || l.under3 >= 0.5; };

function abFitLogo(img) {
  const src = img.currentSrc || img.getAttribute('src');
  if (!src) return Promise.resolve();
  return abLogoSample(src).then(info => {
    if (!img.isConnected) return;
    abClearLogoFit(img);
    if (!info || info.opaque || !info.tones.length) return;
    const bg = abBackdropOf(img);
    const tones = info.tones;
    if (!abLogoLost(tones, bg)) return;
    const root = img.closest('.ab') || document.body;
    const rs = getComputedStyle(root);
    const mono = tones.length === 1 || tones.every(t => Math.max(t.r, t.g, t.b) - Math.min(t.r, t.g, t.b) < 36);
    if (mono) {
      // One ink: flip it to whichever of white / black reads on the surface.
      const white = abRgbContrast({ r: 255, g: 255, b: 255 }, bg), black = abRgbContrast({ r: 0, g: 0, b: 0 }, bg);
      if (Math.max(white, black) >= AB_LOGO_MIN) {
        img.setAttribute('data-logo-fit', 'flip');
        img.style.setProperty('filter', white >= black ? 'brightness(0) invert(1)' : 'brightness(0)');
        return;
      }
    }
    // Plate: the canvas colour first, then the ink colour, then plain white / black.
    const cands = [abHexRgb(rs.getPropertyValue('--ab-canvas')), abHexRgb(rs.getPropertyValue('--ab-ink')),
      { r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 }].filter(Boolean);
    let plate = cands.find(c => !abLogoLost(tones, c));
    if (!plate) {
      // No plate fully rescues the mark. Logos are drawn for white: if the mark's darkest
      // heavy ink (usually the wordmark) already reads on the surface, leave it bare;
      // otherwise sit it on white.
      const heavy = tones.filter(t => t.w >= 0.2);
      const dark = (heavy.length ? heavy : tones).reduce((a, t) => (abRgbLum(t) < abRgbLum(a) ? t : a));
      if (abRgbContrast(dark, bg) >= AB_LOGO_MIN) return;
      plate = { r: 255, g: 255, b: 255 };
    }
    const card = root.querySelector('.ab-card, .ab-cta');
    const rad = card ? parseFloat(getComputedStyle(card).borderTopLeftRadius) || 0 : 6;
    img.setAttribute('data-logo-fit', 'plate');
    img.style.setProperty('box-sizing', 'content-box');
    img.style.setProperty('background', `rgb(${Math.round(plate.r)}, ${Math.round(plate.g)}, ${Math.round(plate.b)})`);
    img.style.setProperty('padding', '5px 9px');
    img.style.setProperty('border-radius', Math.min(rad, 14) + 'px');
  });
}

function abFitLogos(root) {
  (root || document).querySelectorAll('img.ab-logo').forEach(img => { abFitLogo(img); });
}

// Every board, Built screen, slide, tile and clone that gets added is checked, wherever
// it is drawn from. Only added nodes are looked at, so the inline styles it sets never loop.
(function watchLogos() {
  if (typeof MutationObserver !== 'function' || !document.body) {
    document.addEventListener('DOMContentLoaded', watchLogos, { once: true });
    return;
  }
  const todo = new Set();
  let queued = false;
  const flush = () => { queued = false; const list = [...todo]; todo.clear(); list.forEach(abFitLogo); };
  new MutationObserver(muts => {
    for (const m of muts) {
      m.addedNodes.forEach(n => {
        if (n.nodeType !== 1) return;
        if (n.matches && n.matches('img.ab-logo')) todo.add(n);
        if (n.querySelectorAll) n.querySelectorAll('img.ab-logo').forEach(i => todo.add(i));
      });
    }
    if (todo.size && !queued) { queued = true; Promise.resolve().then(flush); }
  }).observe(document.body, { childList: true, subtree: true });
  abFitLogos(document);
})();

/* ---------------- headline word fit ----------------
   A headline never breaks a word in the middle ("INSTAGR / AM."). The stylesheet lets words
   overflow instead (overflow-wrap: normal), and this pass shrinks --ab-hs on the board root,
   which every headline size multiplies, until the longest word fits its box. Floor 0.55 of
   the designed size; a word still wider at the floor is cut as a last resort
   (data-wrap-last-resort). Measured in the headline's own box, so a zoomed mini board
   (.ob-mini-board) and a scaled deck slide read the same as a full-size board. Deck slides
   have their own fit (bdFitDeck) and are left alone. */
const AB_HL_FLOOR = 0.55;
const abHlRoots = new Set();

// Width of the box divided by the widest word that spills it (1 = every word fits; a word
// split across lines counts as 0.94, one more step down).
function abHeadlineNeed(h) {
  const box = h.getBoundingClientRect();
  if (box.width < 4) return 1;
  let need = 1;
  const rng = document.createRange();
  // Each word is a run of text; the highlight with its closing punctuation (.ab-hl-glue) is one word.
  const words = [];
  const walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (n.parentElement && n.parentElement.closest('.ab-hl-glue')) continue;
    const re = /\S+/g;
    let m;
    while ((m = re.exec(n.nodeValue))) {
      const from = m.index, to = m.index + m[0].length;
      words.push(() => { rng.setStart(n, from); rng.setEnd(n, to); return [...rng.getClientRects()]; });
    }
  }
  // The glued unit is measured by its text alone, not the highlight's band or padding.
  h.querySelectorAll('.ab-hl-glue').forEach(g => words.push(() => {
    const out = [];
    const tw = document.createTreeWalker(g, NodeFilter.SHOW_TEXT);
    for (let t = tw.nextNode(); t; t = tw.nextNode()) { rng.selectNodeContents(t); out.push(...rng.getClientRects()); }
    return out;
  }));
  for (const rectsOf of words) {
    const rects = rectsOf().filter(q => q.width > 0.5 && q.height > 0.5);
    if (!rects.length) continue;
    const left = Math.min(...rects.map(q => q.left)), right = Math.max(...rects.map(q => q.right));
    // How far past the box the word reaches, from the far edge: a narrow word on an overlong line (ransom tiles) counts too.
    if (right > box.right + 1.5) need = Math.min(need, box.width / (right - box.left));
    if (left < box.left - 1.5) need = Math.min(need, box.width / (box.right - left));
    const mid = rects.map(q => q.top + q.height / 2);
    if (Math.max(...mid) - Math.min(...mid) > Math.min(...rects.map(q => q.height)) * 0.5) need = Math.min(need, 0.94);
  }
  return need;
}

function abFitHeadlines(root) {
  if (!root || !root.isConnected || root.classList.contains('ab-slide')) return;
  const heads = [...root.querySelectorAll('.ab-headline')].filter(h => h.getClientRects().length);
  if (!heads.length) return;
  heads.forEach(h => {
    h.removeAttribute('data-wrap-last-resort');
    if (h.hasAttribute('data-ab-fs')) { h.style.removeProperty('font-size'); h.removeAttribute('data-ab-fs'); }
    if (h.hasAttribute('data-ab-mw')) { h.style.removeProperty('max-width'); h.removeAttribute('data-ab-mw'); }
  });
  // Whatever --ab-hs a fit of mine did not set (a new render, a blend, the type size) is the new designed size.
  const cur = root.style.getPropertyValue('--ab-hs');
  if (root.dataset.abHsFit === undefined || root.dataset.abHsFit !== cur) root.dataset.abHs0 = cur || '1';
  const base = parseFloat(root.dataset.abHs0) || 1;
  const setHs = f => { const t = f === 1 ? root.dataset.abHs0 : (base * f).toFixed(3); root.style.setProperty('--ab-hs', t); root.dataset.abHsFit = t; };
  setHs(1);
  const worst = () => Math.min(1, ...heads.map(abHeadlineNeed));
  let need = worst();
  if (need >= 1) return;
  // A max-width on the headline (a measure in ch, which shrinks with the type) is a nicety
  // a whole word outranks: lift it before shrinking anything.
  heads.forEach(h => {
    if (abHeadlineNeed(h) < 1 && getComputedStyle(h).maxWidth !== 'none') { h.style.setProperty('max-width', 'none', 'important'); h.setAttribute('data-ab-mw', ''); }
  });
  need = worst();
  if (need >= 1) return;
  // The lever is --ab-hs; a headline whose own stylesheet ignores it is sized in px instead.
  const fs0 = heads.map(h => parseFloat(getComputedStyle(h).fontSize));
  let viaVar = true;
  const apply = f => {
    setHs(viaVar ? f : 1);
    if (!viaVar) heads.forEach((h, i) => { h.style.setProperty('font-size', (fs0[i] * f).toFixed(2) + 'px', 'important'); h.setAttribute('data-ab-fs', ''); });
  };
  let f = Math.max(AB_HL_FLOOR, Math.min(0.97, need * 0.985));
  apply(f);
  if (heads.every((h, i) => Math.abs(parseFloat(getComputedStyle(h).fontSize) - fs0[i]) < 0.01)) { viaVar = false; apply(f); }
  for (let i = 0; i < 8; i++) {
    need = worst();
    if (need >= 1 || f <= AB_HL_FLOOR) break;
    // The first steps are proportional guesses; the later ones close any gap the guess left.
    f = Math.max(AB_HL_FLOOR, f * (i < 3 ? Math.min(0.97, need * 0.985) : 0.96));
    apply(f);
  }
  heads.forEach(h => { if (abHeadlineNeed(h) < 1) h.setAttribute('data-wrap-last-resort', ''); });
}

(function watchHeadlines() {
  if (typeof MutationObserver !== 'function' || !document.body) {
    document.addEventListener('DOMContentLoaded', watchHeadlines, { once: true });
    return;
  }
  const todo = new Set();
  let queued = false;
  const flush = () => {
    queued = false;
    const list = [...todo];
    todo.clear();
    list.forEach(r => { try { abFitHeadlines(r); } catch (err) { /* an unfitted headline still shows */ } });
  };
  // A frame, or 120ms when frames are held back (a background tab): measuring needs layout, not a paint.
  const schedule = root => { todo.add(root); if (!queued) { queued = true; requestAnimationFrame(flush); setTimeout(flush, 120); } };
  const size = typeof ResizeObserver === 'function' ? new ResizeObserver(entries => entries.forEach(e => schedule(e.target))) : null;
  const add = root => {
    if (abHlRoots.has(root)) { schedule(root); return; }
    abHlRoots.add(root);
    if (size) size.observe(root);
    schedule(root);
  };
  const scan = node => {
    if (node.nodeType !== 1) return;
    const hit = n => { const r = n.closest('.ab'); if (r) add(r); };
    if (node.matches && node.matches('.ab-headline')) hit(node);
    if (node.querySelectorAll) node.querySelectorAll('.ab-headline').forEach(hit);
  };
  new MutationObserver(muts => muts.forEach(m => m.addedNodes.forEach(scan))).observe(document.body, { childList: true, subtree: true });
  // A face that arrives late changes the widths.
  if (document.fonts && document.fonts.addEventListener) {
    document.fonts.addEventListener('loadingdone', () => {
      abHlRoots.forEach(r => { if (r.isConnected) schedule(r); else { abHlRoots.delete(r); if (size) size.unobserve(r); } });
    });
  }
  scan(document.body);
})();
