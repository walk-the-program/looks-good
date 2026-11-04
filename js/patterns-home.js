/* ---------------------------------------------------------------------
   patterns-home.js — Patterns mode: the Brands | Patterns switch, the
   pattern grid, and the tool view (an iframe of a page under ptrn/, the
   private Ptrn mirror that dev/sync-ptrn.py builds, or under patterns-library/,
   the tracked public copy of the owner's own patterns).

   Views: body[data-view="patterns"]. The grid and the open tool live in the
   same section; the open tool is remembered in the URL hash (#pattern=slug)
   and the last home mode in localStorage, so a launch lands where you left.
------------------------------------------------------------------------ */

const PatternsHome = (function () {
  const MODE_KEY = 'bd.homeMode';
  // The owner's full local mirror (git-ignored) wins when present; otherwise the tracked
  // public library (dev/build-public-patterns.py). Relative, so any server root or subfolder works.
  const CATALOG_URLS = ['ptrn/catalog.json', 'patterns-library/catalog.json'];
  const THEME_CSS = ['fonts/fonts.css', 'css/ptrn-theme.css'].map(p => new URL(p, document.baseURI).href);
  const HOME_PATHS = ['/ptrn/', '/ptrn/index.html', '/patterns-library/', '/patterns-library/index.html'];
  const isHomePath = p => HOME_PATHS.some(h => p === h || p.endsWith(h));

  const $ = id => document.getElementById(id);
  const el = {
    section: $('patterns'), count: $('ptCount'), bar: $('ptBar'), search: $('ptSearch'),
    source: $('ptSource'), cat: $('ptCat'), surprise: $('ptSurprise'), grid: $('ptGrid'),
    missing: $('ptMissing'), none: $('ptNone'), clear: $('ptClear'),
    tool: $('ptTool'), frame: $('ptFrame'), name: $('ptToolName'), toolCat: $('ptToolCat'),
    brand: $('ptBrand'), toolBrand: $('ptToolBrand'),
    back: $('ptBack'), prev: $('ptPrev'), next: $('ptNext'),
  };

  let catalog = null;          // null = not loaded, [] = failed or empty
  let loading = null;
  let visible = [];            // the filtered list, in grid order
  let openSlug = null;
  const filters = { q: '', source: 'all', cat: '' };

  /* ---------- storage + hash ---------- */

  const readMode = () => { try { return localStorage.getItem(MODE_KEY); } catch (e) { return null; } };
  const saveMode = m => { try { localStorage.setItem(MODE_KEY, m); } catch (e) { /* private mode: not remembered */ } };

  function hashSlug() {
    const m = /[#&]pattern=([^&]+)/.exec(location.hash);
    if (!m) return null;
    try { return decodeURIComponent(m[1]); } catch (e) { return null; }
  }
  function setHash(slug) {
    const base = location.pathname + location.search;
    try { history.replaceState(null, '', slug ? base + '#pattern=' + encodeURIComponent(slug) : base); } catch (e) { /* ignore */ }
  }

  /* ---------- brand colours ----------
     The tools keep one "My colors" set in localStorage ("ptrn.mycolors"), read when a
     tool loads. Choosing a brand writes that brand's colours there (switched on); the
     user's own set is parked under BACKUP_KEY first and put back on "No brand". */

  const BRAND_KEY = 'bd.ptrn.brand';
  const BACKUP_KEY = 'bd.ptrn.mycolors.backup';
  const MYC_KEY = 'ptrn.mycolors';
  const NONE = '__none__';
  const ROLE_ORDER = ['primary', 'accent', 'secondary', 'neutralDark', 'neutralLight'];
  let brands = [];             // [{ id, name, cols }]
  let brandId = '';

  const lsGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } };
  const lsDel = k => { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } };

  function brandCols(rec) {
    const c = (rec.savedState && rec.savedState.colors) || (rec.draftState && rec.draftState.colors) || {};
    const out = [];
    ROLE_ORDER.forEach(k => {
      const h = typeof c[k] === 'string' && /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c[k].trim()) ? c[k].trim().toLowerCase() : null;
      if (!h) return;
      const full = h.startsWith('#') ? h : '#' + h;
      if (!out.includes(full)) out.push(full);
    });
    return out;
  }

  // Put the chosen brand's colours where the tools read them, or put the user's own set back.
  function writeColours() {
    const b = brands.find(x => x.id === brandId);
    if (b && b.cols.length) {
      if (lsGet(BACKUP_KEY) === null) {
        lsSet(BACKUP_KEY, lsGet(MYC_KEY) === null ? NONE : lsGet(MYC_KEY));
        if (lsGet(BACKUP_KEY) === null) return;     // backup not stored (quota): never overwrite the user's own set
      }
      lsSet(MYC_KEY, JSON.stringify({ v: 1, cols: b.cols, on: true }));
    } else {
      const bk = lsGet(BACKUP_KEY);
      if (bk !== null) {
        if (bk === NONE) lsDel(MYC_KEY); else lsSet(MYC_KEY, bk);
        lsDel(BACKUP_KEY);
      }
    }
  }

  function renderBrandSelects() {
    const html = '<option value="">No brand</option>' +
      brands.map(b => `<option value="${escapeHtml(b.id)}">${escapeHtml(b.name)}</option>`).join('');
    [el.brand, el.toolBrand].forEach(s => { s.innerHTML = html; s.value = brandId; });
  }

  async function refreshBrands() {
    try {
      const recs = await LibraryStore.list();
      brands = recs.map(r => ({ id: r.id, name: (r.name || '').trim() || 'Untitled brand', cols: brandCols(r) }))
        .filter(b => b.cols.length)
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (e) { brands = []; }
    if (!brandId) brandId = lsGet(BRAND_KEY) || '';
    if (brandId && !brands.some(b => b.id === brandId)) { brandId = ''; lsDel(BRAND_KEY); }
    writeColours();
    renderBrandSelects();
  }

  function chooseBrand(id) {
    brandId = id || '';
    if (brandId) lsSet(BRAND_KEY, brandId); else lsDel(BRAND_KEY);
    writeColours();
    renderBrandSelects();
    if (openSlug === null && catalog) { restoreArt(); applyThumbs(true); } else { thumbRun++; thumbQueue = []; }
    if (openSlug !== null) {      // a tool reads the set when it loads: reload it
      const t = bySlug(openSlug);
      if (t) { el.frame.classList.remove('is-ready'); el.frame.src = 'about:blank'; el.frame.src = t.href; setTimeout(() => el.frame.classList.add('is-ready'), 1500); }
    }
  }

  // The tool's own "+" button adds an ink; answer its colour picker with the next brand colour
  // so the swatch row can hold the whole brand, then let the tool's My colors listener refit.
  function growSwatches(win, doc) {
    const b = brands.find(x => x.id === brandId);
    if (!b) return;
    const host = doc.getElementById('swatches');
    if (!host) return;
    if (!host.querySelector('.sw-add')) return;
    const have = () => host.querySelectorAll('.sw').length;
    const origPick = win.__pickColour;
    win.__pickColour = (anchor, commit) => commit(b.cols[Math.min(have(), b.cols.length - 1)]);
    try {
      // the row is rebuilt on every add, so find the button again each time
      for (let n = 0; n < 12 && have() < b.cols.length; n++) {
        const btn = host.querySelector('.sw-add');
        const before = have();
        if (!btn) break;
        btn.click();
        if (have() === before) break;
      }
    } finally { win.__pickColour = origPick; }
    try { win.dispatchEvent(new win.StorageEvent('storage', { key: MYC_KEY })); } catch (e) { /* tool refits on its next change */ }
  }

  /* ---------- brand thumbnails ----------
     With a brand chosen, every card re-renders its tool in the brand colours: a hidden
     iframe loads the tool (which reads ptrn.mycolors), we wait for it to draw, then
     snapshot its biggest canvas or svg into a small image. At most THUMB_JOBS run at once.
     Snapshots are stored as image bytes in their own IndexedDB (per brand colour set + tool +
     CACHE_VERSION + the catalog's "released" date), so reopening the app paints them at
     once and only tools with no stored snapshot are rendered. Blank or failed captures
     keep the static art and get one retry. Bump CACHE_VERSION to invalidate every stored
     snapshot (e.g. after changing how they are captured). */

  const THUMB_JOBS = 3, THUMB_TIMEOUT = 9000, THUMB_W = 480;
  const CACHE_VERSION = 1, THUMB_DB = 'bdPtrnThumbs', MAX_BRAND_SETS = 6;
  const thumbUrls = new Map();    // slug -> object URL, for thumbSig only
  const thumbFailed = new Set();  // slugs that failed for thumbSig
  let thumbSig = '';
  let thumbReady = false;         // stored snapshots for thumbSig have been loaded
  let thumbRetried = false;
  let thumbRun = 0;               // bumps whenever the brand changes: stale work stops
  let thumbQueue = [];            // [{ t }]
  let thumbActive = 0;

  function brandSig() {
    const b = brands.find(x => x.id === brandId);
    return b && b.cols.length ? b.cols.join(',') : '';
  }
  const thumbVer = t => CACHE_VERSION + '|' + (t.released || '');

  /* -- storage -- */
  let thumbDbP = null;
  function thumbDb() {
    if (!thumbDbP) thumbDbP = new Promise(resolve => {
      try {
        const rq = indexedDB.open(THUMB_DB, 1);
        rq.onupgradeneeded = () => {
          const d = rq.result;
          d.createObjectStore('thumbs', { keyPath: 'key' }).createIndex('sig', 'sig');
          d.createObjectStore('sets', { keyPath: 'sig' });
        };
        rq.onsuccess = () => { rq.result.onversionchange = () => { rq.result.close(); thumbDbP = null; }; resolve(rq.result); };
        rq.onerror = rq.onblocked = () => resolve(null);
      } catch (e) { resolve(null); }
    });
    return thumbDbP;
  }
  const idb = rq => new Promise(res => { rq.onsuccess = () => res(rq.result); rq.onerror = () => res(null); });

  async function storedLoad(sig) {
    const out = new Map();
    try {
      const db = await thumbDb();
      if (!db) return out;
      const rows = await idb(db.transaction('thumbs').objectStore('thumbs').index('sig').getAll(sig));
      (rows || []).forEach(r => out.set(r.slug, r));
    } catch (e) { /* no storage: render fresh */ }
    return out;
  }

  async function storedPut(sig, t, blob) {
    try {
      const db = await thumbDb();
      if (!db) return;
      // raw bytes, not a Blob: WebKit refuses Blobs in IndexedDB in some storage modes
      const buf = await blob.arrayBuffer();
      await idb(db.transaction('thumbs', 'readwrite').objectStore('thumbs')
        .put({ key: sig + '|' + t.slug, sig, slug: t.slug, ver: thumbVer(t), buf, type: blob.type || 'image/jpeg', at: Date.now() }));
    } catch (e) { /* storage full or blocked: the in-memory copy still works */ }
  }

  // Mark this brand set as just used and drop the oldest sets beyond MAX_BRAND_SETS.
  async function storedTouch(sig) {
    try {
      const db = await thumbDb();
      if (!db) return;
      await idb(db.transaction('sets', 'readwrite').objectStore('sets').put({ sig, at: Date.now() }));
      const sets = (await idb(db.transaction('sets').objectStore('sets').getAll())) || [];
      sets.sort((a, b) => b.at - a.at);
      for (const s of sets.slice(MAX_BRAND_SETS)) {
        const tx = db.transaction(['thumbs', 'sets'], 'readwrite');
        const keys = await idb(tx.objectStore('thumbs').index('sig').getAllKeys(s.sig));
        (keys || []).forEach(k => tx.objectStore('thumbs').delete(k));
        tx.objectStore('sets').delete(s.sig);
        await new Promise(res => { tx.oncomplete = tx.onerror = tx.onabort = res; });
      }
    } catch (e) { /* ignore */ }
  }

  /* -- grid painting -- */
  function cardFor(slug) {
    return Array.prototype.find.call(el.grid.children, c => c.dataset.slug === slug) || null;
  }

  function revertCard(img) {
    img.onerror = null;
    if (img.dataset.art) { img.src = img.dataset.art; delete img.dataset.art; }
  }

  function paintCard(slug) {
    const card = cardFor(slug), url = thumbUrls.get(slug);
    if (!card) return;
    card.classList.remove('is-pending');
    const img = card.querySelector('img');
    if (!img || !url || img.src === url) return;
    if (!img.dataset.art) img.dataset.art = img.getAttribute('src');
    img.onerror = () => revertCard(img);         // a bad snapshot never leaves a blank card
    img.classList.add('is-swap');
    img.src = url;
    setTimeout(() => img.classList.remove('is-swap'), 40);   // not rAF: a paused frame loop must never leave the card invisible
  }

  function restoreArt() {
    Array.prototype.forEach.call(el.grid.children, card => {
      card.classList.remove('is-pending');
      const img = card.querySelector('img');
      if (img) revertCard(img);
    });
  }

  function dropThumbs() {     // call after restoreArt so no card still shows one
    thumbUrls.forEach(u => URL.revokeObjectURL(u));
    thumbUrls.clear(); thumbFailed.clear();
  }

  function paintAll() {
    visible.forEach(t => {
      if (thumbUrls.has(t.slug)) paintCard(t.slug);
      else if (!thumbFailed.has(t.slug)) { const c = cardFor(t.slug); if (c) c.classList.add('is-pending'); }
    });
    if (el.section && catalog) el.section.dataset.thumbs = thumbUrls.size + '/' + catalog.length;
  }

  /* -- capture -- */

  // Run fn in the tool's next animation frame (a WebGL canvas reads back blank outside the
  // frame that drew it). If frames are paused for a hidden iframe, run it anyway.
  function inFrame(win, fn) {
    return new Promise(resolve => {
      let done = false;
      const go = () => { if (done) return; done = true; let r = null; try { r = fn(); } catch (e) { /* null */ } resolve(r); };
      try { win.requestAnimationFrame(go); } catch (e) { /* fall through */ }
      setTimeout(go, 500);
    });
  }

  // Flat or single-colour output means nothing was really drawn. Sparse dots on a dark
  // ground still count as drawn: it is the number of pixels off the average that matters.
  function looksBlank(src) {
    const g = src.getContext('2d');
    const d = g.getImageData(0, 0, src.width, src.height).data;
    let r = 0, gr = 0, b = 0, n = 0;
    for (let i = 0; i < d.length; i += 4) { r += d[i]; gr += d[i + 1]; b += d[i + 2]; n++; }
    r /= n; gr /= n; b /= n;
    let off = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (Math.abs(d[i] - r) + Math.abs(d[i + 1] - gr) + Math.abs(d[i + 2] - b) > 30) off++;
    }
    return off < n * 0.001;
  }

  function fitCanvas(w, h) {
    const k = Math.min(1, THUMB_W / w), c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w * k)); c.height = Math.max(1, Math.round(h * k));
    const g = c.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
    return c;
  }

  // The tool's main artwork as a canvas: its largest canvas, else its largest svg. Null if none/blank/tainted.
  async function shoot(win, doc) {
    const area = n => { const r = n.getBoundingClientRect(); return r.width * r.height; };
    const cvs = Array.prototype.filter.call(doc.querySelectorAll('canvas'), c => c.width > 16 && c.height > 16 && area(c) > 1000)
      .sort((a, b) => area(b) - area(a));
    const svgs = Array.prototype.filter.call(doc.querySelectorAll('svg'), n => area(n) > 20000)
      .sort((a, b) => area(b) - area(a));
    for (const c of cvs) {
      const out = await inFrame(win, () => {
        const o = fitCanvas(c.width, c.height);
        o.getContext('2d').drawImage(c, 0, 0, o.width, o.height);
        o.getContext('2d').getImageData(0, 0, 1, 1);        // throws if the canvas is tainted
        return o;
      });
      if (out && !looksBlank(out)) return out;
    }
    if (svgs.length) {
      const s = svgs[0], r = s.getBoundingClientRect(), clone = s.cloneNode(true);
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clone.setAttribute('width', r.width); clone.setAttribute('height', r.height);
      const xml = new win.XMLSerializer().serializeToString(clone);
      const out = await new Promise(resolve => {
        const im = new Image();
        im.onload = () => {
          try { const o = fitCanvas(r.width, r.height); o.getContext('2d').drawImage(im, 0, 0, o.width, o.height); resolve(o); }
          catch (e) { resolve(null); }
        };
        im.onerror = () => resolve(null);
        im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
      });
      if (out && !looksBlank(out)) return out;
    }
    return null;
  }

  const toBlob = c => new Promise(res => { try { c.toBlob(b => res(b), 'image/jpeg', 0.85); } catch (e) { res(null); } });

  // Load one tool in a hidden iframe and resolve with a JPEG Blob (or null).
  function captureTool(t, run) {
    return new Promise(resolve => {
      const f = document.createElement('iframe');
      f.className = 'pt-thumb-frame';
      f.setAttribute('aria-hidden', 'true');
      f.setAttribute('inert', '');
      f.tabIndex = -1;
      f.setAttribute('allow', '');
      let done = false, timer = null;
      const finish = blob => {
        if (done) return;
        done = true; clearTimeout(timer);
        f.src = 'about:blank';
        f.remove();
        resolve(blob || null);
      };
      timer = setTimeout(() => finish(null), THUMB_TIMEOUT);
      f.addEventListener('load', () => {
        let win, doc;
        try { win = f.contentWindow; doc = win.document; } catch (e) { return finish(null); }
        if (!doc || doc.location.href === 'about:blank') return;
        try { growSwatches(win, doc); } catch (e) { /* keep going with what the tool drew */ }
        const poll = async () => {
          if (done) return;
          if (run !== thumbRun) return finish(null);
          let shot = null;
          try { shot = await shoot(win, doc); } catch (e) { /* retry */ }
          if (done) return;
          if (!shot) return void setTimeout(poll, 300);
          // settle so the redraw after the colour change lands, then shoot again
          setTimeout(async () => {
            if (done) return;
            if (run !== thumbRun) return finish(null);   // brand changed: the tool may have refit to the new colours
            let again = null;
            try { again = await shoot(win, doc); } catch (e) { /* keep the first */ }
            if (run !== thumbRun) return finish(null);
            finish(await toBlob(again || shot));
          }, 700);
        };
        setTimeout(poll, 400);
      });
      document.body.appendChild(f);
      f.src = t.href;
    });
  }

  function pumpThumbs() {
    while (thumbActive < THUMB_JOBS && thumbQueue.length) {
      const run = thumbRun, sig = brandSig(), job = thumbQueue.shift(), t = job.t;
      if (!sig) { thumbQueue = []; return; }
      if (thumbUrls.has(t.slug)) continue;
      thumbActive++;
      captureTool(t, run).then(blob => {
        thumbActive--;
        if (blob) storedPut(sig, t, blob);                     // keep it even if the grid has moved on
        if (run === thumbRun) {
          if (blob) { thumbUrls.set(t.slug, URL.createObjectURL(blob)); thumbFailed.delete(t.slug); }
          else thumbFailed.add(t.slug);
          paintCard(t.slug);
          paintAll();
          if (!thumbQueue.length && !thumbActive && !thumbRetried && thumbFailed.size) {   // one more go at the failures
            thumbRetried = true;
            thumbFailed.forEach(slug => { const x = bySlug(slug); if (x) thumbQueue.push({ t: x }); });
          }
        }
        pumpThumbs();
      });
    }
  }

  // Bring the grid in line with the chosen brand: stored snapshots paint at once, the rest render in the background.
  async function applyThumbs(restart) {
    const sig = brandSig();
    if (restart) { thumbRun++; thumbQueue = []; }
    const run = thumbRun;
    if (!sig) { restoreArt(); dropThumbs(); thumbSig = ''; thumbReady = false; return; }
    if (sig !== thumbSig) { restoreArt(); dropThumbs(); thumbSig = sig; thumbReady = false; }
    if (!catalog || !visible.length) return;
    if (!restart) { paintAll(); return; }              // renderGrid rebuilt the cards
    paintAll();
    if (!thumbReady) {
      const rec = await storedLoad(sig);
      if (run !== thumbRun) return;
      catalog.forEach(t => {
        const r = rec.get(t.slug);
        if (r && r.buf && r.ver === thumbVer(t)) thumbUrls.set(t.slug, URL.createObjectURL(new Blob([r.buf], { type: r.type })));
      });
      thumbReady = true; thumbRetried = false;
      storedTouch(sig);
      paintAll();
    }
    const seen = new Set();
    visible.concat(catalog).forEach(t => {
      if (seen.has(t.slug)) return;
      seen.add(t.slug);
      if (!thumbUrls.has(t.slug) && !thumbFailed.has(t.slug)) thumbQueue.push({ t });
    });
    pumpThumbs();
  }

  /* ---------- catalog ---------- */

  function load() {
    if (!loading) {
      const tryUrl = i => fetch(CATALOG_URLS[i], { cache: 'no-cache' })
        .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(list => { if (!Array.isArray(list) || !list.length) throw new Error('empty'); return list; })
        .catch(e => { if (i + 1 < CATALOG_URLS.length) return tryUrl(i + 1); throw e; });
      loading = tryUrl(0).then(list => { catalog = list; }).catch(() => { catalog = []; });
    }
    return loading;
  }

  const bySlug = slug => (catalog || []).find(t => t.slug === slug);
  const sourceLabel = t => (t.source === 'mine' ? 'Mine' : 'Ptrn');

  /* ---------- grid ---------- */

  function buildCategories() {
    const counts = {};
    catalog.forEach(t => { counts[t.cat] = (counts[t.cat] || 0) + 1; });
    const names = Object.keys(counts).sort((a, b) => a.localeCompare(b));
    el.cat.innerHTML = '<option value="">All categories</option>' +
      names.map(n => `<option value="${escapeHtml(n)}">${escapeHtml(n)} (${counts[n]})</option>`).join('');
    el.cat.value = filters.cat;
  }

  function applyFilters() {
    const q = filters.q.trim().toLowerCase();
    visible = catalog.filter(t =>
      (filters.source === 'all' || t.source === filters.source) &&
      (!filters.cat || t.cat === filters.cat) &&
      (!q || (t.name + ' ' + t.cat + ' ' + t.desc).toLowerCase().includes(q)));
  }

  function renderGrid() {
    const total = catalog.length;
    if (!total) {
      el.count.textContent = '';
      el.bar.hidden = true; el.grid.hidden = true; el.none.hidden = true; el.missing.hidden = false;
      return;
    }
    el.missing.hidden = true; el.bar.hidden = false;
    // One source only (the public library): the Mine/Ptrn filter has nothing to filter.
    const sources = new Set(catalog.map(t => t.source));
    el.source.hidden = sources.size < 2;
    if (sources.size < 2) filters.source = 'all';
    applyFilters();
    const n = visible.length;
    el.count.textContent = n === total ? `${total} patterns` : `${n} of ${total} patterns`;
    el.none.hidden = n > 0;
    el.grid.hidden = n === 0;
    el.grid.innerHTML = visible.map(t => `
      <button type="button" class="pt-card" data-slug="${escapeHtml(t.slug)}" title="${escapeHtml(t.desc)}">
        <span class="pt-art"><img src="${escapeHtml(t.art)}" alt="" loading="lazy" decoding="async" /></span>
        <span class="pt-name">${escapeHtml(t.name)}</span>
        <span class="pt-meta">${escapeHtml(t.cat)} &middot; ${sourceLabel(t)}</span>
      </button>`).join('');
    applyThumbs(false);
  }

  function syncSourceButtons() {
    el.source.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.source === filters.source)));
  }

  function clearFilters() {
    filters.q = ''; filters.source = 'all'; filters.cat = '';
    el.search.value = ''; el.cat.value = '';
    syncSourceButtons();
    renderGrid();
  }

  /* ---------- views ---------- */

  function setView(view) {
    document.body.dataset.view = view;
    window.scrollTo(0, 0);
  }

  function leaveLogos() { if (typeof LogosHome !== 'undefined') LogosHome.hide(); }

  function showBrands() {
    leaveLogos();
    closeTool(true);
    saveMode('brands');
    setView('library');
  }

  async function showGrid() {
    leaveLogos();
    saveMode('patterns');
    setView('patterns');
    closeTool(true);
    await Promise.all([load(), refreshBrands()]);
    if (!el.cat.options.length || el.cat.options.length === 1) buildCategories();
    renderGrid();
    applyThumbs(true);
  }

  /* ---------- tool ---------- */

  function injectTheme(doc) {
    if (doc.getElementById('bd-ptrn-theme')) return Promise.resolve();
    return Promise.all(THEME_CSS.map((href, i) => new Promise(resolve => {
      const link = doc.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      if (i === THEME_CSS.length - 1) link.id = 'bd-ptrn-theme';
      link.onload = link.onerror = resolve;
      doc.head.appendChild(link);
    })));
  }

  // Esc and [ ] work whichever document has focus. Arrows stay with the tool.
  function onKey(e) {
    if (openSlug === null || e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    if (t && (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName))) return;
    if (document.body.classList.contains('has-dialog')) return;
    if (e.key === 'Escape') {
      const d = el.frame.contentDocument;
      if (d && d.querySelector('.pop:not([hidden]), .pick-menu:not([hidden]), .cpick')) return;  // the tool's own popover takes Esc
      e.preventDefault(); showGrid();
    } else if (e.key === '[') { e.preventDefault(); step(-1); }
    else if (e.key === ']') { e.preventDefault(); step(1); }
  }

  function onFrameLoad() {
    let win, doc;
    try { win = el.frame.contentWindow; doc = win.document; } catch (e) { return; }
    if (!openSlug || !doc || doc.location.href === 'about:blank') return;
    if (isHomePath(win.location.pathname)) { showGrid(); return; }   // the tool linked home: back to our grid
    doc.addEventListener('keydown', onKey);
    try { growSwatches(win, doc); } catch (e) { /* the tool still opens with its own swatches */ }
    injectTheme(doc).then(() => el.frame.classList.add('is-ready'));
  }

  function openTool(slug) {
    const t = bySlug(slug);
    if (!t) return false;
    openSlug = slug;
    el.name.textContent = t.name;
    el.toolCat.textContent = `${t.cat} · ${sourceLabel(t)}`;
    el.section.dataset.tool = 'open';
    el.tool.hidden = false;
    $('ptHome').hidden = true;
    $('ptTop').hidden = true;
    el.frame.classList.remove('is-ready');
    el.frame.src = t.href;
    setHash(slug);
    setTimeout(() => el.frame.classList.add('is-ready'), 1500);   // never leave the frame blank if a stylesheet stalls
    el.back.focus({ preventScroll: true });
    return true;
  }

  function closeTool(quiet) {
    if (openSlug === null && el.tool.hidden) return;
    openSlug = null;
    el.tool.hidden = true;
    delete el.section.dataset.tool;
    $('ptHome').hidden = false;
    $('ptTop').hidden = false;
    el.frame.removeAttribute('src');
    el.frame.src = 'about:blank';
    setHash(null);
  }

  function step(dir) {
    const list = visible.length && visible.some(t => t.slug === openSlug) ? visible : catalog;
    if (!list || !list.length) return;
    const i = list.findIndex(t => t.slug === openSlug);
    openTool(list[(i + dir + list.length) % list.length].slug);
  }

  function surprise() {
    const list = visible.filter(t => t.slug !== openSlug);
    if (list.length) openTool(list[Math.floor(Math.random() * list.length)].slug);
  }

  /* ---------- launch ---------- */

  // Called once the Library has finished starting (js/library-ui.js), because that
  // sets data-view itself. A pinned tool in the URL wins, then the remembered mode.
  async function start() {
    const slug = hashSlug();
    if (slug) {
      await showGrid();
      if (!openTool(slug)) setHash(null);
    } else if (readMode() === 'patterns') {
      await showGrid();
    }
  }

  function wire() {
    document.querySelectorAll('.mode-switch button').forEach(b => b.addEventListener('click', () => {
      if (b.dataset.mode === 'patterns') showGrid();
      else if (b.dataset.mode === 'logos') { closeTool(true); if (typeof LogosHome !== 'undefined') LogosHome.show(); }
      else showBrands();
    }));
    el.search.addEventListener('input', () => { filters.q = el.search.value; renderGrid(); });
    el.source.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      filters.source = b.dataset.source;
      syncSourceButtons();
      renderGrid();
    });
    el.cat.addEventListener('change', () => { filters.cat = el.cat.value; renderGrid(); });
    el.brand.addEventListener('change', () => chooseBrand(el.brand.value));
    el.toolBrand.addEventListener('change', () => chooseBrand(el.toolBrand.value));
    el.surprise.addEventListener('click', surprise);
    el.clear.addEventListener('click', clearFilters);
    el.grid.addEventListener('click', e => {
      const card = e.target.closest('.pt-card');
      if (card) openTool(card.dataset.slug);
    });
    el.back.addEventListener('click', showGrid);
    el.prev.addEventListener('click', () => step(-1));
    el.next.addEventListener('click', () => step(1));
    el.frame.addEventListener('load', onFrameLoad);
    document.addEventListener('keydown', onKey);
  }

  wire();
  // Avoid a flash of the Library when a Patterns launch is coming.
  if (hashSlug() || readMode() === 'patterns') document.body.dataset.view = 'patterns';

  return { start, showGrid, showBrands };
})();
