/* 19 Groovy 70s — STUB (owner N2). Registers full metadata so the aesthetic is selectable,
   appears in Compare all and the AI brief, and renders with the base board
   styles. Replace `art`, add `layout` / `type` / `highlight` / `tokens` /
   `canvas` / `materials` / `rules` here and write the look in
   css/aesthetics/groovy-70s.css (every selector scoped under .ab[data-ae="groovy-70s"]).
   See docs/aesthetics-plan.md "Board anatomy" and docs/aesthetics-round3.md. */
registerAesthetic({
  key: 'groovy-70s', order: 19,
  name: 'Groovy 70s',
  descriptor: 'Warm · Wavy · Joyful',
  influences: '1970s psychedelia / Supergraphics / Retro packaging',
  summary: 'Warm cream, fat soft type and concentric rainbow bands.',
  motto: 'Good vibes, printed.',
  kicker: 'Far out',
  mode: 'light',
  slideShape: 'soft',
  labels: { material: 'Waves', states: ['Rest', 'Hover', 'Pressed'], statesKind: 'button' },

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
