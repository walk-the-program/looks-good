/* 23 Micrographics — tiny, technical, LOUD. Reference: The Designers Republic (Wipeout
   packaging, label stacks, sticker logic), Teenage Engineering OP-1 silkscreen, Acronym
   hazard labels, streetwear spec sheets: one huge element ringed by tiny type, 80:1.
   Round 6: the brand glyph is the one huge element (full plate width, ~78% of its
   height); the spec table, the QR block and a hazard tape sit OVER the glyph as
   canvas-backed stickers; leaders are orthogonal (one horizontal run, one vertical drop)
   and every label knocks out what is behind it; a fixed safety colour (not the brand)
   marks the caution triangle and the hazard tape. Original notes follow.
   One huge element is ringed by clusters of tiny type: 7-9px mono labels,
   index numbers, registration marks, crosshairs, tiny barcodes, a QR-like block,
   warning glyphs, coordinate pairs, version strings, arrows and hairline
   rulers. The contrast of scale IS the aesthetic: a giant tight headline and a
   giant brand glyph against microtype at 8px with generous tracking.
   The hero art is a spec plate: left, a spec table built from the brand's real
   data (heading face, body face, ink and role hexes); centre, the brand initial
   as a solid glyph with an offset hairline duplicate on a 10-unit module grid and
   eight callouts (index, label, true x/y read from the plate); right, a QR-like
   block seeded by the brand name, a caution glyph, version, coordinates and a
   barcode; rulers on the top and bottom edges and four corner labels. Roughly
   thirty micro annotations in all. One accent in tiny marks: primary appears as
   a few 3px registration marks and the single CTA. */
(function () {
const MG_HASH = str => { let h = 2166136261; for (const c of String(str)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
function mgRand(seed) { let s = seed || 1; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }

// QR-like block: 3 finder squares and a seeded body, as one path of unit squares
function mgQr(seed, n) {
  const r = mgRand(seed);
  const on = Array.from({ length: n }, () => Array(n).fill(false));
  const finder = (ox, oy) => { for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) on[oy + y][ox + x] = (x === 0 || y === 0 || x === 6 || y === 6) || (x >= 2 && x <= 4 && y >= 2 && y <= 4); };
  finder(0, 0); finder(n - 7, 0); finder(0, n - 7);
  const reserved = (x, y) => (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!reserved(x, y)) on[y][x] = r() > 0.52;
  let d = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (on[y][x]) d += `M${x} ${y}h1v1h-1z`;
  return d;
}

function mgBars(seed, count) {
  const r = mgRand(seed);
  let x = 0, d = '';
  for (let i = 0; i < count; i++) {
    const w = 1 + Math.floor(r() * 3);
    if (i % 2 === 0) d += `M${x} 0h${w}v10h-${w}z`;
    x += w;
  }
  return { d, w: x };
}


registerAesthetic({
  key: 'micrographics', order: 23,
  name: 'Micrographics',
  descriptor: 'Tiny · Technical · Loud',
  influences: 'The Designers Republic / Teenage Engineering silkscreen / Techwear spec labels',
  summary: 'One giant brand glyph with spec stickers on it, ringed by 8px mono labels, orthogonal leaders and one hazard mark.',
  motto: 'Small print, large idea.',
  kicker: 'SPEC 01/26',
  mode: 'light',
  slideShape: 'minimal',
  labels: { material: 'Detail', states: ['Base', 'Annotated', 'Marked'], statesKind: 'swatch' },
  layout: { hero: 'centered', palette: 'swatches', sections: 'two-col' },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    coverDisplay: 0.7,
    // Material slide: the four listed materials drawn at scale, each in a hairline cell that
    // carries its own three micro corner labels; one giant crosshair is the slide's huge element.
    materialArt(ctx) {
      const t = ctx.t;
      const cell = (n, k, code, body) => `<div class="mgm-cell mgm-${k}"><span class="mgm-i">A.0${n}</span><span class="mgm-c">${code}</span>${body}<span class="mgm-p">P.0${n}/04</span></div>`;
      const hair = `<div class="mgm-rules"><i class="is-1"></i><i class="is-2"></i><i class="is-3"></i></div><p class="mgm-cap"><b>HAIRLINE</b> 1PX ${t.ink.toUpperCase()} · 100 / 50 / 20%</p>`;
      const micro = `<p class="mgm-spec">ABCDEFGHIJKLM<br>NOPQRSTUVWXYZ<br>0123456789 →↑×</p><p class="mgm-cap"><b>MICROTYPE</b> 8PX MONO · .16EM · CAPS</p>`;
      const corner = `<div class="mgm-box"><span>A.01</span><span>MG–0412–C</span><span>P.02/04</span></div><p class="mgm-cap"><b>CORNER LABELS</b> INDEX · CODE · PAGE</p>`;
      const cross = `<div class="mgm-xs"><i class="mgm-x is-big is-p"></i><i class="mgm-x"></i><i class="mgm-x is-p"></i></div><p class="mgm-cap"><b>CROSSHAIR</b> 9PX · ${t.primary.toUpperCase()} 3PX CORE</p>`;
      return `<div class="mgm">${cell(1, 'hair', 'MG–0412–A', hair)}${cell(2, 'micro', 'MG–0412–B', micro)}${cell(3, 'corner', 'MG–0412–C', corner)}${cell(4, 'cross', 'MG–0412–D', cross)}</div>`;
    },
    principles: [
      ['One huge element', 'The brand glyph, fifty times the microtype.'],
      ['Stickers on the object', 'Spec table, QR and hazard tape laid over it.'],
      ['Orthogonal leaders', 'One horizontal run, one vertical drop, knocked out.'],
    ],
    do: [
      'Make one element huge.',
      'Give every panel three micro labels.',
      'Draw with 1px hairlines.',
    ],
    dont: [
      'Add glow, gradients or shadows.',
      'Set microtype in a proportional face.',
      'Draw leaders at an angle.',
    ],
  },
  type: { ui: 'mono', label: 'mono', display: 1 },
  highlight: 'custom',
  highlightNote: 'The word stays in ink like the rest of the (48px) headline, followed by a tiny mono footnote reference "(01)" raised at its top right; no colour, no fill, no underline. The giant element is the brand glyph, not the headline.',

  roles: {
    canvas: {
      use: 'The clean light sheet; panels are hairline boxes on it, never filled planes',
      never: 'Text, tinted cards, or a textured background',
      coverage: '70–75%',
    },
    ink: {
      use: 'The giant headline and glyph, every hairline, rule, tick and registration mark, and all microtype',
      never: 'Large tinted fields; ink is line and type, not a plane',
      coverage: '20–25%',
    },
    primary: {
      use: 'Tiny marks (3 to 5px registration squares, the selected-tab marker, the on-switch dot) and the one solid main action',
      never: 'Headline, glyph, large fills, body text, a second solid button',
      coverage: '≈3–5%',
    },
    secondary: {
      use: 'Quiet support: one finder square in the QR block and a role square in the spec table',
      never: 'The main action, body text, headline',
      coverage: '≈3–5%',
    },
    accent: {
      use: 'Palette only. The highlight word is ink; the one loud mark is the fixed safety colour (#FF4A1C light / #FFE500 dark), which is not a brand role',
      never: 'Headline words, marks, buttons, borders, fills, microtype',
      coverage: '≤1%',
    },
  },

  tokens(t, st) {
    const v = st || (typeof state !== 'undefined' ? state : null);
    return {
      '--ab-type-pick-w': 400,
      // the heading face's heaviest weight up to 700 (Archivo Black: its one 400)
      '--ab-hw': abWeight(v && v.headingFont, 700),
      '--ab-hair': t.alpha(t.ink, 0.5),
      '--ab-hair-soft': t.alpha(t.ink, 0.2),
      '--ab-hair-faint': t.alpha(t.ink, 0.1),
      // the fixed safety colour: hazard orange on light, TDR yellow on dark; never a brand role
      '--ab-mg-safe': t.isDark ? '#FFE500' : '#FF4A1C',
      // real data for the micro line on every section rule
      '--mg-d-a': `"MG–0412–A · ${t.primary.toUpperCase()} · 8PX GRID · P.03/04"`,
      '--mg-d-b': `"MG–0412–B · ${t.ink.toUpperCase()} · 1PX HAIR · P.03/04"`,
      '--mg-d-c': `"MG–0412–C · ${t.canvas.toUpperCase()} · 3 ROWS · P.04/04"`,
    };
  },

  art(ctx) {
    const t = ctx.t;
    const st = ctx.state || {};
    const brand = String(ctx.brandName || 'BRAND').toUpperCase().replace(/[^A-Z0-9 .&-]/g, '').slice(0, 20) || 'BRAND';
    const seed = MG_HASH(ctx.brandName || 'brand');
    const qrN = 21;
    const bars = mgBars(seed ^ 0x9e3779b1, 46);
    const hName = escapeHtml(((st.headingFont && st.headingFont.name) || 'Heading').slice(0, 18));
    const bName = escapeHtml(((st.bodyFont && st.bodyFont.name) || 'Body').slice(0, 18));
    const hex = c => c.replace('#', '').toUpperCase();
    const vf = 'vector-effect="non-scaling-stroke"';
    const safe = t.isDark ? '#FFE500' : '#FF4A1C';

    // Metric guides (plate %): cap line y10, baseline y88, the glyph's measured ink edges, centre (50,50).
    // Callouts: label centre (x,y), marker (tx,ty). The leader runs from the label centre
    // horizontally to tx, then drops vertically to ty; the label's canvas knock-out hides the
    // part under it, so no line ever crosses text. `ph` = also shown on a phone; `cv` = also
    // shown on the deck cover's smaller plate (the others would collide with the stickers there).
    // the glyph's ink edges (plate %), measured on a canvas: font-size = 0.797 x plate width
    // (78% of a 1.36:1 plate = cap height); falls back to a typical bold capital
    let bl = 18, br = 82;
    try {
      const cv = document.createElement('canvas').getContext('2d');
      cv.font = `${st.headingFont ? abWeight(st.headingFont, 700) : 700} 100px ${(st.headingFont && st.headingFont.css) || 'sans-serif'}`;
      const m = cv.measureText(ctx.initial || 'M');
      const k = 0.797;   // em in plate widths
      const adv = m.width / 100 * k * 100;
      const L = 50 - adv / 2 - (m.actualBoundingBoxLeft || 0) / 100 * k * 100;
      const R = 50 - adv / 2 + (m.actualBoundingBoxRight || m.width) / 100 * k * 100;
      if (R - L > 8 && L > 2 && R < 98) { bl = Math.round(L * 10) / 10; br = Math.round(R * 10) / 10; }
    } catch (err) { /* keep the defaults */ }
    const span = br - bl;
    const calls = [
      { i: 'A.01', k: 'CAP HEIGHT', x: 9, y: 22, tx: +(bl + span * 0.18).toFixed(1), ty: 10, ph: 1, cv: 1 },
      { i: 'A.02', k: 'L. BEARING', x: Math.max(6, bl - 9), y: 40, tx: bl, ty: 40 },
      // above the cap line, so its knock-out never bites the glyph
      { i: 'A.04', k: 'ADVANCE', x: 58, y: 7, tx: +(br - span * 0.1).toFixed(1), ty: 10 },
      { i: 'A.05', k: 'OPT. CENTER', x: 89, y: 48, tx: 50, ty: 50, mark: true },
      { i: 'A.06', k: 'BASELINE', x: 89, y: 81, tx: +(br - span * 0.05).toFixed(1), ty: 88, ph: 1, cv: 1, mark: true },
      { i: 'A.08', k: 'ORIGIN', x: 38, y: 94, tx: bl, ty: 88, ph: 1, cv: 1 },
    ];
    const cls = c => [c.ph ? '' : 'mga-nph', c.cv ? '' : 'mga-ncv'].filter(Boolean).join(' ');
    const leaders = calls.map(c => `<path ${vf} d="M${c.x} ${c.y}H${c.tx}V${c.ty}" stroke-width="1"${cls(c) ? ` class="${cls(c)}"` : ''}/>`).join('');
    const markers = calls.map(c => `<i class="mga-mk${c.mark ? ' is-p' : ''}${c.ph ? '' : ' mga-nph'}" style="left:${c.tx}%;top:${c.ty}%"></i>`).join('');
    const labels = calls.map(c => {
      const coord = `X ${String(Math.round(c.tx * 4.2)).padStart(3, '0')} Y ${String(Math.round(c.ty * 3.4)).padStart(3, '0')}`;
      return `<span class="mga-call${cls(c) ? ' ' + cls(c) : ''}" style="--x:${c.x}%;--y:${c.y}%"><b>${c.i}</b> ${c.k}<br><em>${coord}</em></span>`;
    }).join('');

    const table = [
      ['01', 'HEAD', hName], ['02', 'BODY', bName], ['03', 'GRID', '8 PX / 10 U'],
      ['04', 'INK', '#' + hex(t.ink)], ['05', 'PRI', '#' + hex(t.primary), 'p'], ['06', 'SEC', '#' + hex(t.secondary), 's'], ['07', 'ACC', '#' + hex(t.accent)],
    ].map(r => `<div class="mga-row"><span>${r[0]}</span><span>${r[1]}</span><span>${r[3] ? `<i class="mga-sq mga-sq-${r[3]}"></i>` : ''}${r[2]}</span></div>`).join('');
    const spec = `<p class="mga-h"><b>SPEC 01/26</b> · ${escapeHtml(brand)}<br>REV 03 · 2026.10</p><div class="mga-tab">${table}</div>`;
    const qr = `<div class="mga-qrrow">
          <svg class="mga-qr" viewBox="0 0 ${qrN} ${qrN}" shape-rendering="crispEdges" focusable="false"><path d="${mgQr(seed, qrN)}" fill="${t.ink}"/><path d="M${qrN - 5} 2h3v3h-3z" fill="${t.secondary}"/></svg>
          <div class="mga-warn"><svg viewBox="0 0 12 11" focusable="false"><path d="M6 .8L11.2 10H.8Z" fill="${safe}" stroke="${t.ink}" stroke-width=".9" stroke-linejoin="round"/><path d="M6 4.2v3M6 8.2v.9" stroke="${t.ink}" stroke-width="1"/></svg><span><b>CAUTION</b><br>RE-ISSUE</span></div>
        </div>
        <p class="mga-h"><b>V 2.6.0</b> / BUILD 0412<br>N 51.5074° / W 0.1278°</p>`;
    const barsSvg = `<svg class="mga-bar" viewBox="0 0 ${bars.w} 10" preserveAspectRatio="none" focusable="false"><path d="${bars.d}" fill="${t.ink}"/></svg>`;

    return `<div class="mga">
      <span class="mga-corner mga-c-tl">A–01</span><span class="mga-corner mga-c-tr">MG–0412</span>
      <span class="mga-corner mga-c-bl">© 2026 ${escapeHtml(brand)}</span><span class="mga-corner mga-c-br">P.01/26</span>
      <span class="mga-ruler mga-r-t"><i>000</i><i>100</i><i>200</i><i>300</i><i>400</i></span>
      <span class="mga-ruler mga-r-b"><i>A</i><i>B</i><i>C</i><i>D</i><i>E</i></span>
      <div class="mga-glyph">
        <span class="mga-gl is-o">${escapeHtml(ctx.initial)}</span><span class="mga-gl">${escapeHtml(ctx.initial)}</span>
        <svg class="mga-lines" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false" fill="none" stroke="${t.ink}" stroke-opacity=".7">
          <path ${vf} d="M0 10H100M0 88H100M${bl} 0V100M${br} 0V100" stroke-opacity=".4" stroke-width="1" stroke-dasharray="3 3"/>
          <path ${vf} d="M50 0V100" stroke-opacity=".2" stroke-width="1"/>
          ${leaders}
        </svg>${markers}${labels}
      </div>
      <div class="mga-stk mga-stk-spec">${spec}</div>
      <div class="mga-stk mga-stk-qr">${qr}</div>
      <div class="mga-stk mga-stk-hz"><i class="mga-tape"></i>${barsSvg}<p class="mga-note">0 41227 06601 5 · SCALE 1:1 · SHEET 01</p></div>
    </div>
    <div class="mga-under">${spec}<div class="mga-under-r">${qr}${barsSvg}</div></div>`;
  },

  materials: [
    { name: 'Hairline', css: 'border: 1px solid {ink}; /* every frame, rule and leader: 1px ink, never rounded, never tinted; secondary rules at 20% */' },
    { name: 'Microtype', css: 'font: 500 8px/1.6 mono; letter-spacing: .16em; text-transform: uppercase; color: {ink}; /* 7-9px only; labels are index + word, coordinates are X 000 Y 000 */' },
    { name: 'Micro corner labels', css: 'font: 500 7.5px/1 mono; letter-spacing: .16em; /* on every panel: index top-left (A.01), code top-right (MG-0412-A), page bottom-right (P.02/04) */' },
    { name: 'Crosshair marker', css: 'background: linear-gradient({ink},{ink}) center / 100% 1px no-repeat, linear-gradient({ink},{ink}) center / 1px 100% no-repeat; width: 9px; height: 9px; /* a 3px {primary} square at the centre on at most three markers per view */' },
    { name: 'Tick ruler', css: 'background: repeating-linear-gradient(90deg, {ink} 0 1px, transparent 1px 6px) bottom / 100% 4px no-repeat, repeating-linear-gradient(90deg, {ink} 0 1px, transparent 1px 30px) bottom / 100% 8px no-repeat; /* along the plate edges with a number every fifth long tick */' },
    { name: 'Main action', css: 'background: {primary}; color: {onPrimary}; border-radius: 0; font: 600 9.5px/1 mono; letter-spacing: .22em; text-transform: uppercase; /* the only solid fill on the board */' },
    { name: 'Giant glyph', css: 'color: {ink}; font-weight: 700; /* the brand initial at ~78% of the plate height (~60x the microtype), with a 1px outline duplicate offset 3px like a misregistered proof */' },
    { name: 'Sticker', css: 'background: {canvas}; box-shadow: inset 0 0 0 1px {ink}; padding: 8px; /* spec table, QR block and hazard tape laid OVER the glyph; labels knock out what is behind them */' },
    { name: 'Safety mark', css: 'background: repeating-linear-gradient(-45deg, {mgSafe} 0 6px, {ink} 6px 12px); /* fixed #FF4A1C light / #FFE500 dark, not a brand role: the caution triangle and one hazard tape only */' },
  ],

  rules: {
    do: [
      'Make one element huge (the brand glyph, across the whole plate) and ring it with 8px mono microtype: scale contrast of 50x or more.',
      'Give every panel three micro labels: index at top-left, code at top-right, page at bottom-right.',
      'Draw with 1px ink hairlines, crosshairs, ticks and registration marks on a strict 8px or 10 unit module; label things with an index and a coordinate.',
      'Spend primary on a handful of tiny 3-5px marks plus the one main action; the one loud mark is the fixed safety colour on a hazard tape.',
    ],
    dont: [
      'Add glow, gradients, shadows or tinted panel fills; the sheet is flat paper and ink.',
      'Set microtype below 7px or above 9px, or in a proportional face; it is mono, uppercase, widely tracked.',
      'Run a leader at an angle or across a label; leaders are one horizontal run and one vertical drop, and labels knock out.',
      'Draw a blueprint field, grid sheet or dark screen (that is Blueprint and Cyber HUD); this is a light printed spec.',
    ],
  },
});
})();
