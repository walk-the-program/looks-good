/* 36 Dystopian Luxury — severe, clinical, exclusive. Balenciaga's web redesign, Margiela blank labels and museum accession numbers: surgical white, ink black, one blood-red accent.
   STUB (P5 scaffold): header metadata, deck copy and placeholder art only. The builder
   replaces art(), adds tokens()/roles/materials/rules and fills css/aesthetics/dystopian-luxury.css.
   Direction: docs/aesthetics-round5.md and docs/research/round5-*.md. */
registerAesthetic({
  key: 'dystopian-luxury', order: 36,
  name: 'Dystopian Luxury',
  descriptor: 'Severe · Clinical · Exclusive',
  influences: 'Balenciaga web / Maison Margiela labels / Museum accession',
  summary: 'Severity through removal: a tiny logo, vast white space, enormous cropped type and blank labels.',
  motto: 'Access is a privilege.',
  kicker: 'Restricted viewing',
  mode: 'light',
  slideShape: 'minimal',
  labels: { material: 'Accession', states: ['Catalogued', 'Restricted', 'Classified'], statesKind: 'button' },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    principles: [
      ['Severity by removal', 'A tiny logo and vast white space say it all.'],
      ['Enormous, severely cropped type', 'Headlines bleed off the edge; labels stay small.'],
      ['Label everything clinically', 'Accession numbers and blank tags classify each object.'],
    ],
    do: [
      'Crop display type hard against the edge.',
      'Number items year.sequence.part.',
      'Keep blood red under two percent.',
    ],
    dont: [
      'Add gradients, glows or glass.',
      'Use gothic tropes like chains or skulls.',
      'Set tiny low-contrast type.',
    ],
  },

  // Placeholder art: replace with the signature artwork.
  art(ctx) {
    const t = ctx.t;
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="presentation"><rect x="0" y="0" width="100" height="100" fill="${t.canvas}"/><text x="-4" y="78" font-size="92" font-weight="800" fill="${t.ink}" font-family="inherit">A</text><circle cx="86" cy="14" r="6" fill="none" stroke="${t.ink}" stroke-width="0.8"/><rect x="84" y="86" width="10" height="2" fill="#a1111a"/></svg>`;
  },

  materials: [],
  rules: { do: [], dont: [] },
});
