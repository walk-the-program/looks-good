/* 20 Blueprint — technical, annotated, exact. Reference: cyanotype blueprints,
   patent drawings, engineering datasheets. The canvas is the drawing field (the
   brand's bluest hue, deepened to a blueprint field; a desaturated dark tinted
   toward the primary when no hue is blue-ish), ink is the near-white line color, and a
   24px / 120px double grid sits underneath. Everything is 1px line work with
   mono annotations; color appears only as tiny markers, the selected tab and the
   one filled CTA. The hero art is an oblique line drawing of the brand initial as an
   extruded block letter with hidden edges dashed, dimension lines, centerlines and
   lettered callouts; the footer is the sheet's title block. */

let bprSeq = 0;

// 5x7 block capitals and digits (rows of 5 bits) that the drawing extrudes
const BPR_FONT = {
  A: '01110 10001 10001 11111 10001 10001 10001', B: '11110 10001 10001 11110 10001 10001 11110',
  C: '01110 10001 10000 10000 10000 10001 01110', D: '11110 10001 10001 10001 10001 10001 11110',
  E: '11111 10000 10000 11110 10000 10000 11111', F: '11111 10000 10000 11110 10000 10000 10000',
  G: '01110 10001 10000 10111 10001 10001 01110', H: '10001 10001 10001 11111 10001 10001 10001',
  I: '01110 00100 00100 00100 00100 00100 01110', J: '00111 00010 00010 00010 00010 10010 01100',
  K: '10001 10010 10100 11000 10100 10010 10001', L: '10000 10000 10000 10000 10000 10000 11111',
  M: '10001 11011 10101 10101 10001 10001 10001', N: '10001 11001 10101 10011 10001 10001 10001',
  O: '01110 10001 10001 10001 10001 10001 01110', P: '11110 10001 10001 11110 10000 10000 10000',
  Q: '01110 10001 10001 10001 10101 10010 01101', R: '11110 10001 10001 11110 10100 10010 10001',
  S: '01111 10000 10000 01110 00001 00001 11110', T: '11111 00100 00100 00100 00100 00100 00100',
  U: '10001 10001 10001 10001 10001 10001 01110', V: '10001 10001 10001 10001 10001 01010 00100',
  W: '10001 10001 10001 10101 10101 11011 10001', X: '10001 10001 01010 00100 01010 10001 10001',
  Y: '10001 10001 01010 00100 00100 00100 00100', Z: '11111 00001 00010 00100 01000 10000 11111',
  0: '01110 10001 10011 10101 11001 10001 01110', 1: '00100 01100 00100 00100 00100 00100 01110',
  2: '01110 10001 00001 00010 00100 01000 11111', 3: '11110 00001 00001 01110 00001 00001 11110',
  4: '00010 00110 01010 10010 11111 00010 00010', 5: '11111 10000 11110 00001 00001 10001 01110',
  6: '00110 01000 10000 11110 10001 10001 01110', 7: '11111 00001 00010 00100 01000 01000 01000',
  8: '01110 10001 10001 01110 10001 10001 01110', 9: '01110 10001 10001 01111 00001 00010 01100',
  '?': '01110 10001 00001 00110 00100 00000 00100',
};

registerAesthetic({
  key: 'blueprint', order: 20,
  name: 'Blueprint',
  descriptor: 'Technical · Annotated · Exact',
  influences: 'Architectural drawings / Engineering blueprints / Patent diagrams',
  summary: 'White line work on a blue drawing field, with dimensions and a title block.',
  motto: 'Drawn to scale.',
  kicker: 'Sheet 01 / 01',
  mode: 'dark',
  slideShape: 'minimal',
  labels: { material: 'Drawing', states: ['Default', 'Hover', 'Active'], statesKind: 'button' },
  layout: { hero: 'split', palette: 'swatches', sections: 'two-col' },
  type: { ui: 'mono', label: 'mono', display: 0.84 },
  highlight: 'custom',
  highlightNote: 'The word keeps the ink headline color and is boxed by a dimension line below it (end ticks, a measurement set in mono in a gap in the line) drawn in the accent; no fill, no underline.',
  cardFill: '--ab-canvas',

  roles: {
    canvas: {
      use: 'The drawing field, from the brand\'s bluest hue; the 24px and 120px grid sits on it',
      never: 'Text, or a lighter panel fill; panels are outlines on the field',
    },
    ink: {
      use: 'All line work and lettering as near-white 1px strokes (full strength for outlines, 45% for hidden lines and grid)',
      never: 'Large background fields in light mode',
    },
    primary: {
      use: 'The selected tab, the one filled CTA, the switch "on" marker and the datum markers; always as tiny or single filled elements',
      never: 'Body text, panel fills, outlines, a second filled button',
      coverage: '≈5%',
    },
    secondary: {
      use: 'Status markers in the bill of materials and the second dimension color; as a line or a 6px marker, never a fill',
      never: 'The main CTA, body text, page background',
      coverage: '≈3–5%',
    },
    accent: {
      use: 'The dimension line under the headline word, the corner ticks of the CTA and callout dots; always a hairline or a dot',
      never: 'Buttons, body text, panel fills',
      coverage: '≤2%',
    },
  },

  // Dark: the drawing field, taken from the brand's bluest hue. Of primary and secondary, the hue nearest 215 degrees;
  // within +/-45 of it the field is that hue at saturation 45-62%, lightness 21%. A brand with no blue-ish hue gets the
  // dark color tinted toward the primary, desaturated (<= 26%) and held at 16-18% lightness (a Vandyke print, not a brown page).
  canvas(b) {
    if (!b.isDark) return null;
    const dist = h => { const d = Math.abs(h - 215) % 360; return d > 180 ? 360 - d : d; };
    const hs = [b.hexToHsl(b.primary), b.hexToHsl(b.secondary)];
    const best = dist(hs[0].h) <= dist(hs[1].h) ? hs[0] : hs[1];
    if (dist(best.h) <= 45) return b.hslToHex(best.h, Math.max(45, Math.min(best.s, 62)), 21);
    const c = b.hexToHsl(b.mix(b.primary, b.canvas, 0.2));
    return b.hslToHex(c.h, Math.min(c.s, 26), Math.max(16, Math.min(c.l, 18)));
  },

  tokens(t) {
    const d = t.isDark;
    const st = typeof state !== 'undefined' ? state : null;
    // legible-on-canvas versions of the three markers (lifted toward white on the dark field, shaded on light)
    const toward = d ? '#ffffff' : '#000000';
    const ui = (hex, min) => { let c = hex; for (let k = 1; k <= 20 && t.contrast(c, t.canvas) < min; k++) c = t.mix(toward, c, k * 0.05); return c; };
    const priUi = ui(t.primary, 3.2);
    const accUi = t.contrast(t.accent, t.canvas) >= 3 ? t.accent : ui(t.accent, 3);
    const secUi = t.contrast(t.secondary, t.canvas) >= 3 ? t.secondary : ui(t.secondary, 3);
    const brand = typeof effectiveContent === 'function' ? String(effectiveContent().brandName || '') : '';
    const clean = s => s.replace(/[^A-Za-z0-9 .&\-]/g, '').toUpperCase().slice(0, 24) || 'PROJECT';
    return {
      '--ab-tr': (st && st.headingFont && { condensed: 0, heavy: 0, wide: 0.4, techno: 0.4 }[st.headingFont.cls]) ?? 1,
      '--ab-l1': t.alpha(t.ink, 0.9),
      '--ab-l2': t.alpha(t.ink, 0.5),
      '--ab-l3': t.alpha(t.ink, 0.22),
      '--ab-grid-s': t.alpha(t.ink, d ? 0.06 : 0.07),
      '--ab-grid-l': t.alpha(t.ink, d ? 0.12 : 0.14),
      '--ab-hatch': t.alpha(t.ink, 0.07),
      '--ab-pri-ui': priUi,
      '--ab-on-pri-ui': t.readable(priUi),
      '--ab-acc-ui': accUi,
      '--ab-sec-ui': secUi,
      '--ab-ring': t.alpha(accUi, 0.45),
      '--ab-proj': `'${clean(brand)}'`,
      '--ab-date': `'${new Date().toISOString().slice(0, 10)}'`,
    };
  },

  // An oblique line drawing of the brand initial as an extruded block letter. Front outline solid; back outline solid
  // on the faces we can see (up, right) and dashed on the hidden ones; connecting edges likewise. A 1px stroke that
  // does not scale (vector-effect), dimension lines with arrowheads, centerlines, and A / B / C callouts.
  art(ctx) {
    const t = ctx.t;
    const n = ++bprSeq;
    const rows = (BPR_FONT[String(ctx.initial).toUpperCase()] || BPR_FONT['?']).split(' ');
    const W = 5, H = 7;
    const f = (x, y) => x >= 0 && y >= 0 && x < W && y < H && rows[y][x] === '1';
    const c = 11, X0 = 46, Y0 = 38, dx = 19, dy = -12;
    const P = (x, y, z) => [X0 + x * c + z * dx, Y0 + y * c + z * dy];
    // boundary edges of the union of filled cells, merged along straight runs
    const raw = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (f(x, y)) {
      if (!f(x, y - 1)) raw.push({ a: [x, y], b: [x + 1, y], n: 'u' });
      if (!f(x, y + 1)) raw.push({ a: [x, y + 1], b: [x + 1, y + 1], n: 'd' });
      if (!f(x - 1, y)) raw.push({ a: [x, y], b: [x, y + 1], n: 'l' });
      if (!f(x + 1, y)) raw.push({ a: [x + 1, y], b: [x + 1, y + 1], n: 'r' });
    }
    const edges = [];
    raw.forEach(e => {
      const m = edges.find(o => o.n === e.n && ((e.n === 'u' || e.n === 'd') ? (o.a[1] === e.a[1] && o.b[0] === e.a[0]) : (o.a[0] === e.a[0] && o.b[1] === e.a[1])));
      if (m) m.b = e.b; else edges.push({ a: e.a.slice(), b: e.b.slice(), n: e.n });
    });
    const seg = (a, b, z) => { const p = P(a[0], a[1], z), q = P(b[0], b[1], z); return `M${p[0]} ${p[1]}L${q[0]} ${q[1]}`; };
    let front = '', backSolid = '', backDash = '', linkSolid = '', linkDash = '';
    const verts = {};
    edges.forEach(e => {
      front += seg(e.a, e.b, 0);
      if (e.n === 'u' || e.n === 'r') backSolid += seg(e.a, e.b, 1); else backDash += seg(e.a, e.b, 1);
      [e.a, e.b].forEach(v => { const k = v.join(','); (verts[k] = verts[k] || { h: 0, v: 0, vis: false, v0: v }); if (e.n === 'u' || e.n === 'd') verts[k].h = 1; else verts[k].v = 1; if (e.n === 'u' || e.n === 'r') verts[k].vis = true; });
    });
    Object.values(verts).forEach(v => {
      if (!(v.h && v.v)) return;
      const p = P(v.v0[0], v.v0[1], 0), q = P(v.v0[0], v.v0[1], 1);
      const s = `M${p[0]} ${p[1]}L${q[0]} ${q[1]}`;
      if (v.vis) linkSolid += s; else linkDash += s;
    });
    // hatch on the front face (one rect per filled cell)
    let cells = '';
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (f(x, y)) { const p = P(x, y, 0); cells += `<rect x="${p[0]}" y="${p[1]}" width="${c}" height="${c}"/>`; }
    // callout anchors
    const topEdge = edges.filter(e => e.n === 'u').sort((a, b) => a.a[1] - b.a[1] || a.a[0] - b.a[0])[0];
    const leftEdge = edges.filter(e => e.n === 'l').sort((a, b) => b.a[1] - a.a[1])[0];
    const mid = (a, b, z) => { const p = P(a[0], a[1], z), q = P(b[0], b[1], z); return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; };
    const anchTop = (() => { const m = mid(topEdge.a, topEdge.b, 0.5); return m; })();
    const anchHid = mid(leftEdge.a, leftEdge.b, 1);
    let best = [2, 3], bd = 1e9;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (f(x, y)) { const dd = Math.abs(x - 2) + Math.abs(y - 3); if (dd < bd) { bd = dd; best = [x, y]; } }
    const anchFront = P(best[0] + 0.5, best[1] + 0.5, 0);
    const calls = [['A', anchFront, 'FRONT FACE', 90], ['B', anchHid, 'HIDDEN EDGE', 66], ['C', anchTop, 'TOP FACE', 34]];
    const bx = 150;
    const callouts = calls.map(([k, a, label, by]) => {
      const lx = a[0], ly = a[1];
      return `<g><path class="bp-l" d="M${lx} ${ly}L${bx - 4.6} ${by}"/><circle class="bp-dot" cx="${lx}" cy="${ly}" r="1.5"/><circle class="bp-c" cx="${bx}" cy="${by}" r="4.6"/><text class="bp-t bp-ct" x="${bx}" y="${by + 1.6}" text-anchor="middle">${k}</text><text class="bp-t" x="${bx + 8}" y="${by + 1.5}">${label}</text></g>`;
    }).join('');
    // dimension lines with arrowheads
    const a = 2.6;
    const arrow = (x, y, dir) => dir === 'l' ? `M${x} ${y}l${a} -1l0 2z` : dir === 'r' ? `M${x} ${y}l${-a} -1l0 2z` : dir === 'u' ? `M${x} ${y}l-1 ${a}l2 0z` : `M${x} ${y}l-1 ${-a}l2 0z`;
    const bottom = Y0 + H * c, right = X0 + W * c;
    const dimY = bottom + 14, dimX = X0 - 14;
    const dims = `
      <path class="bp-l" d="M${X0} ${bottom + 2}V${dimY + 3}M${right} ${bottom + 2}V${dimY + 3}M${X0} ${dimY}H${right}"/>
      <path class="bp-ar" d="${arrow(X0, dimY, 'l')}${arrow(right, dimY, 'r')}"/>
      <text class="bp-t" x="${(X0 + right) / 2}" y="${dimY - 2.2}" text-anchor="middle">${W * 64} mm</text>
      <path class="bp-l" d="M${X0 - 2} ${Y0}H${dimX - 3}M${X0 - 2} ${bottom}H${dimX - 3}M${dimX} ${Y0}V${bottom}"/>
      <path class="bp-ar" d="${arrow(dimX, Y0, 'u')}${arrow(dimX, bottom, 'd')}"/>
      <text class="bp-t" transform="translate(${dimX - 2.6} ${(Y0 + bottom) / 2}) rotate(-90)" text-anchor="middle">${H * 64} mm</text>`;
    const cx = X0 + (W * c) / 2, cy = Y0 + (H * c) / 2;
    const center = `<path class="bp-cl" d="M${cx} ${Y0 - 10}V${bottom + 8}M${X0 - 8} ${cy}H${right + 10}"/>`;
    const datum = `<path class="bp-dm" d="M${X0} ${bottom + 3.4}l-2.4 4.2h4.8z"/><text class="bp-t bp-s" x="${X0 + 5}" y="${bottom + 8}">D1</text>`;
    return `<svg class="bpa" viewBox="0 0 200 150" width="100%" height="100%" focusable="false">
      <defs><pattern id="bph${n}" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path class="bp-h" d="M0 0V3"/></pattern></defs>
      <g fill="url(#bph${n})" stroke="none">${cells}</g>
      ${center}
      <path class="bp-dash" d="${backDash}${linkDash}"/>
      <path class="bp-k" d="${backSolid}${linkSolid}${front}"/>
      ${dims}${datum}${callouts}
      <text class="bp-t bp-s" x="10" y="146">VIEW A &middot; OBLIQUE &middot; SCALE 1:1</text>
    </svg>`;
  },

  materials: [
    { name: 'Drawing field', css: 'background: {canvas}; background-image: 1px grid lines every 24px in {gridS} and every 120px in {gridL}; /* the sheet: the brand\'s bluest hue at 45-62% saturation, 21% lightness (a desaturated dark tint when no hue is blue-ish) */' },
    { name: 'Line work', css: 'border: 1px solid {ink}; border-radius: 0; background: transparent; box-shadow: none; /* 1px strokes only: {l1} for outlines, {l2} for hidden or secondary lines, {l3} for hairlines */' },
    { name: 'Filled CTA', css: 'background: {primary}; color: {onPrimary}; border: 1px solid {ink}; border-radius: 0; font: 600 12px ui-monospace, "SF Mono", Menlo, monospace; text-transform: uppercase; letter-spacing: .08em; /* accent corner ticks at two corners; hover: a second outline 3px outside; active: background {ink}, color {canvas} */' },
    { name: 'Selected tab', css: 'background: {primary}; color: {onPrimary}; border: 1px solid {ink}; /* the only other filled element; unselected tabs are 1px outlines */' },
    { name: 'Dimension line', css: 'border-top: 1px solid {accUi}; /* end ticks, a mono measurement set in a gap of the line; drawn over the highlighted headline word */' },
    { name: 'Field', css: 'border: 0; border-bottom: 1px solid {ink}; background: transparent; border-radius: 0; font: 14px ui-monospace, "SF Mono", Menlo, monospace; /* focus: border-bottom-color {accUi} */' },
    { name: 'Title block', css: 'border: 1px solid {ink}; display: grid; grid-template-columns: 1fr 1fr; /* four ruled cells at the bottom right: project, scale and sheet, title, reference */' },
  ],

  rules: {
    do: [
      'Draw everything as 1px line work on the grid; solid for visible edges, dashed for hidden ones, dash-dot for centerlines.',
      'Annotate like a drawing: dimension lines with arrowheads and mono measurements, lettered callouts with leader lines, a title block bottom right.',
      'Fill only the selected tab and the one CTA with the primary; markers in accent or secondary stay tiny.',
      'Set headings in uppercase sans and every label, tab and value in mono.',
    ],
    dont: [
      'Fill panels, cards or buttons with color, or add shadows, gradients and rounded corners.',
      'Let the canvas drift off the drawing field: no mid-grey, no white, no second background.',
      'Use color for decoration; lines stay near-white and color marks only a state or a point.',
      'Break the grid: align panels and callouts to the 24px lattice.',
    ],
  },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    principles: [
      ['Draw it to scale', '1px white line work on a blue field.'],
      ['Annotate like a drawing', 'Dimension lines, lettered callouts and a title block.'],
      ['Color marks only a state', 'Primary fills the selected tab and one CTA.'],
    ],
    do: [
      'Draw everything as 1px line work.',
      'Annotate with dimensions and callouts.',
      'Set labels and values in mono.',
    ],
    dont: [
      'Fill panels or add shadows.',
      'Break the 24px grid.',
      'Use color for decoration.',
    ],
  },
});
