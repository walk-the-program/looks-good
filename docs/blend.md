# Blend: two aesthetics in one brand

A brand can blend any two aesthetics. The board, the brand deck, the Patterns view and the AI brief
all show the blend; it saves with the brand, every change is one undo step, and one constant turns
the feature off. Nothing is hand-tuned per pair, so a newly registered aesthetic works as a base or
a donor straight away.

## The model

- `state.aesthetic` is the **base**. It owns structure: layout, components, CSS scope
  (`.ab[data-ae="<base>"]`), the default mode, and every accessibility rule.
- `state.blend` is `null` or `{ with: <donor key>, strength, channels }`. The **donor** supplies only
  the channels that are on: `{ art, type, color, patterns, material }` (booleans).
- Strength presets: **Subtle** = art + patterns, **Balanced** = art + type + patterns, **Bold** = all
  five. Toggling a channel makes the strength `custom`. The strength is always re-derived from the
  channels, so the two never disagree.
- A blend cannot use the base as its donor. The UI leaves the base out of the list, and choosing the
  donor as the new base clears the blend (Undo brings it back).

## One entry point

`aestheticView(state)` in `js/blend.js` returns `{ state, def, blend }` for every render surface:

- No active blend: the same `state` object and `aestheticByKey(state.aesthetic)`, so unblended output
  is byte-identical to before (the 144-brief harness, now 192, diffs clean against the pre-blend code).
- Blended: `def` is a shallow copy of the base def with the donor's granted hooks swapped in and a
  `def.blend = { base, donor, strength, channels, typeFrom, typeLocked, conflicts, donorRules }`
  record; `def.key` stays the base's. `state` is a copy with the donor's fonts when type is supplied.

Callers: `renderMainBoard` / `renderAestheticBoard` (via `abView()` in `js/aesthetic-board.js`),
`renderBrandDeckNow` (`js/brand-deck.js`), `buildAiBrief` / `buildPatternsBrief` / `buildPatternItemBrief`
(via `abView(state)` in `js/aesthetic-board.js`, which `buildAiBrief` calls), and the Patterns view (`js/patterns-ui.js`). Compare all renders
each aesthetic on its own, unblended.

## Channels

| Channel | What changes | How |
| --- | --- | --- |
| Art | The donor's `art(ctx)` fills the base's art box (board hero, deck cover, Material slide) and is cropped by it. | `def.art` returns a nested scope `<div class="ab ab-blend-art" data-ae="<donor>">` with the donor's `tokens(t)` inline, holding `<div class="ab-art ab-blend-inner">`. The donor's own CSS matches inside it; `css/blend.css` strips the scope's root surface (padding, background colour, radius, frame, pseudo layers) and makes the inner box fill the base box. The art reads the same `ctx.t` tokens, so it is drawn in the brand's palette roles. |
| Type | The donor's first recommended pairing (unless typography is locked), its interface/label face choices (`def.type`), its display scale and `typeNotes`, and its headline casing, tracking, weight, style and leading. | Fonts: view state copy + `--ab-font-h/-b` on the root. Treatment: read from a hidden probe board in the donor's scope with the same tokens (`blendProbe`), applied as `--blt-*` vars under `.ab[data-blend-type]`. Locked typography keeps the brand's fonts (the UI and brief say so); the casing/tracking treatment still applies. The board's Type block shows the donor's recommendation, "from the blend", with no apply button. |
| Color | The donor's highlight word, canvas tint and printed primary. | `def.highlight / highlightNote / printPrimary / canvas` from the donor. A `custom` donor highlight is copied from the probe's computed `.ab-hl` style (`--blh-*` vars). Base mode wins; a donor canvas that drops ink under 4.5:1 falls back to the base canvas. |
| Patterns | The suite interleaves both systems, 3 + 3, never the same family twice. | `blendSuite(def)`. The donor leads when the blend is Bold or patterns is the donor's only channel; otherwise the base leads. Used by the deck's Patterns slide, cover band, closing strip, the Patterns view and the brief. |
| Material | The donor's material recipes as the 02 states row, the donor's material label, and its ornament layer behind the 02 panel. | `P.states` renders up to three donor `materials` (recipes that paint a background, visible ones first) as samples inside small donor scopes; `P.panelPre` lays a donor scope (`ab-blend-orn`) behind the panel so the donor's root textures (grain, grids, frames) show through. The base's field, toggle and panel keep their structure. The brief lists the donor's recipes, filled in from the donor's variables. |

Naming: `def.name` is "Base × Donor" (board header, deck cover meta and footer, workspace header,
brief title). Descriptor: two base words + one donor word. Kicker: "base kicker × donor kicker".
Influences: two base + one donor. The motto and principles 01–02 stay the base's; principle 03 and
one do / don't line come from the donor's kept rules.

## Conflict rules

- Base wins on structure and accessibility; the donor wins only inside its granted channels.
- Rules: `blendRules` keeps every base rule and adds up to three donor do / don't rules that touch a
  granted channel. Each rule's first clause is tagged with topics (gradients, the accent, shadows,
  texture, letter case, typefaces, corner radius, borders, layout, legibility, ...). Each topic has an
  owner: a channel, or `base` for structure and accessibility. When a base rule and a donor rule share
  a topic, the owner's rule stays and the other is dropped; the brief lists every drop under
  "Resolved conflicts".
- Contrast: body text keeps 4.5:1 (canvas guard). A donor highlight that would not read on the base
  canvas (under 3:1), or that the donor draws only with pseudo-elements, falls back to the accent-ink
  word (`data-blend-hl="ink"`).

## Robustness fallbacks

- Donor art captions that would sit under the base's copy (a base whose art is a background layer)
  are hidden after layout (`blendClearArtText`, visibility only).
- Where the base's art box takes its height from its content, the donor art uses its own ratio but
  never squarer than 3:2 on a board or 16:9 on a slide. A base that dissolves its art box
  (`display: contents`) gets the donor art as a grid item, capped at 300px tall on slides (`blendFitArt`).
- Donor headline hooks (`def.headline`) and highlight pseudo-elements are not carried: they depend on
  the donor's DOM. The probe carries what computed style can express.
- Descriptive `url(...)` placeholders in material recipes are neutralised in samples, so nothing 404s.
- Deck fit (in `js/brand-deck.js`, applies to every deck): headlines and type samples also shrink
  until no word breaks mid-word (`bdTextSpills`), and a type sample whose size an aesthetic pins
  shrinks inline.

## UI

Aesthetic panel, under the family filter: **Blend with** opens a searchable list of the other
aesthetics (same tiles, current base excluded, "None" clears). Arrow keys move through the list,
Enter picks, Escape closes. When a blend is on: Subtle / Balanced / Bold, five channel toggles
(at least one stays on) and a one-line note. **Surprise blend** picks a random donor and strength,
respects the aesthetic lock and is one undo step.

## Persistence and undo

- `serializeState` writes `blend` as a copy (`null` when there is none). `applySavedSessionToState`
  validates it with `normalizeBlend(raw, baseKey)`: unknown donor, donor equal to the base, a
  non-boolean channel, channels that are not an object, or no channel on load as `null`. Brands saved
  before blends load with `null`.
- Undo snapshots carry a copy of `state.blend` (`js/brand-session.js`). Every blend change pushes
  exactly one snapshot.

## Kill switch

`const BLEND_ENABLED = true;` at the top of `js/blend.js`. Set it to `false` and: the Blend control
stays hidden, `blendActive()` returns null so the board, deck, Patterns view and brief render the base
alone, and saved blends still load, validate and save back unchanged. `tests/run.js` checks this by
loading `js/blend.js` with the constant flipped.

## Files

- New: `js/blend.js`, `css/blend.css`, `docs/blend.md`.
- `index.html`: the Blend control markup in the Aesthetic panel, `css/blend.css` after the other
  stylesheets, `js/blend.js` after `js/aesthetic-board.js`.
- `js/aesthetic-board.js`: `abView()`, `P.states` / `P.panelPre` split out of `P.panel`, the
  `blendParts(P)` call at the end of `abBoardParts`, the Type block's `typeFrom`, `blendClearArtText`
  after the board renders, `syncBlendUi` / `initBlendUi` calls.
- `js/brand-deck.js`: the deck renders `abView()`; `bdTextSpills` in the headline, sample and cover
  fits; `blendFitArt` / `blendClearArtText` calls in `bdFitDeck`.
- `js/patterns-deck.js`, `js/patterns-ui.js`: suite from `blendSuite`, tokens and fonts from the view.
- `js/ai-brief.js`: `abView(state)`, the "## Blend" section, title, donor materials and variables, the
  blended suite and type recommendation.
- `js/persistence.js`, `js/brand-session.js`, `js/app.js`: save / load / validate, undo snapshots,
  `state.blend` default, base-equals-donor clears.
- `tests/run.js`: serialize / apply / validation and kill-switch tests.

## Removing it entirely

1. Delete `js/blend.js`, `css/blend.css`, `docs/blend.md`.
2. `index.html`: remove the `<!-- Blend with a second aesthetic ... -->` block and the two tags.
3. Every call site is guarded with `typeof … === 'function'`, so the app already runs without
   `blend.js`. To clean up: drop `abView` in favour of `aestheticByKey(state.aesthetic)`,
   the `blendParts` / `blendClearArtText` / `blendLegibility` / `blendFitArt` / `blendSuite` / `blendBriefLines` /
   `blendDonorTokens` / `syncBlendUi` / `initBlendUi` lines, the `blend` lines in persistence,
   brand-session and app.js, the `fromBlend` branch in `abTypeBlockHtml`, the `typeFrom` line in
   `aibTypeRecommendation`, the `matDonor` lines in `buildAiBrief`, and the blend block in `tests/run.js`.
   `P.states` / `P.panelPre` and `bdTextSpills` can stay; they are neutral without a blend.

## Round 6 cleanup notes
- `blendDonorTokens(donor, t, state)`, the donor's `canvas` / `printPrimary` and the base's `canvas` inside a blend all receive the view state, so a donor's weights follow the faces on the board (type channel). Every donor hook runs through the shared safe runner (`abRun`): a throwing donor hook costs only that piece.
- Root attributes are written once by `abRootAttrs` (board root, donor scope, probe); the style string by `abStyle`; the material placeholder resolver is `abResolveMaterial` (a blend sample paints `transparent` for a missing name).
- `BL_HERO_RATIO` has a `bleed` entry (21 / 8). `BLEND_STRENGTHS` and `blendSuiteFor` were unused and are gone.
- `blendLegibility(root)` runs after layout (board, and the deck after its fit): a canvas plate (`data-bl-scrim`, `--bl-scrim`, css/blend.css) behind a headline the base lays over the donor's art, and a contrast check on the highlight word against the ground it actually sits on (3:1, else the headline colour, ink, black or white).
  Round 6 final sweep: any intersection of the donor art box and a headline counts (it used to need 20% of the headline's area; a 59px overlap left Bauhaus × Riso's "ALIVE" on the halftone). The plate is the canvas or the ink, whichever the copy reads on (Editorial Serif sets its copy in the canvas colour for its own dark art: 1.00:1 on a canvas plate); when the kicker and subcopy also sit on the art in such a colour, the whole `.ab-hero-copy` gets the plate (`data-bl-plate`). A pseudo-element counts as an existing plate only when it is as big as the copy (Neo Deco's framed veil does, Bauhaus' top rule does not). On the board, a base that seats a plated copy over most of its art (Neo Deco, Liquid Glass) gets `data-bl-reflow` on the hero: the art moves into the flow under the copy at the donor's ratio. Art that its own board lets run above its box (Naive Doodle's "made by hand!" note, above its svg viewBox) is scaled down about its bottom edge (`--bl-art-fit`, `data-bl-fit`) so its top is never cut. A segmented button or CTA the blend fills with another colour gets the neutral that reads 4.5:1 on it (`data-bl-onfix`). At ≤600px a donor's "prints as" line stays in the swatch's text column.
- Verified: a 24-blend sweep (board at 1100px and 390px, bold and balanced) with overflow, flat-ground text contrast and headline-over-art checks.
