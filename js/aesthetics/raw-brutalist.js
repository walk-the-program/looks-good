/* 02 Raw Brutalist — exposed, severe, honest. Zero radius, 2px ink borders,
   hard offset shadows, monospace UI, color only where a role says so.
   Reference: brutalistwebsites.com / Swiss editorial brutalism. Poster hero
   (an enormous uppercase headline bleeding off the right edge), palette as
   full-width strips, the real CTA shown at rest / hover / pressed. */
registerAesthetic({
  key: 'raw-brutalist', order: 2,
  name: 'Raw Brutalist',
  descriptor: 'Exposed · Severe · Honest',
  influences: 'Swiss print / Brutalist web / Terminal',
  summary: 'Hard edges, thick borders and plain mechanics, with nothing hidden or softened.',
  motto: 'Nothing hidden. Nothing soft.',
  kicker: 'Index of hard surfaces',
  mode: 'light',
  slideShape: 'geometric',
  labels: { material: 'Hard surfaces', states: ['Rest', 'Hover', 'Pressed'], statesKind: 'button' },
  layout: { hero: 'poster', palette: 'strips' },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    materialStage: 'pattern',
    principles: [
      ['Hard edges, thick borders', 'Zero radius and 2px ink borders on every control.'],
      ['Hard shadow lifts, press flattens', 'A 6px offset shadow raises things; pressing removes it.'],
      ['Mono, uppercase, numbered like [01]', 'Every label, tab and button is set in monospace caps.'],
    ],
    do: [
      'Use zero radius and 2px ink borders.',
      'Number everything like [01].',
      'Keep the page monochrome.',
    ],
    dont: [
      'Round a corner or blur a shadow.',
      'Set the accent as text color.',
      'Soften the headline.',
    ],
  },
  type: { ui: 'mono', label: 'mono', display: 1.35 },
  highlight: 'band',

  roles: {
    primary: {
      use: 'The one flat CTA block per view and the "on" state of toggles',
      never: 'Body text, decoration, a second CTA',
    },
    secondary: {
      use: 'Tag strips and the status cells of tables',
      never: 'The main CTA, body text, page background',
    },
    accent: {
      use: 'A highlighter band behind one headline word (background only, ink text on it)',
      never: 'Colored text, buttons, borders, large fills',
    },
  },

  // --ab-tr scales the tight headline tracking: 0 for condensed/heavy faces (they collide when tightened), 1 otherwise
  tokens(t) {
    return {
      '--ab-type-pick-w': 400,
      '--ab-tr': (typeof state !== 'undefined' && state.headingFont && { condensed: 0, heavy: 0, wide: 0.4, techno: 0.4 }[state.headingFont.cls]) ?? 1,
       '--ab-grid': t.alpha(t.ink, t.isDark ? 0.1 : 0.06) };
  },

  // A mono spec index (exposed metadata) at the top right of the hero: four
  // key / value rows, ruled like a data sheet.
  art(ctx) {
    const subject = String(ctx.brandName || '').toUpperCase().slice(0, 24);
    const rows = [['SUBJECT', subject], ['SYSTEM', '5 COLORS / 2 FACES'], ['SURFACE', ctx.t.isDark ? 'DARK' : 'LIGHT'], ['FIG.', '01']];
    return `<dl class="rba-spec">${rows.map(([k, v]) => `<div class="rba-row"><dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd></div>`).join('')}</dl>`;
  },

  materials: [
    { name: 'Hard surface', css: 'background: {canvas}; border: 2px solid {ink}; border-radius: 0; box-shadow: 6px 6px 0 {ink};' },
    { name: 'Pressed state', css: 'transform: translate(6px, 6px); box-shadow: none;' },
    { name: 'Primary action block', css: 'background: {primary}; color: {onPrimary}; border: 2px solid {ink}; border-radius: 0; box-shadow: 6px 6px 0 {ink}; font: 600 13px ui-monospace, "SF Mono", Menlo, monospace; text-transform: uppercase; /* hover: translate(-2px, -2px) with 8px 8px 0 {ink}; pressed: translate(6px, 6px) with no shadow */' },
    { name: 'Palette strips', css: 'one full-width row, border: 2px solid {ink}; each color is a flat band sized by its coverage, the label inside it; strips are separated by 2px {ink} rules.' },
    { name: 'Selected segment', css: 'background: {ink}; color: {canvas}; /* joined boxes share 2px {ink} borders */' },
    { name: 'Field', css: 'background: {canvas}; border: 2px solid {ink}; border-radius: 0; font: 15px ui-monospace, "SF Mono", Menlo, monospace; caret-color: {ink};' },
    { name: 'Highlighter band', css: 'background: {accent}; color: {onAccent}; padding: 0 .06em; /* behind one headline word, never colored text; may run off the board edge */' },
  ],

  rules: {
    do: [
      'Use zero radius and 2px ink borders on every control and panel.',
      'Cast a hard offset shadow (6px 6px 0 ink) for raised things, and remove it entirely when pressed.',
      'Set every label, tab, button and table cell in monospace, uppercase, numbered like [01], with plain arrows.',
      'Keep the page monochrome: color appears only where a color role says so.',
    ],
    dont: [
      'Round any corner, blur any shadow or add a gradient.',
      'Set the accent as text color; it is only ever the highlighter band behind a word.',
      'Soften the headline: it stays enormous, uppercase and tight, and may be cropped by the board edge.',
      'Spend primary on anything but the single main action and active states.',
    ],
  },
});
