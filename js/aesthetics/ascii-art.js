/* 25 ASCII Art — textual, generative, nerdy. Reference: character-density image
   renderings (ASCII video art), TUI dashboards (btop, lazygit) and ascii-art landing
   pages. Everything is built from monospace characters on a grid.

   The art is generated, not drawn: the brand initial is a 5x7 bitmap placed on a
   character grid, blurred at two scales (a tight one for the body, a wide one for the
   halo), and each cell's brightness is looked up in the ramp " .:-=+*#%@". Every cell is
   coloured along a brand gradient (primary, then secondary, a touch of accent at the far
   corner), faded toward the canvas with its brightness. A few cells are inverted in the
   accent like a text selection. The panel is a box-drawing frame in the same <pre>, so
   the whole hero is real text. Two grids are emitted (wide and narrow) and CSS swaps
   them at the board's 600px breakpoint. The grid is memoised per initial and size. */

const AA_RAMP = ' .:-=+*#%@';

// 5x7 bitmap capitals and digits (rows of 5 bits)
const AA_FONT = {
  A: '01110 10001 10001 11111 10001 10001 10001', B: '11110 10001 10001 11110 10001 10001 11110',
  C: '01110 10001 10000 10000 10000 10001 01110', D: '11110 10001 10001 10001 10001 10001 11110',
  E: '11111 10000 10000 11110 10000 10000 11111', F: '11111 10000 10000 11110 10000 10000 10000',
  G: '01110 10001 10000 10111 10001 10001 01110', H: '10001 10001 10001 11111 10001 10001 10001',
  I: '01110 00100 00100 00100 00100 00100 01110', J: '00111 00010 00010 00010 00010 10010 01100',
  K: '10001 10010 10100 11000 10100 10010 10001', L: '10000 10000 10000 10000 10000 10000 11111',
  M: '10001 11011 10101 10101 10001 10001 10001', N: '10001 11001 10101 10011 10001 10001 10001',
  O: '01110 10001 10001 10001 10001 10001 01110', P: '11110 10001 10001 11110 10000 10000 10000',
  Q: '01110 10001 10001 10001 10101 10010 01101', R: '11110 10001 10001 11110 10100 10010 10001',
  S: '01111 10000 10000 01110 00001 00001 11110', T: '11111 00100 00100 00100 00100 00100 00100',
  U: '10001 10001 10001 10001 10001 10001 01110', V: '10001 10001 10001 10001 10001 01010 00100',
  W: '10001 10001 10001 10101 10101 11011 10001', X: '10001 10001 01010 00100 01010 10001 10001',
  Y: '10001 10001 01010 00100 00100 00100 00100', Z: '11111 00001 00010 00100 01000 10000 11111',
  0: '01110 10001 10011 10101 11001 10001 01110', 1: '00100 01100 00100 00100 00100 00100 01110',
  2: '01110 10001 00001 00010 00100 01000 11111', 3: '11110 00001 00001 01110 00001 00001 11110',
  4: '00010 00110 01010 10010 11111 00010 00010', 5: '11111 10000 11110 00001 00001 10001 01110',
  6: '00110 01000 10000 11110 10001 10001 01110', 7: '11111 00001 00010 00100 01000 01000 01000',
  8: '01110 10001 10001 01110 10001 10001 01110', 9: '01110 10001 10001 01111 00001 00010 01100',
};
// not in the font: an open ring (the "O" of a radial brand shape)
const AA_RING = '01110 10001 10001 10001 10001 10001 01110';

// Faces whose character advance is 0.6em (the grid maths needs a known advance).
// Pixel faces count too when they are fixed-width and carry the box-drawing frame (measured: VT323, 0.4em).
// Silkscreen and Pixelify Sans are proportional and Press Start 2P has no box-drawing glyphs, so those
// cannot hold the character grid and fall through to the body mono or JetBrains Mono.
const AA_MONO_ADV = { 'JetBrains Mono': 0.6, 'IBM Plex Mono': 0.6, 'Fira Code': 0.6, 'Geist Mono': 0.6, 'DM Mono': 0.6, 'Azeret Mono': 0.6, 'Space Mono': 0.612, 'VT323': 0.4 };
const AA_LINE = 1.14;           // pre line-height in em
const AA_CELL_A = AA_LINE / 0.6; // height of a cell in widths of a cell
const aaCache = {};

function aaHash(i, j, s) {
  let h = (i * 374761393 + j * 668265263 + s * 2147483647) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

// The art face: the heading face when its class is mono or pixel (and it is fixed-width),
// else the body face when its class is mono, else JetBrains Mono. Returns { font, adv }.
function aaArtFace(st) {
  const h = st.headingFont, b = st.bodyFont;
  if (h && (h.cls === 'mono' || h.cls === 'pixel') && AA_MONO_ADV[h.name]) return { font: h, adv: AA_MONO_ADV[h.name] };
  if (b && b.cls === 'mono' && AA_MONO_ADV[b.name]) return { font: b, adv: AA_MONO_ADV[b.name] };
  const jb = (typeof FONTS !== 'undefined' && FONTS.find(f => f.name === 'JetBrains Mono')) || { name: 'JetBrains Mono', css: '"JetBrains Mono", monospace' };
  return { font: jb, adv: 0.6 };
}

// Brightness 0..1 for a cols x rows grid of cells.
function aaField(initial, cols, rows) {
  const key = initial + cols + 'x' + rows;
  if (aaCache[key]) return aaCache[key];
  const rowsBits = (AA_FONT[initial] || AA_RING).split(' ');
  const bit = (u, v) => {
    const c = Math.floor(u), r = Math.floor(v);
    return c >= 0 && c < 5 && r >= 0 && r < 7 && rowsBits[r][c] === '1' ? 1 : 0;
  };
  const W = cols, H = rows * AA_CELL_A;
  const p = (H * 0.9) / 7;
  const sx = cols > 60 ? 1.5 : 1;   // the wide panel stretches the glyph so it fills the field
  const cx = W / 2, cy = H / 2;
  const mask = (x, y) => bit((x - cx) / (p * sx) + 2.5, (y - cy) / p + 3.5);
  const blur = (x, y, sigma, step) => {
    const r = Math.ceil(sigma * 2.4 / step);
    let sum = 0, wsum = 0;
    for (let a = -r; a <= r; a++) for (let b = -r; b <= r; b++) {
      const dx = a * step, dy = b * step;
      const w = Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
      sum += w * mask(x + dx, y + dy); wsum += w;
    }
    return sum / wsum;
  };
  const out = new Float32Array(cols * rows);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const x = i + 0.5, y = (j + 0.5) * AA_CELL_A;
    const b1 = blur(x, y, 0.8, 0.5);
    const b2 = blur(x, y, 3.8, 1.1);
    const inner = Math.min(1, Math.max(0, (b1 - 0.5) / 0.4));
    // body: dense, brighter along the stroke core; halo: a soft falloff that stays dim
    let b = inner * (0.66 + 0.34 * Math.min(1, b2 * 1.7)) + (1 - inner) * (b1 * 0.85 + b2 * 1.05);
    // dust in the empty field
    if (b < 0.1) {
      const h = aaHash(i, j, 3);
      if (h < 0.06) b = 0.12 + 0.18 * aaHash(i, j, 7);
      else if (h < 0.07) b = 0.34;
    }
    out[j * cols + i] = Math.min(1, b);
  }
  aaCache[key] = out;
  return out;
}

// Brand gradient as a dither: each cell takes one of the pure brand hues, with the
// odds shifting across a transition band, so the hues never blend into mud
// (orange + teal averages to grey). primary -> secondary across 0.36..0.52, then a touch
// of accent past 0.9.
function aaCol(t, hexes, h) {
  const [a, b, c] = hexes;
  let hex;
  if (t < 0.36) hex = a;
  else if (t < 0.52) hex = h < (t - 0.36) / 0.16 ? b : a;
  else if (t < 0.9) hex = b;
  else hex = h < (t - 0.9) / 0.1 ? c : b;
  return hexToRgb(hex);
}
const aaRgb = c => '#' + [c.r, c.g, c.b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const aaEsc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// One <pre> panel (box-drawing frame, density-map field). cols/rows are the inner field.
function aaPanel(ctx, cols, rows, o) {
  const t = ctx.t;
  const field = aaField(ctx.initial, cols, rows);
  const grad = [t.primary, t.secondary, t.accent];
  const canvas = hexToRgb(t.canvas);
  const inkRgb = hexToRgb(t.ink);
  // inverse "selection" cells: three cells inside the glyph body, picked deterministically
  const sel = new Set();
  for (let n = 0, tries = 0; n < 4 && tries < 400; tries++) {
    const i = Math.floor(aaHash(tries, 11, 5) * cols), j = Math.floor(aaHash(tries, 17, 9) * rows);
    if (field[j * cols + i] > 0.78 && !sel.has(j * cols + i)) { sel.add(j * cols + i); n++; }
  }
  // annotation text laid into the field where it is empty (wide grid only)
  const notes = {};
  const put = (row, col, text, cls) => { notes[row] = (notes[row] || []).concat([[col, text, cls]]); };
  if (o.notes) {
    put(1, 3, 'density.map', 'k');
    put(2, 3, 'ramp ' + JSON.stringify(AA_RAMP).slice(1, -1), 'ramp');
    put(rows - 3, 3, `'${ctx.initial}' 5x7 → ${cols}x${rows}`, 'k');
    put(1, cols - 15, `cells ${String(cols * rows).padStart(5, ' ')}`, 'k');
    put(2, cols - 15, `levels   ${AA_RAMP.length}`, 'k');
  }
  const span = (txt, color, cls) => `<span${cls ? ` class="${cls}"` : ''} style="color:${color}">${aaEsc(txt)}</span>`;
  const lines = [];
  const slug = (ctx.brandName || 'brand').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, Math.max(6, cols - 20)) || 'brand';
  const fill = (n, ch) => ch.repeat(Math.max(0, n));
  const title = o.notes ? `┌─[ ${slug}.txt ]` : `┌─[ ${slug} ]`;
  lines.push(`<span class="aa-bd">${aaEsc(title + fill(cols + 2 - Array.from(title).length - 1, '─') + '┐')}</span>`);
  for (let j = 0; j < rows; j++) {
    let html = '<span class="aa-bd">│</span>';
    // build the row as char list then merge runs of the same style
    const cells = [];
    for (let i = 0; i < cols; i++) cells.push({ ch: ' ', style: null, cls: '' });
    for (let i = 0; i < cols; i++) {
      const b = field[j * cols + i];
      const idx = Math.min(9, Math.floor(b * 9.999));
      const tg = Math.min(1, 0.52 * (i / cols) + 0.5 * (j / rows));
      const g = aaCol(tg, grad, aaHash(i, j, 21));
      const fade = 0.4 + 0.6 * Math.min(1, b * 1.3);
      let rgb = { r: canvas.r + (g.r - canvas.r) * fade, g: canvas.g + (g.g - canvas.g) * fade, b: canvas.b + (g.b - canvas.b) * fade };
      // light mode: pale orange and teal vanish on cream, so each cell moves 35% toward ink
      if (!t.isDark) rgb = { r: rgb.r + (inkRgb.r - rgb.r) * 0.35, g: rgb.g + (inkRgb.g - rgb.g) * 0.35, b: rgb.b + (inkRgb.b - rgb.b) * 0.35 };
      const isSel = sel.has(j * cols + i);
      cells[i] = { ch: AA_RAMP[idx], style: aaRgb(rgb), cls: isSel ? 'sel' : '' };
    }
    (notes[j] || []).forEach(([col, text, cls]) => {
      Array.from(text).forEach((ch, k) => {
        const i = col + k;
        if (i < 0 || i >= cols) return;
        cells[i] = { ch, style: cls === 'ramp' && k >= 5 ? aaRgb(aaCol(Math.min(1, (k - 5) / 10), grad, aaHash(k, 3, 2))) : null, cls: cls === 'ramp' && k >= 5 ? 'rp' : 'note' };
      });
    });
    let k = 0;
    while (k < cols) {
      let m = k + 1;
      while (m < cols && cells[m].style === cells[k].style && cells[m].cls === cells[k].cls) m++;
      const c = cells[k];
      const txt = cells.slice(k, m).map(x => x.ch).join('');
      if (c.cls === 'sel') html += `<span class="sel" style="background:${t.accent};color:${t.canvas}">${aaEsc(txt)}</span>`;
      else if (c.cls === 'note') html += `<span class="note">${aaEsc(txt)}</span>`;
      else if (c.style) html += span(txt, c.style, c.cls === 'rp' ? 'rp' : '');
      else html += aaEsc(txt);
      k = m;
    }
    html += '<span class="aa-bd">│</span>';
    lines.push(html);
  }
  const foot = `└─ ${cols}×${rows} · ${AA_RAMP.length - 1} levels `;
  lines.push(`<span class="aa-bd">${aaEsc(foot + fill(cols + 2 - Array.from(foot).length - 1, '─') + '┘')}</span>`);
  return `<pre class="aa-pre ${o.cls}" style="--aa-cols:${cols + 2}">${lines.join('\n')}</pre>`;
}

registerAesthetic({
  key: 'ascii-art', order: 25,
  name: 'ASCII Art',
  descriptor: 'Textual · Generative · Nerdy',
  influences: 'Text-mode art / Terminal UI / Generative ASCII',
  summary: 'Everything built from monospace characters on a grid, with box-drawing panels and density-map art.',
  motto: 'Everything is a character.',
  kicker: 'cat brand.txt',
  mode: 'dark',
  slideShape: 'minimal',
  labels: { material: 'Characters', states: ['Sparse', 'Dense', 'Solid'], statesKind: 'swatch' },
  layout: { hero: 'centered', palette: 'swatches', sections: 'two-col' },
  type: { ui: 'mono', label: 'mono' },
  highlight: 'custom',
  highlightNote: 'The last word is set in the accent (shaded to read as text) in the heading face and is followed by a blinking block caret; no fill, no band.',
  cardFill: '--ab-panel',

  roles: {
    canvas: { use: 'The screen: page and every panel (panels are a 4% ink lift of it, framed by 1px lines)', never: 'Text' },
    ink: { use: 'Headline, body text, frames and the brightest characters of the density map', never: 'Large filled fields' },
    primary: { use: 'The one CTA bar, the selected [ segment ], the [■ ON ] switch and the start of the density-map gradient', never: 'Body text, borders, a second CTA' },
    secondary: { use: 'Prompts ($, >), progress blocks, status brackets and the middle of the density-map gradient', never: 'The main CTA, body text, the page background' },
    accent: { use: 'One spark: the last headline word, the footer block and a few inverse cells in the art', never: 'Buttons, body text, borders, large fills' },
  },

  tokens(t) {
    const st = typeof state !== 'undefined' ? state : null;
    const vars = {
      '--ab-type-pick-w': 400,
      '--ab-panel': t.mix(t.canvas, t.ink, t.isDark ? 0.94 : 0.965),
      '--ab-frame': t.mix(t.canvas, t.ink, 0.72),
      '--ab-tr': (st && st.headingFont && { condensed: 0, heavy: 0, wide: 0.4, techno: 0.4, pixel: 0 }[st.headingFont.cls]) ?? 1,
    };
    // secondary readable as text (prompts, status): shaded toward ink until it reaches 4.5:1 on the canvas
    let sec = t.secondary;
    for (let k = 1; k <= 20 && t.contrast(sec, t.canvas) < 4.5; k++) sec = t.mix(t.secondary, t.ink, 1 - k * 0.05);
    vars['--aa-sec'] = sec;
    if (st && st.headingFont) {
      const f = aaArtFace(st);
      vars['--aa-font'] = f.font.css;
      vars['--aa-adv'] = f.adv;
      vars['--aa-line'] = +(f.adv * AA_CELL_A).toFixed(3); // keeps the cell 1.9 : 1 for every face
      // interface text in the brand's own mono when it has one, else the art face
      const ui = st.bodyFont && st.bodyFont.category === 'mono' ? 'var(--ab-font-b)' : f.font.css;
      vars['--ab-font-ui'] = ui;
      vars['--ab-font-label'] = ui;
    }
    return vars;
  },

  art(ctx) {
    const wide = aaPanel(ctx, 88, 17, { cls: 'aa-wide', notes: true });
    const narrow = aaPanel(ctx, 40, 20, { cls: 'aa-narrow', notes: false });
    return `<div class="aa">${wide}${narrow}</div>`;
  },

  materials: [
    { name: 'Density ramp', css: 'font-family: JetBrains Mono, IBM Plex Mono or Space Mono; /* characters " .:-=+*#%@" chosen by brightness (0 to 9); each cell coloured along {primary}, {secondary}, {accent} and faded toward {canvas} as it dims */' },
    { name: 'Frame', css: 'border: 1px solid {line}; border-radius: 0; background: {canvas}; /* panels carry their title in the top edge as ┤ TITLE ├; in the art the frame is real ┌─┐│└┘ characters */' },
    { name: 'Segmented control', css: 'text: "[ Design ]  Build   Launch"; color: {primary}; /* brackets mark the selected item; the others sit at the same width without them */' },
    { name: 'Primary action', css: 'background: {primary}; color: {onPrimary}; border-radius: 0; /* label "> Save direction" followed by a blinking █ block caret; static under reduced motion */' },
    { name: 'Switch', css: 'text: "[■ ON ]" in {primary}, "[□ OFF]" in {muted}; no track, no knob.' },
    { name: 'Progress', css: 'repeating 1ch cells: filled {secondary}, empty {line}; /* █████░░░░░ rendered as 6px cells on a 1ch pitch */' },
    { name: 'Selection', css: 'background: {accent}; color: {canvas}; /* inverse video, used on a few cells of the art only */' },
  ],

  rules: {
    do: [
      'Build every image from the character ramp " .:-=+*#%@" on a monospace grid, choosing the character by brightness and colouring each cell along the brand gradient.',
      'Frame panels with 1px lines titled in their top edge (┤ TITLE ├) and write controls as text: [ Design ] Build, [■ ON ], > Save direction █.',
      'Set the headline and every label in a monospace or pixel face, with the highlight word in the accent and prompt characters ($, >, //) in secondary.',
      'Keep the field mostly empty: sparse dots and a few annotations make the dense glyph read.',
    ],
    dont: [
      'Use sprites, stepped pixel borders, rounded corners, shadows or glows on controls; characters are the medium.',
      'Mix a proportional face into the interface or the art.',
      'Fill panels with primary or accent; only the CTA bar, the selected item and the switch carry primary.',
      'Let the density map run edge to edge with no empty cells, or colour it with more than the three brand hues.',
    ],
  },
});
