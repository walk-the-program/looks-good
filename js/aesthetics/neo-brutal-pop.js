/* 03 Neo-Brutal Pop — chunky, playful, loud. Reference: neobrutalism.dev and
   Gumroad. Near-square radii (6px controls, 10px cards), a colored canvas with a
   32px line grid, 2px ink outlines, hard offset shadows that lift and squish.
   Centered hero with outlined star and flower stickers either side of the
   statement and one centered CTA. Look lives in css/aesthetics/neo-brutal-pop.css. */
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
  labels: { material: 'Stickers & squish', states: ['Rest', 'Lift', 'Squish'], statesKind: 'button' },
  layout: { hero: 'centered' },
  type: { ui: 'sans', label: 'sans', display: 1.1 },
  highlight: 'band',

  roles: {
    ink: {
      use: 'Every outline, the hard offset shadows, headlines and body text',
      never: 'Large background fields in light mode',
    },
    primary: {
      use: 'The one chunky CTA per view (shown in the hero and the card), the selected segment, the flower sticker and the "on" toggle',
      never: 'Card fills, body text, a second CTA',
    },
    secondary: {
      use: 'Card fills, tags and chips, sticker circles and the second data series',
      never: 'The main CTA, body text, page background',
      coverage: '≈20%',
    },
    accent: {
      use: 'The headline word as a color fill with a 2px ink outline, the starburst sticker and one avatar',
      never: 'Buttons, body text, outlines, large fills',
    },
  },

  // A confident colored field: the secondary mixed ~22% into the light canvas
  // (16% into a dark one), so the page is never plain white.
  canvas(b) { return b.mix(b.secondary, b.canvas, b.isDark ? 0.16 : 0.22); },

  tokens(t) {
    // Card fill: secondary pushed into the canvas, but never so strong that
    // ink text drops under ~7:1.
    const fill = k => t.mix(t.secondary, t.canvas, k);
    let a = 0.5;
    while (a > 0.1 && t.contrast(t.ink, fill(a)) < 7) a -= 0.05;
    return {
      '--ab-card-fill': fill(a),
      '--ab-paper': t.isDark ? t.mix(t.ink, t.canvas, 0.1) : t.mix('#ffffff', t.canvas, 0.78),
      '--ab-grid': t.alpha(t.ink, 0.07),
    };
  },

  // Two outlined stickers that flank the centered headline (a starburst in the
  // accent, a flower in the primary) and a decorative CTA centered under it.
  // The art layer covers the whole hero and is aria-hidden; every shape is a
  // 2px ink outline with a hard 3px offset shadow.
  art(ctx) {
    const t = ctx.t;
    const ink = t.ink;
    const sk = `stroke="${ink}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"`;
    const off = 'translate(3.2 3.2)';
    // 12-point starburst
    const pts = [];
    for (let i = 0; i < 24; i++) {
      const r = i % 2 ? 33 : 46;
      const a = (i * Math.PI) / 12 - Math.PI / 2;
      pts.push((50 + r * Math.cos(a)).toFixed(2) + ',' + (50 + r * Math.sin(a)).toFixed(2));
    }
    const star = pts.join(' ');
    // 8-petal flower: petals stroked first, then filled on top, so only the outer outline shows
    const petals = [];
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      petals.push([(50 + 27 * Math.cos(a)).toFixed(2), (50 + 27 * Math.sin(a)).toFixed(2)]);
    }
    const ring = (attrs) => petals.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="17" ${attrs}/>`).join('');
    return `<div class="nba">
      <svg class="nba-star" viewBox="-4 -4 108 108" focusable="false">
        <polygon points="${star}" fill="${ink}" transform="${off}"/>
        <polygon points="${star}" fill="${t.accent}" ${sk}/>
        <text x="50" y="52" text-anchor="middle" dominant-baseline="central" font-size="30" font-weight="800" style="font-family:var(--ab-font-h)" fill="${t.onAccent}">${escapeHtml(ctx.initial)}</text>
      </svg>
      <svg class="nba-flower" viewBox="-4 -4 108 108" focusable="false">
        <g transform="${off}">${ring(`fill="${ink}"`)}</g>
        ${ring(`fill="${ink}" stroke="${ink}" stroke-width="4" vector-effect="non-scaling-stroke"`)}
        ${ring(`fill="${t.primary}"`)}
        <circle cx="50" cy="50" r="13" fill="${t.accent}" ${sk}/>
      </svg>
      <span class="nba-cta">Get started<i>→</i></span>
    </div>`;
  },

  materials: [
    { name: 'Sticker card', css: 'background: {cardFill}; border: 2px solid {ink}; border-radius: 10px; box-shadow: 4px 4px 0 {ink};' },
    { name: 'Chunky button', css: 'background: {primary}; color: {onPrimary}; border: 2px solid {ink}; border-radius: 6px; box-shadow: 4px 4px 0 {ink}; font-weight: 700; /* lift: translate(-2px,-2px) + 6px 6px 0; squish: translate(4px,4px), no shadow */' },
    { name: 'Squish state', css: 'transform: translate(4px, 4px); box-shadow: 0 0 0 {ink};' },
    { name: 'Segment track', css: 'background: {paper}; border: 2px solid {ink}; border-radius: 10px; padding: 4px; /* selected segment: {primary} fill, 2px {ink} outline, radius 6 */' },
    { name: 'Highlight fill', css: 'background: {accent}; color: {onAccent}; border: 2px solid {ink}; border-radius: .12em; padding: 0 .18em; box-shadow: 4px 4px 0 {ink}; /* a color fill with a 2px ink outline behind one headline word */' },
    { name: 'Canvas', css: 'background-color: {canvas}; background-image: linear-gradient({grid} 1px, transparent 1px), linear-gradient(90deg, {grid} 1px, transparent 1px); background-size: 32px 32px; /* the canvas is the secondary mixed into the light neutral; the grid is ink at 7% */' },
    { name: 'Outlined toggle', css: 'track: 64x34, radius 8, background {paper}, border 2px solid {ink}; knob: 23px, radius 5, of {ink}; on = track {primary}.' },
  ],

  rules: {
    do: [
      'Outline every object in ink at 2px and give it a hard 4px offset shadow with no blur; keep corners near-square (6px controls, 10px cards).',
      'Make buttons physical: lift 2px up-left on hover, squish 4px down-right on press.',
      'Fill cards with the secondary color eased into the canvas, sit them on the colored 32px grid canvas, and keep the headline mixed case at weight 800.',
      'Put the accent as a color fill with a 2px ink outline behind one headline word and in the starburst sticker.',
    ],
    dont: [
      'Blur a shadow or add a gradient; stickers are flat color with a hard edge.',
      'Use the accent as text color or as a button fill.',
      'Round corners past 10px or rotate controls; only decorative stickers tilt.',
      'Drop the ink outline from a filled shape, or mix thin and thick outlines.',
    ],
  },
});
