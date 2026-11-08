/* ---------------------------------------------------------------------
   custom-aesthetics.js — custom (spec v2) aesthetics in the normal app.

   Two homes, one registry:
     - folder: custom-aesthetics/<key>/ (aesthetic.json, art/, rounds.json), listed in
       custom-aesthetics/index.json { "aesthetics": ["darkroom"] }. Shipped with the app; cannot be deleted here.
     - mine:   imported or duplicated styles, LibraryStore collection 'aesthetics'
       (IndexedDB in the browser, Application Support/.../aesthetics in the Mac app).
   Both go through registerSpecAesthetic (js/aesthetic-spec.js), so a custom style is a normal entry in
   AESTHETICS beside the 45 built-ins. Imported content is untrusted: the runtime validates it (field
   whitelist, no < > in strings, CSS-safe text/colour params, sanitised svg, data:image only).

   Loading is async (fetch; the Mac app serves files from app://, no sync XHR). CustomAesthetics.ready
   resolves once the folder and stored styles are registered; LibraryUI.init waits for it (bounded).

   A style is shared as one file, <key>.aesthetic.json, a bundle:
     { "format": "looks-good-aesthetic", "version": 1, "aesthetic": {spec 2}, "rounds": {...}|null,
       "art": { "art/hero.svg": "<svg...", "art/p.png": "data:image/png;base64,..." } }
   A bare aesthetic.json (spec 2) is accepted too, with no art files.
   Optional "versions": [{ "round": n, "date": "YYYY-MM-DD", "aesthetic": {spec 2} }] (round snapshots, newest last,
   written by the studio editor, js/studio.js; the oldest are dropped so the bundle stays under 2 MB).

   Starters (the studio's New style starting points) live in custom-aesthetics/starters/<id>/ and are listed under
   "starters" in custom-aesthetics/index.json. They are never registered as styles: starters() and starter(id) read them.

   Public: window.CustomAesthetics — see docs/aesthetic-library/PLAN.md (API contract) and the
   comments on each method below.
------------------------------------------------------------------------ */

const CustomAesthetics = (function () {
  'use strict';

  const INDEX_URL = 'custom-aesthetics/index.json';
  const FORMAT = 'looks-good-aesthetic';
  const MAX_BUNDLE = 2 * 1024 * 1024;     // characters of bundle text
  const MAX_ART = 12;                     // art files per bundle
  const MAX_VERSIONS = 30;                // round snapshots kept in a bundle
  const MAX_NAME = 80;
  const DEFAULT_KEY = 'soft-form';        // what a brand falls back to when its custom style goes away
  const MINE_WAIT = 2500;                 // ms ready waits for the stored styles
  const ART_PATH = /^art\/[A-Za-z0-9._\- /]+\.(svg|png|jpe?g|webp|gif)$/i;
  const FOLDER_OK = /^[a-z0-9][a-z0-9-]*$/;
  // The top-level fields a stored (untrusted) style may carry: the runtime's whitelist (js/aesthetic-spec.js UNTRUSTED_FIELDS).
  const SPEC_FIELDS = ['spec', 'key', 'order', 'name', 'descriptor', 'influences', 'summary', 'coreTrick', 'motto', 'kicker', 'mode',
    'lineage', 'meta', 'build', 'labels', 'copy', 'layout', 'type', 'roles', 'rules', 'highlight', 'slideShape', 'highlightNote', 'deck', 'colour', 'moves', 'kit', 'art'];
  const VERSION_PROBE_KEY = 'studio--vcheck';   // temporary key a version snapshot is validated under

  const folderEntries = new Map();   // key -> { key, folder, base, spec, rounds, files }
  const mineEntries = new Map();     // key -> { id, createdAt, updatedAt, bundle }
  const listeners = [];

  const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
  const clone = v => JSON.parse(JSON.stringify(v));
  const msg = e => String((e && e.message) || e);
  const fail = error => ({ ok: false, error });

  /* ---------------- helpers ---------------- */
  function coll() {
    if (typeof LibraryStore === 'undefined') throw new Error('storage is not available');
    return LibraryStore.collection('aesthetics');
  }

  // True when the key is taken by something that is not a custom style: a built-in, a classic copy or a lab spec.
  function isOtherKey(key) {
    if (folderEntries.has(key) || mineEntries.has(key)) return false;
    return AESTHETICS.some(a => a.key === key) || key.endsWith('--classic') || hasClassicAesthetic(key);
  }
  function keyTaken(key) { return folderEntries.has(key) || mineEntries.has(key) || isOtherKey(key); }

  function freeKey(key) {
    for (let n = 2; n < 1000; n++) {
      const suffix = `-${n}`;
      const k = key.slice(0, 48 - suffix.length).replace(/-+$/, '') + suffix;
      if (!keyTaken(k)) return k;
    }
    return `${key.slice(0, 40)}-${Date.now().toString(36)}`;
  }

  // The runtime registers against AESTHETIC_META / AESTHETIC_BUILD, which aesthetic-meta.js creates after this file.
  function whenTables() {
    if (document.readyState !== 'loading') return Promise.resolve();
    // after DOMContentLoaded and one tick, so the app's own init has run first
    return new Promise(res => document.addEventListener('DOMContentLoaded', () => setTimeout(res, 0), { once: true }));
  }

  async function getText(url) {
    const r = await fetch(url, { cache: 'no-cache' });
    if (!r.ok) { const e = new Error('HTTP ' + r.status); e.status = r.status; throw e; }
    return r.text();
  }

  function dataUrlOf(blob) {
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(String(fr.result));
      fr.onerror = () => rej(fr.error || new Error('read failed'));
      fr.readAsDataURL(blob);
    });
  }

  // rounds.json is shown as text by the Styles home: keep it plain data (no markup characters, no odd keys, bounded).
  function cleanRounds(v) {
    let nodes = 0;
    const walk = (x, depth) => {
      if (++nodes > 5000 || depth > 8) return null;
      if (typeof x === 'string') return x.replace(/[<>]/g, '').slice(0, 2000);
      if (typeof x === 'number') return Number.isFinite(x) ? x : null;
      if (typeof x === 'boolean' || x === null) return x;
      if (Array.isArray(x)) return x.map(i => walk(i, depth + 1));
      if (isObj(x)) {
        const o = {};
        for (const k of Object.keys(x)) if (k !== '__proto__' && k !== 'constructor' && k !== 'prototype') o[k] = walk(x[k], depth + 1);
        return o;
      }
      return null;
    };
    return walk(v, 0);
  }

  /* checkBundle(raw, { deep }) -> { ok, bundle } | { ok:false, error }. Normalises: a clean copy with art, rounds, versions (deep also validates each version snapshot). */
  function checkBundle(raw, opts) {
    if (!isObj(raw)) return fail('This is not an aesthetic bundle.');
    if (raw.format !== FORMAT) return fail(`This is not an aesthetic bundle (format must be "${FORMAT}").`);
    if (raw.version !== 1) return fail('This bundle needs a newer version of the app (unsupported bundle version).');
    if (!isObj(raw.aesthetic)) return fail('The bundle has no aesthetic.');
    if (raw.rounds != null && !isObj(raw.rounds)) return fail('The bundle\'s rounds must be an object or null.');
    const art = raw.art == null ? {} : raw.art;
    if (!isObj(art)) return fail('The bundle\'s art must be an object of files.');
    const paths = Object.keys(art);
    if (paths.length > MAX_ART) return fail(`The bundle has more than ${MAX_ART} art files.`);
    for (const p of paths) {
      if (!ART_PATH.test(p) || p.includes('..') || p.includes('//')) return fail(`Art path "${p.slice(0, 60)}" is not allowed (use art/<name>.svg, .png, .jpg, .webp or .gif).`);
      const v = art[p];
      if (typeof v !== 'string') return fail(`Art file "${p}" must be text.`);
      if (/\.svg$/i.test(p)) { if (!/<svg[\s>]/i.test(v)) return fail(`Art file "${p}" is not an SVG.`); }
      else if (!v.startsWith('data:') || !specAllowedImage(v)) return fail(`Art file "${p}" must be a data:image png, jpeg, webp or gif.`);
    }
    let versions = [];
    if (raw.versions != null) {
      if (!Array.isArray(raw.versions)) return fail('The bundle\'s versions must be a list.');
      for (const v of raw.versions) {
        if (!isObj(v) || !isObj(v.aesthetic) || typeof v.round !== 'number' || !Number.isFinite(v.round)) return fail('Each version needs a round number and an aesthetic.');
        if (v.date != null && typeof v.date !== 'string') return fail('A version\'s date must be text.');
      }
      versions = raw.versions.slice(-MAX_VERSIONS).map(v => ({ round: v.round, date: typeof v.date === 'string' ? v.date.slice(0, 40).replace(/[<>]/g, '') : '', aesthetic: clone(v.aesthetic) }));
    }
    const bundle = { format: FORMAT, version: 1, aesthetic: clone(raw.aesthetic), rounds: raw.rounds ? cleanRounds(raw.rounds) : null, art: clone(art) };
    if (versions.length) bundle.versions = versions;
    let size = 0;
    try { size = JSON.stringify(bundle).length; } catch (e) { return fail('The bundle is not plain data.'); }
    // keep the bundle under the cap by dropping the oldest snapshots first
    while (size > MAX_BUNDLE && bundle.versions && bundle.versions.length) {
      bundle.versions.shift();
      if (!bundle.versions.length) delete bundle.versions;
      size = JSON.stringify(bundle).length;
    }
    if (size > MAX_BUNDLE) return fail('This bundle is bigger than 2 MB.');
    if (opts && opts.deep && bundle.versions) {
      // Every snapshot is validated like the aesthetic itself (untrusted), under a temporary key that is removed again.
      for (const v of bundle.versions) {
        const errors = [];
        unregisterSpecAesthetic(VERSION_PROBE_KEY);
        const def = registerSpecAesthetic(Object.assign({}, v.aesthetic, { key: VERSION_PROBE_KEY }), { untrusted: true, files: bundle.art, errors, file: 'version snapshot', quietHooks: true });
        unregisterSpecAesthetic(VERSION_PROBE_KEY);
        if (!def) return fail(`Round ${v.round}'s saved version is not valid (${errors[0] || 'it could not be registered'}).`);
      }
    }
    return { ok: true, bundle };
  }

  /* ---------------- registering ---------------- */
  function registerMine(rec, label) {
    const c = checkBundle(rec && rec.bundle);
    if (!c.ok) { console.error(`custom aesthetics: ${label} is not usable (${c.error}); skipped`); return false; }
    const key = c.bundle.aesthetic.key;
    if (typeof key !== 'string') { console.error(`custom aesthetics: ${label} has no key; skipped`); return false; }
    if (folderEntries.has(key) || mineEntries.has(key) || isOtherKey(key)) {
      console.warn(`custom aesthetics: ${label} ("${key}") clashes with an existing style key; skipped (a folder style wins)`);
      return false;
    }
    const def = registerSpecAesthetic(c.bundle.aesthetic, { untrusted: true, files: c.bundle.art, file: label, quietHooks: true });
    if (!def) return false;    // the runtime logged one console.error naming it
    mineEntries.set(key, { id: rec.id, createdAt: rec.createdAt || 0, updatedAt: rec.updatedAt || rec.createdAt || 0, bundle: c.bundle });
    return true;
  }

  function registerFolder(f) {
    const key = f.spec && f.spec.key;
    const file = f.base + 'aesthetic.json';
    if (typeof key !== 'string') { console.error(`custom aesthetics: ${file} has no key; skipped`); return; }
    if (isOtherKey(key)) { console.error(`custom aesthetics: ${file}: key "${key}" belongs to a built-in style; skipped`); return; }
    if (folderEntries.has(key)) { console.error(`custom aesthetics: ${file}: key "${key}" is listed twice; skipped`); return; }
    const def = registerSpecAesthetic(f.spec, { base: f.base, file, json: true, files: f.files, quietHooks: true });
    if (!def) return;
    folderEntries.set(key, { key, folder: f.folder, base: f.base, spec: f.spec, rounds: f.rounds, files: f.files });
  }

  async function readFolder(folder) {
    const base = `custom-aesthetics/${folder}/`;
    let spec;
    try { spec = JSON.parse(await getText(base + 'aesthetic.json')); }
    catch (e) { console.error(`custom aesthetics: cannot load ${base}aesthetic.json (${msg(e)})`); return null; }
    let rounds = null;
    try { rounds = cleanRounds(JSON.parse(await getText(base + 'rounds.json'))); }
    catch (e) { if (e.status !== 404) console.error(`custom aesthetics: ${base}rounds.json is not usable (${msg(e)})`); }
    const files = {};
    const hero = spec && spec.art && spec.art.hero;
    if (hero && hero.kind === 'svg' && typeof hero.src === 'string' && ART_PATH.test(hero.src) && !hero.src.includes('..')) {
      try { files[hero.src] = await getText(base + hero.src); }
      catch (e) { console.error(`custom aesthetics: cannot read art ${base}${hero.src} (${msg(e)})`); }
    }
    return { folder, base, spec, rounds, files };
  }

  async function loadFolders() {
    let idx;
    try {
      const r = await fetch(INDEX_URL, { cache: 'no-cache' });
      if (r.status === 404) return;                                   // no folder index: nothing to load, no error
      if (!r.ok) throw new Error('HTTP ' + r.status);
      idx = JSON.parse(await r.text());
    } catch (e) {
      if (e instanceof TypeError) console.warn(`custom aesthetics: ${INDEX_URL} could not be fetched (${msg(e)})`);
      else console.error(`custom aesthetics: cannot read ${INDEX_URL} (${msg(e)})`);
      return;
    }
    if (!idx || !Array.isArray(idx.aesthetics)) { console.error(`custom aesthetics: ${INDEX_URL} needs { "aesthetics": [folder names] }`); return; }
    const names = [];
    for (const f of idx.aesthetics) {
      if (typeof f !== 'string' || !FOLDER_OK.test(f)) { console.error(`custom aesthetics: ${INDEX_URL} lists an invalid folder name ${JSON.stringify(f)}`); continue; }
      names.push(f);
    }
    const read = await Promise.all(names.map(readFolder));
    await whenTables();
    read.forEach(f => { if (f) registerFolder(f); });
  }

  async function loadMine() {
    let recs;
    try { recs = await coll().list(); }
    catch (e) { console.error(`custom aesthetics: cannot read your saved styles (${msg(e)})`); return; }
    await whenTables();
    (recs || []).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)).forEach(rec => registerMine(rec, `saved style ${rec && rec.id}`));
  }

  /* ---------------- keeping the app in step ---------------- */
  // The lists that are built from AESTHETICS (families, gallery tiles, blend donors); the open brand redraws
  // when it is in the editor; the brands home refreshes so tile labels follow.
  function syncPickers() {
    try {
      if (typeof buildAestheticFamilies === 'function') buildAestheticFamilies();
      if (typeof buildAestheticList === 'function') buildAestheticList();
      if (typeof blendRenderOptions === 'function') blendRenderOptions();
      if (document.body && document.body.dataset.view === 'editor' && typeof render === 'function') render();
      if (document.body && document.body.dataset.view === 'library' && typeof LibraryUI !== 'undefined' && LibraryUI.refresh) LibraryUI.refresh();
    } catch (e) { console.error('custom aesthetics: could not refresh the style lists', e); }
  }

  function notify() {
    syncPickers();
    listeners.slice().forEach(fn => { try { fn(); } catch (e) { console.error('custom aesthetics: onChange listener failed', e); } });
  }

  // The open brand moves to the default style when its custom style is removed.
  function fallbackBrand(key) {
    if (typeof state === 'undefined' || !state) return;
    if (state.blend && state.blend.with === key) state.blend = null;
    if (state.aesthetic === key) {
      if (typeof applyAesthetic === 'function') applyAesthetic(DEFAULT_KEY);
      else state.aesthetic = DEFAULT_KEY;
      state.aestheticVersion = 'current';
      state.combo = null;
    }
  }

  /* ---------------- boot ---------------- */
  let late = false;
  const ready = (async function () {
    try {
      await loadFolders();
      let mineDone = false;
      const mine = loadMine().catch(e => console.error('custom aesthetics: saved styles failed to load', e)).then(() => { mineDone = true; if (late) notify(); });
      await Promise.race([mine, new Promise(res => setTimeout(res, MINE_WAIT))]);
      if (!mineDone) { late = true; console.warn('custom aesthetics: saved styles are slow to load; they will appear when ready'); }
      syncPickers();
    } catch (e) { console.error('custom aesthetics: loading failed', e); }
  })();

  /* ---------------- public API ---------------- */
  function list() {
    const out = [];
    folderEntries.forEach(e => out.push({ key: e.key, name: e.spec.name, source: 'folder', id: null, folder: e.folder, updatedAt: null, hasRounds: !!e.rounds }));
    Array.from(mineEntries.values()).sort((a, b) => a.createdAt - b.createdAt).forEach(r => out.push({
      key: r.bundle.aesthetic.key, name: r.bundle.aesthetic.name, source: 'mine', id: r.id, folder: null, updatedAt: r.updatedAt, hasRounds: !!r.bundle.rounds,
    }));
    return out;
  }

  function source(key) {
    if (typeof key !== 'string') return null;
    if (folderEntries.has(key)) return 'folder';
    if (mineEntries.has(key)) return 'mine';
    if (typeof SPEC_LAB !== 'undefined' && SPEC_LAB.specs[key]) return null;      // a lab spec, not custom
    if (AESTHETICS.some(a => a.key === key) || key.endsWith('--classic') || hasClassicAesthetic(key)) return 'builtin';
    return null;
  }

  function rounds(key) {
    const f = folderEntries.get(key), m = mineEntries.get(key);
    const r = f ? f.rounds : m ? m.bundle.rounds : null;
    return r ? clone(r) : null;
  }

  // The shareable bundle for a folder or stored style (a fresh object each call). Image art in a folder is read
  // into data URLs so the bundle is one self-contained file.
  async function bundle(key) {
    const m = mineEntries.get(key);
    if (m) return clone(m.bundle);
    const f = folderEntries.get(key);
    if (!f) return null;
    const art = Object.assign({}, f.files);
    const hero = f.spec.art && f.spec.art.hero;
    if (hero && hero.kind === 'image' && typeof hero.src === 'string' && !hero.src.startsWith('data:') && ART_PATH.test(hero.src) && !hero.src.includes('..')) {
      try {
        const r = await fetch(f.base + hero.src);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        art[hero.src] = await dataUrlOf(await r.blob());
      } catch (e) { console.error(`custom aesthetics: cannot read art ${f.base}${hero.src} for the export (${msg(e)})`); }
    }
    return { format: FORMAT, version: 1, aesthetic: clone(f.spec), rounds: f.rounds ? clone(f.rounds) : null, art };
  }

  // The bundle as the exact text exportFile saves.
  async function exportText(key) {
    const b = await bundle(key);
    return b ? JSON.stringify(b, null, 2) + '\n' : null;
  }

  // Saves <key>.aesthetic.json through the app's normal download path (browser download / Mac save).
  async function exportFile(key) {
    const text = await exportText(key);
    if (text == null) return fail('Unknown style.');
    const blob = new Blob([text], { type: 'application/json' });
    const filename = `${key}.aesthetic.json`;
    if (typeof bdSaveBlob === 'function') bdSaveBlob(blob, filename);
    else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 20000);
    }
    return { ok: true, filename };
  }

  // Registers a checked bundle and stores it. `replacing` is the stored entry with the same key (replace flow).
  async function commit(raw, replacing) {
    const c = checkBundle(raw, { deep: true });
    if (!c.ok) return c;
    const b = c.bundle;
    const key = b.aesthetic.key;
    if (typeof key !== 'string') return fail('The style has no key.');
    const errors = [];
    if (replacing) unregisterSpecAesthetic(key);
    const def = registerSpecAesthetic(b.aesthetic, { untrusted: true, files: b.art, errors, file: 'imported style', quietHooks: true });
    const restore = () => { if (replacing) registerSpecAesthetic(replacing.bundle.aesthetic, { untrusted: true, files: replacing.bundle.art, file: 'saved style', quietHooks: true }); };
    if (!def) { restore(); return fail(errors[0] || 'The style could not be added.'); }
    const now = Date.now();
    const rec = replacing
      ? { id: replacing.id, createdAt: replacing.createdAt, updatedAt: now, bundle: b }
      : { id: LibraryStore.newId(), createdAt: now, updatedAt: now, bundle: b };
    try { await coll().put(rec); }
    catch (e) { unregisterSpecAesthetic(key); restore(); return fail(`The style could not be saved (${msg(e)}).`); }
    mineEntries.set(key, rec);
    notify();
    return { ok: true, key };
  }

  /* importText(text, { onClash }) -> { ok, key, error }. Accepts a bundle or a bare aesthetic.json. A key that is
     already a custom style asks onClash(key) -> 'replace' | 'copy' | 'cancel' (no callback = cancel). Replace works
     on stored ("mine") styles only; copy gets a new key (<key>-2, -3 ...) and " (copy)" on the name. A built-in key
     is refused. */
  async function importText(text, opts) {
    opts = opts || {};
    try {
      if (typeof text !== 'string' || !text.trim()) return fail('Nothing to import.');
      if (text.length > MAX_BUNDLE) return fail('This file is bigger than 2 MB.');
      let raw;
      try { raw = JSON.parse(text); } catch (e) { return fail('This is not a JSON file.'); }
      if (isObj(raw) && raw.format === undefined && raw.spec === 2) raw = { format: FORMAT, version: 1, aesthetic: raw, rounds: null, art: {} };
      const c = checkBundle(raw, { deep: true });
      if (!c.ok) return c;
      const b = c.bundle;
      let key = b.aesthetic.key;
      if (typeof key !== 'string' || !key) return fail('The style has no key.');
      if (isOtherKey(key)) return { ok: false, key, error: 'This key belongs to a built-in style.' };
      let replacing = null;
      if (folderEntries.has(key) || mineEntries.has(key)) {
        const choice = typeof opts.onClash === 'function' ? await opts.onClash(key) : 'cancel';
        if (choice === 'copy') {
          key = freeKey(key);
          b.aesthetic.key = key;
          b.aesthetic.name = `${b.aesthetic.name} (copy)`;
        } else if (choice === 'replace') {
          if (folderEntries.has(key)) return { ok: false, key, error: 'A style from the app\'s custom-aesthetics folder can\'t be replaced. Import it as a copy instead.' };
          replacing = mineEntries.get(key);
        } else return { ok: false, key, error: 'Cancelled.', cancelled: true };
      }
      if (replacing) addLastRoundSnapshot(b);
      const r = await commit(b, replacing);
      return r.ok ? r : { ok: false, key, error: r.error };
    } catch (e) { return fail(msg(e)); }
  }

  /* An agent closes rounds without saving a version. When an import replaces a stored style, the incoming bundle's last
     closed round gets a snapshot of the incoming aesthetic (so Compare and Go back reach it), if it has none and the
     bundle stays under the version and size caps. An open round is never snapshotted. */
  function addLastRoundSnapshot(b) {
    const list = b.rounds && Array.isArray(b.rounds.rounds) ? b.rounds.rounds.filter(x => x && !x.open && typeof x.n === 'number') : [];
    if (!list.length) return;
    const last = list.reduce((a, x) => (x.n > a.n ? x : a));
    const versions = Array.isArray(b.versions) ? b.versions : [];
    if (versions.some(v => v.round === last.n) || versions.length >= MAX_VERSIONS) return;
    const next = versions.concat([{ round: last.n, date: typeof last.date === 'string' ? last.date : '', aesthetic: clone(b.aesthetic) }]);
    if (JSON.stringify(Object.assign({}, b, { versions: next })).length > MAX_BUNDLE) return;
    b.versions = next.sort((x, y) => x.round - y.round);
  }

  // Copies a folder or stored style into a new stored style (new key, " (copy)" on the name unless opts.name is given).
  async function duplicate(key, opts) {
    try {
      const b = await bundle(key);
      if (!b) return fail('Unknown style.');
      const name = opts && typeof opts.name === 'string' && opts.name.trim() ? opts.name.trim().slice(0, MAX_NAME) : `${b.aesthetic.name} (copy)`;
      const newKey = freeKey(key);
      b.aesthetic.key = newKey;
      b.aesthetic.name = name;
      b.aesthetic.lineage = Object.assign({}, isObj(b.aesthetic.lineage) ? b.aesthetic.lineage : {}, { forkedFrom: key });
      b.rounds = null;
      delete b.versions;
      const r = await commit(b, null);
      return r.ok ? r : { ok: false, key: newKey, error: r.error };
    } catch (e) { return fail(msg(e)); }
  }

  // Renames a stored style (display name only; the key stays).
  async function rename(key, name) {
    try {
      const rec = mineEntries.get(key);
      if (!rec) return fail(folderEntries.has(key) ? 'Folder styles can\'t be renamed here. Duplicate it first.' : 'Only your own styles can be renamed.');
      const n = typeof name === 'string' ? name.trim() : '';
      if (!n || n.length > MAX_NAME || /[<>]/.test(n)) return fail(`A name is 1 to ${MAX_NAME} characters, without < or >.`);
      const next = clone(rec.bundle);
      next.aesthetic.name = n;
      unregisterSpecAesthetic(key);
      const errors = [];
      if (!registerSpecAesthetic(next.aesthetic, { untrusted: true, files: next.art, errors, file: 'saved style', quietHooks: true })) {
        registerSpecAesthetic(rec.bundle.aesthetic, { untrusted: true, files: rec.bundle.art, file: 'saved style', quietHooks: true });
        return fail(errors[0] || 'The style could not be renamed.');
      }
      const updated = { id: rec.id, createdAt: rec.createdAt, updatedAt: Date.now(), bundle: next };
      try { await coll().put(updated); }
      catch (e) {
        unregisterSpecAesthetic(key);
        registerSpecAesthetic(rec.bundle.aesthetic, { untrusted: true, files: rec.bundle.art, file: 'saved style', quietHooks: true });
        return fail(`The new name could not be saved (${msg(e)}).`);
      }
      mineEntries.set(key, updated);
      notify();
      return { ok: true };
    } catch (e) { return fail(msg(e)); }
  }

  // Removes a stored style. The open brand falls back to the default style.
  async function remove(key) {
    try {
      const rec = mineEntries.get(key);
      if (!rec) return fail(folderEntries.has(key) ? 'This style is part of the app and can\'t be deleted here.' : 'Only your own styles can be deleted.');
      await coll().remove(rec.id);
      fallbackBrand(key);
      mineEntries.delete(key);
      unregisterSpecAesthetic(key);
      notify();
      return { ok: true };
    } catch (e) { return fail(msg(e)); }
  }

  /* ---------------- the studio editor's paths ---------------- */
  // A free key for a new style: the name in lowercase kebab-case, 3 to 48 characters, made unique (-2, -3 ...).
  function uniqueKey(name) {
    let k = String(name || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 44).replace(/-+$/, '');
    if (k.length < 3) k = (k + '-style').replace(/^-/, '');
    return keyTaken(k) ? freeKey(k) : k;
  }

  // Starters: custom-aesthetics/starters/<id>/ listed under "starters" in custom-aesthetics/index.json. Never registered.
  let starterIds = null;
  async function starterList() {
    if (starterIds) return starterIds;
    let ids = [];
    try {
      const r = await fetch(INDEX_URL, { cache: 'no-cache' });
      if (r.ok) { const idx = JSON.parse(await r.text()); if (idx && Array.isArray(idx.starters)) ids = idx.starters.filter(f => typeof f === 'string' && FOLDER_OK.test(f)); }
    } catch (e) { console.warn(`custom aesthetics: starters could not be listed (${msg(e)})`); }
    starterIds = ids;
    return ids;
  }

  async function readStarter(id) {
    const base = `custom-aesthetics/starters/${id}/`;
    const spec = JSON.parse(await getText(base + 'aesthetic.json'));
    const art = {};
    const hero = spec && spec.art && spec.art.hero;
    if (hero && hero.kind === 'svg' && typeof hero.src === 'string' && ART_PATH.test(hero.src) && !hero.src.includes('..')) art[hero.src] = await getText(base + hero.src);
    // Fields outside the stored-style whitelist are dropped (deck and highlightNote are on it).
    Object.keys(spec).forEach(k => { if (!SPEC_FIELDS.includes(k)) delete spec[k]; });
    return { format: FORMAT, version: 1, aesthetic: spec, rounds: null, art };
  }

  /* starters() -> Promise<[{ id, name, descriptor }]>: what New style can start from (Blank first). */
  async function starters() {
    const ids = await starterList();
    const out = [];
    for (const id of ids) {
      try { const b = await readStarter(id); out.push({ id, name: id === 'blank' ? 'Blank' : String(b.aesthetic.name).replace(/\s*\(moves\)$/i, ''), descriptor: b.aesthetic.descriptor || '' }); }
      catch (e) { console.error(`custom aesthetics: starter "${id}" is not usable (${msg(e)})`); }
    }
    return out;
  }

  /* starter(id) -> Promise<bundle | null>: a fresh bundle (spec, art; no rounds) to edit and create() from. */
  async function starter(id) {
    if (!(await starterList()).includes(id)) return null;
    try { return await readStarter(id); }
    catch (e) { console.error(`custom aesthetics: starter "${id}" is not usable (${msg(e)})`); return null; }
  }

  /* create(bundle) -> { ok, key, error }: adds a new stored style from a bundle. A key that is taken gets -2, -3 ...
     (the name is kept); lineage and the rest are the caller's. */
  async function create(bundle) {
    try {
      const c = checkBundle(bundle, { deep: true });
      if (!c.ok) return c;
      const b = c.bundle;
      if (typeof b.aesthetic.key !== 'string' || !b.aesthetic.key) return fail('The style has no key.');
      if (keyTaken(b.aesthetic.key)) b.aesthetic.key = freeKey(b.aesthetic.key);
      const r = await commit(b, null);
      return r.ok ? r : { ok: false, key: b.aesthetic.key, error: r.error };
    } catch (e) { return fail(msg(e)); }
  }

  /* save(key, bundle) -> { ok, error }: replaces a stored ("mine") style with an edited bundle (the key must stay).
     The real key is re-registered so every picker follows; onChange listeners run. On a refusal nothing changes. */
  async function save(key, bundle) {
    try {
      const rec = mineEntries.get(key);
      if (!rec) return fail(folderEntries.has(key) ? 'Folder styles can\'t be edited here. Edit a copy instead.' : 'Only your own styles can be edited.');
      const c = checkBundle(bundle, { deep: true });
      if (!c.ok) return c;
      const next = c.bundle;
      if (next.aesthetic.key !== key) return fail('The style\'s key can\'t change.');
      const errors = [];
      unregisterSpecAesthetic(key);
      const restore = () => registerSpecAesthetic(rec.bundle.aesthetic, { untrusted: true, files: rec.bundle.art, file: 'saved style', quietHooks: true });
      if (!registerSpecAesthetic(next.aesthetic, { untrusted: true, files: next.art, errors, file: 'saved style', quietHooks: true })) {
        restore();
        return fail(errors[0] || 'The style could not be saved.');
      }
      const updated = { id: rec.id, createdAt: rec.createdAt, updatedAt: Date.now(), bundle: next };
      try { await coll().put(updated); }
      catch (e) { unregisterSpecAesthetic(key); restore(); return fail(`The style could not be saved (${msg(e)}).`); }
      mineEntries.set(key, updated);
      notify();
      return { ok: true };
    } catch (e) { return fail(msg(e)); }
  }

  // fn() runs after any add / remove / rename / save (after the pickers have been rebuilt). Returns an unsubscribe function.
  function onChange(fn) {
    if (typeof fn !== 'function') return () => {};
    listeners.push(fn);
    return () => { const i = listeners.indexOf(fn); if (i >= 0) listeners.splice(i, 1); };
  }

  return { ready, list, source, rounds, bundle, exportText, exportFile, importText, duplicate, rename, remove, onChange, uniqueKey, starters, starter, create, save, MAX_BUNDLE, MAX_ART, MAX_VERSIONS };
})();

window.CustomAesthetics = CustomAesthetics;
