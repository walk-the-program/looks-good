/* 33 Radical Memphis — laminate, clashing, springy. Memphis Group furniture and Bacterio laminate: saturated colours bound by black-and-white pattern, no outlines.
   STUB (P5 scaffold): header metadata, deck copy and placeholder art only. The builder
   replaces art(), adds tokens()/roles/materials/rules and fills css/aesthetics/radical-memphis.css.
   Direction: docs/aesthetics-round5.md and docs/research/round5-*.md. */
registerAesthetic({
  key: 'radical-memphis', order: 33,
  name: 'Radical Memphis',
  descriptor: 'Laminate · Clashing · Springy',
  influences: 'Memphis Group / Abet Laminati / Ettore Sottsass',
  summary: 'Stacked primitives on a diagonal stance, bound together by laminate patterns and clashing offset sheets.',
  motto: 'Furniture for the screen.',
  kicker: 'Showroom, 1981',
  mode: 'light',
  slideShape: 'soft',
  labels: { material: 'Laminates', states: ['Plain', 'Patterned', 'Stacked'], statesKind: 'swatch' },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    principles: [
      ['Pattern binds the colour', 'Laminate fills hold saturated hues together.'],
      ['Objects stand on a diagonal', 'Primitives stack and tilt like showroom furniture.'],
      ['Offset sheets, never outlines', 'A second hue sits behind each shape instead of ink.'],
    ],
    do: [
      'Fill surfaces with squiggle, terrazzo or checker.',
      'Stack simple primitives on a diagonal.',
      'Offset a second-hue sheet behind objects.',
    ],
    dont: [
      'Outline shapes in thick black ink.',
      'Scatter confetti without a system.',
      'Place text over busy pattern.',
    ],
  },

  // Placeholder art: replace with the signature artwork.
  art(ctx) {
    const t = ctx.t;
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="presentation"><rect x="12" y="52" width="40" height="36" fill="${t.primary}"/><circle cx="62" cy="38" r="22" fill="${t.secondary}"/><path d="M52 90 L82 40 L92 90 Z" fill="${t.accent}"/><g stroke="${t.ink}" stroke-width="1.5" fill="none"><path d="M16 60 q4 -5 8 0 t8 0 t8 0"/></g></svg>`;
  },

  materials: [],
  rules: { do: [], dont: [] },
});
