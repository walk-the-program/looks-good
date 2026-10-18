/* ---------------------------------------------------------------------
   ai-brief.js — "Copy AI brief": one Markdown document a coding agent can
   build a real app from, on the platform the owner names (Web, SwiftUI or
   both), without condensing it or inventing what it leaves out.

   buildAiBrief(state, opts) is pure (no DOM, except the optional board probe).
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
  accentInk: 'The accent as text: same hue family (yellows shift toward amber on light canvases), shaded (light canvas) or tinted (dark canvas) just enough to reach 3:1 on the canvas. Set the highlight word in it, never plain accent',
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

function aibRatio(a, b) {
  return contrastRatio(a, b).toFixed(2) + ':1';
}

const AIB_HEX = /^#[0-9a-f]{6}$/i;

// Color treatments that differ per aesthetic. Everything is a token name;
// the role rules always win over the look.
// The highlight treatment is def.highlight ('ink' | 'band' | 'custom', default
// 'ink'). 'custom' is described by def.highlightNote (one sentence).
function aibHighlightKind(def) {
  return def.highlight === 'band' || def.highlight === 'custom' ? def.highlight : 'ink';
}
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
  if (extras && extras[name] != null && AIB_HEX.test(String(extras[name]).trim())) return name + ' (' + String(extras[name]).trim() + ')';
  return t[name] != null ? '--' + abKebab(name) : name;
}

function aibComponentRows(t, def, extras) {
  const key = def.classicOf || def.key;     // a classic def keeps its aesthetic's component notes
  // Where the aesthetic prints the primary as another color (def.printPrimary), the board's
  // primary fills, rules and marks use --primary-print; --primary is the brand hex only.
  // A printed primary (def.printPrimary) is the one --primary token in the brief: the table lists the
  // printed hex, so the components always say --primary.
  const PRI = '--primary';
  const ONP = '--on-primary';
  const focusLow = contrastRatio(t.printPrimary, t.canvas) < 3;
  const hlKind = aibHighlightKind(def);
  const inkCta = def.ctaFill === 'ink';

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

  return [
    ['Page', '--canvas', '--ink', 'none'],
    ['Card / panel', cardBg, '--ink', inkBorder ? '--ink' : '--line'],
    inkCta
      ? ['Main button (one per view, ink-filled)', '--ink', '--canvas', 'none']
      : ['Primary button (one per view)', PRI, ONP, inkBorder ? '--ink' : 'none'],
    ['Secondary button', 'transparent (hover: --sec-tint)', '--ink', '--secondary'],
    ['Ghost / tertiary link', 'none', '--ink (underlined)', 'none'],
    ['Input field, rest', '--canvas', '--ink (placeholder: --muted)', inkBorder ? '--ink' : '--line'],
    ['Input field, focus', '--canvas', '--ink', `${PRI} (plus a 3px ring of ${PRI} at 40% opacity)`],
    ['Segmented control, selected', ...segOn],
    ['Segmented control, unselected', 'transparent', '--muted', 'none'],
    ['Toggle, on', toggleOn, '--ink (label)', 'none'],
    ['Toggle, off', toggleOff, '--ink (label)', 'none'],
    ['Tag / chip', '--secondary', '--on-secondary', 'none'],
    ['Badge ("New", notification)', key === 'aurora-noir' && !t.accentLow
      ? t.mix(t.accent, t.canvas, 0.15) + ' (accent at 15%)' : '--accent',
    key === 'aurora-noir' && !t.accentLow ? '--accent' : '--on-accent', 'none'],
    ['Headline highlight word (one per view)', ...hl],
    ['Divider / hairline', '--line', 'n/a', 'n/a'],
    ['List row, selected', '--sec-tint', '--ink', `left edge 2px ${PRI}`],
    ['List row, resting', 'transparent', '--ink (meta: --muted)', 'bottom 1px --line'],
    ['Progress / data bar', 'track --line', 'n/a', `fill ${PRI} (second series: --secondary)`],
    ['Focus ring (any control)', 'n/a', 'n/a', focusLow ? `3px ${PRI} with an outer 1px --ink ring (primary alone is under 3:1 on this canvas)` : PRI],
  ];
}

function aibFontUrl(fonts) {
  const seen = new Set();
  const families = fonts.filter(f => !seen.has(f.name) && seen.add(f.name))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(f => googleFamilyParam(f));
  return `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`;
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
    rule: 'Full-bleed background behind the hero section, edge to edge (`background-size: cover`; a tile uses `background-repeat: repeat`). Keep the headline and copy on a solid `--canvas` area or behind a `--canvas` scrim so text stays at 4.5:1 or better. Never set text directly on the pattern. One pattern hero per page.',
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

// Errors need a colour the five brand roles do not have: a fixed red, shaded toward the ink
// until it holds 4.5:1 on the canvas in this mode.
function aibError(t) {
  const base = t.isDark ? '#ff6b5f' : '#d92d20';
  let c = base;
  for (let k = 0; k <= 1.001 && contrastRatio(c, t.canvas) < 4.5; k += 0.05) c = slMix(t.ink, base, k);
  return c;
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
  if (build.sw === 'hard') return { '--shadow': build.shadowInk || !t.isDark ? t.ink : '#000000' };
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
  // The phone layout and type section: every app, and any SwiftUI build.
  ctx.phone = ctx.app || ctx.swift;
  ctx.brandName = String(ctx.content.brandName).replace(/\s+/g, ' ').trim();
  ctx.tagline = String(ctx.content.tagline).replace(/\s+/g, ' ').trim();
  ctx.rows = aibPaletteRows(ctx);
  ctx.scale = aibTypeScale(ctx);
  ctx.focusLow = modes.some(m => contrastRatio(aibPri(m.t), m.t.canvas) < 3);
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
  add('--accent-ink', m => m.t.accentInk, 'The accent as text, shaded or tinted to 3:1 on the canvas. The highlight word only; never plain accent as text.', []);
  (build.fixedInks || []).forEach(ink => {
    if (!modes.every(m => aibInkValue(ink, m))) return;
    const job = ink.decorativeOnly ? `Decorative only, never text or controls. ${aibAppText(ctx, ink.job, '')}`.trim() : aibAppText(ctx, ink.job, 'A fixed colour of this look.');
    add(ink.token, m => aibInkValue(ink, m), job, ink.on ? [['--on-' + ink.token.replace(/^--/, ''), m => aibInkValue(ink, m, 'on')]] : []);
  });
  add('--pri-tint', m => m.t.priTint, 'Quiet primary wash: selected background, hover on primary-linked items.', [['--ink', m => m.t.ink]]);
  add('--sec-tint', m => m.t.secTint, 'Quiet secondary wash: selected row, tonal fills, hover on secondary items.', [['--ink', m => m.t.ink]]);
  add('--error', m => aibError(m.t), 'Errors only: field edge, icon and message. Fixed red, 4.5:1 or better on the canvas; never a brand colour.', [['--on-error', m => pickReadableText(aibError(m.t))]]);
  if (modes.some(m => aibCardColor(def, m))) add('--card', m => aibCardColor(def, m) || m.t.canvas, 'Card and panel fill (paper); everything else sits on the canvas.', [['--ink', m => m.t.ink]]);
  const elevJob = {
    '--shadow': 'The hard offset shadow under every outlined surface.',
    '--shadow-lo': 'Dark half of the raised and recessed shadow pair (down-right on raised).',
    '--shadow-hi': 'Light half of the pair (up-left on raised).',
    '--rim': 'The 1pt light rim on glass surfaces.',
  };
  Object.keys(aibElevation(build, def, modes[0])).forEach(name => add(name, m => aibElevation(build, def, m)[name], elevJob[name], []));
  return rows;
}

function aibColorsTable(ctx) {
  const single = ctx.modes.length === 1;
  const head = single ? ['Token', 'Value', 'Job', 'On (text and icons on it)'] : ['Token', 'Light', 'Dark', 'Job', 'On (text and icons on it)'];
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
    return { role: r.role, name: r.role.replace(/\s+/g, ''), face, size: r.size, line: r.line, weight, italic, display: r.face === 'display',
      style: AIB_PHONE_STYLE[r.role] || 'body', ps: aibPostScript(face, weight, italic) };
  });
  return ctx._phone;
}

// The families to bundle: the measured scale's, plus the phone roles' when the brief has the phone section.
// An app built in SwiftUI only (Theme.swift fonts are the phone roles) bundles the phone roles alone.
function aibFamsFor(ctx) {
  if (!ctx.phone || !aibPhoneRows(ctx).length) return ctx.scale.fams;
  const base = ctx.app && ctx.swiftOnly ? [] : ctx.scale.fams.map(f => ({ face: f.face, italic: f.italic, weights: f.weights.map(w => Object.assign({}, w)), roles: Object.keys(f.roles).reduce((o, k) => (o[k] = f.roles[k].slice(), o), {}) }));
  return aibFamsOf(aibPhoneRows(ctx), base);
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

function aibBrandLine(ctx) {
  const { def } = ctx;
  const plain = `${def.name}'s look, carried through the product's controls, surfaces and type.`;
  let summary = aibAppText(ctx, def.summary || '', plain, { subject: true });
  // When the leading sentence was art, the plain line stands in for it (blends add "Mixed with X." after it).
  if (summary !== (def.summary || '') && summary !== plain && !String(def.summary).startsWith(summary.split('. ')[0])) summary = plain + ' ' + summary;
  return `${ctx.brandName}: ${ctx.tagline} Aesthetic: ${def.name} (${def.descriptor}; ${def.influences}). ${summary}${def.motto ? ' ' + def.motto : ''}`;
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
  const inkCta = def.ctaFill === 'ink';
  const out = ['## Colors', aibColorsTable(ctx)];
  if (ctx.web && ctx.swift) out.push('SwiftUI name: `Palette.` plus the camelCase token (`--on-primary` is `Palette.onPrimary`).');
  out.push(...[
    inkCta
      ? '- One main call to action per view, filled `--ink` with a `--canvas` label. `--primary` never fills a button; it marks state (selected controls, switch on, focus ring, progress, status dot). Secondary never fills it or sets body text; accent never goes on buttons, body text or borders.'
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
  if (kind === 'band') return `- Headline highlight word, once per view: a ${appOnly ? 'block' : 'band'} of \`--accent\` behind it with \`--on-accent\` text. Never accent-colored text.`;
  if (kind === 'custom' && !(appOnly && AIB_APP_ART.test(def.highlightNote || ''))) {
    return def.highlightNote
      ? '- Headline highlight word, once per view: ' + def.highlightNote.replace(/\s*Use it once per view\.?$/, '') + ' Never plain `--accent` as text.'
      : '- Headline highlight word, once per view: set in `--accent-ink`; never plain `--accent` as text.';
  }
  return '- Headline highlight word, once per view: set in `--accent-ink`. Never plain `--accent` as text.';
}

function aibSecComponents(ctx) {
  const { def, cur } = ctx;
  const all = aibComponentRows(cur.t, def, cur.extras).map(r => r.map(c => ctx.tok(String(c).replace(/--[a-z-]+ \(#[0-9a-f]{6}\)/i, ctx.rows.some(x => x.token === '--card') ? '--card' : '--canvas'))));
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
  if (ctx.site) out.push(`Website (the other surface of this brief): ${UI_KIT_SURFACES.web.rule}`);
  return out;
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
    'btn-destructive': ['none (pressed: --error at 12% over --canvas)', '--error', edge('1px --error', pill), `${hl(P.buttonHeight || 52)}`],
    'btn-icon': ['none (pressed: `--sec-tint`)', '--ink (icon)', 'no edge', `24pt icon in a ${tap}x${tap}pt hit area`],
    'field': [rest[1], rest[2], edge(`rest ${rest[3]}; focus ${foc[3]}; error 1px --error plus the message below in --error`, corner(r.field)), `${hl(P.fieldHeight || 48)}; label above in Footnote, --muted`],
    'search': [rest[1], '--ink (placeholder: --muted); leading icon --muted', edge(`rest ${rest[3]}; focus ${foc[3]}`, corner(r.field)), hl(P.fieldHeight || 48)],
    'select': [rest[1], '--ink (value); chevron --muted', edge(`rest ${rest[3]}; open ${foc[3]}`, corner(r.field)), hl(P.fieldHeight || 48)],
    'checkbox': [`off: ${rest[1]}; on: ${segOn[1]}`, `check mark ${segOn[2]}`, edge(`off ${rest[3]}; on ${segOn[3]}`, `corners ${Math.min(r.control, 6)}${u}`), `24pt box, ${tap}pt hit area`],
    'radio': [`off: ${rest[1]}; on: ${segOn[1]}`, `dot ${segOn[2]}`, edge(`off ${rest[3]}; on ${segOn[3]}`, 'circle'), `24pt, ${tap}pt hit area`],
    'toggle': [`on: ${tog[1]}; off: ${by('Toggle, off')[1]}`, '--ink (label beside it)', 'no edge; pill', `51x31pt, ${tap}pt hit area`],
    'segmented': [`selected: ${segOn[1]}; unselected: transparent`, `selected ${segOn[2]}; unselected --muted`, edge(`selected ${segOn[3]}`, corner(r.control)), `${hl(tap)}, equal-width segments`],
    'slider': [`track --line; filled part ${'--primary'}`, 'n/a', edge('thumb --primary', 'pill track'), `4pt track, 28pt thumb, ${tap}pt hit area`],
    'card': [card[1], card[2], edge(card[3] === 'none' ? 'none' : '1px ' + card[3], corner(r.card)), `padding ${P.cardPadding || 20}pt`],
    'list': [`${card[1]}; selected: ${listSel[1]}`, '--ink (meta and chevron: --muted)', edge(`bottom 1px --line between rows; selected: ${listSel[3]}`, 'rows share the list\'s ' + corner(r.card)), `${hl(P.rowHeight || 52)}, full width`],
    'callout': ['info --pri-tint; success --sec-tint; warning --accent at 15% over --canvas; error --error at 12% over --canvas', '--ink (message), with an icon and a label word so status is never colour alone', edge(`1px ${edgeTok} (error: 1px --error)`, corner(r.card)), 'padding 16pt, full width'],
    'sheet': [card[1], card[2], edge(card[3] === 'none' ? 'none' : '1px ' + card[3], `${corner(r.card)} on the top corners`), `padding ${P.cardPadding || 20}pt; grabber 36x5pt in --line; scrim --ink at 40%`],
    'divider': ['--line', 'section label: --muted (Caption)', 'n/a', `1px; ${P.sectionGap || 28}pt above a section label`],
    'topbar': ['--canvas', '--ink (title, icons)', 'bottom 1px --line once content scrolls under it', `${tap}pt bar under the status area; one Large title below it`],
    'tabbar': ['--canvas', 'selected --ink with a small --primary pill under the label; unselected --muted', 'top 1px --line', `${P.tabBarHeight || 83}pt including the home indicator`],
    'tabs': ['none', 'selected --ink; unselected --muted', 'selected: 2px --primary under the label', hl(tap)],
    'badge': [`neutral: ${tag[1]}; accent: ${badge[1]}`, `neutral ${tag[2]}; accent ${badge[2]}`, edge('none', 'pill'), '20pt high, Caption text'],
    'progress': [prog[1], 'n/a', edge(prog[3], 'pill'), '6pt high, full width'],
    'toast': ['--ink', '--canvas', edge('none', corner(r.card)), `min 48pt high, ${P.margin || 20}pt from the side edges, gone after 3 s`],
    'empty': ['none', 'title --ink (Title 2); message --muted (Subhead); icon --muted', 'n/a', 'centred; one primary button; ' + (ctx.site ? 'an icon, never an illustration' : 'an icon only')],
    'avatar': ['--secondary', '--on-secondary (initials)', edge('none', 'circle'), '32, 40 or 56pt'],
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
  const data = aibKitRowData(ctx);
  const out = ['## UI kit',
    'Every control and container in the product is one of these components, drawn exactly as below. Fill, text and edge are tokens from Colors; corners and shadows come from Shape and materials; text sizes come from Phone layout and type. Sizes are points at the 390 x 844 reference screen (1pt = 1 CSS px). Every state follows the States table.'];
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
  UI_KIT_SCREENS.forEach(sc => {
    out.push('', `### ${sc.name}`, sc.use, '', ...sc.blocks.map((b, i) => `${i + 1}. ${names[b] || b}`), '', ...sc.rules.map(r => `- ${r}`));
  });
  out.push('', 'Every app screen is one of these five or a combination; do not invent layouts with hero areas or decorative headers.');
  return out;
}

function aibSecPhone(ctx) {
  const rows = aibPhoneRows(ctx);
  const P = (typeof UI_KIT_PHONE !== 'undefined' && UI_KIT_PHONE) || null;
  if (!P || !rows.length) return [];
  const out = ['## Phone layout and type'];
  const head = ['Role', 'Face', 'Size pt', 'Line', 'Weight'].concat(ctx.swift ? ['SwiftUI style'] : []);
  const body = rows.map(r => [r.role, r.face.name + (ctx.swift ? ` (\`${r.ps}\`)` : '') + (r.display ? ' (display)' : ' (body)'), r.size, r.line, r.weight + (r.italic ? ' italic' : '')].concat(ctx.swift ? ['.' + r.style] : []));
  out.push(aibTable(head, body));
  const note = ctx.scale.rows[0] && ctx.scale.rows[0].note;
  if (note) out.push(`- Display roles (Large title, Title, Title 2): ${ctx.tok(note)}.`);
  if (ctx.swift) out.push(ctx.app
    ? '- Each role is a `Font.brand<Role>` in Theme.swift (for example `Font.brandLargeTitle`), a custom font that scales with Dynamic Type through its text style.'
    : '- Build each role as `Font.custom(<PostScript name>, size: <Size>, relativeTo: <style>)` so it scales with Dynamic Type.');
  out.push(`- Layout: ${P.margin}pt side margins on every screen. Spacing comes from ${P.spacing.join(', ')}pt only; ${P.sectionGap}pt between sections. Sizes: buttons ${P.buttonHeight}pt, fields ${P.fieldHeight}pt, list rows ${P.rowHeight}pt, card padding ${P.cardPadding}pt, tab bar ${P.tabBarHeight}pt, nothing tappable under ${P.tapTarget}pt.`);
  out.push('- Support Dynamic Type; never let a word split or a label truncate; one Large title per screen.');
  (Array.isArray(ctx.def.typeNotes) ? ctx.def.typeNotes : ctx.def.typeNotes ? [ctx.def.typeNotes] : []).forEach(n => out.push(`- ${aibFixWeights(ctx, n)}`));
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
  if (ctx.swift) out.push('CSS to SwiftUI: a box-shadow blur B is `.shadow(radius: B/2)`; `inset` shadows use the `Recessed` modifier in Theme.swift; `linear-gradient(135deg, ...)` is `LinearGradient(startPoint: .topLeading, endPoint: .bottomTrailing)`; `rgba()` is `Color(.sRGB, red:, green:, blue:, opacity:)`; `backdrop-filter` is a SwiftUI `Material`.');
  return out;
}

function aibSecModes(ctx) {
  const { build, only, mode, modes } = ctx;
  const out = ['## Light and dark'];
  if (only) {
    out.push(`${aibCap(only)} only, because ${build.modes.because}. Ship the ${only} palette alone: ${ctx.web ? '`color-scheme: ' + only + '`' : ''}${ctx.web && ctx.swift ? '; ' : ''}${ctx.swift ? '`.preferredColorScheme(.' + only + ')` at the app root' : ''}. Do not build a ${only === 'dark' ? 'light' : 'dark'} theme.`);
    return out;
  }
  out.push(`Ship both palettes from the Colors table and follow the system setting${ctx.web ? ' (`prefers-color-scheme`, with a `data-theme` attribute override)' : ''}${ctx.swiftOnly ? ' (adaptive colors; no manual switch)' : ctx.swift ? '; SwiftUI colors adapt on their own' : ''}. The default look is ${mode}. The ${mode === 'dark' ? 'light' : 'dark'} values are designed, not inverted.`);
  const vars = aibMaterials(ctx).vars;
  if (ctx.swiftOnly && vars.length) out.push('Material values used by the recipes (light | dark): ' + vars.map(([k, v]) => `\`${k}\` ${v.length > 1 && v[0] !== v[1] ? v[0] + ' | ' + v[1] : v[0]}`).join('; ') + '.');
  return out;
}

function aibFocusColor(ctx) {
  return '`--primary`' + (ctx.focusLow ? ' plus an outer 1pt `--ink` ring (primary alone is under 3:1 on a canvas here)' : '');
}

function aibSecStates(ctx) {
  const { build } = ctx;
  const S = build.states;
  const row = (name, colour, visual) => [name, ctx.tok(colour), ctx.tok(visual)];
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
  out.push(`- Press: ${ctx.tok(build.pressText)}`);
  out.push(`- Reduce Motion: ${ctx.tok(build.reduceMotion)} State changes stay; only the movement goes. ${build.ambient ? `Ambient motion: ${build.ambient}; it is paused under Reduce Motion. Nothing else animates idly or loops except loading indicators.` : 'Nothing else animates idly or loops except loading indicators.'}`);
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
  return defs.map(([name, fg, bg]) => ({ name, ratios: ctx.modes.map(m => contrastRatio(fg(m), bg(m))) }));
}

function aibSecA11y(ctx) {
  const { build } = ctx;
  const web = ctx.web, sw = ctx.swift;
  const env = (css, swift) => ` (${web ? '`' + css + '`' : ''}${web && sw ? ' / ' : ''}${sw ? '`' + swift + '`' : ''})`;
  const pairs = aibA11yPairs(ctx).map(p => `${p.name} ${p.ratios.map(r => r.toFixed(1)).join(' | ')} (${aibGrade(Math.min(...p.ratios))})`).join('; ');
  return ['## Accessibility',
    `- Contrast kept${ctx.modes.length > 1 ? ' (light | dark)' : ''}: ${pairs}. Keep every text pair at 4.5:1 or better (3:1 for the accent-ink highlight word); do not swap tokens in a way that breaks them.`,
    `- Every tappable target is at least 44x44${web && sw ? ' (CSS px; pt in SwiftUI)' : web ? ' CSS px' : 'pt'} even when the visible shape is smaller, with 8pt between neighbours. Text scales: ${web ? 'sizes in rem, no fixed-height text boxes' : ''}${web && sw ? '; ' : ''}${sw ? 'Dynamic Type through the \`Font.brand*\` styles, \`@ScaledMetric\` for icon sizes and paddings' : ''}; layouts reflow at the largest accessibility size (stack, wrap, never truncate a primary label).`,
    `- Reduce Transparency${env('prefers-reduced-transparency', 'accessibilityReduceTransparency')}: ${ctx.tok(build.reduceTransparency)} Increase Contrast${env('prefers-contrast: more', 'colorSchemeContrast == .increased')}: ${ctx.tok(build.increaseContrast)}`,
    `- Reduce Motion${env('prefers-reduced-motion', 'accessibilityReduceMotion')}: see Motion. Never color alone: selection, status and errors also use an icon, text or shape; icon-only buttons carry an accessibility label.`];
}

function aibSecIcons(ctx) {
  const { build } = ctx;
  const plat = [];
  if (ctx.web) plat.push('Web: inline SVG on a 24px grid, `currentColor`.');
  if (ctx.swift) plat.push(`SwiftUI: SF Symbols at weight \`.${build.iconWeight}\`, monochrome rendering; template-rendered SVG assets only for glyphs SF Symbols lacks.`);
  return ['## Icons', `${ctx.tok(build.icons)} ${plat.join(' ')}`];
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
  if (ctx.web) out.push(`- Bundle exactly these weights and no others; the type scale uses no more. Web: ${aibFontsUrl(fams)}`);
  if (ctx.swift) out.push((ctx.web ? '- SwiftUI' : '- Bundle exactly these weights and no others; the type scale uses no more. SwiftUI') + ': use static TTFs (the Google Fonts download, `static/` folder), add them to the target and list them under `UIAppFonts` (iOS) or `ATSApplicationFontsPath` (macOS). The names above are PostScript names.');
  return out;
}

const AIB_ART_RULE = /band|hero|pattern|texture|glow|illustration|plate|striation/i;

function aibSecRules(ctx) {
  const r = ctx.def.rules || {};
  const lines = [...(r.do || []).map(x => ['Do', x]), ...(r.dont || []).map(x => ['Don\'t', x])];
  const fmt = l => `- ${l[0]}: ${aibFixWeights(ctx, l[1])}`;
  if (!ctx.app) return ['## Do and don\'t', ...lines.map(fmt)];
  const keep = lines.filter(l => !AIB_ART_RULE.test(l[1])), art = lines.filter(l => AIB_ART_RULE.test(l[1]));
  const out = ['## Do and don\'t', ...keep.map(fmt)];
  if (ctx.site && art.length) out.push('', 'Website only (never in app screens):', ...art.map(fmt));
  return out;
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
  ctx.rows.forEach(r => {
    if (!colourTokens.some(x => x[0] === r.token)) colourTokens.push([r.token, ld(r)]);
    r.on.forEach(([tk, g]) => { if (!colourTokens.some(x => x[0] === tk)) { const v = modes.map(m => g(m)); colourTokens.push([tk, modes.length === 1 || v[0] === v[1] ? v[0] : `light-dark(${v[0]}, ${v[1]})`]); } });
  });
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

function aibSecCss(ctx) {
  return ['## Tokens (CSS)', ...aibCssLines(ctx)];
}

/* ---------------- SwiftUI theme ---------------- */

function aibHex6(n) { return '0x' + (n >>> 0).toString(16).toUpperCase().padStart(6, '0'); }
function aibOpacity(a) { return (Math.round(a * 100) / 100).toString(); }

// Theme.swift as text. Compiles against SwiftUI on iOS 17 / macOS 14 and later.
function aibSwiftLines(ctx) {
  const { build, scale, radius, modes, def, only } = ctx;
  const mo = build.motion, sh = build.sh || {}, sw = build.sw;
  const inkCta = def.ctaFill === 'ink';
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
    btn.push('.overlay(shape.strokeBorder(isEnabled ? Palette.ink : Palette.muted, lineWidth: Metrics.outline))',
      `.offset(x: down ? ${build.press.dx} : 0, y: down ? ${build.press.dy} : 0)`,
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
  if (sw === 'hard') surf.push(`.background(Palette.${cardTok}, in: shape)`, '.overlay(shape.strokeBorder(Palette.ink, lineWidth: Metrics.outline))', `.shadow(color: Palette.shadow, radius: 0, x: ${sh.x}, y: ${sh.y})`);
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
  const edge = sw === 'hard' || sw === 'stepped' ? 'Palette.ink' : 'Palette.line';
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
    '            .overlay(shape.inset(by: -4).stroke(Palette.primary, lineWidth: focused ? 3 : 0))',
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
  hero: 'full-bleed hero background (cover), one per page',
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

function aibBuild(ctx) {
  const label = AIB_TARGETS.find(x => x.value === ctx.target).label;
  const blocks = [
    [`# ${ctx.brandName} — build brief`,
      (ctx.app
        ? 'Build the real product from this brief, not a mock-up. Every value is final: use only these colors, fonts, shapes and motion; where something is missing, use the nearest listed token. Screens are composed from the UI kit below, one component for each need; do not invent new component styles, and do not copy the brand board\'s layout. '
        : 'Build the real product from this brief, not a mock-up. Every value is final: use only these colors, fonts, shapes and motion, and invent nothing; where something is missing, use the nearest listed token. ') + `Target: ${label}${ctx.target === 'web' ? ' (CSS)' : ctx.target === 'swiftui' ? ' (iOS 17 and macOS 14 or later)' : ' (CSS and SwiftUI)'}.`,
      aibBrandLine(ctx)],
    aibSecAppRules(ctx),
    aibSecBlend(ctx),
    aibSecColors(ctx),
    ctx.app ? aibSecKit(ctx) : aibSecComponents(ctx),
    aibSecScreens(ctx),
    ctx.phone ? aibSecPhone(ctx) : [],
    aibSecType(ctx),
    aibSecShape(ctx),
    aibSecModes(ctx),
    aibSecStates(ctx),
    aibSecMotion(ctx),
    aibSecA11y(ctx),
    aibSecIcons(ctx),
    aibSecAppIcon(ctx),
    aibSecFonts(ctx),
    aibSecRules(ctx),
    ctx.web ? aibSecCss(ctx) : [],
    ctx.swift ? aibSecSwift(ctx) : [],
    aibSecPatterns(ctx),
  ].filter(b => b.length);
  return blocks.map(b => b.join('\n')).join('\n\n') + '\n';
}

function buildAiBrief(state0, opts) {
  return aibBuild(aibContext(state0, opts));
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
    const col = { canvas: m.t.canvas, ink: m.t.ink, primary: aibPri(m.t), secondary: m.t.secondary, accent: m.t.accent, error: aibError(m.t) };
    const labels = { canvas: 'Canvas', ink: 'Ink', primary: 'Primary', secondary: 'Secondary', accent: 'Accent', error: 'Error' };
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
  const ctx = aibContext(state0, Object.assign({}, opts, { assets: ok }));
  const out = [{ name: 'BRIEF.md', data: aibBuild(ctx) }];
  if (ctx.web) out.push({ name: 'tokens.css', data: aibCssLines(ctx, true).filter(l => !/^```/.test(l)).join('\n') + '\n' });
  if (ctx.swift) out.push({ name: 'Theme.swift', data: aibSwiftLines(ctx).join('\n') + '\n' });
  files.forEach(f => out.push({ name: f.a.name, data: f.data }));
  return out;
}
