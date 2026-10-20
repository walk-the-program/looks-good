/* 25 ASCII Art — textual, generative, nerdy. Reference: Andreas Gysin's character-field
   sites (every pixel a glyph), the 16colo.rs ANSI archive (block glyphs, quantised CGA
   colour), FIGlet-style block headlines and line ASCII (edges drawn with / \ | _ -).

   Mechanism.
   - Colour is quantised: the client colours snap to the nearest of the 16 CGA/ANSI colours
     (only the 7 dark ones on light paper) for every glyph; the exact client hex appears only
     in readout text. Canvas is pure #000 (dark) or #F4F1E8 paper (light).
   - The headline is drawn by def.headline(): block letters built from the 5x7 bitmap font
     (AB_FONT_5X7) at one █ per pixel with a ▒ drop shadow (8 rows), wrapped by words; a
     4-row half-block version (▀▄█) for narrow boards. The real text is the h2 aria-label.
   - The hero is rasterised, not drawn: the brand initial is set in the heading face on an
     offscreen canvas (the brand's first word on wide panels, the initial on narrow ones) at 4 x 7.6 px per cell (cell aspect 0.6 : 1.14 corrected), each cell's
     luminance picks one of a 70-step ramp, and an edge pass swaps in / \ | _ - by gradient
     direction (line ASCII). Colour comes from one field (diagonal hard bands of the ANSI
     primary and secondary), never per-cell random. The empty field carries a sparse dust
     that drifts 0.2 cells/s (a 5 s ticker; static under reduced motion) and the frame's foot
     is a live status line. The ticker also re-rasterises once the heading font has loaded. */

// 70-step ramp, light to dense
const AA_RAMP = " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
const AA_PUNCT = {
  '.': '00000 00000 00000 00000 00000 01100 01100', ',': '00000 00000 00000 00000 01100 00100 01000',
  '!': '00100 00100 00100 00100 00100 00000 00100', '?': '01110 10001 00001 00110 00100 00000 00100',
  "'": '00100 00100 01000 00000 00000 00000 00000', '-': '00000 00000 00000 11111 00000 00000 00000',
  '&': '01100 10010 10100 01000 10101 10010 01101', ':': '00000 01100 01100 00000 01100 01100 00000',
};
const AA_CGA = ['#0000AA', '#00AA00', '#00AAAA', '#AA0000', '#AA00AA', '#AA5500', '#AAAAAA', '#555555', '#5555FF', '#55FF55', '#55FFFF', '#FF5555', '#FF55FF', '#FFFF55', '#FFFFFF'];
// On black the dark blue, red and magenta (1.5-3:1) are dropped: those hues snap to their bright twins (#5555FF, #FF5555, #FF55FF).
const AA_CGA_ON_BLACK = AA_CGA.filter(h => !['#0000AA', '#AA0000', '#AA00AA'].includes(h));
const AA_CGA_DARK = ['#0000AA', '#00AA00', '#00AAAA', '#AA0000', '#AA00AA', '#AA5500', '#555555'];

// Faces whose character advance is 0.6em (the grid maths needs a known advance).
// Pixel faces count too when they are fixed-width and carry the box-drawing frame (measured: VT323, 0.4em).
const AA_MONO_ADV = { 'JetBrains Mono': 0.6, 'IBM Plex Mono': 0.6, 'Fira Code': 0.6, 'Geist Mono': 0.6, 'DM Mono': 0.6, 'Azeret Mono': 0.6, 'Space Mono': 0.612, 'VT323': 0.4 };
const AA_LINE = 1.14;           // pre line-height in em
const AA_CELL_A = AA_LINE / 0.6; // height of a cell in widths of a cell
const aaCache = {};
const aaLive = {};

function aaHash(i, j, s) {
  let h = (i * 374761393 + j * 668265263 + s * 2147483647) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

// OKLCH lightness, chroma and hue of a hex (for the hue-aware ANSI snap)
function aaOk(hex) {
  const c = hexToRgb(hex);
  const lin = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const r = lin(c.r), g = lin(c.g), b = lin(c.b);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const q = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * q, B = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * q;
  return { L: 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * q, C: Math.hypot(A, B), h: (Math.atan2(B, A) * 180 / Math.PI + 360) % 360 };
}
// Nearest ANSI colour from the given set. A chromatic client colour (OKLCH chroma > 0.035) never snaps
// to a grey: it takes the chromatic ANSI colour of the nearest hue (lightness only picks between the dark
// and the bright variant of that hue). A grey or near-grey keeps the plain weighted RGB distance.
function aaCga(hex, set) {
  const a = aaOk(hex);
  if (a.C > 0.035) {
    let best = null, bd = Infinity;
    set.forEach(h => {
      const b = aaOk(h);
      if (b.C < 0.05) return;
      let dh = Math.abs(a.h - b.h); if (dh > 180) dh = 360 - dh;
      const d = (dh / 30) ** 2 + ((a.L - b.L) / 0.4) ** 2;
      if (d < bd) { bd = d; best = h; }
    });
    if (best) return best;
  }
  const c = hexToRgb(hex);
  let best = set[0], bd = Infinity;
  set.forEach(h => { const b = hexToRgb(h); const d = 2 * (c.r - b.r) ** 2 + 4 * (c.g - b.g) ** 2 + 3 * (c.b - b.b) ** 2; if (d < bd) { bd = d; best = h; } });
  return best;
}
// Primary and secondary from the set that holds on the stock (the dark CGA colours on paper); the accent
// from the same set on paper (so the chip and the 3:1 highlight word are one colour family), from all
// sixteen on black.
function aaQuant(t) {
  const set = t.isDark ? AA_CGA_ON_BLACK : AA_CGA_DARK;
  const p = aaCga(t.primary, set);
  const sc = aaCga(t.secondary, set.filter(h => h !== p));
  const ac = aaCga(t.accent, (t.isDark ? AA_CGA_ON_BLACK : AA_CGA_DARK).filter(h => h !== p && h !== sc && h !== '#FFFFFF'));
  return { p, s: sc, a: ac };
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

// ---- block-letter headline -------------------------------------------------------------
function aaBits(ch) { return (AB_FONT_5X7[ch] || AA_PUNCT[ch] || '').split(' ').filter(Boolean); }
function aaWrap(words, max) {
  const lines = []; let cur = [], n = 0;
  words.forEach(w => { if (cur.length && n + w.length + 1 > max) { lines.push(cur); cur = []; n = 0; } cur.push(w); n += w.length + (cur.length > 1 ? 1 : 0); });
  if (cur.length) lines.push(cur);
  return lines;
}
// wide: 8 rows (7 + shadow), 7 cols per letter; narrow: 4 rows of half blocks, 6 cols per letter
function aaFig(words, hlFrom, narrow) {
  const lines = aaWrap(words, narrow ? 8 : 13);
  let maxCols = 0;
  let wi = 0;
  const out = lines.map(line => {
    const rows = narrow ? 4 : 8;
    const cells = [];
    const put = (r, c, ch, cls) => { (cells[r] = cells[r] || [])[c] = { ch, cls }; };
    let x = 0;
    line.forEach((w, k) => {
      const hl = wi >= hlFrom; wi++;
      if (k) x += narrow ? 2 : 3;
      Array.from(w.toUpperCase()).forEach(ch => {
        const b = aaBits(ch);
        if (b.length) {
          if (narrow) {
            for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) {
              const top = b[r * 2] && b[r * 2][c] === '1', bot = b[r * 2 + 1] && b[r * 2 + 1][c] === '1';
              if (top || bot) put(r, x + c, top && bot ? '█' : top ? '▀' : '▄', hl ? 'h' : 'g');
            }
          } else {
            for (let r = 0; r < 7; r++) for (let c = 0; c < 5; c++) if (b[r][c] === '1') {
              put(r, x + c, '█', hl ? 'h' : 'g');
              const sr = r + 1, sc = x + c + 1;
              const own = sr < 7 && c + 1 < 5 && b[sr][c + 1] === '1';
              if (!own && !(cells[sr] && cells[sr][sc] && cells[sr][sc].ch === '█')) put(sr, sc, '▒', 'w');
            }
          }
        }
        x += narrow ? 6 : 7;
      });
    });
    maxCols = Math.max(maxCols, x);
    const text = [];
    for (let r = 0; r < rows; r++) {
      const row = cells[r] || [];
      let html = '', k = 0;
      while (k < x) {
        const c = row[k] || { ch: ' ', cls: '' };
        let m = k + 1, txt = c.ch;
        while (m < x && ((row[m] || { cls: '' }).cls === c.cls)) { txt += (row[m] || { ch: ' ' }).ch; m++; }
        html += c.cls ? `<span class="aa-${c.cls}">${escapeHtml(txt)}</span>` : escapeHtml(txt);
        k = m;
      }
      text.push(html);
    }
    return `<span class="aah-l">${text.join('\n')}</span>`;
  }).join('');
  return { html: out, cols: maxCols };
}

// ---- rasterised hero ---------------------------------------------------------------------
function aaFontReady(fam) {
  try { return !document.fonts || document.fonts.check(`600 40px ${fam}`); } catch (e) { return true; }
}
function aaRaster(text, fam, cols, rows) {
  const ready = aaFontReady(fam);
  const key = `${text}|${fam}|${cols}x${rows}|${ready}`;
  if (aaCache[key]) return aaCache[key];
  const SX = 4, SY = 4 * AA_CELL_A;
  const W = cols * SX, H = Math.round(rows * SY);
  const lum = new Float32Array(cols * rows);
  if (typeof document !== 'undefined' && document.createElement) {
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const g = cv.getContext ? cv.getContext('2d') : null;
    if (g) {
      g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
      let size = H * 1.18;
      g.font = `600 ${size}px ${fam}`;
      const m = g.measureText(text);
      const asc = m.actualBoundingBoxAscent || size * 0.72, desc = m.actualBoundingBoxDescent || 0;
      const k = Math.min((H * 0.86) / (asc + desc), (W * 0.9) / Math.max(1, m.width));
      size *= k; g.font = `600 ${size}px ${fam}`;
      const m2 = g.measureText(text);
      const a2 = m2.actualBoundingBoxAscent || size * 0.72, d2 = m2.actualBoundingBoxDescent || 0;
      g.fillText(text, W / 2, (H + a2 - d2) / 2);
      const px = g.getImageData(0, 0, W, H).data;
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        let sum = 0, n = 0;
        for (let y = Math.floor(j * SY); y < Math.floor((j + 1) * SY); y++) for (let x = i * SX; x < (i + 1) * SX; x++) { sum += px[(y * W + x) * 4]; n++; }
        lum[j * cols + i] = n ? sum / n / 255 : 0;
      }
    }
  }
  aaCache[key] = lum;
  return lum;
}

// cells for one panel: { ch, cls, col } with the edge pass and a single colour field
function aaCells(ctx, cols, rows, fam) {
  const L = aaRaster(ctx.word || ctx.initial, fam, cols, rows);
  const at = (i, j) => (i < 0 || j < 0 || i >= cols || j >= rows ? 0 : L[j * cols + i]);
  const cells = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const v = at(i, j);
    // light falls from the upper left across the glyph, so the interior is shaded, not a flat @@@ slab
    const shade = 0.62 + 0.38 * (1 - (i / cols) * 0.6 - (j / rows) * 0.4);
    const gx = at(i + 1, j) - at(i - 1, j), gy = (at(i, j + 1) - at(i, j - 1)) / AA_CELL_A;
    const mag = Math.hypot(gx, gy);
    let ch = null;
    if (mag > 0.32 && v > 0.12 && v < 0.92) {
      const ang = (Math.atan2(gy, gx) * 180 / Math.PI + 180) % 180;   // gradient direction; the edge runs across it
      ch = ang < 22.5 || ang >= 157.5 ? '|' : ang < 67.5 ? '/' : ang < 112.5 ? (gy > 0 ? '_' : '-') : '\\';
    }
    const tone = v * shade;
    const idx = Math.min(AA_RAMP.length - 1, Math.floor(tone * (AA_RAMP.length - 1) + 0.5));
    if (!ch) ch = v > 0.04 ? AA_RAMP[Math.max(1, idx)] : ' ';
    const band = (i / cols) * 0.62 + (j / rows) * 0.38 < 0.52 ? 'p' : 's';
    cells.push({ ch, cls: v > 0.04 ? band : '' });
  }
  return cells;
}
function aaRows(cells, cols, rows, drift) {
  const lines = [];
  for (let j = 0; j < rows; j++) {
    let html = '', k = 0;
    const row = cells.slice(j * cols, (j + 1) * cols).map((c, i) => {
      if (c.ch !== ' ') return c;
      const h = aaHash(i + drift, j, 3);
      return h < 0.05 ? { ch: h < 0.02 ? '.' : h < 0.035 ? '`' : ':', cls: 'd' } : c;
    });
    while (k < cols) {
      let m = k + 1;
      while (m < cols && row[m].cls === row[k].cls) m++;
      const txt = row.slice(k, m).map(x => x.ch).join('');
      html += row[k].cls ? `<span class="aa-${row[k].cls}">${escapeHtml(txt)}</span>` : escapeHtml(txt);
      k = m;
    }
    lines.push(`<span class="aa-bd">│</span>${html}<span class="aa-bd">│</span>`);
  }
  return lines;
}
function aaFrameTop(title, cols) { const t = `┌─[ ${title} ]`; return t + '─'.repeat(Math.max(0, cols + 1 - Array.from(t).length)) + '┐'; }
function aaFrameFoot(status, cols) { const t = `└─[ ${status} ]`; return t + '─'.repeat(Math.max(0, cols + 1 - Array.from(t).length)) + '┘'; }
function aaPanelHtml(key, frame) {
  const e = aaLive[key];
  if (!e) return '';
  const rows = aaRows(e.cells, e.cols, e.rows, frame);
  const status = abCopyRaw('ascii-art', 'frameStatus').replace('{slug}', () => e.slug).replace('{n}', () => String(frame).padStart(4, '0'));
  return [`<span class="aa-bd">${escapeHtml(aaFrameTop(abCopyRaw('ascii-art', 'frameFile').replace('{slug}', () => e.slug), e.cols))}</span>`, ...rows, `<span class="aa-bd aa-live">${escapeHtml(aaFrameFoot(status, e.cols))}</span>`].join('\n');
}
function aaPanel(ctx, cols, rows, cls) {
  const st = ctx.state || (typeof state !== 'undefined' ? state : null);
  const fam = st && st.headingFont ? (st.headingFont.cls === 'mono' || st.headingFont.cls === 'pixel' ? st.headingFont.css : aaArtFace(st).font.css) : '"JetBrains Mono", monospace';
  const slug = (ctx.brandName || 'brand').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, Math.max(6, cols - 24)) || 'brand';
  // the wide panel rasterises the brand's first word (up to 10 letters), the narrow one the initial
  const first = String(ctx.brandName || '').trim().split(/\s+/)[0] || '';
  const word = cols > 60 && first.length > 1 && first.length <= 10 ? first.toUpperCase() : ctx.initial;
  const key = `${word}|${fam}|${cols}x${rows}|${slug}`;
  aaLive[key] = { cells: aaCells({ initial: ctx.initial, word }, cols, rows, fam), cols, rows, slug, fam, ctx: { initial: ctx.initial, word } };
  aaTick();
  return `<pre class="aa-pre ${cls}" data-aak="${escapeHtml(key)}" style="--aa-cols:${cols + 2}">${aaPanelHtml(key, aaFrameNow())}</pre>`;
}
function aaFrameNow() {
  const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  return reduce ? 0 : Math.floor(Date.now() / 5000) % 10000;   // 1 cell per 5 s = 0.2 cells/s
}
// One shared ticker: every 5 s it shifts the dust one cell and re-rasterises once the heading font has loaded.
let aaTimer = null;
function aaTick() {
  if (aaTimer || typeof setInterval !== 'function' || typeof document === 'undefined') return;
  aaTimer = setInterval(() => {
    const els = document.querySelectorAll('.ab[data-ae="ascii-art"] .aa-pre[data-aak]');
    if (!els.length) { clearInterval(aaTimer); aaTimer = null; return; }
    const f = aaFrameNow();
    els.forEach(el => {
      const k = el.getAttribute('data-aak'), e = aaLive[k];
      if (!e) return;
      const ready = aaFontReady(e.fam);
      if (ready && !e.ready) { e.cells = aaCells(e.ctx, e.cols, e.rows, e.fam); e.ready = true; el.dataset.f = ''; }
      if (el.dataset.f !== String(f)) { el.innerHTML = aaPanelHtml(k, f); el.dataset.f = String(f); }
    });
  }, 1000);
}

// The background character field: sparse light ramp characters on 10px cells, ink at ~8%.
function aaFieldUri(ink) {
  const cols = 40, rows = 20, cw = 10, ch = 19;
  let rowsSvg = '';
  for (let j = 0; j < rows; j++) {
    let line = '';
    for (let i = 0; i < cols; i++) {
      const f = 0.5 + 0.5 * Math.sin(i * 0.31 + j * 0.47) * Math.cos(i * 0.13 - j * 0.29);
      const h = aaHash(i, j, 41);
      line += h < f * 0.55 ? AA_RAMP[1 + Math.floor(aaHash(i, j, 43) * 14 * f)] : ' ';
    }
    rowsSvg += `<text x="0" y="${j * ch + 14}" textLength="${cols * cw}" lengthAdjust="spacing" xml:space="preserve">${escapeHtml(line)}</text>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cols * cw}" height="${rows * ch}"><g font-family="ui-monospace,Menlo,monospace" font-size="13" fill="${ink}" fill-opacity=".09">${rowsSvg}</g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg).replace(/'/g, '%27')}")`;
}

registerAesthetic({
  key: 'ascii-art', order: 25,
  name: 'ASCII Art',
  descriptor: 'Textual · Generative · Nerdy',
  influences: 'Character-field sites / ANSI art / FIGlet',
  summary: 'Every pixel is a glyph: block-letter headlines, a rasterised character hero, controls written as text, colour quantised to the 16 ANSI colours.',
  motto: 'Everything is a character.',
  kicker: 'cat brand.txt',
  mode: 'dark',
  slideShape: 'minimal',
  labels: { material: 'Characters', states: ['Sparse', 'Dense', 'Solid'], statesKind: 'swatch' },
  // Editable specimen copy (Brand > Advanced > Specimen copy). Frame strings flex: the frame rules are padded by width.
  copy: {
    motto: { label: 'Motto', text: 'Everything is a character.' },
    kicker: { label: 'Kicker above the headline', text: 'cat brand.txt' },
    state0: { label: 'State 1 name', text: 'Sparse' },
    state1: { label: 'State 2 name', text: 'Dense' },
    state2: { label: 'State 3 name', text: 'Solid' },
    frameFile: { label: 'Character frame title ({slug} = brand slug)', text: '{slug}.txt' },
    frameStatus: { label: 'Character frame status ({slug}, {n} = frame number)', text: '{slug} \u00B7 frame {n}' },
  },
  layout: { hero: 'centered', palette: 'swatches', sections: 'two-col' },
  type: { ui: 'mono', label: 'mono' },
  highlight: 'custom',
  highlightNote: 'The headline is block letters built from characters (█ with a ▒ shadow); the last word is set in the ANSI-quantised accent. No fill, no band.',
  cardFill: '--ab-panel',

  roles: {
    canvas: { use: 'The screen: pure #000 (dark) or #F4F1E8 paper (light), with a faint character field behind the sections, which read as cut-outs', never: 'Text, a tinted dark grey' },
    ink: { use: 'Block-letter headline, body text, frames, the brightest characters', never: 'Large filled fields' },
    primary: { use: 'Snapped to the nearest ANSI colour: the hero\'s first colour band, the CTA frame, the selected segment, the [x] switch', never: 'Body text, borders, a second CTA, the raw client hex on a glyph' },
    secondary: { use: 'Snapped to the nearest ANSI colour: the hero\'s second band, prompts ($, >), progress blocks, status brackets', never: 'The main CTA, body text, the page background' },
    accent: { use: 'Snapped to the nearest ANSI colour: the last headline word and the footer block', never: 'Buttons, body text, borders, large fills' },
  },

  canvas(b) { return b.isDark ? '#000000' : '#F4F1E8'; },
  // Glyph colour is quantised: the primary prints as its nearest ANSI colour (the readouts keep the client hex).
  printPrimary(t) { return aaQuant(t).p; },

  headline(ctx, text) {
    const words = String(text || '').trim().split(/\s+/).filter(Boolean);
    if (!words.length) return '';
    const w = aaFig(words, words.length - 1, false), n = aaFig(words, words.length - 1, true);
    return `<span class="aah aah-w" style="--fc:${w.cols}">${w.html}</span><span class="aah aah-n" style="--fc:${n.cols}">${n.html}</span>`;
  },

  tokens(t, view) {
    const st = view || (typeof state !== 'undefined' ? state : null);
    const q = aaQuant(t);
    const hx = h => `"0x${String(h).replace('#', '').toUpperCase()}"`;
    const vars = {
      '--ab-type-pick-w': 400,
      '--ab-panel': t.canvas,
      '--ab-frame': t.mix(t.canvas, t.ink, 0.62),
      '--ab-tr': (st && st.headingFont && { condensed: 0, heavy: 0, wide: 0.4, techno: 0.4, pixel: 0 }[st.headingFont.cls]) ?? 1,
      '--ab-secondary': q.s, '--ab-accent': q.a, '--ab-on-accent': t.readable(q.a),
      '--aa-q-p': q.p, '--aa-q-s': q.s, '--aa-q-a': q.a,
      '--aa-field': aaFieldUri(t.ink),
    };
    // text-safe versions (prompts 4.5:1, the highlight word 3:1), shaded toward ink
    const safe = (hex, min) => { let c = hex; for (let k = 1; k <= 20 && t.contrast(c, t.canvas) < min; k++) c = t.mix(hex, t.ink, 1 - k * 0.05); return c; };
    vars['--aa-sec'] = safe(q.s, 4.5);
    vars['--ab-accent-ink'] = safe(q.a, 3);
    vars['--ab-primary-text'] = safe(q.p, 4.5);
    // on paper the accent chip shows the colour the highlight word actually prints (shaded to 3:1 when needed)
    if (!t.isDark) { vars['--aa-q-a'] = vars['--ab-accent-ink']; vars['--ab-accent'] = vars['--ab-accent-ink']; vars['--ab-on-accent'] = t.readable(vars['--ab-accent-ink']); }
    // readouts print the client hex as a register value: 0xE4572E
    Object.assign(vars, { '--aa-hx-canvas': hx(t.canvas), '--aa-hx-ink': hx(t.ink), '--aa-hx-primary': hx(t.primary), '--aa-hx-secondary': hx(t.secondary), '--aa-hx-accent': hx(t.accent) });
    if (st && st.headingFont) {
      const f = aaArtFace(st);
      vars['--aa-font'] = f.font.css;
      vars['--aa-adv'] = f.adv;
      vars['--aa-line'] = +(f.adv * AA_CELL_A).toFixed(3); // keeps the cell 1.9 : 1 for every face
      const ui = st.bodyFont && st.bodyFont.category === 'mono' ? 'var(--ab-font-b)' : f.font.css;
      vars['--ab-font-ui'] = ui;
      vars['--ab-font-label'] = ui;
    }
    return vars;
  },

  art(ctx) {
    return `<div class="aa">${aaPanel(ctx, 88, 12, 'aa-wide')}${aaPanel(ctx, 40, 20, 'aa-narrow')}</div>`;
  },

  materials: [
    { name: 'Block letters', css: 'white-space: pre; /* headlines are built from characters: █ per pixel of a 5x7 font with a ▒ shadow (8 rows), or ▀▄█ half blocks (4 rows) on phones */' },
    { name: 'Rasterised field', css: 'font-family: JetBrains Mono or IBM Plex Mono; /* the image is set in the heading face on a canvas, read per cell (aspect 0.6 : 1.14), mapped to a 70-step ramp, with / \\ | _ - on the edges */' },
    { name: 'ANSI colour', css: 'color: nearest of the 16 CGA colours to {primary} / {secondary} / {accent}; /* glyphs never carry the raw client hex; readouts print it as 0xE4572E */' },
    { name: 'Glyph swatch', css: 'content: "████████████\\A██████▓▓▒▒░░\\A▓▓▓▓▒▒▒░░░"; /* 12 x 3 cells of block shades in the quantised colour */' },
    { name: 'Controls as text', css: 'text: "< Design | Build | Launch >", "[x] Focus mode", "> Save direction █"; /* the selected item in inverse video; frames are 1px lines on the character grid */' },
    { name: 'Character field', css: 'background: sparse ramp characters on 10px cells, ink at ~8%; /* sections read as cut-outs in it */' },
  ],

  rules: {
    do: [
      'Make every pixel a glyph: headlines in block letters, swatches in block shades, controls written as text, images from a 70-step ramp.',
      'Rasterise images at the cell aspect and draw their edges with / \\ | _ -, so a letter reads as that letter.',
      'Quantise colour to the 16 ANSI colours; the exact client hex lives only in readouts.',
      'Lay a faint character field behind everything and cut the sections out of it.',
    ],
    dont: [
      'Set the hero headline as plain mono text; build it from block letters.',
      'Use CSS colour bars, rounded corners, shadows or a pixel face.',
      'Colour cells at random; colour comes from one field.',
      'Leave debug labels as decoration.',
    ],
  },
  // Deck copy (js/brand-deck.js): three principles, three do / don't lines, each short.
  deck: {
    marks: { do: '[x]', dont: '[ ]' },
    principles: [
      ['Everything is a character', 'Headlines, swatches and images are glyphs.'],
      ['Sixteen colours', 'Client colours snap to the ANSI palette.'],
      ['Edges in line ASCII', 'Slashes, bars and underscores draw the outline.'],
    ],
    do: [
      'Build headlines from block letters.',
      'Write controls as text.',
      'Snap colour to ANSI.',
    ],
    dont: [
      'Set the hero headline as plain mono text.',
      'Use CSS bars or rounded corners.',
      'Colour cells at random.',
    ],
  },
});
