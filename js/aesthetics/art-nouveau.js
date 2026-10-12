/* 42 Art Nouveau — whiplash, botanical, framed. References: the Mucha Foundation's poster
   frames (a curvilinear border that sweeps into an arch, a star field, cream / salmon /
   grey-violet), Guimard's Métro entrances (cast-iron stems, organic lettering), Beardsley's
   flat masses and hairlines, Horta's whiplash ironwork, Will H. Bradley's framed panels, the
   Vienna Secession's mosaic bands, Jugendstil, Liberty prints.

   Mechanism. Ornament FRAMES the content and never covers it. Every line grows like a stem:
   a cubic curve whose curvature accelerates into a spiral, bud or leaf, drawn as a FILLED
   tapered polygon (1 -> 4 -> 1 px), never a uniform stroke. Content sits in round-arched
   panels (round arches only; ogives are Religious Futurism), a halo disc with a ring band of
   dots and a thin gold ring sits behind the key art, titles sit in cartouches with concave
   corner notches, a Secession mosaic strip runs along the base.
   - Colour: cream #F1E7D3, olive-brown contour #3B3A2A and gold #C2A05A (thin halo rings
     only) are fixed. Client colours are pushed to a lithograph register (chroma -25%,
     lightness 55-70%, then lifted until olive text reads 4.6:1 on them): primary = the
     dominant flat (arch panel, main action), secondary = stems and leaves, accent = flower
     heads and the halo's inner fill. printPrimary(t) prints the primary that way.
   - tokens(t) draws the cartouche ends, curls, vine, leaves, dividers, medallion ring and
     mosaic tile as SVG data URIs in the contour colour, so the CSS only places them.
   - art(ctx): Mucha without a figure: a tall arched lithograph panel, a halo of dots and
     gold rings, a stylised poppy on a central stem, whiplash stems rising both sides and
     curling over the arch with almond leaves and buds, a star field, a mosaic strip and a
     medallion with the brand initial. Pure SVG with inline fills (blend donor safe). */
(function () {
let seq = 0;
const CREAM = '#F1E7D3', CONTOUR = '#3B3A2A', OLIVE = '#2F2E21', GOLD = '#C2A05A';

function anRand(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function anHash(str) {
  let h = 2166136261;
  const s = String(str);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
const f1 = n => String(Math.round(n * 10) / 10);
const uri = svg => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

// lithograph register: chroma -25%, lightness into 55-70%, then lifted so olive text reads
function anLitho(hex) {
  const c = hexToHsl(hex);
  let l = Math.max(55, Math.min(70, c.l));
  const s = c.s * 0.75;
  let out = hslToHex(c.h, s, l);
  for (let i = 0; i < 30 && contrastRatio(out, OLIVE) < 4.6; i++) { l = Math.min(92, l + 1.5); out = hslToHex(c.h, s, l); }
  return out;
}
// the same hue deepened until it reads 3:1 on the paper (stems, the highlight word)
function anDeep(hex, bg) {
  const c = hexToHsl(hex);
  const dark = contrastRatio('#000000', bg) > contrastRatio('#FFFFFF', bg);
  let l = c.l, out = hslToHex(c.h, c.s * 0.8, l);
  for (let i = 0; i < 60 && contrastRatio(out, bg) < 3.2; i++) { l = dark ? Math.max(4, l - 1.5) : Math.min(96, l + 1.5); out = hslToHex(c.h, c.s * 0.8, l); }
  return out;
}

const cubic = (p0, p1, p2, p3, n) => Array.from({ length: n + 1 }, (_, i) => {
  const u = i / n, v = 1 - u;
  return [v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0],
    v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1]];
});
// a whiplash: a cubic stem that runs into a tightening spiral at its end
function whiplash(p0, p1, p2, p3, r0, side, turns = 1.25) {
  const pts = cubic(p0, p1, p2, p3, 28);
  const [ax, ay] = pts[pts.length - 2], [bx, by] = pts[pts.length - 1];
  const L = Math.hypot(bx - ax, by - ay) || 1, tx = (bx - ax) / L, ty = (by - ay) / L;
  const nx = -ty * side, ny = tx * side;
  const cx = bx + nx * r0, cy = by + ny * r0;
  const phi0 = Math.atan2(by - cy, bx - cx);
  const n = 30;
  for (let i = 1; i <= n; i++) {
    const u = i / n, a = phi0 + side * u * turns * Math.PI * 2, r = r0 * (1 - 0.78 * u);
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts;
}
// filled tapered ribbon along a centreline: width w0 -> w1 (at 40%) -> w2
function ribbon(pts, w0, w1, w2) {
  const L = [], R = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    const u = i / (pts.length - 1);
    const w = (u < 0.4 ? w0 + (w1 - w0) * (u / 0.4) : w1 + (w2 - w1) * ((u - 0.4) / 0.6)) / 2;
    L.push([pts[i][0] - dy / l * w, pts[i][1] + dx / l * w]);
    R.push([pts[i][0] + dy / l * w, pts[i][1] - dx / l * w]);
  }
  return 'M' + L.concat(R.reverse()).map(p => f1(p[0]) + ' ' + f1(p[1])).join('L') + 'Z';
}
// almond leaf from base b toward angle a (degrees), length len, width w
function leaf(b, a, len, w, fill, line) {
  const r = a * Math.PI / 180, tx = b[0] + Math.cos(r) * len, ty = b[1] + Math.sin(r) * len;
  const mx = (b[0] + tx) / 2, my = (b[1] + ty) / 2, nx = -Math.sin(r) * w, ny = Math.cos(r) * w;
  return `<path d="M${f1(b[0])} ${f1(b[1])}Q${f1(mx + nx)} ${f1(my + ny)} ${f1(tx)} ${f1(ty)}Q${f1(mx - nx)} ${f1(my - ny)} ${f1(b[0])} ${f1(b[1])}Z" fill="${fill}" stroke="${line}" stroke-width="1.4" stroke-linejoin="round"/>`
    + `<path d="M${f1(b[0])} ${f1(b[1])}Q${f1(mx + nx * 0.2)} ${f1(my + ny * 0.2)} ${f1(tx)} ${f1(ty)}" fill="none" stroke="${line}" stroke-width="0.9" opacity=".7"/>`;
}
function bud(x, y, a, s, fill, line) {
  return `<path d="M0 0C${f1(-5 * s)} ${f1(-4 * s)} ${f1(-4 * s)} ${f1(-12 * s)} 0 ${f1(-15 * s)}C${f1(4 * s)} ${f1(-12 * s)} ${f1(5 * s)} ${f1(-4 * s)} 0 0Z" transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(a)})" fill="${fill}" stroke="${line}" stroke-width="1.3"/>`;
}

registerAesthetic({
  key: 'art-nouveau', order: 42,
  name: 'Art Nouveau',
  descriptor: 'Whiplash · Botanical · Framed',
  influences: 'Mucha / Guimard / Vienna Secession',
  summary: 'Lithograph posters circa 1900: arched frames, halo discs, stems that end in curls and buds.',
  motto: 'Every line grows like a stem.',
  kicker: 'Salon, 1900',
  mode: 'light',
  slideShape: 'classic',
  labels: { material: 'Frames', states: ['Bare', 'Framed', 'Haloed'], statesKind: 'swatch' },
  layout: { hero: 'split', palette: 'swatches', sections: 'two-col', subcopy: true },
  type: { ui: 'body', label: 'body', display: 1 },
  highlight: 'custom',
  highlightNote: 'The highlight word is set in the primary deepened to 3:1 on the paper, with a whiplash flourish drawn under it that ends in a curl at one end and an accent bud at the other; the flourish never touches the next line.',
  cardFill: '--an-card',

  roles: {
    canvas: {
      use: 'Cream lithograph paper #F1E7D3, fixed (a deep olive-brown night in dark mode); a faint star field only inside arched panels',
      never: 'White, gradients, gloss, a dark gilt ground (that is Neo Deco)',
      coverage: '55–65%',
    },
    ink: {
      use: 'Olive-brown: text #2F2E21 and every contour line #3B3A2A (1.5px on panels, cartouches and fields). Never pure black',
      never: 'Pure black, thick uniform outlines, ornament touching body text',
      coverage: '15%',
    },
    primary: {
      use: 'The dominant flat: the arched poster panel, the cartouche of the main action, the selected arch tab. Printed in the lithograph register (chroma -25%, lightness 55-70%)',
      never: 'Saturated fills, gold fills, body text',
      coverage: '≈15%',
    },
    secondary: {
      use: 'Stems and leaves: the whiplash stems, almond leaves, the vine toggle, progress growing as a stem. Deepened to read as a line on cream',
      never: 'The main action, panels, text',
      coverage: '≈10%',
    },
    accent: {
      use: 'Flower heads, buds and the halo\'s inner fill; the bud at the end of the highlight flourish',
      never: 'Buttons, text, borders, gold rings (gold #C2A05A is fixed and only ever a thin halo ring)',
      coverage: '≤5%',
    },
  },

  canvas(b) {
    if (!b.isDark) return CREAM;
    const m = b.mix(b.canvas, '#23221A', 0.4);
    const h = b.hexToHsl(m);
    return b.hslToHex(h.h, Math.min(h.s, 22), Math.max(9, Math.min(h.l, 12)));
  },

  printPrimary(t) { return anLitho(t.primary); },

  tokens(t) {
    const d = t.isDark;
    const ink = d ? '#EFE4CC' : OLIVE;
    const line = d ? '#CDBB93' : CONTOUR;
    const pp = t.printPrimary || anLitho(t.primary);
    const sec = anLitho(t.secondary), acc = anLitho(t.accent);
    const stem = anDeep(t.secondary, t.canvas);
    const hl = anDeep(t.primary, t.canvas);
    const card = d ? t.mix('#FFFFFF', t.canvas, 0.05) : '#F7F0E0';
    let toward = 0.38, muted = t.mix(t.canvas, ink, toward);
    while (toward > 0.05 && t.contrast(muted, t.canvas) < 4.6) { toward -= 0.04; muted = t.mix(t.canvas, ink, toward); }
    const sv = (w, h, body, keep) => uri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"${keep ? '' : ' preserveAspectRatio="none"'}>${body}</svg>`);
    const ns = 'vector-effect="non-scaling-stroke"';
    // cartouche end (left); the right end is the same path mirrored
    const capFill = 'M24 1.5H13C13 5.5 10 8.5 6.5 8.5C3 8.5 1.2 15 1.2 24C1.2 33 3 39.5 6.5 39.5C10 39.5 13 42.5 13 46.5H24Z';
    const capLine = 'M24 1.5H13C13 5.5 10 8.5 6.5 8.5C3 8.5 1.2 15 1.2 24C1.2 33 3 39.5 6.5 39.5C10 39.5 13 42.5 13 46.5H24';
    const cap = (fill, mirror) => sv(24, 48, `<g${mirror ? ' transform="translate(24 0) scale(-1 1)"' : ''}><path d="${capFill}" fill="${fill}"/><path d="${capLine}" fill="none" stroke="${line}" stroke-width="1.5" ${ns}/></g>`);
    const outer = (mirror) => sv(30, 60, `<g${mirror ? ' transform="translate(30 0) scale(-1 1)"' : ''}><path d="M30 2H16C16 7 12 11 8 11C4 11 2 19 2 30C2 41 4 49 8 49C12 49 16 53 16 58H30" fill="none" stroke="${line}" stroke-width="1" ${ns}/><path d="M8 11C3 9 2 4 6 3C9 2.5 10 6 7.5 7" fill="none" stroke="${line}" stroke-width="1" ${ns}/><path d="M8 49C3 51 2 56 6 57C9 57.5 10 54 7.5 53" fill="none" stroke="${line}" stroke-width="1" ${ns}/></g>`);
    const curl = sv(26, 26, `<path d="M25 25C10 25 2 18 2 10C2 4 6 1.5 10 1.5C14 1.5 16 4.5 15.5 7.5C15 10 12.5 11 10.5 10C9 9.2 9 7 10.5 6.6" fill="none" stroke="${line}" stroke-width="1.5" stroke-linecap="round"/>`, true);
    const divPts = whiplash([2, 8], [30, 2], [50, 14], [66, 8], 4.2, -1, 1.1);
    const divider = sv(140, 16, `<path d="${ribbon(divPts, 0.6, 1.8, 0.6)}" fill="${line}"/><g transform="translate(140 0) scale(-1 1)"><path d="${ribbon(divPts, 0.6, 1.8, 0.6)}" fill="${line}"/></g><circle cx="70" cy="8" r="2.4" fill="${acc}" stroke="${line}" stroke-width="1"/>`, true);
    const ornament = sv(120, 20, `<path d="M0 10H38" stroke="${line}" stroke-width="1"/><path d="M82 10H120" stroke="${line}" stroke-width="1"/><path d="${ribbon(whiplash([38, 10], [46, 10], [52, 3], [58, 6], 3.4, 1, 1), 0.6, 2, 0.6)}" fill="${line}"/><g transform="translate(120 0) scale(-1 1)"><path d="${ribbon(whiplash([38, 10], [46, 10], [52, 3], [58, 6], 3.4, 1, 1), 0.6, 2, 0.6)}" fill="${line}"/></g>${bud(60, 15, 0, 0.75, acc, line)}`, true);
    const ring = sv(40, 40, Array.from({ length: 16 }, (_, i) => { const a = Math.PI * 2 * i / 16; return `<circle cx="${f1(20 + Math.cos(a) * 16.5)}" cy="${f1(20 + Math.sin(a) * 16.5)}" r="1.25" fill="${line}"/>`; }).join('') + `<circle cx="20" cy="20" r="19" fill="none" stroke="${GOLD}" stroke-width="1"/>`, true);
    const vine = sv(72, 32, `<path d="M3 17C14 6 24 27 36 16S58 6 69 16" fill="none" stroke="${stem}" stroke-width="2" stroke-linecap="round"/>` + leaf([20, 15], -120, 9, 3.2, 'none', stem) + leaf([50, 15], 60, 9, 3.2, 'none', stem), true);
    const lf = (fill) => sv(30, 30, leaf([4, 26], -45, 30, 8.5, fill, line), true);
    const stemTile = sv(28, 16, `<path d="M0 10H28" stroke="${stem}" stroke-width="1.8"/>` + leaf([10, 10], -40, 11, 3.6, sec, line), true);
    const budEnd = sv(16, 26, `<path d="M2 24C6 20 8 16 8 12" fill="none" stroke="${stem}" stroke-width="1.6"/>` + bud(8, 13, 0, 0.8, acc, line), true);
    const ctaBud = (col) => sv(30, 16, `<path d="M1 8H18" stroke="${col}" stroke-width="1.4"/><path d="${ribbon(whiplash([10, 8], [16, 8], [20, 3], [24, 5], 2.4, 1, 0.9), 0.5, 1.6, 0.5)}" fill="${col}"/><circle cx="27" cy="8" r="2.2" fill="${col}"/>`, true);
    const sideStem = (mirror) => {
      const p = whiplash([10, 236], [2, 160], [24, 90], [12, 30], 7, 1, 1.15);
      return sv(40, 240, `<g${mirror ? ' transform="translate(40 0) scale(-1 1)"' : ''}><path d="${ribbon(p, 1, 3.4, 0.8)}" fill="${stem}"/>${leaf([8, 170], -150, 22, 6, sec, line)}${leaf([14, 120], -30, 20, 5.5, sec, line)}${bud(12, 20, 160, 0.8, acc, line)}</g>`, true);
    };
    const sq = [pp, sec, acc, CREAM];
    let mos = '';
    for (let i = 0; i < 8; i++) {
      const c = sq[(i * 3 + (i >> 1)) % 4];
      mos += i % 2 ? `<path d="M${i * 8} 10L${i * 8 + 4} 2L${i * 8 + 8} 10Z" fill="${c}" stroke="${line}" stroke-width=".8"/>` : `<rect x="${i * 8 + 0.8}" y="2.8" width="6.4" height="6.4" fill="${c}" stroke="${line}" stroke-width=".8"/>`;
    }
    const mosaic = sv(64, 12, `<path d="M0 .6H64M0 11.4H64" stroke="${line}" stroke-width="1"/>${mos}`, true);
    return {
      '--ab-ink': ink,
      '--ab-muted': muted,
      '--ab-line': t.mix(t.canvas, line, 0.7),
      '--ab-type-pick-w': 400,
      '--an-ink': ink, '--an-line': line, '--an-olive': OLIVE, '--an-gold': GOLD,
      '--an-card': card, '--an-sec': sec, '--an-acc': acc, '--an-stem': stem, '--an-hl': hl,
      '--an-halo': t.mix(acc, t.canvas, 0.4),
      '--an-cap-l': cap(pp, false), '--an-cap-r': cap(pp, true),
      '--an-capc-l': cap(card, false), '--an-capc-r': cap(card, true),
      '--an-capk-l': cap(t.canvas, false), '--an-capk-r': cap(t.canvas, true),
      '--an-frame-l': outer(false), '--an-frame-r': outer(true),
      '--an-curl': curl, '--an-divider': divider, '--an-ornament': ornament, '--an-ring': ring,
      '--an-vine': vine, '--an-leaf-off': lf('none'), '--an-leaf-on': lf(sec),
      '--an-stem-tile': stemTile, '--an-bud': budEnd, '--an-cta-bud': ctaBud(OLIVE),
      '--an-side-l': sideStem(false), '--an-side-r': sideStem(true), '--an-mosaic': mosaic,
      '--ab-gold': GOLD,
    };
  },

  art(ctx) {
    const t = ctx.t;
    const d = t.isDark;
    const line = d ? '#CDBB93' : CONTOUR;
    const pp = t.printPrimary || anLitho(t.primary);
    const sec = anLitho(t.secondary), acc = anLitho(t.accent);
    const stem = anDeep(t.secondary, pp);
    const paper = d ? '#E9DDC3' : CREAM;
    const halo = t.mix(acc, paper, 0.16);
    const rnd = anRand(anHash(String(ctx.brandName || 'brand') + '|an'));
    const id = 'anc' + (++seq);
    const W = 300, X0 = 18, X1 = 282, AY = 150, R = (X1 - X0) / 2, CX = 150, BOT = 412;
    const arch = `M${X0} ${BOT}V${AY}A${R} ${R} 0 0 1 ${X1} ${AY}V${BOT}Z`;
    const archIn = `M${X0 + 9} ${BOT - 32}V${AY}A${R - 9} ${R - 9} 0 0 1 ${X1 - 9} ${AY}V${BOT - 32}`;
    // star field inside the arch
    let stars = '';
    for (let i = 0; i < 26; i++) {
      const x = 34 + rnd() * 232, y = 34 + rnd() * 150;
      if (Math.hypot(x - CX, y - 168) < 112) continue;
      const s = 1.2 + rnd() * 1.8;
      stars += `<path d="M${f1(x)} ${f1(y - s * 2)}Q${f1(x)} ${f1(y)} ${f1(x + s * 2)} ${f1(y)}Q${f1(x)} ${f1(y)} ${f1(x)} ${f1(y + s * 2)}Q${f1(x)} ${f1(y)} ${f1(x - s * 2)} ${f1(y)}Q${f1(x)} ${f1(y)} ${f1(x)} ${f1(y - s * 2)}Z" fill="${paper}" opacity=".75"/>`;
    }
    // halo: inner fill, ring band of dots, two thin gold rings
    const HY = 166, HR = 92;
    let dots = '';
    for (let i = 0; i < 44; i++) { const a = Math.PI * 2 * i / 44; dots += `<circle cx="${f1(CX + Math.cos(a) * (HR + 8))}" cy="${f1(HY + Math.sin(a) * (HR + 8))}" r="2.3" fill="${paper}" stroke="${line}" stroke-width=".8"/>`; }
    const haloSvg = `<circle cx="${CX}" cy="${HY}" r="${HR + 15}" fill="${t.mix(pp, '#000000', 0.88)}"/><circle cx="${CX}" cy="${HY}" r="${HR}" fill="${halo}" stroke="${line}" stroke-width="1.5"/>${dots}<circle cx="${CX}" cy="${HY}" r="${HR + 15}" fill="none" stroke="${GOLD}" stroke-width="1.6"/><circle cx="${CX}" cy="${HY}" r="${HR - 7}" fill="none" stroke="${GOLD}" stroke-width="1"/>`;
    // whiplash stems rising both sides of the arch, curling over the top
    const side = (m) => {
      const S = p => [m ? W - p[0] : p[0], p[1]];
      const pts = whiplash(S([44, BOT - 30]), S([26, 300]), S([66, 190]), S([46, 96]), 13, m ? -1 : 1, 1.3);
      let g = `<path d="${ribbon(pts, 1.8, 6.6, 1.2)}" fill="${stem}" stroke="${line}" stroke-width=".8"/>`;
      const p2 = whiplash(S([52, BOT - 30]), S([74, 330]), S([40, 280]), S([70, 236]), 8, m ? 1 : -1, 1.1);
      g += `<path d="${ribbon(p2, 1.2, 4.2, 0.9)}" fill="${stem}" stroke="${line}" stroke-width=".6"/>`;
      g += leaf(S([36, 318]), m ? -30 : -150, 34, 9, sec, line) + leaf(S([50, 250]), m ? -140 : -40, 30, 8, sec, line)
        + leaf(S([42, 168]), m ? -20 : -160, 26, 7, sec, line);
      const e = p2[p2.length - 1];
      g += bud(e[0], e[1] - 2, m ? 20 : -20, 1, acc, line);
      return g;
    };
    // central stem and a stylised poppy over the halo
    const cst = cubic([CX, BOT - 30], [CX - 10, 330], [CX + 12, 270], [CX, 214], 24);
    let poppy = `<path d="${ribbon(cst, 2.6, 4.2, 2)}" fill="${stem}" stroke="${line}" stroke-width=".8"/>`;
    poppy += leaf([CX - 2, 316], -150, 44, 11, sec, line) + leaf([CX + 2, 290], -28, 40, 10, sec, line);
    [[-46, 34, 30], [46, 34, 30], [0, 36, 28]].forEach(([a, rx, ry]) => {
      poppy += `<ellipse cx="${CX + a * 0.62}" cy="${HY + 22 - Math.abs(a) * 0.15}" rx="${rx}" ry="${ry}" transform="rotate(${a * 0.6} ${CX + a * 0.62} ${HY + 22})" fill="${acc}" stroke="${line}" stroke-width="1.5"/>`;
    });
    poppy += `<path d="M${CX - 30} ${HY + 10}Q${CX} ${HY - 26} ${CX + 30} ${HY + 10}" fill="${t.mix(acc, line, 0.72)}" stroke="${line}" stroke-width="1.5"/>`;
    for (let i = 0; i < 7; i++) { const a = Math.PI * (1.15 + i * 0.12); poppy += `<path d="M${CX} ${HY + 12}L${f1(CX + Math.cos(a) * 26)} ${f1(HY + 12 + Math.sin(a) * 22)}" stroke="${line}" stroke-width="1"/><circle cx="${f1(CX + Math.cos(a) * 27)}" cy="${f1(HY + 12 + Math.sin(a) * 23)}" r="1.8" fill="${line}"/>`; }
    // mosaic strip and a medallion with the initial
    let mos = '';
    const mc = [pp, sec, acc, paper];
    for (let i = 0; i < 33; i++) {
      const x = X0 + i * 8, c = mc[(i * 5 + (i >> 2)) % 4];
      mos += i % 2 ? `<path d="M${x} ${BOT - 9}L${x + 4} ${BOT - 19}L${x + 8} ${BOT - 9}Z" fill="${c}" stroke="${line}" stroke-width=".7"/>` : `<rect x="${x + 0.6}" y="${BOT - 18.4}" width="6.8" height="8.8" fill="${c}" stroke="${line}" stroke-width=".7"/>`;
    }
    const strip = `<rect x="${X0}" y="${BOT - 22}" width="${X1 - X0}" height="22" fill="${paper}"/>${mos}<path d="M${X0} ${BOT - 22}H${X1}M${X0} ${BOT - 6}H${X1}" stroke="${line}" stroke-width="1.2"/>`;
    const medal = `<circle cx="${CX}" cy="${BOT - 34}" r="22" fill="${paper}" stroke="${line}" stroke-width="1.5"/><circle cx="${CX}" cy="${BOT - 34}" r="17.5" fill="none" stroke="${GOLD}" stroke-width="1"/><text x="${CX}" y="${BOT - 26}" text-anchor="middle" font-family="var(--ab-font-h, Federant, Georgia, serif)" font-size="23" fill="${OLIVE}">${escapeHtml(ctx.initial || '')}</text>`;
    return `<svg class="an-art" viewBox="0 0 ${W} 420" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="presentation" focusable="false" style="display:block;width:100%;height:100%">
      <defs><clipPath id="${id}"><path d="${arch}"/></clipPath></defs>
      <path d="${arch}" fill="${pp}"/>
      <g clip-path="url(#${id})">${stars}${haloSvg}</g>
      <path d="${archIn}" fill="none" stroke="${line}" stroke-width="1"/>
      <path d="${arch}" fill="none" stroke="${line}" stroke-width="2"/>
      ${poppy}${side(false)}${side(true)}${strip}${medal}
    </svg>`;
  },

  materials: [
    { name: 'Lithograph flat', css: 'background: {primary}; color: #2F2E21; /* client colour at chroma -25%, lightness 55-70%; flat, no gradient, no gloss */' },
    { name: 'Contour line', css: 'border: 1.5px solid #3B3A2A; /* olive-brown, never black; ornament lines are filled tapered polygons 1 -> 4 -> 1px */' },
    { name: 'Cartouche', css: 'background: {primary}; /* a label with concave notched corners and convex ends, 1.5px contour; titles and the main action */' },
    { name: 'Round arch panel', css: 'border: 1.5px solid #3B3A2A; border-radius: 50% 50% 0 0 / 96px 96px 0 0; /* plus an inner hairline 6px inside; round arches only, never pointed */' },
    { name: 'Halo ring', css: 'border: 1px solid {gold}; border-radius: 50%; /* thin gold ring round a disc of the accent, with a band of dots; gold is never a fill */' },
    { name: 'Mosaic strip', css: 'height: 12px; /* Secession band of small squares and triangles in the litho colours along a base edge */' },
  ],

  rules: {
    do: [
      'End every flourish in a curl, bud or spiral; draw ornament lines as filled tapered strokes (1 -> 4 -> 1px).',
      'Put content in round-arched panels and titles in cartouches; let stems frame the panel, never cross the content.',
      'Push client colours to a lithograph register (chroma -25%, lightness 55-70%) and edge flats with an olive-brown contour.',
      'Use thin gold only for halo rings, and a Secession mosaic strip only along a base edge.',
      'Set display lines in period sign lettering with generous tracking; keep body copy in a classic book face.',
    ],
    dont: [
      'Use stepped geometric frames, sunburst fans or gilt on dark; that is Neo Deco.',
      'Draw figures or Mucha portrait pastiche, or pointed ogive arches (Religious Futurism).',
      'Let ornament touch body text, or use saturated colour and gold fills.',
      'Set body copy in the display face, or any geometric sans.',
    ],
  },

  deck: {
    marks: (ctx, kind, i) => `<i class="an-mk" data-k="${kind === 'do' ? 'do' : 'dont'}">${['I', 'II', 'III'][i] || ''}</i>`,
    principles: [
      ['Every line grows like a stem', 'Stems end in curls, buds and spirals.'],
      ['Frame it, then let it flow', 'Content sits in an arch; ornament curves around it.'],
      ['Muted lithograph colour', 'Flat, soft hues with a dark contour line.'],
    ],
    do: [
      'End every flourish in a curl, bud or spiral.',
      'Put the headline in a cartouche, art in a halo.',
      'Use thin gold only for halo rings.',
    ],
    dont: [
      'Use stepped geometric frames; that\'s Neo Deco.',
      'Add figures or Mucha portrait pastiche.',
      'Let ornament touch body text.',
    ],
  },
});
})();
