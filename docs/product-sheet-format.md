# Product sheet format (Phase 2 contract, rev 2)

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
| `list` | Group label | `rows` (`;`-separated; `—` splits title — value — detail) | List group with rows |
| `stats` | Group label | `items` (`;`-separated `Label = Value`) | Stat row / tiles |
| `chart` | Caption | `points` (comma numbers) | Sparkline in the style's chart colour |
| `segmented` | Group label | `options` (`;`), `selected` | Segmented control |
| `toggle` | Row label | `on: yes/no`, `meta` | Toggle row |
| `field` | Field label | `value`, `placeholder` | Input field |
| `keypad` | (empty) | `keys` (default `1 2 3 4 5 6 7 8 9 . 0 ⌫`); always pinned to the bottom | Number keypad grid from kit keys/buttons |
| `tiles` | Caption | `values` (comma; 0–1 each) | Tile strip in tonal steps |

## Data model (what the parser returns)

```js
parseProductSheet(text, sourceName) → {
  product: {
    name, purpose, coreAction, tabs: ['Home', …],
    screens: [{
      id: 'home',            // slug of name, unique
      name: 'Home', job, primary: 'Start sprint' | null,
      chrome: 'tabbar' | 'topbar' | 'none', fold: string | null, signature: string | null,
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
