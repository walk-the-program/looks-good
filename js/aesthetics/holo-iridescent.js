/* 06 Holo Iridescent — high-end iridescent branding (Cru+, Black & Bone, thin-film
   physics): a pearl ground, one large foil plane as the hero object (banded
   interference fringes plus an angle sweep), a soap bubble on its corner, quiet
   hairline panels with one featured card edged in the spectrum, solid primary
   actions with a flush spectral top edge. Dark mode is strict black with the
   same foil object. The spectrum is fixed and decorative: it is never a brand
   color role. Look lives in css/aesthetics/holo-iridescent.css. */
(function () {
  let seq = 0;

  registerAesthetic({
    key: 'holo-iridescent', order: 6,
    name: 'Holo Iridescent',
    descriptor: 'Pearl · Spectral · Precise',
    influences: 'Iridescent branding / Thin-film light / Holographic foil',
    summary: 'A pearl ground and one large foil surface whose color drifts with the angle, like printed holographic foil.',
    motto: 'Catch the light.',
    kicker: 'Thin-film foil',
    // Pearl is the default ground (Cru+ prints on pale lilac stock); dark is strict black.
    mode: 'light',
    slideShape: 'refined',
    labels: { material: 'Finish', states: ['Matte', 'Pearl', 'Foil'], statesKind: 'chip' },
    // Editable specimen copy (Brand > Advanced > Specimen copy). The art carries no printed text.
    copy: {
      motto: { label: 'Motto', text: 'Catch the light.' },
      kicker: { label: 'Kicker above the headline', text: 'Thin-film foil' },
      state0: { label: 'State 1 name', text: 'Matte' },
      state1: { label: 'State 2 name', text: 'Pearl' },
      state2: { label: 'State 3 name', text: 'Foil' },
    },
    // split: copy left, the foil plane bleeding off the right edge; strips: the palette as flat planes
    layout: { hero: 'split', palette: 'strips' },
    type: { ui: 'sans', label: 'sans', display: 1.1 },
    highlight: 'custom',
    highlightNote: 'The word is filled with the spectral thin-film gradient, clipped to the letters, with no background, band or outline.',

    roles: {
      canvas: {
        use: 'The pearl page under a fixed pastel wash (near-black, lightness capped at 8%, in dark mode) and the base under every panel',
        never: 'Text, or a saturated card color; panels are canvas-solid with a hairline edge',
        coverage: '70–80%',
      },
      primary: {
        use: 'The one solid action (with a thin spectral top edge) and the "on" track of toggles',
        never: 'Body text, large fills, a second CTA',
      },
      secondary: {
        use: 'Progress fills, the second data series and selected tags',
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
      // The pearl wash: ~22% in light mode, a barely-there glow in dark.
      const wash = d ? 0.06 : 0.22;
      const w = hex => t.alpha(hex, wash);
      const spec = ['#ff9ad5', '#8fe3ff', '#b79cff', '#8bf5c4', '#ffe08f'];
      const hair = a => spec.map(c => t.alpha(c, a));
      const hairA = d ? 0.85 : 1;
      const h = hair(hairA);
      // muted labels sit on the pearl wash (canvas tinted up to 22%): pull them toward ink until
      // they hold 4.7:1 on the canvas, which leaves room for the tint
      let muted = t.muted;
      for (let k = 0.05; k <= 1.001 && t.contrast(muted, t.canvas) < 4.7; k += 0.05) muted = t.mix(t.ink, t.muted, k);
      return {
        '--ab-muted': muted,
        '--ho-hl-solid': legible(t.accentInk),
        '--ab-pearl': [
          `radial-gradient(55% 34% at 6% 0%, ${w('#ffd6f0')}, transparent)`,
          `radial-gradient(48% 30% at 96% 12%, ${w('#c9f6ff')}, transparent)`,
          `radial-gradient(60% 34% at 84% 58%, ${w('#e3d4ff')}, transparent)`,
          `radial-gradient(52% 32% at 4% 82%, ${w('#d6ffe9')}, transparent)`,
        ].join(','),
        '--ab-spec-conic': `conic-gradient(from 210deg, ${h[0]}, ${h[1]}, ${h[2]}, ${h[3]}, ${h[4]}, ${h[0]})`,
        '--ab-spec-linear': `linear-gradient(115deg, ${h[0]}, ${h[1]} 28%, ${h[2]} 52%, ${h[3]} 76%, ${h[4]})`,
        '--ab-card-solid': d ? t.mix('#ffffff', t.canvas, 0.035) : t.mix('#ffffff', t.canvas, 0.7),
        '--ab-hair': t.alpha(t.ink, d ? 0.16 : 0.14),
        '--ab-hair-strong': t.alpha(t.ink, d ? 0.34 : 0.28),
        '--ab-hl-line': d ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
        '--ab-chrome': 'linear-gradient(180deg, #f4f4f6 0%, #d9dbe1 45%, #ffffff 55%, #c9ccd4 100%)',
        '--ab-chrome-ink': '#17171b',
        // the word starts on the accent shaded to 3.2:1 (accentInk is 3:1 and measured 2.99 at 390px)
        '--ab-hl-fill': `linear-gradient(95deg, ${legible(t.accentInk)} 0%, ${legible(t.accentInk)} 26%, ${legible('#d6409f')} 52%, ${legible('#7a56e6')} 74%, ${legible('#12a37a')} 100%)`,
        '--ab-lift': d ? '0 24px 40px -26px rgba(0,0,0,0.9)' : `0 14px 34px -16px ${t.alpha(t.ink, 0.2)}`,
        '--ab-cta-glow': t.alpha(t.primary, d ? 0.42 : 0.5),
        '--ab-type-pick-w': 300,
      };
    },

    // The hero object is a foil plane: one large pearl card tilted in perspective,
    // its surface built from interference fringes (repeating radial bands in the
    // fixed thin-film order) and an angle term (a conic sweep), so the hue drifts
    // across the plane the way printed foil does. The brand initial is debossed in
    // its lower right. A soap bubble overlaps one corner: an SVG ring of spectral
    // wedges swirled by turbulence (so it exports through html2canvas), with a
    // thinning "black spot" at the top and a thin white rim. The spectrum is
    // fixed and decorative, never a brand color.
    art(ctx) {
      const id = 'hoa' + (++seq);
      const initial = ctx.initial && ctx.initial !== '·' ? escapeHtml(ctx.initial) : '';
      const spec = ['#ff9ad5', '#8fe3ff', '#b79cff', '#8bf5c4', '#ffe08f'];
      // 40 wedges of 9deg around (45, 28): a repeating conic sweep drawn as paths. The thinning
      // "black spot" (a canvas-colored glow at the top) is left out in dark mode, where the
      // canvas is near-black and the spot read as a muddy blot in the middle of the lens.
      const cx = 45, cy = 28, R = 90;
      let wedges = '';
      for (let i = 0; i < 40; i++) {
        const a0 = (i * 9 + 10) * Math.PI / 180, a1 = ((i + 1) * 9 + 10.6) * Math.PI / 180;
        const p = a => `${(cx + R * Math.sin(a)).toFixed(2)} ${(cy - R * Math.cos(a)).toFixed(2)}`;
        wedges += `<path d="M${cx} ${cy} L${p(a0)} L${p(a1)} Z" fill="${spec[i % 5]}"/>`;
      }
      const bubble = `<svg class="hob" viewBox="0 0 100 100" focusable="false" aria-hidden="true"><defs>
          <filter id="${id}s" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="14" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation=".5"/></filter>
          <radialGradient id="${id}r"><stop offset=".56" stop-color="#fff" stop-opacity="0"/><stop offset=".7" stop-color="#fff"/><stop offset=".95" stop-color="#fff"/><stop offset=".99" stop-color="#fff" stop-opacity="0"/></radialGradient>
          <mask id="${id}m"><circle cx="50" cy="50" r="50" fill="url(#${id}r)"/></mask>
          <radialGradient id="${id}k" cx=".5" cy=".12" r=".22"><stop offset="0" stop-color="${ctx.t.canvas}" stop-opacity=".6"/><stop offset="1" stop-color="${ctx.t.canvas}" stop-opacity="0"/></radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48.5" fill="rgba(255,255,255,.06)"/>
        <g mask="url(#${id}m)" opacity=".5"><g filter="url(#${id}s)">${wedges}</g></g>
        ${ctx.t.isDark ? '' : `<circle cx="50" cy="50" r="49" fill="url(#${id}k)"/>`}
        <circle cx="50" cy="50" r="49.2" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width=".6"/>
      </svg>`;
      return `<div class="hoa">
        <div class="hof"><i class="hof-fringe"></i><i class="hof-angle"></i><i class="hof-sheen"></i><b class="hof-mark">${initial}</b></div>
        ${bubble}
      </div>`;
    },

    materials: [
      { name: 'Foil plane', css: 'background: #ece8f1; border-radius: 2.4cqw; transform: perspective(900px) rotateX(16deg) rotate(-8deg); /* layer 1: repeating-radial-gradient(circle at 28% 118%, #ff9ad5 0 2.2cqw, #8fe3ff 3.4cqw, #b79cff 4.6cqw, #8bf5c4 5.8cqw, #ffe08f 7cqw, #ff9ad5 8.2cqw) at 62% alpha; layer 2: conic-gradient(from 200deg at 72% 30%, the same five stops) at 40% alpha; the brand initial debossed (transparent text, white 1px highlight below, dark 1px shadow above) */' },
      { name: 'Featured panel', css: 'background: linear-gradient({cardSolid}, {cardSolid}) padding-box, {specConic} border-box; border: 1px solid transparent; border-radius: 20px; box-shadow: {lift}; /* the ONE featured surface; every other panel is {cardSolid} with a 1px {hair} border */' },
      { name: 'Solid primary with spectral edge', css: 'background: {primary}; color: {onPrimary}; border-radius: 12px; box-shadow: inset 0 1px 0 rgba(255,255,255,.25), 0 12px 24px -12px {ctaGlow}; /* plus a 1.5px {specLinear} line along the top edge; no foil band across the label */' },
      { name: 'Chrome pill', css: 'background: {chrome}; color: {chromeInk}; border-radius: 999px; box-shadow: inset 0 1px 0 #fff, 0 2px 6px rgba(20,20,40,.2); /* selected segment, toggle knob */' },
      { name: 'Spectrum headline word', css: 'background: {hlFill}; -webkit-background-clip: text; background-clip: text; color: transparent; /* starts at {accentInk}, then fades into the spectrum */' },
      { name: 'Thin-film bubble', css: 'border-radius: 50%; /* transparent centre; a ring of spectral fringes (repeating conic sweep from 10deg at 45% 28%) swirled by turbulence, fading in from 56% of the radius; a thinner, darker "black spot" at the top; a thin white rim */' },
      { name: 'Hairline field', css: 'background: {cardSolid}; border: 1px solid {hairStrong}; border-radius: 12px; /* focus: swap the border for {specConic} plus a 3px lilac halo */' },
      { name: 'Pearl wash', css: 'background: {pearl}, {canvas}; /* fixed pastel spectrum at ~22% in light mode, a faint glow in dark; decorative only */' },
    ],

    rules: {
      do: [
        'Make the foil a surface: one large plane whose hue drifts in bands across it, never a 1px border on everything.',
        'Keep the ground pearl (or strict black) and the type quiet; the foil is the statement.',
        'Use the primary as a solid color with a flush spectral line along its top edge; never a wide foil band across the label.',
        'Keep the spectrum static and fixed; it is a finish, not a palette.',
        'Give exactly one panel the spectral hairline; the rest are solid with a plain hairline.',
      ],
      dont: [
        'Sweep a smooth five-stop rainbow left to right and call it foil; thin film comes in bands.',
        'Put rainbow borders on every panel, chip and rule.',
        'Animate the foil or follow the pointer with a shimmer.',
        'Treat spectrum colors as brand roles; only the five brand colors have jobs.',
        'Let the gradient word fall under 3:1 on the canvas; it starts at the shaded accent.',
      ],
    },
    // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
    deck: {
      // No pattern band or strip: the foil plane is the cover. The fixed spectrum is three
      // flat inks, so any band of it reads as op-art rings rather than thin film.
      coverBand: false,
      closingStrip: false,
      coverDisplay: 0.78,   // Unbounded is wide; a smaller start keeps the foil plane large
      principles: [
        ['Foil is a surface', 'One large plane whose color drifts in bands.'],
        ['The primary stays solid', 'With a thin spectral line along its top edge.'],
        ['The spectrum stays still', 'It is a finish, not a palette.'],
      ],
      do: [
        'Keep the ground pearl or strict black.',
        'Let one foil plane be the statement.',
        'Use the primary as a solid color.',
      ],
      dont: [
        'Put rainbow borders on every panel.',
        'Animate the foil.',
        'Treat spectrum colors as brand roles.',
      ],
    },
  });
})();
