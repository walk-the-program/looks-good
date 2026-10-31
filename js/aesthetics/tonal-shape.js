/* 50 Tonal Shape — soft, tonal, friendly. Reference: the tonal surfaces and shape libraries of
   current mobile design systems (ideas only: no assets, names or marks). Our spin: every brand
   gets ONE signature shape, drawn from a small library of original SVG paths and picked
   deterministically from the brand name (same name, same shape, every render). The shape is a
   component container: the avatar, the icon button (the floating action button where a product
   has one), the leading icon in a list row and the empty-state icon. The hero art is a
   composition of large interlocking tonal shapes with the brand initial in the signature one.

   Colour is a tonal ramp mixed from the primary into the canvas (light: container-low ~8%,
   container ~12%, container-high ~18%, primary-container a ~30% tint with deep on-container
   text at 7:1 or more); dark mode mirrors it over a deep tinted canvas. No new hues; text is
   only ever ink / muted / on-* tokens. Shape: pill buttons that squish to a 12px corner on
   press, 28px cards and sheets, 12px small containers, a connected segmented control (4px
   inner corners, selected = primary-container), a pill behind the selected tab icon.

   Board and website only: the interlocking hero composition. App screens (.sb-ab, .sb-kit)
   carry no art; there the shape only contains content (initial, icon). */

/* ---------- the signature shape library (all in a 0..100 box, original paths) ---------- */

const TS_F = v => (Math.round(v * 10) / 10).toString();

// Closed Catmull-Rom through points -> cubic Bezier path.
function tsSmooth(pts) {
  const n = pts.length;
  let d = `M${TS_F(pts[0][0])} ${TS_F(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += `C${TS_F(p1[0] + (p2[0] - p0[0]) / 6)} ${TS_F(p1[1] + (p2[1] - p0[1]) / 6)} ${TS_F(p2[0] - (p3[0] - p1[0]) / 6)} ${TS_F(p2[1] - (p3[1] - p1[1]) / 6)} ${TS_F(p2[0])} ${TS_F(p2[1])}`;
  }
  return d + 'Z';
}

// A scalloped circle: `n` vertices on radius rv joined by outward arcs of radius ra.
function tsScallop(n, rv, ra) {
  const pt = i => { const a = -Math.PI / 2 + (i / n) * Math.PI * 2; return [50 + Math.cos(a) * rv, 50 + Math.sin(a) * rv]; };
  let d = `M${TS_F(pt(0)[0])} ${TS_F(pt(0)[1])}`;
  for (let i = 1; i <= n; i++) { const p = pt(i % n); d += `A${ra} ${ra} 0 0 1 ${TS_F(p[0])} ${TS_F(p[1])}`; }
  return d + 'Z';
}

// A four-leaf clover: four circles of radius r whose centres sit `off` from the middle.
function tsClover(off, r) {
  const h = Math.sqrt(r * r - off * off / 2);       // half the common chord of two neighbouring circles
  const c = (off / Math.SQRT2 + h) / Math.SQRT2;    // where their outer meeting point sits on each axis
  const P = [[50 + c, 50 - c], [50 + c, 50 + c], [50 - c, 50 + c], [50 - c, 50 - c]];
  let d = `M${TS_F(P[3][0])} ${TS_F(P[3][1])}`;
  [P[0], P[1], P[2], P[3]].forEach(p => { d += `A${r} ${r} 0 0 1 ${TS_F(p[0])} ${TS_F(p[1])}`; });
  return d + 'Z';
}

// Soft burst: `n` points, alternating outer / inner radius, smoothed so the points stay soft.
function tsBurst(n, ro, ri) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const a = -Math.PI / 2 + (i / (n * 2)) * Math.PI * 2, r = i % 2 ? ri : ro;
    pts.push([50 + Math.cos(a) * r, 50 + Math.sin(a) * r]);
  }
  return tsSmooth(pts);
}

// A polygon with softly rounded corners: each corner is cut `t` of the way along its two edges and
// joined by a quadratic curve through the corner.
function tsRoundPoly(v, t) {
  const n = v.length, at = (a, b) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  let d = '';
  for (let i = 0; i < n; i++) {
    const c = v[i], a = at(c, v[(i - 1 + n) % n]), b = at(c, v[(i + 1) % n]);
    d += `${i ? 'L' : 'M'}${TS_F(a[0])} ${TS_F(a[1])}Q${TS_F(c[0])} ${TS_F(c[1])} ${TS_F(b[0])} ${TS_F(b[1])}`;
  }
  return d + 'Z';
}

const TS_SHAPES = [
  { id: 'cookie', name: 'Scalloped cookie', d: tsScallop(9, 38, 15) },
  { id: 'clover', name: 'Four-leaf clover', d: tsClover(21, 25) },
  { id: 'burst', name: 'Soft burst', d: tsBurst(8, 46, 37) },
  { id: 'arch', name: 'Arch', d: 'M16 90Q10 90 10 84V50A40 40 0 0 1 90 50V84Q90 90 84 90Z' },
  { id: 'diamond', name: 'Rounded diamond', d: tsRoundPoly([[50, 3], [97, 50], [50, 97], [3, 50]], 0.3) },
  { id: 'leaf', name: 'Leaf', d: 'M50 6H86Q94 6 94 14V50A44 44 0 0 1 50 94H14Q6 94 6 86V50A44 44 0 0 1 50 6Z' },
];

// Same brand name, same shape: FNV-1a over the trimmed, lower-cased name.
function tsHash(str) {
  let h = 2166136261;
  const s = String(str == null ? '' : str).trim().toLowerCase();
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  h ^= h >>> 15; h = Math.imul(h, 2246822507) >>> 0; h ^= h >>> 13;
  return h >>> 0;
}
const tsShapeIndex = name => tsHash(name) % TS_SHAPES.length;
const tsShapeFor = name => TS_SHAPES[tsShapeIndex(name)];

// The shape as an unquoted data-URI mask (safe inside an inline style attribute).
function tsMaskUrl(shape) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path d='${shape.d}'/></svg>`;
  return 'url(data:image/svg+xml,' + encodeURIComponent(svg).replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29') + ')';
}

function tsBrandName(view) {
  try {
    if (typeof effectiveContent === 'function') return effectiveContent(view && view.content).brandName;
  } catch (e) { /* fall through */ }
  return (view && view.content && view.content.brandName) || '';
}

// Colour work shared by canvas(), printPrimary() and tokens(). `tone` is the primary kept strong
// enough to tint with: a very light primary would otherwise mix to nothing.
function tsTone(primary, dark) {
  const h = hexToHsl(primary);
  if (dark) return hslToHex(h.h, Math.max(h.s < 8 ? h.s : 30, Math.min(h.s, 80)), 64);
  return hslToHex(h.h, h.s < 8 ? h.s : Math.max(30, Math.min(h.s, 85)), Math.max(38, Math.min(h.l, 56)));
}

// A tone of the primary hue at a chosen lightness, pushed until it holds `floor`:1 on every bg given.
function tsDeep(primary, bgs, floor, from, step) {
  const h = hexToHsl(primary), sat = h.s < 8 ? h.s : Math.min(h.s, 62);
  let l = from, hex = hslToHex(h.h, sat, l);
  const ok = () => bgs.every(b => contrastRatio(hex, b) >= floor);
  while (!ok() && l > 2 && l < 99) { l += step; hex = hslToHex(h.h, sat, l); }
  return hex;
}

registerAesthetic({
  key: 'tonal-shape', order: 50,
  name: 'Tonal Shape',
  descriptor: 'Soft · Tonal · Friendly',
  influences: 'Tonal surfaces / Shape libraries / Pill controls',
  summary: 'A soft, tonal look: surfaces mixed from the brand colour, pill buttons that squish when pressed, and one signature shape per brand that holds the avatar, the icon button and the list icons.',
  motto: 'Soft surfaces. One shape of your own.',
  kicker: 'Tonal shape',
  mode: 'light',
  slideShape: 'soft',
  labels: { material: 'Tones & shapes', states: ['Rest', 'Hover', 'Pressed'], statesKind: 'button' },
  // Editable specimen copy (Brand > Advanced > Specimen copy).
  copy: {
    motto: { label: 'Motto', text: 'Soft surfaces. One shape of your own.', warm: 'Soft surfaces. A shape that is yours.' },
    kicker: { label: 'Kicker above the headline', text: 'Tonal shape' },
    state0: { label: 'State 1 name', text: 'Rest' },
    state1: { label: 'State 2 name', text: 'Hover' },
    state2: { label: 'State 3 name', text: 'Pressed' },
    shapeCap: { label: 'Hero caption: signature shape', text: 'Signature shape' },
    cardShape: { label: 'Material card: shape', text: 'Signature shape' },
    cardShapeCap: { label: 'Shape card caption', text: 'Avatar, icon button, list icon' },
    cardPill: { label: 'Material card: pill button', text: 'Pill, then squish' },
    pillRest: { label: 'Pill button: rest', text: 'Continue' },
    pillPressed: { label: 'Pill button: pressed', text: 'Pressed' },
    cardTone: { label: 'Material card: tonal surfaces', text: 'Tonal surfaces' },
    toneLow: { label: 'Tone: container low', text: 'Low' },
    toneMid: { label: 'Tone: container', text: 'Mid' },
    toneHigh: { label: 'Tone: container high', text: 'High' },
    tonePrimary: { label: 'Tone: primary container', text: 'Primary' },
  },
  layout: { hero: 'split', palette: 'swatches', sections: 'two-col' },
  type: { ui: 'sans', label: 'sans', display: 1 },
  highlight: 'ink',
  cardFill: '--ab-tn-low',

  roles: {
    canvas: {
      use: 'The ground: a 4% tint of the primary in light, a deep primary-tinted dark in dark mode; every tonal container is built up from it',
      never: 'Text, or a card fill (cards are the next tone up)',
      coverage: '45–60%',
    },
    ink: {
      use: 'Headlines, body text, outlines on fields and the unselected segment label',
      never: 'A large filled field in light mode',
      coverage: '15–20%',
    },
    primary: {
      use: 'The one main pill button per view, the lead mark of a hero, switch "on", the filled checkbox and the primary-container tint behind the selected tab, segment and avatar',
      never: 'Body text smaller than 16px, a second main button on the same view, a card fill',
      coverage: '≈10–15%',
    },
    secondary: {
      use: 'The second tonal container (a secondary-container tint) for a tag, a second avatar and the supporting shapes of the hero',
      never: 'The main action, body text, the page ground',
      coverage: '≈10%',
    },
    accent: {
      use: 'One spark: the highlighted word in the headline and the smallest hero shape',
      never: 'Buttons, container fills, body text',
      coverage: '≤3%',
    },
  },

  // The ground is a 4% tint of the primary in light; in dark a deep tint of a lightened primary (5%).
  canvas(b) {
    const dark = b.isDark, tone = tsTone(b.primary, dark);
    // dark: the brand's dark neutral pulled a good way toward black first, so the tinted ground stays deep
    return b.mix(tone, dark ? b.mix('#000000', b.canvas, 0.5) : b.canvas, dark ? 0.06 : 0.04);
  },

  // The primary stays the brand colour; it moves (the least it can, same hue) only when it would not hold
  // 3:1 against the tonal ground or when neither white nor dark text would reach 4.6:1 on it.
  printPrimary(t) {
    const h = hexToHsl(t.primary);
    const ok = hex => contrastRatio(hex, t.canvas) >= 3 && Math.max(contrastRatio(hex, '#ffffff'), contrastRatio(hex, '#141414')) >= 4.6;
    if (ok(t.primary)) return t.primary;
    for (let dl = 1; dl <= 60; dl++) {
      const first = t.isDark ? 1 : -1;
      for (const sgn of [first, -first]) {
        const l = h.l + sgn * dl;
        if (l < 4 || l > 96) continue;
        const hex = hslToHex(h.h, h.s, l);
        if (ok(hex)) return hex;
      }
    }
    return t.primary;
  },

  tokens(t, view) {
    const d = t.isDark;
    const pp = t.printPrimary, ground = t.canvas, ink = t.ink;
    const tone = tsTone(t.primary, d);
    const low = t.mix(tone, ground, d ? 0.05 : 0.045);
    const mid = t.mix(tone, ground, d ? 0.09 : 0.085);
    const high = t.mix(tone, ground, d ? 0.14 : 0.15);
    // primary-container: a ~30% tint (dark: a deeper, richer tone), with a deep on-container text at 7:1
    const pcTone = d ? hslToHex(hexToHsl(tone).h, hexToHsl(tone).s, 40) : tone;
    const pc = t.mix(pcTone, ground, d ? 0.5 : 0.3);
    const onPc = d ? tsDeep(t.primary, [pc], 7, 92, 1) : tsDeep(t.primary, [pc], 7, 16, -1);
    // secondary-container and its text (ink, which holds well over any tint)
    const sc = t.mix(t.secondary, ground, d ? 0.34 : 0.26);
    let onSc = ink;
    // accent tint for the smallest hero shape
    const ac = t.mix(t.accent, ground, d ? 0.4 : 0.42);
    // muted: holds 4.6:1 on the ground and on every container it can sit on
    const beds = [ground, low, mid, high, pc, sc];
    let muted = t.muted;
    for (let k = 0.1; k <= 1.001 && beds.some(b => t.contrast(muted, b) < 4.6); k += 0.1) muted = t.mix(ink, t.muted, k);
    // field / unselected-segment outline: ink pulled toward the ground until it holds 3:1 on the grounds it sits on
    let outline = t.mix(ink, ground, 0.55);
    for (let k = 0.55; k <= 1.001 && [ground, low, mid, high].some(b => t.contrast(outline, b) < 3.1); k += 0.05) outline = t.mix(ink, ground, k);
    const line = t.mix(ink, ground, d ? 0.14 : 0.1);                   // dividers (decorative)
    const shape = tsShapeFor(tsBrandName(view));
    const hf = view && view.headingFont;
    const hw = typeof abWeightNear === 'function' ? abWeightNear(hf, 600) : 600;
    return {
      '--ab-muted': muted,
      '--ab-line': line,
      '--ab-tn-low': low, '--ab-tn-mid': mid, '--ab-tn-high': high,
      '--ab-tn-pc': pc, '--ab-tn-on-pc': onPc,
      '--ab-tn-sc': sc, '--ab-tn-on-sc': onSc,
      '--ab-tn-ac': ac,
      '--ab-tn-outline': outline,
      '--ab-tn-text': onPc,
      '--ab-pri-tint': pc,
      '--ab-sec-tint': sc,
      '--ab-primary-text': onPc,
      '--ab-pri-hover': t.mix(t.onPrimary, pp, 0.1),
      '--ab-pri-press': t.mix(t.onPrimary, pp, 0.16),
      '--ab-hw': hw,
      '--ab-ts-shape-name': shape.name,
      '--ab-ts-shape-path': shape.d,
      '--ts-mask': tsMaskUrl(shape),
    };
  },

  // Hero art (board, deck cover): large interlocking tonal shapes in the palette. The brand's
  // signature shape is the largest, in the primary, with the brand initial in it; four other
  // library shapes interlock with it, each separated from its neighbour by a gap in the panel colour.
  art(ctx) {
    const e = escapeHtml;
    const idx = tsShapeIndex(ctx.brandName);
    const sig = TS_SHAPES[idx], other = k => TS_SHAPES[(idx + k) % TS_SHAPES.length];
    // [shape, x, y, size, rotate, class]
    const parts = [
      [other(1), -4, -6, 124, -12, 'tsa-hi'],
      [other(3), 214, 222, 118, 16, 'tsa-ac'],
      [other(4), 312, 140, 208, -8, 'tsa-sc'],
      [other(2), 222, -14, 206, 14, 'tsa-pc'],
      [sig, 14, 38, 276, 0, 'tsa-sig'],
    ];
    const shapes = parts.map(p => {
      const k = p[3] / 100;
      return `<path class="${p[5]}" d="${p[0].d}" transform="translate(${p[1]} ${p[2]}) rotate(${p[4]} ${p[3] / 2} ${p[3] / 2}) scale(${k})"/>`;
    }).join('');
    const initial = `<text class="tsa-init" x="${14 + 138}" y="${38 + 138}" dy=".36em" text-anchor="middle">${e(ctx.initial)}</text>`;
    return `<div class="tsa">
      <svg class="tsa-svg" viewBox="0 0 520 340" role="img" aria-label="${e(sig.name)}" focusable="false">${shapes}${initial}</svg>
      <p class="tsa-cap"><span>${abCopy(this, 'shapeCap')}</span><b>${e(sig.name)}</b></p>
    </div>`;
  },

  // 03 list on the board: the leading avatar is the brand's signature shape holding the row's initial.
  panels: {
    list(ctx) {
      const e = ctx.e;
      const rows = ctx.rows.map((r, i) => `<li class="ab-row">
      <span class="ab-row-n">${String(i + 1).padStart(2, '0')}</span>
      <span class="ab-av ts-av" aria-hidden="true">${e(r[0][0])}</span>
      <span class="ab-row-name">${e(r[0])}</span>
      <span class="ab-row-status">${e(r[1])}</span>
      <span class="ab-row-bar" aria-hidden="true"><i style="width:${r[2]}%"></i></span>
      <span class="ab-row-pct">${r[2]}%</span>
    </li>`).join('');
      return `<ul class="ab-list">${rows}</ul>`;
    },
  },

  materials: [
    { name: 'Ground', css: 'background: {canvas}; /* light: the primary at 4% over the neutral; dark: a deep tint of the primary; behind everything */' },
    { name: 'Tonal containers', css: 'background: {tnLow} | {tnMid} | {tnHigh}; /* container-low, container, container-high: the primary at about 8%, 12% and 18% over the ground (dark mirrors it); a higher tone is a higher surface, with no shadow and no border */' },
    { name: 'Card and sheet', css: 'background: {tnLow}; border-radius: 28px; /* sheets round only the top corners; small containers (field, callout, toast, menu) use 12px */' },
    { name: 'Primary container', css: 'background: {tnPc}; color: {tnOnPc}; /* a ~30% tint of the primary with deep on-container text at 7:1; the selected segment, the pill behind the selected tab icon, the avatar and list-icon fill */' },
    { name: 'Main pill button', css: 'background: {primary}; color: {onPrimary}; border-radius: 28px; min-height: 52px; /* full pill; hover {priHover}, pressed {priPress}; pressed also morphs the corner to 12px in 180 ms with a slight overshoot (cubic-bezier(.34,1.56,.64,1)) */' },
    { name: 'Segmented control', css: 'gap: 2px; /* connected group: full outer corners, 4px inner corners, 1px outline {tnOutline}; the selected segment fills with {tnPc} and sets its label in {tnOnPc} */' },
    { name: 'Signature shape', css: 'shape: {tsShapeName}; svg-path (viewBox 0 0 100 100): {tsShapePath}; /* seeded from the brand name, so the same brand always gets the same one; scale it to the container and use it as a mask. It contains the avatar initial, the icon button glyph (or floating action button) and the list-row icon; it is never a free-floating decoration */' },
  ],

  rules: {
    do: [
      'Build elevation from tone: container-low, container, container-high, each a few percent more of the primary over the ground. No shadows, no hairline borders on cards.',
      'Use one signature shape for the brand and use it only as a container: the avatar, the icon button (or floating action button), the list-row icon, the empty-state icon.',
      'Round everything one step: pill buttons, 28px cards and sheets, 12px small containers, a connected segmented control with 4px inner corners.',
      'Let a pressed pill squish to a 12px corner (about 180 ms, a slight overshoot); with reduced motion the corner changes at once.',
      'Put one primary-filled pill on a view; the selected segment and tab take the quieter primary-container tint.',
    ],
    dont: [
      'Float a shape as decoration in an app screen; shapes there hold an initial or an icon.',
      'Draw a second signature shape; every other shape on the hero board belongs to the library and stays on the board.',
      'Add a hue that is not on the ramp, or set text in anything but ink, muted or an on-* colour.',
      'Use hard borders, heavy outlines or grey-black shadows to separate surfaces; step the tone instead.',
    ],
  },

  deck: {
    // Material slide: the real pieces as small specimens: the signature shape and its uses, the pill
    // before and after the squish, and the tonal ramp.
    materialArt(ctx) {
      const init = ctx.initial || (ctx.brandName ? String(ctx.brandName).trim()[0] : '') || 'A';
      const I = escapeHtml(String(init).toUpperCase());
      const sig = tsShapeFor(ctx.brandName);
      return `<div class="tsm">
        <div class="tsm-card">
          <span class="tsm-l">${abCopy(this, 'cardShape')}</span>
          <div class="tsm-shapes"><span class="tsm-sh is-l" aria-hidden="true">${I}</span><span class="tsm-sh is-m" aria-hidden="true">${I}</span><span class="tsm-sh is-s" aria-hidden="true">${I}</span></div>
          <span class="tsm-cap">${escapeHtml(sig.name)}. ${abCopy(this, 'cardShapeCap')}</span>
        </div>
        <div class="tsm-card">
          <span class="tsm-l">${abCopy(this, 'cardPill')}</span>
          <div class="tsm-btns"><span class="tsm-pill">${abCopy(this, 'pillRest')}</span><span class="tsm-pill is-pressed">${abCopy(this, 'pillPressed')}</span></div>
          <div class="tsm-seg" aria-hidden="true"><span class="is-on">Day</span><span>Week</span><span>Month</span></div>
        </div>
        <div class="tsm-card">
          <span class="tsm-l">${abCopy(this, 'cardTone')}</span>
          <div class="tsm-ramp">
            <span class="tsm-t t-low">${abCopy(this, 'toneLow')}</span><span class="tsm-t t-mid">${abCopy(this, 'toneMid')}</span>
            <span class="tsm-t t-high">${abCopy(this, 'toneHigh')}</span><span class="tsm-t t-pc">${abCopy(this, 'tonePrimary')}</span>
          </div>
        </div>
      </div>`;
    },
    principles: [
      ['Tone is elevation', 'Each surface is a few percent more of the primary than the one beneath it.'],
      ['One shape of your own', 'A signature shape per brand holds the avatar, the icon button and the list icons.'],
      ['Soft but clear', 'Pill buttons squish when pressed; the selected state is always a tint and a label.'],
    ],
    do: [
      'Step the tone to lift a surface.',
      'Keep the signature shape as a container.',
      'Round pills fully, cards 28px.',
    ],
    dont: [
      'Float shapes as decoration in the app.',
      'Add hues that are not on the ramp.',
      'Separate surfaces with hard borders.',
    ],
  },
});
