/* 31 Cybersigilism — thorned, silver, cold. References: Aingelblood-lineage cybersigilism
   linework (tapered, mirrored, architectural; CO:CREATE, 032c, Underblast), blackwork and
   metal logos, Chrome Hearts' silver. No studio-grade UI system exists in this style, so
   the UI translation is a proposal: ornament is the content, legibility is protected by a
   clear zone (16-24px) and ornament never touches text.

   Mechanism. Every thorn is a FILLED, TAPERED polygon (width 0 at the tip), not a stroked
   path (stroked paths read as wire). The crest follows the research recipe: straight
   segments, a fork at 80% of each into two children at 28 degrees with 0.68 of the length,
   depth 4, two short barbs per segment at 35 degrees, a node only at each fork. The crest
   is built for one half and mirrored with <use transform="matrix(-1 0 0 1 ..)">, so the
   symmetry is exact; the seed (brand name) only nudges the four main branches a few
   percent, so a brand's sigil never changes. Silver is fixed (a 4-stop ramp; graphite in
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

// The sigil recipe (research, literally). Every segment is a straight, filled, tapered polygon: 2.2px at
// the root of a main branch down to 0 at the tip (children start thinner, x0.78 per level). At 80% of its
// length a segment forks: two children leave at 28 degrees either side of it, each 0.68 of the parent's
// length, to depth 4; a node is drawn at each fork and nowhere else. Every segment also carries two short
// barbs (35 degrees, swept toward the tip, one each side). The result is architectural thorn work, not veins.
const CS_ANG = 28 * Math.PI / 180, CS_BARB = 35 * Math.PI / 180, CS_RATIO = 0.68, CS_TAPER = 2.2, CS_DEPTH = 4;
// out: { polys: [[x,y]...][], nodes: [[x,y,r]...] }
function csTri(out, x, y, ang, len, w) {
  const nx = -Math.sin(ang) * w / 2, ny = Math.cos(ang) * w / 2;
  out.polys.push([[x + nx, y + ny], [x - nx, y - ny], [x + Math.cos(ang) * len, y + Math.sin(ang) * len]]);
}
function csGrow(out, x, y, ang, len, w, depth) {
  csTri(out, x, y, ang, len, w);
  // two barbs, one each side, swept toward the tip
  [[0.32, 1], [0.58, -1]].forEach(([s, side]) => {
    csTri(out, x + Math.cos(ang) * len * s, y + Math.sin(ang) * len * s, ang + side * CS_BARB, len * 0.2, w * (1 - s) * 0.75);
  });
  if (depth <= 0) return;
  const fx = x + Math.cos(ang) * len * 0.8, fy = y + Math.sin(ang) * len * 0.8;
  out.nodes.push([fx, fy, 1 + depth * 0.25]);
  [1, -1].forEach(side => csGrow(out, fx, fy, ang + side * CS_ANG, len * CS_RATIO, w * 0.78, depth - 1));
}

const csNum = v => (Math.round(v * 10) / 10).toString();
function csPath(polys) {
  return polys.map(pl => 'M' + pl.map(([x, y]) => csNum(x) + ' ' + csNum(y)).join('L') + 'Z').join('');
}
function csNodes(nodes, fill) {
  return nodes.map(([x, y, r]) => `<circle cx="${csNum(x)}" cy="${csNum(y)}" r="${r.toFixed(1)}" fill="${fill}"/>`).join('');
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
  highlightNote: 'The last word keeps the headline face and is set in the silver ramp (a vertical #fff to #b9bec6 to #e9ebee gradient clipped to the text; graphite in light mode) with a soft glow of the accent at 40% around it; the 1px tapered line beneath is silver too. The accent is only ever that glow, never a solid fill on the word.',
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
      '--cs-hl-glow': t.alpha(t.accent, d ? 0.4 : 0.32),
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
    const cold = csCold(t.primary);
    const half = { polys: [], nodes: [] };
    // three main branches fan out from the axis; a brand-seeded nudge of a few percent keeps each sigil its own
    const mains = [
      { y: 174, ang: -0.62, len: 205, w: CS_TAPER },
      { y: 181, ang: 0, len: 240, w: CS_TAPER },
      { y: 188, ang: 0.62, len: 200, w: CS_TAPER },
    ];
    mains.forEach(m => {
      const len = m.len * (0.96 + rnd() * 0.08), ang = m.ang + (rnd() - 0.5) * 0.05;
      half.nodes.push([cx + 18, m.y, 1.9]);
      csGrow(half, cx + 18, m.y, ang, len, m.w, CS_DEPTH);
    });
    const halfPath = csPath(half.polys);
    const halfNodes = csNodes(half.nodes, `url(#${id}g)`);
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
