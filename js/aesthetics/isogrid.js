/* 51 Isogrid — a grid that doubles at every step. Reference: the brand side of large technology
   design languages (ideas only: no assets, names, logos or copy): a "2x" grid, very large light
   display type, isometric line drawing. Our spin: the doubling is the whole system. Every gap,
   size and type step is twice the one below it: spacing 4 / 8 / 16 / 32 / 64 / 128, type 12 / 24 /
   48 / 96 (body 16 is the one text size between steps). Panels and slides split on halves and
   quarters. The app is outlines instead of fills: 1px hairlines, square corners, outlined fields,
   tall buttons with the label set top-left and an arrow set bottom-right, and a 4px primary bar on
   the TOP edge of whatever is selected.

   Type: Plex Sans light (300) for display, Plex Sans 400 / 600 for body and controls, Plex Mono for
   small labels and numbers. The 300 weight is declared in css/aesthetics/mainframe.css (an
   @font-face on the variable Plex file that is already bundled); this style reuses it and does not
   declare its own. Any other face gets its nearest published weight through abWeightNear.

   Board and website only: an original isometric line drawing (30 degree axes on a faint isometric
   dot lattice) of the brand initial built as a stack of extruded blocks. The block depths are
   seeded from the brand name (FNV-1a), so every brand draws a different stack. One set of faces is
   filled in the primary, the others are hairline ink. App screens (.sb-ab, the UI kit) carry none
   of it: no art, no lattice, no texture. */

/* ---------- the isometric stack (board / deck art only) ---------- */

// Same brand name, same stack: FNV-1a over the trimmed, lower-cased name.
function igHash(str) {
  let h = 2166136261;
  const s = String(str == null ? '' : str).trim().toLowerCase();
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  h ^= h >>> 15; h = Math.imul(h, 2246822507) >>> 0; h ^= h >>> 13;
  return h >>> 0;
}

// A small seeded generator (mulberry32).
function igRand(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// The initial as 7 rows of 5 bits. A letter with an accent uses its base letter; anything the 5x7 table
// has no shape for (another script, a symbol) gets a plain stepped block, never a wrong letter.
const IG_STEPS = ['00100', '01110', '01110', '11111', '11111', '11111', '11111'];
function igGlyph(initial) {
  const ch = String(initial == null ? '' : initial).trim().charAt(0);
  const base = ch.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
  const font = typeof AB_FONT_5X7 !== 'undefined' && AB_FONT_5X7 ? AB_FONT_5X7 : {};
  const bits = base && base !== '?' && font[base] ? font[base] : null;
  return bits ? bits.split(' ') : IG_STEPS;
}

// Isometric projection: x runs right and down, y runs left and down, z runs up; both ground axes sit
// at 30 degrees from the horizontal.
const IG_COS = Math.cos(Math.PI / 6);
const IG_SIN = 0.5;
function igProj(ox, oy, x, y, z) { return [ox + (x - y) * IG_COS, oy + (x + y) * IG_SIN - z]; }
const igNum = v => (Math.round(v * 10) / 10).toString();
const igPath = pts => 'M' + pts.map(p => igNum(p[0]) + ' ' + igNum(p[1])).join('L') + 'Z';

// A face: which of the three faces carries the primary is the same on every block of one drawing.
function igFace(kind, fillKind, pts) {
  return `<path class="iga-f${kind === fillKind ? ' is-fill' : ''}" d="${igPath(pts)}"/>`;
}

// The initial, standing in the x-z plane, every lit cell extruded backward by 1 to 3 blocks
// (seeded). Front faces stay flush, so the letter stays readable; the depth shows on the tops and
// the right-hand sides. Blocks are drawn back to front; hidden faces are skipped.
function igStack(rnd, rows, ox, oy, U, fillKind) {
  const FRONT = 2;
  const taken = new Set(), blocks = [];
  rows.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) {
      if (row[c] !== '1') continue;
      const d = 1 + Math.floor(rnd() * 3);
      for (let y = FRONT - d + 1; y <= FRONT; y++) { blocks.push([c, y, rows.length - 1 - r]); taken.add(c + ',' + y + ',' + (rows.length - 1 - r)); }
    }
  });
  blocks.sort((a, b) => (a[0] + a[1] + a[2]) - (b[0] + b[1] + b[2]) || a[0] - b[0] || a[1] - b[1]);
  let out = '';
  blocks.forEach(([x, y, z]) => {
    const P = (dx, dy, dz) => igProj(ox, oy, (x + dx) * U, (y + dy) * U, (z + dz) * U);
    if (!taken.has(x + ',' + y + ',' + (z + 1))) out += igFace('top', fillKind, [P(0, 0, 1), P(1, 0, 1), P(1, 1, 1), P(0, 1, 1)]);
    if (!taken.has((x + 1) + ',' + y + ',' + z)) out += igFace('right', fillKind, [P(1, 0, 0), P(1, 1, 0), P(1, 1, 1), P(1, 0, 1)]);
    if (!taken.has(x + ',' + (y + 1) + ',' + z)) out += igFace('front', fillKind, [P(0, 1, 0), P(1, 1, 0), P(1, 1, 1), P(0, 1, 1)]);
  });
  return out;
}

// The doubling ladder: four cubes whose edges are 4, 8, 16 and 32 along the x axis.
function igLadder(ox, oy, fillKind) {
  let out = '', x = 0;
  [4, 8, 16, 32].forEach(e => {
    const P = (dx, dy, dz) => igProj(ox, oy, x + dx * e, dy * e, dz * e);
    out += igFace('top', fillKind, [P(0, 0, 1), P(1, 0, 1), P(1, 1, 1), P(0, 1, 1)]);
    out += igFace('right', fillKind, [P(1, 0, 0), P(1, 1, 0), P(1, 1, 1), P(1, 0, 1)]);
    out += igFace('front', fillKind, [P(0, 1, 0), P(1, 1, 0), P(1, 1, 1), P(0, 1, 1)]);
    x += e + 8;
  });
  return out;
}

let igSeq = 0;

// The primary the grid prints. It is the brand colour whenever that already holds 4.6:1 on the canvas
// (so it is safe as text, as a bar and as a ring) and carries a readable label (white or near-black at
// 4.6:1). Otherwise it moves along lightness only (darker in light mode, lighter in dark), same hue.
function igPrimary(t) {
  const h = hexToHsl(t.primary), dark = t.isDark;
  const ok = hex => contrastRatio(hex, t.canvas) >= 4.6 && Math.max(contrastRatio(hex, '#ffffff'), contrastRatio(hex, '#141414')) >= 4.6;
  if (ok(t.primary)) return t.primary;
  for (const dir of [dark ? 1 : -1, dark ? -1 : 1]) {
    for (let step = 1; step <= 96; step++) {
      const l = h.l + dir * step;
      if (l < 2 || l > 98) break;
      const hex = hslToHex(h.h, h.s, l);
      if (ok(hex)) return hex;
    }
  }
  return dark ? '#ffffff' : t.ink;
}

registerAesthetic({
  key: 'isogrid', order: 51,
  name: 'Isogrid',
  descriptor: 'Doubled · Isometric · Airy',
  influences: 'Doubling grids / Isometric line drawing / Pictograms',
  summary: 'A grid that doubles at every step: huge light display type, hairline outlines instead of fills, tall buttons with the label top-left and an arrow bottom-right, and an isometric line drawing of your initial built from extruded blocks.',
  motto: 'Every step doubles. Start from the grid.',
  kicker: 'Doubling grid',
  mode: 'light',
  slideShape: 'minimal',
  labels: { material: 'Grid & controls', states: ['Rest', 'Hover', 'Pressed'], statesKind: 'button' },
  // Editable specimen copy (Brand > Advanced > Specimen copy).
  copy: {
    motto: { label: 'Motto', text: 'Every step doubles. Start from the grid.', warm: 'Every step doubles. Easy to follow.' },
    kicker: { label: 'Kicker above the headline', text: 'Doubling grid' },
    state0: { label: 'State 1 name', text: 'Rest' },
    state1: { label: 'State 2 name', text: 'Hover' },
    state2: { label: 'State 3 name', text: 'Pressed' },
    artCap: { label: 'Hero caption', text: 'Every step doubles' },
    artScale: { label: 'Hero caption: scale', text: '4 · 8 · 16 · 32 · 64' },
    cellScale: { label: 'Material card: scale', text: 'Doubling scale' },
    cellButtons: { label: 'Material card: buttons', text: 'Tall buttons' },
    cellField: { label: 'Material card: field', text: 'Outlined field' },
    cellTabs: { label: 'Material card: tabs', text: 'Top-bar tabs' },
    btnLabel: { label: 'Button sample', text: 'Continue' },
    btn2Label: { label: 'Second button sample', text: 'Not now' },
    fieldLabel: { label: 'Field sample label', text: 'Project name' },
    fieldValue: { label: 'Field sample value', text: 'Something good' },
    fieldHelp: { label: 'Field sample helper line', text: 'Letters and numbers only' },
    tab0: { label: 'Tab sample 1', text: 'Overview' },
    tab1: { label: 'Tab sample 2', text: 'Activity' },
    tab2: { label: 'Tab sample 3', text: 'Members' },
    tagLabel: { label: 'Tag sample', text: 'Active' },
  },
  layout: { hero: 'split', palette: 'swatches', sections: 'two-col' },
  type: { ui: 'sans', label: 'mono', display: 1 },
  highlight: 'ink',

  roles: {
    canvas: {
      use: 'The ground and every container: a white or near-white (dark: a near-black). Containers are drawn as 1px outlines on it, never filled',
      never: 'Text, or a tinted card fill: depth is an outline, not a shade',
      coverage: '60–70%',
    },
    ink: {
      use: 'Headlines, body text, the 1px hairline outlines (pulled to 3:1 on the canvas), the secondary button outline and the toast',
      never: 'A large filled field in light mode',
      coverage: '15–20%',
    },
    primary: {
      use: 'The one main button per view, the 4px bar on the top edge of the selected tab, segment and row, the focus ring, progress fill, links and the shaded faces of the hero drawing',
      never: 'A second main button on a view, a card fill, or text under 16px that is not a link',
      coverage: '≈10%',
    },
    secondary: {
      use: 'The comparison data series, the avatar and tag outlines on the board and the supporting faces of the hero drawing',
      never: 'The main action, body text, the page ground',
      coverage: '≈5%',
    },
    accent: {
      use: 'One spark: the highlighted word in a headline and the small square marking a new item',
      never: 'Buttons, focus rings, body text, container fills',
      coverage: '≤3%',
    },
  },

  // White in light, near-black in dark, each with a trace of the brand hue. Pure ground (state.pureBg)
  // replaces it.
  canvas(b) {
    const h = b.hexToHsl(b.primary);
    if (b.isDark) return b.hslToHex(h.h, Math.min(10, h.s * 0.12), 6.5);
    return b.hslToHex(h.h, h.s < 6 ? 0 : Math.min(6, h.s * 0.1), 98.5);
  },

  printPrimary(t) { return igPrimary(t); },

  tokens(t, view) {
    const d = t.isDark;
    const pri = t.printPrimary;
    const wash = t.mix(t.ink, t.canvas, d ? 0.08 : 0.05);        // hover on a ghost control, hover on a row
    const wash2 = t.mix(t.ink, t.canvas, d ? 0.14 : 0.1);        // pressed on a ghost control
    // muted ink holds 4.6:1 on the canvas and on both washes
    let muted = t.muted;
    for (let k = 0.1; k <= 1.001 && [t.canvas, wash, wash2].some(g => t.contrast(muted, g) < 4.6); k += 0.1) muted = t.mix(t.ink, t.muted, k);
    // the hairline: ink pulled toward the canvas, lightest value that holds 3.2:1 on the canvas and on the hover wash
    let edge = t.ink;
    for (let k = 0.3; k <= 1.001; k += 0.02) {
      const e = t.mix(t.ink, t.canvas, k);
      if ([t.canvas, wash].every(g => t.contrast(e, g) >= 3.2)) { edge = e; break; }
    }
    // faint dots for the lattice (decorative only)
    const faint = t.mix(t.ink, t.canvas, d ? 0.17 : 0.13);
    // weights: Plex Sans light 300 is declared in css/aesthetics/mainframe.css; any other face gets its nearest weight
    const hf = view && view.headingFont;
    const isPlex = hf && hf.name === 'IBM Plex Sans';
    const lightW = isPlex ? 300 : (typeof abWeightNear === 'function' ? abWeightNear(hf, 300) : 400);
    const midW = typeof abWeightNear === 'function' ? abWeightNear(hf, 600) : 600;
    return {
      '--ab-muted': muted,
      '--ab-line': edge,
      '--ab-edge': edge,
      '--ab-faint': faint,
      '--ab-wash': wash,
      '--ab-wash-press': wash2,
      '--ab-primary-text': pri,
      '--ab-focus': pri,
      '--ab-pri-hover': d ? t.mix('#ffffff', pri, 0.12) : t.mix('#000000', pri, 0.12),
      '--ab-pri-press': d ? t.mix('#ffffff', pri, 0.26) : t.mix('#000000', pri, 0.26),
      '--ab-fig-w': lightW,
      '--ab-title-w': midW,
      '--ab-type-pick-w': lightW,
    };
  },

  // Hero art (board, deck cover): the brand initial as a stack of extruded blocks on an isometric dot
  // lattice, beside the 4 / 8 / 16 / 32 cubes that show the doubling. Decorative; the scale is also
  // written as text in the caption.
  art(ctx) {
    const id = 'igl' + (++igSeq);
    const name = String(ctx.brandName || '').trim();
    const initial = ctx.initial || name.charAt(0) || 'B';
    const rnd = igRand(igHash(name || initial));
    const pick = rnd();
    const fillKind = pick < 0.55 ? 'top' : pick < 0.8 ? 'front' : 'right';
    const U = 26;
    const tile = 2 * IG_COS * 16;
    const stack = igStack(rnd, igGlyph(initial), 237.5, 218, U, fillKind);
    const ground = igPath([igProj(237.5, 218, 0, 0, 0), igProj(237.5, 218, 5 * U, 0, 0), igProj(237.5, 218, 5 * U, 3 * U, 0), igProj(237.5, 218, 0, 3 * U, 0)]);
    return `<div class="iga">
      <svg class="iga-svg" viewBox="0 0 520 380" aria-hidden="true" focusable="false">
        <defs><pattern id="${id}" width="${igNum(tile)}" height="16" patternUnits="userSpaceOnUse"><circle class="iga-dot" cx="${igNum(tile / 4)}" cy="4" r="0.9"/><circle class="iga-dot" cx="${igNum(tile * 3 / 4)}" cy="12" r="0.9"/></pattern></defs>
        <rect class="iga-panel" x="0.5" y="0.5" width="519" height="379"/>
        <rect x="1" y="1" width="518" height="378" fill="url(#${id})"/>
        <path class="iga-ground" d="${ground}"/>
        <g class="iga-stack">${stack}</g>
        <g class="iga-ladder">${igLadder(372, 262, fillKind)}</g>
      </svg>
      <p class="iga-cap"><span>${abCopy(this, 'artCap')}</span><b>${abCopy(this, 'artScale')}</b></p>
    </div>`;
  },

  materials: [
    { name: 'Canvas', css: 'background: {canvas}; /* white or near-white, dark: near-black; every container sits on it as an outline, never as a fill */' },
    { name: 'Hairline', css: 'border: 1px solid {edge}; border-radius: 0; box-shadow: none; /* {edge} is the ink pulled toward the canvas until it holds 3:1; the only edge in the system */' },
    { name: 'Card and panel', css: 'background: transparent; border: 1px solid {edge}; border-radius: 0; box-shadow: none; padding: 32px;' },
    { name: 'Field', css: 'background: transparent; border: 1px solid {edge}; border-radius: 0; height: 48px; padding: 0 16px; /* outlined all round; focus: 2px outline in {focus}, offset 2px; error: 2px inset outline in the error colour plus a helper line in it; disabled: dashed outline */' },
    { name: 'Main button', css: 'background: {primary}; color: {onPrimary}; border-radius: 0; min-height: 64px; padding: 16px; display: grid; grid-template-columns: 1fr auto; /* label set top-left, a 20px arrow set bottom-right; hover {priHover}, pressed {priPress}; focus: 2px outline in {focus}, offset 4px */' },
    { name: 'Secondary button', css: 'background: transparent; color: {ink}; border: 1px solid {ink}; border-radius: 0; min-height: 64px; /* same anatomy as the main button; hover and pressed take {wash} and {washPress} */' },
    { name: 'Selected tab, segment and row', css: 'box-shadow: inset 0 4px 0 {primary}; /* a 4px primary bar on the TOP edge; the label goes to the ink at weight 600 */' },
    { name: 'Tag', css: 'background: transparent; color: {ink}; border: 1px solid {edge}; border-radius: 0; min-height: 24px; padding: 0 8px; /* square and outlined; mono 12px */' },
    { name: 'Isometric drawing (board art only)', css: 'viewBox 0 0 520 380; /* the brand initial built as extruded blocks on 30 degree axes over a dot lattice in {faint}; one face set in {primary}, the others {canvas} with a 1px {ink} outline; board and website only, never in app screens */' },
  ],

  rules: {
    do: [
      'Double every step: spacing 4 / 8 / 16 / 32 / 64 / 128, type 12 / 24 / 48 / 96 (body text is 16).',
      'Draw containers as 1px outlines with square corners; never fill a card or shade a panel.',
      'Set a tall button\'s label top-left and its arrow bottom-right, at least 64px tall.',
      'Mark what is selected with a 4px primary bar on its top edge.',
      'Set display type in Plex Sans light at the largest step, and labels and numbers in Plex Mono.',
    ],
    dont: [
      'Put the isometric drawing or the dot lattice in the app; they are board and website art only.',
      'Round any corner, cast a shadow or fill a field.',
      'Use a gap or a size that is not on the doubling ladder.',
      'Set body copy in mono or in the light weight.',
    ],
  },

  deck: {
    radius: 0,
    // Material slide: the real components as small specimens in a 2 x 2 grid (halves, then halves
    // again): the doubling scale, the tall buttons, an outlined field and the top-bar tabs with a tag.
    // Pure HTML; styled in the css.
    materialArt() {
      const steps = [4, 8, 16, 32, 64].map(n => `<span class="igm-step"><i style="width:${n}px;height:${n}px"></i><b>${n}</b></span>`).join('');
      const tabs = [0, 1, 2].map(i => `<span class="igm-tab${i === 0 ? ' is-on' : ''}">${abCopy(this, 'tab' + i)}</span>`).join('');
      return `<div class="igm">
        <div class="igm-cell"><span class="igm-l">${abCopy(this, 'cellScale')}</span><div class="igm-steps" aria-hidden="true">${steps}</div></div>
        <div class="igm-cell"><span class="igm-l">${abCopy(this, 'cellButtons')}</span>
          <div class="igm-btns"><span class="igm-btn is-primary"><span>${abCopy(this, 'btnLabel')}</span><i aria-hidden="true">→</i></span><span class="igm-btn"><span>${abCopy(this, 'btn2Label')}</span><i aria-hidden="true">→</i></span></div></div>
        <div class="igm-cell"><span class="igm-l">${abCopy(this, 'cellField')}</span>
          <div class="igm-field"><span class="igm-fl">${abCopy(this, 'fieldLabel')}</span><b class="igm-fv">${abCopy(this, 'fieldValue')}</b></div><span class="igm-fh">${abCopy(this, 'fieldHelp')}</span></div>
        <div class="igm-cell"><span class="igm-l">${abCopy(this, 'cellTabs')}</span>
          <div class="igm-tabs" aria-hidden="true">${tabs}</div><span class="igm-tag">${abCopy(this, 'tagLabel')}</span></div>
      </div>`;
    },
    principles: [
      ['Every step doubles', 'Gaps, sizes and type steps are twice the one below: 4, 8, 16, 32, 64, 128.'],
      ['Outlines, not fills', 'Containers are 1px hairlines with square corners; selection is a 4px bar on the top edge.'],
      ['Corners carry the action', 'A tall button sets its label top-left and its arrow bottom-right.'],
    ],
    do: [
      'Stay on the doubling ladder.',
      'Outline containers; do not fill them.',
      'Mark the selected item with a top bar.',
    ],
    dont: [
      'Round a corner or add a shadow.',
      'Put the isometric drawing in the app.',
      'Use a size off the ladder.',
    ],
  },
});
