/* 13 Y2K Chrome — liquid, metallic, hyper. Reference: 2000s chrome logos, Dazed
   Y2K revival, acid-graphics posters. Opaque polished metal (not glass): a
   multi-stop silver gradient with a hard horizon on the headline and the
   rims, blobby pill buttons with a glossy top, and an SVG metaball "liquid
   chrome" sculpture with brand-tinted edges and acid sparkles, on a
   near-black field with a faint primary glow. */
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
  kicker: 'Liquid metal',
  mode: 'dark',
  slideShape: 'soft',
  labels: { material: 'Chrome', states: ['Brushed', 'Polished', 'Liquid'], statesKind: 'swatch' },
  layout: { hero: 'split', palette: 'chips', sections: 'two-col' },
  type: { ui: 'sans', label: 'sans', display: 0.9 },
  highlight: 'custom',
  highlightNote: 'The word sits on a rotated acid-accent plate (a rounded fill in the accent) and is set in dark chrome (or light chrome if the accent is dark): chrome text on an accent fill, never accent-colored text.',

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
      use: 'The acid plate behind the highlighted headline word and the 4-point sparkles. A hit of acid, never a button',
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
    const chrome = d
      ? 'linear-gradient(180deg,#ffffff 0%,#dfe9f7 22%,#8e9aab 46%,#1b1e24 50%,#4a505b 53%,#c9ced6 72%,#ffffff 88%,#aab2bd 100%)'
      : 'linear-gradient(180deg,#14171c 0%,#454b53 28%,#8a9199 46%,#e9edf0 49%,#2a2e34 50.5%,#5f666e 74%,#0c0e12 100%)';
    const chromeDark = 'linear-gradient(180deg,#4a4f56 0%,#16181c 45%,#8e949b 49%,#0e1013 50.5%,#2a2d32 100%)';
    const chromeLight = 'linear-gradient(180deg,#ffffff 0%,#d6dadf 40%,#9aa0a6 49%,#f4f4f4 50.5%,#c4c9cf 100%)';
    return {
      '--ab-font-ui': uiFace, '--ab-font-label': uiFace,
      '--ab-tr': (hf && { condensed: 0, heavy: 0, wide: 0.4, techno: 0.4 }[hf.cls]) ?? 1,
      '--ab-hw': y2kWeight(hf, 800),
      '--ab-chrome': chrome,
      '--ab-chrome-hl': brightAccent ? chromeDark : chromeLight,
      '--ab-chrome-fixed': 'linear-gradient(180deg,#ffffff 0%,#c9ced4 22%,#9aa0a6 44%,#f4f4f4 49%,#5f646b 50.5%,#7d838a 70%,#e8e8e8 100%)',
      '--ab-rim': d
        ? 'linear-gradient(155deg,rgba(255,255,255,.85),rgba(255,255,255,.16) 28%,rgba(255,255,255,.5) 52%,rgba(255,255,255,.1) 76%,rgba(255,255,255,.6))'
        : 'linear-gradient(155deg,rgba(0,0,0,.7),rgba(0,0,0,.14) 28%,rgba(0,0,0,.45) 52%,rgba(0,0,0,.1) 76%,rgba(0,0,0,.55))',
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

  // Metaballs: three circles plus a loose droplet blurred and thresholded (feGaussianBlur +
  // feColorMatrix alpha curve) into one liquid silhouette. The silhouette is a mask over a
  // userSpaceOnUse chrome gradient, so every lobe shares one horizon line, then brand-colored
  // edge-light and specular streaks are masked in. A second, smaller droplet fused to the lower left and acid sparkles complete it.
  art(ctx) {
    const t = ctx.t;
    const n = 'y2k' + (++y2kSeq);
    const star = (cx, cy, r, fill) => `<path d="M${cx} ${cy - r}Q${cx} ${cy} ${cx + r} ${cy}Q${cx} ${cy} ${cx} ${cy + r}Q${cx} ${cy} ${cx - r} ${cy}Q${cx} ${cy} ${cx} ${cy - r}Z" fill="${fill}"/>`;
    const ground = t.mix(t.primary, '#6b7178', 0.3);
    const chromeStops = `<stop offset="0" stop-color="#ffffff"/><stop offset=".14" stop-color="#e3e6ea"/><stop offset=".44" stop-color="#6f777f"/><stop offset=".495" stop-color="#f6f6f6"/><stop offset=".515" stop-color="#23262b"/><stop offset=".74" stop-color="${ground}"/><stop offset="1" stop-color="#eef0f2"/>`;
    return `<svg class="y2s" viewBox="0 0 100 100" width="100%" height="100%" focusable="false" overflow="visible">
      <defs>
        <linearGradient id="${n}c" gradientUnits="userSpaceOnUse" x1="0" y1="14" x2="0" y2="92">${chromeStops}</linearGradient>
        <radialGradient id="${n}p" gradientUnits="userSpaceOnUse" cx="14" cy="92" r="46"><stop offset="0" stop-color="${t.primary}" stop-opacity="1"/><stop offset=".55" stop-color="${t.primary}" stop-opacity=".5"/><stop offset="1" stop-color="${t.primary}" stop-opacity="0"/></radialGradient>
        <radialGradient id="${n}s" gradientUnits="userSpaceOnUse" cx="96" cy="8" r="40"><stop offset="0" stop-color="${t.secondary}" stop-opacity=".9"/><stop offset=".55" stop-color="${t.secondary}" stop-opacity=".4"/><stop offset="1" stop-color="${t.secondary}" stop-opacity="0"/></radialGradient>
        <filter id="${n}g" x="-25%" y="-25%" width="150%" height="150%"><feGaussianBlur stdDeviation="3.3"/><feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 30 -13"/></filter>
        <mask id="${n}m" maskUnits="userSpaceOnUse" x="-10" y="-10" width="120" height="120"><g filter="url(#${n}g)" fill="#fff"><circle cx="43" cy="58" r="25"/><circle cx="71" cy="35" r="15.5"/><circle cx="68" cy="78" r="10"/><circle cx="22" cy="28" r="6.5"/><circle cx="19" cy="82" r="10.5"/></g></mask>
      </defs>
      <ellipse cx="50" cy="93" rx="36" ry="3.2" fill="#000" opacity=".5"/>
      <g mask="url(#${n}m)">
        <rect x="-10" y="-10" width="120" height="120" fill="url(#${n}c)"/>
        <rect x="-10" y="-10" width="120" height="120" fill="url(#${n}p)"/>
        <rect x="-10" y="-10" width="120" height="120" fill="url(#${n}s)"/>
        <ellipse cx="33" cy="44" rx="11" ry="4.6" transform="rotate(-34 33 44)" fill="#fff" opacity=".9"/>
        <ellipse cx="68" cy="29" rx="6.4" ry="2.6" transform="rotate(-38 68 29)" fill="#fff" opacity=".85"/>
        <circle cx="64" cy="70" r="2" fill="#fff" opacity=".8"/>
      </g>
      <g class="y2s-spark">${star(86, 14, 9, t.accent)}${star(10, 76, 5.5, t.accent)}${star(90, 66, 4, '#ffffff')}${star(50, 5, 3.4, '#ffffff')}</g>
    </svg>`;
  },

  materials: [
    { name: 'Chrome gradient', css: 'background: {chromeFixed}; /* #fff, #c9ced4, #9aa0a6, #f4f4f4 | hard horizon at 50% | #5f646b, #7d838a, #e8e8e8; on text: background-clip: text, repeated per line */' },
    { name: 'Metal panel', css: 'background: linear-gradient(180deg, {metalHi}, {metalLo}) padding-box, {rim} border-box; border: 1px solid transparent; border-radius: 30px; /* opaque, not glass: a bevelled rim of white alphas around a dark gunmetal face */' },
    { name: 'Glossy pill action', css: 'background: {gloss} padding-box, linear-gradient({primary}, {primary}) padding-box, {chromeFixed} border-box; border: 1.5px solid transparent; border-radius: 999px; color: {onPrimary}; box-shadow: 0 10px 26px -8px {priGlow};' },
    { name: 'Selected segment', css: 'background: {gloss} padding-box, linear-gradient({primary}, {primary}) padding-box, {chromeFixed} border-box; border: 1.5px solid transparent; border-radius: 999px; color: {onPrimary};' },
    { name: 'Chrome knob', css: 'background: radial-gradient(circle at 34% 26%, #fff, rgba(255,255,255,0) 40%), {chromeFixed}; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,.5);' },
    { name: 'Acid highlight plate', css: 'background: dark-chrome text-clip over a {accent} fill; padding: 0 .14em; border-radius: .3em; transform: rotate(-2deg);' },
  ],

  rules: {
    do: [
      'Give every chrome surface a hard horizon: a bright line at 50% with a dark ground below it, so it reads as metal, not a gradient.',
      'Set headlines in the heaviest wide face, chrome-filled, repeating the gradient per line; put the one acid-accent plate behind a single word.',
      'Use primary for the glossy pill, the selected segment and the colored edge-light on chrome; keep panels opaque gunmetal with a bevelled white rim.',
      'Scatter 4-point sparkles sparingly as the only accent.',
    ],
    dont: [
      'Use pastel thin-film color or frosted transparency; this is opaque, saturated metal.',
      'Fill text with the accent or primary; headlines are chrome.',
      'Flatten the rim: no panel without its bevelled edge, no pill without its gloss.',
      'Place chrome text on a light canvas without the dark chrome variant.',
    ],
  },
});
