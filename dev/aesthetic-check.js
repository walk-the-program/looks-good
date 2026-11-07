#!/usr/bin/env node
/* Aesthetic checker. Contract: docs/aesthetic-spec/SPEC-v2.md section 5.
   Static checks (no server), render checks (--render <port>, headless playwright-cli), --shots, --list-moves.
   No npm dependencies. Helpers live in dev/aesthetic-check/. Fixtures: dev/aesthetic-check/fixtures/. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const cp = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SPECS_DIR = path.join(ROOT, 'dev', 'move-lab', 'specs');
const FIXTURES = path.join(__dirname, 'aesthetic-check', 'fixtures');

const USAGE = `Usage: node dev/aesthetic-check.js <folder | aesthetic.json | key> [options]
       node dev/aesthetic-check.js --list-moves [--json]
       node dev/aesthetic-check.js --self-test

Validates a spec-2 aesthetic (docs/aesthetic-spec/SPEC-v2.md) so an agent can iterate
render -> look -> fix without opening the app.

Target
  <folder>         dev/move-lab/specs/<key>/ (aesthetic.json, art/, rounds.json)
  <aesthetic.json> a single file (art and rounds.json are read from its folder)
  <key>            an already registered lab key: render / shots only, no static checks

Options
  --render <port>  render checks against a server already running at the repo root
                   (python3 -m http.server <port>): console errors on board, Built kit and
                   deck in light and dark; 6 stress palettes x light/dark WCAG contrast
  --shots          screenshots into <folder>/shots/ (board, kit-top, deck; light and dark), kit cropped to
                   944x4000. Every round uses the SAME preview brand: primary #2f5d8a, analogous scheme,
                   Inter / Inter, written to shots/palette.txt. (needs --render <port> for the port)
  --palette <hex>  override the preview primary for --shots (recorded in palette.txt)
  --out <dir>      shots directory for a key-only run (default <folder>/shots)
  --list-moves     print the move catalog as Markdown (--json for JSON)
  --json           print a JSON report instead of text lines
  --self-test      run every fixture in dev/aesthetic-check/fixtures/ against EXPECTED.md
  --help           this text

Output: one line per check, "PASS|WARN|FAIL  <check-id>  <message>", then a summary line.
Exit code 1 if any check is FAIL. Static check ids: json fields key moves kit art rounds similar runtime.
Never touches the network; render runs headless, in-memory, localhost only.`;

/* ------------------------------------------------------------------ report */
function makeReport() {
  const results = [];
  const add = (level, id, msg) => results.push({ level, id, msg });
  return { results, add, pass: (i, m) => add('PASS', i, m), warn: (i, m) => add('WARN', i, m), fail: (i, m) => add('FAIL', i, m) };
}

/* ------------------------------------------------------------------ rules (SPEC-v2 section 4.8, one list) */
/* The runtime's SPEC_SVG_RULES wins when it exists (its `tags` array); otherwise this local copy of
   the section 4.8 rules is used and the art check says so. */
const LOCAL_SVG_RULES = [
  { id: 'element', names: ['script', 'foreignobject', 'iframe', 'object', 'embed'] },
  { id: 'attr', pattern: '^on' },
  { id: 'href', attrs: ['href', 'xlink:href'], allow: ['^#', '^data:image/(png|jpeg|webp|gif)[;,]'] },
  { id: 'style', forbid: ['@import'], urlAllow: ['^#', '^data:image/(png|jpeg|webp|gif)[;,]'] },
];
function svgRulesFrom(list) {
  const g = id => list.find(r => r.id === id) || LOCAL_SVG_RULES.find(r => r.id === id);
  return {
    tags: g('element').names.map(n => n.toLowerCase()), failTags: ['script'],
    on: new RegExp(g('attr').pattern, 'i'),
    hrefAllow: g('href').allow.map(r => new RegExp(r, 'i')),
    urlAllow: g('style').urlAllow.map(r => new RegExp(r, 'i')),
  };
}
const IMAGE_EXT = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
const DATA_IMAGE = /^data:image\/(png|jpeg|webp|gif)[;,]/i;
const INTERACTIVE = /^(button-.*|field|select|switch|checkbox|radio|slider|segmented|tabs|chip)$/;
const FALLBACK_KIT = ['button-primary', 'button-secondary', 'button-ghost', 'button-icon', 'button-danger', 'field', 'select', 'switch', 'checkbox', 'radio', 'slider', 'segmented', 'tabs', 'card', 'panel', 'list-row', 'chip', 'badge', 'progress', 'avatar', 'tooltip', 'modal', 'sheet', 'toast', 'callout', 'menu', 'navbar', 'topbar'];

function svgAudit(text, rules) {
  const out = { fail: [], warn: [] };
  if (!/<svg[\s>]/i.test(text)) { out.fail.push('not an SVG document (no <svg>)'); return out; }
  const tagSet = new Set(rules.tags);
  const failSet = new Set(rules.failTags);
  const seen = new Set();
  const tagRe = /<\s*([a-zA-Z][\w:-]*)\b([^>]*)>/g;
  let m;
  while ((m = tagRe.exec(text))) {
    const name = m[1].toLowerCase(), attrs = m[2];
    if (tagSet.has(name) && !seen.has('t:' + name)) {
      seen.add('t:' + name);
      (failSet.has(name) ? out.fail : out.warn).push(`<${name}> element${failSet.has(name) ? ' (script)' : ' would be stripped'}`);
    }
    const attrRe = /\s([^\s=\/>"']+)\s*=/g;
    let at;
    while ((at = attrRe.exec(' ' + attrs))) {
      const an = at[1].toLowerCase();
      if (rules.on.test(an) && !seen.has('on:' + an)) { seen.add('on:' + an); out.fail.push(`event handler attribute ${an}`); }
    }
    const hr = /\s(?:xlink:)?href\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
    let h;
    while ((h = hr.exec(attrs))) {
      const v = (h[1] != null ? h[1] : h[2]).trim();
      if (/^\s*javascript:/i.test(v)) { out.fail.push('javascript: href'); continue; }
      if (rules.hrefAllow.some(r => r.test(v))) continue;
      if (!seen.has('h:' + v)) { seen.add('h:' + v); out.warn.push(`href "${v.slice(0, 40)}" would be stripped (only #id or data:image png/jpeg/webp/gif)`); }
    }
  }
  const styleRe = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
  while ((m = styleRe.exec(text))) {
    const css = m[1];
    if (/@import/i.test(css)) out.warn.push('<style> with @import would be stripped');
    const urlRe = /url\(\s*(['"]?)([^'")]*)\1\s*\)/gi;
    let u;
    while ((u = urlRe.exec(css))) {
      const v = u[2].trim();
      if (!rules.urlAllow.some(r => r.test(v))) { out.warn.push(`<style> url(${v.slice(0, 30)}) would be stripped`); break; }
    }
  }
  return out;
}

/* ------------------------------------------------------------------ runtime sandbox + catalog */
function loadRuntime() {
  const logs = { warn: [], error: [], loadErrors: [], missing: [] };
  const fmt = a => a.map(x => (typeof x === 'string' ? x : (x && x.message) || JSON.stringify(x))).join(' ');
  const sb = {
    console: { log() {}, info() {}, debug() {}, warn: (...a) => logs.warn.push(fmt(a)), error: (...a) => logs.error.push(fmt(a)) },
    setTimeout, clearTimeout, Math, JSON, Object, Array, Number, String, Map, Set,
  };
  sb.window = sb;
  const el = () => ({ remove() {}, setAttribute() {}, appendChild() {}, addEventListener() {}, style: {}, classList: { add() {}, remove() {} } });
  sb.document = { readyState: 'loading', addEventListener() {}, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], createElement: el, head: el(), body: el(), documentElement: el() };
  sb.registerAesthetic = () => {};
  sb.location = { search: '?movelab=1' };
  vm.createContext(sb);
  const movesDir = path.join(ROOT, 'js', 'moves');
  const moveFiles = fs.existsSync(movesDir) ? fs.readdirSync(movesDir).filter(f => f.endsWith('.js')).sort((a, b) => (a === 'core.js' ? -1 : b === 'core.js' ? 1 : a.localeCompare(b))) : [];
  const files = ['js/color.js', 'js/aesthetic-spec.js', ...moveFiles.map(f => 'js/moves/' + f)];
  for (const rel of files) {
    const full = path.join(ROOT, rel);
    if (!fs.existsSync(full)) { logs.missing.push(rel); continue; }
    try { vm.runInContext(fs.readFileSync(full, 'utf8'), sb, { filename: rel }); }
    catch (e) { logs.loadErrors.push(`${rel}: ${e && e.message}`); }
  }
  return { sb, logs };
}

function arr(v) { return v == null ? [] : Array.isArray(v) ? v : [v]; }
const nameOf = x => (x && typeof x === 'object' ? x.name : x);

/* Normalise the catalog: SPEC_LAB.catalog() (v2) when present, else read SPEC_LAB.moves directly. */
function getCatalog(sb) {
  const lab = sb.SPEC_LAB;
  const info = { moves: {}, source: 'none', kit: null, v2: false };
  if (!lab) return info;
  let list;
  if (typeof lab.catalog === 'function') {
    try { list = arr(lab.catalog()); if (!Array.isArray(list)) list = Object.values(list); info.source = 'SPEC_LAB.catalog()'; info.v2 = true; } catch (e) { list = null; }
  }
  if (!list) { list = Object.values(lab.moves || {}); info.source = 'SPEC_LAB.moves (v1 runtime: no SPEC_LAB.catalog yet)'; }
  for (const m of list) {
    if (!m || !m.id) continue;
    let params = {};
    if (Array.isArray(m.params)) for (const p of m.params) params[p.name] = p;
    else params = m.params || {};
    const mat = [...arr(m.materials), ...arr(m.material)].map(nameOf).filter(Boolean);
    const st = [...arr(m.states), ...arr(m.state)].map(nameOf).filter(Boolean);
    const hooks = Array.isArray(m.hooks) ? m.hooks : Object.keys(m.hooks || {});
    info.moves[m.id] = { id: m.id, libraryId: m.libraryId == null ? null : m.libraryId, category: m.category || '', tier: m.tier || '', what: m.what || '', params, materials: mat, states: st, hooks, hasArt: hooks.includes('art') || (Array.isArray(m.hooks) ? false : false) };
  }
  info.kit = sb.KIT_COMPONENTS ? Object.keys(sb.KIT_COMPONENTS) : null;
  if (Array.isArray(sb.SPEC_SVG_RULES) && sb.SPEC_SVG_RULES.length) {
    info.svgRules = svgRulesFrom(sb.SPEC_SVG_RULES);
    info.svgRulesSource = 'runtime SPEC_SVG_RULES';
  } else { info.svgRules = svgRulesFrom(LOCAL_SVG_RULES); info.svgRulesSource = 'local copy of SPEC-v2 4.8 (runtime SPEC_SVG_RULES not found)'; }
  const byMat = {}, bySt = {};
  for (const m of Object.values(info.moves)) { m.materials.forEach(n => { byMat[n] = m.id; }); m.states.forEach(n => { bySt[n] = m.id; }); }
  info.byMat = byMat; info.bySt = bySt;
  return info;
}

/* ------------------------------------------------------------------ small helpers */
const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
const isStr = v => typeof v === 'string';
function builtInKeys() {
  const dir = path.join(ROOT, 'js', 'aesthetics');
  const keys = new Set();
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (!f.endsWith('.js') || !fs.statSync(full).isFile()) continue;
    const m = fs.readFileSync(full, 'utf8').match(/\bkey:\s*['"]([a-z0-9-]+)['"]/);
    if (m) keys.add(m[1]);
  }
  return keys;
}
/* Keys of other specs: folders (index.json and any folder with aesthetic.json) and legacy v1 JS specs. */
function otherSpecKeys(selfDir) {
  const folders = new Map(), legacy = new Map();
  if (fs.existsSync(SPECS_DIR)) {
    for (const f of fs.readdirSync(SPECS_DIR)) {
      const full = path.join(SPECS_DIR, f);
      if (fs.statSync(full).isDirectory()) {
        if (selfDir && path.resolve(full) === path.resolve(selfDir)) continue;
        const j = path.join(full, 'aesthetic.json');
        if (fs.existsSync(j)) { try { const k = JSON.parse(fs.readFileSync(j, 'utf8')).key; if (k) folders.set(k, f); } catch (e) { /* its own checker run reports it */ } }
      } else if (f.endsWith('.js')) {
        const m = fs.readFileSync(full, 'utf8').match(/\bkey:\s*['"]([a-z0-9-]+)['"]/);
        if (m) legacy.set(m[1], f);
      }
    }
  }
  return { folders, legacy };
}

/* ------------------------------------------------------------------ static checks */
function validateParamValue(def, v) {
  if (!def) return 'unknown param';
  switch (def.kind) {
    case 'number': {
      if (typeof v !== 'number' || !Number.isFinite(v)) return 'not a number';
      const r = Array.isArray(def.range) ? def.range : null;
      if (r && (v < r[0] || v > r[1])) return `${v} outside range ${r[0]}..${r[1]}`;
      return '';
    }
    case 'enum': { const o = def.options || []; return o.includes(v) ? '' : `${JSON.stringify(v)} not one of ${o.join('|')}`; }
    case 'bool': return typeof v === 'boolean' ? '' : 'not a boolean';
    case 'colour': return isStr(v) && v ? '' : 'not a colour string';
    case 'text': return isStr(v) ? '' : 'not a string';
    default: return '';
  }
}
/* Validate the params object of one move reference; returns problems. */
function checkParams(move, params, where) {
  const bad = [];
  if (params == null) return bad;
  if (!isObj(params)) return [`${where}: params must be an object`];
  for (const [name, v] of Object.entries(params)) {
    const def = move.params[name];
    if (!def) { bad.push(`${where}.${name}: move "${move.id}" has no such param`); continue; }
    if (isObj(v)) {
      const ks = Object.keys(v);
      if (ks.length !== 2 || !ks.includes('light') || !ks.includes('dark')) { bad.push(`${where}.${name}: object must be a {light, dark} pair with exactly those two keys (got ${ks.join(',') || 'none'})`); continue; }
      for (const side of ['light', 'dark']) { const e = validateParamValue(def, v[side]); if (e) bad.push(`${where}.${name}.${side}: ${e}`); }
    } else {
      const e = validateParamValue(def, v);
      if (e) bad.push(`${where}.${name}: ${e}`);
    }
  }
  return bad;
}

function checkFields(spec, R) {
  const bad = [];
  const need = { spec: 'number', key: 'string', name: 'string', descriptor: 'string', coreTrick: 'string', mode: 'string', colour: 'array', moves: 'array', kit: 'object' };
  for (const [f, t] of Object.entries(need)) {
    const v = spec[f];
    if (v === undefined) { bad.push(`missing required "${f}"`); continue; }
    const ok = t === 'array' ? Array.isArray(v) : t === 'object' ? isObj(v) : typeof v === t;
    if (!ok) bad.push(`"${f}" must be ${t}`);
  }
  if (spec.spec !== undefined && spec.spec !== 2) bad.push(`"spec" must be 2 (got ${JSON.stringify(spec.spec)})`);
  if (isStr(spec.mode) && !['light', 'dark'].includes(spec.mode)) bad.push('"mode" must be light|dark');
  if (isStr(spec.coreTrick) && !spec.coreTrick.trim()) bad.push('"coreTrick" is empty (state the mechanism, not the mood)');
  for (const f of ['influences', 'summary', 'motto', 'kicker', 'highlight', 'slideShape']) if (spec[f] !== undefined && !isStr(spec[f])) bad.push(`"${f}" must be a string`);
  if (spec.order !== undefined && typeof spec.order !== 'number') bad.push('"order" must be a number');
  for (const f of ['labels', 'copy', 'layout', 'type', 'roles', 'meta', 'build', 'lineage', 'rules']) if (spec[f] !== undefined && !isObj(spec[f])) bad.push(`"${f}" must be an object`);
  if (isObj(spec.rules)) for (const f of ['do', 'dont']) if (spec.rules[f] !== undefined && !(Array.isArray(spec.rules[f]) && spec.rules[f].every(isStr))) bad.push(`rules.${f} must be an array of strings`);
  if (isObj(spec.lineage)) {
    if (spec.lineage.forkedFrom !== undefined && spec.lineage.forkedFrom !== null && !isStr(spec.lineage.forkedFrom)) bad.push('lineage.forkedFrom must be null or a string');
    if (spec.lineage.version !== undefined && typeof spec.lineage.version !== 'number') bad.push('lineage.version must be a number');
  }
  // Mirrors the runtime: js/aesthetic-spec.js:19 BUILD_FIELDS (spec colour moves kit meta build art) plus the
  // fields copied onto the def at js/aesthetic-spec.js:449 (every other top-level key). Keep in sync with both.
  const known = new Set([...Object.keys(need), 'order', 'influences', 'summary', 'motto', 'kicker', 'lineage', 'meta', 'build', 'labels', 'copy', 'layout', 'type', 'roles', 'rules', 'highlight', 'slideShape', 'art', 'deck', 'highlightNote', 'classicOf', 'blend']);
  const extra = Object.keys(spec).filter(k => !known.has(k));
  if (bad.length) R.fail('fields', bad.join('; '));
  else R.pass('fields', 'required fields present, types right');
  if (extra.length) R.warn('fields', `unknown top-level field(s): ${extra.join(', ')}`);
}

function checkKey(spec, ctx, R) {
  const key = spec.key;
  if (!isStr(key)) return;
  const problems = [];
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(key.replace(/--moves$/, ''))) problems.push('must be lowercase kebab-case (letters, digits, single hyphens)');
  if (key.length < 3 || key.length > 48) problems.push(`length ${key.length} not in 3..48`);
  const builtIn = builtInKeys();
  if (builtIn.has(key)) problems.push(`clashes with the built-in key "${key}" (rebuilds end in --moves)`);
  const others = otherSpecKeys(ctx.folder);
  if (others.folders.has(key)) problems.push(`clashes with spec folder "${others.folders.get(key)}"`);
  if (ctx.underSpecs) {
    if (path.basename(ctx.folder) !== key) problems.push(`folder name "${path.basename(ctx.folder)}" must equal the key`);
    let listed = false;
    try { listed = arr(JSON.parse(fs.readFileSync(path.join(SPECS_DIR, 'index.json'), 'utf8')).specs).includes(key); } catch (e) { /* no index yet */ }
    if (!listed) R.warn('key', `"${key}" is not listed in dev/move-lab/specs/index.json (the lab will not load it)`);
  }
  if (problems.length) R.fail('key', problems.join('; '));
  else R.pass('key', `"${key}" ok, no clash with ${builtIn.size} built-in keys or ${others.folders.size} other spec folders`);
  if (others.legacy.has(key)) R.warn('key', `same key as legacy v1 JS spec dev/move-lab/specs/${others.legacy.get(key)} (migrate or remove it, both would register)`);
}

function checkMoves(spec, cat, R) {
  const bad = [];
  let count = 0;
  for (const listName of ['colour', 'moves']) {
    const list = Array.isArray(spec[listName]) ? spec[listName] : [];
    list.forEach((e, i) => {
      const where = `${listName}[${i}]`;
      if (!isObj(e) || !isStr(e.move)) { bad.push(`${where}: needs {"move": "<id>"}`); return; }
      count++;
      const extra = Object.keys(e).filter(k => !['move', 'params', 'scope'].includes(k));
      if (extra.length) bad.push(`${where}: unknown key(s) ${extra.join(',')}`);
      if (e.scope !== undefined && !['all', 'board', 'kit'].includes(e.scope)) bad.push(`${where}: scope must be all|board|kit`);
      const move = cat.moves[e.move];
      if (!move) { bad.push(`${where}: unknown move "${e.move}"`); return; }
      bad.push(...checkParams(move, e.params, `${where}(${e.move})`));
    });
  }
  if (bad.length) R.fail('moves', `${bad.length} problem(s): ${bad.slice(0, 8).join('; ')}${bad.length > 8 ? '; ...' : ''}`);
  else R.pass('moves', `${count} move reference(s) valid against the catalog (${cat.source})`);
}

function checkKit(spec, cat, R) {
  const known = cat.kit || FALLBACK_KIT;
  const bad = [];
  const mapped = new Set();
  if (isObj(spec.kit)) {
    for (const [comp, e] of Object.entries(spec.kit)) {
      const where = `kit.${comp}`;
      if (!known.includes(comp)) { bad.push(`${where}: unknown component`); continue; }
      mapped.add(comp);
      if (!isObj(e)) { bad.push(`${where}: must be an object`); continue; }
      const extra = Object.keys(e).filter(k => !['material', 'state', 'params', 'scope'].includes(k));
      if (extra.length) bad.push(`${where}: unknown key(s) ${extra.join(',')}`);
      if (e.scope !== undefined && !['all', 'board', 'kit'].includes(e.scope)) bad.push(`${where}: scope must be all|board|kit`);
      const states = arr(e.state);
      if (e.material === undefined && !states.length) bad.push(`${where}: needs a material (or at least a state)`);
      if (e.material !== undefined && !(isStr(e.material) && cat.byMat[e.material])) bad.push(`${where}: unknown material ${JSON.stringify(e.material)}`);
      for (const s of states) if (!(isStr(s) && cat.bySt[s])) bad.push(`${where}: unknown state ${JSON.stringify(s)}`);
      if (INTERACTIVE.test(comp) && !states.length) bad.push(`${where}: interactive component needs at least one state`);
      if (e.params !== undefined) {
        if (!isObj(e.params)) bad.push(`${where}.params must be an object`);
        else for (const [k, p] of Object.entries(e.params)) {
          const owner = cat.byMat[k] || cat.bySt[k] || (cat.moves[k] && k);
          if (!owner) { bad.push(`${where}.params.${k}: not a material, state or move id`); continue; }
          bad.push(...checkParams(cat.moves[owner], p, `${where}.params.${k}`));
        }
      }
    }
  }
  if (bad.length) R.fail('kit', `${bad.length} problem(s): ${bad.slice(0, 8).join('; ')}${bad.length > 8 ? '; ...' : ''}`);
  else R.pass('kit', `${mapped.size} component(s) mapped to known materials/states`);
  const unmapped = known.filter(c => !mapped.has(c));
  if (unmapped.length) R.warn('kit-unmapped', `${unmapped.length} of ${known.length} kit components not mapped: ${unmapped.slice(0, 12).join(', ')}${unmapped.length > 12 ? `, +${unmapped.length - 12} more` : ''}`);
}

function checkArt(spec, cat, ctx, R) {
  const rulesNote = `rules: ${cat.svgRulesSource}`;
  const problems = [], warns = [];
  const dir = ctx.folder;
  const art = spec.art;
  if (art !== undefined && !isObj(art)) problems.push('"art" must be an object');
  else if (art) {
    for (const slot of Object.keys(art)) if (slot !== 'hero') warns.push(`unknown art slot "${slot}" (only "hero" exists)`);
    const h = art.hero;
    if (h !== undefined) {
      if (!isObj(h)) problems.push('art.hero must be an object');
      else if (h.kind === 'generator') {
        const move = cat.moves[h.move];
        if (!move) problems.push(`art.hero: unknown generator move ${JSON.stringify(h.move)}`);
        else {
          problems.push(...checkParams(move, h.params, 'art.hero.params'));
          if (cat.v2 && !move.hooks.includes('art')) warns.push(`art.hero: move "${h.move}" does not list an art hook`);
        }
      } else if (h.kind === 'svg' || h.kind === 'image') {
        if (!isStr(h.src) || !h.src) problems.push('art.hero.src missing');
        else {
          const isData = DATA_IMAGE.test(h.src);
          if (h.kind === 'svg' && isData) problems.push('art.hero.src: kind "svg" needs a file under art/');
          else if (!isData) {
            if (/^[a-z][a-z0-9+.-]*:/i.test(h.src) || h.src.startsWith('/') || h.src.startsWith('//')) problems.push(`art.hero.src "${h.src}" must be relative to the aesthetic folder or a data:image URL`);
            else if (!dir) problems.push('art.hero.src cannot be resolved (no folder)');
            else {
              const full = path.resolve(dir, h.src);
              const ext = path.extname(full).toLowerCase();
              if (!full.startsWith(path.resolve(dir) + path.sep)) problems.push(`art.hero.src "${h.src}" escapes the aesthetic folder`);
              else if (h.kind === 'svg' && ext !== '.svg') problems.push(`art.hero.src "${h.src}" is not .svg`);
              else if (h.kind === 'image' && !IMAGE_EXT.includes(ext)) problems.push(`art.hero.src extension "${ext}" not allowed (png jpg webp gif)`);
              else if (!fs.existsSync(full)) problems.push(`art file missing: ${h.src}`);
            }
          }
          if (h.fit !== undefined && !['cover', 'contain'].includes(h.fit)) problems.push('art.hero.fit must be cover|contain');
          if (!isStr(h.alt) || !h.alt.trim()) warns.push('art.hero.alt is empty');
        }
      } else problems.push(`art.hero.kind must be generator|svg|image (got ${JSON.stringify(h.kind)})`);
    }
  }
  /* every SVG in art/ goes through the sanitiser rules */
  const artDir = dir && path.join(dir, 'art');
  if (artDir && fs.existsSync(artDir)) {
    const walk = d => fs.readdirSync(d).flatMap(f => { const p = path.join(d, f); return fs.statSync(p).isDirectory() ? walk(p) : [p]; });
    for (const f of walk(artDir)) {
      const rel = path.relative(dir, f), ext = path.extname(f).toLowerCase();
      if (ext === '.svg') {
        const a = svgAudit(fs.readFileSync(f, 'utf8'), cat.svgRules);
        a.fail.forEach(m => problems.push(`${rel}: ${m}`));
        a.warn.forEach(m => warns.push(`${rel}: ${m}`));
      } else if (!IMAGE_EXT.includes(ext)) warns.push(`${rel}: file type "${ext}" not allowed in art/`);
    }
  }
  if (problems.length) R.fail('art', problems.join('; ') + ` (${rulesNote})`);
  else R.pass('art', (spec.art && spec.art.hero ? `art.hero ${spec.art.hero.kind} ok` : 'no art') + `, SVG files pass (${rulesNote})`);
  if (warns.length) R.warn('art', warns.join('; '));
}

function checkRounds(ctx, R) {
  const file = ctx.folder && path.join(ctx.folder, 'rounds.json');
  if (!file || !fs.existsSync(file)) { R.pass('rounds', 'no rounds.json (optional)'); return; }
  let j;
  try { j = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { R.fail('rounds', `rounds.json does not parse: ${e.message}`); return; }
  const bad = [];
  if (!isObj(j) || !Array.isArray(j.rounds)) { R.fail('rounds', 'rounds.json needs {"rounds": [...]}'); return; }
  const ns = new Set(), ids = new Set();
  j.rounds.forEach((r, i) => {
    const w = `rounds[${i}]`;
    if (!isObj(r)) { bad.push(`${w}: must be an object`); return; }
    if (!Number.isInteger(r.n) || r.n < 1) bad.push(`${w}.n must be a positive integer`); else if (ns.has(r.n)) bad.push(`${w}.n ${r.n} duplicated`); else ns.add(r.n);
    if (!(isStr(r.date) && /^\d{4}-\d{2}-\d{2}$/.test(r.date) && !isNaN(Date.parse(r.date)))) bad.push(`${w}.date must be YYYY-MM-DD`);
    if (!['agent', 'studio'].includes(r.by)) bad.push(`${w}.by must be agent|studio`);
    if (!isStr(r.summary) || !r.summary.trim()) bad.push(`${w}.summary required`);
    if (!(Array.isArray(r.changes) && r.changes.every(isStr))) bad.push(`${w}.changes must be an array of strings`);
    if (r.shots !== undefined && !isStr(r.shots)) bad.push(`${w}.shots must be a string`);
    if (r.variants !== undefined) {
      if (!Array.isArray(r.variants)) bad.push(`${w}.variants must be an array`);
      else r.variants.forEach((v, k) => {
        const vw = `${w}.variants[${k}]`;
        if (!isObj(v) || !isStr(v.id) || !v.id) bad.push(`${vw}.id required`); else if (ids.has(v.id)) bad.push(`${vw}.id "${v.id}" duplicated`); else ids.add(v.id);
        if (isObj(v)) {
          if (!isStr(v.change) || !v.change.trim()) bad.push(`${vw}.change required (one axis only)`);
          if (!['keep', 'kill', 'open'].includes(v.verdict)) bad.push(`${vw}.verdict must be keep|kill|open`);
        }
      });
    }
    if (r.notes !== undefined) {
      if (!Array.isArray(r.notes)) bad.push(`${w}.notes must be an array`);
      else r.notes.forEach((n, k) => {
        const nw = `${w}.notes[${k}]`;
        if (!isObj(n)) { bad.push(`${nw} must be an object`); return; }
        if (!isStr(n.id) || !n.id) bad.push(`${nw}.id required`); else if (ids.has('note:' + n.id)) bad.push(`${nw}.id "${n.id}" duplicated`); else ids.add('note:' + n.id);
        const kitT = /^kit\.[a-z0-9-]+$/.test(n.target || '');
        if (!(['board.hero', 'board.palette', 'deck.cover', 'general'].includes(n.target) || kitT)) bad.push(`${nw}.target must be board.hero|board.palette|kit.<component>|deck.cover|general`);
        if (!isStr(n.text) || !n.text.trim()) bad.push(`${nw}.text required`);
        if (!['open', 'done'].includes(n.status)) bad.push(`${nw}.status must be open|done`);
        if (n.status === 'done' && !Number.isInteger(n.doneIn)) bad.push(`${nw}.doneIn (round number) required when status is done`);
        if (n.doneIn !== undefined && !Number.isInteger(n.doneIn)) bad.push(`${nw}.doneIn must be an integer`);
      });
    }
  });
  if (bad.length) R.fail('rounds', `${bad.length} problem(s): ${bad.slice(0, 6).join('; ')}${bad.length > 6 ? '; ...' : ''}`);
  else {
    const open = j.rounds.reduce((a, r) => a + arr(r.notes).filter(n => n.status === 'open').length, 0);
    R.pass('rounds', `${j.rounds.length} round(s) valid, ${open} open note(s)`);
  }
}

function loadLibrary() {
  const file = path.join(ROOT, 'docs', 'move-audit', 'move-library.json');
  if (!fs.existsSync(file)) return null;
  const lib = JSON.parse(fs.readFileSync(file, 'utf8'));
  const ids = new Set(), alias = new Map();
  for (const m of lib.moves) { ids.add(m.id); alias.set(m.id, m.id); for (const a of m.aliases || []) alias.set(a, m.id); }
  return { lib, ids, alias };
}
function checkSimilar(spec, cat, R) {
  const L = loadLibrary();
  if (!L) { R.warn('similar', 'docs/move-audit/move-library.json not found'); return; }
  const owner = new Map();   // move id -> library id
  const toLib = id => {
    const m = cat.moves[id];
    if (m && m.libraryId && L.alias.has(m.libraryId)) return L.alias.get(m.libraryId);
    if (L.alias.has(id)) return L.alias.get(id);
    const base = id.replace(/--[a-z0-9-]+$/, '');
    return L.alias.get(base) || null;
  };
  const used = new Set();
  for (const l of [spec.colour, spec.moves]) for (const e of arr(l)) if (isObj(e) && isStr(e.move)) used.add(e.move);
  if (isObj(spec.kit)) for (const e of Object.values(spec.kit)) if (isObj(e)) {
    if (cat.byMat[e.material]) used.add(cat.byMat[e.material]);
    for (const s of arr(e.state)) if (cat.bySt[s]) used.add(cat.bySt[s]);
  }
  if (isObj(spec.art) && isObj(spec.art.hero) && spec.art.hero.move) used.add(spec.art.hero.move);
  const mine = new Set(); const unmapped = [];
  for (const id of used) { const l = toLib(id); if (l) mine.add(l); else unmapped.push(id); owner.set(id, l); }
  if (!mine.size) { R.pass('similar', 'no spec move maps to a library move; nothing to compare'); return; }
  const self = isStr(spec.key) ? spec.key.replace(/--moves$/, '') : '';
  const rows = [];
  for (const s of L.lib.styles) {
    if (s.key === self && spec.key !== self) continue;   // a rebuild of that style is expected to overlap it
    const theirs = new Set(arr(s.moves).map(m => L.alias.get(m) || m));
    const inter = [...mine].filter(x => theirs.has(x)).length;
    const uni = new Set([...mine, ...theirs]).size;
    rows.push({ key: s.key, pct: Math.round((inter / uni) * 100) });
  }
  rows.sort((a, b) => b.pct - a.pct);
  const top = rows.slice(0, 3);
  const msg = `top built-ins by move overlap (Jaccard, ${mine.size} library move(s)): ${top.map(r => `${r.key} ${r.pct}%`).join(', ')}${unmapped.length ? `; ${unmapped.length} move(s) without a library id ignored` : ''}`;
  if (top[0] && top[0].pct >= 70) R.warn('similar', `${top[0].key} ${top[0].pct}% >= 70%: close to an existing style. ${msg}`);
  else R.pass('similar', msg);
}

/* runs every static check; returns { report, spec, key, folder } */
function runStatic(target, R, catInfo) {
  const ctx = { folder: null, file: null, underSpecs: false };
  let jsonPath;
  const st = fs.statSync(target);
  if (st.isDirectory()) { ctx.folder = path.resolve(target); jsonPath = path.join(ctx.folder, 'aesthetic.json'); }
  else { jsonPath = path.resolve(target); ctx.folder = path.dirname(jsonPath); }
  ctx.underSpecs = path.dirname(ctx.folder) === SPECS_DIR;
  if (!fs.existsSync(jsonPath)) { R.fail('json', `${path.relative(ROOT, jsonPath)} not found`); return { spec: null, ctx }; }
  let spec;
  try { spec = JSON.parse(fs.readFileSync(jsonPath, 'utf8')); } catch (e) { R.fail('json', `does not parse: ${e.message}`); return { spec: null, ctx }; }
  if (!isObj(spec)) { R.fail('json', 'top level must be a JSON object'); return { spec: null, ctx }; }
  R.pass('json', `${path.relative(ROOT, jsonPath)} parses as pure JSON data`);
  checkFields(spec, R);
  checkKey(spec, ctx, R);
  checkMoves(spec, catInfo, R);
  checkKit(spec, catInfo, R);
  checkArt(spec, catInfo, ctx, R);
  checkRounds(ctx, R);
  checkSimilar(spec, catInfo, R);
  return { spec, ctx };
}

function runtimeNotes(logs, R) {
  const lines = [...logs.missing.map(m => `missing ${m}`), ...logs.loadErrors];
  if (lines.length) R.fail('runtime', `runtime failed to load in the sandbox: ${lines.join('; ')}`);
  const noisy = [...logs.warn, ...logs.error];
  if (noisy.length) R.warn('runtime', `${noisy.length} message(s) while loading js/aesthetic-spec.js + js/moves/*.js, e.g. ${noisy[0].slice(0, 120)}`);
}

/* ------------------------------------------------------------------ list moves */
function listMoves(asJson, cat) {
  const moves = Object.values(cat.moves).sort((a, b) => (a.category + a.id).localeCompare(b.category + b.id));
  if (asJson) return JSON.stringify({ source: cat.source, kitComponents: cat.kit || FALLBACK_KIT, moves }, null, 2);
  const out = [`# Move catalog (${moves.length} moves; source: ${cat.source})`, ''];
  /* index: by category, then by purpose (id + `what` keywords; a move may sit under several purposes) */
  const link = m => `[${m.id}](#${m.id})`;
  const cats = [...new Set(moves.map(m => m.category || 'uncategorised'))];
  out.push('## Index by category', '');
  for (const c of cats) out.push(`- **${c}**: ${moves.filter(m => (m.category || 'uncategorised') === c).map(link).join(', ')}`);
  const PURPOSES = [
    ['Surfaces & depth', /shadow|elevat|relief|raised|recess|glass|surface|depth|bevel|emboss|neumorph|blur|grain|texture|lamp/i],
    ['Edges & rules', /border|rule|outline|stroke|corner|radius|divider|frame|edge|rim|hairline|underline/i],
    ['Type & headline', /type|font|caps|tracking|headline|display|label|heading|title|numeral|case|serif|mono|kern/i],
    ['Colour recipes', /colou?r|palette|canvas|tint|contrast|duotone|ink|mix|luminance|hue|gradient|scheme/i],
    ['Numbering & ornament', /number|index|ornament|marker|bullet|badge|ticker|stamp|sticker|folio|cartouche|crop|tag|ribbon/i],
    ['Art generators', /pattern|ripple|halftone|plate|skyline|stripe|rays|rings/i],
    ['States & motion', /state|press|hover|focus|motion|animat|sink|invert|select|active|disabled|reduced/i],
  ];
  out.push('', '## Index by purpose', '');
  const seen = new Set();
  for (const [name, re] of PURPOSES) {
    const hit = moves.filter(m => (name === 'Art generators' && (m.category === 'art' || m.hooks.includes('art'))) || (name === 'States & motion' && m.category === 'state') || re.test(m.id));
    hit.forEach(m => seen.add(m.id));
    if (hit.length) out.push(`- **${name}**: ${hit.map(link).join(', ')}`);
  }
  const rest = moves.filter(m => !seen.has(m.id));
  if (rest.length) out.push(`- **Layout, structure & other**: ${rest.map(link).join(', ')}`);
  out.push('', 'Every entry below shows tier, `what`, params, materials, states and hooks.', '');
  let cur = null;
  for (const m of moves) {
    if (m.category !== cur) { cur = m.category; out.push(`## ${cur || 'uncategorised'}`, ''); }
    out.push(`### ${m.id}${m.libraryId ? `  (library: ${m.libraryId})` : ''}`);
    out.push(`- tier: ${m.tier || '?'}${m.what ? `\n- what: ${m.what}` : ''}`);
    const ps = Object.entries(m.params).map(([n, p]) => `${n} (${p.kind}, default ${JSON.stringify(p.default)}${p.range ? `, ${p.range[0]}..${p.range[1]}` : ''}${p.options ? `, ${p.options.join('|')}` : ''})`);
    if (ps.length) out.push(`- params: ${ps.join('; ')}`);
    if (m.materials.length) out.push(`- materials: ${m.materials.join(', ')}`);
    if (m.states.length) out.push(`- states: ${m.states.join(', ')}`);
    if (m.hooks.length) out.push(`- hooks: ${m.hooks.join(', ')}`);
    out.push('');
  }
  out.push(`Kit components: ${(cat.kit || FALLBACK_KIT).join(', ')}`);
  return out.join('\n');
}

/* ------------------------------------------------------------------ self test */
function selfTest() {
  const expectedFile = path.join(FIXTURES, 'EXPECTED.md');
  const md = fs.readFileSync(expectedFile, 'utf8').split('\n');
  const exp = {}; let cur = null;
  for (const line of md) {
    const h = line.match(/^## (\S+)/);
    if (h) { cur = h[1]; exp[cur] = []; continue; }
    const e = line.match(/^- (FAIL|WARN|CLEAN)\b\s*(\S*)/);
    if (e && cur) exp[cur].push({ level: e[1], id: e[2] });
  }
  const { sb, logs } = loadRuntime();
  const cat = getCatalog(sb);
  let bad = 0;
  for (const name of Object.keys(exp)) {
    const R = makeReport();
    const dir = path.join(FIXTURES, name);
    if (!fs.existsSync(dir)) { console.log(`FAIL  ${name}  fixture folder missing`); bad++; continue; }
    runStatic(dir, R, cat);
    const got = R.results;
    const problems = [];
    for (const e of exp[name]) {
      if (e.level === 'CLEAN') { const x = got.filter(r => r.level !== 'PASS' && r.id !== 'kit-unmapped'); if (x.length) problems.push(`expected clean, got ${x.map(r => r.level + ':' + r.id).join(',')}`); }
      else if (!got.some(r => r.level === e.level && r.id === e.id)) problems.push(`missing ${e.level} ${e.id}`);
    }
    const expFail = new Set(exp[name].filter(e => e.level === 'FAIL').map(e => e.id));
    for (const r of got) if (r.level === 'FAIL' && !expFail.has(r.id)) problems.push(`unexpected FAIL ${r.id}: ${r.msg.slice(0, 100)}`);
    if (problems.length) { bad++; console.log(`FAIL  ${name}  ${problems.join('; ')}`); }
    else console.log(`PASS  ${name}  ${exp[name].map(e => e.level + (e.id ? ' ' + e.id : '')).join(', ')}`);
  }
  console.log(`self-test: ${Object.keys(exp).length - bad} of ${Object.keys(exp).length} fixtures gave their expected result` + (cat.v2 ? '' : ' (v1 runtime catalog)'));
  return bad ? 1 : 0;
}

/* ------------------------------------------------------------------ main */
function main() {
  const argv = process.argv.slice(2);
  const o = { json: false, render: null, shots: false, list: false, self: false, out: null, target: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') { console.log(USAGE); return 0; }
    else if (a === '--json') o.json = true;
    else if (a === '--shots') o.shots = true;
    else if (a === '--list-moves') o.list = true;
    else if (a === '--self-test') o.self = true;
    else if (a === '--render') { o.render = argv[++i]; if (!/^\d+$/.test(o.render || '')) { console.error('--render needs a port number'); return 2; } }
    else if (a === '--out') o.out = argv[++i];
    else if (a === '--palette') { o.palette = argv[++i]; if (!/^#[0-9a-fA-F]{6}$/.test(o.palette || '')) { console.error('--palette needs a #rrggbb hex'); return 2; } }
    else if (a.startsWith('-')) { console.error(`unknown option ${a}\n\n${USAGE}`); return 2; }
    else if (!o.target) o.target = a;
    else { console.error('only one target allowed'); return 2; }
  }
  if (o.self) return selfTest();
  const { sb, logs } = loadRuntime();
  const cat = getCatalog(sb);
  if (o.list) { console.log(listMoves(o.json, cat)); return 0; }
  if (!o.target) { console.log(USAGE); return 2; }
  if (o.shots && !o.render) { console.error('--shots needs --render <port> (the server port)'); return 2; }

  const R = makeReport();
  let spec = null, ctx = { folder: null };
  let key = null;
  const t = path.resolve(o.target);
  if (fs.existsSync(t)) {
    runtimeNotes(logs, R);
    ({ spec, ctx } = runStatic(t, R, cat));
    key = spec && isStr(spec.key) ? spec.key : null;
  } else if (/^[a-z0-9][a-z0-9-]*$/.test(o.target)) {
    key = o.target;
    R.pass('target', `"${key}" treated as a registered lab key: static checks skipped`);
  } else { R.fail('json', `${o.target} is not a folder, file or lab key`); }

  let table = null;
  if (o.render && key) {
    const render = require('./aesthetic-check/render.js');
    const outDir = o.out ? path.resolve(o.out) : (ctx.folder ? path.join(ctx.folder, 'shots') : null);
    table = render.run({ port: o.render, key, R, ROOT, shots: o.shots, outDir, palette: o.palette });
  } else if (o.render) R.fail('render', 'no key to render (static checks failed to read one)');

  const count = l => R.results.filter(r => r.level === l).length;
  const summary = { pass: count('PASS'), warn: count('WARN'), fail: count('FAIL') };
  if (o.json) console.log(JSON.stringify({ target: o.target, key, results: R.results, contrast: table, summary }, null, 2));
  else {
    for (const r of R.results) console.log(`${r.level}  ${r.id}  ${r.msg}`);
    if (table && table.text) console.log('\n' + table.text + '\n');
    console.log(`summary: ${summary.pass} pass, ${summary.warn} warn, ${summary.fail} fail${key ? `  (${key})` : ''}`);
  }
  return summary.fail ? 1 : 0;
}

process.exitCode = main();
