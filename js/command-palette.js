/* ---------------------------------------------------------------------
   command-palette.js — Cmd+K / Ctrl+K: every action in the app, by name.

   One search box over a list of actions: switch view, switch style by name,
   shuffle, undo, copy the brief, export the deck, present, light or dark,
   open the library, start a new brand, every Share item and every Show item.
   Plain fuzzy matching, no network, nothing sent anywhere.

   Also the number keys: 1 Board, 2 Patterns, 3 Deck, 4 Brief, when the focus
   is not in a text field and nothing else owns the keyboard (a dialog, the
   presenter view, present mode, the demo loop).

   The list is rebuilt each time the palette opens, so it follows the current
   styles, the open brand and the toolbar menus. Needs app.js, aesthetic-board.js
   and the toolbar menus in index.html (their items are listed by reading them).
   Plain script.
------------------------------------------------------------------------ */

(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const isEditor = () => document.body.dataset.view === 'editor';
  const isMac = () => document.documentElement.classList.contains('is-mac-app') || /Mac|iPhone|iPad/i.test(navigator.platform || '');
  const clean = s => String(s || '').replace(/\s+/g, ' ').trim();
  const visible = el => !!el && el.getClientRects().length > 0;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  async function until(test, ms) {
    const t0 = Date.now();
    while (!test() && Date.now() - t0 < ms) await wait(60);
    return !!test();
  }

  let root = null, input = null, listEl = null, statusEl = null;
  let all = [], shown = [], active = 0;
  let isOpen = false, opener = null;

  /* ---------------- the actions ---------------- */

  function click(id) { const el = $(id); if (el) el.click(); }

  // The text of a toolbar menu item without its small line or key hint.
  function itemLabel(btn) {
    const span = btn.querySelector('span');
    if (!span) return clean(btn.textContent);
    const c = span.cloneNode(true);
    c.querySelectorAll('small, kbd').forEach(n => n.remove());
    return clean(c.textContent);
  }

  async function exportDeck(buttonId) {
    if (typeof setWorkView === 'function') setWorkView('deck');
    if (!await until(() => document.querySelector('#deckGrid .deck-card'), 4000)) return;
    await wait(250);
    click(buttonId);
  }

  function collect() {
    const out = [];
    const add = (group, label, run, extra) => out.push(Object.assign({ group, label, run, keys: '' }, extra));
    const ed = isEditor();

    if (ed) {
      add('View', 'Go to Board', () => setWorkView('board'), { hint: '1', keys: 'ui design language' });
      add('View', 'Go to Patterns', () => setWorkView('patterns'), { hint: '2' });
      add('View', 'Go to Deck', () => setWorkView('deck'), { hint: '3', keys: 'slides' });
      add('View', 'Go to Brief', () => setWorkView('brief'), { hint: '4', keys: 'ai' });
      add('View', 'Board: UI', () => setBoardView('board'), { keys: 'board mode' });
      add('View', 'Board: Built on product screens', () => setBoardView('built'), { keys: 'built mode see it built' });
      add('View', 'Board: Compare every style', () => setBoardView('compare'), { keys: 'compare mode worlds' });

      if (typeof aePool === 'function' && typeof state !== 'undefined') {
        aePool().forEach(def => {
          add('Style', 'Style: ' + def.name, () => chooseAesthetic(def.key), {
            keys: 'switch aesthetic style look ' + (def.descriptor || ''),
            current: def.key === state.aesthetic,
          });
        });
      }
      add('Style', 'Next style', () => stepAesthetic(1), { keys: 'aesthetic forward' });
      add('Style', 'Previous style', () => stepAesthetic(-1), { keys: 'aesthetic back' });
      add('Style', 'Choose a style from the gallery', () => click('aeNameBtn'), { keys: 'aesthetic browse open' });

      add('Shuffle', 'Shuffle everything', () => click('shuffleAll'), { hint: 'Space', keys: 'random' });
      add('Shuffle', 'Shuffle style', () => click('shuffleAesthetic'), { keys: 'aesthetic random' });
      add('Shuffle', 'Shuffle fonts', () => click('shuffleFonts'), { keys: 'type random' });
      add('Shuffle', 'Shuffle colours', () => click('shuffleColors'), { keys: 'colors palette random' });
      const undo = $('undoShuffle');
      add('Shuffle', 'Undo', () => click('undoShuffle'), { keys: 'back last change', off: !undo || undo.disabled });

      add('Brief', 'Copy AI brief', () => click('copyAiBrief'), { keys: 'markdown claude cursor' });
      add('Brief', 'View the brief as a page', () => { if (window.Show && typeof Show.brief === 'function') Show.brief(); }, { keys: 'designed' });
      add('Brief', 'Copy brand as CSS', () => click('exportCss'), { keys: 'variables tokens' });
      add('Brief', 'Open brand guide', () => click('openBrandGuide'), { keys: 'export html pdf' });

      add('Deck', 'Download deck as PDF', () => exportDeck('downloadDeckPdf'), { keys: 'export slides' });
      add('Deck', 'Download every slide as PNG', () => exportDeck('downloadAllSlides'), { keys: 'export slides pictures images' });

      const dark = state.bgMode === 'dark';
      add('Brand', dark ? 'Switch to a light background' : 'Switch to a dark background', () => {
        const r = document.querySelector('input[name="bgMode"][value="' + (dark ? 'light' : 'dark') + '"]');
        if (r) r.click();
      }, { keys: 'light dark mode theme' });
      add('Brand', 'Save brand', () => window.BD && BD.menu('save'), { keys: 'keep' });
      add('Brand', 'Save as a new brand', () => click('saveAsNewBrand'), { keys: 'copy duplicate' });
      add('Brand', 'Open the library', () => window.BD && BD.menu('library'), { keys: 'brands home back' });

      document.querySelectorAll('#sdRail .sd-tab').forEach(tab => {
        if (!visible(tab)) return;
        const name = clean((tab.querySelector('span') || tab).textContent);
        if (name) add('Panel', 'Open the ' + name + ' panel', () => tab.click(), { keys: 'sidebar settings' });
      });

      document.querySelectorAll('#showMenu [data-show]').forEach(btn => {
        const k = btn.querySelector('kbd');
        add('Show', itemLabel(btn), () => btn.click(), { hint: k ? clean(k.textContent) : '', keys: 'show present play' });
      });
      let group = '';
      document.querySelectorAll('#shareMenu > *').forEach(n => {
        if (n.classList.contains('share-group')) { group = clean(n.textContent).split(',')[0]; return; }
        if (n.tagName !== 'BUTTON') return;
        const name = itemLabel(n);
        const label = n.id === 'exportPalettePng' ? name : (group ? group + ': ' + name : name);
        add('Share', label, () => n.click(), { keys: 'export save download share' });
      });
    }

    add('App', 'New brand', () => window.BD && BD.menu('new'), { keys: 'create start' });
    if (typeof toggleShowcase === 'function') {
      const on = typeof isShowcase === 'function' && isShowcase();
      add('App', on ? 'Turn Showcase mode off' : 'Turn Showcase mode on', () => toggleShowcase(), { keys: 'favourites favorites narrow' });
    }
    return out.filter(a => !a.off);
  }

  /* ---------------- matching ---------------- */

  function subsequence(hay, needle) {
    let i = 0;
    for (const ch of hay) if (ch === needle[i] && ++i === needle.length) return true;
    return false;
  }

  // -1 when a word of the query is nowhere in the action; higher is a better match.
  function score(a, q) {
    const label = a.label.toLowerCase();
    const rest = (a.group + ' ' + a.keys).toLowerCase();
    let total = 0;
    for (const t of q.toLowerCase().split(/\s+/).filter(Boolean)) {
      let s;
      const lit = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const whole = new RegExp('(^|[\\s:/-])' + lit + '($|[\\s:/-])').test(label);
      if (label.startsWith(t)) s = whole ? 110 : 100;
      else if (new RegExp('(^|[\\s:/-])' + lit).test(label)) s = whole ? 90 : 80;
      else if (label.includes(t)) s = 60;
      else if (rest.includes(t)) s = 40;
      else if (t.length > 1 && subsequence(label, t)) s = 20;
      else return -1;
      total += s;
    }
    return total - label.length * 0.01;
  }

  function filter(q) {
    q = q.trim();
    if (!q) return all.slice();
    return all.map((a, i) => ({ a, s: score(a, q), i })).filter(x => x.s >= 0)
      .sort((x, y) => y.s - x.s || x.i - y.i).map(x => x.a);
  }

  /* ---------------- the dialog ---------------- */

  function ensureDom() {
    if (root) return;
    root = document.createElement('div');
    root.className = 'cp-overlay';
    root.hidden = true;
    root.innerHTML = `
      <div class="cp-box" role="dialog" aria-modal="true" aria-label="Command palette">
        <div class="cp-field">
          <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input type="text" class="cp-input" id="cpInput" role="combobox" aria-expanded="true" aria-controls="cpList" aria-autocomplete="list" aria-label="Search commands" placeholder="Type a command, or a style name" autocomplete="off" spellcheck="false" />
          <kbd class="cp-esc" aria-hidden="true">esc</kbd>
        </div>
        <ul class="cp-list" id="cpList" role="listbox" aria-label="Commands"></ul>
        <p class="cp-empty" id="cpEmpty" hidden>Nothing matches.</p>
        <div class="cp-status" id="cpStatus" role="status" aria-live="polite"></div>
        <p class="cp-foot" aria-hidden="true"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>↵</kbd> run</span><span><kbd>esc</kbd> close</span></p>
      </div>`;
    document.body.appendChild(root);
    input = root.querySelector('#cpInput');
    listEl = root.querySelector('#cpList');
    statusEl = root.querySelector('#cpStatus');

    input.addEventListener('input', () => { active = 0; draw(); });
    input.addEventListener('keydown', onInputKey);
    listEl.addEventListener('click', e => {
      const li = e.target.closest('[role="option"]');
      if (li) run(Number(li.dataset.i));
    });
    listEl.addEventListener('mousemove', e => {
      const li = e.target.closest('[role="option"]');
      if (li && Number(li.dataset.i) !== active) setActive(Number(li.dataset.i), false);
    });
    root.addEventListener('mousedown', e => { if (e.target === root) close(true); });
    // Focus stays in the box: Tab does not leave it.
    root.addEventListener('keydown', e => { if (e.key === 'Tab') { e.preventDefault(); input.focus(); } });
  }

  function draw() {
    shown = filter(input.value);
    if (active >= shown.length) active = Math.max(0, shown.length - 1);
    let lastGroup = null;
    listEl.innerHTML = shown.map((a, i) => {
      const head = a.group !== lastGroup && !input.value.trim() ? `<li class="cp-group" role="presentation">${esc(a.group)}</li>` : '';
      lastGroup = a.group;
      return head + `<li role="option" id="cpOpt${i}" data-i="${i}" aria-selected="${i === active}" class="cp-item${i === active ? ' is-active' : ''}">`
        + `<span class="cp-label">${esc(a.label)}${a.current ? ' <em>current</em>' : ''}</span>`
        + (input.value.trim() ? `<span class="cp-tag">${esc(a.group)}</span>` : '')
        + (a.hint ? `<kbd>${esc(a.hint)}</kbd>` : '')
        + '</li>';
    }).join('');
    $('cpEmpty').hidden = shown.length > 0;
    input.setAttribute('aria-activedescendant', shown.length ? 'cpOpt' + active : '');
    statusEl.textContent = shown.length ? shown.length + (shown.length === 1 ? ' command' : ' commands') : 'No commands match';
    const cur = listEl.querySelector('.is-active');
    if (cur) cur.scrollIntoView({ block: 'nearest' });
  }

  function esc(s) { return typeof escapeHtml === 'function' ? escapeHtml(s) : String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  function setActive(i, scroll) {
    if (!shown.length) return;
    active = (i + shown.length) % shown.length;
    listEl.querySelectorAll('[role="option"]').forEach(li => {
      const on = Number(li.dataset.i) === active;
      li.classList.toggle('is-active', on);
      li.setAttribute('aria-selected', String(on));
    });
    input.setAttribute('aria-activedescendant', 'cpOpt' + active);
    if (scroll !== false) {
      const cur = listEl.querySelector('.is-active');
      if (cur) cur.scrollIntoView({ block: 'nearest' });
    }
  }

  function onInputKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(true); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
    else if (e.key === 'PageDown') { e.preventDefault(); setActive(Math.min(active + 8, shown.length - 1)); }
    else if (e.key === 'PageUp') { e.preventDefault(); setActive(Math.max(active - 8, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (!e.isComposing) run(active); }
  }

  function run(i) {
    const a = shown[i];
    if (!a) return;
    close(false);
    // After the dialog is gone and the page has the focus back, so the action sees the page as it is.
    setTimeout(() => {
      try {
        const r = a.run();
        if (r && typeof r.catch === 'function') r.catch(err => console.error('command failed', a.label, err));
      } catch (err) { console.error('command failed', a.label, err); }
    }, 0);
  }

  function open() {
    if (isOpen) return;
    // Another dialog (brief page, library, brand guide, present mode) owns the keyboard.
    const b = document.body;
    if (b.classList.contains('has-dialog') || b.classList.contains('has-cart')) return;
    if (document.querySelector('.pr') && visible(document.querySelector('.pr'))) return;
    ensureDom();
    all = collect();
    opener = document.activeElement;
    input.value = '';
    active = 0;
    isOpen = true;
    root.hidden = false;
    b.classList.add('has-dialog');
    draw();
    input.focus();
  }

  function close(restoreFocus) {
    if (!isOpen) return;
    isOpen = false;
    root.hidden = true;
    document.body.classList.remove('has-dialog');
    if (restoreFocus && opener && opener.focus && document.contains(opener)) opener.focus({ preventScroll: true });
    opener = null;
  }

  /* ---------------- keys ---------------- */

  const TEXT_INPUTS = ['button', 'checkbox', 'radio', 'submit', 'reset', 'file', 'image'];
  function inTextField(e) {
    return [e.target, document.activeElement].some(el => {
      if (!el || el === document.body || el === document.documentElement) return false;
      if (el.isContentEditable) return true;
      if (el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') return true;
      return el.tagName === 'INPUT' && !TEXT_INPUTS.includes((el.type || 'text').toLowerCase());
    });
  }

  // The number keys: only when nothing else is using the keyboard.
  function numberKeysFree(e) {
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return false;
    if (!isEditor() || isOpen) return false;
    const b = document.body;
    if (b.classList.contains('has-dialog') || b.classList.contains('has-cart') || b.classList.contains('is-presenter')) return false;
    if (b.classList.contains('m-revealing')) return false;
    const modal = $('brandGuideModal');
    if (modal && !modal.hidden) return false;
    if ([...document.querySelectorAll('[aria-modal="true"], [role="dialog"]')].some(el => visible(el))) return false;
    return !inTextField(e);
  }

  const NUMBER_VIEWS = { '1': 'board', '2': 'patterns', '3': 'deck', '4': 'brief' };

  function onKeydown(e) {
    if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (isOpen) close(true); else open();
      return;
    }
    const v = NUMBER_VIEWS[e.key];
    if (v && typeof setWorkView === 'function' && numberKeysFree(e)) {
      e.preventDefault();
      setWorkView(v);
    }
  }

  function buildLauncher() {
    const tools = document.querySelector('.ws-tools');
    if (!tools || $('cpLauncher')) return;
    const b = document.createElement('button');
    b.type = 'button';
    b.id = 'cpLauncher';
    b.className = 'btn btn-ghost btn-small cp-launcher';
    b.setAttribute('aria-label', 'Search commands');
    b.setAttribute('aria-haspopup', 'dialog');
    b.title = 'Search commands (' + (isMac() ? '⌘K' : 'Ctrl+K') + ')';
    b.innerHTML = '<svg class="ico" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
    tools.appendChild(b);
    b.addEventListener('click', open);
  }

  function init() {
    // Capture phase: before the show's key handlers, so Cmd+K works on any page of the app.
    window.addEventListener('keydown', onKeydown, true);
    buildLauncher();
  }

  window.CommandPalette = { open, close: () => close(true), isOpen: () => isOpen };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
