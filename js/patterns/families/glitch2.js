/* patterns/families/glitch2.js — round 2 glitch & signal families:
   snow, onebit, satellite. Original code. */
(function (global) {
  'use strict';
  const P = global.Patterns, E = P.E, R = E.r2;
  const SEL = E.sel;
  const TAU = Math.PI * 2;
  const mix = E.mix, clamp = E.clamp, smoothstep = E.smoothstep;

  // Marbled colour: a domain-warped field read through a cyclic colour ramp. Returns an
  // R.buf (draw with .put(g, true) or use .cv as an image source).
  function marbleBuf(W, H, noise, rng, stops, o) {
    o = o || {};
    const B = R.buf(W, H, o.maxPx || 190000);
    const { lw, lh, sc, d32 } = B;
    const lut = R.lut(stops, 256);
    const feat = (o.feat || 60) / sc, ox = rng.range(0, 40), oy = rng.range(0, 40);
    const k = o.freq || 3.2, warp = o.warp || 1.1;
    for (let y = 0; y < lh; y++) for (let x = 0; x < lw; x++) {
      const X = x / feat + ox, Y = y / feat + oy;
      const qx = noise.fbm(X, Y, 2, 2, 0.5), qy = noise.fbm(X + 5.2, Y + 1.3, 2, 2, 0.5);
      const v = noise.fbm(X + warp * qx * 1.6, Y + warp * qy * 1.6, 3, 2, 0.5) * 0.5 + 0.5 + qx * 0.12;
      let t = (v * k) % 2; if (t < 0) t += 2; if (t > 1) t = 2 - t;
      d32[y * lw + x] = lut[(t * 255) | 0];
    }
    B.c.putImageData(B.id, 0, 0);
    return B;
  }

  /* ---------- 24. TV snow leaves ---------- */
  P.register({
    key: 'snow', name: 'TV snow leaves', category: 'Glitch & signal',
    blurb: 'Stacked pointed leaves filled with TV static over marbled colour, with checker lenses, stair-stepped edges, comb stripes and little asterisks.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: false, seamless: false,
    common: { grain: 0.15 },
    params: [
      { key: 'cols', label: 'Columns', type: 'range', min: 3, max: 9, step: 1, default: 5 },
      { key: 'static', label: 'Static', type: 'range', min: 0.1, max: 0.9, step: 0.05, default: 0.5 },
      { key: 'stairs', label: 'Stair edges', type: 'range', min: 0, max: 1, step: 0.05, default: 0.45 },
      { key: 'lenses', label: 'Checker lenses', type: 'range', min: 0, max: 1, step: 0.05, default: 0.5 },
      { key: 'marks', label: 'Asterisks', type: 'range', min: 0, max: 1, step: 0.05, default: 0.5 },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u * p.scale;
      const ctx = g.ctx;
      g.fill(inks.ground);
      const M = marbleBuf(W, H, noise, rng, [inks.ink1, inks.ink2, mix(inks.ink2, inks.ground, 0.45), inks.ink1, mix(inks.ink1, inks.deep, 0.55), inks.ink2], { feat: 55 * u, freq: 3.4, warp: 1.1 });
      // static tile (pixel noise, transparent holes)
      const ps = Math.max(1, Math.round(0.3 * u));
      const T = 160, st = global.document.createElement('canvas'); st.width = st.height = T;
      const sc2 = st.getContext('2d'), sid = sc2.createImageData(T, T), s32 = new Uint32Array(sid.data.buffer);
      const cD = R.pack(inks.deep), cG = R.pack(inks.ground), sr = rng.fork('static');
      for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
        const r = sr.next();
        s32[y * T + x] = r < p.static * 0.5 ? cD : r < p.static ? cG : 0;
      }
      sc2.putImageData(sid, 0, 0);
      const pat = ctx.createPattern(st, 'repeat');
      const leafPoly = (cx, cy, L, wd, ang, stair) => {
        const pts = [], n = 22, ca = Math.cos(ang), sa = Math.sin(ang);
        for (let i = 0; i <= n; i++) { const t = i / n, x = (t - 0.5) * L, y = -Math.pow(Math.sin(Math.PI * t), 0.8) * wd * 0.5; pts.push(cx + x * ca - y * sa, cy + x * sa + y * ca); }
        for (let i = n - 1; i >= 1; i--) { const t = i / n, x = (t - 0.5) * L, y = Math.pow(Math.sin(Math.PI * t), 0.8) * wd * 0.5; pts.push(cx + x * ca - y * sa, cy + x * sa + y * ca); }
        return stair ? R.stair(pts, Math.max(2, 0.9 * u)) : pts;
      };
      const path = (pts) => { ctx.beginPath(); ctx.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]); ctx.closePath(); };
      const cols = p.cols, colW = W / cols;
      const lw = Math.max(1, 0.15 * u);
      const leaves = [];
      for (let c = 0; c < cols; c++) {
        const cx0 = (c + 0.5) * colW + rng.range(-0.1, 0.1) * colW;
        const L = rng.range(1.15, 1.5) * colW * 1.15, wd = L * rng.range(0.34, 0.46);
        const n = Math.ceil(H / (L * 0.4)) + 2;
        let y = rng.range(-0.5, 0) * L;
        for (let i = 0; i < n; i++) {
          const ang = -Math.PI / 2 + (i % 2 ? 1 : -1) * rng.range(0.1, 0.4) + rng.range(-0.08, 0.08);
          leaves.push({ cx: cx0 + (i % 2 ? 1 : -1) * colW * 0.08, cy: y, L, wd, ang, col: c });
          y += L * 0.36;
        }
      }
      const kinds = ['static', 'static', 'static', 'comb', 'flat', 'marble'];
      leaves.forEach((lf, idx) => {
        const kind = rng.pick(kinds);
        const stair = rng.next() < p.stairs;
        const pts = leafPoly(lf.cx, lf.cy, lf.L, lf.wd, lf.ang, stair);
        ctx.save();
        path(pts); ctx.fillStyle = inks.ground; ctx.fill();
        ctx.clip(); path(pts);
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(M.cv, 0, 0, M.lw, M.lh, 0, 0, M.lw * M.sc, M.lh * M.sc);
        if (kind === 'static' || kind === 'marble') {
          if (kind === 'static') {
            ctx.save(); ctx.translate(rng.range(0, 99), rng.range(0, 99)); ctx.scale(ps, ps);
            ctx.fillStyle = pat; ctx.imageSmoothingEnabled = false;
            ctx.fillRect(-100, -100, W / ps + 200, H / ps + 200);
            ctx.restore();
          }
        } else if (kind === 'flat') {
          ctx.fillStyle = rng.pick([inks.ink2, inks.ground, inks.deep, inks.ink1]); ctx.fillRect(0, 0, W, H);
          ctx.fillStyle = mix(inks.deep, inks.ground, 0.15);
          const gap = 1.1 * u; ctx.save(); ctx.translate(lf.cx, lf.cy); ctx.rotate(lf.ang);
          for (let k = -lf.wd; k < lf.wd; k += gap * 2) ctx.fillRect(-lf.L * 0.5, k, lf.L, gap * 0.45);
          ctx.restore();
        } else {
          // comb stripes along the leaf axis, alternating two colours
          ctx.save(); ctx.translate(lf.cx, lf.cy); ctx.rotate(lf.ang);
          const gap = rng.range(0.7, 1.2) * u, c1 = rng.pick([inks.deep, inks.ground, inks.ink2]), c2 = rng.pick([inks.ink1, inks.ground, inks.ink2]);
          let j = 0;
          for (let k = -lf.wd; k < lf.wd; k += gap, j++) { ctx.fillStyle = j % 2 ? c1 : c2; ctx.fillRect(-lf.L * 0.5, k, lf.L, gap); }
          ctx.restore();
        }
        ctx.restore();
        // outline
        ctx.save(); path(pts); ctx.strokeStyle = inks.deep; ctx.lineWidth = lw * (stair ? 1.4 : 1); ctx.lineJoin = 'miter'; ctx.stroke(); ctx.restore();
      });
      // checker lenses between leaves
      const nl = Math.round(p.lenses * 9);
      for (let i = 0; i < nl; i++) {
        const cx = rng.range(0.05, 0.95) * W, cy = rng.range(0.05, 0.95) * H, L = rng.range(8, 15) * u, wd = L * rng.range(0.38, 0.55), ang = rng.pick([0, Math.PI / 2, -0.5, 0.5]);
        const pts = leafPoly(cx, cy, L, wd, ang, false);
        ctx.save(); path(pts); ctx.fillStyle = inks.ground; ctx.fill(); ctx.clip();
        const cell = rng.range(0.7, 1.2) * u, a = rng.pick([inks.deep, inks.ink1]), b = rng.pick([inks.ground, inks.ink2]);
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang);
        for (let y = -wd, j = 0; y < wd; y += cell, j++) for (let x = -L / 2, k = 0; x < L / 2; x += cell, k++) { ctx.fillStyle = (j + k) & 1 ? a : b; ctx.fillRect(x, y, cell + 0.5, cell + 0.5); }
        ctx.restore(); ctx.restore();
        ctx.save(); path(pts); ctx.strokeStyle = inks.deep; ctx.lineWidth = lw * 1.2; ctx.stroke(); ctx.restore();
      }
      // asterisk marks (spark on a few)
      const na = Math.round(p.marks * 60);
      for (let i = 0; i < na; i++) {
        const x = rng.range(0, W), y = rng.range(0, H), r = rng.range(0.55, 1.1) * u;
        const spark = i % 13 === 4 && env.spark.take(r * r * 1.5);
        const col = spark ? inks.spark : rng.pick([inks.deep, inks.ground]);
        ctx.strokeStyle = col; ctx.lineWidth = Math.max(1, 0.2 * u); ctx.lineCap = 'butt';
        ctx.beginPath();
        for (let k = 0; k < 4; k++) { const a = k * Math.PI / 4; ctx.moveTo(x - Math.cos(a) * r, y - Math.sin(a) * r); ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
        ctx.stroke();
      }
    },
  });

  /* ---------- 25. One-bit glitch ---------- */
  P.register({
    key: 'onebit', name: 'One-bit glitch', category: 'Glitch & signal',
    blurb: 'Two colours only: moire, scanlines, noise and blocks crushed to 1-bit pixels and cut into abrupt zones.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: false, seamless: false,
    common: { grain: 0.1 },
    params: [
      { key: 'zones', label: 'Zones', type: 'range', min: 2, max: 10, step: 1, default: 6 },
      { key: 'pixel', label: 'Pixel size', type: 'range', min: 0.3, max: 4, step: 0.05, default: 0.8 },
      { key: 'dither', label: 'Crush', type: 'select', options: SEL(['mixed', 'bayer', 'threshold']), default: 'mixed' },
      { key: 'pair', label: 'Pair', type: 'select', options: SEL(['mixed', 'ink1', 'ink2', 'deep']), default: 'mixed' },
      { key: 'glitch', label: 'Block glitch', type: 'range', min: 0, max: 1, step: 0.05, default: 0.5 },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u * p.scale;
      const ps = Math.max(1, p.pixel * u * 0.5);
      const B = R.buf(W, H, Math.min(900000, W * H / (ps * ps)));
      const { lw, lh, sc, d32 } = B;
      const U = u / sc;                              // 1u in internal px
      // partition: recursive random splits
      const zones = [{ x0: 0, y0: 0, x1: lw, y1: lh }];
      while (zones.length < p.zones) {
        let bi = 0, ba = 0; zones.forEach((z, i) => { const a = (z.x1 - z.x0) * (z.y1 - z.y0); if (a > ba) { ba = a; bi = i; } });
        const z = zones.splice(bi, 1)[0];
        const vert = (z.x1 - z.x0) * rng.range(0.8, 1.25) > (z.y1 - z.y0);
        const t = rng.range(0.28, 0.72);
        if (vert) { const x = z.x0 + (z.x1 - z.x0) * t; zones.push({ x0: z.x0, y0: z.y0, x1: x, y1: z.y1 }, { x0: x, y0: z.y0, x1: z.x1, y1: z.y1 }); }
        else { const y = z.y0 + (z.y1 - z.y0) * t; zones.push({ x0: z.x0, y0: z.y0, x1: z.x1, y1: y }, { x0: z.x0, y0: y, x1: z.x1, y1: z.y1 }); }
      }
      const pairs = {
        ink1: [inks.ink1, inks.ground], ink2: [inks.ink2, inks.ground], deep: [inks.deep, inks.ground],
      };
      const kinds = rng.shuffle(['moire', 'rings', 'scan', 'noise', 'blocks', 'diag', 'moire']);
      const seedN = E.hashSeed(env.seed + ':ob') | 0;
      let lastPair = '';
      zones.forEach((z, zi) => {
        const kind = kinds[zi % kinds.length];
        let pk = p.pair === 'mixed' ? rng.pick(['ink1', 'ink2', 'deep', 'ink1', 'deep']) : p.pair;
        if (p.pair === 'mixed' && pk === lastPair) pk = pk === 'ink1' ? 'deep' : 'ink1';
        lastPair = pk;
        const inv = rng.next() < 0.3;
        const fg = R.pack(inv ? pairs[pk][1] : pairs[pk][0]), bg = R.pack(inv ? pairs[pk][0] : pairs[pk][1]);
        let mode = p.dither === 'mixed' ? rng.pick(['bayer', 'threshold', 'bayer']) : p.dither;
        if (kind === 'moire' || kind === 'rings') mode = p.dither === 'bayer' ? 'bayer' : 'threshold';
        const th0 = rng.range(0.42, 0.58);
        const lam = rng.range(1.4, 3.2) * Math.max(1, U) + 2.5;
        const a1 = rng.range(0, Math.PI), a2 = a1 + rng.range(0.03, 0.16) * (rng.next() < 0.5 ? 1 : -1);
        const lam2 = lam * rng.range(0.94, 1.08);
        const c1 = [rng.range(z.x0, z.x1), rng.range(z.y0, z.y1)], c2 = [c1[0] + rng.range(-1, 1) * 8 * U, c1[1] + rng.range(-1, 1) * 8 * U];
        const bs = Math.max(2, Math.round(rng.range(3, 9) * U)), ns = rng.range(0, 99), nf = rng.range(6, 18) * U;
        const sp = Math.max(2, Math.round(rng.range(1.2, 3) * U));
        const grad = rng.next() < 0.5;
        for (let y = Math.floor(z.y0); y < Math.ceil(z.y1); y++) for (let x = Math.floor(z.x0); x < Math.ceil(z.x1); x++) {
          let v;
          if (kind === 'moire') {
            v = 0.5 + 0.25 * (Math.sin((x * Math.cos(a1) + y * Math.sin(a1)) * TAU / lam) + Math.sin((x * Math.cos(a2) + y * Math.sin(a2)) * TAU / lam2));
          } else if (kind === 'rings') {
            const d1 = Math.hypot(x - c1[0], y - c1[1]), d2 = Math.hypot(x - c2[0], y - c2[1]);
            v = 0.5 + 0.25 * (Math.sin(d1 * TAU / lam) + Math.sin(d2 * TAU / (lam * 1.04)));
          } else if (kind === 'scan') {
            const f = noise.fbm(x / nf + ns, y / (nf * 3), 3) * 0.5 + 0.5;
            const ph = ((y % sp) + 0.5) / sp; v = f > ph ? 0.9 : 0.1; if (grad) v = f > ph + (x - z.x0) / (z.x1 - z.x0) * 0.3 - 0.1 ? 0.9 : 0.1;
          } else if (kind === 'noise') {
            v = noise.fbm(x / nf + ns, y / nf, 4) * 0.55 + 0.5;
          } else if (kind === 'diag') {
            const d = (x + y * 0.7) / (lam * 1.4); v = (d - Math.floor(d)) < 0.5 ? 0.15 + 0.7 * ((y - z.y0) / (z.y1 - z.y0)) : 0.15; if (grad) v = (d - Math.floor(d));
          } else {
            v = E.ihash(Math.floor(x / bs), Math.floor(y / bs), seedN + zi);
          }
          const th = mode === 'bayer' ? E.bayer8.at(x, y) : mode === 'threshold' ? th0 : (E.bayer4.at(x, y) * 0.5 + th0 * 0.5);
          d32[y * lw + x] = v > th ? fg : bg;
        }
      });
      // glitch blocks: displaced row slices + inverted rectangles
      const gl = rng.fork('gl');
      const nb = Math.round(p.glitch * 12);
      for (let i = 0; i < nb; i++) {
        const h = Math.max(1, Math.round(gl.range(0.6, 4) * U)), y = gl.int(0, lh - h - 1), sh = gl.int(-Math.round(14 * U), Math.round(14 * U));
        const x0 = gl.int(0, Math.floor(lw * 0.6)), w = gl.int(Math.floor(lw * 0.15), Math.floor(lw * 0.6));
        for (let yy = y; yy < y + h; yy++) {
          const row = new Uint32Array(w);
          for (let x = 0; x < w; x++) row[x] = d32[yy * lw + Math.min(lw - 1, Math.max(0, x0 + x - sh))];
          for (let x = 0; x < w && x0 + x < lw; x++) d32[yy * lw + x0 + x] = row[x];
        }
        if (i % 3 === 0) {
          const bw = Math.round(gl.range(3, 12) * U), bh = Math.round(gl.range(1, 5) * U), bx = gl.int(0, lw - bw - 1), by = gl.int(0, lh - bh - 1);
          for (let yy = by; yy < by + bh; yy++) for (let x = bx; x < bx + bw; x++) {
            const k = yy * lw + x, v = d32[k];
            d32[k] = v === R.pack(inks.ground) ? R.pack(inks.deep) : R.pack(inks.ground);
          }
        }
      }
      // spark: a few single-pixel-grid squares
      const sq = Math.max(2, Math.round(1.6 * U));
      for (let i = 0; i < 3; i++) {
        if (!env.spark.take(sq * sq * sc * sc)) break;
        const bx = rng.int(0, lw - sq - 1), by = rng.int(0, lh - sq - 1), c = R.pack(inks.spark);
        for (let y = by; y < by + sq; y++) for (let x = bx; x < bx + sq; x++) d32[y * lw + x] = c;
      }
      B.put(g, false);
    },
  });

  /* ---------- 26. Corrupt satellite ---------- */
  P.register({
    key: 'satellite', name: 'Corrupt satellite', category: 'Glitch & signal',
    blurb: 'A marbled noise ground under mosaics of clashing pixel blocks, solid bars and sliced, shuffled bands, like a damaged satellite frame.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: false, seamless: false,
    common: { grain: 0.2 },
    params: [
      { key: 'mosaic', label: 'Mosaics', type: 'range', min: 0, max: 1, step: 0.05, default: 0.8 },
      { key: 'block', label: 'Block size', type: 'range', min: 0.6, max: 3.5, step: 0.1, default: 1.5 },
      { key: 'bars', label: 'Solid bars', type: 'range', min: 0, max: 1, step: 0.05, default: 0.5 },
      { key: 'slices', label: 'Sliced bands', type: 'range', min: 0, max: 6, step: 1, default: 3 },
      { key: 'tear', label: 'Shift', type: 'range', min: 0.1, max: 1, step: 0.05, default: 0.5 },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u * p.scale;
      const ctx = g.ctx;
      const M = marbleBuf(W, H, noise, rng, [inks.deep, inks.ink1, mix(inks.ink1, inks.ink2, 0.5), inks.ink2, mix(inks.ink2, inks.ground, 0.5)], { feat: 50 * u, freq: 2.6, warp: 1.3, maxPx: 240000 });
      M.put(g, true);
      const cell = Math.max(2, p.block * u);
      const pal = [inks.ink1, inks.ink2, inks.deep, inks.ground, inks.t2, inks.t1];
      const mr = rng.fork('mosaic');
      const nm = Math.round(2 + p.mosaic * 7);
      for (let i = 0; i < nm; i++) {
        const w = Math.round(mr.range(0.14, 0.42) * W / cell) * cell, h = Math.round(mr.range(0.12, 0.38) * H / cell) * cell;
        const x0 = Math.round(mr.range(-0.05, 0.95) * W / cell) * cell, y0 = Math.round(mr.range(-0.05, 0.95) * H / cell) * cell;
        const ps = mr.int(0, 2) ? [mr.pick(pal), mr.pick(pal), mr.pick(pal)] : [mr.pick(pal), mr.pick(pal), inks.ground];
        const nf = mr.range(2, 6), off = mr.range(0, 50), clear = mr.range(0.08, 0.3);
        const skew = mr.next() < 0.4;
        for (let y = y0; y < y0 + h; y += cell) for (let x = x0; x < x0 + w; x += cell) {
          if (x < -cell || y < -cell || x > W || y > H) continue;
          const nv = noise.fbm(x / (cell * nf) + off, y / (cell * nf) + off * 0.7, 2) * 0.5 + 0.5;
          const r = mr.next();
          if (r < clear) continue;
          let ci = Math.min(ps.length - 1, Math.floor((nv * 0.75 + r * 0.25) * ps.length));
          if (skew && ((y - y0) / cell) % 3 === 0) ci = (ci + 1) % ps.length;
          ctx.fillStyle = ps[ci]; ctx.fillRect(x, y, cell, cell);
        }
      }
      // solid bars
      const br = rng.fork('bars');
      const nbars = Math.round(p.bars * 9);
      for (let i = 0; i < nbars; i++) {
        const h = Math.max(2, Math.round(br.range(0.5, 3.2) * u)), y = br.range(0, H), w = br.range(0.25, 1) * W, x = br.next() < 0.5 ? 0 : W - w;
        const c = br.pick([inks.deep, inks.ground, inks.ink1, inks.ink2]);
        const sp = c === inks.ink1 && br.next() < 0.1 && env.spark.take(w * h);
        ctx.fillStyle = sp ? inks.spark : c; ctx.fillRect(x, y, w, h);
      }
      // sliced bands: cut strips, shuffle their order deterministically, shift sideways
      if (p.slices > 0) {
        const snap = global.document.createElement('canvas'); snap.width = W; snap.height = H;
        snap.getContext('2d').drawImage(ctx.canvas, 0, 0);
        const sr = rng.fork('slice');
        for (let s = 0; s < p.slices; s++) {
          const y0 = sr.range(0, 0.8) * H, hh = sr.range(0.1, 0.28) * H, n = sr.int(4, 9);
          const hs = []; let tot = 0;
          for (let i = 0; i < n; i++) { const h = sr.range(0.5, 2.2); hs.push(h); tot += h; }
          const strips = []; let yy = y0;
          for (let i = 0; i < n; i++) { const h = hs[i] / tot * hh; strips.push({ y: yy, h, sx: (sr.next() - 0.5) * 2 * p.tear * 0.3 * W }); yy += h; }
          const order = sr.shuffle(strips.map((_, i) => i));          // deterministic Fisher-Yates
          let dy = y0;
          order.forEach(idx => {
            const st = strips[idx];
            const sy = Math.max(0, Math.floor(st.y)), sh = Math.max(1, Math.min(H - sy, Math.ceil(st.h)));
            const sx = ((st.sx % W) + W) % W;
            ctx.drawImage(snap, 0, sy, W - sx, sh, sx, dy, W - sx, sh);
            if (sx > 0) ctx.drawImage(snap, W - sx, sy, sx, sh, 0, dy, sx, sh);
            dy += sh;
          });
        }
      }
    },
  });
})(window);
