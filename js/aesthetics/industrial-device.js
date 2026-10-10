/* 17 Industrial Device — precise, physical, calm. Reference: teenage.engineering
   product pages (OP-1, TP-7), Braun ET66 and Nothing's phone UI. Light warm-grey
   "aluminium" canvas; machined flat panels (radius 14, 1px light edge on top, darker
   edge below); square physical keys with a 2px darker underside that compresses on
   press; tiny mono labels with numbered callouts and leader lines; dot-grid speaker
   texture. The hero art is a device face: knurled knob, 4x4 key grid with one
   accent function key, an OLED strip with the brand name, a speaker grille. */
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
  type: { ui: 'sans', label: 'mono', display: 0.9 },
  highlight: 'ink',
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
      use: 'The single function key in the key grid, the indicator LEDs and the highlighted headline word',
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
    const lift = (hex, bg, min) => { let c = hex; for (let k = 1; k <= 20 && t.contrast(c, bg) < min; k++) c = t.mix('#ffffff', c, k * 0.05); return c; };
    const oled = '#07080a';
    return {
      '--ab-tr': (typeof state !== 'undefined' && state.headingFont && { condensed: 0, heavy: 0, wide: 0.4, techno: 0.4 }[state.headingFont.cls]) ?? 1,
      '--ab-face': face,
      '--ab-key': key,
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
    // 4x4 keys: one accent function key (row 0, col 3) and one active key (row 2, col 1)
    let keys = '';
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
      const cls = r === 0 && c === 3 ? ' acc' : (r === 2 && c === 1 ? ' on' : '');
      keys += `<i class="idv-key${cls}"></i>`;
    }
    // the speaker grille: 18 x 4 dots
    const dots = Array.from({ length: 72 }, () => '<i></i>').join('');
    const bars = [40, 70, 55, 90, 35, 75, 60].map(h => `<i style="height:${h}%"></i>`).join('');
    const marker = (n, x, y, x2) => `<g><line x1="${Math.min(x + 2.4, x2)}" y1="${y}" x2="${Math.max(x + 2.4, x2)}" y2="${y}"/><circle class="m" cx="${x}" cy="${y}" r="2.4"/><circle class="d" cx="${x2}" cy="${y}" r="0.7"/><text x="${x}" y="${y + 0.95}" text-anchor="middle">${n}</text></g>`;
    return `<div class="idv">
      <div class="idv-body" style="${at(0, 0, 100, 72)}"></div>
      <div class="idv-oled" style="${at(12, 7.5, 77, 11)}"><b>${name}</b><span class="idv-bars">${bars}</span><em>A.01</em></div>
      <div class="idv-ticks" style="${at(10, 29.5, 38, 38)}"></div>
      <div class="idv-arc" style="${at(10, 29.5, 38, 38)}"></div>
      <div class="idv-knob" style="${at(14.5, 34, 29, 29)}"><span></span></div>
      <div class="idv-keys" style="${at(54, 26, 35, 35)}">${keys}</div>
      <div class="idv-grille" style="${at(12, 65, 36, 4.6)}">${dots}</div>
      <div class="idv-leds" style="${at(60, 65, 29, 4.6)}"><i class="on"></i><i></i><i class="p"></i><code>TP-01</code></div>
      <svg class="idv-marks" viewBox="0 0 100 ${Y}" focusable="false">${marker(1, 5.5, 13, 11.4)}${marker(2, 5.5, 48.5, 14.2)}${marker(3, 94.5, 43.5, 89.6)}</svg>
      <div class="idv-legend"><span><b>1</b>Display</span><span><b>2</b>Encoder</span><span><b>3</b>Keys &middot; 16</span></div>
    </div>`;
  },

  materials: [
    { name: 'Machined panel', css: 'background: {face}; border: 1px solid {hair}; border-radius: 14px; box-shadow: inset 0 1px 0 {edgeHi}, inset 0 -1px 0 {edgeLo}; /* flat fill: a 1px light edge on top, a darker edge below; no soft shadow, no gradient puffiness */' },
    { name: 'Key (up)', css: 'background: {key}; border: 1px solid {hair}; border-radius: 6px; box-shadow: inset 0 1px 0 {keyHi}, 0 2px 0 {keyEdge}; /* square physical button with a 2px darker underside */' },
    { name: 'Key (down)', css: 'transform: translateY(2px); box-shadow: inset 0 1px 2px {edgeLo}, 0 0 0 {keyEdge}; /* the 2px underside compresses */' },
    { name: 'Main action key', css: 'background: {primary}; color: {onPrimary}; border-radius: 6px; box-shadow: inset 0 1px 0 rgba(255,255,255,.3), 0 2px 0 {keyEdge}; font: 600 12px ui-monospace, "SF Mono", Menlo, monospace; text-transform: uppercase;' },
    { name: 'Function key (accent)', css: 'background: {accent}; border-radius: 4px; box-shadow: inset 0 1px 0 rgba(255,255,255,.35), 0 2px 0 {keyEdge}; /* the one accent key in the grid; indicator LEDs use {led} with a glow */' },
    { name: 'Recessed slot', css: 'background: {slot}; border-radius: 8px; box-shadow: {slotSh}; /* fields and switch tracks */' },
    { name: 'OLED strip', css: 'background: {oled}; color: {oledInk}; border-radius: 5px; font: 700 11px ui-monospace, "SF Mono", Menlo, monospace; letter-spacing: .08em; /* brand name in primary pixels; black stays black in both modes */' },
    { name: 'Speaker grille', css: 'background-image: radial-gradient({dot} 38%, transparent 42%); background-size: 6px 6px; /* a dot grid, decoration only */' },
  ],

  rules: {
    do: [
      'Build every panel flat: radius 14, a 1px light edge on top and a darker edge below, so it reads machined, not puffy.',
      'Make keys square-ish with a 2px darker underside, and compress them 2px on press.',
      'Label with tiny uppercase monospace, numbered callouts and thin leader lines; one label per control.',
      'Use accent for the single function key and the indicator LEDs only; primary marks what is active.',
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
