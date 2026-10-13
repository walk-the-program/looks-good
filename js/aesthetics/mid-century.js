/* 41 Atomic Age — 1950s civil-defence and atomic-age propaganda, worn on paper, with a
   green phosphor terminal for the interface. References: public-domain civil-defence posters
   and shelter signs (the yellow and black trefoil), atomic-age advertising, Googie starbursts
   and boomerangs, and green-on-black CRT terminals of the period.

   Mechanism. The hero is ONE weathered poster on kraft paper: a sunburst in the client
   primary (the poster's main ink), a shelter-yellow sun with a charcoal atom over it, a
   starburst seal with the initial, a trefoil shelter plate and a boomerang in the secondary.
   Paper wear is flat SVG only (mottling, creases, scuffs, specks, edge stroke): no CSS masks,
   filters or gradients on the poster.
   - Colour: kraft #EADBB8, charcoal #2B2622 and the shelter yellow #F2C41B are fixed (the
     yellow is the one period ink). The client primary prints as the poster ink; printPrimary
     keeps its label readable. Secondary and accent are warmed 6 degrees toward yellow with
     15% less chroma.
   - Interface: the 01 card, 02 panel and 03 list are phosphor screens, #18FF62 on #031A0A in
     both modes. They never take client colours. Bracketed menu items, scanlines, a chunky mono.
   - headline(ctx, text): tracked caps with the last word in heavy slab sign lettering, in the
     primary. art(ctx) is pure SVG with inline fills (blend donor safe). */
(function () {
const CREAM = '#F3EAD7', CHAR = '#2B2622', KRAFT = '#EADBB8', SHELTER = '#F2C41B';
const CRT_BG = '#031A0A', CRT_INK = '#18FF62', CRT_DIM = '#2BD873';

function mcRand(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function mcHash(str) {
  let h = 2166136261;
  const s = String(str);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
const f1 = n => String(Math.round(n * 10) / 10);
const f2 = n => String(Math.round(n * 100) / 100);

// 1950s register: hue 6 degrees toward yellow (60), chroma -15%
function mcWarm(hex) {
  const c = hexToHsl(hex);
  const d = ((60 - c.h + 540) % 360) - 180;
  const h = (c.h + Math.max(-6, Math.min(6, d)) + 360) % 360;
  return hslToHex(h, c.s * 0.85, c.l);
}
// text that reads on a fill: cream or charcoal
const mcOn = fill => (contrastRatio(CREAM, fill) >= contrastRatio(CHAR, fill) ? CREAM : CHAR);
// The printed primary: warmed (mcWarm), then moved in lightness only as far as it takes for
// its label (cream or charcoal) to reach 4.8:1, so the poster ink and its script word read.
function mcPrint(hex) {
  const w = mcWarm(hex);
  if (contrastRatio(mcOn(w), w) >= 4.8) return w;
  const c = hexToHsl(w);
  const dark = mcOn(w) === CREAM;
  for (let i = 1; i <= 40; i++) {
    const l = Math.max(0, Math.min(100, c.l + (dark ? -i : i)));
    const h = hslToHex(c.h, c.s, l);
    if (contrastRatio(dark ? CREAM : CHAR, h) >= 4.8) return h;
  }
  return w;
}

// printed edge: resample a closed outline every `step` units, nudge each vertex by ±j
function mcCut(pts, rnd, step = 6, j = 0.9) {
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length];
    const L = Math.hypot(x1 - x0, y1 - y0);
    const k = Math.max(1, Math.round(L / step));
    for (let s = 0; s < k; s++) {
      const u = s / k;
      out.push([x0 + (x1 - x0) * u + (rnd() - 0.5) * 2 * j, y0 + (y1 - y0) * u + (rnd() - 0.5) * 2 * j]);
    }
  }
  return 'M' + out.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L') + 'Z';
}
const ellipsePts = (cx, cy, rx, ry, rot = 0, n = 48) => Array.from({ length: n }, (_, i) => {
  const a = Math.PI * 2 * i / n, r = rot * Math.PI / 180;
  const x = Math.cos(a) * rx, y = Math.sin(a) * ry;
  return [cx + x * Math.cos(r) - y * Math.sin(r), cy + x * Math.sin(r) + y * Math.cos(r)];
});
const bez = (p0, p1, p2, n) => Array.from({ length: n + 1 }, (_, i) => {
  const u = i / n, v = 1 - u;
  return [v * v * p0[0] + 2 * v * u * p1[0] + u * u * p2[0], v * v * p0[1] + 2 * v * u * p1[1] + u * u * p2[1]];
});
// concave sparkle (4 points; 8 with a smaller rotated twin)
function sparkle(x, y, R, fill, eight, rot = 0) {
  const one = (r, a0) => {
    const p = [0, 1, 2, 3].map(i => { const a = (a0 + i * 90) * Math.PI / 180; return [x + Math.cos(a) * r, y + Math.sin(a) * r]; });
    return `M${f1(p[0][0])} ${f1(p[0][1])}` + [1, 2, 3, 0].map(i => `Q${f1(x)} ${f1(y)} ${f1(p[i][0])} ${f1(p[i][1])}`).join('') + 'Z';
  };
  return `<path d="${one(R, rot - 90)}${eight ? one(R * 0.55, rot - 45) : ''}" fill="${fill}"/>`;
}
function starburst(x, y, r0, r1, n, fill, rnd) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) { const a = Math.PI * i / n - Math.PI / 2, r = i % 2 ? r0 : r1; pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
  return `<path d="${mcCut(pts, rnd, 9, 0.6)}" fill="${fill}"/>`;
}
function atom(x, y, r, ring, nuc, w) {
  let g = '';
  [0, 60, 120].forEach(a => {
    g += `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${f1(r * 0.36)}" transform="rotate(${a} ${x} ${y})" fill="none" stroke="${ring}" stroke-width="${w}"/>`;
  });
  return g + `<circle cx="${x}" cy="${y}" r="${f1(r * 0.17)}" fill="${nuc}"/>`;
}
// an electron on an atom orbit: parameter th on an ellipse rotated by deg
function orbitDot(x, y, rx, ry, deg, th, r, fill) {
  const px = Math.cos(th) * rx, py = Math.sin(th) * ry, a = deg * Math.PI / 180;
  return `<circle cx="${f1(x + px * Math.cos(a) - py * Math.sin(a))}" cy="${f1(y + px * Math.sin(a) + py * Math.cos(a))}" r="${r}" fill="${fill}"/>`;
}
// trefoil shelter sign: three annular sectors (±30 degrees each) at -90, 30 and 150 degrees
function trefoil(x, y, ro, ri, fill) {
  const h = Math.PI / 6;
  const p = (r, b) => [x + Math.cos(b) * r, y + Math.sin(b) * r];
  const blade = a => {
    const o0 = p(ro, a - h), o1 = p(ro, a + h), i1 = p(ri, a + h), i0 = p(ri, a - h);
    return `<path d="M${f1(o0[0])} ${f1(o0[1])}A${ro} ${ro} 0 0 1 ${f1(o1[0])} ${f1(o1[1])}L${f1(i1[0])} ${f1(i1[1])}A${ri} ${ri} 0 0 0 ${f1(i0[0])} ${f1(i0[1])}Z" fill="${fill}"/>`;
  };
  return [-Math.PI / 2, Math.PI / 6, Math.PI * 5 / 6].map(blade).join('');
}
// worn paper, flat SVG only: mottling, two folds, scratches, scuffs, ink specks, edge wear
function wear(rnd) {
  let g = '';
  for (let i = 0; i < 14; i++) {
    g += `<ellipse cx="${f1(rnd() * 400)}" cy="${f1(rnd() * 400)}" rx="${f1(16 + rnd() * 54)}" ry="${f1(10 + rnd() * 30)}" fill="${rnd() < 0.5 ? '#7A5A2E' : '#FFF8E6'}" opacity="${f2(0.04 + rnd() * 0.06)}"/>`;
  }
  g += '<path d="M133 0V400M267 0V400" stroke="#FFF8E6" stroke-width="1.6" opacity=".5"/>'
    + '<path d="M135 0V400M269 0V400" stroke="#5A4524" stroke-width=".8" opacity=".16"/>';
  for (let i = 0; i < 6; i++) {
    g += `<path d="M${f1(rnd() * 380)} ${f1(rnd() * 380)}l${f1(20 + rnd() * 40)} ${f1(rnd() * 14 - 7)}" stroke="#FFF8E6" stroke-width="1" opacity=".5"/>`;
  }
  for (let i = 0; i < 40; i++) {
    g += `<circle cx="${f1(rnd() * 400)}" cy="${f1(rnd() * 400)}" r="${f1(0.6 + rnd() * 1.6)}" fill="${KRAFT}" opacity="${f2(0.6 + rnd() * 0.4)}"/>`;
  }
  for (let i = 0; i < 22; i++) {
    g += `<circle cx="${f1(rnd() * 400)}" cy="${f1(rnd() * 400)}" r="${f1(0.5 + rnd() * 1.2)}" fill="${CHAR}" opacity="${f2(0.15 + rnd() * 0.15)}"/>`;
  }
  return g + '<rect x="3" y="3" width="394" height="394" fill="none" stroke="#6B4E24" stroke-width="8" opacity=".16"/>';
}
const uri = svg => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

function mcFonts() {
  if (typeof window === 'undefined' || !window.loadFontFamily || typeof FONTS === 'undefined') return;
  ['Alfa Slab One', 'JetBrains Mono'].forEach(n => {
    const f = FONTS.find(x => x.name === n);
    if (f) window.loadFontFamily(f);
  });
}

function mcHeadline(ctx, text) {
  const s = String(text || '').trim();
  if (!s) return '';
  mcFonts();
  const m = s.match(/^([\s\S]*?)([^\s]+?)([.,;:!?…]*)$/);
  const lead = m ? m[1].trim() : '';
  const last = m ? m[2] : s;
  const punct = m ? m[3] : '';
  return `${lead ? `<span class="mc-caps">${escapeHtml(lead)}</span> ` : ''}<span class="mc-script">${escapeHtml(last)}${punct ? escapeHtml(punct) : ''}</span>`;
}

registerAesthetic({
  key: 'mid-century', order: 41,
  name: 'Atomic Age',
  descriptor: 'Cheerful · Irradiated · Retro-future',
  influences: 'Civil-defence posters / Googie / atomic-age ads / CRT terminals',
  summary: '1950s shelter-sign optimism on worn kraft paper: a sunburst, an atom and a trefoil, with a green phosphor terminal for the interface.',
  motto: 'Duck, cover, carry on.',
  kicker: 'Shelter ready, 1956 edition',
  mode: 'light',
  slideShape: 'classic',
  labels: { material: 'Terminal', states: ['Rest', 'Hover', 'Pressed'], statesKind: 'chip' },
  layout: { hero: 'split', palette: 'swatches', sections: 'asym', subcopy: true },
  type: { ui: 'body', label: 'heading', display: 1 },
  highlight: 'custom',
  highlightNote: 'The headline is tracked geometric caps with its last word set in heavy slab sign lettering, in the primary. One slab word per view, never more.',
  cardFill: '--mc-card',

  roles: {
    canvas: {
      use: 'Aged cream paper #F3EAD7 behind the poster. Dark mode is deep charcoal-brown paper from the client dark',
      never: 'Gradients, grain or texture on the canvas itself',
      coverage: '50–60%',
    },
    ink: {
      use: 'Charcoal #2B2622 (cream on dark): headlines, rules, the poster linework and type. Terminal screens never use it',
      never: 'Outlines round shapes, drop shadows',
      coverage: '15%',
    },
    primary: {
      use: 'The poster main ink: the sunburst rays and the headline script word. Printed warmed 6 degrees toward yellow, then moved in lightness until its label reads at 4.5:1. Never on a terminal screen',
      never: 'Terminal screens, body text, more than one big fill per view',
      coverage: '≈15%',
    },
    secondary: {
      use: 'The boomerang on the poster and the second electron on the atom. Warmed like the primary',
      never: 'Terminal text, the main action',
      coverage: '≈10%',
    },
    accent: {
      use: 'Sparkles and the starburst seal on the poster, and the rule sparkle. Warmed like the primary. The shelter yellow is fixed and sits on the sun and the trefoil plate',
      never: 'Buttons, body text, large fills',
      coverage: '≤5% (+ shelter yellow ≈10%)',
    },
  },

  canvas(b) {
    if (!b.isDark) return CREAM;
    const h = b.hexToHsl(b.canvas);
    return b.hslToHex(h.h, Math.min(h.s, 16), Math.max(10, Math.min(h.l, 13)));
  },

  printPrimary(t) { return mcPrint(t.primary); },

  headline(ctx, text) { return mcHeadline(ctx, text); },

  tokens(t) {
    const d = t.isDark;
    const ink = d ? CREAM : CHAR;
    const pp = t.printPrimary || mcPrint(t.primary);
    const sec = mcWarm(t.secondary), acc = mcWarm(t.accent);
    const card = d ? t.mix('#FFFFFF', t.canvas, 0.06) : '#FBF6EA';
    let toward = 0.4, muted = t.mix(t.canvas, ink, toward);
    while (toward > 0.05 && t.contrast(muted, t.canvas) < 4.6) { toward -= 0.04; muted = t.mix(t.canvas, ink, toward); }
    // script word: the primary when it reads (3:1) on the paper, else secondary or ink
    const script = t.contrast(pp, t.canvas) >= 3 ? pp : (t.contrast(sec, t.canvas) >= 3 ? sec : ink);
    // small list numerals (11px) keep the script colour only when it reaches 4.5:1
    const num = t.contrast(script, t.canvas) >= 4.5 ? script : ink;
    const plane = t.mix(ink, card, d ? 0.12 : 0.09);
    const spark = (fill, s = 14) => uri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" width="${s}" height="${s}">${sparkle(s / 2, s / 2, s * 0.42, fill, false)}</svg>`);
    const burst = (fill) => uri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">${starburst(20, 20, 14.5, 19.5, 12, fill, mcRand(7))}</svg>`);
    return {
      '--ab-ink': ink,
      '--ab-muted': muted,
      '--ab-line': t.mix(t.canvas, ink, 0.82),
      '--ab-type-pick-w': 400,
      '--ab-period': SHELTER,
      '--mc-ink': ink,
      '--mc-card': card,
      '--mc-plane': plane,
      '--mc-sec': sec, '--mc-acc': acc, '--mc-period': SHELTER,
      '--mc-on-pri': mcOn(pp), '--mc-on-sec': mcOn(sec), '--mc-on-ink': d ? CHAR : CREAM, '--mc-on-period': CHAR,
      '--mc-script': script, '--mc-num': num,
      '--mc-spark-acc': spark(acc),
      '--mc-burst-ink': burst(ink),
      '--mc-crt-bg': CRT_BG, '--mc-crt-ink': CRT_INK, '--mc-crt-dim': CRT_DIM,
      '--mc-crt-bezel': d ? '#CFC3A6' : CHAR,
    };
  },

  art(ctx) {
    const t = ctx.t;
    const pp = t.printPrimary || mcPrint(t.primary);
    const sec = mcWarm(t.secondary), acc = mcWarm(t.accent);
    const rnd = mcRand(mcHash(String(ctx.brandName || 'brand') + '|aa'));
    const cx = 200, cy = 196;
    // sunburst: twelve wedges of the primary alternate with kraft, radiating past the edges
    let rays = '';
    for (let i = 0; i < 24; i += 2) {
      const a0 = -Math.PI / 2 + i * Math.PI / 12, a1 = a0 + Math.PI / 12;
      const pts = [[cx, cy], [cx + Math.cos(a0) * 420, cy + Math.sin(a0) * 420], [cx + Math.cos(a1) * 420, cy + Math.sin(a1) * 420]];
      rays += `<path d="${mcCut(pts, rnd, 60, 0.8)}" fill="${pp}"/>`;
    }
    const sun = `<circle cx="${cx}" cy="${cy}" r="96" fill="${SHELTER}"/>`;
    // atom over the sun: charcoal orbits and nucleus, electrons in the secondary, primary and accent
    const R = 132;
    const atomArt = atom(cx, cy, R, CHAR, CHAR, 5.5)
      + orbitDot(cx, cy, R, R * 0.36, 0, 1.1, 9, sec)
      + orbitDot(cx, cy, R, R * 0.36, 60, 2.6, 9, pp)
      + orbitDot(cx, cy, R, R * 0.36, 120, 4.0, 9, acc);
    // starburst seal with the initial (Googie)
    const seal = starburst(70, 66, 30, 40, 14, CHAR, rnd)
      + `<text x="70" y="77" text-anchor="middle" font-family="var(--ab-font-h, Jost, sans-serif)" font-weight="700" font-size="28" fill="${KRAFT}">${escapeHtml(ctx.initial || '')}</text>`;
    // shelter-sign plate: yellow field, charcoal frame, black trefoil, SHELTER lettering
    const plate = `<rect x="30" y="270" width="96" height="96" rx="4" fill="${SHELTER}" stroke="${CHAR}" stroke-width="4"/>`
      + trefoil(78, 312, 30, 8, CHAR)
      + `<text x="78" y="356" text-anchor="middle" font-family="var(--ab-font-h, Jost, sans-serif)" font-weight="700" font-size="11" letter-spacing="1.5" fill="${CHAR}">SHELTER</text>`;
    // boomerang in the secondary, bleeding off the bottom right
    const outer = bez([92, 122], [330, -40], [470, 300], 30);
    const inner = bez([470, 300], [330, 150], [112, 158], 30).slice(1, -1);
    const boomer = `<path transform="translate(190 300) scale(0.5)" d="${mcCut(outer.concat(inner, [[100, 160], [86, 146]]), rnd, 7, 0.9)}" fill="${sec}"/>`;
    const sparks = sparkle(352, 58, 18, acc, true, 8) + sparkle(118, 362, 10, CHAR, false);
    return `<svg class="mc-art" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="presentation" focusable="false" style="display:block;width:100%;height:100%">
      <rect width="400" height="400" fill="${KRAFT}"/>
      ${rays}${sun}${atomArt}${seal}${plate}${boomer}${sparks}${wear(rnd)}
    </svg>`;
  },

  materials: [
    { name: 'Poster ink', css: 'background: {primary}; /* flat printed ink on kraft #EADBB8, worn by flat specks and creases; no gradient */' },
    { name: 'Shelter plate', css: 'background: #F2C41B; border: 4px solid #2B2622; /* the one period yellow, black trefoil, no shadow */' },
    { name: 'Phosphor screen', css: 'background: #031A0A; color: #18FF62; box-shadow: inset 0 0 36px rgba(24,255,98,.14); /* scanlines every 3px; the same in both modes */' },
    { name: 'Bracket menu', css: 'color: #18FF62; text-transform: uppercase; /* items wrapped in [ and ], chunky mono; the pressed item is inverted */' },
    { name: 'Inverse block', css: 'background: #18FF62; color: #031A0A; /* the primary terminal action and the pressed item */' },
    { name: 'Scan progress', css: 'background: repeating-linear-gradient(90deg, #18FF62 0 8px, transparent 8px 10px); /* a row of blocks, like an ASCII bar */' },
  ],

  rules: {
    do: [
      'Build the poster from flat printed shapes: sunbursts, atoms, shelter trefoils, starbursts and boomerangs on worn kraft paper.',
      'Set every interface component as a green phosphor terminal: green on black, scanlines, chunky mono, bracketed items.',
      'Pair tracked geometric caps with one heavy slab word in the primary per view.',
      'Let the shelter yellow appear only on the sun and the trefoil plate.',
      'Keep the terminal green fixed; the client colour belongs to the poster.',
    ],
    dont: [
      'Put the client primary or accent on a terminal screen.',
      'Copy the characters, mascots or logos of any game; build new marks from public 1950s sources.',
      'Use CSS masks, gradients or grain for paper wear; the wear is flat SVG.',
      'Use more than four inks on the poster, or a rainbow.',
    ],
  },

  deck: {
    marks: (ctx, kind) => `<i class="mc-mk" data-k="${kind === 'do' ? 'do' : 'dont'}"></i>`,
    principles: [
      ['Worn atomic-age poster', 'Flat printed shapes on kraft paper, weathered by hand.'],
      ['Terminal for the interface', 'Green phosphor on black, bracketed menu items.'],
      ['Cheerful, irradiated, retro-future', 'Optimism with a faint background hum.'],
    ],
    do: [
      'Build posters from flat printed shapes on kraft paper.',
      'Set every interface component as a bracketed green terminal item.',
      'Keep the terminal green fixed; put the client colour on the poster.',
    ],
    dont: [
      'Add characters, mascots or logos from any game.',
      'Add masks, gradients or grain to the paper.',
      'Use more than four inks on a poster.',
    ],
  },
});
})();
