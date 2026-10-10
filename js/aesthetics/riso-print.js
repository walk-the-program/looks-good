/* 10 Riso Print — STUB. Descriptors and a placeholder art only; the owning
   worker replaces art(), adds tokens(), materials and rules, and fills
   css/aesthetics/riso-print.css. See docs/aesthetics-plan.md for the spec. */
registerAesthetic({
  key: 'riso-print', order: 10,
  name: 'Riso Print',
  descriptor: 'Inked · Grainy · Human',
  influences: 'Risograph zines / Screen print / Editorial',
  summary: 'Two overlapping inks on warm paper, a little off-register on purpose.',
  motto: 'Printed by people.',
  kicker: 'Two inks, one pass',
  mode: 'light',
  slideShape: 'minimal',
  labels: { material: 'Ink', states: ["Solid ink", "Overprint", "Halftone"] },

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
