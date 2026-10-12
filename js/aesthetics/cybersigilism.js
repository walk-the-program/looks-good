/* 31 Cybersigilism — thorned, silver, cold. References: Aingelblood-lineage cybersigilism
   linework (tapered, mirrored, architectural; CO:CREATE, 032c, Underblast), blackwork and
   metal logos, Chrome Hearts' silver. No studio-grade UI system exists in this style, so
   the UI translation is a proposal: ornament is the content, legibility is protected by a
   clear zone (16-24px) and ornament never touches text.

   Mechanism. Every stroke is a FILLED, curved blade (width 0 at the needle tip), not a stroked
   path (stroked paths read as wire). The crest is an emblem on a vertical spine: three wings a side
   sweep up and out and curl back, secondaries and barbs hook, C-blades close almond cells round the
   spine, two thin lances cross it, chrome shading and 4-point glints (see csBlade below). The right
   half is mirrored with <use transform="matrix(-1 0 0 1 ..)">, so the symmetry is exact; the seed
   (brand name) only nudges each blade's reach by up to 8%, so a brand's sigil never changes. Silver is fixed (a 4-stop ramp; graphite in
   light mode); the client colour exists only as cold light (hue kept, chroma cut to 30-45%,
   lightness 75-85%) in the glow, the lit states and the headline word's glow. The card
   corner brackets, the header / divider / footer flourish and the thorn wreath of the state
   discs are fixed silver ornament: they live in css/aesthetics/cybersigilism.css once, as
   data-URI custom properties, not in every board root. */
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

// The sigil recipe (after the Aingelblood / DanyKim / Sadan lineage): every stroke is a CURVED BLADE, a
// filled polygon round a cubic centreline that bends once (an S: the two control points sit on opposite
// sides of the chord, about 0.35 of its length off it) and whose last 15% hooks back 50-70 degrees. Its
// half-width swells and tapers: w(u) = wMax * sin(pi * u^0.7) * (1 - u)^0.4, peaking near u = 0.3 and
// coming to a needle tip (primaries wMax 4-6, secondaries 2-3, barbs 1-1.5). Blades are rendered as
// chrome: a dark base, a mid-tone at 0.7 width and a bright core at 0.38 width, never a flat grey line.
const CS_STEPS = 18, CS_HOOK = 0.2;   // the hook takes the last 20% (15% reads as a straight tip at board size)
// centreline: the cubic over u in [0, 0.85], then a hook that turns the heading by `hook` radians
function csCentre(p0, c1, c2, p3, hook) {
  const B = (u, i) => { const k = 1 - u; return k * k * k * p0[i] + 3 * k * k * u * c1[i] + 3 * k * u * u * c2[i] + u * u * u * p3[i]; };
  const n = 12, pts = [];
  for (let j = 0; j <= n; j++) { const u = (1 - CS_HOOK) * j / n; pts.push([B(u, 0), B(u, 1)]); }
  let L = 0;
  for (let j = 1; j < pts.length; j++) L += Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]);
  const hs = CS_STEPS - n, hl = L * CS_HOOK / (1 - CS_HOOK);
  let [x, y] = pts[n];
  let a = Math.atan2(y - pts[n - 1][1], x - pts[n - 1][0]);
  for (let j = 1; j <= hs; j++) { a += hook / hs; x += Math.cos(a) * hl / hs; y += Math.sin(a) * hl / hs; pts.push([x, y]); }
  return pts;
}
// the S-bent blade from p0 to p3 (side +1/-1 picks which way the S starts)
function csBlade(out, p0, p3, o) {
  const dx = p3[0] - p0[0], dy = p3[1] - p0[1], L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L, ny = dx / L, k = (o.bend == null ? 0.35 : o.bend) * L * (o.side || 1);
  const c1 = [p0[0] + dx / 3 + nx * k, p0[1] + dy / 3 + ny * k];
  const c2 = [p0[0] + 2 * dx / 3 - nx * k * (o.s2 == null ? 1 : o.s2), p0[1] + 2 * dy / 3 - ny * k * (o.s2 == null ? 1 : o.s2)];
  const pts = csCentre(p0, c1, c2, p3, o.hook || 0);
  out.push({ pts, wMax: o.w, root: o.root || 0, prof: o.prof || 'blade' });
  return pts;
}
// point at fraction u of a centreline (by index)
const csAt = (pts, u) => pts[Math.max(0, Math.min(pts.length - 1, Math.round(u * (pts.length - 1))))];
function csWidth(b, u) {
  if (b.prof === 'cell') return b.wMax * Math.pow(Math.sin(Math.PI * u), 0.8);
  if (b.prof === 'spine') return b.wMax * Math.pow(Math.sin(Math.PI * u), 0.45);
  if (b.prof === 'lance') return b.wMax * (1 - Math.abs(2 * u - 1));
  const w = b.wMax * Math.sin(Math.PI * Math.pow(u, 0.7)) * Math.pow(1 - u, 0.4);
  return Math.max(w, b.root * b.wMax * (1 - u) * (1 - u));
}
// one closed polygon per blade (left offsets forward, right offsets back), at `scale` of the full width
function csPoly(b, scale) {
  const P = b.pts, m = P.length, L = [], R = [];
  const cum = [0];
  for (let j = 1; j < m; j++) cum.push(cum[j - 1] + Math.hypot(P[j][0] - P[j - 1][0], P[j][1] - P[j - 1][1]));
  const tot = cum[m - 1] || 1;
  for (let j = 0; j < m; j++) {
    const a = P[Math.max(0, j - 1)], c = P[Math.min(m - 1, j + 1)];
    let tx = c[0] - a[0], ty = c[1] - a[1];
    const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    const w = csWidth(b, cum[j] / tot) * scale;
    L.push([P[j][0] - ty * w, P[j][1] + tx * w]);
    R.push([P[j][0] + ty * w, P[j][1] - tx * w]);
  }
  return L.concat(R.reverse());
}
// a 4-point star glint (long rays r, waist q)
function csStar(x, y, r, q, fill) {
  return `<path d="M${csNum(x)} ${csNum(y - r)}L${csNum(x + q)} ${csNum(y - q)}L${csNum(x + r)} ${csNum(y)}L${csNum(x + q)} ${csNum(y + q)}L${csNum(x)} ${csNum(y + r)}L${csNum(x - q)} ${csNum(y + q)}L${csNum(x - r)} ${csNum(y)}L${csNum(x - q)} ${csNum(y - q)}Z" fill="${fill}"/>`;
}
const csNum = v => (Math.round(v * 10) / 10).toString();
function csPath(polys) {
  return polys.map(pl => 'M' + pl.map(([x, y]) => csNum(x) + ' ' + csNum(y)).join('L') + 'Z').join('');
}

// cold light: the client hue, chroma cut to 30-45%, lightness 75-85%
function csCold(primary, deep) {
  const c = hexToHsl(primary);
  return hslToHex(c.h, CS_CLAMP(c.s * 0.45, 30, 45), deep ? 40 : 80);
}

registerAesthetic({
  key: 'cybersigilism', order: 31,
  name: 'Cybersigilism',
  descriptor: 'Thorned · Silver · Cold',
  influences: 'Cybersigilism tattoos / Blackwork / Cyber goth',
  summary: 'Hairline silver thorns branch and mirror around calm text; the brand colour is only cold light.',
  motto: 'Sharp lines, kept apart.',
  kicker: 'Etched in silver',
  mode: 'dark',
  slideShape: 'minimal',
  labels: { material: 'Sigils', states: ['Etched', 'Lit', 'Bound'], statesKind: 'swatch' },
  layout: { hero: 'centered', palette: 'swatches', sections: 'two-col', subcopy: true },
  type: { ui: 'body', label: 'mono', display: 0.96 },
  highlight: 'custom',
  highlightNote: 'The last word keeps the headline face and is set in the silver ramp (a vertical #fff to #b9bec6 to #e9ebee gradient clipped to the text; graphite in light mode) with a soft glow of the accent as cold light (chroma cut, lightness lifted) around it; a tapered hooked thorn swash grows from its first and last letters and the 1px tapered line beneath is silver too. The accent is only ever that cold glow, never a solid fill on the word.',
  ctaFill: 'ink',

  roles: {
    canvas: {
      use: 'Obsidian #050507 (dark) or cold void #E7ECF2 (light): 90% of pixels are this or silver. Silver is a fixed ramp, not a client colour: #F4F7FA, #9BA4B0, #5B6572 with white specular points (graphite lines in light mode)',
      never: 'Text, a lighter card fill beyond 70% panel tint, neon purple or cyan washes',
      coverage: '70–80%',
    },
    ink: {
      use: 'Silver-white text and all hairlines, the filled main action (obsidian label on the silver gradient) and the thorn linework itself',
      never: 'Thick strokes: decorative lines stay 0.75–1.25px, frames 2px at most',
      coverage: '15–20%',
    },
    primary: {
      use: 'Cold light only: the client hue with chroma cut to 30–45% and lightness 75–85%: the glow behind thorns, focus rings, the lit state, the progress glow',
      never: 'A fill, the main action, body text, a saturated neon',
      coverage: '≈5–8%',
    },
    secondary: {
      use: 'Grey-wash and shading tint at very low chroma: panel base wash, stipple shading, the progress track',
      never: 'The main action, borders, text',
      coverage: '≈5%',
    },
    accent: {
      use: 'One sharp highlight per view: a node, the selected tab\'s lance, the progress head, and the soft glow behind the headline\'s last word (the word itself is silver)',
      never: 'Buttons, fills, borders, more than one spark per view',
      coverage: '≤2%',
    },
  },

  canvas(b) {
    if (b.isDark) { const h = b.hexToHsl(b.canvas); return b.hslToHex(h.h, Math.min(h.s, 12), 2.4); }
    return b.mix('#E7ECF2', b.canvas, 0.86);
  },

  tokens(t) {
    const d = t.isDark;
    const hf = typeof state !== 'undefined' && state && state.headingFont;
    const ws = String((hf && hf.weights) || '400').split(';').map(Number).filter(Boolean);
    const hw = ws.length ? Math.max(...ws.filter(x => x <= 700).concat([Math.min(...ws)])) : 400;
    const cold = csCold(t.primary, !d);   // light mode: the same cold light, read as a deep tint on cold void
    const l1 = d ? '#F4F7FA' : '#1B2027', l2 = d ? '#9BA4B0' : '#4A5461', l3 = d ? '#5B6572' : '#7E8896';
    return {
      '--ab-type-pick-w': hw,
      '--cs-hw': hw,
      '--cs-l1': l1, '--cs-l2': l2, '--cs-l3': l3,
      '--cs-line': t.alpha(l2, d ? 0.6 : 0.7),
      '--cs-faint': t.alpha(l2, d ? 0.24 : 0.3),
      '--cs-ghost': t.alpha(l2, d ? 0.09 : 0.12),
      '--cs-cold': cold,
      '--cs-hl-glow': t.alpha(csCold(t.accent, !d), d ? 0.45 : 0.36),   // cold light, never warm candle glow
      '--cs-cold-p': cold, '--cs-cold-s': csCold(t.secondary, !d), '--cs-cold-a': csCold(t.accent, !d),
      '--cs-cold-p-g': t.alpha(cold, 0.55), '--cs-cold-s-g': t.alpha(csCold(t.secondary, !d), 0.55), '--cs-cold-a-g': t.alpha(csCold(t.accent, !d), 0.55),
      '--cs-cold-p-w': t.alpha(cold, 0.3), '--cs-cold-s-w': t.alpha(csCold(t.secondary, !d), 0.3), '--cs-cold-a-w': t.alpha(csCold(t.accent, !d), 0.3),
      '--cs-chip-ground': d ? '#050507' : '#F4F7FA',
      '--cs-hl-fill': d ? 'linear-gradient(180deg, #fff, #b9bec6 55%, #e9ebee)' : 'linear-gradient(180deg, #12161B, #4A5461 55%, #1B2027)',
      '--cs-glow': t.alpha(cold, d ? 0.42 : 0.5),
      '--cs-panel': d ? t.alpha('#0A0B0F', 0.7) : t.alpha('#FFFFFF', 0.55),
      '--cs-wash': t.mix(t.secondary, t.canvas, d ? 0.09 : 0.1),
      '--cs-silver': d ? 'linear-gradient(135deg, #F4F7FA 0%, #9BA4B0 38%, #EAF2FA 58%, #6C7684 100%)' : 'linear-gradient(135deg, #3A424D 0%, #1B2027 40%, #4A5461 62%, #12161B 100%)',
      '--cs-on-silver': d ? '#050507' : '#E7ECF2',
      // the same values under --ab-* names, so the AI brief's {l1} {silver} {cold} {glow} {panel} {faint} {onSilver} placeholders resolve
      '--ab-l1': l1, '--ab-silver': d ? 'linear-gradient(135deg, #F4F7FA 0%, #9BA4B0 38%, #EAF2FA 58%, #6C7684 100%)' : 'linear-gradient(135deg, #3A424D 0%, #1B2027 40%, #4A5461 62%, #12161B 100%)',
      '--ab-cold': cold, '--ab-glow': t.alpha(cold, d ? 0.42 : 0.5), '--ab-panel': d ? t.alpha('#0A0B0F', 0.7) : t.alpha('#FFFFFF', 0.55),
      '--ab-on-silver': d ? '#050507' : '#E7ECF2', '--ab-faint': t.alpha(l2, d ? 0.24 : 0.3),
    };
  },

  art(ctx) {
    const t = ctx.t, d = t.isDark, e = escapeHtml;
    const id = 'cs' + (++seq);
    const rnd = csRand(csHash(String(ctx.brandName || 'sigil')));
    const W = 900, H = 360, cx = 450, cy = 180;
    const l1 = d ? '#F4F7FA' : '#1B2027', l2 = d ? '#9BA4B0' : '#4A5461', l3 = d ? '#5B6572' : '#7E8896';
    const cold = csCold(t.primary, !d);
    // brand-seeded nudge (+-8%) on every blade's reach, so a brand's crest is its own and never changes
    const nudge = () => 0.92 + rnd() * 0.16;
    const to = (p, dx, dy) => { const k = nudge(); return [p[0] + dx * k, p[1] + dy * k]; };
    // RIGHT half (mirrored exactly with <use>): wings sweep up and out from the spine and curl back toward it,
    // secondaries branch off mid-wing and hook, barbs are short needles, two C-blades close almond cells
    const half = [];
    const x0 = cx + 2;
    const w1 = csBlade(half, [x0, 108], to([x0, 108], 150, -88), { w: 6, root: 0.5, side: 1, hook: -1.35 });
    const w2 = csBlade(half, [x0, 180], to([x0, 180], 262, -40), { w: 6.6, root: 0.5, side: 1, hook: -1.3 });
    const w3 = csBlade(half, [x0, 252], to([x0, 252], 216, 70), { w: 6, root: 0.5, side: -1, hook: 1.35 });
    const j1 = csAt(w1, 0.42), j2 = csAt(w2, 0.42), j3 = csAt(w3, 0.45);
    csBlade(half, j1, to(j1, 92, 6), { w: 3.2, side: -1, hook: -1.3 });
    csBlade(half, j2, to(j2, 70, 60), { w: 3, side: 1, hook: 1.35 });
    csBlade(half, j3, to(j3, 104, -12), { w: 3.2, side: 1, hook: -1.3 });
    // bridges: blades that leave one wing and land on the next, closing teardrop cells between the wings
    const bridge = (pa, pb, side, w) => {
      const pts = csCentre(pa, [pa[0] + (pb[0] - pa[0]) * 0.2 + side * 26, pa[1] + (pb[1] - pa[1]) * 0.3], [pb[0] - side * 18, pb[1] - (pb[1] - pa[1]) * 0.35], pb, 0);
      half.push({ pts, wMax: w, prof: 'cell' });
    };
    bridge(csAt(w2, 0.22), csAt(w1, 0.62), 1, 2.2);
    bridge(csAt(w2, 0.22), csAt(w3, 0.6), 1, 2.2);
    // barbs: short hooked needles off the wings, and a crown and tail of needles on the spine
    csBlade(half, csAt(w2, 0.7), to(csAt(w2, 0.7), 18, -36), { w: 1.8, side: 1, hook: 0.8 });
    csBlade(half, csAt(w3, 0.72), to(csAt(w3, 0.72), 30, 26), { w: 1.6, side: -1, hook: -0.8 });
    csBlade(half, csAt(w1, 0.75), to(csAt(w1, 0.75), 34, 8), { w: 1.5, side: 1, hook: 0.7 });
    csBlade(half, [x0, 58], to([x0, 58], 40, -46), { w: 2, side: -1, hook: 0.5 });
    csBlade(half, [x0, 34], to([x0, 34], 16, -28), { w: 1.3, side: 1, hook: 0.3 });
    csBlade(half, [x0, 82], to([x0, 82], 70, -30), { w: 1.6, side: -1, hook: 0.9 });
    csBlade(half, [x0, 300], to([x0, 300], 62, 44), { w: 2.8, side: 1, hook: -1.3 });
    csBlade(half, [x0, 326], to([x0, 326], 20, 30), { w: 1.3, side: -1, hook: 0.35 });
    // cells: C-blades leave the spine and return to it, enclosing a pointed almond void either side
    const cell = (ya, yb, bulge, w) => {
      const pts = [], h = yb - ya;
      const p0 = [cx, ya], p3 = [cx, yb], c1 = [cx + bulge, ya + h * 0.18], c2 = [cx + bulge, yb - h * 0.18];
      for (let j = 0; j <= CS_STEPS; j++) {
        const u = j / CS_STEPS, k = 1 - u;
        pts.push([k * k * k * p0[0] + 3 * k * k * u * c1[0] + 3 * k * u * u * c2[0] + u * u * u * p3[0], k * k * k * p0[1] + 3 * k * k * u * c1[1] + 3 * k * u * u * c2[1] + u * u * u * p3[1]]);
      }
      half.push({ pts, wMax: w, prof: 'cell' });
    };
    cell(106, 178, 30 * nudge(), 3);     // the mandorla pair round the centre
    cell(182, 254, 30 * nudge(), 3);
    cell(126, 160, 13, 1.6);             // inner almonds
    cell(200, 234, 13, 1.6);
    cell(56, 104, 18, 2);                // crown and tail cells
    cell(256, 304, 18, 2);

    // whole (unmirrored, already symmetric) pieces: the spine and two thin lances
    const whole = [];
    const spine = []; for (let j = 0; j <= 24; j++) spine.push([cx, 8 + 344 * j / 24]);
    whole.push({ pts: spine, wMax: 5, prof: 'spine' });
    [150, 210].forEach(y => { const ln = []; for (let j = 0; j <= 8; j++) ln.push([cx - 318 + 636 * j / 8, y]); whole.push({ pts: ln, wMax: 0.8, prof: 'lance' }); });

    const pathOf = (list, scale) => csPath(list.map(b => csPoly(b, scale)));
    const chrome = (list) => `<path d="${pathOf(list, 1)}" fill="${l3}"/><path d="${pathOf(list, 0.7)}" fill="${l2}"/><path d="${pathOf(list, 0.38)}" fill="${l1}" filter="url(#${id}s)"/>`;
    // lozenges on the spine (120, 240) and the central one with the initial
    const loz = (y, rx, ry) => `<path d="M${cx} ${y - ry} ${cx + rx} ${y} ${cx} ${y + ry} ${cx - rx} ${y}Z" fill="${d ? '#050507' : '#E7ECF2'}" stroke="${l1}" stroke-width="1"/><path d="M${cx} ${y - ry * 0.55} ${cx + rx * 0.55} ${y} ${cx} ${y + ry * 0.55} ${cx - rx * 0.55} ${y}Z" fill="${l2}"/>`;
    // specular glints at three junctions (not mirrored: a highlight is never symmetric), one in cold light
    const glints = csStar(j1[0], j1[1], 7, 1.3, l1) + csStar(2 * cx - j3[0], j3[1], 7, 1.3, l1) + csStar(cx, 106, 8, 1.4, cold);
    const initial = e(ctx.initial);
    return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" focusable="false" class="csa">
      <defs>
        <radialGradient id="${id}w" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${cold}" stop-opacity="${d ? 0.2 : 0.22}"/><stop offset="1" stop-color="${cold}" stop-opacity="0"/></radialGradient>
        <filter id="${id}f" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur in="SourceAlpha" stdDeviation="2.6" result="b"/><feFlood flood-color="${cold}" flood-opacity="${d ? 0.5 : 0.4}"/><feComposite in2="b" operator="in" result="c"/><feMerge><feMergeNode in="c"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="${id}s" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation=".4"/></filter>
        <g id="${id}h">${chrome(half)}</g>
      </defs>
      <ellipse cx="${cx}" cy="${cy}" rx="300" ry="160" fill="url(#${id}w)"/>
      <g filter="url(#${id}f)">
        <use href="#${id}h"/>
        <use href="#${id}h" transform="matrix(-1 0 0 1 ${cx * 2} 0)"/>
        ${chrome(whole)}
      </g>
      ${loz(120, 9, 15)}${loz(240, 9, 15)}
      <path d="M${cx} 154 ${cx + 17} ${cy} ${cx} 206 ${cx - 17} ${cy}Z" fill="${d ? '#050507' : '#E7ECF2'}" stroke="${l1}" stroke-width="1"/>
      <path d="M${cx} 161 ${cx + 11} ${cy} ${cx} 199 ${cx - 11} ${cy}Z" fill="none" stroke="${l2}" stroke-width=".6"/>
      <text x="${cx}" y="${cy + 5.5}" text-anchor="middle" fill="none" stroke="${l1}" stroke-width=".7" style="font-family:var(--ab-font-h);font-size:16px">${initial}</text>
      ${glints}
      <circle cx="${cx}" cy="${cy + 40}" r="1.7" fill="${t.accent}"/>
      <g fill="${l2}" fill-opacity=".85" style="font-family:var(--ab-font-label,monospace);font-size:8.5px;letter-spacing:.16em">
        <text x="44" y="30">SIGIL N° 031</text>
        <text x="${W - 44}" y="30" text-anchor="end">MIRRORED ABOUT X = ${cx}</text>
      </g>
    </svg>`;
  },
  materials: [
    { name: 'Curved blade', css: 'fill: {l1}; /* a FILLED polygon round a cubic that bends once in an S and hooks back 50-70 degrees at the tip; it swells to its widest a third of the way out and tapers to a needle, never a stroked path; rendered as chrome: dark base, mid-tone, bright core; 4-point star glints at junctions; fixed seed per brand */' },
    { name: 'Silver ramp', css: 'background: {silver}; /* #F4F7FA -> #9BA4B0 -> #EAF2FA -> #6C7684 (graphite #1B2027 -> #4A5461 in light mode); used as a thin gradient on linework and as the main action fill, never as a large field */' },
    { name: 'Cold light', css: 'box-shadow: 0 0 6px {glow}; color: {cold}; /* the client hue with chroma cut to 30-45% and lightness 75-85%: a 4-6px glow behind thorns, focus rings, lit states */' },
    { name: 'Thorn frame (card)', css: 'background: {panel}; border-image: url(corner brackets) 24 / 24px; /* four corner brackets of branching hairlines (24px) instead of an outline; ornament keeps a 16-24px clear zone from text */' },
    { name: 'Main action', css: 'background: {silver}; color: {onSilver}; clip-path: polygon(6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px), 0 6px); /* 6px chamfer, mono caps label; hover grows a short thorn from one corner */' },
    { name: 'Thorn wreath', css: 'mask: url(wreath) center / contain; background: conic-gradient({cold} 0 66%, {faint} 66% 100%); /* 24 spikes in two sizes; lit spikes carry the cold light: the radial progress and the state discs */' },
    { name: 'Hairline', css: 'border-color: {line}; /* 1px silver at 60%; a node every 5th row, a tapering centre-out divider with a five-segment flourish */' },
  ],

  rules: {
    do: [
      'Draw the crest as curved, swelling, hooked blades round a vertical spine, closing almond cells, rendered as chrome and mirrored exactly; keep UI ornament hairline (0.75–1.25px).',
      'Keep a 16–24px clear zone between ornament and any text, and build the crest from one seeded recursion so it never changes.',
      'Keep silver fixed and let the client colour be only cold light: glow, focus, lit states, one accent node per view.',
      'Frame content with corner-bracket thorns instead of full outlines, and keep running text in a clean grotesk or mono.',
    ],
    dont: [
      'Run ornament through or behind text, set body copy in blackletter, or draw thick uniform tattoo-flash strokes.',
      'Use neon purple or cyan glows, fill panels with saturated colour, or let more than 10% of pixels carry hue.',
      'Auto-mirror chunky blobs, or leave branches that do not connect; every branch grows from a node.',
      'Borrow named cultural patterns, or copy any Chrome Hearts or artist artwork.',
    ],
  },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    principles: [
      ['Curved blades, mirrored', 'Swelling, hooked chrome blades build one symmetric emblem.'],
      ['Silver is fixed', 'Client colour appears only as cold light and glow.'],
      ['Ornament keeps its distance', 'A clear zone separates every line from text.'],
    ],
    do: [
      'Draw blades that swell, curve and hook.',
      'Keep decorative lines between 0.75 and 1.25px.',
      'Frame content with corner-bracket thorns.',
    ],
    dont: [
      'Run ornament through or behind text.',
      'Use thick tattoo-flash strokes.',
      'Add neon purple or cyan glow.',
    ],
  },
});
})();
