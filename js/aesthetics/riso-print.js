/* 10 Riso Print — inked, overprinted, human. A risograph has drums, not a colour
   picker: every client colour is snapped to the nearest real RISO ink (Lab distance,
   hue and chroma weighted over lightness; never a grey for a chromatic colour; drums 1
   and 2 hold 3:1 on the stock when their hue family has such an ink) and printed as a
   named drum. Drum 1 (primary) and drum 2 (secondary)
   overprint (multiply on paper, screen on dark stock) and the overlap is the
   third colour, shown as its own swatch. The accent is an optional third drum,
   used tiny. No client hex is printed raw and nothing is printed in a fourth
   ink-black.

   Mechanism.
   - tokens(): drum snap (rzDrums) + the overprint colour + AM-halftone and
     ink-mottle data URIs built with the drum hexes baked in (so no CSS mask).
   - printPrimary(t): the primary is printed as drum 1.
   - headline(ctx, text): two stacked passes of the headline. Pass A prints the
     words in drum 1; pass B (multiply, 0.03em off-register) prints the last word
     in drum 2, shifted to overlap its neighbour so the overlap shows the
     overprint. When drum 1 is too pale to hold a headline on paper, pass B also
     prints the other words, so they read in the overprint colour.
   - art(ctx): one square-cornered sheet with a 3mm unprinted margin and crop
     marks. Drum 1 prints a large AM halftone mass (dot radius driven by a
     field, 15 degree screen); drum 2 prints the brand initial at about 72% of the
     sheet height (merged dots = solid, opening into a visible 75 degree screen
     where the drum starves of ink), 2.5 units off-register with multiply.
     Ink starvation is a falloff of dot size along one axis, never opacity; a few
     paper-coloured pinholes sit in the inked areas. */
(function () {
let seq = 0;

// RISO drum colours (riso-colors / stencil.wiki library values).
const RZ_DRUMS = [
  ['Fluorescent Pink', '#FF48B0'], ['Bubble Gum', '#F984CA'], ['Bright Red', '#F15060'], ['Red', '#FF665E'],
  ['Scarlet', '#F65058'], ['Cranberry', '#D1517A'], ['Burgundy', '#914E72'], ['Orange', '#FF6C2F'],
  ['Fluorescent Orange', '#FF7477'], ['Sunflower', '#FFB511'], ['Yellow', '#FFE800'], ['Light Lime', '#E3ED55'],
  ['Kelly Green', '#67B346'], ['Green', '#00A95C'], ['Grass', '#397E58'], ['Hunter Green', '#407060'],
  ['Teal', '#00838A'], ['Light Teal', '#009DA5'], ['Sea Foam', '#62C2B1'], ['Mint', '#82D8D5'],
  ['Aqua', '#5EC8E5'], ['Cornflower', '#62A8E5'], ['Blue', '#0078BF'], ['Medium Blue', '#3255A4'],
  ['Federal Blue', '#3D5588'], ['Purple', '#765BA7'], ['Violet', '#9D7AD2'], ['Orchid', '#AA60BF'],
  ['Flat Gold', '#BB8B41'], ['Brown', '#925F52'], ['Light Gray', '#88898A'], ['Black', '#000000'],
];

function rzLab(hex) {
  const c = hexToRgb(hex);
  const lin = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const r = lin(c.r), g = lin(c.g), b = lin(c.b);
  const f = v => (v > 0.008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116);
  const x = f((r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047);
  const y = f(r * 0.2126 + g * 0.7152 + b * 0.0722);
  const z = f((r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}
// Nearest ink to a client colour. Hue and chroma count more than lightness (a pale pink
// should print as a pink drum, not as Light Gray), and a chromatic input never snaps to
// Light Gray or Black. With `canvas`, a drum that has to carry headline words (drums 1
// and 2) must also hold 3:1 on the stock: the nearest readable ink of the same hue family
// (within 45 degrees) wins; when that family has no readable ink (a yellow on paper) the
// plain nearest ink is kept and the headline falls back to the overprint (see tokens).
function rzSnap(hex, avoid, canvas, label) {
  const a = rzLab(hex);
  const ca = Math.hypot(a[1], a[2]), ha = Math.atan2(a[2], a[1]);
  const chromatic = ca > 10;
  const pool = RZ_DRUMS.map(([name, h]) => {
    const b = rzLab(h);
    const cb = Math.hypot(b[1], b[2]);
    let dh = Math.abs(ha - Math.atan2(b[2], b[1])); if (dh > Math.PI) dh = 2 * Math.PI - dh;
    const dH = 2 * Math.sqrt(ca * cb) * Math.sin(dh / 2);
    // a more saturated ink is a small step for a chromatic colour (riso inks print at full strength), a duller one is not
    const dC = chromatic && cb > ca ? 0.25 * (cb - ca) : ca - cb;
    return { name, hex: h, c: cb, dh: dh * 180 / Math.PI, d: Math.hypot(0.5 * (a[0] - b[0]), dC, 1.5 * dH) };
  }).filter(k => !(avoid && avoid.includes(k.hex)) && !(chromatic && k.c < 10));
  const near = list => list.reduce((m, k) => (!m || k.d < m.d ? k : m), null);
  let best = near(pool);
  if (canvas) {
    // drum 1 also carries the CTA label, so its own text colour must hold 4.5:1 on it
    const fits = k => contrastRatio(k.hex, canvas) >= 3 && (!chromatic || k.dh <= 45) &&
      (!label || contrastRatio(pickReadableText(k.hex), k.hex) >= 4.5);
    const ok = near(pool.filter(fits));
    if (ok) best = ok;
  }
  return { name: best.name, hex: best.hex };
}
const rzHex = (r, g, b) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
// two drums on paper: multiply (light stock) or screen (dark stock)
function rzOver(h1, h2, dark) {
  const a = hexToRgb(h1), b = hexToRgb(h2);
  if (dark) return rzHex(255 - (255 - a.r) * (255 - b.r) / 255, 255 - (255 - a.g) * (255 - b.g) / 255, 255 - (255 - a.b) * (255 - b.b) / 255);
  return rzHex(a.r * b.r / 255, a.g * b.g / 255, a.b * b.b / 255);
}
// drum 1 = primary, drum 2 = secondary (never the same drum), drum 3 = accent (optional, tiny)
function rzDrums(t) {
  const d1 = rzSnap(t.primary, null, t.canvas, true);
  const d2 = rzSnap(t.secondary, [d1.hex], t.canvas);
  const d3 = rzSnap(t.accent, [d1.hex, d2.hex]);
  return { d1, d2, d3, ov: rzOver(d1.hex, d2.hex, t.isDark) };
}
const rzUri = svg => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
const rzH = (i, j, s) => { const v = Math.sin(i * 127.1 + j * 311.7 + s * 74.7) * 43758.5453; return v - Math.floor(v); };

// AM halftone on a rotated lattice: radius from the tone field f(x, y) in 0..1 (area follows tone)
function rzAm(o) {
  const { pitch, angle, x0, y0, x1, y1, f, rmin, rmax } = o;
  const a = angle * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const R = Math.hypot(x1 - x0, y1 - y0) / 2 + pitch;
  const n = Math.ceil(R / pitch);
  let out = '';
  for (let v = -n; v <= n; v++) {
    for (let u = -n; u <= n; u++) {
      const x = cx + u * pitch * ca - v * pitch * sa, y = cy + u * pitch * sa + v * pitch * ca;
      if (x < x0 || x > x1 || y < y0 || y > y1) continue;
      const tone = f(x, y);
      if (tone < 0.03) continue;
      const r = rmin + (rmax - rmin) * Math.sqrt(Math.min(1, tone));
      out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}"/>`;
    }
  }
  return out;
}

registerAesthetic({
  key: 'riso-print', order: 10,
  name: 'Riso Print',
  descriptor: 'Inked · Overprinted · Human',
  influences: 'Risograph studios / Two-drum zines / Screen print',
  summary: 'Two named riso drums on warm uncoated paper; where they overlap, a third colour appears.',
  motto: 'Printed by people.',
  kicker: 'Two drums, three colours',
  mode: 'light',
  slideShape: 'minimal',
  labels: { material: 'Ink', states: ['Rest', 'Drift', 'Registered'], statesKind: 'button' },
  layout: { hero: 'scene', palette: 'swatches', sections: 'two-col', subcopy: true },
  type: { ui: 'sans', label: 'mono', display: 1 },
  highlight: 'custom',
  highlightNote: 'The headline is printed in drum 1; the last word is printed in drum 2, multiplied over the paper and shifted about 0.08em into its neighbour, so where the two drums overlap the third (overprint) colour appears. No ring, no fill, no shadow.',
  cardFill: '--ab-paper-card',

  roles: {
    canvas: {
      use: 'The paper: warm uncoated stock (about #F5F2E9) that stays flat and clean; texture lives only inside inked areas',
      never: 'Text, an all-over noise texture, a pure-white card that breaks the paper',
    },
    primary: {
      use: 'Drum 1: the client primary snapped to the nearest RISO ink and named (for example "Riso Orange"). The headline, the halftone mass in the art, the one CTA block, the selected segment and the "on" switch',
      never: 'Body text, a second CTA, smooth gradients, the raw client hex',
    },
    secondary: {
      use: 'Drum 2: the client secondary snapped to the nearest RISO ink, never the same drum as drum 1. The brand initial in the art, the last headline word and the misregistered second layer behind the CTA and switch',
      never: 'The main CTA, body text, page background',
      coverage: '≈10–15%',
    },
    accent: {
      use: 'An optional third drum (snapped and named), used tiny: the footer dot and one stamp',
      never: 'Buttons, body text, borders, large fills, a hand-drawn ring',
      coverage: '≤3%',
    },
  },

  // Light canvases are warmed toward cream so the board reads as uncoated paper.
  canvas(b) { return b.isDark ? null : b.mix('#f0dfba', b.canvas, 0.14); },

  // The primary is printed as drum 1 (the palette still shows the client hex, with "prints as").
  printPrimary(t) { return rzDrums(t).d1.hex; },

  // Two passes of the headline: drum 1, then drum 2 off-register with multiply.
  headline(ctx, text) {
    const e = escapeHtml;
    const words = String(text || '').trim().split(/\s+/).filter(Boolean);
    if (!words.length) return '';
    const last = words.pop();
    const rest = words.length ? `${words.map(e).join(' ')} ` : '';
    const pass = cls => `<span class="${cls}">${rest}<span class="rzh-w">${e(last)}</span></span>`;
    return `<span class="rzh">${pass('rzh-a')}${pass('rzh-b')}</span>`;
  },

  tokens(t, st) {
    const S = st || (typeof state !== 'undefined' ? state : null) || {};
    const D = rzDrums(t);
    const d = t.isDark;
    const paper = d ? t.mix(t.ink, t.canvas, 0.05) : t.mix('#ffffff', t.canvas, 0.35);
    // A drum that cannot hold 3:1 on the stock (only when its hue family has no readable ink, e.g. a yellow
    // on paper) does not print headline words alone: a pale drum 1 gets pass B over its words (they read in
    // the overprint), a pale drum 2 gets pass A under the last word.
    const pale = t.contrast(D.d1.hex, t.canvas) < 3;
    const pale2 = t.contrast(D.d2.hex, t.canvas) < 3;
    const paperRgb = hexToRgb(t.canvas);
    // ink mottle: low-frequency density loss + sparse pinholes, drawn in paper colour (invisible on paper, so it
    // only ever shows inside inked areas)
    const pr = (paperRgb.r / 255).toFixed(3), pg = (paperRgb.g / 255).toFixed(3), pb = (paperRgb.b / 255).toFixed(3);
    // `ma`, `mb`: the mottle's alpha slope and offset (a lighter mottle sits under the CTA label)
    const mot = (ma, mb) => rzUri(`<svg xmlns="http://www.w3.org/2000/svg" width="260" height="260"><filter id="m" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="4" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 ${pr}  0 0 0 0 ${pg}  0 0 0 0 ${pb}  ${ma} 0 0 0 ${mb}"/></filter><filter id="p" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="1" seed="11" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 ${pr}  0 0 0 0 ${pg}  0 0 0 0 ${pb}  -40 0 0 0 9.4"/></filter><rect width="100%" height="100%" filter="url(#m)"/><rect width="100%" height="100%" filter="url(#p)"/></svg>`);
    const mottle = mot('.46', '-.17');
    // AM ramp for progress bars: dots grow from 15% to solid along the bar (drum 1)
    let ramp = '';
    for (let i = 0; i < 40; i++) for (let j = 0; j < 3; j++) {
      const tone = (i + 0.5) / 40;
      ramp += `<circle cx="${(i * 5 + 2.5 + (j % 2) * 2.5).toFixed(1)}" cy="${(j * 4 + 2).toFixed(1)}" r="${(0.5 + 2.9 * Math.sqrt(tone)).toFixed(2)}"/>`;
    }
    const am1 = rzUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 12" preserveAspectRatio="none" width="200" height="12"><g fill="${D.d1.hex}">${ramp}</g></svg>`);
    return {
      '--ab-blend': d ? 'screen' : 'multiply',
      '--rz-hw': abWeight(S.headingFont, 800),
      '--rz-bw': abWeight(S.bodyFont, 700),
      '--ab-paper-card': paper,
      '--rz-sub': t.mix(t.ink, paper, 0.78),
      '--ab-secondary': D.d2.hex, '--ab-on-secondary': t.readable(D.d2.hex),
      '--ab-sec-tint': t.mix(D.d2.hex, t.canvas, 0.16),
      '--ab-accent': D.d3.hex, '--ab-on-accent': t.readable(D.d3.hex),
      '--rz-d1': D.d1.hex, '--rz-d2': D.d2.hex, '--rz-d3': D.d3.hex, '--rz-ov': D.ov,
      '--rz-n1': `" · ${D.d1.name.toUpperCase()} · DRUM 1"`,
      '--rz-n2': `" · ${D.d2.name.toUpperCase()} · DRUM 2"`,
      '--rz-n3': `" · ${D.d3.name.toUpperCase()} · DRUM 3"`,
      '--rz-h2': `"prints as ${D.d2.hex.toUpperCase()}"`,
      '--rz-h3': `"prints as ${D.d3.hex.toUpperCase()}"`,
      '--rz-ovl': `"OVERPRINT 1×2\\A ${D.d1.name.toUpperCase()} × ${D.d2.name.toUpperCase()}\\A ${D.ov.toUpperCase()}"`,
      '--rz-hb': pale ? D.d2.hex : 'transparent',
      '--rz-wa': pale2 ? D.d1.hex : 'transparent',
      '--rz-mottle': mottle,
      '--rz-mottle-lt': mot('.3', '-.16'),
      '--rz-am1': am1,
    };
  },

  // One sheet, two drums: a drum-1 halftone mass and the brand initial in drum 2, off-register.
  art(ctx) {
    const t = ctx.t;
    const D = rzDrums(t);
    const id = 'rz' + (++seq);
    const W = 400, H = 200, M = 9;            // 3mm unprinted margin at this scale
    const sm = (a, b, x) => { const k = Math.max(0, Math.min(1, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
    // drum 1: a sun-like mass top right, starving of ink toward the left edge (dot size falls along x)
    const f1 = (x, y) => {
      const dd = Math.hypot((x - 312) / 1.15, y - 64);
      const mass = Math.pow(Math.max(0, 1 - dd / 158), 1.25);
      const wave = 0.07 * Math.sin(x / 23 + y / 31);
      const starve = 0.35 + 0.65 * sm(30, 330, x);
      return Math.max(0, (mass + wave * mass) * starve);
    };
    const dots1 = rzAm({ pitch: 4.4, angle: 15, x0: M, y0: M, x1: W - M, y1: H - M, f: f1, rmin: 0.25, rmax: 2.5 });
    // drum 2: the initial; dots merge to solid (r >= 0.71 pitch) and open to a screen toward the starved bottom
    const f2 = (x, y) => 1 - 0.62 * sm(118, 196, y);
    const dots2 = rzAm({ pitch: 3.9, angle: 75, x0: 168, y0: 6, x1: 396, y1: H - M, f: f2, rmin: 0.4, rmax: 2.95 });
    // pinholes: paper showing through the ink, ~1-2% of the inked area
    let pins = '';
    for (let k = 0; k < 46; k++) {
      const x = 190 + rzH(k, 1, 3) * 196, y = 14 + rzH(k, 2, 5) * 150;
      if (f1(x, y) < 0.45 && (x < 210 || x > 372)) continue;
      pins += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.35 + rzH(k, 3, 7) * 0.55).toFixed(2)}"/>`;
    }
    const ini = escapeHtml(ctx.initial);
    const crop = (x, y, sx, sy) => `<path d="M${x} ${y + sy * 2}V${y + sy * 7}M${x + sx * 2} ${y}H${x + sx * 7}" />`;
    const blend = 'style="mix-blend-mode:var(--ab-blend,multiply)"';
    return `<div class="rza"><svg viewBox="0 0 ${W} ${H}" width="100%" height="100%" preserveAspectRatio="xMaxYMid slice" focusable="false">
      <defs><clipPath id="${id}c"><text x="298" y="${H - M - 6}" text-anchor="middle" font-size="206" style="font-family:var(--ab-font-h);font-weight:var(--rz-hw,700)">${ini}</text></clipPath></defs>
      <g fill="${D.d1.hex}" ${blend}>${dots1}</g>
      <g ${blend} transform="translate(2.6 1.9)"><g clip-path="url(#${id}c)" fill="${D.d2.hex}">${dots2}</g></g>
      <g fill="var(--ab-paper-card)">${pins}</g>
      <g fill="none" stroke="var(--ab-ink)" stroke-width=".5" opacity=".55">${crop(M, M, -1, -1)}${crop(W - M, M, 1, -1)}${crop(M, H - M, -1, 1)}${crop(W - M, H - M, 1, 1)}</g>
      <text x="${W - M - 2}" y="${H - 3}" text-anchor="end" font-size="5.2" letter-spacing=".5" fill="var(--ab-ink)" style="font-family:var(--ab-font-label,ui-monospace,monospace)">FIG. 01 · DRUM 1 ${escapeHtml(D.d1.name.toUpperCase())} + DRUM 2 ${escapeHtml(D.d2.name.toUpperCase())} · OVERPRINT</text>
    </svg></div>`;
  },

  materials: [
    { name: 'Drum', css: 'background: {primary}; /* a named RISO ink (the client colour snapped to the nearest drum of the same hue family that holds 3:1 on the stock); two drums per job, a third only for a tiny spot */' },
    { name: 'Overprint', css: 'background: {secondary}; mix-blend-mode: multiply; /* drum 2 printed over drum 1; the overlap is the third colour (shown as the OVERPRINT 1×2 swatch) */' },
    { name: 'Misregistration', css: 'transform: translate(3px, 2px); /* the second drum lands 2–3px off, the same everywhere: a second filled layer, never an outline */' },
    { name: 'AM halftone', css: 'circle r = rmin + (rmax − rmin) × √tone; /* dot size carries the shade on a fixed pitch; drum 1 at 15°, drum 2 at 75° */' },
    { name: 'Ink starvation', css: 'dot radius × (0.35 → 1) across one axis; /* density falls off as the drum runs dry, never as opacity */' },
    { name: 'Ink mottle + pinholes', css: 'background: url(mottle.svg), {primary}; /* low-frequency density loss and 1–2% paper pinholes, inside inked areas only; the paper stays flat */' },
    { name: 'Sheet', css: 'background: {paperCard}; border-radius: 0; box-shadow: none; /* square corners, 3mm unprinted margin, crop marks; printed paper casts no shadow */' },
  ],

  rules: {
    do: [
      'Print with two named drums (the client colours snapped to the nearest RISO inks); show their overprint as the third colour.',
      'Misregister the second drum 2–3px as a second filled layer, the same offset everywhere.',
      'Shade with AM halftone: dot size changes on a fixed pitch, a different screen angle per drum.',
      'Keep texture inside the ink: low-frequency mottle, ink starvation and a few pinholes; the paper stays clean.',
      'Keep every edge square: printed paper has no radius and casts no shadow.',
    ],
    dont: [
      'Print raw client hexes or a fourth black ink; colour comes from the drum list.',
      'Use gradients, blur, rounded cards, pills or offset drop shadows.',
      'Lay noise over the whole page, paper included.',
      'Draw a hand-drawn ring or highlighter; emphasis is a second drum overprinting the first.',
    ],
  },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    principles: [
      ['Two drums, three colours', 'Named riso inks overprint into a third.'],
      ['Off-register on purpose', 'The second drum lands 2 to 3px off, the same everywhere.'],
      ['Dots, never gradients', 'Dot size carries the shade; every edge is square.'],
    ],
    do: [
      'Print with two named drums.',
      'Misregister the second drum consistently.',
      'Shade with AM halftone dots.',
    ],
    dont: [
      'Use raw hexes or a fourth black.',
      'Round corners or add shadows.',
      'Lay grain over the paper.',
    ],
  },
});
})();
