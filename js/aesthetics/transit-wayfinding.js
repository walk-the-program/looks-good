/* 43 Transit Wayfinding — Directional, Coded, Calm. The interface behaves like a station
   (NYCTA standards manual, INAT metro maps, Kinneir & Calvert, Tokyo Metro numbering).

   Mechanism. Everything that speaks is a SIGN: a #000 panel with white mixed-case type and a
   1px white rule inset 6px from its top edge, on a concourse ground (#16181A dark, a pale
   tiled grey light). Colour is rationed to meaning: the three client colours are ROUTES and
   appear only as line strokes and route bullets (circles carrying a letter taken from the
   brand name, M / A / R for "Marigold"; the accent route is the express, so its bullet is a
   diamond). Each route colour is tinted until it holds 3:1 on black (bullets, sign lines) and,
   in light mode, shaded until it holds 3:1 on the white map paper. One fixed alert yellow
   (#FFC72C, black text) is the only other colour and only means "Diverted".
   Headline: def.headline draws an arrow on a 10-unit grid (1-unit shaft, 45-degree head) in
   front of the words: arrow first, then words. The destination word carries a route line
   under it in route 1's colour. Hero art: the brand network, an octilinear map (0/45/90
   degrees only, rounded 45-degree turns, ticks for stations, one white interchange disc named
   after the brand, a pale river), under a sign strip with the three route bullets and over a
   pictogram legend drawn on a 6x6 grid. */
(function () {
const TW_SIGN = '#000000';
const TW_ALERT = '#FFC72C';
const TW_GREY = '#6D6E71';

function twMix(a, b, k) { return typeof slMix === 'function' ? slMix(a, b, k) : a; }
function twCR(a, b) { return typeof contrastRatio === 'function' ? contrastRatio(a, b) : 21; }

// A route colour that holds 3:1 on `ground`: tinted toward white on a dark ground, shaded
// toward black on a light one (yellows turn amber first, via abAccentInk).
function twRoute(hex, ground) {
  if (typeof abAccentInk === 'function') {
    const c = abAccentInk(hex, ground, twCR(ground, '#000000') > 10 ? '#000000' : '#ffffff');
    if (twCR(c, ground) >= 3) return c;
  }
  const to = twCR(ground, '#000000') > twCR(ground, '#ffffff') ? '#000000' : '#ffffff';
  let c = hex;
  for (let k = 0.08; k <= 1 && twCR(c, ground) < 3; k += 0.08) c = twMix(to, hex, k);
  return c;
}
function twOn(bg) { return twCR('#ffffff', bg) >= 4.5 ? '#ffffff' : '#000000'; }

// Three route letters from the brand name: first three distinct letters (M, A, R).
function twLetters(name) {
  const out = [];
  String(name || '').toUpperCase().replace(/[^A-Z0-9]/g, '').split('').forEach(ch => { if (out.length < 3 && !out.includes(ch)) out.push(ch); });
  ['X', 'Y', 'Z'].forEach(ch => { if (out.length < 3 && !out.includes(ch)) out.push(ch); });
  return out;
}
function twBrandName() {
  try { if (typeof effectiveContent === 'function') return effectiveContent().brandName; } catch (err) { /* fall through */ }
  return (typeof state !== 'undefined' && state && state.brandName) || 'Brand';
}

// The heaviest weight of the heading face up to `cap` (no fake bold).
function twWeight(cap) {
  const hf = typeof state !== 'undefined' && state && state.headingFont;
  const ws = String((hf && hf.weights) || '700').split(';').map(Number).filter(Boolean);
  const le = ws.filter(x => x <= cap);
  return le.length ? Math.max(...le) : Math.min(...ws);
}

// Route colours for a token object: b = on black (signs, bullets), g = on the map paper / ground.
function twRoutes(t) {
  const paper = t.isDark ? TW_SIGN : '#ffffff';
  return ['primary', 'secondary', 'accent'].map(k => {
    const hex = k === 'primary' ? (t.printPrimary || t.primary) : t[k];
    const b = twRoute(hex, TW_SIGN);
    const g = t.isDark ? b : twRoute(hex, paper);
    return { hex, b, g, ob: twOn(b) };
  });
}

// Octilinear polyline with rounded 45/90-degree turns (radius r, quadratic corner).
function twPath(pts, r) {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1], [x, y] = pts[i], [nx, ny] = pts[i + 1];
    const l1 = Math.hypot(x - px, y - py), l2 = Math.hypot(nx - x, ny - y);
    const k1 = Math.min(r, l1 / 2), k2 = Math.min(r, l2 / 2);
    const ax = x - (x - px) / l1 * k1, ay = y - (y - py) / l1 * k1;
    const bx = x + (nx - x) / l2 * k2, by = y + (ny - y) / l2 * k2;
    d += ` L${ax.toFixed(1)} ${ay.toFixed(1)} Q${x} ${y} ${bx.toFixed(1)} ${by.toFixed(1)}`;
  }
  const z = pts[pts.length - 1];
  return d + ` L${z[0]} ${z[1]}`;
}

// The arrow on a 10-unit grid: 1.6-unit shaft, 45-degree head. dir = rotation in degrees (0 = east).
function twArrow(dir, cls) {
  return `<svg class="${cls || 'tw-arrow'}" viewBox="0 0 10 10" aria-hidden="true" focusable="false"><g transform="rotate(${dir} 5 5)" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square" stroke-linejoin="miter"><path d="M1.2 5H8.2M5.2 1.8 8.4 5 5.2 8.2"/></g></svg>`;
}

// Pictograms on a 6x6 grid (24 units, 4 per cell), drawn in currentColor.
const TW_PICTOS = {
  info: '<circle cx="12" cy="12" r="10.5" fill="currentColor"/><g style="fill:var(--tw-picto-bg, #000)"><circle cx="12" cy="7" r="1.9"/><path d="M10 10.4h3.6v7.2h1.4v1.8H9v-1.8h1.4v-5.4H10z"/></g>',
  stairs: '<path d="M2 21h5v-4.5h5V12h5V7.5h5V3" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="miter"/>',
  lift: '<rect x="4" y="2.5" width="16" height="19" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M12 5.8 15.4 10H8.6zM12 18.2 8.6 14h6.8z" fill="currentColor"/>',
  exit: '<path d="M3 3h10v18H3z" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M9 12h11M16 8l4 4-4 4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square"/>',
  stepfree: '<circle cx="10" cy="3.6" r="2.2" fill="currentColor"/><path d="M9.6 7.5v6.2h6.2l2.6 6.4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="miter"/><path d="M6.6 11.2a6 6 0 1 0 8.6 7.3" fill="none" stroke="currentColor" stroke-width="2.2"/>',
  plus: '<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z" fill="currentColor"/>',
};
function twPicto(name) {
  return `<svg class="tw-picto" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${TW_PICTOS[name] || ''}</svg>`;
}

function twBullet(letter, r, i, extra) {
  const shape = i === 2 ? ' tw-bul--x' : '';
  return `<span class="tw-bul${shape}${extra || ''}" style="--tw-c:${r.b};--tw-o:${r.ob}"><i>${escapeHtml(letter)}</i></span>`;
}

let twSeq = 0;

registerAesthetic({
  key: 'transit-wayfinding', order: 43,
  name: 'Transit Wayfinding',
  descriptor: 'Directional · Coded · Calm',
  influences: 'NYCTA standards / INAT metro maps / Kinneir & Calvert / Tokyo Metro numbering',
  summary: 'Black sign panels and white type where every brand colour is a route and one yellow means alert.',
  motto: 'Colour means a route.',
  kicker: 'Next stop',
  mode: 'dark',
  slideShape: 'minimal',
  labels: { material: 'Lines', states: ['Scheduled', 'Approaching', 'Diverted'], statesKind: 'button' },
  // a concourse leads with the departures board: 03 In use first, then the components
  layout: { hero: 'centered', palette: 'swatches', sections: 'two-col', sectionOrder: ['use', 'ui', 'touch'] },
  type: { ui: 'heading', label: 'heading', display: 0.78 },
  highlight: 'custom',
  highlightNote: 'The destination word stays white on the black sign and gets a route line under it (route 1 colour, 0.09em thick, square ends), never a colour change or a highlighter band; an arrow drawn on a 10-unit grid always stands in front of the headline.',
  cardFill: '--ab-sign',

  roles: {
    canvas: {
      job: 'Concourse',
      use: 'The concourse ground the signs hang on: #16181A in dark mode, a pale tiled grey in light mode. Fixed, never a client tint. Sign panels are always #000 with white type and a 1px white rule 6px inside the top edge',
      never: 'Text, decoration, coloured panels',
      coverage: '45–55%',
    },
    ink: {
      job: 'Sign text',
      use: 'Type on the concourse. Sign type on panels is pure white (#FFF) in every palette; body and sign text never take a brand colour',
      never: 'Route lines, bullets, coloured text',
      coverage: '25–35% (sign black included)',
    },
    primary: {
      job: 'Route 1 · main action',
      use: 'Route 1: its line strokes, its bullet (brand initial), the main action panel, the selected toggle line and the headline destination line. Tinted until it holds 3:1 on black',
      never: 'Body text, backgrounds, decoration that carries no route',
      coverage: '≈6%',
    },
    secondary: {
      job: 'Route 2',
      use: 'Route 2: its line strokes and bullet only (map, departures, progress lines)',
      never: 'Buttons, text, fills, decoration',
      coverage: '≈3%',
    },
    accent: {
      job: 'Route 3 · express',
      use: 'Route 3, the express: its line strokes and a diamond bullet only',
      never: 'Buttons, text, alerts (alert is the fixed yellow #FFC72C)',
      coverage: '≈2%',
    },
  },

  // The concourse is fixed: colour is rationed to routes.
  canvas(b) { return b.isDark ? '#16181A' : '#E8E8E4'; },

  tokens(t) {
    const R = twRoutes(t);
    const L = twLetters(twBrandName());
    const hw = twWeight(800);
    const vars = {
      '--ab-type-pick-w': 400,   // secondary picks; the lead pick is set at 800 in the css (every lead pick has 800)
      '--tw-hw': hw,
      '--tw-mw': twWeight(600),
      '--ab-sign': TW_SIGN,
      '--ab-alert': TW_ALERT,
      '--ab-rail': TW_GREY,
      '--tw-paper': t.isDark ? TW_SIGN : '#FFFFFF',
      '--tw-tile': t.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.05)',
      '--ab-art-ratio': '16 / 8.4',
      '--ab-art-ratio-narrow': '10 / 12',
      '--tw-cta': R[0].b,
      '--tw-on-cta': R[0].ob,
      '--ab-tr': 1,
    };
    R.forEach((r, i) => {
      vars[`--ab-route${i + 1}`] = r.b;
      vars[`--tw-o${i + 1}`] = r.ob;
      vars[`--tw-g${i + 1}`] = r.g;
      vars[`--tw-l${i + 1}`] = `'${L[i]}'`;
    });
    return vars;
  },

  // Arrow first, then words. The destination (last) word gets a route line.
  headline(ctx, text) {
    const e = escapeHtml;
    const words = String(text || '').trim().split(/\s+/).filter(Boolean);
    if (!words.length) return '';
    const last = words.pop();
    const body = (words.length ? e(words.join(' ')) + ' ' : '') + `<span class="ab-hl tw-dest">${e(last)}</span>`;
    return `<span class="tw-h">${twArrow(-45, 'tw-arw')}<span class="tw-t">${body}</span></span>`;
  },

  art(ctx) {
    const t = ctx.t;
    const e = escapeHtml;
    const R = twRoutes(t);
    const L = twLetters(ctx.brandName);
    const dark = t.isDark;
    const paper = dark ? TW_SIGN : '#FFFFFF';
    const lbl = dark ? '#FFFFFF' : '#111111';
    const sub = dark ? '#B9BBBE' : '#4B4C4F';
    const water = dark ? '#16242D' : '#D3E3EC';
    const park = dark ? '#121B15' : '#E2EDE0';
    const name = String(ctx.brandName || '').trim();
    const id = 'tw' + (++twSeq);
    const W = 10; // line width
    // lines (0/45/90 only), interchange H at (360,170)
    const lines = [
      { r: R[0], pts: [[-20, 170], [560, 170], [620, 230], [690, 230]], dash: [[690, 230], [740, 230]] },
      { r: R[1], pts: [[64, 40], [230, 40], [360, 170], [360, 266]] },
      { r: R[2], pts: [[64, 266], [270, 266], [360, 176], [450, 86], [652, 86]] },
    ];
    const stroke = lines.map(l => `<path d="${twPath(l.pts, 30)}" stroke="${l.r.g}"/>`).join('');
    const ext = `<path d="M690 230H760" stroke="${TW_GREY}" stroke-dasharray="2 9" stroke-width="${W - 4}"/>`;
    // stations: [x, y, line, tick dir (dx,dy), label, anchor, lx, ly]
    const st = [
      [96, 170, 0, [0, -1], 'Mill Lane', 'middle', 96, 148],
      [210, 170, 0, [0, -1], 'Market', 'middle', 210, 148],
      [500, 170, 0, [0, -1], 'Archive', 'middle', 500, 148],
      [600, 210, 0, [1, -1], 'Harbour', 'start', 618, 205],
      [150, 40, 1, [0, 1], 'North Gate', 'middle', 150, 69],
      [296, 106, 1, [1, -1], 'Library', 'start', 312, 101],
      [360, 226, 1, [-1, 0], 'Studio', 'end', 344, 230],
      [168, 266, 2, [0, -1], 'Old Quay', 'middle', 168, 244],
      [405, 131, 2, [1, 1], 'Gallery', 'start', 420, 144],
      [560, 86, 2, [0, -1], 'Lookout', 'middle', 560, 64],
    ];
    const ticks = st.map(s => {
      const [x, y, li, [dx, dy]] = s;
      const n = Math.hypot(dx, dy);
      const ux = dx / n, uy = dy / n;
      return `<path d="M${x} ${y}L${(x + ux * 11).toFixed(1)} ${(y + uy * 11).toFixed(1)}" stroke="${lines[li].r.g}" stroke-width="5" stroke-linecap="butt"/>`;
    }).join('');
    const labels = st.map(s => `<text x="${s[6]}" y="${s[7]}" text-anchor="${s[5]}" class="twa-st" font-size="12.5" font-weight="600">${s[4]}</text>`).join('');
    // terminus bullets (route 3 is the express: diamond)
    const term = [[lines[1].pts[0], 1], [lines[2].pts[0], 2], [[690, 230], 0], [lines[2].pts[4], 2], [lines[1].pts[3], 1]];
    const bul = term.map(([[x, y], i]) => {
      const r = R[i];
      const shape = i === 2
        ? `<rect x="${x - 13}" y="${y - 13}" width="26" height="26" transform="rotate(45 ${x} ${y})" fill="${r.b}" stroke="${paper}" stroke-width="3"/>`
        : `<circle cx="${x}" cy="${y}" r="16" fill="${r.b}" stroke="${paper}" stroke-width="3"/>`;
      return `${shape}<text x="${x}" y="${y + 6}" text-anchor="middle" class="twa-bl" font-size="16" font-weight="800" fill="${r.ob}">${e(L[i])}</text>`;
    }).join('');
    const map = `<svg class="twa-map twa-map--w" viewBox="0 0 720 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><g id="${id}-m">
      <rect x="-200" y="-100" width="1120" height="500" fill="${paper}"/>
      <rect x="58" y="84" width="150" height="40" rx="10" fill="${park}"/><text x="133" y="108" text-anchor="middle" class="twa-wt" font-size="10.5" letter-spacing="1.4" fill="${dark ? '#4F6656' : '#5E7A63'}">PARK</text>
      <path d="${twPath([[500, 330], [556, 274], [760, 274]], 40)}" fill="none" stroke="${water}" stroke-width="30"/>
      <text x="700" y="279" text-anchor="end" class="twa-wt" font-size="10.5" letter-spacing="1.4" fill="${dark ? '#5C7584' : '#5B7A8C'}">RIVER</text>
      <g fill="none" stroke-width="${W}" stroke-linecap="round" stroke-linejoin="round">${ext}${stroke}</g>
      <g>${ticks}</g>
      <circle cx="360" cy="171" r="19" fill="#FFFFFF" stroke="${dark ? '#FFFFFF' : '#111111'}" stroke-width="2"/>
      <circle cx="360" cy="171" r="13.5" fill="none" stroke="#111111" stroke-width="4.5"/>
      <g fill="${lbl}" class="twa-lb">${labels}</g>
      <text x="384" y="200" class="twa-hub" font-size="16" font-weight="800" fill="${lbl}">${e(name)}</text>
      <text x="384" y="216" class="twa-hubs" font-size="11" fill="${sub}">Interchange · all routes</text>
      ${bul}
    </g></svg><svg class="twa-map twa-map--n" viewBox="176 4 372 296" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><use href="#${id}-m"/></svg>`;
    const legend = [['stepfree', 'Step-free'], ['lift', 'Lift'], ['stairs', 'Stairs'], ['exit', 'Exit'], ['info', 'Info'], ['plus', 'First aid']]
      .map(([k, l]) => `<span class="twa-lg">${twPicto(k)}<b>${l}</b></span>`).join('');
    return `<div class="twa" data-dark="${dark ? 1 : 0}">
      <div class="twa-sign">
        <span class="twa-buls">${L.map((l, i) => twBullet(l, R[i], i)).join('')}</span>
        <span class="twa-dest"><b>${e(name)} network</b><small>Routes ${e(L.join(' · '))} · step-free throughout</small></span>
        <span class="twa-dir">${twArrow(0, 'tw-arrow')}<b>All lines</b></span>
      </div>
      <div class="twa-mapbox">${map}</div>
      <div class="twa-legend">${legend}</div>
    </div>`;
  },

  // 03 as a real departures board: route bullet (a letter from the brand name), destination,
  // platform + status, line progress with the current station as a ring, percent.
  panels: {
    list(ctx) {
      const e = ctx.e;
      const R = twRoutes(ctx.t);
      const L = twLetters(ctx.brandName);
      const rows = (ctx.rows || []).slice(0, 3).map((r, i) => `<li class="ab-row" style="--tw-c:${R[i].b};--tw-o:${R[i].ob}">
          <span class="ab-row-n tw-rn${i === 2 ? ' tw-rn--x' : ''}"><i>${e(L[i])}</i></span>
          <span class="ab-row-name">${e(r[0])}</span>
          <span class="ab-row-status"><b>Plat ${i + 1}</b> · ${e(r[1])}</span>
          <span class="ab-row-bar" aria-hidden="true"><i style="width:${Number(r[2]) || 0}%"></i></span>
          <span class="ab-row-pct">${Number(r[2]) || 0}%</span>
        </li>`).join('');
      return `<ul class="ab-list tw-dep">${rows}<li class="tw-dfoot">Departures · updated every 30 s</li></ul>`;
    },
  },

  materials: [
    { name: 'Sign panel', css: 'background: {sign}; color: #FFFFFF; border-radius: 4px; box-shadow: inset 0 6px 0 {sign}, inset 0 7px 0 #FFFFFF; /* black panel, white mixed-case type at 600-800, a 1px white rule 6px inside the top edge; never a client colour */' },
    { name: 'Route line', css: 'stroke: {route1}; stroke-width: 8px; stroke-linecap: round; stroke-linejoin: round; /* 0, 45 and 90 degrees only; 45-degree turns rounded at 3x the line width; stations are line-colour ticks, interchanges a white disc with a black ring; max three or four routes */' },
    { name: 'Route bullet', css: 'background: {route1}; color: {onPrimary}; border-radius: 50%; width: 28px; height: 28px; font-weight: 800; /* a letter from the brand name (M, A, R); the express route (route 3) is a diamond; text white when it holds 4.5:1, else black */' },
    { name: 'Alert panel', css: 'background: {alert}; color: #000000; border-radius: 4px; font-weight: 800; /* the ONE alert colour, fixed yellow #FFC72C with a warning pictogram; only for Diverted / delayed, never decoration */' },
    { name: 'Platform tab', css: 'border: 2px solid #FFFFFF; color: #FFFFFF; width: 26px; height: 26px; font-weight: 800; font-variant-numeric: tabular-nums; /* numbers in squares; the selected platform is a white square with a black number */' },
    { name: 'Rail toggle', css: 'background: linear-gradient({rail}, {rail}) center / 100% 4px no-repeat; /* a short line between two station dots; the knob is a route bullet that travels; on = the line in the route colour */' },
    { name: 'Concourse', css: 'background: {canvas}; /* #16181A dark or pale tiled grey light; the signs hang on it, nothing coloured sits on it directly */' },
  ],

  rules: {
    do: [
      'Put every message on a sign: a #000 panel, white mixed-case type at 600-800 weight, a 1px white rule 6px inside the top edge, 0-4px corners.',
      'Give each brand colour a route: a line and a bullet carrying a letter from the brand name; the third route is the express with a diamond bullet.',
      'Draw diagrams at 0, 45 and 90 degrees only, with rounded 45-degree turns, line-colour ticks for stations and a white disc for the interchange.',
      'Pair every arrow with a plain-language label, arrow first; set times and platforms in tabular figures.',
    ],
    dont: [
      'Use a brand colour as decoration, text or a background; colour means a route.',
      'Copy real transit marks: roundels, real line letters with their real colours, real maps.',
      'Use the alert yellow for anything but a diverted or delayed state; never hazard stripes or alarm language.',
      'Set tiny type or expressive Swiss-poster headlines; signs are mid-size and read at fifty feet.',
    ],
  },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    coverDisplay: 0.55,
    coverMin: 50,
    principles: [
      ['Colour means a route', 'Each brand colour owns a line and a bullet.'],
      ['Arrow first, then words', 'Every arrow comes with a plain label.'],
      ['Readable from fifty feet', 'Type is large, contrast is high, angles are 0, 45 and 90.'],
    ],
    do: [
      'Give each brand colour a line and a route bullet.',
      'Draw lines only at 0, 45 and 90 degrees.',
      'Pair every arrow with a plain-language label.',
    ],
    dont: [
      'Use colour purely as decoration.',
      'Copy real transit marks or roundels.',
      'Set tiny type; signs read at distance.',
    ],
  },
});
})();
