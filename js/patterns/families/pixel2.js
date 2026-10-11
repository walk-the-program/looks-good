/* patterns/families/pixel2.js — round 2 pixel and grid families (original code):
   bloomgrid, kaleidopix, pixelgrid, parcels, prismpix, totem, slipgrid, tokens, relief. */
(function (global) {
  'use strict';
  const P = global.Patterns, E = P.E, H1 = E.pf1;
  const SEL = E.sel;
  const TAU = Math.PI * 2;
  const clamp = E.clamp, smoothstep = E.smoothstep, mix = E.mix;

  const even = v => Math.max(2, Math.round(v / 2) * 2);
  // Base palette: ground, the two inks, deep and two light tints (unique values only).
  function basePal(inks) {
    const out = [];
    [inks.ground, inks.ink1, inks.ink2, inks.deep, mix(inks.ink1, inks.ground, 0.32), mix(inks.ink2, inks.ground, 0.32)].forEach(c => { if (out.indexOf(c) < 0) out.push(c); });
    return out;
  }
  // Recursive guillotine partition of a w x h cell grid into blocks of about maxArea cells.
  function partition(w, h, maxArea, minS, rng) {
    const out = [];
    (function rec(x, y, w, h) {
      const a = w * h;
      const canV = w >= 2 * minS, canH = h >= 2 * minS;
      if ((!canV && !canH) || a <= maxArea * (0.3 + rng.next() * 0.9)) { out.push({ x, y, w, h }); return; }
      let vertical = w >= h * 1.15 ? true : h >= w * 1.15 ? false : rng.chance(0.5);
      if (vertical && !canV) vertical = false; else if (!vertical && !canH) vertical = true;
      if (vertical) { const s = clamp(Math.round(w * rng.range(0.3, 0.7)), minS, w - minS); rec(x, y, s, h); rec(x + s, y, w - s, h); }
      else { const s = clamp(Math.round(h * rng.range(0.3, 0.7)), minS, h - minS); rec(x, y, w, s); rec(x, y + s, w, h - s); }
    })(0, 0, w, h);
    return out;
  }
  // Pick a contrasting pair from a palette (indices).
  function pickPair(pal, rng, minC, avoid) {
    for (let t = 0; t < 40; t++) {
      const a = rng.int(0, pal.length - 1), b = rng.int(0, pal.length - 1);
      if (a === b) continue;
      if (E.contrast(pal[a], pal[b]) < (minC || 1.5)) continue;
      if (avoid != null && a === avoid) continue;
      return [a, b];
    }
    return [0, pal.length - 1];
  }

  /* ---------- 8. Mirrored pixel bloom ---------- */
  P.register({
    key: 'bloomgrid', name: 'Mirrored pixel bloom', category: 'Pixel & grid',
    blurb: 'Soft rings spreading from the centre, quantised into big square pixels and mirrored on both axes around a quiet middle.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: true, seamless: false,
    common: { grain: 0.06 },
    params: [
      { key: 'px', label: 'Pixel size', type: 'range', min: 1.4, max: 6, step: 0.1, default: 3 },
      { key: 'levels', label: 'Colour steps', type: 'range', min: 3, max: 6, step: 1, default: 4 },
      { key: 'rings', label: 'Rings', type: 'range', min: 1.5, max: 8, step: 0.5, default: 4 },
      { key: 'calm', label: 'Quiet middle', type: 'range', min: 0, max: 1, step: 0.05, default: 0.55 },
      { key: 'dither', label: 'Dither steps', type: 'toggle', default: false },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u;
      g.fill(inks.ground);
      const cell = p.px * u * p.scale;
      const nx = even(W / cell), ny = even(H / cell), cw = W / nx, ch = H / ny;
      const L = p.levels, cols = H1.bands(H1.ladder(inks), L);
      const idx = new Int16Array(nx * ny), ph = rng.range(0, TAU), seedI = E.hashSeed(env.seed + ':bloom') | 0;
      const clearR = 0.1 + 0.28 * p.calm;
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        const ii = Math.min(i, nx - 1 - i), jj = Math.min(j, ny - 1 - j);
        const dx = nx / 2 - ii - 0.5, dy = ny / 2 - jj - 0.5;
        const r = Math.hypot(dx * cw, dy * ch) / (0.5 * H);
        const wob = noise.fbm(dx * 0.09, dy * 0.09, 3) * 0.2;
        const s = 0.5 + 0.5 * Math.sin(TAU * (r * p.rings + wob) - ph);
        const a = smoothstep(clearR, clearR + 0.3, r) * (1 - 0.35 * smoothstep(0.8, 1.6, r));
        const v = Math.pow(clamp(a * s, 0, 1), 0.9) * (L - 1);
        let k = Math.floor(v);
        if (p.dither && E.bayer4.at(ii, jj) < v - k) k++;
        if (k >= L) k = L - 1;
        idx[j * nx + i] = k === 0 ? -1 : k;
      }
      const pal = cols.slice();
      const sparkI = pal.length; pal.push(inks.spark);
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        const ii = Math.min(i, nx - 1 - i), jj = Math.min(j, ny - 1 - j);
        if (idx[j * nx + i] === L - 1 && E.ihash(ii, jj, seedI) < 0.05 && env.spark.take(cw * ch)) idx[j * nx + i] = sparkI;
      }
      H1.cells(g, idx, nx, ny, 0, 0, cw, ch, pal);
    },
  });

  /* ---------- 9. Pixel kaleidoscope ---------- */
  const KMOTIFS = [
    (x, y) => ((x + y) % 4 < 2 ? 1 : 0),                                           // zebra
    (x, y, w, h) => (x % 6 <= y % 6 ? 1 : 0),                                       // stair teeth
    (x, y) => (x % 3 === 1 && y % 3 === 1 ? 1 : 0),                                  // dot rows
    (x, y, w, h) => { const a = Math.atan2(y - (h - 1) / 2, x - (w - 1) / 2); return (Math.floor((a + Math.PI) / (TAU / 12)) & 1); }, // burst
    (x, y) => ((y + Math.abs((x % 8) - 4)) % 4 < 2 ? 1 : 0),                         // chevron
    (x, y) => (((x >> 1) + (y >> 1)) & 1),                                           // checks
    (x, y, w, h) => (Math.min(x, y, w - 1 - x, h - 1 - y) % 2 === 0 ? 1 : 0),       // nested frames
    (x, y) => (y % 4 < 2 ? 1 : 0),                                                   // bars
    (x, y) => (x % 4 === 0 || y % 4 === 0 ? 1 : 0),                                  // lattice
    (x, y, w, h) => ((Math.abs(x - (w - 1) / 2) + Math.abs(y - (h - 1) / 2)) % 4 < 2 ? 1 : 0), // diamonds
  ];
  P.register({
    key: 'kaleidopix', name: 'Pixel kaleidoscope', category: 'Pixel & grid',
    blurb: 'A collage of zebra stripes, stairs, dot rows, bursts, chevrons and checks built in one quadrant and folded across the sheet.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: true, seamless: false,
    common: { grain: 0.05 },
    params: [
      { key: 'px', label: 'Pixel size', type: 'range', min: 0.9, max: 4, step: 0.1, default: 1.8 },
      { key: 'patches', label: 'Patch size', type: 'range', min: 0.4, max: 2, step: 0.1, default: 1 },
      { key: 'fold', label: 'Fold', type: 'select', options: SEL(['quad', 'horizontal']), default: 'quad' },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u;
      g.fill(inks.ground);
      const cell = p.px * u * p.scale;
      const nx = even(W / cell), ny = even(H / cell), cw = W / nx, ch = H / ny;
      const quad = p.fold === 'quad';
      const qx = nx / 2, qy = quad ? ny / 2 : ny;
      const pal = basePal(inks); const sparkI = pal.length; pal.push(inks.spark);
      const q = new Int16Array(qx * qy);
      const parts = partition(qx, qy, Math.max(14, Math.round(qx * qy / 9 * p.patches * p.patches)), 3, rng);
      let last = -1, sparked = 0;
      parts.forEach(r => {
        const pr = pickPair(pal.slice(0, sparkI), rng, 1.7, last); last = pr[0];
        let [a, b] = pr;
        const kind = rng.int(0, KMOTIFS.length - 1), fn = KMOTIFS[kind];
        const flipX = rng.chance(0.5), flipY = rng.chance(0.5), solid = rng.chance(0.12);
        for (let j = 0; j < r.h; j++) for (let i = 0; i < r.w; i++) {
          const sx = flipX ? r.w - 1 - i : i, sy = flipY ? r.h - 1 - j : j;
          let c = solid ? a : (fn(sx, sy, r.w, r.h) ? b : a);
          q[(r.y + j) * qx + r.x + i] = c;
        }
        if (sparked < 2 && r.w * r.h >= 12 && rng.chance(0.18) && env.spark.take(4 * r.w * r.h * cw * ch * 0.25)) {
          sparked++;
          const sx = r.x + rng.int(0, r.w - 2), sy = r.y + rng.int(0, r.h - 2);
          for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) q[(sy + j) * qx + sx + i] = sparkI;
        }
      });
      const idx = new Int16Array(nx * ny);
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        const ii = Math.min(i, nx - 1 - i), jj = quad ? Math.min(j, ny - 1 - j) : j;
        idx[j * nx + i] = q[jj * qx + ii];
      }
      H1.cells(g, idx, nx, ny, 0, 0, cw, ch, pal);
    },
  });

  /* ---------- 10. Pixel grid art ---------- */
  P.register({
    key: 'pixelgrid', name: 'Pixel grid art', category: 'Pixel & grid',
    blurb: 'Seeded pixel compositions on a grid: zones of blocks, dots, crosses or diagonals, sized by a noise field. The phase slider scrubs the field for animation.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: true, seamless: false,
    common: { grain: 0.06 },
    params: [
      { key: 'cell', label: 'Cell size', type: 'range', min: 1.4, max: 5, step: 0.1, default: 2.7 },
      { key: 'mode', label: 'Mode', type: 'select', options: SEL(['mixed', 'blocks', 'dots', 'crosses', 'diagonals']), default: 'mixed' },
      { key: 'zones', label: 'Zones', type: 'range', min: 1, max: 8, step: 1, default: 5 },
      { key: 'density', label: 'Density', type: 'range', min: 0.3, max: 1, step: 0.05, default: 0.65 },
      { key: 'phase', label: 'Phase (animation)', type: 'range', min: 0, max: 1, step: 0.02, default: 0 },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u;
      g.fill(inks.ground);
      const cell = p.cell * u * p.scale;
      const nx = Math.max(4, Math.round(W / cell)), ny = Math.max(4, Math.round(H / cell)), cw = W / nx, ch = H / ny;
      const zones = partition(nx, ny, Math.max(20, Math.round(nx * ny / p.zones)), 4, rng);
      const modes = ['blocks', 'dots', 'crosses', 'diagonals'];
      const ink = [inks.ink1, inks.ink2, inks.deep];
      const seedI = E.hashSeed(env.seed + ':pg') | 0;
      let sparked = 0;
      zones.forEach((z, zi) => {
        const mode = p.mode === 'mixed' ? modes[(zi + rng.int(0, 3)) % 4] : p.mode;
        const bgOn = rng.chance(0.33);
        let fg = ink[rng.int(0, 2)], bg = null;
        if (bgOn) { bg = fg; fg = E.contrast(inks.ground, bg) > 1.8 ? inks.ground : inks.deep; if (E.contrast(fg, bg) < 1.8) { bg = null; fg = ink[0]; } }
        if (bg) g.rect(Math.round(z.x * cw), Math.round(z.y * ch), Math.round((z.x + z.w) * cw) - Math.round(z.x * cw), Math.round((z.y + z.h) * ch) - Math.round(z.y * ch), bg);
        const dens = clamp(p.density * rng.range(0.7, 1.25), 0.15, 1), off = rng.range(0, 90), fz = rng.range(0.1, 0.2);
        const thr = 1 - dens;
        for (let j = 0; j < z.h; j++) for (let i = 0; i < z.w; i++) {
          const gi = z.x + i, gj = z.y + j;
          const v = (noise.fbm(gi * fz + off + p.phase * 7, gj * fz - off * 0.3 + p.phase * 3.1, 3) + 1) / 2;
          if (v < thr) continue;
          const lvl = Math.min(3, 1 + Math.floor((v - thr) / Math.max(0.01, 1 - thr) * 3));
          const cx = (gi + 0.5) * cw, cy = (gj + 0.5) * ch, s = Math.min(cw, ch);
          let col = fg;
          if (lvl === 3 && sparked < 8 && E.ihash(gi, gj, seedI) < 0.06 && env.spark.take(s * s)) { col = inks.spark; sparked++; }
          const k = 0.26 + 0.2 * lvl;
          if (mode === 'blocks') {
            const b = s * k * 1.25; g.rect(Math.round(cx - b / 2), Math.round(cy - b / 2), Math.round(b), Math.round(b), col);
          } else if (mode === 'dots') {
            g.circle(cx, cy, s * k * 0.72, col);
          } else if (mode === 'crosses') {
            const a = s * (0.22 + 0.12 * lvl), t = Math.max(1, s * 0.15 + lvl * 0.4);
            g.rect(cx - a, cy - t / 2, a * 2, t, col); g.rect(cx - t / 2, cy - a, t, a * 2, col);
          } else {
            const a = s * (0.24 + 0.1 * lvl), t = Math.max(1.2, s * 0.17 + lvl * 0.5);
            const dir = E.ihash(gi, gj, seedI + 7) > 0.5 ? 1 : -1;
            g.line(cx - a, cy - a * dir, cx + a, cy + a * dir, col, t, 'butt');
          }
        }
      });
    },
  });

  /* ---------- 11. Pixel parcels ---------- */
  P.register({
    key: 'parcels', name: 'Pixel parcels', category: 'Pixel & grid',
    blurb: 'Chunky two-tone block fields packed edge to edge, with a hairline survey grid and tick labels floating on top.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: true, seamless: false,
    common: { grain: 0.05 },
    params: [
      { key: 'cell', label: 'Block unit', type: 'range', min: 0.8, max: 3, step: 0.1, default: 1.5 },
      { key: 'size', label: 'Parcel size', type: 'range', min: 0.4, max: 2, step: 0.1, default: 1.35 },
      { key: 'every', label: 'Survey line every', type: 'range', min: 4, max: 16, step: 1, default: 8 },
      { key: 'labels', label: 'Tick labels', type: 'toggle', default: true },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u;
      const cell = p.cell * u * p.scale;
      const nx = Math.max(8, Math.round(W / cell)), ny = Math.max(8, Math.round(H / cell)), cw = W / nx, ch = H / ny;
      const pal = basePal(inks); const sparkI = pal.length; pal.push(inks.spark);
      const idx = new Int16Array(nx * ny).fill(0);
      const parts = partition(nx, ny, Math.round(70 * p.size * p.size), 3, rng);
      const styles = ['solid', 'solid', 'half', 'checks', 'bars', 'corner', 'stairs', 'solid'];
      let last = -1, sparked = 0;
      parts.forEach(r => {
        const [a, b] = pickPair(pal.slice(0, sparkI), rng, 1.35, last); last = a;
        const st = rng.pick(styles), flip = rng.chance(0.5), flipV = rng.chance(0.5);
        for (let j = 0; j < r.h; j++) for (let i = 0; i < r.w; i++) {
          const x = flip ? r.w - 1 - i : i, y = flipV ? r.h - 1 - j : j;
          let on = false;
          if (st === 'half') on = x / r.w + y / r.h > 1.02;
          else if (st === 'checks') on = (((x >> 1) + (y >> 1)) & 1) === 1;
          else if (st === 'bars') on = ((y >> 1) & 1) === 1;
          else if (st === 'corner') on = x >= r.w - Math.max(2, r.w >> 1) && y >= r.h - Math.max(2, r.h >> 1);
          else if (st === 'stairs') on = x >= r.w - 1 - Math.floor(y * r.w / r.h / 1.0 / 2) * 2 - 1;
          idx[(r.y + j) * nx + r.x + i] = on ? b : a;
        }
        if (sparked < 3 && r.w * r.h >= 20 && rng.chance(0.15) && env.spark.take(r.w * r.h * cw * ch * 0.3)) {
          sparked++;
          const sx = r.x + r.w - 3, sy = r.y + 1;
          for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) idx[(sy + j) * nx + sx + i] = sparkI;
        }
      });
      H1.cells(g, idx, nx, ny, 0, 0, cw, ch, pal);
      // survey grid in the colour that reads against each cell
      const ev = p.every, hairline = Math.max(0.8, env.dpr * 0.9 + u * 0.03);
      const contrastCol = (cx, cy) => {
        const base = pal[idx[Math.min(ny - 1, cy) * nx + Math.min(nx - 1, cx)]];
        return E.contrast(inks.deep, base) >= E.contrast(inks.ground, base) ? inks.deep : inks.ground;
      };
      const mid = hairline * 0.5;
      for (let gx = ev; gx < nx; gx += ev) {
        let j = 0;
        while (j < ny) {
          const c = contrastCol(gx, j); let e = j + 1;
          while (e < ny && contrastCol(gx, e) === c) e++;
          g.line(Math.round(gx * cw) + mid, j * ch, Math.round(gx * cw) + mid, e * ch, c, hairline);
          j = e;
        }
      }
      for (let gy = ev; gy < ny; gy += ev) {
        let i = 0;
        while (i < nx) {
          const c = contrastCol(i, gy); let e = i + 1;
          while (e < nx && contrastCol(e, gy) === c) e++;
          g.line(i * cw, Math.round(gy * ch) + mid, e * cw, Math.round(gy * ch) + mid, c, hairline);
          i = e;
        }
      }
      // crosses at intersections
      const arm = Math.max(2, 0.45 * u);
      for (let gx = ev; gx < nx; gx += ev) for (let gy = ev; gy < ny; gy += ev) {
        const c = contrastCol(gx, gy), x = Math.round(gx * cw) + mid, y = Math.round(gy * ch) + mid;
        g.line(x - arm, y, x + arm, y, c, hairline * 1.4); g.line(x, y - arm, x, y + arm, c, hairline * 1.4);
      }
      // floating tick labels
      if (p.labels) {
        const s = Math.max(1, Math.round(0.2 * u)), letters = 'ABCDEFNXY';
        const cx = Math.floor((nx - 1) / ev), cy = Math.floor((ny - 1) / ev);
        const used = {};
        const total = Math.round(Math.min(14, cx * cy * 0.45));
        for (let t = 0, tries = 0; t < total && tries < 80; tries++) {
          const gi = rng.int(1, Math.max(1, cx)), gj = rng.int(1, Math.max(1, cy));
          if (gi * ev >= nx - 4 || gj * ev >= ny - 2 || used[gi + ',' + gj]) continue;
          used[gi + ',' + gj] = 1; t++;
          const txt = letters[rng.int(0, letters.length - 1)] + String(rng.int(0, 99)).padStart(2, '0');
          const x = Math.round(gi * ev * cw + arm + 2 * s), y = Math.round(gj * ev * ch + arm * 0.6);
          const wTxt = txt.length * 4 * s - s, pad = s * 1.2;
          g.rect(x - pad, y - pad, wTxt + pad * 2, 5 * s + pad * 2, inks.ground);
          H1.text(g, txt, x, y, s, inks.deep);
        }
      }
    },
  });

  /* ---------- 12. Pixel aurora ---------- */
  P.register({
    key: 'prismpix', name: 'Pixel aurora', category: 'Pixel & grid',
    blurb: 'Chunky pixel streams in a hot chromatic ramp drifting over a dark dot-grid field.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: true, seamless: false,
    common: { grain: 0.1 },
    params: [
      { key: 'px', label: 'Pixel size', type: 'range', min: 0.9, max: 3.5, step: 0.1, default: 1.7 },
      { key: 'streams', label: 'Streams', type: 'range', min: 2, max: 6, step: 1, default: 4 },
      { key: 'glow', label: 'Glow spread', type: 'range', min: 0.5, max: 2, step: 0.1, default: 1 },
      { key: 'dots', label: 'Dot grid', type: 'toggle', default: true },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u;
      const dk = H1.darkest([inks.deep, inks.ground, inks.ink1, inks.ink2]);
      g.fill(dk);
      const cell = p.px * u * p.scale;
      const nx = Math.max(8, Math.round(W / cell)), ny = Math.max(8, Math.round(H / cell)), cw = W / nx, ch = H / ny;
      const lv = [mix(inks.ink2, dk, 0.45), inks.ink2, inks.ink1];
      const hot = mix(inks.ink1, E.lum(dk) < 0.4 ? '#ffffff' : inks.ground, 0.6);
      const pal = lv.concat([hot, inks.spark]);
      const streams = [];
      for (let s = 0; s < p.streams; s++) {
        streams.push({
          yc: H * (0.18 + 0.64 * (s + rng.range(0.1, 0.9)) / p.streams), A: H * rng.range(0.06, 0.16), f: rng.range(0.7, 1.6), ph: rng.range(0, TAU),
          th: H * rng.range(0.035, 0.075) * p.glow, ph2: rng.range(0, 99), tail: rng.range(0.6, 1.5),
        });
      }
      const idx = new Int16Array(nx * ny).fill(-1);
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        const x = (i + 0.5) * cw, y = (j + 0.5) * ch;
        let I = 0;
        for (let k = 0; k < streams.length; k++) {
          const S = streams[k];
          const yc = S.yc + S.A * Math.sin(TAU * S.f * x / W + S.ph) + S.A * 0.5 * noise.fbm(x / (22 * u) + S.ph2, S.ph2, 2);
          const th = S.th * (0.65 + 0.7 * (0.5 + 0.5 * noise.n2(x / (30 * u) + S.ph2, 3.7)));
          const d = (y - yc) / th;
          const ray = 0.7 + 0.3 * noise.n2(x / (2.2 * u), S.ph2 + 11);
          const v = d < 0 ? Math.exp(-d * d * 2.4) : Math.exp(-d * d / (S.tail * S.tail) * 0.55) * ray;
          if (v > I) I = v;
        }
        const q = I * 4.2;
        let k = Math.floor(q);
        if (E.bayer4.at(i, j) < q - k) k++;
        if (k <= 0) continue;
        idx[j * nx + i] = Math.min(3, k - 1);
        if (k >= 5 && env.spark.take(cw * ch * 1.1)) idx[j * nx + i] = 4;
      }
      if (p.dots) {
        const dc = mix(inks.ink2, dk, 0.22), r = Math.max(0.7, cw * 0.11);
        for (let j = 0; j < ny; j += 2) for (let i = 0; i < nx; i += 2) {
          if (idx[j * nx + i] >= 0) continue;
          g.circle((i + 0.5) * cw, (j + 0.5) * ch, r, dc);
        }
      }
      H1.cells(g, idx, nx, ny, 0, 0, cw, ch, pal);
    },
  });

  /* ---------- 13. Pixel totem ---------- */
  const TMOTIFS = [
    (x, y, h) => { const p = h * 2, d = Math.abs((x % p) - (p - 1) / 2) + Math.abs(y - (h - 1) / 2); return d <= (h - 1) / 2 + 0.01 ? 1 : 0; },                 // diamonds
    (x, y, h) => { const p = h * 2, d = Math.abs((x % p) - (p - 1) / 2) + Math.abs(y - (h - 1) / 2); return d <= (h - 1) / 2 + 0.01 && d > (h - 1) / 2 - 1.6 ? 1 : 0; }, // hollow diamonds
    (x, y, h) => { const p = h * 2, t = x % p, tri = t < h ? t : p - 1 - t; return Math.abs(y - tri) < 1.1 ? 1 : 0; },                                         // zigzag
    (x, y, h) => (((x >> 1) + (y >> 1)) & 1),                                                                                                                        // checks
    (x, y, h) => { const p = h + 1, t = x % p; return y >= h - 1 - t ? 1 : 0; },                                                                                      // stair teeth
    (x, y, h) => { const p = h * 2 - 1, dx = Math.abs((x % p) - (p - 1) / 2), dy = Math.abs(y - (h - 1) / 2), c = Math.max(dx, dy); return c <= (h - 1) / 2 && (c % 2) === 0 ? 1 : 0; }, // eyes
    (x, y, h) => { const p = 4, a = x % p, b = y % p; return (a === 1 || b === 1) && !(a === 1 && b === 1) ? 0 : (a === 1 && b === 1 ? 1 : 0); },               // dot lattice
    (x, y, h) => ((y + Math.abs((x % 8) - 4)) % 4 < 2 ? 1 : 0),                                                                                                       // chevrons
  ];
  P.register({
    key: 'totem', name: 'Pixel totem', category: 'Pixel & grid',
    blurb: 'A mirrored central panel of woven pixel motifs inside a static border frame, all snapped to one grid. Works in banner proportions.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: true, seamless: false,
    common: { grain: 0.05 },
    params: [
      { key: 'px', label: 'Pixel size', type: 'range', min: 0.8, max: 3, step: 0.1, default: 1.4 },
      { key: 'panel', label: 'Panel width', type: 'range', min: 0.3, max: 1, step: 0.05, default: 0.56 },
      { key: 'band', label: 'Band height', type: 'range', min: 3, max: 9, step: 1, default: 5 },
      { key: 'frame', label: 'Frame depth', type: 'range', min: 1, max: 3, step: 1, default: 2 },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u;
      g.fill(inks.ground);
      const cell = p.px * u * p.scale;
      const nx = even(W / cell), ny = Math.max(10, Math.round(H / cell)), cw = W / nx, ch = H / ny;
      const pal = basePal(inks); const sparkI = pal.length; pal.push(inks.spark);
      const idx = new Int16Array(nx * ny).fill(-1);
      const set = (i, j, c) => { if (i >= 0 && j >= 0 && i < nx && j < ny) idx[j * nx + i] = c; };
      const iDeep = pal.indexOf(inks.deep), iInk1 = pal.indexOf(inks.ink1), iInk2 = pal.indexOf(inks.ink2), iGnd = 0;
      const ft = p.frame * 3;                                           // frame thickness in cells
      const half = Math.max(4, Math.round(nx * p.panel / 2));
      const left = nx / 2 - half, right = nx / 2 + half;
      // muted echo colours for the gutters are added to the palette on demand
      const addPal = col => { let k = pal.indexOf(col); if (k < 0) { pal.push(col); k = pal.length - 1; } return k; };
      // bands
      let y = ft + 1, last = -1;
      const bands = [];
      while (y < ny - ft - 1) {
        const hb = clamp(p.band + rng.int(-1, 2), 3, 11);
        const h2 = Math.min(hb, ny - ft - 1 - y);
        if (h2 < 3) { if (bands.length) bands[bands.length - 1].h += h2; break; }
        const [a, b] = pickPair(pal.slice(0, sparkI), rng, 1.6, last); last = a;
        bands.push({ y, h: h2, a, b, m: rng.int(0, TMOTIFS.length - 1), off: rng.int(0, 7) });
        y += h2 + (rng.chance(0.4) ? 1 : 0);
        if (rng.chance(0.4)) bands.push({ y: y - 1, h: 1, a: iGnd, b: iGnd, m: -1 });
      }
      bands.forEach(bd => {
        for (let j = 0; j < bd.h; j++) {
          const yy = bd.y + j;
          for (let i = ft; i < nx - ft; i++) {
            const inPanel = i >= left && i < right;
            if (bd.m < 0) { set(i, yy, inPanel ? iDeep : addPal(mix(inks.deep, inks.ground, 0.7))); continue; }
            const xx = inPanel ? Math.min(i - left, right - 1 - i) + bd.off : i + bd.off;
            const on = TMOTIFS[bd.m](xx, j, bd.h) ? 1 : 0;
            if (inPanel) set(i, yy, on ? bd.a : bd.b);
            else set(i, yy, addPal(mix(on ? pal[bd.a] : pal[bd.b], inks.ground, 0.22)));
          }
        }
      });
      // panel edge lines
      for (let j = ft; j < ny - ft; j++) { set(left - 1, j, iDeep); set(right, j, iDeep); }
      // gaps: any untouched interior cell becomes ground
      for (let j = ft; j < ny - ft; j++) for (let i = ft; i < nx - ft; i++) if (idx[j * nx + i] < 0) set(i, j, iGnd);
      // static frame: ring 0 solid, ring 1 ground dashes, ring 2 inner line
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        const d = Math.min(i, j, nx - 1 - i, ny - 1 - j);
        if (d >= ft) continue;
        const layer = Math.floor(d / p.frame) , pos = d % p.frame;
        let c;
        if (layer === 0) c = iDeep;
        else if (layer === 1) c = ((i + j) & 1) ? iInk1 : iGnd;
        else c = pos === 0 ? iInk2 : iDeep;
        set(i, j, c);
      }
      // one spark pip per corner of the panel
      [[left + 1, ft + 1], [right - 2, ft + 1]].forEach(pt => { if (env.spark.take(4 * cw * ch)) { for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) set(pt[0] + i, pt[1] + j, sparkI); } });
      H1.cells(g, idx, nx, ny, 0, 0, cw, ch, pal);
    },
  });

  /* ---------- 14. Slipped grid ---------- */
  P.register({
    key: 'slipgrid', name: 'Slipped grid', category: 'Pixel & grid',
    blurb: 'A field smeared into vertical streaks, with whole rows slipped sideways, snapped to coarse cells over dark gutters.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: true, seamless: false,
    common: { grain: 0.08 },
    params: [
      { key: 'cell', label: 'Cell size', type: 'range', min: 1.4, max: 5, step: 0.1, default: 2.5 },
      { key: 'slip', label: 'Row slip', type: 'range', min: 0, max: 1, step: 0.05, default: 0.6 },
      { key: 'streak', label: 'Streak length', type: 'range', min: 0.5, max: 2.5, step: 0.1, default: 1.2 },
      { key: 'gutter', label: 'Gutter', type: 'range', min: 0, max: 0.35, step: 0.01, default: 0.12 },
      { key: 'scatter', label: 'Scattered inks', type: 'range', min: 0, max: 1, step: 0.05, default: 0.4 },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u;
      const dk = H1.darkest([inks.deep, inks.ground, inks.ink1]);
      g.fill(dk);
      const cell = p.cell * u * p.scale;
      const nx = Math.max(6, Math.round(W / cell)), ny = Math.max(6, Math.round(H / cell)), cw = W / nx, ch = H / ny;
      const Fx = 15 * u * p.scale, Fy = Fx * 7 * p.streak;
      const raw = (x, y) => noise.fbm(x / Fx, y / Fy, 2, 2.1, 0.45);
      const rg = E.fieldRange(raw, W, H), span = rg.hi - rg.lo;
      const L = 4;
      const cols = H1.bands(H1.ladder(inks), L);
      // slip offsets per row group
      const off = new Int16Array(ny);
      const S = Math.round(p.slip * nx * 0.22);
      for (let j = 0; j < ny;) {
        const run = rng.int(2, 6), o = rng.chance(0.3) ? 0 : rng.int(-S, S);
        for (let k = 0; k < run && j < ny; k++, j++) off[j] = o;
      }
      const gut = p.gutter * Math.min(cw, ch);
      const sparkCols = [inks.ink1, inks.ink2, inks.ground, inks.deep];
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        const v = clamp((raw((i + off[j] + 0.5) * cw, (j + 0.5) * ch) - rg.lo) / span, 0, 1);
        let col = cols[Math.min(L - 1, Math.floor(v * L))];
        let w = 1;
        if (rng.next() < p.scatter * 0.06) {
          col = rng.pick(sparkCols);
          if (rng.next() < 0.1 && env.spark.take(cw * ch)) col = inks.spark;
          w = rng.chance(0.35) ? 2 : 1;
        }
        const x0 = i * cw + gut / 2, y0 = j * ch + gut / 2, rw = Math.min(w, nx - i) * cw - gut, rh = ch - gut;
        if (col === dk) continue;
        g.rect(Math.round(x0), Math.round(y0), Math.round(rw), Math.round(rh), col);
        if (w === 2) i++;
      }
    },
  });

  /* ---------- 15. Grid tokens ---------- */
  P.register({
    key: 'tokens', name: 'Grid tokens', category: 'Pixel & grid',
    blurb: 'Outlined circles and squares on a grid that chain into capsules and blobs where neighbours connect.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: true, seamless: false,
    common: { grain: 0.06 },
    params: [
      { key: 'cell', label: 'Grid', type: 'range', min: 3, max: 10, step: 0.2, default: 5.4 },
      { key: 'link', label: 'Link chance', type: 'range', min: 0, max: 1, step: 0.05, default: 0.6 },
      { key: 'density', label: 'Density', type: 'range', min: 0.3, max: 1, step: 0.05, default: 0.7 },
      { key: 'fill', label: 'Fill', type: 'select', options: SEL(['mixed', 'open', 'tint']), default: 'mixed' },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u;
      g.fill(inks.ground);
      const cell = p.cell * u * p.scale;
      const nx = Math.max(3, Math.round(W / cell)), ny = Math.max(3, Math.round(H / cell)), cw = W / nx, ch = H / ny;
      const s = Math.min(cw, ch), R = s * 0.4, lw = Math.max(1.2, s * 0.085);
      const seedI = E.hashSeed(env.seed + ':tok') | 0;
      const occ = new Uint8Array(nx * ny), kind = new Uint8Array(nx * ny);
      const thr = 1 - p.density * 0.95;
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        const v = (noise.fbm(i * 0.13, j * 0.13, 3) + 1) / 2 + (E.ihash(i, j, seedI) - 0.5) * 0.25;
        if (v > thr + 0.02) occ[j * nx + i] = 1;
        kind[j * nx + i] = noise.n2(i * 0.21 + 40, j * 0.21) > 0.0 ? 1 : 0;
      }
      // union-find over linked neighbours
      const par = new Int32Array(nx * ny).map((_, i) => i);
      const find = a => { while (par[a] !== a) { par[a] = par[par[a]]; a = par[a]; } return a; };
      const linkR = new Uint8Array(nx * ny), linkD = new Uint8Array(nx * ny);
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        const a = j * nx + i; if (!occ[a]) continue;
        if (i + 1 < nx && occ[a + 1] && E.ihash(i, j, seedI + 1) < p.link) { linkR[a] = 1; par[find(a)] = find(a + 1); }
        if (j + 1 < ny && occ[a + nx] && E.ihash(i, j, seedI + 2) < p.link * 0.8) { linkD[a] = 1; par[find(a)] = find(a + nx); }
      }
      const groups = new Map();
      for (let a = 0; a < nx * ny; a++) if (occ[a]) { const r = find(a); if (!groups.has(r)) groups.set(r, []); groups.get(r).push(a); }
      const pool = [inks.ink1, inks.ink2, inks.deep, inks.ink1, inks.ink2];
      let gi = 0, sparked = 0;
      const shapes = (cells, grow) => {
        // draws every token and link of the group inset by `grow` (negative shrinks)
        cells.forEach(a => {
          const i = a % nx, j = (a / nx) | 0, cx = (i + 0.5) * cw, cy = (j + 0.5) * ch;
          const k = kind[a], rr = R + grow;
          if (rr <= 0) return;
          if (k) g.circle(cx, cy, rr, shapes.col); else g.rect(cx - rr, cy - rr, rr * 2, rr * 2, shapes.col, Math.min(rr, s * 0.14));
          if (linkR[a]) { const t = R + grow; g.rect(cx, cy - t, cw, t * 2, shapes.col); }
          if (linkD[a]) { const t = R + grow; g.rect(cx - t, cy, t * 2, ch, shapes.col); }
        });
      };
      groups.forEach(cells => {
        let col = pool[(gi++ * 7 + cells.length) % pool.length];
        const fr = E.ihash(cells[0], gi, seedI + 5);
        let fill = p.fill === 'open' ? 'open' : p.fill === 'tint' ? 'tint' : (fr < 0.45 ? 'open' : fr < 0.8 ? 'tint' : 'solid');
        if (cells.length === 1 && fill === 'solid' && sparked < 3 && env.spark.take(Math.PI * R * R) ) { col = inks.spark; sparked++; }
        shapes.col = col; shapes(cells, 0);
        if (fill !== 'solid') {
          shapes.col = fill === 'tint' ? mix(col, inks.ground, 0.3) : inks.ground;
          shapes(cells, -lw);
        }
        if (fill === 'open' && E.ihash(cells[0], gi, seedI + 9) < 0.5) {
          cells.forEach(a => { const i = a % nx, j = (a / nx) | 0; g.circle((i + 0.5) * cw, (j + 0.5) * ch, s * 0.075, col); });
        } else if (fill === 'solid') {
          cells.forEach(a => { const i = a % nx, j = (a / nx) | 0; g.circle((i + 0.5) * cw, (j + 0.5) * ch, s * 0.1, inks.ground); });
        }
      });
    },
  });

  /* ---------- 16. Routed board ---------- */
  P.register({
    key: 'relief', name: 'Routed board', category: 'Pixel & grid',
    blurb: 'A seamless board of striped, dotted and checked blocks under routed traces with rounded corners and pads, wrapping at every edge.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: true, seamless: true,
    common: { grain: 0.06 },
    params: [
      { key: 'cols', label: 'Columns', type: 'range', min: 2, max: 8, step: 1, default: 4 },
      { key: 'traces', label: 'Traces', type: 'range', min: 1, max: 14, step: 1, default: 7 },
      { key: 'blocks', label: 'Blocks per column', type: 'range', min: 2, max: 7, step: 1, default: 4 },
      { key: 'trace', label: 'Trace weight', type: 'range', min: 0.5, max: 2, step: 0.1, default: 1 },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u;
      g.fill(inks.ground);
      const nc = p.cols, cw = W / nc;
      const pal = basePal(inks);
      const unit = 1.15 * u;
      const gap = Math.max(0.6, 0.16 * u);
      // blocks
      for (let c = 0; c < nc; c++) {
        const k = Math.max(2, p.blocks + rng.int(-1, 1));
        const hs = []; let tot = 0;
        for (let i = 0; i < k; i++) { const v = rng.range(0.6, 1.6); hs.push(v); tot += v; }
        let acc = 0, lastBg = -1;
        for (let i = 0; i < k; i++) {
          const y0 = acc / tot * H; acc += hs[i]; const y1 = acc / tot * H;
          const x0 = c * cw, bh = y1 - y0;
          const [a, b] = pickPair(pal, rng, 1.3, lastBg); lastBg = a;
          const bx = x0 + gap / 2, by = y0 + gap / 2, bw = cw - gap, bhh = bh - gap;
          g.rect(bx, by, bw, bhh, pal[a]);
          const kind = rng.int(0, 4);
          const nxu = Math.max(2, Math.round(bw / unit)), nyu = Math.max(2, Math.round(bhh / unit));
          const ux = bw / nxu, uy = bhh / nyu;
          if (kind === 0) { for (let j = 0; j < nyu; j += 2) g.rect(bx, by + j * uy, bw, uy, pal[b]); }
          else if (kind === 1) { for (let j = 0; j < nxu; j += 2) g.rect(bx + j * ux, by, ux, bhh, pal[b]); }
          else if (kind === 2) { for (let j = 0; j < nyu; j++) for (let ii = 0; ii < nxu; ii++) g.circle(bx + (ii + 0.5) * ux, by + (j + 0.5) * uy, Math.min(ux, uy) * 0.3, pal[b]); }
          else if (kind === 3) { for (let j = 0; j < nyu; j++) for (let ii = (j & 1); ii < nxu; ii += 2) g.rect(bx + ii * ux, by + j * uy, ux, uy, pal[b]); }
          else { /* solid with a notch row */ g.rect(bx, by + Math.floor(nyu / 2) * uy, bw, uy, pal[b]); }
        }
      }
      // traces on a routing grid that divides the tile exactly
      const gx = Math.max(6, Math.round(W / (1.3 * u))), gy = Math.max(6, Math.round(H / (1.3 * u)));
      const sx = W / gx, sy = H / gy, gs = Math.min(sx, sy);
      const tw = Math.max(1, 0.32 * u * p.trace), halo = Math.max(1, 0.2 * u);
      const dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]];
      const inkPool = [inks.ink1, inks.ink2, inks.deep, inks.ink1];
      const maxLen = Math.max(3, Math.floor(Math.min(gx, gy) / 3));
      for (let t = 0; t < p.traces; t++) {
        let x = rng.int(0, gx - 1), y = rng.int(0, gy - 1), d = rng.int(0, 3);
        const pts = [[x, y]], nseg = rng.int(3, 6);
        for (let sgm = 0; sgm < nseg; sgm++) {
          const len = rng.int(2, maxLen);
          x += dirs[d][0] * len; y += dirs[d][1] * len; pts.push([x, y]);
          d = (d + (rng.chance(0.5) ? 1 : 3)) % 4;
        }
        let col = inkPool[t % inkPool.length];
        const padSpark = rng.chance(0.2) && env.spark.take(Math.PI * gs * gs * 2.2);
        // path with rounded corners
        const build = (ox, oy) => {
          const P2 = pts.map(q => [q[0] * sx + ox, q[1] * sy + oy]);
          let dstr = 'M' + P2[0][0].toFixed(2) + ' ' + P2[0][1].toFixed(2);
          for (let k = 1; k < P2.length - 1; k++) {
            const a = P2[k - 1], b = P2[k], c = P2[k + 1];
            const l1 = Math.hypot(b[0] - a[0], b[1] - a[1]), l2 = Math.hypot(c[0] - b[0], c[1] - b[1]);
            const rr = Math.min(l1, l2) * 0.5, rc = Math.min(rr, 2.2 * gs);
            const p1 = [b[0] - (b[0] - a[0]) / l1 * rc, b[1] - (b[1] - a[1]) / l1 * rc], p2 = [b[0] + (c[0] - b[0]) / l2 * rc, b[1] + (c[1] - b[1]) / l2 * rc];
            dstr += 'L' + p1[0].toFixed(2) + ' ' + p1[1].toFixed(2) + 'Q' + b[0].toFixed(2) + ' ' + b[1].toFixed(2) + ' ' + p2[0].toFixed(2) + ' ' + p2[1].toFixed(2);
          }
          const e = P2[P2.length - 1];
          return dstr + 'L' + e[0].toFixed(2) + ' ' + e[1].toFixed(2);
        };
        let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
        pts.forEach(q => { minX = Math.min(minX, q[0] * sx); maxX = Math.max(maxX, q[0] * sx); minY = Math.min(minY, q[1] * sy); maxY = Math.max(maxY, q[1] * sy); });
        const ends = [pts[0], pts[pts.length - 1]];
        const drawAt = (ox, oy, pass) => {
          if (maxX + ox < -gs * 2 || minX + ox > W + gs * 2 || maxY + oy < -gs * 2 || minY + oy > H + gs * 2) return;
          if (pass === 0) {
            g.path(build(ox, oy), null, inks.ground, tw + halo * 2);
            ends.forEach(q => g.circle(q[0] * sx + ox, q[1] * sy + oy, gs * 0.9 + halo, inks.ground));
          } else {
            g.path(build(ox, oy), null, col, tw);
            ends.forEach((q, ei) => {
              g.circle(q[0] * sx + ox, q[1] * sy + oy, gs * 0.9, (padSpark && ei === 1) ? inks.spark : col);
              g.circle(q[0] * sx + ox, q[1] * sy + oy, gs * 0.38, inks.ground);
            });
          }
        };
        for (let pass = 0; pass < 2; pass++) for (let oy = -H; oy <= H; oy += H) for (let ox = -W; ox <= W; ox += W) drawAt(ox, oy, pass);
      }
    },
  });
})(window);
