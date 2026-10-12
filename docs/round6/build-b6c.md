# Build log — B6c (round 6): wabi-sabi, dark-academia, curio-cabinet

Builder: B6c (Opus). Packet: scratchpad/adv/BUILD-BRIEF-R6.md rev 1. Spec: docs/research/round6.md §3, §4, §12.
Files written: js/aesthetics/{wabi-sabi,dark-academia,curio-cabinet}.js, css/aesthetics/{same}.css, this log.
Nothing else in the repo was edited.

## Wabi-Sabi (39)
- Signature: one procedural chawan (seeded by the brand name): wobbling thrown rim, leaning walls, an
  unglazed raw-clay foot with iron speckles, the primary as the main glaze (chroma cut to <=45%, 15% to
  ash) ending in drips with a pooled edge and a turbulence mottle, the secondary as a second pour, an iron
  rim line, ONE gold kintsugi seam (with a short run inside the rim), a cast shadow, a ground hairline that
  stops short, a hanko seal with the initial knocked out (accent if >= 3:1 on paper, else shu #C8442F).
- Headline (`def.headline`): small mincho at 400, stepped over 2-3 lines like a poem; the last word
  carries bōten (a sesame emphasis dot over each letter) in the seal colour. No CJK generated.
- Board: unbleached paper (`canvas()` pulls toward kinari / a warm sumi night) with sparse curved washi
  fibres (no noise); hairlines that stop short at varied lengths; a tiny ensō as the brand mark (the only
  ensō); vertical small-caps kicker; glaze test tiles for the palette (fired glaze on the tile, raw brand
  hex as a pigment dot by the code); a washi sheet with one deckled edge for 01; no card at all for 02
  (bottom-hairline field, pebble toggle in a hairline groove, Raw / Glazed / Mended sherds); 56px rows with
  an ink dot travelling a hairline for progress. Phone: bowl first at right, poem below, tiles become rows.
- Deck: cover = poem + bowl on empty paper (no pattern band, `coverBand:false`, `closingStrip:false`:
  emptiness); Material stage shows a second art variant (cup raw, bowl glazed, dish mended).

## Dark Academia (40)
- Signature: a title leaf (running head, Fell headline with a raised rubricated initial and the last word
  in italic rubric, fleuron, italic imprint, one Caveat pencil note in the margin) beside a procedural
  shelf: client primary/secondary as book cloths (L 25-34%, chroma -20%, darkened until gilt reads at 4.6:1)
  among calf, morocco, vellum, navy, bottle; raised bands, gilt rules, lettering pieces with real generic
  titles (no repeats), a leaning volume, the brand's own volume pulled forward with its name in gilt and a
  monogram roundel, a ribbon over the shelf edge, one lamp from the upper left.
- Board: dark oak under a lamp vignette; all reading text on paper leaves (re-scoped ink vars); on the wood
  only gilt small caps. Fleuron rules; binder's cloth swatches with gilt-stamped panels (cloth / wax shown,
  brand hex as a dot); a specimen leaf for Type; 01 = a shelf bay of standing spines (segmented; the chosen
  one drawn up, in the primary cloth) above a leaf with a cloth-bound CTA (gilt inset rule, manicule ☞);
  02 = dog-eared leaf with a typed field (fountain-pen focus #1C2A44), wax-seal toggle, Cloth / Gilt / Sealed
  bindings; 03 = a library catalogue card (typed heading over a red rule, call number + copy number, ruled
  lines, punched hole, ribbon progress). Light mode = the reading room by day.
- Deck: every text slide is a paper leaf on the oak; Principles and Do/Don't are an open two-page spread
  with a gutter; Material stage = an ex libris bookplate (laurel, engraved oval, monogram in rubric).

## Curio Cabinet (48)
- Signature: a type-case tray of 16 unequal recessed compartments (oak walls, lit edge, shadow from the
  top-left, baize nap) holding 12 procedural objects with contact shadows and figure numbers: ammonite
  (log spiral, ribs, suture), struck brass token with the brand initial, sewn button / swirl marble / glass
  beads in the secondary as glass and enamel, skeleton key with a string tag, barred moulted feather on a
  pin, the treasured quartz point in the accent with a glow and an accent pin, urchin test, veined pebble,
  pressed ginkgo on a taped herbarium slip, cowrie, copper token; the collection label in a brass card
  frame; two compartments empty; one vitrine sheen; a typed legend of the figures.
- Headline: a pinned museum label (typed accession line, Caslon roman, last word in italic like a Latin
  name + a typed "fig. 7" reference) tied to the tray by a string.
- Board: baize under a lamp; drawer fronts in the primary with a brass card-frame pull holding a paper
  label (segmented + CTA with a brass knob); palette as specimens in a strip tray (two-tone material
  pebbles, the primary as a drawer front); cream specimen card for Type; pin-head toggle in a specimen
  track; paper-label field with brass focus; Found / Pinned / Treasured specimens; legend rows with
  string-tied tags and compartments filling for progress; a brass plaque footer. Light mode = cream felt.
- Deck: cover = label + large tray (`coverBand:false`, `closingStrip:false`); text slides sit in
  recessed compartments; Material stage = a Haeckel-style plate of nine numbered procedural rosettes.

## Shared notes
- `font-synthesis: none` on every root; no mask-image; no backdrop-filter; deck export-safe.
- Art ids are unique per call (module counters), so board, compare tiles and slides never share SVG ids.
- Extra faces loaded from art() via `loadFontFamily`: Courier Prime (DA, Curio), Caveat (DA marginalia).
- Token keys follow `--ab-<prefix>-*` so material placeholders resolve in the AI brief.

## Verification (2026-10-11)
- Boards: sheet-b6c-<key>.png (A warm rec, B other mode, C green, D 390) — overflow 0 at 1280 and 390.
- WebKit: sheet-b6cwk-<key>.png — no WebKit-only breakage.
- Deck gore: 3 keys x 4 configs = 12 configs, 0 issues (scratchpad/adv/b6c/gore4.json).
- Decks: scratchpad/adv/b6c/sheet-deck-{ws,da,cc}.png (rec) and -{wsB,daB,ccB}.png (other mode).
- Blend donor: each key's art renders full-size inside raw-brutalist's art box (nested scope present).
- `node tests/run.js` all passed; `t5/harness.js` briefs 192 fails 0 warns 0; `t5/src-verify-p5.js` families 53 fails 0.

## Adoption log (b6c)
Packet: scratchpad/adv/ADOPT-BRIEF.md (rev 3), against framework commit 96438f8. The SH shared-files commit had not
landed when this pass finished (HEAD 83573af), so the shots use the current fit.js/meta.

- **Dead deck CSS removed** (old product mock and disc marks): wabi-sabi 18 rules, dark-academia 22, curio-cabinet 20.
  That covers `.ab-deck-side/-nav/-screen/-screentitle/-chip/-row/-rname/-rpct/-dot/-ctacard/-ctatitle/-ctaline/-mark`,
  the `.ab-deck-app` selector in curio's compartment rule, the in-art Material toggles, and wabi's old pattern-band
  dimming (the band is off via `coverBand:false`).
- **Material slide**: `def.deck.materialArt(ctx)` on all three keys: wabi = three vessels (raw / glazed / mended),
  DA = ex libris bookplate, curio = Haeckel plate. The variants left `art()`, so hero and donor art are lighter.
- **Do / Don't**: `def.deck.marks`: wabi = glaze pebble / ash slash (spans), DA = ☞ / § in rubric, curio = pin head /
  typed ✕. The new native In-product slide reads correctly with the board parts in all three, so no
  `deck.product` hook is needed.
- **Structure**: dark-academia `layout.sectionOrder: ['use','ui','touch']` (the catalogue card leads);
  curio-cabinet `layout.order: ['hero','palette','sections','type']` (the specimen card for type closes the board).
  Wabi-sabi keeps its own recomposed split hero.
- **Weights** (font-synthesis none): every fake weight is now fixed. Shippori 700 became 400/600, Zen Kaku 600 became 500,
  IM Fell 600/700 became 400, Libre Caslon 600 became 700, Newsreader 700 became 600, Courier Prime 600 became 400.
  A probe on board + deck in both modes reports clean.
- **Catalogue copy number**: DA's "c.01" call numbers stay as visible text, so no `--dk-min-text` opt-out is needed.
- **curio-cabinet × y2k-chrome blend**: the donor's state names sat on curio's oak strip (1.33:1). The strip is
  dropped when the row holds blend states (`.ab-states:has(.ab-blend-state)`), and a contrast scan of the
  interface slide finds 0 state names under 3:1 (both directions, both modes).
- **Checks**: gore 12 configs, 0 issues (b6c/gore5.json). `tests/run.js` all passed. Harness briefs 192, fails 0.
  src-verify families 53, fails 0. Boards A–D at 1280/390 overflow 0 (Chromium and WebKit, 12/12). The only
  console error is the favicon 404.
