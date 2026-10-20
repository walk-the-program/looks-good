/* 36 Dystopian Luxury — severe, clinical, exclusive. References: the 2017 Balenciaga web
   redesign (Bureau Borsche: a tiny logo, no imagery, small Arial, black and white, one
   neon-green button, a grey footer), Maison Margiela's blank white label held by four
   stitches and its circled numerals 0-23, museum accession numbers (year.sequence.part),
   Lumon's benevolent-institution register. Severity by removal and labelling: near-pure
   white and ink, a tiny wordmark, vast empty space, one enormous word cropped vertically under a strip,
   hairlines, catalogue labels and a single mark in the client primary under 2% of the area.
   Metal only on hardware (not drawn here). No gothic horror, no gradients, no glow,
   no real brand names. Nothing sits on or beside the brand name as a classification: no
   "classified", "restricted", division, or archive-reference text. The labels catalogue. */

// The single disruptive mark is always the client's primary (a dull primary is still the
// brand; there is no fixed fallback colour). Shared by tokens() and art().
function dlMark(t) {
  return t.primary;
}

// The giant word: first word of the brand, uppercase, set so its full width is 102% of the
// BOARD (the plate runs edge to edge; the right edge crops at most half a letter), then
// cropped VERTICALLY: the top 88% of the cap height shows and the rest hides under the
// plain ink strip. A deeper crop turns E into F and L into I (a name like TESSEL read
// "TESSFI"); at 88% every bottom arm and foot keeps a visible stub, so any brand name still spells itself. Returns the font size in viewBox units, the target width, the
// lengthAdjust mode and the strip's y (the plate's height follows the word).
// share of the cap height that stays visible above the crop strip (see dlWordFit)
const DL_SHOW = 0.88;
function dlWordFit(state, word, maxFs) {
  const W = 200 * 1.02;
  let natural = 0;
  try {
    const cv = document.createElement('canvas').getContext('2d');
    cv.font = `800 100px ${(state && state.headingFont && state.headingFont.css) || 'sans-serif'}`;
    natural = cv.measureText(word).width;
  } catch (err) { natural = 0; }
  if (!(natural > 0)) natural = 64 * word.length;
  const fsFull = 100 * W / natural;
  let fs = fsFull;
  let mode = 'spacingAndGlyphs';
  const cap = maxFs || 64;
  // a short word ("OX"): capped and set at its natural width from the left edge; tracking it out
  // to the far edge left two letters at the two edges with a hole between
  if (fsFull > cap) { fs = cap; mode = 'none'; }
  else if (fsFull < 14) { fs = 14; }
  const strip = 1.5 + DL_SHOW * 0.72 * fs;             // 88% of the cap height shows above the strip
  return { fs, W, mode, strip };
}

// Split a long word in two near its middle: a consonant-consonant boundary that is not a digraph
// ("STRAW" / "BERRY") when one sits within a quarter of the middle, else the vowel-consonant
// boundary nearest the middle ("MARI" / "GOLD"), else the middle itself. A word shorter than
// DL_SPLIT_MIN letters stays whole on one line, scaled to fit: "SIG / NL" cost more than
// the smaller type ever did, and up to nine letters still read at a phone's width.
const DL_SPLIT_MIN = 10;
function dlSplit(word) {
  const w = String(word);
  if (w.length < DL_SPLIT_MIN) return [w];
  const V = /[AEIOUY]/;
  const DI = ['CH', 'SH', 'TH', 'PH', 'WH', 'CK', 'NG', 'GH', 'KN', 'QU', 'DG'];
  const mid = w.length / 2;
  const near = (test) => {
    let best = -1;
    for (let i = 2; i <= w.length - 2; i++) {
      if (test(i) && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
    }
    return best >= 0 && Math.abs(best - mid) <= w.length / 4 ? best : -1;
  };
  let at = near(i => /[A-Z]/.test(w[i - 1]) && /[A-Z]/.test(w[i]) && !V.test(w[i - 1]) && !V.test(w[i]) && !DI.includes(w[i - 1] + w[i]));
  if (at < 0) at = near(i => V.test(w[i - 1]) && !V.test(w[i]));
  if (at < 0) at = Math.round(mid);
  return [w.slice(0, at), w.slice(at)];
}

// Copy is read through abCopy (js/aesthetics/registry.js); plain functions pass the key.
const DL_KEY = 'dystopian-luxury';

// The blank label held by four X stitches: accession number, circled numeral, a sub-line.
function dlTag(cls) {
  return `<div class="dl-tag${cls ? ' ' + cls : ''}"><i class="dl-st"></i><i class="dl-st"></i><i class="dl-st"></i><i class="dl-st"></i>
        <span class="dl-tag-no">${abCopy(DL_KEY, 'tagNo')}</span><span class="dl-tag-c">${abCopy(DL_KEY, 'tagMark')}</span>
        <span class="dl-tag-sub">${abCopy(DL_KEY, 'tagSub')}</span>
      </div>`;
}

// One cropped plate: the word clipped under a black strip, viewBox 200 wide, height from the fit.
function dlPlate(state, word, ink, label, num, maxFs) {
  const fit = dlWordFit(state, word, maxFs);
  const strip = fit.strip;
  const h = strip + 8.5;
  const baseline = (strip + (1 - DL_SHOW) * 0.72 * fit.fs).toFixed(2);
  const lab = label ? `<text class="dl-strip" x="5" y="${(strip + 5.6).toFixed(2)}" fill="#F7F7F5">${label}</text>` : '';
  const no = num ? `<text class="dl-strip" x="195" y="${(strip + 5.6).toFixed(2)}" text-anchor="end" fill="#F7F7F5">${num}</text>` : '';
  return `<svg class="dl-plate-svg" viewBox="0 0 200 ${h.toFixed(2)}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="presentation">
      <svg x="0" y="0" width="200" height="${strip.toFixed(2)}" viewBox="0 0 200 ${strip.toFixed(2)}" overflow="hidden"><text class="dl-word" x="0" y="${baseline}" font-size="${fit.fs.toFixed(2)}"${fit.mode === 'none' ? '' : ` textLength="${fit.W}" lengthAdjust="${fit.mode}"`} fill="${ink}">${word}</text></svg>
      <rect x="0" y="${strip.toFixed(2)}" width="200" height="8.5" fill="#0A0A0A"/>${lab}${no}
    </svg>`;
}

registerAesthetic({
  key: 'dystopian-luxury', order: 36,
  name: 'Dystopian Luxury',
  descriptor: 'Severe · Clinical · Exclusive',
  influences: 'Balenciaga web / Maison Margiela labels / Museum accession',
  summary: 'Severity through removal: a tiny logo, vast white space, enormous cropped type and blank labels.',
  motto: 'Access is a privilege.',   // = copy.motto.text (kept for readers that predate copy)
  signature: 'the enormous cropped brand word under a black strip',
  ctaFill: 'ink',
  mode: 'light',
  slideShape: 'minimal',
  labels: { material: 'Accession', states: ['Catalogued', 'Private', 'Reserved'], statesKind: 'button' },
  // Editable specimen copy (Brand > Advanced > Specimen copy); `warm` is the softer default for Warmer / Own words.
  copy: {
    motto: { label: 'Motto', text: 'Access is a privilege.', warm: 'Made with care, for anyone.' },
    state0: { label: 'State 1 name', text: 'Catalogued', warm: 'Listed' },
    state1: { label: 'State 2 name', text: 'Private', warm: 'Shared' },
    state2: { label: 'State 3 name', text: 'Reserved', warm: 'Open' },
    tagNo: { label: 'Label number', text: '2026.114.3' },
    tagMark: { label: 'Label circled numeral', text: '7' },
    tagSub: { label: 'Label sub-line', text: 'Viewed by / no one', warm: 'Made by / a few people' },
    hairlineCap: { label: 'Hairline caption', text: 'Hairline · 1px' },
    actionCap: { label: 'Main action caption', text: 'Main action · 6px mark' },
    cta: { label: 'Main action label', text: 'Request a viewing', warm: 'Take a look' },
    productLine: { label: 'Product description', text: 'Wool, unlined. One of one. Made to order.', warm: 'Soft wool, unlined. Made to order, just for you.' },
    price: { label: 'Price line', text: 'Price on request', warm: 'Fairly priced' },
  },
  layout: { hero: 'centered', palette: 'swatches', sections: 'asym' },
  type: { ui: 'sans', label: 'mono', display: 1 },
  highlight: 'custom',
  highlightNote: 'No highlight at all: the last word stays in ink, upright, undecorated, like the rest of the 15px caption headline. The board\'s only display type is the cropped brand word.',
  cardFill: '--canvas',

  roles: {
    canvas: {
      use: 'Surgical white (the light colour pushed to near-pure neutral; dark mode a near-black); the vast empty field. Never a tinted pastel',
      never: 'Text, a tint, a gradient, or a concrete or paper texture',
      coverage: '≈90–92%',
    },
    ink: {
      use: 'Ink black: all type, the 1px rules at 12%, the crop strip, the giant cropped word, the inverted selected cell and the one action',
      never: 'Large flat fields other than the single crop strip, or a soft grey substitute for hairlines',
      coverage: '≈6–7%',
    },
    primary: {
      use: 'One 6px square per view, set before the label of the one action (an ink block). It is always the client primary, even a dull one; there is no red fallback',
      never: 'A button fill, body text, borders, backgrounds, underlines, a second mark, or more than one mark per view',
      coverage: '≤0.5%',
    },
    secondary: {
      use: 'Palette only: a 24px reference square. Not used on the page',
      never: 'The main action, text, large fields, or hairlines',
      coverage: '≤1%',
    },
    accent: {
      use: 'Palette only: a 24px reference square. Not used on the page',
      never: 'Buttons, headlines, fills, underlines, dots',
      coverage: '≤0.5%',
    },
  },

  // Near-pure neutrals: severity comes from near-white and near-black, never a tint.
  canvas(b) {
    const h = b.hexToHsl(b.canvas);
    return b.isDark ? b.hslToHex(h.h, Math.min(h.s, 4), Math.min(h.l, 5)) : b.hslToHex(h.h, Math.min(h.s, 3), Math.max(h.l, 97));
  },

  tokens(t) {
    const d = t.isDark;
    const mark = dlMark(t);
    const ink = d ? t.mix('#F7F7F5', t.ink, 0.7) : t.mix('#0A0A0A', t.ink, 0.75);
    return {
      '--ab-dl-ink': ink,
      '--ab-dl-mark': mark,
      '--ab-dl-grey': d ? t.mix('#ffffff', t.canvas, 0.08) : t.mix('#000000', t.canvas, 0.06),
      '--ab-dl-hair': t.alpha(ink, 0.16),
      '--ab-type-pick-w': '400',
    };
  },

  // "Accession": one enormous word in ink, fitted to 102% of the board's width and cropped
  // vertically (top 88% visible) above a plain ink strip with no text; below it, at the right,
  // the only object: a blank white label held by four X stitches (no barcode, no dot).
  // Narrow boards show the word split at its middle syllable on two cropped plates instead
  // (CSS swaps .dl-wide / .dl-narrow) and the label is hidden. No classification or archive
  // text sits on or beside the word.
  art(ctx) {
    const t = ctx.t;
    const e = escapeHtml;
    const raw = String(ctx.brandName || 'Archive').trim().split(/\s+/)[0].toUpperCase() || 'ARCHIVE';
    const word = e(raw);
    const ink = t.isDark ? t.mix('#F7F7F5', t.ink, 0.7) : t.mix('#0A0A0A', t.ink, 0.75);
    const parts = dlSplit(raw);
    const narrow = parts.map(p => dlPlate(ctx.state, e(p), ink, '', '', 100)).join('');
    return `<div class="dl-art">
      <div class="dl-plate dl-wide">${dlPlate(ctx.state, word, ink, '', '', 64)}</div>
      <div class="dl-plate dl-narrow">${narrow}</div>
      ${dlTag('')}
    </div>`;
  },

  materials: [
    { name: 'Hairline', css: 'border-top: 1px solid {dlInk}; /* the only rule: 1px ink, 0 radius; double rules carry registration ticks; no card chrome, no shadows */' },
    { name: 'Blank label (accession)', css: 'background: {canvas}; color: {dlInk}; border: 1px solid {dlInk}; font: 400 10px "Courier Prime", Courier, monospace; letter-spacing: .04em; /* the only object: a blank white label held by four X stitches; accession number year.sequence.part (2026.114.3) and a circled numeral; no barcode */' },
    { name: 'Crop strip', css: 'background: {dlInk}; /* a plain ink bar with no text or label: it crops the giant word under it; the only large flat ink field */' },
    { name: 'Main action (a mark, not a bar)', css: 'display: inline-flex; width: auto; padding: 10px 14px; background: {dlInk}; color: {canvas}; border-radius: 0; font: 400 12px Arial-class sans; /* a 6px {dlMark} square before the label: the one primary mark per view */' },
    { name: 'Selected cell', css: 'background: {dlInk}; color: {canvas}; border: 1px solid {dlInk}; /* hairline-boxed cells; the selected one is inverted */' },
    { name: 'Footer block', css: 'background: {dlGrey}; color: {muted}; /* a flat grey block with legal labels, an address and a catalogue number */' },
  ],

  rules: {
    do: [
      'Remove first: a tiny wordmark, vast empty space and at most three visible elements per zone.',
      'Crop display type hard under a strip so about 88 percent of its height shows (never deeper: E turns into F and L into I), and keep the labels small and exact.',
      'One gesture: the brand word, cropped, edge to edge. Everything else is a 15px caption or smaller.',
      'Number items, not sections: accession year.sequence.part (2026.114.3) on one blank label; set it in a default typewriter face.',
      'Keep the neutrals near-pure and show the primary once per view, as a 6px square on the one action.',
    ],
    dont: [
      'Use gradients, glows, glass, soft shadows or rounded corners; hard cuts and hairlines only.',
      'Spread the primary: no colour stripe, no underline, no second mark. No barcodes, crosshairs or ruled grid furniture on the page either.',
      'Add gothic horror tropes (chains, crosses, skulls, gore), concrete textures or warm literary serif layouts.',
      'Put "classified", "restricted", division numbers, "not for release" or archive references on or beside the product or brand name, its wordmark or its header.',
      'Set tiny type below 4.5:1 contrast or leave the board with no readable controls; severity is never illegibility.',
    ],
  },

  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    // the cover is the cropped word with a caption-sized statement under it
    coverDisplay: 0.22,
    coverMin: 24,
    // Material slide: the four listed materials as objects, at scale and nothing else: a ruled
    // hairline, the blank label held by four stitches, the plain crop strip and the main action
    // (an ink block carrying the one 6px primary square).
    materialArt() {
      return `<div class="dl-obj">
        <div class="dl-m dl-m-hair"><i></i><span>${abCopy(DL_KEY, 'hairlineCap')}</span></div>
        ${dlTag('dl-tag--lg')}
        <div class="dl-m dl-m-strip" aria-hidden="true"></div>
        <div class="dl-m dl-m-act"><span class="ab-cta"><span class="ab-cta-label">${abCopy(DL_KEY, 'cta')}</span></span><span>${abCopy(DL_KEY, 'actionCap')}</span></div>
      </div>`;
    },
    // In product: one product page, one item named by the brand, its blank label and one action
    product(ctx) {
      const e = ctx.e;
      const name = e(String(ctx.brandName || 'Archive').trim());
      return `<div class="dl-pp">
        <div class="dl-pp-img">${dlTag('dl-tag--lg')}</div>
        <div class="dl-pp-info">
          <h3 class="dl-pp-name">${name}</h3>
          <p class="dl-pp-line">${abCopy(DL_KEY, 'productLine')}</p>
          <p class="dl-pp-price">${abCopy(DL_KEY, 'price')}</p>
          <span class="ab-cta"><span class="ab-cta-label">${abCopy(DL_KEY, 'cta')}</span></span>
          <p class="dl-pp-foot">${[0, 1, 2].map(i => abCopy(DL_KEY, 'state' + i)).join(' \u00B7 ')}</p>
        </div>
      </div>`;
    },
    principles: [
      ['Severity by removal', 'One cropped word, a 15px caption, white space.'],
      ['Default type, used without apology', 'An Arial-class sans and a typewriter mono.'],
      ['Catalogue, never decorate', 'One blank label carries the accession number.'],
    ],
    do: [
      'Crop display type vertically under a strip.',
      'Number items year.sequence.part.',
      'Show the primary once, as a 6px square.',
    ],
    dont: [
      'Add gradients, glows or glass.',
      'Use gothic tropes like chains or skulls.',
      'Add barcodes, crosshairs or a second mark.',
    ],
  },
});
