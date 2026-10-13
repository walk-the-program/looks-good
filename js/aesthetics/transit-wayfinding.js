/* 43 Transit Wayfinding — Directional, Coded, Calm, minimal. The interface behaves like a station
   (Vignelli's NYC subway signage, SBB and Swiss rail, Heathrow wayfinding, Kinneir & Calvert).

   Mechanism. Everything that speaks is a SIGN: a #000 panel with white mixed-case type and 4px
   corners, on a plain concourse ground (#16181A dark, a pale grey light). The hero is one sign
   band; the map is a second sign with a single strip on top. Colour is rationed to meaning: the
   three client colours are ROUTES and appear only as line strokes and route bullets (circles
   carrying a letter taken from the brand name, M / A / R for "Marigold"; the express route is a
   diamond). Each route colour is tinted until it holds 3:1 on black (bullets, lines) and, in
   light mode, shaded until it holds 3:1 on the white map paper. One fixed alert yellow (#FFC72C,
   black text) is the only other colour and only means "Diverted". One arrow: straight, 0 degrees.
   Headline: def.headline puts that arrow in front of the words, arrow first, and the destination
   word carries a route line under it in route 1's colour. Hero art: a two-route octilinear map
   (0/45/90 degrees, rounded turns, a few station ticks, one white interchange disc named after the
   brand), under a sign strip with the three route bullets. No river, park, legend or decoration. */
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
// The brand name of the rendered state (the tokens hook's second argument); the content
// default when it is blank.
function twBrandName(st) {
  const v = st && st.content && st.content.brandName;
  if (typeof v === 'string' && v.trim()) return v;
  try { if (typeof effectiveContent === 'function') return effectiveContent().brandName; } catch (err) { /* fall through */ }
  return 'Brand';
}

// A middle dot set in a neutral sans: the heading face's own U+00B7 (Overpass) has a wide left
// and no right side-bearing, so "A · B" reads "A ·B".
const TW_SEP = '<span class="tw-sep" aria-hidden="true">·</span>';

// The brand name cut to whole words that fit `units` of map width at `px` (estimated at 0.6em a
// character, bold); a single word that is still too long is cut with an ellipsis.
function twFitName(name, units, px) {
  const max = Math.max(4, Math.floor(units / (px * 0.6)));
  const s = String(name || '').trim();
  if (s.length <= max) return s;
  const words = s.split(/\s+/);
  let out = '';
  for (const w of words) { const next = out ? out + ' ' + w : w; if (next.length > max) break; out = next; }
  return out || s.slice(0, max - 1) + '…';
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

// The one arrow, on a 10-unit grid: 1.6-unit shaft, 45-degree head. dir = rotation in degrees (0 = east).
function twArrow(dir, cls) {
  return `<svg class="${cls || 'tw-arrow'}" viewBox="0 0 10 10" aria-hidden="true" focusable="false"><g transform="rotate(${dir} 5 5)" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square" stroke-linejoin="miter"><path d="M1.2 5H8.2M5.2 1.8 8.4 5 5.2 8.2"/></g></svg>`;
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
  influences: 'Vignelli NYC subway / SBB Swiss rail / Heathrow wayfinding / Kinneir & Calvert',
  summary: 'Black sign panels and white type where every brand colour is a route and one yellow means alert.',
  motto: 'Colour means a route.',
  kicker: 'Next stop',
  mode: 'dark',
  slideShape: 'minimal',
  labels: { material: 'Lines', states: ['Scheduled', 'Approaching', 'Diverted'], statesKind: 'button' },
  // a concourse leads with the departures list: 03 In use first, then the components
  layout: { hero: 'centered', palette: 'swatches', sections: 'two-col', sectionOrder: ['use', 'ui', 'touch'] },
  type: { ui: 'heading', label: 'heading', display: 0.78 },
  highlight: 'custom',
  highlightNote: 'The destination word stays white on the black sign and gets a route line under it (route 1 colour, 0.09em thick, square ends), never a colour change or a highlighter band; the straight arrow always stands in front of the headline.',
  cardFill: '--ab-sign',

  roles: {
    canvas: {
      job: 'Concourse',
      use: 'The plain ground the signs hang on: #16181A in dark mode, a pale grey in light mode. Fixed, never a client tint',
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

  tokens(t, st) {
    const S = st || (typeof state !== 'undefined' ? state : null) || {};
    const R = twRoutes(t);
    const L = twLetters(twBrandName(S));
    const vars = {
      '--ab-type-pick-w': 400,   // secondary picks; the lead pick is set at 800 in the css (every lead pick has 800)
      '--tw-hw': abWeight(S.headingFont, 800),
      '--tw-mw': abWeight(S.headingFont, 600),
      '--ab-sign': TW_SIGN,
      '--ab-alert': TW_ALERT,
      '--ab-rail': TW_GREY,
      '--tw-paper': t.isDark ? TW_SIGN : '#FFFFFF',
      '--ab-art-ratio': '16 / 7.4',
      '--ab-art-ratio-narrow': '10 / 11',
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
    return `<span class="tw-h">${twArrow(0, 'tw-arw')}<span class="tw-t">${body}</span></span>`;
  },

  art(ctx) {
    const t = ctx.t;
    const e = escapeHtml;
    const R = twRoutes(t);
    const L = twLetters(ctx.brandName);
    const dark = t.isDark;
    const paper = dark ? TW_SIGN : '#FFFFFF';
    const lbl = dark ? '#FFFFFF' : '#111111';
    const name = String(ctx.brandName || '').trim();
    const id = 'tw' + (++twSeq);
    const W = 10; // line width
    // Two routes on a 0/45/90 grid, meeting at one interchange (360, 150).
    const lines = [
      { r: R[0], pts: [[70, 150], [560, 150], [650, 240]] },
      { r: R[1], pts: [[360, 40], [360, 150], [260, 250]] },
    ];
    const stroke = lines.map(l => `<path d="${twPath(l.pts, 30)}" stroke="${l.r.g}"/>`).join('');
    // stations: [x, y, line, tick dir (dx,dy), label, anchor, lx, ly]
    const st = [
      [150, 150, 0, [0, -1], 'Mill Lane', 'middle', 150, 126],
      [250, 150, 0, [0, -1], 'Market', 'middle', 250, 126],
      [470, 150, 0, [0, -1], 'Archive', 'middle', 470, 126],
      [360, 92, 1, [1, 0], 'Library', 'start', 378, 97],
      [300, 210, 1, [-1, -1], 'Old Quay', 'end', 284, 196],
    ];
    const ticks = st.map(s => {
      const [x, y, li, [dx, dy]] = s;
      const n = Math.hypot(dx, dy);
      const ux = dx / n, uy = dy / n;
      return `<path d="M${x} ${y}L${(x + ux * 11).toFixed(1)} ${(y + uy * 11).toFixed(1)}" stroke="${lines[li].r.g}" stroke-width="5" stroke-linecap="butt"/>`;
    }).join('');
    // A label is drawn only where it fits whole inside the variant's view box (x0..x1): with
    // preserveAspectRatio meet the whole box is always shown, so no label is ever cut to a fragment.
    const span = s => { const w = s[4].length * 7.4; return s[5] === 'middle' ? [s[6] - w / 2, s[6] + w / 2] : s[5] === 'end' ? [s[6] - w, s[6]] : [s[6], s[6] + w]; };
    const labels = (x0, x1) => st.filter(s => { const [a, b] = span(s); return a >= x0 + 2 && b <= x1 - 2; })
      .map(s => `<text x="${s[6]}" y="${s[7]}" text-anchor="${s[5]}" class="twa-st" font-size="12.5" font-weight="600">${s[4]}</text>`).join('');
    const hub = x1 => `<text x="386" y="184" class="twa-hub" font-size="16" font-weight="800" fill="${lbl}">${e(twFitName(name, Math.min(x1, 600) - 386 - 6, 16))}</text>`;
    // terminus bullets: route 1 at both ends of its line, route 2 at both ends of its branch
    const term = [[lines[0].pts[0], 0], [lines[0].pts[2], 0], [lines[1].pts[0], 1], [lines[1].pts[2], 1]];
    const bul = term.map(([[x, y], i]) => {
      const r = R[i];
      return `<circle cx="${x}" cy="${y}" r="16" fill="${r.b}" stroke="${paper}" stroke-width="3"/><text x="${x}" y="${y + 6}" text-anchor="middle" class="twa-bl" font-size="16" font-weight="800" fill="${r.ob}">${e(L[i])}</text>`;
    }).join('');
    // wide view box 0..720, narrow 200..540 (the interchange and its nearest stations)
    const map = `<svg class="twa-map twa-map--w" viewBox="0 0 720 300" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"><g id="${id}-m">
      <rect x="-2000" y="-1000" width="4720" height="2300" fill="${paper}"/>
      <g fill="none" stroke-width="${W}" stroke-linecap="round" stroke-linejoin="round">${stroke}</g>
      <g>${ticks}</g>
      <circle cx="360" cy="150" r="16" fill="#FFFFFF" stroke="#111111" stroke-width="5"/>
      ${bul}
    </g>
      <g fill="${lbl}" class="twa-lb">${labels(0, 720)}</g>${hub(720)}
    </svg><svg class="twa-map twa-map--n" viewBox="200 20 340 260" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"><use href="#${id}-m"/>
      <g fill="${lbl}" class="twa-lb">${labels(200, 540)}</g>${hub(540)}
    </svg>`;
    return `<div class="twa" data-dark="${dark ? 1 : 0}">
      <div class="twa-sign">
        <span class="twa-buls">${L.map((l, i) => twBullet(l, R[i], i)).join('')}</span>
        <span class="twa-dest"><b>${e(twFitName(name, 211, 22))} network</b></span>
        <span class="twa-dir">${twArrow(0, 'tw-arrow')}<b>All lines</b></span>
      </div>
      <div class="twa-mapbox">${map}</div>
    </div>`;
  },

  // 03 as a departures list: route bullet (a letter from the brand name), destination,
  // platform + status, line progress with the current station as a ring, percent.
  panels: {
    list(ctx) {
      const e = ctx.e;
      const R = twRoutes(ctx.t);
      const L = twLetters(ctx.brandName);
      const rows = (ctx.rows || []).slice(0, 3).map((r, i) => `<li class="ab-row" style="--tw-c:${R[i].b};--tw-o:${R[i].ob}">
          <span class="ab-row-n tw-rn${i === 2 ? ' tw-rn--x' : ''}"><i>${e(L[i])}</i></span>
          <span class="ab-row-name">${e(r[0])}</span>
          <span class="ab-row-status"><b>Plat ${i + 1}</b> ${TW_SEP} ${e(r[1])}</span>
          <span class="ab-row-bar" aria-hidden="true"><i style="width:${Number(r[2]) || 0}%"></i></span>
          <span class="ab-row-pct">${Number(r[2]) || 0}%</span>
        </li>`).join('');
      return `<ul class="ab-list tw-dep">${rows}<li class="tw-dfoot">Departures · updated every 30 s</li></ul>`;
    },
  },

  materials: [
    { name: 'Sign panel', css: 'background: {sign}; color: #FFFFFF; border-radius: 4px; /* black panel, white mixed-case type at 600-800; never a client colour */' },
    { name: 'Route line', css: 'stroke: {route1}; stroke-width: 10px; stroke-linecap: round; stroke-linejoin: round; /* 0, 45 and 90 degrees only; 45-degree turns rounded; stations are line-colour ticks, the interchange a white disc; two or three routes */' },
    { name: 'Route bullet', css: 'background: {route1}; color: {onPrimary}; border-radius: 50%; width: 28px; height: 28px; font-weight: 800; /* a letter from the brand name (M, A, R); the express route (route 3) is a diamond; text white when it holds 4.5:1, else black */' },
    { name: 'Alert panel', css: 'background: {alert}; color: #000000; border-radius: 4px; font-weight: 800; /* the ONE alert colour, fixed yellow #FFC72C; only for Diverted / delayed, never decoration */' },
    { name: 'Platform tab', css: 'border: 2px solid #FFFFFF; color: #FFFFFF; width: 28px; height: 28px; font-weight: 800; font-variant-numeric: tabular-nums; /* numbers in squares; the selected platform is a white square with a black number */' },
    { name: 'Rail toggle', css: 'background: linear-gradient({rail}, {rail}) center / 100% 3px no-repeat; /* a single line; the knob is a round dot that travels; on = the line and knob in the route colour */' },
    { name: 'Concourse', css: 'background: {canvas}; /* #16181A dark or pale grey light; the signs hang on it, nothing coloured sits on it directly */' },
  ],

  rules: {
    do: [
      'Put every message on a sign: a #000 panel, white mixed-case type at 600-800 weight, 4px corners.',
      'Give each brand colour a route: a line and a bullet carrying a letter from the brand name; the third route is the express with a diamond bullet.',
      'Draw diagrams at 0, 45 and 90 degrees only, with rounded turns, line-colour ticks for stations and a white disc for the interchange.',
      'Use one straight arrow and pair it with a plain-language label; set times and platforms in tabular figures.',
    ],
    dont: [
      'Use a brand colour as decoration, text or a background; colour means a route.',
      'Copy real transit marks: roundels, real line letters with their real colours, real maps.',
      'Use the alert yellow for anything but a diverted or delayed state; never hazard stripes or alarm language.',
      'Set tiny type or add extra rules, badges and ornament; signs are mid-size and read at fifty feet.',
    ],
  },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    coverDisplay: 0.55,
    coverMin: 50,
    principles: [
      ['Colour means a route', 'Each brand colour owns a line and a bullet.'],
      ['One arrow, plain words', 'Every arrow comes with a plain label.'],
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
