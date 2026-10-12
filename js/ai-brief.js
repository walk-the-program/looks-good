/* ---------------------------------------------------------------------
   ai-brief.js — "Copy AI brief": one Markdown document an AI coding tool
   can build from without inventing colors.

   buildAiBrief(state) is pure (no DOM). Every derived color comes from
   boardTokens(state, def) in aesthetic-board.js, so the hexes here are the
   exact ones the board shows. Roles come from colorRolesFor(state)
   (color-roles.js, aesthetic overrides applied). Plain <script>, no modules.
------------------------------------------------------------------------ */

const AIB_CONTENT_FALLBACK = { brandName: 'Brand Name', tagline: 'A short tagline that captures the brand.' };

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
  const key = def.key;
  // Where the aesthetic prints the primary as another color (def.printPrimary), the board's
  // primary fills, rules and marks use --primary-print; --primary is the brand hex only.
  const PRI = t.printed ? '--primary-print' : '--primary';
  const ONP = t.printed ? '--on-primary-print' : '--on-primary';
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

// "### Recommended type" subsection of Typography: the aesthetic's font classes,
// picks, avoid list and why (js/aesthetic-meta.js), plus how the brand's current
// faces fit. Returns [] when the aesthetic has no recommendation.
function aibTypeRecommendation(state, def) {
  // A blend whose donor supplies the type recommends the donor's faces (js/blend.js).
  const metaKey = def.blend && def.blend.typeFrom ? def.blend.typeFrom : def.key;
  const meta = typeof aestheticMeta === 'function' ? aestheticMeta(metaKey) : null;
  if (!meta || !meta.fonts) return [];
  const f = meta.fonts;
  const fits = fontFitFor(metaKey, state);
  const cls = font => (FONT_CLASSES[font.cls] ? FONT_CLASSES[font.cls].label : font.cls);
  const fitText = (font, fit) => fit === 'match' ? 'fits this aesthetic'
    : fit === 'avoid' ? `is on this aesthetic's avoid list (${cls(font)})`
      : `is outside the recommended classes (${cls(font)}); acceptable, but check it against the picks`;
  const out = [`### Recommended type for ${def.name}`, ''];
  out.push(`- Headings: ${fontClassWords(f.heading.classes)}. Picks: ${f.heading.picks.join(', ')}.`);
  out.push(`- Body: ${fontClassWords(f.body.classes)}. Picks: ${f.body.picks.join(', ')}.`);
  if (f.mono) out.push(`- UI and mono: ${f.mono.picks.join(', ')}${f.mono.note ? ` (${f.mono.note})` : ''}.`);
  out.push(`- Avoid: ${abAvoidWords(f.avoid)}.`);
  out.push(`- Why: ${f.why}`);
  out.push(`- Pairings (heading / body): ${f.pairings.map(p => p.join(' / ')).join('; ')}. The first is the recommended default.`);
  const faces = f.pairings[0].map(n => FONTS.find(x => x.name === n)).filter(Boolean);
  if (faces.length) out.push(`- Google Fonts for the recommended pairing: ${aibFontUrl(faces)}`);
  out.push(`- This brand's heading font, ${state.headingFont.name}, ${fitText(state.headingFont, fits.heading)}.`);
  out.push(`- This brand's body font, ${state.bodyFont.name}, ${fitText(state.bodyFont, fits.body)}.`);
  out.push('');
  return out;
}

/* ---------------- Patterns ---------------- */

// How much generated SVG the brief may carry per pattern. Over the cap the code is
// left out and the brief says to attach the exported file (never base64 PNGs).
const AIB_TILE_SVG_CAP = 8192;      // a 160px seamless tile
const AIB_FULL_SVG_CAP = 12288;     // a 1200x675 non-seamless SVG
const AIB_TILE_PX = 160;

// Where the pattern engine lives, so an AI tool can fetch the exact generator. Change it
// here if the project moves; every Source block in the brief reads it.
const PATTERN_SOURCE_ROOT = '~/Desktop/Branding Designer';
const AIB_PATTERN_PREAMBLE = "Patterns are generated by this project's own engine (js/patterns/). To reproduce exactly, load the engine and run the call under each pattern; same seed + params + inks → identical output.";
const AIB_FULL_W = 1200;
const AIB_FULL_H = 675;

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

const AIB_INK_SLOT_JOB = {
  ground: 'background',
  ink1: 'main shapes',
  ink2: 'secondary shapes',
  deep: 'darkest shade',
  spark: 'accent flecks, 5% of the area at most',
};

// Minimal data-URI escaping for an SVG inside url("..."): double quotes become single
// quotes, then only the characters that break a CSS url are percent-encoded.
function aibSvgDataUri(svg) {
  const q = svg.replace(/"/g, "'");
  return 'data:image/svg+xml,' + q.replace(/%/g, '%25').replace(/</g, '%3C').replace(/>/g, '%3E').replace(/#/g, '%23').replace(/\{/g, '%7B').replace(/\}/g, '%7D');
}

// Inline data: URIs (an aesthetic's hand-drawn SVG fills, tens of KB each) are replaced in the
// token and material dumps by a one-line description: a builder reads the file, not the bytes.
function aibCompactUri(text, key) {
  return String(text).replace(/url\(\s*(["']?)data:(image\/[a-z+.-]+)[\s\S]*?\1\s*\)/gi,
    (m, q, type) => `url(<inline ${type === 'image/svg+xml' ? 'SVG' : type.replace('image/', '').toUpperCase()}, copy it from css/aesthetics/${key}.css or js/aesthetics/${key}.js>)`);
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
      };
    }
  } catch (err) {
    out = null;
  }
  host.remove();
  return out;
}

// The Typography lines for headings and body. With a probe: the sizes, weights, case and
// tracking the board really renders (they come from the aesthetic's stylesheet and the
// layout, not from the editor's size / weight settings). Without one: no numbers that
// would be wrong, only the editor's baseline, named as such.
function aibTypeScaleLines(state, def, ty, probe) {
  // Real weights only: a single-weight face (Anton, Tilt Warp, VT323) has no 700 to ask for.
  const hw = abWeightNear(state.headingFont, ty.headingWeight), bw = abWeightNear(state.bodyFont, ty.bodyWeight);
  if (!probe) {
    return [`- Heading and body size, weight, case and letter-spacing come from the aesthetic's own stylesheet (css/aesthetics/${def.key}.css), not from the editor; the board shows them. The editor's baseline settings are headings ${ty.headingSize}px / weight ${hw}, body ${ty.bodySize}px / weight ${bw}.`];
  }
  const h = probe.h, b = probe.b;
  return [
    `- Headings as the board draws them: ${h.size}px on a 900px-wide board (the headline scales with the board width), weight ${abWeightNear(state.headingFont, +h.weight || 400)}, letter-spacing ${h.ls}em, text-transform ${h.tt}${h.style !== 'normal' ? ', ' + h.style : ''}. The editor's size and weight settings (${ty.headingSize}px, ${hw}) are a baseline the aesthetic restyles.`,
    `- Body copy as the board draws it: ${b.size}px, weight ${abWeightNear(state.bodyFont, +b.weight || 400)}, text-transform ${b.tt}.`,
  ];
}

// The Shape lines: the corner radii the board really draws, else just the editor's preset
// name (the aesthetic sets its own radii; the preset's numbers are not what the board uses).
function aibShapeLines(state, probe) {
  const lines = [];
  if (probe) {
    const r = probe.radius;
    const parts = [['cards', r.card], ['buttons', r.button], ['fields', r.field], ['swatches', r.swatch]].filter(([, v]) => v).map(([k, v]) => `${k} ${v}`);
    if (parts.length) lines.push(`- Corner radius as the board draws it: ${parts.join(', ')}.`);
  }
  lines.push(`- Editor shape preset: ${state.shapePreset.name} (the aesthetic sets its own corners${probe ? '' : '; see the board for the radii'}).`);
  return lines;
}

const aibKb = n => (n / 1024 < 10 ? (n / 1024).toFixed(1) : Math.round(n / 1024)) + ' KB';

// "Source" sub-block for one pattern: project path, engine and family files, load order
// and the exact calls (fully resolved params incl. tone, inks rebuilt from the five board
// tokens), so the output is deterministic. Nothing here points outside this project.
function aibPatternSourceLines(entry, f, t, tints) {
  const P = Patterns;
  const root = PATTERN_SOURCE_ROOT;
  const famFile = typeof P.fileOf === 'function' ? P.fileOf(entry.key) : null;
  const engine = P.ENGINE_FILE || 'js/patterns/engine.js';
  const order = (P.LOAD_ORDER || [engine, famFile, 'js/patterns/fit.js']).filter(Boolean);
  const params = JSON.stringify(P.resolve(entry.key, entry.params));
  const toks = JSON.stringify({ canvas: t.canvas, ink: t.ink, primary: t.primary, secondary: t.secondary, accent: t.accent });
  const inks = `Patterns.inksFor(${toks}, ${JSON.stringify(entry.colorway || 'brand')}, ${JSON.stringify({ tints: !!tints })})`;
  const seed = JSON.stringify(entry.seed);
  const size = `{ width: ${AIB_FULL_W}, height: ${AIB_FULL_H}, dpr: 1 }`;
  const out = ['**Source**', '',
    `- Project: the Branding Designer folder (the one holding \`index.html\`; usually \`${root}\`). Paths below are relative to it; this is the project's own pattern engine, no outside library is involved.`,
    `- Engine: \`${engine}\`.`,
    `- Family file: \`${famFile || 'js/patterns/families/'}\`, family key \`${entry.key}\`.`,
    `- Load order: ${order.map(x => '`' + x + '`').join(', ')}. Plain scripts with no dependencies; they define \`window.Patterns\`. All \`js/patterns/families/*.js\` files load before \`fit.js\`.`,
    '- Exact calls (same seed, params and inks give identical output; `dpr: 1` fixes the pixel size):', '',
    '```js',
    `Patterns.render(canvas, '${entry.key}', ${params}, ${inks}, ${seed}, ${size});   // canvas ${AIB_FULL_W}x${AIB_FULL_H}`];
  if (f.vector) out.push(`Patterns.renderSVG('${entry.key}', ${params}, ${inks}, ${seed}, { width: ${AIB_FULL_W}, height: ${AIB_FULL_H} });   // SVG string`);
  if (f.seamless && f.vector) out.push(`Patterns.tileSVG('${entry.key}', ${params}, ${inks}, ${seed}, ${AIB_TILE_PX});   // seamless ${AIB_TILE_PX}px SVG tile`);
  else if (f.seamless) out.push(`Patterns.render(canvas, '${entry.key}', ${params}, ${inks}, ${seed}, { width: ${AIB_TILE_PX}, height: ${AIB_TILE_PX}, dpr: 1, tile: true });   // seamless ${AIB_TILE_PX}px tile`);
  out.push('```', '');
  return out;
}

// Markdown lines for ONE pattern in the brief: what it is, where it goes, the exact inks,
// the settings and how to reproduce it. `level` is the heading depth ('###' or '####'),
// `n` the 1-based position (or null for a standalone block). Pure: no DOM.
function aibPatternItemLines(state, def, entry, n, level) {
  const P = Patterns;
  const f = P.list().find(x => x.key === entry.key);
  if (!f) return [];
  const t = boardTokens(state, def);
  const oneLine = x => String(x || '').replace(/\s+/g, ' ').trim();
  const cwWord = v => ((P.E.COLORWAYS.find(c => c.value === v) || {}).label || v);
  const use = entry.use || PatternPins.defaultUse(entry.key);
  const rules = AIB_USE_RULES[use] || AIB_USE_RULES.hero;
  const useName = PatternPins.useLabel(use);
  const out = [`${level || '####'} ${n ? n + '. ' : ''}${f.name}: ${useName}`, ''];

  out.push(`Family: ${f.name} (\`${f.key}\`). ${oneLine(f.blurb)} ${f.vector ? 'Vector' : 'Raster'}${f.seamless ? ', seamless' : ''}.`, '');
  out.push(`Use: ${useName}. ${rules.rule}`, '');

  // colors: the final hex for every ink the family draws with
  const inks = P.inksFor(t, entry.colorway, { tints: !!entry.params.tints });   // from the board tokens, the same ones the brief lists
  const fin = P.finalInks(entry.key, entry.params, inks);
  const tokenOf = hex => {
    const h = String(hex).toLowerCase();
    const hit = [['--canvas', t.canvas], ['--ink', t.ink], ['--primary', t.primary], ['--secondary', t.secondary], ['--accent', t.accent]]
      .find(([, v]) => String(v).toLowerCase() === h);
    if (hit) return '`' + hit[0] + '`';
    const pct = Math.round(tone * 100);
    if (entry.colorway === 'tonal') return `derived (the canvas shaded a few percent, Tonal colorway${tone < 1 ? ', strength ' + pct + '%' : ''})`;
    if (P.E.isFixedColorway && P.E.isFixedColorway(entry.colorway)) {
      return `fixed (part of the ${cwWord(entry.colorway)} colorway, not a brand token${tone < 1 ? '; strength ' + pct + '% toward the ground' : ''})`;
    }
    return entry.colorway === 'brand'
      ? `derived (a brand token mixed toward the canvas at strength ${pct}%)`
      : `derived (${cwWord(entry.colorway)} mix of the brand tokens${tone < 1 ? ', strength ' + pct + '%' : ''})`;
  };
  const slots = (f.ink || ['ground', 'ink1']).slice();
  if (entry.params.tints) slots.push('t1', 't2');
  const tone = entry.params.tone == null ? 1 : entry.params.tone;
  out.push(`Colorway: ${cwWord(entry.colorway)}. Final inks${tone < 1 ? ' (strength already applied)' : ''}; use these hexes as written:`);
  slots.forEach(k => {
    if (!fin[k]) return;
    const job = AIB_INK_SLOT_JOB[k] || (k === 't1' ? 'lighter tint of ink1' : k === 't2' ? 'lighter tint of ink2' : '');
    out.push(`- ${k} \`${fin[k]}\`: ${tokenOf(fin[k])}.${job ? ' ' + job.charAt(0).toUpperCase() + job.slice(1) + '.' : ''}`);
  });
  out.push('');

  // settings that differ from the defaults, plus seed and strength
  const schema = P.schema(entry.key);
  const defaults = P.defaults(entry.key);
  const fmt = v => (typeof v === 'boolean' ? (v ? 'on' : 'off') : String(v));
  const changed = schema.filter(sc => sc.key !== 'tone' && entry.params[sc.key] !== defaults[sc.key])
    .map(sc => `${sc.label} (\`${sc.key}\`) ${fmt(entry.params[sc.key])}`);
  out.push(`Settings: seed \`${entry.seed}\`; strength ${Math.round(tone * 100)}% (\`tone\` ${tone}). ` +
    (changed.length ? 'Changed from the defaults: ' + changed.join('; ') + '. Everything else is at the default.' : 'Every other setting is at the default.'), '');

  // reproduction
  const grain = entry.params.grain;
  if (f.vector && entry.svg) {
    if (f.seamless) {
      const svg = P.tileSVG(entry.key, entry.params, inks, entry.seed, AIB_TILE_PX);
      const css = svg ? aibSvgDataUri(svg) : '';
      if (svg && svg.length <= AIB_TILE_SVG_CAP && css.length <= AIB_TILE_SVG_CAP * 1.4) {
        out.push(`Reproduce: a seamless ${AIB_TILE_PX}x${AIB_TILE_PX}px SVG tile (this exact tile; grain is left out${grain > 0 ? ' of the tile' : ''} so it repeats cleanly):`, '',
          '```svg', svg, '```', '',
          'Ready-made CSS for the same tile:', '',
          '```css',
          `.${rules.cls} {`,
          `  background-color: ${fin.ground};`,
          `  background-image: url("${css}");`,
          `  background-size: ${AIB_TILE_PX}px ${AIB_TILE_PX}px;`,
          `  background-repeat: ${use === 'divider' ? 'repeat-x' : 'repeat'};`,
          '}', '```', '');
      } else {
        out.push(`Reproduce: this tile is ${svg ? 'about ' + aibKb(svg.length) : 'too large'} as SVG, too long to paste here. Attach the exported SVG (Patterns view, SVG) and use it as a repeating background (${AIB_TILE_PX}px tile). The seed and settings above regenerate it exactly.`, '');
      }
    } else {
      const svg = P.renderSVG(entry.key, entry.params, inks, entry.seed, { width: AIB_FULL_W, height: AIB_FULL_H });
      if (svg && svg.length <= AIB_FULL_SVG_CAP) {
        const fit = svg.replace(/^(<svg [^>]*?) width="\d+" height="\d+">/, '$1 width="100%" height="100%" preserveAspectRatio="xMidYMid slice">');
        out.push(`Reproduce: this exact ${AIB_FULL_W}x${AIB_FULL_H} SVG. It does not tile, and the root is set to fill its box and crop to fit (\`preserveAspectRatio="xMidYMid slice"\`):`, '',
          '```svg', fit, '```', '');
      } else {
        out.push(`Reproduce: this pattern does not tile and its SVG is ${svg ? 'about ' + aibKb(svg.length) : 'too large'}, too long to paste here. Attach the exported SVG (1600x900) or PNG (1x 1280x720, 2x 2560x1440, 4K 3840x2160) from the Patterns view and use it with \`background-size: cover\`. The seed and settings above regenerate it exactly.`, '');
      }
    }
  } else if (f.vector) {
    out.push(`Reproduce: the SVG code is not included for this pattern. Attach the exported SVG (1600x900) or PNG (1x 1280x720, 2x 2560x1440, 4K 3840x2160) from the Patterns view${f.seamless ? ', or build the ' + AIB_TILE_PX + 'px tile from the family, seed and settings above' : ''}, and use it with \`background-size: cover\`.`, '');
  } else {
    const png = rules.png === '2x' ? 'PNG 2x (2560x1440)' : 'PNG 1x (1280x720)';
    out.push(`Reproduce: raster family, so there is no SVG. Attach the exported ${png} from the Patterns view and use it as a background with \`background-size: cover\`. Do not trace or redraw it by hand. If the file is missing, regenerate it in Branding Designer from the family, colorway, seed and settings above. Other sizes: PNG 1x 1280x720, 2x 2560x1440, 4K 3840x2160.`, '');
  }
  aibPatternSourceLines(entry, f, t, entry.params.tints).forEach(l => out.push(l));
  return out;
}

// "Patterns" section: which generative pattern families suit the aesthetic, how
// pattern inks map to the brand roles, and every pattern added to the brief (the
// cart, state.patterns) with its use, exact inks, settings and reproduction.
// Pure: reads js/patterns/*, never the DOM. Returns [] when the engine is absent.
function aibPatternLines(state, def) {
  if (typeof Patterns === 'undefined' || typeof Patterns.suiteFor !== 'function') return [];
  const out = [];
  const infoOf = key => Patterns.list().find(f => f.key === key);
  const cwWord = v => ((Patterns.E.COLORWAYS.find(c => c.value === v) || {}).label || v);
  const oneLine = s => String(s || '').replace(/\s+/g, ' ').trim();
  const suite = typeof blendSuite === 'function' ? blendSuite(def) : Patterns.suiteFor(def.key);
  const pins = typeof PatternPins !== 'undefined' ? PatternPins.normalizeList(state.patterns) : [];
  // Fixed colourways (Spectrum, Tonal, Broadcast, Primaries, Earth) are the documented
  // exceptions to "never introduce a color": name the ones this brief uses. Briefs that
  // use none keep the wording below unchanged.
  const fixedUsed = (Patterns.E.COLORWAYS || []).filter(c => c.fixed && suite.concat(pins).some(s => s.colorway === c.value));
  const fixedLines = fixedUsed.length
    ? fixedUsed.map(c => `- ${c.label} colorway (fixed): ${c.note}. Its hexes are part of the style, not brand tokens; use them as listed.`)
      .concat(['- Never introduce a color a pattern does not get from these roles or from the fixed colorways named above.', ''])
    : ['- Never introduce a color a pattern does not get from these roles.', ''];
  out.push('## Patterns', '', AIB_PATTERN_PREAMBLE, '',
    `Generative textures made only from the brand colors (Patterns view in Branding Designer). Use them as hero backgrounds, section bands, card textures, divider strips and small accent details. Keep body text on a plain \`--canvas\` area, never on a pattern.`, '',
    '### Ink mapping', '',
    '- ground = `--canvas`.',
    '- ink1 = `--primary` (or `--ink` in the Mono colorway).',
    '- ink2 = `--secondary`.',
    '- spark = `--accent`, at most 5% of the pattern area.',
    '- Colorways: Brand (the roles above), Mono (ink on canvas), Duotone (primary on canvas), Night (canvas and ink swapped). "+ tints" adds lighter mixes of primary and secondary toward the canvas.',
    ...fixedLines,
    `### Families that fit ${def.name}`, '');
  suite.forEach(s => {
    const f = infoOf(s.key);
    if (!f) return;
    const file = typeof Patterns.fileOf === 'function' ? Patterns.fileOf(s.key) : null;
    out.push(`- **${s.name}** (${f.name}, ${cwWord(s.colorway)}): ${oneLine(f.blurb)}${file ? ` Source: \`${file}\`, family \`${s.key}\`.` : ''}`);
  });
  out.push('');
  const items = pins;
  if (items.length) {
    out.push('### In your brief', '',
      `${items.length === 1 ? 'This pattern was' : 'These ' + items.length + ' patterns were'} chosen for this brand. Reproduce each one exactly as described: same family, colorway, hexes, seed and settings, in the place named by its use.`, '');
    items.forEach((p, i) => aibPatternItemLines(state, def, p, i + 1, '####').forEach(l => out.push(l)));
  } else {
    out.push('No patterns have been added to the brief yet. Pick from the families above.', '');
  }
  return out;
}

function aibBrandName(state) {
  const c = state.content || {};
  return (typeof c.brandName === 'string' && c.brandName.trim()) ? c.brandName.trim() : AIB_CONTENT_FALLBACK.brandName;
}

// "Copy patterns only": the Patterns section on its own, with a one-line preamble so it
// can be pasted after an existing brief. The brief describes abView(state): the base
// aesthetic, or the blend (js/blend.js).
function buildPatternsBrief(state0) {
  const { state, def } = abView(state0);
  return `Add this Patterns section to the ${aibBrandName(state)} brand brief. Its colors are the CSS custom properties from that brief, and every hex is final.\n\n` +
    aibPatternLines(state, def).join('\n');
}

// One pattern's block (item i of state.patterns), for the per-item Copy in the cart.
function buildPatternItemBrief(state0, i) {
  const { state, def } = abView(state0);
  const items = typeof PatternPins !== 'undefined' ? PatternPins.normalizeList(state.patterns) : [];
  if (!items[i]) return '';
  return `Pattern for the ${aibBrandName(state)} brand brief. Its colors are the CSS custom properties from that brief, and every hex is final.\n\n${AIB_PATTERN_PREAMBLE}\n\n` +
    aibPatternItemLines(state, def, items[i], null, '###').join('\n');
}

function buildAiBrief(state0) {
  const { state, def } = abView(state0);
  const t = boardTokens(state, def);
  const roles = colorRolesFor(state);
  const extras = abTokens(def, t, state);
  const mode = t.isDark ? 'dark' : 'light';
  const content = state.content || {};
  const pick = k => (typeof content[k] === 'string' && content[k].trim()) ? content[k].trim() : AIB_CONTENT_FALLBACK[k];
  const brandName = pick('brandName');
  const tagline = pick('tagline');
  const ty = state.typography;
  const out = [];
  const push = (...lines) => out.push(...lines);

  const cov = k => roles[k].coverage;

  /* 1. Title + instruction */
  push(`# ${brandName} — brand brief for AI builders${def.blend ? ` (${def.name})` : ''}`, '',
    '**Use only the colors, fonts and rules below. Do not introduce new colors, tints, gradients or fonts unless listed here.**',
    '', 'Every color value in this brief is final. If a design needs a color that is not listed, use the nearest listed token instead of inventing one.', '');

  /* 2. Brand */
  push('## Brand', '', `- Name: ${brandName}`, `- Tagline: ${tagline}`, '');

  /* 3. Aesthetic */
  push(`## Aesthetic: ${def.name}`, '',
    `- Descriptor: ${def.descriptor}`,
    `- Influences: ${def.influences}`,
    `- Summary: ${def.summary || ''}`,
    `- Motto: ${def.motto || ''}`,
    `- Mode: ${mode} (canvas is the ${mode} neutral, ink is the ${t.isDark ? 'light' : 'dark'} neutral)`, '');
  if (def.blend && typeof blendBriefLines === 'function') push(...blendBriefLines(state, def, t));

  /* 4. Color tokens */
  push('## Color tokens', '',
    'Define these as CSS custom properties and reference them by name. Hexes are exact; do not adjust them.', '');
  const tokenRows = [];
  AIB_TOKEN_ROWS.forEach(([name, field, roleKey]) => {
    const hex = t[field] != null ? t[field] : state.colors[field];
    const r = roleKey ? roles[roleKey] : null;
    const job = r ? r.job : (AIB_DERIVED_JOB[field] || '');
    // On a printed primary, --on-primary stays the label colour for the brand hex (it is what
    // brandCssText defines); the printed primary has its own --primary-print / --on-primary-print.
    tokenRows.push([`\`${name}\``, field === 'onPrimary' && t.printed ? pickReadableText(t.primary) : hex, roleKey ? r.label : 'Derived', job]);
    if (field === 'primary' && t.printed) tokenRows.push(['`--primary-print`', t.printPrimary, 'Derived', AIB_DERIVED_JOB.printPrimary]);
    if (field === 'onPrimary' && t.printed) tokenRows.push(['`--on-primary-print`', t.onPrimary, 'Derived', AIB_DERIVED_JOB.onPrintPrimary]);
  });
  Object.keys(extras).forEach(name => {
    const v = String(extras[name]).trim();
    if (!AIB_HEX.test(v)) return;
    tokenRows.push([`\`${name}\``, v, 'Aesthetic', 'Aesthetic-specific color used by the Materials below']);
  });
  push(aibTable(['Token', 'Hex', 'Role', 'Job'], tokenRows), '');
  push(`Canvas is derived from ${t.isDark ? 'Neutral dark' : 'Neutral light'}${def.canvas ? ` and then adjusted by the ${def.name} aesthetic` : ''}. Use \`--canvas\`, not the raw neutral, for page and panel backgrounds.`, '');
  if (t.printed) {
    push(`The brand primary is \`${t.primary}\` (\`--primary\`), but ${def.name} prints it as \`${t.printPrimary}\` (\`--primary-print\`). Every primary fill, rule and mark in this aesthetic uses \`--primary-print\`, with \`--on-primary-print\` text on it and \`--pri-tint\` for quiet washes (both are derived from \`--primary-print\`). Show \`--primary\` only where the palette names the brand color.`, '');
  }

  /* 5. Where each color goes */
  push('## Where each color goes', '');
  AIB_ROLE_ORDER.forEach(k => {
    const r = roles[k];
    push(`### ${r.label} (${t[k]}): ${r.job}`, '',
      `- Use for: ${r.use}`,
      `- Never for: ${r.never}`,
      `- Coverage: ${r.coverage}`, '');
  });
  push('### Hard rules', '',
    def.ctaFill === 'ink'
      ? '1. Exactly one main call to action per view, filled with `--ink` with a `--canvas` label. `--primary` is never a button fill here; it marks state only (selected controls, switch on, focus ring, progress bars, status dot).'
      : '1. Exactly one primary-filled action (the main call to action) per view.',
    '2. Secondary never fills the main call to action and never sets body text.',
    `3. Accent covers ${cov('accent')} of any view and is never used on buttons, body text or borders.`,
    '4. Text is set only in `--ink`, `--muted` or the matching `--on-*` token on its fill. The one exception is the single accent highlight word, and only where the highlight treatment below says so.',
    `5. Color budget per view: canvas ${cov('canvas')}, ink ${cov('ink')}, primary ${cov('primary')}, secondary ${cov('secondary')}, accent ${cov('accent')}. Stay inside it.`,
    '6. No other colors, tints or gradients. Hover and pressed states use only the tokens above (for example `--pri-tint`, `--sec-tint`) or the shadows and overlays listed under Materials.',
    contrastRatio(t.printPrimary, t.canvas) < 3
      ? `7. Focus ring is \`${t.printed ? '--primary-print' : '--primary'}\` (3px) with an outer 1px \`--ink\` ring, because \`${t.printed ? '--primary-print' : '--primary'}\` alone is under 3:1 on this canvas.`
      : `7. Focus ring is always \`${t.printed ? '--primary-print' : '--primary'}\`.`);
  const hlKind = aibHighlightKind(def);
  if (hlKind === 'band') {
    push('8. In this aesthetic the highlight word is a highlighter band: background `' + t.accent + '` (`--accent`) behind the word, text in `' + t.onAccent + '` (`--on-accent`). Never set accent-colored text.');
  } else if (hlKind === 'custom') {
    push(def.highlightNote
      ? '8. Headline highlight word, once per view: ' + def.highlightNote.replace(/\s*Use it once per view\.?$/, '') + ' Never set plain `--accent` as text.'
      : '8. The highlight word has a custom treatment (see Materials). Where it is set as text, use `' + t.accentInk + '` (`--accent-ink`), never plain `--accent` as text. Use it once per view.');
  } else {
    const same = t.accentInk.toLowerCase() === t.accent.toLowerCase();
    push('8. The highlight word is set as text in `' + t.accentInk + '` (`--accent-ink`)' + (same ? ', which is the accent itself' : ', the accent ' + (t.isDark ? 'tinted' : 'shaded') + ', same hue family (yellows shift toward amber on light canvases)') + ', at ' + aibRatio(t.accentInk, t.canvas) + ' on the canvas. Use it once per view; never set plain `--accent` as text' + (t.accentLow ? ' (it is only ' + aibRatio(t.accent, t.canvas) + ' on this canvas)' : '') + '.');
  }
  push('');

  /* 6. Component color map */
  push('## Component color map', '',
    'Which token goes where. Shadows, blur and borders beyond these tokens come from Materials.' + (def.key === 'bauhaus-poster' ? ' Ink borders apply to UI controls only (cards, inputs, buttons); the art shapes have no outline.' : ''), '',
    aibTable(['Element', 'Background', 'Text', 'Border / edge'], aibComponentRows(t, def, extras)), '');

  /* 7. Contrast */
  const pairs = [
    ['--ink on --canvas', t.ink, t.canvas, 'Body and headlines'],
    ['--muted on --canvas', t.muted, t.canvas, 'Captions and secondary text'],
    ...(def.ctaFill === 'ink' ? [['--canvas on --ink', t.canvas, t.ink, 'Main button label']]
      : t.printed ? [['--on-primary-print on --primary-print', t.onPrimary, t.printPrimary, 'Primary button label (the printed primary)'],
        ['--on-primary on --primary', pickReadableText(t.primary), t.primary, 'Label on a brand-primary fill (the palette swatch only)']]
        : [['--on-primary on --primary', t.onPrimary, t.primary, 'Primary button label']]),
    ['--on-secondary on --secondary', t.onSecondary, t.secondary, 'Chip and tag label'],
    ['--on-accent on --accent', t.onAccent, t.accent, 'Badge label, highlight band'],
    ['--accent-ink on --canvas', t.accentInk, t.canvas, 'Highlight word and accent text (the accent shaded to 3:1)'],
    ['--accent on --canvas', t.accent, t.canvas, t.accentLow ? 'Do not use as text; graphic fills only' : 'Graphics and fills'],
    ...(t.printed ? [['--primary-print on --canvas', t.printPrimary, t.canvas, contrastRatio(t.printPrimary, t.canvas) >= 3 ? 'Focus ring, graphics, large elements' : 'Graphics only; keep the label in --on-primary-print']] : []),
    ['--primary on --canvas', t.primary, t.canvas, t.printed
      ? (contrastRatio(t.primary, t.canvas) >= 3 ? 'The brand color in the palette swatch and brand marks' : 'The brand color in the palette swatch only; never as text or a thin line')
      : (contrastRatio(t.primary, t.canvas) >= 3 ? 'Focus ring, graphics, large elements' : 'Graphics only; keep the label in --on-primary')],
  ];
  push('## Contrast pairs', '',
    aibTable(['Pair', 'Foreground', 'Background', 'Ratio', 'Grade', 'Use'],
      pairs.map(([n, fg, bg, use]) => [n, fg, bg, aibRatio(fg, bg), aibGrade(contrastRatio(fg, bg)), use])), '',
    'AAA is 7:1, AA is 4.5:1 for body text, "AA large text only" is 3:1 for text of 24px or 19px bold and up.', '');

  /* 8. Typography */
  const fontUrl = aibFontUrl([state.headingFont, state.bodyFont]);
  const probe = aibProbeBoard(state, def);
  push('## Typography', '',
    `- Heading font: ${state.headingFont.name} (${state.headingFont.category}); CSS: \`${state.headingFont.css}\``,
    `- Body font: ${state.bodyFont.name} (${state.bodyFont.category}); CSS: \`${state.bodyFont.css}\``,
    `- Google Fonts: ${fontUrl}`,
    ...aibTypeScaleLines(state, def, ty, probe));
  if (def.type && (def.type.ui || def.type.label)) {
    const faceName = k => (typeof abResolveFace === 'function' ? abResolveFace(k, state).name : k);
    if (def.type.ui) push(`- Interface text (tabs, buttons, field values, list cells): ${faceName(def.type.ui)}${def.type.ui === 'body' ? '' : `. The ${state.bodyFont.name} body face is for reading copy only`}.`);
    if (def.type.label) push(`- Small labels and captions: ${faceName(def.type.label)}.`);
  }
  const notes = def.typeNotes;
  (Array.isArray(notes) ? notes : notes ? [notes] : []).forEach(n => push(`- ${n}`));
  push(...aibShapeLines(state, probe), '');
  aibTypeRecommendation(state, def).forEach(line => push(line));

  /* 9. Materials */
  const unresolved = [];
  // A blend's material channel lists the donor's recipes, filled in from the donor's variables.
  const matDonor = def.blend && def.blend.channels.material ? def.blend.donor : null;
  const matExtras = matDonor && typeof blendDonorTokens === 'function' ? blendDonorTokens(matDonor, t, state) : extras;
  push(`## Materials (${def.labels && def.labels.material ? def.labels.material : def.name})`, '',
    'Surface recipes for this aesthetic with real values filled in. Apply them as written.', '');
  (def.materials || []).forEach(m => {
    push(`- **${m.name}**: ${aibCompactUri(abResolveMaterial(m.css, t, matExtras, (name, whole) => { unresolved.push(name); return whole; }), matDonor ? matDonor.key : def.key)}`);
  });
  if (!(def.materials || []).length) push('- None defined. Use flat fills from the tokens above.');
  if (unresolved.length) console.warn(`buildAiBrief: unresolved material placeholders for ${def.key}: ${unresolved.join(', ')}`);
  push('');

  /* 9b. Patterns */
  push(...aibPatternLines(state, def));

  /* 10. Do / Don't */
  const rules = def.rules || {};
  push('## Do', '', ...(rules.do || []).map(x => `- ${x}`), '');
  push("## Don't", '', ...(rules.dont || []).map(x => `- ${x}`), '');

  /* 11. CSS variables */
  const derived = AIB_TOKEN_ROWS
    .filter(([name]) => !['--primary', '--secondary', '--accent', '--neutral-dark', '--neutral-light', '--on-primary', '--on-accent'].includes(name))
    .map(([name, field]) => `  ${name}: ${t[field]};`);
  if (t.printed) derived.unshift(`  --primary-print: ${t.printPrimary};`, `  --on-primary-print: ${t.onPrimary};`);
  const extraLines = Object.keys(extras).map(name => `  ${name}: ${aibCompactUri(String(extras[name]).replace(/\s*\n\s*/g, ' ').trim(), def.key)};`);
  push('## CSS variables', '', '```css', brandCssText(state), '',
    `/* Derived tokens for the ${mode}-mode ${def.name} aesthetic. Computed, do not edit. */`,
    ':root {', ...derived, '}');
  if (extraLines.length) push('', `/* ${def.name} material variables, referenced by the Materials above. */`, ':root {', ...extraLines, '}');
  if (matDonor) {
    const donorLines = Object.keys(matExtras).map(name => `  ${name}: ${aibCompactUri(String(matExtras[name]).replace(/\s*\n\s*/g, ' ').trim(), matDonor.key)};`);
    if (donorLines.length) push('', `/* ${matDonor.name} material variables (the supporting system). Scope them to the surfaces that use its Materials. */`, `.material-${matDonor.key} {`, ...donorLines, '}');
  }
  push('```', '');

  return out.join('\n');
}
