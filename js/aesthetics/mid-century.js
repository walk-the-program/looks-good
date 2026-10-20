/* 41 Mid-Century — mid-century modern and atomic-age graphic design in cut paper. References:
   Charley Harper (flat colour, minimal realism), Saul Bass (cut-paper shapes), Alexander Girard
   (folk-modern colour blocks and dots), Googie starbursts, boomerangs and atoms.

   Mechanism. The hero is ONE cut-paper poster on cream: a sunburst in the client primary (the
   poster's main ink), a mustard sun with a walnut atom over it, a tomato starburst seal with the
   initial, a teal kidney, a sputnik and a boomerang in the secondary. Paper wear is flat SVG only
   (mottling, creases, specks, edge stroke): no CSS masks, filters or gradients on the poster.
   - Colour: cream paper, walnut ink and four fixed period inks: mustard, teal, tomato and olive.
     The client primary prints as the poster ink and fills the main button; printPrimary keeps its
     label readable. Secondary and accent are warmed 6 degrees toward yellow.
   - Interface: cards, panels and lists are cream cut-paper cards with a dotted colour-block header
     band, pill buttons with a starburst, pill switches, pill chips and fill-bar stats. Stat cards in
     the product screens are solid colour blocks. The old green-terminal vars (--mc-crt-*) now hold
     the card's own ink, muted ink and face so css/see-built.css keeps reading them.
   - headline(ctx, text): tracked caps with the last word in heavy slab lettering, in the primary.
     art(ctx) is pure SVG with inline fills (blend donor safe). */
(function () {
// cream paper, walnut ink and the four period inks (each has a label colour that reads on it:
// walnut on mustard and aqua, cream on teal, tomato and olive, all >= 4.8:1)
const CREAM = '#F3EAD7', CHAR = '#2F2018', PAPER = '#F7EDD6', CARD = '#FFFAEE';
const MUSTARD = '#E8A920', TEAL = '#17706F', TOMATO = '#C4411D', OLIVE = '#5F6E2A', AQUA = '#A9D8D0';

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
// a kidney (bean) shape: an ellipse with one dent, as a closed outline
function kidney(cx, cy, rx, ry, rot, n = 44) {
  return Array.from({ length: n }, (_, i) => {
    const t = Math.PI * 2 * i / n;
    let d = Math.abs(((t - Math.PI / 2 + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
    const k = 1 - 0.3 * Math.exp(-(d * d) / 0.32);
    const x = Math.cos(t) * rx * k, y = Math.sin(t) * ry * k, r = rot * Math.PI / 180;
    return [cx + x * Math.cos(r) - y * Math.sin(r), cy + x * Math.sin(r) + y * Math.cos(r)];
  });
}
// a sputnik: a ball with thin spokes tipped by dots
function sputnik(x, y, r, spoke, fill, w) {
  let g = '';
  for (let i = 0; i < 12; i++) {
    const a = Math.PI * i / 6 + 0.26, l = i % 2 ? spoke * 0.78 : spoke;
    const ex = x + Math.cos(a) * l, ey = y + Math.sin(a) * l;
    g += `<path d="M${f1(x)} ${f1(y)}L${f1(ex)} ${f1(ey)}" stroke="${fill}" stroke-width="${w}" stroke-linecap="round"/><circle cx="${f1(ex)}" cy="${f1(ey)}" r="${f1(w * 1.1)}" fill="${fill}"/>`;
  }
  return g + `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
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
    g += `<circle cx="${f1(rnd() * 400)}" cy="${f1(rnd() * 400)}" r="${f1(0.6 + rnd() * 1.6)}" fill="${PAPER}" opacity="${f2(0.6 + rnd() * 0.4)}"/>`;
  }
  for (let i = 0; i < 22; i++) {
    g += `<circle cx="${f1(rnd() * 400)}" cy="${f1(rnd() * 400)}" r="${f1(0.5 + rnd() * 1.2)}" fill="${CHAR}" opacity="${f2(0.15 + rnd() * 0.15)}"/>`;
  }
  return g + '<rect x="3" y="3" width="394" height="394" fill="none" stroke="#6B4E24" stroke-width="8" opacity=".16"/>';
}
const uri = svg => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

function mcFonts() {
  if (typeof window === 'undefined' || !window.loadFontFamily || typeof FONTS === 'undefined') return;
  ['Alfa Slab One'].forEach(n => {
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
  name: 'Mid-Century',
  descriptor: 'Playful · Cut-paper · Atomic optimism',
  influences: 'Charley Harper / Saul Bass / Alexander Girard / Googie',
  summary: 'Mid-century modern in cut paper: cream paper, mustard, teal and tomato colour blocks, starbursts and atoms, with pill buttons, dotted card headers and fill-bar stats for the interface.',
  motto: 'Keep it simple, keep it sunny.',
  kicker: 'Modern living, 1958 edition',
  mode: 'light',
  slideShape: 'classic',
  labels: { material: 'Cut paper', states: ['Rest', 'Hover', 'Pressed'], statesKind: 'chip' },
  // Editable specimen copy (Brand > Advanced > Specimen copy).
  copy: {
    motto: { label: 'Motto', text: 'Keep it simple, keep it sunny.' },
    kicker: { label: 'Kicker above the headline', text: 'Modern living, 1958 edition' },
    state0: { label: 'State 1 name', text: 'Rest' },
    state1: { label: 'State 2 name', text: 'Hover' },
    state2: { label: 'State 3 name', text: 'Pressed' },
  },
  layout: { hero: 'split', palette: 'swatches', sections: 'asym', subcopy: true },
  type: { ui: 'body', label: 'heading', display: 1 },
  highlight: 'custom',
  highlightNote: 'The headline is tracked geometric caps with its last word set in heavy slab lettering, in the primary. One slab word per view, never more.',
  cardFill: '--mc-card',

  roles: {
    canvas: {
      use: 'Cream paper #F3EAD7 behind everything. Dark mode is deep walnut-brown paper from the client dark',
      never: 'Gradients, grain or texture on the canvas itself',
      coverage: '50–60%',
    },
    ink: {
      use: 'Walnut #2F2018 (cream on dark): headlines, card outlines, rules, the atom linework. Never pure black',
      never: 'Drop shadows, fills larger than a bar',
      coverage: '15%',
    },
    primary: {
      use: 'The poster main ink and the main pill button: the sunburst rays, the headline slab word and the one primary action. Printed warmed 6 degrees toward yellow, then moved in lightness until its label reads at 4.5:1',
      never: 'Body text, more than one big fill per view',
      coverage: '≈15%',
    },
    secondary: {
      use: 'The boomerang on the poster, the second electron and soft supporting shapes. Warmed like the primary',
      never: 'The main action, body text',
      coverage: '≈10%',
    },
    accent: {
      use: 'Sparkles, the starburst bullets and one small star per view. Warmed like the primary. The period inks (mustard, teal, tomato, olive) are fixed and carry the colour blocks',
      never: 'Buttons, body text, large fills',
      coverage: '≤5% (+ period inks ≈15%)',
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
    mcFonts();
    const d = t.isDark;
    const ink = d ? CREAM : CHAR;
    const pp = t.printPrimary || mcPrint(t.primary);
    const sec = mcWarm(t.secondary), acc = mcWarm(t.accent);
    const card = d ? t.mix('#FFFFFF', t.canvas, 0.07) : CARD;
    const paper2 = d ? t.mix('#FFFFFF', t.canvas, 0.12) : t.mix(CHAR, CREAM, 0.07);
    let toward = 0.4, muted = t.mix(t.canvas, ink, toward);
    while (toward > 0.05 && Math.min(t.contrast(muted, t.canvas), t.contrast(muted, card), t.contrast(muted, paper2)) < 4.6) { toward -= 0.04; muted = t.mix(t.canvas, ink, toward); }
    // script word: the primary when it reads (3:1) on the paper, else secondary or ink
    const script = t.contrast(pp, t.canvas) >= 3 ? pp : (t.contrast(sec, t.canvas) >= 3 ? sec : ink);
    // small list numerals (11px) keep the script colour only when it reaches 4.5:1
    const num = t.contrast(script, t.canvas) >= 4.5 ? script : ink;
    const plane = t.mix(ink, card, d ? 0.12 : 0.09);
    const spark = (fill, s = 14) => uri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" width="${s}" height="${s}">${sparkle(s / 2, s / 2, s * 0.42, fill, false)}</svg>`);
    const burst = (fill) => uri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">${starburst(20, 20, 14.5, 19.5, 12, fill, mcRand(7))}</svg>`);
    const star = (fill) => uri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40"><path d="M20 1L25 15L39 20L25 25L20 39L15 25L1 20L15 15Z" fill="${fill}"/></svg>`);
    const onMust = CHAR, onTeal = '#FFF7E6';
    return {
      '--ab-ink': ink,
      '--ab-muted': muted,
      '--ab-line': t.mix(t.canvas, ink, 0.82),
      '--ab-type-pick-w': 400,
      '--ab-period': MUSTARD,
      '--mc-ink': ink,
      '--mc-card': card,
      '--mc-paper2': paper2,
      '--mc-plane': plane,
      '--mc-sec': sec, '--mc-acc': acc,
      '--mc-mustard': MUSTARD, '--mc-teal': TEAL, '--mc-tomato': TOMATO, '--mc-olive': OLIVE, '--mc-aqua': AQUA,
      '--mc-on-mustard': onMust, '--mc-on-aqua': onMust, '--mc-on-teal': onTeal, '--mc-on-tomato': onTeal, '--mc-on-olive': onTeal,
      '--mc-pri': pp,
      '--mc-on-pri': mcOn(pp), '--mc-on-sec': mcOn(sec), '--mc-on-ink': d ? CHAR : CREAM,
      '--mc-script': script, '--mc-num': num,
      '--mc-spark-acc': spark(acc),
      '--mc-spark-tomato': spark(d ? '#E8704A' : TOMATO),
      '--mc-burst-ink': burst(ink),
      '--mc-burst-btn': burst(t.contrast(pp, MUSTARD) >= 1.8 ? MUSTARD : '#FFF7E6'),
      '--mc-star-cream': star('#FFF7E6'),
      // css/see-built.css still reads the old terminal vars for the text and chart inside cards:
      // they now hold the card's own ink, muted ink and face
      '--mc-crt-bg': card, '--mc-crt-ink': ink, '--mc-crt-dim': muted,
    };
  },

  art(ctx) {
    mcFonts();
    const t = ctx.t;
    const pp = t.printPrimary || mcPrint(t.primary);
    const sec = mcWarm(t.secondary), acc = mcWarm(t.accent);
    const rnd = mcRand(mcHash(String(ctx.brandName || 'brand') + '|mc'));
    const cx = 206, cy = 190;
    // sunburst: twelve wedges of the primary alternate with paper, radiating past the edges
    let rays = '';
    for (let i = 0; i < 24; i += 2) {
      const a0 = -Math.PI / 2 + i * Math.PI / 12, a1 = a0 + Math.PI / 12;
      const pts = [[cx, cy], [cx + Math.cos(a0) * 420, cy + Math.sin(a0) * 420], [cx + Math.cos(a1) * 420, cy + Math.sin(a1) * 420]];
      rays += `<path d="${mcCut(pts, rnd, 60, 0.8)}" fill="${pp}"/>`;
    }
    // mustard sun with a cream ring and a dotted ring, like a Girard print
    const sun = `<circle cx="${cx}" cy="${cy}" r="100" fill="${MUSTARD}"/>`
      + `<circle cx="${cx}" cy="${cy}" r="84" fill="none" stroke="#FFF3D2" stroke-width="3" stroke-dasharray="1 9" stroke-linecap="round"/>`;
    // atom over the sun: walnut orbits and nucleus, electrons in the secondary, primary and accent
    const R = 134;
    const atomArt = atom(cx, cy, R, CHAR, CHAR, 5.5)
      + orbitDot(cx, cy, R, R * 0.36, 0, 1.1, 9, sec)
      + orbitDot(cx, cy, R, R * 0.36, 60, 2.6, 9, pp)
      + orbitDot(cx, cy, R, R * 0.36, 120, 4.0, 9, acc);
    // tomato starburst seal with the initial (Googie)
    const seal = starburst(70, 66, 30, 41, 14, TOMATO, rnd)
      + `<text x="70" y="77" text-anchor="middle" font-family="var(--ab-font-h, sans-serif)" font-weight="700" font-size="30" fill="#FFF7E6">${escapeHtml(ctx.initial || '')}</text>`;
    // a teal kidney with an aqua orbit, a mustard dot trio and an olive leaf (bottom left)
    const kid = `<path d="${mcCut(kidney(86, 322, 64, 40, -14), rnd, 8, 0.8)}" fill="${TEAL}"/>`
      + `<path d="${mcCut(kidney(86, 322, 40, 22, -14), rnd, 8, 0.6)}" fill="none" stroke="${AQUA}" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round"/>`
      + `<circle cx="64" cy="318" r="7" fill="${MUSTARD}"/><circle cx="90" cy="326" r="5" fill="${AQUA}"/><circle cx="110" cy="312" r="4" fill="${MUSTARD}"/>`
      + `<path d="${mcCut(ellipsePts(32, 372, 28, 10, -38, 28), rnd, 8, 0.6)}" fill="${OLIVE}"/>`;
    // a sputnik, bottom right of the sun
    const spu = sputnik(332, 336, 9, 27, CHAR, 2.6);
    // boomerang in the secondary, bleeding off the bottom right
    const outer = bez([92, 122], [330, -40], [470, 300], 30);
    const inner = bez([470, 300], [330, 150], [112, 158], 30).slice(1, -1);
    const boomer = `<path transform="translate(196 292) scale(0.5)" d="${mcCut(outer.concat(inner, [[100, 160], [86, 146]]), rnd, 7, 0.9)}" fill="${sec}"/>`;
    const sparks = sparkle(354, 58, 18, acc, true, 8) + sparkle(150, 372, 10, CHAR, false);
    return `<svg class="mc-art" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="presentation" focusable="false" style="display:block;width:100%;height:100%">
      <rect width="400" height="400" fill="${PAPER}"/>
      ${rays}${sun}${atomArt}${seal}${kid}${boomer}${spu}${sparks}${wear(rnd)}
    </svg>`;
  },

  materials: [
    { name: 'Cut paper', css: 'background: #FFFAEE; border: 2px solid #2F2018; border-radius: 20px 20px 20px 4px; /* cream card, walnut outline, one cut corner; no shadow */' },
    { name: 'Colour block', css: 'background: #E8A920; color: #2F2018; /* mustard, teal #17706F, tomato #C4411D or olive #5F6E2A; flat, no gradient */' },
    { name: 'Dotted band', css: 'background: radial-gradient(circle, rgba(255,255,255,.55) 2px, transparent 2.5px) 0 0 / 14px 14px, #E8A920; /* the card header */' },
    { name: 'Pill button', css: 'background: {primary}; border: 2px solid #2F2018; border-radius: 999px; /* a mustard starburst at the right end */' },
    { name: 'Pill switch', css: 'border: 2px solid #2F2018; border-radius: 999px; /* on: teal track, cream knob */' },
    { name: 'Fill bar', css: 'height: 12px; border-radius: 999px; background: #2F20181F; /* the fill is a period ink, one colour per row */' },
  ],

  rules: {
    do: [
      'Build the poster from flat cut-paper shapes: sunbursts, atoms, starbursts, kidneys, boomerangs and sputniks on cream.',
      'Use the four period inks (mustard, teal, tomato, olive) as flat colour blocks; the client primary is the one main ink and the main action.',
      'Make buttons, chips and switches pills, and cards cream with a walnut outline, one cut corner and a dotted colour header.',
      'Set labels in tracked geometric caps and numerals in bold slab or geometric type; one slab word per headline.',
      'Show progress as fill bars and numbers, with a starburst or dot as the bullet.',
    ],
    dont: [
      'Use black, neon, glass, gradients, drop shadows or a terminal look; this is warm paper, not a screen.',
      'Copy the work of Harper, Bass or Girard; build new shapes in the same flat, geometric spirit.',
      'Use CSS masks, gradients or grain for paper wear; the wear is flat SVG.',
      'Use more than four inks beside the cream and walnut on one view, or a rainbow.',
    ],
  },

  deck: {
    marks: (ctx, kind) => `<i class="mc-mk" data-k="${kind === 'do' ? 'do' : 'dont'}"></i>`,
    principles: [
      ['Cut-paper shapes', 'Flat starbursts, atoms and kidneys, edges a little rough.'],
      ['Colour blocks', 'Mustard, teal, tomato and olive on cream, in flat fills.'],
      ['Playful and optimistic', 'Pills, dots and starbursts keep the interface friendly.'],
    ],
    do: [
      'Build with flat cut-paper shapes on cream paper.',
      'Use mustard, teal, tomato and olive as colour blocks.',
      'Round every button into a pill and give cards one cut corner.',
    ],
    dont: [
      'Add gradients, shadows, glass or a terminal look.',
      'Add masks, gradients or grain to the paper.',
      'Use more than four inks on a poster.',
    ],
  },
});
})();
