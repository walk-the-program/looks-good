/* 09 Clay — STUB. Descriptors and a placeholder art only; the owning
   worker replaces art(), adds tokens(), materials and rules, and fills
   css/aesthetics/clay.css. See docs/aesthetics-plan.md for the spec. */
registerAesthetic({
  key: 'clay', order: 9,
  name: 'Clay',
  descriptor: 'Puffy · Joyful · Tangible',
  influences: 'Claymorphism / Toy design / Soft 3D',
  summary: 'Soft, colorful objects that look like they were made of modeling clay.',
  motto: 'Made by hand.',
  kicker: 'Soft and puffy',
  mode: 'light',
  slideShape: 'soft',
  labels: { material: 'Clay', states: ["Rest", "Hover", "Pressed"] },

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
