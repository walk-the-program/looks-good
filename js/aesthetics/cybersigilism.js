/* 31 Cybersigilism — thorned, silver, cold. References: Aingelblood-lineage cybersigilism
   linework (tapered, mirrored, architectural; CO:CREATE, 032c, Underblast), blackwork and
   metal logos, Chrome Hearts' silver. No studio-grade UI system exists in this style, so
   the UI translation is a proposal: ornament is the content, legibility is protected by a
   clear zone (16-24px) and ornament never touches text.

   Mechanism. Every thorn is a FILLED, TAPERED polygon (width 0 at the tip), not a stroked
   path (stroked paths read as wire). A seeded L-system-style recursion (csThorn) grows a
   branch along an S-curve (its heading follows sin(2*pi*s)), spawns children at fixed
   positions along it at 28-38 degrees to the local tangent, each shorter (x0.66) and thinner
   (x0.6) than its parent, three levels deep, with a node (r 1.2-2) at every junction. The
   crest is built for one half and mirrored with <use transform="matrix(-1 0 0 1 ..)">,
   so the symmetry is exact; the seed is fixed so a brand's sigil never changes. Silver is
   fixed (a 4-stop ramp; graphite in light mode); the client colour exists only as cold
   light (hue kept, chroma cut to 30-45%, lightness 75-85%) in the glow and the lit states.
   The same generator draws the card corner brackets (border-image), the header / divider /
   footer flourish and the thorn wreath of the state discs, all handed to the css as data-URI
   custom properties by tokens(). */
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

// Grow one thorn and its descendants into `out` ({ polys: [[x,y]...][], nodes: [[x,y,r]...] }).
// o: x, y, ang (rad, 0 = +x, y down), len, w (root width), bend (S-curve amplitude, rad),
//    depth, kids (positions along the branch), sides ([1] / [-1] / default alternate), spread, ratio
function csThorn(rnd, o, out) {
  const N = 9, pts = [];
  const th = s => o.ang + o.bend * Math.sin(2 * Math.PI * s);
  let x = o.x, y = o.y;
  pts.push([x, y, th(0), 0]);
  for (let i = 1; i <= N; i++) {
    const m = th((i - 0.5) / N);
    x += Math.cos(m) * o.len / N; y += Math.sin(m) * o.len / N;
    pts.push([x, y, th(i / N), i / N]);
  }
  const left = [], right = [];
  pts.forEach(([px, py, t, s]) => {
    const hw = o.w * Math.pow(1 - s, 1.15) / 2;
    left.push([px - Math.sin(t) * hw, py + Math.cos(t) * hw]);
    right.push([px + Math.sin(t) * hw, py - Math.cos(t) * hw]);
  });
  out.polys.push(left.concat(right.reverse().slice(1)));
  if (o.depth <= 0) return;
  const kids = o.kids && o.kids[o.depth] || (o.depth >= 3 ? [0.25, 0.5, 0.75] : o.depth === 2 ? [0.4, 0.7] : [0.55]);
  kids.forEach((s, k) => {
    const p = pts[Math.round(s * N)];
    const side = o.sides ? o.sides[k % o.sides.length] : (k % 2 ? -1 : 1);
    const spread = (o.spread || 0.55) + (rnd() - 0.5) * 0.14;
    const ratio = (o.ratio || 0.66) + (rnd() - 0.5) * 0.08;
    out.nodes.push([p[0], p[1], 1.1 + o.depth * 0.3]);
    csThorn(rnd, {
      x: p[0], y: p[1], ang: p[2] + side * spread, len: o.len * ratio * (1 - s * 0.3), w: o.w * 0.6 * (1 - s * 0.4),
      bend: -o.bend * 0.8 + (rnd() - 0.5) * 0.12, depth: o.depth - 1, kids: o.kids, sides: o.sides ? o.sides : null, spread: o.spread, ratio: o.ratio,
    }, out);
  });
}

const csNum = v => (Math.round(v * 10) / 10).toString();
function csPath(polys, tf) {
  return polys.map(pl => 'M' + pl.map(([x, y]) => { const q = tf ? tf(x, y) : [x, y]; return csNum(q[0]) + ' ' + csNum(q[1]); }).join('L') + 'Z').join('');
}
function csNodes(nodes, tf, fill) {
  return nodes.map(([x, y, r]) => { const q = tf ? tf(x, y) : [x, y]; return `<circle cx="${csNum(q[0])}" cy="${csNum(q[1])}" r="${r.toFixed(1)}" fill="${fill}"/>`; }).join('');
}
// data URI safe inside an unquoted css url()
function csUri(svg) {
  return 'url(data:image/svg+xml,' + encodeURIComponent(svg).replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/'/g, '%27') + ')';
}

// card corner brackets (60x60, four corners of 24px for border-image slice 24), a flourish tile (120x24), a thorn wreath mask (60x60)
const csAssets = {};
function csBuild(isDark) {
  const key = isDark ? 'd' : 'l';
  if (csAssets[key]) return csAssets[key];
  const col = isDark ? '#C7CFDA' : '#323A45';
  // corners
  const rc = csRand(31);
  const tl = { polys: [], nodes: [] };
  csThorn(rc, { x: 1.2, y: 1.2, ang: 0, len: 23, w: 1.7, bend: 0, depth: 2, kids: { 2: [0.4, 0.72], 1: [0.55] }, sides: [1], spread: 0.62, ratio: 0.46 }, tl);
  csThorn(rc, { x: 1.2, y: 1.2, ang: Math.PI / 2, len: 23, w: 1.7, bend: 0, depth: 2, kids: { 2: [0.4, 0.72], 1: [0.55] }, sides: [-1], spread: 0.62, ratio: 0.46 }, tl);
  tl.nodes.push([1.2, 1.2, 1.9]);
  const tfs = [null, (x, y) => [60 - x, y], (x, y) => [x, 60 - y], (x, y) => [60 - x, 60 - y]];
  const corners = tfs.map(tf => `<path d="${csPath(tl.polys, tf)}" fill="${col}"/>${csNodes(tl.nodes, tf, col)}`).join('');
  const cornerSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">${corners}</svg>`;
  // flourish: mirrored arms, a centre lozenge
  const rf = csRand(77);
  const fr = { polys: [], nodes: [] };
  csThorn(rf, { x: 66, y: 12, ang: 0, len: 52, w: 1.8, bend: 0.1, depth: 1, kids: { 1: [0.5] }, sides: [1, -1], spread: 0.5, ratio: 0.5 }, fr);
  const mir = (x, y) => [120 - x, y];
  const flour = `<path d="${csPath(fr.polys)}${csPath(fr.polys, mir)}" fill="${col}"/>${csNodes(fr.nodes, null, col)}${csNodes(fr.nodes, mir, col)}<path d="M60 4.2 64.4 12 60 19.8 55.6 12Z" fill="none" stroke="${col}" stroke-width=".9"/>`;
  const flourSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="24" viewBox="0 0 120 24">${flour}</svg>`;
  // wreath: 24 spikes, two sizes, as an alpha mask
  let w = '';
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2, long = i % 2 === 0, r0 = 17, r1 = long ? 29 : 23, hw = 0.075;
    const p = (r, da) => `${csNum(30 + r * Math.cos(a + da))} ${csNum(30 + r * Math.sin(a + da))}`;
    w += `M${p(r0, -hw)}L${p(r1, 0)}L${p(r0, hw)}Z`;
  }
  const wreathSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><path d="${w}" fill="#000"/><circle cx="30" cy="30" r="16" fill="none" stroke="#000" stroke-width="1"/></svg>`;
  return (csAssets[key] = { corner: csUri(cornerSvg), flourish: csUri(flourSvg), wreath: csUri(wreathSvg) });
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
  highlightNote: 'The last word keeps the headline face and takes the accent-ink colour; a 1px line in the same colour tapers to a point at both ends beneath it. No fill, no glow, no outline.',
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
      use: 'One sharp highlight per view: a node, the selected tab\'s lance, the progress head, the headline\'s last word',
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
    const a = csBuild(d);
    const l1 = d ? '#F4F7FA' : '#1B2027', l2 = d ? '#9BA4B0' : '#4A5461', l3 = d ? '#5B6572' : '#7E8896';
    return {
      '--ab-type-pick-w': hw,
      '--cs-hw': hw,
      '--cs-l1': l1, '--cs-l2': l2, '--cs-l3': l3,
      '--cs-line': t.alpha(l2, d ? 0.6 : 0.7),
      '--cs-faint': t.alpha(l2, d ? 0.24 : 0.3),
      '--cs-ghost': t.alpha(l2, d ? 0.09 : 0.12),
      '--cs-cold': cold,
      '--cs-glow': t.alpha(cold, d ? 0.42 : 0.5),
      '--cs-panel': d ? t.alpha('#0A0B0F', 0.7) : t.alpha('#FFFFFF', 0.55),
      '--cs-wash': t.mix(t.secondary, t.canvas, d ? 0.09 : 0.1),
      '--cs-silver': d ? 'linear-gradient(135deg, #F4F7FA 0%, #9BA4B0 38%, #EAF2FA 58%, #6C7684 100%)' : 'linear-gradient(135deg, #3A424D 0%, #1B2027 40%, #4A5461 62%, #12161B 100%)',
      '--cs-on-silver': d ? '#050507' : '#E7ECF2',
      // the same values under --ab-* names, so the AI brief's {l1} {silver} {cold} {glow} {panel} {faint} {onSilver} placeholders resolve
      '--ab-l1': l1, '--ab-silver': d ? 'linear-gradient(135deg, #F4F7FA 0%, #9BA4B0 38%, #EAF2FA 58%, #6C7684 100%)' : 'linear-gradient(135deg, #3A424D 0%, #1B2027 40%, #4A5461 62%, #12161B 100%)',
      '--ab-cold': cold, '--ab-glow': t.alpha(cold, d ? 0.42 : 0.5), '--ab-panel': d ? t.alpha('#0A0B0F', 0.7) : t.alpha('#FFFFFF', 0.55),
      '--ab-on-silver': d ? '#050507' : '#E7ECF2', '--ab-faint': t.alpha(l2, d ? 0.24 : 0.3),
      '--cs-corner': a.corner,
      '--cs-flourish': a.flourish,
      '--cs-wreath': a.wreath,
    };
  },

  art(ctx) {
    const t = ctx.t, d = t.isDark, e = escapeHtml;
    const id = 'cs' + (++seq);
    const rnd = csRand(csHash(String(ctx.brandName || 'sigil')));
    const W = 900, H = 360, cx = 450, cy = 180;
    const l1 = d ? '#F4F7FA' : '#1B2027', l2 = d ? '#9BA4B0' : '#4A5461', l3 = d ? '#5B6572' : '#7E8896';
    const cold = csCold(t.primary);
    const half = { polys: [], nodes: [] };
    const mains = [
      { y: 174, ang: -0.52, len: 300, w: 3.0, bend: 0.30 },
      { y: 179, ang: -0.13, len: 400, w: 3.4, bend: -0.26 },
      { y: 184, ang: 0.14, len: 380, w: 3.2, bend: 0.26 },
      { y: 189, ang: 0.54, len: 290, w: 2.8, bend: -0.30 },
    ];
    mains.forEach((m, i) => {
      half.nodes.push([cx + 18, m.y, 1.9]);
      csThorn(rnd, { x: cx + 18, y: m.y, ang: m.ang, len: m.len, w: m.w, bend: m.bend, depth: 3, spread: 0.55 + (i % 2) * 0.05 }, half);
    });
    const halfPath = csPath(half.polys);
    const halfNodes = csNodes(half.nodes, null, `url(#${id}g)`);
    // stipple: a cluster of 1px dots under the diamond (grey wash shading)
    let dots = '';
    for (let i = 0; i < 110; i++) {
      const g = () => (rnd() + rnd() + rnd() - 1.5) * 2;
      const x = cx + g() * 34, y = cy + g() * 80;
      dots += `<circle cx="${csNum(x)}" cy="${csNum(y)}" r="${(0.45 + rnd() * 0.4).toFixed(2)}" opacity="${(0.25 + rnd() * 0.4).toFixed(2)}"/>`;
    }
    // one diagram annotation on the right: a leader to a junction node, with coordinates
    const target = half.nodes.filter(n => n[0] > 600 && n[0] < 760 && n[1] > 90 && n[1] < 270)[1] || [660, 120, 1.5];
    const lx = target[0] + 34, ly = target[1] - 30;
    const initial = e(ctx.initial);
    return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" focusable="false" class="csa">
      <defs>
        <linearGradient id="${id}g" gradientUnits="userSpaceOnUse" x1="${cx}" y1="0" x2="${W}" y2="0"><stop offset="0" stop-color="${l1}"/><stop offset=".22" stop-color="${l2}"/><stop offset=".42" stop-color="${l1}"/><stop offset=".72" stop-color="${l2}"/><stop offset="1" stop-color="${l3}"/></linearGradient>
        <linearGradient id="${id}v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${l1}"/><stop offset=".5" stop-color="${l2}"/><stop offset="1" stop-color="${l1}"/></linearGradient>
        <radialGradient id="${id}w" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${cold}" stop-opacity="${d ? 0.2 : 0.22}"/><stop offset="1" stop-color="${cold}" stop-opacity="0"/></radialGradient>
        <filter id="${id}f" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur in="SourceAlpha" stdDeviation="2.6" result="b"/><feFlood flood-color="${cold}" flood-opacity="${d ? 0.55 : 0.45}"/><feComposite in2="b" operator="in" result="c"/><feMerge><feMergeNode in="c"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <g id="${id}h"><path d="${halfPath}" fill="url(#${id}g)"/>${halfNodes}</g>
      </defs>
      <ellipse cx="${cx}" cy="${cy}" rx="320" ry="150" fill="url(#${id}w)"/>
      <g filter="url(#${id}f)">
        <use href="#${id}h"/>
        <use href="#${id}h" transform="matrix(-1 0 0 1 ${cx * 2} 0)"/>
        <path d="M${cx} 20 ${cx + 1.8} 150 ${cx + 1.8} 210 ${cx} 342 ${cx - 1.8} 210 ${cx - 1.8} 150Z" fill="url(#${id}v)"/>
      </g>
      <g fill="${l2}">${dots}</g>
      <path d="M${cx} 148 ${cx + 19} ${cy} ${cx} 212 ${cx - 19} ${cy}Z" fill="${d ? '#050507' : '#E7ECF2'}" stroke="${l1}" stroke-width="1"/>
      <path d="M${cx} 156 ${cx + 12} ${cy} ${cx} 204 ${cx - 12} ${cy}Z" fill="none" stroke="${l2}" stroke-width=".6"/>
      <text x="${cx}" y="${cy + 6}" text-anchor="middle" fill="none" stroke="${l1}" stroke-width=".7" style="font-family:var(--ab-font-h);font-size:17px">${initial}</text>
      <circle cx="${cx}" cy="20" r="1.8" fill="${l1}"/><circle cx="${cx}" cy="342" r="1.8" fill="${l1}"/>
      <g stroke="${l2}" stroke-opacity=".7" stroke-width=".5" fill="none"><path d="M${target[0]} ${target[1]} ${lx} ${ly}h46"/><circle cx="${target[0]}" cy="${target[1]}" r="3.2"/><path d="M${target[0] - 6} ${target[1]}h12M${target[0]} ${target[1] - 6}v12"/></g>
      <g fill="${l2}" fill-opacity=".85" style="font-family:var(--ab-font-label,monospace);font-size:8.5px;letter-spacing:.16em">
        <text x="${lx + 50}" y="${ly + 3}">N 47°21′</text>
        <text x="44" y="30">SIGIL N° 031</text>
        <text x="${W - 44}" y="30" text-anchor="end">MIRRORED ABOUT X = ${cx}</text>
        <text x="44" y="${H - 22}">0.75 – 1.25 PX</text>
        <text x="${W - 44}" y="${H - 22}" text-anchor="end">E 008°32′</text>
      </g>
    </svg>`;
  },

  materials: [
    { name: 'Tapered thorn', css: 'fill: {l1}; /* a FILLED polygon, width 0 at the tip and 1.5-3px at the root, never a stroked path; branches leave the trunk at 28-38 degrees, curve once in an S, each child x0.66 length and x0.6 width, a node (r 1.2-2) at every junction; fixed seed per brand */' },
    { name: 'Silver ramp', css: 'background: {silver}; /* #F4F7FA -> #9BA4B0 -> #EAF2FA -> #6C7684 (graphite #1B2027 -> #4A5461 in light mode); used as a thin gradient on linework and as the main action fill, never as a large field */' },
    { name: 'Cold light', css: 'box-shadow: 0 0 6px {glow}; color: {cold}; /* the client hue with chroma cut to 30-45% and lightness 75-85%: a 4-6px glow behind thorns, focus rings, lit states */' },
    { name: 'Thorn frame (card)', css: 'background: {panel}; border-image: url(corner brackets) 24 / 24px; /* four corner brackets of branching hairlines (24px) instead of an outline; ornament keeps a 16-24px clear zone from text */' },
    { name: 'Main action', css: 'background: {silver}; color: {onSilver}; clip-path: polygon(6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px), 0 6px); /* 6px chamfer, mono caps label; hover grows a short thorn from one corner */' },
    { name: 'Thorn wreath', css: 'mask: url(wreath) center / contain; background: conic-gradient({cold} 0 66%, {faint} 66% 100%); /* 24 spikes in two sizes; lit spikes carry the cold light: the radial progress and the state discs */' },
    { name: 'Hairline', css: 'border-color: {line}; /* 1px silver at 60%; a node every 5th row, a tapering centre-out divider with a five-segment flourish */' },
  ],

  rules: {
    do: [
      'Draw every thorn as a filled, tapered polygon (0.75–1.25px decorative, 2px at most for frames), mirrored exactly, with a node at each junction.',
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
      ['Hairline thorns, mirrored', 'Tapered branches build a symmetric, architectural frame.'],
      ['Silver is fixed', 'Client colour appears only as cold light and glow.'],
      ['Ornament keeps its distance', 'A clear zone separates every line from text.'],
    ],
    do: [
      'Draw thorns as tapered filled shapes.',
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
