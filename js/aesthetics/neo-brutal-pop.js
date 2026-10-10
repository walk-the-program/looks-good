/* 03 Neo-Brutal Pop — chunky, playful, loud. Thick ink outlines, hard offset
   shadows that lift and squish, sticker-style shapes, secondary as card fill.
   Look lives in css/aesthetics/neo-brutal-pop.css. */
registerAesthetic({
  key: 'neo-brutal-pop', order: 3,
  name: 'Neo-Brutal Pop',
  descriptor: 'Chunky · Playful · Loud',
  influences: 'Neo-brutalism / Memphis / Sticker culture',
  summary: 'Big outlines, bright stickers and buttons that squish when you press them.',
  motto: 'Loud, but friendly.',
  kicker: 'Stickers, stacked',
  mode: 'light',
  slideShape: 'geometric',
  labels: { material: 'Stickers & squish', states: ['Rest', 'Lift', 'Squish'] },

  roles: {
    ink: {
      use: 'Every outline, the hard offset shadows, headlines and body text',
      never: 'Large background fields in light mode',
    },
    primary: {
      use: 'The one chunky CTA per view, the selected segment and the "on" toggle',
      never: 'Card fills, body text, a second CTA',
    },
    secondary: {
      use: 'Card fills, tags and chips, sticker circles and the second data series',
      never: 'The main CTA, body text, page background',
      coverage: '≈20%',
    },
    accent: {
      use: 'The headline word in a tilted pill, the starburst sticker and one avatar',
      never: 'Buttons, body text, outlines, large fills',
    },
  },

  // Canvas leans 6% toward the secondary so the page is never plain white.
  canvas(b) { return b.mix(b.secondary, b.canvas, 0.06); },

  tokens(t) {
    // Card fill: secondary pushed into the canvas, but never so strong that
    // ink text drops under ~7:1.
    const fill = k => t.mix(t.secondary, t.canvas, k);
    let a = 0.35;
    while (a > 0.1 && t.contrast(t.ink, fill(a)) < 7) a -= 0.05;
    return {
      '--ab-card-fill': fill(a),
      '--ab-paper': t.isDark ? t.mix(t.ink, t.canvas, 0.1) : t.mix('#ffffff', t.canvas, 0.78),
      '--ab-dot': t.alpha(t.ink, t.isDark ? 0.17 : 0.13),
    };
  },

  art(ctx) {
    const t = ctx.t;
    const ink = t.ink;
    const sk = `stroke="${ink}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"`;
    // 12-point starburst
    const pts = [];
    for (let i = 0; i < 24; i++) {
      const r = i % 2 ? 17.5 : 25;
      const a = (i * Math.PI) / 12 - Math.PI / 2;
      pts.push((72 + r * Math.cos(a)).toFixed(2) + ',' + (27 + r * Math.sin(a)).toFixed(2));
    }
    const star = pts.join(' ');
    const off = 'translate(2.6 2.6)';
    return `<svg viewBox="0 0 100 100" width="100%" height="100%" focusable="false">
      <g transform="rotate(8 36 42)">
        <rect x="17" y="23" width="38" height="38" rx="9" fill="${ink}" transform="${off}"/>
        <rect x="17" y="23" width="38" height="38" rx="9" fill="${t.primary}" ${sk}/>
        <path d="M24 33 h14" fill="none" stroke="${t.onPrimary}" stroke-width="2.5" stroke-linecap="round" vector-effect="non-scaling-stroke" opacity=".55"/>
      </g>
      <circle cx="64" cy="66" r="21" fill="${ink}" transform="${off}"/>
      <circle cx="64" cy="66" r="21" fill="${t.secondary}" ${sk}/>
      <circle cx="64" cy="66" r="11" fill="none" stroke="${ink}" stroke-width="2.5" vector-effect="non-scaling-stroke" stroke-dasharray="1 6" stroke-linecap="round"/>
      <polygon points="${star}" fill="${ink}" transform="${off}"/>
      <polygon points="${star}" fill="${t.accent}" ${sk}/>
      <text x="72" y="28" text-anchor="middle" dominant-baseline="central" font-size="21" font-weight="800" style="font-family:var(--ab-font-h)" fill="${t.onAccent}">${escapeHtml(ctx.initial)}</text>
      <path d="M8 90 q4.5 -10 9 0 t9 0 t9 0 t9 0" fill="none" ${sk}/>
      <path d="M11 13 h9 M15.5 8.5 v9" fill="none" ${sk}/>
      <path d="M90 82 l7 12 h-14 z" fill="none" ${sk}/>
      <circle cx="90" cy="52" r="3" fill="${ink}"/>
      <circle cx="46" cy="10" r="2.2" fill="${ink}"/>
    </svg>`;
  },

  materials: [
    { name: 'Sticker card', css: 'background: {cardFill}; border: 2.5px solid {ink}; border-radius: 20px; box-shadow: 6px 6px 0 {ink};' },
    { name: 'Chunky button', css: 'background: {primary}; color: {onPrimary}; border: 2.5px solid {ink}; border-radius: 14px; box-shadow: 4px 4px 0 {ink}; font-weight: 800; /* lift: translate(-2px,-2px) + 6px 6px 0; squish: translate(4px,4px), no shadow */' },
    { name: 'Squish state', css: 'transform: translate(4px, 4px); box-shadow: 0 0 0 {ink};' },
    { name: 'Pill track', css: 'background: {paper}; border: 2.5px solid {ink}; border-radius: 999px; padding: 4px; /* selected segment: {primary} fill, 2px {ink} outline */' },
    { name: 'Highlight pill', css: 'background: {accent}; color: {onAccent}; border: 2.5px solid {ink}; border-radius: .3em; padding: 0 .22em; transform: rotate(-2deg); box-shadow: 4px 4px 0 {ink};' },
    { name: 'Outlined toggle', css: 'track: 64x34 pill, background {paper}, border 2.5px solid {ink}; knob: 23px circle of {ink}; on = track {primary}.' },
  ],

  rules: {
    do: [
      'Outline every object in ink at 2.5px and give it a hard 4px offset shadow with no blur.',
      'Make buttons physical: lift 2px up-left on hover, squish 4px down-right on press.',
      'Fill cards with the secondary color eased into the canvas, and keep the headline mixed case at weight 800.',
      'Put the accent in a tilted pill behind one headline word and in the starburst sticker.',
    ],
    dont: [
      'Blur a shadow or add a gradient; stickers are flat color with a hard edge.',
      'Use the accent as text color or as a button fill.',
      'Rotate controls; only decorative stickers and the highlight pill tilt.',
      'Drop the ink outline from a filled shape, or mix thin and thick outlines.',
    ],
  },
});
