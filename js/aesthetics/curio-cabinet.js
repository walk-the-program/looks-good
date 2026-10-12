/* 48 Curio Cabinet — Collected, Labelled, Precious. Small objects in unequal recessed compartments on dark baize, each numbered with a typed paper label.
   STUB (P6 scaffold): header metadata, deck copy and placeholder art only. The builder
   replaces art(), adds tokens()/roles/materials/rules and fills css/aesthetics/curio-cabinet.css.
   Direction: docs/research/round6.md (section for this aesthetic). */
registerAesthetic({
  key: 'curio-cabinet', order: 48,
  name: 'Curio Cabinet',
  descriptor: 'Collected · Labelled · Precious',
  influences: 'Wunderkammer / Specimen drawers / Museum labels',
  summary: 'Small objects in unequal recessed compartments on dark baize, each numbered with a typed paper label.',
  motto: 'The brand shows what it keeps.',
  kicker: 'Case 12, drawer 3',
  mode: 'dark',
  slideShape: 'classic',
  labels: { material: 'Specimens', states: ['Found', 'Pinned', 'Treasured'], statesKind: 'swatch' },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    principles: [
      ['Collected, numbered, labelled', 'Every object has a number and a typed tag.'],
      ['Every object earns a tag', 'Nothing sits in the cabinet unlabelled.'],
      ['Warm lamp over dark baize', 'Soft top-left light and contact shadows.'],
    ],
    do: [
      'Arrange 5 to 12 objects in unequal recessed compartments.',
      'Number every object and give it a typed label.',
      'Light from top-left with soft contact shadows.',
    ],
    dont: [
      'Add taxidermy, insects or dead animals.',
      'Fill every compartment; leave some empty.',
      'Use clinical white; that\'s Dystopian Luxury.',
    ],
  },

  // Placeholder art: replace with the signature artwork.
  art(ctx) {
    const t = ctx.t;
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="presentation"><rect x="8" y="12" width="84" height="76" fill="${t.ink}" fill-opacity=".9"/><g fill="${t.canvas}" fill-opacity=".14"><rect x="12" y="16" width="36" height="34"/><rect x="52" y="16" width="36" height="20"/><rect x="52" y="40" width="36" height="44"/><rect x="12" y="54" width="36" height="30"/></g><circle cx="30" cy="33" r="9" fill="${t.primary}"/><path d="M60 70l10-24 10 24z" fill="${t.accent}"/><rect x="16" y="72" width="24" height="7" fill="${t.canvas}"/></svg>`;
  },

  materials: [],
  rules: { do: [], dont: [] },
});
