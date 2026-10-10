/* 08 Bauhaus Poster — constructive, flat, rhythmic. No shadows, no gradients,
   no blur anywhere: geometry only (circles, half and quarter circles,
   squares), flat fills with no outlines on art shapes, 2px ink borders on UI
   controls that are either square or fully round. Reference: Bauhaus exhibition
   posters. Poster hero (a huge tight lowercase headline after Bayer's universal
   alphabet, vertical kicker), the art is a 3x3 pattern tile, palette as geometric
   swatches (square, circle, quarter circle, semicircle). Secondary and accent may be
   large planes in the art only; the UI keeps the universal role rules. */
registerAesthetic({
  key: 'bauhaus-poster', order: 8,
  name: 'Bauhaus Poster',
  descriptor: 'Constructive · Flat · Rhythmic',
  influences: 'Bauhaus 1923 / Constructivism / Swiss poster',
  summary: 'Flat geometry, hard ink lines and loud type, composed like a poster.',
  motto: 'Form follows rhythm.',
  kicker: 'Constructed',
  mode: 'light',
  slideShape: 'minimal',
  labels: { material: 'Form', states: ['Rest', 'Hover', 'Pressed'], statesKind: 'button' },
  layout: { hero: 'poster', palette: 'swatches' },
  type: { ui: 'sans', label: 'sans', display: 1.4 },
  highlight: 'custom',
  highlightNote: 'The highlight word sits on a flat accent plane covering its lower half; no outline, no full band.',

  // --ab-tr scales the tight headline tracking: 0 for condensed/heavy faces (they collide when tightened), 1 otherwise
  tokens() {
    return { '--ab-type-pick-w': 600, '--ab-tr': (typeof state !== 'undefined' && state.headingFont && { condensed: 0, heavy: 0, wide: 0.4, techno: 0.4 }[state.headingFont.cls]) ?? 1 };
  },

  roles: {
    primary: {
      use: 'The one flat CTA block, the selected segment, the "on" switch, and the largest planes of the art tile',
      never: 'Body text, borders, a second CTA',
    },
    secondary: {
      use: 'Large planes inside the art tile only (quarter circles and backgrounds), where it may well exceed its 10–15%; in the UI, only small tags and status chips',
      never: 'The main CTA, body text, page background, large planes in the interface',
      coverage: '≈10–15%',
    },
    accent: {
      use: 'Large planes inside the art tile only (half circles, backgrounds), where it may exceed its 5%; in the UI, one spark: the highlighted headline word (a flat plane under its lower half, no outline, no full band) and the footer dot',
      never: 'Buttons, body text, borders, large fills in the interface',
      coverage: '≤5%',
    },
  },

  // The classic Bauhaus pattern tile: a 3x3 grid of 30-unit cells, each a flat
  // quarter circle, semicircle, circle or plane in primary / secondary / accent /
  // ink, rotated 0/90/180/270. Flat fills only: no strokes, shadows or blend modes.
  art(ctx) {
    const t = ctx.t;
    const P = t.primary, S = t.secondary, A = t.accent, I = t.ink;
    const shapes = {
      quarter: 'M0 0 H30 A30 30 0 0 1 0 30 Z',
      semi: 'M0 30 A15 15 0 0 1 30 30 Z',
      circle: 'M15 0 A15 15 0 1 1 15 30 A15 15 0 1 1 15 0 Z',
      square: 'M7 7 H23 V23 H7 Z',
    };
    // [background or null, shape, fill, rotation]
    const cells = [
      [S, 'quarter', A, 0], [null, 'circle', P, 0], [I, 'semi', S, 90],
      [null, 'semi', I, 180], [P, 'quarter', I, 270], [A, 'circle', S, 0],
      [I, 'quarter', P, 90], [S, 'semi', A, 0], [null, 'quarter', S, 180],
    ];
    const out = cells.map((c, i) => {
      const x = (i % 3) * 30;
      const y = Math.floor(i / 3) * 30;
      return `<g transform="translate(${x} ${y})">${c[0] ? `<rect width="30" height="30" fill="${c[0]}"/>` : ''}`
        + `<path d="${shapes[c[1]]}" fill="${c[2]}" transform="rotate(${c[3]} 15 15)"/></g>`;
    }).join('');
    return `<svg viewBox="0 0 90 90" width="100%" height="100%" focusable="false" shape-rendering="geometricPrecision">${out}</svg>`;
  },

  materials: [
    { name: 'Flat form (art)', css: 'background: {primary}; border: 0; border-radius: 0; box-shadow: none; /* art shapes are flat fills with no outlines; or a quarter circle, semicircle or circle in primary, secondary, accent or ink on a flat square plane */' },
    { name: 'Control (UI)', css: 'background: {canvas}; border: 2px solid {ink}; border-radius: 0; color: {ink}; /* or border-radius: 999px; never in between */' },
    { name: 'Primary action', css: 'background: {primary}; color: {onPrimary}; border: 2px solid {ink}; border-radius: 0; /* ends in an ink circle holding the arrow: background {ink}; color {canvas}; border-radius: 50%. Hover: background {ink}, color {canvas}; pressed: background {canvas}, color {ink}, translate(2px, 2px) */' },
    { name: 'Highlight plane', css: 'background: linear-gradient(to top, {accent} 0 46%, transparent 46%); color: {ink}; border: 0; padding: 0 .04em; /* a flat accent plane (a hard stop, not a gradient) behind the lower half of one headline word; ink text; no outline, no full band */' },
    { name: 'Palette shapes', css: 'one geometric form per role in a 1:1 box, max 96px, flat fill, no shadow: canvas = square with a 2px {ink} border, ink = circle, primary = circle, secondary = quarter circle (border-radius: 100% 0 0 0), accent = semicircle (half height, bottom aligned).' },
    { name: 'Selected segment', css: 'background: {primary}; color: {onPrimary}; border: 2px solid {ink}; border-radius: 0; /* unselected: background {canvas}; color {ink} */' },
    { name: 'Field', css: 'background: transparent; border: 0; border-bottom: 3px solid {ink}; border-radius: 0; text-transform: uppercase; font-weight: 700;' },
    { name: 'Switch', css: 'track: 2px solid {ink}, border-radius 0, background {canvas} (off) or {primary} (on); knob: circle, background {ink}.' },
  ],

  rules: {
    do: [
      'Build art from circles, half and quarter circles and squares, tiled on a grid and rotated in 90° steps; flat fills only, with no outlines on art shapes.',
      'Make every control either square (radius 0) or fully round; nothing in between.',
      'Draw every UI control and panel with a 2px ink border and set headlines in huge, tight lowercase (card titles and list names stay uppercase).',
      'Let secondary and accent run as large flat planes in the poster art, and keep them small in the interface.',
    ],
    dont: [
      'Use shadows, gradients, blur, glow or blend modes anywhere; depth comes from overlap only.',
      'Round corners to 4, 8 or 12px; pick square or fully round.',
      'Fill panels, cards or buttons with secondary or accent.',
      'Place text over the colored art planes without an ink or canvas ground.',
    ],
  },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    principles: [
      ['Flat geometry, hard ink lines', 'Circles, squares and quarter circles tiled on a grid.'],
      ['Square or fully round', 'Nothing in between, and a 2px ink border on every control.'],
      ['Loud, tight lowercase headlines', 'Secondary and accent run as flat planes in the art.'],
    ],
    do: [
      'Build art from circles, squares and quarter circles.',
      'Make every control square or fully round.',
      'Draw every control with a 2px ink border.',
    ],
    dont: [
      'Use shadows, gradients or blur.',
      'Round corners to 4, 8 or 12px.',
      'Fill panels with secondary or accent.',
    ],
  },
});
