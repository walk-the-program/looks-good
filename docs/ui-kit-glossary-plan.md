# UI kit: every NN/g glossary element (2026-10-31)

## Outcome
The Built view's UI kit tab draws all 61 elements of nngroup.com/articles/ui-elements-glossary as 65 `UI_KIT` items (39 new), and every style in `css/aesthetics/` gives each new component its own treatment, not just the shared default.

## Acceptance criteria
1. Every `UI_KIT` id has a `KIT_SPEC` drawing in every listed state; a "Glossary coverage" section maps all 61 terms to their items. (G0)
2. The brief has an `aibKitRowData` row and `AIB_KIT_PARTS` entry per id; App-only briefs drop `web: true` items. (G0)
3. Each of the 45 `css/aesthetics/*.css` files styles every new component in that style's own language (edges, corners, shadow, type case and tracking, texture, fills), scoped like its existing kit rules. (S1-S14)
4. No art, no colour outside the palette tokens, nothing escapes its kit cell, no horizontal overflow. (all)
5. `node tests/run.js` passes; coordinator checks the kit in the browser across a sample of styles. (G0, coordinator)

## Markup contract (rev 1) — class names G0 must emit and S1-S14 style
Shared: `.sb-k-ph` content placeholder tile (token tint + centred icon). `.sb-k-cmdmenu` is added to `.sb-k-menu` for command menus: `li` = icon + label + optional `.sb-k-kbd` shortcut; `li.is-danger`; `li.sb-k-menu-sep` separator; `li.has-sub` (chevron) / `li.is-open`. `.sb-k-popbox` = bounded box holding a trigger and an anchored floating panel. `.sb-k-pop-arrow` = arrow on any anchored panel. `.sb-k-fabbox` = bounded content area that floating buttons sit in.

| id | markup |
|---|---|
| btn-split | `.sb-k-split` > `button.ab-cta.sb-k-btn.sb-k-split-main` + `button.ab-cta.sb-k-split-more` (chevron); open adds `.sb-k-menu.sb-k-cmdmenu` |
| fab | `.sb-k-fabbox` > `button.sb-k-fab` (plus icon; pressed `.sb-k-pressed`) |
| link | `p.sb-k-para` with `a.sb-k-link` (`.sb-k-pressed`, `.sb-k-focus`) |
| icon | `.sb-k-icons` > `.sb-k-icon` (svg + `span` label), sizes 20 / 24 / 28 |
| combo | `.sb-k-combo` > `.ab-fieldlabel` + `.ab-input.sb-k-combo-in` + (open) `.sb-k-menu` with `mark.sb-k-match` |
| listbox | `ul.sb-k-menu.sb-k-listbox[role=listbox]` > `li[aria-selected]`; multiple: each li leads with `.sb-k-box` |
| stepper | `.sb-k-stepper` > `button.sb-k-step` (minus) + `output.sb-k-step-val` + `button.sb-k-step` (plus); minimum: minus `disabled` |
| knob | `.sb-k-knob` (`--v` 0-1) > `.sb-k-knob-arc` + `.sb-k-knob-dial` > `.sb-k-knob-ind`; `.sb-k-knob-val` |
| date-field | `.sb-field.sb-k-field.sb-k-datefield.is-{st}` > `.ab-fieldlabel` + `.ab-input` + `.sb-k-date-ico` |
| calendar | `.sb-k-cal` > `.sb-k-cal-head` (title + `.sb-k-plain` prev/next) + `.sb-k-cal-grid` > `.sb-k-cal-dow` + `button.sb-k-day` (`.is-today`, `.is-sel`, `.is-range`, `.is-start`, `.is-end`, `.is-out`) |
| wheel, wheel-date | `.sb-k-wheel` > `.sb-k-wheel-col` > `.sb-k-wheel-item` (`.is-sel` centre) + `.sb-k-wheel-band` |
| accordion | `.sb-k-accordion` > `details.sb-k-acc` > `summary.sb-k-acc-sum` (+ `.sb-k-acc-chev`) + `.sb-k-acc-body` |
| carousel | `.sb-k-carousel` > `.sb-k-car-track` > `.ab-card.sb-k-car-card` (with `.sb-k-ph`) + `.sb-k-dots` > `i` (`.is-on`) |
| matrix | `.sb-k-matrix` > `.sb-k-mx-row` > section label + `.sb-k-mx-track` > `.sb-k-mx-tile` (with `.sb-k-ph`) |
| overlay | `.sb-k-overlaybox` > screen content + `.sb-k-scrim` |
| dialog | `.sb-k-sheetbox.sb-k-dialogbox` > `.sb-k-dialog[role=dialog]` > `.sb-k-dialog-t`, `.sb-k-dialog-b`, `.sb-k-dialog-a` (buttons) |
| side-sheet | `.sb-k-sheetbox.sb-k-sidebox` > `.sb-k-side` |
| popover | `.sb-k-popbox` > trigger + `.sb-k-pop` (+ `.sb-k-pop-arrow`) |
| popup-tip | `.sb-k-popbox` > trigger + `.sb-k-tip` (title, body, `.sb-k-textbtn` "Got it", `.sb-k-pop-arrow`) |
| tooltip | `.sb-k-popbox` > trigger + `.sb-k-tooltip[role=tooltip]` (+ `.sb-k-pop-arrow`) |
| lightbox | `.sb-k-lightbox` > `.sb-k-lb-img.sb-k-ph`, `.sb-k-lb-close`, `.sb-k-lb-prev`, `.sb-k-lb-next`, `.sb-k-lb-cap` |
| navbar | `nav.sb-k-navbar` > `.ab-brand` + `.sb-k-nb-links` > `a` (`aria-current`) + small `.ab-cta` |
| nav-menu | `nav.sb-k-navmenu` > `a.sb-k-nm-item` (icon + label; `aria-current="page"`) |
| drawer | `.sb-k-sheetbox.sb-k-drawerbox` > `.sb-k-drawer` (brand + `.sb-k-navmenu`) |
| breadcrumbs | `nav.sb-k-crumbs` > `ol` > `li` > `a` or `span[aria-current=page]`; `.sb-k-crumb-sep` |
| anchor | `nav.sb-k-anchors` > label + `a` (`.is-on`) |
| back-top | `.sb-k-fabbox` > `button.sb-k-backtop` |
| scrollbar | `.sb-k-scrollbox` (content) + `.sb-k-sbar` > `.sb-k-sbar-thumb` |
| dropdown-menu | `.sb-k-ddwrap` > `button.ab-type-apply.sb-k-btn2.sb-k-dd` + (open) `.sb-k-menu.sb-k-cmdmenu` |
| context-menu | `.sb-k-ctxbox` > target + `.sb-k-menu.sb-k-cmdmenu.sb-k-ctx` |
| submenu | `.sb-k-subwrap` > two `.sb-k-menu.sb-k-cmdmenu` side by side; parent `li.has-sub.is-open` |
| expandable-menu | `nav.sb-k-navmenu.sb-k-expmenu` > items + `.sb-k-nm-children` |
| megamenu | `.sb-k-mega` > `.sb-k-navbar` + `.sb-k-mega-panel` > `.sb-k-mega-col` (`.ab-label` + links) |
| menubar | `.sb-k-menubar[role=menubar]` > `button[role=menuitem]` (`aria-expanded`); open adds `.sb-k-menu.sb-k-cmdmenu` |
| ribbon | `.sb-k-ribbon` > `.sb-k-tabs` + `.sb-k-rb-groups` > `.sb-k-rb-group` > `button.sb-k-rb-btn` + `.sb-k-rb-label` |
| pie-menu | `.sb-k-piebox` > `.sb-k-pie` > `.sb-k-pie-hub` + `button.sb-k-pie-item` x6 (`.is-on`) |
| spinner | `.sb-k-spinner[role=status]` > `.sb-k-spin` ring + label |
| skeleton | `.sb-k-skel` > `.sb-k-skel-av`, `.sb-k-skel-line`, `.sb-k-skel-block` |

## Tasks
| ID | Owner | Writes | Depends |
|---|---|---|---|
| G0 build | Sonnet | js/see-built.js, css/see-built.css, js/ai-brief.js, tests/run.js | ui-kit.js (done), contract rev 1 |
| S1-S14 per-style | Sonnet x14 | 3-4 files each in css/aesthetics/ (disjoint) | contract rev 1 |
| Integration | coordinator | selector cross-check, browser check, commit | all |

## Status — shipped 2026-10-31
All criteria met. 65 kit items draw in every state; the Glossary coverage section maps all 61 NN/g terms. Every one of the 45 style files styles all 39 new components. `dev/kit-style-check.js` (headless, no windows) toggles each style's file on and off and confirms every new component changes, nothing overflows or leaves its cell, and the page throws no errors: 73 runs (45 styles + 28 classic versions) clean. `node tests/run.js`: all passed.

Checker note: for a classic run it toggles `css/aesthetics/classic/<key>.css`, but most classic kit rules live in the main style file under an `:is(..., --classic)` scope, so classic "unstyled" lists are not meaningful; classic overflow and outside-cell checks are.

Rerun: `PLAYWRIGHT_PATH=<dir>/node_modules/playwright node dev/kit-style-check.js --out <dir> [--only a,b] [--no-shots]`.
