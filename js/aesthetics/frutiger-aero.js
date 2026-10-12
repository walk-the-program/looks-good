/* 37 Frutiger Aero — glossy, airy, hopeful. Technology as good weather: a high-key world of sky,
   water, grass and white light in which every control is a wet gel object lit from above.
   References: the Frutiger Aero Archive and CARI's catalogue entry (glossy gel pills, humanist
   sans, aurora, bokeh, bubbles), Windows Vista/7 Aero (tinted glass title bars with a HARD
   diagonal gloss streak, glowing caption buttons), Mac OS X Aqua (the "lickable" gel button:
   saturated pill, white specular cap over the top half with a crisp lower lip, light pooling at
   the base), the Wii menu (white glossy tiles) and the Bliss-type landscape (one green hill,
   deep-blue sky, cumulus) — drawn from primitives, never traced.

   Mechanism.
   - Gel object (buttons, orbs, swatches, the active segment, toggle-on, progress): a vertical
     gradient (base +32% L → base at 55% → base -8% L), a white specular CAP over the top ~48% with
     a crisp lower edge (no blur; the lip is the tell), a base caustic (radial light pooling at the
     bottom), a 1px darker rim and a small coloured drop shadow. The client primary is the gel,
     lifted to candy lightness (def.printPrimary) so a dark brand colour never turns to mud.
   - Aero glass chrome: white glass + 1px dark outer / 1px white inner rim + the hard 115deg streak.
     The board's header is the title bar of an Aero window (caption buttons, red close gel); the
     cards are windows.
   - Environment: def.art draws the sky (clouds, aurora ribbons, one lens-flare string), the hills
     (secondary when it is a plausible landscape hue, else the fixed grass), rising bubbles, the
     water and a primary gel orb mirrored on the wet floor.
   - Wet-floor headline: def.headline returns the light humanist headline plus its reflection
     (flipped, faded by a gradient overlay, never a CSS mask), so the headline sits on the horizon
     and is mirrored in the water. Dark mode is the Aero night: black glass, aurora, stars.
   Export-safe: no mask-image; backdrop-filter is decoration only (glass has an opaque-enough fill). */
(function () {
let seq = 0;

const FA_TEXT = '#23415A';        // deep blue-grey text (never black)
const FA_TEXT_NIGHT = '#EAF5FF';
const FA_GRASS = '#6CC24A';       // fixed grass when the secondary is not a landscape hue
const FA_CLOSE = '#D9442B';       // the window close button is always a red gel

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
  const D = k => contrastRatio('#0E2233', faHex(h, s, k));
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

// Secondary as landscape: green-ish hues become the hill; anything else keeps the fixed grass
// and lives in the aurora ribbons only.
function faHill(t) {
  const c = faHsl(t.secondary);
  const land = c.h >= 70 && c.h <= 170 && c.s >= 18;
  const base = land ? { h: c.h, s: Math.max(c.s, 48), l: Math.min(52, Math.max(40, c.l)) } : faHsl(FA_GRASS);
  return {
    crest: faHex(base.h, base.s + 6, Math.min(78, base.l + 22)),
    mid: faHex(base.h, base.s, base.l),
    foot: faHex(base.h, base.s, Math.max(18, base.l - 16)),
    far: faHex(base.h - 8, Math.max(20, base.s - 22), Math.min(80, base.l + 24)),
    own: land,
  };
}

function faRibbon(t) {
  const c = faHsl(t.secondary);
  return faHex(c.h, Math.max(c.s, 50), Math.min(72, Math.max(52, c.l)));
}

function faEsc(s) { return escapeHtml(String(s == null ? '' : s)); }

// Last word of the headline as .ab-hl (same split as the framework's abHeadline).
function faHlHtml(text) {
  const s = String(text || '').trim();
  const m = s.match(/^([\s\S]*?)([^\s]+?)([.,;:!?…]*)$/);
  if (!m) return faEsc(s);
  return `${faEsc(m[1])}<span class="ab-hl">${faEsc(m[2])}</span>${faEsc(m[3])}`;
}

/* ---------------- art: the sky, the hill, the water, the orb ---------------- */

function faCloud(cx, cy, k, fill, shade) {
  // a cumulus cluster: overlapping circles over a flat base, lit from above
  const c = [[-1.05, 0.12, 0.42], [-0.62, -0.18, 0.55], [-0.05, -0.42, 0.72], [0.55, -0.2, 0.56], [1.0, 0.1, 0.4], [0.22, 0.06, 0.5], [-0.38, 0.12, 0.46]];
  const circles = c.map(([x, y, r]) => `<circle cx="${(cx + x * k).toFixed(1)}" cy="${(cy + y * k).toFixed(1)}" r="${(r * k).toFixed(1)}"/>`).join('');
  return `<g fill="${fill}">${circles}<rect x="${(cx - 1.25 * k).toFixed(1)}" y="${(cy + 0.1 * k).toFixed(1)}" width="${(2.5 * k).toFixed(1)}" height="${(0.38 * k).toFixed(1)}" rx="${(0.19 * k).toFixed(1)}"/></g>
    <ellipse cx="${cx.toFixed(1)}" cy="${(cy + 0.36 * k).toFixed(1)}" rx="${(1.18 * k).toFixed(1)}" ry="${(0.12 * k).toFixed(1)}" fill="${shade}"/>`;
}

function faSky(t, id, night) {
  const hill = faHill(t);
  const rib = faRibbon(t);
  const acc = faCandy(t.accent);
  const bub = faHex(acc.h, acc.s, Math.min(80, acc.l + 14));
  const sky = night
    ? `<stop offset="0" stop-color="#010812"/><stop offset=".42" stop-color="#05203A"/><stop offset=".78" stop-color="#0C4566"/><stop offset="1" stop-color="#2A86A3"/>`
    : `<stop offset="0" stop-color="#1A98F2"/><stop offset=".34" stop-color="#55BAFB"/><stop offset=".68" stop-color="#B4E3FF"/><stop offset="1" stop-color="#F1FAFF"/>`;
  // aurora: three translucent ribbons of decreasing width, white -> secondary -> white
  const ribbons = [
    ['M-60 350C260 190 560 380 860 250S1360 70 1680 150L1680 205C1380 135 1150 300 870 330S330 280 -60 430Z', night ? 0.62 : 0.5],
    ['M-60 300C300 170 600 330 900 215S1400 60 1680 105L1680 132C1420 98 1180 238 905 262S320 238 -60 336Z', night ? 0.5 : 0.42],
    ['M-60 420C360 300 640 440 980 330S1450 200 1680 240L1680 252C1450 220 1210 360 990 372S360 360 -60 440Z', night ? 0.42 : 0.36],
  ].map(([d, o], i) => `<path d="${d}" fill="url(#${id}r${i % 2})" opacity="${o}"/>`).join('');
  const clouds = night ? '' : [
    faCloud(250, 205, 118, '#ffffff', 'rgba(70,140,200,.14)'),
    faCloud(1220, 300, 84, '#ffffff', 'rgba(70,140,200,.12)'),
    faCloud(720, 120, 46, 'rgba(255,255,255,.85)', 'rgba(70,140,200,.08)'),
  ].join('');
  let stars = '';
  if (night) {
    let a = 7;
    const r = () => { a = (a * 9301 + 49297) % 233280; return a / 233280; };
    for (let i = 0; i < 70; i++) stars += `<circle cx="${(r() * 1600).toFixed(0)}" cy="${(r() * 380).toFixed(0)}" r="${(0.8 + r() * 1.8).toFixed(1)}" fill="#fff" opacity="${(0.25 + r() * 0.6).toFixed(2)}"/>`;
  }
  // one lens-flare string on a diagonal from the sun
  const sx = 1270, sy = 120;
  const flare = [[0.22, 34, 0.16], [0.36, 14, 0.3], [0.5, 52, 0.08], [0.62, 20, 0.22], [0.78, 9, 0.35]].map(([p, r, o]) => {
    const x = sx + (640 - sx) * p, y = sy + (560 - sy) * p;
    return `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r}" fill="#fff" fill-opacity="${(o * 0.45).toFixed(2)}" stroke="#fff" stroke-opacity="${o}" stroke-width="1.5"/>`;
  }).join('');
  // bubbles rising on the left
  const bubbles = [[150, 520, 30], [228, 448, 16], [118, 404, 11], [300, 380, 22], [208, 330, 9], [380, 300, 13], [96, 272, 18], [262, 236, 7], [470, 250, 10], [520, 470, 12]].map(([x, y, r], i) =>
    `<g transform="translate(${x} ${y})"><circle r="${r}" fill="url(#${id}b)"/><circle r="${r}" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="${r > 14 ? 1.6 : 1.1}"/><ellipse cx="${(-r * 0.36).toFixed(1)}" cy="${(-r * 0.42).toFixed(1)}" rx="${(r * 0.32).toFixed(1)}" ry="${(r * 0.2).toFixed(1)}" transform="rotate(-32 ${(-r * 0.36).toFixed(1)} ${(-r * 0.42).toFixed(1)})" fill="#fff" fill-opacity=".95"/>${i % 3 === 0 ? `<circle r="${(r * 0.62).toFixed(1)}" cx="${(r * 0.12).toFixed(1)}" cy="${(r * 0.18).toFixed(1)}" fill="${bub}" fill-opacity=".22"/>` : ''}</g>`).join('');
  // bokeh: soft out-of-focus discs drifting down from the sun
  const bokeh = [[1130, 210, 26, 0.22], [1190, 260, 14, 0.3], [1060, 170, 10, 0.32], [1340, 240, 34, 0.14], [990, 250, 18, 0.18], [1400, 160, 12, 0.26], [880, 300, 8, 0.3]].map(([x, y, r, o]) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id}bk)" opacity="${night ? o * 0.8 : o * 2.2}"/>`).join('');
  const hillFoot = night ? '#06261A' : hill.foot;
  const hillMid = night ? '#0B3A28' : hill.mid;
  const hillCrest = night ? '#1E6A55' : hill.crest;
  return `<svg class="fa-sky" viewBox="0 0 1600 640" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1">${sky}</linearGradient>
      <radialGradient id="${id}sun" cx="${sx}" cy="${sy}" r="${night ? 200 : 330}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity="${night ? 0.5 : 0.95}"/><stop offset=".25" stop-color="#fff" stop-opacity="${night ? 0.16 : 0.45}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
      <radialGradient id="${id}glow" cx="800" cy="640" r="760" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${night ? '#5FD3E8' : '#ffffff'}" stop-opacity="${night ? 0.35 : 0.8}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
      <linearGradient id="${id}r0" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".3" stop-color="#fff"/><stop offset=".62" stop-color="${rib}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <linearGradient id="${id}r1" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${rib}" stop-opacity="0"/><stop offset=".4" stop-color="${rib}"/><stop offset=".75" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <radialGradient id="${id}bk"><stop offset="0" stop-color="${night ? '#9FE8F5' : '#fff'}" stop-opacity=".7"/><stop offset=".8" stop-color="${night ? '#9FE8F5' : '#fff'}" stop-opacity=".45"/><stop offset="1" stop-color="${night ? '#9FE8F5' : '#fff'}" stop-opacity="0"/></radialGradient>
      <radialGradient id="${id}b" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".04"/><stop offset=".72" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity=".55"/></radialGradient>
      <linearGradient id="${id}h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${hillCrest}"/><stop offset=".45" stop-color="${hillMid}"/><stop offset="1" stop-color="${hillFoot}"/></linearGradient>
      <linearGradient id="${id}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${night ? '#12404A' : hill.far}"/><stop offset="1" stop-color="${night ? '#0A2A36' : hill.mid}" stop-opacity="${night ? 1 : 0.8}"/></linearGradient>
    </defs>
    <rect width="1600" height="640" fill="url(#${id}s)"/>
    <rect width="1600" height="640" fill="url(#${id}glow)"/>
    ${stars}
    <rect width="1600" height="640" fill="url(#${id}sun)"/>
    <g style="mix-blend-mode:screen">${ribbons}</g>
    ${bokeh}
    ${clouds}
    ${night ? '' : flare}
    <path d="M820 640C930 560 1040 520 1180 512S1460 540 1640 590V640Z" fill="url(#${id}f)"/>
    <path d="M-40 640C40 560 150 500 300 486S560 520 760 640Z" fill="url(#${id}h)"/>
    <path d="M-40 640C40 560 150 500 300 486S560 520 760 640" fill="none" stroke="#fff" stroke-opacity="${night ? 0.28 : 0.55}" stroke-width="3"/>
    <path d="M1010 640C1110 540 1230 470 1380 462S1580 500 1660 540V640Z" fill="url(#${id}h)"/>
    <path d="M1010 640C1110 540 1230 470 1380 462S1580 500 1660 540" fill="none" stroke="#fff" stroke-opacity="${night ? 0.28 : 0.55}" stroke-width="3"/>
    <g stroke="${night ? '#2D7F69' : hill.crest}" stroke-width="2" stroke-linecap="round" opacity=".7">${[[220, 500], [262, 494], [340, 492], [1300, 474], [1350, 468], [1440, 476]].map(([x, y]) => `<path d="M${x} ${y + 10}q-3 -9 -8 -14M${x + 6} ${y + 10}q1 -10 4 -15"/>`).join('')}</g>
    ${bubbles}
  </svg>`;
}

function faWater(t, id, night) {
  const top = night ? '#0E3E5A' : '#CDEEFF';
  const mid = night ? '#082D46' : '#8DD0F2';
  const bot = night ? '#041A2C' : '#4FA9DC';
  const lines = [0.16, 0.3, 0.46, 0.62, 0.8].map((y, i) => `<path d="M${-40 + i * 37} ${(y * 200).toFixed(0)}h${360 + i * 60}M${640 + i * 41} ${(y * 200 + 6).toFixed(0)}h${420 - i * 30}M${1200 - i * 23} ${(y * 200 - 4).toFixed(0)}h${300 + i * 40}"/>`).join('');
  return `<svg class="fa-water-svg" viewBox="0 0 1600 200" preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <defs><linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset=".45" stop-color="${mid}"/><stop offset="1" stop-color="${bot}"/></linearGradient></defs>
    <rect width="1600" height="200" fill="url(#${id}w)"/>
    <rect width="1600" height="3" fill="#fff" fill-opacity="${night ? 0.25 : 0.9}"/>
    <g stroke="#fff" stroke-opacity="${night ? 0.16 : 0.45}" stroke-width="2" stroke-linecap="round" fill="none">${lines}</g>
  </svg>`;
}

// The primary gel orb and its wet-floor reflection (one svg, the horizon at its middle).
function faOrb(t, id, initial, night) {
  const g = faGelBase(t.primary);
  const st = faGelStops(g);
  const ini = faEsc(initial);
  const body = `<circle cx="60" cy="60" r="54" fill="url(#${id}o)"/>
      <circle cx="60" cy="60" r="54" fill="url(#${id}c)"/>
      <circle cx="60" cy="60" r="53.2" fill="none" stroke="${st.rim}" stroke-width="1.6"/>
      <text x="60" y="76" text-anchor="middle" font-family="var(--ab-font-h, sans-serif)" font-size="46" font-weight="600" fill="${g.label}" fill-opacity=".92">${ini}</text>
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
  const id = `fa${++seq}`;
  const night = !!t.isDark;
  return `<div class="fa-scene" data-night="${night ? 1 : 0}">
    ${faSky(t, id, night)}
    <div class="fa-water">${faWater(t, id, night)}</div>
    <div class="fa-orb-wrap">${faOrb(t, id, ctx.initial, night)}</div>
    ${faSeal(t, id)}
  </div>`;
}

// the "new" starburst: a 12-point star in the accent gel with a cap, lowercase label
function faSeal(t, id) {
  const a = faCandy(t.accent);
  const st = faGelStops(a);
  const lab = contrastRatio('#ffffff', faHex(a.h, a.s, a.l)) >= 4.5 ? '#ffffff' : '#0E2233';
  let pts = '';
  for (let i = 0; i < 24; i++) {
    const r = i % 2 ? 39 : 48, an = (Math.PI * 2 * i) / 24 - Math.PI / 2;
    pts += `${(50 + r * Math.cos(an)).toFixed(1)},${(50 + r * Math.sin(an)).toFixed(1)} `;
  }
  return `<svg class="fa-seal" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
    <defs><linearGradient id="${id}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${st.top}"/><stop offset=".55" stop-color="${st.mid}"/><stop offset="1" stop-color="${st.bot}"/></linearGradient></defs>
    <polygon points="${pts.trim()}" fill="url(#${id}a)" stroke="${st.rim}" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M17 44C20 26 34 15 50 15S80 26 83 44C72 49 62 50 50 50S28 49 17 44Z" fill="#fff" fill-opacity=".6"/>
    <text x="50" y="60" text-anchor="middle" font-family="var(--ab-font-b, sans-serif)" font-size="24" font-weight="600" fill="${lab}">new</text>
  </svg>`;
}

registerAesthetic({
  key: 'frutiger-aero', order: 37,
  name: 'Frutiger Aero',
  descriptor: 'Glossy · Airy · Hopeful',
  influences: 'Y2K tech optimism / Skeuomorphic gloss / Sky and water',
  summary: 'Sky, water and white light, with every control a wet glossy gel lit from above.',
  motto: 'Technology as good weather.',
  kicker: 'Clear skies ahead',
  mode: 'light',
  slideShape: 'soft',
  labels: { material: 'Gloss', states: ['Rest', 'Shine', 'Pressed'], statesKind: 'button' },
  layout: { hero: 'centered', palette: 'swatches', sections: 'two-col', subcopy: true },
  type: { ui: 'body', label: 'body', display: 1 },
  highlight: 'custom',
  highlightNote: 'The headline is a light humanist sans on the horizon with a wet-floor reflection beneath it; the last word takes the primary gel colour with a soft white Vista glow. In running UI text the highlight word is the gel colour, never a filled pill.',
  cardFill: '--ab-glass',

  roles: {
    canvas: {
      use: 'Fixed white air: cool white #F2F7FB (light) or the Aero night #071A2B (dark) behind glass windows; the hero is a fixed sky #1A98F2 → #F1FAFF over water. About 70% of any view is sky or white air',
      never: 'Text, a dark page in light mode, a flat client colour as the page',
      coverage: '60–70%',
    },
    ink: {
      use: 'Text is the fixed deep blue-grey #23415A (night: #EAF5FF), never pure black; 1px glass rims are blue-grey too',
      never: 'Pure black, large fills, gel labels on light gels where it fails 4.5:1',
      coverage: '15–20%',
    },
    primary: {
      use: 'The gel: the ONE main action (gel pill with a crisp specular cap), the active segment, the hero orb and its reflection, the progress gel. Lifted to candy lightness so it never reads as mud',
      never: 'Flat fills without the cap, body text, more than one gel CTA per view, the page ground',
      coverage: '≈10%',
    },
    secondary: {
      use: 'The landscape: the hill when it is a plausible green, otherwise the aurora ribbons only (the hill keeps the fixed grass #6CC24A); secondary glass buttons tint',
      never: 'The main action, body text, the sky',
      coverage: '≈10–15%',
    },
    accent: {
      use: 'One spark: the bubbles tint, the "new" starburst seal and the toggle-on gel',
      never: 'Buttons, body text, borders, large fills',
      coverage: '≤5%',
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
    const slices = [0, 1, 2, 3, 4].map(i => `<span class="fa-rs" style="--i:${i}"><span>${inner}</span></span>`).join('');
    return `<span class="fa-hl"><span class="fa-hl-txt">${inner}</span><span class="fa-hl-refl" aria-hidden="true">${slices}</span></span>`;
  },

  tokens(t) {
    const night = t.isDark;
    const g = faGelBase(t.primary);
    const gs = faGelStops(g);
    const a = faCandy(t.accent);
    const as = faGelStops(a);
    const aLabel = contrastRatio('#ffffff', faHex(a.h, a.s, a.l)) >= 4.5 ? '#ffffff' : '#0E2233';
    const s = faCandy(t.secondary);
    const ink = night ? FA_TEXT_NIGHT : FA_TEXT;
    const canvas = t.canvas;
    let muted = night ? '#A9C4D9' : '#4D6880';
    if (contrastRatio(muted, canvas) < 4.5) muted = night ? '#C2D6E6' : '#3E5A72';
    // the highlight word: the gel colour as text, shaded until it reaches 3:1 on the horizon glow
    const horizon = night ? '#1C6684' : '#E3F5FF';
    let hl = faHex(g.h, g.s, g.l);
    for (let l = g.l; l >= 18 && l <= 90 && contrastRatio(hl, horizon) < 3.2; l += night ? 2 : -2) hl = faHex(g.h, g.s, l);
    let hlCard = faHex(g.h, g.s, g.l);
    for (let l = g.l; l >= 18 && l <= 90 && contrastRatio(hlCard, canvas) < 3.2; l += night ? 2 : -2) hlCard = faHex(g.h, g.s, l);
    return {
      '--ab-type-pick-w': 300,
      '--ab-ink': ink,
      '--ab-muted': muted,
      '--ab-line': night ? 'rgba(170, 210, 240, 0.22)' : 'rgba(35, 65, 90, 0.16)',
      '--ab-glass': night ? 'rgba(14, 34, 54, 0.72)' : 'rgba(255, 255, 255, 0.78)',
      '--ab-fa-glass': night ? 'rgba(14, 34, 54, 0.72)' : 'rgba(255, 255, 255, 0.78)',
      '--ab-fa-glass-hi': night ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.95)',
      '--ab-fa-rim-out': night ? 'rgba(0, 0, 0, 0.55)' : 'rgba(35, 65, 90, 0.24)',
      '--ab-fa-rim-in': night ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.9)',
      '--ab-fa-streak': night ? 'rgba(255, 255, 255, 0.10)' : 'rgba(255, 255, 255, 0.62)',
      '--ab-fa-bar-a': night ? '#1D3A55' : '#EAF5FD',
      '--ab-fa-bar-b': night ? '#0B1F33' : '#C9E3F5',
      '--ab-fa-gel-top': gs.top, '--ab-fa-gel': gs.mid, '--ab-fa-gel-bot': gs.bot, '--ab-fa-gel-rim': gs.rim, '--ab-fa-gel-glow': gs.glow,
      '--ab-fa-gel-on': g.label,
      '--ab-fa-gel-shadow': t.alpha(gs.mid, 0.38),
      '--ab-fa-acc-top': as.top, '--ab-fa-acc': as.mid, '--ab-fa-acc-bot': as.bot, '--ab-fa-acc-rim': as.rim, '--ab-fa-acc-on': aLabel,
      '--ab-fa-sec': faHex(s.h, s.s, s.l), '--ab-fa-sec-tint': faHex(s.h, Math.min(s.s, 70), night ? 26 : 90),
      '--ab-fa-close-top': '#F6A390', '--ab-fa-close': FA_CLOSE, '--ab-fa-close-bot': '#A92A16',
      '--ab-fa-hl': hl, '--ab-fa-hl-card': hlCard,
      '--ab-fa-sel-a': night ? '#1E4A6E' : '#E8F4FF', '--ab-fa-sel-b': night ? '#163B5A' : '#CDE6FF', '--ab-fa-sel-rim': night ? '#3D7DB0' : '#7DA2CE',
      '--ab-fa-field-b': night ? '#4C7393' : '#9DB7CC',
      '--ab-fa-water-top': night ? '#0E3E5A' : '#CDEEFF',
      '--ab-fa-floor': night ? '#071A2B' : '#F2F7FB',
      '--ab-fa-text-glow': night ? 'rgba(0, 20, 40, 0.75)' : 'rgba(255, 255, 255, 0.9)',
    };
  },

  art(ctx) {
    return faScene(ctx);
  },

  materials: [
    { name: 'Gel', css: 'background: linear-gradient(180deg, {faGelTop} 0%, {faGel} 55%, {faGelBot} 100%); color: {faGelOn}; border-radius: 999px; box-shadow: inset 0 0 0 1px {faGelRim}, inset 0 -6px 10px -4px {faGelGlow}, 0 2px 4px {faGelShadow}; /* + the specular cap: a white ellipse over the top 48%, inset 4% each side, linear-gradient(rgba(255,255,255,.9), rgba(255,255,255,.18)) with a CRISP lower edge (no blur) */' },
    { name: 'Aero glass', css: 'background: linear-gradient(115deg, {faStreak} 0 38%, transparent 38.5%), {faGlass}; border: 1px solid {faRimOut}; box-shadow: inset 0 0 0 1px {faRimIn}; border-radius: 14px; /* tinted glass with the HARD diagonal streak (not refraction: that is Liquid Glass) */' },
    { name: 'Title bar', css: 'background: linear-gradient(115deg, {faStreak} 0 34%, transparent 34.5%), linear-gradient({faBarA}, {faBarB}); border-bottom: 1px solid {faRimOut}; /* window chrome: min / max as glass, close as a red gel #D9442B */' },
    { name: 'Wet floor', css: 'transform: scaleY(-1); opacity: .3; /* the hero object or headline repeated under its baseline and faded by a gradient overlay into the water or floor colour (never a CSS mask) */' },
    { name: 'Bubble', css: 'background: radial-gradient(circle at 42% 38%, rgba(255,255,255,.04), rgba(255,255,255,.12) 72%, rgba(255,255,255,.55)); border: 1px solid rgba(255,255,255,.85); border-radius: 50%; /* + a small white highlight at 30%/30%, one in three tinted with the accent */' },
    { name: 'Vista selection', css: 'background: linear-gradient({faSelA}, {faSelB}); box-shadow: inset 0 0 0 1px {faSelRim}; border-radius: 3px;' },
  ],

  rules: {
    do: [
      'Put a crisp specular cap on every gel control: a white ellipse over the top half with a hard lower lip, the gel colour pooling brighter at the base.',
      'Keep sky, water and white air dominant (about 70%); glass windows float over the landscape and the gel is the only saturated colour.',
      'Mirror the hero object or headline on a wet floor: flipped, faded into the water by a gradient overlay.',
      'Chrome every window with tinted glass and a hard 115-degree gloss streak; the close button is a red gel.',
      'Set type in a light humanist sans (300 for headlines, 600 for labels), sentence case, deep blue-grey, never black.',
    ],
    dont: [
      'Use dark backgrounds in light mode or muddy gels: lift a dark brand colour to candy lightness first.',
      'Trace real wallpapers, the Windows flag or Apple marks; draw the hill, clouds and orb from primitives.',
      'Use clear colourless refraction (that is Liquid Glass) or gloss on everything; flat text and white air make the gel pop.',
      'Scatter clip-art: one lens-flare string per view, no dolphins, no globes on every icon.',
    ],
  },

  deck: {
    principles: [
      ['Sky first, then gloss', 'Sky, water and white air stay dominant.'],
      ['Every control looks wet', 'A crisp highlight cap sits on each primary control.'],
      ['Optimism you can see', 'Blue sky, green hill and bubbles say it literally.'],
    ],
    do: [
      'Put a crisp highlight cap on every primary control.',
      'Keep sky, water and white air dominant.',
      'Mirror the hero object on a wet floor.',
    ],
    dont: [
      'Use dark backgrounds or muddy gels.',
      'Trace real wallpapers or OS logos.',
      'Use clear refractive glass; that\'s Liquid Glass.',
    ],
  },
});
})();
