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
  labels: { material: 'Relics', states: ['Dormant', 'Lit', 'Consecrated'], statesKind: 'swatch' },
  layout: { hero: 'centered', palette: 'swatches', sections: 'two-col' },
  type: { ui: 'body', label: 'mono', display: 1 },
  highlight: 'custom',
  highlightNote: 'The last word is set in the accent-ink colour (the relic jewel) with a 1px gold rule beneath it that tapers to nothing at both ends; no fill, no glow, no band.',

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
    const glass2 = rfGlass(t.secondary, d ? 58 : 50);
    return {
      '--ab-type-pick-w': 400,
      '--ab-gold': line,
      '--ab-gold-hi': gold.hi,
      '--ab-gold-mid': gold.mid,
      '--ab-gold-lo': gold.lo,
      '--ab-gold-line': t.alpha(line, d ? 0.55 : 0.7),
      '--ab-gold-faint': t.alpha(line, d ? 0.2 : 0.3),
      '--ab-gold-ghost': t.alpha(line, d ? 0.1 : 0.16),
      '--ab-glass': glass1,
      '--ab-glass-deep': rfGlass(t.primary, d ? 26 : 34, 38),
      '--ab-glass2': glass2,
      '--ab-halo': t.alpha(glass1, d ? 0.34 : 0.22),
      '--ab-leading': d ? '#050505' : '#2a251c',
      '--ab-stone': d ? t.mix(t.ink, t.canvas, 0.035) : t.mix('#ffffff', t.canvas, 0.35),
      '--ab-on-glass': t.contrast('#0a0a0c', glass1) >= t.contrast('#f4efe3', glass1) ? '#0a0a0c' : '#f4efe3',
    };
  },

  art(ctx) {
    const t = ctx.t, d = t.isDark;
    const id = 'rf' + (++seq);
    const rnd = rfRand(rfHash(String(ctx.brandName || 'brand')));
    const gold = rfGold(t.primary);
    const line = d ? gold.hi : gold.mid;
    const W = 800, H = 340, floor = 296, cell = 14;
    const lead = d ? '#050505' : '#2a251c';
    // glass palette: weights make the primary and secondary families dominant, the rest rare
    const g1 = rfGlass(t.primary, d ? 58 : 52), g1d = rfGlass(t.primary, d ? 40 : 38, 40), g1p = rfGlass(t.primary, d ? 76 : 66, 36);
    const g2 = rfGlass(t.secondary, d ? 58 : 52), g2d = rfGlass(t.secondary, d ? 40 : 38, 40);
    const gm = rfGlass(t.mix(t.primary, t.secondary, 0.5), d ? 52 : 46, 40);
    const deep = rfGlass(t.primary, d ? 20 : 28, 35);
    const base = [g1, g1, g1, g1d, g1d, g2, g2, g2, g2d, g2d, gm, gm, deep, deep, deep, g1p];
    // each pane gets one of three lightness steps so the glass has depth, not flat tiles
    const step = (hex, dl) => { const c = hexToHsl(hex); return hslToHex(c.h, c.s, RF_CLAMP(c.l + dl, 6, 88)); };
    const pool = [];
    base.forEach(c => { pool.push(step(c, -7), c, step(c, 7)); });
    const jewel = rfGlass(t.accent, d ? 62 : 54, 60);
    // backlight colour: the glass primary glows in dark mode; in light mode the nimbus and floor light are
    // accent-on-canvas parchment (bone, not a pink-peach wash)
    const halo = d ? g1 : t.mix(t.accent, t.canvas, 0.85);

    // one window: mirrored random lanes, cells grouped into one path per colour
    const paths = {};
    const addCell = (col, x, y, s) => { (paths[col] = paths[col] || []).push(`M${x.toFixed(1)} ${y.toFixed(1)}h${s}v${s}h-${s}z`); };
    const win = (cx, w, top, label) => {
      const cols = Math.max(3, Math.round(w / cell));
      const gw = cols * cell;
      const x0 = cx - gw / 2;
      const ys = top + Math.sqrt(3) / 2 * gw;
      const rows = Math.ceil((floor - top) / cell);
      const lanes = [];
      for (let c = 0; c < Math.ceil(cols / 2); c++) {
        const lane = [];
        for (let r = 0; r < rows; r++) lane.push(pool[Math.floor(rnd() * pool.length)]);
        lanes.push(lane);
      }
      const arch = rfOgive(cx, gw, ys, floor);
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
          addCell(lanes[lc][r], x + 0.9, y + 0.9, cell - 1.8);
        }
      }
      return { cx, gw, ys, arch, label };
    };
    const wins = [win(400, 154, 30), win(246, 98, 98), win(554, 98, 98), win(126, 56, 164), win(674, 56, 164)];

    // the single jewel: one accent pane two rows below the central apex
    const jx = 400 - cell / 2 + 0.9, jy = 30 + Math.sqrt(3) / 2 * (11 * cell) + cell * 1.4;
    const mosaic = Object.keys(paths).map(c => `<path d="${paths[c].join('')}" fill="${c}"/>`).join('')
      + `<path d="M${jx.toFixed(1)} ${jy.toFixed(1)}h${cell - 1.8}v${cell - 1.8}h-${cell - 1.8}z" fill="${jewel}"/>`;
    const clip = wins.map(w => `<path d="${w.arch.d}"/>`).join('');
    const leadFill = wins.map(w => `<path d="${w.arch.d}" fill="${lead}"/>`).join('');
    const rims = wins.map((w, i) => {
      const o = rfOgive(w.cx, w.gw + 9, w.ys, floor);
      return `<path d="${w.arch.d}" fill="none" stroke="${line}" stroke-width=".9" stroke-opacity=".9"/><path d="${o.d}" fill="none" stroke="${line}" stroke-width=".7" stroke-opacity=".45"/>`;
    }).join('');

    // nimbus: two thin rings and 60 ticks behind the central window
    const nx = 400, ny = 120;
    let ticks = '';
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2, long = i % 5 === 0;
      const r0 = 142, r1 = r0 + (long ? 7 : 4);
      ticks += `M${(nx + r0 * Math.cos(a)).toFixed(1)} ${(ny + r0 * Math.sin(a)).toFixed(1)}L${(nx + r1 * Math.cos(a)).toFixed(1)} ${(ny + r1 * Math.sin(a)).toFixed(1)}`;
    }
    // light falling on the floor: skewed quads under each window
    const beams = wins.map((w, i) => {
      const half = w.gw / 2 - 6, spread = 30 + w.gw * 0.55;
      const sk = (i === 0 ? 0 : (w.cx < 400 ? -1 : 1) * 14);
      return `<path d="M${w.cx - half} ${floor}H${w.cx + half}L${w.cx + half + spread + sk} ${H}H${w.cx - half - spread + sk}Z" fill="url(#${id}b)" opacity="${i === 0 ? 0.9 : 0.6}"/>`;
    }).join('');
    // tiny liturgical annotation
    const num = ['III', 'II', 'II', 'I', 'I'];   // window order: centre, inner pair, outer pair
    const ann = wins.map((w, i) => `<text x="${w.cx}" y="${floor + 16}" text-anchor="middle">${num[i]}</text>`).join('');
    const nameCaps = escapeHtml(String(ctx.brandName || '').trim().toUpperCase().slice(0, 22));
    return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" focusable="false" class="rfa">
      <defs>
        <linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${halo}" stop-opacity="${d ? 0.34 : 0.28}"/><stop offset="1" stop-color="${halo}" stop-opacity="0"/></linearGradient>
        <linearGradient id="${id}f" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${line}" stop-opacity="0"/><stop offset=".18" stop-color="${line}" stop-opacity=".7"/><stop offset=".82" stop-color="${line}" stop-opacity=".7"/><stop offset="1" stop-color="${line}" stop-opacity="0"/></linearGradient>
        <radialGradient id="${id}n" cx="50%" cy="35%" r="55%"><stop offset="0" stop-color="${halo}" stop-opacity="${d ? 0.22 : 0.16}"/><stop offset="1" stop-color="${halo}" stop-opacity="0"/></radialGradient>
        <clipPath id="${id}c">${clip}</clipPath>
        <filter id="${id}bl" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${d ? 11 : 8}"/></filter>
      </defs>
      <ellipse cx="400" cy="130" rx="330" ry="200" fill="url(#${id}n)"/>
      <circle cx="${nx}" cy="${ny}" r="136" fill="none" stroke="${line}" stroke-width=".8" stroke-opacity=".7"/>
      <circle cx="${nx}" cy="${ny}" r="130" fill="none" stroke="${line}" stroke-width=".5" stroke-opacity=".4"/>
      <path d="${ticks}" stroke="${line}" stroke-width=".7" stroke-opacity=".75" fill="none"/>
      ${beams}
      <g clip-path="url(#${id}c)" filter="url(#${id}bl)" opacity="${d ? 0.55 : 0.32}">${leadFill}${mosaic}</g>
      ${leadFill}
      <g clip-path="url(#${id}c)">${mosaic}</g>
      ${rims}
      <rect x="40" y="${floor}" width="720" height="1" fill="url(#${id}f)"/>
      <g fill="${t.ink}" fill-opacity=".72" style="font-family:var(--ab-font-label,monospace);font-size:8.5px;letter-spacing:.22em" text-anchor="middle">
        ${ann}
        <text x="52" y="${floor + 34}" text-anchor="start" fill-opacity=".6">MATINS · 03:00</text>
        <text x="400" y="${floor + 34}" fill-opacity=".6">${nameCaps}</text>
        <text x="748" y="${floor + 34}" text-anchor="end" fill-opacity=".6">VESPERS · 18:00</text>
      </g>
    </svg>`;
  },

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
      'Build stained glass as a seeded square mosaic with mirrored lanes and 2px black leading, backlit by a blurred copy.',
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
    coverDisplay: 1.3,   // two centred lines at >= 72px; the cathedral beneath takes the lower half of the cover
    principles: [
      ['Gold is a rim, never fill', 'Gold appears only as thin rims, rules and rings.'],
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
