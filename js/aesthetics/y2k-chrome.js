/* 13 Y2K Chrome — liquid, metallic, hyper. Reference: 2000s chrome logos, Dazed
   Y2K revival, acid-graphics posters. Opaque polished metal (not glass): a
   multi-stop silver gradient with an off-centre horizon on the headline (given
   volume by a bevel lighting filter) and the rims, gel pill buttons with a hard
   top specular and a bottom caustic, label type in a Microgramma-style techno
   face, and an SVG metaball "liquid chrome" sculpture (bent horizon, 1px rim,
   one softbox highlight, mirrored floor reflection) on a near-black field with
   a faint primary glow. The one acid accent is a flat, hard-edged plate. */
let y2kSeq = 0;

// Largest published weight <= target (or the lightest if none): faces with a
// single weight must not be asked for 800 (the browser would fake it).
function y2kWeight(font, target) {
  const ws = String((font && font.weights) || '400').split(';').map(Number).filter(Boolean);
  const le = ws.filter(w => w <= target);
  return le.length ? Math.max(...le) : Math.min(...ws);
}

registerAesthetic({
  key: 'y2k-chrome', order: 13,
  name: 'Y2K Chrome',
  descriptor: 'Liquid · Metallic · Hyper',
  influences: 'Y2K web / Chrome type / Acid graphics',
  summary: 'Heavy liquid chrome and blobby forms on a near-black field.',
  motto: 'Shine like it is 2001.',
  kicker: 'Liquid metal  /  MRG-01\u2122',
  mode: 'dark',
  slideShape: 'soft',
  labels: { material: 'Chrome', states: ['Gel', 'Polished', 'Liquid'], statesKind: 'swatch' },
  layout: { hero: 'split', palette: 'chips', sections: 'two-col' },
  type: { ui: 'sans', label: 'sans', display: 1 },
  highlight: 'custom',
  highlightNote: 'The word sits on a flat, hard-edged acid plate (a square block of the accent, not rotated, with a tiny trademark mark) set in the darkest ink on it: a flat colour block against the chrome, never accent-colored text.',

  roles: {
    canvas: {
      use: 'The near-black field (lightness capped at 7%) with a faint primary glow behind the art; metal panels are alphas of white over it',
      never: 'Text, or a bright fill',
      coverage: '65–70%',
    },
    ink: {
      use: 'Body text and small labels; headlines and rims use the fixed chrome gradient instead',
      never: 'Large fields',
      coverage: '10–15%',
    },
    primary: {
      use: 'The one glossy pill action, the selected segment, switch "on", progress tubes and the colored edge-light on the chrome sculpture',
      never: 'Body text, headline fill (that is chrome), a second CTA',
      coverage: '≈10%',
    },
    secondary: {
      use: 'The cool edge-light on the sculpture and the second progress tint; status text on chrome pills stays dark',
      never: 'The main action, body text',
      coverage: '≈6–10%',
    },
    accent: {
      use: 'The flat acid plate behind the highlighted headline word, and nothing else. A hit of acid, never a button',
      never: 'Buttons, body text, borders, large fills',
      coverage: '≤5%',
    },
  },

  // near-black with a trace of the primary so the field is not dead neutral
  canvas(b) {
    if (!b.isDark) return null;
    const h = b.hexToHsl(b.canvas);
    const dark = h.l > 7 ? b.hslToHex(h.h, Math.min(h.s, 30), 7) : b.canvas;
    return b.mix(b.primary, dark, 0.05);
  },

  tokens(t) {
    const d = t.isDark;
    // interface face: the brand's own sans if it has one, else Inter (never a display face at 11px)
    const stU = typeof state !== 'undefined' ? state : null;
    const sansF = stU && [stU.bodyFont, stU.headingFont].find(f => f && f.category === 'sans');
    const uiFace = sansF ? (sansF === stU.bodyFont ? 'var(--ab-font-b)' : 'var(--ab-font-h)') : '"Inter", "Helvetica Neue", Helvetica, Arial, sans-serif';
    const st = typeof state !== 'undefined' ? state : null;
    const hf = st && st.headingFont;
    const brightAccent = t.contrast(t.accent, '#000000') >= t.contrast(t.accent, '#ffffff');
    // the signature: silver with a hard horizon (light sky, bright line, dark ground, bounce light)
    // sky is cooled by the secondary and the dark ground warmed by the primary, so the metal reflects the brand
    const sky = t.mix(t.secondary, '#dfe9f7', 0.14), gnd = t.mix(t.primary, '#4a505b', 0.22), bounce = t.mix(t.primary, '#c9ced6', 0.12);
    const chrome = d
      ? `linear-gradient(180deg,#ffffff 0%,${sky} 22%,#8e9aab 44%,#1b1e24 49%,${gnd} 55%,${bounce} 72%,#ffffff 88%,#aab2bd 100%)`
      : 'linear-gradient(180deg,#14171c 0%,#454b53 28%,#8a9199 44%,#e9edf0 48%,#2a2e34 50.5%,#5f666e 74%,#0c0e12 100%)';
    const chromeDark = 'linear-gradient(180deg,#4a4f56 0%,#16181c 45%,#8e949b 49%,#0e1013 50.5%,#2a2d32 100%)';
    const chromeLight = 'linear-gradient(180deg,#ffffff 0%,#d6dadf 40%,#9aa0a6 49%,#f4f4f4 50.5%,#c4c9cf 100%)';
    return {
      // techno micro-type (Microgramma-like) for labels, tags and state names; falls back to the UI face
      '--ab-font-ui': uiFace, '--ab-font-label': uiFace, '--y2-techno': `"Michroma", ${uiFace}`,
      '--ab-hw': y2kWeight(hf, 800),
      '--ab-chrome': chrome,
      // flat stand-in for the chrome fill: the PNG/PDF export flattens clipped text to this colour
      '--ab-chrome-flat': d ? '#dfe5ee' : '#2a2e34',
      '--ab-pri-70': t.alpha(t.primary, 0.7),
      '--ab-chrome-hl': brightAccent ? chromeDark : chromeLight,
      '--ab-chrome-fixed': 'linear-gradient(180deg,#ffffff 0%,#c9ced4 22%,#9aa0a6 44%,#f4f4f4 49%,#5f646b 50.5%,#7d838a 70%,#e8e8e8 100%)',
      '--ab-rim': d
        ? 'linear-gradient(155deg,rgba(255,255,255,.85),rgba(255,255,255,.16) 28%,rgba(255,255,255,.5) 52%,rgba(255,255,255,.1) 76%,rgba(255,255,255,.6))'
        : 'linear-gradient(155deg,rgba(0,0,0,.7),rgba(0,0,0,.14) 28%,rgba(0,0,0,.45) 52%,rgba(0,0,0,.1) 76%,rgba(0,0,0,.55))',
      '--y2-grain': d ? 'rgba(255,255,255,.022)' : 'rgba(0,0,0,.025)',
      '--ab-metal-hi': d ? t.mix('#ffffff', t.canvas, 0.1) : t.mix('#ffffff', t.canvas, 0.78),
      '--ab-metal-lo': d ? t.mix('#ffffff', t.canvas, 0.035) : t.mix('#ffffff', t.canvas, 0.5),
      '--ab-well': d ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.08)',
      '--ab-gloss': 'linear-gradient(180deg,rgba(255,255,255,.62) 0,rgba(255,255,255,.14) 49%,rgba(255,255,255,0) 51%)',
      '--ab-pri-glow': t.alpha(t.primary, d ? 0.5 : 0.36),
      '--ab-pri-glow-35': t.alpha(t.primary, 0.35),
      '--ab-pri-deep': t.mix(t.primary, '#000000', 0.62),
      '--ab-pri-hi': t.mix(t.primary, '#ffffff', 0.78),
      '--ab-sec-glow': t.alpha(t.secondary, 0.4),
      '--ab-acc-glow': t.alpha(t.accent, 0.55),
    };
  },

  // Metaballs: five circles blurred and thresholded (feGaussianBlur + feColorMatrix alpha curve)
  // into one liquid silhouette, used as a mask over a chrome gradient. The gradient rect is
  // bent by a low-frequency displacement map so the horizon curves around the lobes instead of
  // cutting a ruler-straight line, brand-colored edge-light washes are laid over it, a 1px
  // bright rim (silhouette minus its eroded copy) runs round every lobe, and one softbox
  // "window" specular (with a mullion) replaces round cartoon dots. A mirrored, faded copy of
  // the finished sculpture stands in for the floor. One white lens glint is the only sparkle.
  art(ctx) {
    const t = ctx.t;
    const n = 'y2k' + (++y2kSeq);
    const ground = t.mix(t.primary, '#6b7178', 0.3);
    const chromeStops = `<stop offset="0" stop-color="#ffffff"/><stop offset=".14" stop-color="#e3e6ea"/><stop offset=".44" stop-color="#6f777f"/><stop offset=".495" stop-color="#f6f6f6"/><stop offset=".515" stop-color="#23262b"/><stop offset=".74" stop-color="${ground}"/><stop offset="1" stop-color="#eef0f2"/>`;
    const blobs = '<circle cx="43" cy="58" r="25"/><circle cx="71" cy="35" r="15.5"/><circle cx="68" cy="78" r="10"/><circle cx="22" cy="28" r="6.5"/><circle cx="19" cy="82" r="10.5"/>';
    const thresh = '<feGaussianBlur stdDeviation="3.3"/><feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 30 -13"/>';
    return `<svg class="y2s" viewBox="0 0 100 100" width="100%" height="100%" focusable="false" overflow="visible">
      <defs>
        <linearGradient id="${n}c" gradientUnits="userSpaceOnUse" x1="0" y1="14" x2="0" y2="92">${chromeStops}</linearGradient>
        <radialGradient id="${n}p" gradientUnits="userSpaceOnUse" cx="14" cy="92" r="46"><stop offset="0" stop-color="${t.primary}" stop-opacity="1"/><stop offset=".55" stop-color="${t.primary}" stop-opacity=".5"/><stop offset="1" stop-color="${t.primary}" stop-opacity="0"/></radialGradient>
        <radialGradient id="${n}s" gradientUnits="userSpaceOnUse" cx="96" cy="8" r="40"><stop offset="0" stop-color="${t.secondary}" stop-opacity=".9"/><stop offset=".55" stop-color="${t.secondary}" stop-opacity=".4"/><stop offset="1" stop-color="${t.secondary}" stop-opacity="0"/></radialGradient>
        <linearGradient id="${n}f" gradientUnits="userSpaceOnUse" x1="0" y1="92" x2="0" y2="104"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>
        <linearGradient id="${n}w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity=".5"/></linearGradient>
        <mask id="${n}fm" maskUnits="userSpaceOnUse" x="-20" y="90" width="140" height="24"><rect x="-20" y="90" width="140" height="24" fill="url(#${n}f)"/></mask>
        <filter id="${n}g" x="-25%" y="-25%" width="150%" height="150%">${thresh}</filter>
        <filter id="${n}r" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">${thresh}<feMorphology operator="erode" radius="1.1" result="in"/><feComposite in="SourceGraphic" in2="in" operator="out"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .7 0"/></filter>
        <filter id="${n}d" filterUnits="userSpaceOnUse" x="-30" y="-30" width="160" height="160"><feTurbulence type="fractalNoise" baseFrequency=".034 .046" numOctaves="1" seed="${(y2kSeq * 7) % 90 + 3}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="24" xChannelSelector="R" yChannelSelector="G" result="dd"/><feGaussianBlur in="dd" stdDeviation=".5"/></filter>
        <mask id="${n}m" maskUnits="userSpaceOnUse" x="-10" y="-10" width="120" height="120"><g filter="url(#${n}g)" fill="#fff">${blobs}</g></mask>
        <g id="${n}b" mask="url(#${n}m)">
          <rect x="-30" y="-30" width="160" height="160" fill="url(#${n}c)" filter="url(#${n}d)"/>
          <rect x="-10" y="-10" width="120" height="120" fill="url(#${n}p)"/>
          <rect x="-10" y="-10" width="120" height="120" fill="url(#${n}s)"/>
          <g filter="url(#${n}r)" fill="#fff">${blobs}</g>
          <g transform="translate(33 42) rotate(-34)"><path d="M-7.4-2.5L7.4-3.1L7.4 3.1L-7.4 2.5Z" fill="url(#${n}w)" stroke="#fff" stroke-width="1" stroke-linejoin="round" stroke-opacity=".9"/><rect x="-2.7" y="-3.4" width=".5" height="6.8" fill="#1b1e24" opacity=".55"/></g>
          <g transform="translate(70 30) rotate(-38)"><path d="M-3.8-1.3L3.8-1.7L3.8 1.7L-3.8 1.3Z" fill="url(#${n}w)" stroke="#fff" stroke-width=".6" stroke-linejoin="round" stroke-opacity=".9"/></g>
        </g>
      </defs>
      <g mask="url(#${n}fm)" opacity=".13"><g transform="translate(0 184) scale(1 -1)"><use href="#${n}b"/></g></g>
      <use href="#${n}b"/>
      <g class="y2s-glint" fill="#fff"><path d="M82 21Q82 24 85 24Q82 24 82 27Q82 24 79 24Q82 24 82 21Z"/><rect x="72" y="23.85" width="20" height=".3"/><rect x="81.85" y="14" width=".3" height="20"/></g>
    </svg>`;
  },

  materials: [
    { name: 'Chrome gradient', css: 'background: {chromeFixed}; /* #fff, #c9ced4, #9aa0a6, #f4f4f4 | horizon just off-centre at 44-55% | #5f646b, #7d838a, #e8e8e8; on text: background-clip: text, repeated per line, then filter: url(bevel specular lighting) so every stroke edge catches light */' },
    { name: 'Metal panel', css: 'background: brushed grain (repeating-linear-gradient(90deg, 4% white 0 1px, transparent 1px 3px)) padding-box, linear-gradient(180deg, {metalHi}, {metalLo}) padding-box, {rim} border-box; border: 1px solid transparent; border-radius: 22px; box-shadow: inset 0 1px 0 rgba(255,255,255,.16); /* opaque, not glass: a bevelled rim of white alphas around a dark gunmetal face */' },
    { name: 'Gel pill action', css: 'background: {gloss} padding-box, radial-gradient(ellipse 70% 60% at 50% 105%, rgba(255,255,255,.42), transparent 70%) padding-box, linear-gradient({primary}, {primary}) padding-box, {chromeFixed} border-box; border: 1.5px solid transparent; border-radius: 999px; color: {onPrimary}; box-shadow: inset 0 -1px 0 rgba(0,0,0,.25), 0 10px 26px -8px {priGlow}; /* Aqua gel: a hard top specular and a bright bottom caustic */' },
    { name: 'Translucent gel', css: 'background: top specular + bottom caustic over the {primary} at 70% alpha over a 1px pinstripe (repeating-linear-gradient(0deg, rgba(255,255,255,.12) 0 1px, transparent 1px 3px)) over the gunmetal; /* candy plastic with the pinstriped body showing through, as on a translucent 1999 shell */' },
    { name: 'Chrome knob', css: 'background: radial-gradient(circle at 34% 26%, #fff, rgba(255,255,255,0) 40%), {chromeFixed}; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,.5);' },
    { name: 'Acid plate', css: 'background: {accent}; color: {onAccent}; padding: 0 .12em .04em; border-radius: .05em; transform: none; /* a flat, hard-edged block with a tiny trademark mark; no rotation, no blob radius */' },
  ],

  rules: {
    do: [
      'Give every chrome surface a horizon just off-centre: a bright line over a dark ground, so it reads as metal, not a gradient.',
      'Set headlines in the heaviest wide face, chrome-filled with a bevel so the edges catch light; put the one flat acid plate behind a single word.',
      'Use primary for the gel pill, the selected segment and the colored edge-light on chrome; keep panels opaque gunmetal with a bevelled white rim and a fine brushed grain.',
      'Set labels in tiny uppercase techno type with product codes and trademark marks.',
    ],
    dont: [
      'Use pastel thin-film color or frosted transparency; this is opaque, saturated metal or candy gel.',
      'Fill text with the accent or primary; headlines are chrome.',
      'Flatten the rim: no panel without its bevelled edge, no pill without its gloss.',
      'Scatter sparkles, stars or rotated stickers.',
    ],
  },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    principles: [
      ['Chrome with a horizon', 'A bright line just off-centre over a dark ground.'],
      ['The heaviest wide type', 'Chrome-filled and bevelled, with one flat acid plate behind a word.'],
      ['Opaque, saturated, bevelled', 'Gunmetal panels with a white rim and gel pills.'],
    ],
    do: [
      'Give every chrome surface a horizon.',
      'Keep panels opaque gunmetal with a bevelled rim.',
      'Set labels in tiny techno type.',
    ],
    dont: [
      'Use pastel or frosted transparency.',
      'Fill text with accent or primary.',
      'Scatter sparkles or stickers.',
    ],
  },
});
