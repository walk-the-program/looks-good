/* ---------------------------------------------------------------------
   aesthetics/registry.js — the list of design-language aesthetics.

   Each js/aesthetics/<key>.js calls registerAesthetic({...}); the shape of
   a definition is documented in docs/aesthetics-plan.md (contract rev 1).
   Load order: this file first, then the ten aesthetic files, then
   aesthetic-board.js. Plain <script> tags, no modules.
------------------------------------------------------------------------ */

/* ---------------------------------------------------------------------
   SPECIMEN COPY CONTRACT (def.copy, abCopy)  -  every aesthetic's flavour text

   Any user-visible specimen / flavour string an aesthetic prints (label sub-lines,
   price lines, button labels, state names, the motto, captions, the kicker) is declared
   in an optional def.copy map and read through abCopy; it is never hardcoded in a template.
   The owner can rewrite each entry per brand (Brand tab > Advanced > Specimen copy).

     copy: { <key>: { label: 'Name shown in the editor', text: 'Default', warm: 'Softer default (optional)' } }

   - Keys are camelCase and unique within the aesthetic. `label` is required, `text` is the
     Style's-voice default, `warm` is optional: used when the brand's voice is Warmer or
     Own words. Give `warm` to anything harsh or exclusionary; keep it the same length class.
   - Read: abCopy(defOrKey, key)     -> HTML-escaped string (between tags, in attributes, SVG <text>)
           abCopyRaw(defOrKey, key)  -> unescaped (you escape; brief text). Optional 3rd arg: a
           brand state (default: the global state). In a hook use `this`, or a plain function's
           own key string ('dystopian-luxury'); inside a blend the donor's art hook still
           resolves its own key.
     Resolution: owner's override (state.content.copy[aestheticKey][key], non-empty)
     -> `warm` if the voice is Warmer / Own words and the entry has one -> `text`.
     An unknown key returns '' and warns once.
   - Reserved keys the framework reads for you:
       state0, state1, state2  the three state names (replace def.labels.states; board, deck)
       motto                   the footer / cover motto (displayMotto, brief); Own words motto still wins
       kicker                  the line above the board headline (not used inside a blend)
     Keep def.labels.states / def.motto / def.kicker as they are (other readers); make the
     copy `text` match them.
   - Text with a variable inside: put {brand} (or any token) in the text and replace it in the
     template after abCopy: abCopy(k, 'caption').replace('{brand}', () => e(ctx.brandName)).
   - Not copy: CSS names, font names, rule text (rules / deck.principles / do / dont), and the
     brand's own name, tagline and fallbacks.

   Example:
     registerAesthetic({ key: 'x', ...,
       copy: { price: { label: 'Price line', text: 'Price on request', warm: 'Fairly priced' } },
       deck: { product(ctx) { return `<p>${abCopy('x', 'price')}</p>`; } } });
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

// The two-digit number shown beside an aesthetic's name (picker, Compare all, Mix in,
// Worlds): its place in the list the person can see, so the numbers run 01, 02, 03...
// with no gaps (the curated showcase list included). Plain counting, never the def's
// internal order value.
function aestheticNumber(key) {
  const base = aestheticBaseKey(key);
  const list = typeof showcaseFilter === 'function' ? showcaseFilter(AESTHETICS) : AESTHETICS;
  const i = list.findIndex(a => a.key === base);
  return i < 0 ? '' : String(i + 1).padStart(2, '0');
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
