/* 46 Big Top — Striped, Showy, Scalloped. A grown-up circus showbill: tent stripes, scalloped edges, wood-type headlines and ticket buttons.
   STUB (P6 scaffold): header metadata, deck copy and placeholder art only. The builder
   replaces art(), adds tokens()/roles/materials/rules and fills css/aesthetics/big-top.css.
   Direction: docs/research/round6.md (section for this aesthetic). */
registerAesthetic({
  key: 'big-top', order: 46,
  name: 'Big Top',
  descriptor: 'Striped · Showy · Scalloped',
  influences: 'Circus showbills / Wood type / Tent striping',
  summary: 'A grown-up circus showbill: tent stripes, scalloped edges, wood-type headlines and ticket buttons.',
  motto: 'Stripes, scallops, showbill symmetry.',
  kicker: 'One night only',
  mode: 'light',
  slideShape: 'classic',
  labels: { material: 'Canvas', states: ['Plain', 'Striped', 'Spotlit'], statesKind: 'swatch' },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    principles: [
      ['Stripes, scallops, showbill symmetry', 'Everything centres and mirrors like a poster.'],
      ['Every button is a ticket', 'Controls borrow the shape of a ticket stub.'],
      ['Grown-up circus, not party', 'Warm vintage colour with plenty of cream.'],
    ],
    do: [
      'Edge headers with a scalloped valance in brand stripes.',
      'Set headlines in wood type on an arc or ribbon.',
      'Use bulbs to spotlight one element only.',
    ],
    dont: [
      'Add clowns, animals or rainbow balloons.',
      'Use more than two stripe colours plus cream.',
      'Set body text in wood type.',
    ],
  },

  // Placeholder art: replace with the signature artwork.
  art(ctx) {
    const t = ctx.t;
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="presentation"><path d="M50 10L12 44h76z" fill="${t.primary}"/><path d="M50 10L38 44h12zM50 10l12 34H50z" fill="${t.canvas}"/><path d="M12 44h76v34H12z" fill="${t.secondary}"/><g fill="${t.canvas}"><path d="M12 44a6.3 7 0 0 0 12.6 0a6.3 7 0 0 0 12.6 0a6.3 7 0 0 0 12.6 0a6.3 7 0 0 0 12.6 0a6.3 7 0 0 0 12.6 0a6.3 7 0 0 0 12.6 0z"/></g><circle cx="50" cy="8" r="3" fill="${t.accent}"/></svg>`;
  },

  materials: [],
  rules: { do: [], dont: [] },
});
