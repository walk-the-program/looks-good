/* 20 Blueprint — STUB (owner N2). Registers full metadata so the aesthetic is selectable,
   appears in Compare all and the AI brief, and renders with the base board
   styles. Replace `art`, add `layout` / `type` / `highlight` / `tokens` /
   `canvas` / `materials` / `rules` here and write the look in
   css/aesthetics/blueprint.css (every selector scoped under .ab[data-ae="blueprint"]).
   See docs/aesthetics-plan.md "Board anatomy" and docs/aesthetics-round3.md. */
registerAesthetic({
  key: 'blueprint', order: 20,
  name: 'Blueprint',
  descriptor: 'Technical · Annotated · Exact',
  influences: 'Architectural drawings / Engineering blueprints / Patent diagrams',
  summary: 'White line work on a blue drawing field, with dimensions and a title block.',
  motto: 'Drawn to scale.',
  kicker: 'Sheet 01 / 01',
  mode: 'dark',
  slideShape: 'minimal',
  labels: { material: 'Drawing', states: ['Default', 'Hover', 'Active'], statesKind: 'button' },

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
