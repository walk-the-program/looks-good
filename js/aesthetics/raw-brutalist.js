/* 02 Raw Brutalist — exposed, severe, honest. Zero radius, 2px ink borders,
   FLAT: states are inversion and outline, never a lifted shadow (that is
   neo-brutal-pop's). Monospace UI with a default-HTML counter-voice (Times,
   #0000EE underlined links), color only where a role says so.
   References: brutalistwebsites.com, Yale School of Art, MSCHF, Are.na. Poster
   hero (an enormous uppercase headline bleeding off the right edge over a
   numbered 12-column grid), the spec index as a full-width table under it,
   palette as full-width strips, the real CTA shown at rest / hover / pressed.
   The deck's Material slide shows a wireframe of the board itself. */
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
    principles: [
      ['Hard edges, thick borders', 'Zero radius and 2px ink borders on every control.'],
      ['Flat: invert, never lift', 'Hover inverts to ink; pressed takes an inset outline.'],
      ['Mono, uppercase, numbered like [01]', 'Every label, tab and button is set in monospace caps.'],
    ],
    do: [
      'Use zero radius and 2px ink borders.',
      'Number everything like [01].',
      'Color only in the swatch strip and one band.',
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
      use: 'The palette strip only; the UI stays ink on canvas',
      never: 'Status chips, the main CTA, body text, page background',
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
       '--ab-grid': t.alpha(t.ink, t.isDark ? 0.1 : 0.06) };
  },

  // Exposed structure, all plain markup (no drawing):
  //  - .rba-ticks: the 12 grid columns numbered 01..12 (the board hero pins it
  //    along the top of the hero's column grid; hidden elsewhere),
  //  - .rba-spec: the spec index as a full-width four-column mono table
  //    (ID / ITEM / STATE / UPDATED) that sits under the headline,
  //  - .rba-wire: a wireframe of the board itself (ink boxes labelled with tag,
  //    class and size), shown only on the deck's Material slide.
  art(ctx) {
    const e = escapeHtml;
    const subject = String(ctx.brandName || '').toUpperCase().slice(0, 24);
    const day = new Date().toISOString().slice(0, 10);
    const ticks = Array.from({ length: 12 }, (_, i) => `<i>${String(i + 1).padStart(2, '0')}</i>`).join('');
    const rows = [
      ['001', subject, 'LIVE', day],
      ['002', '5 COLORS / 2 FACES', 'SET', day],
      ['003', `SURFACE ${ctx.t.isDark ? 'DARK' : 'LIGHT'}`, 'SET', day],
    ];
    const head = ['ID', 'ITEM', 'STATE', 'UPDATED'].map(h => `<span>${h}</span>`).join('');
    const body = rows.map(r => `<div class="rba-row">${r.map(c => `<span>${e(c)}</span>`).join('')}</div>`).join('');
    const box = (cls, tag, size) => `<div class="rba-box ${cls}"><b>${tag}</b><span>${size}</span></div>`;
    const wire = `<div class="rba-wire">
      ${box('rba-w-head', 'HEADER.head', '1280×56')}
      ${box('rba-w-hero', 'SECTION.hero', '1280×640')}
      ${box('rba-w-pal', 'DIV.palette', '5 STRIPS')}
      ${box('rba-w-type', 'SECTION.type', '3 COLS')}
      ${box('rba-w-ui', 'DIV.card', '[01]')}
      ${box('rba-w-panel', 'DIV.panel', '[02]')}
      ${box('rba-w-rows', 'UL.rows', '3')}
      ${box('rba-w-foot', 'FOOTER', '1280×40')}
    </div>`;
    return `<div class="rba"><div class="rba-ticks">${ticks}</div><div class="rba-spec"><div class="rba-row rba-th">${head}</div>${body}</div>${wire}</div>`;
  },

  materials: [
    { name: 'Hard surface', css: 'background: {canvas}; border: 2px solid {ink}; border-radius: 0; box-shadow: none;' },
    { name: 'Inverted state', css: 'background: {ink}; color: {canvas}; transform: none; /* hover: the whole control inverts; pressed: outline: 2px solid {ink}; outline-offset: -6px */' },
    { name: 'Primary action block', css: 'background: {primary}; color: {onPrimary}; border: 2px solid {ink}; border-radius: 0; box-shadow: none; font: 600 13px ui-monospace, "SF Mono", Menlo, monospace; text-transform: uppercase; /* hover: background {ink}, color {canvas}; pressed: inset 2px {ink} outline at -6px */' },
    { name: 'Default link', css: 'font: 16px/1.3 "Times New Roman", Times, serif; color: #0000EE; text-decoration: underline; /* visited #551A8B; fixed browser colours, never a brand role */' },
    { name: 'Palette strips', css: 'one full-width row, border: 2px solid {ink}; each color is a flat band sized by its coverage, the label inside it; strips are separated by 2px {ink} rules.' },
    { name: 'Selected segment', css: 'background: {ink}; color: {canvas}; /* joined boxes share 2px {ink} borders */' },
    { name: 'Field', css: 'background: {canvas}; border: 2px solid {ink}; border-radius: 0; font: 15px ui-monospace, "SF Mono", Menlo, monospace; caret-color: {ink};' },
    { name: 'Highlighter band', css: 'background: {accent}; color: {onAccent}; padding: 0 .06em; /* behind one headline word, never colored text; may run off the board edge */' },
  ],

  rules: {
    do: [
      'Use zero radius and 2px ink borders on every control and panel.',
      'Stay flat: hover inverts a control to ink, pressed adds an inset ink outline. Nothing lifts.',
      'Set every label, tab, button and table cell in monospace, uppercase, numbered like [01], with plain arrows.',
      'Let links speak default HTML: Times, #0000EE, underlined.',
      'Keep color to the palette strip and the one highlighter band; the UI stays ink on canvas.',
    ],
    dont: [
      'Round any corner, cast any shadow or add a gradient.',
      'Set the accent as text color; it is only ever the highlighter band behind a word.',
      'Soften the headline: it stays enormous, uppercase and tight, and may be cropped by the board edge.',
      'Spend primary on anything but the single main action and active states.',
    ],
  },
});
