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

  // "The Nave": nine receding parabolic ribs, each a chain of shaded vertebrae with spurs and a lit
  // spinal cord, tonal ring walls lit from above, a vertebral column on the floor, Beksinski fog that
  // thickens with distance, converging on one dim lamp. Pure SVG, viewBox 200 x 90, drawn far to near.
  art(ctx) {
    const t = ctx.t;
    const P = bgPalette(t);
    bgPalette.seq = (bgPalette.seq || 0) + 1;
    const id = 'bg' + bgPalette.seq;
    const cx = 100, vpy = 50, N = 9;
    const f = n => Math.round(n * 100) / 100;
    const haze = t.mix(P.glow, P.bone, 0.5);
    // a parabolic (catenary-like) rib: it springs near-vertical from the floor and rounds over the crown,
    // the Giger ribcage; never an onion or ogee shoulder
    const left = A => [[cx - A.a, A.g], [cx - A.a * 0.94, A.g - A.Ht * 0.76], [cx - A.a * 0.3, A.apex], [cx, A.apex]];
    const dPath = (A, close) => {
      const x0 = cx - A.a, x1 = cx + A.a;
      return `M${f(x0)} ${f(A.g)} C${f(x0 + A.a * 0.06)} ${f(A.g - A.Ht * 0.76)} ${f(cx - A.a * 0.3)} ${f(A.apex)} ${cx} ${f(A.apex)} C${f(cx + A.a * 0.3)} ${f(A.apex)} ${f(x1 - A.a * 0.06)} ${f(A.g - A.Ht * 0.76)} ${f(x1)} ${f(A.g)}${close ? ' Z' : ''}`;
    };
    const bez = (p, u) => {
      const k = 1 - u;
      return [k * k * k * p[0][0] + 3 * k * k * u * p[1][0] + 3 * k * u * u * p[2][0] + u * u * u * p[3][0],
        k * k * k * p[0][1] + 3 * k * k * u * p[1][1] + 3 * k * u * u * p[2][1] + u * u * u * p[3][1]];
    };
    const arch = (a, g, Ht) => ({ a, g, Ht, apex: g - Ht });
    const arches = [];
    for (let i = 0; i < N; i++) {
      const s = 1 / (1 + 0.62 * i);
      arches.push({ s, A: arch(88 * s, vpy + 46 * s, 116 * s) });
    }
    // one rib: n = round(18 + 14s) vertebrae per side, each a rounded block turned to the tangent and
    // shaded by one radial gradient (bone highlight, tarnished metal, cast shadow), a gap between them,
    // a transverse spur on every second one
    const rib = (A, s) => {
      const L = left(A), M = 64, pts = [[...L[0]]], cum = [0];
      for (let j = 1; j <= M; j++) { const p = bez(L, j / M); pts.push(p); cum.push(cum[j - 1] + Math.hypot(p[0] - pts[j - 1][0], p[1] - pts[j - 1][1])); }
      const tot = cum[M], n = Math.round(18 + 14 * s), pitch = tot / n;
      const w = pitch - 0.5 * s, h = Math.min(3.6 * s + 0.35, w * 1.15), rx = h * 0.4;
      let verts = '', spurs = '';
      let j = 0;
      for (let k = 0; k < n; k++) {
        const target = (k + 0.5) * pitch;
        while (j < M - 1 && cum[j + 1] < target) j++;
        const u = (target - cum[j]) / ((cum[j + 1] - cum[j]) || 1);
        const x = pts[j][0] + (pts[j + 1][0] - pts[j][0]) * u, y = pts[j][1] + (pts[j + 1][1] - pts[j][1]) * u;
        let tx = pts[j + 1][0] - pts[j][0], ty = pts[j + 1][1] - pts[j][1];
        const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
        const ang = Math.atan2(ty, tx) * 180 / Math.PI;
        [[x, ang, tx, ty, 1], [2 * cx - x, 180 - ang, -tx, ty, -1]].forEach(([X, a, TX, TY, m]) => {
          verts += `<rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}" rx="${f(rx)}" transform="translate(${f(X)} ${f(y)}) rotate(${f(a)})"/>`;
          if (k % 2 === 1 && k < n - 1) {
            // outward normal (away from the nave), the spur swept a little toward the crown
            const nx = m > 0 ? TY : -TY, ny = m > 0 ? -TX : TX;
            const bx = X + nx * h * 0.45, by = y + ny * h * 0.45, sl = 3 * s;
            spurs += `M${f(bx - TX * w * 0.28)} ${f(by - TY * w * 0.28)}L${f(bx + nx * sl + TX * s * 0.8)} ${f(by + ny * sl + TY * s * 0.8)}L${f(bx + TX * w * 0.28)} ${f(by + TY * w * 0.28)}Z`;
          }
        });
      }
      return { verts, spurs, h };
    };
    let out = '';
    for (let i = N - 1; i >= 0; i--) {
      const { s, A } = arches[i];
      const next = arches[i + 1];
      // fog: a veil over everything already drawn (the farther nave) before this arch goes on, so depth
      // reads as warm haze, not only as scale
      if (i < N - 1) out += `<path d="${dPath(A, true)}" fill="${haze}" opacity=".075"/>`;
      const wall = i === N - 1 ? `fill="${t.mix(P.glow, t.canvas, 0.3)}"` : `fill="url(#${id}w)"`;
      out += `<path d="${dPath(A, true)}${next ? ' ' + dPath(next.A, true) : ''}" ${wall} fill-rule="evenodd"/>`;
      const r = rib(A, s);
      // the spinal cord: a lit hairline just inside the chain
      const cord = arch(A.a - r.h * 0.95, A.g, A.Ht - r.h * 0.95);
      out += `<path d="${dPath(cord, false)}" fill="none" stroke="${P.glow}" stroke-width="${f(0.25 + 0.5 * s)}" stroke-opacity=".5"/>`;
      out += `<path d="${r.spurs}" fill="${t.mix(P.metalHi, P.castLo, 0.35)}"/><g fill="url(#${id}v)">${r.verts}</g>`;
    }
    // vertebral column on the floor: trapezoid bodies with two lateral processes, receding to the lamp;
    // the nearest stays inside the frame
    let column = '';
    for (let i = N - 1; i >= 1; i--) {
      const { s, A } = arches[i];
      const y = A.g - 3.4 * s, bt = 8 * s, bb = 10.5 * s, bh = 3.6 * s;
      column += `<path d="M${f(cx - bt / 2)} ${f(y - bh / 2)}H${f(cx + bt / 2)}L${f(cx + bb / 2)} ${f(y + bh / 2)}H${f(cx - bb / 2)}Z" fill="url(#${id}v)"/>`
        + `<path d="M${f(cx - bt / 2)} ${f(y - bh * 0.2)}L${f(cx - bt / 2 - 8 * s)} ${f(y - bh * 0.45)}L${f(cx - bb / 2)} ${f(y + bh * 0.15)}ZM${f(cx + bt / 2)} ${f(y - bh * 0.2)}L${f(cx + bt / 2 + 8 * s)} ${f(y - bh * 0.45)}L${f(cx + bb / 2)} ${f(y + bh * 0.15)}Z" fill="${t.mix(P.metalHi, P.castLo, 0.4)}"/>`;
    }
    const lamp = `<circle cx="${cx}" cy="${vpy}" r="24" fill="url(#${id}l)"/><circle cx="${cx}" cy="${vpy}" r="10" fill="${P.glow}" opacity=".25"/><circle cx="${cx}" cy="${vpy}" r="4" fill="${P.glow}" opacity=".7"/><circle cx="${cx}" cy="${vpy}" r="1.6" fill="${t.mix(P.glow, P.bone, 0.45)}"/><circle cx="${cx - 0.6}" cy="${vpy - 0.6}" r=".5" fill="${t.accent}"/>`;
    return `<div class="bg-art"><svg viewBox="0 0 200 90" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="presentation">
      <defs>
        <radialGradient id="${id}v" cx="40%" cy="30%" r="70%"><stop offset="0" stop-color="${P.bone}"/><stop offset=".55" stop-color="${P.metalHi}"/><stop offset="1" stop-color="${P.castLo}"/></radialGradient>
        <linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.castHi}"/><stop offset="1" stop-color="${P.castLo}"/></linearGradient>
        <radialGradient id="${id}h" cx="${cx}" cy="${vpy}" r="120" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${haze}" stop-opacity=".18"/><stop offset="1" stop-color="${haze}" stop-opacity="0"/></radialGradient>
        <radialGradient id="${id}l"><stop offset="0" stop-color="${P.glow}" stop-opacity=".1"/><stop offset="1" stop-color="${P.glow}" stop-opacity="0"/></radialGradient>
        <radialGradient id="${id}fl"><stop offset="0" stop-color="${P.glow}" stop-opacity=".12"/><stop offset="1" stop-color="${P.glow}" stop-opacity="0"/></radialGradient>
      </defs>
      ${out}${column}
      <ellipse cx="${cx}" cy="${vpy + 30}" rx="30" ry="4" fill="url(#${id}fl)"/>
      <rect width="200" height="90" fill="url(#${id}h)"/>
      ${lamp}</svg>`
      + `<span class="bg-cap">Plate III &middot; The nave, from the threshold</span><span class="bg-fig">Fig. VII</span></div>`;
  },
  materials: [
    { name: 'Cast surface', css: 'background: {biCast}; box-shadow: inset 0 1px 0 {biRim2}, inset 0 -1px 0 {biCastLo}; /* every surface is a tonal step of the charcoal; texture and rim light are the only variation; no pure white */' },
    { name: 'Rib frame (card)', css: 'background: {biCast}; border-radius: 50% 50% 0 0 / 120px 120px 0 0; box-shadow: inset 0 0 0 6px {canvas}, inset 0 0 0 7px {biRim2}; /* a rounded ribcage cap (never an onion or ogee), segmented by a ribbed rim of short bone ticks, a roman numeral at the keystone, bottom corners squared */' },
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
    materialStage: 'pattern',   // the material slide stages the lead pattern (tubing runs); the cover already carries the nave
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
