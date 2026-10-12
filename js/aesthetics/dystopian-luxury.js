/* 36 Dystopian Luxury — severe, clinical, exclusive. References: the 2017 Balenciaga web
   redesign (Bureau Borsche: a tiny logo, no imagery, small Arial, black and white, one
   neon-green button, a grey footer), Maison Margiela's blank white label held by four
   stitches and its circled numerals 0-23, museum accession numbers (year.sequence.part),
   Lumon's benevolent-institution register. Severity by removal and labelling: near-pure
   white and ink, a tiny wordmark, vast empty space, one enormous word cropped vertically under a strip,
   hairlines, security-style labels and a single mark in the client primary under 2% of the area.
   Metal only on hardware (not drawn here). No gothic horror, no gradients, no glow,
   no real brand names. The classifying labels never warn; they catalogue. */

// The single disruptive mark is always the client's primary (a dull primary is still the
// brand; there is no fixed fallback colour). Shared by tokens() and art().
function dlMark(t) {
  return t.primary;
}

// The giant word: first word of the brand, uppercase, set so its full width is 102% of the
// BOARD (the plate runs edge to edge; the right edge crops at most half a letter), then
// cropped VERTICALLY: the top 70% of the cap height shows and the rest hides under the
// CLASSIFIED strip. A horizontal crop at a letter boundary can spell an accidental word, a
// vertical one never can. Returns the font size in viewBox units, the target width, the
// lengthAdjust mode and the strip's y (the plate's height follows the word).
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
  if (fsFull > cap) { fs = cap; mode = 'spacing'; }     // a short word: capped, then tracked out to the edge
  else if (fsFull < 14) { fs = 14; }
  const strip = 1.5 + 0.7 * 0.72 * fs;                 // 70% of the cap height shows above the strip
  return { fs, W, mode, strip };
}

// Split a word in two near its middle: a consonant-consonant boundary that is not a digraph
// ("STRAW" / "BERRY") when one sits within a quarter of the middle, else the vowel-consonant
// boundary nearest the middle ("MARI" / "GOLD"), else the middle itself.
function dlSplit(word) {
  const w = String(word);
  if (w.length < 5) return [w];
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

// One cropped plate: the word clipped under a black strip, viewBox 200 wide, height from the fit.
function dlPlate(state, word, ink, label, num, maxFs) {
  const fit = dlWordFit(state, word, maxFs);
  const strip = fit.strip;
  const h = strip + 8.5;
  const baseline = (strip + 0.3 * 0.72 * fit.fs).toFixed(2);
  const lab = label ? `<text class="dl-strip" x="5" y="${(strip + 5.6).toFixed(2)}" fill="#F7F7F5">${label}</text>` : '';
  const no = num ? `<text class="dl-strip" x="195" y="${(strip + 5.6).toFixed(2)}" text-anchor="end" fill="#F7F7F5">${num}</text>` : '';
  return `<svg class="dl-plate-svg" viewBox="0 0 200 ${h.toFixed(2)}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="presentation">
      <svg x="0" y="0" width="200" height="${strip.toFixed(2)}" viewBox="0 0 200 ${strip.toFixed(2)}" overflow="hidden"><text class="dl-word" x="0" y="${baseline}" font-size="${fit.fs.toFixed(2)}" textLength="${fit.W}" lengthAdjust="${fit.mode}" fill="${ink}">${word}</text></svg>
      <rect x="0" y="${strip.toFixed(2)}" width="200" height="8.5" fill="#0A0A0A"/>${lab}${no}
    </svg>`;
}

registerAesthetic({
  key: 'dystopian-luxury', order: 36,
  name: 'Dystopian Luxury',
  descriptor: 'Severe · Clinical · Exclusive',
  influences: 'Balenciaga web / Maison Margiela labels / Museum accession',
  summary: 'Severity through removal: a tiny logo, vast white space, enormous cropped type and blank labels.',
  motto: 'Access is a privilege.',
  kicker: 'Restricted viewing',
  mode: 'light',
  slideShape: 'minimal',
  labels: { material: 'Accession', states: ['Catalogued', 'Restricted', 'Classified'], statesKind: 'button' },
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
      use: 'Ink black: all type, the 1px rules at 12%, the security strip, the giant cropped word, the inverted selected cell and the one action',
      never: 'Large flat fields other than the single security strip, or a soft grey substitute for hairlines',
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
      '--ab-dl-on-mark': t.readable(mark),
      '--ab-dl-grey': d ? t.mix('#ffffff', t.canvas, 0.08) : t.mix('#000000', t.canvas, 0.06),
      '--ab-dl-tint': t.mix(t.secondary, t.canvas, 0.12),
      '--ab-dl-hair': t.alpha(ink, 0.16),
      '--ab-type-pick-w': '500',
    };
  },

  // "Accession": one enormous word in ink, fitted to 102% of the board's width and cropped
  // vertically (top 70% visible) under the CLASSIFIED strip; below it, at the right, the
  // only object: a blank white label held by four X stitches, with an accession number and a
  // circled numeral (no barcode, no dot). Narrow boards show the word split at its middle
  // syllable on two cropped plates instead (CSS swaps .dl-wide / .dl-narrow), the label is
  // hidden and the accession number runs as plain text under the strip.
  art(ctx) {
    const t = ctx.t;
    const e = escapeHtml;
    const raw = String(ctx.brandName || 'Archive').trim().split(/\s+/)[0].toUpperCase() || 'ARCHIVE';
    const word = e(raw);
    const ink = t.isDark ? t.mix('#F7F7F5', t.ink, 0.7) : t.mix('#0A0A0A', t.ink, 0.75);
    const parts = dlSplit(raw);
    const narrow = parts.map((p, i) => dlPlate(ctx.state, e(p), ink, i === parts.length - 1 ? 'CLASSIFIED / DIV. 07' : '', i === parts.length - 1 ? '2026.114' : '', 100)).join('');
    return `<div class="dl-art">
      <div class="dl-plate dl-wide">${dlPlate(ctx.state, word, ink, 'CLASSIFIED / DIVISION 07 / NOT FOR RELEASE', '2026.114', 64)}</div>
      <div class="dl-plate dl-narrow">${narrow}<p class="dl-accline">Accession 2026.114.3 · viewed by no one</p></div>
      <div class="dl-tag"><i class="dl-st"></i><i class="dl-st"></i><i class="dl-st"></i><i class="dl-st"></i>
        <span class="dl-tag-no">2026.114.3</span><span class="dl-tag-c">7</span>
        <span class="dl-tag-sub">Viewed by / no one</span>
      </div>
    </div>`;
  },

  materials: [
    { name: 'Hairline', css: 'border-top: 1px solid {dlInk}; /* the only rule: 1px ink, 0 radius; double rules carry registration ticks; no card chrome, no shadows */' },
    { name: 'Blank label (accession)', css: 'background: {canvas}; color: {dlInk}; border: 1px solid {dlInk}; font: 400 10px "Courier Prime", Courier, monospace; letter-spacing: .04em; /* the only object: a blank white label held by four X stitches; accession number year.sequence.part (2026.114.3) and a circled numeral; no barcode */' },
    { name: 'Security strip', css: 'background: {dlInk}; color: {canvas}; font: 500 10px ui-monospace, Menlo, monospace; letter-spacing: .1em; text-transform: uppercase; /* CLASSIFIED / DIVISION 07 / NOT FOR RELEASE; the only large flat ink field */' },
    { name: 'Main action (a mark, not a bar)', css: 'display: inline-flex; width: auto; padding: 10px 14px; background: {dlInk}; color: {canvas}; border-radius: 0; font: 400 12px Arial-class sans; /* a 6px {dlMark} square before the label: the one primary mark per view */' },
    { name: 'Selected cell', css: 'background: {dlInk}; color: {canvas}; border: 1px solid {dlInk}; /* hairline-boxed cells; the selected one is inverted */' },
    { name: 'Footer block', css: 'background: {dlGrey}; color: {muted}; /* a flat grey block with legal labels, an address and a catalogue number */' },
  ],

  rules: {
    do: [
      'Remove first: a tiny wordmark, vast empty space and at most three visible elements per zone.',
      'Crop display type hard under a strip so only about 70 percent of its height shows (crop vertically, never at a letter boundary), and keep the labels small and exact.',
      'One gesture: the brand word, cropped, edge to edge. Everything else is a 15px caption or smaller.',
      'Number items, not sections: accession year.sequence.part (2026.114.3) on one blank label; set it in a default typewriter face.',
      'Keep the neutrals near-pure and show the primary once per view, as a 6px square on the one action.',
    ],
    dont: [
      'Use gradients, glows, glass, soft shadows or rounded corners; hard cuts and hairlines only.',
      'Spread the primary: no colour bar, no underline, no second mark. No barcodes or grid furniture either.',
      'Add gothic horror tropes (chains, crosses, skulls, gore), concrete textures or warm literary serif layouts.',
      'Set tiny type below 4.5:1 contrast or leave the board with no readable controls; severity is never illegibility.',
    ],
  },

  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    coverDisplay: 0.6,
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
      'Add barcodes, grids or a colour bar.',
    ],
  },
});
