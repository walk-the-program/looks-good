/* 28 Religious Futurism — sacred, luminous, monumental. References: Dune (2021) title
   design (two colours, classical caps), Richter's Cologne Cathedral window (11,263 glass
   squares from a palette, placed by random number with mirrored lanes), Byzantine gold
   ground and the mandorla, Wallace Corp UI (fewer elements, perfect alignment).

   Mechanism. Light is the sacred material: the client's colours are STAINED GLASS (lifted
   to ~58% lightness so they read as transmitted light, never paint). Gold is thin
   material only (1px rims, rules, rings, glyph lines), never a fill: an oxidised 3-stop
   ramp nudged a few degrees toward the client's warmth. Ground is obsidian (or bone in
   light mode). The hero art is a "pixel cathedral": five ogive windows whose glass is a
   seeded random mosaic from the brand palette with mirrored lanes (Richter's method),
   black leading between the squares, a blurred backlight copy so it reads as transmitted
   light, a nimbus ring with 60 ticks behind the central window, light beams falling on
   the floor, one accent "jewel" pane and tiny liturgical annotations (Roman numerals,
   canonical hours). Everything is built on one centre axis. */
(function () {
let seq = 0;
const RF_CLAMP = (v, a, b) => Math.max(a, Math.min(b, v));

// seeded PRNG (mulberry32) so a brand always gets the same window
function rfRand(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function rfHash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// glass: the colour as transmitted light: keep hue, keep chroma (at least 45%), lift lightness.
function rfGlass(hex, l, minS) {
  const c = hexToHsl(hex);
  return hslToHex(c.h, RF_CLAMP(Math.max(c.s, minS == null ? 45 : minS), 0, 92), l);
}

// oxidised gold ramp, shifted up to 7 degrees toward the client's primary hue
function rfGold(primary) {
  const hp = hexToHsl(primary);
  let d = ((hp.h - 41 + 540) % 360) - 180;
  const sh = RF_CLAMP(d * 0.12, -7, 7);
  const g = (h, s, l) => hslToHex(h + sh, s, l);
  return { hi: g(41, 43, 55), mid: g(40, 52, 38), lo: g(40, 52, 24) };
}

// ogive (two-centred pointed arch) of width w standing on y = yb with its springline at ys
function rfOgive(cx, w, ys, yb) {
  const x0 = cx - w / 2, x1 = cx + w / 2, ya = ys - Math.sqrt(3) / 2 * w;
  return { d: `M${x0} ${yb}V${ys}A${w} ${w} 0 0 1 ${cx} ${ya.toFixed(2)}A${w} ${w} 0 0 1 ${x1} ${ys}V${yb}Z`, ya, x0, x1 };
}

const rfEsc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// The cathedral (board hero, deck cover) and, with a viewBox crop, the Material slide's close-up of the
// centre lancet (lead, saddle bars, glass variation).
function rfArt(ctx, vb) {
  const t = ctx.t, d = t.isDark;
  const id = 'rf' + (++seq);
  const rnd = rfRand(rfHash(String(ctx.brandName || 'brand')));
  const gold = rfGold(t.primary);
  const line = d ? gold.hi : gold.mid;
  // 8-unit panes on a global grid (floor and every window edge sit on a multiple of 8, so the per-pane
  // sheen pattern lines up with every pane); the central window is about 26% of the width
  const W = 800, H = 420, floor = 368, cell = 8;
  const lead = d ? '#050505' : '#2a251c';
  const step = (hex, dl) => { const c = hexToHsl(hex); return hslToHex(c.h, c.s, RF_CLAMP(c.l + dl, 6, 88)); };
  // Richter in tracery, Sainte-Chapelle's dominant key: 65% of the panes are FIXED cool neutral glass
  // (blue-grey, slate, smoke), 25% the brand secondary darkened, at most 10% the primary and the accent.
  // Any palette still reads as a cool window with a few warm sparks, never as a textile or a CRT.
  const NEUTRAL = ['#3B4A5E', '#56627A', '#7A8496', '#A7A9AE', '#6E7279', '#465062'];
  const nPool = [];
  NEUTRAL.forEach(c => { nPool.push(step(c, -7), c, step(c, 5)); });
  const capS = hex => { const c = hexToHsl(hex); return hslToHex(c.h, Math.min(c.s, 70), c.l); };
  const sPool = [rfGlass(t.secondary, 30, 34), rfGlass(t.secondary, 38, 34), rfGlass(t.secondary, 46, 30)].map(capS);
  const pPool = [rfGlass(t.primary, 46, 50), rfGlass(t.primary, 56, 50)].map(capS);
  const aGlass = capS(rfGlass(t.accent, 58, 55));
  const nPick = () => nPool[Math.floor(rnd() * nPool.length)];
  const pick = () => { const r = rnd(); return r < 0.65 ? nPick() : r < 0.9 ? sPool[Math.floor(rnd() * 3)] : r < 0.97 ? pPool[Math.floor(rnd() * 2)] : aGlass; };
  // light mode: the windows seen from OUTSIDE in daylight: dark glass with only a faint hue, no glow;
  // the lit oculus is the one coloured thing
  const outside = hex => { const c = hexToHsl(hex); return hslToHex(c.h, Math.min(c.s, 22), RF_CLAMP(c.l * 0.32 + 8, 8, 26)); };
  const jewel = rfGlass(t.accent, d ? 62 : 54, 60);
  const halo = d ? pPool[1] : t.mix(t.accent, t.canvas, 0.85);

  // one window: mirrored random lanes, cells grouped into one path per colour
  const paths = {};
  const addCell = (col, x, y, s) => { (paths[col] = paths[col] || []).push(`M${x.toFixed(1)} ${y.toFixed(1)}h${s}v${s}h-${s}z`); };
  const win = (cx, cols, top, opts) => {
    const o = opts || {};
    const gw = cols * cell, x0 = cx - gw / 2;
    const ys = top + Math.sqrt(3) / 2 * gw;
    const rows = Math.ceil((floor - top) / cell);
    const lanes = [];
    for (let c = 0; c < Math.ceil(cols / 2); c++) {
      const lane = [];
      for (let r = 0; r < rows; r++) lane.push(pick());
      lanes.push(lane);
    }
    const arch = rfOgive(cx, gw, ys, floor);
    const oc = o.oculus ? { x: cx, y: ys + 0.1 * gw, r: 0.23 * gw } : null;
    const inside = (px, py) => {
      if (py >= ys) return true;
      const dl = Math.hypot(px - arch.x1, py - ys), dr = Math.hypot(px - arch.x0, py - ys);
      return dl <= gw + 0.5 && dr <= gw + 0.5;
    };
    for (let r = 0; r < rows; r++) {
      const y = floor - (r + 1) * cell;
      for (let c = 0; c < cols; c++) {
        const lc = c < cols / 2 ? c : cols - 1 - c;
        const x = x0 + c * cell;
        if (!inside(x + cell / 2, y + cell / 2)) continue;
        if (oc && Math.hypot(x + cell / 2 - oc.x, y + cell / 2 - oc.y) < oc.r + cell * 0.3) continue;
        addCell(d ? lanes[lc][r] : outside(lanes[lc][r]), x + 0.6, y + 0.6, cell - 1.2);
      }
    }
    return { cx, gw, x0, ys, top, arch, oc, cols };
  };
  // one monumental centre lancet, cropped by the top of the frame, 2.2x the height of its flanks
  const wins = [
    win(400, 26, -64, { oculus: true }),
    win(232, 14, 176), win(568, 14, 176),
    win(120, 8, 256), win(680, 8, 256),
  ];

  // the oculus: a rose of two leaded rings (9 panes, then 18), mirrored about the axis, mostly neutral glass,
  // round the single accent jewel
  const c0 = wins[0].oc;
  let rosette = `<circle cx="${c0.x}" cy="${c0.y.toFixed(1)}" r="${(c0.r + 0.6).toFixed(1)}" fill="${lead}"/>`;
  const pt = (r, a) => `${(c0.x + r * Math.cos(a)).toFixed(2)} ${(c0.y + r * Math.sin(a)).toFixed(2)}`;
  const ringOf = (n, r0, r1) => {
    const cols = [];
    for (let i = 0; i <= n / 2; i++) cols.push(rnd() < 0.7 ? nPick() : pick());
    const gap = 0.6 / ((r0 + r1) / 2);
    for (let i = 0; i < n; i++) {
      const a0 = -Math.PI / 2 + (i - 0.5) * (2 * Math.PI / n) + gap, a1 = a0 + 2 * Math.PI / n - 2 * gap;
      const ra = r1 - 0.6, rb = r0 + 0.6;
      rosette += `<path d="M${pt(ra, a0)}A${ra.toFixed(2)} ${ra.toFixed(2)} 0 0 1 ${pt(ra, a1)}L${pt(rb, a1)}A${rb.toFixed(2)} ${rb.toFixed(2)} 0 0 0 ${pt(rb, a0)}Z" fill="${cols[Math.min(i, n - i)]}"/>`;
    }
  };
  ringOf(9, c0.r * 0.3, c0.r * 0.64);
  ringOf(18, c0.r * 0.64, c0.r);
  rosette += `<circle cx="${c0.x}" cy="${c0.y.toFixed(1)}" r="${(c0.r * 0.3 - 0.6).toFixed(1)}" fill="${jewel}"/>`;

  const mosaic = Object.keys(paths).map(c => `<path d="${paths[c].join('')}" fill="${c}"/>`).join('') + rosette;
  // tracery: two mullions per lancet (at the thirds, on the pane grid) and an iron saddle bar every 6 rows,
  // all in lead 2.2 units wide with a hairline catch-light; drawn inside the window clip
  let iron = '', ironHi = '';
  wins.forEach(w => {
    for (let k = 1; ; k++) {
      const y = floor - 6 * k * cell;
      if (y < Math.max(w.top, -10) + 6) break;
      if (w.oc && y > w.oc.y - w.oc.r - 3 && y < w.oc.y + w.oc.r + 3) continue;
      iron += `M${w.x0} ${y - 1.1}h${w.gw}v2.2h-${w.gw}z`;
      ironHi += `M${w.x0} ${y - 1.2}h${w.gw}`;
    }
    const m = Math.round(w.cols / 3);
    [m, w.cols - m].forEach(c => {
      const x = w.x0 + c * cell;
      const segs = w.oc ? [[-80, w.oc.y - w.oc.r - 2], [w.oc.y + w.oc.r + 2, floor]] : [[-80, floor]];
      segs.forEach(([a, b]) => { iron += `M${x - 1.1} ${a.toFixed(1)}h2.2V${b.toFixed(1)}h-2.2z`; ironHi += `M${x - 0.7} ${a.toFixed(1)}V${b.toFixed(1)}`; });
    });
  });
  const armature = `<path d="${iron}" fill="${lead}"/><path d="${ironHi}" stroke="${line}" stroke-width=".5" stroke-opacity=".5" fill="none"/>`;
  const clip = wins.map(w => `<path d="${w.arch.d}"/>`).join('');
  const leadFill = wins.map(w => `<path d="${w.arch.d}" fill="${lead}"/>`).join('');
  const rims = wins.map(w => {
    const o = rfOgive(w.cx, w.gw + 9, w.ys, floor);
    return `<path d="${w.arch.d}" fill="none" stroke="${line}" stroke-width=".9" stroke-opacity=".9"/><path d="${o.d}" fill="none" stroke="${line}" stroke-width=".7" stroke-opacity=".45"/>`;
  }).join('') + `<circle cx="${c0.x}" cy="${c0.y.toFixed(1)}" r="${(c0.r + 0.8).toFixed(1)}" fill="none" stroke="${line}" stroke-width=".8" stroke-opacity=".85"/>`;

  // nimbus: two thin rings and 60 ticks behind the central window
  const nx = 400, ny = 186;
  let ticks = '';
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2, long = i % 5 === 0;
    const r0 = 166, r1 = r0 + (long ? 7 : 4);
    ticks += `M${(nx + r0 * Math.cos(a)).toFixed(1)} ${(ny + r0 * Math.sin(a)).toFixed(1)}L${(nx + r1 * Math.cos(a)).toFixed(1)} ${(ny + r1 * Math.sin(a)).toFixed(1)}`;
  }
  // the light lands: the mosaic itself, flipped, sheared and squashed onto the stone floor, blurred, fading out
  const fm = `matrix(1 0 -0.24 -0.34 ${(0.24 * floor).toFixed(1)} ${(1.34 * floor).toFixed(1)})`;
  const num = ['III', 'II', 'II', 'I', 'I'];
  const ann = wins.map((w, i) => `<text x="${w.cx}" y="${floor + 16}" text-anchor="middle">${num[i]}</text>`).join('');
  const nameCaps = rfEsc(String(ctx.brandName || '').trim().toUpperCase().slice(0, 22));
  return `<svg viewBox="${vb || `0 0 ${W} ${H}`}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" focusable="false" class="rfa">
    <defs>
      <linearGradient id="${id}f" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${line}" stop-opacity="0"/><stop offset=".18" stop-color="${line}" stop-opacity=".7"/><stop offset=".82" stop-color="${line}" stop-opacity=".7"/><stop offset="1" stop-color="${line}" stop-opacity="0"/></linearGradient>
      <radialGradient id="${id}n" cx="50%" cy="35%" r="55%"><stop offset="0" stop-color="${halo}" stop-opacity="${d ? 0.2 : 0.16}"/><stop offset="1" stop-color="${halo}" stop-opacity="0"/></radialGradient>
      <linearGradient id="${id}sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="${d ? 0.16 : 0.2}"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${d ? 0.2 : 0.14}"/></linearGradient>
      <pattern id="${id}p" width="${cell}" height="${cell}" patternUnits="userSpaceOnUse"><rect width="${cell}" height="${cell}" fill="url(#${id}sg)"/></pattern>
      <linearGradient id="${id}mg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>
      <mask id="${id}m" maskUnits="userSpaceOnUse" x="0" y="${floor}" width="${W}" height="${H - floor}"><rect x="0" y="${floor}" width="${W}" height="${H - floor}" fill="url(#${id}mg)"/></mask>
      <clipPath id="${id}c">${clip}</clipPath>
      <filter id="${id}bl" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${d ? 11 : 8}"/></filter>
      <filter id="${id}fb" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2 5"/></filter>
      <filter id="${id}t" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .9 -.35"/></filter>
    </defs>
    <ellipse cx="400" cy="170" rx="340" ry="220" fill="url(#${id}n)"/>
    <circle cx="${nx}" cy="${ny}" r="160" fill="none" stroke="${line}" stroke-width=".8" stroke-opacity=".7"/>
    <circle cx="${nx}" cy="${ny}" r="154" fill="none" stroke="${line}" stroke-width=".5" stroke-opacity=".4"/>
    <path d="${ticks}" stroke="${line}" stroke-width=".7" stroke-opacity=".75" fill="none"/>
    ${d ? `<g mask="url(#${id}m)"><g transform="${fm}" opacity=".5"><g filter="url(#${id}fb)"><g clip-path="url(#${id}c)">${mosaic}</g></g></g></g>
    <g clip-path="url(#${id}c)" filter="url(#${id}bl)" opacity=".45">${leadFill}${mosaic}</g>` : ''}
    ${leadFill}
    <g clip-path="url(#${id}c)">${mosaic}<rect width="${W}" height="${floor}" fill="url(#${id}p)"/><rect width="${W}" height="${floor}" filter="url(#${id}t)" opacity="${d ? 0.12 : 0.1}"/>${armature}</g>
    ${rims}
    <rect x="40" y="${floor}" width="720" height="1" fill="url(#${id}f)"/>
    <g fill="${t.ink}" fill-opacity=".72" style="font-family:var(--ab-font-label,monospace);font-size:8.5px;letter-spacing:.22em" text-anchor="middle">
      ${ann}
      <text x="52" y="${floor + 36}" text-anchor="start" fill-opacity=".6">MATINS · 03:00</text>
      <text x="400" y="${floor + 36}" fill-opacity=".6">${nameCaps}</text>
      <text x="748" y="${floor + 36}" text-anchor="end" fill-opacity=".6">VESPERS · 18:00</text>
    </g>
  </svg>`;
}

registerAesthetic({
  key: 'religious-futurism', order: 28,
  name: 'Religious Futurism',
  descriptor: 'Sacred · Luminous · Monumental',
  influences: 'Dune (2021) / Cathedral stained glass / Richter\'s pixel windows',
  summary: 'A digital cathedral: obsidian ground, thin gold lines and the brand colours as stained-glass light.',
  motto: 'Let there be light.',
  kicker: 'Vespers',
  mode: 'dark',
  slideShape: 'classic',
  labels: { material: 'Relics', states: ['Unlit', 'Dawn', 'Full light'], statesKind: 'swatch' },
  layout: { hero: 'centered', palette: 'swatches', sections: 'two-col' },
  type: { ui: 'body', label: 'mono', display: 1 },
  highlight: 'custom',
  highlightNote: 'The last word is set in oxidised gold light (the gold ramp\'s high step on obsidian, its mid step on bone) with a 1px gold rule beneath it that tapers to nothing at both ends; no fill, no glow, no band, never raw accent yellow.',

  roles: {
    canvas: {
      use: 'Obsidian (near-black, stone-like) in dark mode, bone #EDE6D6-class in light mode: the monumental silence. Gold is a fixed material, not a client colour: an oxidised ramp #B8964B / #8C6D2E / #5E4A1E for 1px rims, rules and rings only',
      never: 'Text, a gold fill or gradient panel; pure white or pure-gold-on-white',
      coverage: '65–75%',
    },
    ink: {
      use: 'Bone-coloured text: monumental caps headlines, small-caps annotations (small text is bone, never gold, to keep 4.5:1)',
      never: 'Large fields; decorative gold substitutes',
      coverage: '10–15%',
    },
    primary: {
      use: 'The principal stained glass and halo light: the main action glass, the halo arc and lit states, the largest mosaic lanes; lifted to about 58% lightness so it glows',
      never: 'Paint-like flat fills, body text, neon outer glow, a second CTA',
      coverage: '≈10%',
    },
    secondary: {
      use: 'The second glass family: second mosaic lane, the arch\'s inner wash, rosary beads and progress track',
      never: 'The main action, body text, page background',
      coverage: '≈8–10%',
    },
    accent: {
      use: 'The one relic jewel: a single accent pane in the window, the selected tab\'s halo dot, the progress head and the headline\'s last word',
      never: 'Buttons, panel fills, borders, more than one jewel per view',
      coverage: '≤3%',
    },
  },

  canvas(b) {
    if (b.isDark) { const h = b.hexToHsl(b.canvas); return b.hslToHex(h.h, Math.min(h.s, 14), Math.min(h.l, 4.6)); }
    return b.mix('#EDE6D6', b.canvas, 0.82);
  },

  tokens(t) {
    const d = t.isDark;
    const gold = rfGold(t.primary);
    const line = d ? gold.hi : gold.mid;
    const glass1 = rfGlass(t.primary, d ? 58 : 50);
    let ctaBg = t.mix(t.primary, '#0D0B0B', 0.55);
    for (let k = 1; k <= 12 && t.contrast('#F6F1E6', ctaBg) < 7; k++) ctaBg = t.mix(t.primary, '#0D0B0B', 0.55 - k * 0.04);
    return {
      '--ab-type-pick-w': 400,
      '--ab-gold': line,
      '--ab-gold-hi': gold.hi,
      '--ab-hl-ink': d ? gold.hi : gold.mid,   // the highlight word: oxidised gold light, never raw accent yellow
      '--ab-gold-mid': gold.mid,
      '--ab-gold-lo': gold.lo,
      '--ab-gold-line': t.alpha(line, d ? 0.55 : 0.7),
      '--ab-gold-faint': t.alpha(line, d ? 0.2 : 0.3),
      '--ab-gold-ghost': t.alpha(line, d ? 0.1 : 0.16),
      '--ab-glass': glass1,
      '--ab-glass-deep': rfGlass(t.primary, d ? 26 : 34, 38),
      '--ab-halo': t.alpha(glass1, d ? 0.34 : 0.22),
      '--ab-leading': d ? '#050505' : '#2a251c',
      '--ab-stone': d ? t.mix(t.ink, t.canvas, 0.035) : t.mix('#ffffff', t.canvas, 0.35),
      '--ab-on-glass': t.contrast('#0a0a0c', glass1) >= t.contrast('#f4efe3', glass1) ? '#0a0a0c' : '#f4efe3',
      // the main action: deep glass (55% primary into near-black) under a bone label at >= 7:1
      '--rf-cta': ctaBg,
      '--rf-cta-ink': '#F6F1E6',
      // the state panes: unlit glass, and the lit pane's glass (the cool neutral key with one primary pane)
      '--rf-pane-dark': d ? '#14171D' : '#1C1F25',
      '--rf-pane-cool': d ? '#56627A' : '#3B4A5E',
      '--rf-pane-cool2': d ? '#7A8496' : '#56627A',
    };
  },

  art(ctx) { return rfArt(ctx, ''); },

  materials: [
    { name: 'Gold rim', css: 'border: 1px solid {goldLine}; /* gold is a 1px line, never a fill: oxidised ramp {goldHi} / {goldMid} / {goldLo}; a second inset hairline 4px inside at {goldFaint} gives the double rule */' },
    { name: 'Obsidian arch panel', css: 'background: {stone}; border: 1px solid {goldLine}; border-top: 0; /* with a pointed (ogive) cap: two 2-centre arcs meeting at an apex, stroked 1px gold; 3% stone grain */' },
    { name: 'Stained-glass pane', css: 'background: {glass}; box-shadow: inset 0 0 0 1px {leading}, 0 0 28px {halo}; /* client colour lifted to ~58% lightness, 2px near-black leading around every cell, a blurred copy behind at 40% so it reads as light, not pigment */' },
    { name: 'Main action (glass)', css: 'background: radial-gradient(120% 140% at 50% 0, {glass}, {glassDeep}); color: {onGlass}; border: 1px solid {goldLine}; border-radius: 0; font-variant-caps: all-small-caps; letter-spacing: .2em;' },
    { name: 'Halo ring', css: 'border: 1px solid {goldLine}; border-radius: 50%; box-shadow: 0 0 0 5px {goldGhost}, 0 0 22px {halo}; /* 60 ticks, a thicker progress arc and a disc at its head; small caps percent inside */' },
    { name: 'Mandorla', css: 'border: 1px solid {goldLine}; border-radius: 0 100% 0 100%; transform: rotate(45deg); /* a vesica around the selected item; neutral geometry, never a faith symbol */' },
    { name: 'Rosary strip', css: 'background: radial-gradient(circle, {gold} 2.2px, transparent 2.8px) 0 50% / 14px 100% repeat-x; /* progress as beads: filled gold, the current bead a glass glow; track beads at {goldFaint} */' },
  ],

  rules: {
    do: [
      'Use gold only as a 1px rim, rule or ring; the glass colours carry the brand and glow as transmitted light on obsidian.',
      'Compose on one centre axis with huge silence: ogive arches, halo rings and mandorlas, never more than three forms per view.',
      'Set headlines in monumental caps with wide tracking, small text in bone small caps or mono with Roman numerals and canonical hours.',
      'Build stained glass as a seeded mosaic of small square panes: about two thirds fixed neutral cathedral glass, the brand colours the minority, mirrored lanes, black leading and iron saddle bars, backlit by a blurred copy and cast onto the floor.',
    ],
    dont: [
      'Fill panels or buttons with gold gradients, add sparkle, or use casino yellow; gold never exceeds a hairline.',
      'Use crosses, crescents or any symbol of a specific faith, fantasy blackletter headlines, or Orbitron.',
      'Over-glow: glass is backlit light, not neon; no outer glow brighter than 35%.',
      'Fill the silence: if a view feels crowded, remove elements rather than shrink them.',
    ],
  },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    coverDisplay: 1.3,
    coverBand: false,
    // Material slide: the centre lancet at about 3.6x (the board art scaled by its viewBox, not by css)
    materialArt: ctx => rfArt(ctx, '345 186 222 117'),   // two centred lines at >= 72px; the cathedral beneath takes the lower half of the cover
    principles: [
      ['Gold is a rim, never a fill', 'Gold appears only as thin rims, rules and rings.'],
      ['Brand colour is the light', 'Client colours glow as stained glass, never as paint.'],
      ['Slow, still, monumental', 'Few large forms, huge silence, tiny liturgical annotation.'],
    ],
    do: [
      'Use ogive arches, halos and mandorlas.',
      'Set small-caps serif with tiny annotations.',
      'Leave generous obsidian silence.',
    ],
    dont: [
      'Fill panels with gold gradients.',
      'Use crosses or faith-specific symbols.',
      'Add sparkle or neon glow.',
    ],
  },
});
})();
