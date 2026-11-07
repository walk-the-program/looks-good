# Aesthetic runtime notes (R0)

How an aesthetic def is consumed, for the spec runtime (B1). All line numbers checked 2026-11-06.
Abbreviations: AB = js/aesthetic-board.js, AI = js/ai-brief.js, BD = js/brand-deck.js, SB = js/see-built.js.

## (a) Def fields and hooks

Every hook runs through `abRun` (AB:39): a throw or non-string HTML falls back and warns once. `this` = the def.
Verified empirically: `registerAesthetic({key,order,name,descriptor,influences})` alone renders board, all 5 Built kinds
(kit, dashboard, mobile, landing, settings), the deck (61 slide nodes, 10 `[data-ae]`) and the brief (49k chars) with zero
console errors or warnings.

| Field / hook | Reader (file:line) | Needed? | If missing |
|---|---|---|---|
| `key` | registry.js:59 (dedupe + store), AB:1160 (tile), root `data-ae` AB:588 | **required** | n/a |
| `order` | registry.js:61 (sort) | **required** for stable order | `NaN` sort; list order undefined. Use a number. |
| `name` | AB:660 (head tag), AB:1100 (`#aeName`), AB:1160 | **required** (shown) | prints "undefined" |
| `descriptor` | AB:690 palette label row, AB:1102, AI:2338 | **required** (shown) | prints "undefined" |
| `influences` | AB:775 footer right, BD:535, AI:2338 | **required** (shown) | prints "undefined" |
| `summary` | AB:1104, AB:1160 tooltip, AI:2332, BD:320 | optional | blank |
| `motto`, `kicker` | `displayMotto` (app.js:369-374), `abKicker` AB:134 | optional | kicker falls back to descriptor; motto to a generic line |
| `mode` | `applyAestheticLook` app.js:120 (`state.bgMode = def.mode`), combos.js:148, onboarding.js:177 | optional | `state.bgMode = undefined` (renders as light: `isDark = bgMode==='dark'`, AB:160). Set `'light'` or `'dark'`. |
| `slideShape` | picked up where a SHAPE_PRESETS key is applied | optional | shape unchanged |
| `labels {material, states[3], statesKind}` | AB:~635 (`def.labels \|\| default`), `abStateNames` AB:141, `abLabelsCtx` AB:608 | optional | default "Touch & depth" / One, Two, Three; `statesKind` `swatch\|button\|chip` else `swatch` (AB:647) |
| `copy {key:{label,text,warm}}` + reserved `state0-2,motto,kicker` | `abCopy*` AB:66-117; registry.js header documents the contract | optional | `abCopy(key)` returns '' and warns once for unknown keys; only call it for declared keys |
| `roles {primary:{use,never,coverage},...}` | `boardRoles` AB:237 via `colorRolesFor` (js/color-roles.js), AI:105/131 | optional | DEFAULT_COLOR_ROLES |
| `layout {hero,palette,sections,subcopy,order,sectionOrder}` | `abLayoutOf` AB:476 | optional | split / swatches / two-col / subcopy on; unknown values fall back. Heroes `split centered poster scene bleed`; palettes `swatches strips chips list`; sections `two-col stacked asym` |
| `type {ui,label,display}` | `abTypeFor` AB:353 -> `--ab-font-ui/-label/--ab-display` (AB:362-385) | optional | `{ui:'body',label:null,display:1}` |
| `highlight` `'ink'\|'band'\|'custom'` (+`highlightNote`) | `abHighlightOf` AB:358, `data-highlight`; AI:91-155 | optional | `'ink'` |
| `canvas(base,state)` -> hex | `boardTokens` AB:158-175 | optional | plain `neutralDark/Light` |
| `printPrimary(t,state)` -> `#rrggbb` | AB:204-218 | optional | brand primary |
| `tokens(t,state)` -> `{--ab-*: v}` | `abTokens` AB:150, merged last in `boardVars` AB:362-397 | optional | `{}` |
| `art(ctx)` -> HTML string | `P.art` AB:665 | optional | empty art cell |
| `headline(ctx,text)` | `abHeadlineH2` AB:279 | optional | default `<h2 class="ab-headline">` with last word in `.ab-hl` |
| `panels {card,panel,list}(ctx)` | AB:753-760 | optional | default `.ab-card/.ab-panel/.ab-list` markup |
| `states(ctx)` -> inner HTML | AB:781 (root `data-states="custom"`) | optional | `statesKind` row |
| `materials [{name,css}]` | AI:333/476 (brief), BD:430 (deck), `abResolveMaterial` AB:574 | optional | brief section empty |
| `rules {do[],dont[]}` | AI:3008, BD:164-174 | optional | deck/brief lack the lines |
| `deck {principles,do,dont,materialStage,marks,radius,coverBand,closingStrip,coverDisplay,coverMin,product,materialArt,patternsStage,...}` | BD:23-32 (index), 159-175, 271-277 | optional | BD derives from `rules` and defaults |
| `ctaFill`, `ctaEdge`, `cardFill`, `cardInk` | AI:105-115, 160-168, 430-444 | optional | brief assumes primary fill / no edge / canvas card |
| `classicOf` | registry.js:58 | internal | see (e) |
| `blend` | set by js/blend.js (`aestheticView`, blend.js:306) | never set by hand | |

Keyed outside the def (optional, missing = graceful):
- `AESTHETIC_META[key]` (js/aesthetic-meta.js:31, `aestheticMeta` :513): family, font pairings, fit. Missing -> `aestheticMeta` null; `followAestheticFonts` (app.js:144) keeps current fonts; `aestheticFamilyOf` null so the family filter hides the style; the Typography recommender shows nothing. A lab style does not need an entry.
- `css/aesthetics/<key>.css` (index.html:12-56) and fonts (`loadFontFamily`, rb-style `rbFonts` in each file).
- Pattern suites / `fit.js` keyed by key; absent = default.

## (b) Minimum viable def (verified clean, no console output)

```js
registerAesthetic({ key: 'zz-min', order: 999, name: 'Min', descriptor: 'd', influences: 'i' });
```
Recommended floor for a real one: add `mode`, `summary`, `labels`, `rules`, `materials`, and `copy` for any text in templates.
It renders as unstyled framework structure (board layout comes from `css/aesthetic-board.css`, scoped `.ab`, which applies to any `data-ae`).

## (c) CSS surface

Root: `<section class="ab" data-ae="<key>" data-mode="light|dark" data-accent-text="ok|low" data-hero data-palette data-sections data-highlight data-states data-subcopy style="--ab-...">` (AB:588, 640). A generated stylesheet scopes everything `.ab[data-ae="<key>"] ...`. Kit/phone screens use `.ab.sb-ab.ab[data-ae="<key>"].sb-kit ...` (see css/aesthetics/raw-brutalist.css:258-269).

Framework CSS vars set inline on the root (`boardVars` AB:362-397): `--ab-canvas --ab-ink --ab-muted --ab-line --ab-primary --ab-on-primary --ab-secondary --ab-on-secondary --ab-accent --ab-on-accent --ab-pri-tint --ab-sec-tint --ab-accent-text --ab-primary-text --ab-accent-ink --ab-accent-mark --ab-font-h --ab-font-b --ab-font-ui --ab-font-label --ab-display --ab-hl-scale --ab-hs --ab-tr`, plus `--ab-primary-brand --ab-on-primary-brand` when a printed primary differs. `tokens()` can add/override any `--ab-*`; `{name}` in `materials[].css` resolves to `t[name]` or `--ab-<kebab(name)>`.

Board classes (AB:620-795): `ab-in ab-head ab-brand ab-mark ab-wordmark ab-logo ab-tag(-pre) ab-rule ab-hero ab-hero-copy ab-kicker ab-headline ab-hl ab-subcopy ab-sub-lead ab-sub-rest ab-art ab-palette ab-labelrow ab-label ab-swatches ab-swatch(data-role) ab-chip ab-sw-role ab-sw-job ab-sw-hex ab-sw-print ab-type* (ab-type-grid/-col/-pick/-fit/-apply/...) ab-sections ab-sec ab-sec-ui/-touch/-use ab-n ab-card ab-seg ab-seg-btn ab-card-title ab-card-body ab-cta ab-cta-label ab-cta-arrow ab-panel ab-fieldlabel ab-input ab-toggle ab-switch ab-status ab-states ab-state ab-state-ctl(is-rest/is-hover/is-pressed) ab-state-chip ab-state-name ab-disc ab-list ab-row ab-row-n ab-av ab-row-name ab-row-status ab-row-bar ab-row-pct ab-foot ab-motto ab-dot ab-infl`. Default focus ring: `.ab-input:focus-visible` in css/aesthetic-board.css.

Kit / Built classes: `.sb-ab .sb-kit` root plus ~400 `sb-k-*` component classes (e.g. `sb-k-btn sb-k-btn2 sb-k-iconbtn sb-k-textbtn sb-k-danger sb-k-pressed sb-k-field sb-k-chip sb-k-card sb-k-callout sb-k-dialog sb-k-sheet sb-k-toast sb-k-tabs sb-k-menu ...`), emitted by SB (list: `grep -o "sb-k-[a-z0-9-]*" js/see-built.js | sort -u`). The shared kit CSS is css/see-built.css and reads the `--ab-*` vars and `--k-*` type vars (`kitVars` SB:1185). Aesthetics only add overrides: the spec runtime can emit zero kit CSS and still get a coherent kit; per-style kit rules are a refinement (memory note: "kit styled per style"). `finish()` SB:1235-1253 copies the style's `.ab-cta` radius, font, case and tracking into the kit (`--sb-r --sb-ui-ff --sb-ui-tt --sb-ui-ls`) and the `.ab-card` radius (`--sb-card-r`), so a generated `.ab-cta` and `.ab-card` rule carry most of the kit look.

## (d) Switching style / mode, and loading lab styles

Load order (index.html): css links 12-56 (`css/aesthetics/<key>.css`), 58-85 classic css; scripts: registry.js 858, aesthetic files 859-903, classic 905-932, aesthetic-meta.js 933, ui-kit.js 935, aesthetic-board.js 936, blend 937, combos 938, ..., app.js 966, see-built.js 977, showcase.js 981. `init()` runs on DOMContentLoaded (app.js:1022) and calls `initAestheticUi(); render()`, which builds the picker from `AESTHETICS`.

A lab script therefore only needs to run before DOMContentLoaded and after registry.js (and after `abCopy` is defined only if it calls hooks at registration, which it should not). Guarded tag, placed after line 932 and before app.js:
```html
<script>if (/[?&]movelab=1/.test(location.search)) document.write('<script src="js/aesthetic-spec.js"><\/script>');</script>
```
(or create the element in a script that appends `<link>` for generated CSS and `<script>` tags synchronously with `document.write`, so they execute before DOMContentLoaded). The runtime can also inject generated CSS with `document.head.appendChild(style)` at registration time.

Console / script calls (verified in headless Chromium; the app opens on the Library view, so first make the editor visible):
```js
document.body.dataset.view = 'editor';                 // library -> editor (hosts #previewCard, #builtView)
chooseAesthetic('acid-graphics');                      // app.js:124: undo step, state.aesthetic, bgMode=def.mode, fonts follow, render()
state.bgMode = 'dark'; render();                       // 'light' | 'dark' (what the Mode radios do, app.js:838)
setBoardView('board');                                 // 'board' | 'built' | 'compare' | 'deck' | 'brief' | 'patterns' (AB:1195)
Show.built('kit');                                     // Built view at 'kit'|'dashboard'|'mobile'|'landing'|'settings' (SB:1692)
renderBrandDeckNow();                                  // deck slides after setBoardView('deck')
```
`chooseAesthetic` is a no-op when the key is already current, so a script also sets `state.aesthetic = key` before `render()`. Setting `state.bgMode` directly never changes `data-mode` for a style that is not forced: `data-mode` always equals `bgMode` (root attrs AB:588); no style forces one mode (`def.mode` is only a default applied on selection), so both modes render for every style. Unknown keys silently fall back to the first aesthetic (`aestheticByKey` registry.js:94), so check `AESTHETICS.some(a => a.key === key)` first.

## (e) Keeping variants out of the picker (classic model)

Classic defs are registered by `registerAesthetic` when `def.classicOf` is set (registry.js:58): they go into `AESTHETICS_CLASSIC[baseKey]`, never into `AESTHETICS`, so the picker (`visibleAesthetics`/`aePickKeys` AB:1052-1070), Compare grid, shuffle, blend donor list and numbering never see them (registry.js:19-21 comment). They are reached only through `aestheticByKey('<key>--classic')` (registry.js:94-101) or `resolveAestheticDef(state)` when `state.aestheticVersion === 'classic'` (registry.js:105-108); the Classic/Current switch is hidden unless dev mode (AB:1125-1135). Generated by dev/make-classic.js with CSS scoped `[data-ae="<key>--classic"]`.

Model for lab rebuilds: (1) never include the lab script/CSS unless `?movelab=1` (the tag in (d)), so the normal app is unchanged; (2) register lab defs under distinct keys (`<key>--lab`), CSS scoped to the same key, so no collision with originals. Choose one:
- **A (no registry edit):** call `registerAesthetic` normally. They appear in the picker only in a `?movelab=1` page, which is the lab's intent. `showcaseFilter` (js/showcase.js:29) hides keys listed in `SHOWCASE_HIDDEN` if a gallery is wanted clean. Compare/shuffle will include them (fine in the lab).
- **B (needs a registry edit, so a coordinator decision):** add an `AESTHETICS_LAB` map and a lookup branch in `aestheticByKey`, mirroring `AESTHETICS_CLASSIC`, to keep lab defs out of Compare/shuffle. Not needed for the proof; do not do it unless asked.
