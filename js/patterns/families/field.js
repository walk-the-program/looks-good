/* patterns/families/field.js — noise-field families:
   halftone, stipple, terrain (posterised), typeterrain. */
(function (global) {
  'use strict';
  const P = global.Patterns, E = P.E;
  const SEL = E.sel;

  /* ---------- 1. Halftone field ---------- */
  P.register({
    key: 'halftone', name: 'Halftone field', category: 'Halftone & print',
    blurb: 'A cloudy noise field cut into a few levels and printed through a coarse dot screen.',
    ink: ['ground', 'ink1', 'ink2', 'spark'], vector: true, seamless: true,
    common: { grain: 0.18 },
    params: [
      { key: 'cell', label: 'Dot pitch', type: 'range', min: 0.8, max: 5, step: 0.1, default: 1.7 },
      { key: 'levels', label: 'Levels', type: 'range', min: 2, max: 8, step: 1, default: 5 },
      { key: 'shape', label: 'Dot', type: 'select', options: SEL(['round', 'ring', 'square']), default: 'round' },
      { key: 'angle', label: 'Screen angle', type: 'range', min: 0, max: 45, step: 5, default: 15 },
      { key: 'field', label: 'Field', type: 'select', options: SEL(['clouds', 'ridges', 'warp']), default: 'clouds' },
      { key: 'duo', label: 'Two-ink territories', type: 'toggle', default: true },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u;
      g.fill(inks.ground);
      const kind = p.field === 'ridges' ? 'ridged' : p.field === 'warp' ? 'warp' : 'fbm';
      const feat = (env.tile ? 8 : 34) * u * p.scale;
      const f = E.makeField(noise, env, W, H, feat, { oct: 3, kind });
      const terr = E.makeField(noise, env, W, H, (env.tile ? 18 : 60) * u * p.scale, { oct: 2, off: [7, 3] });
      let cell = p.cell * u * p.scale, cw = cell, ch = cell, nx = 0, ny = 0;
      const ang = env.tile ? 0 : p.angle * Math.PI / 180;
      if (env.tile) { nx = Math.max(2, Math.round(W / cell)); ny = Math.max(2, Math.round(H / cell)); cw = W / nx; ch = H / ny; }
      const cos = Math.cos(ang), sin = Math.sin(ang);
      const L = p.levels, maxR = 0.64 * Math.min(cw, ch), minR = L > 2 ? 0.1 * Math.min(cw, ch) : 0;
      const lw = Math.max(1, Math.min(cw, ch) * 0.13);
      const sparkCap = Math.max(2, Math.floor(0.035 * (W * H) / (cell * cell)));
      let sparks = 0;
      const dot = (x, y, r, col) => {
        if (r <= 0.3) return;
        E.wrapDraw(env, W, H, x, y, r + lw, (px, py) => {
          if (p.shape === 'ring') g.ring(px, py, r * 0.8, Math.max(lw, r * 0.28), col);
          else if (p.shape === 'square') {
            const s = r * 0.82, c = Math.cos(ang), n = Math.sin(ang);
            g.poly([px + (-s * c + s * n), py + (-s * n - s * c), px + (s * c + s * n), py + (s * n - s * c), px + (s * c - s * n), py + (s * n + s * c), px + (-s * c - s * n), py + (-s * n + s * c)], col);
          } else g.circle(px, py, r, col);
        });
      };
      const visit = (x, y) => {
        if (x < -cell || y < -cell || x > W + cell || y > H + cell) return;
        const v = f(x, y);
        const lv = Math.min(L - 1, Math.floor(v * L)), t = lv / (L - 1);
        let r = minR + (maxR - minR) * t;
        let col = inks.ink1;
        if (p.duo && terr(x, y) > 0.5) col = inks.ink2;
        if (lv === L - 1 && sparks < sparkCap && rng.next() < 0.03 && env.spark.take(Math.PI * r * r)) { col = inks.spark; sparks++; }
        dot(x, y, r, col);
      };
      if (env.tile) {
        for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) visit((i + 0.5) * cw, (j + 0.5) * ch);
      } else {
        const diag = Math.hypot(W, H), cx = W / 2, cy = H / 2, n = Math.ceil(diag / cell / 2) + 2;
        for (let j = -n; j <= n; j++) for (let i = -n; i <= n; i++) {
          const lx = i * cell, ly = j * cell;
          visit(cx + lx * cos - ly * sin, cy + lx * sin + ly * cos);
        }
      }
    },
  });

  /* ---------- 2. Stipple ---------- */
  P.register({
    key: 'stipple', name: 'Stipple', category: 'Halftone & print',
    blurb: 'Hand-inked dots that crowd together where the noise is dense and thin out where it fades.',
    ink: ['ground', 'ink1', 'ink2', 'spark'], vector: true, seamless: true,
    common: { grain: 0.15 },
    params: [
      { key: 'density', label: 'Density', type: 'range', min: 0.4, max: 1.8, step: 0.05, default: 1 },
      { key: 'dot', label: 'Dot size', type: 'range', min: 0.5, max: 1.6, step: 0.05, default: 1 },
      { key: 'layout', label: 'Layout', type: 'select', options: SEL(['random', 'lattice']), default: 'random' },
      { key: 'mirror', label: 'Symmetry', type: 'select', options: SEL(['none', 'x', 'xy']), default: 'none' },
      { key: 'field', label: 'Field', type: 'select', options: SEL(['clouds', 'ridges', 'warp']), default: 'clouds' },
      { key: 'duo', label: 'Two-ink territories', type: 'toggle', default: true },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u;
      g.fill(inks.ground);
      const kind = p.field === 'ridges' ? 'ridged' : p.field === 'warp' ? 'warp' : 'fbm';
      const base = E.makeField(noise, env, W, H, (env.tile ? 9 : 38) * u * p.scale, { oct: 3, kind });
      const mx = p.mirror !== 'none' && !env.tile, my = p.mirror === 'xy' && !env.tile;
      const fold = (x, y) => base(mx && x > W / 2 ? W - x : x, my && y > H / 2 ? H - y : y);
      const terr = E.makeField(noise, env, W, H, (env.tile ? 20 : 70) * u * p.scale, { oct: 2, off: [5, 11] });
      const rmin = 0.72 * u * p.scale / Math.sqrt(p.density);
      const rmax = rmin * 4.6;
      const dotR = Math.max(rmin * 0.46 * p.dot, 0.8 * env.dpr);
      const colorAt = (x, y) => (p.duo && terr(x, y) > 0.5 ? inks.ink2 : inks.ink1);
      const pts = [];
      if (p.layout === 'lattice' || env.tile) {
        const s = rmin * 1.45;
        let nx = Math.round(W / s), ny = Math.round(H / (s * 0.866));
        if (env.tile) { nx = Math.max(2, nx); ny = Math.max(2, ny + (ny % 2)); }
        const cw = W / nx, ch = H / ny;
        const hex = !(mx || my);
        for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
          const x = (i + 0.5 + (hex && j % 2 ? 0.5 : 0)) * cw, y = (j + 0.5) * ch;
          if (x > W + cw) continue;
          const ii = mx ? Math.min(i, nx - 1 - i) : i, jj = my ? Math.min(j, ny - 1 - j) : j;
          const v = fold(x, y);
          if (v > E.bayer8.at(ii * 5 + (jj & 1) * 3, jj * 3)) pts.push(x, y);
        }
      } else {
        const cs = rmin, gw = Math.ceil(W / cs) + 1, gh = Math.ceil(H / cs) + 1;
        const grid = new Array(gw * gh);
        const px = [], py = [], pr = [];
        const reach = Math.ceil(rmax / cs);
        const add = (x, y, r) => {
          if (x < 0 || y < 0 || x >= W || y >= H) return;
          const id = px.length; px.push(x); py.push(y); pr.push(r);
          const k = ((y / cs) | 0) * gw + ((x / cs) | 0);
          (grid[k] || (grid[k] = [])).push(id);
        };
        const free = (x, y, r) => {
          const ci = (x / cs) | 0, cj = (y / cs) | 0;
          const i0 = Math.max(0, ci - reach), i1 = Math.min(gw - 1, ci + reach), j0 = Math.max(0, cj - reach), j1 = Math.min(gh - 1, cj + reach);
          for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
            const cell = grid[j * gw + i];
            if (!cell) continue;
            for (let q = 0; q < cell.length; q++) {
              const id = cell[q], dx = px[id] - x, dy = py[id] - y, m = (r + pr[id]) * 0.5;
              if (dx * dx + dy * dy < m * m) return false;
            }
          }
          return true;
        };
        const regW = mx ? W / 2 : W, regH = my ? H / 2 : H;
        const attempts = Math.min(120000, Math.round(W * H / (rmin * rmin) * 0.7));
        for (let a = 0; a < attempts; a++) {
          const x = rng.next() * regW, y = rng.next() * regH;
          const d0 = fold(x, y), d = E.smoothstep(0.12, 0.88, d0), r = rmax + (rmin - rmax) * Math.pow(d, 0.8);
          if (mx && x > W / 2 - r * 0.5) continue;
          if (my && y > H / 2 - r * 0.5) continue;
          if (!free(x, y, r)) continue;
          if (mx && !free(W - x, y, r)) continue;
          if (my && !free(x, H - y, r)) continue;
          add(x, y, r);
          if (mx) add(W - x, y, r);
          if (my) { add(x, H - y, r); if (mx) add(W - x, H - y, r); }
        }
        for (let i = 0; i < px.length; i++) pts.push(px[i], py[i]);
      }
      // dots
      const n = pts.length / 2;
      const sparkN = Math.max(2, Math.floor(n * 0.004));
      const spark = new Set();
      while (spark.size < sparkN && n > 0) spark.add(rng.int(0, n - 1));
      for (let i = 0; i < n; i++) {
        const x = pts[i * 2], y = pts[i * 2 + 1];
        let r = Math.max(dotR * (0.85 + 0.3 * fold(x, y)), 0.7 * env.dpr);
        let col = colorAt(x, y);
        if (spark.has(i) && env.spark.take(Math.PI * r * r * 4)) { col = E.sparkInk(inks, i); r *= 1.7; }
        E.wrapDraw(env, W, H, x, y, r, (X, Y) => g.circle(X, Y, r, col));
      }
    },
  });

  /* ---------- 11. Posterised terrain ---------- */
  function offscreen(w, h) { const c = global.document.createElement('canvas'); c.width = w; c.height = h; return c; }

  P.register({
    key: 'terrain', name: 'Posterised terrain', category: 'Halftone & print',
    blurb: 'Noise cut into flat colour regions whose edges break up into chunky ordered dither.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: false, seamless: false,
    common: { grain: 0.08 },
    params: [
      { key: 'levels', label: 'Regions', type: 'range', min: 3, max: 8, step: 1, default: 6 },
      { key: 'pix', label: 'Pixel size', type: 'range', min: 0.25, max: 1.4, step: 0.05, default: 0.5 },
      { key: 'dither', label: 'Edge dither', type: 'range', min: 0, max: 1, step: 0.05, default: 0.6 },
      { key: 'style', label: 'Terrain', type: 'select', options: SEL(['hills', 'ridges', 'islands']), default: 'hills' },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const cellPx = Math.max(1, Math.round(p.pix * env.u));
      const gw = Math.ceil(W / cellPx), gh = Math.ceil(H / cellPx);
      const feat = 40 * env.u * p.scale;
      const kind = p.style === 'ridges' ? 'ridged' : 'fbm';
      const nx = rng.range(0, 50), ny = rng.range(0, 50);
      const raw = new Float32Array(gw * gh);
      let k = 0;
      for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
        const x = (i + 0.5) * cellPx / feat + nx, y = (j + 0.5) * cellPx / feat + ny;
        let v = kind === 'ridged' ? noise.ridged(x, y, 5) : noise.fbm(x, y, 5, 2, 0.5);
        if (p.style === 'islands') {
          const dx = (i / gw - 0.5) * 2, dy = (j / gh - 0.5) * 2 * (H / W);
          v += 0.55 - Math.min(1.2, Math.sqrt(dx * dx + dy * dy)) * 1.1;
        }
        raw[k++] = v;
      }
      const sorted = Float32Array.from(raw).sort();
      const lo = sorted[Math.floor(sorted.length * 0.03)], hi = sorted[Math.floor(sorted.length * 0.97)] + 1e-6;
      const sparkThr = sorted[Math.floor(sorted.length * 0.985)];
      const ramp = inks.ramp.map(E.rgb), m = ramp.length, L = p.levels;
      const img = new ImageData(gw, gh), data = img.data;
      const dw = p.dither * 0.9 + 1e-4;
      const sp = E.rgb(inks.spark);
      const bay = E.bayer8;
      for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
        const idx = j * gw + i, h = Math.min(1, Math.max(0, (raw[idx] - lo) / (hi - lo)));
        const q = h * L, b = Math.round(q), dq = q - b;
        let region = dq >= 0 ? b : b - 1;
        const opp = dq >= 0 ? b - 1 : b;
        const ad = Math.abs(dq);
        if (p.dither > 0 && ad < dw / 2 && bay.at(i, j) < 0.5 * (1 - ad / (dw / 2))) region = opp;
        if (region < 0) region = 0; if (region > L - 1) region = L - 1;
        const pos = L > 1 ? region / (L - 1) * (m - 1) : 0;
        const a = Math.floor(pos), fr = pos - a;
        const c = ramp[fr > 0.001 && a + 1 < m && E.bayer4.at(i, j) < fr ? a + 1 : a];
        const o = idx * 4;
        if (raw[idx] >= sparkThr && env.spark) { data[o] = sp[0]; data[o + 1] = sp[1]; data[o + 2] = sp[2]; }
        else { data[o] = c[0]; data[o + 1] = c[1]; data[o + 2] = c[2]; }
        data[o + 3] = 255;
      }
      const off = offscreen(gw, gh);
      off.getContext('2d').putImageData(img, 0, 0);
      const ctx = g.ctx;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(off, 0, 0, gw * cellPx, gh * cellPx);
      ctx.imageSmoothingEnabled = true;
    },
  });

  /* ---------- 17. Type terrain ---------- */
  const SETS = {
    ascii: ' .:-=+*#%@',
    dots: ' .,:;oO0@',
    code: ' .,/|\\[]{}#',
    binary: '  .0101',
  };
  P.register({
    key: 'typeterrain', name: 'Type terrain', category: 'Glitch & signal',
    blurb: 'Terraced noise typed out one character per cell, light punctuation in the lowlands and heavy glyphs on the peaks.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: false, seamless: false,
    common: { grain: 0.06 },
    params: [
      { key: 'charset', label: 'Characters', type: 'select', options: SEL(['ascii', 'dots', 'code', 'binary']), default: 'ascii' },
      { key: 'size', label: 'Type size', type: 'range', min: 0.7, max: 2.4, step: 0.05, default: 1.45 },
      { key: 'levels', label: 'Terraces', type: 'range', min: 4, max: 10, step: 1, default: 6 },
      { key: 'style', label: 'Terrain', type: 'select', options: SEL(['hills', 'ridges', 'warp']), default: 'warp' },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const ctx = g.ctx;
      g.fill(inks.ground);
      const fs = Math.max(5, Math.round(p.size * env.u * p.scale)), cw = fs * 0.6, lh = Math.round(fs * 1.15);
      const cols = Math.ceil(W / cw), rows = Math.ceil(H / lh);
      const kind = p.style === 'ridges' ? 'ridged' : p.style === 'warp' ? 'warp' : 'fbm';
      const field = E.makeField(noise, env, W, H, 54 * env.u * p.scale, { oct: 3, kind });
      const set = SETS[p.charset] || SETS.ascii;
      const L = p.levels;
      const lv = new Uint8Array(cols * rows), vals = new Float32Array(cols * rows);
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const v = Math.pow(field((i + 0.5) * cw, (j + 0.5) * lh), 1.45);
        vals[j * cols + i] = v;
        lv[j * cols + i] = Math.min(L - 1, Math.floor(v * L));
      }
      const sorted = Float32Array.from(vals).sort();
      const sparkThr = sorted[Math.floor(sorted.length * 0.994)];
      ctx.font = '600 ' + fs + 'px ui-monospace, "SF Mono", Menlo, Consolas, "Courier New", monospace';
      ctx.textBaseline = 'alphabetic';
      const charFor = l => set[Math.min(set.length - 1, Math.round(l / (L - 1) * (set.length - 1)))];
      const tone = [inks.ink2, inks.ink1, inks.deep].sort((a, b) => E.contrast(a, inks.ground) - E.contrast(b, inks.ground));
      const colorFor = l => { const t = l / (L - 1); return t < 0.38 ? tone[0] : t < 0.86 ? tone[1] : tone[2]; };
      for (let l = 1; l < L; l++) {
        const ch = charFor(l);
        if (ch === ' ') continue;
        ctx.fillStyle = colorFor(l);
        for (let j = 0; j < rows; j++) {
          let row = '', any = false;
          for (let i = 0; i < cols; i++) {
            const hit = lv[j * cols + i] === l && vals[j * cols + i] < sparkThr;
            row += hit ? ch : ' '; if (hit) any = true;
          }
          if (any) ctx.fillText(row, 0, (j + 1) * lh - fs * 0.2);
        }
      }
      // peaks in spark
      ctx.fillStyle = inks.spark;
      const top = charFor(L - 1) === ' ' ? '#' : charFor(L - 1);
      for (let j = 0; j < rows; j++) {
        let row = '', any = false;
        for (let i = 0; i < cols; i++) {
          const hit = vals[j * cols + i] >= sparkThr;
          row += hit ? top : ' '; if (hit) any = true;
        }
        if (any) ctx.fillText(row, 0, (j + 1) * lh - fs * 0.2);
      }
    },
  });
})(window);
