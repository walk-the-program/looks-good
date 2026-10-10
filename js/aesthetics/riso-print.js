/* 10 Riso Print — inked, grainy, human. Primary and secondary behave like two
   riso inks printed on warm paper: they overprint (multiply), sit a few pixels
   off-register on purpose, and shade with halftone dots. Accent is a third,
   tiny fluorescent ink (a hand-drawn ring, a stamp). Paper grain is an inline
   SVG feTurbulence data URI in css/aesthetics/riso-print.css. */
registerAesthetic({
  key: 'riso-print', order: 10,
  name: 'Riso Print',
  descriptor: 'Inked · Grainy · Human',
  influences: 'Risograph zines / Screen print / Editorial',
  summary: 'Two overlapping inks on warm paper, a little off-register on purpose.',
  motto: 'Printed by people.',
  kicker: 'Two inks, one pass',
  mode: 'light',
  slideShape: 'minimal',
  labels: { material: 'Ink', states: ['Solid ink', 'Overprint', 'Halftone'] },

  roles: {
    canvas: {
      use: 'The paper: Light warmed slightly, with a faint grain over everything',
      never: 'Text, or a pure-white card that breaks the paper',
    },
    primary: {
      use: 'The first ink: the headline, the one flat CTA block, selected segments and the "on" switch',
      never: 'Body text, a second CTA, smooth gradients',
    },
    secondary: {
      use: 'The second ink: the misregistered shadow, halftone shading, the off-register plate behind panels and the overprinted art shape',
      never: 'The main CTA, body text, page background',
      coverage: '≈10–15%',
    },
    accent: {
      use: 'A third fluorescent ink, used tiny: the hand-drawn ring around one headline word, a stamp or asterisk in the art, the footer dot',
      never: 'Buttons, body text, borders, large fills',
      coverage: '≤3%',
    },
  },

  // Light canvases are warmed toward cream so the board reads as paper.
  canvas(b) { return b.isDark ? null : b.mix('#f0dfba', b.canvas, 0.14); },

  tokens(t) {
    const d = t.isDark;
    return {
      // Overprint blend: ink darkens paper in light mode, glows on dark paper.
      '--ab-blend': d ? 'screen' : 'multiply',
      '--ab-speck': t.alpha(t.ink, d ? 0.2 : 0.2),
      '--ab-plate': t.mix(t.secondary, t.canvas, 0.4),
      '--ab-paper-card': d ? t.mix(t.ink, t.canvas, 0.06) : t.mix('#ffffff', t.canvas, 0.4),
    };
  },

  art(ctx) {
    const t = ctx.t;
    const blend = 'style="mix-blend-mode:var(--ab-blend,multiply)"';
    // True halftone: a rotated grid of dots whose radius grows toward the
    // lower right, clipped to the plate.
    const x0 = 40, y0 = 28, w = 52, h = 60, step = 4.3, ang = 15 * Math.PI / 180;
    const cx = x0 + w / 2, cy = y0 + h / 2;
    let dots = '';
    for (let i = -18; i <= 18; i++) {
      for (let j = -18; j <= 18; j++) {
        const gx = i * step, gy = j * step;
        const x = cx + gx * Math.cos(ang) - gy * Math.sin(ang);
        const y = cy + gx * Math.sin(ang) + gy * Math.cos(ang);
        if (x < x0 - 2 || x > x0 + w + 2 || y < y0 - 2 || y > y0 + h + 2) continue;
        const f = Math.min(1, Math.max(0, ((x - x0) / w) * 0.45 + ((y - y0) / h) * 0.55));
        const r = (0.35 + 1.75 * Math.sqrt(f)).toFixed(2);
        dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}"/>`;
      }
    }
    const mono = 'font-family="ui-monospace,Menlo,monospace"';
    const reg = (x, y) => `<g stroke="${t.ink}" stroke-width=".5" fill="none"><circle cx="${x}" cy="${y}" r="2.6"/><path d="M${x - 4.2} ${y}H${x + 4.2}M${x} ${y - 4.2}V${y + 4.2}"/></g>`;
    return `<svg viewBox="0 0 100 100" width="100%" height="100%" focusable="false">
      <defs><clipPath id="rz-plate-${ctx.key}"><rect x="${x0}" y="${y0}" width="${w}" height="${h}"/></clipPath></defs>
      <g ${blend}>
        <g fill="${t.secondary}" clip-path="url(#rz-plate-${ctx.key})">${dots}</g>
        <rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="none" stroke="${t.secondary}" stroke-width=".7"/>
      </g>
      <circle cx="37" cy="45" r="27.5" fill="${t.primary}" ${blend}/>
      <circle cx="39.8" cy="47.4" r="27.5" fill="none" stroke="${t.secondary}" stroke-width=".9" ${blend}/>
      <g ${blend} stroke="${t.accent}" stroke-width="3.4" stroke-linecap="round" fill="none">
        <path d="M80 9V31M70.5 14.5L89.5 25.5M70.5 25.5L89.5 14.5"/>
      </g>
      <circle cx="80" cy="20" r="14.5" fill="none" stroke="${t.accent}" stroke-width="1" stroke-dasharray="1.2 2.2" ${blend}/>
      ${reg(8, 92)}${reg(95, 52)}
      <text x="40" y="95.5" font-size="3.1" fill="${t.ink}" ${mono} letter-spacing=".25">PLATE 1 + 2 · 2 INKS</text>
    </svg>`;
  },

  materials: [
    { name: 'Solid ink block', css: 'background: radial-gradient(circle, {speck} .9px, transparent 1.2px) 0 0 / 4px 4px, {primary}; color: {onPrimary}; border-radius: 2px; /* flat ink with a grain of dots, never a smooth gradient */' },
    { name: 'Overprint', css: 'background: {secondary}; mix-blend-mode: multiply; transform: translate(3px, 2px); /* printed 2–3px off-register over the first ink; darkens where inks overlap */' },
    { name: 'Halftone shading', css: 'background: radial-gradient(circle, {secondary} 1.2px, transparent 1.6px) 0 0 / 6px 6px; /* dot size carries the shade; use for shading, not decoration */' },
    { name: 'Paper card', css: 'background: {paperCard}; border: 1.5px solid {ink}; border-radius: 4px; box-shadow: 4px 3px 0 {plate}; /* the plate is the secondary ink printed off-register behind the card */' },
    { name: 'Paper grain', css: 'background-color: {canvas}; /* overlay: an inline SVG feTurbulence noise (baseFrequency .85, 2 octaves) as a data URI, mix-blend-mode: multiply, ~8% */' },
    { name: 'Accent ring', css: 'border: 2px solid {accent}; border-radius: 50%; transform: rotate(-3deg); mix-blend-mode: multiply; /* a hand-drawn ring around one word; third ink, tiny */' },
  ],

  rules: {
    do: [
      'Print with two inks only (primary and secondary); let them overlap with multiply so the third color appears where they cross.',
      'Misregister on purpose: shift the second ink 2–3px and keep it consistent across the board.',
      'Shade with halftone dots whose size changes, not with smooth gradients or soft shadows.',
      'Keep the accent tiny and hand-drawn: one ring, one stamp, one dot.',
    ],
    dont: [
      'Use gradients, blur, glow or soft drop shadows; every edge is a printed edge.',
      'Fill large areas with the accent or run body text in either ink.',
      'Align the two inks perfectly, or add more than two inks.',
      'Print flat white cards on the paper; panels stay paper-toned with an ink outline.',
    ],
  },
});
