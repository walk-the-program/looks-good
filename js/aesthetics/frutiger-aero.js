/* 37 Frutiger Aero — glossy, bright, playful. Mid-2000s consumer tech as good weather: an iPod-nano
   rainbow of candy colour, Vista/XP glass and gel, bubbly orbs, sparkles and swooshes, over a sunny
   aqua sky and a lime hill. Every control is a wet gel object lit from above.
   References: the Frutiger Aero Archive and CARI's catalogue entry (glossy gel pills, humanist
   sans, aurora, bokeh, bubbles), Windows Vista/7 Aero (tinted glass title bars with a HARD
   diagonal gloss streak, glowing caption buttons), Mac OS X Aqua (the "lickable" gel button:
   saturated pill, white specular cap over the top half with a crisp lower lip, light pooling at
   the base), the Wii menu and MSN-era bubbly UI (white glossy tiles, candy orbs), and the
   iPod nano rainbow. Drawn from primitives, never traced.

   Mechanism.
   - Gel object (buttons, orbs, swatches, the active segment, toggle-on, progress, avatars): a vertical
     gradient (base +34% L → base at 55% → base -9% L), a white specular CAP over the top ~48% with
     a crisp lower edge (no blur; the lip is the tell), a base caustic, a 1px darker rim and a small
     coloured drop shadow. The client primary is the dominant gel, lifted to candy lightness
     (def.printPrimary) so a dark brand colour never turns to mud.
   - Companion hues: the primary's triad (+120, +240) and its complement (+180), each at high
     chroma and each given its own gel label check. They carry the second and third gels (toggle,
     avatars, progress fills), the unselected tab tints, the orbs, the swooshes and the sparkles.
     An achromatic primary gets a fixed candy set (green, violet, orange).
   - Aero glass chrome: white glass + 1px dark outer / 1px white inner rim + the hard 115deg streak,
     with a three-stop rainbow line along the foot of every title bar. The board's header is the
     title bar of an Aero window (caption buttons, red close gel); the cards are windows.
   - Environment: def.art draws a sunny aqua sky with light rays, sparkles, a lens-flare string,
     rainbow swooshes (each with a white gloss line), a bright lime hill, glossy orbs in the four
     hues rising on the left, and the water with the primary orb mirrored on the wet floor.
   - Wet-floor headline: def.headline returns the light humanist headline plus its reflection
     (flipped, faded by a gradient overlay, never a CSS mask), so the headline sits on the horizon
     and is mirrored in the water. Dark mode is the Aero night: black glass, aurora, stars, the same
     candy orbs and swooshes at lower strength.
   Export-safe: no mask-image and no backdrop-filter (glass is a near-opaque fill). */
(function () {
let seq = 0;
const FA_KEY = 'frutiger-aero';   // abCopy key for the plain functions below (js/aesthetics/registry.js)

const FA_TEXT = '#23415A';        // deep blue-grey text (never black)
const FA_TEXT_NIGHT = '#EAF5FF';
const FA_GRASS = '#7ED33F';       // fixed lime grass when the secondary is not a landscape hue
const FA_CLOSE = '#D9442B';       // the window close button is always a red gel
const FA_CANDY_FALLBACK = ['#3DD65C', '#9B4DFF', '#FF8A1F']; // companions for an achromatic primary

function faHsl(hex) { return hexToHsl(hex); }
function faHex(h, s, l) { return hslToHex(h, Math.max(0, Math.min(100, s)), Math.max(0, Math.min(100, l))); }

// Gel base for a control that carries a label: candy chroma, lightness 40-62, then the label
// that reaches 4.5:1 — white where the gel can be shaded to carry it (Aero), else the
// deep blue-grey (Aqua's dark-label gels).
function faGelBase(hex) {
  const c = faHsl(hex);
  const h = c.h;
  const s = c.s > 12 ? Math.max(c.s, 55) : c.s;
  let l = Math.min(62, Math.max(40, c.l));
  const W = k => contrastRatio('#ffffff', faHex(h, s, k));
  // a dark label must hold on the base stop too (the gel darkens toward the foot under the label)
  const D = k => Math.min(contrastRatio('#0E2233', faHex(h, s, k)), contrastRatio('#0E2233', faHex(h, s, Math.max(6, k - 9))));
  const yellow = h >= 38 && h <= 80;
  let label = '';
  if (!yellow) {
    let k = l;
    while (k > 32 && W(k) < 4.5) k--;
    if (W(k) >= 4.5) { l = k; label = '#ffffff'; }
  }
  if (!label) { let k = l; while (k < 82 && D(k) < 4.5) k++; l = k; label = '#0E2233'; }
  return { h, s, l, hex: faHex(h, s, l), label };
}

// Decorative gel (bubbles tint, seal, toggle-on): candy, no label constraint.
function faCandy(hex) {
  const c = faHsl(hex);
  const s = c.s > 12 ? Math.max(c.s, 60) : c.s;
  return { h: c.h, s, l: Math.min(66, Math.max(46, c.l)) };
}

// the gradient stops of a gel
function faGelStops(g) {
  return {
    top: faHex(g.h, g.s, Math.min(93, g.l + 34)),
    mid: faHex(g.h, g.s, g.l),
    bot: faHex(g.h, g.s, Math.max(6, g.l - 9)),
    rim: faHex(g.h, Math.min(100, g.s + 6), Math.max(4, g.l - 20)),
    glow: faHex(g.h, Math.min(100, g.s + 8), Math.min(92, g.l + 28)),
  };
}

// Companion hues [c1, c2, c3]: the primary's triad (+120, +240) and its complement (+180), pushed
// to high chroma. Each is a labelled gel, so it can carry a label or read as candy beside the primary.
function faCompanions(t) {
  const c = faHsl(t.primary);
  const hexes = c.s > 12
    ? [120, 240, 180].map(d => faHex(c.h + d, Math.max(c.s, 86), 52))
    : FA_CANDY_FALLBACK;
  return hexes.map(hex => { const g = faGelBase(hex); return { hex, g, st: faGelStops(g) }; });
}

// A pale glass tint for an unselected tab or a soft chip, in one companion hue, that holds 4.5:1
// against the ink on both stops (night: a deep tint under the light ink).
function faTint(c, ink, night) {
  const h = faHsl(c.hex);
  const s = Math.max(h.s, 80);
  const pair = l => night
    ? [faHex(h.h, s, l - 6), faHex(h.h, s, l)]
    : [faHex(h.h, s, l + 6), faHex(h.h, s, l)];
  // light ink: start pale and darken nothing (lighter stops keep dark ink legible); night ink:
  // start mid-deep and step darker. Both walk toward the side where the contrast grows.
  let l = night ? 40 : 90;
  for (let i = 0; i < 60; i++) {
    const [a, b] = pair(l);
    if (contrastRatio(a, ink) >= 4.5 && contrastRatio(b, ink) >= 4.5) return { top: a, bot: b };
    l -= 1;
  }
  const [a, b] = pair(l);
  return { top: a, bot: b };
}

// Gel custom properties for one companion: the stops, the label, its rim, shadow and gradient.
function faGelVars(p, c, t) {
  const st = c.st;
  return {
    [`--ab-fa-${p}-top`]: st.top, [`--ab-fa-${p}`]: st.mid, [`--ab-fa-${p}-bot`]: st.bot,
    [`--ab-fa-${p}-rim`]: st.rim, [`--ab-fa-${p}-glow`]: st.glow,
    [`--ab-fa-${p}-on`]: c.g.label,
    [`--ab-fa-${p}-on-sh`]: c.g.label === '#ffffff' ? 'rgba(0, 0, 0, 0.35)' : 'rgba(255, 255, 255, 0.45)',
    [`--ab-fa-${p}-sh`]: t.alpha(st.mid, 0.38),
    [`--ab-fa-${p}-bg`]: `radial-gradient(70% 40% at 50% 100%, ${st.glow}, transparent 70%), linear-gradient(180deg, ${st.top} 0%, ${st.mid} 36%, ${st.bot} 100%)`,
  };
}

// Secondary as landscape: green-ish hues become the hill; anything else keeps the fixed lime grass.
function faHill(t) {
  const c = faHsl(t.secondary);
  const land = c.h >= 70 && c.h <= 170 && c.s >= 18;
  const base = land ? { h: c.h, s: Math.max(c.s, 52), l: Math.min(54, Math.max(42, c.l)) } : faHsl(FA_GRASS);
  return {
    crest: faHex(base.h, base.s + 6, Math.min(80, base.l + 22)),
    mid: faHex(base.h, base.s, base.l),
    foot: faHex(base.h, base.s, Math.max(18, base.l - 16)),
    far: faHex(base.h - 8, Math.max(20, base.s - 22), Math.min(82, base.l + 24)),
    own: land,
  };
}

// The faces being rendered: the view state passed to the hook (a blend swaps them), else the
// app state. Weights are then read with the shared abWeightNear.
function faFonts(st) {
  const v = st || (typeof state !== 'undefined' ? state : null);
  return { h: v && v.headingFont, b: v && v.bodyFont };
}

// Last word of the headline as .ab-hl (same split as the framework's abHeadline).
function faHlHtml(text) {
  const s = String(text || '').trim();
  const m = s.match(/^([\s\S]*?)([^\s]+?)([.,;:!?…]*)$/);
  if (!m) return escapeHtml(s);
  return `${escapeHtml(m[1])}<span class="ab-hl">${escapeHtml(m[2])}</span>${escapeHtml(m[3])}`;
}

// The same split for the wet-floor copies, as generated content (data-t + ::before): the
// reflection is decoration, so it carries no text nodes (no duplicate headline for screen
// readers, copy/paste or text audits), only painted glyphs.
function faHlRefl(text) {
  const s = String(text || '').trim();
  const m = s.match(/^([\s\S]*?)([^\s]+?)([.,;:!?…]*)$/);
  const part = (t, cls) => (t ? `<span class="fa-rt${cls ? ' ' + cls : ''}" data-t="${escapeHtml(t)}"></span>` : '');
  if (!m) return part(s);
  return part(m[1]) + part(m[2], 'ab-hl') + part(m[3]);
}

/* ---------------- art: the sky, the swooshes, the hill, the orbs, the water ---------------- */

// The four candy stops of the scene: [primary, c1, c2, c3]
function faHues(t) {
  const co = faCompanions(t);
  return { sts: [faGelStops(faGelBase(t.primary)), ...co.map(c => c.st)], co };
}

function faCloud(cx, cy, k, fill, shade) {
  // a cumulus cluster: overlapping circles over a flat base, lit from above
  const c = [[-1.05, 0.12, 0.42], [-0.62, -0.18, 0.55], [-0.05, -0.42, 0.72], [0.55, -0.2, 0.56], [1.0, 0.1, 0.4], [0.22, 0.06, 0.5], [-0.38, 0.12, 0.46]];
  const circles = c.map(([x, y, r]) => `<circle cx="${(cx + x * k).toFixed(1)}" cy="${(cy + y * k).toFixed(1)}" r="${(r * k).toFixed(1)}"/>`).join('');
  return `<g fill="${fill}">${circles}<rect x="${(cx - 1.25 * k).toFixed(1)}" y="${(cy + 0.1 * k).toFixed(1)}" width="${(2.5 * k).toFixed(1)}" height="${(0.38 * k).toFixed(1)}" rx="${(0.19 * k).toFixed(1)}"/></g>
    <ellipse cx="${cx.toFixed(1)}" cy="${(cy + 0.36 * k).toFixed(1)}" rx="${(1.18 * k).toFixed(1)}" ry="${(0.12 * k).toFixed(1)}" fill="${shade}"/>`;
}

// A four-point sparkle: a pinched star (quadratic sides through the centre), white
function faSpark(x, y, r) {
  return `<path d="M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z" fill="#fff"/>`;
}

// A glossy orb cap: the top ~48% of a circle of radius r, centred on the origin, with a crisp lower lip
function faBallCap(r) {
  const p = (x, y) => `${(x * r).toFixed(1)} ${(y * r).toFixed(1)}`;
  return `M${p(-0.74, -0.1)}C${p(-0.74, -0.7)} ${p(-0.3, -0.84)} ${p(0.02, -0.84)}S${p(0.74, -0.7)} ${p(0.74, -0.1)}C${p(0.5, 0.02)} ${p(-0.5, 0.02)} ${p(-0.74, -0.1)}Z`;
}

function faSky(t, id, night) {
  const hill = faHill(t);
  const { sts, co } = faHues(t);
  const rb = sts.map(s => s.mid);
  const sky = night
    ? `<stop offset="0" stop-color="#010812"/><stop offset=".42" stop-color="#05203A"/><stop offset=".78" stop-color="#0C4566"/><stop offset="1" stop-color="#2A86A3"/>`
    : `<stop offset="0" stop-color="#0AA6EE"/><stop offset=".34" stop-color="#41C8FF"/><stop offset=".66" stop-color="#9CEBFF"/><stop offset="1" stop-color="#EFFFD9"/>`;
  // rainbow swooshes: three candy arcs in the four hues, each with a white gloss line along its top edge
  const swooshes = [
    ['M-60 330C200 150 520 90 820 130S1380 250 1680 120', 30, night ? 0.5 : 0.85],
    ['M-60 396C260 240 560 200 880 222S1400 330 1680 252', 13, night ? 0.4 : 0.8],
    ['M980 640C1070 420 1300 316 1690 350', 20, night ? 0.35 : 0.62],
  ].map(([d, w, o]) => `<path d="${d}" fill="none" stroke="url(#${id}rb)" stroke-width="${w}" stroke-linecap="round" opacity="${o}"/>
    <path d="${d}" fill="none" stroke="#fff" stroke-opacity="${night ? 0.25 : 0.7}" stroke-width="${(w * 0.22).toFixed(1)}" stroke-linecap="round" transform="translate(0 ${(-w * 0.28).toFixed(1)})" opacity="${o}"/>`).join('');
  const clouds = night ? '' : [
    faCloud(250, 205, 118, '#ffffff', 'rgba(40,120,190,.14)'),
    faCloud(1220, 300, 84, '#ffffff', 'rgba(40,120,190,.12)'),
    faCloud(720, 120, 46, 'rgba(255,255,255,.9)', 'rgba(40,120,190,.08)'),
  ].join('');
  let stars = '';
  if (night) {
    let a = 7;
    const r = () => { a = (a * 9301 + 49297) % 233280; return a / 233280; };
    for (let i = 0; i < 70; i++) stars += `<circle cx="${(r() * 1600).toFixed(0)}" cy="${(r() * 380).toFixed(0)}" r="${(0.8 + r() * 1.8).toFixed(1)}" fill="#fff" opacity="${(0.25 + r() * 0.6).toFixed(2)}"/>`;
  }
  // light rays fanning down and left from the sun
  const sx = 1270, sy = 120;
  const rays = night ? '' : [116, 130, 144, 158].map(a => {
    const r1 = a * Math.PI / 180, r2 = (a + 2.4) * Math.PI / 180;
    return `<path d="M${sx} ${sy}L${(sx + 1800 * Math.cos(r1)).toFixed(0)} ${(sy + 1800 * Math.sin(r1)).toFixed(0)}L${(sx + 1800 * Math.cos(r2)).toFixed(0)} ${(sy + 1800 * Math.sin(r2)).toFixed(0)}Z" fill="#fff" fill-opacity=".16"/>`;
  }).join('');
  // sparkles: a soft glow and a four-point star each
  const sparkPts = night
    ? [[1270, 120, 16], [700, 80, 9], [1480, 250, 8], [150, 150, 9], [980, 170, 6]]
    : [[1270, 120, 40], [700, 80, 15], [1040, 58, 10], [1480, 250, 12], [150, 150, 13], [560, 300, 8], [1380, 80, 11]];
  const sparks = sparkPts.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${(r * 2.6).toFixed(1)}" fill="url(#${id}sp)"/>${faSpark(x, y, r)}`).join('');
  // one lens-flare string on a diagonal from the sun, the rings in the companion hues
  const flare = night ? '' : [[0.22, 34, 0.16], [0.36, 14, 0.3], [0.5, 52, 0.08], [0.62, 20, 0.22], [0.78, 9, 0.35]].map(([p, r, o], i) => {
    const x = sx + (640 - sx) * p, y = sy + (560 - sy) * p, col = rb[(i + 1) % 4];
    return `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r}" fill="${col}" fill-opacity="${(o * 0.5).toFixed(2)}" stroke="${col}" stroke-opacity="${(o + 0.25).toFixed(2)}" stroke-width="1.6"/>`;
  }).join('');
  // glossy orbs in the four hues, rising on the left: [x, y, r, hue index into rb]
  const balls = [[150, 520, 30, 2], [228, 448, 16, 1], [118, 404, 11, 3], [300, 380, 22, 0], [208, 330, 9, 1], [380, 300, 13, 2], [96, 272, 18, 3], [262, 236, 7, 0], [470, 250, 10, 1], [520, 470, 12, 2]]
    .map(([x, y, r, k]) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="url(#${id}bl${k})"/><circle r="${r}" fill="url(#${id}b)"/><path d="${faBallCap(r)}" fill="url(#${id}kk)"/><circle r="${r - 0.6}" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="${r > 14 ? 1.6 : 1.1}"/></g>`).join('');
  // bokeh: soft out-of-focus discs drifting down from the sun
  const bokeh = [[1130, 210, 26, 0.22], [1190, 260, 14, 0.3], [1060, 170, 10, 0.32], [1340, 240, 34, 0.14], [990, 250, 18, 0.18], [1400, 160, 12, 0.26], [880, 300, 8, 0.3]].map(([x, y, r, o]) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id}bk)" opacity="${night ? o * 0.8 : o * 2.2}"/>`).join('');
  const hillFoot = night ? '#06261A' : hill.foot;
  const hillMid = night ? '#0B3A28' : hill.mid;
  const hillCrest = night ? '#1E6A55' : hill.crest;
  const ballDefs = sts.map((s, k) => `<linearGradient id="${id}bl${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.top}"/><stop offset=".55" stop-color="${s.mid}"/><stop offset="1" stop-color="${s.bot}"/></linearGradient>`).join('');
  return `<svg class="fa-sky" viewBox="0 0 1600 640" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1">${sky}</linearGradient>
      <radialGradient id="${id}sun" cx="${sx}" cy="${sy}" r="${night ? 200 : 330}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${night ? '#fff' : '#FFF8D6'}" stop-opacity="${night ? 0.5 : 0.95}"/><stop offset=".25" stop-color="#fff" stop-opacity="${night ? 0.16 : 0.45}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
      <radialGradient id="${id}glow" cx="800" cy="640" r="760" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${night ? '#5FD3E8' : '#ffffff'}" stop-opacity="${night ? 0.35 : 0.8}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
      <linearGradient id="${id}rb" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${rb[0]}"/><stop offset=".33" stop-color="${rb[1]}"/><stop offset=".66" stop-color="${rb[2]}"/><stop offset="1" stop-color="${rb[3]}"/></linearGradient>
      <radialGradient id="${id}sp"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".35" stop-color="#fff" stop-opacity=".4"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
      <radialGradient id="${id}bk"><stop offset="0" stop-color="${night ? '#9FE8F5' : '#fff'}" stop-opacity=".7"/><stop offset=".8" stop-color="${night ? '#9FE8F5' : '#fff'}" stop-opacity=".45"/><stop offset="1" stop-color="${night ? '#9FE8F5' : '#fff'}" stop-opacity="0"/></radialGradient>
      <radialGradient id="${id}b" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".04"/><stop offset=".72" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity=".55"/></radialGradient>
      <linearGradient id="${id}kk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity=".15"/></linearGradient>
      ${ballDefs}
      <linearGradient id="${id}h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${hillCrest}"/><stop offset=".45" stop-color="${hillMid}"/><stop offset="1" stop-color="${hillFoot}"/></linearGradient>
      <linearGradient id="${id}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${night ? '#12404A' : hill.far}"/><stop offset="1" stop-color="${night ? '#0A2A36' : hill.mid}" stop-opacity="${night ? 1 : 0.8}"/></linearGradient>
    </defs>
    <rect width="1600" height="640" fill="url(#${id}s)"/>
    <rect width="1600" height="640" fill="url(#${id}glow)"/>
    ${stars}
    <rect width="1600" height="640" fill="url(#${id}sun)"/>
    ${rays}
    ${swooshes}
    ${bokeh}
    ${clouds}
    ${flare}
    ${sparks}
    <path d="M820 640C930 560 1040 520 1180 512S1460 540 1640 590V640Z" fill="url(#${id}f)"/>
    <path d="M-40 640C40 560 150 500 300 486S560 520 760 640Z" fill="url(#${id}h)"/>
    <path d="M-40 640C40 560 150 500 300 486S560 520 760 640" fill="none" stroke="#fff" stroke-opacity="${night ? 0.28 : 0.6}" stroke-width="3"/>
    <path d="M1010 640C1110 540 1230 470 1380 462S1580 500 1660 540V640Z" fill="url(#${id}h)"/>
    <path d="M1010 640C1110 540 1230 470 1380 462S1580 500 1660 540" fill="none" stroke="#fff" stroke-opacity="${night ? 0.28 : 0.6}" stroke-width="3"/>
    <g stroke="${night ? '#2D7F69' : hill.crest}" stroke-width="2" stroke-linecap="round" opacity=".75">${[[220, 500], [262, 494], [340, 492], [1300, 474], [1350, 468], [1440, 476]].map(([x, y]) => `<path d="M${x} ${y + 10}q-3 -9 -8 -14M${x + 6} ${y + 10}q1 -10 4 -15"/>`).join('')}</g>
    ${balls}
  </svg>`;
}

function faWater(t, id, night) {
  const top = night ? '#0E3E5A' : '#E8FBFF';
  const mid = night ? '#082D46' : '#7FDDF7';
  const bot = night ? '#041A2C' : '#1BAEE3';
  const lines = [0.16, 0.3, 0.46, 0.62, 0.8].map((y, i) => `<path d="M${-40 + i * 37} ${(y * 200).toFixed(0)}h${360 + i * 60}M${640 + i * 41} ${(y * 200 + 6).toFixed(0)}h${420 - i * 30}M${1200 - i * 23} ${(y * 200 - 4).toFixed(0)}h${300 + i * 40}"/>`).join('');
  return `<svg class="fa-water-svg" viewBox="0 0 1600 200" preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <defs><linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset=".45" stop-color="${mid}"/><stop offset="1" stop-color="${bot}"/></linearGradient></defs>
    <rect width="1600" height="200" fill="url(#${id}w)"/>
    <rect width="1600" height="3" fill="#fff" fill-opacity="${night ? 0.25 : 0.9}"/>
    <g stroke="#fff" stroke-opacity="${night ? 0.16 : 0.5}" stroke-width="2" stroke-linecap="round" fill="none">${lines}</g>
  </svg>`;
}

// The primary gel orb and its wet-floor reflection (one svg, the horizon at its middle).
function faOrb(t, id, initial, night, fonts) {
  const g = faGelBase(t.primary);
  const st = faGelStops(g);
  const ini = escapeHtml(initial);
  const body = `<circle cx="60" cy="60" r="54" fill="url(#${id}o)"/>
      <circle cx="60" cy="60" r="54" fill="url(#${id}c)"/>
      <circle cx="60" cy="60" r="53.2" fill="none" stroke="${st.rim}" stroke-width="1.6"/>
      <text x="60" y="76" text-anchor="middle" font-family="var(--ab-font-h, sans-serif)" font-size="46" font-weight="${abWeightNear(fonts.h, 600)}" fill="${g.label}" fill-opacity=".92">${ini}</text>
      <path d="M17 50C17 25 37 12 60 12S103 25 103 50C103 58 84 61 60 61S17 58 17 50Z" fill="url(#${id}k)"/>`;
  return `<svg class="fa-orb" viewBox="0 0 120 240" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="${id}o" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${st.top}"/><stop offset=".55" stop-color="${st.mid}"/><stop offset="1" stop-color="${st.bot}"/></linearGradient>
      <radialGradient id="${id}c" cx="60" cy="104" r="46" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${st.glow}" stop-opacity=".85"/><stop offset="1" stop-color="${st.glow}" stop-opacity="0"/></radialGradient>
      <linearGradient id="${id}k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".92"/><stop offset="1" stop-color="#fff" stop-opacity=".18"/></linearGradient>
      <linearGradient id="${id}m" x1="0" y1="120" x2="0" y2="200" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity="${night ? 0.32 : 0.42}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <mask id="${id}mk" maskUnits="userSpaceOnUse" x="0" y="120" width="120" height="120"><rect x="0" y="120" width="120" height="120" fill="url(#${id}m)"/></mask>
      <radialGradient id="${id}sh" cx="60" cy="121" r="40" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${st.rim}" stop-opacity=".45"/><stop offset="1" stop-color="${st.rim}" stop-opacity="0"/></radialGradient>
    </defs>
    <g transform="translate(0 -4)">${body}</g>
    <ellipse cx="60" cy="121" rx="44" ry="4.5" fill="url(#${id}sh)"/>
    <g mask="url(#${id}mk)"><g transform="translate(0 244) scale(1 -1)">${body.replace(/<text[\s\S]*?<\/text>/, '')}</g></g>
    <g stroke="#fff" stroke-opacity=".5" stroke-width="1.4" stroke-linecap="round"><path d="M24 136h30M66 140h34M34 150h22M70 156h20"/></g>
  </svg>`;
}

function faScene(ctx) {
  const t = ctx.t;
  const fonts = faFonts(ctx.state);
  const id = `fa${++seq}`;
  const night = !!t.isDark;
  return `<div class="fa-scene" data-night="${night ? 1 : 0}">
    ${faSky(t, id, night)}
    <div class="fa-water">${faWater(t, id, night)}</div>
    <div class="fa-orb-wrap">${faOrb(t, id, ctx.initial, night, fonts)}</div>
    ${faSeal(t, id, fonts)}
  </div>`;
}

// the "new" starburst: a 12-point star in the third companion gel with a cap, lowercase label
function faSeal(t, id, fonts) {
  const a = faCompanions(t)[2];
  const st = a.st;
  const lab = a.g.label;
  let pts = '';
  for (let i = 0; i < 24; i++) {
    const r = i % 2 ? 39 : 48, an = (Math.PI * 2 * i) / 24 - Math.PI / 2;
    pts += `${(50 + r * Math.cos(an)).toFixed(1)},${(50 + r * Math.sin(an)).toFixed(1)} `;
  }
  return `<svg class="fa-seal" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
    <defs><linearGradient id="${id}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${st.top}"/><stop offset=".55" stop-color="${st.mid}"/><stop offset="1" stop-color="${st.bot}"/></linearGradient></defs>
    <polygon points="${pts.trim()}" fill="url(#${id}a)" stroke="${st.rim}" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M17 44C20 26 34 15 50 15S80 26 83 44C72 49 62 50 50 50S28 49 17 44Z" fill="#fff" fill-opacity=".6"/>
    <text x="50" y="60" text-anchor="middle" font-family="var(--ab-font-b, sans-serif)" font-size="24" font-weight="${abWeightNear(fonts.b, 600)}" fill="${lab}" color="${lab}">${abCopy(FA_KEY, 'seal')}</text>
  </svg>`;
}

// The closing slide's side strip (288 x 720 on the slide): the hero world in a column — sky,
// sun, a rainbow swoosh, clouds, the lime hill with its white rim, the water and a few bubbles
// (night: stars, aurora-free dark hill). One SVG data URI, so it exports as drawn.
function faStripUri(t, night) {
  const hill = faHill(t);
  const { sts } = faHues(t);
  const rb = sts.map(s => s.mid);
  const sky = night
    ? `<stop offset='0' stop-color='#010812'/><stop offset='.42' stop-color='#05203A'/><stop offset='.78' stop-color='#0C4566'/><stop offset='1' stop-color='#2A86A3'/>`
    : `<stop offset='0' stop-color='#0AA6EE'/><stop offset='.34' stop-color='#41C8FF'/><stop offset='.66' stop-color='#9CEBFF'/><stop offset='1' stop-color='#EFFFD9'/>`;
  const water = night ? ['#0E3E5A', '#082D46', '#041A2C'] : ['#E8FBFF', '#7FDDF7', '#1BAEE3'];
  const hc = night ? ['#1E6A55', '#0B3A28', '#06261A'] : [hill.crest, hill.mid, hill.foot];
  let stars = '';
  if (night) {
    let a = 11;
    const r = () => { a = (a * 9301 + 49297) % 233280; return a / 233280; };
    for (let i = 0; i < 26; i++) stars += `<circle cx='${(r() * 288).toFixed(0)}' cy='${(r() * 380).toFixed(0)}' r='${(0.7 + r() * 1.4).toFixed(1)}' fill='#fff' opacity='${(0.3 + r() * 0.6).toFixed(2)}'/>`;
  }
  const clouds = night ? '' : faCloud(96, 170, 62, '#ffffff', 'rgba(40,120,190,.14)') + faCloud(226, 310, 40, 'rgba(255,255,255,.92)', 'rgba(40,120,190,.1)');
  const bubbles = [[58, 604, 16, rb[2]], [104, 572, 9, rb[1]], [210, 640, 12, rb[3]], [246, 590, 7, rb[0]]].map(([x, y, r, col]) =>
    `<circle cx='${x}' cy='${y}' r='${r}' fill='${col}' fill-opacity='.35' stroke='#fff' stroke-opacity='.85' stroke-width='1.3'/><ellipse cx='${(x - r * 0.36).toFixed(1)}' cy='${(y - r * 0.42).toFixed(1)}' rx='${(r * 0.32).toFixed(1)}' ry='${(r * 0.2).toFixed(1)}' fill='#fff' fill-opacity='.95'/>`).join('');
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='288' height='720' viewBox='0 0 288 720'>
    <defs>
      <linearGradient id='s' x1='0' y1='0' x2='0' y2='1'>${sky}</linearGradient>
      <radialGradient id='sun' cx='236' cy='92' r='${night ? 150 : 230}' gradientUnits='userSpaceOnUse'><stop offset='0' stop-color='#fff' stop-opacity='${night ? 0.4 : 0.95}'/><stop offset='.3' stop-color='#fff' stop-opacity='${night ? 0.12 : 0.4}'/><stop offset='1' stop-color='#fff' stop-opacity='0'/></radialGradient>
      <linearGradient id='r' x1='0' y1='0' x2='1' y2='0'><stop offset='0' stop-color='${rb[0]}'/><stop offset='.33' stop-color='${rb[1]}'/><stop offset='.66' stop-color='${rb[2]}'/><stop offset='1' stop-color='${rb[3]}'/></linearGradient>
      <linearGradient id='h' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='${hc[0]}'/><stop offset='.45' stop-color='${hc[1]}'/><stop offset='1' stop-color='${hc[2]}'/></linearGradient>
      <linearGradient id='w' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='${water[0]}'/><stop offset='.45' stop-color='${water[1]}'/><stop offset='1' stop-color='${water[2]}'/></linearGradient>
    </defs>
    <rect width='288' height='540' fill='url(#s)'/>
    ${stars}
    <rect width='288' height='540' fill='url(#sun)'/>
    <path d='M-30 330C60 240 170 300 320 220' fill='none' stroke='url(#r)' stroke-width='22' stroke-linecap='round' opacity='${night ? 0.5 : 0.85}'/>
    <path d='M-30 322C60 232 170 292 320 212' fill='none' stroke='#fff' stroke-opacity='.6' stroke-width='5' stroke-linecap='round'/>
    ${clouds}
    <path d='M150 540C190 492 236 470 300 468V540Z' fill='${night ? '#12404A' : hill.far}' opacity='.9'/>
    <path d='M-20 540C10 470 70 430 140 426S250 470 300 540Z' fill='url(#h)'/>
    <path d='M-20 540C10 470 70 430 140 426S250 470 300 540' fill='none' stroke='#fff' stroke-opacity='${night ? 0.28 : 0.6}' stroke-width='3'/>
    <rect y='540' width='288' height='180' fill='url(#w)'/>
    <rect y='540' width='288' height='3' fill='#fff' fill-opacity='${night ? 0.25 : 0.9}'/>
    <g stroke='#fff' stroke-opacity='${night ? 0.16 : 0.5}' stroke-width='2' stroke-linecap='round'><path d='M20 572h96M150 584h110M40 618h70M140 648h120M30 686h90'/></g>
    ${bubbles}
  </svg>`;
  return `url("data:image/svg+xml;utf8,${svg.replace(/\s*\n\s*/g, '').replace(/"/g, "'").replace(/'/g, '%27').replace(/#/g, '%23')}")`;
}

// Puts an Aero title bar (label + caption buttons) at the top of a default card / panel markup.
function faWindow(html, cls, title, buttons) {
  const bar = `<div class="fa-titlebar" aria-hidden="true"><span>${escapeHtml(title)}</span><i class="fa-caption" data-b="${buttons}"></i></div>`;
  const open = `<div class="${cls}">`;
  return html.includes(open) ? html.replace(open, `<div class="${cls} fa-window">${bar}`) : '';
}

// Material slide: one gel button and one orb, labelled like a spec sheet, over a pale sky with a
// wet floor. Plain SVG (export-safe); the labels use the brand body face.
function faAnatomy(ctx) {
  const t = ctx.t;
  const night = !!t.isDark;
  const id = `fa${++seq}`;
  const g = faGelBase(t.primary);
  const st = faGelStops(g);
  const ink = night ? FA_TEXT_NIGHT : FA_TEXT;
  const bw = abWeightNear(faFonts(ctx.state).b, 600);
  const pill = `<rect x="80" y="196" width="400" height="96" rx="48" fill="url(#${id}g)"/>
      <ellipse cx="280" cy="286" rx="150" ry="22" fill="url(#${id}c)"/>
      <rect x="80.8" y="196.8" width="398.4" height="94.4" rx="47.2" fill="none" stroke="${st.rim}" stroke-width="1.6"/>
      <path d="M104 236C104 214 122 202 146 202H414C438 202 456 214 456 236C456 242 444 244 420 244H140C116 244 104 242 104 236Z" fill="url(#${id}k)"/>`;
  const label = `<text x="280" y="256" text-anchor="middle" font-family="var(--ab-font-b, sans-serif)" font-size="25" font-weight="${bw}" fill="${g.label}">${abCopy(FA_KEY, 'btnLabel')}</text>`;
  const call = (x1, y1, x2, y2, tx, ty, anchor, a, b) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${ink}" stroke-opacity=".55" stroke-width="1.4" fill="none"/><circle cx="${x1}" cy="${y1}" r="4" fill="${ink}"/>
      <text x="${tx}" y="${ty}" text-anchor="${anchor}" font-family="var(--ab-font-b, sans-serif)" fill="${ink}"><tspan font-size="17" font-weight="${bw}">${a}</tspan><tspan x="${tx}" dy="21" font-size="15" fill-opacity=".8">${b}</tspan></text>`;
  const orbCol = faCompanions(t)[1].st;
  return `<svg class="fa-anatomy" viewBox="0 0 600 520" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${night ? '#0B2A44' : '#CFF4FF'}"/><stop offset=".62" stop-color="${night ? '#0E3E5A' : '#F4FFF6'}"/><stop offset=".62" stop-color="${night ? '#0A3049' : '#C8F0FB'}"/><stop offset="1" stop-color="${night ? '#061C2E' : '#8FDCF2'}"/></linearGradient>
      <linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${st.top}"/><stop offset=".55" stop-color="${st.mid}"/><stop offset="1" stop-color="${st.bot}"/></linearGradient>
      <radialGradient id="${id}c" cx="280" cy="292" r="150" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${st.glow}" stop-opacity=".9"/><stop offset="1" stop-color="${st.glow}" stop-opacity="0"/></radialGradient>
      <linearGradient id="${id}k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity=".22"/></linearGradient>
      <linearGradient id="${id}m" x1="0" y1="322" x2="0" y2="400" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <mask id="${id}mk" maskUnits="userSpaceOnUse" x="0" y="300" width="600" height="120"><rect x="0" y="300" width="600" height="120" fill="url(#${id}m)"/></mask>
      <radialGradient id="${id}sh" cx="290" cy="300" r="190" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${st.mid}" stop-opacity=".45"/><stop offset="1" stop-color="${st.mid}" stop-opacity="0"/></radialGradient>
      <radialGradient id="${id}o" cx=".5" cy=".85" r=".7"><stop offset="0" stop-color="${orbCol.glow}"/><stop offset=".6" stop-color="${orbCol.mid}"/><stop offset="1" stop-color="${orbCol.bot}"/></radialGradient>
    </defs>
    <rect x="1" y="1" width="598" height="518" rx="22" fill="url(#${id}s)"/>
    <ellipse cx="290" cy="304" rx="200" ry="14" fill="url(#${id}sh)"/>
    ${pill}${label}
    <g mask="url(#${id}mk)"><g transform="translate(0 610) scale(1 -1)">${pill}</g></g>
    <g stroke="#fff" stroke-opacity=".55" stroke-width="1.6" stroke-linecap="round"><path d="M120 344h90M250 352h120M410 342h60M160 372h70"/></g>
    <circle cx="500" cy="104" r="44" fill="url(#${id}o)"/><circle cx="500" cy="104" r="43.2" fill="none" stroke="${orbCol.rim}" stroke-width="1.5"/>
    <path d="M467 96C467 78 482 66 500 66S533 78 533 96C533 102 518 104 500 104S467 102 467 96Z" fill="url(#${id}k)"/>
    ${call(150, 214, 150, 138, 40, 104, 'start', abCopy(FA_KEY, 'call1'), abCopy(FA_KEY, 'call1Sub'))}
    ${call(456, 104, 380, 60, 372, 40, 'end', abCopy(FA_KEY, 'call2'), abCopy(FA_KEY, 'call2Sub'))}
    ${call(330, 280, 420, 420, 590, 446, 'end', abCopy(FA_KEY, 'call3'), abCopy(FA_KEY, 'call3Sub'))}
    ${call(150, 338, 110, 440, 30, 470, 'start', abCopy(FA_KEY, 'call4'), abCopy(FA_KEY, 'call4Sub'))}
  </svg>`;
}

registerAesthetic({
  key: 'frutiger-aero', order: 37,
  name: 'Frutiger Aero',
  descriptor: 'Glossy · Bright · Bubbly',
  influences: 'Y2K tech optimism / Skeuomorphic gloss / Candy rainbow',
  summary: 'Sunny aqua sky, rainbow swooshes and candy orbs, with every control a wet glossy gel lit from above.',
  motto: 'Technology as good weather.',   // = copy.motto.text
  kicker: 'Clear skies ahead',            // = copy.kicker.text
  mode: 'light',
  slideShape: 'soft',
  labels: { material: 'Gloss', states: ['Rest', 'Shine', 'Pressed'], statesKind: 'button' },
  // Editable specimen copy (Brand > Advanced > Specimen copy).
  copy: {
    motto: { label: 'Motto', text: 'Technology as good weather.' },
    kicker: { label: 'Kicker above the headline', text: 'Clear skies ahead' },
    state0: { label: 'State 1 name', text: 'Rest' },
    state1: { label: 'State 2 name', text: 'Shine' },
    state2: { label: 'State 3 name', text: 'Pressed' },
    seal: { label: 'Starburst seal text', text: 'new' },
    btnLabel: { label: 'Material specimen button label', text: 'Save direction' },
    call1: { label: 'Material callout 1 title', text: 'Specular cap' },
    call1Sub: { label: 'Material callout 1 detail', text: 'a crisp lower lip, no blur' },
    call2: { label: 'Material callout 2 title', text: 'Every icon in a gel orb' },
    call2Sub: { label: 'Material callout 2 detail', text: 'one sphere per icon' },
    call3: { label: 'Material callout 3 title', text: 'Caustic' },
    call3Sub: { label: 'Material callout 3 detail', text: 'light pools at the base' },
    call4: { label: 'Material callout 4 title', text: 'Wet floor' },
    call4Sub: { label: 'Material callout 4 detail', text: 'flipped, faded into the water' },
    winCard: { label: 'Card window title', text: 'Project — Untitled' },
    winPanel: { label: 'Panel window title', text: 'Settings' },
    colName: { label: 'List column 1', text: 'Name' },
    colStatus: { label: 'List column 2', text: 'Status' },
    colProgress: { label: 'List column 3', text: 'Progress' },
  },
  layout: { hero: 'centered', palette: 'swatches', sections: 'two-col', subcopy: true },
  type: { ui: 'body', label: 'body', display: 1 },
  highlight: 'custom',
  highlightNote: 'The headline is a light humanist sans on the horizon with a wet-floor reflection beneath it; the last word takes the primary gel colour with a soft white Vista glow. In running UI text the highlight word is the gel colour, never a filled pill.',
  cardFill: '--ab-glass',

  roles: {
    canvas: {
      use: 'Fixed white air: cool white #F2F7FB (light) or the Aero night #071A2B (dark) behind glass windows; the hero is a sunny aqua sky #0AA6EE → #EFFFD9 over a water strip. About 60% of any view is sky or white air',
      never: 'Text, a dark page in light mode, a flat client colour as the page',
      coverage: '55–65%',
    },
    ink: {
      use: 'Text is the fixed deep blue-grey #23415A (night: #EAF5FF), never pure black; 1px glass rims are blue-grey too',
      never: 'Pure black, large fills, gel labels on light gels where it fails 4.5:1',
      coverage: '15–20%',
    },
    primary: {
      use: 'The dominant gel: the ONE main action (gel pill with a crisp specular cap), the active segment, the hero orb and its reflection, the progress gel. Lifted to candy lightness so it never reads as mud',
      never: 'Flat fills without the cap, body text, more than one gel CTA per view, the page ground',
      coverage: '≈10–12%',
    },
    secondary: {
      use: 'The landscape: a bright lime hill #7ED33F (or the client secondary when it is a plausible green); the companion gels of the triad (+120, +240) on the second and third list rows and in the progress fills',
      never: 'The main action, body text, the sky',
      coverage: '≈10–15%',
    },
    accent: {
      use: 'Companion sparks: the complement (+180) in the "new" starburst, the bubbles, sparkles and the swoosh ends; the triad\'s first hue is the toggle-on gel. Unselected tabs take a pale tint of each companion',
      never: 'Body text, borders, large fills, a second CTA',
      coverage: '≤8%',
    },
  },

  canvas(b) {
    return b.isDark ? '#071A2B' : '#F2F7FB';
  },

  // The gel: the client primary lifted to candy lightness, then shaded only as far as its
  // label needs to reach 4.5:1 (white label), else a dark-label gel (Aqua).
  printPrimary(t) {
    return faGelBase(t.primary).hex;
  },

  headline(ctx, text) {
    const inner = faHlHtml(text);
    // the wet floor: the headline flipped under its baseline, cut into five horizontal slices that
    // fade and drift a hair sideways (ripples). Plain opacity, so it exports without a mask.
    const refl = faHlRefl(text);
    const slices = [0, 1, 2, 3, 4].map(i => `<span class="fa-rs" style="--i:${i}"><span>${refl}</span></span>`).join('');
    return `<span class="fa-hl"><span class="fa-hl-txt">${inner}</span><span class="fa-hl-refl" aria-hidden="true">${slices}</span></span>`;
  },

  tokens(t, st) {
    const night = t.isDark;
    const g = faGelBase(t.primary);
    const gs = faGelStops(g);
    const co = faCompanions(t);
    const rb = [gs, ...co.map(c => c.st)].map(s => s.mid);
    const ink = night ? FA_TEXT_NIGHT : FA_TEXT;
    const canvas = t.canvas;
    let muted = night ? '#A9C4D9' : '#4D6880';
    if (contrastRatio(muted, canvas) < 4.5) muted = night ? '#C2D6E6' : '#3E5A72';
    // the highlight word: the gel colour as text, shaded until it reaches 3:1 on the horizon glow
    const horizon = night ? '#1C6684' : '#E3F5FF';
    let hl = faHex(g.h, g.s, g.l);
    for (let l = g.l; l >= 18 && l <= 90 && contrastRatio(hl, horizon) < 3.2; l += night ? 2 : -2) hl = faHex(g.h, g.s, l);
    // unselected tabs: one pale tint per companion (Design: c3, Build: c1, Launch: c2)
    const tints = [co[2], co[0], co[1]].map(c => faTint(c, ink, night));
    const fonts = faFonts(st);
    return {
      '--ab-type-pick-w': 400,
      '--fa-lw': abWeightNear(fonts.h, 300),
      '--fa-hbw': abWeightNear(fonts.h, 600),
      '--fa-bw': abWeightNear(fonts.b, 600),
      '--fa-nbw': abWeightNear(fonts.b, 700),
      '--ab-ink': ink,
      '--ab-muted': muted,
      '--ab-line': night ? 'rgba(170, 210, 240, 0.22)' : 'rgba(35, 65, 90, 0.16)',
      '--ab-glass': night ? 'rgba(14, 34, 54, 0.72)' : 'rgba(255, 255, 255, 0.78)',
      '--ab-fa-glass': night ? 'rgba(14, 34, 54, 0.72)' : 'rgba(255, 255, 255, 0.78)',
      '--ab-fa-rim-out': night ? 'rgba(0, 0, 0, 0.55)' : 'rgba(35, 65, 90, 0.24)',
      '--ab-fa-rim-in': night ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.9)',
      '--ab-fa-streak': night ? 'rgba(255, 255, 255, 0.10)' : 'rgba(255, 255, 255, 0.62)',
      '--ab-fa-bar-a': night ? '#1D3A55' : '#F2FCFF',
      '--ab-fa-bar-b': night ? '#0B1F33' : '#A8E4F8',
      '--ab-fa-rainbow': `linear-gradient(90deg, ${rb[0]} 0 25%, ${rb[1]} 25% 50%, ${rb[2]} 50% 75%, ${rb[3]} 75%)`,
      '--ab-fa-gel-top': gs.top, '--ab-fa-gel': gs.mid, '--ab-fa-gel-bot': gs.bot, '--ab-fa-gel-rim': gs.rim, '--ab-fa-gel-glow': gs.glow,
      '--ab-fa-gel-on': g.label,
      // a one-pixel drop under gel labels: dark under white type, light under dark type
      '--ab-fa-gel-on-sh': g.label === '#ffffff' ? 'rgba(0, 0, 0, 0.35)' : 'rgba(255, 255, 255, 0.45)',
      '--ab-fa-gel-shadow': t.alpha(gs.mid, 0.38),
      // companions: c1 (triad +120), c2 (triad +240), c3 (complement +180)
      ...faGelVars('c1', co[0], t),
      ...faGelVars('c2', co[1], t),
      ...faGelVars('c3', co[2], t),
      // the toggle-on and the accent gel are the first companion
      '--ab-fa-acc-top': co[0].st.top, '--ab-fa-acc': co[0].st.mid, '--ab-fa-acc-bot': co[0].st.bot, '--ab-fa-acc-rim': co[0].st.rim, '--ab-fa-acc-on': co[0].g.label,
      '--ab-fa-tint-1': `linear-gradient(180deg, ${tints[0].top}, ${tints[0].bot})`,
      '--ab-fa-tint-2': `linear-gradient(180deg, ${tints[1].top}, ${tints[1].bot})`,
      '--ab-fa-tint-3': `linear-gradient(180deg, ${tints[2].top}, ${tints[2].bot})`,
      '--ab-fa-close-top': '#F6A390', '--ab-fa-close': FA_CLOSE, '--ab-fa-close-bot': '#A92A16',
      '--ab-fa-hl': hl,
      '--ab-fa-sel-a': night ? '#1E4A6E' : '#E8F4FF', '--ab-fa-sel-b': night ? '#163B5A' : '#CDE6FF', '--ab-fa-sel-rim': night ? '#3D7DB0' : '#7DA2CE',
      '--ab-fa-field-b': night ? '#4C7393' : '#9DB7CC',
      '--ab-fa-strip': faStripUri(t, night),
      '--ab-fa-text-glow': night ? 'rgba(0, 20, 40, 0.75)' : 'rgba(255, 255, 255, 0.9)',
    };
  },

  art(ctx) {
    return faScene(ctx);
  },

  // Real window chrome for the 01 card, the 02 panel and the 03 list (title bars with their text
  // and caption buttons), instead of CSS generated content.
  panels: {
    card(ctx) {
      return faWindow(ctx.parts.cardBase(), 'ab-card', abCopyRaw(FA_KEY, 'winCard'), 'all');
    },
    panel(ctx) {
      return faWindow(ctx.parts.panelBase(), 'ab-panel', abCopyRaw(FA_KEY, 'winPanel'), 'close');
    },
    list(ctx) {
      return `<div class="fa-explorer"><div class="fa-lhead" aria-hidden="true"><span>${abCopy(FA_KEY, 'colName')}</span><span>${abCopy(FA_KEY, 'colStatus')}</span><span>${abCopy(FA_KEY, 'colProgress')}</span></div>${ctx.parts.listBase()}</div>`;
    },
  },

  materials: [
    { name: 'Gel', css: 'background: linear-gradient(180deg, {faGelTop} 0%, {faGel} 55%, {faGelBot} 100%); color: {faGelOn}; border-radius: 999px; box-shadow: inset 0 0 0 1px {faGelRim}, inset 0 -6px 10px -4px {faGelGlow}, 0 2px 4px {faGelShadow}; /* + the specular cap: a white ellipse over the top 48%, inset 4% each side, linear-gradient(rgba(255,255,255,.9), rgba(255,255,255,.18)) with a CRISP lower edge (no blur) */' },
    { name: 'Aero glass', css: 'background: linear-gradient(115deg, {faStreak} 0 38%, transparent 38.5%), {faGlass}; border: 1px solid {faRimOut}; box-shadow: inset 0 0 0 1px {faRimIn}; border-radius: 14px; /* tinted glass with the HARD diagonal streak (not refraction: that is Liquid Glass) */' },
    { name: 'Title bar', css: 'background: linear-gradient(115deg, {faStreak} 0 34%, transparent 34.5%), linear-gradient({faBarA}, {faBarB}); border-bottom: 1px solid {faRimOut}; /* window chrome: min / max as glass, close as a red gel #D9442B; a 3px rainbow line along the foot */' },
    { name: 'Wet floor', css: 'transform: scaleY(-1); opacity: .3; /* the hero object or headline repeated under its baseline and faded by a gradient overlay into the water or floor colour (never a CSS mask) */' },
    { name: 'Bubble', css: 'background: radial-gradient(circle at 42% 38%, rgba(255,255,255,.04), rgba(255,255,255,.12) 72%, rgba(255,255,255,.55)); border: 1px solid rgba(255,255,255,.85); border-radius: 50%; /* + a white cap over the top half; tinted in the primary or a companion hue */' },
    { name: 'Vista selection', css: 'background: linear-gradient({faSelA}, {faSelB}); box-shadow: inset 0 0 0 1px {faSelRim}; border-radius: 3px;' },
  ],

  rules: {
    do: [
      'Put a crisp specular cap on every gel control: a white ellipse over the top half with a hard lower lip, the gel colour pooling brighter at the base.',
      'Keep sky, water and white air dominant (about 60%); the candy hues sit on the glass, the swooshes and the orbs, and the primary is the one gel CTA.',
      'Use the primary\'s triad (+120, +240) and its complement (+180) as the companion hues: one per tab, progress fill or list avatar, never two on one control.',
      'Mirror the hero object or headline on a wet floor: flipped, faded into the water by a gradient overlay.',
      'Chrome every window with tinted glass, a hard 115-degree gloss streak and a rainbow foot line; the close button is a red gel.',
      'Set type in a light humanist sans (300 for headlines, 600 for labels), sentence case, deep blue-grey, never black.',
    ],
    dont: [
      'Use dark backgrounds in light mode or muddy gels: lift a dark brand colour to candy lightness first.',
      'Trace real wallpapers, the Windows flag or Apple marks; draw the hill, clouds and orb from primitives.',
      'Use clear colourless refraction (that is Liquid Glass) or gloss on everything; flat text and white air make the gel pop.',
      'Scatter clip-art: one lens-flare string and one sparkle cluster per view, no dolphins, no globes on every icon.',
      'Put companion colour under body text: the tints are for tabs and chips, the text stays deep blue-grey.',
    ],
  },

  deck: {
    coverBand: false,   // the cover is the full-bleed sky; no pattern band under it
    // Do / Don't markers: a small gel orb (do) or a glass orb (don't) with a tick or a cross
    marks(ctx, kind) {
      return `<span class="fa-mark" data-k="${kind}">${kind === 'do' ? '✓' : '✕'}</span>`;
    },
    // Material slide: the gel itself, dissected (the hero scene is already on the cover)
    materialArt(ctx) {
      return faAnatomy(ctx);
    },
    principles: [
      ['Sky first, then gloss', 'Sunny aqua, water and white air stay dominant.'],
      ['Every control looks wet', 'A crisp highlight cap sits on each primary control.'],
      ['Optimism you can see', 'Candy orbs, swooshes and a lime hill say it literally.'],
    ],
    do: [
      'Put a crisp highlight cap on every primary control.',
      'Keep sky, water and white air dominant.',
      'Mirror the hero object on a wet floor.',
    ],
    dont: [
      'Let the sky or a gel turn muddy or grey.',
      'Trace real wallpapers or OS logos.',
      'Use clear refractive glass; that\'s Liquid Glass.',
    ],
  },
});
})();
