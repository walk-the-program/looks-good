/* 17 Industrial Device — precise, physical, calm. Reference: teenage.engineering product
   pages (OP-1 field, EP-133), the OP-1's four-colour encoder code, Braun's single yellow
   hand. Product first: the device is the hero, life size and bleeding off the board's right
   edge; the type is small and lowercase. Every legend is printed ON the hardware (tiny
   lowercase Azeret Mono), never in numbered callouts. Colour is a fixed function code:
   four encoder caps (#2B7BE4 blue, #2FB15C green, #F2F2EE white, and the brand primary),
   white and graphite key families, ONE primary main-action key and the knob pointer; the
   OLED is single-ink pixels. UI radius 8 for panels, 4 for keys; only hardware has an edge. */
registerAesthetic({
  key: 'industrial-device', order: 17,
  name: 'Industrial Device',
  descriptor: 'Precise · Physical · Calm',
  influences: 'Teenage Engineering / Braun (Dieter Rams) / Lab equipment',
  summary: 'The product first: printed legends, a fixed colour code and tiny lowercase type.',
  motto: 'Every control has a job.',
  kicker: 'tp-01 · field',
  mode: 'light',
  slideShape: 'minimal',
  labels: { material: 'Controls', states: ['Up', 'Hover', 'Down'], statesKind: 'button' },
  layout: { hero: 'split', palette: 'strips', sections: 'asym' },
  type: { ui: 'sans', label: 'mono', display: 1 },
  highlight: 'custom',
  highlightNote: 'No highlight block: the headline is one small lowercase line and the word is not marked; the product carries the scale.',
  cardFill: '--ab-face',

  roles: {
    canvas: {
      use: 'The aluminium body of the page (the light color pulled toward warm grey) and every recessed slot',
      never: 'Text, or a saturated fill',
    },
    primary: {
      use: 'The one main-action key, the knob pointer, the fourth encoder cap, the selected key and the switch "on"; OLED pixels are lifted from it',
      never: 'Body text, decoration, panel fills, a second main key, the meter',
    },
    secondary: {
      use: 'A printed colour code on status tags only',
      never: 'The main key, the OLED meter, encoder caps, body text, panel fills',
    },
    accent: {
      use: 'One power dot beside the kicker',
      never: 'Keys, encoder caps, lamps, body text, borders, panel fills',
      coverage: '≤1%',
    },
  },

  // Light canvases are pulled toward warm aluminium grey (#d9d9d6); dark ones toward graphite.
  canvas(b) {
    return b.isDark ? b.mix(b.canvas, '#1d1e21', 0.55) : b.mix(b.canvas, '#d9d9d6', 0.42);
  },

  tokens(t) {
    const d = t.isDark;
    const face = d ? t.mix('#ffffff', t.canvas, 0.05) : t.mix('#ffffff', t.canvas, 0.46);
    const key = d ? t.mix('#ffffff', t.canvas, 0.1) : t.mix('#ffffff', t.canvas, 0.72);
    const keyEdge = d ? t.mix('#000000', t.canvas, 0.55) : t.mix(t.ink, t.canvas, 0.26);
    // the graphite key family (transport row and function column): darker than the face in both modes
    const keyDark = d ? t.mix('#000000', t.canvas, 0.6) : t.mix(t.ink, t.canvas, 0.82);
    const onKeyDark = t.contrast('#f4f4f1', keyDark) >= 4.5 ? '#f4f4f1' : '#ffffff';
    const lift = (hex, bg, min) => { let c = hex; for (let k = 1; k <= 20 && t.contrast(c, bg) < min; k++) c = t.mix('#ffffff', c, k * 0.05); return c; };
    const oled = '#07080a';
    return {
      '--ab-face': face,
      '--ab-key': key,
      '--ab-key-dark': keyDark,
      '--ab-on-key-dark': onKeyDark,
      '--ab-key-dark-edge': d ? '#000000' : t.mix('#000000', keyDark, 0.5),
      '--ab-key-dark-hi': t.mix('#ffffff', keyDark, 0.14),
      '--ab-font-label': '"Azeret Mono", "IBM Plex Mono", "Space Mono", ui-monospace, "SF Mono", Menlo, monospace',
      '--ab-key-hi': d ? t.mix('#ffffff', key, 0.1) : '#ffffff',
      '--ab-key-edge': keyEdge,
      '--ab-edge-hi': d ? 'rgba(255,255,255,.1)' : 'rgba(255,255,255,.85)',
      '--ab-edge-lo': d ? 'rgba(0,0,0,.55)' : t.alpha(t.ink, 0.22),
      '--ab-hair': t.alpha(t.ink, d ? 0.18 : 0.16),
      '--ab-slot': d ? t.mix('#000000', t.canvas, 0.3) : t.mix(t.ink, t.canvas, 0.1),
      '--ab-slot-sh': d ? 'inset 0 2px 4px rgba(0,0,0,.6), inset 0 -1px 0 rgba(255,255,255,.07)' : `inset 0 2px 3px ${t.alpha(t.ink, 0.28)}, inset 0 -1px 0 rgba(255,255,255,.8)`,
      '--ab-dot': t.alpha(t.ink, d ? 0.42 : 0.34),
      '--ab-oled': oled,
      '--ab-oled-ink': lift(t.primary, oled, 7),
      '--ab-oled-dim': t.alpha(lift(t.primary, oled, 7), 0.45),
      '--ab-led': t.accent,
      '--ab-led-glow': t.alpha(t.accent, 0.7),
      '--ab-ring': t.alpha(t.primary, 0.32),
      '--ab-pri-glow': t.alpha(t.primary, 0.55),
    };
  },

  // The product, life size and bleeding off the right edge of the board (OP-1 / EP-133 product pages). A grid of
  // 100 x 64 units (1 unit = 1cqw of the art box). Everything is printed ON the hardware, never in callouts: tiny
  // lowercase Azeret Mono legends under the knob, under the encoders, over the screen and under the keys.
  // Colour is a fixed function code: four encoder caps (blue, green, white, and the brand primary), white and
  // graphite key families, ONE primary main-action key; the OLED is single-ink pixels.
  art(ctx) {
    const e = escapeHtml;
    const Y = 64;
    const at = (x, y, w, h) => `left:${x}%;top:${(y / Y) * 100}%;width:${w}%;${h != null ? `height:${(h / Y) * 100}%` : ''}`;
    const name = e(String(ctx.brandName || '').toLowerCase());
    const ico = {
      loop: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2.4 5.4a2.9 2.9 0 1 0 .9-2.5" fill="none" stroke="currentColor" stroke-width="1.15"/><path d="M1 .9v2.9h2.9z" fill="currentColor"/></svg>',
      play: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2.6 1.4 8.4 5 2.6 8.6z" fill="currentColor"/></svg>',
      rec: '<svg viewBox="0 0 10 10" aria-hidden="true"><circle cx="5" cy="5" r="3.1" fill="currentColor"/></svg>',
      stop: '<svg viewBox="0 0 10 10" aria-hidden="true"><rect x="2.2" y="2.2" width="5.6" height="5.6" fill="currentColor"/></svg>',
    };
    // 4 x 4 pads: white, the graphite function column (col 3) with the one primary key on top, a graphite
    // transport row with icons
    const L = ['1', '2', '3', '', '4', '5', '6', 'B', '7', '8', '9', 'C', ico.loop, ico.play, ico.rec, ico.stop];
    let keys = '';
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
      const main = r === 0 && c === 3;
      const dark = !main && (c === 3 || r === 3);
      const lab = L[r * 4 + c];
      keys += `<i class="idv-key${main ? ' main' : dark ? ' g' : ''}${lab.startsWith('<svg') ? ' ic' : ''}"><b>${lab}</b></i>`;
    }
    const fn = ['seq', 'synth', 'drum', 'tape', 'mix', 'shift'].map((k, i) => `<span><i class="idv-key g${i === 5 ? ' sh' : ''}"></i><small>${k}</small></span>`).join('');
    const encs = [['b', 'tune'], ['g', 'mix'], ['w', 'fx'], ['p', 'lvl']].map(([c, k]) => `<span><i class="idv-enc ${c}"></i><small>${k}</small></span>`).join('');
    const bed = Array.from({ length: 16 }, (_, i) => `<i${i % 4 === 0 ? ` data-n="${i + 1}"` : ''}></i>`).join('');
    const dots = Array.from({ length: 48 }, () => '<i></i>').join('');
    // OLED: single-ink pixel meter
    const bars = [40, 70, 55, 90, 35, 75, 60, 45, 80].map(h => `<i style="height:${h}%"></i>`).join('');
    // encoder scale and knurl: 11 printed ticks over 270 degrees, 0 / 5 / 10, and a 48-tick knurled ring
    const KX = 15, KY = 35;
    const pt = (r, deg) => [(KX + r * Math.sin(deg * Math.PI / 180)).toFixed(2), (KY - r * Math.cos(deg * Math.PI / 180)).toFixed(2)];
    let scale = '';
    for (let i = 0; i <= 10; i++) {
      const deg = -135 + i * 27, long = i % 5 === 0;
      const [x1, y1] = pt(12.2, deg), [x2, y2] = pt(long ? 14.2 : 13.3, deg);
      scale += `<line class="${long ? 'lg' : ''}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
    }
    [[0, '0'], [5, '5'], [10, '10']].forEach(([i, txt]) => {
      const [x, y] = pt(15.9, -135 + i * 27);
      scale += `<text class="sc" x="${x}" y="${(+y + 0.5).toFixed(2)}" text-anchor="middle">${txt}</text>`;
    });
    const knurl = `<circle class="knurl" cx="${KX}" cy="${KY}" r="10.6" pathLength="96"/>`;
    return `<div class="idv">
      <div class="idv-body" style="${at(0, 0, 100, 64)}"></div>
      <div class="idv-grille" style="${at(4, 5, 11, 11)}">${dots}</div>
      <small class="idv-pr" style="${at(19, 2.4, 20)}">mode &middot; a.01</small>
      <div class="idv-oled" style="${at(19, 5, 37, 11)}"><b>${name}</b><span class="idv-bars">${bars}</span></div>
      <div class="idv-encs" style="${at(60, 5, 36, 13)}">${encs}</div>
      <div class="idv-knob" style="${at(KX - 9.6, KY - 9.6 * 100 / 64 * 64 / 100, 19.2)}"><span></span></div>
      <svg class="idv-marks" viewBox="0 0 100 ${Y}" focusable="false"><g class="idv-scale">${knurl}${scale}</g><text class="pr" x="${KX}" y="${KY + 15.2}" text-anchor="middle">vol</text></svg>
      <div class="idv-keys" style="${at(33, 21, 29)}">${keys}</div>
      <small class="idv-pr idv-tr" style="${at(33, 50.6, 29)}"><span>loop</span><span>play</span><span>rec</span><span>stop</span></small>
      <div class="idv-fn" style="${at(66, 21, 30, 26)}">${fn}</div>
      <div class="idv-bed" style="${at(4, 54, 92, 6)}">${bed}</div>
      <small class="idv-pr idv-model" style="${at(4, 61, 60)}">tp-01 &middot; field &middot; ${name}</small>
    </div>`;
  },

  materials: [
    { name: 'Device body', css: 'background: {face}; border: 1px solid {hair}; border-radius: 14px 0 0 14px; box-shadow: inset 0 1px 0 {edgeHi}, inset 0 -1px 0 {edgeLo}; /* the hardware is the panel: anodised flat, bleeding off the right edge; only hardware has an edge */' },
    { name: 'Panel (UI)', css: 'background: {face}; border: 1px solid {hair}; border-radius: 8px; /* cards are flat, no light-edge inset; the edge belongs to hardware */' },
    { name: 'Key', css: 'background: {key}; border: 1px solid {hair}; border-radius: 4px; box-shadow: inset 0 1px 0 {keyHi}, 0 2px 0 {keyEdge}; /* square physical button with a 2px darker underside and a printed legend */' },
    { name: 'Graphite key', css: 'background: {keyDark}; color: {onKeyDark}; border-radius: 4px; box-shadow: inset 0 1px 0 {keyDarkHi}, 0 2px 0 {keyDarkEdge}; /* the second key family: function column, transport row */' },
    { name: 'Encoder caps', css: 'background: #2B7BE4 | #2FB15C | #F2F2EE | {primary}; border-radius: 50%; /* a fixed function code (the OP-1 move); the client changes only the fourth cap */' },
    { name: 'Main action key', css: 'background: {primary}; color: {onPrimary}; border-radius: 4px; box-shadow: inset 0 1px 0 rgba(255,255,255,.3), 0 2px 0 {keyEdge}; font: 600 12px "Azeret Mono", ui-monospace, monospace; /* the only primary key */' },
    { name: 'OLED strip', css: 'background: {oled}; color: {oledInk}; border-radius: 4px; font: 700 11px "Doto", "Azeret Mono", ui-monospace, monospace; /* single-ink pixels: name and meter in one colour */' },
    { name: 'Printed legend', css: 'font: 500 7px "Azeret Mono", ui-monospace, monospace; text-transform: lowercase; letter-spacing: .06em; color: {muted}; /* printed on the hardware under or over its control; never a callout */' },
    { name: 'Key pressed', css: 'transform: translateY(2px); box-shadow: inset 0 1px 2px {edgeLo}, 0 0 0 {keyEdge}; /* the 2px underside compresses */' },
  ],

  rules: {
    do: [
      'Let the product be the hero: life size, bleeding off the edge; keep the headline small and lowercase.',
      'Print every legend on the hardware itself in tiny lowercase mono; one legend per control.',
      'Keep colour a fixed function code: four encoder caps, white and graphite keys, one primary key.',
      'Make keys square with a 2px darker underside that compresses on press; radius 8 for panels, 4 for keys.',
    ],
    dont: [
      'Annotate the product with numbered callouts or leader lines.',
      'Let client colours tint the device or the screen meter.',
      'Add soft drop shadows, gradients, glass, or rows of status lamps.',
      'Set a big sentence-case headline or a highlight block.',
    ],
  },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    coverDisplay: 0.6,
    principles: [
      ['The product is the page', 'Life size, bleeding off the edge, tiny type beside it.'],
      ['Printed, not annotated', 'Legends sit on the hardware, never in callouts.'],
      ['A fixed colour code', 'Four encoder caps and one primary key.'],
    ],
    do: [
      'Print legends on the hardware.',
      'Compress keys 2px on press.',
      'Keep the headline small and lowercase.',
    ],
    dont: [
      'Add numbered callouts.',
      'Tint the device with client colours.',
      'Show rows of status lamps.',
    ],
  },
});
