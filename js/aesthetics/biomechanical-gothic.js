/* 34 Biomechanical Gothic — grown, ribbed, ancient. References: Giger's bar in Gruyeres
   (double vertebral arches, bone-toned furniture, everything cast from one stone-like
   synthetic), Scorn and Nihei's megastructures. One cast material (charcoal, bone,
   tarnished metal, warm and desaturated, never blue-black) and a few repeated modules:
   rib, vertebra, tube, valve. The material is cold and fixed (green-grey black, cast grey,
   bone); the client primary is only sinew (hsl(h, s x 0.5, 30%), under 3% of the board), the
   secondary a tarnish tint, the accent one wet gloss spot. No gore, no skulls, no copied
   imagery; titles in a light high-contrast serif (Cormorant caps), reading in plain serif.
   Distinct from Religious Futurism: spinal labels (C1 / T6 / L1), not Roman numerals; a
   valve for states, not panes; vertebra-shaped controls, no pills. Hooks: hero bleed,
   states swatch (the valve drawn three ways). */

// The cast palette, shared by tokens() and art(). `t` is the base token object. Cold and fixed: a green-grey
// black ground, a cast ramp #2A2D2A -> #5C605A, bone #C9C3B4 (Giger's airbrushed grey, Scorn's green-grey
// stone); the client never tints the material. The primary exists only as sinew: hsl(h, s x 0.5, 30%).
function bgPalette(t) {
  const d = t.isDark;
  const hp = hexToHsl(t.primary);
  const glow = hslToHex(hp.h, hp.s * 0.5, d ? 30 : 34);
  const bone = d ? '#C9C3B4' : '#2B2D29';
  return {
    glow, bone,
    boneLit: d ? '#DED9CC' : '#141513',
    metal: d ? '#4A4E48' : '#8E918A',
    metalHi: d ? '#7A7E76' : '#6B6E67',
    tarnish: t.mix(d ? '#5C605A' : '#8E918A', t.secondary, 0.82),
    cast: d ? '#2A2D2A' : '#C8C6BE',
    castHi: d ? '#5C605A' : '#E2E0D9',
    castLo: d ? '#1A1C1A' : '#A9A79F',
    well: d ? '#0B0C0B' : '#9A988F',
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
  labels: { material: 'Organs', states: ['Closed', 'Parting', 'Open'], statesKind: 'swatch' },
  layout: { hero: 'bleed', palette: 'swatches', sections: 'two-col' },
  type: { ui: 'body', label: 'mono' },
  highlight: 'custom',
  highlightNote: 'The highlighted word is set in lit bone (a step lighter than the headline) with a soft bone halo behind it (a 16px text-shadow at 25%); no client colour, no dot, no underline, no fill.',
  ctaFill: 'ink',
  cardFill: '--ab-bi-cast',

  roles: {
    canvas: {
      use: 'A fixed green-grey black #121412 the whole structure is cast from (light mode a cold bone ground); every surface is a step of the cast ramp #1A1C1A / #2A2D2A / #5C605A',
      never: 'Text, a warm brown or sepia ground, a blue-black "tech" tint, a client tint',
      coverage: '60–70%',
    },
    ink: {
      use: 'Bone: headlines, text, ribs, vertebrae and rim light. Never pure white',
      never: 'Large flat fills, or a glow',
      coverage: '≈15–20%',
    },
    primary: {
      use: 'Sinew only: hsl(h, s x 0.5, 30%) of the brand primary, as hairlines inside a few ribs, the progress fill and the open valve. Never the tunnel light',
      never: 'The main action fill, the nave core, body text, large fills, a glow; no neon',
      coverage: '≤3%',
    },
    secondary: {
      use: 'Tarnish: the verdigris or brass tint on metal parts, valve rings and status pills (mixed toward tarnished metal)',
      never: 'The main action, body text, the glow, or large fills',
      coverage: '≈6–10%',
    },
    accent: {
      use: 'One wet gloss spot: a pinpoint on the open valve (under 1% of the area)',
      never: 'Buttons, borders, panel fills, or saturated red as a default (it reads as gore)',
      coverage: '≤1%',
    },
  },

  // A cold, fixed green-grey black (Giger's airbrush grey, Scorn's stone); light mode a cold bone ground.
  canvas(b) {
    return b.isDark ? '#121412' : '#D6D4CC';
  },

  tokens(t) {
    const p = bgPalette(t);
    const d = t.isDark;
    return {
      '--ab-bi-glow': p.glow,
      '--ab-glow': p.glow,
      '--ab-bi-hl': p.boneLit,
      '--ab-bi-hl-glow': t.alpha(p.bone, 0.25),
      '--ab-bi-bone-lit': p.boneLit,
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

  // "The Nave": a packed vault after the Giger Bar. 22 parabolic ribs recede at an even depth step, each a chain
  // of three-part vertebrae (centrum and two processes) about 1/12 of the vault wide, so neighbours touch;
  // two runs of seven hoses run along each wall to the vanishing point and fuse into every third rib; the
  // vertebral column lies on the floor; fog thickens with depth toward a pale bone light (not the brand colour).
  // Pure SVG, viewBox 200 x 90, drawn far to near.
  art(ctx) {
    const t = ctx.t;
    const P = bgPalette(t);
    bgPalette.seq = (bgPalette.seq || 0) + 1;
    const id = 'bg' + bgPalette.seq;
    const cx = 100, vpy = 50, N = 22, K = 0.145;
    const f = n => Math.round(n * 10) / 10;
    const haze = t.mix(P.bone, t.canvas, 0.5);
    const core = t.isDark ? '#E6E1D3' : '#F4F2EC';
    const dPath = (A, close) => {
      const x0 = cx - A.a, x1 = cx + A.a;
      return `M${f(x0)} ${f(A.g)} C${f(x0 + A.a * 0.06)} ${f(A.g - A.Ht * 0.76)} ${f(cx - A.a * 0.3)} ${f(A.apex)} ${cx} ${f(A.apex)} C${f(cx + A.a * 0.3)} ${f(A.apex)} ${f(x1 - A.a * 0.06)} ${f(A.g - A.Ht * 0.76)} ${f(x1)} ${f(A.g)}${close ? ' Z' : ''}`;
    };
    const left = A => [[cx - A.a, A.g], [cx - A.a * 0.94, A.g - A.Ht * 0.76], [cx - A.a * 0.3, A.apex], [cx, A.apex]];
    const bez = (p, u) => {
      const k = 1 - u;
      return [k * k * k * p[0][0] + 3 * k * k * u * p[1][0] + 3 * k * u * u * p[2][0] + u * u * u * p[3][0],
        k * k * k * p[0][1] + 3 * k * k * u * p[1][1] + 3 * k * u * u * p[2][1] + u * u * u * p[3][1]];
    };
    const arch = (a, g, Ht) => ({ a, g, Ht, apex: g - Ht });
    const arches = [];
    for (let i = 0; i < N; i++) {
      const s = 1 / (1 + K * i);
      arches.push({ s, A: arch(88 * s, vpy + 46 * s, 116 * s) });
    }
    // one rib: vertebrae along the left curve (mirrored), rib thickness h = 12.6 s (1/12 of the vault width,
    // wider than the step to the next rib, so they touch). Each vertebra: a centrum (rounded quad turned to the
    // tangent) with an inner and an outer process; a dark body path and a lit path offset toward the light.
    const rib = (A, s) => {
      const L = left(A), M = 48, pts = [[...L[0]]], cum = [0];
      for (let j = 1; j <= M; j++) { const p = bez(L, j / M); pts.push(p); cum.push(cum[j - 1] + Math.hypot(p[0] - pts[j - 1][0], p[1] - pts[j - 1][1])); }
      const h = 12.6 * s, tot = cum[M];
      const n = Math.max(6, Math.round(tot / (h * 0.62)));
      const pitch = tot / n;
      let body = '', lit = '', proc = '';
      let j = 0;
      const simple = s < 0.42;
      for (let k = 0; k < n; k++) {
        const target = (k + 0.5) * pitch;
        while (j < M - 1 && cum[j + 1] < target) j++;
        const u = (target - cum[j]) / ((cum[j + 1] - cum[j]) || 1);
        const x = pts[j][0] + (pts[j + 1][0] - pts[j][0]) * u, y = pts[j][1] + (pts[j + 1][1] - pts[j][1]) * u;
        let tx = pts[j + 1][0] - pts[j][0], ty = pts[j + 1][1] - pts[j][1];
        const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
        [[x, tx, ty, 1], [2 * cx - x, -tx, ty, -1]].forEach(([X, TX, TY, m]) => {
          // outward normal (away from the nave)
          const nx = m > 0 ? TY : -TY, ny = m > 0 ? -TX : TX;
          const hw = pitch * 0.46, hh = h * 0.42;   // centrum half-length (along) and half-depth (across)
          const q = (a, b) => `${f(X + TX * a + nx * b)} ${f(y + TY * a + ny * b)}`;
          body += `M${q(-hw, -hh)}L${q(-hw * 0.8, hh)}L${q(hw * 0.8, hh)}L${q(hw, -hh)}Z`;
          lit += `M${q(-hw * 0.5, hh * 0.1)}L${q(-hw * 0.35, hh * 0.7)}L${q(hw * 0.35, hh * 0.7)}L${q(hw * 0.5, hh * 0.1)}Z`;
          if (!simple) {
            // the two processes: a long outer spur and a short inner one, both tapered
            proc += `M${q(-hw * 0.45, hh * 0.9)}L${q(hw * 0.25, h * 0.62)}L${q(hw * 0.45, hh * 0.9)}Z`;
            proc += `M${q(-hw * 0.4, -hh * 0.9)}L${q(-hw * 0.1, -h * 0.5)}L${q(hw * 0.4, -hh * 0.9)}Z`;
          }
        });
      }
      return { body, lit, proc, h };
    };
    // hoses: 7 per wall, each following the arches at a fixed fraction of the left curve (u) and a radial offset
    // inside the rib, from the nearest arch to the farthest; tapered by depth
    const HOSE_U = [0.2, 0.212, 0.224, 0.236, 0.248, 0.26, 0.272];
    const hosePt = (A, u, m) => { const p = bez(left(A), u); return m > 0 ? p : [2 * cx - p[0], p[1]]; };
    const hoseSeg = (i, m) => HOSE_U.map((u, k) => {
      const a0 = arches[i + 1].A, a1 = arches[i].A, s0 = arches[i + 1].s, s1 = arches[i].s;
      const p0 = hosePt(a0, u, m), p1 = hosePt(a1, u, m);
      const off0 = 6.2 * s0, off1 = 6.2 * s1;   // sit just inside the rib (toward the nave)
      const ix = m > 0 ? 1 : -1;
      const w0 = 0.8 * s0, w1 = 0.8 * s1;
      const A0 = [p0[0] + ix * off0, p0[1] + off0 * 0.4], A1 = [p1[0] + ix * off1, p1[1] + off1 * 0.4];
      return `M${f(A0[0])} ${f(A0[1] - w0)}L${f(A1[0])} ${f(A1[1] - w1)}L${f(A1[0])} ${f(A1[1] + w1)}L${f(A0[0])} ${f(A0[1] + w0)}Z`;
    }).join('');
    let out = '';
    for (let i = N - 1; i >= 0; i--) {
      const { s, A } = arches[i];
      const next = arches[i + 1];
      if (i < N - 1) out += `<path d="${dPath(A, true)}" fill="${haze}" opacity=".06"/>`;
      const wall = i === N - 1 ? `fill="${t.mix(core, t.canvas, 0.12)}"` : `fill="url(#${id}w)"`;
      out += `<path d="${dPath(A, true)}${next ? ' ' + dPath(next.A, true) : ''}" ${wall} fill-rule="evenodd"/>`;
      const hoses = next ? `<path d="${hoseSeg(i, 1)}${hoseSeg(i, -1)}" fill="url(#${id}t)"/>` : '';
      const fused = i % 3 === 0;
      const r = rib(A, s);
      out += `<path d="${r.proc}" fill="${P.metal}"/><path d="${r.body}" fill="url(#${id}v)"/><path d="${r.lit}" fill="${P.boneLit}" opacity=".35"/>`;
      // the sinew: one hairline of the brand glow inside every fourth rib
      if (i % 4 === 1) { const cord = arch(A.a - r.h * 0.6, A.g, A.Ht - r.h * 0.6); out += `<path d="${dPath(cord, false)}" fill="none" stroke="${P.glow}" stroke-width="${f(0.2 + 0.3 * s)}" stroke-opacity=".7"/>`; }
      out += hoses;
      // every third rib grows a collar over the hose bundle: the tubes are fused into the bone
      if (fused && next) [1, -1].forEach(m => { const p0 = hosePt(A, 0.236, m), ix = m > 0 ? 1 : -1, o = 6.2 * s; out += `<ellipse cx="${f(p0[0] + ix * o)}" cy="${f(p0[1] + o * 0.4)}" rx="${f(2.2 * s)}" ry="${f(5.2 * s)}" fill="url(#${id}v)"/>`; });
    }
    // vertebral column on the floor: trapezoid bodies with two lateral processes, receding to the light
    let column = '';
    for (let i = N - 1; i >= 1; i -= 2) {
      const { s, A } = arches[i];
      const y = A.g - 3.4 * s, bt = 8 * s, bb = 10.5 * s, bh = 3.6 * s;
      column += `<path d="M${f(cx - bt / 2)} ${f(y - bh / 2)}H${f(cx + bt / 2)}L${f(cx + bb / 2)} ${f(y + bh / 2)}H${f(cx - bb / 2)}Z" fill="url(#${id}v)"/>`
        + `<path d="M${f(cx - bt / 2)} ${f(y - bh * 0.2)}L${f(cx - bt / 2 - 8 * s)} ${f(y - bh * 0.45)}L${f(cx - bb / 2)} ${f(y + bh * 0.15)}ZM${f(cx + bt / 2)} ${f(y - bh * 0.2)}L${f(cx + bt / 2 + 8 * s)} ${f(y - bh * 0.45)}L${f(cx + bb / 2)} ${f(y + bh * 0.15)}Z" fill="${P.metal}"/>`;
    }
    const lamp = `<circle cx="${cx}" cy="${vpy}" r="20" fill="url(#${id}l)"/><circle cx="${cx}" cy="${vpy}" r="3.2" fill="${core}" opacity=".55"/><circle cx="${cx}" cy="${vpy}" r="1.3" fill="${core}"/>`;
    return `<div class="bg-art"><svg viewBox="0 0 200 90" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="presentation">
      <defs>
        <radialGradient id="${id}v" cx="40%" cy="30%" r="75%"><stop offset="0" stop-color="${P.bone}"/><stop offset=".5" stop-color="${P.metalHi}"/><stop offset="1" stop-color="${P.metal}"/></radialGradient>
        <linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.castHi}"/><stop offset=".5" stop-color="${P.cast}"/><stop offset="1" stop-color="${P.castLo}"/></linearGradient>
        <linearGradient id="${id}t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.metalHi}"/><stop offset=".5" stop-color="${P.metal}"/><stop offset="1" stop-color="${P.castLo}"/></linearGradient>
        <radialGradient id="${id}h" cx="${cx}" cy="${vpy}" r="120" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${haze}" stop-opacity=".2"/><stop offset="1" stop-color="${haze}" stop-opacity="0"/></radialGradient>
        <radialGradient id="${id}l"><stop offset="0" stop-color="${core}" stop-opacity=".3"/><stop offset="1" stop-color="${core}" stop-opacity="0"/></radialGradient>
      </defs>
      ${out}${column}
      <rect width="200" height="90" fill="url(#${id}h)"/>
      ${lamp}</svg>`
      + `<span class="bg-cap">Plate III &middot; The nave, from the threshold</span><span class="bg-fig">Fig. VII</span></div>`;
  },
  materials: [
    { name: 'Cast surface', css: 'background: {biCast}; box-shadow: inset 0 1px 0 {biRim2}, inset 0 -1px 0 {biCastLo}; /* every surface is a step of the cold cast ramp #1A1C1A / #2A2D2A / #5C605A; texture and rim light are the only variation; no pure white */' },
    { name: 'Rib frame (card)', css: 'background: {biCast}; border-radius: 50% 50% 0 0 / 120px 120px 0 0; box-shadow: inset 0 0 0 6px {canvas}, inset 0 0 0 7px {biRim2}; /* a rounded ribcage cap (never an onion or ogee), segmented by a ribbed rim of short bone ticks, a spinal label (C1, T6) at the keystone */' },
    { name: 'Tube (divider and progress)', css: 'height: 8px; border-radius: 4px; background: linear-gradient({biCastLo}, {biCastHi} 45%, {biMetal} 62%, {biCastLo}); /* lit portion: {biGlow} */' },
    { name: 'Vertebra (button)', css: 'background: {biBone}; color: {canvas}; border-radius: 6px; clip-path: polygon(0 50%, 10px 26%, 10px 0, calc(100% - 10px) 0, calc(100% - 10px) 26%, 100% 50%, calc(100% - 10px) 74%, calc(100% - 10px) 100%, 10px 100%, 10px 74%); /* a centrum with two tapered lateral processes; tabs are three of them on a spinal line; never a pill */' },
    { name: 'Ossicle (swatch)', css: 'border-radius: 28px 28px 6px 6px; box-shadow: inset 0 2px 3px rgba(0,0,0,.6), inset 0 -1px 0 rgba(255,255,255,.08); /* a cast tile 56 x 72, recessed 3px rim, never a glowing marble */' },
    { name: 'Valve (state sample)', css: 'border-radius: 50%; background: repeating-conic-gradient({biCastHi} 0 8deg, {biCast} 8deg 40deg, {biCastLo} 40deg 72deg); /* five folds meeting at a centre: closed, parting, open with a {biGlow} sinew core */' },
    { name: 'Sinew', css: 'color: {biGlow}; /* hsl(h, s x 0.5, 30%) of the brand primary: hairlines in a few ribs, the progress fill, the open valve; never the light source */' },
    { name: 'Tarnish', css: 'background: {biTarnish}; /* a faint verdigris or brass tint of the metal parts: status pills */' },
  ],

  rules: {
    do: [
      'Cast every surface from one charcoal-bone-tarnished material and vary only texture and rim light.',
      'Repeat a few modules (rib, vertebra, tube, valve) with slightly irregular spacing so it reads as grown.',
      'Show the client colour only as sinew: a few hairlines, the progress fill, the open valve; the tunnel light is pale bone.',
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
    coverBand: false,
    principles: [
      ['One cast material', 'Charcoal, bone and tarnished metal share a single surface.'],
      ['Repeat a few modules', 'Ribs, vertebrae, tubes and valves set the rhythm.'],
      ['Colour is sinew', 'The brand appears only as thin dim hairlines.'],
    ],
    do: [
      'Pack the ribs so they touch.',
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
