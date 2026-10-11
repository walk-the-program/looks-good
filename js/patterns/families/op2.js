/* patterns/families/op2.js — round 2 op-art and soft-colour families (original code):
   warpcheck, burst, ribbonrise, neonspray. */
(function (global) {
  'use strict';
  const P = global.Patterns, E = P.E, H1 = E.pf1;
  const SEL = E.sel;
  const TAU = Math.PI * 2;
  const clamp = E.clamp, smoothstep = E.smoothstep;

  function offscreen(w, h) { const c = global.document.createElement('canvas'); c.width = w; c.height = h; return c; }

  /* ---------- 5. Warped check ---------- */
  P.register({
    key: 'warpcheck', name: 'Warped check', category: 'Stripes & op-art',
    blurb: 'A razor-clean checker or slash grid pushed through a smooth wave, taper or bulge.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: true, seamless: false,
    common: { grain: 0.04 },
    params: [
      { key: 'pattern', label: 'Pattern', type: 'select', options: SEL(['check', 'slash', 'chevron']), default: 'check' },
      { key: 'warp', label: 'Warp', type: 'select', options: SEL(['wave', 'taper', 'bulge']), default: 'wave' },
      { key: 'cells', label: 'Cells across', type: 'range', min: 8, max: 40, step: 1, default: 20 },
      { key: 'amp', label: 'Warp amount', type: 'range', min: 0.1, max: 1, step: 0.05, default: 0.6 },
      { key: 'waves', label: 'Wave count', type: 'range', min: 1, max: 4, step: 0.5, default: 2 },
      { key: 'second', label: 'Second ink zone', type: 'toggle', default: true },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u;
      const n = clamp(Math.round(p.cells / p.scale), 6, 64), cw = W / n;
      const amp = p.amp, A = amp * H * 0.14, ph1 = rng.range(0, TAU), ph2 = rng.range(0, TAU);
      const kind = p.warp;
      const M = (X, Y) => {
        if (kind === 'wave') {
          return [X + A * Math.sin(TAU * p.waves * Y / H + ph1) * (0.75 + 0.25 * Math.sin(TAU * X / W * 1.3 + ph2)),
            Y + A * 0.7 * Math.sin(TAU * p.waves * X / W * 0.9 + ph2)];
        }
        if (kind === 'taper') {
          const ny = Y / H, sc = 1.0 + amp * 0.85 - ny * (amp * 1.55);
          return [W / 2 + (X - W / 2) * Math.max(0.12, sc), Y + Math.sin(TAU * X / W * p.waves * 0.5 + ph1) * A * 0.18];
        }
        const cx = W * 0.5, cy = H * 0.5, R = 0.5 * H, dx = X - cx, dy = Y - cy;
        const f = 1 + amp * 1.5 * Math.exp(-(dx * dx + dy * dy) / (R * R) * 1.25);
        return [cx + dx * f, cy + dy * f];
      };
      const pad = kind === 'taper' ? Math.ceil(n * 1.2) : Math.ceil(A / cw) + 3;
      const ny = Math.ceil(H / cw) + 1;
      const SUB = 4;
      const pair1 = [inks.ink1, inks.ground], pair2 = [inks.ink2, E.contrast(inks.deep, inks.ground) > 1.6 ? inks.deep : inks.ink1];
      g.fill(inks.ground);
      const zoneAt = (X, Y) => p.second && noise.fbm(X / (70 * u) + 4.1, Y / (60 * u) - 2.3, 2) > 0.1;
      const quad = (X0, Y0, s, infl) => {
        const pts = [];
        const edge = (ax, ay, bx, by) => { for (let k = 0; k < SUB; k++) { const t = k / SUB; pts.push(...M(ax + (bx - ax) * t, ay + (by - ay) * t)); } };
        edge(X0, Y0, X0 + s, Y0); edge(X0 + s, Y0, X0 + s, Y0 + s); edge(X0 + s, Y0 + s, X0, Y0 + s); edge(X0, Y0 + s, X0, Y0);
        if (infl) {
          let cx = 0, cy = 0; const m = pts.length / 2;
          for (let i = 0; i < m; i++) { cx += pts[i * 2]; cy += pts[i * 2 + 1]; }
          cx /= m; cy /= m;
          for (let i = 0; i < m; i++) { const dx = pts[i * 2] - cx, dy = pts[i * 2 + 1] - cy, d = Math.hypot(dx, dy) || 1; pts[i * 2] += dx / d * infl; pts[i * 2 + 1] += dy / d * infl; }
        }
        return pts;
      };
      // slash stroke inside a cell, in cell coords; flip mirrors it
      const stroke = (X0, Y0, s, flip) => {
        const v = flip ? [[1, 0.7], [0.3, 0], [0, 0], [0, 0.3], [0.7, 1], [1, 1]] : [[0, 0.7], [0.7, 0], [1, 0], [1, 0.3], [0.3, 1], [0, 1]];
        const pts = [];
        for (let i = 0; i < v.length; i++) {
          const a = v[i], b = v[(i + 1) % v.length];
          for (let k = 0; k < 3; k++) { const t = k / 3; pts.push(...M(X0 + (a[0] + (b[0] - a[0]) * t) * s, Y0 + (a[1] + (b[1] - a[1]) * t) * s)); }
        }
        return pts;
      };
      const inView = pts => {
        let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
        for (let i = 0; i < pts.length; i += 2) { x0 = Math.min(x0, pts[i]); x1 = Math.max(x1, pts[i]); y0 = Math.min(y0, pts[i + 1]); y1 = Math.max(y1, pts[i + 1]); }
        return x1 > -2 && y1 > -2 && x0 < W + 2 && y0 < H + 2;
      };
      const cellsList = [];
      for (let j = -pad; j < ny + pad; j++) for (let i = -pad; i < n + pad; i++) {
        const X0 = i * cw, Y0 = j * cw;
        const q = quad(X0, Y0, cw, 0);
        if (!inView(q)) continue;
        cellsList.push([i, j, X0, Y0]);
      }
      // zone 2 backgrounds first
      cellsList.forEach(c => { if (zoneAt(c[2] + cw / 2, c[3] + cw / 2)) g.poly(quad(c[2], c[3], cw, 0.3), pair2[1]); });
      const sparkP = 0.012;
      cellsList.forEach(c => {
        const [i, j, X0, Y0] = c, z = zoneAt(X0 + cw / 2, Y0 + cw / 2);
        let col = z ? pair2[0] : pair1[0];
        if (p.pattern === 'check') {
          if (((i + j) & 1) === 0) return;
          if (rng.next() < sparkP && env.spark.take(cw * cw * 1.2)) col = inks.spark;
          g.poly(quad(X0, Y0, cw, 0.6), col);
        } else {
          const flip = p.pattern === 'slash' ? false : (i & 1) === 1;
          if (rng.next() < sparkP && env.spark.take(cw * cw * 0.6)) col = inks.spark;
          g.poly(stroke(X0, Y0, cw, flip), col);
        }
      });
    },
  });

  /* ---------- 6. Dash burst ---------- */
  P.register({
    key: 'burst', name: 'Dash burst', category: 'Stripes & op-art',
    blurb: 'Rays of short dashes radiating from a centre in stacked inks, with bead accents and a slight bend.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: true, seamless: false,
    common: { grain: 0.16 },
    params: [
      { key: 'rays', label: 'Rays', type: 'range', min: 24, max: 120, step: 4, default: 60 },
      { key: 'layers', label: 'Ink layers', type: 'range', min: 1, max: 3, step: 1, default: 3 },
      { key: 'bend', label: 'Bend', type: 'range', min: 0, max: 1, step: 0.05, default: 0.4 },
      { key: 'beads', label: 'Beads', type: 'range', min: 0, max: 1, step: 0.05, default: 0.5 },
      { key: 'origin', label: 'Centre', type: 'select', options: SEL(['centre', 'low', 'corner']), default: 'centre' },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u;
      g.fill(inks.ground);
      const o = p.origin === 'low' ? [0.5, 1.05] : p.origin === 'corner' ? [0.12, 0.98] : [0.5, 0.5];
      const cx = W * o[0], cy = H * o[1];
      const N = Math.round(p.rays * Math.sqrt(p.scale) * (p.origin === 'centre' ? 1 : 0.6));
      const rmin = 4.2 * u, rmax = Math.hypot(W, H) * 1.02;
      const cols = [inks.ink1, inks.ink2, inks.deep];
      const bendK = p.bend * 0.55;
      for (let ly = 0; ly < p.layers; ly++) {
        const col = cols[ly];
        const lr = rng.fork('layer' + ly);
        for (let k = 0; k < N; k++) {
          const th0 = (k + ly / p.layers * 0.8 + (ly ? 0.1 : 0)) / N * TAU;
          let r = rmin * (1 + ly * 0.35) * (1 + lr.next() * 0.5);
          const beadRay = lr.next() < p.beads * 0.45;
          while (r < rmax) {
            const ld = r * lr.range(0.09, 0.3), lg = r * lr.range(0.07, 0.2);
            const a0 = th0 + bendK * Math.log(r / rmin) * 0.5, a1 = th0 + bendK * Math.log((r + ld) / rmin) * 0.5;
            const w = Math.min(TAU * r / N * (0.4 - ly * 0.05), 3.4 * u);
            const x0 = cx + Math.cos(a0) * r, y0 = cy + Math.sin(a0) * r, x1 = cx + Math.cos(a1) * (r + ld), y1 = cy + Math.sin(a1) * (r + ld);
            if (!((x0 < -w && x1 < -w) || (x0 > W + w && x1 > W + w) || (y0 < -w && y1 < -w) || (y0 > H + w && y1 > H + w))) {
              g.line(x0, y0, x1, y1, col, Math.max(0.8, w), 'round');
              if (beadRay && lr.next() < 0.3) {
                let bc = ly === 0 ? inks.ink2 : inks.ink1;
                const br = Math.max(1, w * 0.95);
                if (lr.next() < 0.05 && env.spark.take(Math.PI * br * br * 1.5)) bc = inks.spark;
                const rb = r + ld + br * 1.4, ab = th0 + bendK * Math.log(rb / rmin) * 0.5;
                g.circle(cx + Math.cos(ab) * rb, cy + Math.sin(ab) * rb, br, bc);
              }
            }
            r += ld + lg;
          }
        }
      }
    },
  });

  /* ---------- 7. Banded counterchange ---------- */
  P.register({
    key: 'ribbonrise', name: 'Banded counterchange', category: 'Stripes & op-art',
    blurb: 'An even bar field with big concentric colour bands rising from one edge that flip the bars where they cross.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: true, seamless: false,
    common: { grain: 0.1 },
    params: [
      { key: 'edge', label: 'Rises from', type: 'select', options: SEL(['bottom', 'top', 'left', 'right']), default: 'bottom' },
      { key: 'bar', label: 'Bar width', type: 'range', min: 0.8, max: 3.5, step: 0.1, default: 1.7 },
      { key: 'bands', label: 'Bands', type: 'range', min: 2, max: 6, step: 1, default: 4 },
      { key: 'shift', label: 'Centre shift', type: 'range', min: -0.4, max: 0.4, step: 0.05, default: 0.12 },
      { key: 'ring', label: 'Spark ring', type: 'toggle', default: true },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u, edge = p.edge;
      const vert = edge === 'bottom' || edge === 'top';
      const Wv = vert ? W : H, Hv = vert ? H : W;
      const T = (x, y) => edge === 'bottom' ? [x, y] : edge === 'top' ? [x, Hv - y] : edge === 'left' ? [Hv - y, x] : [y, x];
      const poly = (pts, col) => {
        const out = [];
        for (let i = 0; i < pts.length; i += 2) out.push(...T(pts[i], pts[i + 1]));
        g.poly(out, col);
      };
      g.fill(inks.ground);
      const bw = Math.max(2, p.bar * u * p.scale);
      const nb = Math.ceil(Wv / bw) + 1;
      const cx = Wv * (0.5 + p.shift), cy = Hv;
      const B = p.bands;
      const pairs = [[inks.ink1, inks.ground], [inks.ink2, inks.deep], [inks.deep, inks.ground], [inks.ink1, inks.ink2], [inks.ground, inks.ink2], [inks.ink2, inks.ground]];
      // band 0 = outermost (whole sheet); then discs of shrinking radius
      const rad = [];
      for (let k = 0; k < B; k++) rad.push(Hv * (1.12 - 0.93 * (k + 1) / (B + 0.35)) * 1.0 + Hv * 0.1);
      const bands = [{ r: Infinity, pair: pairs[0], flip: 0 }];
      for (let k = 0; k < B; k++) bands.push({ r: rad[k], pair: pairs[(k + 1) % pairs.length], flip: (k + 1) & 1 });
      if (p.ring && B >= 2) {
        const at = Math.floor(B / 2) + 1, orig = bands[at], r = orig.r, th = bw * 1.5;
        if (env.spark.take(Math.PI * r * th * 0.5)) bands.splice(at, 1, { r, pair: [inks.spark, inks.deep], flip: 0 }, { r: r - th, pair: orig.pair, flip: orig.flip });
      }
      // bars of each band: pair[0]/pair[1] alternate by bar index (+flip)
      for (let b = 0; b < bands.length; b++) {
        const band = bands[b], r = band.r;
        for (let i = 0; i < nb; i++) {
          const xa = i * bw, xb = xa + bw;
          const on = ((i + band.flip) & 1) === 0;
          const col = on ? band.pair[0] : band.pair[1];
          if (r === Infinity) {
            const q = [xa - 0.3, -2, xb + 0.3, -2, xb + 0.3, Hv + 2, xa - 0.3, Hv + 2];
            poly(q, col);
            continue;
          }
          const ax = Math.max(xa, cx - r), bx = Math.min(xb, cx + r);
          if (bx <= ax) continue;
          const pts = [ax - 0.3, Hv + 2];
          const S = 4;
          for (let s = 0; s <= S; s++) {
            const x = ax + (bx - ax) * s / S, dx = x - cx;
            pts.push(x + (s === 0 ? -0.3 : s === S ? 0.3 : 0), cy - Math.sqrt(Math.max(0, r * r - dx * dx)));
          }
          pts.push(bx + 0.3, Hv + 2);
          poly(pts, col);
        }
      }
    },
  });

  /* ---------- 34. Neon spray ---------- */
  P.register({
    key: 'neonspray', name: 'Neon spray', category: 'Soft color',
    blurb: 'Vertical fluorescent streaks bleeding over soft pastel patches, with airbrushed edges and a light overspray.',
    ink: ['ground', 'ink1', 'ink2', 'spark'], vector: false, seamless: false,
    common: { grain: 0.14 },
    params: [
      { key: 'streaks', label: 'Streaks', type: 'range', min: 4, max: 20, step: 1, default: 11 },
      { key: 'pastel', label: 'Pastel patches', type: 'range', min: 0, max: 1, step: 0.05, default: 0.75 },
      { key: 'bleed', label: 'Soft edges', type: 'range', min: 0.3, max: 1.6, step: 0.05, default: 1 },
      { key: 'spray', label: 'Overspray', type: 'range', min: 0, max: 1, step: 0.05, default: 0.5 },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u, ctx = g.ctx;
      const sc = Math.max(1, Math.sqrt(W * H / 180000)), bw = Math.ceil(W / sc), bh = Math.ceil(H / sc);
      const buf = new Float32Array(bw * bh * 3);
      const gr = E.rgb(inks.ground);
      for (let i = 0; i < bw * bh; i++) { buf[i * 3] = gr[0]; buf[i * 3 + 1] = gr[1]; buf[i * 3 + 2] = gr[2]; }
      const blend = (idx, c, a) => {
        buf[idx] += (c[0] - buf[idx]) * a; buf[idx + 1] += (c[1] - buf[idx + 1]) * a; buf[idx + 2] += (c[2] - buf[idx + 2]) * a;
      };
      // pastel patches
      const tints = [E.mix(inks.ink2, inks.ground, 0.3), E.mix(inks.ink1, inks.ground, 0.28), E.mix(inks.ink1, inks.ground, 0.14), E.mix(inks.ink2, inks.ground, 0.16)].map(E.rgb);
      if (p.pastel > 0) {
        const Fp = 38 * u * p.scale / sc;
        const order = [0, 1, 3, 2];
        for (let layer = 0; layer < 3; layer++) {
          const c = tints[order[layer]], off = layer * 31.7, thr = 0.02 + (1 - p.pastel) * 0.3 + layer * 0.03;
          const fld = H1.sampler((x, y) => noise.fbm(x / Fp + off, y / (Fp * 1.5) - off * 0.4, 3), bw, bh, 4);
          for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
            const v = fld(x, y);
            const a = smoothstep(thr, thr + 0.2, v) * 0.92;
            if (a > 0.003) blend((y * bw + x) * 3, c, a);
          }
        }
      }
      // streaks
      const ns = p.streaks, bleed = p.bleed;
      const neon = [inks.ink1, inks.ink2, inks.ink1, inks.ink2, inks.ink1];
      let sparked = false;
      const xs = [];
      for (let i = 0; i < ns; i++) xs.push((i + rng.range(0.1, 0.9)) / ns * bw);
      rng.shuffle(xs);
      const streaks = [];
      for (let i = 0; i < ns; i++) {
        const hw = (rng.range(1.2, 5.2) * u * p.scale) / sc;
        const y0 = bh * rng.range(-0.1, 0.5), y1 = y0 + bh * rng.range(0.4, 1.0);
        let col = neon[i % neon.length];
        const wpx = hw * 2 * sc, hpx = (y1 - y0) * sc;
        if (!sparked && i === ns - 3 && env.spark.take(wpx * hpx * 0.55)) { col = inks.spark; sparked = true; }
        streaks.push({ xc: xs[i], hw, y0, y1, col: E.rgb(col), hex: col, op: rng.range(0.88, 1), wob: rng.range(0.1, 0.6) * hw, ph: rng.range(0, 99), e: hw * rng.range(0.14, 0.4) * bleed + 1.2 / sc });
      }
      streaks.sort((a, b) => b.hw - a.hw);
      streaks.forEach(s => {
        const reach = s.hw + s.e + s.wob * 1.2;
        const xa = Math.max(0, Math.floor(s.xc - reach)), xb = Math.min(bw - 1, Math.ceil(s.xc + reach));
        const ef = bh * 0.14 * bleed;
        for (let y = 0; y < bh; y++) {
          const vp = smoothstep(s.y0 - ef, s.y0 + ef, y) * (1 - smoothstep(s.y1 - ef, s.y1 + ef, y));
          if (vp < 0.01) continue;
          const wob = noise.fbm(y / (bh * 0.35) + s.ph, s.ph, 2) * s.wob, xc = s.xc + wob;
          for (let x = xa; x <= xb; x++) {
            const hp = 1 - smoothstep(s.hw - s.e, s.hw + s.e, Math.abs(x - xc));
            if (hp < 0.01) continue;
            const striae = 0.9 + 0.1 * noise.n2(x / (s.hw * 0.4 + 1) + s.ph, y / (bh * 0.5));
            blend((y * bw + x) * 3, s.col, hp * vp * s.op * striae);
          }
        }
      });
      // blit
      const cv = offscreen(bw, bh), cx2 = cv.getContext('2d'), id = cx2.createImageData(bw, bh), d = id.data;
      for (let i = 0; i < bw * bh; i++) { d[i * 4] = buf[i * 3]; d[i * 4 + 1] = buf[i * 3 + 1]; d[i * 4 + 2] = buf[i * 3 + 2]; d[i * 4 + 3] = 255; }
      cx2.putImageData(id, 0, 0);
      ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(cv, 0, 0, bw, bh, 0, 0, bw * sc, bh * sc); ctx.restore();
      // overspray specks beside the streak edges
      if (p.spray > 0) {
        ctx.save();
        streaks.forEach(s => {
          const n = Math.round(110 * p.spray * (s.y1 - s.y0) / bh);
          for (let k = 0; k < n; k++) {
            const side = rng.chance(0.5) ? 1 : -1, y = (s.y0 + (s.y1 - s.y0) * rng.next()) * sc;
            const x = (s.xc + side * (s.hw + Math.abs(rng.gauss()) * s.e * 1.3)) * sc;
            ctx.globalAlpha = rng.range(0.25, 0.8);
            ctx.fillStyle = s.hex;
            ctx.beginPath(); ctx.arc(x, y, Math.max(0.6, u * rng.range(0.05, 0.16)), 0, TAU); ctx.fill();
          }
        });
        ctx.restore();
      }
    },
  });
})(window);
