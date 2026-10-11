/* 29 Xerox Punk — ransom, pasted, defiant. References: Jamie Reid's ransom lettering,
   torn layers and censor bars, Gee Vaucher / Crass montage, Pettibon's captions, riot
   grrrl zines (cut, paste, scribble). NOT the app's Xerox (a clean copy of one page on
   white paper): this is a dark street wall of many pasted sources that overlap and
   collide, with one fluorescent hit and the reader's own hand marking it up.

   Mechanism. The ransom headline is rendered inside the art (the framework headline is
   one text run), the real <h2> stays in the DOM visually hidden. Each LETTER is its own
   cut tile: its own face (brand heading + brand body + a pool of library faces), its own
   ground (newsprint, white, black, photocopy grey, the fluoro, one accent tile), size
   (0.82-1.3 of the cap size), a rotation of at most 5.5 degrees, a baseline offset and
   scissor-cut edges (an irregular clip polygon), seeded per brand so it never changes
   on re-render; one tile in five is fluoro. Torn wheatpaste sheets, a marker circle
   round one word, a censor bar over the photocopied initial, tape, a safety pin and a
   handwritten caption complete the wall. The fluoro is the client primary pushed to
   Day-Glo (tokens() overrides --ab-primary). The hidden <svg> in art() defines the
   filters the css uses: xpn-torn (fibrous torn edge) and xpn-copy (photocopy
   threshold, used only on the photo scrap). */
(function () {
let seq = 0;

function xpRand(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function xpHash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// The client primary pushed to Day-Glo: full saturation, bright lightness; a muted
// primary falls back to the fixed yellow-green so the wall always has its one fluoro.
function xpFluoro(primary) {
  const c = hexToHsl(primary);
  if (c.s < 28) return '#D4FF00';
  const l = c.h > 190 && c.h < 285 ? 64 : c.h > 45 && c.h < 190 ? 52 : 56;
  return hslToHex(c.h, 100, l);
}

const XP_POOL = ['Anton', 'Alfa Slab One', 'Abril Fatface', 'Playfair Display', 'DM Serif Display', 'Libre Caslon Text',
  'Bebas Neue', 'Special Elite', 'Courier Prime', 'Archivo Black', 'Oswald', 'Roboto Slab', 'Bitter', 'Big Shoulders Display', 'Yeseva One'];
const XP_RARE = ['Grenze Gotisch', 'Pirata One'];

function xpFace(name) {
  return (typeof FONTS !== 'undefined' && FONTS.find(f => f.name === name)) || null;
}
function xpWeight(font) {
  const w = String(font.weights || '400').split(';').map(Number).filter(Boolean);
  const le = w.filter(x => x <= 800);
  return le.length ? Math.max(...le) : w[0] || 400;
}

// scissor-cut outline: eight points, each pulled in by up to 4%
function xpCut(rnd) {
  const j = () => (rnd() * 4).toFixed(1);
  return `polygon(${j()}% ${j()}%, 50% ${(rnd() * 2).toFixed(1)}%, calc(100% - ${j()}%) ${j()}%, calc(100% - ${(rnd() * 2).toFixed(1)}%) 50%, calc(100% - ${j()}%) calc(100% - ${j()}%), 50% calc(100% - ${(rnd() * 2).toFixed(1)}%), ${j()}% calc(100% - ${j()}%), ${(rnd() * 2).toFixed(1)}% 50%)`;
}

const XP_GROUNDS = [
  { c: 'news', bg: '#E9E3D0', fg: '#111111', w: 3 },
  { c: 'paper', bg: '#F6F3EA', fg: '#111111', w: 2 },
  { c: 'ink', bg: '#0B0B0B', fg: '#E9E3D0', w: 2 },
  { c: 'grey', bg: '#B9B6AB', fg: '#111111', w: 2 },
];

// ransom headline: lines of words of tiles. Returns the HTML.
function xpHeadline(ctx, seed) {
  const rnd = xpRand(seed);
  const words = String(ctx.tagline || '').trim().split(/\s+/).filter(Boolean);
  const hf = ctx.state && ctx.state.headingFont, bf = ctx.state && ctx.state.bodyFont;
  const faces = [];
  if (hf) faces.push({ css: 'var(--ab-font-h)', weight: 'var(--ab-hw, 700)', up: true, name: hf.name });
  if (bf && bf.name !== (hf && hf.name)) faces.push({ css: 'var(--ab-font-b)', weight: 700, up: false, name: bf.name });
  const pool = XP_POOL.map(xpFace).filter(f => f && !faces.some(x => x.name === f.name));
  const pick = [];
  pool.forEach(f => pick.push({ css: f.css, weight: xpWeight(f), up: ['condensed', 'heavy', 'slab'].includes(f.cls) || f.category === 'display', name: f.name }));
  XP_RARE.map(xpFace).filter(Boolean).forEach(f => pick.push({ css: f.css, weight: xpWeight(f), up: true, name: f.name, rare: true }));
  const warm = typeof window !== 'undefined' && window.loadFontFamily;

  // lines of at most 14 letters
  const lines = [];
  let cur = [], n = 0;
  words.forEach(w => {
    if (cur.length && n + w.length > 14) { lines.push(cur); cur = []; n = 0; }
    cur.push(w); n += w.length;
  });
  if (cur.length) lines.push(cur);

  let idx = 0, last = null;
  const total = words.reduce((a, w) => a + w.length, 0);
  const accentAt = Math.max(0, total - Math.ceil(words[words.length - 1].length * 0.7));
  const wsum = XP_GROUNDS.reduce((a, g) => a + g.w, 0);
  const html = lines.map(line => `<span class="xpl">${line.map((w, wi) => {
    const isLast = w === words[words.length - 1] && line === lines[lines.length - 1];
    const tiles = Array.from(w).map(ch => {
      // face: never the same as the neighbour; the brand faces appear at least every 4th tile
      let f;
      const brand = faces.length && (idx % 4 === 1 || rnd() < 0.18);
      if (brand) f = faces[Math.floor(rnd() * faces.length)];
      else { do { f = pick[Math.floor(rnd() * pick.length)]; } while ((f.rare && rnd() < 0.7) || (last && f.name === last.name)); }
      last = f;
      if (warm && f.name && xpFace(f.name)) window.loadFontFamily(xpFace(f.name));
      const fluoro = idx % 5 === 2 && rnd() < 0.9 && idx !== accentAt;
      const accent = idx === accentAt;
      let g = null;
      if (!fluoro && !accent) { let r = rnd() * wsum; g = XP_GROUNDS.find(x => (r -= x.w) < 0) || XP_GROUNDS[0]; }
      const kind = accent ? 'acc' : fluoro ? 'hot' : g.c;
      const lower = !f.up && rnd() < 0.3;
      const sz = 0.82 + rnd() * 0.5;
      const rot = (rnd() < 0.5 ? -1 : 1) * (1.8 + rnd() * 3.7);
      const dy = (rnd() - 0.5) * 0.2;
      idx++;
      const style = `font-family:${f.css};font-weight:${f.weight};font-size:${sz.toFixed(2)}em;--r:${rot.toFixed(1)}deg;--dy:${dy.toFixed(3)}em;clip-path:${xpCut(rnd)}`;
      return `<i class="xpt" data-g="${kind}" style="${style}">${escapeHtml(lower ? ch.toLowerCase() : ch.toUpperCase())}</i>`;
    }).join('');
    const circle = isLast ? '<svg class="xpc" viewBox="0 0 120 60" preserveAspectRatio="none" focusable="false"><path d="M14 33C3 15 38 4 68 6c34 2 49 20 36 38C90 59 40 58 18 48 6 42 9 22 31 12" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/><path d="M24 14C6 24 8 44 30 52c26 8 62 4 78-14 9-12-2-26-24-30" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="46 3 30 4 24"/></svg>' : '';
    return `<span class="xpw${isLast ? ' is-circled' : ''}">${tiles}${circle}</span>`;
  }).join('')}</span>`).join('');
  return html;
}

registerAesthetic({
  key: 'xerox-punk', order: 29,
  name: 'Xerox Punk',
  descriptor: 'Ransom · Pasted · Defiant',
  influences: 'Jamie Reid / Wheatpaste street walls / Ransom-note collage',
  summary: 'A dark wall of pasted scraps: ransom-note headlines, torn layers, censor bars and one fluorescent hit.',
  motto: 'Cut it. Paste it. Mean it.',
  kicker: 'Stick no bills',
  mode: 'dark',
  slideShape: 'minimal',
  labels: { material: 'Paste-up', states: ['Pasted', 'Circled', 'Crossed out'], statesKind: 'button' },
  layout: { hero: 'centered', palette: 'swatches', sections: 'two-col', subcopy: true },
  type: { ui: 'body', label: 'body', display: 1 },
  highlight: 'custom',
  highlightNote: 'The headline is cut ransom-note tiles (each letter its own face, ground, size and tilt; one tile in five is the fluoro; one tile is the accent) and the last word is circled by hand in marker. In running UI text the highlight word is plain ink with a fluoro highlighter swipe behind it.',
  cardFill: '--ab-sheet',

  roles: {
    canvas: {
      use: 'The street wall: flat black (about #0A0A0A) in dark mode, a dull concrete grey in light mode, with 4% grain; paper sheets are pasted on top. Fixed scrap grounds: newsprint #E9E3D0, white #F6F3EA, photocopy grey #B9B6AB',
      never: 'A white page as the main surface (that is Xerox), text, a coherent single column',
      coverage: '55–65%',
    },
    ink: {
      use: 'Bone text on the wall; black type on every pasted scrap, black censor bars, 2px tile borders and hard shadows',
      never: 'Soft greys, gradients, blurred shadows',
      coverage: '15–20%',
    },
    primary: {
      use: 'The ONE fluoro: the client primary pushed to Day-Glo (full saturation, lightness 52–64%; a muted primary falls back to #D4FF00): the main action tile, one tile in five of the ransom headline, the highlighter swipe, selected switch fill',
      never: 'Fluoro text on newsprint, a second fluoro, smooth UI fills, body text',
      coverage: '≈10–12%',
    },
    secondary: {
      use: 'The second pen: translucent tape strips holding sheets down, the progress track, and the stamp of a second tone; under 5%',
      never: 'Buttons, body text, large panels',
      coverage: '≈4–5%',
    },
    accent: {
      use: 'A single tile in the ransom headline and the rubber stamp (kicker)',
      never: 'Buttons, borders, panel fills, a second tile',
      coverage: '≤2%',
    },
  },

  // Dark: the street wall, near-black with a trace of the client's hue. Light: dull concrete
  // so the cream and white scraps still read as pasted on (never a white page).
  canvas(b) {
    if (b.isDark) { const h = b.hexToHsl(b.canvas); return b.hslToHex(h.h, Math.min(h.s, 8), Math.min(h.l, 4.5)); }
    const h = b.hexToHsl(b.canvas);
    return b.hslToHex(h.h, Math.min(h.s, 8), 70);
  },

  tokens(t) {
    const hf = typeof state !== 'undefined' && state && state.headingFont;
    const ws = String((hf && hf.weights) || '400').split(';').map(Number).filter(Boolean);
    const le = ws.filter(x => x <= 900);
    const hw = le.length ? Math.max(...le) : Math.min(...ws);
    const fl = xpFluoro(t.primary);
    const d = t.isDark;
    return {
      '--ab-type-pick-w': hw,
      '--ab-hw': hw,
      '--ab-tr': 0,
      '--ab-primary': fl,
      '--ab-on-primary': '#0a0a0a',
      '--ab-fluoro': fl,
      '--ab-pri-tint': t.mix(fl, t.canvas, 0.14),
      '--xp-hot': d ? fl : t.ink,
      '--xp-stamp': d ? t.accentInk : t.ink,
      '--ab-stamp': d ? t.accentInk : t.ink,
      '--ab-news': '#E9E3D0',
      '--ab-sheet': '#E9E3D0',
      '--ab-copy': '#CFCBBF',
      '--ab-wire': '#F1EEE4',
      '--ab-tape': t.alpha(t.secondary, d ? 0.62 : 0.7),
      '--ab-tape-edge': t.alpha(t.secondary, 0.9),
      '--ab-sheet-ink': '#0d0d0d',
      '--ab-sheet-mute': '#4a463b',
    };
  },

  art(ctx) {
    const t = ctx.t;
    const seed = xpHash(String(ctx.brandName || 'brand') + '|' + String(ctx.tagline || ''));
    const rnd = xpRand(seed ^ 0x9e3779b9);
    const hl = xpHeadline(ctx, seed);
    const ini = escapeHtml(ctx.initial);
    // old torn-poster fragments on the wall at about 6%: bars standing in for lines of print
    let frags = '';
    [[2, 6, 30, 38], [64, 3, 34, 30], [44, 62, 36, 34], [-2, 66, 26, 30]].forEach(([x, y, w, h], i) => {
      let rows = '';
      for (let r = 0; r < 6; r++) rows += `<b style="width:${(40 + rnd() * 58).toFixed(0)}%"></b>`;
      frags += `<span class="xpo" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%;transform:rotate(${((i % 2 ? 1 : -1) * (1 + rnd() * 3)).toFixed(1)}deg)">${rows}</span>`;
    });
    const pin = `<svg class="xpp" viewBox="0 0 44 18" width="44" height="18" aria-hidden="true" focusable="false"><defs><linearGradient id="xpg${++seq}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2f2f2"/><stop offset=".5" stop-color="#8d8d8d"/><stop offset="1" stop-color="#c9c9c9"/></linearGradient></defs><g fill="none" stroke="url(#xpg${seq})" stroke-width="1.8" stroke-linecap="round"><circle cx="7" cy="9" r="3.4"/><path d="M9.5 6.6 36 4.6c4-.3 6.5 3 4 5.6-1.2 1.2-3.2 1.4-4.6.4L11 12.4"/><path d="M33 3.6v10.4" stroke-width="2.6"/></g></svg>`;
    return `<svg class="xpd" width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden"><defs>
      <filter id="xpn-torn" x="-6%" y="-6%" width="112%" height="112%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.028 0.05" numOctaves="2" seed="7" result="w"/>
        <feDisplacementMap in="SourceGraphic" in2="w" scale="11" xChannelSelector="R" yChannelSelector="G" result="d"/>
        <feTurbulence type="fractalNoise" baseFrequency="0.22" numOctaves="2" seed="3" result="f"/>
        <feDisplacementMap in="d" in2="f" scale="3.2" xChannelSelector="G" yChannelSelector="R" result="e"/>
        <feComponentTransfer in="e"><feFuncA type="discrete" tableValues="0 0 0 1 1 1"/></feComponentTransfer>
      </filter>
      <filter id="xpn-copy" x="-4%" y="-4%" width="108%" height="108%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="8" result="w"/>
        <feDisplacementMap in="SourceGraphic" in2="w" scale="4" xChannelSelector="R" yChannelSelector="G" result="d"/>
        <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="2" result="n"/>
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -55 0 0 0 39.5" result="h"/>
        <feComposite in="d" in2="h" operator="in" result="e"/>
        <feComponentTransfer in="e"><feFuncA type="discrete" tableValues="0 0 0 1 1 1"/></feComponentTransfer>
      </filter>
    </defs></svg>
    <div class="xpa">
      <div class="xpa-wall">${frags}</div>
      <div class="xpa-main">
        <div class="xpa-hl" aria-hidden="true">${hl}</div>
        <div class="xpa-strip"><span>No gods · no masters · no templates</span></div>
      </div>
      <div class="xpa-photo">
        <span class="xpa-tape"></span>
        <div class="xpa-img"><b>${ini}</b><i class="xpa-bar"></i></div>
        <p class="xpa-cap">fig. 1 — no comment.</p>
        ${pin}
      </div>
    </div>`;
  },

  materials: [
    { name: 'Ransom tile', css: 'background: #E9E3D0; color: #111111; font-size: .82–1.3em; transform: translateY(var(--dy)) rotate(var(--r)); /* each LETTER its own tile: its own face, ground (newsprint #E9E3D0, white, black, grey #B9B6AB, the fluoro {primary}, one accent tile), size, rotation of at most 5.5 degrees and scissor-cut edges; 1px darker edge and a faint shadow */' },
    { name: 'Wheatpaste sheet', css: 'background: {sheet}; color: {sheetInk}; filter: url(#xpn-torn) drop-shadow(3px 4px 0 rgba(0,0,0,.65)); transform: rotate(-.6deg); /* a torn paper sheet over the wall: fibrous torn edge, overlaps its neighbour by 8-24px, a safety pin or tape at one corner */' },
    { name: 'Fluoro', css: 'background: {fluoro}; color: #0a0a0a; /* the client primary pushed to Day-Glo; tile, highlighter swipe or button, never text on newsprint; the ONLY fluoro */' },
    { name: 'Marker mark-up', css: 'stroke: #111111 (on a scrap) or {fluoro} (on the wall); stroke-width: 3.2px; stroke-linecap: round; /* an imperfect double-loop circle = selected, two unequal crossing strokes = deleted, a scribble = removed */' },
    { name: 'Censor bar', css: 'background: #000000; color: transparent; /* a solid black bar over an eyes line or a status; never a blur */' },
    { name: 'Tape', css: 'background: {tape}; border: 1px solid {tapeEdge}; width: 52px; height: 18px; transform: rotate(-33deg); /* translucent strip of the client secondary across a sheet corner */' },
    { name: 'Rubber stamp', css: 'color: {stamp}; border: 2px solid {stamp}; transform: rotate(-3deg); text-transform: uppercase; letter-spacing: .14em; /* kicker, nav and badges; accent-ink on the wall, never a rounded button */' },
  ],

  rules: {
    do: [
      'Build every headline from ransom tiles: each letter its own face, ground, size (82–130%), tilt (at most 5.5 degrees) and scissor-cut edge; one tile in five is the fluoro.',
      'Keep the wall dark and the sheets layered: torn edges, overlap of 8–24px, a pin or strip of tape, black type on every scrap.',
      'Spend the single fluoro by hand: marker circles for selected, crossed-out for removed, a censor bar for hidden, a highlighter swipe for emphasis.',
      'Apply photocopy grain and threshold to images and scraps only; running UI text stays crisp and typewritten.',
    ],
    dont: [
      'Use a white page or a coherent single column as the main surface; that is Xerox, and the wall must collide.',
      'Set tiles in one face or one size, rotate past 6 degrees, or tilt every element at random.',
      'Add a second fluoro, fluoro text on newsprint, stock splatter brushes, ripped-paper PNGs with clean shadows, skulls, chains or spikes.',
      'Reproduce Sex Pistols or Reid artwork, a flag, a Black Flag bar set or the Supreme box logo; re-make the technique with original content.',
    ],
  },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    principles: [
      ['A wall, not a page', 'Many sources overlap on a dark ground; nothing sits neatly.'],
      ['Every tile is its own face', 'Ransom headlines vary font, size, ground and tilt.'],
      ['One fluoro, used by hand', 'Marker circles and cross-outs carry state and emphasis.'],
    ],
    do: [
      'Build headlines from mismatched cut tiles.',
      'Use circles, cross-outs and censor bars for states.',
      'Push only the primary to Day-Glo.',
    ],
    dont: [
      'Use a white page as the main surface.',
      'Rotate beyond six degrees or randomly.',
      'Use more than one fluoro.',
    ],
  },
});
})();
