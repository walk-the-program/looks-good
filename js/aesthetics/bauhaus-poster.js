/* 08 Bauhaus Poster — constructive, flat, rhythmic. No shadows, no gradients,
   no blur anywhere. References: Joost Schmidt's 1923 Ausstellung poster,
   Moholy-Nagy's Bauhausbücher covers, Müller-Brockmann's "der Film". The poster
   runs on a diagonal: a constructed hero (one huge red circle crossed by a black
   bar at -24deg, an off-axis yellow square, a thin rule), an ink bar at -12deg
   behind the headline, a solid red kicker bar. The poster inks are FIXED
   primaries (BP_INKS: red, yellow, blue, black on paper) for art, highlight and
   kicker; the client primary drives only the CTA, selection and switch. UI
   controls are square or fully round, 2px ink borders. */

// The fixed Bauhaus poster inks. Art, the highlight word, the kicker bar and the
// palette-free poster marks use these, never the client palette.
const BP_INKS = { red: '#D7332A', yellow: '#F2C230', blue: '#1F4FA2', black: '#151515', paper: '#F1ECE2' };

// The constructed poster SVG; `notes` adds the dimension annotations (deck Material slide).
// On a dark canvas the black marks reverse to paper (a reversed print), so the bar still reads.
function bpPoster(ctx, notes) {
  const K = ctx.t && ctx.t.isDark ? Object.assign({}, BP_INKS, { black: BP_INKS.paper }) : BP_INKS;
  const ann = notes ? `<g fill="${K.black}" font-size="3.1" font-weight="600" letter-spacing="0.3" class="bpa-note">
      <line x1="13" y1="18" x2="75" y2="18" stroke="${K.black}" stroke-width="0.35"/><line x1="13" y1="16.5" x2="13" y2="19.5" stroke="${K.black}" stroke-width="0.35"/><line x1="75" y1="16.5" x2="75" y2="19.5" stroke="${K.black}" stroke-width="0.35"/>
      <text x="44" y="15.5" text-anchor="middle">Ø 0.62</text>
      <text x="4" y="73">−24°</text>
      <text x="66" y="95.5">0.28 □</text>
      <text x="4" y="96">BAR 0.09</text>
    </g>` : '';
  return `<svg class="bpa" viewBox="0 0 100 100" width="100%" height="100%" focusable="false" shape-rendering="geometricPrecision">
      <circle cx="44" cy="49" r="31" fill="${K.red}"/>
      <rect x="62" y="64" width="28" height="28" fill="${K.yellow}"/>
      <path d="M8 86 A9 9 0 0 1 26 86 Z" fill="${K.blue}"/>
      <rect x="-12" y="45.5" width="124" height="9" fill="${K.black}" transform="rotate(-24 50 50)"/>
      <rect x="-12" y="63" width="124" height="0.9" fill="${K.black}" transform="rotate(-24 50 50)"/>
      ${ann}
    </svg>`;
}

// In product: an exhibition wall. Three posters at different scales hung on one rail,
// each printed in the fixed inks on paper, with a caption under it.
function bpWall(ctx) {
  const K = BP_INKS;
  const e = ctx.e;
  const name = e(String(ctx.brandName || 'studio').toLowerCase());
  const y = new Date().getFullYear();
  const p1 = `<svg viewBox="0 0 100 141" focusable="false"><rect width="100" height="141" fill="${K.paper}"/>
      <circle cx="46" cy="58" r="31" fill="${K.red}"/><rect x="62" y="74" width="28" height="28" fill="${K.yellow}"/>
      <rect x="-14" y="54" width="128" height="9" fill="${K.black}" transform="rotate(-24 50 58)"/>
      <rect x="8" y="112" width="84" height="1.4" fill="${K.black}"/>
      <text x="8" y="126" font-size="9.5" font-weight="600" fill="${K.black}" class="bpw-t">${name}</text>
      <text x="8" y="135" font-size="4.2" font-weight="600" letter-spacing="0.6" fill="${K.black}" class="bpw-t">AUSSTELLUNG ${y}</text></svg>`;
  const p2 = `<svg viewBox="0 0 100 141" focusable="false"><rect width="100" height="141" fill="${K.paper}"/>
      <rect x="0" y="0" width="22" height="141" fill="${K.red}"/>
      <circle cx="62" cy="52" r="26" fill="${K.black}"/><rect x="40" y="86" width="44" height="44" fill="${K.blue}" transform="rotate(12 62 108)"/>
      <text x="16" y="132" font-size="8" font-weight="600" fill="#FFFFFF" transform="rotate(-90 16 132)" class="bpw-t">form follows rhythm</text></svg>`;
  const p3 = `<svg viewBox="0 0 100 141" focusable="false"><rect width="100" height="141" fill="${K.paper}"/>
      <path d="M10 70 A40 40 0 0 1 90 70 Z" fill="${K.yellow}"/><rect x="10" y="70" width="80" height="10" fill="${K.black}"/>
      <rect x="44" y="84" width="12" height="48" fill="${K.red}"/>
      <text x="10" y="30" font-size="22" font-weight="600" fill="${K.black}" class="bpw-t">${e(ctx.initial)}</text></svg>`;
  const cap = (n, t) => `<p class="bpw-cap"><b>${n}</b> ${t}</p>`;
  return `<div class="bpw">
      <figure class="bpw-p bpw-p1">${p1}${cap('01', 'Exhibition poster · A1')}</figure>
      <figure class="bpw-p bpw-p2">${p2}${cap('02', 'Lecture series · A2')}</figure>
      <figure class="bpw-p bpw-p3">${p3}${cap('03', 'Workshop card · A4')}</figure>
      <i class="bpw-rail" aria-hidden="true"></i>
    </div>`;
}

registerAesthetic({
  key: 'bauhaus-poster', order: 8,
  name: 'Bauhaus Poster',
  descriptor: 'Constructive · Flat · Rhythmic',
  influences: 'Bauhaus 1923 / Constructivism / Swiss poster',
  summary: 'Flat geometry, hard ink lines and loud type, composed like a poster.',
  motto: 'Form follows rhythm.',
  kicker: 'Constructed',
  mode: 'light',
  slideShape: 'minimal',
  labels: { material: 'Form', states: ['Rest', 'Hover', 'Pressed'], statesKind: 'button' },
  layout: { hero: 'poster', palette: 'swatches' },
  type: { ui: 'sans', label: 'sans', display: 1.4 },
  highlight: 'custom',
  highlightNote: 'The highlight word changes colour as a whole word, to the fixed poster red; no plane, no band.',

  tokens(t) {
    // The poster red as text: the fixed red where it reads (>= 3:1 at display size), else a lighter or darker red.
    const reds = [BP_INKS.red, '#EE4B3F', '#B8231C', '#F26A5E'];
    const redText = reds.find(c => t.contrast(c, t.canvas) >= 3) || t.ink;
    return {
      '--ab-type-pick-w': 600,
      '--bp-red': BP_INKS.red, '--bp-yellow': BP_INKS.yellow, '--bp-blue': BP_INKS.blue, '--bp-black': BP_INKS.black, '--bp-paper': BP_INKS.paper,
      '--bp-red-text': redText,
    };
  },

  roles: {
    primary: {
      use: 'The one flat CTA block, the selected segment and the "on" switch (never the poster art, which prints in fixed primaries)',
      never: 'Body text, borders, a second CTA',
    },
    secondary: {
      use: 'Small UI marks only: the palette quarter circle and the status outline; the poster art prints in the fixed primaries',
      never: 'The main CTA, body text, page background, the poster art',
      coverage: '≈10–15%',
    },
    accent: {
      use: 'One spark in the UI: the footer dot and the palette semicircle (the highlight word prints in the fixed poster red)',
      never: 'Buttons, body text, borders, large fills, the poster art',
      coverage: '≤5%',
    },
  },

  // A constructed poster in the fixed inks (never the client palette): one big red
  // circle (diameter 0.62 x width), a black bar crossing it at -24deg (0.09 x width),
  // an off-axis yellow square (0.28 x width), a small blue half-disc and a thin
  // rule parallel to the bar. Flat fills: no strokes on shapes, no shadows.
  art(ctx) {
    return bpPoster(ctx, false);
  },

  materials: [
    { name: 'Constructed poster (art)', css: 'fixed inks, never the client palette: red #D7332A circle (0.62 x width), black #151515 bar at -24deg (0.09 x width), yellow #F2C230 square (0.28 x width) off-axis, blue #1F4FA2 half-disc, thin black rule; flat fills, no outlines, on paper #F1ECE2 or the canvas' },
    { name: 'Diagonal bar', css: 'background: {ink}; height: clamp(10px, 1.6cqw, 20px); width: 120%; transform: rotate(-12deg); /* behind the headline; the board leans on it */' },
    { name: 'Control (UI)', css: 'background: {canvas}; border: 2px solid {ink}; border-radius: 0; color: {ink}; /* or border-radius: 999px; never in between */' },
    { name: 'Primary action', css: 'background: {primary}; color: {onPrimary}; border: 2px solid {ink}; border-radius: 0; /* ends in an ink circle holding the arrow: background {ink}; color {canvas}; border-radius: 50%. Hover: background {ink}, color {canvas}; pressed: background {canvas}, color {ink}, translate(2px, 2px) */' },
    { name: 'Highlight word', css: 'color: #D7332A; /* the whole word changes to the fixed poster red; no plane, no band, no outline */' },
    { name: 'Kicker bar', css: 'background: #D7332A; color: #FFFFFF; width: 28px; writing-mode: vertical-rl; font: 800 12px/1 sans-serif; text-transform: uppercase; letter-spacing: .3em;' },
    { name: 'Palette shapes', css: 'one geometric form per role in a 1:1 box, max 96px, flat fill, no shadow: canvas = square with a 2px {ink} border, ink = circle, primary = circle, secondary = quarter circle (border-radius: 100% 0 0 0), accent = semicircle (half height, bottom aligned).' },
    { name: 'Selected segment', css: 'background: {primary}; color: {onPrimary}; border: 2px solid {ink}; border-radius: 0; /* unselected: background {canvas}; color {ink} */' },
    { name: 'Field', css: 'background: transparent; border: 0; border-bottom: 3px solid {ink}; border-radius: 0; text-transform: uppercase; font-weight: 700;' },
    { name: 'Switch', css: 'track: 2px solid {ink}, border-radius 0, background {canvas} (off) or {primary} (on); knob: circle, background {ink}.' },
  ],

  rules: {
    do: [
      'Construct the poster from a few huge primitives (one circle at 60% of the sheet, a bar, a square) set on a diagonal; flat fills, no outlines.',
      'Print the poster in fixed primaries (red, yellow, blue, black on paper); the client palette is for the interface.',
      'Make every control either square (radius 0) or fully round; nothing in between.',
      'Draw every UI control and panel with a 2px ink border and set headlines in huge, tight lowercase (card titles and list names stay uppercase).',
      'Emphasise with a bar, a rule or a whole-word colour change; never a highlighter plane.',
    ],
    dont: [
      'Use shadows, gradients, blur, glow or blend modes anywhere; depth comes from overlap only.',
      'Round corners to 4, 8 or 12px; pick square or fully round.',
      'Fill panels, cards or buttons with secondary or accent.',
      'Tile small quarter-circle mosaics or op-art rings; that is print-on-demand Bauhaus, not the canon.',
    ],
  },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    coverDisplay: 0.94,
    coverBand: false,
    materialArt(ctx) { return bpPoster(ctx, true); },
    product(ctx) { return bpWall(ctx); },
    principles: [
      ['Constructed on a diagonal', 'One huge circle, a crossing bar, an off-axis square.'],
      ['Fixed primaries on paper', 'Red, yellow, blue and black print the poster.'],
      ['Loud, tight lowercase headlines', 'Emphasis is a bar or a whole word in red.'],
    ],
    do: [
      'Set the poster on a diagonal.',
      'Print art in red, yellow, blue and black.',
      'Make every control square or fully round.',
    ],
    dont: [
      'Use shadows, gradients or blur.',
      'Tile quarter-circle mosaics or op-art rings.',
      'Paint the poster in the client palette.',
    ],
  },
});
