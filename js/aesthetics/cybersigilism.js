/* 31 Cybersigilism — thorned, silver, cold. Aingelblood-style cybersigilism linework: tapered mirrored thorns, silver on black, icy glow, with a clear zone round all text.
   STUB (P5 scaffold): header metadata, deck copy and placeholder art only. The builder
   replaces art(), adds tokens()/roles/materials/rules and fills css/aesthetics/cybersigilism.css.
   Direction: docs/aesthetics-round5.md and docs/research/round5-*.md. */
registerAesthetic({
  key: 'cybersigilism', order: 31,
  name: 'Cybersigilism',
  descriptor: 'Thorned · Silver · Cold',
  influences: 'Cybersigilism tattoos / Blackwork / Cyber goth',
  summary: 'Hairline silver thorns branch and mirror around calm text; the brand colour is only cold light.',
  motto: 'Sharp lines, kept apart.',
  kicker: 'Etched in silver',
  mode: 'dark',
  slideShape: 'minimal',
  labels: { material: 'Sigils', states: ['Etched', 'Lit', 'Bound'], statesKind: 'swatch' },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    principles: [
      ['Hairline thorns, mirrored', 'Tapered branches build a symmetric, architectural frame.'],
      ['Silver is fixed', 'Client colour appears only as cold light and glow.'],
      ['Ornament keeps its distance', 'A clear zone separates every line from text.'],
    ],
    do: [
      'Draw thorns as tapered filled shapes.',
      'Keep decorative lines between 0.75 and 1.25px.',
      'Frame content with corner-bracket thorns.',
    ],
    dont: [
      'Run ornament through or behind text.',
      'Use thick tribal-flash strokes.',
      'Flood the page with neon purple and cyan.',
    ],
  },

  // Placeholder art: replace with the signature artwork.
  art(ctx) {
    const t = ctx.t;
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="presentation"><g fill="none" stroke="${t.ink}" stroke-width="0.8"><path d="M50 8 V92"/><path d="M50 30 Q34 26 22 10"/><path d="M50 30 Q66 26 78 10"/><path d="M50 56 Q30 52 14 34"/><path d="M50 56 Q70 52 86 34"/></g><circle cx="50" cy="50" r="2" fill="${t.primary}"/></svg>`;
  },

  materials: [],
  rules: { do: [], dont: [] },
});
