/* ---------------------------------------------------------------------
   logos/render.js — LogoRender: LogoDoc -> outlined SVG / PNG (contract §3).

   Text is always glyph outlines from LogoEngine (HarfBuzz); shapes become SVG <path>s with
   fill / stroke attributes (so Safari, Figma and Illustrator open the same file). Each node is one
   <path> (groups are <g>) carrying its own transform attribute. Hidden nodes are skipped, opacity is
   an attribute, nesting follows the document.

   Two entry points share one code path:
     - async: toSVG, toPNG, nodeGeometry (load faces on demand, then render);
     - sync, for the live editor: nodeSVG, geometrySync (use what the caches hold; a text node whose
       font is not loaded yet yields null until prefetch() / nodeGeometry() has run).

   Glyph outlines are cached per (font, text, size, tracking, case, line height, align, spread
   width). Text node geometry is in the node's local space: origin = top-left of its box.

   Depends on LogoEngine and LogoDoc.
------------------------------------------------------------------------ */

const LogoRender = (function () {
  'use strict';

  const G = function () { return LogoDoc.geom; };
  const faceByKey = new Map();          // resolved font key -> face
  const failed = new Map();             // resolved font key -> true (fallback used)
  const geoCache = new Map();           // text layout cache (LRU by insertion)
  const GEO_MAX = 600;
  const esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  const f3 = function (v) { const s = (Math.round(v * 1000) / 1000).toString(); return s === '-0' ? '0' : s; };

  /* ======================= fonts ======================= */

  function fontKey(spec) { return [spec.family, spec.weight, spec.style, JSON.stringify(spec.axes || {})].join('|'); }

  // Resolved face for a FontRef. A family that is not in the logo font set falls back to Inter.
  async function faceFor(fontRef, tokens) {
    const spec = LogoDoc.resolveFont(fontRef, tokens);
    const key = fontKey(spec);
    if (faceByKey.has(key)) return faceByKey.get(key);
    let f;
    try {
      f = await LogoEngine.face(spec.family, { weight: spec.weight, style: spec.style, axes: spec.axes });
    } catch (e) {
      f = await LogoEngine.face('Inter', { weight: spec.weight, style: 'normal' });
      failed.set(key, true);
    }
    faceByKey.set(key, f);
    return f;
  }
  function faceSync(fontRef, tokens) { return faceByKey.get(fontKey(LogoDoc.resolveFont(fontRef, tokens))) || null; }
  // true when the node's font had to fall back (family missing from the logo font set)
  function usedFallback(fontRef, tokens) { return failed.has(fontKey(LogoDoc.resolveFont(fontRef, tokens))); }

  /* ======================= text layout ======================= */

  function textKey(n, spec) {
    return [fontKey(spec), n.text, n.size, n.tracking || 0, n.case, n.lineHeight, n.align, n.letterSpread ? 'S' + n.w : ''].join('\u0001');
  }

  // Layout in px, origin = top-left of the node box. Returns { d, w, h, ink:[x0,y0,x1,y1]|null, error? }.
  function layoutText(f, n) {
    const size = n.size, unit = size / 1000, k = size / f.upem;
    const capPx = f.capHeight * k;
    const lhPx = size * (n.lineHeight || 1.2);
    const capOff = (lhPx - capPx) / 2;
    const text = LogoEngine.applyCase(n.text || '', n.case === 'upper' || n.case === 'lower' ? n.case : 'none');
    const lines = text.split('\n');
    let shaped, error = '';
    try {
      shaped = lines.map(function (line) {
        if (!line) return { widthPx: 0, glyphs: [] };
        if (n.letterSpread) {
          const gl = Array.from(line).map(function (c) { return LogoEngine.shape(f, c).glyphs[0]; });
          return { spread: true, glyphs: gl, widthPx: gl.reduce(function (a, g) { return a + g.advance * unit; }, 0) };
        }
        const sh = LogoEngine.shape(f, line, { tracking: n.tracking || 0 });
        return { glyphs: sh.glyphs, widthPx: sh.width * unit };
      });
    } catch (e) {
      error = e.message;
      shaped = lines.map(function () { return { widthPx: 0, glyphs: [] }; });
    }
    let W = n.letterSpread ? Math.max(0, n.w || 0) : shaped.reduce(function (a, s) { return Math.max(a, s.widthPx); }, 0);
    const parts = [];
    let ink = null;
    shaped.forEach(function (s, i) {
      const base = i * lhPx + capOff + capPx;
      let x = 0, gap = 0;
      if (s.spread && s.glyphs.length > 1) gap = (W - s.widthPx) / (s.glyphs.length - 1);
      else x = n.align === 'center' ? (W - s.widthPx) / 2 : n.align === 'right' ? W - s.widthPx : 0;
      s.glyphs.forEach(function (g) {
        const px = s.spread ? x : x + g.x * unit;
        const p = LogoEngine.placeGlyph(f, g.gid, k, px + g.dx * unit, base);
        if (p.d) parts.push(p.d);
        if (p.bounds) ink = ink ? [Math.min(ink[0], p.bounds[0]), Math.min(ink[1], p.bounds[1]), Math.max(ink[2], p.bounds[2]), Math.max(ink[3], p.bounds[3])] : p.bounds.slice();
        if (s.spread) x += g.advance * unit + gap;
      });
    });
    return { d: parts.join(''), w: W, h: lines.length * lhPx, ink: ink, error: error };
  }

  /* ======================= shape paths ======================= */

  function regularPath(n) {
    const pts = [];
    if (n.type === 'polygon') {
      const c = Math.max(3, Math.min(12, Math.round(n.sides || 6)));
      for (let i = 0; i < c; i++) { const a = (-90 + i * 360 / c) * Math.PI / 180; pts.push([Math.cos(a), Math.sin(a)]); }
    } else {
      const c = Math.max(3, Math.min(24, Math.round(n.points || 5))), inner = Math.max(0.1, Math.min(0.95, n.inner == null ? 0.5 : n.inner));
      for (let i = 0; i < c * 2; i++) { const a = (-90 + i * 180 / c) * Math.PI / 180, r = i % 2 ? inner : 1; pts.push([r * Math.cos(a), r * Math.sin(a)]); }
    }
    const xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; });
    const x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    return 'M' + pts.map(function (p) {
      return f3((p[0] - x0) / (x1 - x0) * n.w) + ' ' + f3((p[1] - y0) / (y1 - y0) * n.h);
    }).join('L') + 'Z';
  }

  function shapeD(n) {
    const w = Math.max(0, n.w), h = Math.max(0, n.h);
    switch (n.type) {
      case 'rect': {
        const r = Math.max(0, Math.min(n.radius || 0, w / 2, h / 2));
        if (!r) return 'M0 0H' + f3(w) + 'V' + f3(h) + 'H0Z';
        return 'M' + f3(r) + ' 0H' + f3(w - r) + 'A' + f3(r) + ' ' + f3(r) + ' 0 0 1 ' + f3(w) + ' ' + f3(r) + 'V' + f3(h - r) +
          'A' + f3(r) + ' ' + f3(r) + ' 0 0 1 ' + f3(w - r) + ' ' + f3(h) + 'H' + f3(r) +
          'A' + f3(r) + ' ' + f3(r) + ' 0 0 1 0 ' + f3(h - r) + 'V' + f3(r) + 'A' + f3(r) + ' ' + f3(r) + ' 0 0 1 ' + f3(r) + ' 0Z';
      }
      case 'ellipse': {
        const rx = w / 2, ry = h / 2;
        return 'M0 ' + f3(ry) + 'A' + f3(rx) + ' ' + f3(ry) + ' 0 1 1 ' + f3(w) + ' ' + f3(ry) + 'A' + f3(rx) + ' ' + f3(ry) + ' 0 1 1 0 ' + f3(ry) + 'Z';
      }
      case 'line': return 'M0 0L' + f3(w) + ' ' + f3(h);
      case 'polygon': case 'star': return regularPath({ type: n.type, sides: n.sides, points: n.points, inner: n.inner, w: w, h: h });
    }
    return '';
  }

  /* ======================= geometry ======================= */

  // Local geometry { d, w, h, ink } or null (text whose font is not loaded yet).
  function geometrySync(n, tokens) {
    if (n.type === 'group') return null;
    if (n.type !== 'text') return { d: shapeD(n), w: n.w, h: n.h, ink: [0, 0, Math.max(0, n.w), Math.max(0, n.h)] };
    const f = faceSync(n.font, tokens);
    if (!f) return null;
    const key = textKey(n, LogoDoc.resolveFont(n.font, tokens));
    let g = geoCache.get(key);
    if (g) { geoCache.delete(key); geoCache.set(key, g); return g; }
    g = layoutText(f, n);
    geoCache.set(key, g);
    if (geoCache.size > GEO_MAX) geoCache.delete(geoCache.keys().next().value);
    return g;
  }

  // Cached outlines for a node (loads its font when needed).
  async function nodeGeometry(n, tokens) {
    if (n.type === 'text') await faceFor(n.font, tokens);
    return geometrySync(n, tokens);
  }

  // Loads every font the node tree uses.
  async function prefetch(nodes, tokens) {
    const jobs = [];
    (function walk(list) {
      list.forEach(function (n) {
        if (n.type === 'group') walk(n.children || []);
        else if (n.type === 'text' && !faceSync(n.font, tokens)) jobs.push(faceFor(n.font, tokens));
      });
    })(nodes);
    await Promise.all(jobs);
  }

  /* ======================= bounds ======================= */

  // Tight bounds of the visible nodes in `list` (coordinates of their common parent, then through M).
  // Text counts by its glyph outlines, shapes by their path plus half the stroke.
  function boundsSync(list, tokens, M) {
    let b = null;
    list.forEach(function (n) {
      if (n.hidden) return;
      const m = G().mul(M || G().I, G().nodeMatrix(n));
      if (n.type === 'group') { b = G().union(b, boundsSync(n.children || [], tokens, m)); return; }
      const g = geometrySync(n, tokens);
      if (!g || !g.ink) return;
      const half = n.stroke && n.strokeWidth > 0 ? n.strokeWidth / 2 : 0;
      b = G().union(b, G().rectBounds(m, g.ink[0] - half, g.ink[1] - half, g.ink[2] + half, g.ink[3] + half));
    });
    return b;
  }
  async function nodeBoundsLocal(n, tokens) {
    await prefetch([n], tokens);
    return boundsSync([n], tokens);
  }

  /* ======================= SVG ======================= */

  function paintAttrs(n, tokens, opts) {
    let fill = LogoDoc.resolveColor(n.fill, tokens), stroke = LogoDoc.resolveColor(n.stroke, tokens);
    if (opts && opts.fill) { if (fill) fill = opts.fill; if (stroke) stroke = opts.fill; }
    let s = ' fill="' + (fill || 'none') + '"';
    if (stroke && n.strokeWidth > 0) {
      s += ' stroke="' + stroke + '" stroke-width="' + f3(n.strokeWidth) + '"';
      if (n.type === 'line') s += ' stroke-linecap="' + (n.cap === 'round' || n.cap === 'square' ? n.cap : 'butt') + '"';
      else s += ' stroke-linejoin="miter"';
    }
    return s;
  }

  // One node as an SVG string (a <path>, or a <g> for groups). opts: { fill, ids }.
  function nodeSVG(n, tokens, opts) {
    if (n.hidden) return '';
    opts = opts || {};
    const tr = G().transformAttr(n);
    let head = (opts.ids ? ' data-id="' + esc(n.id) + '"' : '') + (tr ? ' transform="' + tr + '"' : '') + (n.opacity < 1 ? ' opacity="' + f3(n.opacity) + '"' : '');
    if (n.type === 'group') return '<g' + head + '>' + (n.children || []).map(function (c) { return nodeSVG(c, tokens, opts); }).join('') + '</g>';
    const g = geometrySync(n, tokens);
    if (!g) return opts.ids ? '<path' + head + ' d=""/>' : '';
    return '<path' + head + paintAttrs(n, tokens, opts) + ' d="' + g.d + '"/>';
  }

  // Outlined SVG. opts: { fill:'#hex' (every fill / stroke), box:'artboard'|'content', pad, bg:'#hex' }.
  // 'content' = the tight bounds of the visible nodes (plus pad); 'artboard' = the artboard rect, with
  // its background when set (not when `fill` is given: that is the one-colour version, on transparent).
  async function toSVG(doc, tokens, opts) {
    opts = opts || {};
    tokens = tokens || LogoDoc.defaultTokens();
    await prefetch(doc.nodes, tokens);
    const pad = opts.pad || 0;
    let b = opts.box === 'content' ? boundsSync(doc.nodes, tokens) : null;
    if (!b) b = [0, 0, doc.artboard.w, doc.artboard.h];
    const x0 = b[0] - pad, y0 = b[1] - pad, w = b[2] - b[0] + pad * 2, h = b[3] - b[1] + pad * 2;
    const f2 = function (v) { return v.toFixed(2); };
    let bg = opts.bg || null;
    if (!bg && opts.box !== 'content' && !opts.fill) bg = LogoDoc.resolveColor(doc.artboard.bg, tokens);
    const back = bg ? '<rect x="' + f2(x0) + '" y="' + f2(y0) + '" width="' + f2(w) + '" height="' + f2(h) + '" fill="' + bg + '"/>' : '';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + f2(x0) + ' ' + f2(y0) + ' ' + f2(w) + ' ' + f2(h) + '" ' +
      'width="' + Math.round(w) + '" height="' + Math.round(h) + '">' + back +
      doc.nodes.map(function (n) { return nodeSVG(n, tokens, { fill: opts.fill }); }).join('') + '</svg>\n';
  }

  // PNG Blob widthPx wide (transparent unless the artboard has a background / opts.bg).
  async function toPNG(doc, tokens, widthPx, opts) {
    return LogoEngine.toPNG(await toSVG(doc, tokens, opts), widthPx);
  }

  return {
    toSVG: toSVG, toPNG: toPNG, nodeGeometry: nodeGeometry, prefetch: prefetch,
    geometrySync: geometrySync, nodeSVG: nodeSVG, boundsSync: boundsSync, nodeBoundsLocal: nodeBoundsLocal,
    faceFor: faceFor, faceSync: faceSync, usedFallback: usedFallback, shapeD: shapeD
  };
})();
