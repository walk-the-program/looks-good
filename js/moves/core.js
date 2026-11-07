/* Core moves: generic, parameterised, style-neutral. Contract: dev/move-lab/README.md.
   Loaded by dev/move-lab/lab.js (?movelab=1 only). Needs js/aesthetic-spec.js first. */
(function () {
'use strict';

const num = (def, range) => ({ kind: 'number', default: def, range });
const ROLE_VAR = {
  primary: '--ab-primary', secondary: '--ab-secondary', accent: '--ab-accent', ink: '--ab-ink',
  canvas: '--ab-canvas', line: '--ab-line', muted: '--ab-muted', tint: '--ab-pri-tint',
};
const ON_VAR = {
  primary: '--ab-on-primary', secondary: '--ab-on-secondary', accent: '--ab-on-accent',
  ink: '--ab-canvas', canvas: '--ab-ink', tint: '--ab-ink', line: '--ab-ink', muted: '--ab-canvas',
};
const role = r => `var(${ROLE_VAR[r] || '--ab-ink'})`;
const ROLES = Object.keys(ROLE_VAR);

/* ---------------- moves ---------------- */

registerMove({
  id: 'corner-radius', category: 'shape', tier: 'recipe',
  params: {
    base:     num(8, [0, 40]),     // px
    controls: num(1, [0, 4]),      // x base: buttons, fields, select, segmented
    surfaces: num(2, [0, 4]),      // x base: cards, panels, modal, sheet, toast, menu
    small:    num(0.5, [0, 4]),    // x base: chip, badge, tooltip, tabs
    pill:     { kind: 'bool', default: false },   // buttons, fields, select, segmented fully round
    round:    { kind: 'bool', default: true },    // switch, progress, avatar fully round; false = they take `controls` radius
  },
  css(S, p, ctx) {
    const r = k => `${Math.round(p.base * k * 100) / 100}px`;
    const rule = (comps, v) => `${ctx.sel(comps)} { border-radius: ${v}; }`;
    return [
      rule(['button-primary', 'button-secondary', 'button-ghost', 'button-danger', 'field', 'select', 'segmented'], p.pill ? '999px' : r(p.controls)),
      rule(['card', 'panel', 'modal', 'sheet', 'toast', 'menu', 'callout'], r(p.surfaces)),
      rule(['chip', 'badge', 'tooltip', 'tabs'], r(p.small)),
      rule(['switch', 'progress', 'avatar'], p.round ? '999px' : r(p.controls)),
    ].join('\n');
  },
});

registerMove({
  id: 'hairline-rule', category: 'structure', tier: 'recipe',
  params: {
    width: num(1, [0.5, 3]),
    colour: { kind: 'enum', default: 'line', options: ['line', 'ink', 'muted', 'primary'] },
  },
  css(S, p, ctx) {
    const c = role(p.colour), w = `${p.width}px`;
    return `${S} .ab-rule { height: 0; border: 0; border-top: ${w} solid ${c}; background: none; }
${S} :is(.sb-k-divider, .sb-k-menu-sep) { border-color: ${c}; }
${ctx.sel('list-row')} { border-bottom: ${w} solid ${c}; }`;
  },
});

registerMove({
  id: 'heavy-border', category: 'structure', tier: 'recipe',
  params: {
    width: num(3, [1, 8]),
    colour: { kind: 'enum', default: 'ink', options: ['ink', 'primary', 'accent', 'line'] },
  },
  css(S, p, ctx) {
    return `${ctx.sel(['card', 'panel', 'modal', 'sheet', 'toast', 'menu', 'tooltip', 'callout'])} { border: ${p.width}px solid ${role(p.colour)}; }`;
  },
});

registerMove({
  id: 'tinted-neutral-canvas', category: 'colour', tier: 'recipe',
  params: {
    tint:     num(14, [0, 40]),    // saturation % of the neutral, taken from the primary hue
    paperMix: num(0.35, [0, 1]),   // light mode: how far toward the cream below
    cream:    { kind: 'colour', default: '#f4ecd8' },
    lightL:   num(95, [85, 100]),  // lightness %, light mode
    darkL:    num(11, [2, 25]),    // lightness %, dark mode
  },
  // canvas hook: fn.call(def, p, ctx, base); base = { canvas, ink, isDark, primary, mix, hexToHsl, hslToHex }.
  hooks: {
    canvas(p, ctx, base) {
      const h = base.hexToHsl(base.primary).h;
      if (base.isDark) return base.hslToHex(h, p.tint, p.darkL);
      const tinted = base.hslToHex(h, p.tint, p.lightL);
      return base.mix(p.cream, tinted, p.paperMix);   // mix(hex, base, amount): amount of hex
    },
  },
});

registerMove({
  id: 'caps-mono-labels', category: 'type', tier: 'recipe',
  params: {
    font:     { kind: 'text', default: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace" },
    tracking: num(0.08, [0, 0.3]),  // em
    size:     num(0.72, [0.55, 1]), // em of the surrounding text
  },
  tokens(t, p) { return { '--ab-font-label': p.font }; },
  css(S, p, ctx) {
    return `${S} :is(.ab-label, .ab-kicker, .ab-fieldlabel, .ab-sw-role, .ab-state-name, .sb-k-slabel, .sb-k-type-meta) {
  font-family: var(--ab-font-label); text-transform: uppercase; letter-spacing: ${p.tracking}em; font-size: ${p.size}em; }
${ctx.sel('badge')} { font-family: var(--ab-font-label); text-transform: uppercase; letter-spacing: ${p.tracking}em; }`;
  },
});

registerMove({
  id: 'tight-display-tracking', category: 'type', tier: 'recipe',
  params: {
    tracking: num(-0.04, [-0.12, 0.02]),  // em
    leading:  num(0.95, [0.8, 1.3]),
  },
  css(S, p) {
    return `${S} :is(.ab-headline, .ab-hero h1, .ab-hero h2) { letter-spacing: ${p.tracking}em; line-height: ${p.leading}; }`;
  },
});

/* ---------------- materials ---------------- */

registerMove({
  id: 'flat-fill', category: 'material', tier: 'recipe',
  params: { fill: { kind: 'enum', default: 'primary', options: ROLES } },
  material: {
    name: 'flat-fill',
    css(S, sel, p) {
      return `${sel} { background: ${role(p.fill)}; color: var(${ON_VAR[p.fill]}); border-color: transparent; box-shadow: none; }`;
    },
  },
});

registerMove({
  id: 'outlined', category: 'material', tier: 'recipe',
  params: {
    width:  num(2, [1, 6]),
    colour: { kind: 'enum', default: 'ink', options: ROLES },
    fill:   { kind: 'enum', default: 'canvas', options: ['transparent', 'canvas'] },
  },
  material: {
    name: 'outlined',
    css(S, sel, p) {
      return `${sel} { background: ${p.fill === 'canvas' ? 'var(--ab-canvas)' : 'transparent'}; color: var(--ab-ink); border: ${p.width}px solid ${role(p.colour)}; box-shadow: none; }`;
    },
  },
});

registerMove({
  id: 'hard-offset', category: 'material', tier: 'recipe',
  params: {
    x:      num(4, [-12, 12]),
    y:      num(4, [-12, 12]),
    colour: { kind: 'enum', default: 'ink', options: ROLES },       // shadow colour role (no blur)
    fill:   { kind: 'enum', default: 'canvas', options: ROLES },
    width:  num(2, [0, 6]),                                         // border, ink coloured
  },
  material: {
    name: 'hard-offset',
    css(S, sel, p) {
      return `${sel} { background: ${role(p.fill)}; color: var(${ON_VAR[p.fill]}); border: ${p.width}px solid var(--ab-ink); box-shadow: ${p.x}px ${p.y}px 0 0 ${role(p.colour)}; }`;
    },
  },
});

/* ---------------- states ---------------- */

registerMove({
  id: 'invert-on-hover', category: 'state', tier: 'recipe',
  params: { transition: num(120, [0, 400]) },   // ms
  state: {
    name: 'invert-on-hover',
    css(S, sel, p, ctx) {
      return `${sel} { transition: background ${p.transition}ms, color ${p.transition}ms; }
${ctx.ON.hover(sel)} { background: var(--ab-ink); color: var(--ab-canvas); border-color: var(--ab-ink); }`;
    },
  },
});

registerMove({
  id: 'ink-fill-selected', category: 'state', tier: 'recipe',
  params: {},
  state: {
    name: 'ink-fill-selected',
    css(S, sel, p, ctx) {
      return `${ctx.ON.selected(sel)} { background: var(--ab-ink); color: var(--ab-canvas); border-color: var(--ab-ink); }`;
    },
  },
});

registerMove({
  id: 'press-sink', category: 'state', tier: 'recipe',
  params: {
    distance: num(2, [0, 8]),               // px translate toward bottom-right
    flatten:  { kind: 'bool', default: true },   // drop the offset shadow while pressed
  },
  state: {
    name: 'press-sink',
    css(S, sel, p, ctx) {
      return `${ctx.ON.press(sel)} { transform: translate(${p.distance}px, ${p.distance}px);${p.flatten ? ' box-shadow: none;' : ''} }`;
    },
  },
});
})();
