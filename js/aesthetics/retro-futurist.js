/* 04 Retro-Futurist — STUB. Descriptors and a placeholder art only; the owning
   worker replaces art(), adds tokens(), materials and rules, and fills
   css/aesthetics/retro-futurist.css. See docs/aesthetics-plan.md for the spec. */
registerAesthetic({
  key: 'retro-futurist', order: 4,
  name: 'Retro-Futurist',
  descriptor: 'Analog · Orbital · Glowing',
  influences: '1970s space age / Mission control / Synthwave',
  summary: 'A mission-control console that glows: bezels, lamps and readouts.',
  motto: 'All systems nominal.',
  kicker: 'Mission control',
  mode: 'dark',
  slideShape: 'refined',
  labels: { material: 'Console', states: ["Idle", "Armed", "Engaged"] },

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
