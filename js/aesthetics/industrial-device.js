/* 17 Industrial Device — precise, physical, calm. Reference: teenage.engineering
   product pages (OP-1, TP-7), Braun ET66 and Nothing's phone UI. Light warm-grey
   "aluminium" canvas; machined flat panels (radius 14, 1px light edge on top, darker
   edge below); square physical keys with a 2px darker underside that compresses on
   press; tiny mono labels with numbered callouts and leader lines; dot-grid speaker
   texture. The hero art is a device face: a flat-capped encoder with a printed
   0-10 scale, a 4x4 key grid with printed legends in two key families (light and
   graphite) and one accent function key, label plates, an OLED strip with the
   brand name, a speaker grille and labelled LEDs. */
registerAesthetic({
  key: 'industrial-device', order: 17,
  name: 'Industrial Device',
  descriptor: 'Precise · Physical · Calm',
  influences: 'Teenage Engineering / Braun (Dieter Rams) / Lab equipment',
  summary: 'Machined panels, physical keys and tiny numbered labels.',
  motto: 'Every control has a job.',
  kicker: 'Controls, numbered',
  mode: 'light',
  slideShape: 'minimal',
  labels: { material: 'Controls', states: ['Up', 'Hover', 'Down'], statesKind: 'button' },
  layout: { hero: 'split', palette: 'swatches', sections: 'two-col' },
  type: { ui: 'sans', label: 'mono', display: 0.85 },
  highlight: 'custom',
  highlightNote: 'The word sits on a flat primary plate (square corners, no shadow), as a headline sits on a flat colour block on a product page: on-primary text on a primary fill, never accent-coloured text.',
  cardFill: '--ab-face',

  roles: {
    canvas: {
      use: 'The aluminium body of the page (the light color pulled toward warm grey) and every recessed slot',
      never: 'Text, or a saturated fill',
    },
    primary: {
      use: 'Active states only: the selected key, the switch "on", the knob arc, OLED text and the one main action key (lit progress segments and the fit tag are ink, not primary)',
      never: 'Body text, decoration, large panel fills, more than one main key',
    },
    secondary: {
      use: 'Status tags and the readout segments of the second channel; small, as a printed color code on the panel',
      never: 'The main key, body text, panel fills',
    },
    accent: {
      use: 'The single function key in the key grid and the indicator LEDs: a printed spark, never type',
      never: 'Buttons other than the one function key, body text, borders, panel fills',
      coverage: '≤3%',
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
      '--ab-oled-dim': lift(t.secondary, oled, 4.5),
      '--ab-oled-acc': lift(t.accent, oled, 7),
      '--ab-led': t.accent,
      '--ab-led-glow': t.alpha(t.accent, 0.7),
      '--ab-ring': t.alpha(t.primary, 0.32),
      '--ab-pri-glow': t.alpha(t.primary, 0.55),
    };
  },

  // A device face (viewBox-like grid of 100 x 82 units: 1 unit = 1cqw of the art box).
  // Markers 1-3 sit in the gutters beside the OLED, the knob and the keys; a legend runs below.
  art(ctx) {
    const e = escapeHtml;
    const Y = 82;
    const at = (x, y, w, h) => `left:${x}%;top:${(y / Y) * 100}%;width:${w}%;height:${(h / Y) * 100}%`;
    const name = e(ctx.brandName.toUpperCase());
    // 4x4 keys, every one printed: digits and letters top-left (EP-133 style), icons on the
    // transport row. Two key families: light, and graphite (function column + transport row).
    // One accent function key (row 0, col 3) and one active key (row 2, col 1).
    const ico = {
      loop: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2.4 5.4a2.9 2.9 0 1 0 .9-2.5" fill="none" stroke="currentColor" stroke-width="1.15"/><path d="M1 .9v2.9h2.9z" fill="currentColor"/></svg>',
      play: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2.6 1.4 8.4 5 2.6 8.6z" fill="currentColor"/></svg>',
      rec: '<svg viewBox="0 0 10 10" aria-hidden="true"><circle cx="5" cy="5" r="3.1" fill="currentColor"/></svg>',
    };
    const L = ['1', '2', '3', 'A', '4', '5', '6', 'B', '7', '8', '9', 'C', ico.loop, ico.play, ico.rec, 'D'];
    let keys = '';
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
      const acc = r === 0 && c === 3, on = r === 2 && c === 1;
      const dark = !acc && !on && (c === 3 || r === 3);
      const cls = acc ? ' acc' : on ? ' on' : dark ? ' g' : '';
      const icon = L[r * 4 + c].startsWith('<svg');
      keys += `<i class="idv-key${cls}${icon ? ' ic' : ''}"><b>${L[r * 4 + c]}</b></i>`;
    }
    // the speaker grille: 18 x 4 dots
    const dots = Array.from({ length: 72 }, () => '<i></i>').join('');
    const bars = [40, 70, 55, 90, 35, 75, 60].map(h => `<i style="height:${h}%"></i>`).join('');
    const marker = (n, x, y, x2) => `<g><line x1="${Math.min(x + 2.4, x2)}" y1="${y}" x2="${Math.max(x + 2.4, x2)}" y2="${y}"/><circle class="m" cx="${x}" cy="${y}" r="2.4"/><circle class="d" cx="${x2}" cy="${y}" r="0.7"/><text x="${x}" y="${y + 0.95}" text-anchor="middle">${n}</text></g>`;
    // encoder scale: 11 radial lines over 270 degrees (every 5th longer), 0 / 5 / 10 numerals; 0-5 lit in primary
    const KX = 29, KY = 48.5;
    const pt = (r, deg) => [(KX + r * Math.sin(deg * Math.PI / 180)).toFixed(2), (KY - r * Math.cos(deg * Math.PI / 180)).toFixed(2)];
    let scale = '';
    for (let i = 0; i <= 10; i++) {
      const deg = -135 + i * 27, long = i % 5 === 0;
      const [x1, y1] = pt(16.9, deg), [x2, y2] = pt(long ? 19.8 : 18.5, deg);
      scale += `<line class="${i <= 5 ? 'lit ' : ''}${long ? 'lg' : ''}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
    }
    [[0, '0'], [5, '5'], [10, '10']].forEach(([i, txt]) => {
      const [x, y] = pt(i === 5 ? 22.4 : 21.6, -135 + i * 27);
      scale += `<text class="sc" x="${x}" y="${(+y + 0.75).toFixed(2)}" text-anchor="middle">${txt}</text>`;
    });
    return `<div class="idv">
      <div class="idv-body" style="${at(0, 0, 100, 72)}"></div>
      <div class="idv-oled" style="${at(12, 7.5, 77, 11)}"><b>${name}</b><span class="idv-bars">${bars}</span><em>A.01</em></div>
      <div class="idv-knob" style="${at(14.5, 34, 29, 29)}"><span></span></div>
      <div class="idv-plates" style="${at(54, 19.5, 17, 5.2)}"><b>MODE</b><b class="l">EDIT</b></div>
      <div class="idv-keys" style="${at(54, 26, 35, 35)}">${keys}</div>
      <div class="idv-grille" style="${at(12, 65.4, 36, 4.4)}">${dots}</div>
      <div class="idv-leds" style="${at(54, 65, 35, 4.6)}"><i class="on"></i><small>PWR</small><i></i><small>REC</small><i class="p"></i><small>PLY</small><code>TP-01</code></div>
      <svg class="idv-marks" viewBox="0 0 100 ${Y}" focusable="false"><g class="idv-scale">${scale}</g>${marker(1, 5.5, 13, 11.4)}${marker(2, 5.5, 48.5, 8.9)}${marker(3, 94.5, 43.5, 89.6)}</svg>
      <div class="idv-legend"><span><b>1</b>Display</span><span><b>2</b>Encoder</span><span><b>3</b>Keys &middot; 16</span></div>
    </div>`;
  },

  materials: [
    { name: 'Machined panel', css: 'background: {face}; border: 1px solid {hair}; border-radius: 14px; box-shadow: inset 0 1px 0 {edgeHi}, inset 0 -1px 0 {edgeLo}; /* flat fill: a 1px light edge on top, a darker edge below; no soft shadow, no gradient puffiness */' },
    { name: 'Key', css: 'background: {key}; border: 1px solid {hair}; border-radius: 6px; box-shadow: inset 0 1px 0 {keyHi}, 0 2px 0 {keyEdge}; /* square physical button with a 2px darker underside and a printed legend top-left */' },
    { name: 'Function key (accent)', css: 'background: {accent}; border-radius: 4px; box-shadow: inset 0 1px 0 rgba(255,255,255,.35), 0 2px 0 {keyEdge}; /* the one accent key in the grid; indicator LEDs use {led} with a glow */' },
    { name: 'OLED strip', css: 'background: {oled}; color: {oledInk}; border-radius: 5px; font: 700 11px "Doto", "Azeret Mono", ui-monospace, monospace; letter-spacing: .08em; /* brand name in primary pixels; black stays black in both modes */' },
    { name: 'Key pressed', css: 'transform: translateY(2px); box-shadow: inset 0 1px 2px {edgeLo}, 0 0 0 {keyEdge}; /* the 2px underside compresses */' },
    { name: 'Graphite key', css: 'background: {keyDark}; color: {onKeyDark}; border: 1px solid {hair}; border-radius: 6px; box-shadow: inset 0 1px 0 {keyDarkHi}, 0 2px 0 {keyDarkEdge}; font: 600 10px "Azeret Mono", ui-monospace, monospace; /* the second key family (function column and transport row): a printed legend on every key */' },
    { name: 'Main action key', css: 'background: {primary}; color: {onPrimary}; border-radius: 6px; box-shadow: inset 0 1px 0 rgba(255,255,255,.3), 0 2px 0 {keyEdge}; font: 600 12px "Azeret Mono", ui-monospace, monospace; text-transform: uppercase;' },
    { name: 'Recessed slot', css: 'background: {slot}; border-radius: 8px; box-shadow: {slotSh}; /* fields and switch tracks */' },
    { name: 'Speaker grille', css: 'background-image: radial-gradient({dot} 38%, transparent 42%); background-size: 6px 6px; /* a dot grid, decoration only */' },
  ],

  rules: {
    do: [
      'Build every panel flat: radius 14, a 1px light edge on top and a darker edge below, so it reads machined, not puffy.',
      'Make keys square-ish with a 2px darker underside, and compress them 2px on press.',
      'Print a legend on every key and label with tiny uppercase monospace, numbered callouts and thin leader lines; one label per control.',
      'Use accent for the single function key and the indicator LEDs only; primary marks what is active and sits as a flat plate behind one headline word.',
    ],
    dont: [
      'Add soft drop shadows, gradients on panels, glass or glow beyond an LED.',
      'Round things into pills or bubbles; the largest radius is 14.',
      'Use serif or rounded faces, or label in sentence case.',
      'Light more than one accent key per view or decorate with the dot grid beyond the speaker and vents.',
    ],
  },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    principles: [
      ['Machined, flat, numbered', 'A light top edge and a darker underside on every panel.'],
      ['Keys you can press', 'Square-ish keys that compress 2px on press.'],
      ['One label per control', 'Tiny uppercase mono, numbered callouts, leader lines.'],
    ],
    do: [
      'Build panels flat with machined edges.',
      'Compress keys 2px on press.',
      'Label with tiny uppercase mono.',
    ],
    dont: [
      'Add soft shadows or gradients.',
      'Round things into pills.',
      'Light more than one accent key.',
    ],
  },
});
