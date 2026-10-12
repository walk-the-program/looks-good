/* 21 Blob Tracking — tracked, clinical, live. References: Ultralytics YOLO detections,
   Forensic Architecture, Lozano-Hemmer's Zoom Pavilion, TouchDesigner blob tracking:
   footage of a subject you can name, crisp 1px vector boxes over fine grain, a class name
   and confidence on every box, links between centroids, box interiors processed.

   The hero art is the footage plate: people crossing a plaza seen from a high angle (13
   walking figures on two crossing paths, each with a long cast shadow, a faint paving
   grid, a lit doorway at the right), as a luminance field on a 432 x 180 grid (~2px
   cells at 884w) thresholded against an 8x8 Bayer matrix (two tone levels) on a dark
   plate with a 12% secondary wash. The detection overlay is derived from the SAME
   figures: every person gets a box (PERSON 0.93), walkers together get a GROUP box,
   two dashed ZONE boxes span the paths, some shadows (SHADOW 0.41) and the doorway are
   detected too. Inside the boxes the footage is processed (groups revealed, persons
   inverted, the lock tinted primary). Exactly one person is locked in primary; its
   X / Y / A readout sits above its tab on a backing. Tabs are de-collided (BT_TABS). */
(function () {
let seq = 0;

// Ordered-dither threshold matrix (n x n, n a power of two), values 0..n*n-1.
function btBayer(n) {
  let m = [[0]];
  let s = 1;
  const q = [[0, 2], [3, 1]];
  while (s < n) {
    const nm = [];
    for (let y = 0; y < s * 2; y++) {
      nm.push([]);
      for (let x = 0; x < s * 2; x++) nm[y].push(4 * m[y % s][x % s] + q[Math.floor(y / s)][Math.floor(x / s)]);
    }
    m = nm; s *= 2;
  }
  return m;
}
const BT_B = btBayer(8);
const BT_NX = 432, BT_NY = 180;          // dither grid (2.4 : 1); one cell = one viewBox unit (~2px at 884w)
const BT_HASH = (x, y) => { const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return v - Math.floor(v); };

// ---- the subject: people crossing a plaza, seen from a high angle ----
// Feet positions along two crossing paths (one runs to a lit doorway at the right). Each
// figure: head disc r 3, torso capsule 5 x 11, two leg strokes at +-15 deg (two stride
// frames), and a long cast shadow (an ellipse at 25% amplitude, offset +8, +4).
const BT_DOOR = { x0: 394, y0: 26, x1: 414, y1: 98 };
const BT_SUBJ = (function () {
  const feet = [
    // path A: bottom left to the doorway
    [56, 158], [104, 148], [114, 141], [188, 128], [198, 123], [194, 136], [280, 110], [326, 101],
    // path B: top left to bottom right, crossing A
    [92, 62], [150, 84], [162, 80], [246, 118], [318, 146],
  ];
  return feet.map(([fx, fy], i) => ({
    fx, fy, frame: i % 2, amp: 0.86 + BT_HASH(i, 1) * 0.14,
    // bounding box of the figure (used by the clustering below)
    x: fx, y: fy - 12, hx: 3.6, hy: 12.6,
  }));
})();
const BT_SHADOWS = BT_SUBJ.map(s => ({ x: s.fx + 8, y: s.fy + 4, rx: 9, ry: 2.4 }));

// Luminance field: a dark plaza with a faint paving grid, a lit doorway and its spill,
// bright figures and their dim cast shadows.
const BT_LUM = (function () {
  const L = new Float32Array(BT_NX * BT_NY);
  const D = BT_DOOR;
  for (let y = 0; y < BT_NY; y++) for (let x = 0; x < BT_NX; x++) {
    let v = 0.03 + 0.05 * (y / BT_NY) + (BT_HASH(x, y) - 0.5) * 0.035;
    if (x % 24 === 0 || y % 24 === 0) v += 0.06;                                  // paving joints
    const sx = Math.max(0, D.x0 - x), sy = Math.max(0, y - D.y1);
    v += 0.16 * Math.exp(-(sx * sx) / 1800 - (sy * sy) / 220) * (y > D.y0 ? 1 : 0); // door spill
    if (x >= D.x0 && x <= D.x1 && y >= D.y0 && y <= D.y1) v = 0.78 + (BT_HASH(x, y) - 0.5) * 0.05;
    L[y * BT_NX + x] = v;
  }
  const seg = (px, py, ax, ay, bx, by) => {
    const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy;
    const t = l ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l)) : 0;
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
  };
  const add = (x, y, v) => { if (x >= 0 && y >= 0 && x < BT_NX && y < BT_NY) { const k = y * BT_NX + x; L[k] = Math.max(L[k], v); } };
  BT_SHADOWS.forEach(sh => {
    for (let y = Math.floor(sh.y - 5); y <= sh.y + 5; y++) for (let x = Math.floor(sh.x - 13); x <= sh.x + 13; x++) {
      const u = (x + 0.5 - sh.x) / sh.rx, w = (y + 0.5 - sh.y) / sh.ry;
      const d = Math.max(0, Math.sqrt(u * u + w * w) - 1) * sh.ry;
      add(x, y, 0.25 * Math.exp(-d * d * 0.9) + 0.03);
    }
  });
  BT_SUBJ.forEach(s => {
    const { fx, fy } = s;
    const sp = Math.tan(15 * Math.PI / 180) * 7;
    const legs = s.frame ? [[fx - 1, fy - 7, fx - 1 - sp, fy], [fx + 1, fy - 7, fx + 1 + sp, fy]] : [[fx - 1, fy - 7, fx - 0.6, fy], [fx + 1, fy - 7, fx + 1 + sp * 0.7, fy - 0.4]];
    for (let y = Math.floor(fy - 26); y <= fy + 1; y++) for (let x = Math.floor(fx - 6); x <= fx + 6; x++) {
      const px = x + 0.5, py = y + 0.5;
      const head = Math.max(0, Math.hypot(px - fx, py - (fy - 21.5)) - 3);
      const torso = Math.max(0, seg(px, py, fx, fy - 15.5, fx, fy - 9.5) - 2.5);
      const leg = Math.min(...legs.map(l => Math.max(0, seg(px, py, l[0], l[1], l[2], l[3]) - 0.9)));
      const v = Math.max(s.amp * Math.exp(-head * head * 1.4), s.amp * 0.82 * Math.exp(-torso * torso * 1.4), s.amp * 0.7 * Math.exp(-leg * leg * 1.6));
      add(x, y, v);
    }
  });
  return L;
})();

// Two tone levels of ordered dither as run-length path data (step = cell size, for a coarser copy).
function btDitherPaths(step) {
  let dim = '', bright = '';
  for (let y = 0; y < BT_NY; y += step) {
    let rd = -1, rb = -1;
    for (let x = 0; x <= BT_NX; x += step) {
      let od = false, ob = false;
      if (x < BT_NX) {
        const v = BT_LUM[y * BT_NX + x];
        const th = (BT_B[(y / step) % 8][(x / step) % 8] + 0.5) / 64;
        od = v > th; ob = (v - 0.3) * 1.55 > th;
      }
      if (od && rd < 0) rd = x;
      if (!od && rd >= 0) { dim += `M${rd} ${y}h${x - rd}v${step}h-${x - rd}z`; rd = -1; }
      if (ob && rb < 0) rb = x;
      if (!ob && rb >= 0) { bright += `M${rb} ${y}h${x - rb}v${step}h-${x - rb}z`; rb = -1; }
    }
  }
  return { dim, bright };
}
const BT_PATHS = btDitherPaths(1);
const BT_PATHS2 = btDitherPaths(2);   // a coarser copy for the deck band data URI

// ---- detection: boxes derived from the subjects ----
const BT_BOXES = (function () {
  const S = BT_SUBJ;
  const clusters = th => {
    const p = S.map((_, i) => i); const f = i => (p[i] === i ? i : (p[i] = f(p[i])));
    for (let i = 0; i < S.length; i++) for (let j = i + 1; j < S.length; j++) if (Math.hypot(S[i].fx - S[j].fx, S[i].fy - S[j].fy) < th) p[f(i)] = f(j);
    const m = new Map(); S.forEach((_, i) => { const k = f(i); if (!m.has(k)) m.set(k, []); m.get(k).push(i); });
    return [...m.values()];
  };
  const bb = (ids, pad, k) => {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    ids.forEach(i => { const s = S[i]; x0 = Math.min(x0, s.x - s.hx); x1 = Math.max(x1, s.x + s.hx); y0 = Math.min(y0, s.y - s.hy); y1 = Math.max(y1, s.y + s.hy); });
    x0 = Math.max(1.5, x0 - pad); y0 = Math.max(2.5, y0 - pad); x1 = Math.min(BT_NX - 1.5, x1 + pad); y1 = Math.min(BT_NY - 2.5, y1 + pad);
    return { x0, y0, x1, y1, n: ids.length, k, ids, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
  };
  // zones (dashed, 2 per frame), groups of walkers together, then every person
  const groups = clusters(64).filter(c => c.length >= 4).sort((a, b) => b.length - a.length).slice(0, 2).map(c => bb(c, 6, 'group'));
  const cl = clusters(17).filter(c => c.length >= 2).map(c => bb(c, 3, 'cluster'));
  const people = S.map((_, i) => bb([i], 1.2, 'single'));
  const shadows = BT_SHADOWS.filter((_, i) => i % 3 === 0).map(sh => ({ x0: sh.x - sh.rx - 1, y0: sh.y - sh.ry - 1, x1: sh.x + sh.rx + 1, y1: sh.y + sh.ry + 1, k: 'shadow', n: 1, cx: sh.x, cy: sh.y }));
  const D = BT_DOOR;
  const door = { x0: D.x0 - 2, y0: D.y0 - 2, x1: D.x1 + 2, y1: D.y1 + 2, k: 'door', n: 1, cx: (D.x0 + D.x1) / 2, cy: (D.y0 + D.y1) / 2 };
  const all = groups.concat(cl, people, shadows, [door]);
  // the lock: the person nearest the right-of-centre focus point
  let lock = null, best = 1e9;
  people.forEach(b => { const d = Math.hypot(b.cx - BT_NX * 0.64, b.cy - BT_NY * 0.55); if (d < best) { best = d; lock = b; } });
  if (lock) lock.lock = true;
  // stable ids and confidences
  all.forEach((b, i) => {
    b.id = String(i + 1).padStart(2, '0');
    b.conf = b.k === 'shadow' ? (0.36 + BT_HASH(i, 5) * 0.12).toFixed(2) : b.k === 'door' ? '0.88' : (0.81 + BT_HASH(i, 3) * 0.18).toFixed(2);
  });
  return all;
})();

// Tab placement in plate units, assuming the 884px board (2.05 px per cell; 9px mono, 0.6em
// per char, 0.4em side padding): sorted by y, a tab that would hit a placed one flips under
// its box's bottom edge; if that hits too it shrinks to its ID. At most 18 tabs carry a class.
const BT_TABS = (function () {
  const u = 884 / BT_NX, ch = (9 * 0.6) / u, pad = (9 * 0.8) / u, th = (9 * 1.55) / u;
  const placed = [];
  const hit = r => placed.some(q => r.x0 < q.x1 && r.x1 > q.x0 && r.y0 < q.y1 && r.y1 > q.y0);
  let full = 0;
  const order = BT_BOXES.slice().sort((a, b) => (b.lock ? 1 : 0) - (a.lock ? 1 : 0) || a.y0 - b.y0);
  const out = new Map();
  order.forEach(b => {
    let txt;
    if (b.k === 'group') txt = `ZONE ${b.id} · ${b.n} OBJ`;
    else if (b.k === 'cluster') txt = `GROUP ${b.id} · ${b.n} OBJ`;
    else if (b.k === 'shadow') txt = `SHADOW ${b.conf}`;
    else if (b.k === 'door') txt = `DOORWAY ${b.conf}`;
    else txt = `PERSON ${b.conf}`;
    if (!b.lock && full >= 18) txt = b.id;
    const w = txt.length * ch + pad;
    const above = { x0: b.x0, x1: b.x0 + w, y0: b.y0 - th, y1: b.y0 };
    const below = { x0: b.x0, x1: b.x0 + w, y0: b.y1, y1: b.y1 + th };
    let pos = 'above', r = above;
    if (hit(above)) { pos = 'below'; r = below; }
    if (!b.lock && hit(r)) { txt = b.id; pos = 'above'; r = { x0: b.x0, x1: b.x0 + 2 * ch + pad, y0: b.y0 - th, y1: b.y0 }; if (hit(r)) { pos = 'below'; r = { x0: b.x0, x1: b.x0 + 2 * ch + pad, y0: b.y1, y1: b.y1 + th }; } }
    if (txt !== b.id) full++;
    placed.push(r);
    // the locked readout line sits above the lock's tab: reserve it before anything else lands there
    if (b.lock) placed.push({ x0: b.x0, x1: b.x0 + 24 * ch + pad, y0: r.y0 - th - 16 / u, y1: r.y0 });
    out.set(b, { txt, pos });
  });
  return out;
})();

// centroid links: k = 2 nearest neighbours (cluster + single boxes), plus three long dashed links
const BT_LINKS = (function () {
  const B = BT_BOXES.filter(b => b.k === 'single' || b.k === 'cluster');
  const seen = new Set(), near = [];
  B.forEach((b, i) => {
    B.map((c, j) => ({ j, d: Math.hypot(b.cx - c.cx, b.cy - c.cy) })).filter(o => o.j !== i).sort((p, q) => p.d - q.d).slice(0, 2).forEach(o => {
      const k = i < o.j ? i + '-' + o.j : o.j + '-' + i;
      if (!seen.has(k)) { seen.add(k); near.push([b, B[o.j]]); }
    });
  });
  const lock = BT_BOXES.find(b => b.lock) || B[0];
  const far = B.slice().sort((p, q) => Math.hypot(q.cx - lock.cx, q.cy - lock.cy) - Math.hypot(p.cx - lock.cx, p.cy - lock.cy)).slice(0, 3).map(b => [lock, b]);
  return { near, far };
})();

const f1 = n => (Math.round(n * 10) / 10).toString();

function btLockColor(t, plate) {
  let lock = t.primary;
  for (let k = 1; k <= 12 && t.contrast(lock, plate) < 3.2; k++) lock = t.mix(t.primary, '#ffffff', k * 0.06);
  return lock;
}

// The plate SVG (shared by the hero art and the deck band data URI).
function btPlateSvg(t, id, opts) {
  const o = opts || {};
  const base = t.mix(t.isDark ? t.canvas : t.ink, '#000000', 0.3);
  const plate = t.mix(t.secondary, base, 0.12);           // a 12% secondary duotone wash
  const lit = t.isDark ? t.ink : t.canvas;
  const lock = btLockColor(t, plate);
  const paths = o.paths || BT_PATHS;
  const vf = o.ns ? 'vector-effect="non-scaling-stroke"' : '';
  const sw = o.ns ? 1 : 0.22;
  const rect = b => `<rect x="${f1(b.x0)}" y="${f1(b.y0)}" width="${f1(b.x1 - b.x0)}" height="${f1(b.y1 - b.y0)}"/>`;
  // groups and clusters reveal the footage at full strength; single subjects and the lock are inverted
  // most persons are revealed (so the figures read); one in four and the lock are inverted
  const singles = BT_BOXES.filter(b => b.k === 'single');
  const inv = singles.filter((b, i) => b.lock || i % 4 === 3);
  const reveal = BT_BOXES.filter(b => (b.k === 'group' || b.k === 'cluster' || b.k === 'door' || b.k === 'single') && !inv.includes(b));
  const invert = inv;
  // (shadows and the doorway are detected but not processed)
  const L = BT_BOXES.find(b => b.lock);

  const near = BT_LINKS.near.map(([p, q]) => `M${f1(p.cx)} ${f1(p.cy)}L${f1(q.cx)} ${f1(q.cy)}`).join('');
  const far = BT_LINKS.far.map(([p, q]) => { const mx = (p.cx + q.cx) / 2, my = Math.min(p.cy, q.cy) - 32; return `M${f1(p.cx)} ${f1(p.cy)}Q${f1(mx)} ${f1(Math.max(4, my))} ${f1(q.cx)} ${f1(q.cy)}`; }).join('');

  let boxes = '', ticks = '', cross = '';
  BT_BOXES.forEach(b => {
    const col = b.lock ? lock : lit;
    const op = b.lock ? 1 : (b.k === 'group' ? 0.62 : 0.9);
    const dash = b.k === 'group' ? (o.ns ? '4 3' : '1.2 0.9') : b.k === 'shadow' ? (o.ns ? '1 2' : '0.4 0.6') : '';
    boxes += `<rect ${vf} x="${f1(b.x0)}" y="${f1(b.y0)}" width="${f1(b.x1 - b.x0)}" height="${f1(b.y1 - b.y0)}" fill="none" stroke="${col}" stroke-opacity="${b.k === 'shadow' ? 0.55 : op}" stroke-width="${b.lock ? sw * 1.6 : sw}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
    if (b.k !== 'single' && b.k !== 'shadow') {
      const Lt = Math.min(2.6, (b.x1 - b.x0) * 0.25), x0 = b.x0, y0 = b.y0, x1 = b.x1, y1 = b.y1, e = 0.5;
      ticks += `<path ${vf} fill="none" stroke="${col}" stroke-width="${b.lock ? sw * 2.6 : sw * 1.6}" d="M${f1(x0 - e)} ${f1(y0 + Lt)}V${f1(y0 - e)}H${f1(x0 + Lt)}M${f1(x1 - Lt)} ${f1(y0 - e)}H${f1(x1 + e)}V${f1(y0 + Lt)}M${f1(x1 + e)} ${f1(y1 - Lt)}V${f1(y1 + e)}H${f1(x1 - Lt)}M${f1(x0 + Lt)} ${f1(y1 + e)}H${f1(x0 - e)}V${f1(y1 - Lt)}"/>`;
    }
    if (b.k === 'single' || b.k === 'cluster') {
      const r = b.lock ? 3.4 : 1.6;
      cross += `M${f1(b.cx - r)} ${f1(b.cy)}H${f1(b.cx + r)}M${f1(b.cx)} ${f1(b.cy - r)}V${f1(b.cy + r)}`;
    }
  });

  return `<defs>
      <path id="${id}d" d="${paths.dim}"/><path id="${id}e" d="${paths.bright}"/>
      <clipPath id="${id}g">${reveal.map(rect).join('')}</clipPath>
      <clipPath id="${id}i">${invert.map(rect).join('')}</clipPath>
      ${L ? `<clipPath id="${id}l">${rect(L)}</clipPath>` : ''}
      ${o.grain ? `<filter id="${id}n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.4 -0.42"/></filter>` : ''}
    </defs>
    <rect width="${BT_NX}" height="${BT_NY}" fill="${plate}"/>
    <g fill="${lit}" shape-rendering="crispEdges"><use href="#${id}d" fill-opacity=".16"/><use href="#${id}e" fill-opacity=".5"/></g>
    <g clip-path="url(#${id}g)" shape-rendering="crispEdges"><rect width="${BT_NX}" height="${BT_NY}" fill="${plate}"/><g fill="${lit}"><use href="#${id}d" fill-opacity=".3"/><use href="#${id}e" fill-opacity=".92"/></g></g>
    <g clip-path="url(#${id}i)" shape-rendering="crispEdges"><rect width="${BT_NX}" height="${BT_NY}" fill="${lit}"/><g fill="${plate}"><use href="#${id}d" fill-opacity=".3"/><use href="#${id}e" fill-opacity=".92"/></g></g>
    ${L ? `<g clip-path="url(#${id}l)"><rect width="${BT_NX}" height="${BT_NY}" fill="${t.primary}" opacity=".35" style="mix-blend-mode:multiply"/></g>` : ''}
    ${o.grain ? `<rect width="${BT_NX}" height="${BT_NY}" filter="url(#${id}n)" opacity=".14" style="mix-blend-mode:screen"/>` : ''}
    <g fill="none" stroke="${lit}">
      <path ${vf} d="${near}" stroke-opacity=".8" stroke-width="${sw}"/>
      <path ${vf} d="${far}" stroke-opacity=".7" stroke-width="${sw}" stroke-dasharray="${o.ns ? '3 3' : '0.8 0.8'}"/>
    </g>
    ${boxes}${ticks}
    <path ${vf} d="${cross}" fill="none" stroke="${lit}" stroke-width="${sw}"/>
    ${L ? `<circle ${vf} cx="${f1(L.cx)}" cy="${f1(L.cy)}" r="5" fill="none" stroke="${lock}" stroke-width="${sw}"/><path ${vf} d="M${f1(L.cx - 3.4)} ${f1(L.cy)}H${f1(L.cx + 3.4)}M${f1(L.cx)} ${f1(L.cy - 3.4)}V${f1(L.cy + 3.4)}" stroke="${lock}" stroke-width="${sw}"/>` : ''}`;
}

// The plate (without tabs) for the deck cover band and closing strip, as a CSS data URI.
let btBandCache = { k: '', v: '' };
function btBandUri(t) {
  const k = [t.canvas, t.ink, t.primary, t.secondary, t.isDark].join('|');
  if (btBandCache.k === k) return btBandCache.v;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BT_NX} ${BT_NY}" preserveAspectRatio="xMidYMid slice">${btPlateSvg(t, 'bd', { paths: BT_PATHS2 })}</svg>`;
  const v = `url('data:image/svg+xml,${encodeURIComponent(svg).replace(/'/g, '%27')}')`;
  btBandCache = { k, v };
  return v;
}

registerAesthetic({
  key: 'blob-tracking', order: 21,
  name: 'Blob Tracking',
  descriptor: 'Tracked · Clinical · Live',
  influences: 'YOLO detection / Forensic Architecture / Zoom Pavilion',
  summary: 'People tracked in dithered footage: crisp 1px boxes with class and confidence tabs, linked centroids, one locked target.',
  motto: 'Everything in frame is accounted for.',
  kicker: 'Frame 0412 · Tracking 13',
  mode: 'dark',
  slideShape: 'minimal',
  labels: { material: 'Detection', states: ['Searching', 'Locked', 'Lost'], statesKind: 'button' },
  layout: { hero: 'centered', palette: 'swatches', sections: 'two-col' },
  type: { ui: 'mono', label: 'mono', display: 0.7 },
  highlight: 'custom',
  highlightNote: 'The word is set in --accent-ink and enclosed by a 1px white detection box with corner ticks and an "ID 07 · 0.93" label tab hanging under its lower-left corner; no fill, no glow. The whole headline sits in a fainter box tagged "TEXT 0.99 · CLASS: HEADLINE" above it.',

  roles: {
    canvas: {
      use: 'The near-black frame the footage and every panel sit in (lightness capped at 7%), with a fine static grain',
      never: 'Text, or a lighter card fill; panels are hairline boxes, not planes',
      coverage: '70–75%',
    },
    ink: {
      use: 'White detection ink: every 1px bounding box, tab, crosshair, link, mono label and the headline; the footage itself is ink dither on the plate',
      never: 'Large filled fields (a filled ink plane is only ever a label tab or an inverted box interior)',
      coverage: '15–20%',
    },
    primary: {
      use: 'The locked target: its box, tab and interior tint in the footage, the one solid main action and the selected state',
      never: 'More than one locked box per view, body text, decorative fills, glow',
      coverage: '≈6–8%',
    },
    secondary: {
      use: 'A 12% duotone wash over the whole footage plate, and status tags and confidence tracks',
      never: 'The main action, bounding boxes, glows on subjects, body text',
      coverage: '≈10%',
    },
    accent: {
      use: 'The REC / live dot and the one highlighted headline word',
      never: 'Boxes, buttons, body text, borders, large fills',
      coverage: '≤3%',
    },
  },

  // Its own ground: a neutral monitor graphite (never the client's warm neutral); light
  // mode keeps the client's pale canvas with the plate dark.
  canvas(b) {
    return b.isDark ? '#16181a' : null;
  },

  tokens(t) {
    const st = typeof state !== 'undefined' ? state : null;
    const d = t.isDark;
    const hf = st && st.headingFont;
    const plate = t.mix(d ? t.canvas : t.ink, '#000000', 0.3);
    const lit = d ? t.ink : t.canvas;
    const lock = btLockColor(t, plate);
    const ticks = (c, w, l) => [
      `linear-gradient(${c},${c}) 0 0/${l}px ${w}px no-repeat`, `linear-gradient(${c},${c}) 0 0/${w}px ${l}px no-repeat`,
      `linear-gradient(${c},${c}) 100% 0/${l}px ${w}px no-repeat`, `linear-gradient(${c},${c}) 100% 0/${w}px ${l}px no-repeat`,
      `linear-gradient(${c},${c}) 0 100%/${l}px ${w}px no-repeat`, `linear-gradient(${c},${c}) 0 100%/${w}px ${l}px no-repeat`,
      `linear-gradient(${c},${c}) 100% 100%/${l}px ${w}px no-repeat`, `linear-gradient(${c},${c}) 100% 100%/${w}px ${l}px no-repeat`,
    ].join(',');
    const w = n => { const ws = String((hf && hf.weights) || '400').split(';').map(Number).filter(Boolean); const le = ws.filter(x => x <= n); return le.length ? Math.max(...le) : Math.min(...ws); };
    return {
      '--ab-type-pick-w': w(600),
      '--ab-hw': w(600),
      '--ab-plate': t.mix(t.secondary, plate, 0.12),
      '--ab-lit': lit,
      '--ab-lock': lock,
      '--ab-box': t.alpha(t.ink, 0.9),
      '--ab-box-soft': t.alpha(t.ink, 0.34),
      '--ab-box-hair': t.alpha(t.ink, 0.16),
      '--ab-box-fill': t.alpha(t.ink, d ? 0.045 : 0.035),
      '--ab-flat': t.mix(t.canvas, t.ink, 0.96), // the canvas with a 4% ink lift (mix weights its first colour)
      '--ab-ticks': ticks(t.ink, 1.5, 7),
      '--ab-ticks-soft': ticks(t.alpha(t.ink, 0.55), 1, 5),
      '--ab-ticks-lock': ticks(t.primary, 2, 8),
      '--bt-band': btBandUri(t),
    };
  },

  art(ctx) {
    const t = ctx.t;
    const id = 'bt' + (++seq);
    const pct = (v, total) => (v / total * 100).toFixed(2);
    // a tab on every box: a class name and confidence (PERSON 0.93, SHADOW 0.41, GROUP 03 · 4 OBJ),
    // placed by BT_TABS (flipped under the box where two would collide; past 18, the ID only)
    const tabs = BT_BOXES.map(b => {
      const T = BT_TABS.get(b);
      const left = pct(b.x0, BT_NX), top = pct(T.pos === 'below' ? b.y1 : b.y0, BT_NY);
      const small = (b.x1 - b.x0) < BT_NX * 0.03 && !b.lock;
      const cls = `bta-tab${b.lock ? ' is-lock' : ''}${b.k === 'group' ? ' is-grp' : ''}${b.k === 'shadow' ? ' is-sh' : ''}${small ? ' is-sm' : ''}${T.pos === 'below' ? ' is-below' : ''}`;
      return `<span class="${cls}" style="left:${left}%;top:${top}%">${b.lock ? `<b>${T.txt}</b><i> · LOCK</i>` : `<b>${T.txt}</b>`}</span>`;
    }).join('');
    const L = BT_BOXES.find(b => b.lock);
    // the locked readout sits above the locked box's tab on a backing, so it always reads
    const xy = L ? `<span class="bta-xy" style="left:${pct(L.x0, BT_NX)}%;top:${pct(L.y0, BT_NY)}%">X ${String(Math.round(L.cx * 7.1)).padStart(4, '0')}  Y ${String(Math.round(L.cy * 6)).padStart(4, '0')}  A ${Math.round((L.x1 - L.x0) * (L.y1 - L.y0) * 2.2)}px</span>` : '';

    // frame furniture: a timecode ruler along the bottom edge
    let ruler = '';
    for (let x = 16; x <= BT_NX - 16; x += 6) ruler += `M${x} ${BT_NY}v${(x - 16) % 30 === 0 ? -6 : -2.8}`;
    return `<div class="bta">
      <div class="bta-plate">
        <svg class="bta-fx" viewBox="0 0 ${BT_NX} ${BT_NY}" preserveAspectRatio="none" focusable="false">
          ${btPlateSvg(t, id, { ns: true, grain: true })}
          <path vector-effect="non-scaling-stroke" d="${ruler}" fill="none" stroke="${t.isDark ? t.ink : t.canvas}" stroke-opacity=".5" stroke-width="1"/>
        </svg>
        ${tabs}${xy}
      </div>
      <span class="bta-hud bta-tl"><i class="bta-rec"></i>REC · FRAME 0412</span>
      <span class="bta-hud bta-tr">TRACKING ${BT_SUBJ.length} PERSONS · ${BT_BOXES.length} BOXES · 30 FPS</span>
      <span class="bta-hud bta-bl">THRESH 0.62 · MIN AREA 240</span>
      <span class="bta-hud bta-br">00:00:13:12</span>
      <i class="bta-corner" aria-hidden="true"></i>
    </div>`;
  },

  materials: [
    { name: 'Footage plate', css: 'background: {plate}; /* near-black with a 12% secondary wash; the subject (a flock, a crowd) as a two-tone 8x8 Bayer ordered dither in {lit}; outside the boxes at 55%, fine grain; the plate stays dark in light mode too */' },
    { name: 'Detection box', css: 'border: 1px solid {ink}; /* 1px, never rounded, never glowing; 20-30 per frame from 3 to 45 cells, overlapping and nested; the interior is the footage inverted */' },
    { name: 'Label tab', css: 'background: {ink}; color: {canvas}; font: 700 8px/1.6 mono; padding: 0 4px; /* on every box: "ID 07 · 0.93" or "X075Y034"; groups read "GRP 01 · 14 OBJ" */' },
    { name: 'Locked target', css: 'border: 1.5px solid {lock}; /* the only primary box in a view; its interior gets a primary multiply at 35% and its tab is filled {primary} */' },
    { name: 'Group box', css: 'border: 1px dashed {boxSoft}; /* 2-3 per frame around dense clusters; the footage inside shows at full strength */' },
    { name: 'Centroid link', css: 'stroke: {ink} at 80%; 1px; /* each centroid to its two nearest neighbours, plus three long dashed links from the lock */' },
    { name: 'Confidence bar', css: 'background: repeating-linear-gradient(90deg, {boxHair} 0 1px, transparent 1px 5px); /* hairline track with ticks; the fill is a 1px {ink} line ending in a square marker */' },
  ],

  rules: {
    do: [
      'Track a subject you can name (people, a crowd, traffic) in fine dithered footage, with 1px boxes of every size that overlap and nest.',
      'Put a solid mono tab on every box (class and confidence: PERSON 0.93, SHADOW 0.41, GROUP 03 · 4 OBJ) and link centroids to their nearest neighbours.',
      'Carry the detection language down the page: frame counters on sections, detected regions around swatches and type specimens.',
      'Process the inside of the boxes differently from the frame: inverted or revealed, with the rest of the footage dropped to about half.',
      'Lock exactly one target in primary per view; keep corner ticks and tabs for the footage, interactive controls and the tracked list.',
    ],
    dont: [
      'Add neon glow, coloured halos, chamfered corners or scanline sweeps; that is Cyber HUD. Boxes are square and 1px.',
      'Round any box or fill a panel with colour; panels are hairline boxes on the near-black frame.',
      'Let tabs collide on the locked target; its readout always reads.',
      'Space boxes evenly like a layout grid; detection is dense, uneven and overlapping.',
    ],
  },
  deck: {
    principles: [
      ['Everything in frame is tracked', 'Crisp 1px boxes, a class and confidence on every one.'],
      ['Lock exactly one target', 'One primary box and action; the rest stay white.'],
      ['A subject you can name', 'People on a plaza, in fine grain under crisp vector boxes.'],
    ],
    do: [
      'Track people you can name in fine footage.',
      'Lock one target in primary.',
      'Tag every box with a class and confidence.',
    ],
    dont: [
      'Add neon glow or coloured halos.',
      'Round boxes or fill panels.',
      'Let tabs collide on the locked target.',
    ],
  },
});
})();
