/* 48 Live Tile — typographic panorama, flat tiles, pivot headings. Reference: the flat tile-and-
   panorama phone interfaces of the early 2010s. Our spin: a typographic panorama in the brand's own
   colours, not a copy of any product.

   Mechanism. The ground is true black (dark, the recommended mode) or white (light); nothing else
   is a ground. Hierarchy is made of type: a huge light lowercase title that runs off the right edge
   (clipped by the board, never a horizontal page scroll), pivot headings 28-34px light where the
   active one is ink and the others sit in the muted token, 13px lowercase labels. Colour is carried
   by flat rectangular TILES on a 4-column grid with 8px gaps: primary, secondary, ONE accent tile at
   most, and an ink-tinted neutral. A tile's label sits bottom-left (13px), a count or glyph top-right.
   Every tile colour is pushed until it holds 3:1 on the ground (the primary through printPrimary;
   secondary, accent and the neutral through tokens()), and its label is the on-colour (white or
   near-black, whichever reads, 4.5:1 or more).
   Zero corner radius and zero shadow everywhere (a radio stays round so it reads as a radio).
   Buttons are rectangles (primary: solid printed primary; secondary: a 2px ink edge on the ground),
   fields a 2px-edged rectangle that fills with the ink on focus (dark text on it).
   Board and website only: the tile wall art with the brand initial on one tile; "live" tiles flip
   slowly to a second face and a row of five small squares slides as the loading indicator
   (prefers-reduced-motion: both stop). App screens (.sb-kit, .sb-ab) carry no art and no ambient
   motion: only component state changes. */
(function () {
const LT_KEY = 'live-tile';   // abCopy key for the plain functions below (js/aesthetics/registry.js)

const ltCR = (a, b) => (typeof contrastRatio === 'function' ? contrastRatio(a, b) : 21);
const ltMix = (a, b, k) => (typeof slMix === 'function' ? slMix(a, b, k) : a);

// A colour pushed toward black or white (whichever is further from `ground`) until it holds `floor`:1 on it.
function ltHold(hex, ground, floor) {
  if (ltCR(hex, ground) >= floor) return hex;
  const to = ltCR(ground, '#000000') > ltCR(ground, '#ffffff') ? '#000000' : '#ffffff';
  let c = hex;
  for (let k = 0.04; k <= 1.0001 && ltCR(c, ground) < floor; k += 0.04) c = ltMix(to, hex, k);
  return c;
}

// The best label colour (white or near-black, the pair pickReadableText chooses from) on a fill.
const ltBest = bg => Math.max(ltCR('#ffffff', bg), ltCR('#141414', bg));

// A tile colour: 3:1 on the ground AND a label on it at 4.5:1. A mid-tone that fails the label is nudged
// the shortest way toward black or white that keeps both.
function ltTile(hex, ground) {
  const c = ltHold(hex, ground, 3.1);
  if (ltBest(c) >= 4.5) return c;
  for (let k = 0.03; k <= 0.7; k += 0.03) {
    for (const to of ['#000000', '#ffffff']) {
      const n = ltMix(to, c, k);
      if (ltCR(n, ground) >= 3.1 && ltBest(n) >= 4.5) return n;
    }
  }
  return c;
}

// The ink-tinted neutral tile: ink moved toward the ground until it holds 3:1 on it (and a label on it 4.5:1).
function ltNeutral(ink, canvas) {
  let c = ltMix(ink, canvas, 0.3);
  for (let k = 0.3; k <= 1.0001 && ltCR(c, canvas) < 3.1; k += 0.04) c = ltMix(ink, canvas, k);
  return c;
}

const ltOn = bg => (typeof pickReadableText === 'function' ? pickReadableText(bg) : (ltCR('#ffffff', bg) >= ltCR('#141414', bg) ? '#ffffff' : '#141414'));

// Tile faces: [class, role, label key, count, size class, back role, back key, flip delay]
// The brand initial sits on the first tile; only one tile is the accent.
const LT_TILES = [
  ['a', 'pri', 'tile0', '12', 'w2 h2', 'neu', 'back0', '-2'],
  ['b', 'sec', 'tile1', '4',  'w1 h1', 'neu', 'back1', '-9'],
  ['c', 'neu', 'tile2', '128', 'w1 h1', null, null, 0],
  ['d', 'neu', 'tile3', '2',  'w2 h1', 'pri', 'back3', '-14'],
  ['e', 'sec', 'tile4', '7',  'w2 h1', 'neu', 'back4', '-6'],
  ['f', 'acc', 'tile5', '24', 'w1 h1', null, null, 0],
  ['g', 'neu', 'tile6', '+',  'w1 h1', null, null, 0],
];

registerAesthetic({
  key: 'live-tile', order: 48,
  name: 'Live Tile',
  descriptor: 'Flat · Typographic · Panoramic',
  influences: 'Early-2010s tile phone UI / Typographic panoramas / Pivot headings',
  summary: 'A black panorama of huge light lowercase titles and flat brand-colour tiles, with pivot headings in place of tabs.',
  motto: 'Content over chrome.',   // = copy.motto.text
  kicker: 'start',                 // = copy.kicker.text
  mode: 'dark',
  slideShape: 'minimal',
  labels: { material: 'Tiles & type', states: ['rest', 'hover', 'pressed'], statesKind: 'button' },
  // Editable specimen copy (Brand > Advanced > Specimen copy). Lowercase, calm, plain.
  copy: {
    motto: { label: 'Motto', text: 'Content over chrome.' },
    kicker: { label: 'Kicker above the headline', text: 'start' },
    state0: { label: 'State 1 name', text: 'rest' },
    state1: { label: 'State 2 name', text: 'hover' },
    state2: { label: 'State 3 name', text: 'pressed' },
    tile0: { label: 'Tile 1 label (large, primary)', text: 'messages' },
    tile1: { label: 'Tile 2 label (secondary)', text: 'people' },
    tile2: { label: 'Tile 3 label (neutral)', text: 'photos' },
    tile3: { label: 'Tile 4 label (wide, neutral)', text: 'next up' },
    tile4: { label: 'Tile 5 label (wide, secondary)', text: 'notes' },
    tile5: { label: 'Tile 6 label (the accent tile)', text: 'music' },
    tile6: { label: 'Tile 7 label (neutral)', text: 'more' },
    back0: { label: 'Tile 1, second face', text: 'three unread today' },
    back1: { label: 'Tile 2, second face', text: 'two new this week' },
    back3: { label: 'Tile 4, second face', text: 'standup at nine' },
    back4: { label: 'Tile 5, second face', text: 'four edited today' },
    loading: { label: 'Loading label', text: 'loading' },
    wallCap: { label: 'Tile wall caption', text: 'one accent tile per view' },
  },
  layout: { hero: 'split', palette: 'swatches', sections: 'two-col' },
  type: { ui: 'body', label: 'body', display: 1 },
  highlight: 'custom',
  highlightNote: 'The title stays in the ink: the accent colour lives on the single accent tile, never on a headline word.',
  cardFill: '--ab-canvas',

  roles: {
    canvas: {
      use: 'The ground: true black in dark mode, white in light mode. Tiles and type sit straight on it; there are no cards or panels behind them',
      never: 'A tint, a gradient, a texture or a picture',
      coverage: '45–60%',
    },
    ink: {
      use: 'The panorama title, pivot headings, body text, the 2px edge of secondary buttons and fields, and the fill of a focused field',
      never: 'A tile fill, or tinted down for body text',
      coverage: '20–25%',
    },
    primary: {
      use: 'The main tile, the one solid button and a selected check or switch. Printed until it holds 3:1 on the ground',
      never: 'Body text smaller than 16px, or two main buttons on a screen',
      coverage: '≈10–15%',
    },
    secondary: {
      use: 'Supporting tiles only: the second and third tile colour, a second chart series',
      never: 'The main action, body text, a ground',
      coverage: '≈8–10%',
    },
    accent: {
      use: 'One tile per view: the single loud square. It is never text and never a button',
      never: 'More than one tile, headline words, a button, a divider',
      coverage: '≤3%',
    },
  },

  // The ground is fixed: true black or white. Pure ground (state.pureBg) changes nothing here.
  canvas(b) { return b.isDark ? '#000000' : '#ffffff'; },

  // The primary is printed as the nearest colour that holds 3:1 on the ground and a 4.5:1 label, so its tile and its
  // button never vanish into black or white; a primary that already does is left alone.
  printPrimary(t) { return ltTile(t.primary, t.canvas); },

  tokens(t, st) {
    const pri = t.printPrimary;
    const sec = ltTile(t.secondary, t.canvas);
    const acc = ltTile(t.accent, t.canvas);
    const neu = ltNeutral(t.ink, t.canvas);
    // Hover: a touch of ink into the primary, kept only while its label still reads.
    let hover = ltMix(t.ink, pri, 0.14);
    if (ltCR(hover, ltOn(hover)) < 4.5) hover = pri;
    // Unfilled track of a slider / progress bar: the ink eased toward the ground, still 3:1.
    let track = ltMix(t.ink, t.canvas, 0.4);
    for (let k = 0.4; k <= 1.001 && ltCR(track, t.canvas) < 3.1; k += 0.05) track = ltMix(t.ink, t.canvas, k);
    const hf = st && st.headingFont;
    const lightW = typeof abWeightNear === 'function' ? abWeightNear(hf, 300) : 400;
    return {
      '--ab-lt-pri': pri, '--ab-lt-on-pri': ltOn(pri),
      '--ab-lt-sec': sec, '--ab-lt-on-sec': ltOn(sec),
      '--ab-lt-acc': acc, '--ab-lt-on-acc': ltOn(acc),
      '--ab-lt-neu': neu, '--ab-lt-on-neu': ltOn(neu),
      '--ab-lt-hover': hover,
      '--ab-lt-track': track,
      '--ab-lt-edge': t.mix(t.ink, t.canvas, 0.7),
      '--ab-lt-lw': lightW,
      '--ab-type-pick-w': lightW,
      '--ab-tr': 1,
    };
  },

  // The panorama title: lowercase, one line, running off the right edge (the board clips it).
  // The highlight word stays in the ink.
  headline(ctx, text) {
    const e = escapeHtml;
    const words = String(text || '').trim().split(/\s+/).filter(Boolean);
    if (!words.length) return '';
    const last = words.pop();
    return `<span class="lt-h">${words.length ? e(words.join(' ')) + ' ' : ''}<span class="ab-hl">${e(last)}</span></span>`;
  },

  // Hero art (board, deck cover): the tile wall. Seven flat tiles on a 4-column grid, 8px gaps; the brand
  // initial on the large primary tile; four tiles are "live" and flip slowly to a second face; a row of
  // five small squares slides under it as the loading indicator. Motion is CSS-only and switches off
  // under prefers-reduced-motion and in the deck.
  art(ctx) {
    const e = escapeHtml;
    const faceCls = { pri: 'is-pri', sec: 'is-sec', neu: 'is-neu', acc: 'is-acc' };
    const tiles = LT_TILES.map(([id, role, key, count, size, backRole, backKey, delay], i) => {
      const initial = id === 'a' ? `<b class="ltl-i" aria-hidden="true">${e(ctx.initial)}</b>` : '';
      const front = `<div class="ltl-f ltl-front ${faceCls[role]}"><span class="ltl-c">${e(count)}</span>${initial}<span class="ltl-l">${abCopy(this, key)}</span></div>`;
      const back = backRole
        ? `<div class="ltl-f ltl-back ${faceCls[backRole]}"><span class="ltl-c">${e(count)}</span><span class="ltl-l">${abCopy(this, backKey)}</span></div>` : '';
      return `<div class="ltl-t ${size.split(' ').map(s => 'ltl-' + s).join(' ')}${backRole ? ' is-live' : ''}" style="--ltl-d:${delay}s">`
        + `<div class="ltl-in">${front}${back}</div></div>`;
    }).join('');
    const dots = [0, 1, 2, 3, 4].map(n => `<i style="--n:${n}"></i>`).join('');
    return `<div class="ltl">
      <div class="ltl-wall">${tiles}</div>
      <div class="ltl-load"><span class="ltl-load-l">${abCopy(this, 'loading')}</span><span class="ltl-dots" aria-hidden="true">${dots}</span></div>
    </div>`;
  },

  materials: [
    { name: 'Ground', css: 'background: {canvas}; /* true black (dark) or white (light); the only ground; no cards, panels, gradients or textures behind tiles and type */' },
    { name: 'Tile (primary)', css: 'background: {primary}; color: {onPrimary}; border-radius: 0; /* flat, no shadow; 8px gap on a 4-column grid; label 13px bottom-left, a count or glyph top-right */' },
    { name: 'Tile (secondary)', css: 'background: {ltSec}; color: {ltOnSec}; border-radius: 0; /* supporting tiles; the secondary pushed until it holds 3:1 on the ground */' },
    { name: 'Tile (accent)', css: 'background: {ltAcc}; color: {ltOnAcc}; border-radius: 0; /* ONE per view, never a button or text */' },
    { name: 'Tile (neutral)', css: 'background: {ltNeu}; color: {ltOnNeu}; border-radius: 0; /* the ink eased toward the ground until it holds 3:1 */' },
    { name: 'Primary button', css: 'background: {primary}; color: {onPrimary}; border-radius: 0; min-height: 52px; /* lowercase label; pressed scales to 0.97 */' },
    { name: 'Secondary button', css: 'background: transparent; color: {ink}; border: 2px solid {ink}; border-radius: 0; /* lowercase label; pressed scales to 0.97 */' },
    { name: 'Field', css: 'background: transparent; color: {ink}; border: 2px solid {ltEdge}; border-radius: 0; /* focus: background {ink}, text {canvas} */' },
    { name: 'Pivot heading', css: 'font-size: 28px; font-weight: 300; text-transform: lowercase; color: {muted}; /* active: {ink}; inactive: the muted token */' },
  ],

  rules: {
    do: [
      'Let type carry the hierarchy: a huge light lowercase title, pivot headings at 28-34px, 13px lowercase labels.',
      'Put colour on flat rectangular tiles on a 4-column grid with 8px gaps; label bottom-left, count or glyph top-right.',
      'Run the title off the right edge so the next page is felt, and keep the page itself from scrolling sideways.',
      'Use one accent tile per view; every other tile is the primary, the secondary or the ink-tinted neutral.',
      'Fill a focused field with the ink and set its text in the ground colour.',
    ],
    dont: [
      'Add cards, panels, borders or shadows around content; content over chrome.',
      'Round a corner (a radio stays round so it reads as a radio) or add a shadow, gradient or texture.',
      'Use more than one accent tile, or set text in the accent colour.',
      'Put the tile wall, flipping tiles or the sliding dots in the app; there tiles are plain components and state changes are the only motion.',
    ],
  },

  deck: {
    principles: [
      ['Type is the hierarchy', 'A huge light lowercase title, pivot headings, small labels.'],
      ['Flat tiles', 'Brand colours on rectangles in a 4-column grid, 8px apart.'],
      ['Content over chrome', 'No cards, no shadows, no rounded corners.'],
    ],
    do: [
      'Let type make the hierarchy.',
      'Keep tiles flat, on a 4-column grid.',
      'Use one accent tile per view.',
    ],
    dont: [
      'Add cards, borders or shadows.',
      'Round any corner.',
      'Colour text with the accent.',
    ],
  },
});
})();
