/* ---------------------------------------------------------------------
   patterns-home.js — Patterns mode: the Brands | Patterns switch, the
   pattern grid, and the tool view (an iframe of a page under ptrn/, the
   private Ptrn mirror that dev/sync-ptrn.py builds).

   Views: body[data-view="patterns"]. The grid and the open tool live in the
   same section; the open tool is remembered in the URL hash (#pattern=slug)
   and the last home mode in localStorage, so a launch lands where you left.
------------------------------------------------------------------------ */

const PatternsHome = (function () {
  const MODE_KEY = 'bd.homeMode';
  const CATALOG_URL = 'ptrn/catalog.json';
  const THEME_CSS = ['/fonts/fonts.css', '/css/ptrn-theme.css'];
  const HOME_PATHS = ['/ptrn/', '/ptrn/index.html'];

  const $ = id => document.getElementById(id);
  const el = {
    section: $('patterns'), count: $('ptCount'), bar: $('ptBar'), search: $('ptSearch'),
    source: $('ptSource'), cat: $('ptCat'), surprise: $('ptSurprise'), grid: $('ptGrid'),
    missing: $('ptMissing'), none: $('ptNone'), clear: $('ptClear'),
    tool: $('ptTool'), frame: $('ptFrame'), name: $('ptToolName'), toolCat: $('ptToolCat'),
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

  /* ---------- catalog ---------- */

  function load() {
    if (!loading) {
      loading = fetch(CATALOG_URL, { cache: 'no-cache' })
        .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(list => { catalog = Array.isArray(list) ? list : []; })
        .catch(() => { catalog = []; });
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

  function showBrands() {
    closeTool(true);
    saveMode('brands');
    setView('library');
  }

  async function showGrid() {
    saveMode('patterns');
    setView('patterns');
    closeTool(true);
    await load();
    if (!el.cat.options.length || el.cat.options.length === 1) buildCategories();
    renderGrid();
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
    if (HOME_PATHS.includes(win.location.pathname)) { showGrid(); return; }   // the tool linked home: back to our grid
    doc.addEventListener('keydown', onKey);
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
      if (b.dataset.mode === 'patterns') showGrid(); else showBrands();
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
