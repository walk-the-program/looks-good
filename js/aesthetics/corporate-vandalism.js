/* 27 Corporate Vandalism — official, hijacked, deadpan. MSCHF, store pages and Off-White quotation-mark labels: a sincere, tidy interface with one intrusion per screen.
   STUB (P5 scaffold): header metadata, deck copy and placeholder art only. The builder
   replaces art(), adds tokens()/roles/materials/rules and fills css/aesthetics/corporate-vandalism.css.
   Direction: docs/aesthetics-round5.md and docs/research/round5-*.md. */
registerAesthetic({
  key: 'corporate-vandalism', order: 27,
  name: 'Corporate Vandalism',
  descriptor: 'Official · Hijacked · Deadpan',
  influences: 'MSCHF / Procurement software / Off-White labelling',
  summary: 'A spotless corporate shell with exactly one thing quietly wrong: a redaction bar, a warning label, an absurd receipt.',
  motto: 'Everything is fine. Please initial here.',
  kicker: 'Pending review',
  mode: 'light',
  slideShape: 'minimal',
  labels: { material: 'Compliance', states: ['Approved', 'Flagged', 'Redacted'], statesKind: 'button' },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    principles: [
      ['One intrusion per screen', 'The shell stays sincere; a single element is quietly wrong.'],
      ['Fixed vandal palette', 'Black, white and hazard red never take the client colours.'],
      ['Plausible fine print', 'Deadpan needs real syntax, so every footnote reads as legal.'],
    ],
    do: [
      'Keep the brand shell tidy and flat.',
      'Redact words with exact-width black bars.',
      'Add one absurd receipt or footnote.',
    ],
    dont: [
      'Rotate, tape or distress anything.',
      'Use rounded cards or soft shadows.',
      'Repeat the gag on every screen.',
    ],
  },

  // Placeholder art: replace with the signature artwork.
  art(ctx) {
    const t = ctx.t;
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="presentation"><rect x="6" y="14" width="88" height="72" fill="${t.canvas}" stroke="${t.line}" stroke-width="1"/><rect x="6" y="14" width="88" height="10" fill="${t.primary}"/><rect x="12" y="34" width="50" height="5" fill="${t.ink}"/><rect x="12" y="46" width="64" height="5" fill="${t.ink}" opacity=".5"/><rect x="30" y="46" width="22" height="5" fill="#000"/><rect x="12" y="58" width="40" height="5" fill="${t.ink}" opacity=".5"/><rect x="62" y="64" width="26" height="14" fill="#d1121b"/></svg>`;
  },

  materials: [],
  rules: { do: [], dont: [] },
});
