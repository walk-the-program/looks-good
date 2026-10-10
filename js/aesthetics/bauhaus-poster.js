/* 08 Bauhaus Poster — STUB. Descriptors and a placeholder art only; the owning
   worker replaces art(), adds tokens(), materials and rules, and fills
   css/aesthetics/bauhaus-poster.css. See docs/aesthetics-plan.md for the spec. */
registerAesthetic({
  key: 'bauhaus-poster', order: 8,
  name: 'Bauhaus Poster',
  descriptor: 'Constructive · Flat · Rhythmic',
  influences: 'Bauhaus 1923 / Constructivism / Swiss poster',
  summary: 'Flat geometry and strong type, composed like a poster.',
  motto: 'Form follows rhythm.',
  kicker: 'Constructed',
  mode: 'light',
  slideShape: 'minimal',
  labels: { material: 'Form', states: ["Flat", "Outlined", "Filled"] },
  roles: {
    secondary: { use: 'Large planes inside the art only; in the UI, tags and chips', coverage: '≈10–15% (art planes may exceed this)' },
    accent: { use: 'Large planes inside the art only; in the UI, one spark', coverage: '≤5% of the UI (art planes may exceed this)' },
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
