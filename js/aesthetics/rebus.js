/* 26 Rebus - STUB (P4 scaffold): header metadata and a placeholder art only.
   The builder replaces art, adds roles, tokens, materials, rules and fills css/aesthetics/rebus.css.
   Reference: AIGA Eye on Design's "Nouveau Rebus" and Rand's IBM poster: dingbat-like flat pictograms (built in SVG, not emoji) replacing words in the headline, a brand-name rebus equation, small symbols in components.
   Spec: docs/aesthetics-round4.md. */

registerAesthetic({
  key: 'rebus', order: 26,
  name: 'Rebus',
  descriptor: 'Playful · Symbolic · Clever',
  influences: 'Rebus puzzles / Paul Rand\'s IBM eye-bee-M / Nouveau Rebus branding',
  summary: 'Bold flat pictograms stand in for words, so the headline reads as a picture puzzle.',
  motto: 'Say it with a picture.',
  kicker: 'Read it aloud',
  mode: 'light',
  slideShape: 'soft',
  labels: { material: 'Symbols', states: ['Word', 'Mixed', 'Symbol'], statesKind: 'swatch' },
  highlight: 'custom',
  highlightNote: 'Builder to fill in.',

  art(ctx) {
    const t = ctx.t;
    return `<svg viewBox="0 0 200 150" width="100%" height="100%" focusable="false">
      <path d="M50 52c-10-14-30-6-26 10 3 12 26 28 26 28s23-16 26-28c4-16-16-24-26-10z" fill="${t.primary}"/>
      <text x="100" y="86" font-size="34" font-weight="800" fill="${t.ink}">+</text>
      <circle cx="150" cy="70" r="22" fill="${t.accent}"/>
    </svg>`;
  },

  materials: [],

  rules: { do: [], dont: [] },
});
