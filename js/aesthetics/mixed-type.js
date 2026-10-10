/* 24 Mixed Type - STUB (P4 scaffold): header metadata and a placeholder art only.
   The builder replaces art, adds roles, tokens, materials, rules and fills css/aesthetics/mixed-type.css.
   Reference: the current type-mixing trend in identities and editorial covers, specimen posters (Pangram Pangram, Displaay, Commercial Type): word-by-word face changes with cap heights aligned, on a strict grid.
   Spec: docs/aesthetics-round4.md. */

registerAesthetic({
  key: 'mixed-type', order: 24,
  name: 'Mixed Type',
  descriptor: 'Eclectic · Editorial · Witty',
  influences: 'Contemporary type mixing / Editorial covers / Specimen posters',
  summary: 'Headlines that switch between serif italic, heavy grotesk and mono within one line.',
  motto: 'Many voices, one page.',
  kicker: 'Specimen No. 4',
  mode: 'light',
  slideShape: 'refined',
  labels: { material: 'Voice', states: ['Roman', 'Italic', 'Mono'], statesKind: 'swatch' },
  highlight: 'custom',
  highlightNote: 'Builder to fill in.',

  art(ctx) {
    const t = ctx.t;
    return `<svg viewBox="0 0 200 150" width="100%" height="100%" focusable="false">
      <text x="14" y="70" font-size="58" fill="${t.ink}">Aa</text>
      <text x="100" y="70" font-size="58" font-style="italic" fill="${t.ink}">Aa</text>
      <text x="14" y="128" font-size="58" font-weight="800" fill="${t.ink}">Aa</text>
      <text x="100" y="128" font-size="50" font-family="ui-monospace, Menlo, monospace" fill="${t.primary}">Aa</text>
    </svg>`;
  },

  materials: [],

  rules: { do: [], dont: [] },
});
