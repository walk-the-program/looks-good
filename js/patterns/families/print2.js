/* patterns/families/print2.js — round 2 print and halftone families (original code):
   thermal, cutup, sonar, inkstill. */
(function (global) {
  'use strict';
  const P = global.Patterns, E = P.E, H1 = E.pf1;
  const SEL = E.sel;
  const TAU = Math.PI * 2;
  const clamp = E.clamp, smoothstep = E.smoothstep;

  // "#rrggbb" -> packed little-endian RGBA uint32
  function pk(hex) { const c = E.rgb(hex); return (255 << 24) | (c[2] << 16) | (c[1] << 8) | c[0]; }
  function offscreen(w, h) { const c = global.document.createElement('canvas'); c.width = w; c.height = h; return c; }

  /* ---------- 1. Thermal screen ---------- */
  P.register({
    key: 'thermal', name: 'Thermal screen', category: 'Halftone & print',
    blurb: 'Turbulent noise posterised into heat-map bands, each band printed through a dot screen that grows toward the hot end.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: false, seamless: false,
    common: { grain: 0.14 },
    params: [
      { key: 'bands', label: 'Heat bands', type: 'range', min: 3, max: 7, step: 1, default: 4 },
      { key: 'cell', label: 'Dot pitch', type: 'range', min: 0.8, max: 3, step: 0.1, default: 1.4 },
      { key: 'turb', label: 'Turbulence', type: 'range', min: 0.4, max: 2, step: 0.1, default: 1 },
      { key: 'shape', label: 'Dot', type: 'select', options: SEL(['round', 'ring', 'mixed']), default: 'round' },
      { key: 'flat', label: 'Flat band colour', type: 'toggle', default: true },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u, ctx = g.ctx, L = p.bands;
      const cols = H1.bands(H1.ladder(inks), L);
      const F = 62 * u * p.scale / p.turb;
      const raw = (x, y) => {
        const qx = noise.fbm(x / F + 3.1, y / F + 1.7, 2), qy = noise.fbm(x / F - 5.2, y / F + 8.3, 2);
        return noise.fbm(x / F * 0.7 + 0.75 * qx, y / F * 0.7 + 0.75 * qy, 3);
      };
      const fr = E.fieldRange(raw, W, H), fs = fr.hi - fr.lo;
      const f = (x, y) => clamp((raw(x, y) - fr.lo) / fs, 0, 1);
      const samp = H1.sampler(f, W, H, Math.max(2, Math.round(u * 0.5)));
      g.fill(inks.ground);
      if (p.flat) {
        const sc = Math.max(1, Math.sqrt(W * H / 300000)), bw = Math.ceil(W / sc), bh = Math.ceil(H / sc);
        const cv = offscreen(bw, bh), cx = cv.getContext('2d'), id = cx.createImageData(bw, bh), d32 = new Uint32Array(id.data.buffer);
        const pc = cols.map(pk);
        for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
          const b = Math.min(L - 1, (samp((x + 0.5) * sc, (y + 0.5) * sc) * L) | 0);
          d32[y * bw + x] = pc[b];
        }
        cx.putImageData(id, 0, 0);
        ctx.save(); ctx.imageSmoothingEnabled = true; ctx.drawImage(cv, 0, 0, bw, bh, 0, 0, bw * sc, bh * sc); ctx.restore();
      }
      const cell = p.cell * u * p.scale, rowH = cell * 0.866;
      const lw = Math.max(1, cell * 0.14);
      const nj = Math.ceil(H / rowH) + 1, ni = Math.ceil(W / cell) + 1;
      for (let j = 0; j < nj; j++) {
        const y = j * rowH;
        for (let i = 0; i < ni; i++) {
          const x = (i + (j & 1) * 0.5) * cell;
          const q = samp(Math.min(x, W - 1), Math.min(y, H - 1)) * L;
          const b = Math.min(L - 1, q | 0);
          const t = L > 1 ? b / (L - 1) : 1;
          let col = b < L - 1 ? cols[b + 1] : cols[L - 2 >= 0 ? L - 2 : 0];
          if (!p.flat) col = cols[b];
          if (!p.flat && b === 0) continue;
          let r = cell * (0.2 + 0.4 * t);
          if (b === L - 1 && L > 2 && rng.next() < 0.035 && env.spark.take(Math.PI * r * r * 1.4)) col = inks.spark;
          const ringy = p.shape === 'ring' || (p.shape === 'mixed' && (b & 1));
          if (ringy) g.ring(x, y, r * 0.95, Math.max(lw, r * 0.38), col);
          else g.circle(x, y, r, col);
        }
      }
    },
  });

  /* ---------- 2. Cut-up hills ---------- */
  function splitRects(W, H, n, rng) {
    const rs = [{ x: 0, y: 0, w: W, h: H }];
    while (rs.length < n) {
      let bi = 0;
      for (let i = 1; i < rs.length; i++) if (rs[i].w * rs[i].h > rs[bi].w * rs[bi].h) bi = i;
      const r = rs.splice(bi, 1)[0], t = rng.range(0.34, 0.66);
      const vertical = r.w * 0.78 >= r.h ? true : r.h * 0.78 >= r.w ? false : rng.chance(0.5);
      if (vertical) { rs.push({ x: r.x, y: r.y, w: r.w * t, h: r.h }, { x: r.x + r.w * t, y: r.y, w: r.w * (1 - t), h: r.h }); }
      else { rs.push({ x: r.x, y: r.y, w: r.w, h: r.h * t }, { x: r.x, y: r.y + r.h * t, w: r.w, h: r.h * (1 - t) }); }
    }
    return rs;
  }

  P.register({
    key: 'cutup', name: 'Cut-up hills', category: 'Halftone & print',
    blurb: 'One soft hilly field sliced into rectangles, each piece printed with its own screen of dots, lines or stipple.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: true, seamless: false,
    common: { grain: 0.16 },
    params: [
      { key: 'pieces', label: 'Pieces', type: 'range', min: 3, max: 6, step: 1, default: 5 },
      { key: 'cell', label: 'Screen pitch', type: 'range', min: 0.8, max: 2.6, step: 0.1, default: 1.4 },
      { key: 'hills', label: 'Hill size', type: 'range', min: 0.5, max: 2, step: 0.1, default: 1 },
      { key: 'slip', label: 'Slip between pieces', type: 'range', min: 0, max: 1, step: 0.05, default: 0.55 },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u, sc = p.scale;
      g.fill(inks.ground);
      const per = 34 * u * sc * p.hills, fx = 46 * u * sc * p.hills;
      const hill = (x, y) => {
        const w = noise.fbm(x / fx, y / (fx * 0.8), 3);
        const a = 0.5 + 0.5 * Math.sin(TAU * (y / per + 0.85 * w));
        const b = 0.5 + 0.5 * Math.sin(TAU * (y / (per * 0.53) + 1.3 * noise.fbm(x / (fx * 0.7) + 9, y / fx, 2) + 0.2));
        return smoothstep(0.08, 0.92, a * 0.72 + b * 0.28);
      };
      const rects = splitRects(W, H, p.pieces, rng);
      const gap = Math.max(1, 0.3 * u);
      const pairsAll = [
        [inks.ground, inks.ink1], [inks.ink1, inks.ground], [inks.ground, inks.ink2], [inks.ink2, inks.deep],
        [inks.ink1, inks.deep], [inks.deep, inks.ink2], [inks.ink2, inks.ground], [inks.deep, inks.ground],
      ];
      const kinds = ['dots', 'lines', 'stipple'];
      let lastBg = null, sparked = false;
      const order = rng.shuffle(rects.slice());
      order.forEach((r, ri) => {
        let pair; let tries = 0;
        do { pair = pairsAll[rng.int(0, pairsAll.length - 1)]; tries++; } while ((pair[0] === lastBg || E.contrast(pair[0], pair[1]) < 1.5) && tries < 30);
        let [bg, fg] = pair; lastBg = bg;
        const kind = kinds[ri % 3];
        const ox = rng.range(-1, 1) * 9 * u * p.slip, oy = rng.range(-1, 1) * 9 * u * p.slip;
        const x0 = r.x + (r.x > 0 ? gap / 2 : 0), y0 = r.y + (r.y > 0 ? gap / 2 : 0);
        const x1 = r.x + r.w - (r.x + r.w < W - 1 ? gap / 2 : 0), y1 = r.y + r.h - (r.y + r.h < H - 1 ? gap / 2 : 0);
        const pw = x1 - x0, ph = y1 - y0;
        g.rect(x0, y0, pw, ph, bg);
        const cell = p.cell * u * sc * (kind === 'stipple' ? 0.62 : 1);
        const field = (x, y) => hill(x + ox, y + oy);
        g.clipRect(x0, y0, pw, ph, () => {
          if (kind === 'dots') {
            const ang = rng.pick([0.7854, 0.5236, 0]), c = Math.cos(ang), s = Math.sin(ang);
            const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, n = Math.ceil(Math.hypot(pw, ph) / cell / 2) + 1;
            const maxR = cell * 0.62;
            for (let j = -n; j <= n; j++) for (let i = -n; i <= n; i++) {
              const lx = i * cell, ly = j * cell, x = cx + lx * c - ly * s, y = cy + lx * s + ly * c;
              if (x < x0 - cell || x > x1 + cell || y < y0 - cell || y > y1 + cell) continue;
              const v = field(x, y), rr = maxR * Math.pow(v, 0.8);
              if (rr < 0.45) continue;
              let col = fg;
              if (!sparked && v > 0.93 && rng.next() < 0.1 && env.spark.take(Math.PI * rr * rr * 3)) { col = inks.spark; }
              g.circle(x, y, rr, col);
            }
          } else if (kind === 'lines') {
            const ang = rng.pick([0, Math.PI / 2, 0.7854, -0.7854]), c = Math.cos(ang), s = Math.sin(ang);
            const sp = cell * 0.95, step = cell * 0.5;
            const corners = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
            let pmin = 1e9, pmax = -1e9, tmin = 1e9, tmax = -1e9;
            corners.forEach(q => { const a = q[0] * -s + q[1] * c, b = q[0] * c + q[1] * s; pmin = Math.min(pmin, a); pmax = Math.max(pmax, a); tmin = Math.min(tmin, b); tmax = Math.max(tmax, b); });
            for (let a = Math.floor(pmin / sp) * sp; a <= pmax + sp; a += sp) {
              const top = [], bot = [];
              for (let b = tmin - step; b <= tmax + step; b += step) {
                const x = a * -s + b * c, y = a * c + b * s;
                const v = field(x, y), th = sp * 0.92 * Math.pow(v, 0.9) * 0.5;
                top.push(x + -s * th, y + c * th); bot.push(x - -s * th, y - c * th);
              }
              const pts = top.slice();
              for (let k = bot.length - 2; k >= 0; k -= 2) pts.push(bot[k], bot[k + 1]);
              g.poly(pts, fg);
            }
          } else {
            const cs = cell, cols = Math.ceil(pw / cs) + 1, rows = Math.ceil(ph / cs) + 1;
            for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
              const x = x0 + (i + rng.next()) * cs, y = y0 + (j + rng.next()) * cs;
              const v = field(x, y);
              if (rng.next() < Math.pow(v, 1.25) * 1.1) g.circle(x, y, Math.max(0.8 * env.dpr, cs * (0.2 + 0.12 * rng.next())), fg);
            }
          }
        });
      });
    },
  });

  /* ---------- 3. Coastline ---------- */
  function march(vals, gw, gh, step, level, emit) {
    const lerpE = (a, b) => (a === b ? 0.5 : (level - a) / (b - a));
    for (let j = 0; j < gh - 1; j++) for (let i = 0; i < gw - 1; i++) {
      const a = vals[j * gw + i], b = vals[j * gw + i + 1], c = vals[(j + 1) * gw + i + 1], d = vals[(j + 1) * gw + i];
      const k = (a > level ? 1 : 0) | (b > level ? 2 : 0) | (c > level ? 4 : 0) | (d > level ? 8 : 0);
      if (k === 0 || k === 15) continue;
      const x = i * step, y = j * step;
      const T = () => [x + lerpE(a, b) * step, y], R = () => [x + step, y + lerpE(b, c) * step];
      const B = () => [x + lerpE(d, c) * step, y + step], Lf = () => [x, y + lerpE(a, d) * step];
      const seg = (p1, p2) => emit(p1[0], p1[1], p2[0], p2[1]);
      switch (k) {
        case 1: case 14: seg(Lf(), T()); break;
        case 2: case 13: seg(T(), R()); break;
        case 3: case 12: seg(Lf(), R()); break;
        case 4: case 11: seg(R(), B()); break;
        case 6: case 9: seg(T(), B()); break;
        case 7: case 8: seg(Lf(), B()); break;
        case 5: seg(Lf(), T()); seg(R(), B()); break;
        case 10: seg(T(), R()); seg(Lf(), B()); break;
      }
    }
  }

  P.register({
    key: 'sonar', name: 'Coastline', category: 'Halftone & print',
    blurb: 'A landmass cut from noise: halftone dots thin toward the shore, where the edge dissolves into two-ink speckle and depth contours.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: false, seamless: false,
    common: { grain: 0.12 },
    params: [
      { key: 'land', label: 'Land', type: 'range', min: 0.25, max: 0.7, step: 0.05, default: 0.45 },
      { key: 'size', label: 'Coast scale', type: 'range', min: 0.5, max: 2, step: 0.1, default: 1 },
      { key: 'speckle', label: 'Speckle', type: 'range', min: 0, max: 1, step: 0.05, default: 0.7 },
      { key: 'contours', label: 'Contour lines', type: 'toggle', default: true },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u;
      g.fill(inks.ground);
      const f = E.makeField(noise, env, W, H, 52 * u * p.scale * p.size, { oct: 4 });
      const thr = 1 - p.land;
      const step = Math.max(2, Math.round(u * 1.3));
      const sf = H1.sampler(f, W, H, step);
      // contours (marching squares on the same lattice)
      if (p.contours) {
        const gw = Math.ceil(W / step) + 2, gh = Math.ceil(H / step) + 2, vals = new Float32Array(gw * gh);
        for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) vals[j * gw + i] = f(i * step, j * step);
        const lc = E.mix(inks.ink2, inks.ground, 0.8);
        const lw = Math.max(0.8, u * 0.11);
        for (let k = -7; k <= 7; k++) {
          if (k === 0) continue;
          const lvl = thr + k * 0.085;
          if (lvl <= 0.02 || lvl >= 0.98) continue;
          march(vals, gw, gh, step, lvl, (x1, y1, x2, y2) => g.line(x1, y1, x2, y2, lc, lw, 'round'));
        }
      }
      // halftone interior
      const cell = 1.35 * u * p.scale;
      const rowH = cell * 0.866, maxR = cell * 0.7;
      const terr = E.makeField(noise, env, W, H, 70 * u, { oct: 2, off: [4, 9] });
      for (let j = 0; j * rowH < H + cell; j++) for (let i = 0; i * cell < W + cell; i++) {
        const x = (i + (j & 1) * 0.5) * cell, y = j * rowH;
        const d = sf(Math.min(x, W - 1), Math.min(y, H - 1)) - thr;
        if (d <= 0.012) continue;
        const inl = smoothstep(0.0, 0.34, d);
        const r = maxR * Math.pow(inl, 0.9);
        if (r < 0.5) continue;
        const col = terr(x, y) > 0.8 ? inks.deep : inks.ink1;
        g.circle(x, y, r, col);
      }
      // speckle along the shore
      const N = Math.round(46000 * p.speckle * (W * H) / (1200 * 800));
      let hot = 0;
      for (let a = 0; a < N; a++) {
        const x = rng.next() * W, y = rng.next() * H;
        const d = sf(x, y) - thr, ad = Math.abs(d);
        const w = d > 0 ? 0.1 : 0.07;
        const pr = Math.exp(-(ad / w) * (ad / w));
        const roll = rng.next();
        if (roll > pr) continue;
        let col = rng.next() < (d > 0 ? 0.7 : 0.25) ? inks.ink1 : inks.ink2;
        let r = u * (0.14 + 0.26 * rng.next() * (1 - ad / (w * 1.8)));
        if (ad < 0.012 && rng.next() < 0.015 && env.spark.take(Math.PI * r * r * 4)) { col = inks.spark; r *= 1.5; hot++; }
        if (r < 0.5) r = 0.5;
        g.circle(x, y, r, col);
      }
    },
  });

  /* ---------- 4. Riso still life ---------- */
  function Bitmap(w, h) { this.w = w; this.h = h; this.d = new Uint8Array(w * h); }
  Bitmap.prototype = {
    plot(x, y, v) { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.d[y * this.w + x] = v || 1; },
    line(x0, y0, x1, y1) {
      x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
      const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
      let err = dx + dy, guard = 0;
      for (;;) {
        this.plot(x0, y0);
        if ((x0 === x1 && y0 === y1) || guard++ > 4000) break;
        const e2 = 2 * err;
        if (e2 >= dy) { err += dy; x0 += sx; }
        if (e2 <= dx) { err += dx; y0 += sy; }
      }
    },
    ellipse(cx, cy, rx, ry, a0, a1) {
      const n = Math.max(24, Math.ceil((rx + ry) * 6));
      let px = null, py = null;
      for (let i = 0; i <= n; i++) {
        const a = a0 + (a1 - a0) * i / n, x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry;
        if (px !== null) this.line(px, py, x, y); px = x; py = y;
      }
    },
    // pointed leaf from (x,y) along angle a, length len, half-width wd
    leaf(x, y, a, len, wd, vein) {
      const ca = Math.cos(a), sa = Math.sin(a), n = Math.max(8, Math.ceil(len * 2));
      let u0 = null, l0 = null;
      for (let i = 0; i <= n; i++) {
        const t = i / n, w = Math.sin(Math.PI * Math.pow(t, 0.8)) * wd;
        const ax = x + ca * len * t, ay = y + sa * len * t;
        const up = [ax - sa * w, ay + ca * w], lo = [ax + sa * w, ay - ca * w];
        if (u0) { this.line(u0[0], u0[1], up[0], up[1]); this.line(l0[0], l0[1], lo[0], lo[1]); }
        u0 = up; l0 = lo;
      }
      if (vein) this.line(x, y, x + ca * len * 0.9, y + sa * len * 0.9);
    },
  };

  P.register({
    key: 'inkstill', name: 'Riso still life', category: 'Halftone & print',
    blurb: 'Flat cut-out masses, one-bit pixel outlines of vases and sprigs, dithered noise blocks and registration marks.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: false, seamless: false,
    common: { grain: 0.2 },
    params: [
      { key: 'px', label: 'Pixel size', type: 'range', min: 0.4, max: 1.6, step: 0.05, default: 0.8 },
      { key: 'masses', label: 'Cut-outs', type: 'range', min: 2, max: 6, step: 1, default: 4 },
      { key: 'vessels', label: 'Still lifes', type: 'range', min: 1, max: 4, step: 1, default: 2 },
      { key: 'dither', label: 'Dither blocks', type: 'range', min: 0, max: 4, step: 1, default: 2 },
      { key: 'marks', label: 'Registration marks', type: 'toggle', default: true },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u, ctx = g.ctx;
      g.fill(inks.ground);
      const light = E.lum(inks.ground) > 0.45;
      const c = Math.max(2, Math.round(p.px * u * p.scale)), gw = Math.ceil(W / c), gh = Math.ceil(H / c);
      const snap = v => Math.round(v / c) * c;
      // 1. flat cut-out masses
      ctx.save();
      if (light) ctx.globalCompositeOperation = 'multiply';
      const massCols = [inks.ink1, inks.ink2, inks.deep, inks.ink1, inks.ink2, inks.t1];
      const massPos = [];
      for (let i = 0; i < p.masses; i++) {
        const R = u * rng.range(13, 27) * (i === 0 ? 1.25 : 1);
        const cx = W * rng.range(0.1, 0.9), cy = H * rng.range(0.15, 0.85);
        const k1 = rng.int(2, 4), k2 = rng.int(5, 8), ph1 = rng.range(0, TAU), ph2 = rng.range(0, TAU);
        const sq = rng.range(0.65, 1);
        const pts = [];
        for (let s = 0; s < 72; s++) {
          const a = s / 72 * TAU, r = R * (1 + 0.2 * Math.sin(a * k1 + ph1) + 0.09 * Math.sin(a * k2 + ph2));
          pts.push(cx + Math.cos(a) * r, cy + Math.sin(a) * r * sq);
        }
        let col = massCols[i % massCols.length];
        if (i === 2 && env.spark.take(Math.PI * R * R * 0.5)) col = inks.spark;
        g.poly(pts, col);
        massPos.push([cx, cy, R]);
      }
      ctx.restore();
      // 2. dithered noise blocks
      const nb = Math.round(p.dither);
      for (let b = 0; b < nb; b++) {
        const bw = Math.round(rng.range(18, 36) / p.px * 0.8), bh = Math.round(rng.range(12, 26) / p.px * 0.8);
        const bx = rng.int(0, Math.max(0, gw - bw)), by = rng.int(0, Math.max(0, gh - bh));
        const col = [inks.deep, inks.ink2, inks.ink1][b % 3];
        const dir = rng.int(0, 3), ns = rng.range(0, 99);
        for (let j = 0; j < bh; j++) {
          let run = -1;
          for (let i = 0; i <= bw; i++) {
            let on = false;
            if (i < bw) {
              const tt = dir === 0 ? i / bw : dir === 1 ? 1 - i / bw : dir === 2 ? j / bh : 1 - j / bh;
              const v = clamp(tt * 0.8 + 0.12 + noise.fbm((bx + i) * 0.19 + ns, (by + j) * 0.19, 2) * 0.35, 0, 1);
              on = v > E.bayer8.at(bx + i, by + j);
            }
            if (on && run < 0) run = i;
            if (!on && run >= 0) { ctx.fillStyle = col; ctx.fillRect((bx + run) * c, (by + j) * c, (i - run) * c, c); run = -1; }
          }
        }
      }
      // 3. one-bit line work
      const bm = new Bitmap(gw, gh);
      const nv = p.vessels;
      for (let v = 0; v < nv; v++) {
        const cxCell = Math.round(gw * (nv === 1 ? rng.range(0.35, 0.65) : (v + rng.range(0.25, 0.75)) / nv));
        const baseY = Math.round(gh * rng.range(0.74, 0.92));
        const kind = rng.pick(['vase', 'bottle', 'bowl', 'jug']);
        const hv = Math.round(rng.range(0.26, 0.4) * gh);
        const hw = Math.round(hv * rng.range(0.32, 0.5));
        // profile: half-width as a function of t (0 top .. 1 base)
        const prof = {
          vase: t => hw * (0.34 + 0.66 * Math.sin(Math.PI * Math.pow(t * 0.92 + 0.04, 0.9)) ** 0.8) * (t > 0.92 ? 0.85 : 1),
          bottle: t => hw * (t < 0.34 ? 0.3 : 0.3 + 0.7 * smoothstep(0.34, 0.5, t)) * 0.85,
          bowl: t => hw * 1.5 * Math.sqrt(Math.max(0, 1 - (1 - t) * (1 - t))) * (t < 0.04 ? 1 : 1),
          jug: t => hw * (0.62 + 0.38 * Math.sin(Math.PI * (t * 0.8 + 0.1))) * (t < 0.14 ? 0.8 + t : 1),
        }[kind];
        const h = kind === 'bowl' ? Math.round(hv * 0.55) : hv;
        const top = baseY - h;
        let pl = null, pr = null;
        for (let y = 0; y <= h; y++) {
          const t = y / h, w = prof(t);
          const l = [cxCell - w, top + y], r = [cxCell + w, top + y];
          if (pl) { bm.line(pl[0], pl[1], l[0], l[1]); bm.line(pr[0], pr[1], r[0], r[1]); }
          pl = l; pr = r;
        }
        bm.line(cxCell - prof(1), baseY, cxCell + prof(1), baseY);
        bm.line(cxCell - prof(0), top, cxCell + prof(0), top);
        // shading hatch on the right third
        for (let y = 2; y < h - 1; y++) {
          const w = prof(y / h);
          for (let x = Math.round(cxCell + w * 0.35); x < cxCell + w - 1; x++) if (((x + y) & 1) === 0) bm.plot(x, top + y);
        }
        // band motif
        const by = top + Math.round(h * rng.range(0.3, 0.55));
        for (let x = -prof((by - top) / h) + 2; x < prof((by - top) / h) - 1; x += 2) bm.plot(cxCell + x, by);
        // sprig
        const stems = kind === 'bowl' ? 0 : rng.int(2, 4);
        for (let s = 0; s < stems; s++) {
          const dir = (s / Math.max(1, stems - 1) - 0.5) * 2 * rng.range(0.6, 1.1), len = h * rng.range(0.9, 1.6);
          let px = cxCell + dir * 2, py = top;
          const bend = rng.range(-0.5, 0.5);
          const pts = [];
          for (let i = 0; i <= 28; i++) {
            const t = i / 28, x = cxCell + dir * len * 0.55 * t + bend * len * 0.25 * Math.sin(t * Math.PI), y = top - len * t * (1 - 0.15 * Math.abs(dir));
            pts.push([x, y]);
            if (i) bm.line(px, py, x, y); px = x; py = y;
            if (i % 5 === 3 && i < 26) {
              const side = (i / 5 | 0) & 1 ? 1 : -1;
              bm.leaf(x, y, -Math.PI / 2 + side * rng.range(0.7, 1.2) + dir * 0.4, h * rng.range(0.2, 0.34), h * rng.range(0.05, 0.09), true);
            }
          }
          const tip = pts[pts.length - 1], R = Math.max(2, Math.round(h * rng.range(0.07, 0.12)));
          if (rng.chance(0.6)) {
            bm.ellipse(tip[0], tip[1] - R, R, R, 0, TAU);
            for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; bm.ellipse(tip[0] + Math.cos(a) * R * 1.55, tip[1] - R + Math.sin(a) * R * 1.55, R * 0.7, R * 0.7, 0, TAU); }
          } else bm.leaf(tip[0], tip[1], -Math.PI / 2 + dir * 0.6, h * 0.3, h * 0.07, true);
        }
        if (kind === 'bowl') {   // fruit
          for (let k = 0; k < 3; k++) { const fr = Math.round(h * rng.range(0.22, 0.34)); bm.ellipse(cxCell + (k - 1) * fr * 1.5, top - fr + 1, fr, fr, Math.PI, TAU); }
        }
      }
      // read the artwork under the line work to choose a legible 1-bit colour
      const img = ctx.getImageData(0, 0, W, H).data;
      const A = inks.deep, B = inks.ground;
      for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
        if (!bm.d[j * gw + i]) continue;
        const px = Math.min(W - 1, i * c + (c >> 1)), py = Math.min(H - 1, j * c + (c >> 1)), o = (py * W + px) * 4;
        const under = E.mix('#' + [img[o], img[o + 1], img[o + 2]].map(v => v.toString(16).padStart(2, '0')).join(''), '#000000', 1);
        ctx.fillStyle = E.contrast(A, under) >= E.contrast(B, under) ? A : B;
        ctx.fillRect(i * c, j * c, c, c);
      }
      // 4. registration marks
      if (p.marks) {
        const mc = E.contrast(inks.deep, inks.ground) > 2 ? inks.deep : inks.ink1;
        const m = 3.2 * u, r = 1.1 * u, lw = Math.max(1, 0.13 * u), arm = 2.3 * u;
        const spots = [[m, m], [W - m, m], [m, H - m], [W - m, H - m], [W / 2, m], [W / 2, H - m]];
        spots.forEach(s => {
          g.ring(s[0], s[1], r, lw, mc);
          g.line(s[0] - arm, s[1], s[0] + arm, s[1], mc, lw);
          g.line(s[0], s[1] - arm, s[0], s[1] + arm, mc, lw);
        });
      }
    },
  });
})(window);
