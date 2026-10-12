/* 31 Cybersigilism — thorned, silver, cold. References: the cybersigilism boards on Are.na (hundreds of
   0.3-1px ash-grey strokes that branch, barb and taper, mostly asymmetric, on skin or paper), fine-line
   tattoo flash, Dürer's swelling-tapering burin line, Kells-style density as ornament.

   Mechanism. Every stroke is a FILLED needle (a polygon round a curved centreline whose half-width swells
   and tapers to 0 at the tip), never a stroked tube and never blurred. A mirrored skeleton (a spine and four
   wing pairs) carries three generations of barbs; each child is 0.55x its parent's length and 0.6x its width,
   leaves at 25-55 degrees, and the two sides are seeded separately, so the symmetry is only in the bones.
   Widest stroke 1.6 units at an 800-unit viewBox; 300+ strokes. The seed is the brand name, so a brand's
   sigil never changes. Silver is the INK colour of a hairline (#B9BEC6 on obsidian, #2A2A2E on bone paper),
   not a reflective material: there is no chrome gradient anywhere. The client colour exists only as cold
   light (hue kept, chroma cut, lightness lifted): palette chip edges, focus, the progress head, one node.
   The card corner brackets and the header / divider flourish are fixed ornament in
   css/aesthetics/cybersigilism.css (data-URI custom properties). */
(function () {
let seq = 0;
const CS_CLAMP = (v, a, b) => Math.max(a, Math.min(b, v));

function csRand(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function csHash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
const csNum = v => (Math.round(v * 10) / 10).toString();

// A needle: quadratic centreline from p0, heading `ang` (radians), length L, bending by `bend` (a fraction of L,
// signed), sampled in `n` steps. Returns { pts, w, L, ang }.
function csNeedle(p0, ang, L, bend, w, n) {
  const p2 = [p0[0] + Math.cos(ang) * L, p0[1] + Math.sin(ang) * L];
  const nx = -Math.sin(ang), ny = Math.cos(ang);
  const c = [(p0[0] + p2[0]) / 2 + nx * bend * L, (p0[1] + p2[1]) / 2 + ny * bend * L];
  const pts = [];
  for (let j = 0; j <= n; j++) {
    const u = j / n, k = 1 - u;
    pts.push([k * k * p0[0] + 2 * k * u * c[0] + u * u * p2[0], k * k * p0[1] + 2 * k * u * c[1] + u * u * p2[1]]);
  }
  return { pts, w, L, n };
}
// half-width along the needle: a swell near the root, a needle tip at u = 1, a little body at the root
const csW = (w, u) => Math.max(w * Math.sin(Math.PI * Math.pow(Math.max(u, 0.02), 0.55)) * Math.pow(1 - u, 0.55), 0.45 * w * (1 - u) * (1 - u));
function csPoly(b) {
  const P = b.pts, m = P.length, L = [], R = [];
  for (let j = 0; j < m; j++) {
    const a = P[Math.max(0, j - 1)], c = P[Math.min(m - 1, j + 1)];
    let tx = c[0] - a[0], ty = c[1] - a[1];
    const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    const w = csW(b.w, j / (m - 1));
    L.push([P[j][0] - ty * w, P[j][1] + tx * w]);
    R.push([P[j][0] + ty * w, P[j][1] - tx * w]);
  }
  return 'M' + L.concat(R.reverse()).map(([x, y]) => csNum(x) + ' ' + csNum(y)).join('L') + 'Z';
}
// heading of a needle at fraction u
function csHeading(b, u) {
  const P = b.pts, i = Math.max(1, Math.min(P.length - 1, Math.round(u * (P.length - 1))));
  return [P[i], Math.atan2(P[i][1] - P[i - 1][1], P[i][0] - P[i - 1][0])];
}
// Three generations of barbs off `parent` (gen 1..3), seeded by rnd; pushes into out[gen].
const CS_KIDS = [0, 9, 3, 1];
const CS_STEPS = [16, 10, 6, 4];
function csBarbs(parent, gen, rnd, out, dirSign) {
  if (gen > 3) return;
  const k = CS_KIDS[gen];
  for (let i = 0; i < k; i++) {
    const u = 0.14 + 0.72 * (i + 0.25 + rnd() * 0.5) / k;
    const [p, h] = csHeading(parent, u);
    if (gen === 3 && rnd() < 0.45) continue;
    const side = (i % 2 ? 1 : -1) * (rnd() < 0.2 ? -1 : 1);
    const off = (25 + rnd() * 30) * Math.PI / 180;
    // children lean toward the parent's tip; about a quarter turn back toward the root (thorns, not twigs)
    const back = rnd() < 0.26;
    const ang = back ? h + Math.PI - side * (0.5 + rnd() * 0.4) : h + side * off;
    const L = parent.L * 0.55 * (back ? 0.45 : 1) * (1 - u * 0.45) * (0.7 + rnd() * 0.45);
    if (L < 2.5) continue;
    // claws: the child bends hard toward its side and hooks
    const kid = csNeedle(p, ang, L, side * (0.16 + rnd() * 0.24) * (dirSign || 1), parent.w * 0.6, CS_STEPS[gen]);
    out[gen].push(kid);
    csBarbs(kid, gen + 1, rnd, out, dirSign);
  }
}

// cold light: the client hue, chroma cut to 30-45%, lightness 80 (40 on paper)
function csCold(primary, deep) {
  const c = hexToHsl(primary);
  return hslToHex(c.h, CS_CLAMP(c.s * 0.45, 30, 45), deep ? 40 : 80);
}
// The small state sigil (Etched / Inked / Barbed): a lozenge blade glyph, 64 x 64.
function csStateGlyph(stage, ink) {
  const body = 'M32 6C36 20 41 26 50 32C41 38 36 44 32 58C28 44 23 38 14 32C23 26 28 20 32 6Z';
  const inner = 'M32 20C34 27 36 29 40 32C36 35 34 37 32 44C30 37 28 35 24 32C28 29 30 27 32 20Z';
  if (stage === 0) return `<path d="${body}" fill="none" stroke="${ink}" stroke-width=".9"/><path d="${inner}" fill="none" stroke="${ink}" stroke-width=".6"/>`;
  let s = `<path d="${body}" fill="${ink}"/><path d="${inner}" fill="#000" fill-opacity=".55"/>`;
  if (stage === 2) {
    const r = csRand(31);
    const spine = csNeedle([32, 6], -Math.PI / 2, 5, 0, 0.9, 6);
    const parts = [spine];
    [[50, 32, 0], [14, 32, Math.PI], [32, 58, Math.PI / 2], [42, 22, -0.8], [22, 22, -2.34], [42, 42, 0.8], [22, 42, 2.34]].forEach(([x, y, a], i) => {
      const nd = csNeedle([x, y], a, i < 3 ? 9 : 11, (r() - 0.5) * 0.5, i < 3 ? 1.3 : 1, 6);
      parts.push(nd);
      const out = [[], [], [], []];
      csBarbs(nd, 2, r, out, 1);
      out[2].concat(out[3]).forEach(o => parts.push(o));
    });
    s += `<path d="${parts.map(csPoly).join('')}" fill="${ink}"/>`;
  }
  return s;
}

// The sigil (board hero, deck cover) and, with a viewBox crop, the Material slide's 2.3x close-up of the barbs.
function csSigil(ctx, vb) {
  const t = ctx.t, d = t.isDark;
  const id = 'cs' + (++seq);
  const seed = csHash(String(ctx.brandName || 'sigil'));
  const rs = csRand(seed), rl = csRand(seed ^ 0x5bd1e995), rr = csRand(seed ^ 0x27d4eb2f);
  const W = 800, H = 560, cx = 452;
  const ink1 = d ? '#E3E6EA' : '#1E1E22', ink2 = d ? '#B9BEC6' : '#2A2A2E', ink3 = d ? '#868C95' : '#4A4F57';
  // the skeleton (right half), mirrored about x = cx: a long spine and four wing pairs that sweep out and bleed
  // past the top and right edges; reach is nudged by the brand seed (+-10%)
  const nudge = () => 0.9 + rs() * 0.2;
  const wingsR = [
    [cx + 2, 64, -1.05, 210, -0.46],
    [cx + 2, 128, -0.6, 300, -0.44],
    [cx + 2, 200, -0.18, 330, -0.4],
    [cx + 2, 270, 0.16, 280, 0.42],
    [cx + 2, 340, 0.52, 290, 0.44],
    [cx + 2, 420, 0.92, 210, 0.48],
  ].map(([x, y, a, L, b]) => csNeedle([x, y], a, L * nudge(), b, 1.6, CS_STEPS[0]));
  const mirror = nd => ({ pts: nd.pts.map(([x, y]) => [2 * cx - x, y]), w: nd.w, L: nd.L, n: nd.n });
  const wingsL = wingsR.map(mirror);
  const spine = csNeedle([cx, H - 30], -Math.PI / 2, H - 40, 0.015, 1.6, 24);
  // almond cells round the spine: C-blades that leave it and return (right side; mirrored below)
  const cellsR = [[150, 70, 0.42, 1.1], [228, 64, 0.5, 1.2], [300, 56, 0.42, 1]].map(([y, h, b, w]) => csNeedle([cx + 1, y], Math.PI / 2, h, -b, w, 14));
  const crown = [csNeedle([cx, 40], -Math.PI / 2 - 0.5, 90, -0.2, 1.2, 12), csNeedle([cx, 40], -Math.PI / 2 + 0.5, 90, 0.2, 1.2, 12)];
  // barbs, seeded per side
  const gens = [[], [], [], []];
  wingsR.forEach(w => csBarbs(w, 1, rr, gens, 1));
  wingsL.forEach(w => csBarbs(w, 1, rl, gens, -1));
  csBarbs(spine, 2, rs, gens, 1);
  crown.forEach((c, i) => csBarbs(c, 2, i ? rr : rl, gens, i ? 1 : -1));
  const cellsL = cellsR.map(mirror);
  cellsR.forEach(c => csBarbs(c, 3, rr, gens, 1));
  cellsL.forEach(c => csBarbs(c, 3, rl, gens, -1));
  const prim = [spine, ...crown, ...wingsR, ...wingsL, ...cellsR, ...cellsL];
  const count = prim.length + gens[1].length + gens[2].length + gens[3].length;
  // a handful of nodes where wings leave the spine, and the one cold node
  const nodes = wingsR.map(w => w.pts[0]).map(([x, y]) => `<circle cx="${csNum(x - 2)}" cy="${csNum(y)}" r="2.2" fill="none" stroke="${ink2}" stroke-width=".7"/>`).join('');
  const cold = csCold(t.accent, !d);
  return `<svg viewBox="${vb || `0 0 ${W} ${H}`}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" focusable="false" class="csa${vb ? ' csa-crop' : ''}" data-strokes="${count}">
    <defs><filter id="${id}s" x="-2%" y="-2%" width="104%" height="104%"><feGaussianBlur stdDeviation=".3"/></filter></defs>
    <g filter="url(#${id}s)">
      <path d="${gens[3].map(csPoly).join('')}" fill="${ink3}"/>
      <path d="${gens[2].map(csPoly).join('')}" fill="${ink3}"/>
      <path d="${gens[1].map(csPoly).join('')}" fill="${ink2}"/>
      <path d="${prim.map(csPoly).join('')}" fill="${ink1}"/>
    </g>
    ${nodes}
    <path d="M${cx} 232 ${cx + 5} 244 ${cx} 256 ${cx - 5} 244Z" fill="none" stroke="${ink1}" stroke-width=".8"/>
    <circle cx="${cx}" cy="244" r="1.6" fill="${cold}"/>
    <g fill="${ink3}" style="font-family:var(--ab-font-label,monospace);font-size:15px;letter-spacing:.14em">
      <text x="126" y="${H - 16}">N° 031 · ${count} LINES</text>
    </g>
  </svg>`;
}

registerAesthetic({
  key: 'cybersigilism', order: 31,
  name: 'Cybersigilism',
  descriptor: 'Thorned · Hairline · Cold',
  influences: 'Cybersigilism fine-line tattoos / Engraving / Illuminated borders',
  summary: 'Hundreds of tapering hairline thorns sprawl off the edge; the brand colour is only cold light.',
  motto: 'Sharp lines, kept apart.',
  kicker: 'Drawn in hairline',
  mode: 'dark',
  slideShape: 'minimal',
  labels: { material: 'Sigils', states: ['Etched', 'Inked', 'Barbed'], statesKind: 'swatch' },
  layout: { hero: 'split', palette: 'swatches', sections: 'asym', subcopy: true },
  type: { ui: 'body', label: 'mono', display: 1 },
  highlight: 'custom',
  highlightNote: 'The last word keeps the headline face and colour; one sprig of hand-drawn hairline thorns (filled, tapering needles) grows out to the right of it, a clear zone of about a quarter em past the last letter and inside its own line, never through the letters. No glow, no gradient, no fill.',
  ctaFill: 'ink',
  deck: {
    coverDisplay: 0.8,
    coverBand: false,
    // Material slide: a 2.3x crop of the barbs (the right wing near the spine), cut from the same seeded sigil
    materialArt: ctx => csSigil(ctx, '298 114 348 244'),
    principles: [
      ['Hundreds of needles', 'Every line tapers to nothing; density is the ornament.'],
      ['Silver is an ink', 'Grey hairline on obsidian or bone paper, never chrome.'],
      ['Ornament keeps its distance', 'A clear zone separates every line from text.'],
    ],
    do: [
      'Draw strokes that taper to a needle.',
      'Seed each side of the sigil separately.',
      'Frame content with corner-bracket thorns.',
    ],
    dont: [
      'Use chrome gradients or glow.',
      'Set headlines in a stock fat blackletter.',
      'Run ornament through text.',
    ],
  },

  roles: {
    canvas: {
      use: 'Obsidian #050507 (dark) or bone paper #EEEBE4 (light, the tattoo-flash sheet): 90% of pixels are this or hairline',
      never: 'Text, a lighter card fill beyond 70% panel tint, neon purple or cyan washes',
      coverage: '70–80%',
    },
    ink: {
      use: 'Text and every hairline: silver #B9BEC6 on obsidian, graphite #2A2A2E on paper. Thorns are filled needles that taper to 0, widest 1.6px',
      never: 'A chrome or metallic gradient, a glow, thick uniform strokes',
      coverage: '15–20%',
    },
    primary: {
      use: 'Cold light only: the client hue with chroma cut to 30–45% and lightness lifted: palette chip edges, focus rings, the progress head',
      never: 'A fill, the main action, body text, a saturated neon',
      coverage: '≈3%',
    },
    secondary: {
      use: 'Grey-wash tint at very low chroma: panel base wash, the progress track',
      never: 'The main action, borders, text',
      coverage: '≈3%',
    },
    accent: {
      use: 'One cold node per view: the sigil\'s seed node, the selected tab\'s node',
      never: 'Buttons, fills, borders, a glow behind text',
      coverage: '≤1%',
    },
  },

  canvas(b) {
    if (b.isDark) { const h = b.hexToHsl(b.canvas); return b.hslToHex(h.h, Math.min(h.s, 12), 2.4); }
    return '#EEEBE4';
  },

  tokens(t) {
    const d = t.isDark;
    const cold = csCold(t.primary, !d);
    const l1 = d ? '#E3E6EA' : '#1E1E22', l2 = d ? '#B9BEC6' : '#2A2A2E';
    return {
      '--ab-type-pick-w': 400,
      '--cs-l1': l1, '--cs-l2': l2,
      '--cs-line': t.alpha(l2, d ? 0.55 : 0.7),
      '--cs-faint': t.alpha(l2, d ? 0.22 : 0.28),
      '--cs-ghost': t.alpha(l2, d ? 0.08 : 0.1),
      '--cs-cold': cold,
      '--cs-cold-p': cold, '--cs-cold-s': csCold(t.secondary, !d), '--cs-cold-a': csCold(t.accent, !d),
      '--cs-cold-p-g': t.alpha(cold, 0.55), '--cs-cold-s-g': t.alpha(csCold(t.secondary, !d), 0.55), '--cs-cold-a-g': t.alpha(csCold(t.accent, !d), 0.55),
      '--cs-cold-p-w': t.alpha(cold, 0.3), '--cs-cold-s-w': t.alpha(csCold(t.secondary, !d), 0.3), '--cs-cold-a-w': t.alpha(csCold(t.accent, !d), 0.3),
      '--cs-chip-ground': d ? '#050507' : '#E4E0D7',
      '--cs-panel': d ? t.alpha('#0A0B0F', 0.7) : t.alpha('#F6F4EF', 0.7),
      '--cs-wash': t.mix(t.secondary, t.canvas, d ? 0.07 : 0.06),
      '--cs-btn': d ? '#000000' : '#18181B',
      '--cs-btn-ink': d ? '#E3E6EA' : '#EEEBE4',
      '--cs-btn-line': d ? '#B9BEC6' : '#18181B',
      // the same values under --ab-* names, so the AI brief's {l1} {cold} {glow} {panel} {faint} placeholders resolve
      '--ab-l1': l1, '--ab-l2': l2, '--ab-cold': cold, '--ab-glow': t.alpha(cold, d ? 0.42 : 0.5), '--ab-panel': d ? t.alpha('#0A0B0F', 0.7) : t.alpha('#F6F4EF', 0.7),
      '--ab-faint': t.alpha(l2, d ? 0.22 : 0.28),
    };
  },

  // The headline as text with hand-drawn hairline thorns growing out of the last word (aria-label carries the
  // plain text; the framework wraps this in the h2).
  headline(ctx, text) {
    const e = escapeHtml;
    const words = String(text || '').split(/\s+/).filter(Boolean);
    if (!words.length) return '';
    const last = words.pop();
    const r = csRand(csHash(last + '|thorn'));
    // "Ornament keeps its distance": one thorn sprig grows out to the RIGHT of the word, in a 60 x 40 box that
    // starts a clear zone (~0.22em, 16-24px at display size) past the last glyph and stays inside the word's own
    // line box, so it never touches a letter, the line above or the copy below. The box clips (overflow hidden),
    // so a barb that turns back toward the root stops at the clear-zone edge.
    const parts = [];
    const grow = (x, y, a, L, bend) => { const nd = csNeedle([x, y], a, L, bend, 0.9, 10); parts.push(nd); const out = [[], [], [], []]; csBarbs(nd, 2, r, out, 1); out[2].concat(out[3]).forEach(o => parts.push(o)); };
    grow(6, 34, -0.62, 52, -0.16 + (r() - 0.5) * 0.12);
    grow(10, 30, 0.08, 30, 0.12 + (r() - 0.5) * 0.12);
    const thorns = `<svg class="cs-thorns" viewBox="0 0 60 40" aria-hidden="true" focusable="false"><path d="${parts.map(csPoly).join('')}"/></svg>`;
    return `${words.length ? e(words.join(' ')) + ' ' : ''}<span class="ab-hl">${e(last)}${thorns}</span>`;
  },

  art(ctx) { return csSigil(ctx, ''); },

  // The states: one small sigil drawn three ways (outline, inked, barbed) as real SVG, not three orbs.
  states(ctx) {
    const ink = ctx.t.isDark ? '#B9BEC6' : '#2A2A2E';
    return [0, 1, 2].map(i => `<div class="ab-state" data-s="${i}"><svg class="cs-st" viewBox="0 0 64 64" aria-hidden="true" focusable="false">${csStateGlyph(i, ink)}</svg><span class="ab-state-name">${escapeHtml((ctx.labels || [])[i] || '')}</span></div>`).join('');
  },

  materials: [
    { name: 'Needle', css: 'fill: {l2}; /* a FILLED polygon round a curved centreline that swells near the root and tapers to 0 at the tip; widest 1.6px; never a stroked tube, never blurred beyond 0.4px */' },
    { name: 'Barb generations', css: '/* each child 0.55x its parent\'s length and 0.6x its width, leaving at 25-55 degrees; three generations, 300+ strokes; the skeleton is mirrored, the barbs are seeded per side */' },
    { name: 'Silver ink', css: 'color: {l2}; /* #B9BEC6 on obsidian, #2A2A2E on bone paper; a colour of line, never a gradient or a reflective fill */' },
    { name: 'Cold light', css: 'box-shadow: inset 0 0 0 1px {cold}; /* the client hue with chroma cut to 30-45%: chip edges, focus rings, the progress head; never a glow behind text */' },
    { name: 'Thorn frame (card)', css: 'background: {panel}; border-image: url(corner brackets) 24 / 24px; /* four corner brackets of branching hairlines instead of an outline; ornament keeps a 16-24px clear zone from text */' },
    { name: 'Main action', css: 'background: #000; color: {l1}; border: 1px solid #B9BEC6; /* one 10px chamfered corner (bottom right) and a 0.75px thorn growing out of the top-right corner; hover lengthens the thorn; no gradient */' },
  ],

  rules: {
    do: [
      'Draw the sigil as hundreds of filled needles that taper to nothing, in three generations of barbs off a mirrored skeleton.',
      'Let the sigil sprawl off the edge of the frame, offset from the text; keep a 16–24px clear zone around any text.',
      'Treat silver as an ink colour: grey hairline on obsidian, graphite on bone paper.',
      'Set headlines in a thin, tight grotesk and let hairline thorns grow from the one sigil word.',
    ],
    dont: [
      'Use chrome gradients, glow filters or round-ended tubes.',
      'Set the headline in a stock fat blackletter.',
      'Centre everything; the energy is asymmetric sprawl.',
      'Use neon purple or cyan, or let more than 10% of pixels carry hue.',
    ],
  },
});
})();
