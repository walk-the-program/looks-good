/* 06 Holo Iridescent — high-end iridescent branding: a near-black canvas, thin
   chromatic light (a thin-film soap-bubble rim, a spectral ribbon), near-black
   panels edged with a 1px iridescent hairline, solid primary actions with a
   thin spectral top edge. Light mode is the same recipe as a quiet pearl. The
   spectrum is fixed and decorative: it is never a brand color role. Look lives
   in css/aesthetics/holo-iridescent.css. */
(function () {
  let seq = 0;

  registerAesthetic({
    key: 'holo-iridescent', order: 6,
    name: 'Holo Iridescent',
    descriptor: 'Pearl · Spectral · Precise',
    influences: 'Iridescent branding / Thin-film light / Holographic foil',
    summary: 'A near-black field lit by thin spectral light: bubble rims, ribbons and hairline edges.',
    motto: 'Catch the light.',
    kicker: 'Thin-film light',
    mode: 'dark',
    slideShape: 'refined',
    labels: { material: 'Finish', states: ['Matte', 'Pearl', 'Foil'], statesKind: 'chip' },
    layout: { hero: 'centered' },
    type: { ui: 'sans', label: 'sans' },
    highlight: 'custom',
    highlightNote: 'The word is filled with the spectral thin-film gradient, clipped to the letters, with no background, band or outline.',

    roles: {
      canvas: {
        use: 'The near-black page (lightness capped at 8% in dark mode) and the base under every panel',
        never: 'Text, or a lighter flat "card" color; panels are near-black with a hairline edge',
        coverage: '70–80%',
      },
      primary: {
        use: 'The one solid action (with a thin spectral top edge), the "on" track of toggles and one small bead on the art ribbon',
        never: 'Body text, large fills, a second CTA',
      },
      secondary: {
        use: 'Chips and tags, progress fills, the second data series and the inner reflection arc of the art bubble',
        never: 'The main CTA, body text, page background',
      },
      accent: {
        use: 'One headline word, fading into the spectrum, and the footer dot',
        never: 'Buttons, body text, borders. The spectrum itself is decorative and is never a brand color',
      },
    },

    // Dark canvases are pushed to lightness <= 8% (and desaturated a little):
    // thin light needs real black to read as light.
    canvas(b) {
      if (!b.isDark) return null;
      const h = b.hexToHsl(b.canvas);
      return h.l > 8 || h.s > 30 ? b.hslToHex(h.h, Math.min(h.s, 30), Math.min(h.l, 8)) : b.canvas;
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
      // The pearl wash is quiet: ~15% in light mode, a barely-there glow in dark.
      const wash = d ? 0.06 : 0.15;
      const w = hex => t.alpha(hex, wash);
      const spec = ['#ff9ad5', '#8fe3ff', '#b79cff', '#8bf5c4', '#ffe08f'];
      // Art spectrum: bright light on black, deeper tones on pearl so it still reads.
      const art = d ? ['#ff8fd0', '#7fdcff', '#a98cff', '#7df0bd', '#ffd978'] : ['#e46bb4', '#4fb3e6', '#8f6bef', '#38c08f', '#ecb23e'];
      const hair = a => spec.map(c => t.alpha(c, a));
      const hairA = d ? 0.85 : 1;
      const h = hair(hairA);
      const rim = i => art[i];
      return {
      '--ab-tr': (typeof state !== 'undefined' && state.headingFont && { condensed: 0, heavy: 0, wide: 0.4, techno: 0.4 }[state.headingFont.cls]) ?? 1,
      
        '--ab-pearl': [
          `radial-gradient(55% 34% at 6% 0%, ${w('#ffd6f0')}, transparent)`,
          `radial-gradient(48% 30% at 96% 12%, ${w('#c9f6ff')}, transparent)`,
          `radial-gradient(60% 34% at 84% 58%, ${w('#e3d4ff')}, transparent)`,
          `radial-gradient(52% 32% at 4% 82%, ${w('#d6ffe9')}, transparent)`,
        ].join(','),
        '--ab-spec-conic': `conic-gradient(from 210deg, ${h[0]}, ${h[1]}, ${h[2]}, ${h[3]}, ${h[4]}, ${h[0]})`,
        '--ab-spec-linear': `linear-gradient(115deg, ${h[0]}, ${h[1]} 28%, ${h[2]} 52%, ${h[3]} 76%, ${h[4]})`,
        '--ab-rim-conic': `conic-gradient(from 200deg, ${rim(0)}, ${rim(1)}, ${rim(2)}, ${rim(3)}, ${rim(4)}, ${rim(0)})`,
        '--ab-rim-conic-2': `conic-gradient(from 20deg, ${rim(2)}, ${rim(3)}, ${rim(4)}, ${rim(0)}, ${rim(1)}, ${rim(2)})`,
        '--ab-rim-glow': t.alpha(art[2], d ? 0.3 : 0.16),
        '--ab-card-solid': d ? t.mix('#ffffff', t.canvas, 0.035) : t.mix('#ffffff', t.canvas, 0.7),
        '--ab-hair': t.alpha(t.ink, d ? 0.16 : 0.14),
        '--ab-hair-strong': t.alpha(t.ink, d ? 0.34 : 0.28),
        '--ab-hl-line': d ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
        '--ab-chrome': 'linear-gradient(180deg, #f4f4f6 0%, #d9dbe1 45%, #ffffff 55%, #c9ccd4 100%)',
        '--ab-chrome-ink': '#17171b',
        '--ab-hl-fill': `linear-gradient(95deg, ${t.accentInk} 0%, ${t.accentInk} 26%, ${legible('#d6409f')} 52%, ${legible('#7a56e6')} 74%, ${legible('#12a37a')} 100%)`,
        '--ab-lift': d ? '0 24px 40px -26px rgba(0,0,0,0.9)' : `0 14px 34px -16px ${t.alpha(t.ink, 0.2)}`,
        '--ab-cta-glow': t.alpha(t.primary, d ? 0.42 : 0.5),
      };
    },

    // A thin-film soap bubble (transparent centre, a blurred conic rim bright at
    // the top left, an inner secondary reflection arc) crossed by one spectral
    // ribbon. Static, decorative; the stage and bubble are styled in the css.
    art(ctx) {
      const t = ctx.t;
      const id = 'hoa' + (++seq);
      const d = t.isDark;
      const art = d ? ['#ff8fd0', '#7fdcff', '#a98cff', '#7df0bd', '#ffd978'] : ['#e46bb4', '#4fb3e6', '#8f6bef', '#38c08f', '#ecb23e'];
      const stops = [0.05, 0.22, 0.42, 0.62, 0.8, 0.95]
        .map((o, i) => `<stop offset="${o}" stop-color="${art[i % 5]}" stop-opacity="${i === 0 || i === 5 ? 0 : 1}"/>`).join('');
      const main = 'M-6 66 C28 88 56 66 82 44 S128 6 168 20';
      const strands = [[0, 1.7, 1], [2.6, 1, 0.55], [5.2, 0.6, 0.3]]
        .map(s => `<path d="${main}" transform="translate(0 ${s[0]})" fill="none" stroke="url(#${id}g)" stroke-width="${s[1]}" stroke-opacity="${s[2]}" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`).join('');
      const sec = t.secondary;
      return `<div class="hoa">
        <i class="hoa-bloom"></i>
        <div class="hob">
          <i class="hob-halo"></i><i class="hob-body"></i><i class="hob-film"></i><i class="hob-rim"></i><i class="hob-rim hob-rim-hi"></i>
          <svg class="hob-arcs" viewBox="0 0 100 100" focusable="false">
            <path d="M87.2 67.3 A41 41 0 0 1 60.6 89.6" fill="none" stroke="${sec}" stroke-width="3" stroke-linecap="round" opacity=".5" style="filter:blur(2px)"/>
            <path d="M87.2 67.3 A41 41 0 0 1 60.6 89.6" fill="none" stroke="${sec}" stroke-width="1.3" stroke-linecap="round" opacity=".95"/>
            <path d="M15.6 33.9 A38 38 0 0 1 33.7 15.5" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".85"/>
            <circle cx="39" cy="12.6" r="0.9" fill="#fff" opacity=".8"/>
          </svg>
        </div>
        <svg class="hoa-ribbon" viewBox="0 0 160 80" preserveAspectRatio="none" focusable="false">
          <defs><linearGradient id="${id}g" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="160" y2="0">${stops}</linearGradient></defs>
          <path d="${main}" fill="none" stroke="url(#${id}g)" stroke-width="7" stroke-opacity=".6" vector-effect="non-scaling-stroke" style="filter:blur(5px)"/>
          ${strands}
        </svg>
        <i class="hoa-bead" style="left:74.8%;top:23.1%"></i>
      </div>`;
    },

    materials: [
      { name: 'Iridescent panel', css: 'background: linear-gradient({cardSolid}, {cardSolid}) padding-box, {specConic} border-box; border: 1px solid transparent; border-radius: 20px; box-shadow: {lift}; /* near-black panel; the spectrum is only the 1px hairline edge */' },
      { name: 'Solid primary with spectral edge', css: 'background: {primary}; color: {onPrimary}; border-radius: 12px; box-shadow: inset 0 1px 0 rgba(255,255,255,.25), 0 12px 24px -12px {ctaGlow}; /* plus a 1.5px {specLinear} line along the top edge; no foil band across the label */' },
      { name: 'Chrome pill', css: 'background: {chrome}; color: {chromeInk}; border-radius: 999px; box-shadow: inset 0 1px 0 #fff, 0 2px 6px rgba(20,20,40,.2); /* selected segment, toggle knob */' },
      { name: 'Spectrum headline word', css: 'background: {hlFill}; -webkit-background-clip: text; background-clip: text; color: transparent; /* starts at {accentInk}, then fades into the spectrum */' },
      { name: 'Thin-film bubble', css: 'background: transparent; border-radius: 50%; /* a transparent centre with a 1.5px blurred rim in {rimConic}, brighter at the top left, and an inner {secondary} reflection arc */' },
      { name: 'Hairline field', css: 'background: {cardSolid}; border: 1px solid {hairStrong}; border-radius: 12px; /* focus: swap the border for {specConic} plus a 3px lilac halo */' },
      { name: 'Pearl wash', css: 'background: {pearl}, {canvas}; /* fixed pastel spectrum at ~15% in light mode, a faint glow in dark; decorative only */' },
    ],

    rules: {
      do: [
        'Keep the canvas near-black and let thin light do the work: a 1px iridescent hairline, one bubble rim, one ribbon, one gradient word.',
        'Make panels near-black (canvas lightened 3.5%) with an iridescent hairline edge; no pastel wash on panels.',
        'Use the primary as a solid color with a thin spectral line along its top edge; never a wide foil band across the label.',
        'Keep the spectrum static and fixed; it is a finish, not a palette. In light mode it becomes a quiet pearl wash at ~15%.',
      ],
      dont: [
        'Fill large areas with the rainbow or use it as text outside the headline word.',
        'Animate the foil or follow the pointer with a shimmer.',
        'Treat spectrum colors as brand roles; only the five brand colors have jobs.',
        'Use a planet, an orb or a sheen band; the art is a thin bubble rim and a ribbon.',
        'Let the gradient word fall under 3:1 on the canvas; it starts at the shaded accent.',
      ],
    },
  });
})();
