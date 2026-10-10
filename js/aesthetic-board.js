/* ---------------------------------------------------------------------
   aesthetic-board.js — the "Design language board".

   One function (boardHtml) builds the board for a (state, aesthetic) pair,
   so the main board and every Compare-all tile come from the same markup.
   Aesthetic files (js/aesthetics/<key>.js) only contribute art, extra
   CSS variables and descriptors; their look lives in css/aesthetics/.

   Depends on color.js / slide-mocks.js (slMix, slVisible) and app.js
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

// Derived colors are computed here and nowhere else (the AI brief prints
// these exact hexes). `def.canvas(base)` may return an adjusted canvas hex
// (e.g. Soft Form lifts very dark canvases); everything derives from that.
function boardTokens(state, def) {
  const c = state.colors;
  const isDark = state.bgMode === 'dark';
  let canvas = isDark ? c.neutralDark : c.neutralLight;
  const ink = isDark ? c.neutralLight : c.neutralDark;
  if (def && typeof def.canvas === 'function') {
    const adjusted = def.canvas({
      canvas, ink, isDark, primary: c.primary, secondary: c.secondary, accent: c.accent,
      mix: slMix, hexToHsl, hslToHex,
    });
    if (adjusted) canvas = adjusted;
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
    '--ab-primary': t.primary, '--ab-on-primary': t.onPrimary,
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
  vars['--ab-font-ui'] = ui.expr;
  vars['--ab-font-label'] = label.expr;
  vars['--ab-display'] = Number(ty2.display) > 0 ? Number(ty2.display) : 1;
  if (typeof def.tokens === 'function') Object.assign(vars, def.tokens(t));
  return vars;
}

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
const AB_HEROES = ['split', 'centered', 'poster', 'scene'];
const AB_PALETTES = ['swatches', 'strips', 'chips'];
const AB_SECTIONS = ['two-col', 'stacked', 'asym'];
const AB_STATE_KINDS = ['swatch', 'button', 'chip'];

// Resolve def.layout against the defaults; unknown values fall back.
function abLayoutOf(def) {
  const l = Object.assign({}, AB_LAYOUT_DEFAULT, def && def.layout);
  if (!AB_HEROES.includes(l.hero)) l.hero = 'split';
  if (!AB_PALETTES.includes(l.palette)) l.palette = 'swatches';
  if (!AB_SECTIONS.includes(l.sections)) l.sections = 'two-col';
  l.subcopy = l.subcopy !== false;
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
  const meta = typeof aestheticMeta === 'function' ? aestheticMeta(def.key) : null;
  if (!meta || !meta.fonts) return '';
  const f = meta.fonts;
  const e = escapeHtml;
  const fits = fontFitFor(def.key, state);
  const picks = names => names.slice(0, 3).map(n => {
    const font = FONTS.find(x => x.name === n);
    return `<li class="ab-type-pick" style="font-family:${font ? e(font.css) : 'inherit'}">${e(n)}</li>`;
  }).join('');
  const col = (role, label, block, cur, fit) => `
      <div class="ab-type-col" data-role="${role}">
        <p class="ab-type-role">${label}</p>
        ${block.classes ? `<p class="ab-type-class">${e(fontClassWords(block.classes))}</p>` : (block.note ? `<p class="ab-type-class">${e(block.note)}</p>` : '<p class="ab-type-class">&nbsp;</p>')}
        <ul class="ab-type-picks">${picks(block.picks)}</ul>${cur ? `
        <p class="ab-type-fit"><span class="ab-type-cur">Your ${role}: <b style="font-family:${e(cur.css)}">${e(cur.name)}</b></span>${abFitPill(fit)}</p>` : ''}
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
        <div class="ab-type-act">
          <button type="button" class="ab-type-apply">Use recommended fonts</button>
          <span class="ab-type-pair">${e(pair[0])} / ${e(pair[1])}${used ? ' · in use' : ''}</span>
        </div>
      </div>
    </section>
    <div class="ab-rule"></div>
    `;
}

let abSeq = 0;

function boardHtml(state, def) {
  const t = boardTokens(state, def);
  const copy = effectiveContent();
  const ctx = {
    t, key: def.key, state,
    brandName: copy.brandName, tagline: copy.tagline,
    initial: abInitial(copy.brandName), logoDataUrl: state.logoDataUrl,
  };
  const roles = boardRoles(state, def);
  const vars = boardVars(t, state, def, copy.tagline);
  const style = Object.entries(vars).map(([k, v]) => `${k}:${String(v).replace(/"/g, "'")}`).join(';');
  const uid = 'ab' + (++abSeq);
  const labels = def.labels || { material: 'Touch & depth', states: ['One', 'Two', 'Three'] };
  const e = escapeHtml;

  const brand = state.logoDataUrl
    ? `<img class="ab-logo" src="${state.logoDataUrl}" alt="${e(copy.brandName)}" />`
    : `<span class="ab-mark" aria-hidden="true"><span>${e(ctx.initial)}</span></span><span class="ab-wordmark">${e(copy.brandName)}</span>`;

  const layout = abLayoutOf(def);
  const hlKind = abHighlightOf(def);
  const statesKind = AB_STATE_KINDS.includes(labels.statesKind) ? labels.statesKind : 'swatch';
  // Text colour that reads on each role's own fill (strips put labels inside the band).
  const onRole = { canvas: t.ink, ink: t.canvas, primary: t.onPrimary, secondary: t.onSecondary, accent: t.onAccent };

  const swatches = AB_ROLE_ORDER.map(k => {
    const r = roles[k] || {};
    const hex = t[k];
    const cov = abCoverageNum(r.coverage);
    return `<div class="ab-swatch" data-role="${k}" style="--sw:${hex};--sw-on:${onRole[k]};--cov:${cov}">
      <span class="ab-chip" style="background:${hex}"></span>
      <b class="ab-sw-role">${e(r.label || k)}</b>
      <span class="ab-sw-job">${e(r.job || '')}${r.coverage ? ' · ' + e(r.coverage) : ''}</span>
      <code class="ab-sw-hex">${hex.toUpperCase()}</code>
    </div>`;
  }).join('');

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

  return `<section class="ab" data-ae="${def.key}" data-mode="${t.isDark ? 'dark' : 'light'}" data-accent-text="${t.accentLow ? 'low' : 'ok'}" data-hero="${layout.hero}" data-palette="${layout.palette}" data-sections="${layout.sections}" data-highlight="${hlKind}" data-states="${statesKind}" data-subcopy="${layout.subcopy ? 'on' : 'off'}" data-hcls="${e(state.headingFont.cls || '')}" data-bcls="${e(state.bodyFont.cls || '')}" style="${style}">
  <div class="ab-in">
    <header class="ab-head">
      <div class="ab-brand">${brand}</div>
      <span class="ab-tag"><span class="ab-tag-pre">Design language / </span><b>${e(def.name)}</b></span>
    </header>
    <div class="ab-rule"></div>
    <section class="ab-hero">
      <div class="ab-hero-copy">
        <p class="ab-kicker">${e(def.kicker || def.descriptor)}</p>
        <h2 class="ab-headline">${abHeadline(copy.tagline)}</h2>${layout.subcopy
    ? `\n        <p class="ab-subcopy"><span class="ab-sub-lead">A design language for ${e(copy.brandName)}</span><span class="ab-sub-rest"> — type, color and material in one place.</span></p>` : ''}
      </div>
      <div class="ab-art" aria-hidden="true">${def.art ? def.art(ctx) : ''}</div>
    </section>
    <div class="ab-rule"></div>
    <section class="ab-palette" aria-label="Palette">
      <div class="ab-labelrow"><span class="ab-label">The palette</span><span class="ab-label">${e(def.descriptor)}</span></div>
      <div class="ab-swatches" data-kind="${layout.palette}">${swatches}</div>
    </section>
    <div class="ab-rule"></div>
    ${abTypeBlockHtml(state, def)}<div class="ab-sections">
      <section class="ab-sec ab-sec-ui" aria-label="Interface">
        <div class="ab-labelrow"><span class="ab-label"><i class="ab-n">01</i><span>Interface</span></span></div>
        <div class="ab-card">
          <div class="ab-seg" role="group" aria-label="Project stage">${segs}</div>
          <h3 class="ab-card-title" data-ab-title>${e(stage[0])}</h3>
          <p class="ab-card-body" data-ab-body>${e(stage[1])}</p>
          <button type="button" class="ab-cta"><span class="ab-cta-label">Save direction</span><span class="ab-cta-arrow" aria-hidden="true"></span></button>
        </div>
      </section>
      <section class="ab-sec ab-sec-touch" aria-label="${e(labels.material)}">
        <div class="ab-labelrow"><span class="ab-label"><i class="ab-n">02</i><span>${e(labels.material)}</span></span></div>
        <div class="ab-panel">
          <label class="ab-fieldlabel" for="${uid}-f">Project name</label>
          <input class="ab-input" id="${uid}-f" type="text" value="Something good" maxlength="48" autocomplete="off" />
          <label class="ab-toggle" for="${uid}-t"><span>Focus mode</span><input class="ab-switch" id="${uid}-t" type="checkbox" checked /></label>
          <div class="ab-status" aria-live="polite">Focus mode on</div>
          <div class="ab-states" data-kind="${statesKind}">${states}</div>
        </div>
      </section>
      <section class="ab-sec ab-sec-use" aria-label="In use">
        <div class="ab-labelrow"><span class="ab-label"><i class="ab-n">03</i><span>In use</span></span></div>
        <ul class="ab-list">${rows}</ul>
      </section>
    </div>
    <footer class="ab-foot"><span class="ab-motto"><i class="ab-dot" aria-hidden="true"></i>${e(def.motto)}</span><span class="ab-infl">${e(def.influences)}</span></footer>
  </div>
</section>`;
}

/* ---------------- main board + compare grid ---------------- */

let boardView = 'board';          // 'board' | 'compare' (UI only, never saved)
const CMP_WIDE = 900;             // design width of a tile board on a wide grid
const CMP_NARROW = 500;           // ...and on a one-column grid

function setBoardFonts(el) {
  el.style.setProperty('--font-heading', state.headingFont.css);
  el.style.setProperty('--font-body', state.bodyFont.css);
}

function renderMainBoard() {
  const host = document.getElementById('previewCard');
  if (!host) return;
  setBoardFonts(host);
  host.innerHTML = boardHtml(state, aestheticByKey(state.aesthetic));
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
  const def = aestheticByKey(state.aesthetic);
  const compare = boardView === 'compare';
  const host = document.getElementById('previewCard');
  const grid = document.getElementById('compareGrid');
  if (host) host.hidden = compare;
  if (grid) grid.hidden = !compare;
  // Only the visible view is built. The hidden one is emptied (Compare holds
  // twenty full boards) and is rebuilt when its view is shown again.
  if (compare) {
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
  renderFontRec(def);
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
  boardView = view === 'compare' ? 'compare' : 'board';
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
