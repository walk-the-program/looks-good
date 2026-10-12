/* 09 Clay — dimensional, matte clay objects inside a flat, crisp interface
   (Airbnb's 2025 icons, Flarup's inflated objects, Fluent 3D): the clay formula
   (soft colored drop, deep soft underside, broad soft top light, fine grain,
   slightly imperfect forms) lives on OBJECTS only: the art, the palette blobs,
   the three material samples, the avatars and the one CTA. Everything else is
   flat: hairline cards, a flat segmented control, plain status text. Objects use
   a tonal ramp of the primary. Look lives in css/aesthetics/clay.css. */
registerAesthetic({
  key: 'clay', order: 9,
  name: 'Clay',
  descriptor: 'Puffy · Joyful · Tangible',
  influences: 'Claymorphism / Toy design / Soft 3D',
  summary: 'Soft, matte objects that look like modeling clay, set inside a flat, quiet interface.',
  motto: 'Made by hand.',
  kicker: 'Soft, matte, tangible',
  mode: 'light',
  slideShape: 'soft',
  // the states are three clay objects (a ball at rest, pressed flat, lifted), not button rows
  labels: { material: 'Clay', states: ['Rest', 'Pressed', 'Lifted'], statesKind: 'swatch' },
  // the clay objects (02) lead the sections; the flat interface follows
  layout: { hero: 'split', sections: 'stacked', sectionOrder: ['touch', 'ui', 'use'] },
  type: { ui: 'sans', label: 'sans', display: 1.08 },
  highlight: 'custom',
  highlightNote: 'The word sits on a flat accent band (no tilt, no gloss) with on-accent text and one soft accent-colored drop beneath it.',
  cardFill: '--ab-card-fill',

  roles: {
    primary: {
      use: 'The one clay capsule action per view, the app-icon tile and the tonal ramp (lighter and darker steps) for objects; flat on progress fills and the "on" track of toggles',
      never: 'Body text, card fills, a second CTA',
    },
    secondary: {
      use: 'The one torus in the art, status text (shaded to read) and the second data series',
      never: 'The main CTA, body text, card or page fills',
    },
    accent: {
      use: 'The flat band under the headline word, once per view',
      never: 'Buttons, body text, borders, large fills, more than one object',
    },
  },

  // A warm off-white: the page leans 3% toward the primary (never mint).
  canvas(b) { return b.mix(b.primary, b.canvas, 0.03); },

  tokens(t) {
    const d = t.isDark;
    // Outer clay shadow: the object color, darkened 45%.
    const sh = hex => t.alpha(t.mix('#000000', hex, 0.45), d ? 0.8 : 0.55);
    const priHi = t.mix('#ffffff', t.primary, 0.34);
    const priLo = t.mix('#000000', t.primary, 0.2);
    const cardFill = d ? t.mix('#ffffff', t.canvas, 0.07) : t.mix('#ffffff', t.canvas, 0.82);
    // muted labels (the segmented options sit on the card fill): pull toward ink until 4.6:1 there
    let muted = t.muted;
    for (let k = 0.05; k <= 1.001 && (t.contrast(muted, cardFill) < 4.6 || t.contrast(muted, t.canvas) < 4.5); k += 0.05) muted = t.mix(t.ink, t.muted, k);
    // the highlight band's underside: the accent darkened. A yellow darkened in place turns olive,
    // so yellows and ambers also turn toward orange (the clay's own warm shadow)
    const ah = hexToHsl(t.accent);
    const warm = ah.h >= 38 && ah.h <= 80;
    const hlUnder = hslToHex(warm ? ah.h - 16 : ah.h, warm ? Math.max(ah.s, 75) : ah.s, Math.round(ah.l * 0.55));
    // 03 avatars: flat tints of the primary with ink initials (the interface stays flat; clay is
    // for the objects and the one CTA)
    const avBg = k => t.mix(t.primary, t.canvas, k);
    return {
      '--ab-muted': muted,
      '--cl-hl-under': t.alpha(hlUnder, d ? 0.9 : 0.6),
      '--cl-av1': avBg(0.26), '--cl-av2': avBg(0.16), '--cl-av3': avBg(0.36),
      '--cl-av-ink': (() => { let c = t.ink; [0.26, 0.16, 0.36].forEach(k => { if (t.contrast(c, avBg(k)) < 4.5) c = t.readable(avBg(k)); }); return c; })(),
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
      // flat cards: the canvas lightened 82% (7% in dark mode), a hairline, no clay
      '--ab-card-fill': cardFill,
      // status text (rows sit on the canvas): the secondary shaded toward ink until it reads (4.5:1)
      '--ab-sec-text': (() => { const bg = t.canvas; for (let a = 0; a <= 1; a += 0.05) { const c = t.mix(t.ink, t.secondary, a); if (t.contrast(c, bg) >= 4.5) return c; } return t.ink; })(),
      '--ab-type-pick-w': 600,
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
    { name: 'Clay object', css: 'background: radial-gradient(140% 120% at 35% 0%, rgba(255,255,255,.18), transparent 60%), {primary}; border-radius: 30% 34% 31% 36% / 33% 30% 36% 31%; box-shadow: 0 18px 36px -12px {priSh}, inset 0 -14px 22px rgba(0,0,0,.18), inset 0 8px 14px {clayHi}; /* matte: broad soft top light, deep soft underside, plus feTurbulence grain at 8% (overlay); slightly imperfect radii; steps of the primary ramp {priHi} / {primary} / {priLo} */' },
    { name: 'Primary clay capsule', css: 'background: radial-gradient(120% 140% at 30% 0, rgba(255,255,255,.3), transparent 55%), linear-gradient(160deg, {priHi}, {primary} 45%, {priLo} 130%); color: {onPrimary}; border-radius: 999px; box-shadow: 0 14px 24px -10px {priSh}, inset 0 -6px 12px {clayLo}, inset 0 6px 10px {clayHi}; /* hover: translateY(-3px) + larger shadow; pressed: scale(.97) + smaller shadow */' },
    { name: 'App icon tile', css: 'background: radial-gradient(140% 120% at 35% 0%, rgba(255,255,255,.18), transparent 60%), {primary}; border-radius: 30% 34% 31% 36% / 33% 30% 36% 31%; box-shadow: 0 24px 40px -14px {priSh}, inset 0 -14px 22px rgba(0,0,0,.18), inset 0 10px 18px {clayHi}; /* the brand initial embossed in the center; matte, with grain */' },
    { name: 'Flat card', css: 'background: {cardFill}; border: 1px solid color-mix(in srgb, {ink} 10%, transparent); border-radius: 24px; /* the interface stays flat and crisp so the clay objects read as objects */' },
    { name: 'Flat segmented control', css: 'border: 1px solid color-mix(in srgb, {ink} 12%, transparent); border-radius: 999px; /* selected segment: flat {ink} fill, {canvas} text */' },
    { name: 'Flat accent band', css: 'background: {accent}; color: {onAccent}; box-shadow: 0 .14em 0 -.02em {accSh}; /* the headline word only, once per view; no tilt, no gloss */' },
  ],

  rules: {
    do: [
      'Put clay on objects only (the art, palette blobs, avatars, the one CTA); keep the interface flat and crisp around them.',
      'Make the clay matte: a broad soft top light, a deep soft underside, fine grain, and no sharp specular.',
      'Let forms be slightly imperfect, the way a hand leaves them.',
      'Build objects from a tonal ramp of the primary (lighter, base, darker); secondary in one art object, accent once.',
    ],
    dont: [
      'Render the interface itself in clay: puffy trays, puffy tags, puffy status beans.',
      'Add a glossy white highlight; that is vinyl, not clay.',
      'Tilt stickers or pills for fun; the objects carry the play.',
      'Use a harsh black drop shadow; shadows are the object color, darkened.',
    ],
  },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    coverDisplay: 0.85,   // the still life leads the cover
    principles: [
      ['Clay on objects only', 'The interface stays flat so the objects read.'],
      ['Matte, not glossy', 'Soft top light, deep underside, fine grain.'],
      ['Made by hand', 'Forms are a little imperfect.'],
    ],
    do: [
      'Keep the interface flat around the objects.',
      'Keep the clay matte, with grain.',
      'Build objects from a tonal ramp of primary.',
    ],
    dont: [
      'Render the interface in clay.',
      'Add a glossy highlight.',
      'Tilt pills and stickers.',
    ],
  },
});
