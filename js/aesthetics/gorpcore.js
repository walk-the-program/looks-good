/* 44 Gorpcore — Technical, Outdoor, Rugged. Stone ground, contour maps, hang tags with spec tables and one blaze-orange zip pull.
   STUB (P6 scaffold): header metadata, deck copy and placeholder art only. The builder
   replaces art(), adds tokens()/roles/materials/rules and fills css/aesthetics/gorpcore.css.
   Direction: docs/research/round6.md (section for this aesthetic). */
registerAesthetic({
  key: 'gorpcore', order: 44,
  name: 'Gorpcore',
  descriptor: 'Technical · Outdoor · Rugged',
  influences: 'Outdoor gear / Topographic maps / Spec sheets',
  summary: 'Stone ground, contour maps, hang tags with spec tables and one blaze-orange zip pull.',
  motto: 'The gear spec is the story.',
  kicker: 'Field tested',
  mode: 'light',
  slideShape: 'minimal',
  labels: { material: 'Fabric', states: ['Ripstop', 'Taped', 'Reflective'], statesKind: 'swatch' },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    principles: [
      ['Gear specs are the story', 'Spec tables carry the product, not slogans.'],
      ['Map lines, not decoration', 'Contours and grids do the ornamenting.'],
      ['One orange zip pull', 'A single blaze accent marks the one action.'],
    ],
    do: [
      'Hang a spec tag off every hero product.',
      'Make every fifth contour line heavier.',
      'Write numbers with units: grams, metres, degrees.',
    ],
    dont: [
      'Add camo, tents or campfire clip-art.',
      'Copy outdoor brand logos or skylines.',
      'Use hazard stripes; that\'s Industrial Hazard.',
    ],
  },

  // Placeholder art: replace with the signature artwork.
  art(ctx) {
    const t = ctx.t;
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="presentation"><g fill="none" stroke="${t.muted}" stroke-width="1.4"><path d="M8 70c18-30 40-34 58-18s20 20 28 12"/><path d="M18 78c16-22 34-24 48-12s22 16 28 10"/><path d="M28 86c14-14 26-14 36-6s18 10 28 6"/></g><rect x="56" y="14" width="28" height="36" rx="3" fill="${t.primary}"/><circle cx="70" cy="22" r="3" fill="${t.canvas}"/><path d="M62 32h16M62 38h16M62 44h10" stroke="${t.canvas}" stroke-width="1.6"/></svg>`;
  },

  materials: [],
  rules: { do: [], dont: [] },
});
