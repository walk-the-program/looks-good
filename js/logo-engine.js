/* ---------------------------------------------------------------------
   logo-engine.js — Logo Studio's shaped-glyph + outline engine. Builds a logo as real
   glyph outlines, offline: HarfBuzz (wasm, vendor/harfbuzz/) does the shaping and
   draws the outlines, so kerning and variable-font axes are exact, and the preview
   and the export come from the same geometry.

   Layers:
     - pure functions: lockup(recipe), monogram(recipe), toSVG(layout). Data in, data
       out; the editor UI only has to build recipes. They need loaded faces but touch
       no DOM.
     - font loading: ready(), face(). Fonts are the WOFF 1.0 copies in fonts/woff/
       (dev/logo-fonts.py), found through fonts/logo-manifest.json. WOFF 1.0 tables are
       plain zlib, so the browser's DecompressionStream unwraps them into an sfnt that
       HarfBuzz reads.
     - browser glue: toPNG(svg, widthPx).

   Units: 1 em of the main word = 1000. y runs down (SVG). The Nominal Studios files in
   docs/mockups/nominal-logo/ (build_logo.py) are the reference output; tests/
   logo-engine.html checks this engine against them.

   Lockup recipe:
     { word, wordFont:{family,weight,style,axes}, tracking, case:'upper'|'lower'|'none',
       device:{type:'strip'|'none', crop, height},
       secondary:{text, font, size, gap, spread, align:'left'|'center'|'right', tracking},
       monogram:{tile, scale, strip} }   // monogram block optional (1000, .95, .24)

   Plain <script>, no modules. Loads vendor/harfbuzz/index.js with import(), so it needs
   to be served over http(s) or the app:// scheme, not file://.
------------------------------------------------------------------------ */

const LogoEngine = (function () {
  'use strict';

  // Folder that holds fonts/ and vendor/ (the parent of js/), found from this script's URL.
  let root = '';
  try {
    if (document.currentScript && document.currentScript.src) root = new URL('../', document.currentScript.src).href;
  } catch (e) { root = ''; }
  function configure(opts) { if (opts && opts.root != null) root = opts.root; }

  /* ======================= 1. loading: wasm, manifest, fonts ======================= */

  let hbPromise = null;
  let manifestPromise = null;
  const faceCache = new Map();

  function ready() {
    if (!hbPromise) hbPromise = import(root + 'vendor/harfbuzz/index.js').catch(function (e) {
      hbPromise = null;
      throw new Error('LogoEngine: could not load HarfBuzz (' + e.message + ')');
    });
    return hbPromise;
  }

  function manifest() {
    if (!manifestPromise) manifestPromise = fetch(root + 'fonts/logo-manifest.json').then(function (r) {
      if (!r.ok) throw new Error('LogoEngine: fonts/logo-manifest.json not found (' + r.status + ')');
      return r.json();
    }).then(function (m) { return m.fonts; }).catch(function (e) { manifestPromise = null; throw e; });
    return manifestPromise;
  }

  // Picks the manifest entry for a family/style/weight: a range that contains the weight,
  // else the closest static weight. Entries sharing one file (variable font) are equal.
  function pickEntry(entries, family, style, weight) {
    const same = entries.filter(function (e) { return e.family.toLowerCase() === family.toLowerCase(); });
    if (!same.length) throw new Error('LogoEngine: font family "' + family + '" is not in the logo font list');
    const styled = same.filter(function (e) { return e.style === style; });
    const pool = styled.length ? styled : same;
    let best = null, bestDist = Infinity;
    pool.forEach(function (e) {
      const lo = Array.isArray(e.weight) ? e.weight[0] : e.weight;
      const hi = Array.isArray(e.weight) ? e.weight[1] : e.weight;
      const dist = weight < lo ? lo - weight : weight > hi ? weight - hi : 0;
      if (dist < bestDist) { best = e; bestDist = dist; }
    });
    return best;
  }

  async function inflate(bytes) {
    const ds = new DecompressionStream('deflate');
    const stream = new Blob([bytes]).stream().pipeThrough(ds);
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }

  // WOFF 1.0 -> sfnt. Header 44 bytes, then 20 bytes per table: tag, offset, compLength,
  // origLength, origChecksum. A table is zlib-compressed when compLength < origLength.
  async function woffToSfnt(buf) {
    const dv = new DataView(buf);
    if (dv.getUint32(0) !== 0x774F4646) throw new Error('LogoEngine: font file is not WOFF 1.0');
    const flavor = dv.getUint32(4);
    const n = dv.getUint16(12);
    const tables = [];
    for (let i = 0; i < n; i++) {
      const p = 44 + i * 20;
      const t = {
        tag: dv.getUint32(p), off: dv.getUint32(p + 4), comp: dv.getUint32(p + 8),
        len: dv.getUint32(p + 12), sum: dv.getUint32(p + 16)
      };
      const raw = new Uint8Array(buf, t.off, t.comp);
      t.data = t.comp < t.len ? await inflate(raw) : raw;
      if (t.data.length !== t.len) throw new Error('LogoEngine: corrupt WOFF table');
      tables.push(t);
    }
    tables.sort(function (a, b) { return a.tag - b.tag; });
    let size = 12 + 16 * n;
    tables.forEach(function (t) { t.pos = size; size += (t.len + 3) & ~3; });
    const out = new Uint8Array(size);
    const od = new DataView(out.buffer);
    let pow = 1, log = 0;
    while (pow * 2 <= n) { pow *= 2; log++; }
    od.setUint32(0, flavor);
    od.setUint16(4, n);
    od.setUint16(6, pow * 16);
    od.setUint16(8, log);
    od.setUint16(10, n * 16 - pow * 16);
    tables.forEach(function (t, i) {
      const p = 12 + i * 16;
      od.setUint32(p, t.tag);
      od.setUint32(p + 4, t.sum);
      od.setUint32(p + 8, t.pos);
      od.setUint32(p + 12, t.len);
      out.set(t.data, t.pos);
    });
    return out;
  }

  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

  // Loads (and caches) a face: { family, key, upem, capHeight, hbFont, entry, variations }.
  // axes: explicit variation settings, e.g. { opsz: 14 }. weight drives wght when the
  // font has that axis and axes.wght is not given.
  async function face(family, opts) {
    opts = opts || {};
    const weight = opts.weight == null ? 400 : opts.weight;
    const style = opts.style || 'normal';
    const axes = opts.axes || {};
    const hb = await ready();
    const entry = pickEntry(await manifest(), family, style, weight);
    const wanted = {};
    Object.keys(entry.axes || {}).forEach(function (tag) {
      const r = entry.axes[tag];                       // [min, default, max]
      let v = axes[tag] != null ? axes[tag] : (tag === 'wght' ? weight : r[1]);
      wanted[tag] = clamp(v, r[0], r[2]);
    });
    const key = entry.file + '|' + JSON.stringify(wanted);
    if (faceCache.has(key)) return faceCache.get(key);
    const p = (async function () {
      const res = await fetch(root + 'fonts/' + entry.file);
      if (!res.ok) throw new Error('LogoEngine: could not load ' + entry.file + ' (' + res.status + ')');
      const sfnt = await woffToSfnt(await res.arrayBuffer());
      const hbFace = new hb.Face(new hb.Blob(sfnt));
      const hbFont = new hb.Font(hbFace);
      const tags = Object.keys(wanted);
      if (tags.length) hbFont.setVariations(tags.map(function (t) { return new hb.Variation(t, wanted[t]); }));
      const upem = hbFace.upem;
      let cap = hbFont.getMetricPosition(hb.MetricsTag.CAP_HEIGHT);
      if (cap == null) cap = 0.7 * upem;
      return { family: family, key: key, upem: upem, capHeight: cap, hbFont: hbFont, entry: entry, variations: wanted, hb: hb };
    })();
    faceCache.set(key, p);
    p.catch(function () { faceCache.delete(key); });
    return p;
  }

  /* ======================= 2. shaping ======================= */

  // Shapes text. Returns { glyphs:[{gid, x, dx, advance}], width } in units of a
  // 1000-unit em: x is the pen position (tracking included), dx the glyph's own offset,
  // width excludes the trailing tracking. features: { liga:false, ... } or [{tag,value}].
  function shape(f, text, opts) {
    opts = opts || {};
    if (!text) throw new Error('LogoEngine: nothing to shape (empty text)');
    const hb = f.hb;
    const feats = Object.assign({ kern: true, liga: false }, Array.isArray(opts.features) ? {} : (opts.features || {}));
    const list = Object.keys(feats).map(function (t) { return new hb.Feature(t, feats[t] ? Number(feats[t]) : 0); });
    if (Array.isArray(opts.features)) opts.features.forEach(function (x) { list.push(new hb.Feature(x.tag, x.value)); });
    const buf = new hb.Buffer();
    buf.addText(text);                 // buffers are freed by the wasm wrapper's finalizer
    buf.guessSegmentProperties();
    hb.shape(f.hbFont, buf, list);
    const infos = buf.getGlyphInfos();
    const poss = buf.getGlyphPositions();
    const k = 1000 / f.upem;
    const tracking = opts.tracking || 0;
    const chars = Array.from(text);
    const glyphs = [];
    let x = 0;
    infos.forEach(function (info, i) {
      const gid = info.codepoint;
      if (gid === 0 && !/^\s*$/.test(chars[info.cluster] || chars[i] || '')) {
        throw new Error('LogoEngine: ' + f.family + ' has no glyph for "' + (chars[info.cluster] || chars[i]) + '" in "' + text + '"');
      }
      const adv = poss[i].xAdvance * k;
      glyphs.push({ gid: gid, x: x, dx: poss[i].xOffset * k, advance: adv });
      x += adv + (i < infos.length - 1 ? tracking : 0);
    });
    return { glyphs: glyphs, width: x };
  }

  /* ======================= 3. outlines ======================= */

  function num(v) {
    const s = v.toFixed(3);
    return s.indexOf('.') < 0 ? s : s.replace(/0+$/, '').replace(/\.$/, '');
  }

  // Exact extents of a quadratic / cubic along one axis (control points a..d).
  function quadExtrema(a, b, c) {
    const den = a - 2 * b + c;
    if (Math.abs(den) < 1e-12) return [];
    const t = (a - b) / den;
    return t > 0 && t < 1 ? [t] : [];
  }
  function cubicExtrema(a, b, c, d) {
    const A = -a + 3 * b - 3 * c + d, B = 2 * (a - 2 * b + c), C = b - a;
    const out = [];
    if (Math.abs(A) < 1e-12) {
      if (Math.abs(B) > 1e-12) out.push(-C / B);
    } else {
      const disc = B * B - 4 * A * C;
      if (disc >= 0) {
        const s = Math.sqrt(disc);
        out.push((-B + s) / (2 * A), (-B - s) / (2 * A));
      }
    }
    return out.filter(function (t) { return t > 0 && t < 1; });
  }
  const q = function (t, a, b, c) { const u = 1 - t; return u * u * a + 2 * u * t * b + t * t * c; };
  const cu = function (t, a, b, c, d) { const u = 1 - t; return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d; };

  // Draws glyph gid at scale s, pen x dx, baseline y (font y is up, SVG y is down).
  // Returns { d, bounds:[x0,y0,x1,y1] | null } — the counterpart of build_logo.py's Ink.glyph.
  function placeGlyph(f, gid, s, dx, baseline) {
    const src = f.hbFont.glyphToPath(gid);
    if (!src) return { d: '', bounds: null };
    let b = null;
    const grow = function (x, y) {
      if (!b) b = [x, y, x, y];
      else { if (x < b[0]) b[0] = x; if (y < b[1]) b[1] = y; if (x > b[2]) b[2] = x; if (y > b[3]) b[3] = y; }
    };
    let d = '', cx = 0, cy = 0, sx = 0, sy = 0;
    const X = function (x) { return s * x + dx; };
    const Y = function (y) { return baseline - s * y; };
    const re = /([MLQCZ])([^MLQCZ]*)/g;
    let m;
    while ((m = re.exec(src))) {
      const v = m[2].split(/[\s,]+/).filter(Boolean).map(Number);
      switch (m[1]) {
        case 'M':
          cx = sx = v[0]; cy = sy = v[1];
          d += 'M' + num(X(cx)) + ' ' + num(Y(cy)); grow(X(cx), Y(cy)); break;
        case 'L':
          cx = v[0]; cy = v[1];
          d += 'L' + num(X(cx)) + ' ' + num(Y(cy)); grow(X(cx), Y(cy)); break;
        case 'Q': {
          d += 'Q' + num(X(v[0])) + ' ' + num(Y(v[1])) + ' ' + num(X(v[2])) + ' ' + num(Y(v[3]));
          grow(X(v[2]), Y(v[3]));
          quadExtrema(cx, v[0], v[2]).forEach(function (t) { grow(X(q(t, cx, v[0], v[2])), Y(q(t, cy, v[1], v[3]))); });
          quadExtrema(cy, v[1], v[3]).forEach(function (t) { grow(X(q(t, cx, v[0], v[2])), Y(q(t, cy, v[1], v[3]))); });
          cx = v[2]; cy = v[3]; break;
        }
        case 'C': {
          d += 'C' + num(X(v[0])) + ' ' + num(Y(v[1])) + ' ' + num(X(v[2])) + ' ' + num(Y(v[3])) + ' ' + num(X(v[4])) + ' ' + num(Y(v[5]));
          grow(X(v[4]), Y(v[5]));
          const at = function (t) { return [X(cu(t, cx, v[0], v[2], v[4])), Y(cu(t, cy, v[1], v[3], v[5]))]; };
          cubicExtrema(cx, v[0], v[2], v[4]).concat(cubicExtrema(cy, v[1], v[3], v[5])).forEach(function (t) {
            const p = at(t); grow(p[0], p[1]);
          });
          cx = v[4]; cy = v[5]; break;
        }
        case 'Z': d += 'Z'; cx = sx; cy = sy; break;
      }
    }
    return { d: d, bounds: b };
  }

  // Outline of one glyph in font units (y up), plus its bounds — for callers that
  // want to apply their own transform.
  function glyphPath(f, gid) {
    const r = placeGlyph(f, gid, 1, 0, 0);       // y flipped by placeGlyph; undo for bounds
    return { d: f.hbFont.glyphToPath(gid), bounds: r.bounds && [r.bounds[0], -r.bounds[3], r.bounds[2], -r.bounds[1]] };
  }

  /* ======================= 4. layout ======================= */

  function Ink() { this.d = []; this.paths = []; this.rects = []; this.bounds = null; }
  Ink.prototype.grow = function (b) {
    if (!b) return;
    const a = this.bounds;
    this.bounds = a ? [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])] : b.slice();
  };
  Ink.prototype.glyph = function (f, gid, scale, dx, baseline) {
    const g = placeGlyph(f, gid, scale, dx, baseline);
    if (g.d) { this.d.push(g.d); this.paths.push(g.d); }
    this.grow(g.bounds);
  };
  Ink.prototype.rect = function (x0, y0, x1, y1) {
    const f2 = function (v) { return v.toFixed(2); };
    this.d.push('M' + f2(x0) + ' ' + f2(y0) + 'H' + f2(x1) + 'V' + f2(y1) + 'H' + f2(x0) + 'Z');
    this.rects.push({ x: x0, y: y0, width: x1 - x0, height: y1 - y0 });
    this.grow([x0, y0, x1, y1]);
  };

  function applyCase(text, c) {
    return c === 'upper' ? text.toUpperCase() : c === 'lower' ? text.toLowerCase() : text;
  }

  function loadFont(spec) {
    spec = spec || {};
    return face(spec.family, { weight: spec.weight, style: spec.style, axes: spec.axes });
  }

  // Loads every face a recipe uses. lockup() and monogram() need these resolved.
  async function load(recipe) {
    const out = { word: await loadFont(recipe.wordFont) };
    if (recipe.secondary && recipe.secondary.text) out.secondary = await loadFont(recipe.secondary.font);
    return out;
  }

  function deviceOf(recipe) {
    const d = recipe.device || { type: 'none' };
    return { type: d.type || 'none', crop: d.crop == null ? 610 : d.crop, height: d.height == null ? 170 : d.height };
  }

  // Draws the word with its cap top at capTop. Returns { width, wordScale }.
  function drawWord(ink, f, recipe, capTop) {
    const text = applyCase(recipe.word, recipe.case);
    const sh = shape(f, text, { tracking: recipe.tracking || 0, features: recipe.features });
    const scale = 1000 / f.upem;
    const base = capTop + f.capHeight * scale;
    sh.glyphs.forEach(function (g) { ink.glyph(f, g.gid, scale, g.x + g.dx, base); });
    return { width: sh.width, capHeight: f.capHeight * scale };
  }

  // Pure layout of a lockup: word, optional strip device, optional secondary line.
  // faces comes from await load(recipe). Returns { d, paths, rects, bounds, wordWidth }.
  function lockup(recipe, faces) {
    const ink = new Ink();
    const dev = deviceOf(recipe);
    const w = drawWord(ink, faces.word, recipe, 0);
    if (dev.type === 'strip') ink.rect(0, dev.crop, w.width, dev.crop + dev.height);
    const sec = recipe.secondary;
    if (sec && sec.text) {
      const f = faces.secondary;
      const k = (sec.size == null ? 118 : sec.size) / f.upem;
      const anchor = dev.type === 'strip' ? dev.crop + dev.height : w.capHeight;
      const base = anchor + (sec.gap == null ? 90 : sec.gap) + f.capHeight * k;
      const text = applyCase(sec.text, sec.case);
      if (sec.spread) {
        // letters spread edge to edge (flex space-between); each letter shaped alone
        const letters = Array.from(text).map(function (c) { return shape(f, c).glyphs[0]; });
        const total = letters.reduce(function (a, g) { return a + g.advance * k * f.upem / 1000; }, 0);
        const gap = letters.length > 1 ? (w.width - total) / (letters.length - 1) : 0;
        let x = letters.length > 1 ? 0 : placeX(sec.align, w.width, total);
        letters.forEach(function (g) {
          ink.glyph(f, g.gid, k, x + g.dx * k * f.upem / 1000, base);
          x += g.advance * k * f.upem / 1000 + gap;
        });
      } else {
        const sh = shape(f, text, { tracking: sec.tracking || 0, features: sec.features });
        const unit = k * f.upem / 1000;                 // shape() units -> layout units
        const x0 = placeX(sec.align, w.width, sh.width * unit);
        sh.glyphs.forEach(function (g) { ink.glyph(f, g.gid, k, x0 + (g.x + g.dx) * unit, base); });
      }
    }
    return { d: ink.d, paths: ink.paths, rects: ink.rects, bounds: ink.bounds, wordWidth: w.width };
  }

  function placeX(align, boxW, w) {
    return align === 'center' ? (boxW - w) / 2 : align === 'right' ? boxW - w : 0;
  }

  // Square monogram tile: the word's first letter standing on a full-width strip, centred
  // on its own outline (serif to serif), not its advance box.
  function monogram(recipe, faces) {
    const m = Object.assign({ tile: 1000, scale: 0.95, strip: 0.24 }, recipe.monogram || {});
    const dev = deviceOf(recipe);
    const f = faces.word;
    const T = m.tile, s = m.scale;
    const letter = Array.from(applyCase(recipe.word, recipe.case))[0];
    const g = shape(f, letter).glyphs[0];
    const scale = 1000 / f.upem * s;
    const stripTop = T - m.strip * 1000 * s;
    const capTop = stripTop - dev.crop * s;
    const gb = glyphPath(f, g.gid).bounds;
    const gx0 = gb[0] * 1000 / f.upem, gx1 = gb[2] * 1000 / f.upem;
    const ink = new Ink();
    ink.glyph(f, g.gid, scale, (T - (gx1 - gx0) * s) / 2 - gx0 * s, capTop + f.capHeight * 1000 / f.upem * s);
    ink.rect(0, stripTop, T, T);
    return { d: ink.d, paths: ink.paths, rects: ink.rects, bounds: ink.bounds, box: [0, 0, T, T] };
  }

  /* ======================= 5. output ======================= */

  // SVG string with the same structure as build_logo.py's svg(): one <path>, optional
  // background <rect>, viewBox from the ink bounds (or box), optional padding.
  function toSVG(layout, opts) {
    opts = opts || {};
    const fill = opts.fill || '#000000';
    const box = opts.box || layout.box || layout.bounds;
    const pad = opts.pad || 0;
    const x0 = box[0] - pad, y0 = box[1] - pad, x1 = box[2] + pad, y1 = box[3] + pad;
    const w = x1 - x0, h = y1 - y0;
    const f2 = function (v) { return v.toFixed(2); };
    const back = opts.bg ? '<rect x="' + f2(x0) + '" y="' + f2(y0) + '" width="' + f2(w) + '" height="' + f2(h) + '" fill="' + opts.bg + '"/>' : '';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + f2(x0) + ' ' + f2(y0) + ' ' + f2(w) + ' ' + f2(h) + '" ' +
      'width="' + Math.round(w) + '" height="' + Math.round(h) + '">' + back +
      '<path fill="' + fill + '" d="' + layout.d.join('') + '"/></svg>\n';
  }

  // Renders an SVG string to a PNG Blob widthPx wide (transparent background).
  function toPNG(svg, widthPx) {
    return new Promise(function (resolve, reject) {
      const vb = /viewBox="([^"]+)"/.exec(svg);
      if (!vb) { reject(new Error('LogoEngine: SVG has no viewBox')); return; }
      const p = vb[1].trim().split(/\s+/).map(Number);
      const W = Math.round(widthPx), H = Math.max(1, Math.round(widthPx * p[3] / p[2]));
      const img = new Image();
      img.onload = function () {
        const c = document.createElement('canvas');
        c.width = W; c.height = H;
        c.getContext('2d').drawImage(img, 0, 0, W, H);
        c.toBlob(function (b) { b ? resolve(b) : reject(new Error('LogoEngine: PNG encoding failed')); }, 'image/png');
      };
      img.onerror = function () { reject(new Error('LogoEngine: the browser could not draw this SVG')); };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    });
  }

  return {
    configure: configure, ready: ready, face: face, load: load,
    shape: shape, glyphPath: glyphPath, placeGlyph: placeGlyph,
    lockup: lockup, monogram: monogram, toSVG: toSVG, toPNG: toPNG
  };
})();
