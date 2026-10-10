/* 15 Bento Grid — STUB (owner N1). Registers full metadata so the aesthetic is selectable,
   appears in Compare all and the AI brief, and renders with the base board
   styles. Replace `art`, add `layout` / `type` / `highlight` / `tokens` /
   `canvas` / `materials` / `rules` here and write the look in
   css/aesthetics/bento-grid.css (every selector scoped under .ab[data-ae="bento-grid"]).
   See docs/aesthetics-plan.md "Board anatomy" and docs/aesthetics-round3.md. */
registerAesthetic({
  key: 'bento-grid', order: 15,
  name: 'Bento Grid',
  descriptor: 'Modular · Clear · Product-proud',
  influences: 'Apple feature grids / Bento layouts / Product marketing',
  summary: 'A grid of rounded tiles, each one making a single point.',
  motto: 'One tile, one idea.',
  kicker: 'Everything in its tile',
  mode: 'light',
  slideShape: 'refined',
  labels: { material: 'Tiles', states: ['Rest', 'Hover', 'Pressed'], statesKind: 'button' },

  // Placeholder art: a primary disc, a secondary bar and an accent dot.
  art(ctx) {
    const t = ctx.t;
    return `<svg viewBox="0 0 100 100" width="100%" height="100%" focusable="false">
      <circle cx="42" cy="48" r="26" fill="${t.primary}"/>
      <rect x="58" y="22" width="14" height="56" fill="${t.secondary}"/>
      <circle cx="74" cy="76" r="8" fill="${t.accent}"/>
    </svg>`;
  },

  materials: [],
  rules: { do: [], dont: [] },
});
