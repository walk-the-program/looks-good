/* 18 Pixel Arcade — playful, crunchy, nostalgic. References: Balatro, eBoy,
   PICO-8, Animal Well, Hyper Light Drifter, Susan Kare. Everything sits on a 4px
   grid. Borders are stepped (box-shadow stacks that notch the corners, no
   border-radius); shading is dithered (2x2 checker) instead of smooth. The hero
   is a centred title screen drawn at ONE integer pixel scale (--pxs screen px
   per scene unit; the SVG is never sliced): the brand's own world — a night city
   behind stepped mountains, a 12x16 protagonist under a signboard carrying the
   brand initial, a brand gem and three spark pickups, hearts, 1UP and a score
   drawn in the same scene units, and a scanline pattern locked to the sprite
   grid. No borrowed props (no coins, no "?" blocks). The headline sits in an RPG
   dialog box with a stepped pixel extrusion. */

let pxaSeq = 0;

// 12 x 16 protagonist: o outline, c cap, h face, e eye, b body, w highlight, d belt, l legs
const PXA_HERO = [
  '....oooo....',
  '...occcco...',
  '..occccccoo.',
  '..ohhhhhho..',
  '..ohehheho..',
  '..ohhhhhho..',
  '...ohhhho...',
  '.obbbbbbbbo.',
  'obwbbbbbbbbo',
  'obbbbbbbbbbo',
  'ohobbbbbbboh',
  '.obbbbbbbbo.',
  '.oddddddddo.',
];
const PXA_LEGS = [
  ['..oll..llo..', '..oll..llo..', '..ooo..ooo..'],
  ['...oll.llo..', '..oll...llo.', '..ooo...ooo.'],
];
// brand gem: 9 x 9 diamond, two tones and a 1px highlight (a = light, g = gem, s = shade)
const PXA_GEM = ['....o....', '...oao...', '..oaggo..', '.oagggso.', 'oagggggso', '.ogggsso.', '..oggso..', '...oso...', '....o....'];

registerAesthetic({
  key: 'pixel-arcade', order: 18,
  name: 'Pixel Arcade',
  descriptor: 'Playful · Crunchy · Nostalgic',
  influences: 'PICO-8 / eBoy / Balatro / Indie title screens',
  summary: 'A title screen in the brand\'s own pixel world: stepped borders, dithered shading, one pixel scale.',
  motto: 'Press start.',
  kicker: 'Player one',
  mode: 'dark',
  slideShape: 'minimal',
  labels: { material: 'Sprites', states: ['Idle', 'Hover', 'Press'], statesKind: 'button' },
  layout: { hero: 'scene', palette: 'swatches', sections: 'two-col' },
  type: { ui: 'sans', label: 'sans', display: 1 },
  highlight: 'custom',
  highlightNote: 'The word is set in the accent (shaded to read as text) with a hard stepped 4px shadow in a deep shade of the accent; no fill, no underline. The headline itself carries a hard 4px primary-deep shadow (2px in a softened ink on a light canvas).',
  cardFill: '--ab-panel',

  roles: {
    canvas: {
      use: 'The dark screen of the page and the sky of the landscape; every panel is a slightly lighter fill with a stepped border',
      never: 'Text, or a smooth gradient (use a 2x2 dither instead)',
    },
    primary: {
      use: 'The one pixel button, the selected tab, the switch "on", progress blocks and the hero sprite',
      never: 'Body text, panel fills, a second CTA',
    },
    secondary: {
      use: 'The landscape (city, hills and grass), status tags and the second progress color',
      never: 'The main button, body text, page background',
    },
    accent: {
      use: 'The brand gem, spark pickups, hearts, the score and the headline word: collectibles and highlights',
      never: 'Buttons, body text, borders, panel fills',
      coverage: '≤5%',
    },
  },

  // Its own ground, never the client's neutral: a violet night (the cabinet the title
  // screen sits in), or a warm cartridge-label paper in light mode.
  canvas(b) {
    return b.isDark ? '#17102a' : '#efe9dc';
  },

  tokens(t) {
    const d = t.isDark;
    const st = typeof state !== 'undefined' ? state : null;
    const hName = st && st.headingFont ? st.headingFont.name : '';
    const hPixel = !!(st && st.headingFont && st.headingFont.cls === 'pixel');
    // Press Start 2P is very wide: shrink the display scale. Non-pixel headings get a hard shadow and no smoothing.
    const display = hName === 'Press Start 2P' ? 0.62 : hPixel ? 0.92 : 1;
    const uiFace = st && typeof abSansFace === 'function' && st.headingFont ? abSansFace(st) : null;
    // VT323 has a tiny x-height: scale interface text up
    const uiScale = uiFace && uiFace.name === 'VT323' ? 1.36 : 1;
    const dim = (hex, f) => t.mix('#000000', hex, f);
    return {
      '--ab-px': '4px',
      '--ab-display': display,
      '--ab-uis': uiScale,
      '--ab-smooth': hPixel ? 'antialiased' : 'none',
      '--ab-hw': hPixel ? 400 : 800,
      '--ab-bd': d ? t.mix(t.ink, t.canvas, 0.82) : t.ink,
      '--ab-bd-dim': t.mix(t.ink, t.canvas, d ? 0.3 : 0.45),
      '--ab-panel': d ? t.mix(t.ink, t.canvas, 0.07) : t.mix('#ffffff', t.canvas, 0.6),
      '--ab-panel-hi': d ? t.mix(t.ink, t.canvas, 0.12) : '#ffffff',
      '--ab-panel-sh': d ? dim(t.canvas, 0.35) : t.mix(t.ink, t.canvas, 0.12),
      '--ab-slot': d ? dim(t.canvas, 0.55) : t.mix(t.ink, t.canvas, 0.1),
      '--ab-p-deep': dim(t.primary, 0.58),
      '--ab-p-hi': t.mix('#ffffff', t.primary, 0.3),
      '--ab-s-deep': dim(t.secondary, 0.58),
      '--ab-a-deep': dim(t.accent, 0.5),
      '--ab-dither': t.alpha(t.ink, d ? 0.07 : 0.08),
      '--ab-glow': t.alpha(t.primary, 0.5),
      '--ab-hl-soft': t.mix(t.ink, t.canvas, 0.7),
    };
  },

  // The title screen: 168 x 80 scene units, drawn with rects only, shown at an integer
  // multiple of screen pixels (css --pxs) with preserveAspectRatio meet, so every
  // sprite, heart, digit and scanline shares one pixel.
  art(ctx) {
    const t = ctx.t;
    const n = ++pxaSeq;
    const M = (a, b, x) => t.mix(a, b, x);
    const night = '#130d24';
    const pDeep = M('#000000', t.primary, 0.58);
    const rects = [];
    const defs = [];
    const R = (x, y, w, h, fill) => rects.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`);
    const dither = (id, c) => defs.push(`<pattern id="${id}" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="1" height="1" fill="${c}"/><rect x="1" y="1" width="1" height="1" fill="${c}"/></pattern>`);
    const sprite = (rows, x0, y0, pal) => rows.forEach((row, r) => { for (let c = 0; c < row.length; c++) { const k = row[c]; if (pal[k]) R(x0 + c, y0 + r, 1, 1, pal[k]); } });
    const glyph = (ch, x0, y0, c) => { const g = AB_FONT_5X7[ch]; if (!g) return; g.split(' ').forEach((row, r) => { for (let i = 0; i < 5; i++) if (row[i] === '1') R(x0 + i, y0 + r, 1, 1, c); }); };
    // sky: five night bands that cool toward the secondary at the horizon, joined by 2x2 dither
    const sky = [night, M(t.secondary, night, 0.1), M(t.secondary, night, 0.18), M(t.secondary, night, 0.28), M(t.secondary, night, 0.4)];
    const ys = [0, 16, 28, 38, 46];
    sky.forEach((c, i) => {
      R(0, ys[i], 168, (ys[i + 1] || 62) - ys[i], c);
      if (i > 0) { dither(`pxd${n}-${i}`, sky[i - 1]); rects.push(`<rect x="0" y="${ys[i]}" width="168" height="4" fill="url(#pxd${n}-${i})"/>`); }
    });
    // stars: single pixels, a few 2x2 twinkles
    const starC = '#e9e4f2';
    [[6, 5], [19, 11], [31, 3], [47, 9], [58, 4], [71, 13], [84, 6], [99, 2], [109, 12], [127, 7], [141, 3], [154, 10], [163, 18], [12, 20], [64, 21], [92, 19], [136, 22]]
      .filter(([x, y]) => !(y < 13 && (x < 52 || x > 124)))   // keep the HUD rows clear
      .forEach(([x, y], i) => R(x, y, i % 5 === 0 ? 2 : 1, i % 5 === 0 ? 2 : 1, i % 3 ? starC : M(starC, night, 0.5)));
    // moon (pale, not a collectible colour), dithered shadow side
    const moonC = '#efe7c8';
    const moon = [[2, 6], [1, 8], [0, 10], [0, 10], [0, 10], [0, 10], [1, 8], [2, 6]];
    moon.forEach(([o, w], r) => R(62 + o, 9 + r, w, 1, moonC));
    dither(`pxm${n}`, M(moonC, night, 0.55));
    moon.forEach(([o, w], r) => { if (r > 1) rects.push(`<rect x="${62 + o + w - 4}" y="${9 + r}" width="4" height="1" fill="url(#pxm${n})"/>`); });
    // cloud sprites
    const cloudC = M('#ffffff', sky[2], 0.22);
    const cloud = (x, y) => { R(x + 3, y, 6, 1, cloudC); R(x + 1, y + 1, 12, 1, cloudC); R(x, y + 2, 16, 2, cloudC); R(x + 2, y + 4, 11, 1, M('#000000', cloudC, 0.82)); };
    cloud(52, 24); cloud(108, 15); cloud(146, 31);
    // parallax back layer: a distant city, windows lit sparsely in the accent
    const city = M(t.secondary, night, 0.3);
    const win = M(t.accent, city, 0.55);
    let cx = 0, k = 0;
    while (cx < 168) {
      const w = 6 + ((k * 7) % 9), h = 8 + ((k * 13) % 15);
      R(cx, 52 - h, w, h + 4, city);
      if (k % 3 === 1) R(cx + Math.floor(w / 2), 52 - h - 3, 1, 3, city);
      for (let wy = 52 - h + 2; wy < 50; wy += 3) for (let wx = cx + 1; wx < cx + w - 1; wx += 2) if (((wx * 3 + wy * 5 + k) % 7) === 0) R(wx, wy, 1, 1, win);
      cx += w + 1; k++;
    }
    // far mountains: stepped 4-unit columns
    const far = M(t.secondary, night, 0.46);
    for (let x = 0; x < 168; x += 4) {
      const h = 8 + Math.round(6 * Math.sin(x / 19) + 4 * Math.sin(x / 7.3 + 1.2) + 2 * Math.sin(x / 3.1));
      R(x, 58 - h, 4, h + 4, far);
    }
    // near hills with a dithered ridge
    const hill = M(t.secondary, night, 0.62);
    dither(`pxh${n}`, far);
    for (let x = 0; x < 168; x += 4) {
      const h = 5 + Math.round(3 * Math.sin(x / 13 + 2) + 2 * Math.sin(x / 5.5));
      R(x, 62 - h, 4, h + 2, hill);
      rects.push(`<rect x="${x}" y="${62 - h}" width="4" height="2" fill="url(#pxh${n})"/>`);
    }
    // pines
    const pine = M(t.secondary, '#000000', 0.42);
    [[4, 57], [12, 59], [60, 58], [158, 58]].forEach(([x, y]) => { R(x + 3, y - 12, 2, 2, pine); R(x + 2, y - 10, 4, 3, pine); R(x + 1, y - 7, 6, 3, pine); R(x, y - 4, 8, 3, pine); R(x + 3, y - 1, 2, 3, '#2a1d17'); });
    // ground: grass cap with a one-row tuft pattern, stone-dark soil with a brick pattern
    const soil = M(t.secondary, '#24180f', 0.18);
    const soilDark = M('#000000', soil, 0.7);
    const grass = t.secondary, grassHi = M('#ffffff', grass, 0.32), grassLo = M('#000000', grass, 0.7);
    R(0, 62, 168, 18, soil);
    for (let y = 68; y < 80; y += 6) { R(0, y, 168, 1, soilDark); for (let x = ((y / 6) % 2) * 6; x < 168; x += 12) R(x, y, 1, 6, soilDark); }
    R(0, 62, 168, 4, grass); R(0, 62, 168, 1, grassHi); R(0, 65, 168, 1, grassLo);
    for (let x = 1; x < 168; x += 3) R(x, 61, 1, 1, x % 2 ? grass : grassHi);
    for (let x = 2; x < 168; x += 6) R(x, 66, 2, 1, grass);
    // the signboard the protagonist stands under: two posts, a board with the brand initial
    const wood = '#6b4a2e', woodDk = '#3e2a19', board = '#e9dcc0';
    const ch = String(ctx.initial || '').toUpperCase();
    R(119, 31, 2, 31, woodDk); R(133, 31, 2, 31, woodDk); R(120, 31, 1, 31, wood); R(134, 31, 1, 31, wood);
    R(116, 20, 22, 13, woodDk); R(117, 21, 20, 11, board); R(117, 31, 20, 1, M('#000000', board, 0.82));
    glyph(AB_FONT_5X7[ch] && ch !== '?' ? ch : 'M', 124, 23, t.primary);
    // the protagonist (12 x 16): cap and body in the primary, a pale face, a darker primary outline
    const pal = { o: pDeep, c: t.primary, h: '#f1dcc0', e: '#1a1020', b: t.primary, w: M('#ffffff', t.primary, 0.45), d: M('#000000', t.primary, 0.72), l: '#2a2236' };
    R(119, 61, 14, 1, M('#000000', grass, 0.55)); // contact shadow
    sprite(PXA_HERO, 121, 46, pal);
    rects.push(`<g class="pxa-f1">${PXA_LEGS[0].map((row, r) => row.split('').map((kk, c) => pal[kk] ? `<rect x="${121 + c}" y="${59 + r}" width="1" height="1" fill="${pal[kk]}"/>` : '').join('')).join('')}</g>`);
    rects.push(`<g class="pxa-f2" style="opacity:0">${PXA_LEGS[1].map((row, r) => row.split('').map((kk, c) => pal[kk] ? `<rect x="${121 + c}" y="${59 + r}" width="1" height="1" fill="${pal[kk]}"/>` : '').join('')).join('')}</g>`);
    // brand gem (accent, two tones, 1px highlight) and three spark pickups
    sprite(PXA_GEM, 95, 34, { o: M('#000000', t.accent, 0.45), a: M('#ffffff', t.accent, 0.55), g: t.accent, s: M('#000000', t.accent, 0.72) });
    R(99, 45, 1, 1, M('#000000', grass, 0.6)); R(98, 46, 3, 1, M('#000000', sky[4], 0.7));
    const spark = (x, y) => { R(x + 2, y, 1, 5, t.accent); R(x, y + 2, 5, 1, t.accent); R(x + 2, y + 2, 1, 1, '#ffffff'); };
    spark(80, 46); spark(104, 22); spark(148, 40);
    // HUD in scene units: hearts, 1UP, score
    const heartRows = ['.oo.oo.', 'oaaoaao', 'oaaaaao', '.oaaao.', '..oao..', '...o...'];
    const heart = (x, on) => sprite(heartRows, x, 4, { o: '#0e0918', a: on ? t.accent : '#3a3150' });
    heart(4, true); heart(12, true); heart(20, false);
    ['1', 'U', 'P'].forEach((c, i) => glyph(c, 31 + i * 6, 4, '#f3efe6'));
    '004200'.split('').forEach((c, i) => glyph(c, 128 + i * 6, 4, i < 2 ? M('#f3efe6', night, 0.45) : t.accent));
    // scanlines locked to the sprite grid: every other scene row, 12% black
    defs.push(`<pattern id="pxl${n}" width="1" height="2" patternUnits="userSpaceOnUse"><rect width="1" height="1" fill="#000" opacity=".12"/></pattern>`);
    rects.push(`<rect width="168" height="80" fill="url(#pxl${n})"/>`);
    return `<svg class="pxa-scene" viewBox="0 0 168 80" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" shape-rendering="crispEdges" focusable="false" style="display:block"><defs>${defs.join('')}</defs>${rects.join('')}</svg>`;
  },

  materials: [
    { name: 'Pixel panel', css: 'background: {panel}; border-radius: 0; box-shadow: 0 -4px 0 0 {bd}, 0 4px 0 0 {bd}, -4px 0 0 0 {bd}, 4px 0 0 0 {bd}, inset -4px -4px 0 0 {panelSh}; /* a stepped border: four 4px box-shadows notch the corners; no border-radius anywhere */' },
    { name: 'Pixel button', css: 'background: {primary}; color: {onPrimary}; border-radius: 0; box-shadow: 0 -4px 0 0 {bd}, 0 4px 0 0 {bd}, -4px 0 0 0 {bd}, 4px 0 0 0 {bd}, inset 0 -4px 0 0 {pDeep}, inset 0 4px 0 0 {pHi}, 0 8px 0 0 {pDeep}; /* hover: translateY(-2px). pressed: translateY(4px) and the 8px underside shadow disappears */' },
    { name: 'Dither', css: 'background-image: conic-gradient({dither} 25%, transparent 0 50%, {dither} 0 75%, transparent 0); background-size: 4px 4px; /* 2x2 checker used instead of smooth gradients */' },
    { name: 'Pixel field', css: 'background: {slot}; border-radius: 0; box-shadow: 0 -4px 0 0 {bdDim}, 0 4px 0 0 {bdDim}, -4px 0 0 0 {bdDim}, 4px 0 0 0 {bdDim}, inset 4px 4px 0 0 rgba(0,0,0,.4); caret-color: {primary};' },
    { name: 'Progress blocks', css: 'repeating blocks 8px wide with a 4px gap: filled {primary}, unfilled {bdDim}; no rounded ends' },
    { name: 'Highlight word', css: 'color: {accentInk}; text-shadow: 4px 4px 0 {aDeep}; /* a hard stepped shadow, no fill or underline */' },
    { name: 'Sprite art', css: 'shape-rendering: crispEdges; image-rendering: pixelated; width: calc(168px * var(--pxs)); /* rects only, one integer pixel scale (4 desktop, 2 phone), preserveAspectRatio meet; scanlines are a 1x2 pattern inside the SVG */' },
  ],

  rules: {
    do: [
      'Draw every border as a stepped 4px box-shadow stack that notches the corners; keep every size a multiple of 4px.',
      'Shade with 2x2 dither and hard bands, never a smooth gradient or blur.',
      'Make the main button raise 4px on its underside and let that underside vanish when pressed.',
      'Use the accent for the brand\'s own collectibles: the gem, spark pickups, hearts and the headline word with a hard 4px shadow.',
      'Draw the whole scene at one integer pixel scale; never lay an overlay (scanlines, glow) at another pitch.',
    ],
    dont: [
      'Use border-radius, soft shadows, blur or anti-aliased curves on UI or art.',
      'Set long text in a pixel display face; keep paragraphs in VT323 or a mono at a readable size.',
      'Tint panels with the primary or accent; panels are the canvas lifted one step.',
      'Animate beyond a two-frame blink or a 4px press; no easing, no fades.',
      'Borrow another game\'s props (coins, "?" blocks, mushrooms); invent the brand\'s own world.',
    ],
  },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    principles: [
      ['Everything snaps to 4px', 'Stepped borders and sizes in multiples of four.'],
      ['Dither, never gradients', '2x2 dither and hard bands for shading.'],
      ['An owned world', 'A brand protagonist, a brand gem and sparks; nothing borrowed.'],
    ],
    do: [
      'Draw borders as stepped 4px stacks.',
      'Shade with 2x2 dither.',
      'Raise the main button 4px.',
    ],
    dont: [
      'Use border-radius or soft shadows.',
      'Set long text in a pixel face.',
      'Borrow another game\'s coins or blocks.',
    ],
  },
});

