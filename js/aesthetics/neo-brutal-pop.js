/* 03 Neo-Brutal Pop — chunky, playful, loud. References: Gumroad (huge black
   type, sticker objects, flat 100% colour fields), Figma Config sticker sheets,
   neobrutalism.dev as the baseline to beat. Near-square radii (6px controls,
   10px cards), a paper canvas, 2px ink outlines, hard offset shadows that lift
   and squish. Split hero: a left-set three-line headline with "alive" as a
   tilted sticker block, and a cluster of UI-object stickers (price tag, NEW
   starburst, checkbox, cursor) on the right. Section fields switch to 100%
   accent / primary. The deck's Material slide is a die-cut sticker sheet.
   Look lives in css/aesthetics/neo-brutal-pop.css. */
// Heaviest real weight (FONTS `weights`) of state[which], capped.
function npHeavy(which, cap) {
  const f = typeof state !== 'undefined' && state && state[which];
  const ws = String((f && f.weights) || '400').split(';').map(Number).filter(n => n > 0 && n <= cap);
  return ws.length ? Math.max(...ws) : 400;
}

// Points of a star polygon centred on (cx, cy): n tips, outer radius r1, inner r2.
function npStarPoints(cx, cy, r1, r2, n) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 ? r2 : r1;
    const an = (i * Math.PI) / n - Math.PI / 2;
    pts.push((cx + r * Math.cos(an)).toFixed(2) + ',' + (cy + r * Math.sin(an)).toFixed(2));
  }
  return pts.join(' ');
}

// Shared drawing bits for the sticker art (hero cluster, Material sheet, In product).
function npKit(t) {
  const ink = t.ink;
  const paper = typeof t.mix === 'function'
    ? (t.isDark ? t.mix(t.ink, t.canvas, 0.1) : t.mix('#ffffff', t.canvas, 0.9)) : t.canvas;
  const on = (k, fb) => t[k] || fb;
  const sh = 'translate(5 5)';
  const so = `stroke="${ink}" stroke-width="3" stroke-linejoin="round"`;
  const tag = '62,104 98,70 232,70 232,204 98,204 62,170';
  const star = npStarPoints(0, 0, 54, 40, 20);
  const tagSvg = `<svg viewBox="52 60 192 156" xmlns="http://www.w3.org/2000/svg"><polygon points="${tag}" fill="${ink}" transform="${sh}"/><polygon points="${tag}" fill="${t.primary}" ${so}/><circle cx="88" cy="137" r="10" fill="${paper}" ${so}/><text x="168" y="164" text-anchor="middle" class="nba-t" font-size="76" fill="${on('onPrimary', ink)}">$1</text></svg>`;
  const starSvg = (word = 'NEW') => `<svg viewBox="-60 -60 126 126" xmlns="http://www.w3.org/2000/svg"><polygon points="${star}" fill="${ink}" transform="${sh}"/><polygon points="${star}" fill="${t.accent}" ${so}/><text x="0" y="9" text-anchor="middle" class="nba-t" font-size="26" fill="${on('onAccent', ink)}">${word}</text></svg>`;
  return { ink, paper, on, sh, so, tag, star, tagSvg, starSvg };
}

registerAesthetic({
  key: 'neo-brutal-pop', order: 3,
  name: 'Neo-Brutal Pop',
  descriptor: 'Chunky · Playful · Loud',
  influences: 'Neo-brutalism / Memphis / Sticker culture',
  summary: 'Big outlines, bright stickers and buttons that squish when you press them.',
  motto: 'Loud, but friendly.',
  kicker: 'Stickers, stacked',
  mode: 'light',
  slideShape: 'geometric',
  labels: { material: 'Stickers & squish', states: ['Rest', 'Lift', 'Squish'], statesKind: 'button' },
  layout: { hero: 'split' },
  type: { ui: 'sans', label: 'sans', display: 1.0 },
  highlight: 'band',
  cardFill: '--ab-paper',

  roles: {
    ink: {
      use: 'Every outline, the hard offset shadows, headlines and body text',
      never: 'Large background fields in light mode',
    },
    primary: {
      use: 'The one chunky CTA per view, the selected segment, the price-tag sticker, the "on" toggle and the type section field',
      never: 'Card fills, body text, a second filled CTA',
    },
    secondary: {
      use: 'Solid tags and status chips, the checkbox sticker, progress stripes and the second data series',
      never: 'Card or panel fills (those are paper), the main CTA, body text',
      coverage: '≈12%',
    },
    accent: {
      use: 'The headline sticker word, the NEW starburst, one avatar and the In use section field',
      never: 'Buttons, body text, outlines',
    },
  },

  // Paper, not a pastel wash: colour arrives as 100% section fields instead.
  canvas(b) { return b.isDark ? b.mix(b.ink, b.canvas, 0.1) : b.mix('#ffffff', b.canvas, 0.85); },

  tokens(t) {
    // Chip fill (kicker, status pills, hover): secondary pushed into the canvas,
    // but never so strong that ink text drops under ~7:1. Cards, panels and rows
    // use --ab-paper instead (near-white, the neobrutalism.dev composition).
    const fill = k => t.mix(t.secondary, t.canvas, k);
    let a = 0.5;
    while (a > 0.1 && t.contrast(t.ink, fill(a)) < 7) a -= 0.05;
    // The closing slide's starburst sticker (a data-URI image on a pseudo-element).
    const uri = svg => "url('data:image/svg+xml," + encodeURIComponent(svg).replace(/'/g, '%27') + "')";
    const starSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 108 108"><polygon points="${npStarPoints(50, 50, 46, 33, 24)}" fill="${t.ink}" transform="translate(3.2 3.2)"/><polygon points="${npStarPoints(50, 50, 46, 33, 24)}" fill="${t.accent}" stroke="${t.ink}" stroke-width="2" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`;
    return {
      '--ab-type-pick-w': 400,
      '--ab-card-fill': fill(a),
      '--ab-paper': t.isDark ? t.mix(t.ink, t.canvas, 0.1) : t.mix('#ffffff', t.canvas, 0.9),
      '--np-star-img': uri(starSvg),
      // real weights only (font-synthesis is off): the heading face's heaviest up to 800, the UI face's
      '--np-hw': npHeavy('headingFont', 800),
      '--np-uw': npHeavy('bodyFont', 800),
    };
  },

  // The hero art: UI-object stickers (price tag "$1", NEW starburst, checkbox, cursor),
  // each 2px-outlined with a hard offset shadow; plain SVG, self-contained (blend donor).
  art(ctx) {
    const { ink, paper, on, sh, so, tag, star } = npKit(ctx.t);
    const t = ctx.t;
    const cursor = '0,0 0,58 14,45 25,68 36,63 25,40 43,40';
    const cluster = `<svg class="nba-cluster" viewBox="0 0 320 300" xmlns="http://www.w3.org/2000/svg">
      <path d="M86 137 C52 128 30 84 46 30" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>
      <g transform="rotate(-9 147 137)">
        <polygon points="${tag}" fill="${ink}" transform="${sh}"/>
        <polygon points="${tag}" fill="${t.primary}" ${so}/>
        <circle cx="88" cy="137" r="10" fill="${paper}" ${so}/>
        <text x="168" y="164" text-anchor="middle" class="nba-t" font-size="76" fill="${on('onPrimary', ink)}">$1</text>
      </g>
      <g transform="translate(252 72) rotate(12)">
        <polygon points="${star}" fill="${ink}" transform="${sh}"/>
        <polygon points="${star}" fill="${t.accent}" ${so}/>
        <text x="0" y="9" text-anchor="middle" class="nba-t" font-size="26" fill="${on('onAccent', ink)}">NEW</text>
      </g>
      <g transform="rotate(8 240 238)">
        <rect x="205" y="203" width="70" height="70" rx="8" fill="${ink}" transform="${sh}"/>
        <rect x="205" y="203" width="70" height="70" rx="8" fill="${t.secondary}" ${so}/>
        <path d="M222 238 L236 252 L260 222" fill="none" stroke="${on('onSecondary', ink)}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      <g transform="translate(150 218) rotate(-14)">
        <polygon points="${cursor}" fill="${ink}" transform="translate(4 4)"/>
        <polygon points="${cursor}" fill="${paper}" ${so}/>
      </g>
    </svg>`;
    return `<div class="nba">${cluster}</div>`;
  },

  materials: [
    { name: 'Sticker card', css: 'background: {paper}; /* near-white paper, never the secondary */ border: 2px solid {ink}; border-radius: 10px; box-shadow: 4px 4px 0 {ink};' },
    { name: 'Chunky button', css: 'background: {primary}; color: {onPrimary}; border: 2px solid {ink}; border-radius: 6px; box-shadow: 4px 4px 0 {ink}; font-weight: 700; /* lift: translate(-2px,-2px) + 6px 6px 0; squish: translate(4px,4px), no shadow */' },
    { name: 'Paper button', css: 'background: {paper}; color: {ink}; border: 2px solid {ink}; border-radius: 6px; box-shadow: 4px 4px 0 {ink}; font-weight: 700; /* secondary button, e.g. the hero CTA */' },
    { name: 'Squish state', css: 'transform: translate(4px, 4px); box-shadow: 0 0 0 {ink};' },
    { name: 'Segment track', css: 'background: {paper}; border: 2px solid {ink}; border-radius: 10px; padding: 4px; /* selected segment: {primary} fill, 2px {ink} outline, radius 6 */' },
    { name: 'Highlight fill', css: 'background: {accent}; color: {onAccent}; border: 2px solid {ink}; border-radius: .12em; padding: 0 .18em; box-shadow: 4px 4px 0 {ink}; /* a color fill with a 2px ink outline behind one headline word */' },
    { name: 'Section field', css: 'background: {accent}; color: {onAccent}; border: 2px solid {ink}; border-radius: 10px; box-shadow: 4px 4px 0 {ink}; /* a whole section at 100% accent (or {primary} with {onPrimary}); the cards inside stay {paper} */' },
    { name: 'UI-object sticker', css: 'a price tag, cursor, checkbox or starburst: flat {primary} / {accent} / {secondary} fill, 2px {ink} outline, 4-5px hard {ink} offset shadow, rotated 6-12deg, placed in the gutter, never over text' },
    { name: 'Outlined toggle', css: 'track: 64x34, radius 8, background {paper}, border 2px solid {ink}; knob: 23px, radius 5, of {ink}; on = track {primary}.' },
  ],

  rules: {
    do: [
      'Outline every object in ink at 2px and give it a hard 4px offset shadow with no blur; keep corners near-square (6px controls, 10px cards).',
      'Make buttons physical: lift 2px up-left on hover, squish 4px down-right on press.',
      'Keep cards, panels and list rows near-white paper on a paper canvas; switch whole sections to 100% accent or primary fields.',
      'Set the headline left, mixed case, weight 800, at poster scale against 16px body; one word becomes a tilted sticker block.',
      'Make stickers objects: price tags, cursors, checkboxes and starbursts, each outlined in ink with a hard shadow, kept clear of text.',
    ],
    dont: [
      'Blur a shadow or add a gradient; stickers are flat color with a hard edge.',
      'Wash the page in a pastel tint; color comes as full-strength fields.',
      'Use the accent as text color or as a button fill.',
      'Round corners past 10px or rotate controls; only decorative stickers tilt.',
      'Drop the ink outline from a filled shape, or mix thin and thick outlines.',
    ],
  },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    // Material slide: a die-cut sticker sheet (3 x 2) on a paper rectangle.
    materialArt(ctx) {
      const { tagSvg, starSvg } = npKit(ctx.t);
      const cell = (cls, obj, label) => `<div class="nba-cell"><div class="nba-obj ${cls}">${obj}</div><span class="nba-lab">${label}</span></div>`;
      return `<div class="nba-sheet">
        ${cell('nba-o-card', '<i></i><i></i><i></i>', 'Sticker card')}
        ${cell('nba-o-btn', '<b>Go<em>→</em></b>', 'Chunky button')}
        ${cell('nba-o-paper', '<b>Go<em>→</em></b>', 'Paper button')}
        ${cell('nba-o-squish', '<b>Go<em>→</em></b>', 'Squish state')}
        ${cell('nba-o-star', starSvg(), 'Starburst')}
        ${cell('nba-o-tag', tagSvg, 'Price tag')}
      </div>`;
    },
    // In product: a Gumroad-style product page. A cover tile in a full accent field
    // with stickers, then the title, a price-tag sticker, the chunky buy button.
    product(ctx) {
      const e = ctx.e;
      const { tagSvg, starSvg } = npKit(ctx.t);
      const name = e(ctx.brandName || 'Studio');
      return `<div class="npp">
        <div class="npp-cover"><span class="npp-init">${e(ctx.initial)}</span><span class="npp-star">${starSvg('NEW')}</span><span class="npp-tag">${tagSvg}</span></div>
        <div class="npp-info">
          <p class="npp-by"><span class="npp-av">${e(ctx.initial)}</span>${name}</p>
          <h3 class="npp-title ab-headline">The starter kit</h3>
          <p class="npp-desc">Type, colour and material for ${name}, in one download. Loud, but friendly.</p>
          <p class="npp-meta"><span class="npp-price">$1+</span><span class="npp-rate">★★★★★ 72 ratings</span></p>
          <span class="ab-cta npp-buy"><span class="ab-cta-label">I want this!</span><span class="ab-cta-arrow" aria-hidden="true"></span></span>
        </div>
      </div>`;
    },
    principles: [
      ['Outline everything in ink', '2px outlines with a hard 4px shadow and no blur.'],
      ['Buttons you can feel', 'They lift on hover and squish when pressed.'],
      ['Stickers are objects', 'Price tags, cursors and starbursts, never on top of words.'],
    ],
    do: [
      'Outline every object in 2px ink.',
      'Lift on hover, squish on press.',
      'Switch whole sections to full-strength color.',
    ],
    dont: [
      'Blur a shadow or add a gradient.',
      'Use accent as text or a button fill.',
      'Round corners past 10px.',
    ],
  },
});
