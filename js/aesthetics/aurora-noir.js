/* 07 Aurora Noir — precise, nocturnal, charged. A near-black dev-tool surface:
   hairline cards on a faded 48px grid, a quiet aurora of primary + secondary
   at the top, mono detail, and the densest list of the ten. Translucent fills
   are alphas of the ink color, so the same recipe works if the brand is
   switched to light mode. */
var anSeq = 0;   // unique SVG gradient ids: several boards can share one page

registerAesthetic({
  key: 'aurora-noir', order: 7,
  name: 'Aurora Noir',
  descriptor: 'Precise · Nocturnal · Charged',
  influences: 'Dev-tool UI / Swiss grid / Aurora light',
  summary: 'A near-black, exact interface with hairline surfaces and a quiet aurora glow.',
  motto: 'Quiet. Exact. Charged.',
  kicker: 'Built for the dark',
  mode: 'dark',
  slideShape: 'minimal',
  labels: { material: 'Surfaces', states: ['Rest', 'Hover', 'Focus'] },

  roles: {
    canvas: {
      use: 'The near-black page (lightness capped at 8%) and the base under every translucent surface',
      never: 'Text, or a lighter "card" fill; surfaces are 3% ink alpha, not a second background',
      coverage: '70–80%',
    },
    primary: {
      use: 'The one glowing action per view, the "on" switch, the focus ring and the first aurora color (mostly seen as glow)',
      never: 'Body text, card fills, a second CTA',
      coverage: '≈8–10%',
    },
    secondary: {
      use: 'Ghost-button hover, the second aurora color, the second chart series and the featured-card border',
      never: 'The main CTA, body text, page background',
      coverage: '≈8–12%',
    },
    accent: {
      use: 'Status dots and the "New" badge, plus the highlighted headline word',
      never: 'Buttons, body text, borders, aurora washes',
      coverage: '≤3%',
    },
  },

  // Dark canvases are pushed down to lightness <= 8% (and desaturated a bit):
  // the aurora needs real black to glow against.
  canvas(b) {
    if (!b.isDark) return null;
    const h = b.hexToHsl(b.canvas);
    return h.l > 8 ? b.hslToHex(h.h, Math.min(h.s, 28), 8) : b.canvas;
  },

  tokens(t) {
    const d = t.isDark;
    // An aurora wash must never push ink text under ~6:1 where it sits.
    const wash = (hex, start) => {
      let a = start;
      while (a > 0.1 && t.contrast(t.ink, t.mix(hex, t.canvas, a)) < 6) a -= 0.04;
      return a;
    };
    const mid = t.mix(t.primary, t.secondary, 0.5);
    const a1 = wash(t.primary, d ? 0.55 : 0.3);
    const a2 = wash(t.secondary, d ? 0.5 : 0.28);
    const a3 = wash(mid, d ? 0.34 : 0.18);
    return {
      '--ab-hair': t.alpha(t.ink, d ? 0.09 : 0.1),
      '--ab-hair2': t.alpha(t.ink, d ? 0.14 : 0.16),
      '--ab-fill': t.alpha(t.ink, d ? 0.035 : 0.035),
      '--ab-fill2': t.alpha(t.ink, d ? 0.06 : 0.055),
      '--ab-fill-sel': t.alpha(t.ink, d ? 0.11 : 0.1),
      '--ab-grid': t.alpha(t.ink, d ? 0.035 : 0.06),
      '--ab-top': t.alpha(t.ink, d ? 0.32 : 0.2),
      '--ab-solid': t.mix(t.ink, t.canvas, d ? 0.045 : 0.04),
      '--ab-glow': t.alpha(t.primary, 0.35),
      '--ab-ring': t.alpha(t.primary, 0.4),
      '--ab-au1': t.alpha(t.primary, a1.toFixed(2)),
      '--ab-au2': t.alpha(t.secondary, a2.toFixed(2)),
      '--ab-au3': t.alpha(mid, a3.toFixed(2)),
      '--ab-pri-a': t.alpha(t.primary, 0.36),
      '--ab-sec-a': t.alpha(t.secondary, 0.36),
      '--ab-acc-tint': t.alpha(t.accent, 0.15),
      '--ab-acc-line': t.alpha(t.accent, 0.32),
    };
  },

  art(ctx) {
    const t = ctx.t;
    const id = 'an' + (++anSeq);
    const cx = 50, cy = 52;
    const pt = (r, deg) => {
      const a = (deg * Math.PI) / 180;
      return [(cx + r * Math.cos(a)).toFixed(2), (cy + r * Math.sin(a)).toFixed(2)];
    };
    const ring = t.alpha(t.ink, t.isDark ? 0.1 : 0.16);
    const link = t.alpha(t.ink, t.isDark ? 0.28 : 0.34);
    const [x0, y0] = pt(38, -152), [x1, y1] = pt(38, 12);
    const arc = `M${x0} ${y0} A38 38 0 0 1 ${x1} ${y1}`;
    const n2 = pt(25, 62), n4 = pt(38, -58), n5 = pt(47, 128), n6 = pt(14, -118);
    const node = (p, r, fill, stroke) =>
      `<circle cx="${p[0]}" cy="${p[1]}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width=".9"/>`;
    return `<svg viewBox="0 0 100 100" width="100%" height="100%" focusable="false">
      <defs>
        <linearGradient id="${id}g" gradientUnits="userSpaceOnUse" x1="12" y1="30" x2="88" y2="72">
          <stop offset="0" stop-color="${t.primary}"/><stop offset="1" stop-color="${t.secondary}"/>
        </linearGradient>
        <radialGradient id="${id}r" cx="50%" cy="50%" r="50%">
          <stop offset="0" stop-color="${t.primary}" stop-opacity=".3"/><stop offset="1" stop-color="${t.primary}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="${cx}" cy="${cy}" r="42" fill="url(#${id}r)"/>
      <circle cx="${cx}" cy="${cy}" r="47" fill="none" stroke="${ring}" stroke-width="1.6" stroke-dasharray=".25 1.5"/>
      <circle cx="${cx}" cy="${cy}" r="38" fill="none" stroke="${ring}" stroke-width=".4"/>
      <circle cx="${cx}" cy="${cy}" r="25" fill="none" stroke="${ring}" stroke-width=".4"/>
      <circle cx="${cx}" cy="${cy}" r="14" fill="none" stroke="${ring}" stroke-width=".4"/>
      <circle cx="${cx}" cy="${cy}" r="31.5" fill="none" stroke="${ring}" stroke-width=".3" stroke-dasharray="1 2"/>
      <path d="${arc}" fill="none" stroke="url(#${id}g)" stroke-width="5" stroke-linecap="round" opacity=".2"/>
      <path d="${arc}" fill="none" stroke="url(#${id}g)" stroke-width="1.7" stroke-linecap="round"/>
      <g stroke="${link}" stroke-width=".4" fill="none">
        <path d="M${cx} ${cy} L${n2[0]} ${n2[1]} L${x1} ${y1}"/>
        <path d="M${cx} ${cy} L${n6[0]} ${n6[1]} L${n4[0]} ${n4[1]}"/>
        <path d="M${n2[0]} ${n2[1]} L${n5[0]} ${n5[1]}"/>
      </g>
      ${node([x0, y0], 2.1, t.canvas, t.primary)}
      ${node([x1, y1], 2.1, t.canvas, t.secondary)}
      ${node(n2, 1.7, t.canvas, t.secondary)}
      ${node(n5, 1.3, t.canvas, link)}
      ${node(n6, 1.3, t.canvas, link)}
      <circle cx="${n4[0]}" cy="${n4[1]}" r="4.6" fill="${t.accent}" opacity=".22"/>
      <circle cx="${n4[0]}" cy="${n4[1]}" r="2.2" fill="${t.accent}"/>
      <circle cx="${cx}" cy="${cy}" r="2.4" fill="${t.ink}"/>
      <text x="6" y="97" font-size="3.4" fill="${t.muted}" font-family="ui-monospace,Menlo,monospace" letter-spacing=".3">r 38 · 164°</text>
      <text x="94" y="97" font-size="3.4" fill="${t.muted}" font-family="ui-monospace,Menlo,monospace" letter-spacing=".3" text-anchor="end">n 06</text>
    </svg>`;
  },

  materials: [
    { name: 'Hairline surface', css: 'background: {fill}; border: 1px solid {hair}; border-radius: 14px; /* plus a 1px top highlight: linear-gradient(90deg, transparent, {top}, transparent) */' },
    { name: 'Featured card', css: 'background: linear-gradient({solid}, {solid}) padding-box, linear-gradient(135deg, {primary}, {secondary}) border-box; border: 1px solid transparent; border-radius: 14px;' },
    { name: 'Primary action', css: 'background: {primary}; color: {onPrimary}; border-radius: 8px; box-shadow: inset 0 1px 0 rgba(255,255,255,.35), 0 8px 24px {glow};' },
    { name: 'Ghost action', css: 'background: transparent; color: {ink}; border: 1px solid {hair2}; border-radius: 8px; /* hover: border-color {secondary} */' },
    { name: 'Field focus', css: 'background: {fill}; border: 1px solid {primary}; border-radius: 8px; box-shadow: 0 0 0 3px {ring};' },
    { name: 'New badge', css: 'color: {accentText}; background: {accTint}; border: 1px solid {accLine}; border-radius: 999px; font: 500 10px ui-monospace, "SF Mono", Menlo, monospace; letter-spacing: .06em; text-transform: uppercase;' },
  ],

  rules: {
    do: [
      'Build every surface from alphas of the ink color (3% fill, 8% hairline); never a second solid background.',
      'Reserve glow for the one primary action and the aurora at the top of the page; everything else stays flat and sharp.',
      'Set IDs, timestamps and numbers in mono with tabular figures, right-aligned in tables.',
      'Give one card per view the primary-to-secondary gradient border and keep the rest plain hairlines.',
    ],
    dont: [
      'Add drop shadows or blurred panels to cards; depth comes from the 1px top highlight alone.',
      'Spread the aurora below the hero or tint it with the accent.',
      'Use accent for anything bigger than a dot, a badge or one headline word.',
      'Round controls past 8px or cards past 14px; this look is exact, not soft.',
    ],
  },
});
