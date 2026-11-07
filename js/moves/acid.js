/* Acid moves: generic, parameterised generators / recipes / materials for loud paired-colour looks
   (vibrating colour pair, warped display type, op-art fields, ticket vocabulary). No style is named here;
   every value arrives through spec params. Contract: dev/move-lab/README.md. Needs core.js first.

   Vocabulary: "pair-a" is the printed primary (--ab-primary); "pair-b" is its computed partner
   (--ab-pair-b, set by equal-luminance-clash). */
(function () {
'use strict';

const num = (d, range) => ({ kind: 'number', default: d, range });
const txt = d => ({ kind: 'text', default: d });
const bool = d => ({ kind: 'bool', default: d });
const en = (d, options) => ({ kind: 'enum', default: d, options });

/* ---------- shared helpers ---------- */
const COL = {
  'pair-a': 'var(--ab-primary)', 'pair-b': 'var(--ab-pair-b)', ink: 'var(--ab-ink)', canvas: 'var(--ab-canvas)',
  line: 'var(--ab-line)', muted: 'var(--ab-muted)', tone: 'var(--tone, var(--ab-ink))', danger: 'var(--sb-danger, #d33)',
  none: 'transparent', transparent: 'transparent',
};
const ON = {
  'pair-a': 'var(--ab-on-primary)', 'pair-b': 'var(--ab-on-pair-b)', ink: 'var(--ab-canvas)', canvas: 'var(--ab-ink)',
  line: 'var(--ab-ink)', muted: 'var(--ab-canvas)', tone: 'var(--ab-ink)', danger: '#fff', none: 'var(--ab-ink)', transparent: 'var(--ab-ink)',
};
const COLS = Object.keys(COL);
const lines = sel => sel.split(',\n');
const kitOnly = sel => lines(sel).filter(s => s.includes('.sb-kit')).join(',\n');
const pseudo = (sel, ps) => lines(sel).map(s => s + ps).join(',\n');
const MONO = "ui-monospace, 'SF Mono', Menlo, monospace";

/* OKLab / OKLCH (sRGB, D65) */
const lin = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
function toOk(hex) {
  const c = hexToRgb(hex), r = lin(c.r), g = lin(c.g), b = lin(c.b);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const q = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * q;
  const A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * q, B = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * q;
  return { L, C: Math.hypot(A, B), h: (Math.atan2(B, A) * 180 / Math.PI + 360) % 360 };
}
function okRgb(L, C, h) {
  const a = C * Math.cos(h * Math.PI / 180), b = C * Math.sin(h * Math.PI / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, q = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * q, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * q, -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * q];
}
const inGamut = c => c.every(v => v >= -1e-4 && v <= 1 + 1e-4);
const lumOf = c => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
const toHex = c => '#' + c.map(v => { v = Math.max(0, Math.min(1, v)); v = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055; return Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0'); }).join('');
function maxChroma(L, h) {
  let lo = 0, hi = 0.4;
  for (let i = 0; i < 22; i++) { const m = (lo + hi) / 2; if (inGamut(okRgb(L, m, h))) lo = m; else hi = m; }
  return lo;
}

/* tokens of one build share `t`; the partner colour is stashed so later token moves can read it */
const STASH = new WeakMap();

/* ================= COLOUR GENERATORS ================= */

/* primary-reprint: the printed primary pushed to a chosen saturation, lightness by hue band; a muted one falls back. */
registerMove({
  id: 'primary-reprint', libraryId: 'primary-reprint', what: 'Re-prints the primary at a chosen saturation with lightness set by hue band; a muted primary falls back to a fixed lime.', category: 'colour', tier: 'generator',
  params: {
    saturation: num(100, [0, 100]),
    bandFrom: num(52, [0, 360]), bandTo: num(170, [0, 360]), band2To: num(285, [0, 360]),
    lightBand: num(50, [20, 80]),     // hue in [bandFrom, bandTo)
    lightBand2: num(58, [20, 80]),    // hue in [bandTo, band2To)
    lightOther: num(54, [20, 80]),
    mutedBelow: num(24, [0, 60]),     // saturation % under which the fallback colour is used
    fallback: { kind: 'colour', default: '#B6FF00' },
  },
  hooks: {
    printPrimary(p, ctx, t) {
      const c = hexToHsl(t.primary);
      if (c.s < p.mutedBelow) return p.fallback;
      const l = c.h > p.bandFrom && c.h < p.bandTo ? p.lightBand : c.h >= p.bandTo && c.h < p.band2To ? p.lightBand2 : p.lightOther;
      return hslToHex(c.h, p.saturation, l);
    },
  },
});

/* equal-luminance-clash: partner colour for the printed primary (OKLCH search, gamut bisection, dull-hue rejection). */
registerMove({
  id: 'equal-luminance-clash', libraryId: 'equal-luminance-clash', what: 'Computes a partner colour at near-equal luminance to the primary so the two vibrate edge to edge.', category: 'colour', tier: 'generator',
  params: {
    offset: num(165, [60, 300]),            // hue turn for the equal-luminance search
    chromaFloor: num(0.10, [0, 0.3]),       // first pick must hold this chroma
    chromaFloor2: num(0.12, [0, 0.3]),      // fallback offsets
    chromaRescue: num(0.15, [0, 0.3]),
    greenFrom: num(95, [0, 360]), greenTo: num(200, [0, 360]),   // acid hues that take the "warm" partner
    greenPartnerHue: num(340, [0, 360]), greenPartnerL: num(0.7, [0.3, 0.98]),
    darkBelow: num(0.45, [0, 1]),           // relative luminance under which the "light" partner is used
    darkPartnerHue: num(128, [0, 360]), darkPartnerL: num(0.89, [0.3, 0.98]),
  },
  tokens(t, p) {
    const acid = t.printPrimary || t.primary;
    const a = toOk(acid), c0 = hexToRgb(acid);
    const target = lumOf([lin(c0.r), lin(c0.g), lin(c0.b)]);
    const flo = (L, h) => toHex(okRgb(L, maxChroma(L, h) * 0.98, h));
    let clash;
    if (a.h >= p.greenFrom && a.h <= p.greenTo) clash = flo(p.greenPartnerL, p.greenPartnerHue);
    else if (target < p.darkBelow) clash = flo(p.darkPartnerL, p.darkPartnerHue);
    else {
      const at = off => {
        const h = (a.h + off) % 360;
        let lo = 0.05, hi = 0.98;
        for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; if (lumOf(okRgb(m, maxChroma(m, h) * 0.98, h)) < target) lo = m; else hi = m; }
        const L = (lo + hi) / 2;
        return { h, L, C: maxChroma(L, h) * 0.98 };
      };
      const fits = (k, floor) => k.C >= floor && !(k.h >= 50 && k.h <= 140 && k.L < 0.7);
      let k = at(p.offset);
      if (!fits(k, p.chromaFloor)) {
        k = null;
        for (const off of [150, 180, 135, 195, 120, 210, 225, 240]) { const c = at(off); if (fits(c, p.chromaFloor2)) { k = c; break; } }
      }
      if (!k) {
        const h = (a.h + p.offset) % 360;
        let L = Math.min(0.98, a.L);
        while (L > 0.3 && maxChroma(L, h) < p.chromaRescue) L -= 0.01;
        k = { h, L, C: maxChroma(L, h) * 0.98 };
      }
      clash = toHex(okRgb(k.L, k.C, k.h));
    }
    const on = hex => (t.contrast('#050505', hex) >= t.contrast('#ffffff', hex) ? '#050505' : '#ffffff');
    const dY = Math.abs(relativeLuminance(acid) - relativeLuminance(clash));
    STASH.set(t, { a: acid, b: clash });
    return { '--ab-pair-b': clash, '--ab-on-pair-b': on(clash), '--ab-pair-a-hex': `"${acid.toUpperCase()}"`, '--ab-pair-b-hex': `"${clash.toUpperCase()}"`, '--ab-pair-delta-s': `"${dY.toFixed(3)}"` };
  },
});

/* pair-colour-tints: alpha tints of both, a readable lift of pair-a on tinted rows (dark), foreground picks per mode. */
registerMove({
  id: 'pair-colour-tints', libraryId: 'role-tint-fill', what: 'Derives tinted fills, text and shadow colours from the vibrating pair.', category: 'colour', tier: 'token',
  params: { tint: num(0.12, [0, 0.5]), liftTo: num(5, [3, 8]) },
  tokens(t, p) {
    const st = STASH.get(t) || { a: t.printPrimary || t.primary, b: t.accent };
    const d = t.isDark;
    let text = st.a;
    if (d) for (let k = 0.06; k <= 1 && t.contrast(text, t.mix(st.b, t.canvas, p.tint)) < p.liftTo; k += 0.06) text = t.mix(st.a, '#ffffff', k);
    return {
      '--ab-pair-a-tint': t.alpha(st.a, p.tint), '--ab-pair-b-tint': t.alpha(st.b, p.tint),
      '--ab-pair-fg': d ? st.a : t.ink, '--ab-pair-fg2': d ? st.b : t.ink, '--ab-pair-text': d ? text : t.ink,
    };
  },
});

/* skyline-bars: an export-safe data-URI bar skyline in the pair, as a token. */
registerMove({
  id: 'skyline-bars', libraryId: 'colour-bar-strip', what: 'Builds a skyline bar strip in the pair colours for strips and meters.', category: 'colour', tier: 'generator',
  params: { bars: num(10, [4, 20]), width: num(4, [1, 10]), step: num(6, [2, 14]), height: num(14, [6, 40]) },
  tokens(t, p) {
    const heights = [0.55, 0.9, 0.7, 1, 0.45, 0.8, 0.6, 0.95, 0.5, 0.75];
    const st = STASH.get(t) || { a: t.printPrimary || t.primary, b: t.accent };
    const W = p.bars * p.step;
    const rects = Array.from({ length: p.bars }, (_, i) => {
      const h = heights[i % heights.length];
      return `<rect x="${i * p.step}" y="${(p.height * (1 - h)).toFixed(1)}" width="${p.width}" height="${(p.height * h).toFixed(1)}" fill="${i % 3 === 2 ? st.b : st.a}"/>`;
    }).join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${p.height}" viewBox="0 0 ${W} ${p.height}" preserveAspectRatio="none">${rects}</svg>`;
    return { '--ab-skyline-a': `url("data:image/svg+xml,${encodeURIComponent(svg)}")` };
  },
});

/* ================= STRUCTURE / RECIPES ================= */

registerMove({
  id: 'line-grid', libraryId: 'line-grid', what: 'Draws a faint 12-column grid under the layout.', category: 'structure', tier: 'recipe',
  params: { columns: num(12, [2, 24]), darkPct: num(4.5, [0, 20]), lightPct: num(6.5, [0, 20]), kitToo: bool(true) },
  css(S, p) {
    const g = pct => `linear-gradient(90deg, color-mix(in srgb, var(--ab-ink) ${pct}%, transparent) 1px, transparent 1px) 0 0 / calc(100% / ${p.columns}) 100%, linear-gradient(270deg, color-mix(in srgb, var(--ab-ink) ${pct}%, transparent) 1px, transparent 1px)`;
    return `${S}::before { content: ""; position: absolute; inset: 0 var(--ab-pad); z-index: 0; pointer-events: none; background: ${g(p.lightPct)}; }
${S}[data-mode="dark"]::before { background: ${g(p.darkPct)}; }
${S}.sb-screen::before { content: none; }`;
  },
});

registerMove({
  id: 'ticker-strip', libraryId: 'info-strip', what: 'Prints repeating ticker text along the board edges and divider rules in the pair colours.', category: 'structure', tier: 'recipe',
  params: {
    top: txt(''), bottom: txt(''), rule: txt(''),   // rule: text printed along every divider rule
    topFill: en('pair-b', ['pair-a', 'pair-b', 'ink']), bottomFill: en('pair-a', ['pair-a', 'pair-b', 'ink']),
    size: num(10.5, [8, 14]), tracking: num(0.12, [0, 0.3]),
  },
  css(S, p) {
    const esc = s => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    const base = `font: 700 ${p.size}px/1.4 ${MONO}; letter-spacing: ${p.tracking}em; white-space: nowrap; overflow: hidden;`;
    let out = '';
    if (p.top) out += `${S}:not(.ab-slide) > .ab-in::before { content: "${esc(p.top)}"; display: block; margin: calc(var(--ab-pad) * -1) calc(var(--ab-pad) * -1) var(--ab-pad); padding: 6px 0 5px; background: ${COL[p.topFill]}; color: ${ON[p.topFill]}; ${base} }\n`;
    if (p.bottom) out += `${S}:not(.ab-slide):not(.sb-ab) .ab-foot::before { content: "${esc(p.bottom)}"; order: -1; flex: 1 1 100%; margin: 0 calc(var(--ab-pad) * -1) 8px; padding: 5px 0 4px; background: ${COL[p.bottomFill]}; color: ${ON[p.bottomFill]}; ${base} }\n`;
    if (p.rule) out += `${S}:not(.sb-kit) .ab-rule { height: 14px; background: none; border: 0; overflow: hidden; }
${S}:not(.sb-kit) .ab-rule::before { content: "${esc(p.rule)}"; display: block; font: 700 9px/14px ${MONO}; letter-spacing: 0.14em; color: var(--ab-muted); white-space: nowrap; overflow: hidden; }
${S}.sb-kit .ab-rule { height: 3px; background: var(--ab-ink); }\n`;
    out += `${S} .ab-foot { border-top: 3px solid var(--ab-ink); color: var(--ab-ink); font-family: var(--ab-font-label); font-size: 10.5px; letter-spacing: 0.08em; text-transform: uppercase; }
${S} .ab-foot .ab-infl { color: var(--ab-muted); }
${S} .ab-dot { border-radius: 0; width: 9px; height: 9px; background: var(--ab-pair-b); box-shadow: 3px 3px 0 var(--ab-primary); }`;
    return out;
  },
});

registerMove({
  id: 'solid-mark-header', libraryId: 'brand-mark', what: 'Sets the header as a solid mark with a hard offset shadow and an ink tag chip.', category: 'structure', tier: 'recipe',
  params: { stretch: num(1.28, [1, 2]), offset: num(3, [0, 8]) },
  css(S, p) {
    return `${S} { border-radius: 0; }
${S} .ab-brand { font-weight: 800; text-transform: uppercase; letter-spacing: 0.02em; }
${S} .ab-wordmark { display: inline-block; transform: scaleY(${p.stretch}); transform-origin: 0 60%; }
${S} .ab-mark { border-radius: 0; background: var(--ab-primary); color: var(--ab-on-primary); box-shadow: ${p.offset}px ${p.offset}px 0 var(--ab-pair-b); font-weight: 800; }
${S} .ab-tag { padding: 3px 9px; background: var(--ab-ink); color: var(--ab-canvas); font-size: 10px; font-weight: 700; letter-spacing: 0.12em; }
${S} .ab-tag b { color: inherit; font-weight: 700; }`;
  },
});

registerMove({
  id: 'stretched-section-title', libraryId: 'warped-display-headline', what: 'Stretches section titles vertically with an offset echo.', category: 'type', tier: 'recipe',
  params: { weight: num(800, [400, 900]), stretch: num(1.28, [1, 2]), echo: num(0.05, [0, 0.12]), minPx: num(20, [12, 40]), maxPx: num(32, [16, 64]), vw: num(2.8, [1, 6]) },
  css(S, p) {
    const e = p.echo;
    return `${S} .ab-labelrow:not(.ab-deck-cover-meta) { position: relative; isolation: isolate; flex-wrap: wrap; align-items: flex-end; padding: 18px 0 8px; border-bottom: 1px solid var(--ab-line); }
${S} .ab-label { color: var(--ab-ink); }
${S} .ab-labelrow > .ab-label:last-child:not(:first-child) { color: var(--ab-ink); font-weight: 400; }
${S} .ab-labelrow:not(.ab-deck-cover-meta) > .ab-label:not(.ab-label ~ .ab-label) { display: inline-block; font: ${p.weight} clamp(${p.minPx}px, ${p.vw}cqw, ${p.maxPx}px)/1 var(--ab-font-h); text-transform: uppercase; letter-spacing: -0.01em;
  transform: scaleY(${p.stretch}); transform-origin: 0 100%; margin-bottom: ${Math.round((p.stretch - 1) * 6)}px; text-shadow: ${e}em ${e}em 0 var(--ab-primary), ${e * 2}em ${e * 2}em 0 var(--ab-pair-b); }
${S} .ab-labelrow > .ab-label:not(.ab-label ~ .ab-label) .ab-n { font-size: 0.5em; vertical-align: 0.5em; text-shadow: none; }
${S}.sb-kit .ab-labelrow { border-bottom: 0; }`;
  },
});

registerMove({
  id: 'full-bleed-hero-field', libraryId: 'flat-colour-planes', what: 'Fills the hero with a full-bleed pair-coloured field in the chosen mode.', category: 'colour', tier: 'recipe',
  params: { mode: en('light', ['light', 'dark', 'both']), kicker: en('pair-b', ['pair-a', 'pair-b', 'ink']) },
  css(S, p) {
    const sels = p.mode === 'both' ? [S] : [`${S}[data-mode="${p.mode}"]`];
    const m = sels[0];
    return `${m} .ab-hero { margin: 0 calc(var(--ab-pad) * -1); padding-left: var(--ab-pad); padding-right: var(--ab-pad); background: var(--ab-primary); }
${m} .ab-subcopy, ${m} .ab-sub-rest, ${m} .ab-sub-lead { color: var(--ab-on-primary); }
${m} .ab-kicker { background: var(--ab-ink); color: var(--ab-canvas); }`;
  },
});

registerMove({
  id: 'pair-readout-block', libraryId: 'micro-caption', what: 'Prints a small readout of the two pair colours on the palette strips.', category: 'structure', tier: 'recipe',
  params: { title: txt('PAIR'), labelA: txt('A'), labelB: txt('B'), deltaLabel: txt('Δ LUMINANCE'), minHeight: num(110, [60, 220]), weight: num(1, [1, 1]) },
  tokens(t, p, ctx) { return {}; },
  css(S, p) {
    const esc = s => String(s).replace(/"/g, '\\"');
    return `${S} .ab-swatches[data-kind="strips"]::after { content: "${esc(p.title)}\\A ${esc(p.labelA)} " var(--ab-pair-a-hex, "") "\\A ${esc(p.labelB)} " var(--ab-pair-b-hex, "") "\\A ${esc(p.deltaLabel)} " var(--ab-pair-delta-s, "");
  white-space: pre-line; overflow-wrap: anywhere; flex: 0 0 24%; min-width: 0; padding: 12px 14px; font: 700 10px/1.5 ${MONO}; letter-spacing: 0.1em; color: var(--ab-pair-b);
  background: linear-gradient(90deg, var(--ab-primary) 0 50%, var(--ab-pair-b) 50% 100%) 0 100% / 100% 16px no-repeat, #050505; }
${S} .ab-swatches[data-kind="strips"] { border-radius: 0; box-shadow: 0 0 0 2px var(--ab-ink); }
${S} .ab-swatches[data-kind="strips"] .ab-swatch { min-height: clamp(${p.minHeight}px, 14cqw, 160px); }
${S} .ab-swatches[data-kind="strips"] .ab-sw-job, ${S} .ab-swatches[data-kind="strips"] .ab-sw-hex, ${S} .ab-swatches[data-kind="strips"] .ab-sw-print { opacity: 1; }
${S} .ab-sw-role { font-family: ${MONO}; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
@container ab (max-width: 600px) { ${S} .ab-swatches[data-kind="strips"]::after { flex: none; } }`;
  },
});

registerMove({
  id: 'bill-type-list', libraryId: 'ruled-row-list', what: 'Sets the type specimen as a ruled bill-style list.', category: 'type', tier: 'recipe',
  params: { prefix: txt('b2b '), mark: txt('✱ '), fitSquare: bool(true) },
  css(S, p) {
    const esc = s => String(s).replace(/"/g, '\\"');
    return `${S} .ab-type-grid { gap: 0; }
${S} .ab-type-col { padding: 14px 16px 16px; border: 0; border-left: 1px solid var(--ab-line); text-align: center; background: none; }
${S} .ab-type-col:first-child { border-left: 0; }
${S} .ab-type-role { color: var(--ab-ink); font-weight: 700; letter-spacing: 0.22em; font-size: 10px; }
${S} .ab-type-role::before { content: "${esc(p.mark)}"; color: var(--ab-pair-text); }
${S} .ab-type-role::after { content: " ${esc(p.mark.trim())}"; color: var(--ab-pair-text); }
${S} .ab-type-class { font-family: ${MONO}; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; }
${S} .ab-type-picks { display: grid; justify-items: center; gap: 2px; }
${S} .ab-type-pick { text-transform: uppercase; letter-spacing: 0.02em; line-height: 1.05; color: var(--ab-ink); font-weight: 400; }
${S} .ab-type-pick:nth-child(1) { font-size: clamp(22px, 3.2cqw, 36px); color: var(--ab-pair-text); }
${S} .ab-type-pick:nth-child(2) { font-size: clamp(15px, 1.9cqw, 21px); }
${S} .ab-type-pick:nth-child(n+3) { font-size: 13px; opacity: 0.85; }
${S} .ab-type-pick:nth-child(n+2)::before { content: "${esc(p.prefix)}"; font: 700 9px ${MONO}; letter-spacing: 0.1em; color: var(--ab-muted); vertical-align: 0.3em; }
${S} .ab-type-fit { justify-items: center; }
${S} .ab-fit { padding: 2px 8px; border: 2px solid var(--ab-ink); border-radius: 0; background: none; font-family: ${MONO}; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ab-ink); }
${S} .ab-fit[data-fit="match"] { background: var(--ab-primary); border-color: var(--ab-primary); color: var(--ab-on-primary); }
${S} .ab-fit[data-fit="consider"] { border-style: dashed; }
${S} .ab-fit[data-fit="avoid"] { background: var(--ab-ink); border-color: var(--ab-ink); color: var(--ab-canvas); text-decoration: line-through; }
${S} .ab-type-k { color: var(--ab-ink); font-weight: 700; letter-spacing: 0.14em; }
@container ab (max-width: 600px) { ${S} .ab-type-col { border-left: 0; border-top: 1px solid var(--ab-line); } }`;
  },
});

registerMove({
  id: 'big-numeral-rows', libraryId: 'big-numeral-rows', what: 'Lists rows with large stretched numerals, a heavy top rule and a mono readout.', category: 'type', tier: 'recipe',
  params: { weight: num(800, [400, 900]), listRule: num(3, [0, 8]) },
  css(S, p) {
    return `${S} .ab-list { border-top: ${p.listRule}px solid var(--ab-ink); }
${S} .ab-row { grid-template-columns: clamp(46px, 6.4cqw, 62px) minmax(0, 1fr) auto minmax(60px, 150px) 4.5ch; padding: 10px; border-top: 0; border-bottom: 1px solid var(--ab-line); }
${S} .ab-row-n { font: ${p.weight} clamp(26px, 3.6cqw, 36px)/1.2 var(--ab-font-h); color: var(--ab-pair-text); font-variant-numeric: tabular-nums; }
${S} .ab-row-name { font-family: ${MONO}; font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
${S} .ab-row:first-child .ab-row-name { font-family: var(--ab-font-h); font-weight: ${p.weight}; font-size: clamp(18px, 2.6cqw, 24px); letter-spacing: 0; line-height: 1.2; }
${S} .ab-row-status { padding: 2px 8px; border: 2px solid var(--ab-ink); border-radius: 0; background: none; font-family: ${MONO}; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
${S} .ab-row-pct { font-family: ${MONO}; font-weight: 700; }
${S} .ab-deck-prod .ab-row { grid-template-columns: 66px minmax(0, 1fr) auto 4.5ch; row-gap: 6px; }
${S} .ab-deck-prod .ab-row-bar { grid-column: 2 / -1; grid-row: 2; }
@container ab (max-width: 600px) { ${S} .ab-row { grid-template-columns: 46px minmax(0, 1fr) 4.5ch; } ${S} .ab-row-n { grid-row: 1 / span 2; align-self: start; } }`;
  },
});

registerMove({
  id: 'stretched-display-numerals', libraryId: 'warped-display-headline', what: 'Stretches kit card titles and big stat numerals vertically.', category: 'type', tier: 'recipe',
  params: { titleStretch: num(1.5, [1, 2]), numStretch: num(1.28, [1, 2]), echo: num(0.05, [0, 0.12]) },
  css(S, p) {
    return `${S}.sb-ab .ab-card-title.sb-title { text-transform: uppercase; transform: scaleY(${p.titleStretch}); transform-origin: 0 100%; letter-spacing: -0.01em; text-shadow: ${p.echo}em ${p.echo}em 0 var(--ab-primary), ${p.echo * 2}em ${p.echo * 2}em 0 var(--ab-pair-b); }
${S}.sb-ab .sb-stat .ab-card-title.sb-num { transform: scaleY(${p.numStretch}); transform-origin: 0 100%; margin: 14px 0 !important; font-weight: 800; }
${S}.sb-ab .sb-feat-n { color: var(--ab-pair-text); }
${S}.sb-ab .sb-main { background-image: linear-gradient(90deg, color-mix(in srgb, var(--ab-primary) 13%, transparent) 1px, transparent 1px), linear-gradient(0deg, color-mix(in srgb, var(--ab-pair-b) 8%, transparent) 1px, transparent 1px); background-size: calc((100% - 56px) / 12) 100%, 100% 44px; background-position: 28px 0, 0 0; }`;
  },
});

registerMove({
  id: 'warped-display-headline', libraryId: 'warped-display-headline', what: 'Splits the headline into stacked lines and warps each one differently: wave stretch, a compressed middle line, a stretched last line.', category: 'type', tier: 'generator',
  params: {
    maxLine: num(8, [4, 20]),          // letters per stacked line
    stretchMin: num(1.4, [1, 3]), stretchAmp: num(0.8, [0, 2]), midStretch: num(1.8, [1, 3]), lastStretch: num(1.5, [1, 3]),
    squeeze: num(0.62, [0.3, 1]),      // the compressed middle line's width
    charW: num(0.72, [0.4, 1.1]),      // em width of one capital, to fit the longest line
    weight: num(800, [400, 900]),
    fitCqw: num(50, [20, 100]),
    sizeMin: num(64, [20, 200]), sizeVw: num(12, [4, 30]), sizeMax: num(180, [60, 400]),
    outlineLast: bool(true),
    lightField: bool(true),            // hero set on a full-bleed field in light mode: copy colours follow
  },
  hooks: {
    headline(p, ctx, abctx, text) {
      const e = escapeHtml;
      const words = String(text || '').trim().split(/\s+/).filter(Boolean);
      if (!words.length) return '';
      const rows = [];
      let cur = [], n = 0;
      words.forEach(w => { if (cur.length && n + w.length + 1 > p.maxLine) { rows.push(cur); cur = []; n = 0; } cur.push(w); n += w.length + (cur.length > 1 ? 1 : 0); });
      if (cur.length) rows.push(cur);
      const maxN = Math.max(...rows.map(l => l.join(' ').length));
      const html = rows.map((l, li) => {
        const last = p.outlineLast && li === rows.length - 1 && rows.length > 1;
        const mid = !last && li === 1;
        let mx = 1;
        const letters = Array.from(l.join(' ')).map((ch, i) => {
          if (ch === ' ') return '<span class="wdh-sp"> </span>';
          const sy = last ? p.lastStretch : mid ? p.midStretch : p.stretchMin + p.stretchAmp * (0.5 + 0.5 * Math.sin(i * 0.9 + li * 1.7 + 0.6));
          mx = Math.max(mx, sy);
          return `<span class="wdh-l" style="--s:${sy.toFixed(2)}" data-c="${e(ch)}">${e(ch)}</span>`;
        }).join('');
        return `<span class="wdh-line${last ? ' wdh-out' : mid ? ' wdh-x' : ''}" style="--mx:${mx.toFixed(2)}">${letters}</span>`;
      }).join('');
      return `<span class="wdh" style="--wdh-n:${maxN}">${html}</span>`;
    },
  },
  css(S, p) {
    return `${S} .ab-hero { grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); align-items: center; gap: clamp(14px, 3cqw, 34px); padding: clamp(26px, 4.4cqw, 48px) 0; }
${S} .ab-kicker { display: inline-block; margin-bottom: 18px !important; padding: 3px 9px; background: var(--ab-pair-b); color: var(--ab-on-pair-b); font-size: 10.5px; font-weight: 700; letter-spacing: 0.14em; }
${S} .ab-headline { color: var(--ab-pair-fg); font-weight: ${p.weight}; text-transform: uppercase; letter-spacing: calc(-0.02em * var(--ab-tr, 1)); line-height: 0.9; overflow-wrap: normal; }
${S}:not(.ab-slide) .ab-headline { font-size: calc(clamp(${p.sizeMin}px, ${p.sizeVw}cqw, ${p.sizeMax}px) * var(--ab-hl-scale, 1) * var(--ab-hs, 1) * var(--ab-display, 1)); }
${S} .wdh { display: block; font-size: min(1em, calc(${p.fitCqw}cqw / (var(--wdh-n, 10) * ${p.charW}))); }
${S}.ab-slide .wdh { font-size: min(1em, calc(${p.fitCqw + 2}cqw / (var(--wdh-n, 10) * ${p.charW}))); }
${S} .wdh-line { display: block; width: max-content; padding-top: calc((var(--mx, 1) - 1) * 0.74em); white-space: nowrap; line-height: 0.92; }
${S} .wdh-l { display: inline-block; transform-origin: 50% 100%; transform: scaleY(var(--s, 1)); }
${S} .wdh-sp { display: inline-block; width: 0.3em; }
${S} .wdh-x { transform: scaleX(${p.squeeze}); transform-origin: 0 100%; margin-right: ${-Math.round((1 - p.squeeze) * 100)}%; }
${S} .ab-hl { color: inherit; background: none; padding: 0; margin: 0; }
${S} .ab-subcopy { max-width: 28em; margin-top: 20px !important; color: var(--ab-muted); }
${S} .ab-sub-lead { color: var(--ab-ink); font-weight: 600; }
${S}.sb-ab .sb-ob-h .wdh { display: block; }
${S}.sb-ab .sb-ob-h .wdh-line { display: inline-block; vertical-align: bottom; margin-right: 0.22em; }
${S}.ab-slide[data-slide="cover"] .ab-deck-cover .ab-hero { grid-template-columns: minmax(0, 1.75fr) minmax(0, 1fr); column-gap: 4%; }
${S}.ab-slide[data-slide="cover"] .wdh { display: flex; flex-wrap: wrap; align-items: flex-end; column-gap: 0.3em; font-size: 1em; }
${S}.ab-slide[data-slide="cover"] .wdh-x { transform: none; margin-right: 0; }
${S}.ab-slide[data-slide="cover"] .wdh-out { flex-basis: 100%; }
@container ab (max-width: 600px) { ${S} .ab-hero { grid-template-columns: minmax(0, 1fr); padding: 24px 0 28px; }
  ${S}:not(.ab-slide) .ab-headline { font-size: calc(clamp(40px, 15cqw, 80px) * var(--ab-hl-scale, 1) * var(--ab-hs, 1) * var(--ab-display, 1)); }
  ${S} .wdh { font-size: min(1em, calc(84cqw / (var(--wdh-n, 10) * ${p.charW}))); } }`;
  },
});

registerMove({
  id: 'outline-echo-headline', libraryId: 'outline-echo-headline', what: 'Draws the last headline line as an outline with offset echoes in the pair colour.', category: 'type', tier: 'generator',
  params: { stroke: num(2, [1, 6]), echo: num(0.05, [0, 0.15]) },
  css(S, p) {
    const e = p.echo;
    return `${S} .wdh-out { color: transparent; -webkit-text-stroke: ${p.stroke}px var(--ab-pair-fg2); filter: drop-shadow(${e}em ${e}em 0 var(--ab-primary)) drop-shadow(${e}em ${e}em 0 var(--ab-pair-b)); letter-spacing: -0.04em; }
${S}[data-mode="light"] .wdh-out { -webkit-text-stroke-color: var(--ab-ink); filter: drop-shadow(${e}em ${e}em 0 var(--ab-pair-b)) drop-shadow(${e}em ${e}em 0 var(--ab-ink)); }`;
  },
});

/* ================= OP-ART GENERATORS ================= */

let seq = 0;
function ensureWarpDefs() {
  const make = () => {
    if (!document.body || document.getElementById('mv-warp-defs')) return;
    const d = document.createElement('div');
    d.id = 'mv-warp-defs';
    d.setAttribute('aria-hidden', 'true');
    d.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    d.innerHTML = `<svg width="0" height="0" focusable="false"><defs>
      <filter id="mv-warp-s" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB"><feTurbulence type="turbulence" baseFrequency="0.011 0.008" numOctaves="1" seed="7" result="w0"/><feGaussianBlur in="w0" stdDeviation="4" result="w"/><feDisplacementMap in="SourceGraphic" in2="w" scale="34" xChannelSelector="R" yChannelSelector="B"/></filter>
    </defs></svg>`;
    document.body.appendChild(d);
  };
  if (document.body) make(); else document.addEventListener('DOMContentLoaded', make);
}
ensureWarpDefs();

/* op-art-ripple: concentric bands in the pair, bent by a blurred turbulence displacement (SVG generator). */
registerMove({
  id: 'op-art-ripple', libraryId: 'op-art-ripple', what: 'Art generator: concentric rings warped by an SVG turbulence displacement, set in a hard-edged frame.', category: 'art', tier: 'generator',
  params: {
    rings: num(26, [6, 60]), scale: num(34, [0, 80]), blur: num(4, [0, 12]), freqX: num(0.011, [0.001, 0.05]), freqY: num(0.008, [0.001, 0.05]),
    aspect: num(0.8, [0.5, 1.5]),      // width / height of the art frame
    border: num(2, [0, 6]), offset: num(5, [0, 12]),
    seed: num(7, [1, 50]), withArt: bool(true),
  },
  hooks: {
    art(p, ctx, actx) {
      if (!p.withArt) return '';
      const id = 'mvr' + (++seq);
      const W = 400, H = Math.round(W / p.aspect), R = Math.hypot(W, H) * 0.7, step = R / p.rings;
      let circles = '';
      for (let i = p.rings; i >= 1; i--) circles += `<circle cx="${W * 0.5}" cy="${H * 0.45}" r="${(i * step).toFixed(1)}" fill="${i % 2 ? 'var(--ab-primary)' : 'var(--ab-pair-b)'}"/>`;
      return `<div class="mv-ripple" role="img" aria-label="Op-art ripple"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
        <defs><filter id="${id}" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB"><feTurbulence type="turbulence" baseFrequency="${p.freqX} ${p.freqY}" numOctaves="1" seed="${p.seed}" result="w0"/><feGaussianBlur in="w0" stdDeviation="${p.blur}" result="w"/><feDisplacementMap in="SourceGraphic" in2="w" scale="${p.scale}" xChannelSelector="R" yChannelSelector="B"/></filter></defs>
        <g filter="url(#${id})">${circles}</g></svg></div>`;
    },
  },
  css(S, p) {
    return `${S} .ab-art { max-width: none; aspect-ratio: auto; justify-self: stretch; overflow: visible; }
${S}:not(.ab-slide) .ab-hero > .ab-art { align-self: start; margin-top: 8px; }
${S} .mv-ripple { aspect-ratio: ${p.aspect}; overflow: hidden; background: #050505; border: ${p.border}px solid var(--ab-primary); box-shadow: ${p.offset}px ${p.offset}px 0 var(--ab-pair-b); }
${S} .mv-ripple svg { display: block; width: 100%; height: 100%; }
${S}.ab-slide[data-slide="cover"] .ab-deck-cover .ab-art { width: 100% !important; max-width: 330px !important; justify-self: end; }
@container ab (max-width: 600px) { ${S} .ab-art { max-width: 340px; } }`;
  },
});

/* field-band: a patterned band behind each section header (board only), pattern chosen per section slot. */
const FIELD_PATTERNS = ['ripple', 'rays', 'check', 'rings', 'none'];
registerMove({
  id: 'field-band', libraryId: 'geometric-fill', what: 'Fills a band behind a section with a chosen pattern such as ripple, rays or check.', category: 'art', tier: 'generator',
  params: {
    palette: en('ripple', FIELD_PATTERNS), type: en('rays', FIELD_PATTERNS), ui: en('check', FIELD_PATTERNS), touch: en('check', FIELD_PATTERNS), use: en('rings', FIELD_PATTERNS),
    opacity: num(0.2, [0.05, 0.6]), widthPct: num(55, [20, 100]),
  },
  css(S, p) {
    const bg = k => ({
      ripple: 'background: repeating-radial-gradient(circle at 80% 120%, var(--ab-primary) 0 9px, var(--ab-pair-b) 9px 18px); filter: url(#mv-warp-s);',
      rays: 'background: repeating-conic-gradient(from 0deg at 100% 100%, var(--ab-primary) 0 2.5deg, transparent 2.5deg 6deg);',
      check: 'background: repeating-conic-gradient(var(--ab-primary) 0 25%, var(--ab-pair-b) 0 50%) 0 0 / 28px 28px; filter: url(#mv-warp-s); inset: 0 0 0 auto; width: 70%;',
      rings: 'background: repeating-radial-gradient(circle at 100% 50%, var(--ab-pair-b) 0 5px, transparent 5px 12px);',
    })[k] || '';
    const slot = (sel, k) => (k === 'none' ? '' : `${S}:not(.sb-kit) ${sel} > .ab-labelrow::before { ${bg(k)} }\n`);
    return `${S}:not(.sb-kit) .ab-labelrow::before { content: ""; position: absolute; z-index: -1; inset: 0 calc(-1 * var(--ab-pad)) 0 auto; width: ${p.widthPct}%; opacity: ${p.opacity}; pointer-events: none; }
${slot('.ab-palette', p.palette)}${slot('.ab-type', p.type)}${slot('.ab-sec-ui', p.ui)}${slot('.ab-sec-touch', p.touch)}${slot('.ab-sec-use', p.use)}`;
  },
});

/* ================= MATERIALS ================= */

/* pair-block: solid block in the pair with a hard offset echo; optional overlay, edge sides, app-screen variant. */
registerMove({
  id: 'pair-block', libraryId: 'hard-offset-shadow', what: 'Material: a block in the pair colours with a heavy edge and hard offset shadow, with optional hatch overlay.', category: 'material', tier: 'recipe',
  params: {
    fill: en('pair-a', COLS), edge: en('pair-b', COLS), shadow: en('none', COLS),
    width: num(2, [0, 8]), offset: num(5, [0, 12]),
    sides: en('all', ['all', 'top', 'bottom', 'left', 'right']),
    overlay: en('none', ['none', 'ripple', 'stripes']), overlayOpacity: num(0.2, [0.05, 0.6]),
    face: en('inherit', ['inherit', 'display', 'mono']), caps: bool(false), tracking: num(0.08, [0, 0.3]), size: num(13, [9, 20]),
    pad: bool(false), text: en('auto', ['auto', 'pair-text']),
    accent: en('none', COLS), accentWidth: num(4, [1, 12]), accentSide: en('top', ['top', 'left', 'right', 'bottom']),   // a thicker coloured edge on one side
    force: bool(false),    // !important on fill, edge and shadow (beats a sibling class such as a card base)
    kit: en('same', ['same', 'outline']),    // app screens: 'outline' = transparent fill, edge in pair-a, ink label
  },
  material: {
    name: 'pair-block',
    css(S, sel, p) {
      const bw = p.width > 0 && p.edge !== 'none' ? `${p.width}px solid ${COL[p.edge]}` : '0';
      const im = p.force ? ' !important' : '';
      let out = `${sel} { background: ${p.fill === 'none' ? 'transparent' : COL[p.fill]}${im}; color: ${p.fill === 'none' ? 'var(--ab-ink)' : ON[p.fill]}; ${p.sides === 'all' ? 'border' : 'border: 0; border-' + p.sides}: ${bw}${im}; ${p.shadow !== 'none' ? `box-shadow: ${p.offset}px ${p.offset}px 0 ${COL[p.shadow]}${im};` : `box-shadow: none${im};`}${p.overlay !== 'none' ? ' position: relative;' : ''} }\n`;
      if (p.accent !== 'none') out += `${sel} { border-${p.accentSide}: ${p.accentWidth}px solid ${COL[p.accent]}${im}; }\n`;
      if (p.text === 'pair-text') out += `${sel} { color: var(--ab-pair-text); }\n`;
      if (p.pad) out += `${sel} { padding: clamp(18px, 2.8cqw, 26px); }\n`;
      if (p.face !== 'inherit' || p.caps) {
        out += `${sel} { ${p.face === 'display' ? 'font-family: var(--ab-font-h); font-weight: 800;' : p.face === 'mono' ? `font-family: ${MONO}; font-weight: 700;` : ''} ${p.caps ? 'text-transform: uppercase;' : ''} letter-spacing: ${p.tracking}em; font-size: ${p.size}px; }\n`;
      }
      if (p.overlay !== 'none') {
        const ov = p.overlay === 'ripple'
          ? 'right: -22%; top: -40%; width: 78%; aspect-ratio: 1; border-radius: 50%; background: repeating-radial-gradient(circle at 50% 50%, var(--ab-primary) 0 8px, var(--ab-pair-b) 8px 16px); filter: url(#mv-warp-s);'
          : 'inset: 0 0 auto auto; width: 38%; height: 100%; background: repeating-linear-gradient(135deg, var(--ab-secondary) 0 7px, transparent 7px 16px);';
        out += `${sel} { isolation: isolate; overflow: hidden; }\n${pseudo(sel, '::before')} { content: ""; position: absolute; z-index: -1; pointer-events: none; opacity: ${p.overlayOpacity}; ${ov} }\n`;
        const k = kitOnly(sel); if (k) out += `${pseudo(k, '::before')} { content: none; }\n`;
      }
      if (p.kit === 'outline') {
        const k = kitOnly(sel);
        if (k) out += `${k} { background: transparent; color: var(--ab-ink); border: ${p.width}px solid var(--ab-primary); }\n:is(${k}):hover { background: var(--ab-pair-a-tint); color: var(--ab-ink); border-color: var(--ab-primary); }\n`;
      }
      return out;
    },
  },
});

/* heavy-underline: a field that is only a thick underline with a hard echo; app screens get a quiet body-face variant. */
registerMove({
  id: 'heavy-underline', libraryId: 'field-form', what: 'Material: a field with a heavy underline that switches pair colour on focus.', category: 'material', tier: 'recipe',
  params: { width: num(3, [1, 8]), edge: en('pair-b', COLS), focusEdge: en('pair-a', COLS), upper: bool(true), appEcho: bool(true) },
  material: {
    name: 'heavy-underline',
    css(S, sel, p) {
      let out = `${sel} { border: 0; border-bottom: ${p.width}px solid ${COL[p.edge]}; border-radius: 0; background: none; padding: 9px 2px; ${p.upper ? 'font-family: var(--ab-font-h); font-weight: 800; text-transform: uppercase; letter-spacing: 0.01em;' : ''} font-size: 15px; box-shadow: none; }
:is(${sel}):focus { border-bottom-color: ${COL[p.focusEdge]}; box-shadow: 0 5px 0 -2px ${COL[p.edge]}; }\n`;
      const k = kitOnly(sel);
      if (k) out += `${k} { font-family: var(--ab-font-b); font-weight: 400; text-transform: none; letter-spacing: 0; border-bottom: 2px solid var(--ab-ink); ${p.appEcho ? `box-shadow: 0 3px 0 ${COL[p.edge]};` : ''} }
:is(${k}):is(:focus, :focus-visible, .is-focus) { border-bottom-color: ${COL[p.focusEdge]}; border-bottom-width: 3px; }\n`;
      return out;
    },
  },
});

/* legend-switch: a switch that prints a word in each state (OFF / ON AIR style). */
registerMove({
  id: 'legend-switch', libraryId: 'text-legend-controls', what: 'Material: a switch that shows legend text (OFF and ON AIR) instead of a knob.', category: 'material', tier: 'recipe',
  params: { off: txt('OFF'), on: txt('ON'), width: num(76, [40, 120]), height: num(26, [18, 40]), edge: en('pair-b', COLS) },
  material: {
    name: 'legend-switch',
    css(S, sel, p) {
      const esc = s => String(s).replace(/"/g, '\\"');
      return `${sel} { width: ${p.width}px; height: ${p.height}px; border: 2px solid ${COL[p.edge]}; border-radius: 0; background: none; transition: none; }
${pseudo(sel, '::before')} { content: "${esc(p.off)}"; left: 0; top: 0; width: 100%; height: 100%; display: grid; place-items: center; border-radius: 0; background: none; transform: none; color: var(--ab-muted); font: 700 10px/1 ${MONO}; letter-spacing: 0.16em; }
${lines(sel).map(s => `${s}:checked`).join(',\n')} { background: repeating-linear-gradient(90deg, var(--ab-primary) 0 6px, var(--ab-pair-b) 6px 9px); }
${lines(sel).map(s => `${s}:checked::before`).join(',\n')} { content: "${esc(p.on)}"; left: 4px; top: 3px; width: calc(100% - 8px); height: calc(100% - 6px); transform: none; color: var(--ab-pair-b); background: #050505; }`;
    },
  },
});

/* pair-check: square check / radio in ink, checked state filled with pair-a (and a hard echo on checkboxes). */
registerMove({
  id: 'pair-check', libraryId: null, what: 'Material: checkbox and radio drawn in the pair colours.', category: 'material', tier: 'recipe',
  params: { width: num(2, [1, 4]), echo: num(3, [0, 6]) },
  material: {
    name: 'pair-check',
    css(S, sel, p) {
      const ch = lines(sel).map(s => `${s}:checked`).join(',\n');
      const mark = lines(sel).map(s => `${s}:checked::after`).join(',\n');
      return `${sel} { border: ${p.width}px solid var(--ab-ink); background: var(--ab-canvas); }
${ch} { background: var(--ab-primary); border-color: var(--ab-ink); box-shadow: ${p.echo}px ${p.echo}px 0 var(--ab-pair-b); }
${mark} { border-color: var(--ab-on-primary); }`;
    },
  },
});

/* pair-slider: square track and thumb, fill in pair-a, hard echo on the thumb. */
registerMove({
  id: 'pair-slider', libraryId: null, what: 'Material: range slider with a pair-coloured track and block thumb.', category: 'material', tier: 'recipe',
  params: { track: num(6, [2, 14]), thumbW: num(22, [10, 40]), thumbH: num(28, [10, 44]), echo: num(3, [0, 6]) },
  material: {
    name: 'pair-slider',
    css(S, sel, p) {
      return `${pseudo(sel, '::-webkit-slider-runnable-track')} { height: ${p.track}px; border-radius: 0; background: linear-gradient(90deg, var(--ab-primary) var(--v, 50%), color-mix(in srgb, var(--ab-ink) 22%, transparent) var(--v, 50%)); }
${pseudo(sel, '::-webkit-slider-thumb')} { width: ${p.thumbW}px; height: ${p.thumbH}px; margin-top: ${Math.round((p.track - p.thumbH) / 2)}px; border-radius: 0; border: 2px solid var(--ab-ink); background: var(--ab-primary); box-shadow: ${p.echo}px ${p.echo}px 0 var(--ab-pair-b); }`;
    },
  },
});

/* skyline-fill: progress bars as a repeating skyline image in pair-a over a hairline track. */
registerMove({
  id: 'skyline-fill', libraryId: 'colour-bar-strip', what: 'Material: progress bar filled with the skyline bar pattern.', category: 'material', tier: 'recipe',
  params: { height: num(14, [6, 30]), cell: num(30, [10, 80]) },
  material: {
    name: 'skyline-fill',
    css(S, sel, p) {
      const kid = lines(sel).map(s => `${s} i`).join(',\n');
      return `${sel} { height: ${p.height}px !important; border-radius: 0; background: none; border-bottom: 1px solid var(--ab-line); box-shadow: none; }
${kid} { height: ${p.height}px; border-radius: 0; background: var(--ab-skyline-a) 0 0 / ${p.cell}px ${p.height}px repeat-x; }`;
    },
  },
});

/* pair-alternating-rows: rows tinted in the pair, alternating. */
registerMove({
  id: 'pair-alternating-rows', libraryId: 'positional-colour-cycle', what: 'Material: list rows that alternate between the two pair colours.', category: 'material', tier: 'recipe',
  params: { rule: num(1, [0, 3]) },
  material: {
    name: 'pair-alternating-rows',
    css(S, sel, p) {
      return `${lines(sel).map(s => `${s}:nth-child(odd)`).join(',\n')} { background: var(--ab-pair-a-tint); }
${lines(sel).map(s => `${s}:nth-child(even)`).join(',\n')} { background: var(--ab-pair-b-tint); }
${sel} { border-bottom: ${p.rule}px solid var(--ab-line); }`;
    },
  },
});

/* ticket-tab: skewed tab with a dotted perforated left edge; selected = pair-a block (via pair-selected). */
registerMove({
  id: 'ticket-tab', libraryId: 'ticket-cutout', what: 'Material: tabs as skewed ticket stubs with a dotted perforated left edge.', category: 'material', tier: 'generator',
  params: { skew: num(-8, [-20, 20]), edge: en('pair-b', COLS), width: num(2, [1, 5]), perf: num(3, [0, 6]), face: en('mono', ['mono', 'inherit']) },
  material: {
    name: 'ticket-tab',
    css(S, sel, p) {
      return `${sel} { position: relative; min-height: 40px; padding: 10px 6px 10px 12px; border: ${p.width}px solid ${COL[p.edge]}; border-left: ${p.perf}px dotted ${COL[p.edge]}; border-radius: 0; background: none; color: var(--ab-ink); transform: skewX(${p.skew}deg); ${p.face === 'mono' ? `font: 700 12px/1 ${MONO}; letter-spacing: 0.1em; text-transform: uppercase;` : ''} }
${lines(sel).filter(s => !s.includes('.sb-kit')).map(s => `${s} + ${s.split(' ').slice(-1)[0]}`).join(',\n')} { margin-left: 4px; }
${S} .ab-seg { gap: 0; padding: 0; border-radius: 0; background: none; }
${pseudo(lines(sel).map(s => `${s}[aria-selected="true"]`).join(',\n'), '::after')} { display: none; }`;
    },
  },
});

/* barcode-serial: a dense info strip under every section header, ending in a striped barcode. */
registerMove({
  id: 'barcode-serial', libraryId: 'barcode-serial', what: 'Prints a barcode and serial line under the label row.', category: 'structure', tier: 'generator',
  params: { text: txt(''), size: num(9, [7, 12]), barcodeW: num(84, [0, 160]) },
  css(S, p) {
    const esc = s => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return `${S}:not(.sb-kit) .ab-labelrow::after { ${p.text ? `content: "${esc(p.text)}";` : ''} flex: 1 1 100%; order: 3; margin-top: 8px; padding: 3px ${p.barcodeW + 12}px 3px 0; white-space: nowrap; overflow: hidden; color: var(--ab-muted);
  font: 700 ${p.size}px/1.4 ${MONO}; letter-spacing: 0.14em; border-top: 1px solid var(--ab-line);
  background: repeating-linear-gradient(90deg, var(--ab-ink) 0 1px, transparent 1px 3px, var(--ab-ink) 3px 5px, transparent 5px 6px, var(--ab-ink) 6px 7px, transparent 7px 9px) right 4px / ${p.barcodeW}px 9px no-repeat; }
@container ab (max-width: 600px) { ${S} .ab-labelrow::after { padding-right: 0; background: none; } }`;
  },
});

/* display-card-titles: card titles and body in heavy uppercase display type. */
registerMove({
  id: 'display-card-titles', libraryId: 'warped-display-headline', what: 'Sets card titles in the display face, uppercase and tracked.', category: 'type', tier: 'recipe',
  params: { weight: num(800, [400, 900]) },
  css(S, p) {
    return `${S} .ab-card-title { margin: 22px 0 6px !important; font-weight: ${p.weight}; text-transform: uppercase; letter-spacing: calc(-0.01em * var(--ab-tr, 1)); font-size: clamp(20px, 2.7cqw, 27px); line-height: 1.02; }
${S} .ab-card-body { color: var(--ab-ink); margin-bottom: 20px !important; }`;
  },
});

/* action-glyph: a glyph in the primary action's arrow slot. */
registerMove({
  id: 'action-glyph', libraryId: 'action-with-glyph', what: 'Replaces the action arrow with a chosen glyph.', category: 'structure', tier: 'recipe',
  params: { glyph: txt('✱'), size: num(16, [10, 28]) },
  css(S, p) { return `${S} .ab-cta-arrow::before { content: "${p.glyph}"; font-size: ${p.size}px; }`; },
});

/* mono-ui-labels: toggle / status / state / field labels in mono caps. */
registerMove({
  id: 'mono-ui-labels', libraryId: 'caps-mono-labels', what: 'Sets toggle, status, state and field labels in mono caps.', category: 'type', tier: 'recipe',
  params: { tracking: num(0.12, [0, 0.3]), size: num(10.5, [8, 14]) },
  css(S, p) {
    return `${S} :is(.ab-fieldlabel, .ab-state, .ab-state-name, .ab-status, .sb-k-slider-h) { color: var(--ab-ink); font-family: ${MONO}; font-size: ${p.size}px; font-weight: 700; letter-spacing: ${p.tracking}em; text-transform: uppercase; }
${S} .ab-toggle { font-family: ${MONO}; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
${S} .ab-states { margin-top: 22px; gap: 12px; }
${S} .ab-state-ctl { padding: 10px 6px; font-size: 12px; }
${S} .ab-state-ctl.is-pressed { background: var(--ab-ink); color: var(--ab-canvas); border-color: var(--ab-primary); }`;
  },
});

/* ================= STATES ================= */

registerMove({
  id: 'stretch-flip', libraryId: 'state-signature', what: 'State: hover and press stretch the control vertically and swap its pair colours.', category: 'state', tier: 'recipe',
  params: { hoverScale: num(1.05, [1, 1.3]), skew: num(-12, [-30, 0]), split: num(2, [0, 6]) },
  state: {
    name: 'stretch-flip',
    css(S, sel, p, ctx) {
      return `${sel} { transition: transform 0.15s ease, background 0.15s ease; transform-origin: 0 50%; }
${ctx.ON.hover(sel)} { background: var(--ab-pair-b); color: var(--ab-on-pair-b); border-color: var(--ab-primary); }
${lines(sel).filter(s => !s.includes('.sb-kit')).map(s => `${s}:hover:not(.ab-state-ctl)`).join(',\n')} { transform: scaleX(${p.hoverScale}); }
${ctx.ON.press(sel)} { transform: skewX(${p.skew}deg); text-shadow: ${p.split}px 0 var(--ab-pair-b), -${p.split}px 0 var(--ab-ink); }
${S}.sb-ab.sb-kit .sb-k-pressed { box-shadow: none !important; transform: translate(3px, 3px) !important; text-shadow: none !important; }
@media (prefers-reduced-motion: reduce) { ${sel} { transition: none; } }`;
    },
  },
});

registerMove({
  id: 'pair-selected', libraryId: 'ink-filled-selected', what: 'State: the selected item fills with a pair colour.', category: 'state', tier: 'recipe',
  params: { fill: en('pair-a', ['pair-a', 'pair-b', 'ink', 'tint']), tracking: num(0.14, [0, 0.3]) },
  state: {
    name: 'pair-selected',
    css(S, sel, p, ctx) {
      return `${ctx.ON.selected(sel)} { ${p.fill === 'tint' ? 'background: var(--ab-pair-a-tint); color: var(--ab-ink);' : `background: ${COL[p.fill]}; color: ${ON[p.fill]};`} letter-spacing: ${p.tracking}em; }`;
    },
  },
});

registerMove({
  id: 'disabled-hatch', libraryId: 'disabled-state', what: 'State: a disabled control shows a diagonal hatch and loses its offset shadow.', category: 'state', tier: 'recipe',
  params: { gap: num(3, [1, 8]) },
  state: {
    name: 'disabled-hatch',
    css(S, sel, p, ctx) {
      return `${ctx.ON.disabled(sel)} { box-shadow: none; background-image: repeating-linear-gradient(45deg, var(--ab-pair-b) 0 2px, transparent 2px ${2 + p.gap}px); }`;
    },
  },
});

/* ================= KIT MATERIALS (components with child parts) ================= */
const kid = (sel, c) => lines(sel).map(s => `${s} ${c}`).join(',\n');
const sfx = (sel, c) => lines(sel).map(s => s + c).join(',\n');
const caps = (size, track) => `font-family: ${MONO}; font-size: ${size}px; font-weight: 700; letter-spacing: ${track}em; text-transform: uppercase;`;

registerMove({
  id: 'pair-link', libraryId: null, what: 'Material: an inline link in bold primary text with a thick partner-colour underline; pressed fills with a tint.', category: 'material', tier: 'recipe',
  params: { thickness: num(3, [1, 6]), offset: num(3, [0, 8]), under: en('pair-b', COLS) },
  material: {
    name: 'pair-link',
    css(S, sel, p) {
      return `${sel} { color: var(--ab-pair-text, var(--ab-primary)); font-weight: 700; text-decoration: underline; text-decoration-thickness: ${p.thickness}px; text-decoration-color: ${COL[p.under]}; text-underline-offset: ${p.offset}px; }
${sfx(sel, '.sb-k-pressed')} { background: var(--ab-pair-a-tint); box-shadow: none; text-decoration-color: var(--ab-primary); }`;
    },
  },
});

registerMove({
  id: 'pair-stepper', libraryId: null, what: 'Material: a square stepper with ink edge, hard echo, primary-filled buttons and a mono value.', category: 'material', tier: 'recipe',
  params: { width: num(2, [1, 5]), echo: num(3, [0, 6]) },
  material: {
    name: 'pair-stepper',
    css(S, sel, p) {
      return `${sel} { border: ${p.width}px solid var(--ab-ink); border-radius: 0; box-shadow: ${p.echo}px ${p.echo}px 0 var(--ab-pair-b); }
${kid(sel, '.sb-k-step')} { border: 0; border-radius: 0; background: var(--ab-primary); color: var(--ab-on-primary); font-weight: 800; }
${kid(sel, '.sb-k-step:first-child')} { border-right: ${p.width}px solid var(--ab-ink); }
${kid(sel, '.sb-k-step:last-child')} { border-left: ${p.width}px solid var(--ab-ink); }
${kid(sel, '.sb-k-step:hover:not(:disabled)')} { background: var(--ab-pair-b); color: var(--ab-on-pair-b); }
${kid(sel, '.sb-k-step:disabled')} { background: transparent; color: var(--ab-muted); }
${kid(sel, '.sb-k-step-val')} { font-family: ${MONO}; font-weight: 700; font-variant-numeric: tabular-nums; text-align: center; color: var(--ab-ink); }`;
    },
  },
});

registerMove({
  id: 'pair-day', libraryId: null, what: 'Material: calendar days as square mono cells; today outlined, range tinted, selection filled with a partner-colour bar.', category: 'material', tier: 'recipe',
  params: { bar: num(4, [0, 8]) },
  material: {
    name: 'pair-day',
    css(S, sel, p) {
      return `${sel} { border-radius: 0; font-family: ${MONO}; font-weight: 700; font-variant-numeric: tabular-nums; }
${sfx(sel, '.is-today')} { box-shadow: inset 0 0 0 2px var(--ab-ink); }
${sfx(sel, '.is-range')} { background: var(--ab-pair-a-tint); }
${[].concat(lines(sel).flatMap(s => ['.is-sel', '.is-start', '.is-end'].map(c => s + c))).join(',\n')} { background: var(--ab-primary); color: var(--ab-on-primary); box-shadow: inset 0 -${p.bar}px 0 var(--ab-pair-b); }
${sfx(sel, '.is-out')} { color: var(--ab-muted); }`;
    },
  },
});

registerMove({
  id: 'pair-calendar', libraryId: null, what: 'Material: a calendar panel with ink edge, hard echo, a heavy rule under a display-caps month title and mono caps weekday letters.', category: 'material', tier: 'recipe',
  params: { width: num(2, [1, 5]), echo: num(3, [0, 6]), rule: num(3, [1, 6]) },
  material: {
    name: 'pair-calendar',
    css(S, sel, p) {
      return `${sel} { border: ${p.width}px solid var(--ab-ink); border-radius: 0; background: var(--ab-canvas); box-shadow: ${p.echo}px ${p.echo}px 0 var(--ab-pair-b); }
${kid(sel, '.sb-k-cal-head')} { border-bottom: ${p.rule}px solid var(--ab-ink); }
${kid(sel, '.sb-k-cal-t')} { font-family: var(--ab-font-h); font-weight: 800; letter-spacing: 0.02em; text-transform: uppercase; }
${kid(sel, '.sb-k-cal-dow')} { ${caps(11, 0.1)} color: var(--ab-muted); }`;
    },
  },
});

registerMove({
  id: 'pair-wheel', libraryId: null, what: 'Material: a square picker wheel with a tinted centre band bracketed by primary rules.', category: 'material', tier: 'recipe',
  params: { width: num(2, [1, 5]) },
  material: {
    name: 'pair-wheel',
    css(S, sel, p) {
      return `${sel} { border: ${p.width}px solid var(--ab-ink); border-radius: 0; background: var(--ab-canvas); }
${kid(sel, '.sb-k-wheel-item')} { font-family: ${MONO}; font-weight: 700; color: var(--ab-muted); }
${kid(sel, '.sb-k-wheel-item.is-sel')} { color: var(--ab-ink); font-weight: 800; }
${kid(sel, '.sb-k-wheel-band')} { border-radius: 0; background: var(--ab-pair-a-tint); box-shadow: inset 0 2px 0 var(--ab-primary), inset 0 -2px 0 var(--ab-primary); }`;
    },
  },
});

registerMove({
  id: 'pair-inset-frame', libraryId: null, what: 'Material: an overlay scrim framed by an inset border in a pair colour.', category: 'material', tier: 'recipe',
  params: { width: num(4, [1, 10]), colour: en('pair-a', COLS) },
  material: { name: 'pair-inset-frame', css(S, sel, p) { return `${sel} { box-shadow: inset 0 0 0 ${p.width}px ${COL[p.colour]}; border-radius: 0; }`; } },
});

registerMove({
  id: 'pair-pulse', libraryId: null, what: 'Material: spinner and skeleton parts as square stepped blocks that turn or blink in jumps.', category: 'material', tier: 'recipe',
  params: { steps: num(8, [2, 12]), ring: num(4, [2, 8]) },
  material: {
    name: 'pair-pulse',
    css(S, sel, p) {
      const spin = lines(sel).filter(s => /spin/.test(s)).join(',\n'), skel = lines(sel).filter(s => /skel/.test(s)).join(',\n');
      let out = '';
      if (spin) out += `${spin.replace(/\.sb-k-spin\b/g, '.sb-k-spinner')} { ${caps(12, 0.1)} }\n${spin} { border: ${p.ring}px solid var(--ab-pair-a-tint); border-top-color: var(--ab-primary); border-right-color: var(--ab-pair-b); border-radius: 0; animation: mv-pair-spin 0.9s steps(${p.steps}) infinite; }\n@keyframes mv-pair-spin { to { transform: rotate(360deg); } }\n`;
      if (skel) out += `${skel} { border-radius: 0; background: var(--ab-pair-a-tint); box-shadow: inset 0 -3px 0 color-mix(in srgb, var(--ab-primary) 55%, transparent); animation: mv-pair-blink 1.2s steps(2) infinite; }\n@keyframes mv-pair-blink { 50% { opacity: 0.55; } }\n`;
      return out + `@media (prefers-reduced-motion: reduce) { ${sel} { animation: none; } }`;
    },
  },
});

registerMove({
  id: 'pair-scroll', libraryId: null, what: 'Material: a square scrollbar with a primary thumb in an ink edge.', category: 'material', tier: 'recipe',
  params: { width: num(2, [1, 4]) },
  material: {
    name: 'pair-scroll',
    css(S, sel, p) {
      return `${sel} { border-radius: 0; background: color-mix(in srgb, var(--ab-ink) 10%, transparent); }
${kid(sel, '.sb-k-sbar-thumb')} { border: ${p.width}px solid var(--ab-ink); border-radius: 0; background: var(--ab-primary); }`;
    },
  },
});

registerMove({
  id: 'pair-heavy-rule', libraryId: 'heavy-rule', what: 'Material: a divider as a solid heavy rule in an ink or pair colour.', category: 'material', tier: 'recipe',
  params: { height: num(3, [1, 8]), colour: en('ink', COLS) },
  material: { name: 'pair-heavy-rule', css(S, sel, p) { return `${sel} { height: ${p.height}px; min-height: 0; background: ${COL[p.colour]}; border: 0; }\n${pseudo(sel, '::before')} { content: none; }`; } },
});

registerMove({
  id: 'pair-accordion', libraryId: null, what: 'Material: accordion rows with a heavy top rule, display-caps summaries, an open summary filled with a pair colour and a partner-colour bar on the body.', category: 'material', tier: 'recipe',
  params: { width: num(2, [1, 5]), bar: num(4, [0, 8]) },
  material: {
    name: 'pair-accordion',
    css(S, sel, p) {
      return `${sel} { border: 0; border-bottom: ${p.width}px solid var(--ab-ink); border-radius: 0; background: none; }
${kid(sel, '.sb-k-acc-sum')} { font-family: var(--ab-font-h); font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; }
${lines(sel).map(s => `${s}[open] > .sb-k-acc-sum`).join(',\n')} { background: var(--ab-primary); color: var(--ab-on-primary); }
${kid(sel, '.sb-k-acc-body')} { box-shadow: inset ${p.bar}px 0 0 var(--ab-pair-b); }`;
    },
  },
});

registerMove({
  id: 'pair-crumbs', libraryId: null, what: 'Material: breadcrumbs in mono caps with underlined links, a pair-coloured separator and the current page marked by a thick bar.', category: 'material', tier: 'recipe',
  params: { size: num(12, [9, 16]), tracking: num(0.08, [0, 0.3]), bar: num(4, [1, 8]) },
  material: {
    name: 'pair-crumbs',
    css(S, sel, p) {
      return `${kid(sel, 'ol')} { ${caps(p.size, p.tracking)} }
${kid(sel, 'a')} { text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 3px; }
${kid(sel, '[aria-current="page"]')} { color: var(--ab-ink); font-weight: 800; box-shadow: inset 0 -${p.bar}px 0 var(--ab-primary); }
${kid(sel, '.sb-k-crumb-sep')} { color: var(--ab-pair-text, var(--ab-primary)); font-weight: 800; }`;
    },
  },
});

registerMove({
  id: 'pair-anchors', libraryId: null, what: 'Material: an on-this-page list on a heavy left rule in mono caps; the active link gets a primary bar and a tint.', category: 'material', tier: 'recipe',
  params: { size: num(12, [9, 16]), tracking: num(0.08, [0, 0.3]), width: num(2, [1, 5]) },
  material: {
    name: 'pair-anchors',
    css(S, sel, p) {
      return `${sel} { border-left: ${p.width}px solid var(--ab-ink); }
${kid(sel, 'a')}, ${kid(sel, '.sb-k-anchors-label')} { ${caps(p.size, p.tracking)} }
${kid(sel, 'a')} { margin-left: -${p.width}px; }
${kid(sel, 'a.is-on')} { border-left: 4px solid var(--ab-primary); background: var(--ab-pair-a-tint); color: var(--ab-ink); }`;
    },
  },
});

registerMove({
  id: 'pair-pie', libraryId: null, what: 'Material: radial menu items as square canvas blocks with an ink edge; the active item fills with a pair colour and a hard echo.', category: 'material', tier: 'recipe',
  params: { width: num(2, [1, 4]), echo: num(3, [0, 6]) },
  material: {
    name: 'pair-pie',
    css(S, sel, p) {
      const items = lines(sel).filter(s => /item/.test(s)).join(',\n');
      if (!items) return '';
      return `${items} { border: ${p.width}px solid var(--ab-ink); border-radius: 0; background: var(--ab-canvas); color: var(--ab-ink); box-shadow: none; }
${sfx(items, ':hover')} { background: var(--ab-pair-a-tint); }
${sfx(items, '.is-on')} { background: var(--ab-primary); color: var(--ab-on-primary); box-shadow: ${p.echo}px ${p.echo}px 0 var(--ab-pair-b); }`;
    },
  },
});

/* ================= KIT STATES ================= */

registerMove({
  id: 'pair-current', libraryId: 'ink-filled-selected', what: 'State: the current, open or expanded item fills with a pair colour or its tint.', category: 'state', tier: 'recipe',
  params: { fill: en('pair-a', ['pair-a', 'pair-b', 'tint']), bar: num(0, [0, 8]), kids: { kind: 'text', default: '', selector: true } },   // kids: a child selector to mark instead of the component itself
  state: {
    name: 'pair-current',
    css(S, sel, p) {
      const flag = ':is([aria-current]:not([aria-current="false"]), [aria-expanded="true"], .is-on, .is-open)';
      const on = p.kids ? lines(sel).map(x => `${x} ${p.kids}${flag}`).join(',\n') : `:is(${sel})${flag}`;
      const f = p.fill === 'tint' ? 'background: var(--ab-pair-a-tint); color: var(--ab-ink);' : `background: ${COL[p.fill]}; color: ${ON[p.fill]};`;
      return `${on} { ${f}${p.bar ? ` box-shadow: inset ${p.bar}px 0 0 var(--ab-pair-b);` : ''} }`;
    },
  },
});

registerMove({
  id: 'pair-item-selected', libraryId: 'ink-filled-selected', what: 'State: the selected child item of a list gets a tint and a primary bar down its left edge.', category: 'state', tier: 'recipe',
  params: { bar: num(4, [0, 8]) },
  state: {
    name: 'pair-item-selected',
    css(S, sel, p) {
      return `${kid(sel, 'li[aria-selected="true"]')} { background: var(--ab-pair-a-tint); color: var(--ab-ink); box-shadow: inset ${p.bar}px 0 0 var(--ab-primary); }`;
    },
  },
});
})();
