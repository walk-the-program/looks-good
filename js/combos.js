/* ---------------------------------------------------------------------
   combos.js — nine curated style combos (docs/blend.md).

   A combo is a named, fixed blend: a base style plus a donor style with exactly
   the listed channels on. It is picked like a style (the style gallery's "Combos"
   section, prev / next, shuffle, showcase mode) and is NOT a new aesthetic: it
   sets state.aesthetic = base and state.blend = { with: donor, channels } through
   the normal blend path, so the board, deck, Built view, Patterns and the briefs
   already render it.

   activeCombo(state) is derived: a combo is "on" only while the style is the
   combo's base AND the blend matches its donor and channels exactly. Any manual
   change to the style or the blend turns it back into a plain style / custom
   blend, and undo brings it back (nothing else has to be snapshotted). state.combo
   mirrors the answer (set by applyCombo, saved with the brand, re-derived on load).

   Rendering: while a combo is on, aestheticView (js/blend.js) returns a def named
   "Name (Base × Donor)" with def.combo, and blendParts writes data-combo="<id>"
   next to data-ae / data-blend on every root (board, deck slides, Built view).
   css/combos/<id>.css scopes hand-tuning rules to it:
     .ab[data-combo="vitrine"] ...   [data-combo="vitrine"] .sb-k-...

   Compare all skips combos (it draws each style on its own, unblended).
   Plain <script>, no modules. Loaded after blend.js.
------------------------------------------------------------------------ */

const COMBO_KEY_PREFIX = 'combo:';

const COMBOS = [
  {
    id: 'vitrine', name: 'Vitrine', base: 'dystopian-luxury', with: 'mesh-gradient',
    channels: { art: true, type: false, color: true, patterns: false, material: false },
    summary: 'Dystopian Luxury\'s stark catalogue with one luminous mesh gradient, like an object in a museum case.',
  },
  {
    id: 'glasshouse', name: 'Glasshouse', base: 'dystopian-luxury', with: 'liquid-glass',
    channels: { art: false, type: false, color: false, patterns: false, material: true },
    summary: 'Dystopian Luxury\'s stark catalogue with its panels and samples turned to frosted, light-bending glass.',
  },
  {
    id: 'counterfeit', name: 'Counterfeit', base: 'dystopian-luxury', with: 'xerox-punk',
    channels: { art: false, type: true, color: false, patterns: true, material: false },
    summary: 'Dystopian Luxury\'s catalogue photocopied: cut-and-paste lettering and toner-grain patterns over the luxury grid, like a knock-off lookbook.',
  },
  {
    id: 'hallmark', name: 'Hallmark', base: 'dystopian-luxury', with: 'holo-iridescent',
    channels: { art: false, type: false, color: true, patterns: false, material: false },
    summary: 'Dystopian Luxury\'s stark layout with a holographic shimmer in the colour, like a foil stamp on a luxury label.',
  },
  {
    id: 'fine-print', name: 'Fine Print', base: 'mesh-gradient', with: 'micrographics',
    channels: { art: false, type: true, color: false, patterns: false, material: false },
    summary: 'Mesh Gradient\'s soft colour fields carrying tiny technical lettering, like specification text on a glowing label.',
  },
  {
    id: 'afterglow', name: 'Afterglow', base: 'soft-form', with: 'aurora-noir',
    channels: { art: false, type: false, color: true, patterns: false, material: false },
    summary: 'Soft Form\'s pressed, rounded surfaces lit with Aurora Noir\'s night-sky colour, like a dim room with a glow still in the air.',
  },
  {
    id: 'workbench', name: 'Workbench', base: 'blueprint', with: 'industrial-device',
    channels: { art: false, type: false, color: false, patterns: false, material: true },
    summary: 'Blueprint\'s drafting grid with Industrial Device\'s bolted, knurled hardware finishes, like a drawing pinned above the machine it describes.',
  },
  {
    id: 'dial-up', name: 'Dial-Up', base: 'old-web', with: 'pirate-broadcast',
    channels: { art: false, type: true, color: true, patterns: false, material: false },
    summary: 'Old Web\'s plain page set in teletext lettering and signal colours, like a bulletin board on a glowing CRT.',
  },
  {
    id: 'northern-glass', name: 'Northern Glass', base: 'aurora-noir', with: 'liquid-glass',
    channels: { art: false, type: false, color: false, patterns: false, material: true },
    summary: 'Aurora Noir\'s dark sky with clear glass paneling floating over it, like a window pane on a cold night.',
  },
];

// The "Combos" family chip in the style gallery (a virtual family: no style belongs to it).
if (typeof AESTHETIC_FAMILIES !== 'undefined' && !AESTHETIC_FAMILIES.some(f => f.key === 'combos')) {
  AESTHETIC_FAMILIES.push({ key: 'combos', label: 'Combos' });
}

/* ---------------- lookups (pure) ---------------- */

function comboById(id) {
  return typeof id === 'string' ? COMBOS.find(c => c.id === id) || null : null;
}

// The id for a saved / hand-edited value, or null.
function normalizeComboId(raw) {
  const c = comboById(raw);
  return c ? c.id : null;
}

// Picker keys: a style tile's key is the style key; a combo tile's key is "combo:<id>".
function comboKey(c) { return COMBO_KEY_PREFIX + c.id; }
function comboIdFromKey(key) {
  if (typeof key !== 'string' || !key.startsWith(COMBO_KEY_PREFIX)) return null;
  return normalizeComboId(key.slice(COMBO_KEY_PREFIX.length));
}

// The combo's blend, normalised the way a saved blend is (null if a key is unknown).
function comboBlendOf(c) {
  return typeof normalizeBlend === 'function' ? normalizeBlend({ with: c.with, channels: c.channels }, c.base) : null;
}

function comboNames(c) {
  const name = key => { const a = typeof AESTHETICS !== 'undefined' && AESTHETICS.find(x => x.key === key); return a ? a.name : key; };
  return { base: name(c.base), donor: name(c.with) };
}
// "Dystopian Luxury × Mesh Gradient"
function comboPair(c) {
  const n = comboNames(c);
  return `${n.base} × ${n.donor}`;
}
// "Vitrine (Dystopian Luxury × Mesh Gradient)"
function comboLabel(c) {
  return `${c.name} (${comboPair(c)})`;
}

// The combo a brand state is showing, else null: the style is the base and the blend is
// exactly the donor with exactly the channels. A hand-built blend that equals a combo counts.
function activeCombo(st) {
  if (!st || (typeof BLEND_ENABLED !== 'undefined' && !BLEND_ENABLED)) return null;
  if (typeof normalizeBlend !== 'function' || !st.blend) return null;
  const b = normalizeBlend(st.blend, st.aesthetic);
  if (!b) return null;
  return COMBOS.find(c => c.base === st.aesthetic && c.with === b.with
    && BLEND_CHANNELS.every(ch => !!c.channels[ch] === !!b.channels[ch])) || null;
}

// The picker key of what the brand is showing: the combo's key while one is on, else the style's.
function comboPickKey(st) {
  const c = activeCombo(st);
  return c ? comboKey(c) : st.aesthetic;
}

// The combos the picker offers: all nine (showcase mode keeps them: every base and donor is
// in its favourites); none when the blend feature is switched off.
function visibleCombos() {
  return typeof BLEND_ENABLED !== 'undefined' && !BLEND_ENABLED ? [] : COMBOS;
}

// A copy of a brand state showing the combo (the style gallery draws each combo tile from this).
function comboState(c, st) {
  const base = typeof aestheticByKey === 'function' ? aestheticByKey(c.base) : null;
  return Object.assign({}, st, {
    aesthetic: c.base, aestheticVersion: 'current', blend: comboBlendOf(c), combo: c.id,
    bgMode: base && base.mode ? base.mode : st.bgMode,
  });
}

// The board def while a combo is on: the blended def under the combo's own name and summary,
// def.combo set. Memoised per blended def so a def keeps one identity per render.
const COMBO_DEF_CACHE = new WeakMap();
function comboDef(def, c) {
  let d = COMBO_DEF_CACHE.get(def);
  if (!d || d.combo !== c) {
    d = Object.assign({}, def, { name: `${c.name} (${def.name})`, summary: c.summary, combo: c });
    COMBO_DEF_CACHE.set(def, d);
  }
  return d;
}

/* ---------------- applying (needs app.js: state, applyAesthetic, render) ---------------- */

// Sets the style and blend with no undo step and no render: the shuffle and applyCombo share it.
function comboSet(id) {
  const c = comboById(id);
  if (!c || !comboBlendOf(c)) return false;
  applyAesthetic(c.base);            // base style, its recommended mode, fonts are left to the caller
  state.blend = comboBlendOf(c);
  state.combo = c.id;
  return true;
}

// Picking a combo: one undo step, fonts follow the style as for a style switch.
function applyCombo(id) {
  const c = comboById(id);
  if (!c) return;
  const cur = activeCombo(state);
  if (cur && cur.id === c.id) return;
  pushUndoSnapshot(state);
  if (!comboSet(c.id)) return;
  const fonts = followAestheticFonts();
  render();
  if (fonts) announceFollowedFonts(fonts);
}

// Keeps state.combo equal to the derived answer (called after every board render).
function comboSync() {
  const c = activeCombo(state);
  state.combo = c ? c.id : null;
}

// The Style panel (js/sidebar.js) names the base style; while a combo is on it names the combo.
function comboSyncPanel() {
  const c = activeCombo(state);
  if (!c) return;
  const num = document.getElementById('sdStyleNum');
  if (num) num.textContent = 'C' + (COMBOS.indexOf(c) + 1);
  const name = document.getElementById('sdStyleName');
  if (name) name.textContent = c.name;
  const desc = document.getElementById('sdStyleDesc');
  if (desc) desc.innerHTML = `<b>${escapeHtml(comboPair(c))}</b><span>${escapeHtml(c.summary)}</span>`;
  const shot = document.getElementById('sdStyleShot');
  if (shot) shot.setAttribute('aria-label', `Change style. Now ${c.name}, ${comboPair(c)}`);
}
