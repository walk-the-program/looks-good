/* 41 Atomic Mid-Century — optimistic, cut-paper, atomic. References: Charley Harper's
   "minimal realism" (animals reduced to circles, half-circles and triangles, one striped
   shape, flat colour, no outlines), Saul Bass's hand-cut paper symbols, Alexander Girard's
   folk-modern repeats, Paul Rand's cut collage, Mary Blair's flat colour, Jim Flora's atomic
   figures, Alvin Lustig's covers, Googie boomerangs and starbursts, the Atomic Age kit.

   Mechanism. Everything is CUT PAPER: flat planes with no outlines, their edges sampled
   every few units and each vertex nudged 0.5-1px (a scissor cut, not a pen line), stacked
   on cream so paper shows between them. The kit is small and repeats with intent:
   concave 4- and 8-point sparkles, an atom (three thin orbit bands round a nucleus),
   boomerangs, kidney panels, a starburst seal, ball-and-stick molecules, a Harper-style
   bird built only from circles, a half-circle wing with stripes and triangles.
   - Colour: cream #F3EAD7 and charcoal #2B2622 are fixed, plus ONE period ink, mustard
     #E0A526 or teal #1F7A7A, whichever is farther in hue from the client primary (≤15%).
     Client colours are warmed 6° toward yellow and lose ~15% chroma (the 1950s register);
     printPrimary(t) prints the primary that way, shifted in lightness until its label reads at 4.5:1.
   - headline(ctx, text): tracked geometric caps with the last word swapped for ONE slanted
     brush-script word (Yellowtail) in the primary, on a cut-paper swoosh.
   - Interface: skewed paper planes for the action and segments (the plane is skewed, the
     label is not), a TV-dial toggle, a cream field with a charcoal bar, sparkles as progress,
     atom bullets, starburst seals. art(ctx) is pure SVG with inline fills (blend donor safe). */
(function () {
let seq = 0;
const CREAM = '#F3EAD7', CHAR = '#2B2622', MUSTARD = '#E0A526', TEAL = '#1F7A7A';

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
const hueDist = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

// 1950s register: hue 6 degrees toward yellow (60), chroma -15%
function mcWarm(hex) {
  const c = hexToHsl(hex);
  const d = ((60 - c.h + 540) % 360) - 180;
  const h = (c.h + Math.max(-6, Math.min(6, d)) + 360) % 360;
  return hslToHex(h, c.s * 0.85, c.l);
}
function mcPeriod(primary) {
  const h = hexToHsl(primary).h;
  return hueDist(h, hexToHsl(MUSTARD).h) >= hueDist(h, hexToHsl(TEAL).h) ? MUSTARD : TEAL;
}
// text that reads on a fill: cream or charcoal
const mcOn = fill => (contrastRatio(CREAM, fill) >= contrastRatio(CHAR, fill) ? CREAM : CHAR);
// The printed primary: warmed (mcWarm), then moved in lightness only as far as it takes for
// its label (cream or charcoal) to reach 4.8:1 (4.5 with headroom for anti-aliasing), so the
// 12px CTA label stays readable.
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

// cut-paper edge: resample a closed outline every `step` units, nudge each vertex 0.5-1px
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
const uri = svg => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

function mcFonts() {
  if (typeof window === 'undefined' || !window.loadFontFamily || typeof FONTS === 'undefined') return;
  const f = FONTS.find(x => x.name === 'Yellowtail');
  if (f) window.loadFontFamily(f);
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
  name: 'Atomic Mid-Century',
  descriptor: 'Optimistic · Cut-paper · Atomic',
  influences: 'Charley Harper / Saul Bass / Girard / Googie',
  summary: '1950s optimism from flat, slightly rough-cut coloured paper shapes: starbursts, orbits and boomerangs.',
  motto: 'Cut it from coloured paper.',
  kicker: 'Tomorrow, 1956 edition',
  mode: 'light',
  slideShape: 'classic',
  labels: { material: 'Cut paper', states: ['Cut', 'Layered', 'Printed'], statesKind: 'swatch' },
  layout: { hero: 'split', palette: 'swatches', sections: 'asym', subcopy: true },
  type: { ui: 'body', label: 'heading', display: 1 },
  highlight: 'custom',
  highlightNote: 'The headline is tracked geometric capitals; its last word is swapped for one slanted brush-script word (Yellowtail) in the primary, riding a cut-paper swoosh in the accent. One script word per view, never more.',
  cardFill: '--mc-card',

  roles: {
    canvas: {
      use: 'Cream paper #F3EAD7, fixed; it must show between every pair of planes. Dark mode is deep charcoal-brown paper from the client dark',
      never: 'White, gradients, grain or texture of any kind',
      coverage: '50–60%',
    },
    ink: {
      use: 'Charcoal #2B2622 (cream on the dark paper): type, the 2px field bar, the TV dial, small cut details (an eye, a beak, molecule sticks). Never a drawn outline round a shape',
      never: 'Outlines, hairline frames, drop shadows',
      coverage: '15%',
    },
    primary: {
      use: 'The biggest cut plane (the boomerang), the skewed main action, the one script word, the dial ring when on. Printed warmed 6 degrees toward yellow with 15% less chroma, then darkened (or lightened) just enough for its label to read at 4.5:1',
      never: 'Body text, outlines, more than one big plane per view',
      coverage: '≈15%',
    },
    secondary: {
      use: 'The second plane: the kidney panel behind the content card, the layered sheet under a swatch, the second molecule ball. Warmed like the primary',
      never: 'The main action, text, outlines',
      coverage: '≈10–12%',
    },
    accent: {
      use: 'Sparkles and atoms only: the atom orbits, the progress sparkles, the swoosh under the script word. Plus the one period ink (mustard or teal, whichever is farther from the primary) for the bird and the starburst seal, at most 15%',
      never: 'Buttons, body text, large fills, a fifth ink',
      coverage: '≤5% (+ period ≤15%)',
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
    const sec = mcWarm(t.secondary), acc = mcWarm(t.accent), per = mcPeriod(t.primary);
    const card = d ? t.mix('#FFFFFF', t.canvas, 0.06) : '#FBF6EA';
    let toward = 0.4, muted = t.mix(t.canvas, ink, toward);
    while (toward > 0.05 && t.contrast(muted, t.canvas) < 4.6) { toward -= 0.04; muted = t.mix(t.canvas, ink, toward); }
    // script word: the primary when it reads (3:1) on the paper, else charcoal/cream
    const script = t.contrast(pp, t.canvas) >= 3 ? pp : (t.contrast(sec, t.canvas) >= 3 ? sec : ink);
    // small list numerals (11px) keep the script colour only when it reaches 4.5:1
    const num = t.contrast(script, t.canvas) >= 4.5 ? script : ink;
    const plane = t.mix(ink, card, d ? 0.12 : 0.09);
    const spark = (fill, s = 14) => uri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" width="${s}" height="${s}">${sparkle(s / 2, s / 2, s * 0.42, fill, false)}</svg>`);
    const sp8 = (fill) => uri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="30" height="30">${sparkle(15, 15, 13.5, fill, true)}</svg>`);
    const rnd = mcRand(7);
    const burst = (fill) => uri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">${starburst(20, 20, 14.5, 19.5, 12, fill, rnd)}</svg>`);
    const atomU = (ring, nuc) => uri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">${atom(12, 12, 10.5, ring, nuc, 1.6)}</svg>`);
    const dialTicks = Array.from({ length: 9 }, (_, i) => {
      const a = (-135 + i * 33.75) * Math.PI / 180;
      return `<path d="M${f1(24 + Math.cos(a - Math.PI / 2) * 19)} ${f1(24 + Math.sin(a - Math.PI / 2) * 19)}L${f1(24 + Math.cos(a - Math.PI / 2) * 23)} ${f1(24 + Math.sin(a - Math.PI / 2) * 23)}" stroke="${ink}" stroke-width="${i % 4 === 0 ? 2.2 : 1.2}" stroke-linecap="butt"/>`;
    }).join('');
    const swoosh = uri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 30" preserveAspectRatio="none" width="200" height="30"><path d="${mcCut(bez([2, 26], [90, 2], [198, 10], 14).concat(bez([198, 10], [100, 12], [2, 26], 14).slice(1, -1).map(([x, y]) => [x, y + 5])), rnd, 8, 0.5)}" fill="${acc}"/></svg>`);
    return {
      '--ab-ink': ink,
      '--ab-muted': muted,
      '--ab-line': t.mix(t.canvas, ink, 0.82),
      '--ab-type-pick-w': 400,
      '--mc-ink': ink,
      '--mc-card': card,
      '--mc-plane': plane,
      '--mc-sec': sec, '--mc-acc': acc, '--mc-period': per,
      '--mc-on-pri': mcOn(pp), '--mc-on-sec': mcOn(sec), '--mc-on-ink': d ? CHAR : CREAM,
      '--mc-script': script, '--mc-num': num,
      '--mc-spark-dim': spark(t.mix(t.canvas, ink, 0.8)), '--mc-spark-pri': spark(pp), '--mc-spark-acc': sp8(acc),
      '--mc-spark-on': spark(mcOn(pp), 16), '--mc-spark-per': sp8(per),
      '--mc-burst-ink': burst(ink),
      '--mc-atom1': atomU(pp, ink), '--mc-atom2': atomU(sec, ink), '--mc-atom3': atomU(d ? acc : t.mix(acc, CHAR, 0.75), ink),
      '--mc-dial': uri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">${dialTicks}</svg>`),
      '--mc-swoosh': swoosh,
      '--ab-period': per,
    };
  },

  art(ctx) {
    const t = ctx.t;
    const d = t.isDark;
    const ink = d ? CREAM : CHAR;
    const paper = t.canvas;
    const pp = t.printPrimary || mcPrint(t.primary);
    const sec = mcWarm(t.secondary), acc = mcWarm(t.accent), per = mcPeriod(t.primary);
    const rnd = mcRand(mcHash(String(ctx.brandName || 'brand') + '|mc'));
    const id = 'mcs' + (++seq);
    // the boomerang: outer and inner quadratic curves, rounded tips
    const outer = bez([92, 122], [330, -40], [470, 300], 30);
    const inner = bez([470, 300], [330, 150], [112, 158], 30).slice(1, -1);
    const tip = [[100, 160], [86, 146]];
    const boomer = `<path d="${mcCut(outer.concat(inner, tip), rnd, 7, 0.9)}" fill="${pp}"/>`;
    // kidney plane (bean) under the boomerang, bleeding off the bottom
    const kid = Array.from({ length: 60 }, (_, i) => {
      const a = Math.PI * 2 * i / 60;
      const r = 1 + 0.22 * Math.cos(2 * a) - 0.16 * Math.cos(a - 0.6);
      return [214 + Math.cos(a) * 168 * r, 352 + Math.sin(a) * 86 * r];
    });
    const kidney = `<path d="${mcCut(kid, rnd, 8, 0.9)}" fill="${sec}" transform="rotate(-13 214 352)"/>`;
    // half-circle sun, striped (Harper: pattern inside one shape)
    const half = Array.from({ length: 25 }, (_, i) => { const a = Math.PI + Math.PI * i / 24; return [292 + Math.cos(a) * 62, 300 + Math.sin(a) * 62]; });
    const sun = `<clipPath id="${id}h"><path d="${mcCut(half, rnd, 7, 0.7)}"/></clipPath><g clip-path="url(#${id}h)"><rect x="220" y="230" width="150" height="80" fill="${per}"/>${Array.from({ length: 8 }, (_, i) => `<rect x="${f1(236 + i * 16)}" y="230" width="6.5" height="80" fill="${paper}"/>`).join('')}</g>`;
    // Harper-style bird perched on the boomerang: circles, a half-circle wing, triangles
    const bx = 214, by = 76;
    const body = `<path d="${mcCut(ellipsePts(bx, by, 30, 30, 0, 40), rnd, 6, 0.6)}" fill="${per}"/>`;
    const head = `<path d="${mcCut(ellipsePts(bx + 26, by - 30, 15, 15, 0, 30), rnd, 5, 0.5)}" fill="${per}"/>`;
    const tail = `<path d="${mcCut([[bx - 22, by + 6], [bx - 74, by - 22], [bx - 62, by + 18]], rnd, 6, 0.6)}" fill="${ink}"/>`;
    const wingPts = Array.from({ length: 17 }, (_, i) => { const a = Math.PI * i / 16; return [bx - 4 + Math.cos(a) * 26, by + 2 + Math.sin(a) * 26]; });
    const wing = `<clipPath id="${id}w"><path d="${mcCut(wingPts, rnd, 6, 0.5)}"/></clipPath><g clip-path="url(#${id}w)" transform="rotate(-24 ${bx} ${by})"><rect x="${bx - 32}" y="${by}" width="60" height="30" fill="${paper}"/>${Array.from({ length: 5 }, (_, i) => `<rect x="${bx - 30}" y="${f1(by + 3 + i * 5.6)}" width="60" height="2.8" fill="${ink}"/>`).join('')}</g>`;
    const beak = `<path d="${mcCut([[bx + 39, by - 34], [bx + 58, by - 29], [bx + 40, by - 25]], rnd, 4, 0.3)}" fill="${ink}"/>`;
    const eye = `<circle cx="${bx + 30}" cy="${by - 32}" r="4.4" fill="${paper}"/><circle cx="${bx + 31}" cy="${by - 32}" r="2.2" fill="${ink}"/>`;
    const legs = `<path d="M${bx - 4} ${by + 26}l-3 13M${bx + 8} ${by + 25}l2 12" stroke="${ink}" stroke-width="3" stroke-linecap="square"/>`;
    // molecule
    const mol = `<path d="M36 44L66 64M66 64L100 50M66 64L62 98" stroke="${ink}" stroke-width="3.2"/>`
      + `<circle cx="36" cy="44" r="10" fill="${acc}"/><circle cx="100" cy="50" r="8" fill="${sec}"/><circle cx="66" cy="64" r="13" fill="${ink}"/><circle cx="62" cy="98" r="7" fill="${pp}"/>`;
    // seal with the initial
    const seal = starburst(84, 236, 34, 45, 16, ink, rnd)
      + `<text x="84" y="247" text-anchor="middle" font-family="var(--ab-font-h, Jost, sans-serif)" font-weight="600" font-size="31" letter-spacing="1" fill="${paper}">${escapeHtml(ctx.initial || '')}</text>`;
    const sparks = sparkle(372, 180, 20, acc, true, 8) + sparkle(160, 32, 11, ink, false) + sparkle(168, 222, 12, acc, false, 15)
      + sparkle(392, 40, 14, per, true) + sparkle(250, 186, 7, paper, false);
    return `<svg class="mc-art" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="presentation" focusable="false" style="display:block;width:100%;height:100%">
      ${kidney}${sun}${boomer}
      ${atom(300, 128, 46, acc, ink, 3.4)}
      ${mol}${seal}${tail}${body}${wing}${head}${beak}${eye}${legs}${sparks}
    </svg>`;
  },

  materials: [
    { name: 'Cut plane', css: 'background: {primary}; border-radius: 58% 42% 55% 45% / 46% 60% 40% 54%; /* flat paper, no outline, no shadow, no grain; edges sampled every 6-8px and each vertex nudged 0.5-1px like a scissor cut */' },
    { name: 'Layered', css: 'background: {primary}; box-shadow: -8px 7px 0 {secondary}; /* a second-colour plane stacked under the first, cream showing round both */' },
    { name: 'Printed', css: 'background: {primary}; /* plus one concave 4-point sparkle in the accent pinned at a corner */' },
    { name: 'Skewed action', css: 'background: {primary}; color: #F3EAD7; transform: skewX(-10deg); text-transform: uppercase; letter-spacing: .14em; /* skew the paper plane, never the label */' },
    { name: 'Kidney panel', css: 'background: {secondary}; border-radius: 62% 38% 46% 54% / 58% 44% 56% 42%; transform: rotate(-6deg); /* an asymmetric plane behind rectangular content, bleeding past it */' },
    { name: 'Period ink', css: 'background: {period}; /* mustard #E0A526 or teal #1F7A7A, whichever is farther from the primary; at most 15% of a view */' },
  ],

  rules: {
    do: [
      'Build every image from flat, slightly rough-cut shapes: circles, half-circles, triangles, boomerangs and kidneys; put one stripe or dot pattern inside one shape.',
      'Pair tracked geometric capitals with exactly one slanted brush-script word per view.',
      'Keep cream paper showing between stacked planes, and tilt secondary elements on a 12-15 degree diagonal.',
      'Use the atomic kit as punctuation: concave sparkles, an atom, a starburst seal, a molecule; never as wallpaper.',
      'Skew the paper plane of a button, never its label.',
    ],
    dont: [
      'Add diner, rocket, jukebox, poodle or Mad Men clip-art.',
      'Draw outlines, add grain, misregistration or multiply overprint (that is Riso), or console bezels (Retro-futurist).',
      'Use more than four inks, a rainbow, or Memphis squiggles.',
      'Copy Saul Bass title sequences or Harper\'s animals; build new ones from the same primitives.',
    ],
  },

  deck: {
    marks: (ctx, kind) => `<i class="mc-mk" data-k="${kind === 'do' ? 'do' : 'dont'}"></i>`,
    principles: [
      ['Cut it from coloured paper', 'Every image is flat, slightly rough-cut shapes.'],
      ['Sparkles, orbits, boomerangs', 'A small set of atomic motifs repeats with intent.'],
      ['Optimism with restraint', 'Cream paper shows between the planes.'],
    ],
    do: [
      'Build every image from flat, slightly rough-cut shapes.',
      'Pair tracked geometric caps with one script word.',
      'Keep cream paper showing between the planes.',
    ],
    dont: [
      'Add diner, rocket or jukebox clip-art.',
      'Use outlines, grain or misregistration.',
      'Use more than four inks.',
    ],
  },
});
})();
