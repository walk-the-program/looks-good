# Acme|Co — brand brief for AI builders

**Use only the colors, fonts and rules below. Do not introduce new colors, tints, gradients or fonts unless listed here.**

Every color value in this brief is final. If a design needs a color that is not listed, use the nearest listed token instead of inventing one.

## Brand

- Name: Acme|Co
- Tagline: Build good things.

## Aesthetic: Raw Brutalist

- Descriptor: Exposed · Severe · Honest
- Influences: Swiss print / Brutalist web / Terminal
- Summary: Hard edges, thick borders and plain mechanics, with nothing hidden or softened.
- Motto: Nothing hidden. Nothing soft.
- Mode: light (canvas is the light neutral, ink is the dark neutral)

## Color tokens

Define these as CSS custom properties and reference them by name. Hexes are exact; do not adjust them.

| Token | Hex | Role | Job |
| --- | --- | --- | --- |
| `--primary` | #2f5bd8 | Primary | Main action |
| `--secondary` | #8fb3e8 | Secondary | Support |
| `--accent` | #f2a33a | Accent | One spark |
| `--neutral-dark` | #14171f | Derived | Brand neutral (dark). Becomes the canvas in dark mode, the ink in light mode |
| `--neutral-light` | #f7f8fb | Derived | Brand neutral (light). Becomes the canvas in light mode, the ink in dark mode |
| `--canvas` | #f7f8fb | Canvas | Background |
| `--ink` | #14171f | Ink | Text & icons |
| `--muted` | #6f7177 | Derived | Secondary text, captions, placeholders, disabled labels |
| `--line` | #d5d6da | Derived | Hairlines, dividers, resting input borders |
| `--on-primary` | #ffffff | Derived | Text and icons on a primary fill only |
| `--on-secondary` | #141414 | Derived | Text and icons on a secondary fill only |
| `--on-accent` | #141414 | Derived | Text and icons on an accent fill only |
| `--accent-ink` | #ce7b0e | Derived | The accent as text: same hue, shaded (light canvas) or tinted (dark canvas) just enough to reach 3:1 on the canvas. Set the highlight word in it, never plain accent |
| `--pri-tint` | #dfe5f7 | Derived | Quiet primary wash: selected state background, hover on primary-linked items |
| `--sec-tint` | #e6edf8 | Derived | Quiet secondary wash: selected row, tonal fills, hover on secondary items |

Canvas is derived from Neutral light. Use `--canvas`, not the raw neutral, for page and panel backgrounds.

## Where each color goes

### Canvas (#f7f8fb): Background

- Use for: Page and panel backgrounds, same-material controls
- Never for: Text
- Coverage: 60–70%

### Ink (#14171f): Text & icons

- Use for: Headlines, body text, icons, hairlines (as a tint)
- Never for: Large background fields in light mode
- Coverage: 15–20%

### Primary (#2f5bd8): Main action

- Use for: The one flat CTA block per view and the "on" state of toggles
- Never for: Body text, decoration, a second CTA
- Coverage: ≈10%

### Secondary (#8fb3e8): Support

- Use for: Tag strips and the status cells of tables
- Never for: The main CTA, body text, page background
- Coverage: ≈10–15%

### Accent (#f2a33a): One spark

- Use for: A highlighter band behind one headline word (background only, ink text on it)
- Never for: Colored text, buttons, borders, large fills
- Coverage: ≤5%

### Hard rules

1. Exactly one primary-filled action (the main call to action) per view.
2. Secondary never fills the main call to action and never sets body text.
3. Accent covers ≤5% of any view and is never used on buttons, body text or borders.
4. Text is set only in `--ink`, `--muted` or the matching `--on-*` token on its fill. The one exception is the single accent highlight word, and only where the highlight treatment below says so.
5. Color budget per view: canvas 60–70%, ink 15–20%, primary ≈10%, secondary ≈10–15%, accent ≤5%. Stay inside it.
6. No other colors, tints or gradients. Hover and pressed states use only the tokens above (for example `--pri-tint`, `--sec-tint`) or the shadows and overlays listed under Materials.
7. Focus ring is always `--primary`.
8. In this aesthetic the highlight word is a highlighter band: background `#f2a33a` (`--accent`) behind the word, text in `#141414` (`--on-accent`). Never set accent-colored text.

## Component color map

Which token goes where. Shadows, blur and borders beyond these tokens come from Materials.

| Element | Background | Text | Border / edge |
| --- | --- | --- | --- |
| Page | --canvas | --ink | none |
| Card / panel | --canvas | --ink | --ink |
| Primary button (one per view) | --primary | --on-primary | --ink |
| Secondary button | transparent (hover: --sec-tint) | --ink | --secondary |
| Ghost / tertiary link | none | --ink (underlined) | none |
| Input field, rest | --canvas | --ink (placeholder: --muted) | --ink |
| Input field, focus | --canvas | --ink | --primary (plus a 3px ring of --primary at 40% opacity) |
| Segmented control, selected | --ink | --canvas | none |
| Segmented control, unselected | transparent | --muted | none |
| Toggle, on | track --primary, knob --on-primary | --ink (label) | none |
| Toggle, off | track --line, knob --muted | --ink (label) | none |
| Tag / chip | --secondary | --on-secondary | none |
| Badge ("New", notification) | --accent | --on-accent | none |
| Headline highlight word (one per view) | --accent (band behind the word) | --on-accent | none |
| Divider / hairline | --line | n/a | n/a |
| List row, selected | --sec-tint | --ink | left edge 2px --primary |
| List row, resting | transparent | --ink (meta: --muted) | bottom 1px --line |
| Progress / data bar | track --line | n/a | fill --primary (second series: --secondary) |
| Focus ring (any control) | n/a | n/a | --primary |

## Contrast pairs

| Pair | Foreground | Background | Ratio | Grade | Use |
| --- | --- | --- | --- | --- | --- |
| --ink on --canvas | #14171f | #f7f8fb | 16.87:1 | AAA | Body and headlines |
| --muted on --canvas | #6f7177 | #f7f8fb | 4.59:1 | AA | Captions and secondary text |
| --on-primary on --primary | #ffffff | #2f5bd8 | 5.82:1 | AA | Primary button label |
| --on-secondary on --secondary | #141414 | #8fb3e8 | 8.58:1 | AAA | Chip and tag label |
| --on-accent on --accent | #141414 | #f2a33a | 8.84:1 | AAA | Badge label, highlight band |
| --accent-ink on --canvas | #ce7b0e | #f7f8fb | 3.06:1 | AA large text only | Highlight word and accent text (the accent shaded to 3:1) |
| --accent on --canvas | #f2a33a | #f7f8fb | 1.96:1 | FAIL | Do not use as text; graphic fills only |
| --primary on --canvas | #2f5bd8 | #f7f8fb | 5.48:1 | AA | Focus ring, graphics, large elements |

AAA is 7:1, AA is 4.5:1 for body text, "AA large text only" is 3:1 for text of 24px or 19px bold and up.

## Typography

- Heading font: Playfair Display (serif); CSS: `"Playfair Display", Georgia, serif`
- Body font: Source Serif 4 (serif); CSS: `"Source Serif 4", Georgia, serif`
- Google Fonts: https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Source+Serif+4:wght@400;600&display=swap
- Headings: 44px, weight 700, letter-spacing 0px, text-transform none
- Body: 16px, weight 400, letter-spacing 0px, text-transform none
- Interface text (tabs, buttons, field values, list cells): System monospace. The Source Serif 4 body face is for reading copy only.
- Small labels and captions: System monospace.
- Shape: Minimal & Sharp, radius 4px, large radius 6px

## Materials (Hard surfaces)

Surface recipes for this aesthetic with real values filled in. Apply them as written.

- **Hard surface**: background: #f7f8fb; border: 2px solid #14171f; border-radius: 0; box-shadow: 6px 6px 0 #14171f;
- **Pressed state**: transform: translate(6px, 6px); box-shadow: none;
- **Primary action block**: background: #2f5bd8; color: #ffffff; border: 2px solid #14171f; border-radius: 0; box-shadow: 6px 6px 0 #14171f; font: 600 13px ui-monospace, "SF Mono", Menlo, monospace; text-transform: uppercase; /* hover: translate(-2px, -2px) with 8px 8px 0 #14171f; pressed: translate(6px, 6px) with no shadow */
- **Palette strips**: one full-width row, border: 2px solid #14171f; each color is a flat band sized by its coverage, the label inside it; strips are separated by 2px #14171f rules.
- **Selected segment**: background: #14171f; color: #f7f8fb; /* joined boxes share 2px #14171f borders */
- **Field**: background: #f7f8fb; border: 2px solid #14171f; border-radius: 0; font: 15px ui-monospace, "SF Mono", Menlo, monospace; caret-color: #14171f;
- **Highlighter band**: background: #f2a33a; color: #141414; padding: 0 .06em; /* behind one headline word, never colored text; may run off the board edge */

## Do

- Use zero radius and 2px ink borders on every control and panel.
- Cast a hard offset shadow (6px 6px 0 ink) for raised things, and remove it entirely when pressed.
- Set every label, tab, button and table cell in monospace, uppercase, numbered like [01], with plain arrows.
- Keep the page monochrome: color appears only where a color role says so.

## Don't

- Round any corner, blur any shadow or add a gradient.
- Set the accent as text color; it is only ever the highlighter band behind a word.
- Soften the headline: it stays enormous, uppercase and tight, and may be cropped by the board edge.
- Spend primary on anything but the single main action and active states.

## CSS variables

```css
:root {
  --primary: #2f5bd8;
  --secondary: #8fb3e8;
  --accent: #f2a33a;
  --neutral-dark: #14171f;
  --neutral-light: #f7f8fb;
  --on-primary: #ffffff;
  --on-accent: #141414;
  --font-heading: "Playfair Display", Georgia, serif;
  --font-body: "Source Serif 4", Georgia, serif;
  --heading-size: 44px;
  --body-size: 16px;
  --heading-weight: 700;
  --body-weight: 400;
  --heading-tracking: 0px;
  --body-tracking: 0px;
  --heading-transform: none;
  --body-transform: none;
  --radius: 4px;
  --radius-lg: 6px;
}

/* Derived tokens for the light-mode Raw Brutalist aesthetic. Computed, do not edit. */
:root {
  --canvas: #f7f8fb;
  --ink: #14171f;
  --muted: #6f7177;
  --line: #d5d6da;
  --on-secondary: #141414;
  --accent-ink: #ce7b0e;
  --pri-tint: #dfe5f7;
  --sec-tint: #e6edf8;
}

/* Raw Brutalist material variables, referenced by the Materials above. */
:root {
  --ab-grid: rgba(20,23,31,0.06);
}
```
