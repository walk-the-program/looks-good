/* 23 Micrographics - STUB (P4 scaffold): header metadata and a placeholder art only.
   The builder replaces art, adds roles, tokens, materials, rules and fills css/aesthetics/micrographics.css.
   Reference: streetwear and tech-editorial layouts (Acronym, Nike ISPA, modern Swiss posters): a giant headline or glyph against 7-9px mono microtype, registration marks, tick rulers, tiny barcodes and coordinate pairs.
   Spec: docs/aesthetics-round4.md. */

registerAesthetic({
  key: 'micrographics', order: 23,
  name: 'Micrographics',
  descriptor: 'Tiny · Technical · Precise',
  influences: 'Swiss technical print / Streetwear graphics / Product spec sheets',
  summary: 'One huge element ringed by clusters of 8px mono labels, marks and coordinates.',
  motto: 'Small print, large idea.',
  kicker: 'SPEC 01/26',
  mode: 'light',
  slideShape: 'minimal',
  labels: { material: 'Detail', states: ['Base', 'Annotated', 'Marked'], statesKind: 'swatch' },

  art(ctx) {
    const t = ctx.t;
    return `<svg viewBox="0 0 200 150" width="100%" height="100%" focusable="false">
      <text x="100" y="112" text-anchor="middle" font-size="110" font-weight="700" fill="${t.ink}">${ctx.initial}</text>
      <path d="M10 10h8M10 10v8M190 10h-8M190 10v8M10 140h8M10 140v-8M190 140h-8M190 140v-8" stroke="${t.ink}" stroke-width="0.6" fill="none"/>
      <circle cx="160" cy="36" r="2" fill="${t.primary}"/>
    </svg>`;
  },

  materials: [],

  rules: { do: [], dont: [] },
});
