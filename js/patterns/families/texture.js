/* patterns/families/texture.js — texture families:
   tornbands, aura, flow. */
(function (global) {
  'use strict';
  const P = global.Patterns, E = P.E;
  const SEL = E.sel;
  const TAU = Math.PI * 2;

  /* ---------- 10. Torn bands ---------- */
  P.register({
    key: 'tornbands', name: 'Torn bands', category: 'Collage & poster',
    blurb: 'Ragged paper strips laid edge over edge, each printed with its own little pattern, like a print collage.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: false, seamless: false,
    common: { grain: 0.45 },
    params: [
      { key: 'bands', label: 'Strips', type: 'range', min: 3, max: 12, step: 1, default: 7 },
      { key: 'tear', label: 'Tear', type: 'range', min: 0, max: 2, step: 0.05, default: 1 },
      { key: 'tilt', label: 'Tilt', type: 'range', min: -6, max: 6, step: 0.5, default: -2.5 },
      { key: 'minis', label: 'Mini patterns', type: 'select', options: SEL(['mixed', 'stripes', 'dots', 'checks']), default: 'mixed' },
      { key: 'shadow', label: 'Paper shadow', type: 'range', min: 0, max: 1, step: 0.05, default: 0.6 },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const ctx = g.ctx, u = env.u * p.scale;
      g.fill(inks.ground);
      ctx.save();
      ctx.translate(W / 2, H / 2); ctx.rotate(p.tilt * Math.PI / 180); ctx.translate(-W / 2, -H / 2);
      const X0 = -W * 0.12, X1 = W * 1.12, Y0 = -H * 0.1, Y1 = H * 1.1;
      const n = p.bands, wts = [];
      let tot = 0;
      for (let i = 0; i < n; i++) { const w = rng.range(0.55, 1.7); wts.push(w); tot += w; }
      const papers = [
        [inks.ink1, [inks.ground, inks.deep, inks.ink2]],
        [inks.ink2, [inks.ink1, inks.ground, inks.deep]],
        [inks.ground, [inks.ink1, inks.ink2, inks.deep]],
        [inks.t2, [inks.ink1, inks.deep]],
        [inks.t1, [inks.ink2, inks.deep]],
        [inks.deep, [inks.ground, inks.ink2]],
        [inks.ink1, [inks.deep, inks.ink2]],
      ];
      let prev = -1, y = Y0;
      const dx = Math.max(2, 0.45 * u);
      const poly = (offX, offY, top, bot) => {
        ctx.beginPath();
        let first = true;
        for (let x = X0; x <= X1 + dx; x += dx) { const yy = top(x) + offY; if (first) { ctx.moveTo(x + offX, yy); first = false; } else ctx.lineTo(x + offX, yy); }
        for (let x = X1 + dx; x >= X0 - 1; x -= dx) ctx.lineTo(x + offX, bot(x) + offY);
        ctx.closePath();
      };
      const mk = (base, seedOff) => x => base + p.tear * (noise.fbm(x / (5 * u) + seedOff, seedOff * 0.7, 3) * 0.9 * u + noise.n2(x / (0.9 * u) + seedOff * 2, 3.3) * 0.32 * u) + (p.tear ? (E.ihash((x / 2) | 0, seedOff * 7 | 0, 77) - 0.5) * 0.14 * u * p.tear : 0);
      const stripes = [];
      for (let i = 0; i < n; i++) {
        const h = wts[i] / tot * (Y1 - Y0);
        stripes.push({ y0: y, y1: y + h });
        y += h;
      }
      stripes.forEach((s, i) => {
        const overlap = (s.y1 - s.y0) * 0.18;
        const top = mk(s.y0 - (i ? overlap * 0.3 : 0), i * 3.7 + 1), bot = mk(s.y1 + overlap, i * 3.7 + 2.3);
        let pi; do { pi = rng.int(0, papers.length - 1); } while (pi === prev);
        prev = pi;
        const [paper, pcs] = papers[pi];
        const pc = rng.pick(pcs);
        // shadow
        if (p.shadow > 0) {
          ctx.fillStyle = E.rgba(inks.deep, 0.1 * p.shadow);
          poly(0, u * 0.5, top, bot); ctx.fill();
          ctx.fillStyle = E.rgba(inks.deep, 0.16 * p.shadow);
          poly(0, u * 0.22, top, bot); ctx.fill();
        }
        ctx.fillStyle = paper;
        poly(0, 0, top, bot); ctx.fill();
        // mini pattern, clipped to the strip
        ctx.save();
        poly(0, 0, top, bot); ctx.clip();
        const kind = p.minis === 'mixed' ? rng.pick(['stripesV', 'stripesD', 'stripesH', 'dots', 'checks', 'hatch', 'waves', 'ramp', 'zig', 'none', 'rings']) : p.minis === 'stripes' ? rng.pick(['stripesV', 'stripesD', 'stripesH', 'hatch']) : p.minis === 'dots' ? rng.pick(['dots', 'ramp']) : 'checks';
        miniPattern(g, ctx, kind, X0, s.y0 - overlap, X1, s.y1 + overlap * 1.5, u * rng.range(0.9, 1.7), pc, rng, inks);
        ctx.restore();
        // torn paper rim (fibres) along the upper edge
        ctx.strokeStyle = E.rgba(inks.ground, paper === inks.ground ? 0 : 0.85); ctx.lineWidth = Math.max(1, u * 0.14);
        ctx.beginPath();
        for (let x = X0, f = true; x <= X1 + dx; x += dx) { const yy = top(x) + u * 0.1; if (f) { ctx.moveTo(x, yy); f = false; } else ctx.lineTo(x, yy); }
        ctx.stroke();
      });
      // one spark scrap
      const sw = rng.range(8, 13) * u, sh = rng.range(4, 6.5) * u;
      if (env.spark.take(sw * sh)) {
        const sx = rng.range(W * 0.1, W * 0.75), sy = rng.range(H * 0.15, H * 0.8);
        const top = x => sy + (noise.fbm(x / (2.5 * u) + 40, 9, 2) * 0.5 * u + noise.n2(x / (0.8 * u) + 3, 8) * 0.25 * u) * p.tear;
        const bot = x => sy + sh + (noise.fbm(x / (2.5 * u) + 80, 4, 2) * 0.5 * u + noise.n2(x / (0.8 * u) + 7, 2) * 0.25 * u) * p.tear;
        ctx.beginPath();
        for (let x = sx; x <= sx + sw; x += dx) { if (x === sx) ctx.moveTo(x, top(x)); else ctx.lineTo(x, top(x)); }
        for (let x = sx + sw; x >= sx; x -= dx) ctx.lineTo(x, bot(x));
        ctx.closePath();
        ctx.save(); ctx.translate(0, u * 0.3); ctx.fillStyle = E.rgba(inks.deep, 0.18 * p.shadow); ctx.fill(); ctx.restore();
        ctx.fillStyle = inks.spark; ctx.fill();
      }
      ctx.restore();
    },
  });

  function miniPattern(g, ctx, kind, x0, y0, x1, y1, s, col, rng, inks) {
    const w = x1 - x0, h = y1 - y0;
    ctx.fillStyle = col; ctx.strokeStyle = col;
    const lw = Math.max(1, s * 0.34);
    if (kind === 'stripesV') { for (let x = x0 + rng.range(0, s * 2); x < x1; x += s * 1.8) ctx.fillRect(x, y0, s * 0.8, h); }
    else if (kind === 'stripesH') { const t = Math.max(1, s * 0.3); for (let y = y0; y < y1; y += s * 0.9) ctx.fillRect(x0, y, w, t); }
    else if (kind === 'stripesD' || kind === 'hatch') {
      ctx.lineWidth = lw * 0.9;
      const run = (flip) => {
        ctx.beginPath();
        for (let t = -h; t < w + h; t += s * 1.5) {
          if (flip) { ctx.moveTo(x0 + t + h, y0); ctx.lineTo(x0 + t, y1); } else { ctx.moveTo(x0 + t, y0); ctx.lineTo(x0 + t + h, y1); }
        }
        ctx.stroke();
      };
      run(false); if (kind === 'hatch') run(true);
    }
    else if (kind === 'dots') { const r = s * 0.33; for (let y = y0 + s * 0.6; y < y1; y += s * 1.4) for (let x = x0 + ((((y - y0) / (s * 1.4)) | 0) % 2 ? s * 0.7 : 0); x < x1; x += s * 1.4) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); } }
    else if (kind === 'checks') { const c = s * 1.3; for (let j = 0, y = y0; y < y1; j++, y += c) for (let i = 0, x = x0; x < x1; i++, x += c) if ((i + j) & 1) ctx.fillRect(x, y, c, c); }
    else if (kind === 'waves') {
      ctx.lineWidth = lw; ctx.lineCap = 'round';
      for (let y = y0 + s; y < y1; y += s * 1.5) { ctx.beginPath(); for (let x = x0; x <= x1; x += 3) { const yy = y + Math.sin((x - x0) / (s * 1.6)) * s * 0.45; if (x === x0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy); } ctx.stroke(); }
    }
    else if (kind === 'ramp') { const step = s * 1.3; for (let y = y0 + step * 0.5; y < y1; y += step) for (let x = x0; x < x1; x += step) { const t = (x - x0) / w; ctx.beginPath(); ctx.arc(x, y, Math.max(0.2, t * step * 0.5), 0, TAU); ctx.fill(); } }
    else if (kind === 'zig') {
      ctx.lineWidth = lw; ctx.lineJoin = 'miter';
      for (let y = y0 + s; y < y1; y += s * 1.7) { ctx.beginPath(); let k = 0; for (let x = x0; x <= x1 + s; x += s * 0.9, k++) { const yy = y + (k % 2 ? s * 0.5 : -s * 0.5); if (!k) ctx.moveTo(x, yy); else ctx.lineTo(x, yy); } ctx.stroke(); }
    }
    else if (kind === 'rings') {
      ctx.lineWidth = lw * 0.8;
      for (let y = y0 + s * 1.2; y < y1; y += s * 2.6) for (let x = x0 + s * 1.2; x < x1; x += s * 2.6) { ctx.beginPath(); ctx.arc(x, y, s * 0.8, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(x, y, s * 0.35, 0, TAU); ctx.fill(); }
    }
  }

  /* ---------- 12. Aura wash ---------- */
  P.register({
    key: 'aura', name: 'Aura wash', category: 'Soft color',
    blurb: 'Large blurred fields of colour that melt into each other, finished with film grain.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: false, seamless: false,
    common: { grain: 0.32 },
    params: [
      { key: 'blobs', label: 'Colour fields', type: 'range', min: 2, max: 10, step: 1, default: 5 },
      { key: 'layout', label: 'Layout', type: 'select', options: SEL(['scatter', 'horizon', 'ribbon']), default: 'scatter' },
      { key: 'soft', label: 'Softness', type: 'range', min: 0.3, max: 1, step: 0.05, default: 0.75 },
      { key: 'mode', label: 'Light', type: 'select', options: SEL(['auto', 'paint', 'glow']), default: 'auto' },
      { key: 'strength', label: 'Intensity', type: 'range', min: 0.3, max: 1, step: 0.05, default: 0.95 },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const S = Math.sqrt(W * H);
      const sc = Math.max(1, Math.round(S / 220));
      const lw = Math.ceil(W / sc), lh = Math.ceil(H / sc), LS = Math.sqrt(lw * lh);
      const off = global.document.createElement('canvas'); off.width = lw; off.height = lh;
      const c = off.getContext('2d');
      c.fillStyle = inks.ground; c.fillRect(0, 0, lw, lh);
      const glow = p.mode === 'glow' || (p.mode === 'auto' && inks.dark);
      c.globalCompositeOperation = glow ? 'lighter' : 'source-over';
      const cols = [inks.ink1, inks.ink2, inks.ink1, inks.ink2, inks.t2, inks.deep];
      const blobs = [];
      const n = p.blobs;
      for (let i = 0; i < n; i++) {
        let x, y, r, rot = 0, sq = 1;
        if (p.layout === 'horizon') {
          x = rng.range(-0.1, 1.1) * lw; y = lh * rng.range(0.72, 1.1); r = LS * rng.range(0.42, 0.78); sq = rng.range(0.4, 0.7);
          if (i === 0) { x = lw * 0.5; y = lh * 0.15; r = LS * 0.3; sq = 1; }
        } else if (p.layout === 'ribbon') {
          const t = (i + rng.range(0, 1)) / n; x = lw * (-0.05 + t * 1.1); y = lh * (0.2 + 0.6 * (0.5 + 0.5 * Math.sin(t * 5 + rng.range(0, 1)))); r = LS * rng.range(0.28, 0.5); rot = -0.5 + rng.range(-0.2, 0.2); sq = rng.range(0.25, 0.5);
        } else {
          x = rng.range(-0.05, 1.05) * lw; y = rng.range(-0.05, 1.05) * lh; r = LS * rng.range(0.34, 0.7); rot = rng.range(0, Math.PI); sq = rng.range(0.55, 1);
        }
        blobs.push({ x, y, r, rot, sq, col: cols[i % cols.length], a: rng.range(0.8, 1) * p.strength });
      }
      blobs.forEach(b => {
        c.save();
        c.translate(b.x, b.y); c.rotate(b.rot); c.scale(1, b.sq);
        const gr = c.createRadialGradient(0, 0, 0, 0, 0, b.r);
        const k = glow ? 0.55 : 1;
        const hold = 0.2 + 0.25 * (1 - p.soft);
        gr.addColorStop(0, E.rgba(b.col, b.a * k));
        gr.addColorStop(hold, E.rgba(b.col, b.a * k * 0.85));
        gr.addColorStop(hold + (1 - hold) * 0.4, E.rgba(b.col, b.a * k * 0.45));
        gr.addColorStop(hold + (1 - hold) * 0.72, E.rgba(b.col, b.a * k * 0.12));
        gr.addColorStop(1, E.rgba(b.col, 0));
        c.fillStyle = gr; c.fillRect(-b.r, -b.r, b.r * 2, b.r * 2);
        c.restore();
      });
      // spark: one small, soft glint. Same feathered falloff as the colour fields (no hard
      // disc, which reads as a sun), radius capped at 6% of the short side, shrunk by quiet tone.
      const sr = Math.min(LS * 0.075, Math.min(lw, lh) * 0.06) * Math.sqrt(env.sparkK);
      if (env.spark.take(Math.PI * (sr * sc) * (sr * sc))) {
        const b = blobs[rng.int(0, blobs.length - 1)];
        const sx = Math.min(lw * 0.9, Math.max(lw * 0.1, b.x + rng.range(-0.1, 0.1) * lw)), sy = Math.min(lh * 0.9, Math.max(lh * 0.1, b.y + rng.range(-0.1, 0.1) * lh));
        const gr = c.createRadialGradient(sx, sy, 0, sx, sy, sr);
        const a = glow ? 0.55 : 0.8;
        gr.addColorStop(0, E.rgba(inks.spark, a));
        gr.addColorStop(0.18, E.rgba(inks.spark, a * 0.7));
        gr.addColorStop(0.5, E.rgba(inks.spark, a * 0.28));
        gr.addColorStop(0.78, E.rgba(inks.spark, a * 0.07));
        gr.addColorStop(1, E.rgba(inks.spark, 0));
        c.fillStyle = gr; c.fillRect(sx - sr, sy - sr, sr * 2, sr * 2);
      }
      const ctx = g.ctx;
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(off, 0, 0, lw * sc, lh * sc);
    },
  });

  /* ---------- 15. Flow filaments ---------- */
  P.register({
    key: 'flow', name: 'Flow filaments', category: 'Botanical & line',
    blurb: 'Thin streamlines traced through a noise flow field and bundled into evenly spaced ribbons of hairlines.',
    ink: ['ground', 'ink1', 'ink2', 'spark'], vector: true, seamless: false,
    common: { grain: 0.1 },
    params: [
      { key: 'field', label: 'Field', type: 'select', options: SEL(['flow', 'swirl', 'waves']), default: 'flow' },
      { key: 'strands', label: 'Strands per bundle', type: 'range', min: 1, max: 8, step: 1, default: 4 },
      { key: 'gap', label: 'Bundle spacing', type: 'range', min: 0.5, max: 4, step: 0.1, default: 1.8 },
      { key: 'bend', label: 'Bend', type: 'range', min: 0.2, max: 2.5, step: 0.05, default: 0.9 },
      { key: 'weight', label: 'Line weight', type: 'range', min: 0.4, max: 2.5, step: 0.05, default: 1.25 },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u * p.scale;
      g.fill(inks.ground);
      const lw = Math.max(0.8, 0.13 * env.u * p.weight), sp = lw * 2.4, S = p.strands;
      const bundleW = (S - 1) * sp;
      const dsep = bundleW + p.gap * u + lw * 2;
      const ox = rng.range(0, 60), oy = rng.range(0, 60), base = rng.range(-0.5, 0.5);
      const cxs = W * rng.range(0.35, 0.65), cys = H * rng.range(0.35, 0.65);
      const feat = 75 * u;
      const angle = (x, y) => {
        if (p.field === 'swirl') return Math.atan2(y - cys, x - cxs) + Math.PI / 2 + noise.fbm(x / feat + ox, y / feat + oy, 2) * p.bend * 1.4;
        if (p.field === 'waves') return Math.sin(y / (24 * u) + noise.fbm(x / feat + ox, y / feat, 2) * 2) * p.bend * 0.55 + Math.sin(x / (40 * u) + ox) * 0.25;
        return base + noise.fbm(x / feat + ox, y / feat + oy, 2) * p.bend * 4.2;
      };
      const cs = dsep * 0.5, gw = Math.ceil(W / cs) + 1, gh = Math.ceil(H / cs) + 1;
      const grid = new Array(gw * gh);
      const test = dsep * 0.5, test2 = test * test, seedTest2 = (dsep * 0.9) * (dsep * 0.9);
      const near = (x, y, id, t2) => {
        t2 = t2 || test2;
        const ci = (x / cs) | 0, cj = (y / cs) | 0;
        for (let j = Math.max(0, cj - 2); j <= Math.min(gh - 1, cj + 2); j++) for (let i = Math.max(0, ci - 2); i <= Math.min(gw - 1, ci + 2); i++) {
          const cell = grid[j * gw + i];
          if (!cell) continue;
          for (let q = 0; q < cell.length; q += 3) {
            if (cell[q + 2] === id) continue;
            const dx = cell[q] - x, dy = cell[q + 1] - y;
            if (dx * dx + dy * dy < t2) return true;
          }
        }
        return false;
      };
      const put = (x, y, id) => {
        if (x < 0 || y < 0 || x >= W || y >= H) return;
        const k = ((y / cs) | 0) * gw + ((x / cs) | 0);
        (grid[k] || (grid[k] = [])).push(x, y, id);
      };
      const step = Math.max(1.2, u * 0.55), margin = bundleW;
      const trace = (sx, sy, dir, id) => {
        const pts = [];
        let x = sx, y = sy;
        for (let i = 0; i < 900; i++) {
          const a1 = angle(x, y) ;
          const mx = x + Math.cos(a1) * step * 0.5 * dir, my = y + Math.sin(a1) * step * 0.5 * dir;
          const a2 = angle(mx, my);
          x += Math.cos(a2) * step * dir; y += Math.sin(a2) * step * dir;
          if (x < -margin || y < -margin || x > W + margin || y > H + margin) break;
          if (i > 2 && near(x, y, id)) break;
          pts.push(x, y);
        }
        return pts;
      };
      // seeds: jittered grid, shuffled
      const seeds = [];
      const sg = dsep * 0.7;
      for (let y = 0; y < H + sg; y += sg) for (let x = 0; x < W + sg; x += sg) seeds.push([x + rng.range(-0.45, 0.45) * sg, y + rng.range(-0.45, 0.45) * sg]);
      rng.shuffle(seeds);
      const lines = [];
      let id = 0;
      for (const [sx, sy] of seeds) {
        if (sx < 0 || sy < 0 || sx >= W || sy >= H) continue;
        if (near(sx, sy, -1, seedTest2)) continue;
        id++;
        const fwd = trace(sx, sy, 1, id), bwd = trace(sx, sy, -1, id);
        const pts = [];
        for (let i = bwd.length - 2; i >= 0; i -= 2) pts.push(bwd[i], bwd[i + 1]);
        pts.push(sx, sy);
        for (let i = 0; i < fwd.length; i++) pts.push(fwd[i]);
        if (pts.length < 14) continue;
        for (let i = 0; i < pts.length; i += 2) put(pts[i], pts[i + 1], id);
        lines.push(pts);
      }
      // smooth + offset into bundles
      const sparkIdx = new Set();
      for (let k = 0; k < Math.min(2, lines.length); k++) sparkIdx.add(rng.int(0, lines.length - 1));
      lines.forEach((pts, li) => {
        const m = pts.length / 2;
        const nrm = new Float32Array(pts.length);
        for (let i = 0; i < m; i++) {
          const a = Math.max(0, i - 2), b = Math.min(m - 1, i + 2);
          let tx = pts[b * 2] - pts[a * 2], ty = pts[b * 2 + 1] - pts[a * 2 + 1];
          const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
          nrm[i * 2] = -ty; nrm[i * 2 + 1] = tx;
        }
        let col = rng.next() < 0.7 ? inks.ink1 : inks.ink2;
        if (sparkIdx.has(li)) {
          let len = 0; for (let i = 2; i < pts.length; i += 2) len += Math.hypot(pts[i] - pts[i - 2], pts[i + 1] - pts[i - 1]);
          if (env.spark.take(len * lw * S)) col = inks.spark;
        }
        // weight < 1: hairlines this thin alias into a hatched moire inside each bundle, so the
        // bundle is drawn as one solid round-capped strand of the bundle's width instead
        if (p.weight < 1) { g.polyline(pts, col, bundleW + lw, 1, 'round'); return; }
        for (let s = 0; s < S; s++) {
          const o = (s - (S - 1) / 2) * sp, out = new Array(pts.length);
          for (let i = 0; i < m; i++) { out[i * 2] = pts[i * 2] + nrm[i * 2] * o; out[i * 2 + 1] = pts[i * 2 + 1] + nrm[i * 2 + 1] * o; }
          g.polyline(out, col, lw, 1, 'round');
        }
      });
    },
  });
})(window);
