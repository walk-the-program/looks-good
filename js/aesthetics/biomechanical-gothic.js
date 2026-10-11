/* 34 Biomechanical Gothic — grown, ribbed, ancient. References: Giger's bar in Gruyeres
   (double vertebral arches, bone-toned furniture, everything cast from one stone-like
   synthetic), Scorn and Nihei's megastructures. One cast material (charcoal, bone,
   tarnished metal, warm and desaturated, never blue-black) and a few repeated modules:
   rib, vertebra, tube, valve. The client primary is a dim bioluminescent glow (thin lines,
   a lamp, progress), the secondary a tarnish tint, the accent one wet gloss spot. No gore,
   no skulls, no copyrighted imagery; type is a gothic or inscriptional face for titles
   only and plain serif for reading. Hooks: hero centered, states swatch. */

// The cast palette, shared by tokens() and art(). `t` is the base token object.
function bgPalette(t) {
  const d = t.isDark;
  const W = '#ffffff';
  const K = '#000000';
  const hp = hexToHsl(t.primary);
  // lit sinew: hsl(h, s x 0.75, min(l, 42%)), i.e. desaturated 25% and darkened; the floor
  // only stops a very dark brand colour from vanishing into the charcoal
  const glow = hslToHex(hp.h, hp.s * 0.75, Math.max(28, Math.min(hp.l, 42)));
  const bone = d ? t.mix('#D8D0BC', t.ink, 0.7) : t.mix('#15130F', t.ink, 0.55);
  const metal = d ? '#6F6A5C' : '#7B7564';
  const metalHi = d ? '#8E8670' : '#6A634F';
  const tarnish = t.mix(metalHi, t.secondary, 0.5);
  return {
    glow, bone, metal, metalHi, tarnish,
    cast: d ? t.mix(W, t.canvas, 0.055) : t.mix(W, t.canvas, 0.4),
    castHi: d ? t.mix(W, t.canvas, 0.13) : t.mix(W, t.canvas, 0.72),
    castLo: d ? t.mix(K, t.canvas, 0.45) : t.mix(K, t.canvas, 0.12),
    well: d ? t.mix(K, t.canvas, 0.62) : t.mix(K, t.canvas, 0.16),
  };
}

registerAesthetic({
  key: 'biomechanical-gothic', order: 34,
  name: 'Biomechanical Gothic',
  descriptor: 'Grown · Ribbed · Ancient',
  influences: 'Biomechanical art / Scorn / Nihei\'s architecture',
  summary: 'One cast material and a few repeated modules, ribs, vertebrae and tubes, lit by a dim living glow.',
  motto: 'It grew this way.',
  kicker: 'Specimen, unearthed',
  mode: 'dark',
  slideShape: 'classic',
  labels: { material: 'Organs', states: ['Dormant', 'Breathing', 'Awake'], statesKind: 'swatch' },
  layout: { hero: 'centered', palette: 'swatches', sections: 'two-col' },
  type: { ui: 'body', label: 'mono' },
  highlight: 'custom',
  highlightNote: 'The highlighted word is set in bone with a hint of the accent mixed in (20% accent, 80% ink), lit from behind by a soft accent glow (a 16px text-shadow at 30%); no dot, no underline, no fill.',
  ctaFill: 'ink',
  cardFill: '--ab-bi-cast',

  roles: {
    canvas: {
      use: 'The charcoal the whole structure is cast from (the dark colour pulled to a warm near-black; light mode a bone ground); every surface is a tonal step of it',
      never: 'Text, a blue-black "tech" tint, or a gradient wash',
      coverage: '60–70%',
    },
    ink: {
      use: 'Bone: headlines, text, ribs, vertebrae and rim light. Never pure white',
      never: 'Large flat fills, or a glow',
      coverage: '≈15–20%',
    },
    primary: {
      use: 'Lit sinew: a dim bioluminescent glow only, shown as thin lines inside the structure, the progress tube, the selected vertebra rim and the single lamp. The glow token is hsl(h, s x 0.75, min(l, 42%)) of the brand primary: desaturated and darkened, never the raw colour',
      never: 'The main action fill, body text, large fills, or a bright UI colour; no neon, no cyan or lime glow',
      coverage: '≈4–6%',
    },
    secondary: {
      use: 'Tarnish: the verdigris or brass tint on metal parts, valve rings and status pills (mixed toward tarnished metal)',
      never: 'The main action, body text, the glow, or large fills',
      coverage: '≈6–10%',
    },
    accent: {
      use: 'One wet gloss spot: the faint warm tint in the highlighted headline word and its glow, the pinpoint on the nave lamp and the awake organ (under 2% of the area)',
      never: 'Buttons, borders, panel fills, or saturated red as a default (it reads as gore)',
      coverage: '≤2%',
    },
  },

  // A warm charcoal (#15130F lineage), never a blue-black; light mode a bone ground.
  canvas(b) {
    return b.isDark ? b.mix('#15130F', b.canvas, 0.8) : b.mix('#DAD3C0', b.canvas, 0.72);
  },

  tokens(t) {
    const p = bgPalette(t);
    const d = t.isDark;
    return {
      '--ab-bi-glow': p.glow,
      '--ab-glow': p.glow,
      '--ab-bi-hl': t.mix(t.accent, t.ink, 0.2),
      '--ab-bi-hl-glow': t.alpha(t.accent, 0.3),
      '--ab-bi-disc-rim': t.mix(t.ink, t.canvas, 0.7),
      '--ab-bi-bone': p.bone,
      '--ab-bi-metal': p.metal,
      '--ab-bi-metal-hi': p.metalHi,
      '--ab-bi-tarnish': p.tarnish,
      '--ab-bi-cast': p.cast,
      '--ab-bi-cast-hi': p.castHi,
      '--ab-bi-cast-lo': p.castLo,
      '--ab-bi-well': p.well,
      '--ab-bi-rim': t.alpha(p.bone, d ? 0.16 : 0.22),
      '--ab-bi-rim2': t.alpha(p.bone, d ? 0.3 : 0.4),
      '--ab-bi-glow-a': t.alpha(p.glow, 0.34),
      '--ab-bi-glow-b': t.alpha(p.glow, 0.14),
      '--ab-type-pick-w': '400',
    };
  },

  // "The Nave": nine receding double-rimmed pointed arches (irregular rib ticks between
  // the rims, tonal ring walls, a vertebral spine along the floor) converging on one dim
  // lamp. Pure SVG, viewBox 200 x 90, drawn from the vanishing point outwards.
  art(ctx) {
    const t = ctx.t;
    const P = bgPalette(t);
    const cx = 100;
    const vpy = 50;
    const N = 9;
    const arch = (a, g, Ht) => ({ a, g, apex: g - Ht, e: g - Ht * 0.42, b: Ht * 0.58 });
    const dPath = (A, close) => {
      const x0 = cx - A.a, x1 = cx + A.a;
      return `M${x0} ${A.g} L${x0} ${A.e} C${x0} ${A.e - A.b * 0.55} ${cx - A.a * 0.3} ${A.apex + A.b * 0.3} ${cx} ${A.apex} C${cx + A.a * 0.3} ${A.apex + A.b * 0.3} ${x1} ${A.e - A.b * 0.55} ${x1} ${A.e} L${x1} ${A.g}${close ? ' Z' : ''}`;
    };
    const bez = (p0, p1, p2, p3, u) => {
      const k = 1 - u;
      return [k * k * k * p0[0] + 3 * k * k * u * p1[0] + 3 * k * u * u * p2[0] + u * u * u * p3[0],
        k * k * k * p0[1] + 3 * k * k * u * p1[1] + 3 * k * u * u * p2[1] + u * u * u * p3[1]];
    };
    const left = A => [[cx - A.a, A.e], [cx - A.a, A.e - A.b * 0.55], [cx - A.a * 0.3, A.apex + A.b * 0.3], [cx, A.apex]];
    const arches = [];
    for (let i = 0; i < N; i++) {
      const s = 1 / (1 + 0.62 * i);
      arches.push({ s, A: arch(104 * s, vpy + 46 * s, 118 * s) });
    }
    const f = n => Math.round(n * 100) / 100;
    let rings = '';
    let rims = '';
    for (let i = N - 1; i >= 0; i--) {
      const { s, A } = arches[i];
      const next = arches[i + 1];
      const fill = i === N - 1 ? t.mix(P.glow, t.canvas, 0.3) : t.mix(P.glow, (i % 2 ? P.castLo : P.cast), 0.05 + 0.1 * (i / N));
      const d = dPath(A, true) + (next ? ' ' + dPath(next.A, true) : '');
      rings += `<path d="${d}" fill="${fill}" fill-rule="evenodd"/>`;
      const k = 1 - i / N;
      const rim = t.mix(P.bone, P.metal, Math.pow(k, 1.4));
      const A2 = arch(A.a - 5.5 * s, A.g, (118 * s) - 5.5 * s * 1.25);
      rims += `<path d="${dPath(A, false)}" fill="none" stroke="${rim}" stroke-width="${f(0.5 + 3.4 * s)}" stroke-linejoin="round"/>`
        + `<path d="${dPath(A2, false)}" fill="none" stroke="${t.mix(P.metalHi, P.metal, k)}" stroke-width="${f(0.25 + 1.1 * s)}"/>`;
      // irregular transverse ribs between the rims, mirrored
      const lo = left(A);
      const li = left(A2);
      const nTicks = i < 2 ? 8 : i < 5 ? 6 : 4;
      let ticks = '';
      for (let j = 1; j < nTicks; j++) {
        const u = Math.min(0.96, Math.max(0.04, j / nTicks + 0.06 * Math.sin(j * 2.3 + i * 1.7)));
        const po = bez(lo[0], lo[1], lo[2], lo[3], u);
        const pi = bez(li[0], li[1], li[2], li[3], u);
        ticks += `M${f(po[0])} ${f(po[1])} L${f(pi[0])} ${f(pi[1])} M${f(2 * cx - po[0])} ${f(po[1])} L${f(2 * cx - pi[0])} ${f(pi[1])} `;
      }
      rims += `<path d="${ticks}" stroke="${t.mix(P.metalHi, P.metal, k)}" stroke-width="${f(0.3 + 1.1 * s)}" stroke-linecap="round" fill="none"/>`;
    }
    // vertebral spine along the floor, shrinking toward the lamp
    let spine = '';
    for (let i = N - 1; i >= 0; i--) {
      const { s, A } = arches[i];
      const y = A.g - 5 * s;
      const w = 14 * s;
      const h = 3.6 * s;
      const col = t.mix(P.bone, P.metal, Math.pow(1 - i / N, 1.3));
      spine += `<ellipse cx="${cx}" cy="${f(y)}" rx="${f(w)}" ry="${f(h)}" fill="${col}"/><ellipse cx="${cx}" cy="${f(y)}" rx="${f(w * 0.34)}" ry="${f(h * 0.4)}" fill="${P.well}"/>`;
    }
    const lamp = `<circle cx="${cx}" cy="${vpy}" r="7" fill="${P.glow}" opacity=".16"/><circle cx="${cx}" cy="${vpy}" r="3.6" fill="${P.glow}" opacity=".34"/><circle cx="${cx}" cy="${vpy}" r="1.5" fill="${P.glow}"/><circle cx="${cx - 0.5}" cy="${vpy - 0.5}" r=".45" fill="${t.accent}"/>`;
    return `<div class="bg-art"><svg viewBox="0 0 200 90" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="presentation">${rings}${rims}${spine}${lamp}</svg>`
      + `<span class="bg-cap">Plate III &middot; The nave, from the threshold</span><span class="bg-fig">Fig. VII</span></div>`;
  },

  materials: [
    { name: 'Cast surface', css: 'background: {biCast}; box-shadow: inset 0 1px 0 {biRim2}, inset 0 -1px 0 {biCastLo}; /* every surface is a tonal step of the charcoal; texture and rim light are the only variation; no pure white */' },
    { name: 'Arch frame (card)', css: 'background: {biCast}; border-radius: 96px 96px 0 0 / 52px 52px 0 0; box-shadow: inset 0 0 0 6px {canvas}, inset 0 0 0 7px {biRim2}; /* double rim offset 6px, a roman numeral at the keystone, bottom corners squared */' },
    { name: 'Tube (divider and progress)', css: 'height: 8px; border-radius: 4px; background: linear-gradient({biCastLo}, {biCastHi} 45%, {biMetal} 62%, {biCastLo}); /* lit portion: {biGlow} */' },
    { name: 'Vertebra (segment)', css: 'background: {biCast}; border-radius: 42% 42% 38% 38% / 55% 55% 45% 45%; box-shadow: inset 0 1px 0 {biRim2}; /* selected: raised, rim in {biGlow}, rotate 3deg; a dark hole in the centre */' },
    { name: 'Main action (bone pill)', css: 'background: {ink}; color: {canvas}; border-radius: 999px; /* ribbed grip lines on the left edge, a seam, and a thin {biGlow} sinew line under the label; primary is never the fill */' },
    { name: 'Glow (lit sinew)', css: 'color: {biGlow}; box-shadow: 0 0 10px {biGlowA}; /* dim bioluminescence: thin lines and the lamp only; never UI-bright */' },
    { name: 'Tarnish', css: 'background: {biTarnish}; /* verdigris or brass tint of the metal parts: valve rings, status pills */' },
    { name: 'Organ (state sample)', css: 'border-radius: 54% 46% 50% 50% / 48% 52% 48% 52%; background: {biCastHi}; /* grown, never a perfect circle; faint seam, a few pores; Awake adds a {biGlow} core */' },
  ],

  rules: {
    do: [
      'Cast every surface from one charcoal-bone-tarnished material and vary only texture and rim light.',
      'Repeat a few modules (rib, vertebra, tube, valve) with slightly irregular spacing so it reads as grown.',
      'Show the client colour only as a dim glow: thin lines, one lamp, the progress tube.',
      'Keep text at least 4.5:1 on the charcoal; the mood lives in the decoration, not the type.',
    ],
    dont: [
      'Show gore, flesh, teeth, skulls, wounds or saturated red, or copy Giger or Alien imagery.',
      'Use neon, cyan or green highlights, glass, or aurora glow (that is Cyber HUD or Aurora Noir).',
      'Set body text in blackletter or on a pattern; the gothic face is for titles only.',
      'Make everything curved: keep a few hard straight structural lines, and loop motion on one or two elements at most.',
    ],
  },

  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    principles: [
      ['One cast material', 'Charcoal, bone and tarnished metal share a single surface.'],
      ['Repeat a few modules', 'Ribs, vertebrae, tubes and valves set the rhythm.'],
      ['Colour is a dim glow', 'The brand appears only as faint bioluminescence.'],
    ],
    do: [
      'Use vertebral arches and ribbed frames.',
      'Divide sections with tubing runs.',
      'Light the brand colour as a dim glow.',
    ],
    dont: [
      'Show gore or flesh textures.',
      'Use neon or saturated red.',
      'Set body text in blackletter.',
    ],
  },
});
