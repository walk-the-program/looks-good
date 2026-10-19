/* 46 Data Pebble — calm, quantified, organic. Reference: the humane look of a good
   impact report (annual-report data stories, Pitch / Our World in Data style
   explainers, wellbeing and climate dashboards). Numbers lead: big light serif
   figures with lining tabular numerals. Organic pebble shapes carry quantity:
   smooth, irregular, closed blobs whose AREA is proportional to the value.
   Ground is a pale tint of the brand hue (sage-grey in light, a deep tinted
   green-black in dark); app surfaces are solid white (dark: a raised tint) with an
   18px corner, a hairline tinted to the ground and a very soft tinted shadow.
   Primary is printed as a deep pebble tone (white text on it holds 7:1 or more
   in light; a lighter tint with dark text in dark). One soft secondary draws the
   comparison series. Board and website only: frosted cards over a soft gradient
   field of blurred pebbles. App screens carry no art; pebbles appear there only
   as data (a stat tile's pebble sparkline, pebble progress, a row's pebble glyph). */

/* ---------- pebble geometry (shared by the board art, the deck and the list) ---------- */

// Small seeded PRNG so every pebble differs but is the same on every render.
// The deep pebble tone for a brand primary on a ground (also used by the pattern inks below).
function dpDeep(primary, dark, canvas) {
  const h = hexToHsl(primary);
  const s = Math.max(24, Math.min(58, h.s * 0.85));
  if (dark) {
    let l = 72, hex = hslToHex(h.h, s, l);
    while (contrastRatio(hex, canvas) < 7 && l < 90) { l += 1; hex = hslToHex(h.h, s, l); }
    return hex;
  }
  let l = Math.min(h.l, 28), hex = hslToHex(h.h, s, l);
  while (contrastRatio(hex, '#ffffff') < 7 && l > 8) { l -= 1; hex = hslToHex(h.h, s, l); }
  return hex;
}
// Pebble tones for the pattern engine (js/patterns/fit.js, colourway 'pebble-ink'): a soft pebble and
// a paler one on the tinted ground, the deep pebble as the single dark mark. Never the raw brand hex.
if (typeof window !== 'undefined') {
  window.dpPrintInks = function (primary, dark, ground) {
    const deep = dpDeep(primary, dark, ground);
    return { ink1: slMix(deep, ground, 0.55), ink2: slMix(deep, ground, 0.26), spark: deep, deep };
  };
}

function dpRand(seed) {
  let a = (seed * 2654435761 + 1013904223) >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Closed Catmull-Rom through points -> cubic Bezier path (no corners anywhere).
function dpSmooth(pts) {
  const n = pts.length, f = v => v.toFixed(1);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + 'Z';
}

// One pebble: 8 control points around a centre, radius and angle nudged by the seed, a slight
// stretch; then scaled so its area is exactly pi * r^2 (area follows the value). Returns a path.
function dpPebble(cx, cy, r, seed) {
  const rnd = dpRand(seed), n = 8;
  const rot = rnd() * Math.PI * 2, sx = 0.9 + rnd() * 0.2;
  const raw = [];
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * Math.PI * 2 + (rnd() - 0.5) * 0.3 * ((Math.PI * 2) / n);
    const rad = 0.9 + rnd() * 0.2;
    raw.push([Math.cos(a) * rad * sx, Math.sin(a) * rad / sx]);
  }
  // flatten the smoothed outline to measure its area, then rescale to pi * r^2
  const curve = [];
  for (let i = 0; i < n; i++) {
    const p0 = raw[(i - 1 + n) % n], p1 = raw[i], p2 = raw[(i + 1) % n], p3 = raw[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    for (let s = 0; s < 6; s++) {
      const u = s / 6, v = 1 - u;
      curve.push([v * v * v * p1[0] + 3 * v * v * u * c1[0] + 3 * v * u * u * c2[0] + u * u * u * p2[0], v * v * v * p1[1] + 3 * v * v * u * c1[1] + 3 * v * u * u * c2[1] + u * u * u * p2[1]]);
    }
  }
  let area = 0;
  curve.forEach((p, i) => { const q = curve[(i + 1) % curve.length]; area += p[0] * q[1] - q[0] * p[1]; });
  const k = r / Math.sqrt(Math.abs(area) / 2 / Math.PI);
  return dpSmooth(raw.map(p => [cx + p[0] * k, cy + p[1] * k]));
}

// Radius of the pebble for a value, so area is proportional to the value.
const dpRadius = (value, k) => k * Math.sqrt(Math.max(0, value));

registerAesthetic({
  key: 'data-pebble', order: 47,
  name: 'Data Pebble',
  descriptor: 'Calm · Quantified · Organic',
  influences: 'Impact reports / Data stories / Wellbeing dashboards',
  summary: 'A calm impact-report look: big light serif figures, and smooth pebble shapes whose area carries the quantity, on a pale tinted ground.',
  motto: 'Numbers first. Shapes that breathe.',
  kicker: 'Numbers first',
  mode: 'light',
  slideShape: 'soft',
  labels: { material: 'Surfaces & pebbles', states: ['Rest', 'Hover', 'Pressed'], statesKind: 'button' },
  layout: { hero: 'split', palette: 'swatches', sections: 'two-col' },
  type: { ui: 'sans', label: 'sans', display: 1 },
  highlight: 'ink',
  cardFill: '--ab-surface',

  roles: {
    canvas: {
      use: 'The ground: a pale tint of the brand hue (sage-grey in light, a deep tinted green-black in dark) behind white cards and the frosted board panels',
      never: 'Text, or the fill of a card (cards are white)',
      coverage: '45–60%',
    },
    ink: {
      use: 'Headlines, the big serif figures, body text and the selected segment label',
      never: 'A large filled field in light mode',
      coverage: '15–20%',
    },
    primary: {
      use: 'The deep pebble tone: the main pill button, the pebbles of the lead data series, the filled pebbles of progress, switch "on", the focus ring and the delta tags',
      never: 'Body text smaller than 16px, a second main button, card fills',
      coverage: '≈10–15%',
    },
    secondary: {
      use: 'The comparison series only (the ring-style pebbles of the previous period, the soft tint behind a selected row, the second chart series)',
      never: 'The main action, body text, the page ground',
      coverage: '≈10%',
    },
    accent: {
      use: 'One spark: the highlighted word in the headline and the small new-item dot',
      never: 'Buttons, pebble fills, body text, card fills',
      coverage: '≤3%',
    },
  },

  // The ground is a low-chroma tint of the brand's primary hue: pale sage-grey / sky-grey in
  // light, a deep tinted near-black in dark. Pure ground (state.pureBg) replaces it, as everywhere.
  canvas(b) {
    const h = b.hexToHsl(b.primary);
    if (b.isDark) return b.hslToHex(h.h, Math.max(6, Math.min(24, h.s * 0.4)), 9.5);
    return b.hslToHex(h.h, h.s < 6 ? 3 : Math.max(8, Math.min(16, h.s * 0.3)), 93.5);
  },

  // The primary is printed as the deep pebble tone. Light: the brand hue pulled to lightness <= 28
  // and pushed darker until white text holds 7:1. Dark: a lighter tint (lightness >= 72) that
  // holds 7:1 on the ground, so dark text sits on it at 4.5:1 or more and pebbles read at 3:1.
  printPrimary(t) { return dpDeep(t.primary, t.isDark, t.canvas); },

  tokens(t, view) {
    const d = t.isDark;
    const deep = t.printPrimary;                       // the pebble tone (already clamped)
    const surface = d ? t.mix('#ffffff', t.canvas, 0.07) : '#ffffff';
    const surface2 = d ? t.mix('#ffffff', t.canvas, 0.11) : t.mix(deep, '#ffffff', 0.05);   // a step off the card (selected / inset)
    // muted text sits on the card and on the ground: pull it toward ink until it holds 4.6:1 on both
    let muted = t.muted;
    for (let k = 0.1; k <= 1.001 && (t.contrast(muted, surface) < 4.6 || t.contrast(muted, t.canvas) < 4.6 || t.contrast(muted, surface2) < 4.6); k += 0.1) muted = t.mix(t.ink, t.muted, k);
    // the frosted board card is 62% surface over the tinted field: its small text gets its own muted
    const fieldA = t.mix(t.secondary, t.canvas, d ? 0.34 : 0.34), fieldB = t.mix(deep, t.canvas, 0.2);
    const glassA = t.mix(surface, fieldA, 0.62), glassB = t.mix(surface, fieldB, 0.62);
    let mutedGlass = muted;
    for (let k = 0.1; k <= 1.001 && (t.contrast(mutedGlass, glassA) < 4.6 || t.contrast(mutedGlass, glassB) < 4.6); k += 0.1) mutedGlass = t.mix(t.ink, muted, k);
    // hairline tinted to the ground hue (never a grey-black rule)
    const hair = d ? t.mix(deep, surface, 0.2) : t.mix(deep, t.canvas, 0.14);
    // comparison series: a soft secondary fill with a deeper edge of the same hue (edge >= 3:1 on the card)
    const secFill = t.mix(t.secondary, surface, d ? 0.34 : 0.4);
    let secEdge = t.secondary;
    for (let k = 0.05; k <= 1.001 && t.contrast(secEdge, surface) < 3.2; k += 0.05) secEdge = t.mix(t.ink, t.secondary, k);
    // delta tags: the pebble tone on a tint of itself
    const tagBg = t.mix(deep, surface, d ? 0.16 : 0.11);
    let tagInk = deep;
    for (let k = 0.05; k <= 1.001 && t.contrast(tagInk, tagBg) < 4.6; k += 0.05) tagInk = t.mix(t.ink, deep, k);
    // the "down" tag reads as a neutral (no red is invented): ink on a tint of the ink
    const tagDownBg = t.mix(t.ink, surface, d ? 0.12 : 0.07);
    // light serif figures: the lightest published weight at or under 400 (3 of the 5 recommended faces publish 400 only)
    const hf = view && view.headingFont;
    const figW = typeof abWeightNear === 'function' ? abWeightNear(hf, 300) : 400;
    const sh = d
      ? `0 1px 0 rgba(255,255,255,0.04) inset, 0 14px 30px -18px ${t.alpha('#000000', 0.7)}`
      : `0 1px 2px ${t.alpha(deep, 0.06)}, 0 14px 32px -18px ${t.alpha(deep, 0.28)}`;
    return {
      '--ab-muted': muted,
      '--ab-muted-glass': mutedGlass,
      '--ab-surface': surface,
      '--ab-surface-2': surface2,
      '--ab-hair': hair,
      '--ab-primary-text': deep,
      '--ab-peb': deep,
      '--ab-peb-soft': t.mix(deep, surface, d ? 0.28 : 0.2),
      '--ab-peb-track': t.mix(deep, surface, d ? 0.2 : 0.14),
      '--ab-sec-fill': secFill,
      '--ab-sec-edge': secEdge,
      '--ab-tag-bg': tagBg, '--ab-tag-ink': tagInk,
      '--ab-tag-down-bg': tagDownBg,
      '--ab-shadow': sh,
      '--ab-shadow-hi': d
        ? `0 1px 0 rgba(255,255,255,0.06) inset, 0 22px 40px -18px ${t.alpha('#000000', 0.75)}`
        : `0 2px 4px ${t.alpha(deep, 0.07)}, 0 22px 40px -18px ${t.alpha(deep, 0.34)}`,
      '--ab-glass': d ? t.alpha(t.mix('#ffffff', t.canvas, 0.1), 0.62) : t.alpha('#ffffff', 0.62),
      '--ab-glass-edge': d ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.85)',
      '--ab-pri-hover': d ? t.mix('#ffffff', deep, 0.14) : t.mix('#000000', deep, 0.14),
      '--ab-pri-press': d ? t.mix('#ffffff', deep, 0.26) : t.mix('#000000', deep, 0.28),
      '--ab-fig-w': figW,
      '--ab-type-pick-w': figW,
    };
  },

  // Hero art (board, deck cover): a frosted card over a soft field of blurred pebbles. The card
  // holds a pebble cluster chart: this month's completion as filled pebbles, last month's as ring
  // pebbles tucked behind them; area follows the value. Every value is also written in the legend.
  art(ctx) {
    const e = escapeHtml;
    const K = 8.2;
    // [name, now, before, x, y, seed, bx, by]
    const G = [
      ['Brand refresh', 72, 58, 128, 168, 3, 214, 226],
      ['Launch site', 45, 51, 340, 118, 7, 388, 206],
      ['Spring campaign', 10, 4, 468, 98, 11, 490, 140],
    ];
    const rings = G.map((g, i) => `<path class="dpa-b" d="${dpPebble(g[6], g[7], dpRadius(g[2], K), g[5] + 20 + i)}"/>`).join('');
    const fills = G.map(g => `<path class="dpa-a" d="${dpPebble(g[3], g[4], dpRadius(g[1], K), g[5])}"/>`).join('');
    const nums = G.slice(0, 2).map((g, i) => `<text class="dpa-num" x="${g[3]}" y="${g[4]}" dy=".35em" text-anchor="middle" style="font-size:${i ? 26 : 34}px">${g[1]}%</text>`).join('');
    const field = [[70, 60, 120, 0], [430, 300, 150, 1], [250, 20, 60, 2], [20, 300, 80, 3]].map((p, i) =>
      `<path class="dpa-f${i % 2}" d="${dpPebble(p[0], p[1], p[2], 40 + p[3])}"/>`).join('');
    const legend = G.map(g => `<li><span class="dpa-name">${e(g[0])}</span><b class="dpa-val">${g[1]}%</b><span class="dpa-was">last month ${g[2]}%</span></li>`).join('');
    return `<div class="dpa">
      <svg class="dpa-field" viewBox="0 0 520 340" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${field}</svg>
      <div class="dpa-card">
        <div class="dpa-head"><span class="dpa-k">Completion by project</span>
          <span class="dpa-key"><i class="dpa-kd"></i>This month<i class="dpa-kd is-prev"></i>Last month</span></div>
        <svg class="dpa-svg" viewBox="0 0 520 300" aria-hidden="true" focusable="false">${rings}${fills}${nums}</svg>
        <ul class="dpa-leg">${legend}</ul>
      </div>
    </div>`;
  },

  // 03 list on the board: the leading glyph is a real pebble whose area follows the row's percent.
  panels: {
    list(ctx) {
      const e = ctx.e;
      const rows = ctx.rows.map((r, i) => {
        const rad = dpRadius(r[2], 2.15);   // 72% -> r 18.2 in a 44 box; 10% -> 6.8
        return `<li class="ab-row">
      <span class="ab-row-n">${String(i + 1).padStart(2, '0')}</span>
      <span class="ab-av dp-av" aria-hidden="true"><svg viewBox="0 0 44 44" focusable="false"><path d="${dpPebble(22, 22, rad, 60 + i)}"/></svg></span>
      <span class="ab-row-name">${e(r[0])}</span>
      <span class="ab-row-status">${e(r[1])}</span>
      <span class="ab-row-bar" aria-hidden="true"><i style="width:${r[2]}%"></i></span>
      <span class="ab-row-pct">${r[2]}%</span>
    </li>`;
      }).join('');
      return `<ul class="ab-list">${rows}</ul>`;
    },
  },

  materials: [
    { name: 'Ground', css: 'background: {canvas}; /* a low-chroma tint of the brand hue (light ~93.5% lightness, dark ~9.5%); behind everything */' },
    { name: 'Card (app surface)', css: 'background: {surface}; border: 1px solid {hair}; border-radius: 18px; box-shadow: {shadow}; /* solid white in light, a raised tint in dark; the shadow is tinted with the pebble tone, never grey-black */' },
    { name: 'Frosted card (board and website only)', css: 'background: {glass}; border: 1px solid {glassEdge}; border-radius: 22px; backdrop-filter: blur(18px) saturate(140%); /* over the soft pebble field; never in the app */' },
    { name: 'Pebble (lead series)', css: 'fill: {primary}; /* a smooth closed blob, 8 control points, no corners; area = value */' },
    { name: 'Pebble (comparison series)', css: 'fill: {secFill}; stroke: {secEdge}; stroke-width: 1.5px; /* ring style: a soft fill with a deeper edge so it holds 3:1 */' },
    { name: 'Main pill button', css: 'background: {primary}; color: {onPrimary}; border-radius: 999px; min-height: 52px; /* hover {priHover}, pressed {priPress} */' },
    { name: 'Delta tag', css: 'background: {tagBg}; color: {tagInk}; border-radius: 999px; padding: 3px 10px; /* a stat tile\'s change from the last period */' },
    { name: 'Pebble progress', css: 'height: 28px; width: 168px; background: {pebTrack}; fill: {primary}; /* five pebbles in a row fill left to right (mask); 62% = three pebbles and a part */' },
  ],

  rules: {
    do: [
      'Lead with the number: a big light serif figure with lining tabular numerals, then a small label in the UI face.',
      'Let area carry quantity: size every pebble so its area, not its width, follows the value.',
      'Keep pebbles smooth and closed: eight control points, no corners, every pebble slightly different.',
      'Draw the comparison series as soft ring pebbles in the secondary; draw the lead series as filled deep-primary pebbles.',
      'Sit white cards (18px) with a tinted hairline and a soft tinted shadow on the pale tinted ground.',
    ],
    dont: [
      'Put pebble fields, frosted panels or any decoration in the app; pebbles there are data (a sparkline, progress, a row glyph) only.',
      'Use sharp-cornered or perfectly round shapes for data; a perfect circle reads as a dot, not a pebble.',
      'Use more than one filled pebble colour in a series, or the secondary for the lead series.',
      'Use grey-black shadows, hard borders or heavy outlines; every edge and shadow is tinted to the ground hue.',
    ],
  },

  deck: {
    // Material slide: the real components, as small specimens: a card on the ground, the pebble
    // progress and a stat figure with its pebble sparkline. Pure HTML/SVG; styled in the css.
    materialArt(ctx) {
      const e = ctx.e || escapeHtml;
      const spark = [3, 4, 5, 7, 10].map((v, i) => `<path d="${dpPebble(10 + i * 20, 10, dpRadius(v, 2.85), 70 + i)}"/>`).join('');
      const prog = [0, 1, 2, 3, 4].map(i => `<path d="${dpPebble(10 + i * 20, 10, 8.2, 80 + i)}"/>`).join('');
      return `<div class="dpm">
        <div class="dpm-card"><span class="dpm-l">Stat tile</span><b class="dpm-n">72<small>%</small></b>
          <span class="dpm-tag">+8.1%</span>
          <svg class="dpm-spark" viewBox="0 0 100 20" aria-hidden="true" focusable="false">${spark}</svg></div>
        <div class="dpm-card"><span class="dpm-l">Pebble progress</span>
          <svg class="dpm-prog" viewBox="0 0 100 20" aria-hidden="true" focusable="false"><defs><clipPath id="dpm-clip"><rect x="0" y="0" width="62" height="20"/></clipPath></defs><g class="dpm-track">${prog}</g><g class="dpm-fill" clip-path="url(#dpm-clip)">${prog}</g></svg>
          <span class="dpm-cap">${e('62% of the plan')}</span></div>
        <div class="dpm-card dpm-frost"><span class="dpm-l">Frosted card</span><span class="dpm-cap">Board and website only</span></div>
      </div>`;
    },
    principles: [
      ['Numbers lead', 'A big light serif figure first, a small label after it.'],
      ['Area is the value', 'Every pebble is sized so its area follows the number.'],
      ['Calm surfaces', 'White cards on a pale tinted ground, soft tinted shadows.'],
    ],
    do: [
      'Lead with a big serif figure.',
      'Size pebbles by area, never by width.',
      'Draw the comparison as ring pebbles.',
    ],
    dont: [
      'Put decoration in the app.',
      'Use sharp corners on data shapes.',
      'Use grey-black shadows.',
    ],
  },
});
