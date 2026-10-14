/* ---------------------------------------------------------------------
   aesthetics/registry.js — the list of design-language aesthetics.

   Each js/aesthetics/<key>.js calls registerAesthetic({...}); the shape of
   a definition is documented in docs/aesthetics-plan.md (contract rev 1).
   Load order: this file first, then the ten aesthetic files, then
   aesthetic-board.js. Plain <script> tags, no modules.
------------------------------------------------------------------------ */

const AESTHETICS = [];

// Classic versions: the aesthetic as it was at git tag r6-0-baseline, generated into
// js/aesthetics/classic/ by dev/make-classic.js. They live outside AESTHETICS so the
// picker, Compare grid, shuffles and the blend donor list never see them; the only way
// to reach one is aestheticByKey('<key>--classic') or resolveAestheticDef(state).
const AESTHETICS_CLASSIC = {};     // base key -> classic def (key '<base>--classic', classicOf '<base>')
const CLASSIC_SUFFIX = '--classic';

function registerAesthetic(def) {
  if (def && def.classicOf) { AESTHETICS_CLASSIC[def.classicOf] = def; return def; }
  const at = AESTHETICS.findIndex(a => a.key === def.key);
  if (at >= 0) AESTHETICS[at] = def; else AESTHETICS.push(def);
  AESTHETICS.sort((a, b) => a.order - b.order);
  return def;
}

// What a generated classic file calls in place of registerAesthetic.
function registerClassicAesthetic(baseKey, def) {
  return registerAesthetic(Object.assign({}, def, { key: baseKey + CLASSIC_SUFFIX, classicOf: baseKey }));
}

// 'soft-form--classic' -> 'soft-form'. Lookups that are keyed by the current aesthetic
// (font recommendations, pattern suites) use this so a classic def shares them.
function aestheticBaseKey(key) {
  const k = String(key == null ? '' : key);
  return k.endsWith(CLASSIC_SUFFIX) ? k.slice(0, -CLASSIC_SUFFIX.length) : k;
}

function hasClassicAesthetic(key) {
  return Object.prototype.hasOwnProperty.call(AESTHETICS_CLASSIC, key);
}

// Unknown or missing keys fall back to the first aesthetic, so a saved brand
// that references a retired aesthetic still renders.
function aestheticByKey(key) {
  const hit = AESTHETICS.find(a => a.key === key);
  if (hit) return hit;
  const base = aestheticBaseKey(key);
  if (base !== key && hasClassicAesthetic(base)) return AESTHETICS_CLASSIC[base];
  return AESTHETICS[0];
}

// The def to render for a brand state: the classic copy when the brand asks for it
// (state.aestheticVersion === 'classic') and the aesthetic has one, else the current
// def. The single resolver for the board, deck, patterns, brief and blends.
function resolveAestheticDef(st) {
  const key = st && st.aesthetic;
  if (st && st.aestheticVersion === 'classic' && hasClassicAesthetic(key)) return AESTHETICS_CLASSIC[key];
  return aestheticByKey(key);
}
