/* 28 Religious Futurism — sacred, luminous, monumental. Dune (2021) title design, Richter's Cologne window and rose-window geometry: gold line, black ground, saturated light.
   STUB (P5 scaffold): header metadata, deck copy and placeholder art only. The builder
   replaces art(), adds tokens()/roles/materials/rules and fills css/aesthetics/religious-futurism.css.
   Direction: docs/aesthetics-round5.md and docs/research/round5-*.md. */
registerAesthetic({
  key: 'religious-futurism', order: 28,
  name: 'Religious Futurism',
  descriptor: 'Sacred · Luminous · Monumental',
  influences: 'Dune (2021) / Cathedral stained glass / Richter\'s pixel windows',
  summary: 'A digital cathedral: obsidian ground, thin gold lines and the brand colours as stained-glass light.',
  motto: 'Let there be light.',
  kicker: 'Vespers',
  mode: 'dark',
  slideShape: 'classic',
  labels: { material: 'Relics', states: ['Dormant', 'Lit', 'Consecrated'], statesKind: 'swatch' },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    principles: [
      ['Gold is a rim, never fill', 'Gold appears only as thin rims, rules and rings.'],
      ['Brand colour is the light', 'Client colours glow as stained glass, never as paint.'],
      ['Slow, still, monumental', 'Few large forms, huge silence, tiny liturgical annotation.'],
    ],
    do: [
      'Use ogive arches, halos and mandorlas.',
      'Set small-caps serif with tiny annotations.',
      'Leave generous obsidian silence.',
    ],
    dont: [
      'Fill panels with gold gradients.',
      'Use crosses or faith-specific symbols.',
      'Add sparkle, rays or fantasy fonts.',
    ],
  },

  // Placeholder art: replace with the signature artwork.
  art(ctx) {
    const t = ctx.t;
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="presentation"><path d="M20 92 V44 Q20 14 50 6 Q80 14 80 44 V92 Z" fill="none" stroke="${t.accent}" stroke-width="1"/><path d="M28 92 V46 Q28 22 50 15 Q72 22 72 46 V92 Z" fill="${t.primary}" opacity=".55"/><circle cx="50" cy="42" r="12" fill="none" stroke="${t.accent}" stroke-width="1"/><circle cx="50" cy="42" r="3" fill="${t.accent}"/></svg>`;
  },

  materials: [],
  rules: { do: [], dont: [] },
});
