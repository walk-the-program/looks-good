/* 14 Cyber HUD — angular, neon, live. Reference: Cyberpunk 2077 UI, Destiny /
   Apex HUDs, F1 TV graphics. Cut-corner (chamfered) panels with 1px neon edges
   and a small glow, a near-black field with a 24px grid and a static scanline
   sweep, mono readouts everywhere, a targeting reticle over a wireframe sphere
   and floor grid, and a chromatic-split highlight word. Neon is the brand
   primary (shifted to stay visible on the canvas); the sphere wire is the
   secondary; the target blip is the accent. */

// largest published weight <= target (a single-weight face must stay at 400)
function hudWeight(font, target) {
  const ws = String((font && font.weights) || '400').split(';').map(Number).filter(Boolean);
  const le = ws.filter(w => w <= target);
  return le.length ? Math.max(...le) : Math.min(...ws);
}

registerAesthetic({
  key: 'cyber-hud', order: 14,
  name: 'Cyber HUD',
  descriptor: 'Angular · Neon · Live',
  influences: 'Sci-fi HUD / Cyberpunk UI / Esports overlays',
  summary: 'Cut-corner panels, neon edges and live readouts.',
  motto: 'Target acquired.',
  kicker: 'Sync 98.2%',
  mode: 'dark',
  slideShape: 'minimal',
  labels: { material: 'Systems', states: ['Idle', 'Target', 'Locked'], statesKind: 'button' },
  layout: { hero: 'split', palette: 'swatches', sections: 'two-col' },
  type: { ui: 'mono', label: 'mono', display: 0.84 },
  highlight: 'custom',
  highlightNote: 'The word is set in --accent-ink with a 2px chromatic split behind it: a primary copy offset -2px and a secondary copy offset +2px (text-shadow), no fill or band.',

  roles: {
    canvas: {
      use: 'The near-black field (lightness capped at 5%) under the 24px grid; panels are 6% primary over it',
      never: 'Text, or a lighter background card',
      coverage: '70–75%',
    },
    ink: {
      use: 'Headlines, readout values and body text',
      never: 'Large fields',
      coverage: '12–18%',
    },
    primary: {
      use: 'Neon: every 1px panel edge, the main action fill, the selected tab, progress segments and the reticle',
      never: 'Body text, page background, a second solid CTA',
      coverage: '≈10–12%',
    },
    secondary: {
      use: 'The second signal: sphere wireframe, the right-hand chromatic split, secondary data series and idle-state outlines',
      never: 'The main action, body text, panel edges',
      coverage: '≈6–10%',
    },
    accent: {
      use: 'The target blip and status lamps, plus the highlighted headline word',
      never: 'Buttons, body text, panel borders, large fills',
      coverage: '≤3%',
    },
  },

  canvas(b) {
    if (!b.isDark) return null;
    const h = b.hexToHsl(b.canvas);
    const dark = h.l > 5 ? b.hslToHex(h.h, Math.min(h.s, 30), 5) : b.canvas;
    return b.mix(b.primary, dark, 0.035);
  },

  tokens(t) {
    const d = t.isDark;
    const hf = typeof state !== 'undefined' && state.headingFont;
    // the neon must read on the canvas; secondary likewise (lifted toward white if not)
    const neon = t.primaryText;
    const neon2 = t.contrast(t.secondary, t.canvas) >= 3 ? t.secondary : t.mix(t.secondary, d ? '#ffffff' : '#000000', 0.5);
    const bracket = (c, w, l) => [
      `linear-gradient(${c},${c}) 0 0/${l}px ${w}px no-repeat`, `linear-gradient(${c},${c}) 0 0/${w}px ${l}px no-repeat`,
      `linear-gradient(${c},${c}) 100% 0/${l}px ${w}px no-repeat`, `linear-gradient(${c},${c}) 100% 0/${w}px ${l}px no-repeat`,
      `linear-gradient(${c},${c}) 0 100%/${l}px ${w}px no-repeat`, `linear-gradient(${c},${c}) 0 100%/${w}px ${l}px no-repeat`,
      `linear-gradient(${c},${c}) 100% 100%/${l}px ${w}px no-repeat`, `linear-gradient(${c},${c}) 100% 100%/${w}px ${l}px no-repeat`,
    ].join(',');
    return {
      '--ab-hw': hudWeight(hf, 700),
      '--ab-neon': neon,
      '--ab-neon2': neon2,
      '--ab-hud-line': t.alpha(neon, 0.62),
      '--ab-hud-line-soft': t.alpha(neon, 0.28),
      '--ab-hud-glow': t.alpha(neon, d ? 0.42 : 0.3),
      '--ab-hud-fill': t.mix(neon, t.canvas, 0.06),
      '--ab-hud-fill2': t.mix(neon, t.canvas, 0.13),
      '--ab-hud-fill3': t.mix(neon, t.canvas, 0.24),
      '--ab-hud-grid': t.alpha(neon, d ? 0.06 : 0.07),
      '--ab-hud-sweep': t.alpha(neon, d ? 0.09 : 0.06),
      '--ab-hud-hi': t.mix(t.primary, '#ffffff', 0.78),
      '--ab-brackets': bracket(neon, 2, 9),
      '--ab-brackets-dim': bracket(t.alpha(neon, 0.55), 1.5, 7),
      '--ab-split-a': t.alpha(neon, 0.95),
      '--ab-split-b': t.alpha(neon2, 0.95),
    };
  },

  // A targeting reticle over a wireframe sphere (secondary) and a perspective floor
  // grid (neon), lock-on brackets around the target, a blip (accent), and HTML
  // readouts: coordinates, a segmented bar and a radial gauge. SVG strokes are
  // non-scaling so the line weight is constant.
  art(ctx) {
    const t = ctx.t;
    const neon = t.primaryText;
    const neon2 = t.contrast(t.secondary, t.canvas) >= 3 ? t.secondary : t.mix(t.secondary, t.isDark ? '#ffffff' : '#000000', 0.5);
    const vf = 'vector-effect="non-scaling-stroke"';
    const floor = [66, 71, 78, 87, 98].map((y, i) => `<path ${vf} d="M${50 - (y - 56) * 1.9} ${y}H${50 + (y - 56) * 1.9}" stroke="${neon}" stroke-opacity="${(0.16 + i * 0.07).toFixed(2)}"/>`).join('')
      + [-60, -42, -26, -12, 0, 12, 26, 42, 60].map(dx => `<path ${vf} d="M50 56L${50 + dx * 1.95} 100" stroke="${neon}" stroke-opacity=".3"/>`).join('');
    const lats = [-16, -9, 0, 9, 16].map(dy => {
      const rx = Math.sqrt(28 * 28 - dy * dy);
      return `<ellipse ${vf} cx="50" cy="${40 + dy}" rx="${rx.toFixed(1)}" ry="${(rx * 0.26).toFixed(1)}"/>`;
    }).join('');
    const sphere = `<g fill="none" stroke="${neon2}" stroke-opacity=".7"><circle ${vf} cx="50" cy="40" r="28"/>${lats}`
      + `<ellipse ${vf} cx="50" cy="40" rx="11" ry="28"/><ellipse ${vf} cx="50" cy="40" rx="21" ry="28"/><path ${vf} d="M50 12V68"/></g>`;
    const ticks = [0, 90, 180, 270].map(a => `<path ${vf} d="M50 1.5V7" transform="rotate(${a} 50 40)" stroke-width="2"/>`).join('');
    const reticle = `<g fill="none" stroke="${neon}">
        <circle ${vf} cx="50" cy="40" r="38.5" stroke-opacity=".8" stroke-dasharray="1.2 2.1"/>
        <circle ${vf} cx="50" cy="40" r="33" stroke-opacity=".35"/>${ticks}
        <path ${vf} d="M4 40H31M69 40H96M50 -3V13M50 67V83" stroke-opacity=".9"/>
        <path ${vf} d="M47 40H53M50 37V43" stroke-width="1.5"/></g>`;
    const brackets = `<g fill="none" stroke="${neon}" stroke-width="2"><path ${vf} d="M60 24V18H66M80 18H86V24M86 40V46H80M66 46H60V40" transform="translate(-4 10)"/></g>`;
    return `<div class="chs"><svg viewBox="0 0 100 100" width="100%" height="100%" focusable="false" preserveAspectRatio="xMidYMid meet" stroke-width="1">
        ${floor}${sphere}${reticle}${brackets}
        <path ${vf} d="M63.5 35.2l3 3-3 3-3-3z" fill="${t.accent}" stroke="${t.accent}"/>
        <circle ${vf} cx="63.5" cy="38.2" r="6" fill="none" stroke="${t.accent}" stroke-opacity=".6"/>
      </svg>
      <span class="chs-r chs-tl">SYNC 98.2%<br><i>SIG ▮▮▮▮▯</i></span>
      <span class="chs-r chs-tr">X 012.4<br>Y 087.1</span>
      <span class="chs-tag">LOCK 0.82s</span>
      <span class="chs-bar" aria-hidden="true"><b></b></span>
      <svg class="chs-gauge" viewBox="0 0 44 44" focusable="false"><circle cx="22" cy="22" r="17" fill="none" stroke="${neon}" stroke-opacity=".22" stroke-width="3" pathLength="100" stroke-dasharray="1.6 1.4"/>
        <circle cx="22" cy="22" r="17" fill="none" stroke="${neon}" stroke-width="3" pathLength="100" stroke-dasharray="72 28" transform="rotate(-90 22 22)" opacity=".9"/></svg>
      <span class="chs-g">72</span>
    </div>`;
  },

  materials: [
    { name: 'Chamfered panel', css: 'background: {hudFill}; clip-path: polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px); /* two opposite corners cut at 45deg; the 1px edge is a {neon} layer behind a 1px-inset fill, since borders do not follow clip-path */' },
    { name: 'Neon edge + glow', css: 'background: {neon}; filter: drop-shadow(0 0 6px {hudGlow}); /* the glow goes on a parent of the clipped layers */' },
    { name: 'Main action', css: 'background: linear-gradient(180deg, rgba(255,255,255,.22), transparent 42%), {primary}; color: {onPrimary}; clip-path: chamfer 10px (top-left, bottom-right); font: mono, uppercase, .08em; /* label ends with a ▶ glyph */' },
    { name: 'Selected tab', css: 'background: {hudFill3}; box-shadow: inset 0 0 0 1px {neon}, inset 0 -2px 0 {neon}; clip-path: chamfer 7px; color: {ink};' },
    { name: 'Corner brackets (target / focus)', css: 'background: 8 gradient strokes of {neon}, 2px by 9px, one per corner; shown on Target, Locked and focused fields' },
    { name: 'Segmented progress', css: 'track: repeating-linear-gradient(90deg, {hudLineSoft} 0 5px, transparent 5px 7px); fill: {neon} through the same 5px/2px mask' },
    { name: 'Chromatic split (highlight)', css: 'color: {accentText}; text-shadow: -2px 0 {splitA}, 2px 0 {splitB}; /* primary left, secondary right, accent word on top */' },
  ],

  rules: {
    do: [
      'Cut two opposite corners at 45 degrees (8-14px) on every panel and button; keep the other two square.',
      'Draw 1px neon edges in primary with a small glow, and show corner brackets only for target, locked and focus states.',
      'Fill the page with live data: mono readouts, segmented bars and a gauge; set all labels and values in mono uppercase.',
      'Keep the field near-black with a faint 24px grid and one static diagonal sweep; neon is the only light.',
    ],
    dont: [
      'Round anything or add soft shadows; glow is a 6px neon edge, never a halo behind text.',
      'Use accent as a fill or border; it is the blip, the lamps and one split headline word.',
      'Fill panels with solid neon; only the single main action is solid primary.',
      'Mix in serif or script faces, or warm analog bezels (that is a different aesthetic).',
    ],
  },
});
