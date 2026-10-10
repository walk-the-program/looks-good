/* 23 Micrographics — tiny, technical, precise. Reference: streetwear and tech-
   editorial layouts (Acronym, Nike ISPA, techwear graphics, modern Swiss posters)
   where one huge element is ringed by clusters of tiny type: 7-9px mono labels,
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

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

registerAesthetic({
  key: 'micrographics', order: 23,
  name: 'Micrographics',
  descriptor: 'Tiny · Technical · Precise',
  influences: 'Swiss technical print / Streetwear graphics / Product spec sheets',
  summary: 'One huge element ringed by clusters of 8px mono labels, marks and coordinates.',
  motto: 'Small print, large idea.',
  kicker: 'SPEC 01/26',
  mode: 'light',
  slideShape: 'minimal',
  labels: { material: 'Detail', states: ['Base', 'Annotated', 'Marked'], statesKind: 'swatch' },
  layout: { hero: 'centered', palette: 'swatches', sections: 'two-col' },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    materialStage: 'pattern',
    principles: [
      ['One huge element', 'Everything else is at least ten times smaller.'],
      ['Rings of tiny mono labels', 'Indexes, codes, coordinates and page marks.'],
      ['Hairlines on a strict module', 'Ticks, crosshairs and a handful of primary marks.'],
    ],
    do: [
      'Make one element huge.',
      'Give every panel three micro labels.',
      'Draw with 1px hairlines.',
    ],
    dont: [
      'Add glow, gradients or shadows.',
      'Set microtype in a proportional face.',
      'Use accent for marks or small text.',
    ],
  },
  type: { ui: 'mono', label: 'mono', display: 1.28 },
  highlight: 'custom',
  highlightNote: 'The word is set solid in --accent-ink like the rest of the giant headline, followed by a tiny mono footnote reference "(01)" raised at its top right; no fill, no outline, no underline.',

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
      use: 'Quiet support: confidence bars, one finder square in the QR block, status underlines and the second annotation ring',
      never: 'The main action, body text, headline',
      coverage: '≈3–5%',
    },
    accent: {
      use: 'The single highlighted headline word',
      never: 'Marks, buttons, borders, fills, microtype',
      coverage: '≤3%',
    },
  },

  tokens(t) {
    const st = typeof state !== 'undefined' ? state : null;
    const hf = st && st.headingFont;
    const ws = String((hf && hf.weights) || '400').split(';').map(Number).filter(Boolean);
    const le = ws.filter(x => x <= 700);
    const hw = le.length ? Math.max(...le) : Math.min(...ws);
    return {
      '--ab-tr': (hf && { condensed: 0, heavy: 0, wide: 0.4, techno: 0.4 }[hf.cls]) ?? 1,
      '--ab-type-pick-w': hw,
      '--ab-hw': hw,
      '--ab-hair': t.alpha(t.ink, 0.5),
      '--ab-hair-soft': t.alpha(t.ink, 0.2),
      '--ab-hair-faint': t.alpha(t.ink, 0.1),
      '--ab-mg-tick': 'repeating-linear-gradient(90deg, currentColor 0 1px, transparent 1px 6px)',
    };
  },

  art(ctx) {
    const t = ctx.t;
    const st = ctx.state || {};
    const brand = String(ctx.brandName || 'BRAND').toUpperCase().replace(/[^A-Z0-9 .&-]/g, '').slice(0, 20) || 'BRAND';
    const seed = MG_HASH(ctx.brandName || 'brand');
    const qrN = 21;
    const bars = mgBars(seed ^ 0x9e3779b1, 46);
    const hName = esc(((st.headingFont && st.headingFont.name) || 'Heading').slice(0, 18));
    const bName = esc(((st.bodyFont && st.bodyFont.name) || 'Body').slice(0, 18));
    const hex = c => c.replace('#', '').toUpperCase();
    const vf = 'vector-effect="non-scaling-stroke"';

    // callouts: label position (x,y %), the marker it points at (tx,ty %), side the label hangs to.
    // Every marker sits on a drawn metric guide (cap y34, baseline y78, left bearing x21, right bearing x77),
    // the faint centre line (REG. MARK) or the guide box centre (49,56); the glyph is fitted to the same box in css.
    const calls = [
      { i: 'A.01', k: 'CAP HEIGHT', x: 2, y: 5, tx: 30, ty: 34, side: 'l' },
      { i: 'A.02', k: 'L. BEARING', x: 2, y: 43, tx: 21, ty: 58, side: 'l' },
      { i: 'A.03', k: 'GRID 10', x: 2, y: 86, tx: 25, ty: 78, side: 'l' },
      { i: 'A.04', k: 'ADVANCE', x: 98, y: 5, tx: 77, ty: 34, side: 'r' },
      { i: 'A.05', k: 'OPT. CENTER', x: 98, y: 43, tx: 49, ty: 56, side: 'r', mark: true },
      { i: 'A.06', k: 'BASELINE', x: 98, y: 86, tx: 77, ty: 78, side: 'r' },
      { i: 'A.07', k: 'REG. MARK', x: 50, y: 0, tx: 50, ty: 16, side: 'c' },
      { i: 'A.08', k: 'ORIGIN', x: 50, y: 88, tx: 21, ty: 78, side: 'c', mark: true },
    ];
    const leaders = calls.map(c => {
      // leader runs from the label edge to the marker, with one right-angle bend
      const ax = c.side === 'l' ? c.x + 23 : c.side === 'r' ? c.x - 23 : c.x;
      const ay = c.side === 'c' ? (c.y < 50 ? c.y + 11 : c.y - 1) : c.y + 6.5;
      return `<path ${vf} d="M${ax} ${ay}L${c.tx} ${c.ty}" stroke-width="1"/>`;
    }).join('');
    const markers = calls.map(c => `<i class="mga-mk${c.mark ? ' is-p' : ''}" style="left:${c.tx}%;top:${c.ty}%"></i>`).join('');
    const labels = calls.map(c => {
      const coord = `X ${String(Math.round(c.tx * 4.2)).padStart(3, '0')}  Y ${String(Math.round(c.ty * 3.4)).padStart(3, '0')}`;
      return `<span class="mga-call mga-s${c.side}" style="left:${c.x}%;top:${c.y}%"><b>${c.i}</b><br>${c.k}<br><em>${coord}</em></span>`;
    }).join('');

    // module grid of tiny plus marks behind the glyph (10-unit pitch in a 130 x 100 box)
    let grid = '';
    for (let gx = 10; gx <= 120; gx += 10) for (let gy = 10; gy <= 90; gy += 10) grid += `M${gx - 1.1} ${gy}h2.2M${gx} ${gy - 1.1}v2.2`;

    const table = [
      ['01', 'HEAD', hName], ['02', 'BODY', bName], ['03', 'GRID', '8 PX / 10 U'],
      ['04', 'INK', '#' + hex(t.ink)], ['05', 'PRI', '#' + hex(t.primary), 'p'], ['06', 'SEC', '#' + hex(t.secondary), 's'], ['07', 'ACC', '#' + hex(t.accent)],
    ].map(r => `<div class="mga-row"><span>${r[0]}</span><span>${r[1]}</span><span>${r[3] ? `<i class="mga-sq mga-sq-${r[3]}"></i>` : ''}${r[2]}</span></div>`).join('');

    return `<div class="mga">
      <span class="mga-corner mga-c-tl">A–01</span><span class="mga-corner mga-c-tr">MG–0412</span>
      <span class="mga-corner mga-c-bl">© 2026 ${esc(brand)}</span><span class="mga-corner mga-c-br">P.01/26</span>
      <span class="mga-ruler mga-r-t"><i>000</i><i>100</i><i>200</i><i>300</i><i>400</i></span>
      <span class="mga-ruler mga-r-b"><i>A</i><i>B</i><i>C</i><i>D</i><i>E</i></span>
      <div class="mga-col mga-l">
        <p class="mga-h"><b>SPEC 01/26</b><br>${esc(brand)}<br>REV 03 · 2026.10</p>
        <div class="mga-tab">${table}</div>
        <p class="mga-note">→ 01 · 02 · 03<br>ISSUE 04 / SEE SHEET B</p>
      </div>
      <div class="mga-glyph">
        <svg class="mga-g" viewBox="0 0 130 100" focusable="false" preserveAspectRatio="xMidYMid meet">
          <path ${vf} d="${grid}" fill="none" stroke="${t.ink}" stroke-opacity=".28" stroke-width="1"/>
        </svg>
        <span class="mga-gl is-o">${esc(ctx.initial)}</span><span class="mga-gl">${esc(ctx.initial)}</span>
        <svg class="mga-lines" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false" fill="none" stroke="${t.ink}" stroke-opacity=".6">
          <path ${vf} d="M0 34H100M0 78H100M21 0V100M77 0V100" stroke-opacity=".35" stroke-width="1" stroke-dasharray="3 3"/>
          <path ${vf} d="M50 0V100" stroke-opacity=".18" stroke-width="1"/>
          ${leaders}
        </svg>${markers}${labels}
      </div>
      <div class="mga-col mga-r">
        <div class="mga-qrrow">
          <svg class="mga-qr" viewBox="0 0 ${qrN} ${qrN}" shape-rendering="crispEdges" focusable="false"><path d="${mgQr(seed, qrN)}" fill="${t.ink}"/><rect x="${qrN - 7}" y="0" width="7" height="7" fill="none"/><path d="M${qrN - 5} 2h3v3h-3z" fill="${t.secondary}"/></svg>
          <div class="mga-warn"><svg viewBox="0 0 12 11" focusable="false"><path d="M6 .8L11.2 10H.8Z" fill="none" stroke="${t.ink}" stroke-width=".9" stroke-linejoin="round"/><path d="M6 4.2v3M6 8.2v.9" stroke="${t.ink}" stroke-width=".9"/></svg><span>CAUTION<br>RE-ISSUE</span></div>
        </div>
        <p class="mga-h"><b>V 2.6.0</b> / BUILD 0412<br>N 51.5074° / W 0.1278°<br>↗ ↘ ↓ ← ⌖ 03</p>
        <svg class="mga-bar" viewBox="0 0 ${bars.w} 10" preserveAspectRatio="none" focusable="false"><path d="${bars.d}" fill="${t.ink}"/></svg>
        <p class="mga-note">0 41227 06601 5<br>SCALE 1:1 · SHEET 01</p>
      </div>
    </div>`;
  },

  materials: [
    { name: 'Hairline', css: 'border: 1px solid {ink}; /* every frame, rule and leader: 1px ink, never rounded, never tinted; secondary rules at 20% */' },
    { name: 'Microtype', css: 'font: 500 8px/1.6 mono; letter-spacing: .16em; text-transform: uppercase; color: {ink}; /* 7-9px only; labels are index + word, coordinates are X 000 Y 000 */' },
    { name: 'Micro corner labels', css: 'font: 500 7.5px/1 mono; letter-spacing: .16em; /* on every panel: index top-left (A.01), code top-right (MG-0412-A), page bottom-right (P.02/04) */' },
    { name: 'Crosshair marker', css: 'background: linear-gradient({ink},{ink}) center / 100% 1px no-repeat, linear-gradient({ink},{ink}) center / 1px 100% no-repeat; width: 9px; height: 9px; /* a 3px {primary} square at the centre on at most three markers per view */' },
    { name: 'Tick ruler', css: 'background: repeating-linear-gradient(90deg, {ink} 0 1px, transparent 1px 6px) bottom / 100% 4px no-repeat, repeating-linear-gradient(90deg, {ink} 0 1px, transparent 1px 30px) bottom / 100% 8px no-repeat; /* along the plate edges with a number every fifth long tick */' },
    { name: 'Main action', css: 'background: {primary}; color: {onPrimary}; border-radius: 0; font: 600 9.5px/1 mono; letter-spacing: .22em; text-transform: uppercase; /* the only solid fill on the board */' },
    { name: 'Giant glyph', css: 'color: {ink}; font-weight: 700; line-height: .8; /* the brand initial or headline at 10x the microtype, with a 1px outline duplicate offset 3 units like a misregistered proof */' },
  ],

  rules: {
    do: [
      'Make one element huge (headline or glyph) and ring it with clusters of 7-9px mono microtype: scale contrast of at least 10x.',
      'Give every panel three micro labels: index at top-left, code at top-right, page at bottom-right.',
      'Draw with 1px ink hairlines, crosshairs, ticks and registration marks on a strict 8px or 10 unit module; label things with an index and a coordinate.',
      'Spend primary on a handful of tiny 3-5px marks per view (five at most) plus the one main action.',
    ],
    dont: [
      'Add glow, gradients, shadows or tinted panel fills; the sheet is flat paper and ink.',
      'Set microtype below 7px or above 9px, or in a proportional face; it is mono, uppercase, widely tracked.',
      'Use accent for marks or small text; it is the one highlighted headline word.',
      'Draw a blueprint field, grid sheet or dark screen (that is Blueprint and Cyber HUD); this is a light printed spec.',
    ],
  },
});
})();
