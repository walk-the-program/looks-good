/* 19 Groovy 70s — warm, wavy, joyful. Reference: 70s supergraphic stripes
   (Braniff, Stauffacher Solomon / Sea Ranch), Stripes-lettering and Cooper-weight
   type, modern revivals (Burger King 2021). A warm cream canvas, a concentric arch
   in an EARTH RAMP derived from the brand (brown, primary, a primary-accent
   midtone, accent, pale accent) over a centered statement in a fat soft display face
   whose headline is echoed in 2-3 stepped band-colour contours (the multiline 70s
   lettering), wavy dividers, SOLID colour blocks and corner-turning stripe frames
   instead of pastel pills, a solid sunburst rising behind the CTA, a faint print grain.
   Hard black outlines / one-colour hard drop shadows / stickers are still Neo-Brutal
   Pop; stepped band contours with cream gaps are the period lettering. */
(function () {
// Earth ramp: outermost band darkest, then primary, a primary-accent midtone, accent
// and a pale accent. A secondary within 60deg of the primary replaces the midtone;
// a far (cool) secondary is dropped from the arch.
function gvRamp(t) {
  const d = t.isDark;
  const near = typeof hueDiff === 'function' && typeof hexToHsl === 'function'
    ? hueDiff(hexToHsl(t.primary).h, hexToHsl(t.secondary).h) <= 60 : false;
  const mid = near ? t.secondary : t.mix(t.primary, t.accent, 0.5);
  const brown = d ? t.mix(t.primary, '#1c0f0b', 0.55) : t.mix(t.primary, t.ink, 0.45);
  const pale = d ? t.mix(t.accent, t.ink, 0.55) : t.mix(t.accent, t.canvas, 0.45);
  return [brown, t.primary, mid, t.accent, pale];
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
  highlightNote: 'The whole headline carries a stepped band-colour echo (text-shadow: cream gap, accent, cream gap, primary); the highlighted word turns primary and its echo is inverted (accent then ink). No fill, no band, no underline.',
  cardFill: '--ab-card-a',

  roles: {
    canvas: {
      use: 'The warm cream page (the light color pulled toward #f3e6cf), the gaps between the arch bands and the gap colour inside the headline echo',
      never: 'Text, or a flat white panel',
    },
    primary: {
      use: 'The fat pill CTA, the selected tab, the switch "on", the second arch band (after the brown outer band), the solid first in-use row and progress fills',
      never: 'Body text, a second CTA, the 02 panel fill',
    },
    secondary: {
      use: 'A cool counter-colour used sparingly: a status dot or the "Launch" avatar; it is not an arch band unless its hue sits within 60° of the primary',
      never: 'The main CTA, body text, page background',
    },
    accent: {
      use: 'The fourth arch band, the headline echo, the sunburst behind the CTA, the solid second in-use row and the third wave in the header and footer stripes',
      never: 'Buttons, body text, borders',
      coverage: '≤10%',
    },
  },

  // Light canvases drift toward warm cream (#f3e6cf); dark ones toward a brown aubergine night.
  canvas(b) {
    return b.isDark ? b.mix(b.canvas, '#2a1a15', 0.5) : b.mix(b.canvas, '#f3e6cf', 0.55);
  },

  tokens(t) {
    const d = t.isDark;
    const ramp = gvRamp(t);
    const st = typeof state !== 'undefined' ? state : null;
    const cls = st && st.headingFont ? st.headingFont.cls : '';
    // three stacked waves (3px strokes, 3px apart) in the brand colours, as an SVG tile for the header and footer stripes
    const wave = (y, c) => `<path d="M0 ${y} Q10 ${y - 7} 20 ${y} T40 ${y}" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`;
    const waveSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="24" viewBox="0 0 40 24">${wave(6, ramp[1])}${wave(12, ramp[2])}${wave(18, ramp[3])}</svg>`;
    return {
      '--ab-wave3': 'url(data:image/svg+xml,' + encodeURIComponent(waveSvg).replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/'/g, '%27') + ')',
      '--ab-wave-ink': t.alpha(t.ink, 0.28),
      '--ab-kraft': d ? t.mix('#5a4426', t.canvas, 0.45) : t.mix('#e9d6ae', t.canvas, 0.35),
      '--ab-hw': cls === 'groovy' ? 400 : (st && st.headingFont && st.headingFont.name === 'Fraunces' ? 900 : 800),
      '--ab-card-a': t.mix(t.primary, t.canvas, d ? 0.22 : 0.22),   // deck card fill: an earth tint of the primary
      '--ab-card-b': t.mix(t.accent, t.canvas, d ? 0.2 : 0.32),   // accent tint: small pills only (the tag), never a panel
      '--ab-card-c': t.mix(t.accent, t.canvas, d ? 0.22 : 0.4),
      '--ab-b1': ramp[0], '--ab-b2': ramp[1], '--ab-b3': ramp[2], '--ab-b4': ramp[3], '--ab-b5': ramp[4],
      '--ab-on-b1': t.readable(ramp[0]), '--ab-on-b2': t.readable(ramp[1]), '--ab-on-b3': t.readable(ramp[2]), '--ab-on-b4': t.readable(ramp[3]), '--ab-on-b5': t.readable(ramp[4]),
      '--gv-disc': t.mix(t.accent, t.canvas, d ? 0.12 : 0.2),
      '--ab-track': t.mix(t.ink, t.canvas, d ? 0.14 : 0.08),
      '--ab-lift': d ? t.mix('#ffffff', t.canvas, 0.1) : t.mix('#ffffff', t.canvas, 0.62),
      '--ab-sun': t.mix(t.accent, t.canvas, d ? 0.12 : 0.2),
      '--ab-ray': t.alpha(t.accent, d ? 0.5 : 0.8),
      '--ab-ring': t.alpha(t.primary, 0.3),
      '--ab-pri-dark': t.mix('#000000', t.primary, 0.22),
    };
  },

  // The groovy arch: five concentric arches with straight legs in the earth ramp (outermost
  // darkest), separated by canvas gaps, around a pale sun disc. The accent band sits 0.6/0.4
  // units off register, like a slightly misaligned print plate.
  art(ctx) {
    const t = ctx.t;
    const bands = gvRamp(t);
    const w = 8, gap = 1.5;
    const arches = bands.map((c, i) => {
      const r = 100 - w / 2 - i * (w + gap);
      const x1 = 100 - r, x2 = 100 + r;
      const reg = i === 3 ? ' transform="translate(0.6 0.4)"' : '';
      return `<path d="M${x1} 112 V100 A${r} ${r} 0 0 1 ${x2} 100 V112" fill="none" stroke="${c}" stroke-width="${w}"${reg}/>`;
    }).join('');
    const inner = 100 - bands.length * w - (bands.length - 1) * gap;
    return `<svg viewBox="0 0 200 112" width="100%" height="100%" preserveAspectRatio="xMidYMax meet" focusable="false">
      <path d="M${100 - inner} 112 V100 A${inner} ${inner} 0 0 1 ${100 + inner} 100 V112 Z" fill="${t.mix(t.accent, t.canvas, t.isDark ? 0.12 : 0.2)}"/>
      ${arches}
    </svg>`;
  },

  materials: [
    { name: 'Earth-ramp arch', css: 'five concentric arches with straight legs, 8 units wide with 1.5 gaps, from the outside in: {b1} (brown), {b2} (primary), {b3} (rust-orange midtone), {b4} (accent), {b5} (pale accent); the gaps show {canvas}; the accent band sits 0.6 units off register' },
    { name: 'Headline echo', css: 'letter-spacing: -0.035em; text-shadow: .035em .035em 0 {canvas}, .07em .07em 0 {accent}, .105em .105em 0 {canvas}, .14em .14em 0 {primary}; /* the stepped multiline lettering: cream gap, accent, cream gap, primary; the highlighted word turns {primary} with its echo inverted (accent, then ink) */' },
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
      'Build the signature from concentric arches in an earth ramp derived from the brand (brown, primary, a midtone, accent, pale accent), outermost darkest, with canvas gaps between bands and straight legs.',
      'Set the headline in a fat, soft display face, tight, and echo it in 2-3 stepped band-colour contours separated by cream gaps; the highlighted word turns primary.',
      'Use SOLID colour blocks and cream panels framed by concentric stripes that turn the corners; pills only for controls. Keep wavy dividers; the wave stripe appears twice, under the header and above the footer.',
      'Keep the canvas warm cream, add a faint print grain, and raise a solid sunburst of accent rays from the edge behind the one main action.',
    ],
    dont: [
      'Draw hard black outlines, hard one-colour drop shadows or stickers; that is Neo-Brutal Pop. Stepped band-colour contours with cream gaps are the period lettering and are fine.',
      'Use straight horizontal rules, sharp corners, cool grey surfaces or 20% pastel tints for cards.',
      'Set body copy in the fat display face or tighten the display face past -0.04em.',
      'Spread the rainbow into small UI chrome, or use a literal cool client colour as an arch band.',
    ],
  },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    principles: [
      ['Warm, wavy, joyful', 'Cream canvas, fat soft type, an earth-ramp arch.'],
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
