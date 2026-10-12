/* 32 Industrial Hazard — heavy, ranked, locked-out. References: ISA-101 high-performance
   HMI (the healthy process is grey; colour, motion and blinking are saved for abnormal
   states), the ANSI Z535 signal-word ladder (DANGER white on red, WARNING black on orange,
   CAUTION black on yellow, NOTICE white on blue), lockout/tagout tags and ISA-18.1
   annunciators, The Designers Republic's safety-yellow fields. Physical and printed, never a
   screen: the hero is a full-bleed #F2C500 field framed by 45 degree tape, the headline is
   black signage at 9cqw, the zone numeral is stencil-cut. Steel modules with screws and
   nameplates, an ISO 7010 warning triangle, slab keys on a plinth, lamps in the ladder's own
   colours (no glow). The ANSI ladder is FIXED: the client colour yields (it paints only the
   nameplate and the slab key, never a lamp or a signal). Light mode is a yellow board with
   #111 modules. No rust, no grunge, no neon, no glow. */
registerAesthetic({
  key: 'industrial-hazard', order: 32,
  name: 'Industrial Hazard',
  descriptor: 'Heavy · Ranked · Locked-out',
  influences: 'ISA-101 control rooms / ANSI Z535 signage / Lockout tags',
  summary: 'A heavy grey machine where colour is rationed: healthy is grey, and only abnormal states earn a signal colour.',
  motto: 'Lock it out. Tag it.',
  kicker: 'Authorised personnel',
  mode: 'dark',
  slideShape: 'minimal',
  labels: { material: 'Interlocks', states: ['Normal', 'Caution', 'Danger'], statesKind: 'button' },
  layout: { hero: 'split', palette: 'swatches', sections: 'two-col' },
  type: { ui: 'sans', label: 'mono' },
  highlight: 'custom',
  highlightNote: 'One red word: the last word of the black headline is set in ANSI DANGER red #D3202A on the safety-yellow field (large text, at least 3:1); no band, no glow.',
  cardFill: '--ab-hz-panel',

  roles: {
    canvas: {
      use: 'The concrete-grey plant floor in dark mode (the brand dark desaturated); light mode is safety yellow #F2C500 at 100% with #111 modules. The hero is always a full-bleed #F2C500 field',
      never: 'Text, a tinted brand wash, or a rusty or dirty texture',
      coverage: '55–65%',
    },
    ink: {
      use: 'Headlines, stamped legends, serial plates and 2px panel edges; completed progress cells are ink, not brand colour',
      never: 'Large background fields, or glow',
    },
    primary: {
      use: 'Machine enamel only: the nameplate and the main slab key. It is the maker\'s paint, not a status',
      never: 'A hazard signal, a lamp, the zone numeral, body text, a second key, stripes. The ANSI ladder never bends to it: when it is orange or red it simply stays on the enamel',
      coverage: '≈4–6%',
    },
    secondary: {
      use: 'A paint-code chip in the palette only',
      never: 'Lamps (RUN is ladder green #00A651), the main key, body text, panel fills, any signal band',
      coverage: '≤2%',
    },
    accent: {
      use: 'A paint-code chip in the palette only; the highlighted word is fixed DANGER red',
      never: 'Signal bands, stripes, lamps, buttons, borders, the headline',
      coverage: '≤2%',
    },
  },

  // Concrete: dark canvases become a mid-dark neutral grey (lightness 13-19%, almost no
  // saturation); light canvases a pale concrete grey (about 78%).
  canvas(b) {
    const h = b.hexToHsl(b.canvas);
    return b.isDark ? b.hslToHex(h.h, Math.min(h.s, 3), Math.min(19, Math.max(13, h.l))) : '#F2C500';
  },

  tokens(t, st) {
    const S = st || (typeof state !== 'undefined' ? state : {}) || {};
    const d = t.isDark;
    const W = '#ffffff';
    const B = '#000000';
    // ANSI Z535 signal colours: fixed word-to-colour pairs, never bent toward the client.
    const sig = hex => hex;
    // light mode: the board is safety yellow and every module is #111 steel with white legends
    const steel = '#161616';
    const plate = d ? t.mix(W, t.canvas, 0.16) : '#262626';
    // muted legends sit on the plate (header tag, idle annunciator keys): lift them toward the ink
    // until they hold 4.5:1 there (the plain muted is about 3.4:1 on the dark plate)
    let modMuted = d ? t.muted : '#BDBBB3';
    for (let k = 0.1; d && k <= 1 && t.contrast(modMuted, plate) < 4.6; k += 0.1) modMuted = t.mix(t.ink, t.muted, k);
    return {
      '--ab-hz-hw': abWeight(S.headingFont, 800),
      '--ab-hz-bw': abWeight(S.bodyFont, 700),
      '--ab-hz-panel': d ? t.mix(W, t.canvas, 0.06) : steel,
      '--ab-hz-plate': plate,
      '--ab-hz-well': d ? t.mix(B, t.canvas, 0.5) : '#0A0A0A',
      '--ab-hz-edge': '#0d0e0f',
      '--ab-hz-hi': t.alpha(W, d ? 0.17 : 0.14),
      '--ab-hz-lo': t.alpha(B, 0.5),
      '--ab-hz-off': d ? t.mix(W, t.canvas, 0.1) : '#333333',
      '--ab-hz-mod-ink': d ? t.ink : '#F2F0E8',
      '--ab-hz-mod-muted': modMuted,
      '--ab-hz-yellow': sig('#F2C500'),
      '--ab-hz-orange': sig('#FF6A13'),
      '--ab-hz-red': sig('#D3202A'),
      '--ab-hz-blue': sig('#1E5FA8'),
      '--ab-hz-green': '#00A651',
      '--ab-hz-stripe': '#F2C500',
      '--ab-hz-tag': '#EFEDE6',
      '--ab-hz-lit': '#00A651',
      '--ab-type-pick-w': '700',
    };
  },

  // The machine face: a steel plate with an enamel nameplate (model / serial / rating) riveted over a
  // stencil-cut zone numeral at double size (the plate sits on top, so its legend is never crossed), the zone
  // legend, a lockout tag on a hasp hanging clear of the mimic line (tank, valve, pump; one live segment), five lamps in the ladder's own colours (PWR white, RUN green,
  // ALM yellow lit; LCK red and TST dark) and a 45 degree stripe rail on the lower edge. Pure SVG.
  art(ctx) {
    const ini = escapeHtml(ctx.initial);
    const screw = (x, y) => `<g class="hz-screw"><circle cx="${x}" cy="${y}" r="1.7"/><path d="M${x - 1} ${y - 1} L${x + 1} ${y + 1}"/></g>`;
    const lamps = [['PWR', 'pwr'], ['RUN', 'run'], ['ALM', 'alm'], ['LCK', 'lck'], ['TST', '']];
    const lampSvg = lamps.map(([lb, st], i) => {
      const x = 14 + i * 18;
      return `<g class="hz-lamp ${st}"><circle class="hz-bezel" cx="${x}" cy="72" r="4.9"/><circle class="hz-lens" cx="${x}" cy="72" r="3.6"/><circle class="hz-spec" cx="${x - 1.1}" cy="70.8" r="1"/>`
        + `<text class="hz-lg" x="${x + 6.4}" y="72.9">${lb}</text></g>`;
    }).join('');
    const rx0 = 3.4, rx1 = 96.6, ry0 = 80.4, ry1 = 85, pitch = 4.6, slant = ry1 - ry0;
    const cl = x => Math.min(rx1, Math.max(rx0, x));
    let bands = '';
    for (let x = rx0 - slant; x < rx1; x += pitch) {
      bands += `M${cl(x + slant)} ${ry0} H${cl(x + slant + pitch / 2)} L${cl(x + pitch / 2)} ${ry1} H${cl(x)} Z `;
    }
    // the stencil bridges: plate-coloured cuts through the numeral (two in the 0, one in the 7)
    const bridges = '<path class="hz-bridge" d="M16.3 14.6 h2.4 v14.9 h-2.4z M16.3 51.6 h2.4 v14.2 h-2.4z M33 25.1 h19 v2.1 h-19z"/>';
    return `<svg class="hz-art" viewBox="0 0 100 90" xmlns="http://www.w3.org/2000/svg" role="presentation" preserveAspectRatio="xMidYMid meet">
      <rect class="hz-body" x="1" y="1" width="98" height="88"/>
      <rect class="hz-bevel" x="2.7" y="2.7" width="94.6" height="84.6"/>
      ${screw(6, 6)}${screw(94, 6)}${screw(6, 84)}${screw(94, 84)}
      <text class="hz-num" x="5.5" y="64.5" textLength="48" lengthAdjust="spacingAndGlyphs">07</text>${bridges}
      <rect class="hz-name" x="11" y="6.4" width="78" height="8.4"/>
      <text class="hz-nt" x="13.4" y="11.9" textLength="73.2" lengthAdjust="spacingAndGlyphs">MODEL ${ini}R-7 / S/N 004-1187-B / 24 V DC / MFD 03-26</text>
      <text class="hz-zl" x="57" y="22">ZONE</text>
      <text class="hz-zn" x="57" y="30.5" textLength="15.5" lengthAdjust="spacingAndGlyphs">PRESS</text>
      <path class="hz-hair" d="M57 33 H72.5"/>
      <text class="hz-zs" x="57" y="37.4">MAIN DRIVE</text>
      <text class="hz-zs" x="57" y="41.4">4.2 kW</text>
      <g class="hz-tag" transform="translate(0 -5) rotate(5 84 36)">
        <path class="hz-string" d="M80.1 19.9 C 77 23.6, 89.5 23.2, 84.5 27.2"/>
        <rect class="hz-tagbody" x="75" y="26" width="19" height="29"/>
        <rect class="hz-tagband" x="75" y="26" width="19" height="8.6"/>
        <path class="hz-warn" d="M76.8 33.4 L78.6 29.8 L80.4 33.4 Z"/>
        <text class="hz-tw" x="87.4" y="33.1" text-anchor="middle" textLength="10" lengthAdjust="spacingAndGlyphs">DANGER</text>
        <circle class="hz-hole" cx="84.5" cy="28.2" r="1.1"/>
        <text class="hz-tt" x="84.5" y="40.4" text-anchor="middle">DO NOT</text>
        <text class="hz-tt" x="84.5" y="44.2" text-anchor="middle">OPERATE</text>
        <path class="hz-hair" d="M77.5 46.2 H91.5"/>
        <text class="hz-ts" x="84.5" y="50.2" text-anchor="middle">TAG 0412</text>
        <text class="hz-ts" x="84.5" y="53.6" text-anchor="middle">J. KOWAL</text>
      </g>
      <g class="hz-mimic">
        <rect class="hz-tank" x="57" y="49" width="6.5" height="9"/><path class="hz-fill" d="M57.7 54 H62.8 V57.3 H57.7 Z"/>
        <path class="hz-pipe" d="M63.5 54 H66.5"/>
        <path class="hz-valve" d="M66.5 51.4 L71 54 L66.5 56.6 Z M75.5 51.4 L71 54 L75.5 56.6 Z"/>
        <path class="hz-pipe live" d="M75.5 54 H82 V60 H86.6"/>
        <circle class="hz-pump" cx="89.6" cy="60" r="3"/>
      </g>
      ${lampSvg}
      <rect class="hz-rail" x="3.4" y="80.4" width="93.2" height="4.6"/><path class="hz-rail-b" d="${bands}"/><rect class="hz-rail-o" x="3.4" y="80.4" width="93.2" height="4.6"/>
    </svg>`;
  },

  materials: [
    { name: 'Steel module', css: 'background: {hzPanel}; border: 2px solid {hzEdge}; box-shadow: inset 0 0 0 1px {hzHi}; border-radius: 0; /* four 6px corner screws as radial dots; a nameplate strip on {hzPlate} with the module code in mono 9.5px caps; no soft shadows, no gradients, no rounding */' },
    { name: 'Enamel nameplate', css: 'background: {primary}; color: {onPrimary}; border: 2px solid {hzEdge}; font: 700 10px ui-monospace, Menlo, monospace; letter-spacing: .1em; text-transform: uppercase; /* MODEL XR-7 / S/N 004-1187-B / 24 V DC / MFD 03-26 */' },
    { name: 'Slab key (main action)', css: 'background: {primary}; color: {onPrimary}; border: 2px solid {hzEdge}; border-radius: 0; box-shadow: 0 3px 0 {hzEdge}; /* active: translateY(2px) and a 1px edge; the plinth is visible */' },
    { name: 'Annunciator tile', css: 'background: {hzPlate}; border: 2px solid {hzEdge}; color: {ink}; text-transform: uppercase; /* 2px gaps like tile seams; the selected tile lights a {hzLit} lamp bar and brightens its legend; unselected tiles are plain grey */' },
    { name: 'Signal word: DANGER', css: 'background: {hzRed}; color: #ffffff; font-weight: 800; text-transform: uppercase; /* ANSI Z535, one per board; white on red, triangle glyph left of the word at word height */' },
    { name: 'Signal word: WARNING', css: 'background: {hzOrange}; color: #111111; font-weight: 800; text-transform: uppercase; /* black on orange */' },
    { name: 'Signal word: CAUTION', css: 'background: {hzYellow}; color: #111111; font-weight: 800; text-transform: uppercase; /* black on yellow; also the ISA-101 abnormal-row lamp */' },
    { name: 'Signal word: NOTICE', css: 'background: {hzBlue}; color: #ffffff; font-weight: 800; text-transform: uppercase; /* white on blue */' },
    { name: 'Lamp cabochon', css: 'width: 24px; height: 24px; border-radius: 50%; background: {hzOff}; box-shadow: 0 0 0 3px {hzEdge}, inset 0 1px 0 {hzHi}; /* lit in the ladder\'s own colour: PWR white, RUN #00A651, ALM #F2C500, LCK #D3202A; no glow, a specular dot only */' },
    { name: 'Safety-yellow field', css: 'background: #F2C500; color: #111111; border-top: 14px solid; border-image: repeating-linear-gradient(-45deg, #111 0 14px, #F2C500 14px 28px) 14; /* the hero, full bleed, framed top and bottom by 45 degree tape at a 14px pitch; headline black at clamp(64px, 9cqw, 132px) */' },
    { name: 'ISO 7010 warning triangle', css: 'width: 64px; height: 56px; /* black border, yellow fill, black exclamation; a 64-96px sign on the interlock module, not a 10px glyph */' },
    { name: 'Hazard stripe rail', css: 'height: 6px; background: repeating-linear-gradient(-45deg, #111111 0 6px, {hzStripe} 6px 12px); /* 45 degrees, equal bands; at most two stripe edges per board, only on dangerous controls */' },
    { name: 'Lockout tag', css: 'background: {hzTag}; color: #111111; border: 1.5px solid {hzEdge}; /* DANGER band on top, "DO NOT OPERATE", TAG 0412, a punched hole and a string */' },
  ],

  rules: {
    do: [
      'Paint every healthy state grey; only a state that is abnormal earns a signal colour from the fixed ANSI Z535 ladder.',
      'Pair every signal word with its fixed colour: DANGER white on red, WARNING black on orange, CAUTION black on yellow, NOTICE white on blue.',
      'Put the client primary on the machine enamel only: the nameplate and the main slab key; the ladder never bends to it.',
      'Make the safety colour a field: a full-bleed #F2C500 hero framed by 45 degree tape, with black signage-size type.',
      'Show every state as a word or glyph as well as a colour, and give each module a serial, a nameplate and four screws.',
    ],
    dont: [
      'Use hazard stripes as wallpaper or on a card: two stripe edges per board, both on dangerous controls.',
      'Glow or tint anything that is not lit, or let more than one element be DANGER at a time.',
      'Use soft shadows, gradients, rounded glass or rust and grunge textures; the menace comes from rank, not dirt.',
      'Set orange text on yellow or red text on orange; text on a signal band is black or white only.',
    ],
  },

  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    principles: [
      ['Healthy is grey', 'Colour is reserved for abnormal states.'],
      ['Rank the signals', 'DANGER, WARNING, CAUTION, NOTICE follow one fixed ladder.'],
      ['Yellow is the ground', 'A full-bleed safety field with black signage.'],
    ],
    do: [
      'Reserve hazard stripes for dangerous controls.',
      'Stamp serial numbers and lockout tags.',
      'Use oversized status lights and steel bezels.',
    ],
    dont: [
      'Colour healthy states.',
      'Use soft shadows, gradients or rounded corners.',
      'Stripe decoratively or at odd angles.',
    ],
  },
});
