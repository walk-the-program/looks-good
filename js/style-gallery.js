/* ---------------------------------------------------------------------
   style-gallery.js — "Choose a style": every style drawn with this brand
   (index.html #styleGallery, css/style-gallery.css).

   Opened by "Change style" and the preview in the sidebar's Style panel,
   and by the style name in the workspace header. The tiles (#aeList) and
   the family chips (#aeFamilies) are built by js/aesthetic-board.js; a
   tile click goes through its chooseAesthetic() (one undo step) and the
   gallery then closes.

   Each tile holds the real board at a 900px design width, cut to its top
   two blocks and scaled down with a transform (CSS zoom trips WebKit's
   minimum font size). Boards are drawn only while the gallery is open,
   as their tiles come near the screen, a few per frame.

   Keys: arrows move between tiles, Enter or Space chooses, / searches,
   Esc closes. Showcase mode and the numbering follow aePool() and
   aestheticNumber(), like the rest of the app.

   window.StyleGallery = { open(opener?), close(), isOpen(), listBuilt() }
------------------------------------------------------------------------ */

(function () {
  const BOARD_W = 900;
  const $ = id => document.getElementById(id);

  let isOpen = false;
  let opener = null;
  let addedDialogClass = false;
  let io = null;
  let queue = [];
  let pumping = false;
  let filledSig = '';

  const grid = () => $('aeList');
  const tiles = () => Array.from(grid() ? grid().querySelectorAll('.gal-tile') : []);
  const shown = () => tiles().filter(t => !t.hidden);

  /* ---------------- drawing ---------------- */

  // What every tile depends on except the style itself: when it changes, the boards are redrawn.
  function brandSig() {
    try {
      const s = typeof serializeState === 'function' ? serializeState(state) : {};
      return JSON.stringify(Object.assign({}, s, { aesthetic: null, aestheticVersion: null, blend: null, bgMode: null }));
    } catch (e) { return String(Math.random()); }
  }

  function boardFor(key) {
    let st, def;
    if (key === state.aesthetic) {
      const v = typeof abView === 'function' ? abView() : { state, def: resolveAestheticDef(state) };
      st = v.state; def = v.def;
    } else {
      def = aestheticByKey(key);
      st = Object.assign({}, state, { bgMode: def.mode || state.bgMode });
    }
    const tpl = document.createElement('template');
    tpl.innerHTML = boardHtml(st, def);
    // Only the top of a board shows in a tile: drop everything below its first two blocks.
    const inner = tpl.content.querySelector('.ab-in');
    if (inner) {
      let blocks = 0;
      Array.from(inner.children).forEach(el => {
        const chrome = el.classList.contains('ab-head') || el.classList.contains('ab-rule');
        if (blocks >= 2) el.remove(); else if (!chrome) blocks++;
      });
    }
    return { frag: tpl.content, blend: !!def.blend };
  }

  function fill(tile) {
    const box = tile.querySelector('.gal-board');
    if (!box) return;
    if (typeof setBoardFonts === 'function') setBoardFonts(box);
    const b = boardFor(tile.dataset.key);
    box.replaceChildren(b.frag);
    if (b.blend && box.firstElementChild) {
      if (typeof blendClearArtText === 'function') blendClearArtText(box.firstElementChild);
      if (typeof blendLegibility === 'function') blendLegibility(box.firstElementChild);
    }
    tile.dataset.filled = '1';
    tile.classList.add('is-filled');
  }

  function pump() {
    if (pumping) return;
    pumping = true;
    const step = () => {
      if (!isOpen) { pumping = false; queue = []; return; }
      const t0 = performance.now();
      do {
        const t = queue.shift();
        if (!t) { pumping = false; return; }
        if (t.isConnected && !t.dataset.filled && !t.hidden) fill(t);
      } while (performance.now() - t0 < 12);
      setTimeout(step, 0);
    };
    setTimeout(step, 0);
  }

  function observe() {
    if (io) io.disconnect();
    const root = $('galScroll');
    if (!('IntersectionObserver' in window)) {
      queue = shown().filter(t => !t.dataset.filled);
      pump();
      return;
    }
    io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting && !en.target.dataset.filled) { queue.push(en.target); io.unobserve(en.target); }
      });
      // Nearest the top first, so the screen fills in reading order.
      queue.sort((a, b) => a.offsetTop - b.offsetTop || a.offsetLeft - b.offsetLeft);
      pump();
    }, { root, rootMargin: '300px 0px' });
    tiles().forEach(t => { if (!t.dataset.filled) io.observe(t); });
  }

  function fit() {
    const g = grid();
    const f = g && g.querySelector('.gal-tile:not([hidden]) .gal-frame');
    if (!f || !f.clientWidth) return;
    g.style.setProperty('--gal-zoom', (f.clientWidth / BOARD_W).toFixed(4));
  }

  // Boards drawn for an earlier version of the brand (or the previous current style) go stale.
  function refreshStale() {
    const sig = brandSig();
    const all = tiles();
    all.forEach(t => {
      const stale = sig !== filledSig || t.dataset.drawnCurrent === '1' || t.dataset.key === state.aesthetic;
      if (t.dataset.filled && stale) {
        delete t.dataset.filled;
        t.classList.remove('is-filled');
        const box = t.querySelector('.gal-board');
        if (box) box.replaceChildren();
      }
      t.dataset.drawnCurrent = t.dataset.key === state.aesthetic ? '1' : '';
    });
    filledSig = sig;
  }

  /* ---------------- search, header, current ---------------- */

  function applySearch() {
    const q = ($('galSearch').value || '').trim().toLowerCase();
    const words = q.split(/\s+/).filter(Boolean);
    let n = 0;
    tiles().forEach(t => {
      const hay = t.dataset.search || '';
      const hit = !words.length || words.every(w => hay.includes(w));
      t.hidden = !hit;
      if (hit) n++;
    });
    $('galEmpty').hidden = n > 0;
    syncSub(n);
    rovingTo(currentOrFirst(), false);
    if (isOpen) { fit(); observe(); }
  }

  function syncSub(n) {
    const sub = $('galSub');
    if (!sub) return;
    const brand = typeof effectiveContent === 'function' ? effectiveContent().brandName : '';
    const pool = typeof aePool === 'function' ? aePool().length : tiles().length;
    const listed = tiles().length;
    const fam = typeof aeFamily !== 'undefined' && aeFamily !== 'all' && typeof aestheticFamilyLabel === 'function' ? aestheticFamilyLabel(aeFamily) : '';
    const count = n === listed ? `${n} styles` : `${n} of ${listed} styles`;
    sub.textContent = fam
      ? `${brand} in ${count}, ${fam} only (${pool} in all). Pick one to use it.`
      : `${brand} in ${count}. Pick one to use it.`;
  }

  function markCurrent() {
    tiles().forEach(t => {
      const on = t.dataset.key === state.aesthetic;
      t.classList.toggle('is-current', on);
      t.setAttribute('aria-pressed', String(on));
    });
  }

  function currentOrFirst() {
    const vis = shown();
    return vis.find(t => t.dataset.key === state.aesthetic) || vis[0] || null;
  }

  function rovingTo(tile, focus) {
    tiles().forEach(t => { t.tabIndex = t === tile ? 0 : -1; });
    if (tile && focus) {
      tile.focus({ preventScroll: true });
      tile.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }

  /* ---------------- open / close ---------------- */

  function open(from) {
    const ov = $('styleGallery');
    if (!ov || isOpen || document.body.dataset.view !== 'editor') return;
    isOpen = true;
    opener = from || document.activeElement;
    ov.hidden = false;
    document.body.classList.add('gal-open');
    if (!document.body.classList.contains('has-dialog')) { document.body.classList.add('has-dialog'); addedDialogClass = true; }
    const nameBtn = $('aeNameBtn');
    if (nameBtn) nameBtn.setAttribute('aria-expanded', 'true');
    markCurrent();
    refreshStale();
    applySearch();
    requestAnimationFrame(() => {
      fit();
      const cur = currentOrFirst();
      if (cur) {
        const sc = $('galScroll');
        // Bring the current style into view (centred) before the first boards are drawn.
        sc.scrollTop = Math.max(0, cur.offsetTop - (sc.clientHeight - cur.offsetHeight) / 2);
        rovingTo(cur, true);
      } else $('galSearch').focus();
      observe();
    });
    document.addEventListener('keydown', onKey, true);
  }

  function close() {
    const ov = $('styleGallery');
    if (!ov || !isOpen) return;
    isOpen = false;
    ov.hidden = true;
    if (io) io.disconnect();
    queue = [];
    document.body.classList.remove('gal-open');
    if (addedDialogClass) { document.body.classList.remove('has-dialog'); addedDialogClass = false; }
    const nameBtn = $('aeNameBtn');
    if (nameBtn) nameBtn.setAttribute('aria-expanded', 'false');
    document.removeEventListener('keydown', onKey, true);
    if (opener && opener.isConnected && opener.focus) opener.focus({ preventScroll: true });
    opener = null;
  }

  // A tile was chosen: aesthetic-board.js's #aeList listener has already applied it.
  function choose(tile) {
    if (!tile) return;
    if (tile.dataset.key !== state.aesthetic && typeof chooseAesthetic === 'function') chooseAesthetic(tile.dataset.key);
    close();
  }

  /* ---------------- keys ---------------- */

  function columns(vis) {
    if (!vis.length) return 1;
    const top = vis[0].offsetTop;
    let c = 0;
    while (c < vis.length && vis[c].offsetTop === top) c++;
    return Math.max(1, c);
  }

  function onKey(e) {
    if (!isOpen) return;
    const ov = $('styleGallery');
    const search = $('galSearch');
    const inSearch = e.target === search;
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      if (inSearch && search.value) { search.value = ''; applySearch(); return; }
      close();
      return;
    }
    if (e.key === 'Tab') {                         // keep focus inside the sheet
      const f = Array.from(ov.querySelectorAll('input, button, [tabindex="0"]'))
        .filter(el => !el.disabled && el.offsetParent !== null && !el.closest('[inert]'));
      if (!f.length) return;
      const i = f.indexOf(document.activeElement);
      const n = f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length];
      e.preventDefault();
      n.focus();
      return;
    }
    if (inSearch) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        const first = shown()[0];
        if (!first) return;
        e.preventDefault();
        if (e.key === 'Enter') choose(first);
        else rovingTo(first, true);
      }
      e.stopPropagation();                         // Space and letters are typing here
      return;
    }
    if (e.key === '/' && !e.metaKey && !e.ctrlKey) { e.preventDefault(); search.focus(); search.select(); return; }
    const tile = e.target.closest && e.target.closest('.gal-tile');
    if (!tile) {
      if (e.code === 'Space' && !(e.target.closest && e.target.closest('button, input'))) { e.preventDefault(); e.stopPropagation(); }
      return;
    }
    if (e.key === 'Enter' || e.code === 'Space') {
      e.preventDefault();
      e.stopPropagation();                         // Space is also the global shuffle shortcut
      choose(tile);
      return;
    }
    const vis = shown();
    const i = vis.indexOf(tile);
    const cols = columns(vis);
    const d = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -cols, ArrowDown: cols, Home: -i, End: vis.length - 1 - i }[e.key];
    if (d === undefined) return;
    e.preventDefault();
    const n = vis[Math.max(0, Math.min(vis.length - 1, i + d))];
    if (n) rovingTo(n, true);
  }

  /* ---------------- wiring ---------------- */

  // aesthetic-board.js rebuilt the tiles (family filter, showcase mode).
  function listBuilt() {
    if (!grid() || !$('galSearch')) return;
    markCurrent();
    applySearch();
    if (isOpen) requestAnimationFrame(() => { fit(); observe(); });
  }

  function init() {
    const ov = $('styleGallery');
    if (!ov) return;
    $('galClose').addEventListener('click', close);
    $('galSearch').addEventListener('input', applySearch);
    // Click outside the sheet closes; a tile click chooses (after #aeList's own listener applied it).
    ov.addEventListener('click', e => {
      if (e.target === ov) { close(); return; }
      const tile = e.target.closest('.gal-tile');
      if (tile) close();
    });
    ov.addEventListener('focusin', e => {
      const t = e.target.closest && e.target.closest('.gal-tile');
      if (t) rovingTo(t, false);
    });
    const nameBtn = $('aeNameBtn');
    if (nameBtn) nameBtn.addEventListener('click', () => open(nameBtn));
    if (window.ResizeObserver) new ResizeObserver(() => { if (isOpen) fit(); }).observe(grid());
    listBuilt();
  }

  window.StyleGallery = { open, close, isOpen: () => isOpen, listBuilt };
  window.Show = window.Show || {};
  window.Show.styles = open;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
