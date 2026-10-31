/* ---------------------------------------------------------------------
   ai-brief.js — "Copy AI brief": one Markdown document a coding agent can
   build a real app from, on the platform the owner names (Web, SwiftUI or
   both), without condensing it or inventing what it leaves out.

   buildAiBrief(state, opts) is pure (no DOM), except the optional board probe and,
   for App briefs, the UI kit measurement (aibKitMeasure: the Built view's UI kit
   tab rendered off-screen and read back, so the kit rows state what it draws).
   Every color comes from boardTokens(state, def) in aesthetic-board.js, run
   once per mode (bgMode flipped on a copy), so the hexes are the ones the
   board shows. No AI anywhere: States, Motion, Accessibility, Icons and the
   App icon are rules from the aesthetic's material class (aestheticBuild in
   aesthetic-meta.js) and the palette.

   Also here: aibCheck (contradictions to resolve before copying), the Swift
   theme generator (aibSwift), aibFiles + aibZip (BRIEF.md, tokens.css,
   Theme.swift, pattern files in a .zip). The UI for all of it is in
   brief-view.js. Plain <script>, no modules.
------------------------------------------------------------------------ */


// The copy the brief uses: the brand's own words, with untouched fields resolved to the
// believable defaults the board shows (effectiveContent in app.js), never a placeholder.
function aibContent(state) {
  const c = (state && state.content) || {};
  if (typeof effectiveContent === 'function') return effectiveContent(c);
  const own = k => (typeof c[k] === 'string' && c[k].trim()) ? c[k].trim() : '';
  return { brandName: own('brandName') || 'Aster & Co.', tagline: own('tagline') || 'Made with care, built to last.' };
}

const AIB_ROLE_ORDER = ['canvas', 'ink', 'primary', 'secondary', 'accent'];

// Token name (CSS custom property), the t.* field it comes from, and which
// role it serves.
const AIB_TOKEN_ROWS = [
  ['--primary', 'primary', 'primary'],
  ['--secondary', 'secondary', 'secondary'],
  ['--accent', 'accent', 'accent'],
  ['--neutral-dark', 'neutralDark', null],
  ['--neutral-light', 'neutralLight', null],
  ['--canvas', 'canvas', 'canvas'],
  ['--ink', 'ink', 'ink'],
  ['--muted', 'muted', null],
  ['--line', 'line', null],
  ['--on-primary', 'onPrimary', null],
  ['--on-secondary', 'onSecondary', null],
  ['--on-accent', 'onAccent', null],
  ['--accent-ink', 'accentInk', null],
  ['--pri-tint', 'priTint', null],
  ['--sec-tint', 'secTint', null],
];

// Plain-language job for the derived tokens (the five brand roles come from
// colorRolesFor).
const AIB_DERIVED_JOB = {
  neutralDark: 'Brand neutral (dark). Becomes the canvas in dark mode, the ink in light mode',
  neutralLight: 'Brand neutral (light). Becomes the canvas in light mode, the ink in dark mode',
  muted: 'Secondary text, captions, placeholders, disabled labels',
  line: 'Hairlines, dividers, resting input borders',
  onPrimary: 'Text and icons on a primary fill only',
  onPrintPrimary: 'Text and icons on a --primary-print fill only (the label on the printed primary)',
  printPrimary: 'The primary as this aesthetic prints it: the brand primary pushed to a more vivid color. Use it wherever the board fills, rules or marks something with the primary (button, selected segment, switch on, focus ring, progress). The true brand primary appears only in the palette swatch',
  onSecondary: 'Text and icons on a secondary fill only',
  onAccent: 'Text and icons on an accent fill only',
  accentInk: 'The accent as text when it reaches 3:1 on the canvas; otherwise the ink, with the exact accent as a marker behind the word. Never a shaded or tinted accent.',
  priTint: 'Quiet primary wash: selected state background, hover on primary-linked items',
  secTint: 'Quiet secondary wash: selected row, tonal fills, hover on secondary items',
};

function aibCell(text) {
  return String(text == null ? '' : text).replace(/\|/g, '\\|').replace(/\s*\n\s*/g, ' ');
}

function aibTable(head, rows) {
  const line = cells => '| ' + cells.map(aibCell).join(' | ') + ' |';
  return [line(head), line(head.map(() => '---')), ...rows.map(line)].join('\n');
}

function aibGrade(ratio) {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA large text only';
  return 'FAIL';
}

const AIB_HEX = /^#[0-9a-f]{6}$/i;

// Color treatments that differ per aesthetic. Everything is a token name;
// the role rules always win over the look.
// The highlight treatment is def.highlight ('ink' | 'band' | 'custom', default
// 'ink'). 'custom' is described by def.highlightNote (one sentence).
function aibHighlightKind(def) {
  return def.highlight === 'band' || def.highlight === 'custom' ? def.highlight : 'ink';
}
// True when the aesthetic's colour rules keep a role in the palette only (its `use` starts "Palette only").
const aibPaletteOnly = (roles, role) => !!(roles && roles[role] && /^palette only/i.test(roles[role].use || ''));

// True when the aesthetic's own colour rules keep the primary off buttons and controls (its role's `never`
// names a button fill, or buttons in a list of things). The generic component text then draws those states in
// --ink, and the main action is ink-filled, so no component line contradicts the rule.
function aibPrimaryBarred(roles) {
  const r = roles && roles.primary;
  return !!r && /\ba button fill\b|\bbuttons,|,\s*buttons\b/i.test(r.never || '');
}
const aibInkCta = def => def.ctaFill === 'ink' || aibPrimaryBarred(def.roles);

// Aesthetics whose UI controls (cards, inputs, buttons, selected segments) carry
// an ink border. In Bauhaus Poster only the controls do; the art shapes have no
// outline.
const AIB_INK_BORDER = ['raw-brutalist', 'neo-brutal-pop', 'bauhaus-poster'];

// Card / panel background: def.cardFill (an aesthetic extra token such as
// '--ab-paper', or a hex) when the aesthetic has one, else --canvas.
function aibCardFill(def, t, extras) {
  const raw = def.cardFill;
  if (!raw) return '--canvas';
  const name = String(raw);
  // the aesthetic's own name for the canvas (--ab-canvas, or a panel token that equals it) is the --canvas token here
  const own = extras && extras[name] != null ? String(extras[name]).trim() : '';
  if (name === '--ab-canvas' || (own && t.canvas && own.toLowerCase() === String(t.canvas).toLowerCase())) return '--canvas';
  if (AIB_HEX.test(own)) return name + ' (' + own + ')';
  return t[name] != null ? '--' + abKebab(name) : name;
}

function aibComponentRows(t, def, extras) {
  const key = def.classicOf || def.key;     // a classic def keeps its aesthetic's component notes
  // Where the aesthetic prints the primary as another color (def.printPrimary), the board's
  // primary fills, rules and marks use --primary-print; --primary is the brand hex only.
  // A printed primary (def.printPrimary) is the one --primary token in the brief: the table lists the
  // printed hex, so the components always say --primary.
  const barred = aibPrimaryBarred(def.roles);
  const PRI = barred ? '--ink' : '--primary';   // where the colour rules bar the primary, its states are drawn in --ink
  const ONP = barred ? '--canvas' : '--on-primary';
  const secOff = aibPaletteOnly(def.roles, 'secondary'), accOff = aibPaletteOnly(def.roles, 'accent');
  const focusLow = !barred && contrastRatio(t.printPrimary, t.canvas) < 3;
  const hlKind = aibHighlightKind(def);
  const inkCta = aibInkCta(def);

  let segOn;
  if (key === 'soft-form' || key === 'raw-brutalist') segOn = ['--ink', '--canvas', 'none'];
  else if (key === 'aurora-noir') segOn = [t.mix(t.primary, t.canvas, t.isDark ? 0.2 : 0.14) + ' (primary at ' + (t.isDark ? '20' : '14') + '% over canvas)', '--ink', 'primary at 55%'];
  else if (key === 'liquid-glass') segOn = ['translucent lens: --canvas lightened toward white', '--ink', 'white at 50%'];
  else if (key === 'holo-iridescent') segOn = ['decorative silver chrome pill (see Materials)', '--ink', 'none'];
  else if (key === 'clay') segOn = ['near-white puffy pill (see Materials)', '--ink', 'none'];
  else segOn = [PRI, ONP, AIB_INK_BORDER.includes(key) ? '--ink' : 'none'];

  const toggleOn = key === 'soft-form' ? 'track --canvas (recessed), knob --primary'
    : key === 'retro-futurist' ? 'track --canvas, status lamp --accent (glow)'
      : `track ${PRI}, knob ${ONP}`;
  const toggleOff = key === 'soft-form' ? 'track --canvas (recessed), knob --muted' : 'track --line, knob --muted';

  const hl = hlKind === 'band'
    ? ['--accent (band behind the word)', '--on-accent', 'none']
    : hlKind === 'custom'
      ? (def.highlightNote ? [def.highlightNote, 'per the treatment', 'none'] : ['custom treatment, see Materials', '--accent-ink (text base)', 'none'])
      : ['none', '--accent-ink', 'none'];

  const inkBorder = AIB_INK_BORDER.includes(key);
  const cardBg = aibCardFill(def, t, extras);
  // The edge the aesthetic draws on the main action when it is not an --ink border (def.ctaEdge: a string, or function(t, extras)).
  const ctaEdge = typeof def.ctaEdge === 'function' ? def.ctaEdge(t, extras || {}) : def.ctaEdge;

  return [
    ['Page', '--canvas', '--ink', 'none'],
    ['Card / panel', cardBg, '--ink', inkBorder ? '--ink' : '--line'],
    inkCta
      ? ['Main button (one per view, ink-filled)', '--ink', '--canvas', 'none']
      : ['Primary button (one per view)', PRI, ONP, inkBorder ? '--ink' : ctaEdge || 'none'],
    ['Secondary button', secOff ? 'transparent' : 'transparent (hover: --sec-tint)', '--ink', secOff ? '--ink' : '--secondary'],
    ['Ghost / tertiary link', 'none', '--ink (underlined)', 'none'],
    ['Input field, rest', '--canvas', '--ink (placeholder: --muted)', inkBorder ? '--ink' : '--line'],
    ['Input field, focus', '--canvas', '--ink', barred ? '2px --ink, no ring' : `${PRI} (plus a 3px ring of ${PRI} at 40% opacity)`],
    ['Segmented control, selected', ...segOn],
    ['Segmented control, unselected', 'transparent', '--muted', 'none'],
    ['Toggle, on', toggleOn, '--ink (label)', 'none'],
    ['Toggle, off', toggleOff, '--ink (label)', 'none'],
    secOff ? ['Tag / chip', '--canvas', '--ink', '--line'] : ['Tag / chip', '--secondary', '--on-secondary', 'none'],
    accOff ? ['Badge ("New", notification)', '--canvas', '--ink', '--ink'] : ['Badge ("New", notification)', key === 'aurora-noir' && !t.accentLow
      ? t.mix(t.accent, t.canvas, 0.15) + ' (accent at 15%)' : '--accent',
    key === 'aurora-noir' && !t.accentLow ? '--accent' : '--on-accent', 'none'],
    ['Headline highlight word (one per view)', ...hl],
    ['Divider / hairline', '--line', 'n/a', 'n/a'],
    ['List row, selected', '--sec-tint', '--ink', `left edge 2px ${PRI}`],
    ['List row, resting', 'transparent', '--ink (meta: --muted)', 'bottom 1px --line'],
    ['Progress / data bar', 'track --line', 'n/a', `fill ${PRI}${secOff ? '' : ' (second series: --secondary)'}`],
    ['Focus ring (any control)', 'n/a', 'n/a', focusLow ? `3px ${PRI} with an outer 1px --ink ring (primary alone is under 3:1 on this canvas)` : PRI],
  ];
}

// The board as it is really drawn, for the Typography section: an off-screen board for
// (state, def) at 900px, read back with getComputedStyle. null without a DOM (a node
// harness, a worker): the brief then states only what it knows and omits the numbers.
function aibProbeBoard(state, def) {
  if (typeof document === 'undefined' || !document.body || typeof getComputedStyle !== 'function' || typeof boardHtml !== 'function') return null;
  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText = 'position:fixed;left:-20000px;top:0;width:900px;visibility:hidden;pointer-events:none;';
  host.style.setProperty('--font-heading', state.headingFont.css);
  host.style.setProperty('--font-body', state.bodyFont.css);
  let out = null;
  try {
    host.innerHTML = boardHtml(state, def);
    document.body.appendChild(host);
    const h = host.querySelector('.ab-hero .ab-headline');
    const b = host.querySelector('.ab-card-body') || host.querySelector('.ab-subcopy');
    if (h && b) {
      const hs = getComputedStyle(h), bs = getComputedStyle(b);
      const fs = parseFloat(hs.fontSize) || 0;
      const em = v => (v === 'normal' ? 0 : (parseFloat(v) || 0) / (fs || 1));
      const radius = sel => {
        const el = host.querySelector(sel);
        if (!el) return null;
        const cs = getComputedStyle(el);
        const r = [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius].map(v => String(v).split(' ')[0]);
        return r.every(v => v === r[0]) ? r[0] : r.join(' ');
      };
      out = {
        h: { size: Math.round(fs), weight: hs.fontWeight, tt: hs.textTransform, ls: Math.round(em(hs.letterSpacing) * 1000) / 1000, style: hs.fontStyle },
        b: { size: Math.round(parseFloat(bs.fontSize) || 0), weight: bs.fontWeight, tt: bs.textTransform },
        radius: { card: radius('.ab-card'), button: radius('.ab-cta'), field: radius('.ab-input'), swatch: radius('.ab-chip') },
        cta: (() => { const c = host.querySelector('.ab-cta'); return c ? { weight: getComputedStyle(c).fontWeight } : null; })(),
      };
    }
  } catch (err) {
    out = null;
  }
  host.remove();
  return out;
}


// Inline data: URIs (an aesthetic's hand-drawn SVG fills, tens of KB each) are replaced in the
// material dump by a short description: a builder works from the recipe, not the bytes.
function aibCompactUri(text) {
  return String(text).replace(/url\(\s*(["']?)data:(image\/[a-z+.-]+)[\s\S]*?\1\s*\)/gi,
    (m, q, type) => `url(<decorative ${type === 'image/svg+xml' ? 'SVG' : type.replace('image/', '').toUpperCase()} texture, omitted: leave it out and use the flat fill>)`);
}

function aibBrandName(state) {
  return String(aibContent(state).brandName).trim();
}

// Placement rules per `use` (see PatternPins.USES). `png` is the export to attach for a
// raster family: PNG 2x (2560x1440) for large areas, 1x (1280x720) for small ones.
const AIB_USE_RULES = {
  hero: {
    cls: 'pattern-hero', png: '2x',
    rule: 'Patterns only as quiet section backgrounds; never a full-bleed hero (the hero shows the product: a real screen built from the UI kit). Use it as a low-contrast background behind one section (`background-size: cover`; a tile uses `background-repeat: repeat`), with copy on a solid `--canvas` area so text stays at 4.5:1 or better. Never set text directly on the pattern.',
  },
  band: {
    cls: 'pattern-band', png: '2x',
    rule: 'Full-width background band behind one section (a quote, a stats row, a call to action), 160 to 320px tall. Copy sits on a solid `--canvas` plate (4.5:1 or better), never directly on the pattern. At most two bands per page, and never two bands of the same pattern next to each other.',
  },
  card: {
    cls: 'pattern-card', png: '1x',
    rule: 'Low-contrast texture on a card or media tile. At most one textured card per view. Labels and body text sit on a solid `--canvas` plate inside the card (4.5:1 or better); the pattern reads as texture, not as content.',
  },
  divider: {
    cls: 'pattern-divider', png: '2x',
    rule: 'Decorative band between two sections, 24 to 64px tall and full width (`background-repeat: repeat-x` for a tile). No text, icons or controls on it. Mark it `aria-hidden="true"`.',
  },
  accent: {
    cls: 'pattern-accent', png: '1x',
    rule: 'Small decorative detail: a badge or avatar fill, an empty-state or icon-sized tile, at most 200px across and at most one per view. Never behind text. Mark it `aria-hidden="true"`.',
  },
};


/* ---------------- target (Web | SwiftUI | Both) ---------------- */

const AIB_TARGETS = [
  { value: 'web', label: 'Web' },
  { value: 'swiftui', label: 'SwiftUI' },
  { value: 'both', label: 'Both' },
];
const AIB_TARGET_KEY = 'brandingDesigner.briefTarget';

function aibSlug(state) {
  const n = String((state && state.content && state.content.brandName) || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return n || 'default';
}

// The chosen target for this brand: stored per brand name in localStorage (the saved brand file
// itself is not touched), falling back to the last one chosen, then Web.
function aibGetTarget(state) {
  try {
    const v = localStorage.getItem(AIB_TARGET_KEY + '.' + aibSlug(state)) || localStorage.getItem(AIB_TARGET_KEY + '.default');
    if (AIB_TARGETS.some(x => x.value === v)) return v;
  } catch (err) { /* storage blocked: Web */ }
  return 'web';
}

function aibSetTarget(state, value) {
  if (!AIB_TARGETS.some(x => x.value === value)) return;
  try {
    localStorage.setItem(AIB_TARGET_KEY + '.' + aibSlug(state), value);
    localStorage.setItem(AIB_TARGET_KEY + '.default', value);
  } catch (err) { /* storage blocked: the choice lasts until reload */ }
}

/* ---------------- surface (App | Website | Both) ---------------- */

// What is being built. An app gets the UI kit and no board art; a website gets the kit plus the
// hero art and patterns. Stored per brand like the target, default App.
const AIB_SURFACES = [
  { value: 'app', label: 'App' },
  { value: 'web', label: 'Website' },
  { value: 'both', label: 'Both' },
];
const AIB_SURFACE_KEY = 'brandingDesigner.briefSurface';

function aibGetSurface(state) {
  try {
    const v = localStorage.getItem(AIB_SURFACE_KEY + '.' + aibSlug(state)) || localStorage.getItem(AIB_SURFACE_KEY + '.default');
    if (AIB_SURFACES.some(x => x.value === v)) return v;
  } catch (err) { /* storage blocked: App */ }
  return 'app';
}

function aibSetSurface(state, value) {
  if (!AIB_SURFACES.some(x => x.value === value)) return;
  try {
    localStorage.setItem(AIB_SURFACE_KEY + '.' + aibSlug(state), value);
    localStorage.setItem(AIB_SURFACE_KEY + '.default', value);
  } catch (err) { /* storage blocked: the choice lasts until reload */ }
}

/* ---------------- context: everything the sections read ---------------- */

// A material class derived from the aesthetic's own recipes, for any aesthetic that has no
// entry in AESTHETIC_BUILD (aesthetic-meta.js).
function aibDeriveBuild(def) {
  const css = (def.materials || []).map(m => m.css).join(' ');
  let cls = 'flat';
  if (/backdrop-filter|blur\(/.test(css)) cls = 'glass';
  else if (/box-shadow:[^;]*\b\d+px\s+\d+px\s+0(?:px)?\s/.test(css)) cls = 'hard';
  else if (/inset/.test(css)) cls = 'soft';
  else if (/glow|drop-shadow/.test(css)) cls = 'glow';
  return Object.assign({}, BUILD_CLASSES[cls], { cls });
}

function aibModeTokens(view, mode) {
  const st = Object.assign({}, view.state, { bgMode: mode });
  const t = boardTokens(st, view.def);
  return { mode, t, extras: abTokens(view.def, t, st) };
}

const aibPri = t => (t.printed ? t.printPrimary : t.primary);

// A colour the aesthetic draws whatever the brand palette is (AESTHETIC_BUILD accentOverride / fixedInks):
// `spec.light` / `spec.dark` (either falls back to the other) is an extras key like '--ab-jm-dot' read from the
// board's own tokens for this mode, a hex, or a function(m). Returns a #rrggbb hex or '' when it cannot resolve.
function aibInkValue(spec, m, field) {
  let v = field ? spec[field] : (m.mode === 'dark' ? (spec.dark != null ? spec.dark : spec.light) : (spec.light != null ? spec.light : spec.dark));
  if (typeof v === 'function') v = v(m);
  else if (typeof v === 'string' && v.slice(0, 2) === '--') v = m.extras[v];
  v = String(v == null ? '' : v).trim();
  return AIB_HEX.test(v) ? v : '';
}

// accentOverride / secondaryOverride: the look prints its own accent or secondary, so that role and its derived
// colours (label on it, the accent as text, the tint) are recomputed from the value the board draws.
// `on` (optional) names the label colour the board uses on it.
function aibApplyOverrides(build, m) {
  if (!m) return;
  const t = m.t;
  const a = build.accentOverride && aibInkValue(build.accentOverride, m);
  if (a) {
    t.accent = a;
    t.onAccent = aibInkValue(build.accentOverride, m, 'on') || pickReadableText(a);
    t.accentInk = abAccentInk(a, t.canvas, t.ink);
    t.accentLow = contrastRatio(a, t.canvas) < 3;
    t.accentText = slVisible(t.canvas, [a, t.primary], 3, t.ink);
  }
  const sc = build.secondaryOverride && aibInkValue(build.secondaryOverride, m);
  if (sc) {
    t.secondary = sc;
    t.onSecondary = aibInkValue(build.secondaryOverride, m, 'on') || pickReadableText(sc);
    t.secTint = slMix(sc, t.canvas, 0.16);
  }
}

// Errors and destructive actions never introduce a colour: they take the palette's reddish role
// (js/ui-kit.js uiKitDanger: hue <= 20 or >= 340 deg, saturation >= 0.35, 3:1 on the canvas), or
// the ink when the palette has none. aibError is that colour shaded to 4.5:1 for messages.
function aibDanger(t) {
  if (typeof uiKitDanger !== 'function') return { role: null, color: t.ink, text: t.ink, on: t.canvas };
  return uiKitDanger({ primary: aibPri(t), secondary: t.secondary, accent: t.accent, ink: t.ink, canvas: t.canvas });
}
function aibError(t) {
  return aibDanger(t).text;
}
// The --error token's job, from the light palette (dark follows the same role).
function aibErrorJob(t) {
  const d = aibDanger(t);
  return d.role
    ? `Errors and destructive actions only: field edge, icon, message, the destructive button. The palette's ${d.role} (the brand's reddish colour), shaded to 4.5:1 on the canvas; never a stock red.${d.fill ? '' : ' It is also the primary, so destructive buttons are outlines in it, never filled.'}`
    : 'Errors only: field edge, icon and message. The palette has no reddish colour, so this is the ink: an error shows as a 2pt ink edge, the error icon and the message; destructive buttons are outline buttons with an ink label and always open a confirmation sheet. Never add a stock red.';
}

function aibParseColor(v) {
  const s = String(v == null ? '' : v).trim();
  let m = /^#([0-9a-f]{6})$/i.exec(s);
  if (m) return { hex: parseInt(m[1], 16), a: 1 };
  m = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)$/i.exec(s);
  if (m) return { hex: (+m[1] << 16) | (+m[2] << 8) | +m[3], a: m[4] == null ? 1 : +m[4] };
  return null;
}

// Elevation colours of the material class, per mode: tokens beyond the five roles.
function aibElevation(build, def, m) {
  const t = m.t, ex = m.extras;
  if (build.sw === 'hard') {
    // build.shadowToken names a fixedInks token (e.g. '--lip'): the hard shadow is a darker shade of the fill, not the ink.
    const lip = build.shadowToken && (build.fixedInks || []).find(i => i.token === build.shadowToken);
    return { '--shadow': (lip && aibInkValue(lip, m)) || (build.shadowInk || !t.isDark ? t.ink : '#000000') };
  }
  if (build.sw === 'soft') {
    return {
      '--shadow-lo': ex['--ab-lo'] || (t.isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)'),
      '--shadow-hi': ex['--ab-hi'] || (t.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.7)'),
    };
  }
  if (build.sw === 'glass') return { '--rim': ex['--ab-rim'] || (t.isDark ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.7)') };
  return {};
}

// The card fill token when the aesthetic fills cards with something other than the canvas.
function aibCardColor(def, m) {
  const raw = def.cardFill;
  if (!raw) return null;
  const v = m.extras[String(raw)] != null ? String(m.extras[String(raw)]).trim() : String(raw);
  return AIB_HEX.test(v) && v.toLowerCase() !== m.t.canvas.toLowerCase() ? v : null;
}

// Text on the card ground. Where the card is a fixed paper (or a black sign) that --ink does not read on in some
// mode, the aesthetic names the ink the kit really draws on it (def.cardInk = { ink, muted }, each { light, dark }:
// an extras key, a hex or function(m)); without that, the most readable of ink, canvas, black and white.
// Returns { ink, muted } hexes for mode m, or null when --ink already reads on the card in every mode.
function aibCardInkValue(def, m) {
  const card = aibCardColor(def, m);
  if (!card) return null;
  const t = m.t;
  const spec = def.cardInk || {};
  const pick = field => {
    const sp = spec[field];
    if (!sp) return '';
    const one = { light: sp[m.mode], dark: sp[m.mode] };
    return aibInkValue(one, m);
  };
  let ink = pick('ink'), muted = pick('muted');
  if (!ink && contrastRatio(t.ink, card) >= 4.5) ink = t.ink;
  if (!muted && ink === t.ink && contrastRatio(t.muted, card) >= 4.5) muted = t.muted;
  if (!ink) {
    ink = [t.ink, t.canvas, '#000000', '#ffffff'].reduce((a, b) => (contrastRatio(b, card) > contrastRatio(a, card) ? b : a));
  }
  if (!muted) {
    let k = 0.3;
    muted = t.mix(ink, card, k);
    while (k < 1 && contrastRatio(muted, card) < 4.5) { k += 0.05; muted = t.mix(ink, card, Math.min(1, k)); }
  }
  return { ink, muted };
}
// True when --ink does not read (4.5:1) on the card ground in some mode, so the brief defines --card-ink / --card-muted.
function aibNeedsCardInk(def, modes) {
  return modes.some(m => { const c = aibCardColor(def, m); return c && contrastRatio(m.t.ink, c) < 4.5; });
}

const aibNum = v => {
  const s = String(v == null ? '' : v);
  if (/%/.test(s)) return 999;
  const n = parseFloat(s);
  return isFinite(n) ? Math.round(n) : null;
};

// Fallback corner radii (px) read from the aesthetic's material recipes (def.materials css text,
// px and % only) for when the board probe is unavailable (no DOM). 0 where the recipes name none.
function aibRecipeRadii(def) {
  const mats = (def && def.materials) || [];
  const radiusOf = m => {
    const r = /border-radius:\s*(?:([\d.]+)px|([\d.]+)%)/i.exec(m.css || '');
    return r ? (r[2] != null ? 999 : Math.round(+r[1])) : null;
  };
  const pick = re => {
    for (const m of mats) { if (re.test(m.name || '')) { const v = radiusOf(m); if (v != null) return v; } }
    return null;
  };
  const anyR = (() => { for (const m of mats) { const v = radiusOf(m); if (v != null) return v; } return null; })();
  const control = pick(/button|cta|key|chip|pill/i);
  const card = pick(/card|panel|tile|plate|well|slab|window/i);
  const field = pick(/field|input|toggle|track/i);
  const c = control != null ? control : (anyR != null ? anyR : 0);
  return { control: c, field: field != null ? field : c, card: card != null ? card : (anyR != null ? anyR : c) };
}

/* ---------------- the UI kit as drawn (measured) ---------------- */

// The App brief's UI kit rows come from the Built view's "UI kit" tab as the current style draws it:
// the kit is rendered off-screen and read back with getComputedStyle, so the brief states exactly what
// the owner sees. aibKitSnap (DOM) reads it into plain data; aibKitModel (pure) turns that data into
// tokens and words. Without a DOM (tests, noProbe) the static rows of aibKitRowData stand in.

// Per UI_KIT id: [part, selector inside one state's box, read ::before / ::after]. Part 0 is the component.
const AIB_KIT_PARTS = {
  'btn-primary': [['button', 'button', 1], ['label', '.ab-cta-label', 1], ['arrow', '.ab-cta-arrow', 1]],
  'btn-secondary': [['button', 'button', 1]],
  'btn-text': [['button', 'button', 1]],
  'btn-destructive': [['button', 'button', 1]],
  'btn-icon': [['button', 'button', 1], ['icon', 'svg', 0]],
  field: [['input', '.ab-input', 1], ['label', '.ab-fieldlabel', 1], ['message', '.sb-k-help', 0]],
  search: [['box', '.sb-search', 1], ['input', '.ab-input', 0], ['icon', 'svg', 0]],
  select: [['box', '.sb-k-select', 1], ['label', '.ab-fieldlabel', 0], ['menu', '.sb-k-menu', 1], ['chosen option', '.sb-k-menu [aria-selected="true"]', 1]],
  checkbox: [['box', '.sb-k-box', 1], ['label', '.sb-k-check > span', 0]],
  radio: [['box', '.sb-k-box', 1], ['label', '.sb-k-check > span', 0]],
  toggle: [['switch', '.ab-switch', 1], ['label', '.ab-toggle > span', 0]],
  segmented: [['control', '.ab-seg', 1], ['selected', '.ab-seg-btn[aria-pressed="true"]', 1], ['unselected', '.ab-seg-btn[aria-pressed="false"]', 1]],
  slider: [['slider', '.sb-k-range', 0], ['label', '.sb-k-slider-h', 0]],
  card: [['card', '.ab-card', 1], ['title', '.ab-card-title', 1], ['body', '.ab-card-body', 0]],
  list: [['list', '.sb-k-list', 1], ['row', '.sb-k-row', 1], ['title', '.sb-k-title', 1], ['detail', '.sb-k-sub', 1], ['trailing value', '.sb-k-trail', 1], ['row avatar', '.sb-k-av', 0]],
  callout: [['callout', '.sb-k-callout', 1], ['title', '.sb-k-callout b', 0], ['icon', '.sb-k-callout > svg', 0]],
  sheet: [['sheet', '.sb-k-sheet', 1], ['grabber', '.sb-k-grab', 0], ['title', '.sb-k-sheet-t', 0]],
  divider: [['section label', '.sb-k-section .ab-label', 1], ['rule', '.ab-rule', 1]],
  topbar: [['bar', '.sb-k-topbar', 1], ['title', '.sb-k-tb-title', 1]],
  tabbar: [['bar', '.sb-tabs', 1], ['selected tab', '.sb-tab[aria-current]', 1], ['unselected tab', '.sb-tab:not([aria-current])', 0], ['selected label', '.sb-tab[aria-current] span', 1]],
  tabs: [['tabs', '.sb-k-tabs', 1], ['selected', '[aria-selected="true"]', 1], ['unselected', '[aria-selected="false"]', 0]],
  badge: [['tag', '.sb-k-badge, .ab-fit', 1], ['count', '.sb-k-count', 1], ['dot', '.sb-badge', 0]],
  progress: [['track', '.sb-k-bar', 1], ['fill', '.sb-k-bar > i', 0]],
  toast: [['toast', '.sb-k-toast', 1], ['action', '.sb-k-toast button', 0]],
  empty: [['icon tile', '.sb-k-emptyico', 1], ['title', '.sb-k-empty-t', 0], ['message', '.sb-k-empty-b', 0], ['button', 'button', 0]],
  avatar: [['avatar', '.sb-k-av', 1]],
};

// One element (or one of its ::before / ::after boxes) as plain numbers and strings. null: no such box.
function aibReadBox(el, pseudo) {
  const c = getComputedStyle(el, pseudo || null);
  if (pseudo && (/^(none|normal)$/.test(c.content) || c.display === 'none' || +c.opacity === 0 || /^matrix\(0, 0, 0, 0,/.test(c.transform))) return null;
  const px = v => Math.round((parseFloat(v) || 0) * 10) / 10;
  const rad = v => (/%/.test(String(v)) ? (parseFloat(v) >= 50 ? 999 : px(v)) : px(String(v).split(' ')[0]));
  const o = {
    bg: c.backgroundColor, img: c.backgroundImage, color: c.color,
    ff: c.fontFamily, fs: px(c.fontSize), fw: String(c.fontWeight), fst: c.fontStyle, tt: c.textTransform,
    ls: c.letterSpacing === 'normal' ? 0 : px(c.letterSpacing), deco: c.textDecorationLine || 'none',
    r: [c.borderTopLeftRadius, c.borderTopRightRadius, c.borderBottomRightRadius, c.borderBottomLeftRadius].map(rad),
    b: ['Top', 'Right', 'Bottom', 'Left'].map(s => ({ w: px(c[`border${s}Width`]), s: c[`border${s}Style`], c: c[`border${s}Color`] })),
    sh: c.boxShadow, op: Math.round((+c.opacity || 0) * 100) / 100, tf: c.transform, bd: c.webkitBackdropFilter || c.backdropFilter || 'none',
    ol: c.outlineStyle !== 'none' && px(c.outlineWidth) > 0 ? `${px(c.outlineWidth)} ${c.outlineStyle} ${c.outlineColor} offset ${px(c.outlineOffset)}` : '',
    ws: c.whiteSpace,
    pad: [c.paddingTop, c.paddingRight, c.paddingBottom, c.paddingLeft].map(px), h: px(c.height), w: px(c.width),
    filter: c.filter || 'none', clip: c.clipPath || c.webkitClipPath || 'none',
    bgSize: c.backgroundSize, bgPos: c.backgroundPosition, lh: c.lineHeight, bs: c.boxSizing,
    dc: c.textDecorationColor, dt: c.textDecorationThickness, uo: c.textUnderlineOffset,
    cls: pseudo ? '' : String((el.getAttribute && el.getAttribute('class')) || ''),
  };
  if (pseudo) {
    o.content = c.content;
    o.pos = c.position;
    o.text = aibPseudoText(c.content);
    o.z = c.zIndex;
    o.mg = [px(c.marginTop), px(c.marginLeft)];
    o.at = [c.top, c.right, c.bottom, c.left].map(v => (v === 'auto' ? null : px(v)));
    // an absolutely placed layer sized by its insets reports width / height 'auto': size it from the host box
    if ((!o.w || !o.h) && /absolute|fixed/.test(c.position)) {
      const hc = getComputedStyle(el), hw = px(hc.width), hh = px(hc.height);
      if (!o.w && o.at[1] != null && o.at[3] != null) o.w = Math.max(0, hw - o.at[1] - o.at[3]);
      if (!o.h && o.at[0] != null && o.at[2] != null) o.h = Math.max(0, hh - o.at[0] - o.at[2]);
    }
    const box = o.w > 0 && o.h > 0 && (aibAlpha(o.bg) > 0.05 || o.img !== 'none' || o.b.some(x => x.w > 0 && x.s !== 'none') || o.sh !== 'none' || o.filter !== 'none');
    if (!box && !o.text.trim()) return null;
  }
  return o;
}

// The alpha of a computed colour (rgb(), rgba(), color(srgb ... / a)); 0 for transparent.
function aibAlpha(c) {
  const p = aibRgba(c);
  return p ? p[3] : 0;
}
function aibRgba(c) {
  const s = String(c == null ? '' : c).split('|')[0].trim();
  let m = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+%?))?\s*\)$/i.exec(s);
  if (m) return [+m[1], +m[2], +m[3], m[4] == null ? 1 : /%/.test(m[4]) ? parseFloat(m[4]) / 100 : +m[4]];
  m = /^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)$/i.exec(s);
  if (m) return [m[1] * 255, m[2] * 255, m[3] * 255, m[4] == null ? 1 : /%/.test(m[4]) ? parseFloat(m[4]) / 100 : +m[4]];
  const short3 = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(s);
  if (short3) return [1, 2, 3].map(i => parseInt(short3[i] + short3[i], 16)).concat(1);
  m = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(s);
  if (m) return [0, 2, 4].map(i => parseInt(m[1].slice(i, i + 2), 16)).concat(m[2] ? parseInt(m[2], 16) / 255 : 1);
  if (s === 'transparent') return [0, 0, 0, 0];
  return null;
}

// The slider's track and thumb live in ::-webkit-slider-* boxes getComputedStyle cannot read: their rules are
// read from the style sheets (the last matching rule wins per property) and var() resolved on the input.
function aibSliderRules(el) {
  const out = { track: {}, thumb: {} };
  const cs = getComputedStyle(el);
  const resolve = v => String(v).replace(/var\((--[\w-]+)(?:,\s*([^()]*(?:\([^()]*\))?[^()]*))?\)/g, (m, name, fb) => (cs.getPropertyValue(name).trim() || (fb || '').trim()));
  const walk = rules => {
    for (const r of Array.from(rules || [])) {
      if (r.cssRules && !r.selectorText) { try { walk(r.cssRules); } catch (err) { /* cross-origin */ } continue; }
      const sel = r.selectorText || '';
      [['track', '::-webkit-slider-runnable-track'], ['thumb', '::-webkit-slider-thumb']].forEach(([k, pe]) => {
        if (sel.indexOf(pe) < 0) return;
        const hit = sel.split(/,(?![^()]*\))/).some(part => {
          if (part.indexOf(pe) < 0) return false;
          try { return el.matches(part.replace(pe, '').trim() || '*'); } catch (err) { return false; }
        });
        if (!hit) return;
        for (let i = 0; i < r.style.length; i++) { const p = r.style[i]; out[k][p] = resolve(r.style.getPropertyValue(p)); }
      });
    }
  };
  for (const sh of Array.from(document.styleSheets || [])) { try { walk(sh.cssRules); } catch (err) { /* cross-origin sheet */ } }
  return out;
}

// Splits a CSS value list at top-level commas.
function aibSplitTop(s) {
  const out = [];
  let d = 0, st = 0;
  const t = String(s || '');
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (c === '(') d++;
    else if (c === ')') d--;
    else if (c === ',' && !d) { out.push(t.slice(st, i).trim()); st = i + 1; }
  }
  out.push(t.slice(st).trim());
  return out.filter(Boolean);
}

const AIB_COLOR_IN = /(?:rgba?|color)\([^()]*\)(?:\|(?:rgba?|color)\([^()]*\))?|#[0-9a-f]{3,8}\b|\btransparent\b/i;

// One background-image layer as data: { kind: 'image' | 'stripes' | 'solid' | 'diagonal' | 'band' | 'gradient' | 'other', ... }.
function aibGradLayer(layer, size, pos, name) {
  const m = /^(repeating-)?(linear|radial|conic)-gradient\(([\s\S]*)\)$/.exec(String(layer).trim());
  if (!m) {
    const svg = /url\(\s*["']?data:image\/svg\+xml[^,]*,([\s\S]*?)["']?\s*\)$/.exec(String(layer));
    if (svg) {
      let t = svg[1]; try { t = decodeURIComponent(t); } catch (err) { /* already plain */ }
      if (/feTurbulence/i.test(t)) return { kind: 'image' };
      const st = (/stroke=["']?(#[0-9a-f]{3,8}|rgba?\([^)]*\)|currentColor)/i.exec(t) || [])[1];
      const loop = /<(ellipse|circle)\b/i.test(t) || /[Aa]\s*[\d.]|[Cc]\s*[\d.-]/.test(t);
      if (st || loop) return { kind: 'svgmark', loop, col: st && !/currentColor/i.test(st) ? name(st) : 'the text colour' };
    }
    return { kind: /url\(/.test(layer) ? 'image' : 'other' };
  }
  const args = aibSplitTop(m[3]);
  let angle = 180;
  if (args.length && !AIB_COLOR_IN.test(args[0])) {
    const a = args.shift();
    const d = /(-?[\d.]+)deg/.exec(a);
    const to = { 'to top': 0, 'to right': 90, 'to bottom': 180, 'to left': 270 };
    angle = d ? +d[1] : to[a.trim()] != null ? to[a.trim()] : 180;
  }
  const stops = args.map(a => {
    const c = (AIB_COLOR_IN.exec(a) || [])[0];
    if (!c) return null;
    const n = /transparent/i.test(c) ? 'none' : name(c);
    return { c: n === 'none' ? 'transparent' : n, at: a.replace(c, '').trim() };
  }).filter(Boolean);
  const vis = stops.filter(x => x.c !== 'transparent');
  const cols = vis.map(x => x.c).filter((c, i, a) => a.indexOf(c) === i);
  if (m[1]) {
    const last = stops[stops.length - 1];
    const a = ((angle % 180) + 180) % 180;
    return { kind: 'stripes', col: cols[0] || 'transparent', period: Math.max(1, Math.round(parseFloat(last && last.at) || 1)),
      orient: a === 0 ? 'horizontal lines' : a === 90 ? 'vertical lines' : `diagonal lines at ${Math.round(a)}°` };
  }
  if (m[2] !== 'linear') return { kind: 'gradient', radial: true, cols, conic: m[2] === 'conic' };
  if (cols.length === 1 && vis.length === stops.length) return { kind: 'solid', col: cols[0], size, pos };
  if (cols.length === 1 && Math.abs(angle % 90) > 1) return { kind: 'diagonal', col: cols[0] };
  const pcts = stops.map(x => parseFloat(x.at));
  const hard = pcts.some((v, i) => i && !isNaN(v) && v === pcts[i - 1] && stops[i].c !== stops[i - 1].c);
  if (cols.length === 1 && !hard && stops.length >= 2) {
    const a2 = ((angle % 360) + 360) % 360;
    const fromStart = stops[0].c !== 'transparent';
    const end = parseFloat((fromStart ? stops.find(x => x.c === 'transparent') : stops.find(x => x.c !== 'transparent')) || {}.at) || (fromStart ? 100 : 0);
    return { kind: 'fade', col: cols[0], words: `a smooth fade of ${cols[0]} ${a2 === 180 ? (fromStart ? 'from the top edge' : 'up from the bottom edge') : a2 === 0 ? (fromStart ? 'from the bottom edge' : 'down from the top') : `at ${Math.round(a2)}°`} to transparent${end && end < 100 ? ` by ${Math.round(end)}% of the height` : ''} (a soft gloss, no hard line)` };
  }
  if (cols.length === 1) return { kind: 'band', col: cols[0], stops, angle, size, pos };
  const a = ((angle % 360) + 360) % 360;
  return { kind: 'gradient', cols, dir: a === 180 ? 'top to bottom' : a === 90 ? 'left to right' : a === 0 ? 'bottom to top' : a === 270 ? 'right to left' : `at ${Math.round(a)}°` };
}

// A band layer (one colour with hard stops, or one sized solid layer) as words, measured in em of `fs` when given.
function aibBandWords(p, o, what) {
  const of = what || 'its';
  const fs = (o && o.fs) || 0;
  const unit = v => (fs ? `${Math.round((v / fs) * 100) / 100}em` : `${Math.round(v)}pt`);
  const sz = String(p.size || 'auto').split(/\s+/);
  const hpx = /px$/.test(sz[1] || '') ? parseFloat(sz[1]) : null;
  const ypos = String(p.pos || '').split(/\s+/)[1] || '';
  if (p.kind === 'band' && p.stops) {
    const pc = p.stops.map(x => parseFloat(x.at)).filter(v => !isNaN(v));
    const first = p.stops.findIndex(x => x.c !== 'transparent');
    const lo = first > 0 ? parseFloat(p.stops[first].at) || parseFloat(p.stops[first - 1].at) || 0 : 0;
    let hi = 100;
    const after = p.stops.slice(first).findIndex(x => x.c === 'transparent');
    if (after > 0) hi = parseFloat(p.stops[first + after].at) || 100;
    const vert = p.angle === 180 || p.angle === 0;
    if (pc.length && vert) return `a ${p.col} band covering ${lo ? `the lower ${Math.round(100 - lo)}%` : `the top ${Math.round(hi)}%`} of ${of === 'its' ? 'its' : of + "'s"} height${hpx ? ` (${unit(hpx)} tall box)` : ''}`;
    return `a ${p.col} band across part of ${of === 'its' ? 'it' : of}`;
  }
  if (hpx != null) {
    const yp = parseFloat(ypos);
    const where = /bottom/.test(ypos) || yp >= 99 ? ' along the very bottom' : yp >= 70 ? ` low across ${of === 'its' ? 'it' : of}, its top edge ${yp}% of the way down the line box (an underline band, not a full block)` : /top/.test(ypos) || yp === 0 ? ' along the top' : !isNaN(yp) ? ` across the middle (${yp}% down)` : '';
    return `a ${p.col} band ${unit(hpx)} tall, full width,${where}`.replace(/,$/, '');
  }
  return `a solid ${p.col} block behind ${of === 'its' ? 'it' : of}`;
}

// A background-image in plain words: textures, stripes, drawn marks, gradients. '' when none.
function aibImgWords(o, name, what) {
  const img = o && o.img;
  if (!img || img === 'none') return '';
  const layers = aibSplitTop(img).filter(l => l !== 'none');
  const sizes = aibSplitTop(o.bgSize || 'auto'), poss = aibSplitTop(o.bgPos || '0% 0%');
  const ps = layers.map((l, i) => aibGradLayer(l, sizes[i % sizes.length] || 'auto', poss[i % poss.length] || '0% 0%', name));
  const words = [];
  if (ps.some(p => p.kind === 'image' || p.kind === 'other')) words.push('a fine grain texture');
  ps.filter(p => p.kind === 'svgmark').forEach(p => words.push(p.loop ? `a hand-drawn ${p.col} loop (an SVG stroke) around it` : `a drawn ${p.col} SVG mark`));
  ps.filter(p => p.kind === 'stripes').forEach(p => words.push(`fine ${p.orient} of ${p.col} every ${p.period}pt`));
  const solids = ps.filter(p => p.kind === 'solid');
  if (solids.length) {
    const dims = solids.map(p => String(p.size).split(/\s+/).map(v => (/px$/.test(v) ? parseFloat(v) : /%$/.test(v) ? 999 : null)));
    const sized = dims.filter(d => d[1] != null);
    if (!sized.length) words.push(`filled ${solids[0].col}`);
    else if (solids.length >= 4) {
      const t = Math.round(Math.min(...sized.map(d => Math.min(d[0] == null ? d[1] : d[0], d[1])))), l = Math.round(Math.max(...sized.map(d => Math.max(d[0] == null ? d[1] : d[0], d[1]))));
      words.push(`${solids[0].col} corner ticks, ${l}pt long and ${t}pt thick`);
    } else if (solids.length === 1) words.push(aibBandWords(solids[0], o, what));
    else if (solids.length === 2 && sized.length === 2 && ((sized[0][0] == null || sized[0][0] > sized[0][1]) !== (sized[1][0] == null || sized[1][0] > sized[1][1]))) words.push(`a ${solids[0].col} plus sign`);
    else words.push(`${solids.length} small ${solids[0].col} marks`);
  }
  const diag = ps.filter(p => p.kind === 'diagonal');
  if (diag.length) words.push(diag.length >= 2 ? `an X drawn in ${diag[0].col} strokes` : `a diagonal ${diag[0].col} stroke`);
  ps.filter(p => p.kind === 'band').forEach(p => words.push(aibBandWords(p, o, what) + (p.stops ? ' (a hard edge, no fade)' : '')));
  ps.filter(p => p.kind === 'fade').forEach(p => words.push(p.words));
  ps.filter(p => p.kind === 'gradient').forEach(p => words.push(p.radial ? `a soft ${p.conic ? 'conic sweep' : 'radial glow'} of ${p.cols.join(' and ')}` : `a gradient from ${p.cols[0]} to ${p.cols[p.cols.length - 1]} (${p.dir})`));
  return words.join(' and ');
}

// Where a positioned ::before / ::after sits relative to its host box, in words.
function aibPlace(p, host, which) {
  if (!/absolute|fixed/.test(p.pos || '')) return which === '::before' ? 'before the text' : 'after the text';
  const at = p.at || [null, null, null, null], W = (host && host.w) || 0, H = (host && host.h) || 0;
  const mt = /^matrix\(([^)]+)\)$/.exec(String(p.tf || ''));
  const [tx, ty] = mt ? mt[1].split(',').slice(4).map(Number) : [0, 0];
  const mg = p.mg || [0, 0];
  const x = (at[3] != null ? at[3] + mg[1] : at[1] != null ? W - at[1] - p.w : (W - p.w) / 2) + (tx || 0);
  const y = (at[0] != null ? at[0] + mg[0] : at[2] != null ? H - at[2] - p.h : (H - p.h) / 2) + (ty || 0);
  if (W && p.w >= W * 0.8 && p.h >= H * 0.6) {
    const g = [-y, -x, y + p.h - H, x + p.w - W].map(Math.round);
    if (g.every(v => v === g[0])) return g[0] > 0 ? `${g[0]}pt larger than the box on every side` : g[0] < 0 ? `${-g[0]}pt inside its edges` : 'covering the whole box';
    return `reaching ${g.map((v, i) => (v > 0 ? `${v}pt past the ${['top', 'left', 'bottom', 'right'][i]}` : '')).filter(Boolean).join(', ') || 'inside the box'}`;
  }
  const r = n => Math.round(n);
  const v = y + p.h <= 0.5 ? `${r(-y - p.h)}pt above` : y >= H - 0.5 ? `${r(y - H)}pt below` : y < -0.5 ? 'straddling the top edge of' : y + p.h > H + 0.5 ? 'straddling the bottom edge of' : Math.abs(y + p.h / 2 - H / 2) < 2 ? 'vertically centred in' : y < H / 2 ? 'near the top of' : 'near the bottom of';
  const h = x + p.w <= 0.5 ? 'left of' : x >= W - 0.5 ? 'right of' : x < -0.5 ? 'across the left edge' : x + p.w > W + 0.5 ? 'across the right edge' : Math.abs(x + p.w / 2 - W / 2) < 2 ? 'centred' : x + p.w / 2 < W / 2 ? 'at the left' : 'at the right';
  if (/straddling the top/.test(v) && /left/.test(h)) return 'straddling the top-left corner';
  if (/straddling the top/.test(v) && /right/.test(h)) return 'straddling the top-right corner';
  if (/straddling the bottom/.test(v) && /left/.test(h)) return 'straddling the bottom-left corner';
  if (/straddling the bottom/.test(v) && /right/.test(h)) return 'straddling the bottom-right corner';
  return /(above|below)$/.test(v) ? `${v} it, ${h}` : `${v} the box, ${h}`;
}

// The text a ::before / ::after shows: quoted pieces joined, counter() as N, attr() as its value's role.
function aibPseudoText(content) {
  const s = String(content || '');
  if (/^(none|normal)$/.test(s)) return '';
  const parts = s.match(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|counters?\([^)]*\)|attr\([^)]*\)/g) || [];
  return parts.map(x => (/^counter/.test(x) ? 'N' : /^attr/.test(x) ? '(label)' : x.slice(1, -1).replace(/\\(.)/g, '$1'))).join('');
}

const AIB_ARROW_GLYPH = /^\s*[→↗↘➔➜⟶←↑↓⟵↖↙]\s*$/;
const AIB_GLYPH_NAME = { '→': 'a right arrow', '➔': 'a right arrow', '➜': 'a right arrow', '⟶': 'a long right arrow', '↗': 'an up-right diagonal arrow', '↘': 'a down-right diagonal arrow',
  '↖': 'an up-left diagonal arrow', '↙': 'a down-left diagonal arrow', '←': 'a left arrow', '⟵': 'a long left arrow', '↑': 'an up arrow', '↓': 'a down arrow' };

// A ::before / ::after box in a plain buildable sentence (what it is, where it sits, size, colour token).
// Text a style draws with ::before / ::after ("> " prompts, "ITEM 01" captions, tags), noted per owner for "How it shows up".
function aibNoteTextMark(ctx, txt) {
  ctx.textMarks = ctx.textMarks || {};
  const k = String(txt).trim();
  if (!k) return;
  (ctx.textMarks[k] = ctx.textMarks[k] || new Set()).add(ctx._markOwner || 'kit');
}
function aibKitPseudo(ctx, p, which, host, name) {
  if (!p) return '';
  const where = aibPlace(p, host || {}, which);
  const tf = aibKitTransform(p.tf).split(', ').filter(x => /^rotated/.test(x)).join('');
  const tilt = tf ? `, ${tf}` : '';
  const txt = aibPseudoText(p.content);
  const col = name(p.color);
  if (txt && AIB_ARROW_GLYPH.test(txt)) return `${AIB_GLYPH_NAME[txt.trim()] || 'an arrow'} in ${col}, ${where} (draw it as a 24pt SVG of that arrow, not a text glyph)`;
  if (txt && txt.trim()) aibNoteTextMark(ctx, txt);
  if (txt && /^\s*[✓✔]\s*$/.test(txt)) return `a check icon in ${col} (24pt SVG, not a text glyph)`;
  const fill = aibKitFill(p, name);
  const edge = aibKitEdge(p, name);
  const sh = aibKitShadow(p.sh, name, p.filter).text;
  if (txt && txt.trim()) {
    if (/^\s*[>›»]\s*$/.test(txt)) return `a "${txt.replace(/\s+$/, ' ')}" prompt in ${col}, ${where}`;
    if (/^[\s—–\-_|▮▯■□●○•·]+$/.test(txt)) return `the mark "${txt.trim()}" in ${col}${p.fs ? ` at ${Math.round(p.fs)}pt` : ''}, ${where}`;
    const nb = /\S\s{2,}\S/.test(txt) ? ' (keep the spacing exactly: each run of spaces is that many &nbsp;)' : '';
    return `a small tag "${txt.trim()}"${nb} in ${col}${p.fs ? ` ${Math.round(p.fs)}pt` : ''}${fill !== 'none' ? ` on a ${fill} strip` : ''}, ${where}, on one line (\`white-space: nowrap\`) and clear of the other parts${tilt}`;
  }
  const W = (host && host.w) || 0, H = (host && host.h) || 0;
  const big = W && p.w >= W * 0.8 && p.h >= H * 0.6;
  const dash = p.b.find(x => /dotted|dashed/.test(x.s) && x.w > 0);
  const torn = (p.clip && p.clip !== 'none') || /url\(/.test(p.filter || '');
  const shText = sh ? `, with ${sh}` : '';
  if (/plus sign/.test(fill) && p.r.some(v => v > 0)) return `a ${Math.round(p.w)}pt circled plus: a ${edge !== 'no edge' ? edge + ' ' : ''}circle holding ${fill}, ${where}${tilt}`;
  if (big) {
    if (dash && fill === 'none') return `a ${Math.round(dash.w)}pt ${dash.s} ${name(dash.c)} frame ${where}${tilt}`;
    if (/corner ticks/.test(fill)) return `${fill} framing it, ${where}${tilt}`;
    if (/^a hand-drawn .* loop/.test(fill)) return `${fill}, ${where}${tilt}`;
    return `a ${fill === 'none' ? 'clear' : fill} sheet ${where}${+p.z < 0 ? ', behind the content' : ''}${torn ? ', with a torn, uneven outline' : ''}${shText}${tilt}`;
  }
  if (dash) return `a ${dash.s} ${name(dash.c)} leader line, ${Math.round(dash.w)}pt, ${where}`;
  const round = p.r.some(v => v > 0) && p.r.every(v => v >= 999 || v >= Math.min(p.w, p.h) / 2 - 0.5);
  const sq = Math.abs(p.w - p.h) < 1;
  const shape = round ? (sq ? 'dot' : 'pill') : sq ? 'square' : p.w > p.h * 3 ? 'bar' : p.h > p.w * 3 ? 'upright bar' : 'block';
  const dims = sq ? `${Math.round(p.w)}pt` : `${Math.round(p.w)}x${Math.round(p.h)}pt`;
  const sides = p.b.map(x => x.w > 0 && x.s !== 'none');
  const open = sides.filter(Boolean).length === 3 ? ['∪ (open at the top)', '⊂ (open at the right)', '∩ (open at the bottom)', '⊃ (open at the left)'][sides.indexOf(false)] : '';
  if (open && fill === 'none') return `a ${Math.round(p.w)}x${Math.round(p.h)}pt bracket shaped ${open}, ${Math.round(p.b[sides.indexOf(true)].w)}pt ${name(p.b[sides.indexOf(true)].c)} strokes, ${where}${tilt}`;
  if (/plus sign/.test(fill) && p.r.some(v => v > 0)) return `a ${Math.round(p.w)}pt circled plus: a ${edge !== 'no edge' ? edge + ' ' : ''}circle holding ${fill}, ${where}${tilt}`;
  const partial = edge !== 'no edge' && fill === 'none' && !p.b.every(x => x.w > 0) ? ` drawn as ${edge} strokes` : edge !== 'no edge' ? ` with a ${edge} edge` : '';
  if (/ marks| ticks|lines of|an X drawn|diagonal/.test(fill) && !/^--[a-z0-9-]+( at \d+%)?$/.test(fill)) return `a ${dims} mark drawn as ${fill}${partial}, ${where}${shText}${tilt}`;
  const base = fill === 'none' ? '' : fill.split(' with ')[0], extra = fill.indexOf(' with ') > 0 ? ' with ' + fill.split(' with ').slice(1).join(' with ') : '';
  return `a ${dims} ${base} ${shape}${extra}${partial}, ${where}${shText}${tilt}`.replace(/\s+/g, ' ');
}

// How a rendered list groups its rows: one card with inset dividers, an open list with rules, or separate tiles.
function aibListInfo(list, scale) {
  if (!list) return null;
  const rows = Array.from(list.querySelectorAll(':scope > .sb-k-row'));
  if (!rows.length) return null;
  const k = scale || 1;
  const rr = rows.map(r => r.getBoundingClientRect());
  const r1 = rows[1] || rows[0];
  const lc = getComputedStyle(list);
  const tile = rows.some(r => { const c = getComputedStyle(r); return aibAlpha(c.backgroundColor) > 0.03 || (parseFloat(c.borderLeftWidth) > 0 && c.borderLeftStyle !== 'none') || c.boxShadow !== 'none'; });
  const last = getComputedStyle(rows[rows.length - 1]);
  return {
    open: list.classList.contains('is-open'), tile, n: rows.length,
    gap: rows.length > 1 ? Math.round((rr[1].top - rr[0].bottom) / k) : 0,
    rowH: Math.round(rr[0].height / k),
    dv: r1.style.getPropertyValue('--k-dv') || '', dvX: parseFloat(r1.style.getPropertyValue('--k-dv-x')) || 0,
    rowRule: (() => { const c = getComputedStyle(r1); const w = parseFloat(c.borderBottomWidth), t = parseFloat(c.borderTopWidth); return w > 0 && c.borderBottomStyle !== 'none' ? `${w}px ${c.borderBottomStyle} ${c.borderBottomColor}` : t > 0 && c.borderTopStyle !== 'none' ? `${t}px ${c.borderTopStyle} ${c.borderTopColor}` : ''; })(),
    closing: parseFloat(lc.borderBottomWidth) > 0 && lc.borderBottomStyle !== 'none' ? `${lc.borderBottomWidth} ${lc.borderBottomStyle} ${lc.borderBottomColor}`
      : parseFloat(last.borderBottomWidth) > 0 && last.borderBottomStyle !== 'none' ? `${last.borderBottomWidth} ${last.borderBottomStyle} ${last.borderBottomColor}` : '',
  };
}

// The Mobile app tab's Welcome and Home phones, part by part, with positions in pt from the screen's top-left,
// plus their sample copy (with icon names) and how each list groups its rows.
const AIB_SCREEN_PARTS = {
  welcome: ['.sb-onboard', [['status bar', '.sb-statusbar'], ['time', '.sb-statusbar > span'], ['signal', '.sb-sig'], ['wifi', '.sb-wifi'], ['battery', '.sb-bat'], ['top row', '.sb-ob-top'],
    ['brand', '.sb-ob-top .ab-brand'], ['logo chip', '.sb-ob-top .ab-mark'], ['logo initial', '.sb-ob-top .ab-mark > span'], ['logo image', '.sb-ob-top .ab-logo'], ['wordmark', '.sb-ob-top .ab-wordmark'],
    ['skip', '.sb-ob-top .sb-k-textbtn'], ['eyebrow', '.sb-ob-copy .ab-kicker'], ['headline', '.sb-ob-h'], ['highlight', '.sb-ob-h .ab-hl'], ['body', '.sb-ob-body'],
    ['feature list', '.sb-ob-list .sb-k-list'], ['feature row', '.sb-ob-list .sb-k-row'], ['second feature row', '.sb-ob-list .sb-k-row:nth-child(2)'], ['feature icon chip', '.sb-ob-list .sb-k-ico'], ['feature title', '.sb-ob-list .sb-k-title'],
    ['pager', '.sb-dots'], ['current dot', '.sb-dots i.is-on'], ['other dot', '.sb-dots i:not(.is-on)'], ['primary button', '.sb-ob-actions .ab-cta'], ['primary arrow', '.sb-ob-actions .ab-cta .ab-cta-arrow'],
    ['second button', '.sb-ob-actions .sb-k-btn2'], ['home indicator', '.sb-homebar']]],
  home: ['.sb-home', [['status bar', '.sb-statusbar'], ['time', '.sb-statusbar > span'], ['top band', '.sb-home-top'], ['eyebrow', '.sb-home-t .ab-kicker'], ['title', '.sb-home-h'], ['bell button', '.sb-home-top .sb-icon-btn'],
    ['bell dot', '.sb-home-top .sb-badge'], ['summary card', '.sb-home-card'], ['card segmented control', '.sb-home-card .ab-seg'],
    ['card selected segment', '.sb-home-card .ab-seg-btn[aria-pressed="true"]'], ['card other segment', '.sb-home-card .ab-seg-btn[aria-pressed="false"]'], ['card title', '.sb-home-card .ab-card-title'], ['card body', '.sb-home-card .ab-card-body'],
    ['card button', '.sb-home-card .ab-cta'], ['card arrow', '.sb-home-card .ab-cta .ab-cta-arrow'], ['section row', '.sb-home-list .sb-k-section'], ['section label', '.sb-home-list .sb-k-section .ab-label'], ['see all', '.sb-home-list .sb-k-see'],
    ['list', '.sb-home-list .sb-k-list'], ['row', '.sb-home-list .sb-k-row'], ['last row', '.sb-home-list .sb-k-row:last-child'], ['second row', '.sb-home-list .sb-k-row:nth-child(2)'], ['row title', '.sb-home-list .sb-k-title'], ['row detail', '.sb-home-list .sb-k-sub'], ['row value', '.sb-home-list .sb-k-trail'], ['row avatar', '.sb-home-list .sb-k-av'],
    ['tab bar', '.sb-tabs'], ['selected tab', '.sb-tab[aria-current]'], ['selected tab label', '.sb-tab[aria-current] span'], ['other tab', '.sb-tab:not([aria-current])'], ['other tab label', '.sb-tab:not([aria-current]) span'], ['home indicator', '.sb-homebar']]],
};
function aibScreenSnap(host) {
  const out = {};
  const txt = el => String((el && el.textContent) || '').replace(/\s+/g, ' ').trim();
  const glyph = el => { const g = el && el.querySelector('svg[data-i]'); return g ? g.getAttribute('data-i') : ''; };
  Object.keys(AIB_SCREEN_PARTS).forEach(id => {
    const [rootSel, parts] = AIB_SCREEN_PARTS[id];
    const root = host.querySelector(rootSel);
    if (!root) return;
    const rb = root.getBoundingClientRect();
    const k = root.offsetWidth ? rb.width / root.offsetWidth : 1;
    const P = {};
    parts.forEach(([pn, sel]) => {
      const el = root.querySelector(sel);
      if (!el) return;
      const r = el.getBoundingClientRect();
      P[pn] = { box: aibReadBox(el), before: aibReadBox(el, '::before'), after: aibReadBox(el, '::after'),
        rect: (() => { const ow = el.offsetWidth, oh = el.offsetHeight; if (!ow && !oh) return { x: Math.round((r.left - rb.left) / k), y: Math.round((r.top - rb.top) / k), w: Math.round(r.width / k), h: Math.round(r.height / k) };
          const cx = (r.left + r.width / 2 - rb.left) / k, cy = (r.top + r.height / 2 - rb.top) / k; return { x: Math.round(cx - ow / 2), y: Math.round(cy - oh / 2), w: Math.round(ow), h: Math.round(oh) }; })(),
        text: txt(el).slice(0, 140), n: root.querySelectorAll(sel).length, glyph: glyph(el) };
    });
    const list = root.querySelector(id === 'home' ? '.sb-home-list .sb-k-list' : '.sb-ob-list .sb-k-list');
    P.listInfo = aibListInfo(list, k);
    P.extra = aibScreenExtra(root, k, id);
    const all = sel => Array.from(root.querySelectorAll(sel));
    P.copy = id === 'home' ? {
      tabs: all('.sb-tab').map(t => { const l = t.querySelector('span'), g = t.querySelector('svg'); const lc = l ? getComputedStyle(l) : null; return [txt(t), glyph(t), lc ? lc.color : '', lc ? lc.backgroundColor : '', g ? getComputedStyle(g).color : '', t.hasAttribute('aria-current')]; }),
      avatars: all('.sb-home-list .sb-k-av').map(txt),
      segments: all('.sb-home-card .ab-seg-btn').map(txt),
      rows: all('.sb-home-list .sb-k-row').map(r => [txt(r.querySelector('.sb-k-title')), txt(r.querySelector('.sb-k-sub')), txt(r.querySelector('.sb-k-trail'))]),
    } : { features: all('.sb-ob-list .sb-k-row').map(r => [txt(r.querySelector('.sb-k-title')), glyph(r)]) };
    out[id] = P;
  });
  return out;
}

// Reads every kit cell, state by state, plus the phone chrome of the Screen layouts, from a rendered kit page.
function aibKitSnap(page) {
  const snap = { cells: {}, chrome: {} };
  Object.keys(AIB_KIT_PARTS).forEach(id => {
    const cell = page.querySelector(`.sb-k-cell[data-k="${id}"]`);
    if (!cell) return;
    const states = {};
    Array.from(cell.querySelectorAll('.sb-k-state')).forEach(st => {
      const name = (st.querySelector('.sb-k-slabel') || {}).textContent || 'rest';
      const box = st.querySelector('.sb-k-spec');
      if (!box) return;
      const parts = {};
      AIB_KIT_PARTS[id].forEach(([part, sel, pseudo]) => {
        const el = box.querySelector(sel);
        if (!el) return;
        parts[part] = { box: aibReadBox(el) };
        if (pseudo) { parts[part].before = aibReadBox(el, '::before'); parts[part].after = aibReadBox(el, '::after'); }
      });
      if (id === 'slider') { const r = box.querySelector('.sb-k-range'); if (r) parts.slider.rules = aibSliderRules(r); }
      states[name.trim()] = parts;
    });
    snap.cells[id] = states;
  });
  const scr = id => page.querySelector(`.sb-k-layout[data-scr="${id}"]`);
  const read = (root, sel) => { const el = root && root.querySelector(sel); return el ? aibReadBox(el) : null; };
  const list = scr('list'), ob = scr('onboarding');
  snap.chrome = {
    status: read(list, '.sb-statusbar'), topbar: read(list, '.sb-k-topbar'), tabbar: read(list, '.sb-tabs'),
    title: read(list, '.sb-k-ltitle'), headline: read(ob, '.ab-headline'), hl: read(ob, '.ab-hl'), home: read(list, '.sb-homebar'),
    listRows: list ? list.querySelectorAll('.sb-k-row').length : 0,
  };
  const kl = page.querySelector('.sb-k-cell[data-k="list"] .sb-k-state .sb-k-list');
  snap.listInfo = aibListInfo(kl, 1);
  const set = scr('settings');
  const back = set && set.querySelector('.sb-k-topbar .sb-k-plain');
  if (back) { const bi = back.querySelector('svg'); snap.chrome.back = { box: aibReadBox(back), before: aibReadBox(back, '::before'), after: aibReadBox(back, '::after'), icon: bi ? aibReadBox(bi) : null }; }
  const pr = set && set.querySelector('.sb-k-row.is-nolead:not(.sb-k-togrow)');
  if (pr) { const sb = set.querySelector('.sb-phone-in'); const k = sb && sb.offsetWidth ? sb.getBoundingClientRect().width / sb.offsetWidth : 1; snap.chrome.plainRow = Math.round(pr.getBoundingClientRect().height / k); }
  return snap;
}

// Renders the Built view's UI kit and Mobile screens for the live state off-screen (SeeBuilt.kitInto / mobileInto)
// in light and in dark, and returns one snapshot: the default mode's geometry with every colour as "light|dark".
// The live Built view, its tab and the state are not touched.
const AIB_KIT_CACHE = { key: '', snap: null };
function aibKitMeasure(state0, mode, both) {
  if (typeof document === 'undefined' || !document.body || typeof getComputedStyle !== 'function') return null;
  if (typeof SeeBuilt === 'undefined' || typeof SeeBuilt.kitInto !== 'function') return null;
  if (typeof state === 'undefined' || state0 !== state) return null;
  let key = '';
  try { key = JSON.stringify(state0, (k, v) => (k === 'logoDataUrl' ? String(v || '').length : k === 'logo' && v && typeof v === 'object' && v.files ? 'logo@' + (v.updatedAt || String(JSON.stringify(v.files)).length) : v)); } catch (err) { key = ''; }
  key += '|' + mode + '|' + both;
  if (key && AIB_KIT_CACHE.key === key) return AIB_KIT_CACHE.snap;
  const live = document.getElementById('builtView');
  const one = m => {
    const host = document.createElement('div');
    host.className = 'sb-view';
    host.setAttribute('aria-hidden', 'true');
    // straight on <body>: the editor (and #builtView's parent) is display:none in the library, brief and share
    // views, and nothing inside a display:none ancestor gets a layout
    host.style.cssText = 'position:fixed;left:-20000px;top:0;width:1200px;visibility:hidden;pointer-events:none;display:block;contain:layout style;';
    let snap = null;
    try {
      document.body.appendChild(host);
      const page = SeeBuilt.kitInto(host, { mode: m });
      if (page) { snap = aibKitSnap(page); snap.mode = m; }
      if (snap && typeof SeeBuilt.mobileInto === 'function') { SeeBuilt.mobileInto(host, { mode: m }); snap.screens = aibScreenSnap(host); }
    } catch (err) {
      snap = null;
    } finally {
      host.remove();
    }
    return snap;
  };
  let snap = one(mode);
  if (snap && both) {
    const other = one(mode === 'dark' ? 'light' : 'dark');
    if (other) { snap = aibPairSnap(snap, other, mode !== 'dark'); snap.mode = mode; snap.paired = true; }
  }
  AIB_KIT_CACHE.key = key;
  AIB_KIT_CACHE.snap = snap;
  return snap;
}

/* ---- measured kit -> words (pure: works on aibKitSnap data, no DOM) ---- */

// Names a measured colour after the brief's tokens. The kit is measured in light and dark: a colour arrives as
// "light|dark" (aibPairSnap) and only a token whose light AND dark values match both measurements may name it
// (`--card`, never a `--white` that stays white in dark). Forms: `--ink`, `--ink at 16%`, `--primary at 12% over
// --canvas`. When no token matches both, a kit token is made from the two measurements (`--kit-card`), so every
// name in the brief has a correct value in each mode. `hint` names the component asking.
function aibKitNamer(ctx) {
  const L = ctx.modes.find(m => m.mode === 'light') || ctx.modes[0], D = ctx.modes.find(m => m.mode === 'dark') || L;
  const cands = [];
  const push = (name, get, kind) => {
    if (cands.some(c => c.name === name)) return;
    const pl = aibRgba(get(L)), pd = aibRgba(get(D));
    if (pl && pd) cands.push({ name, pl, pd, kind });
  };
  (ctx.rows || []).forEach(r => { if (r.kit) return; push(r.token, r.get, 'row'); (r.on || []).forEach(([tk, g]) => push(tk, g, 'on')); });
  const exOf = (m, k) => String(((m && m.extras) || {})[k] == null ? '' : m.extras[k]).trim();
  Object.keys((L && L.extras) || {}).forEach(k => { if (/^--ab-/.test(k) && !/font|hl-scale|scale|display|-tr$|-hs$/.test(k)) push(k, m => exOf(m, k), 'ab'); });
  const derived = aibKitDerived(ctx);
  Object.keys(derived).forEach(k => push(k, derived[k].get, 'derived'));
  ctx.kitVars = ctx.kitVars || {};
  Object.keys(ctx.kitVars).forEach(k => { if (ctx.kitVars[k].measured) push(k, ctx.kitVars[k].get, 'kit'); });
  const canvas = cands.find(c => c.name === '--canvas');
  const dist = (a, b) => Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
  const used = name => {
    if (ctx.kitVars[name]) return name;
    if (/^--ab-/.test(name)) ctx.kitVars[name] = { get: m => exOf(m, name) };
    else if (derived[name]) ctx.kitVars[name] = derived[name];
    return name;
  };
  const css = p => (p[3] >= 0.985 ? '#' + p.slice(0, 3).map(x => Math.round(x).toString(16).padStart(2, '0')).join('') : `rgba(${p.slice(0, 3).map(Math.round).join(', ')}, ${Math.round(p[3] * 100) / 100})`);
  const pureOf = p => p[3] > 0.99 && (Math.min(p[0], p[1], p[2]) > 253.5 || Math.max(p[0], p[1], p[2]) < 1.5);
  return (raw, hint) => {
    const parts = String(raw == null ? '' : raw).split('|');
    const one = aibRgba(parts[0]);
    if (!one) return String(raw || 'none');
    // a single-mode measurement (no "light|dark" pair) is compared in the mode it was drawn in only
    const solo = parts.length < 2, soloDark = solo && ((ctx.kitSnap && ctx.kitSnap.mode) || ctx.mode) === 'dark';
    const pl = solo ? one : one;
    const pd = solo ? one : (aibRgba(parts[1]) || one);
    if (pl[3] < 0.03 && pd[3] < 0.03) return 'none';
    let best = null;
    const cl = c => (soloDark ? c.pd : c.pl), cd = c => (solo ? (soloDark ? c.pd : c.pl) : c.pd);
    cands.forEach(c => {
      const dl = dist(pl, cl(c)) + Math.abs(pl[3] - cl(c)[3]) * 255, dd = dist(pd, cd(c)) + Math.abs(pd[3] - cd(c)[3]) * 255;
      if (dl <= 6 && dd <= 6 && (!best || dl + dd < best.d)) best = { c, d: dl + dd };
    });
    if (best) {
      if ((best.c.kind === 'on' || best.c.kind === 'derived') && pureOf(pl) && pureOf(pd) && Math.abs(pl[0] - pd[0]) < 2 && (!solo || (Math.abs(best.c.pl[0] - best.c.pd[0]) < 2))) return used(pl[0] > 128 ? '--white' : '--black');
      return used(best.c.name);
    }
    if (pl[3] < 0.985 && Math.abs(pl[3] - pd[3]) < 0.04) {
      let b2 = null;
      cands.forEach(c => { if (cl(c)[3] < 0.99 || cd(c)[3] < 0.99) return; const d = dist(pl, cl(c)) + dist(pd, cd(c)); if (dist(pl, cl(c)) <= 8 && dist(pd, cd(c)) <= 8 && (!b2 || d < b2.d)) b2 = { c, d }; });
      if (b2) return `${used(b2.c.name)} at ${Math.round(pl[3] * 100)}%`;
    }
    if (canvas && pl[3] >= 0.985 && pd[3] >= 0.985) {
      let b3 = null;
      cands.forEach(c => {
        if (c === canvas || c.pl[3] < 0.99 || c.pd[3] < 0.99) return;
        const v = [0, 1, 2].map(i => cl(c)[i] - cl(canvas)[i]), w = [0, 1, 2].map(i => pl[i] - cl(canvas)[i]);
        const vv = v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
        if (vv < 400) return;
        const k = (v[0] * w[0] + v[1] * w[1] + v[2] * w[2]) / vv;
        if (k < 0.03 || k > 0.97) return;
        const d = dist(pl, [0, 1, 2].map(i => cl(canvas)[i] + k * v[i])), dd = dist(pd, [0, 1, 2].map(i => cd(canvas)[i] + k * (cd(c)[i] - cd(canvas)[i])));
        if (d <= 4 && dd <= 6 && (!b3 || d + dd < b3.d)) b3 = { c, d: d + dd, k };
      });
      if (b3) return `${used(b3.c.name)} at ${Math.round(b3.k * 100)}% over --canvas`;
    }
    // no token fits both modes: a kit token from the two measurements
    const slug = String(hint || 'colour').replace(/^btn-/, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    let nm = `--kit-${slug}`, n = 1;
    const same = k => { const v = ctx.kitVars[k]; return v && v.measured && v.l === css(pl) && v.d === css(pd); };
    while (ctx.kitVars[nm] && !same(nm)) nm = `--kit-${slug}-${++n}`;
    if (!ctx.kitVars[nm]) {
      const l = css(pl), d = css(pd);
      ctx.kitVars[nm] = { measured: true, l, d, get: m => (m && m.mode === 'dark' ? d : l), job: 'Measured from the UI kit in light and dark.' };
      cands.push({ name: nm, pl, pd, kind: 'kit' });
    }
    return nm;
  };
}

// Light and dark measurements merged: the base snapshot (the default mode, whose geometry the brief states)
// with every colour turned into "light|dark". Colours inside gradients and shadows are paired one by one.
function aibPairSnap(base, other, baseIsLight) {
  const COL = /(?:rgba?|color)\([^()]*\)|#[0-9a-f]{3,8}\b/gi;
  const pair = (a, b) => (baseIsLight ? `${a}|${b}` : `${b}|${a}`);
  const list = (a, b) => {
    const ca = String(a).match(COL) || [], cb = String(b).match(COL) || [];
    if (!ca.length || ca.length !== cb.length) return a;
    let i = 0;
    return String(a).replace(COL, m => pair(m, cb[i++]));
  };
  const walk = (a, b) => {
    if (!a || !b || typeof a !== 'object') return a;
    if (Array.isArray(a)) return a.map((x, i) => walk(x, b[i]));
    const out = {};
    Object.keys(a).forEach(k => {
      const x = a[k], y = b[k];
      if (typeof x === 'string' && typeof y === 'string' && /^(bg|color|c|dc)$/.test(k) && aibRgba(x) && aibRgba(y)) out[k] = pair(x, y);
      else if (typeof x === 'string' && typeof y === 'string' && /^(img|sh|filter|ol|dv|rowRule|closing)$/.test(k)) out[k] = list(x, y);
      else out[k] = walk(x, y);
    });
    return out;
  };
  return walk(base, other);
}

// Colours the UI kit computes from the palette (js/see-built.js kitColours, js/ui-kit.js uiKitTone / uiKitDanger),
// per mode, as named tokens: { name: { get(m), job } }. Only the ones the kit really draws reach the brief.
function aibKitDerived(ctx) {
  if (ctx._kitDerived) return ctx._kitDerived;
  const out = {
    '--white': { get: () => '#ffffff', job: 'Pure white, where the UI kit draws it.' },
    '--black': { get: () => '#000000', job: 'Pure black, where the UI kit draws it.' },
  };
  if (typeof uiKitTone === 'function') {
    const pal = m => ({ primary: aibPri(m.t), secondary: m.t.secondary, accent: m.t.accent, ink: m.t.ink, canvas: m.t.canvas });
    const tone = (role, k, need, mix) => m => { const P = pal(m); const r = uiKitTone(P[role], P, need, mix); return k === 'ico' ? r.ico : r.color; };
    out['--primary-text'] = { get: tone('primary', 'ico', 4.5), job: 'The primary as text and small icons (text buttons, tinted icons), shaded to 4.5:1 on the canvas.' };
    [['info', 'primary'], ['success', 'secondary'], ['warning', 'accent']].forEach(([n, role]) => {
      out['--' + n] = { get: tone(role, 'color', 3.2, 0.12), job: `${aibCap(n)} callout tone (its tint and edge).` };
      out['--' + n + '-icon'] = { get: tone(role, 'ico', 3.2, 0.12), job: `${aibCap(n)} callout icon, 3:1 on its tint.` };
    });
  }
  if (typeof uiKitDanger === 'function' && typeof uiKitTone === 'function') {
    const dz = m => uiKitDanger({ primary: aibPri(m.t), secondary: m.t.secondary, accent: m.t.accent, ink: m.t.ink, canvas: m.t.canvas });
    out['--error-tone'] = { get: m => dz(m).color, job: 'The palette colour errors and destructive actions are drawn in (edges, fills).' };
    out['--error-icon'] = { get: m => { const d = dz(m); return d.role ? uiKitTone(d.color, { primary: aibPri(m.t), secondary: m.t.secondary, accent: m.t.accent, ink: m.t.ink, canvas: m.t.canvas }, 3.2, 0.12).ico : d.text; }, job: 'Error callout icon, 3:1 on its tint.' };
  }
  if ((ctx.modes || []).some(m => m.t.printed)) out['--brand-primary'] = { get: m => m.t.primary, job: `The brand primary unprinted: ${ctx.def.name}'s UI kit draws it here, while \`--primary\` is the printed value.` };
  ctx._kitDerived = out;
  return out;
}

const aibPt = n => `${Math.round(n * 10) / 10}`;

// A phone type role as the measured kit and Built screens set it: the face, weight, case and tracking of the text
// that plays the role (sizes stay UI_KIT_PHONE's, except the extra roles, which keep their measured size).
function aibKitPhoneRow(ctx, row, srcIn) {
  const K = ctx.kit, R = K.rows;
  const part = (id, p) => (R[id] && R[id].rest[p] && R[id].rest[p].box) || null;
  const src = srcIn || (/^(Large title|Title|Title 2)$/.test(row.role) ? K.chrome.titleBox
    : row.role === 'Headline' ? part('list', 'title')
      : row.role === 'Footnote' ? part('list', 'detail')
        : row.role === 'Caption' ? part('badge', 'tag')
          : row.role === 'Tab label' ? part('tabbar', 'selected label')
            : row.role === 'Body' ? ((K.screens && K.screens.body) || part('card', 'body'))
              : part('card', 'body'));
  if (!src) return row;
  if (K.screens && K.screens.pixel && row.role === 'Display' && ctx.state.headingFont) {
    const hf = ctx.state.headingFont, w = abWeightNear(hf, 400);
    if (ctx.fontUse) { const u = (ctx.fontUse[hf.name] = ctx.fontUse[hf.name] || { face: hf, weights: {} }); u.weights[String(w)] = { weight: w, italic: false }; }
    return Object.assign({}, row, { face: hf, weight: w, italic: false, note: 'uppercase (the pixel face the Built view draws its title glyphs from)', display: true, ps: aibPostScript(hf, w, false) });
  }
  const { face } = aibKitFaceObj(ctx, src.ff);
  const weight = aibKitWeight(ctx, src.ff, src.fw);
  const italic = src.fst === 'italic';
  const tr = src.ls && src.fs ? Math.round((src.ls / src.fs) * 100) / 100 : 0;
  const notes = [src.tt && src.tt !== 'none' ? src.tt : '', tr ? `tracking ${tr > 0 ? '+' : ''}${tr}em` : ''];
  let wcell = null;
  if (row.role === 'Tab label') {
    const off = part('tabbar', 'unselected tab');
    const ow = off ? aibKitWeight(ctx, off.ff, off.fw) : weight;
    if (ow !== weight) wcell = `${weight} selected, ${ow} unselected`;
    if (off && ctx.fontUse) aibKitType(ctx, off, c => c);
  }
  if (ctx.fontUse) aibKitType(ctx, src, c => c);
  return Object.assign({}, row, { face: face && face.weights ? face : face && face.name ? face : null, weight, wcell, italic, note: notes.filter(Boolean).join(', '),
    sysLabel: face ? '' : aibKitFace(ctx, src.ff), display: !!(face && ctx.state.headingFont && face.name === ctx.state.headingFont.name),
    ps: face ? aibPostScript(face, weight, italic) : null });
}

// The roles the Built screens add: Display (the welcome title), Eyebrow, Label (section labels), as measured.
function aibKitExtraRows(ctx) {
  const K = ctx.kit, S = K && K.screens;
  if (!S) return [];
  const mk = (role, o, style) => o && aibKitPhoneRow(ctx, { role, name: role.replace(/\s+/g, ''), size: Math.round(o.fs), line: Math.round(parseFloat(o.lh) || o.fs * 1.2), style, display: false }, o);
  return [mk('Display', S.display, 'largeTitle'), mk('Eyebrow', S.eyebrow, 'caption'), mk('Label', K.rows.divider && K.rows.divider.main, 'caption')].filter(Boolean);
}

// "Space Grotesk (display)": the face's first family and its role in the brief.
function aibKitFace(ctx, ff) {
  const first = String(ff || '').split(',')[0].trim().replace(/^["']|["']$/g, '');
  const st = ctx.state || {};
  if (/^ui-monospace$|^monospace$/i.test(first)) return 'ui-monospace (system mono)';
  if (/^(-apple-system|system-ui|BlinkMacSystemFont)$/i.test(first)) return 'system UI face';
  const role = st.headingFont && first === st.headingFont.name ? 'display' : st.bodyFont && first === st.bodyFont.name ? 'body'
    : /mono|courier|code|typewriter/i.test(first) ? 'mono' : 'UI';
  return `${first} (${role})`;
}

// "--ink, Lora (body) 17pt 600, uppercase": colour, face, size, weight (the nearest weight the face publishes, which
// is the one bundled), case, tracking. Every face used is recorded in ctx.fontUse for Fonts to bundle.
const AIB_SYSTEM_FACE = /^(ui-monospace|monospace|-apple-system|system-ui|BlinkMacSystemFont|sans-serif|serif|Arial|Helvetica(?: Neue)?|Georgia|Times(?: New Roman)?|Courier(?: New)?|Menlo|Monaco|Consolas|SF Mono|SF Pro(?: Text| Display)?|Verdana|Tahoma|Impact)$/i;
function aibKitFaceObj(ctx, ff) {
  const fam = String(ff || '').split(',')[0].trim().replace(/^["']|["']$/g, '');
  if (!fam || AIB_SYSTEM_FACE.test(fam)) return { fam, face: null };
  const st = ctx.state || {};
  const face = (typeof FONTS !== 'undefined' && FONTS.find(f => f.name === fam)) || (st.headingFont && st.headingFont.name === fam ? st.headingFont : st.bodyFont && st.bodyFont.name === fam ? st.bodyFont : null) || { name: fam };
  return { fam, face };
}
function aibKitWeight(ctx, ff, fw) {
  const { face } = aibKitFaceObj(ctx, ff);
  const w = parseInt(fw, 10) || 400;
  return face && face.weights && typeof abWeightNear === 'function' ? abWeightNear(face, w) : w;
}
function aibKitType(ctx, o, name) {
  if (!o) return '';
  const tr = o.ls && o.fs ? Math.round((o.ls / o.fs) * 100) / 100 : 0;
  const w = aibKitWeight(ctx, o.ff, o.fw);
  const { fam, face } = aibKitFaceObj(ctx, o.ff);
  if (ctx.fontUse && fam) {
    const u = (ctx.fontUse[fam] = ctx.fontUse[fam] || { face, weights: {} });
    u.weights[w + (o.fst === 'italic' ? 'i' : '')] = { weight: w, italic: o.fst === 'italic' };
  }
  return [name(o.color), `${aibKitFace(ctx, o.ff)} ${aibPt(o.fs)}pt ${w}${o.fst === 'italic' ? ' italic' : ''}`,
    o.tt && o.tt !== 'none' ? o.tt : '', tr ? `tracking ${tr > 0 ? '+' : ''}${tr}em` : '', /underline/.test(o.deco || '') ? 'underlined' : ''].filter(Boolean).join(', ');
}

function aibKitFill(o, name) {
  if (!o) return 'none';
  const f = aibAlpha(o.bg) >= 0.03 ? name(o.bg) : 'none';
  const img = aibImgWords(o, name);
  return img ? (f === 'none' ? img : `${f} with ${img}`) : f;
}


function aibKitEdge(o, name) {
  if (!o) return 'no edge';
  const side = ['top', 'right', 'bottom', 'left'];
  const vis = o.b.map(x => (x.w > 0 && x.s !== 'none' && x.s !== 'hidden' && aibAlpha(x.c) >= 0.03 ? `${aibPt(x.w)}pt ${x.s} ${name(x.c)}` : ''));
  if (vis.every(v => !v)) return 'no edge';
  if (vis.every(v => v === vis[0])) return vis[0];
  return vis.map((v, i) => (v ? `${side[i]} ${v}` : '')).filter(Boolean).join(', ');
}

function aibKitCorner(o) {
  if (!o) return '';
  const r = o.r, small = Math.min(o.h || 0, o.w || 0);
  const pill = v => v >= 999 || (small > 0 && v >= small / 2 - 0.5);
  if (r.every(v => v === r[0])) {
    if (!r[0]) return 'square corners';
    if (pill(r[0])) return o.w && o.h && Math.abs(o.w - o.h) < 1 ? 'circle' : 'pill';
    return `${aibPt(r[0])}pt corners`;
  }
  return `corners ${r.map(v => (pill(v) ? 'pill' : v ? aibPt(v) + 'pt' : '0')).join(' ')} (clockwise from top-left)`;
}

// box-shadow (and filter drop-shadow) in words, colours named: { text, kinds: ['hard offset' | 'soft' | 'ring' | 'inset' | 'veil'] }.
// The exact CSS values are in the Tokens block (--shadow-*).
function aibKitShadow(sh, name, filter) {
  const drops = String(filter || '').match(/drop-shadow\((?:[^()]|\([^()]*\))*\)/g) || [];
  if ((!sh || sh === 'none') && !drops.length) return { text: '', kinds: [] };
  const layers = (sh && sh !== 'none' ? aibSplitTop(sh) : [])
    .filter(l => { const col = (/(?:rgba?|color)\([^()]*\)(?:\|(?:rgba?|color)\([^()]*\))?/i.exec(l) || [''])[0]; return !col || aibAlpha(col) >= 0.03; });
  const kinds = [];
  const add = k => { if (kinds.indexOf(k) < 0) kinds.push(k); };
  const dir = (x, y) => [x ? `${Math.abs(Math.round(x))}pt ${x > 0 ? 'right' : 'left'}` : '', y ? `${Math.abs(Math.round(y))}pt ${y > 0 ? 'down' : 'up'}` : ''].filter(Boolean).join(' and ');
  const words = layers.map(l => {
    const col = (/(?:rgba?|color)\([^()]*\)(?:\|(?:rgba?|color)\([^()]*\))?|#[0-9a-f]{3,8}\b/i.exec(l) || [''])[0];
    const inset = /\binset\b/.test(l);
    const nums = l.replace(col, '').replace(/\binset\b/, '').trim().split(/\s+/).filter(Boolean).map(v => parseFloat(v) || 0);
    const [x = 0, y = 0, blur = 0, spread = 0] = nums;
    const c = col ? name(col) : 'the ink';
    if (inset && spread >= 200) { add('veil'); return `a ${c} veil over the whole control`; }
    if (inset) {
      add('inset');
      if (!blur && !x && !y) return `a ${Math.round(spread)}pt ${c} inner ring`;
      if (!blur) return `a ${Math.max(Math.abs(Math.round(x)), Math.abs(Math.round(y)))}pt ${c} inner line along the ${y < 0 ? 'bottom' : y > 0 ? 'top' : x < 0 ? 'right' : 'left'} edge`;
      return `a recessed inner ${c} shadow (${dir(x, y) || 'centred'}, ${Math.round(blur)}pt blur)`;
    }
    if (!blur && !x && !y) { add('ring'); return `a ${Math.round(spread)}pt ${c} ring outside the edge`; }
    if (!blur) { add('hard offset'); return `a hard ${c} shadow ${dir(x, y)}, no blur`; }
    add('soft');
    return `a soft ${c} shadow ${dir(x, y) || 'all round'}, ${Math.round(blur)}pt blur`;
  });
  drops.forEach(d => {
    const inner = d.slice(12, -1);
    const col = (/(?:rgba?|color)\([^()]*\)(?:\|(?:rgba?|color)\([^()]*\))?|#[0-9a-f]{3,8}\b/i.exec(inner) || [''])[0];
    const [x = 0, y = 0, blur = 0] = inner.replace(col, '').trim().split(/\s+/).filter(Boolean).map(v => parseFloat(v) || 0);
    add(blur ? 'soft' : 'hard offset');
    words.push(`a ${blur ? 'soft' : 'hard'} ${col ? name(col) : 'ink'} shadow ${dir(x, y)} that follows the outline`);
  });
  return { text: words.join(' plus '), kinds };
}

function aibKitPad(o) {
  const p = o.pad;
  if (!p || p.every(v => !v)) return '';
  const u = v => (v ? `${aibPt(v)}pt` : '0');
  if (p.every(v => v === p[0])) return `padding ${u(p[0])}`;
  if (p[0] === p[2] && p[1] === p[3]) return `padding ${u(p[0])} ${u(p[1])}`;
  return `padding ${p.map(u).join(' ')}`;
}

// Rotation and offset from a computed transform matrix: '' when there is none.
function aibKitTransform(tf) {
  const m = /^matrix\(([^)]+)\)$/.exec(String(tf || ''));
  if (!m) return '';
  const [a, b, , , e, f] = m[1].split(',').map(Number);
  const deg = Math.round((Math.atan2(b, a) * 180 / Math.PI) * 10) / 10;
  const out = [];
  if (Math.abs(deg) >= 0.2) out.push(`rotated ${deg}°`);
  if (Math.abs(e) >= 0.5 || Math.abs(f) >= 0.5) out.push(`shifted ${aibPt(e)},${aibPt(f)}pt`);
  return out.join(', ');
}


// The visual properties of one box that can change between states, as words, for diffs.
function aibKitVisual(ctx, o, name) {
  if (!o) return {};
  return {
    fill: aibKitFill(o, name), text: name(o.color), edge: aibKitEdge(o, name), shadow: aibKitShadow(o.sh, name, o.filter).text || 'none',
    opacity: o.op < 1 ? String(o.op) : '1', transform: aibKitTransform(o.tf) || 'none', outline: o.ol ? o.ol.replace(/(?:rgba?|color)\([^()]*\)(?:\|(?:rgba?|color)\([^()]*\))?/, m => name(m)) : 'none',
  };
}

// Which part carries the component's text, and whether its height is a fixed control size.
const AIB_KIT_TEXT = { card: 'title', list: 'title', topbar: 'title', tabbar: 'selected label', tabs: 'selected', field: 'input', search: 'input', checkbox: 'label', radio: 'label', toggle: 'label', segmented: 'selected', callout: 'title', sheet: 'title', empty: 'title', slider: 'label', select: 'box' };
const AIB_KIT_FIXED = new Set(['btn-primary', 'btn-secondary', 'btn-text', 'btn-destructive', 'btn-icon', 'field', 'search', 'select', 'checkbox', 'radio', 'toggle', 'segmented', 'topbar', 'tabbar', 'tabs', 'progress', 'avatar', 'badge', 'toast']);

// The model the brief writes from: per kit id the row cells, plus what the signature and the rules read.
function aibKitModel(ctx, snap) {
  if (!snap || !snap.cells || !Object.keys(snap.cells).length) return null;
  const name0 = aibKitNamer(ctx);
  const usage = {};
  let curId = '';
  const name = css => {
    const n = name0(css, ctx._nameHint || curId);
    const base = (/^(--[a-z0-9-]+)/.exec(n) || [])[1];
    if (base && curId) (usage[base] = usage[base] || new Set()).add(curId);
    return n;
  };
  ctx.fontUse = ctx.fontUse || {};
  const rows = {};
  const items = typeof UI_KIT !== 'undefined' ? UI_KIT.reduce((a, g) => a.concat(g.items), []) : [];
  const nameOf = id => ((items.find(i => i.id === id) || {}).name || id);
  const torn = o => (o.clip && o.clip !== 'none') || /url\(/.test(o.filter || '') ? 'a torn, uneven outline' : '';
  const dims = o => (Math.abs(o.w - o.h) < 1 ? `${Math.round(o.w)}x${Math.round(o.h)}pt` : `${Math.round(o.w)}x${Math.round(o.h)}pt`);
  Object.keys(snap.cells).forEach(id => {
    curId = id;
    ctx._markOwner = nameOf(id).toLowerCase();
    const states = snap.cells[id];
    const order = Object.keys(states);
    if (!order.length) return;
    const rest = states[order[0]];
    const parts = AIB_KIT_PARTS[id] || [];
    const mainName = parts[0] && parts[0][0];
    const main = rest[mainName] && rest[mainName].box;
    if (!main) return;
    const tp = AIB_KIT_TEXT[id] && rest[AIB_KIT_TEXT[id]] ? rest[AIB_KIT_TEXT[id]].box : main;
    // A component drawn on a full-size ::before / ::after layer (a paper sheet behind a card): that layer is its surface.
    const lay = ['after', 'before'].map(w => ({ w, o: rest[mainName][w] })).find(x => x.o && x.o.w >= main.w * 0.8 && x.o.h >= main.h * 0.6 && (aibAlpha(x.o.bg) >= 0.03 || x.o.img !== 'none'));
    const useLayer = lay && aibAlpha(main.bg) < 0.03 && main.img === 'none';
    let sh = aibKitShadow(main.sh, name, main.filter);
    if (useLayer && !sh.text) sh = aibKitShadow(lay.o.sh, name, lay.o.filter);
    const bb = main.b[2] && main.b[2].w > 0 && main.b[2].s !== 'none' ? main.b[2].w : 0;
    const edge = [aibKitEdge(main, name), aibKitCorner(main), sh.text, main.bd !== 'none' ? `a frosted backdrop blur (${String(main.bd).replace(/px/g, 'pt')})` : '', aibKitTransform(main.tf), torn(main)].filter(Boolean).join('; ');
    let size;
    if (id === 'topbar') {
      const total = main.bs === 'border-box' ? main.h : main.h + bb + (main.b[0] ? main.b[0].w : 0);
      size = bb ? `${Math.round(total - bb)}pt bar plus its ${Math.round(bb)}pt bottom rule` : `${Math.round(total)}pt high`;
    } else size = id === 'slider' ? '' : [AIB_KIT_FIXED.has(id) ? (/checkbox|radio|toggle|avatar|btn-icon/.test(id) ? dims(main) : `${Math.round(main.h)}pt high`) : '', aibKitPad(main)].filter(Boolean).join(', ');
    // Parts and marks: the other parts' notable looks and every ::before / ::after, in words.
    const marks = [];
    parts.forEach(([pn], i) => {
      const P = rest[pn];
      if (!P || !P.box) return;
      const o = P.box;
      if (pn === 'arrow') {
        const pieces = [P.before, P.after].filter(Boolean);
        const textArrow = pieces.find(x => AIB_ARROW_GLYPH.test(aibPseudoText(x.content)));
        if (!pieces.length && !(o.w > 0)) return;
        const chip = aibKitFill(o, name), chipEdge = aibKitEdge(o, name), chipSh = aibKitShadow(o.sh, name, o.filter).text;
        const holder = chip !== 'none' || chipEdge !== 'no edge' || chipSh ? `a ${Math.round(o.w)}pt ${/pill|circle/.test(aibKitCorner(o)) ? 'circle' : 'chip'} filled ${chip}${chipEdge !== 'no edge' ? ', ' + chipEdge + ' edge' : ''}${chipSh ? ', ' + chipSh : ''}, holding ` : '';
        const glyphName = x => AIB_GLYPH_NAME[aibPseudoText(x.content).trim()] || 'an arrow';
        if (textArrow && pieces.length === 1 && !holder) marks.push(`trailing mark: ${glyphName(textArrow)} in ${name(textArrow.color)} at the trailing edge (draw it as a 24pt SVG of that arrow, not a text glyph)`);
        else {
          const desc = pieces.map((x, k) => (AIB_ARROW_GLYPH.test(aibPseudoText(x.content)) ? `${glyphName(x)} (an SVG, not a text glyph) in ${name(x.color)}` : aibKitPseudo(ctx, x, k ? '::after' : '::before', o, name))).join(' and ');
          marks.push(`trailing mark at the end of the label: ${holder}${(desc || 'nothing').replace(/, (before|after) the text/g, '')}`.replace(/\s+/g, ' '));
        }
        return;
      }
      if (i > 0 && pn !== AIB_KIT_TEXT[id]) {
        const bits = [];
        const fill = aibKitFill(o, name);
        if (fill !== 'none') bits.push(`fill ${fill}`);
        if (/title|label|detail|value|message|count|tag|selected|unselected|action|chosen/.test(pn)) bits.push(aibKitType(ctx, o, name));
        const e = aibKitEdge(o, name);
        if (e !== 'no edge') bits.push(`edge ${e}`);
        if ((fill !== 'none' || e !== 'no edge') && o.r.some(v => v > 0)) bits.push(aibKitCorner(o));
        const s = aibKitShadow(o.sh, name, o.filter).text;
        if (s) bits.push(s);
        if (/row|grabber|icon tile|dot|fill|track|tag|count|selected/.test(pn) && o.h) bits.push(`${Math.round(o.h)}pt high`);
        if (/row/.test(pn)) bits.push(aibKitPad(o));
        const tf = aibKitTransform(o.tf);
        if (tf) bits.push(tf);
        if (bits.filter(Boolean).length) marks.push(`${pn}: ${bits.filter(Boolean).join(', ')}`);
      } else if (i > 0) {
        const s = aibKitShadow(o.sh, name, o.filter).text, f = aibKitFill(o, name), e = aibKitEdge(o, name);
        const bits = [f !== 'none' ? `fill ${f}` : '', e !== 'no edge' ? `edge ${e}` : '', s].filter(Boolean);
        if (bits.length) marks.push(`${pn}: ${bits.join(', ')}`);
      }
      ['before', 'after'].forEach(w => { if (i === 0 && useLayer && lay.w === w) return; const d = aibKitPseudo(ctx, P[w], `::${w}`, o, name); if (d) marks.push(i === 0 ? d : `${pn}: ${d}`); });
    });
    // Other states: only what differs from the first state, part by part; long ones keep the component's own change.
    const diffs = order.slice(1).map(sn => {
      const S = states[sn];
      const ch = [];
      parts.forEach(([pn]) => {
        const a = rest[pn], b = S[pn];
        if (!b || !b.box || pn === 'arrow') return;
        if (!a || !a.box) {
          const f = aibKitFill(b.box, name), e = aibKitEdge(b.box, name), s = aibKitShadow(b.box.sh, name, b.box.filter).text;
          const boxy = f !== 'none' || e !== 'no edge' || s;
          ch.push(`${pn} appears: ${[f !== 'none' ? 'fill ' + f : '', /message|label|title|option/.test(pn) ? aibKitType(ctx, b.box, name) : '', e !== 'no edge' ? 'edge ' + e : '', boxy ? aibKitCorner(b.box) : '', s].filter(Boolean).join(', ')}`);
          return;
        }
        const va = aibKitVisual(ctx, a.box, name), vb = aibKitVisual(ctx, b.box, name);
        const d = Object.keys(vb).filter(k => va[k] !== vb[k]).map(k => (k === 'shadow' ? vb[k] : `${k} ${vb[k]}`));
        ['before', 'after'].forEach(w => {
          const x = aibKitPseudo(ctx, a[w], `::${w}`, a.box, name), y = aibKitPseudo(ctx, b[w], `::${w}`, b.box, name);
          if (x !== y && y) d.push(y);
        });
        if (d.length) ch.push(`${pn === mainName ? '' : pn + ' '}${d.join(', ')}`.trim());
      });
      let text = ch.length ? ch.join('; ') : 'looks the same';
      if (text.length > 150 && ch.length > 1) text = `${ch[0]}; its text and marks follow the same colour`;
      return `${sn}: ${text}`;
    });
    let fillCell = aibKitFill(main, name);
    if (useLayer) {
      const L = lay.o;
      fillCell = `${aibKitFill(L, name)}, drawn as a sheet ${aibPlace(L, main, `::${lay.w}`)}${+L.z < 0 ? ' behind the content' : ''}${aibKitTransform(L.tf) ? ', ' + aibKitTransform(L.tf) : ''}${torn(L) ? ', with ' + torn(L) : ''}`;
    }
    if (id === 'slider' && rest.slider && rest.slider.rules) {
      const R = rest.slider.rules;
      const tr = R.track || {}, th = R.thumb || {};
      const col = v => { const c = (AIB_COLOR_IN.exec(String(v || '')) || [])[0]; return c ? name(c) : ''; };
      const pt = v => `${Math.round(parseFloat(v) || 0)}pt`;
      const look = o => {
        const img = o['background-image'] && o['background-image'] !== 'none' ? aibImgWords({ img: o['background-image'], bgSize: o['background-size'] || 'auto', bgPos: '0% 0%' }, name) : '';
        const bg = o['background-color'] && aibAlpha(o['background-color']) >= 0.03 ? col(o['background-color']) : '';
        const bw = parseFloat(o['border-top-width']) || 0;
        const r = parseFloat(o['border-top-left-radius']) || 0;
        return [img ? img.replace(/a gradient from (\S+) to (\S+) \(left to right\)/, '$1 up to the value, $2 after it') : bg ? `fill ${bg}` : '', bw && o['border-top-style'] !== 'none' ? `${pt(bw)} ${col(o['border-top-color']) || 'ink'} edge` : '',
          /%/.test(o['border-top-left-radius'] || '') || r >= 99 ? 'round' : r ? `${pt(r)} corners` : '', o['box-shadow'] && o['box-shadow'] !== 'none' ? 'a soft shadow' : ''].filter(Boolean).join(', ');
      };
      fillCell = `track ${pt(tr.height || 4)} high${look(tr) ? ', ' + look(tr) : ''}`;
      marks.push(`thumb: ${[th.width && th.height ? `${Math.round(parseFloat(th.width))}x${Math.round(parseFloat(th.height))}pt` : '', look(th)].filter(Boolean).join(', ') || 'the system thumb'}`);
    }
    if (id === 'tabbar' && snap.chrome && snap.chrome.tabbar) size = `${Math.round(snap.chrome.tabbar.h)}pt high on a screen, including the 34pt home indicator area`;
    if (id === 'list' && snap.listInfo) marks.unshift(aibListWords(snap.listInfo, name));
    if (id === 'toggle') {
      const sw = st => states[st] && states[st].switch;
      const knob = st => { const P = sw(st); if (!P) return ''; const k = [P.before, P.after].find(x => x && x.w > 0 && x.w < P.box.w * 0.8); return k ? aibPlace(k, P.box, '::before').replace(/^vertically centred in the box, /, '').replace(/the box, /, '') : ''; };
      const off = knob(order[0]), on = knob(order[1] || '');
      if (off || on) marks.unshift(`knob: ${off ? `off — ${off}` : ''}${off && on ? '; ' : ''}${on ? `on — ${on}` : ''}; any tag beside it keeps at least 6pt from the knob`);
      const word = st => { const P = sw(st); return P ? [P.before, P.after].map(x => (x ? aibPseudoText(x.content).trim() : '')).filter(Boolean).join(' ') : ''; };
      const wOff = word(order[0]), wOn = word(order[1] || '');
      if (wOff || wOn) marks.unshift(`meaning: off shows ${wOff ? `"${wOff}"` : 'no mark'}, on shows ${wOn ? `"${wOn}"` : 'no mark'}`);
    }
    if (id === 'btn-primary' && /gradient/.test(main.img || '')) {
      const c = aibGradContrast(ctx, main, name);
      if (c) marks.push(c);
    }
    rows[id] = { fill: fillCell, text: aibKitType(ctx, tp, name), edge, size, marks: marks.filter(Boolean), states: diffs, main, tp, sh, rest, all: states, groundRaw: useLayer ? lay.o.bg : main.bg };
  });
  aibKitFixContrast(ctx, rows);
  if (rows.tabbar && snap.screens && snap.screens.home) rows.tabbar.text = 'per tab, as Built screens → Home → Tab bar lists';
  curId = 'screens';
  ctx._kitRows = rows;
  const scr = snap.screens ? aibScreenModel(ctx, snap.screens, name) : null;
  curId = 'chrome';
  const ch = snap.chrome || {};
  const tb = rows.topbar && rows.topbar.main;
  const tbBar = tb ? Math.round((tb.bs === 'border-box' ? tb.h : tb.h + tb.b[0].w + tb.b[2].w) - (tb.b[2].s !== 'none' ? tb.b[2].w : 0)) : 44;
  const chrome = {
    status: ch.status ? ch.status.h : 54, topbar: tbBar, topRule: tb && tb.b[2].s !== 'none' && tb.b[2].w ? Math.round(tb.b[2].w) : 0, tabbar: ch.tabbar ? ch.tabbar.h : 83,
    title: ch.title ? aibKitType(ctx, ch.title, name) : '', titleBox: ch.title, listRows: ch.listRows || 0,
    rowDetail: snap.listInfo ? snap.listInfo.rowH : 0, rowPlain: ch.plainRow || 0,
    back: ch.back ? (() => { const b = ch.back, o = b.box; const f = aibKitFill(o, name); const sh = aibKitShadow(o.sh, name, o.filter).text;
      return f === 'none' && !sh && aibKitEdge(o, name) === 'no edge' ? `a bare ${b.icon ? Math.round(b.icon.w) : 22}pt chevron icon in ${name((b.icon || o).color)}, ${Math.round(o.w)}x${Math.round(o.h)}pt hit area`
        : `a ${Math.round(o.w)}x${Math.round(o.h)}pt chip (${f}, ${aibKitCorner(o)}${aibKitEdge(o, name) !== 'no edge' ? ', ' + aibKitEdge(o, name) + ' edge' : ''}${sh ? ', ' + sh : ''}) holding a ${b.icon ? Math.round(b.icon.w) : 22}pt chevron in ${name((b.icon || o).color)}`; })() : '',
  };
  curId = '';
  return { rows, usage, chrome, nameOf, screens: scr };
}

// Each kit row's own text against its fill (or the canvas behind it), in light and in dark. Text under 4.5:1 in
// either mode gets a kit token shaded just enough (toward black or white) in the mode that fails.
// A token's value in mode m: palette rows and their on-colours, kit tokens, the style's own variables, derived tones.
function aibTokenValue(ctx, tk, m) {
  const r = (ctx.rows || []).find(x => x.token === tk);
  if (r) return r.get(m);
  for (const x of ctx.rows || []) { const on = (x.on || []).find(([t]) => t === tk); if (on) return on[1](m); }
  if (ctx.kitVars && ctx.kitVars[tk]) return ctx.kitVars[tk].get(m);
  if (/^--ab-/.test(tk) && m && m.extras && m.extras[tk] != null) return String(m.extras[tk]).trim();
  const d = typeof aibKitDerived === 'function' ? aibKitDerived(ctx)[tk] : null;
  return d ? d.get(m) : '';
}

// A text colour on its ground ("light|dark" measurements) in both modes. Passing: null. Failing (under 4.5:1, or 3:1
// for text 24pt and up): the first on-colour token that passes in both modes, logged in ctx.pairLog and, when the
// pair is what the Built view draws, in ctx.styleIssues.
function aibPairFix(ctx, textRaw, groundRaw, big, label, notBuilt) {
  if (typeof contrastRatio !== 'function') return null;
  const need = big ? 3 : 4.5;
  const hex = p => '#' + p.slice(0, 3).map(x => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0')).join('');
  const L = ctx.modes.find(m => m.mode === 'light') || ctx.modes[0], D = ctx.modes.find(m => m.mode === 'dark') || L;
  const MS = [L, D];
  const two = raw => { const p = String(raw || '').split('|'); return [aibRgba(p[0]), aibRgba(p[1] || p[0])]; };
  const t = two(textRaw), g = two(groundRaw);
  if (!t[0] || !g[0]) return null;
  const flat = (c, i) => { const cv = aibRgba(MS[i].t.canvas) || [255, 255, 255, 1]; return hex(c.map((v, j) => (j < 3 ? v * c[3] + cv[j] * (1 - c[3]) : v))); };
  const grounds = [0, 1].map(i => flat(g[i], i));
  const ratios = [0, 1].map(i => contrastRatio(flat(t[i], i), grounds[i]));
  ctx.pairLog = ctx.pairLog || [];
  if (ratios.every(r => r >= need)) { ctx.pairLog.push({ label, ratios, need }); return null; }
  const cands = ['--ink', '--canvas', '--on-primary', '--on-accent', '--on-secondary', '--card-ink', '--ab-sheet-ink', '--white', '--black'];
  const score = tk => [0, 1].map(i => { const v = aibRgba(aibTokenValue(ctx, tk, MS[i])); return v ? contrastRatio(flat(v, i), grounds[i]) : 0; });
  const pick = cands.map(tk => ({ tk, r: score(tk) })).find(x => x.r.every(v => v >= need)) || cands.map(tk => ({ tk, r: score(tk) })).sort((a, b) => Math.min(...b.r) - Math.min(...a.r))[0];
  ctx.pairLog.push({ label, ratios: pick.r, need, was: ratios });
  if (!notBuilt) (ctx.styleIssues = ctx.styleIssues || []).push(`${label}: the Built view draws text at ${ratios.map(r => r.toFixed(1)).join(' / ')}:1 (light / dark); the brief uses ${pick.tk}`);
  return { token: pick.tk, ratios: pick.r, was: ratios };
}

function aibKitFixContrast(ctx, rows) {
  if (typeof contrastRatio !== 'function') return;
  const hex = p => '#' + p.slice(0, 3).map(x => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0')).join('');
  const halves = raw => String(raw || '').split('|');
  const L = ctx.modes.find(m => m.mode === 'light') || ctx.modes[0], D = ctx.modes.find(m => m.mode === 'dark') || L;
  Object.keys(rows).forEach(id => {
    const r = rows[id], t = r.tp, f = r.main;
    if (!t || !t.color || (t.fs || 0) >= 24 || (f.img && f.img !== 'none')) return;   // gradient fills: aibGradContrast
    // text beside its control (toggle, checkbox and radio labels, the empty state's title) sits on the canvas, not on the control
    const beside = /^(toggle|checkbox|radio|empty|slider)$/.test(id);
    const tc = halves(t.color), fc = halves(t !== f && aibAlpha(t.bg) >= 0.5 ? t.bg : beside ? '' : (r.groundRaw || f.bg));
    const fix = [0, 1].map(i => {
      const tp = aibRgba(tc[i] || tc[0]), fp = aibRgba(fc[i] || fc[0]);
      if (!tp) return null;
      const ground = fp && fp[3] >= 0.5 ? hex(fp) : (i ? D : L).t.canvas;
      const col = hex(tp);
      if (tp[3] < 0.9 || contrastRatio(col, ground) >= 4.5) return { col, ok: true };
      const toward = contrastRatio('#000000', ground) > contrastRatio('#ffffff', ground) ? [0, 0, 0] : [255, 255, 255];
      for (let k = 0.05; k <= 1; k += 0.05) { const c = hex(tp.map((v, j) => (j < 3 ? v + (toward[j] - v) * k : v))); if (contrastRatio(c, ground) >= 4.5) return { col: c, ok: false }; }
      return { col: hex(toward), ok: false };
    });
    if (!fix[0] || !fix[1] || (fix[0].ok && fix[1].ok)) return;
    (ctx.styleIssues = ctx.styleIssues || []).push(`kit ${id} text under 4.5:1 on its ground in ${fix[0].ok ? 'dark' : fix[1].ok ? 'light' : 'both modes'}; the brief shades it (--kit-${id.replace(/^btn-/, '')}-text)`);
    const nm = `--kit-${id.replace(/^btn-/, '')}-text`;
    const l = fix[0].col, d = fix[1].col;
    ctx.kitVars = ctx.kitVars || {};
    ctx.kitVars[nm] = { measured: true, l, d, get: m => (m && m.mode === 'dark' ? d : l), job: 'Text of this component, kept at 4.5:1 on its fill in both modes.' };
    r.text = r.text.replace(/^[^,]+/, nm);
  });
}

// A list's grouping in words, from aibListInfo.
function aibListWords(L, name) {
  if (!L) return '';
  const rule = css => { const m = /^([\d.]+)px (\w+) (.+)$/.exec(String(css || '').trim()); return m ? `a ${Math.round(+m[1]) || 1}pt ${m[2]} ${name(m[3])} rule` : ''; };
  if (L.tile) return `grouping: each row is its own tile, ${L.gap}pt apart`;
  const div = rule(L.dv) || rule(L.rowRule);
  const inset = L.dvX ? `, starting ${Math.round(L.dvX)}pt in from the left (under the text, not the lead)` : '';
  const close = L.closing ? `; ${rule(L.closing)} closes the list` : '';
  return L.open
    ? `grouping: an open list on the canvas, rows separated by ${div || 'no rule'}${inset}${close}`
    : `grouping: one grouped card holding all rows, separated by ${div || 'no rule'}${inset}${close}`;
}

// Label contrast on a gradient primary: against both ends, and the label colour that passes both.
function aibGradContrast(ctx, o, name) {
  if (typeof contrastRatio !== 'function') return '';
  const hex = c => { const p = aibRgba(c); return p ? '#' + p.slice(0, 3).map(x => Math.round(x).toString(16).padStart(2, '0')).join('') : null; };
  const stops = (String(o.img).match(/(?:rgba?|color)\([^()]*\)|#[0-9a-f]{6}\b/gi) || []).filter(c => aibAlpha(c) > 0.5).map(hex).filter(Boolean);
  if (stops.length < 2) return '';
  const ends = [stops[0], stops[stops.length - 1]];
  const label = hex(o.color);
  const t = ctx.cur.t;
  const cands = [[name(o.color), label], ['--ink', t.ink], ['--canvas', t.canvas], ['--white', '#ffffff'], ['--black', '#000000']].filter(x => x[1]);
  const score = h => Math.min(...ends.map(e => contrastRatio(h, e)));
  const pick = cands.find(x => score(x[1]) >= 4.5) || cands.slice().sort((a, b) => score(b[1]) - score(a[1]))[0];
  const r = h => ends.map(e => contrastRatio(h, e).toFixed(1) + ':1').join(' and ');
  return `label contrast on the gradient: ${r(label)} against its two ends${pick[1] !== label ? `; set the label in ${pick[0]} instead (${r(pick[1])})` : ''}`;
}

// Measured details of one Built phone: the welcome title's line breaks and drawn-letter tiles, body lines, icon
// sizes per context, the home indicator, tab icons, and where a button's label and trailing mark sit.
function aibScreenExtra(root, k, id) {
  const rect = el => { const r = el.getBoundingClientRect(); return { x: r.left / k, y: r.top / k, w: r.width / k, h: r.height / k, b: r.bottom / k, r: r.right / k }; };
  const lines = (el, units) => {
    const rows = [];
    units.forEach(u => { const t = String(u.t || '').trim(); if (!t) return; const y = Math.round(u.y); const row = rows.find(r => Math.abs(r.y - y) < 6); if (row) row.w.push(t); else rows.push({ y, w: [t] }); });
    return rows.sort((a, b) => a.y - b.y).map(r => r.w.join(' '));
  };
  const words = el => {
    const out = [];
    const walk = n => {
      if (n.nodeType === 3) {
        const re = /\S+/g; let m;
        while ((m = re.exec(n.textContent))) { const rg = document.createRange(); rg.setStart(n, m.index); rg.setEnd(n, m.index + m[0].length); const rr = rg.getClientRects()[0]; if (rr) out.push({ t: m[0], y: rr.top / k }); }
      } else if (n.nodeType === 1 && n.getAttribute('aria-hidden') !== 'true') Array.from(n.childNodes).forEach(walk);
    };
    walk(el);
    return out;
  };
  const ex = {};
  const h = root.querySelector('.sb-ob-h');
  if (h) {
    const custom = h.classList.contains('ab-headline--custom');
    const label = h.getAttribute('aria-label') || h.textContent;
    if (!custom) ex.titleLines = lines(h, words(h));
    else {
      const wordEls = Array.from(h.querySelectorAll('[aria-hidden] .xpw, [aria-hidden] .pbh, [aria-hidden] .pbh-hl'));
      const labelWords = String(label).trim().split(/\s+/);
      const lineEls = Array.from(h.querySelectorAll('[aria-hidden] .xpl'));
      if (lineEls.length) {
        let i = 0;
        ex.titleLines = lineEls.map(l => { const n = l.querySelectorAll('.xpw').length; const w = labelWords.slice(i, i + n).join(' '); i += n; return w; }).filter(Boolean);
      } else if (wordEls.length === labelWords.length) {
        const lh = parseFloat(getComputedStyle(h).lineHeight) || 30;
        const ys = wordEls.map(w => { const r = rect(w); return r.y + r.h / 2; });
        const rows = [];
        ys.forEach((y, i) => { const row = rows.find(r => Math.abs(r.y - y) < lh / 2); if (row) row.w.push(labelWords[i]); else rows.push({ y, w: [labelWords[i]] }); });
        ex.titleLines = rows.sort((a, b) => a.y - b.y).map(r => r.w.join(' '));
      }
      const tiles = Array.from(h.querySelectorAll('[aria-hidden] *')).filter(e => { const c = getComputedStyle(e); return aibAlpha(c.backgroundColor) > 0.3 && e.children.length === 0 && String(e.textContent).trim(); });
      ex.tiles = tiles.map(e => { const c = getComputedStyle(e); const m = /^matrix\(([^)]+)\)$/.exec(c.transform); const p = m ? m[1].split(',').map(Number) : [1, 0]; return { ff: c.fontFamily, bg: c.backgroundColor, color: c.color, deg: Math.round(Math.atan2(p[1], p[0]) * 1800 / Math.PI) / 10, word: e.classList.contains('xpt-word'), t: e.textContent.trim(), gap: parseFloat(getComputedStyle(e).marginRight) || 0, h: rect(e).h }; });
      const loop = h.querySelector('[aria-hidden] svg:not(.pbh-w)');
      if (loop) { const c = getComputedStyle(loop); ex.loop = { color: c.color, word: (loop.closest('.xpw') || {}).textContent || '' }; }
      ex.pixel = !!h.querySelector('.pbh-w');
      ex.titleWords = labelWords;
      const tile0 = h.querySelector('[aria-hidden] .xpw');
      ex.wordGap = tile0 ? Math.round(parseFloat(getComputedStyle(tile0.parentNode).columnGap || getComputedStyle(tile0.parentNode).gap) || 0) : 0;
    }
    ex.titleH = Math.round(rect(h).h);
    ex.titleLH = parseFloat(getComputedStyle(h).lineHeight) || 0;
    const hl = h.querySelector('.ab-hl'), glue = h.querySelector('.ab-hl-glue');
    ex.stopOutside = !!(glue && hl && /[.!?,…]$/.test(glue.textContent.trim()) && !/[.!?,…]$/.test(hl.textContent.trim()));
  }
  const isl = root.parentNode && root.parentNode.parentNode && root.parentNode.parentNode.querySelector('.sb-island');
  const rb0 = rect(root);
  if (isl && rect(isl).w > 0) { const r = rect(isl); ex.island = { w: Math.round(r.w), h: Math.round(r.h), y: Math.round(r.y - rb0.y) }; }
  const time = root.querySelector('.sb-statusbar > span'), icons = root.querySelector('.sb-sb-r');
  if (time) ex.timeX = Math.round(rect(time).x - rb0.x);
  if (icons) ex.iconsR = Math.round(rb0.r - rect(icons).r);
  if (h && ex.tiles && ex.tiles.length) {
    const tl = Array.from(h.querySelectorAll('[aria-hidden] *')).filter(e => { const c = getComputedStyle(e); return aibAlpha(c.backgroundColor) > 0.3 && e.children.length === 0 && String(e.textContent).trim(); });
    const cs = tl.map(e => getComputedStyle(e));
    ex.tileFs = Math.round(Math.max(...cs.map(c => parseFloat(c.fontSize) || 0)));
    ex.tileMinW = Math.round(Math.min(...tl.map(e => e.offsetWidth || rect(e).w)));
    ex.tilePad = [Math.round(parseFloat(cs[0].paddingTop) || 0), Math.round(parseFloat(cs[0].paddingLeft) || 0)];
    const ls = Array.from(h.querySelectorAll('[aria-hidden] .xpl')).map(rect);
    if (ls.length > 1) ex.lineGap = Math.max(0, Math.round(ls[1].y - (ls[0].y + ls[0].h)));
  }
  const body = root.querySelector('.sb-ob-body');
  if (body) { const lh = parseFloat(getComputedStyle(body).lineHeight) || 24; ex.bodyLines = Math.round(rect(body).h / lh); ex.bodyChars = body.textContent.trim().length; }
  const size = sel => { const e = root.querySelector(sel); return e ? Math.round(rect(e).w) : 0; };
  ex.icons = { chip: size('.sb-k-ico svg'), bell: size('.sb-icon-btn svg'), tab: size('.sb-tab svg'), chevron: size('.sb-k-chev svg') };
  const hb = root.querySelector('.sb-homebar');
  if (hb) { const r = rect(hb), rb = rect(root); ex.homebar = { w: Math.round(r.w), h: Math.round(r.h), bottom: Math.round(rb.b - r.b), color: getComputedStyle(hb).backgroundColor }; }
  const tabIco = sel => { const e = root.querySelector(sel); return e ? getComputedStyle(e).color + '|' + (getComputedStyle(e).fill || '') : ''; };
  ex.tabIcon = { on: tabIco('.sb-tab[aria-current] svg'), off: tabIco('.sb-tab:not([aria-current]) svg') };
  const tl = root.querySelector('.sb-tab[aria-current] span');
  if (tl) { const c = getComputedStyle(tl); ex.tabChip = { padX: parseFloat(c.paddingLeft) || 0, padY: parseFloat(c.paddingTop) || 0, r: parseFloat(c.borderTopLeftRadius) || 0, bg: c.backgroundColor }; }
  const btn = root.querySelector(id === 'home' ? '.sb-home-card .ab-cta' : '.sb-ob-actions .ab-cta');
  if (btn) {
    const b = rect(btn), lab = btn.querySelector('.ab-cta-label'), arr = btn.querySelector('.ab-cta-arrow');
    if (lab) { const l = rect(lab); const words = words2 => words2; ex.label = Math.abs((l.x + l.w / 2) - (b.x + b.w / 2)) < 3 ? 'centred' : `left-aligned, ${Math.round(l.x - b.x)}pt in`; }
    if (arr && rect(arr).w > 0) { const a = rect(arr); ex.arrowIn = Math.round(b.r - a.r); }
  }
  return ex;
}

// The Built Mobile screens (Welcome, Home) top to bottom in plain words, measured. Blocks flow: each gives its gap
// below the previous block's bottom; only pinned parts (top band, bottom actions, tab bar) give a y from the top
// of the screen. Every block sits on the 20pt side margins (350pt wide) unless a step says otherwise.
function aibScreenModel(ctx, S, name) {
  const stripH = o => Math.round(o.bs === 'border-box' ? o.h : o.h + (o.pad ? o.pad[0] + o.pad[2] : 0) + (o.b ? o.b[0].w + o.b[2].w : 0));
  const T = o => (o ? aibKitType(ctx, o, name) + (aibAlpha(o.bg) >= 0.03 ? `, on a ${aibKitFill(o, name)} strip${o.w ? ` ${Math.round(o.w)}pt wide` : ''}, ${stripH(o)}pt tall${o.pad && o.pad.some(v => v) ? ` (that height includes its ${aibKitPad(o)})` : ''}` : '') : '');
  const F = o => { const f = o ? aibKitFill(o, name) : 'none'; return f === 'none' ? 'no fill' : f; };
  const E = o => { const e = o ? aibKitEdge(o, name) : 'no edge'; return e === 'no edge' ? '' : `, a ${e} edge`; };
  const SH = o => { const t = o ? aibKitShadow(o.sh, name, o.filter).text : ''; return t ? `, ${t}` : ''; };
  const mk = (P, owner) => { ctx._markOwner = owner || ''; const r = [P && P.before, P && P.after].map((x, i) => (x ? aibKitPseudo(ctx, x, i ? '::after' : '::before', P.box, name) : '')).filter(Boolean).join('; '); ctx._markOwner = ''; return r; };
  const withMk = (P, owner) => { const m = mk(P, owner); return m ? `, with ${m}` : ''; };
  const gap = (a, b) => (a && b ? Math.max(0, b.rect.y - (a.rect.y + a.rect.h)) : 0);
  const below = (a, b) => `${gap(a, b)}pt below the previous block`;
  const q = s => `"${String(s || '').replace(/"/g, '\'')}"`;
  const vis = P => (P && P.rect.w > 0 && P.rect.h > 0 ? P : null);
  const out = { welcome: [], home: [], copyW: [], copyH: [] };
  const W = S.welcome || {}, H = S.home || {};
  const XW = W.extra || {}, XH = H.extra || {};
  const status = P => {
    const ic = ['signal', 'wifi', 'battery'].map(k => P[k]).filter(Boolean);
    return `Status bar (pinned, the top ${P['status bar'].rect.h}pt): the time ${q(P.time && P.time.text)} at the left in ${T(P.time && P.time.box)}; at the right ${ic.length ? `signal bars (four rising bars, ${P.signal ? P.signal.rect.w + 'x' + P.signal.rect.h : ''}pt), Wi-Fi (three arcs, ${P.wifi ? P.wifi.rect.w + 'x' + P.wifi.rect.h : ''}pt) and the battery (a rounded outline with its charge level and a small cap, ${P.battery ? P.battery.rect.w + 'x' + P.battery.rect.h : ''}pt)` : 'signal, Wi-Fi and battery'} in ${name(((ic[0] || P['status bar']).box).color)}. ${(P.extra || {}).timeX != null ? `The time starts ${P.extra.timeX}pt from the left edge and the icons end ${P.extra.iconsR}pt from the right edge. ` : ''}${(P.extra || {}).island ? `A Dynamic Island is drawn: a ${P.extra.island.w}x${P.extra.island.h}pt black pill centred ${P.extra.island.y}pt from the top (a device mock; leave it to the system).` : 'No Dynamic Island is drawn.'}`;
  };
  const band = P => (P && aibAlpha(P.box.bg) >= 0.03 ? `a full-width band filled ${F(P.box)}${E(P.box)}` : `no band fill (on the canvas)${E(P && P.box)}`);
  const home = X => (X.homebar ? `Home indicator (pinned): a ${X.homebar.w}x${X.homebar.h}pt ${name(X.homebar.color)} pill, centred, ${X.homebar.bottom}pt above the bottom edge.` : '');
  if (W['status bar']) {
    W.extra = XW;
    out.welcome.push(status(W));
    ctx._nameHint = 'logo';
    const chip = vis(W['logo chip']), img = vis(W['logo image']), ini = W['logo initial'];
    const logo = img ? `the logo image, ${img.rect.h}pt high` : chip ? `a ${chip.rect.w}x${chip.rect.h}pt logo chip (${F(chip.box)}, ${aibKitCorner(chip.box)}${E(chip.box)}${SH(chip.box)}) ${ini && vis(ini) && ini.text ? `holding the initial ${q(ini.text)} in ${T(ini.box)}` : 'with no letter'}${withMk(chip, 'logo chip')}${ini && mk(ini, 'logo chip') ? `, and inside it ${mk(ini, 'logo chip')}` : ''}` : '';
    const wm = W.wordmark ? `the name ${q(W.wordmark.text)} in ${T(W.wordmark.box)}${withMk(W.wordmark, 'name')}` : '';
    const tr = W['top row'];
    if (tr) out.welcome.push(`Top band (pinned at ${tr.rect.y}pt from the top of the screen, ${tr.rect.h}pt high), ${band(tr)}${withMk(tr, 'top band')}${W.brand && mk(W.brand, 'top band') ? `, with ${mk(W.brand, 'top band')}` : ''}; inside it: ${[logo, wm].filter(Boolean).join(', then ')}${W.skip ? `, and a ${q(W.skip.text)} text button at the right margin (${T(W.skip.box)})` : ''}.`);
    const topGap = gap(tr, W.eyebrow || W.headline), botGap = W['feature list'] && W.pager ? gap(W['feature list'], W.pager) : null;
    const centred = botGap != null && Math.abs(topGap - botGap) <= 12;
    const stamp = o => { if (!o) return ''; const e = aibKitEdge(o, name); const tf = aibKitTransform(o.tf).split(', ').filter(x => /^rotated/.test(x)).join(''); return [e !== 'no edge' ? `boxed by a ${e} edge` : '', e !== 'no edge' && o.pad && o.pad.some(v => v) ? `padding ${Math.round(o.pad[0])} ${Math.round(o.pad[1])}pt` : '', tf].filter(Boolean).join(', '); };
    if (W.eyebrow) out.welcome.push(`${centred ? 'The content block (eyebrow to feature rows) is centred vertically between the band and the pager; it starts with' : `${topGap}pt below the band:`} the eyebrow ${q(W.eyebrow.text)} in ${T(W.eyebrow.box)}${stamp(W.eyebrow.box) ? ', ' + stamp(W.eyebrow.box) : ''}${withMk(W.eyebrow, 'eyebrow')}.`);
    const hd = W.headline;
    ctx._nameHint = 'title-tile';
    if (hd) {
      const lines = XW.titleLines || [];
      const brk = lines.length > 1 ? ` The Built view breaks it into ${lines.length} lines (${lines.map(q).join(' / ')}), breaking after ${lines.slice(0, -1).map(l => q(l.split(' ').pop())).join(' and ')}: insert a line break after ${lines.slice(0, -1).map(l => q(l.split(' ').pop())).join(' and ')} for this tagline, and also set \`text-wrap: balance\` so other taglines never leave a word alone on a line.` : ' It fits on one line; set `text-wrap: balance` so a longer tagline never leaves one word alone on a line.';
      let how = `in ${T(hd.box)}${hd.box.lh ? ` on a ${Math.round(parseFloat(hd.box.lh))}pt line` : ''}`;
      if (XW.pixel) {
        const face = ctx.state.headingFont;
        if (face && ctx.fontUse) { const u = (ctx.fontUse[face.name] = ctx.fontUse[face.name] || { face, weights: {} }); u.weights['400'] = { weight: 400, italic: false }; }
        how = `in ${face ? face.name : 'the display face'} (the pixel face this style draws its glyphs from; bundle it), uppercase, ${name(hd.box.color)}, sized so the title fills ${lines.length || Math.max(1, Math.round(XW.titleH / (XW.titleLH || 41)))} lines in ${XW.titleH}pt as the Built view does`;
      } else if (XW.tiles && XW.tiles.length) {
        const faces = Array.from(new Set(XW.tiles.map(t => String(t.ff).split(',')[0].replace(/["']/g, '').trim())));
        faces.forEach(f => { const o = aibKitFaceObj(ctx, f); if (o.face && ctx.fontUse) { const u = (ctx.fontUse[f] = ctx.fontUse[f] || { face: o.face, weights: {} }); u.weights['400'] = { weight: 400, italic: false }; } });
        const grounds = Array.from(new Set(XW.tiles.map(t => { const fx = aibPairFix(ctx, t.color, t.bg, (t.h || 0) >= 24, `title tile ${name(t.bg)}`); return `${name(t.bg)} with ${fx ? fx.token : name(t.color)} letters`; })));
        const tilt = Math.max(...XW.tiles.map(t => Math.abs(t.deg)));
        const whole = XW.tiles.filter(t => t.word).map(t => q(t.t));
        how = `as ransom-note tiles: most words are cut into one tile per letter, each tile cycling the faces ${faces.join(' and ')} and the grounds ${grounds.slice(0, 6).join(', ')}${whole.length ? `; the words ${whole.join(' and ')} are each one whole-word tile` : ''}; about one tile in three is tilted, by up to ±${Math.round(tilt * 10) / 10}°, tiles touch within a word and words sit ${XW.wordGap || 6}pt apart; letters ${XW.tileFs || 34}pt, tiles ${Math.round(Math.max(...XW.tiles.map(t => t.h)))}pt tall and at least ${XW.tileMinW || 16}pt wide with ${XW.tilePad ? `${XW.tilePad[0]}pt top/bottom and ${XW.tilePad[1]}pt side` : 'tight'} padding, ${XW.lineGap != null ? `${XW.lineGap}pt between lines, ` : ''}filling ${lines.length || 2} lines in ${XW.titleH}pt`;
        if (XW.loop) how += `; the highlight is the last word's tiles sitting inside a hand-drawn ${name(XW.loop.color)} marker loop, as drawn (no swipe or block)`;
      }
      out.welcome.push(`${gap(W.eyebrow || tr, hd)}pt below the previous block: the welcome title, the brand's tagline word for word, ${how}.${brk}${withMk(hd, 'welcome title') ? ' Around it' + withMk(hd, 'welcome title').replace(/^,/, ':') + '.' : ''} ${S.welcome && S.welcome.highlight && aibHlWords(ctx, S.welcome.highlight, hd.box, name) || XW.tiles || XW.pixel ? ` Its last word carries the highlight (see Colors)${XW.stopOutside ? '; the full stop sits just outside the coloured part, inside the same nowrap span' : ''}.` : ' No word is highlighted in this style.'}`);
    }
    if (W.body) out.welcome.push(`${below(hd, W.body)}: one sentence of body in ${T(W.body.box)}${E(W.body.box) ? `, with ${E(W.body.box).replace(/^, /, '')}${W.body.box.pad && W.body.box.pad[3] ? ` and ${Math.round(W.body.box.pad[3])}pt of space between it and the text` : ''}` : ''}${withMk(W.body, 'body text')}, ${XW.bodyLines || 2} lines at most (about ${XW.bodyChars || 90} characters here).`);
    const fl = W['feature list'];
    ctx._nameHint = 'feature';
    if (fl) {
      const ico = W['feature icon chip'], r1 = W['feature row'], r2 = W['second feature row'];
      const noLeader = m => String(m || '').split('; ').filter(x => !/leader line/.test(x)).join('; ');
      const rowMk = r1 && noLeader(mk(r1, 'feature rows')), row2Mk = r2 && noLeader(mk(r2, 'feature rows'));
      out.welcome.push(`${below(W.body || hd, fl)}: ${r1 ? r1.n : 3} feature rows, ${S.welcome.listInfo ? S.welcome.listInfo.rowH : r1.rect.h}pt each. ${fl.box.pad && fl.box.pad.some(v => v) ? `The group has ${aibKitPad(fl.box)}. ` : ''}Each starts with ${ico ? `a ${ico.rect.w}x${ico.rect.h}pt icon chip (${F(ico.box)}, ${aibKitCorner(ico.box)}${E(ico.box)}${SH(ico.box)}) holding a ${XW.icons && XW.icons.chip || 18}pt icon in ${name(ico.box.color)}` : 'a leading icon'}, then the title in ${T(W['feature title'] && W['feature title'].box)}. ${aibCap(aibListWords(S.welcome.listInfo, name).replace(/^grouping: /, ''))}${mk(fl, 'feature list') ? `; around the whole group: ${mk(fl, 'feature list')}` : ''}${rowMk && rowMk !== row2Mk ? `; the first row only: ${rowMk}` : rowMk ? `; on every row: ${rowMk}` : ''}.`);
    }
    ctx._nameHint = 'pager';
    const pb = W['primary button'], sb = W['second button'];
    const dot = W['current dot'], od = W['other dot'];
    if (pb) out.welcome.push(`Pinned at the bottom, from the top of the screen: ${W.pager && dot ? `${od ? od.n + 1 : 3} pager dots centred at ${W.pager.rect.y}pt (the current one a ${dot.rect.w}x${dot.rect.h}pt ${F(dot.box)} ${/pill|circle/.test(aibKitCorner(dot.box)) ? 'pill' : 'block'}, the others ${od ? `${od.rect.w}x${od.rect.h}pt ${F(od.box)}` : 'smaller'}, ${od ? Math.max(0, od.rect.x - (dot.rect.x + dot.rect.w)) : 6}pt apart), then ` : ''}the Primary button ${q(pb.text)} at ${pb.rect.y}pt (label ${XW.label || 'centred'}${XW.arrowIn != null ? `, its trailing mark ${XW.arrowIn}pt in from the right edge` : ', no trailing mark'})${sb ? `, then the Secondary button ${q(sb.text)} at ${sb.rect.y}pt` : ''}; the last one is ${(sb || pb).rect.h}pt tall and ends ${844 - ((sb || pb).rect.y + (sb || pb).rect.h)}pt above the bottom edge.`);
    if (home(XW)) out.welcome.push(home(XW));
    const fc = (S.welcome.copy || {}).features || [];
    if (fc.length) out.copyW.push(`feature rows: ${fc.map(([t, g]) => `${q(t)}${g ? ` (${g} icon)` : ''}`).join(', ')}`);
    if (W.eyebrow) out.copyW.push(`eyebrow ${q(W.eyebrow.text)}`);
    if (W.body) out.copyW.push(`body ${q(W.body.text)}`);
    if (pb) out.copyW.push(`buttons ${q(pb.text)} and ${q(sb && sb.text)}`);
  }
  if (H['status bar']) {
    ctx._nameHint = 'home';
    H.extra = XH;
    out.home.push(status(H));
    const t = H.title, ey = H.eyebrow, tb = H['top band'];
    const bell = H['bell button'], bd = H['bell dot'];
    if (tb) out.home.push(`Top band (pinned at ${tb.rect.y}pt from the top of the screen, ${tb.rect.h}pt high), ${band(tb)}${withMk(tb, 'top band')}; inside it: ${ey ? `the eyebrow ${q(ey.text)} in ${T(ey.box)}${withMk(ey, 'eyebrow')}; ${gap(ey, t)}pt below it ` : ''}${t ? `the screen title ${q(t.text)} in ${T(t.box)}${withMk(t, 'screen title')}` : ''}${bell ? (() => { const inEy = ey && aibAlpha(ey.box.bg) >= 0.03 && bell.rect.y >= ey.rect.y - 2 && bell.rect.y + bell.rect.h <= ey.rect.y + ey.rect.h + 2; const look = [F(bell.box) === 'no fill' ? '' : F(bell.box), E(bell.box).replace(/^, /, ''), SH(bell.box).replace(/^, /, '')].filter(Boolean).join(', '); return `; ${inEy ? `inside the eyebrow's strip, at its right end,` : 'at the right margin,'} the notifications button: ${look ? `a ${bell.rect.w}x${bell.rect.h}pt button (${look}) holding a` : 'a bare'} ${XH.icons && XH.icons.bell || 20}pt bell icon in ${name(bell.box.color)}${look ? '' : ` with a ${bell.rect.w}x${bell.rect.h}pt hit area and no ring or fill`}${bd ? `, with a ${bd.rect.w}pt ${F(bd.box)} status dot${SH(bd.box)} on its top-right corner` : ''}`; })() : ''}.`);
    const c = H['summary card'];
    if (c) {
      const seg = H['card segmented control'], ctit = H['card title'], cb = H['card body'], cbtn = H['card button'];
      const rel = P => (P ? `${P.rect.y - c.rect.y}pt` : '');
      const so = H['card selected segment'], oo = H['card other segment'];
      const segTxt = seg ? `the Segmented control at ${rel(seg)} (${seg.rect.h}pt tall${so ? `; segments ${so.rect.w}pt wide with ${aibKitPad(so.box) || 'no padding'}; selected: text ${name(so.box.color)} on ${F(so.box)}${E(so.box)}${mk(so, 'segment') ? ', ' + mk(so, 'segment') : ''}` : ''}${oo ? `; unselected: text ${name(oo.box.color)} on ${F(oo.box)}${E(oo.box)}${mk(oo, 'segment') ? ', ' + mk(oo, 'segment') : ''}` : ''})` : '';
      const inner = [segTxt, ctit && `the card title ${q(ctit.text)} at ${rel(ctit)} (${ctit.rect.h}pt, ${T(ctit.box)}${withMk(ctit, 'card title')})`, cb && `the body at ${rel(cb)} (${cb.rect.h}pt, ${T(cb.box)}${withMk(cb, 'card body')})`, cbtn && `the Primary button ${q(cbtn.text)} at ${rel(cbtn)} (${cbtn.rect.h}pt, label ${XH.label || 'centred'}${XH.arrowIn != null ? `, trailing mark ${XH.arrowIn}pt in from the right edge` : ', no trailing mark'})`].filter(Boolean);
      const last = cbtn || cb || ctit || seg;
      out.home.push(`${gap(tb || t, c)}pt below the band: the summary Card, full width, ${c.rect.h}pt tall${withMk(c, 'card')}. Inside, as y offsets from the card's top edge (these replace the kit card's padding): ${inner.join(', ')}; ${last ? `${c.rect.y + c.rect.h - (last.rect.y + last.rect.h)}pt below the button to the card's bottom edge` : ''}.`);
    }
    const sec = H['section row'], sl = H['section label'], sa = H['see all'], li = H.list;
    if (sec) out.home.push(`${gap(c, sec)}pt below the card: the section label ${q(sl && sl.text)} in ${T(sl && sl.box)}${withMk(sl, 'section label')}${sa ? `, with a ${q(sa.text)} text button at the right margin (${T(sa.box)})` : ''}.`);
    if (li) {
      const r1 = H.row, r2 = H['second row'];
      const rowMk = r1 && mk(r1, 'list rows'), row2Mk = r2 && mk(r2, 'list rows');
      const tMk = mk(H['row title'], 'row title'), vMk = mk(H['row value'], 'row value');
      out.home.push(`${below(sec, li)}: the list, ${r1 ? r1.n : ''} rows of ${S.home.listInfo ? S.home.listInfo.rowH : r1.rect.h}pt: the avatar, the title in ${T(H['row title'] && H['row title'].box)}${H['row title'] && H['row title'].box.tt === 'none' ? ' (sentence case, as written)' : ''}${tMk ? ` (${tMk})` : ''}, a detail line in ${T(H['row detail'] && H['row detail'].box)}${mk(H['row detail'], 'row detail') ? ` (${mk(H['row detail'], 'row detail')})` : ''}, and the value with a ${XH.icons && XH.icons.chevron || 16}pt chevron at the right in ${T(H['row value'] && H['row value'].box)}${vMk ? ` (${vMk})` : ''}. ${aibCap(aibListWords(S.home.listInfo, name).replace(/^grouping: /, ''))}${mk(li, 'list') ? `; around the whole group: ${mk(li, 'list')}` : ''}${rowMk && rowMk !== row2Mk ? `; the first row only: ${rowMk}` : rowMk ? `; on every row: ${rowMk}` : ''}${r1 && r2 && F(r1.box) !== F(r2.box) ? `; the first row is filled ${F(r1.box)}${E(r1.box)} while the others are ${F(r2.box)}` : ''}. ${(() => { const av = ((S.home.copy || {}).avatars || []).filter(Boolean); return av.length ? `Avatars show ${av.every(a => a.length === 1) ? 'one initial' : av.every(a => a.length === 2) ? 'two initials' : 'one or two initials'} (${av.map(q).join(', ')}).` : ''; })()}${(() => { const tbY = H['tab bar'] ? H['tab bar'].rect.y : 761; const lr = H['last row'] || li; const left = tbY - (lr.rect.y + lr.rect.h); return left > 80 ? ` Home shows exactly ${r1 ? r1.n : 3} rows, as the Built view does; the list ends ${left}pt above the tab bar and that space stays empty.` : ' It scrolls under the tab bar and ends on a whole row above it.'; })()}`);
    }
    ctx._nameHint = 'tab';
    const kt = ((ctx.kit && ctx.kit.rows) || ctx._kitRows || {}).tabbar, kitSel = kt && kt.tp ? name(kt.tp.color) : '';
    if (kitSel && H['selected tab label'] && name(H['selected tab label'].box.color) !== kitSel) (ctx.styleIssues = ctx.styleIssues || []).push(`tab bar: the UI kit draws the selected label in ${kitSel}, the Home screen in ${name(H['selected tab label'].box.color)}; the brief follows the screen`);
    const tbar = H['tab bar'], st = H['selected tab'], stl = H['selected tab label'], otl = H['other tab label'];
    if (tbar) {
      const tabs = (S.home.copy || {}).tabs || [];
      const ico = v => name(String(v || '').split('|')[0]);
      const chip = XH.tabChip && aibAlpha(XH.tabChip.bg) >= 0.03 ? `the label alone sits on a chip (${F(stl.box)}, the text width plus ${Math.round(XH.tabChip.padX)}pt each side, ${Math.round(XH.tabChip.padY)}pt above and below${XH.tabChip.r ? `, ${Math.round(XH.tabChip.r)}pt corners` : ''})` : `the label has no chip`;
      const per = tabs.map(([l, g, lc, lb, ic, on]) => `${q(l)}${on ? ' (selected)' : ''}: ${g} icon in ${name(ic)}, label ${name(lc)}${aibAlpha(lb) >= 0.03 ? ` on a ${name(lb)} chip` : ''}`);
      out.home.push(`Tab bar (pinned at ${tbar.rect.y}pt from the top of the screen, ${tbar.rect.h}pt including the home indicator): ${F(tbar.box)}${aibKitEdge(tbar.box, name) !== 'no edge' ? `, a ${aibKitEdge(tbar.box, name)} rule` : ''}, ${Math.round(tbar.box.pad[3])}pt side padding; ${tabs.length} tabs, each a ${XH.icons && XH.icons.tab || 24}pt icon over its label, tab cells transparent. Per tab, as the Home screen draws it: ${per.join('; ')}. ${/no chip/.test(chip) ? 'The selected label has no chip' : 'On the selected tab ' + chip}${st && mk(st, 'tab bar') ? `, with ${mk(st, 'tab bar')}` : ''}. Labels are text, never solid blocks of the label colour. On Settings the selected tab is ${q((tabs[tabs.length - 1] || [''])[0])} (Settings lives under it).`);
    }
    if (home(XH)) out.home.push(home(XH));
    const cp = S.home.copy || {};
    if (cp.segments && cp.segments.length) out.copyH.push(`segments ${cp.segments.map(q).join(', ')}`);
    if (c) out.copyH.push(`card ${q(H['card title'] && H['card title'].text)}, ${q(H['card body'] && H['card body'].text)}, button ${q(H['card button'] && H['card button'].text)}`);
    if (cp.rows && cp.rows.length) out.copyH.push(`rows ${cp.rows.map(r => r.filter(Boolean).map(q).join(' / ')).join('; ')}`);
    if (sec) out.copyH.push(`section ${q(sl && sl.text)}, ${q(sa && sa.text)}`);
  }
  ctx._nameHint = 'highlight';
  const hl = W.highlight;
  const hd = W.headline;
  const pagerLow = W['other dot'] && typeof contrastRatio === 'function' ? (() => { const a = aibRgba(W['other dot'].box.bg), cv = aibRgba(ctx.cur.t.canvas); if (!a || !cv) return 0; const hex = p => '#' + p.slice(0, 3).map(x => Math.round(x).toString(16).padStart(2, '0')).join(''); return contrastRatio(hex(a.slice(0, 3).map((v, i) => v * a[3] + cv[i] * (1 - a[3]))), ctx.cur.t.canvas); })() : 0;
  const hlWords = hl ? aibHlWords(ctx, hl, hd && hd.box, name) : null;
  ctx._nameHint = '';
  return { welcome: out.welcome, home: out.home, copyW: out.copyW, copyH: out.copyH, display: hd && hd.box, displayCustom: !!(hd && /ab-headline--custom/.test(hd.box.cls || '')), eyebrow: (W.eyebrow || H.eyebrow || {}).box,
    body: W.body && W.body.box, homeTitle: H.title && H.title.box, hl: hlWords, pixel: !!XW.pixel, tiles: !!(XW.tiles && XW.tiles.length),
    arrows: { welcome: XW.arrowIn != null, home: XH.arrowIn != null }, homeList: S.home && S.home.listInfo, icons: XH.icons || XW.icons || {}, chipIcon: XW.icons && XW.icons.chip, pagerContrast: pagerLow };
}

// The highlight word as the Built Welcome headline draws it: '' when it looks like the rest of the title.
function aibHlWords(ctx, P, head, name) {
  const o = P.box;
  const bits = [];
  if (head && name(o.color) !== name(head.color)) bits.push(`text ${name(o.color)}`);
  if (aibAlpha(o.bg) >= 0.03) bits.push(`a solid ${name(o.bg)} block behind it`);
  const img = aibImgWords(o, name, 'the word');
  if (img) bits.push(img);
  const bandCol = aibAlpha(o.bg) >= 0.03 ? o.bg : ((String(o.img || '').match(/(?:rgba?|color)\([^()]*\)(?:\|(?:rgba?|color)\([^()]*\))?/g) || []).find(c => aibAlpha(c) >= 0.5) || '');
  if (bandCol && /block|band covering|full width/.test(bits.join(' ')) && !/low across|very bottom|along the bottom/.test(bits.join(' '))) {
    const fx = aibPairFix(ctx, o.color, bandCol, (o.fs || 0) >= 24, 'highlight word');
    if (fx) bits.splice(0, bits.length, ...bits.filter(b => !/^text /.test(b)));
    if (fx) bits.push(`its letters in ${fx.token} so they read on the ${name(bandCol)} (${fx.ratios.map(r => r.toFixed(1)).join(' / ')}:1 light / dark)`);
  }
  if (/underline/.test(o.deco || '')) bits.push(`an underline in ${name(o.dc || o.color)}${o.dt && o.dt !== 'auto' ? `, ${Math.round((parseFloat(o.dt) / (o.fs || 1)) * 100) / 100}em thick` : ''}${o.uo && o.uo !== 'auto' ? `, ${Math.round((parseFloat(o.uo) / (o.fs || 1)) * 100) / 100}em below the baseline` : ''}`);
  if (head && o.fst !== head.fst) bits.push(o.fst);
  if (head && o.fw !== head.fw) bits.push(`weight ${o.fw}`);
  [['before', P.before], ['after', P.after]].forEach(([w, x]) => { if (x) bits.push(aibKitPseudo(ctx, x, '::' + w, o, name)); });
  if (!bits.length) return '';
  if (o.pad && o.pad.some(v => v)) bits.push(`padding ${Math.round((o.pad[0] / (o.fs || 1)) * 100) / 100}em ${Math.round((o.pad[1] / (o.fs || 1)) * 100) / 100}em`);
  return bits.join(', ');
}

// After the kit is measured: the corner set comes from it (one definition for kit, CSS and Swift), every
// aesthetic colour variable it draws becomes a Colors row, and a card ground that is not the canvas gets
// its own text tokens.
function aibKitApply(ctx) {
  const R = ctx.kit.rows;
  ctx._phone = null;
  const rad = row => {
    const o = row && row.main;
    if (!o) return null;
    const v = Math.max.apply(null, o.r);
    return v >= 999 || (o.h && v >= o.h / 2 - 0.5) ? 999 : Math.round(v);
  };
  const pick = (v, d) => (v == null ? d : v);
  ctx.radius = { control: pick(rad(R['btn-primary']), ctx.radius.control), field: pick(rad(R.field), ctx.radius.field), card: pick(rad(R.card), ctx.radius.card) };
  const valueIn = (nm, m) => {
    if (/^--ab-/.test(nm)) return String((m.extras || {})[nm] == null ? '' : m.extras[nm]).trim();
    const row = ctx.rows.find(r => r.token === nm);
    if (row) return row.get(m);
    for (const r of ctx.rows) { const on = (r.on || []).find(([tk]) => tk === nm); if (on) return on[1](m); }
    return /^#[0-9a-f]{6}$|^rgba?\(/i.test(nm) ? nm : '';
  };
  const uses = nm => Array.from(ctx.kit.usage[nm] || []).filter(id => id !== 'chrome').map(ctx.kit.nameOf);
  Object.keys(ctx.kitVars || {}).forEach(k => {
    if (ctx.rows.some(r => r.token === k)) return;
    const v = ctx.kitVars[k];
    ctx.rows.push({ token: k, get: m => v.get(m) || v.get(ctx.cur), job: `${v.job ? v.job + ' ' : `A colour of ${ctx.def.name}'s UI kit. `}Drawn by: ${uses(k).join(', ') || 'kit details'}.`, on: [] });
  });
  // The five roles and the error colour: their job, and where the kit really draws them (board prose about
  // crop strips, reference squares and shares of the page does not apply to an app).
  const roles = ctx.roles || {};
  ['canvas', 'ink', 'primary', 'secondary', 'accent', 'error'].forEach(k => {
    const tk = '--' + k, row = ctx.rows.find(r => r.token === tk);
    if (!row) return;
    const head = k === 'error' ? 'Errors and destructive actions; never a stock red' : k === 'canvas' ? 'The screen background' : k === 'ink' ? 'Default text and icons' : (roles[k] && roles[k].job) || aibCap(k);
    if (k === 'canvas' || k === 'ink') { row.job = aibStrip(head) + '.'; return; }
    const where = aibKitWhere(ctx, tk);
    const same = !where.length && ctx.rows.find(r => r !== row && ctx.modes.every(m => r.get(m) === row.get(m)) && aibKitWhere(ctx, r.token).length);
    row.job = `${aibStrip(head)}. In the UI kit: ${where.length ? (k === 'primary' ? where : where.map(w => w.split(' (')[0])).join(k === 'primary' ? '; ' : ', ')
      : same ? `drawn as \`${same.token}\` (the same value here) wherever a kit row shows an error or destructive state` : 'not drawn by any component'}.`;
  });
  const mutedRow = ctx.rows.find(r => r.token === '--muted');
  const styleMuted = ctx.rows.find(r => /^--ab-.*mut/.test(r.token));
  if (mutedRow && styleMuted) {
    const w = aibKitWhere(ctx, '--muted').map(x => x.split(' (')[0]);
    mutedRow.job = `Secondary text from the palette. In the UI kit: ${w.length ? w.join(', ') : 'not drawn by any component'}. \`${styleMuted.token}\` is ${ctx.def.name}'s own muted colour for the components its row lists; use each only where stated.`;
  }
  aibKitCardTokens(ctx, R, valueIn);
  // Tokens no component or screen draws leave the Colors table and :root for a one-line footnote.
  const blob = Object.keys(R).map(id => { const r = R[id]; return [r.fill, r.text, r.edge, r.marks.join(' '), r.states.join(' ')].join(' '); }).join(' ')
    + ' ' + (ctx.kit.screens ? ctx.kit.screens.welcome.concat(ctx.kit.screens.home).join(' ') + ' ' + (ctx.kit.screens.hl || '') : '') + ' ' + aibHighlightRule(ctx);
  const keep = new Set(['--canvas', '--ink', '--muted', '--line', '--primary', '--error', '--card', '--card-ink', '--card-muted']);
  const drawn = tk => keep.has(tk) || new RegExp(tk.replace(/-/g, '\\-') + '(?![\\w-])').test(blob);
  ctx.unusedRows = ctx.rows.filter(r => !drawn(r.token));
  ctx.rows = ctx.rows.filter(r => drawn(r.token));
}

function aibKitCardTokens(ctx, R, valueIn) {
  const card = R.card;
  if (card && card.fill !== 'none' && !/^--canvas\b/.test(card.fill)) {
    const plain = (/^(--[a-z0-9-]+|#[0-9a-f]{6})$/i.exec(card.fill) || [])[1];
    const namer = aibKitNamer(ctx);
    const title = card.rest.title && card.rest.title.box, body = card.rest.body && card.rest.body.box;
    const tn = title ? namer(title.color) : '--ink', bn = body ? namer(body.color) : '--muted';
    const get = nm => m => valueIn(nm, m) || (aibRgba(nm) ? nm : valueIn('--ink', m));
    if (plain && !ctx.rows.some(r => r.token === '--card')) ctx.rows.push({ token: '--card', get: get(plain), job: `Card, list and sheet ground as the UI kit draws it (${plain}).`, on: [] });
    if (!ctx.rows.some(r => r.token === '--card-ink') && /^--[a-z0-9-]+$|^#[0-9a-f]{6}$/i.test(tn)) ctx.rows.push({ token: '--card-ink', get: get(tn), job: `Titles and text on a card${plain ? ` (\`${plain}\` ground)` : ''}; the kit draws it as \`${tn}\`.`, on: [] });
    if (!ctx.rows.some(r => r.token === '--card-muted') && /^--[a-z0-9-]+$|^#[0-9a-f]{6}$/i.test(bn)) ctx.rows.push({ token: '--card-muted', get: get(bn), job: `Secondary text on a card; the kit draws it as \`${bn}\`.`, on: [] });
  }
}

// Where the measured kit draws a token: "Primary button (button ::before 6x6pt --primary square)", one per component.
function aibKitWhere(ctx, token) {
  const K = ctx.kit;
  if (!K) return [];
  const re = new RegExp(token.replace(/[-]/g, '\\-') + '(?![\\w-])');
  const out = [];
  Object.keys(K.rows).forEach(id => {
    const r = K.rows[id];
    const frags = [['fill', r.fill], ['text', r.text], ['edge', r.edge]].filter(([, v]) => re.test(v || '')).map(([k, v]) => `${k} ${String(v).split(/[;,] /).find(x => re.test(x)) || v}`)
      .concat(r.marks.filter(m => re.test(m)).map(m => m.split(/; /)[0]))
      .concat(r.states.filter(m => re.test(m)).map(m => { const st = m.split(':')[0]; const hit = m.slice(st.length + 1).split(/[;,] /).find(x => re.test(x)) || ''; return `${st}: ${hit.trim()}`; }));
    if (frags.length) out.push(`${K.nameOf(id)} (${frags.map(f => f.split(/[: ]/)[0]).filter((x, i, a) => a.indexOf(x) === i).slice(0, 3).join(', ')})`);
  });
  return out;
}

// ## UI kit, measured: one row per UI_KIT item with exactly what the UI kit tab draws.
function aibSecKitMeasured(ctx) {
  const K = ctx.kit;
  const out = ['## UI kit',
    `Measured from the UI kit tab as ${ctx.def.name} draws it. Every control and container in the product is one of these components, drawn exactly as stated. Colours are tokens from Colors (a plain hex or rgba() is a fixed value the kit draws); "\`--x\` at N%" means \`color-mix(in srgb, var(--x) N%, transparent)\` and "at N% over \`--canvas\`" means \`color-mix(in srgb, var(--x) N%, var(--canvas))\`; sizes are points at the 390 x 844 reference (1pt = 1 CSS px); padding is CSS shorthand; exact shadow values are the \`--shadow-*\` tokens; (display) and (body) name the brand faces. "Other states" lists only what changes from the first state.`];
  if (ctx.swift) out.push('Native rows: use the system control and only tint it (accent, track, label font); keep its size, motion and behaviour. Custom rows: draw them exactly as described.');
  const P = (typeof UI_KIT_PHONE !== 'undefined' && UI_KIT_PHONE) || {};
  UI_KIT.forEach(g => {
    const rows = g.items.map(it => {
      const r = K.rows[it.id];
      const ios = /^native:/.test(it.ios || '') ? `Native \`${it.ios.slice(7)}\`, tinted` : 'Custom';
      const cells = r ? [r.fill, r.text || 'n/a', r.edge, r.size || (it.id === 'slider' ? `${P.tapTarget || 44}pt hit area` : 'fits its content'), r.marks.join('; ') || 'none', r.states.join(' · ') || 'one state']
        : ['not drawn', 'n/a', 'n/a', 'n/a', 'none', it.states.join(', ')];
      return [it.name, it.use, ...(ctx.swift ? [ios] : []), ...cells.map(c => ctx.tok(c))];
    });
    out.push('', `### ${g.group}`, aibTable(['Element', 'Use'].concat(ctx.swift ? ['iOS'] : [], ['Fill', 'Text', 'Edge, corners, shadow', 'Size', 'Parts and marks', 'Other states']), rows));
  });
  return out;
}

function aibSecSignature(ctx) {
  const K = ctx.kit;
  if (!K) return [];
  const R = K.rows;
  const name = aibKitNamer(ctx);
  const nm = id => K.nameOf(id).toLowerCase();
  const first = t => String(t || '').split(/, (?=a |an |with |drawn )/)[0];
  const out = [`### How ${ctx.def.name} shows up in the app`];
  const corner = id => (R[id] ? aibKitCorner(R[id].main).replace(/ corners$/, '').replace(/^square$/, 'square') : '');
  out.push(`- Corners: buttons ${corner('btn-primary')}, fields ${corner('field')}, cards ${corner('card')}, badges ${corner('badge')}.`);
  const surf = id => { const r = R[id]; if (!r) return ''; return `${nm(id)} ${r.fill === 'none' ? 'unfilled' : first(r.fill)}${aibKitEdge(r.main, name) !== 'no edge' ? ' with a ' + aibKitEdge(r.main, name) + ' edge' : ''}${r.sh.kinds.length ? `, ${r.sh.kinds.join(' + ')} shadow` : ''}`; };
  out.push(`- Surfaces: ${['card', 'list', 'sheet'].map(surf).filter(Boolean).join('; ')}.`);
  const tt = o => (o ? aibKitType(ctx, o, name).replace(/^[^,]+, /, '').replace(/ \d+(?:\.\d+)?pt/, '') : '');
  const S = K.screens;
  const type = [S && S.pixel && ctx.state.headingFont ? `welcome title ${ctx.state.headingFont.name} (display), uppercase` : S && S.display ? `welcome title ${tt(S.display)}` : '', R.divider ? `section labels ${tt(R.divider.main)}` : '', R['btn-primary'] ? `button labels ${tt(R['btn-primary'].main)}` : ''].filter(Boolean);
  out.push(`- Type: ${type.join('; ')}.`);
  const pb = R['btn-primary'];
  const segSel = R.segmented && R.segmented.rest.selected && R.segmented.rest.selected.box;
  const tabMark = R.tabbar ? (R.tabbar.marks.find(m => /^selected tab: a /.test(m)) || '').replace(/^selected tab: /, '') : '';
  out.push(`- Primary and selection: the primary button is ${first(pb ? pb.fill : 'none')} with a ${pb ? name(pb.main.color) : ''} label${pb && pb.marks.find(m => /^a \d/.test(m)) ? ` and ${first(pb.marks.find(m => /^a \d/.test(m)))}` : ''}${segSel ? `; the selected segment is ${first(aibKitFill(segSel, name))}` : ''}${tabMark ? `; the selected tab shows ${first(tabMark)}` : ''}.`);
  const motif = [];
  const tb = R.topbar;
  if (tb && tb.fill !== 'none' && !/^--canvas\b/.test(tb.fill)) motif.push(`a top bar filled ${first(tb.fill)}`);
  Object.keys(R).forEach(id => {
    if (motif.length >= 4) return;
    const r = R[id];
    if (/texture|lines of|corner ticks|sheet/.test(r.fill)) motif.push(`${nm(id)}: ${r.fill.split(', drawn')[0]}`);
    else { const m = r.marks.find(x => /^(a |the mark|a small tag)/.test(x) && !/^(btn-primary|tabbar|list)$/.test(id)); if (m) motif.push(`${nm(id)}: ${first(m)}`); }
    const tf = aibKitTransform(r.main.tf);
    if (tf && motif.length < 4) motif.push(`${nm(id)} ${tf}`);
  });
  if (motif.length) out.push(`- Signature details: ${motif.slice(0, 4).join('; ')}.`);
  const tm = ctx.textMarks ? Object.keys(ctx.textMarks).filter(k => !/^N$/.test(k)) : [];
  if (tm.length) out.push(`- Text the style draws as marks (keep them, with your own values where they are data): ${tm.slice(0, 8).map(k => `"${k}" on ${Array.from(ctx.textMarks[k]).filter(Boolean).slice(0, 3).join(', ')}`).join('; ')}.`);
  const leaders = Object.keys(R).filter(id => R[id].marks.some(m => /leader line/.test(m)));
  if (leaders.length) out.push(`- Dotted or dashed leader lines on list rows that show a value (${leaders.map(nm).join(', ')}), filling the gap between the label and the value; never on the Welcome feature rows.`);
  return out;
}

function aibContext(state0, opts) {
  opts = opts || {};
  const view = abView(state0);
  const { state, def } = view;
  const target = AIB_TARGETS.some(x => x.value === opts.target) ? opts.target : aibGetTarget(state0);
  const surface = AIB_SURFACES.some(x => x.value === opts.surface) ? opts.surface : aibGetSurface(state0);
  const build = aestheticBuild(def.key) || aibDeriveBuild(def);
  const only = build.modes && build.modes.only ? build.modes.only : null;
  const mode = only || (state.bgMode === 'dark' ? 'dark' : 'light');
  const L = only === 'dark' ? null : aibModeTokens(view, 'light');
  const D = only === 'light' ? null : aibModeTokens(view, 'dark');
  [L, D].forEach(m => aibApplyOverrides(build, m));
  const modes = [L, D].filter(Boolean);
  const cur = mode === 'dark' ? D : L;
  const probe = opts.noProbe ? null : aibProbeBoard(state, def);
  const ty = state.typography;
  // The corners the board really draws (probe); the aesthetic's own recipes when there is none.
  const rad = (probe && probe.radius) || {};
  const rec = aibRecipeRadii(def);
  const radius = {
    control: aibNum(rad.button) != null ? aibNum(rad.button) : rec.control,
    field: aibNum(rad.field) != null ? aibNum(rad.field) : rec.field,
    card: aibNum(rad.card) != null ? aibNum(rad.card) : rec.card,
  };
  const ctx = {
    state0, state, def, view, target, surface, app: surface !== 'web', site: surface !== 'app', build, only, mode, L, D, modes, cur, probe, ty, radius,
    web: target !== 'swiftui', swift: target !== 'web', swiftOnly: target === 'swiftui',
    roles: colorRolesFor(state),
    content: aibContent(state),
    key: def.classicOf || def.key,
    assets: surface === 'app' ? [] : (opts.assets || aibPatternAssets(state0)),
  };
  // The logo files the zip carries (an upload, else the Logo Studio set); null when the brand has none.
  ctx.logo = aibLogoPlan(state0, opts.logoPng === true);
  // The product sheet (js/product-sheet.js) replaces the sample screens in an app brief.
  ctx.product = ctx.app && state0 && state0.product && Array.isArray(state0.product.screens) && state0.product.screens.length ? state0.product : null;
  ctx.comps = !!opts.comps;
  // The phone layout and type section: every app, and any SwiftUI build.
  ctx.phone = ctx.app || ctx.swift;
  ctx.brandName = String(ctx.content.brandName).replace(/\s+/g, ' ').trim();
  ctx.tagline = String(ctx.content.tagline).replace(/\s+/g, ' ').trim();
  ctx.rows = aibPaletteRows(ctx);
  ctx.scale = aibTypeScale(ctx);
  ctx.focusLow = !aibPrimaryBarred(ctx.roles) && modes.some(m => contrastRatio(aibPri(m.t), m.t.canvas) < 3);
  // App briefs: the UI kit as the Built view draws it (null without a DOM, then the static rows stand in).
  ctx.kitSnap = ctx.app && !opts.noProbe ? (opts.kitSnap || aibKitMeasure(state0, mode, !only)) : (opts.kitSnap || null);
  // names in the kit rows resolve against the palette of the mode the kit was drawn in
  ctx.kitMode = (ctx.kitSnap && modes.find(m => m.mode === ctx.kitSnap.mode)) || cur;
  ctx.kit = ctx.app && ctx.kitSnap ? aibKitModel(ctx, ctx.kitSnap) : null;
  if (ctx.kit) aibKitApply(ctx);
  // Names in prose: `--ink` for Web and Both, `Palette.ink` for SwiftUI only.
  ctx.tok = s => (ctx.swiftOnly ? aibSwiftTok(s) : String(s));
  return ctx;
}

// `--on-primary` -> `Palette.onPrimary` (SwiftUI-only briefs).
function aibSwiftName(token) {
  return String(token).replace(/^--/, '').replace(/-([a-z])/g, (m, c) => c.toUpperCase());
}
function aibSwiftTok(s) {
  return String(s).replace(/--[a-z]+(?:-[a-z]+)*/g, m => 'Palette.' + aibSwiftName(m));
}

/* ---------------- palette ---------------- */

const aibStrip = s => String(s || '').replace(/\.+\s*$/, '');

// Every colour token of the brief: { token, get(m), job, on: [[token, get(m)]] }.
function aibPaletteRows(ctx) {
  const { roles, build, def, modes } = ctx;
  const rows = [];
  const add = (token, get, job, on) => rows.push({ token, get, job, on: on || [] });
  const plainUse = { canvas: 'The screen background', ink: 'Text and icons', primary: 'The main action', secondary: 'Supporting controls', accent: 'The one spark' };
  const roleJob = k => {
    const use = aibStrip(aibAppText(ctx, roles[k].use, plainUse[k]));
    const never = aibStrip(aibAppText(ctx, roles[k].never, ''));
    return `${roles[k].job}. Use: ${use}.${never ? ` Never: ${never}.` : ''} Share ${roles[k].coverage}.`;
  };
  const printedNote = modes.some(m => m.t.printed)
    ? ` The brand primary is ${modes[0].t.primary}; ${def.name} prints it as this value, so use this one everywhere.` : '';
  add('--canvas', m => m.t.canvas, roleJob('canvas'), [['--ink', m => m.t.ink]]);
  add('--ink', m => m.t.ink, roleJob('ink'), []);
  add('--muted', m => m.t.muted, 'Secondary text, captions, placeholders (4.5:1 or better on the canvas).', []);
  add('--line', m => m.t.line, 'Hairlines, dividers, resting input borders.', []);
  add('--primary', m => aibPri(m.t), roleJob('primary') + printedNote, [['--on-primary', m => m.t.onPrimary]]);
  const so = build.secondaryOverride;
  const secNote = so && modes.every(m => aibInkValue(so, m))
    ? ` ${def.name} draws the secondary as ${so.note || 'its own colour, whatever the brand secondary is'}; use this value everywhere. The brand secondary (${ctx.state.colors.secondary}) appears only in the palette swatch.` : '';
  add('--secondary', m => m.t.secondary, roleJob('secondary') + secNote, [['--on-secondary', m => m.t.onSecondary]]);
  const ao = build.accentOverride;
  const accentNote = ao && modes.every(m => aibInkValue(ao, m))
    ? ` ${def.name} draws the accent as ${ao.note || 'its own colour, whatever the brand accent is'}; use this value everywhere. The brand accent (${ctx.state.colors.accent}) appears only in the palette swatch.` : '';
  add('--accent', m => m.t.accent, roleJob('accent') + accentNote, [['--on-accent', m => m.t.onAccent]]);
  add('--accent-ink', m => m.t.accentInk, 'The accent as text when it reaches 3:1 on the canvas; otherwise the ink, with the exact accent as a marker behind the word. Never a shaded or tinted accent.', []);
  (build.fixedInks || []).forEach(ink => {
    if (!modes.every(m => aibInkValue(ink, m))) return;
    const job = ink.decorativeOnly ? `Decorative only, never text or controls. ${aibAppText(ctx, ink.job, '')}`.trim() : aibAppText(ctx, ink.job, 'A fixed colour of this look.');
    add(ink.token, m => aibInkValue(ink, m), job, ink.on ? [['--on-' + ink.token.replace(/^--/, ''), m => aibInkValue(ink, m, 'on')]] : []);
  });
  add('--pri-tint', m => m.t.priTint, 'Quiet primary wash: selected background, hover on primary-linked items.', [['--ink', m => m.t.ink]]);
  add('--sec-tint', m => m.t.secTint, 'Quiet secondary wash: selected row, tonal fills, hover on secondary items.', [['--ink', m => m.t.ink]]);
  add('--error', m => aibError(m.t), aibErrorJob(modes[0].t), [['--on-error', m => aibDanger(m.t).on]]);
  if (modes.some(m => aibCardColor(def, m))) {
    const cardInk = aibNeedsCardInk(def, modes);
    const ci = (m, f) => { const v = aibCardInkValue(def, m); return v ? v[f] : f === 'ink' ? m.t.ink : m.t.muted; };
    add('--card', m => aibCardColor(def, m) || m.t.canvas, 'Card and panel fill (paper); everything else sits on the canvas.',
      cardInk ? [['--card-ink', m => ci(m, 'ink')], ['--card-muted', m => ci(m, 'muted')]] : [['--ink', m => m.t.ink]]);
    if (cardInk) {
      add('--card-ink', m => ci(m, 'ink'), 'Titles and body text on a card, list or sheet (the card ground is not the canvas, so --ink does not read on it in every mode). Text on the canvas stays --ink.', []);
      add('--card-muted', m => ci(m, 'muted'), 'Secondary text on a card, list or sheet (4.5:1 on --card).', []);
    }
  }
  const elevJob = {
    '--shadow': build.shadowToken ? `The hard offset shadow: a lip in a darker shade of the fill (the same colour as \`${build.shadowToken}\`), never the ink and never blurred.` : 'The hard offset shadow under every outlined surface.',
    '--shadow-lo': 'Dark half of the raised and recessed shadow pair (down-right on raised).',
    '--shadow-hi': 'Light half of the pair (up-left on raised).',
    '--rim': 'The 1pt light rim on glass surfaces.',
  };
  Object.keys(aibElevation(build, def, modes[0])).forEach(name => add(name, m => aibElevation(build, def, m)[name], elevJob[name], []));
  return rows;
}

function aibColorsTable(ctx0) {
  const darkFirst = ctx0.app && ctx0.mode === 'dark' && ctx0.modes.length > 1;
  const ctx = darkFirst ? Object.assign({}, ctx0, { modes: ctx0.modes.slice().reverse() }) : ctx0;
  const single = ctx.modes.length === 1;
  const head = single ? ['Token', 'Value', 'Job', 'On (text and icons on it)'] : ['Token'].concat(darkFirst ? ['Dark (default)', 'Light'] : ['Light', 'Dark'], ['Job', 'On (text and icons on it)']);
  const nm = tk => '`' + (ctx.swiftOnly ? aibSwiftTok(tk) : tk) + '`';
  const body = ctx.rows.map(r => {
    const vals = ctx.modes.map(m => r.get(m));
    const on = r.on.map(([tk, g]) => {
      const v = ctx.modes.map(m => g(m));
      return `${nm(tk)} ${single || v[0] === v[1] ? v[0] : v[0] + ' / ' + v[1]}`;
    }).join('; ') || 'none';
    return [nm(r.token), ...vals.map(v => '`' + v + '`'), ctx.tok(r.job), on];
  });
  return aibTable(head, body);
}


/* ---------------- type scale + fonts ---------------- */

// Prose that names a weight the face does not publish (a Do rule asking for 800 on a face that stops at
// 700) is rewritten to the weight the brief really uses, so the text never contradicts the table.
function aibFixWeights(ctx, text) {
  const sc = ctx.scale;
  const map = [[sc.wantH, sc.hw], [sc.wantB, sc.bw]];
  return String(text).replace(/\bweight (\d{3})\b/g, (m, n) => {
    const hit = map.find(([w, g]) => w === +n && w !== g);
    return hit ? `weight ${hit[1]}` : m;
  }).replace(/font-weight:\s*(\d{3})/g, (m, n) => {
    const face = +n === sc.wantH ? ctx.state.headingFont : sc.uiFace;
    return face ? `font-weight: ${abWeightNear(face, +n)}` : m;
  });
}

const AIB_WEIGHT_WORD = { 100: 'Thin', 200: 'ExtraLight', 300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold', 800: 'ExtraBold', 900: 'Black' };
const AIB_SWIFT_WEIGHT = { 100: '.ultraLight', 200: '.thin', 300: '.light', 400: '.regular', 500: '.medium', 600: '.semibold', 700: '.bold', 800: '.heavy', 900: '.black' };

function aibPostScript(face, weight, italic) {
  const fam = String(face.name).replace(/[^A-Za-z0-9]/g, '');
  if (italic) return weight === 400 ? fam + '-Italic' : fam + '-' + AIB_WEIGHT_WORD[weight] + 'Italic';
  return fam + '-' + (AIB_WEIGHT_WORD[weight] || 'Regular');
}

// The five text roles, with the faces and weights the brief states. Weights are always ones the
// face really publishes (abWeightNear). Roles map to Dynamic Type styles for SwiftUI.
function aibTypeScale(ctx) {
  const { state, def, ty, probe } = ctx;
  const hf = state.headingFont, bf = state.bodyFont;
  const named = n => FONTS.find(f => f.name === n) || null;
  const faceOf = kind => {
    if (!kind) return bf;
    const r = abResolveFace(kind, state);
    return r.name === 'System monospace' ? null : (named(r.name) || bf);
  };
  const uiFace = faceOf(def.type && def.type.ui);
  const labelFace = def.type && def.type.label ? faceOf(def.type.label) : bf;
  const hs = Math.round(ty.headingSize), bs = Math.round(ty.bodySize);
  const wantH = probe ? (+probe.h.weight || ty.headingWeight) : ty.headingWeight;
  const wantB = probe ? (+probe.b.weight || ty.bodyWeight) : ty.bodyWeight;
  const hw = abWeightNear(hf, wantH), bw = abWeightNear(bf, wantB);
  const italic = !!(probe && probe.h.style === 'italic');
  const tt = probe && probe.h.tt !== 'none' ? probe.h.tt : '';
  const ls = probe ? probe.h.ls : 0;
  const hnote = [tt, Math.abs(ls) >= 0.005 ? `tracking ${ls > 0 ? '+' : '-'}${Math.abs(ls)}em` : '', italic ? 'italic' : ''].filter(Boolean).join(', ');
  const rows = [
    { role: 'Display', face: hf, size: hs, weight: hw, italic, note: hnote, style: 'largeTitle', name: 'Display' },
    { role: 'Title', face: hf, size: Math.round(hs * 0.64), weight: hw, italic, note: hnote, style: 'title', name: 'Title' },
    { role: 'Headline', face: uiFace, size: bs + 1, weight: uiFace ? abWeightNear(uiFace, +(probe && probe.cta && probe.cta.weight) || 600) : 600, italic: false, note: 'buttons, tabs, field values', style: 'headline', name: 'Headline' },
    { role: 'Body', face: bf, size: bs, weight: bw, italic: false, note: '', style: 'body', name: 'Body' },
    { role: 'Caption', face: labelFace, size: Math.max(11, Math.round(bs * 0.8)), weight: labelFace ? abWeightNear(labelFace, bw) : 400, italic: false, note: 'labels, hints (`--muted`)', style: 'caption', name: 'Caption' },
  ];
  rows.forEach(r => { r.ps = r.face ? aibPostScript(r.face, r.weight, r.italic) : null; });
  // Which family at which weights, for "Fonts to bundle".
  const fams = aibFamsOf(rows, []);
  return { rows, fams, hw, bw, wantH, wantB, uiFace };
}

// Adds the rows' faces and weights to `fams` (a list of { face, weights, roles }); returns it.
function aibFamsOf(rows, fams) {
  rows.forEach(r => {
    if (!r.face) return;
    let f = fams.find(x => x.face.name === r.face.name);
    if (!f) fams.push(f = { face: r.face, weights: [], italic: false, roles: {} });
    const wk = r.weight + (r.italic ? 'i' : '');
    if (!f.weights.some(x => x.key === wk)) f.weights.push({ key: wk, weight: r.weight, italic: r.italic, ps: r.ps });
    const rl = (f.roles[wk] = f.roles[wk] || []);
    if (rl.indexOf(r.role) < 0) rl.push(r.role);
  });
  fams.forEach(f => f.weights.sort((a, b) => a.weight - b.weight));
  return fams;
}

const AIB_PHONE_STYLE = {
  'Display': 'largeTitle', 'Eyebrow': 'caption', 'Label': 'caption',
  'Large title': 'largeTitle', 'Title': 'title', 'Title 2': 'title2', 'Headline': 'headline', 'Body': 'body',
  'Callout': 'callout', 'Subhead': 'subheadline', 'Footnote': 'footnote', 'Caption': 'caption', 'Tab label': 'caption2',
};

// UI_KIT_PHONE's type rows with the brand's real display and body faces. Weights are ones the face
// publishes (abWeightNear); an italic display treatment carries through to the display roles.
function aibPhoneRows(ctx) {
  if (ctx._phone) return ctx._phone;
  if (typeof UI_KIT_PHONE === 'undefined' || !UI_KIT_PHONE || !Array.isArray(UI_KIT_PHONE.type)) return (ctx._phone = []);
  const { state, scale } = ctx;
  const italicDisplay = !!(scale.rows[0] && scale.rows[0].italic);
  ctx._phone = UI_KIT_PHONE.type.map(r => {
    const face = r.face === 'display' ? state.headingFont : state.bodyFont;
    const weight = abWeightNear(face, r.weight);
    const italic = r.face === 'display' && italicDisplay;
    const row = { role: r.role, name: r.role.replace(/\s+/g, ''), face, size: r.size, line: r.line, weight, italic, display: r.face === 'display',
      style: AIB_PHONE_STYLE[r.role] || 'body', ps: aibPostScript(face, weight, italic) };
    return ctx.kit ? aibKitPhoneRow(ctx, row) : row;
  });
  if (ctx.kit) ctx._phone = aibKitExtraRows(ctx).concat(ctx._phone);
  return ctx._phone;
}

function aibFamsFor(ctx) {
  if (!ctx.phone || !aibPhoneRows(ctx).length) return ctx.scale.fams;
  const base = ctx.app && (ctx.swiftOnly || ctx.kit) ? [] : ctx.scale.fams.map(f => ({ face: f.face, italic: f.italic, weights: f.weights.map(w => Object.assign({}, w)), roles: Object.keys(f.roles).reduce((o, k) => (o[k] = f.roles[k].slice(), o), {}) }));
  const fams = aibFamsOf(aibPhoneRows(ctx), base);
  if (ctx.kit && ctx.fontUse) {
    const extra = [];
    Object.keys(ctx.fontUse).forEach(fam => {
      const u = ctx.fontUse[fam];
      if (!u.face) return;
      Object.keys(u.weights).forEach(k => { const w = u.weights[k]; extra.push({ role: 'UI kit', face: u.face, weight: w.weight, italic: w.italic, ps: aibPostScript(u.face, w.weight, w.italic) }); });
    });
    aibFamsOf(extra, fams);
  }
  return fams;
}

function aibFontsUrl(fams) {
  const parts = fams.slice().sort((a, b) => a.face.name.localeCompare(b.face.name)).map(f => {
    const ws = Array.from(new Set(f.weights.map(w => w.weight))).sort((a, b) => a - b).join(';');
    const keepItal = f.weights.some(w => w.italic);
    return googleFamilyParam(keepItal ? f.face : Object.assign({}, f.face, { ital: undefined }), ws);
  });
  return `https://fonts.googleapis.com/css2?${parts.join('&')}&display=swap`;
}


/* ---------------- App text filter ---------------- */

// Board-derived prose (summaries, token jobs, notes) talks about the brand board: bands, heroes, art, patterns.
// An App-only brief drops those sentences and clauses; Website and Both keep the original text.
const AIB_APP_ART = /\bbands?\b|hero|illustration|pattern|striation|texture|plate|\bdeck\b|poster|glow behind|art box|\bart\b/i;

// Splits at commas and semicolons outside parentheses, keeping the separator in front of each clause.
function aibClauses(s) {
  const out = [];
  let depth = 0, start = 0, sep = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '(') depth++;
    else if (c === ')') depth = Math.max(0, depth - 1);
    else if (!depth && (c === ',' || c === ';') && s[i + 1] === ' ') {
      out.push({ sep, text: s.slice(start, i) });
      sep = c + ' ';
      start = i + 2;
      i++;
    }
  }
  out.push({ sep, text: s.slice(start) });
  return out;
}

// opts.subject: when the first clause of a sentence is art, the whole sentence goes (it is the subject).
function aibAppText(ctx, text, fallback, opts) {
  const src = String(text == null ? '' : text);
  if (!ctx.app || ctx.site || !AIB_APP_ART.test(src)) return src;
  const keepSentences = [];
  src.replace(/([.!?])\s+/g, '$1\u0001').split('\u0001').forEach(sent => {
    if (!AIB_APP_ART.test(sent)) { keepSentences.push(sent); return; }
    const m = /[.!?]$/.exec(sent), end = m ? m[0] : '';
    const clauses = aibClauses(m ? sent.slice(0, -1) : sent);
    if (opts && opts.subject && AIB_APP_ART.test(clauses[0].text)) return;
    const kept = [];
    clauses.forEach(c => {
      if (!AIB_APP_ART.test(c.text)) { kept.push(c); return; }
      const parts = c.text.split(/\s+and\s+/).filter(x => !AIB_APP_ART.test(x));
      if (parts.length) kept.push({ sep: c.sep, text: parts.join(' and ') });
    });
    if (!kept.length) return;
    keepSentences.push(kept.map((c, i) => (i ? c.sep : '') + c.text).join('') + end);
  });
  const out = keepSentences.join(' ').trim();
  return out || fallback || '';
}

/* ---------------- sections (each returns lines) ---------------- */

const aibUnit = ctx => (ctx.swiftOnly ? 'pt' : ctx.web && ctx.swift ? 'px (pt in SwiftUI)' : 'px');
const aibCap = s => String(s).charAt(0).toUpperCase() + String(s).slice(1);

// The brand's voice setting (app.js brandVoice); Style's voice when that is not loaded.
const aibVoice = state => (typeof brandVoice === 'function' ? brandVoice(state) : { mode: 'style', note: '', motto: '' });

function aibBrandLine(ctx) {
  const { def } = ctx;
  const plain = `${def.name}'s look, carried through the product's controls, surfaces and type.`;
  let summary = aibAppText(ctx, def.summary || '', plain, { subject: true });
  // When the leading sentence was art, the plain line stands in for it (blends add "Mixed with X." after it).
  if (summary !== (def.summary || '') && summary !== plain && !String(def.summary).startsWith(summary.split('. ')[0])) summary = plain + ' ' + summary;
  // The aesthetic's motto is its own voice: Style's voice keeps it, Own words swaps in the user's, Warmer drops it.
  const v = aibVoice(ctx.state);
  const motto = typeof specimenMotto === 'function' ? specimenMotto(ctx.state, def) : (v.mode === 'style' ? def.motto : v.motto);
  return `${ctx.brandName}: ${ctx.tagline} Aesthetic: ${def.name} (${def.descriptor}; ${def.influences}). ${summary}${motto ? ' ' + motto : ''}`;
}

// Voice: only when the owner moved off the style's own wording. A written voice note is Locked; Warmer is Guided.
function aibSecVoice(ctx) {
  const v = aibVoice(ctx.state), { def } = ctx;
  if (v.mode === 'style') return [];
  const mottoText = typeof specimenMotto === 'function' ? specimenMotto(ctx.state, def) : '';
  const mottoNote = def.motto && !mottoText ? ` Its motto ("${def.motto}") and the specimen phrases on its board and slides` : ' The specimen phrases on its board and slides';
  // Softer defaults the aesthetic offers for its specimen text (Advanced > Specimen copy edits are listed separately, Locked).
  const sugg = aibActiveCopy(ctx).flatMap(({ d }) => Object.keys(d.copy || {})
    .filter(k => d.copy[k].warm && !abCopyUser(d, k, ctx.state))
    .map(k => `  - ${d.copy[k].label || k}: "${abCopyRaw(d, k, ctx.state)}"`));
  return [`## Voice (${v.note ? 'Locked' : 'Guided'})`,
    `- The aesthetic governs visuals only.${mottoNote} are style placeholders, not brand copy: never use them in the product.`,
    ...(v.note ? [`- Voice, in the owner's words: "${v.note}". Write every line of copy in that voice.`] : []),
    ...(v.motto ? [`- Motto, used as written wherever a motto belongs: "${v.motto}"`] : []),
    ...(sugg.length ? ['- Where the style places specimen text, these softer phrases are suggestions, not required copy:'].concat(sugg) : []),
    '- Write copy warm, curious, plain and short: everyday words, no slogans, no formal or exclusive phrasing.',
    '- Keep severity in the layout and type, not in the words: the look stays as strict as the rules below say, and the copy does not copy it.'];
}

// The active aesthetics (base, plus the blend's donor) that declare specimen copy: [{ d }].
const aibActiveCopy = ctx => (typeof abActiveDefs === 'function' ? abActiveDefs(ctx.state) : []).filter(d => d.copy && Object.keys(d.copy).length).map(d => ({ d }));

// Specimen copy: only when the owner rewrote an entry (Brand > Advanced > Specimen copy). Locked.
function aibSecSpecimen(ctx) {
  const groups = aibActiveCopy(ctx).map(({ d }) => ({ d, rows: abCopyEdited(d, ctx.state) })).filter(g => g.rows.length);
  if (!groups.length) return [];
  const lines = ['## Specimen copy (Locked)', 'Use these exact phrases where the style places specimen text:'];
  groups.forEach(({ d, rows }) => {
    if (groups.length > 1) lines.push(`${d.name}:`);
    rows.forEach(r => lines.push(`- ${r.label} → "${r.text}"`));
  });
  return lines;
}

// Rules that hold for every brand (product imagery) plus the aesthetic's signature device when it has one.
function aibSecImagery(ctx) {
  const { def } = ctx;
  const where = ctx.site ? 'site' : 'app';
  return ['## Signature and product imagery',
    '- Embedded product screenshots, app icons and product imagery keep their own colours. They are exempt from the canvas and colour coverage budget and from the accent and primary limits; the studio frame around them (surfaces, captions, borders) follows the brand rules.',
    '- Coverage and whitespace targets apply to the brand\'s own surfaces, not to product pages that showcase a product\'s own visual system.',
    ...(def.signature ? [`- Signature: ${def.signature}. It appears once per ${where}, as the brand moment (for example the home hero or the footer), and is not repeated across pages or sections.`] : [])];
}

function aibSecBlend(ctx) {
  const { def, state } = ctx;
  const lines = def.blend && typeof blendBriefLines === 'function' ? blendBriefLines(state, def, ctx.cur.t) : [];
  if (!ctx.app) return lines;
  // Art and Patterns are board, deck and landing-page channels: not used in the app.
  return lines.map(l => {
    const m = /^\| (Art|Patterns) \|/.exec(l);
    if (!m) return l;
    return ctx.site ? l.replace(/ \|$/, ' Website only. |') : `| ${m[1]} | — | Not used in the app (website and brand board only). |`;
  });
}

function aibSecColors(ctx) {
  const { def } = ctx;
  const inkCta = aibInkCta(def);
  const barred = aibPrimaryBarred(ctx.roles);
  const out = ['## Colors', aibColorsTable(ctx), 'Where this aesthetic\'s colour rules and a component description disagree, the colour rules win.'];
  if (ctx.unusedRows && ctx.unusedRows.length) out.push(`Palette colours no app component draws (brand board and app icon only; they stay in \`:root\`): ${ctx.unusedRows.map(r => `\`${r.token}\` ${ctx.modes.map(m => r.get(m)).filter((v, i, a) => a.indexOf(v) === i).join(' / ')}`).join(', ')}.`);
  if (ctx.web && ctx.swift) out.push('SwiftUI name: `Palette.` plus the camelCase token (`--on-primary` is `Palette.onPrimary`).');
  if (ctx.kit) {
    const hlRule = aibHighlightRule(ctx);
    const pri = aibKitWhere(ctx, '--primary').map(x => x.split(' (')[0]).concat(/primary/i.test(hlRule) ? ['the highlight word'] : []);
    out.push(...[
      pri.length
        ? `- Primary budget: \`--primary\` appears only where the UI kit draws it (${pri.join(', ')}), never as extra fills, text or rules. Selection, toggles, tabs and focus are drawn as their kit rows say, not in extra primary.`
        : '- Primary budget: the UI kit draws no component in `--primary`; keep it out of the screens (palette and app icon only).',
      hlRule,
      '- Text colours are the ones each UI kit row states; no other colours, tints or gradients on text.',
    ].map(ctx.tok));
    return out;
  }
  out.push(...[
    inkCta
      ? '- One main call to action per view, filled `--ink` with a `--canvas` label. ' + (barred
        ? '`--primary` never fills a button and marks no state; it appears only as the Colors table says. '
        : '`--primary` never fills a button; it marks state (selected controls, switch on, focus ring, progress, status dot). ') + 'Secondary never fills it or sets body text; accent never goes on buttons, body text or borders.'
      : '- One primary-filled action per view. Secondary never fills it or sets body text; accent never goes on buttons, body text or borders.',
    aibHighlightRule(ctx),
    '- Text is set only in `--ink`, `--muted` or the `--on-*` token for its fill (plus the highlight word). No other colors, tints or gradients; hover and pressed use only the States and Materials below.',
  ].map(ctx.tok));
  return out;
}

function aibHighlightRule(ctx) {
  const { def } = ctx;
  const kind = aibHighlightKind(def);
  const appOnly = ctx.app && !ctx.site;
  if (ctx.app) {
    const one = 'use the brand\'s tagline unchanged as the welcome title (never reword it) and highlight its last word together with any full stop, wrapped in one span with `white-space: nowrap`';
    const S = ctx.kit && ctx.kit.screens;
    if (S && S.hl != null && !(S.displayCustom && !S.hl)) {
      return S.hl ? `- Highlight word: ${one}; draw it as the Built Welcome screen does: ${S.hl}.` : `- Highlight word: no highlight in this style; ${one.replace(/ and highlight[\s\S]*$/, '')}, every word looking the same.`;
    }
    if (S && S.displayCustom) {
      const sents = String(def.highlightNote || '').split(/(?<=\.)\s+/);
      const plain = sents.find(x => /running|UI text|in the app|in text/i.test(x));
      let how2 = plain ? plain.replace(/^In running UI text,?\s*/i, '').replace(/^the highlight word is\s*/i, '').replace(/\.$/, '') : /primary|inverse/i.test(def.highlightNote || '') ? 'a `--primary` block behind it with `--on-primary` text, padding 0 0.15em' : 'set in `--accent-ink`';
      let letters = '';
      if (S.tiles) return `- Highlight word: ${one}. The Built view builds the welcome title from tiles (see Built screens); the highlight is the last word's tiles sitting inside a hand-drawn marker loop, exactly as Built screens describes, with no swipe or block behind them.`;
      if (/swipe|highlighter|block|behind/i.test(how2)) {
        const L = ctx.modes.find(m => m.mode === 'light') || ctx.modes[0], D = ctx.modes.find(m => m.mode === 'dark') || L;
        const groundTk = /fluoro/i.test(how2) && aibTokenValue(ctx, '--ab-fluoro', L) ? '--ab-fluoro' : /primary/i.test(how2) ? '--primary' : '--accent';
        const textTk = /\bink\b/i.test(how2) ? '--ink' : /on-primary/.test(how2) ? '--on-primary' : '--ink';
        const raw = tk => `${aibTokenValue(ctx, tk, L)}|${aibTokenValue(ctx, tk, D)}`;
        const fx = aibPairFix(ctx, raw(textTk), raw(groundTk), true, 'highlight word', true);
        if (fx) how2 = how2.replace(/\bplain ink\b/i, `\`${fx.token}\` letters`);
        letters = fx ? ` The swipe is \`${groundTk}\`; set the word's letters in \`${fx.token}\` (${fx.ratios.map(r => r.toFixed(1)).join(' / ')}:1 light / dark), not \`${textTk}\`, which drops to ${Math.min(...fx.was).toFixed(1)}:1.` : ` The swipe is \`${groundTk}\` with \`${textTk}\` letters.`;
      }
      return `- Highlight word: ${one}.${letters} The Built view letters the welcome title in ${def.name}'s own drawn glyphs; in the app ${S.pixel ? 'set it in the bundled pixel face' : S.tiles ? 'build it from tiles' : 'set it as text'} as Built screens describes, and the last word is ${how2.charAt(0).toLowerCase() + how2.slice(1)}.`;
    }
    if (kind === 'custom' && /\bno highlight\b/i.test(def.highlightNote || '')) return `- Highlight word: no highlight in this style; ${one.replace(/ and highlight[\s\S]*$/, '')}.`;
    const note = String(def.highlightNote || '').replace(/\s*Use it once per view\.?$/, '').replace(/\.$/, '');
    const how = kind === 'band' ? 'a block of `--accent` behind it with `--on-accent` text, padding 0 0.15em'
      : kind === 'custom' && def.highlightNote && !AIB_APP_ART.test(def.highlightNote) ? note.charAt(0).toLowerCase() + note.slice(1) + '; padding 0 0.15em'
        : 'set in `--accent-ink`, never plain `--accent` as text';
    return `- Highlight word, once per screen: ${one}; ${how}.`;
  }
  if (kind === 'band') return `- Headline highlight word, once per view: a ${appOnly ? 'block' : 'band'} of \`--accent\` behind it with \`--on-accent\` text. Never accent-colored text.`;
  if (kind === 'custom' && !(appOnly && AIB_APP_ART.test(def.highlightNote || ''))) {
    return def.highlightNote
      ? '- Headline highlight word, once per view: ' + def.highlightNote.replace(/\s*Use it once per view\.?$/, '') + ' Never plain `--accent` as text.'
      : '- Headline highlight word, once per view: set in `--accent-ink`; never plain `--accent` as text.';
  }
  return '- Headline highlight word, once per view: set in `--accent-ink`. Never plain `--accent` as text.';
}

// Text drawn on the card ground names --card-ink / --card-muted when the brief defines them (the card's ground
// differs from the canvas so much that --ink / --muted would not read on it).
function aibOnCard(ctx, text) {
  if (!ctx.rows || !ctx.rows.some(x => x.token === '--card-ink')) return text;
  return String(text).replace(/--ink(?![\w-])/g, '--card-ink').replace(/--muted(?![\w-])/g, '--card-muted');
}

function aibSecComponents(ctx) {
  const { def, cur } = ctx;
  const all = aibComponentRows(cur.t, def, cur.extras).map(r => r.map(c => ctx.tok(String(c).replace(/--[a-z-]+ \(#[0-9a-f]{6}\)/i, ctx.rows.some(x => x.token === '--card') ? '--card' : '--canvas'))))
    .map(r => (/^(Card|List row)/.test(r[0]) && /^--card(?![\w-])/.test(r[1].replace(/`/g, '')) ? [r[0], r[1], aibOnCard(ctx, r[2]), r[3]] : r));
  const by = p => all.find(r => r[0].indexOf(p) === 0);
  const rest = by('Input field, rest'), foc = by('Input field, focus'), tag = by('Tag'), badge = by('Badge');
  const rows = [by('Card'), by('Primary button') || by('Main button'), by('Secondary button'),
    ['Input field (rest | focus)', rest[1], rest[2], `${rest[3]} | ${foc[3]}`],
    by('Segmented control, selected'), by('Toggle, on'),
    ['Tag | Badge', `${tag[1]} | ${badge[1]}`, `${tag[2]} | ${badge[2]}`, 'none'],
  ].filter(Boolean);
  return ['## Components', aibTable(['Element', 'Fill', 'Text', 'Edge'], rows)];
}

/* ---- App UI rules, the UI kit, phone layout and type ---- */

function aibSecAppRules(ctx) {
  if (!ctx.app || typeof UI_KIT_SURFACES === 'undefined') return [];
  const out = ['## App UI rules', UI_KIT_SURFACES.app.rule,
    'The brand board, deck and landing page show art for the brand\'s identity and marketing; none of it belongs in the app.',
    'Screens are composed from the UI kit and the phone layout below: pick the component for the need, set text in the type scale, and leave the rest to the tokens.'];
  out.push('Focus rings appear on keyboard focus only (`:focus-visible` on the web, the system focus on SwiftUI), never on tap or click; disabled controls take no focus and no press response.');
  if (ctx.site) out.push(`Website (the other surface of this brief): ${UI_KIT_SURFACES.web.rule}`);
  if (ctx.kit) out.push('', ...aibSecSignature(ctx));
  return out;
}

// Website-only briefs: what the hero shows (Both carries the same rule inside App UI rules).
function aibSecWebRules(ctx) {
  if (ctx.app || !ctx.site || typeof UI_KIT_SURFACES === 'undefined') return [];
  return ['## Website rules', UI_KIT_SURFACES.web.rule];
}

// One row of the UI kit table per UI_KIT item, from the same data as the Components table where a row exists.
function aibKitRowData(ctx) {
  const { def, cur } = ctx;
  const P = (typeof UI_KIT_PHONE !== 'undefined' && UI_KIT_PHONE) || {};
  const all = aibComponentRows(cur.t, def, cur.extras).map(r => r.map(c => String(c).replace(/--[a-z-]+ \(#[0-9a-f]{6}\)/i, ctx.rows.some(x => x.token === '--card') ? '--card' : '--canvas')));
  const by = p => all.find(r => r[0].indexOf(p) === 0) || [p, '--canvas', '--ink', 'none'];
  const card = by('Card'), prim = by('Primary button') && all.find(r => /^(Primary|Main) button/.test(r[0])) || by('Primary button');
  const sec = by('Secondary button'), ghost = by('Ghost'), rest = by('Input field, rest'), foc = by('Input field, focus');
  const segOn = by('Segmented control, selected'), tog = by('Toggle, on'), tag = by('Tag'), badge = by('Badge');
  const prog = by('Progress'), listSel = by('List row, selected');
  const PRI = aibPrimaryBarred(ctx.roles) ? '--ink' : '--primary';   // the colour rules win over the generic rows
  const secOff = aibPaletteOnly(ctx.roles, 'secondary'), accOff = aibPaletteOnly(ctx.roles, 'accent');
  const edgeTok = card[3] === '--ink' ? '--ink' : '--line';
  const r = ctx.radius, u = 'pt';
  const cn = n => (n >= 999 ? 'pill' : n + u);
  const corner = n => `corners ${cn(n)}`;
  const hl = n => `${n}${u} high`;
  const pill = corner(r.control);
  const tap = P.tapTarget || 44;
  
  const edge = (e, c) => `${e === 'none' ? 'no edge' : e}; ${c}`;
  return {
    'btn-primary': [prim[1], prim[2], edge(prim[3], pill), `${hl(P.buttonHeight || 52)}, full width, min ${tap}pt wide`],
    'btn-secondary': [sec[1], sec[2], edge(sec[3], pill), `${hl(P.buttonHeight || 52)}, full width`],
    'btn-text': ['none', ghost[2], 'no edge', `label only, ${tap}pt hit area`],
    'btn-destructive': (dz => dz.fill
      ? ['--error (pressed: --ink at 7% over it)', '--on-error', edge('none', pill), `${hl(P.buttonHeight || 52)}; always confirm in a sheet that names the action`]
      : dz.role
        ? ['none (pressed: --error at 10% over --canvas)', '--error', edge('1.5px --error', pill), `${hl(P.buttonHeight || 52)}; outline, never filled: the reddish colour is the primary, and destructive must never look like the main action; confirm in a sheet that names the action`]
        : ['none (pressed: --ink at 8% over --canvas)', '--ink', edge('1.5px --ink', pill), `${hl(P.buttonHeight || 52)}; outline, since the palette has no red: the label and a confirmation sheet that names the action carry the meaning`])(aibDanger(cur.t)),
    'btn-icon': ['none (pressed: `--sec-tint`)', '--ink (icon)', 'no edge', `24pt icon in a ${tap}x${tap}pt hit area`],
    'field': [rest[1], rest[2], edge(`rest ${rest[3]}; focus ${foc[3]}; error 1px --error plus the message below in --error`, corner(r.field)), `${hl(P.fieldHeight || 48)}; label above in Footnote, --muted`],
    'search': [rest[1], '--ink (placeholder: --muted); leading icon --muted', edge(`rest ${rest[3]}; focus ${foc[3]}`, corner(r.field)), hl(P.fieldHeight || 48)],
    'select': [rest[1], '--ink (value); chevron --muted', edge(`rest ${rest[3]}; open ${foc[3]}`, corner(r.field)), hl(P.fieldHeight || 48)],
    'checkbox': [`off: ${rest[1]}; on: ${segOn[1]}`, `check mark ${segOn[2]}`, edge(`off ${rest[3]}; on ${segOn[3]}`, `corners ${Math.min(r.control, 6)}${u}`), `24pt box, ${tap}pt hit area`],
    'radio': [`off: ${rest[1]}; on: ${segOn[1]}`, `dot ${segOn[2]}`, edge(`off ${rest[3]}; on ${segOn[3]}`, 'circle'), `24pt, ${tap}pt hit area`],
    'toggle': [`on: ${tog[1]}; off: ${by('Toggle, off')[1]}`, '--ink (label beside it)', 'no edge; pill', `51x31pt, ${tap}pt hit area`],
    'segmented': [`selected: ${segOn[1]}; unselected: transparent`, `selected ${segOn[2]}; unselected --muted`, edge(`selected ${segOn[3]}`, corner(r.control)), `${hl(tap)}, equal-width segments`],
    'slider': [`track --line; filled part ${PRI}`, 'n/a', edge(`thumb ${PRI}`, 'pill track'), `4pt track, 28pt thumb, ${tap}pt hit area`],
    'card': [card[1], /^--card(?![\w-])/.test(card[1]) ? aibOnCard(ctx, card[2]) : card[2], edge(card[3] === 'none' ? 'none' : '1px ' + card[3], corner(r.card)), `padding ${P.cardPadding || 20}pt`],
    'list': [`${card[1]}; selected: ${listSel[1]}`, /^--card(?![\w-])/.test(card[1]) ? aibOnCard(ctx, '--ink (meta and chevron: --muted)') : '--ink (meta and chevron: --muted)', edge(`bottom 1px --line between rows; selected: ${listSel[3]}`, 'rows share the list\'s ' + corner(r.card)), `${hl(P.rowHeight || 52)}, full width`],
    'callout': [`info ${PRI} at 12% over --canvas; success ${secOff ? '--ink' : '--secondary'} at 12%; warning ${accOff ? '--ink' : '--accent'} at 12%; ${aibDanger(cur.t).role ? 'error --error at 12% over --canvas' : 'error --canvas'}`, '--ink (message), with an icon and a label word so status is never colour alone; icon in the tone, shaded to 3:1', edge(`1px of the tone at 40% (error: ${aibDanger(cur.t).role ? '1px --error' : '2px --ink'})`, corner(r.card)), 'padding 16pt, full width; palette colours only, no stock green, amber or red'],
    'sheet': [card[1], /^--card(?![\w-])/.test(card[1]) ? aibOnCard(ctx, card[2]) : card[2], edge(card[3] === 'none' ? 'none' : '1px ' + card[3], `${corner(r.card)} on the top corners`), `padding ${P.cardPadding || 20}pt; grabber 36x5pt in --line; scrim --ink at 40%`],
    'divider': ['--line', 'section label: --muted (Caption)', 'n/a', `1px; ${P.sectionGap || 28}pt above a section label`],
    'topbar': ['--canvas', '--ink (title, icons)', 'bottom 1px --line once content scrolls under it', `${tap}pt bar under the status area; one Large title below it`],
    'tabbar': ['--canvas', `selected --ink with a small ${PRI} pill under the label; unselected --muted`, 'top 1px --line', `${P.tabBarHeight || 83}pt including the home indicator`],
    'tabs': ['none', 'selected --ink; unselected --muted', `selected: 2px ${PRI} under the label`, hl(tap)],
    'badge': [`neutral: ${tag[1]}; accent: ${badge[1]}`, `neutral ${tag[2]}; accent ${badge[2]}`, edge('none', 'pill'), '20pt high, Caption text'],
    'progress': [prog[1], 'n/a', edge(prog[3], 'pill'), '6pt high, full width'],
    'toast': ['--ink', '--canvas', edge('none', corner(r.card)), `min 48pt high, ${P.margin || 20}pt from the side edges, gone after 3 s`],
    'empty': ['none', 'title --ink (Title 2); message --muted (Subhead); icon --muted', 'n/a', 'centred; one main button; ' + (ctx.site ? 'an icon, never an illustration' : 'an icon only')],
    'avatar': [secOff ? '--line' : '--secondary', secOff ? '--ink (initials)' : '--on-secondary (initials)', edge('none', 'circle'), '32, 40 or 56pt'],
  };
}

// Where a kit cell names a colour token and the brand ships two palettes, the first mention of each token
// carries its light and dark values: `--card` (#fff / #1c1b1f). Same token-to-value map as the Colors table.
function aibKitDark(ctx, cell) {
  if (!ctx.modes || ctx.modes.length < 2 || !ctx.rows) return cell;
  const seen = {};
  return String(cell).replace(/--[a-z]+(?:-[a-z]+)*/g, tk => {
    const r = ctx.rows.find(x => x.token === tk);
    if (!r || seen[tk]) return tk;
    seen[tk] = 1;
    const v = ctx.modes.map(m => r.get(m));
    return v[0] === v[1] ? tk : `${tk} (${v[0]} / ${v[1]})`;
  });
}

function aibSecKit(ctx) {
  if (typeof UI_KIT === 'undefined' || !Array.isArray(UI_KIT)) return aibSecComponents(ctx);
  if (ctx.kit) return aibSecKitMeasured(ctx);
  const data = aibKitRowData(ctx);
  const out = ['## UI kit',
    'Every control and container in the product is one of these components, drawn exactly as below. Fill, text and edge are tokens from Colors; corners and shadows come from Shape and materials; text sizes come from Phone layout and type. Sizes are points at the 390 x 844 reference screen (1pt = 1 CSS px). Every state follows the States table.'];
  if (ctx.app) out.push('These are the generic kit rows: this brief was built without a page to render the style\'s UI kit in, so the measured rows are missing (copy the brief from the app to get them).');
  if (ctx.swift) out.push('Native rows: use the system control and only tint it (accent, track, label font); keep its size, motion and behaviour. Custom rows: draw them exactly as described.');
  UI_KIT.forEach(g => {
    const rows = g.items.map(it => {
      const d = data[it.id] || ['--canvas', '--ink', 'none', ' '];
      const cells = d.map((c, i) => ctx.tok(i < 3 ? aibKitDark(ctx, c) : c));
      const ios = /^native:/.test(it.ios || '') ? `Native \`${it.ios.slice(7)}\`, tinted` : 'Custom';
      return [it.name, it.use, ...(ctx.swift ? [ios] : []), ...cells, it.states.join(', ')];
    });
    out.push('', `### ${g.group}`, aibTable(['Element', 'Use'].concat(ctx.swift ? ['iOS'] : [], ['Fill', 'Text', 'Edge/Corner', 'Size', 'States']), rows));
  });
  return out;
}

// The five standard screen layouts from UI_KIT_SCREENS, blocks named by their UI_KIT component.
function aibSecScreens(ctx) {
  if (!ctx.app || typeof UI_KIT === 'undefined' || typeof UI_KIT_SCREENS === 'undefined' || !Array.isArray(UI_KIT_SCREENS)) return [];
  const names = { title: 'Large title', body: 'Body text', section: 'Section label' };
  UI_KIT.forEach(g => g.items.forEach(it => { names[it.id] = it.name; }));
  const out = ['## Screen layouts'];
  const built = ctx.kit && ctx.kit.screens;
  UI_KIT_SCREENS.forEach(sc => {
    if (built && sc.id !== 'list') {
      out.push('', `### ${sc.name}`, sc.id === 'onboarding' ? 'As the Built Welcome screen (see Built screens).' : sc.id === 'settings' ? 'As the Settings composition under Built screens.'
        : `${sc.use} Top to bottom: ${sc.blocks.map(b => names[b] || b).join(', ')}. ${sc.rules[sc.rules.length - 1]}`);
      return;
    }
    const more = { list: ['Show at least 6 rows so the screen reads as a real list.'], settings: ['At least 3 groups.', 'Settings is a tab: the screen shows the tab bar.'] }[sc.id] || [];
    out.push('', `### ${sc.name}`, sc.use, '', ...sc.blocks.map((b, i) => `${i + 1}. ${names[b] || b}`), '', ...sc.rules.concat(more).map(r => `- ${r}`));
  });
  out.push('', 'These five are starting points, not a fixed list: design each screen for its job from the kit\'s components, as one of these or a combination, with no hero areas or decorative headers.');
  return out;
}

// ## Built screens: the Mobile app tab's Welcome and Home phones, measured, their sample copy, and a Settings screen.
function aibSecBuilt(ctx) {
  const S = ctx.kit && ctx.kit.screens;
  if (!S || (!S.welcome.length && !S.home.length)) return [];
  const ch = ctx.kit.chrome;
  const top = Math.round(ch.status + ch.topbar + (ch.topRule || 0)), bottom = 844 - Math.round(ch.tabbar);
  const out = ['## Built screens', 'A sample composition: the Mobile app tab of the Built view, measured at 390 x 844 and listed top to bottom; every y is in pt from the top of the screen. It shows how this style builds a phone screen. Match its components, type ladder and spacing rhythm, not the sample app\'s content, screen list or exact positions; the product\'s own screens are designed for its jobs. Components are drawn as their UI kit rows. Where this composition differs from Screen layouts (for example Home shows 3 list rows), it shows the style\'s intended density.'];
  const where = S.arrows.welcome && S.arrows.home ? 'on every Primary button (Welcome and Home)' : S.arrows.welcome ? 'on the Welcome Primary button only' : S.arrows.home ? 'on the Home card\'s Primary button only' : '';
  if (where) out.push(`The Primary button's trailing mark (see its kit row) appears ${where}; other buttons have none.`);
  if (S.welcome.length) out.push('', '### Welcome', ...S.welcome.map((l, i) => `${i + 1}. ${l}`));
  if (S.copyW.length) out.push(`Sample copy (keep the structure and length, write your app's content): ${S.copyW.join('; ')}.`);
  if (S.home.length) out.push('', '### Home', ...S.home.map((l, i) => `${i + 1}. ${l}`));
  if (S.copyH.length) out.push(`Sample copy (keep the structure and length, write your app's content): ${S.copyH.join('; ')}.`);
  // a composition that shows the destructive button at rest on 390 x 844, from the measured heights
  const R = ctx.kit.rows;
  const row = ch.rowPlain || ch.rowDetail || 52, label = R.divider ? Math.round(parseFloat(R.divider.main.lh) || 18) : 18, title = 41, danger = R['btn-destructive'] ? Math.round(R['btn-destructive'].main.h) : 52;
  const avail = bottom - top;
  const fits = g => 8 + title + 16 + g.reduce((a, n, i) => a + (i ? 28 : 0) + label + 8 + n * row, 0) + 28 + danger + 16 <= avail;
  const groups = [[3, 2], [2, 2], [2, 1], [1, 1]].find(fits) || [1, 1];
  const used = 8 + title + 16 + groups.reduce((a, n, i) => a + (i ? 28 : 0) + label + 8 + n * row, 0) + 28 + danger;
  out.push('', '### Settings (compose from the kit)',
    `1. Status bar ${Math.round(ch.status)}pt, then the Top bar (pinned) with only the back button${ch.back ? ` (${ch.back})` : ''}.`,
    `2. Below the top bar, one scroll container (\`flex: 1; overflow-y: auto\`) from the top bar's bottom (${top}pt from the top of the screen) to the tab bar's top (${bottom}pt). Inside it, flowing: the Large title "Settings" 8pt down; 16pt below it the first group, a section label (${label}pt) with its list 8pt below it, ${groups[0]} rows of ${row}pt (account rows: label, value and chevron); 28pt below it the second group, ${groups[1]} row${groups[1] > 1 ? 's' : ''}${groups[1] > 1 ? ', the last one a label with a Toggle' : ' (a label with a Toggle)'}; then 28pt below it the Destructive button ("Sign out", ${danger}pt) alone. That totals ${used}pt of the ${avail}pt between the bars, so "Sign out" is visible at rest; more groups (About, Help) go below it only if they still leave it on screen, otherwise above it with the screen scrolling.`,
    `3. Every group has its section label. Lists group as the Home list does. ${(S.home && /no rule/.test(aibListWords(ctx.kit.screens.homeList || null, c => c) || 'no rule')) || !(ctx.kit.screens.homeList && (ctx.kit.screens.homeList.dv || ctx.kit.screens.homeList.rowRule)) ? 'Rows have no dividers, as the Home list.' : 'Rows without a lead start their divider 16pt in from the left edge of the list.'} The Toggle row is shown on.`,
    '4. The tab bar stays at the bottom (Settings is a tab); nothing pinned overlaps it.');
  return out;
}

function aibSecPhone(ctx) {
  const rows = aibPhoneRows(ctx);
  const P = (typeof UI_KIT_PHONE !== 'undefined' && UI_KIT_PHONE) || null;
  if (!P || !rows.length) return [];
  const out = ['## Phone layout and type'];
  const head = ['Role', 'Face', 'Size pt', 'Line', 'Weight'].concat(ctx.swift ? ['SwiftUI style'] : []);
  const faceCell = r => (r.face ? r.face.name + (ctx.swift ? ` (\`${r.ps}\`)` : '') + (r.display ? ' (display)' : r.face === ctx.state.bodyFont ? ' (body)' : '') : r.sysLabel || 'System monospace (`ui-monospace`)') + (r.note ? `, ${r.note}` : '');
  const body = rows.map(r => [r.role, faceCell(r), r.size, r.line, (r.wcell || r.weight) + (r.italic ? ' italic' : '')].concat(ctx.swift ? ['.' + r.style] : []));
  out.push(aibTable(head, body));
  const note = !ctx.kit && ctx.scale.rows[0] && ctx.scale.rows[0].note;
  if (note) out.push(`- Display roles (Large title, Title, Title 2): ${ctx.tok(note)}.`);
  if (ctx.swift) out.push(ctx.app
    ? '- Each role is a `Font.brand<Role>` in Theme.swift (for example `Font.brandLargeTitle`), a custom font that scales with Dynamic Type through its text style.'
    : '- Build each role as `Font.custom(<PostScript name>, size: <Size>, relativeTo: <style>)` so it scales with Dynamic Type.');
  const space = Array.from(new Set(P.spacing.concat(P.sectionGap ? [P.sectionGap] : []))).sort((a, b) => a - b);
  if (ctx.app) {
    const ch = ctx.kit ? ctx.kit.chrome : { status: 54, topbar: 44 };
    out.push(`- Phone chrome: the status bar takes ${Math.round(ch.status) || 54}pt at the top and the home indicator ${34}pt at the bottom; nothing tappable sits in either. The top bar is ${Math.round(ch.topbar) || 44}pt high${ch.topRule ? ` plus its ${ch.topRule}pt bottom rule` : ''}, under the status bar. At rest it shows only the back button and icon actions, with the Large title below it in the content; the title appears in the top bar (Headline size) only once the Large title has scrolled under it.`);
    if (ctx.kit) {
      const S = ctx.kit.screens, nm = aibKitNamer(ctx);
      const cols = [['welcome title', S && S.display], ['screen titles', ctx.kit.chrome.titleBox], ['eyebrows', S && S.eyebrow]].filter(x => x[1]).map(([a, o]) => `${a} ${nm(o.color)}`);
      if (cols.length) out.push(`- Title colours: ${cols.join(', ')}.`);
    }
  }
  const K = ctx.kit, R = K ? K.rows : {};
  const h = (id, d) => (R[id] ? Math.round(R[id].main.h) : d);
  const rowsTxt = K && K.chrome.rowDetail ? (K.chrome.rowPlain && K.chrome.rowPlain !== K.chrome.rowDetail ? `list rows ${K.chrome.rowPlain}pt with one line and ${K.chrome.rowDetail}pt with a detail line` : `list rows ${K.chrome.rowDetail}pt`) : `list rows ${P.rowHeight}pt`;
  out.push(`- Layout: ${P.margin}pt side margins on every screen. Spacing comes from ${space.join(', ')}pt only; ${P.sectionGap}pt between sections. Sizes: buttons ${h('btn-primary', P.buttonHeight)}pt, fields ${h('field', P.fieldHeight)}pt, ${rowsTxt}, card insides ${K && K.screens ? 'as the Home card in Built screens' : R.card ? aibKitPad(R.card.main).replace(/^padding /, '') || '0' : P.cardPadding + 'pt'}, tab bar ${K ? Math.round(K.chrome.tabbar) : P.tabBarHeight}pt, nothing tappable under ${P.tapTarget}pt.`);
  out.push('- Support Dynamic Type; never let a word split or a label truncate; one Large title per screen.');
  if (!ctx.kit) (Array.isArray(ctx.def.typeNotes) ? ctx.def.typeNotes : ctx.def.typeNotes ? [ctx.def.typeNotes] : []).forEach(n => out.push(`- ${aibFixWeights(ctx, n)}`));
  return out;
}

function aibSecType(ctx) {
  const { def, scale } = ctx;
  if (ctx.app && !ctx.site && aibPhoneRows(ctx).length) return [];
  const out = [ctx.app && aibPhoneRows(ctx).length ? '## Website type' : '## Type'];
  const head = ['Role', 'Face', 'Size', 'Weight', 'Notes'].concat(ctx.swift ? ['SwiftUI style'] : []);
  const rows = scale.rows.map(r => {
    const f = r.face ? r.face.name : 'System monospace (`ui-monospace`)';
    return [r.role, f, r.size + (ctx.swiftOnly ? 'pt' : 'px'), r.weight + (r.italic ? ' italic' : ''), ctx.tok(r.note) || ' '].concat(ctx.swift ? ['.' + r.style] : []);
  });
  out.push(aibTable(head, rows));
  if (ctx.swift) out.push('Each role is a `Font.brand<Role>` that scales with Dynamic Type through its text style; keep layouts flexible up to the accessibility sizes.');
  (Array.isArray(def.typeNotes) ? def.typeNotes : def.typeNotes ? [def.typeNotes] : []).forEach(n => out.push(`- ${aibFixWeights(ctx, n)}`));
  return out;
}

// Material recipes, mode-agnostic: colours the five roles and the elevation tokens carry are written as
// token references, the aesthetic's own colour variables as `var(--ab-x)` (listed per mode in
// ctx.mat.vars), anything else (numbers, images) as the literal.
const AIB_MAT_TOKEN = {
  canvas: '--canvas', ink: '--ink', muted: '--muted', line: '--line', primary: '--primary', printPrimary: '--primary',
  onPrimary: '--on-primary', secondary: '--secondary', onSecondary: '--on-secondary', accent: '--accent', onAccent: '--on-accent',
  accentInk: '--accent-ink', priTint: '--pri-tint', secTint: '--sec-tint',
};

const AIB_MAT_ALIAS = { '--ab-lo': '--shadow-lo', '--ab-hi': '--shadow-hi', '--ab-rim': '--rim', '--ab-paper': '--card' };

function aibMaterials(ctx) {
  if (ctx._mat) return ctx._mat;
  const { def, modes } = ctx;
  const mats = def.materials || [];
  const matDonor = def.blend && def.blend.channels.material ? def.blend.donor : null;
  const extrasOf = m => (matDonor && typeof blendDonorTokens === 'function' ? blendDonorTokens(matDonor, m.t, ctx.state) : m.extras);
  const used = new Map();
  const unresolved = [];
  const cur = ctx.cur;
  const exCur = extrasOf(cur);
  const tokRef = name => (ctx.swiftOnly ? aibSwiftTok(name) : `var(${name})`);
  const hasShadow = ctx.rows.some(r => r.token === '--shadow');
  const lines = mats.map(m => {
    const css = String(m.css).replace(/\{([A-Za-z][A-Za-z0-9]*)\}/g, (whole, name) => {
      if (AIB_MAT_TOKEN[name]) return tokRef(AIB_MAT_TOKEN[name]);
      const own = cur.t[name];
      if (typeof own === 'string' || typeof own === 'number') return String(own);
      const key = '--ab-' + abKebab(name);
      const v = exCur[key];
      if (v == null) { unresolved.push(name); return whole; }
      const str = String(v).trim();
      const alias = AIB_MAT_ALIAS[key];
      if (alias && ctx.rows.some(r => r.token === alias)) return ctx.swiftOnly ? aibSwiftTok(alias) : `var(${alias})`;
      if (AIB_HEX.test(str) || /^rgba?\(/.test(str)) {
        if (!used.has(key)) used.set(key, modes.map(mm => String(extrasOf(mm)[key]).trim()));
        return ctx.swiftOnly ? key : `var(${key})`;
      }
      return str;
    });
    // A hard shadow is --shadow (black in dark mode), not the ink.
    const shadowed = hasShadow ? css.replace(/((?:-?\d+(?:\.\d+)?(?:px)?\s+){2}0(?:px)?\s+)(var\(--ink\)|Palette\.ink)/g, (mm, a) => a + tokRef('--shadow')) : css;
    return `- **${m.name}**: ${aibFixWeights(ctx, aibCompactUri(shadowed))}`;
  });
  if (unresolved.length) console.warn(`buildAiBrief: unresolved material placeholders for ${def.key}: ${unresolved.join(', ')}`);
  ctx._mat = { lines, vars: Array.from(used.entries()) };
  return ctx._mat;
}

function aibSecShape(ctx) {
  const { build, radius } = ctx;
  const u = aibUnit(ctx);
  if (ctx.kit) {
    // The UI kit rows are the one definition of corners, edges and shadows; board recipes are website material.
    if (!ctx.site) return ctx.swift ? ['## Shape and materials', 'Corners, edges and shadows are the UI kit rows above; use `style: .continuous` on SwiftUI rounded shapes.', aibSwiftCssNote()] : [];
    const lines = aibMaterials(ctx).lines;
    return ['## Shape and materials', 'App: the UI kit rows above are the whole definition of corners, edges and shadows.',
      ...(lines.length ? ['', 'Website only (board recipes, never in app screens):', ...lines] : [])].concat(ctx.swift ? [aibSwiftCssNote()] : []);
  }
  const mat = aibMaterials(ctx);
  const out = ['## Shape and materials',
    `${aibAppText(ctx, build.surface, '')} Corners: controls ${radius.control}${u}, fields ${radius.field}${u}, cards ${radius.card}${u}${build.line ? `; outline ${build.line}${u}` : ''}${ctx.swift ? '; use `style: .continuous` on SwiftUI rounded shapes' : ''}.${mat.lines.length ? ' Recipes are CSS values; ' + (ctx.swiftOnly ? 'names are the tokens and values in this brief' : '`var()` names are the tokens and variables in this brief') + '.' : ''}`];
  // App screens take no art: recipes named for a hero, plate, band, pattern, texture, glow or illustration are
  // website-only (listed apart for Both, left out for App).
  const artLine = l => AIB_ART_RULE.test(((/^- \*\*([^*]*)\*\*/.exec(l)) || [])[1] || '') || /\bart\b/i.test(((/^- \*\*([^*]*)\*\*/.exec(l)) || [])[1] || '')
    || /hero|illustration|striation|pattern|\bband\b/i.test(l.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^- \*\*[^*]*\*\*/, ''));
  // The CSS comment after a recipe describes the board; for App-only it goes through the same filter as other prose.
  const appComment = l => (ctx.site ? l : l.replace(/\s*\/\*([\s\S]*?)\*\//g, (m, c) => { const t = aibAppText(ctx, c.trim(), ''); return t ? ` /* ${t} */` : ''; }));
  const keepLines = ctx.app ? mat.lines.filter(l => !artLine(l)).map(appComment) : mat.lines;
  const artLines = ctx.app ? mat.lines.filter(artLine) : [];
  if (keepLines.length) out.push(...keepLines);
  else out.push('No special materials: flat fills from the tokens.');
  if (ctx.site && artLines.length) out.push('', 'Website only (never in app screens):', ...artLines);
  if (ctx.swift) out.push(aibSwiftCssNote());
  return out;
}

function aibSwiftCssNote() {
  return 'CSS to SwiftUI: a box-shadow blur B is `.shadow(radius: B/2)`; `inset` shadows use the `Recessed` modifier in Theme.swift; `linear-gradient(135deg, ...)` is `LinearGradient(startPoint: .topLeading, endPoint: .bottomTrailing)`; `rgba()` is `Color(.sRGB, red:, green:, blue:, opacity:)`; `backdrop-filter` is a SwiftUI `Material`.';
}

function aibSecModes(ctx) {
  const { build, only, mode, modes } = ctx;
  const out = ['## Light and dark'];
  if (only) {
    out.push(`${aibCap(only)} only, because ${build.modes.because}. Ship the ${only} palette alone: ${ctx.web ? '`color-scheme: ' + only + '`' : ''}${ctx.web && ctx.swift ? '; ' : ''}${ctx.swift ? '`.preferredColorScheme(.' + only + ')` at the app root' : ''}. Do not build a ${only === 'dark' ? 'light' : 'dark'} theme.`);
    return out;
  }
  if (ctx.app) {
    const other = mode === 'dark' ? 'light' : 'dark';
    out.push(`The default look is ${mode}, as the Built screens draw it${ctx.web ? `: \`color-scheme: ${mode}\` and the ${mode} values on \`:root\`` : ''}. ${aibCap(other)} is used only ${mode === 'light' ? 'when the system asks for it' : 'when the user chooses it'}${ctx.web ? ` (\`[data-theme="${other}"]\`${mode === 'light' ? ', set from `prefers-color-scheme: dark` by the script under Tokens' : ''})` : ''}${ctx.swift ? `${ctx.web ? '. SwiftUI: ' : ': '}${mode === 'dark' ? 'set `.preferredColorScheme(.dark)` at the app root unless the user picks light' : 'adaptive colours from Theme.swift follow the system appearance'}` : ''}. The ${other} values are designed, not inverted. Text on the canvas uses \`--ink\` / \`--muted\`${ctx.rows.some(r => r.token === '--card-ink') ? '; text on cards and paper uses `--card-ink` / `--card-muted`' : ''}, with each mode's value from the Colors table.`);
    if (ctx.swiftOnly && aibMaterials(ctx).vars.length && !ctx.kit) out.push('Material values used by the recipes (light | dark): ' + aibMaterials(ctx).vars.map(([k, v]) => `\`${k}\` ${v.length > 1 && v[0] !== v[1] ? v[0] + ' | ' + v[1] : v[0]}`).join('; ') + '.');
    return out;
  }
  out.push(`Ship both palettes from the Colors table and follow the system setting${ctx.web ? ' (`prefers-color-scheme`, with a `data-theme` attribute override)' : ''}${ctx.swiftOnly ? ' (adaptive colors; no manual switch)' : ctx.swift ? '; SwiftUI colors adapt on their own' : ''}. The default look is ${mode}. The ${mode === 'dark' ? 'light' : 'dark'} values are designed, not inverted.`);
  const vars = aibMaterials(ctx).vars;
  if (ctx.swiftOnly && vars.length) out.push('Material values used by the recipes (light | dark): ' + vars.map(([k, v]) => `\`${k}\` ${v.length > 1 && v[0] !== v[1] ? v[0] + ' | ' + v[1] : v[0]}`).join('; ') + '.');
  return out;
}

function aibFocusColor(ctx) {
  if (aibPrimaryBarred(ctx.roles)) return '`--ink`';
  // the kit draws the ring in the primary where it holds 3:1 on the canvas (see-built.js kitColours), else the ink
  if (ctx.kit) return ctx.focusLow ? '`--primary` where it holds 3:1 on the canvas, else `--ink`' : '`--primary`';
  return '`--primary`' + (ctx.focusLow ? ' plus an outer 1pt `--ink` ring (primary alone is under 3:1 on a canvas here)' : '');
}

function aibSecStates(ctx) {
  const { build } = ctx;
  const S = build.states;
  // Where the colour rules bar the primary, the generic state colours name the ink instead.
  const barred = aibPrimaryBarred(ctx.roles);
  const fix = x => (barred ? String(x).replace(/`--primary`/g, '`--ink`').replace(/`--pri-tint`/g, '`--line`').replace(/\(primary\)/g, '(main action)') : x);
  const row = (name, colour, visual) => [name, ctx.tok(fix(colour)), ctx.tok(fix(visual))];
  if (ctx.kit) {
    return ['## States',
      aibTable(['State', 'Colour', 'Visual'], [
        row('Pressed and disabled', 'as each UI kit row states', 'The "Other states" column of the UI kit is the one definition; nothing else changes on press. Disabled controls take no press response.'),
        row('Focus', aibFocusColor(ctx), 'Keyboard focus on any control: a 2pt ring with a 2pt gap, following the control\'s corners; exactly as the "focus" state of the Primary and Secondary button rows in the UI kit draws it. Shown on keyboard focus only (`:focus-visible` on the web), never on tap or click; never removed. Text fields show their own focus state from the UI kit instead.'),
        row('Empty', S.empty[0], 'The Empty state row of the UI kit.'),
        row('Loading', S.loading[0], aibAppText(ctx, S.loading[1], 'A progress indicator.') + ' Show it after 300 ms of waiting, with a text label for screen readers.'),
        row('Error', '`--error`', 'The Text field row\'s error state, with the message under the field.'),
      ])];
  }
  return ['## States',
    aibTable(['State', 'Colour', 'Visual'], [
      row('Pressed', S.pressed[0], aibAppText(ctx, S.pressed[1], S.pressed[1])),
      row('Disabled', S.disabled[0], aibAppText(ctx, S.disabled[1], S.disabled[1])),
      row('Focus', aibFocusColor(ctx), '3pt ring, 2pt gap, visible for keyboard, switch control and VoiceOver focus; never removed.'),
      row('Empty', S.empty[0], aibAppText(ctx, S.empty[1], 'One outline icon, a headline, one line of copy and one action on the plain canvas.')),
      row('Loading', S.loading[0], aibAppText(ctx, S.loading[1], 'A progress indicator.') + ' Show it after 300 ms of waiting, with a text label for screen readers.'),
      row('Error', S.error[0], aibAppText(ctx, S.error[1], S.error[1])),
    ])];
}

const AIB_EASE_NAME = { out: 'ease-out', inout: 'ease-in-out', spring: 'spring', gel: 'gel spring', steps: 'stepped' };
const AIB_SWIFT_EASE = {
  out: n => `.easeOut(duration: ${n})`,
  inout: n => `.easeInOut(duration: ${n})`,
  spring: () => '.spring(response: 0.3, dampingFraction: 0.6)',
  gel: () => '.spring(response: 0.32, dampingFraction: 0.62)',
  steps: n => `.linear(duration: ${n})`,
};

function aibSecMotion(ctx) {
  const { build } = ctx;
  const mo = build.motion;
  const out = ['## Motion'];
  out.push(`- Durations: fast ${mo.fast} ms (press, toggle), base ${mo.base} ms (color, selection, shadow), slow ${mo.slow} ms (sheets, page changes). Easing: ${AIB_EASE_NAME[mo.ease]}${ctx.web ? ' `' + BUILD_EASE[mo.ease] + '`' : ''}${ctx.swift ? ' (`Motion.press`, `Motion.settle` in Theme.swift)' : ''}.`);
  if (!ctx.kit) out.push(`- Press: ${ctx.tok(aibPrimaryBarred(ctx.roles) ? build.pressText.replace(/`--pri-tint`/g, '`--line`') : build.pressText)}`);
  out.push(`- Reduce Motion: ${ctx.tok(build.reduceMotion)} State changes stay; only the movement goes. ${build.ambient && !(ctx.app && !ctx.site) ? `Ambient motion: ${build.ambient}; it is paused under Reduce Motion. Nothing else animates idly or loops except loading indicators.` : 'Nothing else animates idly or loops except loading indicators.'}`);
  return out;
}

function aibA11yPairs(ctx) {
  const defs = [
    ['ink on canvas', m => m.t.ink, m => m.t.canvas],
    ['muted on canvas', m => m.t.muted, m => m.t.canvas],
    ['on-primary on primary', m => m.t.onPrimary, m => aibPri(m.t)],
    ['on-secondary on secondary', m => m.t.onSecondary, m => m.t.secondary],
    ['on-accent on accent', m => m.t.onAccent, m => m.t.accent],
    ['accent-ink on canvas', m => m.t.accentInk, m => m.t.canvas],
    ['error on canvas', m => aibError(m.t), m => m.t.canvas],
  ];
  const has = tk => !ctx.kit || ctx.rows.some(r => r.token === tk);
  return defs.filter(([name]) => name.split(' on ').every(p => has('--' + p.trim()) || /^(on-|error)/.test(p.trim()) && has('--' + p.trim().replace(/^on-/, ''))))
    .map(([name, fg, bg]) => ({ name, ratios: ctx.modes.map(m => contrastRatio(fg(m), bg(m))) }));
}

// Whether the measured kit draws anything translucent (a backdrop blur or a fill at N%); true without a measurement.
function aibKitTranslucent(ctx) {
  if (!ctx.kit) return true;
  const ids = Object.keys(ctx.kit.rows).filter(id => { const r = ctx.kit.rows[id]; return r.main.bd !== 'none' || / at \d+%(?! over)/.test(r.fill); });
  return ids.map(ctx.kit.nameOf).map(n => n.toLowerCase()).join(', ');
}

function aibSecA11y(ctx) {
  const { build } = ctx;
  const web = ctx.web, sw = ctx.swift;
  const env = (css, swift) => ` (${web ? '`' + css + '`' : ''}${web && sw ? ' / ' : ''}${sw ? '`' + swift + '`' : ''})`;
  const pairs = aibA11yPairs(ctx).map(p => `${p.name} ${p.ratios.map(r => r.toFixed(1)).join(' | ')} (${aibGrade(Math.min(...p.ratios))})`).join('; ');
  return ['## Accessibility',
    `- Contrast kept${ctx.modes.length > 1 ? ' (light | dark)' : ''}: ${pairs}. Keep every text pair at 4.5:1 or better (3:1 for the accent-ink highlight word); do not swap tokens in a way that breaks them.`,
    `- Every tappable target is at least 44x44${web && sw ? ' (CSS px; pt in SwiftUI)' : web ? ' CSS px' : 'pt'} even when the visible shape is smaller, with 8pt between neighbours. Text scales: ${web ? 'sizes in rem, no fixed-height text boxes' : ''}${web && sw ? '; ' : ''}${sw ? 'Dynamic Type through the \`Font.brand*\` styles, \`@ScaledMetric\` for icon sizes and paddings' : ''}; layouts reflow at the largest accessibility size (stack, wrap, never truncate a primary label).`,
    `${aibKitTranslucent(ctx) ? `- Reduce Transparency${env('prefers-reduced-transparency', 'accessibilityReduceTransparency')}: ${ctx.kit ? `translucent fills in the kit (${aibKitTranslucent(ctx)}) become opaque.` : ctx.tok(build.reduceTransparency)} ` : '- '}Increase Contrast${env('prefers-contrast: more', 'colorSchemeContrast == .increased')}: ${ctx.tok(build.increaseContrast)}`,
    `- Reduce Motion${env('prefers-reduced-motion', 'accessibilityReduceMotion')}: see Motion. Never color alone: selection, status and errors also use an icon, text or shape; icon-only buttons carry an accessibility label.`];
}

function aibSecIcons(ctx) {
  const { build } = ctx;
  const plat = [];
  if (ctx.web) plat.push('Web: inline SVG on a 24px grid, `currentColor`.');
  if (ctx.swift) plat.push(`SwiftUI: SF Symbols at weight \`.${build.iconWeight}\`, monochrome rendering; template-rendered SVG assets only for glyphs SF Symbols lacks.`);
  if (!ctx.app) return ['## Icons', `${ctx.tok(build.icons)} ${plat.join(' ')}`];
  return ['## Icons', `${ctx.tok(build.icons)} ${plat.join(' ')}`,
    (ctx.kit && ctx.kit.screens ? (I => `- Sizes as the Built screens draw them: ${I.tab || 24}pt tab bar icons over their 10pt labels; ${I.bell || 20}pt icons in icon buttons, centred in a 44x44pt hit area; ${I.chip || 18}pt icons inside the 32pt feature-row chips; ${I.chevron || 16}pt chevrons in the trailing slot of rows, never a text glyph (no ›, > or →); 24pt anywhere else.`)(ctx.kit.screens.icons || {})
      : '- Sizes: 24pt icons everywhere (row leads, icon buttons, top bar); icon buttons centre the icon in a 44x44pt hit area. Tab bar: a 24pt icon over a 10pt label. List chevrons: a 16pt chevron icon in the trailing slot, never a text glyph (no ›, > or →).'),
    '- Glyphs the kit uses (draw each once, same stroke): back, more, notifications (bell), search, chevron right, chevron down, check, plus, info, success, warning, error, inbox (empty state), home, list, heart, user.'];
}

function aibSecAppIcon(ctx) {
  const { build, modes } = ctx;
  const light = modes.find(m => m.mode === 'light'), dark = modes.find(m => m.mode === 'dark');
  const t = (light || dark).t;
  const fill = {
    primary: aibPri(t), canvas: t.canvas, ink: t.ink, accent: t.accent, onPrimary: t.onPrimary,
  };
  const text = String(build.appIcon).replace(/\{(\w+)\}/g, (m, k) => fill[k] || m);
  return ['## App icon',
    `${text} Deliver a 1024x1024 master without transparency or pre-rounded corners (the system masks it)${light && dark ? `, a dark variant on \`${dark.t.canvas}\`` : ''} and a tinted variant (glyph only, one color), and derive every other size from the master.${ctx.web ? ' Web: also a 512px maskable icon and a 32px favicon from the same master.' : ''}`];
}

function aibSecFonts(ctx) {
  const fams = aibFamsFor(ctx);
  const out = ['## Fonts to bundle'];
  fams.forEach(f => {
    const ws = f.weights.map(w => `${w.weight}${w.italic ? ' italic' : ''} (${f.roles[w.key].join(', ')})${ctx.swift ? ' as `' + w.ps + '`' : ''}`).join(', ');
    out.push(`- ${f.face.name}: ${ws}.`);
  });
  if (!fams.length) out.push('- None: the system fonts only.');
  const sys = ctx.kit && ctx.fontUse ? Object.keys(ctx.fontUse).filter(f => !ctx.fontUse[f].face) : [];
  if (sys.length) out.push(`- System faces, no file to bundle: ${sys.join(', ')}.`);
  if (ctx.web) out.push(`- Bundle exactly these weights and no others; the type scale uses no more. Web: ${aibFontsUrl(fams)}`);
  if (ctx.swift) out.push((ctx.web ? '- SwiftUI' : '- Bundle exactly these weights and no others; the type scale uses no more. SwiftUI') + ': use static TTFs (the Google Fonts download, `static/` folder), add them to the target and list them under `UIAppFonts` (iOS) or `ATSApplicationFontsPath` (macOS). The names above are PostScript names.');
  return out;
}

const AIB_ART_RULE = /band|hero|pattern|texture|glow|illustration|plate|striation/i;

// App briefs with a measured kit keep only Do/Don't lines about components that agree with the kit: board-only
// devices (the cropped brand word, the hero, page layout) and any shadow or corner claim the kit contradicts go.
const AIB_BOARD_ONLY = /\b(board|deck|hero|poster|landing|crop(?:ped|s)?|giant|enormous|wordmark|logo|brand word|headlines?|display type|zones?|furniture|layouts?|art|patterns?|textures?|bands?|plates?|illustrations?|striations?|glow|collage|scene|sticker|wall|page|grid|columns?|test (?:bars?|signals?|cards?)|stations?|accession)\b/i;
const AIB_COMPONENT_WORD = /\b(buttons?|actions?|fields?|inputs?|cards?|lists?|rows?|tabs?|toggles?|switch(?:es)?|controls?|chips?|badges?|tags?|segments?|icons?|labels?|text|type|colou?rs?|primary|accent|ink|shadows?|corners?|radius|edges?|borders?|hairlines?|rules?|contrast|sheets?|screens?|titles?|states?)\b/i;
function aibKitRuleOk(ctx, text, dont) {
  const K = ctx.kit;
  if (AIB_BOARD_ONLY.test(text) || !AIB_COMPONENT_WORD.test(text)) return false;
  const kinds = new Set();
  Object.keys(K.rows).forEach(id => K.rows[id].sh.kinds.forEach(k => { if (k !== 'veil') kinds.add(k); }));
  const neg = /\bno (?:drop )?shadows?\b|\bnever (?:a )?shadows?\b|\bwithout (?:a )?shadows?\b|\bshadowless\b|\bflat\b/i.test(text);
  if (neg && kinds.size) return false;
  if (!neg && /\bshadows?\b/i.test(text) && !kinds.size) return false;
  const radii = [ctx.radius.control, ctx.radius.field, ctx.radius.card];
  if (/\b(?:square|sharp) corners?\b|\b0 ?(?:px)? radius\b|\bno (?:rounded|radius)\b|\bnever round/i.test(text) && radii.some(v => v > 2)) return false;
  const pillKit = ['btn-primary', 'badge', 'segmented', 'field'].some(id => K.rows[id] && /pill|circle/.test(aibKitCorner(K.rows[id].main)));
  const squareKit = radii.every(v => v <= 2);
  if (/\bpills?\b|\brounded\b|\bround corners\b|\bsoft corners\b/i.test(text) && (dont ? pillKit || !squareKit : squareKit)) return false;
  if (dont && /\b(?:square|sharp) corners?\b/i.test(text) && squareKit) return false;
  if (dont && /\bshadows?\b/i.test(text) && !kinds.size) return false;
  const grad = Object.keys(K.rows).some(id => /gradient\(/.test(K.rows[id].fill + K.rows[id].marks.join(' ') + K.rows[id].states.join(' ')));
  if (dont && /\bgradients?\b/i.test(text) && grad) return false;
  const spread = tk => Object.keys(K.usage[tk] ? Array.from(K.usage[tk]).reduce((o, k) => (o[k] = 1, o), {}) : {}).filter(k => k !== 'chrome' && k !== 'screens').length;
  if (/\b(?:only|once|one|single)\b/i.test(text) && /\b(?:colou?r|primary|accent)\b/i.test(text) && (spread('--primary') > 2 || spread('--accent') > 2)) return false;
  // a line that claims a look for a component the kit draws differently ("tabs circled" vs a tab-bar pill)
  const NOUN = [[/\btabs?\b/i, ['tabbar', 'tabs']], [/\bbuttons?\b/i, ['btn-primary', 'btn-secondary']], [/\bcards?\b/i, ['card']], [/\b(?:rows?|lists?)\b/i, ['list']],
    [/\btoggles?|switch(?:es)?\b/i, ['toggle']], [/\b(?:fields?|inputs?)\b/i, ['field']], [/\b(?:badges?|tags?|chips?)\b/i, ['badge']]];
  const CLAIM = [[/\bcircled\b/i, /circle|loop/], [/\bunderlined\b/i, /underline|bar|rule/], [/\b(?:outlined|boxed)\b/i, /edge|ring|frame|outline/], [/\bstamped\b/i, /rotated|tilt|stamp/],
    [/\b(?:tilted|rotated|skewed)\b/i, /rotated|tilt/], [/\btorn\b/i, /torn/], [/\bpills?\b/i, /pill/]];
  const rowText = ids => ids.map(id => (K.rows[id] ? [K.rows[id].fill, K.rows[id].text, K.rows[id].edge, K.rows[id].marks.join(' '), K.rows[id].states.join(' ')].join(' ') : '')).join(' ');
  for (const [nre, ids] of NOUN) {
    if (!nre.test(text) || !ids.some(id => K.rows[id])) continue;
    for (const [cre, look] of CLAIM) if (cre.test(text) && !look.test(rowText(ids))) return false;
  }
  if (dont && /\bglass\b|\bblur\b/i.test(text) && Object.keys(K.rows).some(id => K.rows[id].main.bd !== 'none')) return false;
  return true;
}

function aibSecRules(ctx) {
  const r = ctx.def.rules || {};
  let lines = [...(r.do || []).map(x => ['Do', x]), ...(r.dont || []).map(x => ['Don\'t', x])];
  // A rule the blend took from the second style must not use a colour role the first style's colour rules keep off the page.
  const off = [aibPrimaryBarred(ctx.roles) && 'primary', aibPaletteOnly(ctx.roles, 'secondary') && 'secondary', aibPaletteOnly(ctx.roles, 'accent') && 'accent'].filter(Boolean);
  const kept = ctx.def.blend && ctx.def.blend.donorRules;
  if (off.length && kept) {
    const rx = new RegExp('\\b(?:' + off.join('|') + ')\\b', 'i'), donor = new Set([].concat(kept.do || [], kept.dont || []));
    lines = lines.filter(l => !(donor.has(l[1]) && rx.test(l[1])));
  }
  const fmt = l => `- ${l[0]}: ${aibFixWeights(ctx, l[1])}`;
  if (!ctx.app) return ['## Do and don\'t', ...lines.map(fmt)];
  const appOk = l => (ctx.kit ? aibKitRuleOk(ctx, l[1], l[0] !== 'Do') : !AIB_ART_RULE.test(l[1]));
  const keep = lines.filter(appOk), art = lines.filter(l => !appOk(l));
  if (ctx.kit && !keep.length && !(ctx.site && art.length)) return [];
  const out = ['## Do and don\'t', ...keep.map(fmt)];
  if (ctx.site && art.length) out.push('', 'Website only (never in app screens):', ...art.map(fmt));
  return out;
}

/* ---------------- logo (upload or Logo Studio) ---------------- */

const AIB_LOGO_MIME = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/svg+xml': 'svg', 'image/webp': 'webp', 'image/gif': 'gif' };

// The logo files for the zip and the brief. An upload wins. Pure and synchronous (no PNG work):
// { kind: 'upload'|'studio', files: [{ name, role, use, svg?, dataUrl? }], minPx, clearSpace, png } or null.
// png = the zip also carries a PNG of every SVG (aibFiles renders them when LogoEngine.toPNG exists).
function aibLogoPlan(state0, png) {
  if (!state0) return null;
  const slug = String(((state0.content && state0.content.brandName) || '')).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'brand';
  if (state0.logoDataUrl && typeof state0.logoDataUrl === 'string') {
    const mime = (/^data:([^;,]+)/.exec(state0.logoDataUrl) || [])[1] || '';
    const ext = AIB_LOGO_MIME[mime.toLowerCase()] || 'png';
    return { kind: 'upload', png: false, minPx: null, clearSpace: null, files: [{ name: `logo/${slug}-logo.${ext}`, role: 'full', use: 'the logo, as uploaded', dataUrl: state0.logoDataUrl }] };
  }
  const lg = state0.content && state0.content.logo;
  if (!lg || typeof lg !== 'object' || !lg.files) return null;
  const F = lg.files, files = [];
  const add = (set, key, suffix, use) => { if (set && typeof set[key] === 'string' && set[key]) files.push({ name: `logo/${slug}-${suffix}.svg`, role: suffix, use, svg: set[key] }); };
  add(F.full, 'ink', 'logo', 'full lockup in the brand ink, for light backgrounds');
  add(F.full, 'white', 'logo-white', 'full lockup in white, for dark or coloured backgrounds');
  add(F.wordmark, 'ink', 'wordmark', 'wordmark alone in the brand ink, for light backgrounds');
  add(F.wordmark, 'white', 'wordmark-white', 'wordmark alone in white, for dark or coloured backgrounds');
  add(F.mono, 'light', 'monogram', 'square monogram, ink on a white tile (favicon, app icon, avatar on light)');
  add(F.mono, 'dark', 'monogram-dark', 'square monogram, white on an ink tile (favicon, app icon, avatar on dark)');
  if (!files.length) return null;
  const mp = lg.minPx && typeof lg.minPx === 'object' ? lg.minPx : {};
  const cs = Number(lg.clearSpace);
  return { kind: 'studio', png: !!png, files, minPx: { full: Number(mp.full) || null, wordmark: Number(mp.wordmark) || null }, clearSpace: cs > 0 ? cs : null };
}

function aibSecLogo(ctx) {
  const L = ctx.logo;
  if (!L) return [];
  const out = ['## Logo'];
  if (L.kind === 'upload') {
    out.push(`The brand's logo is one uploaded file: \`${L.files[0].name}\` (written by "Save brief + files"). Use that file everywhere the logo appears. Never recolour, stretch, re-type or rebuild the logo; use the file.`);
    return out;
  }
  out.push('Files in `logo/` (written by "Save brief + files"). Use these files as they are. Never recolour, stretch, re-type or rebuild the logo; use the files.');
  L.files.forEach(f => out.push(`- \`${f.name}\`${L.png ? ` (and \`${f.name.replace(/\.svg$/, '.png')}\`)` : ''}: ${f.use}.`));
  const has = r => L.files.some(f => f.role === r);
  const mp = L.minPx || {};
  const w = mp.wordmark, fu = mp.full;
  out.push('', 'Which to use where:');
  if (has('logo')) out.push(`- Headers, covers and sign-in screens${fu ? ` at ${fu}px wide or more` : ''}: the full lockup (\`logo\` on light grounds, \`logo-white\` on dark ones).`);
  if (has('wordmark')) out.push(`- Smaller marks${fu ? ` (under ${fu}px wide)` : ''}${w ? ` down to ${w}px wide` : ''}: the wordmark (\`wordmark\` on light, \`wordmark-white\` on dark).`);
  if (has('monogram')) out.push(`- Favicon, app icon, avatar and any square slot${w ? ` or anything under ${w}px wide` : ''}: the monogram (\`monogram\` on light, \`monogram-dark\` on dark).`);
  if (L.clearSpace) out.push('', `Clear space: keep ${Math.round(L.clearSpace * 100)}% of the logo's height free on every side (a logo drawn 40px tall needs ${+(L.clearSpace * 40).toFixed(1)}px around it). Nothing else sits inside that margin.`);
  if (fu || w) out.push(`Minimum sizes: ${[fu ? `full lockup ${fu}px wide` : '', w ? `wordmark ${w}px wide` : ''].filter(Boolean).join(', ')}. Below the wordmark minimum use the monogram.`);
  return out;
}

// SVG-only unless the zip path can render PNGs; the caller adds them to the zip files.
async function aibLogoZipFiles(state0) {
  const plan = aibLogoPlan(state0, false);
  if (!plan) return { plan: null, files: [] };
  const files = [];
  const enc = new TextEncoder();
  if (plan.kind === 'upload') {
    const f = plan.files[0];
    try {
      const m = /^data:([^,]*),(.*)$/s.exec(f.dataUrl);
      if (m) {
        let bytes;
        if (/;base64/i.test(m[1])) { const bin = atob(m[2]); bytes = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i); }
        else bytes = enc.encode(decodeURIComponent(m[2]));
        files.push({ name: f.name, data: bytes });
      }
    } catch (err) { console.warn('brief files: uploaded logo failed', err); }
    return { plan: files.length ? plan : null, files };
  }
  plan.files.forEach(f => files.push({ name: f.name, data: f.svg }));
  // PNGs: all or none, only when the logo engine can draw them.
  const LE = typeof LogoEngine !== 'undefined' ? LogoEngine : null;
  if (LE && typeof LE.toPNG === 'function' && typeof document !== 'undefined') {
    try {
      const pngs = [];
      for (const f of plan.files) {
        const px = f.role.startsWith('monogram') ? 1024 : f.role.startsWith('wordmark') ? 1200 : 1600;
        pngs.push({ name: f.name.replace(/\.svg$/, '.png'), data: new Uint8Array(await (await LE.toPNG(f.svg, px)).arrayBuffer()) });
      }
      pngs.forEach(p => files.push(p));
      plan.png = true;
    } catch (err) { console.warn('brief files: logo PNGs failed, SVG only', err); }
  }
  return { plan, files };
}

function aibSecPatterns(ctx) {
  const items = ctx.assets;
  if (!items.length) return [];
  const out = ['## Patterns',
    ...(ctx.app ? ['**Website only — never in app screens.**'] : []),
    'Files in `patterns/` (written by "Save brief + files"). Backgrounds and textures only: keep copy on a solid `--canvas` plate (4.5:1 or better), never on the pattern. Do not recolor or redraw them.'.replace(/`--canvas`/g, ctx.tok('`--canvas`'))];
  items.forEach(a => out.push(aibPatternLine(ctx, a)));
  return out;
}


/* ---------------- Web tokens (CSS) ---------------- */

function aibCssLines(ctx, full) {
  const { build, scale, radius, modes } = ctx;
  const mo = build.motion;
  const sw = build.sw;
  const sh = build.sh || {};
  const ld = r => {
    const v = modes.map(m => r.get(m));
    return modes.length === 1 || v[0] === v[1] ? v[0] : `light-dark(${v[0]}, ${v[1]})`;
  };
  const colourTokens = [];
  (ctx.app ? ctx.rows.concat(ctx.unusedRows || []) : ctx.rows).forEach(r => {
    if (!colourTokens.some(x => x[0] === r.token)) colourTokens.push([r.token, ld(r)]);
    r.on.forEach(([tk, g]) => { if (!colourTokens.some(x => x[0] === tk)) { const v = modes.map(m => g(m)); colourTokens.push([tk, modes.length === 1 || v[0] === v[1] ? v[0] : `light-dark(${v[0]}, ${v[1]})`]); } });
  });
  if (ctx.app) return aibCssApp(ctx, colourTokens);
  const lines = ['```css', ':root {'];
  if (full) {
    lines.push(`  color-scheme: ${ctx.only || 'light dark'};   /* [data-theme="light"] / [data-theme="dark"] override it */`);
    for (let i = 0; i < colourTokens.length; i += 3) lines.push('  ' + colourTokens.slice(i, i + 3).map(([k, v]) => `${k}: ${v};`).join(' '));
  } else {
    lines.push(`  color-scheme: ${ctx.only || 'light dark'};   /* [data-theme] overrides. Add one property per row of the Colors table: ${modes.length > 1 ? '--name: light-dark(<light>, <dark>)' : '--name: <value>'} (tokens.css has them) */`);
  }
  const mv = aibMaterials(ctx).vars;
  for (let i = 0; i < mv.length; i += 2) lines.push('  ' + mv.slice(i, i + 2).map(([k, v]) => `${k}: ${v.length > 1 && v[0] !== v[1] ? `light-dark(${v[0]}, ${v[1]})` : v[0]};`).join(' '));
  lines.push(`  --font-heading: ${ctx.state.headingFont.css}; --font-body: ${ctx.state.bodyFont.css};`);
  const phoneRows = ctx.app ? aibPhoneRows(ctx) : [];
  if (phoneRows.length) lines.push('  ' + phoneRows.map(r => `--text-${r.role.toLowerCase().replace(/\s+/g, '-')}: ${r.size}px;`).join(' ') + ' --space: ' + UI_KIT_PHONE.spacing.map(n => n + 'px').join(' ') + ';');
  else lines.push('  ' + scale.rows.map(r => `--text-${r.name.toLowerCase()}: ${r.size}px;`).join(' ') + ' --space: 4px 8px 12px 16px 24px 32px;');
  lines.push(`  --radius-control: ${radius.control}px; --radius-field: ${radius.field}px; --radius-card: ${radius.card}px; --hit: 44px; --outline: ${build.line}px;`);
  if (sw === 'hard') lines.push(`  --shadow-rest: ${sh.x}px ${sh.y}px 0 var(--shadow); --shadow-pressed: 0 0 0 var(--shadow); --press: translate(${build.press.dx}px, ${build.press.dy}px);`);
  else if (sw === 'soft') lines.push(`  --shadow-rest: ${sh.d}px ${sh.d}px ${sh.blur}px var(--shadow-lo), -${sh.d}px -${sh.d}px ${sh.blur}px var(--shadow-hi); --shadow-pressed: inset ${sh.d}px ${sh.d}px ${sh.blur}px var(--shadow-lo), inset -${sh.d}px -${sh.d}px ${sh.blur}px var(--shadow-hi);`);
  else if (sw === 'glass') lines.push('  --shadow-rest: 0 8px 24px rgba(0, 0, 0, 0.18); --blur: 24px;');
  else if (sw === 'glow') lines.push(`  --shadow-rest: 0 0 ${sh.r}px color-mix(in srgb, var(--primary) ${Math.round(sh.a * 100)}%, transparent); --shadow-pressed: 0 0 ${sh.r + 6}px color-mix(in srgb, var(--primary) ${Math.round(sh.a * 100)}%, transparent);`);
  else lines.push('  --shadow-rest: none;');
  lines.push(`  --dur-fast: ${mo.fast}ms; --dur-base: ${mo.base}ms; --dur-slow: ${mo.slow}ms; --ease: ${BUILD_EASE[mo.ease]};`);
  lines.push('}', '@media (prefers-reduced-motion: reduce) { :root { --dur-fast: 0ms; --dur-base: 0ms; --dur-slow: 0ms; } }', '```');
  return lines;
}

// A colour name from the measured kit as CSS: `--x` -> var(--x), `--x at 16%` -> color-mix(... transparent).
function aibKitCssColor(n) {
  let m = /^(--[a-z0-9-]+) at (\d+)% over (--[a-z0-9-]+)$/.exec(n);
  if (m) return `color-mix(in srgb, var(${m[1]}) ${m[2]}%, var(${m[3]}))`;
  m = /^(--[a-z0-9-]+) at (\d+)%$/.exec(n);
  if (m) return `color-mix(in srgb, var(${m[1]}) ${m[2]}%, transparent)`;
  if (/^--[a-z0-9-]+$/.test(n)) return `var(${n})`;
  return n === 'none' ? 'transparent' : n;
}

// App and Both: the whole token block pasted in, light on :root (the default) and dark under [data-theme="dark"].
function aibCssApp(ctx, colourTokens) {
  const { build, scale, radius, modes } = ctx;
  const mo = build.motion, sw = build.sw, sh = build.sh || {};
  const L = modes.find(m => m.mode === 'light') || modes[0], D = modes.find(m => m.mode === 'dark');
  const allRows = ctx.rows.concat(ctx.unusedRows || []);
  const valueOf = (tk, m) => {
    const r = allRows.find(x => x.token === tk);
    if (r) return r.get(m);
    for (const x of allRows) { const on = (x.on || []).find(([t]) => t === tk); if (on) return on[1](m); }
    return '';
  };
  const names = colourTokens.map(([k]) => k);
  const three = (pairs, ind) => { const out = []; for (let i = 0; i < pairs.length; i += 3) out.push(ind + pairs.slice(i, i + 3).map(([k, v]) => `${k}: ${v};`).join(' ')); return out; };
  const def = ctx.only || ctx.mode || 'light', alt = def === 'dark' ? 'light' : 'dark';
  const DEF = def === 'dark' ? (D || L) : (L || D), ALT = def === 'dark' ? L : D;
  const lines = ['```css', ':root {', `  color-scheme: ${def};`];
  lines.push(...three(names.map(k => [k, valueOf(k, DEF)]), '  '));
  if (!ctx.kit) {
    const mv = aibMaterials(ctx).vars;
    for (let i = 0; i < mv.length; i += 2) lines.push('  ' + mv.slice(i, i + 2).map(([k, v]) => `${k}: ${v[0]};`).join(' '));
  }
  lines.push(`  --font-heading: ${ctx.state.headingFont.css}; --font-body: ${ctx.state.bodyFont.css};`);
  if (ctx.kit && ctx.fontUse) {
    const seen = new Set([ctx.state.headingFont.name, ctx.state.bodyFont.name]);
    const extra = Object.keys(ctx.fontUse).filter(f => !seen.has(f) && !/^(-apple-system|system-ui|BlinkMacSystemFont)$/i.test(f)).map(f => {
      const mono = /mono|courier|consol|menlo/i.test(f);
      const slug = /^ui-monospace$|^monospace$/i.test(f) ? 'mono' : f.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return `--font-${slug}: ${/^ui-monospace$|^monospace$/i.test(f) ? 'ui-monospace, "SF Mono", Menlo, monospace' : `"${f}", ${mono ? 'ui-monospace, monospace' : 'system-ui, sans-serif'}`};`;
    });
    for (let i = 0; i < extra.length; i += 2) lines.push('  ' + extra.slice(i, i + 2).join(' '));
  }
  const phoneRows = aibPhoneRows(ctx);
  const P = (typeof UI_KIT_PHONE !== 'undefined' && UI_KIT_PHONE) || null;
  if (phoneRows.length && P) {
    const space = Array.from(new Set(P.spacing.concat(P.sectionGap ? [P.sectionGap] : []))).sort((a, b) => a - b);
    lines.push('  ' + phoneRows.map(r => `--text-${r.role.toLowerCase().replace(/\s+/g, '-')}: ${r.size}px;`).join(' '));
    lines.push('  ' + space.map(n => `--space-${n}: ${n}px;`).join(' '));
    const ch = ctx.kit ? ctx.kit.chrome : { status: 54, topbar: 44, tabbar: P.tabBarHeight };
    lines.push(`  --status-bar: ${Math.round(ch.status)}px; --home-indicator: 34px; --top-bar: ${Math.round(ch.topbar)}px;${ch.topRule ? ` --top-bar-rule: ${ch.topRule}px;` : ''} --tab-bar: ${Math.round(ch.tabbar)}px; --margin: ${P.margin}px;`);
    if (ctx.kit && ctx.kit.chrome.rowDetail) lines.push(`  --row: ${ctx.kit.chrome.rowPlain || ctx.kit.chrome.rowDetail}px; --row-detail: ${ctx.kit.chrome.rowDetail}px;`);
  } else lines.push('  ' + scale.rows.map(r => `--text-${r.name.toLowerCase()}: ${r.size}px;`).join(' '));
  lines.push(`  --radius-control: ${radius.control}px; --radius-field: ${radius.field}px; --radius-card: ${radius.card}px; --hit: 44px;`);
  if (ctx.kit) {
    const name = aibKitNamer(ctx);
    const css = o => (o && o.sh && o.sh !== 'none' ? String(o.sh).split(/,(?![^()]*\))/).map(l => l.trim().replace(/(?:rgba?|color)\([^()]*\)(?:\|(?:rgba?|color)\([^()]*\))?|#[0-9a-f]{3,8}\b/i, c => aibKitCssColor(name(c))).replace(/\b0px\b/g, '0')).join(', ') : '');
    const R = ctx.kit.rows;
    const sh2 = Object.keys(R).map(id => [`--shadow-${id.replace(/^btn-/, 'button-')}`, css(R[id].main)]).filter(([, v]) => v);
    for (let i = 0; i < sh2.length; i += 2) lines.push('  ' + sh2.slice(i, i + 2).map(([k, v]) => `${k}: ${v};`).join(' '));
    if (!sh2.length) lines.push('  /* the kit draws no box shadows */');
  } else if (sw === 'hard') lines.push(`  --shadow-rest: ${sh.x}px ${sh.y}px 0 var(--shadow); --shadow-pressed: 0 0 0 var(--shadow);`);
  else if (sw === 'soft') lines.push(`  --shadow-rest: ${sh.d}px ${sh.d}px ${sh.blur}px var(--shadow-lo), -${sh.d}px -${sh.d}px ${sh.blur}px var(--shadow-hi);`);
  lines.push(`  --dur-fast: ${mo.fast}ms; --dur-base: ${mo.base}ms; --dur-slow: ${mo.slow}ms; --ease: ${BUILD_EASE[mo.ease]};`);
  // every var() the block uses is defined in it (kit tokens a shadow names after the Colors table was built)
  const defined = new Set((lines.join('\n').match(/--[a-z0-9-]+(?=:)/g) || []));
  const late = Array.from(new Set((lines.join('\n').match(/var\((--[a-z0-9-]+)\)/g) || []).map(v => v.slice(4, -1)))).filter(k => !defined.has(k));
  const lateVal = (k, m) => (ctx.kitVars && ctx.kitVars[k] ? ctx.kitVars[k].get(m) : valueOf(k, m));
  late.forEach(k => { const v = lateVal(k, DEF); if (v) { lines.push(`  ${k}: ${v};`); names.push(k); } });
  lines.push('}');
  if (D && L && !ctx.only) {
    const vOf = (k, m) => (late.indexOf(k) >= 0 ? lateVal(k, m) : valueOf(k, m));
    const dark = names.map(k => [k, vOf(k, ALT)]).filter(([k, v]) => v !== vOf(k, DEF));
    lines.push(`:root[data-theme="${alt}"] {`, `  color-scheme: ${alt};`, ...three(dark, '  '), '}');
  }
  lines.push('@media (prefers-reduced-motion: reduce) { :root { --dur-fast: 0ms; --dur-base: 0ms; --dur-slow: 0ms; } }', '```');
  return lines;
}

function aibSecCss(ctx) {
  const out = ['## Tokens (CSS)', ...aibCssLines(ctx)];
  if (ctx.app && !ctx.only && ctx.modes.length > 1 && ctx.mode !== 'dark') {
    out.push('Follow the system appearance:', '```js',
      "const darkMq = matchMedia('(prefers-color-scheme: dark)');",
      "const applyTheme = () => { document.documentElement.dataset.theme = darkMq.matches ? 'dark' : 'light'; };",
      "applyTheme(); darkMq.addEventListener('change', applyTheme);", '```');
  }
  return out;
}

/* ---------------- SwiftUI theme ---------------- */

function aibHex6(n) { return '0x' + (n >>> 0).toString(16).toUpperCase().padStart(6, '0'); }
function aibOpacity(a) { return (Math.round(a * 100) / 100).toString(); }

// Theme.swift as text. Compiles against SwiftUI on iOS 17 / macOS 14 and later.
function aibSwiftLines(ctx) {
  const { build, scale, radius, modes, def, only } = ctx;
  const mo = build.motion, sh = build.sh || {}, sw = build.sw;
  const inkCta = aibInkCta(def);
  const fillTok = inkCta ? 'ink' : 'primary', onTok = inkCta ? 'canvas' : 'onPrimary';
  const L = modes.find(m => m.mode === 'light'), D = modes.find(m => m.mode === 'dark');
  const out = [];
  const P = (...l) => out.push(...l);

  P(`// Theme.swift: ${ctx.brandName}, ${def.name}. Generated by Branding Designer; change the brief, not these values.`,
    'import SwiftUI', '',
    'extension Color {',
    '    init(hex: UInt32, opacity: Double = 1) {',
    '        self.init(.sRGB, red: Double((hex >> 16) & 0xFF) / 255, green: Double((hex >> 8) & 0xFF) / 255, blue: Double(hex & 0xFF) / 255, opacity: opacity)',
    '    }',
    '    /// Adaptive color: follows the system light or dark appearance.',
    '    init(light: UInt32, dark: UInt32, lightOpacity: Double = 1, darkOpacity: Double = 1) {',
    '        #if canImport(UIKit)',
    '        self = Color(UIColor { $0.userInterfaceStyle == .dark ? UIColor(Color(hex: dark, opacity: darkOpacity)) : UIColor(Color(hex: light, opacity: lightOpacity)) })',
    '        #else',
    '        self = Color(NSColor(name: nil) { $0.bestMatch(from: [.darkAqua, .aqua]) == .darkAqua ? NSColor(Color(hex: dark, opacity: darkOpacity)) : NSColor(Color(hex: light, opacity: lightOpacity)) })',
    '        #endif',
    '    }',
    '}', '', 'enum Palette {');
  const rowsAll = ctx.rows.slice();
  const colour = (token, get) => {
    const lv = aibParseColor(get(L || D)), dv = aibParseColor(get(D || L));
    const l = lv || { hex: 0, a: 1 }, d = dv || { hex: 0, a: 1 };
    const opt = (a, name) => (a !== 1 ? `, ${name}: ${aibOpacity(a)}` : '');
    const lightArg = only === 'dark' ? d : l, darkArg = only === 'light' ? l : d;
    return `Color(light: ${aibHex6(lightArg.hex)}, dark: ${aibHex6(darkArg.hex)}${opt(lightArg.a, 'lightOpacity')}${opt(darkArg.a, 'darkOpacity')})`;
  };
  const seen = new Set();
  const addColour = (token, get, note) => {
    const name = aibSwiftName(token);
    if (seen.has(name)) return;
    seen.add(name);
    P(`    static let ${name} = ${colour(token, get)}${note ? '   // ' + note : ''}`);
  };
  rowsAll.forEach(r => addColour(r.token, r.get, aibStrip(r.job).split('. ')[0].slice(0, 70)));
  rowsAll.forEach(r => r.on.forEach(([tk, g]) => addColour(tk, g, 'text or icon on the fill')));
  P('}', '', 'extension Font {');
  (ctx.app && aibPhoneRows(ctx).length ? aibPhoneRows(ctx) : scale.rows).forEach(r => {
    const name = 'brand' + r.name;
    if (r.face) P(`    static let ${name} = Font.custom("${r.ps}", size: ${r.size}, relativeTo: .${r.style})`);
    else P(`    static let ${name} = Font.system(.${r.style}, design: .monospaced).weight(${AIB_SWIFT_WEIGHT[r.weight] || '.regular'})`);
  });
  const dispNote = scale.rows[0].note;
  if (dispNote) P(`    // Display and Title: ${dispNote}. Apply .textCase(.uppercase) and .tracking(...) at the call site.`);
  P('}', '', 'enum Metrics {',
    `    static let radiusControl: CGFloat = ${radius.control}`,
    `    static let radiusField: CGFloat = ${radius.field}`,
    `    static let radiusCard: CGFloat = ${radius.card}`,
    `    static let outline: CGFloat = ${build.line}`,
    '    static let hit: CGFloat = 44   // minimum tappable size',
    ...(ctx.app && typeof UI_KIT_PHONE !== 'undefined' ? [
      `    static let margin: CGFloat = ${UI_KIT_PHONE.margin}   // side margin of every screen`,
      `    static let buttonHeight: CGFloat = ${UI_KIT_PHONE.buttonHeight}, fieldHeight: CGFloat = ${UI_KIT_PHONE.fieldHeight}, rowHeight: CGFloat = ${UI_KIT_PHONE.rowHeight}, cardPadding: CGFloat = ${UI_KIT_PHONE.cardPadding}`] : []),
    '}', '',
    'enum Spacing {',
    '    static let xs: CGFloat = 4, s: CGFloat = 8, m: CGFloat = 16, l: CGFloat = 24, xl: CGFloat = 32',
    ...(ctx.app ? ['    static let sm: CGFloat = 12, ml: CGFloat = 20, xxl: CGFloat = 40, xxxl: CGFloat = 48'] : []),
    '}', '');
  const ease = n => AIB_SWIFT_EASE[mo.ease](n);
  P('enum Motion {',
    `    static let fast: Double = ${mo.fast / 1000}, base: Double = ${mo.base / 1000}, slow: Double = ${mo.slow / 1000}`,
    `    static let press: Animation = ${mo.ease === 'steps' ? '.linear(duration: 0)' : ease('fast')}`,
    `    static let settle: Animation = ${mo.ease === 'steps' ? '.linear(duration: 0.12)' : ease('base')}`,
    '}', '');

  // ----- class-specific button, surface, field -----
  const shapeOf = r => `RoundedRectangle(cornerRadius: ${r}, style: .continuous)`;
  const rawBlur = v => (v / 2).toString();
  const btn = [];
  const labelFg = 'isEnabled ? Palette.' + onTok + ' : Palette.muted';
  let bg = `isEnabled ? Palette.${fillTok} : Palette.line`;
  let fg = labelFg;
  if (sw === 'stepped') { bg = `isEnabled ? (down ? Palette.ink : Palette.${fillTok}) : Palette.line`; fg = `isEnabled ? (down ? Palette.canvas : Palette.${onTok}) : Palette.muted`; }
  if (sw === 'hard') {
    // With build.shadowToken the shadow is a lip of the fill's own shade: no ink outline on the key.
    if (!build.shadowToken) btn.push('.overlay(shape.strokeBorder(isEnabled ? Palette.ink : Palette.muted, lineWidth: Metrics.outline))');
    btn.push(`.offset(x: down ? ${build.press.dx} : 0, y: down ? ${build.press.dy} : 0)`,
      `.shadow(color: isEnabled ? Palette.shadow : .clear, radius: 0, x: down ? 0 : ${sh.x}, y: down ? 0 : ${sh.y})`);
  } else if (sw === 'soft') {
    btn.push(`.shadow(color: isEnabled ? Palette.shadowLo : .clear, radius: down ? 1.5 : ${rawBlur(sh.blurS || sh.blur)}, x: down ? 1 : ${sh.ds || sh.d}, y: down ? 2 : ${sh.ds || sh.d})`,
      `.shadow(color: isEnabled && !down ? Palette.shadowHi : .clear, radius: ${rawBlur(sh.blurS || sh.blur)}, x: -${sh.ds || sh.d}, y: -${sh.ds || sh.d})`,
      '.scaleEffect(down ? 0.99 : 1)');
  } else if (sw === 'glass') {
    btn.push('.overlay(shape.strokeBorder(Palette.rim, lineWidth: 1))',
      '.overlay(Palette.ink.opacity(down ? 0.12 : 0), in: shape)',
      `.scaleEffect(down ? ${build.press.scale} : 1)`);
  } else if (sw === 'glow') {
    btn.push('.overlay(shape.strokeBorder(Palette.primary, lineWidth: 1))',
      `.shadow(color: Palette.primary.opacity(isEnabled ? ${sh.a} : 0), radius: down ? ${sh.r + 6} : ${sh.r})`,
      `.scaleEffect(down ? ${build.press.scale} : 1)`);
  } else if (sw === 'stepped') {
    btn.push('.overlay(shape.strokeBorder(isEnabled ? Palette.ink : Palette.muted, lineWidth: Metrics.outline))');
  } else {
    if (build.press.opacity !== 1) btn.push(`.opacity(down ? ${build.press.opacity} : 1)`);
    if (build.press.dx != null) btn.push(`.offset(x: down ? ${build.press.dx} : 0, y: down ? ${build.press.dy} : 0)`);
  }
  P('struct ThemeButtonStyle: ButtonStyle {',
    '    @Environment(\\.isEnabled) private var isEnabled',
    '    @Environment(\\.accessibilityReduceMotion) private var reduceMotion',
    '    func makeBody(configuration: Configuration) -> some View {',
    `        let shape = ${shapeOf('Metrics.radiusControl')}`,
    '        let down = configuration.isPressed',
    '        return configuration.label',
    '            .font(.brandHeadline)',
    `            .foregroundStyle(${fg})`,
    '            .padding(.horizontal, Spacing.l)',
    '            .frame(minHeight: Metrics.hit)',
    `            .background(${bg}, in: shape)`,
    ...btn.map(l => '            ' + l),
    '            .animation(reduceMotion ? nil : Motion.press, value: down)',
    '    }',
    '}', '');

  // surface (cards, panels)
  const cardTok = ctx.rows.some(r => r.token === '--card') ? 'card' : 'canvas';
  const surf = [];
  let surfEnv = '';
  if (sw === 'hard' && build.shadowToken) surf.push(`.background(Palette.${cardTok}, in: shape)`, '.overlay(shape.strokeBorder(Palette.line, lineWidth: Metrics.outline))');
  else if (sw === 'hard') surf.push(`.background(Palette.${cardTok}, in: shape)`, '.overlay(shape.strokeBorder(Palette.ink, lineWidth: Metrics.outline))', `.shadow(color: Palette.shadow, radius: 0, x: ${sh.x}, y: ${sh.y})`);
  else if (sw === 'soft') surf.push(`.background(Palette.${cardTok}, in: shape)`, `.shadow(color: Palette.shadowLo, radius: ${rawBlur(sh.blur)}, x: ${sh.d}, y: ${sh.d})`, `.shadow(color: Palette.shadowHi, radius: ${rawBlur(sh.blur)}, x: -${sh.d}, y: -${sh.d})`);
  else if (sw === 'glass') {
    surfEnv = '    @Environment(\\.accessibilityReduceTransparency) private var reduceTransparency';
    surf.push('.background { shape.fill(reduceTransparency ? AnyShapeStyle(Palette.canvas) : AnyShapeStyle(.regularMaterial)) }',
      '.overlay(shape.strokeBorder(reduceTransparency ? Palette.line : Palette.rim, lineWidth: 1))',
      '.shadow(color: .black.opacity(0.18), radius: 12, x: 0, y: 6)');
  } else if (sw === 'glow') surf.push(`.background(Palette.${cardTok}, in: shape)`, '.overlay(shape.strokeBorder(Palette.primary, lineWidth: 1))', `.shadow(color: Palette.primary.opacity(${sh.a}), radius: ${sh.r})`);
  else if (sw === 'stepped') surf.push(`.background(Palette.${cardTok}, in: shape)`, '.overlay(shape.strokeBorder(Palette.ink, lineWidth: Metrics.outline))');
  else surf.push(`.background(Palette.${cardTok}, in: shape)`, '.overlay(shape.strokeBorder(Palette.line, lineWidth: Metrics.outline))');
  P('struct ThemeSurface: ViewModifier {', ...(surfEnv ? [surfEnv] : []),
    '    func body(content: Content) -> some View {',
    `        let shape = ${shapeOf('Metrics.radiusCard')}`,
    '        return content',
    '            .padding(Spacing.m)',
    ...surf.map(l => '            ' + l),
    '    }',
    '}', '');

  // field (text inputs): recessed for soft, outlined otherwise; carries the focus and error states
  const edge = sw === 'hard' && build.edgeToken ? aibSwiftTok(build.edgeToken) : sw === 'hard' || sw === 'stepped' ? 'Palette.ink' : 'Palette.line';
  const edgeW = sw === 'flat' ? 'Metrics.outline' : sw === 'soft' ? '0' : sw === 'glow' || sw === 'glass' ? '1' : 'Metrics.outline';
  const ringLow = ctx.focusLow;
  P('struct ThemeField: ViewModifier {',
    '    var focused = false',
    '    var failed = false',
    '    func body(content: Content) -> some View {',
    `        let shape = ${shapeOf('Metrics.radiusField')}`,
    '        return content',
    '            .font(.brandBody)',
    '            .padding(.horizontal, Spacing.m)',
    '            .frame(minHeight: Metrics.hit)',
    '            .background(Palette.canvas, in: shape)',
    ...(sw === 'soft'
      ? ['            .modifier(Recessed(shape: shape))',
        '            .overlay(shape.strokeBorder(Palette.error, lineWidth: failed ? 1.5 : 0))']
      : [`            .overlay(shape.strokeBorder(failed ? Palette.error : ${edge}, lineWidth: failed ? 2 : ${edgeW}))`]),
    `            .overlay(shape.inset(by: -4).stroke(Palette.${aibPrimaryBarred(ctx.roles) ? 'ink' : 'primary'}, lineWidth: focused ? 3 : 0))`,
    ...(ringLow ? ['            .overlay(shape.inset(by: -6).stroke(Palette.ink, lineWidth: focused ? 1 : 0))'] : []),
    '    }',
    '}', '');
  if (sw === 'soft') {
    P('/// Inset shadow pair: the recessed well. SwiftUI has no inset shadow, so two blurred strokes are clipped inside the shape.',
      'struct Recessed<S: InsettableShape>: ViewModifier {',
      '    let shape: S',
      '    func body(content: Content) -> some View {',
      '        content',
      `            .overlay(shape.stroke(Palette.shadowLo, lineWidth: 6).blur(radius: ${rawBlur(sh.blur)}).offset(x: ${sh.d / 2}, y: ${sh.d / 2}).clipShape(shape))`,
      `            .overlay(shape.stroke(Palette.shadowHi, lineWidth: 6).blur(radius: ${rawBlur(sh.blur)}).offset(x: -${sh.d / 2}, y: -${sh.d / 2}).clipShape(shape))`,
      '    }',
      '}', '');
  }
  P('extension View {',
    '    func themeSurface() -> some View { modifier(ThemeSurface()) }',
    '    func themeField(focused: Bool = false, failed: Bool = false) -> some View { modifier(ThemeField(focused: focused, failed: failed)) }',
    '    /// Page background and default ink; put it on the root view.',
    `    func themePage() -> some View { background(Palette.canvas.ignoresSafeArea()).foregroundStyle(Palette.ink)${only ? '.preferredColorScheme(.' + only + ')' : ''} }`,
    '}');
  return out;
}

function aibSecSwift(ctx) {
  return ['## Theme.swift',
    'Add this file to the target as is. Build every view from `Palette`, `Font.brand*`, `Metrics`, `Spacing`, `Motion`, `ThemeButtonStyle`, `themeSurface()`, `themeField()` and `themePage()`; never hard-code a color, size or duration. It covers the pressed, disabled, focus and error states; empty and loading follow the States table.',
    '```swift', ...aibSwiftLines(ctx), '```'];
}


/* ---------------- patterns (asset files, not engine instructions) ---------------- */

const AIB_USE_SHORT = {
  hero: 'Patterns only as quiet section backgrounds; never a full-bleed hero',
  band: 'full-width section band 160 to 320 tall, at most two per page',
  card: 'low-contrast texture on at most one card per view',
  divider: 'decorative divider 24 to 64 tall, repeat-x, aria-hidden',
  accent: 'small detail up to 200 across, one per view, aria-hidden',
};

// The patterns in the brief (state.patterns): one asset file each. SVG for vector families
// (a 160px seamless tile, or a 1600x900 drawing), PNG for raster ones.
function aibPatternAssets(state0) {
  if (typeof Patterns === 'undefined' || typeof PatternPins === 'undefined' || typeof Patterns.list !== 'function') return [];
  const { state, def } = abView(state0);
  const pins = PatternPins.normalizeList(state.patterns);
  const t = boardTokens(state, def);
  return pins.map((entry, i) => {
    const f = Patterns.list().find(x => x.key === entry.key);
    if (!f) return null;
    const use = entry.use || PatternPins.defaultUse(entry.key);
    const kind = f.vector ? 'svg' : 'png';
    return { i, entry, f, use, kind, t, name: `patterns/${String(i + 1).padStart(2, '0')}-${entry.key}-${use}.${kind}` };
  }).filter(Boolean);
}

function aibPatternLine(ctx, a) {
  const { entry, f, t, use } = a;
  const cwWord = v => ((Patterns.E.COLORWAYS.find(c => c.value === v) || {}).label || v);
  const inks = Patterns.inksFor(t, entry.colorway, { tints: !!(entry.params && entry.params.tints) });
  const fin = Patterns.finalInks(entry.key, entry.params, inks);
  const names = [['--canvas', t.canvas], ['--ink', t.ink], ['--primary', aibPri(t)], ['--secondary', t.secondary], ['--accent', t.accent]];
  const tokenOf = hex => { const h = names.find(([, v]) => String(v).toLowerCase() === String(hex).toLowerCase()); return h ? ctx.tok(h[0]) : 'derived'; };
  const slots = (f.ink || ['ground', 'ink1']).slice();
  if (entry.params && entry.params.tints) slots.push('t1', 't2');
  const inkText = slots.filter(k => fin[k]).map(k => `${k} ${fin[k]} (${tokenOf(fin[k])})`).join(', ');
  const png = (AIB_USE_RULES[use] || AIB_USE_RULES.hero).png === '2x' ? '2560x1440' : '1280x720';
  const shape = a.kind === 'svg'
    ? (f.seamless ? 'seamless 160px tile, repeat it' : '1600x900 drawing, scale to cover')
    : `${png} image, scale to cover`;
  return `- \`${a.name}\`: ${f.name} (${cwWord(entry.colorway)}), ${AIB_USE_SHORT[use] || AIB_USE_SHORT.hero}; ${shape}. Inks: ${inkText}.`;
}

// "Copy patterns only": the Patterns section on its own, to paste after an existing brief.
function buildPatternsBrief(state0, opts) {
  const ctx = aibContext(state0, Object.assign({ noProbe: true }, opts, { surface: 'web' }));
  const lines = aibSecPatterns(ctx);
  if (!lines.length) return '';
  return `Add this Patterns section to the ${ctx.brandName} build brief. Its colors are the tokens from that brief and every hex is final.\n\n` + lines.join('\n');
}

// One pattern's block (item i of state.patterns), for the per-item Copy in the cart.
function buildPatternItemBrief(state0, i, opts) {
  const ctx = aibContext(state0, Object.assign({ noProbe: true }, opts, { surface: 'web' }));
  const a = ctx.assets[i];
  if (!a) return '';
  return `Pattern for the ${ctx.brandName} build brief. Use the file as is, backgrounds and textures only, with copy on a solid ${ctx.tok('`--canvas`')} plate (4.5:1 or better).\n\n` + aibPatternLine(ctx, a);
}

/* ---------------- the brief ---------------- */

// How firmly an agent must follow each section. Locked: values are final. Guided: an intent and a range to
// stay inside. Free: designed for the product. Every "## " heading in the brief carries its tier.
const AIB_TIERS = {
  'Why this works': 'Guided', 'Signature and product imagery': 'Guided', 'App UI rules': 'Guided', 'Website rules': 'Guided', 'Blend': 'Guided', 'Built screens': 'Guided', 'Product screens': 'Guided',
  'Phone layout and type': 'Guided', 'Motion': 'Guided', "Do and don't": 'Guided',
  'Colors': 'Locked', 'Components': 'Locked', 'UI kit': 'Locked', 'Type': 'Locked', 'Website type': 'Locked', 'Shape and materials': 'Locked',
  'Light and dark': 'Locked', 'States': 'Locked', 'Accessibility': 'Locked', 'Icons': 'Locked', 'App icon': 'Locked', 'Fonts to bundle': 'Locked',
  'Logo': 'Locked', 'Tokens (CSS)': 'Locked', 'Theme.swift': 'Locked', 'Patterns': 'Locked', 'Specimen copy': 'Locked',
  'Screen layouts': 'Free',
};

// "## Colors" -> "## Colors (Locked)". "Blend: X" takes the tier of "Blend". An unlisted section is Guided.
function aibTierOf(title) {
  const t = String(title).replace(/\s*\((?:Locked|Guided|Free)\)$/, '');
  return AIB_TIERS[t] || AIB_TIERS[t.replace(/:.*$/, '')] || 'Guided';
}
function aibTierHeading(line) {
  const m = /^## (.*)$/.exec(line);
  if (!m || /\((?:Locked|Guided|Free)\)$/.test(m[1])) return line;
  return `## ${m[1]} (${aibTierOf(m[1])})`;
}
// The section title without its tier tag.
const aibStripTier = title => String(title).replace(/\s*\((?:Locked|Guided|Free)\)$/, '');

const AIB_HEADER_TIERS = 'Build the real product from this brief, not a mock-up. Sections are marked Locked, Guided or Free. Locked values are final: use only these colors, fonts, shapes and motion, and where one is missing use the nearest listed token. Guided sections give an intent and a range; stay inside them. Free means design it for this product: layout, screen structure and how many sections a screen has. ';
const AIB_HEADER_APP = 'Screens are composed from the UI kit below, one component for each need; do not invent new component styles, and do not copy the brand board\'s layout. ';

/* ---- Why this works: the reasons behind the style, from js/aesthetic-principles.js ---- */

// The aesthetics a brief draws on: the base, plus the blend donor when the style is a blend.
// Returns [{ name, data }] for those with principles; nothing when the data file is missing.
function aibPrinciplesFor(ctx) {
  const all = (typeof window !== 'undefined' && window.AESTHETIC_PRINCIPLES) || (typeof AESTHETIC_PRINCIPLES !== 'undefined' ? AESTHETIC_PRINCIPLES : null);
  if (!all || typeof all !== 'object') return [];
  const def = ctx.def || {};
  const bd = def.blend;
  const list = bd && bd.base && bd.donor
    ? [[bd.base.key, bd.base.name], [bd.donor.key, bd.donor.name]]
    : [[ctx.key || def.classicOf || def.key, def.name]];
  const seen = {};
  return list.map(([key, name]) => {
    const k = String(key || '').replace(/--classic$/, '');
    const data = all[k] || all[key];
    if (!data || seen[k]) return null;
    seen[k] = 1;
    const principles = Array.isArray(data.principles) ? data.principles.filter(p => p && p.rule) : [];
    const traps = Array.isArray(data.traps) ? data.traps.filter(t => t && t.element) : [];
    return principles.length || traps.length ? { name: name || k, principles, traps } : null;
  }).filter(Boolean);
}

// Pure: entries [{ name, principles, traps }] -> the section's lines. Empty when there is nothing to say.
function aibWhyLines(entries, tok) {
  if (!entries || !entries.length) return [];
  const t = typeof tok === 'function' ? tok : (x => x);
  const end = s => { const v = String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); return v && !/[.!?]$/.test(v) ? v + '.' : v; };
  const out = ['## Why this works', 'The reasons behind the style, most important first. Keep the reason and change the drawing where a board element does not fit a phone screen.'];
  entries.forEach(e => {
    if (entries.length > 1) out.push('', `### ${e.name}`);
    else out.push('');
    e.principles.forEach((p, i) => out.push(t(`${i + 1}. **${String(p.rule).trim()}** On the board: ${end(p.board)} In the app: ${end(p.app)}`)));
    if (e.traps.length) {
      out.push('', 'Literal traps — board elements that do not reach the app as drawn:');
      e.traps.forEach(x => out.push(t(`- ${String(x.element).trim().replace(/[.:;]+$/, '')}: ${String(x.instead).trim()}`)));
    }
  });
  return out;
}

function aibSecWhy(ctx) {
  return ctx.app ? aibWhyLines(aibPrinciplesFor(ctx), ctx.tok) : [];
}

/* ---- Product screens: the product sheet's screens as a Screen spec per screen (docs/product-sheet-format.md) ---- */

// One content block in plain words (no pixel positions).
function aibProductBlock(b) {
  const q = v => '"' + String(v == null ? '' : v).replace(/\s+/g, ' ').trim() + '"';
  const p = b.props || {}, t = b.text || '';
  const yes = v => /^(yes|true|on)$/i.test(String(v || '').trim());
  const list = v => String(v || '').split(';').map(x => x.trim()).filter(Boolean);
  const pinned = /^bottom$/i.test(p.pin || '') ? ', pinned in a bottom bar above the home indicator or tab bar, always above the fold' : '';
  let s;
  switch (b.type) {
    case 'title': s = `Large title ${q(t)}` + (p.highlight ? `, highlight word ${q(p.highlight)}` : ''); break;
    case 'hero-numeral': s = `Hero numeral ${q(t)}` + (p.label ? `, labelled ${q(p.label)}` : '') + (p.meta ? `, with ${q(p.meta)}` : ''); break;
    case 'text': s = (/^large$/i.test(p.size || '') ? 'Title-size line ' : yes(p.muted) ? 'Muted caption ' : 'Body line ') + q(t); break;
    case 'action': s = `The one primary button ${q(t)}` + (p.meta ? `, with ${q(p.meta)}` : '') + pinned; break;
    case 'action-secondary': s = `Secondary button ${q(t)}` + (p.meta ? `, with ${q(p.meta)}` : '') + pinned; break;
    case 'link': s = `Text link ${q(t)}`; break;
    case 'card': s = `Card ${q(t)}` + (p.meta ? `, with ${q(p.meta)}` : '') + (p.body ? `, body ${q(p.body)}` : ''); break;
    case 'list': {
      const rows = list(p.rows).map(r => {
        const c = r.split(/\s+—\s+|—/).map(x => x.trim()).filter(Boolean);
        return c.length > 1 ? `${q(c[0])} (${c[1]}${c[2] ? ', ' + c.slice(2).join(', ') : ''})` : q(c[0] || r);
      });
      s = `List group ${q(t)}` + (rows.length ? ` with ${rows.length} row${rows.length > 1 ? 's' : ''}: ${rows.join('; ')}` : ''); break;
    }
    case 'stats': {
      const items = list(p.items).map(x => x.replace(/\s*=\s*/, ': '));
      s = `Stat row ${q(t)}` + (items.length ? ` with ${items.join('; ')}` : ''); break;
    }
    case 'chart': {
      const pts = String(p.points || '').split(',').map(x => parseFloat(x)).filter(x => !isNaN(x));
      s = `Sparkline ${q(t)} in the style's chart colour` + (pts.length > 1 ? `, ${pts.length} points from ${pts[0]} to ${pts[pts.length - 1]}` : ''); break;
    }
    case 'segmented': s = `Segmented control ${q(t)}` + (list(p.options).length ? ` with options ${list(p.options).map(q).join(', ')}` : '') + (p.selected ? `, ${q(p.selected)} selected` : ''); break;
    case 'toggle': s = `Toggle row ${q(t)}, ${yes(p.on) ? 'on' : 'off'}` + (p.meta ? `, with ${q(p.meta)}` : ''); break;
    case 'field': s = `Input field ${q(t)}` + (p.value ? `, value ${q(p.value)}` : '') + (p.placeholder ? `, placeholder ${q(p.placeholder)}` : ''); break;
    case 'keypad': s = `Number keypad with keys ${p.keys || '1 2 3 4 5 6 7 8 9 . 0 ⌫'}, pinned in a bottom bar above the home indicator, always above the fold`; break;
    case 'tiles': {
      const n = String(p.values || '').split(',').filter(x => x.trim()).length;
      s = `Tile strip ${q(t)}` + (n ? `, ${n} tiles in tonal steps` : ''); break;
    }
    default: s = `${b.type} ${q(t)}`;
  }
  return s;
}

function aibSecProduct(ctx) {
  const P = ctx.product;
  if (!P) return [];
  const out = ['## Product screens', `These are ${P.name || 'the product'}'s own screens, from its product sheet. What gets checked is the content ranking (1 is the most important), where the style's signature lands, and the fold budget; the layout itself is designed for the product from the kit's components, with no pixel positions given.` + (ctx.comps ? ' Each screen has a comp image in comps/ showing the intended look in light and dark; match its ranking and feel, not its exact positions.' : ' Comps of these screens are viewable in Branding Designer only.')];
  const end = s => { const v = String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); return v && !/[.!?]$/.test(v) ? v + '.' : v; };
  P.screens.forEach(sc => {
    const selected = (P.tabs || []).find(t => t.toLowerCase() === String(sc.name).toLowerCase());
    const chrome = sc.chrome === 'tabbar' ? `Tab bar${(P.tabs || []).length ? ` (${P.tabs.join(', ')})` : ''}${selected ? `, ${selected} selected` : ''}` : sc.chrome === 'none' ? 'None: no top bar and no tab bar' : 'Top bar';
    out.push('', `### ${sc.name}`,
      `- Job: ${end(sc.job) || 'not specified'}`,
      `- Primary action: ${sc.primary ? sc.primary : 'none on this screen'}`,
      `- Chrome: ${chrome}`,
      '- Content, ranked:');
    sc.blocks.forEach(b => out.push(`  ${b.rank}. ${end(aibProductBlock(b))}`));
    out.push(`- Signature placement: ${sc.signature ? end(sc.signature) : 'none on this screen'}`,
      `- Fold budget: ${sc.fold ? end(sc.fold) : 'not specified'}`,
      '- States:',
      `  - Empty: ${sc.states.empty}`, `  - Loading: ${sc.states.loading}`, `  - Error: ${sc.states.error}`, `  - First run: ${sc.states.firstRun}`);
    if (sc.notes && sc.notes.length) out.push('- Notes from the sheet: ' + sc.notes.map(end).join(' '));
    if (ctx.comps) out.push(`- Comp: comps/${sc.id}-light.png, comps/${sc.id}-dark.png`);
  });
  return out;
}

function aibBuild(ctx) {
  const label = AIB_TARGETS.find(x => x.value === ctx.target).label;
  const blocks = [
    [`# ${ctx.brandName} — build brief`,
      AIB_HEADER_TIERS + (ctx.app ? AIB_HEADER_APP : '') + (ctx.app && !ctx.site && ctx.target === 'web' ? 'Target: a phone app in HTML and CSS, laid out in iOS points (1pt = 1 CSS px).' : `Target: ${label}${ctx.target === 'web' ? ' (CSS)' : ctx.target === 'swiftui' ? ' (iOS 17 and macOS 14 or later)' : ' (CSS and SwiftUI)'}.`),
      aibBrandLine(ctx)].concat(ctx.product ? [`Product: ${ctx.product.name}. ${ctx.product.purpose}`.replace(/\s+/g, ' ').trim()] : []),
    aibSecAppRules(ctx),
    aibSecWebRules(ctx),
    aibSecWhy(ctx),
    aibSecVoice(ctx),
    aibSecSpecimen(ctx),
    aibSecBlend(ctx),
    aibSecColors(ctx),
    aibSecLogo(ctx),
    ctx.app ? aibSecKit(ctx) : aibSecComponents(ctx),
    ctx.product ? aibSecProduct(ctx) : aibSecScreens(ctx),
    ctx.product ? [] : aibSecBuilt(ctx),
    ctx.phone ? aibSecPhone(ctx) : [],
    aibSecType(ctx),
    aibSecShape(ctx),
    aibSecModes(ctx),
    aibSecStates(ctx),
    aibSecMotion(ctx),
    aibSecA11y(ctx),
    aibSecIcons(ctx),
    ctx.app ? [] : aibSecAppIcon(ctx),
    aibSecFonts(ctx),
    aibSecImagery(ctx),
    aibSecRules(ctx),
    ctx.web ? aibSecCss(ctx) : [],
    ctx.swift ? aibSecSwift(ctx) : [],
    aibSecPatterns(ctx),
    ctx.app ? aibSecAppIcon(ctx) : [],
  ].filter(b => b.length).map(b => [aibTierHeading(b[0])].concat(b.slice(1)));
  const md = blocks.map(b => b.join('\n')).join('\n\n') + '\n';
  // Other sections point at the sample "Built screens"; with the product's own screens there is no such section.
  return ctx.product ? md.replace(/ \(see Built screens\)/g, '').replace('as Built screens → Home → Tab bar lists', 'as the tab bar row lists').replace(/the Built screens/g, 'the sample screens').replace(/Built screens/g, 'the sample screens') : md;
}

// The brief and the context it was built from (the missing-token pass can add palette rows to the context).
function aibBriefParts(state0, opts) {
  const ctx = aibContext(state0, opts);
  let md = aibBuild(ctx);
  if (ctx.app && ctx.kit) {
    const css = (md.match(/```css\n[\s\S]*?```/) || [''])[0];
    const defined = new Set(css.match(/--[a-z0-9-]+(?=:)/g) || []);
    const prose = md.replace(/```[\s\S]*?```/g, '');
    const missing = Array.from(new Set(prose.match(/--[a-z][a-z0-9-]*[a-z0-9]/g) || [])).filter(t => !defined.has(t) && !AIB_TOKEN_SKIP.test(t) && ctx.modes.every(m => aibRgba(aibTokenValue(ctx, t, m))));
    if (missing.length) {
      missing.forEach(t => { const v = {}; ctx.modes.forEach(m => { v[m.mode] = aibTokenValue(ctx, t, m); }); ctx.rows.push({ token: t, get: m => v[(m && m.mode) || ctx.modes[0].mode] || v[ctx.modes[0].mode], job: 'Named in this brief (a colour of the style).', on: [] }); });
      ctx._phone = null;
      md = aibBuild(ctx);
    }
  }
  // zero distances read as words, outside code blocks ("0pt apart" -> "with no gap")
  md = md.split(/(```[\s\S]*?```)/).map((part, i) => (i % 2 ? part : part
    .replace(/\b0pt apart\b/g, 'with no gap between them').replace(/\b0pt above and below\b/g, 'no space above and below')
    .replace(/\b0pt (below|above) (it|the button|the previous block)/g, 'directly $1 $2').replace(/\b0pt in from\b/g, 'flush with')
    .replace(/\b0pt\b/g, 'no'))).join('');
  return { ctx, md };
}

// Tokens that are not colours of the palette (type, space, motion and layout variables).
const AIB_TOKEN_SKIP = /^--(x|shadow-|font-|text-|space-|radius-|row|top-bar|tab-bar|status-bar|home-indicator|margin|hit|dur|ease)/;

function buildAiBrief(state0, opts) {
  return aibBriefParts(state0, opts).md;
}

// { md, issues } for callers that show the lint beside the text (the Brief view).
function buildAiBriefChecked(state0, opts) {
  const { ctx, md } = aibBriefParts(state0, opts);
  let issues = [];
  try { issues = aibLint(ctx, md); } catch (err) { if (typeof console !== 'undefined') console.warn('brief lint failed', err); }
  return { md, issues };
}

function aiBriefLint(state0, opts) {
  return buildAiBriefChecked(state0, opts).issues;
}

// The prompt shown before a brief with problems is copied or saved (pure, so it is testable).
function aibLintMessage(issues) {
  const n = issues.length, shown = issues.slice(0, 6).map(i => '- ' + i.message);
  if (n > shown.length) shown.push(`- and ${n - shown.length} more`);
  return `This brief has ${n} ${n === 1 ? 'problem' : 'problems'} an agent would have to guess at:\n\n${shown.join('\n')}\n\nExport anyway?`;
}
// true when there is nothing to confirm, or the user chose to export anyway.
function aibLintConfirm(issues) {
  if (!issues || !issues.length) return true;
  if (typeof window === 'undefined' || typeof window.confirm !== 'function') return true;
  return window.confirm(aibLintMessage(issues));
}

/* ---------------- lint: contradictions a brief must not ship with ---------------- */

// Plain-English problems an agent would have to guess at. Pure: reads the context (palette rows, modes) and
// the finished Markdown. Returns [{ code, section, message }]; [] when the brief is consistent.
// Codes: contrast, primary-on-canvas, recipe-vs-prose, undefined-token, flat-gradient.
const AIB_HEXRE = /^#[0-9a-f]{6}$/i;

function aibLintTables(md) {
  // Tables outside code fences, with the section each sits in: [{ section, head, rows }]
  const out = [];
  const lines = md.split('\n');
  let sec = '', fence = false;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^```/.test(l)) { fence = !fence; continue; }
    if (fence) continue;
    const h = /^## (.*)$/.exec(l);
    if (h) { sec = aibStripTier(h[1]); continue; }
    if (/^\|/.test(l) && /^\|[\s:|-]+\|\s*$/.test(lines[i + 1] || '')) {
      const cut = s => s.trim().replace(/^\|/, '').replace(/\|\s*$/, '').split(/(?<!\\)\|/).map(c => c.replace(/\\\|/g, '|').trim());
      const head = cut(l), rows = [];
      i += 2;
      while (i < lines.length && /^\|/.test(lines[i])) rows.push(cut(lines[i++]));
      i--;
      out.push({ section: sec, head, rows });
    }
  }
  return out;
}

function aibLint(ctx, md) {
  const issues = [];
  const add = (code, section, message) => issues.push({ code, section, message });
  const modes = (ctx && ctx.modes) || [];
  const multi = modes.length > 1;
  const inMode = m => (multi ? ` in ${m.mode} mode` : '');
  const val = (tk, m) => { try { return String(aibTokenValue(ctx, tk, m) || '').trim(); } catch (err) { return ''; } };
  const ratio = (a, b) => (AIB_HEXRE.test(a) && AIB_HEXRE.test(b) ? contrastRatio(a, b) : null);
  const seen = new Set();
  const once = (key, fn) => { if (!seen.has(key)) { seen.add(key); fn(); } };

  // (a) contrast: Colors "On" pairs, accent-ink, and the Fill / Text pairs of the component tables
  (ctx.rows || []).forEach(r => {
    if (/^Decorative only/.test(r.job || '')) return;
    (r.on || []).forEach(([tk, get]) => modes.forEach(m => {
      const fg = String(get(m) || '').trim(), bg = String(r.get(m) || '').trim();
      const k = ratio(fg, bg);
      if (k != null && k < 4.5) once(`c|${tk}|${r.token}|${m.mode}`, () => add('contrast', 'Colors', `\`${tk}\` text (${fg}) on \`${r.token}\` (${bg}) is ${k.toFixed(2)}:1${inMode(m)}; text needs 4.5:1.`));
    }));
  });
  const accentInk = (ctx.rows || []).find(r => r.token === '--accent-ink'), canvas = (ctx.rows || []).find(r => r.token === '--canvas');
  if (accentInk && canvas) modes.forEach(m => {
    const k = ratio(String(accentInk.get(m) || '').trim(), String(canvas.get(m) || '').trim());
    if (k != null && k < 3) add('contrast', 'Colors', `The highlight word colour \`--accent-ink\` on \`--canvas\` is ${k.toFixed(2)}:1${inMode(m)}; it needs 3:1.`);
  });

  const solo = cell => { const m = /^`?(--[a-z][a-z0-9-]*[a-z0-9])`?(?:\s*\([^)]*\))?$/.exec(String(cell || '').trim()); return m ? m[1] : null; };
  const edgeDrawn = cell => /(\d+(?:\.\d+)?(?:px|pt)\s+(?:solid|dashed|dotted|double|--|#)|\b(?:ring|outline|border|edge)\b|^`?(?:--[a-z]|#[0-9a-f]{3}))/i.test(String(cell || '')) && !/^(none|no edge|n\/a)\b/i.test(String(cell || '').trim());
  aibLintTables(md).forEach(tb => {
    const col = re => tb.head.findIndex(h => re.test(h));
    const iEl = col(/^element$/i), iFill = col(/^fill$/i), iText = col(/^text$/i), iEdge = col(/^edge/i);
    if (iEl < 0 || iFill < 0 || iText < 0) return;
    tb.rows.forEach(row => {
      const el = row[iEl] || '';
      const fillTk = solo(row[iFill]), textTk = solo(row[iText]);
      if (fillTk && textTk) modes.forEach(m => {
        const fg = val(textTk, m), bg = val(fillTk, m), k = ratio(fg, bg);
        if (k != null && k < 4.5) once(`k|${el}|${textTk}|${fillTk}|${m.mode}`, () => add('contrast', tb.section, `${el}: \`${textTk}\` text (${fg}) on a \`${fillTk}\` fill (${bg}) is ${k.toFixed(2)}:1${inMode(m)}; it needs 4.5:1.`));
      });
      if (fillTk && /^(Primary|Main) button/i.test(el) && !(iEdge >= 0 && edgeDrawn(row[iEdge]))) modes.forEach(m => {
        const fill = val(fillTk, m), ground = val('--canvas', m), k = ratio(fill, ground);
        if (k != null && k < 1.5) once(`p|${fillTk}|${m.mode}`, () => add('primary-on-canvas', tb.section, `The ${el.toLowerCase()} fill (\`${fillTk}\`, ${fill}) is ${k.toFixed(2)}:1 against the canvas (${ground})${inMode(m)} and has no edge, so the main action would be nearly invisible.`));
      });
    });
  });

  // (b) rules that deny a look the recipes and kit rows then use
  const lines = md.split('\n');
  let sec = '', fence = false, siteOnly = false;
  const rules = [], evidence = { shadow: null, gradient: null, blur: null };
  const CLAIMS = [
    ['shadow', /\b(?:no|never use|never add|without|avoid)\s+(?:any\s+)?(?:(?:soft|drop|heavy)\s+)?(?:box[- ])?(?:drop\s+)?shadows?\b(?!\s+(?:on|in|behind|over|under|across|inside|for|beyond|unless)\b)/i],
    ['gradient', /\b(?:no|never use|never add|without|avoid)\s+(?:any\s+)?(?:\w+\s+)?gradients?\b(?!\s+(?:on|in|behind|over|under|across|inside|for|beyond|unless)\b)/i],
    ['blur', /\b(?:no|never use|never add|without|avoid)\s+(?:any\s+)?(?:backdrop[- ])?(?:blur|frosted glass|glassmorphism)\b(?!\s+(?:on|in|behind|over|under|across|inside|for|beyond|unless)\b)/i],
    ['flat', /\b(?:everything|every surface|all surfaces|the whole interface|the interface|surfaces) (?:is|are|stays?|stay) (?:completely |entirely |fully )?flat\b/i],
  ];
  const EVID = {
    shadow: /box-shadow[ \t]*:[ \t]*(?![ \t]|none\b|(?:inset )?0(?:px)? 0(?:px)? 0(?:px)? )[^;}\n]+/i,
    gradient: /(?<!repeating-)(?:linear|radial|conic)-gradient\([^\n]*\)/i,
    blur: /backdrop-filter[ \t]*:[ \t]*(?![ \t]|none\b)[^;}\n]+/i,
  };
  const WORD_EVID = {
    shadow: /\b(?:drop|soft|hard|offset|layered|inset|glow)\s+shadows?\b/i,
    gradient: null,
    blur: /\bbackdrop[- ](?:filter|blur)\b/i,
  };
  lines.forEach(l => {
    if (/^```/.test(l)) { fence = !fence; return; }
    const h = /^## (.*)$/.exec(l);
    if (h) { sec = aibStripTier(h[1]); siteOnly = false; return; }
    if (/^(?:\*\*)?Website only/i.test(l)) siteOnly = true;
    if (/^### /.test(l) || (!l.trim() && false)) return;
    const isRule = !fence && /^- (?:Don't|Do|Never|Always|Rule)\b/.test(l) && /^(?:Do and don't|App UI rules|Website rules)$/.test(sec);
    if (isRule) { rules.push({ sec, text: l.replace(/^- /, '') }); return; }
    if (siteOnly && ctx.app) return;
    const isRow = /^\|/.test(l);
    ['shadow', 'gradient', 'blur'].forEach(k => {
      if (evidence[k]) return;
      const m = (fence || /^- \*\*/.test(l) ? EVID[k].exec(l) : null) || (isRow && WORD_EVID[k] && /^(?:UI kit|Components)$/.test(sec) ? WORD_EVID[k].exec(l) : null);
      if (m) evidence[k] = { sec, snippet: m[0].replace(/\s+/g, ' ').slice(0, 70) };
    });
  });
  rules.forEach(r => CLAIMS.forEach(([kind, re]) => {
    const hit = re.exec(r.text);
    // only a blanket denial: it opens the rule, and is not about one element ("the headline ... with no shadow")
    if (!hit || hit.index > 45 || /\b(?:headlines?|titles?|headings?|text|labels?|icons?|logos?|photos?|images?)\b/i.test(r.text.slice(0, hit.index))) return;
    // a rule that carves out an exception ("except", "only", "unless") is not a blanket denial
    if (/\b(?:except|only|unless|apart from|other than|outside|besides|aside from)\b/i.test(r.text)) return;
    const kinds = kind === 'flat' ? ['shadow', 'gradient'] : [kind];
    kinds.forEach(k => {
      const ev = evidence[k];
      if (!ev) return;
      const what = { shadow: 'a shadow', gradient: 'a gradient', blur: 'a blur (backdrop-filter)' }[k];
      once(`r|${k}|${r.text}`, () => add('recipe-vs-prose', r.sec, `A rule says "${r.text.replace(/^(?:Do|Don't): /, '').slice(0, 90)}", but ${ev.sec} uses ${what} (\`${ev.snippet}\`). Pick one.`));
    });
  }));

  // (c) named but undefined: a token in prose with no value, and a gradient that is one colour
  const css = (md.match(/```css\n[\s\S]*?```/g) || []).join('\n');
  const defined = new Set(css.match(/--[a-z0-9-]+(?=\s*:)/g) || []);
  (ctx.rows || []).forEach(r => { defined.add(r.token); (r.on || []).forEach(([tk]) => defined.add(tk)); });
  Object.keys(ctx.kitVars || {}).forEach(k => defined.add(k));
  const prose = md.replace(/```[\s\S]*?```/g, '');
  const swiftOnly = !!ctx.swiftOnly;
  if (!swiftOnly) {
    let curSec = '';
    prose.split('\n').forEach(l => {
      const h = /^## (.*)$/.exec(l);
      if (h) { curSec = aibStripTier(h[1]); return; }
      (l.match(/--[a-z][a-z0-9-]*[a-z0-9](?![a-z0-9*-])/g) || []).forEach(t => {
        if (defined.has(t) || AIB_TOKEN_SKIP.test(t)) return;
        if (modes.length && modes.every(m => val(t, m))) return;
        once(`u|${t}`, () => add('undefined-token', curSec, `\`${t}\` is named in the text but has no value anywhere in the brief.`));
      });
    });
  }
  const stopKey = (s, m) => {
    const v = /^var\((--[a-z0-9-]+)\)$/i.exec(s);
    if (v) { const x = m ? val(v[1], m) : ''; return (x || s).toLowerCase().replace(/\s+/g, ''); }
    return s.toLowerCase().replace(/\s+/g, '');
  };
  const grads = [];
  const gre = /((?:repeating-)?(?:linear|radial|conic)-gradient)\(/gi;
  let gm;
  while ((gm = gre.exec(md))) {
    let depth = 1, i = gre.lastIndex;
    for (; i < md.length && depth; i++) { if (md[i] === '(') depth++; else if (md[i] === ')') depth--; }
    if (depth) continue;
    grads.push({ body: md.slice(gre.lastIndex, i - 1), tail: md.slice(i, i + 60).split(/[;,\n]/)[0] });
  }
  grads.forEach(({ body, tail }) => {
    const parts = []; let d = 0, cur = '';
    for (const ch of body) { if (ch === '(') d++; if (ch === ')') d--; if (ch === ',' && !d) { parts.push(cur.trim()); cur = ''; } else cur += ch; }
    parts.push(cur.trim());
    const stops = parts.filter((p, i) => !(i === 0 && /^(?:to\s|[-\d.]+(?:deg|turn|rad|grad)\b|circle|ellipse|closest|farthest|at\s|from\s|in\s)/i.test(p)))
      .map(p => (/^(#[0-9a-f]{3,8}|(?:rgba?|hsla?)\([^)]*\)|var\(--[a-z0-9-]+\)|[a-z]+)/i.exec(p) || [''])[0]).filter(Boolean);
    if (stops.length < 2) return;
    const sameIn = m => new Set(stops.map(s => stopKey(s, m))).size === 1;
    // one colour written the same way twice and then sized or boxed is how a plain line or fill is drawn (not a mistake)
    const drawn = new Set(stops.map(x => x.toLowerCase().replace(/\s+/g, ''))).size === 1 && /\/|no-repeat|-box\b/.test(tail);
    if (!drawn && (modes.length ? modes.some(sameIn) : sameIn(null))) once(`g|${stops.join()}`, () => add('flat-gradient', 'Gradients', `A gradient runs from ${stops[0]} to ${stops[stops.length - 1]}, but every stop is the same colour, so it draws as a flat fill.`));
  });
  // A product loaded: every screen must be approved in its current look (js/product-sheet.js). The Brief view blocks export on this code.
  if (ctx && ctx.product && ctx.state0 && typeof productApprovalStatus === 'function') {
    const st = productApprovalStatus(ctx.state0);
    if (!st.allApproved) add('unapproved-screens', 'Product screens', `Approve every product screen first (${st.approved} of ${st.total} approved)`);
  }
  return issues;
}

/* ---------------- checks: contradictions to resolve before copying ---------------- */

const AIB_ACK_KEY = 'brandingDesigner.briefAck';
function aibAckSet() {
  try { return new Set(JSON.parse(localStorage.getItem(AIB_ACK_KEY) || '[]')); } catch (err) { return new Set(); }
}
function aibAck(id) {
  const s = aibAckSet();
  s.add(id);
  try { localStorage.setItem(AIB_ACK_KEY, JSON.stringify(Array.from(s).slice(-200))); } catch (err) { /* session only */ }
}

// A lightness shift of `hex` until a readable label (white or near-black) reaches 4.5:1 on it.
function aibNudgeFill(hex) {
  const hsl = hexToHsl(hex);
  const best = h => Math.max(contrastRatio('#ffffff', h), contrastRatio('#141414', h));
  for (let d = 1; d <= 60; d++) {
    for (const sgn of [-1, 1]) {
      const l = hsl.l + sgn * d;
      if (l < 0 || l > 100) continue;
      const c = hslToHex(hsl.h, hsl.s, l);
      if (best(c) >= 4.5) return c;
    }
  }
  return null;
}

const aibDist = (a, b) => { const x = hexToRgb(a), y = hexToRgb(b); return Math.sqrt((x.r - y.r) ** 2 + (x.g - y.g) ** 2 + (x.b - y.b) ** 2); };

// Problems the brief would otherwise export: a face on the aesthetic's avoid list, a weight the
// face does not publish, two colour roles that are one colour, a failing contrast pair. Each issue
// is { id, kind, text, fixes: [{ label, run(), hint }] }; a fix runs against the live editor state.
function aibCheck(state0, opts) {
  const ctx = aibContext(state0, { target: 'web', noProbe: !!(opts && opts.noProbe) });
  const { state, scale } = ctx;
  const issues = [];
  const acked = aibAckSet();
  const locked = k => !!(state0.locks && state0.locks[k]);

  // 1. faces on the aesthetic's avoid list
  const metaKey = ctx.def.blend && ctx.def.blend.typeFrom ? ctx.def.blend.typeFrom : ctx.def.key;
  const fits = fontFitFor(metaKey, state);
  const meta = aestheticMeta(metaKey);
  if (fits && meta) {
    const clsOf = f => (FONT_CLASSES[f.cls] ? FONT_CLASSES[f.cls].label : f.cls);
    const bad = [];
    if (fits.heading === 'avoid') bad.push(`heading font ${state.headingFont.name} (${clsOf(state.headingFont)})`);
    if (fits.body === 'avoid') bad.push(`body font ${state.bodyFont.name} (${clsOf(state.bodyFont)})`);
    if (bad.length) {
      const base = aestheticMeta(state0.aesthetic);
      const pair = base && base.fonts.pairings[0];
      const fixes = [];
      if (pair && typeof applyRecommendedFonts === 'function') {
        fixes.push({
          label: `Use ${pair[0]}${pair[1] !== pair[0] ? ' / ' + pair[1] : ''} (recommended)`,
          run: () => applyRecommendedFonts(),
          hint: locked('typography') ? 'Typography is locked. Unlock it to change fonts.' : '',
        });
      }
      issues.push({ id: 'font', kind: 'font', text: `${aibCap(bad.join(' and '))} ${bad.length > 1 ? 'are' : 'is'} on ${ctx.def.name}'s avoid list (${abAvoidWords(meta.fonts.avoid)}).`, fixes });
    }
  }

  // 2. a weight the face does not publish
  [['Heading', state.headingFont, scale.wantH, scale.hw, 'headingWeight'], ['Body', state.bodyFont, scale.wantB, scale.bw, 'bodyWeight']].forEach(([role, face, want, got, field]) => {
    if (want === got) return;
    const id = `weight|${role}|${face.name}|${want}`;
    if (acked.has(id)) return;
    issues.push({
      id, kind: 'weight',
      text: `${role} text asks for weight ${want}, but ${face.name} only publishes ${abWeights(face).join(', ')}. The brief would use ${got}, and only that weight is bundled.`,
      fixes: [{
        label: `Use ${got} (${face.name}'s nearest)`,
        run: () => {
          if (typeof pushUndoSnapshot === 'function') pushUndoSnapshot(state0, true);
          if (state0.typography) state0.typography[field] = got;
          aibAck(id);
          if (typeof render === 'function') render();
        },
      }],
    });
  });

  // 3. one colour doing two jobs
  const roleKeys = [['primary', 'Primary'], ['secondary', 'Secondary'], ['accent', 'Accent']];
  const seenDup = new Set();
  ctx.modes.forEach(m => {
    // error is not checked: it is a palette colour (or the ink) on purpose (aibDanger)
    const col = { canvas: m.t.canvas, ink: m.t.ink, primary: aibPri(m.t), secondary: m.t.secondary, accent: m.t.accent };
    const labels = { canvas: 'Canvas', ink: 'Ink', primary: 'Primary', secondary: 'Secondary', accent: 'Accent' };
    const names = Object.keys(col);
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        const a = names[i], b = names[j];
        if (a === 'canvas' && b === 'ink') continue;
        const d = aibDist(col[a], col[b]);
        if (d >= 28) continue;
        const id = `role|${a}|${b}|${col[a]}|${col[b]}`;
        if (seenDup.has(id) || acked.has(id)) continue;
        seenDup.add(id);
        const fixes = [];
        const fixKey = ['accent', 'secondary'].find(k => k === b) || null;
        if (fixKey && roleKeys.some(r => r[0] === a)) {
          const p = hexToHsl(state0.colors.primary);
          const hex = fixKey === 'accent' ? hslToHex(p.h + 180, Math.max(p.s, 60), Math.min(Math.max(p.l, 45), 58)) : hslToHex(p.h + 30, Math.max(35, p.s - 15), 62);
          fixes.push({
            label: `Change ${fixKey} to ${hex}`,
            run: () => {
              if (typeof pushUndoSnapshot === 'function') pushUndoSnapshot(state0);
              setBrandColor(fixKey, hex);
              if (typeof render === 'function') render();
            },
            hint: locked('color') ? 'Colors are locked. Unlock them to change.' : '',
          });
        }
        issues.push({ id, kind: 'role', text: `${labels[a]} (${col[a]}) and ${labels[b].toLowerCase()} (${col[b]}) are nearly the same color${ctx.modes.length > 1 ? ' in ' + m.mode + ' mode' : ''}, so one color would do two jobs.`, fixes });
      }
    }
  });

  // 4. contrast pairs that fail
  const failSeen = new Set(), pureOffered = new Set();
  ctx.modes.forEach(m => {
    const t = m.t;
    const pairs = [
      ['ink text on the canvas', t.ink, t.canvas, 4.5, null],
      ['muted text on the canvas', t.muted, t.canvas, 4.5, null],
      ['the label on primary', t.onPrimary, aibPri(t), 4.5, 'primary'],
      ['the label on secondary', t.onSecondary, t.secondary, 4.5, 'secondary'],
      ['the label on accent', t.onAccent, t.accent, 4.5, 'accent'],
      ['the highlight word (accent-ink) on the canvas', t.accentInk, t.canvas, 3, null],
    ];
    pairs.forEach(([name, fg, bg, need, key]) => {
      const r = contrastRatio(fg, bg);
      if (r >= need) return;
      const id = `contrast|${name}|${fg}|${bg}`;
      if (failSeen.has(id) || acked.has(id)) return;
      failSeen.add(id);
      const fixes = [];
      if (!key && /canvas/.test(name) && !state0.pureBg && !pureOffered.has(t.isDark)) {
        pureOffered.add(t.isDark);
        fixes.push({
          label: `Use a pure ${t.isDark ? 'black' : 'white'} background`,
          run: () => {
            if (typeof pushUndoSnapshot === 'function') pushUndoSnapshot(state0);
            state0.pureBg = true;
            if (typeof render === 'function') render();
          },
        });
      }
      if (key && !(key === 'primary' && t.printed)) {
        const hex = aibNudgeFill(state0.colors[key]);
        if (hex) {
          fixes.push({
            label: `Adjust ${key} to ${hex}`,
            run: () => {
              if (typeof pushUndoSnapshot === 'function') pushUndoSnapshot(state0);
              setBrandColor(key, hex);
              if (typeof render === 'function') render();
            },
            hint: locked('color') ? 'Colors are locked. Unlock them to change.' : '',
          });
        }
      }
      issues.push({ id, kind: 'contrast', text: `${aibCap(name)} is ${r.toFixed(2)}:1${ctx.modes.length > 1 ? ' in ' + m.mode + ' mode' : ''}; it needs ${need}:1.`, fixes });
    });
  });
  return issues;
}

/* ---------------- files + zip ---------------- */

const AIB_CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function aibCrc32(bytes) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i++) c = AIB_CRC[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

// A store-only (no compression) ZIP. files: [{ name, data: string | Uint8Array }]. Returns a Uint8Array.
function aibZip(files, when) {
  const enc = new TextEncoder();
  const d = when || new Date();
  const dosTime = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
  const dosDate = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  const parts = [], central = [];
  let offset = 0;
  files.forEach(f => {
    const name = enc.encode(f.name);
    const data = typeof f.data === 'string' ? enc.encode(f.data) : f.data;
    const crc = aibCrc32(data);
    const lh = new Uint8Array(30 + name.length), lv = new DataView(lh.buffer);
    lv.setUint32(0, 0x04034b50, true); lv.setUint16(4, 20, true); lv.setUint16(6, 0x0800, true); lv.setUint16(8, 0, true);
    lv.setUint16(10, dosTime, true); lv.setUint16(12, dosDate, true); lv.setUint32(14, crc, true);
    lv.setUint32(18, data.length, true); lv.setUint32(22, data.length, true); lv.setUint16(26, name.length, true); lv.setUint16(28, 0, true);
    lh.set(name, 30);
    parts.push(lh, data);
    const ch = new Uint8Array(46 + name.length), cv = new DataView(ch.buffer);
    cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true); cv.setUint16(8, 0x0800, true); cv.setUint16(10, 0, true);
    cv.setUint16(12, dosTime, true); cv.setUint16(14, dosDate, true); cv.setUint32(16, crc, true);
    cv.setUint32(20, data.length, true); cv.setUint32(24, data.length, true); cv.setUint16(28, name.length, true);
    cv.setUint16(30, 0, true); cv.setUint16(32, 0, true); cv.setUint16(34, 0, true); cv.setUint16(36, 0, true); cv.setUint32(38, 0, true); cv.setUint32(42, offset, true);
    ch.set(name, 46);
    central.push(ch);
    offset += lh.length + data.length;
  });
  const cdSize = central.reduce((n, a) => n + a.length, 0);
  const end = new Uint8Array(22), ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true); ev.setUint16(4, 0, true); ev.setUint16(6, 0, true);
  ev.setUint16(8, files.length, true); ev.setUint16(10, files.length, true); ev.setUint32(12, cdSize, true); ev.setUint32(16, offset, true); ev.setUint16(20, 0, true);
  const all = parts.concat(central, [end]);
  const out = new Uint8Array(all.reduce((n, a) => n + a.length, 0));
  let p = 0;
  all.forEach(a => { out.set(a, p); p += a.length; });
  return out;
}

async function aibPatternBytes(a) {
  const { entry, f, t } = a;
  const inks = Patterns.inksFor(t, entry.colorway, { tints: !!(entry.params && entry.params.tints) });
  if (a.kind === 'svg') {
    const svg = f.seamless ? Patterns.tileSVG(entry.key, entry.params, inks, entry.seed, 160) : Patterns.renderSVG(entry.key, entry.params, inks, entry.seed, { width: 1600, height: 900 });
    if (svg) return new TextEncoder().encode(svg);
    a.kind = 'png';
    a.name = a.name.replace(/\.svg$/, '.png');
  }
  const w = (AIB_USE_RULES[a.use] || AIB_USE_RULES.hero).png === '2x' ? 2560 : 1280, h = Math.round(w * 9 / 16);
  const cv = document.createElement('canvas');
  Patterns.render(cv, entry.key, entry.params, inks, entry.seed, { width: w, height: h, dpr: 1, setStyle: false });
  const blob = await new Promise((res, rej) => cv.toBlob(b => (b ? res(b) : rej(new Error('toBlob failed'))), 'image/png'));
  return new Uint8Array(await blob.arrayBuffer());
}

// The files of "Save brief + files": BRIEF.md, tokens.css and/or Theme.swift, patterns/*.
async function aibFiles(state0, opts) {
  const surf = AIB_SURFACES.some(x => x.value === (opts && opts.surface)) ? opts.surface : aibGetSurface(state0);
  const assets = surf === 'app' ? [] : aibPatternAssets(state0);
  const files = [];
  for (const a of assets) {
    try { files.push({ name: null, a, data: await aibPatternBytes(a) }); } catch (err) { console.warn('brief files: pattern failed', a.entry.key, err); }
  }
  const ok = files.map(f => f.a);
  // Comps of the product screens (W2b's ProductScreens.compPng). All or none: any failure writes the zip without them.
  const comps = [];
  const prod = surf !== 'web' && state0 && state0.product && Array.isArray(state0.product.screens) ? state0.product : null;
  const PS = typeof window !== 'undefined' && window.ProductScreens;
  if (prod && prod.screens.length && PS && typeof PS.compPng === 'function') {
    try {
      for (const sc of prod.screens) for (const mode of ['light', 'dark']) comps.push({ name: `comps/${sc.id}-${mode}.png`, data: await PS.compPng(state0, sc.id, mode) });
    } catch (err) { console.warn('brief files: comps failed', err); comps.length = 0; }
  }
  const logoZip = await aibLogoZipFiles(state0);
  const ctx = aibContext(state0, Object.assign({}, opts, { assets: ok, comps: comps.length > 0, logoPng: !!(logoZip.plan && logoZip.plan.png) }));
  const out = [{ name: 'BRIEF.md', data: aibBuild(ctx) }];
  if (ctx.web) out.push({ name: 'tokens.css', data: aibCssLines(ctx, true).filter(l => !/^```/.test(l)).join('\n') + '\n' });
  if (ctx.swift) out.push({ name: 'Theme.swift', data: aibSwiftLines(ctx).join('\n') + '\n' });
  files.forEach(f => out.push({ name: f.a.name, data: f.data }));
  comps.forEach(c => out.push(c));
  logoZip.files.forEach(f => out.push(f));
  return out;
}
