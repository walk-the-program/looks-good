/* 04 Retro-Futurist — a mission-control console: bezelled panels, inset CRT
   screens with scanlines, lit keys, glowing lamps and a synthwave sun.
   Screens stay dark in both modes; bezels follow the canvas. Look lives in
   css/aesthetics/retro-futurist.css. */
(function () {
  let seq = 0;

  registerAesthetic({
    key: 'retro-futurist', order: 4,
    name: 'Retro-Futurist',
    descriptor: 'Analog · Orbital · Glowing',
    influences: '1970s space age / Mission control / Synthwave',
    summary: 'A mission-control console that glows: bezels, lamps and readouts.',
    motto: 'All systems nominal.',
    kicker: 'Mission control',
    mode: 'dark',
    slideShape: 'refined',
    labels: { material: 'Console', states: ['Idle', 'Armed', 'Engaged'] },

    roles: {
      ink: {
        use: 'Chrome headlines, body text, bezel lettering and screen text',
        never: 'Large background fields in light mode',
      },
      primary: {
        use: 'The one illuminated action, the lit key and the "engaged" lamp',
        never: 'Body text, bezel fills, a second CTA',
      },
      secondary: {
        use: 'Readouts: telemetry values, LED meter bars, the grid floor and chart lines',
        never: 'The main CTA, body text, bezels',
      },
      accent: {
        use: 'Status lamps (glowing dots) and one headline word',
        never: 'Buttons, body text, bezel fills, large areas',
      },
    },

    // A very dark canvas lets the glow read. Light canvases are kept as-is
    // (daylight console); the screens are dark either way.
    canvas(b) {
      if (!b.isDark) return b.canvas;
      const h = b.hexToHsl(b.canvas);
      return h.l > 18 ? b.hslToHex(h.h, Math.min(h.s, 45), 14) : b.canvas;
    },

    tokens(t) {
      const d = t.isDark;
      const screen = d ? t.mix('#000000', t.canvas, 0.5) : t.mix('#000000', t.ink, 0.55);
      const screenInk = d ? t.ink : t.canvas;
      // Brand hues, pulled toward the screen text color until they glow on the screen.
      const lift = (hex, min) => {
        for (let a = 1; a >= 0; a -= 0.1) {
          const c = t.mix(hex, screenInk, a);
          if (t.contrast(c, screen) >= min) return c;
        }
        return screenInk;
      };
      const readout = lift(t.secondary, 4.5);
      const lamp = lift(t.accent, 3.5);
      const priLit = lift(t.primary, 3);
      const spark = encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 18"><polyline fill="none" stroke="' + readout
        + '" stroke-width="1.6" stroke-linejoin="round" points="0,14 10,10 20,12 31,5 42,9 52,4 63,8 74,3 90,6"/></svg>');
      return {
        '--ab-screen': screen,
        '--ab-screen-ink': screenInk,
        '--ab-readout': readout,
        '--ab-lamp': lamp,
        '--ab-pri-lit': priLit,
        '--ab-readout-glow': t.alpha(readout, 0.5),
        '--ab-lamp-glow': t.alpha(lamp, 0.8),
        '--ab-pri-glow': t.alpha(t.primary, 0.5),
        '--ab-lamp-dim': t.mix(lamp, screen, 0.22),
        '--ab-bezel-top': d ? t.mix('#ffffff', t.canvas, 0.08) : t.mix('#ffffff', t.canvas, 0.6),
        '--ab-bezel-bot': d ? t.mix('#000000', t.canvas, 0.16) : t.mix('#000000', t.canvas, 0.07),
        '--ab-bezel-hi': d ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.95)',
        '--ab-bezel-edge': d ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.2)',
        '--ab-bezel-drop': d ? 'rgba(0,0,0,0.6)' : 'rgba(40,40,70,0.26)',
        '--ab-key-top': d ? t.mix('#ffffff', t.canvas, 0.14) : t.mix('#ffffff', t.canvas, 0.75),
        '--ab-key-bot': d ? t.mix('#000000', t.canvas, 0.04) : t.mix('#000000', t.canvas, 0.1),
        '--ab-key-lip': d ? t.mix('#000000', t.canvas, 0.45) : t.mix('#000000', t.canvas, 0.22),
        '--ab-chrome': `linear-gradient(180deg, ${t.ink} 0%, ${t.mix(t.ink, t.muted, 0.45)} 32%, ${t.muted} 54.5%, ${t.ink} 55.5%, ${t.mix(t.ink, t.muted, 0.35)} 100%)`,
        '--ab-star': t.alpha(screenInk, d ? 0.65 : 0.45),
        '--ab-spark': `url("data:image/svg+xml,${spark}")`,
      };
    },

    art(ctx) {
      const t = ctx.t;
      const id = 'rf' + (++seq);
      const d = t.isDark;
      const screen = d ? t.mix('#000000', t.canvas, 0.5) : t.mix('#000000', t.ink, 0.55);
      const screenInk = d ? t.ink : t.canvas;
      const lift = (hex, min) => {
        for (let a = 1; a >= 0; a -= 0.1) {
          const c = t.mix(hex, screenInk, a);
          if (t.contrast(c, screen) >= min) return c;
        }
        return screenInk;
      };
      const readout = lift(t.secondary, 4.5);
      const lamp = lift(t.accent, 3.5);
      const priLit = lift(t.primary, 3);
      const horizon = 64;
      const vx = 50;
      // perspective floor: rays from the vanishing point and horizontals that bunch toward the horizon
      let grid = '';
      for (let i = -9; i <= 9; i++) {
        grid += `<line x1="${vx + i * 1.4}" y1="${horizon}" x2="${vx + i * 17}" y2="100"/>`;
      }
      for (let k = 1; k <= 7; k++) {
        const y = horizon + 36 * Math.pow(k / 7, 2);
        grid += `<line x1="0" y1="${y.toFixed(2)}" x2="100" y2="${y.toFixed(2)}"/>`;
      }
      const stars = [[10, 10, 0.7], [22, 24, 0.5], [34, 8, 0.6], [68, 12, 0.8], [84, 22, 0.55], [92, 8, 0.5], [14, 40, 0.5], [90, 40, 0.6], [58, 6, 0.45]]
        .map(s => `<circle cx="${s[0]}" cy="${s[1]}" r="${s[2]}" fill="${screenInk}" opacity=".75"/>`).join('');
      // slices cut out of the sun, thicker toward the horizon
      const slices = [[44, 1], [49.5, 1.5], [55, 2.1], [60, 2.8]]
        .map(s => `<rect x="0" y="${s[0]}" width="100" height="${s[1]}" fill="#000"/>`).join('');
      return `<svg viewBox="0 0 100 100" width="100%" height="100%" focusable="false">
        <defs>
          <clipPath id="${id}c"><rect width="100" height="100" rx="5"/></clipPath>
          <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="${screen}"/><stop offset=".64" stop-color="${t.mix(t.primary, screen, 0.3)}"/><stop offset=".641" stop-color="${screen}"/><stop offset="1" stop-color="${t.mix(t.primary, screen, 0.14)}"/>
          </linearGradient>
          <linearGradient id="${id}u" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="${lamp}"/><stop offset=".55" stop-color="${priLit}"/><stop offset="1" stop-color="${t.primary}"/>
          </linearGradient>
          <mask id="${id}m"><rect width="100" height="100" fill="#fff"/>${slices}</mask>
        </defs>
        <g clip-path="url(#${id}c)">
          <rect width="100" height="100" fill="url(#${id}s)"/>
          ${stars}
          <g transform="rotate(-18 50 44)"><ellipse cx="50" cy="44" rx="47" ry="12" fill="none" stroke="${screenInk}" stroke-opacity=".4" stroke-width="1" vector-effect="non-scaling-stroke" stroke-dasharray="3 3"/></g>
          <circle cx="50" cy="40" r="33" fill="${t.primary}" opacity=".16"/>
          <circle cx="50" cy="40" r="25" fill="url(#${id}u)" mask="url(#${id}m)"/>
          <g transform="rotate(-18 50 44)">
            <path d="M3 44 A47 12 0 0 0 97 44" fill="none" stroke="${lamp}" stroke-width="1.3" vector-effect="non-scaling-stroke"/>
            <circle cx="77" cy="54" r="6.5" fill="${lamp}" opacity=".28"/>
            <circle cx="77" cy="54" r="3.4" fill="${lamp}"/>
          </g>
          <line x1="0" y1="${horizon}" x2="100" y2="${horizon}" stroke="${readout}" stroke-width="1.4" vector-effect="non-scaling-stroke"/>
          <g stroke="${readout}" stroke-width="1" stroke-opacity=".8" vector-effect="non-scaling-stroke" fill="none">${grid.replace(/<line /g, '<line vector-effect="non-scaling-stroke" ')}</g>
        </g>
      </svg>`;
    },

    materials: [
      { name: 'Bezel panel', css: 'background: linear-gradient(180deg, {bezelTop}, {bezelBot}); border-radius: 18px; box-shadow: inset 0 1px 0 {bezelHi}, 0 0 0 1px {bezelEdge}, 0 18px 36px -10px {bezelDrop};' },
      { name: 'CRT screen', css: 'background: radial-gradient(120% 90% at 50% 0, rgba(255,255,255,.06), transparent 60%), {screen}; color: {readout}; border-radius: 10px; box-shadow: inset 0 2px 8px rgba(0,0,0,.7), 0 0 0 2px {bezelEdge}; /* plus repeating-linear-gradient scanlines, 2px, black 14% */' },
      { name: 'Illuminated primary', css: 'background: {primary}; color: {onPrimary}; border-radius: 999px; box-shadow: inset 0 1px 0 rgba(255,255,255,.55), inset 0 -2px 4px rgba(0,0,0,.25), 0 0 24px {priGlow}; font: 700 12.5px ui-monospace, "SF Mono", Menlo, monospace; text-transform: uppercase;' },
      { name: 'Bevelled key', css: 'background: linear-gradient(180deg, {keyTop}, {keyBot}); border-radius: 8px; box-shadow: inset 0 1px 0 {bezelHi}, 0 3px 0 {keyLip}; /* lit: background {primary}, glow {priGlow} */' },
      { name: 'Status lamp', css: 'background: radial-gradient(circle at 35% 30%, #fff, {lamp} 35%); border-radius: 50%; box-shadow: 0 0 10px {lampGlow}; /* off: {lampDim} */' },
      { name: 'Chrome headline', css: 'background: {chrome}; -webkit-background-clip: text; background-clip: text; color: transparent; text-transform: uppercase; letter-spacing: .02em; /* hard horizon at 55% */' },
    ],

    rules: {
      do: [
        'Build panels as bezels: a vertical gradient, a 1px top highlight and a deep outer shadow.',
        'Put information on inset dark screens with scanlines, and set readouts in monospace in the secondary color.',
        'Light things that are active: the primary key, the CTA and the lamps glow; idle ones sit dim.',
        'Set the headline in uppercase chrome with a hard horizon line, and one headline word in the accent.',
      ],
      dont: [
        'Glow everything; glow means active, so idle controls stay dim.',
        'Use the accent for anything but lamps and one headline word.',
        'Put body text on a glowing surface or a scanline screen at low contrast.',
        'Flatten the bezels: no flat fills, thin hairline cards or soft white shadows.',
      ],
    },
  });
})();
