/* 38 Naive Doodle — wobbly, honest, sunny. References: Kittl 2026 "Naive design" (#1) and
   "Kid Core", Oatly (cream graph paper, hand lettering, deadpan notes), Keith Haring's
   action lines, Jean Jullien's brush-pen jokes, Geoff McFetridge's exact-naive line, Bráulio
   Amado's crayon lettering, Graza / Fishwife packaging, Kid Pix.

   Mechanism. Every line is a seeded WOBBLE path: the ideal shape is sampled every few units
   and each point is pushed perpendicular to the path by smooth low-frequency noise (two
   summed sines, never per-point random), round caps, warm-black ink. Boxes never close
   neatly: a loop overshoots its start, a square's sides run past the corners. The colour is
   a separate CRAYON fill, offset a few pixels from its outline ("coloured in a bit outside"),
   textured with 45-degree hatch strokes (the one crayon method on this board).
   - tokens(t, state) draws every UI outline (card, button, segmented row, underline, toggle oval,
     toggle faces, ring, tick, star, wavy rule, checkbox, bar, flag, arrows) as small SVG data
     URIs in the line colour, seeded per brand, so the CSS only positions them. Stroke width
     is non-scaling, so a stretched outline keeps a 2.6px pen.
   - The crayons are the client colours lifted (same hue and chroma) until warm-black pencil
     text reads 4.6:1 on them, so labels on a crayon fill are always legible.
   - headline(ctx, text): each word its own tiny tilt (±1.5°, display only) and the last word
     coloured in with an accent crayon scribble that overshoots the word, plus a squiggle.
   - art(ctx): one big drawing on wide paper: a hand-drawn smiley sun bleeding off the
     right edge, dash rays, two clouds, a hill mound coloured outside its line, three loop flowers,
     and a handwritten note with a loop arrow. Pure SVG with inline attributes, so it draws
     the same inside another aesthetic's hero box (blend donor). */
(function () {
let seq = 0;
const PENCIL = '#1F1B16';

function ndRand(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function ndHash(str) {
  let h = 2166136261;
  const s = String(str);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
const f1 = n => String(Math.round(n * 10) / 10);

// smooth noise along the arc length s: two summed sines with random phases
function ndNoise(rnd, amp) {
  const p1 = rnd() * 6.283, p2 = rnd() * 6.283, k1 = 0.035 + rnd() * 0.03, k2 = 0.11 + rnd() * 0.06;
  return s => amp * (0.68 * Math.sin(s * k1 + p1) + 0.32 * Math.sin(s * k2 + p2));
}
// resample a polyline every `step` units and push each point along its normal
function ndWobble(pts, rnd, amp, step) {
  const n = ndNoise(rnd, amp);
  const out = [];
  let s = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    const L = Math.hypot(x1 - x0, y1 - y0) || 0.001;
    const nx = -(y1 - y0) / L, ny = (x1 - x0) / L;
    const k = Math.max(1, Math.round(L / step));
    for (let j = 0; j < k; j++) {
      const u = j / k, d = n(s + u * L);
      out.push([x0 + (x1 - x0) * u + nx * d, y0 + (y1 - y0) * u + ny * d]);
    }
    s += L;
  }
  const [xl, yl] = pts[pts.length - 1];
  out.push([xl, yl]);
  return out;
}
const ndD = pts => 'M' + pts.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L');
// ellipse arc as points (degrees), with an optional radius drift so a loop never closes on itself
function ndArc(cx, cy, rx, ry, a0, sweep, drift = 0, n = 0) {
  const k = n || Math.max(12, Math.round(Math.abs(sweep) / 6));
  const pts = [];
  for (let i = 0; i <= k; i++) {
    const u = i / k, a = (a0 + sweep * u) * Math.PI / 180, g = 1 + drift * u;
    pts.push([cx + Math.cos(a) * rx * g, cy + Math.sin(a) * ry * g]);
  }
  return pts;
}
// a rounded rectangle as one loop that starts on the top edge and runs past its start
function ndLoopRect(x, y, w, h, r, over) {
  const pts = [];
  const corner = (cx, cy, a0) => { for (let i = 0; i <= 6; i++) { const a = (a0 + 90 * i / 6) * Math.PI / 180; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  pts.push([x + w * 0.22, y + 0.6]);
  corner(x + w - r, y + r, -90);
  corner(x + w - r, y + h - r, 0);
  corner(x + r, y + h - r, 90);
  corner(x + r, y + r, 180);
  pts.push([x + w * 0.22 + over, y - 0.8]);
  return pts;
}
// a square-cornered box whose four sides each run past the corners
function ndBoxSides(x, y, w, h, over, rnd) {
  const j = () => (rnd() - 0.5) * 1.6;
  return [
    [[x - over, y + j()], [x + w + over * 0.6, y + j()]],
    [[x + w + j(), y - over * 0.7], [x + w + j(), y + h + over]],
    [[x + w + over * 0.5, y + h + j()], [x - over * 0.8, y + h + j()]],
    [[x + j(), y + h + over * 0.6], [x + j(), y - over]],
  ];
}
// a hand arrow from (x0,y0) to (x1,y1) with one loop in its middle; returns [shaft points, head points]
function ndLoopArrow(x0, y0, x1, y1, r, side = 1) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy * side, ny = ux * side;
  const mx = x0 + dx * 0.45, my = y0 + dy * 0.45;
  const pts = [];
  for (let i = 0; i <= 8; i++) { const u = i / 8, sag = Math.sin(u * Math.PI) * L * 0.06; pts.push([x0 + (mx - x0) * u + nx * sag, y0 + (my - y0) * u + ny * sag]); }
  const cx = mx + nx * r, cy = my + ny * r, a0 = Math.atan2(my - cy, mx - cx);
  for (let i = 1; i <= 22; i++) { const a = a0 - side * Math.PI * 2 * i / 22; pts.push([cx + Math.cos(a) * r * (1 + 0.12 * Math.sin(i / 22 * Math.PI)), cy + Math.sin(a) * r]); }
  for (let i = 1; i <= 8; i++) { const u = i / 8, sag = Math.sin(u * Math.PI) * L * 0.05; pts.push([mx + (x1 - mx) * u - nx * sag, my + (y1 - my) * u - ny * sag]); }
  const [px, py] = pts[pts.length - 3], hx = x1 - px, hy = y1 - py, hl = Math.hypot(hx, hy) || 1, a = Math.atan2(hy, hx), k = Math.min(11, L * 0.16);
  const head = [[x1 - Math.cos(a - 0.5) * k, y1 - Math.sin(a - 0.5) * k], [x1, y1], [x1 - Math.cos(a + 0.5) * k, y1 - Math.sin(a + 0.5) * k]];
  return [pts, head];
}
const ndUri = svg => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
const ndPen = (col, w = 2.6, extra = '') => `fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"${extra}`;
function ndSvg(w, h, body, keep) {
  return ndUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"${keep ? '' : ' preserveAspectRatio="none"'}>${body}</svg>`);
}

// client colour -> crayon: same hue and chroma, lifted until pencil text reads 4.6:1
function ndCrayon(hex) {
  const c = hexToHsl(hex);
  let l = c.l, out = hex;
  for (let i = 0; i < 50 && contrastRatio(out, PENCIL) < 4.6; i++) { l = Math.min(97, l + 1.5); out = hslToHex(c.h, c.s, l); }
  return out;
}
// a slightly darker shade of the same crayon for the hatch strokes
function ndShade(hex, k) { const c = hexToHsl(hex); return hslToHex(c.h, Math.min(100, c.s + 6), Math.max(8, c.l - k)); }

function ndHeadlineFonts() {
  if (typeof window === 'undefined' || !window.loadFontFamily || typeof FONTS === 'undefined') return;
  ['Caveat', 'Patrick Hand'].forEach(n => { const f = FONTS.find(x => x.name === n); if (f) window.loadFontFamily(f); });
}

// the shape kit for one brand + mode, as CSS custom properties
function ndKit(t, ink, c1, c3, seed) {
  const rnd = ndRand(seed);
  const P = (pts, amp, step, col = ink, w = 2.6) => `<path d="${ndD(ndWobble(pts, rnd, amp, step))}" ${ndPen(col, w)}/>`;
  const kit = {};
  kit['--nd-card'] = ndSvg(400, 300, P(ndLoopRect(5, 5, 390, 290, 18, 14), 1.7, 7));
  kit['--nd-btn'] = ndSvg(300, 52, P(ndLoopRect(4, 4, 292, 44, 16, 10), 1.1, 6));
  kit['--nd-ring'] = ndSvg(300, 80, P(ndArc(150, 41, 143, 35, 196, 392, -0.05), 1.4, 7) + P(ndArc(150, 39, 147, 37, 200, 120, 0.02), 1.1, 7, ink, 1.6));
  kit['--nd-seg'] = ndSvg(300, 48, ndBoxSides(3, 4, 294, 40, 4, rnd).map(s => P(s, 0.9, 6)).join('')
    + P([[100 + (rnd() - 0.5) * 3, 2], [100 + (rnd() - 0.5) * 3, 46]], 0.8, 6)
    + P([[200 + (rnd() - 0.5) * 3, 3], [200 + (rnd() - 0.5) * 3, 46]], 0.8, 6));
  kit['--nd-line'] = ndSvg(300, 10, P([[-2, 5], [302, 5.5]], 1.3, 6));
  kit['--nd-squig'] = ndSvg(120, 14, P(Array.from({ length: 25 }, (_, i) => [i * 5, 7 + Math.sin(i * 1.25) * 4.2]), 0.4, 3, t.accentInk, 2.8));
  kit['--nd-vrule'] = ndSvg(10, 400, `<path d="${ndD(Array.from({ length: 81 }, (_, i) => [5 + Math.sin(i * 5 / 400 * Math.PI * 6) * 1.6, i * 5]))}" ${ndPen(ink, 1.6)}/>`);
  kit['--nd-rule'] = ndSvg(400, 10, `<path d="${ndD(Array.from({ length: 81 }, (_, i) => [i * 5, 5 + Math.sin(i * 5 / 400 * Math.PI * 6) * 1.6 + Math.sin(i * 5 / 400 * Math.PI * 14) * 0.6]))}" ${ndPen(ink, 1.6)}/>`);
  kit['--nd-oval'] = ndSvg(64, 34, P(ndArc(32, 17, 28.5, 13.5, 170, 378, -0.04), 0.7, 4));
  kit['--nd-oval-fill'] = ndSvg(64, 34, `<clipPath id="o"><ellipse cx="34" cy="18.6" rx="27.5" ry="13"/></clipPath><g clip-path="url(#o)"><rect width="64" height="34" fill="${c1}"/><g stroke="${ndShade(c1, 14)}" stroke-width="1.5" opacity=".6">${Array.from({ length: 16 }, (_, i) => `<path d="M${i * 5 - 14} 36L${i * 5 + 12} 0"/>`).join('')}</g></g>`);
  const face = (on) => {
    const r2 = ndRand(seed ^ (on ? 0x51 : 0x77));
    const Q = (pts, amp, step, w = 2) => `<path d="${ndD(ndWobble(pts, r2, amp, step))}" ${ndPen(PENCIL, w)}/>`;
    const fill = on ? c3 : '#FFFBF2';
    return ndSvg(30, 30, `<circle cx="16" cy="16" r="11.5" fill="${fill}"/>` + Q(ndArc(15, 15, 11.5, 11.5, -100, 372, -0.03), 0.4, 3)
      + (on
        ? `<circle cx="11.3" cy="12.6" r="1.6" fill="${PENCIL}"/><circle cx="18.7" cy="12.4" r="1.6" fill="${PENCIL}"/>` + Q(ndArc(15, 15.5, 6, 4.6, 20, 140), 0.25, 2)
        : Q([[9, 13], [13, 13.4]], 0.2, 2) + Q([[17, 13.2], [21, 12.8]], 0.2, 2) + Q([[12, 20], [18, 19.6]], 0.2, 2)), true);
  };
  kit['--nd-face-on'] = face(true);
  kit['--nd-face-off'] = face(false);
  kit['--nd-tick'] = ndSvg(32, 32, P([[4, 17], [12, 26], [30, 2]], 0.5, 3, ink, 3.2), true);
  kit['--nd-cross'] = ndSvg(30, 30, P([[4, 5], [26, 26]], 0.6, 3, ink, 3) + P([[25, 3], [5, 27]], 0.6, 3, ink, 3), true);
  kit['--nd-box'] = ndSvg(28, 28, ndBoxSides(5, 6, 18, 17, 2.5, rnd).map(s => P(s, 0.35, 3, ink, 2.2)).join(''), true);
  const star = [];
  for (let i = 0; i <= 10; i++) { const a = (-90 + i * 36) * Math.PI / 180, r = i % 2 ? 5.2 : 12; star.push([16 + Math.cos(a) * r, 16.5 + Math.sin(a) * r]); }
  star.push([16 + Math.cos(-54 * Math.PI / 180) * 5.6 + 1.5, 16.5 + Math.sin(-54 * Math.PI / 180) * 5.6]);
  kit['--nd-star'] = ndSvg(32, 32, `<path d="${ndD(star.map(([x, y]) => [x + 2, y + 1.6]))}Z" fill="${c3}"/>` + P(star, 0.45, 3, ink, 2), true);
  kit['--nd-bar'] = ndSvg(200, 18, P(ndLoopRect(3, 3, 194, 12, 6, 6), 0.6, 5, ink, 2));
  kit['--nd-flag'] = ndSvg(22, 30, `<path d="M6 4L19 8.5L6 13Z" fill="${c3}" transform="translate(1.5 1)"/>` + P([[5, 28], [5.5, 3]], 0.3, 3, ink, 2) + P([[5.5, 4], [18, 8.5], [5.6, 13]], 0.3, 3, ink, 1.8), true);
  kit['--nd-ellipse'] = ndSvg(120, 40, P(ndArc(60, 20, 55, 15.5, 200, 385, -0.06), 0.9, 5, ink, 2));
  kit['--nd-arrow'] = ndSvg(34, 16, P([[2, 9], [31, 8]], 0.6, 4, PENCIL, 2.4) + P([[23, 2], [31.5, 8], [24, 14.5]], 0.4, 3, PENCIL, 2.4), true);
  const [na, nh] = ndLoopArrow(84, 50, 8, 8, 8, -1);
  kit['--nd-note-arrow'] = ndSvg(90, 56, P(na, 0.6, 4, ink, 2.2) + P(nh, 0.3, 3, ink, 2.2), true);
  const sun = ndArc(17, 17, 7.4, 7.4, -90, 372, -0.04).map(([x, y]) => [x, y]);
  let rays = '';
  for (let i = 0; i < 8; i++) { const a = (i * 45 + 8) * Math.PI / 180; rays += P([[17 + Math.cos(a) * 11, 17 + Math.sin(a) * 11], [17 + Math.cos(a) * 15.5, 17 + Math.sin(a) * 15.5]], 0.2, 2, ink, 2); }
  kit['--nd-sun'] = ndSvg(34, 34, `<circle cx="18.6" cy="18.4" r="7.6" fill="${c1}"/>` + P(sun, 0.35, 2.5, ink, 2.2) + rays, true);
  kit['--nd-tab'] = ndSvg(160, 40, P(ndArc(80, 20, 74, 15.5, 196, 384, -0.05), 1, 5, ink, 1.8));
  return kit;
}

// hand-lettered headline: each word its own tiny tilt; the last word coloured in
function ndHeadline(ctx, text) {
  const s = String(text || '').trim();
  if (!s) return '';
  ndHeadlineFonts();
  const rnd = ndRand(ndHash((ctx.brandName || '') + '|' + s));
  const m = s.match(/^([\s\S]*?)([^\s]+?)([.,;:!?…]*)$/);
  const lead = m ? m[1].trim() : '';
  const last = m ? m[2] : s;
  const punct = m ? m[3] : '';
  const words = lead ? lead.split(/\s+/) : [];
  const tilt = () => ((rnd() < 0.5 ? -1 : 1) * (0.4 + rnd() * 1.1)).toFixed(2);
  const out = words.map(w => `<span class="ndw" style="--r:${tilt()}deg">${escapeHtml(w)}</span>`);
  const sk = (-2 + rnd() * 3).toFixed(1);
  out.push(`<span class="ndw nd-hl" style="--r:${tilt()}deg;--sk:${sk}deg"><span class="nd-hl-w">${escapeHtml(last)}</span></span>${punct ? `<span class="ndw nd-p">${escapeHtml(punct)}</span>` : ''}`);
  return out.join(' ');
}

registerAesthetic({
  key: 'naive-doodle', order: 38,
  name: 'Naive Doodle',
  descriptor: 'Wobbly · Honest · Sunny',
  influences: 'Kid Core / Oatly / Haring & Jullien line',
  summary: 'A confident but untrained line, colour filled a little outside it, and a page that talks back in handwriting.',
  motto: 'Proof a human drew it.',
  kicker: 'Drawn this morning',
  mode: 'light',
  slideShape: 'soft',
  labels: { material: 'Crayon', states: ['Outlined', 'Coloured in', 'Circled'], statesKind: 'button' },
  layout: { hero: 'split', palette: 'swatches', sections: 'two-col', subcopy: true },
  type: { ui: 'body', label: 'body', display: 1.22 },
  highlight: 'custom',
  highlightNote: 'The highlight word is coloured in by hand: an accent crayon scribble (45-degree hatch over a wax base) sits a few pixels off the word and overshoots it, with a squiggle underline; the word stays warm-black pencil. Each headline word has its own tiny tilt (at most 1.5 degrees); body text never moves.',
  cardFill: '--ab-canvas',

  roles: {
    canvas: {
      use: 'Plain paper: fixed cream #FFFBF2 with a faint graph grid (#E7EBDD) in light mode; in dark mode the client dark pressed to a deep warm slate, drawn on in chalk. About 60% of every view stays empty paper',
      never: 'Gradients, a second paper colour, texture under body text',
      coverage: '60–70%',
    },
    ink: {
      use: 'The pen: fixed warm black #1F1B16 for every outline, doodle and line of text (cream chalk #F4EEDF on the dark slate). Labels on a crayon fill are always warm-black pencil',
      never: 'Pure black, a coloured outline, thick perfect strokes, hard offset shadows',
      coverage: '20–25%',
    },
    primary: {
      use: 'The main crayon: the sun, the one main button (coloured in a few pixels outside its outline), the toggle when it is on. Lifted, same hue, until pencil text reads 4.6:1 on it',
      never: 'Outlines, body text, more than one coloured-in button per view',
      coverage: '≈10%',
    },
    secondary: {
      use: 'The second crayon: the hill, the selected box in a segmented row, progress being coloured in, the card behind-wash',
      never: 'The main action, outlines, text',
      coverage: '≈8–10%',
    },
    accent: {
      use: 'Highlighter and annotation crayon: the scribble behind the highlight word, star doodles, cheeks, flower hearts, the focus squiggle',
      never: 'Buttons, body text, large fills, a fourth crayon',
      coverage: '≤5%',
    },
  },

  // Fixed cream paper; dark mode is a deep warm slate taken from the client dark.
  canvas(b) {
    if (!b.isDark) return '#FFFBF2';
    const h = b.hexToHsl(b.canvas);
    return b.hslToHex(h.h, Math.min(h.s, 16), Math.max(9, Math.min(h.l, 12)));
  },

  headline(ctx, text) { return ndHeadline(ctx, text); },

  tokens(t, vs) {
    const st = vs || (typeof state !== 'undefined' ? state : null);
    const d = t.isDark;
    const ink = d ? '#F4EEDF' : PENCIL;
    let toward = 0.36, muted = t.mix(t.canvas, ink, toward);
    while (toward > 0.05 && t.contrast(muted, t.canvas) < 4.6) { toward -= 0.04; muted = t.mix(t.canvas, ink, toward); }
    const c1 = ndCrayon(t.primary), c2 = ndCrayon(t.secondary), c3 = ndCrayon(t.accent);
    // UI crayon grain: paper showing through the wax (lighter streaks), so a pencil label on a
    // crayon fill keeps its 4.6:1 across the streaks; the hero drawing keeps darker strokes
    const hatch = c => `repeating-linear-gradient(-45deg, ${t.mix(c, '#FFFBF2', 0.62)} 0 1.5px, transparent 1.5px 3.6px)`;
    const brand = st && st.content ? String(st.content.brandName || '') : '';
    const kit = ndKit(t, ink, c1, c3, ndHash(brand + (d ? '|d' : '|l')));
    return Object.assign({
      '--ab-ink': ink,
      '--ab-muted': muted,
      '--ab-line': t.mix(t.canvas, ink, 0.8),
      '--ab-type-pick-w': 400,
      '--nd-pencil': PENCIL,
      '--nd-paper': '#FFFBF2',
      '--nd-grid': d ? 'rgba(244, 238, 223, 0.05)' : '#ECEEE2',
      '--nd-c1': c1, '--nd-c2': c2, '--nd-c3': c3,
      '--nd-h1': hatch(c1), '--nd-h2': hatch(c2), '--nd-h3': hatch(c3),
      '--nd-wash': t.mix(c2, t.canvas, d ? 0.15 : 0.16),
      '--nd-hand': '"Caveat", "Patrick Hand", "Marker Felt", cursive',
      '--ab-crayon': c1,
    }, kit);
  },

  art(ctx) {
    const t = ctx.t;
    ndHeadlineFonts();
    const d = t.isDark;
    const ink = d ? '#F4EEDF' : PENCIL;
    const c1 = ndCrayon(t.primary), c2 = ndCrayon(t.secondary), c3 = ndCrayon(t.accent);
    const id = 'ndh' + (++seq);
    const rnd = ndRand(ndHash(String(ctx.brandName || 'brand') + '|art'));
    const P = (pts, amp, step, w = 3, col = ink) => `<path d="${ndD(ndWobble(pts, rnd, amp, step))}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
    const F = (pts, fill, dx, dy) => `<path d="${ndD(ndWobble(pts, rnd, 1.6, 8).map(([x, y]) => [x + dx, y + dy]))}Z" fill="${fill}"/>`;
    const hatch = (n, c, k) => `<pattern id="${id}${n}" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)"><rect width="6" height="6" fill="${c}"/><path d="M1.6 0V6" stroke="${ndShade(c, k)}" stroke-width="2" opacity=".7"/></pattern>`;
    const cx = 268, cy = 158, R = 86;
    // clouds: scalloped loops
    const cloud = (x, y, w, h) => {
      const pts = [];
      for (let i = 0; i <= 64; i++) {
        const a = Math.PI * 2 * i / 64, bump = 1 + 0.2 * Math.abs(Math.sin(a * 2.5 + 0.4));
        pts.push([x + Math.cos(a) * w * bump, y + Math.sin(a) * h * (a > 0.15 && a < Math.PI - 0.15 ? 0.62 : bump)]);
      }
      pts.push([pts[1][0] + 4, pts[1][1] - 1]);
      return `<path d="${ndD(ndWobble(pts, rnd, 0.9, 6))}" fill="${t.canvas}" stroke="${ink}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
    };
    // rays
    let rays = '';
    for (let i = 0; i < 12; i++) {
      const a = (i * 30 + 6 + (rnd() - 0.5) * 8) * Math.PI / 180, r0 = R + 16 + rnd() * 5, r1 = r0 + 18 + rnd() * 14;
      rays += P([[cx + Math.cos(a) * r0, cy + Math.sin(a) * r0], [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1]], 0.8, 5, 3.4);
    }
    // the hill: a drawn mound that starts and ends on the paper (never cut by the box edge),
    // its crayon filled a little below and to the right of the line, thinning to the ends
    const hill = [], arch = x => Math.sin((x - 14) / 372 * Math.PI);
    for (let i = 0; i <= 24; i++) { const x = 14 + i * 15.5; hill.push([x, 306 - arch(x) * 46 + Math.sin(x / 37) * 3]); }
    const low = ndWobble(hill.map(([x, y]) => [x + 6, y + 9 + 10 + arch(x) * 32 + Math.sin(x / 23) * 3]).reverse(), rnd, 2.2, 9);
    const hillFill = `<path d="${ndD(hill.map(([x, y]) => [x + 6, y + 9]).concat(low))}Z" fill="url(#${id}b)"/>`;
    // loop flowers on stems
    const flower = (x, y, s, petal) => {
      let g = P([[x, y + 4], [x - 3, y + 30 * s], [x + 1, y + 54 * s]], 1, 6, 2.6);
      g += P([[x - 1, y + 36 * s], [x - 14 * s, y + 28 * s], [x - 2, y + 30 * s]], 0.5, 4, 2.2);
      for (let k = 0; k < 5; k++) {
        const a = (k * 72 - 90 + rnd() * 10) * Math.PI / 180;
        const px = x + Math.cos(a) * 11 * s, py = y + Math.sin(a) * 11 * s;
        g += `<ellipse cx="${f1(px + 2.5)}" cy="${f1(py + 2)}" rx="${f1(8 * s)}" ry="${f1(6.4 * s)}" transform="rotate(${f1(k * 72)} ${f1(px + 2.5)} ${f1(py + 2)})" fill="${petal}"/>`;
        g += P(ndArc(px, py, 8 * s, 6.2 * s, k * 72, 350, -0.05, 18), 0.4, 3, 2.2);
      }
      g += `<circle cx="${f1(x + 1.5)}" cy="${f1(y + 1.2)}" r="${f1(4.6 * s)}" fill="${c3}"/>` + P(ndArc(x, y, 4.4 * s, 4.4 * s, 0, 360, 0, 12), 0.2, 2, 2);
      return g;
    };
    const sunFill = F(ndArc(cx, cy, R + 2, R + 1, 0, 360, 0, 48), `url(#${id}a)`, 9, 7);
    const sunLine = P(ndArc(cx, cy, R, R, 205, 378, -0.035), 1.4, 7, 3.4);
    const face = `<path d="${ndD(ndWobble(ndArc(cx - 30, cy - 14, 9, 7, 200, 140), rnd, 0.4, 3))}" fill="none" stroke="${PENCIL}" stroke-width="3.2" stroke-linecap="round"/>`
      + `<path d="${ndD(ndWobble(ndArc(cx + 28, cy - 16, 9, 7, 200, 140), rnd, 0.4, 3))}" fill="none" stroke="${PENCIL}" stroke-width="3.2" stroke-linecap="round"/>`
      + `<ellipse cx="${cx - 46}" cy="${cy + 14}" rx="12" ry="8" fill="${c3}" opacity=".9"/><ellipse cx="${cx + 46}" cy="${cy + 12}" rx="12" ry="8" fill="${c3}" opacity=".9"/>`
      + `<path d="${ndD(ndWobble(ndArc(cx, cy + 6, 34, 30, 22, 136), rnd, 0.7, 4))}" fill="none" stroke="${PENCIL}" stroke-width="3.4" stroke-linecap="round"/>`;
    const note = `<g transform="rotate(-7 86 58)"><text x="22" y="66" font-family="Caveat, 'Patrick Hand', 'Marker Felt', cursive" font-size="34" font-weight="700" fill="${ink}">made by hand!</text></g>`
      + (() => { const [a, h] = ndLoopArrow(84, 88, 166, 132, 11, 1); return P(a, 0.6, 4, 2.4) + P(h, 0.3, 3, 2.4); })();
    return `<svg class="nd-art" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="presentation" focusable="false" style="display:block;width:100%;height:100%">
      <defs>${hatch('a', c1, 18)}${hatch('b', c2, 18)}</defs>
      ${cloud(84, 206, 46, 24)}${cloud(332, 262, 40, 20)}
      ${sunFill}${rays}${sunLine}${face}
      ${hillFill}${P(hill, 1.4, 7, 3.2)}
      ${flower(64, 272, 1, c1)}${flower(118, 292, 0.8, c2)}${flower(206, 272, 0.92, c1)}
      ${note}
    </svg>`;
  },

  materials: [
    { name: 'Wobble line', css: 'stroke: {ink}; stroke-width: 2.6px; stroke-linecap: round; stroke-linejoin: round; /* every outline is a seeded path: sample the shape every 6-8px and push each point along its normal by smooth noise of 0.8-1.6px; loops overshoot their start, square sides run 2-4px past the corners */' },
    { name: 'Crayon fill', css: 'background: repeating-linear-gradient(-45deg, rgba(0,0,0,.14) 0 1.5px, transparent 1.5px 3.6px), {crayon}; border-radius: 18px 12px 20px 14px / 14px 20px 12px 18px; transform: translate(6px, 5px); /* the fill is its own shape, a few px off its outline: coloured in a bit outside the lines */' },
    { name: 'Coloured in (hover)', css: 'transform: translate(1px, 1px); /* the crayon fill snaps back inside its outline */' },
    { name: 'Circled (pressed)', css: 'outline: none; /* a loose hand loop drawn round the button, 10-12px outside it, overshooting its start */' },
    { name: 'Graph paper', css: 'background: linear-gradient(#ECEEE2 1px, transparent 1px) 0 0 / 26px 26px, linear-gradient(90deg, #ECEEE2 1px, transparent 1px) 0 0 / 26px 26px, #FFFBF2;' },
    { name: 'Hand note', css: 'font-family: Caveat, cursive; font-size: 22-26px; transform: rotate(-4deg); /* one handwritten note with a loop arrow per view, pointing at the thing that matters */' },
  ],

  rules: {
    do: [
      'Draw every outline as a wobbly hand line: smooth low-frequency wobble of about 1.5px, round caps, loops that overshoot and box sides that run past the corners.',
      'Fill colour as a separate crayon shape a few pixels off its outline, hatched at 45 degrees; the line always stays warm-black ink.',
      'Keep about 60% of every view empty paper around one big drawing, and let one drawing break a card edge.',
      'Annotate one thing per view with a handwritten note and a loop arrow.',
      'Use handwriting for headlines, buttons and section tabs only; body copy, field values and numbers stay in a tidy sans.',
    ],
    dont: [
      'Use perfect circles, ruler-straight boxes, or thick perfect outlines with hard offset shadows; that is Neo-Brutal Pop.',
      'Jitter or rotate body text, form labels or field values.',
      'Use more than three crayons in a view, pastel ink, or rainbows, balloons and party clip-art.',
      'Copy Haring figures or any artist\'s characters; draw original suns, clouds and flowers.',
    ],
  },

  deck: {
    // cover start size below type.display (1.22): the cover fit then gives the drawing a real
    // share of the slide instead of shrinking it to a thumbnail beside a three-line headline
    coverDisplay: 0.92,
    marks: (ctx, kind) => `<i class="nd-mk" data-k="${kind === 'do' ? 'do' : 'dont'}"></i>`,
    principles: [
      ['Proof a human drew it', 'The line wobbles; the drawing stays confident.'],
      ['Wobble the line, not text', 'Body copy and labels stay straight and readable.'],
      ['Colour outside the lines', 'Fills sit a few pixels off their outlines.'],
    ],
    do: [
      'Offset every fill from its outline by a few pixels.',
      'Keep paper empty around one big drawing.',
      'Annotate one thing with an arrow and a note.',
    ],
    dont: [
      'Use perfect circles or ruler-straight boxes.',
      'Jitter body text or form labels.',
      'Use more than three crayons per view.',
    ],
  },
});
})();
