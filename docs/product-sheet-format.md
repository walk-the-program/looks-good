# Product sheet format (Phase 2 contract, rev 3)

A product sheet tells Branding Designer what app the brand is for: its screens, what each one is for, and the real content on them. Branding Designer draws each screen in the current aesthetic, the owner approves each one, and the App brief carries a Screen spec per approved screen. Spec: [design-translation-spec.md](design-translation-spec.md), part C.

The sheet is a Markdown file that lives in the product's own repo (Signl: `~/Desktop/Signl/docs/design/product-sheet.md`). It is loaded into Branding Designer by file pick or paste.

## Grammar

```markdown
# Product: Signl
Purpose: Fast mental math that feels like a feed but leaves you sharper.
Core action: Start a two-minute sprint.
Tabs: Home, Modes, Stats

## Screen: Home
Job: Show I'm improving and get me into a run in one tap.
Primary action: Start sprint
Chrome: tabbar
Fold: Rating, Start and Daily fit above the tab bar at default text size.
Signature: tab bar
Content:
1. hero-numeral: 1,482 | label: Arithmetic rating | meta: +60 this week
2. text: 12-day streak · 3 runs today
3. chart: rating trend | points: 1310,1350,1342,1400,1420,1482
4. action: Start sprint | meta: 2:00 · Arithmetic
5. card: Daily · ready | meta: 20 questions
6. list: Suggested next | rows: Drill your slowest — 7×8, 15% of 340 — 1:00
States:
- Empty: New player. Welcome headline, Take placement as the only primary action.
- Loading: none; all data is on the device.
- Error: none.
- First run: Getting-started line under the action: 0 of 3 steps.
```

Rules:

- `Platform: iphone | mac` is an optional product-level line (default `iphone`; case-insensitive; `macos` reads as `mac`). Anything else warns with its line number and falls back to `iphone`. See "Mac platform" below.
- `# Product: <name>` is required. `Purpose:`, `Core action:` are required. `Tabs:` is optional (comma list; screens whose name matches a tab show the tab bar with that tab selected).
- Each `## Screen: <name>` starts a screen. Required lines: `Job:`, `Primary action:` (or `none`), `Content:` with at least one block. Optional: `Chrome:` (`tabbar` | `topbar` | `none`, default `topbar`), `Fold:` (free text), `Signature:` (free text: where this style's signature lands on this screen, or `none`), `States:` (bullets `- Empty:`, `- Loading:`, `- Error:`, `- First run:`; missing ones are `not specified`).
- Content blocks are numbered in priority order (1 = most important). Each is `N. <type>: <main text> | key: value | key: value`.
- **Rank is importance, not position.** The comp draws blocks top to bottom in rank order, except blocks with `pin: bottom`. Those sit in a bottom bar above the home indicator or tab bar, and stay visible above the fold.
- Unknown lines are kept in `notes` and shown, never dropped silently. A parse problem returns a warning with the line number; it never throws.

### Block types

| Type | Main text | Keys | Draws as (UI kit) |
| --- | --- | --- | --- |
| `title` | Large title | `highlight` (one word) | Large title, highlight word per the style |
| `hero-numeral` | The number or question | `label`, `meta` | Oversized numeral, label above or below, meta chip |
| `text` | Body line | `muted: yes`, `size: large` (Title size, for a typed answer or a key line) | Body, caption or title |
| `action` | Button label | `meta`, `pin: bottom` | The one primary button |
| `action-secondary` | Button label | `meta`, `pin: bottom` | Secondary button |
| `link` | Link label | | Text link |
| `card` | Card title | `meta`, `body` | Card |
| `list` | Group label | `rows` (`;`-separated; `—` splits title — value — detail; a row that starts with `>` is the selected row) | List group with rows; the `>` row gets the style's selected list-row treatment |
| `stats` | Group label | `items` (`;`-separated `Label = Value`) | Stat row / tiles |
| `chart` | Caption | `points` (comma numbers) | Sparkline in the style's chart colour |
| `segmented` | Group label | `options` (`;`), `selected` | Segmented control |
| `toggle` | Row label | `on: yes/no`, `meta` | Toggle row |
| `field` | Field label | `value`, `placeholder` | Input field |
| `keypad` | (empty) | `keys` (default `1 2 3 4 5 6 7 8 9 . 0 ⌫`); always pinned to the bottom | Number keypad grid from kit keys/buttons |
| `tiles` | Caption | `values` (comma; 0–1 each) | Tile strip in tonal steps |
| `chord` | Caption (optional) | `items` (`;`-separated `label = weight = #colour`), `labels` (`inside` default, `below`, `none`), `orient` (`horizontal` default, `vertical`), `column` (Mac only) | One bar split by weight, each segment in its own content colour |
| `callout` | The message | `tone` (`info` default, `success`, `warning`, `error`), `action` (label of an inline text button) | Callout, tinted and iconed per tone; `error` reads as an alert |
| `progress` | Label | `value` (0 to 1), `meta` (right-hand text; default is the percent) | Progress bar with its label row |

Inline in any block's main text, in `rows` and in `meta`: `~~text~~` draws as struck-through text (`<del>`). The text is escaped first, so only the tildes carry meaning.

```markdown
6. list: History | rows: > Today 9:41 — Pramand call — 12 min; Yesterday — Notes; ~~Mon~~ Tue — Standup
7. callout: Sync paused until you reconnect | tone: warning | action: Retry
8. progress: Uploading 3 files | value: 0.62 | meta: 2 of 3
9. text: ~~um~~ the plan is simple
```

### Chord blocks

A `chord` draws one bar split by weight, each segment in its own colour: an accord chord, a palette, a time-ordered set of notes. Colours are the content's, so they are the same in light and dark mode.

```markdown
3. chord: Accords, by weight | items: aromatic = 100 = #5E9C76; vanilla = 85 = #F2E3B3; woody = 45 = #8B5A2B | labels: inside
4. chord: Top | items: Rosemary = 1 = #5e9c76; Basil = 1 = #5e9c76; Mandarin = 1 = #f4d23c | labels: below
5. chord: | items: aromatic = 100 = #5e9c76; vanilla = 85 = #f2e3b3 | labels: none | orient: vertical | column: side
```

- **Items:** each item is `label = weight = #colour`; the three parts may come in any order. A part that is `#rgb` or `#rrggbb` is the colour, a number above 0 is the weight, the first remaining part is the label. A missing weight is 1. A missing or invalid colour is drawn in the style's tonal steps (the style primary, 85% stepping down to 25% across those segments, with the style's ink). Warnings (with line number): no items, an item with no label, a weight that is not a number above 0 (uses 1), a colour that is not `#rgb`/`#rrggbb` (tonal steps), `labels` not `inside | below | none` (uses `inside`), `orient` not `horizontal | vertical` (uses `horizontal`).
- **`labels: inside`** (default): a 48 px bar with the style's radius and edge; each label sits bottom-left in its segment. The label ink is `#111111` or `#ffffff`, whichever has the higher WCAG contrast with the segment colour. When any label does not fit its segment, the bar drops its inside labels and shows them all as a key of swatches under the bar; labels are never cut short or spilled.
- **`labels: below`:** separate tiles (44 px, 4 px gaps, the style's radius and edge), each label under its own tile in the style's muted ink, wrapping when long. Good for equal-weight note bands.
- **`labels: none`:** a thin 20 px strip, no text.
- **`orient: vertical`:** segments stack top to bottom by weight across the column's width (`below` reads as `inside`). On a Mac window, a vertical chord that is the last block of its column fills the column down to 40 px above the 800 px fold (never under 160 px, and it does not grow when the window is taller). Anywhere else, and on iPhone, it is a fixed 280 px.
- Gap above a chord is the wide section gap, or the standard gap straight after another chord.

An unknown block type warns with its line number and the line is kept in the screen's `notes`. The blocks around it keep their order and rank (1 to N over the blocks that were kept), and a missing number from the dropped line does not warn.

## Data model (what the parser returns)

```js
parseProductSheet(text, sourceName) → {
  product: {
    name, purpose, coreAction, platform: 'iphone' | 'mac', tabs: ['Home', …],
    screens: [{
      id: 'home',            // slug of name, unique
      name: 'Home', job, primary: 'Start sprint' | null,
      chrome: 'tabbar' | 'topbar' | 'none',   // mac: 'sidebar' | 'toolbar' | 'none' fold: string | null, signature: string | null,
      blocks: [{ rank: 1, type: 'hero-numeral', text: '1,482', props: { label: '…', meta: '…' } }, …],
      states: { empty, loading, error, firstRun },   // strings; 'not specified' when absent
      notes: [string],
    }],
    source: sourceName, raw: text,
  },
  warnings: [{ line, message }],
}
```

Globals (in `js/product-sheet.js`): `parseProductSheet`, `productScreenSig(state, screen)` and `productApprovalStatus(state)`.

- `productScreenSig` is a short stable hash of the screen's JSON plus the look: `aesthetic`, `blend`, `colors`, the heading and body font names, `scheme` and `typography`.
- `productApprovalStatus` returns `{ total, approved, stale, pending, allApproved }`.

## Mac platform

With `Platform: mac` each screen is drawn as a Mac app window, from the same kit pieces and block types as an iPhone screen, in the current look.

- **Window:** 1280 × 800 at 1:1. A 52 px title bar (three neutral traffic-light dots, the screen name), an optional 240 px sidebar, and the content in a centred column up to 760 px wide by default (see Columns below). `pin: bottom` blocks (and the keypad) sit in a bar at the foot of the content area.
- **Tabs** render as a sidebar source list; the screen whose name matches a tab is the selected row.
- **`Chrome:`** takes `sidebar | toolbar | none`. `tabbar` reads as `sidebar` and `topbar` as `toolbar` (no warning). Default: `sidebar` when the product has Tabs, otherwise `toolbar`. `toolbar` adds search and more buttons to the title bar; `none` is the title bar alone. An unknown value warns and uses the default.
- **Columns (optional):** a block's `column:` key (`side | main | inspector`; `sidebar` reads as `side`, `content` as `main`) puts it in a sidebar, the main column or an inspector. A window uses columns only when at least one block says `side` or `inspector`; otherwise it is drawn exactly as above. Widths: sidebar 240, main flexible (the centred column), inspector 360. The side column shares the sidebar with the Tabs nav (nav on top, side blocks below it); without Tabs it holds only the side blocks. The inspector is the kit's side-sheet material docked to the right edge at full height, in the style's own fill, edge and shadow. Each column lists its blocks in rank order. `pin: bottom` blocks and the keypad always stay in the bar under the main column (the bar stops at the inspector); `column:` on them warns and is ignored. An unknown value warns and uses `main`. iPhone sheets ignore `column:` (it warns) and draw the single column.

  ```markdown
  Platform: mac
  1. card: Pi | meta: Givenchy · Full bottle
  2. chord: | items: aromatic = 100 = #5e9c76; vanilla = 85 = #f2e3b3 | labels: none | orient: vertical | column: side
  3. chord: Top | items: Rosemary = 1 = #5e9c76; Mandarin = 1 = #f4d23c | labels: below | column: inspector
  4. action: Save | pin: bottom
  ```
- **Taller content** than 800 px is drawn in full, with the fold line at 800 and the veil over what sits below it, like the phone comps.
- The Product tab shows windows scaled down to fit, light and dark stacked. The signature includes the platform when it is `mac`, so switching platform makes approvals stale; iPhone signatures are unchanged. A sheet that uses neither `chord` nor `column:` parses to the same data as before this revision, so its signatures and approvals hold.
- Comp sizes: iPhone 390 × 844, Mac 1280 × 800 (taller when the content runs past the fold). `comps/<id>-<mode>.png` is that size at 2×.

## 1:1 export (for a headless page)

`ProductScreens.exportInto(host, state, screenId, mode)` draws exactly one comp at 1:1 (no scaling, no device frame) into the element `host` and returns `{ width, height }`: 390 × 844 or taller for iPhone, 1280 × 800 or taller for Mac. `mode` is `'light'` or `'dark'`. It needs only `state` (with `state.product` and the look set) and the loaded scripts; the Product tab need not be open. It throws if the screen id does not exist. The fold line and veil appear only when the content runs past the fold. Webfonts still loading can change line breaks: after `await document.fonts.ready`, call it again and use the new size. Screenshot `host` (or `host.querySelector('.ps-screen')`) at its returned size. `ProductScreens.compPng` uses the same drawing at 2× without the fold line.

## State and approval

- `state.product`: the parsed product, or `null`. It is saved and loaded with the brand in `serializeState` and `applySavedSessionToState`. Older saves have no product and load as `null`.
- `state.productApprovals`: `{ [screenId]: { status: 'approved' | 'changes', note: string, sig: string, at: ISO date } }`.
- An approval counts only while its `sig` equals the current `productScreenSig`. Any change to the screen or the look makes it **stale**. Stale approvals show as "changed since approved" and need approving again.
- Loading a new sheet keeps approvals whose screen id still exists. The signature check decides whether they still count.

## Brief behaviour with a product loaded

- The App brief replaces `## Screen layouts` and `## Built screens` with `## Product screens (Guided)`. That section has:
  - one intro line: the ranking, signature placement and fold budget are what get checked, and the layout is designed for the product;
  - then one block per screen: job, primary action, chrome, content ranked 1–N in plain words, signature placement, fold budget, four states, and the comp's file name (`comps/<id>-light.png` / `-dark.png`).
  - No pixel positions.
- The brief header names the product and its purpose.
- `aibLint` adds `unapproved-screens` when any screen is pending or stale. The Brief view treats that code as blocking: Copy and Download are disabled, with the message "Approve every product screen first (N of M approved)". Every other lint code still only asks for confirmation.
- "Save brief + files" adds `comps/<id>-light.png` and `comps/<id>-dark.png` for each screen. They are rendered from the product screens view with html2canvas (`vendor/html2canvas.min.js`) at 390×844 and 2× scale.
- With no product loaded, every brief is exactly what it is today.
