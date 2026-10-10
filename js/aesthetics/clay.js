/* 09 Clay — Dribbble-style claymorphism: near-white cards with a soft colored
   shadow, and the clay formula (soft colored drop shadow, dark underside, light
   top) on the OBJECTS: the CTA, chips, toggle knob, avatars, segmented
   selection and the art. Objects use a tonal ramp of the primary rather than
   every brand hue at once. Look lives in css/aesthetics/clay.css. */
registerAesthetic({
  key: 'clay', order: 9,
  name: 'Clay',
  descriptor: 'Puffy · Joyful · Tangible',
  influences: 'Claymorphism / Toy design / Soft 3D',
  summary: 'White cards holding soft, colorful objects that look like modeling clay.',
  motto: 'Made by hand.',
  kicker: 'Soft and puffy',
  mode: 'light',
  slideShape: 'soft',
  labels: { material: 'Clay', states: ['Rest', 'Hover', 'Pressed'], statesKind: 'button' },
  type: { ui: 'sans', label: 'sans' },
  highlight: 'custom',

  roles: {
    primary: {
      use: 'The one clay capsule action per view, the app-icon tile and the tonal ramp (lighter and darker steps) for objects: avatars, progress fills, the "on" track of toggles',
      never: 'Body text, card fills, a second CTA',
    },
    secondary: {
      use: 'Chips shaped as beans, the one torus in the art and the second data series',
      never: 'The main CTA, body text, card or page fills',
    },
    accent: {
      use: 'The headline word in a clay pill, once per view',
      never: 'Buttons, body text, borders, large fills, more than one object',
    },
  },

  // The page leans 8% toward the secondary so the clay has something to sit on.
  canvas(b) { return b.mix(b.secondary, b.canvas, 0.08); },

  tokens(t) {
    const d = t.isDark;
    // Outer clay shadow: the object color, darkened 45%.
    const sh = hex => t.alpha(t.mix('#000000', hex, 0.45), d ? 0.8 : 0.55);
    const priHi = t.mix('#ffffff', t.primary, 0.34);
    const priLo = t.mix('#000000', t.primary, 0.2);
    const pearl = t.mix('#ffffff', t.canvas, 0.9);
    return {
      '--ab-pri-sh': sh(t.primary),
      '--ab-sec-sh': sh(t.secondary),
      '--ab-acc-sh': sh(t.accent),
      '--ab-ink-sh': t.alpha(t.mix('#000000', t.canvas, 0.5), d ? 0.7 : 0.4),
      '--ab-pri-hi': priHi,
      '--ab-pri-hi-on': t.readable(priHi),
      '--ab-pri-hi-sh': sh(priHi),
      '--ab-pri-lo': priLo,
      '--ab-pri-lo-on': t.readable(priLo),
      '--ab-pri-lo-sh': sh(priLo),
      '--ab-clay-hi': d ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.6)',
      '--ab-clay-lo': d ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.12)',
      // Cards are near-white (canvas lightened 82%), lit from above, with a soft
      // shadow in the primary's tone.
      '--ab-card-fill': d ? t.mix('#ffffff', t.canvas, 0.07) : t.mix('#ffffff', t.canvas, 0.82),
      '--ab-card-sh': d ? 'rgba(0,0,0,0.55)' : t.alpha(t.mix('#000000', t.primary, 0.12), 0.26),
      '--ab-card-hi': d ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.95)',
      '--ab-card-lo': d ? 'rgba(0,0,0,0.3)' : 'rgba(60,50,70,0.05)',
      '--ab-obj': d ? t.mix('#ffffff', t.canvas, 0.09) : t.mix('#ffffff', t.canvas, 0.8),
      '--ab-pearl': pearl,
      '--ab-pearl-ink': t.readable(pearl),
    };
  },

  art(ctx) {
    // A clay "app icon" tile (primary, the brand initial embossed) as the focal
    // object, with a lighter-primary sphere, one secondary torus and a darker
    // primary capsule overlapping it; each has a soft contact shadow.
    return '<div class="cla">'
      + '<i class="cla-sh cla-sh-t"></i><i class="cla-sh cla-sh-s"></i><i class="cla-sh cla-sh-c"></i>'
      + '<span class="cla-torus"><span class="cla-hole"></span></span>'
      + '<i class="cla-cap"></i>'
      + `<div class="cla-tile"><span>${escapeHtml(ctx.initial)}</span></div>`
      + '<i class="cla-sphere"></i>'
      + '</div>';
  },

  materials: [
    { name: 'Clay object', css: 'background: radial-gradient(120% 90% at 30% 15%, rgba(255,255,255,.3), transparent 55%), {primary}; border-radius: 32px; box-shadow: 0 18px 36px -12px {priSh}, inset 0 -8px 16px {clayLo}, inset 0 8px 14px {clayHi}; /* objects take steps of the primary ramp: lighter {priHi}, base {primary}, darker {priLo} */' },
    { name: 'Primary clay capsule', css: 'background: radial-gradient(120% 140% at 30% 0, rgba(255,255,255,.3), transparent 55%), linear-gradient(160deg, {priHi}, {primary} 45%, {priLo} 130%); color: {onPrimary}; border-radius: 999px; box-shadow: 0 14px 24px -10px {priSh}, inset 0 -6px 12px {clayLo}, inset 0 6px 10px {clayHi}; /* hover: translateY(-3px) + larger shadow; pressed: scale(.97) + smaller shadow */' },
    { name: 'App icon tile', css: 'background: radial-gradient(120% 90% at 30% 12%, rgba(255,255,255,.3), transparent 55%), {primary}; border-radius: 28%; box-shadow: 0 24px 40px -14px {priSh}, inset 0 -10px 20px {clayLo}, inset 0 10px 18px {clayHi}; /* the brand initial embossed in the center */' },
    { name: 'Near-white card', css: 'background: {cardFill}; border-radius: 30px; box-shadow: 0 24px 44px -20px {cardSh}, inset 0 6px 12px {cardHi}, inset 0 -6px 14px {cardLo}; /* cards stay near-white; the colored shadow is the only tint */' },
    { name: 'Inset tray', css: 'background: color-mix(in srgb, {ink} 9%, {cardFill}); border-radius: 999px; box-shadow: inset 0 4px 10px {clayLo}, inset 0 -2px 0 {clayHi}; /* selected segment: puffy {pearl} pill, text {pearlInk} */' },
    { name: 'Bean chip', css: 'background: {secondary}; color: {onSecondary}; border-radius: 999px; box-shadow: 0 8px 14px -6px {secSh}, inset 0 -3px 6px {clayLo}, inset 0 3px 5px {clayHi};' },
    { name: 'Accent pill', css: 'background: {accent}; color: {onAccent}; border-radius: 999px; box-shadow: 0 10px 18px -8px {accSh}, inset 0 -5px 8px {clayLo}, inset 0 5px 8px {clayHi}; /* the headline word only, once per view */' },
  ],

  rules: {
    do: [
      'Keep cards near-white with a soft shadow in the primary\'s tone; the clay finish lives on the objects, not the panels.',
      'Give every object the same three layers: a soft colored drop shadow, a dark inner underside and a light inner top.',
      'Build objects from a tonal ramp of the primary (lighter, base, darker); secondary shows up in chips and one art object, accent once.',
      'Round everything generously: 30px on cards, full capsules on controls, large beans for chips.',
      'Make touch feel physical: lift 3px on hover, shrink to 97% on press with a smaller shadow.',
    ],
    dont: [
      'Fill whole cards with a brand color or beige; panels are near-white.',
      'Use hard edges, thin borders or black outlines.',
      'Use a harsh black drop shadow; shadows are the object color, darkened.',
      'Stack more than one saturated clay color in a single control.',
    ],
  },
});
