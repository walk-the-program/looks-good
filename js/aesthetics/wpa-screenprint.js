/* 36 WPA Screenprint (order 46) — 1930s public-works travel-poster screenprints: flat layered colour, three to
   five muted inks, a visible overprint where two inks cross, rounded poster tiles. Friendly and
   civic, not nostalgic kitsch. Everything is fictional and original: no agency mark, no real park,
   no slogan.

   Mechanism.
   - Inks: cream paper (#EFE6D2) and deep forest ink (#23392F) are fixed; the brand's three colours
     print as spot inks. A spot ink is the brand colour muted for print (saturation capped at 40,
     lightness pulled into 42-60), so a neon brand still prints as an ink. wpMute() makes the art
     inks (a1 a2 a3); wpFit() nudges one only as far as a label (cream or forest) needs 4.7:1 on it,
     for the few places that carry text on a spot (f1 f2 f3).
   - Light mode is cream paper with forest ink. Dark mode is a forest-green night ground with
     cream text and the same spot inks. The printed primary (printPrimary) is the spot ink moved
     into the range its label needs: deep on cream (cream label), light on night (forest label).
   - Depth is one device: a hard 2px down-right offset block in a second ink, behind the primary
     button, the stamp tags and the poster card. Never a blur, never behind body text.
   - Overprint: where two spot inks cross in the poster, the crossing is a third, darker tone
     (the product of the two inks, computed here and drawn as a flat shape clipped to the first
     ink), with the second ink 1.5 units off-register. Art and marks only, never text.
   - Art (website and deck only): a poster of stacked flat landscape bands: sky bands, a sun disc,
     two ridgelines, a lake with the sun's overprinted reflection and a forest bank with the brand
     name in the title strip. App UI (UI kit, Built phone screens, App brief) carries none of it:
     no poster, no grain, no pattern, no bands.
   Headline: condensed display caps, slightly open; the last word sits on a flat spot-ink block
   with its own offset block. */
(function () {
const PAPER = '#EFE6D2', CARD_L = '#F8F2E3', FOREST = '#23392F', NIGHT = '#17261F', CREAM = '#EFE6D2';
const MUSTARD = '#D9A441', TERRA = '#B85C38', TEAL = '#2F5D62';

let wpSeq = 0;
const wpCR = (a, b) => (typeof contrastRatio === 'function' ? contrastRatio(a, b) : 21);
const wpMix = (a, b, k) => (typeof slMix === 'function' ? slMix(a, b, k) : a);
// Two inks printed over each other on paper: the product of the colours.
function wpMul(a, b) {
  const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const x = p(a), y = p(b);
  return '#' + x.map((v, i) => Math.round(v * y[i] / 255).toString(16).padStart(2, '0')).join('');
}
// The label colour that reads on a fill: cream or forest.
const wpOn = fill => (wpCR(CREAM, fill) >= wpCR(FOREST, fill) ? CREAM : FOREST);

// A brand colour as a print ink: muted (saturation <= 40) and pulled into print-ink lightness.
function wpMute(hex) {
  const c = hexToHsl(hex);
  return hslToHex(c.h, Math.min(c.s, 40), Math.max(42, Math.min(c.l, 60)));
}
// The muted ink moved the shortest way in lightness until a label on it holds `min`:1.
function wpFit(hex, min) {
  const c = hexToHsl(hex);
  const s = Math.min(c.s, 40);
  const base = Math.max(42, Math.min(c.l, 60));
  for (let d = 0; d <= 50; d++) {
    for (const dir of d ? [-1, 1] : [0]) {
      const l = base + dir * d;
      if (l < 14 || l > 88) continue;
      const h = hslToHex(c.h, s, l);
      if (Math.max(wpCR(CREAM, h), wpCR(FOREST, h)) >= min) return h;
    }
  }
  return hslToHex(c.h, s, base);
}
// The printed primary (the button fill): deep ink under a cream label on cream paper; a lighter
// ink under a forest label on the night ground (it also holds 3:1 on that ground).
function wpPrimary(hex, dark) {
  const c = hexToHsl(hex);
  const s = Math.min(c.s, 40);
  const base = Math.max(42, Math.min(c.l, 60));
  if (dark) {
    for (let l = base; l <= 88; l++) {
      const h = hslToHex(c.h, s, l);
      if (wpCR(FOREST, h) >= 4.7 && wpCR(h, NIGHT) >= 3.3) return h;
    }
    return hslToHex(c.h, s, 70);
  }
  for (let l = Math.min(base, 50); l >= 8; l--) {
    const h = hslToHex(c.h, s, l);
    if (wpCR(CREAM, h) >= 4.7) return h;
  }
  return FOREST;
}

// The brand colours in print: art inks a1-a3 and label-safe inks f1-f3 (+ their labels), and the
// printed primary pp for the mode.
function wpInks(t) {
  const d = t.isDark;
  const src = [t.primary, t.secondary, t.accent];
  const a = src.map(wpMute);
  const f = src.map(h => wpFit(h, 4.7));
  return { a, f, on: f.map(wpOn), pp: wpPrimary(t.primary, d), d };
}

// The muted spot inks for the pattern engine (js/patterns/fit.js, colourway 'wpa-ink'): the same
// art inks the board prints, never the raw brand hex. deep = the forest (cream on the night ground).
if (typeof window !== 'undefined') {
  window.wpaPrintInks = function (primary, secondary, accent, dark) {
    const a = [primary, secondary, accent].map(wpMute);
    return { ink1: a[0], ink2: a[1], spark: a[2], deep: dark ? CREAM : FOREST };
  };
}

const f1 = n => String(Math.round(n * 10) / 10);

// Closed ridge band: the top contour plus the same contour `drop` lower, reversed.
function wpBand(top, drop) {
  const pts = top.concat(top.slice().reverse().map(p => [p[0], p[1] + drop]));
  return 'M' + pts.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L') + 'Z';
}
function wpFill(top, bottomY) {
  const pts = top.concat([[400, bottomY], [0, bottomY]]);
  return 'M' + pts.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L') + 'Z';
}
// Ink B printed over ink A: B 1.5 units off-register, and where it crosses A the product colour.
function wpOver(id, aPath, aInk, bPath, bInk, dx, dy) {
  const mv = `transform="translate(${dx} ${dy})"`;
  return `<path d="${bPath}" fill="${bInk}" ${mv}/>
    <clipPath id="${id}"><path d="${aPath}"/></clipPath>
    <g clip-path="url(#${id})"><path d="${bPath}" fill="${wpMul(aInk, bInk)}" ${mv}/></g>`;
}
// Brand name for the title strip: upper case, cut to what the strip holds.
function wpTitle(name) {
  const s = String(name || '').trim().toUpperCase();
  return s.length > 24 ? s.slice(0, 23).trim() + '…' : s;
}

registerAesthetic({
  key: 'wpa-screenprint', order: 46,
  name: 'WPA Screenprint',
  descriptor: 'Civic · Inked · Outdoors',
  influences: '1930s public-works posters / Screenprint / Flat layered colour',
  summary: 'Flat layered inks on cream paper with a visible overprint where two cross, rounded poster tiles and a hard offset block behind the main actions.',
  motto: 'Printed for the public.',
  kicker: 'Public works',
  mode: 'light',
  slideShape: 'soft',
  labels: { material: 'Ink', states: ['Rest', 'Hover', 'Pressed'], statesKind: 'button' },
  // Editable specimen copy (Brand > Advanced > Specimen copy); text matches motto / kicker / labels.states above.
  copy: {
    motto: { label: 'Motto', text: 'Printed for the public.' },
    kicker: { label: 'Kicker above the headline', text: 'Public works' },
    state0: { label: 'State 1 name', text: 'Rest' },
    state1: { label: 'State 2 name', text: 'Hover' },
    state2: { label: 'State 3 name', text: 'Pressed' },
  },
  layout: { hero: 'split', palette: 'swatches', sections: 'two-col', subcopy: true },
  type: { ui: 'body', label: 'heading', display: 1.12 },
  highlight: 'custom',
  highlightNote: 'The last word of the headline sits on a flat block of the first spot ink (its label cream or forest, whichever reads at 4.5:1), with a 2px offset block of the second spot ink behind it. No gradient, no outline.',
  cardFill: '--wp-card',

  roles: {
    canvas: {
      job: 'Paper · night ground',
      use: 'Cream paper #EFE6D2 in light mode, a forest-green night ground #17261F in dark mode. Fixed: the brand canvas does not tint it. The board carries a faint paper grain; app screens do not',
      never: 'Gradients, or grain on app screens',
      coverage: '55–65%',
    },
    ink: {
      job: 'Deep ink',
      use: 'Forest #23392F on cream (cream on the night ground): text, hairline rules, the 1.5px card edge, the near ridge and the title strip in the art',
      never: 'Pure black, shadows, fills wider than a strip',
      coverage: '15–20%',
    },
    primary: {
      job: 'Spot ink 1 · main action',
      use: 'The brand primary printed as a spot ink: muted (saturation capped at 40%) and moved into the lightness its label needs. It fills the one main button (deep on cream, lighter on the night ground), the "on" toggle, progress fills and the sun in the art',
      never: 'Body text, a second main button, large backgrounds',
      coverage: '≈10%',
    },
    secondary: {
      job: 'Spot ink 2',
      use: 'The brand secondary muted for print: the offset block behind the main button and the poster, the second ridgeline, selected states and the avatar fill. Where it overprints ink 1 the crossing is a darker third tone',
      never: 'The main action, body text',
      coverage: '≈10%',
    },
    accent: {
      job: 'Spot ink 3',
      use: 'The brand accent muted for print: the lake band, badges, the list glyphs and the footer dot. A small area, never text',
      never: 'Buttons, body text, large fills',
      coverage: '≤8%',
    },
  },

  canvas(b) { return b.isDark ? NIGHT : PAPER; },

  printPrimary(t) { return wpPrimary(t.primary, t.isDark); },

  tokens(t, st) {
    const S = st || (typeof state !== 'undefined' ? state : null) || {};
    const I = wpInks(t);
    const d = t.isDark;
    const ink = d ? CREAM : FOREST;
    const canvas = d ? NIGHT : PAPER;
    const pp = I.pp;
    const card = d ? wpMix(CREAM, NIGHT, 0.07) : CARD_L;
    const paper2 = d ? wpMix(CREAM, NIGHT, 0.12) : wpMix(FOREST, PAPER, 0.07);
    const tint1 = wpMix(I.a[0], canvas, d ? 0.26 : 0.22);
    const tint2 = wpMix(I.a[1], canvas, d ? 0.26 : 0.22);
    // muted text must hold 4.7:1 on every surface it sits on: paper, card, the paper wash, both tints
    const surfaces = [canvas, card, paper2, tint1, tint2];
    let toward = 0.4, muted = wpMix(canvas, ink, toward);
    while (toward > 0.04 && Math.min(...surfaces.map(s => wpCR(muted, s))) < 4.7) { toward -= 0.04; muted = wpMix(canvas, ink, toward); }
    const onPp = d ? FOREST : CREAM;
    const primaryText = wpCR(pp, canvas) >= 4.6 ? pp : ink;
    const accentText = wpCR(I.f[2], canvas) >= 4.6 ? I.f[2] : ink;
    const hw = (typeof abWeight === 'function' && S.headingFont) ? abWeight(S.headingFont, 600) : 600;
    return {
      '--ab-ink': ink,
      '--ab-muted': muted,
      '--ab-line': wpMix(ink, canvas, 0.3),
      '--ab-type-pick-w': 600,
      '--ab-on-primary': onPp,
      '--ab-primary-text': primaryText,
      '--ab-pri-tint': tint1,
      '--ab-secondary': I.f[1], '--ab-on-secondary': I.on[1],
      '--ab-accent': I.f[2], '--ab-on-accent': I.on[2],
      '--ab-sec-tint': tint2,
      '--ab-accent-text': accentText, '--ab-accent-ink': accentText,
      '--ab-tr': 0,
      '--wp-ink': ink,
      '--wp-card': card,
      '--wp-paper2': paper2,
      '--wp-pp': pp,
      '--wp-on-pp': onPp,
      '--wp-a1': I.a[0], '--wp-a2': I.a[1], '--wp-a3': I.a[2],
      '--wp-f1': I.f[0], '--wp-f2': I.f[1], '--wp-f3': I.f[2],
      '--wp-on-f1': I.on[0], '--wp-on-f2': I.on[1], '--wp-on-f3': I.on[2],
      '--wp-off': I.a[1],
      '--wp-off2': I.a[0],
      '--ab-wp-card': card, '--ab-wp-paper2': paper2, '--ab-wp-off': I.a[1], '--ab-wp-off2': I.a[0], '--ab-wp-a1': I.a[0], '--ab-wp-a3': I.a[2],
      '--wp-forest': FOREST,
      '--wp-paper': PAPER,
      '--wp-hw': hw,
      '--ab-art-ratio': '4 / 3.1',
    };
  },

  art(ctx) {
    const t = ctx.t;
    const I = wpInks(t);
    const [a1, a2, a3] = I.a;
    const id = 'wp' + (++wpSeq);
    const sky0 = wpMix(a3, PAPER, 0.16), sky1 = wpMix(a1, PAPER, 0.24);
    // stacked flat bands, back to front
    const farTop = [[0, 150], [40, 118], [74, 140], [118, 98], [168, 142], [214, 112], [262, 140], [300, 98], [346, 132], [400, 112]];
    const midTop = [[0, 196], [52, 158], [96, 182], [150, 140], [206, 184], [248, 164], [300, 192], [350, 160], [400, 186]];
    const bankTop = [[0, 246], [60, 234], [120, 242], [200, 232], [280, 242], [340, 234], [400, 240]];
    const far = wpBand(farTop, 40), mid = wpFill(midTop, 204), bank = wpFill(bankTop, 300);
    const sunPath = 'M232 96a40 40 0 1 0 80 0a40 40 0 1 0 -80 0Z';
    const lakeY = 204;
    const refl = [[272, 214, 34], [272, 224, 24], [272, 233, 14]].map(([cx, cy, rx]) =>
      `<ellipse cx="${cx + 1.5}" cy="${cy + 1}" rx="${rx}" ry="3.6" fill="${wpMul(a1, a3)}"/>`).join('');
    const pine = (x, y, h) => `<path d="M${x} ${y - h}L${x + h * 0.36} ${y - h * 0.34}L${x + h * 0.18} ${y - h * 0.34}L${x + h * 0.44} ${y}L${x - h * 0.44} ${y}L${x - h * 0.18} ${y - h * 0.34}L${x - h * 0.36} ${y - h * 0.34}Z" fill="${FOREST}"/>`;
    const title = wpTitle(ctx.brandName);
    const fs = Math.max(13, Math.min(28, 340 / Math.max(6, title.length * 0.56)));
    return `<div class="wpa"><svg class="wpa-svg" viewBox="0 0 400 310" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="presentation" focusable="false">
      <rect width="400" height="310" fill="${sky0}"/>
      <rect y="86" width="400" height="140" fill="${sky1}"/>
      <circle cx="272" cy="96" r="49" fill="none" stroke="${wpMix(a1, PAPER, 0.5)}" stroke-width="3"/>
      <path d="${sunPath}" fill="${a1}"/>
      ${wpOver(id + 'a', sunPath, a1, far, a3, 1.5, 1)}
      ${wpOver(id + 'b', far, a3, mid, a2, 1.5, 1)}
      <rect y="${lakeY}" width="400" height="46" fill="${a3}"/>
      ${refl}
      <path d="M26 216h52M318 236h56M150 224h40" stroke="${PAPER}" stroke-width="2" stroke-linecap="round"/>
      <path d="${bank}" fill="${FOREST}"/>
      ${pine(34, 240, 46)}${pine(64, 238, 34)}${pine(364, 240, 40)}
      <path d="M18 262H382" stroke="${PAPER}" stroke-width="1.5"/>
      <text x="18" y="${f1(262 + 14 + fs * 0.62)}" fill="${PAPER}" style="font-family:var(--ab-font-h);font-weight:var(--wp-hw,600);letter-spacing:.06em" font-size="${f1(fs)}">${escapeHtml(title)}</text>
    </svg></div>`;
  },

  materials: [
    { name: 'Poster tile', css: 'background: {wpCard}; border: 1.5px solid {ink}; border-radius: 14px; /* a flat rounded tile in paper or a pale tint of a spot ink; no blur shadow, no gradient */' },
    { name: 'Main button', css: 'background: {printPrimary}; color: {onPrimary}; border-radius: 8px; box-shadow: 2px 2px 0 {wpOff}; /* the flat spot-ink fill with a hard 2px offset block in the second ink; pressed: the block closes and the button travels 2px */' },
    { name: 'Stamp tag', css: 'background: {wpCard}; color: {ink}; border: 1.5px solid {ink}; border-radius: 2px; box-shadow: 2px 2px 0 {wpOff2}; /* a small rectangular badge in caps with an offset block in spot ink 1; never behind body text */' },
    { name: 'Two-ink toggle', css: 'background: {wpPaper2}; border: 1.5px solid {ink}; border-radius: 999px; /* track in paper, knob in spot ink 1; on: the track takes the printed primary */' },
    { name: 'Ruled list', css: 'border-top: 1px solid {ink}; /* rows divided by 1px ink hairlines, each with a small flat spot-ink glyph */' },
    { name: 'Overprint', css: 'fill: {wpA3}; mix-blend-mode: multiply; /* ink 1 ({wpA1}) over ink 3, drawn as a flat shape clipped to the first ink: where two spot inks cross in the art, a darker third tone with 1.5 units of misregistration; art and marks only, never text */' },
    { name: 'Paper grain', css: 'background-color: {canvas}; /* a faint feTurbulence grain over the board ground and the deck only; none on app screens */' },
  ],

  rules: {
    do: [
      'Print flat: three to five muted inks on cream paper, solid fills only, no gradients and no blur.',
      'Let two spot inks overprint into a darker third tone where they cross, with the second ink 1 to 2px off-register.',
      'Give the main button, the stamp tags and the poster card one hard 2px offset block in a second ink.',
      'Keep cards flat and rounded (14px cards, 8px controls) with a 1.5px ink edge, and rule lists with 1px ink hairlines.',
      'Set display type in condensed caps with slightly open tracking; keep body text in a friendly humanist sans.',
      'Mute the brand colours into print inks (saturation capped near 40%) so any palette reads as a screenprint.',
    ],
    dont: [
      'Put art, grain, patterns or decorative bands in app screens; the poster and the grain are for the website and the deck.',
      'Offset or overprint text, or put an offset block behind body copy.',
      'Copy a real agency mark, slogan or park poster; the landscapes are original and fictional.',
      'Use soft shadows, glows, glass or neon; every edge is a printed edge.',
      'Use more than five inks on one view.',
    ],
  },

  deck: {
    principles: [
      ['Flat layered inks', 'Three to five muted inks, solid fills, no gradients.'],
      ['Overprint, off-register', 'Where inks cross they darken, a hair out of line.'],
      ['One offset block', 'A hard 2px block in a second ink lifts the key actions.'],
    ],
    do: [
      'Print flat muted inks on cream paper.',
      'Let crossing inks overprint into a darker tone.',
      'Offset the main button and tags by 2px in a second ink.',
    ],
    dont: [
      'Use gradients, blur or soft shadows.',
      'Put grain or art inside app screens.',
      'Copy a real poster or agency mark.',
    ],
  },
});
})();
