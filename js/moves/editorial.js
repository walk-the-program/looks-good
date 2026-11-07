/* Editorial moves: generic, parameterised "printed page" vocabulary (hairline rules, thick-over-thin
   frames, paper canvas, duotone plate generator, hanging drop cap, ruled lists with dotted leaders,
   underline fields and tabs). No style names, no copied stylesheet: values come from spec params.
   Contract: dev/move-lab/README.md. Loaded by dev/move-lab/lab.js (?movelab=1 only). */
(function () {
'use strict';

const num = (d, r) => ({ kind: 'number', default: d, range: r });
const bool = d => ({ kind: 'bool', default: d });
const txt = d => ({ kind: 'text', default: d });
const en = (d, o) => ({ kind: 'enum', default: d, options: o });
const ROLE = { ink: '--ab-ink', primary: '--ab-primary', accent: '--ab-accent', muted: '--ab-muted', line: '--ab-line', canvas: '--ab-canvas', secondary: '--ab-secondary' };
const ROLES = Object.keys(ROLE);
const rv = r => `var(${ROLE[r] || '--ab-ink'})`;
const H = 'var(--mv-hair)', HS = 'var(--mv-hair-soft)', HX = 'var(--mv-hair-strong)';
const KIT = S => `${S}.sb-ab.sb-kit`;
/* the kit half of a component selector list */
const kitSel = sel => sel.split(',\n').filter(s => s.includes('.sb-kit')).join(',\n');
const APP = S => `${S}:not(.sb-ab):not(.ab-slide)`;     // board only (no app screens, no deck slides)
const CAPS = (size, track, weight) => `font-family: var(--ab-font-label); font-size: ${size}px; font-weight: ${weight || 500}; letter-spacing: ${track}em; text-transform: uppercase;`;

/* ================= colour / token moves ================= */

registerMove({
  id: 'warm-paper-canvas', category: 'colour', tier: 'recipe',
  params: {
    cream: { kind: 'colour', default: '#f3ead9' },
    keep: num(0.74, [0, 1]),            // share of the base canvas kept; the rest is the cream
    warmDark: bool(false),
  },
  hooks: {
    canvas(p, ctx, base) {
      if (base.isDark && !p.warmDark) return null;
      return base.mix(base.canvas, p.cream, p.keep);
    },
  },
});

registerMove({
  id: 'outline-frame', category: 'structure', tier: 'recipe',
  params: {
    hair: num(0.30, [0, 1]), hairDark: num(0.26, [0, 1]),
    soft: num(0.16, [0, 1]), softDark: num(0.14, [0, 1]),
    columnRule: bool(true),          // vertical hairline before the second asymmetric column
  },
  tokens(t, p) {
    const d = t.isDark;
    return { '--mv-hair': t.alpha(t.ink, d ? p.hairDark : p.hair), '--mv-hair-soft': t.alpha(t.ink, d ? p.softDark : p.soft), '--mv-hair-strong': t.ink };
  },
  css(S, p) {
    return `${S} { border-radius: 0; }
${S} .ab-rule { background: ${H}; }
${S} .ab-labelrow { padding-bottom: 9px; margin-bottom: 18px; border-bottom: 1px solid ${H}; align-items: baseline; }
${S} .ab-foot { border-top: 1px solid ${HX}; }
${S} .ab-type-col { padding: 12px clamp(12px, 2cqw, 26px) 4px 0; border-top: 1px solid ${HX}; }
${S} .ab-type-col + .ab-type-col { padding-left: clamp(12px, 2cqw, 26px); border-left: 1px solid ${HS}; }
${S} .ab-type-foot { padding-top: 14px; border-top: 1px solid ${H}; margin-top: 16px; }
${S} .ab-states { border-top: 1px solid ${H}; }
${p.columnRule ? `${S} .ab-sec-touch { padding-left: clamp(16px, 2.4cqw, 28px); border-left: 1px solid ${H}; }` : ''}
@container ab (max-width: 600px) {
  ${S} .ab-type-col + .ab-type-col { padding-left: 0; border-left: 0; }
  ${S} .ab-type-col { padding-right: 0; }
  ${S} .ab-sec-touch { padding-left: 0; border-left: 0; }
}`;
  },
});

registerMove({
  id: 'state-colour-derivation', category: 'colour', tier: 'token',
  params: { pressMix: num(0.78, [0, 1]), hoverMix: num(0.88, [0, 1]) },
  tokens(t, p) {
    const press = t.mix(t.primary, '#000000', p.pressMix);
    return { '--mv-press': press, '--mv-on-press': t.readable(press), '--mv-hover': t.mix(t.ink, t.primary, p.hoverMix) };
  },
});

/* ================= generators ================= */

/* A duotone plate from the primary: gradient + halftone dot screen + grain + optional cropped initial.
   Fills the board's art slot with generic layers only (no copy, no captions). */
registerMove({
  id: 'duotone-plate', category: 'art', tier: 'generator',
  params: {
    inkMix: num(0.35, [0, 1]),          // share of primary kept against ink
    hiMix: num(0.3, [0, 1]), hiMixDark: num(0.4, [0, 1]),
    loMix: num(0.45, [0, 1]), loMixDark: num(0.25, [0, 1]),
    halftone: num(0.34, [0, 1]), halftoneDark: num(0.16, [0, 1]),
    dot: num(5, [2, 20]),
    grain: num(0.09, [0, 0.4]),
    initial: bool(true),
    initialTone: num(0.72, [0, 1]),     // share of plate colour in the initial, rest canvas
    frame: bool(true),
  },
  tokens(t, p) {
    const d = t.isDark, plate = t.mix(t.primary, t.ink, p.inkMix);
    return {
      '--mv-plate': plate,
      '--mv-plate-hi': d ? t.mix(plate, t.ink, p.hiMixDark) : t.mix(plate, t.canvas, p.hiMix),
      '--mv-plate-lo': d ? t.mix(plate, t.ink, p.loMixDark) : t.mix(plate, '#000000', p.loMix),
    };
  },
  hooks: {
    art(p, ctx, a) {
      const init = p.initial ? `<span class="mv-plate-initial">${escapeHtml(String((a && a.initial) || ''))}</span>` : '';
      return `<div class="mv-plate"><i class="mv-plate-halftone"></i><i class="mv-plate-grain"></i>${init}</div>`;
    },
  },
  css(S, p) {
    const grain = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 .9 0'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E\")";
    return `${S} .ab-art > .mv-plate { position: absolute; inset: 0; overflow: hidden; isolation: isolate; container-type: size;${p.frame ? ` border: 1px solid ${HX};` : ''}
  background: radial-gradient(90% 70% at 24% 14%, var(--mv-plate-hi), transparent 62%), linear-gradient(162deg, var(--mv-plate) 0%, var(--mv-plate-lo) 100%); }
${S} .mv-plate > i { position: absolute; inset: 0; z-index: 1; display: block; pointer-events: none; mix-blend-mode: multiply; }
${S} .mv-plate-halftone { opacity: ${p.halftone}; background-image: radial-gradient(circle at center, rgba(0,0,0,.75) .9px, transparent 1.3px); background-size: ${p.dot}px ${p.dot}px;
  -webkit-mask-image: linear-gradient(180deg, transparent 20%, #000 100%); mask-image: linear-gradient(180deg, transparent 20%, #000 100%); }
${SDsel(S)} .mv-plate-halftone { opacity: ${p.halftoneDark}; }
${S} .mv-plate-grain { opacity: ${p.grain}; background-image: ${grain}; }
${S} .mv-plate-initial { position: absolute; z-index: 2; left: -8%; bottom: -38%; font-family: var(--ab-font-h); font-weight: 400; font-size: 150cqh; line-height: 1;
  text-transform: uppercase; pointer-events: none; color: color-mix(in srgb, var(--mv-plate) ${Math.round(p.initialTone * 100)}%, var(--ab-canvas)); }`;
  },
});
function SDsel(S) { return `${S}[data-mode="dark"]`; }

/* First letter of a text block drops into the left margin. Board only, never app screens or slides. */
registerMove({
  id: 'hanging-drop-cap', category: 'type', tier: 'generator',
  params: {
    target: en('card-body', ['card-body', 'subcopy']),
    size: num(3.15, [1.5, 6]), lift: num(0.8, [0.6, 1.2]),
    measure: num(12.5, [0, 40]),       // em, 0 = full width
  },
  css(S, p) {
    const tg = p.target === 'subcopy' ? '.ab-subcopy' : '.ab-card-body';
    return `${APP(S)} ${tg}::first-letter { float: left; font-family: var(--ab-font-h); font-weight: 400; font-size: ${p.size}em; line-height: ${p.lift}; padding: 0.05em 0.09em 0 0; color: var(--ab-ink); }
${S} ${tg} { display: flow-root; }
${p.measure ? `${S} .ab-card-body { width: min(100%, ${p.measure}em); }` : ''}
${KIT(S)} .ab-card-body { width: auto; }`;
  },
});

/* ================= type / structure recipes ================= */

registerMove({
  id: 'display-weight-scale', category: 'type', tier: 'token',
  params: { weight: num(400, [100, 900]), size: num(0, [0, 80]) },
  css(S, p) {
    return `${S} :is(.ab-headline, .ab-brand, .ab-card-title, .ab-row-name, .sb-k-name, .sb-num) { font-weight: ${p.weight}; }`;
  },
});

registerMove({
  id: 'highlight-word', category: 'type', tier: 'recipe',
  params: {
    italic: bool(true), weight: num(400, [100, 900]),
    colour: en('accent-ink', ['accent-ink', 'accent', 'ink', 'primary']),
    band: bool(false),
  },
  css(S, p) {
    const c = p.colour === 'accent-ink' ? 'var(--ab-accent-ink)' : rv(p.colour);
    return `${S} .ab-hl { font-style: ${p.italic ? 'italic' : 'normal'}; font-weight: ${p.weight}; color: ${c};${p.band ? '' : ' background: none; padding: 0; margin: 0;'} }
${S}[data-accent-text="low"] .ab-hl { ${p.band ? '' : 'background-image: none; '}color: ${c}; }`;
  },
});

registerMove({
  id: 'mono-plus-accent', category: 'colour', tier: 'recipe',
  params: {
    kitAccent: en('ink', ['ink', 'accent']),     // what the accent becomes inside app screens
    kitSecondary: en('canvas', ['canvas', 'secondary']),
    tintMix: num(6, [0, 30]),                    // % ink in the kit's tinted surfaces
    markWord: bool(true),                        // accent-ink on the footer sign
    sign: txt('§'),
  },
  css(S, p) {
    const k = KIT(S);
    return `${k} { --ab-primary-text: var(--ab-ink) !important; --ab-pri-tint: color-mix(in srgb, var(--ab-ink) ${p.tintMix}%, var(--ab-canvas)) !important;
${p.kitAccent === 'ink' ? '  --ab-accent: var(--ab-ink) !important; --ab-on-accent: var(--ab-canvas) !important;' : ''}
${p.kitSecondary === 'canvas' ? '  --ab-secondary: var(--ab-canvas) !important; --ab-on-secondary: var(--ab-ink) !important;' : ''} }
${S} .ab-dot { width: auto; height: auto; margin-right: 9px; border-radius: 0; background: none; font-style: normal; }
${S} .ab-dot::before { content: "${p.sign}"; ${p.markWord ? 'color: var(--ab-accent-ink);' : ''} font-family: var(--ab-font-h); font-size: 15px; line-height: 1; }`;
  },
});

registerMove({
  id: 'catalogue-number', category: 'structure', tier: 'recipe',
  params: {
    dateline: txt('Vol. 01 · No. 1'),
    datelineSize: num(10.5, [8, 16]), tracking: num(0.16, [0, 0.4]),
    cellPrefix: txt('No. '),             // kit cells are numbered per group; '' disables
  },
  css(S, p) {
    const k = KIT(S);
    return `${S} .ab-head::before { content: "${p.dateline}"; font-size: ${p.datelineSize}px; letter-spacing: ${p.tracking}em; text-transform: uppercase; color: var(--ab-muted); }
@container ab (max-width: 600px) { ${S} .ab-head::before { display: none; } }
${p.cellPrefix ? `${k} .sb-k-group { counter-reset: mvk; }
${k} .sb-k-cell { counter-increment: mvk; }
${k} .sb-k-cell-h::before { content: "${p.cellPrefix}" counter(mvk, decimal-leading-zero); font: italic 400 13px/1 var(--ab-font-h); letter-spacing: 0.04em; color: var(--ab-muted); }` : ''}`;
  },
});

registerMove({
  id: 'section-number-marker', category: 'type', tier: 'recipe',
  params: { size: num(17, [10, 40]), joiner: txt(' — ') },
  css(S, p) {
    return `${S} .ab-n { font-family: var(--ab-font-h); font-style: italic; font-size: ${p.size}px; letter-spacing: 0; text-transform: none; color: var(--ab-ink); }
${S} .ab-n::after { content: "${p.joiner}"; color: var(--ab-muted); font-style: normal; }
${S} :is(.ab-sec-ui, .ab-sec-touch, .ab-sec-use) .ab-label > span:not(.ab-n) { color: var(--ab-ink); }`;
  },
});

registerMove({
  id: 'face-role-map', category: 'type', tier: 'recipe',
  params: { italicSize: num(13, [10, 24]), fieldSize: num(24, [14, 40]), numeral: num(15, [10, 30]) },
  css(S, p) {
    const k = KIT(S);
    return `${S} .ab-type-class { font-style: italic; font-size: ${p.italicSize}px; margin: 2px 0 12px !important; }
${S} .ab-type-why { font-style: italic; font-size: 14px; }
${S} .ab-type-cur b { font-weight: 400; font-style: italic; }
${S} .ab-status { margin-top: 8px; font-family: var(--ab-font-b); font-style: italic; font-size: 13px; }
${S} .ab-row-n { font-family: var(--ab-font-h); font-style: italic; font-size: ${p.numeral}px; color: var(--ab-muted); }
${S} .ab-row-pct { font-family: var(--ab-font-h); font-style: italic; font-size: 17px; }
${S} .ab-motto { font-family: var(--ab-font-b); font-style: italic; font-size: 14px; letter-spacing: 0; text-transform: none; color: var(--ab-ink); }
${S} .ab-type-k { font-weight: 600; letter-spacing: 0.18em; }
${S} .ab-type-role { font-weight: 600; color: var(--ab-ink); letter-spacing: 0.18em; font-size: 10.5px; }
${k} .sb-k-use { font-family: var(--ab-font-b); font-style: italic; font-size: 14px; line-height: 19px; color: var(--ab-muted); }
${k} .sb-k-slabel { font: italic 400 14px/1.2 var(--ab-font-h); letter-spacing: 0; text-transform: none; color: var(--ab-muted); }
${k} .sb-k-slabel::before { content: "\\2014\\00a0"; }
${k} .sb-k-type-meta { font: italic 400 15px/1.2 var(--ab-font-h); }
${k} .sb-k-sizes { font: italic 400 14px/1.4 var(--ab-font-h); }
${k} .sb-k-gl-term b { font: italic 400 17px/1.2 var(--ab-font-h); }
${k} .sb-k-layouts .sb-k-layout-cap { font: italic 400 15px/1.2 var(--ab-font-h); }`;
  },
});

registerMove({
  id: 'double-rule', category: 'structure', tier: 'recipe',
  params: { top: num(3, [1, 8]), bottom: num(1, [0, 4]), colour: en('ink', ROLES) },
  css(S, p) {
    const c = rv(p.colour), h = p.top + p.bottom + 3;
    return `${S} .ab-head + .ab-rule { height: ${h}px; background: linear-gradient(${c}, ${c}) 0 0 / 100% ${p.top}px no-repeat, linear-gradient(${c}, ${c}) 0 100% / 100% ${p.bottom}px no-repeat; }
${KIT(S)} .sb-k-divider { border-top: ${p.top}px solid ${c}; }`;
  },
});

registerMove({
  id: 'header-treatment', category: 'structure', tier: 'recipe',
  params: { wordmark: num(0.05, [0, 0.3]), hideMark: bool(true), centered: bool(true) },
  css(S, p) {
    return `${S} .ab-in { padding-top: clamp(16px, 2.4cqw, 28px); }
${S} .ab-head { display: grid; grid-template-columns: ${p.centered ? '1fr auto 1fr' : 'auto 1fr'}; align-items: end; gap: 16px; padding-bottom: clamp(10px, 1.6cqw, 16px); }
${S} .ab-brand { justify-self: center; font-weight: 400; text-transform: uppercase; letter-spacing: ${p.wordmark}em; font-size: clamp(20px, 3cqw, 34px); line-height: 1; }
${p.hideMark ? `${S} .ab-mark { display: none; }` : ''}
${S} .ab-logo { max-height: 38px; }
${S} .ab-tag { font-size: 10.5px; letter-spacing: 0.16em; }
@container ab (max-width: 600px) { ${S} .ab-head { display: flex; align-items: center; } ${S} .ab-brand { font-size: 16px; } }
${KIT(S)} .sb-lnav { grid-template-columns: 1fr auto 1fr; align-items: center; }
${KIT(S)} .sb-lnav::before { display: none; }
${KIT(S)} .sb-lnav .sb-links { grid-column: 1; grid-row: 1; justify-self: start; }
${KIT(S)} .sb-lnav .ab-brand { grid-column: 2; grid-row: 1; }
${KIT(S)} .sb-lnav .sb-signin { grid-column: 3; grid-row: 1; justify-self: end; width: auto; }`;
  },
});

registerMove({
  id: 'hero-layout', category: 'layout', tier: 'recipe',
  params: {
    plateMin: num(190, [100, 400]), plateVw: num(29, [10, 50]), plateMax: num(370, [200, 700]),
    gap: num(4.4, [1, 10]), aspect: txt('3 / 4.15'),
    headlineVw: num(11.5, [5, 20]), leading: num(0.94, [0.8, 1.3]), tracking: num(-0.028, [-0.1, 0.02]),
    kickerRule: bool(true), subRule: bool(true),
  },
  css(S, p) {
    const P = `${S}[data-hero="poster"]`;
    const hl = `calc(clamp(44px, ${p.headlineVw}cqw, 160px) * var(--ab-hl-scale, 1) * var(--ab-hs, 1) * var(--ab-display, 1))`;
    return `${S} { --mv-plate-w: clamp(${p.plateMin}px, ${p.plateVw}cqw, ${p.plateMax}px); }
${P} .ab-hero { display: grid; grid-template-columns: minmax(0, 1fr) var(--mv-plate-w); column-gap: clamp(24px, ${p.gap}cqw, 60px); row-gap: 0; align-items: start; padding: clamp(26px, 4.4cqw, 56px) 0 clamp(30px, 4.6cqw, 58px); }
${P} .ab-hero-copy { display: contents; }
${S} .ab-hero-copy { max-width: 64cqw; }
${S} .ab-kicker { grid-column: 1; grid-row: 1; display: flex; align-items: center; gap: 14px; margin-bottom: clamp(14px, 2.2cqw, 26px) !important; font-size: 11px; font-weight: 500; letter-spacing: 0.22em; color: var(--ab-ink); }
${p.kickerRule ? `${S} .ab-kicker::after { content: ""; flex: 1; height: 1px; background: ${H}; }` : ''}
${KIT(S)} .sb-top .ab-kicker::after { display: none; }
${P} .ab-headline { grid-column: 1; grid-row: 2; font-size: ${hl}; line-height: ${p.leading}; letter-spacing: ${p.tracking}em; text-wrap: balance; overflow-wrap: normal; hyphens: manual; }
${S} .ab-subcopy { grid-column: 1; grid-row: 3; align-self: end; margin: clamp(22px, 3.4cqw, 42px) 0 0 !important; ${p.subRule ? `padding-top: clamp(12px, 1.8cqw, 20px); border-top: 1px solid ${H};` : ''} font-size: clamp(16px, 2cqw, 23px); line-height: 1.38; color: var(--ab-ink); max-width: 30em; }
${S} .ab-sub-lead { color: var(--ab-ink); } ${S} .ab-sub-rest { color: var(--ab-muted); }
${P} .ab-art { grid-column: 2; grid-row: 1 / span 3; position: relative; right: auto; bottom: auto; justify-self: end; align-self: start; width: 100%; max-width: none; aspect-ratio: ${p.aspect}; }
@container ab (max-width: 600px) {
  ${P} .ab-hero { grid-template-columns: minmax(0, 1fr); padding: 22px 0 26px; }
  ${P} .ab-headline { font-size: calc(clamp(44px, 17cqw, 78px) * var(--ab-hl-scale, 1) * var(--ab-hs, 1) * var(--ab-display, 1)); }
  ${S} .ab-subcopy { border-top: 0; padding-top: 0; margin-top: 18px !important; font-size: 16px; }
  ${P} .ab-art { grid-column: 1; grid-row: 4; justify-self: stretch; margin: 26px 0 0; aspect-ratio: 4 / 4.6; }
}`;
  },
});

registerMove({
  id: 'palette-board-form', category: 'layout', tier: 'recipe',
  params: { cols: num(5, [2, 8]), chip: num(18, [10, 40]) },
  css(S, p) {
    const W = `${S} .ab-swatches[data-kind="chips"]`;
    return `${W} { display: grid; grid-template-columns: repeat(${p.cols}, minmax(0, 1fr)); gap: 0; border-top: 1px solid ${HX}; border-bottom: 1px solid ${H}; }
${W} .ab-swatch { display: grid; grid-template-columns: ${p.chip}px minmax(0, 1fr); align-items: center; gap: 1px 10px; padding: 14px 10px 14px 16px; border: 0; border-radius: 0; border-left: 1px solid ${HS}; }
${W} .ab-swatch:first-child { border-left: 0; padding-left: 0; }
${W} .ab-chip { grid-row: 1 / span 2; width: ${p.chip}px; height: ${p.chip}px; border-radius: 0; box-shadow: 0 0 0 1px ${HX}; }
${W} .ab-sw-role { font-family: var(--ab-font-label); font-size: 10.5px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; }
${W} .ab-sw-hex { font-size: 11px; font-variant-numeric: tabular-nums; }
@container ab (max-width: 600px) {
  ${W} { grid-template-columns: minmax(0, 1fr); }
  ${W} .ab-swatch { padding: 10px 0; border-left: 0; border-top: 1px solid ${HS}; }
  ${W} .ab-swatch:first-child { border-top: 0; }
}`;
  },
});

registerMove({
  id: 'ruled-row-list', category: 'structure', tier: 'recipe',
  params: { counterStarts: txt('12,24,38'), leader: en('dotted', ['dotted', 'dashed', 'solid']) },
  css(S, p) {
    const st = p.counterStarts.split(',').map(s => parseInt(s, 10) || 0);
    const roles = ['heading', 'body', 'mono'];
    const k = KIT(S);
    return `${S} .ab-list { border-top: 1px solid ${HX}; }
${S} .ab-row { grid-template-columns: 3.4ch auto minmax(20px, 1fr) auto 5ch; align-items: baseline; gap: 0 clamp(8px, 1.4cqw, 14px); padding: clamp(11px, 1.5cqw, 16px) 0; border-top: 1px solid ${HS}; }
${S} .ab-row:first-child { border-top: 0; } ${S} .ab-row:last-child { border-bottom: 1px solid ${H}; }
${S} .ab-row-name { grid-column: 2; font-family: var(--ab-font-h); font-size: clamp(19px, 2.3cqw, 26px); line-height: 1.1; letter-spacing: -0.01em; overflow: visible; }
${S} .ab-row-bar { grid-column: 3; grid-row: 1; display: block; align-self: end; height: 0; margin-bottom: 0.3em; border-bottom: 1px ${p.leader} ${HX}; border-radius: 0; background: none; }
${S} .ab-row-bar i { display: none; }
${S} .ab-row-status { grid-column: 4; grid-row: 1; padding: 0; background: none; border-radius: 0; font-family: var(--ab-font-label); font-size: 10.5px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ab-muted); }
${S} .ab-row-pct { grid-column: 5; grid-row: 1; }
${S} .ab-type-grid { gap: 0; } ${S} .ab-type-picks { gap: 0; }
${roles.map((r, i) => `${S} .ab-type-col[data-role="${r}"] .ab-type-picks { counter-reset: mvp ${st[i] || 0}; }`).join('\n')}
${S} .ab-type-pick { display: flex; align-items: baseline; gap: 6px; padding: 5px 0; counter-increment: mvp; font-size: clamp(16px, 1.9cqw, 21px); line-height: 1.2; }
${S} .ab-type-pick::after { content: ""; order: 2; flex: 1; min-width: 14px; border-bottom: 1px ${p.leader} ${H}; transform: translateY(-0.2em); }
${S} .ab-type-pick::before { content: counter(mvp); order: 3; font: 500 11px/1 var(--ab-font-ui); font-variant-numeric: tabular-nums; letter-spacing: 0.04em; color: var(--ab-muted); }
${S} .ab-type-fit { margin-top: 10px !important; }
@container ab (max-width: 600px) {
  ${S} .ab-row { grid-template-columns: minmax(0, auto) minmax(14px, 1fr) auto auto; }
  ${S} .ab-row-n { display: none; } ${S} .ab-row-name { grid-column: 1; } ${S} .ab-row-bar { grid-column: 2; } ${S} .ab-row-status { grid-column: 3; } ${S} .ab-row-pct { grid-column: 4; }
}
@container ab (max-width: 360px) {
  ${S} .ab-row { grid-template-columns: minmax(0, 1fr) auto auto; }
  ${S} .ab-row-bar { display: none; } ${S} .ab-row-status { grid-column: 2; } ${S} .ab-row-pct { grid-column: 3; }
}
${k} .sb-k-type-row { border-bottom: 1px ${p.leader} ${HX}; }
${k} .sb-k-swatch { padding: 12px 0; border-bottom: 1px ${p.leader} ${HX}; font: italic 400 17px/1.2 var(--ab-font-h); }
${k} .sb-k-swatch > span:not(.sb-k-chip) { font: 400 13px/1.3 var(--ab-font-b); }`;
  },
});

registerMove({
  id: 'field-form', category: 'structure', tier: 'recipe',
  params: { labelTrack: num(0.18, [0, 0.4]), value: num(24, [12, 40]), focus: en('primary', ['primary', 'ink']) },
  css(S, p) {
    const f = p.focus === 'ink' ? 'var(--ab-ink)' : 'var(--ab-primary)';
    return `${S} .ab-fieldlabel { ${CAPS(10.5, p.labelTrack, 600)} color: var(--ab-ink); margin-bottom: 4px; }
${S} .ab-toggle { padding: 10px 0; border-top: 1px solid ${HS}; border-bottom: 1px solid ${HS}; ${CAPS(11, 0.16, 500)} }
${KIT(S)} .ab-toggle.sb-tog { font-family: var(--ab-font-ui); font-weight: 400; letter-spacing: 0; text-transform: none; }
${S} .ab-states { margin-top: 20px; gap: 0; padding-top: 16px; }
${S} .ab-state { font-family: var(--ab-font-label); font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; }
${S} .ab-states .ab-state-ctl { padding: 10px 8px; font-size: 10.5px; letter-spacing: 0.16em; border-radius: 0; background: var(--ab-primary); color: var(--ab-on-primary); }
${S} .ab-states .ab-state-ctl.is-hover { background: var(--ab-ink); color: var(--ab-canvas); }
${S} .ab-states .ab-state-ctl.is-pressed { background: var(--mv-press); color: var(--mv-on-press); transform: translateY(1px); }
${S} .ab-input:focus { border-bottom-color: ${f}; box-shadow: 0 1px 0 ${f}; }
${S} .ab-cta-arrow::before { content: "\\2192"; font-size: 15px; letter-spacing: 0; }
${S} .ab-card-title { margin: clamp(20px, 3cqw, 32px) 0 12px !important; font-size: clamp(28px, 3.6cqw, 42px); line-height: 1.02; letter-spacing: -0.02em; }
${S} .ab-card-body { font-size: 17px; line-height: 1.4; color: var(--ab-ink); margin-bottom: 24px !important; }
${S} .ab-type-apply:hover { background: var(--ab-ink); color: var(--ab-canvas); }
${S} .ab-fit { padding: 2px 8px; border-radius: 0; font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; border: 1px solid ${H}; color: var(--ab-ink); background: none; }
${S} .ab-fit[data-fit="match"] { border-color: var(--ab-ink); background: none; }
${S} .ab-fit[data-fit="avoid"] { background: var(--ab-ink); border-color: var(--ab-ink); color: var(--ab-canvas); }
${KIT(S)} .ab-fit { display: inline-flex; align-items: center; min-height: 22px; padding: 0 9px; font-size: var(--k-caption, 12px); }
${S} .ab-sections { column-gap: clamp(16px, 2.4cqw, 28px); }
${S} .ab-type-pair { font-size: 11px; letter-spacing: 0.04em; }
${S} .ab-sec-ui .ab-card-title { margin-top: clamp(20px, 3cqw, 32px); }`;
  },
});

registerMove({
  id: 'footer-treatment', category: 'structure', tier: 'recipe',
  params: { size: num(11, [8, 16]), tracking: num(0.12, [0, 0.4]) },
  css(S, p) { return `${S} .ab-foot { font-size: ${p.size}px; letter-spacing: ${p.tracking}em; text-transform: uppercase; }`; },
});

/* Kit page chrome: cells become numbered plates between a thick rule and a hairline; no boxes. */
registerMove({
  id: 'kit-cell-frame', category: 'structure', tier: 'recipe',
  params: { top: num(3, [1, 8]), name: num(24, [14, 40]), gap: num(20, [8, 40]) },
  css(S, p) {
    const k = KIT(S);
    return `${k} .sb-k-grid { gap: clamp(28px, 4cqw, 44px) clamp(24px, 3.4cqw, 40px); }
${k} .sb-k-cell { gap: ${p.gap}px; padding: 14px 0 24px; border: 0; border-top: ${p.top}px solid ${HX}; border-bottom: 1px solid ${H}; border-radius: 0; background: none; }
${k} .sb-k-cell-h { gap: 6px; }
${k} .sb-k-name { font-family: var(--ab-font-h); font-weight: 400; font-size: ${p.name}px; line-height: ${p.name + 4}px; letter-spacing: -0.015em; }
${k} .sb-k-ios { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 14px; margin: 4px 0 0 !important; }
${k} .sb-k-ios .sb-k-ios-tag { padding: 0 0 2px; border: 0; border-bottom: 1px solid var(--ab-ink); border-radius: 0; background: none; font: 600 10px/1.2 var(--ab-font-label); letter-spacing: 0.2em; text-transform: uppercase; color: var(--ab-ink); }
${k} .sb-k-ios[data-ios="native"] .sb-k-ios-tag:not(.sb-k-web-tag) { border-bottom-width: 3px; }
${k} .sb-k-ios .sb-k-ios-tag.sb-k-web-tag { border-bottom-style: dotted; color: var(--ab-muted); }
${k} .sb-k-ios code { font-family: var(--ab-font-b); font-style: italic; font-size: 13px; }
${k} .sb-k-typescale { border-top: ${p.top}px solid ${HX}; }
${k} .sb-k-swatches { gap: 0 24px; border-top: ${p.top}px solid ${HX}; }
${k} :is(.sb-k-ico, .sb-k-emptyico) { border-radius: 0; background: none; color: var(--ab-ink); box-shadow: inset 0 0 0 1px ${H}; }
${k} .sb-k-ph { border-radius: 0; background: color-mix(in srgb, var(--ab-ink) 6%, var(--ab-canvas)); color: var(--ab-ink); box-shadow: inset 0 0 0 1px ${H}; }
${k} .sb-k-lightbox { border-radius: 0; }
${k} .sb-k-lightbox .sb-k-lb-img.sb-k-ph { background: color-mix(in srgb, var(--ab-canvas) 14%, var(--ab-ink)); color: var(--ab-canvas); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ab-canvas) 45%, transparent); }
${k} .sb-k-lightbox .sb-k-plain { border-radius: 0; box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ab-canvas) 55%, transparent); }
${k} .sb-tabs { border: 0; border-top: ${p.top}px solid ${HX}; border-bottom: 1px solid ${HX}; border-radius: 0; box-shadow: none; }
${k} .sb-k-tb-title { font-family: var(--ab-font-h); font-weight: 400; text-transform: uppercase; letter-spacing: 0.05em; }
${k} .sb-tab[aria-current]::before { border-radius: 0; height: 2px; background: var(--ab-ink); }
${k} .sb-dots i { border-radius: 0; width: 6px; height: 6px; } ${k} .sb-dots i.is-on { width: 18px; }
${k} .sb-k-gl-row { border-color: ${HX}; border-radius: 0; }
${k} :is(.sb-k-cmdmenu, .sb-k-listbox, .sb-k-combo .sb-k-menu) li:not(.sb-k-menu-sep) + li:not(.sb-k-menu-sep) { border-top: 1px dotted ${H}; }
${k} :is(.sb-k-cmdmenu, .sb-k-listbox, .sb-k-combo .sb-k-menu) li[aria-selected="true"] { box-shadow: inset 2px 0 0 var(--ab-ink); }
${k} .sb-k-cmdmenu li.is-open { background: var(--ab-ink); color: var(--ab-canvas); box-shadow: none; }
${k} .sb-k-kbd { padding: 0 6px; font-family: var(--ab-font-label); letter-spacing: 0.08em; text-transform: uppercase; box-shadow: inset 0 0 0 1px ${H}; }
${k} .sb-side { background: none; border-right: 1px solid ${HX}; }
${k} .sb-navi { border-radius: 0; padding-left: 0; font-size: 11.5px; letter-spacing: 0.16em; text-transform: uppercase; }
${k} .sb-navi[aria-current] { background: none; box-shadow: none; font-weight: 600; text-decoration: underline; text-decoration-color: var(--ab-primary); text-decoration-thickness: 2px; text-underline-offset: 7px; }
${k} .sb-stats { gap: 0; border-top: 1px solid ${HX}; border-bottom: 1px solid ${H}; padding: 4px 0; }
${k} .sb-stat + .sb-stat { border-left: 1px solid ${H}; }
${k} .sb-stat:first-child { padding-left: 0; }
${k} .ab-card.sb-chart { padding-right: clamp(18px, 2.6cqw, 32px); border-right: 1px solid ${H}; }`;
  },
});

registerMove({
  id: 'focus-ring', category: 'state', tier: 'recipe',
  params: { width: num(2, [1, 4]), offset: num(3, [0, 8]), colour: en('ink', ROLES) },
  css(S, p) { return `${KIT(S)} { --sb-focus: ${rv(p.colour)}; --sb-focus-offset: ${p.offset}px; --k-r: 0px; }`; },
  state: {
    name: 'focus-outline',
    css(S, sel, p, ctx) { return `${ctx.ON.focus(sel)} { outline: ${p.width}px solid ${rv(p.colour)}; outline-offset: ${p.offset}px; }`; },
  },
});

/* ================= materials ================= */

registerMove({
  id: 'flat-paper', category: 'material', tier: 'recipe',
  params: { fill: en('none', ['none', 'canvas']), padded: bool(false) },
  material: {
    name: 'flat-paper',
    css(S, sel, p) {
      return `${sel} { ${p.padded ? '' : 'padding: 0; '}border: 0; border-radius: 0; background: ${p.fill === 'canvas' ? 'var(--ab-canvas)' : 'none'}; box-shadow: none; }
${kitSel(sel).split(',\n').filter(Boolean).map(s => s + ':is(.sb-k-card, .sb-home-card)').join(',\n') || 'x-none'} { padding-left: 0 !important; padding-right: 0 !important; padding-bottom: 0 !important; }`;
    },
  },
});

/* A ruled key: square, caps-tracked; filled with a role or just ruled. */
registerMove({
  id: 'ruled-key', category: 'material', tier: 'recipe',
  params: {
    fill: en('primary', ['primary', 'none']),
    colour: en('ink', ['ink', 'primary', 'danger']),
    top: num(3, [0, 6]), bottom: num(1, [0, 4]),
    kitOnlyRule: bool(true),                  // the rule pair only in app screens
    size: num(11.5, [9, 16]), tracking: num(0.18, [0, 0.4]), weight: num(600, [300, 800]),
    kitSize: num(15, [11, 20]), kitTracking: num(0.14, [0, 0.4]),
    padY: num(15, [4, 24]), padX: num(18, [4, 40]),
  },
  material: {
    name: 'ruled-key',
    css(S, sel, p) {
      const c = p.colour === 'danger' ? 'var(--sb-danger)' : rv(p.colour);
      const base = `border-radius: 0; box-shadow: none; text-transform: uppercase; font-weight: ${p.weight};`;
      const fill = p.fill === 'primary' ? 'background: var(--ab-primary); color: var(--ab-on-primary);' : `background: none; color: ${p.colour === 'danger' ? 'var(--sb-danger-text, var(--sb-danger))' : 'var(--ab-ink)'};`;
      const rule = `box-sizing: border-box; border: 0; border-top: ${p.top}px solid ${c}; border-bottom: ${p.bottom}px solid ${c};`;
      return `${sel} { ${base} ${fill} padding: ${p.padY}px ${p.padX}px; font-size: ${p.size}px; letter-spacing: ${p.tracking}em; ${p.kitOnlyRule ? 'border: 0;' : rule} transition: background .15s, color .15s, transform .1s; }
${kitSel(sel) || '.mv-none'} { ${rule} font-size: ${p.kitSize}px !important; letter-spacing: ${p.kitTracking}em; }`;
    },
  },
});

registerMove({
  id: 'quiet-text', category: 'material', tier: 'recipe',
  params: { size: num(15, [11, 20]), tracking: num(0.14, [0, 0.4]) },
  material: {
    name: 'quiet-text',
    css(S, sel, p) { return `${sel} { background: none; box-shadow: none; border-radius: 0; color: var(--ab-ink); font-size: ${p.size}px; letter-spacing: ${p.tracking}em; text-transform: uppercase; }`; },
  },
});

registerMove({
  id: 'underline-field', category: 'material', tier: 'recipe',
  params: { italic: bool(true), size: num(24, [12, 40]), rule: en('strong', ['strong', 'hair']), pad: num(8, [0, 20]) },
  material: {
    name: 'underline-field',
    css(S, sel, p) {
      return `${sel} { padding: ${p.pad}px 0 ${p.pad + 1}px; border: 0; border-bottom: 1px solid ${p.rule === 'strong' ? HX : H}; border-radius: 0; background: none; box-shadow: none;
  ${p.italic ? 'font-family: var(--ab-font-h); font-style: italic;' : ''} font-size: ${p.size}px; line-height: 1.2; transition: border-color .15s, box-shadow .15s; }`;
    },
  },
});

registerMove({
  id: 'underline-focus', category: 'state', tier: 'recipe',
  params: { colour: en('ink', ROLES), thickness: num(1, [1, 3]) },
  state: {
    name: 'underline-focus',
    css(S, sel, p, ctx) {
      return `${ctx.ON.focus(sel)} { border-bottom-color: ${rv(p.colour)} !important; box-shadow: 0 ${p.thickness}px 0 ${rv(p.colour)} !important; outline: none; }
:is(${sel}):focus-within { border-bottom-color: ${rv(p.colour)}; }`;
    },
  },
});

registerMove({
  id: 'slug-switch', category: 'material', tier: 'recipe',
  params: {
    w: num(40, [20, 80]), h: num(18, [10, 40]), slug: num(12, [6, 30]),
    onFill: en('primary', ['primary', 'ink']), kitOnFill: en('ink', ['primary', 'ink']),
    kitW: num(48, [20, 80]), kitH: num(24, [10, 40]), kitSlug: num(16, [6, 30]),
  },
  material: {
    name: 'slug-switch',
    css(S, sel, p, ctx) {
      const dims = (w, h, s, on, onc) => `width: ${w}px; height: ${h}px; `;
      const ps = (s, h) => (h - s) / 2;
      const on = f => f === 'ink' ? ['var(--ab-ink)', 'var(--ab-canvas)'] : ['var(--ab-primary)', 'var(--ab-on-primary)'];
      const [bo, bk] = on(p.onFill), [ko, kk] = on(p.kitOnFill);
      const k = kitSel(sel) || '.mv-none';
      const chk = s => `:is(${s}):checked`;
      return `${sel} { width: ${p.w}px; height: ${p.h}px; border-radius: 0; background: none; box-shadow: inset 0 0 0 1px ${HX}; transition: background .15s; }
${sel.split(',\n').map(s => `${s}::before`).join(',\n')} { left: ${ps(p.slug, p.h)}px; top: ${ps(p.slug, p.h)}px; width: ${p.slug}px; height: ${p.slug}px; border-radius: 0; background: var(--ab-ink); transition: transform .15s, background .15s; }
${chk(sel)} { background: ${bo}; box-shadow: inset 0 0 0 1px ${bo}; }
${sel.split(',\n').map(s => `${s}:checked::before`).join(',\n')} { transform: translateX(${p.w - p.slug - 2 * ps(p.slug, p.h)}px); background: ${bk}; }
${k} { width: ${p.kitW}px; height: ${p.kitH}px; }
${k.split(',\n').map(s => `${s}::before`).join(',\n')} { left: ${ps(p.kitSlug, p.kitH)}px; top: ${ps(p.kitSlug, p.kitH)}px; width: ${p.kitSlug}px; height: ${p.kitSlug}px; }
${chk(k)} { background: ${ko}; box-shadow: inset 0 0 0 1px ${ko}; }
${k.split(',\n').map(s => `${s}:checked::before`).join(',\n')} { transform: translateX(${p.kitW - p.kitSlug - 2 * ps(p.kitSlug, p.kitH)}px); background: ${kk}; }`;
    },
  },
});

registerMove({
  id: 'ink-mark', category: 'material', tier: 'recipe',
  params: { size: num(22, [12, 40]), round: bool(false), ring: num(1, [1, 3]), bullet: num(8, [0, 20]) },
  material: {
    name: 'ink-mark',
    css(S, sel, p) {
      const r = p.round ? '50%' : '0';
      return `${sel} { width: ${p.size}px; height: ${p.size}px; border-radius: ${r}; border: ${p.ring}px solid var(--ab-ink); background: none; box-shadow: none; }
${sel.split(',\n').map(s => `${s}:checked`).join(',\n')} { background: ${p.round ? 'none' : 'var(--ab-ink)'}; border-color: var(--ab-ink); }
${p.round ? sel.split(',\n').map(s => `${s}:checked::after`).join(',\n') + ` { background: var(--ab-ink); width: ${p.bullet}px; height: ${p.bullet}px; border-radius: 50%; border: 0; }` : sel.split(',\n').map(s => `${s}:checked::after`).join(',\n') + ' { border-color: var(--ab-canvas); }'}`;
    },
  },
});

registerMove({
  id: 'rule-slider', category: 'material', tier: 'recipe',
  params: { track: num(2, [1, 6]), thumb: num(18, [8, 30]) },
  material: {
    name: 'rule-slider',
    css(S, sel, p) {
      const tr = `height: ${p.track}px; border-radius: 0; background: linear-gradient(90deg, var(--ab-ink) var(--v, 50%), ${H} var(--v, 50%));`;
      const th = `width: ${p.thumb}px; height: ${p.thumb}px; border-radius: 0; border: 1px solid var(--ab-ink); background: var(--ab-canvas); box-shadow: none;`;
      const P = (pseudo) => sel.split(',\n').map(s => `${s}${pseudo}`).join(',\n');
      return `${P('::-webkit-slider-runnable-track')} { ${tr} }
${P('::-webkit-slider-thumb')} { ${th} margin-top: ${-(p.thumb - p.track) / 2}px; }
${P('::-moz-range-track')} { ${tr} }
${P('::-moz-range-thumb')} { ${th} }`;
    },
  },
});

registerMove({
  id: 'underline-tab', category: 'material', tier: 'recipe',
  params: { gap: num(26, [4, 60]), size: num(11, [8, 16]), tracking: num(0.16, [0, 0.4]), kitSize: num(13, [9, 18]), kitTracking: num(0.14, [0, 0.4]) },
  material: {
    name: 'underline-tab',
    css(S, sel, p) {
      return `${p.gap ? `${S} .ab-seg { gap: ${p.gap}px; padding: 0; border-radius: 0; background: none; border-bottom: 1px solid ${H}; }` : ''}
${sel} { flex: 0 0 auto; min-height: 0; padding: 0 0 10px; margin-bottom: -1px; border-radius: 0; background: none; box-shadow: none; border-bottom: 2px solid transparent; font-size: ${p.size}px; font-weight: 500; letter-spacing: ${p.tracking}em; text-transform: uppercase; color: var(--ab-muted); transition: color .15s, border-color .15s; }
:is(${sel}):hover { color: var(--ab-ink); }
${kitSel(sel) || '.mv-none'} { min-height: var(--k-tap, 44px) !important; font-size: ${p.kitSize}px !important; letter-spacing: ${p.kitTracking}em; }`;
    },
  },
});

registerMove({
  id: 'rule-selected', category: 'state', tier: 'recipe',
  params: { colour: en('primary', ROLES), kitColour: en('ink', ROLES), weight: num(600, [300, 800]) },
  state: {
    name: 'rule-selected',
    css(S, sel, p, ctx) {
      const k = kitSel(sel) || '.mv-none';
      return `${ctx.ON.selected(sel)} { color: var(--ab-ink); font-weight: ${p.weight}; background: none; border-bottom-color: ${rv(p.colour)}; }
${ctx.ON.selected(k)} { border-bottom-color: ${rv(p.kitColour)}; }
${ctx.ON.selected(sel).split(',\n').map(s => `${s}::after`).join(',\n')} { background: ${rv(p.kitColour)}; }`;
    },
  },
});

registerMove({
  id: 'ink-swap-hover', category: 'state', tier: 'recipe',
  params: { fill: en('ink', ['ink', 'press']) },
  state: {
    name: 'ink-swap-hover',
    css(S, sel, p, ctx) {
      return `${ctx.ON.hover(sel)} { background: ${p.fill === 'ink' ? 'var(--ab-ink)' : 'var(--mv-hover)'}; color: var(--ab-canvas); }`;
    },
  },
});

registerMove({
  id: 'press-darken', category: 'state', tier: 'recipe',
  params: { fill: en('press', ['press', 'ink']), lift: num(1, [0, 4]) },
  state: {
    name: 'press-darken',
    css(S, sel, p, ctx) {
      const f = p.fill === 'ink' ? ['var(--ab-ink)', 'var(--ab-canvas)'] : ['var(--mv-press)', 'var(--mv-on-press)'];
      return `${ctx.ON.press(sel)} { background: ${f[0]}; color: ${f[1]}; transform: translateY(${p.lift}px); filter: none; }
@media (prefers-reduced-motion: reduce) { ${ctx.ON.press(sel)} { transform: none; } }`;
    },
  },
});

registerMove({
  id: 'dotted-disabled', category: 'state', tier: 'recipe',
  params: { opacity: num(0.55, [0.2, 1]) },
  state: {
    name: 'dotted-disabled',
    css(S, sel, p, ctx) {
      return `${ctx.ON.disabled(sel)} { opacity: ${p.opacity}; background: none; border-style: dotted; box-shadow: none; }`;
    },
  },
});

registerMove({
  id: 'rule-frame', category: 'material', tier: 'recipe',
  params: { style: en('rule-pair', ['rule-pair', 'double-box', 'double-top']), top: num(3, [1, 8]), bottom: num(1, [0, 4]), fill: en('canvas', ['canvas', 'none']) },
  material: {
    name: 'rule-frame',
    css(S, sel, p) {
      const bg = p.fill === 'canvas' ? 'background: var(--ab-canvas);' : 'background: none;';
      const b = { 'rule-pair': `border: 0; border-top: ${p.top}px solid ${HX}; border-bottom: ${p.bottom}px solid ${HX};`,
        'double-box': `border: ${p.top}px double ${HX};`, 'double-top': `border: 0; border-top: ${p.top}px double ${HX};` }[p.style];
      return `${sel} { ${b} ${bg} border-radius: 0; box-shadow: none; }`;
    },
  },
});

registerMove({
  id: 'ruled-row', category: 'material', tier: 'recipe',
  params: { rule: en('soft', ['soft', 'hair', 'strong']) },
  material: {
    name: 'ruled-row',
    css(S, sel, p) { return `${sel} { border-radius: 0; background: none; box-shadow: none; border-top: 1px solid ${{ soft: HS, hair: H, strong: HX }[p.rule]}; }`; },
  },
});

registerMove({
  id: 'hairline-box', category: 'material', tier: 'recipe',
  params: { ring: en('strong', ['strong', 'hair']) },
  material: {
    name: 'hairline-box',
    css(S, sel, p) { return `${sel} { border-radius: 0; background: none; box-shadow: inset 0 0 0 1px ${p.ring === 'strong' ? HX : H}; }`; },
  },
});

registerMove({
  id: 'outlined-caps-tag', category: 'material', tier: 'recipe',
  params: { tracking: num(0.08, [0, 0.3]), mix: num(55, [0, 100]) },
  material: {
    name: 'outlined-caps-tag',
    css(S, sel, p) {
      return `${sel} { border-radius: 0; background: none; letter-spacing: ${p.tracking}em; text-transform: uppercase; color: color-mix(in srgb, var(--ab-accent-ink) ${p.mix}%, var(--ab-ink)); box-shadow: inset 0 0 0 1px currentColor; }`;
    },
  },
});

registerMove({
  id: 'rule-meter', category: 'material', tier: 'recipe',
  params: { leader: en('dotted', ['dotted', 'dashed']), kitHeight: num(2, [1, 6]) },
  material: {
    name: 'rule-meter',
    css(S, sel, p) {
      const k = kitSel(sel) || '.mv-none';
      return `${sel} { display: block; height: 0; background: none; border-radius: 0; border-bottom: 1px ${p.leader} ${HX}; }
${sel.split(',\n').map(s => `${s} i`).join(',\n')} { display: none; }
${k} { position: relative; height: ${p.kitHeight}px !important; margin: 0; border: 0; background: ${H}; align-self: auto; }
${k.split(',\n').map(s => `${s} i`).join(',\n')} { display: block; height: 100%; background: var(--ab-ink); }`;
    },
  },
});

registerMove({
  id: 'hairline-disc', category: 'material', tier: 'recipe',
  params: { serif: bool(true) },
  material: {
    name: 'hairline-disc',
    css(S, sel, p) { return `${sel} { background: var(--ab-canvas); color: var(--ab-ink); box-shadow: inset 0 0 0 1px ${HX}; border-radius: 50%; ${p.serif ? 'font-family: var(--ab-font-h); font-weight: 400;' : ''} }`; },
  },
});

registerMove({
  id: 'ink-block', category: 'material', tier: 'recipe',
  params: {},
  material: {
    name: 'ink-block',
    css(S, sel) { return `${sel} { background: var(--ab-ink); color: var(--ab-canvas); border: 0; border-radius: 0; box-shadow: none; }`; },
  },
});

registerMove({
  id: 'rule-sidebar', category: 'material', tier: 'recipe',
  params: { top: num(2, [1, 6]) },
  material: {
    name: 'rule-sidebar',
    css(S, sel, p) {
      return `${sel} { padding: 14px 0; border: 0; border-top: ${p.top}px solid var(--tone-ico, var(--tone, var(--ab-ink))); border-bottom: 1px solid ${H}; border-radius: 0; background: none; }
${sel.split(',\n').map(s => `${s}[data-tone="info"]`).join(',\n')} { --tone: var(--ab-ink); --tone-ico: var(--ab-ink); }`;
    },
  },
});
})();
