/* patterns/families/stripe.js — stripe and band families:
   zigzag, weave, oprings, counterchange, chevron, arcrise. */
(function (global) {
  'use strict';
  const P = global.Patterns, E = P.E;
  const SEL = E.sel;
  const TAU = Math.PI * 2;
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const lcm = (a, b) => a * b / gcd(a, b);

  /* ---------- 3. Zigzag ---------- */
  function waveVerts(style) {
    if (style === 'chevron') return [[0, -1], [0.5, 1]];
    if (style === 'stair') {
      const lv = [-1, -1 / 3, 1 / 3, 1], v = [];
      for (let i = 0; i < 4; i++) v.push([i * 0.125, lv[i]], [(i + 1) * 0.125, lv[i]]);
      for (let k = 0; k < 4; k++) v.push([0.5 + k * 0.125, lv[3 - k]], [0.5 + (k + 1) * 0.125, lv[3 - k]]);
      return v;
    }
    const v = [];
    for (let k = 0; k < 20; k++) v.push([k / 20, -Math.cos(k / 20 * TAU)]);
    return v;
  }

  P.register({
    key: 'zigzag', name: 'Zigzag', category: 'Stripes & op-art',
    blurb: 'Interlocking teeth in flat colour bands, rounded, chevron or staircase.',
    ink: ['ground', 'ink1', 'ink2', 'spark'], vector: true, seamless: true,
    common: { grain: 0.1 },
    params: [
      { key: 'style', label: 'Teeth', type: 'select', options: SEL(['rounded', 'chevron', 'stair']), default: 'chevron' },
      { key: 'band', label: 'Band depth', type: 'range', min: 3, max: 16, step: 0.5, default: 7 },
      { key: 'amp', label: 'Tooth height', type: 'range', min: 1, max: 12, step: 0.25, default: 6.5 },
      { key: 'period', label: 'Tooth width', type: 'range', min: 3, max: 24, step: 0.5, default: 10 },
      { key: 'phase', label: 'Neighbours', type: 'select', options: SEL(['interlock', 'parallel', 'drift']), default: 'interlock' },
      { key: 'colors', label: 'Bands', type: 'select', options: SEL(['two', 'three', 'four']), default: 'four' },
      { key: 'vertical', label: 'Vertical', type: 'toggle', default: false },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u * p.scale;
      g.fill(inks.ground);
      const vert = p.vertical;
      const La = vert ? H : W, Lb = vert ? W : H;
      const cycle = p.colors === 'two' ? 2 : p.colors === 'three' ? 3 : 4;
      const cols = p.colors === 'two' ? [inks.ink1, inks.ground] : p.colors === 'three' ? [inks.ink1, inks.ground, inks.ink2] : [inks.ink1, inks.ground, inks.ink2, inks.ground];
      let period = p.period * u;
      period = La / Math.max(1, Math.round(La / period));
      const amp = p.amp * u * 0.5;
      let n, band = p.band * u;
      if (env.tile) {
        const step = p.phase === 'interlock' ? lcm(cycle, 2) : p.phase === 'drift' ? cycle * 2 : cycle;
        n = step * Math.max(1, Math.round(Lb / band / step));
        band = Lb / n;
      } else n = Math.ceil(Lb / band) + 3;
      const verts = waveVerts(p.style);
      const phaseOf = i => (p.phase === 'interlock' ? (i % 2) * 0.5 : p.phase === 'drift' ? (i * 0.5) % 1 : 0);
      const boundary = i => {
        const yc = (i - (env.tile ? 0 : 1)) * band, ph = phaseOf(i), pts = [];
        const k0 = -2, k1 = Math.ceil(La / period) + 2;
        for (let k = k0; k <= k1; k++) for (let j = 0; j < verts.length; j++) {
          const x = (k + verts[j][0] - ph) * period;
          pts.push(x, yc + amp * verts[j][1]);
        }
        return pts;
      };
      const out = (pts) => {
        if (!vert) return pts;
        const r = new Array(pts.length);
        for (let i = 0; i < pts.length; i += 2) { r[i] = pts[i + 1]; r[i + 1] = pts[i]; }
        return r;
      };
      g.clipRect(0, 0, W, H, () => {
        let top = boundary(0);
        for (let i = 0; i < n + (env.tile ? 0 : 0); i++) {
          const bot = boundary(i + 1);
          const col = cols[i % cycle];
          if (col !== inks.ground) {
            const poly = top.slice();
            for (let j = bot.length - 2; j >= 0; j -= 2) poly.push(bot[j], bot[j + 1]);
            g.poly(out(poly), col);
          }
          top = bot;
        }
        if (!env.tile && env.spark.take(0.4 * u * La * 1.3)) {
          const b = boundary(rng.int(3, Math.max(4, n - 2)));
          g.polyline(out(b), inks.spark, Math.max(1.2, 0.4 * u), 1, 'butt');
        }
      });
    },
  });

  /* ---------- 4. Weave ---------- */
  const RHYTHMS = [[1, 1], [2, 1], [1, 2], [3, 1], [1, 1, 1, 3], [2, 2, 1, 1], [1, 3, 1, 1], [4, 1]];
  P.register({
    key: 'weave', name: 'Weave', category: 'Stripes & op-art',
    blurb: 'Stacked ribbons, each ruled with its own vertical stripe rhythm, like cloth tape laid edge to edge.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: true, seamless: true,
    common: { grain: 0.15 },
    params: [
      { key: 'bands', label: 'Ribbons', type: 'range', min: 3, max: 16, step: 1, default: 8 },
      { key: 'rhythm', label: 'Rhythm', type: 'select', options: SEL(['mixed', 'even', 'pinstripe']), default: 'mixed' },
      { key: 'skew', label: 'Slant', type: 'range', min: -1, max: 1, step: 0.05, default: 0.3 },
      { key: 'gap', label: 'Gap', type: 'range', min: 0, max: 1.5, step: 0.05, default: 0.35 },
      { key: 'stripe', label: 'Stripe size', type: 'range', min: 0.5, max: 3, step: 0.1, default: 1.1 },
      { key: 'spark', label: 'Spark stripe', type: 'toggle', default: true },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u * p.scale;
      g.fill(inks.ground);
      const n = p.bands, weights = [];
      let tot = 0;
      for (let i = 0; i < n; i++) { const w = rng.range(0.6, 1.7); weights.push(w); tot += w; }
      let acc = 0, prev = null;
      const combos = [[inks.ink1, inks.ground], [inks.ink2, inks.ground], [inks.ground, inks.ink1], [inks.ink1, inks.ink2], [inks.deep, inks.ground], [inks.ink2, inks.ink1], [inks.ground, inks.ink2]];
      const gap = Math.round(p.gap * env.u);
      let sparked = false;
      for (let i = 0; i < n; i++) {
        const y0 = Math.round(acc / tot * H); acc += weights[i];
        const y1 = i === n - 1 ? H : Math.round(acc / tot * H);
        const rh = y1 - y0 - gap;
        if (rh <= 0) continue;
        let ci;
        do { ci = rng.int(0, combos.length - 1); } while (ci === prev && combos.length > 1);
        prev = ci;
        const [a, b] = combos[ci];
        const s = rng.range(0.8, 2.2) * p.stripe * u;
        const pat = p.rhythm === 'even' ? [1, 1] : p.rhythm === 'pinstripe' ? rng.pick([[6, 1], [8, 1], [5, 1, 1, 1]]) : rng.pick(RHYTHMS);
        let S = 0; pat.forEach(w => { S += w * s; });
        S = W / Math.max(1, Math.round(W / S));
        const unit = S / pat.reduce((x, y) => x + y, 0);
        const off = rng.range(0, S);
        const dx = p.skew * rh;
        g.clipRect(0, y0, W, rh, () => {
          g.rect(0, y0, W, rh, b);
          const cycles = Math.ceil((W + Math.abs(dx)) / S) + 2;
          for (let c = -2; c < cycles; c++) {
            let x = c * S + off - (dx > 0 ? dx : 0);
            for (let j = 0; j < pat.length; j++) {
              const w = pat[j] * unit;
              if (j % 2 === 0) {
                if (dx === 0) g.rect(Math.round(x), y0, Math.round(x + w) - Math.round(x), rh, a);
                else g.poly([x, y0, x + w, y0, x + w + dx, y0 + rh, x + dx, y0 + rh], a);
              }
              x += w;
            }
          }
          // p.spark === false: no accent stripe (the ribbons are then brand inks only)
          if (!sparked && i === Math.floor(n / 2) && p.spark !== false && env.spark.take(unit * rh)) {
            sparked = true;
            const x = Math.round(rng.range(W * 0.2, W * 0.8));
            const w = Math.max(2, Math.round(unit * 0.8));
            if (dx === 0) g.rect(x, y0, w, rh, inks.spark);
            else g.poly([x, y0, x + w, y0, x + w + dx, y0 + rh, x + dx, y0 + rh], inks.spark);
          }
        });
      }
    },
  });

  /* ---------- 5. Op-art rings ---------- */
  P.register({
    key: 'oprings', name: 'Op-art rings', category: 'Stripes & op-art',
    blurb: 'Flat stripes bent around hidden centres until they read as rings, eyes and saddles.',
    ink: ['ground', 'ink1', 'ink2'], vector: false, seamless: false,
    common: { grain: 0.08 },
    params: [
      { key: 'mode', label: 'Form', type: 'select', options: SEL(['rings', 'eyes', 'lens', 'saddle']), default: 'eyes' },
      { key: 'centres', label: 'Centres', type: 'range', min: 1, max: 3, step: 1, default: 2 },
      { key: 'freq', label: 'Stripes', type: 'range', min: 5, max: 36, step: 1, default: 19 },
      { key: 'warp', label: 'Warp', type: 'range', min: 0, max: 1, step: 0.05, default: 0.14 },
      { key: 'bands', label: 'Colours', type: 'select', options: SEL(['two', 'three', 'four']), default: 'three' },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const ctx = g.ctx;
      const s = Math.sqrt(W * H);
      const nc = p.mode === 'rings' ? p.centres : Math.max(2, p.centres);
      const cx = [], cy = [];
      for (let i = 0; i < nc; i++) {
        const a = rng.range(0, TAU) + i * TAU / nc, r = rng.range(0.1, 0.24);
        cx.push((0.5 * W / s + Math.cos(a) * r * (W / s)) * 1.0);
        cy.push((0.5 * H / s + Math.sin(a) * r * (H / s)) * 1.0);
      }
      const freq = p.freq / p.scale;
      const cycle = p.bands === 'two' ? 2 : p.bands === 'three' ? 3 : 4;
      const cols = (p.bands === 'two' ? [inks.ink1, inks.ground] : p.bands === 'three' ? [inks.ink1, inks.ground, inks.ink2] : [inks.ink1, inks.ground, inks.ink2, inks.ground]).map(E.rgb);
      // warp offsets on a coarse grid, interpolated per pixel
      const gs = 8, gw = Math.ceil(W / gs) + 2, gh = Math.ceil(H / gs) + 2;
      const wgrid = new Float32Array(gw * gh);
      const ox = rng.range(0, 40), oy = rng.range(0, 40);
      for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) wgrid[j * gw + i] = noise.fbm(i * gs / s * 2.4 + ox, j * gs / s * 2.4 + oy, 3);
      const wamp = p.warp * 0.11;
      const mode = p.mode;
      const f = (x, y) => {
        const gx = x / gs, gy = y / gs, i0 = gx | 0, j0 = gy | 0, fx = gx - i0, fy = gy - j0;
        const a = wgrid[j0 * gw + i0], b = wgrid[j0 * gw + i0 + 1], c = wgrid[(j0 + 1) * gw + i0], d = wgrid[(j0 + 1) * gw + i0 + 1];
        const wv = (a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy) * wamp;
        const X = x / s, Y = y / s;
        let v;
        if (mode === 'rings') {
          v = 1e9;
          for (let i = 0; i < nc; i++) { const dx = X - cx[i], dy = Y - cy[i]; const d2 = dx * dx + dy * dy; if (d2 < v) v = d2; }
          v = Math.sqrt(v);
        } else if (mode === 'eyes') {
          v = 0;
          for (let i = 0; i < nc; i++) v += Math.hypot(X - cx[i], Y - cy[i]);
          v = v / nc * 1.0;
        } else if (mode === 'lens') {
          v = Math.hypot(X - cx[0], Y - cy[0]) - Math.hypot(X - cx[1], Y - cy[1]);
          v = v * 0.9 + 1.0;
        } else {
          v = 1;
          for (let i = 0; i < nc; i++) v *= Math.hypot(X - cx[i], Y - cy[i]) + 0.02;
          v = Math.pow(v, 1 / nc);
        }
        return (v + wv) * freq;
      };
      const img = ctx.createImageData(W, H), data = img.data;
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const v = f(x + 0.5, y + 0.5);
          let fw = Math.abs(f(x + 1.5, y + 0.5) - v) + Math.abs(f(x + 0.5, y + 1.5) - v);
          if (fw < 1e-4) fw = 1e-4;
          let pos = v - Math.floor(v / cycle) * cycle;
          let idx = Math.floor(pos); const fr = pos - idx;
          let c = cols[idx % cycle];
          const half = fw * 0.5;
          const o = (y * W + x) * 4;
          let r = c[0], gg = c[1], b = c[2];
          if (fw > 1.2) {
            // sub-pixel stripes: average to the mean colour
            let mr = 0, mg = 0, mb = 0;
            for (let k = 0; k < cycle; k++) { mr += cols[k][0]; mg += cols[k][1]; mb += cols[k][2]; }
            r = mr / cycle; gg = mg / cycle; b = mb / cycle;
          } else if (fr < half) {
            const pv = cols[(idx + cycle - 1) % cycle], t = 0.5 + fr / fw;
            r = pv[0] + (c[0] - pv[0]) * t; gg = pv[1] + (c[1] - pv[1]) * t; b = pv[2] + (c[2] - pv[2]) * t;
          } else if (fr > 1 - half) {
            const nx = cols[(idx + 1) % cycle], t = 0.5 - (1 - fr) / fw;
            r = c[0] + (nx[0] - c[0]) * t; gg = c[1] + (nx[1] - c[1]) * t; b = c[2] + (nx[2] - c[2]) * t;
          }
          data[o] = r; data[o + 1] = gg; data[o + 2] = b; data[o + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
    },
  });

  /* ---------- 6. Counterchange ---------- */
  function figurePoly(kind, cx, cy, R) {
    if (kind === 'square') { const s = R * 0.86; return [cx - s, cy - s, cx + s, cy - s, cx + s, cy + s, cx - s, cy + s]; }
    if (kind === 'diamond') { const s = R * 1.15; return [cx, cy - s, cx + s, cy, cx, cy + s, cx - s, cy]; }
    if (kind === 'arch') {
      const w = R * 0.8, pts = [cx - w, cy + R * 0.95, cx - w, cy - R * 0.1];
      for (let i = 1; i <= 40; i++) { const a = Math.PI + i / 40 * Math.PI; pts.push(cx + Math.cos(a) * w, cy - R * 0.1 + Math.sin(a) * w * 1.1); }
      pts.push(cx + w, cy + R * 0.95);
      return pts;
    }
    return E.ellipsePoly(cx, cy, R, R, 120);
  }
  P.register({
    key: 'counterchange', name: 'Counterchange', category: 'Stripes & op-art',
    blurb: 'An even bar field with a centred figure where the bars swap places with the gaps.',
    ink: ['ground', 'ink1', 'ink2', 'spark'], vector: true, seamless: false,
    common: { grain: 0.12 },
    params: [
      { key: 'figure', label: 'Figure', type: 'select', options: SEL(['circle', 'square', 'arch', 'diamond']), default: 'circle' },
      { key: 'bar', label: 'Bar width', type: 'range', min: 1.2, max: 9, step: 0.2, default: 3.4 },
      { key: 'dir', label: 'Bars', type: 'select', options: [{ value: 'v', label: 'Vertical' }, { value: 'h', label: 'Horizontal' }, { value: 'd', label: 'Diagonal' }, { value: 'a', label: 'Anti-diagonal' }], default: 'v' },
      { key: 'size', label: 'Figure size', type: 'range', min: 0.25, max: 0.95, step: 0.01, default: 0.62 },
      { key: 'nest', label: 'Nested figures', type: 'range', min: 1, max: 3, step: 1, default: 2 },
      { key: 'second', label: 'Second ink inside', type: 'toggle', default: true },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u * p.scale, b = p.bar * u;
      g.fill(inks.ground);
      const ang = { v: 0, h: Math.PI / 2, d: Math.PI / 4, a: -Math.PI / 4 }[p.dir];
      const c = Math.cos(ang), s = Math.sin(ang);
      const cx = W / 2, cy = H / 2, ct = cx * c + cy * s;
      const corners = [[0, 0], [W, 0], [W, H], [0, H]].map(q => q[0] * c + q[1] * s);
      const tmin = Math.min(...corners), tmax = Math.max(...corners);
      const kmin = Math.floor((tmin - ct) / b) - 1, kmax = Math.ceil((tmax - ct) / b) + 1;
      const canvasPoly = [0, 0, W, 0, W, H, 0, H];
      // bar k covers t in ct + [(k-.5)b, (k+.5)b]; even k = ink bar, odd = gap
      const draw = (poly, parity, color) => {
        for (let k = kmin; k <= kmax; k++) {
          if (((k % 2) + 2) % 2 !== parity) continue;
          const strip = E.clipStrip(poly, ang, ct + (k - 0.5) * b, ct + (k + 0.5) * b);
          if (strip.length >= 6) g.poly(strip, color);
        }
      };
      draw(canvasPoly, 0, inks.ink1);
      const R0 = Math.min(W, H) * p.size * 0.5;
      for (let l = 0; l < p.nest; l++) {
        const R = R0 * Math.pow(0.52, l);
        const fig = figurePoly(p.figure, cx, cy + (p.figure === 'arch' ? R * 0.05 : 0), R);
        g.poly(fig, inks.ground);
        if (l % 2 === 0) draw(fig, 1, p.second ? inks.ink2 : inks.ink1);
        else draw(fig, 0, inks.ink1);
      }
      const dotR = Math.max(R0 * Math.pow(0.52, p.nest - 1) * 0.16, u * 0.6);
      if (env.spark.take(Math.PI * dotR * dotR)) g.circle(cx, cy, dotR, inks.spark);
    },
  });

  /* ---------- 13. Chevron mirror ---------- */
  P.register({
    key: 'chevron', name: 'Chevron mirror', category: 'Stripes & op-art',
    blurb: 'Diagonal bands drawn in one quadrant and mirrored out into lozenges and arrowheads.',
    ink: ['ground', 'ink1', 'ink2', 'spark'], vector: true, seamless: true,
    common: { grain: 0.12 },
    params: [
      { key: 'bands', label: 'Bands', type: 'range', min: 3, max: 18, step: 1, default: 9 },
      { key: 'slope', label: 'Slope', type: 'range', min: 15, max: 75, step: 1, default: 38 },
      { key: 'mirror', label: 'Mirror', type: 'select', options: SEL(['quad', 'x', 'y']), default: 'quad' },
      { key: 'rhythm', label: 'Rhythm', type: 'select', options: SEL(['varied', 'even']), default: 'varied' },
      { key: 'colors', label: 'Colours', type: 'select', options: SEL(['two', 'three', 'four']), default: 'four' },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      g.fill(inks.ground);
      const mx = p.mirror !== 'y', my = p.mirror !== 'x';
      const rw = mx ? W / 2 : W, rh = my ? H / 2 : H;
      const ang = (90 - p.slope) * Math.PI / 180;       // band normal
      const c = Math.cos(ang), s = Math.sin(ang);
      const cs = [0, rw * c, rw * c + rh * s, rh * s];
      const tmin = Math.min(...cs), tmax = Math.max(...cs);
      const cycle = p.colors === 'two' ? 2 : p.colors === 'three' ? 3 : 4;
      const cols = p.colors === 'two' ? [inks.ink1, inks.ground] : p.colors === 'three' ? [inks.ink1, inks.ground, inks.ink2] : [inks.ink1, inks.ground, inks.ink2, inks.ground];
      const n = Math.max(cycle, Math.round(p.bands * p.scale));
      const w = []; let tot = 0;
      for (let i = 0; i < n; i++) { const v = p.rhythm === 'even' ? 1 : rng.range(0.55, 1.7); w.push(v); tot += v; }
      const quad = [0, 0, rw, 0, rw, rh, 0, rh];
      const emit = (pts, col) => {
        g.poly(pts, col);
        const m = (fx, fy) => { const o = new Array(pts.length); for (let i = 0; i < pts.length; i += 2) { o[i] = fx ? W - pts[i] : pts[i]; o[i + 1] = fy ? H - pts[i + 1] : pts[i + 1]; } return o; };
        if (mx) g.poly(m(true, false), col);
        if (my) g.poly(m(false, true), col);
        if (mx && my) g.poly(m(true, true), col);
      };
      let t = tmin;
      const sparkAt = rng.int(1, n - 2);
      for (let i = 0; i < n; i++) {
        const t1 = i === n - 1 ? tmax : t + w[i] / tot * (tmax - tmin);
        const col = cols[i % cycle];
        if (col !== inks.ground) emit(E.clipStrip(quad, ang, t, t1 + 0.5), col);
        t = t1;
      }
      if (!env.tile) {
        const t0 = tmin + (tmax - tmin) * (sparkAt / n);
        const sw = Math.max(1.5, env.u * 0.45);
        if (env.spark.take(sw * (rw + rh) * 4)) emit(E.clipStrip(quad, ang, t0, t0 + sw), inks.spark);
      }
    },
  });

  /* ---------- 18. Arc rise ---------- */
  function annulus(cx, cy, r1, r2) {
    const circ = (r, dir) => 'M' + (cx - r) + ' ' + cy + 'a' + r + ' ' + r + ' 0 1 ' + dir + ' ' + 2 * r + ' 0a' + r + ' ' + r + ' 0 1 ' + dir + ' ' + (-2 * r) + ' 0z';
    return circ(r1, 1) + circ(r2, 0);
  }
  P.register({
    key: 'arcrise', name: 'Arc rise', category: 'Stripes & op-art',
    blurb: 'Giant concentric colour bands rise from an edge across a field of upright bars.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: true, seamless: false,
    common: { grain: 0.12 },
    params: [
      { key: 'origin', label: 'Rises from', type: 'select', options: SEL(['bottom', 'top', 'left', 'corner']), default: 'bottom' },
      { key: 'bands', label: 'Bands', type: 'range', min: 3, max: 12, step: 1, default: 7 },
      { key: 'suns', label: 'Arcs', type: 'range', min: 1, max: 3, step: 1, default: 1 },
      { key: 'bars', label: 'Bar field', type: 'toggle', default: true },
      { key: 'bar', label: 'Bar pitch', type: 'range', min: 1.5, max: 8, step: 0.25, default: 3.6 },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u * p.scale;
      g.fill(inks.ground);
      if (p.bars) {
        const pitch = p.bar * u, nb = Math.ceil(W / pitch);
        for (let i = 0; i < nb; i++) g.rect(Math.round(i * pitch), 0, Math.max(1, Math.round(pitch * 0.5)), H, inks.t2);
      }
      const cycle = [inks.ink1, null, inks.ink2, null, inks.deep, null];
      const centres = [];
      const R = p.origin === 'left' ? W * 0.95 : p.origin === 'corner' ? Math.hypot(W, H) * 0.9 : H * 1.05;
      for (let s = 0; s < p.suns; s++) {
        const k = p.suns === 1 ? 0.5 : (s + 0.5) / p.suns;
        const jitter = p.suns === 1 ? 0 : rng.range(-0.06, 0.06);
        let cx, cy;
        if (p.origin === 'bottom') { cx = W * (k + jitter); cy = H; }
        else if (p.origin === 'top') { cx = W * (k + jitter); cy = 0; }
        else if (p.origin === 'left') { cx = 0; cy = H * (k + jitter); }
        else { cx = W * (p.suns === 1 ? 1 : k); cy = H; }
        centres.push([cx, cy, R * (p.suns === 1 ? 1 : rng.range(0.6, 1.0))]);
      }
      const N = p.bands;
      let sparkPos = null;
      centres.forEach(([cx, cy, Rm], si) => {
        const step = Rm / (N + 0.5);
        // later arcs overlap earlier ones; start the pattern at a different colour per arc
        for (let k = 0; k < N; k++) {
          const r1 = Rm - k * step, r2 = r1 - step;
          const col = cycle[(k + si) % cycle.length];
          if (!col) continue;
          g.path(annulus(cx, cy, r1, Math.max(0, r2)), col);
        }
        g.circle(cx, cy, step * 0.53, inks.ink1);
        if (si === 0) sparkPos = [cx, cy, Rm, step];
      });
      if (sparkPos) {
        const [cx, cy, Rm, step] = sparkPos;
        const a = p.origin === 'left' ? 0.7 : p.origin === 'top' ? Math.PI / 2 - 0.5 : -Math.PI / 2 + 0.5, rr = Rm - step * 1.5, dr = Math.max(u * 1.1, step * 0.28);
        const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
        if (env.spark.take(Math.PI * dr * dr)) g.circle(x, y, dr, inks.spark);
      }
    },
  });
})(window);
