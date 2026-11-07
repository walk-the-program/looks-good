/* Soft moves: generic relief / glass / gloss moves. Style-neutral: every value is a param.
   Contract: dev/move-lab/README.md. Loaded by index.html at startup (and by dev/move-lab/lab.js in the lab), after core.js.
   Vocabulary: a relief pair (--rl-hi light edge, --rl-lo shadow edge) derived from the canvas colour,
   then raised / recessed / glossy / clear-glass surfaces built from that pair. */
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
const FILLS = Object.keys(ROLE_VAR).concat('transparent');
const fillOf = f => f === 'transparent' ? 'transparent' : `var(${ROLE_VAR[f] || '--ab-canvas'})`;
const raisedSh = (d, b) => d <= 0 ? 'none'
  : `${d}px ${d}px ${b}px var(--rl-lo), -${d}px -${d}px ${b}px var(--rl-hi), inset 0 1px 0 var(--rl-rim)`;
const insetSh = (d, b) => `inset ${d}px ${d}px ${b}px var(--rl-lo), inset -${d}px -${d}px ${b}px var(--rl-hi)`;
const inkOf = on => on ? ' color: var(--ab-ink);' : '';
const rad = r => r < 0 ? '' : ` border-radius: ${r}px;`;
const GLOSS = a => `linear-gradient(180deg, rgba(255,255,255,${a}), rgba(255,255,255,0) 55%)`;
/* every selector of a list, with a pseudo-element appended */
const pseudo = (sel, ps) => sel.split(',\n').map(s => s + ps).join(',\n');
/* only the Built-kit / phone selectors of a list */
const kitOnly = sel => sel.split(',\n').filter(s => s.includes('.sb-kit')).join(',\n');

/* ---------------- tokens ---------------- */

registerMove({
  id: 'canvas-ink-pull', libraryId: 'tinted-neutral-canvas', what: 'Mixes a small share of ink into the canvas so every surface sits a touch off the page colour, with separate amounts for light and dark.', category: 'colour', tier: 'recipe',
  params: {
    light: num(0.06, [0, 0.3]),   // share of ink mixed into the canvas, light mode
    dark:  num(0.04, [0, 0.3]),   // same, dark mode
  },
  hooks: { canvas(p, ctx, base) { return base.mix(base.ink, base.canvas, base.isDark ? p.dark : p.light); } },
});

registerMove({
  id: 'relief-pair', libraryId: 'raised-relief', what: 'Derives the shared highlight, shadow, rim and gloss tones from the canvas that every raised, recessed and glossy surface uses.', category: 'colour', tier: 'generator',
  params: {
    hiLight:   num(0.79, [0, 1]),   // highlight alpha (white), light mode
    hiDark:    num(0.11, [0, 1]),   // highlight alpha, dark mode
    loMix:     num(0.25, [0, 1]),   // light mode: share of black mixed into the canvas to make the shadow tone
    loAlpha:   num(0.6, [0, 1]),    // light mode shadow alpha
    loDark:    num(0.53, [0, 1]),   // dark mode shadow alpha (black)
    rimDark:   num(0.06, [0, 0.3]), // dark mode only: 1px top light on raised parts
    glossLight: num(0.5, [0, 1]),   // gloss wash alpha, light
    glossDark:  num(0.07, [0, 1]),  // gloss wash alpha, dark
  },
  tokens(t, p) {
    return {
      '--rl-hi': t.isDark ? `rgba(255,255,255,${p.hiDark})` : `rgba(255,255,255,${p.hiLight})`,
      '--rl-lo': t.isDark ? `rgba(0,0,0,${p.loDark})` : t.alpha(t.mix('#000000', t.canvas, p.loMix), p.loAlpha),
      '--rl-rim': t.isDark ? `rgba(255,255,255,${p.rimDark})` : 'rgba(255,255,255,0)',
      '--rl-gloss': t.isDark ? `rgba(255,255,255,${p.glossDark})` : `rgba(255,255,255,${p.glossLight})`,
      '--rl-edge': t.isDark ? 'rgba(255,255,255,0.44)' : 'rgba(255,255,255,0.85)',
    };
  },
});

registerMove({
  id: 'muted-contrast-floor', libraryId: 'fw-contrast-fit', what: 'Pushes the muted text colour toward ink until it holds a contrast ratio on the canvas and the lifted panel, and sets the on-rim colour.', category: 'colour', tier: 'generator',
  params: {
    min:     num(4.6, [3, 7]),       // contrast ratio to hold
    onRim:   num(0.45, [0, 1]),      // primary pushed this far toward ink for the "on" rim
    panelLift: num(0.1, [0, 0.4]),   // dark mode: how much lighter the lifted panel is
  },
  tokens(t, p) {
    const panel = t.isDark ? t.mix('#ffffff', t.canvas, p.panelLift) : t.canvas;
    const surfaces = [t.canvas, panel, t.mix(t.ink, t.canvas, 0.1)];
    let muted = t.muted, strong = t.muted;
    for (let k = 0.05; k <= 1.001 && surfaces.some(s => t.contrast(muted, s) < p.min); k += 0.05) muted = t.mix(t.ink, t.muted, k);
    for (let k = 0.05; k <= 1.001 && t.contrast(strong, panel) < p.min; k += 0.05) strong = t.mix(t.ink, t.muted, k);
    return { '--ab-muted': muted, '--rl-muted-strong': strong, '--rl-on-rim': t.mix(t.ink, t.primary, p.onRim) };
  },
});

/* ---------------- recipes (css moves) ---------------- */

registerMove({
  id: 'tracked-micro-labels', libraryId: 'kicker-treatment', what: 'Sets the letter-spacing of tags, kickers and footers in em.', category: 'type', tier: 'recipe',
  params: { tag: num(0.14, [0, 0.4]), kicker: num(0.17, [0, 0.4]), foot: num(0.02, [0, 0.2]) },   // em
  css(S, p) {
    return `${S} .ab-tag { letter-spacing: ${p.tag}em; }
${S} .ab-kicker { letter-spacing: ${p.kicker}em; }
${S} .ab-foot { font-size: 11px; letter-spacing: ${p.foot}em; }`;
  },
});

registerMove({
  id: 'display-weight', libraryId: 'display-weight-scale', what: 'Sets the weight and word spacing of the headline, brand and card titles.', category: 'type', tier: 'recipe',
  params: {
    headline: num(600, [100, 900]), brand: num(600, [100, 900]), cardTitle: num(500, [100, 900]),
    wordSpacing: num(0.04, [0, 0.3]),
  },
  css(S, p) {
    return `${S} .ab-headline { font-weight: ${p.headline}; word-spacing: ${p.wordSpacing}em; }
${S} .ab-brand { font-weight: ${p.brand}; }
${S} .ab-card-title { font-weight: ${p.cardTitle}; }
${S} .ab-sw-role { font-weight: 600; }`;
  },
});

registerMove({
  id: 'recessed-groups', libraryId: 'recessed', what: 'Presses lists, state rows, segmented tracks and bars into the canvas with inset relief shadows.', category: 'structure', tier: 'generator',
  params: {
    distance: num(6, [1, 14]), blur: num(13, [2, 30]),
    smallDistance: num(3, [1, 8]), smallBlur: num(6, [1, 16]),
    radius: num(22, [0, 40]), trackRadius: num(12, [0, 30]),
    barHeight: num(10, [4, 20]), barFillAlpha: num(0.55, [0.1, 1]),
  },
  css(S, p, ctx) {
    const big = insetSh(p.distance, p.blur), sm = insetSh(p.smallDistance, p.smallBlur);
    return `${S} :is(.ab-list, .ab-states) { background: var(--ab-canvas); box-shadow: ${big}; border-radius: ${p.radius}px; }
${S} .ab-list { padding: 6px clamp(14px, 2.2cqw, 24px); }
${S} .ab-states { padding: 22px 12px 16px; justify-content: space-around; gap: 8px; }
${S} .ab-row { border-color: color-mix(in srgb, var(--ab-line) 70%, transparent); }
${S} .ab-row:first-child { border-top: 0; }
${S} .ab-row:last-child { border-bottom: 0; }
${S} .ab-row-status { background: none; box-shadow: none; padding: 0; color: var(--ab-muted); }
${S} .ab-seg { background: var(--ab-canvas); box-shadow: ${sm}; border-radius: ${p.trackRadius}px; }
${S}.sb-ab.sb-kit .ab-seg { border: 0; padding: 5px; border-radius: ${p.trackRadius + 2}px; }
${S} .ab-row-bar { display: flex; align-items: center; height: ${p.barHeight}px; padding: 0 2px; border-radius: ${p.barHeight / 2}px;
  background: var(--ab-canvas); box-shadow: ${sm}; overflow: hidden; }
${S} .ab-row-bar i, ${S} .sb-k-bar i { height: 6px; border-radius: 3px; background: color-mix(in srgb, var(--ab-ink) ${Math.round(p.barFillAlpha * 100)}%, var(--ab-canvas)); opacity: 1; box-shadow: none; }
${S}.sb-ab.sb-kit .ab-list.sb-k-list { padding: 4px 0 !important; border: 0; border-radius: ${p.radius - 2}px; }
${S}.sb-ab.sb-kit .ab-row.sb-k-row { background: none; box-shadow: none; }
@container ab (max-width: 600px) { ${S} .ab-row-bar { grid-column: 1 / -1; grid-row: 3; margin-top: 2px; } }`;
  },
});

registerMove({
  id: 'socketed-swatch', libraryId: 'recessed', what: 'Seats each palette swatch in an inset socket with a raised pad inside it.', category: 'structure', tier: 'generator',
  params: {
    socketRadius: num(14, [0, 30]), padInset: num(5, [2, 12]), padRadius: num(9, [0, 24]),
    smallDistance: num(3, [1, 8]), smallBlur: num(6, [1, 16]),
    glossPrimary: { kind: 'bool', default: true },
  },
  css(S, p) {
    return `${S} .ab-palette { padding: clamp(30px, 4.6cqw, 50px) 0; }
${S} .ab-swatches { gap: clamp(12px, 2.4cqw, 26px); }
${S} .ab-chip { position: relative; border-radius: ${p.socketRadius}px; height: clamp(46px, 6cqw, 62px);
  background: var(--ab-canvas) !important; box-shadow: ${insetSh(p.smallDistance, p.smallBlur)}; }
${S} .ab-chip::after { content: ""; position: absolute; inset: ${p.padInset}px; border-radius: ${p.padRadius}px; background: var(--sw);
  box-shadow: 2px 3px 5px var(--rl-lo), -1px -1px 3px var(--rl-hi), inset 0 1px 1px rgba(255,255,255,0.28); }
${p.glossPrimary ? `${S} .ab-swatch[data-role="primary"] .ab-chip::after { background: ${GLOSS(0.24)}, var(--sw); }` : ''}
${S} .ab-swatch[data-role="canvas"] .ab-chip::after { box-shadow: ${raisedSh(p.smallDistance, p.smallBlur + 1)}, inset 0 0 0 1px rgba(128,128,128,0.2); }`;
  },
});

registerMove({
  id: 'material-discs', libraryId: 'material-specimen-slide', what: 'Renders the three material specimen discs (raised, recessed, glass) on the board and deck.', category: 'structure', tier: 'generator',
  params: {
    first:  { kind: 'enum', default: 'raised', options: ['raised', 'recessed', 'glass'] },
    second: { kind: 'enum', default: 'recessed', options: ['raised', 'recessed', 'glass'] },
    third:  { kind: 'enum', default: 'glass', options: ['raised', 'recessed', 'glass'] },
    size: num(84, [40, 140]), distance: num(6, [1, 14]), blur: num(13, [2, 30]),
  },
  css(S, p) {
    const look = {
      raised: `box-shadow: ${raisedSh(p.distance, p.blur)};`,
      recessed: `box-shadow: ${insetSh(p.distance, p.blur)};`,
      glass: `background: linear-gradient(135deg, rgba(255,255,255,.6), rgba(197,234,229,.18) 30%, rgba(215,190,243,.34) 62%, rgba(245,214,168,.35) 83%, rgba(255,255,255,.53)), var(--ab-canvas);
  border: 1px solid rgba(255,255,255,.44);
  box-shadow: inset 2px 2px 3px rgba(255,255,255,.75), inset -2px -2px 4px rgba(197,173,235,.6), 5px 7px 14px var(--rl-lo), -4px -4px 10px var(--rl-hi);`,
    };
    const rim = `${S} .ab-disc[data-s="2"]::after { content: ""; position: absolute; inset: 6px; border-radius: 50%;
  border-top: 1.5px solid rgba(255,255,255,.75); border-left: 1.5px solid rgba(255,255,255,.55);
  border-right: 1px solid rgba(214,189,255,.35); border-bottom: 1px solid rgba(164,230,232,.35); }`;
    return `${S} .ab-disc { position: relative; border: 0; background: var(--ab-canvas); width: ${p.size}px; height: ${p.size}px; max-width: 100%; aspect-ratio: 1; }
${S} .ab-disc[data-s="0"] { ${look[p.first]} }
${S} .ab-disc[data-s="1"] { ${look[p.second]} }
${S} .ab-disc[data-s="2"] { ${look[p.third]} }
${p.third === 'glass' ? rim : ''}
@container ab (max-width: 600px) { ${S} .ab-disc { width: ${Math.round(p.size * 0.8)}px; height: ${Math.round(p.size * 0.8)}px; } }`;
  },
});

registerMove({
  id: 'brand-mark-key', libraryId: 'brand-mark', what: 'Turns the brand mark into a raised key with a primary dot.', category: 'structure', tier: 'recipe',
  params: { size: num(30, [16, 56]), radius: num(10, [0, 28]), dot: num(14, [6, 30]), distance: num(3, [1, 8]), blur: num(7, [1, 16]) },
  css(S, p) {
    const o = Math.round((p.size - p.dot) / 2);
    return `${S} .ab-mark { position: relative; width: ${p.size}px; height: ${p.size}px; border-radius: ${p.radius}px; background: var(--ab-canvas); box-shadow: ${raisedSh(p.distance, p.blur)}; }
${S} .ab-mark span { display: none; }
${S} .ab-mark::after { content: ""; position: absolute; left: ${o}px; top: ${o}px; width: ${p.dot}px; height: ${p.dot}px; border-radius: 50%;
  background: radial-gradient(circle at 30% 27%, rgba(255,255,255,0.4), transparent 45%), var(--ab-primary); box-shadow: 2px 3px 4px rgba(0,0,0,0.2); }`;
  },
});

registerMove({
  id: 'inline-fit-tags', libraryId: 'status-marker', what: 'Shows fit tags as a dot plus text with no pill, and sets the deck material label type.', category: 'structure', tier: 'recipe',
  params: { dot: num(6, [3, 12]) },
  css(S, p) {
    return `${S} .ab-type-col { border-top-color: transparent; box-shadow: inset 0 1px 0 color-mix(in srgb, var(--ab-line) 70%, transparent); }
${S} .ab-fit, ${S} .ab-fit[data-fit] { display: inline-flex; align-items: center; gap: 7px; padding: 0; border: 0; border-radius: 0; background: none; box-shadow: none; color: var(--ab-muted); font-weight: 500; }
${S} .ab-fit::before { content: ""; width: ${p.dot}px; height: ${p.dot}px; border-radius: 50%; background: var(--ab-primary); }
${S} .ab-fit[data-fit="avoid"] { color: var(--ab-ink); }
${S} .ab-fit[data-fit="avoid"]::before { background: var(--ab-ink); }
${S}.ab-slide .ab-deck-mat .ab-label { font-family: var(--ab-font-h); font-size: 30px; font-weight: 600; line-height: 1.1; letter-spacing: -0.03em; text-transform: none; }`;
  },
});

registerMove({
  id: 'media-fallbacks', libraryId: 'fw-a11y-media-fallbacks', what: 'Adds reduced-transparency, more-contrast and reduced-motion fallbacks for the glass and relief surfaces.', category: 'a11y', tier: 'recipe',
  params: { ring: { kind: 'bool', default: true } },
  css(S, p, ctx) {
    return `@media (prefers-reduced-transparency: reduce) { ${S} .ab-card::before { display: none; } }
@media (prefers-contrast: more) { ${ctx.sel('card')} { border-color: var(--ab-ink); } ${ctx.sel('segmented')}:not([aria-pressed="true"]) { color: var(--ab-ink); } }
@media (prefers-reduced-motion: reduce) { ${S} * { transition: none !important; } }`;
  },
});

registerMove({
  id: 'raised-relief', libraryId: 'raised-relief', what: 'Material: the canvas colour with a paired dark and light shadow so the part looks lifted.', category: 'material', tier: 'generator',
  params: {
    distance: num(6, [0, 14]),   // 0 = flat (no shadow)
    blur:     num(13, [0, 30]),
    fill:     { kind: 'enum', default: 'canvas', options: FILLS },
    radius:   num(-1, [-1, 999]),   // px corner radius, -1 = leave the component's own
    ink:      { kind: 'bool', default: false },   // true: force the text colour to ink (parts that were light-on-dark)
  },
  material: {
    name: 'raised-relief',
    css(S, sel, p) {
      const colour = p.fill === 'canvas' || p.fill === 'transparent' ? '' : ` color: var(${ON_VAR[p.fill]});`;
      return `${sel} { background: ${fillOf(p.fill)};${colour} border-color: transparent; box-shadow: ${raisedSh(p.distance, p.blur)};${rad(p.radius)}${inkOf(p.ink && !colour)} }`;
    },
  },
});

registerMove({
  id: 'recessed', libraryId: 'recessed', what: 'Material: the canvas colour with an inset shadow pair so the part looks pressed in, with an optional ink ring.', category: 'material', tier: 'generator',
  params: {
    distance: num(4, [0, 14]),
    blur:     num(9, [0, 30]),
    ring:     num(0, [0, 60]),   // % ink ring keeping an empty socket findable (0 = none)
    radius:   num(-1, [-1, 999]),   // px corner radius, -1 = leave the component's own
    ink:      { kind: 'bool', default: false },   // true: force the text colour to ink (parts that were light-on-dark)
    still:    { kind: 'bool', default: false },   // true: stop shimmer animations and drop their overlay (placeholders)
  },
  material: {
    name: 'recessed',
    css(S, sel, p) {
      const ring = p.ring ? `, inset 0 0 0 1px color-mix(in srgb, var(--ab-ink) ${p.ring}%, transparent)` : '';
      const still = p.still ? `\n${sel} { animation: none; }\n${pseudo(sel, '::after')} { content: none; }` : '';
      return `${sel} { background: var(--ab-canvas); border-color: transparent; box-shadow: ${insetSh(p.distance, p.blur)}${ring};${rad(p.radius)}${inkOf(p.ink)} }${still}`;
    },
  },
});

registerMove({
  id: 'glossy', libraryId: 'glossy', what: 'Material: a solid role colour with a white gloss wash, a faint rim and a soft drop shadow.', category: 'material', tier: 'generator',
  params: {
    fill:  { kind: 'enum', default: 'primary', options: ['primary', 'secondary', 'accent', 'ink'] },
    gloss: num(0.2, [0, 0.6]),
    x: num(3, [0, 10]), y: num(5, [0, 12]), blur: num(9, [0, 24]),
    radius: num(-1, [-1, 999]),   // px corner radius, -1 = leave the component's own
  },
  material: {
    name: 'glossy',
    css(S, sel, p) {
      return `${sel} { background: ${GLOSS(p.gloss)}, ${fillOf(p.fill)}; color: var(${ON_VAR[p.fill]}); border: 1px solid rgba(255,255,255,0.27);
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.44), ${p.x}px ${p.y}px ${p.blur}px var(--rl-lo);${rad(p.radius)} }`;
    },
  },
});

registerMove({
  id: 'clear-glass', libraryId: 'clear-glass', what: 'Material: see-through panel with a gradient rim, two corner tints and light edges; no blur. Rim and tint colours are params.', category: 'material', tier: 'generator',
  params: {
    ring:   num(1.5, [0, 4]),                       // px iridescent rim
    gloss:  { kind: 'bool', default: true },
    tintA:  { kind: 'colour', default: 'rgba(200,200,200,0.24)' },   // corner tints (top right)
    tintB:  { kind: 'colour', default: 'rgba(200,200,200,0.24)' },   // (bottom left)
    // the rim gradient, 125deg, six stops at 0 / 28 / 45 / 64 / 79 / 100%
    rim1: { kind: 'colour', default: '#ffffffdd' }, rim2: { kind: 'colour', default: '#ffffff55' },
    rim3: { kind: 'colour', default: '#cfcfcfaa' }, rim4: { kind: 'colour', default: '#bdbdbdcc' },
    rim5: { kind: 'colour', default: '#d9d9d9cc' }, rim6: { kind: 'colour', default: '#ffffffaa' },
    distance: num(6, [0, 14]), blur: num(20, [0, 40]),
  },
  material: {
    // See-through by design: no backdrop-filter / frost. The look is a rim, a wash and light edges.
    name: 'clear-glass',
    css(S, sel, p) {
      return `${sel} { position: relative; isolation: isolate; border: ${p.ring}px solid transparent;
  background: ${p.gloss ? 'linear-gradient(135deg, var(--rl-gloss), transparent 48%) padding-box, ' : ''}linear-gradient(var(--ab-canvas), var(--ab-canvas)) padding-box,
    linear-gradient(125deg, ${p.rim1} 0%, ${p.rim2} 28%, ${p.rim3} 45%, ${p.rim4} 64%, ${p.rim5} 79%, ${p.rim6}) border-box;
  box-shadow: inset 1px 1px 2px rgba(255,255,255,0.5), inset -1px -1px 2px rgba(255,255,255,0.15), ${p.distance}px ${Math.round(p.distance * 1.5)}px ${p.blur}px var(--rl-lo), -4px -4px 12px var(--rl-hi); }
${pseudo(sel, '::before')} { content: ""; position: absolute; inset: 0; z-index: -1; border-radius: inherit; pointer-events: none;
  background: radial-gradient(ellipse at 100% 0%, ${p.tintA}, transparent 45%), radial-gradient(ellipse at 0% 100%, ${p.tintB}, transparent 48%); }`;
    },
  },
});

registerMove({
  id: 'knob-switch', libraryId: 'switch-form', what: 'Material: switch with a recessed track and a lit knob that takes a role colour when on.', category: 'material', tier: 'generator',
  params: {
    distance: num(3, [0, 8]), blur: num(6, [0, 16]),
    off: { kind: 'enum', default: 'muted', options: ['muted', 'line', 'ink'] },
    on:  { kind: 'enum', default: 'primary', options: ['primary', 'secondary', 'accent', 'ink'] },
  },
  material: {
    name: 'knob-switch',
    css(S, sel, p, ctx) {
      const knob = f => `linear-gradient(145deg, rgba(255,255,255,0.7), rgba(255,255,255,0) 55%), ${fillOf(f)}`;
      const checked = ctx.ON.selected(sel);
      return `${sel} { background: var(--ab-canvas); box-shadow: ${insetSh(p.distance, p.blur)}; }
${pseudo(sel, '::before')} { background: ${knob(p.off)}; box-shadow: inset 1px 1px 2px rgba(255,255,255,0.7), 1px 2px 4px rgba(0,0,0,0.25); }
${checked} { background: var(--ab-canvas); }
${checked}::before { background: ${knob(p.on)}; box-shadow: inset 0 0 0 1.5px var(--rl-on-rim, transparent), inset 1px 1px 2px rgba(255,255,255,0.7), 1px 2px 4px rgba(0,0,0,0.25); }`;
    },
  },
});

registerMove({
  id: 'recessed-track-range', libraryId: null, what: 'Material: range slider with a recessed track filled in ink and a raised round thumb.', category: 'material', tier: 'generator',
  params: {
    track: num(8, [3, 16]), thumb: num(24, [12, 40]), fillAlpha: num(0.55, [0.1, 1]),
    distance: num(2, [0, 8]), blur: num(5, [0, 16]),
  },
  material: {
    name: 'recessed-track-range',
    css(S, sel, p) {
      const track = `height: ${p.track}px; border-radius: ${p.track / 2}px; box-shadow: ${insetSh(p.distance, p.blur)};
  background: linear-gradient(90deg, color-mix(in srgb, var(--ab-ink) ${Math.round(p.fillAlpha * 100)}%, var(--ab-canvas)) var(--v, 50%), var(--ab-canvas) var(--v, 50%));`;
      const thumb = `width: ${p.thumb}px; height: ${p.thumb}px; border: 0; border-radius: 50%; background: var(--ab-canvas); box-shadow: ${raisedSh(3, 7)}; transform: none;`;
      return `${sel} { height: ${p.thumb + 4}px; margin: 0; background: transparent; box-shadow: none; }
${pseudo(sel, '::-webkit-slider-runnable-track')} { ${track} }
${pseudo(sel, '::-webkit-slider-thumb')} { margin-top: ${Math.round((p.track - p.thumb) / 2)}px; ${thumb} }
${pseudo(sel, '::-moz-range-track')} { ${track} }
${pseudo(sel, '::-moz-range-thumb')} { ${thumb} }`;
    },
  },
});

registerMove({
  id: 'edge-cast', libraryId: null, what: 'Material: a canvas-coloured panel docked to one edge that throws a long soft shadow away from that edge, rounded on its free corners.', category: 'material', tier: 'generator',
  params: {
    edge: { kind: 'enum', default: 'left', options: ['left', 'right', 'top', 'bottom'] },   // the edge the panel is docked to
    radius: num(22, [0, 40]), blur: num(24, [0, 50]), spread: num(-12, [-30, 0]), reach: num(8, [0, 20]),
  },
  material: {
    name: 'edge-cast',
    css(S, sel, p) {
      const v = { left: [8, 0], right: [-8, 0], top: [0, -8], bottom: [0, 8] }[p.edge].map(n => n && Math.sign(n) * p.reach);
      const r = p.radius, rr = { left: `0 ${r}px ${r}px 0`, right: `${r}px 0 0 ${r}px`, top: `0 0 ${r}px ${r}px`, bottom: `${r}px ${r}px 0 0` }[p.edge];
      return `${sel} { background: var(--ab-canvas); border-color: transparent; border-radius: ${rr}; box-shadow: ${v[0]}px ${v[1]}px ${p.blur}px ${p.spread}px var(--rl-lo); }`;
    },
  },
});

registerMove({
  id: 'ink-scrim', libraryId: null, what: 'Material: a dimming layer that tints the page with a share of ink and optionally blurs what is behind it.', category: 'material', tier: 'recipe',
  params: { amount: num(24, [0, 80]), blur: num(3, [0, 16]) },   // % ink, px blur
  material: {
    name: 'ink-scrim',
    css(S, sel, p) {
      return `${sel} { background: color-mix(in srgb, var(--ab-ink) ${p.amount}%, transparent); ${p.blur ? `backdrop-filter: blur(${p.blur}px);` : 'backdrop-filter: none;'} }
@media (prefers-reduced-transparency: reduce) { ${sel} { backdrop-filter: none; } }`;
    },
  },
});

registerMove({
  id: 'lamp-label', libraryId: 'status-marker', what: 'Material: a small label that starts with a recessed round lamp dot, in the canvas colour.', category: 'material', tier: 'recipe',
  params: { dot: num(8, [4, 16]), gap: num(9, [2, 16]), tracking: num(0.14, [0, 0.4]), distance: num(1, [0, 4]), blur: num(2, [0, 8]) },
  material: {
    name: 'lamp-label',
    css(S, sel, p) {
      return `${sel} { display: inline-flex; align-items: center; gap: ${p.gap}px; letter-spacing: ${p.tracking}em; }
${pseudo(sel, '::before')} { content: ""; flex: none; width: ${p.dot}px; height: ${p.dot}px; border-radius: 50%; background: var(--ab-canvas); box-shadow: ${insetSh(p.distance, p.blur)}; }`;
    },
  },
});

registerMove({
  id: 'arc-ring', libraryId: null, what: 'Material: a loading ring: a raised, faint track with one ink arc that turns.', category: 'material', tier: 'recipe',
  params: { width: num(5, [2, 10]), arc: num(55, [10, 100]), track: num(10, [0, 50]), distance: num(2, [0, 6]), blur: num(5, [0, 12]) },   // % ink for the arc and the track
  material: {
    name: 'arc-ring',
    css(S, sel, p) {
      return `${sel} { background: none; -webkit-mask: none; mask: none; border: ${p.width}px solid color-mix(in srgb, var(--ab-ink) ${p.track}%, var(--ab-canvas));
  border-top-color: color-mix(in srgb, var(--ab-ink) ${p.arc}%, var(--ab-canvas)); border-radius: 50%; box-shadow: ${raisedSh(p.distance, p.blur).replace(/, inset[^,]*$/, '')}; }
@media (prefers-reduced-motion: reduce) { ${sel} { animation: none; } }`;
    },
  },
});

/* ---------------- states ---------------- */

registerMove({
  id: 'state-signature', libraryId: 'state-signature', what: 'State: a pressed control sinks, scales down and swaps its shadow to inset.', category: 'state', tier: 'recipe',
  params: {
    lift:  num(1, [0, 4]),        // px the part drops while pressed
    scale: num(0.99, [0.9, 1]),
    swap:  { kind: 'enum', default: 'inset-shadow', options: ['inset-shadow', 'inset-relief', 'none'] },
    depth: num(2, [0, 8]), blur: num(4, [0, 16]),
    transition: num(140, [0, 400]),   // ms
  },
  state: {
    name: 'state-signature',
    css(S, sel, p, ctx) {
      const sh = p.swap === 'none' ? '' : p.swap === 'inset-relief'
        ? ` box-shadow: ${insetSh(p.depth, p.blur + 2)};`
        : ` box-shadow: inset ${p.depth}px ${p.depth + 1}px ${p.blur}px var(--rl-lo);`;
      return `${sel} { transition: transform ${p.transition}ms, box-shadow ${p.transition}ms; }
${ctx.ON.press(sel)} { transform: translateY(${p.lift}px) scale(${p.scale});${sh} filter: none; }
@media (prefers-reduced-motion: reduce) { ${ctx.ON.press(sel)} { transform: none; } }`;
    },
  },
});

registerMove({
  id: 'selected-ink-relief', libraryId: 'ink-filled-selected', what: 'State: the selected item fills with ink and flips its text to the canvas colour.', category: 'state', tier: 'recipe',
  params: { weight: num(500, [300, 800]), radius: num(9, [0, 24]) },
  state: {
    name: 'selected-ink-relief',
    css(S, sel, p, ctx) {
      return `${sel} { border-radius: ${p.radius}px; transition: background 0.18s, color 0.18s; }
${ctx.ON.selected(sel)} { background: var(--ab-ink); color: var(--ab-canvas); font-weight: ${p.weight}; box-shadow: 2px 3px 5px var(--rl-lo); }`;
    },
  },
});

registerMove({
  id: 'selected-sink', libraryId: null, what: 'State: the selected item is pressed into the canvas with an inset shadow.', category: 'state', tier: 'recipe',
  params: { distance: num(3, [0, 8]), blur: num(6, [0, 16]) },
  state: {
    name: 'selected-sink',
    css(S, sel, p, ctx) {
      return `${ctx.ON.selected(sel)} { background: var(--ab-canvas); box-shadow: ${insetSh(p.distance, p.blur)}; }`;
    },
  },
});

registerMove({
  id: 'checked-glossy', libraryId: 'glossy', what: 'State: a checked control fills with the primary and a gloss wash.', category: 'state', tier: 'recipe',
  params: { gloss: num(0.2, [0, 0.6]) },
  state: {
    name: 'checked-glossy',
    css(S, sel, p, ctx) {
      return `${ctx.ON.selected(sel)} { background: ${GLOSS(p.gloss)}, var(--ab-primary); color: var(--ab-on-primary);
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.44), 1px 1px 3px var(--rl-lo); }`;
    },
  },
});

registerMove({
  id: 'app-raised', libraryId: 'kit-component-map', what: 'State: in the Built kit only, replaces a board look such as glass with plain raised relief.', category: 'state', tier: 'recipe',
  params: { distance: num(5, [0, 14]), blur: num(12, [0, 30]), radius: num(22, [0, 40]) },
  state: {
    // In the Built kit / phone screens only: swap a board-only look (e.g. glass) for plain raised relief.
    name: 'app-raised',
    css(S, sel, p) {
      const k = kitOnly(sel);
      if (!k) return '';
      return `${k} { border: 0 !important; border-radius: ${p.radius}px; background: var(--ab-canvas) !important; box-shadow: ${raisedSh(p.distance, p.blur)} !important; }
${pseudo(k, '::before')}, ${pseudo(k, '::after')} { content: none; }`;
    },
  },
});
registerMove({
  id: 'marked-relief', libraryId: 'state-signature', what: 'State: the current, open or active item (aria-current, aria-expanded, open, .is-on) sinks into the canvas, rises, or fills with ink.', category: 'state', tier: 'recipe',
  params: {
    look: { kind: 'enum', default: 'sink', options: ['sink', 'raise', 'ink'] },
    distance: num(3, [0, 8]), blur: num(6, [0, 16]), weight: num(600, [300, 800]),
  },
  state: {
    name: 'marked-relief',
    css(S, sel, p) {
      const m = `:is(${sel}):is([aria-current]:not([aria-current="false"]), [aria-expanded="true"], [open], .is-on, .is-sel, .is-open, .is-picked)`;
      const look = p.look === 'ink' ? `background: var(--ab-ink); color: var(--ab-canvas); box-shadow: 2px 3px 5px var(--rl-lo);`
        : p.look === 'raise' ? `background: var(--ab-canvas); box-shadow: ${raisedSh(p.distance, p.blur)};`
        : `background: var(--ab-canvas); box-shadow: ${insetSh(p.distance, p.blur)};`;
      return `${m} { ${look} font-weight: ${p.weight}; }`;
    },
  },
});
})();
