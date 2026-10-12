# QC5 — Round 6 code quality and cleanliness audit

Task qc5, packet rev 1. Read-only audit of `r6-0-baseline..HEAD` (2422d9f). Auditor: Opus, no sub-agents.
Method: ponytail-audit (a concrete case per finding, grep before calling anything unused, smallest fix).

**What this repo does:** a no-build vanilla JS brand designer. The user picks fonts, colours and one of
48 aesthetics; the app draws a design-language board, a 10-slide brand deck, a pattern suite and an AI
brief in that aesthetic. Round 6 added blending two aesthetics (`js/blend.js`), framework hooks, 12 new
aesthetics and fixed pattern colourways.

**Load assumed:** one person in one window (browser or the Mac WKWebView). "Slow" means a visible stall
on one render. Timings below are from headless Chromium on this Mac; WKWebView on an older Mac will be
slower, so treat anything near 150 ms as at risk.

## Evidence gathered (all in the live page, playwright session `qc5`, http://localhost:8411)

- **XSS sweep:** brand name `Ac"me <img class=xssA src=x onerror=…> & Co` and tagline with `</style><svg onload=…>`.
  Rendered board + deck for all 48 aesthetics, unblended and as two bold blends each (144 combinations).
  Checked for any `[onerror]`, `[onload]` or injected class (case-insensitive, because several aesthetics
  upper-case the name). **0 hits.** The AI brief built for all 48 × (plain, blended): 0 errors.
- **Fuzz:** emoji, a 50-letter single word, Arabic, punctuation-only taglines, all-white and all-black
  palettes in both modes, and a logo: 432 board + deck builds, **0 exceptions, 0 hook warnings.**
- **Render time** (warm, layout forced; full table at the end): median board 3 ms, median deck 28 ms.
  Over or near budget: **Compare grid 716 ms** (48 boards, 22,615 nodes); riso-print deck 124–131 ms,
  xerox deck 91 ms, ascii-art deck 86 ms.
- **Memory:** 20 board + 20 deck re-renders for riso-print, religious-futurism, biomechanical-gothic,
  blob-tracking, cybersigilism, naive-doodle and five heavy-donor blends. JS heap after forced GC stayed
  at 13.7–14.0 MB; DOM node and listener counts identical before and after. **No leak.** A 40-step
  colour drag on a blend: 4.8 ms per render, probe cache capped at 61.
- **Dead selectors:** every selector in the 48 aesthetic sheets, `aesthetic-board.css`, `brand-deck.css`
  and `blend.css` (7,086) tested with `querySelector` after rendering each aesthetic's board and deck in
  light and dark, as a blend base and as a blend donor, plus the Compare grid. 127 never matched; after
  removing state-dependent ones (logo, font class, hover, sidebar UI) the real dead ones are listed under
  "aesthetic CSS" below.
- **Other checks that came back clean:** no duplicate top-level identifiers across the 88 scripts (the
  aesthetic files that reuse `f1`, `seq`, `uri`, `CREAM` are wrapped in IIFEs); no duplicate SVG ids
  between aesthetics in the Compare grid; every inline `--token` survives the style attribute (no quote
  breakage); every font named in `aesthetic-meta.js` exists in `FONTS`; the pattern lead table in
  `docs/patterns.md` matches `Patterns.suiteFor` for all 48; `node tests/run.js` passes.

## Counts

| Severity | Count |
| --- | --- |
| BLOCKER | 0 |
| MAJOR | 4 |
| MINOR | 31 (incl. 6 missing tests) |

Estimated removable: about **150 lines** by mechanical batches, about **230** if the judgment items
(unused framework layouts, unread token variables) are also taken.

---

## MAJOR

### M1. Aesthetic tokens read the global `state`, so blends size weights for the wrong font
- **Where:** `js/aesthetic-board.js:234` (`def.tokens(t)`), `js/blend.js:353` (`donor.tokens(t)`),
  `js/ai-brief.js:470` (`def.tokens(t)`). `tokens(t)` gets no state, so 29 aesthetic files read the
  global `state` (or call `effectiveContent()`) inside it: acid-graphics, ascii-art, bento-grid, big-top,
  blob-tracking, corporate-vandalism, cyber-hud, dystopian-luxury, editorial-serif, frutiger-aero,
  gorpcore, groovy-70s, gummy, mesh-gradient, micrographics, mixed-type, naive-doodle, neo-brutal-pop,
  neo-deco, pixel-arcade, radical-memphis, raw-brutalist, rebus, retro-futurist, riso-print,
  transit-wayfinding, xerox, xerox-punk, y2k-chrome.
- **Case:** base Raw Brutalist, donor Soft Form, Balanced (type on). The board shows Manrope (the donor's
  pairing) but `--rb-hw` is 600, computed for the user's Poppins; Manrope wants 700. Measured: 34 of the
  47 donors give Raw Brutalist the wrong `--rb-hw`. The same happens to the donor's own tokens inside its
  nested scope and to the brief's "material variables" block. Headlines are rescued by the blend's
  probed `--blt-fw !important`; everything else that reads `--xx-hw` (wordmarks, labels, art lettering)
  is off.
- **Fix:** pass the render state: `def.tokens(t, state)` at the three call sites (`state` is the view
  state there), then replace each `typeof state !== 'undefined' && state && state.headingFont` with the
  argument. Do it together with M4 (the same lines).
- **Kind:** mechanical per file, judgment only to confirm each file's board output is unchanged when not
  blended (it should be byte-identical: same fonts).

### M2. The most complex hooks are not guarded, so one throw stops the whole render
- **Where:** `js/aesthetic-board.js:469` (`P.art = () => def.art(ctx)`), `:158` (`def.headline`), `:234`
  (`def.tokens`), `:53` (`def.canvas`), `:100` (`def.printPrimary`); `js/brand-deck.js:125`
  (`deckPatternHook`), `:445` (`deckStageHook`). `def.panels`, `def.states` and `def.deck.*` go through
  `abHookHtml` / `bdCallHook`; these do not.
- **Case:** if an art generator throws (a future edit to one of the 20–40 KB SVG builders),
  `renderMainBoard` throws inside `render()` (`js/app.js:327`), so the font specimen, findings, deck and
  brief cart stop updating, and the Compare grid shows no tiles at all. The fuzz above found no input that
  triggers it today; this is the gap between the documented contract ("a broken hook falls back") and
  the code.
- **Fix:** `P.art = () => abHookHtml(def, def.art, ctx);` and route `headline` through `abHookHtml`
  (it already falls back on `''`). For `tokens` / `canvas` / `printPrimary` wrap in try/catch returning
  `{}` / `null` (blend.js already does this for the donor: `blendDonorTokens`, `blendDef` canvas).
- **Kind:** mechanical.

### M3. Compare grid takes 716 ms to lay out
- **Where:** `js/aesthetic-board.js:658-671` (`renderCompareGrid`), `css/aesthetic-board.css:588`
  (`.cmp-tile`). Comment at `js/aesthetic-board.js:697` still says "twenty full boards".
- **Case:** opening Compare with 48 aesthetics builds 48 full boards (2.2 MB of HTML, 22,615 nodes) and
  lays them all out at once: 716 ms here, likely 1.5–2 s in the Mac app. Most tiles are off screen.
- **Fix:** one CSS line on `.cmp-tile`: `content-visibility: auto; contain-intrinsic-size: auto 640px;`
  (off-screen tiles skip layout and paint). Update the comment to "48".
- **Kind:** judgment (check that `fitCompareGrid`'s first-tile measurement and the zoom still work).

### M4. The "pick a font weight" helper exists in 16+ copies
- **Where:** heaviest-weight-at-or-under-a-cap (13 copies): `cyber-hud.js:12 hudWeight`,
  `retro-futurist.js:14 rfWeight`, `riso-print.js:76 rzW`, `y2k-chrome.js:13 y2kWeight`,
  `xerox.js:105 xrBold`, `xerox-punk.js:81/86 xpBold, xpWeight`, `gorpcore.js:37 gcWeight`,
  `transit-wayfinding.js:53 twWeight`, inline in `micrographics.js:118`, `acid-graphics.js:95`,
  `corporate-vandalism.js:93`, `blob-tracking.js:349`. Nearest-weight (3 identical copies):
  `big-top.js:47 btWeight`, `gummy.js:73 gmWeight`, `frutiger-aero.js:100 faWeight`. Cap-or-400:
  `neo-brutal-pop.js:11 npHeavy`, `radical-memphis.js:12 mmHeavy`. Variants: `raw-brutalist.js:12`,
  `rebus.js:28`, `mixed-type.js:35`. 22 places parse `font.weights` by hand.
- **Case:** M1 has to be fixed in every one of them; the next weight rule change (e.g. honouring `ital`)
  must be made 16 times.
- **Fix:** two helpers in `js/aesthetic-board.js` next to `abSansFace`:
  `abWeights(font)` -> sorted numbers; `abWeight(font, cap)` -> heaviest <= cap, else lightest;
  `abWeightNear(font, want)` -> the big-top/gummy/frutiger rule. Replace the copies (keep the odd
  variants as one-liners on top of `abWeights`). About 55 lines removed.
- **Kind:** mechanical (pure functions; diff `boardHtml` for all 48 in both modes before/after).

---

## MINOR, grouped by file

### js/blend.js
- **B1. Unused:** `BLEND_STRENGTHS` (`:34`) and `blendSuiteFor` (`:343-345`) have no caller anywhere
  (grepped js, css, html, tests, docs). Delete, 5 lines. *Mechanical.*
- **B2. `BL_HERO_RATIO` (`:349`) has no `bleed` entry.** Case: Biomechanical Gothic (hero `bleed`, drawn
  for 21:8, the framework default in `css/aesthetic-board.css:157`) as donor into a base whose art box
  is sized by its content gets ratio 1, clamped to 3:2 / 16:9, so its wide art is cropped square-ish.
  Fix: add `bleed: '21 / 8'`. *Mechanical.*
- **B3. Material placeholder resolver duplicated** with the brief: `blKebab` + `blendResolveMaterial`
  (`:411-421`) vs `aibKebab` + `aibResolveMaterial` (`js/ai-brief.js:52, 79-89`). Same rule, different
  "missing" behaviour ('transparent' vs keep and warn). Fix: keep one in blend.js-independent code
  (ai-brief.js or aesthetic-board.js) with an `onMissing(name)` callback. ~8 lines. *Mechanical.*
- **B4. The root tag's 11 data attributes are written three times:** `P.rootOpen`
  (`js/aesthetic-board.js:462`), `blScopeOpen` (`:368`), `blendProbe` (`:454`); and the style-string
  builder twice (`js/aesthetic-board.js:440`, `blStyle` `:356`). A new root attribute must be added in
  three places or the donor scope and probe silently differ from a real board. Fix: one
  `abRootAttrs(def, t, state)` + `abStyle(vars)` in aesthetic-board.js. *Judgment* (unblended output must
  stay byte-identical).

### js/aesthetic-board.js
- **A1. Round-6 layouts no aesthetic uses:** heroes `art-first`, `type` and palettes `stack`, `dots`
  (`:299`, `:302`; CSS `css/aesthetic-board.css:161-166, 203-216, 399-407`; `css/brand-deck.css:97`).
  0 of 48 aesthetics set them (only `bleed` and `list` are used, once each). About 30 lines. *Judgment:*
  they are documented framework vocabulary (`docs/aesthetics-plan.md:492-493`); delete or keep on purpose.
- **A2. Logo URL printed unescaped** in `P.brand` (`:446`), while `mixed-type.js:145` and
  `editorial-serif.js:115` escape the same value. No live exploit (persistence only accepts a logo that
  loads as an image), but it is the one unescaped user value in board markup. Fix: `src="${e(state.logoDataUrl)}"`.
  *Mechanical.*
- **A3. `ctx.labels` means two different things:** an array of three names in `def.states`
  (`:585`) but the whole labels object in `def.panels` (`:559`) and every `def.deck` hook
  (`js/brand-deck.js:207`). Case: an author writing `ctx.labels.states[0]` in a `states()` hook gets
  `undefined`. Fix: pass the object everywhere and add `names` for the array; update
  `cybersigilism.js` and `xerox.js` (the only two `states()` hooks). *Judgment.*
- **A4. Three hook runners:** `abHookHtml` (`:414`), `bdCallHook` (`js/brand-deck.js:214`) and the
  inline try in `bdMark` (`js/brand-deck.js:283-287`, which swallows errors silently while the other
  two warn). Fix: `bdCallHook` and `bdMark` call `abHookHtml`. ~12 lines. *Mechanical.*
- **A5. The "view or fallback" line exists three times:** `abView` (`:641`), `aibView`
  (`js/ai-brief.js:447`), `view` (`js/patterns-ui.js:156`). Fix: the other two call `abView()`.
  *Mechanical.*
- **A6. Stale comment** `:697` "twenty full boards" (see M3). *Mechanical.*

### js/brand-deck.js
- **D1. Layout thrash when building the deck.** `bdZoomCards` (`:1027-1033`) reads `clientWidth` and
  writes `zoom` card by card, forcing a fresh layout each time; `renderBrandDeckNow` (`:1048-1049`) also
  measures the radius probe before zooming, which costs one more full layout. Case: of riso-print's
  131 ms deck, `bdZoomCards` is 59 ms and `bdApplyRadius` 31 ms. Fix: read all widths first, then write;
  call `bdZoomCards` before `bdApplyRadius`. *Mechanical.*
- **D2. Orphaned and misplaced comments:** `:575-578` describe `bdFitHeadline` but sit above
  `bdTextSpills`; `:614-622` describe `bdFitCover` but sit above `bdCopyTextInside`; `:918-920` repeat
  `:942-945`; `:532` is unindented. Move or delete, ~8 lines. *Mechanical.*

### js/aesthetics/*.js
- **E1. Eight private escape helpers** duplicate the global `escapeHtml` (`js/app.js:280`) or `ctx.e`:
  `ascii-art.js:44 aaEsc` (does not escape quotes; callers patch it with `.replace(/"/g,'&quot;')` at
  `:234, :269`), `big-top.js:43 btEsc`, `cybersigilism.js:119 csEsc`, `frutiger-aero.js:96 faEsc`,
  `gummy.js:69 gmEsc`, `neo-deco.js:28 ndEsc`, `pirate-broadcast.js:25 pbEsc`,
  `religious-futurism.js:58 rfEsc`. Fix: make `escapeHtml` null-safe (`String(str ?? '')`) and use it
  (or `ctx.e`). ~10 lines plus renames. *Mechanical.*
- **E2. Static inline styles** that belong in the stylesheet: `pirate-broadcast.js` (6 fixed
  `style="position:absolute;…"`), `cyber-hud.js` (3), and `js/patterns-ui.js` "Fixed colours" label
  (`style="display:block;margin-top:12px"`). *Mechanical, visual check.*
- **E3. Acid Graphics filter id is fixed but its seed is not** (`acid-graphics.js:201`,
  `<filter id="acr" … seed="${seq + 2}">`). `url(#acr)` resolves to the first `#acr` in the document,
  so with the board and deck both present the deck's "Op-art ripple" always uses the board's seed;
  the per-render seed does nothing. Fix: a fixed seed (or a unique id). *Mechanical.*
- **E4. 51 token variables are never read** by any CSS rule or material `{placeholder}`; they only
  appear in the brief's CSS-variables block. Largest: gummy (10: `--ab-gm-s*`, `--ab-gm-f4*`,
  `--ab-gm-seal2`, `--ab-gm-f3-pale`), frutiger-aero (8: `--ab-fa-close*`, `--ab-fa-water-top`,
  `--ab-fa-floor`, `--ab-fa-glass-hi`, `--ab-fa-sec-tint`, `--ab-fa-hl-card`), groovy-70s (7),
  art-nouveau (5: `--an-*`), old-web (5: `--ow-*`), bauhaus-poster (4: `--bp-*`), mid-century (3),
  acid-graphics (`--ac-fs`, `--ac-sy`), plus one each in bento-grid, big-top, corporate-vandalism,
  naive-doodle, transit-wayfinding, wabi-sabi, xerox. Framework: `--ab-accent-text` and
  `--ab-primary-brand` are set by `boardVars` and read by nothing. *Judgment:* deleting them changes the
  brief's output; keep any the brief is meant to hand to builders.
- **E5. Halftones drawn as thousands of SVG circles:** riso-print board 4,936 `<circle>` (5,128 nodes;
  deck 10,457 nodes, 124–131 ms), xerox 2,572 circles (deck 91 ms), pixel-arcade 835 `<rect>`. Fix: one
  `<pattern>` fill per dot size (or one `<path>`). *Judgment* (visual match, html2canvas export).

### css/aesthetics/*.css (dead selectors, verified in-page and by grep)
- **C1. Button-state rules for aesthetics whose states are swatches or custom** (the `.is-hover` /
  `.is-pressed` half of each rule list; keep the `:hover` half): `holo-iridescent.css:115`,
  `xerox.css:150`, `ascii-art.css:193`, `religious-futurism.css:135`, `cybersigilism.css:141`,
  `wabi-sabi.css:144`, `dark-academia.css:130`, `curio-cabinet.css:118`. *Mechanical.*
- **C2. Editorial Serif default-panel rules** after its own `panels.panel` markup replaced them:
  `.ab-fieldlabel` `:191`, `.ab-input` `:192-197`, `.ab-status` `:203`. ~13 lines. *Mechanical.*
- **C3. Cover-band rules made dead by `coverBand: false`:** `frutiger-aero.css:324-325, 335`
  (`.pt-deck-band` half), `gummy.css:252-253` (`.pt-deck-band` half). *Mechanical.*
- **C4. Other never-matching rules:** `naive-doodle.css:273` (`[data-stage="pattern"]`, no
  `materialStage`) and `:288`; `art-nouveau.css:238, 240`; `dark-academia.css:249, 262`;
  `gorpcore.css:278`; `old-web.css:274`; `retro-futurist.css:144`; `blob-tracking.css:112`
  (`.bta-tab.is-in`, never set); `bento-grid.css:150` (`.ab-sw-print`, bento never prints a primary);
  `mixed-type.css:262` (`.ab-disc`); `xerox-punk.css:105`; the `.idv em` part of
  `industrial-device.css:67`. Not dead: `.ab-hl` in `xerox-punk.css:66` and `acid-graphics.css:80`
  (the blend probe uses them). *Mechanical.*
- **C5. The last mask:** `radical-memphis.css:200` `-webkit-mask: none` resets a mask nothing sets.
  Delete. *Mechanical.*
- **`!important` per file (occurrences):** pirate-broadcast 14, gummy 13, frutiger-aero 12,
  xerox-punk 12, ascii-art 9, corporate-vandalism 9, wabi-sabi 9, curio-cabinet 8, dark-academia 8,
  editorial-serif 8, micrographics 8, neo-deco 8, religious-futurism 8, bento-grid 7, others 0–6;
  48 files total 259. Framework: blend.css 134 (by design, it must beat any aesthetic; see its header),
  aesthetic-board.css 12, brand-deck.css 5. No finding beyond C1–C4; noted for the record.

### Docs
- **Doc1. README is a round behind:** `README.md:78` says "one of twenty aesthetics" (48), and the blend
  feature is not mentioned anywhere in README. *Mechanical.*
- **Doc2. `docs/brand-deck.md:127-134` documents `deckGoreReport(slideEl)` "(js/brand-deck.js)"** with
  `.stats.contrastSkipped`; no such function exists in the tree. Delete the section or point it at
  wherever the detector now lives. *Mechanical.*
- **Doc3. `docs/round6/ROLLBACK.md` tag table** lists `r6-0-baseline` and `r6-2-blend` only; the repo
  also has `r6-3-new-aesthetics` and `r6-5-harsh-fixes`. *Mechanical.*

### tests/run.js — risky logic with no test (one best test each)
Already covered and passing: fixed colourways (all seven), `layout.order` / `sectionOrder`
normalisation, blend validation, kill switch.
- **T1. Hook fallbacks.** Load aesthetic-board.js + brand-deck.js in the vm; assert
  `abHookHtml(def, () => { throw 1 }, {}) === ''`, `abHookHtml(def, () => 42, {}) === ''`,
  `bdCallHook({ key: 'x', deck: { product() { throw 1 } } }, 'product', {}) === ''`, and `bdMark` with a
  throwing `marks` returns the default `01`. (Guards M2 and A4.)
- **T2. `bdTextSpills`.** Stub `document.createTreeWalker` / `createRange` in the vm so one word returns
  rects at two different `top`s: expect `true`; one line inside the box: `false`; one line past the box
  with `brokenOnly`: `false`. It drives every cover and headline fit loop.
- **T3. `blendSuite`.** For every base × donor pair (48 × 47) with patterns on: at most 6 entries, no
  family twice, donor first when strength is bold. Needs only engine.js + fit.js + blend.js.
- **T4. `blendRules`.** One base rule "No gradients" and one donor rule "Use gradients" with color
  granted: base rule dropped, one conflict with `owner: 'donor'`; same pair with color not granted:
  donor rule dropped. Pure function.
- **T5. Font names in `aesthetic-meta.js` exist in `FONTS`.** A typo silently disables "Use
  recommended fonts" and the blend's type channel (`blendTypePair` returns null). Clean today.
- **T6. Undo carries the blend.** With undo-history.js and the brand-session wrappers: push a snapshot
  with a blend, change it, apply the snapshot, expect the original blend back (and `null` for a snapshot
  taken without one). After M1, add: blended `tokens(t, state)` sees the view's fonts.

---

## Cleanup batch (ordered by file; one owner per file)

1. **js/aesthetic-board.js** — M2 (guard art/headline/tokens/canvas/printPrimary), M4 (add
   `abWeights` / `abWeight` / `abWeightNear`), M1 (`tokens(t, state)` at `:234`), A2 (escape logo),
   A4 (single hook runner), A6 (comment), B4 root-attrs helper *(judgment)*, A1 unused layouts *(judgment)*.
2. **css/aesthetic-board.css** — M3 `content-visibility` on `.cmp-tile`; A1 CSS if removed.
3. **js/blend.js** — B1 delete unused, B2 `bleed` ratio, M1 `donor.tokens(t, state)` at `:353`,
   B3 shared resolver, B4 use the shared root helper.
4. **js/brand-deck.js** — D1 zoom/radius order and batched reads, D2 comments, A4 call `abHookHtml`,
   M2 guard `deckPatternHook` / `deckStageHook` calls.
5. **js/ai-brief.js** — M1 `def.tokens(t, state)` at `:470`, A5 use `abView`, B3 resolver.
6. **js/patterns-ui.js** — A5 use `abView`, E2 inline style.
7. **js/app.js** — E1 null-safe `escapeHtml`.
8. **js/aesthetics/*.js** (one batch, 29 files) — M1 read state from the `tokens` argument, M4 replace
   weight copies, E1 drop private escape helpers, E2 (pirate-broadcast, cyber-hud), E3 (acid-graphics),
   E4 *(judgment)*, E5 *(judgment)*, A3 (cybersigilism, xerox) *(judgment)*.
9. **css/aesthetics/*.css** — C1–C5 (holo-iridescent, xerox, ascii-art, religious-futurism,
   cybersigilism, wabi-sabi, dark-academia, curio-cabinet, editorial-serif, frutiger-aero, gummy,
   naive-doodle, art-nouveau, gorpcore, old-web, retro-futurist, blob-tracking, bento-grid, mixed-type,
   xerox-punk, industrial-device, radical-memphis).
10. **tests/run.js** — T1–T6.
11. **Docs** — README (Doc1), docs/brand-deck.md (Doc2), docs/round6/ROLLBACK.md (Doc3),
    docs/aesthetics-plan.md (if A1/A3 change), docs/blend.md (if B4 changes call names).

Gate for every batch: `node tests/run.js`, and `boardHtml` for all 48 aesthetics in both modes
byte-identical before/after for the mechanical items (the harness the round-6 FW pass already used).

---

## Render timings (ms, headless Chromium, warm, layout forced)

Board = `renderMainBoard` + layout; deck = `renderBrandDeckNow` (10 slides + fit). Sorted by deck.

| Aesthetic | Board | Deck | Board nodes | Deck nodes |
| --- | --- | --- | --- | --- |
| riso-print | 16.3 | 124.3 | 5,128 | 10,457 |
| xerox | 12.3 | 91.3 | 2,982 | 6,173 |
| ascii-art | 6.0 | 86.4 | 965 | 2,696 |
| mesh-gradient | 4.7 | 51.5 | 358 | 925 |
| raw-brutalist | 2.1 | 48.6 | 205 | 590 |
| acid-graphics | 3.6 | 44.9 | 308 | 841 |
| cybersigilism | 4.0 | 41.7 | 192 | 584 |
| blob-tracking | 3.6 | 39.3 | 308 | 813 |
| pixel-arcade | 5.0 | 38.5 | 1,011 | 2,231 |
| xerox-punk | 4.9 | 38.1 | 235 | 697 |
| (38 others) | 2.1–7.5 | 16–38 | | |
| religious-futurism | 3.4 | 30.2 | 284 | 772 |
| biomechanical-gothic | 5.2 | 26.8 | 361 | 729 |
| naive-doodle | 3.3 | 33.7 | 246 | 718 |
| **Compare grid (48 boards)** | **716** | | 22,615 | |

Blended (bold, heavy donor): soft-form × religious-futurism board 4.4 / deck 36.2; editorial-serif ×
biomechanical-gothic 5.6 / 38.6; riso-print × blob-tracking 5.6 / 41.8; bento-grid × cybersigilism
5.0 / 34.4; clay × naive-doodle 6.4 / 39.0. Deck HTML is 0.4–3.9 MB per build (pattern PNG data URLs),
re-parsed on every rebuild; heap stays flat, so no finding.

## Not checked
- The Mac wrapper (`mac/`) and html2canvas PNG/PDF export were not exercised.
- `js/data.js` and `js/aesthetic-meta.js` were checked only for font-name consistency, not reviewed line
  by line; `js/patterns/fit.js` only for the lead table.
- Visual correctness of blends (art crops, probe highlights) is QC-visual territory; 21 of 42 custom
  donor highlights fall back to the accent-ink word by design (`hlPlain`), which this audit did not judge.
