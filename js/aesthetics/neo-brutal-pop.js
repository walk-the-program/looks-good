/* 03 Neo-Brutal Pop — STUB. Descriptors and a placeholder art only; the owning
   worker replaces art(), adds tokens(), materials and rules, and fills
   css/aesthetics/neo-brutal-pop.css. See docs/aesthetics-plan.md for the spec. */
registerAesthetic({
  key: 'neo-brutal-pop', order: 3,
  name: 'Neo-Brutal Pop',
  descriptor: 'Chunky · Playful · Loud',
  influences: 'Neo-brutalism / Memphis / Sticker culture',
  summary: 'Big outlines, bright stickers and buttons that squish when you press them.',
  motto: 'Loud, but friendly.',
  kicker: 'Stickers, stacked',
  mode: 'light',
  slideShape: 'geometric',
  labels: { material: 'Stickers & squish', states: ["Rest", "Lift", "Squish"] },
  roles: {
    secondary: { use: 'Card fills, tags and chips, the second data series', coverage: '≈20%' },
  },

  art(ctx) {
    const t = ctx.t;
    return '<svg viewBox="0 0 100 100" width="100%" height="100%" focusable="false">'
      + '<circle cx="40" cy="42" r="26" fill="' + t.primary + '"/>'
      + '<rect x="52" y="50" width="36" height="36" rx="6" fill="' + t.secondary + '"/>'
      + '<circle cx="76" cy="24" r="9" fill="' + t.accent + '"/></svg>';
  },

  materials: [],
  rules: { do: [], dont: [] },
});
