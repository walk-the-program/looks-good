/* ---------------------------------------------------------------------
   logos/editor.js — LogoEditor: the canvas interaction core of the Logos module (contract §4).

   mount(container, doc, {tokens}) draws the document into an <svg> (artboard on a pasteboard) and
   handles selection, transform, snapping, align / distribute, layer order, undo, zoom / pan and the
   keyboard. The editor edits the doc object it is given, in place (ed.doc() is that object).

   Rendering: the document is drawn by LogoRender.nodeSVG (the same code as the export). Dragging
   only rewrites the transform attributes of the moved nodes. The selection chrome (handles, guides,
   marquee) lives in a screen-space overlay <g>, so it never scales with the zoom.

   History: snapshot based, one step per command / drag, capped at 200.
   Events: change {reason}, select {ids}, zoom {zoom}, tool {tool}, history {canUndo, canRedo},
           edit {id|null} (text editing started / ended).
   Additions to the contract's API (all optional for consumers):
     update(ids, patch, {merge:'key'})   calls with the same key inside 1 s share one undo step
     setArtboard(patch), setName(name), selectAll(), flip(ids,'h'|'v'), nudge(dx,dy)
     enterGroup(id) / exitGroup() / scope(), editText(id), node(id), worldBox(id), viewport()
   zoom(n): n is a multiplier (1 = 100%); zoomLevel() returns the same unit; range 0.1 - 32.

   Text editing uses a transparent <textarea> laid over the node (no custom caret): the caret follows
   the textarea's own font, which can differ a little from the outlined glyphs under it.
   Depends on LogoDoc, LogoRender, LogoEngine. Plain <script>.
------------------------------------------------------------------------ */

const LogoEditor = (function () {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  const G = LogoDoc.geom;
  const HIST_MAX = 200;
  const ZMIN = 0.1, ZMAX = 32;
  const SNAP_PX = 6, DRAG_PX = 3;
  const TOOLS = ['select', 'text', 'rect', 'ellipse', 'line', 'polygon', 'star', 'hand'];
  const KEY_TOOLS = { v: 'select', t: 'text', r: 'rect', o: 'ellipse', l: 'line', h: 'hand' };
  const clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  const clone = LogoDoc.clone;
  let clipboard = null, pasteCount = 0;          // shared across editors: copy in one logo, paste in another

  function mount(container, doc, opts) {
    opts = opts || {};
    let tokens = opts.tokens || LogoDoc.defaultTokens();
    let tool = 'select', sel = [], scopeId = null;
    let zoom = 1, pan = [0, 0], vw = 0, vh = 0, autoFit = true;
    let hover = null, guides = [], hints = [], marquee = null;
    let drag = null, spaceDown = false, editing = null, destroyed = false;
    let textSeq = 0;
    const idx = new Map();                       // id -> {node, list, parent}
    const els = new Map();                       // id -> svg element
    const handlers = {};
    const pointers = new Map();
    let hist = [], hi = 0, lastMerge = null;

    /* ---------------- DOM ---------------- */
    container.classList.add('lg-ed');
    if (!container.hasAttribute('tabindex')) container.setAttribute('tabindex', '0');
    const mk = function (tag, attrs, parent) {
      const e = document.createElementNS(NS, tag);
      if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
      if (parent) parent.appendChild(e);
      return e;
    };
    const svg = mk('svg', { class: 'lg-ed-svg', 'aria-label': 'Logo canvas' });
    const viewport = mk('g', { class: 'lg-viewport' }, svg);
    const artRect = mk('rect', { class: 'lg-artboard' }, viewport);
    const content = mk('g', { class: 'lg-content' }, viewport);
    const ov = mk('g', { class: 'lg-overlay' }, svg);
    container.appendChild(svg);

    /* ---------------- events ---------------- */
    function on(type, fn) { (handlers[type] = handlers[type] || []).push(fn); return api; }
    function off(type, fn) { if (handlers[type]) handlers[type] = handlers[type].filter(function (f) { return f !== fn; }); return api; }
    function emit(type, payload) {
      (handlers[type] || []).slice().forEach(function (fn) { try { fn(payload || {}, api); } catch (e) { console.error(e); } });
    }

    /* ---------------- document index and matrices ---------------- */
    function reindex() {
      idx.clear();
      (function walk(list, parent) {
        list.forEach(function (n) {
          idx.set(n.id, { node: n, list: list, parent: parent });
          if (n.children) walk(n.children, n);
        });
      })(doc.nodes, null);
    }
    const nodeOf = function (id) { const e = idx.get(id); return e ? e.node : null; };
    function parentM(id) {
      let M = G.I, p = idx.get(id).parent;
      while (p) { M = G.mul(G.nodeMatrix(p), M); p = idx.get(p.id).parent; }
      return M;
    }
    function worldM(id) { return G.mul(parentM(id), G.nodeMatrix(nodeOf(id))); }
    function worldBox(id) { const n = nodeOf(id); return G.rectBounds(worldM(id), 0, 0, n.w, n.h); }
    function listOf(scope) { return scope ? nodeOf(scope).children : doc.nodes; }
    function unionBox(ids) { let b = null; ids.forEach(function (id) { b = G.union(b, worldBox(id)); }); return b; }

    /* ---------------- history ---------------- */
    function snap() { return JSON.stringify({ name: doc.name, artboard: doc.artboard, nodes: doc.nodes }); }
    function commit(label, merge) {
      const s = snap();
      if (s === hist[hi]) return false;
      const now = Date.now();
      if (merge && lastMerge && lastMerge.key === merge && now - lastMerge.t < 1000 && hi === hist.length - 1 && hi > 0) {
        hist[hi] = s; lastMerge.t = now;
      } else {
        hist.length = hi + 1;
        hist.push(s);
        if (hist.length > HIST_MAX + 1) hist.shift();
        hi = hist.length - 1;
        lastMerge = merge ? { key: merge, t: now } : null;
      }
      doc.updatedAt = now;
      emit('history', histState());
      emit('change', { reason: label || 'edit' });
      return true;
    }
    const histState = function () { return { canUndo: hi > 0, canRedo: hi < hist.length - 1 }; };
    function restore(i) {
      endEdit(false, true);
      hi = i; lastMerge = null;
      const s = JSON.parse(hist[i]);
      doc.name = s.name; doc.artboard = s.artboard; doc.nodes = s.nodes; doc.updatedAt = Date.now();
      reindex();
      setSel(sel.filter(function (id) { return idx.has(id); }), true);
      if (scopeId && !idx.has(scopeId)) scopeId = null;
      refreshAll();
      emit('history', histState());
      emit('change', { reason: 'history' });
    }
    function undo() { if (hi > 0) restore(hi - 1); return api; }
    function redo() { if (hi < hist.length - 1) restore(hi + 1); return api; }

    /* ---------------- structure upkeep ---------------- */
    // Keeps every group's box equal to the union of its children, preserving world positions.
    function fixGroups() {
      let changed = false;
      (function walk(list) {
        for (let i = list.length - 1; i >= 0; i--) {
          const n = list[i];
          if (n.type !== 'group') continue;
          walk(n.children);
          if (!n.children.length) { list.splice(i, 1); changed = true; continue; }
          let U = null;
          n.children.forEach(function (c) { U = G.union(U, G.rectBounds(G.nodeMatrix(c), 0, 0, c.w, c.h)); });
          const ox = U[0], oy = U[1], nw = U[2] - U[0], nh = U[3] - U[1];
          if (Math.abs(ox) < 1e-7 && Math.abs(oy) < 1e-7 && Math.abs(nw - n.w) < 1e-7 && Math.abs(nh - n.h) < 1e-7) continue;
          const M = G.nodeMatrix(n);
          const M2 = [M[0], M[1], M[2], M[3], M[4] + M[0] * ox + M[2] * oy, M[5] + M[1] * ox + M[3] * oy];
          const c2 = G.apply(M2, nw / 2, nh / 2);
          n.x = c2[0] - nw / 2; n.y = c2[1] - nh / 2; n.w = nw; n.h = nh;
          n.children.forEach(function (c) { c.x -= ox; c.y -= oy; });
          changed = true;
        }
      })(doc.nodes);
      return changed;
    }

    // Text boxes follow their layout (w / h derived), holding the alignment anchor still.
    function syncTexts() {
      let missing = false;
      (function walk(list) {
        list.forEach(function (n) {
          if (n.type === 'group') return walk(n.children);
          if (n.type !== 'text') return;
          const g = LogoRender.geometrySync(n, tokens);
          if (!g) { missing = true; return; }
          const nw = n.letterSpread ? n.w : g.w, nh = g.h;
          if (Math.abs(nw - n.w) < 1e-6 && Math.abs(nh - n.h) < 1e-6) return;
          const M = G.nodeMatrix(n);
          const ax = n.align === 'center' ? 0.5 : n.align === 'right' ? 1 : 0;
          const P = G.apply(M, ax * n.w, 0);
          n.w = nw; n.h = nh;
          const L = G.nodeMatrix(n);
          const C = [P[0] - (L[0] * (ax * nw - nw / 2) + L[2] * (-nh / 2)), P[1] - (L[1] * (ax * nw - nw / 2) + L[3] * (-nh / 2))];
          // L's translation part is unused: only its linear part matters here
          n.x = C[0] - nw / 2; n.y = C[1] - nh / 2;
        });
      })(doc.nodes);
      if (missing) {
        const my = ++textSeq;
        LogoRender.prefetch(doc.nodes, tokens).then(function () {
          if (destroyed || my !== textSeq) return;
          syncTexts(); fixGroups(); reindex(); refreshAll();
          emit('change', { reason: 'fonts' });
        }, function (e) { console.error(e); });
      }
    }

    // After any edit: texts, groups, index, then redraw everything.
    function settle() {
      syncTexts(); fixGroups(); reindex();
      sel = sel.filter(function (id) { return idx.has(id); });
      refreshAll();
    }
    function refreshAll() { renderContent(); drawOverlay(); positionEditor(); }

    /* ---------------- rendering ---------------- */
    function renderContent() {
      const ab = doc.artboard;
      artRect.setAttribute('width', ab.w); artRect.setAttribute('height', ab.h);
      const bg = LogoDoc.resolveColor(ab.bg, tokens);
      artRect.setAttribute('fill', bg || '#FFFFFF');
      artRect.classList.toggle('is-clear', !bg);
      content.innerHTML = doc.nodes.map(function (n) { return LogoRender.nodeSVG(n, tokens, { ids: true }); }).join('');
      els.clear();
      content.querySelectorAll('[data-id]').forEach(function (e) { els.set(e.getAttribute('data-id'), e); });
      applyView();
    }
    function replaceEl(id) {
      const old = els.get(id), n = nodeOf(id);
      if (!old || !n) return;
      const t = mk('g');
      t.innerHTML = LogoRender.nodeSVG(n, tokens, { ids: true });
      const fresh = t.firstChild;
      if (!fresh) return;
      old.replaceWith(fresh);
      els.set(id, fresh);
      fresh.querySelectorAll('[data-id]').forEach(function (e) { els.set(e.getAttribute('data-id'), e); });
    }
    function setTransformAttr(id) {
      const e = els.get(id), n = nodeOf(id);
      if (!e || !n) return;
      const t = G.transformAttr(n);
      if (t) e.setAttribute('transform', t); else e.removeAttribute('transform');
    }

    /* ---------------- view ---------------- */
    function measure() { const r = svg.getBoundingClientRect(); vw = r.width; vh = r.height; return r; }
    function applyView() {
      viewport.setAttribute('transform', 'translate(' + pan[0] + ' ' + pan[1] + ') scale(' + zoom + ')');
    }
    const toScreen = function (x, y) { return [x * zoom + pan[0], y * zoom + pan[1]]; };
    const toWorld = function (sx, sy) { return [(sx - pan[0]) / zoom, (sy - pan[1]) / zoom]; };
    function evPoint(e) { const r = svg.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    function evWorld(e) { const p = evPoint(e); return toWorld(p[0], p[1]); }
    function setView(z, px, py, auto) {
      zoom = clamp(z, ZMIN, ZMAX); pan = [px, py]; autoFit = !!auto;
      applyView(); drawOverlay(); positionEditor();
      emit('zoom', { zoom: zoom });
    }
    function zoomAt(z, sx, sy) {
      z = clamp(z, ZMIN, ZMAX);
      const w = toWorld(sx, sy);
      setView(z, sx - w[0] * z, sy - w[1] * z, false);
    }
    function fitBox(b, margin) {
      measure();
      if (!vw || !vh) return;
      const bw = Math.max(1, b[2] - b[0]), bh = Math.max(1, b[3] - b[1]);
      const z = clamp(Math.min((vw - margin * 2) / bw, (vh - margin * 2) / bh), ZMIN, ZMAX);
      setView(z, (vw - bw * z) / 2 - b[0] * z, (vh - bh * z) / 2 - b[1] * z, false);
    }
    function zoomTo(n) {
      measure();
      if (n === 'fit') { fitBox([0, 0, doc.artboard.w, doc.artboard.h], 48); autoFit = true; }
      else if (n === 'selection') { sel.length ? fitBox(unionBox(sel), 80) : zoomTo('fit'); }
      else if (n === 'in') zoomAt(zoom * 1.25, vw / 2, vh / 2);
      else if (n === 'out') zoomAt(zoom / 1.25, vw / 2, vh / 2);
      else if (typeof n === 'number') zoomAt(n, vw / 2, vh / 2);
      return api;
    }

    /* ---------------- selection ---------------- */
    function setSel(ids, silent) {
      ids = ids.filter(function (id, i) { return idx.has(id) && ids.indexOf(id) === i; });
      const same = ids.length === sel.length && ids.every(function (id, i) { return id === sel[i]; });
      sel = ids;
      if (ids.length) {                             // selecting inside a group moves the scope there
        const p = idx.get(ids[0]).parent;
        scopeId = p ? p.id : null;
      }
      if (!same && !silent) { emit('select', { ids: sel.slice() }); }
      drawOverlay();
    }
    function select(ids) { endEdit(true); setSel(ids || []); return api; }
    const selection = function () { return sel.slice(); };

    function enterGroup(id) {
      const n = nodeOf(id);
      if (!n || n.type !== 'group') return api;
      scopeId = id; sel = []; hover = null;
      emit('select', { ids: [] }); drawOverlay();
      return api;
    }
    function exitGroup() {
      if (!scopeId) return api;
      const g = idx.get(scopeId);
      const was = scopeId;
      scopeId = g.parent ? g.parent.id : null;
      setSel([was]);
      return api;
    }

    /* ---------------- hit testing ---------------- */
    function distSeg(px, py, ax, ay, bx, by) {
      const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
      let t = l2 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0;
      t = clamp(t, 0, 1);
      return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
    }
    function inPoly(pts, x, y) {
      let c = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        if ((pts[i][1] > y) !== (pts[j][1] > y) && x < (pts[j][0] - pts[i][0]) * (y - pts[i][1]) / (pts[j][1] - pts[i][1]) + pts[i][0]) c = !c;
      }
      return c;
    }
    function hitLeaf(n, M, wx, wy) {
      const tol = 3 / zoom;
      const p = G.apply(G.inv(M), wx, wy);
      const x = p[0], y = p[1], w = n.w, h = n.h;
      const sw = (n.stroke && n.strokeWidth > 0 ? n.strokeWidth : 0) / 2;
      if (n.type === 'text') return x >= -tol && x <= w + tol && y >= -tol && y <= h + tol;
      if (n.type === 'line') return distSeg(x, y, 0, 0, w, h) <= Math.max(sw, 1) + tol;
      const filled = !!n.fill;
      if (n.type === 'rect') {
        const inOuter = x >= -sw - tol && x <= w + sw + tol && y >= -sw - tol && y <= h + sw + tol;
        if (!inOuter) return false;
        if (filled) return true;
        return !(x > sw - tol && x < w - sw + tol && y > sw - tol && y < h - sw + tol);
      }
      if (n.type === 'ellipse') {
        const rx = w / 2, ry = h / 2;
        if (rx <= 0 || ry <= 0) return false;
        const d = Math.hypot((x - rx) / rx, (y - ry) / ry);
        if (filled) return d <= 1 + (sw + tol) / Math.min(rx, ry);
        return Math.abs(d - 1) * Math.min(rx, ry) <= sw + tol;
      }
      const pts = LogoRender.shapeD(n).replace(/^M|Z$/g, '').split('L').map(function (s) { return s.split(' ').map(Number); });
      if (filled && inPoly(pts, x, y)) return true;
      if (!sw && !filled) return false;
      for (let i = 0; i < pts.length; i++) {
        const q = pts[(i + 1) % pts.length];
        if (distSeg(x, y, pts[i][0], pts[i][1], q[0], q[1]) <= sw + tol) return true;
      }
      return false;
    }
    function hitIn(n, M, wx, wy) {
      if (n.hidden) return false;
      const m = G.mul(M, G.nodeMatrix(n));
      if (n.type === 'group') return n.children.some(function (c) { return hitIn(c, m, wx, wy); });
      return hitLeaf(n, m, wx, wy);
    }
    // Topmost selectable node of the current scope under a world point (or null).
    function hitTop(wx, wy, deep) {
      const list = listOf(scopeId);
      const M = scopeId ? worldM(scopeId) : G.I;
      for (let i = list.length - 1; i >= 0; i--) {
        const n = list[i];
        if (n.locked || n.hidden) continue;
        if (hitIn(n, M, wx, wy)) return n.id;
      }
      return null;
    }
    // Child of group `g` under the point (for double-click entering).
    function hitChild(g, wx, wy) {
      const M = worldM(g.id);
      for (let i = g.children.length - 1; i >= 0; i--) {
        const c = g.children[i];
        if (!c.locked && hitIn(c, M, wx, wy)) return c.id;
      }
      return null;
    }

    /* ---------------- tools ---------------- */
    function setTool(t) {
      if (TOOLS.indexOf(t) < 0 || t === tool) return api;
      endEdit(true);
      tool = t; hover = null;
      svg.setAttribute('data-tool', t);
      emit('tool', { tool: t }); drawOverlay();
      return api;
    }

    /* ---------------- mutations ---------------- */
    function afterEdit(label, merge) { settle(); commit(label, merge); }

    function defaultTextSize() { return Math.round(clamp(doc.artboard.h * 0.15, 24, 160)); }

    function addInternal(spec, list) {
      spec = clone(spec) || {};
      const n = LogoDoc.makeNode(spec);
      if (n.type === 'text' && !spec.font) {
        const hw = tokens.fonts && tokens.fonts.heading ? tokens.fonts.heading.weight : 400;
        n.font = { ref: 'heading', weight: hw || 400, style: 'normal' };
      }
      if (n.type === 'text' && spec.size == null) n.size = defaultTextSize();
      if (n.type === 'text') { const g = LogoRender.geometrySync(n, tokens); if (g) { n.w = g.w; n.h = g.h; } }
      const ab = doc.artboard;
      if (spec.x == null || spec.y == null) {
        n.x = (ab.w - n.w) / 2; n.y = (ab.h - n.h) / 2;
        if (spec.x != null) n.x = spec.x;
        if (spec.y != null) n.y = spec.y;
      }
      (list || listOf(scopeId)).push(n);
      return n;
    }
    function add(spec) {
      const n = addInternal(spec);
      reindex();
      afterEdit('add');
      setSel([n.id]);
      return n.id;
    }

    function patchNode(n, patch) {
      patch = clone(patch);
      if (n.type === 'group' && (patch.w != null || patch.h != null)) {
        const sx = patch.w != null && n.w > 0 ? patch.w / n.w : 1, sy = patch.h != null && n.h > 0 ? patch.h / n.h : 1;
        scaleGroup(n, sx, sy);
        delete patch.w; delete patch.h;
        n.w *= sx; n.h *= sy;
      }
      delete patch.id; delete patch.type;
      Object.assign(n, patch);
    }
    function update(ids, patch, o) {
      ids = [].concat(ids).filter(function (id) { return idx.has(id); });
      if (!ids.length) return api;
      ids.forEach(function (id) { patchNode(nodeOf(id), patch); });
      afterEdit('update', o && o.merge);
      return api;
    }

    function remove(ids) {
      ids = [].concat(ids).filter(function (id) { return idx.has(id); });
      if (!ids.length) return api;
      ids.forEach(function (id) {
        const e = idx.get(id);
        if (!e) return;
        const i = e.list.indexOf(e.node);
        if (i >= 0) e.list.splice(i, 1);
        reindex();
      });
      if (scopeId && !idx.has(scopeId)) scopeId = null;
      afterEdit('remove');
      return api;
    }

    function group(ids) {
      ids = [].concat(ids).filter(function (id) { return idx.has(id); });
      if (!ids.length) return null;
      const first = idx.get(ids[0]);
      const list = first.list;
      const members = list.filter(function (n) { return ids.indexOf(n.id) >= 0; });
      if (!members.length) return null;
      let U = null;
      members.forEach(function (c) { U = G.union(U, G.rectBounds(G.nodeMatrix(c), 0, 0, c.w, c.h)); });
      const top = Math.max.apply(null, members.map(function (m) { return list.indexOf(m); }));
      const g = LogoDoc.makeNode({ type: 'group', x: U[0], y: U[1], w: U[2] - U[0], h: U[3] - U[1], children: [] });
      members.forEach(function (c) { c.x -= U[0]; c.y -= U[1]; list.splice(list.indexOf(c), 1); g.children.push(c); });
      list.splice(top - (members.length - 1), 0, g);
      reindex();
      afterEdit('group');
      setSel([g.id]);
      return g.id;
    }
    function ungroup(id) {
      const e = idx.get(id);
      if (!e || e.node.type !== 'group') return [];
      const g = e.node, M = G.nodeMatrix(g), flipped = g.flipX || g.flipY;
      g.children.forEach(function (c) {
        if (!flipped) {
          const p = G.apply(M, c.x + c.w / 2, c.y + c.h / 2);
          c.x = p[0] - c.w / 2; c.y = p[1] - c.h / 2; c.rotation = G.normAngle(c.rotation + g.rotation);
        } else {
          Object.assign(c, G.decompose(G.mul(M, G.nodeMatrix(c)), c.w, c.h));
        }
        c.opacity = c.opacity * g.opacity;
        if (g.hidden) c.hidden = true;
        if (g.locked) c.locked = true;
      });
      const i = e.list.indexOf(g);
      e.list.splice.apply(e.list, [i, 1].concat(g.children));
      const ids = g.children.map(function (c) { return c.id; });
      reindex();
      afterEdit('ungroup');
      setSel(ids);
      return ids;
    }

    function reorder(id, where) {
      const e = idx.get(id);
      if (!e) return api;
      const list = e.list, i = list.indexOf(e.node);
      let j = where === 'forward' ? i + 1 : where === 'backward' ? i - 1 : where === 'front' ? list.length - 1 : where === 'back' ? 0 : Number(where);
      j = clamp(isFinite(j) ? j : i, 0, list.length - 1);
      if (j === i) return api;
      list.splice(i, 1); list.splice(j, 0, e.node);
      afterEdit('reorder');
      return api;
    }

    function duplicate(ids, offset) {
      ids = [].concat(ids).filter(function (id) { return idx.has(id); });
      const off = offset == null ? 10 : offset, out = [];
      ids.forEach(function (id) {
        const e = idx.get(id);
        const c = LogoDoc.cloneNode(e.node);
        c.x += off; c.y += off; c.name = e.node.name;
        e.list.splice(e.list.indexOf(e.node) + 1, 0, c);
        out.push(c.id);
      });
      reindex();
      afterEdit('duplicate');
      setSel(out);
      return out;
    }

    function moveWorld(ids, dx, dy) {
      ids.forEach(function (id) {
        const d = G.vec(G.inv(parentM(id)), dx, dy), n = nodeOf(id);
        n.x += d[0]; n.y += d[1];
      });
    }
    function align(kind, relativeTo) {
      const ids = sel.filter(function (id) { return idx.has(id); });
      if (!ids.length) return api;
      if (relativeTo !== 'artboard' && ids.length < 2) return api;
      const ref = relativeTo === 'artboard' ? [0, 0, doc.artboard.w, doc.artboard.h] : unionBox(ids);
      ids.forEach(function (id) {
        const b = worldBox(id);
        let dx = 0, dy = 0;
        if (kind === 'left') dx = ref[0] - b[0];
        else if (kind === 'right') dx = ref[2] - b[2];
        else if (kind === 'hcenter') dx = (ref[0] + ref[2]) / 2 - (b[0] + b[2]) / 2;
        else if (kind === 'top') dy = ref[1] - b[1];
        else if (kind === 'bottom') dy = ref[3] - b[3];
        else if (kind === 'vcenter') dy = (ref[1] + ref[3]) / 2 - (b[1] + b[3]) / 2;
        moveWorld([id], dx, dy);
      });
      afterEdit('align');
      return api;
    }
    function distribute(axis) {
      const ids = sel.filter(function (id) { return idx.has(id); });
      if (ids.length < 3) return api;
      const a = axis === 'v' ? 1 : 0;
      const items = ids.map(function (id) { return { id: id, b: worldBox(id) }; }).sort(function (p, q) { return p.b[a] - q.b[a]; });
      const span = Math.max.apply(null, items.map(function (i) { return i.b[a + 2]; })) - items[0].b[a];
      const sum = items.reduce(function (s, i) { return s + (i.b[a + 2] - i.b[a]); }, 0);
      const gap = (span - sum) / (items.length - 1);
      let pos = items[0].b[a];
      items.forEach(function (it) {
        const d = pos - it.b[a];
        if (a === 0) moveWorld([it.id], d, 0); else moveWorld([it.id], 0, d);
        pos += (it.b[a + 2] - it.b[a]) + gap;
      });
      afterEdit('distribute');
      return api;
    }
    function flip(ids, dir) {
      [].concat(ids || sel).filter(function (id) { return idx.has(id); }).forEach(function (id) {
        const n = nodeOf(id);
        if (dir === 'v') n.flipY = !n.flipY; else n.flipX = !n.flipX;
        n.rotation = G.normAngle(-n.rotation);
      });
      afterEdit('flip');
      return api;
    }
    function nudge(dx, dy) {
      if (!sel.length) return api;
      moveWorld(sel, dx, dy);
      afterEdit('nudge', 'nudge:' + sel.join(','));
      return api;
    }
    function setArtboard(patch) {
      Object.assign(doc.artboard, clone(patch));
      renderContent(); drawOverlay();
      commit('artboard');
      if (autoFit) zoomTo('fit');
      return api;
    }
    function setName(name) { doc.name = String(name); commit('name'); return api; }
    function selectAll() { setSel(listOf(scopeId).filter(function (n) { return !n.hidden && !n.locked; }).map(function (n) { return n.id; })); return api; }

    // Scales a group's children (the group's own x / y / w / h are the caller's job).
    function scaleGroup(g, sx, sy) {
      g.children.forEach(function (c) { scaleNode(c, sx, sy, true); c.x *= sx; c.y *= sy; });
    }
    // Scales a node's size in its own frame; rotated nodes take the geometric mean unless axis-aligned.
    function scaleNode(n, sx, sy, strokes) {
      const r = Math.abs(((n.rotation % 180) + 180) % 180);
      let ex = sx, ey = sy;
      if (Math.abs(r - 90) < 0.5) { ex = sy; ey = sx; }
      else if (r > 0.5 && r < 179.5) { ex = ey = Math.sqrt(sx * sy); }
      if (n.type === 'text') {
        n.size = Math.max(1, n.size * ex);
        n.w *= ex; n.h *= ex;
      } else if (n.type === 'group') {
        scaleGroup(n, ex, ey); n.w *= ex; n.h *= ey;
      } else {
        n.w *= ex; n.h *= ey;
        if (n.radius) n.radius *= Math.min(ex, ey);
      }
      if (strokes && n.strokeWidth) n.strokeWidth *= (ex + ey) / 2;
    }

    /* ---------------- clipboard ---------------- */
    function copy() {
      if (!sel.length) return;
      const list = listOf(scopeId);
      clipboard = list.filter(function (n) { return sel.indexOf(n.id) >= 0; }).map(clone);
      pasteCount = 0;
    }
    function paste(inPlace) {
      if (!clipboard || !clipboard.length) return [];
      pasteCount += inPlace ? 0 : 1;
      const out = [];
      clipboard.forEach(function (n) {
        const c = LogoDoc.cloneNode(n);
        c.x += pasteCount * 10; c.y += pasteCount * 10;
        listOf(scopeId).push(c); out.push(c.id);
      });
      reindex();
      afterEdit('paste');
      setSel(out);
      return out;
    }

    /* ---------------- snapping ---------------- */
    function snapTargets(excl) {
      const out = [];
      listOf(scopeId).forEach(function (n) {
        if (n.hidden || excl.indexOf(n.id) >= 0) return;
        out.push(worldBox(n.id));
      });
      return out;
    }
    // Snap a world box. Returns the shift and fills guides / hints.
    function snapBox(box, others, axes, spacing) {
      const thr = SNAP_PX / zoom, W = doc.artboard.w, H = doc.artboard.h;
      const shift = [0, 0];
      guides = []; hints = [];
      for (let a = 0; a < 2; a++) {
        if (axes && !axes[a]) continue;
        const lo = box[a], hi = box[a + 2], mid = (lo + hi) / 2;
        const tg = [0, (a ? H : W) / 2, a ? H : W].map(function (v) { return v; });
        const cand = tg.slice();
        others.forEach(function (o) { cand.push(o[a], (o[a] + o[a + 2]) / 2, o[a + 2]); });
        let best = null;
        [lo, mid, hi].forEach(function (m) {
          cand.forEach(function (t) {
            const d = t - m;
            if (Math.abs(d) <= thr && (best === null || Math.abs(d) < Math.abs(best))) best = d;
          });
        });
        if (best !== null) shift[a] = best;
        else if (spacing) {
          const sp = spacingSnap(a, box, others, thr);
          if (sp !== null) shift[a] = sp;
        }
      }
      const nb = [box[0] + shift[0], box[1] + shift[1], box[2] + shift[0], box[3] + shift[1]];
      // guides: every target line that the shifted box now sits on
      for (let a = 0; a < 2; a++) {
        if (axes && !axes[a]) continue;
        const b = 1 - a;
        const mine = [nb[a], (nb[a] + nb[a + 2]) / 2, nb[a + 2]];
        const sources = [{ v: [0, (a ? H : W) / 2, a ? H : W], span: [0, b ? H : W] }];
        others.forEach(function (o) { sources.push({ v: [o[a], (o[a] + o[a + 2]) / 2, o[a + 2]], span: [o[b], o[b + 2]] }); });
        sources.forEach(function (s) {
          mine.forEach(function (m) {
            s.v.forEach(function (t) {
              if (Math.abs(t - m) > 0.01) return;
              const lo2 = Math.min(nb[b], s.span[0]), hi2 = Math.max(nb[b + 2], s.span[1]);
              guides.push(a === 0 ? [t, lo2, t, hi2] : [lo2, t, hi2, t]);
            });
          });
        });
        if (spacing) spacingHints(a, nb, others);
      }
      return shift;
    }
    function crossOverlap(a, box, o) { const b = 1 - a; return o[b] < box[b + 2] && o[b + 2] > box[b]; }
    function spacingSnap(a, box, others, thr) {
      const cand = others.filter(function (o) { return crossOverlap(a, box, o); });
      const L = cand.filter(function (o) { return o[a + 2] <= box[a] + 0.01; }).sort(function (p, q) { return q[a + 2] - p[a + 2]; });
      const R = cand.filter(function (o) { return o[a] >= box[a + 2] - 0.01; }).sort(function (p, q) { return p[a] - q[a]; });
      const opts = [];
      if (L[0] && R[0]) opts.push((R[0][a] - box[a + 2] - (box[a] - L[0][a + 2])) / 2);
      if (L[0] && L[1]) opts.push((L[0][a + 2] + (L[0][a] - L[1][a + 2])) - box[a]);
      if (R[0] && R[1]) opts.push((R[0][a] - (R[1][a] - R[0][a + 2])) - box[a + 2]);
      let best = null;
      opts.forEach(function (s) { if (Math.abs(s) <= thr && (best === null || Math.abs(s) < Math.abs(best))) best = s; });
      return best;
    }
    function spacingHints(a, box, others) {
      const b = 1 - a, eps = 0.5;
      const cand = others.filter(function (o) { return crossOverlap(a, box, o); });
      const L = cand.filter(function (o) { return o[a + 2] <= box[a] + eps; }).sort(function (p, q) { return q[a + 2] - p[a + 2]; });
      const R = cand.filter(function (o) { return o[a] >= box[a + 2] - eps; }).sort(function (p, q) { return p[a] - q[a]; });
      const seg = function (from, to, ref) {
        const c = (Math.max(box[b], ref[b]) + Math.min(box[b + 2], ref[b + 2])) / 2;
        hints.push(a === 0 ? [from, c, to, c] : [c, from, c, to]);
      };
      if (L[0] && R[0]) {
        const gl = box[a] - L[0][a + 2], gr = R[0][a] - box[a + 2];
        if (Math.abs(gl - gr) < eps) { seg(L[0][a + 2], box[a], L[0]); seg(box[a + 2], R[0][a], R[0]); }
      }
      if (L[0] && L[1] && Math.abs((box[a] - L[0][a + 2]) - (L[0][a] - L[1][a + 2])) < eps) { seg(L[1][a + 2], L[0][a], L[0]); seg(L[0][a + 2], box[a], L[0]); }
      if (R[0] && R[1] && Math.abs((R[0][a] - box[a + 2]) - (R[1][a] - R[0][a + 2])) < eps) { seg(box[a + 2], R[0][a], R[0]); seg(R[0][a + 2], R[1][a], R[1]); }
    }

    /* ---------------- selection frame and overlay ---------------- */
    function frameOf(ids) {
      if (!ids.length) return null;
      if (ids.length === 1) {
        const n = nodeOf(ids[0]), M = worldM(ids[0]);
        const u = G.vec(M, 1, 0), v = G.vec(M, 0, 1);
        const lu = Math.hypot(u[0], u[1]) || 1, lv = Math.hypot(v[0], v[1]) || 1;
        return { c: G.apply(M, n.w / 2, n.h / 2), u: [u[0] / lu, u[1] / lu], v: [v[0] / lv, v[1] / lv], w: n.w, h: n.h, single: true };
      }
      const b = unionBox(ids);
      return { c: [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2], u: [1, 0], v: [0, 1], w: b[2] - b[0], h: b[3] - b[1], single: false };
    }
    const fpt = function (f, hx, hy) {
      return [f.c[0] + f.u[0] * hx * f.w / 2 + f.v[0] * hy * f.h / 2, f.c[1] + f.u[1] * hx * f.w / 2 + f.v[1] * hy * f.h / 2];
    };
    function polyAttr(pts) { return pts.map(function (p) { const s = toScreen(p[0], p[1]); return s[0].toFixed(1) + ',' + s[1].toFixed(1); }).join(' '); }
    function boxPoly(id) {
      const n = nodeOf(id), M = worldM(id);
      return [G.apply(M, 0, 0), G.apply(M, n.w, 0), G.apply(M, n.w, n.h), G.apply(M, 0, n.h)];
    }
    const HANDLES = [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]];
    function cursorFor(f, hx, hy) {
      const p = fpt(f, hx, hy), c = f.c;
      const ang = Math.atan2(p[1] - c[1], p[0] - c[0]) * 180 / Math.PI;
      const k = ((Math.round(ang / 45) % 4) + 4) % 4;
      return ['ew-resize', 'nwse-resize', 'ns-resize', 'nesw-resize'][k];
    }

    let ovQueued = false;
    function drawOverlay() {
      if (ovQueued) return;
      ovQueued = true;
      const run = function () { if (!ovQueued) return; ovQueued = false; if (!destroyed) paintOverlay(); };
      requestAnimationFrame(run);
      setTimeout(run, 40);                       // rAF is paused in background tabs / windows
    }
    function paintOverlay() {
      while (ov.firstChild) ov.removeChild(ov.firstChild);
      if (scopeId && idx.has(scopeId)) mk('polygon', { class: 'lg-scope', points: polyAttr(boxPoly(scopeId)) }, ov);
      if (hover && idx.has(hover) && sel.indexOf(hover) < 0 && !drag) mk('polygon', { class: 'lg-hover', points: polyAttr(boxPoly(hover)) }, ov);
      sel.forEach(function (id) { if (idx.has(id) && (sel.length > 1 || nodeOf(id).locked)) mk('polygon', { class: 'lg-sel-node', points: polyAttr(boxPoly(id)) }, ov); });
      guides.forEach(function (g) {
        const a = toScreen(g[0], g[1]), b = toScreen(g[2], g[3]);
        mk('line', { class: 'lg-guide', x1: a[0], y1: a[1], x2: b[0], y2: b[1] }, ov);
      });
      hints.forEach(function (g) {
        const a = toScreen(g[0], g[1]), b = toScreen(g[2], g[3]);
        mk('line', { class: 'lg-hint', x1: a[0], y1: a[1], x2: b[0], y2: b[1] }, ov);
        const horiz = Math.abs(a[1] - b[1]) < 0.01;
        [a, b].forEach(function (p) {
          mk('line', horiz ? { class: 'lg-hint', x1: p[0], y1: p[1] - 4, x2: p[0], y2: p[1] + 4 } : { class: 'lg-hint', x1: p[0] - 4, y1: p[1], x2: p[0] + 4, y2: p[1] }, ov);
        });
      });
      if (marquee) {
        const a = toScreen(marquee[0], marquee[1]), b = toScreen(marquee[2], marquee[3]);
        mk('rect', { class: 'lg-marquee', x: Math.min(a[0], b[0]), y: Math.min(a[1], b[1]), width: Math.abs(b[0] - a[0]), height: Math.abs(b[1] - a[1]) }, ov);
      }
      if (sel.length && !editing) {
        const f = frameOf(sel);
        if (!f) return;
        const corners = [fpt(f, -1, -1), fpt(f, 1, -1), fpt(f, 1, 1), fpt(f, -1, 1)];
        mk('polygon', { class: 'lg-frame', points: polyAttr(corners) }, ov);
        const locked = sel.every(function (id) { return nodeOf(id).locked; });
        if (locked) return;
        const sw = Math.hypot(fpt(f, 1, 0)[0] - fpt(f, -1, 0)[0], fpt(f, 1, 0)[1] - fpt(f, -1, 0)[1]) * zoom;
        const sh = Math.hypot(fpt(f, 0, 1)[0] - fpt(f, 0, -1)[0], fpt(f, 0, 1)[1] - fpt(f, 0, -1)[1]) * zoom;
        HANDLES.forEach(function (h) {
          const side = h[0] === 0 || h[1] === 0;
          if (side && ((h[0] === 0 && sw < 28) || (h[1] === 0 && sh < 28))) return;
          const s = toScreen.apply(null, fpt(f, h[0], h[1]));
          const cur = cursorFor(f, h[0], h[1]);
          mk('rect', { class: 'lg-hit', x: s[0] - 8, y: s[1] - 8, width: 16, height: 16, 'data-h': h.join(','), style: 'cursor:' + cur }, ov);
          mk('rect', { class: 'lg-handle', x: s[0] - 4, y: s[1] - 4, width: 8, height: 8 }, ov);
        });
        // rotate handle: above the top edge, along the frame's -v axis
        const top = toScreen.apply(null, fpt(f, 0, -1));
        const vs = [f.v[0], f.v[1]];
        const rp = [top[0] - vs[0] * 24, top[1] - vs[1] * 24];
        mk('line', { class: 'lg-rot-line', x1: top[0], y1: top[1], x2: rp[0], y2: rp[1] }, ov);
        mk('circle', { class: 'lg-hit', cx: rp[0], cy: rp[1], r: 11, 'data-h': 'rot', style: 'cursor:grab' }, ov);
        mk('circle', { class: 'lg-handle lg-rot', cx: rp[0], cy: rp[1], r: 5 }, ov);
      }
    }

    /* ---------------- pointer: down ---------------- */
    function beginPan(e) {
      drag = { type: 'pan', sx: e.clientX, sy: e.clientY, pan0: pan.slice() };
      svg.classList.add('is-panning');
    }
    function onDown(e) {
      if (editing && e.target !== editing.ta) endEdit(true);
      container.focus({ preventScroll: true });
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) { startPinch(); return; }
      if (pointers.size > 2 || e.button === 2) return;
      try { svg.setPointerCapture(e.pointerId); } catch (x) { /* synthetic pointer */ }
      if (e.button === 1 || spaceDown || tool === 'hand') { beginPan(e); e.preventDefault(); return; }
      const w = evWorld(e);
      const handle = e.target.closest && e.target.closest('[data-h]');
      if (tool !== 'select') { beginCreate(e, w); return; }
      if (handle && sel.length) { beginHandle(e, handle.getAttribute('data-h'), w); return; }
      const hit = hitTop(w[0], w[1]);
      if (hit) {
        const already = sel.indexOf(hit) >= 0;
        if (e.shiftKey) {
          if (already) { drag = { type: 'pending-toggle', id: hit, start: evPoint(e) }; }
          else setSel(sel.concat([hit]));
        } else if (!already) setSel([hit]);
        if (!drag) beginMove(e, w);
        else drag.w0 = w;
      } else {
        if (!e.shiftKey) setSel([]);
        drag = { type: 'marquee', w0: w, base: e.shiftKey ? sel.slice() : [], start: evPoint(e), moved: false };
      }
      e.preventDefault();
    }

    function snapshotSel() {
      return sel.map(function (id) {
        const n = nodeOf(id);
        return { id: id, orig: clone(n), pinv: G.inv(parentM(id)) };
      });
    }
    function beginMove(e, w) {
      const items = snapshotSel().filter(function (it) { return !it.orig.locked; });
      if (!items.length) { drag = null; return; }
      drag = { type: 'move', w0: w, items: items, start: evPoint(e), moved: false, box0: unionBox(sel), others: snapTargets(sel) };
    }
    function beginHandle(e, h, w) {
      const items = snapshotSel().filter(function (it) { return !it.orig.locked; });
      if (!items.length) return;
      const f = frameOf(sel);
      if (h === 'rot') {
        drag = { type: 'rotate', f: f, items: items, a0: Math.atan2(w[1] - f.c[1], w[0] - f.c[0]), moved: false, start: evPoint(e) };
      } else {
        const hv = h.split(',').map(Number);
        const hp = fpt(f, hv[0], hv[1]);
        drag = { type: 'resize', f: f, hv: hv, items: items, off: [hp[0] - w[0], hp[1] - w[1]], moved: false, start: evPoint(e), others: snapTargets(sel) };
      }
    }
    function startPinch() {
      const pts = Array.from(pointers.values());
      drag = { type: 'pinch', d0: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y), z0: zoom, c0: [(pts[0].x + pts[1].x) / 2, (pts[0].y + pts[1].y) / 2], pan0: pan.slice() };
    }

    /* ---------------- pointer: create ---------------- */
    function beginCreate(e, w) {
      drag = { type: 'create', tool: tool, w0: w, start: evPoint(e), node: null, others: snapTargets([]) };
      e.preventDefault();
    }
    function createMove(e) {
      const d = drag, p = evPoint(e);
      if (!d.node && Math.hypot(p[0] - d.start[0], p[1] - d.start[1]) < DRAG_PX) return;
      if (d.tool === 'text') return;
      if (!d.node) {
        d.node = LogoDoc.makeNode({ type: d.tool, x: d.w0[0], y: d.w0[1], w: 1, h: d.tool === 'line' ? 0 : 1 });
        listOf(scopeId).push(d.node);
        reindex(); renderContent();
      }
      let w = evWorld(e);
      guides = []; hints = [];
      if (!(e.metaKey || e.ctrlKey)) {
        const sh = snapBox([w[0], w[1], w[0], w[1]], d.others, null, false);
        w = [w[0] + sh[0], w[1] + sh[1]];
      }
      let dx = w[0] - d.w0[0], dy = w[1] - d.w0[1];
      if (e.shiftKey) {
        if (d.tool === 'line') {
          const ang = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) * Math.PI / 4, len = Math.hypot(dx, dy);
          dx = Math.cos(ang) * len; dy = Math.sin(ang) * len;
        } else { const m = Math.max(Math.abs(dx), Math.abs(dy)); dx = Math.sign(dx || 1) * m; dy = Math.sign(dy || 1) * m; }
      }
      const n = d.node;
      if (e.altKey && d.tool !== 'line') { n.x = d.w0[0] - Math.abs(dx); n.y = d.w0[1] - Math.abs(dy); n.w = Math.abs(dx) * 2; n.h = Math.abs(dy) * 2; }
      else { n.x = Math.min(d.w0[0], d.w0[0] + dx); n.y = Math.min(d.w0[1], d.w0[1] + dy); n.w = Math.abs(dx); n.h = Math.abs(dy); }
      if (d.tool === 'line') n.flipY = (dx < 0) !== (dy < 0) && Math.abs(dy) > 0.001;
      n.w = Math.max(n.w, d.tool === 'line' ? 0 : 1); n.h = Math.max(n.h, d.tool === 'line' ? 0 : 1);
      replaceEl(n.id);
      sel = [n.id]; drawOverlay();
    }
    function createUp(d) {
      guides = []; hints = [];
      let n = d.node;
      if (!n) {
        const ab = doc.artboard, s = Math.round(Math.min(ab.w, ab.h) * 0.25), cx = d.w0[0], cy = d.w0[1];
        if (d.tool === 'text') {
          const size = defaultTextSize();
          n = addInternal({ type: 'text', text: 'Text', size: size, x: cx, y: cy - size * 0.6 });
        } else if (d.tool === 'line') {
          const len = Math.round(ab.w * 0.3);
          n = addInternal({ type: 'line', w: len, h: 0, x: cx - len / 2, y: cy });
        } else n = addInternal({ type: d.tool, w: s, h: s, x: cx - s / 2, y: cy - s / 2 });
      }
      reindex();
      if (n.type === 'text') {
        syncTexts(); fixGroups(); reindex(); refreshAll();
        setSel([n.id]);
        setToolSilent('select');
        editText(n.id, true);
        return;
      }
      afterEdit('add');
      setSel([n.id]);
      setToolSilent('select');
    }
    function setToolSilent(t) { tool = t; svg.setAttribute('data-tool', t); emit('tool', { tool: t }); }

    /* ---------------- pointer: move ---------------- */
    function onMove(e) {
      if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (!drag) { hoverAt(e); return; }
      const d = drag;
      if (d.type === 'pinch') {
        const pts = Array.from(pointers.values());
        if (pts.length < 2) return;
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        const c = [(pts[0].x + pts[1].x) / 2, (pts[0].y + pts[1].y) / 2];
        const r = svg.getBoundingClientRect();
        const z = clamp(d.z0 * dist / (d.d0 || 1), ZMIN, ZMAX);
        const w0 = [(d.c0[0] - r.left - d.pan0[0]) / d.z0, (d.c0[1] - r.top - d.pan0[1]) / d.z0];
        setView(z, c[0] - r.left - w0[0] * z, c[1] - r.top - w0[1] * z, false);
        return;
      }
      if (d.type === 'pan') { setView(zoom, d.pan0[0] + e.clientX - d.sx, d.pan0[1] + e.clientY - d.sy, false); return; }
      if (d.type === 'create') { createMove(e); return; }
      const p = evPoint(e);
      if (!d.moved && d.start && Math.hypot(p[0] - d.start[0], p[1] - d.start[1]) < DRAG_PX) return;
      if (d.type === 'pending-toggle') { beginMove(e, d.w0 || evWorld(e)); if (drag) drag.moved = false; return; }
      d.moved = true;
      if (d.type === 'move') moveMove(e);
      else if (d.type === 'resize') resizeMove(e);
      else if (d.type === 'rotate') rotateMove(e);
      else if (d.type === 'marquee') marqueeMove(e);
    }
    function hoverAt(e) {
      if (tool !== 'select' || spaceDown) { if (hover) { hover = null; drawOverlay(); } return; }
      const t = e.target;
      if (t.closest && t.closest('[data-h]')) { if (hover) { hover = null; drawOverlay(); } return; }
      const w = evWorld(e), h = hitTop(w[0], w[1]);
      if (h !== hover) { hover = h; drawOverlay(); }
    }

    function moveMove(e) {
      const d = drag;
      if (!d.dup && e.altKey) {                       // alt-drag copies: duplicate in place, drag the copies
        d.dup = true;
        const ids = d.items.map(function (it) { return it.id; });
        const out = [];
        ids.forEach(function (id) {
          const en = idx.get(id);
          const c = LogoDoc.cloneNode(en.node);
          en.list.splice(en.list.indexOf(en.node) + 1, 0, c);
          out.push(c.id);
        });
        reindex();
        sel = out; renderContent();
        d.items = snapshotSel();
        d.others = snapTargets(sel);
      }
      const w = evWorld(e);
      let dx = w[0] - d.w0[0], dy = w[1] - d.w0[1];
      if (e.shiftKey) { if (Math.abs(dx) > Math.abs(dy)) dy = 0; else dx = 0; }
      if (!(e.metaKey || e.ctrlKey)) {
        const b = d.box0, sh = snapBox([b[0] + dx, b[1] + dy, b[2] + dx, b[3] + dy], d.others, [!e.shiftKey || dx !== 0, !e.shiftKey || dy !== 0], true);
        dx += sh[0]; dy += sh[1];
      } else { guides = []; hints = []; }
      d.items.forEach(function (it) {
        const n = nodeOf(it.id), v = G.vec(it.pinv, dx, dy);
        n.x = it.orig.x + v[0]; n.y = it.orig.y + v[1];
        setTransformAttr(it.id);
      });
      drawOverlay();
    }

    function restoreNode(it) {
      const n = nodeOf(it.id);
      Object.keys(n).forEach(function (k) { delete n[k]; });
      Object.assign(n, clone(it.orig));
      return n;
    }
    function resizeMove(e) {
      const d = drag, f = d.f, hx = d.hv[0], hy = d.hv[1];
      let P = evWorld(e);
      P = [P[0] + d.off[0], P[1] + d.off[1]];
      guides = []; hints = [];
      // snap the dragged edge when the frame is axis aligned
      const axisAligned = (Math.abs(f.u[1]) < 1e-6 || Math.abs(f.u[0]) < 1e-6);
      if (axisAligned && !(e.metaKey || e.ctrlKey)) {
        const uIsX = Math.abs(f.u[0]) > 0.5;
        const xAff = uIsX ? hx !== 0 : hy !== 0, yAff = uIsX ? hy !== 0 : hx !== 0;
        const sh = snapBox([P[0], P[1], P[0], P[1]], d.others, [xAff, yAff], false);
        P = [P[0] + (xAff ? sh[0] : 0), P[1] + (yAff ? sh[1] : 0)];
      }
      const rel = [P[0] - f.c[0], P[1] - f.c[1]];
      const p = [rel[0] * f.u[0] + rel[1] * f.u[1], rel[0] * f.v[0] + rel[1] * f.v[1]];
      let w2 = f.w, h2 = f.h;
      if (hx) w2 = e.altKey ? 2 * hx * p[0] : hx * p[0] + f.w / 2;
      if (hy) h2 = e.altKey ? 2 * hy * p[1] : hy * p[1] + f.h / 2;
      w2 = Math.max(w2, f.w === 0 ? 0 : 1); h2 = Math.max(h2, f.h === 0 ? 0 : 1);
      const single = d.items.length === 1 ? d.items[0].orig : null;
      const prop = e.shiftKey || (single && single.type === 'text');
      if (prop && f.w > 0 && f.h > 0) {
        const s = hx && hy ? Math.max(w2 / f.w, h2 / f.h) : hx ? w2 / f.w : h2 / f.h;
        w2 = f.w * s; h2 = f.h * s;
      }
      const cx = e.altKey ? 0 : hx * (w2 - f.w) / 2, cy = e.altKey ? 0 : hy * (h2 - f.h) / 2;
      const c2 = [f.c[0] + f.u[0] * cx + f.v[0] * cy, f.c[1] + f.u[1] * cx + f.v[1] * cy];
      const sx = f.w > 0 ? w2 / f.w : 1, sy = f.h > 0 ? h2 / f.h : 1;
      d.items.forEach(function (it) {
        const n = restoreNode(it), o = it.orig;
        let cn;
        if (d.items.length === 1) {
          cn = G.apply(it.pinv, c2[0], c2[1]);
          if (o.type === 'text') { n.size = Math.max(1, o.size * sx); n.w = o.w * sx; n.h = o.h * sx; }
          else if (o.type === 'group') { scaleGroup(n, sx, sy); n.w = o.w * sx; n.h = o.h * sy; }
          else { n.w = w2; n.h = h2; }
        } else {
          const oc = G.apply(G.mul(G.inv(it.pinv), G.nodeMatrix(o)), o.w / 2, o.h / 2);
          const nc = [c2[0] + (oc[0] - f.c[0]) * sx, c2[1] + (oc[1] - f.c[1]) * sy];
          cn = G.apply(it.pinv, nc[0], nc[1]);
          scaleNode(n, sx, sy, true);
        }
        n.x = cn[0] - n.w / 2; n.y = cn[1] - n.h / 2;
        if (n.type === 'group') reindex();
        replaceEl(it.id);
      });
      drawOverlay();
    }

    function rotateMove(e) {
      const d = drag, f = d.f, w = evWorld(e);
      let delta = (Math.atan2(w[1] - f.c[1], w[0] - f.c[0]) - d.a0) * 180 / Math.PI;
      if (e.shiftKey) {
        const base = d.items.length === 1 ? d.items[0].orig.rotation : 0;
        delta = Math.round((base + delta) / 15) * 15 - base;
      }
      const rad = delta * Math.PI / 180, cs = Math.cos(rad), sn = Math.sin(rad);
      d.items.forEach(function (it) {
        const n = nodeOf(it.id), o = it.orig;
        n.rotation = G.normAngle(o.rotation + delta);
        if (d.items.length > 1) {
          const oc = G.apply(G.mul(G.inv(it.pinv), G.nodeMatrix(o)), o.w / 2, o.h / 2);
          const rx = oc[0] - f.c[0], ry = oc[1] - f.c[1];
          const cn = G.apply(it.pinv, f.c[0] + rx * cs - ry * sn, f.c[1] + rx * sn + ry * cs);
          n.x = cn[0] - n.w / 2; n.y = cn[1] - n.h / 2;
        }
        setTransformAttr(it.id);
      });
      drawOverlay();
    }

    function marqueeMove(e) {
      const d = drag, w = evWorld(e);
      marquee = [Math.min(d.w0[0], w[0]), Math.min(d.w0[1], w[1]), Math.max(d.w0[0], w[0]), Math.max(d.w0[1], w[1])];
      const hit = listOf(scopeId).filter(function (n) {
        if (n.hidden || n.locked) return false;
        const b = worldBox(n.id);
        return b[0] <= marquee[2] && b[2] >= marquee[0] && b[1] <= marquee[3] && b[3] >= marquee[1];
      }).map(function (n) { return n.id; });
      setSel(d.base.concat(hit.filter(function (id) { return d.base.indexOf(id) < 0; })));
      drawOverlay();
    }

    /* ---------------- pointer: up ---------------- */
    function onUp(e) {
      pointers.delete(e.pointerId);
      try { svg.releasePointerCapture(e.pointerId); } catch (x) { /* not captured */ }
      const d = drag;
      if (!d) return;
      if (d.type === 'pinch') { if (pointers.size < 2) drag = null; return; }
      drag = null;
      svg.classList.remove('is-panning');
      if (d.type === 'pan') return;
      if (d.type === 'create') { createUp(d); return; }
      if (d.type === 'pending-toggle') { setSel(sel.filter(function (id) { return id !== d.id; })); return; }
      if (d.type === 'marquee') { marquee = null; drawOverlay(); return; }
      guides = []; hints = [];
      if (d.moved) {
        afterEdit(d.type === 'move' ? (d.dup ? 'duplicate' : 'move') : d.type);
        if (d.dup) emit('select', { ids: sel.slice() });
      } else drawOverlay();
    }
    function onCancel(e) { pointers.delete(e.pointerId); }

    function onDbl(e) {
      if (tool !== 'select') return;
      const w = evWorld(e), hit = hitTop(w[0], w[1]);
      if (!hit) { if (scopeId) exitGroup(); return; }
      const n = nodeOf(hit);
      if (n.type === 'text') editText(hit);
      else if (n.type === 'group') {
        scopeId = hit;
        const c = hitChild(n, w[0], w[1]);
        setSel(c ? [c] : []);
      }
    }

    /* ---------------- wheel / gestures ---------------- */
    function onWheel(e) {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const p = evPoint(e);
        zoomAt(zoom * Math.exp(-clamp(e.deltaY, -50, 50) * 0.01), p[0], p[1]);
      } else {
        const dx = e.shiftKey && !e.deltaX ? e.deltaY : e.deltaX, dy = e.shiftKey && !e.deltaX ? 0 : e.deltaY;
        setView(zoom, pan[0] - dx, pan[1] - dy, false);
      }
    }
    let gz0 = 1;
    function onGestureStart(e) { e.preventDefault(); gz0 = zoom; }
    function onGestureChange(e) { e.preventDefault(); const p = evPoint(e); zoomAt(gz0 * e.scale, p[0], p[1]); }

    /* ---------------- text editing ---------------- */
    function editText(id, isNew) {
      const n = nodeOf(id);
      if (!n || n.type !== 'text' || n.locked) return api;
      endEdit(true);
      const ta = document.createElement('textarea');
      ta.className = 'lg-text-edit';
      ta.setAttribute('aria-label', 'Edit text');
      ta.spellcheck = false;
      ta.value = n.text;
      container.appendChild(ta);
      editing = { id: id, ta: ta, isNew: !!isNew, before: n.text };
      ta.addEventListener('input', function () {
        n.text = ta.value;
        syncTexts(); fixGroups(); reindex();
        replaceEl(id); drawOverlay(); positionEditor();
        emit('change', { reason: 'typing' });
      });
      ta.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' || (e.key === 'Enter' && (e.metaKey || e.ctrlKey))) { e.preventDefault(); e.stopPropagation(); endEdit(true); container.focus(); }
        else e.stopPropagation();
      });
      ta.addEventListener('blur', function () { if (editing && editing.ta === ta) endEdit(true); });
      positionEditor();
      ta.focus({ preventScroll: true });
      ta.select();
      drawOverlay();
      emit('edit', { id: id });
      return api;
    }
    function positionEditor() {
      if (!editing) return;
      const n = nodeOf(editing.id);
      if (!n) return;
      const M = worldM(editing.id), ta = editing.ta;
      const font = LogoDoc.resolveFont(n.font, tokens);
      const css = [M[0] * zoom, M[1] * zoom, M[2] * zoom, M[3] * zoom, M[4] * zoom + pan[0], M[5] * zoom + pan[1]];
      ta.style.width = Math.max(n.w, n.size * 0.5) + 'px';
      ta.style.height = n.h + 'px';
      ta.style.fontSize = n.size + 'px';
      ta.style.lineHeight = (n.lineHeight || 1.2);
      ta.style.letterSpacing = ((n.tracking || 0) / 1000) + 'em';
      ta.style.fontFamily = '"' + font.family + '", sans-serif';
      ta.style.fontWeight = font.weight;
      ta.style.textAlign = n.align || 'left';
      ta.style.textTransform = n.case === 'upper' ? 'uppercase' : n.case === 'lower' ? 'lowercase' : 'none';
      ta.style.transform = 'matrix(' + css.join(',') + ')';
    }
    function endEdit(commitIt, silent) {
      if (!editing) return;
      const ed = editing;
      editing = null;
      ed.ta.remove();
      const n = nodeOf(ed.id);
      if (!silent && n) {
        if (!n.text.trim()) {
          const e = idx.get(ed.id);
          e.list.splice(e.list.indexOf(n), 1);
          reindex();
          if (ed.isNew) { sel = sel.filter(function (id) { return id !== ed.id; }); settle(); emit('change', { reason: 'cancel' }); }
          else { sel = []; afterEdit('remove'); emit('select', { ids: [] }); }
        } else if (commitIt) { settle(); commit(ed.isNew ? 'add' : 'text'); }
      }
      emit('edit', { id: null });
      drawOverlay();
    }

    /* ---------------- keyboard ---------------- */
    function onKey(e) {
      const t = e.target;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable) return;   // typing in a field
      if (editing) return;
      const mod = e.metaKey || e.ctrlKey, k = e.key.toLowerCase();
      let handled = true;
      if (mod && k === 'z') { e.shiftKey ? redo() : undo(); }
      else if (mod && k === 'y') redo();
      else if (mod && k === 'g') { e.shiftKey ? (sel.length === 1 && ungroup(sel[0])) : (sel.length && group(sel)); }
      else if (mod && k === 'd') { if (sel.length) duplicate(sel); }
      else if (mod && k === 'c') copy();
      else if (mod && k === 'x') { copy(); remove(sel); }
      else if (mod && k === 'v') paste(e.shiftKey);
      else if (mod && k === 'a') selectAll();
      else if (mod && e.code === 'BracketRight') { sel.slice().forEach(function (id) { reorder(id, e.shiftKey || e.altKey ? 'front' : 'forward'); }); }
      else if (mod && e.code === 'BracketLeft') { sel.slice().reverse().forEach(function (id) { reorder(id, e.shiftKey || e.altKey ? 'back' : 'backward'); }); }
      else if (mod && (k === '=' || k === '+')) zoomTo('in');
      else if (mod && k === '-') zoomTo('out');
      else if (mod && k === '0') zoomTo('fit');
      else if (mod && k === '1') zoomTo(1);
      else if (!mod && !e.altKey && KEY_TOOLS[k]) setTool(KEY_TOOLS[k]);
      else if (k === 'delete' || k === 'backspace') { if (sel.length) remove(sel); }
      else if (k === 'escape') {
        if (tool !== 'select') setTool('select');
        else if (sel.length) setSel([]);
        else exitGroup();
      }
      else if (k === 'enter') {
        if (sel.length === 1) { const n = nodeOf(sel[0]); if (n.type === 'text') editText(n.id); else if (n.type === 'group') enterGroup(n.id); }
        else handled = false;
      }
      else if (k.indexOf('arrow') === 0 && sel.length) {
        const s = e.shiftKey ? 10 : 1;
        nudge(k === 'arrowleft' ? -s : k === 'arrowright' ? s : 0, k === 'arrowup' ? -s : k === 'arrowdown' ? s : 0);
      }
      else if (k === ' ') { if (!spaceDown) { spaceDown = true; svg.classList.add('is-space'); } }
      else handled = false;
      if (handled) { e.preventDefault(); e.stopPropagation(); }
    }
    function onKeyUp(e) {
      if (e.key === ' ' && spaceDown) { spaceDown = false; svg.classList.remove('is-space'); }
    }

    /* ---------------- wiring ---------------- */
    svg.setAttribute('data-tool', 'select');
    svg.addEventListener('pointerdown', onDown);
    svg.addEventListener('pointermove', onMove);
    svg.addEventListener('pointerup', onUp);
    svg.addEventListener('pointercancel', onCancel);
    svg.addEventListener('dblclick', onDbl);
    svg.addEventListener('wheel', onWheel, { passive: false });
    svg.addEventListener('gesturestart', onGestureStart);
    svg.addEventListener('gesturechange', onGestureChange);
    svg.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    container.addEventListener('keydown', onKey);
    container.addEventListener('keyup', onKeyUp);
    let ro = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(function () {
        if (destroyed) return;
        const ow = vw, oh = vh;
        measure();
        if (autoFit) zoomTo('fit');
        else { setView(zoom, pan[0] + (vw - ow) / 2, pan[1] + (vh - oh) / 2, false); }
      });
      ro.observe(container);
    }

    function setTokens(t) {
      tokens = t || LogoDoc.defaultTokens();
      textSeq++;
      LogoRender.prefetch(doc.nodes, tokens).then(function () {
        if (destroyed) return;
        syncTexts(); fixGroups(); reindex(); refreshAll();
        emit('change', { reason: 'tokens' });
      }, function (e) { console.error(e); });
      refreshAll();
      return api;
    }

    function destroy() {
      destroyed = true;
      endEdit(false, true);
      if (ro) ro.disconnect();
      container.removeEventListener('keydown', onKey);
      container.removeEventListener('keyup', onKeyUp);
      svg.remove();
      container.classList.remove('lg-ed');
      Object.keys(handlers).forEach(function (k) { delete handlers[k]; });
    }

    /* ---------------- init ---------------- */
    function init() {
    if (!doc.artboard) doc.artboard = { w: 1200, h: 600, bg: null };
    if (!Array.isArray(doc.nodes)) doc.nodes = [];
    reindex();
    hist = [snap()]; hi = 0;
    measure();
    renderContent();
    zoomTo('fit');
    LogoRender.prefetch(doc.nodes, tokens).then(function () {
      if (destroyed) return;
      syncTexts(); fixGroups(); reindex(); hist = [snap()]; hi = 0; refreshAll();
    }, function (e) { console.error(e); });
    }

    const api = {
      doc: function () { return doc; }, setTokens: setTokens, tokens: function () { return tokens; },
      setTool: setTool, tool: function () { return tool; },
      select: select, selection: selection, add: add, update: update, remove: remove,
      group: group, ungroup: ungroup, reorder: reorder, align: align, distribute: distribute, duplicate: duplicate,
      undo: undo, redo: redo, canUndo: function () { return hi > 0; }, canRedo: function () { return hi < hist.length - 1; },
      zoom: zoomTo, zoomLevel: function () { return zoom; },
      on: on, off: off, destroy: destroy,
      // additions
      setArtboard: setArtboard, setName: setName, selectAll: selectAll, flip: flip, nudge: nudge,
      enterGroup: enterGroup, exitGroup: exitGroup, scope: function () { return scopeId; },
      editText: editText, node: nodeOf, worldBox: worldBox,
      viewport: function () { return { zoom: zoom, pan: pan.slice(), width: vw, height: vh }; },
      copy: copy, paste: paste,
      // test hooks: clientX/Y of a world point
      clientPoint: function (x, y) { const r = svg.getBoundingClientRect(), s = toScreen(x, y); return [r.left + s[0], r.top + s[1]]; },
      svg: function () { return svg; }
    };
    init();
    return api;
  }

  return { mount: mount };
})();
