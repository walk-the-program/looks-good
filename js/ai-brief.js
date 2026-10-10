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
  onSecondary: 'Text and icons on a secondary fill only',
  onAccent: 'Text and icons on an accent fill only',
  priTint: 'Quiet primary wash: selected state background, hover on primary-linked items',
  secTint: 'Quiet secondary wash: selected row, tonal fills, hover on secondary items',
};

function aibKebab(name) {
  return String(name).replace(/[A-Z]/g, ch => '-' + ch.toLowerCase());
}

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

// {placeholder} resolution for def.materials (documented in
// docs/aesthetics-plan.md "Board anatomy"): t[name] first, else the
// aesthetic's extra var --ab-<kebab(name)>. Unresolved names stay visible.
function aibResolveMaterial(css, t, extras, unresolved) {
  return String(css).replace(/\{([A-Za-z][A-Za-z0-9]*)\}/g, (whole, name) => {
    const own = t[name];
    if (typeof own === 'string' || typeof own === 'number') return String(own);
    const extra = extras['--ab-' + aibKebab(name)];
    if (extra != null) return String(extra);
    unresolved.push(name);
    return whole;
  });
}

const AIB_HEX = /^#[0-9a-f]{6}$/i;

// Color treatments that differ per aesthetic. Everything is a token name;
// the role rules always win over the look.
const AIB_BAND_HL = ['raw-brutalist', 'neo-brutal-pop', 'clay', 'bauhaus-poster', 'riso-print'];
const AIB_INK_BORDER = ['raw-brutalist', 'neo-brutal-pop', 'bauhaus-poster'];

function aibComponentRows(t, def) {
  const key = def.key;
  const focusLow = contrastRatio(t.primary, t.canvas) < 3;
  const bandHl = t.accentLow || AIB_BAND_HL.includes(key);

  let segOn;
  if (key === 'soft-form' || key === 'raw-brutalist') segOn = ['--ink', '--canvas', 'none'];
  else if (key === 'aurora-noir') segOn = [t.mix(t.ink, t.canvas, 0.1) + ' (ink at 10% over canvas)', '--ink', 'ink at 12%'];
  else if (key === 'liquid-glass') segOn = ['translucent lens: --canvas lightened toward white', '--ink', 'white at 50%'];
  else if (key === 'holo-iridescent') segOn = ['decorative silver chrome pill (see Materials)', '--ink', 'none'];
  else if (key === 'clay') segOn = ['near-white puffy pill (see Materials)', '--ink', 'none'];
  else segOn = ['--primary', '--on-primary', AIB_INK_BORDER.includes(key) ? '--ink' : 'none'];

  const toggleOn = key === 'soft-form' ? 'track --canvas (recessed), knob --primary'
    : key === 'retro-futurist' ? 'track --canvas, status lamp --accent (glow)'
      : 'track --primary, knob --on-primary';
  const toggleOff = key === 'soft-form' ? 'track --canvas (recessed), knob --muted' : 'track --line, knob --muted';

  const hl = bandHl
    ? ['--accent (band behind the word)', '--on-accent', 'none']
    : ['none', '--accent', 'none'];

  const inkBorder = AIB_INK_BORDER.includes(key);
  const cardBg = key === 'neo-brutal-pop' ? '--sec-tint' : '--canvas';

  return [
    ['Page', '--canvas', '--ink', 'none'],
    ['Card / panel', cardBg, '--ink', inkBorder ? '--ink' : '--line'],
    ['Primary button (one per view)', '--primary', '--on-primary', inkBorder ? '--ink' : 'none'],
    ['Secondary button', 'transparent (hover: --sec-tint)', '--ink', '--secondary'],
    ['Ghost / tertiary link', 'none', '--ink (underlined)', 'none'],
    ['Input field, rest', '--canvas', '--ink (placeholder: --muted)', inkBorder ? '--ink' : '--line'],
    ['Input field, focus', '--canvas', '--ink', '--primary (plus a 3px ring of --primary at 40% opacity)'],
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
    ['List row, selected', '--sec-tint', '--ink', 'left edge 2px --primary'],
    ['List row, resting', 'transparent', '--ink (meta: --muted)', 'bottom 1px --line'],
    ['Progress / data bar', 'track --line', 'n/a', 'fill --primary (second series: --secondary)'],
    ['Focus ring (any control)', 'n/a', 'n/a', focusLow ? '3px --primary with an outer 1px --ink ring (primary alone is under 3:1 on this canvas)' : '--primary'],
  ];
}

function aibFontUrl(fonts) {
  const seen = new Set();
  const families = fonts.filter(f => !seen.has(f.name) && seen.add(f.name))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(f => `family=${encodeURIComponent(f.name).replace(/%20/g, '+')}:wght@${f.weights || '400;700'}`);
  return `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`;
}

function buildAiBrief(state) {
  const def = aestheticByKey(state.aesthetic);
  const t = boardTokens(state, def);
  const roles = colorRolesFor(state);
  const extras = typeof def.tokens === 'function' ? def.tokens(t) : {};
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
  push(`# ${brandName} — brand brief for AI builders`, '',
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

  /* 4. Color tokens */
  push('## Color tokens', '',
    'Define these as CSS custom properties and reference them by name. Hexes are exact; do not adjust them.', '');
  const tokenRows = AIB_TOKEN_ROWS.map(([name, field, roleKey]) => {
    const hex = t[field] != null ? t[field] : state.colors[field];
    const r = roleKey ? roles[roleKey] : null;
    const job = r ? r.job : (AIB_DERIVED_JOB[field] || '');
    return [`\`${name}\``, hex, roleKey ? r.label : 'Derived', job];
  });
  Object.keys(extras).forEach(name => {
    const v = String(extras[name]).trim();
    if (!AIB_HEX.test(v)) return;
    tokenRows.push([`\`${name}\``, v, 'Aesthetic', 'Aesthetic-specific color used by the Materials below']);
  });
  push(aibTable(['Token', 'Hex', 'Role', 'Job'], tokenRows), '');
  push(`Canvas is derived from ${t.isDark ? 'Neutral dark' : 'Neutral light'}${def.canvas ? ` and then adjusted by the ${def.name} aesthetic` : ''}. Use \`--canvas\`, not the raw neutral, for page and panel backgrounds.`, '');

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
    '1. Exactly one primary-filled action (the main call to action) per view.',
    '2. Secondary never fills the main call to action and never sets body text.',
    `3. Accent covers ${cov('accent')} of any view and is never used on buttons, body text or borders.`,
    '4. Text is set only in `--ink`, `--muted` or the matching `--on-*` token on its fill. The one exception is the single accent highlight word, and only where the highlight treatment below says so.',
    `5. Color budget per view: canvas ${cov('canvas')}, ink ${cov('ink')}, primary ${cov('primary')}, secondary ${cov('secondary')}, accent ${cov('accent')}. Stay inside it.`,
    '6. No other colors, tints or gradients. Hover and pressed states use only the tokens above (for example `--pri-tint`, `--sec-tint`) or the shadows and overlays listed under Materials.',
    contrastRatio(t.primary, t.canvas) < 3
      ? '7. Focus ring is `--primary` (3px) with an outer 1px `--ink` ring, because `--primary` alone is under 3:1 on this canvas.'
      : '7. Focus ring is always `--primary`.');
  if (t.accentLow) {
    push('8. The accent has low contrast on this canvas (' + aibRatio(t.accent, t.canvas) + '), so it must NOT be used as a text color. Show the highlight word as a highlighter band: background `' + t.accent + '` (`--accent`) behind the word, text in `' + t.onAccent + '` (`--on-accent`).');
  } else if (AIB_BAND_HL.includes(def.key)) {
    push('8. In this aesthetic the highlight word is a highlighter band: background `' + t.accent + '` (`--accent`) behind the word, text in `' + t.onAccent + '` (`--on-accent`). Never set accent-colored text.');
  } else {
    push('8. The highlight word may be set in `' + t.accent + '` (`--accent`), which has ' + aibRatio(t.accent, t.canvas) + ' on the canvas. Use it once per view.');
  }
  push('');

  /* 6. Component color map */
  push('## Component color map', '',
    'Which token goes where. Shadows, blur and borders beyond these tokens come from Materials.', '',
    aibTable(['Element', 'Background', 'Text', 'Border / edge'], aibComponentRows(t, def)), '');

  /* 7. Contrast */
  const pairs = [
    ['--ink on --canvas', t.ink, t.canvas, 'Body and headlines'],
    ['--muted on --canvas', t.muted, t.canvas, 'Captions and secondary text'],
    ['--on-primary on --primary', t.onPrimary, t.primary, 'Primary button label'],
    ['--on-secondary on --secondary', t.onSecondary, t.secondary, 'Chip and tag label'],
    ['--on-accent on --accent', t.onAccent, t.accent, 'Badge label, highlight band'],
    ['--accent on --canvas', t.accent, t.canvas, t.accentLow ? 'Do not use as text; graphic fills only' : 'Highlight word and graphics'],
    ['--primary on --canvas', t.primary, t.canvas, contrastRatio(t.primary, t.canvas) >= 3 ? 'Focus ring, graphics, large elements' : 'Graphics only; keep the label in --on-primary'],
  ];
  push('## Contrast pairs', '',
    aibTable(['Pair', 'Foreground', 'Background', 'Ratio', 'Grade', 'Use'],
      pairs.map(([n, fg, bg, use]) => [n, fg, bg, aibRatio(fg, bg), aibGrade(contrastRatio(fg, bg)), use])), '',
    'AAA is 7:1, AA is 4.5:1 for body text, "AA large text only" is 3:1 for text of 24px or 19px bold and up.', '');

  /* 8. Typography */
  const fontUrl = aibFontUrl([state.headingFont, state.bodyFont]);
  push('## Typography', '',
    `- Heading font: ${state.headingFont.name} (${state.headingFont.category}); CSS: \`${state.headingFont.css}\``,
    `- Body font: ${state.bodyFont.name} (${state.bodyFont.category}); CSS: \`${state.bodyFont.css}\``,
    `- Google Fonts: ${fontUrl}`,
    `- Headings: ${ty.headingSize}px, weight ${ty.headingWeight}, letter-spacing ${ty.headingTracking}px, text-transform ${ty.headingCase}`,
    `- Body: ${ty.bodySize}px, weight ${ty.bodyWeight}, letter-spacing ${ty.bodyTracking}px, text-transform ${ty.bodyCase}`);
  const notes = def.typeNotes;
  (Array.isArray(notes) ? notes : notes ? [notes] : []).forEach(n => push(`- ${n}`));
  push(`- Shape: ${state.shapePreset.name}, radius ${state.shapePreset.radius}, large radius ${state.shapePreset.radiusLg}`, '');

  /* 9. Materials */
  const unresolved = [];
  push(`## Materials (${def.labels && def.labels.material ? def.labels.material : def.name})`, '',
    'Surface recipes for this aesthetic with real values filled in. Apply them as written.', '');
  (def.materials || []).forEach(m => {
    push(`- **${m.name}**: ${aibResolveMaterial(m.css, t, extras, unresolved)}`);
  });
  if (!(def.materials || []).length) push('- None defined. Use flat fills from the tokens above.');
  if (unresolved.length) console.warn(`buildAiBrief: unresolved material placeholders for ${def.key}: ${unresolved.join(', ')}`);
  push('');

  /* 10. Do / Don't */
  const rules = def.rules || {};
  push('## Do', '', ...(rules.do || []).map(x => `- ${x}`), '');
  push("## Don't", '', ...(rules.dont || []).map(x => `- ${x}`), '');

  /* 11. CSS variables */
  const derived = AIB_TOKEN_ROWS
    .filter(([name]) => !['--primary', '--secondary', '--accent', '--neutral-dark', '--neutral-light', '--on-primary', '--on-accent'].includes(name))
    .map(([name, field]) => `  ${name}: ${t[field]};`);
  const extraLines = Object.keys(extras).map(name => `  ${name}: ${String(extras[name]).replace(/\s*\n\s*/g, ' ').trim()};`);
  push('## CSS variables', '', '```css', brandCssText(state), '',
    `/* Derived tokens for the ${mode}-mode ${def.name} aesthetic. Computed, do not edit. */`,
    ':root {', ...derived, '}');
  if (extraLines.length) push('', `/* ${def.name} material variables, referenced by the Materials above. */`, ':root {', ...extraLines, '}');
  push('```', '');

  return out.join('\n');
}
