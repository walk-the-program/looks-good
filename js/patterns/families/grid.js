/* patterns/families/grid.js — grid and block families:
   pixelquilt, gradpanes, glyphgrid, modulargrid, signal. */
(function (global) {
  'use strict';
  const P = global.Patterns, E = P.E;
  const SEL = E.sel;
  const TAU = Math.PI * 2;

  /* ---------- 7. Pixel quilt ---------- */
  const tri = (v, n) => Math.abs(((v % n) + n) % n - n / 2);
  const MOTIFS = {
    checker: (x, y) => (x + y) & 1,
    checker2: (x, y) => ((x >> 1) + (y >> 1)) & 1,
    brick: (x, y) => { const r = y >> 1; return (y & 1) || ((x + (r & 1) * 2) % 4 === 0) ? 1 : 0; },
    plaid: (x, y) => ((x % 6 < 2) ? 1 : 0) ^ ((y % 6 < 2) ? 1 : 0),
    diag: (x, y) => ((x + y) % 4 < 2 ? 1 : 0),
    ramp: (x, y, n) => (E.bayer4.at(x, y) < (x + 0.5) / n ? 1 : 0),
    rampv: (x, y, n) => (E.bayer4.at(x, y) < (y + 0.5) / n ? 1 : 0),
    stairs: (x, y) => (x <= ((y >> 1) << 1) ? 1 : 0),
    diamond: (x, y, n) => { const c = (n - 1) / 2; return ((Math.abs(x - c) + Math.abs(y - c)) % 4 < 2 ? 1 : 0); },
    dots: (x, y) => ((x & 1) === 0 && (y & 1) === 0 ? 1 : 0),
    cross: (x, y, n) => (x === y || x + y === n - 1 || x === (n >> 1) || y === (n >> 1) ? 1 : 0),
    frame: (x, y, n) => (Math.min(x, y, n - 1 - x, n - 1 - y) % 2 === 0 ? 1 : 0),
    zig: (x, y, n) => (x % 4 === Math.round(tri(y, 4)) + (y & 4 ? 1 : 0) ? 1 : 0) || ((x + 2) % 4 === Math.round(tri(y, 4)) ? 1 : 0),
    half: (x, y, n) => (x + y >= n - 1 ? 1 : 0),
    bayer: (x, y, n) => (E.bayer8.at(x, y) < 0.5 ? 1 : 0),
  };
  const MOTIF_SETS = {
    all: ['checker', 'checker2', 'brick', 'plaid', 'diag', 'ramp', 'rampv', 'stairs', 'diamond', 'dots', 'cross', 'frame', 'half'],
    geometric: ['checker2', 'plaid', 'stairs', 'diamond', 'cross', 'frame', 'half', 'brick'],
    dither: ['ramp', 'rampv', 'diag', 'dots', 'checker', 'bayer', 'checker2'],
  };

  P.register({
    key: 'pixelquilt', name: 'Pixel quilt', category: 'Pixel & grid',
    blurb: 'A patchwork of coarse-pixel swatches: brick, plaid, checker, dithered ramps and stair steps.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: true, seamless: true,
    common: { grain: 0.06 },
    params: [
      { key: 'px', label: 'Pixel size', type: 'range', min: 0.4, max: 2.2, step: 0.05, default: 0.85 },
      { key: 'block', label: 'Swatch (pixels)', type: 'range', min: 4, max: 14, step: 1, default: 8 },
      { key: 'motifs', label: 'Motifs', type: 'select', options: SEL(['all', 'geometric', 'dither']), default: 'all' },
      { key: 'big', label: 'Big swatches', type: 'range', min: 0, max: 0.4, step: 0.02, default: 0.14 },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      g.fill(inks.ground);
      const n = p.block;
      const cs0 = Math.max(2, Math.round(p.px * env.u * p.scale));
      let nbx = Math.max(1, Math.ceil(W / (n * cs0))), nby = Math.max(1, Math.ceil(H / (n * cs0)));
      let csx = cs0, csy = cs0;
      if (env.tile) { nbx = Math.max(2, Math.round(W / (n * cs0))); nby = Math.max(2, Math.round(H / (n * cs0))); csx = W / (nbx * n); csy = H / (nby * n); }
      const occ = new Uint8Array(nbx * nby);
      const names = MOTIF_SETS[p.motifs];
      const pairs = [[inks.ground, inks.ink1], [inks.ground, inks.ink2], [inks.ink1, inks.ink2], [inks.ground, inks.deep], [inks.ink2, inks.deep], [inks.ink1, inks.ground], [inks.ink1, inks.deep]];
      let last = -1, sparked = false;
      const sparkBlock = rng.int(Math.floor(nbx * nby * 0.3), Math.floor(nbx * nby * 0.8));
      let count = 0;
      for (let by = 0; by < nby; by++) for (let bx = 0; bx < nbx; bx++) {
        if (occ[by * nbx + bx]) continue;
        let span = 1;
        if (!env.tile && bx + 1 < nbx && by + 1 < nby && !occ[by * nbx + bx + 1] && !occ[(by + 1) * nbx + bx] && !occ[(by + 1) * nbx + bx + 1] && rng.next() < p.big) span = 2;
        for (let j = 0; j < span; j++) for (let i = 0; i < span; i++) occ[(by + j) * nbx + bx + i] = 1;
        const nn = n * span;
        let pi; do { pi = rng.int(0, pairs.length - 1); } while (pi === last);
        last = pi;
        let [a, b] = pairs[pi];
        count++;
        if (!sparked && count >= sparkBlock && env.spark.take(nn * nn * csx * csy)) { a = inks.ground; b = inks.spark; sparked = true; }
        const mname = rng.pick(names), fn = MOTIFS[mname];
        const flipX = rng.chance(0.5), flipY = rng.chance(0.5), invert = rng.chance(0.4);
        const x0 = bx * n * csx, y0 = by * n * csy;
        g.rect(Math.round(x0), Math.round(y0), Math.round(x0 + nn * csx) - Math.round(x0), Math.round(y0 + nn * csy) - Math.round(y0), invert ? b : a);
        const ink = invert ? a : b;
        for (let y = 0; y < nn; y++) {
          let x = 0;
          while (x < nn) {
            const sx = flipX ? nn - 1 - x : x, sy = flipY ? nn - 1 - y : y;
            if (fn(sx, sy, nn)) {
              let e = x + 1;
              while (e < nn && fn(flipX ? nn - 1 - e : e, sy, nn)) e++;
              const rx0 = Math.round(x0 + x * csx), rx1 = Math.round(x0 + e * csx), ry0 = Math.round(y0 + y * csy), ry1 = Math.round(y0 + (y + 1) * csy);
              g.rect(rx0, ry0, rx1 - rx0, ry1 - ry0, ink);
              x = e;
            } else x++;
          }
        }
      }
    },
  });

  /* ---------- 8. Gradient panes ---------- */
  const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [0.7071, 0.7071], [-0.7071, 0.7071], [0.7071, -0.7071], [-0.7071, -0.7071]];
  P.register({
    key: 'gradpanes', name: 'Gradient panes', category: 'Soft color',
    blurb: 'Rows of uneven panes, each one a two-ink ramp running in its own direction.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: true, seamless: false,
    common: { grain: 0.2 },
    params: [
      { key: 'rows', label: 'Rows', type: 'range', min: 2, max: 9, step: 1, default: 5 },
      { key: 'cols', label: 'Panes per row', type: 'range', min: 2, max: 7, step: 1, default: 4 },
      { key: 'gap', label: 'Gap', type: 'range', min: 0, max: 3, step: 0.1, default: 0.7 },
      { key: 'steps', label: 'Banding (0 = smooth)', type: 'range', min: 0, max: 12, step: 1, default: 0 },
      { key: 'radius', label: 'Corner radius', type: 'range', min: 0, max: 4, step: 0.1, default: 0 },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u;
      g.fill(inks.ground);
      const gap = p.gap * u, rad = p.radius * u;
      const rows = p.rows, rw = [];
      let tot = 0;
      for (let i = 0; i < rows; i++) { const w = rng.range(0.55, 1.6); rw.push(w); tot += w; }
      const pairs = [[inks.ink1, inks.ground], [inks.ink2, inks.ground], [inks.ink1, inks.ink2], [inks.deep, inks.ink1], [inks.ground, inks.ink2], [inks.ink2, inks.ink1], [inks.ink1, inks.deep], [inks.deep, inks.ground]];
      let acc = 0, last = -1, sparked = false;
      const sparkRow = rng.int(1, rows - 1);
      for (let r = 0; r < rows; r++) {
        const y0 = acc / tot * H; acc += rw[r];
        const y1 = acc / tot * H;
        const k = Math.max(2, Math.round(p.cols * rng.range(0.6, 1.3)));
        const cw = []; let ct = 0;
        for (let i = 0; i < k; i++) { const w = rng.range(0.4, 1.8); cw.push(w); ct += w; }
        let cacc = 0;
        for (let i = 0; i < k; i++) {
          const x0 = cacc / ct * W; cacc += cw[i];
          const x1 = cacc / ct * W;
          let pi; do { pi = rng.int(0, pairs.length - 1); } while (pi === last);
          last = pi;
          let [a, b] = pairs[pi];
          const px = x0 + (i ? gap / 2 : 0), pw = x1 - (i < k - 1 ? gap / 2 : 0) - px;
          const py = y0 + (r ? gap / 2 : 0), ph = y1 - (r < rows - 1 ? gap / 2 : 0) - py;
          if (pw <= 1 || ph <= 1) continue;
          let w2 = pw;
          if (!sparked && r === sparkRow && i === k - 1) {
            // a narrow spark pane at the end of one row
            w2 = Math.max(u * 1.2, Math.min(pw, W * 0.04));
            if (env.spark.take(w2 * ph)) { a = inks.spark; b = inks.ground; sparked = true; } else w2 = pw;
          }
          const d = DIRS[rng.int(0, 7)];
          const cx = px + (i === k - 1 && sparked && w2 < pw ? pw - w2 : 0) + w2 / 2, cy = py + ph / 2;
          const L = (Math.abs(d[0]) * w2 + Math.abs(d[1]) * ph) / 2;
          const stops = [];
          if (p.steps > 1) {
            for (let s = 0; s < p.steps; s++) {
              const col = E.mix(b, a, s / (p.steps - 1));
              stops.push([s / p.steps, col], [(s + 1) / p.steps, col]);
            }
          } else stops.push([0, a], [1, b]);
          const gr = g.grad(cx - d[0] * L, cy - d[1] * L, cx + d[0] * L, cy + d[1] * L, stops);
          const rx = px + (i === k - 1 && sparked && w2 < pw ? pw - w2 : 0);
          g.rect(rx, py, w2, ph, gr, rad);
        }
      }
    },
  });

  /* ---------- 9. Glyph grid ---------- */
  function glyphDraw(g, name, x, y, c, col) {
    const lw = Math.max(1, c * 0.1);
    switch (name) {
      case 'dot': g.circle(x, y, c * 0.1, col); break;
      case 'bigdot': g.circle(x, y, c * 0.3, col); break;
      case 'ring': g.ring(x, y, c * 0.28, lw * 1.1, col); break;
      case 'plus': g.line(x - c * 0.3, y, x + c * 0.3, y, col, lw * 1.2); g.line(x, y - c * 0.3, x, y + c * 0.3, col, lw * 1.2); break;
      case 'x': g.line(x - c * 0.26, y - c * 0.26, x + c * 0.26, y + c * 0.26, col, lw * 1.2); g.line(x - c * 0.26, y + c * 0.26, x + c * 0.26, y - c * 0.26, col, lw * 1.2); break;
      case 'diamond': { const s = c * 0.38; g.poly([x, y - s, x + s, y, x, y + s, x - s, y], col); break; }
      case 'square': { const s = c * 0.6; g.rect(x - s / 2, y - s / 2, s, s, col); break; }
      case 'sqring': { const s = c * 0.6; g.rect(x - s / 2, y - s / 2, s, lw, col); g.rect(x - s / 2, y + s / 2 - lw, s, lw, col); g.rect(x - s / 2, y - s / 2, lw, s, col); g.rect(x + s / 2 - lw, y - s / 2, lw, s, col); break; }
      case 'sq-s': { const s = c * 0.22; g.rect(x - s / 2, y - s / 2, s, s, col); break; }
      case 'sq-m': { const s = c * 0.45; g.rect(x - s / 2, y - s / 2, s, s, col); break; }
      case 'sq-l': { const s = c * 0.7; g.rect(x - s / 2, y - s / 2, s, s, col); break; }
      case 'full': g.rect(x - c * 0.48, y - c * 0.48, c * 0.96, c * 0.96, col); break;
      case 'tri': { const s = c * 0.36; g.poly([x, y - s, x + s, y + s * 0.8, x - s, y + s * 0.8], col); break; }
      default: break;
    }
  }
  const GLYPH_SETS = {
    geometric: ['dot', 'ring', 'x', 'diamond', 'square'],
    crosses: ['dot', 'plus', 'x', 'ring', 'bigdot'],
    blocks: ['sq-s', 'sq-m', 'sqring', 'sq-l', 'full'],
    shapes: ['dot', 'tri', 'diamond', 'ring', 'bigdot'],
  };
  P.register({
    key: 'glyphgrid', name: 'Glyph grid', category: 'Pixel & grid',
    blurb: 'A lattice of tiny marks: squares, diamonds, rings and crosses chosen by the height of a noise field.',
    ink: ['ground', 'ink1', 'ink2', 'spark'], vector: true, seamless: true,
    common: { grain: 0.1 },
    params: [
      { key: 'cell', label: 'Cell', type: 'range', min: 1.6, max: 7, step: 0.1, default: 3.3 },
      { key: 'glyphs', label: 'Glyphs', type: 'select', options: SEL(['geometric', 'crosses', 'blocks', 'shapes']), default: 'geometric' },
      { key: 'bands', label: 'Bands', type: 'range', min: 3, max: 6, step: 1, default: 6 },
      { key: 'field', label: 'Field', type: 'select', options: SEL(['clouds', 'ridges', 'warp']), default: 'warp' },
      { key: 'duo', label: 'Two inks', type: 'toggle', default: true },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      g.fill(inks.ground);
      const cell = p.cell * env.u * p.scale;
      const nx = Math.max(2, Math.round(W / cell)), ny = Math.max(2, Math.round(H / cell));
      const cw = W / nx, ch = H / ny, c = Math.min(cw, ch);
      const kind = p.field === 'ridges' ? 'ridged' : p.field === 'warp' ? 'warp' : 'fbm';
      const f = E.makeField(noise, env, W, H, (env.tile ? 8 : 30) * env.u, { oct: 3, kind });
      const set = GLYPH_SETS[p.glyphs], B = p.bands;
      const sparkCells = new Set();
      while (sparkCells.size < 3) sparkCells.add(rng.int(0, nx * ny - 1));
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        const x = (i + 0.5) * cw, y = (j + 0.5) * ch;
        const v = f(x, y), b = Math.min(B - 1, Math.floor(v * B));
        if (b === 0) continue;
        const gi = Math.min(set.length - 1, Math.round((b - 1) / Math.max(1, B - 2) * (set.length - 1)));
        let col = p.duo ? (b >= Math.ceil(B / 2) + 1 ? inks.ink1 : inks.ink2) : inks.ink1;
        let name = set[gi];
        if (sparkCells.has(j * nx + i) && b >= 2 && env.spark.take(c * c * 0.4)) { col = inks.spark; name = set[set.length - 1]; }
        glyphDraw(g, name, x, y, c, col);
      }
    },
  });

  /* ---------- 14. Modular grid ---------- */
  P.register({
    key: 'modulargrid', name: 'Modular grid', category: 'Pixel & grid',
    blurb: 'A seeded grid of modules: solid blocks, dot matrices, line fields, bar ramps and quarter circles.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: true, seamless: true,
    common: { grain: 0.1 },
    params: [
      { key: 'cols', label: 'Columns', type: 'range', min: 4, max: 16, step: 1, default: 9 },
      { key: 'style', label: 'Ink', type: 'select', options: [{ value: 'filled', label: 'Filled' }, { value: 'line', label: 'Line only' }], default: 'filled' },
      { key: 'merge', label: 'Large modules', type: 'range', min: 0, max: 1, step: 0.05, default: 0.5 },
      { key: 'gap', label: 'Gap', type: 'range', min: 0, max: 2, step: 0.05, default: 0.5 },
      { key: 'empty', label: 'Empty cells', type: 'range', min: 0, max: 0.6, step: 0.02, default: 0.16 },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      g.fill(inks.ground);
      const line = p.style === 'line';
      const cols = Math.max(2, Math.round(p.cols / p.scale));
      const cw = W / cols;
      const rows = Math.max(2, Math.round(H / cw));
      const ch = H / rows;
      const gap = p.gap * env.u * (env.tile ? 0.45 : 1);
      const lw = Math.max(1, cw * 0.035);
      const occ = new Uint8Array(cols * rows);
      const palette = [inks.ink1, inks.ink2, inks.deep, inks.ink1, inks.ink2];
      const types = line ? ['frame', 'dots', 'lines', 'ramp', 'quarter', 'circle', 'cross', 'concentric', 'linesv'] : ['solid', 'dots', 'lines', 'ramp', 'quarter', 'circle', 'cross', 'concentric', 'linesv', 'solid', 'half'];
      const sparkAt = rng.int(Math.floor(cols * rows * 0.25), Math.floor(cols * rows * 0.75));
      let idx = 0, sparked = false;
      const stroke = (x, y, w, h, col) => { g.rect(x, y, w, lw, col); g.rect(x, y + h - lw, w, lw, col); g.rect(x, y, lw, h, col); g.rect(x + w - lw, y, lw, h, col); };
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        if (occ[j * cols + i]) continue;
        let sw = 1, sh = 1;
        const free = (a, b) => i + a <= cols - 1 && j + b <= rows - 1 && !occ[(j + b) * cols + i + a] && !(env.tile && (i + a >= cols || j + b >= rows));
        const r = rng.next();
        if (!env.tile || true) {
          if (r < 0.1 * p.merge && free(1, 0) && free(0, 1) && free(1, 1) && i + 1 < cols && j + 1 < rows) { sw = 2; sh = 2; }
          else if (r < 0.28 * p.merge && i + 1 < cols && free(1, 0)) sw = 2;
          else if (r < 0.46 * p.merge && j + 1 < rows && free(0, 1)) sh = 2;
        }
        for (let b = 0; b < sh; b++) for (let a = 0; a < sw; a++) occ[(j + b) * cols + i + a] = 1;
        idx++;
        const x = i * cw + gap / 2, y = j * ch + gap / 2, w = sw * cw - gap, h = sh * ch - gap;
        if (rng.next() < p.empty && !(idx >= sparkAt && !sparked)) continue;
        let col = rng.pick(palette), type = rng.pick(types);
        if (!sparked && idx >= sparkAt && env.spark.take(w * h * 0.3)) { col = inks.spark; sparked = true; type = line ? 'circle' : 'solid'; }
        const cx = x + w / 2, cy = y + h / 2, m = Math.min(w, h);
        if (type === 'solid') g.rect(x, y, w, h, col);
        else if (type === 'frame') stroke(x, y, w, h, col);
        else if (type === 'half') g.poly([x, y, x + w, y, x, y + h], col);
        else if (type === 'dots') {
          const n = m < cw * 1.5 ? rng.int(3, 4) : rng.int(4, 6), s = Math.min(w, h) / n;
          const nx2 = Math.round(w / s), ny2 = Math.round(h / s);
          const dr = s * (line ? 0.16 : 0.3);
          for (let b = 0; b < ny2; b++) for (let a = 0; a < nx2; a++) g.circle(x + (a + 0.5) * w / nx2, y + (b + 0.5) * h / ny2, dr, col);
        } else if (type === 'lines' || type === 'linesv') {
          const n = rng.int(5, 9), horiz = type === 'lines';
          for (let k = 0; k < n; k++) {
            const t = (k + 0.5) / n;
            if (horiz) g.rect(x, y + t * h - lw * 0.9, w, lw * 1.8, col); else g.rect(x + t * w - lw * 0.9, y, lw * 1.8, h, col);
          }
          if (line) stroke(x, y, w, h, col);
        } else if (type === 'ramp') {
          const n = rng.int(4, 7), vertical = rng.chance(0.5);
          for (let k = 0; k < n; k++) {
            const t = (k + 1) / n;
            if (vertical) { const bw = w / n, bh = h * t; if (line) stroke(x + k * bw + lw, y + h - bh, bw - lw * 2, bh, col); else g.rect(x + k * bw, y + h - bh, bw * 0.8, bh, col); }
            else { const bh = h / n, bw = w * t; if (line) stroke(x, y + k * bh + lw, bw, bh - lw * 2, col); else g.rect(x, y + k * bh, bw, bh * 0.8, col); }
          }
        } else if (type === 'quarter') {
          const corner = rng.int(0, 3), R = m;
          const cxq = corner & 1 ? x + w : x, cyq = corner & 2 ? y + h : y;
          const a0 = [0, Math.PI / 2, Math.PI * 1.5, Math.PI][corner];
          const pts = line ? [] : [cxq, cyq];
          for (let k = 0; k <= 24; k++) { const a = a0 + k / 24 * Math.PI / 2; pts.push(cxq + Math.cos(a) * R, cyq + Math.sin(a) * R); }
          if (line) { g.polyline(pts, col, lw * 2, 1, 'butt'); g.polyline(pts.map((v, q) => (q % 2 ? cyq + (v - cyq) * 0.55 : cxq + (v - cxq) * 0.55)), col, lw * 2, 1, 'butt'); }
          else g.clipRect(x, y, w, h, () => g.poly(pts, col));
        } else if (type === 'circle') {
          if (line) g.ring(cx, cy, m * 0.42, lw * 2, col); else g.circle(cx, cy, m * 0.42, col);
        } else if (type === 'cross') {
          const t = m * 0.22;
          if (line) { g.line(x + m * 0.1, y + m * 0.1, x + w - m * 0.1, y + h - m * 0.1, col, lw * 2); g.line(x + w - m * 0.1, y + m * 0.1, x + m * 0.1, y + h - m * 0.1, col, lw * 2); }
          else { g.rect(cx - t / 2, y + (h - m * 0.9) / 2, t, m * 0.9, col); g.rect(x + (w - m * 0.9) / 2, cy - t / 2, m * 0.9, t, col); }
        } else if (type === 'concentric') {
          const n = 3;
          for (let k = 0; k < n; k++) {
            const s = k / n, ww = w * (1 - s), hh = h * (1 - s);
            if (line) stroke(x + (w - ww) / 2, y + (h - hh) / 2, ww, hh, col);
            else if (k % 2 === 0) g.rect(x + (w - ww) / 2, y + (h - hh) / 2, ww, hh, col);
            else g.rect(x + (w - ww) / 2, y + (h - hh) / 2, ww, hh, inks.ground);
          }
        }
      }
    },
  });

  /* ---------- 16. Signal mosaic ---------- */
  P.register({
    key: 'signal', name: 'Signal mosaic', category: 'Glitch & signal',
    blurb: 'Glitched horizontal bands of pixel confetti, block mosaics, vertical smears and scanlines.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: true, seamless: false,
    common: { grain: 0.1 },
    params: [
      { key: 'px', label: 'Pixel size', type: 'range', min: 0.3, max: 2.5, step: 0.05, default: 0.62 },
      { key: 'bands', label: 'Bands', type: 'range', min: 5, max: 36, step: 1, default: 22 },
      { key: 'noise', label: 'Noise vs calm', type: 'range', min: 0, max: 1, step: 0.05, default: 0.7 },
      { key: 'blank', label: 'Blank bands', type: 'range', min: 0, max: 0.6, step: 0.02, default: 0.06 },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      g.fill(inks.ground);
      const cs = Math.max(2, Math.round(p.px * env.u * p.scale));
      const gw = Math.ceil(W / cs), gh = Math.ceil(H / cs);
      const pool = [inks.ink1, inks.ink2, inks.deep, inks.ink1, inks.ink2];
      const wts = [[p.blank * 3, 'blank'], [p.noise * 3, 'confetti'], [p.noise * 2.4 + 0.3, 'mosaic'], [1.2, 'smear'], [1.1, 'scan'], [0.8, 'solid'], [0.7, 'ramp']];
      let row = 0, k = 0;
      let sparked = 0;
      while (row < gh && k < p.bands * 3) {
        k++;
        const hh = Math.max(1, Math.min(gh - row, Math.round(rng.range(0.6, 2.4) * gh / p.bands)));
        const type = rng.weighted(wts.map(w => w[1]), wts.map(w => Math.max(0.01, w[0])));
        const y0 = row * cs, h = hh * cs;
        const c1 = rng.pick(pool), c2 = rng.pick(pool);
        const x0 = rng.chance(0.3) ? Math.round(rng.range(0, gw * 0.4)) * cs : 0;
        const x1 = rng.chance(0.3) ? Math.round(rng.range(gw * 0.6, gw)) * cs : W;
        if (type === 'confetti') {
          const q = rng.range(0.12, 0.5);
          for (let j = 0; j < hh; j++) for (let i = Math.floor(x0 / cs); i * cs < x1; i++) {
            if (rng.next() < q) {
              let col = rng.chance(0.55) ? c1 : rng.pick(pool);
              if (sparked < 5 && rng.next() < 0.004 && env.spark.take(cs * cs * 2)) { col = inks.spark; sparked++; }
              g.rect(i * cs, y0 + j * cs, cs, cs, col);
            }
          }
        } else if (type === 'mosaic') {
          const bs = rng.int(2, 6) * cs, q = rng.range(0.35, 0.8), nbx = Math.ceil((x1 - x0) / bs);
          const nby = Math.max(1, Math.round(h / bs));
          for (let j = 0; j < nby; j++) for (let i = 0; i < nbx; i++) if (rng.next() < q) {
            const bh = j === nby - 1 ? h - j * (h / nby) : h / nby;
            g.rect(Math.round(x0 + i * bs), Math.round(y0 + j * h / nby), Math.round(Math.min(bs, x1 - x0 - i * bs)), Math.ceil(bh), rng.chance(0.5) ? c1 : c2);
          }
        } else if (type === 'smear') {
          let x = x0;
          while (x < x1) {
            const run = rng.int(1, 14) * cs;
            if (rng.next() < 0.6) g.rect(x, y0, Math.min(run, x1 - x), h, rng.chance(0.6) ? c1 : rng.pick(pool));
            x += run + rng.int(0, 5) * cs;
          }
        } else if (type === 'scan') {
          const lh = Math.max(1, Math.round(cs * 0.5));
          for (let y = y0; y < y0 + h; y += lh * 2) g.rect(x0, y, x1 - x0, lh, c1);
          if (rng.chance(0.6)) { const sx = Math.round(rng.range(0, gw * 0.7)) * cs; for (let y = y0; y < y0 + h; y += lh * 2) g.rect(sx, y, rng.int(8, 30) * cs, lh, c2); }
        } else if (type === 'solid') {
          g.rect(x0, y0, x1 - x0, Math.max(cs, Math.round(h * 0.45)), c1);
        } else if (type === 'ramp') {
          const steps = 8, bw = (x1 - x0) / steps;
          for (let i = 0; i < steps; i++) {
            const t = (i + 1) / steps, bh = Math.max(cs, Math.round(h * t / cs) * cs);
            g.rect(Math.round(x0 + i * bw), y0 + h - bh, Math.ceil(bw * 0.8), bh, c1);
          }
        }
        row += hh + (rng.chance(0.4) ? rng.int(0, 3) : 0);
      }
    },
  });
})(window);
