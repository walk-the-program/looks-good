/* 19 Groovy 70s — warm, wavy, joyful. References: Barbara Stauffacher Solomon's
   Sea Ranch supergraphics (flat solid bands, no tints), Girard's Braniff, Glaser's
   Dylan poster, Burger King 2021. A warm cream canvas; a supergraphic arch of six
   SOLID bands in a FIXED earth ramp (brown, burnt orange, orange, harvest gold,
   avocado) with the client primary as the one brand band, the inside left as
   canvas and "far out" lettered along the inner curve (SVG textPath). The fat
   soft headline sits below the arch (never straddling it), echoed in stepped
   band contours. Wavy dividers, solid colour blocks, corner-turning stripe frames,
   a solid sunburst behind the CTA, a faint print grain. Hard black outlines /
   one-colour drop shadows / stickers are Neo-Brutal Pop. */
(function () {
// The fixed 70s earth ramp (art, stripes, patterns). The client primary is only the
// CTA and one arch band, never the whole ramp.
const GV_EARTH = { brown: '#6E3421', burnt: '#C8471E', orange: '#E38B1F', gold: '#F2B62A', avocado: '#8C8F2A' };
// Arch bands, outermost first: brown, the brand primary, burnt orange, orange, harvest gold, avocado.
let gvSeq = 0;
function gvBands(t) {
  return [GV_EARTH.brown, t.primary, GV_EARTH.burnt, GV_EARTH.orange, GV_EARTH.gold, GV_EARTH.avocado];
}
registerAesthetic({
  key: 'groovy-70s', order: 19,
  name: 'Groovy 70s',
  descriptor: 'Warm · Wavy · Joyful',
  influences: '1970s psychedelia / Supergraphics / Retro packaging',
  summary: 'Warm cream, fat soft type and concentric rainbow bands.',
  motto: 'Good vibes, printed.',
  kicker: 'Far out',
  mode: 'light',
  slideShape: 'soft',
  labels: { material: 'Waves', states: ['Rest', 'Hover', 'Pressed'], statesKind: 'button' },
  layout: { hero: 'centered', palette: 'strips', sections: 'two-col' },
  type: { ui: 'body', label: 'body', display: 0.96 },
  highlight: 'custom',
  highlightNote: 'The whole headline carries a stepped band-colour echo (text-shadow: cream gap, harvest gold, cream gap, primary); the highlighted word turns primary and its echo is inverted (gold then ink). No fill, no band, no underline.',
  cardFill: '--ab-card-a',

  roles: {
    canvas: {
      use: 'The warm cream page (the light color pulled toward #f3e6cf), the gaps between the arch bands and the gap colour inside the headline echo',
      never: 'Text, or a flat white panel',
    },
    primary: {
      use: 'The fat pill CTA, the selected tab, the switch "on", the one brand band of the arch (second from outside), the solid first in-use row and progress fills',
      never: 'Body text, a second CTA, the 02 panel fill',
    },
    secondary: {
      use: 'A counter-colour used sparingly: a status dot or the "Launch" avatar; never an arch band (the arch is the fixed earth ramp plus the primary)',
      never: 'The main CTA, body text, page background',
    },
    accent: {
      use: 'The sunburst behind the CTA and the footer dot; the arch, echo and stripes print in the fixed earth ramp',
      never: 'Buttons, body text, borders',
      coverage: '≤10%',
    },
  },

  // Light canvases drift toward warm cream (#f3e6cf); dark ones toward a brown aubergine night.
  canvas(b) {
    return b.isDark ? b.mix(b.canvas, '#2a1a15', 0.5) : b.mix(b.canvas, '#f3e6cf', 0.55);
  },

  tokens(t, vs) {
    const d = t.isDark;
    const priDark = t.mix('#000000', t.primary, 0.22);
    // b1..b5: brown, the brand primary, burnt orange, harvest gold, avocado (fixed earth + one brand band)
    const ramp = [GV_EARTH.brown, t.primary, GV_EARTH.burnt, GV_EARTH.gold, GV_EARTH.avocado];
    const st = vs || (typeof state !== 'undefined' ? state : null);
    const cls = st && st.headingFont ? st.headingFont.cls : '';
    // three stacked waves (3px strokes, 3px apart) in the brand colours, as an SVG tile for the header and footer stripes
    const wave = (y, c) => `<path d="M0 ${y} Q10 ${y - 7} 20 ${y} T40 ${y}" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`;
    const inkWave = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="12" viewBox="0 0 40 12"><path d="M0 6 Q10 -1 20 6 T40 6" fill="none" stroke="${t.ink}" stroke-opacity="0.28" stroke-width="3" stroke-linecap="round"/></svg>`;
    const waveSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="24" viewBox="0 0 40 24">${wave(6, ramp[1])}${wave(12, ramp[2])}${wave(18, ramp[3])}</svg>`;
    return {
      '--ab-wave3': 'url(data:image/svg+xml,' + encodeURIComponent(waveSvg).replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/'/g, '%27') + ')',
      '--ab-wave-ink': t.alpha(t.ink, 0.28),
      // the single ink wave as a plain background image (no CSS mask: exports drop masks)
      '--gv-wave-ink': 'url(data:image/svg+xml,' + encodeURIComponent(inkWave).replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/'/g, '%27') + ')',
      '--ab-kraft': d ? t.mix('#5a4426', t.canvas, 0.45) : t.mix('#e9d6ae', t.canvas, 0.35),
      // the heading face's heaviest real weight up to 800 (900 for Fraunces); the 'groovy' display faces stay at 400
      '--ab-hw': cls === 'groovy' ? 400 : abWeight(st && st.headingFont, st && st.headingFont && st.headingFont.name === 'Fraunces' ? 900 : 800),
      '--gv-gold': GV_EARTH.gold, '--gv-brown': GV_EARTH.brown,
      '--ab-card-a': t.mix(GV_EARTH.brown, t.canvas, d ? 0.3 : 0.18),   // deck card fill: an earth tint
      '--ab-card-b': t.mix(t.accent, t.canvas, d ? 0.2 : 0.32),   // accent tint: small pills only (the tag), never a panel
      '--ab-card-c': t.mix(t.accent, t.canvas, d ? 0.22 : 0.4),
      '--ab-b1': ramp[0], '--ab-b2': ramp[1], '--ab-b3': ramp[2], '--ab-b4': ramp[3], '--ab-b5': ramp[4],
      '--ab-on-b1': t.readable(ramp[0]), '--ab-on-b2': t.readable(ramp[1]), '--ab-on-b3': t.readable(ramp[2]), '--ab-on-b4': t.readable(ramp[3]), '--ab-on-b5': t.readable(ramp[4]),
      '--ab-track': t.mix(t.ink, t.canvas, d ? 0.14 : 0.08),
      '--ab-lift': d ? t.mix('#ffffff', t.canvas, 0.1) : t.mix('#ffffff', t.canvas, 0.62),
      '--ab-sun': t.mix(t.accent, t.canvas, d ? 0.12 : 0.2),
      '--ab-ray': t.alpha(t.accent, d ? 0.5 : 0.8),
      '--ab-ring': t.alpha(t.primary, 0.3),
      '--ab-pri-dark': priDark,
      // label on the pressed (darker) pill: whichever of the readable picks, white or near-black reads best
      '--gv-on-pri-dark': [t.readable(priDark), '#ffffff', '#141414'].sort((a, b) => t.contrast(b, priDark) - t.contrast(a, priDark))[0],
    };
  },

  // The supergraphic arch: six SOLID concentric bands with straight legs (no tints),
  // canvas gaps, the inside left as canvas, and "far out" lettered along the inner curve.
  art(ctx) {
    const bands = gvBands(ctx.t);
    const w = 6.6, gap = 1.3;
    const arches = bands.map((c, i) => {
      const r = 100 - w / 2 - i * (w + gap);
      return `<path d="M${100 - r} 112 V100 A${r} ${r} 0 0 1 ${100 + r} 100 V112" fill="none" stroke="${c}" stroke-width="${w}"/>`;
    }).join('');
    const inner = 100 - bands.length * w - (bands.length - 1) * gap;
    const tr = inner - 5.2;
    const word = 'far out · far out · far out';
    const id = `gva-in-${++gvSeq}`;
    return `<svg class="gva" viewBox="0 0 200 112" width="100%" height="100%" preserveAspectRatio="xMidYMax meet" focusable="false">
      <defs><path id="${id}" d="M${100 - tr} 100 A${tr} ${tr} 0 0 1 ${100 + tr} 100"/></defs>
      ${arches}
      <text class="gva-t" fill="${ctx.t.ink}" font-size="4.1" letter-spacing="0.82" text-anchor="middle"><textPath href="#${id}" startOffset="50%">${word}</textPath></text>
    </svg>`;
  },

  materials: [
    { name: 'Earth-ramp arch', css: 'six SOLID concentric bands with straight legs (no tints), from the outside in: #6E3421 brown, {primary} (the one brand band), #C8471E burnt orange, #E38B1F orange, #F2B62A harvest gold, #8C8F2A avocado; canvas gaps; the inside is canvas with "far out" lettered along the inner curve' },
    { name: 'Headline echo', css: 'letter-spacing: -0.035em; text-shadow: .035em .035em 0 {canvas}, .07em .07em 0 #F2B62A, .105em .105em 0 {canvas}, .14em .14em 0 {primary}; /* cream gap, harvest gold, cream gap, primary; on phones two layers only; the headline sits BELOW the arch, never straddling its feet */' },
    { name: 'Solid colour block', css: 'background: {b1}; color: {onB1}; border: 0; border-radius: 36px; box-shadow: none; /* the 02 panel and the in-use rows are SOLID band colours ({b2} primary, {b4} accent, {b1} brown) with cream or dark text chosen for contrast, never a 20% tint */' },
    { name: 'Stripe-framed panel', css: 'background: {lift}; border-radius: 36px; box-shadow: 0 0 0 5px {b2}, 0 0 0 8px {canvas}, 0 0 0 13px {b4}, 0 0 0 16px {canvas}, 0 0 0 21px {b1}; /* the 01 card: cream panel framed by concentric stripes that turn the corners (Stauffacher supergraphic) */' },
    { name: 'Fat pill CTA', css: 'background: {primary}; color: {onPrimary}; border-radius: 999px; padding: 15px 26px; font-weight: 700; box-shadow: none; /* hover: scale(1.04) with a 4px {ring} halo; pressed: scale(.96) and background {priDark}; a solid sunburst rising behind it from the card edge: repeating-conic-gradient(from -90deg at 50% 100%, {accent} 0 9deg, transparent 9deg 18deg) */' },
    { name: 'Selected tab', css: 'background: {primary}; color: {onPrimary}; border-radius: 999px; /* track: {track}, radius 999 */' },
    { name: 'Field', css: 'background: {lift}; border: 0; border-radius: 999px; padding: 14px 22px; /* focus: box-shadow 0 0 0 4px {ring} */' },
    { name: 'Wavy divider', css: 'a sine-wave line (stroke 3px, rounded) in one flat color ({waveInk}, ink at 28%) instead of every straight rule; never a gradient through the hues' },
    { name: 'Wave stripe', css: 'three stacked waves, 3px strokes 3px apart, in {b2}, {b3} and {b4}; only under the header and above the footer' },
    { name: 'Print grain', css: 'a faint feTurbulence speckle over the whole board at about 7% opacity, so flat colour reads as ink on paper' },
  ],

  rules: {
    do: [
      'Build the signature from six solid concentric bands in the fixed earth ramp (brown, burnt orange, orange, harvest gold, avocado) plus the brand primary as one band; canvas gaps, straight legs, no tints.',
      'Set the headline in a fat, soft display face, tight, and echo it in 2-3 stepped band-colour contours separated by cream gaps; the highlighted word turns primary.',
      'Use SOLID colour blocks and cream panels framed by concentric stripes that turn the corners; pills only for controls. Keep wavy dividers; the wave stripe appears twice, under the header and above the footer.',
      'Keep the canvas warm cream, add a faint print grain, and raise a solid sunburst of accent rays from the edge behind the one main action.',
    ],
    dont: [
      'Draw hard black outlines, hard one-colour drop shadows or stickers; that is Neo-Brutal Pop. Stepped band-colour contours with cream gaps are the period lettering and are fine.',
      'Use straight horizontal rules, sharp corners, cool grey surfaces or pastel tints, in the arch or on cards.',
      'Let the headline straddle the arch; it sits below it, or is lettered along the curve.',
      'Set body copy in the fat display face or tighten the display face past -0.04em.',
      'Spread the rainbow into small UI chrome or pill every control; use a cool client colour in the ramp.',
    ],
  },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    coverDisplay: 0.55,
    coverBand: false,
    // In product: an LP sleeve. A square sleeve with the solid arch and the brand lettered
    // along the curve, the record sliding out, and a printed track list beside it.
    product(ctx) {
      const e = ctx.e;
      const bands = gvBands(ctx.t);
      const w = 4.6, gap = 1;
      const arcs = bands.map((c, i) => {
        const r = 40 - w / 2 - i * (w + gap);
        return `<path d="M${50 - r} 94 V74 A${r} ${r} 0 0 1 ${50 + r} 74 V94" fill="none" stroke="${c}" stroke-width="${w}"/>`;
      }).join('');
      const id = `gvp-${++gvSeq}`;
      const name = e(String(ctx.brandName || 'Studio'));
      const tracks = (ctx.rows || []).map((r, i) => `<li><b>A${i + 1}</b><span>${e(r[0])}</span><em>${e(String(r[2]))}%</em></li>`).join('');
      return `<div class="gvp">
        <div class="gvp-pack" aria-hidden="true">
          <svg class="gvp-disc" viewBox="0 0 100 100" focusable="false"><circle cx="50" cy="50" r="49" fill="#1d1612"/><circle cx="50" cy="50" r="40" fill="none" stroke="#3a2e27" stroke-width="0.6"/><circle cx="50" cy="50" r="32" fill="none" stroke="#3a2e27" stroke-width="0.6"/><circle cx="50" cy="50" r="17" fill="${ctx.t.primary}"/><circle cx="50" cy="50" r="2" fill="#1d1612"/></svg>
          <svg class="gvp-sleeve" viewBox="0 0 100 100" focusable="false">
            <rect width="100" height="100" fill="${ctx.t.isDark ? '#F3E6CF' : ctx.t.canvas}"/>
            <defs><path id="${id}" d="M7 74 A43 43 0 0 1 93 74"/></defs>
            ${arcs}
            <text class="gvp-t" font-size="7.4" fill="#2a1a15" text-anchor="middle"><textPath href="#${id}" startOffset="50%">${name}</textPath></text>
            <text class="gvp-t" x="7" y="10" font-size="3.8" fill="#2a1a15">good vibes, printed.</text><text class="gvp-t" x="93" y="10" font-size="3.8" fill="#2a1a15" text-anchor="end">LP · 33⅓</text>
          </svg>
        </div>
        <div class="gvp-back">
          <p class="gvp-label">Side A · 33⅓ rpm</p>
          <h3 class="gvp-title ab-headline">Good vibes, printed.</h3>
          <ol class="gvp-tracks">${tracks}</ol>
        </div>
      </div>`;
    },
    principles: [
      ['Warm, wavy, joyful', 'Cream canvas, fat soft type, a solid earth-ramp arch.'],
      ['Echoed type, solid blocks', 'Stepped band contours on the headline; solid colour, never pastel tint.'],
      ['One arch per view', 'The arch appears once, with a solid sunburst rising behind the action.'],
    ],
    do: [
      'Build the signature from an earth-ramp arch.',
      'Echo the headline in 2-3 stepped band contours.',
      'Use solid colour blocks and corner-turning stripes.',
    ],
    dont: [
      'Add hard black outlines or stickers.',
      'Use straight rules, sharp corners or pastel tints.',
      'Spread the rainbow into small UI chrome.',
    ],
  },
});
})();
