# UI kit rethink (2026-10-18)

## Why
Signl (iOS math app) was built from a Branding Designer brief. The agent put board art into the app: a glass "S" scene on onboarding, a striated pattern behind every header, terrain hero art. Causes: the Built view's Mobile Welcome screen draws `art()` under the top bar (js/see-built.js `mobileOnboard`), the Blend Art row says the art belongs on "Built screens", and the brief's Patterns section says "full-bleed hero background, one per page" with no app/website split. The phone screens are also cramped: a 280px-wide screen with type sized for a larger canvas (27px headline, 13.5px body, `cqw` rules resolving against the phone).

## Outcome
App UI = one shared component kit, styled per aesthetic. Art only on websites.

## Acceptance criteria
1. Mobile app and Settings screens in the Built view contain no hero art, borrowed Blend art, patterns or decorative plates, in every aesthetic and every blend. (W1, W3)
2. Phone screens render at the 390x844 reference with `UI_KIT_PHONE` sizes and margins, then scale down as a whole device, so proportions match a real iPhone. No word splits, no clipped labels, lists end above the tab bar. (W1, W3)
3. A new Built tab "UI kit" draws every `UI_KIT` component and its states in the current aesthetic, plus the phone type scale and colour roles. (W1)
4. Landing page keeps its art. (W1)
5. The brief has a "Building" choice (App / Website / Both, default App). For App: an "App UI rules" section with the `UI_KIT_SURFACES.app.rule`, the full kit component table (every `UI_KIT` item), the phone type scale and spacing; Patterns and art are omitted or marked website-only; the Blend Art row no longer says "Built screens". (W2)
6. `node tests/run.js` still passes. (W2)

## Shared contract
`js/ui-kit.js` (coordinator-owned, done): globals `UI_KIT` (groups of {id, name, use, states}), `UI_KIT_PHONE` (screen, margin, spacing, sizes, type rows), `UI_KIT_SURFACES` (app/web rules). Loaded in index.html before aesthetic-board.js.

## Tasks
| ID | Owner | Writes | Depends |
|---|---|---|---|
| W1 Built view | Opus | js/see-built.js, css/see-built.css, index.html | ui-kit.js |
| W2 Brief | Sonnet | js/ai-brief.js, js/brief-view.js, css/brief-view.css, js/blend.js (Art row string + header comment only), tests/run.js | ui-kit.js |
| W3 Aesthetic CSS | Sonnet | css/aesthetics/*.css (phone rules only) | none |

Integration and verification: coordinator, in the browser preview (port 8090), across dystopian-luxury, mesh-gradient x liquid-glass blend, xerox-punk, mixed-type, corporate-vandalism, soft-form, classic versions.

## Status — shipped 2026-10-18
All acceptance criteria verified in the browser (fresh cache) across all 35 aesthetics, two blends and a classic version: no art in phones or the UI kit tab, no text past the screen, landing keeps its art, logo stays readable (bare, or on white when its dark ink would vanish), Building App/Website/Both persists per brand, App briefs carry App UI rules + 26-item kit + phone type and no band/hero/pattern language, Website briefs unchanged. tests/run.js: 134 pass under a jsc shim; the classic-baseline check needs node (not installed) and did not run.

Open follow-ups: native iOS controls vs custom in the brief; standard screen layouts (onboarding, list, detail, form, settings); dark-mode kit spec; rebuild Signl from a fresh App brief.
