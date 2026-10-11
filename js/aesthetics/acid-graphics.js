/* 30 Acid Graphics — toxic, warped, loud. AIGA Eye on Design on acid graphics and rave culture: vibrating pairs, warped letterforms and op-art over a gridded order.
   STUB (P5 scaffold): header metadata, deck copy and placeholder art only. The builder
   replaces art(), adds tokens()/roles/materials/rules and fills css/aesthetics/acid-graphics.css.
   Direction: docs/aesthetics-round5.md and docs/research/round5-*.md. */
registerAesthetic({
  key: 'acid-graphics', order: 30,
  name: 'Acid Graphics',
  descriptor: 'Toxic · Warped · Loud',
  influences: 'Rave flyers / Op-art / Warped type',
  summary: 'Vibrating colour pairs, stretched type and dense information over a hidden calm grid.',
  motto: 'Turn it up until it hums.',
  kicker: 'Doors at midnight',
  mode: 'dark',
  slideShape: 'minimal',
  labels: { material: 'Signal', states: ['Idle', 'Strobe', 'Melt'], statesKind: 'button' },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    principles: [
      ['Colour that vibrates', 'Two near-equal-luminance hues meet edge to edge.'],
      ['Warp with a reason', 'Stretch the headline; keep the information layer clean.'],
      ['Order underneath the noise', 'A hidden calm grid holds the dense layout together.'],
    ],
    do: [
      'Pair the primary with a computed clash colour.',
      'Stretch or skew only the headline.',
      'Keep dates, tabs and strips scannable.',
    ],
    dont: [
      'Put thin type on a vibrating edge.',
      'Warp everything equally.',
      'Lean on chrome beyond one word.',
    ],
  },

  // Placeholder art: replace with the signature artwork.
  art(ctx) {
    const t = ctx.t;
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="presentation"><g fill="${t.primary}"><rect x="0" y="0" width="50" height="100"/></g><g fill="${t.accent}"><rect x="50" y="0" width="50" height="100"/></g><g fill="none" stroke="${t.ink}" stroke-width="2"><circle cx="50" cy="50" r="12"/><circle cx="50" cy="50" r="22"/><circle cx="50" cy="50" r="32"/></g></svg>`;
  },

  materials: [],
  rules: { do: [], dont: [] },
});
