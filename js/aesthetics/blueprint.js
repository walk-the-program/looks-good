/* 20 Blueprint — technical, annotated, exact. Reference: cyanotype blueprints (Prussian blue, white is the
   only ink), patent drawings, the NASA standards manual's spec sheets. The canvas is a fixed Prussian blue
   (hue 218, nudged at most 8 degrees toward a blue brand hue) with an 8px / 40px grid; light mode is a patent
   sheet (white, black line, no grid). Nothing is filled: controls are 1.5px outlines, the selected state is a
   double outline over 45 degree hatching. The hero is a full drawing sheet (front elevation, section B-B,
   oblique view, detail at 2:1, notes, revision table) and the headline sits in its title block. The client
   primary appears once, as the revision cloud. */

let bprSeq = 0;

// The drawing, shared by art() (board and cover: the sheet, and the phone crop) and deck.materialArt()
// (the oblique view and the 2:1 detail). Returns svg(cls, viewBox, idSuffix).
function bpDrawing(ctx) {
  const t = ctx.t;
  const pat = !t.isDark;
  const n = ++bprSeq;
  const rows = (AB_FONT_5X7[String(ctx.initial).toUpperCase()] || AB_FONT_5X7['?']).split(' ');
  const W = 5, H = 7, MM = 64;
  const f = (x, y) => x >= 0 && y >= 0 && x < W && y < H && rows[y][x] === '1';
  const e = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  // boundary edges of the union of filled cells, merged along straight runs (cell units)
  const raw = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (f(x, y)) {
    if (!f(x, y - 1)) raw.push({ a: [x, y], b: [x + 1, y], n: 'u' });
    if (!f(x, y + 1)) raw.push({ a: [x, y + 1], b: [x + 1, y + 1], n: 'd' });
    if (!f(x - 1, y)) raw.push({ a: [x, y], b: [x, y + 1], n: 'l' });
    if (!f(x + 1, y)) raw.push({ a: [x + 1, y], b: [x + 1, y + 1], n: 'r' });
  }
  const edges = [];
  raw.forEach(ed => {
    const m = edges.find(o => o.n === ed.n && ((ed.n === 'u' || ed.n === 'd') ? (o.a[1] === ed.a[1] && o.b[0] === ed.a[0]) : (o.a[0] === ed.a[0] && o.b[1] === ed.a[1])));
    if (m) m.b = ed.b; else edges.push({ a: ed.a.slice(), b: ed.b.slice(), n: ed.n });
  });
  const r1 = v => Math.round(v * 10) / 10;
  const ar = 2.4;
  const arrow = (x, y, dir) => dir === 'l' ? `M${r1(x)} ${r1(y)}l${ar} -.9l0 1.8z` : dir === 'r' ? `M${r1(x)} ${r1(y)}l${-ar} -.9l0 1.8z` : dir === 'u' ? `M${r1(x)} ${r1(y)}l-.9 ${ar}l1.8 0z` : `M${r1(x)} ${r1(y)}l-.9 ${-ar}l1.8 0z`;
  const txt = (x, y, s, cls = '', anchor = 'start', extra = '') => `<text class="bp-t${cls ? ' ' + cls : ''}" x="${r1(x)}" y="${r1(y)}" text-anchor="${anchor}"${extra}>${e(s)}</text>`;
  const viewTitle = (x, y, name, sub) => `${txt(x, y, name, 'bp-vt', 'middle')}${sub ? txt(x, y + 5.4, sub, 'bp-s', 'middle') : ''}<path class="bp-l" d="M${r1(x - 22)} ${r1(y + 1.6)}H${r1(x + 22)}"/>`;

  /* ---------- VIEW A: front elevation ---------- */
  const c = 14, AX = 46, AY = 42;
  const A = (x, y) => [AX + x * c, AY + y * c];
  let front = '';
  edges.forEach(ed => { const p = A(ed.a[0], ed.a[1]), q = A(ed.b[0], ed.b[1]); front += `M${p[0]} ${p[1]}L${q[0]} ${q[1]}`; });
  const aBot = AY + H * c, aRight = AX + W * c;
  const acx = AX + W * c / 2, acy = AY + H * c / 2;
  const frontCl = `M${acx} ${AY - 9}V${aBot + 7}M${AX - 7} ${acy}H${aRight + 7}`;
  // dimension chain: every x where the letter has a vertical edge, then the overall width below it
  const xs = [...new Set(edges.filter(ed => ed.n === 'l' || ed.n === 'r').map(ed => ed.a[0]))].sort((a, b) => a - b);
  const chY = aBot + 11, ovY = aBot + 21;
  let dims = '', dimAr = '', dimT = '';
  const ext = [];
  xs.forEach(x => ext.push(`M${AX + x * c} ${aBot + 2.5}V${ovY + 2.5}`));
  for (let i = 0; i < xs.length - 1; i++) {
    const x0 = AX + xs[i] * c, x1 = AX + xs[i + 1] * c;
    dims += `M${x0} ${chY}H${x1}`;
    dimAr += arrow(x0, chY, 'l') + arrow(x1, chY, 'r');
    dimT += txt((x0 + x1) / 2, chY - 1.6, (xs[i + 1] - xs[i]) * MM, 'bp-dt', 'middle');
  }
  dims += `M${AX} ${ovY}H${aRight}`;
  dimAr += arrow(AX, ovY, 'l') + arrow(aRight, ovY, 'r');
  dimT += txt(acx, ovY - 1.6, W * MM, 'bp-dt', 'middle');
  // overall height on the left
  const hx = AX - 13;
  dims += `M${AX - 2.5} ${AY}H${hx - 2.5}M${AX - 2.5} ${aBot}H${hx - 2.5}M${hx} ${AY}V${aBot}`;
  dimAr += arrow(hx, AY, 'u') + arrow(hx, aBot, 'd');
  dimT += `<text class="bp-t bp-dt" transform="translate(${hx - 1.8} ${acy}) rotate(-90)" text-anchor="middle">${H * MM}</text>`;
  // cutting plane B-B through the busiest column (most filled runs), looking right
  const runsOf = x => { const r = []; let s0 = -1; for (let y = 0; y <= H; y++) { if (y < H && f(x, y)) { if (s0 < 0) s0 = y; } else if (s0 >= 0) { r.push([s0, y]); s0 = -1; } } return r; };
  let xc = 2, bestRuns = -1;
  [2, 1, 3, 0, 4].forEach(x => { const k = runsOf(x).length; if (k > bestRuns) { bestRuns = k; xc = x; } });
  const cpx = AX + (xc + 0.5) * c;
  const cut = `<path class="bp-cl" d="M${cpx} ${AY - 6}V${aBot + 5}"/><path class="bp-cut" d="M${cpx} ${AY - 12}V${AY - 5}M${cpx} ${aBot + 4}V${aBot + 11}M${cpx} ${AY - 12}H${cpx + 6}M${cpx} ${aBot + 11}H${cpx + 6}"/>`
    + `<path class="bp-ar" d="${arrow(cpx + 8.4, AY - 12, 'r')}${arrow(cpx + 8.4, aBot + 11, 'r')}"/>`
    + txt(cpx + 11, AY - 10.6, 'B', 'bp-ct') + txt(cpx + 11, aBot + 12.4, 'B', 'bp-ct');

  /* ---------- SECTION B-B ---------- */
  const SX = 150, D = 2 * c;
  let secCut = '', secBeyond = '';
  runsOf(xc).forEach(([y0, y1]) => { secCut += `<rect x="${SX}" y="${AY + y0 * c}" width="${D}" height="${(y1 - y0) * c}"/>`; });
  for (let y = 0; y < H; y++) {
    let any = false; for (let x = xc + 1; x < W; x++) if (f(x, y)) any = true;
    if (any && !f(xc, y)) secBeyond += `M${SX} ${AY + y * c}H${SX + D}V${AY + (y + 1) * c}H${SX}Z`;
  }
  const secDims = `<path class="bp-l" d="M${SX} ${AY - 2.5}V${AY - 10}M${SX + D} ${AY - 2.5}V${AY - 10}M${SX} ${AY - 7.5}H${SX + D}"/>`
    + `<path class="bp-ar" d="${arrow(SX, AY - 7.5, 'l')}${arrow(SX + D, AY - 7.5, 'r')}"/>` + txt(SX + D / 2, AY - 9.2, 2 * MM, 'bp-dt', 'middle');
  const secCl = `M${SX + D / 2} ${AY - 4}V${aBot + 6}`;

  /* ---------- VIEW C: oblique ---------- */
  const oc = 9.5, OX = 214, OY = 64, odx = 16, ody = -10.5;
  const O = (x, y, z) => [r1(OX + x * oc + z * odx), r1(OY + y * oc + z * ody)];
  const oseg = (a, b, z) => { const p = O(a[0], a[1], z), q = O(b[0], b[1], z); return `M${p[0]} ${p[1]}L${q[0]} ${q[1]}`; };
  let ofront = '', obackSolid = '', obackDash = '', olinkSolid = '', olinkDash = '';
  const verts = {};
  edges.forEach(ed => {
    ofront += oseg(ed.a, ed.b, 0);
    if (ed.n === 'u' || ed.n === 'r') obackSolid += oseg(ed.a, ed.b, 1); else obackDash += oseg(ed.a, ed.b, 1);
    [ed.a, ed.b].forEach(v => { const k = v.join(','); (verts[k] = verts[k] || { h: 0, v: 0, vis: false, v0: v }); if (ed.n === 'u' || ed.n === 'd') verts[k].h = 1; else verts[k].v = 1; if (ed.n === 'u' || ed.n === 'r') verts[k].vis = true; });
  });
  Object.values(verts).forEach(v => {
    if (!(v.h && v.v)) return;
    const p = O(v.v0[0], v.v0[1], 0), q = O(v.v0[0], v.v0[1], 1);
    const s = `M${p[0]} ${p[1]}L${q[0]} ${q[1]}`;
    if (v.vis) olinkSolid += s; else olinkDash += s;
  });
  // callout anchors on the oblique view
  const topEdge = edges.filter(ed => ed.n === 'u').sort((a, b) => a.a[1] - b.a[1] || a.a[0] - b.a[0])[0];
  const leftEdge = edges.filter(ed => ed.n === 'l').sort((a, b) => b.a[1] - a.a[1])[0];
  const omid = (a, b, z) => { const p = O(a[0], a[1], z), q = O(b[0], b[1], z); return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; };
  let best = [2, 3], bd = 1e9;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (f(x, y)) { const dd = Math.abs(x - 2) + Math.abs(y - 3); if (dd < bd) { bd = dd; best = [x, y]; } }
  const calls = [[omid(topEdge.a, topEdge.b, 0.5), 'A', '10', 'TOP FACE', 44], [O(best[0] + 0.5, best[1] + 0.5, 0), 'B', '12', 'FRONT FACE', 70], [omid(leftEdge.a, leftEdge.b, 1), 'C', '14', 'HIDDEN EDGE', 96]];
  const bx = 300;
  const callouts = calls.map(([a, letter, num, label, by]) => {
    if (pat) {
      // patent: a reference numeral with a curved leader, no bubble
      const mx = (a[0] + bx - 6) / 2;
      return `<path class="bp-l" d="M${r1(a[0])} ${r1(a[1])}Q${r1(mx)} ${r1(by + (a[1] - by) * 0.15 - 6)} ${bx - 5} ${by - 1.2}"/>${txt(bx - 3, by + 0.4, num, 'bp-num')}`;
    }
    return `<path class="bp-l" d="M${r1(a[0])} ${r1(a[1])}L${bx - 4.4} ${by}"/><circle class="bp-dot" cx="${r1(a[0])}" cy="${r1(a[1])}" r="1.2"/><circle class="bp-c" cx="${bx}" cy="${by}" r="4.4"/>${txt(bx, by + 1.5, letter, 'bp-ct', 'middle')}${txt(bx + 7.5, by + 1.5, label)}`;
  }).join('');

  /* ---------- DETAIL D (2:1) ---------- */
  const dA = A(topEdge.a[0], topEdge.a[1]);          // the top-left corner of the letter's top edge
  const DCX = 408, DCY = 84, DR = 44;
  const dZoom = `translate(${DCX} ${DCY}) scale(2) translate(${-(dA[0] + c * 0.5)} ${-(dA[1] + c * 0.5)})`;
  const detMark = `<circle class="bp-l" cx="${dA[0] + c * 0.5}" cy="${dA[1] + c * 0.5}" r="12"/>${txt(dA[0] + c * 0.5 - 13, dA[1] + c * 0.5 - 10, pat ? '16' : 'D', pat ? 'bp-num' : 'bp-ct', 'end')}`;
  const detCell = `<path class="bp-l" d="M${dA[0]} ${dA[1] - 3}V${dA[1] - 9}M${dA[0] + c} ${dA[1] - 3}V${dA[1] - 9}M${dA[0]} ${dA[1] - 6.5}H${dA[0] + c}"/><path class="bp-ar" d="${arrow(dA[0], dA[1] - 6.5, 'l')}${arrow(dA[0] + c, dA[1] - 6.5, 'r')}"/>`;

  /* ---------- notes, third-angle symbol, revision table, revision cloud ---------- */
  const today = (d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)(new Date());
  const init = String(ctx.brandName || 'MS').split(/\s+/).filter(Boolean).map(w => w[0]).join('').slice(0, 3).toUpperCase() || 'MS';
  const NX = 22, NY = 222;
  const notes = pat ? '' : txt(NX, NY, 'NOTES', 'bp-vt bp-lt')
    + txt(NX, NY + 7, '1. ALL DIMENSIONS IN MILLIMETRES.') + txt(NX, NY + 13, '2. DO NOT SCALE THE DRAWING.') + txt(NX, NY + 19, '3. BREAK SHARP EDGES 0.5 x 45°.');
  const ta = pat ? '' : (() => {
    const x = 170, y = 218;
    return `<path class="bp-k" d="M${x} ${y + 2}L${x + 16} ${y - 2}V${y + 14}L${x} ${y + 10}Z"/><circle class="bp-k" cx="${x + 30}" cy="${y + 6}" r="8"/><circle class="bp-k" cx="${x + 30}" cy="${y + 6}" r="4"/><path class="bp-cl" d="M${x - 3} ${y + 6}H${x + 41}M${x + 30} ${y - 5}V${y + 17}"/>${txt(x + 20, y + 25, 'THIRD ANGLE', 'bp-s', 'middle')}`;
  })();
  const RX = 22, RY = 262, RW = 228;
  const rev = pat ? '' : `<path class="bp-l" d="M${RX} ${RY}H${RX + RW}V${RY + 26}H${RX}ZM${RX} ${RY + 8}H${RX + RW}M${RX} ${RY + 17}H${RX + RW}M${RX + 18} ${RY}V${RY + 26}M${RX + 150} ${RY}V${RY + 26}M${RX + 200} ${RY}V${RY + 26}"/>`
    + txt(RX + 9, RY + 5.8, 'REV', 'bp-s', 'middle') + txt(RX + 22, RY + 5.8, 'DESCRIPTION', 'bp-s') + txt(RX + 154, RY + 5.8, 'DATE', 'bp-s') + txt(RX + 204, RY + 5.8, 'BY', 'bp-s')
    + `<path class="bp-rev" d="M${RX + 9} ${RY + 9.6}l4.2 6.4h-8.4z"/>` + txt(RX + 9, RY + 15, '1', 'bp-rt', 'middle')
    + txt(RX + 22, RY + 14.6, 'ISSUED FOR BRAND USE') + txt(RX + 154, RY + 14.6, today) + txt(RX + 204, RY + 14.6, init)
    + txt(RX + 9, RY + 23.6, '0', 'bp-s', 'middle') + txt(RX + 22, RY + 23.6, 'FIRST DRAWN', 'bp-s');
  // the revision cloud: scallops around SECTION B-B, bulging outward, plus the revision triangle
  const cloud = (() => {
    const x0 = SX - 9, y0 = AY - 17, x1 = SX + D + 9, y1 = aBot + 7, s = 7.2;
    const pts = [];
    const side = (ax, ay, bx2, by2) => { const L = Math.hypot(bx2 - ax, by2 - ay), k = Math.max(1, Math.round(L / s)); for (let i = 0; i < k; i++) pts.push([ax + (bx2 - ax) * i / k, ay + (by2 - ay) * i / k]); };
    side(x0, y0, x1, y0); side(x1, y0, x1, y1); side(x1, y1, x0, y1); side(x0, y1, x0, y0);
    pts.push(pts[0]);
    let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
    for (let i = 1; i < pts.length; i++) d += `A4.4 4.4 0 0 1 ${r1(pts[i][0])} ${r1(pts[i][1])}`;
    return `<path class="bp-cloud" d="${d}"/><path class="bp-rev" d="M${x1 + 6} ${y0 - 3}l4.2 6.4h-8.4z"/>${txt(x1 + 6, y0 + 2.4, '1', 'bp-rt', 'middle')}`;
  })();
  // zone marks along the top and left edge of the drawing area (blueprint only)
  let zones = '';
  if (!pat) {
    let z = 'M14 14H466';
    for (let i = 0; i <= 8; i++) z += `M${14 + i * 56.5} 11V14`;
    zones = `<path class="bp-l bp-zl" d="${z}M14 14V288"/>`;
    for (let i = 0; i < 8; i++) zones += txt(14 + i * 56.5 + 28.25, 10, String(i + 1), 'bp-s', 'middle');
    ['A', 'B', 'C', 'D'].forEach((L, i) => { zones += `<path class="bp-l bp-zl" d="M11 ${14 + i * 68.5}H14"/>` + txt(8.6, 14 + i * 68.5 + 35, L, 'bp-s', 'middle'); });
  }

  const lab = pat
    ? { a: ['FIG. 1', ''], b: ['FIG. 2', ''], c: ['FIG. 3', ''], d: ['FIG. 4', ''] }
    : { a: ['VIEW A', 'FRONT  1:1'], b: ['SECTION B-B', '1:1'], c: ['VIEW C', 'OBLIQUE'], d: ['DETAIL D', '2:1'] };
  const titles = viewTitle(acx, aBot + 34, lab.a[0], lab.a[1]) + viewTitle(SX + D / 2, aBot + 34, lab.b[0], lab.b[1])
    + viewTitle(OX + 34, 146, lab.c[0], lab.c[1]) + viewTitle(DCX, DCY + DR + 13, lab.d[0], lab.d[1]);

  const sheet = id => `
    <defs>
      <pattern id="bph${id}" width="3.4" height="3.4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path class="bp-h" d="M0 0V3.4"/></pattern>
      <clipPath id="bpc${id}"><circle cx="${DCX}" cy="${DCY}" r="${DR}"/></clipPath>
    </defs>
    ${zones}
    <g class="bp-va">
      <path class="bp-cl" d="${frontCl}"/>
      <path class="bp-k" d="${front}"/>
      <path class="bp-l" d="${ext.join('')}${dims}"/><path class="bp-ar" d="${dimAr}"/>${dimT}
      ${cut}${detMark}
    </g>
    <g class="bp-vb">
      <path class="bp-l" d="${secBeyond}"/>
      <g fill="url(#bph${id})" class="bp-sec">${secCut}</g>
      <g class="bp-k bp-secline">${secCut}</g>
      <path class="bp-cl" d="${secCl}"/>
      ${secDims}
    </g>
    ${pat ? '' : cloud}
    <g class="bp-vc">
      <path class="bp-dash" d="${obackDash}${olinkDash}"/>
      <path class="bp-k" d="${obackSolid}${olinkSolid}${ofront}"/>
      ${callouts}
    </g>
    <g class="bp-vd">
      <circle class="bp-k" cx="${DCX}" cy="${DCY}" r="${DR}"/>
      <g clip-path="url(#bpc${id})"><g transform="${dZoom}">
        <path class="bp-cl" d="${frontCl}"/><path class="bp-k" d="${front}"/>${detCell}
      </g></g>
      ${txt(DCX - 26, DCY - 23, `${MM}.0`, 'bp-dt', 'middle')}
    </g>
    ${titles}${notes}${ta}${rev}`;
  return (cls, vb, id) => `<svg class="bpa ${cls}" viewBox="${vb}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" focusable="false">${sheet(`${n}${id}`)}</svg>`;
}

registerAesthetic({
  key: 'blueprint', order: 20,
  name: 'Blueprint',
  descriptor: 'Technical · Annotated · Exact',
  influences: 'Cyanotype blueprints / Patent drawings / NASA standards manual',
  summary: 'A full drawing sheet in white line on Prussian blue, with the headline in its title block.',
  motto: 'Drawn to scale.',
  kicker: 'Sheet 01 / 01',
  mode: 'dark',
  slideShape: 'minimal',
  labels: { material: 'Drawing', states: ['Default', 'Hover', 'Active'], statesKind: 'button' },
  // the sheet first, then the details (01-03), then the legend and the type table: a drawing set, not a landing page
  layout: { hero: 'split', palette: 'list', sections: 'asym', order: ['hero', 'sections', 'palette', 'type'] },
  type: { ui: 'mono', label: 'mono', display: 1 },
  highlight: 'custom',
  highlightNote: 'The word keeps the ink headline color and is measured by a dimension line below it (end ticks, a figure set in mono in a gap in the line) drawn in the accent; no fill, no underline.',
  cardFill: '--ab-canvas',
  ctaFill: 'ink',

  roles: {
    canvas: {
      use: 'The drawing field: a fixed Prussian blue (about #173D63) under an 8px / 40px grid; white paper with no grid in light mode',
      never: 'A client hue for the field, teal or green, or a lighter panel fill; panels are outlines on the field',
    },
    ink: {
      use: 'All line work, lettering and controls: 1.6px visible edges, 0.8px dimensions, dashed hidden lines, chain centre lines',
      never: 'Large filled areas; the only fill is 45 degree hatching on a section or a selected control',
    },
    primary: {
      use: 'The one revision cloud and its revision triangle on the drawing',
      never: 'Buttons, tabs, toggles, panel fills, body text',
      coverage: '≤2%',
    },
    secondary: {
      use: 'The 6px status markers in the bill of materials',
      never: 'Fills, the main action, lines, page background',
      coverage: '≤1%',
    },
    accent: {
      use: 'The dimension line that measures the headline word',
      never: 'Buttons, body text, fills, a second dimension',
      coverage: '≤1%',
    },
  },

  // Dark: a fixed Prussian blue. A brand hue inside 200-235 degrees may pull it at most 8 degrees; nothing else
  // moves it (no teal, no green). Light: a white patent sheet.
  canvas(b) {
    if (!b.isDark) return '#FCFCFA';
    const near = [b.hexToHsl(b.primary), b.hexToHsl(b.secondary)].filter(c => c.s >= 20 && c.h >= 200 && c.h <= 235);
    const nudge = near.length ? Math.max(-8, Math.min(8, near[0].h - 218)) : 0;
    return b.hslToHex(218 + nudge, 62, 24);
  },

  tokens(t) {
    const d = t.isDark;
    // legible-on-canvas versions of the markers (lifted toward white on the blue field, shaded on paper)
    const toward = d ? '#ffffff' : '#000000';
    const ui = (hex, min) => { let c = hex; for (let k = 1; k <= 20 && t.contrast(c, t.canvas) < min; k++) c = t.mix(toward, c, k * 0.05); return c; };
    const priUi = ui(t.primary, 3.2);
    const accUi = t.contrast(t.accent, t.canvas) >= 3 ? t.accent : ui(t.accent, 3);
    const secUi = t.contrast(t.secondary, t.canvas) >= 3 ? t.secondary : ui(t.secondary, 3);
    const brand = typeof effectiveContent === 'function' ? String(effectiveContent().brandName || '') : '';
    // Any letter or digit survives (Café, 東京); only characters that would break the CSS string go.
    const clean = s => s.replace(/[^\p{L}\p{N} .&\-]/gu, '').toUpperCase().slice(0, 24) || 'PROJECT';
    const line = d ? t.ink : '#111111';
    return {
      '--ab-l1': t.alpha(line, 0.92),
      '--ab-l2': t.alpha(line, 0.55),
      '--ab-l3': t.alpha(line, 0.24),
      '--ab-grid-s': d ? 'rgba(255,255,255,.08)' : 'transparent',
      '--ab-grid-l': d ? 'rgba(255,255,255,.16)' : 'transparent',
      '--ab-hatch': t.alpha(line, d ? 0.42 : 0.5),
      '--ab-hatch-ui': t.alpha(line, d ? 0.3 : 0.34),
      '--ab-pri-ui': priUi,
      '--ab-acc-ui': accUi,
      '--ab-sec-ui': secUi,
      '--ab-proj': `'${clean(brand)}'`,
      '--ab-date': `'${(dd => `${dd.getFullYear()}-${String(dd.getMonth() + 1).padStart(2, '0')}-${String(dd.getDate()).padStart(2, '0')}`)(new Date())}'`,   // local date, not UTC
      '--ab-type-pick-w': '400',
    };
  },

  // A full drawing sheet of the brand initial as an extruded block letter (viewBox 480 x 300):
  // VIEW A front elevation with a dimension chain and the cutting plane B-B, SECTION B-B with 45 degree
  // hatching, VIEW C oblique with lettered callouts, DETAIL D at 2:1, general notes, a third-angle symbol,
  // a revision table and one revision cloud (the only use of the primary). The bottom-right quarter is left
  // empty: the hero copy sits there as the title block. Light mode is a patent drawing: FIG. 1-4, reference
  // numerals with curved leaders, no zone marks and no revision table.
  // Line types: .bp-k visible 1.6, .bp-l dimension 0.8, .bp-dash hidden (4 3), .bp-cl centre (10 3 2 3).
  // art() returns two <svg> crops of bpDrawing: the sheet (board, cover) and the front view + section (phone);
  // css picks one. deck.materialArt crops the oblique view + detail.
  art(ctx) {
    const svg = bpDrawing(ctx);
    return svg('bpa-sheet', '0 0 480 300', 's') + svg('bpa-crop', '16 22 184 158', 'p');
  },

  materials: [
    { name: 'Drawing field', css: 'background: {canvas}; background-image: 1px grid lines every 8px at rgba(255,255,255,.08) and every 40px at .16; /* a fixed Prussian blue, hue 218, 62%, 24%; light mode is white paper with no grid */' },
    { name: 'Line types', css: 'stroke: {ink}; /* visible 1.6px, dimension 0.8px, hidden stroke-dasharray 4 3, centre 10 3 2 3; nothing is filled */' },
    { name: 'Outline button', css: 'background: transparent; color: {ink}; border: 1.5px solid {ink}; border-radius: 0; font: 600 12px ui-monospace, "SF Mono", Menlo, monospace; text-transform: uppercase; letter-spacing: .1em; /* hover: a second 1px outline 3px outside; active: the same plus 45deg hatching */' },
    { name: 'Selected tab', css: 'background: repeating-linear-gradient(45deg, {hatch} 0 1px, transparent 1px 6px); box-shadow: inset 0 0 0 1.5px {ink}, inset 0 0 0 3.5px {canvas}, inset 0 0 0 4.5px {ink}; /* a double outline over hatching, never a colour fill */' },
    { name: 'Revision cloud', css: 'stroke: {priUi}; stroke-width: 1.2px; fill: none; /* scalloped outline round one change on the drawing, with a numbered triangle; the only primary on the board */' },
    { name: 'Dimension line', css: 'border-top: 1px solid {accUi}; /* end ticks and a mono figure in a gap of the line, under the headline word */' },
    { name: 'Title block', css: 'border: 1.6px solid {ink}; background: {canvas}; display: grid; /* bottom right of the sheet: sheet number, TITLE (the headline), description, scale / sheet / revision */' },
  ],

  rules: {
    do: [
      'Keep the field Prussian blue (or white paper for a patent sheet); the client never sets the ground.',
      'Use a strict line-type set: 1.6px visible, 0.8px dimension, dashed hidden, chain centre lines.',
      'Fill the hero with a real sheet: elevation, section with 45 degree hatching, oblique view, a detail, notes and a revision table.',
      'Set the headline as the title in the title block, in single-stroke mono capitals.',
    ],
    dont: [
      'Fill buttons, tabs, panels or toggles with colour; selection is a double outline over hatching.',
      'Use the client primary for more than one revision cloud.',
      'Draw organic or topographic squiggles; every line is a measured edge, dimension or centre line.',
      'Add shadows, gradients or rounded corners.',
    ],
  },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    coverDisplay: 0.5,
    coverBand: false,
    // Material slide: the oblique view and DETAIL D at 2:1, cropped from the same drawing
    materialArt: ctx => bpDrawing(ctx)('bpa-det', '200 18 266 150', 'd'),
    principles: [
      ['Draw it to scale', 'White line on Prussian blue, nothing filled.'],
      ['Annotate like a drawing', 'Views, sections, dimensions and a title block.'],
      ['One revision cloud', 'The brand colour marks the change, once.'],
    ],
    do: [
      'Use the line-type set.',
      'Hatch sections and selected states.',
      'Set titles in mono capitals.',
    ],
    dont: [
      'Fill buttons or tabs.',
      'Tint the field with a client hue.',
      'Use colour for decoration.',
    ],
  },
});
