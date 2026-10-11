/* 29 Xerox Punk — ransom, pasted, defiant. Jamie Reid's ransom lettering and torn layers on a street wall; the existing Xerox is a clean copied page, this is a collision of sources.
   STUB (P5 scaffold): header metadata, deck copy and placeholder art only. The builder
   replaces art(), adds tokens()/roles/materials/rules and fills css/aesthetics/xerox-punk.css.
   Direction: docs/aesthetics-round5.md and docs/research/round5-*.md. */
registerAesthetic({
  key: 'xerox-punk', order: 29,
  name: 'Xerox Punk',
  descriptor: 'Ransom · Pasted · Defiant',
  influences: 'Jamie Reid / Wheatpaste street walls / Ransom-note collage',
  summary: 'A dark wall of pasted scraps: ransom-note headlines, torn layers, censor bars and one fluorescent hit.',
  motto: 'Cut it. Paste it. Mean it.',
  kicker: 'Stick no bills',
  mode: 'dark',
  slideShape: 'minimal',
  labels: { material: 'Paste-up', states: ['Pasted', 'Circled', 'Crossed out'], statesKind: 'button' },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    principles: [
      ['A wall, not a page', 'Many sources overlap on a dark ground; nothing sits neatly.'],
      ['Every tile is its own face', 'Ransom headlines vary font, size, ground and tilt.'],
      ['One fluoro, used by hand', 'Marker circles and cross-outs carry state and emphasis.'],
    ],
    do: [
      'Build headlines from mismatched cut tiles.',
      'Use circles, cross-outs and censor bars for states.',
      'Push only the primary to Day-Glo.',
    ],
    dont: [
      'Use a white page as the main surface.',
      'Rotate beyond six degrees or randomly.',
      'Add skulls, chains or stock grunge.',
    ],
  },

  // Placeholder art: replace with the signature artwork.
  art(ctx) {
    const t = ctx.t;
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="presentation"><rect x="8" y="12" width="52" height="40" fill="#e9e3d0" transform="rotate(-3 34 32)"/><rect x="36" y="38" width="54" height="44" fill="${t.primary}" transform="rotate(2 63 60)"/><rect x="14" y="62" width="40" height="8" fill="#000"/><circle cx="72" cy="30" r="12" fill="none" stroke="${t.primary}" stroke-width="2"/></svg>`;
  },

  materials: [],
  rules: { do: [], dont: [] },
});
