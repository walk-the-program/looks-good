/* 07 Aurora Noir — STUB. Descriptors and a placeholder art only; the owning
   worker replaces art(), adds tokens(), materials and rules, and fills
   css/aesthetics/aurora-noir.css. See docs/aesthetics-plan.md for the spec. */
registerAesthetic({
  key: 'aurora-noir', order: 7,
  name: 'Aurora Noir',
  descriptor: 'Precise · Nocturnal · Charged',
  influences: 'Dev-tool UI / Swiss grid / Aurora light',
  summary: 'A dark, exact interface with a quiet aurora glow at the top.',
  motto: 'Quiet, exact, charged.',
  kicker: 'Night shift',
  mode: 'dark',
  slideShape: 'minimal',
  labels: { material: 'Surfaces', states: ["Rest", "Hover", "Focus"] },

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
