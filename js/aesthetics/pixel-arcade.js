/* 18 Pixel Arcade — playful, crunchy, nostalgic. Reference: Celeste and Stardew
   Valley UI, PICO-8, pixel-art itch.io pages. Everything sits on a 4px grid.
   Borders are stepped (box-shadow stacks that notch the corners, no
   border-radius); shading is dithered (2x2 checker) instead of smooth. The hero is
   a game title screen: a pixel landscape (rects only, shape-rendering crispEdges)
   with a sprite of the brand initial, a coin, a heart HUD and a score, and the
   headline in an RPG dialog box. The CTA is a pixel button whose 4px underside
   disappears on press. */

let pxaSeq = 0;

// item-block fallback glyph for initials the 5x7 map does not cover
const PXA_STAR = '00100 00100 11111 01110 01010 10001 00000';

registerAesthetic({
  key: 'pixel-arcade', order: 18,
  name: 'Pixel Arcade',
  descriptor: 'Playful · Crunchy · Nostalgic',
  influences: '8-bit/16-bit games / Pixel art / Indie game UI',
  summary: 'Stepped pixel borders, dithered shading and a sprite on a pixel landscape.',
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
      use: 'The landscape (hills and grass), status tags and the second progress color',
      never: 'The main button, body text, page background',
    },
    accent: {
      use: 'Coins, hearts, the headline word and the item blocks: collectibles and highlights',
      never: 'Buttons, body text, borders, panel fills',
      coverage: '≤5%',
    },
  },

  // Dark canvases settle at lightness <= 12%: a night-sky screen that pixels pop on.
  canvas(b) {
    if (!b.isDark) return null;
    const h = b.hexToHsl(b.canvas);
    return h.l > 12 ? b.hslToHex(h.h, Math.min(h.s, 45), 12) : b.canvas;
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

  // The landscape is drawn on a 168 x 80 unit grid; the SVG is sliced, so narrow boards crop the sides.
  art(ctx) {
    const t = ctx.t;
    const n = ++pxaSeq;
    const mixc = (a, b, x) => t.mix(a, b, x);
    const outline = mixc('#000000', t.canvas, 0.62);
    const rects = [];
    const R = (x, y, w, h, fill) => rects.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`);
    // sky: five bands joined by 2x2 dither strips
    // cool-to-warm dusk, top to horizon: secondary, secondary/primary, then primary
    const sky = [mixc(t.secondary, t.canvas, 0.22), mixc(t.secondary, t.canvas, 0.34), mixc(mixc(t.secondary, t.primary, 0.5), t.canvas, 0.48), mixc(t.primary, t.canvas, 0.62), mixc(t.primary, t.canvas, 0.78)];
    const ys = [0, 14, 26, 38, 48];
    const defs = [];
    sky.forEach((c, i) => {
      R(0, ys[i], 168, (ys[i + 1] || 62) - ys[i], c);
      if (i > 0) {
        defs.push(`<pattern id="pxd${n}-${i}" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="1" height="1" fill="${sky[i - 1]}"/><rect x="1" y="1" width="1" height="1" fill="${sky[i - 1]}"/></pattern>`);
        rects.push(`<rect x="0" y="${ys[i]}" width="168" height="4" fill="url(#pxd${n}-${i})"/>`);
      }
    });
    // stars
    const starC = mixc(t.ink, t.canvas, 0.7);
    [[8, 6], [24, 12], [41, 4], [58, 10], [75, 5], [92, 12], [118, 6], [136, 3], [153, 11], [160, 22], [14, 24], [66, 22], [101, 19]].forEach(([x, y], i) => R(x, y, i % 4 === 0 ? 2 : 1, i % 4 === 0 ? 2 : 1, starC));
    // moon: accent, built from row spans, with a dithered shadow side
    const moon = [[2, 6], [1, 8], [0, 10], [0, 10], [0, 10], [0, 10], [1, 8], [2, 6]];
    const mx = 64, my = 9;
    moon.forEach(([o, w], r) => R(mx + o, my + r, w, 1, t.accent));
    moon.forEach(([o, w], r) => { if (r > 2) R(mx + o + w - 3, my + r, 3, 1, mixc(t.accent, t.canvas, 0.78)); });
    R(mx + 3, my + 1, 2, 1, mixc('#ffffff', t.accent, 0.5));
    // pixel clouds
    const cloudC = mixc(t.ink, sky[2], 0.16);
    [[24, 30], [96, 24], [146, 36]].forEach(([x, y]) => { R(x + 2, y, 10, 1, cloudC); R(x, y + 1, 16, 2, cloudC); R(x + 3, y + 3, 11, 1, cloudC); R(x + 5, y - 1, 5, 1, cloudC); });
    // far mountains: stepped, 4-unit columns
    const far = mixc(t.secondary, t.canvas, 0.2);
    for (let x = 0; x < 168; x += 4) {
      const h = 12 + Math.round(8 * Math.sin(x / 19) + 5 * Math.sin(x / 7.3 + 1.2) + 3 * Math.sin(x / 3.1));
      R(x, 58 - h, 4, h + 6, far);
    }
    // near hills with a dithered ridge
    const hill = mixc(t.secondary, t.canvas, 0.38);
    defs.push(`<pattern id="pxh${n}" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="1" height="1" fill="${far}"/><rect x="1" y="1" width="1" height="1" fill="${far}"/></pattern>`);
    for (let x = 0; x < 168; x += 4) {
      const h = 6 + Math.round(4 * Math.sin(x / 13 + 2) + 3 * Math.sin(x / 5.5));
      R(x, 62 - h, 4, h + 2, hill);
      rects.push(`<rect x="${x}" y="${62 - h}" width="4" height="2" fill="url(#pxh${n})"/>`);
    }
    // pine trees on the hills
    const pine = mixc(t.secondary, '#000000', 0.45);
    [[6, 56], [14, 58], [72, 57], [158, 57]].forEach(([x, y]) => { R(x + 3, y - 12, 2, 2, pine); R(x + 2, y - 10, 4, 3, pine); R(x + 1, y - 7, 6, 3, pine); R(x, y - 4, 8, 3, pine); R(x + 3, y - 1, 2, 3, mixc('#000000', t.primary, 0.5)); });
    // ground: grass cap, dirt with a brick pattern
    const dirt = mixc(t.primary, t.canvas, 0.26);
    const dirtDark = mixc(t.primary, t.canvas, 0.16);
    const grass = t.secondary;
    const grassHi = mixc('#ffffff', grass, 0.3);
    R(0, 62, 168, 18, dirt);
    for (let y = 68; y < 80; y += 6) { R(0, y, 168, 1, dirtDark); for (let x = ((y / 6) % 2) * 6; x < 168; x += 12) R(x, y, 1, 6, dirtDark); }
    R(0, 62, 168, 4, grass);
    R(0, 62, 168, 1, grassHi);
    for (let x = 2; x < 168; x += 6) R(x, 66, 2, 2, grass);
    for (let x = 0; x < 168; x += 8) R(x + 3, 60 + (x % 16 === 0 ? 1 : 0), 1, 2, grass);
    // item blocks (the brand initial, or a star when it has no glyph) with a coin above
    const initialKey = String(ctx.initial || '').toUpperCase();
    const blockGlyph = (AB_FONT_5X7[initialKey] && initialKey !== '?' ? AB_FONT_5X7[initialKey] : PXA_STAR).split(' ');
    const block = (bx, by) => {
      R(bx, by, 12, 12, outline); R(bx + 1, by + 1, 10, 10, t.accent); R(bx + 1, by + 1, 10, 1, mixc('#ffffff', t.accent, 0.45)); R(bx + 1, by + 10, 10, 1, mixc('#000000', t.accent, 0.3));
      blockGlyph.forEach((row, r) => { for (let c = 0; c < 5; c++) if (row[c] === '1') R(bx + 3 + c, by + 3 + r, 1, 1, mixc('#000000', t.accent, 0.55)); });
    };
    block(105, 40); block(117, 40);
    // coins
    const coin = (cx, cy) => {
      const rows = [[2, 4], [1, 6], [0, 8], [0, 8], [0, 8], [0, 8], [1, 6], [2, 4]];
      rows.forEach(([o, w], r) => R(cx + o - 1, cy + r - 1, w + 2, 1, outline));
      R(cx + 1, cy - 2, 6, 1, outline); R(cx + 1, cy + 8, 6, 1, outline);
      rows.forEach(([o, w], r) => R(cx + o, cy + r, w, 1, t.accent));
      R(cx + 3, cy + 1, 2, 6, mixc('#ffffff', t.accent, 0.5)); R(cx + 5, cy + 2, 1, 4, mixc('#000000', t.accent, 0.78));
    };
    coin(107, 26); coin(119, 26); coin(113, 14);
    // the sprite: the brand initial on a pixel tile with feet, standing on the grass
    const sx = 136, sy = 36, sw = 20, sh = 20;
    R(sx - 1, 58, sw + 2, 4, mixc('#000000', t.secondary, 0.35)); // contact shadow on the grass
    R(sx + 2, sy + sh, 5, 4, outline); R(sx + 13, sy + sh, 5, 4, outline); R(sx + 3, sy + sh, 3, 3, mixc('#000000', t.primary, 0.55)); R(sx + 14, sy + sh, 3, 3, mixc('#000000', t.primary, 0.55));
    R(sx + 1, sy - 1, sw - 2, sh + 2, outline); R(sx - 1, sy + 1, sw + 2, sh - 2, outline); R(sx, sy, sw, sh, outline);
    R(sx + 1, sy + 1, sw - 2, sh - 2, t.primary);
    R(sx + 1, sy + 1, sw - 2, 1, mixc('#ffffff', t.primary, 0.35)); R(sx + 1, sy + 1, 1, sh - 2, mixc('#ffffff', t.primary, 0.35));
    R(sx + 2, sy + sh - 2, sw - 3, 1, mixc('#000000', t.primary, 0.72)); R(sx + sw - 2, sy + 2, 1, sh - 3, mixc('#000000', t.primary, 0.72));
    // dither the shaded corner
    defs.push(`<pattern id="pxs${n}" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="1" height="1" fill="${mixc('#000000', t.primary, 0.8)}"/><rect x="1" y="1" width="1" height="1" fill="${mixc('#000000', t.primary, 0.8)}"/></pattern>`);
    rects.push(`<rect x="${sx + sw - 6}" y="${sy + sh - 6}" width="5" height="4" fill="url(#pxs${n})"/>`);
    const glyph = (AB_FONT_5X7[String(ctx.initial).toUpperCase()] || AB_FONT_5X7['?']).split(' ');
    const gx = sx + 5, gy = sy + 3;
    glyph.forEach((row, r) => { for (let c = 0; c < 5; c++) if (row[c] === '1') { R(gx + c * 2 + 1, gy + r * 2 + 1, 2, 2, mixc('#000000', t.primary, 0.5)); } });
    glyph.forEach((row, r) => { for (let c = 0; c < 5; c++) if (row[c] === '1') { R(gx + c * 2, gy + r * 2, 2, 2, t.onPrimary); } });
    // sparkle pixels
    [[126, 28], [86, 36], [88, 52], [162, 44]].forEach(([x, y]) => { R(x, y, 1, 3, t.ink); R(x - 1, y + 1, 3, 1, t.ink); });
    const svg = `<svg class="pxa-scene" viewBox="0 0 168 80" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" shape-rendering="crispEdges" focusable="false"><defs>${defs.join('')}</defs>${rects.join('')}</svg>`;
    // hearts: outer shape in a dark/ink line, inner fill accent (full) or empty
    const outerRows = [[0, [[1, 2], [6, 2]]], [1, [[0, 4], [5, 4]]], [2, [[0, 9]]], [3, [[0, 9]]], [4, [[1, 7]]], [5, [[2, 5]]], [6, [[3, 3]]], [7, [[4, 1]]]];
    const innerRows = [[1, [[1, 2], [6, 2]]], [2, [[1, 7]]], [3, [[1, 7]]], [4, [[2, 5]]], [5, [[3, 3]]], [6, [[4, 1]]]];
    const heart = on => {
      const line = on ? outline : mixc(t.ink, t.canvas, 0.55);
      const fill = on ? t.accent : mixc('#000000', t.canvas, 0.5);
      const draw = (rows, c) => rows.map(([y, spans]) => spans.map(([x, w]) => `<rect x="${x}" y="${y}" width="${w}" height="1" fill="${c}"/>`).join('')).join('');
      const shine = on ? `<rect x="1" y="2" width="1" height="1" fill="${mixc('#ffffff', t.accent, 0.6)}"/>` : '';
      return `<svg viewBox="0 0 9 8" shape-rendering="crispEdges" focusable="false">${draw(outerRows, line)}${draw(innerRows, fill)}${shine}</svg>`;
    };
    return `${svg}<div class="pxa-hud"><span class="pxa-life">${heart(true)}${heart(true)}${heart(false)}</span><span class="pxa-score">SCORE <b>004200</b></span></div>`;
  },

  materials: [
    { name: 'Pixel panel', css: 'background: {panel}; border-radius: 0; box-shadow: 0 -4px 0 0 {bd}, 0 4px 0 0 {bd}, -4px 0 0 0 {bd}, 4px 0 0 0 {bd}, inset -4px -4px 0 0 {panelSh}; /* a stepped border: four 4px box-shadows notch the corners; no border-radius anywhere */' },
    { name: 'Pixel button', css: 'background: {primary}; color: {onPrimary}; border-radius: 0; box-shadow: 0 -4px 0 0 {bd}, 0 4px 0 0 {bd}, -4px 0 0 0 {bd}, 4px 0 0 0 {bd}, inset 0 -4px 0 0 {pDeep}, inset 0 4px 0 0 {pHi}, 0 8px 0 0 {pDeep}; /* hover: translateY(-2px). pressed: translateY(4px) and the 8px underside shadow disappears */' },
    { name: 'Dither', css: 'background-image: conic-gradient({dither} 25%, transparent 0 50%, {dither} 0 75%, transparent 0); background-size: 4px 4px; /* 2x2 checker used instead of smooth gradients */' },
    { name: 'Pixel field', css: 'background: {slot}; border-radius: 0; box-shadow: 0 -4px 0 0 {bdDim}, 0 4px 0 0 {bdDim}, -4px 0 0 0 {bdDim}, 4px 0 0 0 {bdDim}, inset 4px 4px 0 0 rgba(0,0,0,.4); caret-color: {primary};' },
    { name: 'Progress blocks', css: 'repeating blocks 8px wide with a 4px gap: filled {primary}, unfilled {bdDim}; no rounded ends' },
    { name: 'Highlight word', css: 'color: {accentInk}; text-shadow: 4px 4px 0 {aDeep}; /* a hard stepped shadow, no fill or underline */' },
    { name: 'Sprite art', css: 'shape-rendering: crispEdges; image-rendering: pixelated; /* rects only on a 4px grid; sky bands joined by 2x2 dither strips */' },
  ],

  rules: {
    do: [
      'Draw every border as a stepped 4px box-shadow stack that notches the corners; keep every size a multiple of 4px.',
      'Shade with 2x2 dither and hard bands, never a smooth gradient or blur.',
      'Make the main button raise 4px on its underside and let that underside vanish when pressed.',
      'Use the accent for collectibles: coins, hearts, item blocks and the headline word with a hard 4px shadow.',
    ],
    dont: [
      'Use border-radius, soft shadows, blur or anti-aliased curves on UI or art.',
      'Set long text in a pixel display face; keep paragraphs in VT323 or a mono at a readable size.',
      'Tint panels with the primary or accent; panels are the canvas lifted one step.',
      'Animate beyond a two-frame blink or a 4px press; no easing, no fades.',
    ],
  },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    principles: [
      ['Everything snaps to 4px', 'Stepped borders and sizes in multiples of four.'],
      ['Dither, never gradients', '2x2 dither and hard bands for shading.'],
      ['Collectibles use the accent', 'Coins, hearts, item blocks and one headline word.'],
    ],
    do: [
      'Draw borders as stepped 4px stacks.',
      'Shade with 2x2 dither.',
      'Raise the main button 4px.',
    ],
    dont: [
      'Use border-radius or soft shadows.',
      'Set long text in a pixel face.',
      'Animate beyond a two-frame blink.',
    ],
  },
});

