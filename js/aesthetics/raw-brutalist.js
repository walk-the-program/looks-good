/* 02 Raw Brutalist — exposed, severe, honest: the web with the stylesheet half-written.
   Zero radius, plain 2px black borders and no shadows (so it stays apart from Neo-Brutal
   Pop), pure white ground, monospace UI, underlined blue links,
   bracketed labels, controls that invert on hover and press, color only where a role says so.
   Reference: brutalistwebsites.com. Poster hero (an enormous uppercase headline bleeding off
   the right edge, the spec table parked bottom right), palette as full-width strips, the real
   CTA shown at rest / hover / pressed. */
// Arimo draws the decorative index numeral (not brand type); the headline and body follow the brand faces.
function rbFonts() {
  if (typeof window === 'undefined' || !window.loadFontFamily || typeof FONTS === 'undefined') return;
  ['Arimo'].forEach(n => {
    const f = FONTS.find(x => x.name === n);
    if (f) window.loadFontFamily(f);
  });
}

const RB_KEY = 'raw-brutalist';   // abCopy key for the plain functions below (js/aesthetics/registry.js)

registerAesthetic({
  key: 'raw-brutalist', order: 2,
  name: 'Raw Brutalist',
  descriptor: 'Exposed · Severe · Honest',
  influences: 'Swiss print / Brutalist web / Terminal',
  summary: 'The web with the stylesheet half written: white ground, black borders, blue underlined links and controls that invert when you touch them.',
  motto: 'Nothing hidden. Nothing soft.',   // = copy.motto.text
  kicker: 'Index of hard surfaces',          // = copy.kicker.text
  mode: 'light',
  slideShape: 'geometric',
  labels: { material: 'Hard surfaces', states: ['Rest', 'Hover', 'Pressed'], statesKind: 'button' },
  // Editable specimen copy (Brand > Advanced > Specimen copy).
  copy: {
    motto: { label: 'Motto', text: 'Nothing hidden. Nothing soft.', warm: 'Nothing hidden. Everything clear.' },
    kicker: { label: 'Kicker above the headline', text: 'Index of hard surfaces', warm: 'Index of sturdy surfaces' },
    state0: { label: 'State 1 name', text: 'Rest' },
    state1: { label: 'State 2 name', text: 'Hover' },
    state2: { label: 'State 3 name', text: 'Pressed' },
    specSubject: { label: 'Spec sheet row 1 label', text: 'SUBJECT' },
    specSystem: { label: 'Spec sheet row 2 label', text: 'SYSTEM' },
    specSystemVal: { label: 'Spec sheet row 2 value', text: '5 COLORS / 2 FACES' },
    specSurface: { label: 'Spec sheet row 3 label', text: 'SURFACE' },
    specDark: { label: 'Spec sheet surface value (dark)', text: 'DARK' },
    specLight: { label: 'Spec sheet surface value (light)', text: 'LIGHT' },
    specFig: { label: 'Spec sheet row 4 label', text: 'FIG.' },
    specFigVal: { label: 'Spec sheet row 4 value', text: '01' },
  },
  layout: { hero: 'poster', palette: 'strips' },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    materialStage: 'pattern',
    principles: [
      ['Hard edges, thick borders', 'Zero radius and 2px ink borders on every control.'],
      ['Flat blocks that invert', 'No shadows: a control turns black on hover and flips back on press.'],
      ['Mono, uppercase, numbered like [01]', 'Every label, tab and button is set in monospace caps.'],
    ],
    do: [
      'Use zero radius and 2px ink borders.',
      'Number everything like [01] and bracket links.',
      'Keep the page white and monochrome.',
    ],
    dont: [
      'Round a corner or cast a shadow.',
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
  // The ground is plain white (near-black in dark mode): a hard black rule on white is the look.
  canvas(b) {
    return b.isDark ? '#0a0a0a' : '#ffffff';
  },

  tokens(t) {
    rbFonts();
    // muted text also sits on the settings danger box (a 4% red tint): hold 4.6:1 there
    const tint = t.mix(t.isDark ? '#ff7b72' : '#c62f2f', t.canvas, 0.08);
    let muted = t.muted;
    for (let k = 0.05; k <= 1.001 && Math.min(t.contrast(muted, tint), t.contrast(muted, t.canvas)) < 4.6; k += 0.05) muted = t.mix(t.ink, t.muted, k);
    return {
      '--ab-muted': muted,
      '--ab-link': t.isDark ? '#8DB4FF' : '#0000EE',
      '--ab-type-pick-w': 400,
       '--ab-grid': t.alpha(t.ink, t.isDark ? 0.1 : 0.06) };
  },

  // A mono spec index (exposed metadata) at the top right of the hero: four
  // key / value rows, ruled like a data sheet.
  art(ctx) {
    rbFonts();
    const subject = String(ctx.brandName || '').toUpperCase().slice(0, 24);
    const c = k => abCopy(RB_KEY, k);
    const rows = [[c('specSubject'), escapeHtml(subject)], [c('specSystem'), c('specSystemVal')], [c('specSurface'), ctx.t.isDark ? c('specDark') : c('specLight')], [c('specFig'), c('specFigVal')]];
    return `<dl class="rba-spec">${rows.map(([k, v]) => `<div class="rba-row"><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
  },

  materials: [
    { name: 'Hard surface', css: 'background: {canvas}; border: 2px solid {ink}; border-radius: 0; box-shadow: none; /* plain box, no shadow */' },
    { name: 'Inverted state', css: 'background: {ink}; color: {canvas}; /* hover on a control; pressed flips back to {canvas} on {ink} */' },
    { name: 'Primary action block', css: 'background: {primary}; color: {onPrimary}; border: 2px solid {ink}; border-radius: 0; box-shadow: none; font: 600 13px ui-monospace, "SF Mono", Menlo, monospace; text-transform: uppercase; /* label in [brackets]; hover: background {ink}, color {canvas}; pressed: background {canvas}, color {ink}, translate(1px, 1px) */' },
    { name: 'Link', css: 'color: #0000EE; text-decoration: underline; /* the default blue, underlined, in [brackets] where it is an action */' },
    { name: 'Palette strips', css: 'one full-width row, border: 2px solid {ink}; each color is a flat band sized by its coverage, the label inside it; strips are separated by 2px {ink} rules.' },
    { name: 'Selected segment', css: 'background: {ink}; color: {canvas}; /* joined boxes share 2px {ink} borders */' },
    { name: 'Field', css: 'background: {canvas}; border: 2px solid {ink}; border-radius: 0; font: 15px ui-monospace, "SF Mono", Menlo, monospace; caret-color: {ink};' },
    { name: 'Highlighter band', css: 'background: {accent}; color: {onAccent}; padding: 0 .06em; /* behind one headline word, never colored text; may run off the board edge */' },
  ],

  rules: {
    do: [
      'Use zero radius and 2px ink borders on every control and panel.',
      'Use no shadows: a control inverts (black block, white text) on hover and flips back on press.',
      'Set every label, tab, button and table cell in monospace, uppercase, numbered like [01], with plain arrows; set links in default blue, underlined; the recommended pairing is Arial-style (Arimo) headlines over Times-style (Tinos) body copy.',
      'Keep the page white and monochrome: color appears only where a color role says so.',
    ],
    dont: [
      'Round any corner, cast any shadow (that is Neo-Brutal Pop) or add a gradient.',
      'Set the accent as text color; it is only ever the highlighter band behind a word.',
      'Soften the headline: it stays enormous, uppercase and tight, and may be cropped by the board edge.',
      'Spend primary on anything but the single main action and active states.',
    ],
  },
});
