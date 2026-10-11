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

// The giant word: first word of the brand, uppercase, set so its full width is 103% of the
// plate (the right edge crops at most half a letter), then cropped VERTICALLY: the top 70%
// of the cap height shows and the rest hides under the CLASSIFIED strip. A horizontal crop at
// a letter boundary can spell an accidental word, a vertical one never can.
function dlWordFit(state, word) {
  const W = 200 * 1.03;
  let natural = 0;
  try {
    const cv = document.createElement('canvas').getContext('2d');
    cv.font = `800 100px ${(state && state.headingFont && state.headingFont.css) || 'sans-serif'}`;
    natural = cv.measureText(word).width;
  } catch (err) { natural = 0; }
  if (!(natural > 0)) natural = 64 * word.length;
  // fsFull is the size at which the word is exactly W wide. Past 44 the glyph tops would climb
  // behind the blank label, so a short word stays at 44 and takes letter-spacing to reach W; a
  // very short one (under ~55% of W at 44) is allowed to grow, up to 119, before it is tracked out.
  const fsFull = 100 * W / natural;
  let fs = fsFull;
  let mode = 'spacingAndGlyphs';
  if (fsFull > 44) {
    fs = Math.min(119, Math.max(44, 100 * 0.55 * W / natural));
    mode = 'spacing';
  } else if (fsFull < 18) {
    fs = 18;
    mode = 'spacingAndGlyphs';
  }
  return { fs, W, mode };
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
  type: { ui: 'sans', label: 'sans', display: 1.12 },
  highlight: 'custom',
  highlightNote: 'The highlighted word stays in ink like the rest of the headline and carries one thin underline stripe (about 0.07em) in the single accent mark (always the client primary); no colour on the word itself.',
  cardFill: '--canvas',

  roles: {
    canvas: {
      use: 'Surgical white (the light colour pushed to near-pure neutral; dark mode a near-black); the vast empty field. Never a tinted pastel',
      never: 'Text, a tint, a gradient, or a concrete or paper texture',
      coverage: '≈90–92%',
    },
    ink: {
      use: 'Ink black: all type, the 1px rules and hairline boxes, the barcode, the security strip, the giant cropped word and the inverted selected cell',
      never: 'Large flat fields other than the single security strip, or a soft grey substitute for hairlines',
      coverage: '≈6–7%',
    },
    primary: {
      use: 'The single disruptive accent: the one main action, one small mark per view (a dot, an end tick or a strike) and the "Classified" dot. It is always the client primary, even a dull one; there is no red fallback',
      never: 'Body text, borders, backgrounds, a second accent, gradients, or more than 2% of the area',
      coverage: '≤2%',
    },
    secondary: {
      use: 'A tint (12% over the canvas) in the label strips and the institutional "wellness" notice; tiny and flat',
      never: 'The main action, text, large fields, or hairlines',
      coverage: '≤1%',
    },
    accent: {
      use: 'Tiny status marks only: the footer dot and the "viewed by" dot beside a label',
      never: 'Buttons, headlines, fills, or more than a few pixels per mark',
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

  // "Accession": one enormous word in ink, fitted to 103% of the plate width and cropped vertically (top 70% visible) under the strip;
  // a blank white label held by four X stitches carrying an accession number, a circled
  // numeral and a barcode; one dot of the single accent; a black security strip along the
  // lower edge; crop marks. Pure SVG, viewBox 200 x 80.
  art(ctx) {
    const t = ctx.t;
    const e = escapeHtml;
    const word = e(String(ctx.brandName || 'Archive').trim().split(/\s+/)[0].toUpperCase());
    const fit = dlWordFit(ctx.state, word);
    const strip = 69.5;
    const baseline = (strip + 0.3 * 0.72 * fit.fs).toFixed(2);
    const mark = dlMark(t);
    const ink = t.isDark ? t.mix('#F7F7F5', t.ink, 0.7) : t.mix('#0A0A0A', t.ink, 0.75);
    const paper = t.isDark ? '#F2F2EF' : '#FFFFFF';
    const lab = { x: 132, y: 12, w: 52, h: 36 };
    const stitch = (x, y) => `<path d="M${x - 1.2} ${y - 1.2} L${x + 1.2} ${y + 1.2} M${x + 1.2} ${y - 1.2} L${x - 1.2} ${y + 1.2}" stroke="#0A0A0A" stroke-width=".5" fill="none"/>`;
    let bars = '';
    let bx = lab.x + 5;
    const pat = [1.2, 0.6, 0.6, 1.6, 0.6, 1.0, 0.6, 0.6, 1.4, 0.6, 1.0, 1.6, 0.6, 0.6, 1.0, 0.6, 1.2, 0.6, 0.6, 1.6];
    pat.forEach((w, i) => { if (i % 2 === 0) bars += `<rect x="${bx.toFixed(2)}" y="${lab.y + 25}" width="${w}" height="6.6" fill="#0A0A0A"/>`; bx += w + 0.5; });
    const crop = (x, y, dx, dy) => `<path d="M${x} ${y + dy * 4} V${y} H${x + dx * 4}" stroke="${ink}" stroke-width=".35" fill="none"/>`;
    return `<div class="dl-art"><svg viewBox="0 0 200 80" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="presentation">
      <g>
        <svg x="0" y="0" width="200" height="${strip}" viewBox="0 0 200 ${strip}" overflow="hidden"><text class="dl-word" x="1" y="${baseline}" font-size="${fit.fs.toFixed(2)}" textLength="${fit.W}" lengthAdjust="${fit.mode}" fill="${ink}">${word}</text></svg>
        <rect x="0" y="69.5" width="200" height="8.5" fill="#0A0A0A"/>
        <text class="dl-strip" x="6" y="75.2" fill="#F7F7F5">CLASSIFIED / DIVISION 07 / NOT FOR RELEASE</text>
        <text class="dl-strip" x="194" y="75.2" text-anchor="end" fill="#F7F7F5">2026.114</text>
        <rect x="${lab.x}" y="${lab.y}" width="${lab.w}" height="${lab.h}" fill="${paper}" stroke="#0A0A0A" stroke-width=".35"/>
        ${stitch(lab.x + 3.2, lab.y + 3.2)}${stitch(lab.x + lab.w - 3.2, lab.y + 3.2)}${stitch(lab.x + 3.2, lab.y + lab.h - 3.2)}${stitch(lab.x + lab.w - 3.2, lab.y + lab.h - 3.2)}
        <text class="dl-acc" x="${lab.x + 7}" y="${lab.y + 11}" fill="#0A0A0A">2026.114.3</text>
        <circle cx="${lab.x + lab.w - 11}" cy="${lab.y + 9.6}" r="3.6" fill="none" stroke="#0A0A0A" stroke-width=".45"/>
        <text class="dl-num" x="${lab.x + lab.w - 11}" y="${lab.y + 11}" text-anchor="middle" fill="#0A0A0A">7</text>
        <path d="M${lab.x + 7} ${lab.y + 16.4} H${lab.x + lab.w - 7}" stroke="#0A0A0A" stroke-width=".3"/>
        <text class="dl-sub" x="${lab.x + 7}" y="${lab.y + 21.4}" fill="#0A0A0A">VIEWED BY / NO ONE</text>
        ${bars}
        <circle cx="${lab.x - 7}" cy="${lab.y + 3}" r="2.1" fill="${mark}"/>
      </g>
      ${crop(3, 3, 1, 1)}${crop(197, 3, -1, 1)}
    </svg></div>`;
  },

  materials: [
    { name: 'Hairline', css: 'border-top: 1px solid {dlInk}; /* the only rule: 1px ink, 0 radius; double rules carry registration ticks; no card chrome, no shadows */' },
    { name: 'Blank label (accession)', css: 'background: {canvas}; color: {dlInk}; border: 1px solid {dlInk}; font: 500 10px ui-monospace, Menlo, monospace; letter-spacing: .08em; /* a blank white label held by four X stitches at the corners; accession number year.sequence.part, e.g. 2026.114.3, and a circled numeral */' },
    { name: 'Security strip', css: 'background: {dlInk}; color: {canvas}; font: 500 10px ui-monospace, Menlo, monospace; letter-spacing: .1em; text-transform: uppercase; /* CLASSIFIED / DIVISION 07 / NOT FOR RELEASE; the only large flat ink field */' },
    { name: 'Main action (the single accent)', css: 'background: {dlMark}; color: {dlOnMark}; border-radius: 0; text-transform: uppercase; font: 600 11px sans-serif; letter-spacing: .1em; /* the one per view; hover inverts to ink; no icon, no shadow */' },
    { name: 'Selected cell', css: 'background: {dlInk}; color: {canvas}; border: 1px solid {dlInk}; /* hairline-boxed cells; the selected one is inverted */' },
    { name: 'Label tint strip', css: 'background: {dlTint}; /* secondary at 12% over the canvas; tiny and flat, for an institutional notice */' },
    { name: 'Footer block', css: 'background: {dlGrey}; color: {muted}; /* a flat grey block with legal labels, an address and a catalogue number */' },
  ],

  rules: {
    do: [
      'Remove first: a tiny wordmark, vast empty space and at most three visible elements per zone.',
      'Crop display type hard under a strip so only about 70 percent of its height shows (crop vertically, never at a letter boundary), and keep the labels small and exact.',
      'Number everything: accession year.sequence.part (2026.114.3), a circled numeral, a barcode, a security-style label.',
      'Keep the neutrals near-pure (about 92% neutrals, 7% greys, under 2% accent) and use one mark in the client primary per view.',
    ],
    dont: [
      'Use gradients, glows, glass, soft shadows or rounded corners; hard cuts and hairlines only.',
      'Spread the primary: it is a single dot, tick, strike or button, never a wash or a second accent.',
      'Add gothic horror tropes (chains, crosses, skulls, gore), concrete textures or warm literary serif layouts.',
      'Set tiny type below 4.5:1 contrast or leave the board with no readable controls; severity is never illegibility.',
    ],
  },

  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    principles: [
      ['Severity by removal', 'A tiny logo and vast white space say it all.'],
      ['Enormous, severely cropped type', 'Headlines are cropped under a strip; labels stay small.'],
      ['Label everything clinically', 'Accession numbers and blank tags classify each object.'],
    ],
    do: [
      'Crop display type vertically under a strip.',
      'Number items year.sequence.part.',
      'Keep the brand mark under two percent.',
    ],
    dont: [
      'Add gradients, glows or glass.',
      'Use gothic tropes like chains or skulls.',
      'Set tiny low-contrast type.',
    ],
  },
});
