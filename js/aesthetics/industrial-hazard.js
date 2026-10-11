/* 32 Industrial Hazard — heavy, ranked, locked-out. ISA-101 high-performance HMI and the ANSI Z535 signal-word ladder: grey baseline, ranked colour, serial plates and lockout tags.
   STUB (P5 scaffold): header metadata, deck copy and placeholder art only. The builder
   replaces art(), adds tokens()/roles/materials/rules and fills css/aesthetics/industrial-hazard.css.
   Direction: docs/aesthetics-round5.md and docs/research/round5-*.md. */
registerAesthetic({
  key: 'industrial-hazard', order: 32,
  name: 'Industrial Hazard',
  descriptor: 'Heavy · Ranked · Locked-out',
  influences: 'ISA-101 control rooms / ANSI Z535 signage / Lockout tags',
  summary: 'A heavy grey machine where colour is rationed: healthy is grey, and only abnormal states earn a signal colour.',
  motto: 'Lock it out. Tag it.',
  kicker: 'Authorised personnel',
  mode: 'dark',
  slideShape: 'minimal',
  labels: { material: 'Interlocks', states: ['Normal', 'Caution', 'Danger'], statesKind: 'button' },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    principles: [
      ['Healthy is grey', 'Colour is reserved for abnormal states.'],
      ['Rank the signals', 'DANGER, WARNING, CAUTION, NOTICE follow one fixed ladder.'],
      ['The brand is the enamel', 'The client primary paints the machine housing.'],
    ],
    do: [
      'Reserve hazard stripes for dangerous controls.',
      'Stamp serial numbers and lockout tags.',
      'Use oversized status lights and steel bezels.',
    ],
    dont: [
      'Colour healthy states.',
      'Use soft shadows, gradients or rounded corners.',
      'Stripe decoratively or at odd angles.',
    ],
  },

  // Placeholder art: replace with the signature artwork.
  art(ctx) {
    const t = ctx.t;
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="presentation"><rect x="6" y="20" width="88" height="60" fill="${t.line}"/><rect x="12" y="26" width="76" height="48" fill="${t.canvas}" stroke="${t.ink}" stroke-width="1"/><circle cx="30" cy="50" r="9" fill="${t.primary}"/><rect x="48" y="42" width="34" height="16" fill="${t.ink}" opacity=".4"/></svg>`;
  },

  materials: [],
  rules: { do: [], dont: [] },
});
