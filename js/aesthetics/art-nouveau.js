/* 42 Art Nouveau — Whiplash, Botanical, Framed. Lithograph posters circa 1900: arched frames, halo discs, stems that end in curls and buds.
   STUB (P6 scaffold): header metadata, deck copy and placeholder art only. The builder
   replaces art(), adds tokens()/roles/materials/rules and fills css/aesthetics/art-nouveau.css.
   Direction: docs/research/round6.md (section for this aesthetic). */
registerAesthetic({
  key: 'art-nouveau', order: 42,
  name: 'Art Nouveau',
  descriptor: 'Whiplash · Botanical · Framed',
  influences: 'Mucha-era lithographs / Whiplash curves / Japonisme',
  summary: 'Lithograph posters circa 1900: arched frames, halo discs, stems that end in curls and buds.',
  motto: 'Every line grows like a stem.',
  kicker: 'Salon, 1900',
  mode: 'light',
  slideShape: 'classic',
  labels: { material: 'Frames', states: ['Bare', 'Framed', 'Haloed'], statesKind: 'swatch' },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    principles: [
      ['Every line grows like a stem', 'Stems end in curls, buds and spirals.'],
      ['Frame it, then let it flow', 'Content sits in an arch; ornament curves around it.'],
      ['Muted lithograph colour', 'Flat, soft hues with a dark contour line.'],
    ],
    do: [
      'End every flourish in a curl, bud or spiral.',
      'Put the headline in a cartouche, art in a halo.',
      'Use thin gold only for halo rings.',
    ],
    dont: [
      'Use stepped geometric frames; that\'s Neo Deco.',
      'Add figures or Mucha portrait pastiche.',
      'Let ornament touch body text.',
    ],
  },

  // Placeholder art: replace with the signature artwork.
  art(ctx) {
    const t = ctx.t;
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="presentation"><circle cx="50" cy="44" r="26" fill="none" stroke="${t.accent}" stroke-width="1.6"/><path d="M26 90V44a24 24 0 0 1 48 0v46" fill="none" stroke="${t.ink}" stroke-width="2.4"/><path d="M50 88c0-14-8-18-8-28s8-12 8-12" fill="none" stroke="${t.primary}" stroke-width="2.4" stroke-linecap="round"/><circle cx="50" cy="40" r="6" fill="${t.secondary}"/></svg>`;
  },

  materials: [],
  rules: { do: [], dont: [] },
});
