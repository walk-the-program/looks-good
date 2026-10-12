/* 22 Xerox — toner, cold, mechanical. The copier, not the person using it (that is
   Xerox Punk). References: Pati Hill's copier works (objects on the platen in a black
   void), copy art's generation loss, Munari's moved originals, Sniffin' Glue copied in
   monochrome. Rules: toner (#111) on ONE paper stock for the whole sheet (a pale copy-paper
   tint picked from the client primary's hue: canary, goldenrod, salmon, pink, lilac, blue,
   green, or white), no hand-made props (no tape, sticky notes, highlighter, torn edges or
   rotations: copies are square to the page; only the IMAGE distorts). The client primary
   appears only as that stock and as one overprinted rubber stamp in the art.
   Mechanism: real SVG filtering. art() emits one hidden <svg> with the filters (fixed ids,
   referenced from the css):
     xrx-copy / xrx-toner / xrx-edge / xrx-lite / xrx-rule  toothed, thresholded toner
     xrx-head   the headline copied hard: blur + low threshold, so counters partly fill
     xrx-gen1 / xrx-gen3 / xrx-gen7 (and -w variants in paper colour for the black field):
                generation loss. feGaussianBlur 0 / 1.1 / 1.8 + toner noise, then a discrete
                alpha threshold that drops lower each generation (shapes fatten, hairlines
                break), flooded with pure toner: no greys at any generation.
   The hero is the platen with the lid open: a black field with dither fall-off, the brand
   initial copied as a thresholded dot screen, a ghost double copy 10px off (a sparser screen,
   still pure toner), the copier's mm edge scale and an enlargement label. */
(function () {
let seq = 0;
const XR_HASH = (x, y) => { const v = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return v - Math.floor(v); };

// One generation of loss: blur the alpha, add toner noise, threshold lower each time
// (shapes fatten, counters fill, hairlines break), flood with pure toner. No greys.
function xrGen(id, blur, noise, table, color) {
  const n = noise ? `<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="${id.length * 7}" result="n"/>`
    + '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="na"/>'
    + `<feComposite in="b" in2="na" operator="arithmetic" k1="0" k2="1" k3="${noise}" k4="${(-noise / 2).toFixed(2)}" result="m"/>` : '';
  return `<filter id="${id}" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">`
    + `<feGaussianBlur in="SourceAlpha" stdDeviation="${blur}" result="b"/>${n}`
    + `<feComponentTransfer in="${noise ? 'm' : 'b'}" result="t"><feFuncA type="discrete" tableValues="${table}"/></feComponentTransfer>`
    + `<feFlood flood-color="${color}"/><feComposite in2="t" operator="in"/></filter>`;
}

// The ONE paper stock: a pale copy-paper tint picked from the client primary's hue (L about 90-94%).
const XR_STOCKS = [
  { name: 'Pink', h: [330, 360], hex: '#F5D6DC' }, { name: 'Pink', h: [0, 12], hex: '#F5D6DC' },
  { name: 'Salmon', h: [12, 32], hex: '#F6D9C6' }, { name: 'Goldenrod', h: [32, 48], hex: '#F2DFA6' },
  { name: 'Canary', h: [48, 72], hex: '#F4EDAF' }, { name: 'Green', h: [72, 170], hex: '#D9EBD2' },
  { name: 'Blue', h: [170, 255], hex: '#D3E2EE' }, { name: 'Lilac', h: [255, 330], hex: '#E3DBEE' },
];
function xrStock(primary) {
  const c = hexToHsl(primary);
  if (c.s < 18) return { name: 'White', hex: '#F1EFE9' };
  return XR_STOCKS.find(s => c.h >= s.h[0] && c.h < s.h[1]) || XR_STOCKS[0];
}
const XR_TONER = '#111111';

function xrDefs() {
  const sRGB = 'color-interpolation-filters="sRGB"';
  const holes = (freq, seed, cut) => `<feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" seed="${seed}" result="n"/>`
    + `<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -55 0 0 0 ${(55 * cut + 1).toFixed(1)}" result="h"/>`;
  const noiseGray = seed => `<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="${seed}" result="n"/>`
    + '<feColorMatrix in="n" type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" result="ng"/>';
  // the lid-open fall-off: a smooth ramp pushed through noise and a steep threshold (the hero's black field)
  const gen = (id, amt, slope, mid) => `<filter id="${id}" x="0" y="0" width="100%" height="100%" ${sRGB}>${noiseGray(5)}
      <feComposite in="SourceGraphic" in2="ng" operator="arithmetic" k1="0" k2="1" k3="${amt}" k4="${(-amt / 2).toFixed(3)}" result="m"/>
      <feComponentTransfer in="m"><feFuncR type="linear" slope="${slope}" intercept="${(0.5 - slope * mid).toFixed(2)}"/><feFuncG type="linear" slope="${slope}" intercept="${(0.5 - slope * mid).toFixed(2)}"/><feFuncB type="linear" slope="${slope}" intercept="${(0.5 - slope * mid).toFixed(2)}"/></feComponentTransfer></filter>`;
  return `<svg class="xr-defs" width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden"><defs>
    <filter id="xrx-copy" x="-4%" y="-6%" width="108%" height="112%" ${sRGB}>
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="8" result="w"/>
      <feDisplacementMap in="SourceGraphic" in2="w" scale="4.5" xChannelSelector="R" yChannelSelector="G" result="d"/>
      ${holes('0.015 0.5', 2, 0.8)}
      <feComposite in="d" in2="h" operator="in" result="e"/>
      <feComponentTransfer in="e"><feFuncA type="discrete" tableValues="0 0 0 1 1 1"/></feComponentTransfer>
    </filter>
    <filter id="xrx-toner" x="-4%" y="-8%" width="108%" height="116%" ${sRGB}>
      <feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="2" seed="3" result="w"/>
      <feDisplacementMap in="SourceGraphic" in2="w" scale="3" xChannelSelector="R" yChannelSelector="G" result="d"/>
      ${holes(0.55, 6, 0.665)}
      <feComposite in="d" in2="h" operator="in" result="e"/>
      <feComponentTransfer in="e"><feFuncA type="discrete" tableValues="0 0 0 1 1 1"/></feComponentTransfer>
    </filter>
    <filter id="xrx-edge" x="-3%" y="-6%" width="106%" height="112%" ${sRGB}>
      <feTurbulence type="fractalNoise" baseFrequency="0.11" numOctaves="2" seed="4" result="w"/>
      <feDisplacementMap in="SourceGraphic" in2="w" scale="3.4" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feComponentTransfer in="d"><feFuncA type="discrete" tableValues="0 0 0 1 1 1"/></feComponentTransfer>
    </filter>
    <filter id="xrx-lite" x="-3%" y="-8%" width="106%" height="116%" ${sRGB}>
      <feTurbulence type="fractalNoise" baseFrequency="0.16" numOctaves="2" seed="12" result="w"/>
      <feDisplacementMap in="SourceGraphic" in2="w" scale="1.5" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feComponentTransfer in="d"><feFuncA type="discrete" tableValues="0 0 0 1 1 1"/></feComponentTransfer>
    </filter>
    <filter id="xrx-rule" x="-2%" y="-400%" width="104%" height="900%" ${sRGB}>
      <feTurbulence type="fractalNoise" baseFrequency="0.16 0.5" numOctaves="2" seed="9" result="w"/>
      <feDisplacementMap in="SourceGraphic" in2="w" scale="3" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feComponentTransfer in="d"><feFuncA type="discrete" tableValues="0 0 0 1 1 1"/></feComponentTransfer>
    </filter>
    <filter id="xrx-head" x="-3%" y="-8%" width="106%" height="116%" ${sRGB}>
      <feGaussianBlur in="SourceGraphic" stdDeviation="1.15" result="b"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="8" result="w"/>
      <feDisplacementMap in="b" in2="w" scale="3.5" xChannelSelector="R" yChannelSelector="G" result="d"/>
      ${holes('0.015 0.5', 2, 0.8)}
      <feComposite in="d" in2="h" operator="in" result="e"/>
      <feComponentTransfer in="e"><feFuncA type="discrete" tableValues="0 0 1 1 1 1 1"/></feComponentTransfer>
    </filter>
    ${gen('xrx-g5', 0.6, 9, 0.46)}
    ${xrGen('xrx-gen1', 0, 0, '0 1', '#111111')}${xrGen('xrx-gen3', 1.1, 0.4, '0 0 1 1 1 1', '#111111')}${xrGen('xrx-gen7', 1.8, 0.75, '0 0 1 1 1 1 1 1', '#111111')}
    ${xrGen('xrx-gen1w', 0, 0, '0 1', '#F2F0EA')}${xrGen('xrx-gen3w', 1.1, 0.4, '0 0 1 1 1 1', '#F2F0EA')}${xrGen('xrx-gen7w', 1.8, 0.75, '0 0 1 1 1 1 1 1', '#F2F0EA')}
  </defs></svg>`;
}

registerAesthetic({
  key: 'xerox', order: 22,
  name: 'Xerox',
  descriptor: 'Toner · Cold · Copied',
  influences: 'Pati Hill copier works / Copy art / Generation loss',
  summary: 'Toner on one paper stock, copied until it degrades: thresholds, filled counters and a lid-open black platen.',
  motto: 'Copy of a copy of a copy.',
  kicker: 'Copy 032 / 050',
  mode: 'light',
  slideShape: 'minimal',
  labels: { material: 'Generations', states: ['Gen 1', 'Gen 3', 'Gen 7'], statesKind: 'swatch' },
  layout: { hero: 'poster', palette: 'swatches', sections: 'two-col' },
  type: { ui: 'body', label: 'body', display: 1 },
  highlight: 'custom',
  highlightNote: 'The word is reversed out of a solid toner slab (paper-coloured type on black), square to the line, copied with the same threshold as the headline; no colour, no rotation.',
  cardFill: '--xr-paper',

  roles: {
    canvas: {
      use: 'ONE coloured copy-paper stock for the whole sheet, picked from the client primary\'s hue at L 90–94% (canary, goldenrod, salmon, pink, lilac, blue, green; white for a grey primary); in dark mode the lid-open black platen with sheets of that stock on it',
      never: 'A second paper colour, a white digital panel, text',
    },
    ink: {
      use: 'Toner #111, spent big: the headline, the reversed toner bands, the lid-open field, rules, the main action block, selected states and status labels',
      never: 'Greys or gradients; toner is solid, dropped-out or absent',
      coverage: '30–40%',
    },
    primary: {
      use: 'Only as the paper stock and as one overprinted rubber stamp in the art',
      never: 'Fills, buttons, bars, tape, highlighter, text',
      coverage: '≤2%',
    },
    secondary: {
      use: 'Never printed: it copies as toner density (a dot screen) in the palette only',
      never: 'Any fill, tape, bar, button or text',
      coverage: '0%',
    },
    accent: {
      use: 'Never printed: it copies as toner density (a dot screen) in the palette only',
      never: 'Highlighter, stickers, buttons, borders, text',
      coverage: '0%',
    },
  },

  // Light: the whole sheet is the one paper stock. Dark: the lid-open black platen.
  canvas(b) { return b.isDark ? b.mix('#000000', b.canvas, 0.9) : xrStock(b.primary).hex; },

  tokens(t) {
    const st = typeof state !== 'undefined' ? state : null;
    const hf = st && st.headingFont;
    const d = t.isDark;
    const ws = String((hf && hf.weights) || '400').split(';').map(Number).filter(Boolean);
    const le = ws.filter(x => x <= 900);
    const hw = le.length ? Math.max(...le) : Math.min(...ws);
    const stock = xrStock(t.primary);
    const paper = stock.hex;                      // sheets are the stock in both modes
    const ink = d ? t.mix('#ffffff', paper, 0.25) : XR_TONER;   // on the black platen, type is paper-white
    const mutedOn = (fg, bg) => { let m = t.mix(fg, bg, 0.62); for (let k = 0; k < 8 && t.contrast(m, bg) < 4.6; k++) m = t.mix(fg, m, 0.25); return m; };
    // each brand colour as the copier sees it: toner density from its luminance (dot radius, % of the 6px cell)
    const dens = hex => Math.round(Math.max(6, Math.min(94, (1 - relativeLuminance(hex)) * 100)));
    const brand = typeof effectiveContent === 'function' ? String(effectiveContent().brandName || '') : '';
    const ini = (typeof abInitial === 'function' ? abInitial(brand) : 'X').replace(/["\\]/g, '');
    const v = {
      '--ab-tr': (hf && { wide: 0.4, techno: 0.4 }[hf.cls]) ?? 1,
      '--ab-type-pick-w': hw,
      '--ab-hw': hw,
      '--xr-paper': paper,
      '--xr-toner': XR_TONER,
      '--xr-paper-muted': mutedOn(XR_TONER, paper),
      '--xr-ini': `"${ini}"`,
      '--xr-stock-name': `"${stock.name.toUpperCase()} STOCK"`,
      '--xr-d2': `"copies as ${dens(t.secondary)}% toner"`,
      '--xr-d3': `"copies as ${dens(t.accent)}% toner"`,
      '--xr-r2': `${(dens(t.secondary) / 100 * 2.6 + 0.4).toFixed(2)}px`,
      '--xr-r3': `${(dens(t.accent) / 100 * 2.6 + 0.4).toFixed(2)}px`,
      '--ab-blend': d ? 'screen' : 'multiply',
      '--xr-gen': d ? 'w' : '',
    };
    if (!d) Object.assign(v, { '--ab-ink': XR_TONER, '--ab-muted': mutedOn(XR_TONER, t.canvas), '--ab-line': XR_TONER });
    else Object.assign(v, { '--ab-ink': ink, '--ab-muted': mutedOn(ink, t.canvas) });
    return v;
  },

  art(ctx) {
    const t = ctx.t;
    const id = 'xr' + (++seq);
    const W = 224, H = 200;
    const toner = XR_TONER;
    const paper = xrStock(t.primary).hex;
    // A copied image, not a screen: a 45-degree dot screen sized by a contrasty tone ramp, blurred and
    // re-thresholded so dots fuse into slabs in the shadows and drop out in the highlights; masked by the
    // initial and fading into the lid-open black. A ghost double copy (the original moved during the scan)
    // sits 10,8 off as a sparser screen: lighter by dot size, never by grey.
    const P = 7, dots = [], ghost = [];
    for (let j = 0; j * P / 2 < H; j++) {
      for (let i = 0; i * P < W; i++) {
        const x = i * P + (j % 2) * P / 2 + 3, y = j * P / 2 + 2;
        if (x < 40 || x > 216 || y < 10 || y > 188) continue;
        const ramp = 0.6 * (1 - (x - 40) / 176) + 0.4 * (y / H) + 0.28 * Math.exp(-(((x - 96) / 34) ** 2 + ((y - 150) / 30) ** 2));
        let d = 0.05 + 0.95 * Math.pow(Math.max(0, Math.min(1, ramp + (XR_HASH(i, j) - 0.5) * 0.3)), 1.7);
        d = Math.max(0.05, Math.min(1, d));
        dots.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(3.4 * Math.sqrt(d)).toFixed(2)}"/>`);
        ghost.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.5 * Math.sqrt(d)).toFixed(2)}"/>`);
      }
    }
    // stray toner specks, bunched like dust on the glass
    let specks = '';
    for (let k = 0; k < 22; k++) {
      const c = k % 3 === 0 ? [176, 150] : k % 3 === 1 ? [128, 22] : [200, 112];
      const x = c[0] + (XR_HASH(k, 3) - 0.5) * 30, y = c[1] + (XR_HASH(k, 7) - 0.5) * 26, r = 0.35 + XR_HASH(k, 11) * 0.9;
      specks += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}"/>`;
    }
    // the copier's edge scale: mm ticks along the top edge (toner on paper, paper on the black field)
    let ticks = '';
    for (let mm = 0, x = 2; x < W - 1; mm++, x += 2.2) {
      const len = mm % 10 === 0 ? 7 : mm % 5 === 0 ? 4.6 : 2.6;
      ticks += `<path d="M${x.toFixed(1)} 0V${len}" stroke="${x < 86 ? paper : toner}"/>`;
    }
    const nums = [10, 20, 30, 40, 50, 60, 70, 80, 90].map(n => {
      const x = 2 + n * 2.2;
      return `<text x="${(x + 1.2).toFixed(1)}" y="11.5" fill="${x < 86 ? paper : toner}">${n}</text>`;
    }).join('');
    const font = 'font-family:var(--ab-font-b),"Courier Prime","Courier New",monospace';
    const mask = `<text x="142" y="178" text-anchor="middle" font-size="182" fill="#fff" style="font-family:var(--ab-font-h);font-weight:var(--ab-hw,900)">${escapeHtml(ctx.initial)}</text>`;
    return `${xrDefs()}<div class="xra"><svg viewBox="0 0 ${W} ${H}" width="100%" height="100%" focusable="false" preserveAspectRatio="xMidYMid meet">
      <defs>
        <mask id="${id}m" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">${mask}</mask>
        <mask id="${id}g" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><g transform="translate(10 8)">${mask}</g></mask>
        <filter id="${id}t" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="1.1"/><feComponentTransfer><feFuncA type="discrete" tableValues="0 0 1 1"/></feComponentTransfer></filter>
        <linearGradient id="${id}r" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#fff"/></linearGradient>
      </defs>
      <g filter="url(#xrx-copy)">
        <rect x="2" y="2" width="220" height="196" fill="${paper}"/>
        <g mask="url(#${id}g)"><g transform="translate(10 8)" fill="${toner}">${ghost.join('')}</g></g>
        <g mask="url(#${id}m)"><g filter="url(#${id}t)" fill="${toner}">${dots.join('')}</g></g>
        <g fill="${toner}">${specks}</g>
      </g>
      <g filter="url(#xrx-rule)" fill="${toner}"><path d="M0 189H224V200H0Z"/><path d="M224 0V13L212 0Z"/></g>
      <g filter="url(#xrx-g5)" style="mix-blend-mode:multiply"><rect x="0" y="0" width="66" height="200" fill="#000"/><rect x="66" y="0" width="52" height="200" fill="url(#${id}r)"/></g>
      <g stroke-width=".5" fill="none">${ticks}</g>
      <g style="${font}" font-size="4.4">${nums}</g>
      <g transform="rotate(-90 12 150)" fill="${paper}" style="${font}" font-size="5.6" letter-spacing=".5" font-weight="700"><text x="12" y="152">A4 → A3 · 141% · LID OPEN · COPY 032/050</text></g>
      <g style="mix-blend-mode:multiply" transform="translate(150 24)"><rect x="0" y="0" width="64" height="22" fill="none" stroke="${t.primary}" stroke-width="2"/><rect x="2.6" y="2.6" width="58.8" height="16.8" fill="none" stroke="${t.primary}" stroke-width=".8"/><text x="32" y="10" text-anchor="middle" fill="${t.primary}" font-size="6.4" font-weight="700" letter-spacing=".8" style="${font}">RECEIVED</text><text x="32" y="16.6" text-anchor="middle" fill="${t.primary}" font-size="4.6" letter-spacing=".5" style="${font}">COPY ROOM · 032</text></g>
      <path d="M176 0V200" stroke="${toner}" stroke-opacity=".1" stroke-width="7" fill="none" filter="url(#xrx-rule)"/>
    </svg></div>`;
  },

  materials: [
    { name: 'Paper stock', css: 'background: {canvas}; /* ONE coloured copy paper for the whole sheet (from the primary\'s hue, L 90–94%); never a second stock */' },
    { name: 'Toner block', css: 'background: #111111; color: {canvas}; filter: url(#xrx-toner); /* solid black with toothed edges and dropout specks; one reversed band per view and the lid-open field, never a gradient */' },
    { name: 'Generation loss', css: 'filter: url(#xrx-gen3); /* blur 0 → 1.1 → 1.8, toner noise, a threshold that drops each generation (gen 1 / 3 / 7): shapes fatten, counters fill, hairlines break; pure toner, no greys */' },
    { name: 'Copied sheet', css: 'background: {canvas}; border: 1.5px solid #111111; filter: url(#xrx-lite); /* square to the page, a straight edge with a 1px toner fringe; no tape, no torn edge, no rotation */' },
    { name: 'Ghost copy', css: 'transform: translate(10px, 8px); /* the original moved during the scan: a second, sparser dot screen (smaller dots, never a grey) */' },
    { name: 'Rubber stamp', css: 'border: 2px solid {primary}; color: {primary}; mix-blend-mode: multiply; /* the ONE use of the client colour as ink: a single overprinted stamp in the art */' },
    { name: 'Copier noise', css: 'clustered dust (two-octave feTurbulence mask), one vertical drum streak 32px wide, edge burn, a mm edge scale and an enlargement label (A4 → A3 141%)' },
  ],

  rules: {
    do: [
      'Print toner on one paper stock: the client primary becomes the paper colour, and appears as ink only in one rubber stamp.',
      'Make generation loss the system: the same image at gen 1, 3 and 7, thresholded harder each time, counters filling.',
      'Keep copies square to the page; only the image distorts (moved originals, ghost double copies, enlargement grain).',
      'Use the platen: a lid-open black field, the mm edge scale, enlargement labels and copy counts.',
    ],
    dont: [
      'Add tape, sticky notes, highlighter, torn edges or rotation; that is the hand, and the hand belongs to Xerox Punk.',
      'Use greys, smooth gradients or soft shadows; a copy has toner or paper.',
      'Print a second paper colour or any colour fill, bar or chip.',
      'Set the headline as cut-out ransom letters; one heavy face, copied, is the identity.',
    ],
  },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    principles: [
      ['The machine, not the hand', 'Square copies; only the image distorts.'],
      ['Generation loss', 'Gen 1, 3, 7: thresholds harden, counters fill.'],
      ['Colour is the paper', 'One stock for the sheet; toner for everything else.'],
    ],
    do: [
      'Copy one heavy face until it rots.',
      'Reverse one band per view out of toner.',
      'Take colour from the paper stock.',
    ],
    dont: [
      'Add tape, notes or highlighter.',
      'Use greys or gradients.',
      'Rotate the copies.',
    ],
  },
});
})();
