/* ---------------------------------------------------------------------
   studio-rounds.js — the round loop of the aesthetic studio, as pure logic (no DOM, no storage).

   Contract: docs/aesthetic-studio/PLAN.md "Module contracts"; rounds.json shape: docs/aesthetic-spec/SPEC-v2.md §7.
   Loads as a plain script after js/custom-aesthetics.js (window.StudioRounds); also require()-able in node.

     variations(spec, { axis, seed, count = 3, catalog })  three variants, each changing ONE axis, deterministic per seed
     diff(before, after, catalog)                           plain-word change lines
     openRound / addNote / setNote / recordVariant / recordChanges / closeRound / current   the round log
     snapshot(bundle, n, spec)                              bundle.versions[] (capped)

   `catalog` is SPEC_LAB.catalog() (array of moves). `rounds` is the rounds.json object { rounds: [...] }.
   Every function returns new objects; inputs are never mutated.
------------------------------------------------------------------------ */
(function () {
  'use strict';

  const AXES = [
    { id: 'any', label: 'Any' },
    { id: 'colour', label: 'Colour' },
    { id: 'material', label: 'Material' },
    { id: 'type', label: 'Type' },
    { id: 'edges', label: 'Corners and edges' },
    { id: 'kit', label: 'Kit' },
    { id: 'art', label: 'Art' },
  ];
  const CONCRETE = ['colour', 'material', 'type', 'edges', 'kit', 'art'];

  const MAX_VERSIONS_BYTES = 1.5 * 1024 * 1024;
  const NOTE_TARGET = /^(board\.hero|board\.palette|deck\.cover|general|kit\.[a-z0-9-]+)$/;

  const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
  const clone = v => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const round4 = n => Math.round(n * 10000) / 10000;

  /* ---------------------------------------------------------------- catalog index */
  const IDX = new WeakMap();
  function index(catalog) {
    if (!Array.isArray(catalog)) throw new Error('StudioRounds: catalog must be SPEC_LAB.catalog() (an array of moves)');
    if (IDX.has(catalog)) return IDX.get(catalog);
    const idx = { moves: {}, byMat: {}, bySt: {}, colours: [] };
    const cols = new Set();
    for (const m of catalog) {
      if (!m || !m.id) continue;
      const params = {};
      for (const p of m.params || []) {
        params[p.name] = { name: p.name, kind: p.kind, default: p.default, range: p.range || null, options: p.options || null };
        if (p.kind === 'colour' && typeof p.default === 'string' && !/^#/.test(p.default)) cols.add(p.default);
      }
      idx.moves[m.id] = { id: m.id, category: m.category || '', what: m.what || '', params, material: m.material || null, state: m.state || null, hooks: m.hooks || [] };
      if (m.material) idx.byMat[m.material] = m.id;
      if (m.state) idx.bySt[m.state] = m.id;
    }
    idx.colours = [...cols].sort();
    IDX.set(catalog, idx);
    return idx;
  }

  /* ---------------------------------------------------------------- axes of things */
  const EDGE_RE = /(^|-)(rule|border|hairline|outline|frame|edge|underline|radius|shadow)(-|$)/;
  const HEADLINE_RE = /headline|highlight|display|drop-cap|numeral/;
  function axisOfMove(id, listName, idx) {
    if (listName === 'colour') return 'colour';
    const m = idx.moves[id];
    const cat = m ? m.category : '';
    if (cat === 'colour') return 'colour';
    if (cat === 'type') return 'type';
    if (cat === 'shape') return 'edges';
    if (cat === 'art') return 'art';
    if (cat === 'state') return 'kit';
    if (EDGE_RE.test(id)) return 'edges';
    return 'other';
  }
  function labelOfMove(id, listName, idx) {
    if (listName === 'colour' || (idx.moves[id] && idx.moves[id].category === 'colour')) return `colour recipe ${id}`;
    if (HEADLINE_RE.test(id)) return `headline treatment (${id})`;
    return id;
  }

  /* ---------------------------------------------------------------- formatting */
  const isPair = v => isObj(v) && ('light' in v || 'dark' in v);
  function short(s, n) { s = String(s).replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s; }
  function fmt(v) {
    if (v === undefined || v === null) return '(none)';
    if (typeof v === 'number') return String(round4(v));
    if (typeof v === 'boolean') return v ? 'on' : 'off';
    if (typeof v === 'string') return short(v, 40);
    if (isPair(v)) return `light ${fmt(v.light)} / dark ${fmt(v.dark)}`;
    return short(JSON.stringify(v), 40);
  }
  function fmtChange(a, b) {
    if (isPair(a) && isPair(b)) {
      const parts = ['light', 'dark'].filter(s => !same(a[s], b[s])).map(s => `${s} ${fmt(a[s])} → ${fmt(b[s])}`);
      return parts.join(', ');
    }
    return `${fmt(a)} → ${fmt(b)}`;
  }
  function names(list) { return list.length <= 3 ? list.join(', ') : `${list.slice(0, 3).join(', ')}, +${list.length - 3} more`; }

  /* ---------------------------------------------------------------- diff */
  function diffParams(prefix, defs, bp, ap, axis, out) {
    bp = isObj(bp) ? bp : {}; ap = isObj(ap) ? ap : {};
    const keys = [];
    for (const k of Object.keys(bp).concat(Object.keys(ap))) if (!keys.includes(k)) keys.push(k);
    for (const k of keys) {
      const d = defs && defs[k];
      const bv = has(bp, k) ? bp[k] : d && d.default;
      const av = has(ap, k) ? ap[k] : d && d.default;
      if (same(bv, av)) continue;
      out.push({ axis, text: `${prefix}: ${k} ${fmtChange(bv, av)}` });
    }
  }

  function keyed(list) {
    const seen = {};
    return (Array.isArray(list) ? list : []).map((e, i) => { const id = e && e.move; seen[id] = (seen[id] || 0) + 1; return { k: id + '#' + seen[id], id, e: e || {}, pos: i + 1 }; });
  }

  function diffList(listName, b, a, idx, out) {
    const bk = keyed(b), ak = keyed(a);
    const bm = new Map(bk.map(x => [x.k, x])), am = new Map(ak.map(x => [x.k, x]));
    const removed = bk.filter(x => !am.has(x.k)), added = ak.filter(x => !bm.has(x.k));
    const noun = listName === 'colour' ? 'colour move' : 'move';
    const swapped = removed.length && removed.length === added.length && removed.every((r, i) => r.pos === added[i].pos);
    if (swapped) {
      removed.forEach((r, i) => {
        const to = added[i];
        const ax = listName === 'colour' ? 'colour' : axisOfMove(to.id, listName, idx);
        out.push({ axis: ax, text: listName === 'colour' ? `colour recipe: ${r.id} → ${to.id}` : `move: ${r.id} → ${to.id}` });
      });
    } else {
      for (const r of removed) out.push({ axis: axisOfMove(r.id, listName, idx), text: `removed ${noun} ${r.id}` });
      for (const x of added) out.push({ axis: axisOfMove(x.id, listName, idx), text: `added ${noun} ${x.id}` });
    }
    for (const x of bk) {
      const y = am.get(x.k);
      if (!y) continue;
      const ax = axisOfMove(x.id, listName, idx);
      const m = idx.moves[x.id];
      diffParams(labelOfMove(x.id, listName, idx), m && m.params, x.e.params, y.e.params, ax, out);
      const sb = x.e.scope || 'all', sa = y.e.scope || 'all';
      if (sb !== sa) out.push({ axis: ax, text: `${x.id} scope: ${sb} → ${sa}` });
    }
    const cb = bk.filter(x => am.has(x.k)).map(x => x.k), ca = ak.filter(x => bm.has(x.k)).map(x => x.k);
    if (!same(cb, ca)) {
      const mover = cb.find(k => same(cb.filter(z => z !== k), ca.filter(z => z !== k)));
      if (mover) out.push({ axis: 'other', text: `${bm.get(mover).id} moved from position ${bm.get(mover).pos} to ${am.get(mover).pos} in the ${listName} list` });
      else out.push({ axis: 'other', text: `${listName} list reordered` });
    }
  }

  const arr = v => (v == null ? [] : Array.isArray(v) ? v : [v]);
  /* a kit param key is a material name, a state name, or a move id: material params belong to the material axis */
  function paramAxisAndDefs(key, idx) {
    const moveId = idx.byMat[key] || idx.bySt[key] || (idx.moves[key] && key);
    const m = moveId && idx.moves[moveId];
    const isMat = idx.byMat[key] ? true : idx.bySt[key] ? false : !!(m && m.material && !m.state);
    return { axis: isMat ? 'material' : 'kit', defs: m ? m.params : null };
  }

  function diffKit(b, a, idx, out) {
    b = isObj(b) ? b : {}; a = isObj(a) ? a : {};
    const comps = [];
    for (const k of Object.keys(b).concat(Object.keys(a))) if (!comps.includes(k)) comps.push(k);
    const groups = new Map();
    const group = (axis, head, from, to, tail, comp) => {
      const gk = [axis, head, from, to, tail].join('|');
      if (!groups.has(gk)) groups.set(gk, { axis, head, from, to, tail, comps: [] });
      groups.get(gk).comps.push(comp);
    };
    for (const c of comps) {
      const eb = b[c], ea = a[c];
      if (!eb) { out.push({ axis: 'kit', text: `kit: added ${c}${ea && ea.material ? ` (material ${ea.material})` : ''}` }); continue; }
      if (!ea) { out.push({ axis: 'kit', text: `kit: removed ${c}` }); continue; }
      const matChanged = (eb.material || null) !== (ea.material || null);
      if (matChanged) group('material', 'material', eb.material || '(none)', ea.material || '(none)', '', c);
      const sb = arr(eb.state).join(' + '), sa = arr(ea.state).join(' + ');
      if (sb !== sa) group('kit', 'state', sb || '(none)', sa || '(none)', '', c);
      if ((eb.scope || 'all') !== (ea.scope || 'all')) group('kit', 'kit scope', eb.scope || 'all', ea.scope || 'all', '', c);
      const pb = isObj(eb.params) ? eb.params : {}, pa = isObj(ea.params) ? ea.params : {};
      const skip = new Set();
      if (matChanged) for (const mname of [eb.material, ea.material]) if (mname) { skip.add(mname); if (idx.byMat[mname]) skip.add(idx.byMat[mname]); }
      const keys = [];
      for (const k of Object.keys(pb).concat(Object.keys(pa))) if (!keys.includes(k)) keys.push(k);
      for (const key of keys) {
        if (skip.has(key)) continue;
        const { axis, defs } = paramAxisAndDefs(key, idx);
        const lines = [];
        diffParams(key, defs, pb[key], pa[key], axis, lines);
        for (const l of lines) {
          const m = l.text.match(/^(.*?): (\S+) (.*)$/);
          group(axis, `${m[1]} ${m[2]}`, '', m[3], 'p', c);
        }
      }
    }
    for (const g of groups.values()) {
      const who = `(${names(g.comps)})`;
      out.push({ axis: g.axis, text: g.tail === 'p' ? `${g.head}: ${g.to} ${who}` : `${g.head} ${who}: ${g.from} → ${g.to}` });
    }
  }

  function artDesc(h) {
    if (!isObj(h)) return '(none)';
    if (h.kind === 'generator') return `generator ${h.move}`;
    return `${h.kind || 'art'} ${h.src || ''}`.trim();
  }
  function diffArt(b, a, idx, out) {
    b = isObj(b) ? b : {}; a = isObj(a) ? a : {};
    const slots = [];
    for (const k of Object.keys(b).concat(Object.keys(a))) if (!slots.includes(k)) slots.push(k);
    for (const s of slots) {
      const x = b[s], y = a[s];
      if (same(x, y)) continue;
      const label = s === 'hero' ? 'art' : `art ${s}`;
      if (!isObj(x) || !isObj(y) || x.kind !== y.kind || (x.kind === 'generator' && x.move !== y.move)) { out.push({ axis: 'art', text: `${label}: ${artDesc(x)} → ${artDesc(y)}` }); continue; }
      if (x.kind === 'generator') {
        const m = idx.moves[x.move];
        diffParams(`${label} ${x.move}`, m && m.params, x.params, y.params, 'art', out);
      } else {
        if ((x.fit || 'cover') !== (y.fit || 'cover')) out.push({ axis: 'art', text: `${label} fit: ${x.fit || 'cover'} → ${y.fit || 'cover'}` });
        if (x.src !== y.src) out.push({ axis: 'art', text: `${label} file: ${short(x.src, 40)} → ${short(y.src, 40)}` });
        if (x.alt !== y.alt) out.push({ axis: 'art', text: `${label} description changed` });
      }
    }
  }

  const TEXT_FIELDS = ['key', 'name', 'descriptor', 'influences', 'summary', 'coreTrick', 'motto', 'kicker', 'mode', 'order', 'highlight', 'slideShape'];
  const OBJECT_FIELDS = ['labels', 'copy', 'layout', 'roles', 'rules', 'meta', 'build', 'lineage', 'deck'];
  const FIELD_LABELS = { coreTrick: 'core trick', slideShape: 'slide shape', mode: 'best in mode', highlight: 'headline highlight', key: 'key', order: 'order' };
  const FAMILY_NAMES = { tactile: 'tactile', graphic: 'graphic', digital: 'digital', print: 'print & editorial', luminous: 'luminous' };
  const TYPE_LABELS = { ui: 'UI text font', label: 'label font', display: 'display size' };

  /* A spec field path in plain words: { label, map? }. Anything unlisted is spelled out from its path. */
  function plainPath(p) {
    let m;
    if (p === 'meta.family') return { label: 'family', map: v => FAMILY_NAMES[v] || v };
    if ((m = p.match(/^meta\.fonts\.(heading|body|mono)\.picks$/))) return { label: `${m[1]} fonts` };
    if ((m = p.match(/^meta\.fonts\.(heading|body|mono)\.classes$/))) return { label: `${m[1]} font classes` };
    if (p === 'meta.fonts.avoid') return { label: 'avoided font classes' };
    if (p === 'meta.fonts.why') return { label: 'why these fonts' };
    if (p === 'meta.fonts.pairings') return { label: 'font pairings' };
    if (p === 'build.cls') return { label: 'build class' };
    if (p === 'build.surface') return { label: 'surface' };
    if (p === 'build.pressText') return { label: 'press behaviour' };
    if (p === 'build.icons') return { label: 'icons' };
    if (p === 'build.appIcon') return { label: 'app icon' };
    if ((m = p.match(/^build\.(press|motion)\.(\w+)$/))) return { label: `${m[1]} ${m[2]}` };
    if (p === 'labels.material') return { label: 'material name' };
    if (p === 'labels.states') return { label: 'state names' };
    if (p === 'labels.statesKind') return { label: 'states drawn as' };
    if ((m = p.match(/^labels\.states\.(\d+)$/))) return { label: `state ${+m[1] + 1} name` };
    if ((m = p.match(/^copy\.([\w-]+)\.(text|label)$/))) return { label: `${m[1]} specimen ${m[2]}` };
    if ((m = p.match(/^layout\.(\w+)$/))) return { label: `${m[1]} layout` };
    if ((m = p.match(/^roles\.(\w+)\.(\w+)$/))) return { label: `${m[1]} role ${m[2]}` };
    if (p === 'rules.do') return { label: 'do rules' };
    if (p === 'rules.dont') return { label: "don't rules" };
    if (p === 'lineage.version') return { label: 'version' };
    return { label: p.replace(/\./g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase() };
  }
  const plainVal = (v, map) => {
    if (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length)) return '(none)';
    if (Array.isArray(v)) return short(v.map(x => (map ? map(x) : x)).join(', '), 60);
    if (typeof v === 'string') return short(map ? map(v) : v, 60);
    return fmt(v);
  };
  const scalarList = v => v === undefined || (Array.isArray(v) && v.every(x => x === null || typeof x !== 'object'));
  function deepLines(path, x, y, out, skip) {
    if (same(x, y) || (skip && skip.has(path))) return;
    if ((isObj(x) || x === undefined) && (isObj(y) || y === undefined)) {
      const ks = [];
      for (const k of Object.keys(x || {}).concat(Object.keys(y || {}))) if (!ks.includes(k)) ks.push(k);
      for (const k of ks) deepLines(`${path}.${k}`, (x || {})[k], (y || {})[k], out, skip);
      return;
    }
    const { label, map } = plainPath(path);
    if ((Array.isArray(x) || Array.isArray(y)) && scalarList(x) && scalarList(y)) {
      const xs = arr(x), ys = arr(y);
      const q = v => `"${short(map ? map(v) : v, 40)}"`;
      const gone = xs.filter(v => !ys.includes(v)), came = ys.filter(v => !xs.includes(v));
      const at = xs.length === ys.length ? xs.map((v, i) => i).filter(i => xs[i] !== ys[i]) : [];
      if (at.length === 1) {                       // one entry edited in place
        const a = xs[at[0]], b = ys[at[0]];
        if (a === '' || a == null) { if (b !== '' && b != null) out.push(`${label}: added ${q(b)}`); }
        else if (b === '' || b == null) out.push(`${label}: removed ${q(a)}`);
        else out.push(`${label}: ${q(a)} → ${q(b)}`);
        return;
      }
      if (gone.length || came.length) {
        for (const v of gone) if (v !== '' && v != null) out.push(`${label}: removed ${q(v)}`);
        for (const v of came) if (v !== '' && v != null) out.push(`${label}: added ${q(v)}`);
        return;
      }
      out.push(`${label}: ${plainVal(x, map)} → ${plainVal(y, map)}`); return;
    }
    if (typeof x === 'object' || typeof y === 'object') { out.push(`${label} changed`); return; }
    out.push(`${label}: ${plainVal(x, map)} → ${plainVal(y, map)}`);
  }

  /* diffDetailed -> [{ axis, text }], axis one of colour material type edges kit art other fields */
  function diffDetailed(before, after, catalog) {
    const idx = index(catalog);
    before = before || {}; after = after || {};
    const out = [];
    diffList('colour', before.colour, after.colour, idx, out);
    diffList('moves', before.moves, after.moves, idx, out);
    diffKit(before.kit, after.kit, idx, out);
    diffArt(before.art, after.art, idx, out);
    const tb = isObj(before.type) ? before.type : {}, ta = isObj(after.type) ? after.type : {};
    for (const k of new Set(Object.keys(tb).concat(Object.keys(ta)))) if (!same(tb[k], ta[k])) out.push({ axis: 'type', text: `${TYPE_LABELS[k] || `type ${k}`}: ${fmt(tb[k])} → ${fmt(ta[k])}` });
    for (const f of TEXT_FIELDS) if (!same(before[f], after[f])) out.push({ axis: 'fields', text: `${FIELD_LABELS[f] || f}: ${plainVal(before[f])} → ${plainVal(after[f])}` });
    // the motto and kicker are mirrored into the specimen copy: that echo is not a second change
    const skip = new Set();
    for (const f of ['motto', 'kicker']) if (!same(before[f], after[f]) && isObj(after.copy) && isObj(after.copy[f]) && after.copy[f].text === after[f]) skip.add(`copy.${f}.text`);
    for (const f of OBJECT_FIELDS) {
      const lines = [];
      deepLines(f, before[f], after[f], lines, skip);
      lines.slice(0, 6).forEach(t => out.push({ axis: 'fields', text: t }));
      if (lines.length > 6) out.push({ axis: 'fields', text: `${f}: +${lines.length - 6} more changes` });
    }
    const known = new Set(['spec', 'colour', 'moves', 'kit', 'art', 'type', ...TEXT_FIELDS, ...OBJECT_FIELDS]);
    for (const k of new Set(Object.keys(before).concat(Object.keys(after)))) if (!known.has(k) && !same(before[k], after[k])) out.push({ axis: 'fields', text: `${k} changed` });
    if (before.spec !== after.spec) out.push({ axis: 'fields', text: `spec: ${fmt(before.spec)} → ${fmt(after.spec)}` });
    return out;
  }
  const diff = (before, after, catalog) => diffDetailed(before, after, catalog).map(d => d.text);

  /* ---------------------------------------------------------------- hook order (mirrors registerSpecAesthetic)
     The runtime wires each hook "first provider wins": the art.hero generator (or an svg / image hero, which provides
     `art`) first, then the entries of spec.colour, then spec.moves. A later entry that offers a hook already taken is
     ignored for that hook. hookOrder(spec, catalog) -> { owners: { hook: { move, key } }, shadowed: { 'colour.0': [{ hook, by }] } }
     where key is 'colour.<i>', 'moves.<i>' or 'art.hero'. 'tokens' is reserved and never a hook here. */
  function hookOrder(spec, catalog) {
    const hooksOf = {};
    for (const m of arr(catalog)) hooksOf[m.id] = (m.hooks || []).filter(h => h !== 'tokens');
    const owners = {}, shadowed = {};
    spec = spec || {};
    const hero = isObj(spec.art) && spec.art.hero;
    if (isObj(hero)) {
      if (hero.kind === 'generator' && hooksOf[hero.move] && hooksOf[hero.move].includes('art')) {
        let key = 'art.hero';
        for (const l of ['colour', 'moves']) arr(spec[l]).forEach((e, i) => { if (key === 'art.hero' && e && e.move === hero.move) key = `${l}.${i}`; });
        owners.art = { move: hero.move, key };
      } else if (hero.kind === 'svg' || hero.kind === 'image') owners.art = { move: 'art.hero', key: 'art.hero' };
    }
    for (const l of ['colour', 'moves']) {
      arr(spec[l]).forEach((e, i) => {
        const key = `${l}.${i}`;
        for (const h of hooksOf[e && e.move] || []) {
          if (!owners[h]) owners[h] = { move: e.move, key };
          else if (owners[h].key !== key) (shadowed[key] = shadowed[key] || []).push({ hook: h, by: owners[h].move });
        }
      });
    }
    return { owners, shadowed };
  }
  /* "tinted-neutral-canvas above already sets the canvas" style words for one hook */
  const hookWords = h => (h === 'canvas' ? 'sets the canvas' : `provides ${h}`);

  /* ---------------------------------------------------------------- validation (mirrors the checker's move / kit rules) */
  function valueProblem(def, v) {
    switch (def.kind) {
      case 'number': return typeof v === 'number' && isFinite(v) && (!def.range || (v >= def.range[0] && v <= def.range[1])) ? '' : 'bad number';
      case 'enum': return (def.options || []).includes(v) ? '' : 'bad option';
      case 'bool': return typeof v === 'boolean' ? '' : 'bad bool';
      case 'colour': return typeof v === 'string' && v ? '' : 'bad colour';
      case 'text': return typeof v === 'string' ? '' : 'bad text';
      default: return '';
    }
  }
  function paramsProblems(defs, params, where, bad) {
    if (params == null) return;
    if (!isObj(params)) { bad.push(`${where}: params`); return; }
    for (const [k, v] of Object.entries(params)) {
      const d = defs && defs[k];
      if (!d) { bad.push(`${where}.${k}: no such param`); continue; }
      const vals = isPair(v) ? [v.light, v.dark] : [v];
      if (isPair(v) && Object.keys(v).length !== 2) bad.push(`${where}.${k}: pair`);
      for (const x of vals) { const p = valueProblem(d, x); if (p) bad.push(`${where}.${k}: ${p}`); }
    }
  }
  function problems(spec, idx) {
    const bad = [];
    for (const listName of ['colour', 'moves']) {
      arr(spec[listName]).forEach((e, i) => {
        const m = e && idx.moves[e.move];
        if (!m) { bad.push(`${listName}[${i}]: unknown move`); return; }
        paramsProblems(m.params, e.params, `${listName}[${i}]`, bad);
      });
    }
    for (const [c, e] of Object.entries(spec.kit || {})) {
      if (e.material && !idx.byMat[e.material]) bad.push(`kit.${c}: unknown material`);
      for (const s of arr(e.state)) if (!idx.bySt[s]) bad.push(`kit.${c}: unknown state`);
      for (const [k, p] of Object.entries(e.params || {})) {
        const owner = idx.byMat[k] || idx.bySt[k] || (idx.moves[k] && k);
        if (!owner) { bad.push(`kit.${c}.params.${k}: unknown`); continue; }
        paramsProblems(idx.moves[owner].params, p, `kit.${c}.params.${k}`, bad);
      }
    }
    const h = spec.art && spec.art.hero;
    if (h && h.kind === 'generator') {
      const m = idx.moves[h.move];
      if (!m) bad.push('art.hero: unknown generator'); else paramsProblems(m.params, h.params, 'art.hero.params', bad);
    }
    if (h && h.fit !== undefined && h.fit !== 'cover' && h.fit !== 'contain') bad.push('art.hero.fit');
    return bad;
  }

  /* ---------------------------------------------------------------- random */
  function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rngOf(seed, salt) {
    let a = hashStr(String(seed === undefined ? 0 : seed) + '|' + salt) || 1;
    const f = () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    f.pick = list => list[Math.floor(f() * list.length)];
    f.shuffle = list => { const l = list.slice(); for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(f() * (i + 1)); const t = l[i]; l[i] = l[j]; l[j] = t; } return l; };
    return f;
  }

  /* ---------------------------------------------------------------- stepping one param value */
  function decimals(n) { const s = String(n); const i = s.indexOf('.'); return i < 0 ? 0 : s.length - i - 1; }
  function hexToHsl(hex) {
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const r = parseInt(h.slice(0, 2), 16) / 255, g = parseInt(h.slice(2, 4), 16) / 255, b = parseInt(h.slice(4, 6), 16) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
    let hh = 0, s = 0;
    if (d) {
      s = d / (1 - Math.abs(2 * l - 1));
      hh = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
      hh *= 60; if (hh < 0) hh += 360;
    }
    return { h: hh, s, l };
  }
  function hslToHex({ h, s, l }) {
    const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
    const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
    return '#' + [r, g, b].map(v => Math.round((v + m) * 255).toString(16).padStart(2, '0')).join('');
  }

  /* One clearly different value for `cur` (a scalar), or undefined when there is nothing sensible. */
  function stepValue(def, cur, rng, idx, used) {
    if (def.kind === 'number') {
      if (typeof cur !== 'number') cur = typeof def.default === 'number' ? def.default : 0;
      let lo, hi;
      if (def.range) { lo = def.range[0]; hi = def.range[1]; }
      else { const base = Math.abs(cur) || 1; lo = 0; hi = Math.max(base * 2, 2); }
      const span = hi - lo;
      if (!(span > 0)) return undefined;
      const intRange = Number.isInteger(lo) && Number.isInteger(hi) && Number.isInteger(def.default === undefined ? 0 : def.default);
      const unit = intRange && span >= 3 ? 1 : span <= 1 ? 0.01 : span <= 10 ? 0.05 : 0.5;
      const q = v => Math.min(hi, Math.max(lo, round4(Math.round(v / unit) * unit)));
      const cand = [0.12, 0.3, 0.5, 0.7, 0.88].map(t => q(lo + span * t));
      let far = cand.filter(c => Math.abs(c - cur) >= Math.max(unit, 0.2 * span));
      if (!far.length) far = cand.filter(c => c !== cur).sort((a, b) => Math.abs(b - cur) - Math.abs(a - cur)).slice(0, 1);
      far = far.filter((c, i) => far.indexOf(c) === i);
      if (!far.length) return undefined;
      return rng.pick(far);
    }
    if (def.kind === 'enum') {
      const o = (def.options || []).filter(x => x !== cur);
      return o.length ? rng.pick(o) : undefined;
    }
    if (def.kind === 'bool') return typeof cur === 'boolean' ? !cur : !def.default;
    if (def.kind === 'colour') {
      if (typeof cur === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(cur)) {
        const hsl = hexToHsl(cur);
        const turn = rng.pick([-140, -80, -40, 40, 80, 140, 180]);
        const out = hslToHex({ h: (hsl.h + turn + 360) % 360, s: hsl.s, l: hsl.l });
        return out === cur.toLowerCase() ? undefined : out;
      }
      const pool = idx.colours.concat(used || []).filter((c, i, l) => l.indexOf(c) === i && c !== cur && !/^#/.test(c));
      return pool.length ? rng.pick(pool) : undefined;
    }
    return undefined;
  }

  /* A new params object for an entry with `name` stepped (a {light,dark} pair steps both sides). */
  function stepParam(def, params, name, rng, idx, used) {
    const raw = isObj(params) && has(params, name) ? params[name] : undefined;
    const cur = raw === undefined ? def.default : raw;
    let next;
    if (isPair(cur)) {
      const l = stepValue(def, cur.light, rng, idx, used), d = stepValue(def, cur.dark, rng, idx, used);
      if (l === undefined || d === undefined) return null;
      next = { light: l, dark: d };
    } else {
      next = stepValue(def, cur, rng, idx, used);
      if (next === undefined) return null;
    }
    if (same(next, cur)) return null;
    return Object.assign({}, params || {}, { [name]: next });
  }

  function steppable(defs, kinds) { return Object.values(defs || {}).filter(d => kinds.includes(d.kind)); }

  /* ---------------------------------------------------------------- axis makers: each returns a changed spec or null */
  const KINDS_ALL = ['number', 'enum', 'bool', 'colour'];

  function usedColours(spec) {
    const s = new Set();
    const walk = x => { if (typeof x === 'string' && /^[a-z]{3,24}$/.test(x)) s.add(x); else if (Array.isArray(x)) x.forEach(walk); else if (isObj(x)) Object.values(x).forEach(walk); };
    walk(arr(spec.colour).concat(arr(spec.moves)));
    return [...s].filter(x => ['primary', 'secondary', 'accent', 'ink', 'line', 'canvas', 'muted'].includes(x));
  }

  /* step one param of a random entry in spec[listName] whose axis is `axis` */
  function stepListEntry(spec, listName, axis, rng, idx) {
    const out = clone(spec);
    const opts = [];
    arr(out[listName]).forEach((e, i) => {
      if (!e || axisOfMove(e.move, listName, idx) !== axis) return;
      const m = idx.moves[e.move];
      if (!m) return;
      for (const d of steppable(m.params, KINDS_ALL)) opts.push({ i, name: d.name, m });
    });
    if (!opts.length) return null;
    const o = rng.pick(opts);
    const e = out[listName][o.i];
    const next = stepParam(o.m.params[o.name], e.params, o.name, rng, idx, usedColours(spec));
    if (!next) return null;
    e.params = next;
    return out;
  }

  const COLOUR_FAMILIES = [
    ['tinted-neutral-canvas', 'warm-paper-canvas'],
    ['primary-reprint', 'mono-plus-accent', 'equal-luminance-clash', 'pair-colour-tints', 'fixed-lamp-cast', 'relief-pair'],
  ];
  function makeColour(spec, rng, idx) {
    const swaps = [];
    arr(spec.colour).forEach((e, i) => {
      const fam = COLOUR_FAMILIES.find(f => f.includes(e.move));
      if (!fam) return;
      const present = new Set(spec.colour.map(x => x.move));
      for (const to of fam) if (to !== e.move && !present.has(to) && idx.moves[to]) swaps.push({ i, to });
    });
    const trySwap = () => { if (!swaps.length) return null; const s = rng.pick(swaps); const out = clone(spec); out.colour[s.i] = { move: s.to }; return out; };
    if (swaps.length && rng() < 0.35) return trySwap() || stepListEntry(spec, 'colour', 'colour', rng, idx);
    return stepListEntry(spec, 'colour', 'colour', rng, idx) || trySwap();
  }

  /* kit components that share one value of `pick(entry)`, as [[comps]] */
  function kitGroups(spec, pick) {
    const g = new Map();
    for (const [c, e] of Object.entries(spec.kit || {})) {
      const k = pick(e);
      if (k === null) continue;
      if (!g.has(k)) g.set(k, []);
      g.get(k).push(c);
    }
    return [...g.values()];
  }

  const NONGENERIC = /^pair-(?!block|inset-frame)|switch|check|slider|stepper|day|calendar|wheel|pulse|scroll|accordion|crumbs|anchors|pie|tab\b|link|dial|skeleton|ring|meter|disc|sidebar|table|mark|readout|caption|title|label|tag|skyline|list|row|key|field|ink-wash|scrim/;
  function makeMaterial(spec, rng, idx) {
    const groups = kitGroups(spec, e => (e.material ? e.material : null));
    if (!groups.length) return null;
    const used = new Set(Object.values(spec.kit).map(e => e.material).filter(Boolean));
    const generic = Object.keys(idx.byMat).filter(n => !NONGENERIC.test(n));
    const g = rng.pick(groups);
    const from = spec.kit[g[0]].material;
    const pool = [...new Set([...used, ...generic])].filter(n => n !== from && idx.byMat[n]);
    if (!pool.length) return null;
    const to = rng.pick(pool);
    const out = clone(spec);
    const fromMove = idx.byMat[from];
    for (const c of g) {
      const e = out.kit[c];
      e.material = to;
      if (isObj(e.params)) {
        delete e.params[from];
        if (fromMove && fromMove !== from && !arr(e.state).some(s => idx.bySt[s] === fromMove)) delete e.params[fromMove];
        if (!Object.keys(e.params).length) delete e.params;
      }
    }
    return out;
  }

  const ROLE = n => (/disabled/.test(n) ? 'disabled' : /focus/.test(n) ? 'focus' : /hover/.test(n) ? 'hover' : /selected|current|checked|bar-|open-|signature/.test(n) ? 'selected' : /press|sink|active/.test(n) ? 'press' : null);
  function makeKit(spec, rng, idx) {
    const opts = [];
    const groups = kitGroups(spec, e => (arr(e.state).length ? JSON.stringify(arr(e.state)) : null));
    for (const g of groups) {
      const states = arr(spec.kit[g[0]].state);
      for (const s of states) {
        const role = ROLE(s);
        const alts = role ? Object.keys(idx.bySt).filter(n => n !== s && !states.includes(n) && ROLE(n) === role) : [];
        for (const to of alts) opts.push({ t: 'swap', g, s, to });
        const m = idx.moves[idx.bySt[s]];
        if (m) for (const d of steppable(m.params, ['number', 'enum', 'bool'])) opts.push({ t: 'param', g, s, m, d });
      }
    }
    arr(spec.moves).forEach((e, i) => {
      if (!e || axisOfMove(e.move, 'moves', idx) !== 'kit') return;
      const m = idx.moves[e.move];
      if (m) for (const d of steppable(m.params, ['number', 'enum', 'bool'])) opts.push({ t: 'entry', i, m, d });
    });
    if (!opts.length) return null;
    // swaps are rarer than param steps, so favour a swap when one exists, about a third of the time
    const swaps = opts.filter(o => o.t === 'swap');
    const o = swaps.length && rng() < 0.4 ? rng.pick(swaps) : rng.pick(opts);
    const out = clone(spec);
    if (o.t === 'swap') {
      for (const c of o.g) { const e = out.kit[c]; e.state = arr(e.state).map(x => (x === o.s ? o.to : x)); if (isObj(e.params)) delete e.params[o.s]; }
      return out;
    }
    if (o.t === 'entry') {
      const e = out.moves[o.i];
      const next = stepParam(o.d, e.params, o.d.name, rng, idx, usedColours(spec));
      if (!next) return null;
      e.params = next;
      return out;
    }
    let done = false;
    for (const c of o.g) {
      const e = out.kit[c];
      e.params = isObj(e.params) ? e.params : {};
      const key = has(e.params, o.s) ? o.s : has(e.params, o.m.id) ? o.m.id : o.s;
      const next = stepParam(o.d, e.params[key], o.d.name, rng, idx, usedColours(spec));
      if (!next) return null;
      e.params[key] = next;
      done = true;
    }
    return done ? out : null;
  }

  function makeType(spec, rng, idx) {
    // the recommendation fields (display size, UI and label face) are a second source next to the type moves
    const t = isObj(spec.type) ? spec.type : {};
    const options = [];
    if (typeof t.display === 'number') options.push(['display', round4(Math.min(1.5, Math.max(0.8, t.display + (t.display > 1.15 ? -0.2 : 0.2))))]);
    for (const k of ['ui', 'label']) if (typeof t[k] === 'string') for (const v of ['sans', 'mono', 'body']) if (v !== t[k]) options.push([k, v]);
    const ok = options.filter(([k, v]) => v !== t[k]);
    const viaFields = () => {
      if (!ok.length) return null;
      const [k, v] = rng.pick(ok);
      const out = clone(spec);
      out.type = Object.assign({}, t, { [k]: v });
      return out;
    };
    const viaMoves = () => stepListEntry(spec, 'moves', 'type', rng, idx);
    return rng() < 0.4 ? (viaFields() || viaMoves()) : (viaMoves() || viaFields());
  }

  function makeEdges(spec, rng, idx) { return stepListEntry(spec, 'moves', 'edges', rng, idx); }

  function makeArt(spec, rng, idx) {
    const opts = [];
    const h = spec.art && spec.art.hero;
    if (isObj(h) && (h.kind === 'svg' || h.kind === 'image')) opts.push('fit');
    if (isObj(h) && h.kind === 'generator' && idx.moves[h.move]) for (const d of steppable(idx.moves[h.move].params, ['number', 'enum', 'bool'])) opts.push(d);
    const viaMoves = () => stepListEntry(spec, 'moves', 'art', rng, idx);
    if (!opts.length) return viaMoves();
    const o = rng.pick(opts);
    const out = clone(spec);
    if (o === 'fit') { out.art.hero.fit = (h.fit || 'cover') === 'cover' ? 'contain' : 'cover'; return out; }
    const next = stepParam(o, h.params, o.name, rng, idx, []);
    if (!next) return viaMoves();
    out.art.hero.params = next;
    return out;
  }

  const MAKERS = { colour: makeColour, material: makeMaterial, type: makeType, edges: makeEdges, kit: makeKit, art: makeArt };
  const VISIBLE_TRIES = 12;
  const FALLBACK_ORDER = ['colour', 'material', 'edges', 'type', 'kit', 'art'];

  /* ---------------------------------------------------------------- variations */
  /* opts.visible(baseSpec, variantSpec, variant) -> boolean (optional): a candidate it rejects is never returned (the
     generator draws up to 12 candidates per card for it; it may then return fewer than `count`). */
  /* The "things changed" of a candidate, as stable keys: moves by id (not position), kit by param (not component). */
  function flat(v, path, out) {
    if (Array.isArray(v) && v.some(isObj)) v.forEach((e, i) => flat(e, `${path}.${isObj(e) && e.move ? e.move : i}`, out));
    else if (isObj(v)) for (const k of Object.keys(v)) flat(v[k], `${path}.${k}`, out);
    else out[path] = JSON.stringify(v);
  }
  function changedKeys(a, b) {
    const x = {}, y = {};
    flat(a, 'spec', x); flat(b, 'spec', y);
    const norm = k => k.replace(/^spec\.kit\.[^.]+\./, 'spec.kit.').replace(/\.(light|dark)$/, '');
    const keys = new Set();
    for (const k of new Set(Object.keys(x).concat(Object.keys(y)))) if (x[k] !== y[k]) keys.add(norm(k));
    return keys;
  }
  const groupOf = k => k.replace(/\.[^.]+$/, '');

  function variations(spec, opts) {
    opts = opts || {};
    if (!isObj(spec)) throw new Error('StudioRounds.variations: spec must be an object');
    const idx = index(opts.catalog);
    const count = opts.count == null ? 3 : opts.count;
    const wanted = AXES.some(a => a.id === opts.axis) ? opts.axis : 'any';
    const rng = rngOf(opts.seed, wanted);
    const taken = new Set([JSON.stringify(spec)]);
    const usedKeys = new Set(), usedGroups = new Set();      // params / moves already varied by an earlier card in this batch
    const result = [];
    const shuffled = rng.shuffle(CONCRETE);

    for (let n = 0; n < count; n++) {
      const first = wanted === 'any' ? shuffled[n % shuffled.length] : wanted;
      // the axis to try first, then every other axis (so a variant is always found when anything can change)
      const order = [first].concat(wanted === 'any'
        ? shuffled.filter(a => a !== first)
        : FALLBACK_ORDER.filter(a => a !== first));
      let made = null;
      let budget = VISIBLE_TRIES;      // calls to opts.visible for this card
      for (const axis of order) {
        for (let attempt = 0; attempt < 24 && !made && (!opts.visible || budget > 0); attempt++) {
          let cand = null;
          try { cand = MAKERS[axis](spec, rng, idx); } catch (e) { cand = null; }
          if (!cand) break;
          const key = JSON.stringify(cand);
          if (taken.has(key)) continue;
          const lines = diffDetailed(spec, cand, opts.catalog);
          const axes = [...new Set(lines.map(l => l.axis))];
          if (axes.length !== 1 || problems(cand, idx).length) continue;
          const keys = changedKeys(spec, cand);
          if ([...keys].some(k => usedKeys.has(k))) continue;                                   // never the same move + param twice
          if (attempt < 12 && [...keys].some(k => usedGroups.has(groupOf(k)))) continue;       // prefer a different move or field
          taken.add(key);
          const cur = { id: String.fromCharCode(97 + n), axis: axes[0], change: lines.map(l => l.text).join('; '), spec: cand };
          if (typeof opts.visible === 'function') {
            let seen = false;
            if (budget > 0) { budget--; try { seen = !!opts.visible(spec, cand, cur); } catch (e) { seen = true; } }
            if (!seen) continue;
          }
          made = cur;
          keys.forEach(k => { usedKeys.add(k); usedGroups.add(groupOf(k)); });
          if (axis !== first) made.note = `nothing more to vary on ${first} for this style, so this one changes ${axes[0]}`;
          else if (wanted !== 'any' && axes[0] !== wanted) made.note = `nothing more to vary on ${wanted} for this style, so this one changes ${axes[0]}`;
        }
        if (made) break;
      }
      if (made) result.push(made);
    }
    return result;
  }

  /* ---------------------------------------------------------------- rounds */
  const today = () => { const d = new Date(); const p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; };
  const rootOf = rounds => ({ rounds: clone(rounds && Array.isArray(rounds.rounds) ? rounds.rounds : []) });
  const openOf = r => r.rounds.find(x => x.open) || null;
  const lastN = r => r.rounds.reduce((m, x) => Math.max(m, x.n), 0);
  const needOpen = r => { const o = openOf(r); if (!o) throw new Error('StudioRounds: there is no open round'); return o; };
  const noteNum = r => r.rounds.reduce((m, x) => (x.notes || []).reduce((mm, n) => Math.max(mm, parseInt(String(n.id).replace(/^n/, ''), 10) || 0), m), 0);
  const letters = i => { let s = ''; i += 1; while (i > 0) { const r = (i - 1) % 26; s = String.fromCharCode(97 + r) + s; i = Math.floor((i - 1) / 26); } return s; };

  function current(rounds) { return (rounds && Array.isArray(rounds.rounds) && rounds.rounds.find(x => x.open)) || null; }

  /* A second open round is never created: if one is open, rounds comes back unchanged. */
  function openRound(rounds, opts) {
    const r = rootOf(rounds);
    if (openOf(r)) return r;
    const by = opts && (opts.by === 'agent' || opts.by === 'studio') ? opts.by : 'studio';
    r.rounds.push({ n: lastN(r) + 1, date: (opts && opts.date) || today(), by, summary: '', changes: [], variants: [], notes: [], shots: null, open: true });
    return r;
  }

  function addNote(rounds, opts) {
    const r = rootOf(rounds);
    const o = needOpen(r);
    const target = opts && opts.target, text = opts && typeof opts.text === 'string' ? opts.text.replace(/[<>]/g, '').trim() : '';
    if (!NOTE_TARGET.test(target || '')) throw new Error('StudioRounds: note target must be board.hero, board.palette, kit.<component>, deck.cover or general');
    if (!text) throw new Error('StudioRounds: a note needs text');
    const note = { id: `n${noteNum(r) + 1}`, target, text, status: 'open' };
    o.notes.push(note);
    return { rounds: r, note: clone(note) };
  }

  function setNote(rounds, id, opts) {
    const r = rootOf(rounds);
    let note = null;
    for (const x of r.rounds) for (const n of x.notes || []) if (n.id === id) note = n;
    if (!note) throw new Error(`StudioRounds: no note ${id}`);
    const status = opts && opts.status;
    if (status === 'done') { note.status = 'done'; note.doneIn = (openOf(r) || { n: lastN(r) }).n; }
    else if (status === 'open') { note.status = 'open'; delete note.doneIn; }
    if (opts && typeof opts.text === 'string' && opts.text.trim()) note.text = opts.text.replace(/[<>]/g, '').trim();
    return r;
  }

  /* The first `count` single letters not yet used by a variant of the open round (a card's letter is its id's tail). */
  function freeLetters(rounds, count) {
    const o = current(rounds);
    const used = new Set(((o && o.variants) || []).map(v => String(v.id).replace(/^r\d+/, '')));
    const out = [];
    for (let i = 0; i < 26 && out.length < count; i++) { const l = String.fromCharCode(97 + i); if (!used.has(l)) out.push(l); }
    return out;
  }

  /* Adds a variant, or (with opts.id, a full id like "r2a") updates that variant's verdict. opts.letter ("b") asks for the id r<n>b when free, so an id can match its card. verdict: keep | kill | open. */
  function recordVariant(rounds, opts) {
    const r = rootOf(rounds);
    const o = needOpen(r);
    const verdict = ['keep', 'kill', 'open'].includes(opts && opts.verdict) ? opts.verdict : 'open';
    const existing = opts && opts.id ? o.variants.find(v => v.id === opts.id) : null;
    if (existing) { existing.verdict = verdict; if (typeof opts.change === 'string' && opts.change) existing.change = opts.change; return r; }
    if (!opts || typeof opts.change !== 'string' || !opts.change.trim()) throw new Error('StudioRounds: a variant needs a change');
    const want = opts && typeof opts.letter === 'string' && /^[a-z]{1,2}$/.test(opts.letter) ? `r${o.n}${opts.letter}` : '';
    const id = want && !o.variants.some(v => v.id === want) ? want : `r${o.n}${letters(o.variants.length)}`;
    o.variants.push({ id, change: opts.change.replace(/[<>]/g, '').trim(), verdict });
    return r;
  }

  /* Appends plain-word changes. A line that continues the previous one ("x: 4 → 8" then "x: 8 → 12") is merged
     ("x: 4 → 12"); a merged line that ends where it started is dropped. */
  function recordChanges(rounds, changes) {
    const r = rootOf(rounds);
    const o = needOpen(r);
    const parts = s => { const p = String(s).split(' → '); return p.length === 2 ? p : null; };
    for (const raw of arr(changes)) {
      const line = String(raw).replace(/[<>]/g, '').trim();
      if (!line) continue;
      const last = o.changes[o.changes.length - 1];
      if (last === line) continue;
      const p = parts(line), q = last && parts(last);
      // a list entry typed in over several edits stays one line; adding then removing the same entry cancels
      let m;
      if (last && (m = last.match(/^(.*): added ("(?:.*)")$/))) {
        if (p && p[0] === `${m[1]}: ${m[2]}`) { o.changes.pop(); o.changes.push(`${m[1]}: added ${p[1]}`); continue; }
        if (line === `${m[1]}: removed ${m[2]}`) { o.changes.pop(); continue; }
      }
      // "x: a → light a / dark a" then "x dark a → b" is one edit: "x: a → light a / dark b"
      if (p && q && (m = q[1].match(/^light (.*) \/ dark (.*)$/))) {
        let merged = false;
        for (const [side, at] of [['light', 1], ['dark', 2]]) {
          const tail = ` ${side} ${m[at]}`;
          if (!p[0].endsWith(tail)) continue;
          const head = p[0].slice(0, -tail.length);
          if (!head || !q[0].startsWith(head + ' ') || q[0].length <= head.length + 1) continue;
          const l = side === 'light' ? p[1] : m[1], d = side === 'dark' ? p[1] : m[2];
          o.changes.pop();
          if (!(l === d && q[0].slice(head.length + 1) === l)) o.changes.push(`${q[0]} → light ${l} / dark ${d}`);
          merged = true;
          break;
        }
        if (merged) continue;
      }
      if (p && q && p[0].endsWith(q[1])) {
        const head = p[0].slice(0, p[0].length - q[1].length);   // "corner-radius: base " of "corner-radius: base 8 → 12"
        if (head && /\s$/.test(head) && q[0].startsWith(head) && q[0].length > head.length) {
          const from = q[0].slice(head.length);
          o.changes.pop();
          if (from !== p[1]) o.changes.push(`${head}${from} → ${p[1]}`);
          continue;
        }
      }
      o.changes.push(line);
    }
    return r;
  }

  function closeRound(rounds, opts) {
    const r = rootOf(rounds);
    const o = needOpen(r);
    opts = opts || {};
    const kept = o.variants.filter(v => v.verdict === 'keep').length;
    const summary = typeof opts.summary === 'string' && opts.summary.trim()
      ? opts.summary.replace(/[<>]/g, '').trim()
      : `${o.changes.length} change${o.changes.length === 1 ? '' : 's'}${o.variants.length ? `, ${kept} of ${o.variants.length} variation${o.variants.length === 1 ? '' : 's'} kept` : ''}.`;
    o.summary = summary;
    if (opts.date) o.date = opts.date;
    delete o.open;
    if (o.shots == null) delete o.shots;
    return r;
  }

  /* All notes still open, oldest first: [{ round, ...note }] */
  function openNotes(rounds) {
    const out = [];
    for (const x of (rounds && rounds.rounds) || []) for (const n of x.notes || []) if (n.status === 'open') out.push(Object.assign({ round: x.n }, clone(n)));
    return out;
  }

  /* bundle.versions: [{ round, date, aesthetic }], newest last. Oldest snapshots go first while the bundle is over ~1.5 MB. */
  function snapshot(bundle, n, spec) {
    const b = clone(bundle || {});
    const list = Array.isArray(b.versions) ? b.versions.filter(v => v && v.round !== n) : [];
    list.push({ round: n, date: today(), aesthetic: clone(spec) });
    b.versions = list;
    while (b.versions.length > 1 && JSON.stringify(b).length > MAX_VERSIONS_BYTES) b.versions.shift();
    return b;
  }

  const api = { hookOrder, hookWords, AXES, variations, diff, diffDetailed, openRound, addNote, setNote, recordVariant, freeLetters, recordChanges, closeRound, current, openNotes, snapshot, changedKeys };
  if (typeof window !== 'undefined') window.StudioRounds = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
