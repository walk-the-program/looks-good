/* 08 Bauhaus Poster — constructive, flat, rhythmic. No shadows, no gradients,
   no blur anywhere: geometry only (circles, half and quarter circles,
   rectangles, 45° and -15° diagonals), 2px ink borders, controls that are
   either square or fully round. Secondary and accent may be large planes in
   the art only; the UI keeps the universal role rules. */
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
  labels: { material: 'Form', states: ['Flat', 'Outlined', 'Filled'] },

  roles: {
    primary: {
      use: 'The one flat CTA block, the selected segment, the "on" switch, and the main circle of the art',
      never: 'Body text, borders, a second CTA',
    },
    secondary: {
      use: 'Large planes inside the art only (the quarter circle); in the UI, only small tags and status chips',
      never: 'The main CTA, body text, page background, large planes in the interface',
      coverage: '≈10–15%, more in art',
    },
    accent: {
      use: 'Large planes inside the art only (the half circle); in the UI, one spark: the highlighted headline word and the footer dot',
      never: 'Buttons, body text, borders, large fills in the interface',
      coverage: '≤5%, more in art',
    },
  },

  art(ctx) {
    const t = ctx.t;
    const ln = `stroke="${t.ink}" stroke-width="1.3"`;
    // Flat shapes only. Later elements sit on earlier ones (no blend modes).
    return `<svg viewBox="0 0 100 100" width="100%" height="100%" focusable="false">
      <path d="M100 42 A58 58 0 0 0 42 100 L100 100 Z" fill="${t.secondary}" ${ln}/>
      <path d="M61 27 A20 20 0 0 1 101 27 Z" fill="${t.accent}" ${ln}/>
      <circle cx="39" cy="43" r="31" fill="${t.primary}" ${ln}/>
      <circle cx="39" cy="43" r="19" fill="none" stroke="${t.canvas}" stroke-width="1.6"/>
      <circle cx="39" cy="43" r="7" fill="${t.canvas}" ${ln}/>
      <rect x="4" y="80" width="68" height="7.5" fill="${t.ink}" transform="rotate(-15 38 84)"/>
      <path d="M66 100 L100 66" stroke="${t.ink}" stroke-width="2.2" fill="none"/>
      <rect x="9" y="8" width="9" height="9" fill="${t.ink}"/>
    </svg>`;
  },

  materials: [
    { name: 'Flat form', css: 'background: {primary}; border: 2px solid {ink}; border-radius: 0; box-shadow: none; /* or border-radius: 999px; never in between */' },
    { name: 'Outlined form', css: 'background: {canvas}; border: 2px solid {ink}; border-radius: 0; color: {ink};' },
    { name: 'Primary action', css: 'background: {primary}; color: {onPrimary}; border: 2px solid {ink}; border-radius: 0; /* ends in an ink circle holding the arrow: background {ink}; color {canvas}; border-radius: 50% */' },
    { name: 'Selected segment', css: 'background: {primary}; color: {onPrimary}; border: 2px solid {ink}; border-radius: 0; /* unselected: background {canvas}; color {ink} */' },
    { name: 'Field', css: 'background: transparent; border: 0; border-bottom: 3px solid {ink}; border-radius: 0; text-transform: uppercase; font-weight: 700;' },
    { name: 'Switch', css: 'track: 2px solid {ink}, border-radius 0, background {canvas} (off) or {primary} (on); knob: circle, background {ink}.' },
  ],

  rules: {
    do: [
      'Build with circles, half and quarter circles, rectangles and 45° or -15° bars; flat fills only.',
      'Make every control either square (radius 0) or fully round; nothing in between.',
      'Draw every control and panel with a 2px ink border and set headlines in tight uppercase.',
      'Let secondary and accent run as large flat planes in the poster art, and keep them small in the interface.',
    ],
    dont: [
      'Use shadows, gradients, blur, glow or blend modes anywhere; depth comes from overlap only.',
      'Round corners to 4, 8 or 12px; pick square or fully round.',
      'Fill panels, cards or buttons with secondary or accent.',
      'Place text over the colored art planes without an ink or canvas ground.',
    ],
  },
});
