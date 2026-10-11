/* ---------------------------------------------------------------------
   patterns/engine.js — generative pattern engine (original code).

   Plain script. Everything hangs off window.Patterns:
     Patterns.register(def)            add a family
     Patterns.list()                   public info for every family (incl. category)
     Patterns.CATEGORIES               ordered picker categories
     Patterns.get(key) / defaults(key) / schema(key)
     Patterns.inksFor(stateOrTokens, colorway, {tints})
     Patterns.render(canvas, key, params, inks, seed, opts)   -> {ms,w,h}
     Patterns.renderSVG(key, params, inks, seed, opts)        -> string|null
         opts.tile = true: a seamless repeating tile (seamless vector families only,
         else null), grain forced to 0; same composition as tileCSS at any size
     Patterns.tileSVG(key, params, inks, seed, size)          -> svg|null  (size 16..512, default 160)
     Patterns.tileCSS(key, params, inks, seed, size)          -> css|null
     Patterns.finalInks(key, params, inks)                    -> the inks a render actually uses
         (the + tints toggle and tone applied), for hex readouts
   Patterns.E holds shared helpers used by the family files.

   Tone (quiet patterns). `tone` is a common numeric param, 0..1, default 1:
     params.tone = 1     full strength (the brand inks as mapped by inksFor)
     params.tone < 1     quieter. Every non-ground ink (ink1, ink2, deep, t1, t2, mute)
                         becomes mix(ink, ground, tone), i.e. it moves toward the ground
                         by (1 - tone). The spark ink keeps its full colour, but its area
                         budget (and the aura spark radius) shrinks to clamp(tone, 0.5, 1)
                         of normal, so any tone <= 0.5 halves the spark.
   It lives in the family schema (Patterns.defaults(key).tone === 1, resolve() clamps it),
   so a pin's params carry it and Patterns.render / renderSVG / tileCSS all honor it:
     Patterns.render(cv, e.key, e.params, inks, seed, opts)   // e.params.tone is enough
     Patterns.render(cv, e.key, Object.assign({}, e.params, { tone: e.tone }), ...)   // also fine
   Patterns.suiteFor(key) entries (js/patterns/fit.js) carry both `entry.tone` and
   `entry.params.tone` (same number). Same seed + params + tone => identical pixels.
   env.tone and env.sparkK (= clamp(tone, 0.5, 1)) are available to family renders.

   Family render signature (one surface API for canvas and SVG):
     render(g, w, h, p, inks, rng, noise, env)
   g is a Surface (rect/circle/ring/poly/line/polyline/path/clipRect/grad);
   raster-only families use g.ctx. env = { u, tile, spark, ... }.
   u is 1% of sqrt(w*h): every size is measured in u, so a thumbnail and a
   4K export show the same composition.
------------------------------------------------------------------------ */
(function (global) {
  'use strict';

  const Patterns = global.Patterns = global.Patterns || {};
  const E = Patterns.E = {};
  const families = new Map();

  /* ------------------------------ math ------------------------------ */
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = t => t * t * (3 - 2 * t);
  const mod = (a, n) => ((a % n) + n) % n;
  E.clamp = clamp; E.lerp = lerp; E.smooth = smooth; E.mod = mod;
  E.smoothstep = (a, b, x) => smooth(clamp((x - a) / (b - a), 0, 1));

  /* ------------------------------ hashing / PRNG ------------------------------ */
  function hashSeed(s) {
    if (typeof s === 'number' && isFinite(s)) return (s | 0) >>> 0;
    s = String(s == null ? '' : s);
    let h = 1779033703 ^ s.length;
    for (let i = 0; i < s.length; i++) {
      h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^ (h >>> 16)) >>> 0;
  }
  E.hashSeed = hashSeed;

  function mulberry32(a) {
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function makeRng(seed, salt) {
    const f = mulberry32((hashSeed(seed) ^ Math.imul(hashSeed(salt == null ? 0 : salt), 0x9e3779b1)) >>> 0);
    const r = {
      next: f,
      range: (a, b) => a + (b - a) * f(),
      int: (a, b) => a + Math.floor(f() * (b - a + 1)),
      pick: arr => arr[Math.floor(f() * arr.length)],
      chance: p => f() < p,
      gauss() { let u = 0, v = 0; while (!u) u = f(); while (!v) v = f(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.283185307 * v); },
      shuffle(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(f() * (i + 1)); const t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; },
      weighted(items, weights) {
        let tot = 0; for (const w of weights) tot += w;
        let x = f() * tot;
        for (let i = 0; i < items.length; i++) { x -= weights[i]; if (x <= 0) return items[i]; }
        return items[items.length - 1];
      },
      fork: s => makeRng(hashSeed(seed) + '/' + s),
    };
    return r;
  }
  E.rng = makeRng;

  // Integer lattice hash -> [0,1). Pure function of (x, y, seed).
  function ihash(x, y, s) {
    let h = Math.imul(x | 0, 0x27d4eb2d) ^ Math.imul(y | 0, 0x165667b1) ^ Math.imul(s | 0, 0x9e3779b1);
    h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
    h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  E.ihash = ihash;

  /* ------------------------------ noise ------------------------------ */
  const GRAD = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];

  function makeNoise(seed) {
    const rnd = mulberry32(hashSeed(seed) ^ 0x5bd1e995);
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = p[i]; p[i] = p[j]; p[j] = t; }
    const perm = new Uint8Array(512);
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
    const vs = hashSeed(seed) | 0;
    const F2 = 0.3660254037844386, G2 = 0.21132486540518713;

    // 2D simplex noise, range about [-1,1]
    function n2(xin, yin) {
      const s = (xin + yin) * F2;
      const i = Math.floor(xin + s), j = Math.floor(yin + s);
      const t = (i + j) * G2;
      const x0 = xin - (i - t), y0 = yin - (j - t);
      const i1 = x0 > y0 ? 1 : 0, j1 = x0 > y0 ? 0 : 1;
      const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
      const x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
      const ii = i & 255, jj = j & 255;
      let n = 0, tt = 0.5 - x0 * x0 - y0 * y0;
      if (tt > 0) { tt *= tt; const g = GRAD[perm[ii + perm[jj]] % 12]; n += tt * tt * (g[0] * x0 + g[1] * y0); }
      tt = 0.5 - x1 * x1 - y1 * y1;
      if (tt > 0) { tt *= tt; const g = GRAD[perm[ii + i1 + perm[jj + j1]] % 12]; n += tt * tt * (g[0] * x1 + g[1] * y1); }
      tt = 0.5 - x2 * x2 - y2 * y2;
      if (tt > 0) { tt *= tt; const g = GRAD[perm[ii + 1 + perm[jj + 1]] % 12]; n += tt * tt * (g[0] * x2 + g[1] * y2); }
      const v = 70 * n;
      return v > 1 ? 1 : v < -1 ? -1 : v;
    }

    // Smooth value noise, [-1,1]
    function v2(x, y) {
      const xi = Math.floor(x), yi = Math.floor(y);
      const fx = x - xi, fy = y - yi;
      const u = fx * fx * fx * (fx * (fx * 6 - 15) + 10), w = fy * fy * fy * (fy * (fy * 6 - 15) + 10);
      const a = ihash(xi, yi, vs), b = ihash(xi + 1, yi, vs), c = ihash(xi, yi + 1, vs), d = ihash(xi + 1, yi + 1, vs);
      return (lerp(lerp(a, b, u), lerp(c, d, u), w)) * 2 - 1;
    }

    function fbm(x, y, oct, lac, gain) {
      oct = oct || 4; lac = lac || 2; gain = gain == null ? 0.5 : gain;
      let a = 1, f = 1, s = 0, nrm = 0;
      for (let o = 0; o < oct; o++) {
        s += a * n2(x * f + o * 17.31, y * f - o * 9.17);
        nrm += a; a *= gain; f *= lac;
      }
      return s / nrm;
    }

    // Ridged fBm: sharp creases, [-1,1]
    function ridged(x, y, oct, lac, gain) {
      oct = oct || 4; lac = lac || 2; gain = gain == null ? 0.5 : gain;
      let a = 1, f = 1, s = 0, nrm = 0;
      for (let o = 0; o < oct; o++) {
        const v = 1 - Math.abs(n2(x * f + o * 5.7, y * f + o * 3.3));
        s += a * v * v; nrm += a; a *= gain; f *= lac;
      }
      return (s / nrm) * 2 - 1;
    }

    // Periodic value-noise fBm for seamless tiles. x,y in lattice units; the
    // field repeats every (px, py) lattice cells. Octave k uses 2^k * period.
    function tile(x, y, px, py, oct, gain) {
      oct = oct || 3; gain = gain == null ? 0.5 : gain;
      let a = 1, s = 0, nrm = 0, m = 1;
      for (let o = 0; o < oct; o++) {
        const X = x * m, Y = y * m, PX = px * m, PY = py * m;
        const xi = Math.floor(X), yi = Math.floor(Y);
        const fx = X - xi, fy = Y - yi;
        const u = fx * fx * fx * (fx * (fx * 6 - 15) + 10), w = fy * fy * fy * (fy * (fy * 6 - 15) + 10);
        const x0 = mod(xi, PX), x1 = mod(xi + 1, PX), y0 = mod(yi, PY), y1 = mod(yi + 1, PY);
        const sd = vs + o * 131;
        const q = lerp(lerp(ihash(x0, y0, sd), ihash(x1, y0, sd), u), lerp(ihash(x0, y1, sd), ihash(x1, y1, sd), u), w);
        s += a * (q * 2 - 1); nrm += a; a *= gain; m *= 2;
      }
      return s / nrm;
    }

    return { n2, v2, fbm, ridged, tile };
  }
  E.noise = makeNoise;

  // Percentile range of a scalar field, so band counts always show every level.
  E.fieldRange = function (f, W, H, n) {
    n = n || 28;
    const vals = [];
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) vals.push(f((i + 0.5) / n * W, (j + 0.5) / n * H));
    vals.sort((a, b) => a - b);
    const lo = vals[Math.floor(vals.length * 0.04)], hi = vals[Math.floor(vals.length * 0.96)];
    return { lo, hi: hi > lo + 1e-6 ? hi : lo + 1 };
  };

  // Field factory. feature = size in px of one noise lattice cell. Returns a
  // function (x,y) -> [0,1], percentile-normalised, periodic when env.tile.
  E.makeField = function (noise, env, W, H, feature, o) {
    o = o || {};
    const oct = o.oct || 4, kind = o.kind || 'fbm';
    const ox = o.off ? o.off[0] : 0, oy = o.off ? o.off[1] : 0;
    let raw;
    if (env.tile) {
      const px = Math.max(1, Math.round(W / feature)), py = Math.max(1, Math.round(H / feature));
      raw = (x, y) => noise.tile(x / W * px + Math.round(ox), y / H * py + Math.round(oy), px, py, Math.min(oct, 4));
    } else if (kind === 'ridged') {
      raw = (x, y) => noise.ridged(x / feature + ox, y / feature + oy, oct);
    } else if (kind === 'warp') {
      raw = (x, y) => {
        const qx = noise.fbm(x / feature + 3.1 + ox, y / feature + 1.7 + oy, 2), qy = noise.fbm(x / feature - 5.2 + ox, y / feature + 8.3 + oy, 2);
        return noise.fbm(x / feature + 1.6 * qx + ox, y / feature + 1.6 * qy + oy, oct);
      };
    } else {
      raw = (x, y) => noise.fbm(x / feature + ox, y / feature + oy, oct);
    }
    const r = E.fieldRange(raw, W, H);
    const span = r.hi - r.lo;
    return (x, y) => { const v = (raw(x, y) - r.lo) / span; return v < 0 ? 0 : v > 1 ? 1 : v; };
  };

  /* ------------------------------ dithering ------------------------------ */
  function bayer(n) {            // n = 1,2,3 -> 2x2, 4x4, 8x8 (values 0..1)
    let m = [[0, 2], [3, 1]];
    for (let k = 1; k < n; k++) {
      const s = m.length, out = [];
      for (let y = 0; y < s * 2; y++) out.push(new Array(s * 2));
      for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
        const v = m[y][x] * 4;
        out[y][x] = v; out[y][x + s] = v + 2; out[y + s][x] = v + 3; out[y + s][x + s] = v + 1;
      }
      m = out;
    }
    const size = m.length, tot = size * size;
    const flat = new Float32Array(tot);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) flat[y * size + x] = (m[y][x] + 0.5) / tot;
    return { size, at: (x, y) => flat[(mod(y, size)) * size + mod(x, size)] };
  }
  E.bayer4 = bayer(2);
  E.bayer8 = bayer(3);

  /* ------------------------------ colour ------------------------------ */
  const rgbCache = new Map();
  function rgb(hex) {
    let c = rgbCache.get(hex);
    if (c) return c;
    let m = String(hex).replace('#', '');
    if (m.length === 3) m = m.split('').map(ch => ch + ch).join('');
    const n = parseInt(m.slice(0, 6), 16) || 0;
    c = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    rgbCache.set(hex, c);
    return c;
  }
  const toHex = (r, g, b) => '#' + [r, g, b].map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
  // mix(a, b, t): t = share of a
  function mix(a, b, t) {
    const x = rgb(a), y = rgb(b);
    return toHex(y[0] + (x[0] - y[0]) * t, y[1] + (x[1] - y[1]) * t, y[2] + (x[2] - y[2]) * t);
  }
  function lum(hex) {
    const c = rgb(hex).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  E.rgb = rgb; E.mix = mix; E.lum = lum; E.contrast = contrast;
  E.rgba = (hex, a) => { const c = rgb(hex); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; };

  function ensureContrast(c, bg, min) {
    if (contrast(c, bg) >= min) return c;
    const target = lum(bg) < 0.4 ? '#ffffff' : '#000000';
    for (let t = 0.9; t >= 0; t -= 0.1) { const m = mix(c, target, t); if (contrast(m, bg) >= min) return m; }
    return target;
  }

  /* ------------------------------ inks / colorways ------------------------------ */
  E.COLORWAYS = [
    { value: 'brand', label: 'Brand' },
    { value: 'mono', label: 'Mono' },
    { value: 'duotone', label: 'Duotone' },
    { value: 'night', label: 'Night' },
  ];

  // Tokens from a board-state: use the app's boardTokens() when present so the
  // pattern inks match the board exactly, else a local equivalent.
  function tokensFrom(src) {
    if (src && src.canvas && src.ink && src.primary) return src;              // already tokens
    const st = src || {};
    const colors = st.colors || st;
    if (typeof global.boardTokens === 'function' && st.colors && st.aesthetic) {
      let def = null;
      try { def = typeof global.aestheticByKey === 'function' ? global.aestheticByKey(st.aesthetic) : null; } catch (e) { def = null; }
      return global.boardTokens(st, def);
    }
    const dark = (st.bgMode || (src && src.isDark ? 'dark' : 'light')) === 'dark';
    const canvas = dark ? colors.neutralDark : colors.neutralLight;
    const ink = dark ? colors.neutralLight : colors.neutralDark;
    return {
      canvas, ink, primary: colors.primary, secondary: colors.secondary, accent: colors.accent,
      muted: mix(ink, canvas, 0.6), isDark: dark,
    };
  }

  Patterns.inksFor = function (src, colorway, opts) {
    const t = tokensFrom(src);
    const cw = colorway || 'brand';
    const g = t.canvas, k = t.ink;
    let ground, ink1, ink2, spark, deep;
    if (cw === 'mono') {
      ground = g; ink1 = k; ink2 = mix(k, g, 0.5); spark = k; deep = k;
    } else if (cw === 'duotone') {
      ground = g; ink1 = t.primary; ink2 = mix(t.primary, g, 0.42); deep = mix(t.primary, k, 0.55); spark = deep;
    } else if (cw === 'night') {
      ground = k; deep = g;
      ink1 = ensureContrast(t.primary, k, 2.6);
      ink2 = ensureContrast(t.secondary, k, 2.2);
      spark = ensureContrast(t.accent, k, 3);
    } else {
      ground = g; ink1 = t.primary; ink2 = t.secondary; spark = t.accent; deep = k;
    }
    const tints = !!(opts && opts.tints);
    const t1 = mix(ink1, ground, 0.38), t2 = mix(ink2, ground, 0.38), mute = mix(deep, ground, 0.4);
    const pool = tints ? [ink1, ink2, t1, t2] : [ink1, ink2];
    const cand = [ground, ink2, ink1, deep].concat(tints ? [t1, t2] : []);
    const ramp = [];
    cand.forEach(c => { if (!ramp.some(r => r === c)) ramp.push(c); });
    ramp.sort((a, b) => lum(b) - lum(a));
    return { ground, ink1, ink2, spark, deep, t1, t2, mute, pool, ramp, colorway: cw, tints, dark: lum(ground) < 0.3 };
  };

  // Spark budget: spark ink may cover at most `frac` of the area.
  E.budget = function (total) {
    let left = total;
    return { take(a) { if (a <= left) { left -= a; return true; } return false; }, left: () => left };
  };

  /* ------------------------------ geometry helpers ------------------------------ */
  // Keep the part of convex polygon `pts` (flat [x,y,...]) where nx*x+ny*y <= d.
  E.clipHalf = function (pts, nx, ny, d) {
    const out = [], n = pts.length / 2;
    for (let i = 0; i < n; i++) {
      const ax = pts[i * 2], ay = pts[i * 2 + 1], j = (i + 1) % n;
      const bx = pts[j * 2], by = pts[j * 2 + 1];
      const da = nx * ax + ny * ay - d, db = nx * bx + ny * by - d;
      if (da <= 0) out.push(ax, ay);
      if ((da < 0 && db > 0) || (da > 0 && db < 0)) {
        const t = da / (da - db);
        out.push(ax + (bx - ax) * t, ay + (by - ay) * t);
      }
    }
    return out;
  };
  // Strip a <= (x*cos + y*sin) <= b through a convex polygon.
  E.clipStrip = function (pts, ang, a, b) {
    const c = Math.cos(ang), s = Math.sin(ang);
    let o = E.clipHalf(pts, c, s, b);
    if (o.length >= 6) o = E.clipHalf(o, -c, -s, -a);
    return o;
  };
  E.ellipsePoly = function (cx, cy, rx, ry, steps) {
    steps = steps || 96;
    const pts = [];
    for (let i = 0; i < steps; i++) { const a = i / steps * Math.PI * 2; pts.push(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry); }
    return pts;
  };

  /* ------------------------------ surfaces ------------------------------ */
  const f2 = v => { const r = Math.round(v * 100) / 100; return String(r); };

  function CanvasSurface(ctx, W, H) {
    this.ctx = ctx; this.W = W; this.H = H; this.svg = false;
  }
  CanvasSurface.prototype = {
    _style(f) {
      if (f && f.__grad) {
        const c = this.ctx;
        const gr = c.createLinearGradient(f.x1, f.y1, f.x2, f.y2);
        f.stops.forEach(s => gr.addColorStop(clamp(s[0], 0, 1), s[1]));
        return gr;
      }
      return f;
    },
    grad(x1, y1, x2, y2, stops) { return { __grad: true, x1, y1, x2, y2, stops }; },
    fill(c) { const x = this.ctx; x.fillStyle = this._style(c); x.fillRect(0, 0, this.W, this.H); },
    rect(x, y, w, h, f, r) {
      const c = this.ctx; c.fillStyle = this._style(f);
      if (r > 0) {
        r = Math.min(r, w / 2, h / 2);
        c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
        c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); c.fill();
      } else c.fillRect(x, y, w, h);
    },
    circle(cx, cy, r, f) {
      const c = this.ctx; c.fillStyle = this._style(f);
      c.beginPath(); c.arc(cx, cy, r, 0, 6.283185307179586); c.fill();
    },
    ring(cx, cy, r, lw, s) {
      const c = this.ctx; c.strokeStyle = s; c.lineWidth = lw;
      c.beginPath(); c.arc(cx, cy, r, 0, 6.283185307179586); c.stroke();
    },
    poly(pts, f) {
      if (pts.length < 6) return;
      const c = this.ctx; c.fillStyle = this._style(f);
      c.beginPath(); c.moveTo(pts[0], pts[1]);
      for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
      c.closePath(); c.fill();
    },
    line(x1, y1, x2, y2, s, lw, cap) {
      const c = this.ctx; c.strokeStyle = s; c.lineWidth = lw; c.lineCap = cap || 'butt';
      c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
    },
    polyline(pts, s, lw, alpha, cap) {
      if (pts.length < 4) return;
      const c = this.ctx; c.strokeStyle = s; c.lineWidth = lw; c.lineCap = cap || 'round'; c.lineJoin = 'round';
      if (alpha != null && alpha < 1) c.globalAlpha = alpha;
      c.beginPath(); c.moveTo(pts[0], pts[1]);
      for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
      c.stroke();
      if (alpha != null && alpha < 1) c.globalAlpha = 1;
    },
    path(d, fill, stroke, lw) {
      const c = this.ctx, p = new Path2D(d);
      if (fill) { c.fillStyle = this._style(fill); c.fill(p); }
      if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 1; c.stroke(p); }
    },
    clipRect(x, y, w, h, fn) {
      const c = this.ctx; c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); fn(); c.restore();
    },
    group(alpha, fn) { const c = this.ctx; c.save(); c.globalAlpha = alpha; fn(); c.restore(); },
  };

  function SvgSurface(W, H) {
    this.W = W; this.H = H; this.svg = true; this.ctx = null;
    this.defs = []; this.body = []; this._id = 0;
  }
  SvgSurface.prototype = {
    _fill(f) {
      if (f && f.__grad) {
        if (!f._id) {
          f._id = 'g' + (++this._id);
          this.defs.push('<linearGradient id="' + f._id + '" gradientUnits="userSpaceOnUse" x1="' + f2(f.x1) + '" y1="' + f2(f.y1) + '" x2="' + f2(f.x2) + '" y2="' + f2(f.y2) + '">' +
            f.stops.map(s => '<stop offset="' + f2(clamp(s[0], 0, 1)) + '" stop-color="' + s[1] + '"/>').join('') + '</linearGradient>');
        }
        return 'url(#' + f._id + ')';
      }
      return f;
    },
    grad(x1, y1, x2, y2, stops) { return { __grad: true, x1, y1, x2, y2, stops }; },
    fill(c) { this.body.push('<rect width="' + this.W + '" height="' + this.H + '" fill="' + this._fill(c) + '"/>'); },
    rect(x, y, w, h, f, r) {
      this.body.push('<rect x="' + f2(x) + '" y="' + f2(y) + '" width="' + f2(w) + '" height="' + f2(h) + '"' + (r > 0 ? ' rx="' + f2(Math.min(r, w / 2, h / 2)) + '"' : '') + ' fill="' + this._fill(f) + '"/>');
    },
    circle(cx, cy, r, f) { this.body.push('<circle cx="' + f2(cx) + '" cy="' + f2(cy) + '" r="' + f2(r) + '" fill="' + this._fill(f) + '"/>'); },
    ring(cx, cy, r, lw, s) { this.body.push('<circle cx="' + f2(cx) + '" cy="' + f2(cy) + '" r="' + f2(r) + '" fill="none" stroke="' + s + '" stroke-width="' + f2(lw) + '"/>'); },
    poly(pts, f) {
      if (pts.length < 6) return;
      let s = '';
      for (let i = 0; i < pts.length; i += 2) s += f2(pts[i]) + ',' + f2(pts[i + 1]) + ' ';
      this.body.push('<polygon points="' + s.trim() + '" fill="' + this._fill(f) + '"/>');
    },
    line(x1, y1, x2, y2, s, lw, cap) {
      this.body.push('<line x1="' + f2(x1) + '" y1="' + f2(y1) + '" x2="' + f2(x2) + '" y2="' + f2(y2) + '" stroke="' + s + '" stroke-width="' + f2(lw) + '"' + (cap ? ' stroke-linecap="' + cap + '"' : '') + '/>');
    },
    polyline(pts, s, lw, alpha, cap) {
      if (pts.length < 4) return;
      let d = '';
      for (let i = 0; i < pts.length; i += 2) d += f2(pts[i]) + ',' + f2(pts[i + 1]) + ' ';
      this.body.push('<polyline points="' + d.trim() + '" fill="none" stroke="' + s + '" stroke-width="' + f2(lw) + '" stroke-linecap="' + (cap || 'round') + '" stroke-linejoin="round"' + (alpha != null && alpha < 1 ? ' stroke-opacity="' + f2(alpha) + '"' : '') + '/>');
    },
    path(d, fill, stroke, lw) {
      this.body.push('<path d="' + d + '" fill="' + (fill ? this._fill(fill) : 'none') + '"' + (stroke ? ' stroke="' + stroke + '" stroke-width="' + f2(lw || 1) + '"' : '') + '/>');
    },
    clipRect(x, y, w, h, fn) {
      const id = 'c' + (++this._id);
      this.defs.push('<clipPath id="' + id + '"><rect x="' + f2(x) + '" y="' + f2(y) + '" width="' + f2(w) + '" height="' + f2(h) + '"/></clipPath>');
      this.body.push('<g clip-path="url(#' + id + ')">'); fn(); this.body.push('</g>');
    },
    group(alpha, fn) { this.body.push('<g opacity="' + f2(alpha) + '">'); fn(); this.body.push('</g>'); },
    toString(extra, ground) {
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + this.W + ' ' + this.H + '" width="' + this.W + '" height="' + this.H + '">' +
        (this.defs.length ? '<defs>' + this.defs.join('') + '</defs>' : '') + this.body.join('') + (extra || '') + '</svg>';
    },
  };
  E.CanvasSurface = CanvasSurface;
  E.SvgSurface = SvgSurface;

  /* ------------------------------ grain / paper ------------------------------ */
  // Luminance grain + faint low-frequency mottling, written straight into the
  // pixels so it is deterministic and costs one read/write pass.
  function applyGrain(ctx, W, H, amount, seed) {
    if (amount <= 0.01) return;
    const id = ctx.getImageData(0, 0, W, H), d = id.data;
    const cell = Math.max(1, Math.round(Math.min(W, H) / 800));
    const amp = amount * 64, mot = amount * 14;
    const s1 = hashSeed(seed + ':grain') | 0, s2 = (s1 ^ 0x9e3779b1) | 0;
    const mw = Math.ceil(W / 24) + 2, mh = Math.ceil(H / 24) + 2;
    const mt = new Float32Array(mw * mh);
    for (let j = 0; j < mh; j++) for (let i = 0; i < mw; i++) mt[j * mw + i] = ihash(i, j, s2) - 0.5;
    for (let y = 0; y < H; y++) {
      const gy = (y / cell) | 0, my = y / 24, my0 = my | 0, fy = my - my0;
      for (let x = 0; x < W; x++) {
        const n = (ihash((x / cell) | 0, gy, s1) - 0.5) * amp;
        const mx = x / 24, mx0 = mx | 0, fx = mx - mx0;
        const a = mt[my0 * mw + mx0], b = mt[my0 * mw + mx0 + 1], c = mt[(my0 + 1) * mw + mx0], e = mt[(my0 + 1) * mw + mx0 + 1];
        const m = (a + (b - a) * fx + (c - a) * fy + (a - b - c + e) * fx * fy) * mot;
        const v = n + m, i = (y * W + x) * 4;
        const r = d[i] + v, g = d[i + 1] + v, bl = d[i + 2] + v;
        d[i] = r < 0 ? 0 : r > 255 ? 255 : r;
        d[i + 1] = g < 0 ? 0 : g > 255 ? 255 : g;
        d[i + 2] = bl < 0 ? 0 : bl > 255 ? 255 : bl;
      }
    }
    ctx.putImageData(id, 0, 0);
  }
  E.applyGrain = applyGrain;

  function grainSVG(amount, seed, W, H) {
    if (amount <= 0.01) return '';
    const fs = (hashSeed(seed + ':grain') % 997) + 1;
    return '<filter id="pg" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="' + fs + '" result="n"/>' +
      '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 1.6 -0.3"/></filter>' +
      '<rect width="' + W + '" height="' + H + '" filter="url(#pg)" opacity="' + f2(amount * 0.45) + '" style="mix-blend-mode:overlay"/>';
  }

  /* ------------------------------ registry ------------------------------ */
  const COMMON = [
    { key: 'scale', label: 'Scale', type: 'range', min: 0.5, max: 2.5, step: 0.05, default: 1, common: true },
    { key: 'grain', label: 'Grain', type: 'range', min: 0, max: 1, step: 0.05, default: 0.15, common: true },
    { key: 'tints', label: '+ tints', type: 'toggle', default: false, common: true },
    { key: 'tone', label: 'Strength', type: 'range', min: 0, max: 1, step: 0.05, default: 1, common: true },
  ];

  Patterns.register = function (def) {
    if (!def || !def.key || typeof def.render !== 'function') throw new Error('Patterns.register: key and render required');
    def.params = def.params || [];
    def.ink = def.ink || ['ground', 'ink1'];
    families.set(def.key, def);
    return def;
  };
  Patterns.get = key => families.get(key) || null;

  function schemaOf(fam) {
    const over = fam.common || {};
    return fam.params.concat(COMMON.map(c => (over[c.key] != null ? Object.assign({}, c, { default: over[c.key] }) : c)));
  }
  Patterns.schema = key => { const f = families.get(key); return f ? schemaOf(f) : []; };
  Patterns.defaults = function (key) {
    const out = {};
    Patterns.schema(key).forEach(s => { out[s.key] = s.default; });
    return out;
  };
  // Picker categories, in display order. Every family carries one of these in `category`.
  Patterns.CATEGORIES = ['Halftone & print', 'Stripes & op-art', 'Pixel & grid', 'Organic & cellular',
    'Glitch & signal', 'Collage & poster', 'Botanical & line', 'Soft color'];
  Patterns.list = function () {
    return Array.from(families.values()).map(f => ({
      key: f.key, name: f.name, blurb: f.blurb, category: f.category || 'Soft color', ink: f.ink, vector: !!f.vector, seamless: !!f.seamless,
      params: schemaOf(f), defaults: Patterns.defaults(f.key),
    }));
  };

  function optValue(o) { return o && typeof o === 'object' ? o.value : o; }
  function resolveParams(fam, params) {
    const out = {};
    schemaOf(fam).forEach(s => {
      let v = params && params[s.key] != null ? params[s.key] : s.default;
      if (s.type === 'range') { v = Number(v); if (!isFinite(v)) v = s.default; v = clamp(v, s.min, s.max); }
      else if (s.type === 'toggle') v = !!v;
      else if (s.type === 'select') { const ok = (s.options || []).some(o => optValue(o) === v); if (!ok) v = s.default; }
      out[s.key] = v;
    });
    return out;
  }
  Patterns.resolve = (key, params) => resolveParams(families.get(key), params);

  function sizeFor(fam, opts, canvas) {
    const dpr = opts.dpr || (global.devicePixelRatio || 1);
    let cw = opts.width, ch = opts.height;
    if (!cw && canvas) { cw = canvas.clientWidth || canvas.width || 1200; }
    if (!ch && canvas) { ch = canvas.clientHeight || canvas.height || Math.round(cw * 2 / 3); }
    if (!cw) cw = 1200; if (!ch) ch = 800;
    let W = Math.max(1, Math.round(cw * dpr)), H = Math.max(1, Math.round(ch * dpr));
    const maxPx = opts.maxPixels || 36e6;
    if (W * H > maxPx) { const k = Math.sqrt(maxPx / (W * H)); W = Math.round(W * k); H = Math.round(H * k); }
    return { W, H, cw, ch, dpr };
  }

  function makeEnv(W, H, seed, key, opts, tone) {
    const tile = !!opts.tile;
    const sparkK = clamp(tone, 0.5, 1);
    return {
      W, H, tile, seed, tone, sparkK,
      u: Math.sqrt(W * H) / 100 * (tile ? 3 : 1),
      dpr: opts.dpr || 1,
      spark: E.budget(W * H * 0.045 * sparkK),
    };
  }

  // The inks a family actually draws with: the "+ tints" toggle honoured even when the
  // caller built inks without it, then quiet tone applied (every non-ground ink moves
  // toward the ground; spark keeps its colour).
  function finalizeInks(inks, p) {
    const ink = Object.assign({}, inks);
    if (p.tints !== ink.tints) {
      ink.tints = p.tints;
      ink.pool = p.tints ? [ink.ink1, ink.ink2, ink.t1, ink.t2] : [ink.ink1, ink.ink2];
      const cand = [ink.ground, ink.ink2, ink.ink1, ink.deep].concat(p.tints ? [ink.t1, ink.t2] : []);
      const ramp = []; cand.forEach(c => { if (ramp.indexOf(c) < 0) ramp.push(c); });
      ramp.sort((a, b) => lum(b) - lum(a)); ink.ramp = ramp;
    }
    const tone = clamp(Number(p.tone), 0, 1);
    if (tone < 1) {
      const q = c => mix(c, ink.ground, tone);
      ink.ink1 = q(ink.ink1); ink.ink2 = q(ink.ink2); ink.deep = q(ink.deep);
      ink.t1 = q(ink.t1); ink.t2 = q(ink.t2); ink.mute = q(ink.mute);
      ink.pool = p.tints ? [ink.ink1, ink.ink2, ink.t1, ink.t2] : [ink.ink1, ink.ink2];
      const cand = [ink.ground, ink.ink2, ink.ink1, ink.deep].concat(p.tints ? [ink.t1, ink.t2] : []);
      const ramp = []; cand.forEach(c => { if (ramp.indexOf(c) < 0) ramp.push(c); });
      ramp.sort((a, b) => lum(b) - lum(a)); ink.ramp = ramp;
    }
    return { ink, tone };
  }

  Patterns.finalInks = function (key, params, inks) {
    const fam = families.get(key);
    if (!fam) return null;
    return finalizeInks(inks, resolveParams(fam, params)).ink;
  };

  function runFamily(surface, fam, W, H, params, inks, seed, opts) {
    const p = resolveParams(fam, params);
    const { ink, tone } = finalizeInks(inks, p);
    const env = makeEnv(W, H, seed, fam.key, opts, tone);
    const rng = makeRng(seed, fam.key);
    const noise = makeNoise(hashSeed(seed) + ':' + fam.key);
    fam.render(surface, W, H, p, ink, rng, noise, env);
    return p;
  }

  Patterns.render = function (canvas, key, params, inks, seed, opts) {
    const fam = families.get(key);
    if (!fam) throw new Error('Unknown pattern: ' + key);
    opts = opts || {};
    const t0 = (global.performance || Date).now();
    const { W, H, cw, ch, dpr } = sizeFor(fam, opts, canvas);
    opts = Object.assign({}, opts, { dpr });
    canvas.width = W; canvas.height = H;
    if (opts.setStyle !== false && opts.width) { canvas.style.width = cw + 'px'; canvas.style.height = ch + 'px'; }
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.imageSmoothingEnabled = true;
    const surface = new CanvasSurface(ctx, W, H);
    const p = runFamily(surface, fam, W, H, params, inks, seed, opts);
    if (p.grain > 0) applyGrain(ctx, W, H, p.grain, seed);
    return { ms: (global.performance || Date).now() - t0, w: W, h: H };
  };

  Patterns.renderSVG = function (key, params, inks, seed, opts) {
    const fam = families.get(key);
    if (!fam || !fam.vector) return null;
    opts = Object.assign({ dpr: 1 }, opts || {});
    if (opts.tile) {
      // seamless repeating tile: only for families that wrap, and without the grain
      // filter (it would not tile)
      if (!fam.seamless) return null;
      params = Object.assign({}, params, { grain: 0 });
      if (!opts.width && !opts.height) opts.width = opts.height = 160;
    }
    const { W, H } = sizeFor(fam, opts, null);
    const surface = new SvgSurface(W, H);
    const p = runFamily(surface, fam, W, H, params, inks, seed, opts);
    return surface.toString(grainSVG(p.grain, seed, W, H));
  };

  Patterns.tileSVG = function (key, params, inks, seed, size) {
    size = clamp(Math.round(size || 160), 16, 512);
    return Patterns.renderSVG(key, params, inks, seed, { width: size, height: size, tile: true });
  };

  Patterns.tileCSS = function (key, params, inks, seed, size) {
    const fam = families.get(key);
    if (!fam || !fam.seamless || !global.document) return null;
    size = clamp(Math.round(size || 128), 16, 512);
    const c = global.document.createElement('canvas');
    Patterns.render(c, key, Object.assign({}, params, { grain: 0 }), inks, seed, { width: size, height: size, dpr: 2, tile: true, setStyle: false });
    let url = c.toDataURL('image/png');
    if (url.length > 200000) {      // keep the data URI small enough to paste
      Patterns.render(c, key, Object.assign({}, params, { grain: 0 }), inks, seed, { width: size, height: size, dpr: 1, tile: true, setStyle: false });
      url = c.toDataURL('image/png');
    }
    return 'background: ' + inks.ground + ' url("' + url + '") 0 0 / ' + size + 'px ' + size + 'px;';
  };

  /* ------------------------------ misc helpers for families ------------------------------ */
  // Draw fn at (x,y) and at wrapped copies, so shapes crossing a tile edge
  // reappear on the opposite edge.
  E.wrapDraw = function (env, W, H, x, y, r, fn) {
    fn(x, y);
    if (!env.tile) return;
    const xs = [0], ys = [0];
    if (x - r < 0) xs.push(W); if (x + r > W) xs.push(-W);
    if (y - r < 0) ys.push(H); if (y + r > H) ys.push(-H);
    for (const dx of xs) for (const dy of ys) if (dx || dy) fn(x + dx, y + dy);
  };

  // Snap a requested cell size so an integer number of cells fills `len`.
  E.fit = (len, cell) => len / Math.max(1, Math.round(len / cell));

  E.sel = (arr) => arr.map(a => (typeof a === 'string' ? { value: a, label: a.charAt(0).toUpperCase() + a.slice(1) } : a));

  /* ------------------------------ round 2 helpers (PF2) ------------------------------ */
  // Additive helpers for the organic2 / glitch2 / collage2 families. Namespace: E.r2.
  const r2 = E.r2 = {};
  // "#rrggbb" -> packed little-endian RGBA uint32 (for Uint32Array views over ImageData).
  r2.pack = function (hex) { const c = rgb(hex); return (255 << 24) | (c[2] << 16) | (c[1] << 8) | c[0]; };
  // Interpolated colour table: n packed entries across the hex stops.
  r2.lut = function (stops, n) {
    const out = new Uint32Array(n);
    for (let i = 0; i < n; i++) {
      const t = n > 1 ? i / (n - 1) : 0, f = t * (stops.length - 1), k = Math.min(stops.length - 2, Math.floor(f));
      out[i] = stops.length < 2 ? r2.pack(stops[0]) : r2.pack(mix(stops[k + 1], stops[k], clamp(f - k, 0, 1)));
    }
    return out;
  };
  // Internal-resolution pixel buffer: at most maxPx pixels covering W x H. put() blits it
  // (smooth=false keeps hard pixels, true gives anti-aliased upscaling).
  r2.buf = function (W, H, maxPx) {
    const sc = Math.max(1, Math.sqrt(W * H / maxPx));
    const lw = Math.max(1, Math.ceil(W / sc)), lh = Math.max(1, Math.ceil(H / sc));
    const cv = global.document.createElement('canvas'); cv.width = lw; cv.height = lh;
    const c = cv.getContext('2d');
    const id = c.createImageData(lw, lh);
    return {
      lw, lh, sc, cv, c, id, d32: new Uint32Array(id.data.buffer),
      put(g, smooth) {
        c.putImageData(id, 0, 0);
        const ctx = g.ctx; ctx.save(); ctx.imageSmoothingEnabled = !!smooth; ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(cv, 0, 0, lw, lh, 0, 0, lw * sc, lh * sc); ctx.restore();
      },
    };
  };
  // Scalar field sampled on a coarse lattice (step px) and read back bilinearly,
  // so hard-posterised contours stay smooth at full resolution.
  r2.grid = function (W, H, step, fn) {
    const gw = Math.ceil(W / step) + 2, gh = Math.ceil(H / step) + 2, d = new Float32Array(gw * gh);
    for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) d[j * gw + i] = fn(i * step, j * step);
    return {
      d, gw, gh, step,
      at(x, y) {
        const fx = x / step, fy = y / step;
        let i = fx | 0, j = fy | 0; if (i > gw - 2) i = gw - 2; if (j > gh - 2) j = gh - 2; if (i < 0) i = 0; if (j < 0) j = 0;
        const tx = fx - i, ty = fy - j, k = j * gw + i;
        const a = d[k], b = d[k + 1], c = d[k + gw], e = d[k + gw + 1];
        return a + (b - a) * tx + (c - a) * ty + (a - b - c + e) * tx * ty;
      },
    };
  };
  // Ragged blob outline: radius r perturbed by noise, `n` points, returns flat [x,y,...].
  r2.blob = function (noise, cx, cy, rx, ry, rough, n, seedOff) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = i / n * 6.283185307179586, ca = Math.cos(a), sa = Math.sin(a);
      const k = 1 + rough * (noise.fbm(ca * 1.1 + seedOff, sa * 1.1 + seedOff * 0.7, 3) * 0.8 + noise.n2(ca * 4 + seedOff, sa * 4) * 0.22);
      pts.push(cx + ca * rx * k, cy + sa * ry * k);
    }
    return pts;
  };
  // Snap an outline to a grid of `cell` px, inserting corners so edges become stairs.
  r2.stair = function (pts, cell) {
    const out = []; let px = null, py = null;
    for (let i = 0; i < pts.length; i += 2) {
      const x = Math.round(pts[i] / cell) * cell, y = Math.round(pts[i + 1] / cell) * cell;
      if (px === null) { out.push(x, y); }
      else if (x !== px || y !== py) { if (x !== px && y !== py) out.push(x, py); out.push(x, y); }
      px = x; py = y;
    }
    return out;
  };
  // x positions where the horizontal line y crosses polygon pts (even-odd), sorted.
  r2.spans = function (pts, y) {
    const xs = [], n = pts.length / 2;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n, ay = pts[i * 2 + 1], by = pts[j * 2 + 1];
      if ((ay <= y && by > y) || (by <= y && ay > y)) xs.push(pts[i * 2] + (y - ay) / (by - ay) * (pts[j * 2] - pts[i * 2]));
    }
    return xs.sort((a, b) => a - b);
  };
  E.r2.pointInPoly = function (pts, x, y) {
    let c = false; const n = pts.length / 2;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = pts[i * 2], yi = pts[i * 2 + 1], xj = pts[j * 2], yj = pts[j * 2 + 1];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  };

  /* ------------------------------ round 2 helpers (PF1) ------------------------------ */
  // Additive only. Namespace E.pf1, used by families/print2.js, op2.js and pixel2.js.
  E.pf1 = {
    // Ink ladder starting at the ground and moving away from it in luminance
    // (ground first, the most contrasting ink last).
    ladder(inks) {
      const others = [inks.ink2, inks.ink1, inks.deep].concat(inks.tints ? [inks.t1, inks.t2] : []);
      others.sort((a, b) => Math.abs(lum(a) - lum(inks.ground)) - Math.abs(lum(b) - lum(inks.ground)));
      const out = [inks.ground];
      others.forEach(c => { if (out.indexOf(c) < 0) out.push(c); });
      return out;
    },
    // n colours stepped along `list` (nearest stop; no mixing, so inks stay pure).
    bands(list, n) {
      const m = list.length, out = [];
      if (n <= 1) return [list[0]];
      for (let i = 0; i < n; i++) {
        const pos = i / (n - 1) * (m - 1), a = Math.floor(pos), f = pos - a;
        if (a >= m - 1) out.push(list[m - 1]);
        else out.push(f < 0.5 ? list[a] : list[a + 1]);
      }
      return out;
    },
    darkest(list) { return list.reduce((a, b) => (lum(b) < lum(a) ? b : a)); },
    lightest(list) { return list.reduce((a, b) => (lum(b) > lum(a) ? b : a)); },
    // Bilinear sampler of fn(x,y) cached on a coarse grid (step px): cheap smooth fields.
    sampler(fn, W, H, step) {
      const gw = Math.ceil(W / step) + 2, gh = Math.ceil(H / step) + 2, a = new Float32Array(gw * gh);
      for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) a[j * gw + i] = fn(i * step, j * step);
      return (x, y) => {
        let fx = x / step, fy = y / step;
        fx = fx < 0 ? 0 : fx > gw - 1.001 ? gw - 1.001 : fx; fy = fy < 0 ? 0 : fy > gh - 1.001 ? gh - 1.001 : fy;
        const i = fx | 0, j = fy | 0, tx = fx - i, ty = fy - j, k = j * gw + i;
        return (a[k] * (1 - tx) + a[k + 1] * tx) * (1 - ty) + (a[k + gw] * (1 - tx) + a[k + gw + 1] * tx) * ty;
      };
    },
    // Draw a cell grid (colour index per cell, <0 = skip) as horizontal runs of
    // pixel-snapped rects, so neighbours never leave hairline seams.
    cells(g, idx, nx, ny, x0, y0, cw, ch, palette) {
      const ov = g.svg ? 1.5 : 0;      // SVG only: overlap neighbours so scaled exports show no hairlines
      for (let j = 0; j < ny; j++) {
        const ya = Math.round(y0 + j * ch), yb = Math.round(y0 + (j + 1) * ch);
        let i = 0;
        while (i < nx) {
          const c = idx[j * nx + i];
          if (c < 0) { i++; continue; }
          let e = i + 1;
          while (e < nx && idx[j * nx + e] === c) e++;
          const xa = Math.round(x0 + i * cw), xb = Math.round(x0 + e * cw);
          g.rect(xa, ya, xb - xa + ov, yb - ya + ov, palette[c]);
          i = e;
        }
      }
    },
    // 3x5 pixel glyphs for tick labels (abstract coordinates, not words).
    GLYPH: {
      '0': '111101101101111', '1': '010110010010111', '2': '111001111100111', '3': '111001111001111',
      '4': '101101111001001', '5': '111100111001111', '6': '111100111101111', '7': '111001010010010',
      '8': '111101111101111', '9': '111101111001111', 'A': '111101111101101', 'B': '110101110101110',
      'C': '111100100100111', 'D': '110101101101110', 'E': '111100111100111', 'F': '111100111100100',
      'N': '101111111111101', 'X': '101101010101101', 'Y': '101101010010010', '-': '000000111000000',
    },
    // Draw a string of glyphs at pixel size s; returns its width.
    text(g, str, x, y, s, col) {
      const G = E.pf1.GLYPH;
      for (let k = 0; k < str.length; k++) {
        const bits = G[str[k]];
        if (bits) for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) if (bits[r * 3 + c] === '1') g.rect(x + (k * 4 + c) * s, y + r * s, s, s, col);
      }
      return str.length * 4 * s - s;
    },
  };

})(window);
