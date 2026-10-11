/* 34 Biomechanical Gothic — grown, ribbed, ancient. Biomechanical airbrush art, Scorn and Tsutomu Nihei: rhythm and structure in charcoal, bone and tarnished metal, with no gore.
   STUB (P5 scaffold): header metadata, deck copy and placeholder art only. The builder
   replaces art(), adds tokens()/roles/materials/rules and fills css/aesthetics/biomechanical-gothic.css.
   Direction: docs/aesthetics-round5.md and docs/research/round5-*.md. */
registerAesthetic({
  key: 'biomechanical-gothic', order: 34,
  name: 'Biomechanical Gothic',
  descriptor: 'Grown · Ribbed · Ancient',
  influences: 'Biomechanical art / Scorn / Nihei\'s architecture',
  summary: 'One cast material and a few repeated modules, ribs, vertebrae and tubes, lit by a dim living glow.',
  motto: 'It grew this way.',
  kicker: 'Specimen, unearthed',
  mode: 'dark',
  slideShape: 'classic',
  labels: { material: 'Organs', states: ['Dormant', 'Breathing', 'Awake'], statesKind: 'swatch' },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    principles: [
      ['One cast material', 'Charcoal, bone and tarnished metal share a single surface.'],
      ['Repeat a few modules', 'Ribs, vertebrae, tubes and valves set the rhythm.'],
      ['Colour is a dim glow', 'The brand appears only as faint bioluminescence.'],
    ],
    do: [
      'Use vertebral arches and ribbed frames.',
      'Divide sections with tubing runs.',
      'Keep body text at full contrast.',
    ],
    dont: [
      'Show gore, flesh or teeth.',
      'Copy Giger or Alien imagery.',
      'Use glow-green or cyan highlights.',
    ],
  },

  // Placeholder art: replace with the signature artwork.
  art(ctx) {
    const t = ctx.t;
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="presentation"><g fill="none" stroke="${t.ink}" stroke-width="2" opacity=".7"><path d="M50 6 V94"/><path d="M50 22 Q24 24 20 44"/><path d="M50 22 Q76 24 80 44"/><path d="M50 46 Q26 48 22 68"/><path d="M50 46 Q74 48 78 68"/></g><circle cx="50" cy="80" r="5" fill="${t.primary}" opacity=".7"/></svg>`;
  },

  materials: [],
  rules: { do: [], dont: [] },
});
