/* 39 Wabi-Sabi — unbleached, imperfect, still. References (docs/research/round6.md §3): Leonard
   Koren's wabi-sabi (impermanence, imperfection, incompleteness), Kenya Hara's "emptiness" and the
   Muji/Ikko Tanaka restraint (flat fields, small labels, generous space), Kinto (colour lives in
   materials, never in UI), kintsugi (repair as beauty), the potter's glaze test tile, Kinfolk's
   slow margins.

   Mechanism.
   - Ma: most of every surface is empty unbleached paper (kinari #F2EDE4, never white), with sparse
     washi fibres (short curved hairlines), not grain noise. Content is small, asymmetric and
     anchored to an edge; every hairline stops short of its run (incomplete on purpose).
   - Hero: one hand-thrown tea bowl (chawan) in side view, drawn procedurally: uneven rim, walls
     that lean, an unglazed foot in raw clay with iron speckles, the client primary as the main
     glaze (chroma cut to <=45%, pulled 15% toward ash) ending in drips with a pooled edge, the
     secondary as a second pour over one side, an iron rim line, ONE gold kintsugi seam, a cast
     shadow, a ground hairline that stops short, and a small hanko seal. Seeded by the brand name.
   - Headline (def.headline): small mincho, never bold, stepped over 2-3 lines like a poem; the
     highlight word carries Japanese emphasis dots (bōten, a sesame dot over each letter) in the
     seal colour instead of a colour change. No CJK text is ever generated.
   - Components: test-tile palette (glazed top, raw clay foot, a hanging hole), segmented words
     between hairlines with an ink blot under the chosen one, a flat glaze button, a pebble toggle
     in a hairline groove, bottom-hairline field, Raw / Glazed / Mended sherds, an ink dot that
     travels along a hairline for progress, a tiny ensō as the brand mark.
   - Colour: paper, sumi and ash are fixed; primary and secondary become muted glazes; the accent
     is the hanko seal when it holds 3:1 on paper, else fixed shu vermilion; gold is the seam only.
   The deck's Material slide draws three vessels (raw, glazed, mended) via def.deck.materialArt. */

const WS = {
  paper: '#F2EDE4', sumi: '#2E2B27', ash: '#8C857A', clay: '#D3C3A4', clayDeep: '#B9A27C', iron: '#6E4A30',
  shu: '#C8442F', goldA: '#B8913A', goldB: '#E2C374', night: '#22201C',
};
let wsSeq = 0;

function wsHash(s) {
  let h = 2166136261 >>> 0;
  for (const ch of String(s)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}
function wsRand(seed) {
  let a = (seed >>> 0) || 1;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const wsF = n => (Math.round(n * 100) / 100).toString();

// A closed (or open) Catmull-Rom curve through pts, as cubic bezier path data.
function wsSmooth(pts, closed) {
  const n = pts.length;
  const P = i => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
  let d = `M${wsF(pts[0][0])} ${wsF(pts[0][1])}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${wsF(c1[0])} ${wsF(c1[1])} ${wsF(c2[0])} ${wsF(c2[1])} ${wsF(p2[0])} ${wsF(p2[1])}`;
  }
  return closed ? d + ' Z' : d;
}

// A glaze from a brand colour: chroma cut to <= 45% and pulled 15% toward ash, so a saturated
// client colour reads as fired glaze (rust, celadon, nuka blue), never as UI paint.
function wsGlaze(hex) {
  const { h, s, l } = hexToHsl(hex);
  const g = hslToHex(h, Math.min(s * 0.5, 42), Math.max(30, Math.min(l, 58)));
  return slMix(WS.ash, g, 0.15);
}
// Shift a glaze's lightness until `text` reads on it at `ratio`.
function wsFit(hex, text, ratio, dir) {
  let { h, s, l } = hexToHsl(hex);
  let out = hex;
  for (let i = 0; i < 40 && contrastRatio(out, text) < ratio; i++) {
    l = Math.max(4, Math.min(96, l + dir * 2));
    out = hslToHex(h, s, l);
  }
  return out;
}
// The seal: the client accent when it holds 3:1 on paper and has some colour, else shu vermilion.
function wsSeal(t) {
  const { s } = hexToHsl(t.accent);
  return (contrastRatio(t.accent, WS.paper) >= 3 && s >= 35) ? t.accent : WS.shu;
}
function wsInk(t) { return t.isDark ? t.mix('#ECE5D6', t.ink, 0.7) : t.mix(WS.sumi, t.ink, 0.6); }

// One hand-thrown vessel in side view. Coordinates: rim centre at (cx, top); R rim half-width,
// H depth to the foot, FW foot half-width, FH foot height, ry rim ellipse. kind: 'raw' | 'glazed' | 'mended'.
function wsVessel(o) {
  const { id, rnd, cx, top, R, H, FW, FH, ry, kind, glaze, glaze2, ink } = o;
  const g = kind !== 'raw';
  const ph1 = rnd() * 6.28, ph2 = rnd() * 6.28;
  const lean = (rnd() - 0.5) * 3.4;
  // the rim: a sampled ellipse with low-frequency wobble (a thrown rim is never true)
  const rim = [];
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    const k = 1 + 0.022 * Math.sin(2 * a + ph1) + 0.014 * Math.sin(3 * a + ph2);
    rim.push([cx + Math.cos(a) * R * k, top + Math.sin(a) * ry * k + (Math.cos(a) > 0 ? lean * 0.12 : 0)]);
  }
  const rimL = cx - R * (1 + 0.022 * Math.sin(2 * Math.PI + ph1)), rimR = cx + R * (1 + 0.022 * Math.sin(ph1));
  const fy = top + H, fb = fy + FH;
  const wl = R * (0.98 + rnd() * 0.05), wr = R * (0.97 + rnd() * 0.05);
  // outer silhouette: back half of the rim, left wall, foot, right wall
  let back = '';
  for (let i = 14; i <= 28; i++) {
    const p = rim[i % 28];
    back += `${i === 14 ? 'M' : ' L'}${wsF(p[0])} ${wsF(p[1])}`;
  }
  const body = `${back} C${wsF(cx + wr)} ${wsF(top + H * 0.46)} ${wsF(cx + R * 0.74 + lean)} ${wsF(top + H * 0.93)} ${wsF(cx + FW + lean * 0.4)} ${wsF(fy)}`
    + ` L${wsF(cx + FW - 1 + lean * 0.4)} ${wsF(fb)} L${wsF(cx - FW + 1 + lean * 0.4)} ${wsF(fb)} L${wsF(cx - FW + lean * 0.4)} ${wsF(fy)}`
    + ` C${wsF(cx - R * 0.74 + lean)} ${wsF(top + H * 0.93)} ${wsF(cx - wl)} ${wsF(top + H * 0.46)} ${wsF(rimL)} ${wsF(top)} Z`;
  const rimPath = wsSmooth(rim, true);
  // the interior opening, a little inside the rim
  const inner = wsSmooth(rim.map(p => [cx + (p[0] - cx) * 0.94, top + (p[1] - top) * 0.82 - 0.2]), true);
  const front = wsSmooth(rim.slice(0, 15), false);
  const clay = WS.clay, clayDeep = WS.clayDeep;
  let s = '';
  s += `<clipPath id="${id}b"><path d="${body}"/></clipPath>`;
  // cast shadow (light from the upper left)
  s += `<ellipse cx="${wsF(cx + FW * 0.5)}" cy="${wsF(fb + 0.6)}" rx="${wsF(FW * 2.1)}" ry="${wsF(Math.max(2.2, FH * 0.55))}" fill="${ink}" opacity=".14" filter="url(#${id}blur)"/>`;
  s += `<path d="${body}" fill="${clay}"/>`;
  s += `<g clip-path="url(#${id}b)">`;
  // iron speckles in the clay
  for (let i = 0; i < 26; i++) {
    const x = cx + (rnd() - 0.5) * 2 * R, y = top + H * (0.35 + rnd() * 0.7);
    s += `<circle cx="${wsF(x)}" cy="${wsF(y)}" r="${wsF(0.25 + rnd() * 0.45)}" fill="${WS.iron}" opacity="${wsF(0.35 + rnd() * 0.4)}"/>`;
  }
  // the foot ring, unglazed and a shade deeper; a line where it meets the body
  s += `<rect x="${wsF(cx - R - 4)}" y="${wsF(fy)}" width="${wsF(2 * R + 8)}" height="${wsF(FH + 2)}" fill="${clayDeep}"/>`;
  s += `<path d="M${wsF(cx - FW - 2)} ${wsF(fy + 0.4)} H${wsF(cx + FW + 2)}" stroke="${WS.iron}" stroke-width=".5" opacity=".45"/>`;
  if (g) {
    // main glaze: from the rim down to a wavy line with drips that end in beads
    const gy = top + H * (0.56 + rnd() * 0.08);
    const xs = [];
    for (let x = cx + R + 6; x >= cx - R - 6; x -= 4 + rnd() * 3) xs.push(x);
    let edge = '';
    let first = true;
    xs.forEach((x, i) => {
      const y = gy + Math.sin(x * 0.11 + ph1) * 2.2 + (x - cx) * 0.03;
      if (!first && i % 3 === 1 && rnd() < 0.85) {
        const w = 3 + rnd() * 3.2, d = 5 + rnd() * (H * 0.2);
        edge += ` L${wsF(x + w / 2)} ${wsF(y)} C${wsF(x + w / 2 + 0.3)} ${wsF(y + d * 1.18)} ${wsF(x - w / 2 - 0.3)} ${wsF(y + d * 1.18)} ${wsF(x - w / 2)} ${wsF(y)}`;
      } else edge += ` ${first ? 'M' : 'L'}${wsF(x)} ${wsF(y)}`;
      first = false;
    });
    const glazeShape = `M${wsF(cx - R - 8)} ${wsF(top - ry - 6)} L${wsF(cx + R + 8)} ${wsF(top - ry - 6)} L${wsF(cx + R + 8)} ${wsF(gy)}${edge.replace(/^ M/, ' L')} L${wsF(cx - R - 8)} ${wsF(top - ry - 6)} Z`;
    const pool = slMix('#000000', glaze, 0.22);
    s += `<path d="${glazeShape}" fill="${glaze}"/>`;
    // variegation: the glaze breaks lighter and pools darker in a slow mottle, never a flat fill
    s += `<path d="${glazeShape}" fill="${pool}" filter="url(#${id}mot)" opacity=".55"/>`;
    s += `<path d="${glazeShape}" fill="${slMix('#ffffff', glaze, 0.3)}" filter="url(#${id}mot2)" opacity=".35"/>`;
    s += `<path d="${edge}" fill="none" stroke="${pool}" stroke-width="1.6" stroke-linejoin="round" opacity=".85"/>`;
    // second glaze: a pour from the rim over one side
    if (glaze2) {
      const px = cx + R * (0.15 + rnd() * 0.25), pw = R * (0.55 + rnd() * 0.2), pd = H * (0.34 + rnd() * 0.1);
      const pts = [[px - pw / 2, top - ry - 4], [px + pw / 2, top - ry - 4], [px + pw * 0.46, top + pd * 0.42], [px + pw * 0.33, top + pd * 0.66],
        [px + pw * 0.27, top + pd * 1.22], [px + pw * 0.19, top + pd * 0.74], [px - pw * 0.04, top + pd * 0.8], [px - pw * 0.13, top + pd * 1.02],
        [px - pw * 0.22, top + pd * 0.66], [px - pw * 0.45, top + pd * 0.38]];
      const pour = wsSmooth(pts, true);
      s += `<path d="${pour}" fill="${glaze2}" opacity=".93"/>`;
      s += `<path d="${pour}" fill="none" stroke="${slMix('#ffffff', glaze2, 0.28)}" stroke-width=".7" opacity=".7"/>`;
    }
  } else {
    // raw: a thin clear wash over the upper body only, so the clay still reads as clay
    s += `<path d="M${wsF(cx - R - 6)} ${wsF(top - ry - 4)} H${wsF(cx + R + 6)} V${wsF(top + H * 0.5)} H${wsF(cx - R - 6)} Z" fill="#ffffff" opacity=".08"/>`;
  }
  // volume: light from the left, shade to the right
  s += `<rect x="${wsF(cx - R - 6)}" y="${wsF(top - ry - 6)}" width="${wsF(2 * R + 12)}" height="${wsF(H + FH + ry + 12)}" fill="url(#${id}vol)"/>`;
  s += `</g>`;
  // interior and rim
  const inside = g ? slMix('#000000', glaze, 0.3) : slMix('#000000', clay, 0.22);
  s += `<path d="${rimPath}" fill="${g ? glaze : clay}"/>`;
  s += `<path d="${inner}" fill="${inside}"/>`;
  s += `<path d="${inner}" fill="url(#${id}in)"/>`;
  s += `<path d="${front}" fill="none" stroke="${slMix('#ffffff', g ? glaze : clay, 0.3)}" stroke-width="1.1" stroke-linecap="round"/>`;
  s += `<path d="${rimPath}" fill="none" stroke="${WS.iron}" stroke-width=".7" opacity="${g ? '.7' : '.4'}"/>`;
  // one kintsugi seam: from the rim down the wall, with a small branch; a short run inside too
  if (kind === 'mended') {
    const sx = cx - R * (0.38 + rnd() * 0.18);
    const pts = [[sx, top + ry * 0.92]];
    let x = sx, y = top + ry * 0.92;
    const segs = 6 + Math.floor(rnd() * 3);
    for (let i = 0; i < segs; i++) { x += (rnd() - 0.42) * R * 0.16; y += H * (0.06 + rnd() * 0.05); pts.push([x, y]); }
    const bi = 2 + Math.floor(rnd() * 2);
    const br = [pts[bi], [pts[bi][0] - R * 0.09, pts[bi][1] + H * 0.07], [pts[bi][0] - R * 0.15, pts[bi][1] + H * 0.1]];
    const inn = [[sx, top + ry * 0.92], [sx + R * 0.05, top + ry * 0.2], [sx + R * 0.02, top - ry * 0.25]];
    const line = p => p.map((q, i) => `${i ? 'L' : 'M'}${wsF(q[0])} ${wsF(q[1])}`).join(' ');
    const d = `${line(pts)} ${line(br)}`;
    s += `<path d="${line(inn)}" fill="none" stroke="url(#${id}gold)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity=".8"/>`;
    s += `<path d="${d}" fill="none" stroke="url(#${id}gold)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += `<path d="${d}" fill="none" stroke="#FFF6DA" stroke-width=".45" stroke-linecap="round" stroke-linejoin="round" opacity=".55" transform="translate(-.35 -.3)"/>`;
  }
  return s;
}

function wsDefs(id) {
  return `<filter id="${id}blur" x="-30%" y="-200%" width="160%" height="500%"><feGaussianBlur stdDeviation="1.6"/></filter>
    <filter id="${id}mot" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".07 .035" numOctaves="3" seed="5" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 2.2 -0.9" result="a"/><feComposite in="SourceGraphic" in2="a" operator="in"/></filter>
    <filter id="${id}mot2" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".5" numOctaves="2" seed="11" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 3 -1.9" result="a"/><feComposite in="SourceGraphic" in2="a" operator="in"/></filter>
    <filter id="${id}rough" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="1.4"/></filter>
    <linearGradient id="${id}vol" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#ffffff" stop-opacity=".2"/><stop offset=".3" stop-color="#ffffff" stop-opacity="0"/><stop offset=".62" stop-color="#000000" stop-opacity="0"/><stop offset="1" stop-color="#000000" stop-opacity=".26"/></linearGradient>
    <linearGradient id="${id}in" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#000000" stop-opacity=".18"/><stop offset=".55" stop-color="#000000" stop-opacity="0"/><stop offset="1" stop-color="#ffffff" stop-opacity=".16"/></linearGradient>
    <linearGradient id="${id}gold" x1="0" x2="0" y1="0" y2="1" gradientUnits="objectBoundingBox"><stop offset="0" stop-color="${WS.goldB}"/><stop offset=".5" stop-color="${WS.goldA}"/><stop offset="1" stop-color="${WS.goldB}"/></linearGradient>`;
}

// The hanko seal: a small square, slightly uneven ink edge, the initial knocked out in paper.
function wsSealSvg(id, x, y, size, color, initial, face, rot) {
  const holes = [[0.22, 0.8], [0.84, 0.18], [0.7, 0.86]].map(([a, b]) => `<circle cx="${wsF(x + a * size)}" cy="${wsF(y + b * size)}" r="${wsF(size * 0.035)}" fill="${WS.paper}" opacity=".7"/>`).join('');
  return `<g transform="rotate(${rot} ${wsF(x + size / 2)} ${wsF(y + size / 2)})" filter="url(#${id}rough)">
      <rect x="${wsF(x)}" y="${wsF(y)}" width="${wsF(size)}" height="${wsF(size)}" rx="${wsF(size * 0.06)}" fill="${color}"/>
      <rect x="${wsF(x + size * 0.1)}" y="${wsF(y + size * 0.1)}" width="${wsF(size * 0.8)}" height="${wsF(size * 0.8)}" fill="none" stroke="${WS.paper}" stroke-width="${wsF(size * 0.045)}" opacity=".9"/>
      <text x="${wsF(x + size / 2)}" y="${wsF(y + size * 0.71)}" text-anchor="middle" font-family='${face}' font-size="${wsF(size * 0.58)}" fill="${WS.paper}">${initial}</text>${holes}
    </g>`;
}

function wsFaces(ctx) {
  const st = ctx.state || {};
  return {
    h: String((st.headingFont && st.headingFont.css) || 'Georgia, serif').replace(/'/g, '"'),
    b: String((st.bodyFont && st.bodyFont.css) || 'sans-serif').replace(/'/g, '"'),
  };
}

// The deck's Material slide (def.deck.materialArt): three vessels, a tall cup (raw), a bowl
// (glazed) and a wide dish (mended), so the cover's bowl is not repeated.
function wsVesselSet(ctx) {
  const t = ctx.t;
  const id = `ws${++wsSeq}`;
  const ink = wsInk(t);
  const f = wsFaces(ctx);
  const glaze = wsGlaze(t.primary), glaze2 = wsGlaze(t.secondary);
  const r2 = wsRand(wsHash(String(ctx.brandName || 'brand') + '|ws3'));
  const cup = wsVessel({ id: id + 'c', rnd: r2, cx: 52, top: 52, R: 24, H: 52, FW: 14, FH: 5, ry: 4.6, kind: 'raw', glaze, glaze2: null, ink });
  const mid = wsVessel({ id: id + 'd', rnd: r2, cx: 146, top: 64, R: 40, H: 40, FW: 16, FH: 5, ry: 6, kind: 'glazed', glaze, glaze2, ink });
  const dish = wsVessel({ id: id + 'e', rnd: r2, cx: 246, top: 86, R: 44, H: 18, FW: 20, FH: 4, ry: 7, kind: 'mended', glaze: glaze2, glaze2: null, ink });
  const cap = (x, s, n) => `<text x="${x}" y="134" text-anchor="middle" font-family='${f.b}' font-size="6.4" letter-spacing="1.3" fill="${ink}">${s}</text><text x="${x}" y="143" text-anchor="middle" font-family='${f.h}' font-size="6" fill="${ink}" opacity=".6">${n}</text>`;
  return `<div class="ws-art"><svg class="ws-set" viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg" role="presentation">
      <defs>${wsDefs(id + 'c')}${wsDefs(id + 'd')}${wsDefs(id + 'e')}</defs>
      <path d="M14 109.5 H232" stroke="${t.alpha(ink, 0.34)}" stroke-width=".5"/>
      ${cup}${mid}${dish}
      ${cap(52, 'RAW', 'unglazed clay')}${cap(146, 'GLAZED', 'one pour, one drip')}${cap(246, 'MENDED', 'gold in the crack')}
    </svg></div>`;
}

function wsHeadlineHtml(text) {
  const e = escapeHtml;
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '';
  const m = words[words.length - 1].match(/^(.*?)([.,;:!?…]*)$/);
  const hlWord = m ? m[1] : words[words.length - 1];
  const tail = m ? m[2] : '';
  const total = words.join(' ').length;
  const lines = [];
  const budget = Math.max(9, Math.ceil(total / (total > 34 ? 3 : 2)));
  let cur = [];
  words.forEach((w, i) => {
    const len = cur.join(' ').length;
    if (cur.length && len + 1 + w.length > budget && lines.length < 2) { lines.push(cur); cur = []; }
    cur.push(i === words.length - 1 ? null : w);
  });
  lines.push(cur);
  const indents = [0, 1.5, 0.55];
  const em = `<span class="ab-hl ws-em">${Array.from(hlWord).map(c => `<span class="ws-e">${e(c)}</span>`).join('')}</span>${e(tail)}`;
  return lines.map((ln, i) => `<span class="ws-ln" style="--ws-in:${indents[i] || 0}em">${ln.map(w => w === null ? em : e(w)).join(' ')}</span>`).join('');
}

registerAesthetic({
  key: 'wabi-sabi', order: 39,
  name: 'Wabi-Sabi',
  descriptor: 'Unbleached · Imperfect · Still',
  influences: 'Japanese craft / Kintsugi / Mingei',
  summary: 'Emptiness as content: unbleached paper, small asymmetric marks, one glazed bowl and one mended crack.',
  motto: 'Imperfect, never careless.',
  kicker: 'Made slowly',
  mode: 'light',
  slideShape: 'minimal',
  labels: { material: 'Glaze', states: ['Raw', 'Glazed', 'Mended'], statesKind: 'swatch' },
  layout: { hero: 'split', palette: 'swatches', sections: 'asym' },
  type: { ui: 'body', label: 'body', display: 0.62 },
  highlight: 'custom',
  highlightNote: 'The highlighted word keeps the ink colour and carries emphasis dots (one small sesame dot over each letter, as in Japanese bōten) in the seal colour; never a colour fill or a band.',
  cardFill: '--ab-ws-sheet',

  roles: {
    canvas: {
      use: 'Unbleached paper (kinari): the light colour pulled warm so it never reads white; 60–70% of every surface stays empty',
      never: 'Pure white, a cool grey, a tint of the brand colour, or grain noise (only sparse fibres)',
      coverage: '≈70%',
    },
    ink: {
      use: 'Sumi ink: small mincho headings, body text and the hairlines that stop short of their run',
      never: 'Bold weights, large fills or full-length rules',
      coverage: '≈12%',
    },
    primary: {
      use: 'The main glaze: the one button, the selected toggle pebble and the bowl’s glaze, always muted (chroma cut to under half, pulled toward ash)',
      never: 'Saturated brand colour at full strength, text, rules or backgrounds',
      coverage: '≈8%',
    },
    secondary: {
      use: 'The second glaze: a pour over the bowl’s shoulder and one test tile',
      never: 'Buttons, text or any second action',
      coverage: '≈5%',
    },
    accent: {
      use: 'The hanko seal and the emphasis dots over the highlighted word; it falls back to shu vermilion when the accent does not hold 3:1 on paper',
      never: 'Fills, buttons, rules or more than one seal per view',
      coverage: '≤1%',
    },
  },

  // Unbleached paper in light mode, a warm sumi night in dark mode; never a pure neutral.
  canvas(b) {
    return b.isDark ? b.mix(WS.night, b.canvas, 0.78) : b.mix(WS.paper, b.canvas, 0.8);
  },

  tokens(t) {
    const d = t.isDark;
    const ink = wsInk(t);
    const paperText = d ? WS.sumi : WS.paper;
    const glazeBase = wsGlaze(t.primary);
    // the button glaze must carry its label: paper text on a deeper glaze (light), sumi on a pale glaze (dark)
    const glaze = d ? wsFit(glazeBase, WS.sumi, 4.6, +1) : wsFit(glazeBase, WS.paper, 4.6, -1);
    const glaze2 = wsGlaze(t.secondary);
    const seal = wsSeal(t);
    const sheet = d ? t.mix('#ffffff', t.canvas, 0.045) : t.mix('#ffffff', t.canvas, 0.5);
    return {
      '--ab-ink': ink,
      '--ab-muted': t.contrast(t.mix(ink, t.canvas, 0.66), t.canvas) >= 4.6 ? t.mix(ink, t.canvas, 0.66) : t.muted,
      '--ab-line': t.alpha(ink, d ? 0.26 : 0.22),
      '--ab-ws-glaze': glaze,
      '--ab-ws-on-glaze': paperText,
      '--ab-ws-glaze-soft': glazeBase,
      '--ab-ws-glaze2': glaze2,
      '--ab-ws-seal': seal,
      '--ab-ws-sheet': sheet,
      '--ab-ws-clay': WS.clay,
      '--ab-ws-fired-accent': seal,
      '--ab-ws-ash': WS.ash,
      '--ab-ws-blot': ink,
      '--ab-type-pick-w': '400',
    };
  },

  headline(ctx, text) { return wsHeadlineHtml(text); },

  // One glazed chawan with a gold seam, a seal and a ground line that stops short.
  art(ctx) {
    const t = ctx.t;
    const id = `ws${++wsSeq}`;
    const rnd = wsRand(wsHash(String(ctx.brandName || 'brand') + '|ws'));
    const ink = wsInk(t);
    const f = wsFaces(ctx);
    const bowl = wsVessel({ id: id + 'a', rnd, cx: 110, top: 70, R: 61, H: 68, FW: 23, FH: 7, ry: 9.5, kind: 'mended', glaze: wsGlaze(t.primary), glaze2: wsGlaze(t.secondary), ink });
    return `<div class="ws-art"><svg class="ws-scene" viewBox="0 0 200 176" xmlns="http://www.w3.org/2000/svg" role="presentation">
      <defs>${wsDefs(id + 'a')}${wsDefs(id)}</defs>
      <path d="M20 145.6 H178" stroke="${t.alpha(ink, 0.34)}" stroke-width=".5"/>
      ${bowl}
      ${wsSealSvg(id, 22, 116, 15, wsSeal(t), escapeHtml(ctx.initial || '·'), f.h, -3)}
      <text x="188" y="22" font-family='${f.b}' font-size="5.4" letter-spacing=".9" fill="${ink}" opacity=".62" transform="rotate(90 188 22)">MENDED BOWL · NO. 7</text>
    </svg></div>`;
  },

  materials: [
    { name: 'Unbleached paper', css: 'background: {canvas}; /* kinari, never white; sparse curved fibres at 8-11% (not noise); 60-70% of the surface stays empty */' },
    { name: 'Glaze (the one button)', css: 'background: {wsGlaze}; color: {wsOnGlaze}; border-radius: 2px; letter-spacing: .14em; text-transform: uppercase; font-size: 11px; /* chroma under half the brand primary, 15% toward ash; hover deepens one value, pressed = a 1px inset hairline */' },
    { name: 'Hairline that stops short', css: 'height: 1px; background: linear-gradient(90deg, {line} 0 82%, transparent 82%); /* every rule ends before its run: incomplete on purpose */' },
    { name: 'Kintsugi seam', css: 'stroke: linear-gradient(#E2C374, #B8913A, #E2C374); stroke-width: 1.7px; /* one gold crack per view: the Mended state and the hero bowl, never decoration */' },
    { name: 'Hanko seal', css: 'background: {wsSeal}; color: #F2EDE4; border-radius: 1px; /* a small square, uneven ink edge, the initial knocked out in paper; one per view */' },
    { name: 'Washi sheet', css: 'background: {wsSheet}; box-shadow: 0 1px 0 rgba(46,43,39,.08); /* a lighter paper with one deckled edge; or no card at all, only space and a hairline */' },
  ],

  rules: {
    do: [
      'Leave most of every surface as empty unbleached paper; anchor small content to an edge or a third line.',
      'Set headings small in a mincho serif at regular weight, stepped off-centre; never bold.',
      'Turn brand colours into muted glazes (chroma cut to under half, pulled toward ash) and keep them on objects and the one button.',
      'Allow exactly one gold seam and one seal per view; let hairlines stop short of their run.',
    ],
    dont: [
      'Draw fake kanji, cherry blossoms, torii, rising suns or any generated CJK text.',
      'Centre everything, fill the grid or box content in cards with soft shadows.',
      'Use saturated brand colour at full strength, pure white, or grain noise instead of fibres.',
      'Repeat the ensō, the seal or the seam; one of each is the whole ornament.',
    ],
  },

  deck: {
    principles: [
      ['Emptiness is the content', 'Most of each surface stays empty unbleached paper.'],
      ['Imperfect, never careless', 'Marks are uneven by intent and never sloppy.'],
      ['One mended crack only', 'A single gold seam is the whole ornament.'],
    ],
    do: [
      'Leave most of each slide as empty unbleached paper.',
      'Set small mincho headings off-centre, never bold.',
      'Use one gold seam or one seal per slide.',
    ],
    dont: [
      'Add fake kanji, blossoms or rising suns.',
      'Centre everything or fill the grid.',
      'Use saturated brand colour at full strength.',
    ],
    materialArt: ctx => wsVesselSet(ctx),
    marks: (ctx, kind) => `<i class="ws-mk" data-k="${kind === 'do' ? 'do' : 'dont'}"></i>`,
    coverDisplay: 0.62,
    coverBand: false,      // emptiness: no pattern band under the cover
    closingStrip: false,
  },
});
