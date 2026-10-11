/* 35 Pirate Broadcast — intercepted, analog, rogue. Ceefax and ORACLE teletext, test cards and chyrons: a 40 by 24 grid, eight colours, page numbers, colour buttons, then a hijack.
   STUB (P5 scaffold): header metadata, deck copy and placeholder art only. The builder
   replaces art(), adds tokens()/roles/materials/rules and fills css/aesthetics/pirate-broadcast.css.
   Direction: docs/aesthetics-round5.md and docs/research/round5-*.md. */
registerAesthetic({
  key: 'pirate-broadcast', order: 35,
  name: 'Pirate Broadcast',
  descriptor: 'Intercepted · Analog · Rogue',
  influences: 'Teletext / Test cards / Pirate TV',
  summary: 'A rigid teletext frame with test-card parts, interrupted by an intruding rogue signal.',
  motto: 'Do not adjust your set.',
  kicker: 'Page 100',
  mode: 'dark',
  slideShape: 'minimal',
  labels: { material: 'Signal', states: ['Carrier', 'Tuned', 'Intrusion'], statesKind: 'button' },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    principles: [
      ['A rigid diagnostic frame', 'Forty columns, eight colours, three-digit page numbers.'],
      ['Every part has a job', 'Bars, gratings and codes do technical work.'],
      ['Then it gets intruded on', 'Chyrons, timecode and tuning meters interrupt the page.'],
    ],
    do: [
      'Set copy on a character grid.',
      'Use page numbers, colour buttons and timecode.',
      'Keep chroma split to one or two pixels.',
    ],
    dont: [
      'Add scanlines to a modern layout.',
      'Use Matrix green.',
      'Impersonate real stations or alerts.',
    ],
  },

  // Placeholder art: replace with the signature artwork.
  art(ctx) {
    const t = ctx.t;
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="presentation"><rect x="6" y="10" width="88" height="80" fill="${t.canvas}" stroke="${t.line}"/><g><rect x="10" y="14" width="12" height="20" fill="#fff"/><rect x="22" y="14" width="12" height="20" fill="#ff0"/><rect x="34" y="14" width="12" height="20" fill="#0ff"/><rect x="46" y="14" width="12" height="20" fill="#0f0"/><rect x="58" y="14" width="12" height="20" fill="#f0f"/><rect x="70" y="14" width="12" height="20" fill="#f00"/></g><rect x="10" y="60" width="50" height="10" fill="${t.primary}"/></svg>`;
  },

  materials: [],
  rules: { do: [], dont: [] },
});
