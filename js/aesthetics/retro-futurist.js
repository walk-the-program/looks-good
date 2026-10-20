/* 04 Retro-Futurist — space-age graphic systems (NASA standards manual, 2001,
   Syd Mead, Space: 1999): a lit white field, bold extended type, one signal
   colour and an orbital horizon plate. The hero art is a full-bleed planet limb
   with orbits and one tiny craft (a lit planet, an accent orbit, a stripe band along the
   foot); the mission console (dial, LCD, LED ladder) is shown on the deck's Material
   slide and its gauge language (stat dials, LED-ladder bars, lamp chips, a T+ readout)
   runs through the product UI. Display type follows the brand heading face (the recommended
   pairing is Michroma). Look lives in css/aesthetics/retro-futurist.css. */
(function () {
  let seq = 0;
  const RF_KEY = 'retro-futurist';   // abCopy key for the plain functions below (js/aesthetics/registry.js)
  const rfCp = k => abCopy(RF_KEY, k);

  // Mono face for SVG lettering (self-contained: the art never relies on board css).
  const MONO = 'font-family="ui-monospace,SF Mono,Menlo,monospace"';

  // The one chromatic colour: the brand primary, nudged until it reads as a mark on
  // the canvas (3:1). Everything else on the page is ink.
  function signalOf(t) {
    if (t.contrast(t.primary, t.canvas) >= 3) return t.primary;
    for (let a = 0.9; a >= 0; a -= 0.1) {
      const c = t.mix(t.primary, t.ink, a);
      if (t.contrast(c, t.canvas) >= 3) return c;
    }
    return t.ink;
  }

  // Orbital horizon plate: black sky into the canvas haze, a planet limb with an
  // atmosphere rim in the signal colour, three orbits, one craft, a 12-col grid.
  function horizon(t, id) {
    const acc = t.accent;
    // The plate is deep space in both modes: the one dark image on a lit page.
    const sig = t.primary;
    const haze = t.mix(sig, '#000000', 0.22);
    const ground0 = '#050608';
    const ground1 = t.mix(sig, '#000000', 0.26);
    const R = 262, CX = 120, CY = 75 + R;   // limb top at y = 75
    let grid = '';
    for (let i = 1; i < 12; i++) grid += `<line x1="${i * 20}" y1="0" x2="${i * 20}" y2="100" stroke="#ffffff" stroke-opacity=".05" stroke-width="1" vector-effect="non-scaling-stroke"/>`;
    // three orbits: white, the accent (a lit ring), white dashed
    const orbits = [[105, 13, '', '#ffffff', 0.38, 0.9], [142, 19, '', acc, 0.95, 1.4], [180, 25, '0.9 2.1', '#ffffff', 0.38, 0.9]].map(o =>
      `<ellipse cx="${CX}" cy="66" rx="${o[0]}" ry="${o[1]}" fill="none" stroke="${o[3]}" stroke-opacity="${o[4]}" stroke-width="${o[5]}" vector-effect="non-scaling-stroke"${o[2] ? ` stroke-dasharray="${o[2]}"` : ''}/>`).join('');
    const pale = t.mix(sig, '#ffffff', 0.78), lit = t.mix(sig, '#ffffff', 0.3), deep = t.mix(sig, '#000000', 0.62);
    // the craft rides the middle orbit, upper left (258deg on the unrotated ellipse)
    const at = deg => [CX + 142 * Math.cos(deg * Math.PI / 180), 66 + 19 * Math.sin(deg * Math.PI / 180)];
    const [px, py] = at(258);
    // the signal arc: the stretch of the middle orbit the craft has just flown
    let arcPts = '';
    for (let g = 203; g <= 258; g += 5) arcPts += at(g).map(v => v.toFixed(2)).join(',') + ' ';
    return `<svg class="rfa-plate" viewBox="0 0 240 100" preserveAspectRatio="xMidYMax slice" focusable="false" style="position:absolute;inset:0;width:100%;height:100%;display:block">
      <defs>
        <linearGradient id="${id}k" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#000000"/><stop offset=".42" stop-color="#030406"/>
          <stop offset=".64" stop-color="${t.mix(haze, '#000000', 0.25)}"/><stop offset=".75" stop-color="${haze}"/>
        </linearGradient>
        <linearGradient id="${id}p" x1="0" y1="${CY - R}" x2="0" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="${pale}"/><stop offset=".035" stop-color="${lit}"/><stop offset=".2" stop-color="${sig}"/><stop offset="1" stop-color="${deep}"/>
        </linearGradient>
        <filter id="${id}b" x="-10%" y="-40%" width="120%" height="180%"><feGaussianBlur stdDeviation="2.2"/></filter>
      </defs>
      <rect width="240" height="100" fill="url(#${id}k)"/>
      <circle cx="31" cy="14" r=".45" fill="#ffffff" opacity=".8"/><circle cx="188" cy="9" r=".35" fill="#ffffff" opacity=".6"/><circle cx="214" cy="31" r=".4" fill="#ffffff" opacity=".7"/>
      <g transform="rotate(-8 ${CX} 66)">${orbits}</g>
      <circle cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="${lit}" stroke-width="7" opacity=".55" filter="url(#${id}b)"/>
      <circle cx="${CX}" cy="${CY}" r="${R}" fill="url(#${id}p)"/>
      <circle cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="${pale}" stroke-width=".9" opacity=".95"/>
      <g transform="rotate(-8 ${CX} 66)">
        <polyline points="${arcPts}" fill="none" stroke="${sig}" stroke-width="1.4" vector-effect="non-scaling-stroke" stroke-linecap="round"/>
        <g transform="translate(${px.toFixed(2)} ${py.toFixed(2)}) rotate(6)">
          <polygon points="-1.8,-.8 1.8,-.25 1.8,.25 -1.8,.8" fill="#ffffff"/>
          <circle cx="-1.9" cy="0" r=".5" fill="${acc}"/>
          <line x1="-1.5" y1="0" x2="-4" y2="0" stroke="#ffffff" stroke-width=".2" stroke-opacity=".7"/>
          <text x="3" y="-2.2" ${MONO} font-size="2.1" fill="#ffffff" letter-spacing=".25">${rfCp('craftTag')}</text>
        </g>
      </g>
      ${grid}
    </svg>
    <span class="rfa-cap" style="position:absolute;right:clamp(10px,2.2cqw,28px);top:50%;transform:translateY(-50%);writing-mode:vertical-rl;font:500 9px/1 ui-monospace,'SF Mono',Menlo,monospace;letter-spacing:.42em;text-transform:uppercase;color:#ffffff;opacity:.85;white-space:nowrap">${rfCp('plateCap')}</span>`;
  }

  // Mission console (secondary material, deck 06 only): bezel plate, LCD, analog
  // dial (31 ticks, value arc, needle with a soft echo), LED ladder. One hue.
  function consoleArt(t, id) {
    const screen = '#0b0c0e';
    const screenInk = '#f2f2ee';
    const lift = (hex, min) => {
      for (let a = 1; a >= 0; a -= 0.1) {
        const c = t.mix(hex, screenInk, a);
        if (t.contrast(c, screen) >= min) return c;
      }
      return screenInk;
    };
    const sig = lift(t.primary, 4.5);
    const metalHi = '#d9dad6', metalLo = '#7c7e80';
    const cx = 36, cy = 59;
    const pt = (deg, r) => {
      const a = (deg - 90) * Math.PI / 180;
      return [(cx + r * Math.cos(a)).toFixed(2), (cy + r * Math.sin(a)).toFixed(2)];
    };
    let ticks = '';
    for (let i = 0; i <= 30; i++) {
      const deg = -135 + i * 9;
      const major = i % 5 === 0;
      const p1 = pt(deg, major ? 15.6 : 17.2), p2 = pt(deg, 19.4);
      ticks += `<line x1="${p1[0]}" y1="${p1[1]}" x2="${p2[0]}" y2="${p2[1]}" stroke="${screenInk}" stroke-opacity="${major ? 0.95 : 0.55}" stroke-width="${major ? 0.9 : 0.5}" stroke-linecap="round"/>`;
    }
    const needleDeg = 38;
    const s0 = pt(-135, 13.8), s1 = pt(needleDeg, 13.8);
    const arc = `M${s0[0]} ${s0[1]} A13.8 13.8 0 1 1 ${s1[0]} ${s1[1]}`;
    const tip = pt(needleDeg, 15.4), tail = pt(needleDeg + 180, 4.2);
    let bars = '';
    for (let i = 0; i < 5; i++) {
      const y = 38 + i * 9;
      bars += `<rect x="68" y="${y}" width="20" height="6.4" fill="${i === 0 ? t.alpha(screenInk, 0.14) : sig}"/>`;
    }
    const initial = 'M';
    return `<svg viewBox="0 0 100 100" width="100%" height="100%" focusable="false" style="display:block">
      <defs>
        <linearGradient id="${id}m" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${metalHi}"/><stop offset="1" stop-color="${metalLo}"/></linearGradient>
        <filter id="${id}g" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="1.1"/></filter>
      </defs>
      <rect width="100" height="100" fill="#d4d5d1"/>
      <rect x=".5" y=".5" width="99" height="99" fill="none" stroke="#000" stroke-opacity=".18"/>
      ${[[6, 6], [94, 6], [6, 94], [94, 94]].map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="1.8" fill="url(#${id}m)"/><line x1="${p[0] - 1.1}" y1="${p[1]}" x2="${p[0] + 1.1}" y2="${p[1]}" stroke="${metalLo}" stroke-width=".45"/>`).join('')}
      <rect x="9" y="9.5" width="82" height="18" fill="${screen}"/>
      <text x="14" y="22.6" ${MONO} font-size="10.6" font-weight="700" fill="${sig}" opacity=".14" letter-spacing=".4">8 88.8</text>
      <text x="14" y="22.6" ${MONO} font-size="10.6" font-weight="700" fill="${sig}" letter-spacing=".4">${initial}  9.5</text>
      <text x="86" y="15.6" ${MONO} font-size="2.8" fill="${screenInk}" opacity=".7" text-anchor="end" letter-spacing=".5">${rfCp('lcdTop')}</text>
      <text x="86" y="24.2" ${MONO} font-size="2.8" fill="${screenInk}" opacity=".7" text-anchor="end" letter-spacing=".5">${rfCp('lcdBottom')}</text>
      <circle cx="${cx}" cy="${cy}" r="25.2" fill="#c3c4c0" stroke="#000" stroke-opacity=".25" stroke-width=".5"/>
      <circle cx="${cx}" cy="${cy}" r="22" fill="${screen}"/>
      ${ticks}
      <path d="${arc}" fill="none" stroke="${sig}" stroke-width="1.3" stroke-linecap="round" opacity=".9"/>
      <line x1="${tail[0]}" y1="${tail[1]}" x2="${tip[0]}" y2="${tip[1]}" stroke="${sig}" stroke-width="3" stroke-linecap="round" opacity=".35" filter="url(#${id}g)"/>
      <line x1="${tail[0]}" y1="${tail[1]}" x2="${tip[0]}" y2="${tip[1]}" stroke="${sig}" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="${cx}" cy="${cy}" r="3.6" fill="url(#${id}m)"/>
      <circle cx="${cx}" cy="${cy}" r="1.1" fill="${screen}"/>
      <rect x="64.5" y="33.5" width="27" height="51" fill="${screen}"/>
      ${bars}
      <text x="${cx}" y="91.4" ${MONO} font-size="3" fill="#1a1b1d" text-anchor="middle" letter-spacing=".9">${rfCp('dialGain')}</text>
      <text x="78" y="91.4" ${MONO} font-size="3" fill="#1a1b1d" text-anchor="middle" letter-spacing=".9">${rfCp('ladderLevel')}</text>
    </svg>`;
  }

  // Deck do / don't visuals: a quiet horizon with one signal mark vs. everything glowing.
  function pairSvg(t, kind) {
    const sig = t.primary;
    const svg = kind === 'do'
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="80" viewBox="0 0 240 80"><rect width="240" height="80" fill="#000"/><circle cx="120" cy="322" r="262" fill="#0b0c0e" stroke="${sig}" stroke-width="1.2"/><ellipse cx="120" cy="52" rx="96" ry="12" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width=".6" transform="rotate(-8 120 52)"/><rect x="56" y="38" width="3.2" height="1.2" fill="#fff"/></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="80" viewBox="0 0 240 80"><defs><filter id="g"><feGaussianBlur stdDeviation="4"/></filter></defs><rect width="240" height="80" fill="#000"/><g filter="url(#g)"><circle cx="40" cy="40" r="16" fill="${sig}"/><circle cx="100" cy="40" r="16" fill="${t.secondary}"/><circle cx="160" cy="40" r="16" fill="${t.accent}"/><circle cx="210" cy="40" r="12" fill="#fff"/></g><circle cx="40" cy="40" r="9" fill="${sig}"/><circle cx="100" cy="40" r="9" fill="${t.secondary}"/><circle cx="160" cy="40" r="9" fill="${t.accent}"/><circle cx="210" cy="40" r="7" fill="#fff"/></svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  }

  registerAesthetic({
    key: 'retro-futurist', order: 4,
    name: 'Retro-Futurist',
    descriptor: 'Analog · Orbital · Glowing',
    influences: 'NASA standards / 2001 / Syd Mead / Space: 1999',
    summary: 'A space-age graphic system: a lit white field, extended type, a lit planet and orbit, stripe bands, dials and LED ladders around one signal colour.',
    motto: 'All systems nominal.',
    kicker: 'Mission control',
    mode: 'light',
    slideShape: 'minimal',
    layout: { hero: 'centered', palette: 'swatches', sections: 'two-col' },
    labels: { material: 'Console', states: ['Idle', 'Armed', 'Engaged'], statesKind: 'swatch' },
    // Editable specimen copy (Brand > Advanced > Specimen copy); text matches motto / kicker / labels.states above.
    copy: {
      motto: { label: 'Motto', text: 'All systems nominal.' },
      kicker: { label: 'Kicker above the headline', text: 'Mission control' },
      state0: { label: 'State 1 name', text: 'Idle' },
      state1: { label: 'State 2 name', text: 'Armed' },
      state2: { label: 'State 3 name', text: 'Engaged' },
      craftTag: { label: 'Craft tag on the horizon plate', text: 'MRG-01 / T+00:41:07' },
      plateCap: { label: 'Vertical caption on the horizon plate', text: 'A new kind of space' },
      lcdTop: { label: 'Console LCD label 1', text: 'FREQ' },
      lcdBottom: { label: 'Console LCD label 2', text: 'MHZ' },
      dialGain: { label: 'Console dial label', text: 'GAIN' },
      ladderLevel: { label: 'Console LED ladder label', text: 'LEVEL' },
      logHead: { label: 'Mission log header', text: 'Mission log \u00a0/\u00a0 T+00:41:07' },
    },
    type: { ui: 'mono', label: 'mono' },
    highlight: 'custom',
    highlightNote: 'One headline word in the flat signal colour (the primary), like the one red mark in a standards manual. No glow, fill or band.',
    cardFill: '--ab-canvas',

    roles: {
      ink: {
        use: 'Headlines, body text, hairlines, orbits and every readout',
        never: 'Tinted or glowing; it stays flat',
      },
      primary: {
        use: 'The signal: the CTA key, the highlight word, the lit lamp, the craft\'s orbit and the atmosphere rim',
        never: 'Body text, panel fills, a second accent colour',
      },
      secondary: {
        use: 'Off the board: charts and secondary print pieces only',
        never: 'Lamps, readouts or anything that competes with the signal',
      },
      accent: {
        use: 'Off the board: one spot colour for print pieces',
        never: 'On screen next to the signal',
      },
    },

    // A lit white field (light) or deep space (dark). Never tinted by the client's
    // primary; the dark field is a cool neutral black.
    canvas(b) {
      return b.isDark ? '#08090b' : b.mix('#ffffff', b.canvas, 0.15);
    },

    tokens(t, st) {
      const S = st || (typeof state !== 'undefined' ? state : null) || {};
      const sig = signalOf(t);
      // muted text also sits on the app sidebar (a 3.5% ink tint over the canvas): hold 4.6:1 there
      const side = t.mix(t.ink, t.canvas, 0.08);
      let muted = t.muted;
      for (let k = 0.05; k <= 1.001 && Math.min(t.contrast(muted, side), t.contrast(muted, t.canvas)) < 4.6; k += 0.05) muted = t.mix(t.ink, t.muted, k);
      return {
        '--ab-muted': muted,
        '--ab-rf-hot': t.isDark ? '#FF7A4D' : '#D93A12',
        '--rf-hair-2': t.alpha(t.ink, 0.08),
        // --ab-rf-* (not --rf-*) so materials[].css placeholders ({rfSignal} -> --ab-rf-signal) resolve
        '--ab-rf-signal': sig, '--ab-rf-hair': t.alpha(t.ink, 0.18), '--ab-rf-off': t.alpha(t.ink, 0.15),
        '--ab-rf-panel': t.isDark ? t.mix('#ffffff', t.canvas, 0.035) : t.mix('#ffffff', t.canvas, 0.6),
        '--rf-do': pairSvg(t, 'do'),
        '--rf-dont': pairSvg(t, 'dont'),
        // largest published weight <= 700: a single-weight face (Michroma) is asked for its 400
        '--rf-hw': abWeight(S.headingFont, 700),
      };
    },

    // Hero: the orbital horizon plate (the console is the deck's Material art).
    art(ctx) {
      const t = ctx.t;
      const id = 'rf' + (++seq);
      return `<div class="rfa" style="position:absolute;inset:0;overflow:hidden;background:#000">${horizon(t, id)}</div>`;
    },

    materials: [
      { name: 'Horizon plate', css: 'background: linear-gradient(180deg, #000 0%, #030406 42%, {canvas} 75%); /* planet limb below: canvas into mix(primary, canvas, .35), rim stroke {primary} .8px, three orbits in white 38%, one craft */' },
      { name: 'Flat panel', css: 'background: {rfPanel}; border-radius: 2px; box-shadow: inset 0 0 0 1px {rfHair};' },
      { name: 'Signal key', css: 'background: {rfSignal}; color: {onPrimary}; border-radius: 2px; box-shadow: inset 0 -3px 0 rgba(0,0,0,.25); font: 700 12px ui-monospace, "SF Mono", Menlo, monospace; text-transform: uppercase; letter-spacing: .14em;' },
      { name: 'Mission dial', css: 'background: #d4d5d1; /* a dark dial face with 31 ticks, a value arc and a needle in {primary}; LCD and LED ladder in the same one hue */' },
      { name: 'Lamp', css: 'width: 10px; height: 10px; border-radius: 0; background: {rfOff}; /* on: {rfSignal} */' },
    ],

    rules: {
      do: [
        'Use one signal colour: the primary marks the action, one headline word, one lit ring and the lit lamps; everything else is ink.',
        'Set headlines in an extended grotesk (Eurostile style), uppercase, large; set captions in ultra-wide thin caps.',
        'Give the hero a vast field, a lit planet limb, three orbits and one tiny craft, with the stripe band along the foot.',
        'Use the three-stripe band (primary, secondary, accent) as the rule, the divider and the card top edge.',
        'Make progress an LED ladder, a stat a small dial or a mono readout, and a status a lamp plus a label; use the hot orange only for an alert lamp.',
        'Round the keys: pill buttons and switches, 22px panels, flat with 1px hairlines.',
      ],
      dont: [
        'Chrome, gloss or soft blurs; only a lit lamp may glow, and only a little.',
        'Spread the client palette over lamps and readouts; one hue per screen, plus the hot lamp.',
        'Fill the hero with a gadget; the console is a secondary material.',
        'Use rainbow stripes or more than three bands.',
        'Use psychedelic swirls or op-art; the system is orbits, grids and horizons.',
      ],
    },
    // The 03 list carries its own header row as real text (was CSS generated content).
    panels: {
      list(ctx) {
        return ctx.parts.listBase().replace('<ul class="ab-list">', () => `<ul class="ab-list"><li class="rf-loghead">${abCopy(RF_KEY, 'logHead')}</li>`);
      },
    },
    deck: {
      // The cover's foot is the NASA three-stripe band drawn in css (the shared grey pattern band read as a placeholder).
      coverBand: false,
      // Material slide: the mission console (dial, LCD, LED ladder), the deck's second idea.
      materialArt(ctx) {
        return `<div class="rfa-console" style="position:absolute;inset:0">${consoleArt(ctx.t, 'rfc' + (++seq))}</div>`;
      },
      principles: [
        ['One signal colour', 'The primary marks one thing per screen; the rest is ink.'],
        ['Horizon and orbit', 'A lit planet limb, an accent ring and one tiny craft.'],
        ['Dials and stripes', 'Extended type, three-stripe bands, dials and LED ladders.'],
      ],
      do: [
        'Mark one thing per screen in the signal colour.',
        'Leave a vast field around a tiny object.',
        'Number sections like a standards manual.',
      ],
      dont: [
        'Use chrome or gloss.',
        'Light every lamp in a different colour.',
        'Stack more than three stripe bands.',
      ],
    },
  });
})();
