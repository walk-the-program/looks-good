/* 13 Y2K Chrome — STUB (owner N1). Registers full metadata so the aesthetic is selectable,
   appears in Compare all and the AI brief, and renders with the base board
   styles. Replace `art`, add `layout` / `type` / `highlight` / `tokens` /
   `canvas` / `materials` / `rules` here and write the look in
   css/aesthetics/y2k-chrome.css (every selector scoped under .ab[data-ae="y2k-chrome"]).
   See docs/aesthetics-plan.md "Board anatomy" and docs/aesthetics-round3.md. */
registerAesthetic({
  key: 'y2k-chrome', order: 13,
  name: 'Y2K Chrome',
  descriptor: 'Liquid · Metallic · Hyper',
  influences: 'Y2K web / Chrome type / Acid graphics',
  summary: 'Heavy liquid chrome and blobby forms on a near-black field.',
  motto: 'Shine like it is 2001.',
  kicker: 'Liquid metal',
  mode: 'dark',
  slideShape: 'soft',
  labels: { material: 'Chrome', states: ['Brushed', 'Polished', 'Liquid'], statesKind: 'swatch' },

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
