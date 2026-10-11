/* 32 Industrial Hazard — heavy, ranked, locked-out. References: ISA-101 high-performance
   HMI (the healthy process is grey; colour, motion and blinking are saved for abnormal
   states), the ANSI Z535 signal-word ladder (DANGER white on red, WARNING black on orange,
   CAUTION black on yellow, NOTICE white on blue), lockout/tagout tags and ISA-18.1
   annunciators. A dark concrete-grey machine: steel-framed modules with screws and
   nameplates, annunciator tiles, slab keys on a visible plinth, oversized lamps that glow
   only when lit. The client primary is the machine enamel (nameplate, main key, one big
   zone numeral); the ladder is fixed and carries its own rank; hazard stripes appear on
   at most two dangerous edges. No rust, no grunge, no neon. */
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
  highlight: 'ink',
  cardFill: '--ab-hz-panel',

  roles: {
    canvas: {
      use: 'The concrete-grey plant floor (the brand dark, desaturated to a mid-dark grey; light mode a pale grey) under every steel module',
      never: 'Text, a tinted brand wash, or a rusty or dirty texture',
      coverage: '55–65%',
    },
    ink: {
      use: 'Headlines, stamped legends, serial plates and 2px panel edges; completed progress cells are ink, not brand colour',
      never: 'Large background fields, or glow',
    },
    primary: {
      use: 'Machine enamel: the nameplate, the main key face and the one big zone numeral. It is the maker\'s paint, not a status',
      never: 'A hazard signal, a lamp, body text, a second key, stripes. If it falls in the yellow-orange-red band the ladder is reduced in chroma so the board never shows two competing danger oranges',
      coverage: '≈8–10%',
    },
    secondary: {
      use: 'The RUN / ARMED lamp, the lit tile of the selected segment and a running row\'s lamp; small and only when lit',
      never: 'The main key, body text, panel fills, or any signal-word band (those use the fixed ANSI ladder)',
      coverage: '≈3–6%',
    },
    accent: {
      use: 'One callout: the highlighted headline word (shaded to read as text)',
      never: 'Signal bands, stripes, lamps, buttons, borders, large fills',
      coverage: '≤2%',
    },
  },

  // Concrete: dark canvases become a mid-dark neutral grey (lightness 13-19%, almost no
  // saturation); light canvases a pale concrete grey (about 78%).
  canvas(b) {
    const h = b.hexToHsl(b.canvas);
    return b.isDark
      ? b.hslToHex(h.h, Math.min(h.s, 3), Math.min(19, Math.max(13, h.l)))
      : b.hslToHex(h.h, Math.min(h.s, 5), 78);
  },

  tokens(t) {
    const d = t.isDark;
    const W = '#ffffff';
    const B = '#000000';
    const hp = hexToHsl(t.primary);
    const warm = hp.s >= 40 && (hp.h <= 65 || hp.h >= 335);
    // ANSI Z535 signal colours. Fixed word-to-colour pairs; reduced in chroma only when
    // the brand enamel itself sits in the yellow-orange-red band.
    const sig = hex => (warm ? t.mix('#808080', hex, 0.26) : hex);
    return {
      '--ab-hz-panel': d ? t.mix(W, t.canvas, 0.06) : t.mix(W, t.canvas, 0.38),
      '--ab-hz-plate': d ? t.mix(W, t.canvas, 0.16) : t.mix(B, t.canvas, 0.11),
      '--ab-hz-well': d ? t.mix(B, t.canvas, 0.5) : t.mix(B, t.canvas, 0.2),
      '--ab-hz-edge': '#0d0e0f',
      '--ab-hz-hi': t.alpha(W, d ? 0.17 : 0.7),
      '--ab-hz-lo': t.alpha(B, d ? 0.5 : 0.28),
      '--ab-hz-off': d ? t.mix(W, t.canvas, 0.1) : t.mix(B, t.canvas, 0.2),
      '--ab-hz-yellow': sig('#F2C500'),
      '--ab-hz-orange': sig('#FF6A13'),
      '--ab-hz-red': sig('#D3202A'),
      '--ab-hz-blue': sig('#1E5FA8'),
      '--ab-hz-stripe': warm ? t.mix('#808080', '#F2C500', 0.45) : '#F2C500',
      '--ab-hz-tag': '#EFEDE6',
      '--ab-hz-lit': t.secondary,
      '--ab-hz-glow': t.alpha(t.secondary, 0.45),
      '--ab-hz-ring': t.alpha(t.primary, 0.5),
      '--ab-type-pick-w': '700',
    };
  },

  // The machine face: a steel plate with an enamel nameplate (model / serial / rating),
  // a giant zone numeral, a 2D mimic line (tank, pipe, valve, pump; one live segment),
  // a row of oversized lamps (only RUN and ALM lit), a hazard-stripe rail on the lower
  // edge and a lockout tag hanging from a hasp. Pure SVG; text is sized in plate units.
  art(ctx) {
    const e = escapeHtml;
    const ini = e(ctx.initial);
    const screw = (x, y) => `<g class="hz-screw"><circle cx="${x}" cy="${y}" r="1.7"/><path d="M${x - 1} ${y - 1} L${x + 1} ${y + 1}"/></g>`;
    const lamps = [['PWR', ''], ['RUN', 'run'], ['ALM', 'alm'], ['LCK', ''], ['TST', '']];
    const lampSvg = lamps.map(([lb, st], i) => {
      const x = 15 + i * 13.5;
      return `<g class="hz-lamp ${st}">`
        + (st ? `<circle class="hz-halo" cx="${x}" cy="69" r="5.6"/>` : '')
        + `<circle class="hz-lens" cx="${x}" cy="69" r="3.9"/><circle class="hz-spec" cx="${x - 1.1}" cy="67.7" r="1.1"/>`
        + `<text class="hz-lg" x="${x}" y="77.2" text-anchor="middle">${lb}</text></g>`;
    }).join('');
    // hazard stripe rail: 45 degree black bands on the stripe colour, equal widths
    const rx0 = 3.4, rx1 = 96.6, ry0 = 80.4, ry1 = 85, pitch = 4.6, slant = ry1 - ry0;
    const cl = x => Math.min(rx1, Math.max(rx0, x));
    let bands = '';
    for (let x = rx0 - slant; x < rx1; x += pitch) {
      bands += `M${cl(x + slant)} ${ry0} H${cl(x + slant + pitch / 2)} L${cl(x + pitch / 2)} ${ry1} H${cl(x)} Z `;
    }
    return `<svg class="hz-art" viewBox="0 0 100 90" xmlns="http://www.w3.org/2000/svg" role="presentation" preserveAspectRatio="xMidYMid meet">
      <rect class="hz-body" x="1" y="1" width="98" height="88"/>
      <rect class="hz-bevel" x="2.7" y="2.7" width="94.6" height="84.6"/>
      ${screw(6, 6)}${screw(94, 6)}${screw(6, 84)}${screw(94, 84)}
      <rect class="hz-name" x="11" y="7" width="78" height="8.4"/>
      <text class="hz-nt" x="13.4" y="12.5" textLength="73.2" lengthAdjust="spacingAndGlyphs">MODEL ${ini}R-7 / S/N 004-1187-B / 24 V DC / MFD 03-26</text>
      <text class="hz-num" x="9" y="49" textLength="37" lengthAdjust="spacingAndGlyphs">07</text>
      <text class="hz-zl" x="52" y="23">ZONE</text>
      <text class="hz-zn" x="52" y="33" textLength="19" lengthAdjust="spacingAndGlyphs">PRESS LINE</text>
      <path class="hz-hair" d="M52 36.2 H71"/>
      <text class="hz-zs" x="52" y="41">MAIN DRIVE</text>
      <text class="hz-zs" x="52" y="45.6">4.2 kW</text>
      <g class="hz-tag" transform="rotate(5 83 36)">
        <path class="hz-string" d="M79.4 15.4 C 74 22, 92 20, 83.5 27.2"/>
        <rect class="hz-tagbody" x="74" y="26" width="19" height="29"/>
        <rect class="hz-tagband" x="74" y="26" width="19" height="8.6"/>
        <path class="hz-warn" d="M75.8 33.4 L77.6 29.8 L79.4 33.4 Z"/>
        <text class="hz-tw" x="86.4" y="33.1" text-anchor="middle" textLength="10" lengthAdjust="spacingAndGlyphs">DANGER</text>
        <circle class="hz-hole" cx="83.5" cy="28.2" r="1.1"/>
        <text class="hz-tt" x="83.5" y="40.4" text-anchor="middle">DO NOT</text>
        <text class="hz-tt" x="83.5" y="44.2" text-anchor="middle">OPERATE</text>
        <path class="hz-hair" d="M76.5 46.2 H90.5"/>
        <text class="hz-ts" x="83.5" y="50.2" text-anchor="middle">TAG 0412</text>
        <text class="hz-ts" x="83.5" y="53.6" text-anchor="middle">J. KOWAL</text>
      </g>
      ${lampSvg}
      <g class="hz-mimic">
        <rect class="hz-tank" x="9" y="53" width="9.5" height="10"/><path class="hz-fill" d="M9.8 58 H17.7 V62.2 H9.8 Z"/>
        <path class="hz-pipe" d="M18.5 58 H29"/>
        <path class="hz-pipe live" d="M44 58 H56 V63.5 H60.9"/>
        <path class="hz-valve" d="M29 54.6 L36.5 58 L29 61.4 Z M44 54.6 L36.5 58 L44 61.4 Z"/><path class="hz-pipe" d="M36.5 58 V53.4"/>
        <circle class="hz-pump" cx="64.5" cy="63.5" r="3.6"/><path class="hz-pipe" d="M64.5 59.9 V55"/>
      </g>
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
    { name: 'Lamp cabochon', css: 'width: 24px; height: 24px; border-radius: 50%; background: {hzOff}; box-shadow: 0 0 0 3px {hzEdge}, inset 0 1px 0 {hzHi}; /* lit: background {hzLit} and a 10px glow of the same colour at 45%; a lamp glows only when lit */' },
    { name: 'Hazard stripe rail', css: 'height: 6px; background: repeating-linear-gradient(-45deg, #111111 0 6px, {hzStripe} 6px 12px); /* 45 degrees, equal bands; at most two stripe edges per board, only on dangerous controls */' },
    { name: 'Lockout tag', css: 'background: {hzTag}; color: #111111; border: 1.5px solid {hzEdge}; /* DANGER band on top, "DO NOT OPERATE", TAG 0412, a punched hole and a string */' },
  ],

  rules: {
    do: [
      'Paint every healthy state grey; only a state that is abnormal earns a signal colour from the fixed ANSI Z535 ladder.',
      'Pair every signal word with its fixed colour: DANGER white on red, WARNING black on orange, CAUTION black on yellow, NOTICE white on blue.',
      'Put the client primary on the machine enamel only: the nameplate, the main key and one big zone numeral.',
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
      ['The brand is the enamel', 'The client primary paints the machine housing.'],
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
