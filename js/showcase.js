/* ---------------------------------------------------------------------
   showcase.js — Showcase mode: the app as other people should see it.

   An app-level setting (localStorage, not per brand). When it is on:
   - body[data-showcase="on"], and window.isShowcase() is true;
   - the aesthetic list, step buttons, shuffle, Compare all, "Mix in" and
     anything else that calls showcaseFilter(list) only offer the owner's
     20 favourites (SHOWCASE_KEYS); the rest stay in the app for him;
   - css/showcase.css hides owner-only tools (Classic/Current, the
     recommendations panel, suggestion boxes) and folds fine-tuning (locks,
     type sliders, pattern settings) behind one "Refine" disclosure.

   Toggle: the switch in the library header, or View > Showcase Mode
   (⇧⌘D) in the Mac app, which calls window.toggleShowcase().
------------------------------------------------------------------------ */

const SHOWCASE_KEYS = [
  'soft-form', 'holo-iridescent', 'aurora-noir', 'bento-grid', 'mesh-gradient',
  'industrial-device', 'blueprint', 'blob-tracking', 'xerox', 'micrographics',
  'ascii-art', 'corporate-vandalism', 'xerox-punk', 'acid-graphics', 'radical-memphis',
  'pirate-broadcast', 'dystopian-luxury', 'naive-doodle', 'gorpcore', 'old-web',
];
const SHOWCASE_STORE = 'bd.showcase';

function isShowcase() {
  return !!document.body && document.body.dataset.showcase === 'on';
}

// The showcase subset of a list of aesthetic defs (or keys), in the list's own order.
// Outside showcase mode, or if nothing would be left, the list comes back unchanged.
function showcaseFilter(list) {
  if (!isShowcase() || !Array.isArray(list)) return list;
  const keep = list.filter(a => SHOWCASE_KEYS.includes(typeof a === 'string' ? a : a && (a.classicOf || a.key)));
  return keep.length ? keep : list;
}

(function () {
  function stored() {
    try { return localStorage.getItem(SHOWCASE_STORE) === 'on'; } catch (err) { return false; }
  }

  function apply(on) {
    if (on) document.body.dataset.showcase = 'on';
    else delete document.body.dataset.showcase;
    if (!on) delete document.body.dataset.refine;
    const refine = document.getElementById('scRefine');
    if (refine && !on) refine.setAttribute('aria-pressed', 'false');
    const sw = document.getElementById('scToggle');
    if (sw) sw.checked = on;
  }

  // Rebuild the lists that showcaseFilter() narrows. All guarded: these live in other files.
  function refresh() {
    if (typeof buildAestheticFamilies === 'function') buildAestheticFamilies();
    if (typeof buildAestheticList === 'function') buildAestheticList();
    if (document.body.dataset.view === 'editor' && typeof render === 'function') render();
    if (typeof blendRenderOptions === 'function') blendRenderOptions();
  }

  function setShowcase(on) {
    on = !!on;
    try { localStorage.setItem(SHOWCASE_STORE, on ? 'on' : 'off'); } catch (err) { /* this session only */ }
    apply(on);
    refresh();
    if (typeof showToast === 'function') {
      showToast(on ? 'Showcase mode on: favourite aesthetics, owner tools hidden' : 'Showcase mode off: every aesthetic and tool');
    }
  }

  function toggleShowcase() { setShowcase(!isShowcase()); }

  // Library header: a small switch next to "New brand".
  function buildToggle() {
    const head = document.querySelector('.lib-head');
    if (!head || document.getElementById('scToggle')) return;
    const label = document.createElement('label');
    label.className = 'sc-toggle';
    label.title = 'Show only the favourite aesthetics and hide the owner tools (⇧⌘D in the Mac app)';
    label.innerHTML = 'Showcase<input type="checkbox" id="scToggle" role="switch" />';
    const actions = document.getElementById('libNew');
    if (actions && actions.parentNode === head) head.insertBefore(label, actions);
    else head.appendChild(label);
    label.querySelector('input').addEventListener('change', e => setShowcase(e.target.checked));
  }

  // Sidebar rail: one "Refine" switch, shown only in showcase mode. Turning it on brings the
  // locks, type fine-tuning, pasted colors and pattern settings back, each in its place.
  function buildRefine() {
    const rail = document.querySelector('.sd-rail');
    if (!rail || document.getElementById('scRefine')) return;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'sd-tab sc-refine';
    b.id = 'scRefine';
    b.setAttribute('aria-pressed', 'false');
    b.title = 'Refine: show the locks and fine-tuning controls';
    b.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/></svg><span>Refine</span>';
    rail.appendChild(b);
    b.addEventListener('click', () => {
      const on = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', String(on));
      if (on) document.body.dataset.refine = 'open';
      else delete document.body.dataset.refine;
    });
  }

  window.isShowcase = isShowcase;
  window.showcaseFilter = showcaseFilter;
  window.setShowcase = setShowcase;
  window.toggleShowcase = toggleShowcase;
  window.SHOWCASE_KEYS = SHOWCASE_KEYS;
  window.Show = window.Show || {};
  window.Show.showcase = setShowcase;

  // Applied before the first render (DOMContentLoaded runs after every script).
  apply(stored());
  function init() { buildToggle(); buildRefine(); apply(isShowcase()); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
