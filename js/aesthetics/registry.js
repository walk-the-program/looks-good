/* ---------------------------------------------------------------------
   aesthetics/registry.js — the list of design-language aesthetics.

   Each js/aesthetics/<key>.js calls registerAesthetic({...}); the shape of
   a definition is documented in docs/aesthetics-plan.md (contract rev 1).
   Load order: this file first, then the ten aesthetic files, then
   aesthetic-board.js. Plain <script> tags, no modules.
------------------------------------------------------------------------ */

const AESTHETICS = [];

function registerAesthetic(def) {
  const at = AESTHETICS.findIndex(a => a.key === def.key);
  if (at >= 0) AESTHETICS[at] = def; else AESTHETICS.push(def);
  AESTHETICS.sort((a, b) => a.order - b.order);
  return def;
}

// Unknown or missing keys fall back to the first aesthetic, so a saved brand
// that references a retired aesthetic still renders.
function aestheticByKey(key) {
  return AESTHETICS.find(a => a.key === key) || AESTHETICS[0];
}
