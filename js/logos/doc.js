/* ---------------------------------------------------------------------
   logos/doc.js — LogoDoc: the Logos document model (contract: docs/logos-phase1-contract.md §1-3).

   A logo is a JSON scene graph: { v:1, id, name, brandId, attached, artboard, nodes[], preview }.
   Colours and fonts are linked refs ({ref:'ink'}, {ref:'heading'}) resolved against brand tokens,
   or unlinked values ({hex}, {family}).

   Conventions this file fixes (the contract leaves them open):
     - Node box (x,y,w,h) is in the PARENT's coordinates; rotation is degrees about the box centre;
       flips mirror about the centre after rotation is applied to the unflipped box (matrix =
       T(centre) * R(rotation) * S(flip) * T(-w/2,-h/2)).
     - Group: children are in the group's own space, whose origin is the group box's top-left. The
       group box is the union of its children's parent-space boxes (kept up to date by the editor).
       A group is rigid (rotation + flips only); resizing a group bakes the scale into its children.
     - Text: the box is a stack of line boxes (height = size * lineHeight). The cap height is centred
       in each line box. w/h are derived from the layout, except with the optional text field
       `letterSpread: true`, where w is the user-set width and the letters are spread edge to edge
       (the Logo Studio "spread" secondary line). `letterSpread` is an addition to the contract.
     - Token mapping (tokensFromBrandState): ink = colors.neutralDark, canvas = colors.neutralLight,
       primary/secondary/accent = same-named colors, white = #FFFFFF; heading = headingFont.name at
       typography.headingWeight, body = bodyFont.name at typography.bodyWeight.

   fromRecipe(recipe) is async (it needs font metrics) and resolves to { nodes, artboard }.
   validate(doc) returns { ok, errors:[string] }.

   Plain <script>; exposes one global.
------------------------------------------------------------------------ */

const LogoDoc = (function () {
  'use strict';

  const TYPES = ['text', 'rect', 'ellipse', 'line', 'polygon', 'star', 'group'];
  const COLOR_REFS = ['ink', 'primary', 'secondary', 'accent', 'canvas', 'white'];
  const ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
  const clone = function (o) { return o == null ? o : JSON.parse(JSON.stringify(o)); };
  const num = function (v, d) { return typeof v === 'number' && isFinite(v) ? v : d; };
  const rnd = function () { return Math.random().toString(36).slice(2, 6).padEnd(4, '0'); };
  let seq = 0;

  function newId() { return 'lg_' + Date.now().toString(36) + rnd(); }
  function newNodeId() { seq = (seq + 1) % 1679616; return 'n_' + Date.now().toString(36) + seq.toString(36) + rnd(); }

  /* ======================= geometry helpers ======================= */
  // Affine matrices [a,b,c,d,e,f]: x' = a x + c y + e, y' = b x + d y + f.
  const geom = {
    I: [1, 0, 0, 1, 0, 0],
    mul: function (A, B) {
      return [A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1],
              A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3],
              A[0] * B[4] + A[2] * B[5] + A[4], A[1] * B[4] + A[3] * B[5] + A[5]];
    },
    inv: function (M) {
      const det = M[0] * M[3] - M[1] * M[2];
      if (!det) return geom.I.slice();
      const a = M[3] / det, b = -M[1] / det, c = -M[2] / det, d = M[0] / det;
      return [a, b, c, d, -(a * M[4] + c * M[5]), -(b * M[4] + d * M[5])];
    },
    apply: function (M, x, y) { return [M[0] * x + M[2] * y + M[4], M[1] * x + M[3] * y + M[5]]; },
    vec: function (M, x, y) { return [M[0] * x + M[2] * y, M[1] * x + M[3] * y]; },
    nodeMatrix: function (n) {
      const t = (n.rotation || 0) * Math.PI / 180, cs = Math.cos(t), sn = Math.sin(t);
      const fx = n.flipX ? -1 : 1, fy = n.flipY ? -1 : 1;
      const a = cs * fx, b = sn * fx, c = -sn * fy, d = cs * fy;
      const hw = n.w / 2, hh = n.h / 2;
      return [a, b, c, d, n.x + hw - (a * hw + c * hh), n.y + hh - (b * hw + d * hh)];
    },
    r4: function (v) { return Math.round(v * 10000) / 10000; },
    matrixAttr: function (M) {
      const r = geom.r4;
      return 'matrix(' + M.map(r).join(' ') + ')';
    },
    // SVG transform attribute for a node ('' when identity).
    transformAttr: function (n) {
      const r = geom.r4;
      if (!n.rotation && !n.flipX && !n.flipY) return (n.x || n.y) ? 'translate(' + r(n.x) + ' ' + r(n.y) + ')' : '';
      return geom.matrixAttr(geom.nodeMatrix(n));
    },
    // x,y,w,h,rotation,flipX,flipY from a matrix (rigid, maybe mirrored) and a box size.
    decompose: function (M, w, h) {
      const det = M[0] * M[3] - M[1] * M[2];
      const flip = det < 0;
      const rot = flip ? Math.atan2(-M[1], -M[0]) : Math.atan2(M[1], M[0]);
      const c = geom.apply(M, w / 2, h / 2);
      return { x: c[0] - w / 2, y: c[1] - h / 2, rotation: geom.normAngle(rot * 180 / Math.PI), flipX: flip, flipY: false };
    },
    normAngle: function (a) {
      a = ((a % 360) + 360) % 360;
      if (a > 180) a -= 360;
      return Math.round(a * 1e6) / 1e6;
    },
    // Axis-aligned bounds [x0,y0,x1,y1] of a local rect through a matrix.
    rectBounds: function (M, x0, y0, x1, y1) {
      const ps = [geom.apply(M, x0, y0), geom.apply(M, x1, y0), geom.apply(M, x1, y1), geom.apply(M, x0, y1)];
      return [Math.min(ps[0][0], ps[1][0], ps[2][0], ps[3][0]), Math.min(ps[0][1], ps[1][1], ps[2][1], ps[3][1]),
              Math.max(ps[0][0], ps[1][0], ps[2][0], ps[3][0]), Math.max(ps[0][1], ps[1][1], ps[2][1], ps[3][1])];
    },
    union: function (a, b) {
      return !a ? b : !b ? a : [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])];
    }
  };

  /* ======================= tokens ======================= */

  function defaultTokens() {
    return {
      colors: { ink: '#1C1F26', primary: '#1C1F26', secondary: '#6B7280', accent: '#1C1F26', canvas: '#FFFFFF', white: '#FFFFFF' },
      fonts: { heading: { family: 'Inter', weight: 700 }, body: { family: 'Inter', weight: 400 } }
    };
  }

  // st: a brand savedState (serializeState output) or the live `state`.
  function tokensFromBrandState(st) {
    const d = defaultTokens();
    if (!st) return d;
    const c = st.colors || {};
    const hex = function (v, fb) { return typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v) ? v : fb; };
    const t = st.typography || {};
    const fam = function (f, fb) { return f && (f.name || f.family) || fb; };
    const wt = function (w, fb) { w = Number(w); return w > 0 ? w : fb; };
    return {
      colors: {
        ink: hex(c.neutralDark, d.colors.ink), primary: hex(c.primary, d.colors.primary),
        secondary: hex(c.secondary, d.colors.secondary), accent: hex(c.accent, d.colors.accent),
        canvas: hex(c.neutralLight, d.colors.canvas), white: '#FFFFFF'
      },
      fonts: {
        // live state has headingFont/bodyFont objects; a saved record has headingFontName/bodyFontName
        heading: { family: fam(st.headingFont, st.headingFontName || d.fonts.heading.family), weight: wt(t.headingWeight, 700) },
        body: { family: fam(st.bodyFont, st.bodyFontName || d.fonts.body.family), weight: wt(t.bodyWeight, 400) }
      }
    };
  }

  // ColorRef -> '#RRGGBB' | null.
  function resolveColor(ref, tokens) {
    if (ref == null) return null;
    if (typeof ref === 'string') return ref;
    if (ref.hex) return ref.hex;
    if (ref.ref) {
      const c = ((tokens || defaultTokens()).colors || {})[ref.ref];
      return c || defaultTokens().colors[ref.ref] || null;
    }
    return null;
  }

  // FontRef -> { family, weight, style, axes? }.
  function resolveFont(ref, tokens) {
    ref = ref || { ref: 'heading' };
    if (ref.ref) {
      const tk = ((tokens || defaultTokens()).fonts || {})[ref.ref] || defaultTokens().fonts[ref.ref] || defaultTokens().fonts.heading;
      return { family: tk.family, weight: ref.weight != null ? ref.weight : tk.weight, style: ref.style || 'normal', axes: ref.axes };
    }
    return { family: ref.family || 'Inter', weight: ref.weight || 400, style: ref.style || 'normal', axes: ref.axes };
  }

  /* ======================= nodes ======================= */

  const INK = function () { return { ref: 'ink' }; };
  function nodeDefaults(type) {
    const base = { id: '', type: type, name: '', x: 0, y: 0, w: 100, h: 100, rotation: 0, flipX: false, flipY: false, opacity: 1, locked: false, hidden: false };
    switch (type) {
      case 'text': return Object.assign(base, { name: 'Text', w: 200, h: 115, text: 'Text', font: { ref: 'heading', weight: 400, style: 'normal' }, size: 96, tracking: 0, lineHeight: 1.2, case: 'as-typed', align: 'left', fill: INK() });
      case 'rect': return Object.assign(base, { name: 'Rectangle', fill: INK(), stroke: null, strokeWidth: 8, radius: 0 });
      case 'ellipse': return Object.assign(base, { name: 'Ellipse', fill: INK(), stroke: null, strokeWidth: 8 });
      case 'line': return Object.assign(base, { name: 'Line', h: 0, w: 200, fill: null, stroke: INK(), strokeWidth: 8, cap: 'butt' });
      case 'polygon': return Object.assign(base, { name: 'Polygon', sides: 6, fill: INK(), stroke: null, strokeWidth: 8 });
      case 'star': return Object.assign(base, { name: 'Star', points: 5, inner: 0.5, fill: INK(), stroke: null, strokeWidth: 8 });
      case 'group': return Object.assign(base, { name: 'Group', children: [] });
    }
    throw new Error('LogoDoc: unknown node type "' + type + '"');
  }

  // Fills a spec with defaults and fresh ids (recursively for groups).
  function makeNode(spec) {
    spec = spec || {};
    const n = Object.assign(nodeDefaults(spec.type), clone(spec));
    if (!n.id) n.id = newNodeId();
    if (n.type === 'group') n.children = (n.children || []).map(function (c) { return makeNode(c); });
    return n;
  }

  // A copy of a node tree with new ids.
  function cloneNode(n) {
    const c = clone(n);
    (function walk(x) { x.id = newNodeId(); if (x.children) x.children.forEach(walk); })(c);
    return c;
  }

  function create(opts) {
    opts = opts || {};
    const now = Date.now();
    return {
      v: 1, id: newId(), name: opts.name || 'Untitled logo', createdAt: now, updatedAt: now,
      brandId: opts.brandId || null, attached: [],
      artboard: { w: opts.w || 1200, h: opts.h || 600, bg: null },
      nodes: [], preview: ''
    };
  }

  /* ======================= validation ======================= */

  function validate(doc) {
    const errors = [];
    const bad = function (m) { errors.push(m); };
    if (!doc || typeof doc !== 'object') return { ok: false, errors: ['not an object'] };
    if (doc.v !== 1) bad('v must be 1');
    if (typeof doc.id !== 'string' || !ID_RE.test(doc.id)) bad('id must match /^[A-Za-z0-9_-]{1,64}$/');
    if (typeof doc.name !== 'string') bad('name must be a string');
    const ab = doc.artboard;
    if (!ab || !(ab.w > 0) || !(ab.h > 0)) bad('artboard needs w and h > 0');
    else if (ab.bg != null && !colorOk(ab.bg)) bad('artboard.bg must be a ColorRef or null');
    if (!Array.isArray(doc.nodes)) { bad('nodes must be an array'); return { ok: false, errors: errors }; }
    const seen = {};
    (function walk(list, path) {
      list.forEach(function (n, i) {
        const p = path + '[' + i + ']';
        if (!n || TYPES.indexOf(n.type) < 0) return bad(p + ': unknown type');
        if (typeof n.id !== 'string' || !n.id) bad(p + ': missing id'); else if (seen[n.id]) bad(p + ': duplicate id ' + n.id); else seen[n.id] = 1;
        ['x', 'y', 'w', 'h', 'rotation'].forEach(function (k) { if (typeof n[k] !== 'number' || !isFinite(n[k])) bad(p + ': ' + k + ' must be a number'); });
        if (!(n.opacity >= 0 && n.opacity <= 1)) bad(p + ': opacity must be 0-1');
        ['fill', 'stroke'].forEach(function (k) { if (n[k] != null && !colorOk(n[k])) bad(p + ': ' + k + ' must be a ColorRef or null'); });
        if (n.type === 'text') {
          if (typeof n.text !== 'string') bad(p + ': text must be a string');
          if (!n.font || !(n.font.ref === 'heading' || n.font.ref === 'body' || typeof n.font.family === 'string')) bad(p + ': font must be a FontRef');
          if (!(n.size > 0)) bad(p + ': size must be > 0');
        }
        if (n.type === 'polygon' && !(n.sides >= 3 && n.sides <= 12)) bad(p + ': sides must be 3-12');
        if (n.type === 'star' && !(n.points >= 3 && n.points <= 24 && n.inner >= 0.1 && n.inner <= 0.95)) bad(p + ': star points 3-24 / inner 0.1-0.95');
        if (n.type === 'group') { if (!Array.isArray(n.children)) bad(p + ': children must be an array'); else walk(n.children, p + '.children'); }
      });
    })(doc.nodes, 'nodes');
    return { ok: errors.length === 0, errors: errors };
  }
  function colorOk(c) {
    return !!c && typeof c === 'object' && ((c.ref && COLOR_REFS.indexOf(c.ref) >= 0) || (typeof c.hex === 'string' && /^#[0-9a-f]{6}$/i.test(c.hex)));
  }

  /* ======================= Logo Studio recipe -> nodes ======================= */

  // recipe: the Logo Studio contract recipe (word, case, wordFont, tracking, device, secondary) with
  // wordFont.family / secondary.font.family either a real family or 'heading' / 'body'.
  // Resolves to { nodes, artboard:{w,h,bg} }. Needs LogoRender and LogoEngine (fonts load async).
  // Geometry: 1 recipe unit = 1 artboard px, origin = the word's left edge and cap top, as in the
  // engine. A strip / rule is a rect, a box is a stroked rect, the secondary line a text node
  // (letterSpread:true for `spread`). Everything is ink; colour refs, not hexes.
  async function fromRecipe(recipe, opts) {
    opts = opts || {};
    const Eng = LogoEngine, Rnd = LogoRender;
    const tokens = opts.tokens || defaultTokens();
    const caseOf = function (c) { return c === 'upper' || c === 'lower' ? c : 'as-typed'; };
    const fontRef = function (f, fbWeight) {
      f = f || {};
      const w = f.weight || fbWeight, st = f.style || 'normal';
      return (f.family === 'heading' || f.family === 'body')
        ? { ref: f.family, weight: w, style: st }
        : Object.assign({ family: f.family, weight: w, style: st }, f.axes ? { axes: f.axes } : {});
    };
    const dev = recipe.device || { type: 'none' };
    const type = dev.type || 'none';
    const D = {
      crop: dev.crop == null ? 610 : dev.crop,
      height: dev.height == null ? (type === 'strip' ? 170 : 36) : dev.height,
      gap: dev.gap == null ? (type === 'box' ? 110 : 70) : dev.gap
    };
    const nodes = [];
    const word = makeNode({
      type: 'text', name: recipe.word || 'Word', text: recipe.word || '', font: fontRef(recipe.wordFont, 400),
      size: 1000, tracking: recipe.tracking || 0, lineHeight: 1, case: caseOf(recipe.case), align: 'left', fill: INK()
    });
    const wf = await Rnd.faceFor(word.font, tokens);
    const cap = wf.capHeight * 1000 / wf.upem;
    word.y = -(1000 - cap) / 2;                       // cap top at y = 0, baseline at y = cap
    word.x = 0;
    const wg = await Rnd.nodeGeometry(word, tokens);
    word.w = wg.w; word.h = wg.h;
    const ink = wg.ink ? [wg.ink[0] + word.x, wg.ink[1] + word.y, wg.ink[2] + word.x, wg.ink[3] + word.y] : [0, 0, wg.w, cap];
    nodes.push(word);
    const wordW = wg.w;
    const low = ink[3] > cap + 40 ? ink[3] : cap;      // real descenders only, not overshoot
    const wordTop = Math.min(0, ink[1]);
    let x0 = 0, x1 = wordW, anchor = cap;
    const rect = function (name, x, y, w, h, extra) {
      nodes.push(makeNode(Object.assign({ type: 'rect', name: name, x: x, y: y, w: w, h: h, fill: INK() }, extra || {})));
    };
    if (type === 'strip') {
      rect('Strip', 0, D.crop, wordW, D.height);
      anchor = D.crop + D.height;
    } else if (type === 'rule') {
      rect('Rule', 0, low + D.gap, wordW, D.height);
      anchor = low + D.gap + D.height;
    } else if (type === 'box') {
      const m = D.gap + D.height, t = D.height;
      x0 = -m; x1 = wordW + m;
      const y0 = wordTop - m, y1 = low + m;
      rect('Box', x0 + t / 2, y0 + t / 2, (x1 - x0) - t, (y1 - y0) - t, { fill: null, stroke: INK(), strokeWidth: t });
      anchor = y1;
    }
    const sec = recipe.secondary;
    if (sec && sec.text) {
      const st = makeNode({
        type: 'text', name: sec.text, text: sec.text, font: fontRef(sec.font, 500),
        size: sec.size == null ? 118 : sec.size, tracking: sec.spread ? 0 : (sec.tracking || 0), lineHeight: 1,
        case: caseOf(sec.case || recipe.case), align: sec.align || 'left', fill: INK(), letterSpread: !!sec.spread
      });
      const sf = await Rnd.faceFor(st.font, tokens);
      const scap = sf.capHeight * st.size / sf.upem;
      const capTop = anchor + (sec.gap == null ? 90 : sec.gap);
      st.y = capTop - (st.size - scap) / 2;
      const boxW = x1 - x0;
      if (st.letterSpread) {
        st.x = x0; st.w = boxW;
      } else {
        st.x = x0;
        const g = await Rnd.nodeGeometry(st, tokens);
        st.x = x0 + (st.align === 'center' ? (boxW - g.w) / 2 : st.align === 'right' ? boxW - g.w : 0);
      }
      const sg = await Rnd.nodeGeometry(st, tokens);
      st.w = sg.w; st.h = sg.h;
      nodes.push(st);
    }
    // artboard: the content bounds plus an even margin
    let b = null;
    for (const n of nodes) b = geom.union(b, await Rnd.nodeBoundsLocal(n, tokens));
    const margin = Math.round(Math.max(b[2] - b[0], b[3] - b[1]) * 0.1);
    const dx = margin - b[0], dy = margin - b[1];
    nodes.forEach(function (n) { n.x += dx; n.y += dy; });
    return { nodes: nodes, artboard: { w: Math.ceil(b[2] - b[0] + margin * 2), h: Math.ceil(b[3] - b[1] + margin * 2), bg: null } };
  }

  return {
    TYPES: TYPES, COLOR_REFS: COLOR_REFS, geom: geom,
    newId: newId, newNodeId: newNodeId, create: create, validate: validate, clone: clone,
    nodeDefaults: nodeDefaults, makeNode: makeNode, cloneNode: cloneNode,
    tokensFromBrandState: tokensFromBrandState, defaultTokens: defaultTokens,
    resolveColor: resolveColor, resolveFont: resolveFont, fromRecipe: fromRecipe
  };
})();
