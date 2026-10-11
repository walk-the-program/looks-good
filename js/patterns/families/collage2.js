/* patterns/families/collage2.js — round 2 collage, poster and botanical families:
   panels, flyposter, festival, patchwork, specimens, sprigs, blades, rods. Original code. */
(function (global) {
  'use strict';
  const P = global.Patterns, E = P.E, R = E.r2;
  const SEL = E.sel;
  const TAU = Math.PI * 2;
  const mix = E.mix, clamp = E.clamp, smoothstep = E.smoothstep;

  // palette helper: distinct ink list with the ground always available
  const palette = (inks) => [inks.ink1, inks.ink2, inks.deep, inks.ground, inks.t1, inks.t2];
  // pick from `list` a colour with contrast >= min against bg (falls back to the best available)
  function contrastPick(list, bg, rng, min) {
    const ok = list.filter(c => c !== bg && E.contrast(c, bg) >= min);
    if (ok.length) return rng.pick(ok);
    let best = list[0], bs = 0;
    list.forEach(c => { const k = E.contrast(c, bg); if (k > bs) { bs = k; best = c; } });
    return best;
  }

  /* ---------- 27. Panel collage ---------- */
  P.register({
    key: 'panels', name: 'Panel collage', category: 'Collage & poster',
    blurb: 'The frame carved into rectangles, each given flat colour, hard stripes, stacked chevrons, a grainy dot ramp or a drawn grid.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: true, seamless: false,
    common: { grain: 0.2 },
    params: [
      { key: 'depth', label: 'Carving depth', type: 'range', min: 3, max: 7, step: 1, default: 5 },
      { key: 'gutter', label: 'Gutter', type: 'range', min: 0, max: 1.6, step: 0.05, default: 0.45 },
      { key: 'pitch', label: 'Pattern pitch', type: 'range', min: 0.6, max: 2, step: 0.05, default: 1 },
      { key: 'flat', label: 'Flat panels', type: 'range', min: 0, max: 0.7, step: 0.05, default: 0.28 },
      { key: 'frame', label: 'Hairline frame', type: 'toggle', default: false },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u * p.scale;
      g.fill(inks.ground);
      const pal = palette(inks);
      const leaves = [];
      const minS = 7 * u;
      const split = (x, y, w, h, d) => {
        const canV = w > minS * 1.8, canH = h > minS * 1.8;
        const stop = d >= p.depth || (!canV && !canH) || (d > 2 && rng.next() < 0.14 + d * 0.05);
        if (stop) { leaves.push({ x, y, w, h }); return; }
        const vert = canV && (!canH || (w / h) * rng.range(0.7, 1.3) > 1);
        const t = rng.pick([0.382, 0.5, 0.618, rng.range(0.3, 0.7)]);
        if (vert) { split(x, y, w * t, h, d + 1); split(x + w * t, y, w * (1 - t), h, d + 1); }
        else { split(x, y, w, h * t, d + 1); split(x, y + h * t, w, h * (1 - t), d + 1); }
      };
      split(0, 0, W, H, 0);
      const gut = p.gutter * u * 0.5;
      const kinds = ['stripes', 'chevron', 'ramp', 'grid', 'stripes', 'chevron'];
      const used = [];
      leaves.forEach((L, i) => {
        const x = L.x + gut, y = L.y + gut, w = L.w - gut * 2, h = L.h - gut * 2;
        if (w < 2 || h < 2) return;
        let bg;
        do { bg = rng.pick(pal); } while (used.length && (bg === used[used.length - 1] || (used.length > 1 && bg === used[used.length - 2])) && rng.next() < 0.9);
        used.push(bg);
        const isSpark = w * h < W * H * 0.012 && rng.next() < 0.18 && env.spark.take(w * h);
        if (isSpark) bg = inks.spark;
        g.rect(x, y, w, h, bg);
        if (rng.next() < p.flat && !isSpark) return;
        if (isSpark) return;
        const fg = contrastPick(pal, bg, rng, 1.6);
        const kind = rng.pick(kinds), pitch = rng.range(0.9, 1.9) * u * p.pitch;
        g.clipRect(x, y, w, h, () => {
          if (kind === 'stripes') {
            const dir = rng.pick([0, 1, 2]), s = pitch * 1.1;
            if (dir === 0) for (let xx = x + rng.range(0, s); xx < x + w; xx += s * 2) g.rect(xx, y, s, h, fg);
            else if (dir === 1) for (let yy = y + rng.range(0, s); yy < y + h; yy += s * 2) g.rect(x, yy, w, s, fg);
            else { const d = w + h; for (let t = -h; t < w + h; t += s * 2.6) g.poly([x + t, y, x + t + s * 1.3, y, x + t + s * 1.3 + h, y + h, x + t + h, y + h], fg); }
          } else if (kind === 'chevron') {
            const a = pitch * 1.2, bandH = pitch * 0.9, per = bandH * 2;
            const up = rng.next() < 0.5 ? 1 : -1;
            for (let yy = y - a * 2; yy < y + h + a; yy += per) {
              const top = [], bot = [];
              for (let xx = x - a; xx <= x + w + a; xx += a) { const k = Math.round((xx - x) / a); const zz = (k % 2 ? a : 0) * up; top.push(xx, yy + zz); bot.push(xx, yy + zz + bandH); }
              const poly = top.slice();
              for (let k = bot.length - 2; k >= 0; k -= 2) poly.push(bot[k], bot[k + 1]);
              g.poly(poly, fg);
            }
          } else if (kind === 'ramp') {
            const horiz = rng.next() < 0.5, s = pitch * 0.95;
            const rr = rng.fork('ramp' + i);
            for (let yy = y + s * 0.5; yy < y + h; yy += s) for (let xx = x + s * 0.5; xx < x + w; xx += s) {
              let t = horiz ? (xx - x) / w : (yy - y) / h;
              t = clamp(t + (rr.next() - 0.5) * 0.28, 0, 1);
              if (rr.next() > 0.35 + t * 0.65) continue;
              const r = s * 0.5 * Math.sqrt(t) * 1.05;
              if (r > 0.45) g.circle(xx + (rr.next() - 0.5) * s * 0.25, yy + (rr.next() - 0.5) * s * 0.25, r, fg);
            }
          } else {
            const s = pitch * 2.2, lwid = Math.max(1, 0.14 * u);
            for (let xx = x + s * 0.5; xx < x + w; xx += s) g.line(xx, y, xx, y + h, fg, lwid, 'butt');
            for (let yy = y + s * 0.5; yy < y + h; yy += s) g.line(x, yy, x + w, yy, fg, lwid, 'butt');
          }
        });
        if (p.frame) {
          const lwid = Math.max(1, 0.12 * u);
          g.line(x, y, x + w, y, inks.deep, lwid); g.line(x, y + h, x + w, y + h, inks.deep, lwid);
          g.line(x, y, x, y + h, inks.deep, lwid); g.line(x + w, y, x + w, y + h, inks.deep, lwid);
        }
      });
    },
  });

  /* ---------- 28. Fly-poster ---------- */
  P.register({
    key: 'flyposter', name: 'Fly-poster', category: 'Collage & poster',
    blurb: 'A sweep of colour that hardens into vertical stripes, with halftone and solid blocks punched over it and a dense grid of tiny type-like marks.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: false, seamless: false,
    common: { grain: 0.35 },
    params: [
      { key: 'stripe', label: 'Stripe width', type: 'range', min: 0.5, max: 3, step: 0.05, default: 1.3 },
      { key: 'harden', label: 'Hardening', type: 'range', min: 0.2, max: 1, step: 0.05, default: 0.65 },
      { key: 'blocks', label: 'Punched blocks', type: 'range', min: 0, max: 8, step: 1, default: 5 },
      { key: 'marks', label: 'Type marks', type: 'range', min: 0, max: 3, step: 1, default: 2 },
      { key: 'angle', label: 'Sweep angle', type: 'range', min: -40, max: 40, step: 1, default: 18 },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u * p.scale;
      const ctx = g.ctx;
      const B = R.buf(W, H, 480000);
      const { lw, lh, sc, d32 } = B;
      const lut = R.lut([inks.ink1, inks.ink2, inks.t2, inks.ground, inks.t1, inks.ink1, inks.deep, inks.ink2], 512);
      // stripe boundaries with varied widths
      const bounds = [0]; let sx = 0; const sw = rng.fork('stripes');
      while (sx < W) { sx += sw.range(0.5, 2.1) * 2.6 * u * p.stripe; bounds.push(sx); }
      const centre = new Float32Array(bounds.length - 1), sidx = new Int16Array(lw);
      for (let i = 0; i < bounds.length - 1; i++) centre[i] = (bounds[i] + bounds[i + 1]) / 2;
      let si = 0;
      for (let x = 0; x < lw; x++) { const X = (x + 0.5) * sc; while (si < bounds.length - 2 && X >= bounds[si + 1]) si++; sidx[x] = si; }
      const ang = p.angle * Math.PI / 180, ca = Math.cos(ang), sa = Math.sin(ang);
      const y0 = H * (0.18 + 0.2 * (1 - p.harden)), y1 = H * (0.55 + 0.4 * p.harden);
      const ox = rng.range(0, 30), per = 0.34 / (W * 0.6) * 4.2;
      for (let y = 0; y < lh; y++) {
        const Y = (y + 0.5) * sc, mb = smoothstep(y0, y1, Y);
        const wob = noise.fbm(Y / (30 * u) + ox, 0.5, 2) * 0.35;
        for (let x = 0; x < lw; x++) {
          const X = (x + 0.5) * sc, xe = X + (centre[sidx[x]] - X) * mb;
          let s = (xe * ca + Y * sa) * per + wob * (1 - mb * 0.7);
          s -= Math.floor(s / 2) * 2; if (s > 1) s = 2 - s;
          d32[y * lw + x] = lut[(s * 511) | 0];
        }
      }
      B.put(g, false);
      // punched blocks
      const cell = 7 * u, gx = Math.floor(W / cell), gy = Math.floor(H / cell);
      const br = rng.fork('blocks');
      const taken = [];
      const free = (c, r, w, h) => !taken.some(t => c < t.c + t.w && c + w > t.c && r < t.r + t.h && r + h > t.r);
      for (let i = 0; i < p.blocks; i++) {
        const w = br.int(1, 3), h = br.int(1, 3), c = br.int(0, Math.max(0, gx - w)), r = br.int(0, Math.max(0, gy - h));
        if (!free(c, r, w, h)) continue;
        taken.push({ c, r, w, h });
        const x = c * cell + (W - gx * cell) / 2, y = r * cell + (H - gy * cell) / 2, bw = w * cell, bh = h * cell;
        const kind = br.pick(['solid', 'halftone', 'halftone', 'solid', 'lines']);
        const bg = br.pick([inks.ground, inks.deep, inks.ink1, inks.ground]);
        const spark = br.next() < 0.15 && env.spark.take(bw * bh);
        ctx.fillStyle = spark ? inks.spark : bg; ctx.fillRect(x, y, bw, bh);
        if (kind === 'halftone' && !spark) {
          const fg = contrastPick([inks.ink1, inks.ink2, inks.deep, inks.ground], bg, br, 1.8), s = 0.95 * u, dir = br.next() < 0.5;
          ctx.fillStyle = fg;
          for (let yy = y + s / 2, j = 0; yy < y + bh; yy += s * 0.9, j++) for (let xx = x + s / 2 + (j & 1) * s / 2; xx < x + bw; xx += s) {
            const t = dir ? (xx - x) / bw : (yy - y) / bh, rad = s * 0.52 * (0.1 + 0.9 * t);
            ctx.beginPath(); ctx.arc(xx, yy, rad, 0, TAU); ctx.fill();
          }
        } else if (kind === 'lines' && !spark) {
          const fg = contrastPick([inks.ink1, inks.ink2, inks.deep, inks.ground], bg, br, 1.8), s = 0.7 * u;
          ctx.fillStyle = fg; for (let yy = y; yy < y + bh; yy += s * 2) ctx.fillRect(x, yy, bw, s);
        }
      }
      // type marks: a dense grid of tiny abstract glyphs
      const mr = rng.fork('marks');
      for (let m = 0; m < p.marks; m++) {
        const cw = 1.25 * u, mw = Math.round(mr.range(10, 24)) * cw, mh = Math.round(mr.range(3, 8)) * cw * 1.5;
        const mx = mr.range(0.03, 0.97) * (W - mw), my = mr.range(0.05, 0.95) * (H - mh);
        const dark = mr.next() < 0.6;
        ctx.fillStyle = dark ? inks.deep : inks.ground; ctx.fillRect(mx - cw * 0.6, my - cw * 0.6, mw + cw * 1.2, mh + cw * 1.2);
        const ink = dark ? inks.ground : inks.deep;
        ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = Math.max(1, cw * 0.14); ctx.lineCap = 'butt';
        const ch = cw * 1.5;
        for (let yy = my; yy + ch <= my + mh + 0.1; yy += ch) for (let xx = mx; xx + cw <= mx + mw + 0.1; xx += cw) {
          const a = xx + cw * 0.18, b = xx + cw * 0.82, t = yy + ch * 0.15, bt = yy + ch * 0.85, mdx = (a + b) / 2, mdy = (t + bt) / 2;
          ctx.beginPath();
          switch (mr.int(0, 13)) {
            case 0: ctx.moveTo(mdx, t); ctx.lineTo(mdx, bt); break;
            case 1: ctx.moveTo(a, mdy); ctx.lineTo(b, mdy); break;
            case 2: ctx.moveTo(a, t); ctx.lineTo(a, bt); ctx.lineTo(b, bt); break;
            case 3: ctx.moveTo(a, t); ctx.lineTo(b, t); ctx.moveTo(mdx, t); ctx.lineTo(mdx, bt); break;
            case 4: ctx.moveTo(a, mdy); ctx.lineTo(b, mdy); ctx.moveTo(mdx, t + ch * 0.1); ctx.lineTo(mdx, bt - ch * 0.1); break;
            case 5: ctx.arc(mdx, mdy, cw * 0.28, 0, TAU); break;
            case 6: ctx.arc(mdx, mdy, cw * 0.32, 0, TAU); ctx.fill(); break;
            case 7: ctx.moveTo(a, bt); ctx.lineTo(b, t); break;
            case 8: ctx.moveTo(a, t); ctx.lineTo(b, bt); break;
            case 9: ctx.rect(a, t, b - a, bt - t); break;
            case 10: ctx.moveTo(a, t); ctx.lineTo(b, t); ctx.moveTo(a, mdy); ctx.lineTo(b, mdy); ctx.moveTo(a, bt); ctx.lineTo(b, bt); break;
            case 11: ctx.arc(mdx, bt, (b - a) / 2, Math.PI, TAU); break;
            case 12: ctx.rect(a, mdy - ch * 0.12, b - a, ch * 0.24); ctx.fill(); break;
            default: ctx.moveTo(a, t); ctx.lineTo(a, bt); ctx.moveTo(b, t); ctx.lineTo(b, bt); break;
          }
          ctx.stroke();
        }
      }
    },
  });

  /* ---------- 29. Festival ---------- */
  P.register({
    key: 'festival', name: 'Festival', category: 'Collage & poster',
    blurb: 'Chunky colour patches, one big freehand looping line and a constellation of connected dots.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: true, seamless: false,
    common: { grain: 0.25 },
    params: [
      { key: 'patches', label: 'Colour patches', type: 'range', min: 2, max: 10, step: 1, default: 6 },
      { key: 'loops', label: 'Loopiness', type: 'range', min: 0, max: 1, step: 0.05, default: 0.6 },
      { key: 'weight', label: 'Line weight', type: 'range', min: 0.5, max: 2, step: 0.05, default: 1 },
      { key: 'stars', label: 'Constellations', type: 'range', min: 0, max: 4, step: 1, default: 2 },
      { key: 'echo', label: 'Light core', type: 'toggle', default: false },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u * p.scale;
      g.fill(inks.ground);
      const line = inks.deep;
      // patches
      const cols = [inks.ink1, inks.ink2, inks.t1, inks.t2, inks.ink1, inks.ink2, inks.deep];
      for (let i = 0; i < p.patches; i++) {
        const cx = rng.range(0.05, 0.95) * W, cy = rng.range(0.08, 0.92) * H, r = rng.range(9, 20) * u;
        const col = i === 3 && env.spark.take(Math.PI * r * r * 0.25) ? inks.spark : cols[i % cols.length];
        const rr = col === inks.spark ? r * 0.5 : r;
        g.poly(R.blob(noise, cx, cy, rr * rng.range(0.9, 1.5), rr * rng.range(0.55, 1), 0.3, 56, rng.range(0, 60)), col);
      }
      // freehand loopy line: heading changes smoothly, with occasional full loops
      const dr = rng.fork('doodle');
      const draw = (col, lwid, off) => {
        const r2 = rng.fork('doodle'); // same path for echo
        let x = W * r2.range(0.1, 0.3), y = H * r2.range(0.5, 0.8), a = r2.range(-1.2, -0.4);
        const step = 0.5 * u, N = Math.round(1300 + 500 * p.loops);
        const pts = [x, y];
        let loop = 0, loopDir = 1, cur = 0;
        const mx = 0.1 * W, my = 0.12 * H;
        for (let i = 0; i < N; i++) {
          cur = cur * 0.94 + r2.gauss() * 0.012;
          let steer = 0;
          if (x < mx || x > W - mx || y < my || y > H - my) {
            const ta = Math.atan2(H / 2 - y, W / 2 - x); let d = ta - a; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU; steer = d * 0.07;
          }
          if (loop <= 0 && r2.next() < 0.0042 * p.loops * 5) { loop = Math.round(r2.range(34, 58)); loopDir = r2.next() < 0.5 ? -1 : 1; }
          let da = cur + steer;
          if (loop > 0) { da += loopDir * (TAU / 46); loop--; }
          a += da; x += Math.cos(a) * step; y += Math.sin(a) * step;
          pts.push(x + off, y + off);
        }
        g.polyline(pts, col, lwid, 1, 'round');
      };
      const lwid = 1.7 * u * p.weight;
      draw(line, lwid, 0);
      if (p.echo) draw(inks.ground, lwid * 0.28, 0);
      // constellations
      const sr = rng.fork('stars');
      for (let c = 0; c < p.stars; c++) {
        const cx = sr.range(0.12, 0.88) * W, cy = sr.range(0.15, 0.85) * H, n = sr.int(9, 15), spread = sr.range(11, 18) * u;
        const pts = [];
        for (let i = 0; i < n; i++) pts.push([cx + sr.gauss() * spread, cy + sr.gauss() * spread * 0.8]);
        const edges = new Set();
        const lwL = Math.max(1, 0.3 * u);
        pts.forEach((a, i) => {
          const ds = pts.map((b, j) => [Math.hypot(a[0] - b[0], a[1] - b[1]), j]).filter(d => d[1] !== i).sort((q, w) => q[0] - w[0]);
          for (let k = 0; k < (i % 3 === 0 ? 2 : 1); k++) { const j = ds[k][1], key = Math.min(i, j) + '-' + Math.max(i, j); if (!edges.has(key)) { edges.add(key); g.line(a[0], a[1], pts[j][0], pts[j][1], line, lwL, 'round'); } }
        });
        pts.forEach((a, i) => {
          const r = (i % 4 === 0 ? 1.3 : 0.8) * u;
          if (i === 2 && c === 0 && env.spark.take(Math.PI * r * r * 2)) { g.circle(a[0], a[1], r * 1.4, inks.spark); return; }
          if (i % 4 === 0) { g.circle(a[0], a[1], r + lwL, inks.ground); g.ring(a[0], a[1], r, lwL * 1.1, line); }
          else g.circle(a[0], a[1], r, line);
        });
      }
    },
  });

  /* ---------- 30. Glyph patchwork ---------- */
  P.register({
    key: 'patchwork', name: 'Glyph patchwork', category: 'Collage & poster',
    blurb: 'Ragged blobs and stepped blocks layered on a grid, each filled with circles, pluses, stripes, squares or dots in a single ink.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: true, seamless: false,
    common: { grain: 0.2 },
    params: [
      { key: 'cell', label: 'Grid cell', type: 'range', min: 4, max: 12, step: 0.5, default: 7 },
      { key: 'layers', label: 'Shapes', type: 'range', min: 12, max: 90, step: 1, default: 44 },
      { key: 'ragged', label: 'Ragged blobs', type: 'range', min: 0, max: 1, step: 0.05, default: 0.5 },
      { key: 'motif', label: 'Motifs', type: 'select', options: SEL(['mixed', 'circles', 'pluses', 'stripes', 'squares', 'dots']), default: 'mixed' },
      { key: 'dotgrid', label: 'Grid dots', type: 'toggle', default: true },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u * p.scale;
      g.fill(inks.ground);
      const c = p.cell * u, gx = Math.ceil(W / c), gy = Math.ceil(H / c);
      const ox = (W - gx * c) / 2, oy = (H - gy * c) / 2;
      const hair = Math.max(1, 0.1 * u);
      if (p.dotgrid) for (let j = 0; j <= gy; j++) for (let i = 0; i <= gx; i++) g.circle(ox + i * c, oy + j * c, 0.2 * u, inks.mute);
      const bases = [inks.ink1, inks.ink2, inks.deep, inks.t1, inks.t2, inks.ink1, inks.ink2, inks.ground];
      const motifs = ['circles', 'pluses', 'stripes', 'squares', 'dots'];
      // motif painter over a region described by a sampling predicate on lattice points
      const paint = (kind, col, x0, y0, x1, y1, inside, m, rowRects) => {
        const mm = m;
        if (kind === 'stripes') {
          const t = mm * 0.34;
          if (rowRects) rowRects(t, mm);
          return;
        }
        for (let y = Math.ceil((y0 - oy) / mm) * mm + oy, j = 0; y <= y1; y += mm, j++) for (let x = Math.ceil((x0 - ox) / mm) * mm + ox; x <= x1; x += mm) {
          if (!inside(x, y, mm * 0.5)) continue;
          if (kind === 'circles') g.ring(x, y, mm * 0.3, Math.max(1, mm * 0.1), col);
          else if (kind === 'pluses') { const r = mm * 0.3, lw = Math.max(1, mm * 0.11); g.line(x - r, y, x + r, y, col, lw, 'butt'); g.line(x, y - r, x, y + r, col, lw, 'butt'); }
          else if (kind === 'squares') g.rect(x - mm * 0.22, y - mm * 0.22, mm * 0.44, mm * 0.44, col);
          else g.circle(x, y, mm * 0.17, col);
        }
      };
      for (let i = 0; i < p.layers; i++) {
        const kind = p.motif === 'mixed' ? rng.pick(motifs) : p.motif;
        const bc = rng.pick(bases);
        const col = contrastPick([inks.ink1, inks.ink2, inks.deep, inks.ground], bc, rng, 1.7);
        const m = c / rng.pick([2, 2, 3]);
        const isSpark = i % 17 === 8;
        const blob = rng.next() < 0.5;
        if (blob) {
          const gx0 = ox + rng.int(0, gx) * c, gy0 = oy + rng.int(0, gy) * c, rx = rng.range(0.9, 2.3) * c, ry = rng.range(0.9, 2.3) * c;
          const poly = R.blob(noise, gx0, gy0, rx, ry, 0.12 + 0.3 * p.ragged, 30, rng.range(0, 90));
          const spk = isSpark && env.spark.take(Math.PI * rx * ry * 0.9);
          g.poly(poly, spk ? inks.spark : bc);
          if (spk) continue;
          let minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9;
          for (let q = 0; q < poly.length; q += 2) { minx = Math.min(minx, poly[q]); maxx = Math.max(maxx, poly[q]); miny = Math.min(miny, poly[q + 1]); maxy = Math.max(maxy, poly[q + 1]); }
          const inside = (x, y, mrg) => R.pointInPoly(poly, x, y) && R.pointInPoly(poly, x - mrg * 0.7, y) && R.pointInPoly(poly, x + mrg * 0.7, y) && R.pointInPoly(poly, x, y - mrg * 0.7) && R.pointInPoly(poly, x, y + mrg * 0.7);
          paint(kind, col, minx, miny, maxx, maxy, inside, m, (t, mm) => {
            for (let y = miny + mm * 0.5; y < maxy; y += mm) {
              const xs = R.spans(poly, y + t / 2), xs2 = R.spans(poly, y - t / 2);
              for (let k = 0; k + 1 < xs.length && k + 1 < xs2.length; k += 2) { const a = Math.max(xs[k], xs2[k]) + mm * 0.2, b = Math.min(xs[k + 1], xs2[k + 1]) - mm * 0.2; if (b > a) g.rect(a, y - t / 2, b - a, t, col); }
            }
          });
        } else {
          // stepped block: staircase of rows
          const rows = rng.int(2, 5), w0 = rng.int(2, 5), ci = rng.int(0, gx - 1), rj = rng.int(0, gy - 1);
          const flip = rng.next() < 0.5, up = rng.next() < 0.5;
          const rects = [];
          let wRow = w0;
          for (let r = 0; r < rows; r++) {
            const rw = Math.max(1, wRow), x = ox + ci * c - (flip ? rw * c : 0) + (flip ? 0 : 0), y = oy + (rj + (up ? -r : r)) * c;
            rects.push({ x, y, w: rw * c, h: c });
            wRow += rng.int(-1, 0) * 1 - (r % 2 ? 0 : 0);
          }
          const spk = isSpark && env.spark.take(c * c * 2);
          rects.forEach(rc => g.rect(rc.x, rc.y, rc.w, rc.h, spk ? inks.spark : bc));
          if (spk) continue;
          rects.forEach(rc => {
            const inside = (x, y) => x > rc.x + m * 0.3 && x < rc.x + rc.w - m * 0.3 && y > rc.y + m * 0.3 && y < rc.y + rc.h - m * 0.3;
            paint(kind, col, rc.x, rc.y, rc.x + rc.w, rc.y + rc.h, inside, m, (t, mm) => {
              for (let y = rc.y + mm * 0.5; y < rc.y + rc.h; y += mm) g.rect(rc.x + mm * 0.2, y - t / 2, rc.w - mm * 0.4, t, col);
            });
          });
        }
      }
    },
  });

  /* ---------- 31. Colour specimens ---------- */
  P.register({
    key: 'specimens', name: 'Colour specimens', category: 'Collage & poster',
    blurb: 'A grid of abstract colour blocks on a light ground, each a tiny study in marbling, tendrils, fans, rings or spikes.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: true, seamless: false,
    common: { grain: 0.15 },
    params: [
      { key: 'cols', label: 'Columns', type: 'range', min: 2, max: 8, step: 1, default: 4 },
      { key: 'gap', label: 'Gap', type: 'range', min: 0.3, max: 3, step: 0.05, default: 1.1 },
      { key: 'round', label: 'Corner radius', type: 'range', min: 0, max: 3, step: 0.1, default: 0 },
      { key: 'study', label: 'Studies', type: 'select', options: SEL(['mixed', 'marbling', 'tendrils', 'fans', 'rings', 'spikes']), default: 'mixed' },
      { key: 'line', label: 'Line weight', type: 'range', min: 0.5, max: 2, step: 0.05, default: 1 },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u * p.scale;
      g.fill(inks.ground);
      const gap = p.gap * u, cols = p.cols;
      const tw = (W - gap * (cols + 1)) / cols;
      const rows = Math.max(1, Math.round((H - gap) / (tw * 0.82 + gap)));
      const th = (H - gap * (rows + 1)) / rows;
      const pal = [inks.ink1, inks.ink2, inks.deep, inks.t1, inks.t2, inks.ink1, inks.ink2];
      const studies = ['marbling', 'tendrils', 'fans', 'rings', 'spikes'];
      const lw0 = 0.38 * u * p.line;
      let sparkTiles = 0;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const x = gap + c * (tw + gap), y = gap + r * (th + gap);
        const kind = p.study === 'mixed' ? studies[(r * 3 + c * 2 + rng.int(0, 2)) % studies.length] : p.study;
        let bg = rng.pick(pal);
        const sp = !sparkTiles && r === (rows >> 1) && c === (cols - 1) && env.spark.take(tw * th * 0.6) ;
        if (sp) { bg = inks.spark; sparkTiles++; }
        const fg1 = contrastPick([inks.ink1, inks.ink2, inks.deep, inks.ground, inks.t1], bg, rng, 1.9);
        let fg2 = contrastPick([inks.ink2, inks.ground, inks.deep, inks.ink1, inks.t2].filter(c => c !== fg1), bg, rng, 1.5);
        if (fg2 === fg1 || fg2 === bg) fg2 = E.lum(bg) > 0.5 ? mix(fg1, bg, 0.5) : mix(fg1, bg, 0.5);
        g.rect(x, y, tw, th, bg, p.round * u);
        g.clipRect(x, y, tw, th, () => {
          if (kind === 'marbling') {
            const K = rng.int(5, 8), off = rng.range(0, 90), f = tw * rng.range(0.5, 0.9), A = th / K * rng.range(1.2, 2.4);
            for (let k = -1; k <= K; k++) {
              const pts = [];
              for (let xx = x - 2; xx <= x + tw + 2; xx += Math.max(2, tw / 60)) pts.push(xx, y + (k + 0.5) * th / K + A * noise.fbm((xx - x) / f + off, k * 0.35 + off, 2));
              g.polyline(pts, k % 2 ? fg1 : fg2, th / K * 0.55, 1, 'butt');
            }
          } else if (kind === 'tendrils') {
            const n = rng.int(6, 10);
            for (let i = 0; i < n; i++) {
              const top = rng.next() < 0.5;
              let px = x + rng.range(0.05, 0.95) * tw, py = top ? y : y + th;
              let a = (top ? Math.PI / 2 : -Math.PI / 2) + rng.range(-0.7, 0.7);
              const dir = rng.next() < 0.5 ? 1 : -1; let cur = rng.range(0.03, 0.06);
              const pts = [px, py];
              const stp = rng.range(0.28, 0.42) * u;
              for (let s = 0; s < 160; s++) { a += cur * dir; cur *= 1.038; px += Math.cos(a) * stp; py += Math.sin(a) * stp; pts.push(px, py); if (cur > 0.9) break; }
              g.polyline(pts, i % 3 ? fg1 : fg2, lw0 * rng.range(1.1, 1.7), 1, 'round');
              g.circle(px, py, lw0 * 0.9, i % 3 ? fg1 : fg2);
            }
          } else if (kind === 'fans') {
            const corner = rng.next() < 0.7;
            const cx = corner ? (rng.next() < 0.5 ? x : x + tw) : x + tw * rng.range(0.3, 0.7);
            const cy = corner ? (rng.next() < 0.5 ? y : y + th) : (rng.next() < 0.5 ? y : y + th);
            const base = Math.atan2(y + th / 2 - cy, x + tw / 2 - cx), sp = corner ? Math.PI * 0.36 : Math.PI * 0.5;
            const n = rng.int(10, 18), big = Math.hypot(tw, th) * 1.3;
            for (let i = 0; i < n; i++) {
              const a1 = base - sp + (i / n) * sp * 2, b1 = base - sp + ((i + 0.55) / n) * sp * 2;
              g.poly([cx, cy, cx + Math.cos(a1) * big, cy + Math.sin(a1) * big, cx + Math.cos(b1) * big, cy + Math.sin(b1) * big], i % 2 ? fg1 : fg2);
            }
          } else if (kind === 'rings') {
            const ox = x + tw * rng.range(0.2, 0.8), oy = y + th * rng.range(0.2, 0.8), k = rng.int(6, 11), step = Math.min(tw, th) * 0.11;
            for (let i = k; i >= 1; i--) g.circle(ox, oy, i * step, i % 2 ? fg1 : fg2);
            g.circle(ox, oy, step * 0.45, bg);
          } else {
            const n = rng.int(8, 14), edge = rng.pick([0, 1, 2]), s = (edge === 0 ? tw : th) / n;
            for (let i = 0; i < n; i++) {
              const L = (edge === 0 ? th : tw) * rng.range(0.4, 0.95);
              const t0 = i * s, c0 = i % 2 ? fg1 : fg2;
              if (edge === 0) g.poly([x + t0, y + th, x + t0 + s, y + th, x + t0 + s * 0.5 + rng.range(-1, 1) * s * 0.3, y + th - L], c0);
              else if (edge === 1) g.poly([x, y + t0, x, y + t0 + s, x + L, y + t0 + s * 0.5], c0);
              else g.poly([x + tw, y + t0, x + tw, y + t0 + s, x + tw - L, y + t0 + s * 0.5], c0);
            }
          }
        });
      }
    },
  });

  /* ---------- 32. Marker botanicals (seamless) ---------- */
  P.register({
    key: 'sprigs', name: 'Marker botanicals', category: 'Botanical & line',
    blurb: 'Blooms, leaves, stems and berries drawn in a thick marker line with slightly misregistered colour fills, packed edge to edge in a seamless tile.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: true, seamless: true,
    common: { grain: 0.18 },
    params: [
      { key: 'size', label: 'Motif size', type: 'range', min: 0.6, max: 1.6, step: 0.05, default: 1 },
      { key: 'line', label: 'Marker weight', type: 'range', min: 0.5, max: 2, step: 0.05, default: 1 },
      { key: 'mix', label: 'Blooms vs leaves', type: 'range', min: 0, max: 1, step: 0.05, default: 0.45 },
      { key: 'fills', label: 'Colour fills', type: 'range', min: 0, max: 1, step: 0.05, default: 0.85 },
      { key: 'slip', label: 'Fill slip', type: 'range', min: 0, max: 1, step: 0.05, default: 0.5 },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u * p.scale;
      g.fill(inks.ground);
      const line = inks.deep, lw = Math.max(1, 0.5 * u * p.line);
      const slipX = 0.3 * u * p.slip, slipY = 0.22 * u * p.slip;
      const fillCols = [inks.ink1, inks.ink2, inks.t1, inks.t2];
      const tile = env.tile;
      // wrapped distance
      const dist = (x1, y1, x2, y2) => {
        let dx = Math.abs(x1 - x2), dy = Math.abs(y1 - y2);
        if (tile) { dx = Math.min(dx, W - dx); dy = Math.min(dy, H - dy); }
        return Math.hypot(dx, dy);
      };
      // poisson-ish packing on a torus
      const items = [];
      const baseR = 7.6 * u * p.size;
      const tries = 2600;
      const plan = [[1.0, 0.14], [0.78, 0.2], [0.58, 0.3], [0.42, 0.45], [0.3, 0.7]];
      plan.forEach(([k, share], pi) => {
        const rr = baseR * k;
        const target = Math.round(W * H / (Math.PI * rr * rr) * share * 1.15);
        let placed = 0;
        for (let t = 0; t < tries && placed < target; t++) {
          const x = rng.range(0, W), y = rng.range(0, H), r = rr * rng.range(0.85, 1.15);
          let ok = true;
          for (const q of items) if (dist(q.x, q.y, x, y) < (q.r + r) * 0.8) { ok = false; break; }
          if (!ok) continue;
          items.push({ x, y, r, tier: pi }); placed++;
        }
      });
      const kinds = (it) => {
        const bloom = rng.next() < p.mix;
        if (it.r > baseR * 0.62) return bloom ? 'flower' : rng.pick(['stem', 'leaf', 'stem']);
        if (it.r > baseR * 0.36) return bloom ? rng.pick(['daisy', 'berries']) : rng.pick(['leaf', 'sprig']);
        return rng.pick(['dot', 'berries', 'tick', 'leaf']);
      };
      // drawing primitives (marker line: colour fill, slipped, then outline)
      const leafPts = (x, y, L, wd, ang) => {
        const pts = [], n = 14, ca = Math.cos(ang), sa = Math.sin(ang);
        for (let i = 0; i <= n; i++) { const t = i / n, lx = t * L, ly = -Math.sin(Math.PI * t) * wd * (1 - 0.25 * t); pts.push(x + lx * ca - ly * sa, y + lx * sa + ly * ca); }
        for (let i = n - 1; i >= 1; i--) { const t = i / n, lx = t * L, ly = Math.sin(Math.PI * t) * wd * (1 - 0.25 * t); pts.push(x + lx * ca - ly * sa, y + lx * sa + ly * ca); }
        return pts;
      };
      const closed = (pts) => pts.concat([pts[0], pts[1]]);
      const leaf = (x, y, L, wd, ang, fill, rib) => {
        const pts = leafPts(x, y, L, wd, ang);
        if (fill) g.poly(pts.map((v, i) => v + (i & 1 ? slipY : slipX)), fill);
        g.polyline(closed(pts), line, lw, 1, 'round');
        if (rib) g.polyline([x, y, x + Math.cos(ang) * L * 0.78, y + Math.sin(ang) * L * 0.78], line, lw * 0.7, 1, 'round');
      };
      const stem = (x, y, ang, L, bend) => {
        const pts = [];
        for (let i = 0; i <= 14; i++) { const t = i / 14; const a = ang + bend * t * t; pts.push(x + Math.cos(ang) * L * t + Math.sin(ang) * 0 + (Math.cos(a + 1.57) * bend * L * 0.18 * t * t), y + Math.sin(ang) * L * t + (Math.sin(a + 1.57) * bend * L * 0.18 * t * t)); }
        return pts;
      };
      const draw = (it, kind, x, y) => {
        const r = it.r, rf = it.rf;
        if (kind === 'flower') {
          const n = it.n, pl = r * 0.78, pw = r * 0.3;
          const fill = it.fill;
          for (let i = 0; i < n; i++) {
            const a = it.a0 + i / n * TAU;
            const pts = [];
            for (let k = 0; k < 20; k++) { const t = k / 20 * TAU, lx = pl * (0.5 - 0.5 * Math.cos(t)) , ly = Math.sin(t) * pw * (0.55 + 0.45 * Math.sin(t / 2)); pts.push(x + (r * 0.14 + lx) * Math.cos(a) - ly * Math.sin(a), y + (r * 0.14 + lx) * Math.sin(a) + ly * Math.cos(a)); }
            if (fill) g.poly(pts.map((v, q) => v + (q & 1 ? slipY : slipX)), i % 2 ? fill : it.fill2);
            g.polyline(closed(pts), line, lw, 1, 'round');
          }
          g.circle(x, y, r * 0.2, it.core); g.ring(x, y, r * 0.2, lw, line);
        } else if (kind === 'daisy') {
          const n = it.n + 4;
          for (let i = 0; i < n; i++) { const a = it.a0 + i / n * TAU; g.line(x + Math.cos(a) * r * 0.3, y + Math.sin(a) * r * 0.3, x + Math.cos(a) * r * 0.85, y + Math.sin(a) * r * 0.85, line, lw, 'round'); }
          if (it.fill) g.circle(x + slipX * 0.5, y + slipY * 0.5, r * 0.2, it.fill);
          g.ring(x, y, r * 0.2, lw, line);
        } else if (kind === 'leaf') {
          leaf(x - Math.cos(it.a0) * r * 0.8, y - Math.sin(it.a0) * r * 0.8, r * 1.6, r * 0.55, it.a0, it.fill, true);
        } else if (kind === 'stem') {
          const pts = stem(x - Math.cos(it.a0) * r, y - Math.sin(it.a0) * r, it.a0, r * 2, it.bend);
          g.polyline(pts, line, lw, 1, 'round');
          for (let k = 1; k < 4; k++) {
            const q = pts[Math.min(pts.length / 2 - 1, k * 3) * 2], q2 = pts[Math.min(pts.length / 2 - 1, k * 3) * 2 + 1];
            const side = k % 2 ? 1 : -1;
            leaf(q, q2, r * 0.8, r * 0.26, it.a0 + side * 0.9, k % 2 ? it.fill : it.fill2, false);
          }
          leaf(pts[pts.length - 2], pts[pts.length - 1], r * 0.8, r * 0.26, it.a0, it.fill, false);
        } else if (kind === 'sprig') {
          const pts = stem(x - Math.cos(it.a0) * r, y - Math.sin(it.a0) * r, it.a0, r * 2, it.bend * 0.6);
          g.polyline(pts, line, lw, 1, 'round');
          for (let k = 1; k < 5; k++) { const i = k * 2; leaf(pts[i * 2], pts[i * 2 + 1], r * 0.55, r * 0.16, it.a0 + (k % 2 ? 0.85 : -0.85), it.fill, false); }
        } else if (kind === 'berries') {
          const n = 3 + (it.n % 3);
          for (let i = 0; i < n; i++) {
            const a = it.a0 + i / n * TAU, rr = r * 0.2;
            const bx = x + Math.cos(a) * r * 0.5, by = y + Math.sin(a) * r * 0.5;
            g.line(x, y, bx, by, line, lw * 0.8, 'round');
            if (it.fill) g.circle(bx + slipX * 0.6, by + slipY * 0.6, rr, i % 2 ? it.fill : it.fill2);
            g.ring(bx, by, rr, lw, line);
          }
        } else if (kind === 'dot') {
          g.circle(x, y, r * 0.3, it.fill || line); if (!it.fill) return; g.ring(x, y, r * 0.3, lw * 0.8, line);
        } else {
          g.line(x - Math.cos(it.a0) * r * 0.5, y - Math.sin(it.a0) * r * 0.5, x + Math.cos(it.a0) * r * 0.5, y + Math.sin(it.a0) * r * 0.5, line, lw, 'round');
        }
      };
      // spark: a handful of bloom cores / berries
      let sparkLeft = 4;
      items.sort((a, b) => b.r - a.r);
      items.forEach(it => {
        it.kind = kinds(it);
        it.a0 = rng.range(0, TAU); it.n = rng.int(5, 8); it.bend = rng.range(-1, 1);
        const useFill = rng.next() < p.fills;
        it.fill = useFill ? rng.pick(fillCols) : null;
        it.fill2 = useFill ? rng.pick(fillCols) : null;
        it.core = inks.ground;
        if ((it.kind === 'flower' || it.kind === 'berries') && sparkLeft > 0 && rng.next() < 0.3 && env.spark.take(Math.PI * (it.r * 0.2) * (it.r * 0.2) * 1.5)) { it.core = inks.spark; sparkLeft--; if (it.kind === 'berries') it.fill = inks.spark; }
      });
      items.forEach(it => E.wrapDraw(env, W, H, it.x, it.y, it.r * 2.2, (x, y) => draw(it, it.kind, x, y)));
    },
  });

  /* ---------- 33a. Scattered blades ---------- */
  P.register({
    key: 'blades', name: 'Scattered blades', category: 'Botanical & line',
    blurb: 'Curved blade shapes thrown across the ground in one ink, printed unevenly so the ink takes patchily on a rough sheet.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: false, seamless: false,
    common: { grain: 0.3 },
    params: [
      { key: 'count', label: 'Blades', type: 'range', min: 60, max: 700, step: 10, default: 260 },
      { key: 'size', label: 'Blade size', type: 'range', min: 0.5, max: 2, step: 0.05, default: 1 },
      { key: 'curve', label: 'Curve', type: 'range', min: 0, max: 1, step: 0.05, default: 0.6 },
      { key: 'take', label: 'Uneven ink', type: 'range', min: 0, max: 1, step: 0.05, default: 0.6 },
      { key: 'ink', label: 'Ink', type: 'select', options: SEL(['ink1', 'ink2', 'deep']), default: 'ink1' },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u * p.scale;
      g.fill(inks.ground);
      let col = inks[p.ink];
      if (E.contrast(col, inks.ground) < 1.8) col = [inks.ink2, inks.deep, inks.ink1].find(c => E.contrast(c, inks.ground) >= 1.8) || inks.deep;
      // draw blades into an offscreen canvas, then modulate its alpha per pixel
      const off = global.document.createElement('canvas'); off.width = W; off.height = H;
      const c = off.getContext('2d', { willReadFrequently: true });
      const flowAng = (x, y) => noise.fbm(x / (45 * u) + 3, y / (45 * u) + 8, 2) * Math.PI * 1.1 - 0.9;
      const spark = [];
      for (let i = 0; i < p.count; i++) {
        const x = rng.range(-0.03, 1.03) * W, y = rng.range(-0.03, 1.03) * H;
        const L = u * (3.5 + Math.pow(rng.next(), 1.6) * 11) * p.size, wd = L * rng.range(0.16, 0.26);
        const ang = flowAng(x, y) + rng.range(-0.5, 0.5);
        const bend = (rng.next() - 0.5) * 2 * p.curve * L * 0.55;
        const n = 14, left = [], right = [];
        const ca = Math.cos(ang), sa = Math.sin(ang);
        for (let k = 0; k <= n; k++) {
          const t = k / n, lx = t * L, ly = bend * t * t * (3 - 2 * t) * 0.9 - bend * 0.15 * t;
          const w = wd * Math.pow(Math.sin(Math.PI * Math.min(1, t * 0.98 + 0.02)), 0.85) * (1 - 0.15 * t);
          // normal (approx. of the bent axis)
          const dly = bend * 6 * t * (1 - t) / L * 0.9, nrm = Math.hypot(1, dly), nx = -dly / nrm, ny = 1 / nrm;
          left.push(lx - nx * w * 0.5, ly - ny * w * 0.5); right.push(lx + nx * w * 0.5, ly + ny * w * 0.5);
        }
        const rot = (pts) => { const o = []; for (let k = 0; k < pts.length; k += 2) o.push(x + pts[k] * ca - pts[k + 1] * sa, y + pts[k] * sa + pts[k + 1] * ca); return o; };
        const L2 = rot(left), R2 = rot(right);
        const poly = L2.slice(); for (let k = R2.length - 2; k >= 0; k -= 2) poly.push(R2[k], R2[k + 1]);
        if (i % 41 === 7 && env.spark.take(L * wd * 0.8)) { spark.push(poly); continue; }
        c.fillStyle = col; c.beginPath(); c.moveTo(poly[0], poly[1]);
        for (let k = 2; k < poly.length; k += 2) c.lineTo(poly[k], poly[k + 1]);
        c.closePath(); c.fill();
      }
      spark.forEach(poly => { c.fillStyle = inks.spark; c.beginPath(); c.moveTo(poly[0], poly[1]); for (let k = 2; k < poly.length; k += 2) c.lineTo(poly[k], poly[k + 1]); c.closePath(); c.fill(); });
      // ink-take: low-frequency ink load vs. paper tooth
      const id = c.getImageData(0, 0, W, H), d = id.data;
      const load = R.grid(W, H, Math.max(8, 3 * u), (x, y) => noise.fbm(x / (26 * u) + 40, y / (26 * u) + 11, 3) * 0.5 + 0.5);
      const seed = E.hashSeed(env.seed + ':bl') | 0;
      const tc = Math.max(1, Math.round(Math.min(W, H) / 620));
      const tk = p.take;
      for (let y = 0; y < H; y++) {
        const ty = (y / tc) | 0;
        for (let x = 0; x < W; x++) {
          const i = (y * W + x) * 4, a = d[i + 3];
          if (a === 0) continue;
          const tooth = E.ihash((x / tc) | 0, ty, seed) * 0.6 + E.ihash((x / (tc * 3)) | 0, (y / (tc * 3)) | 0, seed + 5) * 0.4;
          const take = load.at(x, y) * 0.8 + 0.35 - tk * 0.5 * tooth;      // > 0.5 inks fully
          const k = (take - 0.42) * 6 / (0.4 + (1 - tk) * 1.5);
          const m = k < 0 ? 0 : k > 1 ? 1 : k;
          d[i + 3] = a * (tk <= 0.01 ? 1 : m * (0.92 + 0.08 * tooth));
        }
      }
      c.putImageData(id, 0, 0);
      g.ctx.drawImage(off, 0, 0);
    },
  });

  /* ---------- 33b. Chained rods ---------- */
  P.register({
    key: 'rods', name: 'Chained rods', category: 'Botanical & line',
    blurb: 'Branching chains of short rods that wander and fork, the second ink printed slightly off true so a thick edge of the first shows on one side.',
    ink: ['ground', 'ink1', 'ink2', 'deep', 'spark'], vector: true, seamless: false,
    common: { grain: 0.25 },
    params: [
      { key: 'density', label: 'Density', type: 'range', min: 0.4, max: 2.5, step: 0.05, default: 1.5 },
      { key: 'thick', label: 'Rod thickness', type: 'range', min: 0.5, max: 2, step: 0.05, default: 1 },
      { key: 'length', label: 'Rod length', type: 'range', min: 1.5, max: 7, step: 0.1, default: 3.4 },
      { key: 'fork', label: 'Forking', type: 'range', min: 0, max: 1, step: 0.05, default: 0.5 },
      { key: 'slip', label: 'Misprint', type: 'range', min: 0, max: 1.5, step: 0.05, default: 0.8 },
      { key: 'second', label: 'Second ink', type: 'select', options: SEL(['ink2', 'ground', 'deep']), default: 'ink2' },
    ],
    render(g, W, H, p, inks, rng, noise, env) {
      const u = env.u * p.scale;
      g.fill(inks.ground);
      const lw = 1.35 * u * p.thick, len = p.length * u, gap = lw * 0.3;
      const cs = lw * 1.9, gw = Math.ceil(W / cs) + 1, gh = Math.ceil(H / cs) + 1;
      const grid = new Array(gw * gh);
      const near = (x, y, id, t2) => {
        const ci = (x / cs) | 0, cj = (y / cs) | 0;
        for (let j = Math.max(0, cj - 1); j <= Math.min(gh - 1, cj + 1); j++) for (let i = Math.max(0, ci - 1); i <= Math.min(gw - 1, ci + 1); i++) {
          const cell = grid[j * gw + i]; if (!cell) continue;
          for (let q = 0; q < cell.length; q += 3) { if (cell[q + 2] === id) continue; const dx = cell[q] - x, dy = cell[q + 1] - y; if (dx * dx + dy * dy < t2) return true; }
        }
        return false;
      };
      const put = (x, y, id) => { if (x < 0 || y < 0 || x >= W || y >= H) return; const k = ((y / cs) | 0) * gw + ((x / cs) | 0); (grid[k] || (grid[k] = [])).push(x, y, id); };
      const rods = [];        // x1,y1,x2,y2
      let nextId = 0;
      const t2 = (lw * 1.32) * (lw * 1.32);
      const queue = [];
      const nSeeds = Math.round(W * H / (u * u) * 0.032 * p.density) + 4;
      for (let i = 0; i < nSeeds; i++) {
        const edge = rng.next() < 0.6;
        let x, y, a;
        if (edge) { const s = rng.int(0, 3); if (s === 0) { x = rng.range(0, W); y = -u; a = Math.PI / 2; } else if (s === 1) { x = rng.range(0, W); y = H + u; a = -Math.PI / 2; } else if (s === 2) { x = -u; y = rng.range(0, H); a = 0; } else { x = W + u; y = rng.range(0, H); a = Math.PI; } a += rng.range(-0.7, 0.7); }
        else { x = rng.range(0, W); y = rng.range(0, H); a = rng.range(0, TAU); }
        queue.push({ x, y, a, id: ++nextId, life: Math.round(rng.range(30, 100)), seed: rng.range(0, 99) });
      }
      rng.shuffle(queue);
      let guard = 0;
      while (queue.length && guard++ < 9000) {
        const wk = queue.shift();
        let { x, y, a } = wk;
        for (let s = 0; s < wk.life; s++) {
          a += noise.n2(x / (22 * u) + wk.seed, y / (22 * u)) * 0.38 + rng.gauss() * 0.1;
          const nx = x + Math.cos(a) * len, ny = y + Math.sin(a) * len;
          if (nx < -2 * u || nx > W + 2 * u || ny < -2 * u || ny > H + 2 * u) break;
          if (near(nx, ny, wk.id, t2) || near((x + nx) / 2, (y + ny) / 2, wk.id, t2)) break;
          rods.push(x, y, nx, ny);
          put(nx, ny, wk.id); put((x + nx) / 2, (y + ny) / 2, wk.id); put(x, y, wk.id);
          if (s > 1 && rng.next() < 0.14 * p.fork && queue.length < 900) queue.push({ x: nx, y: ny, a: a + rng.pick([-1, 1]) * rng.range(0.6, 1.1), id: ++nextId, life: Math.round(rng.range(10, 60)), seed: rng.range(0, 99) });
          x = nx; y = ny;
        }
      }
      const c1 = inks.ink1;
      const c2 = p.second === 'ground' ? inks.ground : p.second === 'deep' ? inks.deep : inks.ink2;
      const gapF = gap / len;
      const dx = lw * 0.2 * p.slip, dy = lw * 0.16 * p.slip;
      const seg = (r, i, ox, oy, col, w) => {
        const x1 = r[i], y1 = r[i + 1], x2 = r[i + 2], y2 = r[i + 3];
        const ax = x1 + (x2 - x1) * gapF, ay = y1 + (y2 - y1) * gapF, bx = x2 - (x2 - x1) * gapF, by = y2 - (y2 - y1) * gapF;
        g.line(ax + ox, ay + oy, bx + ox, by + oy, col, w, 'round');
      };
      for (let i = 0; i < rods.length; i += 4) seg(rods, i, 0, 0, c1, lw);
      const w2 = lw * (c2 === inks.ground ? 0.5 : 0.62);
      for (let i = 0; i < rods.length; i += 4) seg(rods, i, dx, dy, c2, w2);
      // spark joints on a few rods
      for (let i = 0; i < rods.length; i += 4) {
        if ((i / 4) % 37 === 5) { const r = lw * 0.34; if (env.spark.take(Math.PI * r * r)) g.circle(rods[i + 2] + dx, rods[i + 3] + dy, r, inks.spark); }
      }
    },
  });
})(window);
