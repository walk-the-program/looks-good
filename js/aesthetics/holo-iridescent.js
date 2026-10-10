/* 06 Holo Iridescent — STUB. Descriptors and a placeholder art only; the owning
   worker replaces art(), adds tokens(), materials and rules, and fills
   css/aesthetics/holo-iridescent.css. See docs/aesthetics-plan.md for the spec. */
registerAesthetic({
  key: 'holo-iridescent', order: 6,
  name: 'Holo Iridescent',
  descriptor: 'Pearl · Spectral · Precise',
  influences: 'Holographic foil / Y2K chrome / Luxury packaging',
  summary: 'Pearl-white surfaces with a fine holographic edge, like foil packaging.',
  motto: 'A fine finish.',
  kicker: 'Pearl and foil',
  mode: 'light',
  slideShape: 'refined',
  labels: { material: 'Finish', states: ["Matte", "Pearl", "Foil"] },

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
