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
// text AA), otherwise the same hue and saturation shaded toward black on a
// light canvas or tinted toward white on a dark one, one lightness step at a
// time, until it does. Falls back to ink only if no step reaches 3:1.
// Exception (light canvas only): a yellow or yellow-green accent (hue 38-80)
// darkened at constant hue turns olive, so the hue rotates toward 34 (amber)
// while it darkens: h' = h - min(14, (h - 34) * 0.6), s' = max(s, 85).
function abAccentInk(accent, canvas, ink) {
  if (contrastRatio(accent, canvas) >= 3) return accent;
  const hsl = hexToHsl(accent);
  const darken = contrastRatio(canvas, '#000000') >= contrastRatio(canvas, '#ffffff');
  const step = darken ? -1 : 1;
  const warm = darken && hsl.h >= 38 && hsl.h <= 80;
  const h = warm ? hsl.h - Math.min(14, (hsl.h - 34) * 0.6) : hsl.h;
  const s = warm ? Math.max(hsl.s, 85) : hsl.s;
  for (let l = Math.round(hsl.l); l >= 0 && l <= 100; l += step) {
    const hex = hslToHex(h, s, l);
    if (contrastRatio(hex, canvas) >= 3) return hex;
  }
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
  const ink = isDark ? c.neutralLight : c.neutralDark;
  if (def && typeof def.canvas === 'function') {
    const adjusted = abRun(def, 'canvas', def.canvas, [{
      canvas, ink, isDark, primary: c.primary, secondary: c.secondary, accent: c.accent,
      mix: slMix, hexToHsl, hslToHex,
    }, state], null);
    if (adjusted && typeof adjusted === 'string') canvas = adjusted;
  }
  // muted = ink moved 40% toward canvas, then pulled back toward ink until
  // small labels stay readable (>= 4.5:1).
  let toward = 0.4;
  let muted = slMix(canvas, ink, toward);
  while (toward > 0.05 && contrastRatio(muted, canvas) < 4.5) {
    toward -= 0.05;
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
    // Accent shaded/tinted to >= 3:1 on the canvas, same hue: the colour of the
    // highlight word when def.highlight is 'ink' (the default).
    accentInk: abAccentInk(c.accent, canvas, ink),
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
  return `${escapeHtml(m[1])}<span class="ab-hl">${escapeHtml(m[2])}</span>${escapeHtml(m[3])}`;
}

// The headline's h2 for the board hero and the deck's cover, principles and closing
// slides. Normal case: `<h2 class="ab-headline[ extra]">` with the last word wrapped in
// .ab-hl. When the def has a `headline(ctx, text)` hook (an aesthetic that draws its own
// headline: ransom tiles, rebus, mixed type) the h2 is still the headline, so the deck's
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
  if (t.printed) vars['--ab-primary-brand'] = t.primary;   // the true brand hex, only where the board prints another
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

let boardView = 'board';          // 'board' | 'compare' | 'patterns' (UI only, never saved)
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
  return typeof aestheticView === 'function' ? aestheticView(st) : { state: st, def: aestheticByKey(st.aesthetic), blend: null };
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
  const note = aeFamily === 'all' ? '' : `<p class="cmp-note">${escapeHtml(aestheticFamilyLabel(aeFamily))}: ${defs.length} of ${AESTHETICS.length} aesthetics. Choose All in the sidebar to see every one.</p>`;
  grid.innerHTML = note + defs.map(def => `
    <div class="cmp-tile${def.key === state.aesthetic ? ' is-current' : ''}" role="button" tabindex="0"
         data-key="${def.key}" aria-label="Use ${escapeHtml(def.name)}" aria-pressed="${def.key === state.aesthetic}">
      <div class="cmp-label"><span class="cmp-num">${String(def.order).padStart(2, '0')}</span><span class="cmp-name">${escapeHtml(def.name)}</span><span class="cmp-desc">${escapeHtml(def.descriptor)}</span></div>
      <div class="cmp-frame"><div class="cmp-board" inert>${boardHtml(Object.assign({}, state, { bgMode: def.mode }), def)}</div></div>
    </div>`).join('');
  fitCompareGrid();
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
  grid.style.setProperty('--cmp-w', design + 'px');
  grid.style.setProperty('--cmp-zoom', (w / design).toFixed(4));
}

function renderAestheticBoard() {
  const def = abView().def;
  const compare = boardView === 'compare';
  const patterns = boardView === 'patterns';
  const host = document.getElementById('previewCard');
  const grid = document.getElementById('compareGrid');
  const pview = document.getElementById('patternsView');
  if (host) host.hidden = compare || patterns;
  if (grid) grid.hidden = !compare;
  if (pview) pview.hidden = !patterns;
  // Only the visible view is built. The hidden ones are emptied (Compare holds
  // one full board per aesthetic, 48 of them) and rebuilt when their view is shown again. The
  // Patterns view (js/patterns-ui.js) keeps its own DOM but draws nothing
  // while hidden.
  if (typeof PatternsUI !== 'undefined') PatternsUI.setVisible(patterns);
  if (patterns) {
    if (host && host.firstChild) host.innerHTML = '';
    if (grid && grid.firstChild) grid.innerHTML = '';
  } else if (compare) {
    renderCompareGrid();
    if (host && host.firstChild) host.innerHTML = '';
  } else {
    renderMainBoard();
    if (grid && grid.firstChild) grid.innerHTML = '';
  }
  syncAestheticChrome(def);
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
function visibleAesthetics() {
  if (aeFamily === 'all' || !aeFamiliesAvailable()) return AESTHETICS;
  const list = AESTHETICS.filter(a => aestheticFamilyOf(a.key) === aeFamily);
  return list.length ? list : AESTHETICS;
}

function buildAestheticFamilies() {
  const host = document.getElementById('aeFamilies');
  if (!host) return;
  if (!aeFamiliesAvailable()) { host.hidden = true; return; }
  const chip = (key, label, n) =>
    `<button type="button" class="ae-fam" data-family="${key}" aria-pressed="false">${escapeHtml(label)}<i>${n}</i></button>`;
  host.innerHTML = chip('all', 'All', AESTHETICS.length)
    + AESTHETIC_FAMILIES.map(f => chip(f.key, f.label, AESTHETICS.filter(a => aestheticFamilyOf(a.key) === f.key).length)).join('');
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
  document.querySelectorAll('#aeList .ae-tile').forEach(b => {
    b.setAttribute('aria-pressed', String(b.dataset.key === def.key));
  });
  document.querySelectorAll('#aeFamilies .ae-fam').forEach(b => {
    b.setAttribute('aria-pressed', String(b.dataset.family === aeFamily));
  });
  const shuffle = document.getElementById('shuffleAesthetic');
  if (shuffle) shuffle.textContent = aeFamily === 'all' ? 'Shuffle aesthetic' : `Shuffle in ${aestheticFamilyLabel(aeFamily)}`;
  document.querySelectorAll('input[name="boardView"]').forEach(r => { r.checked = r.value === boardView; });
  renderFontRec(def.blend ? def.blend.base : def);
  if (typeof syncBlendUi === 'function') syncBlendUi();
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

function buildAestheticList() {
  const list = document.getElementById('aeList');
  if (!list) return;
  list.innerHTML = visibleAesthetics().map(def => `
    <button type="button" class="ae-tile" data-key="${def.key}" aria-pressed="false" title="${escapeHtml(def.summary || def.name)}">
      <span class="ae-motif" data-motif="${def.key}" aria-hidden="true"></span>
      <span class="ae-num">${String(def.order).padStart(2, '0')}</span>
      <span class="ae-name">${escapeHtml(def.name)}</span>
      <span class="ae-desc">${escapeHtml(def.descriptor)}</span>
    </button>`).join('');
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
  boardView = view === 'compare' || view === 'patterns' ? view : 'board';
  renderAestheticBoard();
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
    const tile = e.target.closest('.ae-tile');
    if (tile) chooseAesthetic(tile.dataset.key);
  });
  document.getElementById('aePrev').addEventListener('click', () => stepAesthetic(-1));
  document.getElementById('aeNext').addEventListener('click', () => stepAesthetic(1));
  document.querySelectorAll('input[name="boardView"]').forEach(r => {
    r.addEventListener('change', e => { if (e.target.checked) setBoardView(e.target.value); });
  });

  const grid = document.getElementById('compareGrid');
  const pick = tile => {
    if (!tile) return;
    boardView = 'board';
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
