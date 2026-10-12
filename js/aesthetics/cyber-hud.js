/* 14 Cyber HUD — angular, neon, live. References: cyberpunk.net, Arknights, the
   HUDS+GUIS screen-graphics canon. The frame IS the HUD: a full-bleed 21:9
   viewport with data anchored to its four edges (tick rails, an altitude ladder,
   angled data slabs), the centre left open for one thin reticle over the brand
   mark, and the headline set inside the band as a slab. A fixed signal palette
   (cyan #00F0FF + magenta #FF2A6D on a cool blue-black) that never takes the
   client's colours; the client primary is one channel: the main action fill and
   the selected tab. Cut-corner panels with 1px neon edges, tick rulers and
   panel IDs, slashed /// labels. */

// largest published weight <= target (a single-weight face must stay at 400)
function hudWeight(font, target) {
  const ws = String((font && font.weights) || '400').split(';').map(Number).filter(Boolean);
  const le = ws.filter(w => w <= target);
  return le.length ? Math.max(...le) : Math.min(...ws);
}

// The fixed signal palette (never the client's): cyan and magenta on blue-black, or
// darkened for the light field.
function hudSignal(isDark) {
  return isDark
    ? { canvas: '#05070a', ink: null, neon: '#00f0ff', neon2: '#ff2a6d', dim: 'rgba(0,240,255,' }
    : { canvas: '#e9ecef', ink: '#0b0d10', neon: '#007c86', neon2: '#c4124d', dim: 'rgba(0,124,134,' };
}

registerAesthetic({
  key: 'cyber-hud', order: 14,
  name: 'Cyber HUD',
  descriptor: 'Angular · Neon · Live',
  influences: 'cyberpunk.net / Arknights / Film screen graphics',
  summary: 'A full-frame HUD: data on the edges, one reticle in an open centre, fixed cyan and magenta signal.',
  motto: 'Target acquired.',
  kicker: 'Sync 98.2%',
  mode: 'dark',
  slideShape: 'minimal',
  labels: { material: 'Systems', states: ['Standby', 'Armed', 'Live'], statesKind: 'button' },
  layout: { hero: 'centered', palette: 'swatches', sections: 'two-col' },
  type: { ui: 'mono', label: 'mono', display: 0.66 },
  highlight: 'custom',
  highlightNote: 'The word sits on a solid magenta signal slab (#FF2A6D, darkened on light fields) cut at the bottom right, set in the field colour: a tag, never a glow or an RGB split.',

  roles: {
    canvas: {
      use: 'A fixed cool blue-black field (#05070A; #E9ECEF in light mode) under a faint grid. Never tinted by the brand',
      never: 'Text, or a lighter background card',
      coverage: '70–75%',
    },
    ink: {
      use: 'Headlines, readout values and body text',
      never: 'Large fields',
      coverage: '12–18%',
    },
    primary: {
      use: 'One channel only: the main action fill and the selected tab. The HUD signal itself is fixed cyan and magenta',
      never: 'Panel edges, rulers, readouts, the reticle (those are the fixed signal)',
      coverage: '≈4%',
    },
    secondary: {
      use: 'Off the HUD: charts and print pieces',
      never: 'Edges, readouts or the reticle',
      coverage: '≈2%',
    },
    accent: {
      use: 'Off the HUD: one status lamp at most',
      never: 'Buttons, body text, panel borders, large fills',
      coverage: '≤2%',
    },
  },

  // Its own ground: a cool blue-black (never a primary mix), or a cool light grey.
  canvas(b) {
    return hudSignal(b.isDark).canvas;
  },

  tokens(t) {
    const d = t.isDark;
    const S = hudSignal(d);
    const hf = typeof state !== 'undefined' && state.headingFont;
    const neon = S.neon, neon2 = S.neon2;
    const out = {
      '--ab-hw': hudWeight(hf, 800),
      '--ab-neon': neon,
      '--ab-neon2': neon2,
      '--ab-hud-line': t.alpha(neon, 0.62),
      '--ab-hud-line-soft': t.alpha(neon, 0.28),
      '--ab-hud-glow': t.alpha(neon, d ? 0.38 : 0.18),
      '--ab-hud-fill': t.mix(neon, t.canvas, 0.05),
      '--ab-hud-fill2': t.mix(neon, t.canvas, 0.11),
      '--ab-hud-fill3': t.mix(neon, t.canvas, 0.2),
      '--ab-hud-grid': t.alpha(neon, d ? 0.055 : 0.07),
      '--ab-hud-tick': t.alpha(neon, 0.3),
      '--ab-hud-hatch': t.alpha(neon, 0.45),
      '--ab-on-neon2': d ? '#05070a' : '#ffffff',
      '--ab-type-pick-w': '600',
    };
    if (S.ink) out['--ab-ink'] = S.ink;
    return out;
  },

  // The viewport: a full-bleed 21:9 frame. Top and bottom tick rails (major tick every
  // 10%, labelled 000 / 090 / 180 / 270 / 360), a left altitude ladder, three angled
  // data slabs on the right, corner readouts, and one thin reticle over the brand
  // mark (1px outline) right of centre. Everything is inline-styled so the art stands
  // on its own (blend donor); fixed signal colours only.
  art(ctx) {
    const t = ctx.t;
    const S = hudSignal(t.isDark);
    const neon = S.neon, neon2 = S.neon2, bg = t.canvas;
    const ink = S.ink || t.ink;
    const mono = "ui-monospace,'SF Mono',Menlo,monospace";
    const a = (x) => t.alpha(neon, x);
    const ruler = (pos) => {
      const edge = pos === 'top' ? 'top:10px' : 'bottom:10px';
      const labels = ['000', '090', '180', '270', '360'].map((l, i) =>
        `<span style="position:absolute;${pos === 'top' ? 'top:13px' : 'bottom:13px'};left:${i * 25}%;transform:translateX(${i === 0 ? '0' : i === 4 ? '-100%' : '-50%'});font:500 8px/1 ${mono};letter-spacing:.1em;color:${neon}">${l}</span>`).join('');
      return `<div style="position:absolute;left:52px;right:52px;${edge};height:24px">
        <div style="position:absolute;left:0;right:0;${pos === 'top' ? 'top:0' : 'bottom:0'};height:1px;background:${a(0.5)}"></div>
        <div style="position:absolute;left:0;right:0;${pos === 'top' ? 'top:1px' : 'bottom:1px'};height:4px;background:repeating-linear-gradient(90deg,${a(0.45)} 0 1px,transparent 1px 2%)"></div>
        <div style="position:absolute;left:0;right:-1px;${pos === 'top' ? 'top:1px' : 'bottom:1px'};height:9px;background:repeating-linear-gradient(90deg,${neon} 0 1px,transparent 1px 10%)"></div>
        ${labels}</div>`;
    };
    let ladder = '';
    for (let i = 0; i <= 10; i++) {
      const major = i % 5 === 0;
      ladder += `<div style="position:absolute;left:0;top:${i * 10}%;width:${major ? 14 : 8}px;height:1px;background:${major ? neon : a(0.5)}"></div>`;
      if (major) ladder += `<span style="position:absolute;left:18px;top:${i * 10}%;transform:translateY(-50%);font:500 8px/1 ${mono};color:${a(0.85)}">${String(60 - i * 3).padStart(3, '0')}</span>`;
    }
    const slab = (k, v, live) => `<div style="height:20px;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:0 14px 0 12px;clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%);background:${live ? neon2 : a(0.14)};${live ? '' : `box-shadow:inset 0 0 0 1px ${a(0.5)};`}font:700 8.5px/1 ${mono};letter-spacing:.12em;color:${live ? S.canvas : neon}"><span>${k}</span><span style="color:${live ? S.canvas : ink}">${v}</span></div>`;
    const initial = String(ctx.initial && ctx.initial !== '·' ? ctx.initial : 'M').replace(/[&<>"']/g, '');
    const vf = 'vector-effect="non-scaling-stroke"';
    return `<div class="chv" style="position:absolute;inset:0;overflow:hidden;background:${bg};color:${neon};background-image:linear-gradient(${a(0.05)} 1px,transparent 1px),linear-gradient(90deg,${a(0.05)} 1px,transparent 1px);background-size:32px 32px">
      ${ruler('top')}${ruler('bottom')}
      <div style="position:absolute;left:14px;top:48px;bottom:48px;width:40px">
        <div style="position:absolute;left:0;top:0;bottom:0;width:1px;background:${a(0.5)}"></div>${ladder}
        <div style="position:absolute;left:-2px;top:38%;width:0;height:0;border-left:7px solid ${neon2};border-top:5px solid transparent;border-bottom:5px solid transparent;transform:translateY(-50%)"></div>
      </div>
      <div class="chv-slabs" style="position:absolute;right:16px;top:50%;transform:translateY(-50%);display:grid;gap:6px;width:clamp(120px,22%,190px)">
        ${slab('TGT', 'M-01', false)}${slab('VEL', '0.82', false)}${slab('LIVE', 'REC', true)}
      </div>
      <span style="position:absolute;left:62px;top:46px;font:500 8.5px/1.5 ${mono};letter-spacing:.12em;color:${neon}">/// TRK.0412_A<br><span style="color:${ink}">SYNC 98.2%</span></span>
      <span style="position:absolute;right:62px;top:46px;text-align:right;font:500 8.5px/1.5 ${mono};letter-spacing:.12em;color:${neon}">X 012.4 / Y 087.1<br><span style="color:${ink}">FRM 00:41:07</span></span>
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" focusable="false" style="position:absolute;left:66%;top:50%;width:34%;height:62%;transform:translate(-50%,-50%);overflow:visible">
        <text x="50" y="50" text-anchor="middle" dominant-baseline="central" font-family="${mono}" font-weight="700" font-size="30" fill="none" stroke="${neon}" stroke-width="1" ${vf} opacity=".75">${initial}</text>
        <g fill="none" stroke="${neon}" stroke-width="1">
          <circle cx="50" cy="50" r="32" ${vf} stroke-opacity=".85"/>
          <circle cx="50" cy="50" r="40" ${vf} stroke-opacity=".35" stroke-dasharray="2 3"/>
          <path d="M50 4V22M50 78V96M4 50H22M78 50H96" ${vf}/>
        </g>
        <path d="M86 47l4 3-4 3z" fill="${neon2}"/>
      </svg>
    </div>`;
  },

  materials: [
    { name: 'Chamfered panel', css: 'background: {hudFill}; clip-path: polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px); /* two opposite corners cut at 45deg; 1px {neon} edge layer behind a 1px-inset fill; a 6px tick ruler on the top edge (1px every 8px, {hudTick}); panel ID PNL-0412 at its top right */' },
    { name: 'Viewport frame', css: 'background: {canvas}; /* full-bleed 21:9; tick rails top and bottom (major every 10%, 000 / 090 / 180 / 270 / 360), altitude ladder left, three angled data slabs right, centre open for one reticle */' },
    { name: 'Data slab', css: 'clip-path: polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%); background: {neon2}; color: {canvas}; font: 700 9px mono, uppercase, .12em; /* idle slabs: 14% {neon} with a 1px {neon} edge */' },
    { name: 'Main action', css: 'background: {primary}; color: {onPrimary}; clip-path: chamfer 11px (top-left, bottom-right); font: mono, uppercase, .1em; /* the one place the client colour lights up */' },
    { name: 'Signal slab (highlight)', css: 'background: {neon2}; color: {canvas}; clip-path: polygon(0 0, 100% 0, calc(100% - .3em) 100%, 0 100%);' },
  ],

  rules: {
    do: [
      'Make the frame the HUD: anchor data to the four edges (tick rails, a ladder, angled slabs) and leave the centre open for one reticle.',
      'Use the fixed signal palette: cyan #00F0FF and magenta #FF2A6D on a blue-black field; the client primary is only the main action and the selected tab.',
      'Cut two opposite corners at 45 degrees on every panel; add a tick ruler and a panel ID to each.',
      'Label everything in mono caps with slashes: /// SECTION.NAME_01.',
    ],
    dont: [
      'Draw a wireframe globe or a perspective floor grid; that is synthwave, not a HUD.',
      'Tint the field or the neon with the client palette, or warm the dark field toward brown.',
      'Use an RGB split or glow behind text; highlights are solid signal slabs.',
      'Use corner brackets or lock-on states; those belong to blob tracking.',
    ],
  },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    principles: [
      ['The frame is the HUD', 'Data on the four edges, the centre open for one reticle.'],
      ['Fixed signal colour', 'Cyan and magenta on blue-black; the brand is one channel.'],
      ['Slashed labels', 'Mono caps, /// SECTION.NAME_01, tick rulers and panel IDs.'],
    ],
    do: [
      'Anchor data to the edges of the frame.',
      'Keep the signal cyan and magenta.',
      'Cut two opposite corners on every panel.',
    ],
    dont: [
      'Draw a wireframe globe or floor grid.',
      'Warm the field with the client colour.',
      'Use RGB splits or glow behind text.',
    ],
  },
});
