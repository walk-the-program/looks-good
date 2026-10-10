/* 06 Holo Iridescent — pearl surfaces edged in holographic foil, chrome
   pills and a static spectrum. The spectrum is fixed and decorative: it is
   never a brand color role. Look lives in css/aesthetics/holo-iridescent.css. */
registerAesthetic({
  key: 'holo-iridescent', order: 6,
  name: 'Holo Iridescent',
  descriptor: 'Pearl · Spectral · Precise',
  influences: 'Holographic foil / Y2K chrome / Luxury packaging',
  summary: 'Pearl-white surfaces with a fine holographic edge, like foil packaging.',
  motto: 'Catch the light.',
  kicker: 'Pearl and foil',
  mode: 'light',
  slideShape: 'refined',
  labels: { material: 'Finish', states: ['Matte', 'Pearl', 'Foil'] },

  roles: {
    primary: {
      use: 'The one solid action with a foil sheen, the "on" track of toggles and the thin ring in the art',
      never: 'Body text, large fills, a second CTA',
    },
    secondary: {
      use: 'Chips and tags, progress fills and the second data series',
      never: 'The main CTA, body text, page background',
    },
    accent: {
      use: 'One headline word, fading into the spectrum, and the footer dot',
      never: 'Buttons, body text, borders. The spectrum itself is decorative and is never a brand color',
    },
  },

  tokens(t) {
    const d = t.isDark;
    // Spectrum stops used as text must stay readable: pull each toward ink until 3.2:1.
    const legible = hex => {
      for (let a = 1; a >= 0; a -= 0.1) {
        const c = t.mix(hex, t.ink, a);
        if (t.contrast(c, t.canvas) >= 3.2) return c;
      }
      return t.ink;
    };
    const wash = d ? 0.07 : 0.42;
    const w = hex => t.alpha(hex, wash);
    const spec = ['#ff9ad5', '#8fe3ff', '#b79cff', '#8bf5c4', '#ffe08f'];
    return {
      '--ab-pearl': [
        `radial-gradient(55% 34% at 6% 0%, ${w('#ffd6f0')}, transparent)`,
        `radial-gradient(48% 30% at 96% 12%, ${w('#c9f6ff')}, transparent)`,
        `radial-gradient(60% 34% at 84% 58%, ${w('#e3d4ff')}, transparent)`,
        `radial-gradient(52% 32% at 4% 82%, ${w('#d6ffe9')}, transparent)`,
      ].join(','),
      '--ab-spec-conic': `conic-gradient(from 210deg, ${spec[0]}, ${spec[1]}, ${spec[2]}, ${spec[3]}, ${spec[4]}, ${spec[0]})`,
      '--ab-spec-linear': `linear-gradient(115deg, ${spec[0]}, ${spec[1]} 28%, ${spec[2]} 52%, ${spec[3]} 76%, ${spec[4]})`,
      '--ab-card-solid': d ? t.mix('#ffffff', t.canvas, 0.07) : t.mix('#ffffff', t.canvas, 0.7),
      '--ab-hair': t.alpha(t.ink, d ? 0.22 : 0.16),
      '--ab-hair-strong': t.alpha(t.ink, d ? 0.4 : 0.3),
      '--ab-chrome': 'linear-gradient(180deg, #f4f4f6 0%, #d9dbe1 45%, #ffffff 55%, #c9ccd4 100%)',
      '--ab-chrome-ink': '#17171b',
      '--ab-foil-sheen': 'linear-gradient(115deg, rgba(255,255,255,0) 44%, rgba(255,255,255,0.42) 54%, rgba(255,214,240,0.42) 60%, rgba(201,246,255,0.42) 66%, rgba(255,255,255,0) 78%)',
      '--ab-hl-fill': `linear-gradient(95deg, ${t.accentText} 0%, ${t.accentText} 30%, ${legible('#d6409f')} 52%, ${legible('#7a56e6')} 72%, ${legible('#12a37a')} 100%)`,
      '--ab-lift': `0 14px 34px -14px ${t.alpha(t.ink, d ? 0.7 : 0.24)}`,
    };
  },

  art(ctx) {
    // Orb with a Saturn-style ring (back half behind, front half in front),
    // a foil ribbon behind it and two sparkles. All CSS, static.
    return '<div class="hoa">'
      + '<i class="hoa-ribbon"></i><i class="hoa-ring hoa-ring-b"></i><i class="hoa-orb"></i>'
      + '<i class="hoa-ring hoa-ring-f"></i><i class="hoa-star hoa-star-1"></i><i class="hoa-star hoa-star-2"></i>'
      + '</div>';
  },

  materials: [
    { name: 'Pearl card', css: 'background: linear-gradient({cardSolid}, {cardSolid}) padding-box, {specConic} border-box; border: 1px solid transparent; border-radius: 20px; box-shadow: {lift}; /* the spectrum is only the 1px edge */' },
    { name: 'Foil primary', css: 'background: {foilSheen} padding-box, linear-gradient({primary}, {primary}) padding-box, {specConic} border-box; color: {onPrimary}; border: 1px solid transparent; border-radius: 12px; /* the sheen band is static */' },
    { name: 'Chrome pill', css: 'background: {chrome}; color: {chromeInk}; border-radius: 999px; box-shadow: inset 0 1px 0 #fff, 0 2px 6px rgba(20,20,40,.2); /* selected segment, toggle knob */' },
    { name: 'Spectrum headline word', css: 'background: {hlFill}; -webkit-background-clip: text; background-clip: text; color: transparent;' },
    { name: 'Hairline field', css: 'background: {cardSolid}; border: 1px solid {hairStrong}; border-radius: 12px; /* focus: swap the border for {specConic} plus a 3px lilac halo */' },
    { name: 'Pearl wash', css: 'background: {pearl}, {canvas}; /* fixed pastel spectrum, decorative only */' },
  ],

  rules: {
    do: [
      'Keep the foil to edges and accents: a 1px holographic border, one sheen band, one gradient word.',
      'Make surfaces pearl-white and let ink do the work; chrome pills carry ink text.',
      'Use the primary as a solid color under the foil sheen so the action stays unmistakable.',
      'Keep the spectrum static and fixed; it is a finish, not a palette.',
    ],
    dont: [
      'Fill large areas with the rainbow or use it as text outside the headline word.',
      'Animate the foil or follow the pointer with a shimmer.',
      'Treat spectrum colors as brand roles; only the five brand colors have jobs.',
      'Let the gradient word fall under 3:1 on the canvas; it falls back toward ink.',
    ],
  },
});
