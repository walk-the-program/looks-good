/* patterns/families/organic2.js — round 2 organic & cellular families:
   colony, tissue, seafan, pebbles, marble, thermalstreak, waves. Original code. */
(function (global) {
  'use strict';
  const P = global.Patterns, E = P.E, R = E.r2;
  const SEL = E.sel;
  const TAU = Math.PI * 2;
  const mix = E.mix, clamp = E.clamp, smoothstep = E.smoothstep;

  // darkest of two colours (used for "dark ground" families)
  const darker = (a, b) => (E.lum(a) <= E.lum(b) ? a : b);
  // a colour that reads against bg (falls back to `alt`)
  const against = (c, bg, alt, min) => (E.contrast(c, bg) >= (min || 2.2) ? c : alt);

  /* ---------- 17. Cell colony ---------- */
  P.register({
    key: 'colony', name: 'Cell colony', category: 'Organic & cellular',
    blurb: 'Soft metaball cells that fuse where they touch, each banded into concentric rings of the inks, finished with film grain or fine stipple.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: false, seamless: false,
    common: { grain: 0.3 },
    params: [
      { key: 'cells', label: 'Cells', type: 'range', min: 8, max: 70, step: 1, default: 34 },
      { key: 'rings', label: 'Rings', type: 'range', min: 2, max: 6, step: 1, default: 4 },
      { key: 'fuse', label: 'Fusion', type: 'range', min: 0.7, max: 1.7, step: 0.05, default: 1.15 },
      { key: 'finish', label: 'Finish', type: 'select', options: SEL(['film', 'stipple']), default: 'film' },
      { key: 'nuclei', label: 'Nuclei', type: 'toggle', default: true },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u * p.scale;
      g.fill(inks.ground);
      const stip = p.finish === 'stipple';
      const ps = stip ? Math.max(1.5, 0.3 * u) : 1.5;
      const B = R.buf(W, H, Math.min(520000, W * H / (ps * ps)));
      const { lw, lh, sc, d32 } = B;
      const n = p.cells;
      const rMean = Math.sqrt(W * H * 0.5 / (n * Math.PI));
      // best-candidate placement keeps cells evenly spread but allows touching
      const cells = [];
      for (let i = 0; i < n; i++) {
        const r = rMean * rng.range(0.55, 1.5);
        let best = null, bs = -1e18;
        for (let k = 0; k < 9; k++) {
          const x = rng.range(-0.04, 1.04) * W, y = rng.range(-0.04, 1.04) * H;
          let s = 1e9;
          for (const c of cells) s = Math.min(s, Math.hypot(c.x - x, c.y - y) - (c.r + r) * 0.8);
          if (s > bs) { bs = s; best = { x, y, r }; }
        }
        best.scheme = rng.weighted([0, 1, 2], [0.42, 0.38, 0.2]);
        best.ox = rng.range(-0.25, 0.25); best.oy = rng.range(-0.25, 0.25);
        cells.push(best);
      }
      // compact-support metaball field + id of the strongest contributor
      const F = new Float32Array(lw * lh), best = new Float32Array(lw * lh), ids = new Uint8Array(lw * lh);
      cells.forEach((c, id) => {
        const R0 = c.r * p.fuse * 1.75 / sc, cx = c.x / sc, cy = c.y / sc;
        const x0 = Math.max(0, Math.floor(cx - R0)), x1 = Math.min(lw - 1, Math.ceil(cx + R0));
        const y0 = Math.max(0, Math.floor(cy - R0)), y1 = Math.min(lh - 1, Math.ceil(cy + R0));
        const ir2 = 1 / (R0 * R0);
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
          const dx = x - cx, dy = y - cy, q = 1 - (dx * dx + dy * dy) * ir2;
          if (q <= 0) continue;
          const w = q * q * q, k = y * lw + x;
          F[k] += w;
          if (w > best[k]) { best[k] = w; ids[k] = id; }
        }
      });
      const T = 0.2, TOP = 1.05, L = p.rings;
      const g1 = inks.ink1, g2 = inks.ink2, dp = inks.deep;
      const schemes = [[g1, g2, dp], [g2, g1, dp], [dp, g1, g2]].map(([a, b, c]) => {
        const arr = [];
        for (let k = 0; k < L; k++) {
          if (k === 0) arr.push(R.pack(a));
          else if (k === L - 1) arr.push(R.pack(c));
          else arr.push(R.pack(k % 2 ? mix(a, inks.ground, 0.4) : b));
        }
        return arr;
      });
      const bg = R.pack(inks.ground), wall = R.pack(inks.deep);
      for (let y = 0; y < lh; y++) for (let x = 0; x < lw; x++) {
        const k = y * lw + x, f = F[k];
        if (f < T) { d32[k] = f > T - 0.03 ? wall : bg; continue; }
        let lv = (f - T) / (TOP - T) * L;
        if (stip) lv += (E.bayer8.at(x, y) - 0.5) * 1.15;
        let b = Math.floor(lv); if (b < 0) b = 0; else if (b > L - 1) b = L - 1;
        d32[k] = schemes[cells[ids[k]].scheme][b];
      }
      B.put(g, !stip);
      const ctx = g.ctx;
      if (p.nuclei) {
        cells.forEach((c) => {
          const nx = c.x + c.ox * c.r, ny = c.y + c.oy * c.r, nr = c.r * 0.14;
          const isSpark = rng.next() < 0.1 && env.spark.take(Math.PI * nr * nr);
          ctx.fillStyle = isSpark ? inks.spark : inks.ground;
          ctx.beginPath(); ctx.arc(nx, ny, nr * 1.5, 0, TAU); ctx.fill();
          ctx.fillStyle = isSpark ? inks.deep : inks.deep;
          ctx.beginPath(); ctx.arc(nx, ny, nr * 0.8, 0, TAU); ctx.fill();
        });
      }
    },
  });

  /* ---------- 18. Cell tissue ---------- */
  P.register({
    key: 'tissue', name: 'Cell tissue', category: 'Organic & cellular',
    blurb: 'Loose Voronoi cells, each filled with dithered colour bands from the wall to the core and crossed by thin branching veins.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: false, seamless: false,
    common: { grain: 0.25 },
    params: [
      { key: 'cell', label: 'Cell size', type: 'range', min: 5, max: 20, step: 0.5, default: 10.5 },
      { key: 'loose', label: 'Looseness', type: 'range', min: 0.2, max: 1, step: 0.05, default: 0.8 },
      { key: 'levels', label: 'Bands', type: 'range', min: 3, max: 6, step: 1, default: 4 },
      { key: 'veins', label: 'Veins', type: 'range', min: 0, max: 1, step: 0.05, default: 0.55 },
      { key: 'wall', label: 'Wall', type: 'range', min: 0.2, max: 1.6, step: 0.05, default: 0.7 },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u * p.scale;
      g.fill(inks.ground);
      const ps = Math.max(1.5, 0.27 * u);
      const B = R.buf(W, H, Math.min(520000, W * H / (ps * ps)));
      const { lw, lh, sc, d32 } = B;
      const cs = p.cell * u;                       // px per grid cell
      const gw = Math.ceil(W / cs) + 3, gh = Math.ceil(H / cs) + 3;
      const sx = new Float32Array(gw * gh), sy = new Float32Array(gw * gh), pal = new Uint8Array(gw * gh);
      const seedH = E.hashSeed(env.seed + ':tissue') | 0;
      for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
        const k = j * gw + i, jit = p.loose * 0.46;
        sx[k] = (i - 1 + 0.5 + (E.ihash(i, j, seedH) - 0.5) * 2 * jit) * cs;
        sy[k] = (j - 1 + 0.5 + (E.ihash(i, j, seedH + 7) - 0.5) * 2 * jit) * cs;
        { const h = E.ihash(i, j, seedH + 13); pal[k] = h < 0.26 ? 0 : h < 0.5 ? 1 : h < 0.68 ? 2 : h < 0.86 ? 3 : 4; }
      }
      const L = p.levels;
      const half = (a) => mix(a, inks.ground, 0.5);
      const defs = [
        [inks.deep, inks.ink1, half(inks.ink1), inks.ground],
        [inks.deep, inks.ink2, half(inks.ink2), inks.ground],
        [inks.ink1, mix(inks.ink1, inks.ink2, 0.5), inks.ink2, half(inks.ink2)],
        [inks.ink2, inks.ink1, half(inks.ink1), inks.ground],
        [inks.ink2, mix(inks.ink2, inks.ground, 0.6), inks.ground, inks.ground],
      ];
      // resample each palette to L steps
      const pals = defs.map(d => R.lut(d, L));
      const wallC = R.pack(inks.deep);
      const wallW = 0.1 * u * p.wall / sc * 1.4;
      const core = cs * 0.5;
      for (let y = 0; y < lh; y++) {
        const Y = (y + 0.5) * sc, cj = Math.floor(Y / cs) + 1;
        for (let x = 0; x < lw; x++) {
          const X = (x + 0.5) * sc, ci = Math.floor(X / cs) + 1;
          let d1 = 1e18, d2 = 1e18, id = 0;
          for (let j = cj - 1; j <= cj + 1; j++) for (let i = ci - 1; i <= ci + 1; i++) {
            const k = j * gw + i, dx = sx[k] - X, dy = sy[k] - Y, dd = dx * dx + dy * dy;
            if (dd < d1) { d2 = d1; d1 = dd; id = k; } else if (dd < d2) d2 = dd;
          }
          const e = (Math.sqrt(d2) - Math.sqrt(d1)) * 0.5 / sc;        // distance to wall, internal px
          if (e < wallW) { d32[y * lw + x] = wallC; continue; }
          const depth = clamp((e - wallW) * sc / (core * 0.95), 0, 1);
          let lv = Math.pow(depth, 0.75) * (L - 1) + (E.bayer8.at(x, y) - 0.5) * 1.1;
          let b = Math.round(lv); if (b < 0) b = 0; else if (b > L - 1) b = L - 1;
          d32[y * lw + x] = pals[pal[id]][b];
        }
      }
      B.put(g, false);
      // veins: branching strokes
      if (p.veins > 0.01) {
        const vr = rng.fork('veins');
        const roots = Math.round(3 + 9 * p.veins);
        const lwid = Math.max(1, 0.2 * u);
        const grow = (x, y, a, len, w, depth) => {
          const pts = [x, y];
          const steps = Math.max(3, Math.round(len / (1.1 * u)));
          let ang = a;
          for (let s = 0; s < steps; s++) {
            ang += vr.range(-0.32, 0.32);
            x += Math.cos(ang) * 1.1 * u; y += Math.sin(ang) * 1.1 * u;
            pts.push(x, y);
            if (depth < 3 && s > 1 && vr.next() < 0.13) grow(x, y, ang + vr.pick([-1, 1]) * vr.range(0.5, 1.0), len * 0.6, w * 0.7, depth + 1);
          }
          g.polyline(pts, inks.deep, Math.max(1.6, w * 1.5), 1, 'round');
          g.polyline(pts, inks.ground, Math.max(0.8, w * 0.62), 1, 'round');
        };
        for (let i = 0; i < roots; i++) grow(vr.range(0, W), vr.range(0, H), vr.range(0, TAU), vr.range(14, 30) * u, lwid * 2.1, 0);
      }
      // spark: a few small nuclei
      for (let i = 0; i < 6; i++) {
        const r = 0.7 * u, x = rng.range(0.05, 0.95) * W, y = rng.range(0.05, 0.95) * H;
        if (env.spark.take(Math.PI * r * r)) { g.circle(x, y, r, inks.spark); g.circle(x, y, r * 0.45, inks.deep); }
      }
    },
  });

  /* ---------- 19. Sea fan ---------- */
  P.register({
    key: 'seafan', name: 'Sea fan', category: 'Organic & cellular',
    blurb: 'Ribbed, forking coral growing across a dark ground, with torn-paper lobes behind it and a halftone dot screen over the top.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: true, seamless: false,
    common: { grain: 0.35 },
    params: [
      { key: 'fans', label: 'Fans', type: 'range', min: 1, max: 4, step: 1, default: 2 },
      { key: 'branch', label: 'Branching', type: 'range', min: 0.4, max: 1.6, step: 0.05, default: 1 },
      { key: 'ribs', label: 'Ribs', type: 'toggle', default: true },
      { key: 'screen', label: 'Dot screen', type: 'range', min: 0, max: 1, step: 0.05, default: 0.7 },
      { key: 'lobes', label: 'Paper lobes', type: 'range', min: 0, max: 6, step: 1, default: 4 },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u * p.scale;
      const bg = darker(inks.ground, inks.deep);
      const light = bg === inks.ground ? inks.deep : inks.ground;
      const c1 = against(inks.ink1, bg, light), c2 = against(inks.ink2, bg, mix(light, bg, 0.7), 2);
      g.fill(bg);
      // torn lobes
      for (let i = 0; i < p.lobes; i++) {
        const cx = rng.range(0.05, 0.95) * W, cy = rng.range(0.1, 0.9) * H, r = rng.range(14, 30) * u;
        const col = mix(i % 2 ? c2 : c1, bg, 0.34);
        const ring = R.blob(noise, cx, cy, r * rng.range(0.8, 1.2), r * rng.range(0.55, 0.95), 0.55, 90, rng.range(0, 50));
        g.poly(ring, col);
        // inner torn edge in a slightly lighter tone
        g.poly(R.blob(noise, cx + u, cy - u * 0.6, r * 0.8, r * 0.6, 0.5, 80, rng.range(0, 50)), mix(col, bg, 0.7));
      }
      const gr = rng.fork('coral');
      const strokes = [];       // {pts, w, col}
      const tips = [];
      const step = 1.0 * u;
      const grow = (x, y, a, len, w, depth, col) => {
        const pts = [x, y];
        let ang = a, ww = w;
        const steps = Math.max(2, Math.round(len / step));
        for (let s = 0; s < steps; s++) {
          ang += gr.range(-0.12, 0.12) * (1 + depth * 0.3) + (-Math.PI / 2 - ang) * 0.035;
          x += Math.cos(ang) * step; y += Math.sin(ang) * step;
          pts.push(x, y);
          ww = Math.max(0.35 * u, ww * 0.982);
          if (depth < 6 && s > 3 && s < steps - 2 && gr.next() < (0.085 * p.branch) / (1 + depth * 0.35)) {
            const side = gr.pick([-1, 1]);
            grow(x, y, ang + side * gr.range(0.4, 0.8), len * gr.range(0.45, 0.7), ww * 0.78, depth + 1, col);
          }
        }
        strokes.push({ pts, w, w1: ww, col });
        tips.push(x, y);
      };
      for (let f = 0; f < p.fans; f++) {
        const fx = (f + 0.5 + rng.range(-0.18, 0.18)) / p.fans * W;
        const n = Math.round(rng.range(4, 6));
        for (let i = 0; i < n; i++) {
          const a = -Math.PI / 2 + (i / (n - 1) - 0.5) * 1.5 + rng.range(-0.1, 0.1);
          grow(fx + (i / (n - 1) - 0.5) * 4 * u, H + 2 * u, a, rng.range(34, 52) * u, rng.range(1.8, 2.5) * u, 0, (i + f) % 3 === 0 ? c2 : c1);
        }
      }
      // draw thick -> thin, with width tapering in chunks
      strokes.sort((a, b) => b.w - a.w);
      const ribGap = bg;
      let ribCount = 0;
      strokes.forEach(s => {
        const m = s.pts.length / 2;
        const chunk = 5;
        for (let i = 0; i < m - 1; i += chunk) {
          const seg = s.pts.slice(i * 2, Math.min(m, i + chunk + 1) * 2);
          const t = i / m, w = s.w + (s.w1 - s.w) * t;
          g.polyline(seg, s.col, w, 1, 'round');
        }
        if (p.ribs && s.w > 0.7 * u) {
          for (let i = 3; i < m - 2; i += 2) {
            const t = i / m, w = s.w + (s.w1 - s.w) * t;
            const x = s.pts[i * 2], y = s.pts[i * 2 + 1];
            const dx = s.pts[i * 2 + 2] - s.pts[i * 2 - 2], dy = s.pts[i * 2 + 3] - s.pts[i * 2 - 1];
            const l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
            g.line(x - nx * w * 0.5, y - ny * w * 0.5, x + nx * w * 0.5, y + ny * w * 0.5, ribGap, Math.max(0.6, w * 0.16), 'butt');
            ribCount++;
          }
        }
      });
      // spark beads on a few tips
      for (let i = 0; i < tips.length; i += 2) {
        if (gr.next() < 0.06) { const r = 0.55 * u; if (env.spark.take(Math.PI * r * r)) g.circle(tips[i], tips[i + 1], r, inks.spark); }
      }
      // halftone dot screen: bg-coloured dots eat the coral, bigger toward the lower-left
      if (p.screen > 0.02) {
        const pitch = 1.5 * u, rowH = pitch * 0.866;
        const cx = W * 0.5, cy = H * 0.45, dmax = Math.hypot(W, H) * 0.5;
        for (let j = -1, y = 0; y < H + pitch; j++, y += rowH) {
          for (let x = (j & 1) * pitch * 0.5; x < W + pitch; x += pitch) {
            const t = clamp(Math.hypot(x - cx, (y - cy) * 1.3) / dmax, 0, 1);
            const r = pitch * 0.5 * p.screen * smoothstep(0.35, 1.05, t) * 1.15;
            if (r > 0.5) g.circle(x, y, r, bg);
          }
        }
      }
    },
  });

  /* ---------- 20. Pebble field ---------- */
  P.register({
    key: 'pebbles', name: 'Pebble field', category: 'Organic & cellular',
    blurb: 'Irregular pebble silhouettes scattered over the ground, each fill eaten away from the rim inward by crumbled edges or a fading halftone.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: false, seamless: false,
    common: { grain: 0.25 },
    params: [
      { key: 'size', label: 'Pebble size', type: 'range', min: 0.6, max: 1.8, step: 0.05, default: 1 },
      { key: 'gap', label: 'Gap', type: 'range', min: 0.1, max: 2.5, step: 0.05, default: 0.35 },
      { key: 'erode', label: 'Rim erosion', type: 'range', min: 0.1, max: 0.9, step: 0.05, default: 0.45 },
      { key: 'mode', label: 'Rim', type: 'select', options: SEL(['crumble', 'halftone', 'mixed']), default: 'mixed' },
      { key: 'lit', label: 'Lit side', type: 'range', min: 0, max: 1, step: 0.05, default: 0.6 },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u * p.scale;
      const B = R.buf(W, H, 560000);
      const { lw, lh, sc, d32 } = B;
      d32.fill(R.pack(inks.ground));
      // pack pebbles: big first
      const rs = [];
      const base = 6.4 * u * p.size;
      const count = Math.round(W * H / (base * base) * 0.5);
      for (let i = 0; i < count; i++) rs.push(base * Math.exp(rng.gauss() * 0.36) * 0.9);
      rs.sort((a, b) => b - a);
      const cs = base * 1.4, gw = Math.ceil(W / cs) + 1, gh = Math.ceil(H / cs) + 1;
      const grid = new Array(gw * gh);
      const placed = [];
      const gap = p.gap * u;
      rs.forEach((r, idx) => {
        for (let t = 0; t < 40; t++) {
          const x = rng.range(0, W), y = rng.range(0, H);
          const ci = (x / cs) | 0, cj = (y / cs) | 0;
          let ok = true;
          for (let j = Math.max(0, cj - 2); j <= Math.min(gh - 1, cj + 2) && ok; j++) for (let i = Math.max(0, ci - 2); i <= Math.min(gw - 1, ci + 2) && ok; i++) {
            const cell = grid[j * gw + i]; if (!cell) continue;
            for (const q of cell) if (Math.hypot(q.x - x, q.y - y) < (q.r + r) * 1.12 + gap) { ok = false; break; }
          }
          if (!ok) continue;
          const pb = { x, y, r };
          (grid[cj * gw + ci] || (grid[cj * gw + ci] = [])).push(pb);
          placed.push(pb);
          return;
        }
      });
      const N = 72;
      // under the brand colourway every pebble is one of the client's own inks: the
      // ink1/ink2 midpoint (a sage or mud no one chose) is only used by the derived colourways
      const cols = (inks.colorway || 'brand') === 'brand'
        ? [inks.ink1, inks.ink2, inks.deep, inks.ink1, inks.ink2]
        : [inks.ink1, inks.ink2, inks.deep, mix(inks.ink1, inks.ink2, 0.5), inks.ink1, inks.ink2];
      const modeFor = () => (p.mode === 'mixed' ? (rng.next() < 0.5 ? 0 : 1) : p.mode === 'halftone' ? 1 : 0);
      const lx = -0.62, ly = -0.78;
      const hp = Math.max(1.6, 0.78 * u) / sc;      // halftone pitch (internal px)
      placed.forEach((pb, idx) => {
        const a2 = rng.range(0.04, 0.2), a3 = rng.range(0.02, 0.12), a4 = rng.range(0.01, 0.06);
        const f2 = rng.range(0, TAU), f3 = rng.range(0, TAU), f4 = rng.range(0, TAU), el = rng.range(0, Math.PI);
        const tab = new Float32Array(N + 1);
        for (let i = 0; i <= N; i++) {
          const a = i / N * TAU;
          tab[i] = pb.r * (1 + a2 * Math.cos(2 * (a - el)) + a3 * Math.cos(3 * a + f3) + a4 * Math.cos(4 * a + f4)) * 0.97;
        }
        const col = cols[idx % cols.length];
        const spark = idx % 23 === 11 && env.spark.take(Math.PI * pb.r * pb.r * 0.5);
        const base = spark ? inks.spark : col;
        const litC = R.pack(mix(base, inks.ground, 0.5)), baseC = R.pack(base), shC = R.pack(mix(base, inks.deep, 0.7));
        const mode = modeFor();
        const rim = p.erode * (0.75 + 0.5 * rng.next());
        const cx = pb.x / sc, cy = pb.y / sc, rm = pb.r * 1.3 / sc, so = rng.range(0, 99);
        const hang = rng.range(0, 1.2);
        const ch = Math.cos(hang), sh = Math.sin(hang);
        const x0 = Math.max(0, Math.floor(cx - rm)), x1 = Math.min(lw - 1, Math.ceil(cx + rm));
        const y0 = Math.max(0, Math.floor(cy - rm)), y1 = Math.min(lh - 1, Math.ceil(cy + rm));
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
          const dx = x + 0.5 - cx, dy = y + 0.5 - cy, rho = Math.hypot(dx, dy) * sc;
          let a = Math.atan2(dy, dx); if (a < 0) a += TAU;
          const fi = a / TAU * N, i0 = fi | 0, rr = tab[i0] + (tab[i0 + 1] - tab[i0]) * (fi - i0);
          const dd = rho / rr; if (dd >= 1) continue;
          const edge = 1 - dd;                                  // 0 at the rim, 1 at the core
          let on;
          if (mode === 0) {
            const n = 0.5 + 0.5 * (noise.n2((x + so) * 0.55, y * 0.55) * 0.6 + noise.n2((x + so) * 1.7, y * 1.7) * 0.4);
            on = edge > rim * 0.9 * (0.04 + 0.96 * n * n) - 0.004;
          } else {
            const gx = (dx * ch + dy * sh) / hp, gy = (-dx * sh + dy * ch) / hp;
            const fx = gx - Math.round(gx), fy = gy - Math.round(gy);
            const rad = 0.62 * smoothstep(0.0, rim * 1.5 + 0.05, edge);
            on = Math.hypot(fx, fy) < rad;
          }
          if (!on) continue;
          const q = ((dx * lx + dy * ly) * sc / rr) * p.lit, bz = E.bayer8.at(x, y) - 0.5;
          d32[y * lw + x] = q > 0.28 + bz * 0.5 ? litC : q < -0.4 + bz * 0.5 ? shC : baseC;
        }
      });
      B.put(g, false);
    },
  });

  /* ---------- 21. Cut marbling ---------- */
  P.register({
    key: 'marble', name: 'Cut marbling', category: 'Organic & cellular',
    blurb: 'Poured-paint marbling cut into flat, hard-edged shapes (posterised contours) over a sparse ground of stars and dots.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: false, seamless: false,
    common: { grain: 0.2 },
    params: [
      { key: 'bands', label: 'Bands', type: 'range', min: 3, max: 10, step: 1, default: 4 },
      { key: 'warp', label: 'Pour', type: 'range', min: 0.3, max: 3, step: 0.05, default: 0.9 },
      { key: 'cover', label: 'Coverage', type: 'range', min: 0.3, max: 0.95, step: 0.05, default: 0.6 },
      { key: 'stars', label: 'Stars', type: 'range', min: 0, max: 1, step: 0.05, default: 0.6 },
      { key: 'outline', label: 'Outline', type: 'toggle', default: true },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u * p.scale;
      g.fill(inks.ground);
      const feat = 100 * u;
      const ox = rng.range(0, 40), oy = rng.range(0, 40);
      const fn = (x, y) => {
        const X = x / feat + ox, Y = y / feat + oy;
        const qx = noise.fbm(X, Y, 2, 2, 0.45), qy = noise.fbm(X + 5.2, Y + 1.3, 2, 2, 0.45);
        const rx = noise.fbm(X * 1.3 + p.warp * 1.1 * qx + 1.7, Y * 1.3 + p.warp * 1.1 * qy + 9.2, 2, 2, 0.4);
        const v = noise.fbm(X + p.warp * 0.9 * rx + 2.0 * qx, Y + p.warp * 0.9 * qy + 1.2 * rx, 2, 2, 0.4);
        return v;
      };
      const step = Math.max(3, 0.7 * u);
      const grid = R.grid(W, H, step, fn);
      // percentile normalisation of the field
      const vs = Array.from(grid.d).sort((a, b) => a - b);
      const lo = vs[Math.floor(vs.length * 0.03)], hi = vs[Math.floor(vs.length * 0.97)], span = Math.max(1e-6, hi - lo);
      const B = R.buf(W, H, 620000);
      const { lw, lh, sc, d32 } = B;
      const L = p.bands;
      const cycle = [inks.ink1, inks.deep, inks.ink2, inks.ground, inks.ink1, inks.ink2, inks.deep];
      const cols = [];
      for (let k = 0; k < L; k++) {
        let c = cycle[k % cycle.length];
        if (k > 0 && c === cols[k - 1]) c = inks.ink2;
        cols.push(R.pack(k === L - 1 && L > 4 ? inks.t2 : c));
      }
      const empty = R.pack(inks.ground), line = R.pack(inks.deep);
      const cut = 1 - p.cover;               // below this the ground shows through
      const prevRow = new Int16Array(lw).fill(-2);
      let sparkPx = 0;
      const sparkMax = W * H * 0.02 * env.sparkK / (sc * sc);
      const sparkC = R.pack(inks.spark);
      const maskAt = new Uint8Array(lw * lh);
      for (let y = 0; y < lh; y++) {
        let prev = -2;
        for (let x = 0; x < lw; x++) {
          let v = (grid.at((x + 0.5) * sc, (y + 0.5) * sc) - lo) / span; v = v < 0 ? 0 : v > 1 ? 1 : v;
          let band;
          if (v < cut) band = -1; else band = Math.min(L - 1, Math.floor((v - cut) / (1 - cut) * L));
          const k = y * lw + x;
          let c = band < 0 ? empty : cols[band];
          if (band === L - 1 && sparkPx < sparkMax && v > 0.985) { c = sparkC; sparkPx++; }
          if (p.outline && ((x > 0 && band !== prev) || (y > 0 && band !== prevRow[x])) && (band >= 0 || prev >= 0 || prevRow[x] >= 0)) c = line;
          d32[k] = c; maskAt[k] = band < 0 ? 0 : 1;
          prev = band; prevRow[x] = band;
        }
      }
      B.put(g, true);
      // starry ground: dots and 4-point sparkles only where the ground shows
      if (p.stars > 0.01) {
        const sr = rng.fork('stars');
        const n = Math.round(W * H / (u * u) * 0.12 * p.stars);
        const dotC = inks.deep;
        for (let i = 0; i < n; i++) {
          const x = sr.range(0, W), y = sr.range(0, H);
          const mi = Math.min(lh - 1, (y / sc) | 0) * lw + Math.min(lw - 1, (x / sc) | 0);
          if (maskAt[mi]) continue;
          const kind = sr.next();
          if (kind < 0.7) g.circle(x, y, sr.range(0.18, 0.4) * u, dotC);
          else {
            const r = sr.range(0.8, 1.7) * u, lwid = Math.max(1, 0.16 * u);
            g.line(x - r, y, x + r, y, dotC, lwid, 'butt'); g.line(x, y - r, x, y + r, dotC, lwid, 'butt');
            if (kind > 0.9) { const q = r * 0.55; g.line(x - q, y - q, x + q, y + q, dotC, lwid * 0.8, 'butt'); g.line(x - q, y + q, x + q, y - q, dotC, lwid * 0.8, 'butt'); }
          }
        }
      }
    },
  });

  /* ---------- 22. Heat smear ---------- */
  P.register({
    key: 'thermalstreak', name: 'Heat smear', category: 'Organic & cellular',
    blurb: 'A heat field cut into hard bands, dragged sideways into long horizontal streaks, with a few torn bands slid out of line.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: false, seamless: false,
    common: { grain: 0.3 },
    params: [
      { key: 'bands', label: 'Heat bands', type: 'range', min: 3, max: 9, step: 1, default: 6 },
      { key: 'smear', label: 'Smear length', type: 'range', min: 3, max: 30, step: 0.5, default: 14 },
      { key: 'slides', label: 'Torn slides', type: 'range', min: 0, max: 6, step: 1, default: 3 },
      { key: 'rough', label: 'Streak ragged', type: 'range', min: 0, max: 1, step: 0.05, default: 0.4 },
      { key: 'flip', label: 'Hot side', type: 'select', options: SEL(['bright', 'dark']), default: 'bright' },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u * p.scale;
      const ox = rng.range(0, 30), oy = rng.range(0, 30);
      const fy = 26 * u, fx = fy * p.smear * 0.5;
      const fn = (x, y) => {
        const yy = y / fy + oy, xx = x / fx + ox;
        const w = noise.fbm(xx * 0.5 + 3.1, yy * 0.6, 2) * 0.9;
        return noise.fbm(xx + w, yy + noise.fbm(xx * 0.35 + 7.7, yy * 0.4, 2) * 0.8, 3);
      };
      const step = Math.max(4, 1.1 * u);
      const grid = R.grid(W, H, step, fn);
      const vs = Array.from(grid.d).sort((a, b) => a - b);
      const lo = vs[Math.floor(vs.length * 0.03)], hi = vs[Math.floor(vs.length * 0.995)], span = Math.max(1e-6, hi - lo);
      // slide bands
      const slides = [];
      for (let i = 0; i < p.slides; i++) {
        const h = rng.range(0.03, 0.1) * H, y0 = rng.range(0.05, 0.95) * H - h / 2;
        slides.push({ y0, y1: y0 + h, off: rng.range(0.1, 0.3) * W * (rng.next() < 0.5 ? -1 : 1), s: rng.range(0, 99) });
      }
      const B = R.buf(W, H, 700000);
      const { lw, lh, sc, d32 } = B;
      const L = p.bands;
      const stops = p.flip === 'bright' ? [inks.deep, inks.ink1, inks.ink2, inks.ground] : [inks.ground, inks.ink2, inks.ink1, inks.deep];
      const lut = R.lut(stops, L);
      const sparkC = R.pack(inks.spark);
      const sparkCut = 1 - 0.012 * env.sparkK;
      const seed = E.hashSeed(env.seed + ':ts') | 0;
      const jag = (x, s) => (E.ihash((x / (1.2 * u)) | 0, 5, seed + s) - 0.5) * 0.7 * u + noise.n2(x / (8 * u) + s, s) * 1.4 * u;
      const rgh = p.rough;
      slides.forEach(sl => {
        sl.jt = new Float32Array(lw); sl.jb = new Float32Array(lw);
        for (let x = 0; x < lw; x++) { const X = (x + 0.5) * sc; sl.jt[x] = sl.y0 + jag(X, sl.s); sl.jb[x] = sl.y1 + jag(X + 99, sl.s + 3); }
      });
      for (let y = 0; y < lh; y++) {
        const Y = (y + 0.5) * sc;
        const rowId = Math.floor(Y / (0.55 * u));
        const rj = (E.ihash(rowId, 11, seed) - 0.5) * fx * 0.9 * rgh;
        const rv = (E.ihash(rowId, 17, seed) - 0.5) * 0.045 * rgh;
        for (let x = 0; x < lw; x++) {
          const X = (x + 0.5) * sc;
          let sx = X + rj;
          for (let s = 0; s < slides.length; s++) {
            const sl = slides[s];
            if (Y > sl.jt[x] && Y < sl.jb[x]) { sx -= sl.off; }
          }
          let v = (grid.at(sx < 0 ? 0 : sx, Y) - lo) / span + rv; v = v < 0 ? 0 : v > 1 ? 1 : v;
          const b = Math.min(L - 1, Math.floor(v * L));
          d32[y * lw + x] = (v > sparkCut && b === L - 1 && p.flip === 'bright') ? sparkC : lut[b];
        }
      }
      B.put(g, true);
    },
  });

  /* ---------- 23. Solarised waves ---------- */
  P.register({
    key: 'waves', name: 'Solarised waves', category: 'Organic & cellular',
    blurb: 'Rows of skewed, curling waves combed into fine strands, tinted along a false-colour ramp of the inks and dotted with oil-drop rings.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: true, seamless: false,
    common: { grain: 0.18 },
    params: [
      { key: 'rows', label: 'Rows', type: 'range', min: 3, max: 10, step: 1, default: 6 },
      { key: 'crests', label: 'Crests per row', type: 'range', min: 1.5, max: 6, step: 0.25, default: 3 },
      { key: 'curl', label: 'Curl', type: 'range', min: 0.6, max: 3, step: 0.05, default: 1.9 },
      { key: 'strands', label: 'Strands', type: 'range', min: 4, max: 18, step: 1, default: 10 },
      { key: 'drops', label: 'Oil drops', type: 'range', min: 0, max: 8, step: 1, default: 4 },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u * p.scale;
      g.fill(inks.ground);
      const rows = p.rows, S = p.strands;
      const rowH = H / (rows - 0.3);
      const stops = [inks.deep, inks.ink1, inks.ink2, mix(inks.ink2, inks.ground, 0.5)];
      const lutC = (t) => {
        const f = clamp(t, 0, 1) * (stops.length - 1), k = Math.min(stops.length - 2, Math.floor(f));
        return mix(stops[k + 1], stops[k], clamp(f - k, 0, 1));
      };
      const lam = W / p.crests;                 // wavelength
      const PPW = 48;                           // points per wave
      const lwid = Math.max(1, rowH * 0.62 / S * 0.62);
      const drops = [];
      for (let r = 0; r < rows; r++) {
        const y0 = rowH * (r + 0.55) - rowH * 0.1;
        const A = rowH * 0.62;
        const nW = p.crests + 2.5;
        const total = Math.round(nW * PPW);
        const ph0 = rng.range(0, TAU), x0 = -lam * 1.2 + rng.range(0, lam * 0.3);
        const skew = rng.range(0.25, 0.6) * (r % 2 ? -1 : 1) * 0.5 + 0.35;
        // base curve
        const make = (lag) => {
          const pts = [], hts = [];
          for (let i = 0; i <= total; i++) {
            const t = i / PPW * TAU + ph0 - lag;
            const xm = x0 + i / PPW * lam;
            const loc = 0.72 + 0.38 * noise.n2(xm / (lam * 1.6) + r * 3.1, r * 0.7);
            const k = p.curl * (0.9 + 0.2 * noise.n2(xm / (lam * 2) + 9, r));
            const X = x0 + (t - ph0 + lag - k * Math.sin(t) * 1.0 + skew * Math.sin(2 * t) * 0.18) * lam / TAU + (-k * 0) ;
            const c = Math.cos(t) + 0.28 * Math.sin(2 * t + 1);
            pts.push(X + (0) , y0 - A * loc * c);
            hts.push(c);
          }
          return { pts, hts };
        };
        // fill below the base crest to hide earlier rows
        const base = make(0);
        const fill = base.pts.slice();
        fill.push(base.pts[base.pts.length - 2], H + 4 * u, base.pts[0], H + 4 * u);
        g.poly(fill, inks.ground);
        const gap = rowH * 0.62 / S * 1.05;
        for (let s = 0; s < S; s++) {
          const lag = s * 0.02 * (1 + 0.5 * Math.sin(s * 0.7 + r));
          const cur = make(lag);
          const pts = cur.pts, hts = cur.hts;
          const yo = s * gap;
          const chunk = 8;
          for (let i = 0; i < pts.length / 2 - 1; i += chunk - 1) {
            const e = Math.min(pts.length / 2, i + chunk);
            const seg = [];
            let hs = 0;
            for (let q = i; q < e; q++) { seg.push(pts[q * 2], pts[q * 2 + 1] + yo); hs += hts[q]; }
            hs /= (e - i);
            const tt = 0.5 - 0.5 * hs * 0.9 + (s / S) * 0.28 + r / rows * 0.25;
            const cyc = ((tt * 1.4) % 2 + 2) % 2; g.polyline(seg, lutC(cyc > 1 ? 2 - cyc : cyc), lwid, 1, 'butt');
          }
        }
        if (p.drops > 0 && r % 2 === 0) drops.push(y0);
      }
      // oil-drop rings
      const dr = rng.fork('drops');
      for (let i = 0; i < p.drops; i++) {
        const x = dr.range(0.08, 0.92) * W, y = dr.range(0.1, 0.9) * H, r0 = dr.range(0.9, 1.9) * u;
        const useSpark = i === 0 && env.spark.take(Math.PI * (r0 * 3.6) * (r0 * 3.6) * 0.25);
        const n = dr.int(3, 5);
        g.circle(x, y, r0 * (1 + n * 0.55) + lwid, inks.ground);
        for (let k = 0; k < n; k++) g.ring(x, y, r0 * (1 + k * 0.55), Math.max(1, 0.2 * u), k % 2 ? inks.deep : (useSpark ? inks.spark : inks.ink1));
        g.circle(x, y, r0 * 0.4, useSpark ? inks.spark : inks.deep);
      }
    },
  });
})(window);
