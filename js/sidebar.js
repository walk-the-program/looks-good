/* ---------------------------------------------------------------------
   sidebar.js — the editor sidebar's tabs (css/sidebar.css, index.html).

   A vertical rail of tabs (Brand, Style, Type, Color, Logo,
   Export) shows one settings panel at a time. The last open tab is
   remembered per viewer. Under 900px the rail is a tab bar and the panel
   opens and closes from it.

   It also draws the Style panel's preview of the current style and the
   logo drop zone.

   Every control in the panels keeps the id app.js and the feature
   modules bind to; nothing here re-implements their behaviour.

   window.SidebarUI = { select(tab), current(), syncStyle() }
------------------------------------------------------------------------ */

(function () {
  const TAB_STORE = 'bd.sidebarTab';
  const TABS = ['brand', 'style', 'type', 'color', 'logo', 'export'];
  const BOARD_W = 900;                       // design width the preview board is drawn at
  const $ = id => document.getElementById(id);
  const narrowMq = window.matchMedia ? window.matchMedia('(max-width: 900px)') : { matches: false };

  let current = 'brand';
  let styleDirty = true;
  let styleTimer = 0;

  /* ---------------- tabs ---------------- */

  const tabEls = () => Array.from(document.querySelectorAll('#sdRail [role="tab"]'));
  const panelFor = tab => document.querySelector(`.sd-panel[data-tab="${tab}"]`);

  function stored() {
    try { const v = localStorage.getItem(TAB_STORE); return TABS.includes(v) ? v : null; } catch (e) { return null; }
  }
  function store(tab) {
    try { localStorage.setItem(TAB_STORE, tab); } catch (e) { /* this session only */ }
  }

  function setOpen(open) {
    const shell = $('sdShell');
    if (shell) shell.classList.toggle('is-open', !!open);
  }

  // Shows `tab`'s panel. opts.focus moves focus to the tab (keyboard); opts.keep skips storing.
  function select(tab, opts = {}) {
    if (!TABS.includes(tab)) return;
    current = tab;
    tabEls().forEach(t => {
      const on = t.dataset.tab === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on && opts.focus) t.focus();
    });
    document.querySelectorAll('.sd-panel').forEach(p => { p.hidden = p.dataset.tab !== tab; });
    const panels = $('sdPanels');
    if (panels && !opts.keepScroll) panels.scrollTop = 0;
    if (!opts.keep) store(tab);
    if (tab === 'style') syncStyle(true);
  }

  function wireTabs() {
    const rail = $('sdRail');
    if (!rail) return;
    rail.addEventListener('click', e => {
      const t = e.target.closest('[role="tab"]');
      if (!t) return;
      // On a narrow window the bar opens and closes the panel; a second tap closes it.
      if (narrowMq.matches) {
        const shell = $('sdShell');
        const wasOpen = shell && shell.classList.contains('is-open');
        if (wasOpen && t.dataset.tab === current) { setOpen(false); return; }
        setOpen(true);
        select(t.dataset.tab);
        return;
      }
      select(t.dataset.tab);
    });
    rail.addEventListener('keydown', e => {
      const tabs = tabEls();
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      const vertical = !narrowMq.matches;
      const prev = vertical ? 'ArrowUp' : 'ArrowLeft';
      const next = vertical ? 'ArrowDown' : 'ArrowRight';
      let n = -1;
      if (e.key === prev) n = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === next) n = (i + 1) % tabs.length;
      else if (e.key === 'Home') n = 0;
      else if (e.key === 'End') n = tabs.length - 1;
      if (n < 0) return;
      e.preventDefault();
      if (narrowMq.matches) setOpen(true);
      select(tabs[n].dataset.tab, { focus: true });
    });
    const onMq = () => {
      rail.setAttribute('aria-orientation', narrowMq.matches ? 'horizontal' : 'vertical');
      if (!narrowMq.matches) setOpen(true);
    };
    if (narrowMq.addEventListener) narrowMq.addEventListener('change', onMq);
    onMq();
    if (narrowMq.matches) setOpen(false);
  }

  /* ---------------- Style panel: the current style ---------------- */

  // The top of the current board (header and hero), shrunk into the card.
  function drawStylePreview() {
    const box = $('sdStyleBoard');
    const shot = $('sdStyleShot');
    if (!box || !shot || typeof boardHtml !== 'function') return;
    const v = typeof abView === 'function' ? abView() : { state, def: resolveAestheticDef(state) };
    if (typeof setBoardFonts === 'function') setBoardFonts(box);
    const tpl = document.createElement('template');
    tpl.innerHTML = boardHtml(v.state, v.def);
    const inner = tpl.content.querySelector('.ab-in');
    if (inner) {
      let blocks = 0;
      Array.from(inner.children).forEach(el => {
        const chrome = el.classList.contains('ab-head') || el.classList.contains('ab-rule');
        if (blocks >= 2) el.remove(); else if (!chrome) blocks++;
      });
    }
    box.replaceChildren(tpl.content);
    if (v.def.blend && box.firstElementChild) {
      if (typeof blendClearArtText === 'function') blendClearArtText(box.firstElementChild);
      if (typeof blendLegibility === 'function') blendLegibility(box.firstElementChild);
    }
    fitStylePreview();
    styleDirty = false;
  }

  function fitStylePreview() {
    const shot = $('sdStyleShot');
    if (!shot || !shot.clientWidth) return;
    shot.style.setProperty('--sd-zoom', (shot.clientWidth / BOARD_W).toFixed(4));
  }

  // Called by syncAestheticChrome (js/aesthetic-board.js) after every board render.
  function syncStyle(now) {
    if (typeof state === 'undefined' || typeof aestheticByKey !== 'function') return;
    const def = aestheticByKey(state.aesthetic);
    const view = typeof abView === 'function' ? abView().def : def;
    const num = $('sdStyleNum');
    if (num) num.textContent = typeof aestheticNumber === 'function' ? aestheticNumber(def.key) : '';
    const name = $('sdStyleName');
    if (name) name.textContent = def.name + (state.aestheticVersion === 'classic' && typeof hasClassicAesthetic === 'function' && hasClassicAesthetic(def.key) ? ' (classic)' : '');
    const desc = $('sdStyleDesc');
    if (desc) {
      const donor = view.blend && typeof aestheticByKey === 'function' && state.blend ? aestheticByKey(state.blend.with) : null;
      desc.innerHTML = `<b>${escapeHtml(def.descriptor)}</b><span>${escapeHtml(def.summary || '')}</span>`
        + (donor ? ` <span>Mixed with ${escapeHtml(donor.name)}.</span>` : '');
    }
    const shot = $('sdStyleShot');
    if (shot) shot.setAttribute('aria-label', `Change style. Now ${def.name}`);
    // The family filter chosen in the gallery also narrows the arrows and shuffle.
    const note = $('sdFamilyNote');
    if (note) {
      const fam = typeof aeFamily !== 'undefined' ? aeFamily : 'all';
      note.hidden = fam === 'all';
      if (fam !== 'all' && typeof aestheticFamilyLabel === 'function') {
        note.innerHTML = `Shuffle and the arrows use ${escapeHtml(aestheticFamilyLabel(fam))} styles only. <button type="button" data-sb="all-styles">Use all styles</button>`;
      }
    }
    styleDirty = true;
    if (current !== 'style' || (narrowMq.matches && !$('sdShell').classList.contains('is-open'))) return;
    clearTimeout(styleTimer);
    if (now) drawStylePreview();
    else styleTimer = setTimeout(drawStylePreview, 140);   // typing in a field re-renders per key
  }

  /* ---------------- Logo drop zone ---------------- */

  function wireLogoDrop() {
    const zone = $('sdLogoDrop');
    const input = $('logoInput');
    if (!zone || !input) return;
    const over = on => zone.classList.toggle('is-over', on);
    zone.addEventListener('dragover', e => { e.preventDefault(); e.stopPropagation(); over(true); });
    zone.addEventListener('dragleave', () => over(false));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      e.stopPropagation();
      over(false);
      const files = e.dataTransfer && e.dataTransfer.files;
      if (!files || !files.length || !/^image\//.test(files[0].type)) return;
      try { input.files = files; } catch (err) { return; }
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  /* ---------------- init ---------------- */

  function init() {
    if (!$('sdRail')) return;
    wireTabs();
    select(stored() || 'brand', { keep: true });
    wireLogoDrop();

    const open = from => { if (window.StyleGallery) StyleGallery.open(from); };
    ['openStyleGallery', 'sdStyleShot'].forEach(id => {
      const b = $(id);
      if (b) b.addEventListener('click', () => open(b));
    });
    const note = $('sdFamilyNote');
    if (note) note.addEventListener('click', e => {
      if (e.target.closest('[data-sb="all-styles"]') && typeof setAeFamily === 'function') setAeFamily('all');
    });

    const shot = $('sdStyleShot');
    if (shot && window.ResizeObserver) new ResizeObserver(fitStylePreview).observe(shot);
    syncStyle(true);
  }

  window.SidebarUI = { select, current: () => current, syncStyle };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
