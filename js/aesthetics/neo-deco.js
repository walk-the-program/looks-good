/* 12 Neo Deco — STUB (owner N1). Registers full metadata so the aesthetic is selectable,
   appears in Compare all and the AI brief, and renders with the base board
   styles. Replace `art`, add `layout` / `type` / `highlight` / `tokens` /
   `canvas` / `materials` / `rules` here and write the look in
   css/aesthetics/neo-deco.css (every selector scoped under .ab[data-ae="neo-deco"]).
   See docs/aesthetics-plan.md "Board anatomy" and docs/aesthetics-round3.md. */
registerAesthetic({
  key: 'neo-deco', order: 12,
  name: 'Neo Deco',
  descriptor: 'Gilded · Symmetric · Stepped',
  influences: 'Art Deco / Chrysler Building / Modern luxury hospitality',
  summary: 'Symmetry, stepped frames and thin gilt lines on a deep canvas.',
  motto: 'Symmetry, polished.',
  kicker: 'Gilded',
  mode: 'dark',
  slideShape: 'classic',
  labels: { material: 'Ornament', states: ['Plain', 'Framed', 'Gilded'], statesKind: 'swatch' },

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
