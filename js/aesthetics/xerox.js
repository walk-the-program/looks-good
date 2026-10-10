/* 22 Xerox - STUB (P4 scaffold): header metadata and a placeholder art only.
   The builder replaces art, adds roles, tokens, materials, rules and fills css/aesthetics/xerox.css.
   Reference: 80s-90s punk and hardcore flyers, Pettibon-era zines, xerox-revival posters. Black toner, threshold contrast, speckle, streaks, tape and cut edges; color only as a spot overprint.
   Spec: docs/aesthetics-round4.md. */

registerAesthetic({
  key: 'xerox', order: 22,
  name: 'Xerox',
  descriptor: 'Toner · Raw · Copied',
  influences: 'Photocopy zines / Punk flyers / Office ephemera',
  summary: 'Black toner on white paper: hard contrast, speckle, edge burn and taped-on scraps.',
  motto: 'Copy of a copy of a copy.',
  kicker: 'Copy 02 of 50',
  mode: 'light',
  slideShape: 'minimal',
  labels: { material: 'Copy', states: ['Original', '2nd gen', '5th gen'], statesKind: 'swatch' },

  art(ctx) {
    const t = ctx.t;
    return `<svg viewBox="0 0 200 150" width="100%" height="100%" focusable="false">
      <rect width="200" height="150" fill="${t.canvas}"/>
      <rect x="0" y="0" width="200" height="150" fill="none" stroke="${t.ink}" stroke-width="10"/>
      <rect x="44" y="30" width="70" height="90" fill="${t.ink}"/>
      <rect x="104" y="50" width="52" height="36" fill="${t.primary}" opacity="0.85"/>
    </svg>`;
  },

  materials: [],

  rules: { do: [], dont: [] },
});
