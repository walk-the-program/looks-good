/* 12 Neo Deco — gilded, symmetric, stepped. Reference: The Great Gatsby (2013)
   titles, the Chrysler Building, Soho House and modern deco hotel identities.
   A deep canvas where the accent plays the metal: 1px gilt lines, double-rule
   frames, diamonds and a sunburst fan, never fills. The hero is a symmetric
   title card (a stepped, ziggurat-cornered frame over a fan of rays); panels
   have double-rule borders with corner diamonds; palette tiles are arches;
   rules read line-diamond-line. The stepped frame and diamonds are SVG data
   URIs built in tokens() so they carry the brand's gilt. */

// url(data:...) for an SVG string; percent-encoded so it survives the inline style attribute.
function ndUri(svg) {
  return 'url(data:image/svg+xml,' + encodeURIComponent(svg).replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/'/g, '%27') + ')';
}

registerAesthetic({
  key: 'neo-deco', order: 12,
  name: 'Neo Deco',
  descriptor: 'Gilded · Symmetric · Stepped',
  influences: 'Art Deco / Chrysler Building / Modern luxury hospitality',
  summary: 'Symmetry, stepped frames and thin gilt lines on a deep canvas.',
  motto: 'Symmetry, polished.',
  kicker: 'Gilded',
  mode: 'dark',
  slideShape: 'classic',
  labels: { material: 'Ornament', states: ['Plain', 'Framed', 'Gilded'], statesKind: 'swatch' },
  layout: { hero: 'centered', palette: 'swatches', sections: 'two-col' },
  type: { ui: 'sans', label: 'sans', display: 1 },
  highlight: 'ink',

  roles: {
    canvas: {
      use: 'The deep field (navy / ink, lightness capped at 11%) under everything; panels are a half-step lighter, never a second color',
      never: 'Text, or bright fills',
      coverage: '65–75%',
    },
    ink: {
      use: 'Headlines (uppercase, wide tracking), body copy and the quiet hairlines at low alpha',
      never: 'Large background fields in dark mode',
      coverage: '15–20%',
    },
    primary: {
      use: 'The one solid action (with a 1px gilt inner frame), the selected state and switch "on"; never a decorative line',
      never: 'Ornaments, borders, body text, a second CTA',
      coverage: '≈8–10%',
    },
    secondary: {
      use: 'Quiet support: status tags and the second bar in a chart; a tinted band behind an arch, kept under 10%',
      never: 'The main CTA, ornaments, body text',
      coverage: '≈5–8%',
    },
    accent: {
      use: 'The metal: every 1px line, double-rule frame, diamond, sunburst ray and the highlighted headline word. Lines and ornaments only',
      never: 'Fills, buttons, body text, large areas',
      coverage: '≤5%',
    },
  },

  // The field is pushed deep (<= 11% lightness) so the gilt lines glow against it.
  canvas(b) {
    if (!b.isDark) return null;
    const h = b.hexToHsl(b.canvas);
    return h.l > 11 ? b.hslToHex(h.h, Math.min(h.s, 42), 11) : b.canvas;
  },

  tokens(t) {
    const d = t.isDark;
    // interface face: the brand's own sans if it has one, else Inter (never a display face at 11px)
    const stU = typeof state !== 'undefined' ? state : null;
    const sansF = stU && [stU.bodyFont, stU.headingFont].find(f => f && f.category === 'sans');
    const uiFace = sansF ? (sansF === stU.bodyFont ? 'var(--ab-font-b)' : 'var(--ab-font-h)') : '"Inter", "Helvetica Neue", Helvetica, Arial, sans-serif';
    const gilt = t.accentInk;
    // t.mix(a, b, x) keeps x of a and 1 - x of b
    const panel = d ? t.mix(t.canvas, '#ffffff', 0.93) : t.mix(t.canvas, '#000000', 0.97);
    const hexOf = c => c;
    // 84x84 nine-slice frame: three nested 1px stepped-corner outlines (outer full, then 60% and 32%)
    const line = (e, o) => `<path d="M${e} 56V${20 + e}H${10 + e}V${10 + e}H${20 + e}V${e}H56" fill="none" stroke="${hexOf(gilt)}" stroke-opacity="${o}" stroke-width="1" shape-rendering="crispEdges"/>`;
    const quad = line(0, 1) + line(5, 0.6) + line(10, 0.32);
    const mirror = ['', ' matrix(-1 0 0 1 84 0)', ' matrix(1 0 0 -1 0 84)', ' matrix(-1 0 0 -1 84 84)'];
    const frameSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="84" height="84" viewBox="0 0 84 84">'
      + mirror.map(m => `<g${m ? ` transform="${m.trim()}"` : ''}><g transform="translate(.5 .5)">${quad}</g></g>`).join('') + '</svg>';
    const diaSvg = (fill, stroke) => `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11"><path d="M5.5.5 10.5 5.5 5.5 10.5.5 5.5Z" fill="${fill}" stroke="${stroke}"/></svg>`;
    return {
      '--ab-font-ui': uiFace, '--ab-font-label': uiFace,
      '--ab-tr': (typeof state !== 'undefined' && state.headingFont && { condensed: 0, heavy: 0, wide: 0.4, techno: 0.4 }[state.headingFont.cls]) ?? 1,
      '--ab-gilt': gilt,
      '--ab-gilt-a': t.alpha(gilt, 0.62),
      '--ab-gilt-b': t.alpha(gilt, 0.34),
      '--ab-gilt-c': t.alpha(gilt, 0.14),
      '--ab-panel': panel,
      '--ab-veil': t.alpha(t.canvas, 0.8),
      '--ab-ray': t.alpha(gilt, d ? 0.5 : 0.36),
      '--ab-pri-hover': t.mix(t.primary, '#ffffff', 0.86),
      '--ab-pri-press': t.mix(t.primary, '#000000', 0.8),
      '--ab-on-pri-press': t.readable(t.mix(t.primary, '#000000', 0.8)),
      '--ab-nd-frame': ndUri(frameSvg),
      '--ab-nd-dia': ndUri(diaSvg(panel, gilt)),
      '--ab-nd-dia-f': ndUri(diaSvg(gilt, gilt)),
    };
  },

  // A fan of rays rising from the bottom centre (a repeating conic gradient, faded
  // outward), semicircle echoes, and a stepped pedestal at the origin. The stepped,
  // ziggurat-cornered frame around the headline is drawn by the hero copy itself.
  art(ctx) {
    const g = ctx.t.accentInk;
    const arcs = [20, 33, 47, 62, 79, 98].map((r, i) =>
      `<path d="M${100 - r} 100A${r} ${r} 0 0 1 ${100 + r} 100" stroke-opacity="${(0.62 - i * 0.085).toFixed(2)}"/>`).join('');
    return `<div class="nds"><i class="nds-rays"></i>
      <svg class="nds-svg" viewBox="0 0 200 100" preserveAspectRatio="xMidYMax meet" focusable="false" fill="none" stroke="${g}" stroke-width="1">
        <g vector-effect="non-scaling-stroke">${arcs.replace(/<path /g, '<path vector-effect="non-scaling-stroke" ')}</g>
        <path vector-effect="non-scaling-stroke" d="M0 99.5H200" stroke-opacity=".5"/>
        <path vector-effect="non-scaling-stroke" d="M78 100V95H85V90H92V85H108V90H115V95H122V100" stroke-opacity=".9"/>
        <path vector-effect="non-scaling-stroke" d="M86 100V97H93V94H107V97H114V100" stroke-opacity=".5"/>
      </svg></div>`;
  },

  materials: [
    { name: 'Field', css: 'background: {canvas}; /* deep, lightness <= 11%; a half-step lighter panel: {panel} */' },
    { name: 'Gilt line', css: 'border: 1px solid {gilt}; /* the accent as metal: 1px lines at 62% / 34% / 14% alpha, never a fill */' },
    { name: 'Double-rule frame', css: 'background: {panel}; border: 1px solid {giltA}; box-shadow: inset 0 0 0 3px {panel}, inset 0 0 0 4px {giltA}; border-radius: 0; /* + 11px outline diamonds in the four inner corners */' },
    { name: 'Arch tile', css: 'border-radius: 999px 999px 0 0; background: <palette color>; box-shadow: 0 0 0 3px {canvas}, 0 0 0 4px {giltA}; /* palette swatches and the art window */' },
    { name: 'Ornamental rule', css: 'line, diamond, line: two 1px {giltB} lines meeting a 7px {gilt} diamond at the centre; replaces every plain divider' },
    { name: 'Primary action', css: 'background: {primary}; color: {onPrimary}; border-radius: 0; text-transform: uppercase; letter-spacing: .2em; box-shadow: inset 0 0 0 3px {primary}, inset 0 0 0 4px {gilt}; /* hover {priHover}; pressed {priPress} */' },
    { name: 'Stepped frame', css: 'border-image: 36px nine-slice, three nested 1px {gilt} outlines (100% / 60% / 32%) with two-step cut corners (10px and 20px steps), around the hero headline on a {veil} fill (canvas at 80%, the fan shows faintly through)' },
  ],

  rules: {
    do: [
      'Keep everything symmetric about the vertical axis: centered headline, centered ornaments, equal columns.',
      'Draw the accent as thin 1px gilt lines, double-rule frames and small diamonds; use stepped corners, not curves, except for arches.',
      'Set headlines in uppercase at weight 400 with .12em or wider tracking; give them room.',
      'Use the primary fill only for the one action, with a 1px gilt inner frame; keep the canvas deep.',
    ],
    dont: [
      'Fill any area with the accent or use it for body text; it is the metal, not a paint.',
      'Use shadows, blur or glassy gradients; depth is a second line, not a glow.',
      'Round controls or use soft pill shapes; the only curves are arches (999px 999px 0 0).',
      'Break symmetry with left-aligned stacks or diagonal tilts in the hero.',
    ],
  },
});
