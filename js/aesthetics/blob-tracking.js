/* 21 Blob Tracking — tracked, clinical, live. Reference: the TouchDesigner / After
   Effects "blob track" look and OpenCV-style detection overlays on footage: thin
   white bounding boxes around moving regions, ID + confidence labels on solid tabs,
   crosshair centroids, straight connector lines, frame coordinates, all over dithered
   high-contrast footage.
   The hero art is the footage plate. Its luminance field is computed in JS from seven
   moving "subjects" (gaussian blobs with a motion trail), thresholded against an 8x8
   Bayer matrix (real ordered dither, two tone levels), over a blurred wash of brand
   colour and fine grain. The detection overlay is derived from the SAME blob list, so
   every box really encloses a bright region. The one locked target is drawn in the
   brand primary; every other box is white ink. Interface elements get the same
   vocabulary in css/aesthetics/blob-tracking.css: bounding boxes with label tabs,
   corner ticks, centroid crosshairs, IDs and confidence bars. */
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
const BT_NX = 200, BT_NY = 92;           // dither grid; one cell = one viewBox unit
const BT_K = 200 / 122;                   // blobs and overlay are authored in a 122 x 56 space
const BT_HASH = (x, y) => { const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return v - Math.floor(v); };

// The tracked subjects, in cell units. t = trail direction (motion smear).
const BT_BLOBS = [
  { id: '07', conf: '0.93', cx: 72, cy: 27, sx: 9, sy: 10.5, amp: 0.95, tr: -1, lock: true, glow: 'primary' },
  { id: '03', conf: '0.88', cx: 29, cy: 21, sx: 6.5, sy: 8, amp: 0.8, tr: 1, glow: 'secondary' },
  { id: '12', conf: '0.81', cx: 103, cy: 38, sx: 8, sy: 5.2, amp: 0.75, tr: -1, glow: 'secondary' },
  { id: '05', conf: '0.76', cx: 45, cy: 43, sx: 5, sy: 6, amp: 0.7, tr: 1, glow: 'ink' },
  { id: '09', conf: '0.71', cx: 108, cy: 14, sx: 3.8, sy: 4.4, amp: 0.62, tr: -1, glow: 'accent' },
  { id: '02', conf: '0.67', cx: 11, cy: 38, sx: 4, sy: 4.4, amp: 0.6, tr: 1, glow: 'ink' },
  { id: '11', conf: '0.58', cx: 49, cy: 10, sx: 3, sy: 2.8, amp: 0.55, tr: -1, glow: 'ink' },
];
BT_BLOBS.forEach(b => { b.cy = 7.5 + b.cy * 0.84; b.sy *= 0.84; }); // keep the top band free for the HUD
// constellation: pairs of blob indices joined by 1px lines
const BT_LINKS = [[5, 1], [1, 6], [6, 0], [1, 3], [3, 0], [0, 2], [0, 4], [4, 2]];
const BT_HX = 1.75; // box half-extent in sigmas

function btLum(px, py) {
  const x = px / BT_K, y = py / BT_K, NYo = BT_NY / BT_K;
  let v = 0.025 + 0.1 * (y / NYo) + 0.06 * Math.exp(-Math.pow((x - 0.95 * y - 52) / 26, 2));
  for (const b of BT_BLOBS) {
    const dx = x - b.cx, dy = y - b.cy;
    v += b.amp * Math.exp(-(dx * dx / (2 * b.sx * b.sx) + dy * dy / (2 * b.sy * b.sy)));
    const tx = x - (b.cx + b.tr * b.sx * 1.7);
    v += b.amp * 0.4 * Math.exp(-(tx * tx / (2 * Math.pow(b.sx * 1.5, 2)) + dy * dy / (2 * b.sy * b.sy * 1.3)));
  }
  return v + (BT_HASH(px, py) - 0.5) * 0.07;
}

// Two tone levels of ordered dither as run-length path data.
function btDitherPaths() {
  let dim = '', bright = '';
  for (let y = 0; y < BT_NY; y++) {
    let rd = -1, rb = -1;
    for (let x = 0; x <= BT_NX; x++) {
      let od = false, ob = false;
      if (x < BT_NX) {
        const v = btLum(x, y);
        const th = (BT_B[y % 8][x % 8] + 0.5) / 64;
        od = v > th; ob = (v - 0.3) * 1.55 > th;
      }
      if (od && rd < 0) rd = x;
      if (!od && rd >= 0) { dim += `M${rd} ${y}h${x - rd}v1h-${x - rd}z`; rd = -1; }
      if (ob && rb < 0) rb = x;
      if (!ob && rb >= 0) { bright += `M${rb} ${y}h${x - rb}v1h-${x - rb}z`; rb = -1; }
    }
  }
  return { dim, bright };
}
const BT_PATHS = btDitherPaths();

registerAesthetic({
  key: 'blob-tracking', order: 21,
  name: 'Blob Tracking',
  descriptor: 'Tracked · Clinical · Live',
  influences: 'Computer vision / TouchDesigner visuals / Surveillance UI',
  summary: 'Thin white detection boxes, ID labels and crosshairs over dithered footage, tracking every element.',
  motto: 'Everything in frame is accounted for.',
  kicker: 'Frame 0412 · Tracking 7',
  mode: 'dark',
  slideShape: 'minimal',
  labels: { material: 'Detection', states: ['Searching', 'Locked', 'Lost'], statesKind: 'button' },
  layout: { hero: 'centered', palette: 'swatches', sections: 'two-col' },
  type: { ui: 'mono', label: 'mono', display: 0.86 },
  highlight: 'custom',
  highlightNote: 'The word is set in --accent-ink and enclosed by a 1px white detection box with corner ticks and an "ID 07 · 0.93" label tab hanging under its lower-left corner; no fill, no glow. The whole headline sits in a fainter box with its own tab above it.',

  roles: {
    canvas: {
      use: 'The near-black frame the footage and every panel sit in (lightness capped at 7%), with a fine static grain',
      never: 'Text, or a lighter card fill; panels are hairline boxes, not planes',
      coverage: '70–75%',
    },
    ink: {
      use: 'White detection ink: every 1px bounding box, corner tick, crosshair, connector, mono label and the headline',
      never: 'Large filled fields (a filled ink plane is only ever a label tab)',
      coverage: '15–20%',
    },
    primary: {
      use: 'The locked target: its box in the footage, the one solid main action, the selected state and the filled progress mark',
      never: 'More than one locked box per view, body text, decorative fills, glow',
      coverage: '≈6–8%',
    },
    secondary: {
      use: 'The footage itself: soft colour wash behind the dither, plus status tags and confidence tracks',
      never: 'The main action, bounding boxes, body text',
      coverage: '≈10%',
    },
    accent: {
      use: 'The REC / live dot and the one highlighted headline word',
      never: 'Boxes, buttons, body text, borders, large fills',
      coverage: '≤3%',
    },
  },

  // Near-black frame so the white boxes and the footage read as a monitor feed.
  canvas(b) {
    if (!b.isDark) return null;
    const h = b.hexToHsl(b.canvas);
    return h.l > 7 ? b.hslToHex(h.h, Math.min(h.s, 22), 7) : b.canvas;
  },

  tokens(t) {
    const st = typeof state !== 'undefined' ? state : null;
    const d = t.isDark;
    const hf = st && st.headingFont;
    const plate = t.mix(d ? t.canvas : t.ink, '#000000', 0.3);
    const lit = d ? t.ink : t.canvas;
    // the locked box must read on the dark footage plate
    let lock = t.primary;
    for (let k = 1; k <= 12 && t.contrast(lock, plate) < 3.2; k++) lock = t.mix(t.primary, '#ffffff', k * 0.06);
    const ticks = (c, w, l) => [
      `linear-gradient(${c},${c}) 0 0/${l}px ${w}px no-repeat`, `linear-gradient(${c},${c}) 0 0/${w}px ${l}px no-repeat`,
      `linear-gradient(${c},${c}) 100% 0/${l}px ${w}px no-repeat`, `linear-gradient(${c},${c}) 100% 0/${w}px ${l}px no-repeat`,
      `linear-gradient(${c},${c}) 0 100%/${l}px ${w}px no-repeat`, `linear-gradient(${c},${c}) 0 100%/${w}px ${l}px no-repeat`,
      `linear-gradient(${c},${c}) 100% 100%/${l}px ${w}px no-repeat`, `linear-gradient(${c},${c}) 100% 100%/${w}px ${l}px no-repeat`,
    ].join(',');
    const w = n => { const ws = String((hf && hf.weights) || '400').split(';').map(Number).filter(Boolean); const le = ws.filter(x => x <= n); return le.length ? Math.max(...le) : Math.min(...ws); };
    return {
      '--ab-tr': (hf && { condensed: 0, heavy: 0, wide: 0.4, techno: 0.4 }[hf.cls]) ?? 1,
      '--ab-type-pick-w': w(600),
      '--ab-hw': w(600),
      '--ab-plate': plate,
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
    };
  },

  art(ctx) {
    const t = ctx.t;
    const id = 'bt' + (++seq);
    const plate = t.mix(t.isDark ? t.canvas : t.ink, '#000000', 0.3);
    const lit = t.isDark ? t.ink : t.canvas;
    let lock = t.primary;
    for (let k = 1; k <= 12 && t.contrast(lock, plate) < 3.2; k++) lock = t.mix(t.primary, '#ffffff', k * 0.06);
    const gcol = { primary: t.primary, secondary: t.secondary, accent: t.accent, ink: lit };
    const vf = 'vector-effect="non-scaling-stroke"';
    const NXo = 122, NYo = BT_NY / BT_K;
    const pct = (v, total) => (v / total * 100).toFixed(2);

    const glows = BT_BLOBS.map(b => `<ellipse cx="${b.cx}" cy="${b.cy}" rx="${(b.sx * 2.1).toFixed(1)}" ry="${(b.sy * 2.1).toFixed(1)}" fill="${t.mix(plate, gcol[b.glow], b.glow === 'ink' ? 0.3 : 0.62)}" opacity="${b.lock ? 0.95 : 0.8}"/>`).join('');

    const links = BT_LINKS.map(([a, c]) => { const p = BT_BLOBS[a], q = BT_BLOBS[c]; return `M${p.cx} ${p.cy}L${q.cx} ${q.cy}`; }).join('');

    let boxes = '', cross = '', tabs = '';
    BT_BLOBS.forEach(b => {
      const hw = b.sx * BT_HX, hh = b.sy * BT_HX;
      const x0 = b.cx - hw, y0 = b.cy - hh, x1 = b.cx + hw, y1 = b.cy + hh;
      const col = b.lock ? lock : lit;
      const sw = b.lock ? 1.6 : 1;
      const L = Math.min(3, hw * 0.5);
      boxes += `<rect ${vf} x="${x0.toFixed(1)}" y="${y0.toFixed(1)}" width="${(hw * 2).toFixed(1)}" height="${(hh * 2).toFixed(1)}" fill="${b.lock ? t.alpha(lock, 0.08) : 'none'}" stroke="${col}" stroke-width="${sw}" stroke-opacity="${b.lock ? 1 : 0.88}"/>`
        + `<path ${vf} fill="none" stroke="${col}" stroke-width="${b.lock ? 2.6 : 1.6}" d="M${x0 - 0.8} ${y0 + L}V${y0 - 0.8}H${x0 + L}M${x1 - L} ${y0 - 0.8}H${x1 + 0.8}V${y0 + L}M${x1 + 0.8} ${y1 - L}V${y1 + 0.8}H${x1 - L}M${x0 + L} ${y1 + 0.8}H${x0 - 0.8}V${y1 - L}"/>`;
      const r = b.lock ? 2.6 : 1.7;
      cross += `<path ${vf} fill="none" stroke="${col}" stroke-width="1" d="M${b.cx - r} ${b.cy}H${b.cx + r}M${b.cx} ${b.cy - r}V${b.cy + r}"/>`
        + (b.lock ? `<circle ${vf} cx="${b.cx}" cy="${b.cy}" r="4.2" fill="none" stroke="${col}" stroke-width="1"/>` : '');
      const left = pct(x0, NXo), top = pct(y0, NYo);
      tabs += `<span class="bta-tab${b.lock ? ' is-lock' : ''}" style="left:${left}%;top:${top}%"><b>ID ${b.id}</b><i> · ${b.conf}</i></span>`;
      if (b.lock) tabs += `<span class="bta-xy" style="left:${left}%;top:${pct(y1, NYo)}%">X ${String(Math.round(b.cx * 15.7)).padStart(4, '0')}  Y ${String(Math.round(b.cy * 19.3)).padStart(4, '0')}  A 2,114px</span>`;
    });

    // frame furniture: corner brackets and a timecode ruler along the bottom edge
    const m = 3.6, c = 10;
    const frame = `M${m} ${m + c}V${m}H${m + c}M${BT_NX - m - c} ${m}H${BT_NX - m}V${m + c}M${BT_NX - m} ${BT_NY - m - c}V${BT_NY - m}H${BT_NX - m - c}M${m + c} ${BT_NY - m}H${m}V${BT_NY - m - c}`;
    let ruler = '';
    for (let x = 8; x <= BT_NX - 8; x += 3) ruler += `M${x} ${BT_NY}v${(x - 8) % 15 === 0 ? -3.6 : -1.6}`;

    return `<div class="bta">
      <svg class="bta-fx" viewBox="0 0 ${BT_NX} ${BT_NY}" preserveAspectRatio="none" focusable="false" shape-rendering="crispEdges">
        <defs>
          <filter id="${id}b" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="3.6"/></filter>
          <filter id="${id}g" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.4 -0.42"/></filter>
        </defs>
        <rect width="${BT_NX}" height="${BT_NY}" fill="${plate}"/>
        <g filter="url(#${id}b)" shape-rendering="geometricPrecision"><g transform="scale(${BT_K.toFixed(4)})">${glows}</g></g>
        <path d="${BT_PATHS.dim}" fill="${lit}" fill-opacity=".3"/>
        <path d="${BT_PATHS.bright}" fill="${lit}" fill-opacity=".92"/>
        <rect width="${BT_NX}" height="${BT_NY}" filter="url(#${id}g)" opacity=".16" style="mix-blend-mode:screen"/>
        <g shape-rendering="geometricPrecision">
          <g transform="scale(${BT_K.toFixed(4)})">
          <path ${vf} d="${links}" fill="none" stroke="${lit}" stroke-opacity=".5" stroke-width="1"/>
          ${boxes}${cross}
          </g>
          <path ${vf} d="${frame}" fill="none" stroke="${lit}" stroke-opacity=".8" stroke-width="1.5"/>
          <path ${vf} d="${ruler}" fill="none" stroke="${lit}" stroke-opacity=".5" stroke-width="1"/>
        </g>
      </svg>
      ${tabs}
      <span class="bta-hud bta-tl"><i class="bta-rec"></i>REC · FRAME 0412</span>
      <span class="bta-hud bta-tr">TRACKING 7 · 30 FPS</span>
      <span class="bta-hud bta-bl">THRESH 0.62 · MIN AREA 240</span>
      <span class="bta-hud bta-br">00:00:13:12</span>
    </div>`;
  },

  materials: [
    { name: 'Footage plate', css: 'background: {plate}; /* near-black frame; over it a blurred wash of brand colour, a two-tone 8x8 Bayer ordered dither in {lit} (30% and 92%), fine grain; the plate stays dark in light mode too */' },
    { name: 'Detection box', css: 'border: 1px solid {ink}; background: {boxFill}; /* 1px, never rounded, never glowing; 1.5px corner ticks extend 1px past each corner */' },
    { name: 'Label tab', css: 'background: {ink}; color: {canvas}; font: 700 9px/1.6 mono; padding: 1px 5px; letter-spacing: .04em; /* solid tab on a box\'s top-left corner: "ID 07 · 0.93" */' },
    { name: 'Locked target', css: 'border: 1.5px solid {lock}; background: {primary} at 8%; /* the only primary box in a view; its tab is filled {primary} with {onPrimary} text */' },
    { name: 'Centroid crosshair', css: 'background: linear-gradient({ink},{ink}) center / 100% 1px no-repeat, linear-gradient({ink},{ink}) center / 1px 100% no-repeat; /* 5px to 9px cross at a region\'s centre; locked target adds a ring */' },
    { name: 'Connector line', css: 'height: 1px; background: {boxSoft}; /* straight, 1px, between centroids; never curved or dashed */' },
    { name: 'Confidence bar', css: 'background: repeating-linear-gradient(90deg, {boxHair} 0 1px, transparent 1px 5px); /* hairline track with ticks; the fill is a 1px {ink} line ending in a square marker */' },
  ],

  rules: {
    do: [
      'Enclose things in 1px bounding boxes with 1.5px corner ticks and a solid mono label tab ("ID 07 · 0.93") on the top-left corner.',
      'Lock exactly one target in primary per view (box, tab and main action); every other box is white ink at full or 34% strength.',
      'Mark centres with crosshairs and join related boxes with straight 1px connector lines; show IDs, confidence and coordinates as mono readouts.',
      'Keep footage dark, grainy and dithered (ordered Bayer pattern, two tones) with a soft brand-colour wash behind it.',
    ],
    dont: [
      'Add neon glow, chamfered corners or scanline sweeps; that is Cyber HUD. Boxes are square and 1px.',
      'Round any box or fill a panel with colour; panels are hairline boxes on the near-black frame.',
      'Use accent for boxes, tabs or fills; it is the live dot and one headline word.',
      'Box more than the things that matter, or set boxes and labels in a serif or rounded face.',
    ],
  },
});
})();
