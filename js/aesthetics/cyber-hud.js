/* 14 Cyber HUD — STUB (owner N1). Registers full metadata so the aesthetic is selectable,
   appears in Compare all and the AI brief, and renders with the base board
   styles. Replace `art`, add `layout` / `type` / `highlight` / `tokens` /
   `canvas` / `materials` / `rules` here and write the look in
   css/aesthetics/cyber-hud.css (every selector scoped under .ab[data-ae="cyber-hud"]).
   See docs/aesthetics-plan.md "Board anatomy" and docs/aesthetics-round3.md. */
registerAesthetic({
  key: 'cyber-hud', order: 14,
  name: 'Cyber HUD',
  descriptor: 'Angular · Neon · Live',
  influences: 'Sci-fi HUD / Cyberpunk UI / Esports overlays',
  summary: 'Cut-corner panels, neon edges and live readouts.',
  motto: 'Target acquired.',
  kicker: 'Sync 98.2%',
  mode: 'dark',
  slideShape: 'minimal',
  labels: { material: 'Interface', states: ['Idle', 'Target', 'Locked'], statesKind: 'button' },

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
