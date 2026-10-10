/* 19 Groovy 70s — warm, wavy, joyful. Reference: 70s supergraphic stripes
   (Braniff, Ettore Sottsass era), Shrikhand / Cooper-style type, modern revivals
   (Mailchimp x Freshbooks, Burger King 2021). A warm cream canvas, a concentric
   rainbow arch (primary, secondary, accent, ink) over a centered statement in a fat
   soft display face, wavy dividers instead of straight rules, color-blocked pill
   and blob cards, a sunburst behind the CTA. Flat and curvy: no outlines, no
   offset shadows (that is Neo-Brutal Pop). */
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
  highlightNote: 'The word keeps the ink headline color and sits on a thick wavy underline in the accent (text-decoration: wavy, offset below the baseline); no fill, no band.',
  cardFill: '--ab-card-a',

  roles: {
    canvas: {
      use: 'The warm cream page (the light color pulled toward #f3e6cf) and the gaps between the rainbow bands',
      never: 'Text, or a flat white panel',
    },
    primary: {
      use: 'The fat pill CTA, the selected tab, the switch "on", the outermost rainbow band and progress fills',
      never: 'Body text, large card fills, a second CTA',
    },
    secondary: {
      use: 'The second rainbow band, the tint of the first card, status pills and the wavy divider',
      never: 'The main CTA, body text, page background',
    },
    accent: {
      use: 'The third rainbow band, the wavy underline under the headline word, the sunburst behind the CTA and the tint of the second card',
      never: 'Buttons, body text, borders',
      coverage: '≤8%',
    },
  },

  // Light canvases drift toward warm cream (#f3e6cf); dark ones toward a brown aubergine night.
  canvas(b) {
    return b.isDark ? b.mix(b.canvas, '#2a1a15', 0.5) : b.mix(b.canvas, '#f3e6cf', 0.55);
  },

  tokens(t) {
    const d = t.isDark;
    const st = typeof state !== 'undefined' ? state : null;
    const cls = st && st.headingFont ? st.headingFont.cls : '';
    return {
      '--ab-tr': ({ condensed: 0, heavy: 0, wide: 0.4, techno: 0.4 }[cls]) ?? 1,
      '--ab-hw': cls === 'groovy' ? 400 : 800,
      '--ab-card-a': t.mix(t.secondary, t.canvas, d ? 0.2 : 0.26),
      '--ab-card-b': t.mix(t.accent, t.canvas, d ? 0.2 : 0.32),
      '--ab-card-c': t.mix(t.primary, t.canvas, d ? 0.22 : 0.16),
      '--ab-track': t.mix(t.ink, t.canvas, d ? 0.14 : 0.08),
      '--ab-lift': d ? t.mix('#ffffff', t.canvas, 0.1) : t.mix('#ffffff', t.canvas, 0.62),
      '--ab-sun': t.mix(t.accent, t.canvas, d ? 0.12 : 0.2),
      '--ab-ray': t.alpha(t.accent, d ? 0.5 : 0.8),
      '--ab-ring': t.alpha(t.primary, 0.3),
      '--ab-pri-dark': t.mix('#000000', t.primary, 0.22),
    };
  },

  // The groovy rainbow: four concentric arches with straight legs, in primary,
  // secondary, accent and ink, separated by canvas gaps, around a pale sun disc.
  art(ctx) {
    const t = ctx.t;
    const bands = [t.primary, t.secondary, t.accent, t.ink];
    const w = 9, gap = 1.5;
    const arches = bands.map((c, i) => {
      const r = 100 - w / 2 - i * (w + gap);
      const x1 = 100 - r, x2 = 100 + r;
      return `<path d="M${x1} 112 V100 A${r} ${r} 0 0 1 ${x2} 100 V112" fill="none" stroke="${c}" stroke-width="${w}"/>`;
    }).join('');
    const inner = 100 - bands.length * w - (bands.length - 1) * gap;
    return `<svg viewBox="0 0 200 112" width="100%" height="100%" preserveAspectRatio="xMidYMax meet" focusable="false">
      <path d="M${100 - inner} 112 V100 A${inner} ${inner} 0 0 1 ${100 + inner} 100 V112 Z" fill="${t.mix(t.accent, t.canvas, t.isDark ? 0.12 : 0.2)}"/>
      ${arches}
    </svg>`;
  },

  materials: [
    { name: 'Rainbow arch', css: 'four concentric arches with straight legs, 9 units wide with 1.5 gaps: {primary}, {secondary}, {accent}, {ink} from the outside in; the gaps show {canvas}' },
    { name: 'Color-block card', css: 'background: {cardA}; border: 0; border-radius: 36px; box-shadow: none; /* alternate {cardA} (secondary tint), {cardB} (accent tint), {cardC} (primary tint); flat, no outline, no offset shadow */' },
    { name: 'Fat pill CTA', css: 'background: {primary}; color: {onPrimary}; border-radius: 999px; padding: 15px 26px; font-weight: 700; box-shadow: none; /* hover: scale(1.04) with a 4px {ring} halo; pressed: scale(.96) and background {priDark}; a sunburst of rays behind it: repeating-conic-gradient({accent} 0 6deg, transparent 6deg 15deg) */' },
    { name: 'Selected tab', css: 'background: {primary}; color: {onPrimary}; border-radius: 999px; /* track: {track}, radius 999 */' },
    { name: 'Field', css: 'background: {lift}; border: 0; border-radius: 999px; padding: 14px 22px; /* focus: box-shadow 0 0 0 4px {ring} */' },
    { name: 'Wavy underline', css: 'text-decoration: underline wavy {accent}; text-decoration-thickness: .09em; text-underline-offset: .14em; /* under the highlighted word, in the accent */' },
    { name: 'Wavy divider', css: 'a sine-wave line (stroke 3px, rounded) in a {primary} to {accent} to {secondary} gradient, used instead of every straight rule' },
  ],

  rules: {
    do: [
      'Build the signature from concentric arches in primary, secondary, accent and ink, with canvas gaps between bands and straight legs.',
      'Set the headline in a fat, soft display face, tight, and put the highlighted word on a thick wavy accent underline.',
      'Use pills and blobs only (radius full or 36px), flat color blocks, and wavy dividers instead of straight rules.',
      'Keep the canvas warm cream and put a sunburst of accent rays behind the one main action.',
    ],
    dont: [
      'Add outlines, offset shadows or stickers; that is Neo-Brutal Pop.',
      'Use straight horizontal rules, sharp corners or cool grey surfaces.',
      'Set body copy in the fat display face or tighten the display face past -0.03em.',
      'Spread the rainbow into small UI chrome; it appears once per view, as the arch.',
    ],
  },
});
