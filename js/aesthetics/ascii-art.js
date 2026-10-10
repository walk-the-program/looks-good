/* 25 ASCII Art - STUB (P4 scaffold): header metadata and a placeholder art only.
   The builder replaces art, adds roles, tokens, materials, rules and fills css/aesthetics/ascii-art.css.
   Reference: modern ASCII renderings (character-density images, terminal dashboards, btop/lazygit-style TUIs): " .:-=+*#%@" chosen by brightness, box-drawing borders, bracketed controls and block-character bars.
   Spec: docs/aesthetics-round4.md. */

registerAesthetic({
  key: 'ascii-art', order: 25,
  name: 'ASCII Art',
  descriptor: 'Textual · Generative · Nerdy',
  influences: 'Text-mode art / Terminal UI / Generative ASCII',
  summary: 'Everything built from monospace characters on a grid, with box-drawing panels and density-map art.',
  motto: 'Everything is a character.',
  kicker: 'cat brand.txt',
  mode: 'dark',
  slideShape: 'minimal',
  labels: { material: 'Characters', states: ['Sparse', 'Dense', 'Solid'], statesKind: 'swatch' },
  type: { ui: 'mono', label: 'mono' },

  art(ctx) {
    const t = ctx.t;
    return `<svg viewBox="0 0 200 150" width="100%" height="100%" focusable="false">
      <rect width="200" height="150" fill="${t.canvas}"/>
      <text x="12" y="40" font-size="12" font-family="ui-monospace, Menlo, monospace" fill="${t.ink}" xml:space="preserve">.:-=+*#%@@%#*+=-:.</text>
      <text x="12" y="62" font-size="12" font-family="ui-monospace, Menlo, monospace" fill="${t.primary}" xml:space="preserve">:=+*#%@@@@%#*+=:</text>
      <text x="12" y="84" font-size="12" font-family="ui-monospace, Menlo, monospace" fill="${t.accent}" xml:space="preserve">.:-=+*#%%#*+=-:.</text>
    </svg>`;
  },

  materials: [],

  rules: { do: [], dont: [] },
});
