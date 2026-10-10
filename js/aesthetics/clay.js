/* 09 Clay — puffy, colored objects with a soft 3D finish. Unlike Soft Form,
   objects are tinted with the brand colors rather than the canvas color.
   Look lives in css/aesthetics/clay.css. */
registerAesthetic({
  key: 'clay', order: 9,
  name: 'Clay',
  descriptor: 'Puffy · Joyful · Tangible',
  influences: 'Claymorphism / Toy design / Soft 3D',
  summary: 'Soft, colorful objects that look like they were made of modeling clay.',
  motto: 'Made by hand.',
  kicker: 'Soft and puffy',
  mode: 'light',
  slideShape: 'soft',
  labels: { material: 'Clay', states: ['Rest', 'Hover', 'Pressed'] },

  roles: {
    primary: {
      use: 'The one clay capsule action per view, the selected state and the "on" track of toggles',
      never: 'Body text, card fills, a second CTA',
    },
    secondary: {
      use: 'Card fills, chips shaped as beans, the torus in the art and the second data series',
      never: 'The main CTA, body text, page background',
    },
    accent: {
      use: 'The headline word in a clay pill and the focal object of the art',
      never: 'Buttons, body text, borders, large fills',
    },
  },

  // The page leans 8% toward the secondary so the clay has something to sit on.
  canvas(b) { return b.mix(b.secondary, b.canvas, 0.08); },

  tokens(t) {
    const d = t.isDark;
    // Outer clay shadow: the object color, darkened 45%.
    const sh = hex => t.alpha(t.mix('#000000', hex, 0.45), d ? 0.8 : 0.55);
    // Panel fills: a brand color eased into the canvas, with ink kept above 7:1.
    const fill = (hex, start) => {
      let a = start;
      const f = k => t.mix(hex, t.canvas, k);
      while (a > 0.08 && t.contrast(t.ink, f(a)) < 7) a -= 0.04;
      return f(a);
    };
    const pearl = t.mix('#ffffff', t.canvas, 0.9);
    return {
      '--ab-pri-sh': sh(t.primary),
      '--ab-sec-sh': sh(t.secondary),
      '--ab-acc-sh': sh(t.accent),
      '--ab-ink-sh': t.alpha(t.mix('#000000', t.canvas, 0.5), d ? 0.7 : 0.4),
      '--ab-clay-hi': d ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.6)',
      '--ab-clay-lo': d ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.12)',
      '--ab-card-fill': fill(t.secondary, 0.4),
      '--ab-panel-fill': fill(t.primary, 0.2),
      '--ab-obj': d ? t.mix('#ffffff', t.canvas, 0.09) : t.mix('#ffffff', t.canvas, 0.8),
      '--ab-pearl': pearl,
      '--ab-pearl-ink': t.readable(pearl),
    };
  },

  art(ctx) {
    // Three CSS "3D" primitives lit from the top left, each with a soft cast
    // shadow: a primary sphere, a secondary torus, an accent capsule.
    return '<div class="cla">'
      + '<i class="cla-sh cla-sh-a"></i><i class="cla-sh cla-sh-b"></i><i class="cla-sh cla-sh-c"></i>'
      + '<i class="cla-cap"></i>'
      + '<span class="cla-torus"><span class="cla-hole"></span></span>'
      + '<i class="cla-sphere"></i>'
      + '</div>';
  },

  materials: [
    { name: 'Clay object', css: 'background: radial-gradient(120% 90% at 30% 15%, rgba(255,255,255,.3), transparent 55%), {primary}; border-radius: 32px; box-shadow: 0 18px 36px -12px {priSh}, inset 0 -8px 16px {clayLo}, inset 0 8px 14px {clayHi};' },
    { name: 'Primary clay capsule', css: 'background: radial-gradient(120% 140% at 30% 0, rgba(255,255,255,.3), transparent 55%), {primary}; color: {onPrimary}; border-radius: 999px; box-shadow: 0 14px 24px -10px {priSh}, inset 0 -6px 12px {clayLo}, inset 0 6px 10px {clayHi}; /* hover: translateY(-3px) + larger shadow; pressed: scale(.97) + smaller shadow */' },
    { name: 'Card', css: 'background: {cardFill}; border-radius: 32px; box-shadow: 0 18px 36px -12px {secSh}, inset 0 -8px 16px {clayLo}, inset 0 8px 14px {clayHi};' },
    { name: 'Inset tray', css: 'background: color-mix(in srgb, {ink} 9%, {cardFill}); border-radius: 999px; box-shadow: inset 0 4px 10px {clayLo}, inset 0 -2px 0 {clayHi}; /* selected segment: puffy {pearl} pill, text {pearlInk} */' },
    { name: 'Bean chip', css: 'background: {secondary}; color: {onSecondary}; border-radius: 999px; box-shadow: 0 8px 14px -6px {secSh}, inset 0 -3px 6px {clayLo}, inset 0 3px 5px {clayHi};' },
    { name: 'Accent pill', css: 'background: {accent}; color: {onAccent}; border-radius: 999px; box-shadow: 0 10px 18px -8px {accSh}, inset 0 -5px 8px {clayLo}, inset 0 5px 8px {clayHi};' },
  ],

  rules: {
    do: [
      'Color the objects: sections and controls take the brand colors, not the canvas color.',
      'Give every object the same three layers: a soft colored drop shadow, a dark inner underside and a light inner top.',
      'Round everything generously: 32px on cards, full capsules on controls, large beans for chips.',
      'Make touch feel physical: lift 3px on hover, shrink to 97% on press with a smaller shadow.',
    ],
    dont: [
      'Fill objects with the canvas color; that is Soft Form, not Clay.',
      'Use hard edges, thin borders or black outlines.',
      'Use a harsh black drop shadow; shadows are the object color, darkened.',
      'Stack more than one saturated clay color in a single control.',
    ],
  },
});
