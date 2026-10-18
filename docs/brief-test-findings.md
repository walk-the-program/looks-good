# Brief test-build findings (baseline, 2026-10-18)

Seven agents built Signl (Welcome, Home, Settings) from the App brief alone. Raw output: scratchpad/b1–b7 (session scratch). Verdict for all six reported so far: tidy, on-spec metrics, but a generic iOS skin; the owner would reject it.

## Root cause
The brief's UI kit tables are style-neutral (generic fill/text/edge per component), while the style's character lives in board recipes (Shape and materials, Do/Don't) that no component maps to and that often contradict the kit or the "no art" rule. "Build from the kit only" makes the neutral kit win.

## Fix direction
1. Kit rows in the brief are generated from the refined UI kit tab as it renders in the style (computed radius, edge, shadow, fill, text colour, face, weight, case, tracking, padding, height, material). What the owner sees in the UI kit tab is exactly what the brief says.
2. Each style shows its signature in the app through components, never art (e.g. Dystopian Luxury: ink-block primary action with the 6px primary square; Pirate Broadcast: cyan Title-row top bar, Fastext tab bar, dotted-leader rows; Xerox Punk: paper-scrap cards with hard offset shadow, stamp badges; Soft Form: raised cards, recessed fields and list wells; Gorpcore: woven-label title, blaze dot on the selected tab, mono units; Mesh × Liquid Glass: glass only on the tab bar and sheets).
3. For App briefs, drop board recipes and Do/Don't lines no component uses, and any rule a kit row contradicts.

## Global brief gaps (all reports)
- Light/dark: "default look is light" vs `light-dark()` + follow system. State: `color-scheme: light`; dark only via `prefers-color-scheme: dark` or `[data-theme=dark]`.
- Paste the full `:root` token block; never refer to tokens.css.
- Status bar 54pt inset, home indicator 34pt, top bar 44pt; at rest the top bar shows back and icons, the title appears there after scroll.
- Icon spec: 24pt icons, stroke per style, chevron = 16pt icon (never a text glyph), tab bar = 24pt icon over 10pt label; list the glyphs needed.
- Spacing scale must include 28 (section gap).
- Highlight word: exactly one word, the last word of the Large title, `white-space: nowrap`, padding 0 .1–.2em.
- Primary colour budget: once per screen on the single action where the style says so; selection, toggles, tabs, focus use ink.
- Content density: list screens show ≥6 rows; Settings ≥3 groups; Settings is a tab (shows the tab bar).
- On-card colours: give `--card-ink` / `--card-muted` when the card ground differs from canvas.
- One definition per thing (pressed, focus ring, toggle size, corner set, slider fill) — no duplicates across States, Motion, recipes.
- Remove noise for App: App icon prose in screens, "Target: Web" when iOS rules are described, Increase Contrast/Reduce Transparency lines that apply to nothing, board tokens (`--ab-*`) without a use.
